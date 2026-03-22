import { $, capture, teardown, watch } from "rvx";
import { TASKS } from "rvx/async";

export function trackLoading(tasks = TASKS.current): () => boolean {
	if (tasks === undefined || !tasks.selfPending) {
		return () => false;
	}
	const loading = $(true);
	const dispose = capture(() => {
		watch(() => tasks.selfPending, value => {
			if (!value) {
				loading.value = false;
				dispose();
			}
		});
	});
	teardown(dispose);
	return () => loading.value;
}
