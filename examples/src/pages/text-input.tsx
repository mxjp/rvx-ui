import { Button, Column, DialogBody, DialogContent, DialogFooter, Group, Heading, LabelFor, Row, showDialog, Text, TextInput, Value } from "@rvx/ui";
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
				<LabelFor label="Trimmed">
					{id => {
						return <TextInput id={id} value={text.pipe(trim)} />;
					}}
				</LabelFor>
				<LabelFor label="Trimmed & Debounced">
					{id => {
						return <TextInput id={id} value={text.pipe(trim).pipe(debounce, 300)} />;
					}}
				</LabelFor>
			</Row>
			<Text>
				You typed "<Value style={{ "white-space": "pre-wrap" }}>{text}</Value>"
			</Text>
			<Row>
				<Button disabled={() => text.value === defaultText} action={() => { text.value = defaultText }}>Reset</Button>
			</Row>
		</Group>

		<Heading level="2">States</Heading>
		<Group>
			<Row>
				<LabelFor label="Readonly">
					{id => <TextInput id={id} value="Hello World!" />}
				</LabelFor>
				<LabelFor label="Disabled">
					{id => <TextInput id={id} value="Hello World!" disabled />}
				</LabelFor>
			</Row>
		</Group>

		<Heading level="2">Enter action</Heading>
		<Row>
			<TextInput value={enterAction} enterAction={() => {
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
			}} />
		</Row>

		<Heading level="2">Multiline</Heading>
		<TextInput multiline value={$("This is a\nmultiline input...")} rows={10} style={{ resize: "vertical" }} />
	</Column>;
}
