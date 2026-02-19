import { coupleMinMax, Group, Heading, Label, Slider, sliderMarkers } from "@rvx/ui";
import { $ } from "rvx";

export default function() {
	const a = $(5);
	const b = $(1);
	const c = $(2);
	const d = $(5.55);

	const min = $(25);
	const mid = $(50);
	const max = $(75);

	coupleMinMax(min, mid);
	coupleMinMax(mid, max);

	return <>
		<Heading level="1">Sliders</Heading>
		<Slider value={a} min={0} max={10} step={1}>
			Current value: {a}
		</Slider>

		<Heading level="2">Markers</Heading>
		<Group>
			<Label>Uniform markers</Label>
			<Slider value={b} min={0} max={5} step={0.25} markers={sliderMarkers(0, 5, 0.25)}>
				Current value: {b}
			</Slider>
		</Group>
		<Group>
			<Label>Custom markers</Label>
			<Slider value={c} min={0} max={5} step={0.25} markers={[0, ...sliderMarkers(1, 4, 0.5), 5]}>
				Current value: {c}
			</Slider>
		</Group>

		<Heading level="2">Coupling</Heading>
		<Group>
			<Label>Min</Label>
			<Slider value={min} />
			<Label>Middle</Label>
			<Slider value={mid} />
			<Label>Max</Label>
			<Slider value={max} />
		</Group>

		<Heading level="2">Invalid initial values</Heading>
		<Slider value={d} min={0} max={10} step={2} markers={sliderMarkers(0, 10, 2)}>
			Current value: {d}
		</Slider>
	</>;
}
