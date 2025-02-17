import { ViteDevServer, TransformResult, CommonServerOptions, UserConfig as UserConfig$1, Plugin as Plugin$1 } from 'vite';

interface StartOfSourceMap {
    file?: string;
    sourceRoot?: string;
}

interface RawSourceMap extends StartOfSourceMap {
    version: string;
    sources: string[];
    names: string[];
    sourcesContent?: string[];
    mappings: string;
}

interface ExternalizeOptions {
    external?: (string | RegExp)[];
    inline?: (string | RegExp)[];
    fallbackCJS?: boolean;
}
interface ViteNodeServerOptions {
    deps?: ExternalizeOptions;
    transformMode?: {
        ssr?: RegExp[];
        web?: RegExp[];
    };
}

declare class ViteNodeServer {
    server: ViteDevServer;
    options: ViteNodeServerOptions;
    promiseMap: Map<string, Promise<TransformResult | null | undefined>>;
    constructor(server: ViteDevServer, options?: ViteNodeServerOptions);
    shouldExternalize(id: string): Promise<string | false>;
    fetchModule(id: string): Promise<{
        externalize: string;
        code?: undefined;
    } | {
        code: string | undefined;
        externalize?: undefined;
    }>;
    transformRequest(id: string): Promise<TransformResult | null | undefined>;
    private getTransformMode;
    private _transformRequest;
}

/**
 * Copyright (c) Facebook, Inc. and its affiliates. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
declare type Colors = {
    comment: {
        close: string;
        open: string;
    };
    content: {
        close: string;
        open: string;
    };
    prop: {
        close: string;
        open: string;
    };
    tag: {
        close: string;
        open: string;
    };
    value: {
        close: string;
        open: string;
    };
};
declare type Indent = (arg0: string) => string;
declare type Refs = Array<unknown>;
declare type Print = (arg0: unknown) => string;
declare type ThemeReceived = {
    comment?: string;
    content?: string;
    prop?: string;
    tag?: string;
    value?: string;
};
declare type CompareKeys = ((a: string, b: string) => number) | undefined;
interface PrettyFormatOptions {
    callToJSON?: boolean;
    compareKeys?: CompareKeys;
    escapeRegex?: boolean;
    escapeString?: boolean;
    highlight?: boolean;
    indent?: number;
    maxDepth?: number;
    min?: boolean;
    plugins?: Plugins;
    printBasicPrototype?: boolean;
    printFunctionName?: boolean;
    theme?: ThemeReceived;
}
declare type OptionsReceived = PrettyFormatOptions;
declare type Config = {
    callToJSON: boolean;
    compareKeys: CompareKeys;
    colors: Colors;
    escapeRegex: boolean;
    escapeString: boolean;
    indent: string;
    maxDepth: number;
    min: boolean;
    plugins: Plugins;
    printBasicPrototype: boolean;
    printFunctionName: boolean;
    spacingInner: string;
    spacingOuter: string;
};
declare type Printer = (val: unknown, config: Config, indentation: string, depth: number, refs: Refs, hasCalledToJSON?: boolean) => string;
declare type Test$1 = (arg0: any) => boolean;
declare type NewPlugin = {
    serialize: (val: any, config: Config, indentation: string, depth: number, refs: Refs, printer: Printer) => string;
    test: Test$1;
};
declare type PluginOptions = {
    edgeSpacing: string;
    min: boolean;
    spacing: string;
};
declare type OldPlugin = {
    print: (val: unknown, print: Print, indent: Indent, options: PluginOptions, colors: Colors) => string;
    test: Test$1;
};
declare type Plugin = NewPlugin | OldPlugin;
declare type Plugins = Array<Plugin>;

declare abstract class BaseReporter implements Reporter {
    start: number;
    end: number;
    watchFilters?: string[];
    isTTY: boolean;
    ctx: Vitest;
    onInit(ctx: Vitest): void;
    relative(path: string): string;
    onFinished(files?: File[]): Promise<void>;
    onTaskUpdate(packs: TaskResultPack[]): void;
    onWatcherStart(): Promise<void>;
    onWatcherRerun(files: string[], trigger?: string): Promise<void>;
    onUserConsoleLog(log: UserConsoleLog): void;
    onServerRestart(): void;
    reportSummary(files: File[]): Promise<void>;
    private printTaskErrors;
}

interface ListRendererOptions {
    renderSucceed?: boolean;
    outputStream: NodeJS.WritableStream;
}
declare const createListRenderer: (_tasks: Task[], options: ListRendererOptions) => {
    start(): any;
    update(_tasks: Task[]): any;
    stop(): Promise<any>;
    clear(): void;
};

declare class DefaultReporter extends BaseReporter {
    renderer?: ReturnType<typeof createListRenderer>;
    rendererOptions: ListRendererOptions;
    onCollected(): void;
    onFinished(files?: File[]): Promise<void>;
    onWatcherStart(): Promise<void>;
    stopListRender(): Promise<void>;
    onWatcherRerun(files: string[], trigger?: string): Promise<void>;
    onUserConsoleLog(log: UserConsoleLog): void;
}

declare class DotReporter extends BaseReporter {
    renderer?: ReturnType<typeof createListRenderer>;
    onCollected(): void;
    onFinished(files?: File[]): Promise<void>;
    onWatcherStart(): Promise<void>;
    stopListRender(): Promise<void>;
    onWatcherRerun(files: string[], trigger?: string): Promise<void>;
    onUserConsoleLog(log: UserConsoleLog): void;
}

declare class JsonReporter implements Reporter {
    start: number;
    ctx: Vitest;
    onInit(ctx: Vitest): void;
    protected logTasks(files: File[]): Promise<void>;
    onFinished(files?: File[]): Promise<void>;
    /**
     * Writes the report to an output file if specified in the config,
     * or logs it to the console otherwise.
     * @param report
     */
    writeReport(report: string): Promise<void>;
}

