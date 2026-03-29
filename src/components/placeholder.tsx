import { Attach, ClassValue, Component, Context, Expression, map, StyleValue } from "rvx";
import { trackLoading } from "../common/tasks.js";
import styles from "@rvx/ui/theme/components/placeholder.module.css";

export const PLACEHOLDER = new Context<Component | undefined>();

export function Placeholder(props: {
	children?: unknown;
	class?: ClassValue;
	style?: StyleValue;
	active?: Expression<boolean | undefined>;
	message?: Component;
}) {
	const active = props.active === undefined
		? trackLoading()
		: map(props.active, v => v ?? true);

	return <div
		class={[
			props.class,
			styles.area
		]}
		style={props.style}
	>
		<Attach when={active}>
			<div class={styles.placeholder}>
				<div class={styles.message}>
					{(props.message ?? PLACEHOLDER.current)?.()}
				</div>
			</div>
		</Attach>
		<div class={styles.content} inert={active}>
			{props.children}
		</div>
	</div>;
}
