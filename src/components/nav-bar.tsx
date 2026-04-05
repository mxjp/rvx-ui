import styles from "@rvx/ui/theme/components/nav-bar.module.css";
import { ClassValue, Content, Expression, get, map, StyleValue } from "rvx";
import { isPending } from "rvx/async";
import { optionalString, separated } from "rvx/convert";
import { Action, handleActionEvent, isKey } from "../common/events.js";
import { AriaCurrent } from "../common/types.js";
import { LinkAnchorRel, LinkAnchorTarget, LinkReferrerPolicy } from "./link.js";
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

export function NavBarItem(props: {
	class?: ClassValue;
	style?: StyleValue;
	children?: Content;
	disabled?: Expression<boolean | undefined>;
	action?: Action;
	download?: Expression<string | boolean | undefined>;

	/**
	 * The url this link points to.
	 */
	href?: Expression<string | undefined>;

	/**
	 * Hints the human language of the linked url.
	 */
	hreflang?: Expression<string | undefined>;

	/**
	 * The link target.
	 */
	target?: Expression<LinkAnchorTarget | string | undefined>;

	/**
	 * How much of the referrer to send when following the link.
	 *
	 * @default "no-referrer"
	 */
	referrerpolicy?: Expression<LinkReferrerPolicy | undefined>;

	/**
	 * The link type.
	 *
	 * @default "noreferrer"
	 */
	rel?: Expression<LinkAnchorRel | LinkAnchorRel[] | undefined>;

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

	const isLink = props.href !== undefined;
	const Tag = isLink ? "a" : "button";

	return <Tag
		type={isLink ? undefined : "button"}
		disabled={disabled}
		class={[
			props.class,
			styles.item,
			map(props.current, current => current ? styles.current : undefined),
			map(props["aria-expanded"], expanded => expanded ? styles.expanded : undefined),
		]}
		style={props.style}
		title={props.title}
		aria-current={optionalString(props.current)}
		aria-expanded={optionalString(props["aria-expanded"])}
		aria-haspopup={props["aria-haspopup"]}
		aria-controls={props["aria-controls"]}

		download={isLink && props.download}
		href={isLink && props.href}
		hreflang={isLink && props.hreflang}
		target={isLink && props.target}
		referrerpolicy={isLink && map(props.referrerpolicy, v => v ?? "no-referrer")}
		rel={isLink && separated(map(props.rel, v => v ?? "noreferrer"), " ")}

		on:click={action}
		on:keydown={event => {
			if (isKey(event, "enter") || isKey(event, " ")) {
				action(event);
			}
		}}
	>
		{props.children}
	</Tag>;
}

export function NavBarContent(props: {
	class?: ClassValue;
	style?: StyleValue;
	children?: Content;
}) {
	return <Row
		class={[
			props.class,
			styles.content
		]}
		style={props.style}
		align="center"
	>
		{props.children}
	</Row>;
}
