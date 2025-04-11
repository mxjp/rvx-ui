import { Expression, map } from "rvx";
import { THEME } from "../common/theme.js";
import { Column } from "./column.js";

export type CardVariant = "default" | "info" | "success" | "warning" | "danger";

export function Card(props: {
	variant?: Expression<CardVariant | undefined>;
	unpadded?: Expression<boolean | undefined>;
	children?: unknown;
}): unknown {
	const theme = THEME.current;
	return <div
		class={[
			theme?.card,
			map(props.variant, variant => theme?.[`card_${variant ?? "default"}`]),
			map(props.unpadded, unpadded => unpadded ? theme?.card_unpadded : undefined),
		]}
	>
		<Column class={theme?.card_content}>
			{props.children}
		</Column>
	</div>;
}
