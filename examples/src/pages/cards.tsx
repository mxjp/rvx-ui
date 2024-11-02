import { Button, Card, Collapse, Heading, Link, Row, Text } from "@rvx/ui";
import { sig } from "rvx";

export default function() {
	const visible = sig(false);

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

		<Heading level="2">Collapses</Heading>
		<Card>
			<Text>
				<Link action={() => { visible.value = !visible.value; }}>
					Click me!
				</Link>
			</Text>
			<Collapse visible={visible}>
				<Text>
					Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi ut cursus augue, in ornare metus. Maecenas vulputate tristique arcu. Morbi rhoncus massa sed facilisis interdum. Vestibulum efficitur id neque in suscipit...
				</Text>
			</Collapse>
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
