import { ContextKeyFor } from "@mxjp/gluon";

export const THEME = Symbol.for("gluon_ux:theme") as ContextKeyFor<Theme>;

/**
 * A collection of class names that is used as the theme.
 *
 * @example
 * ```tsx
 * import { mount, Inject } from "@mxjp/gluon";
 * import { THEME, Button } from "@mxjp/gluon-ux";
 *
 * import theme from "./theme.module.css";
 *
 * mount(
 *   document.body,
 *   <Inject key={THEME} value={theme}>
 *     {() => <>
 *       <Button>Click me!</Button>
 *     </>}
 *   </Inject>
 * );
 * ```
 */
export interface Theme {
	/** Class for all buttons */
	button?: string;
	/** Additional class for buttons with the "default" variant */
	button_default?: string;
	/** Additional class for buttons with the "primary" variant */
	button_primary?: string;
	/** Additional class for buttons with the "success" variant */
	button_success?: string;
	/** Additional class for buttons with the "danger" variant */
	button_danger?: string;
	/** Additional class for buttons with the "warning" variant */
	button_warning?: string;
}
