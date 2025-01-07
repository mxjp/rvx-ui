import { $, Signal, teardown, watchUpdates } from "rvx";
import { validatorFor } from "../components/validation.js";

/**
 * Create a signal that debounces input changes.
 *
 * This supports validation.
 *
 * @example
 * ```tsx
 * <TextInput value={someSignal.pipe(debounce, 500)} />
 * ```
 */
export function debounce<T>(source: Signal<T>, delay: number): Signal<T> {
	const input = $(source.value);
	let timer: number | undefined;

	watchUpdates(input, value => {
		clearTimeout(timer);
		if (source.value !== value) {
			timer = (setTimeout as typeof window.setTimeout)(() => {
				source.value = value;
			}, delay);
			teardown(() => {
				clearTimeout(timer);
			});
		}
	});

	watchUpdates(source, value => {
		input.value = value;
	});

	validatorFor(source)?.attach(input);
	return input;
}
