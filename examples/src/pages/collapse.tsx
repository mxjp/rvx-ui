import { Button, Card, Checkbox, Collapse, CollapseFor, CollapseItem, Column, Group, Heading, Row, Text } from "@rvx/ui";
import { $, Emitter, map, Show } from "rvx";

export default function() {
	const collapse = $(false);
	const collapseAlert = new Emitter<[]>();

	const render = $(false);
	const visible = $(true);
	const fadein = $(true);

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

		<Heading level="2">Flex Layout</Heading>
		<Group>
			<div style={{
				"outline": "1px dashed var(--accent)",
				"display": "flex",
				"flex-direction": "column",
			}}>
				<div>Above</div>
				<Collapse visible={collapse}>
					Hello World!
				</Collapse>
				<div>Below</div>
			</div>
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
					{value => <Card variant="info" raw>
						<Column padded size="control">
							{value}
						</Column>
					</Card>}
				</CollapseFor>
			</Column>
		</Group>
	</>;
}
