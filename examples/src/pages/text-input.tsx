import { Button, Column, debounce, DialogBody, DialogFooter, Heading, LabelFor, Row, showDialog, Text, TextInput, trim, Value } from "@rvx/ui";
import { $ } from "rvx";

export default function() {
	const defaultText = "Hello World!";

	const text = $(defaultText);
	const enterAction = $("Press enter...");

	return <Column>
		<Heading level="1">Text Inputs</Heading>
		<Row>
			<Column>
				<LabelFor label="Trimmed">
					{id => {
						return <TextInput id={id} value={text.pipe(trim)} />;
					}}
				</LabelFor>
			</Column>
			<Column>
				<LabelFor label="Trimmed & Debounced">
					{id => {
						return <TextInput id={id} value={text.pipe(trim).pipe(debounce, 300)} />;
					}}
				</LabelFor>
			</Column>
		</Row>
		<Text>
			You typed "<Value style={{ "white-space": "pre-wrap" }}>{text}</Value>"
		</Text>
		<Row>
			<Button disabled={() => text.value === defaultText} action={() => { text.value = defaultText }}>Reset</Button>
		</Row>

		<Heading level="2">States</Heading>
		<Row>
			<Column>
				<LabelFor label="Readonly">
					{id => <TextInput id={id} value="Hello World!" />}
				</LabelFor>
			</Column>
			<Column>
				<LabelFor label="Disabled">
					{id => <TextInput id={id} value="Hello World!" disabled />}
				</LabelFor>
			</Column>
		</Row>

		<Heading level="2">Enter action</Heading>
		<Row>
			<TextInput value={enterAction} enterAction={() => {
				showDialog<void>(dialog => {
					return <DialogBody>
						<Heading level="2">Message</Heading>
						<Text>
						You typed "<Value style={{ "white-space": "pre-wrap" }}>{enterAction.value}</Value>"
						</Text>
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
