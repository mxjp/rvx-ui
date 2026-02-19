import { ClassValue, Expression, get, Signal, StyleValue, uniqueId, watch } from "rvx";
import { isPending } from "rvx/async";

import { optionalString, string } from "rvx/convert";
import { ID_PAIR } from "../common/id-pairs.js";
import { THEME } from "../common/theme.js";
import { Text } from "./text.js";
import { closestValidator } from "./validation.js";

export function Checkbox(props: {
	checked?: Expression<boolean | undefined>;

	disabled?: Expression<boolean | undefined>;

	class?: ClassValue;
	style?: StyleValue;
	autofocus?: Expression<boolean | undefined>;
	children?: unknown;
}): unknown {
	const pairId = ID_PAIR.current.consume();
	const id = props.children === undefined ? pairId : uniqueId();
	const theme = THEME.current;

	const disabled = props.checked instanceof Signal
		? () => isPending() || get(props.disabled)
		: () => true;

	const validator = props.checked instanceof Signal ? closestValidator(props.checked) : undefined;

	const input = <input
		id={id}
		type="checkbox"
		class={theme?.checkbox_input}
		on:input={() => {
			if (props.checked instanceof Signal) {
				props.checked.value = input.checked;
			}
		}}
		aria-readonly={string(!(props.checked instanceof Signal))}
		aria-invalid={validator ? optionalString(validator.invalid) : undefined}
		aria-errormessage={validator ? validator.messageIds : undefined}
		autofocus={props.autofocus}
		disabled={disabled}
	/> as HTMLInputElement;

	watch(props.checked, checked => {
		input.indeterminate = checked === undefined;
		input.checked = checked === true;
	});

	return <label
		for={id}
		class={[
			theme?.checkbox_label,
			props.class,
		]}
		style={props.style}
	>
		{theme?.checkbox_padding ? <div class={theme.checkbox_padding}>{input}</div> : input}
		<Text class={theme?.checkbox_content}>
			{props.children}
		</Text>
	</label>;
}
