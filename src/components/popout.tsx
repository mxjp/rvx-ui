import { captureSelf, Expression, extract, get, getContext, ReadonlyContext, render, runInContext, sig, teardown, TeardownHook, untrack, View, viewNodes } from "@mxjp/gluon";

import { Direction, flip, getBlockStart, getInlineStart, getSize, getWindowRectInset, getWindowSize, getWindowSpaceAround, INSET, ScriptDirection, WritingMode } from "../common/writing-mode.js";
import { LAYER, Layer } from "./layer.js";

export type PopoutPlacement = "block" | "block-start" | "block-end" | "inline" | "inline-start" | "inline-end";
export type PopoutAlignment = "center" | "start" | "end";

export interface PopoutContent {
	(props: {}): unknown;
}

export interface PopoutOptions {
	placement: Expression<PopoutPlacement>;
	alignment: Expression<PopoutAlignment>;
	content: PopoutContent;
	foreignEvents?: string[];
	writingMode?: Expression<WritingMode | undefined>;
	scriptDir?: Expression<ScriptDirection | undefined>;
}

interface InstanceArgs {
	anchor: View;
	pointerEvent: Event | undefined;
	contentBlockSize: number;
	contentInlineSize: number;
}

interface Instance {
	dispose: TeardownHook;
	view: View;
	content: HTMLElement;
	observer: ResizeObserver;
}

export class Popout {
	#context: ReadonlyContext | undefined;
	#placement: Expression<PopoutPlacement>;
	#alignment: Expression<PopoutAlignment>;
	#content: PopoutContent;
	#foreignEvents: string[];
	#writingMode?: Expression<WritingMode | undefined>;
	#scriptDir?: Expression<ScriptDirection | undefined>;
	#instance?: Instance;
	#instanceArgs?: InstanceArgs;
	#visible = sig(false);

	constructor(options: PopoutOptions) {
		this.#context = getContext();
		this.#placement = options.placement;
		this.#alignment = options.alignment;
		this.#content = options.content;
		this.#foreignEvents = options.foreignEvents ?? ["resize", "scroll", "mousedown", "touchstart", "focusin"];
		this.#writingMode = options.writingMode;
		this.#scriptDir = options.scriptDir;

		teardown(() => {
			this.hide();
		});
	}

	get visible(): boolean {
		return this.#visible.value;
	}

