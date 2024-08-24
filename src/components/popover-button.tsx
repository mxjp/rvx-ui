import { ClassValue, Expression, get, map, render, StyleValue, uniqueId } from "@mxjp/gluon";

import { Button, ButtonType, ButtonVariant } from "./button.js";
import { PopoutAlignment, PopoutPlacement } from "./popout.js";
import { createPopover, PopoverContent, PopoverRole } from "./popover.js";

export function PopoverButton(props: {
	/**
	 * The button type.
	 *
	 * @default "button"
	 */
	type?: Expression<ButtonType | undefined>;

	/**
	 * The button theme variant.
	 *
	 * @default "default"
	 */
	variant?: Expression<ButtonVariant | undefined>;

	/**
	 * Set when the button is disabled.
	 *
	 * The button is automatically disabled when there are any pending tasks.
	 */
	disabled?: Expression<boolean | undefined>;

	/** Class for the button. */
	class?: ClassValue;

	/** Style for the button. */
	style?: StyleValue;

	/**
	 * The button id.
	 *
	 * By default, a unique id is generated and linked to the attached popover.
	 */
	id?: Expression<string | undefined>;

	autofocus?: Expression<boolean | undefined>;

	/** The button content. */
	label: unknown;

	/** The popover content component. */
	children: PopoverContent;

	/**
	 * Defines the direction in which the popover is placed in relation to the button.
	 *
	 * This expression is only evaluated when calculating the popover placement.
	 *
	 * See {@link PopoutPlacement}
	 */
	placement?: Expression<PopoutPlacement | undefined>;

	/**
	 * Defines which side of the button and popover are aligned orthogonally to the placement axis.
	 *
	 * This expression is only evaluated when calculating the popover placement.
	 *
	 * See {@link PopoutAlignment}
	 */
	alignment?: Expression<PopoutAlignment | undefined>;

	/**
	 * An array of event names that cause the popover to hide automatically when dispatched outside of the current layer stack or the button.
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

	/** Class for the popover content. */
	popoverClass?: ClassValue;

	/** Style for the popover content. */
	popoverStyle?: StyleValue;

	/**
	 * The button and popover label.
	 *
	 * By default, the button itself is used a label for the popover.
	 */
	"aria-label"?: Expression<string | undefined>;

	/**
	 * The button and popover label id.
	 *
	 * By default, the button itself is used a label for the popover.
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

	const anchor = render(<Button
		type={props.type}
		variant={props.variant}
		disabled={props.disabled}
		class={props.class}
		style={props.style}
		id={id}
		autofocus={props.autofocus}
		aria-label={props["aria-label"]}
		aria-labelledby={props["aria-labelledby"]}
		action={event => {
			popover.toggle(anchor, event);
		}}
	>
		{props.label}
	</Button>);

	const popover = createPopover({
		content: props.children,
		placement: props.placement,
		alignment: props.alignment,
		foreignEvents: props.foreignEvents,
		role: props.role,
		class: props.popoverClass,
		style: props.popoverStyle,

		"aria-label": props["aria-label"],
		"aria-labelledby": () => (get(props["aria-label"]) === undefined
			? (get(props["aria-labelledby"]) ?? get(id))
			: undefined),
		"aria-describedby": props["aria-describedby"],
	});

	return anchor;
}
