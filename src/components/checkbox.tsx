import { ClassValue, Expression, extract, get, optionalString, Signal, string, StyleValue, uniqueId } from "@mxjp/gluon";
import { isPending } from "@mxjp/gluon/async";

import { keyFor } from "../common/events.js";
import { ICON_COMPONENT } from "../common/icons.js";
import { THEME } from "../common/theme.js";
import { Validator } from "./validation.js";

export function Checkbox(props: {
	/**
	 * The current value or undefined if the value is mixed.
	 *
	 * If this isn't a signal, the checkbox is readonly.
	 */
	value?: Expression<boolean | undefined>;

	/**
	 * Set when the checkbox is disabled.
	 *
	 * The checkbox is automatically disabled when there are any {@link isPending pending tasks}.
	 */
	disabled?: Expression<boolean | undefined>;

	class?: ClassValue;
	style?: StyleValue;
	autofocus?: Expression<boolean | undefined>;
	children?: unknown;
}): unknown {
	const Icon = extract(ICON_COMPONENT);
	if (Icon === undefined) {
		throw new Error("icon component must be available in the current context");
	}

	const id = uniqueId();
	const theme = extract(THEME);
	const disabled = () => isPending() || get(props.disabled);

	const validator = props.value instanceof Signal ? Validator.get(props.value) : undefined;

	const checkbox = <div
		id={id}
		role="checkbox"
		aria-checked={() => String(get(props.value) ?? "mixed")}
		aria-disabled={string(disabled)}
		aria-readonly={string(!(props.value instanceof Signal))}
		aria-invalid={validator ? optionalString(validator.invalid) : undefined}
		aria-errormessage={validator ? validator.errorMessageIds : undefined}
		class={theme?.checkbox}
		autofocus={props.autofocus}
		tabindex={() => disabled() ? -1 : 0}
	>
		<Icon icon={() => {
			switch (get(props.value)) {
				case true: return "checkbox_checked";
				case false: return "checkbox_unchecked";
				default: return "checkbox_mixed";
			}
		}} />
	</div> as HTMLDivElement;

	return <div
		class={[
			theme?.checkbox_container,
			props.class,
		]}
		style={props.style}
		$mousedown={event => {
			event.preventDefault();
		}}
		$click={event => {
			if (!disabled() && props.value instanceof Signal) {
				event.preventDefault();
				event.stopImmediatePropagation();
				props.value.value = !props.value.value;
			}
		}}
		$keydown={event => {
			const key = keyFor(event);
			if (key === "space" && !disabled() && props.value instanceof Signal) {
				event.preventDefault();
				event.stopImmediatePropagation();
				props.value.value = !props.value.value;
			}
		}}
	>
		{checkbox}
		<label
			class={[
				theme?.text,
				theme?.checkbox_label,
			]}
			for={id}
			$click={() => {
				checkbox.focus();
			}}
		>
			{props.children}
		</label>
	</div>;
}
