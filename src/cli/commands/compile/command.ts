import { Command } from "commander";
import fs from "node:fs";
import { resolve, relative } from "node:path";
import { Logger } from "../../../services/logger/index.js";
import { DEFAULT_OUTDIR, DEFAULT_PROJECT_PATH } from "../../defaults.js";
import { compile, type CompilationResult } from "../../../compiler/compile.js";
import {
	defaultCompilerOptions,
	type CompilerOptions,
} from "../../../compiler/compiler-options.js";
import { createTrackedFs } from "../../../services/file-watching/tracked-fs.js";

export const compileCommand = new Command()
	.name("compile")
	.summary("Compiles inlang Paraglide-JS")
	.requiredOption(
		"--project <path>",
		'The path to the inlang project. Example: "./project.inlang"',
		DEFAULT_PROJECT_PATH
	)
	.requiredOption(
		"--outdir <path>",
		'The path to the output directory. Example: "./src/paraglide"',
		DEFAULT_OUTDIR
	)
	.option(
		"--strategy <items...>",
		[
			"The strategy to be used.",
			"",
			"Example: --strategy cookie globalVariable baseLocale",
			"Read more on https://inlang.com/m/gerre34r/library-inlang-paraglideJs/strategy",
		].join("\n")
	)
	.requiredOption("--silent", "Only log errors to the console", false)
	.option(
		"--emit-ts-declarations",
		"Emit .d.ts files for the generated output (requires the typescript package)",
		defaultCompilerOptions.emitTsDeclarations
	)
	.option("--watch", "Watch project files and recompile on change", false)
	.action(
		async (options: {
			silent: boolean;
			project: string;
			outdir: string;
			strategy?: CompilerOptions["strategy"];
			emitTsDeclarations?: CompilerOptions["emitTsDeclarations"];
			watch?: boolean;
		}) => {
			const logger = new Logger({ silent: options.silent, prefix: true });
			const path = resolve(process.cwd(), options.project);

			const compileOptions = {
				project: path,
				outdir: options.outdir,
				strategy: options.strategy ?? defaultCompilerOptions.strategy,
				emitTsDeclarations:
					options.emitTsDeclarations ??
					defaultCompilerOptions.emitTsDeclarations,
			};

			if (!options.watch) {
				logger.info(`Compiling inlang project ...`);

				try {
					await compile(compileOptions);
				} catch (e) {
					logger.error("Error while compiling inlang project.");
					logger.error(e);
					process.exit(1);
				}

				logger.success(`Successfully compiled inlang project.`);

				process.exit(0);
			}

			const { fs: trackedFs, readFiles, clearReadFiles } = createTrackedFs();
			const watchers = new Map<string, fs.FSWatcher>();
			let previousCompilation: CompilationResult | undefined;
			let compileTimer: NodeJS.Timeout | undefined;
			let compileInProgress = false;
			let compileRequested = false;

			const updateWatchers = (files: Set<string>) => {
				const nextFiles = new Set(
					Array.from(files).filter((filePath) => !filePath.includes("cache"))
				);

				for (const [filePath, watcher] of watchers) {
					if (!nextFiles.has(filePath)) {
						watcher.close();
						watchers.delete(filePath);
					}
				}

				for (const filePath of nextFiles) {
					if (watchers.has(filePath)) {
						continue;
					}

					try {
						const watcher = fs.watch(filePath, () => {
							scheduleCompile(filePath);
						});
						watchers.set(filePath, watcher);
					} catch (error) {
						logger.warn(`Failed to watch file: ${filePath}`);
					}
				}
			};

			const runCompile = async (changedPath?: string) => {
				if (compileInProgress) {
					compileRequested = true;
					return;
				}

				compileInProgress = true;
				const previouslyReadFiles = new Set(readFiles);
				clearReadFiles();

				if (changedPath) {
					logger.info(
						`Re-compiling inlang project... File "${relative(process.cwd(), changedPath)}" has changed.`
					);
				} else {
					logger.info("Compiling inlang project ...");
				}

				try {
					previousCompilation = await compile({
						...compileOptions,
						fs: trackedFs,
						previousCompilation,
						cleanOutdir: previousCompilation === undefined,
					});

					if (changedPath) {
						logger.success("Re-compilation complete.");
					} else {
						logger.success("Successfully compiled inlang project.");
					}
				} catch (e) {
					clearReadFiles();
					for (const filePath of previouslyReadFiles) {
						readFiles.add(filePath);
					}
					previousCompilation = undefined;
					logger.error("Error while compiling inlang project.");
					logger.error(e);
				} finally {
					updateWatchers(readFiles);
					compileInProgress = false;
					if (compileRequested) {
						compileRequested = false;
						runCompile();
					}
				}
			};

			const scheduleCompile = (changedPath?: string) => {
				if (compileTimer) {
					clearTimeout(compileTimer);
				}
				compileTimer = setTimeout(() => {
					runCompile(changedPath);
				}, 100);
			};

			const closeWatchers = () => {
				for (const watcher of watchers.values()) {
					watcher.close();
				}
				watchers.clear();
			};

			process.on("SIGINT", () => {
				closeWatchers();
				process.exit(0);
			});

			await runCompile();
			logger.info("Watching for changes...");
		}
	);
