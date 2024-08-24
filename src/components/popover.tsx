import { ClassValue, Expression, extract, Inject, map, sig, StyleValue, SVG, watch, XMLNS } from "@mxjp/gluon";

import { THEME } from "../common/theme.js";
import { DOWN, LEFT, RIGHT, ScriptDirection, UP, WritingMode } from "../common/writing-mode.js";
import { DialogRole } from "./dialog.js";
import { LAYER } from "./layer.js";
import { Popout, PopoutAlignment, PopoutPlacement } from "./popout.js";

export type PopoverRole = DialogRole | "menu";

export interface PopoverContent {
	(props: {
		popout: Popout;
	}): unknown;
}

export function createPopover(props: {
	placement?: Expression<PopoutPlacement | undefined>;
	alignment?: Expression<PopoutAlignment | undefined>;
	content: PopoverContent;
	foreignEvents?: string[];
	writingMode?: Expression<WritingMode | undefined>;
	scriptDir?: Expression<ScriptDirection | undefined>;

	role?: PopoverRole;
	class?: ClassValue;
	style?: StyleValue;

	"aria-label"?: Expression<string | undefined>;
	"aria-labelledby"?: Expression<string | undefined>;
	"aria-describedby"?: Expression<string | undefined>;
}): Popout {
	return new Popout({
		placement: map(props.placement, v => v ?? "block"),
		alignment: map(props.alignment, v => v ?? "center"),
		content: ({ popout, onPlacement, placement }) => {
			const theme = extract(THEME);
			const spikeTransform = sig("");

			extract(LAYER)?.useHotkey("escape", () => {
				popout.hide();
			});

			onPlacement(args => {
				const gap = Math.abs(spikeInset.getBoundingClientRect().x - root.getBoundingClientRect().x);
				args.gap = gap;
			});

			queueMicrotask(() => {
				root.focus();
			});

			watch(placement, placement => {
				if (placement) {
					const { anchorRect, dir } = placement;
					const contentRect = placement.content.getBoundingClientRect();
					switch (dir) {
						case DOWN: {
							const anchorCenter = anchorRect.x + (anchorRect.width / 2);
							const anchorCenterOffset = anchorCenter - contentRect.x;
							spikeTransform.value = `translate(${anchorCenterOffset}px, 0px)`;
							break;
						}
						case UP: {
							const anchorCenter = anchorRect.x + (anchorRect.width / 2);
							const anchorCenterOffset = anchorCenter - contentRect.x;
							spikeTransform.value = `translate(${anchorCenterOffset}px, ${contentRect.height}px) rotate(180deg)`;
							break;
						}
						case RIGHT: {
							const anchorCenter = anchorRect.y + (anchorRect.height / 2);
							const anchorCenterOffset = anchorCenter - contentRect.y;
							spikeTransform.value = `translate(0px, ${anchorCenterOffset}px) rotate(270deg)`;
							break;
						}
						case LEFT: {
							const anchorCenter = anchorRect.y + (anchorRect.height / 2);
							const anchorCenterOffset = anchorCenter - contentRect.y;
							spikeTransform.value = `translate(${contentRect.width}px, ${anchorCenterOffset}px) rotate(90deg)`;
							break;
						}
					}
				}
			});

			const spikeInset = <div class={theme?.popover_spike_area}>
				<div class={theme?.popover_spike} style={{ transform: spikeTransform }}>
					<Inject key={XMLNS} value={SVG}>
						{() => {
							return <svg viewBox="0 0 16 16" preserveAspectRatio="none">
								<path d="M0,16 L8,0 L16,16 Z" />
							</svg>;
						}}
					</Inject>
				</div>
			</div> as HTMLElement;

			const root = <div
				tabindex="-1"
				role={map(props.role, v => v ?? "dialog")}
				class={[
					theme?.popover,
					props.class,
				]}
				style={props.style}
				aria-label={props["aria-label"]}
				aria-labelledby={props["aria-labelledby"]}
				aria-describedby={props["aria-describedby"]}
			>
				{spikeInset}
				<div class={[
					theme?.column,
					theme?.column_content,
					theme?.popover_content,
				]}>
					{props.content({ popout })}
				</div>
			</div> as HTMLElement;

			return root;
		},
		foreignEvents: props.foreignEvents,
		writingMode: props.writingMode,
		scriptDir: props.scriptDir,
	});
}
