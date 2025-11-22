import { Button, Card, Collapse, Group, Heading, Link, Row, Text } from "@rvx/ui";
import { $ } from "rvx";
import { LoremIpsum } from "../common";

export default function() {
	const visible = $(false);

	return <>
		<Heading level="1">Cards</Heading>
		<Group>
			<Card>
				<Heading level="2">Hello World!</Heading>
				<Text>Some text content...</Text>
				<Row>
					<Button>Some</Button>
					<Button>Buttons</Button>
				</Row>
			</Card>
		</Group>

		<Heading level="2">Collapses</Heading>
		<Group>
			<Card>
				<Text>
					<Link action={() => { visible.value = !visible.value; }}>
						Click me!
					</Link>
				</Text>
				<Collapse visible={visible}>
					<LoremIpsum />
				</Collapse>
			</Card>
		</Group>

		<Heading level="2">Variants</Heading>
		<Group>
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
			<Card raw>
				<Text>Raw</Text>
			</Card>
		</Group>
	</>;
}
