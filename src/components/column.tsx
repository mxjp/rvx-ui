import styles from "@rvx/ui/theme/components/column.module.css";
import { ClassValue, Expression, map, StyleValue } from "rvx";
import { SizeContext } from "../common/types.js";

/**
 * A flex column with automatic spacing between it's children.
 */
export function Column(props: {
	size?: Expression<SizeContext | undefined>;
	padded?: Expression<boolean | undefined>;
	class?: ClassValue;
	style?: StyleValue;
	id?: Expression<string | undefined>;
	children?: unknown;
}): unknown {
	return <div
		class={[
			styles.column,
			map(props.size, size => styles[size ?? "content"]),
			map(props.padded, padded => padded ? styles.padded : undefined),
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
