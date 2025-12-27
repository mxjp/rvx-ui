import { Breadcrumbs, Button, Card, Checkbox, Column, ControlGroup, Group, LabelFor, RadioButtons, Row, Slider, sliderMarkers, Tabs, Text, TextInput } from "@rvx/ui";
import { $ } from "rvx";

export default function () {
	return <>
		<GenericControls />
		<Card raw>
			<Tabs
				tabs={[
					{
						label: () => <>Foo</>,
						content: GenericControls,
					},
					{
						label: () => <>Bar</>,
						content: () => <>Content B</>,
					},
				]}
				content={content => <Column padded>{content()}</Column>}
			/>
		</Card>
	</>;
}

function GenericControls() {
	return <>
		<Group>
			<Breadcrumbs items={[
				{ label: "Foo", action: () => {} },
				{ label: "Bar", action: () => {} },
				{ label: "Baz" },
			]} />

			<Row>
				<Button>Default</Button>
				<Button variant="input">Input</Button>
				<Button variant="success">Success</Button>
				<Button variant="primary">Primary</Button>
				<Button variant="warning">Warning</Button>
				<Button variant="danger">Danger</Button>
			</Row>
			<Row>
				<ControlGroup>
					<TextInput value={$("Hello World!")} />
					<TextInput value="Hello World!" disabled />
					<Button>...</Button>
				</ControlGroup>
			</Row>
			<ControlGroup column>
				<Button variant="item">Foo</Button>
				<Button variant="item">Bar</Button>
				<ControlGroup>
					<Button variant="item">Baz</Button>
					<TextInput value={$("...")} style={{ "flex-grow": "1" }} />
				</ControlGroup>
			</ControlGroup>
		</Group>

		<LabelFor label="Some Label">
			{id => <Slider id={id} min={0} max={10} value={$(3)} markers={sliderMarkers(0, 10, 1)}>
				<Text>
					Slider Content
				</Text>
			</Slider>}
		</LabelFor>

		<Row size="group">
			<Column size="control">
				<Checkbox disabled>Disabled Checkbox</Checkbox>
				<Checkbox checked>Readonly Checkbox</Checkbox>
				<Checkbox checked={$(true)}>Writable Checkbox</Checkbox>
			</Column>
			<RadioButtons value={$(1)} options={[
				{ label: "Foo", value: 0 },
				{ label: "Bar", value: 1 },
				{ label: "Baz", value: 2 },
			]} />
		</Row>

		<Row size="group">
			<Card style={{ "flex-grow": "1" }}>
				Default
			</Card>
			<Card variant="info">
				Info
			</Card>
			<Card variant="success">
				Success
			</Card>
			<Card variant="warning">
				Warning
			</Card>
			<Card variant="danger">
				Danger
			</Card>
		</Row>
	</>;
}
