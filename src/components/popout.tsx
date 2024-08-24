import { captureSelf, Emitter, Event as GluonEvent, Expression, extract, get, getContext, ReadonlyContext, render, runInContext, sig, teardown, TeardownHook, untrack, View, viewNodes } from "@mxjp/gluon";

import { axisEquals, Direction, flip, getBlockStart, getInlineStart, getSize, getWindowRectInset, getWindowSize, getWindowSpaceAround, INSET, ScriptDirection, WritingMode } from "../common/writing-mode.js";
import { LAYER, Layer } from "./layer.js";

/**
 * Defines the direction in which the popout is placed in relation to it's anchor.
 *
 * + `"block"` coresponds to the block flow direction.
 * + `"inline"` coresponds to the inline flow direction.
 * + If `"-start"` or `"-end"` is present, that direction is used unless there isn't enough space for the current content and the opposite side has more available space.
 */
export type PopoutPlacement = "block" | "block-start" | "block-end" | "inline" | "inline-start" | "inline-end";

/**
 * Defines which side of the anchor and content are aligned orthogonally to the placement axis.
 */
export type PopoutAlignment = "center" | "start" | "end";

export interface PopoutPlacementArgs {
	/**
	 * When set during the `onPlacement` event, this defines the gap between the anchor and the content in `px`.
	 *
	 * @default 0
	 */
	gap: number;
}

export interface PopoutPlacementInfo {
	/**
	 * The rect of the anchor at the time of placement.
	 */
	anchorRect: DOMRect;

	/**
	 * The content root element.
	 */
	content: HTMLElement;

	/**
	 * The effective placement direction.
	 */
	dir: Direction;

	/**
	 * The block start or inline start direction orthogonal to the effective placement axis.
	 */
	alignStart: Direction;
}

export interface PopoutContent {
	(props: {
		/**
		 * The popout itself.
		 */
		popout: Popout;

		/**
		 * Called after the popout content is attached to the document, but before calculating the placement.
		 */
		onPlacement: GluonEvent<[event: PopoutPlacementArgs]>;

		/**
		 * Reactively get information on the effective placement.
		 */
		placement: () => PopoutPlacementInfo | undefined;
	}): unknown;
}

export interface PopoutOptions {
	/**
	 * Defines the direction in which the popout is placed in relation to it's anchor.
	 *
	 * See {@link PopoutPlacement}
	 */
	placement: Expression<PopoutPlacement>;

	/**
	 * Defines which side of the anchor and content are aligned orthogonally to the placement axis.
	 *
	 * See {@link PopoutAlignment}
	 */
	alignment: Expression<PopoutAlignment>;

	/**
	 * The content component to render while the popout is visible.
	 */
	content: PopoutContent;

	/**
	 * An array of event names that cause the popout to hide automatically when dispatched outside of the current layer stack or the latest anchor.
	 *
	 * @default ["resize", "scroll", "mousedown", "touchstart", "focusin"]
	 */
	foreignEvents?: string[];

	/**
	 * The writing mode to use for calculating the placement and to apply to the content.
	 *
	 * By default, the latest anchor's writing mode is inherited.
	 */
	writingMode?: Expression<WritingMode | undefined>;

	/**
	 * The script direction to use for calculating the placement and to apply to the content.
	 *
	 * By default, the latest anchor's script direction is inherited.
	 */
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

/**
 * Utility to create automatically placed floating content like popovers or dropdowns.
 */
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
	#onPlacement = new Emitter<[PopoutPlacementArgs]>();
	#placementState = sig<PopoutPlacementInfo | undefined>(undefined);

	/**
	 * Create a new popout.
	 *
	 * The popout hides automatically when the current context is disposed.
	 */
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

	/**
	 * Reactively check if the popout is currently visible.
	 */
	get visible(): boolean {
		return this.#visible.value;
	}

	/**
	 * Show the popout or recalculate placement if already visible.
	 *
	 * @param anchor The anchor view to use. This doesn't affect the view in any way.
	 * @param pointerEvent An optional event to determine which anchor rect to use if the anchor has multiple client rects like wrapping texts or just multiple distinct root nodes.
	 */
	show(anchor: View, pointerEvent?: Event): void {
		this.#instanceArgs = undefined;
		this.#placementState.value = undefined;

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
								{this.#content({
									popout: this,
									onPlacement: this.#onPlacement.event,
									placement: () => this.#placementState.value,
								})}
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

		const placementArgs: PopoutPlacementArgs = {
			gap: 0,
		};
		this.#onPlacement.emit(placementArgs);
		const { gap } = placementArgs;

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
				) - gap}px`;
				break;

			case "inline":
			case "inline-start":
			case "inline-end":
				content.style.maxBlockSize = `${getWindowSize(blockStart)}px`;
				content.style.maxInlineSize = `${Math.max(
					getWindowSpaceAround(anchorRect, inlineStart),
					getWindowSpaceAround(anchorRect, flip(inlineStart)),
				) - gap}px`;
				break;
		}

		// Measure intrinsic content size & compute the final placement direction:
		const contentRect = content.getBoundingClientRect();
		const place = this.#placement;
		let dir: Direction;
		let alignStart: Direction;
		if (place === "inline" || place === "block") {
			const start = place === "inline" ? inlineStart : blockStart;
			const startSpace = getWindowSpaceAround(anchorRect, start);
			const endSpace = getWindowSpaceAround(anchorRect, flip(start));
			dir = startSpace > endSpace ? blockStart : flip(start);
			alignStart = place === "inline" ? blockStart : inlineStart;
		} else {
			dir = place === "block-start" ? blockStart : (
				place === "block-end" ? flip(blockStart) : (
					place === "inline-start" ? inlineStart : flip(inlineStart)
				)
			);
			alignStart = axisEquals(dir, blockStart) ? inlineStart : blockStart;
			const space = getWindowSpaceAround(anchorRect, dir);
			if (getSize(contentRect, dir) > space) {
				if (getWindowSpaceAround(anchorRect, flip(dir)) > space) {
					dir = flip(dir);
				}
			}
		}

		// Apply inset along the placement direction:
		content.style[INSET[flip(dir)]] = `${getWindowRectInset(anchorRect, dir) + gap}px`;
		content.style[INSET[dir]] = "";

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

		this.#placementState.value = {
			anchorRect,
			content,
			dir,
			alignStart,
		};

		this.#visible.value = true;
	}

	/**
	 * Recalculate placement using the most recent anchor and pointer event if currently visible.
	 *
	 * Placement is recalculated automatically when the content is resized.
	 *
	 * Resizing or moving anchors don't trigger recalculation as it is expected, that content behind the popout doesn't change significantly while the popout is open.
	 */
	update(): void {
		const args = this.#instanceArgs;
		if (args !== undefined) {
			this.show(args.anchor, args.pointerEvent);
		}
	}

	/**
	 * The same as {@link show}, but the popout is hidden instead if currently visible.
	 */
	toggle(anchor: View, pointerEvent?: Event): void {
		if (this.visible) {
			this.hide();
		} else {
			this.show(anchor, pointerEvent);
		}
	}

	/**
	 * Hide the popout if currently visible.
	 */
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
