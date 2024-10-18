import { extract, sig } from "rvx";
import { Button, Column, DialogBody, DialogFooter, Heading, LAYER, RadioButtons, Row, showDialog, Text } from "@rvx/ui";

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
		extract(LAYER)?.useHotkey("enter", () => {
			dialog.resolve(77);
		});
		return <DialogBody title="Example Dialog" description="This is an accessible example dialog." maxInlineSize="35rem">
			<Row>
				<Button autofocus action={() => {
					showDialog<void>(dialog => {
						return <DialogBody title="Nested dialog" description="This is a dialog in a dialog.">
							<RadioButtons autofocus value={sig(7)} options={[
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
			<Text>
				Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi ut cursus augue, in ornare metus. Maecenas vulputate tristique arcu. Morbi rhoncus massa sed facilisis interdum. Vestibulum efficitur id neque in suscipit. Aenean sagittis turpis nec pharetra vehicula. Integer quis semper purus, a commodo justo. Proin at quam sit amet lectus vulputate sodales sed a metus. Suspendisse eleifend sit amet urna non consequat. Aenean non lectus viverra, laoreet tortor sit amet, eleifend enim. Fusce at consequat augue, vitae porttitor nisi. Nullam tincidunt vel quam nec rutrum. Pellentesque nec tincidunt quam. Aliquam volutpat elit sem, quis porttitor risus cursus a. Sed a nunc risus. Nam porta tincidunt libero, quis pretium turpis.
			</Text>
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
