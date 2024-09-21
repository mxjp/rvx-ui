import { extract, sig, UseUniqueId } from "@mxjp/gluon";
import { Button, Column, DialogBody, DialogFooter, Heading, intParser, Label, LAYER, parse, Row, rule, showDialog, TextInput, trim, validate, ValidationMessages } from "@mxjp/gluon-ux";

export default function() {
	return <Column>
		<Heading level="1">Validation</Heading>
		<Row size="control">
			<Button action={showDialogExample}>Show dialog example</Button>
		</Row>
	</Column>;
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

		extract(LAYER)?.useHotkey("enter", ok);

		return <DialogBody title="Validation" description="This dialog demonstrates the validation API." inlineSize="min(100dvw, 25rem)">
			<UseUniqueId>
				{id => <>
					<Label for={id}>Name</Label>
					<TextInput
						id={id}
						value={name
							.pipe(rule, name => /^[a-z0-9]*$/i.test(name), <>The name must contain only characters and digits.</>)
							.pipe(rule, name => name.length >= 3, <>Enter a name of at least 3 characters.</>)
							.pipe(trim)
						}
					/>
				</>}
			</UseUniqueId>
			<ValidationMessages for={name} />

			<UseUniqueId>
				{id => <>
					<Label for={id}>Network Port</Label>
					<TextInput
						id={id}
						value={port
							.pipe(parse, intParser({
								format: <>Enter a valid port.</>,
								range: <>The port must be between 1 and {0xFFFF}</>,
								testRange: port => port >= 1 && port <= 0xFFFF,
							}))
							.pipe(trim)
						}
					/>
				</>}
			</UseUniqueId>
			<ValidationMessages for={port} />

			<DialogFooter>
				<Button action={() => dialog.reject()}>Cancel</Button>
				<Button action={ok} variant="primary">Ok</Button>
			</DialogFooter>
		</DialogBody>;
	});
}
