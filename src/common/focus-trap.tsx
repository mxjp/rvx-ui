import { teardown, TeardownHook } from "rvx";

function visible(node: Element) {
	return node.getClientRects().length > 0;
}

const SUMMARY = ":scope>summary";

function filter(node: Element): number {
	type Input = HTMLInputElement;
	if (node instanceof HTMLElement) {
		if (node.inert) {
			return NodeFilter.FILTER_REJECT;
		}
		if (
			(
				node.tabIndex < 0
				&& !node.hasAttribute("tabindex")
				&& !node.hasAttribute("contenteditable")
				&& !(node.tagName === "DETAILS" && !node.querySelector(SUMMARY))
				&& !(node.tagName === "SUMMARY" && node.parentElement!.querySelector(SUMMARY) === node)
			) || (node as Input).disabled
		) {
			return NodeFilter.FILTER_SKIP;
		}
		if (node instanceof HTMLInputElement && node.type === "radio" && !node.checked) {
			for (const other of document.getElementsByName(node.name)) {
				if (other instanceof HTMLInputElement && !other.disabled && other.checked && visible(other)) {
					return NodeFilter.FILTER_SKIP;
				}
			}
		}
		if (visible(node)) {
			return NodeFilter.FILTER_ACCEPT;
		}
	} else if ((node as HTMLElement).tabIndex >= 0 && visible(node)) {
		return NodeFilter.FILTER_ACCEPT;
	}
	return NodeFilter.FILTER_SKIP;
}

function createWalker(root: Node) {
	return document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT, filter as NodeFilter);
}

function enable() {
	const walker = createWalker(document.body);

	let lastActive: Element | null = null;
	const onWindowFocusIn = () => { lastActive = document.activeElement };
	window.addEventListener("focusin", onWindowFocusIn, { passive: true });

	const delegateFocus = (dir: boolean) => {
		if (!lastActive || lastActive === document.body || lastActive === document.documentElement) {
			dir = !dir;
		}
		walker.currentNode = dir ? prefix : suffix;
		const target = dir ? walker.nextNode() : walker.previousNode();
		if (target !== prefix && target !== suffix) {
			(target as HTMLElement | null)?.focus();
		}
	};

	const createSentinel = (dir: boolean) => {
		const node = document.createElement("div");
		node.tabIndex = 0;
		node.style.all = "unset";
		node.addEventListener("focusin", () => delegateFocus(dir), { passive: true });
		return node;
	};

	const prefix = createSentinel(false);
	const suffix = createSentinel(true);
	const observer = new MutationObserver(() => {
		if (document.body.firstElementChild !== prefix) {
			document.body.prepend(prefix);
		}
		if (document.body.lastElementChild !== suffix) {
			document.body.append(suffix);
		}
	});
	observer.observe(document.body, { childList: true });

	return () => {
		observer.disconnect();
		prefix.remove();
		suffix.remove();
		window.removeEventListener("focusin", onWindowFocusIn);
	};
}

let current: TeardownHook | undefined;
let enabled = 0;

export function useGlobalFocusTrap() {
	let disposed = false;
	teardown(() => {
		if (!disposed) {
			disposed = true;
			enabled--;
			if (enabled === 0) {
				current!();
				current = undefined;
			}
		}
	});
	enabled++;
	if (!current) {
		current = enable();
	}
}
