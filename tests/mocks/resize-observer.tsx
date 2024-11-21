import { ENV } from "rvx";

const RESIZE_EVENT = "resize-observer-mock:resize";

class ResizeObserverMock {
	#targets: EventTarget[] = [];
	#callback: ResizeObserverCallback;

	constructor(callback: ResizeObserverCallback) {
		this.#callback = callback;
	}

	#resizeListener = (event: Event): void => {
		// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
		this.#callback((event as CustomEvent).detail as ResizeObserverEntry[], this as any);
	};

	observe(target: EventTarget): void {
		target.addEventListener(RESIZE_EVENT, this.#resizeListener);
		this.#targets.push(target);
	}

	disconnect(): void {
		for (const target of this.#targets) {
			target.removeEventListener(RESIZE_EVENT, this.#resizeListener);
		}
		this.#targets.length = 0;
	}
}

export function mockResizeObservers(): void {
	// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
	globalThis.ResizeObserver = ResizeObserverMock as any;
}

export function resize(target: EventTarget, entries: ResizeObserverEntry[]): void {
	target.dispatchEvent(new ENV.current.CustomEvent(RESIZE_EVENT, { detail: entries }));
}

export function borderBoxEntry(...boxes: readonly ResizeObserverSize[]): ResizeObserverEntry {
	return { borderBoxSize: boxes } as ResizeObserverEntry;
}
