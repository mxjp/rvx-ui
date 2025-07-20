import { Button, DialogBody, DialogFooter, Heading, LAYER, RadioButtons, Row, showDialog, Text } from "@rvx/ui";
import { $ } from "rvx";
import { LoremIpsum } from "../common";

export default function() {
	return <>
		<Heading level="1">Dialogs</Heading>
		<Row>
			<Button action={showExampleDialog}>Show Dialog</Button>
		</Row>
	</>;
}

function showExampleDialog() {
	showDialog<number>(dialog => {
		LAYER.current?.useHotkey("enter", () => {
			dialog.resolve(77);
		});
		return <DialogBody title="Example Dialog" description="This is an accessible example dialog." inlineSize="35rem">
			<Row>
				<Button autofocus action={() => {
					showDialog<void>(dialog => {
						return <DialogBody title="Nested dialog" description="This is a dialog in a dialog.">
							<RadioButtons autofocus value={$(7)} options={[
								{ value: 42, label: "Autofocused radio buttons" },
								{ value: 123, label: "..." },
							]} />
							<DialogFooter>
								<Button action={() => dialog.resolve()}>Close</Button>
							</DialogFooter>
						</DialogBody>;
					});
				}}>
					Open Nested Dialog
				</Button>
			</Row>
			<Heading level="3">Text Blocks</Heading>
			<Text>
				The text below is here to demonstrate the dialog's size limitation.
			</Text>
			<LoremIpsum />
			<DialogFooter>
				<Button action={() => dialog.reject()}>Cancel</Button>
				<Button action={() => dialog.resolve(42)} variant="primary">Ok</Button>
			</DialogFooter>
		</DialogBody>;
	}).then(value => {
		console.log("Dialog result:", value);
	}, () => {
		console.log("Dialog was cancelled.");
	});
}
