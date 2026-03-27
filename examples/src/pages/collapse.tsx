import { Button, Card, Checkbox, Collapse, CollapseFor, CollapseItem, Column, Group, Heading, Row, Text } from "@rvx/ui";
import { $, Emitter, map, Show } from "rvx";

export default function() {
	const collapse = $(false);
	const collapseAlert = new Emitter<[]>();

	const render = $(false);
	const visible = $(true);
	const fadein = $(true);

	const inner = $(false);
	const outer = $(true);

	const list = $<CollapseItem<number>[]>([]);

	return <>
		<Heading level="1">Collapses</Heading>
		<Group>
			<Row>
				<Button action={() => { collapse.value = !collapse.value }}>Toggle</Button>
				<Button action={() => collapseAlert.emit()} variant="warning">Alert</Button>
			</Row>
			<Collapse visible={collapse}>
				<Text>Hello World!</Text>
			</Collapse>
			<Collapse visible alert={collapseAlert.event}>
				<Text>This is always visible.</Text>
			</Collapse>
		</Group>

		<Heading level="2">Initial Fade In</Heading>
		<Group>
			<Row>
				<Checkbox checked={render}>Render</Checkbox>
				<Checkbox checked={visible}>Visible</Checkbox>
				<Checkbox checked={fadein}>Fade In</Checkbox>
			</Row>
			<Show when={render}>
				{() => <Collapse visible={visible} fadein={fadein}>
					Fade in is currently {map(fadein, x => x ? "enabled" : "disabled")}.
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
						list.value = values.map(v => ({ value: v }));
					}}>{values.length === 0 ? <>Empty</> : values.join(", ")}</Button>
				})}
			</Row>
			<Column size="control">
				<CollapseFor each={list}>
					{value => <Card raw>
						<Column padded size="control">
							{value}
						</Column>
					</Card>}
				</CollapseFor>
			</Column>
		</Group>

		<Heading level="2">Nesting</Heading>
		<Group>
			<Row>
				<Button action={() => { inner.value = !inner.value; }}>Toggle Inner</Button>
				<Button action={() => { outer.value = !outer.value; }}>Toggle Outer</Button>
			</Row>
			<Collapse visible={outer}>
				<Group>
					<Card>Outer</Card>
					<Collapse visible={inner}>
						<Card>Inner</Card>
					</Collapse>
					<Card>Outer</Card>
				</Group>
			</Collapse>
			<Card>Content below...</Card>
		</Group>
	</>;
}
