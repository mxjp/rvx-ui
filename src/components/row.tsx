import { ClassValue, Expression, extract, get, StyleValue } from "@mxjp/gluon";

import { SizeContext } from "../common/size-context.js";
import { THEME, Theme } from "../common/theme.js";

export type RowAlignment = "top" | "center" | "bottom";

export function Row(props: {
	size?: Expression<SizeContext>;
	align?: Expression<RowAlignment>;
	class?: ClassValue;
	style?: StyleValue;
	children?: unknown;
}): unknown {
	const theme = extract(THEME) as Theme | undefined;
	return <div
		class={[
			theme?.row,
			() => theme?.[`row_${get(props.size) ?? "content"}`],
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
