import { ClassValue, extract, StyleValue } from "@mxjp/gluon";

import { SizeContext } from "../common/size-context.js";
import { THEME, Theme } from "../common/theme.js";

export function Column(props: {
	size?: SizeContext;
	class?: ClassValue;
	style?: StyleValue;
	children?: unknown;
}): unknown {
	const theme = extract(THEME) as Theme | undefined;
	return <div
		class={[
			theme?.column,
			theme?.[`column_${props.size ?? "content"}`],
			props.class,
		]}
		style={props.style}
	>
		{props.children}
	</div>;
}
