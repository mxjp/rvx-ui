import { Button, Card, Heading, Row, Text } from "@rvx/ui";

export default function() {
	return <>
		<Heading level="1">Cards</Heading>
		<Card>
			<Heading level="2">Hello World!</Heading>
			<Text>Some text content...</Text>
			<Row>
				<Button>Some</Button>
				<Button>Buttons</Button>
			</Row>
		</Card>

		<Heading level="2">Variants</Heading>
		<Card>
			<Text>Default</Text>
		</Card>
		<Card variant="info">
			<Text>Info</Text>
		</Card>
		<Card variant="success">
			<Text>Success</Text>
		</Card>
		<Card variant="warning">
			<Text>Warning</Text>
		</Card>
		<Card variant="danger">
			<Text>Danger</Text>
		</Card>
	</>;
}
