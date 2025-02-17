import { ViteDevServer, TransformResult, CommonServerOptions } from 'vite';
import { MessagePort } from 'worker_threads';
import { SpyImpl } from 'tinyspy';
export { Spy, SpyFn } from 'tinyspy';
export { assert, default as chai, should } from 'chai';

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

declare type Formatter = (input: string | number | null | undefined) => string;

declare const EXPECTED_COLOR: Formatter;
declare const RECEIVED_COLOR: Formatter;
declare const INVERTED_COLOR: Formatter;
declare const BOLD_WEIGHT: Formatter;
declare const DIM_COLOR: Formatter;
interface MatcherHintOptions {
    comment?: string;
    expectedColor?: Formatter;
    isDirectExpectCall?: boolean;
    isNot?: boolean;
    promise?: string;
    receivedColor?: Formatter;
    secondArgument?: string;
    secondArgumentColor?: Formatter;
}
declare function matcherHint(matcherName: string, received?: string, expected?: string, options?: MatcherHintOptions): string;
declare const stringify: (object: unknown, maxDepth?: number) => string;
declare const printReceived: (object: unknown) => string;
declare const printExpected: (value: unknown) => string;
interface DiffOptions {
    aAnnotation?: string;
    aColor?: Formatter;
    aIndicator?: string;
    bAnnotation?: string;
    bColor?: Formatter;
    bIndicator?: string;
    changeColor?: Formatter;
    changeLineTrailingSpaceColor?: Formatter;
    commonColor?: Formatter;
    commonIndicator?: string;
    commonLineTrailingSpaceColor?: Formatter;
    contextLines?: number;
    emptyFirstOrLastLinePlaceholder?: string;
    expand?: boolean;
    includeChangeCounts?: boolean;
    omitAnnotationLines?: boolean;
    patchColor?: Formatter;
    compareKeys?: any;
}
declare function diff(a: any, b: any, options?: DiffOptions): string;

declare const jestMatcherUtils_EXPECTED_COLOR: typeof EXPECTED_COLOR;
declare const jestMatcherUtils_RECEIVED_COLOR: typeof RECEIVED_COLOR;
declare const jestMatcherUtils_INVERTED_COLOR: typeof INVERTED_COLOR;
declare const jestMatcherUtils_BOLD_WEIGHT: typeof BOLD_WEIGHT;
declare const jestMatcherUtils_DIM_COLOR: typeof DIM_COLOR;
type jestMatcherUtils_MatcherHintOptions = MatcherHintOptions;
declare const jestMatcherUtils_matcherHint: typeof matcherHint;
declare const jestMatcherUtils_stringify: typeof stringify;
declare const jestMatcherUtils_printReceived: typeof printReceived;
declare const jestMatcherUtils_printExpected: typeof printExpected;
type jestMatcherUtils_DiffOptions = DiffOptions;
declare const jestMatcherUtils_diff: typeof diff;
declare namespace jestMatcherUtils {
  export {
    jestMatcherUtils_EXPECTED_COLOR as EXPECTED_COLOR,
    jestMatcherUtils_RECEIVED_COLOR as RECEIVED_COLOR,
    jestMatcherUtils_INVERTED_COLOR as INVERTED_COLOR,
    jestMatcherUtils_BOLD_WEIGHT as BOLD_WEIGHT,
    jestMatcherUtils_DIM_COLOR as DIM_COLOR,
    jestMatcherUtils_MatcherHintOptions as MatcherHintOptions,
    jestMatcherUtils_matcherHint as matcherHint,
    jestMatcherUtils_stringify as stringify,
    jestMatcherUtils_printReceived as printReceived,
    jestMatcherUtils_printExpected as printExpected,
    jestMatcherUtils_DiffOptions as DiffOptions,
    jestMatcherUtils_diff as diff,
  };
}

