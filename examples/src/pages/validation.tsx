import { Button, Heading, intParser, LabelFor, Row, rule, TextInput, validate, ValidationMessages } from "@rvx/ui";
import { $ } from "rvx";
import { trim } from "rvx/convert";

export default function() {
	const name = $("");
	const port = $(443);

	async function ok() {
		await validate([name, port]);
	}

	return <>
		<Heading level="1">Validation</Heading>

		<LabelFor label="Username">
			{id => <TextInput
				id={id}
				value={name
					.pipe(rule, name => /^[a-z0-9]*$/.test(name), () => <>The name must contain only letters and numbers.</>)
					.pipe(rule, name => name.length > 0, () => <>Enter a name.</>)
					.pipe(trim)
				}
			/>}
		</LabelFor>
		<ValidationMessages for={name} />

		<LabelFor label="Network Port">
			{id => <TextInput
				id={id}
				value={port
					.pipe(intParser, {
						format: () => <>Enter a valid port.</>,
						range: () => <>The port must range from 1 to {0xFFFF}.</>,
						min: 1,
						max: 0xFFFF,
					})
					.pipe(trim)
				}
			/>}
		</LabelFor>
		<ValidationMessages for={port} />

		<Row>
			<Button variant="primary" action={ok}>Validate</Button>
		</Row>
	</>;
}
