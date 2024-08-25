import { ContextKey } from "@mxjp/gluon";

export const THEME = Symbol.for("gluon_ux:theme") as ContextKey<Theme>;

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

	/** Class for all checkbox containing labels */
	checkbox_label?: string;
	/** Class for all checkbox inputs */
	checkbox_input?: string;
	/** Class for checkbox text content. This element may also be a text block. */
	checkbox_content?: string;

	/** Class for collapses */
	collapse?: string;
	/** Class for collapses that is when it's size has been measured. */
	collapse_sized?: string;
	/** Class for an additional element between the collapse container and the content. If this is undefined, the element is omitted. */
	collapse_view?: string;
	/** Class that is added to collapses to play an alert animation. */
	collapse_alert?: string;
	/** Additional class for visible collapses */
	collapse_visible?: string;
	/** Class for collapse content */
	collapse_content?: string;

	/** Class for all columns */
	column?: string;
	/** Additional class for columns of content */
	column_content?: string;
	/** Additional class for columns of controls */
	column_control?: string;

	/** Class for all dialog containers */
	dialog_container?: string;
	/** Class for all dialog bodies */
	dialog_body?: string;
	/** Class for all dialog footers */
	dialog_footer?: string;

	/** Class for growing flex space */
	flex_space?: string;

	/** Class for all headings which are also semantic elements like h1, h2 etc. */
	heading?: string;

	/** Class for all labels */
	label?: string;

	/** Class for all links */
	link?: string;

	/** Class for all popover roots. */
	popover?: string;
	/** Class for the spike container area. */
	popover_spike_area?: string;
	/** Class for the spike root. */
	popover_spike?: string;
	/** Class for the popover content. */
	popover_content?: string;

	/** Class for all radio button columns */
	radio_buttons?: string;
	/** Class for all radio button containing labels */
	radio_button_label?: string;
	/** Class for all radio button inputs */
	radio_button_input?: string;
	/** Class for radio button text content. This element may also be a text block. */
	radio_button_content?: string;

	/** Class for all rows */
	row?: string;
	/** Additional class for rows of content */
	row_content?: string;
	/** Additional class for rows of controls */
	row_control?: string;

	/** Class for all text inputs */
	text_input?: string;

	/** Class for all text blocks */
	text?: string;

	/** Class for all validation messages */
	validation_message?: string;
	/** Class for all validation message containers. */
	validation_message_container?: string;

	/** Class for all text values */
	value?: string;
}
