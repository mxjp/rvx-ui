import { ClassValue, Expression, map, StyleValue } from "rvx";
import { THEME } from "../common/theme.js";
import { Column } from "./column.js";

export function Page(props: {
	inlineSize?: Expression<string | undefined>;
	centerBlock?: Expression<boolean>;
	role?: Expression<string | undefined>;
	id?: Expression<string | undefined>;
	class?: ClassValue;
	style?: StyleValue;
	children?: unknown;
}): unknown {
	const theme = THEME.current;
	return <div
		role={props.role}
		id={props.id}
		class={[
			props.class,
			theme?.page,
			map(props.centerBlock, v => v ? theme?.page_center_block : undefined),
		]}
		style={[
			props.style,
			{
				"--page-inline-size": props.inlineSize,
			},
		]}
	>
		<div class={theme?.page_scrollbar_comp} />
		<div class={theme?.page_content_col}>
			<Column class={theme?.page_content}>
				{props.children}
			</Column>
		</div>
	</div>;
}
