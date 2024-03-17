import "../env.js";

import { strictEqual } from "node:assert";
import test from "node:test";

import { Emitter, sig } from "@mxjp/gluon";

import { Collapse, THEME } from "../../src/index.js";
import { getCollapseContent, isCollapseVisible } from "../../src/test.js";
import { assertClass, assertEvents, testFn, text } from "../common.js";
import { borderBoxEntry, mockResizeObservers, resize } from "../mocks/resize-observer.js";

mockResizeObservers();

await test("components/collapse", async ctx => {
	await ctx.test("defaults & resizing", testFn(() => {
		const elem = <Collapse>Hello World!</Collapse> as HTMLDivElement;
		strictEqual(isCollapseVisible(elem), false);
		strictEqual(elem.hasAttribute("inert"), true);
		strictEqual(elem.id, "");
		strictEqual(elem.getAttribute("aria-live"), "polite");
		strictEqual(elem.getAttribute("aria-relevant"), null);
		strictEqual(elem.getAttribute("aria-atomic"), null);
		const view = elem.querySelector(".t_collapse_view");
		strictEqual(view?.parentNode, elem);
		const content = getCollapseContent(elem);
		strictEqual(content?.parentNode, view);
		strictEqual(text(content), "Hello World!");

		resize(content, [
			borderBoxEntry({ blockSize: 1, inlineSize: 2 }),
			borderBoxEntry({ blockSize: 3, inlineSize: 4 }, { blockSize: 42, inlineSize: 77 }),
		]);
		strictEqual(elem.style.getPropertyValue("--collapse-size"), "42px");

		resize(content, [
			borderBoxEntry({ blockSize: 123, inlineSize: 456 }),
		]);
		strictEqual(elem.style.getPropertyValue("--collapse-size"), "123px");
	}));

	await ctx.test("no intermediate view element", testFn(ctx => {
		// eslint-disable-next-line camelcase
		ctx.get(THEME)!.collapse_view = undefined;
		const elem = <Collapse>Hello World!</Collapse> as HTMLDivElement;
		const content = getCollapseContent(elem);
		strictEqual(content?.parentNode, elem);
		strictEqual(text(content), "Hello World!");
	}));

	await ctx.test("visibility", testFn(() => {
		const visible = sig(false);
		const elem = <Collapse visible={visible} /> as HTMLDivElement;
		assertClass(elem, ["t_collapse"]);
		strictEqual(isCollapseVisible(elem), false);

		visible.value = true;
		assertClass(elem, ["t_collapse", "t_collapse_visible"]);
		strictEqual(isCollapseVisible(elem), true);

		visible.value = false;
		assertClass(elem, ["t_collapse"]);
		strictEqual(isCollapseVisible(elem), false);
	}));

	await ctx.test("alert", testFn(() => {
		const events: unknown[] = [];
		const visible = sig(false);
		const alert = new Emitter<[]>();
		const elem = <Collapse visible={visible} alert={alert.event} /> as HTMLDivElement;

		Object.defineProperty(elem, "offsetWidth", {
			get() {
				events.push("reflow");
			},
		});

		assertClass(elem, ["t_collapse"]);

		alert.emit();
		assertClass(elem, ["t_collapse"]);
		assertEvents(events, []);

		visible.value = true;
		assertClass(elem, ["t_collapse", "t_collapse_visible"]);
		assertEvents(events, []);

		for (let i = 0; i < 2; i++) {
			alert.emit();
			assertClass(elem, ["t_collapse", "t_collapse_visible", "t_collapse_alert"]);
			assertEvents(events, ["reflow"]);
		}
	}));
});
