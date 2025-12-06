import { ClassValue, Expression, map, StyleValue } from "rvx";
import { THEME } from "../common/theme.js";
import { SizeContext } from "../common/types.js";
import { Column } from "./column.js";

export type CardVariant = "default" | "info" | "success" | "warning" | "danger";

export function Card(props: {
	variant?: Expression<CardVariant | undefined>;
	size?: SizeContext;
	raw?: boolean;
	class?: ClassValue;
	style?: StyleValue;
	children?: unknown;
}): unknown {
	const theme = THEME.current;
	return <div
		class={[
			props.class,
			theme?.card,
			props.raw ? theme?.card_raw : undefined,
			map(props.variant, variant => theme?.[`card_${variant ?? "default"}`]),
		]}
		style={props.style}
	>
		{props.raw
			? props.children
			: <Column class={theme?.card_content} size={map(props.size, s => s ?? "group")}>
				{props.children}
			</Column>
		}
	</div>;
}
