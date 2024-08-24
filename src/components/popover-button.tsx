import { ClassValue, Expression, get, map, render, StyleValue, uniqueId } from "@mxjp/gluon";

import { Button, ButtonType, ButtonVariant } from "./button.js";
import { PopoutAlignment, PopoutPlacement } from "./popout.js";
import { createPopover, PopoverContent, PopoverRole } from "./popover.js";

export function PopoverButton(props: {
	type?: Expression<ButtonType | undefined>;
	variant?: Expression<ButtonVariant | undefined>;
	disabled?: Expression<boolean | undefined>;
	class?: ClassValue;
	style?: StyleValue;
	id?: Expression<string | undefined>;
	autofocus?: Expression<boolean | undefined>;
	label: unknown;

	children: PopoverContent;
	placement?: Expression<PopoutPlacement | undefined>;
	alignment?: Expression<PopoutAlignment | undefined>;
	foreignEvents?: string[];
	role?: PopoverRole;
	popoverClass?: ClassValue;
	popoverStyle?: StyleValue;

	"aria-label"?: Expression<string | undefined>;
	"aria-labelledby"?: Expression<string | undefined>;
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
