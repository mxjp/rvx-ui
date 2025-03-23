import { ClassValue, Context, Expression, get, map, optionalString, StyleValue } from "rvx";
import { isPending } from "rvx/async";
import { Action, handleActionEvent, keyFor } from "../common/events.js";
import { THEME } from "../common/theme.js";

const DEPTH = new Context(0);

export function NavList(props: {
	class?: ClassValue;
	style?: StyleValue;
	id?: Expression<string | undefined>;
	children?: unknown;
}): unknown {
	const theme = THEME.current;
	return <div
		class={[
			theme?.nav_list,
			props.class,
		]}
		style={props.style}
		id={props.id}
	>
		{props.children}
	</div>;
}

export function NavListButton(props: {
	current?: Expression<boolean | undefined>;
	disabled?: Expression<boolean | undefined>;
	class?: ClassValue;
	style?: StyleValue;
	id?: Expression<string | undefined>;
	action?: Action;
	children: unknown;
}): unknown {
	const theme = THEME.current;
	const disabled = () => isPending() || get(props.disabled);

	function action(event: Event) {
		if (disabled() || !props.action) {
			return;
		}
		handleActionEvent(event, props.action);
	}

	return <button
		type="button"
		disabled={disabled}
		class={[
			theme?.nav_list_item,
			map(props.current, current => current && theme?.nav_list_item_current),
			props.class,
		]}
		style={props.style}
		id={props.id}
		on:click={action}
		on:keydown={event => {
			const key = keyFor(event);
			if (key === "enter" || key === "space") {
				action(event);
			}
		}}
		aria-current={optionalString(props.current)}
	>
		{props.children}
	</button>;
}
