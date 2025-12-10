import { Button, Card, Collapse, Group, Heading, Link, Row, Separated, Text } from "@rvx/ui";
import { $ } from "rvx";
import { LoremIpsum } from "../common";

export default function () {
	const visible = $(false);
	const innerVisible = $(false);

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
		<Card raw>
			<Separated>
				<Group padded>
					<Text>
						<Link action={() => { visible.value = !visible.value; }}>
							Click me!
						</Link>
					</Text>
				</Group>
				<Collapse visible={visible}>
					<Group padded>
						<LoremIpsum />
						<Row>
							<Button action={() => { innerVisible.value = !innerVisible.value; }}>
								Toggle Second Collapse
							</Button>
						</Row>
					</Group>
				</Collapse>
				<Collapse visible={innerVisible}>
					<Group padded>
						<LoremIpsum limit={120} />
					</Group>
				</Collapse>
			</Separated>
		</Card>

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
		</Group>
	</>;
}
