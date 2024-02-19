import { ClassValue, Expression, extract, StyleValue } from "@mxjp/gluon";

import { THEME } from "../common/theme.js";

/**
 * Represents the validity state of a specific user input.
 */
export interface Validity {
	/**
	 * Reactively get if the input is invalid.
	 */
	get invalid(): boolean;

	/**
	 * Reactively get a space separated list of error message element ids.
	 */
	get errorMessageIds(): string | undefined;
}

/**
 * Component that renders a validation message.
 */
export function ValidationMessage(props: {
	class?: ClassValue;
	style?: StyleValue;
	id?: Expression<string | undefined>;
	children?: unknown;
}): unknown {
	const theme = extract(THEME);
	return <div
		class={[
			theme?.validation_message,
			props.class,
		]}
		style={props.style}
		id={props.id}
	>
		{props.children}
	</div>;
}
