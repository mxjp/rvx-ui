import { onTeardownLeak } from "rvx/test";
import { JSDOM } from "jsdom";

const dom = new JSDOM(`
	<!DOCTYPE html>
	<html lang="en">
		<head>
			<meta charset="UTF-8">
			<title>rvx-ui!</title>
		</head>
		<body></body>
	</html>
`);

for (const key of [
	"window",
	"document",
	"Range",
	"Node",
	"MouseEvent",
	"KeyboardEvent",
	"CustomEvent",
	"Comment",
	"DocumentFragment",
	"HTMLDivElement",
	"HTMLButtonElement",
	"HTMLInputElement",
]) {
	// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
	(globalThis as any)[key] = dom.window[key];
}

onTeardownLeak(() => {
	throw new Error("teardown leak");
});
