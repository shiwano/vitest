import { BirpcReturn } from 'birpc';
import { WebSocketEvents, WebSocketHandlers } from 'vitest';

declare type Arrayable<T> = T | Array<T>;
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

declare function getTests(suite: Arrayable<Task>): Test[];
declare function getTasks(tasks?: Arrayable<Task>): Task[];
declare function getSuites(suite: Arrayable<Task>): Suite[];
declare function hasTests(suite: Arrayable<Suite>): boolean;
declare function hasFailed(suite: Arrayable<Task>): boolean;
declare function hasFailedSnapshot(suite: Arrayable<Task>): boolean;
declare function getNames(task: Task): string[];

interface VitestClientOptions {
    handlers?: Partial<WebSocketEvents>;
    autoReconnect?: boolean;
    reconnectInterval?: number;
    reconnectTries?: number;
    reactive?: <T>(v: T) => T;
    ref?: <T>(v: T) => {
        value: T;
    };
    WebSocketConstructor?: typeof WebSocket;
}
interface VitestClient {
    ws: WebSocket;
    state: StateManager;
    rpc: BirpcReturn<WebSocketHandlers>;
    waitForConnection(): Promise<void>;
    reconnect(): Promise<void>;
}
declare function createClient(url: string, options?: VitestClientOptions): VitestClient;

export { VitestClient, VitestClientOptions, createClient, getNames, getSuites, getTasks, getTests, hasFailed, hasFailedSnapshot, hasTests };
