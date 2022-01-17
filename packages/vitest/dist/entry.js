import fs, { promises } from 'fs';
import { Console } from 'console';
import { Writable } from 'stream';
import { importModule } from 'local-pkg';
import chai$1, { expect, util } from 'chai';
import { a as commonjsRequire, c as commonjsGlobal } from './_commonjsHelpers-c9e3b764.js';
import { c as index, a as relative } from './index-1964368a.js';
import { r as rpc } from './rpc-8c7cc374.js';
import { k as getCallLastIndex, s as slash, f as deepMerge, o as getNames, c, t as toArray, p as partitionSuiteChildren, q as hasTests, h as hasFailed, g as getFullName } from './index-59e12882.js';
import { f as format_1, h as getSerializers, j as equals, k as iterableEquality, l as subsetEquality, p as plugins_1, b as getState, m as isA, J as JestChaiExpect, n as clearContext, o as defaultSuite, q as setHooks, r as getHooks, u as context, s as setState, x as getFn, e as vi } from './vi-8389a542.js';
import { m as getOriginalPos, n as posToNumber, l as parseStacktrace, u as unifiedDiff } from './diff-19b42f85.js';
import { performance as performance$1 } from 'perf_hooks';
import { createHash } from 'crypto';
import { format } from 'util';
import 'path';
import 'tty';
import './jest-mock-113430de.js';
import 'tinyspy';

var node = {
  name: "node",
  async setup() {
    return {
      teardown() {
      }
    };
  }
};

const LIVING_KEYS = [
  "DOMException",
  "URL",
  "URLSearchParams",
  "EventTarget",
  "NamedNodeMap",
  "Node",
  "Attr",
  "Element",
  "DocumentFragment",
  "DOMImplementation",
  "Document",
  "XMLDocument",
  "CharacterData",
  "Text",
  "CDATASection",
  "ProcessingInstruction",
  "Comment",
  "DocumentType",
  "NodeList",
  "HTMLCollection",
  "HTMLOptionsCollection",
  "DOMStringMap",
  "DOMTokenList",
  "StyleSheetList",
  "HTMLElement",
  "HTMLHeadElement",
  "HTMLTitleElement",
  "HTMLBaseElement",
  "HTMLLinkElement",
  "HTMLMetaElement",
  "HTMLStyleElement",
  "HTMLBodyElement",
  "HTMLHeadingElement",
  "HTMLParagraphElement",
  "HTMLHRElement",
  "HTMLPreElement",
  "HTMLUListElement",
  "HTMLOListElement",
  "HTMLLIElement",
  "HTMLMenuElement",
  "HTMLDListElement",
  "HTMLDivElement",
  "HTMLAnchorElement",
  "HTMLAreaElement",
  "HTMLBRElement",
  "HTMLButtonElement",
  "HTMLCanvasElement",
  "HTMLDataElement",
  "HTMLDataListElement",
  "HTMLDetailsElement",
  "HTMLDialogElement",
  "HTMLDirectoryElement",
  "HTMLFieldSetElement",
  "HTMLFontElement",
  "HTMLFormElement",
  "HTMLHtmlElement",
  "HTMLImageElement",
  "HTMLInputElement",
  "HTMLLabelElement",
  "HTMLLegendElement",
  "HTMLMapElement",
  "HTMLMarqueeElement",
  "HTMLMediaElement",
  "HTMLMeterElement",
  "HTMLModElement",
  "HTMLOptGroupElement",
  "HTMLOptionElement",
  "HTMLOutputElement",
  "HTMLPictureElement",
  "HTMLProgressElement",
  "HTMLQuoteElement",
  "HTMLScriptElement",
  "HTMLSelectElement",
  "HTMLSlotElement",
  "HTMLSourceElement",
  "HTMLSpanElement",
  "HTMLTableCaptionElement",
  "HTMLTableCellElement",
  "HTMLTableColElement",
  "HTMLTableElement",
  "HTMLTimeElement",
  "HTMLTableRowElement",
  "HTMLTableSectionElement",
  "HTMLTemplateElement",
  "HTMLTextAreaElement",
  "HTMLUnknownElement",
  "HTMLFrameElement",
  "HTMLFrameSetElement",
  "HTMLIFrameElement",
  "HTMLEmbedElement",
  "HTMLObjectElement",
  "HTMLParamElement",
  "HTMLVideoElement",
  "HTMLAudioElement",
  "HTMLTrackElement",
  "SVGElement",
  "SVGGraphicsElement",
  "SVGSVGElement",
  "SVGTitleElement",
  "SVGAnimatedString",
  "SVGNumber",
  "SVGStringList",
  "Event",
  "CloseEvent",
  "CustomEvent",
  "MessageEvent",
  "ErrorEvent",
  "HashChangeEvent",
  "PopStateEvent",
  "StorageEvent",
  "ProgressEvent",
  "PageTransitionEvent",
  "UIEvent",
  "FocusEvent",
  "InputEvent",
  "MouseEvent",
  "KeyboardEvent",
  "TouchEvent",
  "CompositionEvent",
  "WheelEvent",
  "BarProp",
  "External",
  "Location",
  "History",
  "Screen",
  "Performance",
  "Navigator",
  "PluginArray",
  "MimeTypeArray",
  "Plugin",
  "MimeType",
  "FileReader",
  "Blob",
  "File",
  "FileList",
  "ValidityState",
  "DOMParser",
  "XMLSerializer",
  "FormData",
  "XMLHttpRequestEventTarget",
  "XMLHttpRequestUpload",
  "XMLHttpRequest",
  "WebSocket",
  "NodeFilter",
  "NodeIterator",
  "TreeWalker",
  "AbstractRange",
  "Range",
  "StaticRange",
  "Selection",
  "Storage",
  "CustomElementRegistry",
  "ShadowRoot",
  "MutationObserver",
  "MutationRecord",
  "Headers",
  "AbortController",
  "AbortSignal",
  "Image"
];
const OTHER_KEYS = [
  "addEventListener",
  "alert",
  "atob",
  "blur",
  "btoa",
  "close",
  "confirm",
  "createPopup",
  "dispatchEvent",
  "document",
  "focus",
  "frames",
  "getComputedStyle",
  "history",
  "innerHeight",
  "innerWidth",
  "length",
  "location",
  "matchMedia",
  "moveBy",
  "moveTo",
  "name",
  "navigator",
  "open",
  "outerHeight",
  "outerWidth",
  "pageXOffset",
  "pageYOffset",
  "parent",
  "postMessage",
  "print",
  "prompt",
  "removeEventListener",
  "resizeBy",
  "resizeTo",
  "screen",
  "screenLeft",
  "screenTop",
  "screenX",
  "screenY",
  "scroll",
  "scrollBy",
  "scrollLeft",
  "scrollTo",
  "scrollTop",
  "scrollX",
  "scrollY",
  "self",
  "stop",
  "top",
  "window"
];
const KEYS = LIVING_KEYS.concat(OTHER_KEYS);

var __defProp$3 = Object.defineProperty;
var __getOwnPropSymbols$3 = Object.getOwnPropertySymbols;
var __hasOwnProp$3 = Object.prototype.hasOwnProperty;
var __propIsEnum$3 = Object.prototype.propertyIsEnumerable;
var __defNormalProp$3 = (obj, key, value) => key in obj ? __defProp$3(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues$3 = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp$3.call(b, prop))
      __defNormalProp$3(a, prop, b[prop]);
  if (__getOwnPropSymbols$3)
    for (var prop of __getOwnPropSymbols$3(b)) {
      if (__propIsEnum$3.call(b, prop))
        __defNormalProp$3(a, prop, b[prop]);
    }
  return a;
};
var __objRest = (source, exclude) => {
  var target = {};
  for (var prop in source)
    if (__hasOwnProp$3.call(source, prop) && exclude.indexOf(prop) < 0)
      target[prop] = source[prop];
  if (source != null && __getOwnPropSymbols$3)
    for (var prop of __getOwnPropSymbols$3(source)) {
      if (exclude.indexOf(prop) < 0 && __propIsEnum$3.call(source, prop))
        target[prop] = source[prop];
    }
  return target;
};
var jsdom = {
  name: "jsdom",
  async setup(global, { jsdom = {} }) {
    const {
      CookieJar,
      JSDOM,
      ResourceLoader,
      VirtualConsole
    } = await importModule("jsdom");
    const _a = jsdom, {
      html = "<!DOCTYPE html>",
      userAgent,
      url = "http://localhost:3000",
      contentType = "text/html",
      pretendToBeVisual = true,
      includeNodeLocations = false,
      runScripts = "dangerously",
      resources,
      console = false,
      cookieJar = false
    } = _a, restOptions = __objRest(_a, [
      "html",
      "userAgent",
      "url",
      "contentType",
      "pretendToBeVisual",
      "includeNodeLocations",
      "runScripts",
      "resources",
      "console",
      "cookieJar"
    ]);
    const dom = new JSDOM(html, __spreadValues$3({
      pretendToBeVisual,
      resources: resources ?? (userAgent ? new ResourceLoader({ userAgent }) : void 0),
      runScripts,
      url,
      virtualConsole: console && global.console ? new VirtualConsole().sendTo(global.console) : void 0,
      cookieJar: cookieJar ? new CookieJar() : void 0,
      includeNodeLocations,
      contentType,
      userAgent
    }, restOptions));
    const keys = new Set(KEYS.concat(Object.getOwnPropertyNames(dom.window)).filter((k) => !k.startsWith("_") && !(k in global)));
    const overrideObject = new Map();
    for (const key of keys) {
      Object.defineProperty(global, key, {
        get() {
          if (overrideObject.has(key))
            return overrideObject.get(key);
          return dom.window[key];
        },
        set(v) {
          overrideObject.set(key, v);
        },
        configurable: true
      });
    }
    return {
      teardown(global2) {
        keys.forEach((key) => delete global2[key]);
      }
    };
  }
};

var happy = {
  name: "happy-dom",
  async setup(global) {
    const { Window } = await importModule("happy-dom");
    const win = new Window();
    const keys = new Set(KEYS.concat(Object.getOwnPropertyNames(win)).filter((k) => !k.startsWith("_") && !(k in global)));
    const overrideObject = new Map();
    for (const key of keys) {
      Object.defineProperty(global, key, {
        get() {
          if (overrideObject.has(key))
            return overrideObject.get(key);
          return win[key];
        },
        set(v) {
          overrideObject.set(key, v);
        },
        configurable: true
      });
    }
    return {
      teardown(global2) {
        win.happyDOM.cancelAsync();
        keys.forEach((key) => delete global2[key]);
      }
    };
  }
};

const environments = {
  node,
  jsdom,
  "happy-dom": happy
};

var chaiSubset = {exports: {}};

(function (module, exports) {
(function() {
	(function(chaiSubset) {
		if (typeof commonjsRequire === 'function' && 'object' === 'object' && 'object' === 'object') {
			return module.exports = chaiSubset;
		} else {
			return chai.use(chaiSubset);
		}
	})(function(chai, utils) {
		var Assertion = chai.Assertion;
		var assertionPrototype = Assertion.prototype;

		Assertion.addMethod('containSubset', function (expected) {
			var actual = utils.flag(this, 'object');
			var showDiff = chai.config.showDiff;

			assertionPrototype.assert.call(this,
				compare(expected, actual),
				'expected #{act} to contain subset #{exp}',
				'expected #{act} to not contain subset #{exp}',
				expected,
				actual,
				showDiff
			);
		});

		chai.assert.containSubset = function(val, exp, msg) {
			new chai.Assertion(val, msg).to.be.containSubset(exp);
		};

		function compare(expected, actual) {
			if (expected === actual) {
				return true;
			}
			if (typeof(actual) !== typeof(expected)) {
				return false;
			}
			if (typeof(expected) !== 'object' || expected === null) {
				return expected === actual;
			}
			if (!!expected && !actual) {
				return false;
			}

			if (Array.isArray(expected)) {
				if (typeof(actual.length) !== 'number') {
					return false;
				}
				var aa = Array.prototype.slice.call(actual);
				return expected.every(function (exp) {
					return aa.some(function (act) {
						return compare(exp, act);
					});
				});
			}

			if (expected instanceof Date) {
				if (actual instanceof Date) {
					return expected.getTime() === actual.getTime();
				} else {
					return false;
				}
			}

			return Object.keys(expected).every(function (key) {
				var eo = expected[key];
				var ao = actual[key];
				if (typeof(eo) === 'object' && eo !== null && ao !== null) {
					return compare(eo, ao);
				}
				if (typeof(eo) === 'function') {
					return eo(ao);
				}
				return ao === eo;
			});
		}
	});

}).call(commonjsGlobal);
}(chaiSubset));

var Subset = chaiSubset.exports;

// Detect either spaces or tabs but not both to properly handle tabs for indentation and spaces for alignment
const INDENT_REGEX = /^(?:( )+|\t+)/;

const INDENT_TYPE_SPACE = 'space';
const INDENT_TYPE_TAB = 'tab';

/**
Make a Map that counts how many indents/unindents have occurred for a given size and how many lines follow a given indentation.

The key is a concatenation of the indentation type (s = space and t = tab) and the size of the indents/unindents.

```
indents = {
	t3: [1, 0],
	t4: [1, 5],
	s5: [1, 0],
	s12: [1, 0],
}
```
*/
function makeIndentsMap(string, ignoreSingleSpaces) {
	const indents = new Map();

	// Remember the size of previous line's indentation
	let previousSize = 0;
	let previousIndentType;

	// Indents key (ident type + size of the indents/unindents)
	let key;

	for (const line of string.split(/\n/g)) {
		if (!line) {
			// Ignore empty lines
			continue;
		}

		let indent;
		let indentType;
		let weight;
		let entry;
		const matches = line.match(INDENT_REGEX);

		if (matches === null) {
			previousSize = 0;
			previousIndentType = '';
		} else {
			indent = matches[0].length;
			indentType = matches[1] ? INDENT_TYPE_SPACE : INDENT_TYPE_TAB;

			// Ignore single space unless it's the only indent detected to prevent common false positives
			if (ignoreSingleSpaces && indentType === INDENT_TYPE_SPACE && indent === 1) {
				continue;
			}

			if (indentType !== previousIndentType) {
				previousSize = 0;
			}

			previousIndentType = indentType;

			weight = 0;

			const indentDifference = indent - previousSize;
			previousSize = indent;

			// Previous line have same indent?
			if (indentDifference === 0) {
				weight++;
				// We use the key from previous loop
			} else {
				const absoluteIndentDifference = indentDifference > 0 ? indentDifference : -indentDifference;
				key = encodeIndentsKey(indentType, absoluteIndentDifference);
			}

			// Update the stats
			entry = indents.get(key);
			entry = entry === undefined ? [1, 0] : [++entry[0], entry[1] + weight];

			indents.set(key, entry);
		}
	}

	return indents;
}

// Encode the indent type and amount as a string (e.g. 's4') for use as a compound key in the indents Map.
function encodeIndentsKey(indentType, indentAmount) {
	const typeCharacter = indentType === INDENT_TYPE_SPACE ? 's' : 't';
	return typeCharacter + String(indentAmount);
}

// Extract the indent type and amount from a key of the indents Map.
function decodeIndentsKey(indentsKey) {
	const keyHasTypeSpace = indentsKey[0] === 's';
	const type = keyHasTypeSpace ? INDENT_TYPE_SPACE : INDENT_TYPE_TAB;

	const amount = Number(indentsKey.slice(1));

	return {type, amount};
}

// Return the key (e.g. 's4') from the indents Map that represents the most common indent,
// or return undefined if there are no indents.
function getMostUsedKey(indents) {
	let result;
	let maxUsed = 0;
	let maxWeight = 0;

	for (const [key, [usedCount, weight]] of indents) {
		if (usedCount > maxUsed || (usedCount === maxUsed && weight > maxWeight)) {
			maxUsed = usedCount;
			maxWeight = weight;
			result = key;
		}
	}

	return result;
}

function makeIndentString(type, amount) {
	const indentCharacter = type === INDENT_TYPE_SPACE ? ' ' : '\t';
	return indentCharacter.repeat(amount);
}

function detectIndent(string) {
	if (typeof string !== 'string') {
		throw new TypeError('Expected a string');
	}

	// Identify indents while skipping single space indents to avoid common edge cases (e.g. code comments)
	// If no indents are identified, run again and include all indents for comprehensive detection
	let indents = makeIndentsMap(string, true);
	if (indents.size === 0) {
		indents = makeIndentsMap(string, false);
	}

	const keyOfMostUsedIndent = getMostUsedKey(indents);

	let type;
	let amount = 0;
	let indent = '';

	if (keyOfMostUsedIndent !== undefined) {
		({type, amount} = decodeIndentsKey(keyOfMostUsedIndent));
		indent = makeIndentString(type, amount);
	}

	return {
		amount,
		type,
		indent,
	};
}

async function saveInlineSnapshots(snapshots) {
  const MagicString = (await import('./magic-string.es-94000aea.js')).default;
  const files = new Set(snapshots.map((i) => i.file));
  await Promise.all(Array.from(files).map(async (file) => {
    const map = await rpc().getSourceMap(file);
    const snaps = snapshots.filter((i) => i.file === file);
    const code = await promises.readFile(file, "utf8");
    const s = new MagicString(code);
    for (const snap of snaps) {
      const pos = await getOriginalPos(map, snap);
      const index = posToNumber(code, pos);
      const { indent } = detectIndent(code.slice(index - pos.column));
      replaceInlineSnap(code, s, index, snap.snapshot, indent);
    }
    const transformed = s.toString();
    if (transformed !== code)
      await promises.writeFile(file, transformed, "utf-8");
  }));
}
const startObjectRegex = /(?:toMatchInlineSnapshot|toThrowErrorMatchingInlineSnapshot)\s*\(\s*({)/m;
function replaceObjectSnap(code, s, index, newSnap, indent = "") {
  code = code.slice(index);
  const startMatch = startObjectRegex.exec(code);
  if (!startMatch)
    return false;
  code = code.slice(startMatch.index);
  const charIndex = getCallLastIndex(code);
  if (charIndex === null)
    return false;
  s.appendLeft(index + startMatch.index + charIndex, `, ${prepareSnapString(newSnap, indent)}`);
  return true;
}
function prepareSnapString(snap, indent) {
  snap = snap.replace(/\\/g, "\\\\").split("\n").map((i) => (indent + i).trimEnd()).join("\n");
  const isOneline = !snap.includes("\n");
  return isOneline ? `'${snap.replace(/'/g, "\\'").trim()}'` : `\`${snap.replace(/`/g, "\\`").trimEnd()}
${indent}\``;
}
const startRegex = /(?:toMatchInlineSnapshot|toThrowErrorMatchingInlineSnapshot)\s*\(\s*(['"`\)])/m;
function replaceInlineSnap(code, s, index, newSnap, indent = "") {
  const startMatch = startRegex.exec(code.slice(index));
  if (!startMatch)
    return replaceObjectSnap(code, s, index, newSnap, indent);
  const snapString = prepareSnapString(newSnap, indent);
  const quote = startMatch[1];
  const startIndex = index + startMatch.index + startMatch[0].length;
  if (quote === ")") {
    s.appendRight(startIndex - 1, snapString);
    return true;
  }
  const quoteEndRE = new RegExp(`(?:^|[^\\\\])${quote}`);
  const endMatch = quoteEndRE.exec(code.slice(startIndex));
  if (!endMatch)
    return false;
  const endIndex = startIndex + endMatch.index + endMatch[0].length;
  s.overwrite(startIndex - 1, endIndex, snapString);
  return true;
}

var naturalCompare$2 = {exports: {}};

/*
 * @version    1.4.0
 * @date       2015-10-26
 * @stability  3 - Stable
 * @author     Lauri Rooden (https://github.com/litejs/natural-compare-lite)
 * @license    MIT License
 */


var naturalCompare = function(a, b) {
	var i, codeA
	, codeB = 1
	, posA = 0
	, posB = 0
	, alphabet = String.alphabet;

	function getCode(str, pos, code) {
		if (code) {
			for (i = pos; code = getCode(str, i), code < 76 && code > 65;) ++i;
			return +str.slice(pos - 1, i)
		}
		code = alphabet && alphabet.indexOf(str.charAt(pos));
		return code > -1 ? code + 76 : ((code = str.charCodeAt(pos) || 0), code < 45 || code > 127) ? code
			: code < 46 ? 65               // -
			: code < 48 ? code - 1
			: code < 58 ? code + 18        // 0-9
			: code < 65 ? code - 11
			: code < 91 ? code + 11        // A-Z
			: code < 97 ? code - 37
			: code < 123 ? code + 5        // a-z
			: code - 63
	}


	if ((a+="") != (b+="")) for (;codeB;) {
		codeA = getCode(a, posA++);
		codeB = getCode(b, posB++);

		if (codeA < 76 && codeB < 76 && codeA > 66 && codeB > 66) {
			codeA = getCode(a, posA, posA);
			codeB = getCode(b, posB, posA = i);
			posB = i;
		}

		if (codeA != codeB) return (codeA < codeB) ? -1 : 1
	}
	return 0
};

try {
	naturalCompare$2.exports = naturalCompare;
} catch (e) {
	String.naturalCompare = naturalCompare;
}

var naturalCompare$1 = naturalCompare$2.exports;

var __defProp$2 = Object.defineProperty;
var __getOwnPropSymbols$2 = Object.getOwnPropertySymbols;
var __hasOwnProp$2 = Object.prototype.hasOwnProperty;
var __propIsEnum$2 = Object.prototype.propertyIsEnumerable;
var __defNormalProp$2 = (obj, key, value) => key in obj ? __defProp$2(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues$2 = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp$2.call(b, prop))
      __defNormalProp$2(a, prop, b[prop]);
  if (__getOwnPropSymbols$2)
    for (var prop of __getOwnPropSymbols$2(b)) {
      if (__propIsEnum$2.call(b, prop))
        __defNormalProp$2(a, prop, b[prop]);
    }
  return a;
};
const SNAPSHOT_VERSION = "1";
const writeSnapshotVersion = () => `// Vitest Snapshot v${SNAPSHOT_VERSION}`;
const testNameToKey = (testName, count) => `${testName} ${count}`;
const keyToTestName = (key) => {
  if (!/ \d+$/.test(key))
    throw new Error("Snapshot keys must end with a number.");
  return key.replace(/ \d+$/, "");
};
const getSnapshotData = (snapshotPath, update) => {
  const data = Object.create(null);
  let snapshotContents = "";
  let dirty = false;
  if (fs.existsSync(snapshotPath)) {
    try {
      snapshotContents = fs.readFileSync(snapshotPath, "utf8");
      const populate = new Function("exports", snapshotContents);
      populate(data);
    } catch {
    }
  }
  const isInvalid = snapshotContents;
  if ((update === "all" || update === "new") && isInvalid)
    dirty = true;
  return { data, dirty };
};
const addExtraLineBreaks = (string) => string.includes("\n") ? `
${string}
` : string;
const removeExtraLineBreaks = (string) => string.length > 2 && string.startsWith("\n") && string.endsWith("\n") ? string.slice(1, -1) : string;
const escapeRegex = true;
const printFunctionName = false;
function serialize(val, indent = 2, formatOverrides = {}) {
  return normalizeNewlines(format_1(val, __spreadValues$2({
    escapeRegex,
    indent,
    plugins: getSerializers(),
    printFunctionName
  }, formatOverrides)));
}
function escapeBacktickString(str) {
  return str.replace(/`|\\|\${/g, "\\$&");
}
function printBacktickString(str) {
  return `\`${escapeBacktickString(str)}\``;
}
function ensureDirectoryExists(filePath) {
  try {
    fs.mkdirSync(index.join(index.dirname(filePath)), { recursive: true });
  } catch {
  }
}
function normalizeNewlines(string) {
  return string.replace(/\r\n|\r/g, "\n");
}
async function saveSnapshotFile(snapshotData, snapshotPath) {
  const snapshots = Object.keys(snapshotData).sort(naturalCompare$1).map((key) => `exports[${printBacktickString(key)}] = ${printBacktickString(normalizeNewlines(snapshotData[key]))};`);
  ensureDirectoryExists(snapshotPath);
  await promises.writeFile(snapshotPath, `${writeSnapshotVersion()}

${snapshots.join("\n\n")}
`, "utf-8");
}
function prepareExpected(expected) {
  function findStartIndent() {
    var _a;
    const match = /^( +)}\s+$/m.exec(expected || "");
    return ((_a = match == null ? void 0 : match[1]) == null ? void 0 : _a.length) || 0;
  }
  const startIdent = findStartIndent();
  let expectedTrimmed = expected == null ? void 0 : expected.trim();
  if (startIdent) {
    expectedTrimmed = expectedTrimmed == null ? void 0 : expectedTrimmed.replace(new RegExp(`^${" ".repeat(startIdent)}`, "gm"), "").replace(/ +}$/, "}");
  }
  return expectedTrimmed;
}

var __defProp$1 = Object.defineProperty;
var __getOwnPropSymbols$1 = Object.getOwnPropertySymbols;
var __hasOwnProp$1 = Object.prototype.hasOwnProperty;
var __propIsEnum$1 = Object.prototype.propertyIsEnumerable;
var __defNormalProp$1 = (obj, key, value) => key in obj ? __defProp$1(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues$1 = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp$1.call(b, prop))
      __defNormalProp$1(a, prop, b[prop]);
  if (__getOwnPropSymbols$1)
    for (var prop of __getOwnPropSymbols$1(b)) {
      if (__propIsEnum$1.call(b, prop))
        __defNormalProp$1(a, prop, b[prop]);
    }
  return a;
};
class SnapshotState {
  constructor(snapshotPath, options) {
    this._snapshotPath = snapshotPath;
    const { data, dirty } = getSnapshotData(this._snapshotPath, options.updateSnapshot);
    this._initialData = data;
    this._snapshotData = data;
    this._dirty = dirty;
    this._inlineSnapshots = [];
    this._uncheckedKeys = new Set(Object.keys(this._snapshotData));
    this._counters = new Map();
    this.expand = options.expand || false;
    this.added = 0;
    this.matched = 0;
    this.unmatched = 0;
    this._updateSnapshot = options.updateSnapshot;
    this.updated = 0;
    this._snapshotFormat = __spreadValues$1({
      printBasicPrototype: false
    }, options.snapshotFormat);
  }
  markSnapshotsAsCheckedForTest(testName) {
    this._uncheckedKeys.forEach((uncheckedKey) => {
      if (keyToTestName(uncheckedKey) === testName)
        this._uncheckedKeys.delete(uncheckedKey);
    });
  }
  _addSnapshot(key, receivedSerialized, options) {
    this._dirty = true;
    if (options.isInline) {
      const error = options.error || new Error("Unknown error");
      const stacks = parseStacktrace(error, true);
      stacks.forEach((i) => i.file = slash(i.file));
      const stackIndex = stacks.findIndex((i) => i.method.includes("__VITEST_INLINE_SNAPSHOT__"));
      const stack = stackIndex !== -1 ? stacks[stackIndex + 2] : null;
      if (!stack) {
        throw new Error(`Vitest: Couldn't infer stack frame for inline snapshot.
${JSON.stringify(stacks)}`);
      }
      this._inlineSnapshots.push(__spreadValues$1({
        snapshot: receivedSerialized
      }, stack));
    } else {
      this._snapshotData[key] = receivedSerialized;
    }
  }
  clear() {
    this._snapshotData = this._initialData;
    this._counters = new Map();
    this.added = 0;
    this.matched = 0;
    this.unmatched = 0;
    this.updated = 0;
  }
  async save() {
    const hasExternalSnapshots = Object.keys(this._snapshotData).length;
    const hasInlineSnapshots = this._inlineSnapshots.length;
    const isEmpty = !hasExternalSnapshots && !hasInlineSnapshots;
    const status = {
      deleted: false,
      saved: false
    };
    if ((this._dirty || this._uncheckedKeys.size) && !isEmpty) {
      if (hasExternalSnapshots)
        await saveSnapshotFile(this._snapshotData, this._snapshotPath);
      if (hasInlineSnapshots)
        await saveInlineSnapshots(this._inlineSnapshots);
      status.saved = true;
    } else if (!hasExternalSnapshots && fs.existsSync(this._snapshotPath)) {
      if (this._updateSnapshot === "all")
        fs.unlinkSync(this._snapshotPath);
      status.deleted = true;
    }
    return status;
  }
  getUncheckedCount() {
    return this._uncheckedKeys.size || 0;
  }
  getUncheckedKeys() {
    return Array.from(this._uncheckedKeys);
  }
  removeUncheckedKeys() {
    if (this._updateSnapshot === "all" && this._uncheckedKeys.size) {
      this._dirty = true;
      this._uncheckedKeys.forEach((key) => delete this._snapshotData[key]);
      this._uncheckedKeys.clear();
    }
  }
  match({
    testName,
    received,
    key,
    inlineSnapshot,
    isInline,
    error
  }) {
    this._counters.set(testName, (this._counters.get(testName) || 0) + 1);
    const count = Number(this._counters.get(testName));
    if (!key)
      key = testNameToKey(testName, count);
    if (!(isInline && this._snapshotData[key] !== void 0))
      this._uncheckedKeys.delete(key);
    const receivedSerialized = addExtraLineBreaks(serialize(received, void 0, this._snapshotFormat));
    const expected = isInline ? inlineSnapshot : this._snapshotData[key];
    const expectedTrimmed = prepareExpected(expected);
    const pass = expectedTrimmed === (receivedSerialized == null ? void 0 : receivedSerialized.trim());
    const hasSnapshot = expected !== void 0;
    const snapshotIsPersisted = isInline || fs.existsSync(this._snapshotPath);
    if (pass && !isInline) {
      this._snapshotData[key] = receivedSerialized;
    }
    if (hasSnapshot && this._updateSnapshot === "all" || (!hasSnapshot || !snapshotIsPersisted) && (this._updateSnapshot === "new" || this._updateSnapshot === "all")) {
      if (this._updateSnapshot === "all") {
        if (!pass) {
          if (hasSnapshot)
            this.updated++;
          else
            this.added++;
          this._addSnapshot(key, receivedSerialized, { error, isInline });
        } else {
          this.matched++;
        }
      } else {
        this._addSnapshot(key, receivedSerialized, { error, isInline });
        this.added++;
      }
      return {
        actual: "",
        count,
        expected: "",
        key,
        pass: true
      };
    } else {
      if (!pass) {
        this.unmatched++;
        return {
          actual: removeExtraLineBreaks(receivedSerialized),
          count,
          expected: expectedTrimmed !== void 0 ? removeExtraLineBreaks(expectedTrimmed) : void 0,
          key,
          pass: false
        };
      } else {
        this.matched++;
        return {
          actual: "",
          count,
          expected: "",
          key,
          pass: true
        };
      }
    }
  }
}

const resolveSnapshotPath = (testPath) => index.join(index.join(index.dirname(testPath), "__snapshots__"), `${index.basename(testPath)}.snap`);
class SnapshotClient {
  constructor() {
    this.testFile = "";
  }
  setTest(test) {
    this.test = test;
    if (this.testFile !== this.test.file.filepath) {
      if (this.snapshotState)
        this.saveSnap();
      this.testFile = this.test.file.filepath;
      this.snapshotState = new SnapshotState(resolveSnapshotPath(this.testFile), process.__vitest_worker__.config.snapshotOptions);
    }
  }
  clearTest() {
    this.test = void 0;
  }
  assert(received, message, isInline = false, properties, inlineSnapshot) {
    if (!this.test)
      throw new Error("Snapshot cannot be used outside of test");
    if (typeof properties === "object") {
      if (typeof received !== "object" || !received)
        throw new Error("Received value must be an object when the matcher has properties");
      try {
        const pass2 = equals(received, properties, [iterableEquality, subsetEquality]);
        if (!pass2)
          expect(received).toBe(properties);
        else
          received = deepMerge(received, properties);
      } catch (err) {
        err.message = "Snapshot mismatched";
        throw err;
      }
    }
    const testName = [
      ...getNames(this.test).slice(1),
      ...message ? [message] : []
    ].join(" > ");
    const { actual, expected, key, pass } = this.snapshotState.match({
      testName,
      received,
      isInline,
      inlineSnapshot
    });
    if (!pass) {
      try {
        expect(actual.trim()).equals(expected ? expected.trim() : "");
      } catch (error) {
        error.message = `Snapshot \`${key || "unknown"}\` mismatched`;
        throw error;
      }
    }
  }
  async saveSnap() {
    if (!this.testFile || !this.snapshotState)
      return;
    const result = await packSnapshotState(this.testFile, this.snapshotState);
    await rpc().snapshotSaved(result);
    this.testFile = "";
    this.snapshotState = void 0;
  }
}
async function packSnapshotState(filepath, state) {
  const snapshot = {
    filepath,
    added: 0,
    fileDeleted: false,
    matched: 0,
    unchecked: 0,
    uncheckedKeys: [],
    unmatched: 0,
    updated: 0
  };
  const uncheckedCount = state.getUncheckedCount();
  const uncheckedKeys = state.getUncheckedKeys();
  if (uncheckedCount)
    state.removeUncheckedKeys();
  const status = await state.save();
  snapshot.fileDeleted = status.deleted;
  snapshot.added = state.added;
  snapshot.matched = state.matched;
  snapshot.unmatched = state.unmatched;
  snapshot.updated = state.updated;
  snapshot.unchecked = !status.deleted ? uncheckedCount : 0;
  snapshot.uncheckedKeys = Array.from(uncheckedKeys);
  return snapshot;
}

