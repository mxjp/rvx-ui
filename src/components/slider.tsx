import { Expression, map, Show, Signal, uniqueId } from "rvx";
import { THEME } from "../common/theme.js";

export function Slider(props: {
	id?: Expression<string | undefined>;
	value?: Expression<number | undefined>;
	min?: Expression<number | undefined>;
	max?: Expression<number | undefined>;
	step?: Expression<number | "any" | undefined>;
	markers?: Expression<number[] | undefined>;
	children?: unknown;
}) {
	const theme = THEME.current;
	const markerId = uniqueId();

	const input = <input
		id={props.id}
		type="range"
		min={map(props.min, min => min ?? 0)}
		max={map(props.max, max => max ?? 100)}
		step={map(props.step, step => step ?? 1)}
		prop:value={map(props.value, value => value ?? "0")}
		on:input={() => {
			if (props.value instanceof Signal) {
				props.value.value = Number(input.value);
			}
		}}
		list={map(props.markers, markers => markers ? markerId : undefined)}
	/> as HTMLInputElement;

	return <div
		class={theme?.slider_host}
	>
		{input}

		<Show when={props.markers}>
			{markers => <datalist id={markerId}>
				{markers.map(marker => <option value={marker} />)}
			</datalist>}
		</Show>

		{props.children}
	</div>;
}

export function sliderMarkers(min: number, max: number, step: number): number[] {
	if (min > max) {
		[min, max] = [max, min];
	}
	const markers: number[] = [];
	for (let i = min; i <= max; i += step) {
		markers.push(i > max ? max : i);
	}
	return markers;
}
