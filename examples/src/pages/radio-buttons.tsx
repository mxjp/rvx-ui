import { sig } from "rvx";
import { Heading, RadioButtons, Text, Value } from "@rvx/ui";

export default function() {
	const option = sig("bar");

	return <>
		<Heading level="1">Radio Buttons</Heading>
		<RadioButtons value={option} options={[
			{ value: "foo", label: "Foo" },
			{ value: "bar", label: "Bar" },
			{ value: "baz", label: "Baz" },
		]} />
		<Text>
			Selected value: <Value>{option}</Value>
		</Text>

		<Heading level="2">Unselected</Heading>
		<RadioButtons value={sig(undefined)} options={[
			{ value: "foo", label: "Foo" },
			{ value: "bar", label: "Bar" },
		]} />

		<Heading level="2">States</Heading>
		<RadioButtons value="foo" options={[
			{ value: "foo", label: "Readonly" },
		]} />
		<RadioButtons value={sig("foo")} disabled options={[
			{ value: "foo", label: "Disabled" },
		]} />
	</>;
}
