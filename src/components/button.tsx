import { ClassValue, Expression, extract, get, isPending, optionalString, StyleValue, waitFor } from "@mxjp/gluon";

import { keyFor } from "../common/events.js";
import { THEME, Theme } from "../common/theme.js";

export type ButtonType = "button" | "submit" | "reset" | "menu";
export type ButtonVariant = "default" | "primary" | "success" | "danger" | "warning";

export function Button(props: {
	/**
	 * The button type.
	 */
	type?: Expression<ButtonType | undefined>;

	/**
	 * The theme variant.
	 */
	variant?: Expression<ButtonVariant | undefined>;

	/**
	 * Set when the button is disabled.
	 *
	 * The button is automatically disabled when there are any {@link isPending pending tasks}.
	 */
	disabled?: Expression<boolean | undefined>;

	/**
	 * The action to run when the button is clicked.
	 */
	action?: (event: Event) => void | boolean | Promise<void>;

	class?: ClassValue;
	style?: StyleValue;
	id?: Expression<string | undefined>;
	"aria-expanded"?: Expression<boolean | undefined>;
	"aria-label"?: Expression<string | undefined>;
	"aria-labelledby"?: Expression<string | undefined>;

	children?: unknown;
}): unknown {
	const theme = extract(THEME) as Theme | undefined;
	const disabled = () => isPending() || get(props.disabled);

	function action(event: Event) {
		if (disabled()) {
			return;
		}
		const result = props.action?.(event);
		if (result === false) {
			return;
		}
		event.preventDefault();
		event.stopImmediatePropagation();
		if (result instanceof Promise) {
			waitFor(result);
		}
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
		aria-expanded={optionalString(props["aria-expanded"])}
		aria-label={props["aria-label"]}
		aria-labelledby={props["aria-labelledby"]}

		$click={action}
		$keydown={event => {
			const key = keyFor(event);
			if (key === "enter" || key === "space") {
				action(event);
			}
		}}
	>
		{props.children}
	</button>;
}
