import { Button, captureOverlayContext, Dropdown, DropdownItem, Heading, Link, NavBar, NavBarContent, NavBarItem, Page, PLACEHOLDER, RootLayer, ScrollView, Text, watchTheme } from "@rvx/ui";
import { $, Context, mount, Show } from "rvx";
import { Async, Tasks, TASKS } from "rvx/async";
import { ComponentRoute, HashRouter, ROUTER, Routes } from "rvx/router";
import { THEME } from "./common";
import styles from "./main.module.css";

mount(
	document.body,
	<RootLayer>
		{() => Context.inject([
			TASKS.with(new Tasks()),
			ROUTER.with(new HashRouter()),
			PLACEHOLDER.with(() => <>Please Wait</>),
		], () => {
			watchTheme(THEME);
			captureOverlayContext();

			const routes: ComponentRoute[] = [];
			// const links: unknown[] = [];
			const pages = import.meta.glob("./pages/*.tsx");

			const links: DropdownItem[] = [];

			TASKS.inject(undefined, () => {
				for (const key in pages) {
					const name = key.slice(8, -4);
					const path = `/${name}`;

					links.push({
						label: name,
						action: () => {
							ROUTER.current!.push(path);
						},
						selected: () => ROUTER.current?.path === path,
					});

					routes.push({
						match: path,
						content: () => <Async source={pages[key]}>
							{(module: any) => <Page inlineSize="50rem">
								<module.default />
							</Page>}
						</Async>,
					});
				}
			});

			const headerButton = $(false);

			return <div class={styles.app}>
				<NavBar class={styles.bar}
					inlineSize="50rem"
					start={<>
						<Dropdown
							anchor={props => <NavBarItem {...props} current>Examples</NavBarItem>}
							items={links}
							alignment="start"
						/>
						<NavBarItem href="https://example.com" target="_blank">example.com</NavBarItem>
					</>}
					center={<NavBarContent>
						<Link action={() => { headerButton.value = !headerButton.value }}>
							Center Content
						</Link>
					</NavBarContent>}
					end={<NavBarContent>
						<Show when={headerButton} else={() => <Text>End Content</Text>}>
							{() => <Button>End Content</Button>}
						</Show>
					</NavBarContent>}
				/>
				<ScrollView class={styles.content} scrollbarComp>
					<Routes routes={[
						...routes,
						{ content: () => <Page inlineSize="20rem" centerBlock>
							<Heading level="1">404</Heading>
						</Page> }
					]} />
				</ScrollView>
			</div>;
		})}
	</RootLayer>
)
