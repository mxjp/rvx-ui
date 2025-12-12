import { Button, Column, DialogBody, DialogContent, DialogFooter, Group, Heading, LAYER, RadioButtons, Row, ScrollView, showDialog, TabList, Tabs, Text } from "@rvx/ui";
import { $ } from "rvx";
import { LoremIpsum } from "../common";

export default function () {
	return <>
		<Heading level="1">Dialogs</Heading>
		<Group>
			<Row>
				<Button action={showExampleDialog}>Show Dialog</Button>
				<Button action={showScrollableDialog}>Scrollable</Button>
				<Button action={showTabsDialog}>With Tabs</Button>
			</Row>
		</Group>
	</>;
}

function showExampleDialog() {
	showDialog<number>(dialog => {
		LAYER.current?.useHotkey("enter", () => {
			dialog.resolve(77);
		});
		return <DialogBody title="Example Dialog" description="This is an accessible example dialog." inlineSize="35rem">
			<DialogContent>
				<Row>
					<Button autofocus action={() => {
						showDialog<void>(dialog => {
							return <DialogBody title="Nested dialog">
								<DialogContent>
									<RadioButtons autofocus value={$(7)} options={[
										{ value: 42, label: "Autofocused radio buttons" },
										{ value: 123, label: "..." },
									]} />
								</DialogContent>
								<DialogFooter>
									<Button action={() => dialog.resolve()}>Close</Button>
								</DialogFooter>
							</DialogBody>;
						});
					}}>Open Nested Dialog</Button>
				</Row>

				<Heading level="3">Text Blocks</Heading>
				<Group>
					<Text>
						The text below is here to demonstrate the dialog's size limitation.
					</Text>
					<LoremIpsum />
				</Group>
			</DialogContent>
			<DialogFooter>
				<Button action={() => dialog.reject()}>Cancel</Button>
				<Button action={() => dialog.resolve(42)} variant="primary">Ok</Button>
			</DialogFooter>
		</DialogBody>;
	}).then(value => {
		console.log("Dialog result:", value);
	}, () => {
		console.log("Dialog was cancelled.");
	});
}

function showScrollableDialog() {
	showDialog(dialog => {
		return <DialogBody title="Scrollable Dialog" blockSize="40rem" inlineSize="32rem">
			<ScrollView style={{ "min-block-size": "12rem" }}>
				<DialogContent>
					<Heading level="3">Some Content</Heading>
					<LoremIpsum />
					<Heading level="3">Some Content</Heading>
					<LoremIpsum />
				</DialogContent>
			</ScrollView>
			<DialogFooter>
				<Button action={() => dialog.resolve()}>Close</Button>
			</DialogFooter>
		</DialogBody>;
	});
}

function showTabsDialog() {
	showDialog(dialog => {
		return <DialogBody title="Tab Dialog" blockSize="40rem" inlineSize="32rem">
			<Tabs
				tabs={[
					{
						label: () => <>Foo</>,
						content: () => <Column>
							<Heading level="3">Some Content</Heading>
							<LoremIpsum />
							<Heading level="3">Some Content</Heading>
							<LoremIpsum />
						</Column>
					},
					{
						label: () => <>Bar</>,
						content: () => <Column>
							<Heading level="3">Something else</Heading>
							<LoremIpsum />
						</Column>
					},
				]}
				list={props => <TabList {...props} padded />}
				content={content => <ScrollView style={{ "min-block-size": "12rem" }}>
					<DialogContent>
						{content()}
					</DialogContent>
				</ScrollView>}
			/>
			<DialogFooter>
				<Button action={() => dialog.resolve()}>Close</Button>
			</DialogFooter>
		</DialogBody>;
	});
}
