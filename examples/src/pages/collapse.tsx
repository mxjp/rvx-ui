import { Button, Collapse, Heading, Row, Text } from "@rvx/ui";
import { $ } from "rvx";
import { Emitter } from "rvx/event";

export default function() {
	const collapse = $(false);
	const collapseAlert = new Emitter<[]>();

	return <>
		<Heading level="1">Collapses</Heading>
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

		<Heading level="2">Flex Layout</Heading>
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
	</>;
}
