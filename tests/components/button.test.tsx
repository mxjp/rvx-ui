import { Button } from "@rvx/ui";
import test, { suite } from "node:test";
import { assertEvents, keydown, testFn } from "../common.js";

await suite("components/button", async () => {
	await test("action", testFn(() => {
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
