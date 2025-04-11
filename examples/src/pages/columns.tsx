import { Button, Collapse, Column, Heading, Row, Text } from "@rvx/ui";
import { $ } from "rvx";

export default function() {
	const visible = $(false);

	const outline = "1px dashed var(--accent)";

	return <>
		<Heading level="1">Columns</Heading>

		<Heading level="2">Space Scaling</Heading>
		<Row>
			<Button action={() => { visible.value = !visible.value; }}>Toggle Collapses</Button>
		</Row>
		<Column style={{ outline }}>
			<Text>Collapse below</Text>
			<Collapse visible={visible}>
				<Text>Collapse</Text>
			</Collapse>
		</Column>
		<Column style={{ outline }}>
			<Collapse visible={visible}>
				<Text>Collapse</Text>
			</Collapse>
			<Text>Collapse above</Text>
		</Column>
		<Column style={{ outline }}>
			<Text>Collapse with custom space above</Text>
			<Collapse visible={visible} style={{ "--space-above": "3rem" }}>
				<Text>Collapse</Text>
			</Collapse>
		</Column>
		<Column style={{ outline }}>
			<Collapse visible={visible} style={{ "--space-below": "3rem" }}>
				<Text>Collapse</Text>
			</Collapse>
			<Text>Collapse with custom space below</Text>
		</Column>

		<Heading level="2">Element Specific Spacing</Heading>
		<Column style={{ outline }}>
			<Heading level="2">Heading</Heading>
			<Text>Automatic heading layout</Text>
			<Heading level="3">Heading</Heading>
			<Text>Automatic heading layout</Text>
		</Column>

		<Heading level="2">Padding</Heading>
		<Column style={{ outline }} padded>
			<Text>Content size</Text>
		</Column>
		<Column style={{ outline }} size="control" padded>
			<Text>Control size</Text>
		</Column>
	</>;
}
