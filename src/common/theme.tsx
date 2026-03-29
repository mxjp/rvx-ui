import { $, Expression, teardown, watch } from "rvx";
import { useAbortSignal } from "rvx/async";

export type Theme = "dark" | "light";

export function watchTheme(value?: Expression<Theme | undefined>) {
	const theme = $<Theme>(undefined!);

	watch(value, expr => {
		if (expr === undefined) {
			const dark = window.matchMedia("(prefers-color-scheme: dark)");
			const update = () => {
				theme.value = dark.matches ? "dark" : "light";
			};
			dark.addEventListener("change", update, { signal: useAbortSignal() });
			update();
		} else {
			theme.value = expr;
		}
	});

	watch(theme, theme => {
		const className = `rvx-${theme}`;
		document.body.classList.add(className);
		teardown(() => {
			document.body.classList.remove(className);
		});
	});
}
