import { EventEmitter } from 'events';
import { Buffer } from 'buffer';
import path from 'path';
import childProcess from 'child_process';
import process$1 from 'process';
import { m as mergeStream, g as getStream, c as crossSpawn } from './index-432dd0c0.js';
import require$$0, { constants } from 'os';
import { s as signalExit } from './index-5dc082fc.js';
import { c, e as ensurePackageInstalled } from './index-59e12882.js';
import { c as createVitest } from './create-1a90cad9.js';
import require$$0$1 from 'readline';
import './_commonjsHelpers-c9e3b764.js';
import 'fs';
import 'stream';
import 'util';
import 'assert';
import 'tty';
import 'local-pkg';
import './index-1964368a.js';
import 'vite';
import './constants-de5287a6.js';
import 'url';
import './index-46e1d4ad.js';
import 'module';
import 'perf_hooks';
import './diff-19b42f85.js';
import 'worker_threads';
import 'tinypool';
import './magic-string.es-94000aea.js';

function toArr(any) {
	return any == null ? [] : Array.isArray(any) ? any : [any];
}

function toVal(out, key, val, opts) {
	var x, old=out[key], nxt=(
		!!~opts.string.indexOf(key) ? (val == null || val === true ? '' : String(val))
		: typeof val === 'boolean' ? val
		: !!~opts.boolean.indexOf(key) ? (val === 'false' ? false : val === 'true' || (out._.push((x = +val,x * 0 === 0) ? x : val),!!val))
		: (x = +val,x * 0 === 0) ? x : val
	);
	out[key] = old == null ? nxt : (Array.isArray(old) ? old.concat(nxt) : [old, nxt]);
}

function mri2 (args, opts) {
	args = args || [];
	opts = opts || {};

	var k, arr, arg, name, val, out={ _:[] };
	var i=0, j=0, idx=0, len=args.length;

	const alibi = opts.alias !== void 0;
	const strict = opts.unknown !== void 0;
	const defaults = opts.default !== void 0;

	opts.alias = opts.alias || {};
	opts.string = toArr(opts.string);
	opts.boolean = toArr(opts.boolean);

	if (alibi) {
		for (k in opts.alias) {
			arr = opts.alias[k] = toArr(opts.alias[k]);
			for (i=0; i < arr.length; i++) {
				(opts.alias[arr[i]] = arr.concat(k)).splice(i, 1);
			}
		}
	}

	for (i=opts.boolean.length; i-- > 0;) {
		arr = opts.alias[opts.boolean[i]] || [];
		for (j=arr.length; j-- > 0;) opts.boolean.push(arr[j]);
	}

	for (i=opts.string.length; i-- > 0;) {
		arr = opts.alias[opts.string[i]] || [];
		for (j=arr.length; j-- > 0;) opts.string.push(arr[j]);
	}

	if (defaults) {
		for (k in opts.default) {
			name = typeof opts.default[k];
			arr = opts.alias[k] = opts.alias[k] || [];
			if (opts[name] !== void 0) {
				opts[name].push(k);
				for (i=0; i < arr.length; i++) {
					opts[name].push(arr[i]);
				}
			}
		}
	}

	const keys = strict ? Object.keys(opts.alias) : [];

	for (i=0; i < len; i++) {
		arg = args[i];

		if (arg === '--') {
			out._ = out._.concat(args.slice(++i));
			break;
		}

		for (j=0; j < arg.length; j++) {
			if (arg.charCodeAt(j) !== 45) break; // "-"
		}

		if (j === 0) {
			out._.push(arg);
		} else if (arg.substring(j, j + 3) === 'no-') {
			name = arg.substring(j + 3);
			if (strict && !~keys.indexOf(name)) {
				return opts.unknown(arg);
			}
			out[name] = false;
		} else {
			for (idx=j+1; idx < arg.length; idx++) {
				if (arg.charCodeAt(idx) === 61) break; // "="
			}

			name = arg.substring(j, idx);
			val = arg.substring(++idx) || (i+1 === len || (''+args[i+1]).charCodeAt(0) === 45 || args[++i]);
			arr = (j === 2 ? [name] : name);

			for (idx=0; idx < arr.length; idx++) {
				name = arr[idx];
				if (strict && !~keys.indexOf(name)) return opts.unknown('-'.repeat(j) + name);
				toVal(out, name, (idx + 1 < arr.length) || val, opts);
			}
		}
	}

	if (defaults) {
		for (k in opts.default) {
			if (out[k] === void 0) {
				out[k] = opts.default[k];
			}
		}
	}

	if (alibi) {
		for (k in out) {
			arr = opts.alias[k] || [];
			while (arr.length > 0) {
				out[arr.shift()] = out[k];
			}
		}
	}

	return out;
}

const removeBrackets = (v) => v.replace(/[<[].+/, "").trim();
const findAllBrackets = (v) => {
  const ANGLED_BRACKET_RE_GLOBAL = /<([^>]+)>/g;
  const SQUARE_BRACKET_RE_GLOBAL = /\[([^\]]+)\]/g;
  const res = [];
  const parse = (match) => {
    let variadic = false;
    let value = match[1];
    if (value.startsWith("...")) {
      value = value.slice(3);
      variadic = true;
    }
    return {
      required: match[0].startsWith("<"),
      value,
      variadic
    };
  };
  let angledMatch;
  while (angledMatch = ANGLED_BRACKET_RE_GLOBAL.exec(v)) {
    res.push(parse(angledMatch));
  }
  let squareMatch;
  while (squareMatch = SQUARE_BRACKET_RE_GLOBAL.exec(v)) {
    res.push(parse(squareMatch));
  }
  return res;
};
const getMriOptions = (options) => {
  const result = {alias: {}, boolean: []};
  for (const [index, option] of options.entries()) {
    if (option.names.length > 1) {
      result.alias[option.names[0]] = option.names.slice(1);
    }
    if (option.isBoolean) {
      if (option.negated) {
        const hasStringTypeOption = options.some((o, i) => {
          return i !== index && o.names.some((name) => option.names.includes(name)) && typeof o.required === "boolean";
        });
        if (!hasStringTypeOption) {
          result.boolean.push(option.names[0]);
        }
      } else {
        result.boolean.push(option.names[0]);
      }
    }
  }
  return result;
};
const findLongest = (arr) => {
  return arr.sort((a, b) => {
    return a.length > b.length ? -1 : 1;
  })[0];
};
const padRight = (str, length) => {
  return str.length >= length ? str : `${str}${" ".repeat(length - str.length)}`;
};
const camelcase = (input) => {
  return input.replace(/([a-z])-([a-z])/g, (_, p1, p2) => {
    return p1 + p2.toUpperCase();
  });
};
const setDotProp = (obj, keys, val) => {
  let i = 0;
  let length = keys.length;
  let t = obj;
  let x;
  for (; i < length; ++i) {
    x = t[keys[i]];
    t = t[keys[i]] = i === length - 1 ? val : x != null ? x : !!~keys[i + 1].indexOf(".") || !(+keys[i + 1] > -1) ? {} : [];
  }
};
const setByType = (obj, transforms) => {
  for (const key of Object.keys(transforms)) {
    const transform = transforms[key];
    if (transform.shouldTransform) {
      obj[key] = Array.prototype.concat.call([], obj[key]);
      if (typeof transform.transformFunction === "function") {
        obj[key] = obj[key].map(transform.transformFunction);
      }
    }
  }
};
const getFileName = (input) => {
  const m = /([^\\\/]+)$/.exec(input);
  return m ? m[1] : "";
};
const camelcaseOptionName = (name) => {
  return name.split(".").map((v, i) => {
    return i === 0 ? camelcase(v) : v;
  }).join(".");
};
class CACError extends Error {
  constructor(message) {
    super(message);
    this.name = this.constructor.name;
    if (typeof Error.captureStackTrace === "function") {
      Error.captureStackTrace(this, this.constructor);
    } else {
      this.stack = new Error(message).stack;
    }
  }
}

class Option {
  constructor(rawName, description, config) {
    this.rawName = rawName;
    this.description = description;
    this.config = Object.assign({}, config);
    rawName = rawName.replace(/\.\*/g, "");
    this.negated = false;
    this.names = removeBrackets(rawName).split(",").map((v) => {
      let name = v.trim().replace(/^-{1,2}/, "");
      if (name.startsWith("no-")) {
        this.negated = true;
        name = name.replace(/^no-/, "");
      }
      return camelcaseOptionName(name);
    }).sort((a, b) => a.length > b.length ? 1 : -1);
    this.name = this.names[this.names.length - 1];
    if (this.negated && this.config.default == null) {
      this.config.default = true;
    }
    if (rawName.includes("<")) {
      this.required = true;
    } else if (rawName.includes("[")) {
      this.required = false;
    } else {
      this.isBoolean = true;
    }
  }
}

const processArgs = process.argv;
const platformInfo = `${process.platform}-${process.arch} node-${process.version}`;

class Command {
  constructor(rawName, description, config = {}, cli) {
    this.rawName = rawName;
    this.description = description;
    this.config = config;
    this.cli = cli;
    this.options = [];
    this.aliasNames = [];
    this.name = removeBrackets(rawName);
    this.args = findAllBrackets(rawName);
    this.examples = [];
  }
  usage(text) {
    this.usageText = text;
    return this;
  }
  allowUnknownOptions() {
    this.config.allowUnknownOptions = true;
    return this;
  }
  ignoreOptionDefaultValue() {
    this.config.ignoreOptionDefaultValue = true;
    return this;
  }
  version(version, customFlags = "-v, --version") {
    this.versionNumber = version;
    this.option(customFlags, "Display version number");
    return this;
  }
  example(example) {
    this.examples.push(example);
    return this;
  }
  option(rawName, description, config) {
    const option = new Option(rawName, description, config);
    this.options.push(option);
    return this;
  }
  alias(name) {
    this.aliasNames.push(name);
    return this;
  }
  action(callback) {
    this.commandAction = callback;
    return this;
  }
  isMatched(name) {
    return this.name === name || this.aliasNames.includes(name);
  }
  get isDefaultCommand() {
    return this.name === "" || this.aliasNames.includes("!");
  }
  get isGlobalCommand() {
    return this instanceof GlobalCommand;
  }
  hasOption(name) {
    name = name.split(".")[0];
    return this.options.find((option) => {
      return option.names.includes(name);
    });
  }
  outputHelp() {
    const {name, commands} = this.cli;
    const {
      versionNumber,
      options: globalOptions,
      helpCallback
    } = this.cli.globalCommand;
    let sections = [
      {
        body: `${name}${versionNumber ? `/${versionNumber}` : ""}`
      }
    ];
    sections.push({
      title: "Usage",
      body: `  $ ${name} ${this.usageText || this.rawName}`
    });
    const showCommands = (this.isGlobalCommand || this.isDefaultCommand) && commands.length > 0;
    if (showCommands) {
      const longestCommandName = findLongest(commands.map((command) => command.rawName));
      sections.push({
        title: "Commands",
        body: commands.map((command) => {
          return `  ${padRight(command.rawName, longestCommandName.length)}  ${command.description}`;
        }).join("\n")
      });
      sections.push({
        title: `For more info, run any command with the \`--help\` flag`,
        body: commands.map((command) => `  $ ${name}${command.name === "" ? "" : ` ${command.name}`} --help`).join("\n")
      });
    }
    let options = this.isGlobalCommand ? globalOptions : [...this.options, ...globalOptions || []];
    if (!this.isGlobalCommand && !this.isDefaultCommand) {
      options = options.filter((option) => option.name !== "version");
    }
    if (options.length > 0) {
      const longestOptionName = findLongest(options.map((option) => option.rawName));
      sections.push({
        title: "Options",
        body: options.map((option) => {
          return `  ${padRight(option.rawName, longestOptionName.length)}  ${option.description} ${option.config.default === void 0 ? "" : `(default: ${option.config.default})`}`;
        }).join("\n")
      });
    }
    if (this.examples.length > 0) {
      sections.push({
        title: "Examples",
        body: this.examples.map((example) => {
          if (typeof example === "function") {
            return example(name);
          }
          return example;
        }).join("\n")
      });
    }
    if (helpCallback) {
      sections = helpCallback(sections) || sections;
    }
    console.log(sections.map((section) => {
      return section.title ? `${section.title}:
${section.body}` : section.body;
    }).join("\n\n"));
  }
  outputVersion() {
    const {name} = this.cli;
    const {versionNumber} = this.cli.globalCommand;
    if (versionNumber) {
      console.log(`${name}/${versionNumber} ${platformInfo}`);
    }
  }
  checkRequiredArgs() {
    const minimalArgsCount = this.args.filter((arg) => arg.required).length;
    if (this.cli.args.length < minimalArgsCount) {
      throw new CACError(`missing required args for command \`${this.rawName}\``);
    }
  }
  checkUnknownOptions() {
    const {options, globalCommand} = this.cli;
    if (!this.config.allowUnknownOptions) {
      for (const name of Object.keys(options)) {
        if (name !== "--" && !this.hasOption(name) && !globalCommand.hasOption(name)) {
          throw new CACError(`Unknown option \`${name.length > 1 ? `--${name}` : `-${name}`}\``);
        }
      }
    }
  }
  checkOptionValue() {
    const {options: parsedOptions, globalCommand} = this.cli;
    const options = [...globalCommand.options, ...this.options];
    for (const option of options) {
      const value = parsedOptions[option.name.split(".")[0]];
      if (option.required) {
        const hasNegated = options.some((o) => o.negated && o.names.includes(option.name));
        if (value === true || value === false && !hasNegated) {
          throw new CACError(`option \`${option.rawName}\` value is missing`);
        }
      }
    }
  }
}
class GlobalCommand extends Command {
  constructor(cli) {
    super("@@global@@", "", {}, cli);
  }
}

var __assign = Object.assign;
class CAC extends EventEmitter {
  constructor(name = "") {
    super();
    this.name = name;
    this.commands = [];
    this.rawArgs = [];
    this.args = [];
    this.options = {};
    this.globalCommand = new GlobalCommand(this);
    this.globalCommand.usage("<command> [options]");
  }
  usage(text) {
    this.globalCommand.usage(text);
    return this;
  }
  command(rawName, description, config) {
    const command = new Command(rawName, description || "", config, this);
    command.globalCommand = this.globalCommand;
    this.commands.push(command);
    return command;
  }
  option(rawName, description, config) {
    this.globalCommand.option(rawName, description, config);
    return this;
  }
  help(callback) {
    this.globalCommand.option("-h, --help", "Display this message");
    this.globalCommand.helpCallback = callback;
    this.showHelpOnExit = true;
    return this;
  }
  version(version, customFlags = "-v, --version") {
    this.globalCommand.version(version, customFlags);
    this.showVersionOnExit = true;
    return this;
  }
  example(example) {
    this.globalCommand.example(example);
    return this;
  }
  outputHelp() {
    if (this.matchedCommand) {
      this.matchedCommand.outputHelp();
    } else {
      this.globalCommand.outputHelp();
    }
  }
  outputVersion() {
    this.globalCommand.outputVersion();
  }
  setParsedInfo({args, options}, matchedCommand, matchedCommandName) {
    this.args = args;
    this.options = options;
    if (matchedCommand) {
      this.matchedCommand = matchedCommand;
    }
    if (matchedCommandName) {
      this.matchedCommandName = matchedCommandName;
    }
    return this;
  }
  unsetMatchedCommand() {
    this.matchedCommand = void 0;
    this.matchedCommandName = void 0;
  }
  parse(argv = processArgs, {
    run = true
  } = {}) {
    this.rawArgs = argv;
    if (!this.name) {
      this.name = argv[1] ? getFileName(argv[1]) : "cli";
    }
    let shouldParse = true;
    for (const command of this.commands) {
      const parsed = this.mri(argv.slice(2), command);
      const commandName = parsed.args[0];
      if (command.isMatched(commandName)) {
        shouldParse = false;
        const parsedInfo = __assign(__assign({}, parsed), {
          args: parsed.args.slice(1)
        });
        this.setParsedInfo(parsedInfo, command, commandName);
        this.emit(`command:${commandName}`, command);
      }
    }
    if (shouldParse) {
      for (const command of this.commands) {
        if (command.name === "") {
          shouldParse = false;
          const parsed = this.mri(argv.slice(2), command);
          this.setParsedInfo(parsed, command);
          this.emit(`command:!`, command);
        }
      }
    }
    if (shouldParse) {
      const parsed = this.mri(argv.slice(2));
      this.setParsedInfo(parsed);
    }
    if (this.options.help && this.showHelpOnExit) {
      this.outputHelp();
      run = false;
      this.unsetMatchedCommand();
    }
    if (this.options.version && this.showVersionOnExit && this.matchedCommandName == null) {
      this.outputVersion();
      run = false;
      this.unsetMatchedCommand();
    }
    const parsedArgv = {args: this.args, options: this.options};
    if (run) {
      this.runMatchedCommand();
    }
    if (!this.matchedCommand && this.args[0]) {
      this.emit("command:*");
    }
    return parsedArgv;
  }
  mri(argv, command) {
    const cliOptions = [
      ...this.globalCommand.options,
      ...command ? command.options : []
    ];
    const mriOptions = getMriOptions(cliOptions);
    let argsAfterDoubleDashes = [];
    const doubleDashesIndex = argv.indexOf("--");
    if (doubleDashesIndex > -1) {
      argsAfterDoubleDashes = argv.slice(doubleDashesIndex + 1);
      argv = argv.slice(0, doubleDashesIndex);
    }
    let parsed = mri2(argv, mriOptions);
    parsed = Object.keys(parsed).reduce((res, name) => {
      return __assign(__assign({}, res), {
        [camelcaseOptionName(name)]: parsed[name]
      });
    }, {_: []});
    const args = parsed._;
    const options = {
      "--": argsAfterDoubleDashes
    };
    const ignoreDefault = command && command.config.ignoreOptionDefaultValue ? command.config.ignoreOptionDefaultValue : this.globalCommand.config.ignoreOptionDefaultValue;
    let transforms = Object.create(null);
    for (const cliOption of cliOptions) {
      if (!ignoreDefault && cliOption.config.default !== void 0) {
        for (const name of cliOption.names) {
          options[name] = cliOption.config.default;
        }
      }
      if (Array.isArray(cliOption.config.type)) {
        if (transforms[cliOption.name] === void 0) {
          transforms[cliOption.name] = Object.create(null);
          transforms[cliOption.name]["shouldTransform"] = true;
          transforms[cliOption.name]["transformFunction"] = cliOption.config.type[0];
        }
      }
    }
    for (const key of Object.keys(parsed)) {
      if (key !== "_") {
        const keys = key.split(".");
        setDotProp(options, keys, parsed[key]);
        setByType(options, transforms);
      }
    }
    return {
      args,
      options
    };
  }
  runMatchedCommand() {
    const {args, options, matchedCommand: command} = this;
    if (!command || !command.commandAction)
      return;
    command.checkUnknownOptions();
    command.checkOptionValue();
    command.checkRequiredArgs();
    const actionArgs = [];
    command.args.forEach((arg, index) => {
      if (arg.variadic) {
        actionArgs.push(args.slice(index));
      } else {
        actionArgs.push(args[index]);
      }
    });
    actionArgs.push(options);
    return command.commandAction.apply(this, actionArgs);
  }
}

const cac = (name = "") => new CAC(name);

function stripFinalNewline(input) {
	const LF = typeof input === 'string' ? '\n' : '\n'.charCodeAt();
	const CR = typeof input === 'string' ? '\r' : '\r'.charCodeAt();

	if (input[input.length - 1] === LF) {
		input = input.slice(0, -1);
	}

	if (input[input.length - 1] === CR) {
		input = input.slice(0, -1);
	}

	return input;
}

function pathKey(options = {}) {
	const {
		env = process.env,
		platform = process.platform
	} = options;

	if (platform !== 'win32') {
		return 'PATH';
	}

	return Object.keys(env).reverse().find(key => key.toUpperCase() === 'PATH') || 'Path';
}

function npmRunPath(options = {}) {
	const {
		cwd = process$1.cwd(),
		path: path_ = process$1.env[pathKey()],
		execPath = process$1.execPath,
	} = options;

	let previous;
	let cwdPath = path.resolve(cwd);
	const result = [];

	while (previous !== cwdPath) {
		result.push(path.join(cwdPath, 'node_modules/.bin'));
		previous = cwdPath;
		cwdPath = path.resolve(cwdPath, '..');
	}

	// Ensure the running `node` binary is used.
	result.push(path.resolve(cwd, execPath, '..'));

	return [...result, path_].join(path.delimiter);
}

function npmRunPathEnv({env = process$1.env, ...options} = {}) {
	env = {...env};

	const path = pathKey({env});
	options.path = env[path];
	env[path] = npmRunPath(options);

	return env;
}

const copyProperty = (to, from, property, ignoreNonConfigurable) => {
	// `Function#length` should reflect the parameters of `to` not `from` since we keep its body.
	// `Function#prototype` is non-writable and non-configurable so can never be modified.
	if (property === 'length' || property === 'prototype') {
		return;
	}

	// `Function#arguments` and `Function#caller` should not be copied. They were reported to be present in `Reflect.ownKeys` for some devices in React Native (#41), so we explicitly ignore them here.
	if (property === 'arguments' || property === 'caller') {
		return;
	}

	const toDescriptor = Object.getOwnPropertyDescriptor(to, property);
	const fromDescriptor = Object.getOwnPropertyDescriptor(from, property);

	if (!canCopyProperty(toDescriptor, fromDescriptor) && ignoreNonConfigurable) {
		return;
	}

	Object.defineProperty(to, property, fromDescriptor);
};

// `Object.defineProperty()` throws if the property exists, is not configurable and either:
// - one its descriptors is changed
// - it is non-writable and its value is changed
const canCopyProperty = function (toDescriptor, fromDescriptor) {
	return toDescriptor === undefined || toDescriptor.configurable || (
		toDescriptor.writable === fromDescriptor.writable &&
		toDescriptor.enumerable === fromDescriptor.enumerable &&
		toDescriptor.configurable === fromDescriptor.configurable &&
		(toDescriptor.writable || toDescriptor.value === fromDescriptor.value)
	);
};

const changePrototype = (to, from) => {
	const fromPrototype = Object.getPrototypeOf(from);
	if (fromPrototype === Object.getPrototypeOf(to)) {
		return;
	}

	Object.setPrototypeOf(to, fromPrototype);
};

const wrappedToString = (withName, fromBody) => `/* Wrapped ${withName}*/\n${fromBody}`;

const toStringDescriptor = Object.getOwnPropertyDescriptor(Function.prototype, 'toString');
const toStringName = Object.getOwnPropertyDescriptor(Function.prototype.toString, 'name');

// We call `from.toString()` early (not lazily) to ensure `from` can be garbage collected.
// We use `bind()` instead of a closure for the same reason.
// Calling `from.toString()` early also allows caching it in case `to.toString()` is called several times.
const changeToString = (to, from, name) => {
	const withName = name === '' ? '' : `with ${name.trim()}() `;
	const newToString = wrappedToString.bind(null, withName, from.toString());
	// Ensure `to.toString.toString` is non-enumerable and has the same `same`
	Object.defineProperty(newToString, 'name', toStringName);
	Object.defineProperty(to, 'toString', {...toStringDescriptor, value: newToString});
};

function mimicFunction(to, from, {ignoreNonConfigurable = false} = {}) {
	const {name} = to;

	for (const property of Reflect.ownKeys(from)) {
		copyProperty(to, from, property, ignoreNonConfigurable);
	}

	changePrototype(to, from);
	changeToString(to, from, name);

	return to;
}

const calledFunctions = new WeakMap();

const onetime = (function_, options = {}) => {
	if (typeof function_ !== 'function') {
		throw new TypeError('Expected a function');
	}

	let returnValue;
	let callCount = 0;
	const functionName = function_.displayName || function_.name || '<anonymous>';

	const onetime = function (...arguments_) {
		calledFunctions.set(onetime, ++callCount);

		if (callCount === 1) {
			returnValue = function_.apply(this, arguments_);
			function_ = null;
		} else if (options.throw === true) {
			throw new Error(`Function \`${functionName}\` can only be called once`);
		}

		return returnValue;
	};

	mimicFunction(onetime, function_);
	calledFunctions.set(onetime, callCount);

	return onetime;
};

onetime.callCount = function_ => {
	if (!calledFunctions.has(function_)) {
		throw new Error(`The given function \`${function_.name}\` is not wrapped by the \`onetime\` package`);
	}

	return calledFunctions.get(function_);
};

const getRealtimeSignals=function(){
const length=SIGRTMAX-SIGRTMIN+1;
return Array.from({length},getRealtimeSignal);
};

const getRealtimeSignal=function(value,index){
return {
name:`SIGRT${index+1}`,
number:SIGRTMIN+index,
action:"terminate",
description:"Application-specific signal (realtime)",
standard:"posix"};

};

const SIGRTMIN=34;
const SIGRTMAX=64;

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
standard:"other"}];

const getSignals=function(){
const realtimeSignals=getRealtimeSignals();
const signals=[...SIGNALS,...realtimeSignals].map(normalizeSignal);
return signals;
};







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
constants;
const supported=constantSignal!==undefined;
const number=supported?constantSignal:defaultNumber;
return {name,number,description,supported,action,forced,standard};
};

