import { ClassValue, Expression, extract, get, optionalString, Signal, string, StyleValue, uniqueId, watch } from "@mxjp/gluon";
import { isPending } from "@mxjp/gluon/async";

import { THEME } from "../common/theme.js";
import { Text } from "./text.js";
import { Validator } from "./validation.js";

export function Checkbox(props: {
	checked?: Expression<boolean | undefined>;

	disabled?: Expression<boolean | undefined>;

	class?: ClassValue;
	style?: StyleValue;
	autofocus?: Expression<boolean | undefined>;
	children?: unknown;
}): unknown {
	const id = uniqueId();
	const theme = extract(THEME);

	const disabled = props.checked instanceof Signal
		? () => isPending() || get(props.disabled)
		: () => true;

	const validator = props.checked instanceof Signal ? Validator.get(props.checked) : undefined;

	const input = <input
		id={id}
		type="checkbox"
		class={theme?.checkbox_input}
		$input={() => {
			if (props.checked instanceof Signal) {
				props.checked.value = input.checked;
			}
		}}
		aria-readonly={string(!(props.checked instanceof Signal))}
		aria-invalid={validator ? optionalString(validator.invalid) : undefined}
		aria-errormessage={validator ? validator.errorMessageIds : undefined}
		autofocus={props.autofocus}
		disabled={disabled}
	/> as HTMLInputElement;

	watch(props.checked, checked => {
		if (checked === undefined) {
			input.indeterminate = true;
		} else {
			input.checked = checked;
		}
	});

	return <label
		for={id}
		class={[
			theme?.checkbox_label,
			props.class,
		]}
		style={props.style}
	>
		{input}
		<Text class={theme?.checkbox_content}>
			{props.children}
		</Text>
	</label>;
}
