import { Signal } from "rvx";
import { Column, LabelFor, PopoutAlignment, PopoutPlacement, RadioButtons, Row } from "@rvx/ui";

export function PopoutControls(props: {
	placement: Signal<PopoutPlacement | undefined>;
	defaultPlacement: unknown;
	alignment: Signal<PopoutAlignment | undefined>;
	defaultAlignment: unknown;
}) {
	return <Row>
		<Column>
			<LabelFor label="Placement">
				{id => <RadioButtons<PopoutPlacement | undefined> value={props.placement} id={id} options={[
					{ value: undefined, label: <>Default ({props.defaultPlacement})</> },
					{ value: "block", label: "Block" },
					{ value: "block-start", label: "Block start" },
					{ value: "block-end", label: "Block end" },
					{ value: "inline", label: "Inline" },
					{ value: "inline-start", label: "Inline start" },
					{ value: "inline-end", label: "Inline end" },
				]} />}
			</LabelFor>
		</Column>
		<Column>
			<LabelFor label="Alignment">
				{id => <RadioButtons<PopoutAlignment | undefined> value={props.alignment} id={id} options={[
					{ value: undefined, label: <>Default ({props.defaultAlignment})</> },
					{ value: "start", label: "Start" },
					{ value: "center", label: "Center" },
					{ value: "end", label: "End" },
				]} />}
			</LabelFor>
		</Column>
	</Row>;
}
