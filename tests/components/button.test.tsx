import "../env.js";

import { deepStrictEqual, strictEqual } from "node:assert";
import test from "node:test";

import { capture, inject, setPending, sig, TASKS, Tasks } from "@mxjp/gluon";

import { Button, ButtonType, ButtonVariant, THEME } from "../../src/index.js";
import { assertClass, future, testTheme } from "../common.js";

await test("button", async ctx => {
	await ctx.test("types", () => {
		const type = sig<ButtonType | undefined>(undefined);
		const button = <Button type={type} /> as HTMLButtonElement;
		strictEqual(button.type, "button");
		type.value = "submit";
		strictEqual(button.type, "submit");
		type.value = "button";
		strictEqual(button.type, "button");
	});

	await ctx.test("variants", () => {
		inject(THEME, testTheme, () => {
			const variant = sig<ButtonVariant | undefined>(undefined);
			const button = <Button variant={variant} /> as HTMLButtonElement;
			assertClass(button, ["t_button", "t_button_default"]);
			variant.value = "primary";
			assertClass(button, ["t_button", "t_button_primary"]);
			variant.value = undefined;
			assertClass(button, ["t_button", "t_button_default"]);
		});
	});

	await ctx.test("disabled", () => {
		inject(TASKS, new Tasks(), () => {
			const disabled = sig(true);
			const dispose = capture(setPending);
			strictEqual((<Button /> as HTMLButtonElement).disabled, true);
			const a = <Button disabled={disabled} /> as HTMLButtonElement;
			strictEqual(a.disabled, true);
			disabled.value = false;
			strictEqual(a.disabled, true);
			dispose();
			strictEqual((<Button /> as HTMLButtonElement).disabled, false);
			strictEqual(a.disabled, false);
			disabled.value = true;
			strictEqual(a.disabled, true);
		});
	});

	await ctx.test("action (plain)", () => {
		const events: unknown[] = [];
		const button = <Button action={event => {
			events.push(event);
		}} /> as HTMLButtonElement;
		button.addEventListener("click", event => {
			events.push(event);
		});
		const event = new MouseEvent("click", { bubbles: true, cancelable: true });
		button.dispatchEvent(event);
		deepStrictEqual(events, [event]);
		strictEqual(event.defaultPrevented, true);
	});

	await ctx.test("action (unconsumed)", () => {
		const events: unknown[] = [];
		const button = <Button action={event => {
			events.push(event);
			return false;
		}} /> as HTMLButtonElement;
		button.addEventListener("click", event => {
			events.push(event);
		});
		const event = new MouseEvent("click", { bubbles: true, cancelable: true });
		button.dispatchEvent(event);
		deepStrictEqual(events, [event, event]);
		strictEqual(event.defaultPrevented, false);
	});

	await ctx.test("action (async)", async () => {
		const events: unknown[] = [];
		const [promise, resolve] = future();
		const tasks = new Tasks();
		const button = inject(TASKS, tasks, () => <Button action={event => {
			events.push(event);
			return promise;
		}} /> as HTMLButtonElement);
		button.addEventListener("click", event => {
			events.push(event);
		});
		const event = new MouseEvent("click", { bubbles: true, cancelable: true });
		button.dispatchEvent(event);
		deepStrictEqual(events, [event]);
		strictEqual(event.defaultPrevented, true);
		strictEqual(tasks.pending, true);
		resolve();
		await Promise.resolve();
		strictEqual(tasks.pending, false);
	});
});
