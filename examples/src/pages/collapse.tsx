import { Button, Card, Checkbox, Collapse, CollapseFor, CollapseItem, Column, Group, Heading, Row, Text } from "@rvx/ui";
import { $, Emitter, Show } from "rvx";

export default function() {
	const content = $<string | undefined>(undefined);
	const alert = new Emitter<[]>();

	const nestedInner = $(true);
	const nestedOuter = $(true);

	const fadeinShow = $(false);
	const fadeinVisible = $(true);
	const fadein = $(true);

	const list = $<CollapseItem<{ foo: number }>[]>([]);

	return <>
		<Heading level="1">Collapses</Heading>
		<Group>
			<Row>
				<Button action={() => { content.value = undefined }}>Hide</Button>
				<Button action={() => { content.value = "A" }}>A</Button>
				<Button action={() => { content.value = "B" }}>B</Button>
			</Row>
			<Collapse visible={content} alert={alert.event}>
				{value =>{
					return <Card>
						<Heading level="2">Content {value}</Heading>
						<Row>
							<Button action={() => alert.emit()}>Alert</Button>
						</Row>
					</Card>
				}}
			</Collapse>
		</Group>

		<Heading level="2">Nesting</Heading>
		<Group>
			<Row>
				<Checkbox checked={nestedOuter}>Outer</Checkbox>
				<Checkbox checked={nestedInner}>Inner</Checkbox>
			</Row>
			<Collapse visible={nestedOuter}>
				{() => <Group>
					<Card>
						<Text>Outer</Text>
					</Card>
					<Collapse visible={nestedInner}>
						{() => <Card>
							<Text>Inner</Text>
						</Card>}
					</Collapse>
					<Card>
						<Text>Outer</Text>
					</Card>
				</Group>}
			</Collapse>
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
				{() => <Collapse visible={fadeinVisible} fadein={fadein}>
					{() => <Card>
						<Text>Fadein</Text>
					</Card>}
				</Collapse>}
			</Show>
		</Group>

		<Heading level="2">Lists</Heading>
		<Group>
			<Row>
				{[
					[],
					[1, 2, 3],
					[1, 3],
					[2],
				].map(values => {
					return <Button action={() => {
						list.value = values.map(v => ({ value: { foo: v } }));
					}}>{values.length === 0 ? <>Empty</> : values.join(", ")}</Button>
				})}
			</Row>
			<Column size="control">
				<CollapseFor each={list} eq={(a, b) => a.foo === b.foo}>
					{value => <Card raw>
						<Column padded size="control">
							{value.foo}
						</Column>
					</Card>}
				</CollapseFor>
			</Column>
		</Group>
	</>;
}
