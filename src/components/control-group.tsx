import { ClassValue, Expression, extract, StyleValue } from "@mxjp/gluon";

import { THEME } from "../common/theme.js";

export function ControlGroup(props: {
	class?: ClassValue;
	style?: StyleValue;
	id?: Expression<string | undefined>;
	children?: unknown;
}): unknown {
	const theme = extract(THEME);
	return <div
		class={[
			theme?.control_group,
			props.class,
		]}
		style={props.style}
		id={props.id}
	>
		{props.children}
	</div>;
}