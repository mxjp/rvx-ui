import { Button, Column, ControlGroup, DialogBody, DialogFooter, Heading, LabelFor, Row, showDialog, Text, TextInput, trim, Value } from "@rvx/ui";
import { sig } from "rvx";

export default function() {
	const defaultText = "Hello World!";

	const text = sig(defaultText);
	const enterAction = sig("Press enter...");

	return <Column>
		<Heading level="1">Text Inputs</Heading>
		<Row>
			<ControlGroup>
				<TextInput value={text.pipe(trim)} />
				<Button disabled={() => text.value === defaultText} action={() => { text.value = defaultText }}>Reset</Button>
			</ControlGroup>
		</Row>
		<Text>
			You typed "<Value style={{ "white-space": "pre-wrap" }}>{text}</Value>"
		</Text>

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
		<TextInput multiline value={sig("This is a\nmultiline input...")} rows={10} style={{ resize: "vertical" }} />
	</Column>;
}