declare type Tester = (a: any, b: any) => boolean | undefined;
interface MatcherState {
    assertionCalls: number;
    currentTestName?: string;
    dontThrow?: () => void;
    error?: Error;
    equals: (a: unknown, b: unknown, customTesters?: Array<Tester>, strictCheck?: boolean) => boolean;
    expand?: boolean;
    expectedAssertionsNumber?: number | null;
    expectedAssertionsNumberError?: Error | null;
    isExpectingAssertions?: boolean;
    isExpectingAssertionsError?: Error | null;
    isNot: boolean;
    promise: string;
    suppressedErrors: Array<Error>;
    testPath?: string;
    utils: typeof jestMatcherUtils & {
        iterableEquality: Tester;
        subsetEquality: Tester;
    };
}
interface SyncExpectationResult {
    pass: boolean;
    message: () => string;
    actual?: any;
    expected?: any;
}
declare type AsyncExpectationResult = Promise<SyncExpectationResult>;
declare type ExpectationResult = SyncExpectationResult | AsyncExpectationResult;
interface RawMatcherFn<T extends MatcherState = MatcherState> {
    (this: T, received: any, expected: any, options?: any): ExpectationResult;
}
declare type MatchersObject<T extends MatcherState = MatcherState> = Record<string, RawMatcherFn<T>>;

interface AsymmetricMatcherInterface {
    asymmetricMatch(other: unknown): boolean;
    toString(): string;
    getExpectedType?(): string;
    toAsymmetricMatcher?(): string;
}
declare abstract class AsymmetricMatcher<T, State extends MatcherState = MatcherState> implements AsymmetricMatcherInterface {
    protected sample: T;
    protected inverse: boolean;
    $$typeof: symbol;
    constructor(sample: T, inverse?: boolean);
    protected getMatcherContext(): State;
    abstract asymmetricMatch(other: unknown): boolean;
    abstract toString(): string;
    getExpectedType?(): string;
    toAsymmetricMatcher?(): string;
}
declare class Anything extends AsymmetricMatcher<void> {
    asymmetricMatch(other: unknown): boolean;
    toString(): string;
    toAsymmetricMatcher(): string;
}
declare class Any extends AsymmetricMatcher<any> {
    constructor(sample: unknown);
    fnNameFor(func: Function): string;
    asymmetricMatch(other: unknown): boolean;
    toString(): string;
    getExpectedType(): string;
    toAsymmetricMatcher(): string;
}

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
declare type Nullable<T> = T | null | undefined;
declare type Arrayable<T> = T | Array<T>;
declare type ArgumentsType<T> = T extends (...args: infer U) => any ? U : never;
interface Constructable {
    new (...args: any[]): any;
}
interface ModuleCache {
    promise?: Promise<any>;
    exports?: any;
    code?: string;
}
interface EnvironmentReturn {
    teardown: (global: any) => Awaitable<void>;
}
interface Environment {
    name: string;
    setup(global: any, options: Record<string, any>): Awaitable<EnvironmentReturn>;
}
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
interface ModuleGraphData {
    graph: Record<string, string[]>;
    externalized: string[];
    inlined: string[];
}

declare type ChainableFunction<T extends string, Args extends any[], R = any> = {
    (...args: Args): R;
} & {
    [x in T]: ChainableFunction<T, Args, R>;
};

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
declare type DoneCallback = (error?: any) => void;
declare type TestFunction = (done: DoneCallback) => Awaitable<void>;
declare type TestCollector = ChainableFunction<'concurrent' | 'only' | 'skip' | 'todo' | 'fails', [
    name: string,
    fn?: TestFunction,
    timeout?: number
], void>;
declare type HookListener<T extends any[]> = (...args: T) => Awaitable<void>;
interface SuiteHooks {
    beforeAll: HookListener<[Suite]>[];
    afterAll: HookListener<[Suite]>[];
    beforeEach: HookListener<[Test, Suite]>[];
    afterEach: HookListener<[Test, Suite]>[];
}
interface SuiteCollector {
    readonly name: string;
    readonly mode: RunMode;
    type: 'collector';
    test: TestCollector;
    tasks: (Suite | Test | SuiteCollector)[];
    collect: (file?: File) => Promise<Suite>;
    clear: () => void;
    on: <T extends keyof SuiteHooks>(name: T, ...fn: SuiteHooks[T]) => void;
}
declare type TestFactory = (test: (name: string, fn: TestFunction) => void) => Awaitable<void>;
interface RuntimeContext {
    tasks: (SuiteCollector | Test)[];
    currentSuite: SuiteCollector | null;
}

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

