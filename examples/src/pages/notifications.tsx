import { Button, DialogBody, DialogFooter, Heading, Row, showDialog, showNotification, Text } from "@rvx/ui";
import { LoremIpsum } from "../common";

export default function() {
	return <>
		<Heading level="1">Notifications</Heading>
		<Row>
			<NotificationTypes />

			<Button action={() => {
				showDialog<void>(dialog => {
					return <DialogBody title="Example" inlineSize="20rem">
						<Row>
							<NotificationTypes />
						</Row>
						<DialogFooter>
							<Button action={() => dialog.resolve()}>Close</Button>
						</DialogFooter>
					</DialogBody>;
				});
			}}>
				Dialog
			</Button>
		</Row>
	</>;
}

function NotificationTypes() {
	return <>
		<Button action={() => {
			showNotification(() => <>
				<Text>Hello World!</Text>
			</>, { timeout: 3000 });
		}}>With Timeout</Button>

		<Button action={() => {
			showNotification(notification => <>
				<LoremIpsum />
				<Row>
					<Button variant="success" action={notification.dispose}>Dismiss</Button>
				</Row>
			</>, { variant: "success" });
		}}>Custom Handling</Button>
	</>;
}
