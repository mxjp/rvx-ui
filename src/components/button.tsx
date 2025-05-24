import { ClassValue, Expression, get, StyleValue } from "rvx";
import { isPending } from "rvx/async";
import { optionalString } from "rvx/convert";
import { Action, handleActionEvent, keyFor } from "../common/events.js";
import { THEME } from "../common/theme.js";
import { Validator } from "./validation.js";

export type ButtonType = "button" | "submit" | "reset" | "menu";
export type ButtonVariant = "default" | "primary" | "success" | "danger" | "warning" | "input" | "text";

export function Button(props: {
	/**
	 * The button type.
	 *
	 * @default "button"
	 */
	type?: Expression<ButtonType | undefined>;

	/**
	 * The theme variant.
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

	/**
	 * The action to run when the button is clicked.
	 */
	action?: Action;

	class?: ClassValue;
	style?: StyleValue;
	id?: Expression<string | undefined>;
	autofocus?: Expression<boolean | undefined>;
	title?: Expression<string | undefined>;
	role?: Expression<string | undefined>;
	"aria-label"?: Expression<string | undefined>;
	"aria-labelledby"?: Expression<string | undefined>;
	"aria-expanded"?: Expression<boolean | undefined>;
	"aria-haspopup"?: Expression<string | undefined>;
	"aria-controls"?: Expression<string | undefined>;
	validator?: Validator;

	children?: unknown;
}): unknown {
	const theme = THEME.current;
	const disabled = () => isPending() || get(props.disabled);

	function action(event: Event) {
		if (disabled() || !props.action) {
			return;
		}
		handleActionEvent(event, props.action);
	}

	return <button
		type={() => get(props.type) ?? "button"}
		disabled={disabled}
		class={[
			theme?.button,
			() => theme?.[`button_${get(props.variant) ?? "default"}`],
			props.class,
		]}
		style={props.style}
		id={props.id}
		title={props.title}
		role={props.role}
		aria-label={props["aria-label"]}
		aria-labelledby={props["aria-labelledby"]}
		aria-expanded={optionalString(props["aria-expanded"])}
		aria-haspopup={props["aria-haspopup"]}
		aria-controls={props["aria-controls"]}
		aria-invalid={props.validator ? optionalString(props.validator.invalid) : undefined}
		aria-errormessage={props.validator ? props.validator.messageIds : undefined}
		autofocus={props.autofocus}

		on:click={action}
		on:keydown={event => {
			const key = keyFor(event);
			if (key === "enter" || key === "space") {
				action(event);
			}
		}}
	>
		{props.children}
	</button>;
}
