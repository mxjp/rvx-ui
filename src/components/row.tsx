import { ClassValue, extract, StyleValue } from "@mxjp/gluon";

import { THEME, Theme } from "../common/theme.js";

export function Row(props: {
	class?: ClassValue;
	style?: StyleValue;
	children?: unknown;
}): unknown {
	const theme = extract(THEME) as Theme | undefined;
	return <div
		class={[
			theme?.row,
			props.class,
		]}
		style={props.style}
	>
		{props.children}
	</div>;
}