declare class VerboseReporter extends DefaultReporter {
    constructor();
}

declare class TapReporter implements Reporter {
    protected ctx: Vitest;
    private logger;
    onInit(ctx: Vitest): void;
    static getComment(task: Task): string;
    private logErrorDetails;
    protected logTasks(tasks: Task[]): void;
    onFinished(files?: File[]): Promise<void>;
}

declare class JUnitReporter implements Reporter {
    private ctx;
    private reportFile?;
    private baseLog;
    private logger;
    onInit(ctx: Vitest): Promise<void>;
    writeElement(name: string, attrs: Record<string, any>, children: () => Promise<void>): Promise<void>;
    writeErrorDetails(error: ErrorWithDiff): Promise<void>;
    writeLogs(task: Task, type: 'err' | 'out'): Promise<void>;
    writeTasks(tasks: Task[], filename: string): Promise<void>;
    onFinished(files?: File[]): Promise<void>;
}

declare class TapFlatReporter extends TapReporter {
    onInit(ctx: Vitest): void;
    onFinished(files?: File[]): Promise<void>;
}

declare const ReportersMap: {
    default: typeof DefaultReporter;
    verbose: typeof VerboseReporter;
    dot: typeof DotReporter;
    json: typeof JsonReporter;
    tap: typeof TapReporter;
    'tap-flat': typeof TapFlatReporter;
    junit: typeof JUnitReporter;
};
declare type BuiltinReporters = keyof typeof ReportersMap;

