import { n as noop, i as isObject } from './index-59e12882.js';
import { i as isMockFunction, a as spyOn, f as fn, s as spies } from './jest-mock-113430de.js';
import { c as commonjsGlobal, g as getDefaultExportFromCjs } from './_commonjsHelpers-c9e3b764.js';

var __defProp = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
function createChainable(keys, fn) {
  function create(obj) {
    const chain2 = function(...args) {
      return fn.apply(obj, args);
    };
    for (const key of keys) {
      Object.defineProperty(chain2, key, {
        get() {
          return create(__spreadProps(__spreadValues({}, obj), { [key]: true }));
        }
      });
    }
    return chain2;
  }
  const chain = create({});
  chain.fn = fn;
  return chain;
}

const context = {
  tasks: [],
  currentSuite: null
};
function collectTask(task) {
  var _a;
  (_a = context.currentSuite) == null ? void 0 : _a.tasks.push(task);
}
async function runWithSuite(suite, fn) {
  const prev = context.currentSuite;
  context.currentSuite = suite;
  await fn();
  context.currentSuite = prev;
}
function getDefaultTestTimeout() {
  return process.__vitest_worker__.config.testTimeout;
}
function getDefaultHookTimeout() {
  return process.__vitest_worker__.config.hookTimeout;
}
function withTimeout(fn, _timeout) {
  const timeout = _timeout ?? getDefaultTestTimeout();
  if (timeout <= 0 || timeout === Infinity)
    return fn;
  return (...args) => {
    return Promise.race([fn(...args), new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        clearTimeout(timer);
        reject(new Error(`Test timed out in ${timeout}ms.`));
      }, timeout);
      timer.unref();
    })]);
  };
}
function ensureAsyncTest(fn) {
  if (!fn.length)
    return fn;
  return () => new Promise((resolve, reject) => {
    const done = (...args) => args[0] ? reject(args[0]) : resolve();
    fn(done);
  });
}
function normalizeTest(fn, timeout) {
  return withTimeout(ensureAsyncTest(fn), timeout);
}

const fnMap = new WeakMap();
const hooksMap = new WeakMap();
function setFn(key, fn) {
  fnMap.set(key, fn);
}
function getFn(key) {
  return fnMap.get(key);
}
function setHooks(key, hooks) {
  hooksMap.set(key, hooks);
}
function getHooks(key) {
  return hooksMap.get(key);
}

const suite = createSuite();
const test$7 = createChainable(["concurrent", "skip", "only", "todo", "fails"], function(name, fn, timeout) {
  getCurrentSuite().test.fn.call(this, name, fn, timeout);
});
const describe = suite;
const it = test$7;
const defaultSuite = suite("");
function clearContext() {
  context.tasks.length = 0;
  defaultSuite.clear();
  context.currentSuite = defaultSuite;
}
function getCurrentSuite() {
  return context.currentSuite || defaultSuite;
}
function createSuiteHooks() {
  return {
    beforeAll: [],
    afterAll: [],
    beforeEach: [],
    afterEach: []
  };
}
function createSuiteCollector(name, factory = () => {
}, mode, concurrent) {
  const tasks = [];
  const factoryQueue = [];
  let suite2;
  initSuite();
  const test2 = createChainable(["concurrent", "skip", "only", "todo", "fails"], function(name2, fn, timeout) {
    const mode2 = this.only ? "only" : this.skip ? "skip" : this.todo ? "todo" : "run";
    const test3 = {
      id: "",
      type: "test",
      name: name2,
      mode: mode2,
      suite: void 0,
      fails: this.fails
    };
    if (this.concurrent || concurrent)
      test3.concurrent = true;
    setFn(test3, normalizeTest(fn || noop, timeout));
    tasks.push(test3);
  });
  const collector = {
    type: "collector",
    name,
    mode,
    test: test2,
    tasks,
    collect,
    clear,
    on: addHook
  };
  function addHook(name2, ...fn) {
    getHooks(suite2)[name2].push(...fn);
  }
  function initSuite() {
    suite2 = {
      id: "",
      type: "suite",
      name,
      mode,
      tasks: []
    };
    setHooks(suite2, createSuiteHooks());
  }
  function clear() {
    tasks.length = 0;
    factoryQueue.length = 0;
    initSuite();
  }
  async function collect(file) {
    factoryQueue.length = 0;
    if (factory)
      await runWithSuite(collector, () => factory(test2));
    const allChildren = await Promise.all([...factoryQueue, ...tasks].map((i) => i.type === "collector" ? i.collect(file) : i));
    suite2.file = file;
    suite2.tasks = allChildren;
    allChildren.forEach((task) => {
      task.suite = suite2;
      if (file)
        task.file = file;
    });
    return suite2;
  }
  collectTask(collector);
  return collector;
}
function createSuite() {
  return createChainable(["concurrent", "skip", "only", "todo"], function(name, factory) {
    const mode = this.only ? "only" : this.skip ? "skip" : this.todo ? "todo" : "run";
    return createSuiteCollector(name, factory, mode, this.concurrent);
  });
}

var build = {};

var ansiStyles = {exports: {}};

(function (module) {

const ANSI_BACKGROUND_OFFSET = 10;

const wrapAnsi256 = (offset = 0) => code => `\u001B[${38 + offset};5;${code}m`;

const wrapAnsi16m = (offset = 0) => (red, green, blue) => `\u001B[${38 + offset};2;${red};${green};${blue}m`;

function assembleStyles() {
	const codes = new Map();
	const styles = {
		modifier: {
			reset: [0, 0],
			// 21 isn't widely supported and 22 does the same thing
			bold: [1, 22],
			dim: [2, 22],
			italic: [3, 23],
			underline: [4, 24],
			overline: [53, 55],
			inverse: [7, 27],
			hidden: [8, 28],
			strikethrough: [9, 29]
		},
		color: {
			black: [30, 39],
			red: [31, 39],
			green: [32, 39],
			yellow: [33, 39],
			blue: [34, 39],
			magenta: [35, 39],
			cyan: [36, 39],
			white: [37, 39],

			// Bright color
			blackBright: [90, 39],
			redBright: [91, 39],
			greenBright: [92, 39],
			yellowBright: [93, 39],
			blueBright: [94, 39],
			magentaBright: [95, 39],
			cyanBright: [96, 39],
			whiteBright: [97, 39]
		},
		bgColor: {
			bgBlack: [40, 49],
			bgRed: [41, 49],
			bgGreen: [42, 49],
			bgYellow: [43, 49],
			bgBlue: [44, 49],
			bgMagenta: [45, 49],
			bgCyan: [46, 49],
			bgWhite: [47, 49],

			// Bright color
			bgBlackBright: [100, 49],
			bgRedBright: [101, 49],
			bgGreenBright: [102, 49],
			bgYellowBright: [103, 49],
			bgBlueBright: [104, 49],
			bgMagentaBright: [105, 49],
			bgCyanBright: [106, 49],
			bgWhiteBright: [107, 49]
		}
	};

	// Alias bright black as gray (and grey)
	styles.color.gray = styles.color.blackBright;
	styles.bgColor.bgGray = styles.bgColor.bgBlackBright;
	styles.color.grey = styles.color.blackBright;
	styles.bgColor.bgGrey = styles.bgColor.bgBlackBright;

	for (const [groupName, group] of Object.entries(styles)) {
		for (const [styleName, style] of Object.entries(group)) {
			styles[styleName] = {
				open: `\u001B[${style[0]}m`,
				close: `\u001B[${style[1]}m`
			};

			group[styleName] = styles[styleName];

			codes.set(style[0], style[1]);
		}

		Object.defineProperty(styles, groupName, {
			value: group,
			enumerable: false
		});
	}

	Object.defineProperty(styles, 'codes', {
		value: codes,
		enumerable: false
	});

	styles.color.close = '\u001B[39m';
	styles.bgColor.close = '\u001B[49m';

	styles.color.ansi256 = wrapAnsi256();
	styles.color.ansi16m = wrapAnsi16m();
	styles.bgColor.ansi256 = wrapAnsi256(ANSI_BACKGROUND_OFFSET);
	styles.bgColor.ansi16m = wrapAnsi16m(ANSI_BACKGROUND_OFFSET);

	// From https://github.com/Qix-/color-convert/blob/3f0e0d4e92e235796ccb17f6e85c72094a651f49/conversions.js
	Object.defineProperties(styles, {
		rgbToAnsi256: {
			value: (red, green, blue) => {
				// We use the extended greyscale palette here, with the exception of
				// black and white. normal palette only has 4 greyscale shades.
				if (red === green && green === blue) {
					if (red < 8) {
						return 16;
					}

					if (red > 248) {
						return 231;
					}

					return Math.round(((red - 8) / 247) * 24) + 232;
				}

				return 16 +
					(36 * Math.round(red / 255 * 5)) +
					(6 * Math.round(green / 255 * 5)) +
					Math.round(blue / 255 * 5);
			},
			enumerable: false
		},
		hexToRgb: {
			value: hex => {
				const matches = /(?<colorString>[a-f\d]{6}|[a-f\d]{3})/i.exec(hex.toString(16));
				if (!matches) {
					return [0, 0, 0];
				}

				let {colorString} = matches.groups;

				if (colorString.length === 3) {
					colorString = colorString.split('').map(character => character + character).join('');
				}

				const integer = Number.parseInt(colorString, 16);

				return [
					(integer >> 16) & 0xFF,
					(integer >> 8) & 0xFF,
					integer & 0xFF
				];
			},
			enumerable: false
		},
		hexToAnsi256: {
			value: hex => styles.rgbToAnsi256(...styles.hexToRgb(hex)),
			enumerable: false
		}
	});

	return styles;
}

// Make the export immutable
Object.defineProperty(module, 'exports', {
	enumerable: true,
	get: assembleStyles
});
}(ansiStyles));

var collections = {};

Object.defineProperty(collections, '__esModule', {
  value: true
});
collections.printIteratorEntries = printIteratorEntries;
collections.printIteratorValues = printIteratorValues;
collections.printListItems = printListItems;
collections.printObjectProperties = printObjectProperties;

/**
 * Copyright (c) Facebook, Inc. and its affiliates. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */
const getKeysOfEnumerableProperties = (object, compareKeys) => {
  const keys = Object.keys(object).sort(compareKeys);

  if (Object.getOwnPropertySymbols) {
    Object.getOwnPropertySymbols(object).forEach(symbol => {
      if (Object.getOwnPropertyDescriptor(object, symbol).enumerable) {
        keys.push(symbol);
      }
    });
  }

  return keys;
};
/**
 * Return entries (for example, of a map)
 * with spacing, indentation, and comma
 * without surrounding punctuation (for example, braces)
 */

function printIteratorEntries(
  iterator,
  config,
  indentation,
  depth,
  refs,
  printer, // Too bad, so sad that separator for ECMAScript Map has been ' => '
  // What a distracting diff if you change a data structure to/from
  // ECMAScript Object or Immutable.Map/OrderedMap which use the default.
  separator = ': '
) {
  let result = '';
  let current = iterator.next();

  if (!current.done) {
    result += config.spacingOuter;
    const indentationNext = indentation + config.indent;

    while (!current.done) {
      const name = printer(
        current.value[0],
        config,
        indentationNext,
        depth,
        refs
      );
      const value = printer(
        current.value[1],
        config,
        indentationNext,
        depth,
        refs
      );
      result += indentationNext + name + separator + value;
      current = iterator.next();

      if (!current.done) {
        result += ',' + config.spacingInner;
      } else if (!config.min) {
        result += ',';
      }
    }

    result += config.spacingOuter + indentation;
  }

  return result;
}
/**
 * Return values (for example, of a set)
 * with spacing, indentation, and comma
 * without surrounding punctuation (braces or brackets)
 */

function printIteratorValues(
  iterator,
  config,
  indentation,
  depth,
  refs,
  printer
) {
  let result = '';
  let current = iterator.next();

  if (!current.done) {
    result += config.spacingOuter;
    const indentationNext = indentation + config.indent;

    while (!current.done) {
      result +=
        indentationNext +
        printer(current.value, config, indentationNext, depth, refs);
      current = iterator.next();

      if (!current.done) {
        result += ',' + config.spacingInner;
      } else if (!config.min) {
        result += ',';
      }
    }

    result += config.spacingOuter + indentation;
  }

  return result;
}
/**
 * Return items (for example, of an array)
 * with spacing, indentation, and comma
 * without surrounding punctuation (for example, brackets)
 **/

function printListItems(list, config, indentation, depth, refs, printer) {
  let result = '';

  if (list.length) {
    result += config.spacingOuter;
    const indentationNext = indentation + config.indent;

    for (let i = 0; i < list.length; i++) {
      result += indentationNext;

      if (i in list) {
        result += printer(list[i], config, indentationNext, depth, refs);
      }

      if (i < list.length - 1) {
        result += ',' + config.spacingInner;
      } else if (!config.min) {
        result += ',';
      }
    }

    result += config.spacingOuter + indentation;
  }

  return result;
}
/**
 * Return properties of an object
 * with spacing, indentation, and comma
 * without surrounding punctuation (for example, braces)
 */

function printObjectProperties(val, config, indentation, depth, refs, printer) {
  let result = '';
  const keys = getKeysOfEnumerableProperties(val, config.compareKeys);

  if (keys.length) {
    result += config.spacingOuter;
    const indentationNext = indentation + config.indent;

    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      const name = printer(key, config, indentationNext, depth, refs);
      const value = printer(val[key], config, indentationNext, depth, refs);
      result += indentationNext + name + ': ' + value;

      if (i < keys.length - 1) {
        result += ',' + config.spacingInner;
      } else if (!config.min) {
        result += ',';
      }
    }

    result += config.spacingOuter + indentation;
  }

  return result;
}

var AsymmetricMatcher$1 = {};

Object.defineProperty(AsymmetricMatcher$1, '__esModule', {
  value: true
});
AsymmetricMatcher$1.test = AsymmetricMatcher$1.serialize = AsymmetricMatcher$1.default = void 0;

var _collections$3 = collections;

var global$2 = (function () {
  if (typeof globalThis !== 'undefined') {
    return globalThis;
  } else if (typeof global$2 !== 'undefined') {
    return global$2;
  } else if (typeof self !== 'undefined') {
    return self;
  } else if (typeof window !== 'undefined') {
    return window;
  } else {
    return Function('return this')();
  }
})();

var Symbol$2 = global$2['jest-symbol-do-not-touch'] || global$2.Symbol;
const asymmetricMatcher =
  typeof Symbol$2 === 'function' && Symbol$2.for
    ? Symbol$2.for('jest.asymmetricMatcher')
    : 0x1357a5;
const SPACE$2 = ' ';

const serialize$6 = (val, config, indentation, depth, refs, printer) => {
  const stringedValue = val.toString();

  if (
    stringedValue === 'ArrayContaining' ||
    stringedValue === 'ArrayNotContaining'
  ) {
    if (++depth > config.maxDepth) {
      return '[' + stringedValue + ']';
    }

    return (
      stringedValue +
      SPACE$2 +
      '[' +
      (0, _collections$3.printListItems)(
        val.sample,
        config,
        indentation,
        depth,
        refs,
        printer
      ) +
      ']'
    );
  }

  if (
    stringedValue === 'ObjectContaining' ||
    stringedValue === 'ObjectNotContaining'
  ) {
    if (++depth > config.maxDepth) {
      return '[' + stringedValue + ']';
    }

    return (
      stringedValue +
      SPACE$2 +
      '{' +
      (0, _collections$3.printObjectProperties)(
        val.sample,
        config,
        indentation,
        depth,
        refs,
        printer
      ) +
      '}'
    );
  }

  if (
    stringedValue === 'StringMatching' ||
    stringedValue === 'StringNotMatching'
  ) {
    return (
      stringedValue +
      SPACE$2 +
      printer(val.sample, config, indentation, depth, refs)
    );
  }

  if (
    stringedValue === 'StringContaining' ||
    stringedValue === 'StringNotContaining'
  ) {
    return (
      stringedValue +
      SPACE$2 +
      printer(val.sample, config, indentation, depth, refs)
    );
  }

  return val.toAsymmetricMatcher();
};

AsymmetricMatcher$1.serialize = serialize$6;

const test$6 = val => val && val.$$typeof === asymmetricMatcher;

AsymmetricMatcher$1.test = test$6;
const plugin$6 = {
  serialize: serialize$6,
  test: test$6
};
var _default$7 = plugin$6;
AsymmetricMatcher$1.default = _default$7;

var ConvertAnsi = {};

var ansiRegex = ({onlyFirst = false} = {}) => {
	const pattern = [
		'[\\u001B\\u009B][[\\]()#;?]*(?:(?:(?:(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]+)*|[a-zA-Z\\d]+(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]*)*)?\\u0007)',
		'(?:(?:\\d{1,4}(?:;\\d{0,4})*)?[\\dA-PR-TZcf-ntqry=><~]))'
	].join('|');

	return new RegExp(pattern, onlyFirst ? undefined : 'g');
};

Object.defineProperty(ConvertAnsi, '__esModule', {
  value: true
});
ConvertAnsi.test = ConvertAnsi.serialize = ConvertAnsi.default = void 0;

var _ansiRegex = _interopRequireDefault$2(ansiRegex);

var _ansiStyles$1 = _interopRequireDefault$2(ansiStyles.exports);

function _interopRequireDefault$2(obj) {
  return obj && obj.__esModule ? obj : {default: obj};
}

/**
 * Copyright (c) Facebook, Inc. and its affiliates. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
const toHumanReadableAnsi = text =>
  text.replace((0, _ansiRegex.default)(), match => {
    switch (match) {
      case _ansiStyles$1.default.red.close:
      case _ansiStyles$1.default.green.close:
      case _ansiStyles$1.default.cyan.close:
      case _ansiStyles$1.default.gray.close:
      case _ansiStyles$1.default.white.close:
      case _ansiStyles$1.default.yellow.close:
      case _ansiStyles$1.default.bgRed.close:
      case _ansiStyles$1.default.bgGreen.close:
      case _ansiStyles$1.default.bgYellow.close:
      case _ansiStyles$1.default.inverse.close:
      case _ansiStyles$1.default.dim.close:
      case _ansiStyles$1.default.bold.close:
      case _ansiStyles$1.default.reset.open:
      case _ansiStyles$1.default.reset.close:
        return '</>';

      case _ansiStyles$1.default.red.open:
        return '<red>';

      case _ansiStyles$1.default.green.open:
        return '<green>';

      case _ansiStyles$1.default.cyan.open:
        return '<cyan>';

      case _ansiStyles$1.default.gray.open:
        return '<gray>';

      case _ansiStyles$1.default.white.open:
        return '<white>';

      case _ansiStyles$1.default.yellow.open:
        return '<yellow>';

      case _ansiStyles$1.default.bgRed.open:
        return '<bgRed>';

      case _ansiStyles$1.default.bgGreen.open:
        return '<bgGreen>';

      case _ansiStyles$1.default.bgYellow.open:
        return '<bgYellow>';

      case _ansiStyles$1.default.inverse.open:
        return '<inverse>';

      case _ansiStyles$1.default.dim.open:
        return '<dim>';

      case _ansiStyles$1.default.bold.open:
        return '<bold>';

      default:
        return '';
    }
  });

const test$5 = val =>
  typeof val === 'string' && !!val.match((0, _ansiRegex.default)());

ConvertAnsi.test = test$5;

const serialize$5 = (val, config, indentation, depth, refs, printer) =>
  printer(toHumanReadableAnsi(val), config, indentation, depth, refs);

ConvertAnsi.serialize = serialize$5;
const plugin$5 = {
  serialize: serialize$5,
  test: test$5
};
var _default$6 = plugin$5;
ConvertAnsi.default = _default$6;

var DOMCollection$1 = {};

Object.defineProperty(DOMCollection$1, '__esModule', {
  value: true
});
DOMCollection$1.test = DOMCollection$1.serialize = DOMCollection$1.default = void 0;

var _collections$2 = collections;

/**
 * Copyright (c) Facebook, Inc. and its affiliates. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

/* eslint-disable local/ban-types-eventually */
const SPACE$1 = ' ';
const OBJECT_NAMES = ['DOMStringMap', 'NamedNodeMap'];
const ARRAY_REGEXP = /^(HTML\w*Collection|NodeList)$/;

const testName = name =>
  OBJECT_NAMES.indexOf(name) !== -1 || ARRAY_REGEXP.test(name);

const test$4 = val =>
  val &&
  val.constructor &&
  !!val.constructor.name &&
  testName(val.constructor.name);

DOMCollection$1.test = test$4;

const isNamedNodeMap = collection =>
  collection.constructor.name === 'NamedNodeMap';

const serialize$4 = (collection, config, indentation, depth, refs, printer) => {
  const name = collection.constructor.name;

  if (++depth > config.maxDepth) {
    return '[' + name + ']';
  }

  return (
    (config.min ? '' : name + SPACE$1) +
    (OBJECT_NAMES.indexOf(name) !== -1
      ? '{' +
        (0, _collections$2.printObjectProperties)(
          isNamedNodeMap(collection)
            ? Array.from(collection).reduce((props, attribute) => {
                props[attribute.name] = attribute.value;
                return props;
              }, {})
            : {...collection},
          config,
          indentation,
          depth,
          refs,
          printer
        ) +
        '}'
      : '[' +
        (0, _collections$2.printListItems)(
          Array.from(collection),
          config,
          indentation,
          depth,
          refs,
          printer
        ) +
        ']')
  );
};

DOMCollection$1.serialize = serialize$4;
const plugin$4 = {
  serialize: serialize$4,
  test: test$4
};
var _default$5 = plugin$4;
DOMCollection$1.default = _default$5;

var DOMElement$1 = {};

var markup = {};

var escapeHTML$1 = {};

Object.defineProperty(escapeHTML$1, '__esModule', {
  value: true
});
escapeHTML$1.default = escapeHTML;

/**
 * Copyright (c) Facebook, Inc. and its affiliates. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
function escapeHTML(str) {
  return str.replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

Object.defineProperty(markup, '__esModule', {
  value: true
});
markup.printText =
  markup.printProps =
  markup.printElementAsLeaf =
  markup.printElement =
  markup.printComment =
  markup.printChildren =
    void 0;

var _escapeHTML = _interopRequireDefault$1(escapeHTML$1);

function _interopRequireDefault$1(obj) {
  return obj && obj.__esModule ? obj : {default: obj};
}

/**
 * Copyright (c) Facebook, Inc. and its affiliates. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
// Return empty string if keys is empty.
const printProps = (keys, props, config, indentation, depth, refs, printer) => {
  const indentationNext = indentation + config.indent;
  const colors = config.colors;
  return keys
    .map(key => {
      const value = props[key];
      let printed = printer(value, config, indentationNext, depth, refs);

      if (typeof value !== 'string') {
        if (printed.indexOf('\n') !== -1) {
          printed =
            config.spacingOuter +
            indentationNext +
            printed +
            config.spacingOuter +
            indentation;
        }

        printed = '{' + printed + '}';
      }

      return (
        config.spacingInner +
        indentation +
        colors.prop.open +
        key +
        colors.prop.close +
        '=' +
        colors.value.open +
        printed +
        colors.value.close
      );
    })
    .join('');
}; // Return empty string if children is empty.

markup.printProps = printProps;

const printChildren = (children, config, indentation, depth, refs, printer) =>
  children
    .map(
      child =>
        config.spacingOuter +
        indentation +
        (typeof child === 'string'
          ? printText(child, config)
          : printer(child, config, indentation, depth, refs))
    )
    .join('');

markup.printChildren = printChildren;

const printText = (text, config) => {
  const contentColor = config.colors.content;
  return (
    contentColor.open + (0, _escapeHTML.default)(text) + contentColor.close
  );
};

markup.printText = printText;

const printComment = (comment, config) => {
  const commentColor = config.colors.comment;
  return (
    commentColor.open +
    '<!--' +
    (0, _escapeHTML.default)(comment) +
    '-->' +
    commentColor.close
  );
}; // Separate the functions to format props, children, and element,
// so a plugin could override a particular function, if needed.
// Too bad, so sad: the traditional (but unnecessary) space
// in a self-closing tagColor requires a second test of printedProps.

markup.printComment = printComment;

const printElement = (
  type,
  printedProps,
  printedChildren,
  config,
  indentation
) => {
  const tagColor = config.colors.tag;
  return (
    tagColor.open +
    '<' +
    type +
    (printedProps &&
      tagColor.close +
        printedProps +
        config.spacingOuter +
        indentation +
        tagColor.open) +
    (printedChildren
      ? '>' +
        tagColor.close +
        printedChildren +
        config.spacingOuter +
        indentation +
        tagColor.open +
        '</' +
        type
      : (printedProps && !config.min ? '' : ' ') + '/') +
    '>' +
    tagColor.close
  );
};

markup.printElement = printElement;

const printElementAsLeaf = (type, config) => {
  const tagColor = config.colors.tag;
  return (
    tagColor.open +
    '<' +
    type +
    tagColor.close +
    ' …' +
    tagColor.open +
    ' />' +
    tagColor.close
  );
};

markup.printElementAsLeaf = printElementAsLeaf;

Object.defineProperty(DOMElement$1, '__esModule', {
  value: true
});
DOMElement$1.test = DOMElement$1.serialize = DOMElement$1.default = void 0;

var _markup$2 = markup;

/**
 * Copyright (c) Facebook, Inc. and its affiliates. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
const ELEMENT_NODE = 1;
const TEXT_NODE = 3;
const COMMENT_NODE = 8;
const FRAGMENT_NODE = 11;
const ELEMENT_REGEXP = /^((HTML|SVG)\w*)?Element$/;

const testHasAttribute = val => {
  try {
    return typeof val.hasAttribute === 'function' && val.hasAttribute('is');
  } catch {
    return false;
  }
};

const testNode = val => {
  const constructorName = val.constructor.name;
  const {nodeType, tagName} = val;
  const isCustomElement =
    (typeof tagName === 'string' && tagName.includes('-')) ||
    testHasAttribute(val);
  return (
    (nodeType === ELEMENT_NODE &&
      (ELEMENT_REGEXP.test(constructorName) || isCustomElement)) ||
    (nodeType === TEXT_NODE && constructorName === 'Text') ||
    (nodeType === COMMENT_NODE && constructorName === 'Comment') ||
    (nodeType === FRAGMENT_NODE && constructorName === 'DocumentFragment')
  );
};

const test$3 = val => {
  var _val$constructor;

  return (
    (val === null || val === void 0
      ? void 0
      : (_val$constructor = val.constructor) === null ||
        _val$constructor === void 0
      ? void 0
      : _val$constructor.name) && testNode(val)
  );
};

DOMElement$1.test = test$3;

function nodeIsText(node) {
  return node.nodeType === TEXT_NODE;
}

function nodeIsComment(node) {
  return node.nodeType === COMMENT_NODE;
}

function nodeIsFragment(node) {
  return node.nodeType === FRAGMENT_NODE;
}

const serialize$3 = (node, config, indentation, depth, refs, printer) => {
  if (nodeIsText(node)) {
    return (0, _markup$2.printText)(node.data, config);
  }

  if (nodeIsComment(node)) {
    return (0, _markup$2.printComment)(node.data, config);
  }

  const type = nodeIsFragment(node)
    ? `DocumentFragment`
    : node.tagName.toLowerCase();

  if (++depth > config.maxDepth) {
    return (0, _markup$2.printElementAsLeaf)(type, config);
  }

  return (0, _markup$2.printElement)(
    type,
    (0, _markup$2.printProps)(
      nodeIsFragment(node)
        ? []
        : Array.from(node.attributes)
            .map(attr => attr.name)
            .sort(),
      nodeIsFragment(node)
        ? {}
        : Array.from(node.attributes).reduce((props, attribute) => {
            props[attribute.name] = attribute.value;
            return props;
          }, {}),
      config,
      indentation + config.indent,
      depth,
      refs,
      printer
    ),
    (0, _markup$2.printChildren)(
      Array.prototype.slice.call(node.childNodes || node.children),
      config,
      indentation + config.indent,
      depth,
      refs,
      printer
    ),
    config,
    indentation
  );
};

DOMElement$1.serialize = serialize$3;
const plugin$3 = {
  serialize: serialize$3,
  test: test$3
};
var _default$4 = plugin$3;
DOMElement$1.default = _default$4;

var Immutable$1 = {};

Object.defineProperty(Immutable$1, '__esModule', {
  value: true
});
Immutable$1.test = Immutable$1.serialize = Immutable$1.default = void 0;

var _collections$1 = collections;

/**
 * Copyright (c) Facebook, Inc. and its affiliates. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
// SENTINEL constants are from https://github.com/facebook/immutable-js
const IS_ITERABLE_SENTINEL = '@@__IMMUTABLE_ITERABLE__@@';
const IS_LIST_SENTINEL = '@@__IMMUTABLE_LIST__@@';
const IS_KEYED_SENTINEL$1 = '@@__IMMUTABLE_KEYED__@@';
const IS_MAP_SENTINEL = '@@__IMMUTABLE_MAP__@@';
const IS_ORDERED_SENTINEL$1 = '@@__IMMUTABLE_ORDERED__@@';
const IS_RECORD_SENTINEL = '@@__IMMUTABLE_RECORD__@@'; // immutable v4

const IS_SEQ_SENTINEL = '@@__IMMUTABLE_SEQ__@@';
const IS_SET_SENTINEL$1 = '@@__IMMUTABLE_SET__@@';
const IS_STACK_SENTINEL = '@@__IMMUTABLE_STACK__@@';

const getImmutableName = name => 'Immutable.' + name;

const printAsLeaf = name => '[' + name + ']';

const SPACE = ' ';
const LAZY = '…'; // Seq is lazy if it calls a method like filter

const printImmutableEntries = (
  val,
  config,
  indentation,
  depth,
  refs,
  printer,
  type
) =>
  ++depth > config.maxDepth
    ? printAsLeaf(getImmutableName(type))
    : getImmutableName(type) +
      SPACE +
      '{' +
      (0, _collections$1.printIteratorEntries)(
        val.entries(),
        config,
        indentation,
        depth,
        refs,
        printer
      ) +
      '}'; // Record has an entries method because it is a collection in immutable v3.
// Return an iterator for Immutable Record from version v3 or v4.

function getRecordEntries(val) {
  let i = 0;
  return {
    next() {
      if (i < val._keys.length) {
        const key = val._keys[i++];
        return {
          done: false,
          value: [key, val.get(key)]
        };
      }

      return {
        done: true,
        value: undefined
      };
    }
  };
}

const printImmutableRecord = (
  val,
  config,
  indentation,
  depth,
  refs,
  printer
) => {
  // _name property is defined only for an Immutable Record instance
  // which was constructed with a second optional descriptive name arg
  const name = getImmutableName(val._name || 'Record');
  return ++depth > config.maxDepth
    ? printAsLeaf(name)
    : name +
        SPACE +
        '{' +
        (0, _collections$1.printIteratorEntries)(
          getRecordEntries(val),
          config,
          indentation,
          depth,
          refs,
          printer
        ) +
        '}';
};

const printImmutableSeq = (val, config, indentation, depth, refs, printer) => {
  const name = getImmutableName('Seq');

  if (++depth > config.maxDepth) {
    return printAsLeaf(name);
  }

  if (val[IS_KEYED_SENTINEL$1]) {
    return (
      name +
      SPACE +
      '{' + // from Immutable collection of entries or from ECMAScript object
      (val._iter || val._object
        ? (0, _collections$1.printIteratorEntries)(
            val.entries(),
            config,
            indentation,
            depth,
            refs,
            printer
          )
        : LAZY) +
      '}'
    );
  }

  return (
    name +
    SPACE +
    '[' +
    (val._iter || // from Immutable collection of values
    val._array || // from ECMAScript array
    val._collection || // from ECMAScript collection in immutable v4
    val._iterable // from ECMAScript collection in immutable v3
      ? (0, _collections$1.printIteratorValues)(
          val.values(),
          config,
          indentation,
          depth,
          refs,
          printer
        )
      : LAZY) +
    ']'
  );
};

const printImmutableValues = (
  val,
  config,
  indentation,
  depth,
  refs,
  printer,
  type
) =>
  ++depth > config.maxDepth
    ? printAsLeaf(getImmutableName(type))
    : getImmutableName(type) +
      SPACE +
      '[' +
      (0, _collections$1.printIteratorValues)(
        val.values(),
        config,
        indentation,
        depth,
        refs,
        printer
      ) +
      ']';

const serialize$2 = (val, config, indentation, depth, refs, printer) => {
  if (val[IS_MAP_SENTINEL]) {
    return printImmutableEntries(
      val,
      config,
      indentation,
      depth,
      refs,
      printer,
      val[IS_ORDERED_SENTINEL$1] ? 'OrderedMap' : 'Map'
    );
  }

  if (val[IS_LIST_SENTINEL]) {
    return printImmutableValues(
      val,
      config,
      indentation,
      depth,
      refs,
      printer,
      'List'
    );
  }

  if (val[IS_SET_SENTINEL$1]) {
    return printImmutableValues(
      val,
      config,
      indentation,
      depth,
      refs,
      printer,
      val[IS_ORDERED_SENTINEL$1] ? 'OrderedSet' : 'Set'
    );
  }

  if (val[IS_STACK_SENTINEL]) {
    return printImmutableValues(
      val,
      config,
      indentation,
      depth,
      refs,
      printer,
      'Stack'
    );
  }

  if (val[IS_SEQ_SENTINEL]) {
    return printImmutableSeq(val, config, indentation, depth, refs, printer);
  } // For compatibility with immutable v3 and v4, let record be the default.

  return printImmutableRecord(val, config, indentation, depth, refs, printer);
}; // Explicitly comparing sentinel properties to true avoids false positive
// when mock identity-obj-proxy returns the key as the value for any key.

Immutable$1.serialize = serialize$2;

const test$2 = val =>
  val &&
  (val[IS_ITERABLE_SENTINEL] === true || val[IS_RECORD_SENTINEL] === true);

Immutable$1.test = test$2;
const plugin$2 = {
  serialize: serialize$2,
  test: test$2
};
var _default$3 = plugin$2;
Immutable$1.default = _default$3;

var ReactElement$1 = {};

var reactIs = {exports: {}};

var reactIs_production_min = {};

/** @license React v17.0.2
 * react-is.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var b=60103,c=60106,d=60107,e=60108,f=60114,g=60109,h=60110,k=60112,l=60113,m=60120,n=60115,p=60116,q=60121,r=60122,u=60117,v=60129,w=60131;
if("function"===typeof Symbol&&Symbol.for){var x=Symbol.for;b=x("react.element");c=x("react.portal");d=x("react.fragment");e=x("react.strict_mode");f=x("react.profiler");g=x("react.provider");h=x("react.context");k=x("react.forward_ref");l=x("react.suspense");m=x("react.suspense_list");n=x("react.memo");p=x("react.lazy");q=x("react.block");r=x("react.server.block");u=x("react.fundamental");v=x("react.debug_trace_mode");w=x("react.legacy_hidden");}
function y(a){if("object"===typeof a&&null!==a){var t=a.$$typeof;switch(t){case b:switch(a=a.type,a){case d:case f:case e:case l:case m:return a;default:switch(a=a&&a.$$typeof,a){case h:case k:case p:case n:case g:return a;default:return t}}case c:return t}}}var z=g,A=b,B=k,C=d,D=p,E=n,F=c,G=f,H=e,I=l;reactIs_production_min.ContextConsumer=h;reactIs_production_min.ContextProvider=z;reactIs_production_min.Element=A;reactIs_production_min.ForwardRef=B;reactIs_production_min.Fragment=C;reactIs_production_min.Lazy=D;reactIs_production_min.Memo=E;reactIs_production_min.Portal=F;reactIs_production_min.Profiler=G;reactIs_production_min.StrictMode=H;
reactIs_production_min.Suspense=I;reactIs_production_min.isAsyncMode=function(){return !1};reactIs_production_min.isConcurrentMode=function(){return !1};reactIs_production_min.isContextConsumer=function(a){return y(a)===h};reactIs_production_min.isContextProvider=function(a){return y(a)===g};reactIs_production_min.isElement=function(a){return "object"===typeof a&&null!==a&&a.$$typeof===b};reactIs_production_min.isForwardRef=function(a){return y(a)===k};reactIs_production_min.isFragment=function(a){return y(a)===d};reactIs_production_min.isLazy=function(a){return y(a)===p};reactIs_production_min.isMemo=function(a){return y(a)===n};
reactIs_production_min.isPortal=function(a){return y(a)===c};reactIs_production_min.isProfiler=function(a){return y(a)===f};reactIs_production_min.isStrictMode=function(a){return y(a)===e};reactIs_production_min.isSuspense=function(a){return y(a)===l};reactIs_production_min.isValidElementType=function(a){return "string"===typeof a||"function"===typeof a||a===d||a===f||a===v||a===e||a===l||a===m||a===w||"object"===typeof a&&null!==a&&(a.$$typeof===p||a.$$typeof===n||a.$$typeof===g||a.$$typeof===h||a.$$typeof===k||a.$$typeof===u||a.$$typeof===q||a[0]===r)?!0:!1};
reactIs_production_min.typeOf=y;

var reactIs_development = {};

/** @license React v17.0.2
 * react-is.development.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

if (process.env.NODE_ENV !== "production") {
  (function() {

// ATTENTION
// When adding new symbols to this file,
// Please consider also adding to 'react-devtools-shared/src/backend/ReactSymbols'
// The Symbol used to tag the ReactElement-like types. If there is no native Symbol
// nor polyfill, then a plain number is used for performance.
var REACT_ELEMENT_TYPE = 0xeac7;
var REACT_PORTAL_TYPE = 0xeaca;
var REACT_FRAGMENT_TYPE = 0xeacb;
var REACT_STRICT_MODE_TYPE = 0xeacc;
var REACT_PROFILER_TYPE = 0xead2;
var REACT_PROVIDER_TYPE = 0xeacd;
var REACT_CONTEXT_TYPE = 0xeace;
var REACT_FORWARD_REF_TYPE = 0xead0;
var REACT_SUSPENSE_TYPE = 0xead1;
var REACT_SUSPENSE_LIST_TYPE = 0xead8;
var REACT_MEMO_TYPE = 0xead3;
var REACT_LAZY_TYPE = 0xead4;
var REACT_BLOCK_TYPE = 0xead9;
var REACT_SERVER_BLOCK_TYPE = 0xeada;
var REACT_FUNDAMENTAL_TYPE = 0xead5;
var REACT_DEBUG_TRACING_MODE_TYPE = 0xeae1;
var REACT_LEGACY_HIDDEN_TYPE = 0xeae3;

if (typeof Symbol === 'function' && Symbol.for) {
  var symbolFor = Symbol.for;
  REACT_ELEMENT_TYPE = symbolFor('react.element');
  REACT_PORTAL_TYPE = symbolFor('react.portal');
  REACT_FRAGMENT_TYPE = symbolFor('react.fragment');
  REACT_STRICT_MODE_TYPE = symbolFor('react.strict_mode');
  REACT_PROFILER_TYPE = symbolFor('react.profiler');
  REACT_PROVIDER_TYPE = symbolFor('react.provider');
  REACT_CONTEXT_TYPE = symbolFor('react.context');
  REACT_FORWARD_REF_TYPE = symbolFor('react.forward_ref');
  REACT_SUSPENSE_TYPE = symbolFor('react.suspense');
  REACT_SUSPENSE_LIST_TYPE = symbolFor('react.suspense_list');
  REACT_MEMO_TYPE = symbolFor('react.memo');
  REACT_LAZY_TYPE = symbolFor('react.lazy');
  REACT_BLOCK_TYPE = symbolFor('react.block');
  REACT_SERVER_BLOCK_TYPE = symbolFor('react.server.block');
  REACT_FUNDAMENTAL_TYPE = symbolFor('react.fundamental');
  symbolFor('react.scope');
  symbolFor('react.opaque.id');
  REACT_DEBUG_TRACING_MODE_TYPE = symbolFor('react.debug_trace_mode');
  symbolFor('react.offscreen');
  REACT_LEGACY_HIDDEN_TYPE = symbolFor('react.legacy_hidden');
}

// Filter certain DOM attributes (e.g. src, href) if their values are empty strings.

var enableScopeAPI = false; // Experimental Create Event Handle API.

function isValidElementType(type) {
  if (typeof type === 'string' || typeof type === 'function') {
    return true;
  } // Note: typeof might be other than 'symbol' or 'number' (e.g. if it's a polyfill).


  if (type === REACT_FRAGMENT_TYPE || type === REACT_PROFILER_TYPE || type === REACT_DEBUG_TRACING_MODE_TYPE || type === REACT_STRICT_MODE_TYPE || type === REACT_SUSPENSE_TYPE || type === REACT_SUSPENSE_LIST_TYPE || type === REACT_LEGACY_HIDDEN_TYPE || enableScopeAPI ) {
    return true;
  }

  if (typeof type === 'object' && type !== null) {
    if (type.$$typeof === REACT_LAZY_TYPE || type.$$typeof === REACT_MEMO_TYPE || type.$$typeof === REACT_PROVIDER_TYPE || type.$$typeof === REACT_CONTEXT_TYPE || type.$$typeof === REACT_FORWARD_REF_TYPE || type.$$typeof === REACT_FUNDAMENTAL_TYPE || type.$$typeof === REACT_BLOCK_TYPE || type[0] === REACT_SERVER_BLOCK_TYPE) {
      return true;
    }
  }

  return false;
}

function typeOf(object) {
  if (typeof object === 'object' && object !== null) {
    var $$typeof = object.$$typeof;

    switch ($$typeof) {
      case REACT_ELEMENT_TYPE:
        var type = object.type;

        switch (type) {
          case REACT_FRAGMENT_TYPE:
          case REACT_PROFILER_TYPE:
          case REACT_STRICT_MODE_TYPE:
          case REACT_SUSPENSE_TYPE:
          case REACT_SUSPENSE_LIST_TYPE:
            return type;

          default:
            var $$typeofType = type && type.$$typeof;

            switch ($$typeofType) {
              case REACT_CONTEXT_TYPE:
              case REACT_FORWARD_REF_TYPE:
              case REACT_LAZY_TYPE:
              case REACT_MEMO_TYPE:
              case REACT_PROVIDER_TYPE:
                return $$typeofType;

              default:
                return $$typeof;
            }

        }

      case REACT_PORTAL_TYPE:
        return $$typeof;
    }
  }

  return undefined;
}
var ContextConsumer = REACT_CONTEXT_TYPE;
var ContextProvider = REACT_PROVIDER_TYPE;
var Element = REACT_ELEMENT_TYPE;
var ForwardRef = REACT_FORWARD_REF_TYPE;
var Fragment = REACT_FRAGMENT_TYPE;
var Lazy = REACT_LAZY_TYPE;
var Memo = REACT_MEMO_TYPE;
var Portal = REACT_PORTAL_TYPE;
var Profiler = REACT_PROFILER_TYPE;
var StrictMode = REACT_STRICT_MODE_TYPE;
var Suspense = REACT_SUSPENSE_TYPE;
var hasWarnedAboutDeprecatedIsAsyncMode = false;
var hasWarnedAboutDeprecatedIsConcurrentMode = false; // AsyncMode should be deprecated

function isAsyncMode(object) {
  {
    if (!hasWarnedAboutDeprecatedIsAsyncMode) {
      hasWarnedAboutDeprecatedIsAsyncMode = true; // Using console['warn'] to evade Babel and ESLint

      console['warn']('The ReactIs.isAsyncMode() alias has been deprecated, ' + 'and will be removed in React 18+.');
    }
  }

  return false;
}
function isConcurrentMode(object) {
  {
    if (!hasWarnedAboutDeprecatedIsConcurrentMode) {
      hasWarnedAboutDeprecatedIsConcurrentMode = true; // Using console['warn'] to evade Babel and ESLint

      console['warn']('The ReactIs.isConcurrentMode() alias has been deprecated, ' + 'and will be removed in React 18+.');
    }
  }

  return false;
}
function isContextConsumer(object) {
  return typeOf(object) === REACT_CONTEXT_TYPE;
}
function isContextProvider(object) {
  return typeOf(object) === REACT_PROVIDER_TYPE;
}
function isElement(object) {
  return typeof object === 'object' && object !== null && object.$$typeof === REACT_ELEMENT_TYPE;
}
function isForwardRef(object) {
  return typeOf(object) === REACT_FORWARD_REF_TYPE;
}
function isFragment(object) {
  return typeOf(object) === REACT_FRAGMENT_TYPE;
}
function isLazy(object) {
  return typeOf(object) === REACT_LAZY_TYPE;
}
function isMemo(object) {
  return typeOf(object) === REACT_MEMO_TYPE;
}
function isPortal(object) {
  return typeOf(object) === REACT_PORTAL_TYPE;
}
function isProfiler(object) {
  return typeOf(object) === REACT_PROFILER_TYPE;
}
function isStrictMode(object) {
  return typeOf(object) === REACT_STRICT_MODE_TYPE;
}
function isSuspense(object) {
  return typeOf(object) === REACT_SUSPENSE_TYPE;
}

reactIs_development.ContextConsumer = ContextConsumer;
reactIs_development.ContextProvider = ContextProvider;
reactIs_development.Element = Element;
reactIs_development.ForwardRef = ForwardRef;
reactIs_development.Fragment = Fragment;
reactIs_development.Lazy = Lazy;
reactIs_development.Memo = Memo;
reactIs_development.Portal = Portal;
reactIs_development.Profiler = Profiler;
reactIs_development.StrictMode = StrictMode;
reactIs_development.Suspense = Suspense;
reactIs_development.isAsyncMode = isAsyncMode;
reactIs_development.isConcurrentMode = isConcurrentMode;
reactIs_development.isContextConsumer = isContextConsumer;
reactIs_development.isContextProvider = isContextProvider;
reactIs_development.isElement = isElement;
reactIs_development.isForwardRef = isForwardRef;
reactIs_development.isFragment = isFragment;
reactIs_development.isLazy = isLazy;
reactIs_development.isMemo = isMemo;
reactIs_development.isPortal = isPortal;
reactIs_development.isProfiler = isProfiler;
reactIs_development.isStrictMode = isStrictMode;
reactIs_development.isSuspense = isSuspense;
reactIs_development.isValidElementType = isValidElementType;
reactIs_development.typeOf = typeOf;
  })();
}

if (process.env.NODE_ENV === 'production') {
  reactIs.exports = reactIs_production_min;
} else {
  reactIs.exports = reactIs_development;
}

Object.defineProperty(ReactElement$1, '__esModule', {
  value: true
});
ReactElement$1.test = ReactElement$1.serialize = ReactElement$1.default = void 0;

var ReactIs = _interopRequireWildcard(reactIs.exports);

var _markup$1 = markup;

function _getRequireWildcardCache(nodeInterop) {
  if (typeof WeakMap !== 'function') return null;
  var cacheBabelInterop = new WeakMap();
  var cacheNodeInterop = new WeakMap();
  return (_getRequireWildcardCache = function (nodeInterop) {
    return nodeInterop ? cacheNodeInterop : cacheBabelInterop;
  })(nodeInterop);
}

function _interopRequireWildcard(obj, nodeInterop) {
  if (!nodeInterop && obj && obj.__esModule) {
    return obj;
  }
  if (obj === null || (typeof obj !== 'object' && typeof obj !== 'function')) {
    return {default: obj};
  }
  var cache = _getRequireWildcardCache(nodeInterop);
  if (cache && cache.has(obj)) {
    return cache.get(obj);
  }
  var newObj = {};
  var hasPropertyDescriptor =
    Object.defineProperty && Object.getOwnPropertyDescriptor;
  for (var key in obj) {
    if (key !== 'default' && Object.prototype.hasOwnProperty.call(obj, key)) {
      var desc = hasPropertyDescriptor
        ? Object.getOwnPropertyDescriptor(obj, key)
        : null;
      if (desc && (desc.get || desc.set)) {
        Object.defineProperty(newObj, key, desc);
      } else {
        newObj[key] = obj[key];
      }
    }
  }
  newObj.default = obj;
  if (cache) {
    cache.set(obj, newObj);
  }
  return newObj;
}

/**
 * Copyright (c) Facebook, Inc. and its affiliates. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
// Given element.props.children, or subtree during recursive traversal,
// return flattened array of children.
const getChildren = (arg, children = []) => {
  if (Array.isArray(arg)) {
    arg.forEach(item => {
      getChildren(item, children);
    });
  } else if (arg != null && arg !== false) {
    children.push(arg);
  }

  return children;
};

const getType = element => {
  const type = element.type;

  if (typeof type === 'string') {
    return type;
  }

  if (typeof type === 'function') {
    return type.displayName || type.name || 'Unknown';
  }

  if (ReactIs.isFragment(element)) {
    return 'React.Fragment';
  }

  if (ReactIs.isSuspense(element)) {
    return 'React.Suspense';
  }

  if (typeof type === 'object' && type !== null) {
    if (ReactIs.isContextProvider(element)) {
      return 'Context.Provider';
    }

    if (ReactIs.isContextConsumer(element)) {
      return 'Context.Consumer';
    }

    if (ReactIs.isForwardRef(element)) {
      if (type.displayName) {
        return type.displayName;
      }

      const functionName = type.render.displayName || type.render.name || '';
      return functionName !== ''
        ? 'ForwardRef(' + functionName + ')'
        : 'ForwardRef';
    }

    if (ReactIs.isMemo(element)) {
      const functionName =
        type.displayName || type.type.displayName || type.type.name || '';
      return functionName !== '' ? 'Memo(' + functionName + ')' : 'Memo';
    }
  }

  return 'UNDEFINED';
};

const getPropKeys$1 = element => {
  const {props} = element;
  return Object.keys(props)
    .filter(key => key !== 'children' && props[key] !== undefined)
    .sort();
};

const serialize$1 = (element, config, indentation, depth, refs, printer) =>
  ++depth > config.maxDepth
    ? (0, _markup$1.printElementAsLeaf)(getType(element), config)
    : (0, _markup$1.printElement)(
        getType(element),
        (0, _markup$1.printProps)(
          getPropKeys$1(element),
          element.props,
          config,
          indentation + config.indent,
          depth,
          refs,
          printer
        ),
        (0, _markup$1.printChildren)(
          getChildren(element.props.children),
          config,
          indentation + config.indent,
          depth,
          refs,
          printer
        ),
        config,
        indentation
      );

ReactElement$1.serialize = serialize$1;

const test$1 = val => val != null && ReactIs.isElement(val);

ReactElement$1.test = test$1;
const plugin$1 = {
  serialize: serialize$1,
  test: test$1
};
var _default$2 = plugin$1;
ReactElement$1.default = _default$2;

var ReactTestComponent$1 = {};

Object.defineProperty(ReactTestComponent$1, '__esModule', {
  value: true
});
ReactTestComponent$1.test = ReactTestComponent$1.serialize = ReactTestComponent$1.default = void 0;

var _markup = markup;

var global$1 = (function () {
  if (typeof globalThis !== 'undefined') {
    return globalThis;
  } else if (typeof global$1 !== 'undefined') {
    return global$1;
  } else if (typeof self !== 'undefined') {
    return self;
  } else if (typeof window !== 'undefined') {
    return window;
  } else {
    return Function('return this')();
  }
})();

var Symbol$1 = global$1['jest-symbol-do-not-touch'] || global$1.Symbol;
const testSymbol =
  typeof Symbol$1 === 'function' && Symbol$1.for
    ? Symbol$1.for('react.test.json')
    : 0xea71357;

const getPropKeys = object => {
  const {props} = object;
  return props
    ? Object.keys(props)
        .filter(key => props[key] !== undefined)
        .sort()
    : [];
};

const serialize = (object, config, indentation, depth, refs, printer) =>
  ++depth > config.maxDepth
    ? (0, _markup.printElementAsLeaf)(object.type, config)
    : (0, _markup.printElement)(
        object.type,
        object.props
          ? (0, _markup.printProps)(
              getPropKeys(object),
              object.props,
              config,
              indentation + config.indent,
              depth,
              refs,
              printer
            )
          : '',
        object.children
          ? (0, _markup.printChildren)(
              object.children,
              config,
              indentation + config.indent,
              depth,
              refs,
              printer
            )
          : '',
        config,
        indentation
      );

ReactTestComponent$1.serialize = serialize;

const test = val => val && val.$$typeof === testSymbol;

ReactTestComponent$1.test = test;
const plugin = {
  serialize,
  test
};
var _default$1 = plugin;
ReactTestComponent$1.default = _default$1;

Object.defineProperty(build, '__esModule', {
  value: true
});
build.default = build.DEFAULT_OPTIONS = void 0;
var format_1 = build.format = format;
var plugins_1 = build.plugins = void 0;

var _ansiStyles = _interopRequireDefault(ansiStyles.exports);

var _collections = collections;

var _AsymmetricMatcher = _interopRequireDefault(
  AsymmetricMatcher$1
);

var _ConvertAnsi = _interopRequireDefault(ConvertAnsi);

var _DOMCollection = _interopRequireDefault(DOMCollection$1);

var _DOMElement = _interopRequireDefault(DOMElement$1);

var _Immutable = _interopRequireDefault(Immutable$1);

var _ReactElement = _interopRequireDefault(ReactElement$1);

var _ReactTestComponent = _interopRequireDefault(
  ReactTestComponent$1
);

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : {default: obj};
}

/**
 * Copyright (c) Facebook, Inc. and its affiliates. All Rights Reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

/* eslint-disable local/ban-types-eventually */
const toString = Object.prototype.toString;
const toISOString = Date.prototype.toISOString;
const errorToString = Error.prototype.toString;
const regExpToString = RegExp.prototype.toString;
/**
 * Explicitly comparing typeof constructor to function avoids undefined as name
 * when mock identity-obj-proxy returns the key as the value for any key.
 */

const getConstructorName = val =>
  (typeof val.constructor === 'function' && val.constructor.name) || 'Object';
/* global window */

/** Is val is equal to global window object? Works even if it does not exist :) */

const isWindow = val => typeof window !== 'undefined' && val === window;

const SYMBOL_REGEXP = /^Symbol\((.*)\)(.*)$/;
const NEWLINE_REGEXP = /\n/gi;

class PrettyFormatPluginError extends Error {
  constructor(message, stack) {
    super(message);
    this.stack = stack;
    this.name = this.constructor.name;
  }
}

function isToStringedArrayType(toStringed) {
  return (
    toStringed === '[object Array]' ||
    toStringed === '[object ArrayBuffer]' ||
    toStringed === '[object DataView]' ||
    toStringed === '[object Float32Array]' ||
    toStringed === '[object Float64Array]' ||
    toStringed === '[object Int8Array]' ||
    toStringed === '[object Int16Array]' ||
    toStringed === '[object Int32Array]' ||
    toStringed === '[object Uint8Array]' ||
    toStringed === '[object Uint8ClampedArray]' ||
    toStringed === '[object Uint16Array]' ||
    toStringed === '[object Uint32Array]'
  );
}

function printNumber(val) {
  return Object.is(val, -0) ? '-0' : String(val);
}

function printBigInt(val) {
  return String(`${val}n`);
}

function printFunction(val, printFunctionName) {
  if (!printFunctionName) {
    return '[Function]';
  }

  return '[Function ' + (val.name || 'anonymous') + ']';
}

function printSymbol(val) {
  return String(val).replace(SYMBOL_REGEXP, 'Symbol($1)');
}

function printError(val) {
  return '[' + errorToString.call(val) + ']';
}
/**
 * The first port of call for printing an object, handles most of the
 * data-types in JS.
 */

function printBasicValue(val, printFunctionName, escapeRegex, escapeString) {
  if (val === true || val === false) {
    return '' + val;
  }

  if (val === undefined) {
    return 'undefined';
  }

  if (val === null) {
    return 'null';
  }

  const typeOf = typeof val;

  if (typeOf === 'number') {
    return printNumber(val);
  }

  if (typeOf === 'bigint') {
    return printBigInt(val);
  }

  if (typeOf === 'string') {
    if (escapeString) {
      return '"' + val.replace(/"|\\/g, '\\$&') + '"';
    }

    return '"' + val + '"';
  }

  if (typeOf === 'function') {
    return printFunction(val, printFunctionName);
  }

  if (typeOf === 'symbol') {
    return printSymbol(val);
  }

  const toStringed = toString.call(val);

  if (toStringed === '[object WeakMap]') {
    return 'WeakMap {}';
  }

  if (toStringed === '[object WeakSet]') {
    return 'WeakSet {}';
  }

  if (
    toStringed === '[object Function]' ||
    toStringed === '[object GeneratorFunction]'
  ) {
    return printFunction(val, printFunctionName);
  }

  if (toStringed === '[object Symbol]') {
    return printSymbol(val);
  }

  if (toStringed === '[object Date]') {
    return isNaN(+val) ? 'Date { NaN }' : toISOString.call(val);
  }

  if (toStringed === '[object Error]') {
    return printError(val);
  }

  if (toStringed === '[object RegExp]') {
    if (escapeRegex) {
      // https://github.com/benjamingr/RegExp.escape/blob/main/polyfill.js
      return regExpToString.call(val).replace(/[\\^$*+?.()|[\]{}]/g, '\\$&');
    }

    return regExpToString.call(val);
  }

  if (val instanceof Error) {
    return printError(val);
  }

  return null;
}
/**
 * Handles more complex objects ( such as objects with circular references.
 * maps and sets etc )
 */

function printComplexValue(
  val,
  config,
  indentation,
  depth,
  refs,
  hasCalledToJSON
) {
  if (refs.indexOf(val) !== -1) {
    return '[Circular]';
  }

  refs = refs.slice();
  refs.push(val);
  const hitMaxDepth = ++depth > config.maxDepth;
  const min = config.min;

  if (
    config.callToJSON &&
    !hitMaxDepth &&
    val.toJSON &&
    typeof val.toJSON === 'function' &&
    !hasCalledToJSON
  ) {
    return printer(val.toJSON(), config, indentation, depth, refs, true);
  }

  const toStringed = toString.call(val);

  if (toStringed === '[object Arguments]') {
    return hitMaxDepth
      ? '[Arguments]'
      : (min ? '' : 'Arguments ') +
          '[' +
          (0, _collections.printListItems)(
            val,
            config,
            indentation,
            depth,
            refs,
            printer
          ) +
          ']';
  }

  if (isToStringedArrayType(toStringed)) {
    return hitMaxDepth
      ? '[' + val.constructor.name + ']'
      : (min
          ? ''
          : !config.printBasicPrototype && val.constructor.name === 'Array'
          ? ''
          : val.constructor.name + ' ') +
          '[' +
          (0, _collections.printListItems)(
            val,
            config,
            indentation,
            depth,
            refs,
            printer
          ) +
          ']';
  }

  if (toStringed === '[object Map]') {
    return hitMaxDepth
      ? '[Map]'
      : 'Map {' +
          (0, _collections.printIteratorEntries)(
            val.entries(),
            config,
            indentation,
            depth,
            refs,
            printer,
            ' => '
          ) +
          '}';
  }

  if (toStringed === '[object Set]') {
    return hitMaxDepth
      ? '[Set]'
      : 'Set {' +
          (0, _collections.printIteratorValues)(
            val.values(),
            config,
            indentation,
            depth,
            refs,
            printer
          ) +
          '}';
  } // Avoid failure to serialize global window object in jsdom test environment.
  // For example, not even relevant if window is prop of React element.

  return hitMaxDepth || isWindow(val)
    ? '[' + getConstructorName(val) + ']'
    : (min
        ? ''
        : !config.printBasicPrototype && getConstructorName(val) === 'Object'
        ? ''
        : getConstructorName(val) + ' ') +
        '{' +
        (0, _collections.printObjectProperties)(
          val,
          config,
          indentation,
          depth,
          refs,
          printer
        ) +
        '}';
}

function isNewPlugin(plugin) {
  return plugin.serialize != null;
}

function printPlugin(plugin, val, config, indentation, depth, refs) {
  let printed;

  try {
    printed = isNewPlugin(plugin)
      ? plugin.serialize(val, config, indentation, depth, refs, printer)
      : plugin.print(
          val,
          valChild => printer(valChild, config, indentation, depth, refs),
          str => {
            const indentationNext = indentation + config.indent;
            return (
              indentationNext +
              str.replace(NEWLINE_REGEXP, '\n' + indentationNext)
            );
          },
          {
            edgeSpacing: config.spacingOuter,
            min: config.min,
            spacing: config.spacingInner
          },
          config.colors
        );
  } catch (error) {
    throw new PrettyFormatPluginError(error.message, error.stack);
  }

  if (typeof printed !== 'string') {
    throw new Error(
      `pretty-format: Plugin must return type "string" but instead returned "${typeof printed}".`
    );
  }

  return printed;
}

function findPlugin(plugins, val) {
  for (let p = 0; p < plugins.length; p++) {
    try {
      if (plugins[p].test(val)) {
        return plugins[p];
      }
    } catch (error) {
      throw new PrettyFormatPluginError(error.message, error.stack);
    }
  }

  return null;
}

function printer(val, config, indentation, depth, refs, hasCalledToJSON) {
  const plugin = findPlugin(config.plugins, val);

  if (plugin !== null) {
    return printPlugin(plugin, val, config, indentation, depth, refs);
  }

  const basicResult = printBasicValue(
    val,
    config.printFunctionName,
    config.escapeRegex,
    config.escapeString
  );

  if (basicResult !== null) {
    return basicResult;
  }

  return printComplexValue(
    val,
    config,
    indentation,
    depth,
    refs,
    hasCalledToJSON
  );
}

const DEFAULT_THEME = {
  comment: 'gray',
  content: 'reset',
  prop: 'yellow',
  tag: 'cyan',
  value: 'green'
};
const DEFAULT_THEME_KEYS = Object.keys(DEFAULT_THEME);
const DEFAULT_OPTIONS = {
  callToJSON: true,
  compareKeys: undefined,
  escapeRegex: false,
  escapeString: true,
  highlight: false,
  indent: 2,
  maxDepth: Infinity,
  min: false,
  plugins: [],
  printBasicPrototype: true,
  printFunctionName: true,
  theme: DEFAULT_THEME
};
build.DEFAULT_OPTIONS = DEFAULT_OPTIONS;

function validateOptions(options) {
  Object.keys(options).forEach(key => {
    if (!DEFAULT_OPTIONS.hasOwnProperty(key)) {
      throw new Error(`pretty-format: Unknown option "${key}".`);
    }
  });

  if (options.min && options.indent !== undefined && options.indent !== 0) {
    throw new Error(
      'pretty-format: Options "min" and "indent" cannot be used together.'
    );
  }

  if (options.theme !== undefined) {
    if (options.theme === null) {
      throw new Error(`pretty-format: Option "theme" must not be null.`);
    }

    if (typeof options.theme !== 'object') {
      throw new Error(
        `pretty-format: Option "theme" must be of type "object" but instead received "${typeof options.theme}".`
      );
    }
  }
}

const getColorsHighlight = options =>
  DEFAULT_THEME_KEYS.reduce((colors, key) => {
    const value =
      options.theme && options.theme[key] !== undefined
        ? options.theme[key]
        : DEFAULT_THEME[key];
    const color = value && _ansiStyles.default[value];

    if (
      color &&
      typeof color.close === 'string' &&
      typeof color.open === 'string'
    ) {
      colors[key] = color;
    } else {
      throw new Error(
        `pretty-format: Option "theme" has a key "${key}" whose value "${value}" is undefined in ansi-styles.`
      );
    }

    return colors;
  }, Object.create(null));

const getColorsEmpty = () =>
  DEFAULT_THEME_KEYS.reduce((colors, key) => {
    colors[key] = {
      close: '',
      open: ''
    };
    return colors;
  }, Object.create(null));

const getPrintFunctionName = options =>
  options && options.printFunctionName !== undefined
    ? options.printFunctionName
    : DEFAULT_OPTIONS.printFunctionName;

const getEscapeRegex = options =>
  options && options.escapeRegex !== undefined
    ? options.escapeRegex
    : DEFAULT_OPTIONS.escapeRegex;

const getEscapeString = options =>
  options && options.escapeString !== undefined
    ? options.escapeString
    : DEFAULT_OPTIONS.escapeString;

const getConfig = options => {
  var _options$printBasicPr;

  return {
    callToJSON:
      options && options.callToJSON !== undefined
        ? options.callToJSON
        : DEFAULT_OPTIONS.callToJSON,
    colors:
      options && options.highlight
        ? getColorsHighlight(options)
        : getColorsEmpty(),
    compareKeys:
      options && typeof options.compareKeys === 'function'
        ? options.compareKeys
        : DEFAULT_OPTIONS.compareKeys,
    escapeRegex: getEscapeRegex(options),
    escapeString: getEscapeString(options),
    indent:
      options && options.min
        ? ''
        : createIndent(
            options && options.indent !== undefined
              ? options.indent
              : DEFAULT_OPTIONS.indent
          ),
    maxDepth:
      options && options.maxDepth !== undefined
        ? options.maxDepth
        : DEFAULT_OPTIONS.maxDepth,
    min:
      options && options.min !== undefined ? options.min : DEFAULT_OPTIONS.min,
    plugins:
      options && options.plugins !== undefined
        ? options.plugins
        : DEFAULT_OPTIONS.plugins,
    printBasicPrototype:
      (_options$printBasicPr =
        options === null || options === void 0
          ? void 0
          : options.printBasicPrototype) !== null &&
      _options$printBasicPr !== void 0
        ? _options$printBasicPr
        : true,
    printFunctionName: getPrintFunctionName(options),
    spacingInner: options && options.min ? ' ' : '\n',
    spacingOuter: options && options.min ? '' : '\n'
  };
};

function createIndent(indent) {
  return new Array(indent + 1).join(' ');
}
/**
 * Returns a presentation string of your `val` object
 * @param val any potential JavaScript object
 * @param options Custom settings
 */

function format(val, options) {
  if (options) {
    validateOptions(options);

    if (options.plugins) {
      const plugin = findPlugin(options.plugins, val);

      if (plugin !== null) {
        return printPlugin(plugin, val, getConfig(options), '', 0, []);
      }
    }
  }

  const basicResult = printBasicValue(
    val,
    getPrintFunctionName(options),
    getEscapeRegex(options),
    getEscapeString(options)
  );

  if (basicResult !== null) {
    return basicResult;
  }

  return printComplexValue(val, getConfig(options), '', 0, []);
}

const plugins = {
  AsymmetricMatcher: _AsymmetricMatcher.default,
  ConvertAnsi: _ConvertAnsi.default,
  DOMCollection: _DOMCollection.default,
  DOMElement: _DOMElement.default,
  Immutable: _Immutable.default,
  ReactElement: _ReactElement.default,
  ReactTestComponent: _ReactTestComponent.default
};
plugins_1 = build.plugins = plugins;
var _default = format;
build.default = _default;

const {
  DOMCollection,
  DOMElement,
  Immutable,
  ReactElement,
  ReactTestComponent,
  AsymmetricMatcher
} = plugins_1;
let PLUGINS = [
  ReactTestComponent,
  ReactElement,
  DOMElement,
  DOMCollection,
  Immutable,
  AsymmetricMatcher
];
const addSerializer = (plugin) => {
  PLUGINS = [plugin].concat(PLUGINS);
};
const getSerializers = () => PLUGINS;

function equals(a, b, customTesters, strictCheck) {
  customTesters = customTesters || [];
  return eq(a, b, [], [], customTesters, strictCheck ? hasKey : hasDefinedKey);
}
function isAsymmetric(obj) {
  return !!obj && isA("Function", obj.asymmetricMatch);
}
function hasAsymmetric(obj, seen = new Set()) {
  if (seen.has(obj))
    return false;
  seen.add(obj);
  if (isAsymmetric(obj))
    return true;
  if (Array.isArray(obj))
    return obj.some((i) => hasAsymmetric(i, seen));
  if (obj instanceof Set)
    return Array.from(obj).some((i) => hasAsymmetric(i, seen));
  if (isObject(obj))
    return Object.values(obj).some((v) => hasAsymmetric(v, seen));
  return false;
}
function asymmetricMatch(a, b) {
  const asymmetricA = isAsymmetric(a);
  const asymmetricB = isAsymmetric(b);
  if (asymmetricA && asymmetricB)
    return void 0;
  if (asymmetricA)
    return a.asymmetricMatch(b);
  if (asymmetricB)
    return b.asymmetricMatch(a);
}
function eq(a, b, aStack, bStack, customTesters, hasKey2) {
  let result = true;
  const asymmetricResult = asymmetricMatch(a, b);
  if (asymmetricResult !== void 0)
    return asymmetricResult;
  for (let i = 0; i < customTesters.length; i++) {
    const customTesterResult = customTesters[i](a, b);
    if (customTesterResult !== void 0)
      return customTesterResult;
  }
  if (a instanceof Error && b instanceof Error)
    return a.message === b.message;
  if (Object.is(a, b))
    return true;
  if (a === null || b === null)
    return a === b;
  const className = Object.prototype.toString.call(a);
  if (className !== Object.prototype.toString.call(b))
    return false;
  switch (className) {
    case "[object Boolean]":
    case "[object String]":
    case "[object Number]":
      if (typeof a !== typeof b) {
        return false;
      } else if (typeof a !== "object" && typeof b !== "object") {
        return Object.is(a, b);
      } else {
        return Object.is(a.valueOf(), b.valueOf());
      }
    case "[object Date]":
      return +a === +b;
    case "[object RegExp]":
      return a.source === b.source && a.flags === b.flags;
  }
  if (typeof a !== "object" || typeof b !== "object")
    return false;
  if (isDomNode(a) && isDomNode(b))
    return a.isEqualNode(b);
  let length = aStack.length;
  while (length--) {
    if (aStack[length] === a)
      return bStack[length] === b;
    else if (bStack[length] === b)
      return false;
  }
  aStack.push(a);
  bStack.push(b);
  if (className === "[object Array]" && a.length !== b.length)
    return false;
  const aKeys = keys(a, hasKey2);
  let key;
  let size = aKeys.length;
  if (keys(b, hasKey2).length !== size)
    return false;
  while (size--) {
    key = aKeys[size];
    result = hasKey2(b, key) && eq(a[key], b[key], aStack, bStack, customTesters, hasKey2);
    if (!result)
      return false;
  }
  aStack.pop();
  bStack.pop();
  return result;
}
function keys(obj, hasKey2) {
  const keys2 = [];
  for (const key in obj) {
    if (hasKey2(obj, key))
      keys2.push(key);
  }
  return keys2.concat(Object.getOwnPropertySymbols(obj).filter((symbol) => Object.getOwnPropertyDescriptor(obj, symbol).enumerable));
}
function hasDefinedKey(obj, key) {
  return hasKey(obj, key) && obj[key] !== void 0;
}
function hasKey(obj, key) {
  return Object.prototype.hasOwnProperty.call(obj, key);
}
function isA(typeName, value) {
  return Object.prototype.toString.apply(value) === `[object ${typeName}]`;
}
function isDomNode(obj) {
  return obj !== null && typeof obj === "object" && typeof obj.nodeType === "number" && typeof obj.nodeName === "string" && typeof obj.isEqualNode === "function";
}
const IS_KEYED_SENTINEL = "@@__IMMUTABLE_KEYED__@@";
const IS_SET_SENTINEL = "@@__IMMUTABLE_SET__@@";
const IS_ORDERED_SENTINEL = "@@__IMMUTABLE_ORDERED__@@";
function isImmutableUnorderedKeyed(maybeKeyed) {
  return !!(maybeKeyed && maybeKeyed[IS_KEYED_SENTINEL] && !maybeKeyed[IS_ORDERED_SENTINEL]);
}
function isImmutableUnorderedSet(maybeSet) {
  return !!(maybeSet && maybeSet[IS_SET_SENTINEL] && !maybeSet[IS_ORDERED_SENTINEL]);
}
const IteratorSymbol = Symbol.iterator;
const hasIterator = (object) => !!(object != null && object[IteratorSymbol]);
const iterableEquality = (a, b, aStack = [], bStack = []) => {
  if (typeof a !== "object" || typeof b !== "object" || Array.isArray(a) || Array.isArray(b) || !hasIterator(a) || !hasIterator(b))
    return void 0;
  if (a.constructor !== b.constructor)
    return false;
  let length = aStack.length;
  while (length--) {
    if (aStack[length] === a)
      return bStack[length] === b;
  }
  aStack.push(a);
  bStack.push(b);
  const iterableEqualityWithStack = (a2, b2) => iterableEquality(a2, b2, [...aStack], [...bStack]);
  if (a.size !== void 0) {
    if (a.size !== b.size) {
      return false;
    } else if (isA("Set", a) || isImmutableUnorderedSet(a)) {
      let allFound = true;
      for (const aValue of a) {
        if (!b.has(aValue)) {
          let has = false;
          for (const bValue of b) {
            const isEqual = equals(aValue, bValue, [iterableEqualityWithStack]);
            if (isEqual === true)
              has = true;
          }
          if (has === false) {
            allFound = false;
            break;
          }
        }
      }
      aStack.pop();
      bStack.pop();
      return allFound;
    } else if (isA("Map", a) || isImmutableUnorderedKeyed(a)) {
      let allFound = true;
      for (const aEntry of a) {
        if (!b.has(aEntry[0]) || !equals(aEntry[1], b.get(aEntry[0]), [iterableEqualityWithStack])) {
          let has = false;
          for (const bEntry of b) {
            const matchedKey = equals(aEntry[0], bEntry[0], [
              iterableEqualityWithStack
            ]);
            let matchedValue = false;
            if (matchedKey === true) {
              matchedValue = equals(aEntry[1], bEntry[1], [
                iterableEqualityWithStack
              ]);
            }
            if (matchedValue === true)
              has = true;
          }
          if (has === false) {
            allFound = false;
            break;
          }
        }
      }
      aStack.pop();
      bStack.pop();
      return allFound;
    }
  }
  const bIterator = b[IteratorSymbol]();
  for (const aValue of a) {
    const nextB = bIterator.next();
    if (nextB.done || !equals(aValue, nextB.value, [iterableEqualityWithStack]))
      return false;
  }
  if (!bIterator.next().done)
    return false;
  aStack.pop();
  bStack.pop();
  return true;
};
const hasPropertyInObject = (object, key) => {
  const shouldTerminate = !object || typeof object !== "object" || object === Object.prototype;
  if (shouldTerminate)
    return false;
  return Object.prototype.hasOwnProperty.call(object, key) || hasPropertyInObject(Object.getPrototypeOf(object), key);
};
const isObjectWithKeys = (a) => isObject(a) && !(a instanceof Error) && !(a instanceof Array) && !(a instanceof Date);
const subsetEquality = (object, subset) => {
  const subsetEqualityWithContext = (seenReferences = new WeakMap()) => (object2, subset2) => {
    if (!isObjectWithKeys(subset2))
      return void 0;
    return Object.keys(subset2).every((key) => {
      if (isObjectWithKeys(subset2[key])) {
        if (seenReferences.has(subset2[key]))
          return equals(object2[key], subset2[key], [iterableEquality]);
        seenReferences.set(subset2[key], true);
      }
      const result = object2 != null && hasPropertyInObject(object2, key) && equals(object2[key], subset2[key], [
        iterableEquality,
        subsetEqualityWithContext(seenReferences)
      ]);
      seenReferences.delete(subset2[key]);
      return result;
    });
  };
  return subsetEqualityWithContext()(object, subset);
};
const typeEquality = (a, b) => {
  if (a == null || b == null || a.constructor === b.constructor)
    return void 0;
  return false;
};
const arrayBufferEquality = (a, b) => {
  if (!(a instanceof ArrayBuffer) || !(b instanceof ArrayBuffer))
    return void 0;
  const dataViewA = new DataView(a);
  const dataViewB = new DataView(b);
  if (dataViewA.byteLength !== dataViewB.byteLength)
    return false;
  for (let i = 0; i < dataViewA.byteLength; i++) {
    if (dataViewA.getUint8(i) !== dataViewB.getUint8(i))
      return false;
  }
  return true;
};
const sparseArrayEquality = (a, b) => {
  if (!Array.isArray(a) || !Array.isArray(b))
    return void 0;
  const aKeys = Object.keys(a);
  const bKeys = Object.keys(b);
  return equals(a, b, [iterableEquality, typeEquality], true) && equals(aKeys, bKeys);
};

const MATCHERS_OBJECT = Symbol.for("matchers-object");
if (!Object.prototype.hasOwnProperty.call(global, MATCHERS_OBJECT)) {
  const defaultState = {
    assertionCalls: 0,
    isExpectingAssertions: false,
    isExpectingAssertionsError: null,
    expectedAssertionsNumber: null,
    expectedAssertionsNumberError: null
  };
  Object.defineProperty(global, MATCHERS_OBJECT, {
    value: {
      state: defaultState
    }
  });
}
const getState = () => global[MATCHERS_OBJECT].state;
const setState = (state) => {
  Object.assign(global[MATCHERS_OBJECT].state, state);
};
const JestChaiExpect = (chai, utils) => {
  function def(name, fn) {
    const addMethod = (n) => {
      utils.addMethod(chai.Assertion.prototype, n, fn);
    };
    if (Array.isArray(name))
      name.forEach((n) => addMethod(n));
    else
      addMethod(name);
  }
  const chaiEqual = chai.Assertion.prototype.equal;
  def("chaiEqual", function(...args) {
    return chaiEqual.apply(this, args);
  });
  ["throw", "throws", "Throw"].forEach((m) => {
    utils.overwriteMethod(chai.Assertion.prototype, m, (_super) => {
      return function(...args) {
        const promise = utils.flag(this, "promise");
        const object = utils.flag(this, "object");
        if (promise === "rejects") {
          utils.flag(this, "object", () => {
            throw object;
          });
        }
        _super.apply(this, args);
      };
    });
  });
  utils.overwriteMethod(chai.Assertion.prototype, "equal", (_super) => {
    return function(...args) {
      const expected = args[0];
      const actual = utils.flag(this, "object");
      if (hasAsymmetric(expected)) {
        this.assert(equals(actual, expected, void 0, true), "not match with #{act}", "should not match with #{act}", actual, expected);
      } else {
        _super.apply(this, args);
      }
    };
  });
  utils.overwriteMethod(chai.Assertion.prototype, "eql", (_super) => {
    return function(...args) {
      const expected = args[0];
      const actual = utils.flag(this, "object");
      if (hasAsymmetric(expected)) {
        this.assert(equals(actual, expected), "not match with #{exp}", "should not match with #{exp}", expected, actual);
      } else {
        _super.apply(this, args);
      }
    };
  });
  def("toEqual", function(expected) {
    return this.eql(expected);
  });
  def("toStrictEqual", function(expected) {
    const obj = utils.flag(this, "object");
    const equal = equals(obj, expected, [
      iterableEquality,
      typeEquality,
      sparseArrayEquality,
      arrayBufferEquality
    ], true);
    return this.assert(equal, "expected #{this} to strictly equal #{exp}", "expected #{this} to not strictly equal #{exp}", expected, obj);
  });
  def("toBe", function(expected) {
    return this.equal(expected);
  });
  def("toMatchObject", function(expected) {
    return this.containSubset(expected);
  });
  def("toMatch", function(expected) {
    if (typeof expected === "string")
      return this.include(expected);
    else
      return this.match(expected);
  });
  def("toContain", function(item) {
    return this.contain(item);
  });
  def("toContainEqual", function(expected) {
    const obj = utils.flag(this, "object");
    const index = Array.from(obj).findIndex((item) => {
      return equals(item, expected);
    });
    this.assert(index !== -1, "expected #{this} to deep equally contain #{exp}", "expected #{this} to not deep equally contain #{exp}", expected);
  });
  def("toBeTruthy", function() {
    const obj = utils.flag(this, "object");
    this.assert(Boolean(obj), "expected #{this} to be truthy", "expected #{this} to not be truthy", obj);
  });
  def("toBeFalsy", function() {
    const obj = utils.flag(this, "object");
    this.assert(!obj, "expected #{this} to be falsy", "expected #{this} to not be falsy", obj);
  });
  def("toBeGreaterThan", function(expected) {
    return this.to.greaterThan(expected);
  });
  def("toBeGreaterThanOrEqual", function(expected) {
    return this.to.greaterThanOrEqual(expected);
  });
  def("toBeLessThan", function(expected) {
    return this.to.lessThan(expected);
  });
  def("toBeLessThanOrEqual", function(expected) {
    return this.to.lessThanOrEqual(expected);
  });
  def("toBeNaN", function() {
    return this.be.NaN;
  });
  def("toBeUndefined", function() {
    return this.be.undefined;
  });
  def("toBeNull", function() {
    return this.be.null;
  });
  def("toBeDefined", function() {
    const negate = utils.flag(this, "negate");
    utils.flag(this, "negate", false);
    if (negate)
      return this.be.undefined;
    return this.not.be.undefined;
  });
  def("toBeInstanceOf", function(obj) {
    return this.instanceOf(obj);
  });
  def("toHaveLength", function(length) {
    return this.have.length(length);
  });
  def("toHaveProperty", function(...args) {
    return this.have.deep.nested.property(...args);
  });
  def("toBeCloseTo", function(received, precision = 2) {
    const expected = this._obj;
    let pass = false;
    let expectedDiff = 0;
    let receivedDiff = 0;
    if (received === Infinity && expected === Infinity) {
      pass = true;
    } else if (received === -Infinity && expected === -Infinity) {
      pass = true;
    } else {
      expectedDiff = Math.pow(10, -precision) / 2;
      receivedDiff = Math.abs(expected - received);
      pass = receivedDiff < expectedDiff;
    }
    return this.assert(pass, `expected #{this} to be close to #{exp}, received difference is ${receivedDiff}, but expected ${expectedDiff}`, `expected #{this} to not be close to #{exp}, received difference is ${receivedDiff}, but expected ${expectedDiff}`, received, expected);
  });
  const assertIsMock = (assertion) => {
    if (!isMockFunction(assertion._obj))
      throw new TypeError(`${utils.inspect(assertion._obj)} is not a spy or a call to a spy!`);
  };
  const getSpy = (assertion) => {
    assertIsMock(assertion);
    return assertion._obj;
  };
  def(["toHaveBeenCalledTimes", "toBeCalledTimes"], function(number) {
    const spy = getSpy(this);
    const spyName = spy.getMockName();
    const callCount = spy.mock.calls.length;
    return this.assert(callCount === number, `expected "${spyName}" to be called #{exp} times`, `expected "${spyName}" to not be called #{exp} times`, number, callCount);
  });
  def("toHaveBeenCalledOnce", function() {
    const spy = getSpy(this);
    const spyName = spy.getMockName();
    const callCount = spy.mock.calls.length;
    return this.assert(callCount === 1, `expected "${spyName}" to be called once`, `expected "${spyName}" to not be called once`, 1, callCount);
  });
  def(["toHaveBeenCalled", "toBeCalled"], function() {
    const spy = getSpy(this);
    const spyName = spy.getMockName();
    const called = spy.mock.calls.length > 0;
    return this.assert(called, `expected "${spyName}" to be called at least once`, `expected "${spyName}" to not be called at all`, true, called);
  });
  def(["toHaveBeenCalledWith", "toBeCalledWith"], function(...args) {
    const spy = getSpy(this);
    const spyName = spy.getMockName();
    const pass = spy.mock.calls.some((callArg) => equals(callArg, args, [iterableEquality]));
    return this.assert(pass, `expected "${spyName}" to be called with arguments: #{exp}`, `expected "${spyName}" to not be called with arguments: #{exp}`, args, spy.mock.calls);
  });
  const ordinalOf = (i) => {
    const j = i % 10;
    const k = i % 100;
    if (j === 1 && k !== 11)
      return `${i}st`;
    if (j === 2 && k !== 12)
      return `${i}nd`;
    if (j === 3 && k !== 13)
      return `${i}rd`;
    return `${i}th`;
  };
  def(["toHaveBeenNthCalledWith", "nthCalledWith"], function(times, ...args) {
    const spy = getSpy(this);
    const spyName = spy.getMockName();
    const nthCall = spy.mock.calls[times - 1];
    this.assert(equals(nthCall, args, [iterableEquality]), `expected ${ordinalOf(times)} "${spyName}" call to have been called with #{exp}`, `expected ${ordinalOf(times)} "${spyName}" call to not have been called with #{exp}`, args, nthCall);
  });
  def(["toHaveBeenLastCalledWith", "lastCalledWith"], function(...args) {
    const spy = getSpy(this);
    const spyName = spy.getMockName();
    const lastCall = spy.mock.calls[spy.calls.length - 1];
    this.assert(equals(lastCall, args, [iterableEquality]), `expected last "${spyName}" call to have been called with #{exp}`, `expected last "${spyName}" call to not have been called with #{exp}`, args, lastCall);
  });
  def(["toThrow", "toThrowError"], function(expected) {
    const obj = this._obj;
    const promise = utils.flag(this, "promise");
    let thrown = null;
    if (promise) {
      thrown = obj;
    } else {
      try {
        obj();
      } catch (err) {
        thrown = err;
      }
    }
    if (typeof expected === "function") {
      const name = expected.name || expected.prototype.constructor.name;
      return this.assert(thrown && thrown instanceof expected, `expected error to be instance of ${name}`, `expected error not to be instance of ${name}`, expected, thrown);
    }
    if (expected && expected instanceof Error) {
      return this.assert(thrown && expected.message === thrown.message, `expected error to have message: ${expected.message}`, `expected error not to have message: ${expected.message}`, expected.message, thrown && thrown.message);
    }
    if (expected && typeof expected.asymmetricMatch === "function") {
      const matcher = expected;
      return this.assert(thrown && matcher.asymmetricMatch(thrown), "expected error to match asymmetric matcher", "expected error not to match asymmetric matcher", matcher.toString(), thrown);
    }
    return this.to.throws(expected);
  });
  def(["toHaveReturned", "toReturn"], function() {
    const spy = getSpy(this);
    const spyName = spy.getMockName();
    const calledAndNotThrew = spy.mock.calls.length > 0 && !spy.mock.results.some(({ type }) => type === "throw");
    this.assert(calledAndNotThrew, `expected "${spyName}" to be successfully called at least once`, `expected "${spyName}" to not be successfully called`, calledAndNotThrew, !calledAndNotThrew);
  });
  def(["toHaveReturnedTimes", "toReturnTimes"], function(times) {
    const spy = getSpy(this);
    const spyName = spy.getMockName();
    const successfullReturns = spy.mock.results.reduce((success, { type }) => type === "throw" ? success : ++success, 0);
    this.assert(successfullReturns === times, `expected "${spyName}" to be successfully called ${times} times`, `expected "${spyName}" to not be successfully called ${times} times`, `expected number of returns: ${times}`, `received number of returns: ${successfullReturns}`);
  });
  def(["toHaveReturnedWith", "toReturnWith"], function(value) {
    const spy = getSpy(this);
    const spyName = spy.getMockName();
    const pass = spy.mock.results.some(({ type, value: result }) => type === "return" && equals(value, result));
    this.assert(pass, `expected "${spyName}" to be successfully called with #{exp}`, `expected "${spyName}" to not be successfully called with #{exp}`, value);
  });
  def(["toHaveLastReturnedWith", "lastReturnedWith"], function(value) {
    const spy = getSpy(this);
    const spyName = spy.getMockName();
    const { value: lastResult } = spy.mock.results[spy.returns.length - 1];
    const pass = equals(lastResult, value);
    this.assert(pass, `expected last "${spyName}" call to return #{exp}`, `expected last "${spyName}" call to not return #{exp}`, value, lastResult);
  });
  def(["toHaveNthReturnedWith", "nthReturnedWith"], function(nthCall, value) {
    const spy = getSpy(this);
    const spyName = spy.getMockName();
    const isNot = utils.flag(this, "negate");
    const { type: callType, value: callResult } = spy.mock.results[nthCall - 1];
    const ordinalCall = `${ordinalOf(nthCall)} call`;
    if (!isNot && callType === "throw")
      chai.assert.fail(`expected ${ordinalCall} to return #{exp}, but instead it threw an error`);
    const nthCallReturn = equals(callResult, value);
    this.assert(nthCallReturn, `expected ${ordinalCall} "${spyName}" call to return #{exp}`, `expected ${ordinalCall} "${spyName}" call to not return #{exp}`, value, callResult);
  });
  utils.addProperty(chai.Assertion.prototype, "resolves", function() {
    utils.flag(this, "promise", "resolves");
    const obj = utils.flag(this, "object");
    const proxy = new Proxy(this, {
      get: (target, key, reciever) => {
        const result = Reflect.get(target, key, reciever);
        if (typeof result !== "function")
          return result instanceof chai.Assertion ? proxy : result;
        return async (...args) => {
          return obj.then((value) => {
            utils.flag(this, "object", value);
            return result.call(this, ...args);
          }, (err) => {
            throw new Error(`promise rejected "${err}" instead of resolving`);
          });
        };
      }
    });
    return proxy;
  });
  utils.addProperty(chai.Assertion.prototype, "rejects", function() {
    utils.flag(this, "promise", "rejects");
    const obj = utils.flag(this, "object");
    const wrapper = typeof obj === "function" ? obj() : obj;
    const proxy = new Proxy(this, {
      get: (target, key, reciever) => {
        const result = Reflect.get(target, key, reciever);
        if (typeof result !== "function")
          return result instanceof chai.Assertion ? proxy : result;
        return async (...args) => {
          return wrapper.then((value) => {
            throw new Error(`promise resolved "${value}" instead of rejecting`);
          }, (err) => {
            utils.flag(this, "object", err);
            return result.call(this, ...args);
          });
        };
      }
    });
    return proxy;
  });
  utils.addMethod(chai.expect, "assertions", function assertions(expected) {
    const error = new Error(`expected number of assertions to be ${expected}, but got ${getState().assertionCalls}`);
    if (Error.captureStackTrace)
      Error.captureStackTrace(error, assertions);
    setState({
      expectedAssertionsNumber: expected,
      expectedAssertionsNumberError: error
    });
  });
  utils.addMethod(chai.expect, "hasAssertions", function hasAssertions() {
    const error = new Error("expected any number of assertion, but got none");
    if (Error.captureStackTrace)
      Error.captureStackTrace(error, hasAssertions);
    setState({
      isExpectingAssertions: true,
      isExpectingAssertionsError: error
    });
  });
  utils.addMethod(chai.expect, "addSnapshotSerializer", addSerializer);
};

var mockdate$1 = {exports: {}};

(function (module, exports) {
(function (global, factory) {
    factory(exports) ;
}(commonjsGlobal, (function (exports) {
    /*! *****************************************************************************
    Copyright (c) Microsoft Corporation.

    Permission to use, copy, modify, and/or distribute this software for any
    purpose with or without fee is hereby granted.

    THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
    REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
    AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
    INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
    LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
    OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
    PERFORMANCE OF THIS SOFTWARE.
    ***************************************************************************** */
    /* global Reflect, Promise */

    var extendStatics = function(d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };

    function __extends(d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    }

    var RealDate = Date;
    var now = null;
    var MockDate = /** @class */ (function (_super) {
        __extends(Date, _super);
        function Date(y, m, d, h, M, s, ms) {
            _super.call(this) || this;
            var date;
            switch (arguments.length) {
                case 0:
                    if (now !== null) {
                        date = new RealDate(now.valueOf());
                    }
                    else {
                        date = new RealDate();
                    }
                    break;
                case 1:
                    date = new RealDate(y);
                    break;
                default:
                    d = typeof d === 'undefined' ? 1 : d;
                    h = h || 0;
                    M = M || 0;
                    s = s || 0;
                    ms = ms || 0;
                    date = new RealDate(y, m, d, h, M, s, ms);
                    break;
            }
            return date;
        }
        return Date;
    }(RealDate));
    MockDate.prototype = RealDate.prototype;
    MockDate.UTC = RealDate.UTC;
    MockDate.now = function () {
        return new MockDate().valueOf();
    };
    MockDate.parse = function (dateString) {
        return RealDate.parse(dateString);
    };
    MockDate.toString = function () {
        return RealDate.toString();
    };
    function set(date) {
        var dateObj = new Date(date.valueOf());
        if (isNaN(dateObj.getTime())) {
            throw new TypeError('mockdate: The time set is an invalid date: ' + date);
        }
        // @ts-ignore
        Date = MockDate;
        now = dateObj.valueOf();
    }
    function reset() {
        Date = RealDate;
    }
    var mockdate = {
        set: set,
        reset: reset,
    };

    exports.default = mockdate;
    exports.reset = reset;
    exports.set = set;

    Object.defineProperty(exports, '__esModule', { value: true });

})));
}(mockdate$1, mockdate$1.exports));

var mockdate = /*@__PURE__*/getDefaultExportFromCjs(mockdate$1.exports);

const originalSetTimeout = global.setTimeout;
const originalSetInterval = global.setInterval;
const originalClearTimeout = global.clearTimeout;
const originalClearInterval = global.clearInterval;
const MAX_LOOPS = 1e4;
var QueueTaskType;
(function(QueueTaskType2) {
  QueueTaskType2["Interval"] = "interval";
  QueueTaskType2["Timeout"] = "timeout";
  QueueTaskType2["Immediate"] = "immediate";
})(QueueTaskType || (QueueTaskType = {}));
const assertEvery = (assertions, message) => {
  if (assertions.some((a) => !a))
    throw new Error(message);
};
const assertMaxLoop = (times) => {
  if (times >= MAX_LOOPS)
    throw new Error("setTimeout/setInterval called 10 000 times. It's possible it stuck in an infinite loop.");
};
const getNodeTimeout = (id) => {
  const timer = {
    ref: () => timer,
    unref: () => timer,
    hasRef: () => true,
    refresh: () => timer,
    [Symbol.toPrimitive]: () => id
  };
  return timer;
};
class FakeTimers {
  constructor() {
    this._advancedTime = 0;
    this._nestedTime = {};
    this._scopeId = 0;
    this._isNested = false;
    this._isOnlyPending = false;
    this._spyid = 0;
    this._isMocked = false;
    this._tasksQueue = [];
    this._queueCount = 0;
  }
  useFakeTimers() {
    this._isMocked = true;
    this.reset();
    const spyFactory = (spyType, resultBuilder) => {
      return (cb, ms = 0) => {
        const id = ++this._spyid;
        const nestedTo = Object.entries(this._nestedTime).filter(([key]) => Number(key) <= this._scopeId);
        const nestedMs = nestedTo.reduce((total, [, ms2]) => total + ms2, ms);
        const call = { id, cb, ms, nestedMs, scopeId: this._scopeId };
        const task = { type: spyType, call, nested: this._isNested };
        this.pushTask(task);
        return resultBuilder(id, cb);
      };
    };
    this._setTimeout = spyOn(global, "setTimeout").mockImplementation(spyFactory(QueueTaskType.Timeout, getNodeTimeout));
    this._setInterval = spyOn(global, "setInterval").mockImplementation(spyFactory(QueueTaskType.Interval, getNodeTimeout));
    const clearTimerFactory = (spyType) => (id) => {
      if (id === void 0)
        return;
      const index = this._tasksQueue.findIndex(({ call, type }) => type === spyType && call.id === Number(id));
      if (index !== -1)
        this._tasksQueue.splice(index, 1);
    };
    this._clearTimeout = spyOn(global, "clearTimeout").mockImplementation(clearTimerFactory(QueueTaskType.Timeout));
    this._clearInterval = spyOn(global, "clearInterval").mockImplementation(clearTimerFactory(QueueTaskType.Interval));
  }
  useRealTimers() {
    this._isMocked = false;
    this.reset();
    global.setTimeout = originalSetTimeout;
    global.setInterval = originalSetInterval;
    global.clearTimeout = originalClearTimeout;
    global.clearInterval = originalClearInterval;
  }
  runOnlyPendingTimers() {
    this.assertMocked();
    this._isOnlyPending = true;
    this.runQueue();
  }
  runAllTimers() {
    this.assertMocked();
    this.runQueue();
  }
  advanceTimersByTime(ms) {
    this.assertMocked();
    this._advancedTime += ms;
    this.runQueue();
  }
  advanceTimersToNextTimer() {
    this.assertMocked();
    this.callQueueItem(0);
  }
  getTimerCount() {
    this.assertMocked();
    return this._tasksQueue.length;
  }
  reset() {
    var _a, _b, _c, _d;
    this._advancedTime = 0;
    this._nestedTime = {};
    this._isNested = false;
    this._isOnlyPending = false;
    this._spyid = 0;
    this._queueCount = 0;
    this._tasksQueue = [];
    (_a = this._clearInterval) == null ? void 0 : _a.mockRestore();
    (_b = this._clearTimeout) == null ? void 0 : _b.mockRestore();
    (_c = this._setInterval) == null ? void 0 : _c.mockRestore();
    (_d = this._setTimeout) == null ? void 0 : _d.mockRestore();
  }
  callQueueItem(index) {
    var _a, _b;
    const task = this._tasksQueue[index];
    if (!task)
      return;
    const { call, type } = task;
    this._scopeId = call.id;
    this._isNested = true;
    (_a = this._nestedTime)[_b = call.id] ?? (_a[_b] = 0);
    this._nestedTime[call.id] += call.ms;
    if (type === "timeout") {
      this.removeTask(index);
    } else if (type === "interval") {
      call.nestedMs += call.ms;
      const nestedMs = call.nestedMs;
      const closestTask = this._tasksQueue.findIndex(({ type: type2, call: call2 }) => type2 === "interval" && call2.nestedMs < nestedMs);
      if (closestTask !== -1 && closestTask !== index)
        this.ensureQueueOrder();
    }
    call.cb();
    this._queueCount++;
  }
  runQueue() {
    let index = 0;
    while (this._tasksQueue[index]) {
      assertMaxLoop(this._queueCount);
      const { call, nested } = this._tasksQueue[index];
      if (this._advancedTime && call.nestedMs > this._advancedTime)
        break;
      if (this._isOnlyPending && nested) {
        index++;
        continue;
      }
      this.callQueueItem(index);
    }
  }
  removeTask(index) {
    if (index === 0)
      this._tasksQueue.shift();
    else
      this._tasksQueue.splice(index, 1);
  }
  pushTask(task) {
    this._tasksQueue.push(task);
    this.ensureQueueOrder();
  }
  ensureQueueOrder() {
    this._tasksQueue.sort((t1, t2) => {
      const diff = t1.call.nestedMs - t2.call.nestedMs;
      if (diff === 0) {
        if (t1.type === QueueTaskType.Immediate && t2.type !== QueueTaskType.Immediate)
          return 1;
        return 0;
      }
      return diff;
    });
  }
  assertMocked() {
    assertEvery([
      this._isMocked,
      this._setTimeout,
      this._setInterval,
      this._clearTimeout,
      this._clearInterval
    ], 'timers are not mocked. try calling "vi.useFakeTimers()" first');
  }
}

class VitestUtils {
  constructor() {
    this.spyOn = spyOn;
    this.fn = fn;
    this._timers = new FakeTimers();
    this._mockedDate = null;
  }
  useFakeTimers() {
    return this._timers.useFakeTimers();
  }
  useRealTimers() {
    return this._timers.useRealTimers();
  }
  runOnlyPendingTimers() {
    return this._timers.runOnlyPendingTimers();
  }
  runAllTimers() {
    return this._timers.runAllTimers();
  }
  advanceTimersByTime(ms) {
    return this._timers.advanceTimersByTime(ms);
  }
  advanceTimersToNextTimer() {
    return this._timers.advanceTimersToNextTimer();
  }
  getTimerCount() {
    return this._timers.getTimerCount();
  }
  mockCurrentDate(date) {
    this._mockedDate = date;
    mockdate.set(date);
  }
  restoreCurrentDate() {
    this._mockedDate = null;
    mockdate.reset();
  }
  getMockedDate() {
    return this._mockedDate;
  }
  mock(path, factory) {
  }
  unmock(path) {
  }
  async importActual(path) {
    return {};
  }
  async importMock(path) {
    return {};
  }
  mocked(item, _deep = false) {
    return item;
  }
  isMockFunction(fn2) {
    return isMockFunction(fn2);
  }
  clearAllMocks() {
    __vitest__clearMocks__({ clearMocks: true });
    spies.forEach((spy) => spy.mockClear());
    return this;
  }
  resetAllMocks() {
    __vitest__clearMocks__({ mockReset: true });
    spies.forEach((spy) => spy.mockReset());
    return this;
  }
  restoreAllMocks() {
    __vitest__clearMocks__({ restoreMocks: true });
    spies.forEach((spy) => spy.mockRestore());
    return this;
  }
}
const vitest = new VitestUtils();
const vi = vitest;

export { JestChaiExpect as J, getDefaultHookTimeout as a, getState as b, suite as c, describe as d, vi as e, format_1 as f, getCurrentSuite as g, getSerializers as h, it as i, equals as j, iterableEquality as k, subsetEquality as l, isA as m, clearContext as n, defaultSuite as o, plugins_1 as p, setHooks as q, getHooks as r, setState as s, test$7 as t, context as u, vitest as v, withTimeout as w, getFn as x };
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidmktODM4OWE1NDIuanMiLCJzb3VyY2VzIjpbIi4uL3NyYy9ydW50aW1lL2NoYWluLnRzIiwiLi4vc3JjL3J1bnRpbWUvY29udGV4dC50cyIsIi4uL3NyYy9ydW50aW1lL21hcC50cyIsIi4uL3NyYy9ydW50aW1lL3N1aXRlLnRzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzLy5wbnBtL2Fuc2ktc3R5bGVzQDUuMi4wL25vZGVfbW9kdWxlcy9hbnNpLXN0eWxlcy9pbmRleC5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy8ucG5wbS9wcmV0dHktZm9ybWF0QDI3LjQuNi9ub2RlX21vZHVsZXMvcHJldHR5LWZvcm1hdC9idWlsZC9jb2xsZWN0aW9ucy5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy8ucG5wbS9wcmV0dHktZm9ybWF0QDI3LjQuNi9ub2RlX21vZHVsZXMvcHJldHR5LWZvcm1hdC9idWlsZC9wbHVnaW5zL0FzeW1tZXRyaWNNYXRjaGVyLmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzLy5wbnBtL2Fuc2ktcmVnZXhANS4wLjEvbm9kZV9tb2R1bGVzL2Fuc2ktcmVnZXgvaW5kZXguanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvLnBucG0vcHJldHR5LWZvcm1hdEAyNy40LjYvbm9kZV9tb2R1bGVzL3ByZXR0eS1mb3JtYXQvYnVpbGQvcGx1Z2lucy9Db252ZXJ0QW5zaS5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy8ucG5wbS9wcmV0dHktZm9ybWF0QDI3LjQuNi9ub2RlX21vZHVsZXMvcHJldHR5LWZvcm1hdC9idWlsZC9wbHVnaW5zL0RPTUNvbGxlY3Rpb24uanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvLnBucG0vcHJldHR5LWZvcm1hdEAyNy40LjYvbm9kZV9tb2R1bGVzL3ByZXR0eS1mb3JtYXQvYnVpbGQvcGx1Z2lucy9saWIvZXNjYXBlSFRNTC5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy8ucG5wbS9wcmV0dHktZm9ybWF0QDI3LjQuNi9ub2RlX21vZHVsZXMvcHJldHR5LWZvcm1hdC9idWlsZC9wbHVnaW5zL2xpYi9tYXJrdXAuanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvLnBucG0vcHJldHR5LWZvcm1hdEAyNy40LjYvbm9kZV9tb2R1bGVzL3ByZXR0eS1mb3JtYXQvYnVpbGQvcGx1Z2lucy9ET01FbGVtZW50LmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzLy5wbnBtL3ByZXR0eS1mb3JtYXRAMjcuNC42L25vZGVfbW9kdWxlcy9wcmV0dHktZm9ybWF0L2J1aWxkL3BsdWdpbnMvSW1tdXRhYmxlLmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzLy5wbnBtL3JlYWN0LWlzQDE3LjAuMi9ub2RlX21vZHVsZXMvcmVhY3QtaXMvY2pzL3JlYWN0LWlzLnByb2R1Y3Rpb24ubWluLmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzLy5wbnBtL3JlYWN0LWlzQDE3LjAuMi9ub2RlX21vZHVsZXMvcmVhY3QtaXMvY2pzL3JlYWN0LWlzLmRldmVsb3BtZW50LmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzLy5wbnBtL3JlYWN0LWlzQDE3LjAuMi9ub2RlX21vZHVsZXMvcmVhY3QtaXMvaW5kZXguanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvLnBucG0vcHJldHR5LWZvcm1hdEAyNy40LjYvbm9kZV9tb2R1bGVzL3ByZXR0eS1mb3JtYXQvYnVpbGQvcGx1Z2lucy9SZWFjdEVsZW1lbnQuanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvLnBucG0vcHJldHR5LWZvcm1hdEAyNy40LjYvbm9kZV9tb2R1bGVzL3ByZXR0eS1mb3JtYXQvYnVpbGQvcGx1Z2lucy9SZWFjdFRlc3RDb21wb25lbnQuanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvLnBucG0vcHJldHR5LWZvcm1hdEAyNy40LjYvbm9kZV9tb2R1bGVzL3ByZXR0eS1mb3JtYXQvYnVpbGQvaW5kZXguanMiLCIuLi9zcmMvaW50ZWdyYXRpb25zL3NuYXBzaG90L3BvcnQvcGx1Z2lucy50cyIsIi4uL3NyYy9pbnRlZ3JhdGlvbnMvY2hhaS9qZXN0LXV0aWxzLnRzIiwiLi4vc3JjL2ludGVncmF0aW9ucy9jaGFpL2plc3QtZXhwZWN0LnRzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzLy5wbnBtL21vY2tkYXRlQDMuMC41L25vZGVfbW9kdWxlcy9tb2NrZGF0ZS9saWIvbW9ja2RhdGUuanMiLCIuLi9zcmMvaW50ZWdyYXRpb25zL3RpbWVycy50cyIsIi4uL3NyYy9pbnRlZ3JhdGlvbnMvdmkudHMiXSwic291cmNlc0NvbnRlbnQiOlsiZXhwb3J0IHR5cGUgQ2hhaW5hYmxlRnVuY3Rpb248VCBleHRlbmRzIHN0cmluZywgQXJncyBleHRlbmRzIGFueVtdLCBSID0gYW55PiA9IHtcbiAgKC4uLmFyZ3M6IEFyZ3MpOiBSXG59ICYge1xuICBbeCBpbiBUXTogQ2hhaW5hYmxlRnVuY3Rpb248VCwgQXJncywgUj5cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZUNoYWluYWJsZTxUIGV4dGVuZHMgc3RyaW5nLCBBcmdzIGV4dGVuZHMgYW55W10sIFIgPSBhbnk+KFxuICBrZXlzOiBUW10sXG4gIGZuOiAodGhpczogUmVjb3JkPFQsIGJvb2xlYW4gfCB1bmRlZmluZWQ+LCAuLi5hcmdzOiBBcmdzKSA9PiBSLFxuKTogQ2hhaW5hYmxlRnVuY3Rpb248VCwgQXJncywgUj4ge1xuICBmdW5jdGlvbiBjcmVhdGUob2JqOiBSZWNvcmQ8VCwgYm9vbGVhbiB8IHVuZGVmaW5lZD4pIHtcbiAgICBjb25zdCBjaGFpbiA9IGZ1bmN0aW9uKHRoaXM6IGFueSwgLi4uYXJnczogQXJncykge1xuICAgICAgcmV0dXJuIGZuLmFwcGx5KG9iaiwgYXJncylcbiAgICB9XG4gICAgZm9yIChjb25zdCBrZXkgb2Yga2V5cykge1xuICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KGNoYWluLCBrZXksIHtcbiAgICAgICAgZ2V0KCkge1xuICAgICAgICAgIHJldHVybiBjcmVhdGUoeyAuLi5vYmosIFtrZXldOiB0cnVlIH0pXG4gICAgICAgIH0sXG4gICAgICB9KVxuICAgIH1cbiAgICByZXR1cm4gY2hhaW5cbiAgfVxuXG4gIGNvbnN0IGNoYWluID0gY3JlYXRlKHt9IGFzIGFueSkgYXMgYW55XG4gIGNoYWluLmZuID0gZm5cbiAgcmV0dXJuIGNoYWluXG59XG4iLCJpbXBvcnQgdHlwZSB7IEF3YWl0YWJsZSwgRG9uZUNhbGxiYWNrLCBSdW50aW1lQ29udGV4dCwgU3VpdGVDb2xsZWN0b3IsIFRlc3RGdW5jdGlvbiB9IGZyb20gJy4uL3R5cGVzJ1xuXG5leHBvcnQgY29uc3QgY29udGV4dDogUnVudGltZUNvbnRleHQgPSB7XG4gIHRhc2tzOiBbXSxcbiAgY3VycmVudFN1aXRlOiBudWxsLFxufVxuXG5leHBvcnQgZnVuY3Rpb24gY29sbGVjdFRhc2sodGFzazogU3VpdGVDb2xsZWN0b3IpIHtcbiAgY29udGV4dC5jdXJyZW50U3VpdGU/LnRhc2tzLnB1c2godGFzaylcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHJ1bldpdGhTdWl0ZShzdWl0ZTogU3VpdGVDb2xsZWN0b3IsIGZuOiAoKCkgPT4gQXdhaXRhYmxlPHZvaWQ+KSkge1xuICBjb25zdCBwcmV2ID0gY29udGV4dC5jdXJyZW50U3VpdGVcbiAgY29udGV4dC5jdXJyZW50U3VpdGUgPSBzdWl0ZVxuICBhd2FpdCBmbigpXG4gIGNvbnRleHQuY3VycmVudFN1aXRlID0gcHJldlxufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0RGVmYXVsdFRlc3RUaW1lb3V0KCkge1xuICByZXR1cm4gcHJvY2Vzcy5fX3ZpdGVzdF93b3JrZXJfXyEuY29uZmlnIS50ZXN0VGltZW91dFxufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0RGVmYXVsdEhvb2tUaW1lb3V0KCkge1xuICByZXR1cm4gcHJvY2Vzcy5fX3ZpdGVzdF93b3JrZXJfXyEuY29uZmlnIS5ob29rVGltZW91dFxufVxuXG5leHBvcnQgZnVuY3Rpb24gd2l0aFRpbWVvdXQ8VCBleHRlbmRzKCguLi5hcmdzOiBhbnlbXSkgPT4gYW55KT4oZm46IFQsIF90aW1lb3V0PzogbnVtYmVyKTogVCB7XG4gIGNvbnN0IHRpbWVvdXQgPSBfdGltZW91dCA/PyBnZXREZWZhdWx0VGVzdFRpbWVvdXQoKVxuICBpZiAodGltZW91dCA8PSAwIHx8IHRpbWVvdXQgPT09IEluZmluaXR5KVxuICAgIHJldHVybiBmblxuXG4gIHJldHVybiAoKC4uLmFyZ3M6IChUIGV4dGVuZHMgKCguLi5hcmdzOiBpbmZlciBBKSA9PiBhbnkpID8gQSA6IG5ldmVyKSkgPT4ge1xuICAgIHJldHVybiBQcm9taXNlLnJhY2UoW2ZuKC4uLmFyZ3MpLCBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICBjb25zdCB0aW1lciA9IHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICBjbGVhclRpbWVvdXQodGltZXIpXG4gICAgICAgIHJlamVjdChuZXcgRXJyb3IoYFRlc3QgdGltZWQgb3V0IGluICR7dGltZW91dH1tcy5gKSlcbiAgICAgIH0sIHRpbWVvdXQpXG4gICAgICB0aW1lci51bnJlZigpXG4gICAgfSldKSBhcyBBd2FpdGFibGU8dm9pZD5cbiAgfSkgYXMgVFxufVxuXG5mdW5jdGlvbiBlbnN1cmVBc3luY1Rlc3QoZm46IFRlc3RGdW5jdGlvbik6ICgpID0+IEF3YWl0YWJsZTx2b2lkPiB7XG4gIGlmICghZm4ubGVuZ3RoKVxuICAgIHJldHVybiBmbiBhcyAoKSA9PiBBd2FpdGFibGU8dm9pZD5cblxuICByZXR1cm4gKCkgPT4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgIGNvbnN0IGRvbmU6IERvbmVDYWxsYmFjayA9ICguLi5hcmdzOiBhbnlbXSkgPT4gYXJnc1swXSAvLyByZWplY3Qgb24gdHJ1dGh5IHZhbHVlc1xuICAgICAgPyByZWplY3QoYXJnc1swXSlcbiAgICAgIDogcmVzb2x2ZSgpXG4gICAgZm4oZG9uZSlcbiAgfSlcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG5vcm1hbGl6ZVRlc3QoZm46IFRlc3RGdW5jdGlvbiwgdGltZW91dD86IG51bWJlcik6ICgpID0+IEF3YWl0YWJsZTx2b2lkPiB7XG4gIHJldHVybiB3aXRoVGltZW91dChlbnN1cmVBc3luY1Rlc3QoZm4pLCB0aW1lb3V0KVxufVxuIiwiaW1wb3J0IHR5cGUgeyBBd2FpdGFibGUsIFN1aXRlLCBTdWl0ZUhvb2tzLCBUZXN0IH0gZnJvbSAnLi4vdHlwZXMnXG5cbi8vIHVzZSBXZWFrTWFwIGhlcmUgdG8gbWFrZSB0aGUgVGVzdCBhbmQgU3VpdGUgb2JqZWN0IHNlcmlhbGl6YWJsZVxuY29uc3QgZm5NYXAgPSBuZXcgV2Vha01hcCgpXG5jb25zdCBob29rc01hcCA9IG5ldyBXZWFrTWFwKClcblxuZXhwb3J0IGZ1bmN0aW9uIHNldEZuKGtleTogVGVzdCwgZm46ICgpID0+IEF3YWl0YWJsZTx2b2lkPikge1xuICBmbk1hcC5zZXQoa2V5LCBmbilcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldEZuKGtleTogVGVzdCk6ICgpID0+IEF3YWl0YWJsZTx2b2lkPiB7XG4gIHJldHVybiBmbk1hcC5nZXQoa2V5KVxufVxuXG5leHBvcnQgZnVuY3Rpb24gc2V0SG9va3Moa2V5OiBTdWl0ZSwgaG9va3M6IFN1aXRlSG9va3MpIHtcbiAgaG9va3NNYXAuc2V0KGtleSwgaG9va3MpXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRIb29rcyhrZXk6IFN1aXRlKTogU3VpdGVIb29rcyB7XG4gIHJldHVybiBob29rc01hcC5nZXQoa2V5KVxufVxuIiwiaW1wb3J0IHR5cGUgeyBGaWxlLCBSdW5Nb2RlLCBTdWl0ZSwgU3VpdGVDb2xsZWN0b3IsIFN1aXRlSG9va3MsIFRlc3QsIFRlc3RDb2xsZWN0b3IsIFRlc3RGYWN0b3J5LCBUZXN0RnVuY3Rpb24gfSBmcm9tICcuLi90eXBlcydcbmltcG9ydCB7IG5vb3AgfSBmcm9tICcuLi91dGlscydcbmltcG9ydCB7IGNyZWF0ZUNoYWluYWJsZSB9IGZyb20gJy4vY2hhaW4nXG5pbXBvcnQgeyBjb2xsZWN0VGFzaywgY29udGV4dCwgbm9ybWFsaXplVGVzdCwgcnVuV2l0aFN1aXRlIH0gZnJvbSAnLi9jb250ZXh0J1xuaW1wb3J0IHsgZ2V0SG9va3MsIHNldEZuLCBzZXRIb29rcyB9IGZyb20gJy4vbWFwJ1xuXG4vLyBhcGlzXG5leHBvcnQgY29uc3Qgc3VpdGUgPSBjcmVhdGVTdWl0ZSgpXG5leHBvcnQgY29uc3QgdGVzdDogVGVzdENvbGxlY3RvciA9IGNyZWF0ZUNoYWluYWJsZShcbiAgWydjb25jdXJyZW50JywgJ3NraXAnLCAnb25seScsICd0b2RvJywgJ2ZhaWxzJ10sXG4gIGZ1bmN0aW9uKG5hbWU6IHN0cmluZywgZm4/OiBUZXN0RnVuY3Rpb24sIHRpbWVvdXQ/OiBudW1iZXIpIHtcbiAgICAvLyBAdHMtZXhwZWN0LWVycm9yIHVudHlwZWQgaW50ZXJuYWwgcHJvcFxuICAgIGdldEN1cnJlbnRTdWl0ZSgpLnRlc3QuZm4uY2FsbCh0aGlzLCBuYW1lLCBmbiwgdGltZW91dClcbiAgfSxcbilcblxuLy8gYWxpYXNcbmV4cG9ydCBjb25zdCBkZXNjcmliZSA9IHN1aXRlXG5leHBvcnQgY29uc3QgaXQgPSB0ZXN0XG5cbi8vIGltcGxlbWVudGF0aW9uc1xuZXhwb3J0IGNvbnN0IGRlZmF1bHRTdWl0ZSA9IHN1aXRlKCcnKVxuXG5leHBvcnQgZnVuY3Rpb24gY2xlYXJDb250ZXh0KCkge1xuICBjb250ZXh0LnRhc2tzLmxlbmd0aCA9IDBcbiAgZGVmYXVsdFN1aXRlLmNsZWFyKClcbiAgY29udGV4dC5jdXJyZW50U3VpdGUgPSBkZWZhdWx0U3VpdGVcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldEN1cnJlbnRTdWl0ZSgpIHtcbiAgcmV0dXJuIGNvbnRleHQuY3VycmVudFN1aXRlIHx8IGRlZmF1bHRTdWl0ZVxufVxuXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlU3VpdGVIb29rcygpIHtcbiAgcmV0dXJuIHtcbiAgICBiZWZvcmVBbGw6IFtdLFxuICAgIGFmdGVyQWxsOiBbXSxcbiAgICBiZWZvcmVFYWNoOiBbXSxcbiAgICBhZnRlckVhY2g6IFtdLFxuICB9XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZVN1aXRlQ29sbGVjdG9yKG5hbWU6IHN0cmluZywgZmFjdG9yeTogVGVzdEZhY3RvcnkgPSAoKSA9PiB7IH0sIG1vZGU6IFJ1bk1vZGUsIGNvbmN1cnJlbnQ/OiBib29sZWFuKSB7XG4gIGNvbnN0IHRhc2tzOiAoVGVzdCB8IFN1aXRlIHwgU3VpdGVDb2xsZWN0b3IpW10gPSBbXVxuICBjb25zdCBmYWN0b3J5UXVldWU6IChUZXN0IHwgU3VpdGUgfCBTdWl0ZUNvbGxlY3RvcilbXSA9IFtdXG5cbiAgbGV0IHN1aXRlOiBTdWl0ZVxuXG4gIGluaXRTdWl0ZSgpXG5cbiAgY29uc3QgdGVzdCA9IGNyZWF0ZUNoYWluYWJsZShcbiAgICBbJ2NvbmN1cnJlbnQnLCAnc2tpcCcsICdvbmx5JywgJ3RvZG8nLCAnZmFpbHMnXSxcbiAgICBmdW5jdGlvbihuYW1lOiBzdHJpbmcsIGZuPzogVGVzdEZ1bmN0aW9uLCB0aW1lb3V0PzogbnVtYmVyKSB7XG4gICAgICBjb25zdCBtb2RlID0gdGhpcy5vbmx5ID8gJ29ubHknIDogdGhpcy5za2lwID8gJ3NraXAnIDogdGhpcy50b2RvID8gJ3RvZG8nIDogJ3J1bidcblxuICAgICAgY29uc3QgdGVzdDogVGVzdCA9IHtcbiAgICAgICAgaWQ6ICcnLFxuICAgICAgICB0eXBlOiAndGVzdCcsXG4gICAgICAgIG5hbWUsXG4gICAgICAgIG1vZGUsXG4gICAgICAgIHN1aXRlOiB1bmRlZmluZWQhLFxuICAgICAgICBmYWlsczogdGhpcy5mYWlscyxcbiAgICAgIH1cbiAgICAgIGlmICh0aGlzLmNvbmN1cnJlbnQgfHwgY29uY3VycmVudClcbiAgICAgICAgdGVzdC5jb25jdXJyZW50ID0gdHJ1ZVxuXG4gICAgICBzZXRGbih0ZXN0LCBub3JtYWxpemVUZXN0KGZuIHx8IG5vb3AsIHRpbWVvdXQpKVxuICAgICAgdGFza3MucHVzaCh0ZXN0KVxuICAgIH0sXG4gIClcblxuICBjb25zdCBjb2xsZWN0b3I6IFN1aXRlQ29sbGVjdG9yID0ge1xuICAgIHR5cGU6ICdjb2xsZWN0b3InLFxuICAgIG5hbWUsXG4gICAgbW9kZSxcbiAgICB0ZXN0LFxuICAgIHRhc2tzLFxuICAgIGNvbGxlY3QsXG4gICAgY2xlYXIsXG4gICAgb246IGFkZEhvb2ssXG4gIH1cblxuICBmdW5jdGlvbiBhZGRIb29rPFQgZXh0ZW5kcyBrZXlvZiBTdWl0ZUhvb2tzPihuYW1lOiBULCAuLi5mbjogU3VpdGVIb29rc1tUXSkge1xuICAgIGdldEhvb2tzKHN1aXRlKVtuYW1lXS5wdXNoKC4uLmZuIGFzIGFueSlcbiAgfVxuXG4gIGZ1bmN0aW9uIGluaXRTdWl0ZSgpIHtcbiAgICBzdWl0ZSA9IHtcbiAgICAgIGlkOiAnJyxcbiAgICAgIHR5cGU6ICdzdWl0ZScsXG4gICAgICBuYW1lLFxuICAgICAgbW9kZSxcbiAgICAgIHRhc2tzOiBbXSxcbiAgICB9XG4gICAgc2V0SG9va3Moc3VpdGUsIGNyZWF0ZVN1aXRlSG9va3MoKSlcbiAgfVxuXG4gIGZ1bmN0aW9uIGNsZWFyKCkge1xuICAgIHRhc2tzLmxlbmd0aCA9IDBcbiAgICBmYWN0b3J5UXVldWUubGVuZ3RoID0gMFxuICAgIGluaXRTdWl0ZSgpXG4gIH1cblxuICBhc3luYyBmdW5jdGlvbiBjb2xsZWN0KGZpbGU/OiBGaWxlKSB7XG4gICAgZmFjdG9yeVF1ZXVlLmxlbmd0aCA9IDBcbiAgICBpZiAoZmFjdG9yeSlcbiAgICAgIGF3YWl0IHJ1bldpdGhTdWl0ZShjb2xsZWN0b3IsICgpID0+IGZhY3RvcnkodGVzdCkpXG5cbiAgICBjb25zdCBhbGxDaGlsZHJlbiA9IGF3YWl0IFByb21pc2UuYWxsKFxuICAgICAgWy4uLmZhY3RvcnlRdWV1ZSwgLi4udGFza3NdXG4gICAgICAgIC5tYXAoaSA9PiBpLnR5cGUgPT09ICdjb2xsZWN0b3InID8gaS5jb2xsZWN0KGZpbGUpIDogaSksXG4gICAgKVxuXG4gICAgc3VpdGUuZmlsZSA9IGZpbGVcbiAgICBzdWl0ZS50YXNrcyA9IGFsbENoaWxkcmVuXG5cbiAgICBhbGxDaGlsZHJlbi5mb3JFYWNoKCh0YXNrKSA9PiB7XG4gICAgICB0YXNrLnN1aXRlID0gc3VpdGVcbiAgICAgIGlmIChmaWxlKVxuICAgICAgICB0YXNrLmZpbGUgPSBmaWxlXG4gICAgfSlcblxuICAgIHJldHVybiBzdWl0ZVxuICB9XG5cbiAgY29sbGVjdFRhc2soY29sbGVjdG9yKVxuXG4gIHJldHVybiBjb2xsZWN0b3Jcbn1cblxuZnVuY3Rpb24gY3JlYXRlU3VpdGUoKSB7XG4gIHJldHVybiBjcmVhdGVDaGFpbmFibGUoXG4gICAgWydjb25jdXJyZW50JywgJ3NraXAnLCAnb25seScsICd0b2RvJ10sXG4gICAgZnVuY3Rpb24obmFtZTogc3RyaW5nLCBmYWN0b3J5PzogVGVzdEZhY3RvcnkpIHtcbiAgICAgIGNvbnN0IG1vZGUgPSB0aGlzLm9ubHkgPyAnb25seScgOiB0aGlzLnNraXAgPyAnc2tpcCcgOiB0aGlzLnRvZG8gPyAndG9kbycgOiAncnVuJ1xuICAgICAgcmV0dXJuIGNyZWF0ZVN1aXRlQ29sbGVjdG9yKG5hbWUsIGZhY3RvcnksIG1vZGUsIHRoaXMuY29uY3VycmVudClcbiAgICB9LFxuICApXG59XG4iLCIndXNlIHN0cmljdCc7XG5cbmNvbnN0IEFOU0lfQkFDS0dST1VORF9PRkZTRVQgPSAxMDtcblxuY29uc3Qgd3JhcEFuc2kyNTYgPSAob2Zmc2V0ID0gMCkgPT4gY29kZSA9PiBgXFx1MDAxQlskezM4ICsgb2Zmc2V0fTs1OyR7Y29kZX1tYDtcblxuY29uc3Qgd3JhcEFuc2kxNm0gPSAob2Zmc2V0ID0gMCkgPT4gKHJlZCwgZ3JlZW4sIGJsdWUpID0+IGBcXHUwMDFCWyR7MzggKyBvZmZzZXR9OzI7JHtyZWR9OyR7Z3JlZW59OyR7Ymx1ZX1tYDtcblxuZnVuY3Rpb24gYXNzZW1ibGVTdHlsZXMoKSB7XG5cdGNvbnN0IGNvZGVzID0gbmV3IE1hcCgpO1xuXHRjb25zdCBzdHlsZXMgPSB7XG5cdFx0bW9kaWZpZXI6IHtcblx0XHRcdHJlc2V0OiBbMCwgMF0sXG5cdFx0XHQvLyAyMSBpc24ndCB3aWRlbHkgc3VwcG9ydGVkIGFuZCAyMiBkb2VzIHRoZSBzYW1lIHRoaW5nXG5cdFx0XHRib2xkOiBbMSwgMjJdLFxuXHRcdFx0ZGltOiBbMiwgMjJdLFxuXHRcdFx0aXRhbGljOiBbMywgMjNdLFxuXHRcdFx0dW5kZXJsaW5lOiBbNCwgMjRdLFxuXHRcdFx0b3ZlcmxpbmU6IFs1MywgNTVdLFxuXHRcdFx0aW52ZXJzZTogWzcsIDI3XSxcblx0XHRcdGhpZGRlbjogWzgsIDI4XSxcblx0XHRcdHN0cmlrZXRocm91Z2g6IFs5LCAyOV1cblx0XHR9LFxuXHRcdGNvbG9yOiB7XG5cdFx0XHRibGFjazogWzMwLCAzOV0sXG5cdFx0XHRyZWQ6IFszMSwgMzldLFxuXHRcdFx0Z3JlZW46IFszMiwgMzldLFxuXHRcdFx0eWVsbG93OiBbMzMsIDM5XSxcblx0XHRcdGJsdWU6IFszNCwgMzldLFxuXHRcdFx0bWFnZW50YTogWzM1LCAzOV0sXG5cdFx0XHRjeWFuOiBbMzYsIDM5XSxcblx0XHRcdHdoaXRlOiBbMzcsIDM5XSxcblxuXHRcdFx0Ly8gQnJpZ2h0IGNvbG9yXG5cdFx0XHRibGFja0JyaWdodDogWzkwLCAzOV0sXG5cdFx0XHRyZWRCcmlnaHQ6IFs5MSwgMzldLFxuXHRcdFx0Z3JlZW5CcmlnaHQ6IFs5MiwgMzldLFxuXHRcdFx0eWVsbG93QnJpZ2h0OiBbOTMsIDM5XSxcblx0XHRcdGJsdWVCcmlnaHQ6IFs5NCwgMzldLFxuXHRcdFx0bWFnZW50YUJyaWdodDogWzk1LCAzOV0sXG5cdFx0XHRjeWFuQnJpZ2h0OiBbOTYsIDM5XSxcblx0XHRcdHdoaXRlQnJpZ2h0OiBbOTcsIDM5XVxuXHRcdH0sXG5cdFx0YmdDb2xvcjoge1xuXHRcdFx0YmdCbGFjazogWzQwLCA0OV0sXG5cdFx0XHRiZ1JlZDogWzQxLCA0OV0sXG5cdFx0XHRiZ0dyZWVuOiBbNDIsIDQ5XSxcblx0XHRcdGJnWWVsbG93OiBbNDMsIDQ5XSxcblx0XHRcdGJnQmx1ZTogWzQ0LCA0OV0sXG5cdFx0XHRiZ01hZ2VudGE6IFs0NSwgNDldLFxuXHRcdFx0YmdDeWFuOiBbNDYsIDQ5XSxcblx0XHRcdGJnV2hpdGU6IFs0NywgNDldLFxuXG5cdFx0XHQvLyBCcmlnaHQgY29sb3Jcblx0XHRcdGJnQmxhY2tCcmlnaHQ6IFsxMDAsIDQ5XSxcblx0XHRcdGJnUmVkQnJpZ2h0OiBbMTAxLCA0OV0sXG5cdFx0XHRiZ0dyZWVuQnJpZ2h0OiBbMTAyLCA0OV0sXG5cdFx0XHRiZ1llbGxvd0JyaWdodDogWzEwMywgNDldLFxuXHRcdFx0YmdCbHVlQnJpZ2h0OiBbMTA0LCA0OV0sXG5cdFx0XHRiZ01hZ2VudGFCcmlnaHQ6IFsxMDUsIDQ5XSxcblx0XHRcdGJnQ3lhbkJyaWdodDogWzEwNiwgNDldLFxuXHRcdFx0YmdXaGl0ZUJyaWdodDogWzEwNywgNDldXG5cdFx0fVxuXHR9O1xuXG5cdC8vIEFsaWFzIGJyaWdodCBibGFjayBhcyBncmF5IChhbmQgZ3JleSlcblx0c3R5bGVzLmNvbG9yLmdyYXkgPSBzdHlsZXMuY29sb3IuYmxhY2tCcmlnaHQ7XG5cdHN0eWxlcy5iZ0NvbG9yLmJnR3JheSA9IHN0eWxlcy5iZ0NvbG9yLmJnQmxhY2tCcmlnaHQ7XG5cdHN0eWxlcy5jb2xvci5ncmV5ID0gc3R5bGVzLmNvbG9yLmJsYWNrQnJpZ2h0O1xuXHRzdHlsZXMuYmdDb2xvci5iZ0dyZXkgPSBzdHlsZXMuYmdDb2xvci5iZ0JsYWNrQnJpZ2h0O1xuXG5cdGZvciAoY29uc3QgW2dyb3VwTmFtZSwgZ3JvdXBdIG9mIE9iamVjdC5lbnRyaWVzKHN0eWxlcykpIHtcblx0XHRmb3IgKGNvbnN0IFtzdHlsZU5hbWUsIHN0eWxlXSBvZiBPYmplY3QuZW50cmllcyhncm91cCkpIHtcblx0XHRcdHN0eWxlc1tzdHlsZU5hbWVdID0ge1xuXHRcdFx0XHRvcGVuOiBgXFx1MDAxQlske3N0eWxlWzBdfW1gLFxuXHRcdFx0XHRjbG9zZTogYFxcdTAwMUJbJHtzdHlsZVsxXX1tYFxuXHRcdFx0fTtcblxuXHRcdFx0Z3JvdXBbc3R5bGVOYW1lXSA9IHN0eWxlc1tzdHlsZU5hbWVdO1xuXG5cdFx0XHRjb2Rlcy5zZXQoc3R5bGVbMF0sIHN0eWxlWzFdKTtcblx0XHR9XG5cblx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoc3R5bGVzLCBncm91cE5hbWUsIHtcblx0XHRcdHZhbHVlOiBncm91cCxcblx0XHRcdGVudW1lcmFibGU6IGZhbHNlXG5cdFx0fSk7XG5cdH1cblxuXHRPYmplY3QuZGVmaW5lUHJvcGVydHkoc3R5bGVzLCAnY29kZXMnLCB7XG5cdFx0dmFsdWU6IGNvZGVzLFxuXHRcdGVudW1lcmFibGU6IGZhbHNlXG5cdH0pO1xuXG5cdHN0eWxlcy5jb2xvci5jbG9zZSA9ICdcXHUwMDFCWzM5bSc7XG5cdHN0eWxlcy5iZ0NvbG9yLmNsb3NlID0gJ1xcdTAwMUJbNDltJztcblxuXHRzdHlsZXMuY29sb3IuYW5zaTI1NiA9IHdyYXBBbnNpMjU2KCk7XG5cdHN0eWxlcy5jb2xvci5hbnNpMTZtID0gd3JhcEFuc2kxNm0oKTtcblx0c3R5bGVzLmJnQ29sb3IuYW5zaTI1NiA9IHdyYXBBbnNpMjU2KEFOU0lfQkFDS0dST1VORF9PRkZTRVQpO1xuXHRzdHlsZXMuYmdDb2xvci5hbnNpMTZtID0gd3JhcEFuc2kxNm0oQU5TSV9CQUNLR1JPVU5EX09GRlNFVCk7XG5cblx0Ly8gRnJvbSBodHRwczovL2dpdGh1Yi5jb20vUWl4LS9jb2xvci1jb252ZXJ0L2Jsb2IvM2YwZTBkNGU5MmUyMzU3OTZjY2IxN2Y2ZTg1YzcyMDk0YTY1MWY0OS9jb252ZXJzaW9ucy5qc1xuXHRPYmplY3QuZGVmaW5lUHJvcGVydGllcyhzdHlsZXMsIHtcblx0XHRyZ2JUb0Fuc2kyNTY6IHtcblx0XHRcdHZhbHVlOiAocmVkLCBncmVlbiwgYmx1ZSkgPT4ge1xuXHRcdFx0XHQvLyBXZSB1c2UgdGhlIGV4dGVuZGVkIGdyZXlzY2FsZSBwYWxldHRlIGhlcmUsIHdpdGggdGhlIGV4Y2VwdGlvbiBvZlxuXHRcdFx0XHQvLyBibGFjayBhbmQgd2hpdGUuIG5vcm1hbCBwYWxldHRlIG9ubHkgaGFzIDQgZ3JleXNjYWxlIHNoYWRlcy5cblx0XHRcdFx0aWYgKHJlZCA9PT0gZ3JlZW4gJiYgZ3JlZW4gPT09IGJsdWUpIHtcblx0XHRcdFx0XHRpZiAocmVkIDwgOCkge1xuXHRcdFx0XHRcdFx0cmV0dXJuIDE2O1xuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdGlmIChyZWQgPiAyNDgpIHtcblx0XHRcdFx0XHRcdHJldHVybiAyMzE7XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0cmV0dXJuIE1hdGgucm91bmQoKChyZWQgLSA4KSAvIDI0NykgKiAyNCkgKyAyMzI7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRyZXR1cm4gMTYgK1xuXHRcdFx0XHRcdCgzNiAqIE1hdGgucm91bmQocmVkIC8gMjU1ICogNSkpICtcblx0XHRcdFx0XHQoNiAqIE1hdGgucm91bmQoZ3JlZW4gLyAyNTUgKiA1KSkgK1xuXHRcdFx0XHRcdE1hdGgucm91bmQoYmx1ZSAvIDI1NSAqIDUpO1xuXHRcdFx0fSxcblx0XHRcdGVudW1lcmFibGU6IGZhbHNlXG5cdFx0fSxcblx0XHRoZXhUb1JnYjoge1xuXHRcdFx0dmFsdWU6IGhleCA9PiB7XG5cdFx0XHRcdGNvbnN0IG1hdGNoZXMgPSAvKD88Y29sb3JTdHJpbmc+W2EtZlxcZF17Nn18W2EtZlxcZF17M30pL2kuZXhlYyhoZXgudG9TdHJpbmcoMTYpKTtcblx0XHRcdFx0aWYgKCFtYXRjaGVzKSB7XG5cdFx0XHRcdFx0cmV0dXJuIFswLCAwLCAwXTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGxldCB7Y29sb3JTdHJpbmd9ID0gbWF0Y2hlcy5ncm91cHM7XG5cblx0XHRcdFx0aWYgKGNvbG9yU3RyaW5nLmxlbmd0aCA9PT0gMykge1xuXHRcdFx0XHRcdGNvbG9yU3RyaW5nID0gY29sb3JTdHJpbmcuc3BsaXQoJycpLm1hcChjaGFyYWN0ZXIgPT4gY2hhcmFjdGVyICsgY2hhcmFjdGVyKS5qb2luKCcnKTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGNvbnN0IGludGVnZXIgPSBOdW1iZXIucGFyc2VJbnQoY29sb3JTdHJpbmcsIDE2KTtcblxuXHRcdFx0XHRyZXR1cm4gW1xuXHRcdFx0XHRcdChpbnRlZ2VyID4+IDE2KSAmIDB4RkYsXG5cdFx0XHRcdFx0KGludGVnZXIgPj4gOCkgJiAweEZGLFxuXHRcdFx0XHRcdGludGVnZXIgJiAweEZGXG5cdFx0XHRcdF07XG5cdFx0XHR9LFxuXHRcdFx0ZW51bWVyYWJsZTogZmFsc2Vcblx0XHR9LFxuXHRcdGhleFRvQW5zaTI1Njoge1xuXHRcdFx0dmFsdWU6IGhleCA9PiBzdHlsZXMucmdiVG9BbnNpMjU2KC4uLnN0eWxlcy5oZXhUb1JnYihoZXgpKSxcblx0XHRcdGVudW1lcmFibGU6IGZhbHNlXG5cdFx0fVxuXHR9KTtcblxuXHRyZXR1cm4gc3R5bGVzO1xufVxuXG4vLyBNYWtlIHRoZSBleHBvcnQgaW1tdXRhYmxlXG5PYmplY3QuZGVmaW5lUHJvcGVydHkobW9kdWxlLCAnZXhwb3J0cycsIHtcblx0ZW51bWVyYWJsZTogdHJ1ZSxcblx0Z2V0OiBhc3NlbWJsZVN0eWxlc1xufSk7XG4iLCIndXNlIHN0cmljdCc7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHtcbiAgdmFsdWU6IHRydWVcbn0pO1xuZXhwb3J0cy5wcmludEl0ZXJhdG9yRW50cmllcyA9IHByaW50SXRlcmF0b3JFbnRyaWVzO1xuZXhwb3J0cy5wcmludEl0ZXJhdG9yVmFsdWVzID0gcHJpbnRJdGVyYXRvclZhbHVlcztcbmV4cG9ydHMucHJpbnRMaXN0SXRlbXMgPSBwcmludExpc3RJdGVtcztcbmV4cG9ydHMucHJpbnRPYmplY3RQcm9wZXJ0aWVzID0gcHJpbnRPYmplY3RQcm9wZXJ0aWVzO1xuXG4vKipcbiAqIENvcHlyaWdodCAoYykgRmFjZWJvb2ssIEluYy4gYW5kIGl0cyBhZmZpbGlhdGVzLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIE1JVCBsaWNlbnNlIGZvdW5kIGluIHRoZVxuICogTElDRU5TRSBmaWxlIGluIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICpcbiAqL1xuY29uc3QgZ2V0S2V5c09mRW51bWVyYWJsZVByb3BlcnRpZXMgPSAob2JqZWN0LCBjb21wYXJlS2V5cykgPT4ge1xuICBjb25zdCBrZXlzID0gT2JqZWN0LmtleXMob2JqZWN0KS5zb3J0KGNvbXBhcmVLZXlzKTtcblxuICBpZiAoT2JqZWN0LmdldE93blByb3BlcnR5U3ltYm9scykge1xuICAgIE9iamVjdC5nZXRPd25Qcm9wZXJ0eVN5bWJvbHMob2JqZWN0KS5mb3JFYWNoKHN5bWJvbCA9PiB7XG4gICAgICBpZiAoT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihvYmplY3QsIHN5bWJvbCkuZW51bWVyYWJsZSkge1xuICAgICAgICBrZXlzLnB1c2goc3ltYm9sKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIHJldHVybiBrZXlzO1xufTtcbi8qKlxuICogUmV0dXJuIGVudHJpZXMgKGZvciBleGFtcGxlLCBvZiBhIG1hcClcbiAqIHdpdGggc3BhY2luZywgaW5kZW50YXRpb24sIGFuZCBjb21tYVxuICogd2l0aG91dCBzdXJyb3VuZGluZyBwdW5jdHVhdGlvbiAoZm9yIGV4YW1wbGUsIGJyYWNlcylcbiAqL1xuXG5mdW5jdGlvbiBwcmludEl0ZXJhdG9yRW50cmllcyhcbiAgaXRlcmF0b3IsXG4gIGNvbmZpZyxcbiAgaW5kZW50YXRpb24sXG4gIGRlcHRoLFxuICByZWZzLFxuICBwcmludGVyLCAvLyBUb28gYmFkLCBzbyBzYWQgdGhhdCBzZXBhcmF0b3IgZm9yIEVDTUFTY3JpcHQgTWFwIGhhcyBiZWVuICcgPT4gJ1xuICAvLyBXaGF0IGEgZGlzdHJhY3RpbmcgZGlmZiBpZiB5b3UgY2hhbmdlIGEgZGF0YSBzdHJ1Y3R1cmUgdG8vZnJvbVxuICAvLyBFQ01BU2NyaXB0IE9iamVjdCBvciBJbW11dGFibGUuTWFwL09yZGVyZWRNYXAgd2hpY2ggdXNlIHRoZSBkZWZhdWx0LlxuICBzZXBhcmF0b3IgPSAnOiAnXG4pIHtcbiAgbGV0IHJlc3VsdCA9ICcnO1xuICBsZXQgY3VycmVudCA9IGl0ZXJhdG9yLm5leHQoKTtcblxuICBpZiAoIWN1cnJlbnQuZG9uZSkge1xuICAgIHJlc3VsdCArPSBjb25maWcuc3BhY2luZ091dGVyO1xuICAgIGNvbnN0IGluZGVudGF0aW9uTmV4dCA9IGluZGVudGF0aW9uICsgY29uZmlnLmluZGVudDtcblxuICAgIHdoaWxlICghY3VycmVudC5kb25lKSB7XG4gICAgICBjb25zdCBuYW1lID0gcHJpbnRlcihcbiAgICAgICAgY3VycmVudC52YWx1ZVswXSxcbiAgICAgICAgY29uZmlnLFxuICAgICAgICBpbmRlbnRhdGlvbk5leHQsXG4gICAgICAgIGRlcHRoLFxuICAgICAgICByZWZzXG4gICAgICApO1xuICAgICAgY29uc3QgdmFsdWUgPSBwcmludGVyKFxuICAgICAgICBjdXJyZW50LnZhbHVlWzFdLFxuICAgICAgICBjb25maWcsXG4gICAgICAgIGluZGVudGF0aW9uTmV4dCxcbiAgICAgICAgZGVwdGgsXG4gICAgICAgIHJlZnNcbiAgICAgICk7XG4gICAgICByZXN1bHQgKz0gaW5kZW50YXRpb25OZXh0ICsgbmFtZSArIHNlcGFyYXRvciArIHZhbHVlO1xuICAgICAgY3VycmVudCA9IGl0ZXJhdG9yLm5leHQoKTtcblxuICAgICAgaWYgKCFjdXJyZW50LmRvbmUpIHtcbiAgICAgICAgcmVzdWx0ICs9ICcsJyArIGNvbmZpZy5zcGFjaW5nSW5uZXI7XG4gICAgICB9IGVsc2UgaWYgKCFjb25maWcubWluKSB7XG4gICAgICAgIHJlc3VsdCArPSAnLCc7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmVzdWx0ICs9IGNvbmZpZy5zcGFjaW5nT3V0ZXIgKyBpbmRlbnRhdGlvbjtcbiAgfVxuXG4gIHJldHVybiByZXN1bHQ7XG59XG4vKipcbiAqIFJldHVybiB2YWx1ZXMgKGZvciBleGFtcGxlLCBvZiBhIHNldClcbiAqIHdpdGggc3BhY2luZywgaW5kZW50YXRpb24sIGFuZCBjb21tYVxuICogd2l0aG91dCBzdXJyb3VuZGluZyBwdW5jdHVhdGlvbiAoYnJhY2VzIG9yIGJyYWNrZXRzKVxuICovXG5cbmZ1bmN0aW9uIHByaW50SXRlcmF0b3JWYWx1ZXMoXG4gIGl0ZXJhdG9yLFxuICBjb25maWcsXG4gIGluZGVudGF0aW9uLFxuICBkZXB0aCxcbiAgcmVmcyxcbiAgcHJpbnRlclxuKSB7XG4gIGxldCByZXN1bHQgPSAnJztcbiAgbGV0IGN1cnJlbnQgPSBpdGVyYXRvci5uZXh0KCk7XG5cbiAgaWYgKCFjdXJyZW50LmRvbmUpIHtcbiAgICByZXN1bHQgKz0gY29uZmlnLnNwYWNpbmdPdXRlcjtcbiAgICBjb25zdCBpbmRlbnRhdGlvbk5leHQgPSBpbmRlbnRhdGlvbiArIGNvbmZpZy5pbmRlbnQ7XG5cbiAgICB3aGlsZSAoIWN1cnJlbnQuZG9uZSkge1xuICAgICAgcmVzdWx0ICs9XG4gICAgICAgIGluZGVudGF0aW9uTmV4dCArXG4gICAgICAgIHByaW50ZXIoY3VycmVudC52YWx1ZSwgY29uZmlnLCBpbmRlbnRhdGlvbk5leHQsIGRlcHRoLCByZWZzKTtcbiAgICAgIGN1cnJlbnQgPSBpdGVyYXRvci5uZXh0KCk7XG5cbiAgICAgIGlmICghY3VycmVudC5kb25lKSB7XG4gICAgICAgIHJlc3VsdCArPSAnLCcgKyBjb25maWcuc3BhY2luZ0lubmVyO1xuICAgICAgfSBlbHNlIGlmICghY29uZmlnLm1pbikge1xuICAgICAgICByZXN1bHQgKz0gJywnO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJlc3VsdCArPSBjb25maWcuc3BhY2luZ091dGVyICsgaW5kZW50YXRpb247XG4gIH1cblxuICByZXR1cm4gcmVzdWx0O1xufVxuLyoqXG4gKiBSZXR1cm4gaXRlbXMgKGZvciBleGFtcGxlLCBvZiBhbiBhcnJheSlcbiAqIHdpdGggc3BhY2luZywgaW5kZW50YXRpb24sIGFuZCBjb21tYVxuICogd2l0aG91dCBzdXJyb3VuZGluZyBwdW5jdHVhdGlvbiAoZm9yIGV4YW1wbGUsIGJyYWNrZXRzKVxuICoqL1xuXG5mdW5jdGlvbiBwcmludExpc3RJdGVtcyhsaXN0LCBjb25maWcsIGluZGVudGF0aW9uLCBkZXB0aCwgcmVmcywgcHJpbnRlcikge1xuICBsZXQgcmVzdWx0ID0gJyc7XG5cbiAgaWYgKGxpc3QubGVuZ3RoKSB7XG4gICAgcmVzdWx0ICs9IGNvbmZpZy5zcGFjaW5nT3V0ZXI7XG4gICAgY29uc3QgaW5kZW50YXRpb25OZXh0ID0gaW5kZW50YXRpb24gKyBjb25maWcuaW5kZW50O1xuXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBsaXN0Lmxlbmd0aDsgaSsrKSB7XG4gICAgICByZXN1bHQgKz0gaW5kZW50YXRpb25OZXh0O1xuXG4gICAgICBpZiAoaSBpbiBsaXN0KSB7XG4gICAgICAgIHJlc3VsdCArPSBwcmludGVyKGxpc3RbaV0sIGNvbmZpZywgaW5kZW50YXRpb25OZXh0LCBkZXB0aCwgcmVmcyk7XG4gICAgICB9XG5cbiAgICAgIGlmIChpIDwgbGlzdC5sZW5ndGggLSAxKSB7XG4gICAgICAgIHJlc3VsdCArPSAnLCcgKyBjb25maWcuc3BhY2luZ0lubmVyO1xuICAgICAgfSBlbHNlIGlmICghY29uZmlnLm1pbikge1xuICAgICAgICByZXN1bHQgKz0gJywnO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJlc3VsdCArPSBjb25maWcuc3BhY2luZ091dGVyICsgaW5kZW50YXRpb247XG4gIH1cblxuICByZXR1cm4gcmVzdWx0O1xufVxuLyoqXG4gKiBSZXR1cm4gcHJvcGVydGllcyBvZiBhbiBvYmplY3RcbiAqIHdpdGggc3BhY2luZywgaW5kZW50YXRpb24sIGFuZCBjb21tYVxuICogd2l0aG91dCBzdXJyb3VuZGluZyBwdW5jdHVhdGlvbiAoZm9yIGV4YW1wbGUsIGJyYWNlcylcbiAqL1xuXG5mdW5jdGlvbiBwcmludE9iamVjdFByb3BlcnRpZXModmFsLCBjb25maWcsIGluZGVudGF0aW9uLCBkZXB0aCwgcmVmcywgcHJpbnRlcikge1xuICBsZXQgcmVzdWx0ID0gJyc7XG4gIGNvbnN0IGtleXMgPSBnZXRLZXlzT2ZFbnVtZXJhYmxlUHJvcGVydGllcyh2YWwsIGNvbmZpZy5jb21wYXJlS2V5cyk7XG5cbiAgaWYgKGtleXMubGVuZ3RoKSB7XG4gICAgcmVzdWx0ICs9IGNvbmZpZy5zcGFjaW5nT3V0ZXI7XG4gICAgY29uc3QgaW5kZW50YXRpb25OZXh0ID0gaW5kZW50YXRpb24gKyBjb25maWcuaW5kZW50O1xuXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBrZXlzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBjb25zdCBrZXkgPSBrZXlzW2ldO1xuICAgICAgY29uc3QgbmFtZSA9IHByaW50ZXIoa2V5LCBjb25maWcsIGluZGVudGF0aW9uTmV4dCwgZGVwdGgsIHJlZnMpO1xuICAgICAgY29uc3QgdmFsdWUgPSBwcmludGVyKHZhbFtrZXldLCBjb25maWcsIGluZGVudGF0aW9uTmV4dCwgZGVwdGgsIHJlZnMpO1xuICAgICAgcmVzdWx0ICs9IGluZGVudGF0aW9uTmV4dCArIG5hbWUgKyAnOiAnICsgdmFsdWU7XG5cbiAgICAgIGlmIChpIDwga2V5cy5sZW5ndGggLSAxKSB7XG4gICAgICAgIHJlc3VsdCArPSAnLCcgKyBjb25maWcuc3BhY2luZ0lubmVyO1xuICAgICAgfSBlbHNlIGlmICghY29uZmlnLm1pbikge1xuICAgICAgICByZXN1bHQgKz0gJywnO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJlc3VsdCArPSBjb25maWcuc3BhY2luZ091dGVyICsgaW5kZW50YXRpb247XG4gIH1cblxuICByZXR1cm4gcmVzdWx0O1xufVxuIiwiJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcbmV4cG9ydHMudGVzdCA9IGV4cG9ydHMuc2VyaWFsaXplID0gZXhwb3J0cy5kZWZhdWx0ID0gdm9pZCAwO1xuXG52YXIgX2NvbGxlY3Rpb25zID0gcmVxdWlyZSgnLi4vY29sbGVjdGlvbnMnKTtcblxudmFyIGdsb2JhbCA9IChmdW5jdGlvbiAoKSB7XG4gIGlmICh0eXBlb2YgZ2xvYmFsVGhpcyAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICByZXR1cm4gZ2xvYmFsVGhpcztcbiAgfSBlbHNlIGlmICh0eXBlb2YgZ2xvYmFsICE9PSAndW5kZWZpbmVkJykge1xuICAgIHJldHVybiBnbG9iYWw7XG4gIH0gZWxzZSBpZiAodHlwZW9mIHNlbGYgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgcmV0dXJuIHNlbGY7XG4gIH0gZWxzZSBpZiAodHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICByZXR1cm4gd2luZG93O1xuICB9IGVsc2Uge1xuICAgIHJldHVybiBGdW5jdGlvbigncmV0dXJuIHRoaXMnKSgpO1xuICB9XG59KSgpO1xuXG52YXIgU3ltYm9sID0gZ2xvYmFsWydqZXN0LXN5bWJvbC1kby1ub3QtdG91Y2gnXSB8fCBnbG9iYWwuU3ltYm9sO1xuY29uc3QgYXN5bW1ldHJpY01hdGNoZXIgPVxuICB0eXBlb2YgU3ltYm9sID09PSAnZnVuY3Rpb24nICYmIFN5bWJvbC5mb3JcbiAgICA/IFN5bWJvbC5mb3IoJ2plc3QuYXN5bW1ldHJpY01hdGNoZXInKVxuICAgIDogMHgxMzU3YTU7XG5jb25zdCBTUEFDRSA9ICcgJztcblxuY29uc3Qgc2VyaWFsaXplID0gKHZhbCwgY29uZmlnLCBpbmRlbnRhdGlvbiwgZGVwdGgsIHJlZnMsIHByaW50ZXIpID0+IHtcbiAgY29uc3Qgc3RyaW5nZWRWYWx1ZSA9IHZhbC50b1N0cmluZygpO1xuXG4gIGlmIChcbiAgICBzdHJpbmdlZFZhbHVlID09PSAnQXJyYXlDb250YWluaW5nJyB8fFxuICAgIHN0cmluZ2VkVmFsdWUgPT09ICdBcnJheU5vdENvbnRhaW5pbmcnXG4gICkge1xuICAgIGlmICgrK2RlcHRoID4gY29uZmlnLm1heERlcHRoKSB7XG4gICAgICByZXR1cm4gJ1snICsgc3RyaW5nZWRWYWx1ZSArICddJztcbiAgICB9XG5cbiAgICByZXR1cm4gKFxuICAgICAgc3RyaW5nZWRWYWx1ZSArXG4gICAgICBTUEFDRSArXG4gICAgICAnWycgK1xuICAgICAgKDAsIF9jb2xsZWN0aW9ucy5wcmludExpc3RJdGVtcykoXG4gICAgICAgIHZhbC5zYW1wbGUsXG4gICAgICAgIGNvbmZpZyxcbiAgICAgICAgaW5kZW50YXRpb24sXG4gICAgICAgIGRlcHRoLFxuICAgICAgICByZWZzLFxuICAgICAgICBwcmludGVyXG4gICAgICApICtcbiAgICAgICddJ1xuICAgICk7XG4gIH1cblxuICBpZiAoXG4gICAgc3RyaW5nZWRWYWx1ZSA9PT0gJ09iamVjdENvbnRhaW5pbmcnIHx8XG4gICAgc3RyaW5nZWRWYWx1ZSA9PT0gJ09iamVjdE5vdENvbnRhaW5pbmcnXG4gICkge1xuICAgIGlmICgrK2RlcHRoID4gY29uZmlnLm1heERlcHRoKSB7XG4gICAgICByZXR1cm4gJ1snICsgc3RyaW5nZWRWYWx1ZSArICddJztcbiAgICB9XG5cbiAgICByZXR1cm4gKFxuICAgICAgc3RyaW5nZWRWYWx1ZSArXG4gICAgICBTUEFDRSArXG4gICAgICAneycgK1xuICAgICAgKDAsIF9jb2xsZWN0aW9ucy5wcmludE9iamVjdFByb3BlcnRpZXMpKFxuICAgICAgICB2YWwuc2FtcGxlLFxuICAgICAgICBjb25maWcsXG4gICAgICAgIGluZGVudGF0aW9uLFxuICAgICAgICBkZXB0aCxcbiAgICAgICAgcmVmcyxcbiAgICAgICAgcHJpbnRlclxuICAgICAgKSArXG4gICAgICAnfSdcbiAgICApO1xuICB9XG5cbiAgaWYgKFxuICAgIHN0cmluZ2VkVmFsdWUgPT09ICdTdHJpbmdNYXRjaGluZycgfHxcbiAgICBzdHJpbmdlZFZhbHVlID09PSAnU3RyaW5nTm90TWF0Y2hpbmcnXG4gICkge1xuICAgIHJldHVybiAoXG4gICAgICBzdHJpbmdlZFZhbHVlICtcbiAgICAgIFNQQUNFICtcbiAgICAgIHByaW50ZXIodmFsLnNhbXBsZSwgY29uZmlnLCBpbmRlbnRhdGlvbiwgZGVwdGgsIHJlZnMpXG4gICAgKTtcbiAgfVxuXG4gIGlmIChcbiAgICBzdHJpbmdlZFZhbHVlID09PSAnU3RyaW5nQ29udGFpbmluZycgfHxcbiAgICBzdHJpbmdlZFZhbHVlID09PSAnU3RyaW5nTm90Q29udGFpbmluZydcbiAgKSB7XG4gICAgcmV0dXJuIChcbiAgICAgIHN0cmluZ2VkVmFsdWUgK1xuICAgICAgU1BBQ0UgK1xuICAgICAgcHJpbnRlcih2YWwuc2FtcGxlLCBjb25maWcsIGluZGVudGF0aW9uLCBkZXB0aCwgcmVmcylcbiAgICApO1xuICB9XG5cbiAgcmV0dXJuIHZhbC50b0FzeW1tZXRyaWNNYXRjaGVyKCk7XG59O1xuXG5leHBvcnRzLnNlcmlhbGl6ZSA9IHNlcmlhbGl6ZTtcblxuY29uc3QgdGVzdCA9IHZhbCA9PiB2YWwgJiYgdmFsLiQkdHlwZW9mID09PSBhc3ltbWV0cmljTWF0Y2hlcjtcblxuZXhwb3J0cy50ZXN0ID0gdGVzdDtcbmNvbnN0IHBsdWdpbiA9IHtcbiAgc2VyaWFsaXplLFxuICB0ZXN0XG59O1xudmFyIF9kZWZhdWx0ID0gcGx1Z2luO1xuZXhwb3J0cy5kZWZhdWx0ID0gX2RlZmF1bHQ7XG4iLCIndXNlIHN0cmljdCc7XG5cbm1vZHVsZS5leHBvcnRzID0gKHtvbmx5Rmlyc3QgPSBmYWxzZX0gPSB7fSkgPT4ge1xuXHRjb25zdCBwYXR0ZXJuID0gW1xuXHRcdCdbXFxcXHUwMDFCXFxcXHUwMDlCXVtbXFxcXF0oKSM7P10qKD86KD86KD86KD86O1stYS16QS1aXFxcXGRcXFxcLyMmLjo9PyVAfl9dKykqfFthLXpBLVpcXFxcZF0rKD86O1stYS16QS1aXFxcXGRcXFxcLyMmLjo9PyVAfl9dKikqKT9cXFxcdTAwMDcpJyxcblx0XHQnKD86KD86XFxcXGR7MSw0fSg/OjtcXFxcZHswLDR9KSopP1tcXFxcZEEtUFItVFpjZi1udHFyeT0+PH5dKSknXG5cdF0uam9pbignfCcpO1xuXG5cdHJldHVybiBuZXcgUmVnRXhwKHBhdHRlcm4sIG9ubHlGaXJzdCA/IHVuZGVmaW5lZCA6ICdnJyk7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcbmV4cG9ydHMudGVzdCA9IGV4cG9ydHMuc2VyaWFsaXplID0gZXhwb3J0cy5kZWZhdWx0ID0gdm9pZCAwO1xuXG52YXIgX2Fuc2lSZWdleCA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQocmVxdWlyZSgnYW5zaS1yZWdleCcpKTtcblxudmFyIF9hbnNpU3R5bGVzID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChyZXF1aXJlKCdhbnNpLXN0eWxlcycpKTtcblxuZnVuY3Rpb24gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChvYmopIHtcbiAgcmV0dXJuIG9iaiAmJiBvYmouX19lc01vZHVsZSA/IG9iaiA6IHtkZWZhdWx0OiBvYmp9O1xufVxuXG4vKipcbiAqIENvcHlyaWdodCAoYykgRmFjZWJvb2ssIEluYy4gYW5kIGl0cyBhZmZpbGlhdGVzLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIE1JVCBsaWNlbnNlIGZvdW5kIGluIHRoZVxuICogTElDRU5TRSBmaWxlIGluIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5jb25zdCB0b0h1bWFuUmVhZGFibGVBbnNpID0gdGV4dCA9PlxuICB0ZXh0LnJlcGxhY2UoKDAsIF9hbnNpUmVnZXguZGVmYXVsdCkoKSwgbWF0Y2ggPT4ge1xuICAgIHN3aXRjaCAobWF0Y2gpIHtcbiAgICAgIGNhc2UgX2Fuc2lTdHlsZXMuZGVmYXVsdC5yZWQuY2xvc2U6XG4gICAgICBjYXNlIF9hbnNpU3R5bGVzLmRlZmF1bHQuZ3JlZW4uY2xvc2U6XG4gICAgICBjYXNlIF9hbnNpU3R5bGVzLmRlZmF1bHQuY3lhbi5jbG9zZTpcbiAgICAgIGNhc2UgX2Fuc2lTdHlsZXMuZGVmYXVsdC5ncmF5LmNsb3NlOlxuICAgICAgY2FzZSBfYW5zaVN0eWxlcy5kZWZhdWx0LndoaXRlLmNsb3NlOlxuICAgICAgY2FzZSBfYW5zaVN0eWxlcy5kZWZhdWx0LnllbGxvdy5jbG9zZTpcbiAgICAgIGNhc2UgX2Fuc2lTdHlsZXMuZGVmYXVsdC5iZ1JlZC5jbG9zZTpcbiAgICAgIGNhc2UgX2Fuc2lTdHlsZXMuZGVmYXVsdC5iZ0dyZWVuLmNsb3NlOlxuICAgICAgY2FzZSBfYW5zaVN0eWxlcy5kZWZhdWx0LmJnWWVsbG93LmNsb3NlOlxuICAgICAgY2FzZSBfYW5zaVN0eWxlcy5kZWZhdWx0LmludmVyc2UuY2xvc2U6XG4gICAgICBjYXNlIF9hbnNpU3R5bGVzLmRlZmF1bHQuZGltLmNsb3NlOlxuICAgICAgY2FzZSBfYW5zaVN0eWxlcy5kZWZhdWx0LmJvbGQuY2xvc2U6XG4gICAgICBjYXNlIF9hbnNpU3R5bGVzLmRlZmF1bHQucmVzZXQub3BlbjpcbiAgICAgIGNhc2UgX2Fuc2lTdHlsZXMuZGVmYXVsdC5yZXNldC5jbG9zZTpcbiAgICAgICAgcmV0dXJuICc8Lz4nO1xuXG4gICAgICBjYXNlIF9hbnNpU3R5bGVzLmRlZmF1bHQucmVkLm9wZW46XG4gICAgICAgIHJldHVybiAnPHJlZD4nO1xuXG4gICAgICBjYXNlIF9hbnNpU3R5bGVzLmRlZmF1bHQuZ3JlZW4ub3BlbjpcbiAgICAgICAgcmV0dXJuICc8Z3JlZW4+JztcblxuICAgICAgY2FzZSBfYW5zaVN0eWxlcy5kZWZhdWx0LmN5YW4ub3BlbjpcbiAgICAgICAgcmV0dXJuICc8Y3lhbj4nO1xuXG4gICAgICBjYXNlIF9hbnNpU3R5bGVzLmRlZmF1bHQuZ3JheS5vcGVuOlxuICAgICAgICByZXR1cm4gJzxncmF5Pic7XG5cbiAgICAgIGNhc2UgX2Fuc2lTdHlsZXMuZGVmYXVsdC53aGl0ZS5vcGVuOlxuICAgICAgICByZXR1cm4gJzx3aGl0ZT4nO1xuXG4gICAgICBjYXNlIF9hbnNpU3R5bGVzLmRlZmF1bHQueWVsbG93Lm9wZW46XG4gICAgICAgIHJldHVybiAnPHllbGxvdz4nO1xuXG4gICAgICBjYXNlIF9hbnNpU3R5bGVzLmRlZmF1bHQuYmdSZWQub3BlbjpcbiAgICAgICAgcmV0dXJuICc8YmdSZWQ+JztcblxuICAgICAgY2FzZSBfYW5zaVN0eWxlcy5kZWZhdWx0LmJnR3JlZW4ub3BlbjpcbiAgICAgICAgcmV0dXJuICc8YmdHcmVlbj4nO1xuXG4gICAgICBjYXNlIF9hbnNpU3R5bGVzLmRlZmF1bHQuYmdZZWxsb3cub3BlbjpcbiAgICAgICAgcmV0dXJuICc8YmdZZWxsb3c+JztcblxuICAgICAgY2FzZSBfYW5zaVN0eWxlcy5kZWZhdWx0LmludmVyc2Uub3BlbjpcbiAgICAgICAgcmV0dXJuICc8aW52ZXJzZT4nO1xuXG4gICAgICBjYXNlIF9hbnNpU3R5bGVzLmRlZmF1bHQuZGltLm9wZW46XG4gICAgICAgIHJldHVybiAnPGRpbT4nO1xuXG4gICAgICBjYXNlIF9hbnNpU3R5bGVzLmRlZmF1bHQuYm9sZC5vcGVuOlxuICAgICAgICByZXR1cm4gJzxib2xkPic7XG5cbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIHJldHVybiAnJztcbiAgICB9XG4gIH0pO1xuXG5jb25zdCB0ZXN0ID0gdmFsID0+XG4gIHR5cGVvZiB2YWwgPT09ICdzdHJpbmcnICYmICEhdmFsLm1hdGNoKCgwLCBfYW5zaVJlZ2V4LmRlZmF1bHQpKCkpO1xuXG5leHBvcnRzLnRlc3QgPSB0ZXN0O1xuXG5jb25zdCBzZXJpYWxpemUgPSAodmFsLCBjb25maWcsIGluZGVudGF0aW9uLCBkZXB0aCwgcmVmcywgcHJpbnRlcikgPT5cbiAgcHJpbnRlcih0b0h1bWFuUmVhZGFibGVBbnNpKHZhbCksIGNvbmZpZywgaW5kZW50YXRpb24sIGRlcHRoLCByZWZzKTtcblxuZXhwb3J0cy5zZXJpYWxpemUgPSBzZXJpYWxpemU7XG5jb25zdCBwbHVnaW4gPSB7XG4gIHNlcmlhbGl6ZSxcbiAgdGVzdFxufTtcbnZhciBfZGVmYXVsdCA9IHBsdWdpbjtcbmV4cG9ydHMuZGVmYXVsdCA9IF9kZWZhdWx0O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcbmV4cG9ydHMudGVzdCA9IGV4cG9ydHMuc2VyaWFsaXplID0gZXhwb3J0cy5kZWZhdWx0ID0gdm9pZCAwO1xuXG52YXIgX2NvbGxlY3Rpb25zID0gcmVxdWlyZSgnLi4vY29sbGVjdGlvbnMnKTtcblxuLyoqXG4gKiBDb3B5cmlnaHQgKGMpIEZhY2Vib29rLCBJbmMuIGFuZCBpdHMgYWZmaWxpYXRlcy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBNSVQgbGljZW5zZSBmb3VuZCBpbiB0aGVcbiAqIExJQ0VOU0UgZmlsZSBpbiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG4vKiBlc2xpbnQtZGlzYWJsZSBsb2NhbC9iYW4tdHlwZXMtZXZlbnR1YWxseSAqL1xuY29uc3QgU1BBQ0UgPSAnICc7XG5jb25zdCBPQkpFQ1RfTkFNRVMgPSBbJ0RPTVN0cmluZ01hcCcsICdOYW1lZE5vZGVNYXAnXTtcbmNvbnN0IEFSUkFZX1JFR0VYUCA9IC9eKEhUTUxcXHcqQ29sbGVjdGlvbnxOb2RlTGlzdCkkLztcblxuY29uc3QgdGVzdE5hbWUgPSBuYW1lID0+XG4gIE9CSkVDVF9OQU1FUy5pbmRleE9mKG5hbWUpICE9PSAtMSB8fCBBUlJBWV9SRUdFWFAudGVzdChuYW1lKTtcblxuY29uc3QgdGVzdCA9IHZhbCA9PlxuICB2YWwgJiZcbiAgdmFsLmNvbnN0cnVjdG9yICYmXG4gICEhdmFsLmNvbnN0cnVjdG9yLm5hbWUgJiZcbiAgdGVzdE5hbWUodmFsLmNvbnN0cnVjdG9yLm5hbWUpO1xuXG5leHBvcnRzLnRlc3QgPSB0ZXN0O1xuXG5jb25zdCBpc05hbWVkTm9kZU1hcCA9IGNvbGxlY3Rpb24gPT5cbiAgY29sbGVjdGlvbi5jb25zdHJ1Y3Rvci5uYW1lID09PSAnTmFtZWROb2RlTWFwJztcblxuY29uc3Qgc2VyaWFsaXplID0gKGNvbGxlY3Rpb24sIGNvbmZpZywgaW5kZW50YXRpb24sIGRlcHRoLCByZWZzLCBwcmludGVyKSA9PiB7XG4gIGNvbnN0IG5hbWUgPSBjb2xsZWN0aW9uLmNvbnN0cnVjdG9yLm5hbWU7XG5cbiAgaWYgKCsrZGVwdGggPiBjb25maWcubWF4RGVwdGgpIHtcbiAgICByZXR1cm4gJ1snICsgbmFtZSArICddJztcbiAgfVxuXG4gIHJldHVybiAoXG4gICAgKGNvbmZpZy5taW4gPyAnJyA6IG5hbWUgKyBTUEFDRSkgK1xuICAgIChPQkpFQ1RfTkFNRVMuaW5kZXhPZihuYW1lKSAhPT0gLTFcbiAgICAgID8gJ3snICtcbiAgICAgICAgKDAsIF9jb2xsZWN0aW9ucy5wcmludE9iamVjdFByb3BlcnRpZXMpKFxuICAgICAgICAgIGlzTmFtZWROb2RlTWFwKGNvbGxlY3Rpb24pXG4gICAgICAgICAgICA/IEFycmF5LmZyb20oY29sbGVjdGlvbikucmVkdWNlKChwcm9wcywgYXR0cmlidXRlKSA9PiB7XG4gICAgICAgICAgICAgICAgcHJvcHNbYXR0cmlidXRlLm5hbWVdID0gYXR0cmlidXRlLnZhbHVlO1xuICAgICAgICAgICAgICAgIHJldHVybiBwcm9wcztcbiAgICAgICAgICAgICAgfSwge30pXG4gICAgICAgICAgICA6IHsuLi5jb2xsZWN0aW9ufSxcbiAgICAgICAgICBjb25maWcsXG4gICAgICAgICAgaW5kZW50YXRpb24sXG4gICAgICAgICAgZGVwdGgsXG4gICAgICAgICAgcmVmcyxcbiAgICAgICAgICBwcmludGVyXG4gICAgICAgICkgK1xuICAgICAgICAnfSdcbiAgICAgIDogJ1snICtcbiAgICAgICAgKDAsIF9jb2xsZWN0aW9ucy5wcmludExpc3RJdGVtcykoXG4gICAgICAgICAgQXJyYXkuZnJvbShjb2xsZWN0aW9uKSxcbiAgICAgICAgICBjb25maWcsXG4gICAgICAgICAgaW5kZW50YXRpb24sXG4gICAgICAgICAgZGVwdGgsXG4gICAgICAgICAgcmVmcyxcbiAgICAgICAgICBwcmludGVyXG4gICAgICAgICkgK1xuICAgICAgICAnXScpXG4gICk7XG59O1xuXG5leHBvcnRzLnNlcmlhbGl6ZSA9IHNlcmlhbGl6ZTtcbmNvbnN0IHBsdWdpbiA9IHtcbiAgc2VyaWFsaXplLFxuICB0ZXN0XG59O1xudmFyIF9kZWZhdWx0ID0gcGx1Z2luO1xuZXhwb3J0cy5kZWZhdWx0ID0gX2RlZmF1bHQ7XG4iLCIndXNlIHN0cmljdCc7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHtcbiAgdmFsdWU6IHRydWVcbn0pO1xuZXhwb3J0cy5kZWZhdWx0ID0gZXNjYXBlSFRNTDtcblxuLyoqXG4gKiBDb3B5cmlnaHQgKGMpIEZhY2Vib29rLCBJbmMuIGFuZCBpdHMgYWZmaWxpYXRlcy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBNSVQgbGljZW5zZSBmb3VuZCBpbiB0aGVcbiAqIExJQ0VOU0UgZmlsZSBpbiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuZnVuY3Rpb24gZXNjYXBlSFRNTChzdHIpIHtcbiAgcmV0dXJuIHN0ci5yZXBsYWNlKC88L2csICcmbHQ7JykucmVwbGFjZSgvPi9nLCAnJmd0OycpO1xufVxuIiwiJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcbmV4cG9ydHMucHJpbnRUZXh0ID1cbiAgZXhwb3J0cy5wcmludFByb3BzID1cbiAgZXhwb3J0cy5wcmludEVsZW1lbnRBc0xlYWYgPVxuICBleHBvcnRzLnByaW50RWxlbWVudCA9XG4gIGV4cG9ydHMucHJpbnRDb21tZW50ID1cbiAgZXhwb3J0cy5wcmludENoaWxkcmVuID1cbiAgICB2b2lkIDA7XG5cbnZhciBfZXNjYXBlSFRNTCA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQocmVxdWlyZSgnLi9lc2NhcGVIVE1MJykpO1xuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KG9iaikge1xuICByZXR1cm4gb2JqICYmIG9iai5fX2VzTW9kdWxlID8gb2JqIDoge2RlZmF1bHQ6IG9ian07XG59XG5cbi8qKlxuICogQ29weXJpZ2h0IChjKSBGYWNlYm9vaywgSW5jLiBhbmQgaXRzIGFmZmlsaWF0ZXMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgTUlUIGxpY2Vuc2UgZm91bmQgaW4gdGhlXG4gKiBMSUNFTlNFIGZpbGUgaW4gdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cbi8vIFJldHVybiBlbXB0eSBzdHJpbmcgaWYga2V5cyBpcyBlbXB0eS5cbmNvbnN0IHByaW50UHJvcHMgPSAoa2V5cywgcHJvcHMsIGNvbmZpZywgaW5kZW50YXRpb24sIGRlcHRoLCByZWZzLCBwcmludGVyKSA9PiB7XG4gIGNvbnN0IGluZGVudGF0aW9uTmV4dCA9IGluZGVudGF0aW9uICsgY29uZmlnLmluZGVudDtcbiAgY29uc3QgY29sb3JzID0gY29uZmlnLmNvbG9ycztcbiAgcmV0dXJuIGtleXNcbiAgICAubWFwKGtleSA9PiB7XG4gICAgICBjb25zdCB2YWx1ZSA9IHByb3BzW2tleV07XG4gICAgICBsZXQgcHJpbnRlZCA9IHByaW50ZXIodmFsdWUsIGNvbmZpZywgaW5kZW50YXRpb25OZXh0LCBkZXB0aCwgcmVmcyk7XG5cbiAgICAgIGlmICh0eXBlb2YgdmFsdWUgIT09ICdzdHJpbmcnKSB7XG4gICAgICAgIGlmIChwcmludGVkLmluZGV4T2YoJ1xcbicpICE9PSAtMSkge1xuICAgICAgICAgIHByaW50ZWQgPVxuICAgICAgICAgICAgY29uZmlnLnNwYWNpbmdPdXRlciArXG4gICAgICAgICAgICBpbmRlbnRhdGlvbk5leHQgK1xuICAgICAgICAgICAgcHJpbnRlZCArXG4gICAgICAgICAgICBjb25maWcuc3BhY2luZ091dGVyICtcbiAgICAgICAgICAgIGluZGVudGF0aW9uO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJpbnRlZCA9ICd7JyArIHByaW50ZWQgKyAnfSc7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiAoXG4gICAgICAgIGNvbmZpZy5zcGFjaW5nSW5uZXIgK1xuICAgICAgICBpbmRlbnRhdGlvbiArXG4gICAgICAgIGNvbG9ycy5wcm9wLm9wZW4gK1xuICAgICAgICBrZXkgK1xuICAgICAgICBjb2xvcnMucHJvcC5jbG9zZSArXG4gICAgICAgICc9JyArXG4gICAgICAgIGNvbG9ycy52YWx1ZS5vcGVuICtcbiAgICAgICAgcHJpbnRlZCArXG4gICAgICAgIGNvbG9ycy52YWx1ZS5jbG9zZVxuICAgICAgKTtcbiAgICB9KVxuICAgIC5qb2luKCcnKTtcbn07IC8vIFJldHVybiBlbXB0eSBzdHJpbmcgaWYgY2hpbGRyZW4gaXMgZW1wdHkuXG5cbmV4cG9ydHMucHJpbnRQcm9wcyA9IHByaW50UHJvcHM7XG5cbmNvbnN0IHByaW50Q2hpbGRyZW4gPSAoY2hpbGRyZW4sIGNvbmZpZywgaW5kZW50YXRpb24sIGRlcHRoLCByZWZzLCBwcmludGVyKSA9PlxuICBjaGlsZHJlblxuICAgIC5tYXAoXG4gICAgICBjaGlsZCA9PlxuICAgICAgICBjb25maWcuc3BhY2luZ091dGVyICtcbiAgICAgICAgaW5kZW50YXRpb24gK1xuICAgICAgICAodHlwZW9mIGNoaWxkID09PSAnc3RyaW5nJ1xuICAgICAgICAgID8gcHJpbnRUZXh0KGNoaWxkLCBjb25maWcpXG4gICAgICAgICAgOiBwcmludGVyKGNoaWxkLCBjb25maWcsIGluZGVudGF0aW9uLCBkZXB0aCwgcmVmcykpXG4gICAgKVxuICAgIC5qb2luKCcnKTtcblxuZXhwb3J0cy5wcmludENoaWxkcmVuID0gcHJpbnRDaGlsZHJlbjtcblxuY29uc3QgcHJpbnRUZXh0ID0gKHRleHQsIGNvbmZpZykgPT4ge1xuICBjb25zdCBjb250ZW50Q29sb3IgPSBjb25maWcuY29sb3JzLmNvbnRlbnQ7XG4gIHJldHVybiAoXG4gICAgY29udGVudENvbG9yLm9wZW4gKyAoMCwgX2VzY2FwZUhUTUwuZGVmYXVsdCkodGV4dCkgKyBjb250ZW50Q29sb3IuY2xvc2VcbiAgKTtcbn07XG5cbmV4cG9ydHMucHJpbnRUZXh0ID0gcHJpbnRUZXh0O1xuXG5jb25zdCBwcmludENvbW1lbnQgPSAoY29tbWVudCwgY29uZmlnKSA9PiB7XG4gIGNvbnN0IGNvbW1lbnRDb2xvciA9IGNvbmZpZy5jb2xvcnMuY29tbWVudDtcbiAgcmV0dXJuIChcbiAgICBjb21tZW50Q29sb3Iub3BlbiArXG4gICAgJzwhLS0nICtcbiAgICAoMCwgX2VzY2FwZUhUTUwuZGVmYXVsdCkoY29tbWVudCkgK1xuICAgICctLT4nICtcbiAgICBjb21tZW50Q29sb3IuY2xvc2VcbiAgKTtcbn07IC8vIFNlcGFyYXRlIHRoZSBmdW5jdGlvbnMgdG8gZm9ybWF0IHByb3BzLCBjaGlsZHJlbiwgYW5kIGVsZW1lbnQsXG4vLyBzbyBhIHBsdWdpbiBjb3VsZCBvdmVycmlkZSBhIHBhcnRpY3VsYXIgZnVuY3Rpb24sIGlmIG5lZWRlZC5cbi8vIFRvbyBiYWQsIHNvIHNhZDogdGhlIHRyYWRpdGlvbmFsIChidXQgdW5uZWNlc3NhcnkpIHNwYWNlXG4vLyBpbiBhIHNlbGYtY2xvc2luZyB0YWdDb2xvciByZXF1aXJlcyBhIHNlY29uZCB0ZXN0IG9mIHByaW50ZWRQcm9wcy5cblxuZXhwb3J0cy5wcmludENvbW1lbnQgPSBwcmludENvbW1lbnQ7XG5cbmNvbnN0IHByaW50RWxlbWVudCA9IChcbiAgdHlwZSxcbiAgcHJpbnRlZFByb3BzLFxuICBwcmludGVkQ2hpbGRyZW4sXG4gIGNvbmZpZyxcbiAgaW5kZW50YXRpb25cbikgPT4ge1xuICBjb25zdCB0YWdDb2xvciA9IGNvbmZpZy5jb2xvcnMudGFnO1xuICByZXR1cm4gKFxuICAgIHRhZ0NvbG9yLm9wZW4gK1xuICAgICc8JyArXG4gICAgdHlwZSArXG4gICAgKHByaW50ZWRQcm9wcyAmJlxuICAgICAgdGFnQ29sb3IuY2xvc2UgK1xuICAgICAgICBwcmludGVkUHJvcHMgK1xuICAgICAgICBjb25maWcuc3BhY2luZ091dGVyICtcbiAgICAgICAgaW5kZW50YXRpb24gK1xuICAgICAgICB0YWdDb2xvci5vcGVuKSArXG4gICAgKHByaW50ZWRDaGlsZHJlblxuICAgICAgPyAnPicgK1xuICAgICAgICB0YWdDb2xvci5jbG9zZSArXG4gICAgICAgIHByaW50ZWRDaGlsZHJlbiArXG4gICAgICAgIGNvbmZpZy5zcGFjaW5nT3V0ZXIgK1xuICAgICAgICBpbmRlbnRhdGlvbiArXG4gICAgICAgIHRhZ0NvbG9yLm9wZW4gK1xuICAgICAgICAnPC8nICtcbiAgICAgICAgdHlwZVxuICAgICAgOiAocHJpbnRlZFByb3BzICYmICFjb25maWcubWluID8gJycgOiAnICcpICsgJy8nKSArXG4gICAgJz4nICtcbiAgICB0YWdDb2xvci5jbG9zZVxuICApO1xufTtcblxuZXhwb3J0cy5wcmludEVsZW1lbnQgPSBwcmludEVsZW1lbnQ7XG5cbmNvbnN0IHByaW50RWxlbWVudEFzTGVhZiA9ICh0eXBlLCBjb25maWcpID0+IHtcbiAgY29uc3QgdGFnQ29sb3IgPSBjb25maWcuY29sb3JzLnRhZztcbiAgcmV0dXJuIChcbiAgICB0YWdDb2xvci5vcGVuICtcbiAgICAnPCcgK1xuICAgIHR5cGUgK1xuICAgIHRhZ0NvbG9yLmNsb3NlICtcbiAgICAnIOKApicgK1xuICAgIHRhZ0NvbG9yLm9wZW4gK1xuICAgICcgLz4nICtcbiAgICB0YWdDb2xvci5jbG9zZVxuICApO1xufTtcblxuZXhwb3J0cy5wcmludEVsZW1lbnRBc0xlYWYgPSBwcmludEVsZW1lbnRBc0xlYWY7XG4iLCIndXNlIHN0cmljdCc7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHtcbiAgdmFsdWU6IHRydWVcbn0pO1xuZXhwb3J0cy50ZXN0ID0gZXhwb3J0cy5zZXJpYWxpemUgPSBleHBvcnRzLmRlZmF1bHQgPSB2b2lkIDA7XG5cbnZhciBfbWFya3VwID0gcmVxdWlyZSgnLi9saWIvbWFya3VwJyk7XG5cbi8qKlxuICogQ29weXJpZ2h0IChjKSBGYWNlYm9vaywgSW5jLiBhbmQgaXRzIGFmZmlsaWF0ZXMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgTUlUIGxpY2Vuc2UgZm91bmQgaW4gdGhlXG4gKiBMSUNFTlNFIGZpbGUgaW4gdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cbmNvbnN0IEVMRU1FTlRfTk9ERSA9IDE7XG5jb25zdCBURVhUX05PREUgPSAzO1xuY29uc3QgQ09NTUVOVF9OT0RFID0gODtcbmNvbnN0IEZSQUdNRU5UX05PREUgPSAxMTtcbmNvbnN0IEVMRU1FTlRfUkVHRVhQID0gL14oKEhUTUx8U1ZHKVxcdyopP0VsZW1lbnQkLztcblxuY29uc3QgdGVzdEhhc0F0dHJpYnV0ZSA9IHZhbCA9PiB7XG4gIHRyeSB7XG4gICAgcmV0dXJuIHR5cGVvZiB2YWwuaGFzQXR0cmlidXRlID09PSAnZnVuY3Rpb24nICYmIHZhbC5oYXNBdHRyaWJ1dGUoJ2lzJyk7XG4gIH0gY2F0Y2gge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxufTtcblxuY29uc3QgdGVzdE5vZGUgPSB2YWwgPT4ge1xuICBjb25zdCBjb25zdHJ1Y3Rvck5hbWUgPSB2YWwuY29uc3RydWN0b3IubmFtZTtcbiAgY29uc3Qge25vZGVUeXBlLCB0YWdOYW1lfSA9IHZhbDtcbiAgY29uc3QgaXNDdXN0b21FbGVtZW50ID1cbiAgICAodHlwZW9mIHRhZ05hbWUgPT09ICdzdHJpbmcnICYmIHRhZ05hbWUuaW5jbHVkZXMoJy0nKSkgfHxcbiAgICB0ZXN0SGFzQXR0cmlidXRlKHZhbCk7XG4gIHJldHVybiAoXG4gICAgKG5vZGVUeXBlID09PSBFTEVNRU5UX05PREUgJiZcbiAgICAgIChFTEVNRU5UX1JFR0VYUC50ZXN0KGNvbnN0cnVjdG9yTmFtZSkgfHwgaXNDdXN0b21FbGVtZW50KSkgfHxcbiAgICAobm9kZVR5cGUgPT09IFRFWFRfTk9ERSAmJiBjb25zdHJ1Y3Rvck5hbWUgPT09ICdUZXh0JykgfHxcbiAgICAobm9kZVR5cGUgPT09IENPTU1FTlRfTk9ERSAmJiBjb25zdHJ1Y3Rvck5hbWUgPT09ICdDb21tZW50JykgfHxcbiAgICAobm9kZVR5cGUgPT09IEZSQUdNRU5UX05PREUgJiYgY29uc3RydWN0b3JOYW1lID09PSAnRG9jdW1lbnRGcmFnbWVudCcpXG4gICk7XG59O1xuXG5jb25zdCB0ZXN0ID0gdmFsID0+IHtcbiAgdmFyIF92YWwkY29uc3RydWN0b3I7XG5cbiAgcmV0dXJuIChcbiAgICAodmFsID09PSBudWxsIHx8IHZhbCA9PT0gdm9pZCAwXG4gICAgICA/IHZvaWQgMFxuICAgICAgOiAoX3ZhbCRjb25zdHJ1Y3RvciA9IHZhbC5jb25zdHJ1Y3RvcikgPT09IG51bGwgfHxcbiAgICAgICAgX3ZhbCRjb25zdHJ1Y3RvciA9PT0gdm9pZCAwXG4gICAgICA/IHZvaWQgMFxuICAgICAgOiBfdmFsJGNvbnN0cnVjdG9yLm5hbWUpICYmIHRlc3ROb2RlKHZhbClcbiAgKTtcbn07XG5cbmV4cG9ydHMudGVzdCA9IHRlc3Q7XG5cbmZ1bmN0aW9uIG5vZGVJc1RleHQobm9kZSkge1xuICByZXR1cm4gbm9kZS5ub2RlVHlwZSA9PT0gVEVYVF9OT0RFO1xufVxuXG5mdW5jdGlvbiBub2RlSXNDb21tZW50KG5vZGUpIHtcbiAgcmV0dXJuIG5vZGUubm9kZVR5cGUgPT09IENPTU1FTlRfTk9ERTtcbn1cblxuZnVuY3Rpb24gbm9kZUlzRnJhZ21lbnQobm9kZSkge1xuICByZXR1cm4gbm9kZS5ub2RlVHlwZSA9PT0gRlJBR01FTlRfTk9ERTtcbn1cblxuY29uc3Qgc2VyaWFsaXplID0gKG5vZGUsIGNvbmZpZywgaW5kZW50YXRpb24sIGRlcHRoLCByZWZzLCBwcmludGVyKSA9PiB7XG4gIGlmIChub2RlSXNUZXh0KG5vZGUpKSB7XG4gICAgcmV0dXJuICgwLCBfbWFya3VwLnByaW50VGV4dCkobm9kZS5kYXRhLCBjb25maWcpO1xuICB9XG5cbiAgaWYgKG5vZGVJc0NvbW1lbnQobm9kZSkpIHtcbiAgICByZXR1cm4gKDAsIF9tYXJrdXAucHJpbnRDb21tZW50KShub2RlLmRhdGEsIGNvbmZpZyk7XG4gIH1cblxuICBjb25zdCB0eXBlID0gbm9kZUlzRnJhZ21lbnQobm9kZSlcbiAgICA/IGBEb2N1bWVudEZyYWdtZW50YFxuICAgIDogbm9kZS50YWdOYW1lLnRvTG93ZXJDYXNlKCk7XG5cbiAgaWYgKCsrZGVwdGggPiBjb25maWcubWF4RGVwdGgpIHtcbiAgICByZXR1cm4gKDAsIF9tYXJrdXAucHJpbnRFbGVtZW50QXNMZWFmKSh0eXBlLCBjb25maWcpO1xuICB9XG5cbiAgcmV0dXJuICgwLCBfbWFya3VwLnByaW50RWxlbWVudCkoXG4gICAgdHlwZSxcbiAgICAoMCwgX21hcmt1cC5wcmludFByb3BzKShcbiAgICAgIG5vZGVJc0ZyYWdtZW50KG5vZGUpXG4gICAgICAgID8gW11cbiAgICAgICAgOiBBcnJheS5mcm9tKG5vZGUuYXR0cmlidXRlcylcbiAgICAgICAgICAgIC5tYXAoYXR0ciA9PiBhdHRyLm5hbWUpXG4gICAgICAgICAgICAuc29ydCgpLFxuICAgICAgbm9kZUlzRnJhZ21lbnQobm9kZSlcbiAgICAgICAgPyB7fVxuICAgICAgICA6IEFycmF5LmZyb20obm9kZS5hdHRyaWJ1dGVzKS5yZWR1Y2UoKHByb3BzLCBhdHRyaWJ1dGUpID0+IHtcbiAgICAgICAgICAgIHByb3BzW2F0dHJpYnV0ZS5uYW1lXSA9IGF0dHJpYnV0ZS52YWx1ZTtcbiAgICAgICAgICAgIHJldHVybiBwcm9wcztcbiAgICAgICAgICB9LCB7fSksXG4gICAgICBjb25maWcsXG4gICAgICBpbmRlbnRhdGlvbiArIGNvbmZpZy5pbmRlbnQsXG4gICAgICBkZXB0aCxcbiAgICAgIHJlZnMsXG4gICAgICBwcmludGVyXG4gICAgKSxcbiAgICAoMCwgX21hcmt1cC5wcmludENoaWxkcmVuKShcbiAgICAgIEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKG5vZGUuY2hpbGROb2RlcyB8fCBub2RlLmNoaWxkcmVuKSxcbiAgICAgIGNvbmZpZyxcbiAgICAgIGluZGVudGF0aW9uICsgY29uZmlnLmluZGVudCxcbiAgICAgIGRlcHRoLFxuICAgICAgcmVmcyxcbiAgICAgIHByaW50ZXJcbiAgICApLFxuICAgIGNvbmZpZyxcbiAgICBpbmRlbnRhdGlvblxuICApO1xufTtcblxuZXhwb3J0cy5zZXJpYWxpemUgPSBzZXJpYWxpemU7XG5jb25zdCBwbHVnaW4gPSB7XG4gIHNlcmlhbGl6ZSxcbiAgdGVzdFxufTtcbnZhciBfZGVmYXVsdCA9IHBsdWdpbjtcbmV4cG9ydHMuZGVmYXVsdCA9IF9kZWZhdWx0O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcbmV4cG9ydHMudGVzdCA9IGV4cG9ydHMuc2VyaWFsaXplID0gZXhwb3J0cy5kZWZhdWx0ID0gdm9pZCAwO1xuXG52YXIgX2NvbGxlY3Rpb25zID0gcmVxdWlyZSgnLi4vY29sbGVjdGlvbnMnKTtcblxuLyoqXG4gKiBDb3B5cmlnaHQgKGMpIEZhY2Vib29rLCBJbmMuIGFuZCBpdHMgYWZmaWxpYXRlcy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBNSVQgbGljZW5zZSBmb3VuZCBpbiB0aGVcbiAqIExJQ0VOU0UgZmlsZSBpbiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuLy8gU0VOVElORUwgY29uc3RhbnRzIGFyZSBmcm9tIGh0dHBzOi8vZ2l0aHViLmNvbS9mYWNlYm9vay9pbW11dGFibGUtanNcbmNvbnN0IElTX0lURVJBQkxFX1NFTlRJTkVMID0gJ0BAX19JTU1VVEFCTEVfSVRFUkFCTEVfX0BAJztcbmNvbnN0IElTX0xJU1RfU0VOVElORUwgPSAnQEBfX0lNTVVUQUJMRV9MSVNUX19AQCc7XG5jb25zdCBJU19LRVlFRF9TRU5USU5FTCA9ICdAQF9fSU1NVVRBQkxFX0tFWUVEX19AQCc7XG5jb25zdCBJU19NQVBfU0VOVElORUwgPSAnQEBfX0lNTVVUQUJMRV9NQVBfX0BAJztcbmNvbnN0IElTX09SREVSRURfU0VOVElORUwgPSAnQEBfX0lNTVVUQUJMRV9PUkRFUkVEX19AQCc7XG5jb25zdCBJU19SRUNPUkRfU0VOVElORUwgPSAnQEBfX0lNTVVUQUJMRV9SRUNPUkRfX0BAJzsgLy8gaW1tdXRhYmxlIHY0XG5cbmNvbnN0IElTX1NFUV9TRU5USU5FTCA9ICdAQF9fSU1NVVRBQkxFX1NFUV9fQEAnO1xuY29uc3QgSVNfU0VUX1NFTlRJTkVMID0gJ0BAX19JTU1VVEFCTEVfU0VUX19AQCc7XG5jb25zdCBJU19TVEFDS19TRU5USU5FTCA9ICdAQF9fSU1NVVRBQkxFX1NUQUNLX19AQCc7XG5cbmNvbnN0IGdldEltbXV0YWJsZU5hbWUgPSBuYW1lID0+ICdJbW11dGFibGUuJyArIG5hbWU7XG5cbmNvbnN0IHByaW50QXNMZWFmID0gbmFtZSA9PiAnWycgKyBuYW1lICsgJ10nO1xuXG5jb25zdCBTUEFDRSA9ICcgJztcbmNvbnN0IExBWlkgPSAn4oCmJzsgLy8gU2VxIGlzIGxhenkgaWYgaXQgY2FsbHMgYSBtZXRob2QgbGlrZSBmaWx0ZXJcblxuY29uc3QgcHJpbnRJbW11dGFibGVFbnRyaWVzID0gKFxuICB2YWwsXG4gIGNvbmZpZyxcbiAgaW5kZW50YXRpb24sXG4gIGRlcHRoLFxuICByZWZzLFxuICBwcmludGVyLFxuICB0eXBlXG4pID0+XG4gICsrZGVwdGggPiBjb25maWcubWF4RGVwdGhcbiAgICA/IHByaW50QXNMZWFmKGdldEltbXV0YWJsZU5hbWUodHlwZSkpXG4gICAgOiBnZXRJbW11dGFibGVOYW1lKHR5cGUpICtcbiAgICAgIFNQQUNFICtcbiAgICAgICd7JyArXG4gICAgICAoMCwgX2NvbGxlY3Rpb25zLnByaW50SXRlcmF0b3JFbnRyaWVzKShcbiAgICAgICAgdmFsLmVudHJpZXMoKSxcbiAgICAgICAgY29uZmlnLFxuICAgICAgICBpbmRlbnRhdGlvbixcbiAgICAgICAgZGVwdGgsXG4gICAgICAgIHJlZnMsXG4gICAgICAgIHByaW50ZXJcbiAgICAgICkgK1xuICAgICAgJ30nOyAvLyBSZWNvcmQgaGFzIGFuIGVudHJpZXMgbWV0aG9kIGJlY2F1c2UgaXQgaXMgYSBjb2xsZWN0aW9uIGluIGltbXV0YWJsZSB2My5cbi8vIFJldHVybiBhbiBpdGVyYXRvciBmb3IgSW1tdXRhYmxlIFJlY29yZCBmcm9tIHZlcnNpb24gdjMgb3IgdjQuXG5cbmZ1bmN0aW9uIGdldFJlY29yZEVudHJpZXModmFsKSB7XG4gIGxldCBpID0gMDtcbiAgcmV0dXJuIHtcbiAgICBuZXh0KCkge1xuICAgICAgaWYgKGkgPCB2YWwuX2tleXMubGVuZ3RoKSB7XG4gICAgICAgIGNvbnN0IGtleSA9IHZhbC5fa2V5c1tpKytdO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIGRvbmU6IGZhbHNlLFxuICAgICAgICAgIHZhbHVlOiBba2V5LCB2YWwuZ2V0KGtleSldXG4gICAgICAgIH07XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB7XG4gICAgICAgIGRvbmU6IHRydWUsXG4gICAgICAgIHZhbHVlOiB1bmRlZmluZWRcbiAgICAgIH07XG4gICAgfVxuICB9O1xufVxuXG5jb25zdCBwcmludEltbXV0YWJsZVJlY29yZCA9IChcbiAgdmFsLFxuICBjb25maWcsXG4gIGluZGVudGF0aW9uLFxuICBkZXB0aCxcbiAgcmVmcyxcbiAgcHJpbnRlclxuKSA9PiB7XG4gIC8vIF9uYW1lIHByb3BlcnR5IGlzIGRlZmluZWQgb25seSBmb3IgYW4gSW1tdXRhYmxlIFJlY29yZCBpbnN0YW5jZVxuICAvLyB3aGljaCB3YXMgY29uc3RydWN0ZWQgd2l0aCBhIHNlY29uZCBvcHRpb25hbCBkZXNjcmlwdGl2ZSBuYW1lIGFyZ1xuICBjb25zdCBuYW1lID0gZ2V0SW1tdXRhYmxlTmFtZSh2YWwuX25hbWUgfHwgJ1JlY29yZCcpO1xuICByZXR1cm4gKytkZXB0aCA+IGNvbmZpZy5tYXhEZXB0aFxuICAgID8gcHJpbnRBc0xlYWYobmFtZSlcbiAgICA6IG5hbWUgK1xuICAgICAgICBTUEFDRSArXG4gICAgICAgICd7JyArXG4gICAgICAgICgwLCBfY29sbGVjdGlvbnMucHJpbnRJdGVyYXRvckVudHJpZXMpKFxuICAgICAgICAgIGdldFJlY29yZEVudHJpZXModmFsKSxcbiAgICAgICAgICBjb25maWcsXG4gICAgICAgICAgaW5kZW50YXRpb24sXG4gICAgICAgICAgZGVwdGgsXG4gICAgICAgICAgcmVmcyxcbiAgICAgICAgICBwcmludGVyXG4gICAgICAgICkgK1xuICAgICAgICAnfSc7XG59O1xuXG5jb25zdCBwcmludEltbXV0YWJsZVNlcSA9ICh2YWwsIGNvbmZpZywgaW5kZW50YXRpb24sIGRlcHRoLCByZWZzLCBwcmludGVyKSA9PiB7XG4gIGNvbnN0IG5hbWUgPSBnZXRJbW11dGFibGVOYW1lKCdTZXEnKTtcblxuICBpZiAoKytkZXB0aCA+IGNvbmZpZy5tYXhEZXB0aCkge1xuICAgIHJldHVybiBwcmludEFzTGVhZihuYW1lKTtcbiAgfVxuXG4gIGlmICh2YWxbSVNfS0VZRURfU0VOVElORUxdKSB7XG4gICAgcmV0dXJuIChcbiAgICAgIG5hbWUgK1xuICAgICAgU1BBQ0UgK1xuICAgICAgJ3snICsgLy8gZnJvbSBJbW11dGFibGUgY29sbGVjdGlvbiBvZiBlbnRyaWVzIG9yIGZyb20gRUNNQVNjcmlwdCBvYmplY3RcbiAgICAgICh2YWwuX2l0ZXIgfHwgdmFsLl9vYmplY3RcbiAgICAgICAgPyAoMCwgX2NvbGxlY3Rpb25zLnByaW50SXRlcmF0b3JFbnRyaWVzKShcbiAgICAgICAgICAgIHZhbC5lbnRyaWVzKCksXG4gICAgICAgICAgICBjb25maWcsXG4gICAgICAgICAgICBpbmRlbnRhdGlvbixcbiAgICAgICAgICAgIGRlcHRoLFxuICAgICAgICAgICAgcmVmcyxcbiAgICAgICAgICAgIHByaW50ZXJcbiAgICAgICAgICApXG4gICAgICAgIDogTEFaWSkgK1xuICAgICAgJ30nXG4gICAgKTtcbiAgfVxuXG4gIHJldHVybiAoXG4gICAgbmFtZSArXG4gICAgU1BBQ0UgK1xuICAgICdbJyArXG4gICAgKHZhbC5faXRlciB8fCAvLyBmcm9tIEltbXV0YWJsZSBjb2xsZWN0aW9uIG9mIHZhbHVlc1xuICAgIHZhbC5fYXJyYXkgfHwgLy8gZnJvbSBFQ01BU2NyaXB0IGFycmF5XG4gICAgdmFsLl9jb2xsZWN0aW9uIHx8IC8vIGZyb20gRUNNQVNjcmlwdCBjb2xsZWN0aW9uIGluIGltbXV0YWJsZSB2NFxuICAgIHZhbC5faXRlcmFibGUgLy8gZnJvbSBFQ01BU2NyaXB0IGNvbGxlY3Rpb24gaW4gaW1tdXRhYmxlIHYzXG4gICAgICA/ICgwLCBfY29sbGVjdGlvbnMucHJpbnRJdGVyYXRvclZhbHVlcykoXG4gICAgICAgICAgdmFsLnZhbHVlcygpLFxuICAgICAgICAgIGNvbmZpZyxcbiAgICAgICAgICBpbmRlbnRhdGlvbixcbiAgICAgICAgICBkZXB0aCxcbiAgICAgICAgICByZWZzLFxuICAgICAgICAgIHByaW50ZXJcbiAgICAgICAgKVxuICAgICAgOiBMQVpZKSArXG4gICAgJ10nXG4gICk7XG59O1xuXG5jb25zdCBwcmludEltbXV0YWJsZVZhbHVlcyA9IChcbiAgdmFsLFxuICBjb25maWcsXG4gIGluZGVudGF0aW9uLFxuICBkZXB0aCxcbiAgcmVmcyxcbiAgcHJpbnRlcixcbiAgdHlwZVxuKSA9PlxuICArK2RlcHRoID4gY29uZmlnLm1heERlcHRoXG4gICAgPyBwcmludEFzTGVhZihnZXRJbW11dGFibGVOYW1lKHR5cGUpKVxuICAgIDogZ2V0SW1tdXRhYmxlTmFtZSh0eXBlKSArXG4gICAgICBTUEFDRSArXG4gICAgICAnWycgK1xuICAgICAgKDAsIF9jb2xsZWN0aW9ucy5wcmludEl0ZXJhdG9yVmFsdWVzKShcbiAgICAgICAgdmFsLnZhbHVlcygpLFxuICAgICAgICBjb25maWcsXG4gICAgICAgIGluZGVudGF0aW9uLFxuICAgICAgICBkZXB0aCxcbiAgICAgICAgcmVmcyxcbiAgICAgICAgcHJpbnRlclxuICAgICAgKSArXG4gICAgICAnXSc7XG5cbmNvbnN0IHNlcmlhbGl6ZSA9ICh2YWwsIGNvbmZpZywgaW5kZW50YXRpb24sIGRlcHRoLCByZWZzLCBwcmludGVyKSA9PiB7XG4gIGlmICh2YWxbSVNfTUFQX1NFTlRJTkVMXSkge1xuICAgIHJldHVybiBwcmludEltbXV0YWJsZUVudHJpZXMoXG4gICAgICB2YWwsXG4gICAgICBjb25maWcsXG4gICAgICBpbmRlbnRhdGlvbixcbiAgICAgIGRlcHRoLFxuICAgICAgcmVmcyxcbiAgICAgIHByaW50ZXIsXG4gICAgICB2YWxbSVNfT1JERVJFRF9TRU5USU5FTF0gPyAnT3JkZXJlZE1hcCcgOiAnTWFwJ1xuICAgICk7XG4gIH1cblxuICBpZiAodmFsW0lTX0xJU1RfU0VOVElORUxdKSB7XG4gICAgcmV0dXJuIHByaW50SW1tdXRhYmxlVmFsdWVzKFxuICAgICAgdmFsLFxuICAgICAgY29uZmlnLFxuICAgICAgaW5kZW50YXRpb24sXG4gICAgICBkZXB0aCxcbiAgICAgIHJlZnMsXG4gICAgICBwcmludGVyLFxuICAgICAgJ0xpc3QnXG4gICAgKTtcbiAgfVxuXG4gIGlmICh2YWxbSVNfU0VUX1NFTlRJTkVMXSkge1xuICAgIHJldHVybiBwcmludEltbXV0YWJsZVZhbHVlcyhcbiAgICAgIHZhbCxcbiAgICAgIGNvbmZpZyxcbiAgICAgIGluZGVudGF0aW9uLFxuICAgICAgZGVwdGgsXG4gICAgICByZWZzLFxuICAgICAgcHJpbnRlcixcbiAgICAgIHZhbFtJU19PUkRFUkVEX1NFTlRJTkVMXSA/ICdPcmRlcmVkU2V0JyA6ICdTZXQnXG4gICAgKTtcbiAgfVxuXG4gIGlmICh2YWxbSVNfU1RBQ0tfU0VOVElORUxdKSB7XG4gICAgcmV0dXJuIHByaW50SW1tdXRhYmxlVmFsdWVzKFxuICAgICAgdmFsLFxuICAgICAgY29uZmlnLFxuICAgICAgaW5kZW50YXRpb24sXG4gICAgICBkZXB0aCxcbiAgICAgIHJlZnMsXG4gICAgICBwcmludGVyLFxuICAgICAgJ1N0YWNrJ1xuICAgICk7XG4gIH1cblxuICBpZiAodmFsW0lTX1NFUV9TRU5USU5FTF0pIHtcbiAgICByZXR1cm4gcHJpbnRJbW11dGFibGVTZXEodmFsLCBjb25maWcsIGluZGVudGF0aW9uLCBkZXB0aCwgcmVmcywgcHJpbnRlcik7XG4gIH0gLy8gRm9yIGNvbXBhdGliaWxpdHkgd2l0aCBpbW11dGFibGUgdjMgYW5kIHY0LCBsZXQgcmVjb3JkIGJlIHRoZSBkZWZhdWx0LlxuXG4gIHJldHVybiBwcmludEltbXV0YWJsZVJlY29yZCh2YWwsIGNvbmZpZywgaW5kZW50YXRpb24sIGRlcHRoLCByZWZzLCBwcmludGVyKTtcbn07IC8vIEV4cGxpY2l0bHkgY29tcGFyaW5nIHNlbnRpbmVsIHByb3BlcnRpZXMgdG8gdHJ1ZSBhdm9pZHMgZmFsc2UgcG9zaXRpdmVcbi8vIHdoZW4gbW9jayBpZGVudGl0eS1vYmotcHJveHkgcmV0dXJucyB0aGUga2V5IGFzIHRoZSB2YWx1ZSBmb3IgYW55IGtleS5cblxuZXhwb3J0cy5zZXJpYWxpemUgPSBzZXJpYWxpemU7XG5cbmNvbnN0IHRlc3QgPSB2YWwgPT5cbiAgdmFsICYmXG4gICh2YWxbSVNfSVRFUkFCTEVfU0VOVElORUxdID09PSB0cnVlIHx8IHZhbFtJU19SRUNPUkRfU0VOVElORUxdID09PSB0cnVlKTtcblxuZXhwb3J0cy50ZXN0ID0gdGVzdDtcbmNvbnN0IHBsdWdpbiA9IHtcbiAgc2VyaWFsaXplLFxuICB0ZXN0XG59O1xudmFyIF9kZWZhdWx0ID0gcGx1Z2luO1xuZXhwb3J0cy5kZWZhdWx0ID0gX2RlZmF1bHQ7XG4iLCIvKiogQGxpY2Vuc2UgUmVhY3QgdjE3LjAuMlxuICogcmVhY3QtaXMucHJvZHVjdGlvbi5taW4uanNcbiAqXG4gKiBDb3B5cmlnaHQgKGMpIEZhY2Vib29rLCBJbmMuIGFuZCBpdHMgYWZmaWxpYXRlcy5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBNSVQgbGljZW5zZSBmb3VuZCBpbiB0aGVcbiAqIExJQ0VOU0UgZmlsZSBpbiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuJ3VzZSBzdHJpY3QnO3ZhciBiPTYwMTAzLGM9NjAxMDYsZD02MDEwNyxlPTYwMTA4LGY9NjAxMTQsZz02MDEwOSxoPTYwMTEwLGs9NjAxMTIsbD02MDExMyxtPTYwMTIwLG49NjAxMTUscD02MDExNixxPTYwMTIxLHI9NjAxMjIsdT02MDExNyx2PTYwMTI5LHc9NjAxMzE7XG5pZihcImZ1bmN0aW9uXCI9PT10eXBlb2YgU3ltYm9sJiZTeW1ib2wuZm9yKXt2YXIgeD1TeW1ib2wuZm9yO2I9eChcInJlYWN0LmVsZW1lbnRcIik7Yz14KFwicmVhY3QucG9ydGFsXCIpO2Q9eChcInJlYWN0LmZyYWdtZW50XCIpO2U9eChcInJlYWN0LnN0cmljdF9tb2RlXCIpO2Y9eChcInJlYWN0LnByb2ZpbGVyXCIpO2c9eChcInJlYWN0LnByb3ZpZGVyXCIpO2g9eChcInJlYWN0LmNvbnRleHRcIik7az14KFwicmVhY3QuZm9yd2FyZF9yZWZcIik7bD14KFwicmVhY3Quc3VzcGVuc2VcIik7bT14KFwicmVhY3Quc3VzcGVuc2VfbGlzdFwiKTtuPXgoXCJyZWFjdC5tZW1vXCIpO3A9eChcInJlYWN0LmxhenlcIik7cT14KFwicmVhY3QuYmxvY2tcIik7cj14KFwicmVhY3Quc2VydmVyLmJsb2NrXCIpO3U9eChcInJlYWN0LmZ1bmRhbWVudGFsXCIpO3Y9eChcInJlYWN0LmRlYnVnX3RyYWNlX21vZGVcIik7dz14KFwicmVhY3QubGVnYWN5X2hpZGRlblwiKX1cbmZ1bmN0aW9uIHkoYSl7aWYoXCJvYmplY3RcIj09PXR5cGVvZiBhJiZudWxsIT09YSl7dmFyIHQ9YS4kJHR5cGVvZjtzd2l0Y2godCl7Y2FzZSBiOnN3aXRjaChhPWEudHlwZSxhKXtjYXNlIGQ6Y2FzZSBmOmNhc2UgZTpjYXNlIGw6Y2FzZSBtOnJldHVybiBhO2RlZmF1bHQ6c3dpdGNoKGE9YSYmYS4kJHR5cGVvZixhKXtjYXNlIGg6Y2FzZSBrOmNhc2UgcDpjYXNlIG46Y2FzZSBnOnJldHVybiBhO2RlZmF1bHQ6cmV0dXJuIHR9fWNhc2UgYzpyZXR1cm4gdH19fXZhciB6PWcsQT1iLEI9ayxDPWQsRD1wLEU9bixGPWMsRz1mLEg9ZSxJPWw7ZXhwb3J0cy5Db250ZXh0Q29uc3VtZXI9aDtleHBvcnRzLkNvbnRleHRQcm92aWRlcj16O2V4cG9ydHMuRWxlbWVudD1BO2V4cG9ydHMuRm9yd2FyZFJlZj1CO2V4cG9ydHMuRnJhZ21lbnQ9QztleHBvcnRzLkxhenk9RDtleHBvcnRzLk1lbW89RTtleHBvcnRzLlBvcnRhbD1GO2V4cG9ydHMuUHJvZmlsZXI9RztleHBvcnRzLlN0cmljdE1vZGU9SDtcbmV4cG9ydHMuU3VzcGVuc2U9STtleHBvcnRzLmlzQXN5bmNNb2RlPWZ1bmN0aW9uKCl7cmV0dXJuITF9O2V4cG9ydHMuaXNDb25jdXJyZW50TW9kZT1mdW5jdGlvbigpe3JldHVybiExfTtleHBvcnRzLmlzQ29udGV4dENvbnN1bWVyPWZ1bmN0aW9uKGEpe3JldHVybiB5KGEpPT09aH07ZXhwb3J0cy5pc0NvbnRleHRQcm92aWRlcj1mdW5jdGlvbihhKXtyZXR1cm4geShhKT09PWd9O2V4cG9ydHMuaXNFbGVtZW50PWZ1bmN0aW9uKGEpe3JldHVyblwib2JqZWN0XCI9PT10eXBlb2YgYSYmbnVsbCE9PWEmJmEuJCR0eXBlb2Y9PT1ifTtleHBvcnRzLmlzRm9yd2FyZFJlZj1mdW5jdGlvbihhKXtyZXR1cm4geShhKT09PWt9O2V4cG9ydHMuaXNGcmFnbWVudD1mdW5jdGlvbihhKXtyZXR1cm4geShhKT09PWR9O2V4cG9ydHMuaXNMYXp5PWZ1bmN0aW9uKGEpe3JldHVybiB5KGEpPT09cH07ZXhwb3J0cy5pc01lbW89ZnVuY3Rpb24oYSl7cmV0dXJuIHkoYSk9PT1ufTtcbmV4cG9ydHMuaXNQb3J0YWw9ZnVuY3Rpb24oYSl7cmV0dXJuIHkoYSk9PT1jfTtleHBvcnRzLmlzUHJvZmlsZXI9ZnVuY3Rpb24oYSl7cmV0dXJuIHkoYSk9PT1mfTtleHBvcnRzLmlzU3RyaWN0TW9kZT1mdW5jdGlvbihhKXtyZXR1cm4geShhKT09PWV9O2V4cG9ydHMuaXNTdXNwZW5zZT1mdW5jdGlvbihhKXtyZXR1cm4geShhKT09PWx9O2V4cG9ydHMuaXNWYWxpZEVsZW1lbnRUeXBlPWZ1bmN0aW9uKGEpe3JldHVyblwic3RyaW5nXCI9PT10eXBlb2YgYXx8XCJmdW5jdGlvblwiPT09dHlwZW9mIGF8fGE9PT1kfHxhPT09Znx8YT09PXZ8fGE9PT1lfHxhPT09bHx8YT09PW18fGE9PT13fHxcIm9iamVjdFwiPT09dHlwZW9mIGEmJm51bGwhPT1hJiYoYS4kJHR5cGVvZj09PXB8fGEuJCR0eXBlb2Y9PT1ufHxhLiQkdHlwZW9mPT09Z3x8YS4kJHR5cGVvZj09PWh8fGEuJCR0eXBlb2Y9PT1rfHxhLiQkdHlwZW9mPT09dXx8YS4kJHR5cGVvZj09PXF8fGFbMF09PT1yKT8hMDohMX07XG5leHBvcnRzLnR5cGVPZj15O1xuIiwiLyoqIEBsaWNlbnNlIFJlYWN0IHYxNy4wLjJcbiAqIHJlYWN0LWlzLmRldmVsb3BtZW50LmpzXG4gKlxuICogQ29weXJpZ2h0IChjKSBGYWNlYm9vaywgSW5jLiBhbmQgaXRzIGFmZmlsaWF0ZXMuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgTUlUIGxpY2Vuc2UgZm91bmQgaW4gdGhlXG4gKiBMSUNFTlNFIGZpbGUgaW4gdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG5pZiAocHJvY2Vzcy5lbnYuTk9ERV9FTlYgIT09IFwicHJvZHVjdGlvblwiKSB7XG4gIChmdW5jdGlvbigpIHtcbid1c2Ugc3RyaWN0JztcblxuLy8gQVRURU5USU9OXG4vLyBXaGVuIGFkZGluZyBuZXcgc3ltYm9scyB0byB0aGlzIGZpbGUsXG4vLyBQbGVhc2UgY29uc2lkZXIgYWxzbyBhZGRpbmcgdG8gJ3JlYWN0LWRldnRvb2xzLXNoYXJlZC9zcmMvYmFja2VuZC9SZWFjdFN5bWJvbHMnXG4vLyBUaGUgU3ltYm9sIHVzZWQgdG8gdGFnIHRoZSBSZWFjdEVsZW1lbnQtbGlrZSB0eXBlcy4gSWYgdGhlcmUgaXMgbm8gbmF0aXZlIFN5bWJvbFxuLy8gbm9yIHBvbHlmaWxsLCB0aGVuIGEgcGxhaW4gbnVtYmVyIGlzIHVzZWQgZm9yIHBlcmZvcm1hbmNlLlxudmFyIFJFQUNUX0VMRU1FTlRfVFlQRSA9IDB4ZWFjNztcbnZhciBSRUFDVF9QT1JUQUxfVFlQRSA9IDB4ZWFjYTtcbnZhciBSRUFDVF9GUkFHTUVOVF9UWVBFID0gMHhlYWNiO1xudmFyIFJFQUNUX1NUUklDVF9NT0RFX1RZUEUgPSAweGVhY2M7XG52YXIgUkVBQ1RfUFJPRklMRVJfVFlQRSA9IDB4ZWFkMjtcbnZhciBSRUFDVF9QUk9WSURFUl9UWVBFID0gMHhlYWNkO1xudmFyIFJFQUNUX0NPTlRFWFRfVFlQRSA9IDB4ZWFjZTtcbnZhciBSRUFDVF9GT1JXQVJEX1JFRl9UWVBFID0gMHhlYWQwO1xudmFyIFJFQUNUX1NVU1BFTlNFX1RZUEUgPSAweGVhZDE7XG52YXIgUkVBQ1RfU1VTUEVOU0VfTElTVF9UWVBFID0gMHhlYWQ4O1xudmFyIFJFQUNUX01FTU9fVFlQRSA9IDB4ZWFkMztcbnZhciBSRUFDVF9MQVpZX1RZUEUgPSAweGVhZDQ7XG52YXIgUkVBQ1RfQkxPQ0tfVFlQRSA9IDB4ZWFkOTtcbnZhciBSRUFDVF9TRVJWRVJfQkxPQ0tfVFlQRSA9IDB4ZWFkYTtcbnZhciBSRUFDVF9GVU5EQU1FTlRBTF9UWVBFID0gMHhlYWQ1O1xudmFyIFJFQUNUX1NDT1BFX1RZUEUgPSAweGVhZDc7XG52YXIgUkVBQ1RfT1BBUVVFX0lEX1RZUEUgPSAweGVhZTA7XG52YXIgUkVBQ1RfREVCVUdfVFJBQ0lOR19NT0RFX1RZUEUgPSAweGVhZTE7XG52YXIgUkVBQ1RfT0ZGU0NSRUVOX1RZUEUgPSAweGVhZTI7XG52YXIgUkVBQ1RfTEVHQUNZX0hJRERFTl9UWVBFID0gMHhlYWUzO1xuXG5pZiAodHlwZW9mIFN5bWJvbCA9PT0gJ2Z1bmN0aW9uJyAmJiBTeW1ib2wuZm9yKSB7XG4gIHZhciBzeW1ib2xGb3IgPSBTeW1ib2wuZm9yO1xuICBSRUFDVF9FTEVNRU5UX1RZUEUgPSBzeW1ib2xGb3IoJ3JlYWN0LmVsZW1lbnQnKTtcbiAgUkVBQ1RfUE9SVEFMX1RZUEUgPSBzeW1ib2xGb3IoJ3JlYWN0LnBvcnRhbCcpO1xuICBSRUFDVF9GUkFHTUVOVF9UWVBFID0gc3ltYm9sRm9yKCdyZWFjdC5mcmFnbWVudCcpO1xuICBSRUFDVF9TVFJJQ1RfTU9ERV9UWVBFID0gc3ltYm9sRm9yKCdyZWFjdC5zdHJpY3RfbW9kZScpO1xuICBSRUFDVF9QUk9GSUxFUl9UWVBFID0gc3ltYm9sRm9yKCdyZWFjdC5wcm9maWxlcicpO1xuICBSRUFDVF9QUk9WSURFUl9UWVBFID0gc3ltYm9sRm9yKCdyZWFjdC5wcm92aWRlcicpO1xuICBSRUFDVF9DT05URVhUX1RZUEUgPSBzeW1ib2xGb3IoJ3JlYWN0LmNvbnRleHQnKTtcbiAgUkVBQ1RfRk9SV0FSRF9SRUZfVFlQRSA9IHN5bWJvbEZvcigncmVhY3QuZm9yd2FyZF9yZWYnKTtcbiAgUkVBQ1RfU1VTUEVOU0VfVFlQRSA9IHN5bWJvbEZvcigncmVhY3Quc3VzcGVuc2UnKTtcbiAgUkVBQ1RfU1VTUEVOU0VfTElTVF9UWVBFID0gc3ltYm9sRm9yKCdyZWFjdC5zdXNwZW5zZV9saXN0Jyk7XG4gIFJFQUNUX01FTU9fVFlQRSA9IHN5bWJvbEZvcigncmVhY3QubWVtbycpO1xuICBSRUFDVF9MQVpZX1RZUEUgPSBzeW1ib2xGb3IoJ3JlYWN0LmxhenknKTtcbiAgUkVBQ1RfQkxPQ0tfVFlQRSA9IHN5bWJvbEZvcigncmVhY3QuYmxvY2snKTtcbiAgUkVBQ1RfU0VSVkVSX0JMT0NLX1RZUEUgPSBzeW1ib2xGb3IoJ3JlYWN0LnNlcnZlci5ibG9jaycpO1xuICBSRUFDVF9GVU5EQU1FTlRBTF9UWVBFID0gc3ltYm9sRm9yKCdyZWFjdC5mdW5kYW1lbnRhbCcpO1xuICBSRUFDVF9TQ09QRV9UWVBFID0gc3ltYm9sRm9yKCdyZWFjdC5zY29wZScpO1xuICBSRUFDVF9PUEFRVUVfSURfVFlQRSA9IHN5bWJvbEZvcigncmVhY3Qub3BhcXVlLmlkJyk7XG4gIFJFQUNUX0RFQlVHX1RSQUNJTkdfTU9ERV9UWVBFID0gc3ltYm9sRm9yKCdyZWFjdC5kZWJ1Z190cmFjZV9tb2RlJyk7XG4gIFJFQUNUX09GRlNDUkVFTl9UWVBFID0gc3ltYm9sRm9yKCdyZWFjdC5vZmZzY3JlZW4nKTtcbiAgUkVBQ1RfTEVHQUNZX0hJRERFTl9UWVBFID0gc3ltYm9sRm9yKCdyZWFjdC5sZWdhY3lfaGlkZGVuJyk7XG59XG5cbi8vIEZpbHRlciBjZXJ0YWluIERPTSBhdHRyaWJ1dGVzIChlLmcuIHNyYywgaHJlZikgaWYgdGhlaXIgdmFsdWVzIGFyZSBlbXB0eSBzdHJpbmdzLlxuXG52YXIgZW5hYmxlU2NvcGVBUEkgPSBmYWxzZTsgLy8gRXhwZXJpbWVudGFsIENyZWF0ZSBFdmVudCBIYW5kbGUgQVBJLlxuXG5mdW5jdGlvbiBpc1ZhbGlkRWxlbWVudFR5cGUodHlwZSkge1xuICBpZiAodHlwZW9mIHR5cGUgPT09ICdzdHJpbmcnIHx8IHR5cGVvZiB0eXBlID09PSAnZnVuY3Rpb24nKSB7XG4gICAgcmV0dXJuIHRydWU7XG4gIH0gLy8gTm90ZTogdHlwZW9mIG1pZ2h0IGJlIG90aGVyIHRoYW4gJ3N5bWJvbCcgb3IgJ251bWJlcicgKGUuZy4gaWYgaXQncyBhIHBvbHlmaWxsKS5cblxuXG4gIGlmICh0eXBlID09PSBSRUFDVF9GUkFHTUVOVF9UWVBFIHx8IHR5cGUgPT09IFJFQUNUX1BST0ZJTEVSX1RZUEUgfHwgdHlwZSA9PT0gUkVBQ1RfREVCVUdfVFJBQ0lOR19NT0RFX1RZUEUgfHwgdHlwZSA9PT0gUkVBQ1RfU1RSSUNUX01PREVfVFlQRSB8fCB0eXBlID09PSBSRUFDVF9TVVNQRU5TRV9UWVBFIHx8IHR5cGUgPT09IFJFQUNUX1NVU1BFTlNFX0xJU1RfVFlQRSB8fCB0eXBlID09PSBSRUFDVF9MRUdBQ1lfSElEREVOX1RZUEUgfHwgZW5hYmxlU2NvcGVBUEkgKSB7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICBpZiAodHlwZW9mIHR5cGUgPT09ICdvYmplY3QnICYmIHR5cGUgIT09IG51bGwpIHtcbiAgICBpZiAodHlwZS4kJHR5cGVvZiA9PT0gUkVBQ1RfTEFaWV9UWVBFIHx8IHR5cGUuJCR0eXBlb2YgPT09IFJFQUNUX01FTU9fVFlQRSB8fCB0eXBlLiQkdHlwZW9mID09PSBSRUFDVF9QUk9WSURFUl9UWVBFIHx8IHR5cGUuJCR0eXBlb2YgPT09IFJFQUNUX0NPTlRFWFRfVFlQRSB8fCB0eXBlLiQkdHlwZW9mID09PSBSRUFDVF9GT1JXQVJEX1JFRl9UWVBFIHx8IHR5cGUuJCR0eXBlb2YgPT09IFJFQUNUX0ZVTkRBTUVOVEFMX1RZUEUgfHwgdHlwZS4kJHR5cGVvZiA9PT0gUkVBQ1RfQkxPQ0tfVFlQRSB8fCB0eXBlWzBdID09PSBSRUFDVF9TRVJWRVJfQkxPQ0tfVFlQRSkge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGZhbHNlO1xufVxuXG5mdW5jdGlvbiB0eXBlT2Yob2JqZWN0KSB7XG4gIGlmICh0eXBlb2Ygb2JqZWN0ID09PSAnb2JqZWN0JyAmJiBvYmplY3QgIT09IG51bGwpIHtcbiAgICB2YXIgJCR0eXBlb2YgPSBvYmplY3QuJCR0eXBlb2Y7XG5cbiAgICBzd2l0Y2ggKCQkdHlwZW9mKSB7XG4gICAgICBjYXNlIFJFQUNUX0VMRU1FTlRfVFlQRTpcbiAgICAgICAgdmFyIHR5cGUgPSBvYmplY3QudHlwZTtcblxuICAgICAgICBzd2l0Y2ggKHR5cGUpIHtcbiAgICAgICAgICBjYXNlIFJFQUNUX0ZSQUdNRU5UX1RZUEU6XG4gICAgICAgICAgY2FzZSBSRUFDVF9QUk9GSUxFUl9UWVBFOlxuICAgICAgICAgIGNhc2UgUkVBQ1RfU1RSSUNUX01PREVfVFlQRTpcbiAgICAgICAgICBjYXNlIFJFQUNUX1NVU1BFTlNFX1RZUEU6XG4gICAgICAgICAgY2FzZSBSRUFDVF9TVVNQRU5TRV9MSVNUX1RZUEU6XG4gICAgICAgICAgICByZXR1cm4gdHlwZTtcblxuICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICB2YXIgJCR0eXBlb2ZUeXBlID0gdHlwZSAmJiB0eXBlLiQkdHlwZW9mO1xuXG4gICAgICAgICAgICBzd2l0Y2ggKCQkdHlwZW9mVHlwZSkge1xuICAgICAgICAgICAgICBjYXNlIFJFQUNUX0NPTlRFWFRfVFlQRTpcbiAgICAgICAgICAgICAgY2FzZSBSRUFDVF9GT1JXQVJEX1JFRl9UWVBFOlxuICAgICAgICAgICAgICBjYXNlIFJFQUNUX0xBWllfVFlQRTpcbiAgICAgICAgICAgICAgY2FzZSBSRUFDVF9NRU1PX1RZUEU6XG4gICAgICAgICAgICAgIGNhc2UgUkVBQ1RfUFJPVklERVJfVFlQRTpcbiAgICAgICAgICAgICAgICByZXR1cm4gJCR0eXBlb2ZUeXBlO1xuXG4gICAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgcmV0dXJuICQkdHlwZW9mO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgIH1cblxuICAgICAgY2FzZSBSRUFDVF9QT1JUQUxfVFlQRTpcbiAgICAgICAgcmV0dXJuICQkdHlwZW9mO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiB1bmRlZmluZWQ7XG59XG52YXIgQ29udGV4dENvbnN1bWVyID0gUkVBQ1RfQ09OVEVYVF9UWVBFO1xudmFyIENvbnRleHRQcm92aWRlciA9IFJFQUNUX1BST1ZJREVSX1RZUEU7XG52YXIgRWxlbWVudCA9IFJFQUNUX0VMRU1FTlRfVFlQRTtcbnZhciBGb3J3YXJkUmVmID0gUkVBQ1RfRk9SV0FSRF9SRUZfVFlQRTtcbnZhciBGcmFnbWVudCA9IFJFQUNUX0ZSQUdNRU5UX1RZUEU7XG52YXIgTGF6eSA9IFJFQUNUX0xBWllfVFlQRTtcbnZhciBNZW1vID0gUkVBQ1RfTUVNT19UWVBFO1xudmFyIFBvcnRhbCA9IFJFQUNUX1BPUlRBTF9UWVBFO1xudmFyIFByb2ZpbGVyID0gUkVBQ1RfUFJPRklMRVJfVFlQRTtcbnZhciBTdHJpY3RNb2RlID0gUkVBQ1RfU1RSSUNUX01PREVfVFlQRTtcbnZhciBTdXNwZW5zZSA9IFJFQUNUX1NVU1BFTlNFX1RZUEU7XG52YXIgaGFzV2FybmVkQWJvdXREZXByZWNhdGVkSXNBc3luY01vZGUgPSBmYWxzZTtcbnZhciBoYXNXYXJuZWRBYm91dERlcHJlY2F0ZWRJc0NvbmN1cnJlbnRNb2RlID0gZmFsc2U7IC8vIEFzeW5jTW9kZSBzaG91bGQgYmUgZGVwcmVjYXRlZFxuXG5mdW5jdGlvbiBpc0FzeW5jTW9kZShvYmplY3QpIHtcbiAge1xuICAgIGlmICghaGFzV2FybmVkQWJvdXREZXByZWNhdGVkSXNBc3luY01vZGUpIHtcbiAgICAgIGhhc1dhcm5lZEFib3V0RGVwcmVjYXRlZElzQXN5bmNNb2RlID0gdHJ1ZTsgLy8gVXNpbmcgY29uc29sZVsnd2FybiddIHRvIGV2YWRlIEJhYmVsIGFuZCBFU0xpbnRcblxuICAgICAgY29uc29sZVsnd2FybiddKCdUaGUgUmVhY3RJcy5pc0FzeW5jTW9kZSgpIGFsaWFzIGhhcyBiZWVuIGRlcHJlY2F0ZWQsICcgKyAnYW5kIHdpbGwgYmUgcmVtb3ZlZCBpbiBSZWFjdCAxOCsuJyk7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGZhbHNlO1xufVxuZnVuY3Rpb24gaXNDb25jdXJyZW50TW9kZShvYmplY3QpIHtcbiAge1xuICAgIGlmICghaGFzV2FybmVkQWJvdXREZXByZWNhdGVkSXNDb25jdXJyZW50TW9kZSkge1xuICAgICAgaGFzV2FybmVkQWJvdXREZXByZWNhdGVkSXNDb25jdXJyZW50TW9kZSA9IHRydWU7IC8vIFVzaW5nIGNvbnNvbGVbJ3dhcm4nXSB0byBldmFkZSBCYWJlbCBhbmQgRVNMaW50XG5cbiAgICAgIGNvbnNvbGVbJ3dhcm4nXSgnVGhlIFJlYWN0SXMuaXNDb25jdXJyZW50TW9kZSgpIGFsaWFzIGhhcyBiZWVuIGRlcHJlY2F0ZWQsICcgKyAnYW5kIHdpbGwgYmUgcmVtb3ZlZCBpbiBSZWFjdCAxOCsuJyk7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGZhbHNlO1xufVxuZnVuY3Rpb24gaXNDb250ZXh0Q29uc3VtZXIob2JqZWN0KSB7XG4gIHJldHVybiB0eXBlT2Yob2JqZWN0KSA9PT0gUkVBQ1RfQ09OVEVYVF9UWVBFO1xufVxuZnVuY3Rpb24gaXNDb250ZXh0UHJvdmlkZXIob2JqZWN0KSB7XG4gIHJldHVybiB0eXBlT2Yob2JqZWN0KSA9PT0gUkVBQ1RfUFJPVklERVJfVFlQRTtcbn1cbmZ1bmN0aW9uIGlzRWxlbWVudChvYmplY3QpIHtcbiAgcmV0dXJuIHR5cGVvZiBvYmplY3QgPT09ICdvYmplY3QnICYmIG9iamVjdCAhPT0gbnVsbCAmJiBvYmplY3QuJCR0eXBlb2YgPT09IFJFQUNUX0VMRU1FTlRfVFlQRTtcbn1cbmZ1bmN0aW9uIGlzRm9yd2FyZFJlZihvYmplY3QpIHtcbiAgcmV0dXJuIHR5cGVPZihvYmplY3QpID09PSBSRUFDVF9GT1JXQVJEX1JFRl9UWVBFO1xufVxuZnVuY3Rpb24gaXNGcmFnbWVudChvYmplY3QpIHtcbiAgcmV0dXJuIHR5cGVPZihvYmplY3QpID09PSBSRUFDVF9GUkFHTUVOVF9UWVBFO1xufVxuZnVuY3Rpb24gaXNMYXp5KG9iamVjdCkge1xuICByZXR1cm4gdHlwZU9mKG9iamVjdCkgPT09IFJFQUNUX0xBWllfVFlQRTtcbn1cbmZ1bmN0aW9uIGlzTWVtbyhvYmplY3QpIHtcbiAgcmV0dXJuIHR5cGVPZihvYmplY3QpID09PSBSRUFDVF9NRU1PX1RZUEU7XG59XG5mdW5jdGlvbiBpc1BvcnRhbChvYmplY3QpIHtcbiAgcmV0dXJuIHR5cGVPZihvYmplY3QpID09PSBSRUFDVF9QT1JUQUxfVFlQRTtcbn1cbmZ1bmN0aW9uIGlzUHJvZmlsZXIob2JqZWN0KSB7XG4gIHJldHVybiB0eXBlT2Yob2JqZWN0KSA9PT0gUkVBQ1RfUFJPRklMRVJfVFlQRTtcbn1cbmZ1bmN0aW9uIGlzU3RyaWN0TW9kZShvYmplY3QpIHtcbiAgcmV0dXJuIHR5cGVPZihvYmplY3QpID09PSBSRUFDVF9TVFJJQ1RfTU9ERV9UWVBFO1xufVxuZnVuY3Rpb24gaXNTdXNwZW5zZShvYmplY3QpIHtcbiAgcmV0dXJuIHR5cGVPZihvYmplY3QpID09PSBSRUFDVF9TVVNQRU5TRV9UWVBFO1xufVxuXG5leHBvcnRzLkNvbnRleHRDb25zdW1lciA9IENvbnRleHRDb25zdW1lcjtcbmV4cG9ydHMuQ29udGV4dFByb3ZpZGVyID0gQ29udGV4dFByb3ZpZGVyO1xuZXhwb3J0cy5FbGVtZW50ID0gRWxlbWVudDtcbmV4cG9ydHMuRm9yd2FyZFJlZiA9IEZvcndhcmRSZWY7XG5leHBvcnRzLkZyYWdtZW50ID0gRnJhZ21lbnQ7XG5leHBvcnRzLkxhenkgPSBMYXp5O1xuZXhwb3J0cy5NZW1vID0gTWVtbztcbmV4cG9ydHMuUG9ydGFsID0gUG9ydGFsO1xuZXhwb3J0cy5Qcm9maWxlciA9IFByb2ZpbGVyO1xuZXhwb3J0cy5TdHJpY3RNb2RlID0gU3RyaWN0TW9kZTtcbmV4cG9ydHMuU3VzcGVuc2UgPSBTdXNwZW5zZTtcbmV4cG9ydHMuaXNBc3luY01vZGUgPSBpc0FzeW5jTW9kZTtcbmV4cG9ydHMuaXNDb25jdXJyZW50TW9kZSA9IGlzQ29uY3VycmVudE1vZGU7XG5leHBvcnRzLmlzQ29udGV4dENvbnN1bWVyID0gaXNDb250ZXh0Q29uc3VtZXI7XG5leHBvcnRzLmlzQ29udGV4dFByb3ZpZGVyID0gaXNDb250ZXh0UHJvdmlkZXI7XG5leHBvcnRzLmlzRWxlbWVudCA9IGlzRWxlbWVudDtcbmV4cG9ydHMuaXNGb3J3YXJkUmVmID0gaXNGb3J3YXJkUmVmO1xuZXhwb3J0cy5pc0ZyYWdtZW50ID0gaXNGcmFnbWVudDtcbmV4cG9ydHMuaXNMYXp5ID0gaXNMYXp5O1xuZXhwb3J0cy5pc01lbW8gPSBpc01lbW87XG5leHBvcnRzLmlzUG9ydGFsID0gaXNQb3J0YWw7XG5leHBvcnRzLmlzUHJvZmlsZXIgPSBpc1Byb2ZpbGVyO1xuZXhwb3J0cy5pc1N0cmljdE1vZGUgPSBpc1N0cmljdE1vZGU7XG5leHBvcnRzLmlzU3VzcGVuc2UgPSBpc1N1c3BlbnNlO1xuZXhwb3J0cy5pc1ZhbGlkRWxlbWVudFR5cGUgPSBpc1ZhbGlkRWxlbWVudFR5cGU7XG5leHBvcnRzLnR5cGVPZiA9IHR5cGVPZjtcbiAgfSkoKTtcbn1cbiIsIid1c2Ugc3RyaWN0JztcblxuaWYgKHByb2Nlc3MuZW52Lk5PREVfRU5WID09PSAncHJvZHVjdGlvbicpIHtcbiAgbW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKCcuL2Nqcy9yZWFjdC1pcy5wcm9kdWN0aW9uLm1pbi5qcycpO1xufSBlbHNlIHtcbiAgbW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKCcuL2Nqcy9yZWFjdC1pcy5kZXZlbG9wbWVudC5qcycpO1xufVxuIiwiJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7XG4gIHZhbHVlOiB0cnVlXG59KTtcbmV4cG9ydHMudGVzdCA9IGV4cG9ydHMuc2VyaWFsaXplID0gZXhwb3J0cy5kZWZhdWx0ID0gdm9pZCAwO1xuXG52YXIgUmVhY3RJcyA9IF9pbnRlcm9wUmVxdWlyZVdpbGRjYXJkKHJlcXVpcmUoJ3JlYWN0LWlzJykpO1xuXG52YXIgX21hcmt1cCA9IHJlcXVpcmUoJy4vbGliL21hcmt1cCcpO1xuXG5mdW5jdGlvbiBfZ2V0UmVxdWlyZVdpbGRjYXJkQ2FjaGUobm9kZUludGVyb3ApIHtcbiAgaWYgKHR5cGVvZiBXZWFrTWFwICE9PSAnZnVuY3Rpb24nKSByZXR1cm4gbnVsbDtcbiAgdmFyIGNhY2hlQmFiZWxJbnRlcm9wID0gbmV3IFdlYWtNYXAoKTtcbiAgdmFyIGNhY2hlTm9kZUludGVyb3AgPSBuZXcgV2Vha01hcCgpO1xuICByZXR1cm4gKF9nZXRSZXF1aXJlV2lsZGNhcmRDYWNoZSA9IGZ1bmN0aW9uIChub2RlSW50ZXJvcCkge1xuICAgIHJldHVybiBub2RlSW50ZXJvcCA/IGNhY2hlTm9kZUludGVyb3AgOiBjYWNoZUJhYmVsSW50ZXJvcDtcbiAgfSkobm9kZUludGVyb3ApO1xufVxuXG5mdW5jdGlvbiBfaW50ZXJvcFJlcXVpcmVXaWxkY2FyZChvYmosIG5vZGVJbnRlcm9wKSB7XG4gIGlmICghbm9kZUludGVyb3AgJiYgb2JqICYmIG9iai5fX2VzTW9kdWxlKSB7XG4gICAgcmV0dXJuIG9iajtcbiAgfVxuICBpZiAob2JqID09PSBudWxsIHx8ICh0eXBlb2Ygb2JqICE9PSAnb2JqZWN0JyAmJiB0eXBlb2Ygb2JqICE9PSAnZnVuY3Rpb24nKSkge1xuICAgIHJldHVybiB7ZGVmYXVsdDogb2JqfTtcbiAgfVxuICB2YXIgY2FjaGUgPSBfZ2V0UmVxdWlyZVdpbGRjYXJkQ2FjaGUobm9kZUludGVyb3ApO1xuICBpZiAoY2FjaGUgJiYgY2FjaGUuaGFzKG9iaikpIHtcbiAgICByZXR1cm4gY2FjaGUuZ2V0KG9iaik7XG4gIH1cbiAgdmFyIG5ld09iaiA9IHt9O1xuICB2YXIgaGFzUHJvcGVydHlEZXNjcmlwdG9yID1cbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkgJiYgT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcjtcbiAgZm9yICh2YXIga2V5IGluIG9iaikge1xuICAgIGlmIChrZXkgIT09ICdkZWZhdWx0JyAmJiBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBrZXkpKSB7XG4gICAgICB2YXIgZGVzYyA9IGhhc1Byb3BlcnR5RGVzY3JpcHRvclxuICAgICAgICA/IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3Iob2JqLCBrZXkpXG4gICAgICAgIDogbnVsbDtcbiAgICAgIGlmIChkZXNjICYmIChkZXNjLmdldCB8fCBkZXNjLnNldCkpIHtcbiAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KG5ld09iaiwga2V5LCBkZXNjKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIG5ld09ialtrZXldID0gb2JqW2tleV07XG4gICAgICB9XG4gICAgfVxuICB9XG4gIG5ld09iai5kZWZhdWx0ID0gb2JqO1xuICBpZiAoY2FjaGUpIHtcbiAgICBjYWNoZS5zZXQob2JqLCBuZXdPYmopO1xuICB9XG4gIHJldHVybiBuZXdPYmo7XG59XG5cbi8qKlxuICogQ29weXJpZ2h0IChjKSBGYWNlYm9vaywgSW5jLiBhbmQgaXRzIGFmZmlsaWF0ZXMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgTUlUIGxpY2Vuc2UgZm91bmQgaW4gdGhlXG4gKiBMSUNFTlNFIGZpbGUgaW4gdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cbi8vIEdpdmVuIGVsZW1lbnQucHJvcHMuY2hpbGRyZW4sIG9yIHN1YnRyZWUgZHVyaW5nIHJlY3Vyc2l2ZSB0cmF2ZXJzYWwsXG4vLyByZXR1cm4gZmxhdHRlbmVkIGFycmF5IG9mIGNoaWxkcmVuLlxuY29uc3QgZ2V0Q2hpbGRyZW4gPSAoYXJnLCBjaGlsZHJlbiA9IFtdKSA9PiB7XG4gIGlmIChBcnJheS5pc0FycmF5KGFyZykpIHtcbiAgICBhcmcuZm9yRWFjaChpdGVtID0+IHtcbiAgICAgIGdldENoaWxkcmVuKGl0ZW0sIGNoaWxkcmVuKTtcbiAgICB9KTtcbiAgfSBlbHNlIGlmIChhcmcgIT0gbnVsbCAmJiBhcmcgIT09IGZhbHNlKSB7XG4gICAgY2hpbGRyZW4ucHVzaChhcmcpO1xuICB9XG5cbiAgcmV0dXJuIGNoaWxkcmVuO1xufTtcblxuY29uc3QgZ2V0VHlwZSA9IGVsZW1lbnQgPT4ge1xuICBjb25zdCB0eXBlID0gZWxlbWVudC50eXBlO1xuXG4gIGlmICh0eXBlb2YgdHlwZSA9PT0gJ3N0cmluZycpIHtcbiAgICByZXR1cm4gdHlwZTtcbiAgfVxuXG4gIGlmICh0eXBlb2YgdHlwZSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgIHJldHVybiB0eXBlLmRpc3BsYXlOYW1lIHx8IHR5cGUubmFtZSB8fCAnVW5rbm93bic7XG4gIH1cblxuICBpZiAoUmVhY3RJcy5pc0ZyYWdtZW50KGVsZW1lbnQpKSB7XG4gICAgcmV0dXJuICdSZWFjdC5GcmFnbWVudCc7XG4gIH1cblxuICBpZiAoUmVhY3RJcy5pc1N1c3BlbnNlKGVsZW1lbnQpKSB7XG4gICAgcmV0dXJuICdSZWFjdC5TdXNwZW5zZSc7XG4gIH1cblxuICBpZiAodHlwZW9mIHR5cGUgPT09ICdvYmplY3QnICYmIHR5cGUgIT09IG51bGwpIHtcbiAgICBpZiAoUmVhY3RJcy5pc0NvbnRleHRQcm92aWRlcihlbGVtZW50KSkge1xuICAgICAgcmV0dXJuICdDb250ZXh0LlByb3ZpZGVyJztcbiAgICB9XG5cbiAgICBpZiAoUmVhY3RJcy5pc0NvbnRleHRDb25zdW1lcihlbGVtZW50KSkge1xuICAgICAgcmV0dXJuICdDb250ZXh0LkNvbnN1bWVyJztcbiAgICB9XG5cbiAgICBpZiAoUmVhY3RJcy5pc0ZvcndhcmRSZWYoZWxlbWVudCkpIHtcbiAgICAgIGlmICh0eXBlLmRpc3BsYXlOYW1lKSB7XG4gICAgICAgIHJldHVybiB0eXBlLmRpc3BsYXlOYW1lO1xuICAgICAgfVxuXG4gICAgICBjb25zdCBmdW5jdGlvbk5hbWUgPSB0eXBlLnJlbmRlci5kaXNwbGF5TmFtZSB8fCB0eXBlLnJlbmRlci5uYW1lIHx8ICcnO1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uTmFtZSAhPT0gJydcbiAgICAgICAgPyAnRm9yd2FyZFJlZignICsgZnVuY3Rpb25OYW1lICsgJyknXG4gICAgICAgIDogJ0ZvcndhcmRSZWYnO1xuICAgIH1cblxuICAgIGlmIChSZWFjdElzLmlzTWVtbyhlbGVtZW50KSkge1xuICAgICAgY29uc3QgZnVuY3Rpb25OYW1lID1cbiAgICAgICAgdHlwZS5kaXNwbGF5TmFtZSB8fCB0eXBlLnR5cGUuZGlzcGxheU5hbWUgfHwgdHlwZS50eXBlLm5hbWUgfHwgJyc7XG4gICAgICByZXR1cm4gZnVuY3Rpb25OYW1lICE9PSAnJyA/ICdNZW1vKCcgKyBmdW5jdGlvbk5hbWUgKyAnKScgOiAnTWVtbyc7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuICdVTkRFRklORUQnO1xufTtcblxuY29uc3QgZ2V0UHJvcEtleXMgPSBlbGVtZW50ID0+IHtcbiAgY29uc3Qge3Byb3BzfSA9IGVsZW1lbnQ7XG4gIHJldHVybiBPYmplY3Qua2V5cyhwcm9wcylcbiAgICAuZmlsdGVyKGtleSA9PiBrZXkgIT09ICdjaGlsZHJlbicgJiYgcHJvcHNba2V5XSAhPT0gdW5kZWZpbmVkKVxuICAgIC5zb3J0KCk7XG59O1xuXG5jb25zdCBzZXJpYWxpemUgPSAoZWxlbWVudCwgY29uZmlnLCBpbmRlbnRhdGlvbiwgZGVwdGgsIHJlZnMsIHByaW50ZXIpID0+XG4gICsrZGVwdGggPiBjb25maWcubWF4RGVwdGhcbiAgICA/ICgwLCBfbWFya3VwLnByaW50RWxlbWVudEFzTGVhZikoZ2V0VHlwZShlbGVtZW50KSwgY29uZmlnKVxuICAgIDogKDAsIF9tYXJrdXAucHJpbnRFbGVtZW50KShcbiAgICAgICAgZ2V0VHlwZShlbGVtZW50KSxcbiAgICAgICAgKDAsIF9tYXJrdXAucHJpbnRQcm9wcykoXG4gICAgICAgICAgZ2V0UHJvcEtleXMoZWxlbWVudCksXG4gICAgICAgICAgZWxlbWVudC5wcm9wcyxcbiAgICAgICAgICBjb25maWcsXG4gICAgICAgICAgaW5kZW50YXRpb24gKyBjb25maWcuaW5kZW50LFxuICAgICAgICAgIGRlcHRoLFxuICAgICAgICAgIHJlZnMsXG4gICAgICAgICAgcHJpbnRlclxuICAgICAgICApLFxuICAgICAgICAoMCwgX21hcmt1cC5wcmludENoaWxkcmVuKShcbiAgICAgICAgICBnZXRDaGlsZHJlbihlbGVtZW50LnByb3BzLmNoaWxkcmVuKSxcbiAgICAgICAgICBjb25maWcsXG4gICAgICAgICAgaW5kZW50YXRpb24gKyBjb25maWcuaW5kZW50LFxuICAgICAgICAgIGRlcHRoLFxuICAgICAgICAgIHJlZnMsXG4gICAgICAgICAgcHJpbnRlclxuICAgICAgICApLFxuICAgICAgICBjb25maWcsXG4gICAgICAgIGluZGVudGF0aW9uXG4gICAgICApO1xuXG5leHBvcnRzLnNlcmlhbGl6ZSA9IHNlcmlhbGl6ZTtcblxuY29uc3QgdGVzdCA9IHZhbCA9PiB2YWwgIT0gbnVsbCAmJiBSZWFjdElzLmlzRWxlbWVudCh2YWwpO1xuXG5leHBvcnRzLnRlc3QgPSB0ZXN0O1xuY29uc3QgcGx1Z2luID0ge1xuICBzZXJpYWxpemUsXG4gIHRlc3Rcbn07XG52YXIgX2RlZmF1bHQgPSBwbHVnaW47XG5leHBvcnRzLmRlZmF1bHQgPSBfZGVmYXVsdDtcbiIsIid1c2Ugc3RyaWN0JztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywge1xuICB2YWx1ZTogdHJ1ZVxufSk7XG5leHBvcnRzLnRlc3QgPSBleHBvcnRzLnNlcmlhbGl6ZSA9IGV4cG9ydHMuZGVmYXVsdCA9IHZvaWQgMDtcblxudmFyIF9tYXJrdXAgPSByZXF1aXJlKCcuL2xpYi9tYXJrdXAnKTtcblxudmFyIGdsb2JhbCA9IChmdW5jdGlvbiAoKSB7XG4gIGlmICh0eXBlb2YgZ2xvYmFsVGhpcyAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICByZXR1cm4gZ2xvYmFsVGhpcztcbiAgfSBlbHNlIGlmICh0eXBlb2YgZ2xvYmFsICE9PSAndW5kZWZpbmVkJykge1xuICAgIHJldHVybiBnbG9iYWw7XG4gIH0gZWxzZSBpZiAodHlwZW9mIHNlbGYgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgcmV0dXJuIHNlbGY7XG4gIH0gZWxzZSBpZiAodHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICByZXR1cm4gd2luZG93O1xuICB9IGVsc2Uge1xuICAgIHJldHVybiBGdW5jdGlvbigncmV0dXJuIHRoaXMnKSgpO1xuICB9XG59KSgpO1xuXG52YXIgU3ltYm9sID0gZ2xvYmFsWydqZXN0LXN5bWJvbC1kby1ub3QtdG91Y2gnXSB8fCBnbG9iYWwuU3ltYm9sO1xuY29uc3QgdGVzdFN5bWJvbCA9XG4gIHR5cGVvZiBTeW1ib2wgPT09ICdmdW5jdGlvbicgJiYgU3ltYm9sLmZvclxuICAgID8gU3ltYm9sLmZvcigncmVhY3QudGVzdC5qc29uJylcbiAgICA6IDB4ZWE3MTM1NztcblxuY29uc3QgZ2V0UHJvcEtleXMgPSBvYmplY3QgPT4ge1xuICBjb25zdCB7cHJvcHN9ID0gb2JqZWN0O1xuICByZXR1cm4gcHJvcHNcbiAgICA/IE9iamVjdC5rZXlzKHByb3BzKVxuICAgICAgICAuZmlsdGVyKGtleSA9PiBwcm9wc1trZXldICE9PSB1bmRlZmluZWQpXG4gICAgICAgIC5zb3J0KClcbiAgICA6IFtdO1xufTtcblxuY29uc3Qgc2VyaWFsaXplID0gKG9iamVjdCwgY29uZmlnLCBpbmRlbnRhdGlvbiwgZGVwdGgsIHJlZnMsIHByaW50ZXIpID0+XG4gICsrZGVwdGggPiBjb25maWcubWF4RGVwdGhcbiAgICA/ICgwLCBfbWFya3VwLnByaW50RWxlbWVudEFzTGVhZikob2JqZWN0LnR5cGUsIGNvbmZpZylcbiAgICA6ICgwLCBfbWFya3VwLnByaW50RWxlbWVudCkoXG4gICAgICAgIG9iamVjdC50eXBlLFxuICAgICAgICBvYmplY3QucHJvcHNcbiAgICAgICAgICA/ICgwLCBfbWFya3VwLnByaW50UHJvcHMpKFxuICAgICAgICAgICAgICBnZXRQcm9wS2V5cyhvYmplY3QpLFxuICAgICAgICAgICAgICBvYmplY3QucHJvcHMsXG4gICAgICAgICAgICAgIGNvbmZpZyxcbiAgICAgICAgICAgICAgaW5kZW50YXRpb24gKyBjb25maWcuaW5kZW50LFxuICAgICAgICAgICAgICBkZXB0aCxcbiAgICAgICAgICAgICAgcmVmcyxcbiAgICAgICAgICAgICAgcHJpbnRlclxuICAgICAgICAgICAgKVxuICAgICAgICAgIDogJycsXG4gICAgICAgIG9iamVjdC5jaGlsZHJlblxuICAgICAgICAgID8gKDAsIF9tYXJrdXAucHJpbnRDaGlsZHJlbikoXG4gICAgICAgICAgICAgIG9iamVjdC5jaGlsZHJlbixcbiAgICAgICAgICAgICAgY29uZmlnLFxuICAgICAgICAgICAgICBpbmRlbnRhdGlvbiArIGNvbmZpZy5pbmRlbnQsXG4gICAgICAgICAgICAgIGRlcHRoLFxuICAgICAgICAgICAgICByZWZzLFxuICAgICAgICAgICAgICBwcmludGVyXG4gICAgICAgICAgICApXG4gICAgICAgICAgOiAnJyxcbiAgICAgICAgY29uZmlnLFxuICAgICAgICBpbmRlbnRhdGlvblxuICAgICAgKTtcblxuZXhwb3J0cy5zZXJpYWxpemUgPSBzZXJpYWxpemU7XG5cbmNvbnN0IHRlc3QgPSB2YWwgPT4gdmFsICYmIHZhbC4kJHR5cGVvZiA9PT0gdGVzdFN5bWJvbDtcblxuZXhwb3J0cy50ZXN0ID0gdGVzdDtcbmNvbnN0IHBsdWdpbiA9IHtcbiAgc2VyaWFsaXplLFxuICB0ZXN0XG59O1xudmFyIF9kZWZhdWx0ID0gcGx1Z2luO1xuZXhwb3J0cy5kZWZhdWx0ID0gX2RlZmF1bHQ7XG4iLCIndXNlIHN0cmljdCc7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHtcbiAgdmFsdWU6IHRydWVcbn0pO1xuZXhwb3J0cy5kZWZhdWx0ID0gZXhwb3J0cy5ERUZBVUxUX09QVElPTlMgPSB2b2lkIDA7XG5leHBvcnRzLmZvcm1hdCA9IGZvcm1hdDtcbmV4cG9ydHMucGx1Z2lucyA9IHZvaWQgMDtcblxudmFyIF9hbnNpU3R5bGVzID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChyZXF1aXJlKCdhbnNpLXN0eWxlcycpKTtcblxudmFyIF9jb2xsZWN0aW9ucyA9IHJlcXVpcmUoJy4vY29sbGVjdGlvbnMnKTtcblxudmFyIF9Bc3ltbWV0cmljTWF0Y2hlciA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQoXG4gIHJlcXVpcmUoJy4vcGx1Z2lucy9Bc3ltbWV0cmljTWF0Y2hlcicpXG4pO1xuXG52YXIgX0NvbnZlcnRBbnNpID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChyZXF1aXJlKCcuL3BsdWdpbnMvQ29udmVydEFuc2knKSk7XG5cbnZhciBfRE9NQ29sbGVjdGlvbiA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQocmVxdWlyZSgnLi9wbHVnaW5zL0RPTUNvbGxlY3Rpb24nKSk7XG5cbnZhciBfRE9NRWxlbWVudCA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQocmVxdWlyZSgnLi9wbHVnaW5zL0RPTUVsZW1lbnQnKSk7XG5cbnZhciBfSW1tdXRhYmxlID0gX2ludGVyb3BSZXF1aXJlRGVmYXVsdChyZXF1aXJlKCcuL3BsdWdpbnMvSW1tdXRhYmxlJykpO1xuXG52YXIgX1JlYWN0RWxlbWVudCA9IF9pbnRlcm9wUmVxdWlyZURlZmF1bHQocmVxdWlyZSgnLi9wbHVnaW5zL1JlYWN0RWxlbWVudCcpKTtcblxudmFyIF9SZWFjdFRlc3RDb21wb25lbnQgPSBfaW50ZXJvcFJlcXVpcmVEZWZhdWx0KFxuICByZXF1aXJlKCcuL3BsdWdpbnMvUmVhY3RUZXN0Q29tcG9uZW50Jylcbik7XG5cbmZ1bmN0aW9uIF9pbnRlcm9wUmVxdWlyZURlZmF1bHQob2JqKSB7XG4gIHJldHVybiBvYmogJiYgb2JqLl9fZXNNb2R1bGUgPyBvYmogOiB7ZGVmYXVsdDogb2JqfTtcbn1cblxuLyoqXG4gKiBDb3B5cmlnaHQgKGMpIEZhY2Vib29rLCBJbmMuIGFuZCBpdHMgYWZmaWxpYXRlcy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBNSVQgbGljZW5zZSBmb3VuZCBpbiB0aGVcbiAqIExJQ0VOU0UgZmlsZSBpbiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG4vKiBlc2xpbnQtZGlzYWJsZSBsb2NhbC9iYW4tdHlwZXMtZXZlbnR1YWxseSAqL1xuY29uc3QgdG9TdHJpbmcgPSBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nO1xuY29uc3QgdG9JU09TdHJpbmcgPSBEYXRlLnByb3RvdHlwZS50b0lTT1N0cmluZztcbmNvbnN0IGVycm9yVG9TdHJpbmcgPSBFcnJvci5wcm90b3R5cGUudG9TdHJpbmc7XG5jb25zdCByZWdFeHBUb1N0cmluZyA9IFJlZ0V4cC5wcm90b3R5cGUudG9TdHJpbmc7XG4vKipcbiAqIEV4cGxpY2l0bHkgY29tcGFyaW5nIHR5cGVvZiBjb25zdHJ1Y3RvciB0byBmdW5jdGlvbiBhdm9pZHMgdW5kZWZpbmVkIGFzIG5hbWVcbiAqIHdoZW4gbW9jayBpZGVudGl0eS1vYmotcHJveHkgcmV0dXJucyB0aGUga2V5IGFzIHRoZSB2YWx1ZSBmb3IgYW55IGtleS5cbiAqL1xuXG5jb25zdCBnZXRDb25zdHJ1Y3Rvck5hbWUgPSB2YWwgPT5cbiAgKHR5cGVvZiB2YWwuY29uc3RydWN0b3IgPT09ICdmdW5jdGlvbicgJiYgdmFsLmNvbnN0cnVjdG9yLm5hbWUpIHx8ICdPYmplY3QnO1xuLyogZ2xvYmFsIHdpbmRvdyAqL1xuXG4vKiogSXMgdmFsIGlzIGVxdWFsIHRvIGdsb2JhbCB3aW5kb3cgb2JqZWN0PyBXb3JrcyBldmVuIGlmIGl0IGRvZXMgbm90IGV4aXN0IDopICovXG5cbmNvbnN0IGlzV2luZG93ID0gdmFsID0+IHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnICYmIHZhbCA9PT0gd2luZG93O1xuXG5jb25zdCBTWU1CT0xfUkVHRVhQID0gL15TeW1ib2xcXCgoLiopXFwpKC4qKSQvO1xuY29uc3QgTkVXTElORV9SRUdFWFAgPSAvXFxuL2dpO1xuXG5jbGFzcyBQcmV0dHlGb3JtYXRQbHVnaW5FcnJvciBleHRlbmRzIEVycm9yIHtcbiAgY29uc3RydWN0b3IobWVzc2FnZSwgc3RhY2spIHtcbiAgICBzdXBlcihtZXNzYWdlKTtcbiAgICB0aGlzLnN0YWNrID0gc3RhY2s7XG4gICAgdGhpcy5uYW1lID0gdGhpcy5jb25zdHJ1Y3Rvci5uYW1lO1xuICB9XG59XG5cbmZ1bmN0aW9uIGlzVG9TdHJpbmdlZEFycmF5VHlwZSh0b1N0cmluZ2VkKSB7XG4gIHJldHVybiAoXG4gICAgdG9TdHJpbmdlZCA9PT0gJ1tvYmplY3QgQXJyYXldJyB8fFxuICAgIHRvU3RyaW5nZWQgPT09ICdbb2JqZWN0IEFycmF5QnVmZmVyXScgfHxcbiAgICB0b1N0cmluZ2VkID09PSAnW29iamVjdCBEYXRhVmlld10nIHx8XG4gICAgdG9TdHJpbmdlZCA9PT0gJ1tvYmplY3QgRmxvYXQzMkFycmF5XScgfHxcbiAgICB0b1N0cmluZ2VkID09PSAnW29iamVjdCBGbG9hdDY0QXJyYXldJyB8fFxuICAgIHRvU3RyaW5nZWQgPT09ICdbb2JqZWN0IEludDhBcnJheV0nIHx8XG4gICAgdG9TdHJpbmdlZCA9PT0gJ1tvYmplY3QgSW50MTZBcnJheV0nIHx8XG4gICAgdG9TdHJpbmdlZCA9PT0gJ1tvYmplY3QgSW50MzJBcnJheV0nIHx8XG4gICAgdG9TdHJpbmdlZCA9PT0gJ1tvYmplY3QgVWludDhBcnJheV0nIHx8XG4gICAgdG9TdHJpbmdlZCA9PT0gJ1tvYmplY3QgVWludDhDbGFtcGVkQXJyYXldJyB8fFxuICAgIHRvU3RyaW5nZWQgPT09ICdbb2JqZWN0IFVpbnQxNkFycmF5XScgfHxcbiAgICB0b1N0cmluZ2VkID09PSAnW29iamVjdCBVaW50MzJBcnJheV0nXG4gICk7XG59XG5cbmZ1bmN0aW9uIHByaW50TnVtYmVyKHZhbCkge1xuICByZXR1cm4gT2JqZWN0LmlzKHZhbCwgLTApID8gJy0wJyA6IFN0cmluZyh2YWwpO1xufVxuXG5mdW5jdGlvbiBwcmludEJpZ0ludCh2YWwpIHtcbiAgcmV0dXJuIFN0cmluZyhgJHt2YWx9bmApO1xufVxuXG5mdW5jdGlvbiBwcmludEZ1bmN0aW9uKHZhbCwgcHJpbnRGdW5jdGlvbk5hbWUpIHtcbiAgaWYgKCFwcmludEZ1bmN0aW9uTmFtZSkge1xuICAgIHJldHVybiAnW0Z1bmN0aW9uXSc7XG4gIH1cblxuICByZXR1cm4gJ1tGdW5jdGlvbiAnICsgKHZhbC5uYW1lIHx8ICdhbm9ueW1vdXMnKSArICddJztcbn1cblxuZnVuY3Rpb24gcHJpbnRTeW1ib2wodmFsKSB7XG4gIHJldHVybiBTdHJpbmcodmFsKS5yZXBsYWNlKFNZTUJPTF9SRUdFWFAsICdTeW1ib2woJDEpJyk7XG59XG5cbmZ1bmN0aW9uIHByaW50RXJyb3IodmFsKSB7XG4gIHJldHVybiAnWycgKyBlcnJvclRvU3RyaW5nLmNhbGwodmFsKSArICddJztcbn1cbi8qKlxuICogVGhlIGZpcnN0IHBvcnQgb2YgY2FsbCBmb3IgcHJpbnRpbmcgYW4gb2JqZWN0LCBoYW5kbGVzIG1vc3Qgb2YgdGhlXG4gKiBkYXRhLXR5cGVzIGluIEpTLlxuICovXG5cbmZ1bmN0aW9uIHByaW50QmFzaWNWYWx1ZSh2YWwsIHByaW50RnVuY3Rpb25OYW1lLCBlc2NhcGVSZWdleCwgZXNjYXBlU3RyaW5nKSB7XG4gIGlmICh2YWwgPT09IHRydWUgfHwgdmFsID09PSBmYWxzZSkge1xuICAgIHJldHVybiAnJyArIHZhbDtcbiAgfVxuXG4gIGlmICh2YWwgPT09IHVuZGVmaW5lZCkge1xuICAgIHJldHVybiAndW5kZWZpbmVkJztcbiAgfVxuXG4gIGlmICh2YWwgPT09IG51bGwpIHtcbiAgICByZXR1cm4gJ251bGwnO1xuICB9XG5cbiAgY29uc3QgdHlwZU9mID0gdHlwZW9mIHZhbDtcblxuICBpZiAodHlwZU9mID09PSAnbnVtYmVyJykge1xuICAgIHJldHVybiBwcmludE51bWJlcih2YWwpO1xuICB9XG5cbiAgaWYgKHR5cGVPZiA9PT0gJ2JpZ2ludCcpIHtcbiAgICByZXR1cm4gcHJpbnRCaWdJbnQodmFsKTtcbiAgfVxuXG4gIGlmICh0eXBlT2YgPT09ICdzdHJpbmcnKSB7XG4gICAgaWYgKGVzY2FwZVN0cmluZykge1xuICAgICAgcmV0dXJuICdcIicgKyB2YWwucmVwbGFjZSgvXCJ8XFxcXC9nLCAnXFxcXCQmJykgKyAnXCInO1xuICAgIH1cblxuICAgIHJldHVybiAnXCInICsgdmFsICsgJ1wiJztcbiAgfVxuXG4gIGlmICh0eXBlT2YgPT09ICdmdW5jdGlvbicpIHtcbiAgICByZXR1cm4gcHJpbnRGdW5jdGlvbih2YWwsIHByaW50RnVuY3Rpb25OYW1lKTtcbiAgfVxuXG4gIGlmICh0eXBlT2YgPT09ICdzeW1ib2wnKSB7XG4gICAgcmV0dXJuIHByaW50U3ltYm9sKHZhbCk7XG4gIH1cblxuICBjb25zdCB0b1N0cmluZ2VkID0gdG9TdHJpbmcuY2FsbCh2YWwpO1xuXG4gIGlmICh0b1N0cmluZ2VkID09PSAnW29iamVjdCBXZWFrTWFwXScpIHtcbiAgICByZXR1cm4gJ1dlYWtNYXAge30nO1xuICB9XG5cbiAgaWYgKHRvU3RyaW5nZWQgPT09ICdbb2JqZWN0IFdlYWtTZXRdJykge1xuICAgIHJldHVybiAnV2Vha1NldCB7fSc7XG4gIH1cblxuICBpZiAoXG4gICAgdG9TdHJpbmdlZCA9PT0gJ1tvYmplY3QgRnVuY3Rpb25dJyB8fFxuICAgIHRvU3RyaW5nZWQgPT09ICdbb2JqZWN0IEdlbmVyYXRvckZ1bmN0aW9uXSdcbiAgKSB7XG4gICAgcmV0dXJuIHByaW50RnVuY3Rpb24odmFsLCBwcmludEZ1bmN0aW9uTmFtZSk7XG4gIH1cblxuICBpZiAodG9TdHJpbmdlZCA9PT0gJ1tvYmplY3QgU3ltYm9sXScpIHtcbiAgICByZXR1cm4gcHJpbnRTeW1ib2wodmFsKTtcbiAgfVxuXG4gIGlmICh0b1N0cmluZ2VkID09PSAnW29iamVjdCBEYXRlXScpIHtcbiAgICByZXR1cm4gaXNOYU4oK3ZhbCkgPyAnRGF0ZSB7IE5hTiB9JyA6IHRvSVNPU3RyaW5nLmNhbGwodmFsKTtcbiAgfVxuXG4gIGlmICh0b1N0cmluZ2VkID09PSAnW29iamVjdCBFcnJvcl0nKSB7XG4gICAgcmV0dXJuIHByaW50RXJyb3IodmFsKTtcbiAgfVxuXG4gIGlmICh0b1N0cmluZ2VkID09PSAnW29iamVjdCBSZWdFeHBdJykge1xuICAgIGlmIChlc2NhcGVSZWdleCkge1xuICAgICAgLy8gaHR0cHM6Ly9naXRodWIuY29tL2JlbmphbWluZ3IvUmVnRXhwLmVzY2FwZS9ibG9iL21haW4vcG9seWZpbGwuanNcbiAgICAgIHJldHVybiByZWdFeHBUb1N0cmluZy5jYWxsKHZhbCkucmVwbGFjZSgvW1xcXFxeJCorPy4oKXxbXFxde31dL2csICdcXFxcJCYnKTtcbiAgICB9XG5cbiAgICByZXR1cm4gcmVnRXhwVG9TdHJpbmcuY2FsbCh2YWwpO1xuICB9XG5cbiAgaWYgKHZhbCBpbnN0YW5jZW9mIEVycm9yKSB7XG4gICAgcmV0dXJuIHByaW50RXJyb3IodmFsKTtcbiAgfVxuXG4gIHJldHVybiBudWxsO1xufVxuLyoqXG4gKiBIYW5kbGVzIG1vcmUgY29tcGxleCBvYmplY3RzICggc3VjaCBhcyBvYmplY3RzIHdpdGggY2lyY3VsYXIgcmVmZXJlbmNlcy5cbiAqIG1hcHMgYW5kIHNldHMgZXRjIClcbiAqL1xuXG5mdW5jdGlvbiBwcmludENvbXBsZXhWYWx1ZShcbiAgdmFsLFxuICBjb25maWcsXG4gIGluZGVudGF0aW9uLFxuICBkZXB0aCxcbiAgcmVmcyxcbiAgaGFzQ2FsbGVkVG9KU09OXG4pIHtcbiAgaWYgKHJlZnMuaW5kZXhPZih2YWwpICE9PSAtMSkge1xuICAgIHJldHVybiAnW0NpcmN1bGFyXSc7XG4gIH1cblxuICByZWZzID0gcmVmcy5zbGljZSgpO1xuICByZWZzLnB1c2godmFsKTtcbiAgY29uc3QgaGl0TWF4RGVwdGggPSArK2RlcHRoID4gY29uZmlnLm1heERlcHRoO1xuICBjb25zdCBtaW4gPSBjb25maWcubWluO1xuXG4gIGlmIChcbiAgICBjb25maWcuY2FsbFRvSlNPTiAmJlxuICAgICFoaXRNYXhEZXB0aCAmJlxuICAgIHZhbC50b0pTT04gJiZcbiAgICB0eXBlb2YgdmFsLnRvSlNPTiA9PT0gJ2Z1bmN0aW9uJyAmJlxuICAgICFoYXNDYWxsZWRUb0pTT05cbiAgKSB7XG4gICAgcmV0dXJuIHByaW50ZXIodmFsLnRvSlNPTigpLCBjb25maWcsIGluZGVudGF0aW9uLCBkZXB0aCwgcmVmcywgdHJ1ZSk7XG4gIH1cblxuICBjb25zdCB0b1N0cmluZ2VkID0gdG9TdHJpbmcuY2FsbCh2YWwpO1xuXG4gIGlmICh0b1N0cmluZ2VkID09PSAnW29iamVjdCBBcmd1bWVudHNdJykge1xuICAgIHJldHVybiBoaXRNYXhEZXB0aFxuICAgICAgPyAnW0FyZ3VtZW50c10nXG4gICAgICA6IChtaW4gPyAnJyA6ICdBcmd1bWVudHMgJykgK1xuICAgICAgICAgICdbJyArXG4gICAgICAgICAgKDAsIF9jb2xsZWN0aW9ucy5wcmludExpc3RJdGVtcykoXG4gICAgICAgICAgICB2YWwsXG4gICAgICAgICAgICBjb25maWcsXG4gICAgICAgICAgICBpbmRlbnRhdGlvbixcbiAgICAgICAgICAgIGRlcHRoLFxuICAgICAgICAgICAgcmVmcyxcbiAgICAgICAgICAgIHByaW50ZXJcbiAgICAgICAgICApICtcbiAgICAgICAgICAnXSc7XG4gIH1cblxuICBpZiAoaXNUb1N0cmluZ2VkQXJyYXlUeXBlKHRvU3RyaW5nZWQpKSB7XG4gICAgcmV0dXJuIGhpdE1heERlcHRoXG4gICAgICA/ICdbJyArIHZhbC5jb25zdHJ1Y3Rvci5uYW1lICsgJ10nXG4gICAgICA6IChtaW5cbiAgICAgICAgICA/ICcnXG4gICAgICAgICAgOiAhY29uZmlnLnByaW50QmFzaWNQcm90b3R5cGUgJiYgdmFsLmNvbnN0cnVjdG9yLm5hbWUgPT09ICdBcnJheSdcbiAgICAgICAgICA/ICcnXG4gICAgICAgICAgOiB2YWwuY29uc3RydWN0b3IubmFtZSArICcgJykgK1xuICAgICAgICAgICdbJyArXG4gICAgICAgICAgKDAsIF9jb2xsZWN0aW9ucy5wcmludExpc3RJdGVtcykoXG4gICAgICAgICAgICB2YWwsXG4gICAgICAgICAgICBjb25maWcsXG4gICAgICAgICAgICBpbmRlbnRhdGlvbixcbiAgICAgICAgICAgIGRlcHRoLFxuICAgICAgICAgICAgcmVmcyxcbiAgICAgICAgICAgIHByaW50ZXJcbiAgICAgICAgICApICtcbiAgICAgICAgICAnXSc7XG4gIH1cblxuICBpZiAodG9TdHJpbmdlZCA9PT0gJ1tvYmplY3QgTWFwXScpIHtcbiAgICByZXR1cm4gaGl0TWF4RGVwdGhcbiAgICAgID8gJ1tNYXBdJ1xuICAgICAgOiAnTWFwIHsnICtcbiAgICAgICAgICAoMCwgX2NvbGxlY3Rpb25zLnByaW50SXRlcmF0b3JFbnRyaWVzKShcbiAgICAgICAgICAgIHZhbC5lbnRyaWVzKCksXG4gICAgICAgICAgICBjb25maWcsXG4gICAgICAgICAgICBpbmRlbnRhdGlvbixcbiAgICAgICAgICAgIGRlcHRoLFxuICAgICAgICAgICAgcmVmcyxcbiAgICAgICAgICAgIHByaW50ZXIsXG4gICAgICAgICAgICAnID0+ICdcbiAgICAgICAgICApICtcbiAgICAgICAgICAnfSc7XG4gIH1cblxuICBpZiAodG9TdHJpbmdlZCA9PT0gJ1tvYmplY3QgU2V0XScpIHtcbiAgICByZXR1cm4gaGl0TWF4RGVwdGhcbiAgICAgID8gJ1tTZXRdJ1xuICAgICAgOiAnU2V0IHsnICtcbiAgICAgICAgICAoMCwgX2NvbGxlY3Rpb25zLnByaW50SXRlcmF0b3JWYWx1ZXMpKFxuICAgICAgICAgICAgdmFsLnZhbHVlcygpLFxuICAgICAgICAgICAgY29uZmlnLFxuICAgICAgICAgICAgaW5kZW50YXRpb24sXG4gICAgICAgICAgICBkZXB0aCxcbiAgICAgICAgICAgIHJlZnMsXG4gICAgICAgICAgICBwcmludGVyXG4gICAgICAgICAgKSArXG4gICAgICAgICAgJ30nO1xuICB9IC8vIEF2b2lkIGZhaWx1cmUgdG8gc2VyaWFsaXplIGdsb2JhbCB3aW5kb3cgb2JqZWN0IGluIGpzZG9tIHRlc3QgZW52aXJvbm1lbnQuXG4gIC8vIEZvciBleGFtcGxlLCBub3QgZXZlbiByZWxldmFudCBpZiB3aW5kb3cgaXMgcHJvcCBvZiBSZWFjdCBlbGVtZW50LlxuXG4gIHJldHVybiBoaXRNYXhEZXB0aCB8fCBpc1dpbmRvdyh2YWwpXG4gICAgPyAnWycgKyBnZXRDb25zdHJ1Y3Rvck5hbWUodmFsKSArICddJ1xuICAgIDogKG1pblxuICAgICAgICA/ICcnXG4gICAgICAgIDogIWNvbmZpZy5wcmludEJhc2ljUHJvdG90eXBlICYmIGdldENvbnN0cnVjdG9yTmFtZSh2YWwpID09PSAnT2JqZWN0J1xuICAgICAgICA/ICcnXG4gICAgICAgIDogZ2V0Q29uc3RydWN0b3JOYW1lKHZhbCkgKyAnICcpICtcbiAgICAgICAgJ3snICtcbiAgICAgICAgKDAsIF9jb2xsZWN0aW9ucy5wcmludE9iamVjdFByb3BlcnRpZXMpKFxuICAgICAgICAgIHZhbCxcbiAgICAgICAgICBjb25maWcsXG4gICAgICAgICAgaW5kZW50YXRpb24sXG4gICAgICAgICAgZGVwdGgsXG4gICAgICAgICAgcmVmcyxcbiAgICAgICAgICBwcmludGVyXG4gICAgICAgICkgK1xuICAgICAgICAnfSc7XG59XG5cbmZ1bmN0aW9uIGlzTmV3UGx1Z2luKHBsdWdpbikge1xuICByZXR1cm4gcGx1Z2luLnNlcmlhbGl6ZSAhPSBudWxsO1xufVxuXG5mdW5jdGlvbiBwcmludFBsdWdpbihwbHVnaW4sIHZhbCwgY29uZmlnLCBpbmRlbnRhdGlvbiwgZGVwdGgsIHJlZnMpIHtcbiAgbGV0IHByaW50ZWQ7XG5cbiAgdHJ5IHtcbiAgICBwcmludGVkID0gaXNOZXdQbHVnaW4ocGx1Z2luKVxuICAgICAgPyBwbHVnaW4uc2VyaWFsaXplKHZhbCwgY29uZmlnLCBpbmRlbnRhdGlvbiwgZGVwdGgsIHJlZnMsIHByaW50ZXIpXG4gICAgICA6IHBsdWdpbi5wcmludChcbiAgICAgICAgICB2YWwsXG4gICAgICAgICAgdmFsQ2hpbGQgPT4gcHJpbnRlcih2YWxDaGlsZCwgY29uZmlnLCBpbmRlbnRhdGlvbiwgZGVwdGgsIHJlZnMpLFxuICAgICAgICAgIHN0ciA9PiB7XG4gICAgICAgICAgICBjb25zdCBpbmRlbnRhdGlvbk5leHQgPSBpbmRlbnRhdGlvbiArIGNvbmZpZy5pbmRlbnQ7XG4gICAgICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgICBpbmRlbnRhdGlvbk5leHQgK1xuICAgICAgICAgICAgICBzdHIucmVwbGFjZShORVdMSU5FX1JFR0VYUCwgJ1xcbicgKyBpbmRlbnRhdGlvbk5leHQpXG4gICAgICAgICAgICApO1xuICAgICAgICAgIH0sXG4gICAgICAgICAge1xuICAgICAgICAgICAgZWRnZVNwYWNpbmc6IGNvbmZpZy5zcGFjaW5nT3V0ZXIsXG4gICAgICAgICAgICBtaW46IGNvbmZpZy5taW4sXG4gICAgICAgICAgICBzcGFjaW5nOiBjb25maWcuc3BhY2luZ0lubmVyXG4gICAgICAgICAgfSxcbiAgICAgICAgICBjb25maWcuY29sb3JzXG4gICAgICAgICk7XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgdGhyb3cgbmV3IFByZXR0eUZvcm1hdFBsdWdpbkVycm9yKGVycm9yLm1lc3NhZ2UsIGVycm9yLnN0YWNrKTtcbiAgfVxuXG4gIGlmICh0eXBlb2YgcHJpbnRlZCAhPT0gJ3N0cmluZycpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICBgcHJldHR5LWZvcm1hdDogUGx1Z2luIG11c3QgcmV0dXJuIHR5cGUgXCJzdHJpbmdcIiBidXQgaW5zdGVhZCByZXR1cm5lZCBcIiR7dHlwZW9mIHByaW50ZWR9XCIuYFxuICAgICk7XG4gIH1cblxuICByZXR1cm4gcHJpbnRlZDtcbn1cblxuZnVuY3Rpb24gZmluZFBsdWdpbihwbHVnaW5zLCB2YWwpIHtcbiAgZm9yIChsZXQgcCA9IDA7IHAgPCBwbHVnaW5zLmxlbmd0aDsgcCsrKSB7XG4gICAgdHJ5IHtcbiAgICAgIGlmIChwbHVnaW5zW3BdLnRlc3QodmFsKSkge1xuICAgICAgICByZXR1cm4gcGx1Z2luc1twXTtcbiAgICAgIH1cbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgdGhyb3cgbmV3IFByZXR0eUZvcm1hdFBsdWdpbkVycm9yKGVycm9yLm1lc3NhZ2UsIGVycm9yLnN0YWNrKTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gbnVsbDtcbn1cblxuZnVuY3Rpb24gcHJpbnRlcih2YWwsIGNvbmZpZywgaW5kZW50YXRpb24sIGRlcHRoLCByZWZzLCBoYXNDYWxsZWRUb0pTT04pIHtcbiAgY29uc3QgcGx1Z2luID0gZmluZFBsdWdpbihjb25maWcucGx1Z2lucywgdmFsKTtcblxuICBpZiAocGx1Z2luICE9PSBudWxsKSB7XG4gICAgcmV0dXJuIHByaW50UGx1Z2luKHBsdWdpbiwgdmFsLCBjb25maWcsIGluZGVudGF0aW9uLCBkZXB0aCwgcmVmcyk7XG4gIH1cblxuICBjb25zdCBiYXNpY1Jlc3VsdCA9IHByaW50QmFzaWNWYWx1ZShcbiAgICB2YWwsXG4gICAgY29uZmlnLnByaW50RnVuY3Rpb25OYW1lLFxuICAgIGNvbmZpZy5lc2NhcGVSZWdleCxcbiAgICBjb25maWcuZXNjYXBlU3RyaW5nXG4gICk7XG5cbiAgaWYgKGJhc2ljUmVzdWx0ICE9PSBudWxsKSB7XG4gICAgcmV0dXJuIGJhc2ljUmVzdWx0O1xuICB9XG5cbiAgcmV0dXJuIHByaW50Q29tcGxleFZhbHVlKFxuICAgIHZhbCxcbiAgICBjb25maWcsXG4gICAgaW5kZW50YXRpb24sXG4gICAgZGVwdGgsXG4gICAgcmVmcyxcbiAgICBoYXNDYWxsZWRUb0pTT05cbiAgKTtcbn1cblxuY29uc3QgREVGQVVMVF9USEVNRSA9IHtcbiAgY29tbWVudDogJ2dyYXknLFxuICBjb250ZW50OiAncmVzZXQnLFxuICBwcm9wOiAneWVsbG93JyxcbiAgdGFnOiAnY3lhbicsXG4gIHZhbHVlOiAnZ3JlZW4nXG59O1xuY29uc3QgREVGQVVMVF9USEVNRV9LRVlTID0gT2JqZWN0LmtleXMoREVGQVVMVF9USEVNRSk7XG5jb25zdCBERUZBVUxUX09QVElPTlMgPSB7XG4gIGNhbGxUb0pTT046IHRydWUsXG4gIGNvbXBhcmVLZXlzOiB1bmRlZmluZWQsXG4gIGVzY2FwZVJlZ2V4OiBmYWxzZSxcbiAgZXNjYXBlU3RyaW5nOiB0cnVlLFxuICBoaWdobGlnaHQ6IGZhbHNlLFxuICBpbmRlbnQ6IDIsXG4gIG1heERlcHRoOiBJbmZpbml0eSxcbiAgbWluOiBmYWxzZSxcbiAgcGx1Z2luczogW10sXG4gIHByaW50QmFzaWNQcm90b3R5cGU6IHRydWUsXG4gIHByaW50RnVuY3Rpb25OYW1lOiB0cnVlLFxuICB0aGVtZTogREVGQVVMVF9USEVNRVxufTtcbmV4cG9ydHMuREVGQVVMVF9PUFRJT05TID0gREVGQVVMVF9PUFRJT05TO1xuXG5mdW5jdGlvbiB2YWxpZGF0ZU9wdGlvbnMob3B0aW9ucykge1xuICBPYmplY3Qua2V5cyhvcHRpb25zKS5mb3JFYWNoKGtleSA9PiB7XG4gICAgaWYgKCFERUZBVUxUX09QVElPTlMuaGFzT3duUHJvcGVydHkoa2V5KSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBwcmV0dHktZm9ybWF0OiBVbmtub3duIG9wdGlvbiBcIiR7a2V5fVwiLmApO1xuICAgIH1cbiAgfSk7XG5cbiAgaWYgKG9wdGlvbnMubWluICYmIG9wdGlvbnMuaW5kZW50ICE9PSB1bmRlZmluZWQgJiYgb3B0aW9ucy5pbmRlbnQgIT09IDApIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAncHJldHR5LWZvcm1hdDogT3B0aW9ucyBcIm1pblwiIGFuZCBcImluZGVudFwiIGNhbm5vdCBiZSB1c2VkIHRvZ2V0aGVyLidcbiAgICApO1xuICB9XG5cbiAgaWYgKG9wdGlvbnMudGhlbWUgIT09IHVuZGVmaW5lZCkge1xuICAgIGlmIChvcHRpb25zLnRoZW1lID09PSBudWxsKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYHByZXR0eS1mb3JtYXQ6IE9wdGlvbiBcInRoZW1lXCIgbXVzdCBub3QgYmUgbnVsbC5gKTtcbiAgICB9XG5cbiAgICBpZiAodHlwZW9mIG9wdGlvbnMudGhlbWUgIT09ICdvYmplY3QnKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgIGBwcmV0dHktZm9ybWF0OiBPcHRpb24gXCJ0aGVtZVwiIG11c3QgYmUgb2YgdHlwZSBcIm9iamVjdFwiIGJ1dCBpbnN0ZWFkIHJlY2VpdmVkIFwiJHt0eXBlb2Ygb3B0aW9ucy50aGVtZX1cIi5gXG4gICAgICApO1xuICAgIH1cbiAgfVxufVxuXG5jb25zdCBnZXRDb2xvcnNIaWdobGlnaHQgPSBvcHRpb25zID0+XG4gIERFRkFVTFRfVEhFTUVfS0VZUy5yZWR1Y2UoKGNvbG9ycywga2V5KSA9PiB7XG4gICAgY29uc3QgdmFsdWUgPVxuICAgICAgb3B0aW9ucy50aGVtZSAmJiBvcHRpb25zLnRoZW1lW2tleV0gIT09IHVuZGVmaW5lZFxuICAgICAgICA/IG9wdGlvbnMudGhlbWVba2V5XVxuICAgICAgICA6IERFRkFVTFRfVEhFTUVba2V5XTtcbiAgICBjb25zdCBjb2xvciA9IHZhbHVlICYmIF9hbnNpU3R5bGVzLmRlZmF1bHRbdmFsdWVdO1xuXG4gICAgaWYgKFxuICAgICAgY29sb3IgJiZcbiAgICAgIHR5cGVvZiBjb2xvci5jbG9zZSA9PT0gJ3N0cmluZycgJiZcbiAgICAgIHR5cGVvZiBjb2xvci5vcGVuID09PSAnc3RyaW5nJ1xuICAgICkge1xuICAgICAgY29sb3JzW2tleV0gPSBjb2xvcjtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICBgcHJldHR5LWZvcm1hdDogT3B0aW9uIFwidGhlbWVcIiBoYXMgYSBrZXkgXCIke2tleX1cIiB3aG9zZSB2YWx1ZSBcIiR7dmFsdWV9XCIgaXMgdW5kZWZpbmVkIGluIGFuc2ktc3R5bGVzLmBcbiAgICAgICk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGNvbG9ycztcbiAgfSwgT2JqZWN0LmNyZWF0ZShudWxsKSk7XG5cbmNvbnN0IGdldENvbG9yc0VtcHR5ID0gKCkgPT5cbiAgREVGQVVMVF9USEVNRV9LRVlTLnJlZHVjZSgoY29sb3JzLCBrZXkpID0+IHtcbiAgICBjb2xvcnNba2V5XSA9IHtcbiAgICAgIGNsb3NlOiAnJyxcbiAgICAgIG9wZW46ICcnXG4gICAgfTtcbiAgICByZXR1cm4gY29sb3JzO1xuICB9LCBPYmplY3QuY3JlYXRlKG51bGwpKTtcblxuY29uc3QgZ2V0UHJpbnRGdW5jdGlvbk5hbWUgPSBvcHRpb25zID0+XG4gIG9wdGlvbnMgJiYgb3B0aW9ucy5wcmludEZ1bmN0aW9uTmFtZSAhPT0gdW5kZWZpbmVkXG4gICAgPyBvcHRpb25zLnByaW50RnVuY3Rpb25OYW1lXG4gICAgOiBERUZBVUxUX09QVElPTlMucHJpbnRGdW5jdGlvbk5hbWU7XG5cbmNvbnN0IGdldEVzY2FwZVJlZ2V4ID0gb3B0aW9ucyA9PlxuICBvcHRpb25zICYmIG9wdGlvbnMuZXNjYXBlUmVnZXggIT09IHVuZGVmaW5lZFxuICAgID8gb3B0aW9ucy5lc2NhcGVSZWdleFxuICAgIDogREVGQVVMVF9PUFRJT05TLmVzY2FwZVJlZ2V4O1xuXG5jb25zdCBnZXRFc2NhcGVTdHJpbmcgPSBvcHRpb25zID0+XG4gIG9wdGlvbnMgJiYgb3B0aW9ucy5lc2NhcGVTdHJpbmcgIT09IHVuZGVmaW5lZFxuICAgID8gb3B0aW9ucy5lc2NhcGVTdHJpbmdcbiAgICA6IERFRkFVTFRfT1BUSU9OUy5lc2NhcGVTdHJpbmc7XG5cbmNvbnN0IGdldENvbmZpZyA9IG9wdGlvbnMgPT4ge1xuICB2YXIgX29wdGlvbnMkcHJpbnRCYXNpY1ByO1xuXG4gIHJldHVybiB7XG4gICAgY2FsbFRvSlNPTjpcbiAgICAgIG9wdGlvbnMgJiYgb3B0aW9ucy5jYWxsVG9KU09OICE9PSB1bmRlZmluZWRcbiAgICAgICAgPyBvcHRpb25zLmNhbGxUb0pTT05cbiAgICAgICAgOiBERUZBVUxUX09QVElPTlMuY2FsbFRvSlNPTixcbiAgICBjb2xvcnM6XG4gICAgICBvcHRpb25zICYmIG9wdGlvbnMuaGlnaGxpZ2h0XG4gICAgICAgID8gZ2V0Q29sb3JzSGlnaGxpZ2h0KG9wdGlvbnMpXG4gICAgICAgIDogZ2V0Q29sb3JzRW1wdHkoKSxcbiAgICBjb21wYXJlS2V5czpcbiAgICAgIG9wdGlvbnMgJiYgdHlwZW9mIG9wdGlvbnMuY29tcGFyZUtleXMgPT09ICdmdW5jdGlvbidcbiAgICAgICAgPyBvcHRpb25zLmNvbXBhcmVLZXlzXG4gICAgICAgIDogREVGQVVMVF9PUFRJT05TLmNvbXBhcmVLZXlzLFxuICAgIGVzY2FwZVJlZ2V4OiBnZXRFc2NhcGVSZWdleChvcHRpb25zKSxcbiAgICBlc2NhcGVTdHJpbmc6IGdldEVzY2FwZVN0cmluZyhvcHRpb25zKSxcbiAgICBpbmRlbnQ6XG4gICAgICBvcHRpb25zICYmIG9wdGlvbnMubWluXG4gICAgICAgID8gJydcbiAgICAgICAgOiBjcmVhdGVJbmRlbnQoXG4gICAgICAgICAgICBvcHRpb25zICYmIG9wdGlvbnMuaW5kZW50ICE9PSB1bmRlZmluZWRcbiAgICAgICAgICAgICAgPyBvcHRpb25zLmluZGVudFxuICAgICAgICAgICAgICA6IERFRkFVTFRfT1BUSU9OUy5pbmRlbnRcbiAgICAgICAgICApLFxuICAgIG1heERlcHRoOlxuICAgICAgb3B0aW9ucyAmJiBvcHRpb25zLm1heERlcHRoICE9PSB1bmRlZmluZWRcbiAgICAgICAgPyBvcHRpb25zLm1heERlcHRoXG4gICAgICAgIDogREVGQVVMVF9PUFRJT05TLm1heERlcHRoLFxuICAgIG1pbjpcbiAgICAgIG9wdGlvbnMgJiYgb3B0aW9ucy5taW4gIT09IHVuZGVmaW5lZCA/IG9wdGlvbnMubWluIDogREVGQVVMVF9PUFRJT05TLm1pbixcbiAgICBwbHVnaW5zOlxuICAgICAgb3B0aW9ucyAmJiBvcHRpb25zLnBsdWdpbnMgIT09IHVuZGVmaW5lZFxuICAgICAgICA/IG9wdGlvbnMucGx1Z2luc1xuICAgICAgICA6IERFRkFVTFRfT1BUSU9OUy5wbHVnaW5zLFxuICAgIHByaW50QmFzaWNQcm90b3R5cGU6XG4gICAgICAoX29wdGlvbnMkcHJpbnRCYXNpY1ByID1cbiAgICAgICAgb3B0aW9ucyA9PT0gbnVsbCB8fCBvcHRpb25zID09PSB2b2lkIDBcbiAgICAgICAgICA/IHZvaWQgMFxuICAgICAgICAgIDogb3B0aW9ucy5wcmludEJhc2ljUHJvdG90eXBlKSAhPT0gbnVsbCAmJlxuICAgICAgX29wdGlvbnMkcHJpbnRCYXNpY1ByICE9PSB2b2lkIDBcbiAgICAgICAgPyBfb3B0aW9ucyRwcmludEJhc2ljUHJcbiAgICAgICAgOiB0cnVlLFxuICAgIHByaW50RnVuY3Rpb25OYW1lOiBnZXRQcmludEZ1bmN0aW9uTmFtZShvcHRpb25zKSxcbiAgICBzcGFjaW5nSW5uZXI6IG9wdGlvbnMgJiYgb3B0aW9ucy5taW4gPyAnICcgOiAnXFxuJyxcbiAgICBzcGFjaW5nT3V0ZXI6IG9wdGlvbnMgJiYgb3B0aW9ucy5taW4gPyAnJyA6ICdcXG4nXG4gIH07XG59O1xuXG5mdW5jdGlvbiBjcmVhdGVJbmRlbnQoaW5kZW50KSB7XG4gIHJldHVybiBuZXcgQXJyYXkoaW5kZW50ICsgMSkuam9pbignICcpO1xufVxuLyoqXG4gKiBSZXR1cm5zIGEgcHJlc2VudGF0aW9uIHN0cmluZyBvZiB5b3VyIGB2YWxgIG9iamVjdFxuICogQHBhcmFtIHZhbCBhbnkgcG90ZW50aWFsIEphdmFTY3JpcHQgb2JqZWN0XG4gKiBAcGFyYW0gb3B0aW9ucyBDdXN0b20gc2V0dGluZ3NcbiAqL1xuXG5mdW5jdGlvbiBmb3JtYXQodmFsLCBvcHRpb25zKSB7XG4gIGlmIChvcHRpb25zKSB7XG4gICAgdmFsaWRhdGVPcHRpb25zKG9wdGlvbnMpO1xuXG4gICAgaWYgKG9wdGlvbnMucGx1Z2lucykge1xuICAgICAgY29uc3QgcGx1Z2luID0gZmluZFBsdWdpbihvcHRpb25zLnBsdWdpbnMsIHZhbCk7XG5cbiAgICAgIGlmIChwbHVnaW4gIT09IG51bGwpIHtcbiAgICAgICAgcmV0dXJuIHByaW50UGx1Z2luKHBsdWdpbiwgdmFsLCBnZXRDb25maWcob3B0aW9ucyksICcnLCAwLCBbXSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgY29uc3QgYmFzaWNSZXN1bHQgPSBwcmludEJhc2ljVmFsdWUoXG4gICAgdmFsLFxuICAgIGdldFByaW50RnVuY3Rpb25OYW1lKG9wdGlvbnMpLFxuICAgIGdldEVzY2FwZVJlZ2V4KG9wdGlvbnMpLFxuICAgIGdldEVzY2FwZVN0cmluZyhvcHRpb25zKVxuICApO1xuXG4gIGlmIChiYXNpY1Jlc3VsdCAhPT0gbnVsbCkge1xuICAgIHJldHVybiBiYXNpY1Jlc3VsdDtcbiAgfVxuXG4gIHJldHVybiBwcmludENvbXBsZXhWYWx1ZSh2YWwsIGdldENvbmZpZyhvcHRpb25zKSwgJycsIDAsIFtdKTtcbn1cblxuY29uc3QgcGx1Z2lucyA9IHtcbiAgQXN5bW1ldHJpY01hdGNoZXI6IF9Bc3ltbWV0cmljTWF0Y2hlci5kZWZhdWx0LFxuICBDb252ZXJ0QW5zaTogX0NvbnZlcnRBbnNpLmRlZmF1bHQsXG4gIERPTUNvbGxlY3Rpb246IF9ET01Db2xsZWN0aW9uLmRlZmF1bHQsXG4gIERPTUVsZW1lbnQ6IF9ET01FbGVtZW50LmRlZmF1bHQsXG4gIEltbXV0YWJsZTogX0ltbXV0YWJsZS5kZWZhdWx0LFxuICBSZWFjdEVsZW1lbnQ6IF9SZWFjdEVsZW1lbnQuZGVmYXVsdCxcbiAgUmVhY3RUZXN0Q29tcG9uZW50OiBfUmVhY3RUZXN0Q29tcG9uZW50LmRlZmF1bHRcbn07XG5leHBvcnRzLnBsdWdpbnMgPSBwbHVnaW5zO1xudmFyIF9kZWZhdWx0ID0gZm9ybWF0O1xuZXhwb3J0cy5kZWZhdWx0ID0gX2RlZmF1bHQ7XG4iLCIvKipcbiAqIENvcHlyaWdodCAoYykgRmFjZWJvb2ssIEluYy4gYW5kIGl0cyBhZmZpbGlhdGVzLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIE1JVCBsaWNlbnNlIGZvdW5kIGluIHRoZVxuICogTElDRU5TRSBmaWxlIGluIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB0eXBlIHtcbiAgUGx1Z2luIGFzIFByZXR0eUZvcm1hdFBsdWdpbixcbiAgUGx1Z2lucyBhcyBQcmV0dHlGb3JtYXRQbHVnaW5zLFxufSBmcm9tICdwcmV0dHktZm9ybWF0J1xuaW1wb3J0IHtcbiAgcGx1Z2lucyBhcyBwcmV0dHlGb3JtYXRQbHVnaW5zLFxufSBmcm9tICdwcmV0dHktZm9ybWF0J1xuXG5jb25zdCB7XG4gIERPTUNvbGxlY3Rpb24sXG4gIERPTUVsZW1lbnQsXG4gIEltbXV0YWJsZSxcbiAgUmVhY3RFbGVtZW50LFxuICBSZWFjdFRlc3RDb21wb25lbnQsXG4gIEFzeW1tZXRyaWNNYXRjaGVyLFxufSA9IHByZXR0eUZvcm1hdFBsdWdpbnNcblxubGV0IFBMVUdJTlM6IFByZXR0eUZvcm1hdFBsdWdpbnMgPSBbXG4gIFJlYWN0VGVzdENvbXBvbmVudCxcbiAgUmVhY3RFbGVtZW50LFxuICBET01FbGVtZW50LFxuICBET01Db2xsZWN0aW9uLFxuICBJbW11dGFibGUsXG4gIEFzeW1tZXRyaWNNYXRjaGVyLFxuICAvLyBUT0RPOiB3cml0ZSBzaW5vbiBtb2NrIHNlcmlhbGl6ZXJcbiAgLy8gaHR0cHM6Ly9naXRodWIuY29tL2ZhY2Vib29rL2plc3QvYmxvYi80ZWI0ZjZhNTliNmVhZTBlMDViOGU1MWRkOGNkM2ZkY2ExYzdhZmYxL3BhY2thZ2VzL2plc3Qtc25hcHNob3Qvc3JjL21vY2tTZXJpYWxpemVyLnRzI0w0XG5dXG5cbi8vIFRPRE86IGV4cG9zZSB0aGVzZSBhbmQgYWxsb3cgdXNlciB0byBhZGQgY3VzdG9tIHNlcmlhbGl6ZXJzXG4vLyBQcmVwZW5kIHRvIGxpc3Qgc28gdGhlIGxhc3QgYWRkZWQgaXMgdGhlIGZpcnN0IHRlc3RlZC5cbmV4cG9ydCBjb25zdCBhZGRTZXJpYWxpemVyID0gKHBsdWdpbjogUHJldHR5Rm9ybWF0UGx1Z2luKTogdm9pZCA9PiB7XG4gIFBMVUdJTlMgPSBbcGx1Z2luXS5jb25jYXQoUExVR0lOUylcbn1cblxuZXhwb3J0IGNvbnN0IGdldFNlcmlhbGl6ZXJzID0gKCk6IFByZXR0eUZvcm1hdFBsdWdpbnMgPT4gUExVR0lOU1xuIiwiLypcbkNvcHlyaWdodCAoYykgMjAwOC0yMDE2IFBpdm90YWwgTGFic1xuXG5QZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmdcbmEgY29weSBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZVxuXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbCBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nXG53aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0cyB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsXG5kaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbCBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG9cbnBlcm1pdCBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0b1xudGhlIGZvbGxvd2luZyBjb25kaXRpb25zOlxuXG5UaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZVxuaW5jbHVkZWQgaW4gYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG5cblRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsXG5FWFBSRVNTIE9SIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0Zcbk1FUkNIQU5UQUJJTElUWSwgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EXG5OT05JTkZSSU5HRU1FTlQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRSBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFXG5MSUFCTEUgRk9SIEFOWSBDTEFJTSwgREFNQUdFUyBPUiBPVEhFUiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OXG5PRiBDT05UUkFDVCwgVE9SVCBPUiBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSwgT1VUIE9GIE9SIElOIENPTk5FQ1RJT05cbldJVEggVEhFIFNPRlRXQVJFIE9SIFRIRSBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU4gVEhFIFNPRlRXQVJFLlxuXG4qL1xuXG5pbXBvcnQgeyBpc09iamVjdCB9IGZyb20gJy4uLy4uL3V0aWxzJ1xuaW1wb3J0IHR5cGUgeyBUZXN0ZXIgfSBmcm9tICcuL3R5cGVzJ1xuXG4vLyBFeHRyYWN0ZWQgb3V0IG9mIGphc21pbmUgMi41LjJcbmV4cG9ydCBmdW5jdGlvbiBlcXVhbHMoXG4gIGE6IHVua25vd24sXG4gIGI6IHVua25vd24sXG4gIGN1c3RvbVRlc3RlcnM/OiBBcnJheTxUZXN0ZXI+LFxuICBzdHJpY3RDaGVjaz86IGJvb2xlYW4sXG4pOiBib29sZWFuIHtcbiAgY3VzdG9tVGVzdGVycyA9IGN1c3RvbVRlc3RlcnMgfHwgW11cbiAgcmV0dXJuIGVxKGEsIGIsIFtdLCBbXSwgY3VzdG9tVGVzdGVycywgc3RyaWN0Q2hlY2sgPyBoYXNLZXkgOiBoYXNEZWZpbmVkS2V5KVxufVxuXG5jb25zdCBmdW5jdGlvblRvU3RyaW5nID0gRnVuY3Rpb24ucHJvdG90eXBlLnRvU3RyaW5nXG5cbmV4cG9ydCBmdW5jdGlvbiBpc0FzeW1tZXRyaWMob2JqOiBhbnkpIHtcbiAgcmV0dXJuICEhb2JqICYmIGlzQSgnRnVuY3Rpb24nLCBvYmouYXN5bW1ldHJpY01hdGNoKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gaGFzQXN5bW1ldHJpYyhvYmo6IGFueSwgc2VlbiA9IG5ldyBTZXQoKSk6IGJvb2xlYW4ge1xuICBpZiAoc2Vlbi5oYXMob2JqKSlcbiAgICByZXR1cm4gZmFsc2VcbiAgc2Vlbi5hZGQob2JqKVxuICBpZiAoaXNBc3ltbWV0cmljKG9iaikpXG4gICAgcmV0dXJuIHRydWVcbiAgaWYgKEFycmF5LmlzQXJyYXkob2JqKSlcbiAgICByZXR1cm4gb2JqLnNvbWUoaSA9PiBoYXNBc3ltbWV0cmljKGksIHNlZW4pKVxuICBpZiAob2JqIGluc3RhbmNlb2YgU2V0KVxuICAgIHJldHVybiBBcnJheS5mcm9tKG9iaikuc29tZShpID0+IGhhc0FzeW1tZXRyaWMoaSwgc2VlbikpXG4gIGlmIChpc09iamVjdChvYmopKVxuICAgIHJldHVybiBPYmplY3QudmFsdWVzKG9iaikuc29tZSh2ID0+IGhhc0FzeW1tZXRyaWModiwgc2VlbikpXG4gIHJldHVybiBmYWxzZVxufVxuXG5mdW5jdGlvbiBhc3ltbWV0cmljTWF0Y2goYTogYW55LCBiOiBhbnkpIHtcbiAgY29uc3QgYXN5bW1ldHJpY0EgPSBpc0FzeW1tZXRyaWMoYSlcbiAgY29uc3QgYXN5bW1ldHJpY0IgPSBpc0FzeW1tZXRyaWMoYilcblxuICBpZiAoYXN5bW1ldHJpY0EgJiYgYXN5bW1ldHJpY0IpXG4gICAgcmV0dXJuIHVuZGVmaW5lZFxuXG4gIGlmIChhc3ltbWV0cmljQSlcbiAgICByZXR1cm4gYS5hc3ltbWV0cmljTWF0Y2goYilcblxuICBpZiAoYXN5bW1ldHJpY0IpXG4gICAgcmV0dXJuIGIuYXN5bW1ldHJpY01hdGNoKGEpXG59XG5cbi8vIEVxdWFsaXR5IGZ1bmN0aW9uIGxvdmluZ2x5IGFkYXB0ZWQgZnJvbSBpc0VxdWFsIGluXG4vLyAgIFtVbmRlcnNjb3JlXShodHRwOi8vdW5kZXJzY29yZWpzLm9yZylcbmZ1bmN0aW9uIGVxKFxuICBhOiBhbnksXG4gIGI6IGFueSxcbiAgYVN0YWNrOiBBcnJheTx1bmtub3duPixcbiAgYlN0YWNrOiBBcnJheTx1bmtub3duPixcbiAgY3VzdG9tVGVzdGVyczogQXJyYXk8VGVzdGVyPixcbiAgaGFzS2V5OiBhbnksXG4pOiBib29sZWFuIHtcbiAgbGV0IHJlc3VsdCA9IHRydWVcblxuICBjb25zdCBhc3ltbWV0cmljUmVzdWx0ID0gYXN5bW1ldHJpY01hdGNoKGEsIGIpXG4gIGlmIChhc3ltbWV0cmljUmVzdWx0ICE9PSB1bmRlZmluZWQpXG4gICAgcmV0dXJuIGFzeW1tZXRyaWNSZXN1bHRcblxuICBmb3IgKGxldCBpID0gMDsgaSA8IGN1c3RvbVRlc3RlcnMubGVuZ3RoOyBpKyspIHtcbiAgICBjb25zdCBjdXN0b21UZXN0ZXJSZXN1bHQgPSBjdXN0b21UZXN0ZXJzW2ldKGEsIGIpXG4gICAgaWYgKGN1c3RvbVRlc3RlclJlc3VsdCAhPT0gdW5kZWZpbmVkKVxuICAgICAgcmV0dXJuIGN1c3RvbVRlc3RlclJlc3VsdFxuICB9XG5cbiAgaWYgKGEgaW5zdGFuY2VvZiBFcnJvciAmJiBiIGluc3RhbmNlb2YgRXJyb3IpXG4gICAgcmV0dXJuIGEubWVzc2FnZSA9PT0gYi5tZXNzYWdlXG5cbiAgaWYgKE9iamVjdC5pcyhhLCBiKSlcbiAgICByZXR1cm4gdHJ1ZVxuXG4gIC8vIEEgc3RyaWN0IGNvbXBhcmlzb24gaXMgbmVjZXNzYXJ5IGJlY2F1c2UgYG51bGwgPT0gdW5kZWZpbmVkYC5cbiAgaWYgKGEgPT09IG51bGwgfHwgYiA9PT0gbnVsbClcbiAgICByZXR1cm4gYSA9PT0gYlxuXG4gIGNvbnN0IGNsYXNzTmFtZSA9IE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChhKVxuICBpZiAoY2xhc3NOYW1lICE9PSBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwoYikpXG4gICAgcmV0dXJuIGZhbHNlXG5cbiAgc3dpdGNoIChjbGFzc05hbWUpIHtcbiAgICBjYXNlICdbb2JqZWN0IEJvb2xlYW5dJzpcbiAgICBjYXNlICdbb2JqZWN0IFN0cmluZ10nOlxuICAgIGNhc2UgJ1tvYmplY3QgTnVtYmVyXSc6XG4gICAgICBpZiAodHlwZW9mIGEgIT09IHR5cGVvZiBiKSB7XG4gICAgICAgIC8vIE9uZSBpcyBhIHByaW1pdGl2ZSwgb25lIGEgYG5ldyBQcmltaXRpdmUoKWBcbiAgICAgICAgcmV0dXJuIGZhbHNlXG4gICAgICB9XG4gICAgICBlbHNlIGlmICh0eXBlb2YgYSAhPT0gJ29iamVjdCcgJiYgdHlwZW9mIGIgIT09ICdvYmplY3QnKSB7XG4gICAgICAgIC8vIGJvdGggYXJlIHByb3BlciBwcmltaXRpdmVzXG4gICAgICAgIHJldHVybiBPYmplY3QuaXMoYSwgYilcbiAgICAgIH1cbiAgICAgIGVsc2Uge1xuICAgICAgICAvLyBib3RoIGFyZSBgbmV3IFByaW1pdGl2ZSgpYHNcbiAgICAgICAgcmV0dXJuIE9iamVjdC5pcyhhLnZhbHVlT2YoKSwgYi52YWx1ZU9mKCkpXG4gICAgICB9XG4gICAgY2FzZSAnW29iamVjdCBEYXRlXSc6XG4gICAgICAvLyBDb2VyY2UgZGF0ZXMgdG8gbnVtZXJpYyBwcmltaXRpdmUgdmFsdWVzLiBEYXRlcyBhcmUgY29tcGFyZWQgYnkgdGhlaXJcbiAgICAgIC8vIG1pbGxpc2Vjb25kIHJlcHJlc2VudGF0aW9ucy4gTm90ZSB0aGF0IGludmFsaWQgZGF0ZXMgd2l0aCBtaWxsaXNlY29uZCByZXByZXNlbnRhdGlvbnNcbiAgICAgIC8vIG9mIGBOYU5gIGFyZSBub3QgZXF1aXZhbGVudC5cbiAgICAgIHJldHVybiArYSA9PT0gK2JcbiAgICAvLyBSZWdFeHBzIGFyZSBjb21wYXJlZCBieSB0aGVpciBzb3VyY2UgcGF0dGVybnMgYW5kIGZsYWdzLlxuICAgIGNhc2UgJ1tvYmplY3QgUmVnRXhwXSc6XG4gICAgICByZXR1cm4gYS5zb3VyY2UgPT09IGIuc291cmNlICYmIGEuZmxhZ3MgPT09IGIuZmxhZ3NcbiAgfVxuICBpZiAodHlwZW9mIGEgIT09ICdvYmplY3QnIHx8IHR5cGVvZiBiICE9PSAnb2JqZWN0JylcbiAgICByZXR1cm4gZmFsc2VcblxuICAvLyBVc2UgRE9NMyBtZXRob2QgaXNFcXVhbE5vZGUgKElFPj05KVxuICBpZiAoaXNEb21Ob2RlKGEpICYmIGlzRG9tTm9kZShiKSlcbiAgICByZXR1cm4gYS5pc0VxdWFsTm9kZShiKVxuXG4gIC8vIFVzZWQgdG8gZGV0ZWN0IGNpcmN1bGFyIHJlZmVyZW5jZXMuXG4gIGxldCBsZW5ndGggPSBhU3RhY2subGVuZ3RoXG4gIHdoaWxlIChsZW5ndGgtLSkge1xuICAgIC8vIExpbmVhciBzZWFyY2guIFBlcmZvcm1hbmNlIGlzIGludmVyc2VseSBwcm9wb3J0aW9uYWwgdG8gdGhlIG51bWJlciBvZlxuICAgIC8vIHVuaXF1ZSBuZXN0ZWQgc3RydWN0dXJlcy5cbiAgICAvLyBjaXJjdWxhciByZWZlcmVuY2VzIGF0IHNhbWUgZGVwdGggYXJlIGVxdWFsXG4gICAgLy8gY2lyY3VsYXIgcmVmZXJlbmNlIGlzIG5vdCBlcXVhbCB0byBub24tY2lyY3VsYXIgb25lXG4gICAgaWYgKGFTdGFja1tsZW5ndGhdID09PSBhKVxuICAgICAgcmV0dXJuIGJTdGFja1tsZW5ndGhdID09PSBiXG5cbiAgICBlbHNlIGlmIChiU3RhY2tbbGVuZ3RoXSA9PT0gYilcbiAgICAgIHJldHVybiBmYWxzZVxuICB9XG4gIC8vIEFkZCB0aGUgZmlyc3Qgb2JqZWN0IHRvIHRoZSBzdGFjayBvZiB0cmF2ZXJzZWQgb2JqZWN0cy5cbiAgYVN0YWNrLnB1c2goYSlcbiAgYlN0YWNrLnB1c2goYilcbiAgLy8gUmVjdXJzaXZlbHkgY29tcGFyZSBvYmplY3RzIGFuZCBhcnJheXMuXG4gIC8vIENvbXBhcmUgYXJyYXkgbGVuZ3RocyB0byBkZXRlcm1pbmUgaWYgYSBkZWVwIGNvbXBhcmlzb24gaXMgbmVjZXNzYXJ5LlxuICBpZiAoY2xhc3NOYW1lID09PSAnW29iamVjdCBBcnJheV0nICYmIGEubGVuZ3RoICE9PSBiLmxlbmd0aClcbiAgICByZXR1cm4gZmFsc2VcblxuICAvLyBEZWVwIGNvbXBhcmUgb2JqZWN0cy5cbiAgY29uc3QgYUtleXMgPSBrZXlzKGEsIGhhc0tleSlcbiAgbGV0IGtleVxuICBsZXQgc2l6ZSA9IGFLZXlzLmxlbmd0aFxuXG4gIC8vIEVuc3VyZSB0aGF0IGJvdGggb2JqZWN0cyBjb250YWluIHRoZSBzYW1lIG51bWJlciBvZiBwcm9wZXJ0aWVzIGJlZm9yZSBjb21wYXJpbmcgZGVlcCBlcXVhbGl0eS5cbiAgaWYgKGtleXMoYiwgaGFzS2V5KS5sZW5ndGggIT09IHNpemUpXG4gICAgcmV0dXJuIGZhbHNlXG5cbiAgd2hpbGUgKHNpemUtLSkge1xuICAgIGtleSA9IGFLZXlzW3NpemVdXG5cbiAgICAvLyBEZWVwIGNvbXBhcmUgZWFjaCBtZW1iZXJcbiAgICByZXN1bHRcbiAgICAgID0gaGFzS2V5KGIsIGtleSlcbiAgICAgICYmIGVxKGFba2V5XSwgYltrZXldLCBhU3RhY2ssIGJTdGFjaywgY3VzdG9tVGVzdGVycywgaGFzS2V5KVxuXG4gICAgaWYgKCFyZXN1bHQpXG4gICAgICByZXR1cm4gZmFsc2VcbiAgfVxuICAvLyBSZW1vdmUgdGhlIGZpcnN0IG9iamVjdCBmcm9tIHRoZSBzdGFjayBvZiB0cmF2ZXJzZWQgb2JqZWN0cy5cbiAgYVN0YWNrLnBvcCgpXG4gIGJTdGFjay5wb3AoKVxuXG4gIHJldHVybiByZXN1bHRcbn1cblxuZnVuY3Rpb24ga2V5cyhvYmo6IG9iamVjdCwgaGFzS2V5OiAob2JqOiBvYmplY3QsIGtleTogc3RyaW5nKSA9PiBib29sZWFuKSB7XG4gIGNvbnN0IGtleXMgPSBbXVxuICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tcmVzdHJpY3RlZC1zeW50YXhcbiAgZm9yIChjb25zdCBrZXkgaW4gb2JqKSB7XG4gICAgaWYgKGhhc0tleShvYmosIGtleSkpXG4gICAgICBrZXlzLnB1c2goa2V5KVxuICB9XG4gIHJldHVybiBrZXlzLmNvbmNhdChcbiAgICAoT2JqZWN0LmdldE93blByb3BlcnR5U3ltYm9scyhvYmopIGFzIEFycmF5PGFueT4pLmZpbHRlcihcbiAgICAgIHN5bWJvbCA9PlxuICAgICAgICAoT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihvYmosIHN5bWJvbCkgYXMgUHJvcGVydHlEZXNjcmlwdG9yKVxuICAgICAgICAgIC5lbnVtZXJhYmxlLFxuICAgICksXG4gIClcbn1cblxuZnVuY3Rpb24gaGFzRGVmaW5lZEtleShvYmo6IGFueSwga2V5OiBzdHJpbmcpIHtcbiAgcmV0dXJuIGhhc0tleShvYmosIGtleSkgJiYgb2JqW2tleV0gIT09IHVuZGVmaW5lZFxufVxuXG5mdW5jdGlvbiBoYXNLZXkob2JqOiBhbnksIGtleTogc3RyaW5nKSB7XG4gIHJldHVybiBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBrZXkpXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc0EodHlwZU5hbWU6IHN0cmluZywgdmFsdWU6IHVua25vd24pIHtcbiAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuYXBwbHkodmFsdWUpID09PSBgW29iamVjdCAke3R5cGVOYW1lfV1gXG59XG5cbmZ1bmN0aW9uIGlzRG9tTm9kZShvYmo6IGFueSk6IGJvb2xlYW4ge1xuICByZXR1cm4gKFxuICAgIG9iaiAhPT0gbnVsbFxuICAgICYmIHR5cGVvZiBvYmogPT09ICdvYmplY3QnXG4gICAgJiYgdHlwZW9mIG9iai5ub2RlVHlwZSA9PT0gJ251bWJlcidcbiAgICAmJiB0eXBlb2Ygb2JqLm5vZGVOYW1lID09PSAnc3RyaW5nJ1xuICAgICYmIHR5cGVvZiBvYmouaXNFcXVhbE5vZGUgPT09ICdmdW5jdGlvbidcbiAgKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gZm5OYW1lRm9yKGZ1bmM6IEZ1bmN0aW9uKSB7XG4gIGlmIChmdW5jLm5hbWUpXG4gICAgcmV0dXJuIGZ1bmMubmFtZVxuXG4gIGNvbnN0IG1hdGNoZXMgPSBmdW5jdGlvblRvU3RyaW5nXG4gICAgLmNhbGwoZnVuYylcbiAgICAubWF0Y2goL14oPzphc3luYyk/XFxzKmZ1bmN0aW9uXFxzKlxcKj9cXHMqKFtcXHckXSspXFxzKlxcKC8pXG4gIHJldHVybiBtYXRjaGVzID8gbWF0Y2hlc1sxXSA6ICc8YW5vbnltb3VzPidcbn1cblxuZnVuY3Rpb24gZ2V0UHJvdG90eXBlKG9iajogb2JqZWN0KSB7XG4gIGlmIChPYmplY3QuZ2V0UHJvdG90eXBlT2YpXG4gICAgcmV0dXJuIE9iamVjdC5nZXRQcm90b3R5cGVPZihvYmopXG5cbiAgaWYgKG9iai5jb25zdHJ1Y3Rvci5wcm90b3R5cGUgPT09IG9iailcbiAgICByZXR1cm4gbnVsbFxuXG4gIHJldHVybiBvYmouY29uc3RydWN0b3IucHJvdG90eXBlXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBoYXNQcm9wZXJ0eShvYmo6IG9iamVjdCB8IG51bGwsIHByb3BlcnR5OiBzdHJpbmcpOiBib29sZWFuIHtcbiAgaWYgKCFvYmopXG4gICAgcmV0dXJuIGZhbHNlXG5cbiAgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmosIHByb3BlcnR5KSlcbiAgICByZXR1cm4gdHJ1ZVxuXG4gIHJldHVybiBoYXNQcm9wZXJ0eShnZXRQcm90b3R5cGUob2JqKSwgcHJvcGVydHkpXG59XG5cbi8vIFNFTlRJTkVMIGNvbnN0YW50cyBhcmUgZnJvbSBodHRwczovL2dpdGh1Yi5jb20vZmFjZWJvb2svaW1tdXRhYmxlLWpzXG5jb25zdCBJU19LRVlFRF9TRU5USU5FTCA9ICdAQF9fSU1NVVRBQkxFX0tFWUVEX19AQCdcbmNvbnN0IElTX1NFVF9TRU5USU5FTCA9ICdAQF9fSU1NVVRBQkxFX1NFVF9fQEAnXG5jb25zdCBJU19PUkRFUkVEX1NFTlRJTkVMID0gJ0BAX19JTU1VVEFCTEVfT1JERVJFRF9fQEAnXG5cbmV4cG9ydCBmdW5jdGlvbiBpc0ltbXV0YWJsZVVub3JkZXJlZEtleWVkKG1heWJlS2V5ZWQ6IGFueSkge1xuICByZXR1cm4gISEoXG4gICAgbWF5YmVLZXllZFxuICAgICYmIG1heWJlS2V5ZWRbSVNfS0VZRURfU0VOVElORUxdXG4gICAgJiYgIW1heWJlS2V5ZWRbSVNfT1JERVJFRF9TRU5USU5FTF1cbiAgKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNJbW11dGFibGVVbm9yZGVyZWRTZXQobWF5YmVTZXQ6IGFueSkge1xuICByZXR1cm4gISEoXG4gICAgbWF5YmVTZXRcbiAgICAmJiBtYXliZVNldFtJU19TRVRfU0VOVElORUxdXG4gICAgJiYgIW1heWJlU2V0W0lTX09SREVSRURfU0VOVElORUxdXG4gIClcbn1cblxuLyoqXG4gKiBDb3B5cmlnaHQgKGMpIEZhY2Vib29rLCBJbmMuIGFuZCBpdHMgYWZmaWxpYXRlcy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBNSVQgbGljZW5zZSBmb3VuZCBpbiB0aGVcbiAqIExJQ0VOU0UgZmlsZSBpbiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqXG4gKi9cbmNvbnN0IEl0ZXJhdG9yU3ltYm9sID0gU3ltYm9sLml0ZXJhdG9yXG5cbmNvbnN0IGhhc0l0ZXJhdG9yID0gKG9iamVjdDogYW55KSA9PlxuICAhIShvYmplY3QgIT0gbnVsbCAmJiBvYmplY3RbSXRlcmF0b3JTeW1ib2xdKVxuXG5leHBvcnQgY29uc3QgaXRlcmFibGVFcXVhbGl0eSA9IChcbiAgYTogYW55LFxuICBiOiBhbnksXG4gIGFTdGFjazogQXJyYXk8YW55PiA9IFtdLFxuICBiU3RhY2s6IEFycmF5PGFueT4gPSBbXSxcbik6IGJvb2xlYW4gfCB1bmRlZmluZWQgPT4ge1xuICBpZiAoXG4gICAgdHlwZW9mIGEgIT09ICdvYmplY3QnXG4gICAgfHwgdHlwZW9mIGIgIT09ICdvYmplY3QnXG4gICAgfHwgQXJyYXkuaXNBcnJheShhKVxuICAgIHx8IEFycmF5LmlzQXJyYXkoYilcbiAgICB8fCAhaGFzSXRlcmF0b3IoYSlcbiAgICB8fCAhaGFzSXRlcmF0b3IoYilcbiAgKVxuICAgIHJldHVybiB1bmRlZmluZWRcblxuICBpZiAoYS5jb25zdHJ1Y3RvciAhPT0gYi5jb25zdHJ1Y3RvcilcbiAgICByZXR1cm4gZmFsc2VcblxuICBsZXQgbGVuZ3RoID0gYVN0YWNrLmxlbmd0aFxuICB3aGlsZSAobGVuZ3RoLS0pIHtcbiAgICAvLyBMaW5lYXIgc2VhcmNoLiBQZXJmb3JtYW5jZSBpcyBpbnZlcnNlbHkgcHJvcG9ydGlvbmFsIHRvIHRoZSBudW1iZXIgb2ZcbiAgICAvLyB1bmlxdWUgbmVzdGVkIHN0cnVjdHVyZXMuXG4gICAgLy8gY2lyY3VsYXIgcmVmZXJlbmNlcyBhdCBzYW1lIGRlcHRoIGFyZSBlcXVhbFxuICAgIC8vIGNpcmN1bGFyIHJlZmVyZW5jZSBpcyBub3QgZXF1YWwgdG8gbm9uLWNpcmN1bGFyIG9uZVxuICAgIGlmIChhU3RhY2tbbGVuZ3RoXSA9PT0gYSlcbiAgICAgIHJldHVybiBiU3RhY2tbbGVuZ3RoXSA9PT0gYlxuICB9XG4gIGFTdGFjay5wdXNoKGEpXG4gIGJTdGFjay5wdXNoKGIpXG5cbiAgY29uc3QgaXRlcmFibGVFcXVhbGl0eVdpdGhTdGFjayA9IChhOiBhbnksIGI6IGFueSkgPT5cbiAgICBpdGVyYWJsZUVxdWFsaXR5KGEsIGIsIFsuLi5hU3RhY2tdLCBbLi4uYlN0YWNrXSlcblxuICBpZiAoYS5zaXplICE9PSB1bmRlZmluZWQpIHtcbiAgICBpZiAoYS5zaXplICE9PSBiLnNpemUpIHtcbiAgICAgIHJldHVybiBmYWxzZVxuICAgIH1cbiAgICBlbHNlIGlmIChpc0EoJ1NldCcsIGEpIHx8IGlzSW1tdXRhYmxlVW5vcmRlcmVkU2V0KGEpKSB7XG4gICAgICBsZXQgYWxsRm91bmQgPSB0cnVlXG4gICAgICBmb3IgKGNvbnN0IGFWYWx1ZSBvZiBhKSB7XG4gICAgICAgIGlmICghYi5oYXMoYVZhbHVlKSkge1xuICAgICAgICAgIGxldCBoYXMgPSBmYWxzZVxuICAgICAgICAgIGZvciAoY29uc3QgYlZhbHVlIG9mIGIpIHtcbiAgICAgICAgICAgIGNvbnN0IGlzRXF1YWwgPSBlcXVhbHMoYVZhbHVlLCBiVmFsdWUsIFtpdGVyYWJsZUVxdWFsaXR5V2l0aFN0YWNrXSlcbiAgICAgICAgICAgIGlmIChpc0VxdWFsID09PSB0cnVlKVxuICAgICAgICAgICAgICBoYXMgPSB0cnVlXG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKGhhcyA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgIGFsbEZvdW5kID0gZmFsc2VcbiAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICAvLyBSZW1vdmUgdGhlIGZpcnN0IHZhbHVlIGZyb20gdGhlIHN0YWNrIG9mIHRyYXZlcnNlZCB2YWx1ZXMuXG4gICAgICBhU3RhY2sucG9wKClcbiAgICAgIGJTdGFjay5wb3AoKVxuICAgICAgcmV0dXJuIGFsbEZvdW5kXG4gICAgfVxuICAgIGVsc2UgaWYgKGlzQSgnTWFwJywgYSkgfHwgaXNJbW11dGFibGVVbm9yZGVyZWRLZXllZChhKSkge1xuICAgICAgbGV0IGFsbEZvdW5kID0gdHJ1ZVxuICAgICAgZm9yIChjb25zdCBhRW50cnkgb2YgYSkge1xuICAgICAgICBpZiAoXG4gICAgICAgICAgIWIuaGFzKGFFbnRyeVswXSlcbiAgICAgICAgICB8fCAhZXF1YWxzKGFFbnRyeVsxXSwgYi5nZXQoYUVudHJ5WzBdKSwgW2l0ZXJhYmxlRXF1YWxpdHlXaXRoU3RhY2tdKVxuICAgICAgICApIHtcbiAgICAgICAgICBsZXQgaGFzID0gZmFsc2VcbiAgICAgICAgICBmb3IgKGNvbnN0IGJFbnRyeSBvZiBiKSB7XG4gICAgICAgICAgICBjb25zdCBtYXRjaGVkS2V5ID0gZXF1YWxzKGFFbnRyeVswXSwgYkVudHJ5WzBdLCBbXG4gICAgICAgICAgICAgIGl0ZXJhYmxlRXF1YWxpdHlXaXRoU3RhY2ssXG4gICAgICAgICAgICBdKVxuXG4gICAgICAgICAgICBsZXQgbWF0Y2hlZFZhbHVlID0gZmFsc2VcbiAgICAgICAgICAgIGlmIChtYXRjaGVkS2V5ID09PSB0cnVlKSB7XG4gICAgICAgICAgICAgIG1hdGNoZWRWYWx1ZSA9IGVxdWFscyhhRW50cnlbMV0sIGJFbnRyeVsxXSwgW1xuICAgICAgICAgICAgICAgIGl0ZXJhYmxlRXF1YWxpdHlXaXRoU3RhY2ssXG4gICAgICAgICAgICAgIF0pXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAobWF0Y2hlZFZhbHVlID09PSB0cnVlKVxuICAgICAgICAgICAgICBoYXMgPSB0cnVlXG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKGhhcyA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgIGFsbEZvdW5kID0gZmFsc2VcbiAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICAvLyBSZW1vdmUgdGhlIGZpcnN0IHZhbHVlIGZyb20gdGhlIHN0YWNrIG9mIHRyYXZlcnNlZCB2YWx1ZXMuXG4gICAgICBhU3RhY2sucG9wKClcbiAgICAgIGJTdGFjay5wb3AoKVxuICAgICAgcmV0dXJuIGFsbEZvdW5kXG4gICAgfVxuICB9XG5cbiAgY29uc3QgYkl0ZXJhdG9yID0gYltJdGVyYXRvclN5bWJvbF0oKVxuXG4gIGZvciAoY29uc3QgYVZhbHVlIG9mIGEpIHtcbiAgICBjb25zdCBuZXh0QiA9IGJJdGVyYXRvci5uZXh0KClcbiAgICBpZiAoXG4gICAgICBuZXh0Qi5kb25lXG4gICAgICB8fCAhZXF1YWxzKGFWYWx1ZSwgbmV4dEIudmFsdWUsIFtpdGVyYWJsZUVxdWFsaXR5V2l0aFN0YWNrXSlcbiAgICApXG4gICAgICByZXR1cm4gZmFsc2VcbiAgfVxuICBpZiAoIWJJdGVyYXRvci5uZXh0KCkuZG9uZSlcbiAgICByZXR1cm4gZmFsc2VcblxuICAvLyBSZW1vdmUgdGhlIGZpcnN0IHZhbHVlIGZyb20gdGhlIHN0YWNrIG9mIHRyYXZlcnNlZCB2YWx1ZXMuXG4gIGFTdGFjay5wb3AoKVxuICBiU3RhY2sucG9wKClcbiAgcmV0dXJuIHRydWVcbn1cblxuLyoqXG4gKiBDaGVja3MgaWYgYGhhc093blByb3BlcnR5KG9iamVjdCwga2V5KWAgdXAgdGhlIHByb3RvdHlwZSBjaGFpbiwgc3RvcHBpbmcgYXQgYE9iamVjdC5wcm90b3R5cGVgLlxuICovXG5jb25zdCBoYXNQcm9wZXJ0eUluT2JqZWN0ID0gKG9iamVjdDogb2JqZWN0LCBrZXk6IHN0cmluZyk6IGJvb2xlYW4gPT4ge1xuICBjb25zdCBzaG91bGRUZXJtaW5hdGVcbiAgICA9ICFvYmplY3QgfHwgdHlwZW9mIG9iamVjdCAhPT0gJ29iamVjdCcgfHwgb2JqZWN0ID09PSBPYmplY3QucHJvdG90eXBlXG5cbiAgaWYgKHNob3VsZFRlcm1pbmF0ZSlcbiAgICByZXR1cm4gZmFsc2VcblxuICByZXR1cm4gKFxuICAgIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmplY3QsIGtleSlcbiAgICB8fCBoYXNQcm9wZXJ0eUluT2JqZWN0KE9iamVjdC5nZXRQcm90b3R5cGVPZihvYmplY3QpLCBrZXkpXG4gIClcbn1cblxuY29uc3QgaXNPYmplY3RXaXRoS2V5cyA9IChhOiBhbnkpID0+XG4gIGlzT2JqZWN0KGEpXG4gICYmICEoYSBpbnN0YW5jZW9mIEVycm9yKVxuICAmJiAhKGEgaW5zdGFuY2VvZiBBcnJheSlcbiAgJiYgIShhIGluc3RhbmNlb2YgRGF0ZSlcblxuZXhwb3J0IGNvbnN0IHN1YnNldEVxdWFsaXR5ID0gKFxuICBvYmplY3Q6IHVua25vd24sXG4gIHN1YnNldDogdW5rbm93bixcbik6IGJvb2xlYW4gfCB1bmRlZmluZWQgPT4ge1xuICAvLyBzdWJzZXRFcXVhbGl0eSBuZWVkcyB0byBrZWVwIHRyYWNrIG9mIHRoZSByZWZlcmVuY2VzXG4gIC8vIGl0IGhhcyBhbHJlYWR5IHZpc2l0ZWQgdG8gYXZvaWQgaW5maW5pdGUgbG9vcHMgaW4gY2FzZVxuICAvLyB0aGVyZSBhcmUgY2lyY3VsYXIgcmVmZXJlbmNlcyBpbiB0aGUgc3Vic2V0IHBhc3NlZCB0byBpdC5cbiAgY29uc3Qgc3Vic2V0RXF1YWxpdHlXaXRoQ29udGV4dFxuICAgID0gKHNlZW5SZWZlcmVuY2VzOiBXZWFrTWFwPG9iamVjdCwgYm9vbGVhbj4gPSBuZXcgV2Vha01hcCgpKSA9PlxuICAgICAgKG9iamVjdDogYW55LCBzdWJzZXQ6IGFueSk6IGJvb2xlYW4gfCB1bmRlZmluZWQgPT4ge1xuICAgICAgICBpZiAoIWlzT2JqZWN0V2l0aEtleXMoc3Vic2V0KSlcbiAgICAgICAgICByZXR1cm4gdW5kZWZpbmVkXG5cbiAgICAgICAgcmV0dXJuIE9iamVjdC5rZXlzKHN1YnNldCkuZXZlcnkoKGtleSkgPT4ge1xuICAgICAgICAgIGlmIChpc09iamVjdFdpdGhLZXlzKHN1YnNldFtrZXldKSkge1xuICAgICAgICAgICAgaWYgKHNlZW5SZWZlcmVuY2VzLmhhcyhzdWJzZXRba2V5XSkpXG4gICAgICAgICAgICAgIHJldHVybiBlcXVhbHMob2JqZWN0W2tleV0sIHN1YnNldFtrZXldLCBbaXRlcmFibGVFcXVhbGl0eV0pXG5cbiAgICAgICAgICAgIHNlZW5SZWZlcmVuY2VzLnNldChzdWJzZXRba2V5XSwgdHJ1ZSlcbiAgICAgICAgICB9XG4gICAgICAgICAgY29uc3QgcmVzdWx0XG4gICAgICAgICAgPSBvYmplY3QgIT0gbnVsbFxuICAgICAgICAgICYmIGhhc1Byb3BlcnR5SW5PYmplY3Qob2JqZWN0LCBrZXkpXG4gICAgICAgICAgJiYgZXF1YWxzKG9iamVjdFtrZXldLCBzdWJzZXRba2V5XSwgW1xuICAgICAgICAgICAgaXRlcmFibGVFcXVhbGl0eSxcbiAgICAgICAgICAgIHN1YnNldEVxdWFsaXR5V2l0aENvbnRleHQoc2VlblJlZmVyZW5jZXMpLFxuICAgICAgICAgIF0pXG4gICAgICAgICAgLy8gVGhlIG1haW4gZ29hbCBvZiB1c2luZyBzZWVuUmVmZXJlbmNlIGlzIHRvIGF2b2lkIGNpcmN1bGFyIG5vZGUgb24gdHJlZS5cbiAgICAgICAgICAvLyBJdCB3aWxsIG9ubHkgaGFwcGVuIHdpdGhpbiBhIHBhcmVudCBhbmQgaXRzIGNoaWxkLCBub3QgYSBub2RlIGFuZCBub2RlcyBuZXh0IHRvIGl0IChzYW1lIGxldmVsKVxuICAgICAgICAgIC8vIFdlIHNob3VsZCBrZWVwIHRoZSByZWZlcmVuY2UgZm9yIGEgcGFyZW50IGFuZCBpdHMgY2hpbGQgb25seVxuICAgICAgICAgIC8vIFRodXMgd2Ugc2hvdWxkIGRlbGV0ZSB0aGUgcmVmZXJlbmNlIGltbWVkaWF0ZWx5IHNvIHRoYXQgaXQgZG9lc24ndCBpbnRlcmZlcmVcbiAgICAgICAgICAvLyBvdGhlciBub2RlcyB3aXRoaW4gdGhlIHNhbWUgbGV2ZWwgb24gdHJlZS5cbiAgICAgICAgICBzZWVuUmVmZXJlbmNlcy5kZWxldGUoc3Vic2V0W2tleV0pXG4gICAgICAgICAgcmV0dXJuIHJlc3VsdFxuICAgICAgICB9KVxuICAgICAgfVxuXG4gIHJldHVybiBzdWJzZXRFcXVhbGl0eVdpdGhDb250ZXh0KCkob2JqZWN0LCBzdWJzZXQpXG59XG5cbmV4cG9ydCBjb25zdCB0eXBlRXF1YWxpdHkgPSAoYTogYW55LCBiOiBhbnkpOiBib29sZWFuIHwgdW5kZWZpbmVkID0+IHtcbiAgaWYgKGEgPT0gbnVsbCB8fCBiID09IG51bGwgfHwgYS5jb25zdHJ1Y3RvciA9PT0gYi5jb25zdHJ1Y3RvcilcbiAgICByZXR1cm4gdW5kZWZpbmVkXG5cbiAgcmV0dXJuIGZhbHNlXG59XG5cbmV4cG9ydCBjb25zdCBhcnJheUJ1ZmZlckVxdWFsaXR5ID0gKFxuICBhOiB1bmtub3duLFxuICBiOiB1bmtub3duLFxuKTogYm9vbGVhbiB8IHVuZGVmaW5lZCA9PiB7XG4gIGlmICghKGEgaW5zdGFuY2VvZiBBcnJheUJ1ZmZlcikgfHwgIShiIGluc3RhbmNlb2YgQXJyYXlCdWZmZXIpKVxuICAgIHJldHVybiB1bmRlZmluZWRcblxuICBjb25zdCBkYXRhVmlld0EgPSBuZXcgRGF0YVZpZXcoYSlcbiAgY29uc3QgZGF0YVZpZXdCID0gbmV3IERhdGFWaWV3KGIpXG5cbiAgLy8gQnVmZmVycyBhcmUgbm90IGVxdWFsIHdoZW4gdGhleSBkbyBub3QgaGF2ZSB0aGUgc2FtZSBieXRlIGxlbmd0aFxuICBpZiAoZGF0YVZpZXdBLmJ5dGVMZW5ndGggIT09IGRhdGFWaWV3Qi5ieXRlTGVuZ3RoKVxuICAgIHJldHVybiBmYWxzZVxuXG4gIC8vIENoZWNrIGlmIGV2ZXJ5IGJ5dGUgdmFsdWUgaXMgZXF1YWwgdG8gZWFjaCBvdGhlclxuICBmb3IgKGxldCBpID0gMDsgaSA8IGRhdGFWaWV3QS5ieXRlTGVuZ3RoOyBpKyspIHtcbiAgICBpZiAoZGF0YVZpZXdBLmdldFVpbnQ4KGkpICE9PSBkYXRhVmlld0IuZ2V0VWludDgoaSkpXG4gICAgICByZXR1cm4gZmFsc2VcbiAgfVxuXG4gIHJldHVybiB0cnVlXG59XG5cbmV4cG9ydCBjb25zdCBzcGFyc2VBcnJheUVxdWFsaXR5ID0gKFxuICBhOiB1bmtub3duLFxuICBiOiB1bmtub3duLFxuKTogYm9vbGVhbiB8IHVuZGVmaW5lZCA9PiB7XG4gIGlmICghQXJyYXkuaXNBcnJheShhKSB8fCAhQXJyYXkuaXNBcnJheShiKSlcbiAgICByZXR1cm4gdW5kZWZpbmVkXG5cbiAgLy8gQSBzcGFyc2UgYXJyYXkgWywgLCAxXSB3aWxsIGhhdmUga2V5cyBbXCIyXCJdIHdoZXJlYXMgW3VuZGVmaW5lZCwgdW5kZWZpbmVkLCAxXSB3aWxsIGhhdmUga2V5cyBbXCIwXCIsIFwiMVwiLCBcIjJcIl1cbiAgY29uc3QgYUtleXMgPSBPYmplY3Qua2V5cyhhKVxuICBjb25zdCBiS2V5cyA9IE9iamVjdC5rZXlzKGIpXG4gIHJldHVybiAoXG4gICAgZXF1YWxzKGEsIGIsIFtpdGVyYWJsZUVxdWFsaXR5LCB0eXBlRXF1YWxpdHldLCB0cnVlKSAmJiBlcXVhbHMoYUtleXMsIGJLZXlzKVxuICApXG59XG4iLCJpbXBvcnQgdHlwZSB7IEVuaGFuY2VkU3B5IH0gZnJvbSAnLi4vamVzdC1tb2NrJ1xuaW1wb3J0IHsgaXNNb2NrRnVuY3Rpb24gfSBmcm9tICcuLi9qZXN0LW1vY2snXG5pbXBvcnQgeyBhZGRTZXJpYWxpemVyIH0gZnJvbSAnLi4vc25hcHNob3QvcG9ydC9wbHVnaW5zJ1xuaW1wb3J0IHR5cGUgeyBDb25zdHJ1Y3RhYmxlIH0gZnJvbSAnLi4vLi4vdHlwZXMnXG5pbXBvcnQgdHlwZSB7IENoYWlQbHVnaW4sIE1hdGNoZXJTdGF0ZSB9IGZyb20gJy4vdHlwZXMnXG5pbXBvcnQgeyBhcnJheUJ1ZmZlckVxdWFsaXR5LCBlcXVhbHMgYXMgYXN5bW1ldHJpY0VxdWFscywgaGFzQXN5bW1ldHJpYywgaXRlcmFibGVFcXVhbGl0eSwgc3BhcnNlQXJyYXlFcXVhbGl0eSwgdHlwZUVxdWFsaXR5IH0gZnJvbSAnLi9qZXN0LXV0aWxzJ1xuaW1wb3J0IHR5cGUgeyBBc3ltbWV0cmljTWF0Y2hlciB9IGZyb20gJy4vamVzdC1hc3ltbWV0cmljLW1hdGNoZXJzJ1xuXG5jb25zdCBNQVRDSEVSU19PQkpFQ1QgPSBTeW1ib2wuZm9yKCdtYXRjaGVycy1vYmplY3QnKVxuXG5pZiAoIU9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChnbG9iYWwsIE1BVENIRVJTX09CSkVDVCkpIHtcbiAgY29uc3QgZGVmYXVsdFN0YXRlOiBQYXJ0aWFsPE1hdGNoZXJTdGF0ZT4gPSB7XG4gICAgYXNzZXJ0aW9uQ2FsbHM6IDAsXG4gICAgaXNFeHBlY3RpbmdBc3NlcnRpb25zOiBmYWxzZSxcbiAgICBpc0V4cGVjdGluZ0Fzc2VydGlvbnNFcnJvcjogbnVsbCxcbiAgICBleHBlY3RlZEFzc2VydGlvbnNOdW1iZXI6IG51bGwsXG4gICAgZXhwZWN0ZWRBc3NlcnRpb25zTnVtYmVyRXJyb3I6IG51bGwsXG4gIH1cbiAgT2JqZWN0LmRlZmluZVByb3BlcnR5KGdsb2JhbCwgTUFUQ0hFUlNfT0JKRUNULCB7XG4gICAgdmFsdWU6IHtcbiAgICAgIHN0YXRlOiBkZWZhdWx0U3RhdGUsXG4gICAgfSxcbiAgfSlcbn1cblxuZXhwb3J0IGNvbnN0IGdldFN0YXRlID0gPFN0YXRlIGV4dGVuZHMgTWF0Y2hlclN0YXRlID0gTWF0Y2hlclN0YXRlPigpOiBTdGF0ZSA9PlxuICAoZ2xvYmFsIGFzIGFueSlbTUFUQ0hFUlNfT0JKRUNUXS5zdGF0ZVxuXG5leHBvcnQgY29uc3Qgc2V0U3RhdGUgPSA8U3RhdGUgZXh0ZW5kcyBNYXRjaGVyU3RhdGUgPSBNYXRjaGVyU3RhdGU+KFxuICBzdGF0ZTogUGFydGlhbDxTdGF0ZT4sXG4pOiB2b2lkID0+IHtcbiAgT2JqZWN0LmFzc2lnbigoZ2xvYmFsIGFzIGFueSlbTUFUQ0hFUlNfT0JKRUNUXS5zdGF0ZSwgc3RhdGUpXG59XG5cbi8vIEplc3QgRXhwZWN0IENvbXBhY3RcbmV4cG9ydCBjb25zdCBKZXN0Q2hhaUV4cGVjdDogQ2hhaVBsdWdpbiA9IChjaGFpLCB1dGlscykgPT4ge1xuICBmdW5jdGlvbiBkZWYobmFtZToga2V5b2YgQ2hhaS5WaXRlc3RBc3NlcnRpb24gfCAoa2V5b2YgQ2hhaS5WaXRlc3RBc3NlcnRpb24pW10sIGZuOiAoKHRoaXM6IENoYWkuQXNzZXJ0aW9uU3RhdGljICYgQ2hhaS5WaXRlc3RBc3NlcnRpb24sIC4uLmFyZ3M6IGFueVtdKSA9PiBhbnkpKSB7XG4gICAgY29uc3QgYWRkTWV0aG9kID0gKG46IGtleW9mIENoYWkuVml0ZXN0QXNzZXJ0aW9uKSA9PiB7XG4gICAgICB1dGlscy5hZGRNZXRob2QoY2hhaS5Bc3NlcnRpb24ucHJvdG90eXBlLCBuLCBmbilcbiAgICB9XG5cbiAgICBpZiAoQXJyYXkuaXNBcnJheShuYW1lKSlcbiAgICAgIG5hbWUuZm9yRWFjaChuID0+IGFkZE1ldGhvZChuKSlcblxuICAgIGVsc2VcbiAgICAgIGFkZE1ldGhvZChuYW1lKVxuICB9XG5cbiAgLy8gd2Ugb3ZlcnJpZGVzIHRoZSBkZWZhdWx0IGAuZXF1YWxgLCBrZWVwIG9yaWdpbmFsIGAuY2hhaUVxdWFsYCBpbiBjYXNlIG5lZWRcbiAgLy8gQHRzLWV4cGVjdC1lcnJvciBwcm90b3R5cGVcbiAgY29uc3QgY2hhaUVxdWFsID0gY2hhaS5Bc3NlcnRpb24ucHJvdG90eXBlLmVxdWFsXG4gIGRlZignY2hhaUVxdWFsJywgZnVuY3Rpb24oLi4uYXJnczogYW55W10pIHtcbiAgICByZXR1cm4gY2hhaUVxdWFsLmFwcGx5KHRoaXMsIGFyZ3MpXG4gIH0pXG5cbiAgOyhbJ3Rocm93JywgJ3Rocm93cycsICdUaHJvdyddIGFzIGNvbnN0KS5mb3JFYWNoKChtKSA9PiB7XG4gICAgdXRpbHMub3ZlcndyaXRlTWV0aG9kKGNoYWkuQXNzZXJ0aW9uLnByb3RvdHlwZSwgbSwgKF9zdXBlcjogYW55KSA9PiB7XG4gICAgICByZXR1cm4gZnVuY3Rpb24odGhpczogQ2hhaS5Bc3NlcnRpb24gJiBDaGFpLkFzc2VydGlvblN0YXRpYywgLi4uYXJnczogYW55W10pIHtcbiAgICAgICAgY29uc3QgcHJvbWlzZSA9IHV0aWxzLmZsYWcodGhpcywgJ3Byb21pc2UnKVxuICAgICAgICBjb25zdCBvYmplY3QgPSB1dGlscy5mbGFnKHRoaXMsICdvYmplY3QnKVxuICAgICAgICBpZiAocHJvbWlzZSA9PT0gJ3JlamVjdHMnKSB7XG4gICAgICAgICAgdXRpbHMuZmxhZyh0aGlzLCAnb2JqZWN0JywgKCkgPT4ge1xuICAgICAgICAgICAgdGhyb3cgb2JqZWN0XG4gICAgICAgICAgfSlcbiAgICAgICAgfVxuICAgICAgICBfc3VwZXIuYXBwbHkodGhpcywgYXJncylcbiAgICAgIH1cbiAgICB9KVxuICB9KVxuXG4gIC8vIG92ZXJyaWRlcyBgLmVxdWFsYCBhbmQgYC5lcWxgIHRvIHByb3ZpZGUgY3VzdG9tIGFzc2VydGlvbiBmb3IgYXN5bW1ldHJpYyBlcXVhbGl0eVxuICB1dGlscy5vdmVyd3JpdGVNZXRob2QoY2hhaS5Bc3NlcnRpb24ucHJvdG90eXBlLCAnZXF1YWwnLCAoX3N1cGVyOiBhbnkpID0+IHtcbiAgICByZXR1cm4gZnVuY3Rpb24odGhpczogQ2hhaS5Bc3NlcnRpb24gJiBDaGFpLkFzc2VydGlvblN0YXRpYywgLi4uYXJnczogYW55W10pIHtcbiAgICAgIGNvbnN0IGV4cGVjdGVkID0gYXJnc1swXVxuICAgICAgY29uc3QgYWN0dWFsID0gdXRpbHMuZmxhZyh0aGlzLCAnb2JqZWN0JylcbiAgICAgIGlmIChoYXNBc3ltbWV0cmljKGV4cGVjdGVkKSkge1xuICAgICAgICB0aGlzLmFzc2VydChcbiAgICAgICAgICBhc3ltbWV0cmljRXF1YWxzKGFjdHVhbCwgZXhwZWN0ZWQsIHVuZGVmaW5lZCwgdHJ1ZSksXG4gICAgICAgICAgJ25vdCBtYXRjaCB3aXRoICN7YWN0fScsXG4gICAgICAgICAgJ3Nob3VsZCBub3QgbWF0Y2ggd2l0aCAje2FjdH0nLFxuICAgICAgICAgIGFjdHVhbCxcbiAgICAgICAgICBleHBlY3RlZCxcbiAgICAgICAgKVxuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgIF9zdXBlci5hcHBseSh0aGlzLCBhcmdzKVxuICAgICAgfVxuICAgIH1cbiAgfSlcbiAgdXRpbHMub3ZlcndyaXRlTWV0aG9kKGNoYWkuQXNzZXJ0aW9uLnByb3RvdHlwZSwgJ2VxbCcsIChfc3VwZXI6IGFueSkgPT4ge1xuICAgIHJldHVybiBmdW5jdGlvbih0aGlzOiBDaGFpLkFzc2VydGlvbiAmIENoYWkuQXNzZXJ0aW9uU3RhdGljLCAuLi5hcmdzOiBhbnlbXSkge1xuICAgICAgY29uc3QgZXhwZWN0ZWQgPSBhcmdzWzBdXG4gICAgICBjb25zdCBhY3R1YWwgPSB1dGlscy5mbGFnKHRoaXMsICdvYmplY3QnKVxuICAgICAgaWYgKGhhc0FzeW1tZXRyaWMoZXhwZWN0ZWQpKSB7XG4gICAgICAgIHRoaXMuYXNzZXJ0KFxuICAgICAgICAgIGFzeW1tZXRyaWNFcXVhbHMoYWN0dWFsLCBleHBlY3RlZCksXG4gICAgICAgICAgJ25vdCBtYXRjaCB3aXRoICN7ZXhwfScsXG4gICAgICAgICAgJ3Nob3VsZCBub3QgbWF0Y2ggd2l0aCAje2V4cH0nLFxuICAgICAgICAgIGV4cGVjdGVkLFxuICAgICAgICAgIGFjdHVhbCxcbiAgICAgICAgKVxuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgIF9zdXBlci5hcHBseSh0aGlzLCBhcmdzKVxuICAgICAgfVxuICAgIH1cbiAgfSlcblxuICBkZWYoJ3RvRXF1YWwnLCBmdW5jdGlvbihleHBlY3RlZCkge1xuICAgIHJldHVybiB0aGlzLmVxbChleHBlY3RlZClcbiAgfSlcblxuICBkZWYoJ3RvU3RyaWN0RXF1YWwnLCBmdW5jdGlvbihleHBlY3RlZCkge1xuICAgIGNvbnN0IG9iaiA9IHV0aWxzLmZsYWcodGhpcywgJ29iamVjdCcpXG4gICAgY29uc3QgZXF1YWwgPSBhc3ltbWV0cmljRXF1YWxzKFxuICAgICAgb2JqLFxuICAgICAgZXhwZWN0ZWQsXG4gICAgICBbXG4gICAgICAgIGl0ZXJhYmxlRXF1YWxpdHksXG4gICAgICAgIHR5cGVFcXVhbGl0eSxcbiAgICAgICAgc3BhcnNlQXJyYXlFcXVhbGl0eSxcbiAgICAgICAgYXJyYXlCdWZmZXJFcXVhbGl0eSxcbiAgICAgIF0sXG4gICAgICB0cnVlLFxuICAgIClcblxuICAgIHJldHVybiB0aGlzLmFzc2VydChcbiAgICAgIGVxdWFsLFxuICAgICAgJ2V4cGVjdGVkICN7dGhpc30gdG8gc3RyaWN0bHkgZXF1YWwgI3tleHB9JyxcbiAgICAgICdleHBlY3RlZCAje3RoaXN9IHRvIG5vdCBzdHJpY3RseSBlcXVhbCAje2V4cH0nLFxuICAgICAgZXhwZWN0ZWQsXG4gICAgICBvYmosXG4gICAgKVxuICB9KVxuICBkZWYoJ3RvQmUnLCBmdW5jdGlvbihleHBlY3RlZCkge1xuICAgIHJldHVybiB0aGlzLmVxdWFsKGV4cGVjdGVkKVxuICB9KVxuICBkZWYoJ3RvTWF0Y2hPYmplY3QnLCBmdW5jdGlvbihleHBlY3RlZCkge1xuICAgIHJldHVybiB0aGlzLmNvbnRhaW5TdWJzZXQoZXhwZWN0ZWQpXG4gIH0pXG4gIGRlZigndG9NYXRjaCcsIGZ1bmN0aW9uKGV4cGVjdGVkOiBzdHJpbmcgfCBSZWdFeHApIHtcbiAgICBpZiAodHlwZW9mIGV4cGVjdGVkID09PSAnc3RyaW5nJylcbiAgICAgIHJldHVybiB0aGlzLmluY2x1ZGUoZXhwZWN0ZWQpXG4gICAgZWxzZVxuICAgICAgcmV0dXJuIHRoaXMubWF0Y2goZXhwZWN0ZWQpXG4gIH0pXG4gIGRlZigndG9Db250YWluJywgZnVuY3Rpb24oaXRlbSkge1xuICAgIHJldHVybiB0aGlzLmNvbnRhaW4oaXRlbSlcbiAgfSlcbiAgZGVmKCd0b0NvbnRhaW5FcXVhbCcsIGZ1bmN0aW9uKGV4cGVjdGVkKSB7XG4gICAgY29uc3Qgb2JqID0gdXRpbHMuZmxhZyh0aGlzLCAnb2JqZWN0JylcbiAgICBjb25zdCBpbmRleCA9IEFycmF5LmZyb20ob2JqKS5maW5kSW5kZXgoKGl0ZW0pID0+IHtcbiAgICAgIHJldHVybiBhc3ltbWV0cmljRXF1YWxzKGl0ZW0sIGV4cGVjdGVkKVxuICAgIH0pXG5cbiAgICB0aGlzLmFzc2VydChcbiAgICAgIGluZGV4ICE9PSAtMSxcbiAgICAgICdleHBlY3RlZCAje3RoaXN9IHRvIGRlZXAgZXF1YWxseSBjb250YWluICN7ZXhwfScsXG4gICAgICAnZXhwZWN0ZWQgI3t0aGlzfSB0byBub3QgZGVlcCBlcXVhbGx5IGNvbnRhaW4gI3tleHB9JyxcbiAgICAgIGV4cGVjdGVkLFxuICAgIClcbiAgfSlcbiAgZGVmKCd0b0JlVHJ1dGh5JywgZnVuY3Rpb24oKSB7XG4gICAgY29uc3Qgb2JqID0gdXRpbHMuZmxhZyh0aGlzLCAnb2JqZWN0JylcbiAgICB0aGlzLmFzc2VydChcbiAgICAgIEJvb2xlYW4ob2JqKSxcbiAgICAgICdleHBlY3RlZCAje3RoaXN9IHRvIGJlIHRydXRoeScsXG4gICAgICAnZXhwZWN0ZWQgI3t0aGlzfSB0byBub3QgYmUgdHJ1dGh5JyxcbiAgICAgIG9iaixcbiAgICApXG4gIH0pXG4gIGRlZigndG9CZUZhbHN5JywgZnVuY3Rpb24oKSB7XG4gICAgY29uc3Qgb2JqID0gdXRpbHMuZmxhZyh0aGlzLCAnb2JqZWN0JylcbiAgICB0aGlzLmFzc2VydChcbiAgICAgICFvYmosXG4gICAgICAnZXhwZWN0ZWQgI3t0aGlzfSB0byBiZSBmYWxzeScsXG4gICAgICAnZXhwZWN0ZWQgI3t0aGlzfSB0byBub3QgYmUgZmFsc3knLFxuICAgICAgb2JqLFxuICAgIClcbiAgfSlcbiAgZGVmKCd0b0JlR3JlYXRlclRoYW4nLCBmdW5jdGlvbihleHBlY3RlZDogbnVtYmVyKSB7XG4gICAgcmV0dXJuIHRoaXMudG8uZ3JlYXRlclRoYW4oZXhwZWN0ZWQpXG4gIH0pXG4gIGRlZigndG9CZUdyZWF0ZXJUaGFuT3JFcXVhbCcsIGZ1bmN0aW9uKGV4cGVjdGVkOiBudW1iZXIpIHtcbiAgICByZXR1cm4gdGhpcy50by5ncmVhdGVyVGhhbk9yRXF1YWwoZXhwZWN0ZWQpXG4gIH0pXG4gIGRlZigndG9CZUxlc3NUaGFuJywgZnVuY3Rpb24oZXhwZWN0ZWQ6IG51bWJlcikge1xuICAgIHJldHVybiB0aGlzLnRvLmxlc3NUaGFuKGV4cGVjdGVkKVxuICB9KVxuICBkZWYoJ3RvQmVMZXNzVGhhbk9yRXF1YWwnLCBmdW5jdGlvbihleHBlY3RlZDogbnVtYmVyKSB7XG4gICAgcmV0dXJuIHRoaXMudG8ubGVzc1RoYW5PckVxdWFsKGV4cGVjdGVkKVxuICB9KVxuICBkZWYoJ3RvQmVOYU4nLCBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy5iZS5OYU5cbiAgfSlcbiAgZGVmKCd0b0JlVW5kZWZpbmVkJywgZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMuYmUudW5kZWZpbmVkXG4gIH0pXG4gIGRlZigndG9CZU51bGwnLCBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy5iZS5udWxsXG4gIH0pXG4gIGRlZigndG9CZURlZmluZWQnLCBmdW5jdGlvbigpIHtcbiAgICBjb25zdCBuZWdhdGUgPSB1dGlscy5mbGFnKHRoaXMsICduZWdhdGUnKVxuICAgIHV0aWxzLmZsYWcodGhpcywgJ25lZ2F0ZScsIGZhbHNlKVxuXG4gICAgaWYgKG5lZ2F0ZSlcbiAgICAgIHJldHVybiB0aGlzLmJlLnVuZGVmaW5lZFxuXG4gICAgcmV0dXJuIHRoaXMubm90LmJlLnVuZGVmaW5lZFxuICB9KVxuICBkZWYoJ3RvQmVJbnN0YW5jZU9mJywgZnVuY3Rpb24ob2JqOiBhbnkpIHtcbiAgICByZXR1cm4gdGhpcy5pbnN0YW5jZU9mKG9iailcbiAgfSlcbiAgZGVmKCd0b0hhdmVMZW5ndGgnLCBmdW5jdGlvbihsZW5ndGg6IG51bWJlcikge1xuICAgIHJldHVybiB0aGlzLmhhdmUubGVuZ3RoKGxlbmd0aClcbiAgfSlcbiAgLy8gZGVzdHJ1Y3R1cmluZywgYmVjYXVzZSBpdCBjaGVja3MgYGFyZ3VtZW50c2AgaW5zaWRlLCBhbmQgdmFsdWUgaXMgcGFzc2luZyBhcyBgdW5kZWZpbmVkYFxuICBkZWYoJ3RvSGF2ZVByb3BlcnR5JywgZnVuY3Rpb24oLi4uYXJnczogW3Byb3BlcnR5OiBzdHJpbmcsIHZhbHVlPzogYW55XSkge1xuICAgIHJldHVybiB0aGlzLmhhdmUuZGVlcC5uZXN0ZWQucHJvcGVydHkoLi4uYXJncylcbiAgfSlcbiAgZGVmKCd0b0JlQ2xvc2VUbycsIGZ1bmN0aW9uKHJlY2VpdmVkOiBudW1iZXIsIHByZWNpc2lvbiA9IDIpIHtcbiAgICBjb25zdCBleHBlY3RlZCA9IHRoaXMuX29ialxuICAgIGxldCBwYXNzID0gZmFsc2VcbiAgICBsZXQgZXhwZWN0ZWREaWZmID0gMFxuICAgIGxldCByZWNlaXZlZERpZmYgPSAwXG5cbiAgICBpZiAocmVjZWl2ZWQgPT09IEluZmluaXR5ICYmIGV4cGVjdGVkID09PSBJbmZpbml0eSkge1xuICAgICAgcGFzcyA9IHRydWVcbiAgICB9XG4gICAgZWxzZSBpZiAocmVjZWl2ZWQgPT09IC1JbmZpbml0eSAmJiBleHBlY3RlZCA9PT0gLUluZmluaXR5KSB7XG4gICAgICBwYXNzID0gdHJ1ZVxuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIGV4cGVjdGVkRGlmZiA9IE1hdGgucG93KDEwLCAtcHJlY2lzaW9uKSAvIDJcbiAgICAgIHJlY2VpdmVkRGlmZiA9IE1hdGguYWJzKGV4cGVjdGVkIC0gcmVjZWl2ZWQpXG4gICAgICBwYXNzID0gcmVjZWl2ZWREaWZmIDwgZXhwZWN0ZWREaWZmXG4gICAgfVxuICAgIHJldHVybiB0aGlzLmFzc2VydChcbiAgICAgIHBhc3MsXG4gICAgICBgZXhwZWN0ZWQgI3t0aGlzfSB0byBiZSBjbG9zZSB0byAje2V4cH0sIHJlY2VpdmVkIGRpZmZlcmVuY2UgaXMgJHtyZWNlaXZlZERpZmZ9LCBidXQgZXhwZWN0ZWQgJHtleHBlY3RlZERpZmZ9YCxcbiAgICAgIGBleHBlY3RlZCAje3RoaXN9IHRvIG5vdCBiZSBjbG9zZSB0byAje2V4cH0sIHJlY2VpdmVkIGRpZmZlcmVuY2UgaXMgJHtyZWNlaXZlZERpZmZ9LCBidXQgZXhwZWN0ZWQgJHtleHBlY3RlZERpZmZ9YCxcbiAgICAgIHJlY2VpdmVkLFxuICAgICAgZXhwZWN0ZWQsXG4gICAgKVxuICB9KVxuXG4gIGNvbnN0IGFzc2VydElzTW9jayA9IChhc3NlcnRpb246IGFueSkgPT4ge1xuICAgIGlmICghaXNNb2NrRnVuY3Rpb24oYXNzZXJ0aW9uLl9vYmopKVxuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihgJHt1dGlscy5pbnNwZWN0KGFzc2VydGlvbi5fb2JqKX0gaXMgbm90IGEgc3B5IG9yIGEgY2FsbCB0byBhIHNweSFgKVxuICB9XG4gIGNvbnN0IGdldFNweSA9IChhc3NlcnRpb246IGFueSkgPT4ge1xuICAgIGFzc2VydElzTW9jayhhc3NlcnRpb24pXG4gICAgcmV0dXJuIGFzc2VydGlvbi5fb2JqIGFzIEVuaGFuY2VkU3B5XG4gIH1cbiAgZGVmKFsndG9IYXZlQmVlbkNhbGxlZFRpbWVzJywgJ3RvQmVDYWxsZWRUaW1lcyddLCBmdW5jdGlvbihudW1iZXI6IG51bWJlcikge1xuICAgIGNvbnN0IHNweSA9IGdldFNweSh0aGlzKVxuICAgIGNvbnN0IHNweU5hbWUgPSBzcHkuZ2V0TW9ja05hbWUoKVxuICAgIGNvbnN0IGNhbGxDb3VudCA9IHNweS5tb2NrLmNhbGxzLmxlbmd0aFxuICAgIHJldHVybiB0aGlzLmFzc2VydChcbiAgICAgIGNhbGxDb3VudCA9PT0gbnVtYmVyLFxuICAgICAgYGV4cGVjdGVkIFwiJHtzcHlOYW1lfVwiIHRvIGJlIGNhbGxlZCAje2V4cH0gdGltZXNgLFxuICAgICAgYGV4cGVjdGVkIFwiJHtzcHlOYW1lfVwiIHRvIG5vdCBiZSBjYWxsZWQgI3tleHB9IHRpbWVzYCxcbiAgICAgIG51bWJlcixcbiAgICAgIGNhbGxDb3VudCxcbiAgICApXG4gIH0pXG4gIGRlZigndG9IYXZlQmVlbkNhbGxlZE9uY2UnLCBmdW5jdGlvbigpIHtcbiAgICBjb25zdCBzcHkgPSBnZXRTcHkodGhpcylcbiAgICBjb25zdCBzcHlOYW1lID0gc3B5LmdldE1vY2tOYW1lKClcbiAgICBjb25zdCBjYWxsQ291bnQgPSBzcHkubW9jay5jYWxscy5sZW5ndGhcbiAgICByZXR1cm4gdGhpcy5hc3NlcnQoXG4gICAgICBjYWxsQ291bnQgPT09IDEsXG4gICAgICBgZXhwZWN0ZWQgXCIke3NweU5hbWV9XCIgdG8gYmUgY2FsbGVkIG9uY2VgLFxuICAgICAgYGV4cGVjdGVkIFwiJHtzcHlOYW1lfVwiIHRvIG5vdCBiZSBjYWxsZWQgb25jZWAsXG4gICAgICAxLFxuICAgICAgY2FsbENvdW50LFxuICAgIClcbiAgfSlcbiAgZGVmKFsndG9IYXZlQmVlbkNhbGxlZCcsICd0b0JlQ2FsbGVkJ10sIGZ1bmN0aW9uKCkge1xuICAgIGNvbnN0IHNweSA9IGdldFNweSh0aGlzKVxuICAgIGNvbnN0IHNweU5hbWUgPSBzcHkuZ2V0TW9ja05hbWUoKVxuICAgIGNvbnN0IGNhbGxlZCA9IHNweS5tb2NrLmNhbGxzLmxlbmd0aCA+IDBcbiAgICByZXR1cm4gdGhpcy5hc3NlcnQoXG4gICAgICBjYWxsZWQsXG4gICAgICBgZXhwZWN0ZWQgXCIke3NweU5hbWV9XCIgdG8gYmUgY2FsbGVkIGF0IGxlYXN0IG9uY2VgLFxuICAgICAgYGV4cGVjdGVkIFwiJHtzcHlOYW1lfVwiIHRvIG5vdCBiZSBjYWxsZWQgYXQgYWxsYCxcbiAgICAgIHRydWUsXG4gICAgICBjYWxsZWQsXG4gICAgKVxuICB9KVxuICBkZWYoWyd0b0hhdmVCZWVuQ2FsbGVkV2l0aCcsICd0b0JlQ2FsbGVkV2l0aCddLCBmdW5jdGlvbiguLi5hcmdzKSB7XG4gICAgY29uc3Qgc3B5ID0gZ2V0U3B5KHRoaXMpXG4gICAgY29uc3Qgc3B5TmFtZSA9IHNweS5nZXRNb2NrTmFtZSgpXG4gICAgY29uc3QgcGFzcyA9IHNweS5tb2NrLmNhbGxzLnNvbWUoY2FsbEFyZyA9PiBhc3ltbWV0cmljRXF1YWxzKGNhbGxBcmcsIGFyZ3MsIFtpdGVyYWJsZUVxdWFsaXR5XSkpXG4gICAgcmV0dXJuIHRoaXMuYXNzZXJ0KFxuICAgICAgcGFzcyxcbiAgICAgIGBleHBlY3RlZCBcIiR7c3B5TmFtZX1cIiB0byBiZSBjYWxsZWQgd2l0aCBhcmd1bWVudHM6ICN7ZXhwfWAsXG4gICAgICBgZXhwZWN0ZWQgXCIke3NweU5hbWV9XCIgdG8gbm90IGJlIGNhbGxlZCB3aXRoIGFyZ3VtZW50czogI3tleHB9YCxcbiAgICAgIGFyZ3MsXG4gICAgICBzcHkubW9jay5jYWxscyxcbiAgICApXG4gIH0pXG4gIGNvbnN0IG9yZGluYWxPZiA9IChpOiBudW1iZXIpID0+IHtcbiAgICBjb25zdCBqID0gaSAlIDEwXG4gICAgY29uc3QgayA9IGkgJSAxMDBcblxuICAgIGlmIChqID09PSAxICYmIGsgIT09IDExKVxuICAgICAgcmV0dXJuIGAke2l9c3RgXG5cbiAgICBpZiAoaiA9PT0gMiAmJiBrICE9PSAxMilcbiAgICAgIHJldHVybiBgJHtpfW5kYFxuXG4gICAgaWYgKGogPT09IDMgJiYgayAhPT0gMTMpXG4gICAgICByZXR1cm4gYCR7aX1yZGBcblxuICAgIHJldHVybiBgJHtpfXRoYFxuICB9XG4gIGRlZihbJ3RvSGF2ZUJlZW5OdGhDYWxsZWRXaXRoJywgJ250aENhbGxlZFdpdGgnXSwgZnVuY3Rpb24odGltZXM6IG51bWJlciwgLi4uYXJnczogYW55W10pIHtcbiAgICBjb25zdCBzcHkgPSBnZXRTcHkodGhpcylcbiAgICBjb25zdCBzcHlOYW1lID0gc3B5LmdldE1vY2tOYW1lKClcbiAgICBjb25zdCBudGhDYWxsID0gc3B5Lm1vY2suY2FsbHNbdGltZXMgLSAxXVxuXG4gICAgdGhpcy5hc3NlcnQoXG4gICAgICBhc3ltbWV0cmljRXF1YWxzKG50aENhbGwsIGFyZ3MsIFtpdGVyYWJsZUVxdWFsaXR5XSksXG4gICAgICBgZXhwZWN0ZWQgJHtvcmRpbmFsT2YodGltZXMpfSBcIiR7c3B5TmFtZX1cIiBjYWxsIHRvIGhhdmUgYmVlbiBjYWxsZWQgd2l0aCAje2V4cH1gLFxuICAgICAgYGV4cGVjdGVkICR7b3JkaW5hbE9mKHRpbWVzKX0gXCIke3NweU5hbWV9XCIgY2FsbCB0byBub3QgaGF2ZSBiZWVuIGNhbGxlZCB3aXRoICN7ZXhwfWAsXG4gICAgICBhcmdzLFxuICAgICAgbnRoQ2FsbCxcbiAgICApXG4gIH0pXG4gIGRlZihbJ3RvSGF2ZUJlZW5MYXN0Q2FsbGVkV2l0aCcsICdsYXN0Q2FsbGVkV2l0aCddLCBmdW5jdGlvbiguLi5hcmdzOiBhbnlbXSkge1xuICAgIGNvbnN0IHNweSA9IGdldFNweSh0aGlzKVxuICAgIGNvbnN0IHNweU5hbWUgPSBzcHkuZ2V0TW9ja05hbWUoKVxuICAgIGNvbnN0IGxhc3RDYWxsID0gc3B5Lm1vY2suY2FsbHNbc3B5LmNhbGxzLmxlbmd0aCAtIDFdXG5cbiAgICB0aGlzLmFzc2VydChcbiAgICAgIGFzeW1tZXRyaWNFcXVhbHMobGFzdENhbGwsIGFyZ3MsIFtpdGVyYWJsZUVxdWFsaXR5XSksXG4gICAgICBgZXhwZWN0ZWQgbGFzdCBcIiR7c3B5TmFtZX1cIiBjYWxsIHRvIGhhdmUgYmVlbiBjYWxsZWQgd2l0aCAje2V4cH1gLFxuICAgICAgYGV4cGVjdGVkIGxhc3QgXCIke3NweU5hbWV9XCIgY2FsbCB0byBub3QgaGF2ZSBiZWVuIGNhbGxlZCB3aXRoICN7ZXhwfWAsXG4gICAgICBhcmdzLFxuICAgICAgbGFzdENhbGwsXG4gICAgKVxuICB9KVxuICBkZWYoWyd0b1Rocm93JywgJ3RvVGhyb3dFcnJvciddLCBmdW5jdGlvbihleHBlY3RlZD86IHN0cmluZyB8IENvbnN0cnVjdGFibGUgfCBSZWdFeHAgfCBFcnJvcikge1xuICAgIGNvbnN0IG9iaiA9IHRoaXMuX29ialxuICAgIGNvbnN0IHByb21pc2UgPSB1dGlscy5mbGFnKHRoaXMsICdwcm9taXNlJylcbiAgICBsZXQgdGhyb3duOiBhbnkgPSBudWxsXG5cbiAgICBpZiAocHJvbWlzZSkge1xuICAgICAgdGhyb3duID0gb2JqXG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgdHJ5IHtcbiAgICAgICAgb2JqKClcbiAgICAgIH1cbiAgICAgIGNhdGNoIChlcnIpIHtcbiAgICAgICAgdGhyb3duID0gZXJyXG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHR5cGVvZiBleHBlY3RlZCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgY29uc3QgbmFtZSA9IGV4cGVjdGVkLm5hbWUgfHwgZXhwZWN0ZWQucHJvdG90eXBlLmNvbnN0cnVjdG9yLm5hbWVcbiAgICAgIHJldHVybiB0aGlzLmFzc2VydChcbiAgICAgICAgdGhyb3duICYmIHRocm93biBpbnN0YW5jZW9mIGV4cGVjdGVkLFxuICAgICAgICBgZXhwZWN0ZWQgZXJyb3IgdG8gYmUgaW5zdGFuY2Ugb2YgJHtuYW1lfWAsXG4gICAgICAgIGBleHBlY3RlZCBlcnJvciBub3QgdG8gYmUgaW5zdGFuY2Ugb2YgJHtuYW1lfWAsXG4gICAgICAgIGV4cGVjdGVkLFxuICAgICAgICB0aHJvd24sXG4gICAgICApXG4gICAgfVxuXG4gICAgaWYgKGV4cGVjdGVkICYmIGV4cGVjdGVkIGluc3RhbmNlb2YgRXJyb3IpIHtcbiAgICAgIHJldHVybiB0aGlzLmFzc2VydChcbiAgICAgICAgdGhyb3duICYmIGV4cGVjdGVkLm1lc3NhZ2UgPT09IHRocm93bi5tZXNzYWdlLFxuICAgICAgICBgZXhwZWN0ZWQgZXJyb3IgdG8gaGF2ZSBtZXNzYWdlOiAke2V4cGVjdGVkLm1lc3NhZ2V9YCxcbiAgICAgICAgYGV4cGVjdGVkIGVycm9yIG5vdCB0byBoYXZlIG1lc3NhZ2U6ICR7ZXhwZWN0ZWQubWVzc2FnZX1gLFxuICAgICAgICBleHBlY3RlZC5tZXNzYWdlLFxuICAgICAgICB0aHJvd24gJiYgdGhyb3duLm1lc3NhZ2UsXG4gICAgICApXG4gICAgfVxuXG4gICAgaWYgKGV4cGVjdGVkICYmIHR5cGVvZiAoZXhwZWN0ZWQgYXMgYW55KS5hc3ltbWV0cmljTWF0Y2ggPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIGNvbnN0IG1hdGNoZXIgPSBleHBlY3RlZCBhcyBhbnkgYXMgQXN5bW1ldHJpY01hdGNoZXI8YW55PlxuICAgICAgcmV0dXJuIHRoaXMuYXNzZXJ0KFxuICAgICAgICB0aHJvd24gJiYgbWF0Y2hlci5hc3ltbWV0cmljTWF0Y2godGhyb3duKSxcbiAgICAgICAgJ2V4cGVjdGVkIGVycm9yIHRvIG1hdGNoIGFzeW1tZXRyaWMgbWF0Y2hlcicsXG4gICAgICAgICdleHBlY3RlZCBlcnJvciBub3QgdG8gbWF0Y2ggYXN5bW1ldHJpYyBtYXRjaGVyJyxcbiAgICAgICAgbWF0Y2hlci50b1N0cmluZygpLFxuICAgICAgICB0aHJvd24sXG4gICAgICApXG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMudG8udGhyb3dzKGV4cGVjdGVkKVxuICB9KVxuICBkZWYoWyd0b0hhdmVSZXR1cm5lZCcsICd0b1JldHVybiddLCBmdW5jdGlvbigpIHtcbiAgICBjb25zdCBzcHkgPSBnZXRTcHkodGhpcylcbiAgICBjb25zdCBzcHlOYW1lID0gc3B5LmdldE1vY2tOYW1lKClcbiAgICBjb25zdCBjYWxsZWRBbmROb3RUaHJldyA9IHNweS5tb2NrLmNhbGxzLmxlbmd0aCA+IDAgJiYgIXNweS5tb2NrLnJlc3VsdHMuc29tZSgoeyB0eXBlIH0pID0+IHR5cGUgPT09ICd0aHJvdycpXG4gICAgdGhpcy5hc3NlcnQoXG4gICAgICBjYWxsZWRBbmROb3RUaHJldyxcbiAgICAgIGBleHBlY3RlZCBcIiR7c3B5TmFtZX1cIiB0byBiZSBzdWNjZXNzZnVsbHkgY2FsbGVkIGF0IGxlYXN0IG9uY2VgLFxuICAgICAgYGV4cGVjdGVkIFwiJHtzcHlOYW1lfVwiIHRvIG5vdCBiZSBzdWNjZXNzZnVsbHkgY2FsbGVkYCxcbiAgICAgIGNhbGxlZEFuZE5vdFRocmV3LFxuICAgICAgIWNhbGxlZEFuZE5vdFRocmV3LFxuICAgIClcbiAgfSlcbiAgZGVmKFsndG9IYXZlUmV0dXJuZWRUaW1lcycsICd0b1JldHVyblRpbWVzJ10sIGZ1bmN0aW9uKHRpbWVzOiBudW1iZXIpIHtcbiAgICBjb25zdCBzcHkgPSBnZXRTcHkodGhpcylcbiAgICBjb25zdCBzcHlOYW1lID0gc3B5LmdldE1vY2tOYW1lKClcbiAgICBjb25zdCBzdWNjZXNzZnVsbFJldHVybnMgPSBzcHkubW9jay5yZXN1bHRzLnJlZHVjZSgoc3VjY2VzcywgeyB0eXBlIH0pID0+IHR5cGUgPT09ICd0aHJvdycgPyBzdWNjZXNzIDogKytzdWNjZXNzLCAwKVxuICAgIHRoaXMuYXNzZXJ0KFxuICAgICAgc3VjY2Vzc2Z1bGxSZXR1cm5zID09PSB0aW1lcyxcbiAgICAgIGBleHBlY3RlZCBcIiR7c3B5TmFtZX1cIiB0byBiZSBzdWNjZXNzZnVsbHkgY2FsbGVkICR7dGltZXN9IHRpbWVzYCxcbiAgICAgIGBleHBlY3RlZCBcIiR7c3B5TmFtZX1cIiB0byBub3QgYmUgc3VjY2Vzc2Z1bGx5IGNhbGxlZCAke3RpbWVzfSB0aW1lc2AsXG4gICAgICBgZXhwZWN0ZWQgbnVtYmVyIG9mIHJldHVybnM6ICR7dGltZXN9YCxcbiAgICAgIGByZWNlaXZlZCBudW1iZXIgb2YgcmV0dXJuczogJHtzdWNjZXNzZnVsbFJldHVybnN9YCxcbiAgICApXG4gIH0pXG4gIGRlZihbJ3RvSGF2ZVJldHVybmVkV2l0aCcsICd0b1JldHVybldpdGgnXSwgZnVuY3Rpb24odmFsdWU6IGFueSkge1xuICAgIGNvbnN0IHNweSA9IGdldFNweSh0aGlzKVxuICAgIGNvbnN0IHNweU5hbWUgPSBzcHkuZ2V0TW9ja05hbWUoKVxuICAgIGNvbnN0IHBhc3MgPSBzcHkubW9jay5yZXN1bHRzLnNvbWUoKHsgdHlwZSwgdmFsdWU6IHJlc3VsdCB9KSA9PiB0eXBlID09PSAncmV0dXJuJyAmJiBhc3ltbWV0cmljRXF1YWxzKHZhbHVlLCByZXN1bHQpKVxuICAgIHRoaXMuYXNzZXJ0KFxuICAgICAgcGFzcyxcbiAgICAgIGBleHBlY3RlZCBcIiR7c3B5TmFtZX1cIiB0byBiZSBzdWNjZXNzZnVsbHkgY2FsbGVkIHdpdGggI3tleHB9YCxcbiAgICAgIGBleHBlY3RlZCBcIiR7c3B5TmFtZX1cIiB0byBub3QgYmUgc3VjY2Vzc2Z1bGx5IGNhbGxlZCB3aXRoICN7ZXhwfWAsXG4gICAgICB2YWx1ZSxcbiAgICApXG4gIH0pXG4gIGRlZihbJ3RvSGF2ZUxhc3RSZXR1cm5lZFdpdGgnLCAnbGFzdFJldHVybmVkV2l0aCddLCBmdW5jdGlvbih2YWx1ZTogYW55KSB7XG4gICAgY29uc3Qgc3B5ID0gZ2V0U3B5KHRoaXMpXG4gICAgY29uc3Qgc3B5TmFtZSA9IHNweS5nZXRNb2NrTmFtZSgpXG4gICAgY29uc3QgeyB2YWx1ZTogbGFzdFJlc3VsdCB9ID0gc3B5Lm1vY2sucmVzdWx0c1tzcHkucmV0dXJucy5sZW5ndGggLSAxXVxuICAgIGNvbnN0IHBhc3MgPSBhc3ltbWV0cmljRXF1YWxzKGxhc3RSZXN1bHQsIHZhbHVlKVxuICAgIHRoaXMuYXNzZXJ0KFxuICAgICAgcGFzcyxcbiAgICAgIGBleHBlY3RlZCBsYXN0IFwiJHtzcHlOYW1lfVwiIGNhbGwgdG8gcmV0dXJuICN7ZXhwfWAsXG4gICAgICBgZXhwZWN0ZWQgbGFzdCBcIiR7c3B5TmFtZX1cIiBjYWxsIHRvIG5vdCByZXR1cm4gI3tleHB9YCxcbiAgICAgIHZhbHVlLFxuICAgICAgbGFzdFJlc3VsdCxcbiAgICApXG4gIH0pXG4gIGRlZihbJ3RvSGF2ZU50aFJldHVybmVkV2l0aCcsICdudGhSZXR1cm5lZFdpdGgnXSwgZnVuY3Rpb24obnRoQ2FsbDogbnVtYmVyLCB2YWx1ZTogYW55KSB7XG4gICAgY29uc3Qgc3B5ID0gZ2V0U3B5KHRoaXMpXG4gICAgY29uc3Qgc3B5TmFtZSA9IHNweS5nZXRNb2NrTmFtZSgpXG4gICAgY29uc3QgaXNOb3QgPSB1dGlscy5mbGFnKHRoaXMsICduZWdhdGUnKSBhcyBib29sZWFuXG4gICAgY29uc3QgeyB0eXBlOiBjYWxsVHlwZSwgdmFsdWU6IGNhbGxSZXN1bHQgfSA9IHNweS5tb2NrLnJlc3VsdHNbbnRoQ2FsbCAtIDFdXG4gICAgY29uc3Qgb3JkaW5hbENhbGwgPSBgJHtvcmRpbmFsT2YobnRoQ2FsbCl9IGNhbGxgXG5cbiAgICBpZiAoIWlzTm90ICYmIGNhbGxUeXBlID09PSAndGhyb3cnKVxuICAgICAgY2hhaS5hc3NlcnQuZmFpbChgZXhwZWN0ZWQgJHtvcmRpbmFsQ2FsbH0gdG8gcmV0dXJuICN7ZXhwfSwgYnV0IGluc3RlYWQgaXQgdGhyZXcgYW4gZXJyb3JgKVxuXG4gICAgY29uc3QgbnRoQ2FsbFJldHVybiA9IGFzeW1tZXRyaWNFcXVhbHMoY2FsbFJlc3VsdCwgdmFsdWUpXG5cbiAgICB0aGlzLmFzc2VydChcbiAgICAgIG50aENhbGxSZXR1cm4sXG4gICAgICBgZXhwZWN0ZWQgJHtvcmRpbmFsQ2FsbH0gXCIke3NweU5hbWV9XCIgY2FsbCB0byByZXR1cm4gI3tleHB9YCxcbiAgICAgIGBleHBlY3RlZCAke29yZGluYWxDYWxsfSBcIiR7c3B5TmFtZX1cIiBjYWxsIHRvIG5vdCByZXR1cm4gI3tleHB9YCxcbiAgICAgIHZhbHVlLFxuICAgICAgY2FsbFJlc3VsdCxcbiAgICApXG4gIH0pXG5cbiAgdXRpbHMuYWRkUHJvcGVydHkoY2hhaS5Bc3NlcnRpb24ucHJvdG90eXBlLCAncmVzb2x2ZXMnLCBmdW5jdGlvbih0aGlzOiBhbnkpIHtcbiAgICB1dGlscy5mbGFnKHRoaXMsICdwcm9taXNlJywgJ3Jlc29sdmVzJylcbiAgICBjb25zdCBvYmogPSB1dGlscy5mbGFnKHRoaXMsICdvYmplY3QnKVxuICAgIGNvbnN0IHByb3h5OiBhbnkgPSBuZXcgUHJveHkodGhpcywge1xuICAgICAgZ2V0OiAodGFyZ2V0LCBrZXksIHJlY2lldmVyKSA9PiB7XG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IFJlZmxlY3QuZ2V0KHRhcmdldCwga2V5LCByZWNpZXZlcilcblxuICAgICAgICBpZiAodHlwZW9mIHJlc3VsdCAhPT0gJ2Z1bmN0aW9uJylcbiAgICAgICAgICByZXR1cm4gcmVzdWx0IGluc3RhbmNlb2YgY2hhaS5Bc3NlcnRpb24gPyBwcm94eSA6IHJlc3VsdFxuXG4gICAgICAgIHJldHVybiBhc3luYyguLi5hcmdzOiBhbnlbXSkgPT4ge1xuICAgICAgICAgIHJldHVybiBvYmoudGhlbihcbiAgICAgICAgICAgICh2YWx1ZTogYW55KSA9PiB7XG4gICAgICAgICAgICAgIHV0aWxzLmZsYWcodGhpcywgJ29iamVjdCcsIHZhbHVlKVxuICAgICAgICAgICAgICByZXR1cm4gcmVzdWx0LmNhbGwodGhpcywgLi4uYXJncylcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAoZXJyOiBhbnkpID0+IHtcbiAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBwcm9taXNlIHJlamVjdGVkIFwiJHtlcnJ9XCIgaW5zdGVhZCBvZiByZXNvbHZpbmdgKVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICApXG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgfSlcblxuICAgIHJldHVybiBwcm94eVxuICB9KVxuXG4gIHV0aWxzLmFkZFByb3BlcnR5KGNoYWkuQXNzZXJ0aW9uLnByb3RvdHlwZSwgJ3JlamVjdHMnLCBmdW5jdGlvbih0aGlzOiBhbnkpIHtcbiAgICB1dGlscy5mbGFnKHRoaXMsICdwcm9taXNlJywgJ3JlamVjdHMnKVxuICAgIGNvbnN0IG9iaiA9IHV0aWxzLmZsYWcodGhpcywgJ29iamVjdCcpXG4gICAgY29uc3Qgd3JhcHBlciA9IHR5cGVvZiBvYmogPT09ICdmdW5jdGlvbicgPyBvYmooKSA6IG9iaiAvLyBmb3IgamVzdCBjb21wYXRcbiAgICBjb25zdCBwcm94eTogYW55ID0gbmV3IFByb3h5KHRoaXMsIHtcbiAgICAgIGdldDogKHRhcmdldCwga2V5LCByZWNpZXZlcikgPT4ge1xuICAgICAgICBjb25zdCByZXN1bHQgPSBSZWZsZWN0LmdldCh0YXJnZXQsIGtleSwgcmVjaWV2ZXIpXG5cbiAgICAgICAgaWYgKHR5cGVvZiByZXN1bHQgIT09ICdmdW5jdGlvbicpXG4gICAgICAgICAgcmV0dXJuIHJlc3VsdCBpbnN0YW5jZW9mIGNoYWkuQXNzZXJ0aW9uID8gcHJveHkgOiByZXN1bHRcblxuICAgICAgICByZXR1cm4gYXN5bmMoLi4uYXJnczogYW55W10pID0+IHtcbiAgICAgICAgICByZXR1cm4gd3JhcHBlci50aGVuKFxuICAgICAgICAgICAgKHZhbHVlOiBhbnkpID0+IHtcbiAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBwcm9taXNlIHJlc29sdmVkIFwiJHt2YWx1ZX1cIiBpbnN0ZWFkIG9mIHJlamVjdGluZ2ApXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgKGVycjogYW55KSA9PiB7XG4gICAgICAgICAgICAgIHV0aWxzLmZsYWcodGhpcywgJ29iamVjdCcsIGVycilcbiAgICAgICAgICAgICAgcmV0dXJuIHJlc3VsdC5jYWxsKHRoaXMsIC4uLmFyZ3MpXG4gICAgICAgICAgICB9LFxuICAgICAgICAgIClcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICB9KVxuXG4gICAgcmV0dXJuIHByb3h5XG4gIH0pXG5cbiAgdXRpbHMuYWRkTWV0aG9kKFxuICAgIGNoYWkuZXhwZWN0LFxuICAgICdhc3NlcnRpb25zJyxcbiAgICBmdW5jdGlvbiBhc3NlcnRpb25zKGV4cGVjdGVkOiBudW1iZXIpIHtcbiAgICAgIGNvbnN0IGVycm9yID0gbmV3IEVycm9yKGBleHBlY3RlZCBudW1iZXIgb2YgYXNzZXJ0aW9ucyB0byBiZSAke2V4cGVjdGVkfSwgYnV0IGdvdCAke2dldFN0YXRlKCkuYXNzZXJ0aW9uQ2FsbHN9YClcbiAgICAgIGlmIChFcnJvci5jYXB0dXJlU3RhY2tUcmFjZSlcbiAgICAgICAgRXJyb3IuY2FwdHVyZVN0YWNrVHJhY2UoZXJyb3IsIGFzc2VydGlvbnMpXG5cbiAgICAgIHNldFN0YXRlKHtcbiAgICAgICAgZXhwZWN0ZWRBc3NlcnRpb25zTnVtYmVyOiBleHBlY3RlZCxcbiAgICAgICAgZXhwZWN0ZWRBc3NlcnRpb25zTnVtYmVyRXJyb3I6IGVycm9yLFxuICAgICAgfSlcbiAgICB9LFxuICApXG5cbiAgdXRpbHMuYWRkTWV0aG9kKFxuICAgIGNoYWkuZXhwZWN0LFxuICAgICdoYXNBc3NlcnRpb25zJyxcbiAgICBmdW5jdGlvbiBoYXNBc3NlcnRpb25zKCkge1xuICAgICAgY29uc3QgZXJyb3IgPSBuZXcgRXJyb3IoJ2V4cGVjdGVkIGFueSBudW1iZXIgb2YgYXNzZXJ0aW9uLCBidXQgZ290IG5vbmUnKVxuICAgICAgaWYgKEVycm9yLmNhcHR1cmVTdGFja1RyYWNlKVxuICAgICAgICBFcnJvci5jYXB0dXJlU3RhY2tUcmFjZShlcnJvciwgaGFzQXNzZXJ0aW9ucylcblxuICAgICAgc2V0U3RhdGUoe1xuICAgICAgICBpc0V4cGVjdGluZ0Fzc2VydGlvbnM6IHRydWUsXG4gICAgICAgIGlzRXhwZWN0aW5nQXNzZXJ0aW9uc0Vycm9yOiBlcnJvcixcbiAgICAgIH0pXG4gICAgfSxcbiAgKVxuXG4gIHV0aWxzLmFkZE1ldGhvZChcbiAgICBjaGFpLmV4cGVjdCxcbiAgICAnYWRkU25hcHNob3RTZXJpYWxpemVyJyxcbiAgICBhZGRTZXJpYWxpemVyLFxuICApXG59XG4iLCIoZnVuY3Rpb24gKGdsb2JhbCwgZmFjdG9yeSkge1xuICAgIHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0JyAmJiB0eXBlb2YgbW9kdWxlICE9PSAndW5kZWZpbmVkJyA/IGZhY3RvcnkoZXhwb3J0cykgOlxuICAgIHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCA/IGRlZmluZShbJ2V4cG9ydHMnXSwgZmFjdG9yeSkgOlxuICAgIChnbG9iYWwgPSB0eXBlb2YgZ2xvYmFsVGhpcyAhPT0gJ3VuZGVmaW5lZCcgPyBnbG9iYWxUaGlzIDogZ2xvYmFsIHx8IHNlbGYsIGZhY3RvcnkoZ2xvYmFsLk1vY2tEYXRlID0ge30pKTtcbn0odGhpcywgKGZ1bmN0aW9uIChleHBvcnRzKSB7ICd1c2Ugc3RyaWN0JztcblxuICAgIC8qISAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxyXG4gICAgQ29weXJpZ2h0IChjKSBNaWNyb3NvZnQgQ29ycG9yYXRpb24uXHJcblxyXG4gICAgUGVybWlzc2lvbiB0byB1c2UsIGNvcHksIG1vZGlmeSwgYW5kL29yIGRpc3RyaWJ1dGUgdGhpcyBzb2Z0d2FyZSBmb3IgYW55XHJcbiAgICBwdXJwb3NlIHdpdGggb3Igd2l0aG91dCBmZWUgaXMgaGVyZWJ5IGdyYW50ZWQuXHJcblxyXG4gICAgVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiBBTkQgVEhFIEFVVEhPUiBESVNDTEFJTVMgQUxMIFdBUlJBTlRJRVMgV0lUSFxyXG4gICAgUkVHQVJEIFRPIFRISVMgU09GVFdBUkUgSU5DTFVESU5HIEFMTCBJTVBMSUVEIFdBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZXHJcbiAgICBBTkQgRklUTkVTUy4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFIEFVVEhPUiBCRSBMSUFCTEUgRk9SIEFOWSBTUEVDSUFMLCBESVJFQ1QsXHJcbiAgICBJTkRJUkVDVCwgT1IgQ09OU0VRVUVOVElBTCBEQU1BR0VTIE9SIEFOWSBEQU1BR0VTIFdIQVRTT0VWRVIgUkVTVUxUSU5HIEZST01cclxuICAgIExPU1MgT0YgVVNFLCBEQVRBIE9SIFBST0ZJVFMsIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBORUdMSUdFTkNFIE9SXHJcbiAgICBPVEhFUiBUT1JUSU9VUyBBQ1RJT04sIEFSSVNJTkcgT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgVVNFIE9SXHJcbiAgICBQRVJGT1JNQU5DRSBPRiBUSElTIFNPRlRXQVJFLlxyXG4gICAgKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiogKi9cclxuICAgIC8qIGdsb2JhbCBSZWZsZWN0LCBQcm9taXNlICovXHJcblxyXG4gICAgdmFyIGV4dGVuZFN0YXRpY3MgPSBmdW5jdGlvbihkLCBiKSB7XHJcbiAgICAgICAgZXh0ZW5kU3RhdGljcyA9IE9iamVjdC5zZXRQcm90b3R5cGVPZiB8fFxyXG4gICAgICAgICAgICAoeyBfX3Byb3RvX186IFtdIH0gaW5zdGFuY2VvZiBBcnJheSAmJiBmdW5jdGlvbiAoZCwgYikgeyBkLl9fcHJvdG9fXyA9IGI7IH0pIHx8XHJcbiAgICAgICAgICAgIGZ1bmN0aW9uIChkLCBiKSB7IGZvciAodmFyIHAgaW4gYikgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChiLCBwKSkgZFtwXSA9IGJbcF07IH07XHJcbiAgICAgICAgcmV0dXJuIGV4dGVuZFN0YXRpY3MoZCwgYik7XHJcbiAgICB9O1xyXG5cclxuICAgIGZ1bmN0aW9uIF9fZXh0ZW5kcyhkLCBiKSB7XHJcbiAgICAgICAgaWYgKHR5cGVvZiBiICE9PSBcImZ1bmN0aW9uXCIgJiYgYiAhPT0gbnVsbClcclxuICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkNsYXNzIGV4dGVuZHMgdmFsdWUgXCIgKyBTdHJpbmcoYikgKyBcIiBpcyBub3QgYSBjb25zdHJ1Y3RvciBvciBudWxsXCIpO1xyXG4gICAgICAgIGV4dGVuZFN0YXRpY3MoZCwgYik7XHJcbiAgICAgICAgZnVuY3Rpb24gX18oKSB7IHRoaXMuY29uc3RydWN0b3IgPSBkOyB9XHJcbiAgICAgICAgZC5wcm90b3R5cGUgPSBiID09PSBudWxsID8gT2JqZWN0LmNyZWF0ZShiKSA6IChfXy5wcm90b3R5cGUgPSBiLnByb3RvdHlwZSwgbmV3IF9fKCkpO1xyXG4gICAgfVxuXG4gICAgdmFyIFJlYWxEYXRlID0gRGF0ZTtcclxuICAgIHZhciBub3cgPSBudWxsO1xyXG4gICAgdmFyIE1vY2tEYXRlID0gLyoqIEBjbGFzcyAqLyAoZnVuY3Rpb24gKF9zdXBlcikge1xyXG4gICAgICAgIF9fZXh0ZW5kcyhEYXRlLCBfc3VwZXIpO1xyXG4gICAgICAgIGZ1bmN0aW9uIERhdGUoeSwgbSwgZCwgaCwgTSwgcywgbXMpIHtcclxuICAgICAgICAgICAgX3N1cGVyLmNhbGwodGhpcykgfHwgdGhpcztcclxuICAgICAgICAgICAgdmFyIGRhdGU7XHJcbiAgICAgICAgICAgIHN3aXRjaCAoYXJndW1lbnRzLmxlbmd0aCkge1xyXG4gICAgICAgICAgICAgICAgY2FzZSAwOlxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChub3cgIT09IG51bGwpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGF0ZSA9IG5ldyBSZWFsRGF0ZShub3cudmFsdWVPZigpKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGUgPSBuZXcgUmVhbERhdGUoKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICBjYXNlIDE6XHJcbiAgICAgICAgICAgICAgICAgICAgZGF0ZSA9IG5ldyBSZWFsRGF0ZSh5KTtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgICAgICAgICAgZCA9IHR5cGVvZiBkID09PSAndW5kZWZpbmVkJyA/IDEgOiBkO1xyXG4gICAgICAgICAgICAgICAgICAgIGggPSBoIHx8IDA7XHJcbiAgICAgICAgICAgICAgICAgICAgTSA9IE0gfHwgMDtcclxuICAgICAgICAgICAgICAgICAgICBzID0gcyB8fCAwO1xyXG4gICAgICAgICAgICAgICAgICAgIG1zID0gbXMgfHwgMDtcclxuICAgICAgICAgICAgICAgICAgICBkYXRlID0gbmV3IFJlYWxEYXRlKHksIG0sIGQsIGgsIE0sIHMsIG1zKTtcclxuICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gZGF0ZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIERhdGU7XHJcbiAgICB9KFJlYWxEYXRlKSk7XHJcbiAgICBNb2NrRGF0ZS5wcm90b3R5cGUgPSBSZWFsRGF0ZS5wcm90b3R5cGU7XHJcbiAgICBNb2NrRGF0ZS5VVEMgPSBSZWFsRGF0ZS5VVEM7XHJcbiAgICBNb2NrRGF0ZS5ub3cgPSBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBNb2NrRGF0ZSgpLnZhbHVlT2YoKTtcclxuICAgIH07XHJcbiAgICBNb2NrRGF0ZS5wYXJzZSA9IGZ1bmN0aW9uIChkYXRlU3RyaW5nKSB7XHJcbiAgICAgICAgcmV0dXJuIFJlYWxEYXRlLnBhcnNlKGRhdGVTdHJpbmcpO1xyXG4gICAgfTtcclxuICAgIE1vY2tEYXRlLnRvU3RyaW5nID0gZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHJldHVybiBSZWFsRGF0ZS50b1N0cmluZygpO1xyXG4gICAgfTtcclxuICAgIGZ1bmN0aW9uIHNldChkYXRlKSB7XHJcbiAgICAgICAgdmFyIGRhdGVPYmogPSBuZXcgRGF0ZShkYXRlLnZhbHVlT2YoKSk7XHJcbiAgICAgICAgaWYgKGlzTmFOKGRhdGVPYmouZ2V0VGltZSgpKSkge1xyXG4gICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdtb2NrZGF0ZTogVGhlIHRpbWUgc2V0IGlzIGFuIGludmFsaWQgZGF0ZTogJyArIGRhdGUpO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvLyBAdHMtaWdub3JlXHJcbiAgICAgICAgRGF0ZSA9IE1vY2tEYXRlO1xyXG4gICAgICAgIG5vdyA9IGRhdGVPYmoudmFsdWVPZigpO1xyXG4gICAgfVxyXG4gICAgZnVuY3Rpb24gcmVzZXQoKSB7XHJcbiAgICAgICAgRGF0ZSA9IFJlYWxEYXRlO1xyXG4gICAgfVxyXG4gICAgdmFyIG1vY2tkYXRlID0ge1xyXG4gICAgICAgIHNldDogc2V0LFxyXG4gICAgICAgIHJlc2V0OiByZXNldCxcclxuICAgIH07XG5cbiAgICBleHBvcnRzLmRlZmF1bHQgPSBtb2NrZGF0ZTtcbiAgICBleHBvcnRzLnJlc2V0ID0gcmVzZXQ7XG4gICAgZXhwb3J0cy5zZXQgPSBzZXQ7XG5cbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7IHZhbHVlOiB0cnVlIH0pO1xuXG59KSkpO1xuIiwiLy8gVE9ETyBzZXRJbW1lZGlhdGUsIG5leHRUaWNrLCByZXF1ZXN0QW5pbWF0aW9uRnJhbWUsIGNhbmNlbEFuaW1hdGlvbkZyYW1lXG4vLyBUT0RPIGFzeW5jIHRpbWVyc1xuXG5pbXBvcnQgdHlwZSB7IEplc3RNb2NrQ29tcGF0IH0gZnJvbSAnLi9qZXN0LW1vY2snXG5pbXBvcnQgeyBzcHlPbiB9IGZyb20gJy4vamVzdC1tb2NrJ1xuXG5jb25zdCBvcmlnaW5hbFNldFRpbWVvdXQgPSBnbG9iYWwuc2V0VGltZW91dFxuY29uc3Qgb3JpZ2luYWxTZXRJbnRlcnZhbCA9IGdsb2JhbC5zZXRJbnRlcnZhbFxuY29uc3Qgb3JpZ2luYWxDbGVhclRpbWVvdXQgPSBnbG9iYWwuY2xlYXJUaW1lb3V0XG5jb25zdCBvcmlnaW5hbENsZWFySW50ZXJ2YWwgPSBnbG9iYWwuY2xlYXJJbnRlcnZhbFxuXG50eXBlIEFyZ3VtZW50cyA9IFtjYjogKGFyZ3M6IHZvaWQpID0+IHZvaWQsIG1zPzogbnVtYmVyIHwgdW5kZWZpbmVkXVxuXG5jb25zdCBNQVhfTE9PUFMgPSAxMF8wMDBcblxuaW50ZXJmYWNlIEZha2VDYWxsIHtcbiAgY2I6ICgpID0+IGFueVxuICBtczogbnVtYmVyXG4gIGlkOiBudW1iZXJcbiAgbmVzdGVkTXM6IG51bWJlclxuICBzY29wZUlkOiBudW1iZXJcbn1cblxuZW51bSBRdWV1ZVRhc2tUeXBlIHtcbiAgSW50ZXJ2YWwgPSAnaW50ZXJ2YWwnLFxuICBUaW1lb3V0ID0gJ3RpbWVvdXQnLFxuICBJbW1lZGlhdGUgPSAnaW1tZWRpYXRlJyxcbn1cblxuaW50ZXJmYWNlIFF1ZXVlVGFzayB7XG4gIHR5cGU6IFF1ZXVlVGFza1R5cGVcbiAgY2FsbDogRmFrZUNhbGxcbiAgbmVzdGVkOiBib29sZWFuXG59XG5cbmNvbnN0IGFzc2VydEV2ZXJ5ID0gKGFzc2VydGlvbnM6IGFueVtdLCBtZXNzYWdlOiBzdHJpbmcpID0+IHtcbiAgaWYgKGFzc2VydGlvbnMuc29tZShhID0+ICFhKSlcbiAgICB0aHJvdyBuZXcgRXJyb3IobWVzc2FnZSlcbn1cblxuY29uc3QgYXNzZXJ0TWF4TG9vcCA9ICh0aW1lczogbnVtYmVyKSA9PiB7XG4gIGlmICh0aW1lcyA+PSBNQVhfTE9PUFMpXG4gICAgdGhyb3cgbmV3IEVycm9yKCdzZXRUaW1lb3V0L3NldEludGVydmFsIGNhbGxlZCAxMCAwMDAgdGltZXMuIEl0XFwncyBwb3NzaWJsZSBpdCBzdHVjayBpbiBhbiBpbmZpbml0ZSBsb29wLicpXG59XG5cbi8vIFRPRE8gc2hvdWxkIGRvIHdoYXQgTm9kZUpTLlRpbWVvdXQgZG9lcyBvbiByZWZyZXNoXG5jb25zdCBnZXROb2RlVGltZW91dCA9IChpZDogbnVtYmVyKTogTm9kZUpTLlRpbWVvdXQgPT4ge1xuICBjb25zdCB0aW1lciA9IHtcbiAgICByZWY6ICgpID0+IHRpbWVyLFxuICAgIHVucmVmOiAoKSA9PiB0aW1lcixcbiAgICBoYXNSZWY6ICgpID0+IHRydWUsXG4gICAgcmVmcmVzaDogKCkgPT4gdGltZXIsXG4gICAgW1N5bWJvbC50b1ByaW1pdGl2ZV06ICgpID0+IGlkLFxuICB9XG5cbiAgcmV0dXJuIHRpbWVyXG59XG5cbmV4cG9ydCBjbGFzcyBGYWtlVGltZXJzIHtcbiAgcHJpdmF0ZSBfc2V0VGltZW91dCE6IEplc3RNb2NrQ29tcGF0PEFyZ3VtZW50cywgTm9kZUpTLlRpbWVvdXQ+XG4gIHByaXZhdGUgX3NldEludGVydmFsITogSmVzdE1vY2tDb21wYXQ8QXJndW1lbnRzLCBOb2RlSlMuVGltZW91dD5cblxuICBwcml2YXRlIF9jbGVhclRpbWVvdXQhOiBKZXN0TW9ja0NvbXBhdDxbTm9kZUpTLlRpbWVvdXRdLCB2b2lkPlxuICBwcml2YXRlIF9jbGVhckludGVydmFsITogSmVzdE1vY2tDb21wYXQ8W05vZGVKUy5UaW1lb3V0XSwgdm9pZD5cblxuICBwcml2YXRlIF9hZHZhbmNlZFRpbWUgPSAwXG4gIHByaXZhdGUgX25lc3RlZFRpbWU6IFJlY29yZDxzdHJpbmcsIG51bWJlcj4gPSB7fVxuICBwcml2YXRlIF9zY29wZUlkID0gMFxuICBwcml2YXRlIF9pc05lc3RlZCA9IGZhbHNlXG4gIHByaXZhdGUgX2lzT25seVBlbmRpbmcgPSBmYWxzZVxuXG4gIHByaXZhdGUgX3NweWlkID0gMFxuXG4gIHByaXZhdGUgX2lzTW9ja2VkID0gZmFsc2VcblxuICBwcml2YXRlIF90YXNrc1F1ZXVlOiBRdWV1ZVRhc2tbXSA9IFtdXG4gIHByaXZhdGUgX3F1ZXVlQ291bnQgPSAwXG5cbiAgcHVibGljIHVzZUZha2VUaW1lcnMoKSB7XG4gICAgdGhpcy5faXNNb2NrZWQgPSB0cnVlXG5cbiAgICB0aGlzLnJlc2V0KClcblxuICAgIGNvbnN0IHNweUZhY3RvcnkgPSAoc3B5VHlwZTogUXVldWVUYXNrVHlwZSwgcmVzdWx0QnVpbGRlcjogKGlkOiBudW1iZXIsIGNiOiAoYXJnczogdm9pZCkgPT4gdm9pZCkgPT4gYW55KSA9PiB7XG4gICAgICByZXR1cm4gKGNiOiAoYXJnczogdm9pZCkgPT4gdm9pZCwgbXMgPSAwKSA9PiB7XG4gICAgICAgIGNvbnN0IGlkID0gKyt0aGlzLl9zcHlpZFxuICAgICAgICAvLyBhbGwgdGltZXJzIHVwIHVudGlsIHRoaXMgcG9pbnRcbiAgICAgICAgY29uc3QgbmVzdGVkVG8gPSBPYmplY3QuZW50cmllcyh0aGlzLl9uZXN0ZWRUaW1lKS5maWx0ZXIoKFtrZXldKSA9PiBOdW1iZXIoa2V5KSA8PSB0aGlzLl9zY29wZUlkKVxuICAgICAgICBjb25zdCBuZXN0ZWRNcyA9IG5lc3RlZFRvLnJlZHVjZSgodG90YWwsIFssIG1zXSkgPT4gdG90YWwgKyBtcywgbXMpXG4gICAgICAgIGNvbnN0IGNhbGw6IEZha2VDYWxsID0geyBpZCwgY2IsIG1zLCBuZXN0ZWRNcywgc2NvcGVJZDogdGhpcy5fc2NvcGVJZCB9XG4gICAgICAgIGNvbnN0IHRhc2sgPSB7IHR5cGU6IHNweVR5cGUsIGNhbGwsIG5lc3RlZDogdGhpcy5faXNOZXN0ZWQgfVxuXG4gICAgICAgIHRoaXMucHVzaFRhc2sodGFzaylcblxuICAgICAgICByZXR1cm4gcmVzdWx0QnVpbGRlcihpZCwgY2IpXG4gICAgICB9XG4gICAgfVxuXG4gICAgdGhpcy5fc2V0VGltZW91dCA9IHNweU9uKGdsb2JhbCwgJ3NldFRpbWVvdXQnKS5tb2NrSW1wbGVtZW50YXRpb24oc3B5RmFjdG9yeShRdWV1ZVRhc2tUeXBlLlRpbWVvdXQsIGdldE5vZGVUaW1lb3V0KSlcbiAgICB0aGlzLl9zZXRJbnRlcnZhbCA9IHNweU9uKGdsb2JhbCwgJ3NldEludGVydmFsJykubW9ja0ltcGxlbWVudGF0aW9uKHNweUZhY3RvcnkoUXVldWVUYXNrVHlwZS5JbnRlcnZhbCwgZ2V0Tm9kZVRpbWVvdXQpKVxuXG4gICAgY29uc3QgY2xlYXJUaW1lckZhY3RvcnkgPSAoc3B5VHlwZTogUXVldWVUYXNrVHlwZSkgPT4gKGlkOiBudW1iZXIgfCB1bmRlZmluZWQgfCBOb2RlSlMuVGltZW91dCkgPT4ge1xuICAgICAgaWYgKGlkID09PSB1bmRlZmluZWQpIHJldHVyblxuXG4gICAgICBjb25zdCBpbmRleCA9IHRoaXMuX3Rhc2tzUXVldWUuZmluZEluZGV4KCh7IGNhbGwsIHR5cGUgfSkgPT4gdHlwZSA9PT0gc3B5VHlwZSAmJiBjYWxsLmlkID09PSBOdW1iZXIoaWQpKVxuXG4gICAgICBpZiAoaW5kZXggIT09IC0xKVxuICAgICAgICB0aGlzLl90YXNrc1F1ZXVlLnNwbGljZShpbmRleCwgMSlcbiAgICB9XG5cbiAgICB0aGlzLl9jbGVhclRpbWVvdXQgPSBzcHlPbihnbG9iYWwsICdjbGVhclRpbWVvdXQnKS5tb2NrSW1wbGVtZW50YXRpb24oY2xlYXJUaW1lckZhY3RvcnkoUXVldWVUYXNrVHlwZS5UaW1lb3V0KSlcbiAgICB0aGlzLl9jbGVhckludGVydmFsID0gc3B5T24oZ2xvYmFsLCAnY2xlYXJJbnRlcnZhbCcpLm1vY2tJbXBsZW1lbnRhdGlvbihjbGVhclRpbWVyRmFjdG9yeShRdWV1ZVRhc2tUeXBlLkludGVydmFsKSlcbiAgfVxuXG4gIHB1YmxpYyB1c2VSZWFsVGltZXJzKCkge1xuICAgIHRoaXMuX2lzTW9ja2VkID0gZmFsc2VcblxuICAgIHRoaXMucmVzZXQoKVxuXG4gICAgZ2xvYmFsLnNldFRpbWVvdXQgPSBvcmlnaW5hbFNldFRpbWVvdXRcbiAgICBnbG9iYWwuc2V0SW50ZXJ2YWwgPSBvcmlnaW5hbFNldEludGVydmFsXG4gICAgZ2xvYmFsLmNsZWFyVGltZW91dCA9IG9yaWdpbmFsQ2xlYXJUaW1lb3V0XG4gICAgZ2xvYmFsLmNsZWFySW50ZXJ2YWwgPSBvcmlnaW5hbENsZWFySW50ZXJ2YWxcbiAgfVxuXG4gIHB1YmxpYyBydW5Pbmx5UGVuZGluZ1RpbWVycygpOiB2b2lkIHwgUHJvbWlzZTx2b2lkPiB7XG4gICAgdGhpcy5hc3NlcnRNb2NrZWQoKVxuXG4gICAgdGhpcy5faXNPbmx5UGVuZGluZyA9IHRydWVcbiAgICB0aGlzLnJ1blF1ZXVlKClcbiAgfVxuXG4gIHB1YmxpYyBydW5BbGxUaW1lcnMoKTogdm9pZCB8IFByb21pc2U8dm9pZD4ge1xuICAgIHRoaXMuYXNzZXJ0TW9ja2VkKClcblxuICAgIHRoaXMucnVuUXVldWUoKVxuICB9XG5cbiAgcHVibGljIGFkdmFuY2VUaW1lcnNCeVRpbWUobXM6IG51bWJlcik6IHZvaWQgfCBQcm9taXNlPHZvaWQ+IHtcbiAgICB0aGlzLmFzc2VydE1vY2tlZCgpXG5cbiAgICB0aGlzLl9hZHZhbmNlZFRpbWUgKz0gbXNcbiAgICB0aGlzLnJ1blF1ZXVlKClcbiAgfVxuXG4gIHB1YmxpYyBhZHZhbmNlVGltZXJzVG9OZXh0VGltZXIoKTogdm9pZCB8IFByb21pc2U8dm9pZD4ge1xuICAgIHRoaXMuYXNzZXJ0TW9ja2VkKClcblxuICAgIHRoaXMuY2FsbFF1ZXVlSXRlbSgwKVxuICB9XG5cbiAgcHVibGljIGdldFRpbWVyQ291bnQoKTogbnVtYmVyIHtcbiAgICB0aGlzLmFzc2VydE1vY2tlZCgpXG5cbiAgICByZXR1cm4gdGhpcy5fdGFza3NRdWV1ZS5sZW5ndGhcbiAgfVxuXG4gIHByaXZhdGUgcmVzZXQoKSB7XG4gICAgdGhpcy5fYWR2YW5jZWRUaW1lID0gMFxuICAgIHRoaXMuX25lc3RlZFRpbWUgPSB7fVxuICAgIHRoaXMuX2lzTmVzdGVkID0gZmFsc2VcbiAgICB0aGlzLl9pc09ubHlQZW5kaW5nID0gZmFsc2VcbiAgICB0aGlzLl9zcHlpZCA9IDBcbiAgICB0aGlzLl9xdWV1ZUNvdW50ID0gMFxuICAgIHRoaXMuX3Rhc2tzUXVldWUgPSBbXVxuXG4gICAgdGhpcy5fY2xlYXJJbnRlcnZhbD8ubW9ja1Jlc3RvcmUoKVxuICAgIHRoaXMuX2NsZWFyVGltZW91dD8ubW9ja1Jlc3RvcmUoKVxuICAgIHRoaXMuX3NldEludGVydmFsPy5tb2NrUmVzdG9yZSgpXG4gICAgdGhpcy5fc2V0VGltZW91dD8ubW9ja1Jlc3RvcmUoKVxuICB9XG5cbiAgcHJpdmF0ZSBjYWxsUXVldWVJdGVtKGluZGV4OiBudW1iZXIpIHtcbiAgICBjb25zdCB0YXNrID0gdGhpcy5fdGFza3NRdWV1ZVtpbmRleF1cblxuICAgIGlmICghdGFzaykgcmV0dXJuXG5cbiAgICBjb25zdCB7IGNhbGwsIHR5cGUgfSA9IHRhc2tcblxuICAgIHRoaXMuX3Njb3BlSWQgPSBjYWxsLmlkXG4gICAgdGhpcy5faXNOZXN0ZWQgPSB0cnVlXG5cbiAgICB0aGlzLl9uZXN0ZWRUaW1lW2NhbGwuaWRdID8/PSAwXG4gICAgdGhpcy5fbmVzdGVkVGltZVtjYWxsLmlkXSArPSBjYWxsLm1zXG5cbiAgICBpZiAodHlwZSA9PT0gJ3RpbWVvdXQnKSB7XG4gICAgICB0aGlzLnJlbW92ZVRhc2soaW5kZXgpXG4gICAgfVxuICAgIGVsc2UgaWYgKHR5cGUgPT09ICdpbnRlcnZhbCcpIHtcbiAgICAgIGNhbGwubmVzdGVkTXMgKz0gY2FsbC5tc1xuICAgICAgY29uc3QgbmVzdGVkTXMgPSBjYWxsLm5lc3RlZE1zXG4gICAgICBjb25zdCBjbG9zZXN0VGFzayA9IHRoaXMuX3Rhc2tzUXVldWUuZmluZEluZGV4KCh7IHR5cGUsIGNhbGwgfSkgPT4gdHlwZSA9PT0gJ2ludGVydmFsJyAmJiBjYWxsLm5lc3RlZE1zIDwgbmVzdGVkTXMpXG5cbiAgICAgIGlmIChjbG9zZXN0VGFzayAhPT0gLTEgJiYgY2xvc2VzdFRhc2sgIT09IGluZGV4KVxuICAgICAgICB0aGlzLmVuc3VyZVF1ZXVlT3JkZXIoKVxuICAgIH1cblxuICAgIGNhbGwuY2IoKVxuXG4gICAgdGhpcy5fcXVldWVDb3VudCsrXG4gIH1cblxuICBwcml2YXRlIHJ1blF1ZXVlKCkge1xuICAgIGxldCBpbmRleCA9IDBcbiAgICB3aGlsZSAodGhpcy5fdGFza3NRdWV1ZVtpbmRleF0pIHtcbiAgICAgIGFzc2VydE1heExvb3AodGhpcy5fcXVldWVDb3VudClcblxuICAgICAgY29uc3QgeyBjYWxsLCBuZXN0ZWQgfSA9IHRoaXMuX3Rhc2tzUXVldWVbaW5kZXhdXG5cbiAgICAgIGlmICh0aGlzLl9hZHZhbmNlZFRpbWUgJiYgY2FsbC5uZXN0ZWRNcyA+IHRoaXMuX2FkdmFuY2VkVGltZSlcbiAgICAgICAgYnJlYWtcblxuICAgICAgaWYgKHRoaXMuX2lzT25seVBlbmRpbmcgJiYgbmVzdGVkKSB7XG4gICAgICAgIGluZGV4KytcbiAgICAgICAgY29udGludWVcbiAgICAgIH1cblxuICAgICAgdGhpcy5jYWxsUXVldWVJdGVtKGluZGV4KVxuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgcmVtb3ZlVGFzayhpbmRleDogbnVtYmVyKSB7XG4gICAgaWYgKGluZGV4ID09PSAwKVxuICAgICAgdGhpcy5fdGFza3NRdWV1ZS5zaGlmdCgpXG4gICAgZWxzZVxuICAgICAgdGhpcy5fdGFza3NRdWV1ZS5zcGxpY2UoaW5kZXgsIDEpXG4gIH1cblxuICBwcml2YXRlIHB1c2hUYXNrKHRhc2s6IFF1ZXVlVGFzaykge1xuICAgIHRoaXMuX3Rhc2tzUXVldWUucHVzaCh0YXNrKVxuICAgIHRoaXMuZW5zdXJlUXVldWVPcmRlcigpXG4gIH1cblxuICBwcml2YXRlIGVuc3VyZVF1ZXVlT3JkZXIoKSB7XG4gICAgdGhpcy5fdGFza3NRdWV1ZS5zb3J0KCh0MSwgdDIpID0+IHtcbiAgICAgIGNvbnN0IGRpZmYgPSB0MS5jYWxsLm5lc3RlZE1zIC0gdDIuY2FsbC5uZXN0ZWRNc1xuXG4gICAgICBpZiAoZGlmZiA9PT0gMCkge1xuICAgICAgICBpZiAodDEudHlwZSA9PT0gUXVldWVUYXNrVHlwZS5JbW1lZGlhdGUgJiYgdDIudHlwZSAhPT0gUXVldWVUYXNrVHlwZS5JbW1lZGlhdGUpXG4gICAgICAgICAgcmV0dXJuIDFcblxuICAgICAgICByZXR1cm4gMFxuICAgICAgfVxuXG4gICAgICByZXR1cm4gZGlmZlxuICAgIH0pXG4gIH1cblxuICBwcml2YXRlIGFzc2VydE1vY2tlZCgpIHtcbiAgICBhc3NlcnRFdmVyeShbXG4gICAgICB0aGlzLl9pc01vY2tlZCxcbiAgICAgIHRoaXMuX3NldFRpbWVvdXQsXG4gICAgICB0aGlzLl9zZXRJbnRlcnZhbCxcbiAgICAgIHRoaXMuX2NsZWFyVGltZW91dCxcbiAgICAgIHRoaXMuX2NsZWFySW50ZXJ2YWwsXG4gICAgXSwgJ3RpbWVycyBhcmUgbm90IG1vY2tlZC4gdHJ5IGNhbGxpbmcgXCJ2aS51c2VGYWtlVGltZXJzKClcIiBmaXJzdCcpXG4gIH1cbn1cbiIsIi8qIGVzbGludC1kaXNhYmxlIEB0eXBlc2NyaXB0LWVzbGludC9uby11bnVzZWQtdmFycyAqL1xuXG5pbXBvcnQgbW9ja2RhdGUgZnJvbSAnbW9ja2RhdGUnXG5pbXBvcnQgeyBGYWtlVGltZXJzIH0gZnJvbSAnLi90aW1lcnMnXG5pbXBvcnQgdHlwZSB7IEVuaGFuY2VkU3B5LCBNYXliZU1vY2tlZCwgTWF5YmVNb2NrZWREZWVwIH0gZnJvbSAnLi9qZXN0LW1vY2snXG5pbXBvcnQgeyBmbiwgaXNNb2NrRnVuY3Rpb24sIHNwaWVzLCBzcHlPbiB9IGZyb20gJy4vamVzdC1tb2NrJ1xuXG5jbGFzcyBWaXRlc3RVdGlscyB7XG4gIHByaXZhdGUgX3RpbWVyczogRmFrZVRpbWVyc1xuICBwcml2YXRlIF9tb2NrZWREYXRlOiBzdHJpbmcgfCBudW1iZXIgfCBEYXRlIHwgbnVsbFxuXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMuX3RpbWVycyA9IG5ldyBGYWtlVGltZXJzKClcbiAgICB0aGlzLl9tb2NrZWREYXRlID0gbnVsbFxuICB9XG5cbiAgLy8gdGltZXJzXG5cbiAgcHVibGljIHVzZUZha2VUaW1lcnMoKSB7XG4gICAgcmV0dXJuIHRoaXMuX3RpbWVycy51c2VGYWtlVGltZXJzKClcbiAgfVxuXG4gIHB1YmxpYyB1c2VSZWFsVGltZXJzKCkge1xuICAgIHJldHVybiB0aGlzLl90aW1lcnMudXNlUmVhbFRpbWVycygpXG4gIH1cblxuICBwdWJsaWMgcnVuT25seVBlbmRpbmdUaW1lcnMoKSB7XG4gICAgcmV0dXJuIHRoaXMuX3RpbWVycy5ydW5Pbmx5UGVuZGluZ1RpbWVycygpXG4gIH1cblxuICBwdWJsaWMgcnVuQWxsVGltZXJzKCkge1xuICAgIHJldHVybiB0aGlzLl90aW1lcnMucnVuQWxsVGltZXJzKClcbiAgfVxuXG4gIHB1YmxpYyBhZHZhbmNlVGltZXJzQnlUaW1lKG1zOiBudW1iZXIpIHtcbiAgICByZXR1cm4gdGhpcy5fdGltZXJzLmFkdmFuY2VUaW1lcnNCeVRpbWUobXMpXG4gIH1cblxuICBwdWJsaWMgYWR2YW5jZVRpbWVyc1RvTmV4dFRpbWVyKCkge1xuICAgIHJldHVybiB0aGlzLl90aW1lcnMuYWR2YW5jZVRpbWVyc1RvTmV4dFRpbWVyKClcbiAgfVxuXG4gIHB1YmxpYyBnZXRUaW1lckNvdW50KCkge1xuICAgIHJldHVybiB0aGlzLl90aW1lcnMuZ2V0VGltZXJDb3VudCgpXG4gIH1cblxuICAvLyBkYXRlXG5cbiAgcHVibGljIG1vY2tDdXJyZW50RGF0ZShkYXRlOiBzdHJpbmcgfCBudW1iZXIgfCBEYXRlKSB7XG4gICAgdGhpcy5fbW9ja2VkRGF0ZSA9IGRhdGVcbiAgICBtb2NrZGF0ZS5zZXQoZGF0ZSlcbiAgfVxuXG4gIHB1YmxpYyByZXN0b3JlQ3VycmVudERhdGUoKSB7XG4gICAgdGhpcy5fbW9ja2VkRGF0ZSA9IG51bGxcbiAgICBtb2NrZGF0ZS5yZXNldCgpXG4gIH1cblxuICBwdWJsaWMgZ2V0TW9ja2VkRGF0ZSgpIHtcbiAgICByZXR1cm4gdGhpcy5fbW9ja2VkRGF0ZVxuICB9XG5cbiAgLy8gbW9ja3NcblxuICBzcHlPbiA9IHNweU9uXG4gIGZuID0gZm5cblxuICAvLyBqdXN0IGhpbnRzIGZvciB0cmFuc2Zvcm1lciB0byByZXdyaXRlIGltcG9ydHNcblxuICAvKipcbiAgICogTWFrZXMgYWxsIGBpbXBvcnRzYCB0byBwYXNzZWQgbW9kdWxlIHRvIGJlIG1vY2tlZC5cbiAgICogLSBJZiB0aGVyZSBpcyBhIGZhY3RvcnksIHdpbGwgcmV0dXJuIGl0J3MgcmVzdWx0LiBUaGUgY2FsbCB0byBgdmkubW9ja2AgaXMgaG9pc3RlZCB0byB0aGUgdG9wIG9mIHRoZSBmaWxlLFxuICAgKiBzbyB5b3UgZG9uJ3QgaGF2ZSBhY2Nlc3MgdG8gdmFyaWFibGVzIGRlY2xhcmVkIGluIHRoZSBnbG9iYWwgZmlsZSBzY29wZSwgaWYgeW91IGRpZG4ndCBwdXQgdGhlbSBiZWZvcmUgaW1wb3J0cyFcbiAgICogLSBJZiBgX19tb2Nrc19fYCBmb2xkZXIgd2l0aCBmaWxlIG9mIHRoZSBzYW1lIG5hbWUgZXhpc3QsIGFsbCBpbXBvcnRzIHdpbGxcbiAgICogcmV0dXJuIGl0LlxuICAgKiAtIElmIHRoZXJlIGlzIG5vIGBfX21vY2tzX19gIGZvbGRlciBvciBhIGZpbGUgd2l0aCB0aGUgc2FtZSBuYW1lIGluc2lkZSwgd2lsbCBjYWxsIG9yaWdpbmFsXG4gICAqIG1vZHVsZSBhbmQgbW9jayBpdC5cbiAgICogQHBhcmFtIHBhdGggUGF0aCB0byB0aGUgbW9kdWxlLiBDYW4gYmUgYWxpYXNlZCwgaWYgeW91ciBjb25maWcgc3VwcG9ycyBpdFxuICAgKiBAcGFyYW0gZmFjdG9yeSBGYWN0b3J5IGZvciB0aGUgbW9ja2VkIG1vZHVsZS4gSGFzIHRoZSBoaWdoZXN0IHByaW9yaXR5LlxuICAgKi9cbiAgcHVibGljIG1vY2socGF0aDogc3RyaW5nLCBmYWN0b3J5PzogKCkgPT4gYW55KSB7fVxuICAvKipcbiAgICogUmVtb3ZlcyBtb2R1bGUgZnJvbSBtb2NrZWQgcmVnaXN0cnkuIEFsbCBzdWJzZXF1ZW50IGNhbGxzIHRvIGltcG9ydCB3aWxsXG4gICAqIHJldHVybiBvcmlnaW5hbCBtb2R1bGUgZXZlbiBpZiBpdCB3YXMgbW9ja2VkLlxuICAgKiBAcGFyYW0gcGF0aCBQYXRoIHRvIHRoZSBtb2R1bGUuIENhbiBiZSBhbGlhc2VkLCBpZiB5b3VyIGNvbmZpZyBzdXBwb3JzIGl0XG4gICAqL1xuICBwdWJsaWMgdW5tb2NrKHBhdGg6IHN0cmluZykge31cblxuICAvKipcbiAgICogSW1wb3J0cyBtb2R1bGUsIGJ5cGFzc2luZyBhbGwgY2hlY2tzIGlmIGl0IHNob3VsZCBiZSBtb2NrZWQuXG4gICAqIENhbiBiZSB1c2VmdWwgaWYgeW91IHdhbnQgdG8gbW9jayBtb2R1bGUgcGFydGlhbGx5LlxuICAgKiBAZXhhbXBsZVxuICAgKiB2aS5tb2NrKCcuL2V4YW1wbGUnLCBhc3luYyAoKSA9PiB7XG4gICAqICBjb25zdCBheGlvcyA9IGF3YWl0IHZpLmltcG9ydEFjdHVhbCgnLi9leGFtcGxlJylcbiAgICpcbiAgICogIHJldHVybiB7IC4uLmF4aW9zLCBnZXQ6IHZpLmZuKCkgfVxuICAgKiB9KVxuICAgKiBAcGFyYW0gcGF0aCBQYXRoIHRvIHRoZSBtb2R1bGUuIENhbiBiZSBhbGlhc2VkLCBpZiB5b3VyIGNvbmZpZyBzdXBwb3JzIGl0XG4gICAqIEByZXR1cm5zIEFjdHVhbCBtb2R1bGUgd2l0aG91dCBzcGllc1xuICAgKi9cbiAgcHVibGljIGFzeW5jIGltcG9ydEFjdHVhbDxUPihwYXRoOiBzdHJpbmcpOiBQcm9taXNlPFQ+IHtcbiAgICByZXR1cm4ge30gYXMgVFxuICB9XG5cbiAgLyoqXG4gICAqIEltcG9ydHMgYSBtb2R1bGUgd2l0aCBhbGwgb2YgaXRzIHByb3BlcnRpZXMgYW5kIG5lc3RlZCBwcm9wZXJ0aWVzIG1vY2tlZC5cbiAgICogRm9yIHRoZSBydWxlcyBhcHBsaWVkLCBzZWUgZG9jcy5cbiAgICogQHBhcmFtIHBhdGggUGF0aCB0byB0aGUgbW9kdWxlLiBDYW4gYmUgYWxpYXNlZCwgaWYgeW91ciBjb25maWcgc3VwcG9ycyBpdFxuICAgKiBAcmV0dXJucyBGdWxseSBtb2NrZWQgbW9kdWxlXG4gICAqL1xuICBwdWJsaWMgYXN5bmMgaW1wb3J0TW9jazxUPihwYXRoOiBzdHJpbmcpOiBQcm9taXNlPE1heWJlTW9ja2VkRGVlcDxUPj4ge1xuICAgIHJldHVybiB7fSBhcyBNYXliZU1vY2tlZERlZXA8VD5cbiAgfVxuXG4gIC8qKlxuICAgKiBUeXBlIGhlbHBlcnMgZm9yIFR5cGVTY3JpcHQuIEluIHJlYWxpdHkganVzdCByZXR1cm5zIHRoZSBvYmplY3QgdGhhdCB3YXMgcGFzc2VkLlxuICAgKiBAZXhhbXBsZVxuICAgKiBpbXBvcnQgZXhhbXBsZSBmcm9tICcuL2V4YW1wbGUnXG4gICAqIHZpLm1vY2soJy4vZXhhbXBsZScpXG4gICAqXG4gICAqIHRlc3QoJzErMSBlcXVhbHMgMicgYXN5bmMgKCkgPT4ge1xuICAgKiAgdmkubW9ja2VkKGV4YW1wbGUuY2FsYykubW9ja1Jlc3RvcmUoKVxuICAgKlxuICAgKiAgY29uc3QgcmVzID0gZXhhbXBsZS5jYWxjKDEsICcrJywgMSlcbiAgICpcbiAgICogIGV4cGVjdChyZXMpLnRvQmUoMilcbiAgICogfSlcbiAgICogQHBhcmFtIGl0ZW0gQW55dGhpbmcgdGhhdCBjYW4gYmUgbW9ja2VkXG4gICAqIEBwYXJhbSBkZWVwIElmIHRoZSBvYmplY3QgaXMgZGVlcGx5IG1vY2tlZFxuICAgKi9cbiAgcHVibGljIG1vY2tlZDxUPihpdGVtOiBULCBkZWVwPzogZmFsc2UpOiBNYXliZU1vY2tlZDxUPlxuICBwdWJsaWMgbW9ja2VkPFQ+KGl0ZW06IFQsIGRlZXA6IHRydWUpOiBNYXliZU1vY2tlZERlZXA8VD5cbiAgcHVibGljIG1vY2tlZDxUPihpdGVtOiBULCBfZGVlcCA9IGZhbHNlKTogTWF5YmVNb2NrZWQ8VD4gfCBNYXliZU1vY2tlZERlZXA8VD4ge1xuICAgIHJldHVybiBpdGVtIGFzIGFueVxuICB9XG5cbiAgcHVibGljIGlzTW9ja0Z1bmN0aW9uKGZuOiBhbnkpOiBmbiBpcyBFbmhhbmNlZFNweSB7XG4gICAgcmV0dXJuIGlzTW9ja0Z1bmN0aW9uKGZuKVxuICB9XG5cbiAgcHVibGljIGNsZWFyQWxsTW9ja3MoKSB7XG4gICAgLy8gQHRzLWV4cGVjdC1lcnJvciBjbGVhcmluZyBtb2R1bGUgbW9ja3NcbiAgICBfX3ZpdGVzdF9fY2xlYXJNb2Nrc19fKHsgY2xlYXJNb2NrczogdHJ1ZSB9KVxuICAgIHNwaWVzLmZvckVhY2goc3B5ID0+IHNweS5tb2NrQ2xlYXIoKSlcbiAgICByZXR1cm4gdGhpc1xuICB9XG5cbiAgcHVibGljIHJlc2V0QWxsTW9ja3MoKSB7XG4gICAgLy8gQHRzLWV4cGVjdC1lcnJvciByZXNldHRpbmcgbW9kdWxlIG1vY2tzXG4gICAgX192aXRlc3RfX2NsZWFyTW9ja3NfXyh7IG1vY2tSZXNldDogdHJ1ZSB9KVxuICAgIHNwaWVzLmZvckVhY2goc3B5ID0+IHNweS5tb2NrUmVzZXQoKSlcbiAgICByZXR1cm4gdGhpc1xuICB9XG5cbiAgcHVibGljIHJlc3RvcmVBbGxNb2NrcygpIHtcbiAgICAvLyBAdHMtZXhwZWN0LWVycm9yIHJlc3RvcmluZyBtb2R1bGUgbW9ja3NcbiAgICBfX3ZpdGVzdF9fY2xlYXJNb2Nrc19fKHsgcmVzdG9yZU1vY2tzOiB0cnVlIH0pXG4gICAgc3BpZXMuZm9yRWFjaChzcHkgPT4gc3B5Lm1vY2tSZXN0b3JlKCkpXG4gICAgcmV0dXJuIHRoaXNcbiAgfVxufVxuXG5leHBvcnQgY29uc3Qgdml0ZXN0ID0gbmV3IFZpdGVzdFV0aWxzKClcbmV4cG9ydCBjb25zdCB2aSA9IHZpdGVzdFxuIl0sIm5hbWVzIjpbInRlc3QiLCJBc3ltbWV0cmljTWF0Y2hlciIsIl9jb2xsZWN0aW9ucyIsInJlcXVpcmUkJDAiLCJnbG9iYWwiLCJTeW1ib2wiLCJTUEFDRSIsInNlcmlhbGl6ZSIsInBsdWdpbiIsIl9kZWZhdWx0IiwiX2ludGVyb3BSZXF1aXJlRGVmYXVsdCIsIl9hbnNpU3R5bGVzIiwicmVxdWlyZSQkMSIsIkRPTUNvbGxlY3Rpb24iLCJlc2NhcGVIVE1MXzEiLCJET01FbGVtZW50IiwiX21hcmt1cCIsIkltbXV0YWJsZSIsIklTX0tFWUVEX1NFTlRJTkVMIiwiSVNfT1JERVJFRF9TRU5USU5FTCIsIklTX1NFVF9TRU5USU5FTCIsInJlYWN0SXNNb2R1bGUiLCJSZWFjdEVsZW1lbnQiLCJnZXRQcm9wS2V5cyIsIlJlYWN0VGVzdENvbXBvbmVudCIsInJlcXVpcmUkJDIiLCJyZXF1aXJlJCQzIiwicmVxdWlyZSQkNCIsInJlcXVpcmUkJDUiLCJyZXF1aXJlJCQ2IiwicmVxdWlyZSQkNyIsInJlcXVpcmUkJDgiLCJwcmV0dHlGb3JtYXRQbHVnaW5zIiwiYXN5bW1ldHJpY0VxdWFscyIsInRoaXMiXSwibWFwcGluZ3MiOiI7Ozs7QUFBQSxJQUFJLFNBQVMsR0FBRyxNQUFNLENBQUMsY0FBYyxDQUFDO0FBQ3RDLElBQUksVUFBVSxHQUFHLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQztBQUN6QyxJQUFJLGlCQUFpQixHQUFHLE1BQU0sQ0FBQyx5QkFBeUIsQ0FBQztBQUN6RCxJQUFJLG1CQUFtQixHQUFHLE1BQU0sQ0FBQyxxQkFBcUIs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Q0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQztBQUN6SixHQUFHLFVBQVUsR0FBRyxPQUFPLE1BQU0sRUFBRSxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsbUJBQW1CLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLGdCQUFnQixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLHFCQUFxQixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsbUJBQW1CLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLHdCQUF3QixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxxQkFBcUIsRUFBQyxDQUFDO0FBQ2xjLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsUUFBUSxHQUFHLE9BQU8sQ0FBQyxFQUFFLElBQUksR0FBRyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLFFBQVEsT0FBTyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLFFBQVEsT0FBTyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyx1Q0FBd0IsQ0FBQyx3Q0FBeUIsQ0FBQyxnQ0FBaUIsQ0FBQyxtQ0FBb0IsQ0FBQyxpQ0FBa0IsQ0FBQyw2QkFBYyxDQUFDLDZCQUFjLENBQUMsK0JBQWdCLENBQUMsaUNBQWtCLENBQUMsbUNBQW9CLENBQUMsRUFBRTsrQkFDcGUsQ0FBQyxvQ0FBcUIsQ0FBQyxVQUFVLENBQUMsT0FBTSxDQUFDLENBQUMseUNBQTBCLENBQUMsVUFBVSxDQUFDLE9BQU0sQ0FBQyxDQUFDLDBDQUEyQixDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQywwQ0FBMkIsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsa0NBQW1CLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxPQUFNLFFBQVEsR0FBRyxPQUFPLENBQUMsRUFBRSxJQUFJLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxRQUFRLEdBQUcsQ0FBQyxxQ0FBc0IsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsbUNBQW9CLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLCtCQUFnQixDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQywrQkFBZ0IsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsRUFBRTsrQkFDcmQsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsbUNBQW9CLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLHFDQUFzQixDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxtQ0FBb0IsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsMkNBQTRCLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxPQUFNLFFBQVEsR0FBRyxPQUFPLENBQUMsRUFBRSxVQUFVLEdBQUcsT0FBTyxDQUFDLEVBQUUsQ0FB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
