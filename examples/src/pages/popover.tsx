import { Button, Collapse, Group, Heading, Link, PopoutAlignment, PopoutPlacement, Popover, Row, Separated, Text } from "@rvx/ui";
import { $ } from "rvx";
import { LoremIpsum, PopoutControls } from "../common.js";

export default function () {
	const placement = $<PopoutPlacement | undefined>(undefined);
	const alignment = $<PopoutAlignment | undefined>(undefined);

	return <>
		<Heading level="1">Popovers</Heading>
		<PopoutControls placement={placement} defaultPlacement="block end" alignment={alignment} defaultAlignment="center" />

		<Row>
			<Popover
				anchor={props => <Button {...props}>Generic Usage</Button>}
				placement={placement}
				alignment={alignment}
				maxInlineSize="32rem"
			>
				{() => <Group>
					<Heading level="2">Hello World!</Heading>
					<LoremIpsum />
					<Row>
						<Popover
							anchor={props => <Button {...props} autofocus>Toggle nested popover</Button>}
							placement={placement}
							alignment={alignment}
							maxInlineSize="32rem"
						>
							{({ popout }) => <>
								<Text>
									Hello World!
								</Text>
								<Row>
									<Button variant="success" action={() => popout.hide()}>Close</Button>
								</Row>
							</>}
						</Popover>
					</Row>
				</Group>}
			</Popover>
			<Popover
				raw
				anchor={props => <Button {...props}>Raw Popover</Button>}
				placement={placement}
				alignment={alignment}
				maxInlineSize="32rem"
			>
				{() => {
					const visible = $(false);
					return <Separated>
						<Group padded>
							<Text>Group A</Text>
							<Row>
								<Button action={() => { visible.value = !visible.value; }}>Toggle Collapse</Button>
							</Row>
						</Group>
						<Collapse visible={visible}>
							<Group padded>
								<Text>Group A</Text>
							</Group>
						</Collapse>
					</Separated>;
				}}
			</Popover>
		</Row>
		<Text>
			This is a <Popover
				anchor={props => <Link {...props}>popover<br />anchor</Link>}
				placement={placement}
				alignment={alignment}
				maxInlineSize="32rem"
			>
				{() => <Group>
					<Heading level="2">Hello World!</Heading>
				</Group>}
			</Popover> with line breaks.
		</Text>
	</>;
}
