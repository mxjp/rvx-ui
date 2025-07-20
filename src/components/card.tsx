import { Expression, map } from "rvx";
import { THEME } from "../common/theme.js";
import { Column } from "./column.js";

export type CardVariant = "default" | "info" | "success" | "warning" | "danger";

export function Card(props: {
	variant?: Expression<CardVariant | undefined>;
	raw?: boolean;
	children?: unknown;
}): unknown {
	const theme = THEME.current;
	return <div
		class={[
			theme?.card,
			props.raw ? theme?.card_raw : undefined,
			map(props.variant, variant => theme?.[`card_${variant ?? "default"}`]),
		]}
	>
		{props.raw
			? props.children
			: <Column class={theme?.card_content}>
				{props.children}
			</Column>
		}
	</div>;
}
