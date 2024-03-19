import { themeClass } from "../test.js";

function assertCheckbox(checkbox: Element): HTMLElement {
	if (!checkbox.matches(`.${themeClass("checkbox_container")}`)) {
		throw new Error("checkbox must be a checkbox root element.");
	}
	return checkbox.querySelector(`:scope > .${themeClass("checkbox")}`)!;
}

/**
 * Get the label element of a checkbox.
 */
export function getCheckboxLabel(checkbox: Element): HTMLLabelElement {
	assertCheckbox(checkbox);
	return checkbox.querySelector<HTMLLabelElement>(`:scope > .${themeClass("checkbox_label")}`)!;
}

/**
 * Get if a checkbox is checked.
 *
 * @returns Undefined if the value is mixed or a boolean otherwise.
 */
export function isCheckboxChecked(checkbox: Element): boolean | undefined {
	const value = assertCheckbox(checkbox).getAttribute("aria-checked");
	return value === "mixed" ? undefined : (value === "true");
}

/**
 * Get if a checkbox is readonly.
 */
export function isCheckboxReadonly(checkbox: Element): boolean {
	return assertCheckbox(checkbox).getAttribute("aria-readonly") === "true";
}

/**
 * Get if a checkbox is disabled.
 */
export function isCheckboxDisabled(checkbox: Element): boolean {
	return assertCheckbox(checkbox).getAttribute("aria-disabled") === "true";
}

/**
 * Toggle a checkbox.
 *
 * @param value The value to set the checkbox to. By default, the checkbox is toggled (checked when previously mixed).
 */
export function toggleCheckbox(checkbox: Element, value?: boolean): void {
	const main = assertCheckbox(checkbox);
	const current = isCheckboxChecked(checkbox);
	value ??= !current;
	if (current !== value) {
		main.click();
	}
}
