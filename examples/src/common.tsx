import { Signal, UseUniqueId } from "@mxjp/gluon";
import { Column, Label, PopoutAlignment, PopoutPlacement, RadioButtons, Row } from "@mxjp/gluon-ux";

export function PopoutControls(props: {
	placement: Signal<PopoutPlacement | undefined>;
	defaultPlacement: unknown;
	alignment: Signal<PopoutAlignment | undefined>;
	defaultAlignment: unknown;
}) {
	return <Row>
		<UseUniqueId>
			{id => <Column>
				<Label for={id}>Placement</Label>
				<RadioButtons<PopoutPlacement | undefined> value={props.placement} id={id} options={[
					{ value: undefined, label: <>Default ({props.defaultPlacement})</> },
					{ value: "block", label: "Block" },
					{ value: "block-start", label: "Block start" },
					{ value: "block-end", label: "Block end" },
					{ value: "inline", label: "Inline" },
					{ value: "inline-start", label: "Inline start" },
					{ value: "inline-end", label: "Inline end" },
				]} />
			</Column>}
		</UseUniqueId>
		<UseUniqueId>
			{id => <Column>
				<Label>Alignment</Label>
				<RadioButtons<PopoutAlignment | undefined> value={props.alignment} id={id} options={[
					{ value: undefined, label: <>Default ({props.defaultAlignment})</> },
					{ value: "start", label: "Start" },
					{ value: "center", label: "Center" },
					{ value: "end", label: "End" },
				]} />
			</Column>}
		</UseUniqueId>
	</Row>;
}
