import path$2 from 'path';
import fs$2 from 'fs';
import require$$0 from 'util';
import childProcess$1 from 'child_process';
import { p as pathKey, m as mergeStream$1, a as getStream$1, b as crossSpawn$1 } from './index-432dd0c0.js';
import { a as signalExit, b as onetime$1 } from './index-5dc082fc.js';
import require$$0$1 from 'os';
import './_commonjsHelpers-c9e3b764.js';
import 'buffer';
import 'stream';
import 'assert';
import 'events';

var findUp$1 = {exports: {}};

var locatePath = {exports: {}};

class Node {
	/// value;
	/// next;

	constructor(value) {
		this.value = value;

		// TODO: Remove this when targeting Node.js 12.
		this.next = undefined;
	}
}

class Queue$1 {
	// TODO: Use private class fields when targeting Node.js 12.
	// #_head;
	// #_tail;
	// #_size;

	constructor() {
		this.clear();
	}

	enqueue(value) {
		const node = new Node(value);

		if (this._head) {
			this._tail.next = node;
			this._tail = node;
		} else {
			this._head = node;
			this._tail = node;
		}

		this._size++;
	}

	dequeue() {
		const current = this._head;
		if (!current) {
			return;
		}

		this._head = this._head.next;
		this._size--;
		return current.value;
	}

	clear() {
		this._head = undefined;
		this._tail = undefined;
		this._size = 0;
	}

	get size() {
		return this._size;
	}

	* [Symbol.iterator]() {
		let current = this._head;

		while (current) {
			yield current.value;
			current = current.next;
		}
	}
}

var yoctoQueue = Queue$1;

const Queue = yoctoQueue;

const pLimit$1 = concurrency => {
	if (!((Number.isInteger(concurrency) || concurrency === Infinity) && concurrency > 0)) {
		throw new TypeError('Expected `concurrency` to be a number from 1 and up');
	}

	const queue = new Queue();
	let activeCount = 0;

	const next = () => {
		activeCount--;

		if (queue.size > 0) {
			queue.dequeue()();
		}
	};

	const run = async (fn, resolve, ...args) => {
		activeCount++;

		const result = (async () => fn(...args))();

		resolve(result);

		try {
			await result;
		} catch {}

		next();
	};

	const enqueue = (fn, resolve, ...args) => {
		queue.enqueue(run.bind(null, fn, resolve, ...args));

		(async () => {
			// This function needs to wait until the next microtask before comparing
			// `activeCount` to `concurrency`, because `activeCount` is updated asynchronously
			// when the run function is dequeued and called. The comparison in the if-statement
			// needs to happen asynchronously as well to get an up-to-date value for `activeCount`.
			await Promise.resolve();

			if (activeCount < concurrency && queue.size > 0) {
				queue.dequeue()();
			}
		})();
	};

	const generator = (fn, ...args) => new Promise(resolve => {
		enqueue(fn, resolve, ...args);
	});

	Object.defineProperties(generator, {
		activeCount: {
			get: () => activeCount
		},
		pendingCount: {
			get: () => queue.size
		},
		clearQueue: {
			value: () => {
				queue.clear();
			}
		}
	});

	return generator;
};

var pLimit_1 = pLimit$1;

const pLimit = pLimit_1;

class EndError extends Error {
	constructor(value) {
		super();
		this.value = value;
	}
}

// The input can also be a promise, so we await it
const testElement = async (element, tester) => tester(await element);

// The input can also be a promise, so we `Promise.all()` them both
const finder = async element => {
	const values = await Promise.all(element);
	if (values[1] === true) {
		throw new EndError(values[0]);
	}

	return false;
};

const pLocate$1 = async (iterable, tester, options) => {
	options = {
		concurrency: Infinity,
		preserveOrder: true,
		...options
	};

	const limit = pLimit(options.concurrency);

	// Start all the promises concurrently with optional limit
	const items = [...iterable].map(element => [element, limit(testElement, element, tester)]);

	// Check the promises either serially or concurrently
	const checkLimit = pLimit(options.preserveOrder ? 1 : Infinity);

	try {
		await Promise.all(items.map(element => checkLimit(finder, element)));
	} catch (error) {
		if (error instanceof EndError) {
			return error.value;
		}

		throw error;
	}
};

var pLocate_1 = pLocate$1;

const path$1 = path$2;
const fs$1 = fs$2;
const {promisify: promisify$1} = require$$0;
const pLocate = pLocate_1;

const fsStat = promisify$1(fs$1.stat);
const fsLStat = promisify$1(fs$1.lstat);

const typeMappings = {
	directory: 'isDirectory',
	file: 'isFile'
};

function checkType({type}) {
	if (type in typeMappings) {
		return;
	}

	throw new Error(`Invalid type specified: ${type}`);
}

const matchType = (type, stat) => type === undefined || stat[typeMappings[type]]();

locatePath.exports = async (paths, options) => {
	options = {
		cwd: process.cwd(),
		type: 'file',
		allowSymlinks: true,
		...options
	};

	checkType(options);

	const statFn = options.allowSymlinks ? fsStat : fsLStat;

	return pLocate(paths, async path_ => {
		try {
			const stat = await statFn(path$1.resolve(options.cwd, path_));
			return matchType(options.type, stat);
		} catch {
			return false;
		}
	}, options);
};

locatePath.exports.sync = (paths, options) => {
	options = {
		cwd: process.cwd(),
		allowSymlinks: true,
		type: 'file',
		...options
	};

	checkType(options);

	const statFn = options.allowSymlinks ? fs$1.statSync : fs$1.lstatSync;

	for (const path_ of paths) {
		try {
			const stat = statFn(path$1.resolve(options.cwd, path_));

			if (matchType(options.type, stat)) {
				return path_;
			}
		} catch {}
	}
};

var pathExists = {exports: {}};

const fs = fs$2;
const {promisify} = require$$0;

const pAccess = promisify(fs.access);

pathExists.exports = async path => {
	try {
		await pAccess(path);
		return true;
	} catch (_) {
		return false;
	}
};

pathExists.exports.sync = path => {
	try {
		fs.accessSync(path);
		return true;
	} catch (_) {
		return false;
	}
};

(function (module) {
const path = path$2;
const locatePath$1 = locatePath.exports;
const pathExists$1 = pathExists.exports;

const stop = Symbol('findUp.stop');

module.exports = async (name, options = {}) => {
	let directory = path.resolve(options.cwd || '');
	const {root} = path.parse(directory);
	const paths = [].concat(name);

	const runMatcher = async locateOptions => {
		if (typeof name !== 'function') {
			return locatePath$1(paths, locateOptions);
		}

		const foundPath = await name(locateOptions.cwd);
		if (typeof foundPath === 'string') {
			return locatePath$1([foundPath], locateOptions);
		}

		return foundPath;
	};

	// eslint-disable-next-line no-constant-condition
	while (true) {
		// eslint-disable-next-line no-await-in-loop
		const foundPath = await runMatcher({...options, cwd: directory});

		if (foundPath === stop) {
			return;
		}

		if (foundPath) {
			return path.resolve(directory, foundPath);
		}

		if (directory === root) {
			return;
		}

		directory = path.dirname(directory);
	}
};

module.exports.sync = (name, options = {}) => {
	let directory = path.resolve(options.cwd || '');
	const {root} = path.parse(directory);
	const paths = [].concat(name);

	const runMatcher = locateOptions => {
		if (typeof name !== 'function') {
			return locatePath$1.sync(paths, locateOptions);
		}

		const foundPath = name(locateOptions.cwd);
		if (typeof foundPath === 'string') {
			return locatePath$1.sync([foundPath], locateOptions);
		}

		return foundPath;
	};

	// eslint-disable-next-line no-constant-condition
	while (true) {
		const foundPath = runMatcher({...options, cwd: directory});

		if (foundPath === stop) {
			return;
		}

		if (foundPath) {
			return path.resolve(directory, foundPath);
		}

		if (directory === root) {
			return;
		}

		directory = path.dirname(directory);
	}
};

module.exports.exists = pathExists$1;

module.exports.sync.exists = pathExists$1.sync;

module.exports.stop = stop;
}(findUp$1));

var findUp = findUp$1.exports;

var execa$2 = {exports: {}};

var stripFinalNewline$1 = input => {
	const LF = typeof input === 'string' ? '\n' : '\n'.charCodeAt();
	const CR = typeof input === 'string' ? '\r' : '\r'.charCodeAt();

	if (input[input.length - 1] === LF) {
		input = input.slice(0, input.length - 1);
	}

	if (input[input.length - 1] === CR) {
		input = input.slice(0, input.length - 1);
	}

	return input;
};

var npmRunPath$1 = {exports: {}};

(function (module) {
const path = path$2;
const pathKey$1 = pathKey.exports;

const npmRunPath = options => {
	options = {
		cwd: process.cwd(),
		path: process.env[pathKey$1()],
		execPath: process.execPath,
		...options
	};

	let previous;
	let cwdPath = path.resolve(options.cwd);
	const result = [];

	while (previous !== cwdPath) {
		result.push(path.join(cwdPath, 'node_modules/.bin'));
		previous = cwdPath;
		cwdPath = path.resolve(cwdPath, '..');
	}

	// Ensure the running `node` binary is used
	const execPathDir = path.resolve(options.cwd, options.execPath, '..');
	result.push(execPathDir);

	return result.concat(options.path).join(path.delimiter);
};

module.exports = npmRunPath;
// TODO: Remove this for the next major release
module.exports.default = npmRunPath;

module.exports.env = options => {
	options = {
		env: process.env,
		...options
	};

	const env = {...options.env};
	const path = pathKey$1({env});

	options.path = env[path];
	env[path] = module.exports(options);

	return env;
};
}(npmRunPath$1));

var main = {};

var signals = {};

var core = {};

Object.defineProperty(core,"__esModule",{value:true});core.SIGNALS=void 0;

const SIGNALS=[
{
name:"SIGHUP",
number:1,
action:"terminate",
description:"Terminal closed",
standard:"posix"},

{
name:"SIGINT",
number:2,
action:"terminate",
description:"User interruption with CTRL-C",
standard:"ansi"},

{
name:"SIGQUIT",
number:3,
action:"core",
description:"User interruption with CTRL-\\",
standard:"posix"},

{
name:"SIGILL",
number:4,
action:"core",
description:"Invalid machine instruction",
standard:"ansi"},

{
name:"SIGTRAP",
number:5,
action:"core",
description:"Debugger breakpoint",
standard:"posix"},

{
name:"SIGABRT",
number:6,
action:"core",
description:"Aborted",
standard:"ansi"},

{
name:"SIGIOT",
number:6,
action:"core",
description:"Aborted",
standard:"bsd"},

{
name:"SIGBUS",
number:7,
action:"core",
description:
"Bus error due to misaligned, non-existing address or paging error",
standard:"bsd"},

{
name:"SIGEMT",
number:7,
action:"terminate",
description:"Command should be emulated but is not implemented",
standard:"other"},

{
name:"SIGFPE",
number:8,
action:"core",
description:"Floating point arithmetic error",
standard:"ansi"},

{
name:"SIGKILL",
number:9,
action:"terminate",
description:"Forced termination",
standard:"posix",
forced:true},

{
name:"SIGUSR1",
number:10,
action:"terminate",
description:"Application-specific signal",
standard:"posix"},

{
name:"SIGSEGV",
number:11,
action:"core",
description:"Segmentation fault",
standard:"ansi"},

{
name:"SIGUSR2",
number:12,
action:"terminate",
description:"Application-specific signal",
standard:"posix"},

{
name:"SIGPIPE",
number:13,
action:"terminate",
description:"Broken pipe or socket",
standard:"posix"},

{
name:"SIGALRM",
number:14,
action:"terminate",
description:"Timeout or timer",
standard:"posix"},

{
name:"SIGTERM",
number:15,
action:"terminate",
description:"Termination",
standard:"ansi"},

{
name:"SIGSTKFLT",
number:16,
action:"terminate",
description:"Stack is empty or overflowed",
standard:"other"},

{
name:"SIGCHLD",
number:17,
action:"ignore",
description:"Child process terminated, paused or unpaused",
standard:"posix"},

{
name:"SIGCLD",
number:17,
action:"ignore",
description:"Child process terminated, paused or unpaused",
standard:"other"},

{
name:"SIGCONT",
number:18,
action:"unpause",
description:"Unpaused",
standard:"posix",
forced:true},

{
name:"SIGSTOP",
number:19,
action:"pause",
description:"Paused",
standard:"posix",
forced:true},

{
name:"SIGTSTP",
number:20,
action:"pause",
description:"Paused using CTRL-Z or \"suspend\"",
standard:"posix"},

{
name:"SIGTTIN",
number:21,
action:"pause",
description:"Background process cannot read terminal input",
standard:"posix"},

{
name:"SIGBREAK",
number:21,
action:"terminate",
description:"User interruption with CTRL-BREAK",
standard:"other"},

{
name:"SIGTTOU",
number:22,
action:"pause",
description:"Background process cannot write to terminal output",
standard:"posix"},

{
name:"SIGURG",
number:23,
action:"ignore",
description:"Socket received out-of-band data",
standard:"bsd"},

{
name:"SIGXCPU",
number:24,
action:"core",
description:"Process timed out",
standard:"bsd"},

{
name:"SIGXFSZ",
number:25,
action:"core",
description:"File too big",
standard:"bsd"},

{
name:"SIGVTALRM",
number:26,
action:"terminate",
description:"Timeout or timer",
standard:"bsd"},

{
name:"SIGPROF",
number:27,
action:"terminate",
description:"Timeout or timer",
standard:"bsd"},

{
name:"SIGWINCH",
number:28,
action:"ignore",
description:"Terminal window size changed",
standard:"bsd"},

{
name:"SIGIO",
number:29,
action:"terminate",
description:"I/O is available",
standard:"other"},

{
name:"SIGPOLL",
number:29,
action:"terminate",
description:"Watched event",
standard:"other"},

{
name:"SIGINFO",
number:29,
action:"ignore",
description:"Request for process information",
standard:"other"},

{
name:"SIGPWR",
number:30,
action:"terminate",
description:"Device running out of power",
standard:"systemv"},

{
name:"SIGSYS",
number:31,
action:"core",
description:"Invalid system call",
standard:"other"},

{
name:"SIGUNUSED",
number:31,
action:"terminate",
description:"Invalid system call",
standard:"other"}];core.SIGNALS=SIGNALS;

var realtime = {};

Object.defineProperty(realtime,"__esModule",{value:true});realtime.SIGRTMAX=realtime.getRealtimeSignals=void 0;
const getRealtimeSignals=function(){
const length=SIGRTMAX-SIGRTMIN+1;
return Array.from({length},getRealtimeSignal);
};realtime.getRealtimeSignals=getRealtimeSignals;

const getRealtimeSignal=function(value,index){
return {
name:`SIGRT${index+1}`,
number:SIGRTMIN+index,
action:"terminate",
description:"Application-specific signal (realtime)",
standard:"posix"};

};

const SIGRTMIN=34;
const SIGRTMAX=64;realtime.SIGRTMAX=SIGRTMAX;

Object.defineProperty(signals,"__esModule",{value:true});signals.getSignals=void 0;var _os$1=require$$0$1;

var _core=core;
var _realtime$1=realtime;



const getSignals=function(){
const realtimeSignals=(0, _realtime$1.getRealtimeSignals)();
const signals=[..._core.SIGNALS,...realtimeSignals].map(normalizeSignal);
return signals;
};signals.getSignals=getSignals;







const normalizeSignal=function({
name,
number:defaultNumber,
description,
action,
forced=false,
standard})
{
const{
signals:{[name]:constantSignal}}=
_os$1.constants;
const supported=constantSignal!==undefined;
const number=supported?constantSignal:defaultNumber;
return {name,number,description,supported,action,forced,standard};
};

Object.defineProperty(main,"__esModule",{value:true});main.signalsByNumber=main.signalsByName=void 0;var _os=require$$0$1;

var _signals=signals;
var _realtime=realtime;



const getSignalsByName=function(){
const signals=(0, _signals.getSignals)();
return signals.reduce(getSignalByName,{});
};

const getSignalByName=function(
signalByNameMemo,
{name,number,description,supported,action,forced,standard})
{
return {
...signalByNameMemo,
[name]:{name,number,description,supported,action,forced,standard}};

};

const signalsByName$1=getSignalsByName();main.signalsByName=signalsByName$1;




const getSignalsByNumber=function(){
const signals=(0, _signals.getSignals)();
const length=_realtime.SIGRTMAX+1;
const signalsA=Array.from({length},(value,number)=>
getSignalByNumber(number,signals));

return Object.assign({},...signalsA);
};

const getSignalByNumber=function(number,signals){
const signal=findSignalByNumber(number,signals);

if(signal===undefined){
return {};
}

const{name,description,supported,action,forced,standard}=signal;
return {
[number]:{
name,
number,
description,
supported,
action,
forced,
standard}};


};



const findSignalByNumber=function(number,signals){
const signal=signals.find(({name})=>_os.constants.signals[name]===number);

if(signal!==undefined){
return signal;
}

return signals.find(signalA=>signalA.number===number);
};

const signalsByNumber=getSignalsByNumber();main.signalsByNumber=signalsByNumber;

const {signalsByName} = main;

const getErrorPrefix = ({timedOut, timeout, errorCode, signal, signalDescription, exitCode, isCanceled}) => {
	if (timedOut) {
		return `timed out after ${timeout} milliseconds`;
	}

	if (isCanceled) {
		return 'was canceled';
	}

	if (errorCode !== undefined) {
		return `failed with ${errorCode}`;
	}

	if (signal !== undefined) {
		return `was killed with ${signal} (${signalDescription})`;
	}

	if (exitCode !== undefined) {
		return `failed with exit code ${exitCode}`;
	}

	return 'failed';
};

const makeError$1 = ({
	stdout,
	stderr,
	all,
	error,
	signal,
	exitCode,
	command,
	escapedCommand,
	timedOut,
	isCanceled,
	killed,
	parsed: {options: {timeout}}
}) => {
	// `signal` and `exitCode` emitted on `spawned.on('exit')` event can be `null`.
	// We normalize them to `undefined`
	exitCode = exitCode === null ? undefined : exitCode;
	signal = signal === null ? undefined : signal;
	const signalDescription = signal === undefined ? undefined : signalsByName[signal].description;

	const errorCode = error && error.code;

	const prefix = getErrorPrefix({timedOut, timeout, errorCode, signal, signalDescription, exitCode, isCanceled});
	const execaMessage = `Command ${prefix}: ${command}`;
	const isError = Object.prototype.toString.call(error) === '[object Error]';
	const shortMessage = isError ? `${execaMessage}\n${error.message}` : execaMessage;
	const message = [shortMessage, stderr, stdout].filter(Boolean).join('\n');

	if (isError) {
		error.originalMessage = error.message;
		error.message = message;
	} else {
		error = new Error(message);
	}

	error.shortMessage = shortMessage;
	error.command = command;
	error.escapedCommand = escapedCommand;
	error.exitCode = exitCode;
	error.signal = signal;
	error.signalDescription = signalDescription;
	error.stdout = stdout;
	error.stderr = stderr;

	if (all !== undefined) {
		error.all = all;
	}

	if ('bufferedData' in error) {
		delete error.bufferedData;
	}

	error.failed = true;
	error.timedOut = Boolean(timedOut);
	error.isCanceled = isCanceled;
	error.killed = killed && !timedOut;

	return error;
};

var error = makeError$1;

var stdio = {exports: {}};

const aliases = ['stdin', 'stdout', 'stderr'];

const hasAlias = options => aliases.some(alias => options[alias] !== undefined);

const normalizeStdio$1 = options => {
	if (!options) {
		return;
	}

	const {stdio} = options;

	if (stdio === undefined) {
		return aliases.map(alias => options[alias]);
	}

	if (hasAlias(options)) {
		throw new Error(`It's not possible to provide \`stdio\` in combination with one of ${aliases.map(alias => `\`${alias}\``).join(', ')}`);
	}

	if (typeof stdio === 'string') {
		return stdio;
	}

	if (!Array.isArray(stdio)) {
		throw new TypeError(`Expected \`stdio\` to be of type \`string\` or \`Array\`, got \`${typeof stdio}\``);
	}

	const length = Math.max(stdio.length, aliases.length);
	return Array.from({length}, (value, index) => stdio[index]);
};