const getSignalsByName=function(){
const signals=getSignals();
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

const signalsByName=getSignalsByName();




const getSignalsByNumber=function(){
const signals=getSignals();
const length=SIGRTMAX+1;
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
const signal=signals.find(({name})=>constants.signals[name]===number);

if(signal!==undefined){
return signal;
}

return signals.find((signalA)=>signalA.number===number);
};

getSignalsByNumber();

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

const makeError = ({
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
	parsed: {options: {timeout}},
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

const aliases = ['stdin', 'stdout', 'stderr'];

const hasAlias = options => aliases.some(alias => options[alias] !== undefined);

const normalizeStdio = options => {
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

const DEFAULT_FORCE_KILL_TIMEOUT = 1000 * 5;

// Monkey-patches `childProcess.kill()` to add `forceKillAfterTimeout` behavior
const spawnedKill = (kill, signal = 'SIGTERM', options = {}) => {
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

const shouldForceKill = (signal, {forceKillAfterTimeout}, killResult) => isSigterm(signal) && forceKillAfterTimeout !== false && killResult;

const isSigterm = signal => signal === require$$0.constants.signals.SIGTERM
		|| (typeof signal === 'string' && signal.toUpperCase() === 'SIGTERM');

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
const spawnedCancel = (spawned, context) => {
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
const setupTimeout = (spawned, {timeout, killSignal = 'SIGTERM'}, spawnedPromise) => {
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

const validateTimeout = ({timeout}) => {
	if (timeout !== undefined && (!Number.isFinite(timeout) || timeout < 0)) {
		throw new TypeError(`Expected the \`timeout\` option to be a non-negative integer, got \`${timeout}\` (${typeof timeout})`);
	}
};

// `cleanup` option handling
const setExitHandler = async (spawned, {cleanup, detached}, timedPromise) => {
	if (!cleanup || detached) {
		return timedPromise;
	}

	const removeExitHandler = signalExit(() => {
		spawned.kill();
	});

	return timedPromise.finally(() => {
		removeExitHandler();
	});
};

function isStream(stream) {
	return stream !== null
		&& typeof stream === 'object'
		&& typeof stream.pipe === 'function';
}

// `input` option
const handleInput = (spawned, input) => {
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
const makeAllStream = (spawned, {all}) => {
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
const getSpawnedResult = async ({stdout, stderr, all}, {encoding, buffer, maxBuffer}, processDone) => {
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
			getBufferedData(all, allPromise),
		]);
	}
};

const nativePromisePrototype = (async () => {})().constructor.prototype;
const descriptors = ['then', 'catch', 'finally'].map(property => [
	property,
	Reflect.getOwnPropertyDescriptor(nativePromisePrototype, property),
]);

// The return value is a mixin of `childProcess` and `Promise`
const mergePromise = (spawned, promise) => {
	for (const [property, descriptor] of descriptors) {
		// Starting the main `promise` is deferred to avoid consuming streams
		const value = typeof promise === 'function'
			? (...args) => Reflect.apply(descriptor.value, promise(), args)
			: descriptor.value.bind(promise);

		Reflect.defineProperty(spawned, property, {...descriptor, value});
	}

	return spawned;
};

// Use promises instead of `child_process` events
const getSpawnedPromise = spawned => new Promise((resolve, reject) => {
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

const joinCommand = (file, args) => normalizeArgs(file, args).join(' ');

const getEscapedCommand = (file, args) => normalizeArgs(file, args).map(arg => escapeArg(arg)).join(' ');

const DEFAULT_MAX_BUFFER = 1000 * 1000 * 100;

const getEnv = ({env: envOption, extendEnv, preferLocal, localDir, execPath}) => {
	const env = extendEnv ? {...process$1.env, ...envOption} : envOption;

	if (preferLocal) {
		return npmRunPathEnv({env, cwd: localDir, execPath});
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
		localDir: options.cwd || process$1.cwd(),
		execPath: process$1.execPath,
		encoding: 'utf8',
		reject: true,
		cleanup: true,
		all: false,
		windowsHide: true,
		...options,
	};

	options.env = getEnv(options);

	options.stdio = normalizeStdio(options);

	if (process$1.platform === 'win32' && path.basename(file, '.exe') === 'cmd') {
		// #116
		args.unshift('/q');
	}

	return {file, args, options, parsed};
};

const handleOutput = (options, value, error) => {
	if (typeof value !== 'string' && !Buffer.isBuffer(value)) {
		// When `execaSync()` errors, we normalize it to '' to mimic `execa()`
		return error === undefined ? undefined : '';
	}

	if (options.stripFinalNewline) {
		return stripFinalNewline(value);
	}

	return value;
};

function execa(file, args, options) {
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
			killed: false,
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
				killed: spawned.killed,
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
			killed: false,
		};
	};

	const handlePromiseOnce = onetime(handlePromise);

	handleInput(spawned, parsed.options.input);

	spawned.all = makeAllStream(spawned, parsed.options);

	return mergePromise(spawned, handlePromiseOnce);
}

var version = "0.1.17";

const keys = [
  ["a", "rerun all tests"],
  ["f", "rerun only failed tests"],
  ["u", "update snapshot"],
  ["q", "quit"]
];
function printShortcutsHelp() {
  process.stdout.write(`
${c.bold("Watch Usage")}
${keys.map((i) => c.dim("  press ") + c.reset(i[0]) + c.dim(` to ${i[1]}`)).join("\n")}
`);
}
function registerConsoleShortcuts(ctx) {
  require$$0$1.emitKeypressEvents(process.stdin);
  process.stdin.setRawMode(true);
  process.stdin.on("keypress", (str, key) => {
    if (str === "" || str === "" || key && key.ctrl && key.name === "c")
      return ctx.exit();
    if (ctx.runningPromise)
      return;
    const name = key == null ? void 0 : key.name;
    if (name === "h")
      return printShortcutsHelp();
    if (name === "u")
      return ctx.updateSnapshot();
    if (name === "a" || name === "return")
      return ctx.rerunFiles(void 0, "rerun all");
    if (name === "q")
      return ctx.exit();
  });
}

const cli = cac("vitest");
cli.version(version).option("-r, --root <path>", "root path").option("-c, --config <path>", "path to config file").option("-u, --update", "update snapshot").option("-w, --watch", "watch mode").option("-t, --testNamePattern <pattern>", "run test names with the specified pattern").option("--ui", "open UI").option("--api [api]", "serve API, available options: --api.port <port>, --api.host [host] and --api.strictPort").option("--threads", "enabled threads", { default: true }).option("--silent", "silent console output from tests").option("--isolate", "isolate environment for each test file", { default: true }).option("--reporter <name>", "reporter").option("--outputFile <filename>", "write test results to a file when the --reporter=json option is also specified").option("--coverage", "use c8 for coverage").option("--run", "do not watch").option("--global", "inject apis globally").option("--dom", "mock browser api with happy-dom").option("--environment <env>", "runner environment", { default: "node" }).option("--passWithNoTests", "pass when no tests found").help();
cli.command("run [...filters]").action(run);
cli.command("related [...filters]").action(runRelated);
cli.command("watch [...filters]").action(dev);
cli.command("dev [...filters]").action(dev);
cli.command("[...filters]").action(dev);
cli.parse();
async function runRelated(relatedFiles, argv) {
  argv.related = relatedFiles;
  argv.passWithNoTests ?? (argv.passWithNoTests = true);
  await dev([], argv);
}
async function dev(cliFilters, argv) {
  if (argv.watch == null)
    argv.watch = !process.env.CI && !argv.run;
  await run(cliFilters, argv);
}
async function run(cliFilters, options) {
  process.env.VITEST = "true";
  process.env.NODE_ENV = "test";
  if (!await ensurePackageInstalled("vite"))
    process.exit(1);
  if (typeof options.coverage === "boolean")
    options.coverage = { enabled: options.coverage };
  const ctx = await createVitest(options);
  if (ctx.config.coverage.enabled) {
    if (!await ensurePackageInstalled("c8"))
      process.exit(1);
    if (!process.env.NODE_V8_COVERAGE) {
      process.env.NODE_V8_COVERAGE = ctx.config.coverage.tempDirectory;
      const { exitCode } = await execa(process.argv0, process.argv.slice(1), { stdio: "inherit" });
      process.exit(exitCode);
    }
  }
  if (ctx.config.environment && ctx.config.environment !== "node") {
    if (!await ensurePackageInstalled(ctx.config.environment))
      process.exit(1);
  }
  if (process.stdin.isTTY && ctx.config.watch)
    registerConsoleShortcuts(ctx);
  process.chdir(ctx.config.root);
  ctx.onServerRestarted(() => {
    ctx.start(cliFilters);
  });
  try {
    await ctx.start(cliFilters);
  } catch (e) {
    process.exitCode = 1;
    throw e;
  } finally {
    if (!ctx.config.watch)
      await ctx.close();
  }
  if (!ctx.config.watch)
    await ctx.exit();
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpLmpzIiwic291cmNlcyI6WyIuLi8uLi8uLi9ub2RlX21vZHVsZXMvLnBucG0vY2FjQDYuNy4xMi9ub2RlX21vZHVsZXMvY2FjL2Rpc3QvaW5kZXgubWpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzLy5wbnBtL3N0cmlwLWZpbmFsLW5ld2xpbmVAMy4wLjAvbm9kZV9tb2R1bGVzL3N0cmlwLWZpbmFsLW5ld2xpbmUvaW5kZXguanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvLnBucG0vcGF0aC1rZXlANC4wLjAvbm9kZV9tb2R1bGVzL3BhdGgta2V5L2luZGV4LmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzLy5wbnBtL25wbS1ydW4tcGF0aEA1LjAuMS9ub2RlX21vZHVsZXMvbnBtLXJ1bi1wYXRoL2luZGV4LmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzLy5wbnBtL21pbWljLWZuQDQuMC4wL25vZGVfbW9kdWxlcy9taW1pYy1mbi9pbmRleC5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy8ucG5wbS9vbmV0aW1lQDYuMC4wL25vZGVfbW9kdWxlcy9vbmV0aW1lL2luZGV4LmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzLy5wbnBtL2h1bWFuLXNpZ25hbHNAMy4wLjEvbm9kZV9tb2R1bGVzL2h1bWFuLXNpZ25hbHMvYnVpbGQvc3JjL3JlYWx0aW1lLmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzLy5wbnBtL2h1bWFuLXNpZ25hbHNAMy4wLjEvbm9kZV9tb2R1bGVzL2h1bWFuLXNpZ25hbHMvYnVpbGQvc3JjL2NvcmUuanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvLnBucG0vaHVtYW4tc2lnbmFsc0AzLjAuMS9ub2RlX21vZHVsZXMvaHVtYW4tc2lnbmFscy9idWlsZC9zcmMvc2lnbmFscy5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy8ucG5wbS9odW1hbi1zaWduYWxzQDMuMC4xL25vZGVfbW9kdWxlcy9odW1hbi1zaWduYWxzL2J1aWxkL3NyYy9tYWluLmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzLy5wbnBtL2V4ZWNhQDYuMC4wL25vZGVfbW9kdWxlcy9leGVjYS9saWIvZXJyb3IuanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvLnBucG0vZXhlY2FANi4wLjAvbm9kZV9tb2R1bGVzL2V4ZWNhL2xpYi9zdGRpby5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy8ucG5wbS9leGVjYUA2LjAuMC9ub2RlX21vZHVsZXMvZXhlY2EvbGliL2tpbGwuanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvLnBucG0vaXMtc3RyZWFtQDMuMC4wL25vZGVfbW9kdWxlcy9pcy1zdHJlYW0vaW5kZXguanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvLnBucG0vZXhlY2FANi4wLjAvbm9kZV9tb2R1bGVzL2V4ZWNhL2xpYi9zdHJlYW0uanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvLnBucG0vZXhlY2FANi4wLjAvbm9kZV9tb2R1bGVzL2V4ZWNhL2xpYi9wcm9taXNlLmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzLy5wbnBtL2V4ZWNhQDYuMC4wL25vZGVfbW9kdWxlcy9leGVjYS9saWIvY29tbWFuZC5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy8ucG5wbS9leGVjYUA2LjAuMC9ub2RlX21vZHVsZXMvZXhlY2EvaW5kZXguanMiLCIuLi9zcmMvbm9kZS9zdGRpbi50cyIsIi4uL3NyYy9ub2RlL2NsaS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBFdmVudEVtaXR0ZXIgfSBmcm9tICdldmVudHMnO1xuXG5mdW5jdGlvbiB0b0FycihhbnkpIHtcblx0cmV0dXJuIGFueSA9PSBudWxsID8gW10gOiBBcnJheS5pc0FycmF5KGFueSkgPyBhbnkgOiBbYW55XTtcbn1cblxuZnVuY3Rpb24gdG9WYWwob3V0LCBrZXksIHZhbCwgb3B0cykge1xuXHR2YXIgeCwgb2xkPW91dFtrZXldLCBueHQ9KFxuXHRcdCEhfm9wdHMuc3RyaW5nLmluZGV4T2Yoa2V5KSA/ICh2YWwgPT0gbnVsbCB8fCB2YWwgPT09IHRydWUgPyAnJyA6IFN0cmluZyh2YWwpKVxuXHRcdDogdHlwZW9mIHZhbCA9PT0gJ2Jvb2xlYW4nID8gdmFsXG5cdFx0OiAhIX5vcHRzLmJvb2xlYW4uaW5kZXhPZihrZXkpID8gKHZhbCA9PT0gJ2ZhbHNlJyA/IGZhbHNlIDogdmFsID09PSAndHJ1ZScgfHwgKG91dC5fLnB1c2goKHggPSArdmFsLHggKiAwID09PSAwKSA/IHggOiB2YWwpLCEhdmFsKSlcblx0XHQ6ICh4ID0gK3ZhbCx4ICogMCA9PT0gMCkgPyB4IDogdmFsXG5cdCk7XG5cdG91dFtrZXldID0gb2xkID09IG51bGwgPyBueHQgOiAoQXJyYXkuaXNBcnJheShvbGQpID8gb2xkLmNvbmNhdChueHQpIDogW29sZCwgbnh0XSk7XG59XG5cbmZ1bmN0aW9uIG1yaTIgKGFyZ3MsIG9wdHMpIHtcblx0YXJncyA9IGFyZ3MgfHwgW107XG5cdG9wdHMgPSBvcHRzIHx8IHt9O1xuXG5cdHZhciBrLCBhcnIsIGFyZywgbmFtZSwgdmFsLCBvdXQ9eyBfOltdIH07XG5cdHZhciBpPTAsIGo9MCwgaWR4PTAsIGxlbj1hcmdzLmxlbmd0aDtcblxuXHRjb25zdCBhbGliaSA9IG9wdHMuYWxpYXMgIT09IHZvaWQgMDtcblx0Y29uc3Qgc3RyaWN0ID0gb3B0cy51bmtub3duICE9PSB2b2lkIDA7XG5cdGNvbnN0IGRlZmF1bHRzID0gb3B0cy5kZWZhdWx0ICE9PSB2b2lkIDA7XG5cblx0b3B0cy5hbGlhcyA9IG9wdHMuYWxpYXMgfHwge307XG5cdG9wdHMuc3RyaW5nID0gdG9BcnIob3B0cy5zdHJpbmcpO1xuXHRvcHRzLmJvb2xlYW4gPSB0b0FycihvcHRzLmJvb2xlYW4pO1xuXG5cdGlmIChhbGliaSkge1xuXHRcdGZvciAoayBpbiBvcHRzLmFsaWFzKSB7XG5cdFx0XHRhcnIgPSBvcHRzLmFsaWFzW2tdID0gdG9BcnIob3B0cy5hbGlhc1trXSk7XG5cdFx0XHRmb3IgKGk9MDsgaSA8IGFyci5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHQob3B0cy5hbGlhc1thcnJbaV1dID0gYXJyLmNvbmNhdChrKSkuc3BsaWNlKGksIDEpO1xuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdGZvciAoaT1vcHRzLmJvb2xlYW4ubGVuZ3RoOyBpLS0gPiAwOykge1xuXHRcdGFyciA9IG9wdHMuYWxpYXNbb3B0cy5ib29sZWFuW2ldXSB8fCBbXTtcblx0XHRmb3IgKGo9YXJyLmxlbmd0aDsgai0tID4gMDspIG9wdHMuYm9vbGVhbi5wdXNoKGFycltqXSk7XG5cdH1cblxuXHRmb3IgKGk9b3B0cy5zdHJpbmcubGVuZ3RoOyBpLS0gPiAwOykge1xuXHRcdGFyciA9IG9wdHMuYWxpYXNbb3B0cy5zdHJpbmdbaV1dIHx8IFtdO1xuXHRcdGZvciAoaj1hcnIubGVuZ3RoOyBqLS0gPiAwOykgb3B0cy5zdHJpbmcucHVzaChhcnJbal0pO1xuXHR9XG5cblx0aWYgKGRlZmF1bHRzKSB7XG5cdFx0Zm9yIChrIGluIG9wdHMuZGVmYXVsdCkge1xuXHRcdFx0bmFtZSA9IHR5cGVvZiBvcHRzLmRlZmF1bHRba107XG5cdFx0XHRhcnIgPSBvcHRzLmFsaWFzW2tdID0gb3B0cy5hbGlhc1trXSB8fCBbXTtcblx0XHRcdGlmIChvcHRzW25hbWVdICE9PSB2b2lkIDApIHtcblx0XHRcdFx0b3B0c1tuYW1lXS5wdXNoKGspO1xuXHRcdFx0XHRmb3IgKGk9MDsgaSA8IGFyci5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHRcdG9wdHNbbmFtZV0ucHVzaChhcnJbaV0pO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cblx0Y29uc3Qga2V5cyA9IHN0cmljdCA/IE9iamVjdC5rZXlzKG9wdHMuYWxpYXMpIDogW107XG5cblx0Zm9yIChpPTA7IGkgPCBsZW47IGkrKykge1xuXHRcdGFyZyA9IGFyZ3NbaV07XG5cblx0XHRpZiAoYXJnID09PSAnLS0nKSB7XG5cdFx0XHRvdXQuXyA9IG91dC5fLmNvbmNhdChhcmdzLnNsaWNlKCsraSkpO1xuXHRcdFx0YnJlYWs7XG5cdFx0fVxuXG5cdFx0Zm9yIChqPTA7IGogPCBhcmcubGVuZ3RoOyBqKyspIHtcblx0XHRcdGlmIChhcmcuY2hhckNvZGVBdChqKSAhPT0gNDUpIGJyZWFrOyAvLyBcIi1cIlxuXHRcdH1cblxuXHRcdGlmIChqID09PSAwKSB7XG5cdFx0XHRvdXQuXy5wdXNoKGFyZyk7XG5cdFx0fSBlbHNlIGlmIChhcmcuc3Vic3RyaW5nKGosIGogKyAzKSA9PT0gJ25vLScpIHtcblx0XHRcdG5hbWUgPSBhcmcuc3Vic3RyaW5nKGogKyAzKTtcblx0XHRcdGlmIChzdHJpY3QgJiYgIX5rZXlzLmluZGV4T2YobmFtZSkpIHtcblx0XHRcdFx0cmV0dXJuIG9wdHMudW5rbm93bihhcmcpO1xuXHRcdFx0fVxuXHRcdFx0b3V0W25hbWVdID0gZmFsc2U7XG5cdFx0fSBlbHNlIHtcblx0XHRcdGZvciAoaWR4PWorMTsgaWR4IDwgYXJnLmxlbmd0aDsgaWR4KyspIHtcblx0XHRcdFx0aWYgKGFyZy5jaGFyQ29kZUF0KGlkeCkgPT09IDYxKSBicmVhazsgLy8gXCI9XCJcblx0XHRcdH1cblxuXHRcdFx0bmFtZSA9IGFyZy5zdWJzdHJpbmcoaiwgaWR4KTtcblx0XHRcdHZhbCA9IGFyZy5zdWJzdHJpbmcoKytpZHgpIHx8IChpKzEgPT09IGxlbiB8fCAoJycrYXJnc1tpKzFdKS5jaGFyQ29kZUF0KDApID09PSA0NSB8fCBhcmdzWysraV0pO1xuXHRcdFx0YXJyID0gKGogPT09IDIgPyBbbmFtZV0gOiBuYW1lKTtcblxuXHRcdFx0Zm9yIChpZHg9MDsgaWR4IDwgYXJyLmxlbmd0aDsgaWR4KyspIHtcblx0XHRcdFx0bmFtZSA9IGFycltpZHhdO1xuXHRcdFx0XHRpZiAoc3RyaWN0ICYmICF+a2V5cy5pbmRleE9mKG5hbWUpKSByZXR1cm4gb3B0cy51bmtub3duKCctJy5yZXBlYXQoaikgKyBuYW1lKTtcblx0XHRcdFx0dG9WYWwob3V0LCBuYW1lLCAoaWR4ICsgMSA8IGFyci5sZW5ndGgpIHx8IHZhbCwgb3B0cyk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cblx0aWYgKGRlZmF1bHRzKSB7XG5cdFx0Zm9yIChrIGluIG9wdHMuZGVmYXVsdCkge1xuXHRcdFx0aWYgKG91dFtrXSA9PT0gdm9pZCAwKSB7XG5cdFx0XHRcdG91dFtrXSA9IG9wdHMuZGVmYXVsdFtrXTtcblx0XHRcdH1cblx0XHR9XG5cdH1cblxuXHRpZiAoYWxpYmkpIHtcblx0XHRmb3IgKGsgaW4gb3V0KSB7XG5cdFx0XHRhcnIgPSBvcHRzLmFsaWFzW2tdIHx8IFtdO1xuXHRcdFx0d2hpbGUgKGFyci5sZW5ndGggPiAwKSB7XG5cdFx0XHRcdG91dFthcnIuc2hpZnQoKV0gPSBvdXRba107XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cblx0cmV0dXJuIG91dDtcbn1cblxuY29uc3QgcmVtb3ZlQnJhY2tldHMgPSAodikgPT4gdi5yZXBsYWNlKC9bPFtdLisvLCBcIlwiKS50cmltKCk7XG5jb25zdCBmaW5kQWxsQnJhY2tldHMgPSAodikgPT4ge1xuICBjb25zdCBBTkdMRURfQlJBQ0tFVF9SRV9HTE9CQUwgPSAvPChbXj5dKyk+L2c7XG4gIGNvbnN0IFNRVUFSRV9CUkFDS0VUX1JFX0dMT0JBTCA9IC9cXFsoW15cXF1dKylcXF0vZztcbiAgY29uc3QgcmVzID0gW107XG4gIGNvbnN0IHBhcnNlID0gKG1hdGNoKSA9PiB7XG4gICAgbGV0IHZhcmlhZGljID0gZmFsc2U7XG4gICAgbGV0IHZhbHVlID0gbWF0Y2hbMV07XG4gICAgaWYgKHZhbHVlLnN0YXJ0c1dpdGgoXCIuLi5cIikpIHtcbiAgICAgIHZhbHVlID0gdmFsdWUuc2xpY2UoMyk7XG4gICAgICB2YXJpYWRpYyA9IHRydWU7XG4gICAgfVxuICAgIHJldHVybiB7XG4gICAgICByZXF1aXJlZDogbWF0Y2hbMF0uc3RhcnRzV2l0aChcIjxcIiksXG4gICAgICB2YWx1ZSxcbiAgICAgIHZhcmlhZGljXG4gICAgfTtcbiAgfTtcbiAgbGV0IGFuZ2xlZE1hdGNoO1xuICB3aGlsZSAoYW5nbGVkTWF0Y2ggPSBBTkdMRURfQlJBQ0tFVF9SRV9HTE9CQUwuZXhlYyh2KSkge1xuICAgIHJlcy5wdXNoKHBhcnNlKGFuZ2xlZE1hdGNoKSk7XG4gIH1cbiAgbGV0IHNxdWFyZU1hdGNoO1xuICB3aGlsZSAoc3F1YXJlTWF0Y2ggPSBTUVVBUkVfQlJBQ0tFVF9SRV9HTE9CQUwuZXhlYyh2KSkge1xuICAgIHJlcy5wdXNoKHBhcnNlKHNxdWFyZU1hdGNoKSk7XG4gIH1cbiAgcmV0dXJuIHJlcztcbn07XG5jb25zdCBnZXRNcmlPcHRpb25zID0gKG9wdGlvbnMpID0+IHtcbiAgY29uc3QgcmVzdWx0ID0ge2FsaWFzOiB7fSwgYm9vbGVhbjogW119O1xuICBmb3IgKGNvbnN0IFtpbmRleCwgb3B0aW9uXSBvZiBvcHRpb25zLmVudHJpZXMoKSkge1xuICAgIGlmIChvcHRpb24ubmFtZXMubGVuZ3RoID4gMSkge1xuICAgICAgcmVzdWx0LmFsaWFzW29wdGlvbi5uYW1lc1swXV0gPSBvcHRpb24ubmFtZXMuc2xpY2UoMSk7XG4gICAgfVxuICAgIGlmIChvcHRpb24uaXNCb29sZWFuKSB7XG4gICAgICBpZiAob3B0aW9uLm5lZ2F0ZWQpIHtcbiAgICAgICAgY29uc3QgaGFzU3RyaW5nVHlwZU9wdGlvbiA9IG9wdGlvbnMuc29tZSgobywgaSkgPT4ge1xuICAgICAgICAgIHJldHVybiBpICE9PSBpbmRleCAmJiBvLm5hbWVzLnNvbWUoKG5hbWUpID0+IG9wdGlvbi5uYW1lcy5pbmNsdWRlcyhuYW1lKSkgJiYgdHlwZW9mIG8ucmVxdWlyZWQgPT09IFwiYm9vbGVhblwiO1xuICAgICAgICB9KTtcbiAgICAgICAgaWYgKCFoYXNTdHJpbmdUeXBlT3B0aW9uKSB7XG4gICAgICAgICAgcmVzdWx0LmJvb2xlYW4ucHVzaChvcHRpb24ubmFtZXNbMF0pO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXN1bHQuYm9vbGVhbi5wdXNoKG9wdGlvbi5uYW1lc1swXSk7XG4gICAgICB9XG4gICAgfVxuICB9XG4gIHJldHVybiByZXN1bHQ7XG59O1xuY29uc3QgZmluZExvbmdlc3QgPSAoYXJyKSA9PiB7XG4gIHJldHVybiBhcnIuc29ydCgoYSwgYikgPT4ge1xuICAgIHJldHVybiBhLmxlbmd0aCA+IGIubGVuZ3RoID8gLTEgOiAxO1xuICB9KVswXTtcbn07XG5jb25zdCBwYWRSaWdodCA9IChzdHIsIGxlbmd0aCkgPT4ge1xuICByZXR1cm4gc3RyLmxlbmd0aCA+PSBsZW5ndGggPyBzdHIgOiBgJHtzdHJ9JHtcIiBcIi5yZXBlYXQobGVuZ3RoIC0gc3RyLmxlbmd0aCl9YDtcbn07XG5jb25zdCBjYW1lbGNhc2UgPSAoaW5wdXQpID0+IHtcbiAgcmV0dXJuIGlucHV0LnJlcGxhY2UoLyhbYS16XSktKFthLXpdKS9nLCAoXywgcDEsIHAyKSA9PiB7XG4gICAgcmV0dXJuIHAxICsgcDIudG9VcHBlckNhc2UoKTtcbiAgfSk7XG59O1xuY29uc3Qgc2V0RG90UHJvcCA9IChvYmosIGtleXMsIHZhbCkgPT4ge1xuICBsZXQgaSA9IDA7XG4gIGxldCBsZW5ndGggPSBrZXlzLmxlbmd0aDtcbiAgbGV0IHQgPSBvYmo7XG4gIGxldCB4O1xuICBmb3IgKDsgaSA8IGxlbmd0aDsgKytpKSB7XG4gICAgeCA9IHRba2V5c1tpXV07XG4gICAgdCA9IHRba2V5c1tpXV0gPSBpID09PSBsZW5ndGggLSAxID8gdmFsIDogeCAhPSBudWxsID8geCA6ICEhfmtleXNbaSArIDFdLmluZGV4T2YoXCIuXCIpIHx8ICEoK2tleXNbaSArIDFdID4gLTEpID8ge30gOiBbXTtcbiAgfVxufTtcbmNvbnN0IHNldEJ5VHlwZSA9IChvYmosIHRyYW5zZm9ybXMpID0+IHtcbiAgZm9yIChjb25zdCBrZXkgb2YgT2JqZWN0LmtleXModHJhbnNmb3JtcykpIHtcbiAgICBjb25zdCB0cmFuc2Zvcm0gPSB0cmFuc2Zvcm1zW2tleV07XG4gICAgaWYgKHRyYW5zZm9ybS5zaG91bGRUcmFuc2Zvcm0pIHtcbiAgICAgIG9ialtrZXldID0gQXJyYXkucHJvdG90eXBlLmNvbmNhdC5jYWxsKFtdLCBvYmpba2V5XSk7XG4gICAgICBpZiAodHlwZW9mIHRyYW5zZm9ybS50cmFuc2Zvcm1GdW5jdGlvbiA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgIG9ialtrZXldID0gb2JqW2tleV0ubWFwKHRyYW5zZm9ybS50cmFuc2Zvcm1GdW5jdGlvbik7XG4gICAgICB9XG4gICAgfVxuICB9XG59O1xuY29uc3QgZ2V0RmlsZU5hbWUgPSAoaW5wdXQpID0+IHtcbiAgY29uc3QgbSA9IC8oW15cXFxcXFwvXSspJC8uZXhlYyhpbnB1dCk7XG4gIHJldHVybiBtID8gbVsxXSA6IFwiXCI7XG59O1xuY29uc3QgY2FtZWxjYXNlT3B0aW9uTmFtZSA9IChuYW1lKSA9PiB7XG4gIHJldHVybiBuYW1lLnNwbGl0KFwiLlwiKS5tYXAoKHYsIGkpID0+IHtcbiAgICByZXR1cm4gaSA9PT0gMCA/IGNhbWVsY2FzZSh2KSA6IHY7XG4gIH0pLmpvaW4oXCIuXCIpO1xufTtcbmNsYXNzIENBQ0Vycm9yIGV4dGVuZHMgRXJyb3Ige1xuICBjb25zdHJ1Y3RvcihtZXNzYWdlKSB7XG4gICAgc3VwZXIobWVzc2FnZSk7XG4gICAgdGhpcy5uYW1lID0gdGhpcy5jb25zdHJ1Y3Rvci5uYW1lO1xuICAgIGlmICh0eXBlb2YgRXJyb3IuY2FwdHVyZVN0YWNrVHJhY2UgPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgRXJyb3IuY2FwdHVyZVN0YWNrVHJhY2UodGhpcywgdGhpcy5jb25zdHJ1Y3Rvcik7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuc3RhY2sgPSBuZXcgRXJyb3IobWVzc2FnZSkuc3RhY2s7XG4gICAgfVxuICB9XG59XG5cbmNsYXNzIE9wdGlvbiB7XG4gIGNvbnN0cnVjdG9yKHJhd05hbWUsIGRlc2NyaXB0aW9uLCBjb25maWcpIHtcbiAgICB0aGlzLnJhd05hbWUgPSByYXdOYW1lO1xuICAgIHRoaXMuZGVzY3JpcHRpb24gPSBkZXNjcmlwdGlvbjtcbiAgICB0aGlzLmNvbmZpZyA9IE9iamVjdC5hc3NpZ24oe30sIGNvbmZpZyk7XG4gICAgcmF3TmFtZSA9IHJhd05hbWUucmVwbGFjZSgvXFwuXFwqL2csIFwiXCIpO1xuICAgIHRoaXMubmVnYXRlZCA9IGZhbHNlO1xuICAgIHRoaXMubmFtZXMgPSByZW1vdmVCcmFja2V0cyhyYXdOYW1lKS5zcGxpdChcIixcIikubWFwKCh2KSA9PiB7XG4gICAgICBsZXQgbmFtZSA9IHYudHJpbSgpLnJlcGxhY2UoL14tezEsMn0vLCBcIlwiKTtcbiAgICAgIGlmIChuYW1lLnN0YXJ0c1dpdGgoXCJuby1cIikpIHtcbiAgICAgICAgdGhpcy5uZWdhdGVkID0gdHJ1ZTtcbiAgICAgICAgbmFtZSA9IG5hbWUucmVwbGFjZSgvXm5vLS8sIFwiXCIpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGNhbWVsY2FzZU9wdGlvbk5hbWUobmFtZSk7XG4gICAgfSkuc29ydCgoYSwgYikgPT4gYS5sZW5ndGggPiBiLmxlbmd0aCA/IDEgOiAtMSk7XG4gICAgdGhpcy5uYW1lID0gdGhpcy5uYW1lc1t0aGlzLm5hbWVzLmxlbmd0aCAtIDFdO1xuICAgIGlmICh0aGlzLm5lZ2F0ZWQgJiYgdGhpcy5jb25maWcuZGVmYXVsdCA9PSBudWxsKSB7XG4gICAgICB0aGlzLmNvbmZpZy5kZWZhdWx0ID0gdHJ1ZTtcbiAgICB9XG4gICAgaWYgKHJhd05hbWUuaW5jbHVkZXMoXCI8XCIpKSB7XG4gICAgICB0aGlzLnJlcXVpcmVkID0gdHJ1ZTtcbiAgICB9IGVsc2UgaWYgKHJhd05hbWUuaW5jbHVkZXMoXCJbXCIpKSB7XG4gICAgICB0aGlzLnJlcXVpcmVkID0gZmFsc2U7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuaXNCb29sZWFuID0gdHJ1ZTtcbiAgICB9XG4gIH1cbn1cblxuY29uc3QgcHJvY2Vzc0FyZ3MgPSBwcm9jZXNzLmFyZ3Y7XG5jb25zdCBwbGF0Zm9ybUluZm8gPSBgJHtwcm9jZXNzLnBsYXRmb3JtfS0ke3Byb2Nlc3MuYXJjaH0gbm9kZS0ke3Byb2Nlc3MudmVyc2lvbn1gO1xuXG5jbGFzcyBDb21tYW5kIHtcbiAgY29uc3RydWN0b3IocmF3TmFtZSwgZGVzY3JpcHRpb24sIGNvbmZpZyA9IHt9LCBjbGkpIHtcbiAgICB0aGlzLnJhd05hbWUgPSByYXdOYW1lO1xuICAgIHRoaXMuZGVzY3JpcHRpb24gPSBkZXNjcmlwdGlvbjtcbiAgICB0aGlzLmNvbmZpZyA9IGNvbmZpZztcbiAgICB0aGlzLmNsaSA9IGNsaTtcbiAgICB0aGlzLm9wdGlvbnMgPSBbXTtcbiAgICB0aGlzLmFsaWFzTmFtZXMgPSBbXTtcbiAgICB0aGlzLm5hbWUgPSByZW1vdmVCcmFja2V0cyhyYXdOYW1lKTtcbiAgICB0aGlzLmFyZ3MgPSBmaW5kQWxsQnJhY2tldHMocmF3TmFtZSk7XG4gICAgdGhpcy5leGFtcGxlcyA9IFtdO1xuICB9XG4gIHVzYWdlKHRleHQpIHtcbiAgICB0aGlzLnVzYWdlVGV4dCA9IHRleHQ7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cbiAgYWxsb3dVbmtub3duT3B0aW9ucygpIHtcbiAgICB0aGlzLmNvbmZpZy5hbGxvd1Vua25vd25PcHRpb25zID0gdHJ1ZTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuICBpZ25vcmVPcHRpb25EZWZhdWx0VmFsdWUoKSB7XG4gICAgdGhpcy5jb25maWcuaWdub3JlT3B0aW9uRGVmYXVsdFZhbHVlID0gdHJ1ZTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuICB2ZXJzaW9uKHZlcnNpb24sIGN1c3RvbUZsYWdzID0gXCItdiwgLS12ZXJzaW9uXCIpIHtcbiAgICB0aGlzLnZlcnNpb25OdW1iZXIgPSB2ZXJzaW9uO1xuICAgIHRoaXMub3B0aW9uKGN1c3RvbUZsYWdzLCBcIkRpc3BsYXkgdmVyc2lvbiBudW1iZXJcIik7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cbiAgZXhhbXBsZShleGFtcGxlKSB7XG4gICAgdGhpcy5leGFtcGxlcy5wdXNoKGV4YW1wbGUpO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG4gIG9wdGlvbihyYXdOYW1lLCBkZXNjcmlwdGlvbiwgY29uZmlnKSB7XG4gICAgY29uc3Qgb3B0aW9uID0gbmV3IE9wdGlvbihyYXdOYW1lLCBkZXNjcmlwdGlvbiwgY29uZmlnKTtcbiAgICB0aGlzLm9wdGlvbnMucHVzaChvcHRpb24pO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG4gIGFsaWFzKG5hbWUpIHtcbiAgICB0aGlzLmFsaWFzTmFtZXMucHVzaChuYW1lKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuICBhY3Rpb24oY2FsbGJhY2spIHtcbiAgICB0aGlzLmNvbW1hbmRBY3Rpb24gPSBjYWxsYmFjaztcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuICBpc01hdGNoZWQobmFtZSkge1xuICAgIHJldHVybiB0aGlzLm5hbWUgPT09IG5hbWUgfHwgdGhpcy5hbGlhc05hbWVzLmluY2x1ZGVzKG5hbWUpO1xuICB9XG4gIGdldCBpc0RlZmF1bHRDb21tYW5kKCkge1xuICAgIHJldHVybiB0aGlzLm5hbWUgPT09IFwiXCIgfHwgdGhpcy5hbGlhc05hbWVzLmluY2x1ZGVzKFwiIVwiKTtcbiAgfVxuICBnZXQgaXNHbG9iYWxDb21tYW5kKCkge1xuICAgIHJldHVybiB0aGlzIGluc3RhbmNlb2YgR2xvYmFsQ29tbWFuZDtcbiAgfVxuICBoYXNPcHRpb24obmFtZSkge1xuICAgIG5hbWUgPSBuYW1lLnNwbGl0KFwiLlwiKVswXTtcbiAgICByZXR1cm4gdGhpcy5vcHRpb25zLmZpbmQoKG9wdGlvbikgPT4ge1xuICAgICAgcmV0dXJuIG9wdGlvbi5uYW1lcy5pbmNsdWRlcyhuYW1lKTtcbiAgICB9KTtcbiAgfVxuICBvdXRwdXRIZWxwKCkge1xuICAgIGNvbnN0IHtuYW1lLCBjb21tYW5kc30gPSB0aGlzLmNsaTtcbiAgICBjb25zdCB7XG4gICAgICB2ZXJzaW9uTnVtYmVyLFxuICAgICAgb3B0aW9uczogZ2xvYmFsT3B0aW9ucyxcbiAgICAgIGhlbHBDYWxsYmFja1xuICAgIH0gPSB0aGlzLmNsaS5nbG9iYWxDb21tYW5kO1xuICAgIGxldCBzZWN0aW9ucyA9IFtcbiAgICAgIHtcbiAgICAgICAgYm9keTogYCR7bmFtZX0ke3ZlcnNpb25OdW1iZXIgPyBgLyR7dmVyc2lvbk51bWJlcn1gIDogXCJcIn1gXG4gICAgICB9XG4gICAgXTtcbiAgICBzZWN0aW9ucy5wdXNoKHtcbiAgICAgIHRpdGxlOiBcIlVzYWdlXCIsXG4gICAgICBib2R5OiBgICAkICR7bmFtZX0gJHt0aGlzLnVzYWdlVGV4dCB8fCB0aGlzLnJhd05hbWV9YFxuICAgIH0pO1xuICAgIGNvbnN0IHNob3dDb21tYW5kcyA9ICh0aGlzLmlzR2xvYmFsQ29tbWFuZCB8fCB0aGlzLmlzRGVmYXVsdENvbW1hbmQpICYmIGNvbW1hbmRzLmxlbmd0aCA+IDA7XG4gICAgaWYgKHNob3dDb21tYW5kcykge1xuICAgICAgY29uc3QgbG9uZ2VzdENvbW1hbmROYW1lID0gZmluZExvbmdlc3QoY29tbWFuZHMubWFwKChjb21tYW5kKSA9PiBjb21tYW5kLnJhd05hbWUpKTtcbiAgICAgIHNlY3Rpb25zLnB1c2goe1xuICAgICAgICB0aXRsZTogXCJDb21tYW5kc1wiLFxuICAgICAgICBib2R5OiBjb21tYW5kcy5tYXAoKGNvbW1hbmQpID0+IHtcbiAgICAgICAgICByZXR1cm4gYCAgJHtwYWRSaWdodChjb21tYW5kLnJhd05hbWUsIGxvbmdlc3RDb21tYW5kTmFtZS5sZW5ndGgpfSAgJHtjb21tYW5kLmRlc2NyaXB0aW9ufWA7XG4gICAgICAgIH0pLmpvaW4oXCJcXG5cIilcbiAgICAgIH0pO1xuICAgICAgc2VjdGlvbnMucHVzaCh7XG4gICAgICAgIHRpdGxlOiBgRm9yIG1vcmUgaW5mbywgcnVuIGFueSBjb21tYW5kIHdpdGggdGhlIFxcYC0taGVscFxcYCBmbGFnYCxcbiAgICAgICAgYm9keTogY29tbWFuZHMubWFwKChjb21tYW5kKSA9PiBgICAkICR7bmFtZX0ke2NvbW1hbmQubmFtZSA9PT0gXCJcIiA/IFwiXCIgOiBgICR7Y29tbWFuZC5uYW1lfWB9IC0taGVscGApLmpvaW4oXCJcXG5cIilcbiAgICAgIH0pO1xuICAgIH1cbiAgICBsZXQgb3B0aW9ucyA9IHRoaXMuaXNHbG9iYWxDb21tYW5kID8gZ2xvYmFsT3B0aW9ucyA6IFsuLi50aGlzLm9wdGlvbnMsIC4uLmdsb2JhbE9wdGlvbnMgfHwgW11dO1xuICAgIGlmICghdGhpcy5pc0dsb2JhbENvbW1hbmQgJiYgIXRoaXMuaXNEZWZhdWx0Q29tbWFuZCkge1xuICAgICAgb3B0aW9ucyA9IG9wdGlvbnMuZmlsdGVyKChvcHRpb24pID0+IG9wdGlvbi5uYW1lICE9PSBcInZlcnNpb25cIik7XG4gICAgfVxuICAgIGlmIChvcHRpb25zLmxlbmd0aCA+IDApIHtcbiAgICAgIGNvbnN0IGxvbmdlc3RPcHRpb25OYW1lID0gZmluZExvbmdlc3Qob3B0aW9ucy5tYXAoKG9wdGlvbikgPT4gb3B0aW9uLnJhd05hbWUpKTtcbiAgICAgIHNlY3Rpb25zLnB1c2goe1xuICAgICAgICB0aXRsZTogXCJPcHRpb25zXCIsXG4gICAgICAgIGJvZHk6IG9wdGlvbnMubWFwKChvcHRpb24pID0+IHtcbiAgICAgICAgICByZXR1cm4gYCAgJHtwYWRSaWdodChvcHRpb24ucmF3TmFtZSwgbG9uZ2VzdE9wdGlvbk5hbWUubGVuZ3RoKX0gICR7b3B0aW9uLmRlc2NyaXB0aW9ufSAke29wdGlvbi5jb25maWcuZGVmYXVsdCA9PT0gdm9pZCAwID8gXCJcIiA6IGAoZGVmYXVsdDogJHtvcHRpb24uY29uZmlnLmRlZmF1bHR9KWB9YDtcbiAgICAgICAgfSkuam9pbihcIlxcblwiKVxuICAgICAgfSk7XG4gICAgfVxuICAgIGlmICh0aGlzLmV4YW1wbGVzLmxlbmd0aCA+IDApIHtcbiAgICAgIHNlY3Rpb25zLnB1c2goe1xuICAgICAgICB0aXRsZTogXCJFeGFtcGxlc1wiLFxuICAgICAgICBib2R5OiB0aGlzLmV4YW1wbGVzLm1hcCgoZXhhbXBsZSkgPT4ge1xuICAgICAgICAgIGlmICh0eXBlb2YgZXhhbXBsZSA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgICAgICByZXR1cm4gZXhhbXBsZShuYW1lKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIGV4YW1wbGU7XG4gICAgICAgIH0pLmpvaW4oXCJcXG5cIilcbiAgICAgIH0pO1xuICAgIH1cbiAgICBpZiAoaGVscENhbGxiYWNrKSB7XG4gICAgICBzZWN0aW9ucyA9IGhlbHBDYWxsYmFjayhzZWN0aW9ucykgfHwgc2VjdGlvbnM7XG4gICAgfVxuICAgIGNvbnNvbGUubG9nKHNlY3Rpb25zLm1hcCgoc2VjdGlvbikgPT4ge1xuICAgICAgcmV0dXJuIHNlY3Rpb24udGl0bGUgPyBgJHtzZWN0aW9uLnRpdGxlfTpcbiR7c2VjdGlvbi5ib2R5fWAgOiBzZWN0aW9uLmJvZHk7XG4gICAgfSkuam9pbihcIlxcblxcblwiKSk7XG4gIH1cbiAgb3V0cHV0VmVyc2lvbigpIHtcbiAgICBjb25zdCB7bmFtZX0gPSB0aGlzLmNsaTtcbiAgICBjb25zdCB7dmVyc2lvbk51bWJlcn0gPSB0aGlzLmNsaS5nbG9iYWxDb21tYW5kO1xuICAgIGlmICh2ZXJzaW9uTnVtYmVyKSB7XG4gICAgICBjb25zb2xlLmxvZyhgJHtuYW1lfS8ke3ZlcnNpb25OdW1iZXJ9ICR7cGxhdGZvcm1JbmZvfWApO1xuICAgIH1cbiAgfVxuICBjaGVja1JlcXVpcmVkQXJncygpIHtcbiAgICBjb25zdCBtaW5pbWFsQXJnc0NvdW50ID0gdGhpcy5hcmdzLmZpbHRlcigoYXJnKSA9PiBhcmcucmVxdWlyZWQpLmxlbmd0aDtcbiAgICBpZiAodGhpcy5jbGkuYXJncy5sZW5ndGggPCBtaW5pbWFsQXJnc0NvdW50KSB7XG4gICAgICB0aHJvdyBuZXcgQ0FDRXJyb3IoYG1pc3NpbmcgcmVxdWlyZWQgYXJncyBmb3IgY29tbWFuZCBcXGAke3RoaXMucmF3TmFtZX1cXGBgKTtcbiAgICB9XG4gIH1cbiAgY2hlY2tVbmtub3duT3B0aW9ucygpIHtcbiAgICBjb25zdCB7b3B0aW9ucywgZ2xvYmFsQ29tbWFuZH0gPSB0aGlzLmNsaTtcbiAgICBpZiAoIXRoaXMuY29uZmlnLmFsbG93VW5rbm93bk9wdGlvbnMpIHtcbiAgICAgIGZvciAoY29uc3QgbmFtZSBvZiBPYmplY3Qua2V5cyhvcHRpb25zKSkge1xuICAgICAgICBpZiAobmFtZSAhPT0gXCItLVwiICYmICF0aGlzLmhhc09wdGlvbihuYW1lKSAmJiAhZ2xvYmFsQ29tbWFuZC5oYXNPcHRpb24obmFtZSkpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgQ0FDRXJyb3IoYFVua25vd24gb3B0aW9uIFxcYCR7bmFtZS5sZW5ndGggPiAxID8gYC0tJHtuYW1lfWAgOiBgLSR7bmFtZX1gfVxcYGApO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG4gIGNoZWNrT3B0aW9uVmFsdWUoKSB7XG4gICAgY29uc3Qge29wdGlvbnM6IHBhcnNlZE9wdGlvbnMsIGdsb2JhbENvbW1hbmR9ID0gdGhpcy5jbGk7XG4gICAgY29uc3Qgb3B0aW9ucyA9IFsuLi5nbG9iYWxDb21tYW5kLm9wdGlvbnMsIC4uLnRoaXMub3B0aW9uc107XG4gICAgZm9yIChjb25zdCBvcHRpb24gb2Ygb3B0aW9ucykge1xuICAgICAgY29uc3QgdmFsdWUgPSBwYXJzZWRPcHRpb25zW29wdGlvbi5uYW1lLnNwbGl0KFwiLlwiKVswXV07XG4gICAgICBpZiAob3B0aW9uLnJlcXVpcmVkKSB7XG4gICAgICAgIGNvbnN0IGhhc05lZ2F0ZWQgPSBvcHRpb25zLnNvbWUoKG8pID0+IG8ubmVnYXRlZCAmJiBvLm5hbWVzLmluY2x1ZGVzKG9wdGlvbi5uYW1lKSk7XG4gICAgICAgIGlmICh2YWx1ZSA9PT0gdHJ1ZSB8fCB2YWx1ZSA9PT0gZmFsc2UgJiYgIWhhc05lZ2F0ZWQpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgQ0FDRXJyb3IoYG9wdGlvbiBcXGAke29wdGlvbi5yYXdOYW1lfVxcYCB2YWx1ZSBpcyBtaXNzaW5nYCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cbmNsYXNzIEdsb2JhbENvbW1hbmQgZXh0ZW5kcyBDb21tYW5kIHtcbiAgY29uc3RydWN0b3IoY2xpKSB7XG4gICAgc3VwZXIoXCJAQGdsb2JhbEBAXCIsIFwiXCIsIHt9LCBjbGkpO1xuICB9XG59XG5cbnZhciBfX2Fzc2lnbiA9IE9iamVjdC5hc3NpZ247XG5jbGFzcyBDQUMgZXh0ZW5kcyBFdmVudEVtaXR0ZXIge1xuICBjb25zdHJ1Y3RvcihuYW1lID0gXCJcIikge1xuICAgIHN1cGVyKCk7XG4gICAgdGhpcy5uYW1lID0gbmFtZTtcbiAgICB0aGlzLmNvbW1hbmRzID0gW107XG4gICAgdGhpcy5yYXdBcmdzID0gW107XG4gICAgdGhpcy5hcmdzID0gW107XG4gICAgdGhpcy5vcHRpb25zID0ge307XG4gICAgdGhpcy5nbG9iYWxDb21tYW5kID0gbmV3IEdsb2JhbENvbW1hbmQodGhpcyk7XG4gICAgdGhpcy5nbG9iYWxDb21tYW5kLnVzYWdlKFwiPGNvbW1hbmQ+IFtvcHRpb25zXVwiKTtcbiAgfVxuICB1c2FnZSh0ZXh0KSB7XG4gICAgdGhpcy5nbG9iYWxDb21tYW5kLnVzYWdlKHRleHQpO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG4gIGNvbW1hbmQocmF3TmFtZSwgZGVzY3JpcHRpb24sIGNvbmZpZykge1xuICAgIGNvbnN0IGNvbW1hbmQgPSBuZXcgQ29tbWFuZChyYXdOYW1lLCBkZXNjcmlwdGlvbiB8fCBcIlwiLCBjb25maWcsIHRoaXMpO1xuICAgIGNvbW1hbmQuZ2xvYmFsQ29tbWFuZCA9IHRoaXMuZ2xvYmFsQ29tbWFuZDtcbiAgICB0aGlzLmNvbW1hbmRzLnB1c2goY29tbWFuZCk7XG4gICAgcmV0dXJuIGNvbW1hbmQ7XG4gIH1cbiAgb3B0aW9uKHJhd05hbWUsIGRlc2NyaXB0aW9uLCBjb25maWcpIHtcbiAgICB0aGlzLmdsb2JhbENvbW1hbmQub3B0aW9uKHJhd05hbWUsIGRlc2NyaXB0aW9uLCBjb25maWcpO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG4gIGhlbHAoY2FsbGJhY2spIHtcbiAgICB0aGlzLmdsb2JhbENvbW1hbmQub3B0aW9uKFwiLWgsIC0taGVscFwiLCBcIkRpc3BsYXkgdGhpcyBtZXNzYWdlXCIpO1xuICAgIHRoaXMuZ2xvYmFsQ29tbWFuZC5oZWxwQ2FsbGJhY2sgPSBjYWxsYmFjaztcbiAgICB0aGlzLnNob3dIZWxwT25FeGl0ID0gdHJ1ZTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuICB2ZXJzaW9uKHZlcnNpb24sIGN1c3RvbUZsYWdzID0gXCItdiwgLS12ZXJzaW9uXCIpIHtcbiAgICB0aGlzLmdsb2JhbENvbW1hbmQudmVyc2lvbih2ZXJzaW9uLCBjdXN0b21GbGFncyk7XG4gICAgdGhpcy5zaG93VmVyc2lvbk9uRXhpdCA9IHRydWU7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cbiAgZXhhbXBsZShleGFtcGxlKSB7XG4gICAgdGhpcy5nbG9iYWxDb21tYW5kLmV4YW1wbGUoZXhhbXBsZSk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cbiAgb3V0cHV0SGVscCgpIHtcbiAgICBpZiAodGhpcy5tYXRjaGVkQ29tbWFuZCkge1xuICAgICAgdGhpcy5tYXRjaGVkQ29tbWFuZC5vdXRwdXRIZWxwKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuZ2xvYmFsQ29tbWFuZC5vdXRwdXRIZWxwKCk7XG4gICAgfVxuICB9XG4gIG91dHB1dFZlcnNpb24oKSB7XG4gICAgdGhpcy5nbG9iYWxDb21tYW5kLm91dHB1dFZlcnNpb24oKTtcbiAgfVxuICBzZXRQYXJzZWRJbmZvKHthcmdzLCBvcHRpb25zfSwgbWF0Y2hlZENvbW1hbmQsIG1hdGNoZWRDb21tYW5kTmFtZSkge1xuICAgIHRoaXMuYXJncyA9IGFyZ3M7XG4gICAgdGhpcy5vcHRpb25zID0gb3B0aW9ucztcbiAgICBpZiAobWF0Y2hlZENvbW1hbmQpIHtcbiAgICAgIHRoaXMubWF0Y2hlZENvbW1hbmQgPSBtYXRjaGVkQ29tbWFuZDtcbiAgICB9XG4gICAgaWYgKG1hdGNoZWRDb21tYW5kTmFtZSkge1xuICAgICAgdGhpcy5tYXRjaGVkQ29tbWFuZE5hbWUgPSBtYXRjaGVkQ29tbWFuZE5hbWU7XG4gICAgfVxuICAgIHJldHVybiB0aGlzO1xuICB9XG4gIHVuc2V0TWF0Y2hlZENvbW1hbmQoKSB7XG4gICAgdGhpcy5tYXRjaGVkQ29tbWFuZCA9IHZvaWQgMDtcbiAgICB0aGlzLm1hdGNoZWRDb21tYW5kTmFtZSA9IHZvaWQgMDtcbiAgfVxuICBwYXJzZShhcmd2ID0gcHJvY2Vzc0FyZ3MsIHtcbiAgICBydW4gPSB0cnVlXG4gIH0gPSB7fSkge1xuICAgIHRoaXMucmF3QXJncyA9IGFyZ3Y7XG4gICAgaWYgKCF0aGlzLm5hbWUpIHtcbiAgICAgIHRoaXMubmFtZSA9IGFyZ3ZbMV0gPyBnZXRGaWxlTmFtZShhcmd2WzFdKSA6IFwiY2xpXCI7XG4gICAgfVxuICAgIGxldCBzaG91bGRQYXJzZSA9IHRydWU7XG4gICAgZm9yIChjb25zdCBjb21tYW5kIG9mIHRoaXMuY29tbWFuZHMpIHtcbiAgICAgIGNvbnN0IHBhcnNlZCA9IHRoaXMubXJpKGFyZ3Yuc2xpY2UoMiksIGNvbW1hbmQpO1xuICAgICAgY29uc3QgY29tbWFuZE5hbWUgPSBwYXJzZWQuYXJnc1swXTtcbiAgICAgIGlmIChjb21tYW5kLmlzTWF0Y2hlZChjb21tYW5kTmFtZSkpIHtcbiAgICAgICAgc2hvdWxkUGFyc2UgPSBmYWxzZTtcbiAgICAgICAgY29uc3QgcGFyc2VkSW5mbyA9IF9fYXNzaWduKF9fYXNzaWduKHt9LCBwYXJzZWQpLCB7XG4gICAgICAgICAgYXJnczogcGFyc2VkLmFyZ3Muc2xpY2UoMSlcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMuc2V0UGFyc2VkSW5mbyhwYXJzZWRJbmZvLCBjb21tYW5kLCBjb21tYW5kTmFtZSk7XG4gICAgICAgIHRoaXMuZW1pdChgY29tbWFuZDoke2NvbW1hbmROYW1lfWAsIGNvbW1hbmQpO1xuICAgICAgfVxuICAgIH1cbiAgICBpZiAoc2hvdWxkUGFyc2UpIHtcbiAgICAgIGZvciAoY29uc3QgY29tbWFuZCBvZiB0aGlzLmNvbW1hbmRzKSB7XG4gICAgICAgIGlmIChjb21tYW5kLm5hbWUgPT09IFwiXCIpIHtcbiAgICAgICAgICBzaG91bGRQYXJzZSA9IGZhbHNlO1xuICAgICAgICAgIGNvbnN0IHBhcnNlZCA9IHRoaXMubXJpKGFyZ3Yuc2xpY2UoMiksIGNvbW1hbmQpO1xuICAgICAgICAgIHRoaXMuc2V0UGFyc2VkSW5mbyhwYXJzZWQsIGNvbW1hbmQpO1xuICAgICAgICAgIHRoaXMuZW1pdChgY29tbWFuZDohYCwgY29tbWFuZCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKHNob3VsZFBhcnNlKSB7XG4gICAgICBjb25zdCBwYXJzZWQgPSB0aGlzLm1yaShhcmd2LnNsaWNlKDIpKTtcbiAgICAgIHRoaXMuc2V0UGFyc2VkSW5mbyhwYXJzZWQpO1xuICAgIH1cbiAgICBpZiAodGhpcy5vcHRpb25zLmhlbHAgJiYgdGhpcy5zaG93SGVscE9uRXhpdCkge1xuICAgICAgdGhpcy5vdXRwdXRIZWxwKCk7XG4gICAgICBydW4gPSBmYWxzZTtcbiAgICAgIHRoaXMudW5zZXRNYXRjaGVkQ29tbWFuZCgpO1xuICAgIH1cbiAgICBpZiAodGhpcy5vcHRpb25zLnZlcnNpb24gJiYgdGhpcy5zaG93VmVyc2lvbk9uRXhpdCAmJiB0aGlzLm1hdGNoZWRDb21tYW5kTmFtZSA9PSBudWxsKSB7XG4gICAgICB0aGlzLm91dHB1dFZlcnNpb24oKTtcbiAgICAgIHJ1biA9IGZhbHNlO1xuICAgICAgdGhpcy51bnNldE1hdGNoZWRDb21tYW5kKCk7XG4gICAgfVxuICAgIGNvbnN0IHBhcnNlZEFyZ3YgPSB7YXJnczogdGhpcy5hcmdzLCBvcHRpb25zOiB0aGlzLm9wdGlvbnN9O1xuICAgIGlmIChydW4pIHtcbiAgICAgIHRoaXMucnVuTWF0Y2hlZENvbW1hbmQoKTtcbiAgICB9XG4gICAgaWYgKCF0aGlzLm1hdGNoZWRDb21tYW5kICYmIHRoaXMuYXJnc1swXSkge1xuICAgICAgdGhpcy5lbWl0KFwiY29tbWFuZDoqXCIpO1xuICAgIH1cbiAgICByZXR1cm4gcGFyc2VkQXJndjtcbiAgfVxuICBtcmkoYXJndiwgY29tbWFuZCkge1xuICAgIGNvbnN0IGNsaU9wdGlvbnMgPSBbXG4gICAgICAuLi50aGlzLmdsb2JhbENvbW1hbmQub3B0aW9ucyxcbiAgICAgIC4uLmNvbW1hbmQgPyBjb21tYW5kLm9wdGlvbnMgOiBbXVxuICAgIF07XG4gICAgY29uc3QgbXJpT3B0aW9ucyA9IGdldE1yaU9wdGlvbnMoY2xpT3B0aW9ucyk7XG4gICAgbGV0IGFyZ3NBZnRlckRvdWJsZURhc2hlcyA9IFtdO1xuICAgIGNvbnN0IGRvdWJsZURhc2hlc0luZGV4ID0gYXJndi5pbmRleE9mKFwiLS1cIik7XG4gICAgaWYgKGRvdWJsZURhc2hlc0luZGV4ID4gLTEpIHtcbiAgICAgIGFyZ3NBZnRlckRvdWJsZURhc2hlcyA9IGFyZ3Yuc2xpY2UoZG91YmxlRGFzaGVzSW5kZXggKyAxKTtcbiAgICAgIGFyZ3YgPSBhcmd2LnNsaWNlKDAsIGRvdWJsZURhc2hlc0luZGV4KTtcbiAgICB9XG4gICAgbGV0IHBhcnNlZCA9IG1yaTIoYXJndiwgbXJpT3B0aW9ucyk7XG4gICAgcGFyc2VkID0gT2JqZWN0LmtleXMocGFyc2VkKS5yZWR1Y2UoKHJlcywgbmFtZSkgPT4ge1xuICAgICAgcmV0dXJuIF9fYXNzaWduKF9fYXNzaWduKHt9LCByZXMpLCB7XG4gICAgICAgIFtjYW1lbGNhc2VPcHRpb25OYW1lKG5hbWUpXTogcGFyc2VkW25hbWVdXG4gICAgICB9KTtcbiAgICB9LCB7XzogW119KTtcbiAgICBjb25zdCBhcmdzID0gcGFyc2VkLl87XG4gICAgY29uc3Qgb3B0aW9ucyA9IHtcbiAgICAgIFwiLS1cIjogYXJnc0FmdGVyRG91YmxlRGFzaGVzXG4gICAgfTtcbiAgICBjb25zdCBpZ25vcmVEZWZhdWx0ID0gY29tbWFuZCAmJiBjb21tYW5kLmNvbmZpZy5pZ25vcmVPcHRpb25EZWZhdWx0VmFsdWUgPyBjb21tYW5kLmNvbmZpZy5pZ25vcmVPcHRpb25EZWZhdWx0VmFsdWUgOiB0aGlzLmdsb2JhbENvbW1hbmQuY29uZmlnLmlnbm9yZU9wdGlvbkRlZmF1bHRWYWx1ZTtcbiAgICBsZXQgdHJhbnNmb3JtcyA9IE9iamVjdC5jcmVhdGUobnVsbCk7XG4gICAgZm9yIChjb25zdCBjbGlPcHRpb24gb2YgY2xpT3B0aW9ucykge1xuICAgICAgaWYgKCFpZ25vcmVEZWZhdWx0ICYmIGNsaU9wdGlvbi5jb25maWcuZGVmYXVsdCAhPT0gdm9pZCAwKSB7XG4gICAgICAgIGZvciAoY29uc3QgbmFtZSBvZiBjbGlPcHRpb24ubmFtZXMpIHtcbiAgICAgICAgICBvcHRpb25zW25hbWVdID0gY2xpT3B0aW9uLmNvbmZpZy5kZWZhdWx0O1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBpZiAoQXJyYXkuaXNBcnJheShjbGlPcHRpb24uY29uZmlnLnR5cGUpKSB7XG4gICAgICAgIGlmICh0cmFuc2Zvcm1zW2NsaU9wdGlvbi5uYW1lXSA9PT0gdm9pZCAwKSB7XG4gICAgICAgICAgdHJhbnNmb3Jtc1tjbGlPcHRpb24ubmFtZV0gPSBPYmplY3QuY3JlYXRlKG51bGwpO1xuICAgICAgICAgIHRyYW5zZm9ybXNbY2xpT3B0aW9uLm5hbWVdW1wic2hvdWxkVHJhbnNmb3JtXCJdID0gdHJ1ZTtcbiAgICAgICAgICB0cmFuc2Zvcm1zW2NsaU9wdGlvbi5uYW1lXVtcInRyYW5zZm9ybUZ1bmN0aW9uXCJdID0gY2xpT3B0aW9uLmNvbmZpZy50eXBlWzBdO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIGZvciAoY29uc3Qga2V5IG9mIE9iamVjdC5rZXlzKHBhcnNlZCkpIHtcbiAgICAgIGlmIChrZXkgIT09IFwiX1wiKSB7XG4gICAgICAgIGNvbnN0IGtleXMgPSBrZXkuc3BsaXQoXCIuXCIpO1xuICAgICAgICBzZXREb3RQcm9wKG9wdGlvbnMsIGtleXMsIHBhcnNlZFtrZXldKTtcbiAgICAgICAgc2V0QnlUeXBlKG9wdGlvbnMsIHRyYW5zZm9ybXMpO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4ge1xuICAgICAgYXJncyxcbiAgICAgIG9wdGlvbnNcbiAgICB9O1xuICB9XG4gIHJ1bk1hdGNoZWRDb21tYW5kKCkge1xuICAgIGNvbnN0IHthcmdzLCBvcHRpb25zLCBtYXRjaGVkQ29tbWFuZDogY29tbWFuZH0gPSB0aGlzO1xuICAgIGlmICghY29tbWFuZCB8fCAhY29tbWFuZC5jb21tYW5kQWN0aW9uKVxuICAgICAgcmV0dXJuO1xuICAgIGNvbW1hbmQuY2hlY2tVbmtub3duT3B0aW9ucygpO1xuICAgIGNvbW1hbmQuY2hlY2tPcHRpb25WYWx1ZSgpO1xuICAgIGNvbW1hbmQuY2hlY2tSZXF1aXJlZEFyZ3MoKTtcbiAgICBjb25zdCBhY3Rpb25BcmdzID0gW107XG4gICAgY29tbWFuZC5hcmdzLmZvckVhY2goKGFyZywgaW5kZXgpID0+IHtcbiAgICAgIGlmIChhcmcudmFyaWFkaWMpIHtcbiAgICAgICAgYWN0aW9uQXJncy5wdXNoKGFyZ3Muc2xpY2UoaW5kZXgpKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGFjdGlvbkFyZ3MucHVzaChhcmdzW2luZGV4XSk7XG4gICAgICB9XG4gICAgfSk7XG4gICAgYWN0aW9uQXJncy5wdXNoKG9wdGlvbnMpO1xuICAgIHJldHVybiBjb21tYW5kLmNvbW1hbmRBY3Rpb24uYXBwbHkodGhpcywgYWN0aW9uQXJncyk7XG4gIH1cbn1cblxuY29uc3QgY2FjID0gKG5hbWUgPSBcIlwiKSA9PiBuZXcgQ0FDKG5hbWUpO1xuXG5leHBvcnQgZGVmYXVsdCBjYWM7XG5leHBvcnQgeyBDQUMsIENvbW1hbmQsIGNhYyB9O1xuIiwiZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gc3RyaXBGaW5hbE5ld2xpbmUoaW5wdXQpIHtcblx0Y29uc3QgTEYgPSB0eXBlb2YgaW5wdXQgPT09ICdzdHJpbmcnID8gJ1xcbicgOiAnXFxuJy5jaGFyQ29kZUF0KCk7XG5cdGNvbnN0IENSID0gdHlwZW9mIGlucHV0ID09PSAnc3RyaW5nJyA/ICdcXHInIDogJ1xccicuY2hhckNvZGVBdCgpO1xuXG5cdGlmIChpbnB1dFtpbnB1dC5sZW5ndGggLSAxXSA9PT0gTEYpIHtcblx0XHRpbnB1dCA9IGlucHV0LnNsaWNlKDAsIC0xKTtcblx0fVxuXG5cdGlmIChpbnB1dFtpbnB1dC5sZW5ndGggLSAxXSA9PT0gQ1IpIHtcblx0XHRpbnB1dCA9IGlucHV0LnNsaWNlKDAsIC0xKTtcblx0fVxuXG5cdHJldHVybiBpbnB1dDtcbn1cbiIsImV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIHBhdGhLZXkob3B0aW9ucyA9IHt9KSB7XG5cdGNvbnN0IHtcblx0XHRlbnYgPSBwcm9jZXNzLmVudixcblx0XHRwbGF0Zm9ybSA9IHByb2Nlc3MucGxhdGZvcm1cblx0fSA9IG9wdGlvbnM7XG5cblx0aWYgKHBsYXRmb3JtICE9PSAnd2luMzInKSB7XG5cdFx0cmV0dXJuICdQQVRIJztcblx0fVxuXG5cdHJldHVybiBPYmplY3Qua2V5cyhlbnYpLnJldmVyc2UoKS5maW5kKGtleSA9PiBrZXkudG9VcHBlckNhc2UoKSA9PT0gJ1BBVEgnKSB8fCAnUGF0aCc7XG59XG4iLCJpbXBvcnQgcHJvY2VzcyBmcm9tICdub2RlOnByb2Nlc3MnO1xuaW1wb3J0IHBhdGggZnJvbSAnbm9kZTpwYXRoJztcbmltcG9ydCBwYXRoS2V5IGZyb20gJ3BhdGgta2V5JztcblxuZXhwb3J0IGZ1bmN0aW9uIG5wbVJ1blBhdGgob3B0aW9ucyA9IHt9KSB7XG5cdGNvbnN0IHtcblx0XHRjd2QgPSBwcm9jZXNzLmN3ZCgpLFxuXHRcdHBhdGg6IHBhdGhfID0gcHJvY2Vzcy5lbnZbcGF0aEtleSgpXSxcblx0XHRleGVjUGF0aCA9IHByb2Nlc3MuZXhlY1BhdGgsXG5cdH0gPSBvcHRpb25zO1xuXG5cdGxldCBwcmV2aW91cztcblx0bGV0IGN3ZFBhdGggPSBwYXRoLnJlc29sdmUoY3dkKTtcblx0Y29uc3QgcmVzdWx0ID0gW107XG5cblx0d2hpbGUgKHByZXZpb3VzICE9PSBjd2RQYXRoKSB7XG5cdFx0cmVzdWx0LnB1c2gocGF0aC5qb2luKGN3ZFBhdGgsICdub2RlX21vZHVsZXMvLmJpbicpKTtcblx0XHRwcmV2aW91cyA9IGN3ZFBhdGg7XG5cdFx0Y3dkUGF0aCA9IHBhdGgucmVzb2x2ZShjd2RQYXRoLCAnLi4nKTtcblx0fVxuXG5cdC8vIEVuc3VyZSB0aGUgcnVubmluZyBgbm9kZWAgYmluYXJ5IGlzIHVzZWQuXG5cdHJlc3VsdC5wdXNoKHBhdGgucmVzb2x2ZShjd2QsIGV4ZWNQYXRoLCAnLi4nKSk7XG5cblx0cmV0dXJuIFsuLi5yZXN1bHQsIHBhdGhfXS5qb2luKHBhdGguZGVsaW1pdGVyKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG5wbVJ1blBhdGhFbnYoe2VudiA9IHByb2Nlc3MuZW52LCAuLi5vcHRpb25zfSA9IHt9KSB7XG5cdGVudiA9IHsuLi5lbnZ9O1xuXG5cdGNvbnN0IHBhdGggPSBwYXRoS2V5KHtlbnZ9KTtcblx0b3B0aW9ucy5wYXRoID0gZW52W3BhdGhdO1xuXHRlbnZbcGF0aF0gPSBucG1SdW5QYXRoKG9wdGlvbnMpO1xuXG5cdHJldHVybiBlbnY7XG59XG4iLCJjb25zdCBjb3B5UHJvcGVydHkgPSAodG8sIGZyb20sIHByb3BlcnR5LCBpZ25vcmVOb25Db25maWd1cmFibGUpID0+IHtcblx0Ly8gYEZ1bmN0aW9uI2xlbmd0aGAgc2hvdWxkIHJlZmxlY3QgdGhlIHBhcmFtZXRlcnMgb2YgYHRvYCBub3QgYGZyb21gIHNpbmNlIHdlIGtlZXAgaXRzIGJvZHkuXG5cdC8vIGBGdW5jdGlvbiNwcm90b3R5cGVgIGlzIG5vbi13cml0YWJsZSBhbmQgbm9uLWNvbmZpZ3VyYWJsZSBzbyBjYW4gbmV2ZXIgYmUgbW9kaWZpZWQuXG5cdGlmIChwcm9wZXJ0eSA9PT0gJ2xlbmd0aCcgfHwgcHJvcGVydHkgPT09ICdwcm90b3R5cGUnKSB7XG5cdFx0cmV0dXJuO1xuXHR9XG5cblx0Ly8gYEZ1bmN0aW9uI2FyZ3VtZW50c2AgYW5kIGBGdW5jdGlvbiNjYWxsZXJgIHNob3VsZCBub3QgYmUgY29waWVkLiBUaGV5IHdlcmUgcmVwb3J0ZWQgdG8gYmUgcHJlc2VudCBpbiBgUmVmbGVjdC5vd25LZXlzYCBmb3Igc29tZSBkZXZpY2VzIGluIFJlYWN0IE5hdGl2ZSAoIzQxKSwgc28gd2UgZXhwbGljaXRseSBpZ25vcmUgdGhlbSBoZXJlLlxuXHRpZiAocHJvcGVydHkgPT09ICdhcmd1bWVudHMnIHx8IHByb3BlcnR5ID09PSAnY2FsbGVyJykge1xuXHRcdHJldHVybjtcblx0fVxuXG5cdGNvbnN0IHRvRGVzY3JpcHRvciA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IodG8sIHByb3BlcnR5KTtcblx0Y29uc3QgZnJvbURlc2NyaXB0b3IgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKGZyb20sIHByb3BlcnR5KTtcblxuXHRpZiAoIWNhbkNvcHlQcm9wZXJ0eSh0b0Rlc2NyaXB0b3IsIGZyb21EZXNjcmlwdG9yKSAmJiBpZ25vcmVOb25Db25maWd1cmFibGUpIHtcblx0XHRyZXR1cm47XG5cdH1cblxuXHRPYmplY3QuZGVmaW5lUHJvcGVydHkodG8sIHByb3BlcnR5LCBmcm9tRGVzY3JpcHRvcik7XG59O1xuXG4vLyBgT2JqZWN0LmRlZmluZVByb3BlcnR5KClgIHRocm93cyBpZiB0aGUgcHJvcGVydHkgZXhpc3RzLCBpcyBub3QgY29uZmlndXJhYmxlIGFuZCBlaXRoZXI6XG4vLyAtIG9uZSBpdHMgZGVzY3JpcHRvcnMgaXMgY2hhbmdlZFxuLy8gLSBpdCBpcyBub24td3JpdGFibGUgYW5kIGl0cyB2YWx1ZSBpcyBjaGFuZ2VkXG5jb25zdCBjYW5Db3B5UHJvcGVydHkgPSBmdW5jdGlvbiAodG9EZXNjcmlwdG9yLCBmcm9tRGVzY3JpcHRvcikge1xuXHRyZXR1cm4gdG9EZXNjcmlwdG9yID09PSB1bmRlZmluZWQgfHwgdG9EZXNjcmlwdG9yLmNvbmZpZ3VyYWJsZSB8fCAoXG5cdFx0dG9EZXNjcmlwdG9yLndyaXRhYmxlID09PSBmcm9tRGVzY3JpcHRvci53cml0YWJsZSAmJlxuXHRcdHRvRGVzY3JpcHRvci5lbnVtZXJhYmxlID09PSBmcm9tRGVzY3JpcHRvci5lbnVtZXJhYmxlICYmXG5cdFx0dG9EZXNjcmlwdG9yLmNvbmZpZ3VyYWJsZSA9PT0gZnJvbURlc2NyaXB0b3IuY29uZmlndXJhYmxlICYmXG5cdFx0KHRvRGVzY3JpcHRvci53cml0YWJsZSB8fCB0b0Rlc2NyaXB0b3IudmFsdWUgPT09IGZyb21EZXNjcmlwdG9yLnZhbHVlKVxuXHQpO1xufTtcblxuY29uc3QgY2hhbmdlUHJvdG90eXBlID0gKHRvLCBmcm9tKSA9PiB7XG5cdGNvbnN0IGZyb21Qcm90b3R5cGUgPSBPYmplY3QuZ2V0UHJvdG90eXBlT2YoZnJvbSk7XG5cdGlmIChmcm9tUHJvdG90eXBlID09PSBPYmplY3QuZ2V0UHJvdG90eXBlT2YodG8pKSB7XG5cdFx0cmV0dXJuO1xuXHR9XG5cblx0T2JqZWN0LnNldFByb3RvdHlwZU9mKHRvLCBmcm9tUHJvdG90eXBlKTtcbn07XG5cbmNvbnN0IHdyYXBwZWRUb1N0cmluZyA9ICh3aXRoTmFtZSwgZnJvbUJvZHkpID0+IGAvKiBXcmFwcGVkICR7d2l0aE5hbWV9Ki9cXG4ke2Zyb21Cb2R5fWA7XG5cbmNvbnN0IHRvU3RyaW5nRGVzY3JpcHRvciA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IoRnVuY3Rpb24ucHJvdG90eXBlLCAndG9TdHJpbmcnKTtcbmNvbnN0IHRvU3RyaW5nTmFtZSA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IoRnVuY3Rpb24ucHJvdG90eXBlLnRvU3RyaW5nLCAnbmFtZScpO1xuXG4vLyBXZSBjYWxsIGBmcm9tLnRvU3RyaW5nKClgIGVhcmx5IChub3QgbGF6aWx5KSB0byBlbnN1cmUgYGZyb21gIGNhbiBiZSBnYXJiYWdlIGNvbGxlY3RlZC5cbi8vIFdlIHVzZSBgYmluZCgpYCBpbnN0ZWFkIG9mIGEgY2xvc3VyZSBmb3IgdGhlIHNhbWUgcmVhc29uLlxuLy8gQ2FsbGluZyBgZnJvbS50b1N0cmluZygpYCBlYXJseSBhbHNvIGFsbG93cyBjYWNoaW5nIGl0IGluIGNhc2UgYHRvLnRvU3RyaW5nKClgIGlzIGNhbGxlZCBzZXZlcmFsIHRpbWVzLlxuY29uc3QgY2hhbmdlVG9TdHJpbmcgPSAodG8sIGZyb20sIG5hbWUpID0+IHtcblx0Y29uc3Qgd2l0aE5hbWUgPSBuYW1lID09PSAnJyA/ICcnIDogYHdpdGggJHtuYW1lLnRyaW0oKX0oKSBgO1xuXHRjb25zdCBuZXdUb1N0cmluZyA9IHdyYXBwZWRUb1N0cmluZy5iaW5kKG51bGwsIHdpdGhOYW1lLCBmcm9tLnRvU3RyaW5nKCkpO1xuXHQvLyBFbnN1cmUgYHRvLnRvU3RyaW5nLnRvU3RyaW5nYCBpcyBub24tZW51bWVyYWJsZSBhbmQgaGFzIHRoZSBzYW1lIGBzYW1lYFxuXHRPYmplY3QuZGVmaW5lUHJvcGVydHkobmV3VG9TdHJpbmcsICduYW1lJywgdG9TdHJpbmdOYW1lKTtcblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KHRvLCAndG9TdHJpbmcnLCB7Li4udG9TdHJpbmdEZXNjcmlwdG9yLCB2YWx1ZTogbmV3VG9TdHJpbmd9KTtcbn07XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIG1pbWljRnVuY3Rpb24odG8sIGZyb20sIHtpZ25vcmVOb25Db25maWd1cmFibGUgPSBmYWxzZX0gPSB7fSkge1xuXHRjb25zdCB7bmFtZX0gPSB0bztcblxuXHRmb3IgKGNvbnN0IHByb3BlcnR5IG9mIFJlZmxlY3Qub3duS2V5cyhmcm9tKSkge1xuXHRcdGNvcHlQcm9wZXJ0eSh0bywgZnJvbSwgcHJvcGVydHksIGlnbm9yZU5vbkNvbmZpZ3VyYWJsZSk7XG5cdH1cblxuXHRjaGFuZ2VQcm90b3R5cGUodG8sIGZyb20pO1xuXHRjaGFuZ2VUb1N0cmluZyh0bywgZnJvbSwgbmFtZSk7XG5cblx0cmV0dXJuIHRvO1xufVxuIiwiaW1wb3J0IG1pbWljRnVuY3Rpb24gZnJvbSAnbWltaWMtZm4nO1xuXG5jb25zdCBjYWxsZWRGdW5jdGlvbnMgPSBuZXcgV2Vha01hcCgpO1xuXG5jb25zdCBvbmV0aW1lID0gKGZ1bmN0aW9uXywgb3B0aW9ucyA9IHt9KSA9PiB7XG5cdGlmICh0eXBlb2YgZnVuY3Rpb25fICE9PSAnZnVuY3Rpb24nKSB7XG5cdFx0dGhyb3cgbmV3IFR5cGVFcnJvcignRXhwZWN0ZWQgYSBmdW5jdGlvbicpO1xuXHR9XG5cblx0bGV0IHJldHVyblZhbHVlO1xuXHRsZXQgY2FsbENvdW50ID0gMDtcblx0Y29uc3QgZnVuY3Rpb25OYW1lID0gZnVuY3Rpb25fLmRpc3BsYXlOYW1lIHx8IGZ1bmN0aW9uXy5uYW1lIHx8ICc8YW5vbnltb3VzPic7XG5cblx0Y29uc3Qgb25ldGltZSA9IGZ1bmN0aW9uICguLi5hcmd1bWVudHNfKSB7XG5cdFx0Y2FsbGVkRnVuY3Rpb25zLnNldChvbmV0aW1lLCArK2NhbGxDb3VudCk7XG5cblx0XHRpZiAoY2FsbENvdW50ID09PSAxKSB7XG5cdFx0XHRyZXR1cm5WYWx1ZSA9IGZ1bmN0aW9uXy5hcHBseSh0aGlzLCBhcmd1bWVudHNfKTtcblx0XHRcdGZ1bmN0aW9uXyA9IG51bGw7XG5cdFx0fSBlbHNlIGlmIChvcHRpb25zLnRocm93ID09PSB0cnVlKSB7XG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoYEZ1bmN0aW9uIFxcYCR7ZnVuY3Rpb25OYW1lfVxcYCBjYW4gb25seSBiZSBjYWxsZWQgb25jZWApO1xuXHRcdH1cblxuXHRcdHJldHVybiByZXR1cm5WYWx1ZTtcblx0fTtcblxuXHRtaW1pY0Z1bmN0aW9uKG9uZXRpbWUsIGZ1bmN0aW9uXyk7XG5cdGNhbGxlZEZ1bmN0aW9ucy5zZXQob25ldGltZSwgY2FsbENvdW50KTtcblxuXHRyZXR1cm4gb25ldGltZTtcbn07XG5cbm9uZXRpbWUuY2FsbENvdW50ID0gZnVuY3Rpb25fID0+IHtcblx0aWYgKCFjYWxsZWRGdW5jdGlvbnMuaGFzKGZ1bmN0aW9uXykpIHtcblx0XHR0aHJvdyBuZXcgRXJyb3IoYFRoZSBnaXZlbiBmdW5jdGlvbiBcXGAke2Z1bmN0aW9uXy5uYW1lfVxcYCBpcyBub3Qgd3JhcHBlZCBieSB0aGUgXFxgb25ldGltZVxcYCBwYWNrYWdlYCk7XG5cdH1cblxuXHRyZXR1cm4gY2FsbGVkRnVuY3Rpb25zLmdldChmdW5jdGlvbl8pO1xufTtcblxuZXhwb3J0IGRlZmF1bHQgb25ldGltZTtcbiIsIlxuZXhwb3J0IGNvbnN0IGdldFJlYWx0aW1lU2lnbmFscz1mdW5jdGlvbigpe1xuY29uc3QgbGVuZ3RoPVNJR1JUTUFYLVNJR1JUTUlOKzE7XG5yZXR1cm4gQXJyYXkuZnJvbSh7bGVuZ3RofSxnZXRSZWFsdGltZVNpZ25hbCk7XG59O1xuXG5jb25zdCBnZXRSZWFsdGltZVNpZ25hbD1mdW5jdGlvbih2YWx1ZSxpbmRleCl7XG5yZXR1cm57XG5uYW1lOmBTSUdSVCR7aW5kZXgrMX1gLFxubnVtYmVyOlNJR1JUTUlOK2luZGV4LFxuYWN0aW9uOlwidGVybWluYXRlXCIsXG5kZXNjcmlwdGlvbjpcIkFwcGxpY2F0aW9uLXNwZWNpZmljIHNpZ25hbCAocmVhbHRpbWUpXCIsXG5zdGFuZGFyZDpcInBvc2l4XCJ9O1xuXG59O1xuXG5jb25zdCBTSUdSVE1JTj0zNDtcbmV4cG9ydCBjb25zdCBTSUdSVE1BWD02NDtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXJlYWx0aW1lLmpzLm1hcCIsIlxuXG5leHBvcnQgY29uc3QgU0lHTkFMUz1bXG57XG5uYW1lOlwiU0lHSFVQXCIsXG5udW1iZXI6MSxcbmFjdGlvbjpcInRlcm1pbmF0ZVwiLFxuZGVzY3JpcHRpb246XCJUZXJtaW5hbCBjbG9zZWRcIixcbnN0YW5kYXJkOlwicG9zaXhcIn0sXG5cbntcbm5hbWU6XCJTSUdJTlRcIixcbm51bWJlcjoyLFxuYWN0aW9uOlwidGVybWluYXRlXCIsXG5kZXNjcmlwdGlvbjpcIlVzZXIgaW50ZXJydXB0aW9uIHdpdGggQ1RSTC1DXCIsXG5zdGFuZGFyZDpcImFuc2lcIn0sXG5cbntcbm5hbWU6XCJTSUdRVUlUXCIsXG5udW1iZXI6MyxcbmFjdGlvbjpcImNvcmVcIixcbmRlc2NyaXB0aW9uOlwiVXNlciBpbnRlcnJ1cHRpb24gd2l0aCBDVFJMLVxcXFxcIixcbnN0YW5kYXJkOlwicG9zaXhcIn0sXG5cbntcbm5hbWU6XCJTSUdJTExcIixcbm51bWJlcjo0LFxuYWN0aW9uOlwiY29yZVwiLFxuZGVzY3JpcHRpb246XCJJbnZhbGlkIG1hY2hpbmUgaW5zdHJ1Y3Rpb25cIixcbnN0YW5kYXJkOlwiYW5zaVwifSxcblxue1xubmFtZTpcIlNJR1RSQVBcIixcbm51bWJlcjo1LFxuYWN0aW9uOlwiY29yZVwiLFxuZGVzY3JpcHRpb246XCJEZWJ1Z2dlciBicmVha3BvaW50XCIsXG5zdGFuZGFyZDpcInBvc2l4XCJ9LFxuXG57XG5uYW1lOlwiU0lHQUJSVFwiLFxubnVtYmVyOjYsXG5hY3Rpb246XCJjb3JlXCIsXG5kZXNjcmlwdGlvbjpcIkFib3J0ZWRcIixcbnN0YW5kYXJkOlwiYW5zaVwifSxcblxue1xubmFtZTpcIlNJR0lPVFwiLFxubnVtYmVyOjYsXG5hY3Rpb246XCJjb3JlXCIsXG5kZXNjcmlwdGlvbjpcIkFib3J0ZWRcIixcbnN0YW5kYXJkOlwiYnNkXCJ9LFxuXG57XG5uYW1lOlwiU0lHQlVTXCIsXG5udW1iZXI6NyxcbmFjdGlvbjpcImNvcmVcIixcbmRlc2NyaXB0aW9uOlxuXCJCdXMgZXJyb3IgZHVlIHRvIG1pc2FsaWduZWQsIG5vbi1leGlzdGluZyBhZGRyZXNzIG9yIHBhZ2luZyBlcnJvclwiLFxuc3RhbmRhcmQ6XCJic2RcIn0sXG5cbntcbm5hbWU6XCJTSUdFTVRcIixcbm51bWJlcjo3LFxuYWN0aW9uOlwidGVybWluYXRlXCIsXG5kZXNjcmlwdGlvbjpcIkNvbW1hbmQgc2hvdWxkIGJlIGVtdWxhdGVkIGJ1dCBpcyBub3QgaW1wbGVtZW50ZWRcIixcbnN0YW5kYXJkOlwib3RoZXJcIn0sXG5cbntcbm5hbWU6XCJTSUdGUEVcIixcbm51bWJlcjo4LFxuYWN0aW9uOlwiY29yZVwiLFxuZGVzY3JpcHRpb246XCJGbG9hdGluZyBwb2ludCBhcml0aG1ldGljIGVycm9yXCIsXG5zdGFuZGFyZDpcImFuc2lcIn0sXG5cbntcbm5hbWU6XCJTSUdLSUxMXCIsXG5udW1iZXI6OSxcbmFjdGlvbjpcInRlcm1pbmF0ZVwiLFxuZGVzY3JpcHRpb246XCJGb3JjZWQgdGVybWluYXRpb25cIixcbnN0YW5kYXJkOlwicG9zaXhcIixcbmZvcmNlZDp0cnVlfSxcblxue1xubmFtZTpcIlNJR1VTUjFcIixcbm51bWJlcjoxMCxcbmFjdGlvbjpcInRlcm1pbmF0ZVwiLFxuZGVzY3JpcHRpb246XCJBcHBsaWNhdGlvbi1zcGVjaWZpYyBzaWduYWxcIixcbnN0YW5kYXJkOlwicG9zaXhcIn0sXG5cbntcbm5hbWU6XCJTSUdTRUdWXCIsXG5udW1iZXI6MTEsXG5hY3Rpb246XCJjb3JlXCIsXG5kZXNjcmlwdGlvbjpcIlNlZ21lbnRhdGlvbiBmYXVsdFwiLFxuc3RhbmRhcmQ6XCJhbnNpXCJ9LFxuXG57XG5uYW1lOlwiU0lHVVNSMlwiLFxubnVtYmVyOjEyLFxuYWN0aW9uOlwidGVybWluYXRlXCIsXG5kZXNjcmlwdGlvbjpcIkFwcGxpY2F0aW9uLXNwZWNpZmljIHNpZ25hbFwiLFxuc3RhbmRhcmQ6XCJwb3NpeFwifSxcblxue1xubmFtZTpcIlNJR1BJUEVcIixcbm51bWJlcjoxMyxcbmFjdGlvbjpcInRlcm1pbmF0ZVwiLFxuZGVzY3JpcHRpb246XCJCcm9rZW4gcGlwZSBvciBzb2NrZXRcIixcbnN0YW5kYXJkOlwicG9zaXhcIn0sXG5cbntcbm5hbWU6XCJTSUdBTFJNXCIsXG5udW1iZXI6MTQsXG5hY3Rpb246XCJ0ZXJtaW5hdGVcIixcbmRlc2NyaXB0aW9uOlwiVGltZW91dCBvciB0aW1lclwiLFxuc3RhbmRhcmQ6XCJwb3NpeFwifSxcblxue1xubmFtZTpcIlNJR1RFUk1cIixcbm51bWJlcjoxNSxcbmFjdGlvbjpcInRlcm1pbmF0ZVwiLFxuZGVzY3JpcHRpb246XCJUZXJtaW5hdGlvblwiLFxuc3RhbmRhcmQ6XCJhbnNpXCJ9LFxuXG57XG5uYW1lOlwiU0lHU1RLRkxUXCIsXG5udW1iZXI6MTYsXG5hY3Rpb246XCJ0ZXJtaW5hdGVcIixcbmRlc2NyaXB0aW9uOlwiU3RhY2sgaXMgZW1wdHkgb3Igb3ZlcmZsb3dlZFwiLFxuc3RhbmRhcmQ6XCJvdGhlclwifSxcblxue1xubmFtZTpcIlNJR0NITERcIixcbm51bWJlcjoxNyxcbmFjdGlvbjpcImlnbm9yZVwiLFxuZGVzY3JpcHRpb246XCJDaGlsZCBwcm9jZXNzIHRlcm1pbmF0ZWQsIHBhdXNlZCBvciB1bnBhdXNlZFwiLFxuc3RhbmRhcmQ6XCJwb3NpeFwifSxcblxue1xubmFtZTpcIlNJR0NMRFwiLFxubnVtYmVyOjE3LFxuYWN0aW9uOlwiaWdub3JlXCIsXG5kZXNjcmlwdGlvbjpcIkNoaWxkIHByb2Nlc3MgdGVybWluYXRlZCwgcGF1c2VkIG9yIHVucGF1c2VkXCIsXG5zdGFuZGFyZDpcIm90aGVyXCJ9LFxuXG57XG5uYW1lOlwiU0lHQ09OVFwiLFxubnVtYmVyOjE4LFxuYWN0aW9uOlwidW5wYXVzZVwiLFxuZGVzY3JpcHRpb246XCJVbnBhdXNlZFwiLFxuc3RhbmRhcmQ6XCJwb3NpeFwiLFxuZm9yY2VkOnRydWV9LFxuXG57XG5uYW1lOlwiU0lHU1RPUFwiLFxubnVtYmVyOjE5LFxuYWN0aW9uOlwicGF1c2VcIixcbmRlc2NyaXB0aW9uOlwiUGF1c2VkXCIsXG5zdGFuZGFyZDpcInBvc2l4XCIsXG5mb3JjZWQ6dHJ1ZX0sXG5cbntcbm5hbWU6XCJTSUdUU1RQXCIsXG5udW1iZXI6MjAsXG5hY3Rpb246XCJwYXVzZVwiLFxuZGVzY3JpcHRpb246XCJQYXVzZWQgdXNpbmcgQ1RSTC1aIG9yIFxcXCJzdXNwZW5kXFxcIlwiLFxuc3RhbmRhcmQ6XCJwb3NpeFwifSxcblxue1xubmFtZTpcIlNJR1RUSU5cIixcbm51bWJlcjoyMSxcbmFjdGlvbjpcInBhdXNlXCIsXG5kZXNjcmlwdGlvbjpcIkJhY2tncm91bmQgcHJvY2VzcyBjYW5ub3QgcmVhZCB0ZXJtaW5hbCBpbnB1dFwiLFxuc3RhbmRhcmQ6XCJwb3NpeFwifSxcblxue1xubmFtZTpcIlNJR0JSRUFLXCIsXG5udW1iZXI6MjEsXG5hY3Rpb246XCJ0ZXJtaW5hdGVcIixcbmRlc2NyaXB0aW9uOlwiVXNlciBpbnRlcnJ1cHRpb24gd2l0aCBDVFJMLUJSRUFLXCIsXG5zdGFuZGFyZDpcIm90aGVyXCJ9LFxuXG57XG5uYW1lOlwiU0lHVFRPVVwiLFxubnVtYmVyOjIyLFxuYWN0aW9uOlwicGF1c2VcIixcbmRlc2NyaXB0aW9uOlwiQmFja2dyb3VuZCBwcm9jZXNzIGNhbm5vdCB3cml0ZSB0byB0ZXJtaW5hbCBvdXRwdXRcIixcbnN0YW5kYXJkOlwicG9zaXhcIn0sXG5cbntcbm5hbWU6XCJTSUdVUkdcIixcbm51bWJlcjoyMyxcbmFjdGlvbjpcImlnbm9yZVwiLFxuZGVzY3JpcHRpb246XCJTb2NrZXQgcmVjZWl2ZWQgb3V0LW9mLWJhbmQgZGF0YVwiLFxuc3RhbmRhcmQ6XCJic2RcIn0sXG5cbntcbm5hbWU6XCJTSUdYQ1BVXCIsXG5udW1iZXI6MjQsXG5hY3Rpb246XCJjb3JlXCIsXG5kZXNjcmlwdGlvbjpcIlByb2Nlc3MgdGltZWQgb3V0XCIsXG5zdGFuZGFyZDpcImJzZFwifSxcblxue1xubmFtZTpcIlNJR1hGU1pcIixcbm51bWJlcjoyNSxcbmFjdGlvbjpcImNvcmVcIixcbmRlc2NyaXB0aW9uOlwiRmlsZSB0b28gYmlnXCIsXG5zdGFuZGFyZDpcImJzZFwifSxcblxue1xubmFtZTpcIlNJR1ZUQUxSTVwiLFxubnVtYmVyOjI2LFxuYWN0aW9uOlwidGVybWluYXRlXCIsXG5kZXNjcmlwdGlvbjpcIlRpbWVvdXQgb3IgdGltZXJcIixcbnN0YW5kYXJkOlwiYnNkXCJ9LFxuXG57XG5uYW1lOlwiU0lHUFJPRlwiLFxubnVtYmVyOjI3LFxuYWN0aW9uOlwidGVybWluYXRlXCIsXG5kZXNjcmlwdGlvbjpcIlRpbWVvdXQgb3IgdGltZXJcIixcbnN0YW5kYXJkOlwiYnNkXCJ9LFxuXG57XG5uYW1lOlwiU0lHV0lOQ0hcIixcbm51bWJlcjoyOCxcbmFjdGlvbjpcImlnbm9yZVwiLFxuZGVzY3JpcHRpb246XCJUZXJtaW5hbCB3aW5kb3cgc2l6ZSBjaGFuZ2VkXCIsXG5zdGFuZGFyZDpcImJzZFwifSxcblxue1xubmFtZTpcIlNJR0lPXCIsXG5udW1iZXI6MjksXG5hY3Rpb246XCJ0ZXJtaW5hdGVcIixcbmRlc2NyaXB0aW9uOlwiSS9PIGlzIGF2YWlsYWJsZVwiLFxuc3RhbmRhcmQ6XCJvdGhlclwifSxcblxue1xubmFtZTpcIlNJR1BPTExcIixcbm51bWJlcjoyOSxcbmFjdGlvbjpcInRlcm1pbmF0ZVwiLFxuZGVzY3JpcHRpb246XCJXYXRjaGVkIGV2ZW50XCIsXG5zdGFuZGFyZDpcIm90aGVyXCJ9LFxuXG57XG5uYW1lOlwiU0lHSU5GT1wiLFxubnVtYmVyOjI5LFxuYWN0aW9uOlwiaWdub3JlXCIsXG5kZXNjcmlwdGlvbjpcIlJlcXVlc3QgZm9yIHByb2Nlc3MgaW5mb3JtYXRpb25cIixcbnN0YW5kYXJkOlwib3RoZXJcIn0sXG5cbntcbm5hbWU6XCJTSUdQV1JcIixcbm51bWJlcjozMCxcbmFjdGlvbjpcInRlcm1pbmF0ZVwiLFxuZGVzY3JpcHRpb246XCJEZXZpY2UgcnVubmluZyBvdXQgb2YgcG93ZXJcIixcbnN0YW5kYXJkOlwic3lzdGVtdlwifSxcblxue1xubmFtZTpcIlNJR1NZU1wiLFxubnVtYmVyOjMxLFxuYWN0aW9uOlwiY29yZVwiLFxuZGVzY3JpcHRpb246XCJJbnZhbGlkIHN5c3RlbSBjYWxsXCIsXG5zdGFuZGFyZDpcIm90aGVyXCJ9LFxuXG57XG5uYW1lOlwiU0lHVU5VU0VEXCIsXG5udW1iZXI6MzEsXG5hY3Rpb246XCJ0ZXJtaW5hdGVcIixcbmRlc2NyaXB0aW9uOlwiSW52YWxpZCBzeXN0ZW0gY2FsbFwiLFxuc3RhbmRhcmQ6XCJvdGhlclwifV07XG4vLyMgc291cmNlTWFwcGluZ1VSTD1jb3JlLmpzLm1hcCIsImltcG9ydHtjb25zdGFudHN9ZnJvbVwib3NcIjtcblxuaW1wb3J0e1NJR05BTFN9ZnJvbVwiLi9jb3JlLmpzXCI7XG5pbXBvcnR7Z2V0UmVhbHRpbWVTaWduYWxzfWZyb21cIi4vcmVhbHRpbWUuanNcIjtcblxuXG5cbmV4cG9ydCBjb25zdCBnZXRTaWduYWxzPWZ1bmN0aW9uKCl7XG5jb25zdCByZWFsdGltZVNpZ25hbHM9Z2V0UmVhbHRpbWVTaWduYWxzKCk7XG5jb25zdCBzaWduYWxzPVsuLi5TSUdOQUxTLC4uLnJlYWx0aW1lU2lnbmFsc10ubWFwKG5vcm1hbGl6ZVNpZ25hbCk7XG5yZXR1cm4gc2lnbmFscztcbn07XG5cblxuXG5cblxuXG5cbmNvbnN0IG5vcm1hbGl6ZVNpZ25hbD1mdW5jdGlvbih7XG5uYW1lLFxubnVtYmVyOmRlZmF1bHROdW1iZXIsXG5kZXNjcmlwdGlvbixcbmFjdGlvbixcbmZvcmNlZD1mYWxzZSxcbnN0YW5kYXJkfSlcbntcbmNvbnN0e1xuc2lnbmFsczp7W25hbWVdOmNvbnN0YW50U2lnbmFsfX09XG5jb25zdGFudHM7XG5jb25zdCBzdXBwb3J0ZWQ9Y29uc3RhbnRTaWduYWwhPT11bmRlZmluZWQ7XG5jb25zdCBudW1iZXI9c3VwcG9ydGVkP2NvbnN0YW50U2lnbmFsOmRlZmF1bHROdW1iZXI7XG5yZXR1cm57bmFtZSxudW1iZXIsZGVzY3JpcHRpb24sc3VwcG9ydGVkLGFjdGlvbixmb3JjZWQsc3RhbmRhcmR9O1xufTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXNpZ25hbHMuanMubWFwIiwiaW1wb3J0e2NvbnN0YW50c31mcm9tXCJvc1wiO1xuXG5pbXBvcnR7U0lHUlRNQVh9ZnJvbVwiLi9yZWFsdGltZS5qc1wiO1xuaW1wb3J0e2dldFNpZ25hbHN9ZnJvbVwiLi9zaWduYWxzLmpzXCI7XG5cblxuXG5jb25zdCBnZXRTaWduYWxzQnlOYW1lPWZ1bmN0aW9uKCl7XG5jb25zdCBzaWduYWxzPWdldFNpZ25hbHMoKTtcbnJldHVybiBzaWduYWxzLnJlZHVjZShnZXRTaWduYWxCeU5hbWUse30pO1xufTtcblxuY29uc3QgZ2V0U2lnbmFsQnlOYW1lPWZ1bmN0aW9uKFxuc2lnbmFsQnlOYW1lTWVtbyxcbntuYW1lLG51bWJlcixkZXNjcmlwdGlvbixzdXBwb3J0ZWQsYWN0aW9uLGZvcmNlZCxzdGFuZGFyZH0pXG57XG5yZXR1cm57XG4uLi5zaWduYWxCeU5hbWVNZW1vLFxuW25hbWVdOntuYW1lLG51bWJlcixkZXNjcmlwdGlvbixzdXBwb3J0ZWQsYWN0aW9uLGZvcmNlZCxzdGFuZGFyZH19O1xuXG59O1xuXG5leHBvcnQgY29uc3Qgc2lnbmFsc0J5TmFtZT1nZXRTaWduYWxzQnlOYW1lKCk7XG5cblxuXG5cbmNvbnN0IGdldFNpZ25hbHNCeU51bWJlcj1mdW5jdGlvbigpe1xuY29uc3Qgc2lnbmFscz1nZXRTaWduYWxzKCk7XG5jb25zdCBsZW5ndGg9U0lHUlRNQVgrMTtcbmNvbnN0IHNpZ25hbHNBPUFycmF5LmZyb20oe2xlbmd0aH0sKHZhbHVlLG51bWJlcik9PlxuZ2V0U2lnbmFsQnlOdW1iZXIobnVtYmVyLHNpZ25hbHMpKTtcblxucmV0dXJuIE9iamVjdC5hc3NpZ24oe30sLi4uc2lnbmFsc0EpO1xufTtcblxuY29uc3QgZ2V0U2lnbmFsQnlOdW1iZXI9ZnVuY3Rpb24obnVtYmVyLHNpZ25hbHMpe1xuY29uc3Qgc2lnbmFsPWZpbmRTaWduYWxCeU51bWJlcihudW1iZXIsc2lnbmFscyk7XG5cbmlmKHNpZ25hbD09PXVuZGVmaW5lZCl7XG5yZXR1cm57fTtcbn1cblxuY29uc3R7bmFtZSxkZXNjcmlwdGlvbixzdXBwb3J0ZWQsYWN0aW9uLGZvcmNlZCxzdGFuZGFyZH09c2lnbmFsO1xucmV0dXJue1xuW251bWJlcl06e1xubmFtZSxcbm51bWJlcixcbmRlc2NyaXB0aW9uLFxuc3VwcG9ydGVkLFxuYWN0aW9uLFxuZm9yY2VkLFxuc3RhbmRhcmR9fTtcblxuXG59O1xuXG5cblxuY29uc3QgZmluZFNpZ25hbEJ5TnVtYmVyPWZ1bmN0aW9uKG51bWJlcixzaWduYWxzKXtcbmNvbnN0IHNpZ25hbD1zaWduYWxzLmZpbmQoKHtuYW1lfSk9PmNvbnN0YW50cy5zaWduYWxzW25hbWVdPT09bnVtYmVyKTtcblxuaWYoc2lnbmFsIT09dW5kZWZpbmVkKXtcbnJldHVybiBzaWduYWw7XG59XG5cbnJldHVybiBzaWduYWxzLmZpbmQoKHNpZ25hbEEpPT5zaWduYWxBLm51bWJlcj09PW51bWJlcik7XG59O1xuXG5leHBvcnQgY29uc3Qgc2lnbmFsc0J5TnVtYmVyPWdldFNpZ25hbHNCeU51bWJlcigpO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9bWFpbi5qcy5tYXAiLCJpbXBvcnQge3NpZ25hbHNCeU5hbWV9IGZyb20gJ2h1bWFuLXNpZ25hbHMnO1xuXG5jb25zdCBnZXRFcnJvclByZWZpeCA9ICh7dGltZWRPdXQsIHRpbWVvdXQsIGVycm9yQ29kZSwgc2lnbmFsLCBzaWduYWxEZXNjcmlwdGlvbiwgZXhpdENvZGUsIGlzQ2FuY2VsZWR9KSA9PiB7XG5cdGlmICh0aW1lZE91dCkge1xuXHRcdHJldHVybiBgdGltZWQgb3V0IGFmdGVyICR7dGltZW91dH0gbWlsbGlzZWNvbmRzYDtcblx0fVxuXG5cdGlmIChpc0NhbmNlbGVkKSB7XG5cdFx0cmV0dXJuICd3YXMgY2FuY2VsZWQnO1xuXHR9XG5cblx0aWYgKGVycm9yQ29kZSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0cmV0dXJuIGBmYWlsZWQgd2l0aCAke2Vycm9yQ29kZX1gO1xuXHR9XG5cblx0aWYgKHNpZ25hbCAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0cmV0dXJuIGB3YXMga2lsbGVkIHdpdGggJHtzaWduYWx9ICgke3NpZ25hbERlc2NyaXB0aW9ufSlgO1xuXHR9XG5cblx0aWYgKGV4aXRDb2RlICE9PSB1bmRlZmluZWQpIHtcblx0XHRyZXR1cm4gYGZhaWxlZCB3aXRoIGV4aXQgY29kZSAke2V4aXRDb2RlfWA7XG5cdH1cblxuXHRyZXR1cm4gJ2ZhaWxlZCc7XG59O1xuXG5leHBvcnQgY29uc3QgbWFrZUVycm9yID0gKHtcblx0c3Rkb3V0LFxuXHRzdGRlcnIsXG5cdGFsbCxcblx0ZXJyb3IsXG5cdHNpZ25hbCxcblx0ZXhpdENvZGUsXG5cdGNvbW1hbmQsXG5cdGVzY2FwZWRDb21tYW5kLFxuXHR0aW1lZE91dCxcblx0aXNDYW5jZWxlZCxcblx0a2lsbGVkLFxuXHRwYXJzZWQ6IHtvcHRpb25zOiB7dGltZW91dH19LFxufSkgPT4ge1xuXHQvLyBgc2lnbmFsYCBhbmQgYGV4aXRDb2RlYCBlbWl0dGVkIG9uIGBzcGF3bmVkLm9uKCdleGl0JylgIGV2ZW50IGNhbiBiZSBgbnVsbGAuXG5cdC8vIFdlIG5vcm1hbGl6ZSB0aGVtIHRvIGB1bmRlZmluZWRgXG5cdGV4aXRDb2RlID0gZXhpdENvZGUgPT09IG51bGwgPyB1bmRlZmluZWQgOiBleGl0Q29kZTtcblx0c2lnbmFsID0gc2lnbmFsID09PSBudWxsID8gdW5kZWZpbmVkIDogc2lnbmFsO1xuXHRjb25zdCBzaWduYWxEZXNjcmlwdGlvbiA9IHNpZ25hbCA9PT0gdW5kZWZpbmVkID8gdW5kZWZpbmVkIDogc2lnbmFsc0J5TmFtZVtzaWduYWxdLmRlc2NyaXB0aW9uO1xuXG5cdGNvbnN0IGVycm9yQ29kZSA9IGVycm9yICYmIGVycm9yLmNvZGU7XG5cblx0Y29uc3QgcHJlZml4ID0gZ2V0RXJyb3JQcmVmaXgoe3RpbWVkT3V0LCB0aW1lb3V0LCBlcnJvckNvZGUsIHNpZ25hbCwgc2lnbmFsRGVzY3JpcHRpb24sIGV4aXRDb2RlLCBpc0NhbmNlbGVkfSk7XG5cdGNvbnN0IGV4ZWNhTWVzc2FnZSA9IGBDb21tYW5kICR7cHJlZml4fTogJHtjb21tYW5kfWA7XG5cdGNvbnN0IGlzRXJyb3IgPSBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwoZXJyb3IpID09PSAnW29iamVjdCBFcnJvcl0nO1xuXHRjb25zdCBzaG9ydE1lc3NhZ2UgPSBpc0Vycm9yID8gYCR7ZXhlY2FNZXNzYWdlfVxcbiR7ZXJyb3IubWVzc2FnZX1gIDogZXhlY2FNZXNzYWdlO1xuXHRjb25zdCBtZXNzYWdlID0gW3Nob3J0TWVzc2FnZSwgc3RkZXJyLCBzdGRvdXRdLmZpbHRlcihCb29sZWFuKS5qb2luKCdcXG4nKTtcblxuXHRpZiAoaXNFcnJvcikge1xuXHRcdGVycm9yLm9yaWdpbmFsTWVzc2FnZSA9IGVycm9yLm1lc3NhZ2U7XG5cdFx0ZXJyb3IubWVzc2FnZSA9IG1lc3NhZ2U7XG5cdH0gZWxzZSB7XG5cdFx0ZXJyb3IgPSBuZXcgRXJyb3IobWVzc2FnZSk7XG5cdH1cblxuXHRlcnJvci5zaG9ydE1lc3NhZ2UgPSBzaG9ydE1lc3NhZ2U7XG5cdGVycm9yLmNvbW1hbmQgPSBjb21tYW5kO1xuXHRlcnJvci5lc2NhcGVkQ29tbWFuZCA9IGVzY2FwZWRDb21tYW5kO1xuXHRlcnJvci5leGl0Q29kZSA9IGV4aXRDb2RlO1xuXHRlcnJvci5zaWduYWwgPSBzaWduYWw7XG5cdGVycm9yLnNpZ25hbERlc2NyaXB0aW9uID0gc2lnbmFsRGVzY3JpcHRpb247XG5cdGVycm9yLnN0ZG91dCA9IHN0ZG91dDtcblx0ZXJyb3Iuc3RkZXJyID0gc3RkZXJyO1xuXG5cdGlmIChhbGwgIT09IHVuZGVmaW5lZCkge1xuXHRcdGVycm9yLmFsbCA9IGFsbDtcblx0fVxuXG5cdGlmICgnYnVmZmVyZWREYXRhJyBpbiBlcnJvcikge1xuXHRcdGRlbGV0ZSBlcnJvci5idWZmZXJlZERhdGE7XG5cdH1cblxuXHRlcnJvci5mYWlsZWQgPSB0cnVlO1xuXHRlcnJvci50aW1lZE91dCA9IEJvb2xlYW4odGltZWRPdXQpO1xuXHRlcnJvci5pc0NhbmNlbGVkID0gaXNDYW5jZWxlZDtcblx0ZXJyb3Iua2lsbGVkID0ga2lsbGVkICYmICF0aW1lZE91dDtcblxuXHRyZXR1cm4gZXJyb3I7XG59O1xuIiwiY29uc3QgYWxpYXNlcyA9IFsnc3RkaW4nLCAnc3Rkb3V0JywgJ3N0ZGVyciddO1xuXG5jb25zdCBoYXNBbGlhcyA9IG9wdGlvbnMgPT4gYWxpYXNlcy5zb21lKGFsaWFzID0+IG9wdGlvbnNbYWxpYXNdICE9PSB1bmRlZmluZWQpO1xuXG5leHBvcnQgY29uc3Qgbm9ybWFsaXplU3RkaW8gPSBvcHRpb25zID0+IHtcblx0aWYgKCFvcHRpb25zKSB7XG5cdFx0cmV0dXJuO1xuXHR9XG5cblx0Y29uc3Qge3N0ZGlvfSA9IG9wdGlvbnM7XG5cblx0aWYgKHN0ZGlvID09PSB1bmRlZmluZWQpIHtcblx0XHRyZXR1cm4gYWxpYXNlcy5tYXAoYWxpYXMgPT4gb3B0aW9uc1thbGlhc10pO1xuXHR9XG5cblx0aWYgKGhhc0FsaWFzKG9wdGlvbnMpKSB7XG5cdFx0dGhyb3cgbmV3IEVycm9yKGBJdCdzIG5vdCBwb3NzaWJsZSB0byBwcm92aWRlIFxcYHN0ZGlvXFxgIGluIGNvbWJpbmF0aW9uIHdpdGggb25lIG9mICR7YWxpYXNlcy5tYXAoYWxpYXMgPT4gYFxcYCR7YWxpYXN9XFxgYCkuam9pbignLCAnKX1gKTtcblx0fVxuXG5cdGlmICh0eXBlb2Ygc3RkaW8gPT09ICdzdHJpbmcnKSB7XG5cdFx0cmV0dXJuIHN0ZGlvO1xuXHR9XG5cblx0aWYgKCFBcnJheS5pc0FycmF5KHN0ZGlvKSkge1xuXHRcdHRocm93IG5ldyBUeXBlRXJyb3IoYEV4cGVjdGVkIFxcYHN0ZGlvXFxgIHRvIGJlIG9mIHR5cGUgXFxgc3RyaW5nXFxgIG9yIFxcYEFycmF5XFxgLCBnb3QgXFxgJHt0eXBlb2Ygc3RkaW99XFxgYCk7XG5cdH1cblxuXHRjb25zdCBsZW5ndGggPSBNYXRoLm1heChzdGRpby5sZW5ndGgsIGFsaWFzZXMubGVuZ3RoKTtcblx0cmV0dXJuIEFycmF5LmZyb20oe2xlbmd0aH0sICh2YWx1ZSwgaW5kZXgpID0+IHN0ZGlvW2luZGV4XSk7XG59O1xuXG4vLyBgaXBjYCBpcyBwdXNoZWQgdW5sZXNzIGl0IGlzIGFscmVhZHkgcHJlc2VudFxuZXhwb3J0IGNvbnN0IG5vcm1hbGl6ZVN0ZGlvTm9kZSA9IG9wdGlvbnMgPT4ge1xuXHRjb25zdCBzdGRpbyA9IG5vcm1hbGl6ZVN0ZGlvKG9wdGlvbnMpO1xuXG5cdGlmIChzdGRpbyA9PT0gJ2lwYycpIHtcblx0XHRyZXR1cm4gJ2lwYyc7XG5cdH1cblxuXHRpZiAoc3RkaW8gPT09IHVuZGVmaW5lZCB8fCB0eXBlb2Ygc3RkaW8gPT09ICdzdHJpbmcnKSB7XG5cdFx0cmV0dXJuIFtzdGRpbywgc3RkaW8sIHN0ZGlvLCAnaXBjJ107XG5cdH1cblxuXHRpZiAoc3RkaW8uaW5jbHVkZXMoJ2lwYycpKSB7XG5cdFx0cmV0dXJuIHN0ZGlvO1xuXHR9XG5cblx0cmV0dXJuIFsuLi5zdGRpbywgJ2lwYyddO1xufTtcbiIsImltcG9ydCBvcyBmcm9tICdub2RlOm9zJztcbmltcG9ydCBvbkV4aXQgZnJvbSAnc2lnbmFsLWV4aXQnO1xuXG5jb25zdCBERUZBVUxUX0ZPUkNFX0tJTExfVElNRU9VVCA9IDEwMDAgKiA1O1xuXG4vLyBNb25rZXktcGF0Y2hlcyBgY2hpbGRQcm9jZXNzLmtpbGwoKWAgdG8gYWRkIGBmb3JjZUtpbGxBZnRlclRpbWVvdXRgIGJlaGF2aW9yXG5leHBvcnQgY29uc3Qgc3Bhd25lZEtpbGwgPSAoa2lsbCwgc2lnbmFsID0gJ1NJR1RFUk0nLCBvcHRpb25zID0ge30pID0+IHtcblx0Y29uc3Qga2lsbFJlc3VsdCA9IGtpbGwoc2lnbmFsKTtcblx0c2V0S2lsbFRpbWVvdXQoa2lsbCwgc2lnbmFsLCBvcHRpb25zLCBraWxsUmVzdWx0KTtcblx0cmV0dXJuIGtpbGxSZXN1bHQ7XG59O1xuXG5jb25zdCBzZXRLaWxsVGltZW91dCA9IChraWxsLCBzaWduYWwsIG9wdGlvbnMsIGtpbGxSZXN1bHQpID0+IHtcblx0aWYgKCFzaG91bGRGb3JjZUtpbGwoc2lnbmFsLCBvcHRpb25zLCBraWxsUmVzdWx0KSkge1xuXHRcdHJldHVybjtcblx0fVxuXG5cdGNvbnN0IHRpbWVvdXQgPSBnZXRGb3JjZUtpbGxBZnRlclRpbWVvdXQob3B0aW9ucyk7XG5cdGNvbnN0IHQgPSBzZXRUaW1lb3V0KCgpID0+IHtcblx0XHRraWxsKCdTSUdLSUxMJyk7XG5cdH0sIHRpbWVvdXQpO1xuXG5cdC8vIEd1YXJkZWQgYmVjYXVzZSB0aGVyZSdzIG5vIGAudW5yZWYoKWAgd2hlbiBgZXhlY2FgIGlzIHVzZWQgaW4gdGhlIHJlbmRlcmVyXG5cdC8vIHByb2Nlc3MgaW4gRWxlY3Ryb24uIFRoaXMgY2Fubm90IGJlIHRlc3RlZCBzaW5jZSB3ZSBkb24ndCBydW4gdGVzdHMgaW5cblx0Ly8gRWxlY3Ryb24uXG5cdC8vIGlzdGFuYnVsIGlnbm9yZSBlbHNlXG5cdGlmICh0LnVucmVmKSB7XG5cdFx0dC51bnJlZigpO1xuXHR9XG59O1xuXG5jb25zdCBzaG91bGRGb3JjZUtpbGwgPSAoc2lnbmFsLCB7Zm9yY2VLaWxsQWZ0ZXJUaW1lb3V0fSwga2lsbFJlc3VsdCkgPT4gaXNTaWd0ZXJtKHNpZ25hbCkgJiYgZm9yY2VLaWxsQWZ0ZXJUaW1lb3V0ICE9PSBmYWxzZSAmJiBraWxsUmVzdWx0O1xuXG5jb25zdCBpc1NpZ3Rlcm0gPSBzaWduYWwgPT4gc2lnbmFsID09PSBvcy5jb25zdGFudHMuc2lnbmFscy5TSUdURVJNXG5cdFx0fHwgKHR5cGVvZiBzaWduYWwgPT09ICdzdHJpbmcnICYmIHNpZ25hbC50b1VwcGVyQ2FzZSgpID09PSAnU0lHVEVSTScpO1xuXG5jb25zdCBnZXRGb3JjZUtpbGxBZnRlclRpbWVvdXQgPSAoe2ZvcmNlS2lsbEFmdGVyVGltZW91dCA9IHRydWV9KSA9PiB7XG5cdGlmIChmb3JjZUtpbGxBZnRlclRpbWVvdXQgPT09IHRydWUpIHtcblx0XHRyZXR1cm4gREVGQVVMVF9GT1JDRV9LSUxMX1RJTUVPVVQ7XG5cdH1cblxuXHRpZiAoIU51bWJlci5pc0Zpbml0ZShmb3JjZUtpbGxBZnRlclRpbWVvdXQpIHx8IGZvcmNlS2lsbEFmdGVyVGltZW91dCA8IDApIHtcblx0XHR0aHJvdyBuZXcgVHlwZUVycm9yKGBFeHBlY3RlZCB0aGUgXFxgZm9yY2VLaWxsQWZ0ZXJUaW1lb3V0XFxgIG9wdGlvbiB0byBiZSBhIG5vbi1uZWdhdGl2ZSBpbnRlZ2VyLCBnb3QgXFxgJHtmb3JjZUtpbGxBZnRlclRpbWVvdXR9XFxgICgke3R5cGVvZiBmb3JjZUtpbGxBZnRlclRpbWVvdXR9KWApO1xuXHR9XG5cblx0cmV0dXJuIGZvcmNlS2lsbEFmdGVyVGltZW91dDtcbn07XG5cbi8vIGBjaGlsZFByb2Nlc3MuY2FuY2VsKClgXG5leHBvcnQgY29uc3Qgc3Bhd25lZENhbmNlbCA9IChzcGF3bmVkLCBjb250ZXh0KSA9PiB7XG5cdGNvbnN0IGtpbGxSZXN1bHQgPSBzcGF3bmVkLmtpbGwoKTtcblxuXHRpZiAoa2lsbFJlc3VsdCkge1xuXHRcdGNvbnRleHQuaXNDYW5jZWxlZCA9IHRydWU7XG5cdH1cbn07XG5cbmNvbnN0IHRpbWVvdXRLaWxsID0gKHNwYXduZWQsIHNpZ25hbCwgcmVqZWN0KSA9PiB7XG5cdHNwYXduZWQua2lsbChzaWduYWwpO1xuXHRyZWplY3QoT2JqZWN0LmFzc2lnbihuZXcgRXJyb3IoJ1RpbWVkIG91dCcpLCB7dGltZWRPdXQ6IHRydWUsIHNpZ25hbH0pKTtcbn07XG5cbi8vIGB0aW1lb3V0YCBvcHRpb24gaGFuZGxpbmdcbmV4cG9ydCBjb25zdCBzZXR1cFRpbWVvdXQgPSAoc3Bhd25lZCwge3RpbWVvdXQsIGtpbGxTaWduYWwgPSAnU0lHVEVSTSd9LCBzcGF3bmVkUHJvbWlzZSkgPT4ge1xuXHRpZiAodGltZW91dCA9PT0gMCB8fCB0aW1lb3V0ID09PSB1bmRlZmluZWQpIHtcblx0XHRyZXR1cm4gc3Bhd25lZFByb21pc2U7XG5cdH1cblxuXHRsZXQgdGltZW91dElkO1xuXHRjb25zdCB0aW1lb3V0UHJvbWlzZSA9IG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcblx0XHR0aW1lb3V0SWQgPSBzZXRUaW1lb3V0KCgpID0+IHtcblx0XHRcdHRpbWVvdXRLaWxsKHNwYXduZWQsIGtpbGxTaWduYWwsIHJlamVjdCk7XG5cdFx0fSwgdGltZW91dCk7XG5cdH0pO1xuXG5cdGNvbnN0IHNhZmVTcGF3bmVkUHJvbWlzZSA9IHNwYXduZWRQcm9taXNlLmZpbmFsbHkoKCkgPT4ge1xuXHRcdGNsZWFyVGltZW91dCh0aW1lb3V0SWQpO1xuXHR9KTtcblxuXHRyZXR1cm4gUHJvbWlzZS5yYWNlKFt0aW1lb3V0UHJvbWlzZSwgc2FmZVNwYXduZWRQcm9taXNlXSk7XG59O1xuXG5leHBvcnQgY29uc3QgdmFsaWRhdGVUaW1lb3V0ID0gKHt0aW1lb3V0fSkgPT4ge1xuXHRpZiAodGltZW91dCAhPT0gdW5kZWZpbmVkICYmICghTnVtYmVyLmlzRmluaXRlKHRpbWVvdXQpIHx8IHRpbWVvdXQgPCAwKSkge1xuXHRcdHRocm93IG5ldyBUeXBlRXJyb3IoYEV4cGVjdGVkIHRoZSBcXGB0aW1lb3V0XFxgIG9wdGlvbiB0byBiZSBhIG5vbi1uZWdhdGl2ZSBpbnRlZ2VyLCBnb3QgXFxgJHt0aW1lb3V0fVxcYCAoJHt0eXBlb2YgdGltZW91dH0pYCk7XG5cdH1cbn07XG5cbi8vIGBjbGVhbnVwYCBvcHRpb24gaGFuZGxpbmdcbmV4cG9ydCBjb25zdCBzZXRFeGl0SGFuZGxlciA9IGFzeW5jIChzcGF3bmVkLCB7Y2xlYW51cCwgZGV0YWNoZWR9LCB0aW1lZFByb21pc2UpID0+IHtcblx0aWYgKCFjbGVhbnVwIHx8IGRldGFjaGVkKSB7XG5cdFx0cmV0dXJuIHRpbWVkUHJvbWlzZTtcblx0fVxuXG5cdGNvbnN0IHJlbW92ZUV4aXRIYW5kbGVyID0gb25FeGl0KCgpID0+IHtcblx0XHRzcGF3bmVkLmtpbGwoKTtcblx0fSk7XG5cblx0cmV0dXJuIHRpbWVkUHJvbWlzZS5maW5hbGx5KCgpID0+IHtcblx0XHRyZW1vdmVFeGl0SGFuZGxlcigpO1xuXHR9KTtcbn07XG4iLCJleHBvcnQgZnVuY3Rpb24gaXNTdHJlYW0oc3RyZWFtKSB7XG5cdHJldHVybiBzdHJlYW0gIT09IG51bGxcblx0XHQmJiB0eXBlb2Ygc3RyZWFtID09PSAnb2JqZWN0J1xuXHRcdCYmIHR5cGVvZiBzdHJlYW0ucGlwZSA9PT0gJ2Z1bmN0aW9uJztcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzV3JpdGFibGVTdHJlYW0oc3RyZWFtKSB7XG5cdHJldHVybiBpc1N0cmVhbShzdHJlYW0pXG5cdFx0JiYgc3RyZWFtLndyaXRhYmxlICE9PSBmYWxzZVxuXHRcdCYmIHR5cGVvZiBzdHJlYW0uX3dyaXRlID09PSAnZnVuY3Rpb24nXG5cdFx0JiYgdHlwZW9mIHN0cmVhbS5fd3JpdGFibGVTdGF0ZSA9PT0gJ29iamVjdCc7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc1JlYWRhYmxlU3RyZWFtKHN0cmVhbSkge1xuXHRyZXR1cm4gaXNTdHJlYW0oc3RyZWFtKVxuXHRcdCYmIHN0cmVhbS5yZWFkYWJsZSAhPT0gZmFsc2Vcblx0XHQmJiB0eXBlb2Ygc3RyZWFtLl9yZWFkID09PSAnZnVuY3Rpb24nXG5cdFx0JiYgdHlwZW9mIHN0cmVhbS5fcmVhZGFibGVTdGF0ZSA9PT0gJ29iamVjdCc7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc0R1cGxleFN0cmVhbShzdHJlYW0pIHtcblx0cmV0dXJuIGlzV3JpdGFibGVTdHJlYW0oc3RyZWFtKVxuXHRcdCYmIGlzUmVhZGFibGVTdHJlYW0oc3RyZWFtKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzVHJhbnNmb3JtU3RyZWFtKHN0cmVhbSkge1xuXHRyZXR1cm4gaXNEdXBsZXhTdHJlYW0oc3RyZWFtKVxuXHRcdCYmIHR5cGVvZiBzdHJlYW0uX3RyYW5zZm9ybSA9PT0gJ2Z1bmN0aW9uJztcbn1cbiIsImltcG9ydCB7aXNTdHJlYW19IGZyb20gJ2lzLXN0cmVhbSc7XG5pbXBvcnQgZ2V0U3RyZWFtIGZyb20gJ2dldC1zdHJlYW0nO1xuaW1wb3J0IG1lcmdlU3RyZWFtIGZyb20gJ21lcmdlLXN0cmVhbSc7XG5cbi8vIGBpbnB1dGAgb3B0aW9uXG5leHBvcnQgY29uc3QgaGFuZGxlSW5wdXQgPSAoc3Bhd25lZCwgaW5wdXQpID0+IHtcblx0Ly8gQ2hlY2tpbmcgZm9yIHN0ZGluIGlzIHdvcmthcm91bmQgZm9yIGh0dHBzOi8vZ2l0aHViLmNvbS9ub2RlanMvbm9kZS9pc3N1ZXMvMjY4NTJcblx0Ly8gQHRvZG8gcmVtb3ZlIGB8fCBzcGF3bmVkLnN0ZGluID09PSB1bmRlZmluZWRgIG9uY2Ugd2UgZHJvcCBzdXBwb3J0IGZvciBOb2RlLmpzIDw9MTIuMi4wXG5cdGlmIChpbnB1dCA9PT0gdW5kZWZpbmVkIHx8IHNwYXduZWQuc3RkaW4gPT09IHVuZGVmaW5lZCkge1xuXHRcdHJldHVybjtcblx0fVxuXG5cdGlmIChpc1N0cmVhbShpbnB1dCkpIHtcblx0XHRpbnB1dC5waXBlKHNwYXduZWQuc3RkaW4pO1xuXHR9IGVsc2Uge1xuXHRcdHNwYXduZWQuc3RkaW4uZW5kKGlucHV0KTtcblx0fVxufTtcblxuLy8gYGFsbGAgaW50ZXJsZWF2ZXMgYHN0ZG91dGAgYW5kIGBzdGRlcnJgXG5leHBvcnQgY29uc3QgbWFrZUFsbFN0cmVhbSA9IChzcGF3bmVkLCB7YWxsfSkgPT4ge1xuXHRpZiAoIWFsbCB8fCAoIXNwYXduZWQuc3Rkb3V0ICYmICFzcGF3bmVkLnN0ZGVycikpIHtcblx0XHRyZXR1cm47XG5cdH1cblxuXHRjb25zdCBtaXhlZCA9IG1lcmdlU3RyZWFtKCk7XG5cblx0aWYgKHNwYXduZWQuc3Rkb3V0KSB7XG5cdFx0bWl4ZWQuYWRkKHNwYXduZWQuc3Rkb3V0KTtcblx0fVxuXG5cdGlmIChzcGF3bmVkLnN0ZGVycikge1xuXHRcdG1peGVkLmFkZChzcGF3bmVkLnN0ZGVycik7XG5cdH1cblxuXHRyZXR1cm4gbWl4ZWQ7XG59O1xuXG4vLyBPbiBmYWlsdXJlLCBgcmVzdWx0LnN0ZG91dHxzdGRlcnJ8YWxsYCBzaG91bGQgY29udGFpbiB0aGUgY3VycmVudGx5IGJ1ZmZlcmVkIHN0cmVhbVxuY29uc3QgZ2V0QnVmZmVyZWREYXRhID0gYXN5bmMgKHN0cmVhbSwgc3RyZWFtUHJvbWlzZSkgPT4ge1xuXHRpZiAoIXN0cmVhbSkge1xuXHRcdHJldHVybjtcblx0fVxuXG5cdHN0cmVhbS5kZXN0cm95KCk7XG5cblx0dHJ5IHtcblx0XHRyZXR1cm4gYXdhaXQgc3RyZWFtUHJvbWlzZTtcblx0fSBjYXRjaCAoZXJyb3IpIHtcblx0XHRyZXR1cm4gZXJyb3IuYnVmZmVyZWREYXRhO1xuXHR9XG59O1xuXG5jb25zdCBnZXRTdHJlYW1Qcm9taXNlID0gKHN0cmVhbSwge2VuY29kaW5nLCBidWZmZXIsIG1heEJ1ZmZlcn0pID0+IHtcblx0aWYgKCFzdHJlYW0gfHwgIWJ1ZmZlcikge1xuXHRcdHJldHVybjtcblx0fVxuXG5cdGlmIChlbmNvZGluZykge1xuXHRcdHJldHVybiBnZXRTdHJlYW0oc3RyZWFtLCB7ZW5jb2RpbmcsIG1heEJ1ZmZlcn0pO1xuXHR9XG5cblx0cmV0dXJuIGdldFN0cmVhbS5idWZmZXIoc3RyZWFtLCB7bWF4QnVmZmVyfSk7XG59O1xuXG4vLyBSZXRyaWV2ZSByZXN1bHQgb2YgY2hpbGQgcHJvY2VzczogZXhpdCBjb2RlLCBzaWduYWwsIGVycm9yLCBzdHJlYW1zIChzdGRvdXQvc3RkZXJyL2FsbClcbmV4cG9ydCBjb25zdCBnZXRTcGF3bmVkUmVzdWx0ID0gYXN5bmMgKHtzdGRvdXQsIHN0ZGVyciwgYWxsfSwge2VuY29kaW5nLCBidWZmZXIsIG1heEJ1ZmZlcn0sIHByb2Nlc3NEb25lKSA9PiB7XG5cdGNvbnN0IHN0ZG91dFByb21pc2UgPSBnZXRTdHJlYW1Qcm9taXNlKHN0ZG91dCwge2VuY29kaW5nLCBidWZmZXIsIG1heEJ1ZmZlcn0pO1xuXHRjb25zdCBzdGRlcnJQcm9taXNlID0gZ2V0U3RyZWFtUHJvbWlzZShzdGRlcnIsIHtlbmNvZGluZywgYnVmZmVyLCBtYXhCdWZmZXJ9KTtcblx0Y29uc3QgYWxsUHJvbWlzZSA9IGdldFN0cmVhbVByb21pc2UoYWxsLCB7ZW5jb2RpbmcsIGJ1ZmZlciwgbWF4QnVmZmVyOiBtYXhCdWZmZXIgKiAyfSk7XG5cblx0dHJ5IHtcblx0XHRyZXR1cm4gYXdhaXQgUHJvbWlzZS5hbGwoW3Byb2Nlc3NEb25lLCBzdGRvdXRQcm9taXNlLCBzdGRlcnJQcm9taXNlLCBhbGxQcm9taXNlXSk7XG5cdH0gY2F0Y2ggKGVycm9yKSB7XG5cdFx0cmV0dXJuIFByb21pc2UuYWxsKFtcblx0XHRcdHtlcnJvciwgc2lnbmFsOiBlcnJvci5zaWduYWwsIHRpbWVkT3V0OiBlcnJvci50aW1lZE91dH0sXG5cdFx0XHRnZXRCdWZmZXJlZERhdGEoc3Rkb3V0LCBzdGRvdXRQcm9taXNlKSxcblx0XHRcdGdldEJ1ZmZlcmVkRGF0YShzdGRlcnIsIHN0ZGVyclByb21pc2UpLFxuXHRcdFx0Z2V0QnVmZmVyZWREYXRhKGFsbCwgYWxsUHJvbWlzZSksXG5cdFx0XSk7XG5cdH1cbn07XG5cbmV4cG9ydCBjb25zdCB2YWxpZGF0ZUlucHV0U3luYyA9ICh7aW5wdXR9KSA9PiB7XG5cdGlmIChpc1N0cmVhbShpbnB1dCkpIHtcblx0XHR0aHJvdyBuZXcgVHlwZUVycm9yKCdUaGUgYGlucHV0YCBvcHRpb24gY2Fubm90IGJlIGEgc3RyZWFtIGluIHN5bmMgbW9kZScpO1xuXHR9XG59O1xuIiwiY29uc3QgbmF0aXZlUHJvbWlzZVByb3RvdHlwZSA9IChhc3luYyAoKSA9PiB7fSkoKS5jb25zdHJ1Y3Rvci5wcm90b3R5cGU7XG5jb25zdCBkZXNjcmlwdG9ycyA9IFsndGhlbicsICdjYXRjaCcsICdmaW5hbGx5J10ubWFwKHByb3BlcnR5ID0+IFtcblx0cHJvcGVydHksXG5cdFJlZmxlY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKG5hdGl2ZVByb21pc2VQcm90b3R5cGUsIHByb3BlcnR5KSxcbl0pO1xuXG4vLyBUaGUgcmV0dXJuIHZhbHVlIGlzIGEgbWl4aW4gb2YgYGNoaWxkUHJvY2Vzc2AgYW5kIGBQcm9taXNlYFxuZXhwb3J0IGNvbnN0IG1lcmdlUHJvbWlzZSA9IChzcGF3bmVkLCBwcm9taXNlKSA9PiB7XG5cdGZvciAoY29uc3QgW3Byb3BlcnR5LCBkZXNjcmlwdG9yXSBvZiBkZXNjcmlwdG9ycykge1xuXHRcdC8vIFN0YXJ0aW5nIHRoZSBtYWluIGBwcm9taXNlYCBpcyBkZWZlcnJlZCB0byBhdm9pZCBjb25zdW1pbmcgc3RyZWFtc1xuXHRcdGNvbnN0IHZhbHVlID0gdHlwZW9mIHByb21pc2UgPT09ICdmdW5jdGlvbidcblx0XHRcdD8gKC4uLmFyZ3MpID0+IFJlZmxlY3QuYXBwbHkoZGVzY3JpcHRvci52YWx1ZSwgcHJvbWlzZSgpLCBhcmdzKVxuXHRcdFx0OiBkZXNjcmlwdG9yLnZhbHVlLmJpbmQocHJvbWlzZSk7XG5cblx0XHRSZWZsZWN0LmRlZmluZVByb3BlcnR5KHNwYXduZWQsIHByb3BlcnR5LCB7Li4uZGVzY3JpcHRvciwgdmFsdWV9KTtcblx0fVxuXG5cdHJldHVybiBzcGF3bmVkO1xufTtcblxuLy8gVXNlIHByb21pc2VzIGluc3RlYWQgb2YgYGNoaWxkX3Byb2Nlc3NgIGV2ZW50c1xuZXhwb3J0IGNvbnN0IGdldFNwYXduZWRQcm9taXNlID0gc3Bhd25lZCA9PiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG5cdHNwYXduZWQub24oJ2V4aXQnLCAoZXhpdENvZGUsIHNpZ25hbCkgPT4ge1xuXHRcdHJlc29sdmUoe2V4aXRDb2RlLCBzaWduYWx9KTtcblx0fSk7XG5cblx0c3Bhd25lZC5vbignZXJyb3InLCBlcnJvciA9PiB7XG5cdFx0cmVqZWN0KGVycm9yKTtcblx0fSk7XG5cblx0aWYgKHNwYXduZWQuc3RkaW4pIHtcblx0XHRzcGF3bmVkLnN0ZGluLm9uKCdlcnJvcicsIGVycm9yID0+IHtcblx0XHRcdHJlamVjdChlcnJvcik7XG5cdFx0fSk7XG5cdH1cbn0pO1xuIiwiY29uc3Qgbm9ybWFsaXplQXJncyA9IChmaWxlLCBhcmdzID0gW10pID0+IHtcblx0aWYgKCFBcnJheS5pc0FycmF5KGFyZ3MpKSB7XG5cdFx0cmV0dXJuIFtmaWxlXTtcblx0fVxuXG5cdHJldHVybiBbZmlsZSwgLi4uYXJnc107XG59O1xuXG5jb25zdCBOT19FU0NBUEVfUkVHRVhQID0gL15bXFx3Li1dKyQvO1xuY29uc3QgRE9VQkxFX1FVT1RFU19SRUdFWFAgPSAvXCIvZztcblxuY29uc3QgZXNjYXBlQXJnID0gYXJnID0+IHtcblx0aWYgKHR5cGVvZiBhcmcgIT09ICdzdHJpbmcnIHx8IE5PX0VTQ0FQRV9SRUdFWFAudGVzdChhcmcpKSB7XG5cdFx0cmV0dXJuIGFyZztcblx0fVxuXG5cdHJldHVybiBgXCIke2FyZy5yZXBsYWNlKERPVUJMRV9RVU9URVNfUkVHRVhQLCAnXFxcXFwiJyl9XCJgO1xufTtcblxuZXhwb3J0IGNvbnN0IGpvaW5Db21tYW5kID0gKGZpbGUsIGFyZ3MpID0+IG5vcm1hbGl6ZUFyZ3MoZmlsZSwgYXJncykuam9pbignICcpO1xuXG5leHBvcnQgY29uc3QgZ2V0RXNjYXBlZENvbW1hbmQgPSAoZmlsZSwgYXJncykgPT4gbm9ybWFsaXplQXJncyhmaWxlLCBhcmdzKS5tYXAoYXJnID0+IGVzY2FwZUFyZyhhcmcpKS5qb2luKCcgJyk7XG5cbmNvbnN0IFNQQUNFU19SRUdFWFAgPSAvICsvZztcblxuLy8gSGFuZGxlIGBleGVjYUNvbW1hbmQoKWBcbmV4cG9ydCBjb25zdCBwYXJzZUNvbW1hbmQgPSBjb21tYW5kID0+IHtcblx0Y29uc3QgdG9rZW5zID0gW107XG5cdGZvciAoY29uc3QgdG9rZW4gb2YgY29tbWFuZC50cmltKCkuc3BsaXQoU1BBQ0VTX1JFR0VYUCkpIHtcblx0XHQvLyBBbGxvdyBzcGFjZXMgdG8gYmUgZXNjYXBlZCBieSBhIGJhY2tzbGFzaCBpZiBub3QgbWVhbnQgYXMgYSBkZWxpbWl0ZXJcblx0XHRjb25zdCBwcmV2aW91c1Rva2VuID0gdG9rZW5zW3Rva2Vucy5sZW5ndGggLSAxXTtcblx0XHRpZiAocHJldmlvdXNUb2tlbiAmJiBwcmV2aW91c1Rva2VuLmVuZHNXaXRoKCdcXFxcJykpIHtcblx0XHRcdC8vIE1lcmdlIHByZXZpb3VzIHRva2VuIHdpdGggY3VycmVudCBvbmVcblx0XHRcdHRva2Vuc1t0b2tlbnMubGVuZ3RoIC0gMV0gPSBgJHtwcmV2aW91c1Rva2VuLnNsaWNlKDAsIC0xKX0gJHt0b2tlbn1gO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHR0b2tlbnMucHVzaCh0b2tlbik7XG5cdFx0fVxuXHR9XG5cblx0cmV0dXJuIHRva2Vucztcbn07XG4iLCJpbXBvcnQge0J1ZmZlcn0gZnJvbSAnbm9kZTpidWZmZXInO1xuaW1wb3J0IHBhdGggZnJvbSAnbm9kZTpwYXRoJztcbmltcG9ydCBjaGlsZFByb2Nlc3MgZnJvbSAnbm9kZTpjaGlsZF9wcm9jZXNzJztcbmltcG9ydCBwcm9jZXNzIGZyb20gJ25vZGU6cHJvY2Vzcyc7XG5pbXBvcnQgY3Jvc3NTcGF3biBmcm9tICdjcm9zcy1zcGF3bic7XG5pbXBvcnQgc3RyaXBGaW5hbE5ld2xpbmUgZnJvbSAnc3RyaXAtZmluYWwtbmV3bGluZSc7XG5pbXBvcnQge25wbVJ1blBhdGhFbnZ9IGZyb20gJ25wbS1ydW4tcGF0aCc7XG5pbXBvcnQgb25ldGltZSBmcm9tICdvbmV0aW1lJztcbmltcG9ydCB7bWFrZUVycm9yfSBmcm9tICcuL2xpYi9lcnJvci5qcyc7XG5pbXBvcnQge25vcm1hbGl6ZVN0ZGlvLCBub3JtYWxpemVTdGRpb05vZGV9IGZyb20gJy4vbGliL3N0ZGlvLmpzJztcbmltcG9ydCB7c3Bhd25lZEtpbGwsIHNwYXduZWRDYW5jZWwsIHNldHVwVGltZW91dCwgdmFsaWRhdGVUaW1lb3V0LCBzZXRFeGl0SGFuZGxlcn0gZnJvbSAnLi9saWIva2lsbC5qcyc7XG5pbXBvcnQge2hhbmRsZUlucHV0LCBnZXRTcGF3bmVkUmVzdWx0LCBtYWtlQWxsU3RyZWFtLCB2YWxpZGF0ZUlucHV0U3luY30gZnJvbSAnLi9saWIvc3RyZWFtLmpzJztcbmltcG9ydCB7bWVyZ2VQcm9taXNlLCBnZXRTcGF3bmVkUHJvbWlzZX0gZnJvbSAnLi9saWIvcHJvbWlzZS5qcyc7XG5pbXBvcnQge2pvaW5Db21tYW5kLCBwYXJzZUNvbW1hbmQsIGdldEVzY2FwZWRDb21tYW5kfSBmcm9tICcuL2xpYi9jb21tYW5kLmpzJztcblxuY29uc3QgREVGQVVMVF9NQVhfQlVGRkVSID0gMTAwMCAqIDEwMDAgKiAxMDA7XG5cbmNvbnN0IGdldEVudiA9ICh7ZW52OiBlbnZPcHRpb24sIGV4dGVuZEVudiwgcHJlZmVyTG9jYWwsIGxvY2FsRGlyLCBleGVjUGF0aH0pID0+IHtcblx0Y29uc3QgZW52ID0gZXh0ZW5kRW52ID8gey4uLnByb2Nlc3MuZW52LCAuLi5lbnZPcHRpb259IDogZW52T3B0aW9uO1xuXG5cdGlmIChwcmVmZXJMb2NhbCkge1xuXHRcdHJldHVybiBucG1SdW5QYXRoRW52KHtlbnYsIGN3ZDogbG9jYWxEaXIsIGV4ZWNQYXRofSk7XG5cdH1cblxuXHRyZXR1cm4gZW52O1xufTtcblxuY29uc3QgaGFuZGxlQXJndW1lbnRzID0gKGZpbGUsIGFyZ3MsIG9wdGlvbnMgPSB7fSkgPT4ge1xuXHRjb25zdCBwYXJzZWQgPSBjcm9zc1NwYXduLl9wYXJzZShmaWxlLCBhcmdzLCBvcHRpb25zKTtcblx0ZmlsZSA9IHBhcnNlZC5jb21tYW5kO1xuXHRhcmdzID0gcGFyc2VkLmFyZ3M7XG5cdG9wdGlvbnMgPSBwYXJzZWQub3B0aW9ucztcblxuXHRvcHRpb25zID0ge1xuXHRcdG1heEJ1ZmZlcjogREVGQVVMVF9NQVhfQlVGRkVSLFxuXHRcdGJ1ZmZlcjogdHJ1ZSxcblx0XHRzdHJpcEZpbmFsTmV3bGluZTogdHJ1ZSxcblx0XHRleHRlbmRFbnY6IHRydWUsXG5cdFx0cHJlZmVyTG9jYWw6IGZhbHNlLFxuXHRcdGxvY2FsRGlyOiBvcHRpb25zLmN3ZCB8fCBwcm9jZXNzLmN3ZCgpLFxuXHRcdGV4ZWNQYXRoOiBwcm9jZXNzLmV4ZWNQYXRoLFxuXHRcdGVuY29kaW5nOiAndXRmOCcsXG5cdFx0cmVqZWN0OiB0cnVlLFxuXHRcdGNsZWFudXA6IHRydWUsXG5cdFx0YWxsOiBmYWxzZSxcblx0XHR3aW5kb3dzSGlkZTogdHJ1ZSxcblx0XHQuLi5vcHRpb25zLFxuXHR9O1xuXG5cdG9wdGlvbnMuZW52ID0gZ2V0RW52KG9wdGlvbnMpO1xuXG5cdG9wdGlvbnMuc3RkaW8gPSBub3JtYWxpemVTdGRpbyhvcHRpb25zKTtcblxuXHRpZiAocHJvY2Vzcy5wbGF0Zm9ybSA9PT0gJ3dpbjMyJyAmJiBwYXRoLmJhc2VuYW1lKGZpbGUsICcuZXhlJykgPT09ICdjbWQnKSB7XG5cdFx0Ly8gIzExNlxuXHRcdGFyZ3MudW5zaGlmdCgnL3EnKTtcblx0fVxuXG5cdHJldHVybiB7ZmlsZSwgYXJncywgb3B0aW9ucywgcGFyc2VkfTtcbn07XG5cbmNvbnN0IGhhbmRsZU91dHB1dCA9IChvcHRpb25zLCB2YWx1ZSwgZXJyb3IpID0+IHtcblx0aWYgKHR5cGVvZiB2YWx1ZSAhPT0gJ3N0cmluZycgJiYgIUJ1ZmZlci5pc0J1ZmZlcih2YWx1ZSkpIHtcblx0XHQvLyBXaGVuIGBleGVjYVN5bmMoKWAgZXJyb3JzLCB3ZSBub3JtYWxpemUgaXQgdG8gJycgdG8gbWltaWMgYGV4ZWNhKClgXG5cdFx0cmV0dXJuIGVycm9yID09PSB1bmRlZmluZWQgPyB1bmRlZmluZWQgOiAnJztcblx0fVxuXG5cdGlmIChvcHRpb25zLnN0cmlwRmluYWxOZXdsaW5lKSB7XG5cdFx0cmV0dXJuIHN0cmlwRmluYWxOZXdsaW5lKHZhbHVlKTtcblx0fVxuXG5cdHJldHVybiB2YWx1ZTtcbn07XG5cbmV4cG9ydCBmdW5jdGlvbiBleGVjYShmaWxlLCBhcmdzLCBvcHRpb25zKSB7XG5cdGNvbnN0IHBhcnNlZCA9IGhhbmRsZUFyZ3VtZW50cyhmaWxlLCBhcmdzLCBvcHRpb25zKTtcblx0Y29uc3QgY29tbWFuZCA9IGpvaW5Db21tYW5kKGZpbGUsIGFyZ3MpO1xuXHRjb25zdCBlc2NhcGVkQ29tbWFuZCA9IGdldEVzY2FwZWRDb21tYW5kKGZpbGUsIGFyZ3MpO1xuXG5cdHZhbGlkYXRlVGltZW91dChwYXJzZWQub3B0aW9ucyk7XG5cblx0bGV0IHNwYXduZWQ7XG5cdHRyeSB7XG5cdFx0c3Bhd25lZCA9IGNoaWxkUHJvY2Vzcy5zcGF3bihwYXJzZWQuZmlsZSwgcGFyc2VkLmFyZ3MsIHBhcnNlZC5vcHRpb25zKTtcblx0fSBjYXRjaCAoZXJyb3IpIHtcblx0XHQvLyBFbnN1cmUgdGhlIHJldHVybmVkIGVycm9yIGlzIGFsd2F5cyBib3RoIGEgcHJvbWlzZSBhbmQgYSBjaGlsZCBwcm9jZXNzXG5cdFx0Y29uc3QgZHVtbXlTcGF3bmVkID0gbmV3IGNoaWxkUHJvY2Vzcy5DaGlsZFByb2Nlc3MoKTtcblx0XHRjb25zdCBlcnJvclByb21pc2UgPSBQcm9taXNlLnJlamVjdChtYWtlRXJyb3Ioe1xuXHRcdFx0ZXJyb3IsXG5cdFx0XHRzdGRvdXQ6ICcnLFxuXHRcdFx0c3RkZXJyOiAnJyxcblx0XHRcdGFsbDogJycsXG5cdFx0XHRjb21tYW5kLFxuXHRcdFx0ZXNjYXBlZENvbW1hbmQsXG5cdFx0XHRwYXJzZWQsXG5cdFx0XHR0aW1lZE91dDogZmFsc2UsXG5cdFx0XHRpc0NhbmNlbGVkOiBmYWxzZSxcblx0XHRcdGtpbGxlZDogZmFsc2UsXG5cdFx0fSkpO1xuXHRcdHJldHVybiBtZXJnZVByb21pc2UoZHVtbXlTcGF3bmVkLCBlcnJvclByb21pc2UpO1xuXHR9XG5cblx0Y29uc3Qgc3Bhd25lZFByb21pc2UgPSBnZXRTcGF3bmVkUHJvbWlzZShzcGF3bmVkKTtcblx0Y29uc3QgdGltZWRQcm9taXNlID0gc2V0dXBUaW1lb3V0KHNwYXduZWQsIHBhcnNlZC5vcHRpb25zLCBzcGF3bmVkUHJvbWlzZSk7XG5cdGNvbnN0IHByb2Nlc3NEb25lID0gc2V0RXhpdEhhbmRsZXIoc3Bhd25lZCwgcGFyc2VkLm9wdGlvbnMsIHRpbWVkUHJvbWlzZSk7XG5cblx0Y29uc3QgY29udGV4dCA9IHtpc0NhbmNlbGVkOiBmYWxzZX07XG5cblx0c3Bhd25lZC5raWxsID0gc3Bhd25lZEtpbGwuYmluZChudWxsLCBzcGF3bmVkLmtpbGwuYmluZChzcGF3bmVkKSk7XG5cdHNwYXduZWQuY2FuY2VsID0gc3Bhd25lZENhbmNlbC5iaW5kKG51bGwsIHNwYXduZWQsIGNvbnRleHQpO1xuXG5cdGNvbnN0IGhhbmRsZVByb21pc2UgPSBhc3luYyAoKSA9PiB7XG5cdFx0Y29uc3QgW3tlcnJvciwgZXhpdENvZGUsIHNpZ25hbCwgdGltZWRPdXR9LCBzdGRvdXRSZXN1bHQsIHN0ZGVyclJlc3VsdCwgYWxsUmVzdWx0XSA9IGF3YWl0IGdldFNwYXduZWRSZXN1bHQoc3Bhd25lZCwgcGFyc2VkLm9wdGlvbnMsIHByb2Nlc3NEb25lKTtcblx0XHRjb25zdCBzdGRvdXQgPSBoYW5kbGVPdXRwdXQocGFyc2VkLm9wdGlvbnMsIHN0ZG91dFJlc3VsdCk7XG5cdFx0Y29uc3Qgc3RkZXJyID0gaGFuZGxlT3V0cHV0KHBhcnNlZC5vcHRpb25zLCBzdGRlcnJSZXN1bHQpO1xuXHRcdGNvbnN0IGFsbCA9IGhhbmRsZU91dHB1dChwYXJzZWQub3B0aW9ucywgYWxsUmVzdWx0KTtcblxuXHRcdGlmIChlcnJvciB8fCBleGl0Q29kZSAhPT0gMCB8fCBzaWduYWwgIT09IG51bGwpIHtcblx0XHRcdGNvbnN0IHJldHVybmVkRXJyb3IgPSBtYWtlRXJyb3Ioe1xuXHRcdFx0XHRlcnJvcixcblx0XHRcdFx0ZXhpdENvZGUsXG5cdFx0XHRcdHNpZ25hbCxcblx0XHRcdFx0c3Rkb3V0LFxuXHRcdFx0XHRzdGRlcnIsXG5cdFx0XHRcdGFsbCxcblx0XHRcdFx0Y29tbWFuZCxcblx0XHRcdFx0ZXNjYXBlZENvbW1hbmQsXG5cdFx0XHRcdHBhcnNlZCxcblx0XHRcdFx0dGltZWRPdXQsXG5cdFx0XHRcdGlzQ2FuY2VsZWQ6IGNvbnRleHQuaXNDYW5jZWxlZCxcblx0XHRcdFx0a2lsbGVkOiBzcGF3bmVkLmtpbGxlZCxcblx0XHRcdH0pO1xuXG5cdFx0XHRpZiAoIXBhcnNlZC5vcHRpb25zLnJlamVjdCkge1xuXHRcdFx0XHRyZXR1cm4gcmV0dXJuZWRFcnJvcjtcblx0XHRcdH1cblxuXHRcdFx0dGhyb3cgcmV0dXJuZWRFcnJvcjtcblx0XHR9XG5cblx0XHRyZXR1cm4ge1xuXHRcdFx0Y29tbWFuZCxcblx0XHRcdGVzY2FwZWRDb21tYW5kLFxuXHRcdFx0ZXhpdENvZGU6IDAsXG5cdFx0XHRzdGRvdXQsXG5cdFx0XHRzdGRlcnIsXG5cdFx0XHRhbGwsXG5cdFx0XHRmYWlsZWQ6IGZhbHNlLFxuXHRcdFx0dGltZWRPdXQ6IGZhbHNlLFxuXHRcdFx0aXNDYW5jZWxlZDogZmFsc2UsXG5cdFx0XHRraWxsZWQ6IGZhbHNlLFxuXHRcdH07XG5cdH07XG5cblx0Y29uc3QgaGFuZGxlUHJvbWlzZU9uY2UgPSBvbmV0aW1lKGhhbmRsZVByb21pc2UpO1xuXG5cdGhhbmRsZUlucHV0KHNwYXduZWQsIHBhcnNlZC5vcHRpb25zLmlucHV0KTtcblxuXHRzcGF3bmVkLmFsbCA9IG1ha2VBbGxTdHJlYW0oc3Bhd25lZCwgcGFyc2VkLm9wdGlvbnMpO1xuXG5cdHJldHVybiBtZXJnZVByb21pc2Uoc3Bhd25lZCwgaGFuZGxlUHJvbWlzZU9uY2UpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZXhlY2FTeW5jKGZpbGUsIGFyZ3MsIG9wdGlvbnMpIHtcblx0Y29uc3QgcGFyc2VkID0gaGFuZGxlQXJndW1lbnRzKGZpbGUsIGFyZ3MsIG9wdGlvbnMpO1xuXHRjb25zdCBjb21tYW5kID0gam9pbkNvbW1hbmQoZmlsZSwgYXJncyk7XG5cdGNvbnN0IGVzY2FwZWRDb21tYW5kID0gZ2V0RXNjYXBlZENvbW1hbmQoZmlsZSwgYXJncyk7XG5cblx0dmFsaWRhdGVJbnB1dFN5bmMocGFyc2VkLm9wdGlvbnMpO1xuXG5cdGxldCByZXN1bHQ7XG5cdHRyeSB7XG5cdFx0cmVzdWx0ID0gY2hpbGRQcm9jZXNzLnNwYXduU3luYyhwYXJzZWQuZmlsZSwgcGFyc2VkLmFyZ3MsIHBhcnNlZC5vcHRpb25zKTtcblx0fSBjYXRjaCAoZXJyb3IpIHtcblx0XHR0aHJvdyBtYWtlRXJyb3Ioe1xuXHRcdFx0ZXJyb3IsXG5cdFx0XHRzdGRvdXQ6ICcnLFxuXHRcdFx0c3RkZXJyOiAnJyxcblx0XHRcdGFsbDogJycsXG5cdFx0XHRjb21tYW5kLFxuXHRcdFx0ZXNjYXBlZENvbW1hbmQsXG5cdFx0XHRwYXJzZWQsXG5cdFx0XHR0aW1lZE91dDogZmFsc2UsXG5cdFx0XHRpc0NhbmNlbGVkOiBmYWxzZSxcblx0XHRcdGtpbGxlZDogZmFsc2UsXG5cdFx0fSk7XG5cdH1cblxuXHRjb25zdCBzdGRvdXQgPSBoYW5kbGVPdXRwdXQocGFyc2VkLm9wdGlvbnMsIHJlc3VsdC5zdGRvdXQsIHJlc3VsdC5lcnJvcik7XG5cdGNvbnN0IHN0ZGVyciA9IGhhbmRsZU91dHB1dChwYXJzZWQub3B0aW9ucywgcmVzdWx0LnN0ZGVyciwgcmVzdWx0LmVycm9yKTtcblxuXHRpZiAocmVzdWx0LmVycm9yIHx8IHJlc3VsdC5zdGF0dXMgIT09IDAgfHwgcmVzdWx0LnNpZ25hbCAhPT0gbnVsbCkge1xuXHRcdGNvbnN0IGVycm9yID0gbWFrZUVycm9yKHtcblx0XHRcdHN0ZG91dCxcblx0XHRcdHN0ZGVycixcblx0XHRcdGVycm9yOiByZXN1bHQuZXJyb3IsXG5cdFx0XHRzaWduYWw6IHJlc3VsdC5zaWduYWwsXG5cdFx0XHRleGl0Q29kZTogcmVzdWx0LnN0YXR1cyxcblx0XHRcdGNvbW1hbmQsXG5cdFx0XHRlc2NhcGVkQ29tbWFuZCxcblx0XHRcdHBhcnNlZCxcblx0XHRcdHRpbWVkT3V0OiByZXN1bHQuZXJyb3IgJiYgcmVzdWx0LmVycm9yLmNvZGUgPT09ICdFVElNRURPVVQnLFxuXHRcdFx0aXNDYW5jZWxlZDogZmFsc2UsXG5cdFx0XHRraWxsZWQ6IHJlc3VsdC5zaWduYWwgIT09IG51bGwsXG5cdFx0fSk7XG5cblx0XHRpZiAoIXBhcnNlZC5vcHRpb25zLnJlamVjdCkge1xuXHRcdFx0cmV0dXJuIGVycm9yO1xuXHRcdH1cblxuXHRcdHRocm93IGVycm9yO1xuXHR9XG5cblx0cmV0dXJuIHtcblx0XHRjb21tYW5kLFxuXHRcdGVzY2FwZWRDb21tYW5kLFxuXHRcdGV4aXRDb2RlOiAwLFxuXHRcdHN0ZG91dCxcblx0XHRzdGRlcnIsXG5cdFx0ZmFpbGVkOiBmYWxzZSxcblx0XHR0aW1lZE91dDogZmFsc2UsXG5cdFx0aXNDYW5jZWxlZDogZmFsc2UsXG5cdFx0a2lsbGVkOiBmYWxzZSxcblx0fTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGV4ZWNhQ29tbWFuZChjb21tYW5kLCBvcHRpb25zKSB7XG5cdGNvbnN0IFtmaWxlLCAuLi5hcmdzXSA9IHBhcnNlQ29tbWFuZChjb21tYW5kKTtcblx0cmV0dXJuIGV4ZWNhKGZpbGUsIGFyZ3MsIG9wdGlvbnMpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZXhlY2FDb21tYW5kU3luYyhjb21tYW5kLCBvcHRpb25zKSB7XG5cdGNvbnN0IFtmaWxlLCAuLi5hcmdzXSA9IHBhcnNlQ29tbWFuZChjb21tYW5kKTtcblx0cmV0dXJuIGV4ZWNhU3luYyhmaWxlLCBhcmdzLCBvcHRpb25zKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGV4ZWNhTm9kZShzY3JpcHRQYXRoLCBhcmdzLCBvcHRpb25zID0ge30pIHtcblx0aWYgKGFyZ3MgJiYgIUFycmF5LmlzQXJyYXkoYXJncykgJiYgdHlwZW9mIGFyZ3MgPT09ICdvYmplY3QnKSB7XG5cdFx0b3B0aW9ucyA9IGFyZ3M7XG5cdFx0YXJncyA9IFtdO1xuXHR9XG5cblx0Y29uc3Qgc3RkaW8gPSBub3JtYWxpemVTdGRpb05vZGUob3B0aW9ucyk7XG5cdGNvbnN0IGRlZmF1bHRFeGVjQXJndiA9IHByb2Nlc3MuZXhlY0FyZ3YuZmlsdGVyKGFyZyA9PiAhYXJnLnN0YXJ0c1dpdGgoJy0taW5zcGVjdCcpKTtcblxuXHRjb25zdCB7XG5cdFx0bm9kZVBhdGggPSBwcm9jZXNzLmV4ZWNQYXRoLFxuXHRcdG5vZGVPcHRpb25zID0gZGVmYXVsdEV4ZWNBcmd2LFxuXHR9ID0gb3B0aW9ucztcblxuXHRyZXR1cm4gZXhlY2EoXG5cdFx0bm9kZVBhdGgsXG5cdFx0W1xuXHRcdFx0Li4ubm9kZU9wdGlvbnMsXG5cdFx0XHRzY3JpcHRQYXRoLFxuXHRcdFx0Li4uKEFycmF5LmlzQXJyYXkoYXJncykgPyBhcmdzIDogW10pLFxuXHRcdF0sXG5cdFx0e1xuXHRcdFx0Li4ub3B0aW9ucyxcblx0XHRcdHN0ZGluOiB1bmRlZmluZWQsXG5cdFx0XHRzdGRvdXQ6IHVuZGVmaW5lZCxcblx0XHRcdHN0ZGVycjogdW5kZWZpbmVkLFxuXHRcdFx0c3RkaW8sXG5cdFx0XHRzaGVsbDogZmFsc2UsXG5cdFx0fSxcblx0KTtcbn1cbiIsImltcG9ydCByZWFkbGluZSBmcm9tICdyZWFkbGluZSdcbmltcG9ydCBjIGZyb20gJ3BpY29jb2xvcnMnXG5pbXBvcnQgdHlwZSB7IFZpdGVzdCB9IGZyb20gJy4vY29yZSdcblxuY29uc3Qga2V5cyA9IFtcbiAgWydhJywgJ3JlcnVuIGFsbCB0ZXN0cyddLFxuICBbJ2YnLCAncmVydW4gb25seSBmYWlsZWQgdGVzdHMnXSxcbiAgWyd1JywgJ3VwZGF0ZSBzbmFwc2hvdCddLFxuICBbJ3EnLCAncXVpdCddLFxuXVxuXG5leHBvcnQgZnVuY3Rpb24gcHJpbnRTaG9ydGN1dHNIZWxwKCkge1xuICBwcm9jZXNzLnN0ZG91dC53cml0ZShcbiAgICBgXG4ke2MuYm9sZCgnV2F0Y2ggVXNhZ2UnKX1cbiR7a2V5cy5tYXAoaSA9PiBjLmRpbSgnICBwcmVzcyAnKSArIGMucmVzZXQoaVswXSkgKyBjLmRpbShgIHRvICR7aVsxXX1gKSkuam9pbignXFxuJyl9XG5gLFxuICApXG59XG5cbmV4cG9ydCBmdW5jdGlvbiByZWdpc3RlckNvbnNvbGVTaG9ydGN1dHMoY3R4OiBWaXRlc3QpIHtcbiAgcmVhZGxpbmUuZW1pdEtleXByZXNzRXZlbnRzKHByb2Nlc3Muc3RkaW4pXG4gIHByb2Nlc3Muc3RkaW4uc2V0UmF3TW9kZSh0cnVlKVxuICBwcm9jZXNzLnN0ZGluLm9uKCdrZXlwcmVzcycsIChzdHI6IHN0cmluZywga2V5OiBhbnkpID0+IHtcbiAgICAvLyBjdHJsLWMgb3IgZXNjXG4gICAgaWYgKHN0ciA9PT0gJ1xceDAzJyB8fCBzdHIgPT09ICdcXHgxQicgfHwgKGtleSAmJiBrZXkuY3RybCAmJiBrZXkubmFtZSA9PT0gJ2MnKSlcbiAgICAgIHJldHVybiBjdHguZXhpdCgpXG5cbiAgICAvLyBpcyBydW5uaW5nLCBpZ25vcmUga2V5cHJlc3NcbiAgICBpZiAoY3R4LnJ1bm5pbmdQcm9taXNlKVxuICAgICAgcmV0dXJuXG5cbiAgICBjb25zdCBuYW1lID0ga2V5Py5uYW1lXG5cbiAgICAvLyBoZWxwXG4gICAgaWYgKG5hbWUgPT09ICdoJylcbiAgICAgIHJldHVybiBwcmludFNob3J0Y3V0c0hlbHAoKVxuICAgIC8vIHVwZGF0ZSBzbmFwc2hvdFxuICAgIGlmIChuYW1lID09PSAndScpXG4gICAgICByZXR1cm4gY3R4LnVwZGF0ZVNuYXBzaG90KClcbiAgICAvLyByZXJ1biBhbGwgdGVzdHNcbiAgICBpZiAobmFtZSA9PT0gJ2EnIHx8IG5hbWUgPT09ICdyZXR1cm4nKVxuICAgICAgcmV0dXJuIGN0eC5yZXJ1bkZpbGVzKHVuZGVmaW5lZCwgJ3JlcnVuIGFsbCcpXG4gICAgLy8gcXVpdFxuICAgIGlmIChuYW1lID09PSAncScpXG4gICAgICByZXR1cm4gY3R4LmV4aXQoKVxuXG4gICAgLy8gVE9ETzogYWRkIG1vcmUgY29tbWFuZHNcbiAgfSlcbn1cbiIsImltcG9ydCBjYWMgZnJvbSAnY2FjJ1xuaW1wb3J0IHsgZXhlY2EgfSBmcm9tICdleGVjYSdcbmltcG9ydCB0eXBlIHsgVXNlckNvbmZpZyB9IGZyb20gJy4uL3R5cGVzJ1xuaW1wb3J0IHsgdmVyc2lvbiB9IGZyb20gJy4uLy4uL3BhY2thZ2UuanNvbidcbmltcG9ydCB7IGVuc3VyZVBhY2thZ2VJbnN0YWxsZWQgfSBmcm9tICcuLi91dGlscydcbmltcG9ydCB7IGNyZWF0ZVZpdGVzdCB9IGZyb20gJy4vY3JlYXRlJ1xuaW1wb3J0IHsgcmVnaXN0ZXJDb25zb2xlU2hvcnRjdXRzIH0gZnJvbSAnLi9zdGRpbidcblxuY29uc3QgY2xpID0gY2FjKCd2aXRlc3QnKVxuXG5jbGlcbiAgLnZlcnNpb24odmVyc2lvbilcbiAgLm9wdGlvbignLXIsIC0tcm9vdCA8cGF0aD4nLCAncm9vdCBwYXRoJylcbiAgLm9wdGlvbignLWMsIC0tY29uZmlnIDxwYXRoPicsICdwYXRoIHRvIGNvbmZpZyBmaWxlJylcbiAgLm9wdGlvbignLXUsIC0tdXBkYXRlJywgJ3VwZGF0ZSBzbmFwc2hvdCcpXG4gIC5vcHRpb24oJy13LCAtLXdhdGNoJywgJ3dhdGNoIG1vZGUnKVxuICAub3B0aW9uKCctdCwgLS10ZXN0TmFtZVBhdHRlcm4gPHBhdHRlcm4+JywgJ3J1biB0ZXN0IG5hbWVzIHdpdGggdGhlIHNwZWNpZmllZCBwYXR0ZXJuJylcbiAgLm9wdGlvbignLS11aScsICdvcGVuIFVJJylcbiAgLm9wdGlvbignLS1hcGkgW2FwaV0nLCAnc2VydmUgQVBJLCBhdmFpbGFibGUgb3B0aW9uczogLS1hcGkucG9ydCA8cG9ydD4sIC0tYXBpLmhvc3QgW2hvc3RdIGFuZCAtLWFwaS5zdHJpY3RQb3J0JylcbiAgLm9wdGlvbignLS10aHJlYWRzJywgJ2VuYWJsZWQgdGhyZWFkcycsIHsgZGVmYXVsdDogdHJ1ZSB9KVxuICAub3B0aW9uKCctLXNpbGVudCcsICdzaWxlbnQgY29uc29sZSBvdXRwdXQgZnJvbSB0ZXN0cycpXG4gIC5vcHRpb24oJy0taXNvbGF0ZScsICdpc29sYXRlIGVudmlyb25tZW50IGZvciBlYWNoIHRlc3QgZmlsZScsIHsgZGVmYXVsdDogdHJ1ZSB9KVxuICAub3B0aW9uKCctLXJlcG9ydGVyIDxuYW1lPicsICdyZXBvcnRlcicpXG4gIC5vcHRpb24oJy0tb3V0cHV0RmlsZSA8ZmlsZW5hbWU+JywgJ3dyaXRlIHRlc3QgcmVzdWx0cyB0byBhIGZpbGUgd2hlbiB0aGUgLS1yZXBvcnRlcj1qc29uIG9wdGlvbiBpcyBhbHNvIHNwZWNpZmllZCcpXG4gIC5vcHRpb24oJy0tY292ZXJhZ2UnLCAndXNlIGM4IGZvciBjb3ZlcmFnZScpXG4gIC5vcHRpb24oJy0tcnVuJywgJ2RvIG5vdCB3YXRjaCcpXG4gIC5vcHRpb24oJy0tZ2xvYmFsJywgJ2luamVjdCBhcGlzIGdsb2JhbGx5JylcbiAgLm9wdGlvbignLS1kb20nLCAnbW9jayBicm93c2VyIGFwaSB3aXRoIGhhcHB5LWRvbScpXG4gIC5vcHRpb24oJy0tZW52aXJvbm1lbnQgPGVudj4nLCAncnVubmVyIGVudmlyb25tZW50JywgeyBkZWZhdWx0OiAnbm9kZScgfSlcbiAgLm9wdGlvbignLS1wYXNzV2l0aE5vVGVzdHMnLCAncGFzcyB3aGVuIG5vIHRlc3RzIGZvdW5kJylcbiAgLmhlbHAoKVxuXG5jbGlcbiAgLmNvbW1hbmQoJ3J1biBbLi4uZmlsdGVyc10nKVxuICAuYWN0aW9uKHJ1bilcblxuY2xpXG4gIC5jb21tYW5kKCdyZWxhdGVkIFsuLi5maWx0ZXJzXScpXG4gIC5hY3Rpb24ocnVuUmVsYXRlZClcblxuY2xpXG4gIC5jb21tYW5kKCd3YXRjaCBbLi4uZmlsdGVyc10nKVxuICAuYWN0aW9uKGRldilcblxuY2xpXG4gIC5jb21tYW5kKCdkZXYgWy4uLmZpbHRlcnNdJylcbiAgLmFjdGlvbihkZXYpXG5cbmNsaVxuICAuY29tbWFuZCgnWy4uLmZpbHRlcnNdJylcbiAgLmFjdGlvbihkZXYpXG5cbmNsaS5wYXJzZSgpXG5cbmFzeW5jIGZ1bmN0aW9uIHJ1blJlbGF0ZWQocmVsYXRlZEZpbGVzOiBzdHJpbmdbXSB8IHN0cmluZywgYXJndjogVXNlckNvbmZpZykge1xuICBhcmd2LnJlbGF0ZWQgPSByZWxhdGVkRmlsZXNcbiAgYXJndi5wYXNzV2l0aE5vVGVzdHMgPz89IHRydWVcbiAgYXdhaXQgZGV2KFtdLCBhcmd2KVxufVxuXG5hc3luYyBmdW5jdGlvbiBkZXYoY2xpRmlsdGVyczogc3RyaW5nW10sIGFyZ3Y6IFVzZXJDb25maWcpIHtcbiAgaWYgKGFyZ3Yud2F0Y2ggPT0gbnVsbClcbiAgICBhcmd2LndhdGNoID0gIXByb2Nlc3MuZW52LkNJICYmICFhcmd2LnJ1blxuICBhd2FpdCBydW4oY2xpRmlsdGVycywgYXJndilcbn1cblxuYXN5bmMgZnVuY3Rpb24gcnVuKGNsaUZpbHRlcnM6IHN0cmluZ1tdLCBvcHRpb25zOiBVc2VyQ29uZmlnKSB7XG4gIHByb2Nlc3MuZW52LlZJVEVTVCA9ICd0cnVlJ1xuICBwcm9jZXNzLmVudi5OT0RFX0VOViA9ICd0ZXN0J1xuXG4gIGlmICghYXdhaXQgZW5zdXJlUGFja2FnZUluc3RhbGxlZCgndml0ZScpKVxuICAgIHByb2Nlc3MuZXhpdCgxKVxuXG4gIGlmICh0eXBlb2Ygb3B0aW9ucy5jb3ZlcmFnZSA9PT0gJ2Jvb2xlYW4nKVxuICAgIG9wdGlvbnMuY292ZXJhZ2UgPSB7IGVuYWJsZWQ6IG9wdGlvbnMuY292ZXJhZ2UgfVxuXG4gIGNvbnN0IGN0eCA9IGF3YWl0IGNyZWF0ZVZpdGVzdChvcHRpb25zKVxuXG4gIGlmIChjdHguY29uZmlnLmNvdmVyYWdlLmVuYWJsZWQpIHtcbiAgICBpZiAoIWF3YWl0IGVuc3VyZVBhY2thZ2VJbnN0YWxsZWQoJ2M4JykpXG4gICAgICBwcm9jZXNzLmV4aXQoMSlcblxuICAgIGlmICghcHJvY2Vzcy5lbnYuTk9ERV9WOF9DT1ZFUkFHRSkge1xuICAgICAgcHJvY2Vzcy5lbnYuTk9ERV9WOF9DT1ZFUkFHRSA9IGN0eC5jb25maWcuY292ZXJhZ2UudGVtcERpcmVjdG9yeVxuICAgICAgY29uc3QgeyBleGl0Q29kZSB9ID0gYXdhaXQgZXhlY2EocHJvY2Vzcy5hcmd2MCwgcHJvY2Vzcy5hcmd2LnNsaWNlKDEpLCB7IHN0ZGlvOiAnaW5oZXJpdCcgfSlcbiAgICAgIHByb2Nlc3MuZXhpdChleGl0Q29kZSlcbiAgICB9XG4gIH1cblxuICBpZiAoY3R4LmNvbmZpZy5lbnZpcm9ubWVudCAmJiBjdHguY29uZmlnLmVudmlyb25tZW50ICE9PSAnbm9kZScpIHtcbiAgICBpZiAoIWF3YWl0IGVuc3VyZVBhY2thZ2VJbnN0YWxsZWQoY3R4LmNvbmZpZy5lbnZpcm9ubWVudCkpXG4gICAgICBwcm9jZXNzLmV4aXQoMSlcbiAgfVxuXG4gIGlmIChwcm9jZXNzLnN0ZGluLmlzVFRZICYmIGN0eC5jb25maWcud2F0Y2gpXG4gICAgcmVnaXN0ZXJDb25zb2xlU2hvcnRjdXRzKGN0eClcblxuICBwcm9jZXNzLmNoZGlyKGN0eC5jb25maWcucm9vdClcblxuICBjdHgub25TZXJ2ZXJSZXN0YXJ0ZWQoKCkgPT4ge1xuICAgIC8vIFRPRE86IHJlLWNvbnNpZGVyIGhvdyB0byByZS1ydW4gdGhlIHRlc3RzIHRoZSBzZXJ2ZXIgc21hcnRseVxuICAgIGN0eC5zdGFydChjbGlGaWx0ZXJzKVxuICB9KVxuXG4gIHRyeSB7XG4gICAgYXdhaXQgY3R4LnN0YXJ0KGNsaUZpbHRlcnMpXG4gIH1cbiAgY2F0Y2ggKGUpIHtcbiAgICBwcm9jZXNzLmV4aXRDb2RlID0gMVxuICAgIHRocm93IGVcbiAgfVxuICBmaW5hbGx5IHtcbiAgICBpZiAoIWN0eC5jb25maWcud2F0Y2gpXG4gICAgICBhd2FpdCBjdHguY2xvc2UoKVxuICB9XG5cbiAgaWYgKCFjdHguY29uZmlnLndhdGNoKVxuICAgIGF3YWl0IGN0eC5leGl0KClcbn1cbiJdLCJuYW1lcyI6WyJwcm9jZXNzIiwib3MiLCJvbkV4aXQiLCJyZWFkbGluZSJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBRUEsU0FBUyxLQUFLLENBQUMsR0FBRyxFQUFFO0FBQ3BCLENBQUMsT0FBTyxHQUFHLElBQUksSUFBSSxHQUFHLEVBQUUsR0FBRyxLQUFLLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQzVELENBQUM7QUFDRDtBQUNBLFNBQVMsS0FBSyxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLElBQUksRUFBRTtBQUNwQyxDQUFDLElBQUksQ0FBQyxFQUFFLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEVBQUUsR0FBRztBQUN6QixFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxJQUFJLEdBQUcsSUFBSSxJQUFJLElBQUksR0FBRyxLQUFLLElBQUksR0FBRyxFQUFFLEdBQUcsTUFBTSxDQUFDLEdBQUcsQ0FBQztBQUMvRSxJQUFJLE9BQU8sR0FBRyxLQUFLLFNBQVMsR0FBRyxHQUFHO0FBQ2xDLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLElBQUksR0FBRyxLQUFLLE9BQU8sR0FBRyxLQUFLLEdBQUcsR0FBRyxLQUFLLE1BQU0sS0FBSyxHQUFHLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQztBQUNwSSxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsR0FBRyxHQUFHO0FBQ3BDLEVBQUUsQ0FBQztBQUNILENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEdBQUcsSUFBSSxJQUFJLEdBQUcsR0FBRyxJQUFJLEtBQUssQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsR0FBRyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDO0FBQ3BGLENBQUM7QUFDRDtBQUNBLFNBQVMsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUU7QUFDM0IsQ0FBQyxJQUFJLEdBQUcsSUFBSSxJQUFJLEVBQUUsQ0FBQztBQUNuQixDQUFDLElBQUksR0FBRyxJQUFJLElBQUksRUFBRSxDQUFDO0FBQ25CO0FBQ0EsQ0FBQyxJQUFJLENBQUMsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLElBQUksRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDO0FBQzFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQztBQUN0QztBQUNBLENBQUMsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUssS0FBSyxLQUFLLENBQUMsQ0FBQztBQUNyQyxDQUFDLE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxPQUFPLEtBQUssS0FBSyxDQUFDLENBQUM7QUFDeEMsQ0FBQyxNQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsT0FBTyxLQUFLLEtBQUssQ0FBQyxDQUFDO0FBQzFDO0FBQ0EsQ0FBQyxJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxLQUFLLElBQUksRUFBRSxDQUFDO0FBQy9CLENBQUMsSUFBSSxDQUFDLE1BQU0sR0FBRyxLQUFLLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBQ2xDLENBQUMsSUFBSSxDQUFDLE9BQU8sR0FBRyxLQUFLLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0FBQ3BDO0FBQ0EsQ0FBQyxJQUFJLEtBQUssRUFBRTtBQUNaLEVBQUUsS0FBSyxDQUFDLElBQUksSUFBSSxDQUFDLEtBQUssRUFBRTtBQUN4QixHQUFHLEdBQUcsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDOUMsR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7QUFDbEMsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO0FBQ3RELElBQUk7QUFDSixHQUFHO0FBQ0gsRUFBRTtBQUNGO0FBQ0EsQ0FBQyxLQUFLLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsR0FBRyxDQUFDLEdBQUc7QUFDdkMsRUFBRSxHQUFHLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDO0FBQzFDLEVBQUUsS0FBSyxDQUFDLENBQUMsR0FBRyxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsR0FBRyxDQUFDLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENB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SUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUM3QixJQUFJO0FBQ0osR0FBRyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsS0FBSyxDQUFDO0FBQ3JCLEdBQUcsTUFBTTtBQUNULEdBQUcsS0FBSyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxHQUFHLEdBQUcsR0FBRyxDQUFDLE1BQU0sRUFBRSxHQUFHLEVBQUUsRUFBRTtBQUMxQyxJQUFJLElBQUksR0FBRyxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsS0FBSyxFQUFFLEVBQUUsTUFBTTtBQUMxQyxJQUFJO0FBQ0o7QUFDQSxHQUFHLElBQUksR0FBRyxHQUFHLENBQUMsU0FBUyxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQztBQUNoQyxHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUMsU0FBUyxDQUFDLEVBQUUsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxVQUFVLENBQUMsQ0FBQyxDQUFDLEtBQUssRUFBRSxJQUFJLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDbkcsR0FBRyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDO0FBQ25DO0FBQ0EsR0FBRyxLQUFLLEdBQUcsQ0FBQyxDQUFDLEVBQUUsR0FBRyxHQUFHLEdBQUcsQ0FBQyxNQUFNLEVBQUUsR0FBRyxFQUFFLEVBQUU7QUFDeEMsSUFBSSxJQUFJLEdBQUcsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQ3BCLElBQUksSUFBSSxNQUFNLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEVBQUUsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxD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
