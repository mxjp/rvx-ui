import { Context, ContextState } from "rvx";

let overlayContext: ContextState<unknown>[] | undefined;

export function captureOverlayContext() {
	overlayContext = Context.capture();
}

export function inOverlayContext<F extends (...args: any) => any>(fn: F, ...args: Parameters<F>): ReturnType<F> {
	if (!overlayContext) {
		captureOverlayContext();
	}
	return Context.window(overlayContext!, fn, ...args);
}
