import { ContextKey, Expression } from "@mxjp/gluon";

/**
 * Context key for providing the icon component implementation.
 */
export const ICON_COMPONENT = Symbol.for("gluon_ux:icon_component") as ContextKey<IconComponent>;

export type IconType
	= "checkbox_unchecked"
	| "checkbox_checked"
	| "checkbox_mixed";

export interface IconComponent {
	(props: {
		/**
		 * The icon to render.
		 */
		icon: Expression<IconType>;
	}): unknown;
}
