import { Button, ControlGroup, Dropdown, DropdownInput, DropdownItem, Group, Heading, Label, PopoutAlignment, PopoutPlacement, Row, Text, Value } from "@rvx/ui";
import { $, Expression, render, Signal } from "rvx";
import { PopoutControls } from "../common.js";

export default function() {
	const option = $("bar");

	const placement = $<PopoutPlacement | undefined>(undefined);
	const alignment = $<PopoutAlignment | undefined>(undefined);

	return <>
		<Heading level="1">Dropdowns</Heading>
		<PopoutControls placement={placement} defaultPlacement="block end" alignment={alignment} defaultAlignment="start" />

		<Heading level="2">Custom Dropdowns</Heading>
		<Group>
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
		</Group>

		<Heading level="2">Inputs</Heading>
		<Row size="content">
			<Group>
				<Label>Default Anchor</Label>
				<DropdownInput
					value={option}
					values={[
						{ value: "foo", label: "Foo" },
						{ value: "bar", label: "Bar" },
						{ value: "baz", label: "Baz" },
					]}
					placement={placement}
					alignment={alignment}
				/>
			</Group>
			<Group>
				<Label>Custom Anchor</Label>
				<CustomAnchorExample value={option} placement={placement} alignment={alignment} />
			</Group>
		</Row>
		<Text>Selected value: <Value>{option}</Value></Text>
	</>;
}

function CustomAnchorExample(props: {
	value: Signal<string>;
	placement: Expression<PopoutPlacement | undefined>;
	alignment: Expression<PopoutAlignment | undefined>;
}) {
	const anchor = render(<ControlGroup>
		<DropdownInput
			value={props.value}
			anchorRect={() => anchor}
			values={[
				{ value: "foo", label: "Foo" },
				{ value: "bar", label: "Bar" },
				{ value: "baz", label: "Baz" },
			]}
			placement={props.placement}
			alignment={props.alignment}
		/>
		<Button>Some Button...</Button>
	</ControlGroup>);
	return anchor;
}