stdio.exports = normalizeStdio$1;

// `ipc` is pushed unless it is already present
stdio.exports.node = options => {
	const stdio = normalizeStdio$1(options);

	if (stdio === 'ipc') {
		return 'ipc';
	}

	if (stdio === undefined || typeof stdio === 'string') {
		return [stdio, stdio, stdio, 'ipc'];
	}

	if (stdio.includes('ipc')) {
		return stdio;
	}

	return [...stdio, 'ipc'];
};

const os = require$$0$1;
const onExit = signalExit.exports;

const DEFAULT_FORCE_KILL_TIMEOUT = 1000 * 5;

// Monkey-patches `childProcess.kill()` to add `forceKillAfterTimeout` behavior
const spawnedKill$1 = (kill, signal = 'SIGTERM', options = {}) => {
	const killResult = kill(signal);
	setKillTimeout(kill, signal, options, killResult);
	return killResult;
};

const setKillTimeout = (kill, signal, options, killResult) => {
	if (!shouldForceKill(signal, options, killResult)) {
		return;
	}

	const timeout = getForceKillAfterTimeout(options);
	const t = setTimeout(() => {
		kill('SIGKILL');
	}, timeout);

	// Guarded because there's no `.unref()` when `execa` is used in the renderer
	// process in Electron. This cannot be tested since we don't run tests in
	// Electron.
	// istanbul ignore else
	if (t.unref) {
		t.unref();
	}
};

const shouldForceKill = (signal, {forceKillAfterTimeout}, killResult) => {
	return isSigterm(signal) && forceKillAfterTimeout !== false && killResult;
};

const isSigterm = signal => {
	return signal === os.constants.signals.SIGTERM ||
		(typeof signal === 'string' && signal.toUpperCase() === 'SIGTERM');
};

const getForceKillAfterTimeout = ({forceKillAfterTimeout = true}) => {
	if (forceKillAfterTimeout === true) {
		return DEFAULT_FORCE_KILL_TIMEOUT;
	}

	if (!Number.isFinite(forceKillAfterTimeout) || forceKillAfterTimeout < 0) {
		throw new TypeError(`Expected the \`forceKillAfterTimeout\` option to be a non-negative integer, got \`${forceKillAfterTimeout}\` (${typeof forceKillAfterTimeout})`);
	}

	return forceKillAfterTimeout;
};

// `childProcess.cancel()`
const spawnedCancel$1 = (spawned, context) => {
	const killResult = spawned.kill();

	if (killResult) {
		context.isCanceled = true;
	}
};

const timeoutKill = (spawned, signal, reject) => {
	spawned.kill(signal);
	reject(Object.assign(new Error('Timed out'), {timedOut: true, signal}));
};

// `timeout` option handling
const setupTimeout$1 = (spawned, {timeout, killSignal = 'SIGTERM'}, spawnedPromise) => {
	if (timeout === 0 || timeout === undefined) {
		return spawnedPromise;
	}

	let timeoutId;
	const timeoutPromise = new Promise((resolve, reject) => {
		timeoutId = setTimeout(() => {
			timeoutKill(spawned, killSignal, reject);
		}, timeout);
	});

	const safeSpawnedPromise = spawnedPromise.finally(() => {
		clearTimeout(timeoutId);
	});

	return Promise.race([timeoutPromise, safeSpawnedPromise]);
};

const validateTimeout$1 = ({timeout}) => {
	if (timeout !== undefined && (!Number.isFinite(timeout) || timeout < 0)) {
		throw new TypeError(`Expected the \`timeout\` option to be a non-negative integer, got \`${timeout}\` (${typeof timeout})`);
	}
};

// `cleanup` option handling
const setExitHandler$1 = async (spawned, {cleanup, detached}, timedPromise) => {
	if (!cleanup || detached) {
		return timedPromise;
	}

	const removeExitHandler = onExit(() => {
		spawned.kill();
	});

	return timedPromise.finally(() => {
		removeExitHandler();
	});
};

var kill = {
	spawnedKill: spawnedKill$1,
	spawnedCancel: spawnedCancel$1,
	setupTimeout: setupTimeout$1,
	validateTimeout: validateTimeout$1,
	setExitHandler: setExitHandler$1
};

const isStream$1 = stream =>
	stream !== null &&
	typeof stream === 'object' &&
	typeof stream.pipe === 'function';

isStream$1.writable = stream =>
	isStream$1(stream) &&
	stream.writable !== false &&
	typeof stream._write === 'function' &&
	typeof stream._writableState === 'object';

isStream$1.readable = stream =>
	isStream$1(stream) &&
	stream.readable !== false &&
	typeof stream._read === 'function' &&
	typeof stream._readableState === 'object';

isStream$1.duplex = stream =>
	isStream$1.writable(stream) &&
	isStream$1.readable(stream);

isStream$1.transform = stream =>
	isStream$1.duplex(stream) &&
	typeof stream._transform === 'function';

var isStream_1 = isStream$1;

const isStream = isStream_1;
const getStream = getStream$1.exports;
const mergeStream = mergeStream$1;

// `input` option
const handleInput$1 = (spawned, input) => {
	// Checking for stdin is workaround for https://github.com/nodejs/node/issues/26852
	// @todo remove `|| spawned.stdin === undefined` once we drop support for Node.js <=12.2.0
	if (input === undefined || spawned.stdin === undefined) {
		return;
	}

	if (isStream(input)) {
		input.pipe(spawned.stdin);
	} else {
		spawned.stdin.end(input);
	}
};

// `all` interleaves `stdout` and `stderr`
const makeAllStream$1 = (spawned, {all}) => {
	if (!all || (!spawned.stdout && !spawned.stderr)) {
		return;
	}

	const mixed = mergeStream();

	if (spawned.stdout) {
		mixed.add(spawned.stdout);
	}

	if (spawned.stderr) {
		mixed.add(spawned.stderr);
	}

	return mixed;
};

// On failure, `result.stdout|stderr|all` should contain the currently buffered stream
const getBufferedData = async (stream, streamPromise) => {
	if (!stream) {
		return;
	}

	stream.destroy();

	try {
		return await streamPromise;
	} catch (error) {
		return error.bufferedData;
	}
};

const getStreamPromise = (stream, {encoding, buffer, maxBuffer}) => {
	if (!stream || !buffer) {
		return;
	}

	if (encoding) {
		return getStream(stream, {encoding, maxBuffer});
	}

	return getStream.buffer(stream, {maxBuffer});
};

// Retrieve result of child process: exit code, signal, error, streams (stdout/stderr/all)
const getSpawnedResult$1 = async ({stdout, stderr, all}, {encoding, buffer, maxBuffer}, processDone) => {
	const stdoutPromise = getStreamPromise(stdout, {encoding, buffer, maxBuffer});
	const stderrPromise = getStreamPromise(stderr, {encoding, buffer, maxBuffer});
	const allPromise = getStreamPromise(all, {encoding, buffer, maxBuffer: maxBuffer * 2});

	try {
		return await Promise.all([processDone, stdoutPromise, stderrPromise, allPromise]);
	} catch (error) {
		return Promise.all([
			{error, signal: error.signal, timedOut: error.timedOut},
			getBufferedData(stdout, stdoutPromise),
			getBufferedData(stderr, stderrPromise),
			getBufferedData(all, allPromise)
		]);
	}
};

const validateInputSync$1 = ({input}) => {
	if (isStream(input)) {
		throw new TypeError('The `input` option cannot be a stream in sync mode');
	}
};

var stream = {
	handleInput: handleInput$1,
	makeAllStream: makeAllStream$1,
	getSpawnedResult: getSpawnedResult$1,
	validateInputSync: validateInputSync$1
};

const nativePromisePrototype = (async () => {})().constructor.prototype;
const descriptors = ['then', 'catch', 'finally'].map(property => [
	property,
	Reflect.getOwnPropertyDescriptor(nativePromisePrototype, property)
]);

// The return value is a mixin of `childProcess` and `Promise`
const mergePromise$1 = (spawned, promise) => {
	for (const [property, descriptor] of descriptors) {
		// Starting the main `promise` is deferred to avoid consuming streams
		const value = typeof promise === 'function' ?
			(...args) => Reflect.apply(descriptor.value, promise(), args) :
			descriptor.value.bind(promise);

		Reflect.defineProperty(spawned, property, {...descriptor, value});
	}

	return spawned;
};

// Use promises instead of `child_process` events
const getSpawnedPromise$1 = spawned => {
	return new Promise((resolve, reject) => {
		spawned.on('exit', (exitCode, signal) => {
			resolve({exitCode, signal});
		});

		spawned.on('error', error => {
			reject(error);
		});

		if (spawned.stdin) {
			spawned.stdin.on('error', error => {
				reject(error);
			});
		}
	});
};

var promise = {
	mergePromise: mergePromise$1,
	getSpawnedPromise: getSpawnedPromise$1
};

const normalizeArgs = (file, args = []) => {
	if (!Array.isArray(args)) {
		return [file];
	}

	return [file, ...args];
};

const NO_ESCAPE_REGEXP = /^[\w.-]+$/;
const DOUBLE_QUOTES_REGEXP = /"/g;

const escapeArg = arg => {
	if (typeof arg !== 'string' || NO_ESCAPE_REGEXP.test(arg)) {
		return arg;
	}

	return `"${arg.replace(DOUBLE_QUOTES_REGEXP, '\\"')}"`;
};

const joinCommand$1 = (file, args) => {
	return normalizeArgs(file, args).join(' ');
};

const getEscapedCommand$1 = (file, args) => {
	return normalizeArgs(file, args).map(arg => escapeArg(arg)).join(' ');
};

const SPACES_REGEXP = / +/g;

// Handle `execa.command()`
const parseCommand$1 = command => {
	const tokens = [];
	for (const token of command.trim().split(SPACES_REGEXP)) {
		// Allow spaces to be escaped by a backslash if not meant as a delimiter
		const previousToken = tokens[tokens.length - 1];
		if (previousToken && previousToken.endsWith('\\')) {
			// Merge previous token with current one
			tokens[tokens.length - 1] = `${previousToken.slice(0, -1)} ${token}`;
		} else {
			tokens.push(token);
		}
	}

	return tokens;
};

var command = {
	joinCommand: joinCommand$1,
	getEscapedCommand: getEscapedCommand$1,
	parseCommand: parseCommand$1
};

const path = path$2;
const childProcess = childProcess$1;
const crossSpawn = crossSpawn$1.exports;
const stripFinalNewline = stripFinalNewline$1;
const npmRunPath = npmRunPath$1.exports;
const onetime = onetime$1.exports;
const makeError = error;
const normalizeStdio = stdio.exports;
const {spawnedKill, spawnedCancel, setupTimeout, validateTimeout, setExitHandler} = kill;
const {handleInput, getSpawnedResult, makeAllStream, validateInputSync} = stream;
const {mergePromise, getSpawnedPromise} = promise;
const {joinCommand, parseCommand, getEscapedCommand} = command;

const DEFAULT_MAX_BUFFER = 1000 * 1000 * 100;

const getEnv = ({env: envOption, extendEnv, preferLocal, localDir, execPath}) => {
	const env = extendEnv ? {...process.env, ...envOption} : envOption;

	if (preferLocal) {
		return npmRunPath.env({env, cwd: localDir, execPath});
	}

	return env;
};

const handleArguments = (file, args, options = {}) => {
	const parsed = crossSpawn._parse(file, args, options);
	file = parsed.command;
	args = parsed.args;
	options = parsed.options;

	options = {
		maxBuffer: DEFAULT_MAX_BUFFER,
		buffer: true,
		stripFinalNewline: true,
		extendEnv: true,
		preferLocal: false,
		localDir: options.cwd || process.cwd(),
		execPath: process.execPath,
		encoding: 'utf8',
		reject: true,
		cleanup: true,
		all: false,
		windowsHide: true,
		...options
	};

	options.env = getEnv(options);

	options.stdio = normalizeStdio(options);

	if (process.platform === 'win32' && path.basename(file, '.exe') === 'cmd') {
		// #116
		args.unshift('/q');
	}

	return {file, args, options, parsed};
};

const handleOutput = (options, value, error) => {
	if (typeof value !== 'string' && !Buffer.isBuffer(value)) {
		// When `execa.sync()` errors, we normalize it to '' to mimic `execa()`
		return error === undefined ? undefined : '';
	}

	if (options.stripFinalNewline) {
		return stripFinalNewline(value);
	}

	return value;
};

const execa = (file, args, options) => {
	const parsed = handleArguments(file, args, options);
	const command = joinCommand(file, args);
	const escapedCommand = getEscapedCommand(file, args);

	validateTimeout(parsed.options);

	let spawned;
	try {
		spawned = childProcess.spawn(parsed.file, parsed.args, parsed.options);
	} catch (error) {
		// Ensure the returned error is always both a promise and a child process
		const dummySpawned = new childProcess.ChildProcess();
		const errorPromise = Promise.reject(makeError({
			error,
			stdout: '',
			stderr: '',
			all: '',
			command,
			escapedCommand,
			parsed,
			timedOut: false,
			isCanceled: false,
			killed: false
		}));
		return mergePromise(dummySpawned, errorPromise);
	}

	const spawnedPromise = getSpawnedPromise(spawned);
	const timedPromise = setupTimeout(spawned, parsed.options, spawnedPromise);
	const processDone = setExitHandler(spawned, parsed.options, timedPromise);

	const context = {isCanceled: false};

	spawned.kill = spawnedKill.bind(null, spawned.kill.bind(spawned));
	spawned.cancel = spawnedCancel.bind(null, spawned, context);

	const handlePromise = async () => {
		const [{error, exitCode, signal, timedOut}, stdoutResult, stderrResult, allResult] = await getSpawnedResult(spawned, parsed.options, processDone);
		const stdout = handleOutput(parsed.options, stdoutResult);
		const stderr = handleOutput(parsed.options, stderrResult);
		const all = handleOutput(parsed.options, allResult);

		if (error || exitCode !== 0 || signal !== null) {
			const returnedError = makeError({
				error,
				exitCode,
				signal,
				stdout,
				stderr,
				all,
				command,
				escapedCommand,
				parsed,
				timedOut,
				isCanceled: context.isCanceled,
				killed: spawned.killed
			});

			if (!parsed.options.reject) {
				return returnedError;
			}

			throw returnedError;
		}

		return {
			command,
			escapedCommand,
			exitCode: 0,
			stdout,
			stderr,
			all,
			failed: false,
			timedOut: false,
			isCanceled: false,
			killed: false
		};
	};

	const handlePromiseOnce = onetime(handlePromise);

	handleInput(spawned, parsed.options.input);

	spawned.all = makeAllStream(spawned, parsed.options);

	return mergePromise(spawned, handlePromiseOnce);
};

execa$2.exports = execa;

execa$2.exports.sync = (file, args, options) => {
	const parsed = handleArguments(file, args, options);
	const command = joinCommand(file, args);
	const escapedCommand = getEscapedCommand(file, args);

	validateInputSync(parsed.options);

	let result;
	try {
		result = childProcess.spawnSync(parsed.file, parsed.args, parsed.options);
	} catch (error) {
		throw makeError({
			error,
			stdout: '',
			stderr: '',
			all: '',
			command,
			escapedCommand,
			parsed,
			timedOut: false,
			isCanceled: false,
			killed: false
		});
	}

	const stdout = handleOutput(parsed.options, result.stdout, result.error);
	const stderr = handleOutput(parsed.options, result.stderr, result.error);

	if (result.error || result.status !== 0 || result.signal !== null) {
		const error = makeError({
			stdout,
			stderr,
			error: result.error,
			signal: result.signal,
			exitCode: result.status,
			command,
			escapedCommand,
			parsed,
			timedOut: result.error && result.error.code === 'ETIMEDOUT',
			isCanceled: false,
			killed: result.signal !== null
		});

		if (!parsed.options.reject) {
			return error;
		}

		throw error;
	}

	return {
		command,
		escapedCommand,
		exitCode: 0,
		stdout,
		stderr,
		failed: false,
		timedOut: false,
		isCanceled: false,
		killed: false
	};
};

execa$2.exports.command = (command, options) => {
	const [file, ...args] = parseCommand(command);
	return execa(file, args, options);
};

execa$2.exports.commandSync = (command, options) => {
	const [file, ...args] = parseCommand(command);
	return execa.sync(file, args, options);
};

execa$2.exports.node = (scriptPath, args, options = {}) => {
	if (args && !Array.isArray(args) && typeof args === 'object') {
		options = args;
		args = [];
	}

	const stdio = normalizeStdio.node(options);
	const defaultExecArgv = process.execArgv.filter(arg => !arg.startsWith('--inspect'));

	const {
		nodePath = process.execPath,
		nodeOptions = defaultExecArgv
	} = options;

	return execa(
		nodePath,
		[
			...nodeOptions,
			scriptPath,
			...(Array.isArray(args) ? args : [])
		],
		{
			...options,
			stdin: undefined,
			stdout: undefined,
			stderr: undefined,
			stdio,
			shell: false
		}
	);
};

var execa$1 = execa$2.exports;

// src/detect.ts
var LOCKS = {
  "pnpm-lock.yaml": "pnpm",
  "yarn.lock": "yarn",
  "package-lock.json": "npm"
};
async function detectPackageManager(cwd = process.cwd()) {
  const result = await findUp(Object.keys(LOCKS), { cwd });
  const agent = result ? LOCKS[path$2.basename(result)] : null;
  return agent;
}
async function installPackage(names, options = {}) {
  const agent = options.packageManager || await detectPackageManager(options.cwd) || "npm";
  if (!Array.isArray(names))
    names = [names];
  const args = options.additionalArgs || [];
  if (options.preferOffline)
    args.unshift("--prefer-offline");
  return execa$1(agent, [
    agent === "yarn" ? "add" : "install",
    options.dev ? "-D" : "",
    ...args,
    ...names
  ].filter(Boolean), {
    stdio: options.silent ? "ignore" : "inherit",
    cwd: options.cwd
  });
}

