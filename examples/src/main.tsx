import { Heading, NavList, NavListButton, Page, RootLayer, ScrollView, THEME } from "@rvx/ui";
import theme from "@rvx/ui/dist/theme.module.css";
import { Context, mount } from "rvx";
import { Async, Tasks, TASKS } from "rvx/async";
import { ComponentRoute, HashRouter, ROUTER, Routes } from "rvx/router";
import "./styles.scss";

mount(
	document.body,
	<RootLayer>
		{() => Context.inject([
			THEME.with(theme),
			TASKS.with(new Tasks()),
			ROUTER.with(new HashRouter()),
		], () => {
			const routes: ComponentRoute[] = [];
			const links: unknown[] = [];
			const pages = import.meta.glob("./pages/*.tsx");

			TASKS.inject(undefined, () => {
				for (const key in pages) {
					const name = key.slice(8, -4);
					const path = `/${name}`;

					links.push(<NavListButton
						action={() => {
							ROUTER.current!.push(path);
						}}
						current={() => ROUTER.current?.path === path}
					>{name}</NavListButton>);

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

			return <div class="app">
				<ScrollView class="app-nav">
					<Page>
						<NavList>
							{links}
						</NavList>
					</Page>
				</ScrollView>
				<ScrollView>
					<Routes routes={[
						...routes,
						{ content: () => <Page inlineSize="20rem">
							<Heading level="1">404</Heading>
						</Page> }
					]} />
				</ScrollView>
			</div>;
		})}
	</RootLayer>
)
