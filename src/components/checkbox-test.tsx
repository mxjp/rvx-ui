import { ENV } from "rvx";
import { themeClass } from "../common/theme-test.js";

function assertCheckbox(checkbox: Element): asserts checkbox is HTMLElement {
	if (!checkbox.matches(`.${themeClass("checkbox_label")}`)) {
		throw new Error("checkbox must be a checkbox root element.");
	}
}

function getInput(checkbox: HTMLElement): HTMLInputElement {
	return checkbox.querySelector("input")!;
}

export function isCheckboxChecked(checkbox: Element): boolean | undefined {
	assertCheckbox(checkbox);
	const input = getInput(checkbox);
	return input.indeterminate ? undefined : input.checked;
}

export function toggleCheckbox(checkbox: Element, checked?: boolean): void {
	assertCheckbox(checkbox);
	const input = getInput(checkbox);
	if (input.disabled) {
		return;
	}
	checked ??= !input.checked;
	input.indeterminate = false;
	input.checked = checked;
	input.dispatchEvent(new ENV.current.CustomEvent("input"));
}

export function getCheckboxContent(checkbox: Element): HTMLElement {
	assertCheckbox(checkbox);
	return checkbox.querySelector(`.${themeClass("checkbox_content")}`) as HTMLElement;
}
