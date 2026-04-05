import styles from "@rvx/ui/theme/components/nav-bar.module.css";
import { ClassValue, Content, Expression, get, map, StyleValue } from "rvx";
import { isPending } from "rvx/async";
import { optionalString } from "rvx/convert";
import { Action, handleActionEvent, isKey } from "../common/events.js";
import { AriaCurrent } from "../common/types.js";
import { Row } from "./row.js";

export function NavBar(props: {
	class?: ClassValue;
	style?: StyleValue;
	inlineSize?: Expression<string | undefined>;
	start?: Content;
	center?: Content;
	end?: Content;
}) {
	return <nav
		class={[
			styles.nav,
			props.class,
		]}
		style={[
			props.style,
			{
				"--nav-bar-inline-size": props.inlineSize,
			}
		]}
	>
		<div class={styles.grid}>
			<div class={styles.start}>
				{props.start}
			</div>
			<div class={styles.center}>
				{props.center}
			</div>
			<div class={styles.end}>
				{props.end}
			</div>
		</div>
	</nav>;
}

export function NavBarButton(props: {
	class?: ClassValue;
	style?: StyleValue;
	children?: unknown;
	disabled?: Expression<boolean | undefined>;
	action?: Action;
	title?: Expression<string | undefined>;
	current?: Expression<AriaCurrent | undefined>;

	"aria-expanded"?: Expression<boolean | undefined>;
	"aria-haspopup"?: Expression<string | undefined>;
	"aria-controls"?: Expression<string | undefined>;
}) {
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
			props.class,
			styles.item,
			map(props.current, current => current ? styles.current : undefined),
		]}
		style={props.style}
		title={props.title}
		aria-current={optionalString(props.current)}
		aria-expanded={optionalString(props["aria-expanded"])}
		aria-haspopup={props["aria-haspopup"]}
		aria-controls={props["aria-controls"]}

		on:click={action}
		on:keydown={event => {
			if (isKey(event, "enter") || isKey(event, " ")) {
				action(event);
			}
		}}
	>
		<Row class={styles.item_content} align="center">
			{props.children}
		</Row>
	</button>;
}
