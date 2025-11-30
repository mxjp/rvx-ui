import { Button, DialogBody, DialogFooter, Group, Heading, Row, showDialog, showNotification, Text } from "@rvx/ui";
import { LoremIpsum } from "../common";

export default function() {
	return <>
		<Heading level="1">Notifications</Heading>
		<Group>
			<Row>
				<NotificationTypes />
				<Button action={() => {
					showDialog<void>(dialog => {
						return <DialogBody title="Example">
							<NotificationTypes />
							<DialogFooter>
								<Button action={() => dialog.resolve()}>Close</Button>
							</DialogFooter>
						</DialogBody>;
					});
				}}>
					Dialog
				</Button>
			</Row>
		</Group>
	</>;
}

function NotificationTypes() {
	return <Row>
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
	</Row>;
}
