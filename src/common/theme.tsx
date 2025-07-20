import { Context } from "rvx";

export const THEME = new Context<Theme | undefined>(undefined);

/**
 * A collection of class names that is used as the theme.
 *
 * @example
 * ```tsx
 * import { mount, Inject } from "rvx";
 * import { THEME, Button } from "@rvx/ui";
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
	button?: string;
	button_default?: string;
	button_primary?: string;
	button_success?: string;
	button_danger?: string;
	button_warning?: string;
	button_input?: string;
	button_text?: string;

	card?: string;
	card_raw?: string;
	card_content?: string;
	card_default?: string;
	card_info?: string;
	card_success?: string;
	card_warning?: string;
	card_danger?: string;

	checkbox_label?: string;
	checkbox_padding?: string;
	checkbox_input?: string;
	checkbox_content?: string;

	collapse?: string;
	collapse_sized?: string;
	collapse_view?: string;
	collapse_alert?: string;
	collapse_visible?: string;
	collapse_content?: string;

	column?: string;
	column_padded?: string;
	column_content?: string;
	column_control?: string;

	control_group?: string;

	dialog_container?: string;
	dialog_body?: string;
	dialog_footer?: string;
	dialog_fadein?: string;
	dialog_fadeout?: string;

	dropdown?: string;
	dropdown_expansion?: string;
	dropdown_scroll_area?: string;
	dropdown_content?: string;
	dropdown_item?: string;
	dropdown_item_active?: string;

	flex_space?: string;

	heading?: string;

	label?: string;

	link?: string;

	nav_list?: string;
	nav_list_item?: string;
	nav_list_item_current?: string;

	notification_host?: string;
	notification_area?: string;
	notification?: string;
	notification_raw?: string;
	notification_default?: string;
	notification_info?: string;
	notification_success?: string;
	notification_warning?: string;
	notification_danger?: string;

	page?: string;
	page_scrollbar_comp?: string;
	page_content_col?: string;
	page_content?: string;

	popover?: string;
	popover_spike_area?: string;
	popover_scroll_area?: string;
	popover_spike?: string;
	popover_content?: string;

	radio_buttons?: string;
	radio_button_label?: string;
	radio_button_padding?: string;
	radio_button_input?: string;
	radio_button_content?: string;

	row?: string;
	row_content?: string;
	row_control?: string;

	scroll_view?: string;
	scroll_view_area?: string;
	scroll_view_content?: string;
	scroll_view_indicator_start?: string;
	scroll_view_indicator_end?: string;
	scroll_view_indicator_visible?: string;

	slider_host?: string;

	tab_handle?: string;
	tab_handle_current?: string;
	tab_list?: string;
	tab_list_padded?: string;
	tab_panel?: string;
	tab_panel_padded?: string;

	text_input?: string;

	text?: string;

	validation_message?: string;
	validation_message_container?: string;

	value?: string;
}
