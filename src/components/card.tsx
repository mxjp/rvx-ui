import styles from "@rvx/ui/theme/components/card.module.css";
import { ClassValue, Expression, map, StyleValue } from "rvx";
import { SizeContext } from "../common/types.js";
import { Column } from "./column.js";

export type CardVariant = "default" | "info" | "success" | "warning" | "danger";

export function Card(props: {
	variant?: Expression<CardVariant | undefined>;
	size?: Expression<SizeContext | undefined>;
	raw?: boolean;
	class?: ClassValue;
	style?: StyleValue;
	children?: unknown;
}): unknown {
	return <div
		class={[
			props.class,
			styles.card,
			props.raw ? styles.raw : undefined,
			map(props.variant, variant => styles[variant ?? "default"]),
		]}
		style={props.style}
	>
		{props.raw
			? props.children
			: <Column size={map(props.size, s => s ?? "group")}>
				{props.children}
			</Column>
		}
	</div>;
}
