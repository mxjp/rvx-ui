import "../env.js";

import { strictEqual } from "node:assert";
import test from "node:test";

import { Button } from "../../src/index.js";
import { themeClass } from "../../src/test.js";
import { assertClass, assertEvents, keydown, testFn, text } from "../common.js";

await test("components/button", async ctx => {
	await ctx.test("defaults", testFn(() => {
		const elem = <Button /> as HTMLButtonElement;
		strictEqual(elem instanceof HTMLButtonElement, true);
		strictEqual(elem.type, "button");
		strictEqual(elem.disabled, false);
		assertClass(elem, [themeClass("button"), themeClass("button_default")]);
		strictEqual(elem.id, "");
		strictEqual(elem.getAttribute("aria-expanded"), null);
		strictEqual(elem.getAttribute("aria-label"), null);
		strictEqual(elem.getAttribute("aria-labelledby"), null);
		strictEqual(elem.childNodes.length, 0);
	}));

	await ctx.test("props & content", testFn(() => {
		const elem = <Button
			type="submit"
			disabled
			class={["foo", "bar"]}
			style={{ color: "red" }}
			id="test"
			aria-expanded
			aria-label="label"
			aria-labelledby="labelId"
		>Click me!</Button> as HTMLButtonElement;
		strictEqual(elem.type, "submit");
		strictEqual(elem.disabled, true);
		assertClass(elem, [themeClass("button"), themeClass("button_default"), "foo", "bar"]);
		strictEqual(elem.style.color, "red");
		strictEqual(elem.id, "test");
		strictEqual(elem.getAttribute("aria-expanded"), "true");
		strictEqual(elem.getAttribute("aria-label"), "label");
		strictEqual(elem.getAttribute("aria-labelledby"), "labelId");
		strictEqual(text(elem), "Click me!");
	}));

	await ctx.test("action", testFn(() => {
		const events: unknown[] = [];
		const elem = <Button action={() => {
			events.push("action");
		}} /> as HTMLButtonElement;

		elem.click();
		assertEvents(events, ["action"]);

		keydown(elem, { key: "Enter" });
		assertEvents(events, ["action"]);

		keydown(elem, { key: " " });
		assertEvents(events, ["action"]);
	}));
});
