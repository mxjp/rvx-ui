import { ClassValue, Expression, extract, get, Inject, map, render, sig, StyleValue, SVG, uniqueId, watch, XMLNS } from "@mxjp/gluon";

import { Action } from "../common/events.js";
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
	/**
	 * Defines the direction in which the popover is placed in relation to the anchor.
	 *
	 * This expression is only evaluated when calculating the popover placement.
	 *
	 * See {@link PopoutPlacement}
	 */
	placement?: Expression<PopoutPlacement | undefined>;

	/**
	 * Defines which side of the anchor and popover are aligned orthogonally to the placement axis.
	 *
	 * This expression is only evaluated when calculating the popover placement.
	 *
	 * See {@link PopoutAlignment}
	 */
	alignment?: Expression<PopoutAlignment | undefined>;

	/**
	 * The content component.
	 */
	content: PopoverContent;

	inlineSize?: Expression<string | undefined>;
	maxInlineSize?: Expression<string | undefined>;
	blockSize?: Expression<string | undefined>;
	maxBlockSize?: Expression<string | undefined>;

	/**
	 * An array of event names that cause the popover to hide automatically when dispatched outside of the current layer stack or the anchor.
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

	/**
	 * The content role.
	 *
	 * @default "dialog"
	 */
	role?: PopoverRole;

	id?: string;
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
				id={props.id}
				class={[
					theme?.popover,
					props.class,
				]}
				style={[
					props.style,
					{
						"inline-size": props.inlineSize,
						"max-inline-size": props.maxInlineSize,
						"block-size": props.blockSize,
						"max-block-size": props.maxBlockSize,
					},
				]}
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

export interface PopoverAnchorProps {
	action: Action;
	id?: Expression<string | undefined>;
	"aria-label"?: Expression<string | undefined>;
	"aria-labelledby"?: Expression<string | undefined>;
}

export function Popover(props: {
	/**
	 * A function to immediately render the anchor.
	 */
	anchor: (props: PopoverAnchorProps) => unknown;

	/**
	 * The anchor id.
	 *
	 * By default, a unique id is generated and linked to the attached popover.
	 */
	id?: Expression<string | undefined>;

	/** Class for the popover. */
	class?: ClassValue;

	/** Style for the popover. */
	style?: StyleValue;

	/** The popover content component. */
	children: PopoverContent;

	inlineSize?: Expression<string | undefined>;
	maxInlineSize?: Expression<string | undefined>;
	blockSize?: Expression<string | undefined>;
	maxBlockSize?: Expression<string | undefined>;

	/**
	 * Defines the direction in which the popover is placed in relation to the anchor.
	 *
	 * This expression is only evaluated when calculating the popover placement.
	 *
	 * See {@link PopoutPlacement}
	 */
	placement?: Expression<PopoutPlacement | undefined>;

	/**
	 * Defines which side of the anchor and popover are aligned orthogonally to the placement axis.
	 *
	 * This expression is only evaluated when calculating the popover placement.
	 *
	 * See {@link PopoutAlignment}
	 */
	alignment?: Expression<PopoutAlignment | undefined>;

	/**
	 * An array of event names that cause the popover to hide automatically when dispatched outside of the current layer stack or the anchor.
	 *
	 * @default ["resize", "scroll", "mousedown", "touchstart", "focusin"]
	 */
	foreignEvents?: string[];

	/**
	 * The popover role.
	 *
	 * @default "dialog"
	 */
	role?: PopoverRole;

	/**
	 * The anchor and popover label.
	 *
	 * By default, the anchor itself is used a label for the popover.
	 */
	"aria-label"?: Expression<string | undefined>;

	/**
	 * The anchor and popover label id.
	 *
	 * By default, the anchor itself is used a label for the popover.
	 */
	"aria-labelledby"?: Expression<string | undefined>;

	/**
	 * An optional popover description id.
	 *
	 * If the popover contains a description, this should be set to it's id.
	 */
	"aria-describedby"?: Expression<string | undefined>;
}): unknown {
	const defaultId = uniqueId();
	const id = map(props.id, v => v ?? defaultId);

	const anchor = render(props.anchor({
		action: event => {
			popover.toggle(anchor, event);
		},
		id,
		"aria-label": props["aria-label"],
		"aria-labelledby": props["aria-labelledby"],
	}));

	const popover = createPopover({
		content: props.children,
		inlineSize: props.inlineSize,
		maxInlineSize: props.maxInlineSize,
		blockSize: props.blockSize,
		maxBlockSize: props.maxBlockSize,
		placement: props.placement,
		alignment: props.alignment,
		foreignEvents: props.foreignEvents,
		role: props.role,
		class: props.class,
		style: props.style,

		"aria-label": props["aria-label"],
		"aria-labelledby": () => (get(props["aria-label"]) === undefined
			? (get(props["aria-labelledby"]) ?? get(id))
			: undefined),
		"aria-describedby": props["aria-describedby"],
	});

	return anchor;
}
