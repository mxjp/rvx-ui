import { ClassValue, Expression, extract, StyleValue } from "rvx";

import { THEME } from "../common/theme.js";

export function Value(props: {
	class?: ClassValue;
	style?: StyleValue;
	id?: Expression<string | undefined>;
	children?: unknown;
}): unknown {
	const theme = extract(THEME);
	return <span
		class={[
			theme?.value,
			props.class,
		]}
		style={props.style}
		id={props.id}
	>
		{props.children}
	</span>;
}
