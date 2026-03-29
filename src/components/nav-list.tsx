import styles from "@rvx/ui/theme/components/nav-list.module.css";
import { ClassValue, Expression, get, map, StyleValue } from "rvx";
import { isPending } from "rvx/async";
import { optionalString } from "rvx/convert";
import { Action, handleActionEvent, isKey } from "../common/events.js";

export function NavList(props: {
	/**
	 * The element role or `false` to disable.
	 *
	 * @default "navigation"
	 */
	role?: Expression<string | false | undefined>;

	class?: ClassValue;
	style?: StyleValue;
	id?: Expression<string | undefined>;
	children?: unknown;
}): unknown {
	return <div
		class={[
			styles.nav_list,
			props.class,
		]}
		style={[
			{ "--nav-list-depth": String(0) },
			props.style,
		]}
		id={props.id}
		role={map(props.role, role => role ?? "navigation")}
	>
		{props.children}
	</div>;
}

export function NavListButton(props: {
	/**
	 * True if this is the currently selected item.
	 */
	current?: Expression<boolean | undefined>;

	disabled?: Expression<boolean | undefined>;
	class?: ClassValue;
	style?: StyleValue;
	id?: Expression<string | undefined>;
	action?: Action;
	children?: unknown;
}): unknown {
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
			styles.item,
			map(props.current, current => current && styles.item_current),
			props.class,
		]}
		style={props.style}
		id={props.id}
		on:click={action}
		on:keydown={event => {
			if (isKey(event, "enter") || isKey(event, " ")) {
				action(event);
			}
		}}
		aria-current={optionalString(props.current)}
	>
		{props.children}
	</button>;
}