	show(anchor: View, pointerEvent?: Event): void {
		this.#instanceArgs = undefined;

		// Get an object with the pointer posiiton:
		let pointer: { clientX: number; clientY: number } | undefined;
		if (globalThis.MouseEvent && pointerEvent instanceof MouseEvent) {
			pointer = pointerEvent;
		} else if (globalThis.TouchEvent && pointerEvent instanceof TouchEvent) {
			pointer = pointerEvent.touches.item(0) ?? undefined;
		}

		// Find the preferred anchor rect & it's writing mode / script direction:
		let anchorRect: DOMRect | undefined;
		let writingMode = untrack(() => get(this.#writingMode))!;
		let scriptDir = untrack(() => get(this.#scriptDir))!;
		if (pointer !== undefined) {
			const { clientX, clientY } = pointer;
			nodes: for (const node of viewNodes(anchor)) {
				if (node instanceof Element) {
					for (const rect of node.getClientRects()) {
						if (clientX >= rect.left && clientX <= rect.right && clientY >= rect.top && clientY <= rect.bottom) {
							const styles = getComputedStyle(node);
							writingMode ??= styles.writingMode as WritingMode;
							scriptDir ??= styles.direction as ScriptDirection;
							anchorRect = rect;
							break nodes;
						}
					}
				}
			}
		}
		if (anchorRect === undefined) {
			for (const node of viewNodes(anchor)) {
				if (node instanceof Element) {
					anchorRect = node.getBoundingClientRect();
					const styles = getComputedStyle(node);
					writingMode ??= styles.writingMode as WritingMode;
					scriptDir ??= styles.direction as ScriptDirection;
					break;
				}
			}
			if (anchorRect === undefined) {
				throw new Error("anchor must contain at least one element.");
			}
		}

		// Ensure that there is a popout content instance:
		let instance = this.#instance;
		if (instance === undefined) {
			runInContext(this.#context, () => {
				captureSelf(dispose => {
					let content!: HTMLElement;
					const view = render(<Layer>
						{() => {
							const layer = extract(LAYER)!;
							const onForeignEvent = (event: Event): void => {
								if (event.target instanceof Node) {
									if (layer.stackContains(event.target)) {
										return;
									}
									const args = this.#instanceArgs;
									if (args !== undefined) {
										for (const node of viewNodes(args.anchor)) {
											if (node === event.target || node.contains(event.target)) {
												return;
											}
										}
									}
								}
								this.hide();
							};

							this.#foreignEvents.forEach(t => window.addEventListener(t, onForeignEvent, { passive: true }));
							teardown(() => {
								this.#foreignEvents.forEach(t => window.removeEventListener(t, onForeignEvent));
							});

							content = <div style={{
								"position": "fixed",
								"writing-mode": writingMode,
							}} dir={scriptDir}>
								{this.#content({})}
							</div> as HTMLElement;
							return content;
						}}
					</Layer>);
					document.body.appendChild(view.take());

					const observer = new ResizeObserver(entries => {
						const args = this.#instanceArgs;
						const size = entries[entries.length - 1]?.borderBoxSize[0];
						if (args !== undefined && size !== undefined && (size.blockSize !== args.contentBlockSize || size.inlineSize !== args.contentInlineSize)) {
							this.show(args.anchor, args.pointerEvent);
						}
					});
					observer.observe(content, { box: "border-box" });

					instance = this.#instance = { dispose, content, view, observer };
				});
			});
		}

		const { content } = instance!;
		const inlineStart = getInlineStart(writingMode, scriptDir);
		const blockStart = getBlockStart(writingMode);

		// Reset content styles for measuring it's intrinsic size:
		content.style.setProperty("--popout-anchor-inline-size", `${anchorRect.width}px`);
		content.style.left = "0px";
		content.style.top = "0px";
		content.style.right = "";
		content.style.bottom = "";
		switch (this.#placement) {
			case "block":
			case "block-start":
			case "block-end":
				content.style.maxInlineSize = `${getWindowSize(inlineStart)}px`;
				content.style.maxBlockSize = `${Math.max(
					getWindowSpaceAround(anchorRect, blockStart),
					getWindowSpaceAround(anchorRect, flip(blockStart)),
				)}px`;
				break;

			case "inline":
			case "inline-start":
			case "inline-end":
				content.style.maxBlockSize = `${getWindowSize(blockStart)}px`;
				content.style.maxInlineSize = `${Math.max(
					getWindowSpaceAround(anchorRect, inlineStart),
					getWindowSpaceAround(anchorRect, flip(inlineStart)),
				)}px`;
				break;
		}

		// Measure intrinsic content size & compute the final placement direction:
		const contentRect = content.getBoundingClientRect();
		const place = this.#placement;
		let placement: Direction;
		let alignStart: Direction;
		if (place === "inline" || place === "block") {
			const start = place === "inline" ? inlineStart : blockStart;
			const startSpace = getWindowSpaceAround(anchorRect, start);
			const endSpace = getWindowSpaceAround(anchorRect, flip(start));
			placement = startSpace > endSpace ? blockStart : flip(start);
			alignStart = place === "inline" ? blockStart : inlineStart;
		} else {
			placement = place === "block-start" ? blockStart : (
				place === "block-end" ? flip(blockStart) : (
					place === "inline-start" ? inlineStart : flip(inlineStart)
				)
			);
			alignStart = inlineStart;
			const space = getWindowSpaceAround(anchorRect, placement);
			if (getSize(contentRect, placement) > space) {
				if (getWindowSpaceAround(anchorRect, flip(placement)) > space) {
					placement = flip(placement);
				}
			}
		}

		// Apply inset along the placement direction:
		content.style[INSET[flip(placement)]] = `${getWindowRectInset(anchorRect, placement)}px`;
		content.style[INSET[placement]] = "";

		// Compute the raw alignment:
		const align = untrack(() => get(this.#alignment));
		const alignContentSize = getSize(contentRect, alignStart);
		let alignInset: number;
		let alignEnd = false;
		switch (align) {
			case "center":
				alignInset = getWindowSpaceAround(anchorRect, alignStart) + ((getSize(anchorRect, alignStart) - alignContentSize) / 2);
				break;

			case "start":
				alignInset = getWindowSpaceAround(anchorRect, alignStart);
				break;

			case "end":
				alignInset = getWindowSpaceAround(anchorRect, flip(alignStart));
				alignEnd = true;
				break;
		}

		// Adjust alignment to fit the current window size:
		const alignSpace = getWindowSize(alignStart);
		alignInset = Math.max(0, Math.min(alignInset, alignSpace - alignContentSize));

		// Apply the final alignment:
		content.style[INSET[alignStart]] = alignEnd ? "" : `${alignInset}px`;
		content.style[INSET[flip(alignStart)]] = alignEnd ? `${alignInset}px` : "";

		this.#instanceArgs = {
			anchor,
			pointerEvent,
			contentBlockSize: getSize(contentRect, blockStart),
			contentInlineSize: getSize(contentRect, inlineStart),
		};
		this.#visible.value = true;
	}

	update(): void {
		const args = this.#instanceArgs;
		if (args !== undefined) {
			this.show(args.anchor, args.pointerEvent);
		}
	}

	toggle(anchor: View, pointerEvent?: Event): void {
		if (this.visible) {
			this.hide();
		} else {
			this.show(anchor, pointerEvent);
		}
	}

	hide(): void {
		const instance = this.#instance;
		if (instance !== undefined) {
			this.#instanceArgs = undefined;
			this.#instance = undefined;
			instance.observer.disconnect();
			instance.dispose();
			instance.view.detach();
			this.#visible.value = false;
		}
	}
}