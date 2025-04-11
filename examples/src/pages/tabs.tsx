import { Card, Heading, Tabs } from "@rvx/ui";

export default function() {
	return <>
		<Heading level="1">Tabs</Heading>

		<Card unpadded>
			<Tabs padded tabs={[
				{
					label: "Foo",
					content: () => <>Content A</>,
				},
				{
					label: "Bar",
					content: () => <>Content B</>,
				},
			]} />
		</Card>
	</>;
}
