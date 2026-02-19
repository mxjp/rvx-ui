import { Button, Column, DialogBody, DialogContent, DialogFooter, Group, Heading, Label, Row, showDialog, Text, TextInput, Value, WithAction } from "@rvx/ui";
import { $ } from "rvx";
import { debounce, trim } from "rvx/convert";

export default function () {
	const defaultText = "Hello World!";

	const text = $(defaultText);
	const enterAction = $("Press enter...");

	return <Column>
		<Heading level="1">Text Inputs</Heading>
		<Group>
			<Row>
				<Group>
					<Label>Trimmed</Label>
					<TextInput value={text.pipe(trim)} />
				</Group>
				<Group>
					<Label>Trimmed & Debounced</Label>
					<TextInput value={text.pipe(trim).pipe(debounce, 300)} />
				</Group>
			</Row>
			<Text>
				You typed "<Value style={{ "white-space": "pre-wrap" }}>{text}</Value>"
			</Text>
			<Row>
				<Button disabled={() => text.value === defaultText} action={() => { text.value = defaultText }}>Reset</Button>
			</Row>
		</Group>

		<Heading level="2">States</Heading>
		<Row>
			<Group>
				<Label>Readonly</Label>
				<TextInput value="Hello World!" />
			</Group>
			<Group>
				<Label>Disabled</Label>
				<TextInput value="Hello World!" disabled />
			</Group>
		</Row>

		<Heading level="2">Enter action</Heading>
		<Row>
			<WithAction action={() => {
				showDialog<void>(dialog => {
					return <DialogBody title="Message">
						<DialogContent>
							<Text>
								You typed <Value style={{ "white-space": "pre-wrap" }}>{enterAction.value}</Value>.
							</Text>
						</DialogContent>
						<DialogFooter>
							<Button action={() => dialog.resolve()}>Close</Button>
						</DialogFooter>
					</DialogBody>;
				});
			}}>
				<TextInput value={enterAction} />
			</WithAction>
		</Row>

		<Heading level="2">Multiline</Heading>
		<TextInput multiline value={$("This is a\nmultiline input...")} rows={10} style={{ resize: "vertical" }} />
	</Column>;
}
