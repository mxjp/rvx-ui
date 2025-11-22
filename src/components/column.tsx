import { ClassValue, Expression, map, StyleValue } from "rvx";
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
	padded?: boolean;
}): unknown {
	const theme = THEME.current;
	return <div
		class={[
			theme?.column,
			map(props.size, size => theme?.[`column_${size ?? "content"}`]),
			map(props.padded, padded => padded ? theme?.column_padded : undefined),
			props.class,
		]}
		style={props.style}
		id={props.id}
	>
		{props.children}
	</div>;
}

/**
 * Shorthand for `<Column size="group">...`
 */
export function Group(props: Omit<Parameters<typeof Column>[0], "size">) {
	return Column({ size: "group", ...props });
}
