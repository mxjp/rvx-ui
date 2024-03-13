import { ClassValue, Expression, extract, get, isPending, optionalString, Signal, StyleValue, waitFor } from "@mxjp/gluon";

import { keyFor } from "../common/events.js";
import { THEME } from "../common/theme.js";
import { Validator } from "./validation.js";

export type TextInputType = "text" | "password";

export function TextInput(props: {
	/**
	 * The input type.
	 */
	type?: Expression<TextInputType | undefined>;

	/**
	 * Set when the input is disabled.
	 *
	 * The input is automatically disabled when there are any {@link isPending pending tasks}.
	 */
	disabled?: Expression<boolean | undefined>;

	/**
	 * The current text value.
	 *
	 * If this isn't a signal, the text input is readonly.
	 */
	value: Expression<string>;

	enterAction?: (event: Event) => void | boolean | Promise<void>;

	class?: ClassValue;
	style?: StyleValue;
	id?: Expression<string | undefined>;
	autofocus?: Expression<boolean | undefined>;
}): unknown {
	const theme = extract(THEME);
	const disabled = () => isPending() || get(props.disabled);

	const validator = props.value instanceof Signal ? Validator.get(props.value) : undefined;

	const input = <input
		type={() => get(props.type) ?? "text"}
		disabled={disabled}
		class={[
			theme?.text_input,
			props.class,
		]}
		style={props.style}
		id={props.id}
		autofocus={props.autofocus}
		readonly={!(props.value instanceof Signal)}

		prop:value={props.value}
		$input={() => {
			if (props.value instanceof Signal) {
				props.value.value = input.value;
			}
		}}
		$keydown={event => {
			const key = keyFor(event);
			if (key === "enter" && props.enterAction && !disabled()) {
				const result = props.enterAction(event);
				if (result === false) {
					return;
				}
				event.preventDefault();
				event.stopImmediatePropagation();
				if (result instanceof Promise) {
					waitFor(result);
				}
			}
		}}

		aria-invalid={validator ? optionalString(validator.invalid) : undefined}
		aria-errormessage={validator ? validator.errorMessageIds : undefined}
	/> as HTMLInputElement;

	return input;
}
