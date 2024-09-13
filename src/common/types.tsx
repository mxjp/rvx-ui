import { Expression, map } from "@mxjp/gluon";

export type SizeContext = "content" | "control";

export type AriaLive = "off" | "polite" | "assertive";
export type AriaRelevant = "additions" | "removals" | "text" | "all" | "additions removals" | "additions text" | "removals text";

/**
 * Utility to map expressions of strings or string arrays to (e.g. space) separated strings.
 *
 * @example
 * ```tsx
 * <a rel={separated(["noreferrer", "author"], " ")} />;
 * ```
 */
export function separated(input: Expression<string | string[] | undefined>, sep: string): Expression<string | undefined> {
	return map(input, v => {
		if (Array.isArray(v)) {
			return v.join(sep);
		}
		return v;
	});
}
