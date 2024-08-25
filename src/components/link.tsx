import { ClassValue, Expression, extract, get, map, optionalString, StyleValue } from "@mxjp/gluon";
import { isPending } from "@mxjp/gluon/async";

import { Action, handleActionEvent, keyFor } from "../common/events.js";
import { THEME } from "../common/theme.js";
import { separated } from "../common/types.js";

export type LinkReferrerPolicy = "no-referrer" | "no-referrer-when-downgrade" | "origin" | "origin-when-cross-origin" | "same-origin" | "strict-origin" | "strict-origin-when-cross-origin" | "unsafe-url";

/**
 * Possible values of the `"rel"` attribute that are applicable to `<a>` elements.
 */
export type LinkAnchorRel = "alternate" | "author" | "bookmark" | "external" | "help" | "license" | "me" | "next" | "nofollow" | "noopener" | "noreferrer" | "opener" | "prev" | "privacy-policy" | "search" | "tag" | "terms-of-service";

export type LinkAnchorTarget = "_self" | "_blank" | "_parent" | "_top" | "_unfencedTop";

export function Link(props: {
	/**
	 * Set when the link is disabled.
	 *
	 * The link is automatically disabled when there are any pending tasks.
	 */
	disabled?: Expression<boolean | undefined>;

	/**
	 * The action to run when the link is clicked.
	 */
	action?: Action;

	/**
	 * Causes the browser to treat the linked url as a download when true or a filename.
	 */
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

	class?: ClassValue;
	style?: StyleValue;
	id?: Expression<string | undefined>;
	title?: Expression<string | undefined>;
	autofocus?: Expression<boolean | undefined>;
	"aria-expanded"?: Expression<boolean | undefined>;
	"aria-label"?: Expression<string | undefined>;
	"aria-labelledby"?: Expression<string | undefined>;

	children?: unknown;
}): unknown {
	const theme = extract(THEME);
	const disabled = () => isPending() || get(props.disabled);

	function action(event: Event) {
		if (disabled() || !props.action) {
			return;
		}
		handleActionEvent(event, props.action);
	}

	return <a
		disabled={disabled}
		class={[
			theme?.link,
			props.class,
		]}
		style={props.style}
		id={props.id}
		aria-expanded={optionalString(props["aria-expanded"])}
		aria-label={props["aria-label"]}
		aria-labelledby={props["aria-labelledby"]}
		title={props.title}
		autofocus={props.autofocus}
		role={props.action === undefined ? undefined : "button"}
		tabindex="0"

		download={props.download}
		href={props.href}
		hreflang={props.hreflang}
		target={props.target}
		referrerpolicy={map(props.referrerpolicy, v => v ?? "no-referrer")}
		rel={separated(map(props.rel, v => v ?? "noreferrer"), " ")}

		$click={action}
		$keydown={event => {
			const key = keyFor(event);
			if (key === "enter" || key === "space") {
				action(event);
			}
		}}
	>
		{props.children}
	</a>;
}
