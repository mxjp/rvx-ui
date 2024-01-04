import { JSDOM } from "jsdom";

const dom = new JSDOM(`
	<!DOCTYPE html>
	<html lang="en">
		<head>
			<meta charset="UTF-8">
			<title>gluon-ux!</title>
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
	"Comment",
	"DocumentFragment",
]) {
	// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
	(globalThis as any)[key] = dom.window[key];
}
