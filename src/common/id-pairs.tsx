import { Content, Context, uniqueId } from "rvx";

export class IdPair {
	#prefix: string | undefined;

	prefix() {
		this.#prefix = uniqueId();
		return this.#prefix;
	}

	consume(): string | undefined {
		const value = this.#prefix;
		this.#prefix = undefined;
		return value;
	}
}

export const ID_PAIR = new Context(new IdPair());

export function PairId(props: {
	children?: (id: string | undefined) => Content;
}): Content {
	const id = ID_PAIR.current.consume();
	return props.children?.(id);
}
