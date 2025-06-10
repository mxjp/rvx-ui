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
			map(props.variant, variant => theme?.[`card_${variant ?? "default"}`]),
			map(props.raw, unpadded => unpadded ? theme?.card_raw : undefined),
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
