import { captureSelf, getContext, ReadonlyContext, render, runInContext, sig, teardown, TeardownHook, View, viewNodes } from "@mxjp/gluon";

import { Direction, flip, getBlockStart, getInlineStart, getSize, getWindowRectInset, getWindowSize, getWindowSpaceAround, INSET, ScriptDirection, WritingMode } from "../common/writing-mode.js";
import { Layer } from "./layer.js";

export type PopoutPlacement = "block" | "block-start" | "block-end" | "inline" | "inline-start" | "inline-end";
export type PopoutAlignment = "center" | "start" | "end";

export interface PopoutContent {
	(props: {}): unknown;
}

export interface PopoutOptions {
	placement: PopoutPlacement;
	alignment: PopoutAlignment;
	content: PopoutContent;
	writingMode?: WritingMode;
	scriptDir?: ScriptDirection;
}

interface Instance {
	dispose: TeardownHook;
	view: View;
	content: HTMLElement;
}

export class Popout {
	#context: ReadonlyContext | undefined;
	#placement: PopoutPlacement;
	#alignment: PopoutAlignment;
	#content: PopoutContent;
	#writingMode?: WritingMode;
	#scriptDir?: ScriptDirection;
	#instance?: Instance;
	#visible = sig(false);

	constructor(options: PopoutOptions) {
		this.#context = getContext();
		this.#placement = options.placement;
		this.#alignment = options.alignment;
		this.#content = options.content;
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
		let pointer: { clientX: number; clientY: number } | undefined;
		if (globalThis.MouseEvent && pointerEvent instanceof MouseEvent) {
			pointer = pointerEvent;
		} else if (globalThis.TouchEvent && pointerEvent instanceof TouchEvent) {
			pointer = pointerEvent.touches.item(0) ?? undefined;
		}

		let anchorRect: DOMRect | undefined;
		let writingMode = this.#writingMode!;
		let scriptDir = this.#scriptDir!;
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

		let instance = this.#instance;
		if (instance === undefined) {
			runInContext(this.#context, () => {
				captureSelf(dispose => {
					let content!: HTMLElement;
					const view = render(<Layer>
						{() => content = <div style={{
							"position": "fixed",
							"writing-mode": writingMode,
						}} dir={scriptDir}>
							{this.#content({})}
						</div> as HTMLElement}
					</Layer>);
					document.body.appendChild(view.take());
					instance = this.#instance = { dispose, content, view };
				});
			});
		}

		const { content } = instance!;
		const inlineStart = getInlineStart(writingMode, scriptDir);
		const blockStart = getBlockStart(writingMode);

		content.style.setProperty("--popout-anchor-inline-size", `${anchorRect.width}px`);
		content.style.left = "0px";
		content.style.top = "0px";

		switch (this.#placement) {
			case "block":
			case "block-start":
			case "block-end":
				content.style.maxInlineSize = `${getWindowSize(inlineStart)}px`;
				break;

			case "inline":
				content.style.maxInlineSize = `${Math.max(
					getWindowSpaceAround(anchorRect, inlineStart),
					getWindowSpaceAround(anchorRect, flip(inlineStart)),
				)}px`;
				break;

			case "inline-start":
				content.style.maxInlineSize = `${getWindowSpaceAround(anchorRect, inlineStart)}px`;
				break;

			case "inline-end":
				content.style.maxInlineSize = `${getWindowSpaceAround(anchorRect, flip(inlineStart))}px`;
				break;
		}

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

		content.style[INSET[flip(placement)]] = `${getWindowRectInset(anchorRect, placement)}px`;
		content.style[INSET[placement]] = "";

		const align = this.#alignment;
		const alignContentSize = getSize(contentRect, alignStart);
		let alignStartPx: number | undefined;
		let alignEndPx: number | undefined;
		switch (align) {
			case "center":
				alignStartPx = getWindowSpaceAround(anchorRect, alignStart) + ((getSize(anchorRect, alignStart) - alignContentSize) / 2);
				break;

			case "start":
				alignStartPx = getWindowSpaceAround(anchorRect, alignStart);
				break;

			case "end":
				alignEndPx = getWindowSpaceAround(anchorRect, flip(alignStart));
				break;
		}

		// // TODO: Adjust alignment to fit current window.

		content.style[INSET[alignStart]] = alignStartPx === undefined ? "" : `${alignStartPx}px`;
		content.style[INSET[flip(alignStart)]] = alignEndPx === undefined ? "" : `${alignEndPx}px`;

		// TODO: Watch content size & re-compute on change.
		// TODO: Hide on foreign events.

		this.#visible.value = true;
	}

	hide(): void {
		const instance = this.#instance;
		if (instance !== undefined) {
			this.#instance = undefined;
			instance.dispose();
			instance.view.detach();
			this.#visible.value = false;
		}
	}
}
