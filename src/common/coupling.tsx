import { Expression, Signal, watch } from "rvx";

export function coupleMinMax<T extends number | bigint>(min: Expression<T>, max: Expression<T>) {
	if (min instanceof Signal) {
		watch(max, max => {
			if (min.value > max) {
				min.value = max;
			}
		});
	}
	if (max instanceof Signal) {
		watch(min, min => {
			if (max.value < min) {
				max.value = min;
			}
		});
	}
}
