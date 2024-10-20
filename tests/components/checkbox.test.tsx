import { Checkbox } from "@rvx/ui";
import { getCheckboxContent, isCheckboxChecked, toggleCheckbox } from "@rvx/ui/test";
import { strictEqual } from "node:assert";
import test, { suite } from "node:test";
import { sig } from "rvx";
import { testFn, text } from "../common.js";

await suite("components/checkbox", async () => {
	await test("checked", testFn(() => {
		const value = sig<boolean | undefined>(undefined);
		const checkbox = <Checkbox checked={value}>Hello World!</Checkbox> as Element;
		const content = getCheckboxContent(checkbox);
		strictEqual(text(content), "Hello World!");

		strictEqual(isCheckboxChecked(checkbox), undefined);
		strictEqual(value.value, undefined);

		toggleCheckbox(checkbox);
		strictEqual(isCheckboxChecked(checkbox), true);
		strictEqual(value.value, true);

		toggleCheckbox(checkbox);
		strictEqual(isCheckboxChecked(checkbox), false);
		strictEqual(value.value, false);

		toggleCheckbox(checkbox);
		strictEqual(isCheckboxChecked(checkbox), true);
		strictEqual(value.value, true);

		value.value = undefined;
		strictEqual(isCheckboxChecked(checkbox), undefined);
		value.value = false;
		strictEqual(isCheckboxChecked(checkbox), false);
		value.value = true;
		strictEqual(isCheckboxChecked(checkbox), true);
		value.value = undefined;
		value.value = true;
		strictEqual(isCheckboxChecked(checkbox), true);
	}));

	await test("readonly checked", testFn(() => {
		const checkbox = <Checkbox checked /> as Element;
		strictEqual(isCheckboxChecked(checkbox), true);
	}));

	await test("readonly unchecked", testFn(() => {
		const checkbox = <Checkbox checked={false} /> as Element;
		strictEqual(isCheckboxChecked(checkbox), false);
	}));

	await test("readonly indeterminate", testFn(() => {
		const checkbox = <Checkbox /> as Element;
		strictEqual(isCheckboxChecked(checkbox), undefined);
	}));
});
