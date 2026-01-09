import fs from "node:fs";
import { resolve } from "node:path";
import { nodeNormalizePath } from "../../utilities/node-normalize-path.js";

type TrackedFs = {
	fs: typeof import("node:fs");
	readFiles: Set<string>;
	clearReadFiles: () => void;
};

type TrackedFsOptions = {
	baseDir?: string;
	fs?: typeof import("node:fs");
};

export function createTrackedFs(options: TrackedFsOptions = {}): TrackedFs {
	const baseDir = options.baseDir ?? process.cwd();
	const baseFs = options.fs ?? fs;
	const readFiles = new Set<string>();

	const trackRead = (path: fs.PathLike | number) => {
		readFiles.add(
			nodeNormalizePath(resolve(baseDir, path.toString()))
		);
	};

	const wrappedFs: typeof import("node:fs") = {
		...baseFs,
		// @ts-expect-error - Node's fs has too many overloads
		readFile: (
			path: fs.PathLike | number,
			options: { encoding?: null; flag?: string } | null | undefined,
			callback: (err: NodeJS.ErrnoException | null, data: Buffer) => void
		) => {
			trackRead(path);
			return baseFs.readFile(path, options, callback);
		},
		// @ts-expect-error - Node's fs has too many overloads
		readFileSync: (
			path: fs.PathLike | number,
			options?: { encoding?: null; flag?: string } | null | undefined
		) => {
			trackRead(path);
			return baseFs.readFileSync(path, options);
		},
		promises: {
			...baseFs.promises,
			// @ts-expect-error - Node's fs.promises has too many overloads
			readFile: async (
				path: fs.PathLike,
				options?: { encoding?: null; flag?: string } | null
			): Promise<Buffer> => {
				trackRead(path);
				return baseFs.promises.readFile(path, options);
			},
		},
	};

	return {
		fs: wrappedFs,
		readFiles,
		clearReadFiles: () => {
			readFiles.clear();
		},
	};
}
