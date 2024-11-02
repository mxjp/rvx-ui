import { Expression, get } from "rvx";
import { THEME } from "../common/theme.js";
import { Column } from "./column.js";

export type CardVariant = "default" | "info" | "success" | "warning" | "danger";

export function Card(props: {
	variant?: Expression<CardVariant | undefined>;
	children?: unknown;
}): unknown {
	const theme = THEME.current;
	return <div
		class={[
			theme?.card,
			() => theme?.[`card_${get(props.variant) ?? "default"}`],
		]}
	>
		<Column class={theme?.card_content}>
			{props.children}
		</Column>
	</div>;
}
