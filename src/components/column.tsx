import { ClassValue, Expression, extract, map, StyleValue } from "rvx";

import { THEME } from "../common/theme.js";
import { SizeContext } from "../common/types.js";

/**
 * A flex column with automatic spacing between it's children.
 */
export function Column(props: {
	size?: Expression<SizeContext | undefined>;
	class?: ClassValue;
	style?: StyleValue;
	id?: Expression<string | undefined>;
	children?: unknown;
}): unknown {
	const theme = extract(THEME);
	return <div
		class={[
			theme?.column,
			map(props.size, size => theme?.[`column_${size ?? "content"}`]),
			props.class,
		]}
		style={props.style}
		id={props.id}
	>
		{props.children}
	</div>;
}
