import { Button, Card, Checkbox, Collapse2, Group, Heading, Row, Text } from "@rvx/ui";
import { $, Emitter, Show } from "rvx";

export default function() {
	const content = $<string | undefined>(undefined);
	const alert = new Emitter<[]>();

	const nestedInner = $(true);
	const nestedOuter = $(true);

	const fadeinShow = $(false);
	const fadeinVisible = $(true);
	const fadein = $(true);

	return <>
		<Heading level="1">Collapses</Heading>
		<Group>
			<Row>
				<Button action={() => { content.value = undefined }}>Hide</Button>
				<Button action={() => { content.value = "A" }}>A</Button>
				<Button action={() => { content.value = "B" }}>B</Button>
			</Row>
			<Collapse2 visible={content} alert={alert.event}>
				{value =>{
					return <Card>
						<Heading level="2">Content {value}</Heading>
						<Row>
							<Button action={() => alert.emit()}>Alert</Button>
						</Row>
					</Card>
				}}
			</Collapse2>
		</Group>

		<Heading level="2">Nesting</Heading>
		<Group>
			<Row>
				<Checkbox checked={nestedOuter}>Outer</Checkbox>
				<Checkbox checked={nestedInner}>Inner</Checkbox>
			</Row>
			<Collapse2 visible={nestedOuter}>
				{() => <Group>
					<Card>
						<Text>Outer</Text>
					</Card>
					<Collapse2 visible={nestedInner}>
						{() => <Card>
							<Text>Inner</Text>
						</Card>}
					</Collapse2>
					<Card>
						<Text>Outer</Text>
					</Card>
				</Group>}
			</Collapse2>
		</Group>

		<Heading level="2">Fadein</Heading>
		<Group>
			<Row size="group">
				<Checkbox checked={fadeinShow}>
					Render
				</Checkbox>
				<Checkbox checked={fadein}>
					Enable Fadein
				</Checkbox>
				<Checkbox checked={fadeinVisible}>
					Visible
				</Checkbox>
			</Row>
			<Show when={fadeinShow}>
				{() => <Collapse2 visible={fadeinVisible} fadein={fadein}>
					{() => <Card>
						<Text>Fadein</Text>
					</Card>}
				</Collapse2>}
			</Show>
		</Group>
	</>;
}
