import { deepStrictEqual } from "node:assert";

import { Theme } from "../src/index.js";

export const testTheme: Theme = new Proxy({}, {
	get(_target, prop, _recv) {
		return `t_${String(prop)}`;
	},
});

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
