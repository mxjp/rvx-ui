import "../env.js";

import { strictEqual } from "node:assert";
import test from "node:test";

import { capture, sig } from "@mxjp/gluon";
import { setPending } from "@mxjp/gluon/async";

import { getCheckboxLabel, isCheckboxChecked, isCheckboxDisabled, isCheckboxReadonly, toggleCheckbox } from "../../src/components/checkbox-test.js";
import { Checkbox } from "../../src/index.js";
import { themeClass } from "../../src/test.js";
import { assertClass, keydown, testFn, text } from "../common.js";

await test("components/checkbox", async ctx => {
	function checkbox(elem: HTMLElement): HTMLElement {
		return elem.querySelector(`:scope > .${themeClass("checkbox")}`)!;
	}

	await ctx.test("defaults", testFn(() => {
		const elem = <Checkbox>Hello World!</Checkbox> as HTMLElement;
		strictEqual(isCheckboxChecked(elem), undefined);
		strictEqual(isCheckboxReadonly(elem), true);
		strictEqual(isCheckboxDisabled(elem), false);

		strictEqual(checkbox(elem).id.length > 0, true);
		strictEqual(checkbox(elem).role, "checkbox");
		strictEqual(checkbox(elem).getAttribute("aria-checked"), "mixed");
		strictEqual(checkbox(elem).getAttribute("aria-invalid"), null);
		strictEqual(checkbox(elem).getAttribute("aria-errormessage"), null);
		strictEqual(checkbox(elem).hasAttribute("autofocus"), false);
		strictEqual(checkbox(elem).tabIndex, 0);
		strictEqual(text(getCheckboxLabel(elem)), "Hello World!");
		strictEqual(getCheckboxLabel(elem).getAttribute("for"), checkbox(elem).id);

		const stop = capture(setPending);
		strictEqual(isCheckboxDisabled(elem), true);
		stop();
		strictEqual(isCheckboxDisabled(elem), false);
	}));

	await ctx.test("props", testFn(() => {
		const value = sig<boolean | undefined>(false);
		const disabled = sig(false);
		const elem = <Checkbox
			value={value}
			disabled={disabled}
			class={["foo", "bar"]}
			style={{ color: "red" }}
			autofocus
		>Hello World!</Checkbox> as HTMLElement;
		strictEqual(isCheckboxChecked(elem), false);
		strictEqual(isCheckboxReadonly(elem), false);
		strictEqual(isCheckboxDisabled(elem), false);

		strictEqual(checkbox(elem).hasAttribute("autofocus"), true);
		assertClass(elem, [themeClass("checkbox_container"), "foo", "bar"]);
		strictEqual(elem.style.color, "red");

		disabled.value = true;
		strictEqual(isCheckboxDisabled(elem), true);
		disabled.value = false;
		strictEqual(isCheckboxDisabled(elem), false);

		value.value = true;
		strictEqual(isCheckboxChecked(elem), true);
		strictEqual(text(checkbox(elem)), "icon:checkbox_checked");
		value.value = undefined;
		strictEqual(isCheckboxChecked(elem), undefined);
		strictEqual(text(checkbox(elem)), "icon:checkbox_mixed");
		value.value = false;
		strictEqual(isCheckboxChecked(elem), false);
		strictEqual(text(checkbox(elem)), "icon:checkbox_unchecked");
	}));

	await ctx.test("toggle", testFn(() => {
		const value = sig<boolean | undefined>(undefined);
		const elem = <Checkbox value={value}>Hello World!</Checkbox> as HTMLElement;
		for (const toggle of [
			() => elem.click(),
			() => keydown(elem, { key: " " }),
			() => toggleCheckbox(elem),
		]) {
			value.value = undefined;
			strictEqual(isCheckboxChecked(elem), undefined);
			for (const expected of [true, false, true]) {
				toggle();
				strictEqual(value.value, expected);
				strictEqual(isCheckboxChecked(elem), expected);
			}
		}
	}));

	await ctx.test("readonly", testFn(() => {
		for (const value of [undefined, false, true]) {
			const elem = <Checkbox value={value}>Hello World!</Checkbox> as HTMLElement;
			strictEqual(isCheckboxReadonly(elem), true);
			strictEqual(isCheckboxChecked(elem), value);
		}
	}));
});
