import { Button, Heading, LabelFor, Row, TextInput, validate, ValidationMessages, Validator } from "@rvx/ui";
import { $ } from "rvx";

export default function() {
	const name = $("");

	async function ok() {
		await validate([name]);
	}

	return <>
		<Heading level="1">Validation</Heading>

		<LabelFor label="Name">
			{id => <TextInput
				id={id}
				value={name
					.pipe(source => {
						function IsEmpty() {
							return <>Enter a name.</>;
						}

						function InvalidChars() {
							return <>The name must contain only letters and numbers.</>;
						}

						Validator.get(source).prependRule(() => {
							if (source.value.length === 0) {
								return [IsEmpty];
							}
							if (/[^a-z0-9]/.test(source.value)) {
								return [InvalidChars];
							}
						});

						return source;
					})
				}
			/>}
		</LabelFor>
		<ValidationMessages for={name} />

		<Row>
			<Button variant="primary" action={ok}>Validate</Button>
		</Row>
	</>;
}