declare type SnapshotData = Record<string, string>;
declare type SnapshotUpdateState = 'all' | 'new' | 'none';
interface SnapshotStateOptions {
    updateSnapshot: SnapshotUpdateState;
    expand?: boolean;
    snapshotFormat?: OptionsReceived;
}
interface SnapshotMatchOptions {
    testName: string;
    received: unknown;
    key?: string;
    inlineSnapshot?: string;
    isInline: boolean;
    error?: Error;
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

interface WorkerContext {
    port: MessagePort;
    config: ResolvedConfig;
    files: string[];
    invalidates?: string[];
}
declare type FetchFunction = (id: string) => Promise<{
    code?: string;
    externalize?: string;
}>;
interface WorkerRPC {
    fetch: FetchFunction;
    getSourceMap: (id: string, force?: boolean) => Promise<RawSourceMap | undefined>;
    onWorkerExit: (code?: number) => void;
    onUserConsoleLog: (log: UserConsoleLog) => void;
    onCollected: (files: File[]) => void;
    onTaskUpdate: (pack: TaskResultPack[]) => void;
    snapshotSaved: (snapshot: SnapshotResult) => void;
}

declare const suite: ChainableFunction<"skip" | "only" | "todo" | "concurrent", [name: string, factory?: TestFactory | undefined], SuiteCollector>;
declare const test: TestCollector;
declare const describe: ChainableFunction<"skip" | "only" | "todo" | "concurrent", [name: string, factory?: TestFactory | undefined], SuiteCollector>;
declare const it: TestCollector;

declare const beforeAll: (fn: SuiteHooks['beforeAll'][0], timeout?: number | undefined) => void;
declare const afterAll: (fn: SuiteHooks['afterAll'][0], timeout?: number | undefined) => void;
declare const beforeEach: (fn: SuiteHooks['beforeEach'][0], timeout?: number | undefined) => void;
declare const afterEach: (fn: SuiteHooks['afterEach'][0], timeout?: number | undefined) => void;

declare const expect: Chai.ExpectStatic;

interface MockResultReturn<T> {
    type: 'return';
    value: T;
}
interface MockResultIncomplete {
    type: 'incomplete';
    value: undefined;
}
interface MockResultThrow {
    type: 'throw';
    value: any;
}
declare type MockResult<T> = MockResultReturn<T> | MockResultThrow | MockResultIncomplete;
interface JestMockCompatContext<TArgs, TReturns> {
    calls: TArgs[];
    instances: TReturns[];
    invocationCallOrder: number[];
    results: MockResult<TReturns>[];
}
declare type Procedure = (...args: any[]) => any;
declare type Methods<T> = {
    [K in keyof T]: T[K] extends Procedure ? K : never;
}[keyof T] & string;
declare type Properties<T> = {
    [K in keyof T]: T[K] extends Procedure ? never : K;
}[keyof T] & string;
declare type Classes<T> = {
    [K in keyof T]: T[K] extends new (...args: any[]) => any ? K : never;
}[keyof T] & string;
interface JestMockCompat<TArgs extends any[] = any[], TReturns = any> {
    getMockName(): string;
    mockName(n: string): this;
    mock: JestMockCompatContext<TArgs, TReturns>;
    mockClear(): this;
    mockReset(): this;
    mockRestore(): void;
    getMockImplementation(): ((...args: TArgs) => TReturns) | undefined;
    mockImplementation(fn: ((...args: TArgs) => TReturns) | (() => Promise<TReturns>)): this;
    mockImplementationOnce(fn: ((...args: TArgs) => TReturns) | (() => Promise<TReturns>)): this;
    mockReturnThis(): this;
    mockReturnValue(obj: TReturns): this;
    mockReturnValueOnce(obj: TReturns): this;
    mockResolvedValue(obj: Awaited<TReturns>): this;
    mockResolvedValueOnce(obj: Awaited<TReturns>): this;
    mockRejectedValue(obj: any): this;
    mockRejectedValueOnce(obj: any): this;
}
interface JestMockCompatFn<TArgs extends any[] = any, TReturns = any> extends JestMockCompat<TArgs, TReturns> {
    (...args: TArgs): TReturns;
}
declare type MaybeMockedConstructor<T> = T extends new (...args: Array<any>) => infer R ? JestMockCompatFn<ConstructorParameters<T>, R> : T;
declare type MockedFunction<T extends Procedure> = MockWithArgs<T> & {
    [K in keyof T]: T[K];
};
declare type MockedFunctionDeep<T extends Procedure> = MockWithArgs<T> & MockedObjectDeep<T>;
declare type MockedObject<T> = MaybeMockedConstructor<T> & {
    [K in Methods<T>]: T[K] extends Procedure ? MockedFunction<T[K]> : T[K];
} & {
    [K in Properties<T>]: T[K];
};
declare type MockedObjectDeep<T> = MaybeMockedConstructor<T> & {
    [K in Methods<T>]: T[K] extends Procedure ? MockedFunctionDeep<T[K]> : T[K];
} & {
    [K in Properties<T>]: MaybeMockedDeep<T[K]>;
};
declare type MaybeMockedDeep<T> = T extends Procedure ? MockedFunctionDeep<T> : T extends object ? MockedObjectDeep<T> : T;
declare type MaybeMocked<T> = T extends Procedure ? MockedFunction<T> : T extends object ? MockedObject<T> : T;
declare type EnhancedSpy<TArgs extends any[] = any[], TReturns = any> = JestMockCompat<TArgs, TReturns> & SpyImpl<TArgs, TReturns>;
interface MockWithArgs<T extends Procedure> extends JestMockCompatFn<Parameters<T>, ReturnType<T>> {
    new (...args: T extends new (...args: any) => any ? ConstructorParameters<T> : never): T;
    (...args: Parameters<T>): ReturnType<T>;
}
declare const spies: Set<JestMockCompat<any[], any>>;
declare function isMockFunction(fn: any): fn is EnhancedSpy;
declare function spyOn<T, S extends Properties<Required<T>>>(obj: T, methodName: S, accesType: 'get'): JestMockCompat<[], T[S]>;
declare function spyOn<T, G extends Properties<Required<T>>>(obj: T, methodName: G, accesType: 'set'): JestMockCompat<[T[G]], void>;
declare function spyOn<T, M extends Classes<Required<T>>>(object: T, method: M): Required<T>[M] extends new (...args: infer A) => infer R ? JestMockCompat<A, R> : never;
declare function spyOn<T, M extends Methods<Required<T>>>(obj: T, methodName: M, mock?: T[M]): Required<T>[M] extends (...args: infer A) => infer R ? JestMockCompat<A, R> : never;
declare function fn<TArgs extends any[] = any[], R = any>(): JestMockCompatFn<TArgs, R>;
declare function fn<TArgs extends any[] = any[], R = any>(implementation: (...args: TArgs) => R): JestMockCompatFn<TArgs, R>;

declare class VitestUtils {
    private _timers;
    private _mockedDate;
    constructor();
    useFakeTimers(): void;
    useRealTimers(): void;
    runOnlyPendingTimers(): void | Promise<void>;
    runAllTimers(): void | Promise<void>;
    advanceTimersByTime(ms: number): void | Promise<void>;
    advanceTimersToNextTimer(): void | Promise<void>;
    getTimerCount(): number;
    mockCurrentDate(date: string | number | Date): void;
    restoreCurrentDate(): void;
    getMockedDate(): string | number | Date | null;
    spyOn: typeof spyOn;
    fn: typeof fn;
    /**
     * Makes all `imports` to passed module to be mocked.
     * - If there is a factory, will return it's result. The call to `vi.mock` is hoisted to the top of the file,
     * so you don't have access to variables declared in the global file scope, if you didn't put them before imports!
     * - If `__mocks__` folder with file of the same name exist, all imports will
     * return it.
     * - If there is no `__mocks__` folder or a file with the same name inside, will call original
     * module and mock it.
     * @param path Path to the module. Can be aliased, if your config suppors it
     * @param factory Factory for the mocked module. Has the highest priority.
     */
    mock(path: string, factory?: () => any): void;
    /**
     * Removes module from mocked registry. All subsequent calls to import will
     * return original module even if it was mocked.
     * @param path Path to the module. Can be aliased, if your config suppors it
     */
    unmock(path: string): void;
    /**
     * Imports module, bypassing all checks if it should be mocked.
     * Can be useful if you want to mock module partially.
     * @example
     * vi.mock('./example', async () => {
     *  const axios = await vi.importActual('./example')
     *
     *  return { ...axios, get: vi.fn() }
     * })
     * @param path Path to the module. Can be aliased, if your config suppors it
     * @returns Actual module without spies
     */
    importActual<T>(path: string): Promise<T>;
    /**
     * Imports a module with all of its properties and nested properties mocked.
     * For the rules applied, see docs.
     * @param path Path to the module. Can be aliased, if your config suppors it
     * @returns Fully mocked module
     */
    importMock<T>(path: string): Promise<MaybeMockedDeep<T>>;
    /**
     * Type helpers for TypeScript. In reality just returns the object that was passed.
     * @example
     * import example from './example'
     * vi.mock('./example')
     *
     * test('1+1 equals 2' async () => {
     *  vi.mocked(example.calc).mockRestore()
     *
     *  const res = example.calc(1, '+', 1)
     *
     *  expect(res).toBe(2)
     * })
     * @param item Anything that can be mocked
     * @param deep If the object is deeply mocked
     */
    mocked<T>(item: T, deep?: false): MaybeMocked<T>;
    mocked<T>(item: T, deep: true): MaybeMockedDeep<T>;
    isMockFunction(fn: any): fn is EnhancedSpy;
    clearAllMocks(): this;
    resetAllMocks(): this;
    restoreAllMocks(): this;
}
declare const vitest: VitestUtils;
declare const vi: VitestUtils;

interface TransformResultWithSource extends TransformResult {
    source?: string;
}
interface WebSocketHandlers {
    getFiles(): File[];
    getConfig(): ResolvedConfig;
    getModuleGraph(id: string): Promise<ModuleGraphData>;
    getTransformResult(id: string): Promise<TransformResultWithSource | undefined>;
    readFile(id: string): Promise<string>;
    writeFile(id: string, content: string): Promise<void>;
    rerun(files: string[]): Promise<void>;
}
interface WebSocketEvents extends Pick<Reporter, 'onCollected' | 'onTaskUpdate' | 'onUserConsoleLog'> {
}

declare type VitestInlineConfig = InlineConfig;

declare module 'vite' {
    interface UserConfig {
        /**
         * Options for Vitest
         */
        test?: VitestInlineConfig;
    }
}
interface AsymmetricMatchersContaining {
    stringContaining(expected: string): any;
    objectContaining(expected: any): any;
    arrayContaining(expected: unknown[]): any;
    stringMatching(expected: string | RegExp): any;
}
declare type Promisify<O> = {
    [K in keyof O]: O[K] extends (...args: infer A) => infer R ? O extends R ? Promisify<O[K]> : (...args: A) => Promise<R> : O[K];
};
declare global {
    namespace Chai {
        interface ExpectStatic extends AsymmetricMatchersContaining {
            <T>(actual: T, message?: string): VitestAssertion<T>;
            extend(expects: MatchersObject): void;
            assertions(expected: number): void;
            hasAssertions(): void;
            anything(): Anything;
            any(constructor: unknown): Any;
            addSnapshotSerializer(plugin: Plugin): void;
            getState(): MatcherState;
            setState(state: Partial<MatcherState>): void;
            not: AsymmetricMatchersContaining;
        }
        interface JestAssertion<T = any> {
            toMatchSnapshot<U extends {
                [P in keyof T]: any;
            }>(snapshot: Partial<U>, message?: string): void;
            toMatchSnapshot(message?: string): void;
            matchSnapshot<U extends {
                [P in keyof T]: any;
            }>(snapshot: Partial<U>, message?: string): void;
            matchSnapshot(message?: string): void;
            toMatchInlineSnapshot<U extends {
                [P in keyof T]: any;
            }>(properties: Partial<U>, snapshot?: string, message?: string): void;
            toMatchInlineSnapshot(snapshot?: string, message?: string): void;
            toThrowErrorMatchingSnapshot(message?: string): void;
            toThrowErrorMatchingInlineSnapshot(snapshot?: string, message?: string): void;
            toEqual<E>(expected: E): void;
            toStrictEqual<E>(expected: E): void;
            toBe<E>(expected: E): void;
            toMatch(expected: string | RegExp): void;
            toMatchObject<E extends {} | any[]>(expected: E): void;
            toContain<E>(item: E): void;
            toContainEqual<E>(item: E): void;
            toBeTruthy(): void;
            toBeFalsy(): void;
            toBeGreaterThan(num: number): void;
            toBeGreaterThanOrEqual(num: number): void;
            toBeLessThan(num: number): void;
            toBeLessThanOrEqual(num: number): void;
            toBeNaN(): void;
            toBeUndefined(): void;
            toBeNull(): void;
            toBeDefined(): void;
            toBeInstanceOf<E>(expected: E): void;
            toBeCalledTimes(times: number): void;
            toHaveLength(length: number): void;
            toHaveProperty<E>(property: string, value?: E): void;
            toBeCloseTo(number: number, numDigits?: number): void;
            toHaveBeenCalledTimes(times: number): void;
            toHaveBeenCalledOnce(): void;
            toHaveBeenCalled(): void;
            toBeCalled(): void;
            toHaveBeenCalledWith<E extends any[]>(...args: E): void;
            toBeCalledWith<E extends any[]>(...args: E): void;
            toHaveBeenNthCalledWith<E extends any[]>(n: number, ...args: E): void;
            nthCalledWith<E extends any[]>(nthCall: number, ...args: E): void;
            toHaveBeenLastCalledWith<E extends any[]>(...args: E): void;
            lastCalledWith<E extends any[]>(...args: E): void;
            toThrow(expected?: string | Constructable | RegExp | Error): void;
            toThrowError(expected?: string | Constructable | RegExp | Error): void;
            toReturn(): void;
            toHaveReturned(): void;
            toReturnTimes(times: number): void;
            toHaveReturnedTimes(times: number): void;
            toReturnWith<E>(value: E): void;
            toHaveReturnedWith<E>(value: E): void;
            toHaveLastReturnedWith<E>(value: E): void;
            lastReturnedWith<E>(value: E): void;
            toHaveNthReturnedWith<E>(nthCall: number, value: E): void;
            nthReturnedWith<E>(nthCall: number, value: E): void;
        }
        type VitestifyAssertion<A> = {
            [K in keyof A]: A[K] extends Assertion ? VitestAssertion<any> : A[K] extends (...args: any[]) => any ? A[K] : VitestifyAssertion<A[K]>;
        };
        interface VitestAssertion<T = any> extends VitestifyAssertion<Assertion>, JestAssertion<T> {
            resolves: Promisify<VitestAssertion<T>>;
            rejects: Promisify<VitestAssertion<T>>;
            chaiEqual<E>(expected: E): void;
        }
    }
}

export { ApiConfig, ArgumentsType, Arrayable, Awaitable, BuiltinEnvironment, Constructable, DoneCallback, EnhancedSpy, Environment, EnvironmentOptions, EnvironmentReturn, ErrorWithDiff, FetchFunction, File, HookListener, InlineConfig, JSDOMOptions, JestMockCompat, JestMockCompatContext, JestMockCompatFn, MaybeMocked, MaybeMockedConstructor, MaybeMockedDeep, MockWithArgs, MockedFunction, MockedFunctionDeep, MockedObject, MockedObjectDeep, ModuleCache, ModuleGraphData, Nullable, ParsedStack, Position, Reporter, ResolvedConfig, RunMode, RuntimeContext, SnapshotData, SnapshotMatchOptions, SnapshotResult, SnapshotStateOptions, SnapshotSummary, SnapshotUpdateState, Suite, SuiteCollector, SuiteHooks, Task, TaskBase, TaskResult, TaskResultPack, TaskState, Test, TestCollector, TestFactory, TestFunction, TransformResultWithSource, UncheckedSnapshot, UserConfig, UserConsoleLog, WebSocketEvents, WebSocketHandlers, WorkerContext, WorkerRPC, afterAll, afterEach, beforeAll, beforeEach, describe, expect, fn, isMockFunction, it, spies, spyOn, suite, test, vi, vitest };
