import { Attach, ClassValue, Component, Context, Expression, map, StyleValue } from "rvx";
import { trackLoading } from "../common/tasks.js";
import { THEME } from "../common/theme.js";

export const PLACEHOLDER = new Context<Component | undefined>();

export function Placeholder(props: {
	children?: unknown;
	class?: ClassValue;
	style?: StyleValue;
	active?: Expression<boolean | undefined>;
	message?: Component;
}) {
	const theme = THEME.current;
	const active = props.active === undefined
		? trackLoading()
		: map(props.active, v => v ?? true);

	return <div
		class={[
			props.class,
			theme?.placeholder_area
		]}
		style={props.style}
	>
		<Attach when={active}>
			<div class={theme?.placeholder}>
				<div class={theme?.placeholder_message}>
					{(props.message ?? PLACEHOLDER.current)?.()}
				</div>
			</div>
		</Attach>
		<div class={theme?.placeholder_content} inert={active}>
			{props.children}
		</div>
	</div>;
}
