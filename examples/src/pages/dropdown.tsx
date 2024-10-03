import { sig } from "@mxjp/gluon";
import { Button, Column, Dropdown, DropdownInput, DropdownItem, Heading, PopoutAlignment, PopoutPlacement, Row, Text, Value } from "@mxjp/gluon-ux";
import { PopoutControls } from "../common.js";

export default function() {
	const option = sig("bar");

	const placement = sig<PopoutPlacement | undefined>(undefined);
	const alignment = sig<PopoutAlignment | undefined>(undefined);

	return <>
		<Heading level="1">Dropdowns</Heading>
		<PopoutControls placement={placement} defaultPlacement="block end" alignment={alignment} defaultAlignment="start" />

		<Row>
			<Dropdown
				anchor={props => <Button {...props}>Toggle dropdown</Button>}
				items={[
					{ label: "Noop" },
					{ label: "Infinite nesting", children: function children(): DropdownItem[] {
						return [
							{ label: "Item A", children: children },
							{ label: "Item B", children: children },
							{ label: "Item C", children: children },
						];
					} },
					{ label: "Dropdown item action", action: () => {
						console.log("Hello World!");
					} },
					{ label: "Many nested items", children: Array(200).fill(0).map((_, index) => {
						return { label: `Nested item ${index}` };
					}) },
				]}
				placement={placement}
				alignment={alignment}
			/>
		</Row>

		<Heading level="2">Inputs</Heading>
		<Row>
			<Column>
				<DropdownInput<string>
					value={option}
					values={[
						{ value: "foo", label: "Foo" },
						{ value: "bar", label: "Bar" },
						{ value: "baz", label: "Baz" },
					]}
					placement={placement}
					alignment={alignment}
				/>
				<Text>Selected value: <Value>{option}</Value></Text>
			</Column>
		</Row>
	</>;
}