export { detectPackageManager, installPackage };
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXgtOTlhZjc2ODguanMiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL25vZGVfbW9kdWxlcy8ucG5wbS95b2N0by1xdWV1ZUAwLjEuMC9ub2RlX21vZHVsZXMveW9jdG8tcXVldWUvaW5kZXguanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvLnBucG0vcC1saW1pdEAzLjEuMC9ub2RlX21vZHVsZXMvcC1saW1pdC9pbmRleC5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy8ucG5wbS9wLWxvY2F0ZUA1LjAuMC9ub2RlX21vZHVsZXMvcC1sb2NhdGUvaW5kZXguanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvLnBucG0vbG9jYXRlLXBhdGhANi4wLjAvbm9kZV9tb2R1bGVzL2xvY2F0ZS1wYXRoL2luZGV4LmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzLy5wbnBtL3BhdGgtZXhpc3RzQDQuMC4wL25vZGVfbW9kdWxlcy9wYXRoLWV4aXN0cy9pbmRleC5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy8ucG5wbS9maW5kLXVwQDUuMC4wL25vZGVfbW9kdWxlcy9maW5kLXVwL2luZGV4LmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzLy5wbnBtL3N0cmlwLWZpbmFsLW5ld2xpbmVAMi4wLjAvbm9kZV9tb2R1bGVzL3N0cmlwLWZpbmFsLW5ld2xpbmUvaW5kZXguanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvLnBucG0vbnBtLXJ1bi1wYXRoQDQuMC4xL25vZGVfbW9kdWxlcy9ucG0tcnVuLXBhdGgvaW5kZXguanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvLnBucG0vaHVtYW4tc2lnbmFsc0AyLjEuMC9ub2RlX21vZHVsZXMvaHVtYW4tc2lnbmFscy9idWlsZC9zcmMvY29yZS5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy8ucG5wbS9odW1hbi1zaWduYWxzQDIuMS4wL25vZGVfbW9kdWxlcy9odW1hbi1zaWduYWxzL2J1aWxkL3NyYy9yZWFsdGltZS5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy8ucG5wbS9odW1hbi1zaWduYWxzQDIuMS4wL25vZGVfbW9kdWxlcy9odW1hbi1zaWduYWxzL2J1aWxkL3NyYy9zaWduYWxzLmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzLy5wbnBtL2h1bWFuLXNpZ25hbHNAMi4xLjAvbm9kZV9tb2R1bGVzL2h1bWFuLXNpZ25hbHMvYnVpbGQvc3JjL21haW4uanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvLnBucG0vZXhlY2FANS4xLjEvbm9kZV9tb2R1bGVzL2V4ZWNhL2xpYi9lcnJvci5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy8ucG5wbS9leGVjYUA1LjEuMS9ub2RlX21vZHVsZXMvZXhlY2EvbGliL3N0ZGlvLmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzLy5wbnBtL2V4ZWNhQDUuMS4xL25vZGVfbW9kdWxlcy9leGVjYS9saWIva2lsbC5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy8ucG5wbS9pcy1zdHJlYW1AMi4wLjEvbm9kZV9tb2R1bGVzL2lzLXN0cmVhbS9pbmRleC5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy8ucG5wbS9leGVjYUA1LjEuMS9ub2RlX21vZHVsZXMvZXhlY2EvbGliL3N0cmVhbS5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy8ucG5wbS9leGVjYUA1LjEuMS9ub2RlX21vZHVsZXMvZXhlY2EvbGliL3Byb21pc2UuanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvLnBucG0vZXhlY2FANS4xLjEvbm9kZV9tb2R1bGVzL2V4ZWNhL2xpYi9jb21tYW5kLmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzLy5wbnBtL2V4ZWNhQDUuMS4xL25vZGVfbW9kdWxlcy9leGVjYS9pbmRleC5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy8ucG5wbS9AYW50ZnUraW5zdGFsbC1wa2dAMC4xLjAvbm9kZV9tb2R1bGVzL0BhbnRmdS9pbnN0YWxsLXBrZy9kaXN0L2luZGV4Lm1qcyJdLCJzb3VyY2VzQ29udGVudCI6WyJjbGFzcyBOb2RlIHtcblx0Ly8vIHZhbHVlO1xuXHQvLy8gbmV4dDtcblxuXHRjb25zdHJ1Y3Rvcih2YWx1ZSkge1xuXHRcdHRoaXMudmFsdWUgPSB2YWx1ZTtcblxuXHRcdC8vIFRPRE86IFJlbW92ZSB0aGlzIHdoZW4gdGFyZ2V0aW5nIE5vZGUuanMgMTIuXG5cdFx0dGhpcy5uZXh0ID0gdW5kZWZpbmVkO1xuXHR9XG59XG5cbmNsYXNzIFF1ZXVlIHtcblx0Ly8gVE9ETzogVXNlIHByaXZhdGUgY2xhc3MgZmllbGRzIHdoZW4gdGFyZ2V0aW5nIE5vZGUuanMgMTIuXG5cdC8vICNfaGVhZDtcblx0Ly8gI190YWlsO1xuXHQvLyAjX3NpemU7XG5cblx0Y29uc3RydWN0b3IoKSB7XG5cdFx0dGhpcy5jbGVhcigpO1xuXHR9XG5cblx0ZW5xdWV1ZSh2YWx1ZSkge1xuXHRcdGNvbnN0IG5vZGUgPSBuZXcgTm9kZSh2YWx1ZSk7XG5cblx0XHRpZiAodGhpcy5faGVhZCkge1xuXHRcdFx0dGhpcy5fdGFpbC5uZXh0ID0gbm9kZTtcblx0XHRcdHRoaXMuX3RhaWwgPSBub2RlO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHR0aGlzLl9oZWFkID0gbm9kZTtcblx0XHRcdHRoaXMuX3RhaWwgPSBub2RlO1xuXHRcdH1cblxuXHRcdHRoaXMuX3NpemUrKztcblx0fVxuXG5cdGRlcXVldWUoKSB7XG5cdFx0Y29uc3QgY3VycmVudCA9IHRoaXMuX2hlYWQ7XG5cdFx0aWYgKCFjdXJyZW50KSB7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0dGhpcy5faGVhZCA9IHRoaXMuX2hlYWQubmV4dDtcblx0XHR0aGlzLl9zaXplLS07XG5cdFx0cmV0dXJuIGN1cnJlbnQudmFsdWU7XG5cdH1cblxuXHRjbGVhcigpIHtcblx0XHR0aGlzLl9oZWFkID0gdW5kZWZpbmVkO1xuXHRcdHRoaXMuX3RhaWwgPSB1bmRlZmluZWQ7XG5cdFx0dGhpcy5fc2l6ZSA9IDA7XG5cdH1cblxuXHRnZXQgc2l6ZSgpIHtcblx0XHRyZXR1cm4gdGhpcy5fc2l6ZTtcblx0fVxuXG5cdCogW1N5bWJvbC5pdGVyYXRvcl0oKSB7XG5cdFx0bGV0IGN1cnJlbnQgPSB0aGlzLl9oZWFkO1xuXG5cdFx0d2hpbGUgKGN1cnJlbnQpIHtcblx0XHRcdHlpZWxkIGN1cnJlbnQudmFsdWU7XG5cdFx0XHRjdXJyZW50ID0gY3VycmVudC5uZXh0O1xuXHRcdH1cblx0fVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFF1ZXVlO1xuIiwiJ3VzZSBzdHJpY3QnO1xuY29uc3QgUXVldWUgPSByZXF1aXJlKCd5b2N0by1xdWV1ZScpO1xuXG5jb25zdCBwTGltaXQgPSBjb25jdXJyZW5jeSA9PiB7XG5cdGlmICghKChOdW1iZXIuaXNJbnRlZ2VyKGNvbmN1cnJlbmN5KSB8fCBjb25jdXJyZW5jeSA9PT0gSW5maW5pdHkpICYmIGNvbmN1cnJlbmN5ID4gMCkpIHtcblx0XHR0aHJvdyBuZXcgVHlwZUVycm9yKCdFeHBlY3RlZCBgY29uY3VycmVuY3lgIHRvIGJlIGEgbnVtYmVyIGZyb20gMSBhbmQgdXAnKTtcblx0fVxuXG5cdGNvbnN0IHF1ZXVlID0gbmV3IFF1ZXVlKCk7XG5cdGxldCBhY3RpdmVDb3VudCA9IDA7XG5cblx0Y29uc3QgbmV4dCA9ICgpID0+IHtcblx0XHRhY3RpdmVDb3VudC0tO1xuXG5cdFx0aWYgKHF1ZXVlLnNpemUgPiAwKSB7XG5cdFx0XHRxdWV1ZS5kZXF1ZXVlKCkoKTtcblx0XHR9XG5cdH07XG5cblx0Y29uc3QgcnVuID0gYXN5bmMgKGZuLCByZXNvbHZlLCAuLi5hcmdzKSA9PiB7XG5cdFx0YWN0aXZlQ291bnQrKztcblxuXHRcdGNvbnN0IHJlc3VsdCA9IChhc3luYyAoKSA9PiBmbiguLi5hcmdzKSkoKTtcblxuXHRcdHJlc29sdmUocmVzdWx0KTtcblxuXHRcdHRyeSB7XG5cdFx0XHRhd2FpdCByZXN1bHQ7XG5cdFx0fSBjYXRjaCB7fVxuXG5cdFx0bmV4dCgpO1xuXHR9O1xuXG5cdGNvbnN0IGVucXVldWUgPSAoZm4sIHJlc29sdmUsIC4uLmFyZ3MpID0+IHtcblx0XHRxdWV1ZS5lbnF1ZXVlKHJ1bi5iaW5kKG51bGwsIGZuLCByZXNvbHZlLCAuLi5hcmdzKSk7XG5cblx0XHQoYXN5bmMgKCkgPT4ge1xuXHRcdFx0Ly8gVGhpcyBmdW5jdGlvbiBuZWVkcyB0byB3YWl0IHVudGlsIHRoZSBuZXh0IG1pY3JvdGFzayBiZWZvcmUgY29tcGFyaW5nXG5cdFx0XHQvLyBgYWN0aXZlQ291bnRgIHRvIGBjb25jdXJyZW5jeWAsIGJlY2F1c2UgYGFjdGl2ZUNvdW50YCBpcyB1cGRhdGVkIGFzeW5jaHJvbm91c2x5XG5cdFx0XHQvLyB3aGVuIHRoZSBydW4gZnVuY3Rpb24gaXMgZGVxdWV1ZWQgYW5kIGNhbGxlZC4gVGhlIGNvbXBhcmlzb24gaW4gdGhlIGlmLXN0YXRlbWVudFxuXHRcdFx0Ly8gbmVlZHMgdG8gaGFwcGVuIGFzeW5jaHJvbm91c2x5IGFzIHdlbGwgdG8gZ2V0IGFuIHVwLXRvLWRhdGUgdmFsdWUgZm9yIGBhY3RpdmVDb3VudGAuXG5cdFx0XHRhd2FpdCBQcm9taXNlLnJlc29sdmUoKTtcblxuXHRcdFx0aWYgKGFjdGl2ZUNvdW50IDwgY29uY3VycmVuY3kgJiYgcXVldWUuc2l6ZSA+IDApIHtcblx0XHRcdFx0cXVldWUuZGVxdWV1ZSgpKCk7XG5cdFx0XHR9XG5cdFx0fSkoKTtcblx0fTtcblxuXHRjb25zdCBnZW5lcmF0b3IgPSAoZm4sIC4uLmFyZ3MpID0+IG5ldyBQcm9taXNlKHJlc29sdmUgPT4ge1xuXHRcdGVucXVldWUoZm4sIHJlc29sdmUsIC4uLmFyZ3MpO1xuXHR9KTtcblxuXHRPYmplY3QuZGVmaW5lUHJvcGVydGllcyhnZW5lcmF0b3IsIHtcblx0XHRhY3RpdmVDb3VudDoge1xuXHRcdFx0Z2V0OiAoKSA9PiBhY3RpdmVDb3VudFxuXHRcdH0sXG5cdFx0cGVuZGluZ0NvdW50OiB7XG5cdFx0XHRnZXQ6ICgpID0+IHF1ZXVlLnNpemVcblx0XHR9LFxuXHRcdGNsZWFyUXVldWU6IHtcblx0XHRcdHZhbHVlOiAoKSA9PiB7XG5cdFx0XHRcdHF1ZXVlLmNsZWFyKCk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9KTtcblxuXHRyZXR1cm4gZ2VuZXJhdG9yO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBwTGltaXQ7XG4iLCIndXNlIHN0cmljdCc7XG5jb25zdCBwTGltaXQgPSByZXF1aXJlKCdwLWxpbWl0Jyk7XG5cbmNsYXNzIEVuZEVycm9yIGV4dGVuZHMgRXJyb3Ige1xuXHRjb25zdHJ1Y3Rvcih2YWx1ZSkge1xuXHRcdHN1cGVyKCk7XG5cdFx0dGhpcy52YWx1ZSA9IHZhbHVlO1xuXHR9XG59XG5cbi8vIFRoZSBpbnB1dCBjYW4gYWxzbyBiZSBhIHByb21pc2UsIHNvIHdlIGF3YWl0IGl0XG5jb25zdCB0ZXN0RWxlbWVudCA9IGFzeW5jIChlbGVtZW50LCB0ZXN0ZXIpID0+IHRlc3Rlcihhd2FpdCBlbGVtZW50KTtcblxuLy8gVGhlIGlucHV0IGNhbiBhbHNvIGJlIGEgcHJvbWlzZSwgc28gd2UgYFByb21pc2UuYWxsKClgIHRoZW0gYm90aFxuY29uc3QgZmluZGVyID0gYXN5bmMgZWxlbWVudCA9PiB7XG5cdGNvbnN0IHZhbHVlcyA9IGF3YWl0IFByb21pc2UuYWxsKGVsZW1lbnQpO1xuXHRpZiAodmFsdWVzWzFdID09PSB0cnVlKSB7XG5cdFx0dGhyb3cgbmV3IEVuZEVycm9yKHZhbHVlc1swXSk7XG5cdH1cblxuXHRyZXR1cm4gZmFsc2U7XG59O1xuXG5jb25zdCBwTG9jYXRlID0gYXN5bmMgKGl0ZXJhYmxlLCB0ZXN0ZXIsIG9wdGlvbnMpID0+IHtcblx0b3B0aW9ucyA9IHtcblx0XHRjb25jdXJyZW5jeTogSW5maW5pdHksXG5cdFx0cHJlc2VydmVPcmRlcjogdHJ1ZSxcblx0XHQuLi5vcHRpb25zXG5cdH07XG5cblx0Y29uc3QgbGltaXQgPSBwTGltaXQob3B0aW9ucy5jb25jdXJyZW5jeSk7XG5cblx0Ly8gU3RhcnQgYWxsIHRoZSBwcm9taXNlcyBjb25jdXJyZW50bHkgd2l0aCBvcHRpb25hbCBsaW1pdFxuXHRjb25zdCBpdGVtcyA9IFsuLi5pdGVyYWJsZV0ubWFwKGVsZW1lbnQgPT4gW2VsZW1lbnQsIGxpbWl0KHRlc3RFbGVtZW50LCBlbGVtZW50LCB0ZXN0ZXIpXSk7XG5cblx0Ly8gQ2hlY2sgdGhlIHByb21pc2VzIGVpdGhlciBzZXJpYWxseSBvciBjb25jdXJyZW50bHlcblx0Y29uc3QgY2hlY2tMaW1pdCA9IHBMaW1pdChvcHRpb25zLnByZXNlcnZlT3JkZXIgPyAxIDogSW5maW5pdHkpO1xuXG5cdHRyeSB7XG5cdFx0YXdhaXQgUHJvbWlzZS5hbGwoaXRlbXMubWFwKGVsZW1lbnQgPT4gY2hlY2tMaW1pdChmaW5kZXIsIGVsZW1lbnQpKSk7XG5cdH0gY2F0Y2ggKGVycm9yKSB7XG5cdFx0aWYgKGVycm9yIGluc3RhbmNlb2YgRW5kRXJyb3IpIHtcblx0XHRcdHJldHVybiBlcnJvci52YWx1ZTtcblx0XHR9XG5cblx0XHR0aHJvdyBlcnJvcjtcblx0fVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBwTG9jYXRlO1xuIiwiJ3VzZSBzdHJpY3QnO1xuY29uc3QgcGF0aCA9IHJlcXVpcmUoJ3BhdGgnKTtcbmNvbnN0IGZzID0gcmVxdWlyZSgnZnMnKTtcbmNvbnN0IHtwcm9taXNpZnl9ID0gcmVxdWlyZSgndXRpbCcpO1xuY29uc3QgcExvY2F0ZSA9IHJlcXVpcmUoJ3AtbG9jYXRlJyk7XG5cbmNvbnN0IGZzU3RhdCA9IHByb21pc2lmeShmcy5zdGF0KTtcbmNvbnN0IGZzTFN0YXQgPSBwcm9taXNpZnkoZnMubHN0YXQpO1xuXG5jb25zdCB0eXBlTWFwcGluZ3MgPSB7XG5cdGRpcmVjdG9yeTogJ2lzRGlyZWN0b3J5Jyxcblx0ZmlsZTogJ2lzRmlsZSdcbn07XG5cbmZ1bmN0aW9uIGNoZWNrVHlwZSh7dHlwZX0pIHtcblx0aWYgKHR5cGUgaW4gdHlwZU1hcHBpbmdzKSB7XG5cdFx0cmV0dXJuO1xuXHR9XG5cblx0dGhyb3cgbmV3IEVycm9yKGBJbnZhbGlkIHR5cGUgc3BlY2lmaWVkOiAke3R5cGV9YCk7XG59XG5cbmNvbnN0IG1hdGNoVHlwZSA9ICh0eXBlLCBzdGF0KSA9PiB0eXBlID09PSB1bmRlZmluZWQgfHwgc3RhdFt0eXBlTWFwcGluZ3NbdHlwZV1dKCk7XG5cbm1vZHVsZS5leHBvcnRzID0gYXN5bmMgKHBhdGhzLCBvcHRpb25zKSA9PiB7XG5cdG9wdGlvbnMgPSB7XG5cdFx0Y3dkOiBwcm9jZXNzLmN3ZCgpLFxuXHRcdHR5cGU6ICdmaWxlJyxcblx0XHRhbGxvd1N5bWxpbmtzOiB0cnVlLFxuXHRcdC4uLm9wdGlvbnNcblx0fTtcblxuXHRjaGVja1R5cGUob3B0aW9ucyk7XG5cblx0Y29uc3Qgc3RhdEZuID0gb3B0aW9ucy5hbGxvd1N5bWxpbmtzID8gZnNTdGF0IDogZnNMU3RhdDtcblxuXHRyZXR1cm4gcExvY2F0ZShwYXRocywgYXN5bmMgcGF0aF8gPT4ge1xuXHRcdHRyeSB7XG5cdFx0XHRjb25zdCBzdGF0ID0gYXdhaXQgc3RhdEZuKHBhdGgucmVzb2x2ZShvcHRpb25zLmN3ZCwgcGF0aF8pKTtcblx0XHRcdHJldHVybiBtYXRjaFR5cGUob3B0aW9ucy50eXBlLCBzdGF0KTtcblx0XHR9IGNhdGNoIHtcblx0XHRcdHJldHVybiBmYWxzZTtcblx0XHR9XG5cdH0sIG9wdGlvbnMpO1xufTtcblxubW9kdWxlLmV4cG9ydHMuc3luYyA9IChwYXRocywgb3B0aW9ucykgPT4ge1xuXHRvcHRpb25zID0ge1xuXHRcdGN3ZDogcHJvY2Vzcy5jd2QoKSxcblx0XHRhbGxvd1N5bWxpbmtzOiB0cnVlLFxuXHRcdHR5cGU6ICdmaWxlJyxcblx0XHQuLi5vcHRpb25zXG5cdH07XG5cblx0Y2hlY2tUeXBlKG9wdGlvbnMpO1xuXG5cdGNvbnN0IHN0YXRGbiA9IG9wdGlvbnMuYWxsb3dTeW1saW5rcyA/IGZzLnN0YXRTeW5jIDogZnMubHN0YXRTeW5jO1xuXG5cdGZvciAoY29uc3QgcGF0aF8gb2YgcGF0aHMpIHtcblx0XHR0cnkge1xuXHRcdFx0Y29uc3Qgc3RhdCA9IHN0YXRGbihwYXRoLnJlc29sdmUob3B0aW9ucy5jd2QsIHBhdGhfKSk7XG5cblx0XHRcdGlmIChtYXRjaFR5cGUob3B0aW9ucy50eXBlLCBzdGF0KSkge1xuXHRcdFx0XHRyZXR1cm4gcGF0aF87XG5cdFx0XHR9XG5cdFx0fSBjYXRjaCB7fVxuXHR9XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuY29uc3QgZnMgPSByZXF1aXJlKCdmcycpO1xuY29uc3Qge3Byb21pc2lmeX0gPSByZXF1aXJlKCd1dGlsJyk7XG5cbmNvbnN0IHBBY2Nlc3MgPSBwcm9taXNpZnkoZnMuYWNjZXNzKTtcblxubW9kdWxlLmV4cG9ydHMgPSBhc3luYyBwYXRoID0+IHtcblx0dHJ5IHtcblx0XHRhd2FpdCBwQWNjZXNzKHBhdGgpO1xuXHRcdHJldHVybiB0cnVlO1xuXHR9IGNhdGNoIChfKSB7XG5cdFx0cmV0dXJuIGZhbHNlO1xuXHR9XG59O1xuXG5tb2R1bGUuZXhwb3J0cy5zeW5jID0gcGF0aCA9PiB7XG5cdHRyeSB7XG5cdFx0ZnMuYWNjZXNzU3luYyhwYXRoKTtcblx0XHRyZXR1cm4gdHJ1ZTtcblx0fSBjYXRjaCAoXykge1xuXHRcdHJldHVybiBmYWxzZTtcblx0fVxufTtcbiIsIid1c2Ugc3RyaWN0JztcbmNvbnN0IHBhdGggPSByZXF1aXJlKCdwYXRoJyk7XG5jb25zdCBsb2NhdGVQYXRoID0gcmVxdWlyZSgnbG9jYXRlLXBhdGgnKTtcbmNvbnN0IHBhdGhFeGlzdHMgPSByZXF1aXJlKCdwYXRoLWV4aXN0cycpO1xuXG5jb25zdCBzdG9wID0gU3ltYm9sKCdmaW5kVXAuc3RvcCcpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGFzeW5jIChuYW1lLCBvcHRpb25zID0ge30pID0+IHtcblx0bGV0IGRpcmVjdG9yeSA9IHBhdGgucmVzb2x2ZShvcHRpb25zLmN3ZCB8fCAnJyk7XG5cdGNvbnN0IHtyb290fSA9IHBhdGgucGFyc2UoZGlyZWN0b3J5KTtcblx0Y29uc3QgcGF0aHMgPSBbXS5jb25jYXQobmFtZSk7XG5cblx0Y29uc3QgcnVuTWF0Y2hlciA9IGFzeW5jIGxvY2F0ZU9wdGlvbnMgPT4ge1xuXHRcdGlmICh0eXBlb2YgbmFtZSAhPT0gJ2Z1bmN0aW9uJykge1xuXHRcdFx0cmV0dXJuIGxvY2F0ZVBhdGgocGF0aHMsIGxvY2F0ZU9wdGlvbnMpO1xuXHRcdH1cblxuXHRcdGNvbnN0IGZvdW5kUGF0aCA9IGF3YWl0IG5hbWUobG9jYXRlT3B0aW9ucy5jd2QpO1xuXHRcdGlmICh0eXBlb2YgZm91bmRQYXRoID09PSAnc3RyaW5nJykge1xuXHRcdFx0cmV0dXJuIGxvY2F0ZVBhdGgoW2ZvdW5kUGF0aF0sIGxvY2F0ZU9wdGlvbnMpO1xuXHRcdH1cblxuXHRcdHJldHVybiBmb3VuZFBhdGg7XG5cdH07XG5cblx0Ly8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLWNvbnN0YW50LWNvbmRpdGlvblxuXHR3aGlsZSAodHJ1ZSkge1xuXHRcdC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1hd2FpdC1pbi1sb29wXG5cdFx0Y29uc3QgZm91bmRQYXRoID0gYXdhaXQgcnVuTWF0Y2hlcih7Li4ub3B0aW9ucywgY3dkOiBkaXJlY3Rvcnl9KTtcblxuXHRcdGlmIChmb3VuZFBhdGggPT09IHN0b3ApIHtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHRpZiAoZm91bmRQYXRoKSB7XG5cdFx0XHRyZXR1cm4gcGF0aC5yZXNvbHZlKGRpcmVjdG9yeSwgZm91bmRQYXRoKTtcblx0XHR9XG5cblx0XHRpZiAoZGlyZWN0b3J5ID09PSByb290KSB7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0ZGlyZWN0b3J5ID0gcGF0aC5kaXJuYW1lKGRpcmVjdG9yeSk7XG5cdH1cbn07XG5cbm1vZHVsZS5leHBvcnRzLnN5bmMgPSAobmFtZSwgb3B0aW9ucyA9IHt9KSA9PiB7XG5cdGxldCBkaXJlY3RvcnkgPSBwYXRoLnJlc29sdmUob3B0aW9ucy5jd2QgfHwgJycpO1xuXHRjb25zdCB7cm9vdH0gPSBwYXRoLnBhcnNlKGRpcmVjdG9yeSk7XG5cdGNvbnN0IHBhdGhzID0gW10uY29uY2F0KG5hbWUpO1xuXG5cdGNvbnN0IHJ1bk1hdGNoZXIgPSBsb2NhdGVPcHRpb25zID0+IHtcblx0XHRpZiAodHlwZW9mIG5hbWUgIT09ICdmdW5jdGlvbicpIHtcblx0XHRcdHJldHVybiBsb2NhdGVQYXRoLnN5bmMocGF0aHMsIGxvY2F0ZU9wdGlvbnMpO1xuXHRcdH1cblxuXHRcdGNvbnN0IGZvdW5kUGF0aCA9IG5hbWUobG9jYXRlT3B0aW9ucy5jd2QpO1xuXHRcdGlmICh0eXBlb2YgZm91bmRQYXRoID09PSAnc3RyaW5nJykge1xuXHRcdFx0cmV0dXJuIGxvY2F0ZVBhdGguc3luYyhbZm91bmRQYXRoXSwgbG9jYXRlT3B0aW9ucyk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIGZvdW5kUGF0aDtcblx0fTtcblxuXHQvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tY29uc3RhbnQtY29uZGl0aW9uXG5cdHdoaWxlICh0cnVlKSB7XG5cdFx0Y29uc3QgZm91bmRQYXRoID0gcnVuTWF0Y2hlcih7Li4ub3B0aW9ucywgY3dkOiBkaXJlY3Rvcnl9KTtcblxuXHRcdGlmIChmb3VuZFBhdGggPT09IHN0b3ApIHtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHRpZiAoZm91bmRQYXRoKSB7XG5cdFx0XHRyZXR1cm4gcGF0aC5yZXNvbHZlKGRpcmVjdG9yeSwgZm91bmRQYXRoKTtcblx0XHR9XG5cblx0XHRpZiAoZGlyZWN0b3J5ID09PSByb290KSB7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0ZGlyZWN0b3J5ID0gcGF0aC5kaXJuYW1lKGRpcmVjdG9yeSk7XG5cdH1cbn07XG5cbm1vZHVsZS5leHBvcnRzLmV4aXN0cyA9IHBhdGhFeGlzdHM7XG5cbm1vZHVsZS5leHBvcnRzLnN5bmMuZXhpc3RzID0gcGF0aEV4aXN0cy5zeW5jO1xuXG5tb2R1bGUuZXhwb3J0cy5zdG9wID0gc3RvcDtcbiIsIid1c2Ugc3RyaWN0JztcblxubW9kdWxlLmV4cG9ydHMgPSBpbnB1dCA9PiB7XG5cdGNvbnN0IExGID0gdHlwZW9mIGlucHV0ID09PSAnc3RyaW5nJyA/ICdcXG4nIDogJ1xcbicuY2hhckNvZGVBdCgpO1xuXHRjb25zdCBDUiA9IHR5cGVvZiBpbnB1dCA9PT0gJ3N0cmluZycgPyAnXFxyJyA6ICdcXHInLmNoYXJDb2RlQXQoKTtcblxuXHRpZiAoaW5wdXRbaW5wdXQubGVuZ3RoIC0gMV0gPT09IExGKSB7XG5cdFx0aW5wdXQgPSBpbnB1dC5zbGljZSgwLCBpbnB1dC5sZW5ndGggLSAxKTtcblx0fVxuXG5cdGlmIChpbnB1dFtpbnB1dC5sZW5ndGggLSAxXSA9PT0gQ1IpIHtcblx0XHRpbnB1dCA9IGlucHV0LnNsaWNlKDAsIGlucHV0Lmxlbmd0aCAtIDEpO1xuXHR9XG5cblx0cmV0dXJuIGlucHV0O1xufTtcbiIsIid1c2Ugc3RyaWN0JztcbmNvbnN0IHBhdGggPSByZXF1aXJlKCdwYXRoJyk7XG5jb25zdCBwYXRoS2V5ID0gcmVxdWlyZSgncGF0aC1rZXknKTtcblxuY29uc3QgbnBtUnVuUGF0aCA9IG9wdGlvbnMgPT4ge1xuXHRvcHRpb25zID0ge1xuXHRcdGN3ZDogcHJvY2Vzcy5jd2QoKSxcblx0XHRwYXRoOiBwcm9jZXNzLmVudltwYXRoS2V5KCldLFxuXHRcdGV4ZWNQYXRoOiBwcm9jZXNzLmV4ZWNQYXRoLFxuXHRcdC4uLm9wdGlvbnNcblx0fTtcblxuXHRsZXQgcHJldmlvdXM7XG5cdGxldCBjd2RQYXRoID0gcGF0aC5yZXNvbHZlKG9wdGlvbnMuY3dkKTtcblx0Y29uc3QgcmVzdWx0ID0gW107XG5cblx0d2hpbGUgKHByZXZpb3VzICE9PSBjd2RQYXRoKSB7XG5cdFx0cmVzdWx0LnB1c2gocGF0aC5qb2luKGN3ZFBhdGgsICdub2RlX21vZHVsZXMvLmJpbicpKTtcblx0XHRwcmV2aW91cyA9IGN3ZFBhdGg7XG5cdFx0Y3dkUGF0aCA9IHBhdGgucmVzb2x2ZShjd2RQYXRoLCAnLi4nKTtcblx0fVxuXG5cdC8vIEVuc3VyZSB0aGUgcnVubmluZyBgbm9kZWAgYmluYXJ5IGlzIHVzZWRcblx0Y29uc3QgZXhlY1BhdGhEaXIgPSBwYXRoLnJlc29sdmUob3B0aW9ucy5jd2QsIG9wdGlvbnMuZXhlY1BhdGgsICcuLicpO1xuXHRyZXN1bHQucHVzaChleGVjUGF0aERpcik7XG5cblx0cmV0dXJuIHJlc3VsdC5jb25jYXQob3B0aW9ucy5wYXRoKS5qb2luKHBhdGguZGVsaW1pdGVyKTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gbnBtUnVuUGF0aDtcbi8vIFRPRE86IFJlbW92ZSB0aGlzIGZvciB0aGUgbmV4dCBtYWpvciByZWxlYXNlXG5tb2R1bGUuZXhwb3J0cy5kZWZhdWx0ID0gbnBtUnVuUGF0aDtcblxubW9kdWxlLmV4cG9ydHMuZW52ID0gb3B0aW9ucyA9PiB7XG5cdG9wdGlvbnMgPSB7XG5cdFx0ZW52OiBwcm9jZXNzLmVudixcblx0XHQuLi5vcHRpb25zXG5cdH07XG5cblx0Y29uc3QgZW52ID0gey4uLm9wdGlvbnMuZW52fTtcblx0Y29uc3QgcGF0aCA9IHBhdGhLZXkoe2Vudn0pO1xuXG5cdG9wdGlvbnMucGF0aCA9IGVudltwYXRoXTtcblx0ZW52W3BhdGhdID0gbW9kdWxlLmV4cG9ydHMob3B0aW9ucyk7XG5cblx0cmV0dXJuIGVudjtcbn07XG4iLCJcInVzZSBzdHJpY3RcIjtPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cyxcIl9fZXNNb2R1bGVcIix7dmFsdWU6dHJ1ZX0pO2V4cG9ydHMuU0lHTkFMUz12b2lkIDA7XG5cbmNvbnN0IFNJR05BTFM9W1xue1xubmFtZTpcIlNJR0hVUFwiLFxubnVtYmVyOjEsXG5hY3Rpb246XCJ0ZXJtaW5hdGVcIixcbmRlc2NyaXB0aW9uOlwiVGVybWluYWwgY2xvc2VkXCIsXG5zdGFuZGFyZDpcInBvc2l4XCJ9LFxuXG57XG5uYW1lOlwiU0lHSU5UXCIsXG5udW1iZXI6MixcbmFjdGlvbjpcInRlcm1pbmF0ZVwiLFxuZGVzY3JpcHRpb246XCJVc2VyIGludGVycnVwdGlvbiB3aXRoIENUUkwtQ1wiLFxuc3RhbmRhcmQ6XCJhbnNpXCJ9LFxuXG57XG5uYW1lOlwiU0lHUVVJVFwiLFxubnVtYmVyOjMsXG5hY3Rpb246XCJjb3JlXCIsXG5kZXNjcmlwdGlvbjpcIlVzZXIgaW50ZXJydXB0aW9uIHdpdGggQ1RSTC1cXFxcXCIsXG5zdGFuZGFyZDpcInBvc2l4XCJ9LFxuXG57XG5uYW1lOlwiU0lHSUxMXCIsXG5udW1iZXI6NCxcbmFjdGlvbjpcImNvcmVcIixcbmRlc2NyaXB0aW9uOlwiSW52YWxpZCBtYWNoaW5lIGluc3RydWN0aW9uXCIsXG5zdGFuZGFyZDpcImFuc2lcIn0sXG5cbntcbm5hbWU6XCJTSUdUUkFQXCIsXG5udW1iZXI6NSxcbmFjdGlvbjpcImNvcmVcIixcbmRlc2NyaXB0aW9uOlwiRGVidWdnZXIgYnJlYWtwb2ludFwiLFxuc3RhbmRhcmQ6XCJwb3NpeFwifSxcblxue1xubmFtZTpcIlNJR0FCUlRcIixcbm51bWJlcjo2LFxuYWN0aW9uOlwiY29yZVwiLFxuZGVzY3JpcHRpb246XCJBYm9ydGVkXCIsXG5zdGFuZGFyZDpcImFuc2lcIn0sXG5cbntcbm5hbWU6XCJTSUdJT1RcIixcbm51bWJlcjo2LFxuYWN0aW9uOlwiY29yZVwiLFxuZGVzY3JpcHRpb246XCJBYm9ydGVkXCIsXG5zdGFuZGFyZDpcImJzZFwifSxcblxue1xubmFtZTpcIlNJR0JVU1wiLFxubnVtYmVyOjcsXG5hY3Rpb246XCJjb3JlXCIsXG5kZXNjcmlwdGlvbjpcblwiQnVzIGVycm9yIGR1ZSB0byBtaXNhbGlnbmVkLCBub24tZXhpc3RpbmcgYWRkcmVzcyBvciBwYWdpbmcgZXJyb3JcIixcbnN0YW5kYXJkOlwiYnNkXCJ9LFxuXG57XG5uYW1lOlwiU0lHRU1UXCIsXG5udW1iZXI6NyxcbmFjdGlvbjpcInRlcm1pbmF0ZVwiLFxuZGVzY3JpcHRpb246XCJDb21tYW5kIHNob3VsZCBiZSBlbXVsYXRlZCBidXQgaXMgbm90IGltcGxlbWVudGVkXCIsXG5zdGFuZGFyZDpcIm90aGVyXCJ9LFxuXG57XG5uYW1lOlwiU0lHRlBFXCIsXG5udW1iZXI6OCxcbmFjdGlvbjpcImNvcmVcIixcbmRlc2NyaXB0aW9uOlwiRmxvYXRpbmcgcG9pbnQgYXJpdGhtZXRpYyBlcnJvclwiLFxuc3RhbmRhcmQ6XCJhbnNpXCJ9LFxuXG57XG5uYW1lOlwiU0lHS0lMTFwiLFxubnVtYmVyOjksXG5hY3Rpb246XCJ0ZXJtaW5hdGVcIixcbmRlc2NyaXB0aW9uOlwiRm9yY2VkIHRlcm1pbmF0aW9uXCIsXG5zdGFuZGFyZDpcInBvc2l4XCIsXG5mb3JjZWQ6dHJ1ZX0sXG5cbntcbm5hbWU6XCJTSUdVU1IxXCIsXG5udW1iZXI6MTAsXG5hY3Rpb246XCJ0ZXJtaW5hdGVcIixcbmRlc2NyaXB0aW9uOlwiQXBwbGljYXRpb24tc3BlY2lmaWMgc2lnbmFsXCIsXG5zdGFuZGFyZDpcInBvc2l4XCJ9LFxuXG57XG5uYW1lOlwiU0lHU0VHVlwiLFxubnVtYmVyOjExLFxuYWN0aW9uOlwiY29yZVwiLFxuZGVzY3JpcHRpb246XCJTZWdtZW50YXRpb24gZmF1bHRcIixcbnN0YW5kYXJkOlwiYW5zaVwifSxcblxue1xubmFtZTpcIlNJR1VTUjJcIixcbm51bWJlcjoxMixcbmFjdGlvbjpcInRlcm1pbmF0ZVwiLFxuZGVzY3JpcHRpb246XCJBcHBsaWNhdGlvbi1zcGVjaWZpYyBzaWduYWxcIixcbnN0YW5kYXJkOlwicG9zaXhcIn0sXG5cbntcbm5hbWU6XCJTSUdQSVBFXCIsXG5udW1iZXI6MTMsXG5hY3Rpb246XCJ0ZXJtaW5hdGVcIixcbmRlc2NyaXB0aW9uOlwiQnJva2VuIHBpcGUgb3Igc29ja2V0XCIsXG5zdGFuZGFyZDpcInBvc2l4XCJ9LFxuXG57XG5uYW1lOlwiU0lHQUxSTVwiLFxubnVtYmVyOjE0LFxuYWN0aW9uOlwidGVybWluYXRlXCIsXG5kZXNjcmlwdGlvbjpcIlRpbWVvdXQgb3IgdGltZXJcIixcbnN0YW5kYXJkOlwicG9zaXhcIn0sXG5cbntcbm5hbWU6XCJTSUdURVJNXCIsXG5udW1iZXI6MTUsXG5hY3Rpb246XCJ0ZXJtaW5hdGVcIixcbmRlc2NyaXB0aW9uOlwiVGVybWluYXRpb25cIixcbnN0YW5kYXJkOlwiYW5zaVwifSxcblxue1xubmFtZTpcIlNJR1NUS0ZMVFwiLFxubnVtYmVyOjE2LFxuYWN0aW9uOlwidGVybWluYXRlXCIsXG5kZXNjcmlwdGlvbjpcIlN0YWNrIGlzIGVtcHR5IG9yIG92ZXJmbG93ZWRcIixcbnN0YW5kYXJkOlwib3RoZXJcIn0sXG5cbntcbm5hbWU6XCJTSUdDSExEXCIsXG5udW1iZXI6MTcsXG5hY3Rpb246XCJpZ25vcmVcIixcbmRlc2NyaXB0aW9uOlwiQ2hpbGQgcHJvY2VzcyB0ZXJtaW5hdGVkLCBwYXVzZWQgb3IgdW5wYXVzZWRcIixcbnN0YW5kYXJkOlwicG9zaXhcIn0sXG5cbntcbm5hbWU6XCJTSUdDTERcIixcbm51bWJlcjoxNyxcbmFjdGlvbjpcImlnbm9yZVwiLFxuZGVzY3JpcHRpb246XCJDaGlsZCBwcm9jZXNzIHRlcm1pbmF0ZWQsIHBhdXNlZCBvciB1bnBhdXNlZFwiLFxuc3RhbmRhcmQ6XCJvdGhlclwifSxcblxue1xubmFtZTpcIlNJR0NPTlRcIixcbm51bWJlcjoxOCxcbmFjdGlvbjpcInVucGF1c2VcIixcbmRlc2NyaXB0aW9uOlwiVW5wYXVzZWRcIixcbnN0YW5kYXJkOlwicG9zaXhcIixcbmZvcmNlZDp0cnVlfSxcblxue1xubmFtZTpcIlNJR1NUT1BcIixcbm51bWJlcjoxOSxcbmFjdGlvbjpcInBhdXNlXCIsXG5kZXNjcmlwdGlvbjpcIlBhdXNlZFwiLFxuc3RhbmRhcmQ6XCJwb3NpeFwiLFxuZm9yY2VkOnRydWV9LFxuXG57XG5uYW1lOlwiU0lHVFNUUFwiLFxubnVtYmVyOjIwLFxuYWN0aW9uOlwicGF1c2VcIixcbmRlc2NyaXB0aW9uOlwiUGF1c2VkIHVzaW5nIENUUkwtWiBvciBcXFwic3VzcGVuZFxcXCJcIixcbnN0YW5kYXJkOlwicG9zaXhcIn0sXG5cbntcbm5hbWU6XCJTSUdUVElOXCIsXG5udW1iZXI6MjEsXG5hY3Rpb246XCJwYXVzZVwiLFxuZGVzY3JpcHRpb246XCJCYWNrZ3JvdW5kIHByb2Nlc3MgY2Fubm90IHJlYWQgdGVybWluYWwgaW5wdXRcIixcbnN0YW5kYXJkOlwicG9zaXhcIn0sXG5cbntcbm5hbWU6XCJTSUdCUkVBS1wiLFxubnVtYmVyOjIxLFxuYWN0aW9uOlwidGVybWluYXRlXCIsXG5kZXNjcmlwdGlvbjpcIlVzZXIgaW50ZXJydXB0aW9uIHdpdGggQ1RSTC1CUkVBS1wiLFxuc3RhbmRhcmQ6XCJvdGhlclwifSxcblxue1xubmFtZTpcIlNJR1RUT1VcIixcbm51bWJlcjoyMixcbmFjdGlvbjpcInBhdXNlXCIsXG5kZXNjcmlwdGlvbjpcIkJhY2tncm91bmQgcHJvY2VzcyBjYW5ub3Qgd3JpdGUgdG8gdGVybWluYWwgb3V0cHV0XCIsXG5zdGFuZGFyZDpcInBvc2l4XCJ9LFxuXG57XG5uYW1lOlwiU0lHVVJHXCIsXG5udW1iZXI6MjMsXG5hY3Rpb246XCJpZ25vcmVcIixcbmRlc2NyaXB0aW9uOlwiU29ja2V0IHJlY2VpdmVkIG91dC1vZi1iYW5kIGRhdGFcIixcbnN0YW5kYXJkOlwiYnNkXCJ9LFxuXG57XG5uYW1lOlwiU0lHWENQVVwiLFxubnVtYmVyOjI0LFxuYWN0aW9uOlwiY29yZVwiLFxuZGVzY3JpcHRpb246XCJQcm9jZXNzIHRpbWVkIG91dFwiLFxuc3RhbmRhcmQ6XCJic2RcIn0sXG5cbntcbm5hbWU6XCJTSUdYRlNaXCIsXG5udW1iZXI6MjUsXG5hY3Rpb246XCJjb3JlXCIsXG5kZXNjcmlwdGlvbjpcIkZpbGUgdG9vIGJpZ1wiLFxuc3RhbmRhcmQ6XCJic2RcIn0sXG5cbntcbm5hbWU6XCJTSUdWVEFMUk1cIixcbm51bWJlcjoyNixcbmFjdGlvbjpcInRlcm1pbmF0ZVwiLFxuZGVzY3JpcHRpb246XCJUaW1lb3V0IG9yIHRpbWVyXCIsXG5zdGFuZGFyZDpcImJzZFwifSxcblxue1xubmFtZTpcIlNJR1BST0ZcIixcbm51bWJlcjoyNyxcbmFjdGlvbjpcInRlcm1pbmF0ZVwiLFxuZGVzY3JpcHRpb246XCJUaW1lb3V0IG9yIHRpbWVyXCIsXG5zdGFuZGFyZDpcImJzZFwifSxcblxue1xubmFtZTpcIlNJR1dJTkNIXCIsXG5udW1iZXI6MjgsXG5hY3Rpb246XCJpZ25vcmVcIixcbmRlc2NyaXB0aW9uOlwiVGVybWluYWwgd2luZG93IHNpemUgY2hhbmdlZFwiLFxuc3RhbmRhcmQ6XCJic2RcIn0sXG5cbntcbm5hbWU6XCJTSUdJT1wiLFxubnVtYmVyOjI5LFxuYWN0aW9uOlwidGVybWluYXRlXCIsXG5kZXNjcmlwdGlvbjpcIkkvTyBpcyBhdmFpbGFibGVcIixcbnN0YW5kYXJkOlwib3RoZXJcIn0sXG5cbntcbm5hbWU6XCJTSUdQT0xMXCIsXG5udW1iZXI6MjksXG5hY3Rpb246XCJ0ZXJtaW5hdGVcIixcbmRlc2NyaXB0aW9uOlwiV2F0Y2hlZCBldmVudFwiLFxuc3RhbmRhcmQ6XCJvdGhlclwifSxcblxue1xubmFtZTpcIlNJR0lORk9cIixcbm51bWJlcjoyOSxcbmFjdGlvbjpcImlnbm9yZVwiLFxuZGVzY3JpcHRpb246XCJSZXF1ZXN0IGZvciBwcm9jZXNzIGluZm9ybWF0aW9uXCIsXG5zdGFuZGFyZDpcIm90aGVyXCJ9LFxuXG57XG5uYW1lOlwiU0lHUFdSXCIsXG5udW1iZXI6MzAsXG5hY3Rpb246XCJ0ZXJtaW5hdGVcIixcbmRlc2NyaXB0aW9uOlwiRGV2aWNlIHJ1bm5pbmcgb3V0IG9mIHBvd2VyXCIsXG5zdGFuZGFyZDpcInN5c3RlbXZcIn0sXG5cbntcbm5hbWU6XCJTSUdTWVNcIixcbm51bWJlcjozMSxcbmFjdGlvbjpcImNvcmVcIixcbmRlc2NyaXB0aW9uOlwiSW52YWxpZCBzeXN0ZW0gY2FsbFwiLFxuc3RhbmRhcmQ6XCJvdGhlclwifSxcblxue1xubmFtZTpcIlNJR1VOVVNFRFwiLFxubnVtYmVyOjMxLFxuYWN0aW9uOlwidGVybWluYXRlXCIsXG5kZXNjcmlwdGlvbjpcIkludmFsaWQgc3lzdGVtIGNhbGxcIixcbnN0YW5kYXJkOlwib3RoZXJcIn1dO2V4cG9ydHMuU0lHTkFMUz1TSUdOQUxTO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9Y29yZS5qcy5tYXAiLCJcInVzZSBzdHJpY3RcIjtPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cyxcIl9fZXNNb2R1bGVcIix7dmFsdWU6dHJ1ZX0pO2V4cG9ydHMuU0lHUlRNQVg9ZXhwb3J0cy5nZXRSZWFsdGltZVNpZ25hbHM9dm9pZCAwO1xuY29uc3QgZ2V0UmVhbHRpbWVTaWduYWxzPWZ1bmN0aW9uKCl7XG5jb25zdCBsZW5ndGg9U0lHUlRNQVgtU0lHUlRNSU4rMTtcbnJldHVybiBBcnJheS5mcm9tKHtsZW5ndGh9LGdldFJlYWx0aW1lU2lnbmFsKTtcbn07ZXhwb3J0cy5nZXRSZWFsdGltZVNpZ25hbHM9Z2V0UmVhbHRpbWVTaWduYWxzO1xuXG5jb25zdCBnZXRSZWFsdGltZVNpZ25hbD1mdW5jdGlvbih2YWx1ZSxpbmRleCl7XG5yZXR1cm57XG5uYW1lOmBTSUdSVCR7aW5kZXgrMX1gLFxubnVtYmVyOlNJR1JUTUlOK2luZGV4LFxuYWN0aW9uOlwidGVybWluYXRlXCIsXG5kZXNjcmlwdGlvbjpcIkFwcGxpY2F0aW9uLXNwZWNpZmljIHNpZ25hbCAocmVhbHRpbWUpXCIsXG5zdGFuZGFyZDpcInBvc2l4XCJ9O1xuXG59O1xuXG5jb25zdCBTSUdSVE1JTj0zNDtcbmNvbnN0IFNJR1JUTUFYPTY0O2V4cG9ydHMuU0lHUlRNQVg9U0lHUlRNQVg7XG4vLyMgc291cmNlTWFwcGluZ1VSTD1yZWFsdGltZS5qcy5tYXAiLCJcInVzZSBzdHJpY3RcIjtPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cyxcIl9fZXNNb2R1bGVcIix7dmFsdWU6dHJ1ZX0pO2V4cG9ydHMuZ2V0U2lnbmFscz12b2lkIDA7dmFyIF9vcz1yZXF1aXJlKFwib3NcIik7XG5cbnZhciBfY29yZT1yZXF1aXJlKFwiLi9jb3JlLmpzXCIpO1xudmFyIF9yZWFsdGltZT1yZXF1aXJlKFwiLi9yZWFsdGltZS5qc1wiKTtcblxuXG5cbmNvbnN0IGdldFNpZ25hbHM9ZnVuY3Rpb24oKXtcbmNvbnN0IHJlYWx0aW1lU2lnbmFscz0oMCxfcmVhbHRpbWUuZ2V0UmVhbHRpbWVTaWduYWxzKSgpO1xuY29uc3Qgc2lnbmFscz1bLi4uX2NvcmUuU0lHTkFMUywuLi5yZWFsdGltZVNpZ25hbHNdLm1hcChub3JtYWxpemVTaWduYWwpO1xucmV0dXJuIHNpZ25hbHM7XG59O2V4cG9ydHMuZ2V0U2lnbmFscz1nZXRTaWduYWxzO1xuXG5cblxuXG5cblxuXG5jb25zdCBub3JtYWxpemVTaWduYWw9ZnVuY3Rpb24oe1xubmFtZSxcbm51bWJlcjpkZWZhdWx0TnVtYmVyLFxuZGVzY3JpcHRpb24sXG5hY3Rpb24sXG5mb3JjZWQ9ZmFsc2UsXG5zdGFuZGFyZH0pXG57XG5jb25zdHtcbnNpZ25hbHM6e1tuYW1lXTpjb25zdGFudFNpZ25hbH19PVxuX29zLmNvbnN0YW50cztcbmNvbnN0IHN1cHBvcnRlZD1jb25zdGFudFNpZ25hbCE9PXVuZGVmaW5lZDtcbmNvbnN0IG51bWJlcj1zdXBwb3J0ZWQ/Y29uc3RhbnRTaWduYWw6ZGVmYXVsdE51bWJlcjtcbnJldHVybntuYW1lLG51bWJlcixkZXNjcmlwdGlvbixzdXBwb3J0ZWQsYWN0aW9uLGZvcmNlZCxzdGFuZGFyZH07XG59O1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9c2lnbmFscy5qcy5tYXAiLCJcInVzZSBzdHJpY3RcIjtPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cyxcIl9fZXNNb2R1bGVcIix7dmFsdWU6dHJ1ZX0pO2V4cG9ydHMuc2lnbmFsc0J5TnVtYmVyPWV4cG9ydHMuc2lnbmFsc0J5TmFtZT12b2lkIDA7dmFyIF9vcz1yZXF1aXJlKFwib3NcIik7XG5cbnZhciBfc2lnbmFscz1yZXF1aXJlKFwiLi9zaWduYWxzLmpzXCIpO1xudmFyIF9yZWFsdGltZT1yZXF1aXJlKFwiLi9yZWFsdGltZS5qc1wiKTtcblxuXG5cbmNvbnN0IGdldFNpZ25hbHNCeU5hbWU9ZnVuY3Rpb24oKXtcbmNvbnN0IHNpZ25hbHM9KDAsX3NpZ25hbHMuZ2V0U2lnbmFscykoKTtcbnJldHVybiBzaWduYWxzLnJlZHVjZShnZXRTaWduYWxCeU5hbWUse30pO1xufTtcblxuY29uc3QgZ2V0U2lnbmFsQnlOYW1lPWZ1bmN0aW9uKFxuc2lnbmFsQnlOYW1lTWVtbyxcbntuYW1lLG51bWJlcixkZXNjcmlwdGlvbixzdXBwb3J0ZWQsYWN0aW9uLGZvcmNlZCxzdGFuZGFyZH0pXG57XG5yZXR1cm57XG4uLi5zaWduYWxCeU5hbWVNZW1vLFxuW25hbWVdOntuYW1lLG51bWJlcixkZXNjcmlwdGlvbixzdXBwb3J0ZWQsYWN0aW9uLGZvcmNlZCxzdGFuZGFyZH19O1xuXG59O1xuXG5jb25zdCBzaWduYWxzQnlOYW1lPWdldFNpZ25hbHNCeU5hbWUoKTtleHBvcnRzLnNpZ25hbHNCeU5hbWU9c2lnbmFsc0J5TmFtZTtcblxuXG5cblxuY29uc3QgZ2V0U2lnbmFsc0J5TnVtYmVyPWZ1bmN0aW9uKCl7XG5jb25zdCBzaWduYWxzPSgwLF9zaWduYWxzLmdldFNpZ25hbHMpKCk7XG5jb25zdCBsZW5ndGg9X3JlYWx0aW1lLlNJR1JUTUFYKzE7XG5jb25zdCBzaWduYWxzQT1BcnJheS5mcm9tKHtsZW5ndGh9LCh2YWx1ZSxudW1iZXIpPT5cbmdldFNpZ25hbEJ5TnVtYmVyKG51bWJlcixzaWduYWxzKSk7XG5cbnJldHVybiBPYmplY3QuYXNzaWduKHt9LC4uLnNpZ25hbHNBKTtcbn07XG5cbmNvbnN0IGdldFNpZ25hbEJ5TnVtYmVyPWZ1bmN0aW9uKG51bWJlcixzaWduYWxzKXtcbmNvbnN0IHNpZ25hbD1maW5kU2lnbmFsQnlOdW1iZXIobnVtYmVyLHNpZ25hbHMpO1xuXG5pZihzaWduYWw9PT11bmRlZmluZWQpe1xucmV0dXJue307XG59XG5cbmNvbnN0e25hbWUsZGVzY3JpcHRpb24sc3VwcG9ydGVkLGFjdGlvbixmb3JjZWQsc3RhbmRhcmR9PXNpZ25hbDtcbnJldHVybntcbltudW1iZXJdOntcbm5hbWUsXG5udW1iZXIsXG5kZXNjcmlwdGlvbixcbnN1cHBvcnRlZCxcbmFjdGlvbixcbmZvcmNlZCxcbnN0YW5kYXJkfX07XG5cblxufTtcblxuXG5cbmNvbnN0IGZpbmRTaWduYWxCeU51bWJlcj1mdW5jdGlvbihudW1iZXIsc2lnbmFscyl7XG5jb25zdCBzaWduYWw9c2lnbmFscy5maW5kKCh7bmFtZX0pPT5fb3MuY29uc3RhbnRzLnNpZ25hbHNbbmFtZV09PT1udW1iZXIpO1xuXG5pZihzaWduYWwhPT11bmRlZmluZWQpe1xucmV0dXJuIHNpZ25hbDtcbn1cblxucmV0dXJuIHNpZ25hbHMuZmluZChzaWduYWxBPT5zaWduYWxBLm51bWJlcj09PW51bWJlcik7XG59O1xuXG5jb25zdCBzaWduYWxzQnlOdW1iZXI9Z2V0U2lnbmFsc0J5TnVtYmVyKCk7ZXhwb3J0cy5zaWduYWxzQnlOdW1iZXI9c2lnbmFsc0J5TnVtYmVyO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9bWFpbi5qcy5tYXAiLCIndXNlIHN0cmljdCc7XG5jb25zdCB7c2lnbmFsc0J5TmFtZX0gPSByZXF1aXJlKCdodW1hbi1zaWduYWxzJyk7XG5cbmNvbnN0IGdldEVycm9yUHJlZml4ID0gKHt0aW1lZE91dCwgdGltZW91dCwgZXJyb3JDb2RlLCBzaWduYWwsIHNpZ25hbERlc2NyaXB0aW9uLCBleGl0Q29kZSwgaXNDYW5jZWxlZH0pID0+IHtcblx0aWYgKHRpbWVkT3V0KSB7XG5cdFx0cmV0dXJuIGB0aW1lZCBvdXQgYWZ0ZXIgJHt0aW1lb3V0fSBtaWxsaXNlY29uZHNgO1xuXHR9XG5cblx0aWYgKGlzQ2FuY2VsZWQpIHtcblx0XHRyZXR1cm4gJ3dhcyBjYW5jZWxlZCc7XG5cdH1cblxuXHRpZiAoZXJyb3JDb2RlICE9PSB1bmRlZmluZWQpIHtcblx0XHRyZXR1cm4gYGZhaWxlZCB3aXRoICR7ZXJyb3JDb2RlfWA7XG5cdH1cblxuXHRpZiAoc2lnbmFsICE9PSB1bmRlZmluZWQpIHtcblx0XHRyZXR1cm4gYHdhcyBraWxsZWQgd2l0aCAke3NpZ25hbH0gKCR7c2lnbmFsRGVzY3JpcHRpb259KWA7XG5cdH1cblxuXHRpZiAoZXhpdENvZGUgIT09IHVuZGVmaW5lZCkge1xuXHRcdHJldHVybiBgZmFpbGVkIHdpdGggZXhpdCBjb2RlICR7ZXhpdENvZGV9YDtcblx0fVxuXG5cdHJldHVybiAnZmFpbGVkJztcbn07XG5cbmNvbnN0IG1ha2VFcnJvciA9ICh7XG5cdHN0ZG91dCxcblx0c3RkZXJyLFxuXHRhbGwsXG5cdGVycm9yLFxuXHRzaWduYWwsXG5cdGV4aXRDb2RlLFxuXHRjb21tYW5kLFxuXHRlc2NhcGVkQ29tbWFuZCxcblx0dGltZWRPdXQsXG5cdGlzQ2FuY2VsZWQsXG5cdGtpbGxlZCxcblx0cGFyc2VkOiB7b3B0aW9uczoge3RpbWVvdXR9fVxufSkgPT4ge1xuXHQvLyBgc2lnbmFsYCBhbmQgYGV4aXRDb2RlYCBlbWl0dGVkIG9uIGBzcGF3bmVkLm9uKCdleGl0JylgIGV2ZW50IGNhbiBiZSBgbnVsbGAuXG5cdC8vIFdlIG5vcm1hbGl6ZSB0aGVtIHRvIGB1bmRlZmluZWRgXG5cdGV4aXRDb2RlID0gZXhpdENvZGUgPT09IG51bGwgPyB1bmRlZmluZWQgOiBleGl0Q29kZTtcblx0c2lnbmFsID0gc2lnbmFsID09PSBudWxsID8gdW5kZWZpbmVkIDogc2lnbmFsO1xuXHRjb25zdCBzaWduYWxEZXNjcmlwdGlvbiA9IHNpZ25hbCA9PT0gdW5kZWZpbmVkID8gdW5kZWZpbmVkIDogc2lnbmFsc0J5TmFtZVtzaWduYWxdLmRlc2NyaXB0aW9uO1xuXG5cdGNvbnN0IGVycm9yQ29kZSA9IGVycm9yICYmIGVycm9yLmNvZGU7XG5cblx0Y29uc3QgcHJlZml4ID0gZ2V0RXJyb3JQcmVmaXgoe3RpbWVkT3V0LCB0aW1lb3V0LCBlcnJvckNvZGUsIHNpZ25hbCwgc2lnbmFsRGVzY3JpcHRpb24sIGV4aXRDb2RlLCBpc0NhbmNlbGVkfSk7XG5cdGNvbnN0IGV4ZWNhTWVzc2FnZSA9IGBDb21tYW5kICR7cHJlZml4fTogJHtjb21tYW5kfWA7XG5cdGNvbnN0IGlzRXJyb3IgPSBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwoZXJyb3IpID09PSAnW29iamVjdCBFcnJvcl0nO1xuXHRjb25zdCBzaG9ydE1lc3NhZ2UgPSBpc0Vycm9yID8gYCR7ZXhlY2FNZXNzYWdlfVxcbiR7ZXJyb3IubWVzc2FnZX1gIDogZXhlY2FNZXNzYWdlO1xuXHRjb25zdCBtZXNzYWdlID0gW3Nob3J0TWVzc2FnZSwgc3RkZXJyLCBzdGRvdXRdLmZpbHRlcihCb29sZWFuKS5qb2luKCdcXG4nKTtcblxuXHRpZiAoaXNFcnJvcikge1xuXHRcdGVycm9yLm9yaWdpbmFsTWVzc2FnZSA9IGVycm9yLm1lc3NhZ2U7XG5cdFx0ZXJyb3IubWVzc2FnZSA9IG1lc3NhZ2U7XG5cdH0gZWxzZSB7XG5cdFx0ZXJyb3IgPSBuZXcgRXJyb3IobWVzc2FnZSk7XG5cdH1cblxuXHRlcnJvci5zaG9ydE1lc3NhZ2UgPSBzaG9ydE1lc3NhZ2U7XG5cdGVycm9yLmNvbW1hbmQgPSBjb21tYW5kO1xuXHRlcnJvci5lc2NhcGVkQ29tbWFuZCA9IGVzY2FwZWRDb21tYW5kO1xuXHRlcnJvci5leGl0Q29kZSA9IGV4aXRDb2RlO1xuXHRlcnJvci5zaWduYWwgPSBzaWduYWw7XG5cdGVycm9yLnNpZ25hbERlc2NyaXB0aW9uID0gc2lnbmFsRGVzY3JpcHRpb247XG5cdGVycm9yLnN0ZG91dCA9IHN0ZG91dDtcblx0ZXJyb3Iuc3RkZXJyID0gc3RkZXJyO1xuXG5cdGlmIChhbGwgIT09IHVuZGVmaW5lZCkge1xuXHRcdGVycm9yLmFsbCA9IGFsbDtcblx0fVxuXG5cdGlmICgnYnVmZmVyZWREYXRhJyBpbiBlcnJvcikge1xuXHRcdGRlbGV0ZSBlcnJvci5idWZmZXJlZERhdGE7XG5cdH1cblxuXHRlcnJvci5mYWlsZWQgPSB0cnVlO1xuXHRlcnJvci50aW1lZE91dCA9IEJvb2xlYW4odGltZWRPdXQpO1xuXHRlcnJvci5pc0NhbmNlbGVkID0gaXNDYW5jZWxlZDtcblx0ZXJyb3Iua2lsbGVkID0ga2lsbGVkICYmICF0aW1lZE91dDtcblxuXHRyZXR1cm4gZXJyb3I7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IG1ha2VFcnJvcjtcbiIsIid1c2Ugc3RyaWN0JztcbmNvbnN0IGFsaWFzZXMgPSBbJ3N0ZGluJywgJ3N0ZG91dCcsICdzdGRlcnInXTtcblxuY29uc3QgaGFzQWxpYXMgPSBvcHRpb25zID0+IGFsaWFzZXMuc29tZShhbGlhcyA9PiBvcHRpb25zW2FsaWFzXSAhPT0gdW5kZWZpbmVkKTtcblxuY29uc3Qgbm9ybWFsaXplU3RkaW8gPSBvcHRpb25zID0+IHtcblx0aWYgKCFvcHRpb25zKSB7XG5cdFx0cmV0dXJuO1xuXHR9XG5cblx0Y29uc3Qge3N0ZGlvfSA9IG9wdGlvbnM7XG5cblx0aWYgKHN0ZGlvID09PSB1bmRlZmluZWQpIHtcblx0XHRyZXR1cm4gYWxpYXNlcy5tYXAoYWxpYXMgPT4gb3B0aW9uc1thbGlhc10pO1xuXHR9XG5cblx0aWYgKGhhc0FsaWFzKG9wdGlvbnMpKSB7XG5cdFx0dGhyb3cgbmV3IEVycm9yKGBJdCdzIG5vdCBwb3NzaWJsZSB0byBwcm92aWRlIFxcYHN0ZGlvXFxgIGluIGNvbWJpbmF0aW9uIHdpdGggb25lIG9mICR7YWxpYXNlcy5tYXAoYWxpYXMgPT4gYFxcYCR7YWxpYXN9XFxgYCkuam9pbignLCAnKX1gKTtcblx0fVxuXG5cdGlmICh0eXBlb2Ygc3RkaW8gPT09ICdzdHJpbmcnKSB7XG5cdFx0cmV0dXJuIHN0ZGlvO1xuXHR9XG5cblx0aWYgKCFBcnJheS5pc0FycmF5KHN0ZGlvKSkge1xuXHRcdHRocm93IG5ldyBUeXBlRXJyb3IoYEV4cGVjdGVkIFxcYHN0ZGlvXFxgIHRvIGJlIG9mIHR5cGUgXFxgc3RyaW5nXFxgIG9yIFxcYEFycmF5XFxgLCBnb3QgXFxgJHt0eXBlb2Ygc3RkaW99XFxgYCk7XG5cdH1cblxuXHRjb25zdCBsZW5ndGggPSBNYXRoLm1heChzdGRpby5sZW5ndGgsIGFsaWFzZXMubGVuZ3RoKTtcblx0cmV0dXJuIEFycmF5LmZyb20oe2xlbmd0aH0sICh2YWx1ZSwgaW5kZXgpID0+IHN0ZGlvW2luZGV4XSk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IG5vcm1hbGl6ZVN0ZGlvO1xuXG4vLyBgaXBjYCBpcyBwdXNoZWQgdW5sZXNzIGl0IGlzIGFscmVhZHkgcHJlc2VudFxubW9kdWxlLmV4cG9ydHMubm9kZSA9IG9wdGlvbnMgPT4ge1xuXHRjb25zdCBzdGRpbyA9IG5vcm1hbGl6ZVN0ZGlvKG9wdGlvbnMpO1xuXG5cdGlmIChzdGRpbyA9PT0gJ2lwYycpIHtcblx0XHRyZXR1cm4gJ2lwYyc7XG5cdH1cblxuXHRpZiAoc3RkaW8gPT09IHVuZGVmaW5lZCB8fCB0eXBlb2Ygc3RkaW8gPT09ICdzdHJpbmcnKSB7XG5cdFx0cmV0dXJuIFtzdGRpbywgc3RkaW8sIHN0ZGlvLCAnaXBjJ107XG5cdH1cblxuXHRpZiAoc3RkaW8uaW5jbHVkZXMoJ2lwYycpKSB7XG5cdFx0cmV0dXJuIHN0ZGlvO1xuXHR9XG5cblx0cmV0dXJuIFsuLi5zdGRpbywgJ2lwYyddO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcbmNvbnN0IG9zID0gcmVxdWlyZSgnb3MnKTtcbmNvbnN0IG9uRXhpdCA9IHJlcXVpcmUoJ3NpZ25hbC1leGl0Jyk7XG5cbmNvbnN0IERFRkFVTFRfRk9SQ0VfS0lMTF9USU1FT1VUID0gMTAwMCAqIDU7XG5cbi8vIE1vbmtleS1wYXRjaGVzIGBjaGlsZFByb2Nlc3Mua2lsbCgpYCB0byBhZGQgYGZvcmNlS2lsbEFmdGVyVGltZW91dGAgYmVoYXZpb3JcbmNvbnN0IHNwYXduZWRLaWxsID0gKGtpbGwsIHNpZ25hbCA9ICdTSUdURVJNJywgb3B0aW9ucyA9IHt9KSA9PiB7XG5cdGNvbnN0IGtpbGxSZXN1bHQgPSBraWxsKHNpZ25hbCk7XG5cdHNldEtpbGxUaW1lb3V0KGtpbGwsIHNpZ25hbCwgb3B0aW9ucywga2lsbFJlc3VsdCk7XG5cdHJldHVybiBraWxsUmVzdWx0O1xufTtcblxuY29uc3Qgc2V0S2lsbFRpbWVvdXQgPSAoa2lsbCwgc2lnbmFsLCBvcHRpb25zLCBraWxsUmVzdWx0KSA9PiB7XG5cdGlmICghc2hvdWxkRm9yY2VLaWxsKHNpZ25hbCwgb3B0aW9ucywga2lsbFJlc3VsdCkpIHtcblx0XHRyZXR1cm47XG5cdH1cblxuXHRjb25zdCB0aW1lb3V0ID0gZ2V0Rm9yY2VLaWxsQWZ0ZXJUaW1lb3V0KG9wdGlvbnMpO1xuXHRjb25zdCB0ID0gc2V0VGltZW91dCgoKSA9PiB7XG5cdFx0a2lsbCgnU0lHS0lMTCcpO1xuXHR9LCB0aW1lb3V0KTtcblxuXHQvLyBHdWFyZGVkIGJlY2F1c2UgdGhlcmUncyBubyBgLnVucmVmKClgIHdoZW4gYGV4ZWNhYCBpcyB1c2VkIGluIHRoZSByZW5kZXJlclxuXHQvLyBwcm9jZXNzIGluIEVsZWN0cm9uLiBUaGlzIGNhbm5vdCBiZSB0ZXN0ZWQgc2luY2Ugd2UgZG9uJ3QgcnVuIHRlc3RzIGluXG5cdC8vIEVsZWN0cm9uLlxuXHQvLyBpc3RhbmJ1bCBpZ25vcmUgZWxzZVxuXHRpZiAodC51bnJlZikge1xuXHRcdHQudW5yZWYoKTtcblx0fVxufTtcblxuY29uc3Qgc2hvdWxkRm9yY2VLaWxsID0gKHNpZ25hbCwge2ZvcmNlS2lsbEFmdGVyVGltZW91dH0sIGtpbGxSZXN1bHQpID0+IHtcblx0cmV0dXJuIGlzU2lndGVybShzaWduYWwpICYmIGZvcmNlS2lsbEFmdGVyVGltZW91dCAhPT0gZmFsc2UgJiYga2lsbFJlc3VsdDtcbn07XG5cbmNvbnN0IGlzU2lndGVybSA9IHNpZ25hbCA9PiB7XG5cdHJldHVybiBzaWduYWwgPT09IG9zLmNvbnN0YW50cy5zaWduYWxzLlNJR1RFUk0gfHxcblx0XHQodHlwZW9mIHNpZ25hbCA9PT0gJ3N0cmluZycgJiYgc2lnbmFsLnRvVXBwZXJDYXNlKCkgPT09ICdTSUdURVJNJyk7XG59O1xuXG5jb25zdCBnZXRGb3JjZUtpbGxBZnRlclRpbWVvdXQgPSAoe2ZvcmNlS2lsbEFmdGVyVGltZW91dCA9IHRydWV9KSA9PiB7XG5cdGlmIChmb3JjZUtpbGxBZnRlclRpbWVvdXQgPT09IHRydWUpIHtcblx0XHRyZXR1cm4gREVGQVVMVF9GT1JDRV9LSUxMX1RJTUVPVVQ7XG5cdH1cblxuXHRpZiAoIU51bWJlci5pc0Zpbml0ZShmb3JjZUtpbGxBZnRlclRpbWVvdXQpIHx8IGZvcmNlS2lsbEFmdGVyVGltZW91dCA8IDApIHtcblx0XHR0aHJvdyBuZXcgVHlwZUVycm9yKGBFeHBlY3RlZCB0aGUgXFxgZm9yY2VLaWxsQWZ0ZXJUaW1lb3V0XFxgIG9wdGlvbiB0byBiZSBhIG5vbi1uZWdhdGl2ZSBpbnRlZ2VyLCBnb3QgXFxgJHtmb3JjZUtpbGxBZnRlclRpbWVvdXR9XFxgICgke3R5cGVvZiBmb3JjZUtpbGxBZnRlclRpbWVvdXR9KWApO1xuXHR9XG5cblx0cmV0dXJuIGZvcmNlS2lsbEFmdGVyVGltZW91dDtcbn07XG5cbi8vIGBjaGlsZFByb2Nlc3MuY2FuY2VsKClgXG5jb25zdCBzcGF3bmVkQ2FuY2VsID0gKHNwYXduZWQsIGNvbnRleHQpID0+IHtcblx0Y29uc3Qga2lsbFJlc3VsdCA9IHNwYXduZWQua2lsbCgpO1xuXG5cdGlmIChraWxsUmVzdWx0KSB7XG5cdFx0Y29udGV4dC5pc0NhbmNlbGVkID0gdHJ1ZTtcblx0fVxufTtcblxuY29uc3QgdGltZW91dEtpbGwgPSAoc3Bhd25lZCwgc2lnbmFsLCByZWplY3QpID0+IHtcblx0c3Bhd25lZC5raWxsKHNpZ25hbCk7XG5cdHJlamVjdChPYmplY3QuYXNzaWduKG5ldyBFcnJvcignVGltZWQgb3V0JyksIHt0aW1lZE91dDogdHJ1ZSwgc2lnbmFsfSkpO1xufTtcblxuLy8gYHRpbWVvdXRgIG9wdGlvbiBoYW5kbGluZ1xuY29uc3Qgc2V0dXBUaW1lb3V0ID0gKHNwYXduZWQsIHt0aW1lb3V0LCBraWxsU2lnbmFsID0gJ1NJR1RFUk0nfSwgc3Bhd25lZFByb21pc2UpID0+IHtcblx0aWYgKHRpbWVvdXQgPT09IDAgfHwgdGltZW91dCA9PT0gdW5kZWZpbmVkKSB7XG5cdFx0cmV0dXJuIHNwYXduZWRQcm9taXNlO1xuXHR9XG5cblx0bGV0IHRpbWVvdXRJZDtcblx0Y29uc3QgdGltZW91dFByb21pc2UgPSBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG5cdFx0dGltZW91dElkID0gc2V0VGltZW91dCgoKSA9PiB7XG5cdFx0XHR0aW1lb3V0S2lsbChzcGF3bmVkLCBraWxsU2lnbmFsLCByZWplY3QpO1xuXHRcdH0sIHRpbWVvdXQpO1xuXHR9KTtcblxuXHRjb25zdCBzYWZlU3Bhd25lZFByb21pc2UgPSBzcGF3bmVkUHJvbWlzZS5maW5hbGx5KCgpID0+IHtcblx0XHRjbGVhclRpbWVvdXQodGltZW91dElkKTtcblx0fSk7XG5cblx0cmV0dXJuIFByb21pc2UucmFjZShbdGltZW91dFByb21pc2UsIHNhZmVTcGF3bmVkUHJvbWlzZV0pO1xufTtcblxuY29uc3QgdmFsaWRhdGVUaW1lb3V0ID0gKHt0aW1lb3V0fSkgPT4ge1xuXHRpZiAodGltZW91dCAhPT0gdW5kZWZpbmVkICYmICghTnVtYmVyLmlzRmluaXRlKHRpbWVvdXQpIHx8IHRpbWVvdXQgPCAwKSkge1xuXHRcdHRocm93IG5ldyBUeXBlRXJyb3IoYEV4cGVjdGVkIHRoZSBcXGB0aW1lb3V0XFxgIG9wdGlvbiB0byBiZSBhIG5vbi1uZWdhdGl2ZSBpbnRlZ2VyLCBnb3QgXFxgJHt0aW1lb3V0fVxcYCAoJHt0eXBlb2YgdGltZW91dH0pYCk7XG5cdH1cbn07XG5cbi8vIGBjbGVhbnVwYCBvcHRpb24gaGFuZGxpbmdcbmNvbnN0IHNldEV4aXRIYW5kbGVyID0gYXN5bmMgKHNwYXduZWQsIHtjbGVhbnVwLCBkZXRhY2hlZH0sIHRpbWVkUHJvbWlzZSkgPT4ge1xuXHRpZiAoIWNsZWFudXAgfHwgZGV0YWNoZWQpIHtcblx0XHRyZXR1cm4gdGltZWRQcm9taXNlO1xuXHR9XG5cblx0Y29uc3QgcmVtb3ZlRXhpdEhhbmRsZXIgPSBvbkV4aXQoKCkgPT4ge1xuXHRcdHNwYXduZWQua2lsbCgpO1xuXHR9KTtcblxuXHRyZXR1cm4gdGltZWRQcm9taXNlLmZpbmFsbHkoKCkgPT4ge1xuXHRcdHJlbW92ZUV4aXRIYW5kbGVyKCk7XG5cdH0pO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG5cdHNwYXduZWRLaWxsLFxuXHRzcGF3bmVkQ2FuY2VsLFxuXHRzZXR1cFRpbWVvdXQsXG5cdHZhbGlkYXRlVGltZW91dCxcblx0c2V0RXhpdEhhbmRsZXJcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbmNvbnN0IGlzU3RyZWFtID0gc3RyZWFtID0+XG5cdHN0cmVhbSAhPT0gbnVsbCAmJlxuXHR0eXBlb2Ygc3RyZWFtID09PSAnb2JqZWN0JyAmJlxuXHR0eXBlb2Ygc3RyZWFtLnBpcGUgPT09ICdmdW5jdGlvbic7XG5cbmlzU3RyZWFtLndyaXRhYmxlID0gc3RyZWFtID0+XG5cdGlzU3RyZWFtKHN0cmVhbSkgJiZcblx0c3RyZWFtLndyaXRhYmxlICE9PSBmYWxzZSAmJlxuXHR0eXBlb2Ygc3RyZWFtLl93cml0ZSA9PT0gJ2Z1bmN0aW9uJyAmJlxuXHR0eXBlb2Ygc3RyZWFtLl93cml0YWJsZVN0YXRlID09PSAnb2JqZWN0JztcblxuaXNTdHJlYW0ucmVhZGFibGUgPSBzdHJlYW0gPT5cblx0aXNTdHJlYW0oc3RyZWFtKSAmJlxuXHRzdHJlYW0ucmVhZGFibGUgIT09IGZhbHNlICYmXG5cdHR5cGVvZiBzdHJlYW0uX3JlYWQgPT09ICdmdW5jdGlvbicgJiZcblx0dHlwZW9mIHN0cmVhbS5fcmVhZGFibGVTdGF0ZSA9PT0gJ29iamVjdCc7XG5cbmlzU3RyZWFtLmR1cGxleCA9IHN0cmVhbSA9PlxuXHRpc1N0cmVhbS53cml0YWJsZShzdHJlYW0pICYmXG5cdGlzU3RyZWFtLnJlYWRhYmxlKHN0cmVhbSk7XG5cbmlzU3RyZWFtLnRyYW5zZm9ybSA9IHN0cmVhbSA9PlxuXHRpc1N0cmVhbS5kdXBsZXgoc3RyZWFtKSAmJlxuXHR0eXBlb2Ygc3RyZWFtLl90cmFuc2Zvcm0gPT09ICdmdW5jdGlvbic7XG5cbm1vZHVsZS5leHBvcnRzID0gaXNTdHJlYW07XG4iLCIndXNlIHN0cmljdCc7XG5jb25zdCBpc1N0cmVhbSA9IHJlcXVpcmUoJ2lzLXN0cmVhbScpO1xuY29uc3QgZ2V0U3RyZWFtID0gcmVxdWlyZSgnZ2V0LXN0cmVhbScpO1xuY29uc3QgbWVyZ2VTdHJlYW0gPSByZXF1aXJlKCdtZXJnZS1zdHJlYW0nKTtcblxuLy8gYGlucHV0YCBvcHRpb25cbmNvbnN0IGhhbmRsZUlucHV0ID0gKHNwYXduZWQsIGlucHV0KSA9PiB7XG5cdC8vIENoZWNraW5nIGZvciBzdGRpbiBpcyB3b3JrYXJvdW5kIGZvciBodHRwczovL2dpdGh1Yi5jb20vbm9kZWpzL25vZGUvaXNzdWVzLzI2ODUyXG5cdC8vIEB0b2RvIHJlbW92ZSBgfHwgc3Bhd25lZC5zdGRpbiA9PT0gdW5kZWZpbmVkYCBvbmNlIHdlIGRyb3Agc3VwcG9ydCBmb3IgTm9kZS5qcyA8PTEyLjIuMFxuXHRpZiAoaW5wdXQgPT09IHVuZGVmaW5lZCB8fCBzcGF3bmVkLnN0ZGluID09PSB1bmRlZmluZWQpIHtcblx0XHRyZXR1cm47XG5cdH1cblxuXHRpZiAoaXNTdHJlYW0oaW5wdXQpKSB7XG5cdFx0aW5wdXQucGlwZShzcGF3bmVkLnN0ZGluKTtcblx0fSBlbHNlIHtcblx0XHRzcGF3bmVkLnN0ZGluLmVuZChpbnB1dCk7XG5cdH1cbn07XG5cbi8vIGBhbGxgIGludGVybGVhdmVzIGBzdGRvdXRgIGFuZCBgc3RkZXJyYFxuY29uc3QgbWFrZUFsbFN0cmVhbSA9IChzcGF3bmVkLCB7YWxsfSkgPT4ge1xuXHRpZiAoIWFsbCB8fCAoIXNwYXduZWQuc3Rkb3V0ICYmICFzcGF3bmVkLnN0ZGVycikpIHtcblx0XHRyZXR1cm47XG5cdH1cblxuXHRjb25zdCBtaXhlZCA9IG1lcmdlU3RyZWFtKCk7XG5cblx0aWYgKHNwYXduZWQuc3Rkb3V0KSB7XG5cdFx0bWl4ZWQuYWRkKHNwYXduZWQuc3Rkb3V0KTtcblx0fVxuXG5cdGlmIChzcGF3bmVkLnN0ZGVycikge1xuXHRcdG1peGVkLmFkZChzcGF3bmVkLnN0ZGVycik7XG5cdH1cblxuXHRyZXR1cm4gbWl4ZWQ7XG59O1xuXG4vLyBPbiBmYWlsdXJlLCBgcmVzdWx0LnN0ZG91dHxzdGRlcnJ8YWxsYCBzaG91bGQgY29udGFpbiB0aGUgY3VycmVudGx5IGJ1ZmZlcmVkIHN0cmVhbVxuY29uc3QgZ2V0QnVmZmVyZWREYXRhID0gYXN5bmMgKHN0cmVhbSwgc3RyZWFtUHJvbWlzZSkgPT4ge1xuXHRpZiAoIXN0cmVhbSkge1xuXHRcdHJldHVybjtcblx0fVxuXG5cdHN0cmVhbS5kZXN0cm95KCk7XG5cblx0dHJ5IHtcblx0XHRyZXR1cm4gYXdhaXQgc3RyZWFtUHJvbWlzZTtcblx0fSBjYXRjaCAoZXJyb3IpIHtcblx0XHRyZXR1cm4gZXJyb3IuYnVmZmVyZWREYXRhO1xuXHR9XG59O1xuXG5jb25zdCBnZXRTdHJlYW1Qcm9taXNlID0gKHN0cmVhbSwge2VuY29kaW5nLCBidWZmZXIsIG1heEJ1ZmZlcn0pID0+IHtcblx0aWYgKCFzdHJlYW0gfHwgIWJ1ZmZlcikge1xuXHRcdHJldHVybjtcblx0fVxuXG5cdGlmIChlbmNvZGluZykge1xuXHRcdHJldHVybiBnZXRTdHJlYW0oc3RyZWFtLCB7ZW5jb2RpbmcsIG1heEJ1ZmZlcn0pO1xuXHR9XG5cblx0cmV0dXJuIGdldFN0cmVhbS5idWZmZXIoc3RyZWFtLCB7bWF4QnVmZmVyfSk7XG59O1xuXG4vLyBSZXRyaWV2ZSByZXN1bHQgb2YgY2hpbGQgcHJvY2VzczogZXhpdCBjb2RlLCBzaWduYWwsIGVycm9yLCBzdHJlYW1zIChzdGRvdXQvc3RkZXJyL2FsbClcbmNvbnN0IGdldFNwYXduZWRSZXN1bHQgPSBhc3luYyAoe3N0ZG91dCwgc3RkZXJyLCBhbGx9LCB7ZW5jb2RpbmcsIGJ1ZmZlciwgbWF4QnVmZmVyfSwgcHJvY2Vzc0RvbmUpID0+IHtcblx0Y29uc3Qgc3Rkb3V0UHJvbWlzZSA9IGdldFN0cmVhbVByb21pc2Uoc3Rkb3V0LCB7ZW5jb2RpbmcsIGJ1ZmZlciwgbWF4QnVmZmVyfSk7XG5cdGNvbnN0IHN0ZGVyclByb21pc2UgPSBnZXRTdHJlYW1Qcm9taXNlKHN0ZGVyciwge2VuY29kaW5nLCBidWZmZXIsIG1heEJ1ZmZlcn0pO1xuXHRjb25zdCBhbGxQcm9taXNlID0gZ2V0U3RyZWFtUHJvbWlzZShhbGwsIHtlbmNvZGluZywgYnVmZmVyLCBtYXhCdWZmZXI6IG1heEJ1ZmZlciAqIDJ9KTtcblxuXHR0cnkge1xuXHRcdHJldHVybiBhd2FpdCBQcm9taXNlLmFsbChbcHJvY2Vzc0RvbmUsIHN0ZG91dFByb21pc2UsIHN0ZGVyclByb21pc2UsIGFsbFByb21pc2VdKTtcblx0fSBjYXRjaCAoZXJyb3IpIHtcblx0XHRyZXR1cm4gUHJvbWlzZS5hbGwoW1xuXHRcdFx0e2Vycm9yLCBzaWduYWw6IGVycm9yLnNpZ25hbCwgdGltZWRPdXQ6IGVycm9yLnRpbWVkT3V0fSxcblx0XHRcdGdldEJ1ZmZlcmVkRGF0YShzdGRvdXQsIHN0ZG91dFByb21pc2UpLFxuXHRcdFx0Z2V0QnVmZmVyZWREYXRhKHN0ZGVyciwgc3RkZXJyUHJvbWlzZSksXG5cdFx0XHRnZXRCdWZmZXJlZERhdGEoYWxsLCBhbGxQcm9taXNlKVxuXHRcdF0pO1xuXHR9XG59O1xuXG5jb25zdCB2YWxpZGF0ZUlucHV0U3luYyA9ICh7aW5wdXR9KSA9PiB7XG5cdGlmIChpc1N0cmVhbShpbnB1dCkpIHtcblx0XHR0aHJvdyBuZXcgVHlwZUVycm9yKCdUaGUgYGlucHV0YCBvcHRpb24gY2Fubm90IGJlIGEgc3RyZWFtIGluIHN5bmMgbW9kZScpO1xuXHR9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcblx0aGFuZGxlSW5wdXQsXG5cdG1ha2VBbGxTdHJlYW0sXG5cdGdldFNwYXduZWRSZXN1bHQsXG5cdHZhbGlkYXRlSW5wdXRTeW5jXG59O1xuXG4iLCIndXNlIHN0cmljdCc7XG5cbmNvbnN0IG5hdGl2ZVByb21pc2VQcm90b3R5cGUgPSAoYXN5bmMgKCkgPT4ge30pKCkuY29uc3RydWN0b3IucHJvdG90eXBlO1xuY29uc3QgZGVzY3JpcHRvcnMgPSBbJ3RoZW4nLCAnY2F0Y2gnLCAnZmluYWxseSddLm1hcChwcm9wZXJ0eSA9PiBbXG5cdHByb3BlcnR5LFxuXHRSZWZsZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihuYXRpdmVQcm9taXNlUHJvdG90eXBlLCBwcm9wZXJ0eSlcbl0pO1xuXG4vLyBUaGUgcmV0dXJuIHZhbHVlIGlzIGEgbWl4aW4gb2YgYGNoaWxkUHJvY2Vzc2AgYW5kIGBQcm9taXNlYFxuY29uc3QgbWVyZ2VQcm9taXNlID0gKHNwYXduZWQsIHByb21pc2UpID0+IHtcblx0Zm9yIChjb25zdCBbcHJvcGVydHksIGRlc2NyaXB0b3JdIG9mIGRlc2NyaXB0b3JzKSB7XG5cdFx0Ly8gU3RhcnRpbmcgdGhlIG1haW4gYHByb21pc2VgIGlzIGRlZmVycmVkIHRvIGF2b2lkIGNvbnN1bWluZyBzdHJlYW1zXG5cdFx0Y29uc3QgdmFsdWUgPSB0eXBlb2YgcHJvbWlzZSA9PT0gJ2Z1bmN0aW9uJyA/XG5cdFx0XHQoLi4uYXJncykgPT4gUmVmbGVjdC5hcHBseShkZXNjcmlwdG9yLnZhbHVlLCBwcm9taXNlKCksIGFyZ3MpIDpcblx0XHRcdGRlc2NyaXB0b3IudmFsdWUuYmluZChwcm9taXNlKTtcblxuXHRcdFJlZmxlY3QuZGVmaW5lUHJvcGVydHkoc3Bhd25lZCwgcHJvcGVydHksIHsuLi5kZXNjcmlwdG9yLCB2YWx1ZX0pO1xuXHR9XG5cblx0cmV0dXJuIHNwYXduZWQ7XG59O1xuXG4vLyBVc2UgcHJvbWlzZXMgaW5zdGVhZCBvZiBgY2hpbGRfcHJvY2Vzc2AgZXZlbnRzXG5jb25zdCBnZXRTcGF3bmVkUHJvbWlzZSA9IHNwYXduZWQgPT4ge1xuXHRyZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuXHRcdHNwYXduZWQub24oJ2V4aXQnLCAoZXhpdENvZGUsIHNpZ25hbCkgPT4ge1xuXHRcdFx0cmVzb2x2ZSh7ZXhpdENvZGUsIHNpZ25hbH0pO1xuXHRcdH0pO1xuXG5cdFx0c3Bhd25lZC5vbignZXJyb3InLCBlcnJvciA9PiB7XG5cdFx0XHRyZWplY3QoZXJyb3IpO1xuXHRcdH0pO1xuXG5cdFx0aWYgKHNwYXduZWQuc3RkaW4pIHtcblx0XHRcdHNwYXduZWQuc3RkaW4ub24oJ2Vycm9yJywgZXJyb3IgPT4ge1xuXHRcdFx0XHRyZWplY3QoZXJyb3IpO1xuXHRcdFx0fSk7XG5cdFx0fVxuXHR9KTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuXHRtZXJnZVByb21pc2UsXG5cdGdldFNwYXduZWRQcm9taXNlXG59O1xuXG4iLCIndXNlIHN0cmljdCc7XG5jb25zdCBub3JtYWxpemVBcmdzID0gKGZpbGUsIGFyZ3MgPSBbXSkgPT4ge1xuXHRpZiAoIUFycmF5LmlzQXJyYXkoYXJncykpIHtcblx0XHRyZXR1cm4gW2ZpbGVdO1xuXHR9XG5cblx0cmV0dXJuIFtmaWxlLCAuLi5hcmdzXTtcbn07XG5cbmNvbnN0IE5PX0VTQ0FQRV9SRUdFWFAgPSAvXltcXHcuLV0rJC87XG5jb25zdCBET1VCTEVfUVVPVEVTX1JFR0VYUCA9IC9cIi9nO1xuXG5jb25zdCBlc2NhcGVBcmcgPSBhcmcgPT4ge1xuXHRpZiAodHlwZW9mIGFyZyAhPT0gJ3N0cmluZycgfHwgTk9fRVNDQVBFX1JFR0VYUC50ZXN0KGFyZykpIHtcblx0XHRyZXR1cm4gYXJnO1xuXHR9XG5cblx0cmV0dXJuIGBcIiR7YXJnLnJlcGxhY2UoRE9VQkxFX1FVT1RFU19SRUdFWFAsICdcXFxcXCInKX1cImA7XG59O1xuXG5jb25zdCBqb2luQ29tbWFuZCA9IChmaWxlLCBhcmdzKSA9PiB7XG5cdHJldHVybiBub3JtYWxpemVBcmdzKGZpbGUsIGFyZ3MpLmpvaW4oJyAnKTtcbn07XG5cbmNvbnN0IGdldEVzY2FwZWRDb21tYW5kID0gKGZpbGUsIGFyZ3MpID0+IHtcblx0cmV0dXJuIG5vcm1hbGl6ZUFyZ3MoZmlsZSwgYXJncykubWFwKGFyZyA9PiBlc2NhcGVBcmcoYXJnKSkuam9pbignICcpO1xufTtcblxuY29uc3QgU1BBQ0VTX1JFR0VYUCA9IC8gKy9nO1xuXG4vLyBIYW5kbGUgYGV4ZWNhLmNvbW1hbmQoKWBcbmNvbnN0IHBhcnNlQ29tbWFuZCA9IGNvbW1hbmQgPT4ge1xuXHRjb25zdCB0b2tlbnMgPSBbXTtcblx0Zm9yIChjb25zdCB0b2tlbiBvZiBjb21tYW5kLnRyaW0oKS5zcGxpdChTUEFDRVNfUkVHRVhQKSkge1xuXHRcdC8vIEFsbG93IHNwYWNlcyB0byBiZSBlc2NhcGVkIGJ5IGEgYmFja3NsYXNoIGlmIG5vdCBtZWFudCBhcyBhIGRlbGltaXRlclxuXHRcdGNvbnN0IHByZXZpb3VzVG9rZW4gPSB0b2tlbnNbdG9rZW5zLmxlbmd0aCAtIDFdO1xuXHRcdGlmIChwcmV2aW91c1Rva2VuICYmIHByZXZpb3VzVG9rZW4uZW5kc1dpdGgoJ1xcXFwnKSkge1xuXHRcdFx0Ly8gTWVyZ2UgcHJldmlvdXMgdG9rZW4gd2l0aCBjdXJyZW50IG9uZVxuXHRcdFx0dG9rZW5zW3Rva2Vucy5sZW5ndGggLSAxXSA9IGAke3ByZXZpb3VzVG9rZW4uc2xpY2UoMCwgLTEpfSAke3Rva2VufWA7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHRva2Vucy5wdXNoKHRva2VuKTtcblx0XHR9XG5cdH1cblxuXHRyZXR1cm4gdG9rZW5zO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG5cdGpvaW5Db21tYW5kLFxuXHRnZXRFc2NhcGVkQ29tbWFuZCxcblx0cGFyc2VDb21tYW5kXG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuY29uc3QgcGF0aCA9IHJlcXVpcmUoJ3BhdGgnKTtcbmNvbnN0IGNoaWxkUHJvY2VzcyA9IHJlcXVpcmUoJ2NoaWxkX3Byb2Nlc3MnKTtcbmNvbnN0IGNyb3NzU3Bhd24gPSByZXF1aXJlKCdjcm9zcy1zcGF3bicpO1xuY29uc3Qgc3RyaXBGaW5hbE5ld2xpbmUgPSByZXF1aXJlKCdzdHJpcC1maW5hbC1uZXdsaW5lJyk7XG5jb25zdCBucG1SdW5QYXRoID0gcmVxdWlyZSgnbnBtLXJ1bi1wYXRoJyk7XG5jb25zdCBvbmV0aW1lID0gcmVxdWlyZSgnb25ldGltZScpO1xuY29uc3QgbWFrZUVycm9yID0gcmVxdWlyZSgnLi9saWIvZXJyb3InKTtcbmNvbnN0IG5vcm1hbGl6ZVN0ZGlvID0gcmVxdWlyZSgnLi9saWIvc3RkaW8nKTtcbmNvbnN0IHtzcGF3bmVkS2lsbCwgc3Bhd25lZENhbmNlbCwgc2V0dXBUaW1lb3V0LCB2YWxpZGF0ZVRpbWVvdXQsIHNldEV4aXRIYW5kbGVyfSA9IHJlcXVpcmUoJy4vbGliL2tpbGwnKTtcbmNvbnN0IHtoYW5kbGVJbnB1dCwgZ2V0U3Bhd25lZFJlc3VsdCwgbWFrZUFsbFN0cmVhbSwgdmFsaWRhdGVJbnB1dFN5bmN9ID0gcmVxdWlyZSgnLi9saWIvc3RyZWFtJyk7XG5jb25zdCB7bWVyZ2VQcm9taXNlLCBnZXRTcGF3bmVkUHJvbWlzZX0gPSByZXF1aXJlKCcuL2xpYi9wcm9taXNlJyk7XG5jb25zdCB7am9pbkNvbW1hbmQsIHBhcnNlQ29tbWFuZCwgZ2V0RXNjYXBlZENvbW1hbmR9ID0gcmVxdWlyZSgnLi9saWIvY29tbWFuZCcpO1xuXG5jb25zdCBERUZBVUxUX01BWF9CVUZGRVIgPSAxMDAwICogMTAwMCAqIDEwMDtcblxuY29uc3QgZ2V0RW52ID0gKHtlbnY6IGVudk9wdGlvbiwgZXh0ZW5kRW52LCBwcmVmZXJMb2NhbCwgbG9jYWxEaXIsIGV4ZWNQYXRofSkgPT4ge1xuXHRjb25zdCBlbnYgPSBleHRlbmRFbnYgPyB7Li4ucHJvY2Vzcy5lbnYsIC4uLmVudk9wdGlvbn0gOiBlbnZPcHRpb247XG5cblx0aWYgKHByZWZlckxvY2FsKSB7XG5cdFx0cmV0dXJuIG5wbVJ1blBhdGguZW52KHtlbnYsIGN3ZDogbG9jYWxEaXIsIGV4ZWNQYXRofSk7XG5cdH1cblxuXHRyZXR1cm4gZW52O1xufTtcblxuY29uc3QgaGFuZGxlQXJndW1lbnRzID0gKGZpbGUsIGFyZ3MsIG9wdGlvbnMgPSB7fSkgPT4ge1xuXHRjb25zdCBwYXJzZWQgPSBjcm9zc1NwYXduLl9wYXJzZShmaWxlLCBhcmdzLCBvcHRpb25zKTtcblx0ZmlsZSA9IHBhcnNlZC5jb21tYW5kO1xuXHRhcmdzID0gcGFyc2VkLmFyZ3M7XG5cdG9wdGlvbnMgPSBwYXJzZWQub3B0aW9ucztcblxuXHRvcHRpb25zID0ge1xuXHRcdG1heEJ1ZmZlcjogREVGQVVMVF9NQVhfQlVGRkVSLFxuXHRcdGJ1ZmZlcjogdHJ1ZSxcblx0XHRzdHJpcEZpbmFsTmV3bGluZTogdHJ1ZSxcblx0XHRleHRlbmRFbnY6IHRydWUsXG5cdFx0cHJlZmVyTG9jYWw6IGZhbHNlLFxuXHRcdGxvY2FsRGlyOiBvcHRpb25zLmN3ZCB8fCBwcm9jZXNzLmN3ZCgpLFxuXHRcdGV4ZWNQYXRoOiBwcm9jZXNzLmV4ZWNQYXRoLFxuXHRcdGVuY29kaW5nOiAndXRmOCcsXG5cdFx0cmVqZWN0OiB0cnVlLFxuXHRcdGNsZWFudXA6IHRydWUsXG5cdFx0YWxsOiBmYWxzZSxcblx0XHR3aW5kb3dzSGlkZTogdHJ1ZSxcblx0XHQuLi5vcHRpb25zXG5cdH07XG5cblx0b3B0aW9ucy5lbnYgPSBnZXRFbnYob3B0aW9ucyk7XG5cblx0b3B0aW9ucy5zdGRpbyA9IG5vcm1hbGl6ZVN0ZGlvKG9wdGlvbnMpO1xuXG5cdGlmIChwcm9jZXNzLnBsYXRmb3JtID09PSAnd2luMzInICYmIHBhdGguYmFzZW5hbWUoZmlsZSwgJy5leGUnKSA9PT0gJ2NtZCcpIHtcblx0XHQvLyAjMTE2XG5cdFx0YXJncy51bnNoaWZ0KCcvcScpO1xuXHR9XG5cblx0cmV0dXJuIHtmaWxlLCBhcmdzLCBvcHRpb25zLCBwYXJzZWR9O1xufTtcblxuY29uc3QgaGFuZGxlT3V0cHV0ID0gKG9wdGlvbnMsIHZhbHVlLCBlcnJvcikgPT4ge1xuXHRpZiAodHlwZW9mIHZhbHVlICE9PSAnc3RyaW5nJyAmJiAhQnVmZmVyLmlzQnVmZmVyKHZhbHVlKSkge1xuXHRcdC8vIFdoZW4gYGV4ZWNhLnN5bmMoKWAgZXJyb3JzLCB3ZSBub3JtYWxpemUgaXQgdG8gJycgdG8gbWltaWMgYGV4ZWNhKClgXG5cdFx0cmV0dXJuIGVycm9yID09PSB1bmRlZmluZWQgPyB1bmRlZmluZWQgOiAnJztcblx0fVxuXG5cdGlmIChvcHRpb25zLnN0cmlwRmluYWxOZXdsaW5lKSB7XG5cdFx0cmV0dXJuIHN0cmlwRmluYWxOZXdsaW5lKHZhbHVlKTtcblx0fVxuXG5cdHJldHVybiB2YWx1ZTtcbn07XG5cbmNvbnN0IGV4ZWNhID0gKGZpbGUsIGFyZ3MsIG9wdGlvbnMpID0+IHtcblx0Y29uc3QgcGFyc2VkID0gaGFuZGxlQXJndW1lbnRzKGZpbGUsIGFyZ3MsIG9wdGlvbnMpO1xuXHRjb25zdCBjb21tYW5kID0gam9pbkNvbW1hbmQoZmlsZSwgYXJncyk7XG5cdGNvbnN0IGVzY2FwZWRDb21tYW5kID0gZ2V0RXNjYXBlZENvbW1hbmQoZmlsZSwgYXJncyk7XG5cblx0dmFsaWRhdGVUaW1lb3V0KHBhcnNlZC5vcHRpb25zKTtcblxuXHRsZXQgc3Bhd25lZDtcblx0dHJ5IHtcblx0XHRzcGF3bmVkID0gY2hpbGRQcm9jZXNzLnNwYXduKHBhcnNlZC5maWxlLCBwYXJzZWQuYXJncywgcGFyc2VkLm9wdGlvbnMpO1xuXHR9IGNhdGNoIChlcnJvcikge1xuXHRcdC8vIEVuc3VyZSB0aGUgcmV0dXJuZWQgZXJyb3IgaXMgYWx3YXlzIGJvdGggYSBwcm9taXNlIGFuZCBhIGNoaWxkIHByb2Nlc3Ncblx0XHRjb25zdCBkdW1teVNwYXduZWQgPSBuZXcgY2hpbGRQcm9jZXNzLkNoaWxkUHJvY2VzcygpO1xuXHRcdGNvbnN0IGVycm9yUHJvbWlzZSA9IFByb21pc2UucmVqZWN0KG1ha2VFcnJvcih7XG5cdFx0XHRlcnJvcixcblx0XHRcdHN0ZG91dDogJycsXG5cdFx0XHRzdGRlcnI6ICcnLFxuXHRcdFx0YWxsOiAnJyxcblx0XHRcdGNvbW1hbmQsXG5cdFx0XHRlc2NhcGVkQ29tbWFuZCxcblx0XHRcdHBhcnNlZCxcblx0XHRcdHRpbWVkT3V0OiBmYWxzZSxcblx0XHRcdGlzQ2FuY2VsZWQ6IGZhbHNlLFxuXHRcdFx0a2lsbGVkOiBmYWxzZVxuXHRcdH0pKTtcblx0XHRyZXR1cm4gbWVyZ2VQcm9taXNlKGR1bW15U3Bhd25lZCwgZXJyb3JQcm9taXNlKTtcblx0fVxuXG5cdGNvbnN0IHNwYXduZWRQcm9taXNlID0gZ2V0U3Bhd25lZFByb21pc2Uoc3Bhd25lZCk7XG5cdGNvbnN0IHRpbWVkUHJvbWlzZSA9IHNldHVwVGltZW91dChzcGF3bmVkLCBwYXJzZWQub3B0aW9ucywgc3Bhd25lZFByb21pc2UpO1xuXHRjb25zdCBwcm9jZXNzRG9uZSA9IHNldEV4aXRIYW5kbGVyKHNwYXduZWQsIHBhcnNlZC5vcHRpb25zLCB0aW1lZFByb21pc2UpO1xuXG5cdGNvbnN0IGNvbnRleHQgPSB7aXNDYW5jZWxlZDogZmFsc2V9O1xuXG5cdHNwYXduZWQua2lsbCA9IHNwYXduZWRLaWxsLmJpbmQobnVsbCwgc3Bhd25lZC5raWxsLmJpbmQoc3Bhd25lZCkpO1xuXHRzcGF3bmVkLmNhbmNlbCA9IHNwYXduZWRDYW5jZWwuYmluZChudWxsLCBzcGF3bmVkLCBjb250ZXh0KTtcblxuXHRjb25zdCBoYW5kbGVQcm9taXNlID0gYXN5bmMgKCkgPT4ge1xuXHRcdGNvbnN0IFt7ZXJyb3IsIGV4aXRDb2RlLCBzaWduYWwsIHRpbWVkT3V0fSwgc3Rkb3V0UmVzdWx0LCBzdGRlcnJSZXN1bHQsIGFsbFJlc3VsdF0gPSBhd2FpdCBnZXRTcGF3bmVkUmVzdWx0KHNwYXduZWQsIHBhcnNlZC5vcHRpb25zLCBwcm9jZXNzRG9uZSk7XG5cdFx0Y29uc3Qgc3Rkb3V0ID0gaGFuZGxlT3V0cHV0KHBhcnNlZC5vcHRpb25zLCBzdGRvdXRSZXN1bHQpO1xuXHRcdGNvbnN0IHN0ZGVyciA9IGhhbmRsZU91dHB1dChwYXJzZWQub3B0aW9ucywgc3RkZXJyUmVzdWx0KTtcblx0XHRjb25zdCBhbGwgPSBoYW5kbGVPdXRwdXQocGFyc2VkLm9wdGlvbnMsIGFsbFJlc3VsdCk7XG5cblx0XHRpZiAoZXJyb3IgfHwgZXhpdENvZGUgIT09IDAgfHwgc2lnbmFsICE9PSBudWxsKSB7XG5cdFx0XHRjb25zdCByZXR1cm5lZEVycm9yID0gbWFrZUVycm9yKHtcblx0XHRcdFx0ZXJyb3IsXG5cdFx0XHRcdGV4aXRDb2RlLFxuXHRcdFx0XHRzaWduYWwsXG5cdFx0XHRcdHN0ZG91dCxcblx0XHRcdFx0c3RkZXJyLFxuXHRcdFx0XHRhbGwsXG5cdFx0XHRcdGNvbW1hbmQsXG5cdFx0XHRcdGVzY2FwZWRDb21tYW5kLFxuXHRcdFx0XHRwYXJzZWQsXG5cdFx0XHRcdHRpbWVkT3V0LFxuXHRcdFx0XHRpc0NhbmNlbGVkOiBjb250ZXh0LmlzQ2FuY2VsZWQsXG5cdFx0XHRcdGtpbGxlZDogc3Bhd25lZC5raWxsZWRcblx0XHRcdH0pO1xuXG5cdFx0XHRpZiAoIXBhcnNlZC5vcHRpb25zLnJlamVjdCkge1xuXHRcdFx0XHRyZXR1cm4gcmV0dXJuZWRFcnJvcjtcblx0XHRcdH1cblxuXHRcdFx0dGhyb3cgcmV0dXJuZWRFcnJvcjtcblx0XHR9XG5cblx0XHRyZXR1cm4ge1xuXHRcdFx0Y29tbWFuZCxcblx0XHRcdGVzY2FwZWRDb21tYW5kLFxuXHRcdFx0ZXhpdENvZGU6IDAsXG5cdFx0XHRzdGRvdXQsXG5cdFx0XHRzdGRlcnIsXG5cdFx0XHRhbGwsXG5cdFx0XHRmYWlsZWQ6IGZhbHNlLFxuXHRcdFx0dGltZWRPdXQ6IGZhbHNlLFxuXHRcdFx0aXNDYW5jZWxlZDogZmFsc2UsXG5cdFx0XHRraWxsZWQ6IGZhbHNlXG5cdFx0fTtcblx0fTtcblxuXHRjb25zdCBoYW5kbGVQcm9taXNlT25jZSA9IG9uZXRpbWUoaGFuZGxlUHJvbWlzZSk7XG5cblx0aGFuZGxlSW5wdXQoc3Bhd25lZCwgcGFyc2VkLm9wdGlvbnMuaW5wdXQpO1xuXG5cdHNwYXduZWQuYWxsID0gbWFrZUFsbFN0cmVhbShzcGF3bmVkLCBwYXJzZWQub3B0aW9ucyk7XG5cblx0cmV0dXJuIG1lcmdlUHJvbWlzZShzcGF3bmVkLCBoYW5kbGVQcm9taXNlT25jZSk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGV4ZWNhO1xuXG5tb2R1bGUuZXhwb3J0cy5zeW5jID0gKGZpbGUsIGFyZ3MsIG9wdGlvbnMpID0+IHtcblx0Y29uc3QgcGFyc2VkID0gaGFuZGxlQXJndW1lbnRzKGZpbGUsIGFyZ3MsIG9wdGlvbnMpO1xuXHRjb25zdCBjb21tYW5kID0gam9pbkNvbW1hbmQoZmlsZSwgYXJncyk7XG5cdGNvbnN0IGVzY2FwZWRDb21tYW5kID0gZ2V0RXNjYXBlZENvbW1hbmQoZmlsZSwgYXJncyk7XG5cblx0dmFsaWRhdGVJbnB1dFN5bmMocGFyc2VkLm9wdGlvbnMpO1xuXG5cdGxldCByZXN1bHQ7XG5cdHRyeSB7XG5cdFx0cmVzdWx0ID0gY2hpbGRQcm9jZXNzLnNwYXduU3luYyhwYXJzZWQuZmlsZSwgcGFyc2VkLmFyZ3MsIHBhcnNlZC5vcHRpb25zKTtcblx0fSBjYXRjaCAoZXJyb3IpIHtcblx0XHR0aHJvdyBtYWtlRXJyb3Ioe1xuXHRcdFx0ZXJyb3IsXG5cdFx0XHRzdGRvdXQ6ICcnLFxuXHRcdFx0c3RkZXJyOiAnJyxcblx0XHRcdGFsbDogJycsXG5cdFx0XHRjb21tYW5kLFxuXHRcdFx0ZXNjYXBlZENvbW1hbmQsXG5cdFx0XHRwYXJzZWQsXG5cdFx0XHR0aW1lZE91dDogZmFsc2UsXG5cdFx0XHRpc0NhbmNlbGVkOiBmYWxzZSxcblx0XHRcdGtpbGxlZDogZmFsc2Vcblx0XHR9KTtcblx0fVxuXG5cdGNvbnN0IHN0ZG91dCA9IGhhbmRsZU91dHB1dChwYXJzZWQub3B0aW9ucywgcmVzdWx0LnN0ZG91dCwgcmVzdWx0LmVycm9yKTtcblx0Y29uc3Qgc3RkZXJyID0gaGFuZGxlT3V0cHV0KHBhcnNlZC5vcHRpb25zLCByZXN1bHQuc3RkZXJyLCByZXN1bHQuZXJyb3IpO1xuXG5cdGlmIChyZXN1bHQuZXJyb3IgfHwgcmVzdWx0LnN0YXR1cyAhPT0gMCB8fCByZXN1bHQuc2lnbmFsICE9PSBudWxsKSB7XG5cdFx0Y29uc3QgZXJyb3IgPSBtYWtlRXJyb3Ioe1xuXHRcdFx0c3Rkb3V0LFxuXHRcdFx0c3RkZXJyLFxuXHRcdFx0ZXJyb3I6IHJlc3VsdC5lcnJvcixcblx0XHRcdHNpZ25hbDogcmVzdWx0LnNpZ25hbCxcblx0XHRcdGV4aXRDb2RlOiByZXN1bHQuc3RhdHVzLFxuXHRcdFx0Y29tbWFuZCxcblx0XHRcdGVzY2FwZWRDb21tYW5kLFxuXHRcdFx0cGFyc2VkLFxuXHRcdFx0dGltZWRPdXQ6IHJlc3VsdC5lcnJvciAmJiByZXN1bHQuZXJyb3IuY29kZSA9PT0gJ0VUSU1FRE9VVCcsXG5cdFx0XHRpc0NhbmNlbGVkOiBmYWxzZSxcblx0XHRcdGtpbGxlZDogcmVzdWx0LnNpZ25hbCAhPT0gbnVsbFxuXHRcdH0pO1xuXG5cdFx0aWYgKCFwYXJzZWQub3B0aW9ucy5yZWplY3QpIHtcblx0XHRcdHJldHVybiBlcnJvcjtcblx0XHR9XG5cblx0XHR0aHJvdyBlcnJvcjtcblx0fVxuXG5cdHJldHVybiB7XG5cdFx0Y29tbWFuZCxcblx0XHRlc2NhcGVkQ29tbWFuZCxcblx0XHRleGl0Q29kZTogMCxcblx0XHRzdGRvdXQsXG5cdFx0c3RkZXJyLFxuXHRcdGZhaWxlZDogZmFsc2UsXG5cdFx0dGltZWRPdXQ6IGZhbHNlLFxuXHRcdGlzQ2FuY2VsZWQ6IGZhbHNlLFxuXHRcdGtpbGxlZDogZmFsc2Vcblx0fTtcbn07XG5cbm1vZHVsZS5leHBvcnRzLmNvbW1hbmQgPSAoY29tbWFuZCwgb3B0aW9ucykgPT4ge1xuXHRjb25zdCBbZmlsZSwgLi4uYXJnc10gPSBwYXJzZUNvbW1hbmQoY29tbWFuZCk7XG5cdHJldHVybiBleGVjYShmaWxlLCBhcmdzLCBvcHRpb25zKTtcbn07XG5cbm1vZHVsZS5leHBvcnRzLmNvbW1hbmRTeW5jID0gKGNvbW1hbmQsIG9wdGlvbnMpID0+IHtcblx0Y29uc3QgW2ZpbGUsIC4uLmFyZ3NdID0gcGFyc2VDb21tYW5kKGNvbW1hbmQpO1xuXHRyZXR1cm4gZXhlY2Euc3luYyhmaWxlLCBhcmdzLCBvcHRpb25zKTtcbn07XG5cbm1vZHVsZS5leHBvcnRzLm5vZGUgPSAoc2NyaXB0UGF0aCwgYXJncywgb3B0aW9ucyA9IHt9KSA9PiB7XG5cdGlmIChhcmdzICYmICFBcnJheS5pc0FycmF5KGFyZ3MpICYmIHR5cGVvZiBhcmdzID09PSAnb2JqZWN0Jykge1xuXHRcdG9wdGlvbnMgPSBhcmdzO1xuXHRcdGFyZ3MgPSBbXTtcblx0fVxuXG5cdGNvbnN0IHN0ZGlvID0gbm9ybWFsaXplU3RkaW8ubm9kZShvcHRpb25zKTtcblx0Y29uc3QgZGVmYXVsdEV4ZWNBcmd2ID0gcHJvY2Vzcy5leGVjQXJndi5maWx0ZXIoYXJnID0+ICFhcmcuc3RhcnRzV2l0aCgnLS1pbnNwZWN0JykpO1xuXG5cdGNvbnN0IHtcblx0XHRub2RlUGF0aCA9IHByb2Nlc3MuZXhlY1BhdGgsXG5cdFx0bm9kZU9wdGlvbnMgPSBkZWZhdWx0RXhlY0FyZ3Zcblx0fSA9IG9wdGlvbnM7XG5cblx0cmV0dXJuIGV4ZWNhKFxuXHRcdG5vZGVQYXRoLFxuXHRcdFtcblx0XHRcdC4uLm5vZGVPcHRpb25zLFxuXHRcdFx0c2NyaXB0UGF0aCxcblx0XHRcdC4uLihBcnJheS5pc0FycmF5KGFyZ3MpID8gYXJncyA6IFtdKVxuXHRcdF0sXG5cdFx0e1xuXHRcdFx0Li4ub3B0aW9ucyxcblx0XHRcdHN0ZGluOiB1bmRlZmluZWQsXG5cdFx0XHRzdGRvdXQ6IHVuZGVmaW5lZCxcblx0XHRcdHN0ZGVycjogdW5kZWZpbmVkLFxuXHRcdFx0c3RkaW8sXG5cdFx0XHRzaGVsbDogZmFsc2Vcblx0XHR9XG5cdCk7XG59O1xuIiwiLy8gc3JjL2RldGVjdC50c1xuaW1wb3J0IHBhdGggZnJvbSBcInBhdGhcIjtcbmltcG9ydCBmaW5kVXAgZnJvbSBcImZpbmQtdXBcIjtcbnZhciBMT0NLUyA9IHtcbiAgXCJwbnBtLWxvY2sueWFtbFwiOiBcInBucG1cIixcbiAgXCJ5YXJuLmxvY2tcIjogXCJ5YXJuXCIsXG4gIFwicGFja2FnZS1sb2NrLmpzb25cIjogXCJucG1cIlxufTtcbmFzeW5jIGZ1bmN0aW9uIGRldGVjdFBhY2thZ2VNYW5hZ2VyKGN3ZCA9IHByb2Nlc3MuY3dkKCkpIHtcbiAgY29uc3QgcmVzdWx0ID0gYXdhaXQgZmluZFVwKE9iamVjdC5rZXlzKExPQ0tTKSwgeyBjd2QgfSk7XG4gIGNvbnN0IGFnZW50ID0gcmVzdWx0ID8gTE9DS1NbcGF0aC5iYXNlbmFtZShyZXN1bHQpXSA6IG51bGw7XG4gIHJldHVybiBhZ2VudDtcbn1cblxuLy8gc3JjL2luc3RhbGwudHNcbmltcG9ydCBleGVjYSBmcm9tIFwiZXhlY2FcIjtcbmFzeW5jIGZ1bmN0aW9uIGluc3RhbGxQYWNrYWdlKG5hbWVzLCBvcHRpb25zID0ge30pIHtcbiAgY29uc3QgYWdlbnQgPSBvcHRpb25zLnBhY2thZ2VNYW5hZ2VyIHx8IGF3YWl0IGRldGVjdFBhY2thZ2VNYW5hZ2VyKG9wdGlvbnMuY3dkKSB8fCBcIm5wbVwiO1xuICBpZiAoIUFycmF5LmlzQXJyYXkobmFtZXMpKVxuICAgIG5hbWVzID0gW25hbWVzXTtcbiAgY29uc3QgYXJncyA9IG9wdGlvbnMuYWRkaXRpb25hbEFyZ3MgfHwgW107XG4gIGlmIChvcHRpb25zLnByZWZlck9mZmxpbmUpXG4gICAgYXJncy51bnNoaWZ0KFwiLS1wcmVmZXItb2ZmbGluZVwiKTtcbiAgcmV0dXJuIGV4ZWNhKGFnZW50LCBbXG4gICAgYWdlbnQgPT09IFwieWFyblwiID8gXCJhZGRcIiA6IFwiaW5zdGFsbFwiLFxuICAgIG9wdGlvbnMuZGV2ID8gXCItRFwiIDogXCJcIixcbiAgICAuLi5hcmdzLFxuICAgIC4uLm5hbWVzXG4gIF0uZmlsdGVyKEJvb2xlYW4pLCB7XG4gICAgc3RkaW86IG9wdGlvbnMuc2lsZW50ID8gXCJpZ25vcmVcIiA6IFwiaW5oZXJpdFwiLFxuICAgIGN3ZDogb3B0aW9ucy5jd2RcbiAgfSk7XG59XG5leHBvcnQge1xuICBkZXRlY3RQYWNrYWdlTWFuYWdlcixcbiAgaW5zdGFsbFBhY2thZ2Vcbn07XG4iXSwibmFtZXMiOlsiUXVldWUiLCJyZXF1aXJlJCQwIiwicExpbWl0IiwicExvY2F0ZSIsInBhdGgiLCJmcyIsInJlcXVpcmUkJDEiLCJwcm9taXNpZnkiLCJyZXF1aXJlJCQyIiwicmVxdWlyZSQkMyIsImxvY2F0ZVBhdGhNb2R1bGUiLCJwYXRoRXhpc3RzTW9kdWxlIiwibG9jYXRlUGF0aCIsInBhdGhFeGlzdHMiLCJzdHJpcEZpbmFsTmV3bGluZSIsInBhdGhLZXkiLCJfb3MiLCJfcmVhbHRpbWUiLCJzaWduYWxzQnlOYW1lIiwibWFrZUVycm9yIiwibm9ybWFsaXplU3RkaW8iLCJzdGRpb01vZHVsZSIsInNwYXduZWRLaWxsIiwic3Bhd25lZENhbmNlbCIsInNldHVwVGltZW91dCIsInZhbGlkYXRlVGltZW91dCIsInNldEV4aXRIYW5kbGVyIiwiaXNTdHJlYW0iLCJoYW5kbGVJbnB1dCIsIm1ha2VBbGxTdHJlYW0iLCJnZXRTcGF3bmVkUmVzdWx0IiwidmFsaWRhdGVJbnB1dFN5bmMiLCJtZXJnZVByb21pc2UiLCJnZXRTcGF3bmVkUHJvbWlzZSIsImpvaW5Db21tYW5kIiwiZ2V0RXNjYXBlZENvbW1hbmQiLCJwYXJzZUNvbW1hbmQiLCJyZXF1aXJlJCQ0IiwicmVxdWlyZSQkNSIsInJlcXVpcmUkJDYiLCJyZXF1aXJlJCQ3IiwicmVxdWlyZSQkOCIsInJlcXVpcmUkJDkiLCJyZXF1aXJlJCQxMCIsInJlcXVpcmUkJDExIiwiZXhlY2FNb2R1bGUiLCJleGVjYSJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSxNQUFNLElBQUksQ0FBQztBQUNYO0FBQ0E7QUFDQTtBQUNBLENBQUMsV0FBVyxDQUFDLEtBQUssRUFBRTtBQUNwQixFQUFFLElBQUksQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDO0FBQ3JCO0FBQ0E7QUFDQSxFQUFFLElBQUksQ0FBQyxJQUFJLEdBQUcsU0FBUyxDQUFDO0FBQ3hCLEVBQUU7QUFDRixDQUFDO0FBQ0Q7QUFDQSxNQUFNQSxPQUFLLENBQUM7QUFDWjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsQ0FBQyxXQUFXLEdBQUc7QUFDZixFQUFFLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQztBQUNmLEVBQUU7QUFDRjtBQUNBLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRTtBQUNoQixFQUFFLE1BQU0sSUFBSSxHQUFHLElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO0FBQy9CO0FBQ0EsRUFBRSxJQUFJLElBQUksQ0FB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
