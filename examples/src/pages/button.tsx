import { Button, Heading, Row } from "@mxjp/gluon-ux";

export default function() {
	return <>
		<Heading level="1">Buttons</Heading>
		<Row size="control">
			<Button>Default</Button>
			<Button variant="input">Input</Button>
			<Button variant="success">Success</Button>
			<Button variant="primary">Primary</Button>
			<Button variant="warning">Warning</Button>
			<Button variant="danger">Danger</Button>
		</Row>

		<Heading level="2">Async Actions</Heading>
		<Row>
			<Button action={() => new Promise(r => setTimeout(r, 3000))}>Wait for 2 seconds</Button>
		</Row>
	</>;
}