let _client;
function getSnapshotClient() {
  if (!_client)
    _client = new SnapshotClient();
  return _client;
}
const getErrorString = (expected) => {
  try {
    expected();
  } catch (e) {
    if (e instanceof Error)
      return e.message;
    return e;
  }
  throw new Error("snapshot function didn't threw");
};
const SnapshotPlugin = (chai, utils) => {
  for (const key of ["matchSnapshot", "toMatchSnapshot"]) {
    utils.addMethod(chai.Assertion.prototype, key, function(properties, message) {
      const expected = utils.flag(this, "object");
      if (typeof properties === "string" && typeof message === "undefined") {
        message = properties;
        properties = void 0;
      }
      getSnapshotClient().assert(expected, message, false, properties);
    });
  }
  utils.addMethod(chai.Assertion.prototype, "toMatchInlineSnapshot", function __VITEST_INLINE_SNAPSHOT__(properties, inlineSnapshot, message) {
    const expected = utils.flag(this, "object");
    if (typeof properties === "string") {
      message = inlineSnapshot;
      inlineSnapshot = properties;
      properties = void 0;
    }
    getSnapshotClient().assert(expected, message, true, properties, inlineSnapshot);
  });
  utils.addMethod(chai.Assertion.prototype, "toThrowErrorMatchingSnapshot", function(message) {
    const expected = utils.flag(this, "object");
    getSnapshotClient().assert(getErrorString(expected), message);
  });
  utils.addMethod(chai.Assertion.prototype, "toThrowErrorMatchingInlineSnapshot", function __VITEST_INLINE_SNAPSHOT__(inlineSnapshot, message) {
    const expected = utils.flag(this, "object");
    getSnapshotClient().assert(getErrorString(expected), message, true, void 0, inlineSnapshot);
  });
};

const EXPECTED_COLOR = c.green;
const RECEIVED_COLOR = c.red;
const INVERTED_COLOR = c.inverse;
const BOLD_WEIGHT = c.bold;
const DIM_COLOR = c.dim;
const {
  AsymmetricMatcher: AsymmetricMatcher$1,
  DOMCollection,
  DOMElement,
  Immutable,
  ReactElement,
  ReactTestComponent
} = plugins_1;
const PLUGINS = [
  ReactTestComponent,
  ReactElement,
  DOMElement,
  DOMCollection,
  Immutable,
  AsymmetricMatcher$1
];
function matcherHint(matcherName, received = "received", expected = "expected", options = {}) {
  const {
    comment = "",
    expectedColor = EXPECTED_COLOR,
    isDirectExpectCall = false,
    isNot = false,
    promise = "",
    receivedColor = RECEIVED_COLOR,
    secondArgument = "",
    secondArgumentColor = EXPECTED_COLOR
  } = options;
  let hint = "";
  let dimString = "expect";
  if (!isDirectExpectCall && received !== "") {
    hint += DIM_COLOR(`${dimString}(`) + receivedColor(received);
    dimString = ")";
  }
  if (promise !== "") {
    hint += DIM_COLOR(`${dimString}.`) + promise;
    dimString = "";
  }
  if (isNot) {
    hint += `${DIM_COLOR(`${dimString}.`)}not`;
    dimString = "";
  }
  if (matcherName.includes(".")) {
    dimString += matcherName;
  } else {
    hint += DIM_COLOR(`${dimString}.`) + matcherName;
    dimString = "";
  }
  if (expected === "") {
    dimString += "()";
  } else {
    hint += DIM_COLOR(`${dimString}(`) + expectedColor(expected);
    if (secondArgument)
      hint += DIM_COLOR(", ") + secondArgumentColor(secondArgument);
    dimString = ")";
  }
  if (comment !== "")
    dimString += ` // ${comment}`;
  if (dimString !== "")
    hint += DIM_COLOR(dimString);
  return hint;
}
const SPACE_SYMBOL = "\xB7";
const replaceTrailingSpaces = (text) => text.replace(/\s+$/gm, (spaces) => SPACE_SYMBOL.repeat(spaces.length));
const stringify = (object, maxDepth = 10) => {
  const MAX_LENGTH = 1e4;
  let result;
  try {
    result = format_1(object, {
      maxDepth,
      plugins: PLUGINS
    });
  } catch {
    result = format_1(object, {
      callToJSON: false,
      maxDepth,
      plugins: PLUGINS
    });
  }
  return result.length >= MAX_LENGTH && maxDepth > 1 ? stringify(object, Math.floor(maxDepth / 2)) : result;
};
const printReceived = (object) => RECEIVED_COLOR(replaceTrailingSpaces(stringify(object)));
const printExpected = (value) => EXPECTED_COLOR(replaceTrailingSpaces(stringify(value)));
function diff(a, b, options) {
  return unifiedDiff(stringify(a), stringify(b));
}

var matcherUtils = /*#__PURE__*/Object.freeze({
  __proto__: null,
  EXPECTED_COLOR: EXPECTED_COLOR,
  RECEIVED_COLOR: RECEIVED_COLOR,
  INVERTED_COLOR: INVERTED_COLOR,
  BOLD_WEIGHT: BOLD_WEIGHT,
  DIM_COLOR: DIM_COLOR,
  matcherHint: matcherHint,
  stringify: stringify,
  printReceived: printReceived,
  printExpected: printExpected,
  diff: diff
});

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
const isAsyncFunction = (fn) => typeof fn === "function" && fn[Symbol.toStringTag] === "AsyncFunction";
const getMatcherState = (assertion) => {
  const obj = assertion._obj;
  const isNot = util.flag(assertion, "negate");
  const promise = util.flag(assertion, "promise") || "";
  const jestUtils = __spreadProps(__spreadValues({}, matcherUtils), {
    iterableEquality,
    subsetEquality
  });
  const matcherState = __spreadProps(__spreadValues({}, getState()), {
    isNot,
    utils: jestUtils,
    promise,
    equals,
    suppressedErrors: []
  });
  return {
    state: matcherState,
    isNot,
    obj
  };
};
class JestExtendError extends Error {
  constructor(message, actual, expected) {
    super(message);
    this.actual = actual;
    this.expected = expected;
  }
}
function JestExtendPlugin(expects) {
  return (c, utils) => {
    Object.entries(expects).forEach(([expectAssertionName, expectAssertion]) => {
      function expectSyncWrapper(...args) {
        const { state, isNot, obj } = getMatcherState(this);
        const { pass, message, actual, expected } = expectAssertion.call(state, obj, ...args);
        if (pass && isNot || !pass && !isNot)
          throw new JestExtendError(message(), actual, expected);
      }
      async function expectAsyncWrapper(...args) {
        const { state, isNot, obj } = getMatcherState(this);
        const { pass, message, actual, expected } = await expectAssertion.call(state, obj, ...args);
        if (pass && isNot || !pass && !isNot)
          throw new JestExtendError(message(), actual, expected);
      }
      const expectAssertionWrapper = isAsyncFunction(expectAssertion) ? expectAsyncWrapper : expectSyncWrapper;
      utils.addMethod(chai$1.Assertion.prototype, expectAssertionName, expectAssertionWrapper);
    });
  };
}
const JestExtend = (chai2, utils) => {
  utils.addMethod(chai2.expect, "extend", (expects) => {
    chai2.use(JestExtendPlugin(expects));
  });
};

