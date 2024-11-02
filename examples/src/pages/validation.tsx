import { Button, DialogBody, DialogFooter, Heading, intParser, LabelFor, LAYER, parse, Row, rule, showDialog, TextInput, trim, validate, ValidationMessages } from "@rvx/ui";
import { sig } from "rvx";

export default function() {
	return <>
		<Heading level="1">Validation</Heading>
		<Row>
			<Button action={showDialogExample}>Show dialog example</Button>
		</Row>
	</>;
}

function showDialogExample() {
	showDialog(dialog => {
		const name = sig("");
		const port = sig(443);

		async function ok() {
			if (await validate(name, port)) {
				console.log("Ok:", name.value, port.value);
				dialog.resolve();
			}
		}

		LAYER.current?.useHotkey("enter", ok);

		return <DialogBody title="Validation" description="This dialog demonstrates the validation API." inlineSize="min(100dvw, 25rem)">
			<LabelFor label="Name">
				{id => <TextInput
					id={id}
					value={name
						.pipe(rule, name => /^[a-z0-9]*$/i.test(name), <>The name must contain only characters and digits.</>)
						.pipe(rule, name => name.length >= 3, <>Enter a name of at least 3 characters.</>)
						.pipe(trim)
					}
				/>}
			</LabelFor>
			<ValidationMessages for={name} />

			<LabelFor label="Network Port">
				{id => <TextInput
					id={id}
					value={port
						.pipe(parse, intParser({
							format: <>Enter a valid port.</>,
							range: <>The port must be between 1 and {0xFFFF}</>,
							testRange: port => port >= 1 && port <= 0xFFFF,
						}))
						.pipe(trim)
					}
				/>}
			</LabelFor>
			<ValidationMessages for={port} />

			<DialogFooter>
				<Button action={() => dialog.reject()}>Cancel</Button>
				<Button action={ok} variant="primary">Ok</Button>
			</DialogFooter>
		</DialogBody>;
	});
}