declare type CoverageReporter = 'clover' | 'cobertura' | 'html-spa' | 'html' | 'json-summary' | 'json' | 'lcov' | 'lcovonly' | 'none' | 'teamcity' | 'text-lcov' | 'text-summary' | 'text';
interface C8Options {
    /**
     * Enable coverage, pass `--coverage` to enable
     *
     * @default false
     */
    enabled?: boolean;
    /**
     * Directory to write coverage report to
     */
    reportsDirectory?: string;
    /**
     * Clean coverage before running tests
     *
     * @default true
     */
    clean?: boolean;
    /**
     * Clean coverage report on watch rerun
     *
     * @default false
     */
    cleanOnRerun?: boolean;
    /**
     * Allow files from outside of your cwd.
     *
     * @default false
     */
    allowExternal?: any;
    /**
     * Reporters
     *
     * @default 'text'
     */
    reporter?: Arrayable<CoverageReporter>;
    /**
     * Exclude coverage under /node_modules/
     *
     * @default true
     */
    excludeNodeModules?: boolean;
    exclude?: string[];
    include?: string[];
    skipFull?: boolean;
    extension?: string | string[];
}
interface ResolvedC8Options extends Required<C8Options> {
    tempDirectory: string;
}

interface JSDOMOptions {
    /**
     * The html content for the test.
     *
     * @default '<!DOCTYPE html>'
     */
    html?: string | Buffer | ArrayBufferLike;
    /**
     * referrer just affects the value read from document.referrer.
     * It defaults to no referrer (which reflects as the empty string).
     */
    referrer?: string;
    /**
     * userAgent affects the value read from navigator.userAgent, as well as the User-Agent header sent while fetching subresources.
     *
     * @default `Mozilla/5.0 (${process.platform}) AppleWebKit/537.36 (KHTML, like Gecko) jsdom/${jsdomVersion}`
     */
    userAgent?: string;
    /**
     * url sets the value returned by window.location, document.URL, and document.documentURI,
     * and affects things like resolution of relative URLs within the document
     * and the same-origin restrictions and referrer used while fetching subresources.
     *
     * @default 'http://localhost:3000'.
     */
    url?: string;
    /**
     * contentType affects the value read from document.contentType, and how the document is parsed: as HTML or as XML.
     * Values that are not "text/html" or an XML mime type will throw.
     *
     * @default 'text/html'.
     */
    contentType?: string;
    /**
     * The maximum size in code units for the separate storage areas used by localStorage and sessionStorage.
     * Attempts to store data larger than this limit will cause a DOMException to be thrown. By default, it is set
     * to 5,000,000 code units per origin, as inspired by the HTML specification.
     *
     * @default 5_000_000
     */
    storageQuota?: number;
    /**
     * Enable console?
     *
     * @default false
     */
    console?: boolean;
    /**
     * jsdom does not have the capability to render visual content, and will act like a headless browser by default.
     * It provides hints to web pages through APIs such as document.hidden that their content is not visible.
     *
     * When the `pretendToBeVisual` option is set to `true`, jsdom will pretend that it is rendering and displaying
     * content.
     *
     * @default true
     */
    pretendToBeVisual?: boolean;
    /**
     * `includeNodeLocations` preserves the location info produced by the HTML parser,
     * allowing you to retrieve it with the nodeLocation() method (described below).
     *
     * It defaults to false to give the best performance,
     * and cannot be used with an XML content type since our XML parser does not support location info.
     *
     * @default false
     */
    includeNodeLocations?: boolean | undefined;
    /**
     * @default 'dangerously'
     */
    runScripts?: 'dangerously' | 'outside-only';
    /**
     * Enable CookieJar
     *
     * @default false
     */
    cookieJar?: boolean;
    resources?: 'usable' | any;
}

declare type Awaitable<T> = T | PromiseLike<T>;
declare type Arrayable<T> = T | Array<T>;
declare type ArgumentsType<T> = T extends (...args: infer U) => any ? U : never;
interface UserConsoleLog {
    content: string;
    type: 'stdout' | 'stderr';
    taskId?: string;
    time: number;
}
interface Position {
    line: number;
    column: number;
}
interface ParsedStack {
    method: string;
    file: string;
    line: number;
    column: number;
    sourcePos?: Position;
}
interface ErrorWithDiff extends Error {
    name: string;
    nameStr?: string;
    stack?: string;
    stackStr?: string;
    stacks?: ParsedStack[];
    showDiff?: boolean;
    actual?: any;
    expected?: any;
    operator?: string;
}