class AsymmetricMatcher {
  constructor(sample, inverse = false) {
    this.sample = sample;
    this.inverse = inverse;
    this.$$typeof = Symbol.for("jest.asymmetricMatcher");
  }
  getMatcherContext() {
    return {
      equals,
      isNot: this.inverse,
      utils: matcherUtils
    };
  }
}
class StringContaining extends AsymmetricMatcher {
  constructor(sample, inverse = false) {
    if (!isA("String", sample))
      throw new Error("Expected is not a string");
    super(sample, inverse);
  }
  asymmetricMatch(other) {
    const result = isA("String", other) && other.includes(this.sample);
    return this.inverse ? !result : result;
  }
  toString() {
    return `String${this.inverse ? "Not" : ""}Containing`;
  }
  getExpectedType() {
    return "string";
  }
}
class Anything extends AsymmetricMatcher {
  asymmetricMatch(other) {
    return other != null;
  }
  toString() {
    return "Anything";
  }
  toAsymmetricMatcher() {
    return "Anything";
  }
}
class ObjectContaining extends AsymmetricMatcher {
  constructor(sample, inverse = false) {
    super(sample, inverse);
  }
  getPrototype(obj) {
    if (Object.getPrototypeOf)
      return Object.getPrototypeOf(obj);
    if (obj.constructor.prototype === obj)
      return null;
    return obj.constructor.prototype;
  }
  hasProperty(obj, property) {
    if (!obj)
      return false;
    if (Object.prototype.hasOwnProperty.call(obj, property))
      return true;
    return this.hasProperty(this.getPrototype(obj), property);
  }
  asymmetricMatch(other) {
    if (typeof this.sample !== "object") {
      throw new TypeError(`You must provide an object to ${this.toString()}, not '${typeof this.sample}'.`);
    }
    let result = true;
    for (const property in this.sample) {
      if (!this.hasProperty(other, property) || !equals(this.sample[property], other[property])) {
        result = false;
        break;
      }
    }
    return this.inverse ? !result : result;
  }
  toString() {
    return `Object${this.inverse ? "Not" : ""}Containing`;
  }
  getExpectedType() {
    return "object";
  }
}
class ArrayContaining extends AsymmetricMatcher {
  constructor(sample, inverse = false) {
    super(sample, inverse);
  }
  asymmetricMatch(other) {
    if (!Array.isArray(this.sample)) {
      throw new TypeError(`You must provide an array to ${this.toString()}, not '${typeof this.sample}'.`);
    }
    const result = this.sample.length === 0 || Array.isArray(other) && this.sample.every((item) => other.some((another) => equals(item, another)));
    return this.inverse ? !result : result;
  }
  toString() {
    return `Array${this.inverse ? "Not" : ""}Containing`;
  }
  getExpectedType() {
    return "array";
  }
}
class Any extends AsymmetricMatcher {
  constructor(sample) {
    if (typeof sample === "undefined") {
      throw new TypeError("any() expects to be passed a constructor function. Please pass one or use anything() to match any object.");
    }
    super(sample);
  }
  fnNameFor(func) {
    if (func.name)
      return func.name;
    const functionToString = Function.prototype.toString;
    const matches = functionToString.call(func).match(/^(?:async)?\s*function\s*\*?\s*([\w$]+)\s*\(/);
    return matches ? matches[1] : "<anonymous>";
  }
  asymmetricMatch(other) {
    if (this.sample === String)
      return typeof other == "string" || other instanceof String;
    if (this.sample === Number)
      return typeof other == "number" || other instanceof Number;
    if (this.sample === Function)
      return typeof other == "function" || other instanceof Function;
    if (this.sample === Boolean)
      return typeof other == "boolean" || other instanceof Boolean;
    if (this.sample === BigInt)
      return typeof other == "bigint" || other instanceof BigInt;
    if (this.sample === Symbol)
      return typeof other == "symbol" || other instanceof Symbol;
    if (this.sample === Object)
      return typeof other == "object";
    return other instanceof this.sample;
  }
  toString() {
    return "Any";
  }
  getExpectedType() {
    if (this.sample === String)
      return "string";
    if (this.sample === Number)
      return "number";
    if (this.sample === Function)
      return "function";
    if (this.sample === Object)
      return "object";
    if (this.sample === Boolean)
      return "boolean";
    return this.fnNameFor(this.sample);
  }
  toAsymmetricMatcher() {
    return `Any<${this.fnNameFor(this.sample)}>`;
  }
}
class StringMatching extends AsymmetricMatcher {
  constructor(sample, inverse = false) {
    if (!isA("String", sample) && !isA("RegExp", sample))
      throw new Error("Expected is not a String or a RegExp");
    super(new RegExp(sample), inverse);
  }
  asymmetricMatch(other) {
    const result = isA("String", other) && this.sample.test(other);
    return this.inverse ? !result : result;
  }
  toString() {
    return `String${this.inverse ? "Not" : ""}Matching`;
  }
  getExpectedType() {
    return "string";
  }
}
const JestAsymmetricMatchers = (chai, utils) => {
  utils.addMethod(chai.expect, "anything", () => new Anything());
  utils.addMethod(chai.expect, "any", (expected) => new Any(expected));
  utils.addMethod(chai.expect, "stringContaining", (expected) => new StringContaining(expected));
  utils.addMethod(chai.expect, "objectContaining", (expected) => new ObjectContaining(expected));
  utils.addMethod(chai.expect, "arrayContaining", (expected) => new ArrayContaining(expected));
  utils.addMethod(chai.expect, "stringMatching", (expected) => new StringMatching(expected));
  chai.expect.not = {
    stringContaining: (expected) => new StringContaining(expected, true),
    objectContaining: (expected) => new ObjectContaining(expected, true),
    arrayContaining: (expected) => new ArrayContaining(expected, true),
    stringMatching: (expected) => new StringMatching(expected, true)
  };
};

let installed = false;
async function setupChai() {
  if (installed)
    return;
  chai$1.use(JestExtend);
  chai$1.use(JestChaiExpect);
  chai$1.use(Subset);
  chai$1.use(SnapshotPlugin);
  chai$1.use(JestAsymmetricMatchers);
  installed = true;
}

let globalSetup = false;
async function setupGlobalEnv(config) {
  if (globalSetup)
    return;
  globalSetup = true;
  setupConsoleLogSpy();
  await setupChai();
  if (config.global)
    (await import('./global-1faac055.js')).registerApiGlobally();
}
function setupConsoleLogSpy() {
  const stdout = new Writable({
    write(data, encoding, callback) {
      var _a;
      rpc().onUserConsoleLog({
        type: "stdout",
        content: String(data),
        taskId: (_a = process.__vitest_worker__.current) == null ? void 0 : _a.id,
        time: Date.now()
      });
      callback();
    }
  });
  const stderr = new Writable({
    write(data, encoding, callback) {
      var _a;
      rpc().onUserConsoleLog({
        type: "stderr",
        content: String(data),
        taskId: (_a = process.__vitest_worker__.current) == null ? void 0 : _a.id,
        time: Date.now()
      });
      callback();
    }
  });
  globalThis.console = new Console({
    stdout,
    stderr,
    colorMode: true,
    groupIndentation: 2
  });
}
async function withEnv(name, options, fn) {
  const env = await environments[name].setup(globalThis, options);
  try {
    await fn();
  } finally {
    await env.teardown(globalThis);
  }
}
async function runSetupFiles(config) {
  const files = toArray(config.setupFiles);
  await Promise.all(files.map(async (file) => {
    process.__vitest_worker__.moduleCache.delete(file);
    await import(file);
  }));
}

const OBJECT_PROTO = Object.getPrototypeOf({});
function serializeError(val, seen = new WeakMap()) {
  if (!val || typeof val === "string")
    return val;
  if (typeof val === "function")
    return `Function<${val.name}>`;
  if (typeof val !== "object")
    return val;
  if (val instanceof Promise || "then" in val || val.constructor && val.constructor.prototype === "AsyncFunction")
    return "Promise";
  if (typeof Element !== "undefined" && val instanceof Element)
    return val.tagName;
  if (typeof val.asymmetricMatch === "function")
    return `${val.toString()} ${format(val.sample)}`;
  if (seen.has(val))
    return seen.get(val);
  if (Array.isArray(val)) {
    const clone = new Array(val.length);
    seen.set(val, clone);
    val.forEach((e, i) => {
      clone[i] = serializeError(e, seen);
    });
    return clone;
  } else {
    const clone = Object.create(null);
    seen.set(val, clone);
    let obj = val;
    while (obj && obj !== OBJECT_PROTO) {
      Object.getOwnPropertyNames(obj).forEach((key) => {
        if (!(key in clone))
          clone[key] = serializeError(obj[key], seen);
      });
      obj = Object.getPrototypeOf(obj);
    }
    return clone;
  }
}
function processError(err) {
  if (!err)
    return err;
  if (err.stack)
    err.stackStr = String(err.stack);
  if (err.name)
    err.nameStr = String(err.name);
  if (typeof err.expected !== "string")
    err.expected = stringify(err.expected);
  if (typeof err.actual !== "string")
    err.actual = stringify(err.actual);
  return serializeError(err);
}

function hash(str, length = 10) {
  return createHash("md5").update(str).digest("hex").slice(0, length);
}
async function collectTests(paths, config) {
  const files = [];
  for (const filepath of paths) {
    const path = relative(config.root, filepath);
    const file = {
      id: hash(path),
      name: path,
      type: "suite",
      mode: "run",
      filepath,
      tasks: []
    };
    clearContext();
    try {
      await runSetupFiles(config);
      await import(filepath);
      const defaultTasks = await defaultSuite.collect(file);
      setHooks(file, getHooks(defaultTasks));
      for (const c of [...defaultTasks.tasks, ...context.tasks]) {
        if (c.type === "test") {
          file.tasks.push(c);
        } else if (c.type === "suite") {
          file.tasks.push(c);
        } else {
          const start = performance.now();
          const suite = await c.collect(file);
          file.collectDuration = performance.now() - start;
          if (suite.name || suite.tasks.length)
            file.tasks.push(suite);
        }
      }
    } catch (e) {
      file.result = {
        state: "fail",
        error: processError(e)
      };
      process.stdout.write("\0");
    }
    calculateHash(file);
    interpretTaskModes(file, config.testNamePattern);
    files.push(file);
  }
  return files;
}
function interpretTaskModes(suite, namePattern, onlyMode) {
  if (onlyMode === void 0)
    onlyMode = someTasksAreOnly(suite);
  suite.tasks.forEach((t) => {
    if (onlyMode) {
      if (t.type === "suite" && someTasksAreOnly(t)) {
        if (t.mode === "only")
          t.mode = "run";
        interpretTaskModes(t, namePattern, onlyMode);
      } else if (t.mode === "run") {
        t.mode = "skip";
      } else if (t.mode === "only") {
        t.mode = "run";
      }
    }
    if (t.type === "test") {
      if (namePattern && !t.name.match(namePattern))
        t.mode = "skip";
    } else if (t.type === "suite") {
      if (t.mode === "skip")
        skipAllTasks(t);
      if (t.mode === "run") {
        if (t.tasks.every((i) => i.mode !== "run"))
          t.mode = "skip";
      }
    }
  });
}
function someTasksAreOnly(suite) {
  return suite.tasks.some((t) => t.mode === "only" || t.type === "suite" && someTasksAreOnly(t));
}
function skipAllTasks(suite) {
  suite.tasks.forEach((t) => {
    if (t.mode === "run") {
      t.mode = "skip";
      if (t.type === "suite")
        skipAllTasks(t);
    }
  });
}
function calculateHash(parent) {
  parent.tasks.forEach((t, idx) => {
    t.id = `${parent.id}_${idx}`;
    if (t.type === "suite")
      calculateHash(t);
  });
}

async function callSuiteHook(suite, name, args) {
  if (name === "beforeEach" && suite.suite)
    await callSuiteHook(suite.suite, name, args);
  await Promise.all(getHooks(suite)[name].map((fn) => fn(...args)));
  if (name === "afterEach" && suite.suite)
    await callSuiteHook(suite.suite, name, args);
}
const packs = new Map();
let updateTimer;
let previousUpdate;
function updateTask(task) {
  packs.set(task.id, task.result);
  clearTimeout(updateTimer);
  updateTimer = setTimeout(() => {
    previousUpdate = sendTasksUpdate();
  }, 10);
}
async function sendTasksUpdate() {
  clearTimeout(updateTimer);
  await previousUpdate;
  if (packs.size) {
    const p = rpc().onTaskUpdate(Array.from(packs));
    packs.clear();
    return p;
  }
}
async function runTest(test) {
  var _a;
  if (test.mode !== "run")
    return;
  const start = performance$1.now();
  test.result = {
    state: "run"
  };
  updateTask(test);
  clearModuleMocks();
  getSnapshotClient().setTest(test);
  process.__vitest_worker__.current = test;
  try {
    await callSuiteHook(test.suite, "beforeEach", [test, test.suite]);
    setState({
      assertionCalls: 0,
      isExpectingAssertions: false,
      isExpectingAssertionsError: null,
      expectedAssertionsNumber: null,
      expectedAssertionsNumberError: null,
      testPath: (_a = test.suite.file) == null ? void 0 : _a.filepath,
      currentTestName: getFullName(test)
    });
    await getFn(test)();
    const { assertionCalls, expectedAssertionsNumber, expectedAssertionsNumberError, isExpectingAssertions, isExpectingAssertionsError } = getState();
    if (expectedAssertionsNumber !== null && assertionCalls !== expectedAssertionsNumber)
      throw expectedAssertionsNumberError;
    if (isExpectingAssertions === true && assertionCalls === 0)
      throw isExpectingAssertionsError;
    test.result.state = "pass";
  } catch (e) {
    test.result.state = "fail";
    test.result.error = processError(e);
  }
  try {
    await callSuiteHook(test.suite, "afterEach", [test, test.suite]);
  } catch (e) {
    test.result.state = "fail";
    test.result.error = processError(e);
  }
  if (test.fails) {
    if (test.result.state === "pass") {
      test.result.state = "fail";
      test.result.error = processError(new Error("Expect test to fail"));
    } else {
      test.result.state = "pass";
      test.result.error = void 0;
    }
  }
  getSnapshotClient().clearTest();
  test.result.duration = performance$1.now() - start;
  process.__vitest_worker__.current = void 0;
  updateTask(test);
}
async function runSuite(suite) {
  var _a;
  if (((_a = suite.result) == null ? void 0 : _a.state) === "fail")
    return;
  const start = performance$1.now();
  suite.result = {
    state: "run"
  };
  updateTask(suite);
  if (suite.mode === "skip") {
    suite.result.state = "skip";
  } else if (suite.mode === "todo") {
    suite.result.state = "todo";
  } else {
    try {
      await callSuiteHook(suite, "beforeAll", [suite]);
      for (const tasksGroup of partitionSuiteChildren(suite)) {
        if (tasksGroup[0].concurrent === true) {
          await Promise.all(tasksGroup.map((c) => runSuiteChild(c)));
        } else {
          for (const c of tasksGroup)
            await runSuiteChild(c);
        }
      }
      await callSuiteHook(suite, "afterAll", [suite]);
    } catch (e) {
      suite.result.state = "fail";
      suite.result.error = processError(e);
    }
  }
  suite.result.duration = performance$1.now() - start;
  if (suite.mode === "run") {
    if (!hasTests(suite)) {
      suite.result.state = "fail";
      if (!suite.result.error)
        suite.result.error = new Error(`No tests found in suite ${suite.name}`);
    } else if (hasFailed(suite)) {
      suite.result.state = "fail";
    } else {
      suite.result.state = "pass";
    }
  }
  updateTask(suite);
}
async function runSuiteChild(c) {
  return c.type === "test" ? runTest(c) : runSuite(c);
}
async function runSuites(suites) {
  for (const suite of suites)
    await runSuite(suite);
}
async function startTests(paths, config) {
  const files = await collectTests(paths, config);
  rpc().onCollected(files);
  await runSuites(files);
  await getSnapshotClient().saveSnap();
  await sendTasksUpdate();
}
function clearModuleMocks() {
  const { clearMocks, mockReset, restoreMocks } = process.__vitest_worker__.config;
  if (restoreMocks)
    vi.restoreAllMocks();
  else if (mockReset)
    vi.resetAllMocks();
  else if (clearMocks)
    vi.clearAllMocks();
}

async function run(files, config) {
  var _a;
  await setupGlobalEnv(config);
  for (const file of files) {
    const code = await promises.readFile(file, "utf-8");
    const env = ((_a = code.match(/@(?:vitest|jest)-environment\s+?([\w-]+)\b/)) == null ? void 0 : _a[1]) || config.environment || "node";
    if (!["node", "jsdom", "happy-dom"].includes(env))
      throw new Error(`Unsupported environment: ${env}`);
    process.__vitest_worker__.filepath = file;
    await withEnv(env, config.environmentOptions || {}, async () => {
      await startTests([file], config);
    });
    process.__vitest_worker__.filepath = void 0;
  }
}

export { run };
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZW50cnkuanMiLCJzb3VyY2VzIjpbIi4uL3NyYy9pbnRlZ3JhdGlvbnMvZW52L25vZGUudHMiLCIuLi9zcmMvaW50ZWdyYXRpb25zL2Vudi9qc2RvbS1rZXlzLnRzIiwiLi4vc3JjL2ludGVncmF0aW9ucy9lbnYvanNkb20udHMiLCIuLi9zcmMvaW50ZWdyYXRpb25zL2Vudi9oYXBweS1kb20udHMiLCIuLi9zcmMvaW50ZWdyYXRpb25zL2Vudi9pbmRleC50cyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy8ucG5wbS9jaGFpLXN1YnNldEAxLjYuMC9ub2RlX21vZHVsZXMvY2hhaS1zdWJzZXQvbGliL2NoYWktc3Vic2V0LmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzLy5wbnBtL2RldGVjdC1pbmRlbnRANy4wLjAvbm9kZV9tb2R1bGVzL2RldGVjdC1pbmRlbnQvaW5kZXguanMiLCIuLi9zcmMvaW50ZWdyYXRpb25zL3NuYXBzaG90L3BvcnQvaW5saW5lU25hcHNob3QudHMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvLnBucG0vbmF0dXJhbC1jb21wYXJlQDEuNC4wL25vZGVfbW9kdWxlcy9uYXR1cmFsLWNvbXBhcmUvaW5kZXguanMiLCIuLi9zcmMvaW50ZWdyYXRpb25zL3NuYXBzaG90L3BvcnQvdXRpbHMudHMiLCIuLi9zcmMvaW50ZWdyYXRpb25zL3NuYXBzaG90L3BvcnQvc3RhdGUudHMiLCIuLi9zcmMvaW50ZWdyYXRpb25zL3NuYXBzaG90L2NsaWVudC50cyIsIi4uL3NyYy9pbnRlZ3JhdGlvbnMvc25hcHNob3QvY2hhaS50cyIsIi4uL3NyYy9pbnRlZ3JhdGlvbnMvY2hhaS9qZXN0LW1hdGNoZXItdXRpbHMudHMiLCIuLi9zcmMvaW50ZWdyYXRpb25zL2NoYWkvamVzdC1leHRlbmQudHMiLCIuLi9zcmMvaW50ZWdyYXRpb25zL2NoYWkvamVzdC1hc3ltbWV0cmljLW1hdGNoZXJzLnRzIiwiLi4vc3JjL2ludGVncmF0aW9ucy9jaGFpL3NldHVwLnRzIiwiLi4vc3JjL3J1bnRpbWUvc2V0dXAudHMiLCIuLi9zcmMvcnVudGltZS9lcnJvci50cyIsIi4uL3NyYy9ydW50aW1lL2NvbGxlY3QudHMiLCIuLi9zcmMvcnVudGltZS9ydW4udHMiLCIuLi9zcmMvcnVudGltZS9lbnRyeS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgdHlwZSB7IEVudmlyb25tZW50IH0gZnJvbSAnLi4vLi4vdHlwZXMnXG5cbmV4cG9ydCBkZWZhdWx0IDxFbnZpcm9ubWVudD4oe1xuICBuYW1lOiAnbm9kZScsXG4gIGFzeW5jIHNldHVwKCkge1xuICAgIHJldHVybiB7XG4gICAgICB0ZWFyZG93bigpIHtcbiAgICAgIH0sXG4gICAgfVxuICB9LFxufSlcbiIsIi8vIFNFRSBodHRwczovL2dpdGh1Yi5jb20vanNkb20vanNkb20vYmxvYi9tYXN0ZXIvbGliL2pzZG9tL2xpdmluZy9pbnRlcmZhY2VzLmpzXG5cbmNvbnN0IExJVklOR19LRVlTID0gW1xuICAnRE9NRXhjZXB0aW9uJyxcbiAgJ1VSTCcsXG4gICdVUkxTZWFyY2hQYXJhbXMnLFxuICAnRXZlbnRUYXJnZXQnLFxuICAnTmFtZWROb2RlTWFwJyxcbiAgJ05vZGUnLFxuICAnQXR0cicsXG4gICdFbGVtZW50JyxcbiAgJ0RvY3VtZW50RnJhZ21lbnQnLFxuICAnRE9NSW1wbGVtZW50YXRpb24nLFxuICAnRG9jdW1lbnQnLFxuICAnWE1MRG9jdW1lbnQnLFxuICAnQ2hhcmFjdGVyRGF0YScsXG4gICdUZXh0JyxcbiAgJ0NEQVRBU2VjdGlvbicsXG4gICdQcm9jZXNzaW5nSW5zdHJ1Y3Rpb24nLFxuICAnQ29tbWVudCcsXG4gICdEb2N1bWVudFR5cGUnLFxuICAnTm9kZUxpc3QnLFxuICAnSFRNTENvbGxlY3Rpb24nLFxuICAnSFRNTE9wdGlvbnNDb2xsZWN0aW9uJyxcbiAgJ0RPTVN0cmluZ01hcCcsXG4gICdET01Ub2tlbkxpc3QnLFxuICAnU3R5bGVTaGVldExpc3QnLFxuICAnSFRNTEVsZW1lbnQnLFxuICAnSFRNTEhlYWRFbGVtZW50JyxcbiAgJ0hUTUxUaXRsZUVsZW1lbnQnLFxuICAnSFRNTEJhc2VFbGVtZW50JyxcbiAgJ0hUTUxMaW5rRWxlbWVudCcsXG4gICdIVE1MTWV0YUVsZW1lbnQnLFxuICAnSFRNTFN0eWxlRWxlbWVudCcsXG4gICdIVE1MQm9keUVsZW1lbnQnLFxuICAnSFRNTEhlYWRpbmdFbGVtZW50JyxcbiAgJ0hUTUxQYXJhZ3JhcGhFbGVtZW50JyxcbiAgJ0hUTUxIUkVsZW1lbnQnLFxuICAnSFRNTFByZUVsZW1lbnQnLFxuICAnSFRNTFVMaXN0RWxlbWVudCcsXG4gICdIVE1MT0xpc3RFbGVtZW50JyxcbiAgJ0hUTUxMSUVsZW1lbnQnLFxuICAnSFRNTE1lbnVFbGVtZW50JyxcbiAgJ0hUTUxETGlzdEVsZW1lbnQnLFxuICAnSFRNTERpdkVsZW1lbnQnLFxuICAnSFRNTEFuY2hvckVsZW1lbnQnLFxuICAnSFRNTEFyZWFFbGVtZW50JyxcbiAgJ0hUTUxCUkVsZW1lbnQnLFxuICAnSFRNTEJ1dHRvbkVsZW1lbnQnLFxuICAnSFRNTENhbnZhc0VsZW1lbnQnLFxuICAnSFRNTERhdGFFbGVtZW50JyxcbiAgJ0hUTUxEYXRhTGlzdEVsZW1lbnQnLFxuICAnSFRNTERldGFpbHNFbGVtZW50JyxcbiAgJ0hUTUxEaWFsb2dFbGVtZW50JyxcbiAgJ0hUTUxEaXJlY3RvcnlFbGVtZW50JyxcbiAgJ0hUTUxGaWVsZFNldEVsZW1lbnQnLFxuICAnSFRNTEZvbnRFbGVtZW50JyxcbiAgJ0hUTUxGb3JtRWxlbWVudCcsXG4gICdIVE1MSHRtbEVsZW1lbnQnLFxuICAnSFRNTEltYWdlRWxlbWVudCcsXG4gICdIVE1MSW5wdXRFbGVtZW50JyxcbiAgJ0hUTUxMYWJlbEVsZW1lbnQnLFxuICAnSFRNTExlZ2VuZEVsZW1lbnQnLFxuICAnSFRNTE1hcEVsZW1lbnQnLFxuICAnSFRNTE1hcnF1ZWVFbGVtZW50JyxcbiAgJ0hUTUxNZWRpYUVsZW1lbnQnLFxuICAnSFRNTE1ldGVyRWxlbWVudCcsXG4gICdIVE1MTW9kRWxlbWVudCcsXG4gICdIVE1MT3B0R3JvdXBFbGVtZW50JyxcbiAgJ0hUTUxPcHRpb25FbGVtZW50JyxcbiAgJ0hUTUxPdXRwdXRFbGVtZW50JyxcbiAgJ0hUTUxQaWN0dXJlRWxlbWVudCcsXG4gICdIVE1MUHJvZ3Jlc3NFbGVtZW50JyxcbiAgJ0hUTUxRdW90ZUVsZW1lbnQnLFxuICAnSFRNTFNjcmlwdEVsZW1lbnQnLFxuICAnSFRNTFNlbGVjdEVsZW1lbnQnLFxuICAnSFRNTFNsb3RFbGVtZW50JyxcbiAgJ0hUTUxTb3VyY2VFbGVtZW50JyxcbiAgJ0hUTUxTcGFuRWxlbWVudCcsXG4gICdIVE1MVGFibGVDYXB0aW9uRWxlbWVudCcsXG4gICdIVE1MVGFibGVDZWxsRWxlbWVudCcsXG4gICdIVE1MVGFibGVDb2xFbGVtZW50JyxcbiAgJ0hUTUxUYWJsZUVsZW1lbnQnLFxuICAnSFRNTFRpbWVFbGVtZW50JyxcbiAgJ0hUTUxUYWJsZVJvd0VsZW1lbnQnLFxuICAnSFRNTFRhYmxlU2VjdGlvbkVsZW1lbnQnLFxuICAnSFRNTFRlbXBsYXRlRWxlbWVudCcsXG4gICdIVE1MVGV4dEFyZWFFbGVtZW50JyxcbiAgJ0hUTUxVbmtub3duRWxlbWVudCcsXG4gICdIVE1MRnJhbWVFbGVtZW50JyxcbiAgJ0hUTUxGcmFtZVNldEVsZW1lbnQnLFxuICAnSFRNTElGcmFtZUVsZW1lbnQnLFxuICAnSFRNTEVtYmVkRWxlbWVudCcsXG4gICdIVE1MT2JqZWN0RWxlbWVudCcsXG4gICdIVE1MUGFyYW1FbGVtZW50JyxcbiAgJ0hUTUxWaWRlb0VsZW1lbnQnLFxuICAnSFRNTEF1ZGlvRWxlbWVudCcsXG4gICdIVE1MVHJhY2tFbGVtZW50JyxcbiAgJ1NWR0VsZW1lbnQnLFxuICAnU1ZHR3JhcGhpY3NFbGVtZW50JyxcbiAgJ1NWR1NWR0VsZW1lbnQnLFxuICAnU1ZHVGl0bGVFbGVtZW50JyxcbiAgJ1NWR0FuaW1hdGVkU3RyaW5nJyxcbiAgJ1NWR051bWJlcicsXG4gICdTVkdTdHJpbmdMaXN0JyxcbiAgJ0V2ZW50JyxcbiAgJ0Nsb3NlRXZlbnQnLFxuICAnQ3VzdG9tRXZlbnQnLFxuICAnTWVzc2FnZUV2ZW50JyxcbiAgJ0Vycm9yRXZlbnQnLFxuICAnSGFzaENoYW5nZUV2ZW50JyxcbiAgJ1BvcFN0YXRlRXZlbnQnLFxuICAnU3RvcmFnZUV2ZW50JyxcbiAgJ1Byb2dyZXNzRXZlbnQnLFxuICAnUGFnZVRyYW5zaXRpb25FdmVudCcsXG4gICdVSUV2ZW50JyxcbiAgJ0ZvY3VzRXZlbnQnLFxuICAnSW5wdXRFdmVudCcsXG4gICdNb3VzZUV2ZW50JyxcbiAgJ0tleWJvYXJkRXZlbnQnLFxuICAnVG91Y2hFdmVudCcsXG4gICdDb21wb3NpdGlvbkV2ZW50JyxcbiAgJ1doZWVsRXZlbnQnLFxuICAnQmFyUHJvcCcsXG4gICdFeHRlcm5hbCcsXG4gICdMb2NhdGlvbicsXG4gICdIaXN0b3J5JyxcbiAgJ1NjcmVlbicsXG4gICdQZXJmb3JtYW5jZScsXG4gICdOYXZpZ2F0b3InLFxuICAnUGx1Z2luQXJyYXknLFxuICAnTWltZVR5cGVBcnJheScsXG4gICdQbHVnaW4nLFxuICAnTWltZVR5cGUnLFxuICAnRmlsZVJlYWRlcicsXG4gICdCbG9iJyxcbiAgJ0ZpbGUnLFxuICAnRmlsZUxpc3QnLFxuICAnVmFsaWRpdHlTdGF0ZScsXG4gICdET01QYXJzZXInLFxuICAnWE1MU2VyaWFsaXplcicsXG4gICdGb3JtRGF0YScsXG4gICdYTUxIdHRwUmVxdWVzdEV2ZW50VGFyZ2V0JyxcbiAgJ1hNTEh0dHBSZXF1ZXN0VXBsb2FkJyxcbiAgJ1hNTEh0dHBSZXF1ZXN0JyxcbiAgJ1dlYlNvY2tldCcsXG4gICdOb2RlRmlsdGVyJyxcbiAgJ05vZGVJdGVyYXRvcicsXG4gICdUcmVlV2Fsa2VyJyxcbiAgJ0Fic3RyYWN0UmFuZ2UnLFxuICAnUmFuZ2UnLFxuICAnU3RhdGljUmFuZ2UnLFxuICAnU2VsZWN0aW9uJyxcbiAgJ1N0b3JhZ2UnLFxuICAnQ3VzdG9tRWxlbWVudFJlZ2lzdHJ5JyxcbiAgJ1NoYWRvd1Jvb3QnLFxuICAnTXV0YXRpb25PYnNlcnZlcicsXG4gICdNdXRhdGlvblJlY29yZCcsXG4gICdIZWFkZXJzJyxcbiAgJ0Fib3J0Q29udHJvbGxlcicsXG4gICdBYm9ydFNpZ25hbCcsXG5cbiAgLy8gbm90IHNwZWNpZmllZCBpbiBkb2NzLCBidXQgaXMgYXZhaWxhYmxlXG4gICdJbWFnZScsXG5dXG5cbmNvbnN0IE9USEVSX0tFWVMgPSBbXG4gICdhZGRFdmVudExpc3RlbmVyJyxcbiAgJ2FsZXJ0JyxcbiAgJ2F0b2InLFxuICAnYmx1cicsXG4gICdidG9hJyxcbiAgLyogJ2NsZWFySW50ZXJ2YWwnLCAqL1xuICAvKiAnY2xlYXJUaW1lb3V0JywgKi9cbiAgJ2Nsb3NlJyxcbiAgJ2NvbmZpcm0nLFxuICAvKiAnY29uc29sZScsICovXG4gICdjcmVhdGVQb3B1cCcsXG4gICdkaXNwYXRjaEV2ZW50JyxcbiAgJ2RvY3VtZW50JyxcbiAgJ2ZvY3VzJyxcbiAgJ2ZyYW1lcycsXG4gICdnZXRDb21wdXRlZFN0eWxlJyxcbiAgJ2hpc3RvcnknLFxuICAnaW5uZXJIZWlnaHQnLFxuICAnaW5uZXJXaWR0aCcsXG4gICdsZW5ndGgnLFxuICAnbG9jYXRpb24nLFxuICAnbWF0Y2hNZWRpYScsXG4gICdtb3ZlQnknLFxuICAnbW92ZVRvJyxcbiAgJ25hbWUnLFxuICAnbmF2aWdhdG9yJyxcbiAgJ29wZW4nLFxuICAnb3V0ZXJIZWlnaHQnLFxuICAnb3V0ZXJXaWR0aCcsXG4gICdwYWdlWE9mZnNldCcsXG4gICdwYWdlWU9mZnNldCcsXG4gICdwYXJlbnQnLFxuICAncG9zdE1lc3NhZ2UnLFxuICAncHJpbnQnLFxuICAncHJvbXB0JyxcbiAgJ3JlbW92ZUV2ZW50TGlzdGVuZXInLFxuICAncmVzaXplQnknLFxuICAncmVzaXplVG8nLFxuICAnc2NyZWVuJyxcbiAgJ3NjcmVlbkxlZnQnLFxuICAnc2NyZWVuVG9wJyxcbiAgJ3NjcmVlblgnLFxuICAnc2NyZWVuWScsXG4gICdzY3JvbGwnLFxuICAnc2Nyb2xsQnknLFxuICAnc2Nyb2xsTGVmdCcsXG4gICdzY3JvbGxUbycsXG4gICdzY3JvbGxUb3AnLFxuICAnc2Nyb2xsWCcsXG4gICdzY3JvbGxZJyxcbiAgJ3NlbGYnLFxuICAvKiAnc2V0SW50ZXJ2YWwnLCAqL1xuICAvKiAnc2V0VGltZW91dCcsICovXG4gICdzdG9wJyxcbiAgLyogJ3RvU3RyaW5nJywgKi9cbiAgJ3RvcCcsXG4gICd3aW5kb3cnLFxuXVxuXG5leHBvcnQgY29uc3QgS0VZUyA9IExJVklOR19LRVlTLmNvbmNhdChPVEhFUl9LRVlTKVxuIiwiaW1wb3J0IHsgaW1wb3J0TW9kdWxlIH0gZnJvbSAnbG9jYWwtcGtnJ1xuaW1wb3J0IHR5cGUgeyBFbnZpcm9ubWVudCwgSlNET01PcHRpb25zIH0gZnJvbSAnLi4vLi4vdHlwZXMnXG5pbXBvcnQgeyBLRVlTIH0gZnJvbSAnLi9qc2RvbS1rZXlzJ1xuXG5leHBvcnQgZGVmYXVsdCA8RW52aXJvbm1lbnQ+KHtcbiAgbmFtZTogJ2pzZG9tJyxcbiAgYXN5bmMgc2V0dXAoZ2xvYmFsLCB7IGpzZG9tID0ge30gfSkge1xuICAgIGNvbnN0IHtcbiAgICAgIENvb2tpZUphcixcbiAgICAgIEpTRE9NLFxuICAgICAgUmVzb3VyY2VMb2FkZXIsXG4gICAgICBWaXJ0dWFsQ29uc29sZSxcbiAgICB9ID0gYXdhaXQgaW1wb3J0TW9kdWxlKCdqc2RvbScpIGFzIHR5cGVvZiBpbXBvcnQoJ2pzZG9tJylcbiAgICBjb25zdCB7XG4gICAgICBodG1sID0gJzwhRE9DVFlQRSBodG1sPicsXG4gICAgICB1c2VyQWdlbnQsXG4gICAgICB1cmwgPSAnaHR0cDovL2xvY2FsaG9zdDozMDAwJyxcbiAgICAgIGNvbnRlbnRUeXBlID0gJ3RleHQvaHRtbCcsXG4gICAgICBwcmV0ZW5kVG9CZVZpc3VhbCA9IHRydWUsXG4gICAgICBpbmNsdWRlTm9kZUxvY2F0aW9ucyA9IGZhbHNlLFxuICAgICAgcnVuU2NyaXB0cyA9ICdkYW5nZXJvdXNseScsXG4gICAgICByZXNvdXJjZXMsXG4gICAgICBjb25zb2xlID0gZmFsc2UsXG4gICAgICBjb29raWVKYXIgPSBmYWxzZSxcbiAgICAgIC4uLnJlc3RPcHRpb25zXG4gICAgfSA9IGpzZG9tIGFzIEpTRE9NT3B0aW9uc1xuICAgIGNvbnN0IGRvbSA9IG5ldyBKU0RPTShcbiAgICAgIGh0bWwsXG4gICAgICB7XG4gICAgICAgIHByZXRlbmRUb0JlVmlzdWFsLFxuICAgICAgICByZXNvdXJjZXM6IHJlc291cmNlcyA/PyAodXNlckFnZW50ID8gbmV3IFJlc291cmNlTG9hZGVyKHsgdXNlckFnZW50IH0pIDogdW5kZWZpbmVkKSxcbiAgICAgICAgcnVuU2NyaXB0cyxcbiAgICAgICAgdXJsLFxuICAgICAgICB2aXJ0dWFsQ29uc29sZTogY29uc29sZSAmJiBnbG9iYWwuY29uc29sZSA/IG5ldyBWaXJ0dWFsQ29uc29sZSgpLnNlbmRUbyhnbG9iYWwuY29uc29sZSkgOiB1bmRlZmluZWQsXG4gICAgICAgIGNvb2tpZUphcjogY29va2llSmFyID8gbmV3IENvb2tpZUphcigpIDogdW5kZWZpbmVkLFxuICAgICAgICBpbmNsdWRlTm9kZUxvY2F0aW9ucyxcbiAgICAgICAgY29udGVudFR5cGUsXG4gICAgICAgIHVzZXJBZ2VudCxcbiAgICAgICAgLi4ucmVzdE9wdGlvbnMsXG4gICAgICB9LFxuICAgIClcblxuICAgIGNvbnN0IGtleXMgPSBuZXcgU2V0KEtFWVMuY29uY2F0KE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzKGRvbS53aW5kb3cpKVxuICAgICAgLmZpbHRlcihrID0+ICFrLnN0YXJ0c1dpdGgoJ18nKSAmJiAhKGsgaW4gZ2xvYmFsKSkpXG5cbiAgICBjb25zdCBvdmVycmlkZU9iamVjdCA9IG5ldyBNYXA8c3RyaW5nLCBhbnk+KClcbiAgICBmb3IgKGNvbnN0IGtleSBvZiBrZXlzKSB7XG4gICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoZ2xvYmFsLCBrZXksIHtcbiAgICAgICAgZ2V0KCkge1xuICAgICAgICAgIGlmIChvdmVycmlkZU9iamVjdC5oYXMoa2V5KSlcbiAgICAgICAgICAgIHJldHVybiBvdmVycmlkZU9iamVjdC5nZXQoa2V5KVxuICAgICAgICAgIHJldHVybiBkb20ud2luZG93W2tleV1cbiAgICAgICAgfSxcbiAgICAgICAgc2V0KHYpIHtcbiAgICAgICAgICBvdmVycmlkZU9iamVjdC5zZXQoa2V5LCB2KVxuICAgICAgICB9LFxuICAgICAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgICB9KVxuICAgIH1cblxuICAgIHJldHVybiB7XG4gICAgICB0ZWFyZG93bihnbG9iYWwpIHtcbiAgICAgICAga2V5cy5mb3JFYWNoKGtleSA9PiBkZWxldGUgZ2xvYmFsW2tleV0pXG4gICAgICB9LFxuICAgIH1cbiAgfSxcbn0pXG4iLCJpbXBvcnQgeyBpbXBvcnRNb2R1bGUgfSBmcm9tICdsb2NhbC1wa2cnXG5pbXBvcnQgdHlwZSB7IEVudmlyb25tZW50IH0gZnJvbSAnLi4vLi4vdHlwZXMnXG5pbXBvcnQgeyBLRVlTIH0gZnJvbSAnLi9qc2RvbS1rZXlzJ1xuXG5leHBvcnQgZGVmYXVsdCA8RW52aXJvbm1lbnQ+KHtcbiAgbmFtZTogJ2hhcHB5LWRvbScsXG4gIGFzeW5jIHNldHVwKGdsb2JhbCkge1xuICAgIGNvbnN0IHsgV2luZG93IH0gPSBhd2FpdCBpbXBvcnRNb2R1bGUoJ2hhcHB5LWRvbScpIGFzIHR5cGVvZiBpbXBvcnQoJ2hhcHB5LWRvbScpXG4gICAgY29uc3Qgd2luOiBhbnkgPSBuZXcgV2luZG93KClcblxuICAgIGNvbnN0IGtleXMgPSBuZXcgU2V0KEtFWVMuY29uY2F0KE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzKHdpbikpXG4gICAgICAuZmlsdGVyKGsgPT4gIWsuc3RhcnRzV2l0aCgnXycpICYmICEoayBpbiBnbG9iYWwpKSlcblxuICAgIGNvbnN0IG92ZXJyaWRlT2JqZWN0ID0gbmV3IE1hcDxzdHJpbmcsIGFueT4oKVxuICAgIGZvciAoY29uc3Qga2V5IG9mIGtleXMpIHtcbiAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShnbG9iYWwsIGtleSwge1xuICAgICAgICBnZXQoKSB7XG4gICAgICAgICAgaWYgKG92ZXJyaWRlT2JqZWN0LmhhcyhrZXkpKVxuICAgICAgICAgICAgcmV0dXJuIG92ZXJyaWRlT2JqZWN0LmdldChrZXkpXG4gICAgICAgICAgcmV0dXJuIHdpbltrZXldXG4gICAgICAgIH0sXG4gICAgICAgIHNldCh2KSB7XG4gICAgICAgICAgb3ZlcnJpZGVPYmplY3Quc2V0KGtleSwgdilcbiAgICAgICAgfSxcbiAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgICAgfSlcbiAgICB9XG5cbiAgICByZXR1cm4ge1xuICAgICAgdGVhcmRvd24oZ2xvYmFsKSB7XG4gICAgICAgIHdpbi5oYXBweURPTS5jYW5jZWxBc3luYygpXG4gICAgICAgIGtleXMuZm9yRWFjaChrZXkgPT4gZGVsZXRlIGdsb2JhbFtrZXldKVxuICAgICAgfSxcbiAgICB9XG4gIH0sXG59KVxuIiwiaW1wb3J0IG5vZGUgZnJvbSAnLi9ub2RlJ1xuaW1wb3J0IGpzZG9tIGZyb20gJy4vanNkb20nXG5pbXBvcnQgaGFwcHkgZnJvbSAnLi9oYXBweS1kb20nXG5cbmV4cG9ydCBjb25zdCBlbnZpcm9ubWVudHMgPSB7XG4gIG5vZGUsXG4gIGpzZG9tLFxuICAnaGFwcHktZG9tJzogaGFwcHksXG59XG4iLCIoZnVuY3Rpb24oKSB7XG5cdChmdW5jdGlvbihjaGFpU3Vic2V0KSB7XG5cdFx0aWYgKHR5cGVvZiByZXF1aXJlID09PSAnZnVuY3Rpb24nICYmIHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0JyAmJiB0eXBlb2YgbW9kdWxlID09PSAnb2JqZWN0Jykge1xuXHRcdFx0cmV0dXJuIG1vZHVsZS5leHBvcnRzID0gY2hhaVN1YnNldDtcblx0XHR9IGVsc2UgaWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCkge1xuXHRcdFx0cmV0dXJuIGRlZmluZShmdW5jdGlvbigpIHtcblx0XHRcdFx0cmV0dXJuIGNoYWlTdWJzZXQ7XG5cdFx0XHR9KTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0cmV0dXJuIGNoYWkudXNlKGNoYWlTdWJzZXQpO1xuXHRcdH1cblx0fSkoZnVuY3Rpb24oY2hhaSwgdXRpbHMpIHtcblx0XHR2YXIgQXNzZXJ0aW9uID0gY2hhaS5Bc3NlcnRpb247XG5cdFx0dmFyIGFzc2VydGlvblByb3RvdHlwZSA9IEFzc2VydGlvbi5wcm90b3R5cGU7XG5cblx0XHRBc3NlcnRpb24uYWRkTWV0aG9kKCdjb250YWluU3Vic2V0JywgZnVuY3Rpb24gKGV4cGVjdGVkKSB7XG5cdFx0XHR2YXIgYWN0dWFsID0gdXRpbHMuZmxhZyh0aGlzLCAnb2JqZWN0Jyk7XG5cdFx0XHR2YXIgc2hvd0RpZmYgPSBjaGFpLmNvbmZpZy5zaG93RGlmZjtcblxuXHRcdFx0YXNzZXJ0aW9uUHJvdG90eXBlLmFzc2VydC5jYWxsKHRoaXMsXG5cdFx0XHRcdGNvbXBhcmUoZXhwZWN0ZWQsIGFjdHVhbCksXG5cdFx0XHRcdCdleHBlY3RlZCAje2FjdH0gdG8gY29udGFpbiBzdWJzZXQgI3tleHB9Jyxcblx0XHRcdFx0J2V4cGVjdGVkICN7YWN0fSB0byBub3QgY29udGFpbiBzdWJzZXQgI3tleHB9Jyxcblx0XHRcdFx0ZXhwZWN0ZWQsXG5cdFx0XHRcdGFjdHVhbCxcblx0XHRcdFx0c2hvd0RpZmZcblx0XHRcdCk7XG5cdFx0fSk7XG5cblx0XHRjaGFpLmFzc2VydC5jb250YWluU3Vic2V0ID0gZnVuY3Rpb24odmFsLCBleHAsIG1zZykge1xuXHRcdFx0bmV3IGNoYWkuQXNzZXJ0aW9uKHZhbCwgbXNnKS50by5iZS5jb250YWluU3Vic2V0KGV4cCk7XG5cdFx0fTtcblxuXHRcdGZ1bmN0aW9uIGNvbXBhcmUoZXhwZWN0ZWQsIGFjdHVhbCkge1xuXHRcdFx0aWYgKGV4cGVjdGVkID09PSBhY3R1YWwpIHtcblx0XHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0XHR9XG5cdFx0XHRpZiAodHlwZW9mKGFjdHVhbCkgIT09IHR5cGVvZihleHBlY3RlZCkpIHtcblx0XHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdFx0fVxuXHRcdFx0aWYgKHR5cGVvZihleHBlY3RlZCkgIT09ICdvYmplY3QnIHx8IGV4cGVjdGVkID09PSBudWxsKSB7XG5cdFx0XHRcdHJldHVybiBleHBlY3RlZCA9PT0gYWN0dWFsO1xuXHRcdFx0fVxuXHRcdFx0aWYgKCEhZXhwZWN0ZWQgJiYgIWFjdHVhbCkge1xuXHRcdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0XHR9XG5cblx0XHRcdGlmIChBcnJheS5pc0FycmF5KGV4cGVjdGVkKSkge1xuXHRcdFx0XHRpZiAodHlwZW9mKGFjdHVhbC5sZW5ndGgpICE9PSAnbnVtYmVyJykge1xuXHRcdFx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRcdFx0fVxuXHRcdFx0XHR2YXIgYWEgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhY3R1YWwpO1xuXHRcdFx0XHRyZXR1cm4gZXhwZWN0ZWQuZXZlcnkoZnVuY3Rpb24gKGV4cCkge1xuXHRcdFx0XHRcdHJldHVybiBhYS5zb21lKGZ1bmN0aW9uIChhY3QpIHtcblx0XHRcdFx0XHRcdHJldHVybiBjb21wYXJlKGV4cCwgYWN0KTtcblx0XHRcdFx0XHR9KTtcblx0XHRcdFx0fSk7XG5cdFx0XHR9XG5cblx0XHRcdGlmIChleHBlY3RlZCBpbnN0YW5jZW9mIERhdGUpIHtcblx0XHRcdFx0aWYgKGFjdHVhbCBpbnN0YW5jZW9mIERhdGUpIHtcblx0XHRcdFx0XHRyZXR1cm4gZXhwZWN0ZWQuZ2V0VGltZSgpID09PSBhY3R1YWwuZ2V0VGltZSgpO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHRyZXR1cm4gT2JqZWN0LmtleXMoZXhwZWN0ZWQpLmV2ZXJ5KGZ1bmN0aW9uIChrZXkpIHtcblx0XHRcdFx0dmFyIGVvID0gZXhwZWN0ZWRba2V5XTtcblx0XHRcdFx0dmFyIGFvID0gYWN0dWFsW2tleV07XG5cdFx0XHRcdGlmICh0eXBlb2YoZW8pID09PSAnb2JqZWN0JyAmJiBlbyAhPT0gbnVsbCAmJiBhbyAhPT0gbnVsbCkge1xuXHRcdFx0XHRcdHJldHVybiBjb21wYXJlKGVvLCBhbyk7XG5cdFx0XHRcdH1cblx0XHRcdFx0aWYgKHR5cGVvZihlbykgPT09ICdmdW5jdGlvbicpIHtcblx0XHRcdFx0XHRyZXR1cm4gZW8oYW8pO1xuXHRcdFx0XHR9XG5cdFx0XHRcdHJldHVybiBhbyA9PT0gZW87XG5cdFx0XHR9KTtcblx0XHR9XG5cdH0pO1xuXG59KS5jYWxsKHRoaXMpO1xuXG4iLCIvLyBEZXRlY3QgZWl0aGVyIHNwYWNlcyBvciB0YWJzIGJ1dCBub3QgYm90aCB0byBwcm9wZXJseSBoYW5kbGUgdGFicyBmb3IgaW5kZW50YXRpb24gYW5kIHNwYWNlcyBmb3IgYWxpZ25tZW50XG5jb25zdCBJTkRFTlRfUkVHRVggPSAvXig/OiggKSt8XFx0KykvO1xuXG5jb25zdCBJTkRFTlRfVFlQRV9TUEFDRSA9ICdzcGFjZSc7XG5jb25zdCBJTkRFTlRfVFlQRV9UQUIgPSAndGFiJztcblxuLyoqXG5NYWtlIGEgTWFwIHRoYXQgY291bnRzIGhvdyBtYW55IGluZGVudHMvdW5pbmRlbnRzIGhhdmUgb2NjdXJyZWQgZm9yIGEgZ2l2ZW4gc2l6ZSBhbmQgaG93IG1hbnkgbGluZXMgZm9sbG93IGEgZ2l2ZW4gaW5kZW50YXRpb24uXG5cblRoZSBrZXkgaXMgYSBjb25jYXRlbmF0aW9uIG9mIHRoZSBpbmRlbnRhdGlvbiB0eXBlIChzID0gc3BhY2UgYW5kIHQgPSB0YWIpIGFuZCB0aGUgc2l6ZSBvZiB0aGUgaW5kZW50cy91bmluZGVudHMuXG5cbmBgYFxuaW5kZW50cyA9IHtcblx0dDM6IFsxLCAwXSxcblx0dDQ6IFsxLCA1XSxcblx0czU6IFsxLCAwXSxcblx0czEyOiBbMSwgMF0sXG59XG5gYGBcbiovXG5mdW5jdGlvbiBtYWtlSW5kZW50c01hcChzdHJpbmcsIGlnbm9yZVNpbmdsZVNwYWNlcykge1xuXHRjb25zdCBpbmRlbnRzID0gbmV3IE1hcCgpO1xuXG5cdC8vIFJlbWVtYmVyIHRoZSBzaXplIG9mIHByZXZpb3VzIGxpbmUncyBpbmRlbnRhdGlvblxuXHRsZXQgcHJldmlvdXNTaXplID0gMDtcblx0bGV0IHByZXZpb3VzSW5kZW50VHlwZTtcblxuXHQvLyBJbmRlbnRzIGtleSAoaWRlbnQgdHlwZSArIHNpemUgb2YgdGhlIGluZGVudHMvdW5pbmRlbnRzKVxuXHRsZXQga2V5O1xuXG5cdGZvciAoY29uc3QgbGluZSBvZiBzdHJpbmcuc3BsaXQoL1xcbi9nKSkge1xuXHRcdGlmICghbGluZSkge1xuXHRcdFx0Ly8gSWdub3JlIGVtcHR5IGxpbmVzXG5cdFx0XHRjb250aW51ZTtcblx0XHR9XG5cblx0XHRsZXQgaW5kZW50O1xuXHRcdGxldCBpbmRlbnRUeXBlO1xuXHRcdGxldCB3ZWlnaHQ7XG5cdFx0bGV0IGVudHJ5O1xuXHRcdGNvbnN0IG1hdGNoZXMgPSBsaW5lLm1hdGNoKElOREVOVF9SRUdFWCk7XG5cblx0XHRpZiAobWF0Y2hlcyA9PT0gbnVsbCkge1xuXHRcdFx0cHJldmlvdXNTaXplID0gMDtcblx0XHRcdHByZXZpb3VzSW5kZW50VHlwZSA9ICcnO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRpbmRlbnQgPSBtYXRjaGVzWzBdLmxlbmd0aDtcblx0XHRcdGluZGVudFR5cGUgPSBtYXRjaGVzWzFdID8gSU5ERU5UX1RZUEVfU1BBQ0UgOiBJTkRFTlRfVFlQRV9UQUI7XG5cblx0XHRcdC8vIElnbm9yZSBzaW5nbGUgc3BhY2UgdW5sZXNzIGl0J3MgdGhlIG9ubHkgaW5kZW50IGRldGVjdGVkIHRvIHByZXZlbnQgY29tbW9uIGZhbHNlIHBvc2l0aXZlc1xuXHRcdFx0aWYgKGlnbm9yZVNpbmdsZVNwYWNlcyAmJiBpbmRlbnRUeXBlID09PSBJTkRFTlRfVFlQRV9TUEFDRSAmJiBpbmRlbnQgPT09IDEpIHtcblx0XHRcdFx0Y29udGludWU7XG5cdFx0XHR9XG5cblx0XHRcdGlmIChpbmRlbnRUeXBlICE9PSBwcmV2aW91c0luZGVudFR5cGUpIHtcblx0XHRcdFx0cHJldmlvdXNTaXplID0gMDtcblx0XHRcdH1cblxuXHRcdFx0cHJldmlvdXNJbmRlbnRUeXBlID0gaW5kZW50VHlwZTtcblxuXHRcdFx0d2VpZ2h0ID0gMDtcblxuXHRcdFx0Y29uc3QgaW5kZW50RGlmZmVyZW5jZSA9IGluZGVudCAtIHByZXZpb3VzU2l6ZTtcblx0XHRcdHByZXZpb3VzU2l6ZSA9IGluZGVudDtcblxuXHRcdFx0Ly8gUHJldmlvdXMgbGluZSBoYXZlIHNhbWUgaW5kZW50P1xuXHRcdFx0aWYgKGluZGVudERpZmZlcmVuY2UgPT09IDApIHtcblx0XHRcdFx0d2VpZ2h0Kys7XG5cdFx0XHRcdC8vIFdlIHVzZSB0aGUga2V5IGZyb20gcHJldmlvdXMgbG9vcFxuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0Y29uc3QgYWJzb2x1dGVJbmRlbnREaWZmZXJlbmNlID0gaW5kZW50RGlmZmVyZW5jZSA+IDAgPyBpbmRlbnREaWZmZXJlbmNlIDogLWluZGVudERpZmZlcmVuY2U7XG5cdFx0XHRcdGtleSA9IGVuY29kZUluZGVudHNLZXkoaW5kZW50VHlwZSwgYWJzb2x1dGVJbmRlbnREaWZmZXJlbmNlKTtcblx0XHRcdH1cblxuXHRcdFx0Ly8gVXBkYXRlIHRoZSBzdGF0c1xuXHRcdFx0ZW50cnkgPSBpbmRlbnRzLmdldChrZXkpO1xuXHRcdFx0ZW50cnkgPSBlbnRyeSA9PT0gdW5kZWZpbmVkID8gWzEsIDBdIDogWysrZW50cnlbMF0sIGVudHJ5WzFdICsgd2VpZ2h0XTtcblxuXHRcdFx0aW5kZW50cy5zZXQoa2V5LCBlbnRyeSk7XG5cdFx0fVxuXHR9XG5cblx0cmV0dXJuIGluZGVudHM7XG59XG5cbi8vIEVuY29kZSB0aGUgaW5kZW50IHR5cGUgYW5kIGFtb3VudCBhcyBhIHN0cmluZyAoZS5nLiAnczQnKSBmb3IgdXNlIGFzIGEgY29tcG91bmQga2V5IGluIHRoZSBpbmRlbnRzIE1hcC5cbmZ1bmN0aW9uIGVuY29kZUluZGVudHNLZXkoaW5kZW50VHlwZSwgaW5kZW50QW1vdW50KSB7XG5cdGNvbnN0IHR5cGVDaGFyYWN0ZXIgPSBpbmRlbnRUeXBlID09PSBJTkRFTlRfVFlQRV9TUEFDRSA/ICdzJyA6ICd0Jztcblx0cmV0dXJuIHR5cGVDaGFyYWN0ZXIgKyBTdHJpbmcoaW5kZW50QW1vdW50KTtcbn1cblxuLy8gRXh0cmFjdCB0aGUgaW5kZW50IHR5cGUgYW5kIGFtb3VudCBmcm9tIGEga2V5IG9mIHRoZSBpbmRlbnRzIE1hcC5cbmZ1bmN0aW9uIGRlY29kZUluZGVudHNLZXkoaW5kZW50c0tleSkge1xuXHRjb25zdCBrZXlIYXNUeXBlU3BhY2UgPSBpbmRlbnRzS2V5WzBdID09PSAncyc7XG5cdGNvbnN0IHR5cGUgPSBrZXlIYXNUeXBlU3BhY2UgPyBJTkRFTlRfVFlQRV9TUEFDRSA6IElOREVOVF9UWVBFX1RBQjtcblxuXHRjb25zdCBhbW91bnQgPSBOdW1iZXIoaW5kZW50c0tleS5zbGljZSgxKSk7XG5cblx0cmV0dXJuIHt0eXBlLCBhbW91bnR9O1xufVxuXG4vLyBSZXR1cm4gdGhlIGtleSAoZS5nLiAnczQnKSBmcm9tIHRoZSBpbmRlbnRzIE1hcCB0aGF0IHJlcHJlc2VudHMgdGhlIG1vc3QgY29tbW9uIGluZGVudCxcbi8vIG9yIHJldHVybiB1bmRlZmluZWQgaWYgdGhlcmUgYXJlIG5vIGluZGVudHMuXG5mdW5jdGlvbiBnZXRNb3N0VXNlZEtleShpbmRlbnRzKSB7XG5cdGxldCByZXN1bHQ7XG5cdGxldCBtYXhVc2VkID0gMDtcblx0bGV0IG1heFdlaWdodCA9IDA7XG5cblx0Zm9yIChjb25zdCBba2V5LCBbdXNlZENvdW50LCB3ZWlnaHRdXSBvZiBpbmRlbnRzKSB7XG5cdFx0aWYgKHVzZWRDb3VudCA+IG1heFVzZWQgfHwgKHVzZWRDb3VudCA9PT0gbWF4VXNlZCAmJiB3ZWlnaHQgPiBtYXhXZWlnaHQpKSB7XG5cdFx0XHRtYXhVc2VkID0gdXNlZENvdW50O1xuXHRcdFx0bWF4V2VpZ2h0ID0gd2VpZ2h0O1xuXHRcdFx0cmVzdWx0ID0ga2V5O1xuXHRcdH1cblx0fVxuXG5cdHJldHVybiByZXN1bHQ7XG59XG5cbmZ1bmN0aW9uIG1ha2VJbmRlbnRTdHJpbmcodHlwZSwgYW1vdW50KSB7XG5cdGNvbnN0IGluZGVudENoYXJhY3RlciA9IHR5cGUgPT09IElOREVOVF9UWVBFX1NQQUNFID8gJyAnIDogJ1xcdCc7XG5cdHJldHVybiBpbmRlbnRDaGFyYWN0ZXIucmVwZWF0KGFtb3VudCk7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGRldGVjdEluZGVudChzdHJpbmcpIHtcblx0aWYgKHR5cGVvZiBzdHJpbmcgIT09ICdzdHJpbmcnKSB7XG5cdFx0dGhyb3cgbmV3IFR5cGVFcnJvcignRXhwZWN0ZWQgYSBzdHJpbmcnKTtcblx0fVxuXG5cdC8vIElkZW50aWZ5IGluZGVudHMgd2hpbGUgc2tpcHBpbmcgc2luZ2xlIHNwYWNlIGluZGVudHMgdG8gYXZvaWQgY29tbW9uIGVkZ2UgY2FzZXMgKGUuZy4gY29kZSBjb21tZW50cylcblx0Ly8gSWYgbm8gaW5kZW50cyBhcmUgaWRlbnRpZmllZCwgcnVuIGFnYWluIGFuZCBpbmNsdWRlIGFsbCBpbmRlbnRzIGZvciBjb21wcmVoZW5zaXZlIGRldGVjdGlvblxuXHRsZXQgaW5kZW50cyA9IG1ha2VJbmRlbnRzTWFwKHN0cmluZywgdHJ1ZSk7XG5cdGlmIChpbmRlbnRzLnNpemUgPT09IDApIHtcblx0XHRpbmRlbnRzID0gbWFrZUluZGVudHNNYXAoc3RyaW5nLCBmYWxzZSk7XG5cdH1cblxuXHRjb25zdCBrZXlPZk1vc3RVc2VkSW5kZW50ID0gZ2V0TW9zdFVzZWRLZXkoaW5kZW50cyk7XG5cblx0bGV0IHR5cGU7XG5cdGxldCBhbW91bnQgPSAwO1xuXHRsZXQgaW5kZW50ID0gJyc7XG5cblx0aWYgKGtleU9mTW9zdFVzZWRJbmRlbnQgIT09IHVuZGVmaW5lZCkge1xuXHRcdCh7dHlwZSwgYW1vdW50fSA9IGRlY29kZUluZGVudHNLZXkoa2V5T2ZNb3N0VXNlZEluZGVudCkpO1xuXHRcdGluZGVudCA9IG1ha2VJbmRlbnRTdHJpbmcodHlwZSwgYW1vdW50KTtcblx0fVxuXG5cdHJldHVybiB7XG5cdFx0YW1vdW50LFxuXHRcdHR5cGUsXG5cdFx0aW5kZW50LFxuXHR9O1xufVxuIiwiaW1wb3J0IHsgcHJvbWlzZXMgYXMgZnMgfSBmcm9tICdmcydcbmltcG9ydCB0eXBlIE1hZ2ljU3RyaW5nIGZyb20gJ21hZ2ljLXN0cmluZydcbmltcG9ydCBkZXRlY3RJbmRlbnQgZnJvbSAnZGV0ZWN0LWluZGVudCdcbmltcG9ydCB7IHJwYyB9IGZyb20gJy4uLy4uLy4uL3J1bnRpbWUvcnBjJ1xuaW1wb3J0IHsgZ2V0T3JpZ2luYWxQb3MsIHBvc1RvTnVtYmVyIH0gZnJvbSAnLi4vLi4vLi4vdXRpbHMvc291cmNlLW1hcCdcbmltcG9ydCB7IGdldENhbGxMYXN0SW5kZXggfSBmcm9tICcuLi8uLi8uLi91dGlscydcblxuZXhwb3J0IGludGVyZmFjZSBJbmxpbmVTbmFwc2hvdCB7XG4gIHNuYXBzaG90OiBzdHJpbmdcbiAgZmlsZTogc3RyaW5nXG4gIGxpbmU6IG51bWJlclxuICBjb2x1bW46IG51bWJlclxufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gc2F2ZUlubGluZVNuYXBzaG90cyhcbiAgc25hcHNob3RzOiBBcnJheTxJbmxpbmVTbmFwc2hvdD4sXG4pIHtcbiAgY29uc3QgTWFnaWNTdHJpbmcgPSAoYXdhaXQgaW1wb3J0KCdtYWdpYy1zdHJpbmcnKSkuZGVmYXVsdFxuICBjb25zdCBmaWxlcyA9IG5ldyBTZXQoc25hcHNob3RzLm1hcChpID0+IGkuZmlsZSkpXG4gIGF3YWl0IFByb21pc2UuYWxsKEFycmF5LmZyb20oZmlsZXMpLm1hcChhc3luYyhmaWxlKSA9PiB7XG4gICAgY29uc3QgbWFwID0gYXdhaXQgcnBjKCkuZ2V0U291cmNlTWFwKGZpbGUpXG4gICAgY29uc3Qgc25hcHMgPSBzbmFwc2hvdHMuZmlsdGVyKGkgPT4gaS5maWxlID09PSBmaWxlKVxuICAgIGNvbnN0IGNvZGUgPSBhd2FpdCBmcy5yZWFkRmlsZShmaWxlLCAndXRmOCcpXG4gICAgY29uc3QgcyA9IG5ldyBNYWdpY1N0cmluZyhjb2RlKVxuXG4gICAgZm9yIChjb25zdCBzbmFwIG9mIHNuYXBzKSB7XG4gICAgICBjb25zdCBwb3MgPSBhd2FpdCBnZXRPcmlnaW5hbFBvcyhtYXAsIHNuYXApXG4gICAgICBjb25zdCBpbmRleCA9IHBvc1RvTnVtYmVyKGNvZGUsIHBvcyEpXG4gICAgICBjb25zdCB7IGluZGVudCB9ID0gZGV0ZWN0SW5kZW50KGNvZGUuc2xpY2UoaW5kZXggLSBwb3MhLmNvbHVtbikpXG4gICAgICByZXBsYWNlSW5saW5lU25hcChjb2RlLCBzLCBpbmRleCwgc25hcC5zbmFwc2hvdCwgaW5kZW50KVxuICAgIH1cblxuICAgIGNvbnN0IHRyYW5zZm9ybWVkID0gcy50b1N0cmluZygpXG4gICAgaWYgKHRyYW5zZm9ybWVkICE9PSBjb2RlKVxuICAgICAgYXdhaXQgZnMud3JpdGVGaWxlKGZpbGUsIHRyYW5zZm9ybWVkLCAndXRmLTgnKVxuICB9KSlcbn1cblxuY29uc3Qgc3RhcnRPYmplY3RSZWdleCA9IC8oPzp0b01hdGNoSW5saW5lU25hcHNob3R8dG9UaHJvd0Vycm9yTWF0Y2hpbmdJbmxpbmVTbmFwc2hvdClcXHMqXFwoXFxzKih7KS9tXG5cbmZ1bmN0aW9uIHJlcGxhY2VPYmplY3RTbmFwKGNvZGU6IHN0cmluZywgczogTWFnaWNTdHJpbmcsIGluZGV4OiBudW1iZXIsIG5ld1NuYXA6IHN0cmluZywgaW5kZW50ID0gJycpIHtcbiAgY29kZSA9IGNvZGUuc2xpY2UoaW5kZXgpXG4gIGNvbnN0IHN0YXJ0TWF0Y2ggPSBzdGFydE9iamVjdFJlZ2V4LmV4ZWMoY29kZSlcbiAgaWYgKCFzdGFydE1hdGNoKVxuICAgIHJldHVybiBmYWxzZVxuXG4gIGNvZGUgPSBjb2RlLnNsaWNlKHN0YXJ0TWF0Y2guaW5kZXgpXG4gIGNvbnN0IGNoYXJJbmRleCA9IGdldENhbGxMYXN0SW5kZXgoY29kZSlcbiAgaWYgKGNoYXJJbmRleCA9PT0gbnVsbClcbiAgICByZXR1cm4gZmFsc2VcblxuICBzLmFwcGVuZExlZnQoaW5kZXggKyBzdGFydE1hdGNoLmluZGV4ICsgY2hhckluZGV4LCBgLCAke3ByZXBhcmVTbmFwU3RyaW5nKG5ld1NuYXAsIGluZGVudCl9YClcblxuICByZXR1cm4gdHJ1ZVxufVxuXG5mdW5jdGlvbiBwcmVwYXJlU25hcFN0cmluZyhzbmFwOiBzdHJpbmcsIGluZGVudDogc3RyaW5nKSB7XG4gIHNuYXAgPSBzbmFwLnJlcGxhY2UoL1xcXFwvZywgJ1xcXFxcXFxcJylcbiAgICAuc3BsaXQoJ1xcbicpXG4gICAgLm1hcChpID0+IChpbmRlbnQgKyBpKS50cmltRW5kKCkpXG4gICAgLmpvaW4oJ1xcbicpXG4gIGNvbnN0IGlzT25lbGluZSA9ICFzbmFwLmluY2x1ZGVzKCdcXG4nKVxuICByZXR1cm4gaXNPbmVsaW5lXG4gICAgPyBgJyR7c25hcC5yZXBsYWNlKC8nL2csICdcXFxcXFwnJykudHJpbSgpfSdgXG4gICAgOiBgXFxgJHtzbmFwLnJlcGxhY2UoL2AvZywgJ1xcXFxgJykudHJpbUVuZCgpfVxcbiR7aW5kZW50fVxcYGBcbn1cblxuY29uc3Qgc3RhcnRSZWdleCA9IC8oPzp0b01hdGNoSW5saW5lU25hcHNob3R8dG9UaHJvd0Vycm9yTWF0Y2hpbmdJbmxpbmVTbmFwc2hvdClcXHMqXFwoXFxzKihbJ1wiYFxcKV0pL21cbmV4cG9ydCBmdW5jdGlvbiByZXBsYWNlSW5saW5lU25hcChjb2RlOiBzdHJpbmcsIHM6IE1hZ2ljU3RyaW5nLCBpbmRleDogbnVtYmVyLCBuZXdTbmFwOiBzdHJpbmcsIGluZGVudCA9ICcnKSB7XG4gIGNvbnN0IHN0YXJ0TWF0Y2ggPSBzdGFydFJlZ2V4LmV4ZWMoY29kZS5zbGljZShpbmRleCkpXG4gIGlmICghc3RhcnRNYXRjaClcbiAgICByZXR1cm4gcmVwbGFjZU9iamVjdFNuYXAoY29kZSwgcywgaW5kZXgsIG5ld1NuYXAsIGluZGVudClcblxuICBjb25zdCBzbmFwU3RyaW5nID0gcHJlcGFyZVNuYXBTdHJpbmcobmV3U25hcCwgaW5kZW50KVxuXG4gIGNvbnN0IHF1b3RlID0gc3RhcnRNYXRjaFsxXVxuXG4gIGNvbnN0IHN0YXJ0SW5kZXggPSBpbmRleCArIHN0YXJ0TWF0Y2guaW5kZXghICsgc3RhcnRNYXRjaFswXS5sZW5ndGhcblxuICBpZiAocXVvdGUgPT09ICcpJykge1xuICAgIHMuYXBwZW5kUmlnaHQoc3RhcnRJbmRleCAtIDEsIHNuYXBTdHJpbmcpXG4gICAgcmV0dXJuIHRydWVcbiAgfVxuXG4gIGNvbnN0IHF1b3RlRW5kUkUgPSBuZXcgUmVnRXhwKGAoPzpefFteXFxcXFxcXFxdKSR7cXVvdGV9YClcbiAgY29uc3QgZW5kTWF0Y2ggPSBxdW90ZUVuZFJFLmV4ZWMoY29kZS5zbGljZShzdGFydEluZGV4KSlcbiAgaWYgKCFlbmRNYXRjaClcbiAgICByZXR1cm4gZmFsc2VcbiAgY29uc3QgZW5kSW5kZXggPSBzdGFydEluZGV4ICsgZW5kTWF0Y2guaW5kZXghICsgZW5kTWF0Y2hbMF0ubGVuZ3RoXG4gIHMub3ZlcndyaXRlKHN0YXJ0SW5kZXggLSAxLCBlbmRJbmRleCwgc25hcFN0cmluZylcblxuICByZXR1cm4gdHJ1ZVxufVxuIiwiXG5cblxuLypcbiAqIEB2ZXJzaW9uICAgIDEuNC4wXG4gKiBAZGF0ZSAgICAgICAyMDE1LTEwLTI2XG4gKiBAc3RhYmlsaXR5ICAzIC0gU3RhYmxlXG4gKiBAYXV0aG9yICAgICBMYXVyaSBSb29kZW4gKGh0dHBzOi8vZ2l0aHViLmNvbS9saXRlanMvbmF0dXJhbC1jb21wYXJlLWxpdGUpXG4gKiBAbGljZW5zZSAgICBNSVQgTGljZW5zZVxuICovXG5cblxudmFyIG5hdHVyYWxDb21wYXJlID0gZnVuY3Rpb24oYSwgYikge1xuXHR2YXIgaSwgY29kZUFcblx0LCBjb2RlQiA9IDFcblx0LCBwb3NBID0gMFxuXHQsIHBvc0IgPSAwXG5cdCwgYWxwaGFiZXQgPSBTdHJpbmcuYWxwaGFiZXRcblxuXHRmdW5jdGlvbiBnZXRDb2RlKHN0ciwgcG9zLCBjb2RlKSB7XG5cdFx0aWYgKGNvZGUpIHtcblx0XHRcdGZvciAoaSA9IHBvczsgY29kZSA9IGdldENvZGUoc3RyLCBpKSwgY29kZSA8IDc2ICYmIGNvZGUgPiA2NTspICsraTtcblx0XHRcdHJldHVybiArc3RyLnNsaWNlKHBvcyAtIDEsIGkpXG5cdFx0fVxuXHRcdGNvZGUgPSBhbHBoYWJldCAmJiBhbHBoYWJldC5pbmRleE9mKHN0ci5jaGFyQXQocG9zKSlcblx0XHRyZXR1cm4gY29kZSA+IC0xID8gY29kZSArIDc2IDogKChjb2RlID0gc3RyLmNoYXJDb2RlQXQocG9zKSB8fCAwKSwgY29kZSA8IDQ1IHx8IGNvZGUgPiAxMjcpID8gY29kZVxuXHRcdFx0OiBjb2RlIDwgNDYgPyA2NSAgICAgICAgICAgICAgIC8vIC1cblx0XHRcdDogY29kZSA8IDQ4ID8gY29kZSAtIDFcblx0XHRcdDogY29kZSA8IDU4ID8gY29kZSArIDE4ICAgICAgICAvLyAwLTlcblx0XHRcdDogY29kZSA8IDY1ID8gY29kZSAtIDExXG5cdFx0XHQ6IGNvZGUgPCA5MSA/IGNvZGUgKyAxMSAgICAgICAgLy8gQS1aXG5cdFx0XHQ6IGNvZGUgPCA5NyA/IGNvZGUgLSAzN1xuXHRcdFx0OiBjb2RlIDwgMTIzID8gY29kZSArIDUgICAgICAgIC8vIGEtelxuXHRcdFx0OiBjb2RlIC0gNjNcblx0fVxuXG5cblx0aWYgKChhKz1cIlwiKSAhPSAoYis9XCJcIikpIGZvciAoO2NvZGVCOykge1xuXHRcdGNvZGVBID0gZ2V0Q29kZShhLCBwb3NBKyspXG5cdFx0Y29kZUIgPSBnZXRDb2RlKGIsIHBvc0IrKylcblxuXHRcdGlmIChjb2RlQSA8IDc2ICYmIGNvZGVCIDwgNzYgJiYgY29kZUEgPiA2NiAmJiBjb2RlQiA+IDY2KSB7XG5cdFx0XHRjb2RlQSA9IGdldENvZGUoYSwgcG9zQSwgcG9zQSlcblx0XHRcdGNvZGVCID0gZ2V0Q29kZShiLCBwb3NCLCBwb3NBID0gaSlcblx0XHRcdHBvc0IgPSBpXG5cdFx0fVxuXG5cdFx0aWYgKGNvZGVBICE9IGNvZGVCKSByZXR1cm4gKGNvZGVBIDwgY29kZUIpID8gLTEgOiAxXG5cdH1cblx0cmV0dXJuIDBcbn1cblxudHJ5IHtcblx0bW9kdWxlLmV4cG9ydHMgPSBuYXR1cmFsQ29tcGFyZTtcbn0gY2F0Y2ggKGUpIHtcblx0U3RyaW5nLm5hdHVyYWxDb21wYXJlID0gbmF0dXJhbENvbXBhcmU7XG59XG4iLCIvKipcbiAqIENvcHlyaWdodCAoYykgRmFjZWJvb2ssIEluYy4gYW5kIGl0cyBhZmZpbGlhdGVzLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIE1JVCBsaWNlbnNlIGZvdW5kIGluIHRoZVxuICogTElDRU5TRSBmaWxlIGluIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCBmcywgeyBwcm9taXNlcyBhcyBmc3AgfSBmcm9tICdmcydcbmltcG9ydCBwYXRoIGZyb20gJ3BhdGhlJ1xuaW1wb3J0IG5hdHVyYWxDb21wYXJlIGZyb20gJ25hdHVyYWwtY29tcGFyZSdcbmltcG9ydCB0eXBlIHsgT3B0aW9uc1JlY2VpdmVkIGFzIFByZXR0eUZvcm1hdE9wdGlvbnMgfSBmcm9tICdwcmV0dHktZm9ybWF0J1xuaW1wb3J0IHtcbiAgZm9ybWF0IGFzIHByZXR0eUZvcm1hdCxcbn0gZnJvbSAncHJldHR5LWZvcm1hdCdcbmltcG9ydCB0eXBlIHsgU25hcHNob3REYXRhLCBTbmFwc2hvdFVwZGF0ZVN0YXRlIH0gZnJvbSAnLi4vLi4vLi4vdHlwZXMnXG5pbXBvcnQgeyBnZXRTZXJpYWxpemVycyB9IGZyb20gJy4vcGx1Z2lucydcblxuLy8gVE9ETzogcmV3cml0ZSBhbmQgY2xlYW4gdXBcblxuZXhwb3J0IGNvbnN0IFNOQVBTSE9UX1ZFUlNJT04gPSAnMSdcblxuY29uc3Qgd3JpdGVTbmFwc2hvdFZlcnNpb24gPSAoKSA9PiBgLy8gVml0ZXN0IFNuYXBzaG90IHYke1NOQVBTSE9UX1ZFUlNJT059YFxuXG5leHBvcnQgY29uc3QgdGVzdE5hbWVUb0tleSA9ICh0ZXN0TmFtZTogc3RyaW5nLCBjb3VudDogbnVtYmVyKTogc3RyaW5nID0+XG4gIGAke3Rlc3ROYW1lfSAke2NvdW50fWBcblxuZXhwb3J0IGNvbnN0IGtleVRvVGVzdE5hbWUgPSAoa2V5OiBzdHJpbmcpOiBzdHJpbmcgPT4ge1xuICBpZiAoIS8gXFxkKyQvLnRlc3Qoa2V5KSlcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ1NuYXBzaG90IGtleXMgbXVzdCBlbmQgd2l0aCBhIG51bWJlci4nKVxuXG4gIHJldHVybiBrZXkucmVwbGFjZSgvIFxcZCskLywgJycpXG59XG5cbmV4cG9ydCBjb25zdCBnZXRTbmFwc2hvdERhdGEgPSAoXG4gIHNuYXBzaG90UGF0aDogc3RyaW5nLFxuICB1cGRhdGU6IFNuYXBzaG90VXBkYXRlU3RhdGUsXG4pOiB7XG4gIGRhdGE6IFNuYXBzaG90RGF0YVxuICBkaXJ0eTogYm9vbGVhblxufSA9PiB7XG4gIGNvbnN0IGRhdGEgPSBPYmplY3QuY3JlYXRlKG51bGwpXG4gIGxldCBzbmFwc2hvdENvbnRlbnRzID0gJydcbiAgbGV0IGRpcnR5ID0gZmFsc2VcblxuICBpZiAoZnMuZXhpc3RzU3luYyhzbmFwc2hvdFBhdGgpKSB7XG4gICAgdHJ5IHtcbiAgICAgIHNuYXBzaG90Q29udGVudHMgPSBmcy5yZWFkRmlsZVN5bmMoc25hcHNob3RQYXRoLCAndXRmOCcpXG4gICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tbmV3LWZ1bmNcbiAgICAgIGNvbnN0IHBvcHVsYXRlID0gbmV3IEZ1bmN0aW9uKCdleHBvcnRzJywgc25hcHNob3RDb250ZW50cylcbiAgICAgIHBvcHVsYXRlKGRhdGEpXG4gICAgfVxuICAgIGNhdGNoIHt9XG4gIH1cblxuICAvLyBjb25zdCB2YWxpZGF0aW9uUmVzdWx0ID0gdmFsaWRhdGVTbmFwc2hvdFZlcnNpb24oc25hcHNob3RDb250ZW50cylcbiAgY29uc3QgaXNJbnZhbGlkID0gc25hcHNob3RDb250ZW50cyAvLyAmJiB2YWxpZGF0aW9uUmVzdWx0XG5cbiAgLy8gaWYgKHVwZGF0ZSA9PT0gJ25vbmUnICYmIGlzSW52YWxpZClcbiAgLy8gICB0aHJvdyB2YWxpZGF0aW9uUmVzdWx0XG5cbiAgaWYgKCh1cGRhdGUgPT09ICdhbGwnIHx8IHVwZGF0ZSA9PT0gJ25ldycpICYmIGlzSW52YWxpZClcbiAgICBkaXJ0eSA9IHRydWVcblxuICByZXR1cm4geyBkYXRhLCBkaXJ0eSB9XG59XG5cbi8vIEFkZCBleHRyYSBsaW5lIGJyZWFrcyBhdCBiZWdpbm5pbmcgYW5kIGVuZCBvZiBtdWx0aWxpbmUgc25hcHNob3Rcbi8vIHRvIG1ha2UgdGhlIGNvbnRlbnQgZWFzaWVyIHRvIHJlYWQuXG5leHBvcnQgY29uc3QgYWRkRXh0cmFMaW5lQnJlYWtzID0gKHN0cmluZzogc3RyaW5nKTogc3RyaW5nID0+XG4gIHN0cmluZy5pbmNsdWRlcygnXFxuJykgPyBgXFxuJHtzdHJpbmd9XFxuYCA6IHN0cmluZ1xuXG4vLyBSZW1vdmUgZXh0cmEgbGluZSBicmVha3MgYXQgYmVnaW5uaW5nIGFuZCBlbmQgb2YgbXVsdGlsaW5lIHNuYXBzaG90LlxuLy8gSW5zdGVhZCBvZiB0cmltLCB3aGljaCBjYW4gcmVtb3ZlIGFkZGl0aW9uYWwgbmV3bGluZXMgb3Igc3BhY2VzXG4vLyBhdCBiZWdpbm5pbmcgb3IgZW5kIG9mIHRoZSBjb250ZW50IGZyb20gYSBjdXN0b20gc2VyaWFsaXplci5cbmV4cG9ydCBjb25zdCByZW1vdmVFeHRyYUxpbmVCcmVha3MgPSAoc3RyaW5nOiBzdHJpbmcpOiBzdHJpbmcgPT5cbiAgc3RyaW5nLmxlbmd0aCA+IDIgJiYgc3RyaW5nLnN0YXJ0c1dpdGgoJ1xcbicpICYmIHN0cmluZy5lbmRzV2l0aCgnXFxuJylcbiAgICA/IHN0cmluZy5zbGljZSgxLCAtMSlcbiAgICA6IHN0cmluZ1xuXG4vLyBleHBvcnQgY29uc3QgcmVtb3ZlTGluZXNCZWZvcmVFeHRlcm5hbE1hdGNoZXJUcmFwID0gKHN0YWNrOiBzdHJpbmcpOiBzdHJpbmcgPT4ge1xuLy8gICBjb25zdCBsaW5lcyA9IHN0YWNrLnNwbGl0KCdcXG4nKVxuXG4vLyAgIGZvciAobGV0IGkgPSAwOyBpIDwgbGluZXMubGVuZ3RoOyBpICs9IDEpIHtcbi8vICAgICAvLyBJdCdzIGEgZnVuY3Rpb24gbmFtZSBzcGVjaWZpZWQgaW4gYHBhY2thZ2VzL2V4cGVjdC9zcmMvaW5kZXgudHNgXG4vLyAgICAgLy8gZm9yIGV4dGVybmFsIGN1c3RvbSBtYXRjaGVycy5cbi8vICAgICBpZiAobGluZXNbaV0uaW5jbHVkZXMoJ19fRVhURVJOQUxfTUFUQ0hFUl9UUkFQX18nKSlcbi8vICAgICAgIHJldHVybiBsaW5lcy5zbGljZShpICsgMSkuam9pbignXFxuJylcbi8vICAgfVxuXG4vLyAgIHJldHVybiBzdGFja1xuLy8gfVxuXG5jb25zdCBlc2NhcGVSZWdleCA9IHRydWVcbmNvbnN0IHByaW50RnVuY3Rpb25OYW1lID0gZmFsc2VcblxuZXhwb3J0IGZ1bmN0aW9uIHNlcmlhbGl6ZSh2YWw6IHVua25vd24sXG4gIGluZGVudCA9IDIsXG4gIGZvcm1hdE92ZXJyaWRlczogUHJldHR5Rm9ybWF0T3B0aW9ucyA9IHt9KTogc3RyaW5nIHtcbiAgcmV0dXJuIG5vcm1hbGl6ZU5ld2xpbmVzKFxuICAgIHByZXR0eUZvcm1hdCh2YWwsIHtcbiAgICAgIGVzY2FwZVJlZ2V4LFxuICAgICAgaW5kZW50LFxuICAgICAgcGx1Z2luczogZ2V0U2VyaWFsaXplcnMoKSxcbiAgICAgIHByaW50RnVuY3Rpb25OYW1lLFxuICAgICAgLi4uZm9ybWF0T3ZlcnJpZGVzLFxuICAgIH0pLFxuICApXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBtaW5pZnkodmFsOiB1bmtub3duKTogc3RyaW5nIHtcbiAgcmV0dXJuIHByZXR0eUZvcm1hdCh2YWwsIHtcbiAgICBlc2NhcGVSZWdleCxcbiAgICBtaW46IHRydWUsXG4gICAgcGx1Z2luczogZ2V0U2VyaWFsaXplcnMoKSxcbiAgICBwcmludEZ1bmN0aW9uTmFtZSxcbiAgfSlcbn1cblxuLy8gUmVtb3ZlIGRvdWJsZSBxdW90ZSBtYXJrcyBhbmQgdW5lc2NhcGUgZG91YmxlIHF1b3RlcyBhbmQgYmFja3NsYXNoZXMuXG5leHBvcnQgZnVuY3Rpb24gZGVzZXJpYWxpemVTdHJpbmcoc3RyaW5naWZpZWQ6IHN0cmluZyk6IHN0cmluZyB7XG4gIHJldHVybiBzdHJpbmdpZmllZC5zbGljZSgxLCAtMSkucmVwbGFjZSgvXFxcXChcInxcXFxcKS9nLCAnJDEnKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gZXNjYXBlQmFja3RpY2tTdHJpbmcoc3RyOiBzdHJpbmcpOiBzdHJpbmcge1xuICByZXR1cm4gc3RyLnJlcGxhY2UoL2B8XFxcXHxcXCR7L2csICdcXFxcJCYnKVxufVxuXG5mdW5jdGlvbiBwcmludEJhY2t0aWNrU3RyaW5nKHN0cjogc3RyaW5nKTogc3RyaW5nIHtcbiAgcmV0dXJuIGBcXGAke2VzY2FwZUJhY2t0aWNrU3RyaW5nKHN0cil9XFxgYFxufVxuXG5leHBvcnQgZnVuY3Rpb24gZW5zdXJlRGlyZWN0b3J5RXhpc3RzKGZpbGVQYXRoOiBzdHJpbmcpOiB2b2lkIHtcbiAgdHJ5IHtcbiAgICBmcy5ta2RpclN5bmMocGF0aC5qb2luKHBhdGguZGlybmFtZShmaWxlUGF0aCkpLCB7IHJlY3Vyc2l2ZTogdHJ1ZSB9KVxuICB9XG4gIGNhdGNoIHsgfVxufVxuXG5mdW5jdGlvbiBub3JtYWxpemVOZXdsaW5lcyhzdHJpbmc6IHN0cmluZykge1xuICByZXR1cm4gc3RyaW5nLnJlcGxhY2UoL1xcclxcbnxcXHIvZywgJ1xcbicpXG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBzYXZlU25hcHNob3RGaWxlKFxuICBzbmFwc2hvdERhdGE6IFNuYXBzaG90RGF0YSxcbiAgc25hcHNob3RQYXRoOiBzdHJpbmcsXG4pIHtcbiAgY29uc3Qgc25hcHNob3RzID0gT2JqZWN0LmtleXMoc25hcHNob3REYXRhKVxuICAgIC5zb3J0KG5hdHVyYWxDb21wYXJlKVxuICAgIC5tYXAoXG4gICAgICBrZXkgPT4gYGV4cG9ydHNbJHtwcmludEJhY2t0aWNrU3RyaW5nKGtleSl9XSA9ICR7cHJpbnRCYWNrdGlja1N0cmluZyhub3JtYWxpemVOZXdsaW5lcyhzbmFwc2hvdERhdGFba2V5XSkpfTtgLFxuICAgIClcblxuICBlbnN1cmVEaXJlY3RvcnlFeGlzdHMoc25hcHNob3RQYXRoKVxuICBhd2FpdCBmc3Aud3JpdGVGaWxlKFxuICAgIHNuYXBzaG90UGF0aCxcbiAgICBgJHt3cml0ZVNuYXBzaG90VmVyc2lvbigpfVxcblxcbiR7c25hcHNob3RzLmpvaW4oJ1xcblxcbicpfVxcbmAsXG4gICAgJ3V0Zi04JyxcbiAgKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gcHJlcGFyZUV4cGVjdGVkKGV4cGVjdGVkPzogc3RyaW5nKSB7XG4gIGZ1bmN0aW9uIGZpbmRTdGFydEluZGVudCgpIHtcbiAgICBjb25zdCBtYXRjaCA9IC9eKCArKX1cXHMrJC9tLmV4ZWMoZXhwZWN0ZWQgfHwgJycpXG4gICAgcmV0dXJuIG1hdGNoPy5bMV0/Lmxlbmd0aCB8fCAwXG4gIH1cblxuICBjb25zdCBzdGFydElkZW50ID0gZmluZFN0YXJ0SW5kZW50KClcblxuICBsZXQgZXhwZWN0ZWRUcmltbWVkID0gZXhwZWN0ZWQ/LnRyaW0oKVxuXG4gIGlmIChzdGFydElkZW50KSB7XG4gICAgZXhwZWN0ZWRUcmltbWVkID0gZXhwZWN0ZWRUcmltbWVkXG4gICAgICA/LnJlcGxhY2UobmV3IFJlZ0V4cChgXiR7JyAnLnJlcGVhdChzdGFydElkZW50KX1gLCAnZ20nKSwgJycpLnJlcGxhY2UoLyArfSQvLCAnfScpXG4gIH1cblxuICByZXR1cm4gZXhwZWN0ZWRUcmltbWVkXG59XG4iLCIvKipcbiAqIENvcHlyaWdodCAoYykgRmFjZWJvb2ssIEluYy4gYW5kIGl0cyBhZmZpbGlhdGVzLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIE1JVCBsaWNlbnNlIGZvdW5kIGluIHRoZVxuICogTElDRU5TRSBmaWxlIGluIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCBmcyBmcm9tICdmcydcbmltcG9ydCB0eXBlIHsgQ29uZmlnIH0gZnJvbSAnQGplc3QvdHlwZXMnXG4vLyBpbXBvcnQgeyBnZXRTdGFja1RyYWNlTGluZXMsIGdldFRvcEZyYW1lIH0gZnJvbSAnamVzdC1tZXNzYWdlLXV0aWwnXG5pbXBvcnQgdHlwZSB7IE9wdGlvbnNSZWNlaXZlZCBhcyBQcmV0dHlGb3JtYXRPcHRpb25zIH0gZnJvbSAncHJldHR5LWZvcm1hdCdcbmltcG9ydCB0eXBlIHsgU25hcHNob3REYXRhLCBTbmFwc2hvdE1hdGNoT3B0aW9ucywgU25hcHNob3RTdGF0ZU9wdGlvbnMgfSBmcm9tICcuLi8uLi8uLi90eXBlcydcbmltcG9ydCB7IHNsYXNoIH0gZnJvbSAnLi4vLi4vLi4vdXRpbHMnXG5pbXBvcnQgeyBwYXJzZVN0YWNrdHJhY2UgfSBmcm9tICcuLi8uLi8uLi91dGlscy9zb3VyY2UtbWFwJ1xuaW1wb3J0IHR5cGUgeyBJbmxpbmVTbmFwc2hvdCB9IGZyb20gJy4vaW5saW5lU25hcHNob3QnXG5pbXBvcnQgeyBzYXZlSW5saW5lU25hcHNob3RzIH0gZnJvbSAnLi9pbmxpbmVTbmFwc2hvdCdcblxuaW1wb3J0IHtcbiAgYWRkRXh0cmFMaW5lQnJlYWtzLFxuICBnZXRTbmFwc2hvdERhdGEsXG4gIGtleVRvVGVzdE5hbWUsXG4gIHByZXBhcmVFeHBlY3RlZCxcbiAgcmVtb3ZlRXh0cmFMaW5lQnJlYWtzLFxuICBzYXZlU25hcHNob3RGaWxlLFxuICBzZXJpYWxpemUsXG4gIHRlc3ROYW1lVG9LZXksXG59IGZyb20gJy4vdXRpbHMnXG5cbmludGVyZmFjZSBTbmFwc2hvdFJldHVybk9wdGlvbnMge1xuICBhY3R1YWw6IHN0cmluZ1xuICBjb3VudDogbnVtYmVyXG4gIGV4cGVjdGVkPzogc3RyaW5nXG4gIGtleTogc3RyaW5nXG4gIHBhc3M6IGJvb2xlYW5cbn1cblxuaW50ZXJmYWNlIFNhdmVTdGF0dXMge1xuICBkZWxldGVkOiBib29sZWFuXG4gIHNhdmVkOiBib29sZWFuXG59XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFNuYXBzaG90U3RhdGUge1xuICBwcml2YXRlIF9jb3VudGVyczogTWFwPHN0cmluZywgbnVtYmVyPlxuICBwcml2YXRlIF9kaXJ0eTogYm9vbGVhblxuICBwcml2YXRlIF91cGRhdGVTbmFwc2hvdDogQ29uZmlnLlNuYXBzaG90VXBkYXRlU3RhdGVcbiAgcHJpdmF0ZSBfc25hcHNob3REYXRhOiBTbmFwc2hvdERhdGFcbiAgcHJpdmF0ZSBfaW5pdGlhbERhdGE6IFNuYXBzaG90RGF0YVxuICBwcml2YXRlIF9zbmFwc2hvdFBhdGg6IHN0cmluZ1xuICBwcml2YXRlIF9pbmxpbmVTbmFwc2hvdHM6IEFycmF5PElubGluZVNuYXBzaG90PlxuICBwcml2YXRlIF91bmNoZWNrZWRLZXlzOiBTZXQ8c3RyaW5nPlxuICBwcml2YXRlIF9zbmFwc2hvdEZvcm1hdDogUHJldHR5Rm9ybWF0T3B0aW9uc1xuXG4gIGFkZGVkOiBudW1iZXJcbiAgZXhwYW5kOiBib29sZWFuXG4gIG1hdGNoZWQ6IG51bWJlclxuICB1bm1hdGNoZWQ6IG51bWJlclxuICB1cGRhdGVkOiBudW1iZXJcblxuICBjb25zdHJ1Y3RvcihzbmFwc2hvdFBhdGg6IHN0cmluZywgb3B0aW9uczogU25hcHNob3RTdGF0ZU9wdGlvbnMpIHtcbiAgICB0aGlzLl9zbmFwc2hvdFBhdGggPSBzbmFwc2hvdFBhdGhcbiAgICBjb25zdCB7IGRhdGEsIGRpcnR5IH0gPSBnZXRTbmFwc2hvdERhdGEoXG4gICAgICB0aGlzLl9zbmFwc2hvdFBhdGgsXG4gICAgICBvcHRpb25zLnVwZGF0ZVNuYXBzaG90LFxuICAgIClcbiAgICB0aGlzLl9pbml0aWFsRGF0YSA9IGRhdGFcbiAgICB0aGlzLl9zbmFwc2hvdERhdGEgPSBkYXRhXG4gICAgdGhpcy5fZGlydHkgPSBkaXJ0eVxuICAgIHRoaXMuX2lubGluZVNuYXBzaG90cyA9IFtdXG4gICAgdGhpcy5fdW5jaGVja2VkS2V5cyA9IG5ldyBTZXQoT2JqZWN0LmtleXModGhpcy5fc25hcHNob3REYXRhKSlcbiAgICB0aGlzLl9jb3VudGVycyA9IG5ldyBNYXAoKVxuICAgIHRoaXMuZXhwYW5kID0gb3B0aW9ucy5leHBhbmQgfHwgZmFsc2VcbiAgICB0aGlzLmFkZGVkID0gMFxuICAgIHRoaXMubWF0Y2hlZCA9IDBcbiAgICB0aGlzLnVubWF0Y2hlZCA9IDBcbiAgICB0aGlzLl91cGRhdGVTbmFwc2hvdCA9IG9wdGlvbnMudXBkYXRlU25hcHNob3RcbiAgICB0aGlzLnVwZGF0ZWQgPSAwXG4gICAgdGhpcy5fc25hcHNob3RGb3JtYXQgPSB7XG4gICAgICBwcmludEJhc2ljUHJvdG90eXBlOiBmYWxzZSxcbiAgICAgIC4uLm9wdGlvbnMuc25hcHNob3RGb3JtYXQsXG4gICAgfVxuICB9XG5cbiAgbWFya1NuYXBzaG90c0FzQ2hlY2tlZEZvclRlc3QodGVzdE5hbWU6IHN0cmluZyk6IHZvaWQge1xuICAgIHRoaXMuX3VuY2hlY2tlZEtleXMuZm9yRWFjaCgodW5jaGVja2VkS2V5KSA9PiB7XG4gICAgICBpZiAoa2V5VG9UZXN0TmFtZSh1bmNoZWNrZWRLZXkpID09PSB0ZXN0TmFtZSlcbiAgICAgICAgdGhpcy5fdW5jaGVja2VkS2V5cy5kZWxldGUodW5jaGVja2VkS2V5KVxuICAgIH0pXG4gIH1cblxuICBwcml2YXRlIF9hZGRTbmFwc2hvdChcbiAgICBrZXk6IHN0cmluZyxcbiAgICByZWNlaXZlZFNlcmlhbGl6ZWQ6IHN0cmluZyxcbiAgICBvcHRpb25zOiB7IGlzSW5saW5lOiBib29sZWFuOyBlcnJvcj86IEVycm9yIH0sXG4gICk6IHZvaWQge1xuICAgIHRoaXMuX2RpcnR5ID0gdHJ1ZVxuICAgIGlmIChvcHRpb25zLmlzSW5saW5lKSB7XG4gICAgICBjb25zdCBlcnJvciA9IG9wdGlvbnMuZXJyb3IgfHwgbmV3IEVycm9yKCdVbmtub3duIGVycm9yJylcbiAgICAgIGNvbnN0IHN0YWNrcyA9IHBhcnNlU3RhY2t0cmFjZShlcnJvciwgdHJ1ZSlcbiAgICAgIHN0YWNrcy5mb3JFYWNoKGkgPT4gaS5maWxlID0gc2xhc2goaS5maWxlKSlcbiAgICAgIC8vIGlubGluZSBzbmFwc2hvdCBmdW5jdGlvbiBpcyBjYWxsZWQgX19WSVRFU1RfSU5MSU5FX1NOQVBTSE9UX19cbiAgICAgIC8vIGluIGludGVncmF0aW9ucy9zbmFwc2hvdC9jaGFpLnRzXG4gICAgICBjb25zdCBzdGFja0luZGV4ID0gc3RhY2tzLmZpbmRJbmRleChpID0+IGkubWV0aG9kLmluY2x1ZGVzKCdfX1ZJVEVTVF9JTkxJTkVfU05BUFNIT1RfXycpKVxuICAgICAgY29uc3Qgc3RhY2sgPSBzdGFja0luZGV4ICE9PSAtMSA/IHN0YWNrc1tzdGFja0luZGV4ICsgMl0gOiBudWxsXG4gICAgICBpZiAoIXN0YWNrKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICBgVml0ZXN0OiBDb3VsZG4ndCBpbmZlciBzdGFjayBmcmFtZSBmb3IgaW5saW5lIHNuYXBzaG90LlxcbiR7SlNPTi5zdHJpbmdpZnkoc3RhY2tzKX1gLFxuICAgICAgICApXG4gICAgICB9XG4gICAgICB0aGlzLl9pbmxpbmVTbmFwc2hvdHMucHVzaCh7XG4gICAgICAgIHNuYXBzaG90OiByZWNlaXZlZFNlcmlhbGl6ZWQsXG4gICAgICAgIC4uLnN0YWNrLFxuICAgICAgfSlcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICB0aGlzLl9zbmFwc2hvdERhdGFba2V5XSA9IHJlY2VpdmVkU2VyaWFsaXplZFxuICAgIH1cbiAgfVxuXG4gIGNsZWFyKCk6IHZvaWQge1xuICAgIHRoaXMuX3NuYXBzaG90RGF0YSA9IHRoaXMuX2luaXRpYWxEYXRhXG4gICAgLy8gdGhpcy5faW5saW5lU25hcHNob3RzID0gW11cbiAgICB0aGlzLl9jb3VudGVycyA9IG5ldyBNYXAoKVxuICAgIHRoaXMuYWRkZWQgPSAwXG4gICAgdGhpcy5tYXRjaGVkID0gMFxuICAgIHRoaXMudW5tYXRjaGVkID0gMFxuICAgIHRoaXMudXBkYXRlZCA9IDBcbiAgfVxuXG4gIGFzeW5jIHNhdmUoKTogUHJvbWlzZTxTYXZlU3RhdHVzPiB7XG4gICAgY29uc3QgaGFzRXh0ZXJuYWxTbmFwc2hvdHMgPSBPYmplY3Qua2V5cyh0aGlzLl9zbmFwc2hvdERhdGEpLmxlbmd0aFxuICAgIGNvbnN0IGhhc0lubGluZVNuYXBzaG90cyA9IHRoaXMuX2lubGluZVNuYXBzaG90cy5sZW5ndGhcbiAgICBjb25zdCBpc0VtcHR5ID0gIWhhc0V4dGVybmFsU25hcHNob3RzICYmICFoYXNJbmxpbmVTbmFwc2hvdHNcblxuICAgIGNvbnN0IHN0YXR1czogU2F2ZVN0YXR1cyA9IHtcbiAgICAgIGRlbGV0ZWQ6IGZhbHNlLFxuICAgICAgc2F2ZWQ6IGZhbHNlLFxuICAgIH1cblxuICAgIGlmICgodGhpcy5fZGlydHkgfHwgdGhpcy5fdW5jaGVja2VkS2V5cy5zaXplKSAmJiAhaXNFbXB0eSkge1xuICAgICAgaWYgKGhhc0V4dGVybmFsU25hcHNob3RzKVxuICAgICAgICBhd2FpdCBzYXZlU25hcHNob3RGaWxlKHRoaXMuX3NuYXBzaG90RGF0YSwgdGhpcy5fc25hcHNob3RQYXRoKVxuICAgICAgaWYgKGhhc0lubGluZVNuYXBzaG90cylcbiAgICAgICAgYXdhaXQgc2F2ZUlubGluZVNuYXBzaG90cyh0aGlzLl9pbmxpbmVTbmFwc2hvdHMpXG5cbiAgICAgIHN0YXR1cy5zYXZlZCA9IHRydWVcbiAgICB9XG4gICAgZWxzZSBpZiAoIWhhc0V4dGVybmFsU25hcHNob3RzICYmIGZzLmV4aXN0c1N5bmModGhpcy5fc25hcHNob3RQYXRoKSkge1xuICAgICAgaWYgKHRoaXMuX3VwZGF0ZVNuYXBzaG90ID09PSAnYWxsJylcbiAgICAgICAgZnMudW5saW5rU3luYyh0aGlzLl9zbmFwc2hvdFBhdGgpXG5cbiAgICAgIHN0YXR1cy5kZWxldGVkID0gdHJ1ZVxuICAgIH1cblxuICAgIHJldHVybiBzdGF0dXNcbiAgfVxuXG4gIGdldFVuY2hlY2tlZENvdW50KCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMuX3VuY2hlY2tlZEtleXMuc2l6ZSB8fCAwXG4gIH1cblxuICBnZXRVbmNoZWNrZWRLZXlzKCk6IEFycmF5PHN0cmluZz4ge1xuICAgIHJldHVybiBBcnJheS5mcm9tKHRoaXMuX3VuY2hlY2tlZEtleXMpXG4gIH1cblxuICByZW1vdmVVbmNoZWNrZWRLZXlzKCk6IHZvaWQge1xuICAgIGlmICh0aGlzLl91cGRhdGVTbmFwc2hvdCA9PT0gJ2FsbCcgJiYgdGhpcy5fdW5jaGVja2VkS2V5cy5zaXplKSB7XG4gICAgICB0aGlzLl9kaXJ0eSA9IHRydWVcbiAgICAgIHRoaXMuX3VuY2hlY2tlZEtleXMuZm9yRWFjaChrZXkgPT4gZGVsZXRlIHRoaXMuX3NuYXBzaG90RGF0YVtrZXldKVxuICAgICAgdGhpcy5fdW5jaGVja2VkS2V5cy5jbGVhcigpXG4gICAgfVxuICB9XG5cbiAgbWF0Y2goe1xuICAgIHRlc3ROYW1lLFxuICAgIHJlY2VpdmVkLFxuICAgIGtleSxcbiAgICBpbmxpbmVTbmFwc2hvdCxcbiAgICBpc0lubGluZSxcbiAgICBlcnJvcixcbiAgfTogU25hcHNob3RNYXRjaE9wdGlvbnMpOiBTbmFwc2hvdFJldHVybk9wdGlvbnMge1xuICAgIHRoaXMuX2NvdW50ZXJzLnNldCh0ZXN0TmFtZSwgKHRoaXMuX2NvdW50ZXJzLmdldCh0ZXN0TmFtZSkgfHwgMCkgKyAxKVxuICAgIGNvbnN0IGNvdW50ID0gTnVtYmVyKHRoaXMuX2NvdW50ZXJzLmdldCh0ZXN0TmFtZSkpXG5cbiAgICBpZiAoIWtleSlcbiAgICAgIGtleSA9IHRlc3ROYW1lVG9LZXkodGVzdE5hbWUsIGNvdW50KVxuXG4gICAgLy8gRG8gbm90IG1hcmsgdGhlIHNuYXBzaG90IGFzIFwiY2hlY2tlZFwiIGlmIHRoZSBzbmFwc2hvdCBpcyBpbmxpbmUgYW5kXG4gICAgLy8gdGhlcmUncyBhbiBleHRlcm5hbCBzbmFwc2hvdC4gVGhpcyB3YXkgdGhlIGV4dGVybmFsIHNuYXBzaG90IGNhbiBiZVxuICAgIC8vIHJlbW92ZWQgd2l0aCBgLS11cGRhdGVTbmFwc2hvdGAuXG4gICAgaWYgKCEoaXNJbmxpbmUgJiYgdGhpcy5fc25hcHNob3REYXRhW2tleV0gIT09IHVuZGVmaW5lZCkpXG4gICAgICB0aGlzLl91bmNoZWNrZWRLZXlzLmRlbGV0ZShrZXkpXG5cbiAgICBjb25zdCByZWNlaXZlZFNlcmlhbGl6ZWQgPSBhZGRFeHRyYUxpbmVCcmVha3Moc2VyaWFsaXplKHJlY2VpdmVkLCB1bmRlZmluZWQsIHRoaXMuX3NuYXBzaG90Rm9ybWF0KSlcbiAgICBjb25zdCBleHBlY3RlZCA9IGlzSW5saW5lID8gaW5saW5lU25hcHNob3QgOiB0aGlzLl9zbmFwc2hvdERhdGFba2V5XVxuICAgIGNvbnN0IGV4cGVjdGVkVHJpbW1lZCA9IHByZXBhcmVFeHBlY3RlZChleHBlY3RlZClcbiAgICBjb25zdCBwYXNzID0gZXhwZWN0ZWRUcmltbWVkID09PSByZWNlaXZlZFNlcmlhbGl6ZWQ/LnRyaW0oKVxuICAgIGNvbnN0IGhhc1NuYXBzaG90ID0gZXhwZWN0ZWQgIT09IHVuZGVmaW5lZFxuICAgIGNvbnN0IHNuYXBzaG90SXNQZXJzaXN0ZWQgPSBpc0lubGluZSB8fCBmcy5leGlzdHNTeW5jKHRoaXMuX3NuYXBzaG90UGF0aClcblxuICAgIGlmIChwYXNzICYmICFpc0lubGluZSkge1xuICAgICAgLy8gRXhlY3V0aW5nIGEgc25hcHNob3QgZmlsZSBhcyBKYXZhU2NyaXB0IGFuZCB3cml0aW5nIHRoZSBzdHJpbmdzIGJhY2tcbiAgICAgIC8vIHdoZW4gb3RoZXIgc25hcHNob3RzIGhhdmUgY2hhbmdlZCBsb3NlcyB0aGUgcHJvcGVyIGVzY2FwaW5nIGZvciBzb21lXG4gICAgICAvLyBjaGFyYWN0ZXJzLiBTaW5jZSB3ZSBjaGVjayBldmVyeSBzbmFwc2hvdCBpbiBldmVyeSB0ZXN0LCB1c2UgdGhlIG5ld2x5XG4gICAgICAvLyBnZW5lcmF0ZWQgZm9ybWF0dGVkIHN0cmluZy5cbiAgICAgIC8vIE5vdGUgdGhhdCB0aGlzIGlzIG9ubHkgcmVsZXZhbnQgd2hlbiBhIHNuYXBzaG90IGlzIGFkZGVkIGFuZCB0aGUgZGlydHlcbiAgICAgIC8vIGZsYWcgaXMgc2V0LlxuICAgICAgdGhpcy5fc25hcHNob3REYXRhW2tleV0gPSByZWNlaXZlZFNlcmlhbGl6ZWRcbiAgICB9XG5cbiAgICAvLyBUaGVzZSBhcmUgdGhlIGNvbmRpdGlvbnMgb24gd2hlbiB0byB3cml0ZSBzbmFwc2hvdHM6XG4gICAgLy8gICogVGhlcmUncyBubyBzbmFwc2hvdCBmaWxlIGluIGEgbm9uLUNJIGVudmlyb25tZW50LlxuICAgIC8vICAqIFRoZXJlIGlzIGEgc25hcHNob3QgZmlsZSBhbmQgd2UgZGVjaWRlZCB0byB1cGRhdGUgdGhlIHNuYXBzaG90LlxuICAgIC8vICAqIFRoZXJlIGlzIGEgc25hcHNob3QgZmlsZSwgYnV0IGl0IGRvZXNuJ3QgaGF2ZSB0aGlzIHNuYXBoc290LlxuICAgIC8vIFRoZXNlIGFyZSB0aGUgY29uZGl0aW9ucyBvbiB3aGVuIG5vdCB0byB3cml0ZSBzbmFwc2hvdHM6XG4gICAgLy8gICogVGhlIHVwZGF0ZSBmbGFnIGlzIHNldCB0byAnbm9uZScuXG4gICAgLy8gICogVGhlcmUncyBubyBzbmFwc2hvdCBmaWxlIG9yIGEgZmlsZSB3aXRob3V0IHRoaXMgc25hcHNob3Qgb24gYSBDSSBlbnZpcm9ubWVudC5cbiAgICBpZiAoXG4gICAgICAoaGFzU25hcHNob3QgJiYgdGhpcy5fdXBkYXRlU25hcHNob3QgPT09ICdhbGwnKVxuICAgICAgIHx8ICgoIWhhc1NuYXBzaG90IHx8ICFzbmFwc2hvdElzUGVyc2lzdGVkKVxuICAgICAgICAgJiYgKHRoaXMuX3VwZGF0ZVNuYXBzaG90ID09PSAnbmV3JyB8fCB0aGlzLl91cGRhdGVTbmFwc2hvdCA9PT0gJ2FsbCcpKVxuICAgICkge1xuICAgICAgaWYgKHRoaXMuX3VwZGF0ZVNuYXBzaG90ID09PSAnYWxsJykge1xuICAgICAgICBpZiAoIXBhc3MpIHtcbiAgICAgICAgICBpZiAoaGFzU25hcHNob3QpXG4gICAgICAgICAgICB0aGlzLnVwZGF0ZWQrK1xuICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgIHRoaXMuYWRkZWQrK1xuXG4gICAgICAgICAgdGhpcy5fYWRkU25hcHNob3Qoa2V5LCByZWNlaXZlZFNlcmlhbGl6ZWQsIHsgZXJyb3IsIGlzSW5saW5lIH0pXG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgdGhpcy5tYXRjaGVkKytcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgIHRoaXMuX2FkZFNuYXBzaG90KGtleSwgcmVjZWl2ZWRTZXJpYWxpemVkLCB7IGVycm9yLCBpc0lubGluZSB9KVxuICAgICAgICB0aGlzLmFkZGVkKytcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgYWN0dWFsOiAnJyxcbiAgICAgICAgY291bnQsXG4gICAgICAgIGV4cGVjdGVkOiAnJyxcbiAgICAgICAga2V5LFxuICAgICAgICBwYXNzOiB0cnVlLFxuICAgICAgfVxuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIGlmICghcGFzcykge1xuICAgICAgICB0aGlzLnVubWF0Y2hlZCsrXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgYWN0dWFsOiByZW1vdmVFeHRyYUxpbmVCcmVha3MocmVjZWl2ZWRTZXJpYWxpemVkKSxcbiAgICAgICAgICBjb3VudCxcbiAgICAgICAgICBleHBlY3RlZDpcbiAgICAgICAgICBleHBlY3RlZFRyaW1tZWQgIT09IHVuZGVmaW5lZFxuICAgICAgICAgICAgPyByZW1vdmVFeHRyYUxpbmVCcmVha3MoZXhwZWN0ZWRUcmltbWVkKVxuICAgICAgICAgICAgOiB1bmRlZmluZWQsXG4gICAgICAgICAga2V5LFxuICAgICAgICAgIHBhc3M6IGZhbHNlLFxuICAgICAgICB9XG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgdGhpcy5tYXRjaGVkKytcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICBhY3R1YWw6ICcnLFxuICAgICAgICAgIGNvdW50LFxuICAgICAgICAgIGV4cGVjdGVkOiAnJyxcbiAgICAgICAgICBrZXksXG4gICAgICAgICAgcGFzczogdHJ1ZSxcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxufVxuIiwiaW1wb3J0IHBhdGggZnJvbSAncGF0aGUnXG5pbXBvcnQgeyBleHBlY3QgfSBmcm9tICdjaGFpJ1xuaW1wb3J0IHR5cGUgeyBTbmFwc2hvdFJlc3VsdCwgVGVzdCB9IGZyb20gJy4uLy4uL3R5cGVzJ1xuaW1wb3J0IHsgcnBjIH0gZnJvbSAnLi4vLi4vcnVudGltZS9ycGMnXG5pbXBvcnQgeyBkZWVwTWVyZ2UsIGdldE5hbWVzIH0gZnJvbSAnLi4vLi4vdXRpbHMnXG5pbXBvcnQgeyBlcXVhbHMsIGl0ZXJhYmxlRXF1YWxpdHksIHN1YnNldEVxdWFsaXR5IH0gZnJvbSAnLi4vY2hhaS9qZXN0LXV0aWxzJ1xuaW1wb3J0IFNuYXBzaG90U3RhdGUgZnJvbSAnLi9wb3J0L3N0YXRlJ1xuXG5leHBvcnQgaW50ZXJmYWNlIENvbnRleHQge1xuICBmaWxlOiBzdHJpbmdcbiAgdGl0bGU/OiBzdHJpbmdcbiAgZnVsbFRpdGxlPzogc3RyaW5nXG59XG5cbmNvbnN0IHJlc29sdmVTbmFwc2hvdFBhdGggPSAodGVzdFBhdGg6IHN0cmluZykgPT5cbiAgcGF0aC5qb2luKFxuICAgIHBhdGguam9pbihwYXRoLmRpcm5hbWUodGVzdFBhdGgpLCAnX19zbmFwc2hvdHNfXycpLFxuICAgIGAke3BhdGguYmFzZW5hbWUodGVzdFBhdGgpfS5zbmFwYCxcbiAgKVxuXG5leHBvcnQgY2xhc3MgU25hcHNob3RDbGllbnQge1xuICB0ZXN0OiBUZXN0IHwgdW5kZWZpbmVkXG4gIHRlc3RGaWxlID0gJydcbiAgc25hcHNob3RTdGF0ZTogU25hcHNob3RTdGF0ZSB8IHVuZGVmaW5lZFxuXG4gIHNldFRlc3QodGVzdDogVGVzdCkge1xuICAgIHRoaXMudGVzdCA9IHRlc3RcblxuICAgIGlmICh0aGlzLnRlc3RGaWxlICE9PSB0aGlzLnRlc3QuZmlsZSEuZmlsZXBhdGgpIHtcbiAgICAgIGlmICh0aGlzLnNuYXBzaG90U3RhdGUpXG4gICAgICAgIHRoaXMuc2F2ZVNuYXAoKVxuXG4gICAgICB0aGlzLnRlc3RGaWxlID0gdGhpcy50ZXN0IS5maWxlIS5maWxlcGF0aFxuICAgICAgdGhpcy5zbmFwc2hvdFN0YXRlID0gbmV3IFNuYXBzaG90U3RhdGUoXG4gICAgICAgIHJlc29sdmVTbmFwc2hvdFBhdGgodGhpcy50ZXN0RmlsZSksXG4gICAgICAgIHByb2Nlc3MuX192aXRlc3Rfd29ya2VyX18hLmNvbmZpZy5zbmFwc2hvdE9wdGlvbnMsXG4gICAgICApXG4gICAgfVxuICB9XG5cbiAgY2xlYXJUZXN0KCkge1xuICAgIHRoaXMudGVzdCA9IHVuZGVmaW5lZFxuICB9XG5cbiAgYXNzZXJ0KHJlY2VpdmVkOiB1bmtub3duLCBtZXNzYWdlPzogc3RyaW5nLCBpc0lubGluZSA9IGZhbHNlLCBwcm9wZXJ0aWVzPzogb2JqZWN0LCBpbmxpbmVTbmFwc2hvdD86IHN0cmluZyk6IHZvaWQge1xuICAgIGlmICghdGhpcy50ZXN0KVxuICAgICAgdGhyb3cgbmV3IEVycm9yKCdTbmFwc2hvdCBjYW5ub3QgYmUgdXNlZCBvdXRzaWRlIG9mIHRlc3QnKVxuXG4gICAgaWYgKHR5cGVvZiBwcm9wZXJ0aWVzID09PSAnb2JqZWN0Jykge1xuICAgICAgaWYgKHR5cGVvZiByZWNlaXZlZCAhPT0gJ29iamVjdCcgfHwgIXJlY2VpdmVkKVxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1JlY2VpdmVkIHZhbHVlIG11c3QgYmUgYW4gb2JqZWN0IHdoZW4gdGhlIG1hdGNoZXIgaGFzIHByb3BlcnRpZXMnKVxuXG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCBwYXNzID0gZXF1YWxzKHJlY2VpdmVkLCBwcm9wZXJ0aWVzLCBbaXRlcmFibGVFcXVhbGl0eSwgc3Vic2V0RXF1YWxpdHldKVxuICAgICAgICBpZiAoIXBhc3MpXG4gICAgICAgICAgZXhwZWN0KHJlY2VpdmVkKS50b0JlKHByb3BlcnRpZXMpXG4gICAgICAgIGVsc2VcbiAgICAgICAgICByZWNlaXZlZCA9IGRlZXBNZXJnZShyZWNlaXZlZCwgcHJvcGVydGllcylcbiAgICAgIH1cbiAgICAgIGNhdGNoIChlcnI6IGFueSkge1xuICAgICAgICBlcnIubWVzc2FnZSA9ICdTbmFwc2hvdCBtaXNtYXRjaGVkJ1xuICAgICAgICB0aHJvdyBlcnJcbiAgICAgIH1cbiAgICB9XG5cbiAgICBjb25zdCB0ZXN0TmFtZSA9IFtcbiAgICAgIC4uLmdldE5hbWVzKHRoaXMudGVzdCkuc2xpY2UoMSksXG4gICAgICAuLi4obWVzc2FnZSA/IFttZXNzYWdlXSA6IFtdKSxcbiAgICBdLmpvaW4oJyA+ICcpXG5cbiAgICBjb25zdCB7IGFjdHVhbCwgZXhwZWN0ZWQsIGtleSwgcGFzcyB9ID0gdGhpcy5zbmFwc2hvdFN0YXRlIS5tYXRjaCh7XG4gICAgICB0ZXN0TmFtZSxcbiAgICAgIHJlY2VpdmVkLFxuICAgICAgaXNJbmxpbmUsXG4gICAgICBpbmxpbmVTbmFwc2hvdCxcbiAgICB9KVxuXG4gICAgaWYgKCFwYXNzKSB7XG4gICAgICB0cnkge1xuICAgICAgICBleHBlY3QoYWN0dWFsLnRyaW0oKSkuZXF1YWxzKGV4cGVjdGVkID8gZXhwZWN0ZWQudHJpbSgpIDogJycpXG4gICAgICB9XG4gICAgICBjYXRjaCAoZXJyb3I6IGFueSkge1xuICAgICAgICBlcnJvci5tZXNzYWdlID0gYFNuYXBzaG90IFxcYCR7a2V5IHx8ICd1bmtub3duJ31cXGAgbWlzbWF0Y2hlZGBcbiAgICAgICAgdGhyb3cgZXJyb3JcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBhc3luYyBzYXZlU25hcCgpIHtcbiAgICBpZiAoIXRoaXMudGVzdEZpbGUgfHwgIXRoaXMuc25hcHNob3RTdGF0ZSkgcmV0dXJuXG4gICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgcGFja1NuYXBzaG90U3RhdGUodGhpcy50ZXN0RmlsZSwgdGhpcy5zbmFwc2hvdFN0YXRlKVxuICAgIGF3YWl0IHJwYygpLnNuYXBzaG90U2F2ZWQocmVzdWx0KVxuXG4gICAgdGhpcy50ZXN0RmlsZSA9ICcnXG4gICAgdGhpcy5zbmFwc2hvdFN0YXRlID0gdW5kZWZpbmVkXG4gIH1cbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHBhY2tTbmFwc2hvdFN0YXRlKGZpbGVwYXRoOiBzdHJpbmcsIHN0YXRlOiBTbmFwc2hvdFN0YXRlKTogUHJvbWlzZTxTbmFwc2hvdFJlc3VsdD4ge1xuICBjb25zdCBzbmFwc2hvdDogU25hcHNob3RSZXN1bHQgPSB7XG4gICAgZmlsZXBhdGgsXG4gICAgYWRkZWQ6IDAsXG4gICAgZmlsZURlbGV0ZWQ6IGZhbHNlLFxuICAgIG1hdGNoZWQ6IDAsXG4gICAgdW5jaGVja2VkOiAwLFxuICAgIHVuY2hlY2tlZEtleXM6IFtdLFxuICAgIHVubWF0Y2hlZDogMCxcbiAgICB1cGRhdGVkOiAwLFxuICB9XG4gIGNvbnN0IHVuY2hlY2tlZENvdW50ID0gc3RhdGUuZ2V0VW5jaGVja2VkQ291bnQoKVxuICBjb25zdCB1bmNoZWNrZWRLZXlzID0gc3RhdGUuZ2V0VW5jaGVja2VkS2V5cygpXG4gIGlmICh1bmNoZWNrZWRDb3VudClcbiAgICBzdGF0ZS5yZW1vdmVVbmNoZWNrZWRLZXlzKClcblxuICBjb25zdCBzdGF0dXMgPSBhd2FpdCBzdGF0ZS5zYXZlKClcbiAgc25hcHNob3QuZmlsZURlbGV0ZWQgPSBzdGF0dXMuZGVsZXRlZFxuICBzbmFwc2hvdC5hZGRlZCA9IHN0YXRlLmFkZGVkXG4gIHNuYXBzaG90Lm1hdGNoZWQgPSBzdGF0ZS5tYXRjaGVkXG4gIHNuYXBzaG90LnVubWF0Y2hlZCA9IHN0YXRlLnVubWF0Y2hlZFxuICBzbmFwc2hvdC51cGRhdGVkID0gc3RhdGUudXBkYXRlZFxuICBzbmFwc2hvdC51bmNoZWNrZWQgPSAhc3RhdHVzLmRlbGV0ZWQgPyB1bmNoZWNrZWRDb3VudCA6IDBcbiAgc25hcHNob3QudW5jaGVja2VkS2V5cyA9IEFycmF5LmZyb20odW5jaGVja2VkS2V5cylcblxuICByZXR1cm4gc25hcHNob3Rcbn1cbiIsImltcG9ydCB0eXBlIHsgQ2hhaVBsdWdpbiB9IGZyb20gJy4uL2NoYWkvdHlwZXMnXG5pbXBvcnQgeyBTbmFwc2hvdENsaWVudCB9IGZyb20gJy4vY2xpZW50J1xuXG5sZXQgX2NsaWVudDogU25hcHNob3RDbGllbnRcblxuZXhwb3J0IGZ1bmN0aW9uIGdldFNuYXBzaG90Q2xpZW50KCk6IFNuYXBzaG90Q2xpZW50IHtcbiAgaWYgKCFfY2xpZW50KVxuICAgIF9jbGllbnQgPSBuZXcgU25hcHNob3RDbGllbnQoKVxuICByZXR1cm4gX2NsaWVudFxufVxuXG5jb25zdCBnZXRFcnJvclN0cmluZyA9IChleHBlY3RlZDogKCkgPT4gdm9pZCkgPT4ge1xuICB0cnkge1xuICAgIGV4cGVjdGVkKClcbiAgfVxuICBjYXRjaCAoZSkge1xuICAgIGlmIChlIGluc3RhbmNlb2YgRXJyb3IpXG4gICAgICByZXR1cm4gZS5tZXNzYWdlXG5cbiAgICByZXR1cm4gZVxuICB9XG5cbiAgdGhyb3cgbmV3IEVycm9yKCdzbmFwc2hvdCBmdW5jdGlvbiBkaWRuXFwndCB0aHJldycpXG59XG5cbmV4cG9ydCBjb25zdCBTbmFwc2hvdFBsdWdpbjogQ2hhaVBsdWdpbiA9IChjaGFpLCB1dGlscykgPT4ge1xuICBmb3IgKGNvbnN0IGtleSBvZiBbJ21hdGNoU25hcHNob3QnLCAndG9NYXRjaFNuYXBzaG90J10pIHtcbiAgICB1dGlscy5hZGRNZXRob2QoXG4gICAgICBjaGFpLkFzc2VydGlvbi5wcm90b3R5cGUsXG4gICAgICBrZXksXG4gICAgICBmdW5jdGlvbih0aGlzOiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPiwgcHJvcGVydGllcz86IG9iamVjdCwgbWVzc2FnZT86IHN0cmluZykge1xuICAgICAgICBjb25zdCBleHBlY3RlZCA9IHV0aWxzLmZsYWcodGhpcywgJ29iamVjdCcpXG4gICAgICAgIGlmICh0eXBlb2YgcHJvcGVydGllcyA9PT0gJ3N0cmluZycgJiYgdHlwZW9mIG1lc3NhZ2UgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgbWVzc2FnZSA9IHByb3BlcnRpZXNcbiAgICAgICAgICBwcm9wZXJ0aWVzID0gdW5kZWZpbmVkXG4gICAgICAgIH1cbiAgICAgICAgZ2V0U25hcHNob3RDbGllbnQoKS5hc3NlcnQoZXhwZWN0ZWQsIG1lc3NhZ2UsIGZhbHNlLCBwcm9wZXJ0aWVzKVxuICAgICAgfSxcbiAgICApXG4gIH1cbiAgdXRpbHMuYWRkTWV0aG9kKFxuICAgIGNoYWkuQXNzZXJ0aW9uLnByb3RvdHlwZSxcbiAgICAndG9NYXRjaElubGluZVNuYXBzaG90JyxcbiAgICBmdW5jdGlvbiBfX1ZJVEVTVF9JTkxJTkVfU05BUFNIT1RfXyh0aGlzOiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPiwgcHJvcGVydGllcz86IG9iamVjdCwgaW5saW5lU25hcHNob3Q/OiBzdHJpbmcsIG1lc3NhZ2U/OiBzdHJpbmcpIHtcbiAgICAgIGNvbnN0IGV4cGVjdGVkID0gdXRpbHMuZmxhZyh0aGlzLCAnb2JqZWN0JylcbiAgICAgIGlmICh0eXBlb2YgcHJvcGVydGllcyA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgbWVzc2FnZSA9IGlubGluZVNuYXBzaG90XG4gICAgICAgIGlubGluZVNuYXBzaG90ID0gcHJvcGVydGllc1xuICAgICAgICBwcm9wZXJ0aWVzID0gdW5kZWZpbmVkXG4gICAgICB9XG4gICAgICBnZXRTbmFwc2hvdENsaWVudCgpLmFzc2VydChleHBlY3RlZCwgbWVzc2FnZSwgdHJ1ZSwgcHJvcGVydGllcywgaW5saW5lU25hcHNob3QpXG4gICAgfSxcbiAgKVxuICB1dGlscy5hZGRNZXRob2QoXG4gICAgY2hhaS5Bc3NlcnRpb24ucHJvdG90eXBlLFxuICAgICd0b1Rocm93RXJyb3JNYXRjaGluZ1NuYXBzaG90JyxcbiAgICBmdW5jdGlvbih0aGlzOiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPiwgbWVzc2FnZT86IHN0cmluZykge1xuICAgICAgY29uc3QgZXhwZWN0ZWQgPSB1dGlscy5mbGFnKHRoaXMsICdvYmplY3QnKVxuICAgICAgZ2V0U25hcHNob3RDbGllbnQoKS5hc3NlcnQoZ2V0RXJyb3JTdHJpbmcoZXhwZWN0ZWQpLCBtZXNzYWdlKVxuICAgIH0sXG4gIClcbiAgdXRpbHMuYWRkTWV0aG9kKFxuICAgIGNoYWkuQXNzZXJ0aW9uLnByb3RvdHlwZSxcbiAgICAndG9UaHJvd0Vycm9yTWF0Y2hpbmdJbmxpbmVTbmFwc2hvdCcsXG4gICAgZnVuY3Rpb24gX19WSVRFU1RfSU5MSU5FX1NOQVBTSE9UX18odGhpczogUmVjb3JkPHN0cmluZywgdW5rbm93bj4sIGlubGluZVNuYXBzaG90OiBzdHJpbmcsIG1lc3NhZ2U6IHN0cmluZykge1xuICAgICAgY29uc3QgZXhwZWN0ZWQgPSB1dGlscy5mbGFnKHRoaXMsICdvYmplY3QnKVxuICAgICAgZ2V0U25hcHNob3RDbGllbnQoKS5hc3NlcnQoZ2V0RXJyb3JTdHJpbmcoZXhwZWN0ZWQpLCBtZXNzYWdlLCB0cnVlLCB1bmRlZmluZWQsIGlubGluZVNuYXBzaG90KVxuICAgIH0sXG4gIClcbn1cbiIsIi8vIHdlIGFyZSB1c2luZyBvbmx5IHRoZSBvbmVzIG5lZWRlZCBieSBAdGVzdGluZy1saWJyYXJ5L2plc3QtZG9tXG4vLyBpZiB5b3UgbmVlZCBtb3JlLCBqdXN0IGFza1xuXG5pbXBvcnQgYyBmcm9tICdwaWNvY29sb3JzJ1xuaW1wb3J0IHR5cGUgeyBGb3JtYXR0ZXIgfSBmcm9tICdwaWNvY29sb3JzL3R5cGVzJ1xuaW1wb3J0IHsgZm9ybWF0IGFzIHByZXR0eUZvcm1hdCwgcGx1Z2lucyBhcyBwcmV0dHlGb3JtYXRQbHVnaW5zIH0gZnJvbSAncHJldHR5LWZvcm1hdCdcbmltcG9ydCB7IHVuaWZpZWREaWZmIH0gZnJvbSAnLi4vLi4vbm9kZS9yZXBvcnRlcnMvcmVuZGVyZXJzL2RpZmYnXG5cbmV4cG9ydCBjb25zdCBFWFBFQ1RFRF9DT0xPUiA9IGMuZ3JlZW5cbmV4cG9ydCBjb25zdCBSRUNFSVZFRF9DT0xPUiA9IGMucmVkXG5leHBvcnQgY29uc3QgSU5WRVJURURfQ09MT1IgPSBjLmludmVyc2VcbmV4cG9ydCBjb25zdCBCT0xEX1dFSUdIVCA9IGMuYm9sZFxuZXhwb3J0IGNvbnN0IERJTV9DT0xPUiA9IGMuZGltXG5cbmNvbnN0IHtcbiAgQXN5bW1ldHJpY01hdGNoZXIsXG4gIERPTUNvbGxlY3Rpb24sXG4gIERPTUVsZW1lbnQsXG4gIEltbXV0YWJsZSxcbiAgUmVhY3RFbGVtZW50LFxuICBSZWFjdFRlc3RDb21wb25lbnQsXG59ID0gcHJldHR5Rm9ybWF0UGx1Z2luc1xuXG5jb25zdCBQTFVHSU5TID0gW1xuICBSZWFjdFRlc3RDb21wb25lbnQsXG4gIFJlYWN0RWxlbWVudCxcbiAgRE9NRWxlbWVudCxcbiAgRE9NQ29sbGVjdGlvbixcbiAgSW1tdXRhYmxlLFxuICBBc3ltbWV0cmljTWF0Y2hlcixcbl1cblxuZXhwb3J0IGludGVyZmFjZSBNYXRjaGVySGludE9wdGlvbnMge1xuICBjb21tZW50Pzogc3RyaW5nXG4gIGV4cGVjdGVkQ29sb3I/OiBGb3JtYXR0ZXJcbiAgaXNEaXJlY3RFeHBlY3RDYWxsPzogYm9vbGVhblxuICBpc05vdD86IGJvb2xlYW5cbiAgcHJvbWlzZT86IHN0cmluZ1xuICByZWNlaXZlZENvbG9yPzogRm9ybWF0dGVyXG4gIHNlY29uZEFyZ3VtZW50Pzogc3RyaW5nXG4gIHNlY29uZEFyZ3VtZW50Q29sb3I/OiBGb3JtYXR0ZXJcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG1hdGNoZXJIaW50KFxuICBtYXRjaGVyTmFtZTogc3RyaW5nLFxuICByZWNlaXZlZCA9ICdyZWNlaXZlZCcsXG4gIGV4cGVjdGVkID0gJ2V4cGVjdGVkJyxcbiAgb3B0aW9uczogTWF0Y2hlckhpbnRPcHRpb25zID0ge30sXG4pIHtcbiAgY29uc3Qge1xuICAgIGNvbW1lbnQgPSAnJyxcbiAgICBleHBlY3RlZENvbG9yID0gRVhQRUNURURfQ09MT1IsXG4gICAgaXNEaXJlY3RFeHBlY3RDYWxsID0gZmFsc2UsIC8vIHNlZW1zIHJlZHVuZGFudCB3aXRoIHJlY2VpdmVkID09PSAnJ1xuICAgIGlzTm90ID0gZmFsc2UsXG4gICAgcHJvbWlzZSA9ICcnLFxuICAgIHJlY2VpdmVkQ29sb3IgPSBSRUNFSVZFRF9DT0xPUixcbiAgICBzZWNvbmRBcmd1bWVudCA9ICcnLFxuICAgIHNlY29uZEFyZ3VtZW50Q29sb3IgPSBFWFBFQ1RFRF9DT0xPUixcbiAgfSA9IG9wdGlvbnNcbiAgbGV0IGhpbnQgPSAnJ1xuICBsZXQgZGltU3RyaW5nID0gJ2V4cGVjdCcgLy8gY29uY2F0ZW5hdGUgYWRqYWNlbnQgZGltIHN1YnN0cmluZ3NcblxuICBpZiAoIWlzRGlyZWN0RXhwZWN0Q2FsbCAmJiByZWNlaXZlZCAhPT0gJycpIHtcbiAgICBoaW50ICs9IERJTV9DT0xPUihgJHtkaW1TdHJpbmd9KGApICsgcmVjZWl2ZWRDb2xvcihyZWNlaXZlZClcbiAgICBkaW1TdHJpbmcgPSAnKSdcbiAgfVxuXG4gIGlmIChwcm9taXNlICE9PSAnJykge1xuICAgIGhpbnQgKz0gRElNX0NPTE9SKGAke2RpbVN0cmluZ30uYCkgKyBwcm9taXNlXG4gICAgZGltU3RyaW5nID0gJydcbiAgfVxuXG4gIGlmIChpc05vdCkge1xuICAgIGhpbnQgKz0gYCR7RElNX0NPTE9SKGAke2RpbVN0cmluZ30uYCl9bm90YFxuICAgIGRpbVN0cmluZyA9ICcnXG4gIH1cblxuICBpZiAobWF0Y2hlck5hbWUuaW5jbHVkZXMoJy4nKSkge1xuICAgIC8vIE9sZCBmb3JtYXQ6IGZvciBiYWNrd2FyZCBjb21wYXRpYmlsaXR5LFxuICAgIC8vIGVzcGVjaWFsbHkgd2l0aG91dCBwcm9taXNlIG9yIGlzTm90IG9wdGlvbnNcbiAgICBkaW1TdHJpbmcgKz0gbWF0Y2hlck5hbWVcbiAgfVxuICBlbHNlIHtcbiAgICAvLyBOZXcgZm9ybWF0OiBvbWl0IHBlcmlvZCBmcm9tIG1hdGNoZXJOYW1lIGFyZ1xuICAgIGhpbnQgKz0gRElNX0NPTE9SKGAke2RpbVN0cmluZ30uYCkgKyBtYXRjaGVyTmFtZVxuICAgIGRpbVN0cmluZyA9ICcnXG4gIH1cblxuICBpZiAoZXhwZWN0ZWQgPT09ICcnKSB7XG4gICAgZGltU3RyaW5nICs9ICcoKSdcbiAgfVxuICBlbHNlIHtcbiAgICBoaW50ICs9IERJTV9DT0xPUihgJHtkaW1TdHJpbmd9KGApICsgZXhwZWN0ZWRDb2xvcihleHBlY3RlZClcbiAgICBpZiAoc2Vjb25kQXJndW1lbnQpXG4gICAgICBoaW50ICs9IERJTV9DT0xPUignLCAnKSArIHNlY29uZEFyZ3VtZW50Q29sb3Ioc2Vjb25kQXJndW1lbnQpXG4gICAgZGltU3RyaW5nID0gJyknXG4gIH1cblxuICBpZiAoY29tbWVudCAhPT0gJycpXG4gICAgZGltU3RyaW5nICs9IGAgLy8gJHtjb21tZW50fWBcblxuICBpZiAoZGltU3RyaW5nICE9PSAnJylcbiAgICBoaW50ICs9IERJTV9DT0xPUihkaW1TdHJpbmcpXG5cbiAgcmV0dXJuIGhpbnRcbn1cblxuY29uc3QgU1BBQ0VfU1lNQk9MID0gJ1xcdXswMEI3fScgLy8gbWlkZGxlIGRvdFxuXG4vLyBJbnN0ZWFkIG9mIGludmVyc2UgaGlnaGxpZ2h0IHdoaWNoIG5vdyBpbXBsaWVzIGEgY2hhbmdlLFxuLy8gcmVwbGFjZSBjb21tb24gc3BhY2VzIHdpdGggbWlkZGxlIGRvdCBhdCB0aGUgZW5kIG9mIGFueSBsaW5lLlxuY29uc3QgcmVwbGFjZVRyYWlsaW5nU3BhY2VzID0gKHRleHQ6IHN0cmluZyk6IHN0cmluZyA9PlxuICB0ZXh0LnJlcGxhY2UoL1xccyskL2dtLCBzcGFjZXMgPT4gU1BBQ0VfU1lNQk9MLnJlcGVhdChzcGFjZXMubGVuZ3RoKSlcblxuZXhwb3J0IGNvbnN0IHN0cmluZ2lmeSA9IChvYmplY3Q6IHVua25vd24sIG1heERlcHRoID0gMTApOiBzdHJpbmcgPT4ge1xuICBjb25zdCBNQVhfTEVOR1RIID0gMTAwMDBcbiAgbGV0IHJlc3VsdFxuXG4gIHRyeSB7XG4gICAgcmVzdWx0ID0gcHJldHR5Rm9ybWF0KG9iamVjdCwge1xuICAgICAgbWF4RGVwdGgsXG4gICAgICAvLyBtaW46IHRydWUsXG4gICAgICBwbHVnaW5zOiBQTFVHSU5TLFxuICAgIH0pXG4gIH1cbiAgY2F0Y2gge1xuICAgIHJlc3VsdCA9IHByZXR0eUZvcm1hdChvYmplY3QsIHtcbiAgICAgIGNhbGxUb0pTT046IGZhbHNlLFxuICAgICAgbWF4RGVwdGgsXG4gICAgICAvLyBtaW46IHRydWUsXG4gICAgICBwbHVnaW5zOiBQTFVHSU5TLFxuICAgIH0pXG4gIH1cblxuICByZXR1cm4gcmVzdWx0Lmxlbmd0aCA+PSBNQVhfTEVOR1RIICYmIG1heERlcHRoID4gMVxuICAgID8gc3RyaW5naWZ5KG9iamVjdCwgTWF0aC5mbG9vcihtYXhEZXB0aCAvIDIpKVxuICAgIDogcmVzdWx0XG59XG5cbmV4cG9ydCBjb25zdCBwcmludFJlY2VpdmVkID0gKG9iamVjdDogdW5rbm93bik6IHN0cmluZyA9PlxuICBSRUNFSVZFRF9DT0xPUihyZXBsYWNlVHJhaWxpbmdTcGFjZXMoc3RyaW5naWZ5KG9iamVjdCkpKVxuZXhwb3J0IGNvbnN0IHByaW50RXhwZWN0ZWQgPSAodmFsdWU6IHVua25vd24pOiBzdHJpbmcgPT5cbiAgRVhQRUNURURfQ09MT1IocmVwbGFjZVRyYWlsaW5nU3BhY2VzKHN0cmluZ2lmeSh2YWx1ZSkpKVxuXG5leHBvcnQgaW50ZXJmYWNlIERpZmZPcHRpb25zIHtcbiAgYUFubm90YXRpb24/OiBzdHJpbmdcbiAgYUNvbG9yPzogRm9ybWF0dGVyXG4gIGFJbmRpY2F0b3I/OiBzdHJpbmdcbiAgYkFubm90YXRpb24/OiBzdHJpbmdcbiAgYkNvbG9yPzogRm9ybWF0dGVyXG4gIGJJbmRpY2F0b3I/OiBzdHJpbmdcbiAgY2hhbmdlQ29sb3I/OiBGb3JtYXR0ZXJcbiAgY2hhbmdlTGluZVRyYWlsaW5nU3BhY2VDb2xvcj86IEZvcm1hdHRlclxuICBjb21tb25Db2xvcj86IEZvcm1hdHRlclxuICBjb21tb25JbmRpY2F0b3I/OiBzdHJpbmdcbiAgY29tbW9uTGluZVRyYWlsaW5nU3BhY2VDb2xvcj86IEZvcm1hdHRlclxuICBjb250ZXh0TGluZXM/OiBudW1iZXJcbiAgZW1wdHlGaXJzdE9yTGFzdExpbmVQbGFjZWhvbGRlcj86IHN0cmluZ1xuICBleHBhbmQ/OiBib29sZWFuXG4gIGluY2x1ZGVDaGFuZ2VDb3VudHM/OiBib29sZWFuXG4gIG9taXRBbm5vdGF0aW9uTGluZXM/OiBib29sZWFuXG4gIHBhdGNoQ29sb3I/OiBGb3JtYXR0ZXJcbiAgLy8gcHJldHR5LWZvcm1hdCB0eXBlXG4gIGNvbXBhcmVLZXlzPzogYW55XG59XG5cbi8vIFRPRE86IGRvIHNvbWV0aGluZyB3aXRoIG9wdGlvbnNcbi8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tdW51c2VkLXZhcnNcbmV4cG9ydCBmdW5jdGlvbiBkaWZmKGE6IGFueSwgYjogYW55LCBvcHRpb25zPzogRGlmZk9wdGlvbnMpIHtcbiAgcmV0dXJuIHVuaWZpZWREaWZmKHN0cmluZ2lmeShhKSwgc3RyaW5naWZ5KGIpKVxufVxuIiwiaW1wb3J0IGNoYWksIHsgdXRpbCB9IGZyb20gJ2NoYWknXG5pbXBvcnQgeyBnZXRTdGF0ZSB9IGZyb20gJy4vamVzdC1leHBlY3QnXG5cbmltcG9ydCAqIGFzIG1hdGNoZXJVdGlscyBmcm9tICcuL2plc3QtbWF0Y2hlci11dGlscydcblxuaW1wb3J0IHtcbiAgZXF1YWxzLFxuICBpdGVyYWJsZUVxdWFsaXR5LFxuICBzdWJzZXRFcXVhbGl0eSxcbn0gZnJvbSAnLi9qZXN0LXV0aWxzJ1xuaW1wb3J0IHR5cGUge1xuICBDaGFpUGx1Z2luLFxuICBNYXRjaGVyU3RhdGUsXG4gIE1hdGNoZXJzT2JqZWN0LFxuICBTeW5jRXhwZWN0YXRpb25SZXN1bHQsXG59IGZyb20gJy4vdHlwZXMnXG5cbmNvbnN0IGlzQXN5bmNGdW5jdGlvbiA9IChmbjogdW5rbm93bikgPT5cbiAgdHlwZW9mIGZuID09PSAnZnVuY3Rpb24nICYmIChmbiBhcyBhbnkpW1N5bWJvbC50b1N0cmluZ1RhZ10gPT09ICdBc3luY0Z1bmN0aW9uJ1xuXG5jb25zdCBnZXRNYXRjaGVyU3RhdGUgPSAoYXNzZXJ0aW9uOiBDaGFpLkFzc2VydGlvblN0YXRpYyAmIENoYWkuQXNzZXJ0aW9uKSA9PiB7XG4gIGNvbnN0IG9iaiA9IGFzc2VydGlvbi5fb2JqXG4gIGNvbnN0IGlzTm90ID0gdXRpbC5mbGFnKGFzc2VydGlvbiwgJ25lZ2F0ZScpIGFzIGJvb2xlYW5cbiAgY29uc3QgcHJvbWlzZSA9IHV0aWwuZmxhZyhhc3NlcnRpb24sICdwcm9taXNlJykgfHwgJydcbiAgY29uc3QgamVzdFV0aWxzID0ge1xuICAgIC4uLm1hdGNoZXJVdGlscyxcbiAgICBpdGVyYWJsZUVxdWFsaXR5LFxuICAgIHN1YnNldEVxdWFsaXR5LFxuICB9XG5cbiAgY29uc3QgbWF0Y2hlclN0YXRlOiBNYXRjaGVyU3RhdGUgPSB7XG4gICAgLi4uZ2V0U3RhdGUoKSxcbiAgICBpc05vdCxcbiAgICB1dGlsczogamVzdFV0aWxzLFxuICAgIHByb21pc2UsXG4gICAgZXF1YWxzLFxuICAgIC8vIG5lZWRlZCBmb3IgYnVpbHQtaW4gamVzdC1zbmFwc2hvdHMsIGJ1dCB3ZSBkb24ndCB1c2UgaXRcbiAgICBzdXBwcmVzc2VkRXJyb3JzOiBbXSxcbiAgfVxuXG4gIHJldHVybiB7XG4gICAgc3RhdGU6IG1hdGNoZXJTdGF0ZSxcbiAgICBpc05vdCxcbiAgICBvYmosXG4gIH1cbn1cblxuY2xhc3MgSmVzdEV4dGVuZEVycm9yIGV4dGVuZHMgRXJyb3Ige1xuICBjb25zdHJ1Y3RvcihtZXNzYWdlOiBzdHJpbmcsIHB1YmxpYyBhY3R1YWw/OiBhbnksIHB1YmxpYyBleHBlY3RlZD86IGFueSkge1xuICAgIHN1cGVyKG1lc3NhZ2UpXG4gIH1cbn1cblxuZnVuY3Rpb24gSmVzdEV4dGVuZFBsdWdpbihleHBlY3RzOiBNYXRjaGVyc09iamVjdCk6IENoYWlQbHVnaW4ge1xuICByZXR1cm4gKGMsIHV0aWxzKSA9PiB7XG4gICAgT2JqZWN0LmVudHJpZXMoZXhwZWN0cykuZm9yRWFjaCgoW2V4cGVjdEFzc2VydGlvbk5hbWUsIGV4cGVjdEFzc2VydGlvbl0pID0+IHtcbiAgICAgIGZ1bmN0aW9uIGV4cGVjdFN5bmNXcmFwcGVyKHRoaXM6IENoYWkuQXNzZXJ0aW9uU3RhdGljICYgQ2hhaS5Bc3NlcnRpb24sIC4uLmFyZ3M6IGFueVtdKSB7XG4gICAgICAgIGNvbnN0IHsgc3RhdGUsIGlzTm90LCBvYmogfSA9IGdldE1hdGNoZXJTdGF0ZSh0aGlzKVxuXG4gICAgICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgYXJncyB3YW50aW5nIHR1cGxlXG4gICAgICAgIGNvbnN0IHsgcGFzcywgbWVzc2FnZSwgYWN0dWFsLCBleHBlY3RlZCB9ID0gZXhwZWN0QXNzZXJ0aW9uLmNhbGwoc3RhdGUsIG9iaiwgLi4uYXJncykgYXMgU3luY0V4cGVjdGF0aW9uUmVzdWx0XG5cbiAgICAgICAgaWYgKChwYXNzICYmIGlzTm90KSB8fCAoIXBhc3MgJiYgIWlzTm90KSlcbiAgICAgICAgICB0aHJvdyBuZXcgSmVzdEV4dGVuZEVycm9yKG1lc3NhZ2UoKSwgYWN0dWFsLCBleHBlY3RlZClcbiAgICAgIH1cblxuICAgICAgYXN5bmMgZnVuY3Rpb24gZXhwZWN0QXN5bmNXcmFwcGVyKHRoaXM6IENoYWkuQXNzZXJ0aW9uU3RhdGljICYgQ2hhaS5Bc3NlcnRpb24sIC4uLmFyZ3M6IGFueVtdKSB7XG4gICAgICAgIGNvbnN0IHsgc3RhdGUsIGlzTm90LCBvYmogfSA9IGdldE1hdGNoZXJTdGF0ZSh0aGlzKVxuXG4gICAgICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgYXJncyB3YW50aW5nIHR1cGxlXG4gICAgICAgIGNvbnN0IHsgcGFzcywgbWVzc2FnZSwgYWN0dWFsLCBleHBlY3RlZCB9ID0gYXdhaXQgZXhwZWN0QXNzZXJ0aW9uLmNhbGwoc3RhdGUsIG9iaiwgLi4uYXJncykgYXMgU3luY0V4cGVjdGF0aW9uUmVzdWx0XG5cbiAgICAgICAgaWYgKChwYXNzICYmIGlzTm90KSB8fCAoIXBhc3MgJiYgIWlzTm90KSlcbiAgICAgICAgICB0aHJvdyBuZXcgSmVzdEV4dGVuZEVycm9yKG1lc3NhZ2UoKSwgYWN0dWFsLCBleHBlY3RlZClcbiAgICAgIH1cblxuICAgICAgY29uc3QgZXhwZWN0QXNzZXJ0aW9uV3JhcHBlciA9IGlzQXN5bmNGdW5jdGlvbihleHBlY3RBc3NlcnRpb24pID8gZXhwZWN0QXN5bmNXcmFwcGVyIDogZXhwZWN0U3luY1dyYXBwZXJcblxuICAgICAgdXRpbHMuYWRkTWV0aG9kKGNoYWkuQXNzZXJ0aW9uLnByb3RvdHlwZSwgZXhwZWN0QXNzZXJ0aW9uTmFtZSwgZXhwZWN0QXNzZXJ0aW9uV3JhcHBlcilcbiAgICB9KVxuICB9XG59XG5cbmV4cG9ydCBjb25zdCBKZXN0RXh0ZW5kOiBDaGFpUGx1Z2luID0gKGNoYWksIHV0aWxzKSA9PiB7XG4gIHV0aWxzLmFkZE1ldGhvZChjaGFpLmV4cGVjdCwgJ2V4dGVuZCcsIChleHBlY3RzOiBNYXRjaGVyc09iamVjdCkgPT4ge1xuICAgIGNoYWkudXNlKEplc3RFeHRlbmRQbHVnaW4oZXhwZWN0cykpXG4gIH0pXG59XG4iLCJpbXBvcnQgKiBhcyBtYXRjaGVyVXRpbHMgZnJvbSAnLi9qZXN0LW1hdGNoZXItdXRpbHMnXG5cbmltcG9ydCB7IGVxdWFscywgaXNBIH0gZnJvbSAnLi9qZXN0LXV0aWxzJ1xuaW1wb3J0IHR5cGUgeyBDaGFpUGx1Z2luLCBNYXRjaGVyU3RhdGUgfSBmcm9tICcuL3R5cGVzJ1xuXG5leHBvcnQgaW50ZXJmYWNlIEFzeW1tZXRyaWNNYXRjaGVySW50ZXJmYWNlIHtcbiAgYXN5bW1ldHJpY01hdGNoKG90aGVyOiB1bmtub3duKTogYm9vbGVhblxuICB0b1N0cmluZygpOiBzdHJpbmdcbiAgZ2V0RXhwZWN0ZWRUeXBlPygpOiBzdHJpbmdcbiAgdG9Bc3ltbWV0cmljTWF0Y2hlcj8oKTogc3RyaW5nXG59XG5cbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBBc3ltbWV0cmljTWF0Y2hlcjxcbiAgVCxcbiAgU3RhdGUgZXh0ZW5kcyBNYXRjaGVyU3RhdGUgPSBNYXRjaGVyU3RhdGUsXG4+IGltcGxlbWVudHMgQXN5bW1ldHJpY01hdGNoZXJJbnRlcmZhY2Uge1xuICAkJHR5cGVvZiA9IFN5bWJvbC5mb3IoJ2plc3QuYXN5bW1ldHJpY01hdGNoZXInKVxuXG4gIGNvbnN0cnVjdG9yKHByb3RlY3RlZCBzYW1wbGU6IFQsIHByb3RlY3RlZCBpbnZlcnNlID0gZmFsc2UpIHt9XG5cbiAgcHJvdGVjdGVkIGdldE1hdGNoZXJDb250ZXh0KCk6IFN0YXRlIHtcbiAgICByZXR1cm4ge1xuICAgICAgZXF1YWxzLFxuICAgICAgaXNOb3Q6IHRoaXMuaW52ZXJzZSxcbiAgICAgIHV0aWxzOiBtYXRjaGVyVXRpbHMsXG4gICAgfSBhcyBhbnlcbiAgfVxuXG4gIGFic3RyYWN0IGFzeW1tZXRyaWNNYXRjaChvdGhlcjogdW5rbm93bik6IGJvb2xlYW5cbiAgYWJzdHJhY3QgdG9TdHJpbmcoKTogc3RyaW5nXG4gIGdldEV4cGVjdGVkVHlwZT8oKTogc3RyaW5nXG4gIHRvQXN5bW1ldHJpY01hdGNoZXI/KCk6IHN0cmluZ1xufVxuXG5leHBvcnQgY2xhc3MgU3RyaW5nQ29udGFpbmluZyBleHRlbmRzIEFzeW1tZXRyaWNNYXRjaGVyPHN0cmluZz4ge1xuICBjb25zdHJ1Y3RvcihzYW1wbGU6IHN0cmluZywgaW52ZXJzZSA9IGZhbHNlKSB7XG4gICAgaWYgKCFpc0EoJ1N0cmluZycsIHNhbXBsZSkpXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0V4cGVjdGVkIGlzIG5vdCBhIHN0cmluZycpXG5cbiAgICBzdXBlcihzYW1wbGUsIGludmVyc2UpXG4gIH1cblxuICBhc3ltbWV0cmljTWF0Y2gob3RoZXI6IHN0cmluZykge1xuICAgIGNvbnN0IHJlc3VsdCA9IGlzQSgnU3RyaW5nJywgb3RoZXIpICYmIG90aGVyLmluY2x1ZGVzKHRoaXMuc2FtcGxlKVxuXG4gICAgcmV0dXJuIHRoaXMuaW52ZXJzZSA/ICFyZXN1bHQgOiByZXN1bHRcbiAgfVxuXG4gIHRvU3RyaW5nKCkge1xuICAgIHJldHVybiBgU3RyaW5nJHt0aGlzLmludmVyc2UgPyAnTm90JyA6ICcnfUNvbnRhaW5pbmdgXG4gIH1cblxuICBnZXRFeHBlY3RlZFR5cGUoKSB7XG4gICAgcmV0dXJuICdzdHJpbmcnXG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIEFueXRoaW5nIGV4dGVuZHMgQXN5bW1ldHJpY01hdGNoZXI8dm9pZD4ge1xuICBhc3ltbWV0cmljTWF0Y2gob3RoZXI6IHVua25vd24pIHtcbiAgICByZXR1cm4gb3RoZXIgIT0gbnVsbFxuICB9XG5cbiAgdG9TdHJpbmcoKSB7XG4gICAgcmV0dXJuICdBbnl0aGluZydcbiAgfVxuXG4gIHRvQXN5bW1ldHJpY01hdGNoZXIoKSB7XG4gICAgcmV0dXJuICdBbnl0aGluZydcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgT2JqZWN0Q29udGFpbmluZyBleHRlbmRzIEFzeW1tZXRyaWNNYXRjaGVyPFJlY29yZDxzdHJpbmcsIHVua25vd24+PiB7XG4gIGNvbnN0cnVjdG9yKHNhbXBsZTogUmVjb3JkPHN0cmluZywgdW5rbm93bj4sIGludmVyc2UgPSBmYWxzZSkge1xuICAgIHN1cGVyKHNhbXBsZSwgaW52ZXJzZSlcbiAgfVxuXG4gIGdldFByb3RvdHlwZShvYmo6IG9iamVjdCkge1xuICAgIGlmIChPYmplY3QuZ2V0UHJvdG90eXBlT2YpXG4gICAgICByZXR1cm4gT2JqZWN0LmdldFByb3RvdHlwZU9mKG9iailcblxuICAgIGlmIChvYmouY29uc3RydWN0b3IucHJvdG90eXBlID09PSBvYmopXG4gICAgICByZXR1cm4gbnVsbFxuXG4gICAgcmV0dXJuIG9iai5jb25zdHJ1Y3Rvci5wcm90b3R5cGVcbiAgfVxuXG4gIGhhc1Byb3BlcnR5KG9iajogb2JqZWN0IHwgbnVsbCwgcHJvcGVydHk6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgIGlmICghb2JqKVxuICAgICAgcmV0dXJuIGZhbHNlXG5cbiAgICBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwgcHJvcGVydHkpKVxuICAgICAgcmV0dXJuIHRydWVcblxuICAgIHJldHVybiB0aGlzLmhhc1Byb3BlcnR5KHRoaXMuZ2V0UHJvdG90eXBlKG9iaiksIHByb3BlcnR5KVxuICB9XG5cbiAgYXN5bW1ldHJpY01hdGNoKG90aGVyOiBhbnkpIHtcbiAgICBpZiAodHlwZW9mIHRoaXMuc2FtcGxlICE9PSAnb2JqZWN0Jykge1xuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcbiAgICAgICAgYFlvdSBtdXN0IHByb3ZpZGUgYW4gb2JqZWN0IHRvICR7dGhpcy50b1N0cmluZygpfSwgbm90ICcke1xuICAgICAgICAgIHR5cGVvZiB0aGlzLnNhbXBsZVxuICAgICAgICB9Jy5gLFxuICAgICAgKVxuICAgIH1cblxuICAgIGxldCByZXN1bHQgPSB0cnVlXG5cbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tcmVzdHJpY3RlZC1zeW50YXhcbiAgICBmb3IgKGNvbnN0IHByb3BlcnR5IGluIHRoaXMuc2FtcGxlKSB7XG4gICAgICBpZiAoIXRoaXMuaGFzUHJvcGVydHkob3RoZXIsIHByb3BlcnR5KSB8fCAhZXF1YWxzKHRoaXMuc2FtcGxlW3Byb3BlcnR5XSwgb3RoZXJbcHJvcGVydHldKSkge1xuICAgICAgICByZXN1bHQgPSBmYWxzZVxuICAgICAgICBicmVha1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiB0aGlzLmludmVyc2UgPyAhcmVzdWx0IDogcmVzdWx0XG4gIH1cblxuICB0b1N0cmluZygpIHtcbiAgICByZXR1cm4gYE9iamVjdCR7dGhpcy5pbnZlcnNlID8gJ05vdCcgOiAnJ31Db250YWluaW5nYFxuICB9XG5cbiAgZ2V0RXhwZWN0ZWRUeXBlKCkge1xuICAgIHJldHVybiAnb2JqZWN0J1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBBcnJheUNvbnRhaW5pbmcgZXh0ZW5kcyBBc3ltbWV0cmljTWF0Y2hlcjxBcnJheTx1bmtub3duPj4ge1xuICBjb25zdHJ1Y3RvcihzYW1wbGU6IEFycmF5PHVua25vd24+LCBpbnZlcnNlID0gZmFsc2UpIHtcbiAgICBzdXBlcihzYW1wbGUsIGludmVyc2UpXG4gIH1cblxuICBhc3ltbWV0cmljTWF0Y2gob3RoZXI6IEFycmF5PHVua25vd24+KSB7XG4gICAgaWYgKCFBcnJheS5pc0FycmF5KHRoaXMuc2FtcGxlKSkge1xuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcbiAgICAgICAgYFlvdSBtdXN0IHByb3ZpZGUgYW4gYXJyYXkgdG8gJHt0aGlzLnRvU3RyaW5nKCl9LCBub3QgJyR7XG4gICAgICAgICAgdHlwZW9mIHRoaXMuc2FtcGxlXG4gICAgICAgIH0nLmAsXG4gICAgICApXG4gICAgfVxuXG4gICAgY29uc3QgcmVzdWx0XG4gICAgICA9IHRoaXMuc2FtcGxlLmxlbmd0aCA9PT0gMFxuICAgICAgfHwgKEFycmF5LmlzQXJyYXkob3RoZXIpXG4gICAgICAgICYmIHRoaXMuc2FtcGxlLmV2ZXJ5KGl0ZW0gPT5cbiAgICAgICAgICBvdGhlci5zb21lKGFub3RoZXIgPT4gZXF1YWxzKGl0ZW0sIGFub3RoZXIpKSxcbiAgICAgICAgKSlcblxuICAgIHJldHVybiB0aGlzLmludmVyc2UgPyAhcmVzdWx0IDogcmVzdWx0XG4gIH1cblxuICB0b1N0cmluZygpIHtcbiAgICByZXR1cm4gYEFycmF5JHt0aGlzLmludmVyc2UgPyAnTm90JyA6ICcnfUNvbnRhaW5pbmdgXG4gIH1cblxuICBnZXRFeHBlY3RlZFR5cGUoKSB7XG4gICAgcmV0dXJuICdhcnJheSdcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgQW55IGV4dGVuZHMgQXN5bW1ldHJpY01hdGNoZXI8YW55PiB7XG4gIGNvbnN0cnVjdG9yKHNhbXBsZTogdW5rbm93bikge1xuICAgIGlmICh0eXBlb2Ygc2FtcGxlID09PSAndW5kZWZpbmVkJykge1xuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcbiAgICAgICAgJ2FueSgpIGV4cGVjdHMgdG8gYmUgcGFzc2VkIGEgY29uc3RydWN0b3IgZnVuY3Rpb24uICdcbiAgICAgICAgICArICdQbGVhc2UgcGFzcyBvbmUgb3IgdXNlIGFueXRoaW5nKCkgdG8gbWF0Y2ggYW55IG9iamVjdC4nLFxuICAgICAgKVxuICAgIH1cbiAgICBzdXBlcihzYW1wbGUpXG4gIH1cblxuICBmbk5hbWVGb3IoZnVuYzogRnVuY3Rpb24pIHtcbiAgICBpZiAoZnVuYy5uYW1lKVxuICAgICAgcmV0dXJuIGZ1bmMubmFtZVxuXG4gICAgY29uc3QgZnVuY3Rpb25Ub1N0cmluZyA9IEZ1bmN0aW9uLnByb3RvdHlwZS50b1N0cmluZ1xuXG4gICAgY29uc3QgbWF0Y2hlcyA9IGZ1bmN0aW9uVG9TdHJpbmdcbiAgICAgIC5jYWxsKGZ1bmMpXG4gICAgICAubWF0Y2goL14oPzphc3luYyk/XFxzKmZ1bmN0aW9uXFxzKlxcKj9cXHMqKFtcXHckXSspXFxzKlxcKC8pXG4gICAgcmV0dXJuIG1hdGNoZXMgPyBtYXRjaGVzWzFdIDogJzxhbm9ueW1vdXM+J1xuICB9XG5cbiAgYXN5bW1ldHJpY01hdGNoKG90aGVyOiB1bmtub3duKSB7XG4gICAgaWYgKHRoaXMuc2FtcGxlID09PSBTdHJpbmcpXG4gICAgICByZXR1cm4gdHlwZW9mIG90aGVyID09ICdzdHJpbmcnIHx8IG90aGVyIGluc3RhbmNlb2YgU3RyaW5nXG5cbiAgICBpZiAodGhpcy5zYW1wbGUgPT09IE51bWJlcilcbiAgICAgIHJldHVybiB0eXBlb2Ygb3RoZXIgPT0gJ251bWJlcicgfHwgb3RoZXIgaW5zdGFuY2VvZiBOdW1iZXJcblxuICAgIGlmICh0aGlzLnNhbXBsZSA9PT0gRnVuY3Rpb24pXG4gICAgICByZXR1cm4gdHlwZW9mIG90aGVyID09ICdmdW5jdGlvbicgfHwgb3RoZXIgaW5zdGFuY2VvZiBGdW5jdGlvblxuXG4gICAgaWYgKHRoaXMuc2FtcGxlID09PSBCb29sZWFuKVxuICAgICAgcmV0dXJuIHR5cGVvZiBvdGhlciA9PSAnYm9vbGVhbicgfHwgb3RoZXIgaW5zdGFuY2VvZiBCb29sZWFuXG5cbiAgICBpZiAodGhpcy5zYW1wbGUgPT09IEJpZ0ludClcbiAgICAgIHJldHVybiB0eXBlb2Ygb3RoZXIgPT0gJ2JpZ2ludCcgfHwgb3RoZXIgaW5zdGFuY2VvZiBCaWdJbnRcblxuICAgIGlmICh0aGlzLnNhbXBsZSA9PT0gU3ltYm9sKVxuICAgICAgcmV0dXJuIHR5cGVvZiBvdGhlciA9PSAnc3ltYm9sJyB8fCBvdGhlciBpbnN0YW5jZW9mIFN5bWJvbFxuXG4gICAgaWYgKHRoaXMuc2FtcGxlID09PSBPYmplY3QpXG4gICAgICByZXR1cm4gdHlwZW9mIG90aGVyID09ICdvYmplY3QnXG5cbiAgICByZXR1cm4gb3RoZXIgaW5zdGFuY2VvZiB0aGlzLnNhbXBsZVxuICB9XG5cbiAgdG9TdHJpbmcoKSB7XG4gICAgcmV0dXJuICdBbnknXG4gIH1cblxuICBnZXRFeHBlY3RlZFR5cGUoKSB7XG4gICAgaWYgKHRoaXMuc2FtcGxlID09PSBTdHJpbmcpXG4gICAgICByZXR1cm4gJ3N0cmluZydcblxuICAgIGlmICh0aGlzLnNhbXBsZSA9PT0gTnVtYmVyKVxuICAgICAgcmV0dXJuICdudW1iZXInXG5cbiAgICBpZiAodGhpcy5zYW1wbGUgPT09IEZ1bmN0aW9uKVxuICAgICAgcmV0dXJuICdmdW5jdGlvbidcblxuICAgIGlmICh0aGlzLnNhbXBsZSA9PT0gT2JqZWN0KVxuICAgICAgcmV0dXJuICdvYmplY3QnXG5cbiAgICBpZiAodGhpcy5zYW1wbGUgPT09IEJvb2xlYW4pXG4gICAgICByZXR1cm4gJ2Jvb2xlYW4nXG5cbiAgICByZXR1cm4gdGhpcy5mbk5hbWVGb3IodGhpcy5zYW1wbGUpXG4gIH1cblxuICB0b0FzeW1tZXRyaWNNYXRjaGVyKCkge1xuICAgIHJldHVybiBgQW55PCR7dGhpcy5mbk5hbWVGb3IodGhpcy5zYW1wbGUpfT5gXG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIFN0cmluZ01hdGNoaW5nIGV4dGVuZHMgQXN5bW1ldHJpY01hdGNoZXI8UmVnRXhwPiB7XG4gIGNvbnN0cnVjdG9yKHNhbXBsZTogc3RyaW5nIHwgUmVnRXhwLCBpbnZlcnNlID0gZmFsc2UpIHtcbiAgICBpZiAoIWlzQSgnU3RyaW5nJywgc2FtcGxlKSAmJiAhaXNBKCdSZWdFeHAnLCBzYW1wbGUpKVxuICAgICAgdGhyb3cgbmV3IEVycm9yKCdFeHBlY3RlZCBpcyBub3QgYSBTdHJpbmcgb3IgYSBSZWdFeHAnKVxuXG4gICAgc3VwZXIobmV3IFJlZ0V4cChzYW1wbGUpLCBpbnZlcnNlKVxuICB9XG5cbiAgYXN5bW1ldHJpY01hdGNoKG90aGVyOiBzdHJpbmcpIHtcbiAgICBjb25zdCByZXN1bHQgPSBpc0EoJ1N0cmluZycsIG90aGVyKSAmJiB0aGlzLnNhbXBsZS50ZXN0KG90aGVyKVxuXG4gICAgcmV0dXJuIHRoaXMuaW52ZXJzZSA/ICFyZXN1bHQgOiByZXN1bHRcbiAgfVxuXG4gIHRvU3RyaW5nKCkge1xuICAgIHJldHVybiBgU3RyaW5nJHt0aGlzLmludmVyc2UgPyAnTm90JyA6ICcnfU1hdGNoaW5nYFxuICB9XG5cbiAgZ2V0RXhwZWN0ZWRUeXBlKCkge1xuICAgIHJldHVybiAnc3RyaW5nJ1xuICB9XG59XG5cbmV4cG9ydCBjb25zdCBKZXN0QXN5bW1ldHJpY01hdGNoZXJzOiBDaGFpUGx1Z2luID0gKGNoYWksIHV0aWxzKSA9PiB7XG4gIHV0aWxzLmFkZE1ldGhvZChcbiAgICBjaGFpLmV4cGVjdCxcbiAgICAnYW55dGhpbmcnLFxuICAgICgpID0+IG5ldyBBbnl0aGluZygpLFxuICApXG5cbiAgdXRpbHMuYWRkTWV0aG9kKFxuICAgIGNoYWkuZXhwZWN0LFxuICAgICdhbnknLFxuICAgIChleHBlY3RlZDogdW5rbm93bikgPT4gbmV3IEFueShleHBlY3RlZCksXG4gIClcblxuICB1dGlscy5hZGRNZXRob2QoXG4gICAgY2hhaS5leHBlY3QsXG4gICAgJ3N0cmluZ0NvbnRhaW5pbmcnLFxuICAgIChleHBlY3RlZDogc3RyaW5nKSA9PiBuZXcgU3RyaW5nQ29udGFpbmluZyhleHBlY3RlZCksXG4gIClcblxuICB1dGlscy5hZGRNZXRob2QoXG4gICAgY2hhaS5leHBlY3QsXG4gICAgJ29iamVjdENvbnRhaW5pbmcnLFxuICAgIChleHBlY3RlZDogYW55KSA9PiBuZXcgT2JqZWN0Q29udGFpbmluZyhleHBlY3RlZCksXG4gIClcblxuICB1dGlscy5hZGRNZXRob2QoXG4gICAgY2hhaS5leHBlY3QsXG4gICAgJ2FycmF5Q29udGFpbmluZycsXG4gICAgKGV4cGVjdGVkOiBhbnkpID0+IG5ldyBBcnJheUNvbnRhaW5pbmcoZXhwZWN0ZWQpLFxuICApXG5cbiAgdXRpbHMuYWRkTWV0aG9kKFxuICAgIGNoYWkuZXhwZWN0LFxuICAgICdzdHJpbmdNYXRjaGluZycsXG4gICAgKGV4cGVjdGVkOiBhbnkpID0+IG5ldyBTdHJpbmdNYXRjaGluZyhleHBlY3RlZCksXG4gIClcblxuICBjaGFpLmV4cGVjdC5ub3QgPSB7XG4gICAgc3RyaW5nQ29udGFpbmluZzogKGV4cGVjdGVkOiBzdHJpbmcpID0+IG5ldyBTdHJpbmdDb250YWluaW5nKGV4cGVjdGVkLCB0cnVlKSxcbiAgICBvYmplY3RDb250YWluaW5nOiAoZXhwZWN0ZWQ6IGFueSkgPT4gbmV3IE9iamVjdENvbnRhaW5pbmcoZXhwZWN0ZWQsIHRydWUpLFxuICAgIGFycmF5Q29udGFpbmluZzogKGV4cGVjdGVkOiB1bmtub3duW10pID0+IG5ldyBBcnJheUNvbnRhaW5pbmcoZXhwZWN0ZWQsIHRydWUpLFxuICAgIHN0cmluZ01hdGNoaW5nOiAoZXhwZWN0ZWQ6IHN0cmluZyB8IFJlZ0V4cCkgPT4gbmV3IFN0cmluZ01hdGNoaW5nKGV4cGVjdGVkLCB0cnVlKSxcbiAgfVxufVxuIiwiaW1wb3J0IGNoYWkgZnJvbSAnY2hhaSdcbmltcG9ydCBTdWJzZXQgZnJvbSAnY2hhaS1zdWJzZXQnXG5pbXBvcnQgeyBTbmFwc2hvdFBsdWdpbiB9IGZyb20gJy4uL3NuYXBzaG90L2NoYWknXG5pbXBvcnQgeyBKZXN0RXh0ZW5kIH0gZnJvbSAnLi9qZXN0LWV4dGVuZCdcbmltcG9ydCB7IEplc3RDaGFpRXhwZWN0IH0gZnJvbSAnLi9qZXN0LWV4cGVjdCdcbmltcG9ydCB7IEplc3RBc3ltbWV0cmljTWF0Y2hlcnMgfSBmcm9tICcuL2plc3QtYXN5bW1ldHJpYy1tYXRjaGVycydcblxubGV0IGluc3RhbGxlZCA9IGZhbHNlXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gc2V0dXBDaGFpKCkge1xuICBpZiAoaW5zdGFsbGVkKVxuICAgIHJldHVyblxuXG4gIGNoYWkudXNlKEplc3RFeHRlbmQpXG4gIGNoYWkudXNlKEplc3RDaGFpRXhwZWN0KVxuICBjaGFpLnVzZShTdWJzZXQpXG4gIGNoYWkudXNlKFNuYXBzaG90UGx1Z2luKVxuICBjaGFpLnVzZShKZXN0QXN5bW1ldHJpY01hdGNoZXJzKVxuICBpbnN0YWxsZWQgPSB0cnVlXG59XG4iLCJpbXBvcnQgeyBDb25zb2xlIH0gZnJvbSAnY29uc29sZSdcbmltcG9ydCB7IFdyaXRhYmxlIH0gZnJvbSAnc3RyZWFtJ1xuaW1wb3J0IHsgZW52aXJvbm1lbnRzIH0gZnJvbSAnLi4vaW50ZWdyYXRpb25zL2VudidcbmltcG9ydCB7IHNldHVwQ2hhaSB9IGZyb20gJy4uL2ludGVncmF0aW9ucy9jaGFpL3NldHVwJ1xuaW1wb3J0IHR5cGUgeyBSZXNvbHZlZENvbmZpZyB9IGZyb20gJy4uL3R5cGVzJ1xuaW1wb3J0IHsgdG9BcnJheSB9IGZyb20gJy4uL3V0aWxzJ1xuaW1wb3J0IHsgcnBjIH0gZnJvbSAnLi9ycGMnXG5cbmxldCBnbG9iYWxTZXR1cCA9IGZhbHNlXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gc2V0dXBHbG9iYWxFbnYoY29uZmlnOiBSZXNvbHZlZENvbmZpZykge1xuICBpZiAoZ2xvYmFsU2V0dXApXG4gICAgcmV0dXJuXG5cbiAgZ2xvYmFsU2V0dXAgPSB0cnVlXG5cbiAgc2V0dXBDb25zb2xlTG9nU3B5KClcbiAgYXdhaXQgc2V0dXBDaGFpKClcblxuICBpZiAoY29uZmlnLmdsb2JhbClcbiAgICAoYXdhaXQgaW1wb3J0KCcuLi9pbnRlZ3JhdGlvbnMvZ2xvYmFsJykpLnJlZ2lzdGVyQXBpR2xvYmFsbHkoKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gc2V0dXBDb25zb2xlTG9nU3B5KCkge1xuICBjb25zdCBzdGRvdXQgPSBuZXcgV3JpdGFibGUoe1xuICAgIHdyaXRlKGRhdGEsIGVuY29kaW5nLCBjYWxsYmFjaykge1xuICAgICAgcnBjKCkub25Vc2VyQ29uc29sZUxvZyh7XG4gICAgICAgIHR5cGU6ICdzdGRvdXQnLFxuICAgICAgICBjb250ZW50OiBTdHJpbmcoZGF0YSksXG4gICAgICAgIHRhc2tJZDogcHJvY2Vzcy5fX3ZpdGVzdF93b3JrZXJfXy5jdXJyZW50Py5pZCxcbiAgICAgICAgdGltZTogRGF0ZS5ub3coKSxcbiAgICAgIH0pXG4gICAgICBjYWxsYmFjaygpXG4gICAgfSxcbiAgfSlcbiAgY29uc3Qgc3RkZXJyID0gbmV3IFdyaXRhYmxlKHtcbiAgICB3cml0ZShkYXRhLCBlbmNvZGluZywgY2FsbGJhY2spIHtcbiAgICAgIHJwYygpLm9uVXNlckNvbnNvbGVMb2coe1xuICAgICAgICB0eXBlOiAnc3RkZXJyJyxcbiAgICAgICAgY29udGVudDogU3RyaW5nKGRhdGEpLFxuICAgICAgICB0YXNrSWQ6IHByb2Nlc3MuX192aXRlc3Rfd29ya2VyX18uY3VycmVudD8uaWQsXG4gICAgICAgIHRpbWU6IERhdGUubm93KCksXG4gICAgICB9KVxuICAgICAgY2FsbGJhY2soKVxuICAgIH0sXG4gIH0pXG4gIGdsb2JhbFRoaXMuY29uc29sZSA9IG5ldyBDb25zb2xlKHtcbiAgICBzdGRvdXQsXG4gICAgc3RkZXJyLFxuICAgIGNvbG9yTW9kZTogdHJ1ZSxcbiAgICBncm91cEluZGVudGF0aW9uOiAyLFxuICB9KVxufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gd2l0aEVudihcbiAgbmFtZTogUmVzb2x2ZWRDb25maWdbJ2Vudmlyb25tZW50J10sXG4gIG9wdGlvbnM6IFJlc29sdmVkQ29uZmlnWydlbnZpcm9ubWVudE9wdGlvbnMnXSxcbiAgZm46ICgpID0+IFByb21pc2U8dm9pZD4sXG4pIHtcbiAgY29uc3QgZW52ID0gYXdhaXQgZW52aXJvbm1lbnRzW25hbWVdLnNldHVwKGdsb2JhbFRoaXMsIG9wdGlvbnMpXG4gIHRyeSB7XG4gICAgYXdhaXQgZm4oKVxuICB9XG4gIGZpbmFsbHkge1xuICAgIGF3YWl0IGVudi50ZWFyZG93bihnbG9iYWxUaGlzKVxuICB9XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBydW5TZXR1cEZpbGVzKGNvbmZpZzogUmVzb2x2ZWRDb25maWcpIHtcbiAgY29uc3QgZmlsZXMgPSB0b0FycmF5KGNvbmZpZy5zZXR1cEZpbGVzKVxuICBhd2FpdCBQcm9taXNlLmFsbChcbiAgICBmaWxlcy5tYXAoYXN5bmMoZmlsZSkgPT4ge1xuICAgICAgcHJvY2Vzcy5fX3ZpdGVzdF93b3JrZXJfXy5tb2R1bGVDYWNoZS5kZWxldGUoZmlsZSlcbiAgICAgIGF3YWl0IGltcG9ydChmaWxlKVxuICAgIH0pLFxuICApXG59XG4iLCJpbXBvcnQgeyBmb3JtYXQgfSBmcm9tICd1dGlsJ1xuaW1wb3J0IHsgc3RyaW5naWZ5IH0gZnJvbSAnLi4vaW50ZWdyYXRpb25zL2NoYWkvamVzdC1tYXRjaGVyLXV0aWxzJ1xuXG5jb25zdCBPQkpFQ1RfUFJPVE8gPSBPYmplY3QuZ2V0UHJvdG90eXBlT2Yoe30pXG5cbi8vIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0FQSS9XZWJfV29ya2Vyc19BUEkvU3RydWN0dXJlZF9jbG9uZV9hbGdvcml0aG1cbmV4cG9ydCBmdW5jdGlvbiBzZXJpYWxpemVFcnJvcih2YWw6IGFueSwgc2VlbiA9IG5ldyBXZWFrTWFwKCkpOiBhbnkge1xuICBpZiAoIXZhbCB8fCB0eXBlb2YgdmFsID09PSAnc3RyaW5nJylcbiAgICByZXR1cm4gdmFsXG4gIGlmICh0eXBlb2YgdmFsID09PSAnZnVuY3Rpb24nKVxuICAgIHJldHVybiBgRnVuY3Rpb248JHt2YWwubmFtZX0+YFxuICBpZiAodHlwZW9mIHZhbCAhPT0gJ29iamVjdCcpXG4gICAgcmV0dXJuIHZhbFxuICBpZiAodmFsIGluc3RhbmNlb2YgUHJvbWlzZSB8fCAndGhlbicgaW4gdmFsIHx8ICh2YWwuY29uc3RydWN0b3IgJiYgdmFsLmNvbnN0cnVjdG9yLnByb3RvdHlwZSA9PT0gJ0FzeW5jRnVuY3Rpb24nKSlcbiAgICByZXR1cm4gJ1Byb21pc2UnXG4gIGlmICh0eXBlb2YgRWxlbWVudCAhPT0gJ3VuZGVmaW5lZCcgJiYgdmFsIGluc3RhbmNlb2YgRWxlbWVudClcbiAgICByZXR1cm4gdmFsLnRhZ05hbWVcbiAgaWYgKHR5cGVvZiB2YWwuYXN5bW1ldHJpY01hdGNoID09PSAnZnVuY3Rpb24nKVxuICAgIHJldHVybiBgJHt2YWwudG9TdHJpbmcoKX0gJHtmb3JtYXQodmFsLnNhbXBsZSl9YFxuXG4gIGlmIChzZWVuLmhhcyh2YWwpKVxuICAgIHJldHVybiBzZWVuLmdldCh2YWwpXG5cbiAgaWYgKEFycmF5LmlzQXJyYXkodmFsKSkge1xuICAgIGNvbnN0IGNsb25lOiBhbnlbXSA9IG5ldyBBcnJheSh2YWwubGVuZ3RoKVxuICAgIHNlZW4uc2V0KHZhbCwgY2xvbmUpXG4gICAgdmFsLmZvckVhY2goKGUsIGkpID0+IHtcbiAgICAgIGNsb25lW2ldID0gc2VyaWFsaXplRXJyb3IoZSwgc2VlbilcbiAgICB9KVxuICAgIHJldHVybiBjbG9uZVxuICB9XG4gIGVsc2Uge1xuICAgIC8vIE9iamVjdHMgd2l0aCBgRXJyb3JgIGNvbnN0cnVjdG9ycyBhcHBlYXIgdG8gY2F1c2UgcHJvYmxlbXMgZHVyaW5nIHdvcmtlciBjb21tdW5pY2F0aW9uXG4gICAgLy8gdXNpbmcgYE1lc3NhZ2VQb3J0YCwgc28gdGhlIHNlcmlhbGl6ZWQgZXJyb3Igb2JqZWN0IGlzIGJlaW5nIHJlY3JlYXRlZCBhcyBwbGFpbiBvYmplY3QuXG4gICAgY29uc3QgY2xvbmUgPSBPYmplY3QuY3JlYXRlKG51bGwpXG4gICAgc2Vlbi5zZXQodmFsLCBjbG9uZSlcblxuICAgIGxldCBvYmogPSB2YWxcbiAgICB3aGlsZSAob2JqICYmIG9iaiAhPT0gT0JKRUNUX1BST1RPKSB7XG4gICAgICBPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyhvYmopLmZvckVhY2goKGtleSkgPT4ge1xuICAgICAgICBpZiAoIShrZXkgaW4gY2xvbmUpKVxuICAgICAgICAgIGNsb25lW2tleV0gPSBzZXJpYWxpemVFcnJvcihvYmpba2V5XSwgc2VlbilcbiAgICAgIH0pXG4gICAgICBvYmogPSBPYmplY3QuZ2V0UHJvdG90eXBlT2Yob2JqKVxuICAgIH1cbiAgICByZXR1cm4gY2xvbmVcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gcHJvY2Vzc0Vycm9yKGVycjogYW55KSB7XG4gIGlmICghZXJyKVxuICAgIHJldHVybiBlcnJcbiAgLy8gc3RhY2sgaXMgbm90IHNlcmlhbGl6ZWQgaW4gd29ya2VyIGNvbW11bmljYXRpb25cbiAgLy8gd2Ugc3RyaW5naWZ5IGl0IGZpcnN0XG4gIGlmIChlcnIuc3RhY2spXG4gICAgZXJyLnN0YWNrU3RyID0gU3RyaW5nKGVyci5zdGFjaylcbiAgaWYgKGVyci5uYW1lKVxuICAgIGVyci5uYW1lU3RyID0gU3RyaW5nKGVyci5uYW1lKVxuXG4gIGlmICh0eXBlb2YgZXJyLmV4cGVjdGVkICE9PSAnc3RyaW5nJylcbiAgICBlcnIuZXhwZWN0ZWQgPSBzdHJpbmdpZnkoZXJyLmV4cGVjdGVkKVxuICBpZiAodHlwZW9mIGVyci5hY3R1YWwgIT09ICdzdHJpbmcnKVxuICAgIGVyci5hY3R1YWwgPSBzdHJpbmdpZnkoZXJyLmFjdHVhbClcblxuICByZXR1cm4gc2VyaWFsaXplRXJyb3IoZXJyKVxufVxuIiwiaW1wb3J0IHsgY3JlYXRlSGFzaCB9IGZyb20gJ2NyeXB0bydcbmltcG9ydCB7IHJlbGF0aXZlIH0gZnJvbSAncGF0aGUnXG5pbXBvcnQgdHlwZSB7IEZpbGUsIFJlc29sdmVkQ29uZmlnLCBTdWl0ZSB9IGZyb20gJy4uL3R5cGVzJ1xuaW1wb3J0IHsgY2xlYXJDb250ZXh0LCBkZWZhdWx0U3VpdGUgfSBmcm9tICcuL3N1aXRlJ1xuaW1wb3J0IHsgZ2V0SG9va3MsIHNldEhvb2tzIH0gZnJvbSAnLi9tYXAnXG5pbXBvcnQgeyBwcm9jZXNzRXJyb3IgfSBmcm9tICcuL2Vycm9yJ1xuaW1wb3J0IHsgY29udGV4dCB9IGZyb20gJy4vY29udGV4dCdcbmltcG9ydCB7IHJ1blNldHVwRmlsZXMgfSBmcm9tICcuL3NldHVwJ1xuXG5mdW5jdGlvbiBoYXNoKHN0cjogc3RyaW5nLCBsZW5ndGggPSAxMCkge1xuICByZXR1cm4gY3JlYXRlSGFzaCgnbWQ1JylcbiAgICAudXBkYXRlKHN0cilcbiAgICAuZGlnZXN0KCdoZXgnKVxuICAgIC5zbGljZSgwLCBsZW5ndGgpXG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBjb2xsZWN0VGVzdHMocGF0aHM6IHN0cmluZ1tdLCBjb25maWc6IFJlc29sdmVkQ29uZmlnKSB7XG4gIGNvbnN0IGZpbGVzOiBGaWxlW10gPSBbXVxuXG4gIGZvciAoY29uc3QgZmlsZXBhdGggb2YgcGF0aHMpIHtcbiAgICBjb25zdCBwYXRoID0gcmVsYXRpdmUoY29uZmlnLnJvb3QsIGZpbGVwYXRoKVxuICAgIGNvbnN0IGZpbGU6IEZpbGUgPSB7XG4gICAgICBpZDogaGFzaChwYXRoKSxcbiAgICAgIG5hbWU6IHBhdGgsXG4gICAgICB0eXBlOiAnc3VpdGUnLFxuICAgICAgbW9kZTogJ3J1bicsXG4gICAgICBmaWxlcGF0aCxcbiAgICAgIHRhc2tzOiBbXSxcbiAgICB9XG5cbiAgICBjbGVhckNvbnRleHQoKVxuICAgIHRyeSB7XG4gICAgICBhd2FpdCBydW5TZXR1cEZpbGVzKGNvbmZpZylcbiAgICAgIGF3YWl0IGltcG9ydChmaWxlcGF0aClcblxuICAgICAgY29uc3QgZGVmYXVsdFRhc2tzID0gYXdhaXQgZGVmYXVsdFN1aXRlLmNvbGxlY3QoZmlsZSlcblxuICAgICAgc2V0SG9va3MoZmlsZSwgZ2V0SG9va3MoZGVmYXVsdFRhc2tzKSlcblxuICAgICAgZm9yIChjb25zdCBjIG9mIFsuLi5kZWZhdWx0VGFza3MudGFza3MsIC4uLmNvbnRleHQudGFza3NdKSB7XG4gICAgICAgIGlmIChjLnR5cGUgPT09ICd0ZXN0Jykge1xuICAgICAgICAgIGZpbGUudGFza3MucHVzaChjKVxuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKGMudHlwZSA9PT0gJ3N1aXRlJykge1xuICAgICAgICAgIGZpbGUudGFza3MucHVzaChjKVxuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgIGNvbnN0IHN0YXJ0ID0gcGVyZm9ybWFuY2Uubm93KClcbiAgICAgICAgICBjb25zdCBzdWl0ZSA9IGF3YWl0IGMuY29sbGVjdChmaWxlKVxuICAgICAgICAgIGZpbGUuY29sbGVjdER1cmF0aW9uID0gcGVyZm9ybWFuY2Uubm93KCkgLSBzdGFydFxuICAgICAgICAgIGlmIChzdWl0ZS5uYW1lIHx8IHN1aXRlLnRhc2tzLmxlbmd0aClcbiAgICAgICAgICAgIGZpbGUudGFza3MucHVzaChzdWl0ZSlcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICBjYXRjaCAoZSkge1xuICAgICAgZmlsZS5yZXN1bHQgPSB7XG4gICAgICAgIHN0YXRlOiAnZmFpbCcsXG4gICAgICAgIGVycm9yOiBwcm9jZXNzRXJyb3IoZSksXG4gICAgICB9XG4gICAgICAvLyBub3Qgc3VyZSB0aHksIHRoaXMgdGhpcyBsaW5lIGlzIG5lZWRlZCB0byB0cmlnZ2VyIHRoZSBlcnJvclxuICAgICAgcHJvY2Vzcy5zdGRvdXQud3JpdGUoJ1xcMCcpXG4gICAgfVxuXG4gICAgY2FsY3VsYXRlSGFzaChmaWxlKVxuXG4gICAgaW50ZXJwcmV0VGFza01vZGVzKGZpbGUsIGNvbmZpZy50ZXN0TmFtZVBhdHRlcm4pXG5cbiAgICBmaWxlcy5wdXNoKGZpbGUpXG4gIH1cblxuICByZXR1cm4gZmlsZXNcbn1cblxuLyoqXG4gKiBJZiBhbnkgdGFza3MgYmVlbiBtYXJrZWQgYXMgYG9ubHlgLCBtYXJrIGFsbCBvdGhlciB0YXNrcyBhcyBgc2tpcGAuXG4gKi9cbmZ1bmN0aW9uIGludGVycHJldFRhc2tNb2RlcyhzdWl0ZTogU3VpdGUsIG5hbWVQYXR0ZXJuPzogc3RyaW5nIHwgUmVnRXhwLCBvbmx5TW9kZT86IGJvb2xlYW4pIHtcbiAgaWYgKG9ubHlNb2RlID09PSB1bmRlZmluZWQpXG4gICAgb25seU1vZGUgPSBzb21lVGFza3NBcmVPbmx5KHN1aXRlKVxuXG4gIHN1aXRlLnRhc2tzLmZvckVhY2goKHQpID0+IHtcbiAgICBpZiAob25seU1vZGUpIHtcbiAgICAgIGlmICh0LnR5cGUgPT09ICdzdWl0ZScgJiYgc29tZVRhc2tzQXJlT25seSh0KSkge1xuICAgICAgICAvLyBEb24ndCBza2lwIHRoaXMgc3VpdGVcbiAgICAgICAgaWYgKHQubW9kZSA9PT0gJ29ubHknKVxuICAgICAgICAgIHQubW9kZSA9ICdydW4nXG4gICAgICAgIGludGVycHJldFRhc2tNb2Rlcyh0LCBuYW1lUGF0dGVybiwgb25seU1vZGUpXG4gICAgICB9XG4gICAgICBlbHNlIGlmICh0Lm1vZGUgPT09ICdydW4nKSB7IHQubW9kZSA9ICdza2lwJyB9XG4gICAgICBlbHNlIGlmICh0Lm1vZGUgPT09ICdvbmx5JykgeyB0Lm1vZGUgPSAncnVuJyB9XG4gICAgfVxuICAgIGlmICh0LnR5cGUgPT09ICd0ZXN0Jykge1xuICAgICAgaWYgKG5hbWVQYXR0ZXJuICYmICF0Lm5hbWUubWF0Y2gobmFtZVBhdHRlcm4pKVxuICAgICAgICB0Lm1vZGUgPSAnc2tpcCdcbiAgICB9XG4gICAgZWxzZSBpZiAodC50eXBlID09PSAnc3VpdGUnKSB7XG4gICAgICBpZiAodC5tb2RlID09PSAnc2tpcCcpXG4gICAgICAgIHNraXBBbGxUYXNrcyh0KVxuXG4gICAgICAvLyBpZiBhbGwgc3VidGFza3MgYXJlIHNraXBwZWQsIG1hcmtlZCBhcyBza2lwXG4gICAgICBpZiAodC5tb2RlID09PSAncnVuJykge1xuICAgICAgICBpZiAodC50YXNrcy5ldmVyeShpID0+IGkubW9kZSAhPT0gJ3J1bicpKVxuICAgICAgICAgIHQubW9kZSA9ICdza2lwJ1xuICAgICAgfVxuICAgIH1cbiAgfSlcbn1cblxuZnVuY3Rpb24gc29tZVRhc2tzQXJlT25seShzdWl0ZTogU3VpdGUpOiBib29sZWFuIHtcbiAgcmV0dXJuIHN1aXRlLnRhc2tzLnNvbWUodCA9PiB0Lm1vZGUgPT09ICdvbmx5JyB8fCAodC50eXBlID09PSAnc3VpdGUnICYmIHNvbWVUYXNrc0FyZU9ubHkodCkpKVxufVxuXG5mdW5jdGlvbiBza2lwQWxsVGFza3Moc3VpdGU6IFN1aXRlKSB7XG4gIHN1aXRlLnRhc2tzLmZvckVhY2goKHQpID0+IHtcbiAgICBpZiAodC5tb2RlID09PSAncnVuJykge1xuICAgICAgdC5tb2RlID0gJ3NraXAnXG4gICAgICBpZiAodC50eXBlID09PSAnc3VpdGUnKVxuICAgICAgICBza2lwQWxsVGFza3ModClcbiAgICB9XG4gIH0pXG59XG5cbmZ1bmN0aW9uIGNhbGN1bGF0ZUhhc2gocGFyZW50OiBTdWl0ZSkge1xuICBwYXJlbnQudGFza3MuZm9yRWFjaCgodCwgaWR4KSA9PiB7XG4gICAgdC5pZCA9IGAke3BhcmVudC5pZH1fJHtpZHh9YFxuICAgIGlmICh0LnR5cGUgPT09ICdzdWl0ZScpXG4gICAgICBjYWxjdWxhdGVIYXNoKHQpXG4gIH0pXG59XG4iLCJpbXBvcnQgeyBwZXJmb3JtYW5jZSB9IGZyb20gJ3BlcmZfaG9va3MnXG5pbXBvcnQgdHlwZSB7IEhvb2tMaXN0ZW5lciwgUmVzb2x2ZWRDb25maWcsIFN1aXRlLCBTdWl0ZUhvb2tzLCBUYXNrLCBUYXNrUmVzdWx0LCBUZXN0IH0gZnJvbSAnLi4vdHlwZXMnXG5pbXBvcnQgeyB2aSB9IGZyb20gJy4uL2ludGVncmF0aW9ucy92aSdcbmltcG9ydCB7IGdldFNuYXBzaG90Q2xpZW50IH0gZnJvbSAnLi4vaW50ZWdyYXRpb25zL3NuYXBzaG90L2NoYWknXG5pbXBvcnQgeyBnZXRGdWxsTmFtZSwgaGFzRmFpbGVkLCBoYXNUZXN0cywgcGFydGl0aW9uU3VpdGVDaGlsZHJlbiB9IGZyb20gJy4uL3V0aWxzJ1xuaW1wb3J0IHsgZ2V0U3RhdGUsIHNldFN0YXRlIH0gZnJvbSAnLi4vaW50ZWdyYXRpb25zL2NoYWkvamVzdC1leHBlY3QnXG5pbXBvcnQgeyBnZXRGbiwgZ2V0SG9va3MgfSBmcm9tICcuL21hcCdcbmltcG9ydCB7IHJwYyB9IGZyb20gJy4vcnBjJ1xuaW1wb3J0IHsgY29sbGVjdFRlc3RzIH0gZnJvbSAnLi9jb2xsZWN0J1xuaW1wb3J0IHsgcHJvY2Vzc0Vycm9yIH0gZnJvbSAnLi9lcnJvcidcblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGNhbGxTdWl0ZUhvb2s8VCBleHRlbmRzIGtleW9mIFN1aXRlSG9va3M+KHN1aXRlOiBTdWl0ZSwgbmFtZTogVCwgYXJnczogU3VpdGVIb29rc1tUXVswXSBleHRlbmRzIEhvb2tMaXN0ZW5lcjxpbmZlciBBPiA/IEEgOiBuZXZlcikge1xuICBpZiAobmFtZSA9PT0gJ2JlZm9yZUVhY2gnICYmIHN1aXRlLnN1aXRlKVxuICAgIGF3YWl0IGNhbGxTdWl0ZUhvb2soc3VpdGUuc3VpdGUsIG5hbWUsIGFyZ3MpXG5cbiAgYXdhaXQgUHJvbWlzZS5hbGwoZ2V0SG9va3Moc3VpdGUpW25hbWVdLm1hcChmbiA9PiBmbiguLi4oYXJncyBhcyBhbnkpKSkpXG5cbiAgaWYgKG5hbWUgPT09ICdhZnRlckVhY2gnICYmIHN1aXRlLnN1aXRlKVxuICAgIGF3YWl0IGNhbGxTdWl0ZUhvb2soc3VpdGUuc3VpdGUsIG5hbWUsIGFyZ3MpXG59XG5cbmNvbnN0IHBhY2tzID0gbmV3IE1hcDxzdHJpbmcsIFRhc2tSZXN1bHR8dW5kZWZpbmVkPigpXG5sZXQgdXBkYXRlVGltZXI6IGFueVxubGV0IHByZXZpb3VzVXBkYXRlOiBQcm9taXNlPHZvaWQ+fHVuZGVmaW5lZFxuXG5mdW5jdGlvbiB1cGRhdGVUYXNrKHRhc2s6IFRhc2spIHtcbiAgcGFja3Muc2V0KHRhc2suaWQsIHRhc2sucmVzdWx0KVxuXG4gIGNsZWFyVGltZW91dCh1cGRhdGVUaW1lcilcbiAgdXBkYXRlVGltZXIgPSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICBwcmV2aW91c1VwZGF0ZSA9IHNlbmRUYXNrc1VwZGF0ZSgpXG4gIH0sIDEwKVxufVxuXG5hc3luYyBmdW5jdGlvbiBzZW5kVGFza3NVcGRhdGUoKSB7XG4gIGNsZWFyVGltZW91dCh1cGRhdGVUaW1lcilcbiAgYXdhaXQgcHJldmlvdXNVcGRhdGVcblxuICBpZiAocGFja3Muc2l6ZSkge1xuICAgIGNvbnN0IHAgPSBycGMoKS5vblRhc2tVcGRhdGUoQXJyYXkuZnJvbShwYWNrcykpXG4gICAgcGFja3MuY2xlYXIoKVxuICAgIHJldHVybiBwXG4gIH1cbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHJ1blRlc3QodGVzdDogVGVzdCkge1xuICBpZiAodGVzdC5tb2RlICE9PSAncnVuJylcbiAgICByZXR1cm5cblxuICBjb25zdCBzdGFydCA9IHBlcmZvcm1hbmNlLm5vdygpXG5cbiAgdGVzdC5yZXN1bHQgPSB7XG4gICAgc3RhdGU6ICdydW4nLFxuICB9XG4gIHVwZGF0ZVRhc2sodGVzdClcblxuICBjbGVhck1vZHVsZU1vY2tzKClcblxuICBnZXRTbmFwc2hvdENsaWVudCgpLnNldFRlc3QodGVzdClcblxuICBwcm9jZXNzLl9fdml0ZXN0X3dvcmtlcl9fLmN1cnJlbnQgPSB0ZXN0XG5cbiAgdHJ5IHtcbiAgICBhd2FpdCBjYWxsU3VpdGVIb29rKHRlc3Quc3VpdGUsICdiZWZvcmVFYWNoJywgW3Rlc3QsIHRlc3Quc3VpdGVdKVxuICAgIHNldFN0YXRlKHtcbiAgICAgIGFzc2VydGlvbkNhbGxzOiAwLFxuICAgICAgaXNFeHBlY3RpbmdBc3NlcnRpb25zOiBmYWxzZSxcbiAgICAgIGlzRXhwZWN0aW5nQXNzZXJ0aW9uc0Vycm9yOiBudWxsLFxuICAgICAgZXhwZWN0ZWRBc3NlcnRpb25zTnVtYmVyOiBudWxsLFxuICAgICAgZXhwZWN0ZWRBc3NlcnRpb25zTnVtYmVyRXJyb3I6IG51bGwsXG4gICAgICB0ZXN0UGF0aDogdGVzdC5zdWl0ZS5maWxlPy5maWxlcGF0aCxcbiAgICAgIGN1cnJlbnRUZXN0TmFtZTogZ2V0RnVsbE5hbWUodGVzdCksXG4gICAgfSlcbiAgICBhd2FpdCBnZXRGbih0ZXN0KSgpXG4gICAgY29uc3QgeyBhc3NlcnRpb25DYWxscywgZXhwZWN0ZWRBc3NlcnRpb25zTnVtYmVyLCBleHBlY3RlZEFzc2VydGlvbnNOdW1iZXJFcnJvciwgaXNFeHBlY3RpbmdBc3NlcnRpb25zLCBpc0V4cGVjdGluZ0Fzc2VydGlvbnNFcnJvciB9ID0gZ2V0U3RhdGUoKVxuICAgIGlmIChleHBlY3RlZEFzc2VydGlvbnNOdW1iZXIgIT09IG51bGwgJiYgYXNzZXJ0aW9uQ2FsbHMgIT09IGV4cGVjdGVkQXNzZXJ0aW9uc051bWJlcilcbiAgICAgIHRocm93IGV4cGVjdGVkQXNzZXJ0aW9uc051bWJlckVycm9yXG4gICAgaWYgKGlzRXhwZWN0aW5nQXNzZXJ0aW9ucyA9PT0gdHJ1ZSAmJiBhc3NlcnRpb25DYWxscyA9PT0gMClcbiAgICAgIHRocm93IGlzRXhwZWN0aW5nQXNzZXJ0aW9uc0Vycm9yXG5cbiAgICB0ZXN0LnJlc3VsdC5zdGF0ZSA9ICdwYXNzJ1xuICB9XG4gIGNhdGNoIChlKSB7XG4gICAgdGVzdC5yZXN1bHQuc3RhdGUgPSAnZmFpbCdcbiAgICB0ZXN0LnJlc3VsdC5lcnJvciA9IHByb2Nlc3NFcnJvcihlKVxuICB9XG5cbiAgdHJ5IHtcbiAgICBhd2FpdCBjYWxsU3VpdGVIb29rKHRlc3Quc3VpdGUsICdhZnRlckVhY2gnLCBbdGVzdCwgdGVzdC5zdWl0ZV0pXG4gIH1cbiAgY2F0Y2ggKGUpIHtcbiAgICB0ZXN0LnJlc3VsdC5zdGF0ZSA9ICdmYWlsJ1xuICAgIHRlc3QucmVzdWx0LmVycm9yID0gcHJvY2Vzc0Vycm9yKGUpXG4gIH1cblxuICAvLyBpZiB0ZXN0IGlzIG1hcmtlZCB0byBiZSBmYWlsZWQsIGZsaXAgdGhlIHJlc3VsdFxuICBpZiAodGVzdC5mYWlscykge1xuICAgIGlmICh0ZXN0LnJlc3VsdC5zdGF0ZSA9PT0gJ3Bhc3MnKSB7XG4gICAgICB0ZXN0LnJlc3VsdC5zdGF0ZSA9ICdmYWlsJ1xuICAgICAgdGVzdC5yZXN1bHQuZXJyb3IgPSBwcm9jZXNzRXJyb3IobmV3IEVycm9yKCdFeHBlY3QgdGVzdCB0byBmYWlsJykpXG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgdGVzdC5yZXN1bHQuc3RhdGUgPSAncGFzcydcbiAgICAgIHRlc3QucmVzdWx0LmVycm9yID0gdW5kZWZpbmVkXG4gICAgfVxuICB9XG5cbiAgZ2V0U25hcHNob3RDbGllbnQoKS5jbGVhclRlc3QoKVxuXG4gIHRlc3QucmVzdWx0LmR1cmF0aW9uID0gcGVyZm9ybWFuY2Uubm93KCkgLSBzdGFydFxuXG4gIHByb2Nlc3MuX192aXRlc3Rfd29ya2VyX18uY3VycmVudCA9IHVuZGVmaW5lZFxuXG4gIHVwZGF0ZVRhc2sodGVzdClcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHJ1blN1aXRlKHN1aXRlOiBTdWl0ZSkge1xuICBpZiAoc3VpdGUucmVzdWx0Py5zdGF0ZSA9PT0gJ2ZhaWwnKVxuICAgIHJldHVyblxuXG4gIGNvbnN0IHN0YXJ0ID0gcGVyZm9ybWFuY2Uubm93KClcblxuICBzdWl0ZS5yZXN1bHQgPSB7XG4gICAgc3RhdGU6ICdydW4nLFxuICB9XG5cbiAgdXBkYXRlVGFzayhzdWl0ZSlcblxuICBpZiAoc3VpdGUubW9kZSA9PT0gJ3NraXAnKSB7XG4gICAgc3VpdGUucmVzdWx0LnN0YXRlID0gJ3NraXAnXG4gIH1cbiAgZWxzZSBpZiAoc3VpdGUubW9kZSA9PT0gJ3RvZG8nKSB7XG4gICAgc3VpdGUucmVzdWx0LnN0YXRlID0gJ3RvZG8nXG4gIH1cbiAgZWxzZSB7XG4gICAgdHJ5IHtcbiAgICAgIGF3YWl0IGNhbGxTdWl0ZUhvb2soc3VpdGUsICdiZWZvcmVBbGwnLCBbc3VpdGVdKVxuXG4gICAgICBmb3IgKGNvbnN0IHRhc2tzR3JvdXAgb2YgcGFydGl0aW9uU3VpdGVDaGlsZHJlbihzdWl0ZSkpIHtcbiAgICAgICAgaWYgKHRhc2tzR3JvdXBbMF0uY29uY3VycmVudCA9PT0gdHJ1ZSkge1xuICAgICAgICAgIGF3YWl0IFByb21pc2UuYWxsKHRhc2tzR3JvdXAubWFwKGMgPT4gcnVuU3VpdGVDaGlsZChjKSkpXG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgZm9yIChjb25zdCBjIG9mIHRhc2tzR3JvdXApXG4gICAgICAgICAgICBhd2FpdCBydW5TdWl0ZUNoaWxkKGMpXG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgYXdhaXQgY2FsbFN1aXRlSG9vayhzdWl0ZSwgJ2FmdGVyQWxsJywgW3N1aXRlXSlcbiAgICB9XG4gICAgY2F0Y2ggKGUpIHtcbiAgICAgIHN1aXRlLnJlc3VsdC5zdGF0ZSA9ICdmYWlsJ1xuICAgICAgc3VpdGUucmVzdWx0LmVycm9yID0gcHJvY2Vzc0Vycm9yKGUpXG4gICAgfVxuICB9XG4gIHN1aXRlLnJlc3VsdC5kdXJhdGlvbiA9IHBlcmZvcm1hbmNlLm5vdygpIC0gc3RhcnRcblxuICBpZiAoc3VpdGUubW9kZSA9PT0gJ3J1bicpIHtcbiAgICBpZiAoIWhhc1Rlc3RzKHN1aXRlKSkge1xuICAgICAgc3VpdGUucmVzdWx0LnN0YXRlID0gJ2ZhaWwnXG4gICAgICBpZiAoIXN1aXRlLnJlc3VsdC5lcnJvcilcbiAgICAgICAgc3VpdGUucmVzdWx0LmVycm9yID0gbmV3IEVycm9yKGBObyB0ZXN0cyBmb3VuZCBpbiBzdWl0ZSAke3N1aXRlLm5hbWV9YClcbiAgICB9XG4gICAgZWxzZSBpZiAoaGFzRmFpbGVkKHN1aXRlKSkge1xuICAgICAgc3VpdGUucmVzdWx0LnN0YXRlID0gJ2ZhaWwnXG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgc3VpdGUucmVzdWx0LnN0YXRlID0gJ3Bhc3MnXG4gICAgfVxuICB9XG5cbiAgdXBkYXRlVGFzayhzdWl0ZSlcbn1cblxuYXN5bmMgZnVuY3Rpb24gcnVuU3VpdGVDaGlsZChjOiBUYXNrKSB7XG4gIHJldHVybiBjLnR5cGUgPT09ICd0ZXN0J1xuICAgID8gcnVuVGVzdChjKVxuICAgIDogcnVuU3VpdGUoYylcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHJ1blN1aXRlcyhzdWl0ZXM6IFN1aXRlW10pIHtcbiAgZm9yIChjb25zdCBzdWl0ZSBvZiBzdWl0ZXMpXG4gICAgYXdhaXQgcnVuU3VpdGUoc3VpdGUpXG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBzdGFydFRlc3RzKHBhdGhzOiBzdHJpbmdbXSwgY29uZmlnOiBSZXNvbHZlZENvbmZpZykge1xuICBjb25zdCBmaWxlcyA9IGF3YWl0IGNvbGxlY3RUZXN0cyhwYXRocywgY29uZmlnKVxuXG4gIHJwYygpLm9uQ29sbGVjdGVkKGZpbGVzKVxuXG4gIGF3YWl0IHJ1blN1aXRlcyhmaWxlcylcblxuICBhd2FpdCBnZXRTbmFwc2hvdENsaWVudCgpLnNhdmVTbmFwKClcblxuICBhd2FpdCBzZW5kVGFza3NVcGRhdGUoKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gY2xlYXJNb2R1bGVNb2NrcygpIHtcbiAgY29uc3QgeyBjbGVhck1vY2tzLCBtb2NrUmVzZXQsIHJlc3RvcmVNb2NrcyB9ID0gcHJvY2Vzcy5fX3ZpdGVzdF93b3JrZXJfXy5jb25maWdcblxuICAvLyBzaW5jZSBlYWNoIGZ1bmN0aW9uIGNhbGxzIGFub3RoZXIsIHdlIGNhbiBqdXN0IGNhbGwgb25lXG4gIGlmIChyZXN0b3JlTW9ja3MpXG4gICAgdmkucmVzdG9yZUFsbE1vY2tzKClcbiAgZWxzZSBpZiAobW9ja1Jlc2V0KVxuICAgIHZpLnJlc2V0QWxsTW9ja3MoKVxuICBlbHNlIGlmIChjbGVhck1vY2tzKVxuICAgIHZpLmNsZWFyQWxsTW9ja3MoKVxufVxuIiwiaW1wb3J0IHsgcHJvbWlzZXMgYXMgZnMgfSBmcm9tICdmcydcbmltcG9ydCB0eXBlIHsgQnVpbHRpbkVudmlyb25tZW50LCBSZXNvbHZlZENvbmZpZyB9IGZyb20gJy4uL3R5cGVzJ1xuaW1wb3J0IHsgc2V0dXBHbG9iYWxFbnYsIHdpdGhFbnYgfSBmcm9tICcuL3NldHVwJ1xuaW1wb3J0IHsgc3RhcnRUZXN0cyB9IGZyb20gJy4vcnVuJ1xuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gcnVuKGZpbGVzOiBzdHJpbmdbXSwgY29uZmlnOiBSZXNvbHZlZENvbmZpZyk6IFByb21pc2U8dm9pZD4ge1xuICBhd2FpdCBzZXR1cEdsb2JhbEVudihjb25maWcpXG5cbiAgZm9yIChjb25zdCBmaWxlIG9mIGZpbGVzKSB7XG4gICAgY29uc3QgY29kZSA9IGF3YWl0IGZzLnJlYWRGaWxlKGZpbGUsICd1dGYtOCcpXG5cbiAgICBjb25zdCBlbnYgPSBjb2RlLm1hdGNoKC9AKD86dml0ZXN0fGplc3QpLWVudmlyb25tZW50XFxzKz8oW1xcdy1dKylcXGIvKT8uWzFdIHx8IGNvbmZpZy5lbnZpcm9ubWVudCB8fCAnbm9kZSdcblxuICAgIGlmICghWydub2RlJywgJ2pzZG9tJywgJ2hhcHB5LWRvbSddLmluY2x1ZGVzKGVudikpXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYFVuc3VwcG9ydGVkIGVudmlyb25tZW50OiAke2Vudn1gKVxuXG4gICAgcHJvY2Vzcy5fX3ZpdGVzdF93b3JrZXJfXy5maWxlcGF0aCA9IGZpbGVcblxuICAgIGF3YWl0IHdpdGhFbnYoZW52IGFzIEJ1aWx0aW5FbnZpcm9ubWVudCwgY29uZmlnLmVudmlyb25tZW50T3B0aW9ucyB8fCB7fSwgYXN5bmMoKSA9PiB7XG4gICAgICBhd2FpdCBzdGFydFRlc3RzKFtmaWxlXSwgY29uZmlnKVxuICAgIH0pXG5cbiAgICBwcm9jZXNzLl9fdml0ZXN0X3dvcmtlcl9fLmZpbGVwYXRoID0gdW5kZWZpbmVkXG4gIH1cbn1cbiJdLCJuYW1lcyI6WyJfX2RlZlByb3AiLCJfX2dldE93blByb3BTeW1ib2xzIiwiX19oYXNPd25Qcm9wIiwiX19wcm9wSXNFbnVtIiwiX19kZWZOb3JtYWxQcm9wIiwiX19zcHJlYWRWYWx1ZXMiLCJyZXF1aXJlIiwidGhpcyIsImZzIiwibmF0dXJhbENvbXBhcmVNb2R1bGUiLCJwcmV0dHlGb3JtYXQiLCJwYXRoIiwibmF0dXJhbENvbXBhcmUiLCJmc3AiLCJBc3ltbWV0cmljTWF0Y2hlciIsInByZXR0eUZvcm1hdFBsdWdpbnMiLCJjaGFpIiwicGVyZm9ybWFuY2UiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSxXQUFlO0FBQ2YsRUFBRSxJQUFJLEVBQUUsTUFBTTtBQUNkLEVBQUUsTUFBTSxLQUFLLEdBQUc7QUFDaEIsSUFBSSxPQUFPO0FBQ1gsTUFBTSxRQUFRLEdBQUc7QUFDakIsT0FBTztBQUNQLEtBQUssQ0FBQztBQUNOLEdBQUc7QUFDSCxDQUFDOztBQ1JELE1BQU0sV0FBVyxHQUFHO0FBQ3BCLEVBQUUsY0FBYztBQUNoQixFQUFFLEtBQUs7QUFDUCxFQUFFLGlCQUFpQjtBQUNuQixFQUFFLGFBQWE7QUFDZixFQUFFLGNBQWM7QUFDaEIsRUFBRSxNQUFNO0FBQ1IsRUFBRSxNQUFNO0FBQ1IsRUFBRSxTQUFTO0FBQ1gsRUFBRSxrQkFBa0I7QUFDcEIsRUFBRSxtQkFBbUI7QUFDckIsRUFBRSxVQUFVO0FBQ1osRUFBRSxhQUFhO0FBQ2YsRUFBRSxlQUFlO0FBQ2pCLEVBQUUsTUFBTTtBQUNSLEVBQUUsY0FBYztBQUNoQixFQUFFLHVCQUF1QjtBQUN6QixFQUFFLFNBQVM7QUFDWCxFQUFFLGNBQWM7QUFDaEIsRUFBRSxVQUFVO0FBQ1osRUFBRSxnQkFBZ0I7QUFDbEIsRUFBRSx1QkFBdUI7QUFDekIsRUFBRSxjQUFjO0FBQ2hCLEVBQUUsY0FBYztBQUNoQixFQUFFLGdCQUFnQjtBQUNsQixFQUFF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SSxDQUFDLENBQUMsQ0FBQztBQUN0RCxFQUFFLE1BQU0sT0FBTyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLEdBQUcsQ0FBQyxPQUFPLElBQUksS0FBSztBQUMxRCxJQUFJLE1BQU0sR0FBRyxHQUFHLE1BQU0sR0FBRyxFQUFFLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQy9DLElBQUksTUFBTSxLQUFLLEdBQUcsU0FBUyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsSUFBSSxLQUFLLElBQUksQ0FBQyxDQUFDO0FBQzNELElBQUksTUFBTSxJQUFJLEdBQUcsTUFBTUMsUUFBRSxDQUFDLFFBQVEsQ0FBQyxJQUFJLEVBQUUsTUFBTSxDQUFDLENBQUM7QUFDakQsSUFBSSxNQUFNLENBQUMsR0FBRyxJQUFJLFdBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUNwQyxJQUFJLEtBQUssTUFBTSxJQUFJLElBQUksS0FBSyxFQUFFO0FBQzlCLE1BQU0sTUFBTSxHQUFHLEdBQUcsTUFBTSxjQUFjLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxDQUFDO0FBQ2xELE1BQU0sTUFBTSxLQUFLLEdBQUcsV0FBVyxDQUFDLElBQUksRUFBRSxHQUFHLENBQUMsQ0FBQztBQUMzQyxNQUFNLE1BQU0sRUFBRSxNQUFNLEVBQUUsR0FBRyxZQUFZLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLEdBQUcsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7QUFDdEUsTUFBTSxpQkFBaUIsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxFQUFFLEtBQUssRUFBRSxJQUFJLENBQUMsUUFBUSxFQUFFLE1BQU0sQ0FBQyxDQUFDO0FBQy9ELEtBQUs7QUFDTCxJQUFJLE1BQU0sV0FBVyxHQUFHLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQztBQUNyQyxJQUFJLElBQUksV0FBVyxLQUFLLElBQUk7QUFDNUIsTUFBTSxNQUFNQSxRQUFFLENBQUMsU0FBUyxD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Q0FBQyxDQUFDLEVBQUUsSUFBSSxHQUFHLEVBQUUsSUFBSSxJQUFJLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQyxDQUFDO0FBQ3RFLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsR0FBRyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDaEMsR0FBRztBQUNILEVBQUUsSUFBSSxHQUFHLFFBQVEsSUFBSSxRQUFRLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLEVBQUM7QUFDdEQsRUFBRSxPQUFPLElBQUksR0FBRyxDQUFDLENBQUMsR0FBRyxJQUFJLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQyxJQUFJLEdBQUcsR0FBRyxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsSUFBSSxHQUFHLEVBQUUsSUFBSSxJQUFJLEdBQUcsR0FBRyxJQUFJLElBQUk7QUFDcEcsS0FBSyxJQUFJLEdBQUcsRUFBRSxHQUFHLEVBQUU7QUFDbkIsS0FBSyxJQUFJLEdBQUcsRUFBRSxHQUFHLElBQUksR0FBRyxDQUFDO0FBQ3pCLEtBQUssSUFBSSxHQUFHLEVBQUUsR0FBRyxJQUFJLEdBQUcsRUFBRTtBQUMxQixLQUFLLElBQUksR0FBRyxFQUFFLEdBQUcsSUFBSSxHQUFHLEVBQUU7QUFDMUIsS0FBSyxJQUFJLEdBQUcsRUFBRSxHQUFHLElBQUksR0FBRyxFQUFFO0FBQzFCLEtBQUssSUFBSSxHQUFHLEVBQUUsR0FBRyxJQUFJLEdBQUcsRUFBRTtBQUMxQixLQUFLLElBQUksR0FBRyxHQUFHLEdBQUcsSUFBSSxHQUFHLENBQUM7QUFDMUIsS0FBSyxJQUFJLEdBQUcsRUFBRTtBQUNkLEVBQUU7QUFDRjtBQUNBO0FBQ0EsQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFLEVBQUUsTUFBTSxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsTUFBTSxLQUFLLEdBQUc7QUFDdkMsRUFBRSxLQUFLLEdBQUcsT0FBTyxDQUFDLENBQUMsRUFBRSxJQUFJLEVBQUUsRUFB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
