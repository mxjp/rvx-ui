
export type WritingMode = "horizontal-tb" | "vertical-rl" | "vertical-lr" | "sideways-rl" | "sideways-lr";
export type ScriptDirection = "ltr" | "rtl";

export const UP = 0;
export const RIGHT = 1;
export const DOWN = 2;
export const LEFT = 3;

export type Direction = typeof UP | typeof RIGHT | typeof DOWN | typeof LEFT;

export const INSET = ["top", "right", "bottom", "left"] as const;

export function flip(dir: Direction): Direction {
	return ((dir + 2) & 3) as Direction;
}

export function axisEquals(a: Direction, b: Direction): boolean {
	return (a & 1) === (b & 1);
}

export function getWindowSize(dir: Direction): number {
	return (dir & 1) ? window.innerWidth : window.innerHeight;
}

export function getSize(rect: DOMRect, dir: Direction): number {
	return (dir & 1) ? rect.width : rect.height;
}

export function getXY(rect: DOMRect, dir: Direction): number {
	return (dir & 1) ? rect.x : rect.y;
}

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

export function getWindowSpaceAround(rect: DOMRect, dir: Direction): number {
	switch (dir) {
		case UP: return rect.y;
		case RIGHT: return window.innerWidth - rect.right;
		case DOWN: return window.innerHeight - rect.bottom;
		case LEFT: return rect.x;
	}
}

export function getWindowRectInset(rect: DOMRect, dir: Direction): number {
	switch (dir) {
		case UP: return window.innerHeight - rect.top;
		case RIGHT: return rect.right;
		case DOWN: return rect.bottom;
		case LEFT: return window.innerWidth - rect.left;
	}
}
