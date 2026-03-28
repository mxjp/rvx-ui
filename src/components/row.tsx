import styles from "@rvx/ui/theme/components/row.module.css";
import { ClassValue, Expression, get, map, StyleValue } from "rvx";
import { SizeContext } from "../common/types.js";

export type RowAlignment = "top" | "center" | "bottom";

export function Row(props: {
	size?: Expression<SizeContext | undefined>;
	padded?: Expression<boolean | undefined>;
	align?: Expression<RowAlignment | undefined>;
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
				"align-items": () => {
					switch (get(props.align)) {
						case "center": return "center";
						case "bottom": return "end";
						default: return "start";
					}
				},
			},
		]}
	>
		{props.children}
	</div>;
}
