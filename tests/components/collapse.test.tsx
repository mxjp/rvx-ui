import { Collapse, THEME } from "@rvx/ui";
import { getCollapseContent, isCollapseVisible, themeClass } from "@rvx/ui/test";
import { strictEqual } from "node:assert";
import test, { suite } from "node:test";
import { Emitter, sig } from "rvx";
import { assertClass, assertEvents, testFn, text } from "../common.js";
import { borderBoxEntry, mockResizeObservers, resize } from "../mocks/resize-observer.js";

mockResizeObservers();

await suite("components/collapse", async () => {
	await test("resizing", testFn(() => {
		const elem = <Collapse>Hello World!</Collapse> as HTMLDivElement;
		strictEqual(isCollapseVisible(elem), false);
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

	await test("no intermediate view element", testFn(ctx => {
		// eslint-disable-next-line camelcase
		ctx.get(THEME)!.collapse_view = undefined;
		const elem = <Collapse>Hello World!</Collapse> as HTMLDivElement;
		const content = getCollapseContent(elem);
		strictEqual(content?.parentNode, elem);
		strictEqual(text(content), "Hello World!");
	}));

	await test("visibility", testFn(() => {
		const visible = sig(false);
		const elem = <Collapse visible={visible} /> as HTMLDivElement;
		assertClass(elem, [themeClass("collapse")]);
		strictEqual(isCollapseVisible(elem), false);

		visible.value = true;
		assertClass(elem, [themeClass("collapse"), themeClass("collapse_visible")]);
		strictEqual(isCollapseVisible(elem), true);

		visible.value = false;
		assertClass(elem, [themeClass("collapse")]);
		strictEqual(isCollapseVisible(elem), false);
	}));

	await test("alert", testFn(() => {
		const events: unknown[] = [];
		const visible = sig(false);
		const alert = new Emitter<[]>();
		const elem = <Collapse visible={visible} alert={alert.event} /> as HTMLDivElement;

		Object.defineProperty(elem, "offsetWidth", {
			get() {
				events.push("reflow");
			},
		});

		assertClass(elem, [themeClass("collapse")]);

		alert.emit();
		assertClass(elem, [themeClass("collapse")]);
		assertEvents(events, []);

		visible.value = true;
		assertClass(elem, [themeClass("collapse"), themeClass("collapse_visible")]);
		assertEvents(events, []);

		for (let i = 0; i < 2; i++) {
			alert.emit();
			assertClass(elem, [themeClass("collapse"), themeClass("collapse_visible"), themeClass("collapse_alert")]);
			assertEvents(events, ["reflow"]);
		}
	}));
});
