import { teardown } from "@mxjp/gluon";

/**
 * A CSS writing mode property value.
 */
export type WritingMode = "horizontal-tb" | "vertical-rl" | "vertical-lr" | "sideways-rl" | "sideways-lr";

/**
 * A CSS script direction property value.
 */
export type ScriptDirection = "ltr" | "rtl";

/** The up {@link Direction}. */
export const UP = 0;
/** The right {@link Direction}. */
export const RIGHT = 1;
/** The down {@link Direction}. */
export const DOWN = 2;
/** The left {@link Direction}. */
export const LEFT = 3;

/**
 * Represents a direction ({@link UP}, {@link RIGHT}, {@link DOWN}, {@link LEFT}).
 */
export type Direction = typeof UP | typeof RIGHT | typeof DOWN | typeof LEFT;

/**
 * Can be indexed by a {@link Direction} to get the respective css inset property.
 */
export const INSET: Record<Direction, "top" | "right" | "bottom" | "left"> = ["top", "right", "bottom", "left"];

/**
 * Flip a direction.
 */
export function flip(dir: Direction): Direction {
	return ((dir + 2) & 3) as Direction;
}

/**
 * Check if the specified directions are along the same axis.
 *
 * @example
 * ```tsx
 * axisEquals(UP, UP) // true
 * axisEquals(UP, DOWN) // true
 * axisEquals(UP, RIGHT) // false
 * ```
 */
export function axisEquals(a: Direction, b: Direction): boolean {
	return (a & 1) === (b & 1);
}

/**
 * Get the window size in CSS pixels along the axis of the specified direction.
 *
 * @example
 * ```tsx
 * getWindowSize(UP) === window.innerHeight // true
 * getWindowSize(DOWN) === window.innerHeight // true
 * ```
 */
export function getWindowSize(dir: Direction): number {
	return (dir & 1) ? window.innerWidth : window.innerHeight;
}

export interface DOMRectSize {
	width: number;
	height: number;
}

/**
 * Get the size in CSS pixels of a DOM rect along the axis of the specified direction.
 *
 * @example
 * ```tsx
 * getSize(button.getBoundingClientRect(), RIGHT) // 234.5
 * ```
 */
export function getSize(rect: DOMRectSize, dir: Direction): number {
	return (dir & 1) ? rect.width : rect.height;
}

export interface DOMRectXY {
	x: number;
	y: number;
}

/**
 * Get the X/Y coordinate start in CSS pixels of the specified DOM rect along the axis of the specified direction.
 */
export function getXY(rect: DOMRectXY, dir: Direction): number {
	return (dir & 1) ? rect.x : rect.y;
}

/**
 * Get the block start direction with respect to the specified writing mode.
 */
export function getBlockStart(writingMode: WritingMode): Direction {
	switch (writingMode) {
		case "horizontal-tb":
			return UP;

		case "vertical-rl":
		case "sideways-rl":
			return RIGHT;

		case "vertical-lr":
		case "sideways-lr":
			return LEFT;
	}
}

/**
 * Get the inline start direction with respect to the specified writing mode and script direction.
 */
export function getInlineStart(writingMode: WritingMode, scriptDir: ScriptDirection): Direction {
	let dir: Direction;
	switch (writingMode) {
		case "horizontal-tb":
			dir = LEFT;
			break;

		case "vertical-rl":
		case "vertical-lr":
		case "sideways-rl":
			dir = UP;
			break;

		case "sideways-lr":
			dir = DOWN;
			break;
	}

	if (scriptDir !== "ltr") {
		dir = flip(dir);
	}

	return dir;
}

/**
 * Get the space in CSS pixels between a DOM rect and the window in the specified direction.
 */
export function getWindowSpaceAround(rect: DOMRect, dir: Direction): number {
	switch (dir) {
		case UP: return rect.y;
		case RIGHT: return window.innerWidth - rect.right;
		case DOWN: return window.innerHeight - rect.bottom;
		case LEFT: return rect.x;
	}
}

/**
 * Check if the block axis of the specified element is vertical.
 */
export function isVerticalBlockAxis(target: Element): boolean | undefined {
	const writingMode = getComputedStyle(target).writingMode as WritingMode || undefined;
	if (writingMode !== undefined) {
		return axisEquals(getBlockStart(writingMode), UP);
	}
}
