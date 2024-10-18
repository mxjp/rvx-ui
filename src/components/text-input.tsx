import { ClassValue, Expression, extract, get, optionalString, Signal, StyleValue } from "rvx";
import { isPending, waitFor } from "rvx/async";

import { keyFor } from "../common/events.js";
import { THEME } from "../common/theme.js";
import { validatorFor } from "./validation.js";

export type TextInputType = "text" | "password";
export type TextAreaWrap = "hard" | "soft";

export function TextInput(props: ({
	/**
	 * If true, this component is rendered as a `<textarea>` element.
	 */
	multiline?: false;

	/**
	 * The input type.
	 *
	 * @default "text"
	 */
	type?: Expression<TextInputType | undefined>;
} | {
	/**
	 * If true, this component is rendered as a `<textarea>` element.
	 */
	multiline: true;

	/**
	 * The number of visible rows if not overwritten via css.
	 *
	 * If not specified, the browser default is used.
	 */
	rows?: Expression<number | undefined>;

	/**
	 * Controls how the value is wrapped for form submission.
	 *
	 * This sets the standard `wrap` attribute.
	 */
	wrap?: Expression<TextAreaWrap | undefined>;
}) & {
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
	spellcheck?: Expression<boolean | undefined>;
	"aria-label"?: Expression<string | undefined>;
	"aria-labelledby"?: Expression<string | undefined>;
}): unknown {
	const theme = extract(THEME);
	const disabled = () => isPending() || get(props.disabled);

	const validator = props.value instanceof Signal ? validatorFor(props.value) : undefined;

	const InputTag = props.multiline ? "textarea" : "input";
	const input = <InputTag
		type={props.multiline ? undefined : (() => get(props.type) ?? "text")}
		rows={props.multiline ? props.rows : undefined}
		wrap={props.multiline ? props.wrap : undefined}
		disabled={disabled}
		class={[
			theme?.text_input,
			props.class,
		]}
		style={props.style}
		id={props.id}
		autofocus={props.autofocus}
		spellcheck={optionalString(props.spellcheck)}
		readonly={!(props.value instanceof Signal)}

		prop:value={props.value}
		on:input={() => {
			if (props.value instanceof Signal) {
				props.value.value = input.value;
			}
		}}
		on:keydown={event => {
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

		aria-label={props["aria-label"]}
		aria-labelledby={props["aria-labelledby"]}

		aria-invalid={validator ? optionalString(validator.invalid) : undefined}
		aria-errormessage={validator ? validator.errorMessageIds : undefined}
	/> as HTMLInputElement;

	return input;
}
