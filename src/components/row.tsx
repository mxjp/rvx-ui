import { ClassValue, Expression, get, StyleValue } from "rvx";
import { THEME } from "../common/theme.js";
import { SizeContext } from "../common/types.js";

export type RowAlignment = "top" | "center" | "bottom";

export function Row(props: {
	size?: Expression<SizeContext | undefined>;
	align?: Expression<RowAlignment | undefined>;
	class?: ClassValue;
	style?: StyleValue;
	children?: unknown;
}): unknown {
	const theme = THEME.current;
	return <div
		class={[
			theme?.row,
			() => theme?.[`row_${get(props.size) ?? "control"}`],
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
