import { Card, Heading, Tabs } from "@rvx/ui";

export default function() {
	return <>
		<Heading level="1">Tabs</Heading>
		<Tabs tabs={[
			{
				label: "Foo",
				content: () => <>Content A</>,
			},
			{
				label: "Bar",
				content: () => <>Content B</>,
			},
		]} />

		<Heading level="2">Cards</Heading>
		<Card raw>
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
