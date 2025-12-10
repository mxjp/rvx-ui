import { ClassValue, Expression, get, map, StyleValue } from "rvx";
import { THEME } from "../common/theme.js";
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
	const theme = THEME.current;
	return <div
		id={props.id}
		class={[
			theme?.row,
			() => theme?.[`row_${get(props.size) ?? "control"}`],
			map(props.padded, padded => padded ? theme?.row_padded : undefined),
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
