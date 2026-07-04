import styles from "@rvx/ui/theme/components/row.module.css";
import { ClassValue, Expression, get, map, StyleValue } from "rvx";
import { SizeContext } from "../common/types.js";

export type RowAlign = "start" | "center" | "end";
export type RowJustify = "start" | "center" | "end";

export function Row(props: {
	size?: Expression<SizeContext | undefined>;
	padded?: Expression<boolean | undefined>;
	align?: Expression<RowAlign | undefined>;
	justify?: Expression<RowJustify | undefined>;
	class?: ClassValue;
	style?: StyleValue;
	id?: Expression<string | undefined>;
	children?: unknown;
}): unknown {
	return <div
		id={props.id}
		class={[
			styles.row,
			() => styles[get(props.size) ?? "control"],
			map(props.padded, padded => padded ? styles.padded : undefined),
			props.class,
		]}
		style={[
			props.style,
			{
				"align-items": map(props.align, v => v ?? "start"),
				"justify-content": map(props.justify, v => v ?? "start"),
			},
		]}
	>
		{props.children}
	</div>;
}
