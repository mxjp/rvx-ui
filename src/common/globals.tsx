
/**
 * Get or create a shared global.
 */
export function sharedGlobal<T>(symbolKey: string, createNew: () => T): T {
	const key = Symbol.for(symbolKey);
	// eslint-disable-next-line @typescript-eslint/no-unsafe-return
	return (globalThis as any)[key] ?? ((globalThis as any)[key] = createNew());
}