declare type RunMode = 'run' | 'skip' | 'only' | 'todo';
declare type TaskState = RunMode | 'pass' | 'fail';
interface TaskBase {
    id: string;
    name: string;
    mode: RunMode;
    concurrent?: boolean;
    suite?: Suite;
    file?: File;
    result?: TaskResult;
    logs?: UserConsoleLog[];
}
interface TaskResult {
    state: TaskState;
    duration?: number;
    error?: ErrorWithDiff;
}
declare type TaskResultPack = [id: string, result: TaskResult | undefined];
interface Suite extends TaskBase {
    type: 'suite';
    tasks: Task[];
}
interface File extends Suite {
    filepath: string;
    collectDuration?: number;
}
interface Test extends TaskBase {
    type: 'test';
    suite: Suite;
    result?: TaskResult;
    fails?: boolean;
}
declare type Task = Test | Suite | File;

interface Reporter {
    onInit?(ctx: Vitest): void;
    onCollected?: (files?: File[]) => Awaitable<void>;
    onFinished?: (files?: File[]) => Awaitable<void>;
    onTaskUpdate?: (packs: TaskResultPack[]) => Awaitable<void>;
    onWatcherStart?: () => Awaitable<void>;
    onWatcherRerun?: (files: string[], trigger?: string) => Awaitable<void>;
    onServerRestart?: () => Awaitable<void>;
    onUserConsoleLog?: (log: UserConsoleLog) => Awaitable<void>;
}

declare type SnapshotUpdateState = 'all' | 'new' | 'none';
interface SnapshotStateOptions {
    updateSnapshot: SnapshotUpdateState;
    expand?: boolean;
    snapshotFormat?: OptionsReceived;
}
interface SnapshotResult {
    filepath: string;
    added: number;
    fileDeleted: boolean;
    matched: number;
    unchecked: number;
    uncheckedKeys: Array<string>;
    unmatched: number;
    updated: number;
}
interface UncheckedSnapshot {
    filePath: string;
    keys: Array<string>;
}
interface SnapshotSummary {
    added: number;
    didUpdate: boolean;
    failure: boolean;
    filesAdded: number;
    filesRemoved: number;
    filesRemovedList: Array<string>;
    filesUnmatched: number;
    filesUpdated: number;
    matched: number;
    total: number;
    unchecked: number;
    uncheckedKeysByFile: Array<UncheckedSnapshot>;
    unmatched: number;
    updated: number;
}

declare type BuiltinEnvironment = 'node' | 'jsdom' | 'happy-dom';
declare type ApiConfig = Pick<CommonServerOptions, 'port' | 'strictPort' | 'host'>;

