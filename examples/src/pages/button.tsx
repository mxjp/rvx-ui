import { Button, Heading, Row, Text } from "@rvx/ui";
import { useAbortSignal } from "rvx/async";

export default function() {
	const abort = useAbortSignal();

	return <>
		<Heading level="1">Buttons</Heading>
		<Row size="control">
			<Button>Default</Button>
			<Button variant="input">Input</Button>
			<Button variant="success">Success</Button>
			<Button variant="primary">Primary</Button>
			<Button variant="warning">Warning</Button>
			<Button variant="danger">Danger</Button>
			<Button variant="text">Text</Button>
		</Row>

		<Heading level="2">Async Actions</Heading>
		<Row>
			<Button action={() => {
				return new Promise(r => {
					abort.addEventListener("abort", () => r());
					setTimeout(r, 3000);
				});
			}}>Wait for 3 seconds</Button>
		</Row>
		<Text>
			This async action can be aborted by navigating to another page.
		</Text>
	</>;
}
