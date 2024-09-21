import { Emitter, sig } from "@mxjp/gluon";
import { Button, Collapse, Column, Heading, Row, Text } from "@mxjp/gluon-ux";

export default function() {
	const collapse = sig(false);
	const collapseAlert = new Emitter<[]>();

	return <Column>
		<Heading level="1">Collapses</Heading>
		<Row size="control">
			<Button action={() => { collapse.value = !collapse.value }}>Toggle</Button>
			<Button action={() => collapseAlert.emit()} variant="warning">Alert</Button>
		</Row>
		<Collapse visible={collapse}>
			<Text>Hello World!</Text>
		</Collapse>
		<Collapse visible alert={collapseAlert.event}>
			<Text>This is always visible.</Text>
		</Collapse>
	</Column>;
}