interface EnvironmentOptions {
    /**
     * jsdom options.
     */
    jsdom?: JSDOMOptions;
}
interface InlineConfig {
    /**
     * Include globs for test files
     *
     * @default ['**\/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}']
     */
    include?: string[];
    /**
     * Exclude globs for test files
     * @default ['node_modules', 'dist', '.idea', '.git', '.cache']
     */
    exclude?: string[];
    /**
     * Handling for dependencies inlining or externalizing
     */
    deps?: {
        /**
         * Externalize means that Vite will bypass the package to native Node.
         *
         * Externalized dependencies will not be applied Vite's transformers and resolvers.
         * And does not support HMR on reload.
         *
         * Typically, packages under `node_modules` are externalized.
         */
        external?: (string | RegExp)[];
        /**
         * Vite will process inlined modules.
         *
         * This could be helpful to handle packages that ship `.js` in ESM format (that Node can't handle).
         */
        inline?: (string | RegExp)[];
        /**
         * Interpret CJS module's default as named exports
         *
         * @default true
         */
        interpretDefault?: boolean;
        /**
         * When a dependency is a valid ESM package, try to guess the cjs version based on the path.
         * This will significantly improve the performance in huge repo, but might potentially
         * cause some misalignment if a package have different logic in ESM and CJS mode.
         *
         * @default true
         */
        fallbackCJS?: boolean;
    };
    /**
     * Register apis globally
     *
     * @default false
     */
    global?: boolean;
    /**
     * Running environment
     *
     * Supports 'node', 'jsdom', 'happy-dom'
     *
     * @default 'node'
     */
    environment?: BuiltinEnvironment;
    /**
     * Environment options.
     */
    environmentOptions?: EnvironmentOptions;
    /**
     * Update snapshot
     *
     * @default false
     */
    update?: boolean;
    /**
     * Watch mode
     *
     * @default false
     */
    watch?: boolean;
    /**
     * Project root
     *
     * @default process.cwd()
     */
    root?: string;
    /**
     * Custom reporter for output
     */
    reporters?: Arrayable<BuiltinReporters | Reporter>;
    /**
     * Write test results to a file when the --reporter=json option is also specified
     */
    outputFile?: string;
    /**
     * Enable multi-threading
     *
     * @default true
     */
    threads?: boolean;
    /**
     * Maximum number of threads
     *
     * @default available CPUs
     */
    maxThreads?: number;
    /**
     * Minimum number of threads
     *
     * @default available CPUs
     */
    minThreads?: number;
    /**
     * Default timeout of a test in milliseconds
     *
     * @default 5000
     */
    testTimeout?: number;
    /**
     * Default timeout of a hook in milliseconds
     *
     * @default 5000
     */
    hookTimeout?: number;
    /**
     * Silent mode
     *
     * @default false
     */
    silent?: boolean;
    /**
     * Path to setup files
     */
    setupFiles?: string | string[];
    /**
     * Path to global setup files
     */
    globalSetup?: string | string[];
    /**
     * Pattern of file paths to be ignore from triggering watch rerun
     *
     * @default ['**\/node_modules\/**', '**\/dist/**']
     */
    watchIgnore?: (string | RegExp)[];
    /**
     * Isolate environment for each test file
     *
     * @default true
     */
    isolate?: boolean;
    /**
     * Coverage options
     */
    coverage?: C8Options;
    /**
     * run test names with the specified pattern
     */
    testNamePattern?: string | RegExp;
    /**
     * Will call `.mockClear()` on all spies before each test
     * @default false
     */
    clearMocks?: boolean;
    /**
     * Will call `.mockReset()` on all spies before each test
     * @default false
     */
    mockReset?: boolean;
    /**
     * Will call `.mockRestore()` on all spies before each test
     * @default false
     */
    restoreMocks?: boolean;
    /**
     * Serve API options.
     *
     * When set to true, the default port is 51204.
     *
     * @default false
     */
    api?: boolean | number | ApiConfig;
    /**
     * Open Vitest UI
     * @internal WIP
     */
    ui?: boolean;
    /**
     * Base url for the UI
     *
     * @default '/__vitest__/'
     */
    uiBase?: string;
    /**
     * Determine the transform method of modules
     */
    transformMode?: {
        /**
         * Use SSR transform pipeline for the specified files.
         * Vite plugins will receive `ssr: true` flag when processing those files.
         *
         * @default [/\.([cm]?[jt]sx?|json)$/]
         */
        ssr?: RegExp[];
        /**
         * First do a normal transform pipeline (targeting browser),
         * then then do a SSR rewrite to run the code in Node.
         * Vite plugins will receive `ssr: false` flag when processing those files.
         *
         * @default other than `ssr`
         */
        web?: RegExp[];
    };
    /**
     * Format options for snapshot testing.
     */
    snapshotFormat?: PrettyFormatOptions;
}
interface UserConfig extends InlineConfig {
    /**
     * Path to the config file.
     *
     * Default resolving to one of:
     * - `vitest.config.js`
     * - `vitest.config.ts`
     * - `vite.config.js`
     * - `vite.config.ts`
     */
    config?: string | undefined;
    /**
     * Use happy-dom
     */
    dom?: boolean;
    /**
     * Do not watch
     */
    run?: boolean;
    /**
     * Pass with no tests
     */
    passWithNoTests?: boolean;
    /**
     * Run tests that cover a list of source files
     */
    related?: string[] | string;
}
interface ResolvedConfig extends Omit<Required<UserConfig>, 'config' | 'filters' | 'coverage' | 'testNamePattern' | 'related' | 'api'> {
    base?: string;
    config?: string;
    filters?: string[];
    testNamePattern?: RegExp;
    related?: string[];
    coverage: ResolvedC8Options;
    snapshotOptions: SnapshotStateOptions;
    api?: ApiConfig;
}

