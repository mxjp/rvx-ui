import { ClassValue, Expression, extract, For, get, map, optionalString, Signal, string, StyleValue, uniqueId } from "@mxjp/gluon";
import { isPending } from "@mxjp/gluon/async";

import { THEME } from "../common/theme.js";
import { Text } from "./text.js";
import { validatorFor } from "./validation.js";

export interface RadioOption<T> {
	value: T;
	label: unknown;
}

export function RadioButtons<T>(props: {
	value?: Expression<T | undefined>;
	options: Expression<RadioOption<T>[]>;

	disabled?: Expression<boolean | undefined>;

	class?: ClassValue;
	style?: StyleValue;

	"aria-label"?: Expression<string | undefined>;
	"aria-labelledby"?: Expression<string | undefined>;

	// TODO: Autofocus.

	children?: never;
}): unknown {
	const group = uniqueId();
	const theme = extract(THEME);

	const disabled = props.value instanceof Signal
		? () => isPending() || get(props.disabled)
		: () => true;

	const validator = props.value instanceof Signal ? validatorFor(props.value) : undefined;

	return <div
		role="radiogroup"
		class={[
			theme?.radio_buttons,
			props.class,
		]}
		style={props.style}
		aria-readonly={string(!(props.options instanceof Signal))}
		aria-invalid={validator ? optionalString(validator.invalid) : undefined}
		aria-errormessage={validator ? validator.errorMessageIds : undefined}
		aria-label={props["aria-label"]}
		aria-labelledby={props["aria-labelledby"]}
	>
		<For each={props.options}>
			{option => {
				const id = uniqueId();

				return <label
					for={id}
					class={theme?.radio_button_label}
				>
					<input
						id={id}
						type="radio"
						class={theme?.radio_button_input}
						name={group}
						value={id}
						disabled={disabled}
						prop:checked={map(props.value, x => x === option.value)}
						$input={() => {
							if (props.value instanceof Signal) {
								props.value.value = option.value;
							}
						}}
					/>
					<Text class={theme?.radio_button_content}>
						{option.label}
					</Text>
				</label>;
			}}
		</For>
	</div>;
}
