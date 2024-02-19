import { ClassValue, Expression, extract, StyleValue } from "@mxjp/gluon";

import { THEME } from "../common/theme.js";

export function Label(props: {
	class?: ClassValue;
	style?: StyleValue;
	for?: Expression<string | undefined>;
	id?: Expression<string | undefined>;
	children?: unknown;
}): unknown {
	const theme = extract(THEME);
	return <label
		class={[
			theme?.label,
			props.class,
		]}
		style={props.style}
		for={props.for}
		id={props.id}
	>
		{props.children}
	</label>;
}