declare class SnapshotManager {
    config: ResolvedConfig;
    summary: SnapshotSummary;
    constructor(config: ResolvedConfig);
    clear(): void;
    add(result: SnapshotResult): void;
}

declare type RunWithFiles = (files: string[], invalidates?: string[]) => Promise<void>;
interface WorkerPool {
    runTests: RunWithFiles;
    collectTests: RunWithFiles;
    close: () => Promise<void>;
}

declare class StateManager {
    filesMap: Map<string, File>;
    idMap: Map<string, Task>;
    taskFileMap: WeakMap<Task, File>;
    getFiles(keys?: string[]): File[];
    getFilepaths(): string[];
    getFailedFilepaths(): string[];
    collectFiles(files?: File[]): void;
    updateId(task: Task): void;
    updateTasks(packs: TaskResultPack[]): void;
    updateUserLog(log: UserConsoleLog): void;
}

declare class Vitest {
    config: ResolvedConfig;
    configOverride: Partial<ResolvedConfig> | undefined;
    server: ViteDevServer;
    state: StateManager;
    snapshot: SnapshotManager;
    reporters: Reporter[];
    console: Console;
    pool: WorkerPool | undefined;
    outputStream: NodeJS.WriteStream & {
        fd: 1;
    };
    errorStream: NodeJS.WriteStream & {
        fd: 2;
    };
    vitenode: ViteNodeServer;
    invalidates: Set<string>;
    changedTests: Set<string>;
    visitedFilesMap: Map<string, RawSourceMap>;
    runningPromise?: Promise<void>;
    closingPromise?: Promise<void>;
    isFirstRun: boolean;
    restartsCount: number;
    private _onRestartListeners;
    constructor();
    setServer(options: UserConfig, server: ViteDevServer): Promise<void>;
    getConfig(): any;
    start(filters?: string[]): Promise<void>;
    private getTestDependencies;
    filterTestsBySource(tests: string[]): Promise<string[]>;
    runFiles(files: string[]): Promise<void>;
    rerunFiles(files?: string[], trigger?: string): Promise<void>;
    returnFailed(): Promise<void>;
    updateSnapshot(files?: string[]): Promise<void>;
    log(...args: any[]): void;
    error(...args: any[]): void;
    private _rerunTimer;
    private scheduleRerun;
    private unregisterWatcher;
    private registerWatcher;
    private handleFileChanged;
    close(): Promise<void>;
    exit(): Promise<void>;
    report<T extends keyof Reporter>(name: T, ...args: ArgumentsType<Reporter[T]>): Promise<void>;
    globTestFiles(filters?: string[]): Promise<string[]>;
    isTargetFile(id: string): boolean;
    onServerRestarted(fn: () => void): void;
}

declare function createVitest(options: UserConfig, viteOverrides?: UserConfig$1): Promise<Vitest>;

declare function VitestPlugin(options?: UserConfig, viteOverrides?: UserConfig$1, ctx?: Vitest): Promise<Plugin$1[]>;

export { Vitest, VitestPlugin, createVitest };
