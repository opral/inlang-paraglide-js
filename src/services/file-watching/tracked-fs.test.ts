import memfs from "memfs";
import path from "node:path";
import type fs from "node:fs";
import { expect, test } from "vitest";
import { createTrackedFs } from "./tracked-fs.js";
import { nodeNormalizePath } from "../../utilities/node-normalize-path.js";

test("tracks readFile and promises.readFile calls", async () => {
	const baseDir = "/";
	const memFs = memfs.createFsFromVolume(
		memfs.Volume.fromJSON({
			"/messages.json": "test",
		})
	) as unknown as typeof fs;
	const tracked = createTrackedFs({ baseDir, fs: memFs });

	await new Promise<void>((resolvePromise, rejectPromise) => {
		tracked.fs.readFile(
			"/messages.json",
			null,
			(error, data) => {
				if (error) {
					rejectPromise(error);
					return;
				}
				expect(data.toString()).toBe("test");
				resolvePromise();
			}
		);
	});

	await tracked.fs.promises.readFile("/messages.json");

	const normalizedPath = nodeNormalizePath(path.resolve(baseDir, "messages.json"));
	expect(tracked.readFiles.has(normalizedPath)).toBe(true);
});

test("tracks readFileSync and clears tracked files", async () => {
	const baseDir = "/";
	const memFs = memfs.createFsFromVolume(
		memfs.Volume.fromJSON({
			"/sync.json": "sync",
		})
	) as unknown as typeof fs;
	const tracked = createTrackedFs({ baseDir, fs: memFs });

	const contents = tracked.fs.readFileSync("/sync.json");
	expect(contents.toString()).toBe("sync");

	expect(tracked.readFiles.size).toBe(1);
	tracked.clearReadFiles();
	expect(tracked.readFiles.size).toBe(0);
});
