import { ClassValue, Expression, extract, get, Inject, map, render, sig, StyleValue, SVG, uniqueId, watch, XMLNS } from "@mxjp/gluon";

import { Action } from "../common/events.js";
import { THEME } from "../common/theme.js";
import { DOWN, getSize, getXY, LEFT, RIGHT, UP } from "../common/writing-mode.js";
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
	 * @default ["resize", "scroll", "mousedown", "touchstart", "focusin", "gluon-ux:delayed-hover"]
	 */
	foreignEvents?: string[];

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
		content: ({ popout, onPlacement, placement, setSizeReference }) => {
			const theme = extract(THEME);
			const spikeTransform = sig("");

			const layer = extract(LAYER);
			layer?.useHotkey("escape", () => {
				popout.hide();
			});

			onPlacement(args => {
				args.gap = Math.abs(spikeArea.getBoundingClientRect().x - root.getBoundingClientRect().x);
			});

			watch(placement, placement => {
				if (placement) {
					const { anchorRect, placementDir, alignStart } = placement;
					const contentRect = placement.content.getBoundingClientRect();
					const rawOffset = getXY(anchorRect, alignStart) + (getSize(anchorRect, alignStart) / 2) - getXY(contentRect, alignStart);
					const offset = `max(var(--popover-spike-min-offset), min(${rawOffset}px, ${getSize(contentRect, alignStart)}px - var(--popover-spike-min-offset)))`;
					switch (placementDir) {
						case DOWN:
							spikeTransform.value = `translate(${offset}, 0px)`;
							break;
						case UP:
							spikeTransform.value = `translate(${offset}, ${contentRect.height}px) rotate(180deg)`;
							break;
						case RIGHT:
							spikeTransform.value = `translate(0px, ${offset}) rotate(270deg)`;
							break;
						case LEFT:
							spikeTransform.value = `translate(${contentRect.width}px, ${offset}) rotate(90deg)`;
							break;
					}
				}
			});

			const spikeArea = <div class={theme?.popover_spike_area}>
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

			const content = <div class={[
				theme?.column,
				theme?.column_content,
				theme?.popover_content,
			]}>
				{props.content({ popout })}
			</div> as HTMLElement;
			setSizeReference(content);

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
				{spikeArea}
				<div class={theme?.popover_scroll_area}>
					{content}
				</div>
			</div> as HTMLElement;
			layer?.useAutoFocusFallback(root);
			return root;
		},
		foreignEvents: props.foreignEvents,
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
	 * @default ["resize", "scroll", "mousedown", "touchstart", "focusin", "gluon-ux:delayed-hover"]
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
