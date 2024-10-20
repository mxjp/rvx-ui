import { THEME, Theme } from "@rvx/ui";
import { deepStrictEqual } from "node:assert";
import { Context } from "rvx";
import { TASKS, Tasks } from "rvx/async";
import { AsyncTestContext, runAsyncTest, runTest } from "rvx/test";

export const testTheme: Theme = new Proxy({}, {
	get(_target, prop, _recv) {
		return `t_${String(prop)}`;
	},
});

export function assertEvents(events: unknown[], expected: unknown[]): void {
	deepStrictEqual(events, expected);
	events.length = 0;
}

export function text(node: Node): string {
	if (node instanceof Comment) {
		return "";
	}
	return (node.textContent ?? "").trim();
}

export function assertClass(elem: HTMLElement, classes: string[]): void {
	deepStrictEqual(Array.from(elem.classList).sort(), Array.from(classes).sort());
}

type ResolveFn<T> = (value: T | PromiseLike<T>) => void;
type RejectFn = (error: unknown | void | PromiseLike<unknown | void>) => void;

export function future<T = void>(): [Promise<T>, ResolveFn<T>, RejectFn] {
	let resolve!: ResolveFn<T>;
	let reject!: RejectFn;
	const promise = new Promise<T>((res, rej) => {
		resolve = res;
		reject = rej;
	});
	return [promise, resolve, reject];
}

function setupTestContext(ctx: Context): void {
	ctx.set(TASKS, new Tasks());
	ctx.set(THEME, Object.create(testTheme) as Theme);
}

export function testFn(fn: (ctx: Context) => void): () => void {
	return () => {
		return runTest(ctx => {
			setupTestContext(ctx);
			fn(ctx);
		});
	};
}

export function asyncTestFn(fn: (ctx: AsyncTestContext) => Promise<void>): () => Promise<void> {
	return () => {
		return runAsyncTest(async ctx => {
			setupTestContext(ctx.ctx);
			await fn(ctx);
		});
	};
}

export function keydown(target: EventTarget, init: KeyboardEventInit): void {
	target.dispatchEvent(new KeyboardEvent("keydown", {
		bubbles: true,
		...init,
	}));
}
