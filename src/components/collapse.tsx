import { $, ClassValue, Expression, get, map, optionalString, StyleValue, teardown } from "rvx";
import { Event } from "rvx/event";
import { THEME } from "../common/theme.js";
import { AriaLive, AriaRelevant } from "../common/types.js";

export function Collapse(props: {
	visible?: Expression<boolean | undefined>;
	alert?: Event<[]>;
	children?: unknown;
	class?: ClassValue;
	style?: StyleValue;
	id?: Expression<string | undefined>;
	"aria-live"?: Expression<AriaLive | undefined>;
	"aria-relevant"?: Expression<AriaRelevant | undefined>;
	"aria-atomic"?: Expression<boolean | undefined>;
}): unknown {
	const theme = THEME.current;
	const visible = map(props.visible, v => v ?? false);
	const alert = $(false);
	const size = $<number | undefined>(undefined);

	const content = <div class={theme?.collapse_content}>
		{props.children}
	</div> as HTMLDivElement;

	const observer = new ResizeObserver(entries => {
		const entry = entries[entries.length - 1];
		const boxSize = entry?.borderBoxSize[entry.borderBoxSize.length - 1];
		if (boxSize) {
			size.value = boxSize.blockSize;
		}
	});

	observer.observe(content);
	teardown(() => {
		observer.disconnect();
	});

	props.alert?.(() => {
		if (get(visible)) {
			alert.value = false;
			// Force a reflow:
			void root.offsetWidth;
			alert.value = true;
		}
	});

	const root = <div
		inert={map(visible, v => !v)}
		class={[
			theme?.collapse,
			() => size.value === undefined ? undefined : theme?.collapse_sized,
			() => alert.value ? theme?.collapse_alert : undefined,
			map(visible, v => v ? theme?.collapse_visible : undefined),
			props.class,
		]}
		style={[
			{
				"--collapse-size": () => size.value === undefined ? undefined : `${size.value}px`,
			},
			props.style,
		]}
		id={props.id}
		aria-live={map(props["aria-live"], v => v ?? "polite")}
		aria-relevant={props["aria-relevant"]}
		aria-atomic={optionalString(props["aria-atomic"])}
	>
		{theme?.collapse_view
			? <div class={theme.collapse_view}>
				{content}
			</div>
			: content}
	</div> as HTMLDivElement;
	return root;
}
