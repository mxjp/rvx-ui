import { JSDOM } from "jsdom";
import { ENV, onLeak } from "rvx";

ENV.default = new JSDOM().window as any;

onLeak(() => {
	throw new Error("teardown leak");
});
