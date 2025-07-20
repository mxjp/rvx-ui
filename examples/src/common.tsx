import { Column, LabelFor, PopoutAlignment, PopoutPlacement, RadioButtons, Row, Text } from "@rvx/ui";
import { Signal } from "rvx";

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

export function LoremIpsum() {
	return <Text>
		Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi ut cursus augue, in ornare metus. Maecenas vulputate tristique arcu. Morbi rhoncus massa sed facilisis interdum. Vestibulum efficitur id neque in suscipit. Aenean sagittis turpis nec pharetra vehicula. Integer quis semper purus, a commodo justo. Proin at quam sit amet lectus vulputate sodales sed a metus. Suspendisse eleifend sit amet urna non consequat. Aenean non lectus viverra, laoreet tortor sit amet, eleifend enim. Fusce at consequat augue, vitae porttitor nisi. Nullam tincidunt vel quam nec rutrum. Pellentesque nec tincidunt quam. Aliquam volutpat elit sem, quis porttitor risus cursus a. Sed a nunc risus. Nam porta tincidunt libero, quis pretium turpis.
	</Text>;
}
