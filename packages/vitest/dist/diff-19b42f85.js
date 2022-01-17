import { existsSync, promises } from 'fs';
import { a as relative } from './index-1964368a.js';
import { l as notNullish, c } from './index-59e12882.js';

function Diff() {}
Diff.prototype = {
  diff: function diff(oldString, newString) {
    var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
    var callback = options.callback;

    if (typeof options === 'function') {
      callback = options;
      options = {};
    }

    this.options = options;
    var self = this;

    function done(value) {
      if (callback) {
        setTimeout(function () {
          callback(undefined, value);
        }, 0);
        return true;
      } else {
        return value;
      }
    } // Allow subclasses to massage the input prior to running


    oldString = this.castInput(oldString);
    newString = this.castInput(newString);
    oldString = this.removeEmpty(this.tokenize(oldString));
    newString = this.removeEmpty(this.tokenize(newString));
    var newLen = newString.length,
        oldLen = oldString.length;
    var editLength = 1;
    var maxEditLength = newLen + oldLen;
    var bestPath = [{
      newPos: -1,
      components: []
    }]; // Seed editLength = 0, i.e. the content starts with the same values

    var oldPos = this.extractCommon(bestPath[0], newString, oldString, 0);

    if (bestPath[0].newPos + 1 >= newLen && oldPos + 1 >= oldLen) {
      // Identity per the equality and tokenizer
      return done([{
        value: this.join(newString),
        count: newString.length
      }]);
    } // Main worker method. checks all permutations of a given edit length for acceptance.


    function execEditLength() {
      for (var diagonalPath = -1 * editLength; diagonalPath <= editLength; diagonalPath += 2) {
        var basePath = void 0;

        var addPath = bestPath[diagonalPath - 1],
            removePath = bestPath[diagonalPath + 1],
            _oldPos = (removePath ? removePath.newPos : 0) - diagonalPath;

        if (addPath) {
          // No one else is going to attempt to use this value, clear it
          bestPath[diagonalPath - 1] = undefined;
        }

        var canAdd = addPath && addPath.newPos + 1 < newLen,
            canRemove = removePath && 0 <= _oldPos && _oldPos < oldLen;

        if (!canAdd && !canRemove) {
          // If this path is a terminal then prune
          bestPath[diagonalPath] = undefined;
          continue;
        } // Select the diagonal that we want to branch from. We select the prior
        // path whose position in the new string is the farthest from the origin
        // and does not pass the bounds of the diff graph


        if (!canAdd || canRemove && addPath.newPos < removePath.newPos) {
          basePath = clonePath(removePath);
          self.pushComponent(basePath.components, undefined, true);
        } else {
          basePath = addPath; // No need to clone, we've pulled it from the list

          basePath.newPos++;
          self.pushComponent(basePath.components, true, undefined);
        }

        _oldPos = self.extractCommon(basePath, newString, oldString, diagonalPath); // If we have hit the end of both strings, then we are done

        if (basePath.newPos + 1 >= newLen && _oldPos + 1 >= oldLen) {
          return done(buildValues(self, basePath.components, newString, oldString, self.useLongestToken));
        } else {
          // Otherwise track this path as a potential candidate and continue.
          bestPath[diagonalPath] = basePath;
        }
      }

      editLength++;
    } // Performs the length of edit iteration. Is a bit fugly as this has to support the
    // sync and async mode which is never fun. Loops over execEditLength until a value
    // is produced.


    if (callback) {
      (function exec() {
        setTimeout(function () {
          // This should not happen, but we want to be safe.

          /* istanbul ignore next */
          if (editLength > maxEditLength) {
            return callback();
          }

          if (!execEditLength()) {
            exec();
          }
        }, 0);
      })();
    } else {
      while (editLength <= maxEditLength) {
        var ret = execEditLength();

        if (ret) {
          return ret;
        }
      }
    }
  },
  pushComponent: function pushComponent(components, added, removed) {
    var last = components[components.length - 1];

    if (last && last.added === added && last.removed === removed) {
      // We need to clone here as the component clone operation is just
      // as shallow array clone
      components[components.length - 1] = {
        count: last.count + 1,
        added: added,
        removed: removed
      };
    } else {
      components.push({
        count: 1,
        added: added,
        removed: removed
      });
    }
  },
  extractCommon: function extractCommon(basePath, newString, oldString, diagonalPath) {
    var newLen = newString.length,
        oldLen = oldString.length,
        newPos = basePath.newPos,
        oldPos = newPos - diagonalPath,
        commonCount = 0;

    while (newPos + 1 < newLen && oldPos + 1 < oldLen && this.equals(newString[newPos + 1], oldString[oldPos + 1])) {
      newPos++;
      oldPos++;
      commonCount++;
    }

    if (commonCount) {
      basePath.components.push({
        count: commonCount
      });
    }

    basePath.newPos = newPos;
    return oldPos;
  },
  equals: function equals(left, right) {
    if (this.options.comparator) {
      return this.options.comparator(left, right);
    } else {
      return left === right || this.options.ignoreCase && left.toLowerCase() === right.toLowerCase();
    }
  },
  removeEmpty: function removeEmpty(array) {
    var ret = [];

    for (var i = 0; i < array.length; i++) {
      if (array[i]) {
        ret.push(array[i]);
      }
    }

    return ret;
  },
  castInput: function castInput(value) {
    return value;
  },
  tokenize: function tokenize(value) {
    return value.split('');
  },
  join: function join(chars) {
    return chars.join('');
  }
};

function buildValues(diff, components, newString, oldString, useLongestToken) {
  var componentPos = 0,
      componentLen = components.length,
      newPos = 0,
      oldPos = 0;

  for (; componentPos < componentLen; componentPos++) {
    var component = components[componentPos];

    if (!component.removed) {
      if (!component.added && useLongestToken) {
        var value = newString.slice(newPos, newPos + component.count);
        value = value.map(function (value, i) {
          var oldValue = oldString[oldPos + i];
          return oldValue.length > value.length ? oldValue : value;
        });
        component.value = diff.join(value);
      } else {
        component.value = diff.join(newString.slice(newPos, newPos + component.count));
      }

      newPos += component.count; // Common case

      if (!component.added) {
        oldPos += component.count;
      }
    } else {
      component.value = diff.join(oldString.slice(oldPos, oldPos + component.count));
      oldPos += component.count; // Reverse add and remove so removes are output first to match common convention
      // The diffing algorithm is tied to add then remove output and this is the simplest
      // route to get the desired output with minimal overhead.

      if (componentPos && components[componentPos - 1].added) {
        var tmp = components[componentPos - 1];
        components[componentPos - 1] = components[componentPos];
        components[componentPos] = tmp;
      }
    }
  } // Special case handle for when one terminal is ignored (i.e. whitespace).
  // For this case we merge the terminal into the prior string and drop the change.
  // This is only available for string mode.


  var lastComponent = components[componentLen - 1];

  if (componentLen > 1 && typeof lastComponent.value === 'string' && (lastComponent.added || lastComponent.removed) && diff.equals('', lastComponent.value)) {
    components[componentLen - 2].value += lastComponent.value;
    components.pop();
  }

  return components;
}

function clonePath(path) {
  return {
    newPos: path.newPos,
    components: path.components.slice(0)
  };
}

//
// Ranges and exceptions:
// Latin-1 Supplement, 0080–00FF
//  - U+00D7  × Multiplication sign
//  - U+00F7  ÷ Division sign
// Latin Extended-A, 0100–017F
// Latin Extended-B, 0180–024F
// IPA Extensions, 0250–02AF
// Spacing Modifier Letters, 02B0–02FF
//  - U+02C7  ˇ &#711;  Caron
//  - U+02D8  ˘ &#728;  Breve
//  - U+02D9  ˙ &#729;  Dot Above
//  - U+02DA  ˚ &#730;  Ring Above
//  - U+02DB  ˛ &#731;  Ogonek
//  - U+02DC  ˜ &#732;  Small Tilde
//  - U+02DD  ˝ &#733;  Double Acute Accent
// Latin Extended Additional, 1E00–1EFF

var extendedWordChars = /^[A-Za-z\xC0-\u02C6\u02C8-\u02D7\u02DE-\u02FF\u1E00-\u1EFF]+$/;
var reWhitespace = /\S/;
var wordDiff = new Diff();

wordDiff.equals = function (left, right) {
  if (this.options.ignoreCase) {
    left = left.toLowerCase();
    right = right.toLowerCase();
  }

  return left === right || this.options.ignoreWhitespace && !reWhitespace.test(left) && !reWhitespace.test(right);
};

wordDiff.tokenize = function (value) {
  // All whitespace symbols except newline group into one token, each newline - in separate token
  var tokens = value.split(/([^\S\r\n]+|[()[\]{}'"\r\n]|\b)/); // Join the boundary splits that we do not consider to be boundaries. This is primarily the extended Latin character set.

  for (var i = 0; i < tokens.length - 1; i++) {
    // If we have an empty string in the next field and we have only word chars before and after, merge
    if (!tokens[i + 1] && tokens[i + 2] && extendedWordChars.test(tokens[i]) && extendedWordChars.test(tokens[i + 2])) {
      tokens[i] += tokens[i + 2];
      tokens.splice(i + 1, 2);
      i--;
    }
  }

  return tokens;
};

var lineDiff = new Diff();

lineDiff.tokenize = function (value) {
  var retLines = [],
      linesAndNewlines = value.split(/(\n|\r\n)/); // Ignore the final empty token that occurs if the string ends with a new line

  if (!linesAndNewlines[linesAndNewlines.length - 1]) {
    linesAndNewlines.pop();
  } // Merge the content and line separators into single tokens


  for (var i = 0; i < linesAndNewlines.length; i++) {
    var line = linesAndNewlines[i];

    if (i % 2 && !this.options.newlineIsToken) {
      retLines[retLines.length - 1] += line;
    } else {
      if (this.options.ignoreWhitespace) {
        line = line.trim();
      }

      retLines.push(line);
    }
  }

  return retLines;
};

function diffLines(oldStr, newStr, callback) {
  return lineDiff.diff(oldStr, newStr, callback);
}

var sentenceDiff = new Diff();

sentenceDiff.tokenize = function (value) {
  return value.split(/(\S.+?[.!?])(?=\s+|$)/);
};

var cssDiff = new Diff();

cssDiff.tokenize = function (value) {
  return value.split(/([{}:;,]|\s+)/);
};

function _typeof(obj) {
  "@babel/helpers - typeof";

  if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
    _typeof = function (obj) {
      return typeof obj;
    };
  } else {
    _typeof = function (obj) {
      return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    };
  }

  return _typeof(obj);
}

function _toConsumableArray(arr) {
  return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread();
}

function _arrayWithoutHoles(arr) {
  if (Array.isArray(arr)) return _arrayLikeToArray(arr);
}

function _iterableToArray(iter) {
  if (typeof Symbol !== "undefined" && Symbol.iterator in Object(iter)) return Array.from(iter);
}

function _unsupportedIterableToArray(o, minLen) {
  if (!o) return;
  if (typeof o === "string") return _arrayLikeToArray(o, minLen);
  var n = Object.prototype.toString.call(o).slice(8, -1);
  if (n === "Object" && o.constructor) n = o.constructor.name;
  if (n === "Map" || n === "Set") return Array.from(o);
  if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
}

function _arrayLikeToArray(arr, len) {
  if (len == null || len > arr.length) len = arr.length;

  for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];

  return arr2;
}

function _nonIterableSpread() {
  throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}

var objectPrototypeToString = Object.prototype.toString;
var jsonDiff = new Diff(); // Discriminate between two lines of pretty-printed, serialized JSON where one of them has a
// dangling comma and the other doesn't. Turns out including the dangling comma yields the nicest output:

jsonDiff.useLongestToken = true;
jsonDiff.tokenize = lineDiff.tokenize;

jsonDiff.castInput = function (value) {
  var _this$options = this.options,
      undefinedReplacement = _this$options.undefinedReplacement,
      _this$options$stringi = _this$options.stringifyReplacer,
      stringifyReplacer = _this$options$stringi === void 0 ? function (k, v) {
    return typeof v === 'undefined' ? undefinedReplacement : v;
  } : _this$options$stringi;
  return typeof value === 'string' ? value : JSON.stringify(canonicalize(value, null, null, stringifyReplacer), stringifyReplacer, '  ');
};

jsonDiff.equals = function (left, right) {
  return Diff.prototype.equals.call(jsonDiff, left.replace(/,([\r\n])/g, '$1'), right.replace(/,([\r\n])/g, '$1'));
};
// object that is already on the "stack" of items being processed. Accepts an optional replacer

function canonicalize(obj, stack, replacementStack, replacer, key) {
  stack = stack || [];
  replacementStack = replacementStack || [];

  if (replacer) {
    obj = replacer(key, obj);
  }

  var i;

  for (i = 0; i < stack.length; i += 1) {
    if (stack[i] === obj) {
      return replacementStack[i];
    }
  }

  var canonicalizedObj;

  if ('[object Array]' === objectPrototypeToString.call(obj)) {
    stack.push(obj);
    canonicalizedObj = new Array(obj.length);
    replacementStack.push(canonicalizedObj);

    for (i = 0; i < obj.length; i += 1) {
      canonicalizedObj[i] = canonicalize(obj[i], stack, replacementStack, replacer, key);
    }

    stack.pop();
    replacementStack.pop();
    return canonicalizedObj;
  }

  if (obj && obj.toJSON) {
    obj = obj.toJSON();
  }

  if (_typeof(obj) === 'object' && obj !== null) {
    stack.push(obj);
    canonicalizedObj = {};
    replacementStack.push(canonicalizedObj);

    var sortedKeys = [],
        _key;

    for (_key in obj) {
      /* istanbul ignore else */
      if (obj.hasOwnProperty(_key)) {
        sortedKeys.push(_key);
      }
    }

    sortedKeys.sort();

    for (i = 0; i < sortedKeys.length; i += 1) {
      _key = sortedKeys[i];
      canonicalizedObj[_key] = canonicalize(obj[_key], stack, replacementStack, replacer, _key);
    }

    stack.pop();
    replacementStack.pop();
  } else {
    canonicalizedObj = obj;
  }

  return canonicalizedObj;
}

var arrayDiff = new Diff();

arrayDiff.tokenize = function (value) {
  return value.slice();
};

arrayDiff.join = arrayDiff.removeEmpty = function (value) {
  return value;
};

function structuredPatch(oldFileName, newFileName, oldStr, newStr, oldHeader, newHeader, options) {
  if (!options) {
    options = {};
  }

  if (typeof options.context === 'undefined') {
    options.context = 4;
  }

  var diff = diffLines(oldStr, newStr, options);
  diff.push({
    value: '',
    lines: []
  }); // Append an empty value to make cleanup easier

  function contextLines(lines) {
    return lines.map(function (entry) {
      return ' ' + entry;
    });
  }

  var hunks = [];
  var oldRangeStart = 0,
      newRangeStart = 0,
      curRange = [],
      oldLine = 1,
      newLine = 1;

  var _loop = function _loop(i) {
    var current = diff[i],
        lines = current.lines || current.value.replace(/\n$/, '').split('\n');
    current.lines = lines;

    if (current.added || current.removed) {
      var _curRange;

      // If we have previous context, start with that
      if (!oldRangeStart) {
        var prev = diff[i - 1];
        oldRangeStart = oldLine;
        newRangeStart = newLine;

        if (prev) {
          curRange = options.context > 0 ? contextLines(prev.lines.slice(-options.context)) : [];
          oldRangeStart -= curRange.length;
          newRangeStart -= curRange.length;
        }
      } // Output our changes


      (_curRange = curRange).push.apply(_curRange, _toConsumableArray(lines.map(function (entry) {
        return (current.added ? '+' : '-') + entry;
      }))); // Track the updated file position


      if (current.added) {
        newLine += lines.length;
      } else {
        oldLine += lines.length;
      }
    } else {
      // Identical context lines. Track line changes
      if (oldRangeStart) {
        // Close out any changes that have been output (or join overlapping)
        if (lines.length <= options.context * 2 && i < diff.length - 2) {
          var _curRange2;

          // Overlapping
          (_curRange2 = curRange).push.apply(_curRange2, _toConsumableArray(contextLines(lines)));
        } else {
          var _curRange3;

          // end the range and output
          var contextSize = Math.min(lines.length, options.context);

          (_curRange3 = curRange).push.apply(_curRange3, _toConsumableArray(contextLines(lines.slice(0, contextSize))));

          var hunk = {
            oldStart: oldRangeStart,
            oldLines: oldLine - oldRangeStart + contextSize,
            newStart: newRangeStart,
            newLines: newLine - newRangeStart + contextSize,
            lines: curRange
          };

          if (i >= diff.length - 2 && lines.length <= options.context) {
            // EOF is inside this hunk
            var oldEOFNewline = /\n$/.test(oldStr);
            var newEOFNewline = /\n$/.test(newStr);
            var noNlBeforeAdds = lines.length == 0 && curRange.length > hunk.oldLines;

            if (!oldEOFNewline && noNlBeforeAdds && oldStr.length > 0) {
              // special case: old has no eol and no trailing context; no-nl can end up before adds
              // however, if the old file is empty, do not output the no-nl line
              curRange.splice(hunk.oldLines, 0, '\\ No newline at end of file');
            }

            if (!oldEOFNewline && !noNlBeforeAdds || !newEOFNewline) {
              curRange.push('\\ No newline at end of file');
            }
          }

          hunks.push(hunk);
          oldRangeStart = 0;
          newRangeStart = 0;
          curRange = [];
        }
      }

      oldLine += lines.length;
      newLine += lines.length;
    }
  };

  for (var i = 0; i < diff.length; i++) {
    _loop(i);
  }

  return {
    oldFileName: oldFileName,
    newFileName: newFileName,
    oldHeader: oldHeader,
    newHeader: newHeader,
    hunks: hunks
  };
}
function formatPatch(diff) {
  var ret = [];

  if (diff.oldFileName == diff.newFileName) {
    ret.push('Index: ' + diff.oldFileName);
  }

  ret.push('===================================================================');
  ret.push('--- ' + diff.oldFileName + (typeof diff.oldHeader === 'undefined' ? '' : '\t' + diff.oldHeader));
  ret.push('+++ ' + diff.newFileName + (typeof diff.newHeader === 'undefined' ? '' : '\t' + diff.newHeader));

  for (var i = 0; i < diff.hunks.length; i++) {
    var hunk = diff.hunks[i]; // Unified Diff Format quirk: If the chunk size is 0,
    // the first number is one lower than one would expect.
    // https://www.artima.com/weblogs/viewpost.jsp?thread=164293

    if (hunk.oldLines === 0) {
      hunk.oldStart -= 1;
    }

    if (hunk.newLines === 0) {
      hunk.newStart -= 1;
    }

    ret.push('@@ -' + hunk.oldStart + ',' + hunk.oldLines + ' +' + hunk.newStart + ',' + hunk.newLines + ' @@');
    ret.push.apply(ret, hunk.lines);
  }

  return ret.join('\n') + '\n';
}
function createTwoFilesPatch(oldFileName, newFileName, oldStr, newStr, oldHeader, newHeader, options) {
  return formatPatch(structuredPatch(oldFileName, newFileName, oldStr, newStr, oldHeader, newHeader, options));
}
function createPatch(fileName, oldStr, newStr, oldHeader, newHeader, options) {
  return createTwoFilesPatch(fileName, fileName, oldStr, newStr, oldHeader, newHeader, options);
}

/* eslint-disable yoda */

function isFullwidthCodePoint(codePoint) {
	if (!Number.isInteger(codePoint)) {
		return false;
	}

	// Code points are derived from:
	// https://unicode.org/Public/UNIDATA/EastAsianWidth.txt
	return codePoint >= 0x1100 && (
		codePoint <= 0x115F || // Hangul Jamo
		codePoint === 0x2329 || // LEFT-POINTING ANGLE BRACKET
		codePoint === 0x232A || // RIGHT-POINTING ANGLE BRACKET
		// CJK Radicals Supplement .. Enclosed CJK Letters and Months
		(0x2E80 <= codePoint && codePoint <= 0x3247 && codePoint !== 0x303F) ||
		// Enclosed CJK Letters and Months .. CJK Unified Ideographs Extension A
		(0x3250 <= codePoint && codePoint <= 0x4DBF) ||
		// CJK Unified Ideographs .. Yi Radicals
		(0x4E00 <= codePoint && codePoint <= 0xA4C6) ||
		// Hangul Jamo Extended-A
		(0xA960 <= codePoint && codePoint <= 0xA97C) ||
		// Hangul Syllables
		(0xAC00 <= codePoint && codePoint <= 0xD7A3) ||
		// CJK Compatibility Ideographs
		(0xF900 <= codePoint && codePoint <= 0xFAFF) ||
		// Vertical Forms
		(0xFE10 <= codePoint && codePoint <= 0xFE19) ||
		// CJK Compatibility Forms .. Small Form Variants
		(0xFE30 <= codePoint && codePoint <= 0xFE6B) ||
		// Halfwidth and Fullwidth Forms
		(0xFF01 <= codePoint && codePoint <= 0xFF60) ||
		(0xFFE0 <= codePoint && codePoint <= 0xFFE6) ||
		// Kana Supplement
		(0x1B000 <= codePoint && codePoint <= 0x1B001) ||
		// Enclosed Ideographic Supplement
		(0x1F200 <= codePoint && codePoint <= 0x1F251) ||
		// CJK Unified Ideographs Extension B .. Tertiary Ideographic Plane
		(0x20000 <= codePoint && codePoint <= 0x3FFFD)
	);
}

const ANSI_BACKGROUND_OFFSET = 10;

const wrapAnsi16 = (offset = 0) => code => `\u001B[${code + offset}m`;

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

	styles.color.ansi = wrapAnsi16();
	styles.color.ansi256 = wrapAnsi256();
	styles.color.ansi16m = wrapAnsi16m();
	styles.bgColor.ansi = wrapAnsi16(ANSI_BACKGROUND_OFFSET);
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
		},
		ansi256ToAnsi: {
			value: code => {
				if (code < 8) {
					return 30 + code;
				}

				if (code < 16) {
					return 90 + (code - 8);
				}

				let red;
				let green;
				let blue;

				if (code >= 232) {
					red = (((code - 232) * 10) + 8) / 255;
					green = red;
					blue = red;
				} else {
					code -= 16;

					const remainder = code % 36;

					red = Math.floor(code / 36) / 5;
					green = Math.floor(remainder / 6) / 5;
					blue = (remainder % 6) / 5;
				}

				const value = Math.max(red, green, blue) * 2;

				if (value === 0) {
					return 30;
				}

				let result = 30 + ((Math.round(blue) << 2) | (Math.round(green) << 1) | Math.round(red));

				if (value === 2) {
					result += 60;
				}

				return result;
			},
			enumerable: false
		},
		rgbToAnsi: {
			value: (red, green, blue) => styles.ansi256ToAnsi(styles.rgbToAnsi256(red, green, blue)),
			enumerable: false
		},
		hexToAnsi: {
			value: hex => styles.ansi256ToAnsi(styles.hexToAnsi256(hex)),
			enumerable: false
		}
	});

	return styles;
}

const ansiStyles = assembleStyles();

const astralRegex = /^[\uD800-\uDBFF][\uDC00-\uDFFF]$/;

const ESCAPES = [
	'\u001B',
	'\u009B'
];

const wrapAnsi = code => `${ESCAPES[0]}[${code}m`;

const checkAnsi = (ansiCodes, isEscapes, endAnsiCode) => {
	let output = [];
	ansiCodes = [...ansiCodes];

	for (let ansiCode of ansiCodes) {
		const ansiCodeOrigin = ansiCode;
		if (ansiCode.includes(';')) {
			ansiCode = ansiCode.split(';')[0][0] + '0';
		}

		const item = ansiStyles.codes.get(Number.parseInt(ansiCode, 10));
		if (item) {
			const indexEscape = ansiCodes.indexOf(item.toString());
			if (indexEscape === -1) {
				output.push(wrapAnsi(isEscapes ? item : ansiCodeOrigin));
			} else {
				ansiCodes.splice(indexEscape, 1);
			}
		} else if (isEscapes) {
			output.push(wrapAnsi(0));
			break;
		} else {
			output.push(wrapAnsi(ansiCodeOrigin));
		}
	}

	if (isEscapes) {
		output = output.filter((element, index) => output.indexOf(element) === index);

		if (endAnsiCode !== undefined) {
			const fistEscapeCode = wrapAnsi(ansiStyles.codes.get(Number.parseInt(endAnsiCode, 10)));
			// TODO: Remove the use of `.reduce` here.
			// eslint-disable-next-line unicorn/no-array-reduce
			output = output.reduce((current, next) => next === fistEscapeCode ? [next, ...current] : [...current, next], []);
		}
	}

	return output.join('');
};

function sliceAnsi(string, begin, end) {
	const characters = [...string];
	const ansiCodes = [];

	let stringEnd = typeof end === 'number' ? end : characters.length;
	let isInsideEscape = false;
	let ansiCode;
	let visible = 0;
	let output = '';

	for (const [index, character] of characters.entries()) {
		let leftEscape = false;

		if (ESCAPES.includes(character)) {
			const code = /\d[^m]*/.exec(string.slice(index, index + 18));
			ansiCode = code && code.length > 0 ? code[0] : undefined;

			if (visible < stringEnd) {
				isInsideEscape = true;

				if (ansiCode !== undefined) {
					ansiCodes.push(ansiCode);
				}
			}
		} else if (isInsideEscape && character === 'm') {
			isInsideEscape = false;
			leftEscape = true;
		}

		if (!isInsideEscape && !leftEscape) {
			visible++;
		}

		if (!astralRegex.test(character) && isFullwidthCodePoint(character.codePointAt())) {
			visible++;

			if (typeof end !== 'number') {
				stringEnd++;
			}
		}

		if (visible > begin && visible <= stringEnd) {
			output += character;
		} else if (visible === begin && !isInsideEscape && ansiCode !== undefined) {
			output = checkAnsi(ansiCodes);
		} else if (visible >= stringEnd) {
			output += checkAnsi(ansiCodes, true, ansiCode);
			break;
		}
	}

	return output;
}

function ansiRegex({onlyFirst = false} = {}) {
	const pattern = [
	    '[\\u001B\\u009B][[\\]()#;?]*(?:(?:(?:(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]+)*|[a-zA-Z\\d]+(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]*)*)?\\u0007)',
		'(?:(?:\\d{1,4}(?:;\\d{0,4})*)?[\\dA-PR-TZcf-ntqry=><~]))'
	].join('|');

	return new RegExp(pattern, onlyFirst ? undefined : 'g');
}

function stripAnsi(string) {
	if (typeof string !== 'string') {
		throw new TypeError(`Expected a \`string\`, got \`${typeof string}\``);
	}

	return string.replace(ansiRegex(), '');
}

var emojiRegex = function () {
  // https://mths.be/emoji
  return /\uD83C\uDFF4\uDB40\uDC67\uDB40\uDC62(?:\uDB40\uDC77\uDB40\uDC6C\uDB40\uDC73|\uDB40\uDC73\uDB40\uDC63\uDB40\uDC74|\uDB40\uDC65\uDB40\uDC6E\uDB40\uDC67)\uDB40\uDC7F|(?:\uD83E\uDDD1\uD83C\uDFFF\u200D\u2764\uFE0F\u200D(?:\uD83D\uDC8B\u200D)?\uD83E\uDDD1|\uD83D\uDC69\uD83C\uDFFF\u200D\uD83E\uDD1D\u200D(?:\uD83D[\uDC68\uDC69]))(?:\uD83C[\uDFFB-\uDFFE])|(?:\uD83E\uDDD1\uD83C\uDFFE\u200D\u2764\uFE0F\u200D(?:\uD83D\uDC8B\u200D)?\uD83E\uDDD1|\uD83D\uDC69\uD83C\uDFFE\u200D\uD83E\uDD1D\u200D(?:\uD83D[\uDC68\uDC69]))(?:\uD83C[\uDFFB-\uDFFD\uDFFF])|(?:\uD83E\uDDD1\uD83C\uDFFD\u200D\u2764\uFE0F\u200D(?:\uD83D\uDC8B\u200D)?\uD83E\uDDD1|\uD83D\uDC69\uD83C\uDFFD\u200D\uD83E\uDD1D\u200D(?:\uD83D[\uDC68\uDC69]))(?:\uD83C[\uDFFB\uDFFC\uDFFE\uDFFF])|(?:\uD83E\uDDD1\uD83C\uDFFC\u200D\u2764\uFE0F\u200D(?:\uD83D\uDC8B\u200D)?\uD83E\uDDD1|\uD83D\uDC69\uD83C\uDFFC\u200D\uD83E\uDD1D\u200D(?:\uD83D[\uDC68\uDC69]))(?:\uD83C[\uDFFB\uDFFD-\uDFFF])|(?:\uD83E\uDDD1\uD83C\uDFFB\u200D\u2764\uFE0F\u200D(?:\uD83D\uDC8B\u200D)?\uD83E\uDDD1|\uD83D\uDC69\uD83C\uDFFB\u200D\uD83E\uDD1D\u200D(?:\uD83D[\uDC68\uDC69]))(?:\uD83C[\uDFFC-\uDFFF])|\uD83D\uDC68(?:\uD83C\uDFFB(?:\u200D(?:\u2764\uFE0F\u200D(?:\uD83D\uDC8B\u200D\uD83D\uDC68(?:\uD83C[\uDFFB-\uDFFF])|\uD83D\uDC68(?:\uD83C[\uDFFB-\uDFFF]))|\uD83E\uDD1D\u200D\uD83D\uDC68(?:\uD83C[\uDFFC-\uDFFF])|[\u2695\u2696\u2708]\uFE0F|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD]))?|(?:\uD83C[\uDFFC-\uDFFF])\u200D\u2764\uFE0F\u200D(?:\uD83D\uDC8B\u200D\uD83D\uDC68(?:\uD83C[\uDFFB-\uDFFF])|\uD83D\uDC68(?:\uD83C[\uDFFB-\uDFFF]))|\u200D(?:\u2764\uFE0F\u200D(?:\uD83D\uDC8B\u200D)?\uD83D\uDC68|(?:\uD83D[\uDC68\uDC69])\u200D(?:\uD83D\uDC66\u200D\uD83D\uDC66|\uD83D\uDC67\u200D(?:\uD83D[\uDC66\uDC67]))|\uD83D\uDC66\u200D\uD83D\uDC66|\uD83D\uDC67\u200D(?:\uD83D[\uDC66\uDC67])|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFF\u200D(?:\uD83E\uDD1D\u200D\uD83D\uDC68(?:\uD83C[\uDFFB-\uDFFE])|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFE\u200D(?:\uD83E\uDD1D\u200D\uD83D\uDC68(?:\uD83C[\uDFFB-\uDFFD\uDFFF])|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFD\u200D(?:\uD83E\uDD1D\u200D\uD83D\uDC68(?:\uD83C[\uDFFB\uDFFC\uDFFE\uDFFF])|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFC\u200D(?:\uD83E\uDD1D\u200D\uD83D\uDC68(?:\uD83C[\uDFFB\uDFFD-\uDFFF])|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|(?:\uD83C\uDFFF\u200D[\u2695\u2696\u2708]|\uD83C\uDFFE\u200D[\u2695\u2696\u2708]|\uD83C\uDFFD\u200D[\u2695\u2696\u2708]|\uD83C\uDFFC\u200D[\u2695\u2696\u2708]|\u200D[\u2695\u2696\u2708])\uFE0F|\u200D(?:(?:\uD83D[\uDC68\uDC69])\u200D(?:\uD83D[\uDC66\uDC67])|\uD83D[\uDC66\uDC67])|\uD83C\uDFFF|\uD83C\uDFFE|\uD83C\uDFFD|\uD83C\uDFFC)?|(?:\uD83D\uDC69(?:\uD83C\uDFFB\u200D\u2764\uFE0F\u200D(?:\uD83D\uDC8B\u200D(?:\uD83D[\uDC68\uDC69])|\uD83D[\uDC68\uDC69])|(?:\uD83C[\uDFFC-\uDFFF])\u200D\u2764\uFE0F\u200D(?:\uD83D\uDC8B\u200D(?:\uD83D[\uDC68\uDC69])|\uD83D[\uDC68\uDC69]))|\uD83E\uDDD1(?:\uD83C[\uDFFB-\uDFFF])\u200D\uD83E\uDD1D\u200D\uD83E\uDDD1)(?:\uD83C[\uDFFB-\uDFFF])|\uD83D\uDC69\u200D\uD83D\uDC69\u200D(?:\uD83D\uDC66\u200D\uD83D\uDC66|\uD83D\uDC67\u200D(?:\uD83D[\uDC66\uDC67]))|\uD83D\uDC69(?:\u200D(?:\u2764\uFE0F\u200D(?:\uD83D\uDC8B\u200D(?:\uD83D[\uDC68\uDC69])|\uD83D[\uDC68\uDC69])|\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFF\u200D(?:\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFE\u200D(?:\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFD\u200D(?:\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFC\u200D(?:\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFB\u200D(?:\uD83C[\uDF3E\uDF73\uDF7C\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD]))|\uD83E\uDDD1(?:\u200D(?:\uD83E\uDD1D\u200D\uD83E\uDDD1|\uD83C[\uDF3E\uDF73\uDF7C\uDF84\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFF\u200D(?:\uD83C[\uDF3E\uDF73\uDF7C\uDF84\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFE\u200D(?:\uD83C[\uDF3E\uDF73\uDF7C\uDF84\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFD\u200D(?:\uD83C[\uDF3E\uDF73\uDF7C\uDF84\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFC\u200D(?:\uD83C[\uDF3E\uDF73\uDF7C\uDF84\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD])|\uD83C\uDFFB\u200D(?:\uD83C[\uDF3E\uDF73\uDF7C\uDF84\uDF93\uDFA4\uDFA8\uDFEB\uDFED]|\uD83D[\uDCBB\uDCBC\uDD27\uDD2C\uDE80\uDE92]|\uD83E[\uDDAF-\uDDB3\uDDBC\uDDBD]))|\uD83D\uDC69\u200D\uD83D\uDC66\u200D\uD83D\uDC66|\uD83D\uDC69\u200D\uD83D\uDC69\u200D(?:\uD83D[\uDC66\uDC67])|\uD83D\uDC69\u200D\uD83D\uDC67\u200D(?:\uD83D[\uDC66\uDC67])|(?:\uD83D\uDC41\uFE0F\u200D\uD83D\uDDE8|\uD83E\uDDD1(?:\uD83C\uDFFF\u200D[\u2695\u2696\u2708]|\uD83C\uDFFE\u200D[\u2695\u2696\u2708]|\uD83C\uDFFD\u200D[\u2695\u2696\u2708]|\uD83C\uDFFC\u200D[\u2695\u2696\u2708]|\uD83C\uDFFB\u200D[\u2695\u2696\u2708]|\u200D[\u2695\u2696\u2708])|\uD83D\uDC69(?:\uD83C\uDFFF\u200D[\u2695\u2696\u2708]|\uD83C\uDFFE\u200D[\u2695\u2696\u2708]|\uD83C\uDFFD\u200D[\u2695\u2696\u2708]|\uD83C\uDFFC\u200D[\u2695\u2696\u2708]|\uD83C\uDFFB\u200D[\u2695\u2696\u2708]|\u200D[\u2695\u2696\u2708])|\uD83D\uDE36\u200D\uD83C\uDF2B|\uD83C\uDFF3\uFE0F\u200D\u26A7|\uD83D\uDC3B\u200D\u2744|(?:(?:\uD83C[\uDFC3\uDFC4\uDFCA]|\uD83D[\uDC6E\uDC70\uDC71\uDC73\uDC77\uDC81\uDC82\uDC86\uDC87\uDE45-\uDE47\uDE4B\uDE4D\uDE4E\uDEA3\uDEB4-\uDEB6]|\uD83E[\uDD26\uDD35\uDD37-\uDD39\uDD3D\uDD3E\uDDB8\uDDB9\uDDCD-\uDDCF\uDDD4\uDDD6-\uDDDD])(?:\uD83C[\uDFFB-\uDFFF])|\uD83D\uDC6F|\uD83E[\uDD3C\uDDDE\uDDDF])\u200D[\u2640\u2642]|(?:\u26F9|\uD83C[\uDFCB\uDFCC]|\uD83D\uDD75)(?:\uFE0F|\uD83C[\uDFFB-\uDFFF])\u200D[\u2640\u2642]|\uD83C\uDFF4\u200D\u2620|(?:\uD83C[\uDFC3\uDFC4\uDFCA]|\uD83D[\uDC6E\uDC70\uDC71\uDC73\uDC77\uDC81\uDC82\uDC86\uDC87\uDE45-\uDE47\uDE4B\uDE4D\uDE4E\uDEA3\uDEB4-\uDEB6]|\uD83E[\uDD26\uDD35\uDD37-\uDD39\uDD3D\uDD3E\uDDB8\uDDB9\uDDCD-\uDDCF\uDDD4\uDDD6-\uDDDD])\u200D[\u2640\u2642]|[\xA9\xAE\u203C\u2049\u2122\u2139\u2194-\u2199\u21A9\u21AA\u2328\u23CF\u23ED-\u23EF\u23F1\u23F2\u23F8-\u23FA\u24C2\u25AA\u25AB\u25B6\u25C0\u25FB\u25FC\u2600-\u2604\u260E\u2611\u2618\u2620\u2622\u2623\u2626\u262A\u262E\u262F\u2638-\u263A\u2640\u2642\u265F\u2660\u2663\u2665\u2666\u2668\u267B\u267E\u2692\u2694-\u2697\u2699\u269B\u269C\u26A0\u26A7\u26B0\u26B1\u26C8\u26CF\u26D1\u26D3\u26E9\u26F0\u26F1\u26F4\u26F7\u26F8\u2702\u2708\u2709\u270F\u2712\u2714\u2716\u271D\u2721\u2733\u2734\u2744\u2747\u2763\u27A1\u2934\u2935\u2B05-\u2B07\u3030\u303D\u3297\u3299]|\uD83C[\uDD70\uDD71\uDD7E\uDD7F\uDE02\uDE37\uDF21\uDF24-\uDF2C\uDF36\uDF7D\uDF96\uDF97\uDF99-\uDF9B\uDF9E\uDF9F\uDFCD\uDFCE\uDFD4-\uDFDF\uDFF5\uDFF7]|\uD83D[\uDC3F\uDCFD\uDD49\uDD4A\uDD6F\uDD70\uDD73\uDD76-\uDD79\uDD87\uDD8A-\uDD8D\uDDA5\uDDA8\uDDB1\uDDB2\uDDBC\uDDC2-\uDDC4\uDDD1-\uDDD3\uDDDC-\uDDDE\uDDE1\uDDE3\uDDE8\uDDEF\uDDF3\uDDFA\uDECB\uDECD-\uDECF\uDEE0-\uDEE5\uDEE9\uDEF0\uDEF3])\uFE0F|\uD83C\uDFF3\uFE0F\u200D\uD83C\uDF08|\uD83D\uDC69\u200D\uD83D\uDC67|\uD83D\uDC69\u200D\uD83D\uDC66|\uD83D\uDE35\u200D\uD83D\uDCAB|\uD83D\uDE2E\u200D\uD83D\uDCA8|\uD83D\uDC15\u200D\uD83E\uDDBA|\uD83E\uDDD1(?:\uD83C\uDFFF|\uD83C\uDFFE|\uD83C\uDFFD|\uD83C\uDFFC|\uD83C\uDFFB)?|\uD83D\uDC69(?:\uD83C\uDFFF|\uD83C\uDFFE|\uD83C\uDFFD|\uD83C\uDFFC|\uD83C\uDFFB)?|\uD83C\uDDFD\uD83C\uDDF0|\uD83C\uDDF6\uD83C\uDDE6|\uD83C\uDDF4\uD83C\uDDF2|\uD83D\uDC08\u200D\u2B1B|\u2764\uFE0F\u200D(?:\uD83D\uDD25|\uD83E\uDE79)|\uD83D\uDC41\uFE0F|\uD83C\uDFF3\uFE0F|\uD83C\uDDFF(?:\uD83C[\uDDE6\uDDF2\uDDFC])|\uD83C\uDDFE(?:\uD83C[\uDDEA\uDDF9])|\uD83C\uDDFC(?:\uD83C[\uDDEB\uDDF8])|\uD83C\uDDFB(?:\uD83C[\uDDE6\uDDE8\uDDEA\uDDEC\uDDEE\uDDF3\uDDFA])|\uD83C\uDDFA(?:\uD83C[\uDDE6\uDDEC\uDDF2\uDDF3\uDDF8\uDDFE\uDDFF])|\uD83C\uDDF9(?:\uD83C[\uDDE6\uDDE8\uDDE9\uDDEB-\uDDED\uDDEF-\uDDF4\uDDF7\uDDF9\uDDFB\uDDFC\uDDFF])|\uD83C\uDDF8(?:\uD83C[\uDDE6-\uDDEA\uDDEC-\uDDF4\uDDF7-\uDDF9\uDDFB\uDDFD-\uDDFF])|\uD83C\uDDF7(?:\uD83C[\uDDEA\uDDF4\uDDF8\uDDFA\uDDFC])|\uD83C\uDDF5(?:\uD83C[\uDDE6\uDDEA-\uDDED\uDDF0-\uDDF3\uDDF7-\uDDF9\uDDFC\uDDFE])|\uD83C\uDDF3(?:\uD83C[\uDDE6\uDDE8\uDDEA-\uDDEC\uDDEE\uDDF1\uDDF4\uDDF5\uDDF7\uDDFA\uDDFF])|\uD83C\uDDF2(?:\uD83C[\uDDE6\uDDE8-\uDDED\uDDF0-\uDDFF])|\uD83C\uDDF1(?:\uD83C[\uDDE6-\uDDE8\uDDEE\uDDF0\uDDF7-\uDDFB\uDDFE])|\uD83C\uDDF0(?:\uD83C[\uDDEA\uDDEC-\uDDEE\uDDF2\uDDF3\uDDF5\uDDF7\uDDFC\uDDFE\uDDFF])|\uD83C\uDDEF(?:\uD83C[\uDDEA\uDDF2\uDDF4\uDDF5])|\uD83C\uDDEE(?:\uD83C[\uDDE8-\uDDEA\uDDF1-\uDDF4\uDDF6-\uDDF9])|\uD83C\uDDED(?:\uD83C[\uDDF0\uDDF2\uDDF3\uDDF7\uDDF9\uDDFA])|\uD83C\uDDEC(?:\uD83C[\uDDE6\uDDE7\uDDE9-\uDDEE\uDDF1-\uDDF3\uDDF5-\uDDFA\uDDFC\uDDFE])|\uD83C\uDDEB(?:\uD83C[\uDDEE-\uDDF0\uDDF2\uDDF4\uDDF7])|\uD83C\uDDEA(?:\uD83C[\uDDE6\uDDE8\uDDEA\uDDEC\uDDED\uDDF7-\uDDFA])|\uD83C\uDDE9(?:\uD83C[\uDDEA\uDDEC\uDDEF\uDDF0\uDDF2\uDDF4\uDDFF])|\uD83C\uDDE8(?:\uD83C[\uDDE6\uDDE8\uDDE9\uDDEB-\uDDEE\uDDF0-\uDDF5\uDDF7\uDDFA-\uDDFF])|\uD83C\uDDE7(?:\uD83C[\uDDE6\uDDE7\uDDE9-\uDDEF\uDDF1-\uDDF4\uDDF6-\uDDF9\uDDFB\uDDFC\uDDFE\uDDFF])|\uD83C\uDDE6(?:\uD83C[\uDDE8-\uDDEC\uDDEE\uDDF1\uDDF2\uDDF4\uDDF6-\uDDFA\uDDFC\uDDFD\uDDFF])|[#\*0-9]\uFE0F\u20E3|\u2764\uFE0F|(?:\uD83C[\uDFC3\uDFC4\uDFCA]|\uD83D[\uDC6E\uDC70\uDC71\uDC73\uDC77\uDC81\uDC82\uDC86\uDC87\uDE45-\uDE47\uDE4B\uDE4D\uDE4E\uDEA3\uDEB4-\uDEB6]|\uD83E[\uDD26\uDD35\uDD37-\uDD39\uDD3D\uDD3E\uDDB8\uDDB9\uDDCD-\uDDCF\uDDD4\uDDD6-\uDDDD])(?:\uD83C[\uDFFB-\uDFFF])|(?:\u26F9|\uD83C[\uDFCB\uDFCC]|\uD83D\uDD75)(?:\uFE0F|\uD83C[\uDFFB-\uDFFF])|\uD83C\uDFF4|(?:[\u270A\u270B]|\uD83C[\uDF85\uDFC2\uDFC7]|\uD83D[\uDC42\uDC43\uDC46-\uDC50\uDC66\uDC67\uDC6B-\uDC6D\uDC72\uDC74-\uDC76\uDC78\uDC7C\uDC83\uDC85\uDC8F\uDC91\uDCAA\uDD7A\uDD95\uDD96\uDE4C\uDE4F\uDEC0\uDECC]|\uD83E[\uDD0C\uDD0F\uDD18-\uDD1C\uDD1E\uDD1F\uDD30-\uDD34\uDD36\uDD77\uDDB5\uDDB6\uDDBB\uDDD2\uDDD3\uDDD5])(?:\uD83C[\uDFFB-\uDFFF])|(?:[\u261D\u270C\u270D]|\uD83D[\uDD74\uDD90])(?:\uFE0F|\uD83C[\uDFFB-\uDFFF])|[\u270A\u270B]|\uD83C[\uDF85\uDFC2\uDFC7]|\uD83D[\uDC08\uDC15\uDC3B\uDC42\uDC43\uDC46-\uDC50\uDC66\uDC67\uDC6B-\uDC6D\uDC72\uDC74-\uDC76\uDC78\uDC7C\uDC83\uDC85\uDC8F\uDC91\uDCAA\uDD7A\uDD95\uDD96\uDE2E\uDE35\uDE36\uDE4C\uDE4F\uDEC0\uDECC]|\uD83E[\uDD0C\uDD0F\uDD18-\uDD1C\uDD1E\uDD1F\uDD30-\uDD34\uDD36\uDD77\uDDB5\uDDB6\uDDBB\uDDD2\uDDD3\uDDD5]|\uD83C[\uDFC3\uDFC4\uDFCA]|\uD83D[\uDC6E\uDC70\uDC71\uDC73\uDC77\uDC81\uDC82\uDC86\uDC87\uDE45-\uDE47\uDE4B\uDE4D\uDE4E\uDEA3\uDEB4-\uDEB6]|\uD83E[\uDD26\uDD35\uDD37-\uDD39\uDD3D\uDD3E\uDDB8\uDDB9\uDDCD-\uDDCF\uDDD4\uDDD6-\uDDDD]|\uD83D\uDC6F|\uD83E[\uDD3C\uDDDE\uDDDF]|[\u231A\u231B\u23E9-\u23EC\u23F0\u23F3\u25FD\u25FE\u2614\u2615\u2648-\u2653\u267F\u2693\u26A1\u26AA\u26AB\u26BD\u26BE\u26C4\u26C5\u26CE\u26D4\u26EA\u26F2\u26F3\u26F5\u26FA\u26FD\u2705\u2728\u274C\u274E\u2753-\u2755\u2757\u2795-\u2797\u27B0\u27BF\u2B1B\u2B1C\u2B50\u2B55]|\uD83C[\uDC04\uDCCF\uDD8E\uDD91-\uDD9A\uDE01\uDE1A\uDE2F\uDE32-\uDE36\uDE38-\uDE3A\uDE50\uDE51\uDF00-\uDF20\uDF2D-\uDF35\uDF37-\uDF7C\uDF7E-\uDF84\uDF86-\uDF93\uDFA0-\uDFC1\uDFC5\uDFC6\uDFC8\uDFC9\uDFCF-\uDFD3\uDFE0-\uDFF0\uDFF8-\uDFFF]|\uD83D[\uDC00-\uDC07\uDC09-\uDC14\uDC16-\uDC3A\uDC3C-\uDC3E\uDC40\uDC44\uDC45\uDC51-\uDC65\uDC6A\uDC79-\uDC7B\uDC7D-\uDC80\uDC84\uDC88-\uDC8E\uDC90\uDC92-\uDCA9\uDCAB-\uDCFC\uDCFF-\uDD3D\uDD4B-\uDD4E\uDD50-\uDD67\uDDA4\uDDFB-\uDE2D\uDE2F-\uDE34\uDE37-\uDE44\uDE48-\uDE4A\uDE80-\uDEA2\uDEA4-\uDEB3\uDEB7-\uDEBF\uDEC1-\uDEC5\uDED0-\uDED2\uDED5-\uDED7\uDEEB\uDEEC\uDEF4-\uDEFC\uDFE0-\uDFEB]|\uD83E[\uDD0D\uDD0E\uDD10-\uDD17\uDD1D\uDD20-\uDD25\uDD27-\uDD2F\uDD3A\uDD3F-\uDD45\uDD47-\uDD76\uDD78\uDD7A-\uDDB4\uDDB7\uDDBA\uDDBC-\uDDCB\uDDD0\uDDE0-\uDDFF\uDE70-\uDE74\uDE78-\uDE7A\uDE80-\uDE86\uDE90-\uDEA8\uDEB0-\uDEB6\uDEC0-\uDEC2\uDED0-\uDED6]|(?:[\u231A\u231B\u23E9-\u23EC\u23F0\u23F3\u25FD\u25FE\u2614\u2615\u2648-\u2653\u267F\u2693\u26A1\u26AA\u26AB\u26BD\u26BE\u26C4\u26C5\u26CE\u26D4\u26EA\u26F2\u26F3\u26F5\u26FA\u26FD\u2705\u270A\u270B\u2728\u274C\u274E\u2753-\u2755\u2757\u2795-\u2797\u27B0\u27BF\u2B1B\u2B1C\u2B50\u2B55]|\uD83C[\uDC04\uDCCF\uDD8E\uDD91-\uDD9A\uDDE6-\uDDFF\uDE01\uDE1A\uDE2F\uDE32-\uDE36\uDE38-\uDE3A\uDE50\uDE51\uDF00-\uDF20\uDF2D-\uDF35\uDF37-\uDF7C\uDF7E-\uDF93\uDFA0-\uDFCA\uDFCF-\uDFD3\uDFE0-\uDFF0\uDFF4\uDFF8-\uDFFF]|\uD83D[\uDC00-\uDC3E\uDC40\uDC42-\uDCFC\uDCFF-\uDD3D\uDD4B-\uDD4E\uDD50-\uDD67\uDD7A\uDD95\uDD96\uDDA4\uDDFB-\uDE4F\uDE80-\uDEC5\uDECC\uDED0-\uDED2\uDED5-\uDED7\uDEEB\uDEEC\uDEF4-\uDEFC\uDFE0-\uDFEB]|\uD83E[\uDD0C-\uDD3A\uDD3C-\uDD45\uDD47-\uDD78\uDD7A-\uDDCB\uDDCD-\uDDFF\uDE70-\uDE74\uDE78-\uDE7A\uDE80-\uDE86\uDE90-\uDEA8\uDEB0-\uDEB6\uDEC0-\uDEC2\uDED0-\uDED6])|(?:[#\*0-9\xA9\xAE\u203C\u2049\u2122\u2139\u2194-\u2199\u21A9\u21AA\u231A\u231B\u2328\u23CF\u23E9-\u23F3\u23F8-\u23FA\u24C2\u25AA\u25AB\u25B6\u25C0\u25FB-\u25FE\u2600-\u2604\u260E\u2611\u2614\u2615\u2618\u261D\u2620\u2622\u2623\u2626\u262A\u262E\u262F\u2638-\u263A\u2640\u2642\u2648-\u2653\u265F\u2660\u2663\u2665\u2666\u2668\u267B\u267E\u267F\u2692-\u2697\u2699\u269B\u269C\u26A0\u26A1\u26A7\u26AA\u26AB\u26B0\u26B1\u26BD\u26BE\u26C4\u26C5\u26C8\u26CE\u26CF\u26D1\u26D3\u26D4\u26E9\u26EA\u26F0-\u26F5\u26F7-\u26FA\u26FD\u2702\u2705\u2708-\u270D\u270F\u2712\u2714\u2716\u271D\u2721\u2728\u2733\u2734\u2744\u2747\u274C\u274E\u2753-\u2755\u2757\u2763\u2764\u2795-\u2797\u27A1\u27B0\u27BF\u2934\u2935\u2B05-\u2B07\u2B1B\u2B1C\u2B50\u2B55\u3030\u303D\u3297\u3299]|\uD83C[\uDC04\uDCCF\uDD70\uDD71\uDD7E\uDD7F\uDD8E\uDD91-\uDD9A\uDDE6-\uDDFF\uDE01\uDE02\uDE1A\uDE2F\uDE32-\uDE3A\uDE50\uDE51\uDF00-\uDF21\uDF24-\uDF93\uDF96\uDF97\uDF99-\uDF9B\uDF9E-\uDFF0\uDFF3-\uDFF5\uDFF7-\uDFFF]|\uD83D[\uDC00-\uDCFD\uDCFF-\uDD3D\uDD49-\uDD4E\uDD50-\uDD67\uDD6F\uDD70\uDD73-\uDD7A\uDD87\uDD8A-\uDD8D\uDD90\uDD95\uDD96\uDDA4\uDDA5\uDDA8\uDDB1\uDDB2\uDDBC\uDDC2-\uDDC4\uDDD1-\uDDD3\uDDDC-\uDDDE\uDDE1\uDDE3\uDDE8\uDDEF\uDDF3\uDDFA-\uDE4F\uDE80-\uDEC5\uDECB-\uDED2\uDED5-\uDED7\uDEE0-\uDEE5\uDEE9\uDEEB\uDEEC\uDEF0\uDEF3-\uDEFC\uDFE0-\uDFEB]|\uD83E[\uDD0C-\uDD3A\uDD3C-\uDD45\uDD47-\uDD78\uDD7A-\uDDCB\uDDCD-\uDDFF\uDE70-\uDE74\uDE78-\uDE7A\uDE80-\uDE86\uDE90-\uDEA8\uDEB0-\uDEB6\uDEC0-\uDEC2\uDED0-\uDED6])\uFE0F|(?:[\u261D\u26F9\u270A-\u270D]|\uD83C[\uDF85\uDFC2-\uDFC4\uDFC7\uDFCA-\uDFCC]|\uD83D[\uDC42\uDC43\uDC46-\uDC50\uDC66-\uDC78\uDC7C\uDC81-\uDC83\uDC85-\uDC87\uDC8F\uDC91\uDCAA\uDD74\uDD75\uDD7A\uDD90\uDD95\uDD96\uDE45-\uDE47\uDE4B-\uDE4F\uDEA3\uDEB4-\uDEB6\uDEC0\uDECC]|\uD83E[\uDD0C\uDD0F\uDD18-\uDD1F\uDD26\uDD30-\uDD39\uDD3C-\uDD3E\uDD77\uDDB5\uDDB6\uDDB8\uDDB9\uDDBB\uDDCD-\uDDCF\uDDD1-\uDDDD])/g;
};

function stringWidth(string) {
	if (typeof string !== 'string' || string.length === 0) {
		return 0;
	}

	string = stripAnsi(string);

	if (string.length === 0) {
		return 0;
	}

	string = string.replace(emojiRegex(), '  ');

	let width = 0;

	for (let index = 0; index < string.length; index++) {
		const codePoint = string.codePointAt(index);

		// Ignore control characters
		if (codePoint <= 0x1F || (codePoint >= 0x7F && codePoint <= 0x9F)) {
			continue;
		}

		// Ignore combining characters
		if (codePoint >= 0x300 && codePoint <= 0x36F) {
			continue;
		}

		// Surrogates
		if (codePoint > 0xFFFF) {
			index++;
		}

		width += isFullwidthCodePoint(codePoint) ? 2 : 1;
	}

	return width;
}

function getIndexOfNearestSpace(string, wantedIndex, shouldSearchRight) {
	if (string.charAt(wantedIndex) === ' ') {
		return wantedIndex;
	}

	for (let index = 1; index <= 3; index++) {
		if (shouldSearchRight) {
			if (string.charAt(wantedIndex + index) === ' ') {
				return wantedIndex + index;
			}
		} else if (string.charAt(wantedIndex - index) === ' ') {
			return wantedIndex - index;
		}
	}

	return wantedIndex;
}

function cliTruncate(text, columns, options) {
	options = {
		position: 'end',
		preferTruncationOnSpace: false,
		truncationCharacter: '…',
		...options,
	};

	const {position, space, preferTruncationOnSpace} = options;
	let {truncationCharacter} = options;

	if (typeof text !== 'string') {
		throw new TypeError(`Expected \`input\` to be a string, got ${typeof text}`);
	}

	if (typeof columns !== 'number') {
		throw new TypeError(`Expected \`columns\` to be a number, got ${typeof columns}`);
	}

	if (columns < 1) {
		return '';
	}

	if (columns === 1) {
		return truncationCharacter;
	}

	const length = stringWidth(text);

	if (length <= columns) {
		return text;
	}

	if (position === 'start') {
		if (preferTruncationOnSpace) {
			const nearestSpace = getIndexOfNearestSpace(text, length - columns + 1, true);
			return truncationCharacter + sliceAnsi(text, nearestSpace, length).trim();
		}

		if (space === true) {
			truncationCharacter += ' ';
		}

		return truncationCharacter + sliceAnsi(text, length - columns + stringWidth(truncationCharacter), length);
	}

	if (position === 'middle') {
		if (space === true) {
			truncationCharacter = ` ${truncationCharacter} `;
		}

		const half = Math.floor(columns / 2);

		if (preferTruncationOnSpace) {
			const spaceNearFirstBreakPoint = getIndexOfNearestSpace(text, half);
			const spaceNearSecondBreakPoint = getIndexOfNearestSpace(text, length - (columns - half) + 1, true);
			return sliceAnsi(text, 0, spaceNearFirstBreakPoint) + truncationCharacter + sliceAnsi(text, spaceNearSecondBreakPoint, length).trim();
		}

		return (
			sliceAnsi(text, 0, half)
				+ truncationCharacter
				+ sliceAnsi(text, length - (columns - half) + stringWidth(truncationCharacter), length)
		);
	}

	if (position === 'end') {
		if (preferTruncationOnSpace) {
			const nearestSpace = getIndexOfNearestSpace(text, columns - 1);
			return sliceAnsi(text, 0, nearestSpace) + truncationCharacter;
		}

		if (space === true) {
			truncationCharacter = ` ${truncationCharacter}`;
		}

		return sliceAnsi(text, 0, columns - stringWidth(truncationCharacter)) + truncationCharacter;
	}

	throw new Error(`Expected \`options.position\` to be either \`start\`, \`middle\` or \`end\`, got ${position}`);
}

var sourceMapGenerator = {};

var base64Vlq = {};

var base64$1 = {};

/* -*- Mode: js; js-indent-level: 2; -*- */

/*
 * Copyright 2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE or:
 * http://opensource.org/licenses/BSD-3-Clause
 */

var intToCharMap = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'.split('');

/**
 * Encode an integer in the range of 0 to 63 to a single base 64 digit.
 */
base64$1.encode = function (number) {
  if (0 <= number && number < intToCharMap.length) {
    return intToCharMap[number];
  }
  throw new TypeError("Must be between 0 and 63: " + number);
};

/**
 * Decode a single base 64 character code digit to an integer. Returns -1 on
 * failure.
 */
base64$1.decode = function (charCode) {
  var bigA = 65;     // 'A'
  var bigZ = 90;     // 'Z'

  var littleA = 97;  // 'a'
  var littleZ = 122; // 'z'

  var zero = 48;     // '0'
  var nine = 57;     // '9'

  var plus = 43;     // '+'
  var slash = 47;    // '/'

  var littleOffset = 26;
  var numberOffset = 52;

  // 0 - 25: ABCDEFGHIJKLMNOPQRSTUVWXYZ
  if (bigA <= charCode && charCode <= bigZ) {
    return (charCode - bigA);
  }

  // 26 - 51: abcdefghijklmnopqrstuvwxyz
  if (littleA <= charCode && charCode <= littleZ) {
    return (charCode - littleA + littleOffset);
  }

  // 52 - 61: 0123456789
  if (zero <= charCode && charCode <= nine) {
    return (charCode - zero + numberOffset);
  }

  // 62: +
  if (charCode == plus) {
    return 62;
  }

  // 63: /
  if (charCode == slash) {
    return 63;
  }

  // Invalid base64 digit.
  return -1;
};

/* -*- Mode: js; js-indent-level: 2; -*- */

/*
 * Copyright 2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE or:
 * http://opensource.org/licenses/BSD-3-Clause
 *
 * Based on the Base 64 VLQ implementation in Closure Compiler:
 * https://code.google.com/p/closure-compiler/source/browse/trunk/src/com/google/debugging/sourcemap/Base64VLQ.java
 *
 * Copyright 2011 The Closure Compiler Authors. All rights reserved.
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are
 * met:
 *
 *  * Redistributions of source code must retain the above copyright
 *    notice, this list of conditions and the following disclaimer.
 *  * Redistributions in binary form must reproduce the above
 *    copyright notice, this list of conditions and the following
 *    disclaimer in the documentation and/or other materials provided
 *    with the distribution.
 *  * Neither the name of Google Inc. nor the names of its
 *    contributors may be used to endorse or promote products derived
 *    from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
 * A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
 * OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 * LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
 * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

var base64 = base64$1;

// A single base 64 digit can contain 6 bits of data. For the base 64 variable
// length quantities we use in the source map spec, the first bit is the sign,
// the next four bits are the actual value, and the 6th bit is the
// continuation bit. The continuation bit tells us whether there are more
// digits in this value following this digit.
//
//   Continuation
//   |    Sign
//   |    |
//   V    V
//   101011

var VLQ_BASE_SHIFT = 5;

// binary: 100000
var VLQ_BASE = 1 << VLQ_BASE_SHIFT;

// binary: 011111
var VLQ_BASE_MASK = VLQ_BASE - 1;

// binary: 100000
var VLQ_CONTINUATION_BIT = VLQ_BASE;

/**
 * Converts from a two-complement value to a value where the sign bit is
 * placed in the least significant bit.  For example, as decimals:
 *   1 becomes 2 (10 binary), -1 becomes 3 (11 binary)
 *   2 becomes 4 (100 binary), -2 becomes 5 (101 binary)
 */
function toVLQSigned(aValue) {
  return aValue < 0
    ? ((-aValue) << 1) + 1
    : (aValue << 1) + 0;
}

/**
 * Converts to a two-complement value from a value where the sign bit is
 * placed in the least significant bit.  For example, as decimals:
 *   2 (10 binary) becomes 1, 3 (11 binary) becomes -1
 *   4 (100 binary) becomes 2, 5 (101 binary) becomes -2
 */
function fromVLQSigned(aValue) {
  var isNegative = (aValue & 1) === 1;
  var shifted = aValue >> 1;
  return isNegative
    ? -shifted
    : shifted;
}

/**
 * Returns the base 64 VLQ encoded value.
 */
base64Vlq.encode = function base64VLQ_encode(aValue) {
  var encoded = "";
  var digit;

  var vlq = toVLQSigned(aValue);

  do {
    digit = vlq & VLQ_BASE_MASK;
    vlq >>>= VLQ_BASE_SHIFT;
    if (vlq > 0) {
      // There are still more digits in this value, so we must make sure the
      // continuation bit is marked.
      digit |= VLQ_CONTINUATION_BIT;
    }
    encoded += base64.encode(digit);
  } while (vlq > 0);

  return encoded;
};

/**
 * Decodes the next base 64 VLQ value from the given string and returns the
 * value and the rest of the string via the out parameter.
 */
base64Vlq.decode = function base64VLQ_decode(aStr, aIndex, aOutParam) {
  var strLen = aStr.length;
  var result = 0;
  var shift = 0;
  var continuation, digit;

  do {
    if (aIndex >= strLen) {
      throw new Error("Expected more digits in base 64 VLQ value.");
    }

    digit = base64.decode(aStr.charCodeAt(aIndex++));
    if (digit === -1) {
      throw new Error("Invalid base64 digit: " + aStr.charAt(aIndex - 1));
    }

    continuation = !!(digit & VLQ_CONTINUATION_BIT);
    digit &= VLQ_BASE_MASK;
    result = result + (digit << shift);
    shift += VLQ_BASE_SHIFT;
  } while (continuation);

  aOutParam.value = fromVLQSigned(result);
  aOutParam.rest = aIndex;
};

var util$5 = {};

/* -*- Mode: js; js-indent-level: 2; -*- */

(function (exports) {
/*
 * Copyright 2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE or:
 * http://opensource.org/licenses/BSD-3-Clause
 */

/**
 * This is a helper function for getting values from parameter/options
 * objects.
 *
 * @param args The object we are extracting values from
 * @param name The name of the property we are getting.
 * @param defaultValue An optional value to return if the property is missing
 * from the object. If this is not specified and the property is missing, an
 * error will be thrown.
 */
function getArg(aArgs, aName, aDefaultValue) {
  if (aName in aArgs) {
    return aArgs[aName];
  } else if (arguments.length === 3) {
    return aDefaultValue;
  } else {
    throw new Error('"' + aName + '" is a required argument.');
  }
}
exports.getArg = getArg;

var urlRegexp = /^(?:([\w+\-.]+):)?\/\/(?:(\w+:\w+)@)?([\w.-]*)(?::(\d+))?(.*)$/;
var dataUrlRegexp = /^data:.+\,.+$/;

function urlParse(aUrl) {
  var match = aUrl.match(urlRegexp);
  if (!match) {
    return null;
  }
  return {
    scheme: match[1],
    auth: match[2],
    host: match[3],
    port: match[4],
    path: match[5]
  };
}
exports.urlParse = urlParse;

function urlGenerate(aParsedUrl) {
  var url = '';
  if (aParsedUrl.scheme) {
    url += aParsedUrl.scheme + ':';
  }
  url += '//';
  if (aParsedUrl.auth) {
    url += aParsedUrl.auth + '@';
  }
  if (aParsedUrl.host) {
    url += aParsedUrl.host;
  }
  if (aParsedUrl.port) {
    url += ":" + aParsedUrl.port;
  }
  if (aParsedUrl.path) {
    url += aParsedUrl.path;
  }
  return url;
}
exports.urlGenerate = urlGenerate;

var MAX_CACHED_INPUTS = 32;

/**
 * Takes some function `f(input) -> result` and returns a memoized version of
 * `f`.
 *
 * We keep at most `MAX_CACHED_INPUTS` memoized results of `f` alive. The
 * memoization is a dumb-simple, linear least-recently-used cache.
 */
function lruMemoize(f) {
  var cache = [];

  return function(input) {
    for (var i = 0; i < cache.length; i++) {
      if (cache[i].input === input) {
        var temp = cache[0];
        cache[0] = cache[i];
        cache[i] = temp;
        return cache[0].result;
      }
    }

    var result = f(input);

    cache.unshift({
      input,
      result,
    });

    if (cache.length > MAX_CACHED_INPUTS) {
      cache.pop();
    }

    return result;
  };
}

/**
 * Normalizes a path, or the path portion of a URL:
 *
 * - Replaces consecutive slashes with one slash.
 * - Removes unnecessary '.' parts.
 * - Removes unnecessary '<dir>/..' parts.
 *
 * Based on code in the Node.js 'path' core module.
 *
 * @param aPath The path or url to normalize.
 */
var normalize = lruMemoize(function normalize(aPath) {
  var path = aPath;
  var url = urlParse(aPath);
  if (url) {
    if (!url.path) {
      return aPath;
    }
    path = url.path;
  }
  var isAbsolute = exports.isAbsolute(path);
  // Split the path into parts between `/` characters. This is much faster than
  // using `.split(/\/+/g)`.
  var parts = [];
  var start = 0;
  var i = 0;
  while (true) {
    start = i;
    i = path.indexOf("/", start);
    if (i === -1) {
      parts.push(path.slice(start));
      break;
    } else {
      parts.push(path.slice(start, i));
      while (i < path.length && path[i] === "/") {
        i++;
      }
    }
  }

  for (var part, up = 0, i = parts.length - 1; i >= 0; i--) {
    part = parts[i];
    if (part === '.') {
      parts.splice(i, 1);
    } else if (part === '..') {
      up++;
    } else if (up > 0) {
      if (part === '') {
        // The first part is blank if the path is absolute. Trying to go
        // above the root is a no-op. Therefore we can remove all '..' parts
        // directly after the root.
        parts.splice(i + 1, up);
        up = 0;
      } else {
        parts.splice(i, 2);
        up--;
      }
    }
  }
  path = parts.join('/');

  if (path === '') {
    path = isAbsolute ? '/' : '.';
  }

  if (url) {
    url.path = path;
    return urlGenerate(url);
  }
  return path;
});
exports.normalize = normalize;

/**
 * Joins two paths/URLs.
 *
 * @param aRoot The root path or URL.
 * @param aPath The path or URL to be joined with the root.
 *
 * - If aPath is a URL or a data URI, aPath is returned, unless aPath is a
 *   scheme-relative URL: Then the scheme of aRoot, if any, is prepended
 *   first.
 * - Otherwise aPath is a path. If aRoot is a URL, then its path portion
 *   is updated with the result and aRoot is returned. Otherwise the result
 *   is returned.
 *   - If aPath is absolute, the result is aPath.
 *   - Otherwise the two paths are joined with a slash.
 * - Joining for example 'http://' and 'www.example.com' is also supported.
 */
function join(aRoot, aPath) {
  if (aRoot === "") {
    aRoot = ".";
  }
  if (aPath === "") {
    aPath = ".";
  }
  var aPathUrl = urlParse(aPath);
  var aRootUrl = urlParse(aRoot);
  if (aRootUrl) {
    aRoot = aRootUrl.path || '/';
  }

  // `join(foo, '//www.example.org')`
  if (aPathUrl && !aPathUrl.scheme) {
    if (aRootUrl) {
      aPathUrl.scheme = aRootUrl.scheme;
    }
    return urlGenerate(aPathUrl);
  }

  if (aPathUrl || aPath.match(dataUrlRegexp)) {
    return aPath;
  }

  // `join('http://', 'www.example.com')`
  if (aRootUrl && !aRootUrl.host && !aRootUrl.path) {
    aRootUrl.host = aPath;
    return urlGenerate(aRootUrl);
  }

  var joined = aPath.charAt(0) === '/'
    ? aPath
    : normalize(aRoot.replace(/\/+$/, '') + '/' + aPath);

  if (aRootUrl) {
    aRootUrl.path = joined;
    return urlGenerate(aRootUrl);
  }
  return joined;
}
exports.join = join;

exports.isAbsolute = function (aPath) {
  return aPath.charAt(0) === '/' || urlRegexp.test(aPath);
};

/**
 * Make a path relative to a URL or another path.
 *
 * @param aRoot The root path or URL.
 * @param aPath The path or URL to be made relative to aRoot.
 */
function relative(aRoot, aPath) {
  if (aRoot === "") {
    aRoot = ".";
  }

  aRoot = aRoot.replace(/\/$/, '');

  // It is possible for the path to be above the root. In this case, simply
  // checking whether the root is a prefix of the path won't work. Instead, we
  // need to remove components from the root one by one, until either we find
  // a prefix that fits, or we run out of components to remove.
  var level = 0;
  while (aPath.indexOf(aRoot + '/') !== 0) {
    var index = aRoot.lastIndexOf("/");
    if (index < 0) {
      return aPath;
    }

    // If the only part of the root that is left is the scheme (i.e. http://,
    // file:///, etc.), one or more slashes (/), or simply nothing at all, we
    // have exhausted all components, so the path is not relative to the root.
    aRoot = aRoot.slice(0, index);
    if (aRoot.match(/^([^\/]+:\/)?\/*$/)) {
      return aPath;
    }

    ++level;
  }

  // Make sure we add a "../" for each component we removed from the root.
  return Array(level + 1).join("../") + aPath.substr(aRoot.length + 1);
}
exports.relative = relative;

var supportsNullProto = (function () {
  var obj = Object.create(null);
  return !('__proto__' in obj);
}());

function identity (s) {
  return s;
}

/**
 * Because behavior goes wacky when you set `__proto__` on objects, we
 * have to prefix all the strings in our set with an arbitrary character.
 *
 * See https://github.com/mozilla/source-map/pull/31 and
 * https://github.com/mozilla/source-map/issues/30
 *
 * @param String aStr
 */
function toSetString(aStr) {
  if (isProtoString(aStr)) {
    return '$' + aStr;
  }

  return aStr;
}
exports.toSetString = supportsNullProto ? identity : toSetString;

function fromSetString(aStr) {
  if (isProtoString(aStr)) {
    return aStr.slice(1);
  }

  return aStr;
}
exports.fromSetString = supportsNullProto ? identity : fromSetString;

function isProtoString(s) {
  if (!s) {
    return false;
  }

  var length = s.length;

  if (length < 9 /* "__proto__".length */) {
    return false;
  }

  if (s.charCodeAt(length - 1) !== 95  /* '_' */ ||
      s.charCodeAt(length - 2) !== 95  /* '_' */ ||
      s.charCodeAt(length - 3) !== 111 /* 'o' */ ||
      s.charCodeAt(length - 4) !== 116 /* 't' */ ||
      s.charCodeAt(length - 5) !== 111 /* 'o' */ ||
      s.charCodeAt(length - 6) !== 114 /* 'r' */ ||
      s.charCodeAt(length - 7) !== 112 /* 'p' */ ||
      s.charCodeAt(length - 8) !== 95  /* '_' */ ||
      s.charCodeAt(length - 9) !== 95  /* '_' */) {
    return false;
  }

  for (var i = length - 10; i >= 0; i--) {
    if (s.charCodeAt(i) !== 36 /* '$' */) {
      return false;
    }
  }

  return true;
}

/**
 * Comparator between two mappings where the original positions are compared.
 *
 * Optionally pass in `true` as `onlyCompareGenerated` to consider two
 * mappings with the same original source/line/column, but different generated
 * line and column the same. Useful when searching for a mapping with a
 * stubbed out mapping.
 */
function compareByOriginalPositions(mappingA, mappingB, onlyCompareOriginal) {
  var cmp = strcmp(mappingA.source, mappingB.source);
  if (cmp !== 0) {
    return cmp;
  }

  cmp = mappingA.originalLine - mappingB.originalLine;
  if (cmp !== 0) {
    return cmp;
  }

  cmp = mappingA.originalColumn - mappingB.originalColumn;
  if (cmp !== 0 || onlyCompareOriginal) {
    return cmp;
  }

  cmp = mappingA.generatedColumn - mappingB.generatedColumn;
  if (cmp !== 0) {
    return cmp;
  }

  cmp = mappingA.generatedLine - mappingB.generatedLine;
  if (cmp !== 0) {
    return cmp;
  }

  return strcmp(mappingA.name, mappingB.name);
}
exports.compareByOriginalPositions = compareByOriginalPositions;

function compareByOriginalPositionsNoSource(mappingA, mappingB, onlyCompareOriginal) {
  var cmp;

  cmp = mappingA.originalLine - mappingB.originalLine;
  if (cmp !== 0) {
    return cmp;
  }

  cmp = mappingA.originalColumn - mappingB.originalColumn;
  if (cmp !== 0 || onlyCompareOriginal) {
    return cmp;
  }

  cmp = mappingA.generatedColumn - mappingB.generatedColumn;
  if (cmp !== 0) {
    return cmp;
  }

  cmp = mappingA.generatedLine - mappingB.generatedLine;
  if (cmp !== 0) {
    return cmp;
  }

  return strcmp(mappingA.name, mappingB.name);
}
exports.compareByOriginalPositionsNoSource = compareByOriginalPositionsNoSource;

/**
 * Comparator between two mappings with deflated source and name indices where
 * the generated positions are compared.
 *
 * Optionally pass in `true` as `onlyCompareGenerated` to consider two
 * mappings with the same generated line and column, but different
 * source/name/original line and column the same. Useful when searching for a
 * mapping with a stubbed out mapping.
 */
function compareByGeneratedPositionsDeflated(mappingA, mappingB, onlyCompareGenerated) {
  var cmp = mappingA.generatedLine - mappingB.generatedLine;
  if (cmp !== 0) {
    return cmp;
  }

  cmp = mappingA.generatedColumn - mappingB.generatedColumn;
  if (cmp !== 0 || onlyCompareGenerated) {
    return cmp;
  }

  cmp = strcmp(mappingA.source, mappingB.source);
  if (cmp !== 0) {
    return cmp;
  }

  cmp = mappingA.originalLine - mappingB.originalLine;
  if (cmp !== 0) {
    return cmp;
  }

  cmp = mappingA.originalColumn - mappingB.originalColumn;
  if (cmp !== 0) {
    return cmp;
  }

  return strcmp(mappingA.name, mappingB.name);
}
exports.compareByGeneratedPositionsDeflated = compareByGeneratedPositionsDeflated;

function compareByGeneratedPositionsDeflatedNoLine(mappingA, mappingB, onlyCompareGenerated) {
  var cmp = mappingA.generatedColumn - mappingB.generatedColumn;
  if (cmp !== 0 || onlyCompareGenerated) {
    return cmp;
  }

  cmp = strcmp(mappingA.source, mappingB.source);
  if (cmp !== 0) {
    return cmp;
  }

  cmp = mappingA.originalLine - mappingB.originalLine;
  if (cmp !== 0) {
    return cmp;
  }

  cmp = mappingA.originalColumn - mappingB.originalColumn;
  if (cmp !== 0) {
    return cmp;
  }

  return strcmp(mappingA.name, mappingB.name);
}
exports.compareByGeneratedPositionsDeflatedNoLine = compareByGeneratedPositionsDeflatedNoLine;

function strcmp(aStr1, aStr2) {
  if (aStr1 === aStr2) {
    return 0;
  }

  if (aStr1 === null) {
    return 1; // aStr2 !== null
  }

  if (aStr2 === null) {
    return -1; // aStr1 !== null
  }

  if (aStr1 > aStr2) {
    return 1;
  }

  return -1;
}

/**
 * Comparator between two mappings with inflated source and name strings where
 * the generated positions are compared.
 */
function compareByGeneratedPositionsInflated(mappingA, mappingB) {
  var cmp = mappingA.generatedLine - mappingB.generatedLine;
  if (cmp !== 0) {
    return cmp;
  }

  cmp = mappingA.generatedColumn - mappingB.generatedColumn;
  if (cmp !== 0) {
    return cmp;
  }

  cmp = strcmp(mappingA.source, mappingB.source);
  if (cmp !== 0) {
    return cmp;
  }

  cmp = mappingA.originalLine - mappingB.originalLine;
  if (cmp !== 0) {
    return cmp;
  }

  cmp = mappingA.originalColumn - mappingB.originalColumn;
  if (cmp !== 0) {
    return cmp;
  }

  return strcmp(mappingA.name, mappingB.name);
}
exports.compareByGeneratedPositionsInflated = compareByGeneratedPositionsInflated;

/**
 * Strip any JSON XSSI avoidance prefix from the string (as documented
 * in the source maps specification), and then parse the string as
 * JSON.
 */
function parseSourceMapInput(str) {
  return JSON.parse(str.replace(/^\)]}'[^\n]*\n/, ''));
}
exports.parseSourceMapInput = parseSourceMapInput;

/**
 * Compute the URL of a source given the the source root, the source's
 * URL, and the source map's URL.
 */
function computeSourceURL(sourceRoot, sourceURL, sourceMapURL) {
  sourceURL = sourceURL || '';

  if (sourceRoot) {
    // This follows what Chrome does.
    if (sourceRoot[sourceRoot.length - 1] !== '/' && sourceURL[0] !== '/') {
      sourceRoot += '/';
    }
    // The spec says:
    //   Line 4: An optional source root, useful for relocating source
    //   files on a server or removing repeated values in the
    //   “sources” entry.  This value is prepended to the individual
    //   entries in the “source” field.
    sourceURL = sourceRoot + sourceURL;
  }

  // Historically, SourceMapConsumer did not take the sourceMapURL as
  // a parameter.  This mode is still somewhat supported, which is why
  // this code block is conditional.  However, it's preferable to pass
  // the source map URL to SourceMapConsumer, so that this function
  // can implement the source URL resolution algorithm as outlined in
  // the spec.  This block is basically the equivalent of:
  //    new URL(sourceURL, sourceMapURL).toString()
  // ... except it avoids using URL, which wasn't available in the
  // older releases of node still supported by this library.
  //
  // The spec says:
  //   If the sources are not absolute URLs after prepending of the
  //   “sourceRoot”, the sources are resolved relative to the
  //   SourceMap (like resolving script src in a html document).
  if (sourceMapURL) {
    var parsed = urlParse(sourceMapURL);
    if (!parsed) {
      throw new Error("sourceMapURL could not be parsed");
    }
    if (parsed.path) {
      // Strip the last path component, but keep the "/".
      var index = parsed.path.lastIndexOf('/');
      if (index >= 0) {
        parsed.path = parsed.path.substring(0, index + 1);
      }
    }
    sourceURL = join(urlGenerate(parsed), sourceURL);
  }

  return normalize(sourceURL);
}
exports.computeSourceURL = computeSourceURL;
}(util$5));

var arraySet = {};

/* -*- Mode: js; js-indent-level: 2; -*- */

/*
 * Copyright 2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE or:
 * http://opensource.org/licenses/BSD-3-Clause
 */

var util$4 = util$5;
var has = Object.prototype.hasOwnProperty;
var hasNativeMap = typeof Map !== "undefined";

/**
 * A data structure which is a combination of an array and a set. Adding a new
 * member is O(1), testing for membership is O(1), and finding the index of an
 * element is O(1). Removing elements from the set is not supported. Only
 * strings are supported for membership.
 */
function ArraySet$2() {
  this._array = [];
  this._set = hasNativeMap ? new Map() : Object.create(null);
}

/**
 * Static method for creating ArraySet instances from an existing array.
 */
ArraySet$2.fromArray = function ArraySet_fromArray(aArray, aAllowDuplicates) {
  var set = new ArraySet$2();
  for (var i = 0, len = aArray.length; i < len; i++) {
    set.add(aArray[i], aAllowDuplicates);
  }
  return set;
};

/**
 * Return how many unique items are in this ArraySet. If duplicates have been
 * added, than those do not count towards the size.
 *
 * @returns Number
 */
ArraySet$2.prototype.size = function ArraySet_size() {
  return hasNativeMap ? this._set.size : Object.getOwnPropertyNames(this._set).length;
};

/**
 * Add the given string to this set.
 *
 * @param String aStr
 */
ArraySet$2.prototype.add = function ArraySet_add(aStr, aAllowDuplicates) {
  var sStr = hasNativeMap ? aStr : util$4.toSetString(aStr);
  var isDuplicate = hasNativeMap ? this.has(aStr) : has.call(this._set, sStr);
  var idx = this._array.length;
  if (!isDuplicate || aAllowDuplicates) {
    this._array.push(aStr);
  }
  if (!isDuplicate) {
    if (hasNativeMap) {
      this._set.set(aStr, idx);
    } else {
      this._set[sStr] = idx;
    }
  }
};

/**
 * Is the given string a member of this set?
 *
 * @param String aStr
 */
ArraySet$2.prototype.has = function ArraySet_has(aStr) {
  if (hasNativeMap) {
    return this._set.has(aStr);
  } else {
    var sStr = util$4.toSetString(aStr);
    return has.call(this._set, sStr);
  }
};

/**
 * What is the index of the given string in the array?
 *
 * @param String aStr
 */
ArraySet$2.prototype.indexOf = function ArraySet_indexOf(aStr) {
  if (hasNativeMap) {
    var idx = this._set.get(aStr);
    if (idx >= 0) {
        return idx;
    }
  } else {
    var sStr = util$4.toSetString(aStr);
    if (has.call(this._set, sStr)) {
      return this._set[sStr];
    }
  }

  throw new Error('"' + aStr + '" is not in the set.');
};

/**
 * What is the element at the given index?
 *
 * @param Number aIdx
 */
ArraySet$2.prototype.at = function ArraySet_at(aIdx) {
  if (aIdx >= 0 && aIdx < this._array.length) {
    return this._array[aIdx];
  }
  throw new Error('No element indexed by ' + aIdx);
};

/**
 * Returns the array representation of this set (which has the proper indices
 * indicated by indexOf). Note that this is a copy of the internal array used
 * for storing the members so that no one can mess with internal state.
 */
ArraySet$2.prototype.toArray = function ArraySet_toArray() {
  return this._array.slice();
};

arraySet.ArraySet = ArraySet$2;

var mappingList = {};

/* -*- Mode: js; js-indent-level: 2; -*- */

/*
 * Copyright 2014 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE or:
 * http://opensource.org/licenses/BSD-3-Clause
 */

var util$3 = util$5;

/**
 * Determine whether mappingB is after mappingA with respect to generated
 * position.
 */
function generatedPositionAfter(mappingA, mappingB) {
  // Optimized for most common case
  var lineA = mappingA.generatedLine;
  var lineB = mappingB.generatedLine;
  var columnA = mappingA.generatedColumn;
  var columnB = mappingB.generatedColumn;
  return lineB > lineA || lineB == lineA && columnB >= columnA ||
         util$3.compareByGeneratedPositionsInflated(mappingA, mappingB) <= 0;
}

/**
 * A data structure to provide a sorted view of accumulated mappings in a
 * performance conscious manner. It trades a neglibable overhead in general
 * case for a large speedup in case of mappings being added in order.
 */
function MappingList$1() {
  this._array = [];
  this._sorted = true;
  // Serves as infimum
  this._last = {generatedLine: -1, generatedColumn: 0};
}

/**
 * Iterate through internal items. This method takes the same arguments that
 * `Array.prototype.forEach` takes.
 *
 * NOTE: The order of the mappings is NOT guaranteed.
 */
MappingList$1.prototype.unsortedForEach =
  function MappingList_forEach(aCallback, aThisArg) {
    this._array.forEach(aCallback, aThisArg);
  };

/**
 * Add the given source mapping.
 *
 * @param Object aMapping
 */
MappingList$1.prototype.add = function MappingList_add(aMapping) {
  if (generatedPositionAfter(this._last, aMapping)) {
    this._last = aMapping;
    this._array.push(aMapping);
  } else {
    this._sorted = false;
    this._array.push(aMapping);
  }
};

/**
 * Returns the flat, sorted array of mappings. The mappings are sorted by
 * generated position.
 *
 * WARNING: This method returns internal data without copying, for
 * performance. The return value must NOT be mutated, and should be treated as
 * an immutable borrow. If you want to take ownership, you must make your own
 * copy.
 */
MappingList$1.prototype.toArray = function MappingList_toArray() {
  if (!this._sorted) {
    this._array.sort(util$3.compareByGeneratedPositionsInflated);
    this._sorted = true;
  }
  return this._array;
};

mappingList.MappingList = MappingList$1;

/* -*- Mode: js; js-indent-level: 2; -*- */

/*
 * Copyright 2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE or:
 * http://opensource.org/licenses/BSD-3-Clause
 */

var base64VLQ$1 = base64Vlq;
var util$2 = util$5;
var ArraySet$1 = arraySet.ArraySet;
var MappingList = mappingList.MappingList;

/**
 * An instance of the SourceMapGenerator represents a source map which is
 * being built incrementally. You may pass an object with the following
 * properties:
 *
 *   - file: The filename of the generated source.
 *   - sourceRoot: A root for all relative URLs in this source map.
 */
function SourceMapGenerator$1(aArgs) {
  if (!aArgs) {
    aArgs = {};
  }
  this._file = util$2.getArg(aArgs, 'file', null);
  this._sourceRoot = util$2.getArg(aArgs, 'sourceRoot', null);
  this._skipValidation = util$2.getArg(aArgs, 'skipValidation', false);
  this._sources = new ArraySet$1();
  this._names = new ArraySet$1();
  this._mappings = new MappingList();
  this._sourcesContents = null;
}

SourceMapGenerator$1.prototype._version = 3;

/**
 * Creates a new SourceMapGenerator based on a SourceMapConsumer
 *
 * @param aSourceMapConsumer The SourceMap.
 */
SourceMapGenerator$1.fromSourceMap =
  function SourceMapGenerator_fromSourceMap(aSourceMapConsumer) {
    var sourceRoot = aSourceMapConsumer.sourceRoot;
    var generator = new SourceMapGenerator$1({
      file: aSourceMapConsumer.file,
      sourceRoot: sourceRoot
    });
    aSourceMapConsumer.eachMapping(function (mapping) {
      var newMapping = {
        generated: {
          line: mapping.generatedLine,
          column: mapping.generatedColumn
        }
      };

      if (mapping.source != null) {
        newMapping.source = mapping.source;
        if (sourceRoot != null) {
          newMapping.source = util$2.relative(sourceRoot, newMapping.source);
        }

        newMapping.original = {
          line: mapping.originalLine,
          column: mapping.originalColumn
        };

        if (mapping.name != null) {
          newMapping.name = mapping.name;
        }
      }

      generator.addMapping(newMapping);
    });
    aSourceMapConsumer.sources.forEach(function (sourceFile) {
      var sourceRelative = sourceFile;
      if (sourceRoot !== null) {
        sourceRelative = util$2.relative(sourceRoot, sourceFile);
      }

      if (!generator._sources.has(sourceRelative)) {
        generator._sources.add(sourceRelative);
      }

      var content = aSourceMapConsumer.sourceContentFor(sourceFile);
      if (content != null) {
        generator.setSourceContent(sourceFile, content);
      }
    });
    return generator;
  };

/**
 * Add a single mapping from original source line and column to the generated
 * source's line and column for this source map being created. The mapping
 * object should have the following properties:
 *
 *   - generated: An object with the generated line and column positions.
 *   - original: An object with the original line and column positions.
 *   - source: The original source file (relative to the sourceRoot).
 *   - name: An optional original token name for this mapping.
 */
SourceMapGenerator$1.prototype.addMapping =
  function SourceMapGenerator_addMapping(aArgs) {
    var generated = util$2.getArg(aArgs, 'generated');
    var original = util$2.getArg(aArgs, 'original', null);
    var source = util$2.getArg(aArgs, 'source', null);
    var name = util$2.getArg(aArgs, 'name', null);

    if (!this._skipValidation) {
      this._validateMapping(generated, original, source, name);
    }

    if (source != null) {
      source = String(source);
      if (!this._sources.has(source)) {
        this._sources.add(source);
      }
    }

    if (name != null) {
      name = String(name);
      if (!this._names.has(name)) {
        this._names.add(name);
      }
    }

    this._mappings.add({
      generatedLine: generated.line,
      generatedColumn: generated.column,
      originalLine: original != null && original.line,
      originalColumn: original != null && original.column,
      source: source,
      name: name
    });
  };

/**
 * Set the source content for a source file.
 */
SourceMapGenerator$1.prototype.setSourceContent =
  function SourceMapGenerator_setSourceContent(aSourceFile, aSourceContent) {
    var source = aSourceFile;
    if (this._sourceRoot != null) {
      source = util$2.relative(this._sourceRoot, source);
    }

    if (aSourceContent != null) {
      // Add the source content to the _sourcesContents map.
      // Create a new _sourcesContents map if the property is null.
      if (!this._sourcesContents) {
        this._sourcesContents = Object.create(null);
      }
      this._sourcesContents[util$2.toSetString(source)] = aSourceContent;
    } else if (this._sourcesContents) {
      // Remove the source file from the _sourcesContents map.
      // If the _sourcesContents map is empty, set the property to null.
      delete this._sourcesContents[util$2.toSetString(source)];
      if (Object.keys(this._sourcesContents).length === 0) {
        this._sourcesContents = null;
      }
    }
  };

/**
 * Applies the mappings of a sub-source-map for a specific source file to the
 * source map being generated. Each mapping to the supplied source file is
 * rewritten using the supplied source map. Note: The resolution for the
 * resulting mappings is the minimium of this map and the supplied map.
 *
 * @param aSourceMapConsumer The source map to be applied.
 * @param aSourceFile Optional. The filename of the source file.
 *        If omitted, SourceMapConsumer's file property will be used.
 * @param aSourceMapPath Optional. The dirname of the path to the source map
 *        to be applied. If relative, it is relative to the SourceMapConsumer.
 *        This parameter is needed when the two source maps aren't in the same
 *        directory, and the source map to be applied contains relative source
 *        paths. If so, those relative source paths need to be rewritten
 *        relative to the SourceMapGenerator.
 */
SourceMapGenerator$1.prototype.applySourceMap =
  function SourceMapGenerator_applySourceMap(aSourceMapConsumer, aSourceFile, aSourceMapPath) {
    var sourceFile = aSourceFile;
    // If aSourceFile is omitted, we will use the file property of the SourceMap
    if (aSourceFile == null) {
      if (aSourceMapConsumer.file == null) {
        throw new Error(
          'SourceMapGenerator.prototype.applySourceMap requires either an explicit source file, ' +
          'or the source map\'s "file" property. Both were omitted.'
        );
      }
      sourceFile = aSourceMapConsumer.file;
    }
    var sourceRoot = this._sourceRoot;
    // Make "sourceFile" relative if an absolute Url is passed.
    if (sourceRoot != null) {
      sourceFile = util$2.relative(sourceRoot, sourceFile);
    }
    // Applying the SourceMap can add and remove items from the sources and
    // the names array.
    var newSources = new ArraySet$1();
    var newNames = new ArraySet$1();

    // Find mappings for the "sourceFile"
    this._mappings.unsortedForEach(function (mapping) {
      if (mapping.source === sourceFile && mapping.originalLine != null) {
        // Check if it can be mapped by the source map, then update the mapping.
        var original = aSourceMapConsumer.originalPositionFor({
          line: mapping.originalLine,
          column: mapping.originalColumn
        });
        if (original.source != null) {
          // Copy mapping
          mapping.source = original.source;
          if (aSourceMapPath != null) {
            mapping.source = util$2.join(aSourceMapPath, mapping.source);
          }
          if (sourceRoot != null) {
            mapping.source = util$2.relative(sourceRoot, mapping.source);
          }
          mapping.originalLine = original.line;
          mapping.originalColumn = original.column;
          if (original.name != null) {
            mapping.name = original.name;
          }
        }
      }

      var source = mapping.source;
      if (source != null && !newSources.has(source)) {
        newSources.add(source);
      }

      var name = mapping.name;
      if (name != null && !newNames.has(name)) {
        newNames.add(name);
      }

    }, this);
    this._sources = newSources;
    this._names = newNames;

    // Copy sourcesContents of applied map.
    aSourceMapConsumer.sources.forEach(function (sourceFile) {
      var content = aSourceMapConsumer.sourceContentFor(sourceFile);
      if (content != null) {
        if (aSourceMapPath != null) {
          sourceFile = util$2.join(aSourceMapPath, sourceFile);
        }
        if (sourceRoot != null) {
          sourceFile = util$2.relative(sourceRoot, sourceFile);
        }
        this.setSourceContent(sourceFile, content);
      }
    }, this);
  };

/**
 * A mapping can have one of the three levels of data:
 *
 *   1. Just the generated position.
 *   2. The Generated position, original position, and original source.
 *   3. Generated and original position, original source, as well as a name
 *      token.
 *
 * To maintain consistency, we validate that any new mapping being added falls
 * in to one of these categories.
 */
SourceMapGenerator$1.prototype._validateMapping =
  function SourceMapGenerator_validateMapping(aGenerated, aOriginal, aSource,
                                              aName) {
    // When aOriginal is truthy but has empty values for .line and .column,
    // it is most likely a programmer error. In this case we throw a very
    // specific error message to try to guide them the right way.
    // For example: https://github.com/Polymer/polymer-bundler/pull/519
    if (aOriginal && typeof aOriginal.line !== 'number' && typeof aOriginal.column !== 'number') {
        throw new Error(
            'original.line and original.column are not numbers -- you probably meant to omit ' +
            'the original mapping entirely and only map the generated position. If so, pass ' +
            'null for the original mapping instead of an object with empty or null values.'
        );
    }

    if (aGenerated && 'line' in aGenerated && 'column' in aGenerated
        && aGenerated.line > 0 && aGenerated.column >= 0
        && !aOriginal && !aSource && !aName) {
      // Case 1.
      return;
    }
    else if (aGenerated && 'line' in aGenerated && 'column' in aGenerated
             && aOriginal && 'line' in aOriginal && 'column' in aOriginal
             && aGenerated.line > 0 && aGenerated.column >= 0
             && aOriginal.line > 0 && aOriginal.column >= 0
             && aSource) {
      // Cases 2 and 3.
      return;
    }
    else {
      throw new Error('Invalid mapping: ' + JSON.stringify({
        generated: aGenerated,
        source: aSource,
        original: aOriginal,
        name: aName
      }));
    }
  };

/**
 * Serialize the accumulated mappings in to the stream of base 64 VLQs
 * specified by the source map format.
 */
SourceMapGenerator$1.prototype._serializeMappings =
  function SourceMapGenerator_serializeMappings() {
    var previousGeneratedColumn = 0;
    var previousGeneratedLine = 1;
    var previousOriginalColumn = 0;
    var previousOriginalLine = 0;
    var previousName = 0;
    var previousSource = 0;
    var result = '';
    var next;
    var mapping;
    var nameIdx;
    var sourceIdx;

    var mappings = this._mappings.toArray();
    for (var i = 0, len = mappings.length; i < len; i++) {
      mapping = mappings[i];
      next = '';

      if (mapping.generatedLine !== previousGeneratedLine) {
        previousGeneratedColumn = 0;
        while (mapping.generatedLine !== previousGeneratedLine) {
          next += ';';
          previousGeneratedLine++;
        }
      }
      else {
        if (i > 0) {
          if (!util$2.compareByGeneratedPositionsInflated(mapping, mappings[i - 1])) {
            continue;
          }
          next += ',';
        }
      }

      next += base64VLQ$1.encode(mapping.generatedColumn
                                 - previousGeneratedColumn);
      previousGeneratedColumn = mapping.generatedColumn;

      if (mapping.source != null) {
        sourceIdx = this._sources.indexOf(mapping.source);
        next += base64VLQ$1.encode(sourceIdx - previousSource);
        previousSource = sourceIdx;

        // lines are stored 0-based in SourceMap spec version 3
        next += base64VLQ$1.encode(mapping.originalLine - 1
                                   - previousOriginalLine);
        previousOriginalLine = mapping.originalLine - 1;

        next += base64VLQ$1.encode(mapping.originalColumn
                                   - previousOriginalColumn);
        previousOriginalColumn = mapping.originalColumn;

        if (mapping.name != null) {
          nameIdx = this._names.indexOf(mapping.name);
          next += base64VLQ$1.encode(nameIdx - previousName);
          previousName = nameIdx;
        }
      }

      result += next;
    }

    return result;
  };

SourceMapGenerator$1.prototype._generateSourcesContent =
  function SourceMapGenerator_generateSourcesContent(aSources, aSourceRoot) {
    return aSources.map(function (source) {
      if (!this._sourcesContents) {
        return null;
      }
      if (aSourceRoot != null) {
        source = util$2.relative(aSourceRoot, source);
      }
      var key = util$2.toSetString(source);
      return Object.prototype.hasOwnProperty.call(this._sourcesContents, key)
        ? this._sourcesContents[key]
        : null;
    }, this);
  };

/**
 * Externalize the source map.
 */
SourceMapGenerator$1.prototype.toJSON =
  function SourceMapGenerator_toJSON() {
    var map = {
      version: this._version,
      sources: this._sources.toArray(),
      names: this._names.toArray(),
      mappings: this._serializeMappings()
    };
    if (this._file != null) {
      map.file = this._file;
    }
    if (this._sourceRoot != null) {
      map.sourceRoot = this._sourceRoot;
    }
    if (this._sourcesContents) {
      map.sourcesContent = this._generateSourcesContent(map.sources, map.sourceRoot);
    }

    return map;
  };

/**
 * Render the source map being generated to a string.
 */
SourceMapGenerator$1.prototype.toString =
  function SourceMapGenerator_toString() {
    return JSON.stringify(this.toJSON());
  };

sourceMapGenerator.SourceMapGenerator = SourceMapGenerator$1;

var sourceMapConsumer = {};

var binarySearch$1 = {};

/* -*- Mode: js; js-indent-level: 2; -*- */

(function (exports) {
/*
 * Copyright 2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE or:
 * http://opensource.org/licenses/BSD-3-Clause
 */

exports.GREATEST_LOWER_BOUND = 1;
exports.LEAST_UPPER_BOUND = 2;

/**
 * Recursive implementation of binary search.
 *
 * @param aLow Indices here and lower do not contain the needle.
 * @param aHigh Indices here and higher do not contain the needle.
 * @param aNeedle The element being searched for.
 * @param aHaystack The non-empty array being searched.
 * @param aCompare Function which takes two elements and returns -1, 0, or 1.
 * @param aBias Either 'binarySearch.GREATEST_LOWER_BOUND' or
 *     'binarySearch.LEAST_UPPER_BOUND'. Specifies whether to return the
 *     closest element that is smaller than or greater than the one we are
 *     searching for, respectively, if the exact element cannot be found.
 */
function recursiveSearch(aLow, aHigh, aNeedle, aHaystack, aCompare, aBias) {
  // This function terminates when one of the following is true:
  //
  //   1. We find the exact element we are looking for.
  //
  //   2. We did not find the exact element, but we can return the index of
  //      the next-closest element.
  //
  //   3. We did not find the exact element, and there is no next-closest
  //      element than the one we are searching for, so we return -1.
  var mid = Math.floor((aHigh - aLow) / 2) + aLow;
  var cmp = aCompare(aNeedle, aHaystack[mid], true);
  if (cmp === 0) {
    // Found the element we are looking for.
    return mid;
  }
  else if (cmp > 0) {
    // Our needle is greater than aHaystack[mid].
    if (aHigh - mid > 1) {
      // The element is in the upper half.
      return recursiveSearch(mid, aHigh, aNeedle, aHaystack, aCompare, aBias);
    }

    // The exact needle element was not found in this haystack. Determine if
    // we are in termination case (3) or (2) and return the appropriate thing.
    if (aBias == exports.LEAST_UPPER_BOUND) {
      return aHigh < aHaystack.length ? aHigh : -1;
    } else {
      return mid;
    }
  }
  else {
    // Our needle is less than aHaystack[mid].
    if (mid - aLow > 1) {
      // The element is in the lower half.
      return recursiveSearch(aLow, mid, aNeedle, aHaystack, aCompare, aBias);
    }

    // we are in termination case (3) or (2) and return the appropriate thing.
    if (aBias == exports.LEAST_UPPER_BOUND) {
      return mid;
    } else {
      return aLow < 0 ? -1 : aLow;
    }
  }
}

/**
 * This is an implementation of binary search which will always try and return
 * the index of the closest element if there is no exact hit. This is because
 * mappings between original and generated line/col pairs are single points,
 * and there is an implicit region between each of them, so a miss just means
 * that you aren't on the very start of a region.
 *
 * @param aNeedle The element you are looking for.
 * @param aHaystack The array that is being searched.
 * @param aCompare A function which takes the needle and an element in the
 *     array and returns -1, 0, or 1 depending on whether the needle is less
 *     than, equal to, or greater than the element, respectively.
 * @param aBias Either 'binarySearch.GREATEST_LOWER_BOUND' or
 *     'binarySearch.LEAST_UPPER_BOUND'. Specifies whether to return the
 *     closest element that is smaller than or greater than the one we are
 *     searching for, respectively, if the exact element cannot be found.
 *     Defaults to 'binarySearch.GREATEST_LOWER_BOUND'.
 */
exports.search = function search(aNeedle, aHaystack, aCompare, aBias) {
  if (aHaystack.length === 0) {
    return -1;
  }

  var index = recursiveSearch(-1, aHaystack.length, aNeedle, aHaystack,
                              aCompare, aBias || exports.GREATEST_LOWER_BOUND);
  if (index < 0) {
    return -1;
  }

  // We have found either the exact element, or the next-closest element than
  // the one we are searching for. However, there may be more than one such
  // element. Make sure we always return the smallest of these.
  while (index - 1 >= 0) {
    if (aCompare(aHaystack[index], aHaystack[index - 1], true) !== 0) {
      break;
    }
    --index;
  }

  return index;
};
}(binarySearch$1));

var quickSort$1 = {};

/* -*- Mode: js; js-indent-level: 2; -*- */

/*
 * Copyright 2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE or:
 * http://opensource.org/licenses/BSD-3-Clause
 */

// It turns out that some (most?) JavaScript engines don't self-host
// `Array.prototype.sort`. This makes sense because C++ will likely remain
// faster than JS when doing raw CPU-intensive sorting. However, when using a
// custom comparator function, calling back and forth between the VM's C++ and
// JIT'd JS is rather slow *and* loses JIT type information, resulting in
// worse generated code for the comparator function than would be optimal. In
// fact, when sorting with a comparator, these costs outweigh the benefits of
// sorting in C++. By using our own JS-implemented Quick Sort (below), we get
// a ~3500ms mean speed-up in `bench/bench.html`.

function SortTemplate(comparator) {

/**
 * Swap the elements indexed by `x` and `y` in the array `ary`.
 *
 * @param {Array} ary
 *        The array.
 * @param {Number} x
 *        The index of the first item.
 * @param {Number} y
 *        The index of the second item.
 */
function swap(ary, x, y) {
  var temp = ary[x];
  ary[x] = ary[y];
  ary[y] = temp;
}

/**
 * Returns a random integer within the range `low .. high` inclusive.
 *
 * @param {Number} low
 *        The lower bound on the range.
 * @param {Number} high
 *        The upper bound on the range.
 */
function randomIntInRange(low, high) {
  return Math.round(low + (Math.random() * (high - low)));
}

/**
 * The Quick Sort algorithm.
 *
 * @param {Array} ary
 *        An array to sort.
 * @param {function} comparator
 *        Function to use to compare two items.
 * @param {Number} p
 *        Start index of the array
 * @param {Number} r
 *        End index of the array
 */
function doQuickSort(ary, comparator, p, r) {
  // If our lower bound is less than our upper bound, we (1) partition the
  // array into two pieces and (2) recurse on each half. If it is not, this is
  // the empty array and our base case.

  if (p < r) {
    // (1) Partitioning.
    //
    // The partitioning chooses a pivot between `p` and `r` and moves all
    // elements that are less than or equal to the pivot to the before it, and
    // all the elements that are greater than it after it. The effect is that
    // once partition is done, the pivot is in the exact place it will be when
    // the array is put in sorted order, and it will not need to be moved
    // again. This runs in O(n) time.

    // Always choose a random pivot so that an input array which is reverse
    // sorted does not cause O(n^2) running time.
    var pivotIndex = randomIntInRange(p, r);
    var i = p - 1;

    swap(ary, pivotIndex, r);
    var pivot = ary[r];

    // Immediately after `j` is incremented in this loop, the following hold
    // true:
    //
    //   * Every element in `ary[p .. i]` is less than or equal to the pivot.
    //
    //   * Every element in `ary[i+1 .. j-1]` is greater than the pivot.
    for (var j = p; j < r; j++) {
      if (comparator(ary[j], pivot, false) <= 0) {
        i += 1;
        swap(ary, i, j);
      }
    }

    swap(ary, i + 1, j);
    var q = i + 1;

    // (2) Recurse on each half.

    doQuickSort(ary, comparator, p, q - 1);
    doQuickSort(ary, comparator, q + 1, r);
  }
}

  return doQuickSort;
}

function cloneSort(comparator) {
  let template = SortTemplate.toString();
  let templateFn = new Function(`return ${template}`)();
  return templateFn(comparator);
}

/**
 * Sort the given array in-place with the given comparator function.
 *
 * @param {Array} ary
 *        An array to sort.
 * @param {function} comparator
 *        Function to use to compare two items.
 */

let sortCache = new WeakMap();
quickSort$1.quickSort = function (ary, comparator, start = 0) {
  let doQuickSort = sortCache.get(comparator);
  if (doQuickSort === void 0) {
    doQuickSort = cloneSort(comparator);
    sortCache.set(comparator, doQuickSort);
  }
  doQuickSort(ary, comparator, start, ary.length - 1);
};

/* -*- Mode: js; js-indent-level: 2; -*- */

/*
 * Copyright 2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE or:
 * http://opensource.org/licenses/BSD-3-Clause
 */

var util$1 = util$5;
var binarySearch = binarySearch$1;
var ArraySet = arraySet.ArraySet;
var base64VLQ = base64Vlq;
var quickSort = quickSort$1.quickSort;

function SourceMapConsumer$1(aSourceMap, aSourceMapURL) {
  var sourceMap = aSourceMap;
  if (typeof aSourceMap === 'string') {
    sourceMap = util$1.parseSourceMapInput(aSourceMap);
  }

  return sourceMap.sections != null
    ? new IndexedSourceMapConsumer(sourceMap, aSourceMapURL)
    : new BasicSourceMapConsumer(sourceMap, aSourceMapURL);
}

SourceMapConsumer$1.fromSourceMap = function(aSourceMap, aSourceMapURL) {
  return BasicSourceMapConsumer.fromSourceMap(aSourceMap, aSourceMapURL);
};

/**
 * The version of the source mapping spec that we are consuming.
 */
SourceMapConsumer$1.prototype._version = 3;

// `__generatedMappings` and `__originalMappings` are arrays that hold the
// parsed mapping coordinates from the source map's "mappings" attribute. They
// are lazily instantiated, accessed via the `_generatedMappings` and
// `_originalMappings` getters respectively, and we only parse the mappings
// and create these arrays once queried for a source location. We jump through
// these hoops because there can be many thousands of mappings, and parsing
// them is expensive, so we only want to do it if we must.
//
// Each object in the arrays is of the form:
//
//     {
//       generatedLine: The line number in the generated code,
//       generatedColumn: The column number in the generated code,
//       source: The path to the original source file that generated this
//               chunk of code,
//       originalLine: The line number in the original source that
//                     corresponds to this chunk of generated code,
//       originalColumn: The column number in the original source that
//                       corresponds to this chunk of generated code,
//       name: The name of the original symbol which generated this chunk of
//             code.
//     }
//
// All properties except for `generatedLine` and `generatedColumn` can be
// `null`.
//
// `_generatedMappings` is ordered by the generated positions.
//
// `_originalMappings` is ordered by the original positions.

SourceMapConsumer$1.prototype.__generatedMappings = null;
Object.defineProperty(SourceMapConsumer$1.prototype, '_generatedMappings', {
  configurable: true,
  enumerable: true,
  get: function () {
    if (!this.__generatedMappings) {
      this._parseMappings(this._mappings, this.sourceRoot);
    }

    return this.__generatedMappings;
  }
});

SourceMapConsumer$1.prototype.__originalMappings = null;
Object.defineProperty(SourceMapConsumer$1.prototype, '_originalMappings', {
  configurable: true,
  enumerable: true,
  get: function () {
    if (!this.__originalMappings) {
      this._parseMappings(this._mappings, this.sourceRoot);
    }

    return this.__originalMappings;
  }
});

SourceMapConsumer$1.prototype._charIsMappingSeparator =
  function SourceMapConsumer_charIsMappingSeparator(aStr, index) {
    var c = aStr.charAt(index);
    return c === ";" || c === ",";
  };

/**
 * Parse the mappings in a string in to a data structure which we can easily
 * query (the ordered arrays in the `this.__generatedMappings` and
 * `this.__originalMappings` properties).
 */
SourceMapConsumer$1.prototype._parseMappings =
  function SourceMapConsumer_parseMappings(aStr, aSourceRoot) {
    throw new Error("Subclasses must implement _parseMappings");
  };

SourceMapConsumer$1.GENERATED_ORDER = 1;
SourceMapConsumer$1.ORIGINAL_ORDER = 2;

SourceMapConsumer$1.GREATEST_LOWER_BOUND = 1;
SourceMapConsumer$1.LEAST_UPPER_BOUND = 2;

/**
 * Iterate over each mapping between an original source/line/column and a
 * generated line/column in this source map.
 *
 * @param Function aCallback
 *        The function that is called with each mapping.
 * @param Object aContext
 *        Optional. If specified, this object will be the value of `this` every
 *        time that `aCallback` is called.
 * @param aOrder
 *        Either `SourceMapConsumer.GENERATED_ORDER` or
 *        `SourceMapConsumer.ORIGINAL_ORDER`. Specifies whether you want to
 *        iterate over the mappings sorted by the generated file's line/column
 *        order or the original's source/line/column order, respectively. Defaults to
 *        `SourceMapConsumer.GENERATED_ORDER`.
 */
SourceMapConsumer$1.prototype.eachMapping =
  function SourceMapConsumer_eachMapping(aCallback, aContext, aOrder) {
    var context = aContext || null;
    var order = aOrder || SourceMapConsumer$1.GENERATED_ORDER;

    var mappings;
    switch (order) {
    case SourceMapConsumer$1.GENERATED_ORDER:
      mappings = this._generatedMappings;
      break;
    case SourceMapConsumer$1.ORIGINAL_ORDER:
      mappings = this._originalMappings;
      break;
    default:
      throw new Error("Unknown order of iteration.");
    }

    var sourceRoot = this.sourceRoot;
    var boundCallback = aCallback.bind(context);
    var names = this._names;
    var sources = this._sources;
    var sourceMapURL = this._sourceMapURL;

    for (var i = 0, n = mappings.length; i < n; i++) {
      var mapping = mappings[i];
      var source = mapping.source === null ? null : sources.at(mapping.source);
      source = util$1.computeSourceURL(sourceRoot, source, sourceMapURL);
      boundCallback({
        source: source,
        generatedLine: mapping.generatedLine,
        generatedColumn: mapping.generatedColumn,
        originalLine: mapping.originalLine,
        originalColumn: mapping.originalColumn,
        name: mapping.name === null ? null : names.at(mapping.name)
      });
    }
  };

/**
 * Returns all generated line and column information for the original source,
 * line, and column provided. If no column is provided, returns all mappings
 * corresponding to a either the line we are searching for or the next
 * closest line that has any mappings. Otherwise, returns all mappings
 * corresponding to the given line and either the column we are searching for
 * or the next closest column that has any offsets.
 *
 * The only argument is an object with the following properties:
 *
 *   - source: The filename of the original source.
 *   - line: The line number in the original source.  The line number is 1-based.
 *   - column: Optional. the column number in the original source.
 *    The column number is 0-based.
 *
 * and an array of objects is returned, each with the following properties:
 *
 *   - line: The line number in the generated source, or null.  The
 *    line number is 1-based.
 *   - column: The column number in the generated source, or null.
 *    The column number is 0-based.
 */
SourceMapConsumer$1.prototype.allGeneratedPositionsFor =
  function SourceMapConsumer_allGeneratedPositionsFor(aArgs) {
    var line = util$1.getArg(aArgs, 'line');

    // When there is no exact match, BasicSourceMapConsumer.prototype._findMapping
    // returns the index of the closest mapping less than the needle. By
    // setting needle.originalColumn to 0, we thus find the last mapping for
    // the given line, provided such a mapping exists.
    var needle = {
      source: util$1.getArg(aArgs, 'source'),
      originalLine: line,
      originalColumn: util$1.getArg(aArgs, 'column', 0)
    };

    needle.source = this._findSourceIndex(needle.source);
    if (needle.source < 0) {
      return [];
    }

    var mappings = [];

    var index = this._findMapping(needle,
                                  this._originalMappings,
                                  "originalLine",
                                  "originalColumn",
                                  util$1.compareByOriginalPositions,
                                  binarySearch.LEAST_UPPER_BOUND);
    if (index >= 0) {
      var mapping = this._originalMappings[index];

      if (aArgs.column === undefined) {
        var originalLine = mapping.originalLine;

        // Iterate until either we run out of mappings, or we run into
        // a mapping for a different line than the one we found. Since
        // mappings are sorted, this is guaranteed to find all mappings for
        // the line we found.
        while (mapping && mapping.originalLine === originalLine) {
          mappings.push({
            line: util$1.getArg(mapping, 'generatedLine', null),
            column: util$1.getArg(mapping, 'generatedColumn', null),
            lastColumn: util$1.getArg(mapping, 'lastGeneratedColumn', null)
          });

          mapping = this._originalMappings[++index];
        }
      } else {
        var originalColumn = mapping.originalColumn;

        // Iterate until either we run out of mappings, or we run into
        // a mapping for a different line than the one we were searching for.
        // Since mappings are sorted, this is guaranteed to find all mappings for
        // the line we are searching for.
        while (mapping &&
               mapping.originalLine === line &&
               mapping.originalColumn == originalColumn) {
          mappings.push({
            line: util$1.getArg(mapping, 'generatedLine', null),
            column: util$1.getArg(mapping, 'generatedColumn', null),
            lastColumn: util$1.getArg(mapping, 'lastGeneratedColumn', null)
          });

          mapping = this._originalMappings[++index];
        }
      }
    }

    return mappings;
  };

sourceMapConsumer.SourceMapConsumer = SourceMapConsumer$1;

/**
 * A BasicSourceMapConsumer instance represents a parsed source map which we can
 * query for information about the original file positions by giving it a file
 * position in the generated source.
 *
 * The first parameter is the raw source map (either as a JSON string, or
 * already parsed to an object). According to the spec, source maps have the
 * following attributes:
 *
 *   - version: Which version of the source map spec this map is following.
 *   - sources: An array of URLs to the original source files.
 *   - names: An array of identifiers which can be referrenced by individual mappings.
 *   - sourceRoot: Optional. The URL root from which all sources are relative.
 *   - sourcesContent: Optional. An array of contents of the original source files.
 *   - mappings: A string of base64 VLQs which contain the actual mappings.
 *   - file: Optional. The generated file this source map is associated with.
 *
 * Here is an example source map, taken from the source map spec[0]:
 *
 *     {
 *       version : 3,
 *       file: "out.js",
 *       sourceRoot : "",
 *       sources: ["foo.js", "bar.js"],
 *       names: ["src", "maps", "are", "fun"],
 *       mappings: "AA,AB;;ABCDE;"
 *     }
 *
 * The second parameter, if given, is a string whose value is the URL
 * at which the source map was found.  This URL is used to compute the
 * sources array.
 *
 * [0]: https://docs.google.com/document/d/1U1RGAehQwRypUTovF1KRlpiOFze0b-_2gc6fAH0KY0k/edit?pli=1#
 */
function BasicSourceMapConsumer(aSourceMap, aSourceMapURL) {
  var sourceMap = aSourceMap;
  if (typeof aSourceMap === 'string') {
    sourceMap = util$1.parseSourceMapInput(aSourceMap);
  }

  var version = util$1.getArg(sourceMap, 'version');
  var sources = util$1.getArg(sourceMap, 'sources');
  // Sass 3.3 leaves out the 'names' array, so we deviate from the spec (which
  // requires the array) to play nice here.
  var names = util$1.getArg(sourceMap, 'names', []);
  var sourceRoot = util$1.getArg(sourceMap, 'sourceRoot', null);
  var sourcesContent = util$1.getArg(sourceMap, 'sourcesContent', null);
  var mappings = util$1.getArg(sourceMap, 'mappings');
  var file = util$1.getArg(sourceMap, 'file', null);

  // Once again, Sass deviates from the spec and supplies the version as a
  // string rather than a number, so we use loose equality checking here.
  if (version != this._version) {
    throw new Error('Unsupported version: ' + version);
  }

  if (sourceRoot) {
    sourceRoot = util$1.normalize(sourceRoot);
  }

  sources = sources
    .map(String)
    // Some source maps produce relative source paths like "./foo.js" instead of
    // "foo.js".  Normalize these first so that future comparisons will succeed.
    // See bugzil.la/1090768.
    .map(util$1.normalize)
    // Always ensure that absolute sources are internally stored relative to
    // the source root, if the source root is absolute. Not doing this would
    // be particularly problematic when the source root is a prefix of the
    // source (valid, but why??). See github issue #199 and bugzil.la/1188982.
    .map(function (source) {
      return sourceRoot && util$1.isAbsolute(sourceRoot) && util$1.isAbsolute(source)
        ? util$1.relative(sourceRoot, source)
        : source;
    });

  // Pass `true` below to allow duplicate names and sources. While source maps
  // are intended to be compressed and deduplicated, the TypeScript compiler
  // sometimes generates source maps with duplicates in them. See Github issue
  // #72 and bugzil.la/889492.
  this._names = ArraySet.fromArray(names.map(String), true);
  this._sources = ArraySet.fromArray(sources, true);

  this._absoluteSources = this._sources.toArray().map(function (s) {
    return util$1.computeSourceURL(sourceRoot, s, aSourceMapURL);
  });

  this.sourceRoot = sourceRoot;
  this.sourcesContent = sourcesContent;
  this._mappings = mappings;
  this._sourceMapURL = aSourceMapURL;
  this.file = file;
}

BasicSourceMapConsumer.prototype = Object.create(SourceMapConsumer$1.prototype);
BasicSourceMapConsumer.prototype.consumer = SourceMapConsumer$1;

/**
 * Utility function to find the index of a source.  Returns -1 if not
 * found.
 */
BasicSourceMapConsumer.prototype._findSourceIndex = function(aSource) {
  var relativeSource = aSource;
  if (this.sourceRoot != null) {
    relativeSource = util$1.relative(this.sourceRoot, relativeSource);
  }

  if (this._sources.has(relativeSource)) {
    return this._sources.indexOf(relativeSource);
  }

  // Maybe aSource is an absolute URL as returned by |sources|.  In
  // this case we can't simply undo the transform.
  var i;
  for (i = 0; i < this._absoluteSources.length; ++i) {
    if (this._absoluteSources[i] == aSource) {
      return i;
    }
  }

  return -1;
};

/**
 * Create a BasicSourceMapConsumer from a SourceMapGenerator.
 *
 * @param SourceMapGenerator aSourceMap
 *        The source map that will be consumed.
 * @param String aSourceMapURL
 *        The URL at which the source map can be found (optional)
 * @returns BasicSourceMapConsumer
 */
BasicSourceMapConsumer.fromSourceMap =
  function SourceMapConsumer_fromSourceMap(aSourceMap, aSourceMapURL) {
    var smc = Object.create(BasicSourceMapConsumer.prototype);

    var names = smc._names = ArraySet.fromArray(aSourceMap._names.toArray(), true);
    var sources = smc._sources = ArraySet.fromArray(aSourceMap._sources.toArray(), true);
    smc.sourceRoot = aSourceMap._sourceRoot;
    smc.sourcesContent = aSourceMap._generateSourcesContent(smc._sources.toArray(),
                                                            smc.sourceRoot);
    smc.file = aSourceMap._file;
    smc._sourceMapURL = aSourceMapURL;
    smc._absoluteSources = smc._sources.toArray().map(function (s) {
      return util$1.computeSourceURL(smc.sourceRoot, s, aSourceMapURL);
    });

    // Because we are modifying the entries (by converting string sources and
    // names to indices into the sources and names ArraySets), we have to make
    // a copy of the entry or else bad things happen. Shared mutable state
    // strikes again! See github issue #191.

    var generatedMappings = aSourceMap._mappings.toArray().slice();
    var destGeneratedMappings = smc.__generatedMappings = [];
    var destOriginalMappings = smc.__originalMappings = [];

    for (var i = 0, length = generatedMappings.length; i < length; i++) {
      var srcMapping = generatedMappings[i];
      var destMapping = new Mapping;
      destMapping.generatedLine = srcMapping.generatedLine;
      destMapping.generatedColumn = srcMapping.generatedColumn;

      if (srcMapping.source) {
        destMapping.source = sources.indexOf(srcMapping.source);
        destMapping.originalLine = srcMapping.originalLine;
        destMapping.originalColumn = srcMapping.originalColumn;

        if (srcMapping.name) {
          destMapping.name = names.indexOf(srcMapping.name);
        }

        destOriginalMappings.push(destMapping);
      }

      destGeneratedMappings.push(destMapping);
    }

    quickSort(smc.__originalMappings, util$1.compareByOriginalPositions);

    return smc;
  };

/**
 * The version of the source mapping spec that we are consuming.
 */
BasicSourceMapConsumer.prototype._version = 3;

/**
 * The list of original sources.
 */
Object.defineProperty(BasicSourceMapConsumer.prototype, 'sources', {
  get: function () {
    return this._absoluteSources.slice();
  }
});

/**
 * Provide the JIT with a nice shape / hidden class.
 */
function Mapping() {
  this.generatedLine = 0;
  this.generatedColumn = 0;
  this.source = null;
  this.originalLine = null;
  this.originalColumn = null;
  this.name = null;
}

/**
 * Parse the mappings in a string in to a data structure which we can easily
 * query (the ordered arrays in the `this.__generatedMappings` and
 * `this.__originalMappings` properties).
 */

const compareGenerated = util$1.compareByGeneratedPositionsDeflatedNoLine;
function sortGenerated(array, start) {
  let l = array.length;
  let n = array.length - start;
  if (n <= 1) {
    return;
  } else if (n == 2) {
    let a = array[start];
    let b = array[start + 1];
    if (compareGenerated(a, b) > 0) {
      array[start] = b;
      array[start + 1] = a;
    }
  } else if (n < 20) {
    for (let i = start; i < l; i++) {
      for (let j = i; j > start; j--) {
        let a = array[j - 1];
        let b = array[j];
        if (compareGenerated(a, b) <= 0) {
          break;
        }
        array[j - 1] = b;
        array[j] = a;
      }
    }
  } else {
    quickSort(array, compareGenerated, start);
  }
}
BasicSourceMapConsumer.prototype._parseMappings =
  function SourceMapConsumer_parseMappings(aStr, aSourceRoot) {
    var generatedLine = 1;
    var previousGeneratedColumn = 0;
    var previousOriginalLine = 0;
    var previousOriginalColumn = 0;
    var previousSource = 0;
    var previousName = 0;
    var length = aStr.length;
    var index = 0;
    var temp = {};
    var originalMappings = [];
    var generatedMappings = [];
    var mapping, segment, end, value;

    let subarrayStart = 0;
    while (index < length) {
      if (aStr.charAt(index) === ';') {
        generatedLine++;
        index++;
        previousGeneratedColumn = 0;

        sortGenerated(generatedMappings, subarrayStart);
        subarrayStart = generatedMappings.length;
      }
      else if (aStr.charAt(index) === ',') {
        index++;
      }
      else {
        mapping = new Mapping();
        mapping.generatedLine = generatedLine;

        for (end = index; end < length; end++) {
          if (this._charIsMappingSeparator(aStr, end)) {
            break;
          }
        }
        aStr.slice(index, end);

        segment = [];
        while (index < end) {
          base64VLQ.decode(aStr, index, temp);
          value = temp.value;
          index = temp.rest;
          segment.push(value);
        }

        if (segment.length === 2) {
          throw new Error('Found a source, but no line and column');
        }

        if (segment.length === 3) {
          throw new Error('Found a source and line, but no column');
        }

        // Generated column.
        mapping.generatedColumn = previousGeneratedColumn + segment[0];
        previousGeneratedColumn = mapping.generatedColumn;

        if (segment.length > 1) {
          // Original source.
          mapping.source = previousSource + segment[1];
          previousSource += segment[1];

          // Original line.
          mapping.originalLine = previousOriginalLine + segment[2];
          previousOriginalLine = mapping.originalLine;
          // Lines are stored 0-based
          mapping.originalLine += 1;

          // Original column.
          mapping.originalColumn = previousOriginalColumn + segment[3];
          previousOriginalColumn = mapping.originalColumn;

          if (segment.length > 4) {
            // Original name.
            mapping.name = previousName + segment[4];
            previousName += segment[4];
          }
        }

        generatedMappings.push(mapping);
        if (typeof mapping.originalLine === 'number') {
          let currentSource = mapping.source;
          while (originalMappings.length <= currentSource) {
            originalMappings.push(null);
          }
          if (originalMappings[currentSource] === null) {
            originalMappings[currentSource] = [];
          }
          originalMappings[currentSource].push(mapping);
        }
      }
    }

    sortGenerated(generatedMappings, subarrayStart);
    this.__generatedMappings = generatedMappings;

    for (var i = 0; i < originalMappings.length; i++) {
      if (originalMappings[i] != null) {
        quickSort(originalMappings[i], util$1.compareByOriginalPositionsNoSource);
      }
    }
    this.__originalMappings = [].concat(...originalMappings);
  };

/**
 * Find the mapping that best matches the hypothetical "needle" mapping that
 * we are searching for in the given "haystack" of mappings.
 */
BasicSourceMapConsumer.prototype._findMapping =
  function SourceMapConsumer_findMapping(aNeedle, aMappings, aLineName,
                                         aColumnName, aComparator, aBias) {
    // To return the position we are searching for, we must first find the
    // mapping for the given position and then return the opposite position it
    // points to. Because the mappings are sorted, we can use binary search to
    // find the best mapping.

    if (aNeedle[aLineName] <= 0) {
      throw new TypeError('Line must be greater than or equal to 1, got '
                          + aNeedle[aLineName]);
    }
    if (aNeedle[aColumnName] < 0) {
      throw new TypeError('Column must be greater than or equal to 0, got '
                          + aNeedle[aColumnName]);
    }

    return binarySearch.search(aNeedle, aMappings, aComparator, aBias);
  };

/**
 * Compute the last column for each generated mapping. The last column is
 * inclusive.
 */
BasicSourceMapConsumer.prototype.computeColumnSpans =
  function SourceMapConsumer_computeColumnSpans() {
    for (var index = 0; index < this._generatedMappings.length; ++index) {
      var mapping = this._generatedMappings[index];

      // Mappings do not contain a field for the last generated columnt. We
      // can come up with an optimistic estimate, however, by assuming that
      // mappings are contiguous (i.e. given two consecutive mappings, the
      // first mapping ends where the second one starts).
      if (index + 1 < this._generatedMappings.length) {
        var nextMapping = this._generatedMappings[index + 1];

        if (mapping.generatedLine === nextMapping.generatedLine) {
          mapping.lastGeneratedColumn = nextMapping.generatedColumn - 1;
          continue;
        }
      }

      // The last mapping for each line spans the entire line.
      mapping.lastGeneratedColumn = Infinity;
    }
  };

/**
 * Returns the original source, line, and column information for the generated
 * source's line and column positions provided. The only argument is an object
 * with the following properties:
 *
 *   - line: The line number in the generated source.  The line number
 *     is 1-based.
 *   - column: The column number in the generated source.  The column
 *     number is 0-based.
 *   - bias: Either 'SourceMapConsumer.GREATEST_LOWER_BOUND' or
 *     'SourceMapConsumer.LEAST_UPPER_BOUND'. Specifies whether to return the
 *     closest element that is smaller than or greater than the one we are
 *     searching for, respectively, if the exact element cannot be found.
 *     Defaults to 'SourceMapConsumer.GREATEST_LOWER_BOUND'.
 *
 * and an object is returned with the following properties:
 *
 *   - source: The original source file, or null.
 *   - line: The line number in the original source, or null.  The
 *     line number is 1-based.
 *   - column: The column number in the original source, or null.  The
 *     column number is 0-based.
 *   - name: The original identifier, or null.
 */
BasicSourceMapConsumer.prototype.originalPositionFor =
  function SourceMapConsumer_originalPositionFor(aArgs) {
    var needle = {
      generatedLine: util$1.getArg(aArgs, 'line'),
      generatedColumn: util$1.getArg(aArgs, 'column')
    };

    var index = this._findMapping(
      needle,
      this._generatedMappings,
      "generatedLine",
      "generatedColumn",
      util$1.compareByGeneratedPositionsDeflated,
      util$1.getArg(aArgs, 'bias', SourceMapConsumer$1.GREATEST_LOWER_BOUND)
    );

    if (index >= 0) {
      var mapping = this._generatedMappings[index];

      if (mapping.generatedLine === needle.generatedLine) {
        var source = util$1.getArg(mapping, 'source', null);
        if (source !== null) {
          source = this._sources.at(source);
          source = util$1.computeSourceURL(this.sourceRoot, source, this._sourceMapURL);
        }
        var name = util$1.getArg(mapping, 'name', null);
        if (name !== null) {
          name = this._names.at(name);
        }
        return {
          source: source,
          line: util$1.getArg(mapping, 'originalLine', null),
          column: util$1.getArg(mapping, 'originalColumn', null),
          name: name
        };
      }
    }

    return {
      source: null,
      line: null,
      column: null,
      name: null
    };
  };

/**
 * Return true if we have the source content for every source in the source
 * map, false otherwise.
 */
BasicSourceMapConsumer.prototype.hasContentsOfAllSources =
  function BasicSourceMapConsumer_hasContentsOfAllSources() {
    if (!this.sourcesContent) {
      return false;
    }
    return this.sourcesContent.length >= this._sources.size() &&
      !this.sourcesContent.some(function (sc) { return sc == null; });
  };

/**
 * Returns the original source content. The only argument is the url of the
 * original source file. Returns null if no original source content is
 * available.
 */
BasicSourceMapConsumer.prototype.sourceContentFor =
  function SourceMapConsumer_sourceContentFor(aSource, nullOnMissing) {
    if (!this.sourcesContent) {
      return null;
    }

    var index = this._findSourceIndex(aSource);
    if (index >= 0) {
      return this.sourcesContent[index];
    }

    var relativeSource = aSource;
    if (this.sourceRoot != null) {
      relativeSource = util$1.relative(this.sourceRoot, relativeSource);
    }

    var url;
    if (this.sourceRoot != null
        && (url = util$1.urlParse(this.sourceRoot))) {
      // XXX: file:// URIs and absolute paths lead to unexpected behavior for
      // many users. We can help them out when they expect file:// URIs to
      // behave like it would if they were running a local HTTP server. See
      // https://bugzilla.mozilla.org/show_bug.cgi?id=885597.
      var fileUriAbsPath = relativeSource.replace(/^file:\/\//, "");
      if (url.scheme == "file"
          && this._sources.has(fileUriAbsPath)) {
        return this.sourcesContent[this._sources.indexOf(fileUriAbsPath)]
      }

      if ((!url.path || url.path == "/")
          && this._sources.has("/" + relativeSource)) {
        return this.sourcesContent[this._sources.indexOf("/" + relativeSource)];
      }
    }

    // This function is used recursively from
    // IndexedSourceMapConsumer.prototype.sourceContentFor. In that case, we
    // don't want to throw if we can't find the source - we just want to
    // return null, so we provide a flag to exit gracefully.
    if (nullOnMissing) {
      return null;
    }
    else {
      throw new Error('"' + relativeSource + '" is not in the SourceMap.');
    }
  };

/**
 * Returns the generated line and column information for the original source,
 * line, and column positions provided. The only argument is an object with
 * the following properties:
 *
 *   - source: The filename of the original source.
 *   - line: The line number in the original source.  The line number
 *     is 1-based.
 *   - column: The column number in the original source.  The column
 *     number is 0-based.
 *   - bias: Either 'SourceMapConsumer.GREATEST_LOWER_BOUND' or
 *     'SourceMapConsumer.LEAST_UPPER_BOUND'. Specifies whether to return the
 *     closest element that is smaller than or greater than the one we are
 *     searching for, respectively, if the exact element cannot be found.
 *     Defaults to 'SourceMapConsumer.GREATEST_LOWER_BOUND'.
 *
 * and an object is returned with the following properties:
 *
 *   - line: The line number in the generated source, or null.  The
 *     line number is 1-based.
 *   - column: The column number in the generated source, or null.
 *     The column number is 0-based.
 */
BasicSourceMapConsumer.prototype.generatedPositionFor =
  function SourceMapConsumer_generatedPositionFor(aArgs) {
    var source = util$1.getArg(aArgs, 'source');
    source = this._findSourceIndex(source);
    if (source < 0) {
      return {
        line: null,
        column: null,
        lastColumn: null
      };
    }

    var needle = {
      source: source,
      originalLine: util$1.getArg(aArgs, 'line'),
      originalColumn: util$1.getArg(aArgs, 'column')
    };

    var index = this._findMapping(
      needle,
      this._originalMappings,
      "originalLine",
      "originalColumn",
      util$1.compareByOriginalPositions,
      util$1.getArg(aArgs, 'bias', SourceMapConsumer$1.GREATEST_LOWER_BOUND)
    );

    if (index >= 0) {
      var mapping = this._originalMappings[index];

      if (mapping.source === needle.source) {
        return {
          line: util$1.getArg(mapping, 'generatedLine', null),
          column: util$1.getArg(mapping, 'generatedColumn', null),
          lastColumn: util$1.getArg(mapping, 'lastGeneratedColumn', null)
        };
      }
    }

    return {
      line: null,
      column: null,
      lastColumn: null
    };
  };

sourceMapConsumer.BasicSourceMapConsumer = BasicSourceMapConsumer;

/**
 * An IndexedSourceMapConsumer instance represents a parsed source map which
 * we can query for information. It differs from BasicSourceMapConsumer in
 * that it takes "indexed" source maps (i.e. ones with a "sections" field) as
 * input.
 *
 * The first parameter is a raw source map (either as a JSON string, or already
 * parsed to an object). According to the spec for indexed source maps, they
 * have the following attributes:
 *
 *   - version: Which version of the source map spec this map is following.
 *   - file: Optional. The generated file this source map is associated with.
 *   - sections: A list of section definitions.
 *
 * Each value under the "sections" field has two fields:
 *   - offset: The offset into the original specified at which this section
 *       begins to apply, defined as an object with a "line" and "column"
 *       field.
 *   - map: A source map definition. This source map could also be indexed,
 *       but doesn't have to be.
 *
 * Instead of the "map" field, it's also possible to have a "url" field
 * specifying a URL to retrieve a source map from, but that's currently
 * unsupported.
 *
 * Here's an example source map, taken from the source map spec[0], but
 * modified to omit a section which uses the "url" field.
 *
 *  {
 *    version : 3,
 *    file: "app.js",
 *    sections: [{
 *      offset: {line:100, column:10},
 *      map: {
 *        version : 3,
 *        file: "section.js",
 *        sources: ["foo.js", "bar.js"],
 *        names: ["src", "maps", "are", "fun"],
 *        mappings: "AAAA,E;;ABCDE;"
 *      }
 *    }],
 *  }
 *
 * The second parameter, if given, is a string whose value is the URL
 * at which the source map was found.  This URL is used to compute the
 * sources array.
 *
 * [0]: https://docs.google.com/document/d/1U1RGAehQwRypUTovF1KRlpiOFze0b-_2gc6fAH0KY0k/edit#heading=h.535es3xeprgt
 */
function IndexedSourceMapConsumer(aSourceMap, aSourceMapURL) {
  var sourceMap = aSourceMap;
  if (typeof aSourceMap === 'string') {
    sourceMap = util$1.parseSourceMapInput(aSourceMap);
  }

  var version = util$1.getArg(sourceMap, 'version');
  var sections = util$1.getArg(sourceMap, 'sections');

  if (version != this._version) {
    throw new Error('Unsupported version: ' + version);
  }

  this._sources = new ArraySet();
  this._names = new ArraySet();

  var lastOffset = {
    line: -1,
    column: 0
  };
  this._sections = sections.map(function (s) {
    if (s.url) {
      // The url field will require support for asynchronicity.
      // See https://github.com/mozilla/source-map/issues/16
      throw new Error('Support for url field in sections not implemented.');
    }
    var offset = util$1.getArg(s, 'offset');
    var offsetLine = util$1.getArg(offset, 'line');
    var offsetColumn = util$1.getArg(offset, 'column');

    if (offsetLine < lastOffset.line ||
        (offsetLine === lastOffset.line && offsetColumn < lastOffset.column)) {
      throw new Error('Section offsets must be ordered and non-overlapping.');
    }
    lastOffset = offset;

    return {
      generatedOffset: {
        // The offset fields are 0-based, but we use 1-based indices when
        // encoding/decoding from VLQ.
        generatedLine: offsetLine + 1,
        generatedColumn: offsetColumn + 1
      },
      consumer: new SourceMapConsumer$1(util$1.getArg(s, 'map'), aSourceMapURL)
    }
  });
}

IndexedSourceMapConsumer.prototype = Object.create(SourceMapConsumer$1.prototype);
IndexedSourceMapConsumer.prototype.constructor = SourceMapConsumer$1;

/**
 * The version of the source mapping spec that we are consuming.
 */
IndexedSourceMapConsumer.prototype._version = 3;

/**
 * The list of original sources.
 */
Object.defineProperty(IndexedSourceMapConsumer.prototype, 'sources', {
  get: function () {
    var sources = [];
    for (var i = 0; i < this._sections.length; i++) {
      for (var j = 0; j < this._sections[i].consumer.sources.length; j++) {
        sources.push(this._sections[i].consumer.sources[j]);
      }
    }
    return sources;
  }
});

/**
 * Returns the original source, line, and column information for the generated
 * source's line and column positions provided. The only argument is an object
 * with the following properties:
 *
 *   - line: The line number in the generated source.  The line number
 *     is 1-based.
 *   - column: The column number in the generated source.  The column
 *     number is 0-based.
 *
 * and an object is returned with the following properties:
 *
 *   - source: The original source file, or null.
 *   - line: The line number in the original source, or null.  The
 *     line number is 1-based.
 *   - column: The column number in the original source, or null.  The
 *     column number is 0-based.
 *   - name: The original identifier, or null.
 */
IndexedSourceMapConsumer.prototype.originalPositionFor =
  function IndexedSourceMapConsumer_originalPositionFor(aArgs) {
    var needle = {
      generatedLine: util$1.getArg(aArgs, 'line'),
      generatedColumn: util$1.getArg(aArgs, 'column')
    };

    // Find the section containing the generated position we're trying to map
    // to an original position.
    var sectionIndex = binarySearch.search(needle, this._sections,
      function(needle, section) {
        var cmp = needle.generatedLine - section.generatedOffset.generatedLine;
        if (cmp) {
          return cmp;
        }

        return (needle.generatedColumn -
                section.generatedOffset.generatedColumn);
      });
    var section = this._sections[sectionIndex];

    if (!section) {
      return {
        source: null,
        line: null,
        column: null,
        name: null
      };
    }

    return section.consumer.originalPositionFor({
      line: needle.generatedLine -
        (section.generatedOffset.generatedLine - 1),
      column: needle.generatedColumn -
        (section.generatedOffset.generatedLine === needle.generatedLine
         ? section.generatedOffset.generatedColumn - 1
         : 0),
      bias: aArgs.bias
    });
  };

/**
 * Return true if we have the source content for every source in the source
 * map, false otherwise.
 */
IndexedSourceMapConsumer.prototype.hasContentsOfAllSources =
  function IndexedSourceMapConsumer_hasContentsOfAllSources() {
    return this._sections.every(function (s) {
      return s.consumer.hasContentsOfAllSources();
    });
  };

/**
 * Returns the original source content. The only argument is the url of the
 * original source file. Returns null if no original source content is
 * available.
 */
IndexedSourceMapConsumer.prototype.sourceContentFor =
  function IndexedSourceMapConsumer_sourceContentFor(aSource, nullOnMissing) {
    for (var i = 0; i < this._sections.length; i++) {
      var section = this._sections[i];

      var content = section.consumer.sourceContentFor(aSource, true);
      if (content) {
        return content;
      }
    }
    if (nullOnMissing) {
      return null;
    }
    else {
      throw new Error('"' + aSource + '" is not in the SourceMap.');
    }
  };

/**
 * Returns the generated line and column information for the original source,
 * line, and column positions provided. The only argument is an object with
 * the following properties:
 *
 *   - source: The filename of the original source.
 *   - line: The line number in the original source.  The line number
 *     is 1-based.
 *   - column: The column number in the original source.  The column
 *     number is 0-based.
 *
 * and an object is returned with the following properties:
 *
 *   - line: The line number in the generated source, or null.  The
 *     line number is 1-based. 
 *   - column: The column number in the generated source, or null.
 *     The column number is 0-based.
 */
IndexedSourceMapConsumer.prototype.generatedPositionFor =
  function IndexedSourceMapConsumer_generatedPositionFor(aArgs) {
    for (var i = 0; i < this._sections.length; i++) {
      var section = this._sections[i];

      // Only consider this section if the requested source is in the list of
      // sources of the consumer.
      if (section.consumer._findSourceIndex(util$1.getArg(aArgs, 'source')) === -1) {
        continue;
      }
      var generatedPosition = section.consumer.generatedPositionFor(aArgs);
      if (generatedPosition) {
        var ret = {
          line: generatedPosition.line +
            (section.generatedOffset.generatedLine - 1),
          column: generatedPosition.column +
            (section.generatedOffset.generatedLine === generatedPosition.line
             ? section.generatedOffset.generatedColumn - 1
             : 0)
        };
        return ret;
      }
    }

    return {
      line: null,
      column: null
    };
  };

/**
 * Parse the mappings in a string in to a data structure which we can easily
 * query (the ordered arrays in the `this.__generatedMappings` and
 * `this.__originalMappings` properties).
 */
IndexedSourceMapConsumer.prototype._parseMappings =
  function IndexedSourceMapConsumer_parseMappings(aStr, aSourceRoot) {
    this.__generatedMappings = [];
    this.__originalMappings = [];
    for (var i = 0; i < this._sections.length; i++) {
      var section = this._sections[i];
      var sectionMappings = section.consumer._generatedMappings;
      for (var j = 0; j < sectionMappings.length; j++) {
        var mapping = sectionMappings[j];

        var source = section.consumer._sources.at(mapping.source);
        source = util$1.computeSourceURL(section.consumer.sourceRoot, source, this._sourceMapURL);
        this._sources.add(source);
        source = this._sources.indexOf(source);

        var name = null;
        if (mapping.name) {
          name = section.consumer._names.at(mapping.name);
          this._names.add(name);
          name = this._names.indexOf(name);
        }

        // The mappings coming from the consumer for the section have
        // generated positions relative to the start of the section, so we
        // need to offset them to be relative to the start of the concatenated
        // generated file.
        var adjustedMapping = {
          source: source,
          generatedLine: mapping.generatedLine +
            (section.generatedOffset.generatedLine - 1),
          generatedColumn: mapping.generatedColumn +
            (section.generatedOffset.generatedLine === mapping.generatedLine
            ? section.generatedOffset.generatedColumn - 1
            : 0),
          originalLine: mapping.originalLine,
          originalColumn: mapping.originalColumn,
          name: name
        };

        this.__generatedMappings.push(adjustedMapping);
        if (typeof adjustedMapping.originalLine === 'number') {
          this.__originalMappings.push(adjustedMapping);
        }
      }
    }

    quickSort(this.__generatedMappings, util$1.compareByGeneratedPositionsDeflated);
    quickSort(this.__originalMappings, util$1.compareByOriginalPositions);
  };

sourceMapConsumer.IndexedSourceMapConsumer = IndexedSourceMapConsumer;

/* -*- Mode: js; js-indent-level: 2; -*- */

/*
 * Copyright 2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE or:
 * http://opensource.org/licenses/BSD-3-Clause
 */

var SourceMapGenerator = sourceMapGenerator.SourceMapGenerator;
var util = util$5;

// Matches a Windows-style `\r\n` newline or a `\n` newline used by all other
// operating systems these days (capturing the result).
var REGEX_NEWLINE = /(\r?\n)/;

// Newline character code for charCodeAt() comparisons
var NEWLINE_CODE = 10;

// Private symbol for identifying `SourceNode`s when multiple versions of
// the source-map library are loaded. This MUST NOT CHANGE across
// versions!
var isSourceNode = "$$$isSourceNode$$$";

/**
 * SourceNodes provide a way to abstract over interpolating/concatenating
 * snippets of generated JavaScript source code while maintaining the line and
 * column information associated with the original source code.
 *
 * @param aLine The original line number.
 * @param aColumn The original column number.
 * @param aSource The original source's filename.
 * @param aChunks Optional. An array of strings which are snippets of
 *        generated JS, or other SourceNodes.
 * @param aName The original identifier.
 */
function SourceNode(aLine, aColumn, aSource, aChunks, aName) {
  this.children = [];
  this.sourceContents = {};
  this.line = aLine == null ? null : aLine;
  this.column = aColumn == null ? null : aColumn;
  this.source = aSource == null ? null : aSource;
  this.name = aName == null ? null : aName;
  this[isSourceNode] = true;
  if (aChunks != null) this.add(aChunks);
}

/**
 * Creates a SourceNode from generated code and a SourceMapConsumer.
 *
 * @param aGeneratedCode The generated code
 * @param aSourceMapConsumer The SourceMap for the generated code
 * @param aRelativePath Optional. The path that relative sources in the
 *        SourceMapConsumer should be relative to.
 */
SourceNode.fromStringWithSourceMap =
  function SourceNode_fromStringWithSourceMap(aGeneratedCode, aSourceMapConsumer, aRelativePath) {
    // The SourceNode we want to fill with the generated code
    // and the SourceMap
    var node = new SourceNode();

    // All even indices of this array are one line of the generated code,
    // while all odd indices are the newlines between two adjacent lines
    // (since `REGEX_NEWLINE` captures its match).
    // Processed fragments are accessed by calling `shiftNextLine`.
    var remainingLines = aGeneratedCode.split(REGEX_NEWLINE);
    var remainingLinesIndex = 0;
    var shiftNextLine = function() {
      var lineContents = getNextLine();
      // The last line of a file might not have a newline.
      var newLine = getNextLine() || "";
      return lineContents + newLine;

      function getNextLine() {
        return remainingLinesIndex < remainingLines.length ?
            remainingLines[remainingLinesIndex++] : undefined;
      }
    };

    // We need to remember the position of "remainingLines"
    var lastGeneratedLine = 1, lastGeneratedColumn = 0;

    // The generate SourceNodes we need a code range.
    // To extract it current and last mapping is used.
    // Here we store the last mapping.
    var lastMapping = null;

    aSourceMapConsumer.eachMapping(function (mapping) {
      if (lastMapping !== null) {
        // We add the code from "lastMapping" to "mapping":
        // First check if there is a new line in between.
        if (lastGeneratedLine < mapping.generatedLine) {
          // Associate first line with "lastMapping"
          addMappingWithCode(lastMapping, shiftNextLine());
          lastGeneratedLine++;
          lastGeneratedColumn = 0;
          // The remaining code is added without mapping
        } else {
          // There is no new line in between.
          // Associate the code between "lastGeneratedColumn" and
          // "mapping.generatedColumn" with "lastMapping"
          var nextLine = remainingLines[remainingLinesIndex] || '';
          var code = nextLine.substr(0, mapping.generatedColumn -
                                        lastGeneratedColumn);
          remainingLines[remainingLinesIndex] = nextLine.substr(mapping.generatedColumn -
                                              lastGeneratedColumn);
          lastGeneratedColumn = mapping.generatedColumn;
          addMappingWithCode(lastMapping, code);
          // No more remaining code, continue
          lastMapping = mapping;
          return;
        }
      }
      // We add the generated code until the first mapping
      // to the SourceNode without any mapping.
      // Each line is added as separate string.
      while (lastGeneratedLine < mapping.generatedLine) {
        node.add(shiftNextLine());
        lastGeneratedLine++;
      }
      if (lastGeneratedColumn < mapping.generatedColumn) {
        var nextLine = remainingLines[remainingLinesIndex] || '';
        node.add(nextLine.substr(0, mapping.generatedColumn));
        remainingLines[remainingLinesIndex] = nextLine.substr(mapping.generatedColumn);
        lastGeneratedColumn = mapping.generatedColumn;
      }
      lastMapping = mapping;
    }, this);
    // We have processed all mappings.
    if (remainingLinesIndex < remainingLines.length) {
      if (lastMapping) {
        // Associate the remaining code in the current line with "lastMapping"
        addMappingWithCode(lastMapping, shiftNextLine());
      }
      // and add the remaining lines without any mapping
      node.add(remainingLines.splice(remainingLinesIndex).join(""));
    }

    // Copy sourcesContent into SourceNode
    aSourceMapConsumer.sources.forEach(function (sourceFile) {
      var content = aSourceMapConsumer.sourceContentFor(sourceFile);
      if (content != null) {
        if (aRelativePath != null) {
          sourceFile = util.join(aRelativePath, sourceFile);
        }
        node.setSourceContent(sourceFile, content);
      }
    });

    return node;

    function addMappingWithCode(mapping, code) {
      if (mapping === null || mapping.source === undefined) {
        node.add(code);
      } else {
        var source = aRelativePath
          ? util.join(aRelativePath, mapping.source)
          : mapping.source;
        node.add(new SourceNode(mapping.originalLine,
                                mapping.originalColumn,
                                source,
                                code,
                                mapping.name));
      }
    }
  };

/**
 * Add a chunk of generated JS to this source node.
 *
 * @param aChunk A string snippet of generated JS code, another instance of
 *        SourceNode, or an array where each member is one of those things.
 */
SourceNode.prototype.add = function SourceNode_add(aChunk) {
  if (Array.isArray(aChunk)) {
    aChunk.forEach(function (chunk) {
      this.add(chunk);
    }, this);
  }
  else if (aChunk[isSourceNode] || typeof aChunk === "string") {
    if (aChunk) {
      this.children.push(aChunk);
    }
  }
  else {
    throw new TypeError(
      "Expected a SourceNode, string, or an array of SourceNodes and strings. Got " + aChunk
    );
  }
  return this;
};

/**
 * Add a chunk of generated JS to the beginning of this source node.
 *
 * @param aChunk A string snippet of generated JS code, another instance of
 *        SourceNode, or an array where each member is one of those things.
 */
SourceNode.prototype.prepend = function SourceNode_prepend(aChunk) {
  if (Array.isArray(aChunk)) {
    for (var i = aChunk.length-1; i >= 0; i--) {
      this.prepend(aChunk[i]);
    }
  }
  else if (aChunk[isSourceNode] || typeof aChunk === "string") {
    this.children.unshift(aChunk);
  }
  else {
    throw new TypeError(
      "Expected a SourceNode, string, or an array of SourceNodes and strings. Got " + aChunk
    );
  }
  return this;
};

/**
 * Walk over the tree of JS snippets in this node and its children. The
 * walking function is called once for each snippet of JS and is passed that
 * snippet and the its original associated source's line/column location.
 *
 * @param aFn The traversal function.
 */
SourceNode.prototype.walk = function SourceNode_walk(aFn) {
  var chunk;
  for (var i = 0, len = this.children.length; i < len; i++) {
    chunk = this.children[i];
    if (chunk[isSourceNode]) {
      chunk.walk(aFn);
    }
    else {
      if (chunk !== '') {
        aFn(chunk, { source: this.source,
                     line: this.line,
                     column: this.column,
                     name: this.name });
      }
    }
  }
};

/**
 * Like `String.prototype.join` except for SourceNodes. Inserts `aStr` between
 * each of `this.children`.
 *
 * @param aSep The separator.
 */
SourceNode.prototype.join = function SourceNode_join(aSep) {
  var newChildren;
  var i;
  var len = this.children.length;
  if (len > 0) {
    newChildren = [];
    for (i = 0; i < len-1; i++) {
      newChildren.push(this.children[i]);
      newChildren.push(aSep);
    }
    newChildren.push(this.children[i]);
    this.children = newChildren;
  }
  return this;
};

/**
 * Call String.prototype.replace on the very right-most source snippet. Useful
 * for trimming whitespace from the end of a source node, etc.
 *
 * @param aPattern The pattern to replace.
 * @param aReplacement The thing to replace the pattern with.
 */
SourceNode.prototype.replaceRight = function SourceNode_replaceRight(aPattern, aReplacement) {
  var lastChild = this.children[this.children.length - 1];
  if (lastChild[isSourceNode]) {
    lastChild.replaceRight(aPattern, aReplacement);
  }
  else if (typeof lastChild === 'string') {
    this.children[this.children.length - 1] = lastChild.replace(aPattern, aReplacement);
  }
  else {
    this.children.push(''.replace(aPattern, aReplacement));
  }
  return this;
};

/**
 * Set the source content for a source file. This will be added to the SourceMapGenerator
 * in the sourcesContent field.
 *
 * @param aSourceFile The filename of the source file
 * @param aSourceContent The content of the source file
 */
SourceNode.prototype.setSourceContent =
  function SourceNode_setSourceContent(aSourceFile, aSourceContent) {
    this.sourceContents[util.toSetString(aSourceFile)] = aSourceContent;
  };

/**
 * Walk over the tree of SourceNodes. The walking function is called for each
 * source file content and is passed the filename and source content.
 *
 * @param aFn The traversal function.
 */
SourceNode.prototype.walkSourceContents =
  function SourceNode_walkSourceContents(aFn) {
    for (var i = 0, len = this.children.length; i < len; i++) {
      if (this.children[i][isSourceNode]) {
        this.children[i].walkSourceContents(aFn);
      }
    }

    var sources = Object.keys(this.sourceContents);
    for (var i = 0, len = sources.length; i < len; i++) {
      aFn(util.fromSetString(sources[i]), this.sourceContents[sources[i]]);
    }
  };

/**
 * Return the string representation of this source node. Walks over the tree
 * and concatenates all the various snippets together to one string.
 */
SourceNode.prototype.toString = function SourceNode_toString() {
  var str = "";
  this.walk(function (chunk) {
    str += chunk;
  });
  return str;
};

/**
 * Returns the string representation of this source node along with a source
 * map.
 */
SourceNode.prototype.toStringWithSourceMap = function SourceNode_toStringWithSourceMap(aArgs) {
  var generated = {
    code: "",
    line: 1,
    column: 0
  };
  var map = new SourceMapGenerator(aArgs);
  var sourceMappingActive = false;
  var lastOriginalSource = null;
  var lastOriginalLine = null;
  var lastOriginalColumn = null;
  var lastOriginalName = null;
  this.walk(function (chunk, original) {
    generated.code += chunk;
    if (original.source !== null
        && original.line !== null
        && original.column !== null) {
      if(lastOriginalSource !== original.source
         || lastOriginalLine !== original.line
         || lastOriginalColumn !== original.column
         || lastOriginalName !== original.name) {
        map.addMapping({
          source: original.source,
          original: {
            line: original.line,
            column: original.column
          },
          generated: {
            line: generated.line,
            column: generated.column
          },
          name: original.name
        });
      }
      lastOriginalSource = original.source;
      lastOriginalLine = original.line;
      lastOriginalColumn = original.column;
      lastOriginalName = original.name;
      sourceMappingActive = true;
    } else if (sourceMappingActive) {
      map.addMapping({
        generated: {
          line: generated.line,
          column: generated.column
        }
      });
      lastOriginalSource = null;
      sourceMappingActive = false;
    }
    for (var idx = 0, length = chunk.length; idx < length; idx++) {
      if (chunk.charCodeAt(idx) === NEWLINE_CODE) {
        generated.line++;
        generated.column = 0;
        // Mappings end at eol
        if (idx + 1 === length) {
          lastOriginalSource = null;
          sourceMappingActive = false;
        } else if (sourceMappingActive) {
          map.addMapping({
            source: original.source,
            original: {
              line: original.line,
              column: original.column
            },
            generated: {
              line: generated.line,
              column: generated.column
            },
            name: original.name
          });
        }
      } else {
        generated.column++;
      }
    }
  });
  this.walkSourceContents(function (sourceFile, sourceContent) {
    map.setSourceContent(sourceFile, sourceContent);
  });

  return { code: generated.code, map: map };
};

/*
 * Copyright 2009-2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE.txt or:
 * http://opensource.org/licenses/BSD-3-Clause
 */
var SourceMapConsumer = sourceMapConsumer.SourceMapConsumer;

const lineSplitRE = /\r?\n/;
function getOriginalPos(map, { line, column }) {
  return new Promise((resolve) => {
    if (!map)
      return resolve(null);
    const consumer = new SourceMapConsumer(map);
    const pos = consumer.originalPositionFor({ line, column });
    if (pos.line != null && pos.column != null)
      resolve(pos);
    else
      resolve(null);
  });
}
const stackFnCallRE = /at (.*) \((.+):(\d+):(\d+)\)$/;
const stackBarePathRE = /at ?(.*) (.+):(\d+):(\d+)$/;
async function interpretSourcePos(stackFrames, ctx) {
  var _a;
  for (const frame of stackFrames) {
    const transformResult = (_a = ctx.server.moduleGraph.getModuleById(frame.file)) == null ? void 0 : _a.ssrTransformResult;
    if (!transformResult)
      continue;
    const sourcePos = await getOriginalPos(transformResult.map, frame);
    if (sourcePos)
      frame.sourcePos = sourcePos;
  }
  return stackFrames;
}
const stackIgnorePatterns = [
  "node:internal",
  "/vitest/dist/",
  "/node_modules/chai/",
  "/node_modules/tinypool/",
  "/node_modules/tinyspy/"
];
function parseStacktrace(e, full = false) {
  if (e.stacks)
    return e.stacks;
  const stackStr = e.stack || e.stackStr || "";
  const stackFrames = stackStr.split("\n").map((raw) => {
    const line = raw.trim();
    const match = line.match(stackFnCallRE) || line.match(stackBarePathRE);
    if (!match)
      return null;
    let file = match[2];
    if (file.startsWith("file://"))
      file = file.slice(7);
    if (!full && stackIgnorePatterns.some((p) => file.includes(p)))
      return null;
    return {
      method: match[1],
      file: match[2],
      line: parseInt(match[3]),
      column: parseInt(match[4])
    };
  }).filter(notNullish);
  e.stacks = stackFrames;
  return stackFrames;
}
function posToNumber(source, pos) {
  if (typeof pos === "number")
    return pos;
  const lines = source.split(lineSplitRE);
  const { line, column } = pos;
  let start = 0;
  if (line > lines.length)
    return source.length;
  for (let i = 0; i < line - 1; i++)
    start += lines[i].length + 1;
  return start + column;
}

const F_RIGHT = "\u2192";
const F_DOWN = "\u2193";
const F_DOWN_RIGHT = "\u21B3";
const F_POINTER = "\u276F";
const F_DOT = "\xB7";
const F_CHECK = "\u221A";
const F_CROSS = "\xD7";
const F_LONG_DASH = "\u23AF";

async function printError(error, ctx) {
  let e = error;
  if (typeof error === "string") {
    e = {
      message: error.split(/\n/g)[0],
      stack: error
    };
  }
  const stacks = parseStacktrace(e);
  await interpretSourcePos(stacks, ctx);
  const nearest = stacks.find((stack) => ctx.server.moduleGraph.getModuleById(stack.file) && existsSync(stack.file));
  printErrorMessage(e, ctx.console);
  await printStack(ctx, stacks, nearest, async (s, pos) => {
    if (s === nearest && nearest) {
      const sourceCode = await promises.readFile(nearest.file, "utf-8");
      ctx.log(c.yellow(generateCodeFrame(sourceCode, 4, pos)));
    }
  });
  handleImportOutsideModuleError(e.stack || e.stackStr || "", ctx);
  if (e.showDiff)
    displayDiff(e.actual, e.expected, ctx.console);
}
const esmErrors = [
  "Cannot use import statement outside a module",
  "Unexpected token 'export'"
];
function handleImportOutsideModuleError(stack, ctx) {
  if (!esmErrors.some((e) => stack.includes(e)))
    return;
  const path = stack.split("\n")[0].trim();
  let name = path.split("/node_modules/").pop() || "";
  if (name == null ? void 0 : name.startsWith("@"))
    name = name.split("/").slice(0, 2).join("/");
  else
    name = name.split("/")[0];
  ctx.console.error(c.yellow(`Module ${path} seems to be an ES Module but shipped in a CommonJS package. You might want to create an issue to the package ${c.bold(`"${name}"`)} asking them to ship the file in .mjs extension or add "type": "module" in their package.json.

As a temporary workaround you can try to inline the package by updating your config:

` + c.gray(c.dim("// vitest.config.js")) + "\n" + c.green(`export default {
  test: {
    deps: {
      inline: [
        ${c.yellow(c.bold(`"${name}"`))}
      ]
    }
  }
}
`)));
}
function displayDiff(actual, expected, console) {
  console.error(c.gray(unifiedDiff(actual, expected)) + "\n");
}
function printErrorMessage(error, console) {
  const errorName = error.name || error.nameStr || "Unknown Error";
  console.error(c.red(`${c.bold(errorName)}: ${error.message}`));
}
async function printStack(ctx, stack, highlight, onStack) {
  if (!stack.length)
    return;
  for (const frame of stack) {
    const pos = frame.sourcePos || frame;
    const color = frame === highlight ? c.yellow : c.gray;
    const path = relative(ctx.config.root, frame.file);
    ctx.log(color(` ${c.dim(F_POINTER)} ${[frame.method, c.dim(`${path}:${pos.line}:${pos.column}`)].filter(Boolean).join(" ")}`));
    await (onStack == null ? void 0 : onStack(frame, pos));
    if (frame.file in ctx.state.filesMap)
      break;
  }
  ctx.log();
}
function generateCodeFrame(source, indent = 0, start = 0, end, range = 2) {
  start = posToNumber(source, start);
  end = end || start;
  const lines = source.split(lineSplitRE);
  let count = 0;
  let res = [];
  const columns = process.stdout.columns || 80;
  function lineNo(no = "") {
    return c.gray(`${String(no).padStart(3, " ")}| `);
  }
  for (let i = 0; i < lines.length; i++) {
    count += lines[i].length + 1;
    if (count >= start) {
      for (let j = i - range; j <= i + range || end > count; j++) {
        if (j < 0 || j >= lines.length)
          continue;
        const lineLength = lines[j].length;
        if (lineLength > 200)
          return "";
        res.push(lineNo(j + 1) + cliTruncate(lines[j], columns - 5 - indent));
        if (j === i) {
          const pad = start - (count - lineLength);
          const length = Math.max(1, end > count ? lineLength - pad : end - start);
          res.push(lineNo() + " ".repeat(pad) + c.red("^".repeat(length)));
        } else if (j > i) {
          if (end > count) {
            const length = Math.max(1, Math.min(end - count, lineLength));
            res.push(lineNo() + c.red("^".repeat(length)));
          }
          count += lineLength + 1;
        }
      }
      break;
    }
  }
  if (indent)
    res = res.map((line) => " ".repeat(indent) + line);
  return res.join("\n");
}
function unifiedDiff(actual, expected) {
  if (actual === expected)
    return "";
  const indent = "  ";
  const diffLimit = 15;
  const counts = {
    "+": 0,
    "-": 0
  };
  let previousState = null;
  let previousCount = 0;
  function preprocess(line) {
    if (!line || line.match(/\\ No newline/))
      return;
    const char = line[0];
    if ("-+".includes(char)) {
      if (previousState !== char) {
        previousState = char;
        previousCount = 0;
      }
      previousCount++;
      counts[char]++;
      if (previousCount === diffLimit)
        return c.dim(char + " ...");
      else if (previousCount > diffLimit)
        return;
    }
    return line;
  }
  const msg = createPatch("string", expected, actual);
  const lines = msg.split("\n").slice(5).map(preprocess).filter(Boolean);
  const isCompact = counts["+"] === 1 && counts["-"] === 1 && lines.length === 2;
  let formatted = lines.map((line) => {
    if (line[0] === "-") {
      line = formatLine(line.slice(1));
      if (isCompact)
        return c.green(line);
      return c.green(`- ${formatLine(line)}`);
    }
    if (line[0] === "+") {
      line = formatLine(line.slice(1));
      if (isCompact)
        return c.red(line);
      return c.red(`+ ${formatLine(line)}`);
    }
    if (line.match(/@@/))
      return "--";
    return " " + line;
  });
  if (isCompact) {
    formatted = [
      `${c.green("- Expected")}   ${formatted[0]}`,
      `${c.red("+ Received")}   ${formatted[1]}`
    ];
  } else {
    formatted.unshift(c.green("- Expected  - " + counts["-"]), c.red("+ Received  + " + counts["+"]), "");
  }
  return formatted.map((i) => indent + i).join("\n");
}
function formatLine(line) {
  return cliTruncate(line, (process.stdout.columns || 80) - 4);
}

export { F_POINTER as F, F_DOWN as a, F_LONG_DASH as b, F_DOWN_RIGHT as c, F_DOT as d, F_CHECK as e, F_CROSS as f, F_RIGHT as g, stringWidth as h, ansiStyles as i, sliceAnsi as j, cliTruncate as k, parseStacktrace as l, getOriginalPos as m, posToNumber as n, interpretSourcePos as o, printError as p, stripAnsi as s, unifiedDiff as u };
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGlmZi0xOWI0MmY4NS5qcyIsInNvdXJjZXMiOlsiLi4vLi4vLi4vbm9kZV9tb2R1bGVzLy5wbnBtL2RpZmZANS4wLjAvbm9kZV9tb2R1bGVzL2RpZmYvbGliL2luZGV4Lm1qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy8ucG5wbS9pcy1mdWxsd2lkdGgtY29kZS1wb2ludEA0LjAuMC9ub2RlX21vZHVsZXMvaXMtZnVsbHdpZHRoLWNvZGUtcG9pbnQvaW5kZXguanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvLnBucG0vYW5zaS1zdHlsZXNANi4xLjAvbm9kZV9tb2R1bGVzL2Fuc2ktc3R5bGVzL2luZGV4LmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzLy5wbnBtL3NsaWNlLWFuc2lANS4wLjAvbm9kZV9tb2R1bGVzL3NsaWNlLWFuc2kvaW5kZXguanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvLnBucG0vYW5zaS1yZWdleEA2LjAuMS9ub2RlX21vZHVsZXMvYW5zaS1yZWdleC9pbmRleC5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy8ucG5wbS9zdHJpcC1hbnNpQDcuMC4xL25vZGVfbW9kdWxlcy9zdHJpcC1hbnNpL2luZGV4LmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzLy5wbnBtL2Vtb2ppLXJlZ2V4QDkuMi4yL25vZGVfbW9kdWxlcy9lbW9qaS1yZWdleC9pbmRleC5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy8ucG5wbS9zdHJpbmctd2lkdGhANS4wLjEvbm9kZV9tb2R1bGVzL3N0cmluZy13aWR0aC9pbmRleC5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy8ucG5wbS9jbGktdHJ1bmNhdGVAMy4xLjAvbm9kZV9tb2R1bGVzL2NsaS10cnVuY2F0ZS9pbmRleC5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy8ucG5wbS9zb3VyY2UtbWFwLWpzQDEuMC4xL25vZGVfbW9kdWxlcy9zb3VyY2UtbWFwLWpzL2xpYi9iYXNlNjQuanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvLnBucG0vc291cmNlLW1hcC1qc0AxLjAuMS9ub2RlX21vZHVsZXMvc291cmNlLW1hcC1qcy9saWIvYmFzZTY0LXZscS5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy8ucG5wbS9zb3VyY2UtbWFwLWpzQDEuMC4xL25vZGVfbW9kdWxlcy9zb3VyY2UtbWFwLWpzL2xpYi91dGlsLmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzLy5wbnBtL3NvdXJjZS1tYXAtanNAMS4wLjEvbm9kZV9tb2R1bGVzL3NvdXJjZS1tYXAtanMvbGliL2FycmF5LXNldC5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy8ucG5wbS9zb3VyY2UtbWFwLWpzQDEuMC4xL25vZGVfbW9kdWxlcy9zb3VyY2UtbWFwLWpzL2xpYi9tYXBwaW5nLWxpc3QuanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvLnBucG0vc291cmNlLW1hcC1qc0AxLjAuMS9ub2RlX21vZHVsZXMvc291cmNlLW1hcC1qcy9saWIvc291cmNlLW1hcC1nZW5lcmF0b3IuanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvLnBucG0vc291cmNlLW1hcC1qc0AxLjAuMS9ub2RlX21vZHVsZXMvc291cmNlLW1hcC1qcy9saWIvYmluYXJ5LXNlYXJjaC5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy8ucG5wbS9zb3VyY2UtbWFwLWpzQDEuMC4xL25vZGVfbW9kdWxlcy9zb3VyY2UtbWFwLWpzL2xpYi9xdWljay1zb3J0LmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzLy5wbnBtL3NvdXJjZS1tYXAtanNAMS4wLjEvbm9kZV9tb2R1bGVzL3NvdXJjZS1tYXAtanMvbGliL3NvdXJjZS1tYXAtY29uc3VtZXIuanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvLnBucG0vc291cmNlLW1hcC1qc0AxLjAuMS9ub2RlX21vZHVsZXMvc291cmNlLW1hcC1qcy9saWIvc291cmNlLW5vZGUuanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvLnBucG0vc291cmNlLW1hcC1qc0AxLjAuMS9ub2RlX21vZHVsZXMvc291cmNlLW1hcC1qcy9zb3VyY2UtbWFwLmpzIiwiLi4vc3JjL3V0aWxzL3NvdXJjZS1tYXAudHMiLCIuLi9zcmMvbm9kZS9yZXBvcnRlcnMvcmVuZGVyZXJzL2ZpZ3VyZXMudHMiLCIuLi9zcmMvbm9kZS9yZXBvcnRlcnMvcmVuZGVyZXJzL2RpZmYudHMiXSwic291cmNlc0NvbnRlbnQiOlsiZnVuY3Rpb24gRGlmZigpIHt9XG5EaWZmLnByb3RvdHlwZSA9IHtcbiAgZGlmZjogZnVuY3Rpb24gZGlmZihvbGRTdHJpbmcsIG5ld1N0cmluZykge1xuICAgIHZhciBvcHRpb25zID0gYXJndW1lbnRzLmxlbmd0aCA+IDIgJiYgYXJndW1lbnRzWzJdICE9PSB1bmRlZmluZWQgPyBhcmd1bWVudHNbMl0gOiB7fTtcbiAgICB2YXIgY2FsbGJhY2sgPSBvcHRpb25zLmNhbGxiYWNrO1xuXG4gICAgaWYgKHR5cGVvZiBvcHRpb25zID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICBjYWxsYmFjayA9IG9wdGlvbnM7XG4gICAgICBvcHRpb25zID0ge307XG4gICAgfVxuXG4gICAgdGhpcy5vcHRpb25zID0gb3B0aW9ucztcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICBmdW5jdGlvbiBkb25lKHZhbHVlKSB7XG4gICAgICBpZiAoY2FsbGJhY2spIHtcbiAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgY2FsbGJhY2sodW5kZWZpbmVkLCB2YWx1ZSk7XG4gICAgICAgIH0sIDApO1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICAgIH1cbiAgICB9IC8vIEFsbG93IHN1YmNsYXNzZXMgdG8gbWFzc2FnZSB0aGUgaW5wdXQgcHJpb3IgdG8gcnVubmluZ1xuXG5cbiAgICBvbGRTdHJpbmcgPSB0aGlzLmNhc3RJbnB1dChvbGRTdHJpbmcpO1xuICAgIG5ld1N0cmluZyA9IHRoaXMuY2FzdElucHV0KG5ld1N0cmluZyk7XG4gICAgb2xkU3RyaW5nID0gdGhpcy5yZW1vdmVFbXB0eSh0aGlzLnRva2VuaXplKG9sZFN0cmluZykpO1xuICAgIG5ld1N0cmluZyA9IHRoaXMucmVtb3ZlRW1wdHkodGhpcy50b2tlbml6ZShuZXdTdHJpbmcpKTtcbiAgICB2YXIgbmV3TGVuID0gbmV3U3RyaW5nLmxlbmd0aCxcbiAgICAgICAgb2xkTGVuID0gb2xkU3RyaW5nLmxlbmd0aDtcbiAgICB2YXIgZWRpdExlbmd0aCA9IDE7XG4gICAgdmFyIG1heEVkaXRMZW5ndGggPSBuZXdMZW4gKyBvbGRMZW47XG4gICAgdmFyIGJlc3RQYXRoID0gW3tcbiAgICAgIG5ld1BvczogLTEsXG4gICAgICBjb21wb25lbnRzOiBbXVxuICAgIH1dOyAvLyBTZWVkIGVkaXRMZW5ndGggPSAwLCBpLmUuIHRoZSBjb250ZW50IHN0YXJ0cyB3aXRoIHRoZSBzYW1lIHZhbHVlc1xuXG4gICAgdmFyIG9sZFBvcyA9IHRoaXMuZXh0cmFjdENvbW1vbihiZXN0UGF0aFswXSwgbmV3U3RyaW5nLCBvbGRTdHJpbmcsIDApO1xuXG4gICAgaWYgKGJlc3RQYXRoWzBdLm5ld1BvcyArIDEgPj0gbmV3TGVuICYmIG9sZFBvcyArIDEgPj0gb2xkTGVuKSB7XG4gICAgICAvLyBJZGVudGl0eSBwZXIgdGhlIGVxdWFsaXR5IGFuZCB0b2tlbml6ZXJcbiAgICAgIHJldHVybiBkb25lKFt7XG4gICAgICAgIHZhbHVlOiB0aGlzLmpvaW4obmV3U3RyaW5nKSxcbiAgICAgICAgY291bnQ6IG5ld1N0cmluZy5sZW5ndGhcbiAgICAgIH1dKTtcbiAgICB9IC8vIE1haW4gd29ya2VyIG1ldGhvZC4gY2hlY2tzIGFsbCBwZXJtdXRhdGlvbnMgb2YgYSBnaXZlbiBlZGl0IGxlbmd0aCBmb3IgYWNjZXB0YW5jZS5cblxuXG4gICAgZnVuY3Rpb24gZXhlY0VkaXRMZW5ndGgoKSB7XG4gICAgICBmb3IgKHZhciBkaWFnb25hbFBhdGggPSAtMSAqIGVkaXRMZW5ndGg7IGRpYWdvbmFsUGF0aCA8PSBlZGl0TGVuZ3RoOyBkaWFnb25hbFBhdGggKz0gMikge1xuICAgICAgICB2YXIgYmFzZVBhdGggPSB2b2lkIDA7XG5cbiAgICAgICAgdmFyIGFkZFBhdGggPSBiZXN0UGF0aFtkaWFnb25hbFBhdGggLSAxXSxcbiAgICAgICAgICAgIHJlbW92ZVBhdGggPSBiZXN0UGF0aFtkaWFnb25hbFBhdGggKyAxXSxcbiAgICAgICAgICAgIF9vbGRQb3MgPSAocmVtb3ZlUGF0aCA/IHJlbW92ZVBhdGgubmV3UG9zIDogMCkgLSBkaWFnb25hbFBhdGg7XG5cbiAgICAgICAgaWYgKGFkZFBhdGgpIHtcbiAgICAgICAgICAvLyBObyBvbmUgZWxzZSBpcyBnb2luZyB0byBhdHRlbXB0IHRvIHVzZSB0aGlzIHZhbHVlLCBjbGVhciBpdFxuICAgICAgICAgIGJlc3RQYXRoW2RpYWdvbmFsUGF0aCAtIDFdID0gdW5kZWZpbmVkO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIGNhbkFkZCA9IGFkZFBhdGggJiYgYWRkUGF0aC5uZXdQb3MgKyAxIDwgbmV3TGVuLFxuICAgICAgICAgICAgY2FuUmVtb3ZlID0gcmVtb3ZlUGF0aCAmJiAwIDw9IF9vbGRQb3MgJiYgX29sZFBvcyA8IG9sZExlbjtcblxuICAgICAgICBpZiAoIWNhbkFkZCAmJiAhY2FuUmVtb3ZlKSB7XG4gICAgICAgICAgLy8gSWYgdGhpcyBwYXRoIGlzIGEgdGVybWluYWwgdGhlbiBwcnVuZVxuICAgICAgICAgIGJlc3RQYXRoW2RpYWdvbmFsUGF0aF0gPSB1bmRlZmluZWQ7XG4gICAgICAgICAgY29udGludWU7XG4gICAgICAgIH0gLy8gU2VsZWN0IHRoZSBkaWFnb25hbCB0aGF0IHdlIHdhbnQgdG8gYnJhbmNoIGZyb20uIFdlIHNlbGVjdCB0aGUgcHJpb3JcbiAgICAgICAgLy8gcGF0aCB3aG9zZSBwb3NpdGlvbiBpbiB0aGUgbmV3IHN0cmluZyBpcyB0aGUgZmFydGhlc3QgZnJvbSB0aGUgb3JpZ2luXG4gICAgICAgIC8vIGFuZCBkb2VzIG5vdCBwYXNzIHRoZSBib3VuZHMgb2YgdGhlIGRpZmYgZ3JhcGhcblxuXG4gICAgICAgIGlmICghY2FuQWRkIHx8IGNhblJlbW92ZSAmJiBhZGRQYXRoLm5ld1BvcyA8IHJlbW92ZVBhdGgubmV3UG9zKSB7XG4gICAgICAgICAgYmFzZVBhdGggPSBjbG9uZVBhdGgocmVtb3ZlUGF0aCk7XG4gICAgICAgICAgc2VsZi5wdXNoQ29tcG9uZW50KGJhc2VQYXRoLmNvbXBvbmVudHMsIHVuZGVmaW5lZCwgdHJ1ZSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgYmFzZVBhdGggPSBhZGRQYXRoOyAvLyBObyBuZWVkIHRvIGNsb25lLCB3ZSd2ZSBwdWxsZWQgaXQgZnJvbSB0aGUgbGlzdFxuXG4gICAgICAgICAgYmFzZVBhdGgubmV3UG9zKys7XG4gICAgICAgICAgc2VsZi5wdXNoQ29tcG9uZW50KGJhc2VQYXRoLmNvbXBvbmVudHMsIHRydWUsIHVuZGVmaW5lZCk7XG4gICAgICAgIH1cblxuICAgICAgICBfb2xkUG9zID0gc2VsZi5leHRyYWN0Q29tbW9uKGJhc2VQYXRoLCBuZXdTdHJpbmcsIG9sZFN0cmluZywgZGlhZ29uYWxQYXRoKTsgLy8gSWYgd2UgaGF2ZSBoaXQgdGhlIGVuZCBvZiBib3RoIHN0cmluZ3MsIHRoZW4gd2UgYXJlIGRvbmVcblxuICAgICAgICBpZiAoYmFzZVBhdGgubmV3UG9zICsgMSA+PSBuZXdMZW4gJiYgX29sZFBvcyArIDEgPj0gb2xkTGVuKSB7XG4gICAgICAgICAgcmV0dXJuIGRvbmUoYnVpbGRWYWx1ZXMoc2VsZiwgYmFzZVBhdGguY29tcG9uZW50cywgbmV3U3RyaW5nLCBvbGRTdHJpbmcsIHNlbGYudXNlTG9uZ2VzdFRva2VuKSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgLy8gT3RoZXJ3aXNlIHRyYWNrIHRoaXMgcGF0aCBhcyBhIHBvdGVudGlhbCBjYW5kaWRhdGUgYW5kIGNvbnRpbnVlLlxuICAgICAgICAgIGJlc3RQYXRoW2RpYWdvbmFsUGF0aF0gPSBiYXNlUGF0aDtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBlZGl0TGVuZ3RoKys7XG4gICAgfSAvLyBQZXJmb3JtcyB0aGUgbGVuZ3RoIG9mIGVkaXQgaXRlcmF0aW9uLiBJcyBhIGJpdCBmdWdseSBhcyB0aGlzIGhhcyB0byBzdXBwb3J0IHRoZVxuICAgIC8vIHN5bmMgYW5kIGFzeW5jIG1vZGUgd2hpY2ggaXMgbmV2ZXIgZnVuLiBMb29wcyBvdmVyIGV4ZWNFZGl0TGVuZ3RoIHVudGlsIGEgdmFsdWVcbiAgICAvLyBpcyBwcm9kdWNlZC5cblxuXG4gICAgaWYgKGNhbGxiYWNrKSB7XG4gICAgICAoZnVuY3Rpb24gZXhlYygpIHtcbiAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgLy8gVGhpcyBzaG91bGQgbm90IGhhcHBlbiwgYnV0IHdlIHdhbnQgdG8gYmUgc2FmZS5cblxuICAgICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG4gICAgICAgICAgaWYgKGVkaXRMZW5ndGggPiBtYXhFZGl0TGVuZ3RoKSB7XG4gICAgICAgICAgICByZXR1cm4gY2FsbGJhY2soKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAoIWV4ZWNFZGl0TGVuZ3RoKCkpIHtcbiAgICAgICAgICAgIGV4ZWMoKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0sIDApO1xuICAgICAgfSkoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgd2hpbGUgKGVkaXRMZW5ndGggPD0gbWF4RWRpdExlbmd0aCkge1xuICAgICAgICB2YXIgcmV0ID0gZXhlY0VkaXRMZW5ndGgoKTtcblxuICAgICAgICBpZiAocmV0KSB7XG4gICAgICAgICAgcmV0dXJuIHJldDtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfSxcbiAgcHVzaENvbXBvbmVudDogZnVuY3Rpb24gcHVzaENvbXBvbmVudChjb21wb25lbnRzLCBhZGRlZCwgcmVtb3ZlZCkge1xuICAgIHZhciBsYXN0ID0gY29tcG9uZW50c1tjb21wb25lbnRzLmxlbmd0aCAtIDFdO1xuXG4gICAgaWYgKGxhc3QgJiYgbGFzdC5hZGRlZCA9PT0gYWRkZWQgJiYgbGFzdC5yZW1vdmVkID09PSByZW1vdmVkKSB7XG4gICAgICAvLyBXZSBuZWVkIHRvIGNsb25lIGhlcmUgYXMgdGhlIGNvbXBvbmVudCBjbG9uZSBvcGVyYXRpb24gaXMganVzdFxuICAgICAgLy8gYXMgc2hhbGxvdyBhcnJheSBjbG9uZVxuICAgICAgY29tcG9uZW50c1tjb21wb25lbnRzLmxlbmd0aCAtIDFdID0ge1xuICAgICAgICBjb3VudDogbGFzdC5jb3VudCArIDEsXG4gICAgICAgIGFkZGVkOiBhZGRlZCxcbiAgICAgICAgcmVtb3ZlZDogcmVtb3ZlZFxuICAgICAgfTtcbiAgICB9IGVsc2Uge1xuICAgICAgY29tcG9uZW50cy5wdXNoKHtcbiAgICAgICAgY291bnQ6IDEsXG4gICAgICAgIGFkZGVkOiBhZGRlZCxcbiAgICAgICAgcmVtb3ZlZDogcmVtb3ZlZFxuICAgICAgfSk7XG4gICAgfVxuICB9LFxuICBleHRyYWN0Q29tbW9uOiBmdW5jdGlvbiBleHRyYWN0Q29tbW9uKGJhc2VQYXRoLCBuZXdTdHJpbmcsIG9sZFN0cmluZywgZGlhZ29uYWxQYXRoKSB7XG4gICAgdmFyIG5ld0xlbiA9IG5ld1N0cmluZy5sZW5ndGgsXG4gICAgICAgIG9sZExlbiA9IG9sZFN0cmluZy5sZW5ndGgsXG4gICAgICAgIG5ld1BvcyA9IGJhc2VQYXRoLm5ld1BvcyxcbiAgICAgICAgb2xkUG9zID0gbmV3UG9zIC0gZGlhZ29uYWxQYXRoLFxuICAgICAgICBjb21tb25Db3VudCA9IDA7XG5cbiAgICB3aGlsZSAobmV3UG9zICsgMSA8IG5ld0xlbiAmJiBvbGRQb3MgKyAxIDwgb2xkTGVuICYmIHRoaXMuZXF1YWxzKG5ld1N0cmluZ1tuZXdQb3MgKyAxXSwgb2xkU3RyaW5nW29sZFBvcyArIDFdKSkge1xuICAgICAgbmV3UG9zKys7XG4gICAgICBvbGRQb3MrKztcbiAgICAgIGNvbW1vbkNvdW50Kys7XG4gICAgfVxuXG4gICAgaWYgKGNvbW1vbkNvdW50KSB7XG4gICAgICBiYXNlUGF0aC5jb21wb25lbnRzLnB1c2goe1xuICAgICAgICBjb3VudDogY29tbW9uQ291bnRcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIGJhc2VQYXRoLm5ld1BvcyA9IG5ld1BvcztcbiAgICByZXR1cm4gb2xkUG9zO1xuICB9LFxuICBlcXVhbHM6IGZ1bmN0aW9uIGVxdWFscyhsZWZ0LCByaWdodCkge1xuICAgIGlmICh0aGlzLm9wdGlvbnMuY29tcGFyYXRvcikge1xuICAgICAgcmV0dXJuIHRoaXMub3B0aW9ucy5jb21wYXJhdG9yKGxlZnQsIHJpZ2h0KTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIGxlZnQgPT09IHJpZ2h0IHx8IHRoaXMub3B0aW9ucy5pZ25vcmVDYXNlICYmIGxlZnQudG9Mb3dlckNhc2UoKSA9PT0gcmlnaHQudG9Mb3dlckNhc2UoKTtcbiAgICB9XG4gIH0sXG4gIHJlbW92ZUVtcHR5OiBmdW5jdGlvbiByZW1vdmVFbXB0eShhcnJheSkge1xuICAgIHZhciByZXQgPSBbXTtcblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYXJyYXkubGVuZ3RoOyBpKyspIHtcbiAgICAgIGlmIChhcnJheVtpXSkge1xuICAgICAgICByZXQucHVzaChhcnJheVtpXSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHJldDtcbiAgfSxcbiAgY2FzdElucHV0OiBmdW5jdGlvbiBjYXN0SW5wdXQodmFsdWUpIHtcbiAgICByZXR1cm4gdmFsdWU7XG4gIH0sXG4gIHRva2VuaXplOiBmdW5jdGlvbiB0b2tlbml6ZSh2YWx1ZSkge1xuICAgIHJldHVybiB2YWx1ZS5zcGxpdCgnJyk7XG4gIH0sXG4gIGpvaW46IGZ1bmN0aW9uIGpvaW4oY2hhcnMpIHtcbiAgICByZXR1cm4gY2hhcnMuam9pbignJyk7XG4gIH1cbn07XG5cbmZ1bmN0aW9uIGJ1aWxkVmFsdWVzKGRpZmYsIGNvbXBvbmVudHMsIG5ld1N0cmluZywgb2xkU3RyaW5nLCB1c2VMb25nZXN0VG9rZW4pIHtcbiAgdmFyIGNvbXBvbmVudFBvcyA9IDAsXG4gICAgICBjb21wb25lbnRMZW4gPSBjb21wb25lbnRzLmxlbmd0aCxcbiAgICAgIG5ld1BvcyA9IDAsXG4gICAgICBvbGRQb3MgPSAwO1xuXG4gIGZvciAoOyBjb21wb25lbnRQb3MgPCBjb21wb25lbnRMZW47IGNvbXBvbmVudFBvcysrKSB7XG4gICAgdmFyIGNvbXBvbmVudCA9IGNvbXBvbmVudHNbY29tcG9uZW50UG9zXTtcblxuICAgIGlmICghY29tcG9uZW50LnJlbW92ZWQpIHtcbiAgICAgIGlmICghY29tcG9uZW50LmFkZGVkICYmIHVzZUxvbmdlc3RUb2tlbikge1xuICAgICAgICB2YXIgdmFsdWUgPSBuZXdTdHJpbmcuc2xpY2UobmV3UG9zLCBuZXdQb3MgKyBjb21wb25lbnQuY291bnQpO1xuICAgICAgICB2YWx1ZSA9IHZhbHVlLm1hcChmdW5jdGlvbiAodmFsdWUsIGkpIHtcbiAgICAgICAgICB2YXIgb2xkVmFsdWUgPSBvbGRTdHJpbmdbb2xkUG9zICsgaV07XG4gICAgICAgICAgcmV0dXJuIG9sZFZhbHVlLmxlbmd0aCA+IHZhbHVlLmxlbmd0aCA/IG9sZFZhbHVlIDogdmFsdWU7XG4gICAgICAgIH0pO1xuICAgICAgICBjb21wb25lbnQudmFsdWUgPSBkaWZmLmpvaW4odmFsdWUpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29tcG9uZW50LnZhbHVlID0gZGlmZi5qb2luKG5ld1N0cmluZy5zbGljZShuZXdQb3MsIG5ld1BvcyArIGNvbXBvbmVudC5jb3VudCkpO1xuICAgICAgfVxuXG4gICAgICBuZXdQb3MgKz0gY29tcG9uZW50LmNvdW50OyAvLyBDb21tb24gY2FzZVxuXG4gICAgICBpZiAoIWNvbXBvbmVudC5hZGRlZCkge1xuICAgICAgICBvbGRQb3MgKz0gY29tcG9uZW50LmNvdW50O1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBjb21wb25lbnQudmFsdWUgPSBkaWZmLmpvaW4ob2xkU3RyaW5nLnNsaWNlKG9sZFBvcywgb2xkUG9zICsgY29tcG9uZW50LmNvdW50KSk7XG4gICAgICBvbGRQb3MgKz0gY29tcG9uZW50LmNvdW50OyAvLyBSZXZlcnNlIGFkZCBhbmQgcmVtb3ZlIHNvIHJlbW92ZXMgYXJlIG91dHB1dCBmaXJzdCB0byBtYXRjaCBjb21tb24gY29udmVudGlvblxuICAgICAgLy8gVGhlIGRpZmZpbmcgYWxnb3JpdGhtIGlzIHRpZWQgdG8gYWRkIHRoZW4gcmVtb3ZlIG91dHB1dCBhbmQgdGhpcyBpcyB0aGUgc2ltcGxlc3RcbiAgICAgIC8vIHJvdXRlIHRvIGdldCB0aGUgZGVzaXJlZCBvdXRwdXQgd2l0aCBtaW5pbWFsIG92ZXJoZWFkLlxuXG4gICAgICBpZiAoY29tcG9uZW50UG9zICYmIGNvbXBvbmVudHNbY29tcG9uZW50UG9zIC0gMV0uYWRkZWQpIHtcbiAgICAgICAgdmFyIHRtcCA9IGNvbXBvbmVudHNbY29tcG9uZW50UG9zIC0gMV07XG4gICAgICAgIGNvbXBvbmVudHNbY29tcG9uZW50UG9zIC0gMV0gPSBjb21wb25lbnRzW2NvbXBvbmVudFBvc107XG4gICAgICAgIGNvbXBvbmVudHNbY29tcG9uZW50UG9zXSA9IHRtcDtcbiAgICAgIH1cbiAgICB9XG4gIH0gLy8gU3BlY2lhbCBjYXNlIGhhbmRsZSBmb3Igd2hlbiBvbmUgdGVybWluYWwgaXMgaWdub3JlZCAoaS5lLiB3aGl0ZXNwYWNlKS5cbiAgLy8gRm9yIHRoaXMgY2FzZSB3ZSBtZXJnZSB0aGUgdGVybWluYWwgaW50byB0aGUgcHJpb3Igc3RyaW5nIGFuZCBkcm9wIHRoZSBjaGFuZ2UuXG4gIC8vIFRoaXMgaXMgb25seSBhdmFpbGFibGUgZm9yIHN0cmluZyBtb2RlLlxuXG5cbiAgdmFyIGxhc3RDb21wb25lbnQgPSBjb21wb25lbnRzW2NvbXBvbmVudExlbiAtIDFdO1xuXG4gIGlmIChjb21wb25lbnRMZW4gPiAxICYmIHR5cGVvZiBsYXN0Q29tcG9uZW50LnZhbHVlID09PSAnc3RyaW5nJyAmJiAobGFzdENvbXBvbmVudC5hZGRlZCB8fCBsYXN0Q29tcG9uZW50LnJlbW92ZWQpICYmIGRpZmYuZXF1YWxzKCcnLCBsYXN0Q29tcG9uZW50LnZhbHVlKSkge1xuICAgIGNvbXBvbmVudHNbY29tcG9uZW50TGVuIC0gMl0udmFsdWUgKz0gbGFzdENvbXBvbmVudC52YWx1ZTtcbiAgICBjb21wb25lbnRzLnBvcCgpO1xuICB9XG5cbiAgcmV0dXJuIGNvbXBvbmVudHM7XG59XG5cbmZ1bmN0aW9uIGNsb25lUGF0aChwYXRoKSB7XG4gIHJldHVybiB7XG4gICAgbmV3UG9zOiBwYXRoLm5ld1BvcyxcbiAgICBjb21wb25lbnRzOiBwYXRoLmNvbXBvbmVudHMuc2xpY2UoMClcbiAgfTtcbn1cblxudmFyIGNoYXJhY3RlckRpZmYgPSBuZXcgRGlmZigpO1xuZnVuY3Rpb24gZGlmZkNoYXJzKG9sZFN0ciwgbmV3U3RyLCBvcHRpb25zKSB7XG4gIHJldHVybiBjaGFyYWN0ZXJEaWZmLmRpZmYob2xkU3RyLCBuZXdTdHIsIG9wdGlvbnMpO1xufVxuXG5mdW5jdGlvbiBnZW5lcmF0ZU9wdGlvbnMob3B0aW9ucywgZGVmYXVsdHMpIHtcbiAgaWYgKHR5cGVvZiBvcHRpb25zID09PSAnZnVuY3Rpb24nKSB7XG4gICAgZGVmYXVsdHMuY2FsbGJhY2sgPSBvcHRpb25zO1xuICB9IGVsc2UgaWYgKG9wdGlvbnMpIHtcbiAgICBmb3IgKHZhciBuYW1lIGluIG9wdGlvbnMpIHtcbiAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBlbHNlICovXG4gICAgICBpZiAob3B0aW9ucy5oYXNPd25Qcm9wZXJ0eShuYW1lKSkge1xuICAgICAgICBkZWZhdWx0c1tuYW1lXSA9IG9wdGlvbnNbbmFtZV07XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGRlZmF1bHRzO1xufVxuXG4vL1xuLy8gUmFuZ2VzIGFuZCBleGNlcHRpb25zOlxuLy8gTGF0aW4tMSBTdXBwbGVtZW50LCAwMDgw4oCTMDBGRlxuLy8gIC0gVSswMEQ3ICDDlyBNdWx0aXBsaWNhdGlvbiBzaWduXG4vLyAgLSBVKzAwRjcgIMO3IERpdmlzaW9uIHNpZ25cbi8vIExhdGluIEV4dGVuZGVkLUEsIDAxMDDigJMwMTdGXG4vLyBMYXRpbiBFeHRlbmRlZC1CLCAwMTgw4oCTMDI0RlxuLy8gSVBBIEV4dGVuc2lvbnMsIDAyNTDigJMwMkFGXG4vLyBTcGFjaW5nIE1vZGlmaWVyIExldHRlcnMsIDAyQjDigJMwMkZGXG4vLyAgLSBVKzAyQzcgIMuHICYjNzExOyAgQ2Fyb25cbi8vICAtIFUrMDJEOCAgy5ggJiM3Mjg7ICBCcmV2ZVxuLy8gIC0gVSswMkQ5ICDLmSAmIzcyOTsgIERvdCBBYm92ZVxuLy8gIC0gVSswMkRBICDLmiAmIzczMDsgIFJpbmcgQWJvdmVcbi8vICAtIFUrMDJEQiAgy5sgJiM3MzE7ICBPZ29uZWtcbi8vICAtIFUrMDJEQyAgy5wgJiM3MzI7ICBTbWFsbCBUaWxkZVxuLy8gIC0gVSswMkREICDLnSAmIzczMzsgIERvdWJsZSBBY3V0ZSBBY2NlbnRcbi8vIExhdGluIEV4dGVuZGVkIEFkZGl0aW9uYWwsIDFFMDDigJMxRUZGXG5cbnZhciBleHRlbmRlZFdvcmRDaGFycyA9IC9eW0EtWmEtelxceEMwLVxcdTAyQzZcXHUwMkM4LVxcdTAyRDdcXHUwMkRFLVxcdTAyRkZcXHUxRTAwLVxcdTFFRkZdKyQvO1xudmFyIHJlV2hpdGVzcGFjZSA9IC9cXFMvO1xudmFyIHdvcmREaWZmID0gbmV3IERpZmYoKTtcblxud29yZERpZmYuZXF1YWxzID0gZnVuY3Rpb24gKGxlZnQsIHJpZ2h0KSB7XG4gIGlmICh0aGlzLm9wdGlvbnMuaWdub3JlQ2FzZSkge1xuICAgIGxlZnQgPSBsZWZ0LnRvTG93ZXJDYXNlKCk7XG4gICAgcmlnaHQgPSByaWdodC50b0xvd2VyQ2FzZSgpO1xuICB9XG5cbiAgcmV0dXJuIGxlZnQgPT09IHJpZ2h0IHx8IHRoaXMub3B0aW9ucy5pZ25vcmVXaGl0ZXNwYWNlICYmICFyZVdoaXRlc3BhY2UudGVzdChsZWZ0KSAmJiAhcmVXaGl0ZXNwYWNlLnRlc3QocmlnaHQpO1xufTtcblxud29yZERpZmYudG9rZW5pemUgPSBmdW5jdGlvbiAodmFsdWUpIHtcbiAgLy8gQWxsIHdoaXRlc3BhY2Ugc3ltYm9scyBleGNlcHQgbmV3bGluZSBncm91cCBpbnRvIG9uZSB0b2tlbiwgZWFjaCBuZXdsaW5lIC0gaW4gc2VwYXJhdGUgdG9rZW5cbiAgdmFyIHRva2VucyA9IHZhbHVlLnNwbGl0KC8oW15cXFNcXHJcXG5dK3xbKClbXFxde30nXCJcXHJcXG5dfFxcYikvKTsgLy8gSm9pbiB0aGUgYm91bmRhcnkgc3BsaXRzIHRoYXQgd2UgZG8gbm90IGNvbnNpZGVyIHRvIGJlIGJvdW5kYXJpZXMuIFRoaXMgaXMgcHJpbWFyaWx5IHRoZSBleHRlbmRlZCBMYXRpbiBjaGFyYWN0ZXIgc2V0LlxuXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgdG9rZW5zLmxlbmd0aCAtIDE7IGkrKykge1xuICAgIC8vIElmIHdlIGhhdmUgYW4gZW1wdHkgc3RyaW5nIGluIHRoZSBuZXh0IGZpZWxkIGFuZCB3ZSBoYXZlIG9ubHkgd29yZCBjaGFycyBiZWZvcmUgYW5kIGFmdGVyLCBtZXJnZVxuICAgIGlmICghdG9rZW5zW2kgKyAxXSAmJiB0b2tlbnNbaSArIDJdICYmIGV4dGVuZGVkV29yZENoYXJzLnRlc3QodG9rZW5zW2ldKSAmJiBleHRlbmRlZFdvcmRDaGFycy50ZXN0KHRva2Vuc1tpICsgMl0pKSB7XG4gICAgICB0b2tlbnNbaV0gKz0gdG9rZW5zW2kgKyAyXTtcbiAgICAgIHRva2Vucy5zcGxpY2UoaSArIDEsIDIpO1xuICAgICAgaS0tO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiB0b2tlbnM7XG59O1xuXG5mdW5jdGlvbiBkaWZmV29yZHMob2xkU3RyLCBuZXdTdHIsIG9wdGlvbnMpIHtcbiAgb3B0aW9ucyA9IGdlbmVyYXRlT3B0aW9ucyhvcHRpb25zLCB7XG4gICAgaWdub3JlV2hpdGVzcGFjZTogdHJ1ZVxuICB9KTtcbiAgcmV0dXJuIHdvcmREaWZmLmRpZmYob2xkU3RyLCBuZXdTdHIsIG9wdGlvbnMpO1xufVxuZnVuY3Rpb24gZGlmZldvcmRzV2l0aFNwYWNlKG9sZFN0ciwgbmV3U3RyLCBvcHRpb25zKSB7XG4gIHJldHVybiB3b3JkRGlmZi5kaWZmKG9sZFN0ciwgbmV3U3RyLCBvcHRpb25zKTtcbn1cblxudmFyIGxpbmVEaWZmID0gbmV3IERpZmYoKTtcblxubGluZURpZmYudG9rZW5pemUgPSBmdW5jdGlvbiAodmFsdWUpIHtcbiAgdmFyIHJldExpbmVzID0gW10sXG4gICAgICBsaW5lc0FuZE5ld2xpbmVzID0gdmFsdWUuc3BsaXQoLyhcXG58XFxyXFxuKS8pOyAvLyBJZ25vcmUgdGhlIGZpbmFsIGVtcHR5IHRva2VuIHRoYXQgb2NjdXJzIGlmIHRoZSBzdHJpbmcgZW5kcyB3aXRoIGEgbmV3IGxpbmVcblxuICBpZiAoIWxpbmVzQW5kTmV3bGluZXNbbGluZXNBbmROZXdsaW5lcy5sZW5ndGggLSAxXSkge1xuICAgIGxpbmVzQW5kTmV3bGluZXMucG9wKCk7XG4gIH0gLy8gTWVyZ2UgdGhlIGNvbnRlbnQgYW5kIGxpbmUgc2VwYXJhdG9ycyBpbnRvIHNpbmdsZSB0b2tlbnNcblxuXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbGluZXNBbmROZXdsaW5lcy5sZW5ndGg7IGkrKykge1xuICAgIHZhciBsaW5lID0gbGluZXNBbmROZXdsaW5lc1tpXTtcblxuICAgIGlmIChpICUgMiAmJiAhdGhpcy5vcHRpb25zLm5ld2xpbmVJc1Rva2VuKSB7XG4gICAgICByZXRMaW5lc1tyZXRMaW5lcy5sZW5ndGggLSAxXSArPSBsaW5lO1xuICAgIH0gZWxzZSB7XG4gICAgICBpZiAodGhpcy5vcHRpb25zLmlnbm9yZVdoaXRlc3BhY2UpIHtcbiAgICAgICAgbGluZSA9IGxpbmUudHJpbSgpO1xuICAgICAgfVxuXG4gICAgICByZXRMaW5lcy5wdXNoKGxpbmUpO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiByZXRMaW5lcztcbn07XG5cbmZ1bmN0aW9uIGRpZmZMaW5lcyhvbGRTdHIsIG5ld1N0ciwgY2FsbGJhY2spIHtcbiAgcmV0dXJuIGxpbmVEaWZmLmRpZmYob2xkU3RyLCBuZXdTdHIsIGNhbGxiYWNrKTtcbn1cbmZ1bmN0aW9uIGRpZmZUcmltbWVkTGluZXMob2xkU3RyLCBuZXdTdHIsIGNhbGxiYWNrKSB7XG4gIHZhciBvcHRpb25zID0gZ2VuZXJhdGVPcHRpb25zKGNhbGxiYWNrLCB7XG4gICAgaWdub3JlV2hpdGVzcGFjZTogdHJ1ZVxuICB9KTtcbiAgcmV0dXJuIGxpbmVEaWZmLmRpZmYob2xkU3RyLCBuZXdTdHIsIG9wdGlvbnMpO1xufVxuXG52YXIgc2VudGVuY2VEaWZmID0gbmV3IERpZmYoKTtcblxuc2VudGVuY2VEaWZmLnRva2VuaXplID0gZnVuY3Rpb24gKHZhbHVlKSB7XG4gIHJldHVybiB2YWx1ZS5zcGxpdCgvKFxcUy4rP1suIT9dKSg/PVxccyt8JCkvKTtcbn07XG5cbmZ1bmN0aW9uIGRpZmZTZW50ZW5jZXMob2xkU3RyLCBuZXdTdHIsIGNhbGxiYWNrKSB7XG4gIHJldHVybiBzZW50ZW5jZURpZmYuZGlmZihvbGRTdHIsIG5ld1N0ciwgY2FsbGJhY2spO1xufVxuXG52YXIgY3NzRGlmZiA9IG5ldyBEaWZmKCk7XG5cbmNzc0RpZmYudG9rZW5pemUgPSBmdW5jdGlvbiAodmFsdWUpIHtcbiAgcmV0dXJuIHZhbHVlLnNwbGl0KC8oW3t9OjssXXxcXHMrKS8pO1xufTtcblxuZnVuY3Rpb24gZGlmZkNzcyhvbGRTdHIsIG5ld1N0ciwgY2FsbGJhY2spIHtcbiAgcmV0dXJuIGNzc0RpZmYuZGlmZihvbGRTdHIsIG5ld1N0ciwgY2FsbGJhY2spO1xufVxuXG5mdW5jdGlvbiBfdHlwZW9mKG9iaikge1xuICBcIkBiYWJlbC9oZWxwZXJzIC0gdHlwZW9mXCI7XG5cbiAgaWYgKHR5cGVvZiBTeW1ib2wgPT09IFwiZnVuY3Rpb25cIiAmJiB0eXBlb2YgU3ltYm9sLml0ZXJhdG9yID09PSBcInN5bWJvbFwiKSB7XG4gICAgX3R5cGVvZiA9IGZ1bmN0aW9uIChvYmopIHtcbiAgICAgIHJldHVybiB0eXBlb2Ygb2JqO1xuICAgIH07XG4gIH0gZWxzZSB7XG4gICAgX3R5cGVvZiA9IGZ1bmN0aW9uIChvYmopIHtcbiAgICAgIHJldHVybiBvYmogJiYgdHlwZW9mIFN5bWJvbCA9PT0gXCJmdW5jdGlvblwiICYmIG9iai5jb25zdHJ1Y3RvciA9PT0gU3ltYm9sICYmIG9iaiAhPT0gU3ltYm9sLnByb3RvdHlwZSA/IFwic3ltYm9sXCIgOiB0eXBlb2Ygb2JqO1xuICAgIH07XG4gIH1cblxuICByZXR1cm4gX3R5cGVvZihvYmopO1xufVxuXG5mdW5jdGlvbiBfdG9Db25zdW1hYmxlQXJyYXkoYXJyKSB7XG4gIHJldHVybiBfYXJyYXlXaXRob3V0SG9sZXMoYXJyKSB8fCBfaXRlcmFibGVUb0FycmF5KGFycikgfHwgX3Vuc3VwcG9ydGVkSXRlcmFibGVUb0FycmF5KGFycikgfHwgX25vbkl0ZXJhYmxlU3ByZWFkKCk7XG59XG5cbmZ1bmN0aW9uIF9hcnJheVdpdGhvdXRIb2xlcyhhcnIpIHtcbiAgaWYgKEFycmF5LmlzQXJyYXkoYXJyKSkgcmV0dXJuIF9hcnJheUxpa2VUb0FycmF5KGFycik7XG59XG5cbmZ1bmN0aW9uIF9pdGVyYWJsZVRvQXJyYXkoaXRlcikge1xuICBpZiAodHlwZW9mIFN5bWJvbCAhPT0gXCJ1bmRlZmluZWRcIiAmJiBTeW1ib2wuaXRlcmF0b3IgaW4gT2JqZWN0KGl0ZXIpKSByZXR1cm4gQXJyYXkuZnJvbShpdGVyKTtcbn1cblxuZnVuY3Rpb24gX3Vuc3VwcG9ydGVkSXRlcmFibGVUb0FycmF5KG8sIG1pbkxlbikge1xuICBpZiAoIW8pIHJldHVybjtcbiAgaWYgKHR5cGVvZiBvID09PSBcInN0cmluZ1wiKSByZXR1cm4gX2FycmF5TGlrZVRvQXJyYXkobywgbWluTGVuKTtcbiAgdmFyIG4gPSBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwobykuc2xpY2UoOCwgLTEpO1xuICBpZiAobiA9PT0gXCJPYmplY3RcIiAmJiBvLmNvbnN0cnVjdG9yKSBuID0gby5jb25zdHJ1Y3Rvci5uYW1lO1xuICBpZiAobiA9PT0gXCJNYXBcIiB8fCBuID09PSBcIlNldFwiKSByZXR1cm4gQXJyYXkuZnJvbShvKTtcbiAgaWYgKG4gPT09IFwiQXJndW1lbnRzXCIgfHwgL14oPzpVaXxJKW50KD86OHwxNnwzMikoPzpDbGFtcGVkKT9BcnJheSQvLnRlc3QobikpIHJldHVybiBfYXJyYXlMaWtlVG9BcnJheShvLCBtaW5MZW4pO1xufVxuXG5mdW5jdGlvbiBfYXJyYXlMaWtlVG9BcnJheShhcnIsIGxlbikge1xuICBpZiAobGVuID09IG51bGwgfHwgbGVuID4gYXJyLmxlbmd0aCkgbGVuID0gYXJyLmxlbmd0aDtcblxuICBmb3IgKHZhciBpID0gMCwgYXJyMiA9IG5ldyBBcnJheShsZW4pOyBpIDwgbGVuOyBpKyspIGFycjJbaV0gPSBhcnJbaV07XG5cbiAgcmV0dXJuIGFycjI7XG59XG5cbmZ1bmN0aW9uIF9ub25JdGVyYWJsZVNwcmVhZCgpIHtcbiAgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkludmFsaWQgYXR0ZW1wdCB0byBzcHJlYWQgbm9uLWl0ZXJhYmxlIGluc3RhbmNlLlxcbkluIG9yZGVyIHRvIGJlIGl0ZXJhYmxlLCBub24tYXJyYXkgb2JqZWN0cyBtdXN0IGhhdmUgYSBbU3ltYm9sLml0ZXJhdG9yXSgpIG1ldGhvZC5cIik7XG59XG5cbnZhciBvYmplY3RQcm90b3R5cGVUb1N0cmluZyA9IE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmc7XG52YXIganNvbkRpZmYgPSBuZXcgRGlmZigpOyAvLyBEaXNjcmltaW5hdGUgYmV0d2VlbiB0d28gbGluZXMgb2YgcHJldHR5LXByaW50ZWQsIHNlcmlhbGl6ZWQgSlNPTiB3aGVyZSBvbmUgb2YgdGhlbSBoYXMgYVxuLy8gZGFuZ2xpbmcgY29tbWEgYW5kIHRoZSBvdGhlciBkb2Vzbid0LiBUdXJucyBvdXQgaW5jbHVkaW5nIHRoZSBkYW5nbGluZyBjb21tYSB5aWVsZHMgdGhlIG5pY2VzdCBvdXRwdXQ6XG5cbmpzb25EaWZmLnVzZUxvbmdlc3RUb2tlbiA9IHRydWU7XG5qc29uRGlmZi50b2tlbml6ZSA9IGxpbmVEaWZmLnRva2VuaXplO1xuXG5qc29uRGlmZi5jYXN0SW5wdXQgPSBmdW5jdGlvbiAodmFsdWUpIHtcbiAgdmFyIF90aGlzJG9wdGlvbnMgPSB0aGlzLm9wdGlvbnMsXG4gICAgICB1bmRlZmluZWRSZXBsYWNlbWVudCA9IF90aGlzJG9wdGlvbnMudW5kZWZpbmVkUmVwbGFjZW1lbnQsXG4gICAgICBfdGhpcyRvcHRpb25zJHN0cmluZ2kgPSBfdGhpcyRvcHRpb25zLnN0cmluZ2lmeVJlcGxhY2VyLFxuICAgICAgc3RyaW5naWZ5UmVwbGFjZXIgPSBfdGhpcyRvcHRpb25zJHN0cmluZ2kgPT09IHZvaWQgMCA/IGZ1bmN0aW9uIChrLCB2KSB7XG4gICAgcmV0dXJuIHR5cGVvZiB2ID09PSAndW5kZWZpbmVkJyA/IHVuZGVmaW5lZFJlcGxhY2VtZW50IDogdjtcbiAgfSA6IF90aGlzJG9wdGlvbnMkc3RyaW5naTtcbiAgcmV0dXJuIHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZycgPyB2YWx1ZSA6IEpTT04uc3RyaW5naWZ5KGNhbm9uaWNhbGl6ZSh2YWx1ZSwgbnVsbCwgbnVsbCwgc3RyaW5naWZ5UmVwbGFjZXIpLCBzdHJpbmdpZnlSZXBsYWNlciwgJyAgJyk7XG59O1xuXG5qc29uRGlmZi5lcXVhbHMgPSBmdW5jdGlvbiAobGVmdCwgcmlnaHQpIHtcbiAgcmV0dXJuIERpZmYucHJvdG90eXBlLmVxdWFscy5jYWxsKGpzb25EaWZmLCBsZWZ0LnJlcGxhY2UoLywoW1xcclxcbl0pL2csICckMScpLCByaWdodC5yZXBsYWNlKC8sKFtcXHJcXG5dKS9nLCAnJDEnKSk7XG59O1xuXG5mdW5jdGlvbiBkaWZmSnNvbihvbGRPYmosIG5ld09iaiwgb3B0aW9ucykge1xuICByZXR1cm4ganNvbkRpZmYuZGlmZihvbGRPYmosIG5ld09iaiwgb3B0aW9ucyk7XG59IC8vIFRoaXMgZnVuY3Rpb24gaGFuZGxlcyB0aGUgcHJlc2VuY2Ugb2YgY2lyY3VsYXIgcmVmZXJlbmNlcyBieSBiYWlsaW5nIG91dCB3aGVuIGVuY291bnRlcmluZyBhblxuLy8gb2JqZWN0IHRoYXQgaXMgYWxyZWFkeSBvbiB0aGUgXCJzdGFja1wiIG9mIGl0ZW1zIGJlaW5nIHByb2Nlc3NlZC4gQWNjZXB0cyBhbiBvcHRpb25hbCByZXBsYWNlclxuXG5mdW5jdGlvbiBjYW5vbmljYWxpemUob2JqLCBzdGFjaywgcmVwbGFjZW1lbnRTdGFjaywgcmVwbGFjZXIsIGtleSkge1xuICBzdGFjayA9IHN0YWNrIHx8IFtdO1xuICByZXBsYWNlbWVudFN0YWNrID0gcmVwbGFjZW1lbnRTdGFjayB8fCBbXTtcblxuICBpZiAocmVwbGFjZXIpIHtcbiAgICBvYmogPSByZXBsYWNlcihrZXksIG9iaik7XG4gIH1cblxuICB2YXIgaTtcblxuICBmb3IgKGkgPSAwOyBpIDwgc3RhY2subGVuZ3RoOyBpICs9IDEpIHtcbiAgICBpZiAoc3RhY2tbaV0gPT09IG9iaikge1xuICAgICAgcmV0dXJuIHJlcGxhY2VtZW50U3RhY2tbaV07XG4gICAgfVxuICB9XG5cbiAgdmFyIGNhbm9uaWNhbGl6ZWRPYmo7XG5cbiAgaWYgKCdbb2JqZWN0IEFycmF5XScgPT09IG9iamVjdFByb3RvdHlwZVRvU3RyaW5nLmNhbGwob2JqKSkge1xuICAgIHN0YWNrLnB1c2gob2JqKTtcbiAgICBjYW5vbmljYWxpemVkT2JqID0gbmV3IEFycmF5KG9iai5sZW5ndGgpO1xuICAgIHJlcGxhY2VtZW50U3RhY2sucHVzaChjYW5vbmljYWxpemVkT2JqKTtcblxuICAgIGZvciAoaSA9IDA7IGkgPCBvYmoubGVuZ3RoOyBpICs9IDEpIHtcbiAgICAgIGNhbm9uaWNhbGl6ZWRPYmpbaV0gPSBjYW5vbmljYWxpemUob2JqW2ldLCBzdGFjaywgcmVwbGFjZW1lbnRTdGFjaywgcmVwbGFjZXIsIGtleSk7XG4gICAgfVxuXG4gICAgc3RhY2sucG9wKCk7XG4gICAgcmVwbGFjZW1lbnRTdGFjay5wb3AoKTtcbiAgICByZXR1cm4gY2Fub25pY2FsaXplZE9iajtcbiAgfVxuXG4gIGlmIChvYmogJiYgb2JqLnRvSlNPTikge1xuICAgIG9iaiA9IG9iai50b0pTT04oKTtcbiAgfVxuXG4gIGlmIChfdHlwZW9mKG9iaikgPT09ICdvYmplY3QnICYmIG9iaiAhPT0gbnVsbCkge1xuICAgIHN0YWNrLnB1c2gob2JqKTtcbiAgICBjYW5vbmljYWxpemVkT2JqID0ge307XG4gICAgcmVwbGFjZW1lbnRTdGFjay5wdXNoKGNhbm9uaWNhbGl6ZWRPYmopO1xuXG4gICAgdmFyIHNvcnRlZEtleXMgPSBbXSxcbiAgICAgICAgX2tleTtcblxuICAgIGZvciAoX2tleSBpbiBvYmopIHtcbiAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBlbHNlICovXG4gICAgICBpZiAob2JqLmhhc093blByb3BlcnR5KF9rZXkpKSB7XG4gICAgICAgIHNvcnRlZEtleXMucHVzaChfa2V5KTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBzb3J0ZWRLZXlzLnNvcnQoKTtcblxuICAgIGZvciAoaSA9IDA7IGkgPCBzb3J0ZWRLZXlzLmxlbmd0aDsgaSArPSAxKSB7XG4gICAgICBfa2V5ID0gc29ydGVkS2V5c1tpXTtcbiAgICAgIGNhbm9uaWNhbGl6ZWRPYmpbX2tleV0gPSBjYW5vbmljYWxpemUob2JqW19rZXldLCBzdGFjaywgcmVwbGFjZW1lbnRTdGFjaywgcmVwbGFjZXIsIF9rZXkpO1xuICAgIH1cblxuICAgIHN0YWNrLnBvcCgpO1xuICAgIHJlcGxhY2VtZW50U3RhY2sucG9wKCk7XG4gIH0gZWxzZSB7XG4gICAgY2Fub25pY2FsaXplZE9iaiA9IG9iajtcbiAgfVxuXG4gIHJldHVybiBjYW5vbmljYWxpemVkT2JqO1xufVxuXG52YXIgYXJyYXlEaWZmID0gbmV3IERpZmYoKTtcblxuYXJyYXlEaWZmLnRva2VuaXplID0gZnVuY3Rpb24gKHZhbHVlKSB7XG4gIHJldHVybiB2YWx1ZS5zbGljZSgpO1xufTtcblxuYXJyYXlEaWZmLmpvaW4gPSBhcnJheURpZmYucmVtb3ZlRW1wdHkgPSBmdW5jdGlvbiAodmFsdWUpIHtcbiAgcmV0dXJuIHZhbHVlO1xufTtcblxuZnVuY3Rpb24gZGlmZkFycmF5cyhvbGRBcnIsIG5ld0FyciwgY2FsbGJhY2spIHtcbiAgcmV0dXJuIGFycmF5RGlmZi5kaWZmKG9sZEFyciwgbmV3QXJyLCBjYWxsYmFjayk7XG59XG5cbmZ1bmN0aW9uIHBhcnNlUGF0Y2godW5pRGlmZikge1xuICB2YXIgb3B0aW9ucyA9IGFyZ3VtZW50cy5sZW5ndGggPiAxICYmIGFyZ3VtZW50c1sxXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzFdIDoge307XG4gIHZhciBkaWZmc3RyID0gdW5pRGlmZi5zcGxpdCgvXFxyXFxufFtcXG5cXHZcXGZcXHJcXHg4NV0vKSxcbiAgICAgIGRlbGltaXRlcnMgPSB1bmlEaWZmLm1hdGNoKC9cXHJcXG58W1xcblxcdlxcZlxcclxceDg1XS9nKSB8fCBbXSxcbiAgICAgIGxpc3QgPSBbXSxcbiAgICAgIGkgPSAwO1xuXG4gIGZ1bmN0aW9uIHBhcnNlSW5kZXgoKSB7XG4gICAgdmFyIGluZGV4ID0ge307XG4gICAgbGlzdC5wdXNoKGluZGV4KTsgLy8gUGFyc2UgZGlmZiBtZXRhZGF0YVxuXG4gICAgd2hpbGUgKGkgPCBkaWZmc3RyLmxlbmd0aCkge1xuICAgICAgdmFyIGxpbmUgPSBkaWZmc3RyW2ldOyAvLyBGaWxlIGhlYWRlciBmb3VuZCwgZW5kIHBhcnNpbmcgZGlmZiBtZXRhZGF0YVxuXG4gICAgICBpZiAoL14oXFwtXFwtXFwtfFxcK1xcK1xcK3xAQClcXHMvLnRlc3QobGluZSkpIHtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9IC8vIERpZmYgaW5kZXhcblxuXG4gICAgICB2YXIgaGVhZGVyID0gL14oPzpJbmRleDp8ZGlmZig/OiAtciBcXHcrKSspXFxzKyguKz8pXFxzKiQvLmV4ZWMobGluZSk7XG5cbiAgICAgIGlmIChoZWFkZXIpIHtcbiAgICAgICAgaW5kZXguaW5kZXggPSBoZWFkZXJbMV07XG4gICAgICB9XG5cbiAgICAgIGkrKztcbiAgICB9IC8vIFBhcnNlIGZpbGUgaGVhZGVycyBpZiB0aGV5IGFyZSBkZWZpbmVkLiBVbmlmaWVkIGRpZmYgcmVxdWlyZXMgdGhlbSwgYnV0XG4gICAgLy8gdGhlcmUncyBubyB0ZWNobmljYWwgaXNzdWVzIHRvIGhhdmUgYW4gaXNvbGF0ZWQgaHVuayB3aXRob3V0IGZpbGUgaGVhZGVyXG5cblxuICAgIHBhcnNlRmlsZUhlYWRlcihpbmRleCk7XG4gICAgcGFyc2VGaWxlSGVhZGVyKGluZGV4KTsgLy8gUGFyc2UgaHVua3NcblxuICAgIGluZGV4Lmh1bmtzID0gW107XG5cbiAgICB3aGlsZSAoaSA8IGRpZmZzdHIubGVuZ3RoKSB7XG4gICAgICB2YXIgX2xpbmUgPSBkaWZmc3RyW2ldO1xuXG4gICAgICBpZiAoL14oSW5kZXg6fGRpZmZ8XFwtXFwtXFwtfFxcK1xcK1xcKylcXHMvLnRlc3QoX2xpbmUpKSB7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfSBlbHNlIGlmICgvXkBALy50ZXN0KF9saW5lKSkge1xuICAgICAgICBpbmRleC5odW5rcy5wdXNoKHBhcnNlSHVuaygpKTtcbiAgICAgIH0gZWxzZSBpZiAoX2xpbmUgJiYgb3B0aW9ucy5zdHJpY3QpIHtcbiAgICAgICAgLy8gSWdub3JlIHVuZXhwZWN0ZWQgY29udGVudCB1bmxlc3MgaW4gc3RyaWN0IG1vZGVcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdVbmtub3duIGxpbmUgJyArIChpICsgMSkgKyAnICcgKyBKU09OLnN0cmluZ2lmeShfbGluZSkpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaSsrO1xuICAgICAgfVxuICAgIH1cbiAgfSAvLyBQYXJzZXMgdGhlIC0tLSBhbmQgKysrIGhlYWRlcnMsIGlmIG5vbmUgYXJlIGZvdW5kLCBubyBsaW5lc1xuICAvLyBhcmUgY29uc3VtZWQuXG5cblxuICBmdW5jdGlvbiBwYXJzZUZpbGVIZWFkZXIoaW5kZXgpIHtcbiAgICB2YXIgZmlsZUhlYWRlciA9IC9eKC0tLXxcXCtcXCtcXCspXFxzKyguKikkLy5leGVjKGRpZmZzdHJbaV0pO1xuXG4gICAgaWYgKGZpbGVIZWFkZXIpIHtcbiAgICAgIHZhciBrZXlQcmVmaXggPSBmaWxlSGVhZGVyWzFdID09PSAnLS0tJyA/ICdvbGQnIDogJ25ldyc7XG4gICAgICB2YXIgZGF0YSA9IGZpbGVIZWFkZXJbMl0uc3BsaXQoJ1xcdCcsIDIpO1xuICAgICAgdmFyIGZpbGVOYW1lID0gZGF0YVswXS5yZXBsYWNlKC9cXFxcXFxcXC9nLCAnXFxcXCcpO1xuXG4gICAgICBpZiAoL15cIi4qXCIkLy50ZXN0KGZpbGVOYW1lKSkge1xuICAgICAgICBmaWxlTmFtZSA9IGZpbGVOYW1lLnN1YnN0cigxLCBmaWxlTmFtZS5sZW5ndGggLSAyKTtcbiAgICAgIH1cblxuICAgICAgaW5kZXhba2V5UHJlZml4ICsgJ0ZpbGVOYW1lJ10gPSBmaWxlTmFtZTtcbiAgICAgIGluZGV4W2tleVByZWZpeCArICdIZWFkZXInXSA9IChkYXRhWzFdIHx8ICcnKS50cmltKCk7XG4gICAgICBpKys7XG4gICAgfVxuICB9IC8vIFBhcnNlcyBhIGh1bmtcbiAgLy8gVGhpcyBhc3N1bWVzIHRoYXQgd2UgYXJlIGF0IHRoZSBzdGFydCBvZiBhIGh1bmsuXG5cblxuICBmdW5jdGlvbiBwYXJzZUh1bmsoKSB7XG4gICAgdmFyIGNodW5rSGVhZGVySW5kZXggPSBpLFxuICAgICAgICBjaHVua0hlYWRlckxpbmUgPSBkaWZmc3RyW2krK10sXG4gICAgICAgIGNodW5rSGVhZGVyID0gY2h1bmtIZWFkZXJMaW5lLnNwbGl0KC9AQCAtKFxcZCspKD86LChcXGQrKSk/IFxcKyhcXGQrKSg/OiwoXFxkKykpPyBAQC8pO1xuICAgIHZhciBodW5rID0ge1xuICAgICAgb2xkU3RhcnQ6ICtjaHVua0hlYWRlclsxXSxcbiAgICAgIG9sZExpbmVzOiB0eXBlb2YgY2h1bmtIZWFkZXJbMl0gPT09ICd1bmRlZmluZWQnID8gMSA6ICtjaHVua0hlYWRlclsyXSxcbiAgICAgIG5ld1N0YXJ0OiArY2h1bmtIZWFkZXJbM10sXG4gICAgICBuZXdMaW5lczogdHlwZW9mIGNodW5rSGVhZGVyWzRdID09PSAndW5kZWZpbmVkJyA/IDEgOiArY2h1bmtIZWFkZXJbNF0sXG4gICAgICBsaW5lczogW10sXG4gICAgICBsaW5lZGVsaW1pdGVyczogW11cbiAgICB9OyAvLyBVbmlmaWVkIERpZmYgRm9ybWF0IHF1aXJrOiBJZiB0aGUgY2h1bmsgc2l6ZSBpcyAwLFxuICAgIC8vIHRoZSBmaXJzdCBudW1iZXIgaXMgb25lIGxvd2VyIHRoYW4gb25lIHdvdWxkIGV4cGVjdC5cbiAgICAvLyBodHRwczovL3d3dy5hcnRpbWEuY29tL3dlYmxvZ3Mvdmlld3Bvc3QuanNwP3RocmVhZD0xNjQyOTNcblxuICAgIGlmIChodW5rLm9sZExpbmVzID09PSAwKSB7XG4gICAgICBodW5rLm9sZFN0YXJ0ICs9IDE7XG4gICAgfVxuXG4gICAgaWYgKGh1bmsubmV3TGluZXMgPT09IDApIHtcbiAgICAgIGh1bmsubmV3U3RhcnQgKz0gMTtcbiAgICB9XG5cbiAgICB2YXIgYWRkQ291bnQgPSAwLFxuICAgICAgICByZW1vdmVDb3VudCA9IDA7XG5cbiAgICBmb3IgKDsgaSA8IGRpZmZzdHIubGVuZ3RoOyBpKyspIHtcbiAgICAgIC8vIExpbmVzIHN0YXJ0aW5nIHdpdGggJy0tLScgY291bGQgYmUgbWlzdGFrZW4gZm9yIHRoZSBcInJlbW92ZSBsaW5lXCIgb3BlcmF0aW9uXG4gICAgICAvLyBCdXQgdGhleSBjb3VsZCBiZSB0aGUgaGVhZGVyIGZvciB0aGUgbmV4dCBmaWxlLiBUaGVyZWZvcmUgcHJ1bmUgc3VjaCBjYXNlcyBvdXQuXG4gICAgICBpZiAoZGlmZnN0cltpXS5pbmRleE9mKCctLS0gJykgPT09IDAgJiYgaSArIDIgPCBkaWZmc3RyLmxlbmd0aCAmJiBkaWZmc3RyW2kgKyAxXS5pbmRleE9mKCcrKysgJykgPT09IDAgJiYgZGlmZnN0cltpICsgMl0uaW5kZXhPZignQEAnKSA9PT0gMCkge1xuICAgICAgICBicmVhaztcbiAgICAgIH1cblxuICAgICAgdmFyIG9wZXJhdGlvbiA9IGRpZmZzdHJbaV0ubGVuZ3RoID09IDAgJiYgaSAhPSBkaWZmc3RyLmxlbmd0aCAtIDEgPyAnICcgOiBkaWZmc3RyW2ldWzBdO1xuXG4gICAgICBpZiAob3BlcmF0aW9uID09PSAnKycgfHwgb3BlcmF0aW9uID09PSAnLScgfHwgb3BlcmF0aW9uID09PSAnICcgfHwgb3BlcmF0aW9uID09PSAnXFxcXCcpIHtcbiAgICAgICAgaHVuay5saW5lcy5wdXNoKGRpZmZzdHJbaV0pO1xuICAgICAgICBodW5rLmxpbmVkZWxpbWl0ZXJzLnB1c2goZGVsaW1pdGVyc1tpXSB8fCAnXFxuJyk7XG5cbiAgICAgICAgaWYgKG9wZXJhdGlvbiA9PT0gJysnKSB7XG4gICAgICAgICAgYWRkQ291bnQrKztcbiAgICAgICAgfSBlbHNlIGlmIChvcGVyYXRpb24gPT09ICctJykge1xuICAgICAgICAgIHJlbW92ZUNvdW50Kys7XG4gICAgICAgIH0gZWxzZSBpZiAob3BlcmF0aW9uID09PSAnICcpIHtcbiAgICAgICAgICBhZGRDb3VudCsrO1xuICAgICAgICAgIHJlbW92ZUNvdW50Kys7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH0gLy8gSGFuZGxlIHRoZSBlbXB0eSBibG9jayBjb3VudCBjYXNlXG5cblxuICAgIGlmICghYWRkQ291bnQgJiYgaHVuay5uZXdMaW5lcyA9PT0gMSkge1xuICAgICAgaHVuay5uZXdMaW5lcyA9IDA7XG4gICAgfVxuXG4gICAgaWYgKCFyZW1vdmVDb3VudCAmJiBodW5rLm9sZExpbmVzID09PSAxKSB7XG4gICAgICBodW5rLm9sZExpbmVzID0gMDtcbiAgICB9IC8vIFBlcmZvcm0gb3B0aW9uYWwgc2FuaXR5IGNoZWNraW5nXG5cblxuICAgIGlmIChvcHRpb25zLnN0cmljdCkge1xuICAgICAgaWYgKGFkZENvdW50ICE9PSBodW5rLm5ld0xpbmVzKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignQWRkZWQgbGluZSBjb3VudCBkaWQgbm90IG1hdGNoIGZvciBodW5rIGF0IGxpbmUgJyArIChjaHVua0hlYWRlckluZGV4ICsgMSkpO1xuICAgICAgfVxuXG4gICAgICBpZiAocmVtb3ZlQ291bnQgIT09IGh1bmsub2xkTGluZXMpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdSZW1vdmVkIGxpbmUgY291bnQgZGlkIG5vdCBtYXRjaCBmb3IgaHVuayBhdCBsaW5lICcgKyAoY2h1bmtIZWFkZXJJbmRleCArIDEpKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gaHVuaztcbiAgfVxuXG4gIHdoaWxlIChpIDwgZGlmZnN0ci5sZW5ndGgpIHtcbiAgICBwYXJzZUluZGV4KCk7XG4gIH1cblxuICByZXR1cm4gbGlzdDtcbn1cblxuLy8gSXRlcmF0b3IgdGhhdCB0cmF2ZXJzZXMgaW4gdGhlIHJhbmdlIG9mIFttaW4sIG1heF0sIHN0ZXBwaW5nXG4vLyBieSBkaXN0YW5jZSBmcm9tIGEgZ2l2ZW4gc3RhcnQgcG9zaXRpb24uIEkuZS4gZm9yIFswLCA0XSwgd2l0aFxuLy8gc3RhcnQgb2YgMiwgdGhpcyB3aWxsIGl0ZXJhdGUgMiwgMywgMSwgNCwgMC5cbmZ1bmN0aW9uIGRpc3RhbmNlSXRlcmF0b3IgKHN0YXJ0LCBtaW5MaW5lLCBtYXhMaW5lKSB7XG4gIHZhciB3YW50Rm9yd2FyZCA9IHRydWUsXG4gICAgICBiYWNrd2FyZEV4aGF1c3RlZCA9IGZhbHNlLFxuICAgICAgZm9yd2FyZEV4aGF1c3RlZCA9IGZhbHNlLFxuICAgICAgbG9jYWxPZmZzZXQgPSAxO1xuICByZXR1cm4gZnVuY3Rpb24gaXRlcmF0b3IoKSB7XG4gICAgaWYgKHdhbnRGb3J3YXJkICYmICFmb3J3YXJkRXhoYXVzdGVkKSB7XG4gICAgICBpZiAoYmFja3dhcmRFeGhhdXN0ZWQpIHtcbiAgICAgICAgbG9jYWxPZmZzZXQrKztcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHdhbnRGb3J3YXJkID0gZmFsc2U7XG4gICAgICB9IC8vIENoZWNrIGlmIHRyeWluZyB0byBmaXQgYmV5b25kIHRleHQgbGVuZ3RoLCBhbmQgaWYgbm90LCBjaGVjayBpdCBmaXRzXG4gICAgICAvLyBhZnRlciBvZmZzZXQgbG9jYXRpb24gKG9yIGRlc2lyZWQgbG9jYXRpb24gb24gZmlyc3QgaXRlcmF0aW9uKVxuXG5cbiAgICAgIGlmIChzdGFydCArIGxvY2FsT2Zmc2V0IDw9IG1heExpbmUpIHtcbiAgICAgICAgcmV0dXJuIGxvY2FsT2Zmc2V0O1xuICAgICAgfVxuXG4gICAgICBmb3J3YXJkRXhoYXVzdGVkID0gdHJ1ZTtcbiAgICB9XG5cbiAgICBpZiAoIWJhY2t3YXJkRXhoYXVzdGVkKSB7XG4gICAgICBpZiAoIWZvcndhcmRFeGhhdXN0ZWQpIHtcbiAgICAgICAgd2FudEZvcndhcmQgPSB0cnVlO1xuICAgICAgfSAvLyBDaGVjayBpZiB0cnlpbmcgdG8gZml0IGJlZm9yZSB0ZXh0IGJlZ2lubmluZywgYW5kIGlmIG5vdCwgY2hlY2sgaXQgZml0c1xuICAgICAgLy8gYmVmb3JlIG9mZnNldCBsb2NhdGlvblxuXG5cbiAgICAgIGlmIChtaW5MaW5lIDw9IHN0YXJ0IC0gbG9jYWxPZmZzZXQpIHtcbiAgICAgICAgcmV0dXJuIC1sb2NhbE9mZnNldCsrO1xuICAgICAgfVxuXG4gICAgICBiYWNrd2FyZEV4aGF1c3RlZCA9IHRydWU7XG4gICAgICByZXR1cm4gaXRlcmF0b3IoKTtcbiAgICB9IC8vIFdlIHRyaWVkIHRvIGZpdCBodW5rIGJlZm9yZSB0ZXh0IGJlZ2lubmluZyBhbmQgYmV5b25kIHRleHQgbGVuZ3RoLCB0aGVuXG4gICAgLy8gaHVuayBjYW4ndCBmaXQgb24gdGhlIHRleHQuIFJldHVybiB1bmRlZmluZWRcblxuICB9O1xufVxuXG5mdW5jdGlvbiBhcHBseVBhdGNoKHNvdXJjZSwgdW5pRGlmZikge1xuICB2YXIgb3B0aW9ucyA9IGFyZ3VtZW50cy5sZW5ndGggPiAyICYmIGFyZ3VtZW50c1syXSAhPT0gdW5kZWZpbmVkID8gYXJndW1lbnRzWzJdIDoge307XG5cbiAgaWYgKHR5cGVvZiB1bmlEaWZmID09PSAnc3RyaW5nJykge1xuICAgIHVuaURpZmYgPSBwYXJzZVBhdGNoKHVuaURpZmYpO1xuICB9XG5cbiAgaWYgKEFycmF5LmlzQXJyYXkodW5pRGlmZikpIHtcbiAgICBpZiAodW5pRGlmZi5sZW5ndGggPiAxKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ2FwcGx5UGF0Y2ggb25seSB3b3JrcyB3aXRoIGEgc2luZ2xlIGlucHV0LicpO1xuICAgIH1cblxuICAgIHVuaURpZmYgPSB1bmlEaWZmWzBdO1xuICB9IC8vIEFwcGx5IHRoZSBkaWZmIHRvIHRoZSBpbnB1dFxuXG5cbiAgdmFyIGxpbmVzID0gc291cmNlLnNwbGl0KC9cXHJcXG58W1xcblxcdlxcZlxcclxceDg1XS8pLFxuICAgICAgZGVsaW1pdGVycyA9IHNvdXJjZS5tYXRjaCgvXFxyXFxufFtcXG5cXHZcXGZcXHJcXHg4NV0vZykgfHwgW10sXG4gICAgICBodW5rcyA9IHVuaURpZmYuaHVua3MsXG4gICAgICBjb21wYXJlTGluZSA9IG9wdGlvbnMuY29tcGFyZUxpbmUgfHwgZnVuY3Rpb24gKGxpbmVOdW1iZXIsIGxpbmUsIG9wZXJhdGlvbiwgcGF0Y2hDb250ZW50KSB7XG4gICAgcmV0dXJuIGxpbmUgPT09IHBhdGNoQ29udGVudDtcbiAgfSxcbiAgICAgIGVycm9yQ291bnQgPSAwLFxuICAgICAgZnV6ekZhY3RvciA9IG9wdGlvbnMuZnV6ekZhY3RvciB8fCAwLFxuICAgICAgbWluTGluZSA9IDAsXG4gICAgICBvZmZzZXQgPSAwLFxuICAgICAgcmVtb3ZlRU9GTkwsXG4gICAgICBhZGRFT0ZOTDtcbiAgLyoqXG4gICAqIENoZWNrcyBpZiB0aGUgaHVuayBleGFjdGx5IGZpdHMgb24gdGhlIHByb3ZpZGVkIGxvY2F0aW9uXG4gICAqL1xuXG5cbiAgZnVuY3Rpb24gaHVua0ZpdHMoaHVuaywgdG9Qb3MpIHtcbiAgICBmb3IgKHZhciBqID0gMDsgaiA8IGh1bmsubGluZXMubGVuZ3RoOyBqKyspIHtcbiAgICAgIHZhciBsaW5lID0gaHVuay5saW5lc1tqXSxcbiAgICAgICAgICBvcGVyYXRpb24gPSBsaW5lLmxlbmd0aCA+IDAgPyBsaW5lWzBdIDogJyAnLFxuICAgICAgICAgIGNvbnRlbnQgPSBsaW5lLmxlbmd0aCA+IDAgPyBsaW5lLnN1YnN0cigxKSA6IGxpbmU7XG5cbiAgICAgIGlmIChvcGVyYXRpb24gPT09ICcgJyB8fCBvcGVyYXRpb24gPT09ICctJykge1xuICAgICAgICAvLyBDb250ZXh0IHNhbml0eSBjaGVja1xuICAgICAgICBpZiAoIWNvbXBhcmVMaW5lKHRvUG9zICsgMSwgbGluZXNbdG9Qb3NdLCBvcGVyYXRpb24sIGNvbnRlbnQpKSB7XG4gICAgICAgICAgZXJyb3JDb3VudCsrO1xuXG4gICAgICAgICAgaWYgKGVycm9yQ291bnQgPiBmdXp6RmFjdG9yKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgdG9Qb3MrKztcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfSAvLyBTZWFyY2ggYmVzdCBmaXQgb2Zmc2V0cyBmb3IgZWFjaCBodW5rIGJhc2VkIG9uIHRoZSBwcmV2aW91cyBvbmVzXG5cblxuICBmb3IgKHZhciBpID0gMDsgaSA8IGh1bmtzLmxlbmd0aDsgaSsrKSB7XG4gICAgdmFyIGh1bmsgPSBodW5rc1tpXSxcbiAgICAgICAgbWF4TGluZSA9IGxpbmVzLmxlbmd0aCAtIGh1bmsub2xkTGluZXMsXG4gICAgICAgIGxvY2FsT2Zmc2V0ID0gMCxcbiAgICAgICAgdG9Qb3MgPSBvZmZzZXQgKyBodW5rLm9sZFN0YXJ0IC0gMTtcbiAgICB2YXIgaXRlcmF0b3IgPSBkaXN0YW5jZUl0ZXJhdG9yKHRvUG9zLCBtaW5MaW5lLCBtYXhMaW5lKTtcblxuICAgIGZvciAoOyBsb2NhbE9mZnNldCAhPT0gdW5kZWZpbmVkOyBsb2NhbE9mZnNldCA9IGl0ZXJhdG9yKCkpIHtcbiAgICAgIGlmIChodW5rRml0cyhodW5rLCB0b1BvcyArIGxvY2FsT2Zmc2V0KSkge1xuICAgICAgICBodW5rLm9mZnNldCA9IG9mZnNldCArPSBsb2NhbE9mZnNldDtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKGxvY2FsT2Zmc2V0ID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9IC8vIFNldCBsb3dlciB0ZXh0IGxpbWl0IHRvIGVuZCBvZiB0aGUgY3VycmVudCBodW5rLCBzbyBuZXh0IG9uZXMgZG9uJ3QgdHJ5XG4gICAgLy8gdG8gZml0IG92ZXIgYWxyZWFkeSBwYXRjaGVkIHRleHRcblxuXG4gICAgbWluTGluZSA9IGh1bmsub2Zmc2V0ICsgaHVuay5vbGRTdGFydCArIGh1bmsub2xkTGluZXM7XG4gIH0gLy8gQXBwbHkgcGF0Y2ggaHVua3NcblxuXG4gIHZhciBkaWZmT2Zmc2V0ID0gMDtcblxuICBmb3IgKHZhciBfaSA9IDA7IF9pIDwgaHVua3MubGVuZ3RoOyBfaSsrKSB7XG4gICAgdmFyIF9odW5rID0gaHVua3NbX2ldLFxuICAgICAgICBfdG9Qb3MgPSBfaHVuay5vbGRTdGFydCArIF9odW5rLm9mZnNldCArIGRpZmZPZmZzZXQgLSAxO1xuXG4gICAgZGlmZk9mZnNldCArPSBfaHVuay5uZXdMaW5lcyAtIF9odW5rLm9sZExpbmVzO1xuXG4gICAgZm9yICh2YXIgaiA9IDA7IGogPCBfaHVuay5saW5lcy5sZW5ndGg7IGorKykge1xuICAgICAgdmFyIGxpbmUgPSBfaHVuay5saW5lc1tqXSxcbiAgICAgICAgICBvcGVyYXRpb24gPSBsaW5lLmxlbmd0aCA+IDAgPyBsaW5lWzBdIDogJyAnLFxuICAgICAgICAgIGNvbnRlbnQgPSBsaW5lLmxlbmd0aCA+IDAgPyBsaW5lLnN1YnN0cigxKSA6IGxpbmUsXG4gICAgICAgICAgZGVsaW1pdGVyID0gX2h1bmsubGluZWRlbGltaXRlcnNbal07XG5cbiAgICAgIGlmIChvcGVyYXRpb24gPT09ICcgJykge1xuICAgICAgICBfdG9Qb3MrKztcbiAgICAgIH0gZWxzZSBpZiAob3BlcmF0aW9uID09PSAnLScpIHtcbiAgICAgICAgbGluZXMuc3BsaWNlKF90b1BvcywgMSk7XG4gICAgICAgIGRlbGltaXRlcnMuc3BsaWNlKF90b1BvcywgMSk7XG4gICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBlbHNlICovXG4gICAgICB9IGVsc2UgaWYgKG9wZXJhdGlvbiA9PT0gJysnKSB7XG4gICAgICAgIGxpbmVzLnNwbGljZShfdG9Qb3MsIDAsIGNvbnRlbnQpO1xuICAgICAgICBkZWxpbWl0ZXJzLnNwbGljZShfdG9Qb3MsIDAsIGRlbGltaXRlcik7XG4gICAgICAgIF90b1BvcysrO1xuICAgICAgfSBlbHNlIGlmIChvcGVyYXRpb24gPT09ICdcXFxcJykge1xuICAgICAgICB2YXIgcHJldmlvdXNPcGVyYXRpb24gPSBfaHVuay5saW5lc1tqIC0gMV0gPyBfaHVuay5saW5lc1tqIC0gMV1bMF0gOiBudWxsO1xuXG4gICAgICAgIGlmIChwcmV2aW91c09wZXJhdGlvbiA9PT0gJysnKSB7XG4gICAgICAgICAgcmVtb3ZlRU9GTkwgPSB0cnVlO1xuICAgICAgICB9IGVsc2UgaWYgKHByZXZpb3VzT3BlcmF0aW9uID09PSAnLScpIHtcbiAgICAgICAgICBhZGRFT0ZOTCA9IHRydWU7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH0gLy8gSGFuZGxlIEVPRk5MIGluc2VydGlvbi9yZW1vdmFsXG5cblxuICBpZiAocmVtb3ZlRU9GTkwpIHtcbiAgICB3aGlsZSAoIWxpbmVzW2xpbmVzLmxlbmd0aCAtIDFdKSB7XG4gICAgICBsaW5lcy5wb3AoKTtcbiAgICAgIGRlbGltaXRlcnMucG9wKCk7XG4gICAgfVxuICB9IGVsc2UgaWYgKGFkZEVPRk5MKSB7XG4gICAgbGluZXMucHVzaCgnJyk7XG4gICAgZGVsaW1pdGVycy5wdXNoKCdcXG4nKTtcbiAgfVxuXG4gIGZvciAodmFyIF9rID0gMDsgX2sgPCBsaW5lcy5sZW5ndGggLSAxOyBfaysrKSB7XG4gICAgbGluZXNbX2tdID0gbGluZXNbX2tdICsgZGVsaW1pdGVyc1tfa107XG4gIH1cblxuICByZXR1cm4gbGluZXMuam9pbignJyk7XG59IC8vIFdyYXBwZXIgdGhhdCBzdXBwb3J0cyBtdWx0aXBsZSBmaWxlIHBhdGNoZXMgdmlhIGNhbGxiYWNrcy5cblxuZnVuY3Rpb24gYXBwbHlQYXRjaGVzKHVuaURpZmYsIG9wdGlvbnMpIHtcbiAgaWYgKHR5cGVvZiB1bmlEaWZmID09PSAnc3RyaW5nJykge1xuICAgIHVuaURpZmYgPSBwYXJzZVBhdGNoKHVuaURpZmYpO1xuICB9XG5cbiAgdmFyIGN1cnJlbnRJbmRleCA9IDA7XG5cbiAgZnVuY3Rpb24gcHJvY2Vzc0luZGV4KCkge1xuICAgIHZhciBpbmRleCA9IHVuaURpZmZbY3VycmVudEluZGV4KytdO1xuXG4gICAgaWYgKCFpbmRleCkge1xuICAgICAgcmV0dXJuIG9wdGlvbnMuY29tcGxldGUoKTtcbiAgICB9XG5cbiAgICBvcHRpb25zLmxvYWRGaWxlKGluZGV4LCBmdW5jdGlvbiAoZXJyLCBkYXRhKSB7XG4gICAgICBpZiAoZXJyKSB7XG4gICAgICAgIHJldHVybiBvcHRpb25zLmNvbXBsZXRlKGVycik7XG4gICAgICB9XG5cbiAgICAgIHZhciB1cGRhdGVkQ29udGVudCA9IGFwcGx5UGF0Y2goZGF0YSwgaW5kZXgsIG9wdGlvbnMpO1xuICAgICAgb3B0aW9ucy5wYXRjaGVkKGluZGV4LCB1cGRhdGVkQ29udGVudCwgZnVuY3Rpb24gKGVycikge1xuICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgcmV0dXJuIG9wdGlvbnMuY29tcGxldGUoZXJyKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHByb2Nlc3NJbmRleCgpO1xuICAgICAgfSk7XG4gICAgfSk7XG4gIH1cblxuICBwcm9jZXNzSW5kZXgoKTtcbn1cblxuZnVuY3Rpb24gc3RydWN0dXJlZFBhdGNoKG9sZEZpbGVOYW1lLCBuZXdGaWxlTmFtZSwgb2xkU3RyLCBuZXdTdHIsIG9sZEhlYWRlciwgbmV3SGVhZGVyLCBvcHRpb25zKSB7XG4gIGlmICghb3B0aW9ucykge1xuICAgIG9wdGlvbnMgPSB7fTtcbiAgfVxuXG4gIGlmICh0eXBlb2Ygb3B0aW9ucy5jb250ZXh0ID09PSAndW5kZWZpbmVkJykge1xuICAgIG9wdGlvbnMuY29udGV4dCA9IDQ7XG4gIH1cblxuICB2YXIgZGlmZiA9IGRpZmZMaW5lcyhvbGRTdHIsIG5ld1N0ciwgb3B0aW9ucyk7XG4gIGRpZmYucHVzaCh7XG4gICAgdmFsdWU6ICcnLFxuICAgIGxpbmVzOiBbXVxuICB9KTsgLy8gQXBwZW5kIGFuIGVtcHR5IHZhbHVlIHRvIG1ha2UgY2xlYW51cCBlYXNpZXJcblxuICBmdW5jdGlvbiBjb250ZXh0TGluZXMobGluZXMpIHtcbiAgICByZXR1cm4gbGluZXMubWFwKGZ1bmN0aW9uIChlbnRyeSkge1xuICAgICAgcmV0dXJuICcgJyArIGVudHJ5O1xuICAgIH0pO1xuICB9XG5cbiAgdmFyIGh1bmtzID0gW107XG4gIHZhciBvbGRSYW5nZVN0YXJ0ID0gMCxcbiAgICAgIG5ld1JhbmdlU3RhcnQgPSAwLFxuICAgICAgY3VyUmFuZ2UgPSBbXSxcbiAgICAgIG9sZExpbmUgPSAxLFxuICAgICAgbmV3TGluZSA9IDE7XG5cbiAgdmFyIF9sb29wID0gZnVuY3Rpb24gX2xvb3AoaSkge1xuICAgIHZhciBjdXJyZW50ID0gZGlmZltpXSxcbiAgICAgICAgbGluZXMgPSBjdXJyZW50LmxpbmVzIHx8IGN1cnJlbnQudmFsdWUucmVwbGFjZSgvXFxuJC8sICcnKS5zcGxpdCgnXFxuJyk7XG4gICAgY3VycmVudC5saW5lcyA9IGxpbmVzO1xuXG4gICAgaWYgKGN1cnJlbnQuYWRkZWQgfHwgY3VycmVudC5yZW1vdmVkKSB7XG4gICAgICB2YXIgX2N1clJhbmdlO1xuXG4gICAgICAvLyBJZiB3ZSBoYXZlIHByZXZpb3VzIGNvbnRleHQsIHN0YXJ0IHdpdGggdGhhdFxuICAgICAgaWYgKCFvbGRSYW5nZVN0YXJ0KSB7XG4gICAgICAgIHZhciBwcmV2ID0gZGlmZltpIC0gMV07XG4gICAgICAgIG9sZFJhbmdlU3RhcnQgPSBvbGRMaW5lO1xuICAgICAgICBuZXdSYW5nZVN0YXJ0ID0gbmV3TGluZTtcblxuICAgICAgICBpZiAocHJldikge1xuICAgICAgICAgIGN1clJhbmdlID0gb3B0aW9ucy5jb250ZXh0ID4gMCA/IGNvbnRleHRMaW5lcyhwcmV2LmxpbmVzLnNsaWNlKC1vcHRpb25zLmNvbnRleHQpKSA6IFtdO1xuICAgICAgICAgIG9sZFJhbmdlU3RhcnQgLT0gY3VyUmFuZ2UubGVuZ3RoO1xuICAgICAgICAgIG5ld1JhbmdlU3RhcnQgLT0gY3VyUmFuZ2UubGVuZ3RoO1xuICAgICAgICB9XG4gICAgICB9IC8vIE91dHB1dCBvdXIgY2hhbmdlc1xuXG5cbiAgICAgIChfY3VyUmFuZ2UgPSBjdXJSYW5nZSkucHVzaC5hcHBseShfY3VyUmFuZ2UsIF90b0NvbnN1bWFibGVBcnJheShsaW5lcy5tYXAoZnVuY3Rpb24gKGVudHJ5KSB7XG4gICAgICAgIHJldHVybiAoY3VycmVudC5hZGRlZCA/ICcrJyA6ICctJykgKyBlbnRyeTtcbiAgICAgIH0pKSk7IC8vIFRyYWNrIHRoZSB1cGRhdGVkIGZpbGUgcG9zaXRpb25cblxuXG4gICAgICBpZiAoY3VycmVudC5hZGRlZCkge1xuICAgICAgICBuZXdMaW5lICs9IGxpbmVzLmxlbmd0aDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIG9sZExpbmUgKz0gbGluZXMubGVuZ3RoO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICAvLyBJZGVudGljYWwgY29udGV4dCBsaW5lcy4gVHJhY2sgbGluZSBjaGFuZ2VzXG4gICAgICBpZiAob2xkUmFuZ2VTdGFydCkge1xuICAgICAgICAvLyBDbG9zZSBvdXQgYW55IGNoYW5nZXMgdGhhdCBoYXZlIGJlZW4gb3V0cHV0IChvciBqb2luIG92ZXJsYXBwaW5nKVxuICAgICAgICBpZiAobGluZXMubGVuZ3RoIDw9IG9wdGlvbnMuY29udGV4dCAqIDIgJiYgaSA8IGRpZmYubGVuZ3RoIC0gMikge1xuICAgICAgICAgIHZhciBfY3VyUmFuZ2UyO1xuXG4gICAgICAgICAgLy8gT3ZlcmxhcHBpbmdcbiAgICAgICAgICAoX2N1clJhbmdlMiA9IGN1clJhbmdlKS5wdXNoLmFwcGx5KF9jdXJSYW5nZTIsIF90b0NvbnN1bWFibGVBcnJheShjb250ZXh0TGluZXMobGluZXMpKSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdmFyIF9jdXJSYW5nZTM7XG5cbiAgICAgICAgICAvLyBlbmQgdGhlIHJhbmdlIGFuZCBvdXRwdXRcbiAgICAgICAgICB2YXIgY29udGV4dFNpemUgPSBNYXRoLm1pbihsaW5lcy5sZW5ndGgsIG9wdGlvbnMuY29udGV4dCk7XG5cbiAgICAgICAgICAoX2N1clJhbmdlMyA9IGN1clJhbmdlKS5wdXNoLmFwcGx5KF9jdXJSYW5nZTMsIF90b0NvbnN1bWFibGVBcnJheShjb250ZXh0TGluZXMobGluZXMuc2xpY2UoMCwgY29udGV4dFNpemUpKSkpO1xuXG4gICAgICAgICAgdmFyIGh1bmsgPSB7XG4gICAgICAgICAgICBvbGRTdGFydDogb2xkUmFuZ2VTdGFydCxcbiAgICAgICAgICAgIG9sZExpbmVzOiBvbGRMaW5lIC0gb2xkUmFuZ2VTdGFydCArIGNvbnRleHRTaXplLFxuICAgICAgICAgICAgbmV3U3RhcnQ6IG5ld1JhbmdlU3RhcnQsXG4gICAgICAgICAgICBuZXdMaW5lczogbmV3TGluZSAtIG5ld1JhbmdlU3RhcnQgKyBjb250ZXh0U2l6ZSxcbiAgICAgICAgICAgIGxpbmVzOiBjdXJSYW5nZVxuICAgICAgICAgIH07XG5cbiAgICAgICAgICBpZiAoaSA+PSBkaWZmLmxlbmd0aCAtIDIgJiYgbGluZXMubGVuZ3RoIDw9IG9wdGlvbnMuY29udGV4dCkge1xuICAgICAgICAgICAgLy8gRU9GIGlzIGluc2lkZSB0aGlzIGh1bmtcbiAgICAgICAgICAgIHZhciBvbGRFT0ZOZXdsaW5lID0gL1xcbiQvLnRlc3Qob2xkU3RyKTtcbiAgICAgICAgICAgIHZhciBuZXdFT0ZOZXdsaW5lID0gL1xcbiQvLnRlc3QobmV3U3RyKTtcbiAgICAgICAgICAgIHZhciBub05sQmVmb3JlQWRkcyA9IGxpbmVzLmxlbmd0aCA9PSAwICYmIGN1clJhbmdlLmxlbmd0aCA+IGh1bmsub2xkTGluZXM7XG5cbiAgICAgICAgICAgIGlmICghb2xkRU9GTmV3bGluZSAmJiBub05sQmVmb3JlQWRkcyAmJiBvbGRTdHIubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAvLyBzcGVjaWFsIGNhc2U6IG9sZCBoYXMgbm8gZW9sIGFuZCBubyB0cmFpbGluZyBjb250ZXh0OyBuby1ubCBjYW4gZW5kIHVwIGJlZm9yZSBhZGRzXG4gICAgICAgICAgICAgIC8vIGhvd2V2ZXIsIGlmIHRoZSBvbGQgZmlsZSBpcyBlbXB0eSwgZG8gbm90IG91dHB1dCB0aGUgbm8tbmwgbGluZVxuICAgICAgICAgICAgICBjdXJSYW5nZS5zcGxpY2UoaHVuay5vbGRMaW5lcywgMCwgJ1xcXFwgTm8gbmV3bGluZSBhdCBlbmQgb2YgZmlsZScpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoIW9sZEVPRk5ld2xpbmUgJiYgIW5vTmxCZWZvcmVBZGRzIHx8ICFuZXdFT0ZOZXdsaW5lKSB7XG4gICAgICAgICAgICAgIGN1clJhbmdlLnB1c2goJ1xcXFwgTm8gbmV3bGluZSBhdCBlbmQgb2YgZmlsZScpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cblxuICAgICAgICAgIGh1bmtzLnB1c2goaHVuayk7XG4gICAgICAgICAgb2xkUmFuZ2VTdGFydCA9IDA7XG4gICAgICAgICAgbmV3UmFuZ2VTdGFydCA9IDA7XG4gICAgICAgICAgY3VyUmFuZ2UgPSBbXTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBvbGRMaW5lICs9IGxpbmVzLmxlbmd0aDtcbiAgICAgIG5ld0xpbmUgKz0gbGluZXMubGVuZ3RoO1xuICAgIH1cbiAgfTtcblxuICBmb3IgKHZhciBpID0gMDsgaSA8IGRpZmYubGVuZ3RoOyBpKyspIHtcbiAgICBfbG9vcChpKTtcbiAgfVxuXG4gIHJldHVybiB7XG4gICAgb2xkRmlsZU5hbWU6IG9sZEZpbGVOYW1lLFxuICAgIG5ld0ZpbGVOYW1lOiBuZXdGaWxlTmFtZSxcbiAgICBvbGRIZWFkZXI6IG9sZEhlYWRlcixcbiAgICBuZXdIZWFkZXI6IG5ld0hlYWRlcixcbiAgICBodW5rczogaHVua3NcbiAgfTtcbn1cbmZ1bmN0aW9uIGZvcm1hdFBhdGNoKGRpZmYpIHtcbiAgdmFyIHJldCA9IFtdO1xuXG4gIGlmIChkaWZmLm9sZEZpbGVOYW1lID09IGRpZmYubmV3RmlsZU5hbWUpIHtcbiAgICByZXQucHVzaCgnSW5kZXg6ICcgKyBkaWZmLm9sZEZpbGVOYW1lKTtcbiAgfVxuXG4gIHJldC5wdXNoKCc9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09Jyk7XG4gIHJldC5wdXNoKCctLS0gJyArIGRpZmYub2xkRmlsZU5hbWUgKyAodHlwZW9mIGRpZmYub2xkSGVhZGVyID09PSAndW5kZWZpbmVkJyA/ICcnIDogJ1xcdCcgKyBkaWZmLm9sZEhlYWRlcikpO1xuICByZXQucHVzaCgnKysrICcgKyBkaWZmLm5ld0ZpbGVOYW1lICsgKHR5cGVvZiBkaWZmLm5ld0hlYWRlciA9PT0gJ3VuZGVmaW5lZCcgPyAnJyA6ICdcXHQnICsgZGlmZi5uZXdIZWFkZXIpKTtcblxuICBmb3IgKHZhciBpID0gMDsgaSA8IGRpZmYuaHVua3MubGVuZ3RoOyBpKyspIHtcbiAgICB2YXIgaHVuayA9IGRpZmYuaHVua3NbaV07IC8vIFVuaWZpZWQgRGlmZiBGb3JtYXQgcXVpcms6IElmIHRoZSBjaHVuayBzaXplIGlzIDAsXG4gICAgLy8gdGhlIGZpcnN0IG51bWJlciBpcyBvbmUgbG93ZXIgdGhhbiBvbmUgd291bGQgZXhwZWN0LlxuICAgIC8vIGh0dHBzOi8vd3d3LmFydGltYS5jb20vd2VibG9ncy92aWV3cG9zdC5qc3A/dGhyZWFkPTE2NDI5M1xuXG4gICAgaWYgKGh1bmsub2xkTGluZXMgPT09IDApIHtcbiAgICAgIGh1bmsub2xkU3RhcnQgLT0gMTtcbiAgICB9XG5cbiAgICBpZiAoaHVuay5uZXdMaW5lcyA9PT0gMCkge1xuICAgICAgaHVuay5uZXdTdGFydCAtPSAxO1xuICAgIH1cblxuICAgIHJldC5wdXNoKCdAQCAtJyArIGh1bmsub2xkU3RhcnQgKyAnLCcgKyBodW5rLm9sZExpbmVzICsgJyArJyArIGh1bmsubmV3U3RhcnQgKyAnLCcgKyBodW5rLm5ld0xpbmVzICsgJyBAQCcpO1xuICAgIHJldC5wdXNoLmFwcGx5KHJldCwgaHVuay5saW5lcyk7XG4gIH1cblxuICByZXR1cm4gcmV0LmpvaW4oJ1xcbicpICsgJ1xcbic7XG59XG5mdW5jdGlvbiBjcmVhdGVUd29GaWxlc1BhdGNoKG9sZEZpbGVOYW1lLCBuZXdGaWxlTmFtZSwgb2xkU3RyLCBuZXdTdHIsIG9sZEhlYWRlciwgbmV3SGVhZGVyLCBvcHRpb25zKSB7XG4gIHJldHVybiBmb3JtYXRQYXRjaChzdHJ1Y3R1cmVkUGF0Y2gob2xkRmlsZU5hbWUsIG5ld0ZpbGVOYW1lLCBvbGRTdHIsIG5ld1N0ciwgb2xkSGVhZGVyLCBuZXdIZWFkZXIsIG9wdGlvbnMpKTtcbn1cbmZ1bmN0aW9uIGNyZWF0ZVBhdGNoKGZpbGVOYW1lLCBvbGRTdHIsIG5ld1N0ciwgb2xkSGVhZGVyLCBuZXdIZWFkZXIsIG9wdGlvbnMpIHtcbiAgcmV0dXJuIGNyZWF0ZVR3b0ZpbGVzUGF0Y2goZmlsZU5hbWUsIGZpbGVOYW1lLCBvbGRTdHIsIG5ld1N0ciwgb2xkSGVhZGVyLCBuZXdIZWFkZXIsIG9wdGlvbnMpO1xufVxuXG5mdW5jdGlvbiBhcnJheUVxdWFsKGEsIGIpIHtcbiAgaWYgKGEubGVuZ3RoICE9PSBiLmxlbmd0aCkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIHJldHVybiBhcnJheVN0YXJ0c1dpdGgoYSwgYik7XG59XG5mdW5jdGlvbiBhcnJheVN0YXJ0c1dpdGgoYXJyYXksIHN0YXJ0KSB7XG4gIGlmIChzdGFydC5sZW5ndGggPiBhcnJheS5sZW5ndGgpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBmb3IgKHZhciBpID0gMDsgaSA8IHN0YXJ0Lmxlbmd0aDsgaSsrKSB7XG4gICAgaWYgKHN0YXJ0W2ldICE9PSBhcnJheVtpXSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiB0cnVlO1xufVxuXG5mdW5jdGlvbiBjYWxjTGluZUNvdW50KGh1bmspIHtcbiAgdmFyIF9jYWxjT2xkTmV3TGluZUNvdW50ID0gY2FsY09sZE5ld0xpbmVDb3VudChodW5rLmxpbmVzKSxcbiAgICAgIG9sZExpbmVzID0gX2NhbGNPbGROZXdMaW5lQ291bnQub2xkTGluZXMsXG4gICAgICBuZXdMaW5lcyA9IF9jYWxjT2xkTmV3TGluZUNvdW50Lm5ld0xpbmVzO1xuXG4gIGlmIChvbGRMaW5lcyAhPT0gdW5kZWZpbmVkKSB7XG4gICAgaHVuay5vbGRMaW5lcyA9IG9sZExpbmVzO1xuICB9IGVsc2Uge1xuICAgIGRlbGV0ZSBodW5rLm9sZExpbmVzO1xuICB9XG5cbiAgaWYgKG5ld0xpbmVzICE9PSB1bmRlZmluZWQpIHtcbiAgICBodW5rLm5ld0xpbmVzID0gbmV3TGluZXM7XG4gIH0gZWxzZSB7XG4gICAgZGVsZXRlIGh1bmsubmV3TGluZXM7XG4gIH1cbn1cbmZ1bmN0aW9uIG1lcmdlKG1pbmUsIHRoZWlycywgYmFzZSkge1xuICBtaW5lID0gbG9hZFBhdGNoKG1pbmUsIGJhc2UpO1xuICB0aGVpcnMgPSBsb2FkUGF0Y2godGhlaXJzLCBiYXNlKTtcbiAgdmFyIHJldCA9IHt9OyAvLyBGb3IgaW5kZXggd2UganVzdCBsZXQgaXQgcGFzcyB0aHJvdWdoIGFzIGl0IGRvZXNuJ3QgaGF2ZSBhbnkgbmVjZXNzYXJ5IG1lYW5pbmcuXG4gIC8vIExlYXZpbmcgc2FuaXR5IGNoZWNrcyBvbiB0aGlzIHRvIHRoZSBBUEkgY29uc3VtZXIgdGhhdCBtYXkga25vdyBtb3JlIGFib3V0IHRoZVxuICAvLyBtZWFuaW5nIGluIHRoZWlyIG93biBjb250ZXh0LlxuXG4gIGlmIChtaW5lLmluZGV4IHx8IHRoZWlycy5pbmRleCkge1xuICAgIHJldC5pbmRleCA9IG1pbmUuaW5kZXggfHwgdGhlaXJzLmluZGV4O1xuICB9XG5cbiAgaWYgKG1pbmUubmV3RmlsZU5hbWUgfHwgdGhlaXJzLm5ld0ZpbGVOYW1lKSB7XG4gICAgaWYgKCFmaWxlTmFtZUNoYW5nZWQobWluZSkpIHtcbiAgICAgIC8vIE5vIGhlYWRlciBvciBubyBjaGFuZ2UgaW4gb3VycywgdXNlIHRoZWlycyAoYW5kIG91cnMgaWYgdGhlaXJzIGRvZXMgbm90IGV4aXN0KVxuICAgICAgcmV0Lm9sZEZpbGVOYW1lID0gdGhlaXJzLm9sZEZpbGVOYW1lIHx8IG1pbmUub2xkRmlsZU5hbWU7XG4gICAgICByZXQubmV3RmlsZU5hbWUgPSB0aGVpcnMubmV3RmlsZU5hbWUgfHwgbWluZS5uZXdGaWxlTmFtZTtcbiAgICAgIHJldC5vbGRIZWFkZXIgPSB0aGVpcnMub2xkSGVhZGVyIHx8IG1pbmUub2xkSGVhZGVyO1xuICAgICAgcmV0Lm5ld0hlYWRlciA9IHRoZWlycy5uZXdIZWFkZXIgfHwgbWluZS5uZXdIZWFkZXI7XG4gICAgfSBlbHNlIGlmICghZmlsZU5hbWVDaGFuZ2VkKHRoZWlycykpIHtcbiAgICAgIC8vIE5vIGhlYWRlciBvciBubyBjaGFuZ2UgaW4gdGhlaXJzLCB1c2Ugb3Vyc1xuICAgICAgcmV0Lm9sZEZpbGVOYW1lID0gbWluZS5vbGRGaWxlTmFtZTtcbiAgICAgIHJldC5uZXdGaWxlTmFtZSA9IG1pbmUubmV3RmlsZU5hbWU7XG4gICAgICByZXQub2xkSGVhZGVyID0gbWluZS5vbGRIZWFkZXI7XG4gICAgICByZXQubmV3SGVhZGVyID0gbWluZS5uZXdIZWFkZXI7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIEJvdGggY2hhbmdlZC4uLiBmaWd1cmUgaXQgb3V0XG4gICAgICByZXQub2xkRmlsZU5hbWUgPSBzZWxlY3RGaWVsZChyZXQsIG1pbmUub2xkRmlsZU5hbWUsIHRoZWlycy5vbGRGaWxlTmFtZSk7XG4gICAgICByZXQubmV3RmlsZU5hbWUgPSBzZWxlY3RGaWVsZChyZXQsIG1pbmUubmV3RmlsZU5hbWUsIHRoZWlycy5uZXdGaWxlTmFtZSk7XG4gICAgICByZXQub2xkSGVhZGVyID0gc2VsZWN0RmllbGQocmV0LCBtaW5lLm9sZEhlYWRlciwgdGhlaXJzLm9sZEhlYWRlcik7XG4gICAgICByZXQubmV3SGVhZGVyID0gc2VsZWN0RmllbGQocmV0LCBtaW5lLm5ld0hlYWRlciwgdGhlaXJzLm5ld0hlYWRlcik7XG4gICAgfVxuICB9XG5cbiAgcmV0Lmh1bmtzID0gW107XG4gIHZhciBtaW5lSW5kZXggPSAwLFxuICAgICAgdGhlaXJzSW5kZXggPSAwLFxuICAgICAgbWluZU9mZnNldCA9IDAsXG4gICAgICB0aGVpcnNPZmZzZXQgPSAwO1xuXG4gIHdoaWxlIChtaW5lSW5kZXggPCBtaW5lLmh1bmtzLmxlbmd0aCB8fCB0aGVpcnNJbmRleCA8IHRoZWlycy5odW5rcy5sZW5ndGgpIHtcbiAgICB2YXIgbWluZUN1cnJlbnQgPSBtaW5lLmh1bmtzW21pbmVJbmRleF0gfHwge1xuICAgICAgb2xkU3RhcnQ6IEluZmluaXR5XG4gICAgfSxcbiAgICAgICAgdGhlaXJzQ3VycmVudCA9IHRoZWlycy5odW5rc1t0aGVpcnNJbmRleF0gfHwge1xuICAgICAgb2xkU3RhcnQ6IEluZmluaXR5XG4gICAgfTtcblxuICAgIGlmIChodW5rQmVmb3JlKG1pbmVDdXJyZW50LCB0aGVpcnNDdXJyZW50KSkge1xuICAgICAgLy8gVGhpcyBwYXRjaCBkb2VzIG5vdCBvdmVybGFwIHdpdGggYW55IG9mIHRoZSBvdGhlcnMsIHlheS5cbiAgICAgIHJldC5odW5rcy5wdXNoKGNsb25lSHVuayhtaW5lQ3VycmVudCwgbWluZU9mZnNldCkpO1xuICAgICAgbWluZUluZGV4Kys7XG4gICAgICB0aGVpcnNPZmZzZXQgKz0gbWluZUN1cnJlbnQubmV3TGluZXMgLSBtaW5lQ3VycmVudC5vbGRMaW5lcztcbiAgICB9IGVsc2UgaWYgKGh1bmtCZWZvcmUodGhlaXJzQ3VycmVudCwgbWluZUN1cnJlbnQpKSB7XG4gICAgICAvLyBUaGlzIHBhdGNoIGRvZXMgbm90IG92ZXJsYXAgd2l0aCBhbnkgb2YgdGhlIG90aGVycywgeWF5LlxuICAgICAgcmV0Lmh1bmtzLnB1c2goY2xvbmVIdW5rKHRoZWlyc0N1cnJlbnQsIHRoZWlyc09mZnNldCkpO1xuICAgICAgdGhlaXJzSW5kZXgrKztcbiAgICAgIG1pbmVPZmZzZXQgKz0gdGhlaXJzQ3VycmVudC5uZXdMaW5lcyAtIHRoZWlyc0N1cnJlbnQub2xkTGluZXM7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIE92ZXJsYXAsIG1lcmdlIGFzIGJlc3Qgd2UgY2FuXG4gICAgICB2YXIgbWVyZ2VkSHVuayA9IHtcbiAgICAgICAgb2xkU3RhcnQ6IE1hdGgubWluKG1pbmVDdXJyZW50Lm9sZFN0YXJ0LCB0aGVpcnNDdXJyZW50Lm9sZFN0YXJ0KSxcbiAgICAgICAgb2xkTGluZXM6IDAsXG4gICAgICAgIG5ld1N0YXJ0OiBNYXRoLm1pbihtaW5lQ3VycmVudC5uZXdTdGFydCArIG1pbmVPZmZzZXQsIHRoZWlyc0N1cnJlbnQub2xkU3RhcnQgKyB0aGVpcnNPZmZzZXQpLFxuICAgICAgICBuZXdMaW5lczogMCxcbiAgICAgICAgbGluZXM6IFtdXG4gICAgICB9O1xuICAgICAgbWVyZ2VMaW5lcyhtZXJnZWRIdW5rLCBtaW5lQ3VycmVudC5vbGRTdGFydCwgbWluZUN1cnJlbnQubGluZXMsIHRoZWlyc0N1cnJlbnQub2xkU3RhcnQsIHRoZWlyc0N1cnJlbnQubGluZXMpO1xuICAgICAgdGhlaXJzSW5kZXgrKztcbiAgICAgIG1pbmVJbmRleCsrO1xuICAgICAgcmV0Lmh1bmtzLnB1c2gobWVyZ2VkSHVuayk7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHJldDtcbn1cblxuZnVuY3Rpb24gbG9hZFBhdGNoKHBhcmFtLCBiYXNlKSB7XG4gIGlmICh0eXBlb2YgcGFyYW0gPT09ICdzdHJpbmcnKSB7XG4gICAgaWYgKC9eQEAvbS50ZXN0KHBhcmFtKSB8fCAvXkluZGV4Oi9tLnRlc3QocGFyYW0pKSB7XG4gICAgICByZXR1cm4gcGFyc2VQYXRjaChwYXJhbSlbMF07XG4gICAgfVxuXG4gICAgaWYgKCFiYXNlKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ011c3QgcHJvdmlkZSBhIGJhc2UgcmVmZXJlbmNlIG9yIHBhc3MgaW4gYSBwYXRjaCcpO1xuICAgIH1cblxuICAgIHJldHVybiBzdHJ1Y3R1cmVkUGF0Y2godW5kZWZpbmVkLCB1bmRlZmluZWQsIGJhc2UsIHBhcmFtKTtcbiAgfVxuXG4gIHJldHVybiBwYXJhbTtcbn1cblxuZnVuY3Rpb24gZmlsZU5hbWVDaGFuZ2VkKHBhdGNoKSB7XG4gIHJldHVybiBwYXRjaC5uZXdGaWxlTmFtZSAmJiBwYXRjaC5uZXdGaWxlTmFtZSAhPT0gcGF0Y2gub2xkRmlsZU5hbWU7XG59XG5cbmZ1bmN0aW9uIHNlbGVjdEZpZWxkKGluZGV4LCBtaW5lLCB0aGVpcnMpIHtcbiAgaWYgKG1pbmUgPT09IHRoZWlycykge1xuICAgIHJldHVybiBtaW5lO1xuICB9IGVsc2Uge1xuICAgIGluZGV4LmNvbmZsaWN0ID0gdHJ1ZTtcbiAgICByZXR1cm4ge1xuICAgICAgbWluZTogbWluZSxcbiAgICAgIHRoZWlyczogdGhlaXJzXG4gICAgfTtcbiAgfVxufVxuXG5mdW5jdGlvbiBodW5rQmVmb3JlKHRlc3QsIGNoZWNrKSB7XG4gIHJldHVybiB0ZXN0Lm9sZFN0YXJ0IDwgY2hlY2sub2xkU3RhcnQgJiYgdGVzdC5vbGRTdGFydCArIHRlc3Qub2xkTGluZXMgPCBjaGVjay5vbGRTdGFydDtcbn1cblxuZnVuY3Rpb24gY2xvbmVIdW5rKGh1bmssIG9mZnNldCkge1xuICByZXR1cm4ge1xuICAgIG9sZFN0YXJ0OiBodW5rLm9sZFN0YXJ0LFxuICAgIG9sZExpbmVzOiBodW5rLm9sZExpbmVzLFxuICAgIG5ld1N0YXJ0OiBodW5rLm5ld1N0YXJ0ICsgb2Zmc2V0LFxuICAgIG5ld0xpbmVzOiBodW5rLm5ld0xpbmVzLFxuICAgIGxpbmVzOiBodW5rLmxpbmVzXG4gIH07XG59XG5cbmZ1bmN0aW9uIG1lcmdlTGluZXMoaHVuaywgbWluZU9mZnNldCwgbWluZUxpbmVzLCB0aGVpck9mZnNldCwgdGhlaXJMaW5lcykge1xuICAvLyBUaGlzIHdpbGwgZ2VuZXJhbGx5IHJlc3VsdCBpbiBhIGNvbmZsaWN0ZWQgaHVuaywgYnV0IHRoZXJlIGFyZSBjYXNlcyB3aGVyZSB0aGUgY29udGV4dFxuICAvLyBpcyB0aGUgb25seSBvdmVybGFwIHdoZXJlIHdlIGNhbiBzdWNjZXNzZnVsbHkgbWVyZ2UgdGhlIGNvbnRlbnQgaGVyZS5cbiAgdmFyIG1pbmUgPSB7XG4gICAgb2Zmc2V0OiBtaW5lT2Zmc2V0LFxuICAgIGxpbmVzOiBtaW5lTGluZXMsXG4gICAgaW5kZXg6IDBcbiAgfSxcbiAgICAgIHRoZWlyID0ge1xuICAgIG9mZnNldDogdGhlaXJPZmZzZXQsXG4gICAgbGluZXM6IHRoZWlyTGluZXMsXG4gICAgaW5kZXg6IDBcbiAgfTsgLy8gSGFuZGxlIGFueSBsZWFkaW5nIGNvbnRlbnRcblxuICBpbnNlcnRMZWFkaW5nKGh1bmssIG1pbmUsIHRoZWlyKTtcbiAgaW5zZXJ0TGVhZGluZyhodW5rLCB0aGVpciwgbWluZSk7IC8vIE5vdyBpbiB0aGUgb3ZlcmxhcCBjb250ZW50LiBTY2FuIHRocm91Z2ggYW5kIHNlbGVjdCB0aGUgYmVzdCBjaGFuZ2VzIGZyb20gZWFjaC5cblxuICB3aGlsZSAobWluZS5pbmRleCA8IG1pbmUubGluZXMubGVuZ3RoICYmIHRoZWlyLmluZGV4IDwgdGhlaXIubGluZXMubGVuZ3RoKSB7XG4gICAgdmFyIG1pbmVDdXJyZW50ID0gbWluZS5saW5lc1ttaW5lLmluZGV4XSxcbiAgICAgICAgdGhlaXJDdXJyZW50ID0gdGhlaXIubGluZXNbdGhlaXIuaW5kZXhdO1xuXG4gICAgaWYgKChtaW5lQ3VycmVudFswXSA9PT0gJy0nIHx8IG1pbmVDdXJyZW50WzBdID09PSAnKycpICYmICh0aGVpckN1cnJlbnRbMF0gPT09ICctJyB8fCB0aGVpckN1cnJlbnRbMF0gPT09ICcrJykpIHtcbiAgICAgIC8vIEJvdGggbW9kaWZpZWQgLi4uXG4gICAgICBtdXR1YWxDaGFuZ2UoaHVuaywgbWluZSwgdGhlaXIpO1xuICAgIH0gZWxzZSBpZiAobWluZUN1cnJlbnRbMF0gPT09ICcrJyAmJiB0aGVpckN1cnJlbnRbMF0gPT09ICcgJykge1xuICAgICAgdmFyIF9odW5rJGxpbmVzO1xuXG4gICAgICAvLyBNaW5lIGluc2VydGVkXG4gICAgICAoX2h1bmskbGluZXMgPSBodW5rLmxpbmVzKS5wdXNoLmFwcGx5KF9odW5rJGxpbmVzLCBfdG9Db25zdW1hYmxlQXJyYXkoY29sbGVjdENoYW5nZShtaW5lKSkpO1xuICAgIH0gZWxzZSBpZiAodGhlaXJDdXJyZW50WzBdID09PSAnKycgJiYgbWluZUN1cnJlbnRbMF0gPT09ICcgJykge1xuICAgICAgdmFyIF9odW5rJGxpbmVzMjtcblxuICAgICAgLy8gVGhlaXJzIGluc2VydGVkXG4gICAgICAoX2h1bmskbGluZXMyID0gaHVuay5saW5lcykucHVzaC5hcHBseShfaHVuayRsaW5lczIsIF90b0NvbnN1bWFibGVBcnJheShjb2xsZWN0Q2hhbmdlKHRoZWlyKSkpO1xuICAgIH0gZWxzZSBpZiAobWluZUN1cnJlbnRbMF0gPT09ICctJyAmJiB0aGVpckN1cnJlbnRbMF0gPT09ICcgJykge1xuICAgICAgLy8gTWluZSByZW1vdmVkIG9yIGVkaXRlZFxuICAgICAgcmVtb3ZhbChodW5rLCBtaW5lLCB0aGVpcik7XG4gICAgfSBlbHNlIGlmICh0aGVpckN1cnJlbnRbMF0gPT09ICctJyAmJiBtaW5lQ3VycmVudFswXSA9PT0gJyAnKSB7XG4gICAgICAvLyBUaGVpciByZW1vdmVkIG9yIGVkaXRlZFxuICAgICAgcmVtb3ZhbChodW5rLCB0aGVpciwgbWluZSwgdHJ1ZSk7XG4gICAgfSBlbHNlIGlmIChtaW5lQ3VycmVudCA9PT0gdGhlaXJDdXJyZW50KSB7XG4gICAgICAvLyBDb250ZXh0IGlkZW50aXR5XG4gICAgICBodW5rLmxpbmVzLnB1c2gobWluZUN1cnJlbnQpO1xuICAgICAgbWluZS5pbmRleCsrO1xuICAgICAgdGhlaXIuaW5kZXgrKztcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gQ29udGV4dCBtaXNtYXRjaFxuICAgICAgY29uZmxpY3QoaHVuaywgY29sbGVjdENoYW5nZShtaW5lKSwgY29sbGVjdENoYW5nZSh0aGVpcikpO1xuICAgIH1cbiAgfSAvLyBOb3cgcHVzaCBhbnl0aGluZyB0aGF0IG1heSBiZSByZW1haW5pbmdcblxuXG4gIGluc2VydFRyYWlsaW5nKGh1bmssIG1pbmUpO1xuICBpbnNlcnRUcmFpbGluZyhodW5rLCB0aGVpcik7XG4gIGNhbGNMaW5lQ291bnQoaHVuayk7XG59XG5cbmZ1bmN0aW9uIG11dHVhbENoYW5nZShodW5rLCBtaW5lLCB0aGVpcikge1xuICB2YXIgbXlDaGFuZ2VzID0gY29sbGVjdENoYW5nZShtaW5lKSxcbiAgICAgIHRoZWlyQ2hhbmdlcyA9IGNvbGxlY3RDaGFuZ2UodGhlaXIpO1xuXG4gIGlmIChhbGxSZW1vdmVzKG15Q2hhbmdlcykgJiYgYWxsUmVtb3Zlcyh0aGVpckNoYW5nZXMpKSB7XG4gICAgLy8gU3BlY2lhbCBjYXNlIGZvciByZW1vdmUgY2hhbmdlcyB0aGF0IGFyZSBzdXBlcnNldHMgb2Ygb25lIGFub3RoZXJcbiAgICBpZiAoYXJyYXlTdGFydHNXaXRoKG15Q2hhbmdlcywgdGhlaXJDaGFuZ2VzKSAmJiBza2lwUmVtb3ZlU3VwZXJzZXQodGhlaXIsIG15Q2hhbmdlcywgbXlDaGFuZ2VzLmxlbmd0aCAtIHRoZWlyQ2hhbmdlcy5sZW5ndGgpKSB7XG4gICAgICB2YXIgX2h1bmskbGluZXMzO1xuXG4gICAgICAoX2h1bmskbGluZXMzID0gaHVuay5saW5lcykucHVzaC5hcHBseShfaHVuayRsaW5lczMsIF90b0NvbnN1bWFibGVBcnJheShteUNoYW5nZXMpKTtcblxuICAgICAgcmV0dXJuO1xuICAgIH0gZWxzZSBpZiAoYXJyYXlTdGFydHNXaXRoKHRoZWlyQ2hhbmdlcywgbXlDaGFuZ2VzKSAmJiBza2lwUmVtb3ZlU3VwZXJzZXQobWluZSwgdGhlaXJDaGFuZ2VzLCB0aGVpckNoYW5nZXMubGVuZ3RoIC0gbXlDaGFuZ2VzLmxlbmd0aCkpIHtcbiAgICAgIHZhciBfaHVuayRsaW5lczQ7XG5cbiAgICAgIChfaHVuayRsaW5lczQgPSBodW5rLmxpbmVzKS5wdXNoLmFwcGx5KF9odW5rJGxpbmVzNCwgX3RvQ29uc3VtYWJsZUFycmF5KHRoZWlyQ2hhbmdlcykpO1xuXG4gICAgICByZXR1cm47XG4gICAgfVxuICB9IGVsc2UgaWYgKGFycmF5RXF1YWwobXlDaGFuZ2VzLCB0aGVpckNoYW5nZXMpKSB7XG4gICAgdmFyIF9odW5rJGxpbmVzNTtcblxuICAgIChfaHVuayRsaW5lczUgPSBodW5rLmxpbmVzKS5wdXNoLmFwcGx5KF9odW5rJGxpbmVzNSwgX3RvQ29uc3VtYWJsZUFycmF5KG15Q2hhbmdlcykpO1xuXG4gICAgcmV0dXJuO1xuICB9XG5cbiAgY29uZmxpY3QoaHVuaywgbXlDaGFuZ2VzLCB0aGVpckNoYW5nZXMpO1xufVxuXG5mdW5jdGlvbiByZW1vdmFsKGh1bmssIG1pbmUsIHRoZWlyLCBzd2FwKSB7XG4gIHZhciBteUNoYW5nZXMgPSBjb2xsZWN0Q2hhbmdlKG1pbmUpLFxuICAgICAgdGhlaXJDaGFuZ2VzID0gY29sbGVjdENvbnRleHQodGhlaXIsIG15Q2hhbmdlcyk7XG5cbiAgaWYgKHRoZWlyQ2hhbmdlcy5tZXJnZWQpIHtcbiAgICB2YXIgX2h1bmskbGluZXM2O1xuXG4gICAgKF9odW5rJGxpbmVzNiA9IGh1bmsubGluZXMpLnB1c2guYXBwbHkoX2h1bmskbGluZXM2LCBfdG9Db25zdW1hYmxlQXJyYXkodGhlaXJDaGFuZ2VzLm1lcmdlZCkpO1xuICB9IGVsc2Uge1xuICAgIGNvbmZsaWN0KGh1bmssIHN3YXAgPyB0aGVpckNoYW5nZXMgOiBteUNoYW5nZXMsIHN3YXAgPyBteUNoYW5nZXMgOiB0aGVpckNoYW5nZXMpO1xuICB9XG59XG5cbmZ1bmN0aW9uIGNvbmZsaWN0KGh1bmssIG1pbmUsIHRoZWlyKSB7XG4gIGh1bmsuY29uZmxpY3QgPSB0cnVlO1xuICBodW5rLmxpbmVzLnB1c2goe1xuICAgIGNvbmZsaWN0OiB0cnVlLFxuICAgIG1pbmU6IG1pbmUsXG4gICAgdGhlaXJzOiB0aGVpclxuICB9KTtcbn1cblxuZnVuY3Rpb24gaW5zZXJ0TGVhZGluZyhodW5rLCBpbnNlcnQsIHRoZWlyKSB7XG4gIHdoaWxlIChpbnNlcnQub2Zmc2V0IDwgdGhlaXIub2Zmc2V0ICYmIGluc2VydC5pbmRleCA8IGluc2VydC5saW5lcy5sZW5ndGgpIHtcbiAgICB2YXIgbGluZSA9IGluc2VydC5saW5lc1tpbnNlcnQuaW5kZXgrK107XG4gICAgaHVuay5saW5lcy5wdXNoKGxpbmUpO1xuICAgIGluc2VydC5vZmZzZXQrKztcbiAgfVxufVxuXG5mdW5jdGlvbiBpbnNlcnRUcmFpbGluZyhodW5rLCBpbnNlcnQpIHtcbiAgd2hpbGUgKGluc2VydC5pbmRleCA8IGluc2VydC5saW5lcy5sZW5ndGgpIHtcbiAgICB2YXIgbGluZSA9IGluc2VydC5saW5lc1tpbnNlcnQuaW5kZXgrK107XG4gICAgaHVuay5saW5lcy5wdXNoKGxpbmUpO1xuICB9XG59XG5cbmZ1bmN0aW9uIGNvbGxlY3RDaGFuZ2Uoc3RhdGUpIHtcbiAgdmFyIHJldCA9IFtdLFxuICAgICAgb3BlcmF0aW9uID0gc3RhdGUubGluZXNbc3RhdGUuaW5kZXhdWzBdO1xuXG4gIHdoaWxlIChzdGF0ZS5pbmRleCA8IHN0YXRlLmxpbmVzLmxlbmd0aCkge1xuICAgIHZhciBsaW5lID0gc3RhdGUubGluZXNbc3RhdGUuaW5kZXhdOyAvLyBHcm91cCBhZGRpdGlvbnMgdGhhdCBhcmUgaW1tZWRpYXRlbHkgYWZ0ZXIgc3VidHJhY3Rpb25zIGFuZCB0cmVhdCB0aGVtIGFzIG9uZSBcImF0b21pY1wiIG1vZGlmeSBjaGFuZ2UuXG5cbiAgICBpZiAob3BlcmF0aW9uID09PSAnLScgJiYgbGluZVswXSA9PT0gJysnKSB7XG4gICAgICBvcGVyYXRpb24gPSAnKyc7XG4gICAgfVxuXG4gICAgaWYgKG9wZXJhdGlvbiA9PT0gbGluZVswXSkge1xuICAgICAgcmV0LnB1c2gobGluZSk7XG4gICAgICBzdGF0ZS5pbmRleCsrO1xuICAgIH0gZWxzZSB7XG4gICAgICBicmVhaztcbiAgICB9XG4gIH1cblxuICByZXR1cm4gcmV0O1xufVxuXG5mdW5jdGlvbiBjb2xsZWN0Q29udGV4dChzdGF0ZSwgbWF0Y2hDaGFuZ2VzKSB7XG4gIHZhciBjaGFuZ2VzID0gW10sXG4gICAgICBtZXJnZWQgPSBbXSxcbiAgICAgIG1hdGNoSW5kZXggPSAwLFxuICAgICAgY29udGV4dENoYW5nZXMgPSBmYWxzZSxcbiAgICAgIGNvbmZsaWN0ZWQgPSBmYWxzZTtcblxuICB3aGlsZSAobWF0Y2hJbmRleCA8IG1hdGNoQ2hhbmdlcy5sZW5ndGggJiYgc3RhdGUuaW5kZXggPCBzdGF0ZS5saW5lcy5sZW5ndGgpIHtcbiAgICB2YXIgY2hhbmdlID0gc3RhdGUubGluZXNbc3RhdGUuaW5kZXhdLFxuICAgICAgICBtYXRjaCA9IG1hdGNoQ2hhbmdlc1ttYXRjaEluZGV4XTsgLy8gT25jZSB3ZSd2ZSBoaXQgb3VyIGFkZCwgdGhlbiB3ZSBhcmUgZG9uZVxuXG4gICAgaWYgKG1hdGNoWzBdID09PSAnKycpIHtcbiAgICAgIGJyZWFrO1xuICAgIH1cblxuICAgIGNvbnRleHRDaGFuZ2VzID0gY29udGV4dENoYW5nZXMgfHwgY2hhbmdlWzBdICE9PSAnICc7XG4gICAgbWVyZ2VkLnB1c2gobWF0Y2gpO1xuICAgIG1hdGNoSW5kZXgrKzsgLy8gQ29uc3VtZSBhbnkgYWRkaXRpb25zIGluIHRoZSBvdGhlciBibG9jayBhcyBhIGNvbmZsaWN0IHRvIGF0dGVtcHRcbiAgICAvLyB0byBwdWxsIGluIHRoZSByZW1haW5pbmcgY29udGV4dCBhZnRlciB0aGlzXG5cbiAgICBpZiAoY2hhbmdlWzBdID09PSAnKycpIHtcbiAgICAgIGNvbmZsaWN0ZWQgPSB0cnVlO1xuXG4gICAgICB3aGlsZSAoY2hhbmdlWzBdID09PSAnKycpIHtcbiAgICAgICAgY2hhbmdlcy5wdXNoKGNoYW5nZSk7XG4gICAgICAgIGNoYW5nZSA9IHN0YXRlLmxpbmVzWysrc3RhdGUuaW5kZXhdO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChtYXRjaC5zdWJzdHIoMSkgPT09IGNoYW5nZS5zdWJzdHIoMSkpIHtcbiAgICAgIGNoYW5nZXMucHVzaChjaGFuZ2UpO1xuICAgICAgc3RhdGUuaW5kZXgrKztcbiAgICB9IGVsc2Uge1xuICAgICAgY29uZmxpY3RlZCA9IHRydWU7XG4gICAgfVxuICB9XG5cbiAgaWYgKChtYXRjaENoYW5nZXNbbWF0Y2hJbmRleF0gfHwgJycpWzBdID09PSAnKycgJiYgY29udGV4dENoYW5nZXMpIHtcbiAgICBjb25mbGljdGVkID0gdHJ1ZTtcbiAgfVxuXG4gIGlmIChjb25mbGljdGVkKSB7XG4gICAgcmV0dXJuIGNoYW5nZXM7XG4gIH1cblxuICB3aGlsZSAobWF0Y2hJbmRleCA8IG1hdGNoQ2hhbmdlcy5sZW5ndGgpIHtcbiAgICBtZXJnZWQucHVzaChtYXRjaENoYW5nZXNbbWF0Y2hJbmRleCsrXSk7XG4gIH1cblxuICByZXR1cm4ge1xuICAgIG1lcmdlZDogbWVyZ2VkLFxuICAgIGNoYW5nZXM6IGNoYW5nZXNcbiAgfTtcbn1cblxuZnVuY3Rpb24gYWxsUmVtb3ZlcyhjaGFuZ2VzKSB7XG4gIHJldHVybiBjaGFuZ2VzLnJlZHVjZShmdW5jdGlvbiAocHJldiwgY2hhbmdlKSB7XG4gICAgcmV0dXJuIHByZXYgJiYgY2hhbmdlWzBdID09PSAnLSc7XG4gIH0sIHRydWUpO1xufVxuXG5mdW5jdGlvbiBza2lwUmVtb3ZlU3VwZXJzZXQoc3RhdGUsIHJlbW92ZUNoYW5nZXMsIGRlbHRhKSB7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgZGVsdGE7IGkrKykge1xuICAgIHZhciBjaGFuZ2VDb250ZW50ID0gcmVtb3ZlQ2hhbmdlc1tyZW1vdmVDaGFuZ2VzLmxlbmd0aCAtIGRlbHRhICsgaV0uc3Vic3RyKDEpO1xuXG4gICAgaWYgKHN0YXRlLmxpbmVzW3N0YXRlLmluZGV4ICsgaV0gIT09ICcgJyArIGNoYW5nZUNvbnRlbnQpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gIH1cblxuICBzdGF0ZS5pbmRleCArPSBkZWx0YTtcbiAgcmV0dXJuIHRydWU7XG59XG5cbmZ1bmN0aW9uIGNhbGNPbGROZXdMaW5lQ291bnQobGluZXMpIHtcbiAgdmFyIG9sZExpbmVzID0gMDtcbiAgdmFyIG5ld0xpbmVzID0gMDtcbiAgbGluZXMuZm9yRWFjaChmdW5jdGlvbiAobGluZSkge1xuICAgIGlmICh0eXBlb2YgbGluZSAhPT0gJ3N0cmluZycpIHtcbiAgICAgIHZhciBteUNvdW50ID0gY2FsY09sZE5ld0xpbmVDb3VudChsaW5lLm1pbmUpO1xuICAgICAgdmFyIHRoZWlyQ291bnQgPSBjYWxjT2xkTmV3TGluZUNvdW50KGxpbmUudGhlaXJzKTtcblxuICAgICAgaWYgKG9sZExpbmVzICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgaWYgKG15Q291bnQub2xkTGluZXMgPT09IHRoZWlyQ291bnQub2xkTGluZXMpIHtcbiAgICAgICAgICBvbGRMaW5lcyArPSBteUNvdW50Lm9sZExpbmVzO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIG9sZExpbmVzID0gdW5kZWZpbmVkO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmIChuZXdMaW5lcyAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGlmIChteUNvdW50Lm5ld0xpbmVzID09PSB0aGVpckNvdW50Lm5ld0xpbmVzKSB7XG4gICAgICAgICAgbmV3TGluZXMgKz0gbXlDb3VudC5uZXdMaW5lcztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBuZXdMaW5lcyA9IHVuZGVmaW5lZDtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBpZiAobmV3TGluZXMgIT09IHVuZGVmaW5lZCAmJiAobGluZVswXSA9PT0gJysnIHx8IGxpbmVbMF0gPT09ICcgJykpIHtcbiAgICAgICAgbmV3TGluZXMrKztcbiAgICAgIH1cblxuICAgICAgaWYgKG9sZExpbmVzICE9PSB1bmRlZmluZWQgJiYgKGxpbmVbMF0gPT09ICctJyB8fCBsaW5lWzBdID09PSAnICcpKSB7XG4gICAgICAgIG9sZExpbmVzKys7XG4gICAgICB9XG4gICAgfVxuICB9KTtcbiAgcmV0dXJuIHtcbiAgICBvbGRMaW5lczogb2xkTGluZXMsXG4gICAgbmV3TGluZXM6IG5ld0xpbmVzXG4gIH07XG59XG5cbi8vIFNlZTogaHR0cDovL2NvZGUuZ29vZ2xlLmNvbS9wL2dvb2dsZS1kaWZmLW1hdGNoLXBhdGNoL3dpa2kvQVBJXG5mdW5jdGlvbiBjb252ZXJ0Q2hhbmdlc1RvRE1QKGNoYW5nZXMpIHtcbiAgdmFyIHJldCA9IFtdLFxuICAgICAgY2hhbmdlLFxuICAgICAgb3BlcmF0aW9uO1xuXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgY2hhbmdlcy5sZW5ndGg7IGkrKykge1xuICAgIGNoYW5nZSA9IGNoYW5nZXNbaV07XG5cbiAgICBpZiAoY2hhbmdlLmFkZGVkKSB7XG4gICAgICBvcGVyYXRpb24gPSAxO1xuICAgIH0gZWxzZSBpZiAoY2hhbmdlLnJlbW92ZWQpIHtcbiAgICAgIG9wZXJhdGlvbiA9IC0xO1xuICAgIH0gZWxzZSB7XG4gICAgICBvcGVyYXRpb24gPSAwO1xuICAgIH1cblxuICAgIHJldC5wdXNoKFtvcGVyYXRpb24sIGNoYW5nZS52YWx1ZV0pO1xuICB9XG5cbiAgcmV0dXJuIHJldDtcbn1cblxuZnVuY3Rpb24gY29udmVydENoYW5nZXNUb1hNTChjaGFuZ2VzKSB7XG4gIHZhciByZXQgPSBbXTtcblxuICBmb3IgKHZhciBpID0gMDsgaSA8IGNoYW5nZXMubGVuZ3RoOyBpKyspIHtcbiAgICB2YXIgY2hhbmdlID0gY2hhbmdlc1tpXTtcblxuICAgIGlmIChjaGFuZ2UuYWRkZWQpIHtcbiAgICAgIHJldC5wdXNoKCc8aW5zPicpO1xuICAgIH0gZWxzZSBpZiAoY2hhbmdlLnJlbW92ZWQpIHtcbiAgICAgIHJldC5wdXNoKCc8ZGVsPicpO1xuICAgIH1cblxuICAgIHJldC5wdXNoKGVzY2FwZUhUTUwoY2hhbmdlLnZhbHVlKSk7XG5cbiAgICBpZiAoY2hhbmdlLmFkZGVkKSB7XG4gICAgICByZXQucHVzaCgnPC9pbnM+Jyk7XG4gICAgfSBlbHNlIGlmIChjaGFuZ2UucmVtb3ZlZCkge1xuICAgICAgcmV0LnB1c2goJzwvZGVsPicpO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiByZXQuam9pbignJyk7XG59XG5cbmZ1bmN0aW9uIGVzY2FwZUhUTUwocykge1xuICB2YXIgbiA9IHM7XG4gIG4gPSBuLnJlcGxhY2UoLyYvZywgJyZhbXA7Jyk7XG4gIG4gPSBuLnJlcGxhY2UoLzwvZywgJyZsdDsnKTtcbiAgbiA9IG4ucmVwbGFjZSgvPi9nLCAnJmd0OycpO1xuICBuID0gbi5yZXBsYWNlKC9cIi9nLCAnJnF1b3Q7Jyk7XG4gIHJldHVybiBuO1xufVxuXG5leHBvcnQgeyBEaWZmLCBhcHBseVBhdGNoLCBhcHBseVBhdGNoZXMsIGNhbm9uaWNhbGl6ZSwgY29udmVydENoYW5nZXNUb0RNUCwgY29udmVydENoYW5nZXNUb1hNTCwgY3JlYXRlUGF0Y2gsIGNyZWF0ZVR3b0ZpbGVzUGF0Y2gsIGRpZmZBcnJheXMsIGRpZmZDaGFycywgZGlmZkNzcywgZGlmZkpzb24sIGRpZmZMaW5lcywgZGlmZlNlbnRlbmNlcywgZGlmZlRyaW1tZWRMaW5lcywgZGlmZldvcmRzLCBkaWZmV29yZHNXaXRoU3BhY2UsIG1lcmdlLCBwYXJzZVBhdGNoLCBzdHJ1Y3R1cmVkUGF0Y2ggfTtcbiIsIi8qIGVzbGludC1kaXNhYmxlIHlvZGEgKi9cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gaXNGdWxsd2lkdGhDb2RlUG9pbnQoY29kZVBvaW50KSB7XG5cdGlmICghTnVtYmVyLmlzSW50ZWdlcihjb2RlUG9pbnQpKSB7XG5cdFx0cmV0dXJuIGZhbHNlO1xuXHR9XG5cblx0Ly8gQ29kZSBwb2ludHMgYXJlIGRlcml2ZWQgZnJvbTpcblx0Ly8gaHR0cHM6Ly91bmljb2RlLm9yZy9QdWJsaWMvVU5JREFUQS9FYXN0QXNpYW5XaWR0aC50eHRcblx0cmV0dXJuIGNvZGVQb2ludCA+PSAweDExMDAgJiYgKFxuXHRcdGNvZGVQb2ludCA8PSAweDExNUYgfHwgLy8gSGFuZ3VsIEphbW9cblx0XHRjb2RlUG9pbnQgPT09IDB4MjMyOSB8fCAvLyBMRUZULVBPSU5USU5HIEFOR0xFIEJSQUNLRVRcblx0XHRjb2RlUG9pbnQgPT09IDB4MjMyQSB8fCAvLyBSSUdIVC1QT0lOVElORyBBTkdMRSBCUkFDS0VUXG5cdFx0Ly8gQ0pLIFJhZGljYWxzIFN1cHBsZW1lbnQgLi4gRW5jbG9zZWQgQ0pLIExldHRlcnMgYW5kIE1vbnRoc1xuXHRcdCgweDJFODAgPD0gY29kZVBvaW50ICYmIGNvZGVQb2ludCA8PSAweDMyNDcgJiYgY29kZVBvaW50ICE9PSAweDMwM0YpIHx8XG5cdFx0Ly8gRW5jbG9zZWQgQ0pLIExldHRlcnMgYW5kIE1vbnRocyAuLiBDSksgVW5pZmllZCBJZGVvZ3JhcGhzIEV4dGVuc2lvbiBBXG5cdFx0KDB4MzI1MCA8PSBjb2RlUG9pbnQgJiYgY29kZVBvaW50IDw9IDB4NERCRikgfHxcblx0XHQvLyBDSksgVW5pZmllZCBJZGVvZ3JhcGhzIC4uIFlpIFJhZGljYWxzXG5cdFx0KDB4NEUwMCA8PSBjb2RlUG9pbnQgJiYgY29kZVBvaW50IDw9IDB4QTRDNikgfHxcblx0XHQvLyBIYW5ndWwgSmFtbyBFeHRlbmRlZC1BXG5cdFx0KDB4QTk2MCA8PSBjb2RlUG9pbnQgJiYgY29kZVBvaW50IDw9IDB4QTk3QykgfHxcblx0XHQvLyBIYW5ndWwgU3lsbGFibGVzXG5cdFx0KDB4QUMwMCA8PSBjb2RlUG9pbnQgJiYgY29kZVBvaW50IDw9IDB4RDdBMykgfHxcblx0XHQvLyBDSksgQ29tcGF0aWJpbGl0eSBJZGVvZ3JhcGhzXG5cdFx0KDB4RjkwMCA8PSBjb2RlUG9pbnQgJiYgY29kZVBvaW50IDw9IDB4RkFGRikgfHxcblx0XHQvLyBWZXJ0aWNhbCBGb3Jtc1xuXHRcdCgweEZFMTAgPD0gY29kZVBvaW50ICYmIGNvZGVQb2ludCA8PSAweEZFMTkpIHx8XG5cdFx0Ly8gQ0pLIENvbXBhdGliaWxpdHkgRm9ybXMgLi4gU21hbGwgRm9ybSBWYXJpYW50c1xuXHRcdCgweEZFMzAgPD0gY29kZVBvaW50ICYmIGNvZGVQb2ludCA8PSAweEZFNkIpIHx8XG5cdFx0Ly8gSGFsZndpZHRoIGFuZCBGdWxsd2lkdGggRm9ybXNcblx0XHQoMHhGRjAxIDw9IGNvZGVQb2ludCAmJiBjb2RlUG9pbnQgPD0gMHhGRjYwKSB8fFxuXHRcdCgweEZGRTAgPD0gY29kZVBvaW50ICYmIGNvZGVQb2ludCA8PSAweEZGRTYpIHx8XG5cdFx0Ly8gS2FuYSBTdXBwbGVtZW50XG5cdFx0KDB4MUIwMDAgPD0gY29kZVBvaW50ICYmIGNvZGVQb2ludCA8PSAweDFCMDAxKSB8fFxuXHRcdC8vIEVuY2xvc2VkIElkZW9ncmFwaGljIFN1cHBsZW1lbnRcblx0XHQoMHgxRjIwMCA8PSBjb2RlUG9pbnQgJiYgY29kZVBvaW50IDw9IDB4MUYyNTEpIHx8XG5cdFx0Ly8gQ0pLIFVuaWZpZWQgSWRlb2dyYXBocyBFeHRlbnNpb24gQiAuLiBUZXJ0aWFyeSBJZGVvZ3JhcGhpYyBQbGFuZVxuXHRcdCgweDIwMDAwIDw9IGNvZGVQb2ludCAmJiBjb2RlUG9pbnQgPD0gMHgzRkZGRClcblx0KTtcbn1cbiIsImNvbnN0IEFOU0lfQkFDS0dST1VORF9PRkZTRVQgPSAxMDtcblxuY29uc3Qgd3JhcEFuc2kxNiA9IChvZmZzZXQgPSAwKSA9PiBjb2RlID0+IGBcXHUwMDFCWyR7Y29kZSArIG9mZnNldH1tYDtcblxuY29uc3Qgd3JhcEFuc2kyNTYgPSAob2Zmc2V0ID0gMCkgPT4gY29kZSA9PiBgXFx1MDAxQlskezM4ICsgb2Zmc2V0fTs1OyR7Y29kZX1tYDtcblxuY29uc3Qgd3JhcEFuc2kxNm0gPSAob2Zmc2V0ID0gMCkgPT4gKHJlZCwgZ3JlZW4sIGJsdWUpID0+IGBcXHUwMDFCWyR7MzggKyBvZmZzZXR9OzI7JHtyZWR9OyR7Z3JlZW59OyR7Ymx1ZX1tYDtcblxuZnVuY3Rpb24gYXNzZW1ibGVTdHlsZXMoKSB7XG5cdGNvbnN0IGNvZGVzID0gbmV3IE1hcCgpO1xuXHRjb25zdCBzdHlsZXMgPSB7XG5cdFx0bW9kaWZpZXI6IHtcblx0XHRcdHJlc2V0OiBbMCwgMF0sXG5cdFx0XHQvLyAyMSBpc24ndCB3aWRlbHkgc3VwcG9ydGVkIGFuZCAyMiBkb2VzIHRoZSBzYW1lIHRoaW5nXG5cdFx0XHRib2xkOiBbMSwgMjJdLFxuXHRcdFx0ZGltOiBbMiwgMjJdLFxuXHRcdFx0aXRhbGljOiBbMywgMjNdLFxuXHRcdFx0dW5kZXJsaW5lOiBbNCwgMjRdLFxuXHRcdFx0b3ZlcmxpbmU6IFs1MywgNTVdLFxuXHRcdFx0aW52ZXJzZTogWzcsIDI3XSxcblx0XHRcdGhpZGRlbjogWzgsIDI4XSxcblx0XHRcdHN0cmlrZXRocm91Z2g6IFs5LCAyOV1cblx0XHR9LFxuXHRcdGNvbG9yOiB7XG5cdFx0XHRibGFjazogWzMwLCAzOV0sXG5cdFx0XHRyZWQ6IFszMSwgMzldLFxuXHRcdFx0Z3JlZW46IFszMiwgMzldLFxuXHRcdFx0eWVsbG93OiBbMzMsIDM5XSxcblx0XHRcdGJsdWU6IFszNCwgMzldLFxuXHRcdFx0bWFnZW50YTogWzM1LCAzOV0sXG5cdFx0XHRjeWFuOiBbMzYsIDM5XSxcblx0XHRcdHdoaXRlOiBbMzcsIDM5XSxcblxuXHRcdFx0Ly8gQnJpZ2h0IGNvbG9yXG5cdFx0XHRibGFja0JyaWdodDogWzkwLCAzOV0sXG5cdFx0XHRyZWRCcmlnaHQ6IFs5MSwgMzldLFxuXHRcdFx0Z3JlZW5CcmlnaHQ6IFs5MiwgMzldLFxuXHRcdFx0eWVsbG93QnJpZ2h0OiBbOTMsIDM5XSxcblx0XHRcdGJsdWVCcmlnaHQ6IFs5NCwgMzldLFxuXHRcdFx0bWFnZW50YUJyaWdodDogWzk1LCAzOV0sXG5cdFx0XHRjeWFuQnJpZ2h0OiBbOTYsIDM5XSxcblx0XHRcdHdoaXRlQnJpZ2h0OiBbOTcsIDM5XVxuXHRcdH0sXG5cdFx0YmdDb2xvcjoge1xuXHRcdFx0YmdCbGFjazogWzQwLCA0OV0sXG5cdFx0XHRiZ1JlZDogWzQxLCA0OV0sXG5cdFx0XHRiZ0dyZWVuOiBbNDIsIDQ5XSxcblx0XHRcdGJnWWVsbG93OiBbNDMsIDQ5XSxcblx0XHRcdGJnQmx1ZTogWzQ0LCA0OV0sXG5cdFx0XHRiZ01hZ2VudGE6IFs0NSwgNDldLFxuXHRcdFx0YmdDeWFuOiBbNDYsIDQ5XSxcblx0XHRcdGJnV2hpdGU6IFs0NywgNDldLFxuXG5cdFx0XHQvLyBCcmlnaHQgY29sb3Jcblx0XHRcdGJnQmxhY2tCcmlnaHQ6IFsxMDAsIDQ5XSxcblx0XHRcdGJnUmVkQnJpZ2h0OiBbMTAxLCA0OV0sXG5cdFx0XHRiZ0dyZWVuQnJpZ2h0OiBbMTAyLCA0OV0sXG5cdFx0XHRiZ1llbGxvd0JyaWdodDogWzEwMywgNDldLFxuXHRcdFx0YmdCbHVlQnJpZ2h0OiBbMTA0LCA0OV0sXG5cdFx0XHRiZ01hZ2VudGFCcmlnaHQ6IFsxMDUsIDQ5XSxcblx0XHRcdGJnQ3lhbkJyaWdodDogWzEwNiwgNDldLFxuXHRcdFx0YmdXaGl0ZUJyaWdodDogWzEwNywgNDldXG5cdFx0fVxuXHR9O1xuXG5cdC8vIEFsaWFzIGJyaWdodCBibGFjayBhcyBncmF5IChhbmQgZ3JleSlcblx0c3R5bGVzLmNvbG9yLmdyYXkgPSBzdHlsZXMuY29sb3IuYmxhY2tCcmlnaHQ7XG5cdHN0eWxlcy5iZ0NvbG9yLmJnR3JheSA9IHN0eWxlcy5iZ0NvbG9yLmJnQmxhY2tCcmlnaHQ7XG5cdHN0eWxlcy5jb2xvci5ncmV5ID0gc3R5bGVzLmNvbG9yLmJsYWNrQnJpZ2h0O1xuXHRzdHlsZXMuYmdDb2xvci5iZ0dyZXkgPSBzdHlsZXMuYmdDb2xvci5iZ0JsYWNrQnJpZ2h0O1xuXG5cdGZvciAoY29uc3QgW2dyb3VwTmFtZSwgZ3JvdXBdIG9mIE9iamVjdC5lbnRyaWVzKHN0eWxlcykpIHtcblx0XHRmb3IgKGNvbnN0IFtzdHlsZU5hbWUsIHN0eWxlXSBvZiBPYmplY3QuZW50cmllcyhncm91cCkpIHtcblx0XHRcdHN0eWxlc1tzdHlsZU5hbWVdID0ge1xuXHRcdFx0XHRvcGVuOiBgXFx1MDAxQlske3N0eWxlWzBdfW1gLFxuXHRcdFx0XHRjbG9zZTogYFxcdTAwMUJbJHtzdHlsZVsxXX1tYFxuXHRcdFx0fTtcblxuXHRcdFx0Z3JvdXBbc3R5bGVOYW1lXSA9IHN0eWxlc1tzdHlsZU5hbWVdO1xuXG5cdFx0XHRjb2Rlcy5zZXQoc3R5bGVbMF0sIHN0eWxlWzFdKTtcblx0XHR9XG5cblx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoc3R5bGVzLCBncm91cE5hbWUsIHtcblx0XHRcdHZhbHVlOiBncm91cCxcblx0XHRcdGVudW1lcmFibGU6IGZhbHNlXG5cdFx0fSk7XG5cdH1cblxuXHRPYmplY3QuZGVmaW5lUHJvcGVydHkoc3R5bGVzLCAnY29kZXMnLCB7XG5cdFx0dmFsdWU6IGNvZGVzLFxuXHRcdGVudW1lcmFibGU6IGZhbHNlXG5cdH0pO1xuXG5cdHN0eWxlcy5jb2xvci5jbG9zZSA9ICdcXHUwMDFCWzM5bSc7XG5cdHN0eWxlcy5iZ0NvbG9yLmNsb3NlID0gJ1xcdTAwMUJbNDltJztcblxuXHRzdHlsZXMuY29sb3IuYW5zaSA9IHdyYXBBbnNpMTYoKTtcblx0c3R5bGVzLmNvbG9yLmFuc2kyNTYgPSB3cmFwQW5zaTI1NigpO1xuXHRzdHlsZXMuY29sb3IuYW5zaTE2bSA9IHdyYXBBbnNpMTZtKCk7XG5cdHN0eWxlcy5iZ0NvbG9yLmFuc2kgPSB3cmFwQW5zaTE2KEFOU0lfQkFDS0dST1VORF9PRkZTRVQpO1xuXHRzdHlsZXMuYmdDb2xvci5hbnNpMjU2ID0gd3JhcEFuc2kyNTYoQU5TSV9CQUNLR1JPVU5EX09GRlNFVCk7XG5cdHN0eWxlcy5iZ0NvbG9yLmFuc2kxNm0gPSB3cmFwQW5zaTE2bShBTlNJX0JBQ0tHUk9VTkRfT0ZGU0VUKTtcblxuXHQvLyBGcm9tIGh0dHBzOi8vZ2l0aHViLmNvbS9RaXgtL2NvbG9yLWNvbnZlcnQvYmxvYi8zZjBlMGQ0ZTkyZTIzNTc5NmNjYjE3ZjZlODVjNzIwOTRhNjUxZjQ5L2NvbnZlcnNpb25zLmpzXG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzKHN0eWxlcywge1xuXHRcdHJnYlRvQW5zaTI1Njoge1xuXHRcdFx0dmFsdWU6IChyZWQsIGdyZWVuLCBibHVlKSA9PiB7XG5cdFx0XHRcdC8vIFdlIHVzZSB0aGUgZXh0ZW5kZWQgZ3JleXNjYWxlIHBhbGV0dGUgaGVyZSwgd2l0aCB0aGUgZXhjZXB0aW9uIG9mXG5cdFx0XHRcdC8vIGJsYWNrIGFuZCB3aGl0ZS4gbm9ybWFsIHBhbGV0dGUgb25seSBoYXMgNCBncmV5c2NhbGUgc2hhZGVzLlxuXHRcdFx0XHRpZiAocmVkID09PSBncmVlbiAmJiBncmVlbiA9PT0gYmx1ZSkge1xuXHRcdFx0XHRcdGlmIChyZWQgPCA4KSB7XG5cdFx0XHRcdFx0XHRyZXR1cm4gMTY7XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0aWYgKHJlZCA+IDI0OCkge1xuXHRcdFx0XHRcdFx0cmV0dXJuIDIzMTtcblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRyZXR1cm4gTWF0aC5yb3VuZCgoKHJlZCAtIDgpIC8gMjQ3KSAqIDI0KSArIDIzMjtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdHJldHVybiAxNiArXG5cdFx0XHRcdFx0KDM2ICogTWF0aC5yb3VuZChyZWQgLyAyNTUgKiA1KSkgK1xuXHRcdFx0XHRcdCg2ICogTWF0aC5yb3VuZChncmVlbiAvIDI1NSAqIDUpKSArXG5cdFx0XHRcdFx0TWF0aC5yb3VuZChibHVlIC8gMjU1ICogNSk7XG5cdFx0XHR9LFxuXHRcdFx0ZW51bWVyYWJsZTogZmFsc2Vcblx0XHR9LFxuXHRcdGhleFRvUmdiOiB7XG5cdFx0XHR2YWx1ZTogaGV4ID0+IHtcblx0XHRcdFx0Y29uc3QgbWF0Y2hlcyA9IC8oPzxjb2xvclN0cmluZz5bYS1mXFxkXXs2fXxbYS1mXFxkXXszfSkvaS5leGVjKGhleC50b1N0cmluZygxNikpO1xuXHRcdFx0XHRpZiAoIW1hdGNoZXMpIHtcblx0XHRcdFx0XHRyZXR1cm4gWzAsIDAsIDBdO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0bGV0IHtjb2xvclN0cmluZ30gPSBtYXRjaGVzLmdyb3VwcztcblxuXHRcdFx0XHRpZiAoY29sb3JTdHJpbmcubGVuZ3RoID09PSAzKSB7XG5cdFx0XHRcdFx0Y29sb3JTdHJpbmcgPSBjb2xvclN0cmluZy5zcGxpdCgnJykubWFwKGNoYXJhY3RlciA9PiBjaGFyYWN0ZXIgKyBjaGFyYWN0ZXIpLmpvaW4oJycpO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0Y29uc3QgaW50ZWdlciA9IE51bWJlci5wYXJzZUludChjb2xvclN0cmluZywgMTYpO1xuXG5cdFx0XHRcdHJldHVybiBbXG5cdFx0XHRcdFx0KGludGVnZXIgPj4gMTYpICYgMHhGRixcblx0XHRcdFx0XHQoaW50ZWdlciA+PiA4KSAmIDB4RkYsXG5cdFx0XHRcdFx0aW50ZWdlciAmIDB4RkZcblx0XHRcdFx0XTtcblx0XHRcdH0sXG5cdFx0XHRlbnVtZXJhYmxlOiBmYWxzZVxuXHRcdH0sXG5cdFx0aGV4VG9BbnNpMjU2OiB7XG5cdFx0XHR2YWx1ZTogaGV4ID0+IHN0eWxlcy5yZ2JUb0Fuc2kyNTYoLi4uc3R5bGVzLmhleFRvUmdiKGhleCkpLFxuXHRcdFx0ZW51bWVyYWJsZTogZmFsc2Vcblx0XHR9LFxuXHRcdGFuc2kyNTZUb0Fuc2k6IHtcblx0XHRcdHZhbHVlOiBjb2RlID0+IHtcblx0XHRcdFx0aWYgKGNvZGUgPCA4KSB7XG5cdFx0XHRcdFx0cmV0dXJuIDMwICsgY29kZTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGlmIChjb2RlIDwgMTYpIHtcblx0XHRcdFx0XHRyZXR1cm4gOTAgKyAoY29kZSAtIDgpO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0bGV0IHJlZDtcblx0XHRcdFx0bGV0IGdyZWVuO1xuXHRcdFx0XHRsZXQgYmx1ZTtcblxuXHRcdFx0XHRpZiAoY29kZSA+PSAyMzIpIHtcblx0XHRcdFx0XHRyZWQgPSAoKChjb2RlIC0gMjMyKSAqIDEwKSArIDgpIC8gMjU1O1xuXHRcdFx0XHRcdGdyZWVuID0gcmVkO1xuXHRcdFx0XHRcdGJsdWUgPSByZWQ7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0Y29kZSAtPSAxNjtcblxuXHRcdFx0XHRcdGNvbnN0IHJlbWFpbmRlciA9IGNvZGUgJSAzNjtcblxuXHRcdFx0XHRcdHJlZCA9IE1hdGguZmxvb3IoY29kZSAvIDM2KSAvIDU7XG5cdFx0XHRcdFx0Z3JlZW4gPSBNYXRoLmZsb29yKHJlbWFpbmRlciAvIDYpIC8gNTtcblx0XHRcdFx0XHRibHVlID0gKHJlbWFpbmRlciAlIDYpIC8gNTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGNvbnN0IHZhbHVlID0gTWF0aC5tYXgocmVkLCBncmVlbiwgYmx1ZSkgKiAyO1xuXG5cdFx0XHRcdGlmICh2YWx1ZSA9PT0gMCkge1xuXHRcdFx0XHRcdHJldHVybiAzMDtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGxldCByZXN1bHQgPSAzMCArICgoTWF0aC5yb3VuZChibHVlKSA8PCAyKSB8IChNYXRoLnJvdW5kKGdyZWVuKSA8PCAxKSB8IE1hdGgucm91bmQocmVkKSk7XG5cblx0XHRcdFx0aWYgKHZhbHVlID09PSAyKSB7XG5cdFx0XHRcdFx0cmVzdWx0ICs9IDYwO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0cmV0dXJuIHJlc3VsdDtcblx0XHRcdH0sXG5cdFx0XHRlbnVtZXJhYmxlOiBmYWxzZVxuXHRcdH0sXG5cdFx0cmdiVG9BbnNpOiB7XG5cdFx0XHR2YWx1ZTogKHJlZCwgZ3JlZW4sIGJsdWUpID0+IHN0eWxlcy5hbnNpMjU2VG9BbnNpKHN0eWxlcy5yZ2JUb0Fuc2kyNTYocmVkLCBncmVlbiwgYmx1ZSkpLFxuXHRcdFx0ZW51bWVyYWJsZTogZmFsc2Vcblx0XHR9LFxuXHRcdGhleFRvQW5zaToge1xuXHRcdFx0dmFsdWU6IGhleCA9PiBzdHlsZXMuYW5zaTI1NlRvQW5zaShzdHlsZXMuaGV4VG9BbnNpMjU2KGhleCkpLFxuXHRcdFx0ZW51bWVyYWJsZTogZmFsc2Vcblx0XHR9XG5cdH0pO1xuXG5cdHJldHVybiBzdHlsZXM7XG59XG5cbmNvbnN0IGFuc2lTdHlsZXMgPSBhc3NlbWJsZVN0eWxlcygpO1xuXG5leHBvcnQgZGVmYXVsdCBhbnNpU3R5bGVzO1xuIiwiaW1wb3J0IGlzRnVsbHdpZHRoQ29kZVBvaW50IGZyb20gJ2lzLWZ1bGx3aWR0aC1jb2RlLXBvaW50JztcbmltcG9ydCBhbnNpU3R5bGVzIGZyb20gJ2Fuc2ktc3R5bGVzJztcblxuY29uc3QgYXN0cmFsUmVnZXggPSAvXltcXHVEODAwLVxcdURCRkZdW1xcdURDMDAtXFx1REZGRl0kLztcblxuY29uc3QgRVNDQVBFUyA9IFtcblx0J1xcdTAwMUInLFxuXHQnXFx1MDA5Qidcbl07XG5cbmNvbnN0IHdyYXBBbnNpID0gY29kZSA9PiBgJHtFU0NBUEVTWzBdfVske2NvZGV9bWA7XG5cbmNvbnN0IGNoZWNrQW5zaSA9IChhbnNpQ29kZXMsIGlzRXNjYXBlcywgZW5kQW5zaUNvZGUpID0+IHtcblx0bGV0IG91dHB1dCA9IFtdO1xuXHRhbnNpQ29kZXMgPSBbLi4uYW5zaUNvZGVzXTtcblxuXHRmb3IgKGxldCBhbnNpQ29kZSBvZiBhbnNpQ29kZXMpIHtcblx0XHRjb25zdCBhbnNpQ29kZU9yaWdpbiA9IGFuc2lDb2RlO1xuXHRcdGlmIChhbnNpQ29kZS5pbmNsdWRlcygnOycpKSB7XG5cdFx0XHRhbnNpQ29kZSA9IGFuc2lDb2RlLnNwbGl0KCc7JylbMF1bMF0gKyAnMCc7XG5cdFx0fVxuXG5cdFx0Y29uc3QgaXRlbSA9IGFuc2lTdHlsZXMuY29kZXMuZ2V0KE51bWJlci5wYXJzZUludChhbnNpQ29kZSwgMTApKTtcblx0XHRpZiAoaXRlbSkge1xuXHRcdFx0Y29uc3QgaW5kZXhFc2NhcGUgPSBhbnNpQ29kZXMuaW5kZXhPZihpdGVtLnRvU3RyaW5nKCkpO1xuXHRcdFx0aWYgKGluZGV4RXNjYXBlID09PSAtMSkge1xuXHRcdFx0XHRvdXRwdXQucHVzaCh3cmFwQW5zaShpc0VzY2FwZXMgPyBpdGVtIDogYW5zaUNvZGVPcmlnaW4pKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdGFuc2lDb2Rlcy5zcGxpY2UoaW5kZXhFc2NhcGUsIDEpO1xuXHRcdFx0fVxuXHRcdH0gZWxzZSBpZiAoaXNFc2NhcGVzKSB7XG5cdFx0XHRvdXRwdXQucHVzaCh3cmFwQW5zaSgwKSk7XG5cdFx0XHRicmVhaztcblx0XHR9IGVsc2Uge1xuXHRcdFx0b3V0cHV0LnB1c2god3JhcEFuc2koYW5zaUNvZGVPcmlnaW4pKTtcblx0XHR9XG5cdH1cblxuXHRpZiAoaXNFc2NhcGVzKSB7XG5cdFx0b3V0cHV0ID0gb3V0cHV0LmZpbHRlcigoZWxlbWVudCwgaW5kZXgpID0+IG91dHB1dC5pbmRleE9mKGVsZW1lbnQpID09PSBpbmRleCk7XG5cblx0XHRpZiAoZW5kQW5zaUNvZGUgIT09IHVuZGVmaW5lZCkge1xuXHRcdFx0Y29uc3QgZmlzdEVzY2FwZUNvZGUgPSB3cmFwQW5zaShhbnNpU3R5bGVzLmNvZGVzLmdldChOdW1iZXIucGFyc2VJbnQoZW5kQW5zaUNvZGUsIDEwKSkpO1xuXHRcdFx0Ly8gVE9ETzogUmVtb3ZlIHRoZSB1c2Ugb2YgYC5yZWR1Y2VgIGhlcmUuXG5cdFx0XHQvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgdW5pY29ybi9uby1hcnJheS1yZWR1Y2Vcblx0XHRcdG91dHB1dCA9IG91dHB1dC5yZWR1Y2UoKGN1cnJlbnQsIG5leHQpID0+IG5leHQgPT09IGZpc3RFc2NhcGVDb2RlID8gW25leHQsIC4uLmN1cnJlbnRdIDogWy4uLmN1cnJlbnQsIG5leHRdLCBbXSk7XG5cdFx0fVxuXHR9XG5cblx0cmV0dXJuIG91dHB1dC5qb2luKCcnKTtcbn07XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIHNsaWNlQW5zaShzdHJpbmcsIGJlZ2luLCBlbmQpIHtcblx0Y29uc3QgY2hhcmFjdGVycyA9IFsuLi5zdHJpbmddO1xuXHRjb25zdCBhbnNpQ29kZXMgPSBbXTtcblxuXHRsZXQgc3RyaW5nRW5kID0gdHlwZW9mIGVuZCA9PT0gJ251bWJlcicgPyBlbmQgOiBjaGFyYWN0ZXJzLmxlbmd0aDtcblx0bGV0IGlzSW5zaWRlRXNjYXBlID0gZmFsc2U7XG5cdGxldCBhbnNpQ29kZTtcblx0bGV0IHZpc2libGUgPSAwO1xuXHRsZXQgb3V0cHV0ID0gJyc7XG5cblx0Zm9yIChjb25zdCBbaW5kZXgsIGNoYXJhY3Rlcl0gb2YgY2hhcmFjdGVycy5lbnRyaWVzKCkpIHtcblx0XHRsZXQgbGVmdEVzY2FwZSA9IGZhbHNlO1xuXG5cdFx0aWYgKEVTQ0FQRVMuaW5jbHVkZXMoY2hhcmFjdGVyKSkge1xuXHRcdFx0Y29uc3QgY29kZSA9IC9cXGRbXm1dKi8uZXhlYyhzdHJpbmcuc2xpY2UoaW5kZXgsIGluZGV4ICsgMTgpKTtcblx0XHRcdGFuc2lDb2RlID0gY29kZSAmJiBjb2RlLmxlbmd0aCA+IDAgPyBjb2RlWzBdIDogdW5kZWZpbmVkO1xuXG5cdFx0XHRpZiAodmlzaWJsZSA8IHN0cmluZ0VuZCkge1xuXHRcdFx0XHRpc0luc2lkZUVzY2FwZSA9IHRydWU7XG5cblx0XHRcdFx0aWYgKGFuc2lDb2RlICE9PSB1bmRlZmluZWQpIHtcblx0XHRcdFx0XHRhbnNpQ29kZXMucHVzaChhbnNpQ29kZSk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9IGVsc2UgaWYgKGlzSW5zaWRlRXNjYXBlICYmIGNoYXJhY3RlciA9PT0gJ20nKSB7XG5cdFx0XHRpc0luc2lkZUVzY2FwZSA9IGZhbHNlO1xuXHRcdFx0bGVmdEVzY2FwZSA9IHRydWU7XG5cdFx0fVxuXG5cdFx0aWYgKCFpc0luc2lkZUVzY2FwZSAmJiAhbGVmdEVzY2FwZSkge1xuXHRcdFx0dmlzaWJsZSsrO1xuXHRcdH1cblxuXHRcdGlmICghYXN0cmFsUmVnZXgudGVzdChjaGFyYWN0ZXIpICYmIGlzRnVsbHdpZHRoQ29kZVBvaW50KGNoYXJhY3Rlci5jb2RlUG9pbnRBdCgpKSkge1xuXHRcdFx0dmlzaWJsZSsrO1xuXG5cdFx0XHRpZiAodHlwZW9mIGVuZCAhPT0gJ251bWJlcicpIHtcblx0XHRcdFx0c3RyaW5nRW5kKys7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0aWYgKHZpc2libGUgPiBiZWdpbiAmJiB2aXNpYmxlIDw9IHN0cmluZ0VuZCkge1xuXHRcdFx0b3V0cHV0ICs9IGNoYXJhY3Rlcjtcblx0XHR9IGVsc2UgaWYgKHZpc2libGUgPT09IGJlZ2luICYmICFpc0luc2lkZUVzY2FwZSAmJiBhbnNpQ29kZSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRvdXRwdXQgPSBjaGVja0Fuc2koYW5zaUNvZGVzKTtcblx0XHR9IGVsc2UgaWYgKHZpc2libGUgPj0gc3RyaW5nRW5kKSB7XG5cdFx0XHRvdXRwdXQgKz0gY2hlY2tBbnNpKGFuc2lDb2RlcywgdHJ1ZSwgYW5zaUNvZGUpO1xuXHRcdFx0YnJlYWs7XG5cdFx0fVxuXHR9XG5cblx0cmV0dXJuIG91dHB1dDtcbn1cbiIsImV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGFuc2lSZWdleCh7b25seUZpcnN0ID0gZmFsc2V9ID0ge30pIHtcblx0Y29uc3QgcGF0dGVybiA9IFtcblx0ICAgICdbXFxcXHUwMDFCXFxcXHUwMDlCXVtbXFxcXF0oKSM7P10qKD86KD86KD86KD86O1stYS16QS1aXFxcXGRcXFxcLyMmLjo9PyVAfl9dKykqfFthLXpBLVpcXFxcZF0rKD86O1stYS16QS1aXFxcXGRcXFxcLyMmLjo9PyVAfl9dKikqKT9cXFxcdTAwMDcpJyxcblx0XHQnKD86KD86XFxcXGR7MSw0fSg/OjtcXFxcZHswLDR9KSopP1tcXFxcZEEtUFItVFpjZi1udHFyeT0+PH5dKSknXG5cdF0uam9pbignfCcpO1xuXG5cdHJldHVybiBuZXcgUmVnRXhwKHBhdHRlcm4sIG9ubHlGaXJzdCA/IHVuZGVmaW5lZCA6ICdnJyk7XG59XG4iLCJpbXBvcnQgYW5zaVJlZ2V4IGZyb20gJ2Fuc2ktcmVnZXgnO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBzdHJpcEFuc2koc3RyaW5nKSB7XG5cdGlmICh0eXBlb2Ygc3RyaW5nICE9PSAnc3RyaW5nJykge1xuXHRcdHRocm93IG5ldyBUeXBlRXJyb3IoYEV4cGVjdGVkIGEgXFxgc3RyaW5nXFxgLCBnb3QgXFxgJHt0eXBlb2Ygc3RyaW5nfVxcYGApO1xuXHR9XG5cblx0cmV0dXJuIHN0cmluZy5yZXBsYWNlKGFuc2lSZWdleCgpLCAnJyk7XG59XG4iLCJcInVzZSBzdHJpY3RcIjtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoKSB7XG4gIC8vIGh0dHBzOi8vbXRocy5iZS9lbW9qaVxuICByZXR1cm4gL1xcdUQ4M0NcXHVERkY0XFx1REI0MFxcdURDNjdcXHVEQjQwXFx1REM2Mig/OlxcdURCNDBcXHVEQzc3XFx1REI0MFxcdURDNkNcXHVEQjQwXFx1REM3M3xcXHVEQjQwXFx1REM3M1xcdURCNDBcXHVEQzYzXFx1REI0MFxcdURDNzR8XFx1REI0MFxcdURDNjVcXHVEQjQwXFx1REM2RVxcdURCNDBcXHVEQzY3KVxcdURCNDBcXHVEQzdGfCg/OlxcdUQ4M0VcXHVEREQxXFx1RDgzQ1xcdURGRkZcXHUyMDBEXFx1Mjc2NFxcdUZFMEZcXHUyMDBEKD86XFx1RDgzRFxcdURDOEJcXHUyMDBEKT9cXHVEODNFXFx1REREMXxcXHVEODNEXFx1REM2OVxcdUQ4M0NcXHVERkZGXFx1MjAwRFxcdUQ4M0VcXHVERDFEXFx1MjAwRCg/OlxcdUQ4M0RbXFx1REM2OFxcdURDNjldKSkoPzpcXHVEODNDW1xcdURGRkItXFx1REZGRV0pfCg/OlxcdUQ4M0VcXHVEREQxXFx1RDgzQ1xcdURGRkVcXHUyMDBEXFx1Mjc2NFxcdUZFMEZcXHUyMDBEKD86XFx1RDgzRFxcdURDOEJcXHUyMDBEKT9cXHVEODNFXFx1REREMXxcXHVEODNEXFx1REM2OVxcdUQ4M0NcXHVERkZFXFx1MjAwRFxcdUQ4M0VcXHVERDFEXFx1MjAwRCg/OlxcdUQ4M0RbXFx1REM2OFxcdURDNjldKSkoPzpcXHVEODNDW1xcdURGRkItXFx1REZGRFxcdURGRkZdKXwoPzpcXHVEODNFXFx1REREMVxcdUQ4M0NcXHVERkZEXFx1MjAwRFxcdTI3NjRcXHVGRTBGXFx1MjAwRCg/OlxcdUQ4M0RcXHVEQzhCXFx1MjAwRCk/XFx1RDgzRVxcdURERDF8XFx1RDgzRFxcdURDNjlcXHVEODNDXFx1REZGRFxcdTIwMERcXHVEODNFXFx1REQxRFxcdTIwMEQoPzpcXHVEODNEW1xcdURDNjhcXHVEQzY5XSkpKD86XFx1RDgzQ1tcXHVERkZCXFx1REZGQ1xcdURGRkVcXHVERkZGXSl8KD86XFx1RDgzRVxcdURERDFcXHVEODNDXFx1REZGQ1xcdTIwMERcXHUyNzY0XFx1RkUwRlxcdTIwMEQoPzpcXHVEODNEXFx1REM4QlxcdTIwMEQpP1xcdUQ4M0VcXHVEREQxfFxcdUQ4M0RcXHVEQzY5XFx1RDgzQ1xcdURGRkNcXHUyMDBEXFx1RDgzRVxcdUREMURcXHUyMDBEKD86XFx1RDgzRFtcXHVEQzY4XFx1REM2OV0pKSg/OlxcdUQ4M0NbXFx1REZGQlxcdURGRkQtXFx1REZGRl0pfCg/OlxcdUQ4M0VcXHVEREQxXFx1RDgzQ1xcdURGRkJcXHUyMDBEXFx1Mjc2NFxcdUZFMEZcXHUyMDBEKD86XFx1RDgzRFxcdURDOEJcXHUyMDBEKT9cXHVEODNFXFx1REREMXxcXHVEODNEXFx1REM2OVxcdUQ4M0NcXHVERkZCXFx1MjAwRFxcdUQ4M0VcXHVERDFEXFx1MjAwRCg/OlxcdUQ4M0RbXFx1REM2OFxcdURDNjldKSkoPzpcXHVEODNDW1xcdURGRkMtXFx1REZGRl0pfFxcdUQ4M0RcXHVEQzY4KD86XFx1RDgzQ1xcdURGRkIoPzpcXHUyMDBEKD86XFx1Mjc2NFxcdUZFMEZcXHUyMDBEKD86XFx1RDgzRFxcdURDOEJcXHUyMDBEXFx1RDgzRFxcdURDNjgoPzpcXHVEODNDW1xcdURGRkItXFx1REZGRl0pfFxcdUQ4M0RcXHVEQzY4KD86XFx1RDgzQ1tcXHVERkZCLVxcdURGRkZdKSl8XFx1RDgzRVxcdUREMURcXHUyMDBEXFx1RDgzRFxcdURDNjgoPzpcXHVEODNDW1xcdURGRkMtXFx1REZGRl0pfFtcXHUyNjk1XFx1MjY5NlxcdTI3MDhdXFx1RkUwRnxcXHVEODNDW1xcdURGM0VcXHVERjczXFx1REY3Q1xcdURGOTNcXHVERkE0XFx1REZBOFxcdURGRUJcXHVERkVEXXxcXHVEODNEW1xcdURDQkJcXHVEQ0JDXFx1REQyN1xcdUREMkNcXHVERTgwXFx1REU5Ml18XFx1RDgzRVtcXHVEREFGLVxcdUREQjNcXHVEREJDXFx1RERCRF0pKT98KD86XFx1RDgzQ1tcXHVERkZDLVxcdURGRkZdKVxcdTIwMERcXHUyNzY0XFx1RkUwRlxcdTIwMEQoPzpcXHVEODNEXFx1REM4QlxcdTIwMERcXHVEODNEXFx1REM2OCg/OlxcdUQ4M0NbXFx1REZGQi1cXHVERkZGXSl8XFx1RDgzRFxcdURDNjgoPzpcXHVEODNDW1xcdURGRkItXFx1REZGRl0pKXxcXHUyMDBEKD86XFx1Mjc2NFxcdUZFMEZcXHUyMDBEKD86XFx1RDgzRFxcdURDOEJcXHUyMDBEKT9cXHVEODNEXFx1REM2OHwoPzpcXHVEODNEW1xcdURDNjhcXHVEQzY5XSlcXHUyMDBEKD86XFx1RDgzRFxcdURDNjZcXHUyMDBEXFx1RDgzRFxcdURDNjZ8XFx1RDgzRFxcdURDNjdcXHUyMDBEKD86XFx1RDgzRFtcXHVEQzY2XFx1REM2N10pKXxcXHVEODNEXFx1REM2NlxcdTIwMERcXHVEODNEXFx1REM2NnxcXHVEODNEXFx1REM2N1xcdTIwMEQoPzpcXHVEODNEW1xcdURDNjZcXHVEQzY3XSl8XFx1RDgzQ1tcXHVERjNFXFx1REY3M1xcdURGN0NcXHVERjkzXFx1REZBNFxcdURGQThcXHVERkVCXFx1REZFRF18XFx1RDgzRFtcXHVEQ0JCXFx1RENCQ1xcdUREMjdcXHVERDJDXFx1REU4MFxcdURFOTJdfFxcdUQ4M0VbXFx1RERBRi1cXHVEREIzXFx1RERCQ1xcdUREQkRdKXxcXHVEODNDXFx1REZGRlxcdTIwMEQoPzpcXHVEODNFXFx1REQxRFxcdTIwMERcXHVEODNEXFx1REM2OCg/OlxcdUQ4M0NbXFx1REZGQi1cXHVERkZFXSl8XFx1RDgzQ1tcXHVERjNFXFx1REY3M1xcdURGN0NcXHVERjkzXFx1REZBNFxcdURGQThcXHVERkVCXFx1REZFRF18XFx1RDgzRFtcXHVEQ0JCXFx1RENCQ1xcdUREMjdcXHVERDJDXFx1REU4MFxcdURFOTJdfFxcdUQ4M0VbXFx1RERBRi1cXHVEREIzXFx1RERCQ1xcdUREQkRdKXxcXHVEODNDXFx1REZGRVxcdTIwMEQoPzpcXHVEODNFXFx1REQxRFxcdTIwMERcXHVEODNEXFx1REM2OCg/OlxcdUQ4M0NbXFx1REZGQi1cXHVERkZEXFx1REZGRl0pfFxcdUQ4M0NbXFx1REYzRVxcdURGNzNcXHVERjdDXFx1REY5M1xcdURGQTRcXHVERkE4XFx1REZFQlxcdURGRURdfFxcdUQ4M0RbXFx1RENCQlxcdURDQkNcXHVERDI3XFx1REQyQ1xcdURFODBcXHVERTkyXXxcXHVEODNFW1xcdUREQUYtXFx1RERCM1xcdUREQkNcXHVEREJEXSl8XFx1RDgzQ1xcdURGRkRcXHUyMDBEKD86XFx1RDgzRVxcdUREMURcXHUyMDBEXFx1RDgzRFxcdURDNjgoPzpcXHVEODNDW1xcdURGRkJcXHVERkZDXFx1REZGRVxcdURGRkZdKXxcXHVEODNDW1xcdURGM0VcXHVERjczXFx1REY3Q1xcdURGOTNcXHVERkE0XFx1REZBOFxcdURGRUJcXHVERkVEXXxcXHVEODNEW1xcdURDQkJcXHVEQ0JDXFx1REQyN1xcdUREMkNcXHVERTgwXFx1REU5Ml18XFx1RDgzRVtcXHVEREFGLVxcdUREQjNcXHVEREJDXFx1RERCRF0pfFxcdUQ4M0NcXHVERkZDXFx1MjAwRCg/OlxcdUQ4M0VcXHVERDFEXFx1MjAwRFxcdUQ4M0RcXHVEQzY4KD86XFx1RDgzQ1tcXHVERkZCXFx1REZGRC1cXHVERkZGXSl8XFx1RDgzQ1tcXHVERjNFXFx1REY3M1xcdURGN0NcXHVERjkzXFx1REZBNFxcdURGQThcXHVERkVCXFx1REZFRF18XFx1RDgzRFtcXHVEQ0JCXFx1RENCQ1xcdUREMjdcXHVERDJDXFx1REU4MFxcdURFOTJdfFxcdUQ4M0VbXFx1RERBRi1cXHVEREIzXFx1RERCQ1xcdUREQkRdKXwoPzpcXHVEODNDXFx1REZGRlxcdTIwMERbXFx1MjY5NVxcdTI2OTZcXHUyNzA4XXxcXHVEODNDXFx1REZGRVxcdTIwMERbXFx1MjY5NVxcdTI2OTZcXHUyNzA4XXxcXHVEODNDXFx1REZGRFxcdTIwMERbXFx1MjY5NVxcdTI2OTZcXHUyNzA4XXxcXHVEODNDXFx1REZGQ1xcdTIwMERbXFx1MjY5NVxcdTI2OTZcXHUyNzA4XXxcXHUyMDBEW1xcdTI2OTVcXHUyNjk2XFx1MjcwOF0pXFx1RkUwRnxcXHUyMDBEKD86KD86XFx1RDgzRFtcXHVEQzY4XFx1REM2OV0pXFx1MjAwRCg/OlxcdUQ4M0RbXFx1REM2NlxcdURDNjddKXxcXHVEODNEW1xcdURDNjZcXHVEQzY3XSl8XFx1RDgzQ1xcdURGRkZ8XFx1RDgzQ1xcdURGRkV8XFx1RDgzQ1xcdURGRkR8XFx1RDgzQ1xcdURGRkMpP3woPzpcXHVEODNEXFx1REM2OSg/OlxcdUQ4M0NcXHVERkZCXFx1MjAwRFxcdTI3NjRcXHVGRTBGXFx1MjAwRCg/OlxcdUQ4M0RcXHVEQzhCXFx1MjAwRCg/OlxcdUQ4M0RbXFx1REM2OFxcdURDNjldKXxcXHVEODNEW1xcdURDNjhcXHVEQzY5XSl8KD86XFx1RDgzQ1tcXHVERkZDLVxcdURGRkZdKVxcdTIwMERcXHUyNzY0XFx1RkUwRlxcdTIwMEQoPzpcXHVEODNEXFx1REM4QlxcdTIwMEQoPzpcXHVEODNEW1xcdURDNjhcXHVEQzY5XSl8XFx1RDgzRFtcXHVEQzY4XFx1REM2OV0pKXxcXHVEODNFXFx1REREMSg/OlxcdUQ4M0NbXFx1REZGQi1cXHVERkZGXSlcXHUyMDBEXFx1RDgzRVxcdUREMURcXHUyMDBEXFx1RDgzRVxcdURERDEpKD86XFx1RDgzQ1tcXHVERkZCLVxcdURGRkZdKXxcXHVEODNEXFx1REM2OVxcdTIwMERcXHVEODNEXFx1REM2OVxcdTIwMEQoPzpcXHVEODNEXFx1REM2NlxcdTIwMERcXHVEODNEXFx1REM2NnxcXHVEODNEXFx1REM2N1xcdTIwMEQoPzpcXHVEODNEW1xcdURDNjZcXHVEQzY3XSkpfFxcdUQ4M0RcXHVEQzY5KD86XFx1MjAwRCg/OlxcdTI3NjRcXHVGRTBGXFx1MjAwRCg/OlxcdUQ4M0RcXHVEQzhCXFx1MjAwRCg/OlxcdUQ4M0RbXFx1REM2OFxcdURDNjldKXxcXHVEODNEW1xcdURDNjhcXHVEQzY5XSl8XFx1RDgzQ1tcXHVERjNFXFx1REY3M1xcdURGN0NcXHVERjkzXFx1REZBNFxcdURGQThcXHVERkVCXFx1REZFRF18XFx1RDgzRFtcXHVEQ0JCXFx1RENCQ1xcdUREMjdcXHVERDJDXFx1REU4MFxcdURFOTJdfFxcdUQ4M0VbXFx1RERBRi1cXHVEREIzXFx1RERCQ1xcdUREQkRdKXxcXHVEODNDXFx1REZGRlxcdTIwMEQoPzpcXHVEODNDW1xcdURGM0VcXHVERjczXFx1REY3Q1xcdURGOTNcXHVERkE0XFx1REZBOFxcdURGRUJcXHVERkVEXXxcXHVEODNEW1xcdURDQkJcXHVEQ0JDXFx1REQyN1xcdUREMkNcXHVERTgwXFx1REU5Ml18XFx1RDgzRVtcXHVEREFGLVxcdUREQjNcXHVEREJDXFx1RERCRF0pfFxcdUQ4M0NcXHVERkZFXFx1MjAwRCg/OlxcdUQ4M0NbXFx1REYzRVxcdURGNzNcXHVERjdDXFx1REY5M1xcdURGQTRcXHVERkE4XFx1REZFQlxcdURGRURdfFxcdUQ4M0RbXFx1RENCQlxcdURDQkNcXHVERDI3XFx1REQyQ1xcdURFODBcXHVERTkyXXxcXHVEODNFW1xcdUREQUYtXFx1RERCM1xcdUREQkNcXHVEREJEXSl8XFx1RDgzQ1xcdURGRkRcXHUyMDBEKD86XFx1RDgzQ1tcXHVERjNFXFx1REY3M1xcdURGN0NcXHVERjkzXFx1REZBNFxcdURGQThcXHVERkVCXFx1REZFRF18XFx1RDgzRFtcXHVEQ0JCXFx1RENCQ1xcdUREMjdcXHVERDJDXFx1REU4MFxcdURFOTJdfFxcdUQ4M0VbXFx1RERBRi1cXHVEREIzXFx1RERCQ1xcdUREQkRdKXxcXHVEODNDXFx1REZGQ1xcdTIwMEQoPzpcXHVEODNDW1xcdURGM0VcXHVERjczXFx1REY3Q1xcdURGOTNcXHVERkE0XFx1REZBOFxcdURGRUJcXHVERkVEXXxcXHVEODNEW1xcdURDQkJcXHVEQ0JDXFx1REQyN1xcdUREMkNcXHVERTgwXFx1REU5Ml18XFx1RDgzRVtcXHVEREFGLVxcdUREQjNcXHVEREJDXFx1RERCRF0pfFxcdUQ4M0NcXHVERkZCXFx1MjAwRCg/OlxcdUQ4M0NbXFx1REYzRVxcdURGNzNcXHVERjdDXFx1REY5M1xcdURGQTRcXHVERkE4XFx1REZFQlxcdURGRURdfFxcdUQ4M0RbXFx1RENCQlxcdURDQkNcXHVERDI3XFx1REQyQ1xcdURFODBcXHVERTkyXXxcXHVEODNFW1xcdUREQUYtXFx1RERCM1xcdUREQkNcXHVEREJEXSkpfFxcdUQ4M0VcXHVEREQxKD86XFx1MjAwRCg/OlxcdUQ4M0VcXHVERDFEXFx1MjAwRFxcdUQ4M0VcXHVEREQxfFxcdUQ4M0NbXFx1REYzRVxcdURGNzNcXHVERjdDXFx1REY4NFxcdURGOTNcXHVERkE0XFx1REZBOFxcdURGRUJcXHVERkVEXXxcXHVEODNEW1xcdURDQkJcXHVEQ0JDXFx1REQyN1xcdUREMkNcXHVERTgwXFx1REU5Ml18XFx1RDgzRVtcXHVEREFGLVxcdUREQjNcXHVEREJDXFx1RERCRF0pfFxcdUQ4M0NcXHVERkZGXFx1MjAwRCg/OlxcdUQ4M0NbXFx1REYzRVxcdURGNzNcXHVERjdDXFx1REY4NFxcdURGOTNcXHVERkE0XFx1REZBOFxcdURGRUJcXHVERkVEXXxcXHVEODNEW1xcdURDQkJcXHVEQ0JDXFx1REQyN1xcdUREMkNcXHVERTgwXFx1REU5Ml18XFx1RDgzRVtcXHVEREFGLVxcdUREQjNcXHVEREJDXFx1RERCRF0pfFxcdUQ4M0NcXHVERkZFXFx1MjAwRCg/OlxcdUQ4M0NbXFx1REYzRVxcdURGNzNcXHVERjdDXFx1REY4NFxcdURGOTNcXHVERkE0XFx1REZBOFxcdURGRUJcXHVERkVEXXxcXHVEODNEW1xcdURDQkJcXHVEQ0JDXFx1REQyN1xcdUREMkNcXHVERTgwXFx1REU5Ml18XFx1RDgzRVtcXHVEREFGLVxcdUREQjNcXHVEREJDXFx1RERCRF0pfFxcdUQ4M0NcXHVERkZEXFx1MjAwRCg/OlxcdUQ4M0NbXFx1REYzRVxcdURGNzNcXHVERjdDXFx1REY4NFxcdURGOTNcXHVERkE0XFx1REZBOFxcdURGRUJcXHVERkVEXXxcXHVEODNEW1xcdURDQkJcXHVEQ0JDXFx1REQyN1xcdUREMkNcXHVERTgwXFx1REU5Ml18XFx1RDgzRVtcXHVEREFGLVxcdUREQjNcXHVEREJDXFx1RERCRF0pfFxcdUQ4M0NcXHVERkZDXFx1MjAwRCg/OlxcdUQ4M0NbXFx1REYzRVxcdURGNzNcXHVERjdDXFx1REY4NFxcdURGOTNcXHVERkE0XFx1REZBOFxcdURGRUJcXHVERkVEXXxcXHVEODNEW1xcdURDQkJcXHVEQ0JDXFx1REQyN1xcdUREMkNcXHVERTgwXFx1REU5Ml18XFx1RDgzRVtcXHVEREFGLVxcdUREQjNcXHVEREJDXFx1RERCRF0pfFxcdUQ4M0NcXHVERkZCXFx1MjAwRCg/OlxcdUQ4M0NbXFx1REYzRVxcdURGNzNcXHVERjdDXFx1REY4NFxcdURGOTNcXHVERkE0XFx1REZBOFxcdURGRUJcXHVERkVEXXxcXHVEODNEW1xcdURDQkJcXHVEQ0JDXFx1REQyN1xcdUREMkNcXHVERTgwXFx1REU5Ml18XFx1RDgzRVtcXHVEREFGLVxcdUREQjNcXHVEREJDXFx1RERCRF0pKXxcXHVEODNEXFx1REM2OVxcdTIwMERcXHVEODNEXFx1REM2NlxcdTIwMERcXHVEODNEXFx1REM2NnxcXHVEODNEXFx1REM2OVxcdTIwMERcXHVEODNEXFx1REM2OVxcdTIwMEQoPzpcXHVEODNEW1xcdURDNjZcXHVEQzY3XSl8XFx1RDgzRFxcdURDNjlcXHUyMDBEXFx1RDgzRFxcdURDNjdcXHUyMDBEKD86XFx1RDgzRFtcXHVEQzY2XFx1REM2N10pfCg/OlxcdUQ4M0RcXHVEQzQxXFx1RkUwRlxcdTIwMERcXHVEODNEXFx1RERFOHxcXHVEODNFXFx1REREMSg/OlxcdUQ4M0NcXHVERkZGXFx1MjAwRFtcXHUyNjk1XFx1MjY5NlxcdTI3MDhdfFxcdUQ4M0NcXHVERkZFXFx1MjAwRFtcXHUyNjk1XFx1MjY5NlxcdTI3MDhdfFxcdUQ4M0NcXHVERkZEXFx1MjAwRFtcXHUyNjk1XFx1MjY5NlxcdTI3MDhdfFxcdUQ4M0NcXHVERkZDXFx1MjAwRFtcXHUyNjk1XFx1MjY5NlxcdTI3MDhdfFxcdUQ4M0NcXHVERkZCXFx1MjAwRFtcXHUyNjk1XFx1MjY5NlxcdTI3MDhdfFxcdTIwMERbXFx1MjY5NVxcdTI2OTZcXHUyNzA4XSl8XFx1RDgzRFxcdURDNjkoPzpcXHVEODNDXFx1REZGRlxcdTIwMERbXFx1MjY5NVxcdTI2OTZcXHUyNzA4XXxcXHVEODNDXFx1REZGRVxcdTIwMERbXFx1MjY5NVxcdTI2OTZcXHUyNzA4XXxcXHVEODNDXFx1REZGRFxcdTIwMERbXFx1MjY5NVxcdTI2OTZcXHUyNzA4XXxcXHVEODNDXFx1REZGQ1xcdTIwMERbXFx1MjY5NVxcdTI2OTZcXHUyNzA4XXxcXHVEODNDXFx1REZGQlxcdTIwMERbXFx1MjY5NVxcdTI2OTZcXHUyNzA4XXxcXHUyMDBEW1xcdTI2OTVcXHUyNjk2XFx1MjcwOF0pfFxcdUQ4M0RcXHVERTM2XFx1MjAwRFxcdUQ4M0NcXHVERjJCfFxcdUQ4M0NcXHVERkYzXFx1RkUwRlxcdTIwMERcXHUyNkE3fFxcdUQ4M0RcXHVEQzNCXFx1MjAwRFxcdTI3NDR8KD86KD86XFx1RDgzQ1tcXHVERkMzXFx1REZDNFxcdURGQ0FdfFxcdUQ4M0RbXFx1REM2RVxcdURDNzBcXHVEQzcxXFx1REM3M1xcdURDNzdcXHVEQzgxXFx1REM4MlxcdURDODZcXHVEQzg3XFx1REU0NS1cXHVERTQ3XFx1REU0QlxcdURFNERcXHVERTRFXFx1REVBM1xcdURFQjQtXFx1REVCNl18XFx1RDgzRVtcXHVERDI2XFx1REQzNVxcdUREMzctXFx1REQzOVxcdUREM0RcXHVERDNFXFx1RERCOFxcdUREQjlcXHVERENELVxcdUREQ0ZcXHVEREQ0XFx1RERENi1cXHVEREREXSkoPzpcXHVEODNDW1xcdURGRkItXFx1REZGRl0pfFxcdUQ4M0RcXHVEQzZGfFxcdUQ4M0VbXFx1REQzQ1xcdUREREVcXHVERERGXSlcXHUyMDBEW1xcdTI2NDBcXHUyNjQyXXwoPzpcXHUyNkY5fFxcdUQ4M0NbXFx1REZDQlxcdURGQ0NdfFxcdUQ4M0RcXHVERDc1KSg/OlxcdUZFMEZ8XFx1RDgzQ1tcXHVERkZCLVxcdURGRkZdKVxcdTIwMERbXFx1MjY0MFxcdTI2NDJdfFxcdUQ4M0NcXHVERkY0XFx1MjAwRFxcdTI2MjB8KD86XFx1RDgzQ1tcXHVERkMzXFx1REZDNFxcdURGQ0FdfFxcdUQ4M0RbXFx1REM2RVxcdURDNzBcXHVEQzcxXFx1REM3M1xcdURDNzdcXHVEQzgxXFx1REM4MlxcdURDODZcXHVEQzg3XFx1REU0NS1cXHVERTQ3XFx1REU0QlxcdURFNERcXHVERTRFXFx1REVBM1xcdURFQjQtXFx1REVCNl18XFx1RDgzRVtcXHVERDI2XFx1REQzNVxcdUREMzctXFx1REQzOVxcdUREM0RcXHVERDNFXFx1RERCOFxcdUREQjlcXHVERENELVxcdUREQ0ZcXHVEREQ0XFx1RERENi1cXHVEREREXSlcXHUyMDBEW1xcdTI2NDBcXHUyNjQyXXxbXFx4QTlcXHhBRVxcdTIwM0NcXHUyMDQ5XFx1MjEyMlxcdTIxMzlcXHUyMTk0LVxcdTIxOTlcXHUyMUE5XFx1MjFBQVxcdTIzMjhcXHUyM0NGXFx1MjNFRC1cXHUyM0VGXFx1MjNGMVxcdTIzRjJcXHUyM0Y4LVxcdTIzRkFcXHUyNEMyXFx1MjVBQVxcdTI1QUJcXHUyNUI2XFx1MjVDMFxcdTI1RkJcXHUyNUZDXFx1MjYwMC1cXHUyNjA0XFx1MjYwRVxcdTI2MTFcXHUyNjE4XFx1MjYyMFxcdTI2MjJcXHUyNjIzXFx1MjYyNlxcdTI2MkFcXHUyNjJFXFx1MjYyRlxcdTI2MzgtXFx1MjYzQVxcdTI2NDBcXHUyNjQyXFx1MjY1RlxcdTI2NjBcXHUyNjYzXFx1MjY2NVxcdTI2NjZcXHUyNjY4XFx1MjY3QlxcdTI2N0VcXHUyNjkyXFx1MjY5NC1cXHUyNjk3XFx1MjY5OVxcdTI2OUJcXHUyNjlDXFx1MjZBMFxcdTI2QTdcXHUyNkIwXFx1MjZCMVxcdTI2QzhcXHUyNkNGXFx1MjZEMVxcdTI2RDNcXHUyNkU5XFx1MjZGMFxcdTI2RjFcXHUyNkY0XFx1MjZGN1xcdTI2RjhcXHUyNzAyXFx1MjcwOFxcdTI3MDlcXHUyNzBGXFx1MjcxMlxcdTI3MTRcXHUyNzE2XFx1MjcxRFxcdTI3MjFcXHUyNzMzXFx1MjczNFxcdTI3NDRcXHUyNzQ3XFx1Mjc2M1xcdTI3QTFcXHUyOTM0XFx1MjkzNVxcdTJCMDUtXFx1MkIwN1xcdTMwMzBcXHUzMDNEXFx1MzI5N1xcdTMyOTldfFxcdUQ4M0NbXFx1REQ3MFxcdURENzFcXHVERDdFXFx1REQ3RlxcdURFMDJcXHVERTM3XFx1REYyMVxcdURGMjQtXFx1REYyQ1xcdURGMzZcXHVERjdEXFx1REY5NlxcdURGOTdcXHVERjk5LVxcdURGOUJcXHVERjlFXFx1REY5RlxcdURGQ0RcXHVERkNFXFx1REZENC1cXHVERkRGXFx1REZGNVxcdURGRjddfFxcdUQ4M0RbXFx1REMzRlxcdURDRkRcXHVERDQ5XFx1REQ0QVxcdURENkZcXHVERDcwXFx1REQ3M1xcdURENzYtXFx1REQ3OVxcdUREODdcXHVERDhBLVxcdUREOERcXHVEREE1XFx1RERBOFxcdUREQjFcXHVEREIyXFx1RERCQ1xcdUREQzItXFx1RERDNFxcdURERDEtXFx1REREM1xcdUREREMtXFx1RERERVxcdURERTFcXHVEREUzXFx1RERFOFxcdURERUZcXHVEREYzXFx1RERGQVxcdURFQ0JcXHVERUNELVxcdURFQ0ZcXHVERUUwLVxcdURFRTVcXHVERUU5XFx1REVGMFxcdURFRjNdKVxcdUZFMEZ8XFx1RDgzQ1xcdURGRjNcXHVGRTBGXFx1MjAwRFxcdUQ4M0NcXHVERjA4fFxcdUQ4M0RcXHVEQzY5XFx1MjAwRFxcdUQ4M0RcXHVEQzY3fFxcdUQ4M0RcXHVEQzY5XFx1MjAwRFxcdUQ4M0RcXHVEQzY2fFxcdUQ4M0RcXHVERTM1XFx1MjAwRFxcdUQ4M0RcXHVEQ0FCfFxcdUQ4M0RcXHVERTJFXFx1MjAwRFxcdUQ4M0RcXHVEQ0E4fFxcdUQ4M0RcXHVEQzE1XFx1MjAwRFxcdUQ4M0VcXHVEREJBfFxcdUQ4M0VcXHVEREQxKD86XFx1RDgzQ1xcdURGRkZ8XFx1RDgzQ1xcdURGRkV8XFx1RDgzQ1xcdURGRkR8XFx1RDgzQ1xcdURGRkN8XFx1RDgzQ1xcdURGRkIpP3xcXHVEODNEXFx1REM2OSg/OlxcdUQ4M0NcXHVERkZGfFxcdUQ4M0NcXHVERkZFfFxcdUQ4M0NcXHVERkZEfFxcdUQ4M0NcXHVERkZDfFxcdUQ4M0NcXHVERkZCKT98XFx1RDgzQ1xcdURERkRcXHVEODNDXFx1RERGMHxcXHVEODNDXFx1RERGNlxcdUQ4M0NcXHVEREU2fFxcdUQ4M0NcXHVEREY0XFx1RDgzQ1xcdURERjJ8XFx1RDgzRFxcdURDMDhcXHUyMDBEXFx1MkIxQnxcXHUyNzY0XFx1RkUwRlxcdTIwMEQoPzpcXHVEODNEXFx1REQyNXxcXHVEODNFXFx1REU3OSl8XFx1RDgzRFxcdURDNDFcXHVGRTBGfFxcdUQ4M0NcXHVERkYzXFx1RkUwRnxcXHVEODNDXFx1RERGRig/OlxcdUQ4M0NbXFx1RERFNlxcdURERjJcXHVEREZDXSl8XFx1RDgzQ1xcdURERkUoPzpcXHVEODNDW1xcdURERUFcXHVEREY5XSl8XFx1RDgzQ1xcdURERkMoPzpcXHVEODNDW1xcdURERUJcXHVEREY4XSl8XFx1RDgzQ1xcdURERkIoPzpcXHVEODNDW1xcdURERTZcXHVEREU4XFx1RERFQVxcdURERUNcXHVEREVFXFx1RERGM1xcdURERkFdKXxcXHVEODNDXFx1RERGQSg/OlxcdUQ4M0NbXFx1RERFNlxcdURERUNcXHVEREYyXFx1RERGM1xcdURERjhcXHVEREZFXFx1RERGRl0pfFxcdUQ4M0NcXHVEREY5KD86XFx1RDgzQ1tcXHVEREU2XFx1RERFOFxcdURERTlcXHVEREVCLVxcdURERURcXHVEREVGLVxcdURERjRcXHVEREY3XFx1RERGOVxcdURERkJcXHVEREZDXFx1RERGRl0pfFxcdUQ4M0NcXHVEREY4KD86XFx1RDgzQ1tcXHVEREU2LVxcdURERUFcXHVEREVDLVxcdURERjRcXHVEREY3LVxcdURERjlcXHVEREZCXFx1RERGRC1cXHVEREZGXSl8XFx1RDgzQ1xcdURERjcoPzpcXHVEODNDW1xcdURERUFcXHVEREY0XFx1RERGOFxcdURERkFcXHVEREZDXSl8XFx1RDgzQ1xcdURERjUoPzpcXHVEODNDW1xcdURERTZcXHVEREVBLVxcdURERURcXHVEREYwLVxcdURERjNcXHVEREY3LVxcdURERjlcXHVEREZDXFx1RERGRV0pfFxcdUQ4M0NcXHVEREYzKD86XFx1RDgzQ1tcXHVEREU2XFx1RERFOFxcdURERUEtXFx1RERFQ1xcdURERUVcXHVEREYxXFx1RERGNFxcdURERjVcXHVEREY3XFx1RERGQVxcdURERkZdKXxcXHVEODNDXFx1RERGMig/OlxcdUQ4M0NbXFx1RERFNlxcdURERTgtXFx1RERFRFxcdURERjAtXFx1RERGRl0pfFxcdUQ4M0NcXHVEREYxKD86XFx1RDgzQ1tcXHVEREU2LVxcdURERThcXHVEREVFXFx1RERGMFxcdURERjctXFx1RERGQlxcdURERkVdKXxcXHVEODNDXFx1RERGMCg/OlxcdUQ4M0NbXFx1RERFQVxcdURERUMtXFx1RERFRVxcdURERjJcXHVEREYzXFx1RERGNVxcdURERjdcXHVEREZDXFx1RERGRVxcdURERkZdKXxcXHVEODNDXFx1RERFRig/OlxcdUQ4M0NbXFx1RERFQVxcdURERjJcXHVEREY0XFx1RERGNV0pfFxcdUQ4M0NcXHVEREVFKD86XFx1RDgzQ1tcXHVEREU4LVxcdURERUFcXHVEREYxLVxcdURERjRcXHVEREY2LVxcdURERjldKXxcXHVEODNDXFx1RERFRCg/OlxcdUQ4M0NbXFx1RERGMFxcdURERjJcXHVEREYzXFx1RERGN1xcdURERjlcXHVEREZBXSl8XFx1RDgzQ1xcdURERUMoPzpcXHVEODNDW1xcdURERTZcXHVEREU3XFx1RERFOS1cXHVEREVFXFx1RERGMS1cXHVEREYzXFx1RERGNS1cXHVEREZBXFx1RERGQ1xcdURERkVdKXxcXHVEODNDXFx1RERFQig/OlxcdUQ4M0NbXFx1RERFRS1cXHVEREYwXFx1RERGMlxcdURERjRcXHVEREY3XSl8XFx1RDgzQ1xcdURERUEoPzpcXHVEODNDW1xcdURERTZcXHVEREU4XFx1RERFQVxcdURERUNcXHVEREVEXFx1RERGNy1cXHVEREZBXSl8XFx1RDgzQ1xcdURERTkoPzpcXHVEODNDW1xcdURERUFcXHVEREVDXFx1RERFRlxcdURERjBcXHVEREYyXFx1RERGNFxcdURERkZdKXxcXHVEODNDXFx1RERFOCg/OlxcdUQ4M0NbXFx1RERFNlxcdURERThcXHVEREU5XFx1RERFQi1cXHVEREVFXFx1RERGMC1cXHVEREY1XFx1RERGN1xcdURERkEtXFx1RERGRl0pfFxcdUQ4M0NcXHVEREU3KD86XFx1RDgzQ1tcXHVEREU2XFx1RERFN1xcdURERTktXFx1RERFRlxcdURERjEtXFx1RERGNFxcdURERjYtXFx1RERGOVxcdURERkJcXHVEREZDXFx1RERGRVxcdURERkZdKXxcXHVEODNDXFx1RERFNig/OlxcdUQ4M0NbXFx1RERFOC1cXHVEREVDXFx1RERFRVxcdURERjFcXHVEREYyXFx1RERGNFxcdURERjYtXFx1RERGQVxcdURERkNcXHVEREZEXFx1RERGRl0pfFsjXFwqMC05XVxcdUZFMEZcXHUyMEUzfFxcdTI3NjRcXHVGRTBGfCg/OlxcdUQ4M0NbXFx1REZDM1xcdURGQzRcXHVERkNBXXxcXHVEODNEW1xcdURDNkVcXHVEQzcwXFx1REM3MVxcdURDNzNcXHVEQzc3XFx1REM4MVxcdURDODJcXHVEQzg2XFx1REM4N1xcdURFNDUtXFx1REU0N1xcdURFNEJcXHVERTREXFx1REU0RVxcdURFQTNcXHVERUI0LVxcdURFQjZdfFxcdUQ4M0VbXFx1REQyNlxcdUREMzVcXHVERDM3LVxcdUREMzlcXHVERDNEXFx1REQzRVxcdUREQjhcXHVEREI5XFx1RERDRC1cXHVERENGXFx1RERENFxcdURERDYtXFx1RERERF0pKD86XFx1RDgzQ1tcXHVERkZCLVxcdURGRkZdKXwoPzpcXHUyNkY5fFxcdUQ4M0NbXFx1REZDQlxcdURGQ0NdfFxcdUQ4M0RcXHVERDc1KSg/OlxcdUZFMEZ8XFx1RDgzQ1tcXHVERkZCLVxcdURGRkZdKXxcXHVEODNDXFx1REZGNHwoPzpbXFx1MjcwQVxcdTI3MEJdfFxcdUQ4M0NbXFx1REY4NVxcdURGQzJcXHVERkM3XXxcXHVEODNEW1xcdURDNDJcXHVEQzQzXFx1REM0Ni1cXHVEQzUwXFx1REM2NlxcdURDNjdcXHVEQzZCLVxcdURDNkRcXHVEQzcyXFx1REM3NC1cXHVEQzc2XFx1REM3OFxcdURDN0NcXHVEQzgzXFx1REM4NVxcdURDOEZcXHVEQzkxXFx1RENBQVxcdUREN0FcXHVERDk1XFx1REQ5NlxcdURFNENcXHVERTRGXFx1REVDMFxcdURFQ0NdfFxcdUQ4M0VbXFx1REQwQ1xcdUREMEZcXHVERDE4LVxcdUREMUNcXHVERDFFXFx1REQxRlxcdUREMzAtXFx1REQzNFxcdUREMzZcXHVERDc3XFx1RERCNVxcdUREQjZcXHVEREJCXFx1REREMlxcdURERDNcXHVEREQ1XSkoPzpcXHVEODNDW1xcdURGRkItXFx1REZGRl0pfCg/OltcXHUyNjFEXFx1MjcwQ1xcdTI3MERdfFxcdUQ4M0RbXFx1REQ3NFxcdUREOTBdKSg/OlxcdUZFMEZ8XFx1RDgzQ1tcXHVERkZCLVxcdURGRkZdKXxbXFx1MjcwQVxcdTI3MEJdfFxcdUQ4M0NbXFx1REY4NVxcdURGQzJcXHVERkM3XXxcXHVEODNEW1xcdURDMDhcXHVEQzE1XFx1REMzQlxcdURDNDJcXHVEQzQzXFx1REM0Ni1cXHVEQzUwXFx1REM2NlxcdURDNjdcXHVEQzZCLVxcdURDNkRcXHVEQzcyXFx1REM3NC1cXHVEQzc2XFx1REM3OFxcdURDN0NcXHVEQzgzXFx1REM4NVxcdURDOEZcXHVEQzkxXFx1RENBQVxcdUREN0FcXHVERDk1XFx1REQ5NlxcdURFMkVcXHVERTM1XFx1REUzNlxcdURFNENcXHVERTRGXFx1REVDMFxcdURFQ0NdfFxcdUQ4M0VbXFx1REQwQ1xcdUREMEZcXHVERDE4LVxcdUREMUNcXHVERDFFXFx1REQxRlxcdUREMzAtXFx1REQzNFxcdUREMzZcXHVERDc3XFx1RERCNVxcdUREQjZcXHVEREJCXFx1REREMlxcdURERDNcXHVEREQ1XXxcXHVEODNDW1xcdURGQzNcXHVERkM0XFx1REZDQV18XFx1RDgzRFtcXHVEQzZFXFx1REM3MFxcdURDNzFcXHVEQzczXFx1REM3N1xcdURDODFcXHVEQzgyXFx1REM4NlxcdURDODdcXHVERTQ1LVxcdURFNDdcXHVERTRCXFx1REU0RFxcdURFNEVcXHVERUEzXFx1REVCNC1cXHVERUI2XXxcXHVEODNFW1xcdUREMjZcXHVERDM1XFx1REQzNy1cXHVERDM5XFx1REQzRFxcdUREM0VcXHVEREI4XFx1RERCOVxcdUREQ0QtXFx1RERDRlxcdURERDRcXHVEREQ2LVxcdURERERdfFxcdUQ4M0RcXHVEQzZGfFxcdUQ4M0VbXFx1REQzQ1xcdUREREVcXHVERERGXXxbXFx1MjMxQVxcdTIzMUJcXHUyM0U5LVxcdTIzRUNcXHUyM0YwXFx1MjNGM1xcdTI1RkRcXHUyNUZFXFx1MjYxNFxcdTI2MTVcXHUyNjQ4LVxcdTI2NTNcXHUyNjdGXFx1MjY5M1xcdTI2QTFcXHUyNkFBXFx1MjZBQlxcdTI2QkRcXHUyNkJFXFx1MjZDNFxcdTI2QzVcXHUyNkNFXFx1MjZENFxcdTI2RUFcXHUyNkYyXFx1MjZGM1xcdTI2RjVcXHUyNkZBXFx1MjZGRFxcdTI3MDVcXHUyNzI4XFx1Mjc0Q1xcdTI3NEVcXHUyNzUzLVxcdTI3NTVcXHUyNzU3XFx1Mjc5NS1cXHUyNzk3XFx1MjdCMFxcdTI3QkZcXHUyQjFCXFx1MkIxQ1xcdTJCNTBcXHUyQjU1XXxcXHVEODNDW1xcdURDMDRcXHVEQ0NGXFx1REQ4RVxcdUREOTEtXFx1REQ5QVxcdURFMDFcXHVERTFBXFx1REUyRlxcdURFMzItXFx1REUzNlxcdURFMzgtXFx1REUzQVxcdURFNTBcXHVERTUxXFx1REYwMC1cXHVERjIwXFx1REYyRC1cXHVERjM1XFx1REYzNy1cXHVERjdDXFx1REY3RS1cXHVERjg0XFx1REY4Ni1cXHVERjkzXFx1REZBMC1cXHVERkMxXFx1REZDNVxcdURGQzZcXHVERkM4XFx1REZDOVxcdURGQ0YtXFx1REZEM1xcdURGRTAtXFx1REZGMFxcdURGRjgtXFx1REZGRl18XFx1RDgzRFtcXHVEQzAwLVxcdURDMDdcXHVEQzA5LVxcdURDMTRcXHVEQzE2LVxcdURDM0FcXHVEQzNDLVxcdURDM0VcXHVEQzQwXFx1REM0NFxcdURDNDVcXHVEQzUxLVxcdURDNjVcXHVEQzZBXFx1REM3OS1cXHVEQzdCXFx1REM3RC1cXHVEQzgwXFx1REM4NFxcdURDODgtXFx1REM4RVxcdURDOTBcXHVEQzkyLVxcdURDQTlcXHVEQ0FCLVxcdURDRkNcXHVEQ0ZGLVxcdUREM0RcXHVERDRCLVxcdURENEVcXHVERDUwLVxcdURENjdcXHVEREE0XFx1RERGQi1cXHVERTJEXFx1REUyRi1cXHVERTM0XFx1REUzNy1cXHVERTQ0XFx1REU0OC1cXHVERTRBXFx1REU4MC1cXHVERUEyXFx1REVBNC1cXHVERUIzXFx1REVCNy1cXHVERUJGXFx1REVDMS1cXHVERUM1XFx1REVEMC1cXHVERUQyXFx1REVENS1cXHVERUQ3XFx1REVFQlxcdURFRUNcXHVERUY0LVxcdURFRkNcXHVERkUwLVxcdURGRUJdfFxcdUQ4M0VbXFx1REQwRFxcdUREMEVcXHVERDEwLVxcdUREMTdcXHVERDFEXFx1REQyMC1cXHVERDI1XFx1REQyNy1cXHVERDJGXFx1REQzQVxcdUREM0YtXFx1REQ0NVxcdURENDctXFx1REQ3NlxcdURENzhcXHVERDdBLVxcdUREQjRcXHVEREI3XFx1RERCQVxcdUREQkMtXFx1RERDQlxcdURERDBcXHVEREUwLVxcdURERkZcXHVERTcwLVxcdURFNzRcXHVERTc4LVxcdURFN0FcXHVERTgwLVxcdURFODZcXHVERTkwLVxcdURFQThcXHVERUIwLVxcdURFQjZcXHVERUMwLVxcdURFQzJcXHVERUQwLVxcdURFRDZdfCg/OltcXHUyMzFBXFx1MjMxQlxcdTIzRTktXFx1MjNFQ1xcdTIzRjBcXHUyM0YzXFx1MjVGRFxcdTI1RkVcXHUyNjE0XFx1MjYxNVxcdTI2NDgtXFx1MjY1M1xcdTI2N0ZcXHUyNjkzXFx1MjZBMVxcdTI2QUFcXHUyNkFCXFx1MjZCRFxcdTI2QkVcXHUyNkM0XFx1MjZDNVxcdTI2Q0VcXHUyNkQ0XFx1MjZFQVxcdTI2RjJcXHUyNkYzXFx1MjZGNVxcdTI2RkFcXHUyNkZEXFx1MjcwNVxcdTI3MEFcXHUyNzBCXFx1MjcyOFxcdTI3NENcXHUyNzRFXFx1Mjc1My1cXHUyNzU1XFx1Mjc1N1xcdTI3OTUtXFx1Mjc5N1xcdTI3QjBcXHUyN0JGXFx1MkIxQlxcdTJCMUNcXHUyQjUwXFx1MkI1NV18XFx1RDgzQ1tcXHVEQzA0XFx1RENDRlxcdUREOEVcXHVERDkxLVxcdUREOUFcXHVEREU2LVxcdURERkZcXHVERTAxXFx1REUxQVxcdURFMkZcXHVERTMyLVxcdURFMzZcXHVERTM4LVxcdURFM0FcXHVERTUwXFx1REU1MVxcdURGMDAtXFx1REYyMFxcdURGMkQtXFx1REYzNVxcdURGMzctXFx1REY3Q1xcdURGN0UtXFx1REY5M1xcdURGQTAtXFx1REZDQVxcdURGQ0YtXFx1REZEM1xcdURGRTAtXFx1REZGMFxcdURGRjRcXHVERkY4LVxcdURGRkZdfFxcdUQ4M0RbXFx1REMwMC1cXHVEQzNFXFx1REM0MFxcdURDNDItXFx1RENGQ1xcdURDRkYtXFx1REQzRFxcdURENEItXFx1REQ0RVxcdURENTAtXFx1REQ2N1xcdUREN0FcXHVERDk1XFx1REQ5NlxcdUREQTRcXHVEREZCLVxcdURFNEZcXHVERTgwLVxcdURFQzVcXHVERUNDXFx1REVEMC1cXHVERUQyXFx1REVENS1cXHVERUQ3XFx1REVFQlxcdURFRUNcXHVERUY0LVxcdURFRkNcXHVERkUwLVxcdURGRUJdfFxcdUQ4M0VbXFx1REQwQy1cXHVERDNBXFx1REQzQy1cXHVERDQ1XFx1REQ0Ny1cXHVERDc4XFx1REQ3QS1cXHVERENCXFx1RERDRC1cXHVEREZGXFx1REU3MC1cXHVERTc0XFx1REU3OC1cXHVERTdBXFx1REU4MC1cXHVERTg2XFx1REU5MC1cXHVERUE4XFx1REVCMC1cXHVERUI2XFx1REVDMC1cXHVERUMyXFx1REVEMC1cXHVERUQ2XSl8KD86WyNcXCowLTlcXHhBOVxceEFFXFx1MjAzQ1xcdTIwNDlcXHUyMTIyXFx1MjEzOVxcdTIxOTQtXFx1MjE5OVxcdTIxQTlcXHUyMUFBXFx1MjMxQVxcdTIzMUJcXHUyMzI4XFx1MjNDRlxcdTIzRTktXFx1MjNGM1xcdTIzRjgtXFx1MjNGQVxcdTI0QzJcXHUyNUFBXFx1MjVBQlxcdTI1QjZcXHUyNUMwXFx1MjVGQi1cXHUyNUZFXFx1MjYwMC1cXHUyNjA0XFx1MjYwRVxcdTI2MTFcXHUyNjE0XFx1MjYxNVxcdTI2MThcXHUyNjFEXFx1MjYyMFxcdTI2MjJcXHUyNjIzXFx1MjYyNlxcdTI2MkFcXHUyNjJFXFx1MjYyRlxcdTI2MzgtXFx1MjYzQVxcdTI2NDBcXHUyNjQyXFx1MjY0OC1cXHUyNjUzXFx1MjY1RlxcdTI2NjBcXHUyNjYzXFx1MjY2NVxcdTI2NjZcXHUyNjY4XFx1MjY3QlxcdTI2N0VcXHUyNjdGXFx1MjY5Mi1cXHUyNjk3XFx1MjY5OVxcdTI2OUJcXHUyNjlDXFx1MjZBMFxcdTI2QTFcXHUyNkE3XFx1MjZBQVxcdTI2QUJcXHUyNkIwXFx1MjZCMVxcdTI2QkRcXHUyNkJFXFx1MjZDNFxcdTI2QzVcXHUyNkM4XFx1MjZDRVxcdTI2Q0ZcXHUyNkQxXFx1MjZEM1xcdTI2RDRcXHUyNkU5XFx1MjZFQVxcdTI2RjAtXFx1MjZGNVxcdTI2RjctXFx1MjZGQVxcdTI2RkRcXHUyNzAyXFx1MjcwNVxcdTI3MDgtXFx1MjcwRFxcdTI3MEZcXHUyNzEyXFx1MjcxNFxcdTI3MTZcXHUyNzFEXFx1MjcyMVxcdTI3MjhcXHUyNzMzXFx1MjczNFxcdTI3NDRcXHUyNzQ3XFx1Mjc0Q1xcdTI3NEVcXHUyNzUzLVxcdTI3NTVcXHUyNzU3XFx1Mjc2M1xcdTI3NjRcXHUyNzk1LVxcdTI3OTdcXHUyN0ExXFx1MjdCMFxcdTI3QkZcXHUyOTM0XFx1MjkzNVxcdTJCMDUtXFx1MkIwN1xcdTJCMUJcXHUyQjFDXFx1MkI1MFxcdTJCNTVcXHUzMDMwXFx1MzAzRFxcdTMyOTdcXHUzMjk5XXxcXHVEODNDW1xcdURDMDRcXHVEQ0NGXFx1REQ3MFxcdURENzFcXHVERDdFXFx1REQ3RlxcdUREOEVcXHVERDkxLVxcdUREOUFcXHVEREU2LVxcdURERkZcXHVERTAxXFx1REUwMlxcdURFMUFcXHVERTJGXFx1REUzMi1cXHVERTNBXFx1REU1MFxcdURFNTFcXHVERjAwLVxcdURGMjFcXHVERjI0LVxcdURGOTNcXHVERjk2XFx1REY5N1xcdURGOTktXFx1REY5QlxcdURGOUUtXFx1REZGMFxcdURGRjMtXFx1REZGNVxcdURGRjctXFx1REZGRl18XFx1RDgzRFtcXHVEQzAwLVxcdURDRkRcXHVEQ0ZGLVxcdUREM0RcXHVERDQ5LVxcdURENEVcXHVERDUwLVxcdURENjdcXHVERDZGXFx1REQ3MFxcdURENzMtXFx1REQ3QVxcdUREODdcXHVERDhBLVxcdUREOERcXHVERDkwXFx1REQ5NVxcdUREOTZcXHVEREE0XFx1RERBNVxcdUREQThcXHVEREIxXFx1RERCMlxcdUREQkNcXHVEREMyLVxcdUREQzRcXHVEREQxLVxcdURERDNcXHVERERDLVxcdUREREVcXHVEREUxXFx1RERFM1xcdURERThcXHVEREVGXFx1RERGM1xcdURERkEtXFx1REU0RlxcdURFODAtXFx1REVDNVxcdURFQ0ItXFx1REVEMlxcdURFRDUtXFx1REVEN1xcdURFRTAtXFx1REVFNVxcdURFRTlcXHVERUVCXFx1REVFQ1xcdURFRjBcXHVERUYzLVxcdURFRkNcXHVERkUwLVxcdURGRUJdfFxcdUQ4M0VbXFx1REQwQy1cXHVERDNBXFx1REQzQy1cXHVERDQ1XFx1REQ0Ny1cXHVERDc4XFx1REQ3QS1cXHVERENCXFx1RERDRC1cXHVEREZGXFx1REU3MC1cXHVERTc0XFx1REU3OC1cXHVERTdBXFx1REU4MC1cXHVERTg2XFx1REU5MC1cXHVERUE4XFx1REVCMC1cXHVERUI2XFx1REVDMC1cXHVERUMyXFx1REVEMC1cXHVERUQ2XSlcXHVGRTBGfCg/OltcXHUyNjFEXFx1MjZGOVxcdTI3MEEtXFx1MjcwRF18XFx1RDgzQ1tcXHVERjg1XFx1REZDMi1cXHVERkM0XFx1REZDN1xcdURGQ0EtXFx1REZDQ118XFx1RDgzRFtcXHVEQzQyXFx1REM0M1xcdURDNDYtXFx1REM1MFxcdURDNjYtXFx1REM3OFxcdURDN0NcXHVEQzgxLVxcdURDODNcXHVEQzg1LVxcdURDODdcXHVEQzhGXFx1REM5MVxcdURDQUFcXHVERDc0XFx1REQ3NVxcdUREN0FcXHVERDkwXFx1REQ5NVxcdUREOTZcXHVERTQ1LVxcdURFNDdcXHVERTRCLVxcdURFNEZcXHVERUEzXFx1REVCNC1cXHVERUI2XFx1REVDMFxcdURFQ0NdfFxcdUQ4M0VbXFx1REQwQ1xcdUREMEZcXHVERDE4LVxcdUREMUZcXHVERDI2XFx1REQzMC1cXHVERDM5XFx1REQzQy1cXHVERDNFXFx1REQ3N1xcdUREQjVcXHVEREI2XFx1RERCOFxcdUREQjlcXHVEREJCXFx1RERDRC1cXHVERENGXFx1REREMS1cXHVEREREXSkvZztcbn07XG4iLCJpbXBvcnQgc3RyaXBBbnNpIGZyb20gJ3N0cmlwLWFuc2knO1xuaW1wb3J0IGlzRnVsbHdpZHRoQ29kZVBvaW50IGZyb20gJ2lzLWZ1bGx3aWR0aC1jb2RlLXBvaW50JztcbmltcG9ydCBlbW9qaVJlZ2V4IGZyb20gJ2Vtb2ppLXJlZ2V4JztcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gc3RyaW5nV2lkdGgoc3RyaW5nKSB7XG5cdGlmICh0eXBlb2Ygc3RyaW5nICE9PSAnc3RyaW5nJyB8fCBzdHJpbmcubGVuZ3RoID09PSAwKSB7XG5cdFx0cmV0dXJuIDA7XG5cdH1cblxuXHRzdHJpbmcgPSBzdHJpcEFuc2koc3RyaW5nKTtcblxuXHRpZiAoc3RyaW5nLmxlbmd0aCA9PT0gMCkge1xuXHRcdHJldHVybiAwO1xuXHR9XG5cblx0c3RyaW5nID0gc3RyaW5nLnJlcGxhY2UoZW1vamlSZWdleCgpLCAnICAnKTtcblxuXHRsZXQgd2lkdGggPSAwO1xuXG5cdGZvciAobGV0IGluZGV4ID0gMDsgaW5kZXggPCBzdHJpbmcubGVuZ3RoOyBpbmRleCsrKSB7XG5cdFx0Y29uc3QgY29kZVBvaW50ID0gc3RyaW5nLmNvZGVQb2ludEF0KGluZGV4KTtcblxuXHRcdC8vIElnbm9yZSBjb250cm9sIGNoYXJhY3RlcnNcblx0XHRpZiAoY29kZVBvaW50IDw9IDB4MUYgfHwgKGNvZGVQb2ludCA+PSAweDdGICYmIGNvZGVQb2ludCA8PSAweDlGKSkge1xuXHRcdFx0Y29udGludWU7XG5cdFx0fVxuXG5cdFx0Ly8gSWdub3JlIGNvbWJpbmluZyBjaGFyYWN0ZXJzXG5cdFx0aWYgKGNvZGVQb2ludCA+PSAweDMwMCAmJiBjb2RlUG9pbnQgPD0gMHgzNkYpIHtcblx0XHRcdGNvbnRpbnVlO1xuXHRcdH1cblxuXHRcdC8vIFN1cnJvZ2F0ZXNcblx0XHRpZiAoY29kZVBvaW50ID4gMHhGRkZGKSB7XG5cdFx0XHRpbmRleCsrO1xuXHRcdH1cblxuXHRcdHdpZHRoICs9IGlzRnVsbHdpZHRoQ29kZVBvaW50KGNvZGVQb2ludCkgPyAyIDogMTtcblx0fVxuXG5cdHJldHVybiB3aWR0aDtcbn1cbiIsImltcG9ydCBzbGljZUFuc2kgZnJvbSAnc2xpY2UtYW5zaSc7XG5pbXBvcnQgc3RyaW5nV2lkdGggZnJvbSAnc3RyaW5nLXdpZHRoJztcblxuZnVuY3Rpb24gZ2V0SW5kZXhPZk5lYXJlc3RTcGFjZShzdHJpbmcsIHdhbnRlZEluZGV4LCBzaG91bGRTZWFyY2hSaWdodCkge1xuXHRpZiAoc3RyaW5nLmNoYXJBdCh3YW50ZWRJbmRleCkgPT09ICcgJykge1xuXHRcdHJldHVybiB3YW50ZWRJbmRleDtcblx0fVxuXG5cdGZvciAobGV0IGluZGV4ID0gMTsgaW5kZXggPD0gMzsgaW5kZXgrKykge1xuXHRcdGlmIChzaG91bGRTZWFyY2hSaWdodCkge1xuXHRcdFx0aWYgKHN0cmluZy5jaGFyQXQod2FudGVkSW5kZXggKyBpbmRleCkgPT09ICcgJykge1xuXHRcdFx0XHRyZXR1cm4gd2FudGVkSW5kZXggKyBpbmRleDtcblx0XHRcdH1cblx0XHR9IGVsc2UgaWYgKHN0cmluZy5jaGFyQXQod2FudGVkSW5kZXggLSBpbmRleCkgPT09ICcgJykge1xuXHRcdFx0cmV0dXJuIHdhbnRlZEluZGV4IC0gaW5kZXg7XG5cdFx0fVxuXHR9XG5cblx0cmV0dXJuIHdhbnRlZEluZGV4O1xufVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBjbGlUcnVuY2F0ZSh0ZXh0LCBjb2x1bW5zLCBvcHRpb25zKSB7XG5cdG9wdGlvbnMgPSB7XG5cdFx0cG9zaXRpb246ICdlbmQnLFxuXHRcdHByZWZlclRydW5jYXRpb25PblNwYWNlOiBmYWxzZSxcblx0XHR0cnVuY2F0aW9uQ2hhcmFjdGVyOiAn4oCmJyxcblx0XHQuLi5vcHRpb25zLFxuXHR9O1xuXG5cdGNvbnN0IHtwb3NpdGlvbiwgc3BhY2UsIHByZWZlclRydW5jYXRpb25PblNwYWNlfSA9IG9wdGlvbnM7XG5cdGxldCB7dHJ1bmNhdGlvbkNoYXJhY3Rlcn0gPSBvcHRpb25zO1xuXG5cdGlmICh0eXBlb2YgdGV4dCAhPT0gJ3N0cmluZycpIHtcblx0XHR0aHJvdyBuZXcgVHlwZUVycm9yKGBFeHBlY3RlZCBcXGBpbnB1dFxcYCB0byBiZSBhIHN0cmluZywgZ290ICR7dHlwZW9mIHRleHR9YCk7XG5cdH1cblxuXHRpZiAodHlwZW9mIGNvbHVtbnMgIT09ICdudW1iZXInKSB7XG5cdFx0dGhyb3cgbmV3IFR5cGVFcnJvcihgRXhwZWN0ZWQgXFxgY29sdW1uc1xcYCB0byBiZSBhIG51bWJlciwgZ290ICR7dHlwZW9mIGNvbHVtbnN9YCk7XG5cdH1cblxuXHRpZiAoY29sdW1ucyA8IDEpIHtcblx0XHRyZXR1cm4gJyc7XG5cdH1cblxuXHRpZiAoY29sdW1ucyA9PT0gMSkge1xuXHRcdHJldHVybiB0cnVuY2F0aW9uQ2hhcmFjdGVyO1xuXHR9XG5cblx0Y29uc3QgbGVuZ3RoID0gc3RyaW5nV2lkdGgodGV4dCk7XG5cblx0aWYgKGxlbmd0aCA8PSBjb2x1bW5zKSB7XG5cdFx0cmV0dXJuIHRleHQ7XG5cdH1cblxuXHRpZiAocG9zaXRpb24gPT09ICdzdGFydCcpIHtcblx0XHRpZiAocHJlZmVyVHJ1bmNhdGlvbk9uU3BhY2UpIHtcblx0XHRcdGNvbnN0IG5lYXJlc3RTcGFjZSA9IGdldEluZGV4T2ZOZWFyZXN0U3BhY2UodGV4dCwgbGVuZ3RoIC0gY29sdW1ucyArIDEsIHRydWUpO1xuXHRcdFx0cmV0dXJuIHRydW5jYXRpb25DaGFyYWN0ZXIgKyBzbGljZUFuc2kodGV4dCwgbmVhcmVzdFNwYWNlLCBsZW5ndGgpLnRyaW0oKTtcblx0XHR9XG5cblx0XHRpZiAoc3BhY2UgPT09IHRydWUpIHtcblx0XHRcdHRydW5jYXRpb25DaGFyYWN0ZXIgKz0gJyAnO1xuXHRcdH1cblxuXHRcdHJldHVybiB0cnVuY2F0aW9uQ2hhcmFjdGVyICsgc2xpY2VBbnNpKHRleHQsIGxlbmd0aCAtIGNvbHVtbnMgKyBzdHJpbmdXaWR0aCh0cnVuY2F0aW9uQ2hhcmFjdGVyKSwgbGVuZ3RoKTtcblx0fVxuXG5cdGlmIChwb3NpdGlvbiA9PT0gJ21pZGRsZScpIHtcblx0XHRpZiAoc3BhY2UgPT09IHRydWUpIHtcblx0XHRcdHRydW5jYXRpb25DaGFyYWN0ZXIgPSBgICR7dHJ1bmNhdGlvbkNoYXJhY3Rlcn0gYDtcblx0XHR9XG5cblx0XHRjb25zdCBoYWxmID0gTWF0aC5mbG9vcihjb2x1bW5zIC8gMik7XG5cblx0XHRpZiAocHJlZmVyVHJ1bmNhdGlvbk9uU3BhY2UpIHtcblx0XHRcdGNvbnN0IHNwYWNlTmVhckZpcnN0QnJlYWtQb2ludCA9IGdldEluZGV4T2ZOZWFyZXN0U3BhY2UodGV4dCwgaGFsZik7XG5cdFx0XHRjb25zdCBzcGFjZU5lYXJTZWNvbmRCcmVha1BvaW50ID0gZ2V0SW5kZXhPZk5lYXJlc3RTcGFjZSh0ZXh0LCBsZW5ndGggLSAoY29sdW1ucyAtIGhhbGYpICsgMSwgdHJ1ZSk7XG5cdFx0XHRyZXR1cm4gc2xpY2VBbnNpKHRleHQsIDAsIHNwYWNlTmVhckZpcnN0QnJlYWtQb2ludCkgKyB0cnVuY2F0aW9uQ2hhcmFjdGVyICsgc2xpY2VBbnNpKHRleHQsIHNwYWNlTmVhclNlY29uZEJyZWFrUG9pbnQsIGxlbmd0aCkudHJpbSgpO1xuXHRcdH1cblxuXHRcdHJldHVybiAoXG5cdFx0XHRzbGljZUFuc2kodGV4dCwgMCwgaGFsZilcblx0XHRcdFx0KyB0cnVuY2F0aW9uQ2hhcmFjdGVyXG5cdFx0XHRcdCsgc2xpY2VBbnNpKHRleHQsIGxlbmd0aCAtIChjb2x1bW5zIC0gaGFsZikgKyBzdHJpbmdXaWR0aCh0cnVuY2F0aW9uQ2hhcmFjdGVyKSwgbGVuZ3RoKVxuXHRcdCk7XG5cdH1cblxuXHRpZiAocG9zaXRpb24gPT09ICdlbmQnKSB7XG5cdFx0aWYgKHByZWZlclRydW5jYXRpb25PblNwYWNlKSB7XG5cdFx0XHRjb25zdCBuZWFyZXN0U3BhY2UgPSBnZXRJbmRleE9mTmVhcmVzdFNwYWNlKHRleHQsIGNvbHVtbnMgLSAxKTtcblx0XHRcdHJldHVybiBzbGljZUFuc2kodGV4dCwgMCwgbmVhcmVzdFNwYWNlKSArIHRydW5jYXRpb25DaGFyYWN0ZXI7XG5cdFx0fVxuXG5cdFx0aWYgKHNwYWNlID09PSB0cnVlKSB7XG5cdFx0XHR0cnVuY2F0aW9uQ2hhcmFjdGVyID0gYCAke3RydW5jYXRpb25DaGFyYWN0ZXJ9YDtcblx0XHR9XG5cblx0XHRyZXR1cm4gc2xpY2VBbnNpKHRleHQsIDAsIGNvbHVtbnMgLSBzdHJpbmdXaWR0aCh0cnVuY2F0aW9uQ2hhcmFjdGVyKSkgKyB0cnVuY2F0aW9uQ2hhcmFjdGVyO1xuXHR9XG5cblx0dGhyb3cgbmV3IEVycm9yKGBFeHBlY3RlZCBcXGBvcHRpb25zLnBvc2l0aW9uXFxgIHRvIGJlIGVpdGhlciBcXGBzdGFydFxcYCwgXFxgbWlkZGxlXFxgIG9yIFxcYGVuZFxcYCwgZ290ICR7cG9zaXRpb259YCk7XG59XG4iLCIvKiAtKi0gTW9kZToganM7IGpzLWluZGVudC1sZXZlbDogMjsgLSotICovXG4vKlxuICogQ29weXJpZ2h0IDIwMTEgTW96aWxsYSBGb3VuZGF0aW9uIGFuZCBjb250cmlidXRvcnNcbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBOZXcgQlNEIGxpY2Vuc2UuIFNlZSBMSUNFTlNFIG9yOlxuICogaHR0cDovL29wZW5zb3VyY2Uub3JnL2xpY2Vuc2VzL0JTRC0zLUNsYXVzZVxuICovXG5cbnZhciBpbnRUb0NoYXJNYXAgPSAnQUJDREVGR0hJSktMTU5PUFFSU1RVVldYWVphYmNkZWZnaGlqa2xtbm9wcXJzdHV2d3h5ejAxMjM0NTY3ODkrLycuc3BsaXQoJycpO1xuXG4vKipcbiAqIEVuY29kZSBhbiBpbnRlZ2VyIGluIHRoZSByYW5nZSBvZiAwIHRvIDYzIHRvIGEgc2luZ2xlIGJhc2UgNjQgZGlnaXQuXG4gKi9cbmV4cG9ydHMuZW5jb2RlID0gZnVuY3Rpb24gKG51bWJlcikge1xuICBpZiAoMCA8PSBudW1iZXIgJiYgbnVtYmVyIDwgaW50VG9DaGFyTWFwLmxlbmd0aCkge1xuICAgIHJldHVybiBpbnRUb0NoYXJNYXBbbnVtYmVyXTtcbiAgfVxuICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiTXVzdCBiZSBiZXR3ZWVuIDAgYW5kIDYzOiBcIiArIG51bWJlcik7XG59O1xuXG4vKipcbiAqIERlY29kZSBhIHNpbmdsZSBiYXNlIDY0IGNoYXJhY3RlciBjb2RlIGRpZ2l0IHRvIGFuIGludGVnZXIuIFJldHVybnMgLTEgb25cbiAqIGZhaWx1cmUuXG4gKi9cbmV4cG9ydHMuZGVjb2RlID0gZnVuY3Rpb24gKGNoYXJDb2RlKSB7XG4gIHZhciBiaWdBID0gNjU7ICAgICAvLyAnQSdcbiAgdmFyIGJpZ1ogPSA5MDsgICAgIC8vICdaJ1xuXG4gIHZhciBsaXR0bGVBID0gOTc7ICAvLyAnYSdcbiAgdmFyIGxpdHRsZVogPSAxMjI7IC8vICd6J1xuXG4gIHZhciB6ZXJvID0gNDg7ICAgICAvLyAnMCdcbiAgdmFyIG5pbmUgPSA1NzsgICAgIC8vICc5J1xuXG4gIHZhciBwbHVzID0gNDM7ICAgICAvLyAnKydcbiAgdmFyIHNsYXNoID0gNDc7ICAgIC8vICcvJ1xuXG4gIHZhciBsaXR0bGVPZmZzZXQgPSAyNjtcbiAgdmFyIG51bWJlck9mZnNldCA9IDUyO1xuXG4gIC8vIDAgLSAyNTogQUJDREVGR0hJSktMTU5PUFFSU1RVVldYWVpcbiAgaWYgKGJpZ0EgPD0gY2hhckNvZGUgJiYgY2hhckNvZGUgPD0gYmlnWikge1xuICAgIHJldHVybiAoY2hhckNvZGUgLSBiaWdBKTtcbiAgfVxuXG4gIC8vIDI2IC0gNTE6IGFiY2RlZmdoaWprbG1ub3BxcnN0dXZ3eHl6XG4gIGlmIChsaXR0bGVBIDw9IGNoYXJDb2RlICYmIGNoYXJDb2RlIDw9IGxpdHRsZVopIHtcbiAgICByZXR1cm4gKGNoYXJDb2RlIC0gbGl0dGxlQSArIGxpdHRsZU9mZnNldCk7XG4gIH1cblxuICAvLyA1MiAtIDYxOiAwMTIzNDU2Nzg5XG4gIGlmICh6ZXJvIDw9IGNoYXJDb2RlICYmIGNoYXJDb2RlIDw9IG5pbmUpIHtcbiAgICByZXR1cm4gKGNoYXJDb2RlIC0gemVybyArIG51bWJlck9mZnNldCk7XG4gIH1cblxuICAvLyA2MjogK1xuICBpZiAoY2hhckNvZGUgPT0gcGx1cykge1xuICAgIHJldHVybiA2MjtcbiAgfVxuXG4gIC8vIDYzOiAvXG4gIGlmIChjaGFyQ29kZSA9PSBzbGFzaCkge1xuICAgIHJldHVybiA2MztcbiAgfVxuXG4gIC8vIEludmFsaWQgYmFzZTY0IGRpZ2l0LlxuICByZXR1cm4gLTE7XG59O1xuIiwiLyogLSotIE1vZGU6IGpzOyBqcy1pbmRlbnQtbGV2ZWw6IDI7IC0qLSAqL1xuLypcbiAqIENvcHlyaWdodCAyMDExIE1vemlsbGEgRm91bmRhdGlvbiBhbmQgY29udHJpYnV0b3JzXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgTmV3IEJTRCBsaWNlbnNlLiBTZWUgTElDRU5TRSBvcjpcbiAqIGh0dHA6Ly9vcGVuc291cmNlLm9yZy9saWNlbnNlcy9CU0QtMy1DbGF1c2VcbiAqXG4gKiBCYXNlZCBvbiB0aGUgQmFzZSA2NCBWTFEgaW1wbGVtZW50YXRpb24gaW4gQ2xvc3VyZSBDb21waWxlcjpcbiAqIGh0dHBzOi8vY29kZS5nb29nbGUuY29tL3AvY2xvc3VyZS1jb21waWxlci9zb3VyY2UvYnJvd3NlL3RydW5rL3NyYy9jb20vZ29vZ2xlL2RlYnVnZ2luZy9zb3VyY2VtYXAvQmFzZTY0VkxRLmphdmFcbiAqXG4gKiBDb3B5cmlnaHQgMjAxMSBUaGUgQ2xvc3VyZSBDb21waWxlciBBdXRob3JzLiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICogUmVkaXN0cmlidXRpb24gYW5kIHVzZSBpbiBzb3VyY2UgYW5kIGJpbmFyeSBmb3Jtcywgd2l0aCBvciB3aXRob3V0XG4gKiBtb2RpZmljYXRpb24sIGFyZSBwZXJtaXR0ZWQgcHJvdmlkZWQgdGhhdCB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnMgYXJlXG4gKiBtZXQ6XG4gKlxuICogICogUmVkaXN0cmlidXRpb25zIG9mIHNvdXJjZSBjb2RlIG11c3QgcmV0YWluIHRoZSBhYm92ZSBjb3B5cmlnaHRcbiAqICAgIG5vdGljZSwgdGhpcyBsaXN0IG9mIGNvbmRpdGlvbnMgYW5kIHRoZSBmb2xsb3dpbmcgZGlzY2xhaW1lci5cbiAqICAqIFJlZGlzdHJpYnV0aW9ucyBpbiBiaW5hcnkgZm9ybSBtdXN0IHJlcHJvZHVjZSB0aGUgYWJvdmVcbiAqICAgIGNvcHlyaWdodCBub3RpY2UsIHRoaXMgbGlzdCBvZiBjb25kaXRpb25zIGFuZCB0aGUgZm9sbG93aW5nXG4gKiAgICBkaXNjbGFpbWVyIGluIHRoZSBkb2N1bWVudGF0aW9uIGFuZC9vciBvdGhlciBtYXRlcmlhbHMgcHJvdmlkZWRcbiAqICAgIHdpdGggdGhlIGRpc3RyaWJ1dGlvbi5cbiAqICAqIE5laXRoZXIgdGhlIG5hbWUgb2YgR29vZ2xlIEluYy4gbm9yIHRoZSBuYW1lcyBvZiBpdHNcbiAqICAgIGNvbnRyaWJ1dG9ycyBtYXkgYmUgdXNlZCB0byBlbmRvcnNlIG9yIHByb21vdGUgcHJvZHVjdHMgZGVyaXZlZFxuICogICAgZnJvbSB0aGlzIHNvZnR3YXJlIHdpdGhvdXQgc3BlY2lmaWMgcHJpb3Igd3JpdHRlbiBwZXJtaXNzaW9uLlxuICpcbiAqIFRISVMgU09GVFdBUkUgSVMgUFJPVklERUQgQlkgVEhFIENPUFlSSUdIVCBIT0xERVJTIEFORCBDT05UUklCVVRPUlNcbiAqIFwiQVMgSVNcIiBBTkQgQU5ZIEVYUFJFU1MgT1IgSU1QTElFRCBXQVJSQU5USUVTLCBJTkNMVURJTkcsIEJVVCBOT1RcbiAqIExJTUlURUQgVE8sIFRIRSBJTVBMSUVEIFdBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZIEFORCBGSVRORVNTIEZPUlxuICogQSBQQVJUSUNVTEFSIFBVUlBPU0UgQVJFIERJU0NMQUlNRUQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRSBDT1BZUklHSFRcbiAqIE9XTkVSIE9SIENPTlRSSUJVVE9SUyBCRSBMSUFCTEUgRk9SIEFOWSBESVJFQ1QsIElORElSRUNULCBJTkNJREVOVEFMLFxuICogU1BFQ0lBTCwgRVhFTVBMQVJZLCBPUiBDT05TRVFVRU5USUFMIERBTUFHRVMgKElOQ0xVRElORywgQlVUIE5PVFxuICogTElNSVRFRCBUTywgUFJPQ1VSRU1FTlQgT0YgU1VCU1RJVFVURSBHT09EUyBPUiBTRVJWSUNFUzsgTE9TUyBPRiBVU0UsXG4gKiBEQVRBLCBPUiBQUk9GSVRTOyBPUiBCVVNJTkVTUyBJTlRFUlJVUFRJT04pIEhPV0VWRVIgQ0FVU0VEIEFORCBPTiBBTllcbiAqIFRIRU9SWSBPRiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQ09OVFJBQ1QsIFNUUklDVCBMSUFCSUxJVFksIE9SIFRPUlRcbiAqIChJTkNMVURJTkcgTkVHTElHRU5DRSBPUiBPVEhFUldJU0UpIEFSSVNJTkcgSU4gQU5ZIFdBWSBPVVQgT0YgVEhFIFVTRVxuICogT0YgVEhJUyBTT0ZUV0FSRSwgRVZFTiBJRiBBRFZJU0VEIE9GIFRIRSBQT1NTSUJJTElUWSBPRiBTVUNIIERBTUFHRS5cbiAqL1xuXG52YXIgYmFzZTY0ID0gcmVxdWlyZSgnLi9iYXNlNjQnKTtcblxuLy8gQSBzaW5nbGUgYmFzZSA2NCBkaWdpdCBjYW4gY29udGFpbiA2IGJpdHMgb2YgZGF0YS4gRm9yIHRoZSBiYXNlIDY0IHZhcmlhYmxlXG4vLyBsZW5ndGggcXVhbnRpdGllcyB3ZSB1c2UgaW4gdGhlIHNvdXJjZSBtYXAgc3BlYywgdGhlIGZpcnN0IGJpdCBpcyB0aGUgc2lnbixcbi8vIHRoZSBuZXh0IGZvdXIgYml0cyBhcmUgdGhlIGFjdHVhbCB2YWx1ZSwgYW5kIHRoZSA2dGggYml0IGlzIHRoZVxuLy8gY29udGludWF0aW9uIGJpdC4gVGhlIGNvbnRpbnVhdGlvbiBiaXQgdGVsbHMgdXMgd2hldGhlciB0aGVyZSBhcmUgbW9yZVxuLy8gZGlnaXRzIGluIHRoaXMgdmFsdWUgZm9sbG93aW5nIHRoaXMgZGlnaXQuXG4vL1xuLy8gICBDb250aW51YXRpb25cbi8vICAgfCAgICBTaWduXG4vLyAgIHwgICAgfFxuLy8gICBWICAgIFZcbi8vICAgMTAxMDExXG5cbnZhciBWTFFfQkFTRV9TSElGVCA9IDU7XG5cbi8vIGJpbmFyeTogMTAwMDAwXG52YXIgVkxRX0JBU0UgPSAxIDw8IFZMUV9CQVNFX1NISUZUO1xuXG4vLyBiaW5hcnk6IDAxMTExMVxudmFyIFZMUV9CQVNFX01BU0sgPSBWTFFfQkFTRSAtIDE7XG5cbi8vIGJpbmFyeTogMTAwMDAwXG52YXIgVkxRX0NPTlRJTlVBVElPTl9CSVQgPSBWTFFfQkFTRTtcblxuLyoqXG4gKiBDb252ZXJ0cyBmcm9tIGEgdHdvLWNvbXBsZW1lbnQgdmFsdWUgdG8gYSB2YWx1ZSB3aGVyZSB0aGUgc2lnbiBiaXQgaXNcbiAqIHBsYWNlZCBpbiB0aGUgbGVhc3Qgc2lnbmlmaWNhbnQgYml0LiAgRm9yIGV4YW1wbGUsIGFzIGRlY2ltYWxzOlxuICogICAxIGJlY29tZXMgMiAoMTAgYmluYXJ5KSwgLTEgYmVjb21lcyAzICgxMSBiaW5hcnkpXG4gKiAgIDIgYmVjb21lcyA0ICgxMDAgYmluYXJ5KSwgLTIgYmVjb21lcyA1ICgxMDEgYmluYXJ5KVxuICovXG5mdW5jdGlvbiB0b1ZMUVNpZ25lZChhVmFsdWUpIHtcbiAgcmV0dXJuIGFWYWx1ZSA8IDBcbiAgICA/ICgoLWFWYWx1ZSkgPDwgMSkgKyAxXG4gICAgOiAoYVZhbHVlIDw8IDEpICsgMDtcbn1cblxuLyoqXG4gKiBDb252ZXJ0cyB0byBhIHR3by1jb21wbGVtZW50IHZhbHVlIGZyb20gYSB2YWx1ZSB3aGVyZSB0aGUgc2lnbiBiaXQgaXNcbiAqIHBsYWNlZCBpbiB0aGUgbGVhc3Qgc2lnbmlmaWNhbnQgYml0LiAgRm9yIGV4YW1wbGUsIGFzIGRlY2ltYWxzOlxuICogICAyICgxMCBiaW5hcnkpIGJlY29tZXMgMSwgMyAoMTEgYmluYXJ5KSBiZWNvbWVzIC0xXG4gKiAgIDQgKDEwMCBiaW5hcnkpIGJlY29tZXMgMiwgNSAoMTAxIGJpbmFyeSkgYmVjb21lcyAtMlxuICovXG5mdW5jdGlvbiBmcm9tVkxRU2lnbmVkKGFWYWx1ZSkge1xuICB2YXIgaXNOZWdhdGl2ZSA9IChhVmFsdWUgJiAxKSA9PT0gMTtcbiAgdmFyIHNoaWZ0ZWQgPSBhVmFsdWUgPj4gMTtcbiAgcmV0dXJuIGlzTmVnYXRpdmVcbiAgICA/IC1zaGlmdGVkXG4gICAgOiBzaGlmdGVkO1xufVxuXG4vKipcbiAqIFJldHVybnMgdGhlIGJhc2UgNjQgVkxRIGVuY29kZWQgdmFsdWUuXG4gKi9cbmV4cG9ydHMuZW5jb2RlID0gZnVuY3Rpb24gYmFzZTY0VkxRX2VuY29kZShhVmFsdWUpIHtcbiAgdmFyIGVuY29kZWQgPSBcIlwiO1xuICB2YXIgZGlnaXQ7XG5cbiAgdmFyIHZscSA9IHRvVkxRU2lnbmVkKGFWYWx1ZSk7XG5cbiAgZG8ge1xuICAgIGRpZ2l0ID0gdmxxICYgVkxRX0JBU0VfTUFTSztcbiAgICB2bHEgPj4+PSBWTFFfQkFTRV9TSElGVDtcbiAgICBpZiAodmxxID4gMCkge1xuICAgICAgLy8gVGhlcmUgYXJlIHN0aWxsIG1vcmUgZGlnaXRzIGluIHRoaXMgdmFsdWUsIHNvIHdlIG11c3QgbWFrZSBzdXJlIHRoZVxuICAgICAgLy8gY29udGludWF0aW9uIGJpdCBpcyBtYXJrZWQuXG4gICAgICBkaWdpdCB8PSBWTFFfQ09OVElOVUFUSU9OX0JJVDtcbiAgICB9XG4gICAgZW5jb2RlZCArPSBiYXNlNjQuZW5jb2RlKGRpZ2l0KTtcbiAgfSB3aGlsZSAodmxxID4gMCk7XG5cbiAgcmV0dXJuIGVuY29kZWQ7XG59O1xuXG4vKipcbiAqIERlY29kZXMgdGhlIG5leHQgYmFzZSA2NCBWTFEgdmFsdWUgZnJvbSB0aGUgZ2l2ZW4gc3RyaW5nIGFuZCByZXR1cm5zIHRoZVxuICogdmFsdWUgYW5kIHRoZSByZXN0IG9mIHRoZSBzdHJpbmcgdmlhIHRoZSBvdXQgcGFyYW1ldGVyLlxuICovXG5leHBvcnRzLmRlY29kZSA9IGZ1bmN0aW9uIGJhc2U2NFZMUV9kZWNvZGUoYVN0ciwgYUluZGV4LCBhT3V0UGFyYW0pIHtcbiAgdmFyIHN0ckxlbiA9IGFTdHIubGVuZ3RoO1xuICB2YXIgcmVzdWx0ID0gMDtcbiAgdmFyIHNoaWZ0ID0gMDtcbiAgdmFyIGNvbnRpbnVhdGlvbiwgZGlnaXQ7XG5cbiAgZG8ge1xuICAgIGlmIChhSW5kZXggPj0gc3RyTGVuKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJFeHBlY3RlZCBtb3JlIGRpZ2l0cyBpbiBiYXNlIDY0IFZMUSB2YWx1ZS5cIik7XG4gICAgfVxuXG4gICAgZGlnaXQgPSBiYXNlNjQuZGVjb2RlKGFTdHIuY2hhckNvZGVBdChhSW5kZXgrKykpO1xuICAgIGlmIChkaWdpdCA9PT0gLTEpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIkludmFsaWQgYmFzZTY0IGRpZ2l0OiBcIiArIGFTdHIuY2hhckF0KGFJbmRleCAtIDEpKTtcbiAgICB9XG5cbiAgICBjb250aW51YXRpb24gPSAhIShkaWdpdCAmIFZMUV9DT05USU5VQVRJT05fQklUKTtcbiAgICBkaWdpdCAmPSBWTFFfQkFTRV9NQVNLO1xuICAgIHJlc3VsdCA9IHJlc3VsdCArIChkaWdpdCA8PCBzaGlmdCk7XG4gICAgc2hpZnQgKz0gVkxRX0JBU0VfU0hJRlQ7XG4gIH0gd2hpbGUgKGNvbnRpbnVhdGlvbik7XG5cbiAgYU91dFBhcmFtLnZhbHVlID0gZnJvbVZMUVNpZ25lZChyZXN1bHQpO1xuICBhT3V0UGFyYW0ucmVzdCA9IGFJbmRleDtcbn07XG4iLCIvKiAtKi0gTW9kZToganM7IGpzLWluZGVudC1sZXZlbDogMjsgLSotICovXG4vKlxuICogQ29weXJpZ2h0IDIwMTEgTW96aWxsYSBGb3VuZGF0aW9uIGFuZCBjb250cmlidXRvcnNcbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBOZXcgQlNEIGxpY2Vuc2UuIFNlZSBMSUNFTlNFIG9yOlxuICogaHR0cDovL29wZW5zb3VyY2Uub3JnL2xpY2Vuc2VzL0JTRC0zLUNsYXVzZVxuICovXG5cbi8qKlxuICogVGhpcyBpcyBhIGhlbHBlciBmdW5jdGlvbiBmb3IgZ2V0dGluZyB2YWx1ZXMgZnJvbSBwYXJhbWV0ZXIvb3B0aW9uc1xuICogb2JqZWN0cy5cbiAqXG4gKiBAcGFyYW0gYXJncyBUaGUgb2JqZWN0IHdlIGFyZSBleHRyYWN0aW5nIHZhbHVlcyBmcm9tXG4gKiBAcGFyYW0gbmFtZSBUaGUgbmFtZSBvZiB0aGUgcHJvcGVydHkgd2UgYXJlIGdldHRpbmcuXG4gKiBAcGFyYW0gZGVmYXVsdFZhbHVlIEFuIG9wdGlvbmFsIHZhbHVlIHRvIHJldHVybiBpZiB0aGUgcHJvcGVydHkgaXMgbWlzc2luZ1xuICogZnJvbSB0aGUgb2JqZWN0LiBJZiB0aGlzIGlzIG5vdCBzcGVjaWZpZWQgYW5kIHRoZSBwcm9wZXJ0eSBpcyBtaXNzaW5nLCBhblxuICogZXJyb3Igd2lsbCBiZSB0aHJvd24uXG4gKi9cbmZ1bmN0aW9uIGdldEFyZyhhQXJncywgYU5hbWUsIGFEZWZhdWx0VmFsdWUpIHtcbiAgaWYgKGFOYW1lIGluIGFBcmdzKSB7XG4gICAgcmV0dXJuIGFBcmdzW2FOYW1lXTtcbiAgfSBlbHNlIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAzKSB7XG4gICAgcmV0dXJuIGFEZWZhdWx0VmFsdWU7XG4gIH0gZWxzZSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdcIicgKyBhTmFtZSArICdcIiBpcyBhIHJlcXVpcmVkIGFyZ3VtZW50LicpO1xuICB9XG59XG5leHBvcnRzLmdldEFyZyA9IGdldEFyZztcblxudmFyIHVybFJlZ2V4cCA9IC9eKD86KFtcXHcrXFwtLl0rKTopP1xcL1xcLyg/OihcXHcrOlxcdyspQCk/KFtcXHcuLV0qKSg/OjooXFxkKykpPyguKikkLztcbnZhciBkYXRhVXJsUmVnZXhwID0gL15kYXRhOi4rXFwsLiskLztcblxuZnVuY3Rpb24gdXJsUGFyc2UoYVVybCkge1xuICB2YXIgbWF0Y2ggPSBhVXJsLm1hdGNoKHVybFJlZ2V4cCk7XG4gIGlmICghbWF0Y2gpIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuICByZXR1cm4ge1xuICAgIHNjaGVtZTogbWF0Y2hbMV0sXG4gICAgYXV0aDogbWF0Y2hbMl0sXG4gICAgaG9zdDogbWF0Y2hbM10sXG4gICAgcG9ydDogbWF0Y2hbNF0sXG4gICAgcGF0aDogbWF0Y2hbNV1cbiAgfTtcbn1cbmV4cG9ydHMudXJsUGFyc2UgPSB1cmxQYXJzZTtcblxuZnVuY3Rpb24gdXJsR2VuZXJhdGUoYVBhcnNlZFVybCkge1xuICB2YXIgdXJsID0gJyc7XG4gIGlmIChhUGFyc2VkVXJsLnNjaGVtZSkge1xuICAgIHVybCArPSBhUGFyc2VkVXJsLnNjaGVtZSArICc6JztcbiAgfVxuICB1cmwgKz0gJy8vJztcbiAgaWYgKGFQYXJzZWRVcmwuYXV0aCkge1xuICAgIHVybCArPSBhUGFyc2VkVXJsLmF1dGggKyAnQCc7XG4gIH1cbiAgaWYgKGFQYXJzZWRVcmwuaG9zdCkge1xuICAgIHVybCArPSBhUGFyc2VkVXJsLmhvc3Q7XG4gIH1cbiAgaWYgKGFQYXJzZWRVcmwucG9ydCkge1xuICAgIHVybCArPSBcIjpcIiArIGFQYXJzZWRVcmwucG9ydFxuICB9XG4gIGlmIChhUGFyc2VkVXJsLnBhdGgpIHtcbiAgICB1cmwgKz0gYVBhcnNlZFVybC5wYXRoO1xuICB9XG4gIHJldHVybiB1cmw7XG59XG5leHBvcnRzLnVybEdlbmVyYXRlID0gdXJsR2VuZXJhdGU7XG5cbnZhciBNQVhfQ0FDSEVEX0lOUFVUUyA9IDMyO1xuXG4vKipcbiAqIFRha2VzIHNvbWUgZnVuY3Rpb24gYGYoaW5wdXQpIC0+IHJlc3VsdGAgYW5kIHJldHVybnMgYSBtZW1vaXplZCB2ZXJzaW9uIG9mXG4gKiBgZmAuXG4gKlxuICogV2Uga2VlcCBhdCBtb3N0IGBNQVhfQ0FDSEVEX0lOUFVUU2AgbWVtb2l6ZWQgcmVzdWx0cyBvZiBgZmAgYWxpdmUuIFRoZVxuICogbWVtb2l6YXRpb24gaXMgYSBkdW1iLXNpbXBsZSwgbGluZWFyIGxlYXN0LXJlY2VudGx5LXVzZWQgY2FjaGUuXG4gKi9cbmZ1bmN0aW9uIGxydU1lbW9pemUoZikge1xuICB2YXIgY2FjaGUgPSBbXTtcblxuICByZXR1cm4gZnVuY3Rpb24oaW5wdXQpIHtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGNhY2hlLmxlbmd0aDsgaSsrKSB7XG4gICAgICBpZiAoY2FjaGVbaV0uaW5wdXQgPT09IGlucHV0KSB7XG4gICAgICAgIHZhciB0ZW1wID0gY2FjaGVbMF07XG4gICAgICAgIGNhY2hlWzBdID0gY2FjaGVbaV07XG4gICAgICAgIGNhY2hlW2ldID0gdGVtcDtcbiAgICAgICAgcmV0dXJuIGNhY2hlWzBdLnJlc3VsdDtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB2YXIgcmVzdWx0ID0gZihpbnB1dCk7XG5cbiAgICBjYWNoZS51bnNoaWZ0KHtcbiAgICAgIGlucHV0LFxuICAgICAgcmVzdWx0LFxuICAgIH0pO1xuXG4gICAgaWYgKGNhY2hlLmxlbmd0aCA+IE1BWF9DQUNIRURfSU5QVVRTKSB7XG4gICAgICBjYWNoZS5wb3AoKTtcbiAgICB9XG5cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9O1xufVxuXG4vKipcbiAqIE5vcm1hbGl6ZXMgYSBwYXRoLCBvciB0aGUgcGF0aCBwb3J0aW9uIG9mIGEgVVJMOlxuICpcbiAqIC0gUmVwbGFjZXMgY29uc2VjdXRpdmUgc2xhc2hlcyB3aXRoIG9uZSBzbGFzaC5cbiAqIC0gUmVtb3ZlcyB1bm5lY2Vzc2FyeSAnLicgcGFydHMuXG4gKiAtIFJlbW92ZXMgdW5uZWNlc3NhcnkgJzxkaXI+Ly4uJyBwYXJ0cy5cbiAqXG4gKiBCYXNlZCBvbiBjb2RlIGluIHRoZSBOb2RlLmpzICdwYXRoJyBjb3JlIG1vZHVsZS5cbiAqXG4gKiBAcGFyYW0gYVBhdGggVGhlIHBhdGggb3IgdXJsIHRvIG5vcm1hbGl6ZS5cbiAqL1xudmFyIG5vcm1hbGl6ZSA9IGxydU1lbW9pemUoZnVuY3Rpb24gbm9ybWFsaXplKGFQYXRoKSB7XG4gIHZhciBwYXRoID0gYVBhdGg7XG4gIHZhciB1cmwgPSB1cmxQYXJzZShhUGF0aCk7XG4gIGlmICh1cmwpIHtcbiAgICBpZiAoIXVybC5wYXRoKSB7XG4gICAgICByZXR1cm4gYVBhdGg7XG4gICAgfVxuICAgIHBhdGggPSB1cmwucGF0aDtcbiAgfVxuICB2YXIgaXNBYnNvbHV0ZSA9IGV4cG9ydHMuaXNBYnNvbHV0ZShwYXRoKTtcbiAgLy8gU3BsaXQgdGhlIHBhdGggaW50byBwYXJ0cyBiZXR3ZWVuIGAvYCBjaGFyYWN0ZXJzLiBUaGlzIGlzIG11Y2ggZmFzdGVyIHRoYW5cbiAgLy8gdXNpbmcgYC5zcGxpdCgvXFwvKy9nKWAuXG4gIHZhciBwYXJ0cyA9IFtdO1xuICB2YXIgc3RhcnQgPSAwO1xuICB2YXIgaSA9IDA7XG4gIHdoaWxlICh0cnVlKSB7XG4gICAgc3RhcnQgPSBpO1xuICAgIGkgPSBwYXRoLmluZGV4T2YoXCIvXCIsIHN0YXJ0KTtcbiAgICBpZiAoaSA9PT0gLTEpIHtcbiAgICAgIHBhcnRzLnB1c2gocGF0aC5zbGljZShzdGFydCkpO1xuICAgICAgYnJlYWs7XG4gICAgfSBlbHNlIHtcbiAgICAgIHBhcnRzLnB1c2gocGF0aC5zbGljZShzdGFydCwgaSkpO1xuICAgICAgd2hpbGUgKGkgPCBwYXRoLmxlbmd0aCAmJiBwYXRoW2ldID09PSBcIi9cIikge1xuICAgICAgICBpKys7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgZm9yICh2YXIgcGFydCwgdXAgPSAwLCBpID0gcGFydHMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcbiAgICBwYXJ0ID0gcGFydHNbaV07XG4gICAgaWYgKHBhcnQgPT09ICcuJykge1xuICAgICAgcGFydHMuc3BsaWNlKGksIDEpO1xuICAgIH0gZWxzZSBpZiAocGFydCA9PT0gJy4uJykge1xuICAgICAgdXArKztcbiAgICB9IGVsc2UgaWYgKHVwID4gMCkge1xuICAgICAgaWYgKHBhcnQgPT09ICcnKSB7XG4gICAgICAgIC8vIFRoZSBmaXJzdCBwYXJ0IGlzIGJsYW5rIGlmIHRoZSBwYXRoIGlzIGFic29sdXRlLiBUcnlpbmcgdG8gZ29cbiAgICAgICAgLy8gYWJvdmUgdGhlIHJvb3QgaXMgYSBuby1vcC4gVGhlcmVmb3JlIHdlIGNhbiByZW1vdmUgYWxsICcuLicgcGFydHNcbiAgICAgICAgLy8gZGlyZWN0bHkgYWZ0ZXIgdGhlIHJvb3QuXG4gICAgICAgIHBhcnRzLnNwbGljZShpICsgMSwgdXApO1xuICAgICAgICB1cCA9IDA7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBwYXJ0cy5zcGxpY2UoaSwgMik7XG4gICAgICAgIHVwLS07XG4gICAgICB9XG4gICAgfVxuICB9XG4gIHBhdGggPSBwYXJ0cy5qb2luKCcvJyk7XG5cbiAgaWYgKHBhdGggPT09ICcnKSB7XG4gICAgcGF0aCA9IGlzQWJzb2x1dGUgPyAnLycgOiAnLic7XG4gIH1cblxuICBpZiAodXJsKSB7XG4gICAgdXJsLnBhdGggPSBwYXRoO1xuICAgIHJldHVybiB1cmxHZW5lcmF0ZSh1cmwpO1xuICB9XG4gIHJldHVybiBwYXRoO1xufSk7XG5leHBvcnRzLm5vcm1hbGl6ZSA9IG5vcm1hbGl6ZTtcblxuLyoqXG4gKiBKb2lucyB0d28gcGF0aHMvVVJMcy5cbiAqXG4gKiBAcGFyYW0gYVJvb3QgVGhlIHJvb3QgcGF0aCBvciBVUkwuXG4gKiBAcGFyYW0gYVBhdGggVGhlIHBhdGggb3IgVVJMIHRvIGJlIGpvaW5lZCB3aXRoIHRoZSByb290LlxuICpcbiAqIC0gSWYgYVBhdGggaXMgYSBVUkwgb3IgYSBkYXRhIFVSSSwgYVBhdGggaXMgcmV0dXJuZWQsIHVubGVzcyBhUGF0aCBpcyBhXG4gKiAgIHNjaGVtZS1yZWxhdGl2ZSBVUkw6IFRoZW4gdGhlIHNjaGVtZSBvZiBhUm9vdCwgaWYgYW55LCBpcyBwcmVwZW5kZWRcbiAqICAgZmlyc3QuXG4gKiAtIE90aGVyd2lzZSBhUGF0aCBpcyBhIHBhdGguIElmIGFSb290IGlzIGEgVVJMLCB0aGVuIGl0cyBwYXRoIHBvcnRpb25cbiAqICAgaXMgdXBkYXRlZCB3aXRoIHRoZSByZXN1bHQgYW5kIGFSb290IGlzIHJldHVybmVkLiBPdGhlcndpc2UgdGhlIHJlc3VsdFxuICogICBpcyByZXR1cm5lZC5cbiAqICAgLSBJZiBhUGF0aCBpcyBhYnNvbHV0ZSwgdGhlIHJlc3VsdCBpcyBhUGF0aC5cbiAqICAgLSBPdGhlcndpc2UgdGhlIHR3byBwYXRocyBhcmUgam9pbmVkIHdpdGggYSBzbGFzaC5cbiAqIC0gSm9pbmluZyBmb3IgZXhhbXBsZSAnaHR0cDovLycgYW5kICd3d3cuZXhhbXBsZS5jb20nIGlzIGFsc28gc3VwcG9ydGVkLlxuICovXG5mdW5jdGlvbiBqb2luKGFSb290LCBhUGF0aCkge1xuICBpZiAoYVJvb3QgPT09IFwiXCIpIHtcbiAgICBhUm9vdCA9IFwiLlwiO1xuICB9XG4gIGlmIChhUGF0aCA9PT0gXCJcIikge1xuICAgIGFQYXRoID0gXCIuXCI7XG4gIH1cbiAgdmFyIGFQYXRoVXJsID0gdXJsUGFyc2UoYVBhdGgpO1xuICB2YXIgYVJvb3RVcmwgPSB1cmxQYXJzZShhUm9vdCk7XG4gIGlmIChhUm9vdFVybCkge1xuICAgIGFSb290ID0gYVJvb3RVcmwucGF0aCB8fCAnLyc7XG4gIH1cblxuICAvLyBgam9pbihmb28sICcvL3d3dy5leGFtcGxlLm9yZycpYFxuICBpZiAoYVBhdGhVcmwgJiYgIWFQYXRoVXJsLnNjaGVtZSkge1xuICAgIGlmIChhUm9vdFVybCkge1xuICAgICAgYVBhdGhVcmwuc2NoZW1lID0gYVJvb3RVcmwuc2NoZW1lO1xuICAgIH1cbiAgICByZXR1cm4gdXJsR2VuZXJhdGUoYVBhdGhVcmwpO1xuICB9XG5cbiAgaWYgKGFQYXRoVXJsIHx8IGFQYXRoLm1hdGNoKGRhdGFVcmxSZWdleHApKSB7XG4gICAgcmV0dXJuIGFQYXRoO1xuICB9XG5cbiAgLy8gYGpvaW4oJ2h0dHA6Ly8nLCAnd3d3LmV4YW1wbGUuY29tJylgXG4gIGlmIChhUm9vdFVybCAmJiAhYVJvb3RVcmwuaG9zdCAmJiAhYVJvb3RVcmwucGF0aCkge1xuICAgIGFSb290VXJsLmhvc3QgPSBhUGF0aDtcbiAgICByZXR1cm4gdXJsR2VuZXJhdGUoYVJvb3RVcmwpO1xuICB9XG5cbiAgdmFyIGpvaW5lZCA9IGFQYXRoLmNoYXJBdCgwKSA9PT0gJy8nXG4gICAgPyBhUGF0aFxuICAgIDogbm9ybWFsaXplKGFSb290LnJlcGxhY2UoL1xcLyskLywgJycpICsgJy8nICsgYVBhdGgpO1xuXG4gIGlmIChhUm9vdFVybCkge1xuICAgIGFSb290VXJsLnBhdGggPSBqb2luZWQ7XG4gICAgcmV0dXJuIHVybEdlbmVyYXRlKGFSb290VXJsKTtcbiAgfVxuICByZXR1cm4gam9pbmVkO1xufVxuZXhwb3J0cy5qb2luID0gam9pbjtcblxuZXhwb3J0cy5pc0Fic29sdXRlID0gZnVuY3Rpb24gKGFQYXRoKSB7XG4gIHJldHVybiBhUGF0aC5jaGFyQXQoMCkgPT09ICcvJyB8fCB1cmxSZWdleHAudGVzdChhUGF0aCk7XG59O1xuXG4vKipcbiAqIE1ha2UgYSBwYXRoIHJlbGF0aXZlIHRvIGEgVVJMIG9yIGFub3RoZXIgcGF0aC5cbiAqXG4gKiBAcGFyYW0gYVJvb3QgVGhlIHJvb3QgcGF0aCBvciBVUkwuXG4gKiBAcGFyYW0gYVBhdGggVGhlIHBhdGggb3IgVVJMIHRvIGJlIG1hZGUgcmVsYXRpdmUgdG8gYVJvb3QuXG4gKi9cbmZ1bmN0aW9uIHJlbGF0aXZlKGFSb290LCBhUGF0aCkge1xuICBpZiAoYVJvb3QgPT09IFwiXCIpIHtcbiAgICBhUm9vdCA9IFwiLlwiO1xuICB9XG5cbiAgYVJvb3QgPSBhUm9vdC5yZXBsYWNlKC9cXC8kLywgJycpO1xuXG4gIC8vIEl0IGlzIHBvc3NpYmxlIGZvciB0aGUgcGF0aCB0byBiZSBhYm92ZSB0aGUgcm9vdC4gSW4gdGhpcyBjYXNlLCBzaW1wbHlcbiAgLy8gY2hlY2tpbmcgd2hldGhlciB0aGUgcm9vdCBpcyBhIHByZWZpeCBvZiB0aGUgcGF0aCB3b24ndCB3b3JrLiBJbnN0ZWFkLCB3ZVxuICAvLyBuZWVkIHRvIHJlbW92ZSBjb21wb25lbnRzIGZyb20gdGhlIHJvb3Qgb25lIGJ5IG9uZSwgdW50aWwgZWl0aGVyIHdlIGZpbmRcbiAgLy8gYSBwcmVmaXggdGhhdCBmaXRzLCBvciB3ZSBydW4gb3V0IG9mIGNvbXBvbmVudHMgdG8gcmVtb3ZlLlxuICB2YXIgbGV2ZWwgPSAwO1xuICB3aGlsZSAoYVBhdGguaW5kZXhPZihhUm9vdCArICcvJykgIT09IDApIHtcbiAgICB2YXIgaW5kZXggPSBhUm9vdC5sYXN0SW5kZXhPZihcIi9cIik7XG4gICAgaWYgKGluZGV4IDwgMCkge1xuICAgICAgcmV0dXJuIGFQYXRoO1xuICAgIH1cblxuICAgIC8vIElmIHRoZSBvbmx5IHBhcnQgb2YgdGhlIHJvb3QgdGhhdCBpcyBsZWZ0IGlzIHRoZSBzY2hlbWUgKGkuZS4gaHR0cDovLyxcbiAgICAvLyBmaWxlOi8vLywgZXRjLiksIG9uZSBvciBtb3JlIHNsYXNoZXMgKC8pLCBvciBzaW1wbHkgbm90aGluZyBhdCBhbGwsIHdlXG4gICAgLy8gaGF2ZSBleGhhdXN0ZWQgYWxsIGNvbXBvbmVudHMsIHNvIHRoZSBwYXRoIGlzIG5vdCByZWxhdGl2ZSB0byB0aGUgcm9vdC5cbiAgICBhUm9vdCA9IGFSb290LnNsaWNlKDAsIGluZGV4KTtcbiAgICBpZiAoYVJvb3QubWF0Y2goL14oW15cXC9dKzpcXC8pP1xcLyokLykpIHtcbiAgICAgIHJldHVybiBhUGF0aDtcbiAgICB9XG5cbiAgICArK2xldmVsO1xuICB9XG5cbiAgLy8gTWFrZSBzdXJlIHdlIGFkZCBhIFwiLi4vXCIgZm9yIGVhY2ggY29tcG9uZW50IHdlIHJlbW92ZWQgZnJvbSB0aGUgcm9vdC5cbiAgcmV0dXJuIEFycmF5KGxldmVsICsgMSkuam9pbihcIi4uL1wiKSArIGFQYXRoLnN1YnN0cihhUm9vdC5sZW5ndGggKyAxKTtcbn1cbmV4cG9ydHMucmVsYXRpdmUgPSByZWxhdGl2ZTtcblxudmFyIHN1cHBvcnRzTnVsbFByb3RvID0gKGZ1bmN0aW9uICgpIHtcbiAgdmFyIG9iaiA9IE9iamVjdC5jcmVhdGUobnVsbCk7XG4gIHJldHVybiAhKCdfX3Byb3RvX18nIGluIG9iaik7XG59KCkpO1xuXG5mdW5jdGlvbiBpZGVudGl0eSAocykge1xuICByZXR1cm4gcztcbn1cblxuLyoqXG4gKiBCZWNhdXNlIGJlaGF2aW9yIGdvZXMgd2Fja3kgd2hlbiB5b3Ugc2V0IGBfX3Byb3RvX19gIG9uIG9iamVjdHMsIHdlXG4gKiBoYXZlIHRvIHByZWZpeCBhbGwgdGhlIHN0cmluZ3MgaW4gb3VyIHNldCB3aXRoIGFuIGFyYml0cmFyeSBjaGFyYWN0ZXIuXG4gKlxuICogU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9tb3ppbGxhL3NvdXJjZS1tYXAvcHVsbC8zMSBhbmRcbiAqIGh0dHBzOi8vZ2l0aHViLmNvbS9tb3ppbGxhL3NvdXJjZS1tYXAvaXNzdWVzLzMwXG4gKlxuICogQHBhcmFtIFN0cmluZyBhU3RyXG4gKi9cbmZ1bmN0aW9uIHRvU2V0U3RyaW5nKGFTdHIpIHtcbiAgaWYgKGlzUHJvdG9TdHJpbmcoYVN0cikpIHtcbiAgICByZXR1cm4gJyQnICsgYVN0cjtcbiAgfVxuXG4gIHJldHVybiBhU3RyO1xufVxuZXhwb3J0cy50b1NldFN0cmluZyA9IHN1cHBvcnRzTnVsbFByb3RvID8gaWRlbnRpdHkgOiB0b1NldFN0cmluZztcblxuZnVuY3Rpb24gZnJvbVNldFN0cmluZyhhU3RyKSB7XG4gIGlmIChpc1Byb3RvU3RyaW5nKGFTdHIpKSB7XG4gICAgcmV0dXJuIGFTdHIuc2xpY2UoMSk7XG4gIH1cblxuICByZXR1cm4gYVN0cjtcbn1cbmV4cG9ydHMuZnJvbVNldFN0cmluZyA9IHN1cHBvcnRzTnVsbFByb3RvID8gaWRlbnRpdHkgOiBmcm9tU2V0U3RyaW5nO1xuXG5mdW5jdGlvbiBpc1Byb3RvU3RyaW5nKHMpIHtcbiAgaWYgKCFzKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgdmFyIGxlbmd0aCA9IHMubGVuZ3RoO1xuXG4gIGlmIChsZW5ndGggPCA5IC8qIFwiX19wcm90b19fXCIubGVuZ3RoICovKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgaWYgKHMuY2hhckNvZGVBdChsZW5ndGggLSAxKSAhPT0gOTUgIC8qICdfJyAqLyB8fFxuICAgICAgcy5jaGFyQ29kZUF0KGxlbmd0aCAtIDIpICE9PSA5NSAgLyogJ18nICovIHx8XG4gICAgICBzLmNoYXJDb2RlQXQobGVuZ3RoIC0gMykgIT09IDExMSAvKiAnbycgKi8gfHxcbiAgICAgIHMuY2hhckNvZGVBdChsZW5ndGggLSA0KSAhPT0gMTE2IC8qICd0JyAqLyB8fFxuICAgICAgcy5jaGFyQ29kZUF0KGxlbmd0aCAtIDUpICE9PSAxMTEgLyogJ28nICovIHx8XG4gICAgICBzLmNoYXJDb2RlQXQobGVuZ3RoIC0gNikgIT09IDExNCAvKiAncicgKi8gfHxcbiAgICAgIHMuY2hhckNvZGVBdChsZW5ndGggLSA3KSAhPT0gMTEyIC8qICdwJyAqLyB8fFxuICAgICAgcy5jaGFyQ29kZUF0KGxlbmd0aCAtIDgpICE9PSA5NSAgLyogJ18nICovIHx8XG4gICAgICBzLmNoYXJDb2RlQXQobGVuZ3RoIC0gOSkgIT09IDk1ICAvKiAnXycgKi8pIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBmb3IgKHZhciBpID0gbGVuZ3RoIC0gMTA7IGkgPj0gMDsgaS0tKSB7XG4gICAgaWYgKHMuY2hhckNvZGVBdChpKSAhPT0gMzYgLyogJyQnICovKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHRydWU7XG59XG5cbi8qKlxuICogQ29tcGFyYXRvciBiZXR3ZWVuIHR3byBtYXBwaW5ncyB3aGVyZSB0aGUgb3JpZ2luYWwgcG9zaXRpb25zIGFyZSBjb21wYXJlZC5cbiAqXG4gKiBPcHRpb25hbGx5IHBhc3MgaW4gYHRydWVgIGFzIGBvbmx5Q29tcGFyZUdlbmVyYXRlZGAgdG8gY29uc2lkZXIgdHdvXG4gKiBtYXBwaW5ncyB3aXRoIHRoZSBzYW1lIG9yaWdpbmFsIHNvdXJjZS9saW5lL2NvbHVtbiwgYnV0IGRpZmZlcmVudCBnZW5lcmF0ZWRcbiAqIGxpbmUgYW5kIGNvbHVtbiB0aGUgc2FtZS4gVXNlZnVsIHdoZW4gc2VhcmNoaW5nIGZvciBhIG1hcHBpbmcgd2l0aCBhXG4gKiBzdHViYmVkIG91dCBtYXBwaW5nLlxuICovXG5mdW5jdGlvbiBjb21wYXJlQnlPcmlnaW5hbFBvc2l0aW9ucyhtYXBwaW5nQSwgbWFwcGluZ0IsIG9ubHlDb21wYXJlT3JpZ2luYWwpIHtcbiAgdmFyIGNtcCA9IHN0cmNtcChtYXBwaW5nQS5zb3VyY2UsIG1hcHBpbmdCLnNvdXJjZSk7XG4gIGlmIChjbXAgIT09IDApIHtcbiAgICByZXR1cm4gY21wO1xuICB9XG5cbiAgY21wID0gbWFwcGluZ0Eub3JpZ2luYWxMaW5lIC0gbWFwcGluZ0Iub3JpZ2luYWxMaW5lO1xuICBpZiAoY21wICE9PSAwKSB7XG4gICAgcmV0dXJuIGNtcDtcbiAgfVxuXG4gIGNtcCA9IG1hcHBpbmdBLm9yaWdpbmFsQ29sdW1uIC0gbWFwcGluZ0Iub3JpZ2luYWxDb2x1bW47XG4gIGlmIChjbXAgIT09IDAgfHwgb25seUNvbXBhcmVPcmlnaW5hbCkge1xuICAgIHJldHVybiBjbXA7XG4gIH1cblxuICBjbXAgPSBtYXBwaW5nQS5nZW5lcmF0ZWRDb2x1bW4gLSBtYXBwaW5nQi5nZW5lcmF0ZWRDb2x1bW47XG4gIGlmIChjbXAgIT09IDApIHtcbiAgICByZXR1cm4gY21wO1xuICB9XG5cbiAgY21wID0gbWFwcGluZ0EuZ2VuZXJhdGVkTGluZSAtIG1hcHBpbmdCLmdlbmVyYXRlZExpbmU7XG4gIGlmIChjbXAgIT09IDApIHtcbiAgICByZXR1cm4gY21wO1xuICB9XG5cbiAgcmV0dXJuIHN0cmNtcChtYXBwaW5nQS5uYW1lLCBtYXBwaW5nQi5uYW1lKTtcbn1cbmV4cG9ydHMuY29tcGFyZUJ5T3JpZ2luYWxQb3NpdGlvbnMgPSBjb21wYXJlQnlPcmlnaW5hbFBvc2l0aW9ucztcblxuZnVuY3Rpb24gY29tcGFyZUJ5T3JpZ2luYWxQb3NpdGlvbnNOb1NvdXJjZShtYXBwaW5nQSwgbWFwcGluZ0IsIG9ubHlDb21wYXJlT3JpZ2luYWwpIHtcbiAgdmFyIGNtcFxuXG4gIGNtcCA9IG1hcHBpbmdBLm9yaWdpbmFsTGluZSAtIG1hcHBpbmdCLm9yaWdpbmFsTGluZTtcbiAgaWYgKGNtcCAhPT0gMCkge1xuICAgIHJldHVybiBjbXA7XG4gIH1cblxuICBjbXAgPSBtYXBwaW5nQS5vcmlnaW5hbENvbHVtbiAtIG1hcHBpbmdCLm9yaWdpbmFsQ29sdW1uO1xuICBpZiAoY21wICE9PSAwIHx8IG9ubHlDb21wYXJlT3JpZ2luYWwpIHtcbiAgICByZXR1cm4gY21wO1xuICB9XG5cbiAgY21wID0gbWFwcGluZ0EuZ2VuZXJhdGVkQ29sdW1uIC0gbWFwcGluZ0IuZ2VuZXJhdGVkQ29sdW1uO1xuICBpZiAoY21wICE9PSAwKSB7XG4gICAgcmV0dXJuIGNtcDtcbiAgfVxuXG4gIGNtcCA9IG1hcHBpbmdBLmdlbmVyYXRlZExpbmUgLSBtYXBwaW5nQi5nZW5lcmF0ZWRMaW5lO1xuICBpZiAoY21wICE9PSAwKSB7XG4gICAgcmV0dXJuIGNtcDtcbiAgfVxuXG4gIHJldHVybiBzdHJjbXAobWFwcGluZ0EubmFtZSwgbWFwcGluZ0IubmFtZSk7XG59XG5leHBvcnRzLmNvbXBhcmVCeU9yaWdpbmFsUG9zaXRpb25zTm9Tb3VyY2UgPSBjb21wYXJlQnlPcmlnaW5hbFBvc2l0aW9uc05vU291cmNlO1xuXG4vKipcbiAqIENvbXBhcmF0b3IgYmV0d2VlbiB0d28gbWFwcGluZ3Mgd2l0aCBkZWZsYXRlZCBzb3VyY2UgYW5kIG5hbWUgaW5kaWNlcyB3aGVyZVxuICogdGhlIGdlbmVyYXRlZCBwb3NpdGlvbnMgYXJlIGNvbXBhcmVkLlxuICpcbiAqIE9wdGlvbmFsbHkgcGFzcyBpbiBgdHJ1ZWAgYXMgYG9ubHlDb21wYXJlR2VuZXJhdGVkYCB0byBjb25zaWRlciB0d29cbiAqIG1hcHBpbmdzIHdpdGggdGhlIHNhbWUgZ2VuZXJhdGVkIGxpbmUgYW5kIGNvbHVtbiwgYnV0IGRpZmZlcmVudFxuICogc291cmNlL25hbWUvb3JpZ2luYWwgbGluZSBhbmQgY29sdW1uIHRoZSBzYW1lLiBVc2VmdWwgd2hlbiBzZWFyY2hpbmcgZm9yIGFcbiAqIG1hcHBpbmcgd2l0aCBhIHN0dWJiZWQgb3V0IG1hcHBpbmcuXG4gKi9cbmZ1bmN0aW9uIGNvbXBhcmVCeUdlbmVyYXRlZFBvc2l0aW9uc0RlZmxhdGVkKG1hcHBpbmdBLCBtYXBwaW5nQiwgb25seUNvbXBhcmVHZW5lcmF0ZWQpIHtcbiAgdmFyIGNtcCA9IG1hcHBpbmdBLmdlbmVyYXRlZExpbmUgLSBtYXBwaW5nQi5nZW5lcmF0ZWRMaW5lO1xuICBpZiAoY21wICE9PSAwKSB7XG4gICAgcmV0dXJuIGNtcDtcbiAgfVxuXG4gIGNtcCA9IG1hcHBpbmdBLmdlbmVyYXRlZENvbHVtbiAtIG1hcHBpbmdCLmdlbmVyYXRlZENvbHVtbjtcbiAgaWYgKGNtcCAhPT0gMCB8fCBvbmx5Q29tcGFyZUdlbmVyYXRlZCkge1xuICAgIHJldHVybiBjbXA7XG4gIH1cblxuICBjbXAgPSBzdHJjbXAobWFwcGluZ0Euc291cmNlLCBtYXBwaW5nQi5zb3VyY2UpO1xuICBpZiAoY21wICE9PSAwKSB7XG4gICAgcmV0dXJuIGNtcDtcbiAgfVxuXG4gIGNtcCA9IG1hcHBpbmdBLm9yaWdpbmFsTGluZSAtIG1hcHBpbmdCLm9yaWdpbmFsTGluZTtcbiAgaWYgKGNtcCAhPT0gMCkge1xuICAgIHJldHVybiBjbXA7XG4gIH1cblxuICBjbXAgPSBtYXBwaW5nQS5vcmlnaW5hbENvbHVtbiAtIG1hcHBpbmdCLm9yaWdpbmFsQ29sdW1uO1xuICBpZiAoY21wICE9PSAwKSB7XG4gICAgcmV0dXJuIGNtcDtcbiAgfVxuXG4gIHJldHVybiBzdHJjbXAobWFwcGluZ0EubmFtZSwgbWFwcGluZ0IubmFtZSk7XG59XG5leHBvcnRzLmNvbXBhcmVCeUdlbmVyYXRlZFBvc2l0aW9uc0RlZmxhdGVkID0gY29tcGFyZUJ5R2VuZXJhdGVkUG9zaXRpb25zRGVmbGF0ZWQ7XG5cbmZ1bmN0aW9uIGNvbXBhcmVCeUdlbmVyYXRlZFBvc2l0aW9uc0RlZmxhdGVkTm9MaW5lKG1hcHBpbmdBLCBtYXBwaW5nQiwgb25seUNvbXBhcmVHZW5lcmF0ZWQpIHtcbiAgdmFyIGNtcCA9IG1hcHBpbmdBLmdlbmVyYXRlZENvbHVtbiAtIG1hcHBpbmdCLmdlbmVyYXRlZENvbHVtbjtcbiAgaWYgKGNtcCAhPT0gMCB8fCBvbmx5Q29tcGFyZUdlbmVyYXRlZCkge1xuICAgIHJldHVybiBjbXA7XG4gIH1cblxuICBjbXAgPSBzdHJjbXAobWFwcGluZ0Euc291cmNlLCBtYXBwaW5nQi5zb3VyY2UpO1xuICBpZiAoY21wICE9PSAwKSB7XG4gICAgcmV0dXJuIGNtcDtcbiAgfVxuXG4gIGNtcCA9IG1hcHBpbmdBLm9yaWdpbmFsTGluZSAtIG1hcHBpbmdCLm9yaWdpbmFsTGluZTtcbiAgaWYgKGNtcCAhPT0gMCkge1xuICAgIHJldHVybiBjbXA7XG4gIH1cblxuICBjbXAgPSBtYXBwaW5nQS5vcmlnaW5hbENvbHVtbiAtIG1hcHBpbmdCLm9yaWdpbmFsQ29sdW1uO1xuICBpZiAoY21wICE9PSAwKSB7XG4gICAgcmV0dXJuIGNtcDtcbiAgfVxuXG4gIHJldHVybiBzdHJjbXAobWFwcGluZ0EubmFtZSwgbWFwcGluZ0IubmFtZSk7XG59XG5leHBvcnRzLmNvbXBhcmVCeUdlbmVyYXRlZFBvc2l0aW9uc0RlZmxhdGVkTm9MaW5lID0gY29tcGFyZUJ5R2VuZXJhdGVkUG9zaXRpb25zRGVmbGF0ZWROb0xpbmU7XG5cbmZ1bmN0aW9uIHN0cmNtcChhU3RyMSwgYVN0cjIpIHtcbiAgaWYgKGFTdHIxID09PSBhU3RyMikge1xuICAgIHJldHVybiAwO1xuICB9XG5cbiAgaWYgKGFTdHIxID09PSBudWxsKSB7XG4gICAgcmV0dXJuIDE7IC8vIGFTdHIyICE9PSBudWxsXG4gIH1cblxuICBpZiAoYVN0cjIgPT09IG51bGwpIHtcbiAgICByZXR1cm4gLTE7IC8vIGFTdHIxICE9PSBudWxsXG4gIH1cblxuICBpZiAoYVN0cjEgPiBhU3RyMikge1xuICAgIHJldHVybiAxO1xuICB9XG5cbiAgcmV0dXJuIC0xO1xufVxuXG4vKipcbiAqIENvbXBhcmF0b3IgYmV0d2VlbiB0d28gbWFwcGluZ3Mgd2l0aCBpbmZsYXRlZCBzb3VyY2UgYW5kIG5hbWUgc3RyaW5ncyB3aGVyZVxuICogdGhlIGdlbmVyYXRlZCBwb3NpdGlvbnMgYXJlIGNvbXBhcmVkLlxuICovXG5mdW5jdGlvbiBjb21wYXJlQnlHZW5lcmF0ZWRQb3NpdGlvbnNJbmZsYXRlZChtYXBwaW5nQSwgbWFwcGluZ0IpIHtcbiAgdmFyIGNtcCA9IG1hcHBpbmdBLmdlbmVyYXRlZExpbmUgLSBtYXBwaW5nQi5nZW5lcmF0ZWRMaW5lO1xuICBpZiAoY21wICE9PSAwKSB7XG4gICAgcmV0dXJuIGNtcDtcbiAgfVxuXG4gIGNtcCA9IG1hcHBpbmdBLmdlbmVyYXRlZENvbHVtbiAtIG1hcHBpbmdCLmdlbmVyYXRlZENvbHVtbjtcbiAgaWYgKGNtcCAhPT0gMCkge1xuICAgIHJldHVybiBjbXA7XG4gIH1cblxuICBjbXAgPSBzdHJjbXAobWFwcGluZ0Euc291cmNlLCBtYXBwaW5nQi5zb3VyY2UpO1xuICBpZiAoY21wICE9PSAwKSB7XG4gICAgcmV0dXJuIGNtcDtcbiAgfVxuXG4gIGNtcCA9IG1hcHBpbmdBLm9yaWdpbmFsTGluZSAtIG1hcHBpbmdCLm9yaWdpbmFsTGluZTtcbiAgaWYgKGNtcCAhPT0gMCkge1xuICAgIHJldHVybiBjbXA7XG4gIH1cblxuICBjbXAgPSBtYXBwaW5nQS5vcmlnaW5hbENvbHVtbiAtIG1hcHBpbmdCLm9yaWdpbmFsQ29sdW1uO1xuICBpZiAoY21wICE9PSAwKSB7XG4gICAgcmV0dXJuIGNtcDtcbiAgfVxuXG4gIHJldHVybiBzdHJjbXAobWFwcGluZ0EubmFtZSwgbWFwcGluZ0IubmFtZSk7XG59XG5leHBvcnRzLmNvbXBhcmVCeUdlbmVyYXRlZFBvc2l0aW9uc0luZmxhdGVkID0gY29tcGFyZUJ5R2VuZXJhdGVkUG9zaXRpb25zSW5mbGF0ZWQ7XG5cbi8qKlxuICogU3RyaXAgYW55IEpTT04gWFNTSSBhdm9pZGFuY2UgcHJlZml4IGZyb20gdGhlIHN0cmluZyAoYXMgZG9jdW1lbnRlZFxuICogaW4gdGhlIHNvdXJjZSBtYXBzIHNwZWNpZmljYXRpb24pLCBhbmQgdGhlbiBwYXJzZSB0aGUgc3RyaW5nIGFzXG4gKiBKU09OLlxuICovXG5mdW5jdGlvbiBwYXJzZVNvdXJjZU1hcElucHV0KHN0cikge1xuICByZXR1cm4gSlNPTi5wYXJzZShzdHIucmVwbGFjZSgvXlxcKV19J1teXFxuXSpcXG4vLCAnJykpO1xufVxuZXhwb3J0cy5wYXJzZVNvdXJjZU1hcElucHV0ID0gcGFyc2VTb3VyY2VNYXBJbnB1dDtcblxuLyoqXG4gKiBDb21wdXRlIHRoZSBVUkwgb2YgYSBzb3VyY2UgZ2l2ZW4gdGhlIHRoZSBzb3VyY2Ugcm9vdCwgdGhlIHNvdXJjZSdzXG4gKiBVUkwsIGFuZCB0aGUgc291cmNlIG1hcCdzIFVSTC5cbiAqL1xuZnVuY3Rpb24gY29tcHV0ZVNvdXJjZVVSTChzb3VyY2VSb290LCBzb3VyY2VVUkwsIHNvdXJjZU1hcFVSTCkge1xuICBzb3VyY2VVUkwgPSBzb3VyY2VVUkwgfHwgJyc7XG5cbiAgaWYgKHNvdXJjZVJvb3QpIHtcbiAgICAvLyBUaGlzIGZvbGxvd3Mgd2hhdCBDaHJvbWUgZG9lcy5cbiAgICBpZiAoc291cmNlUm9vdFtzb3VyY2VSb290Lmxlbmd0aCAtIDFdICE9PSAnLycgJiYgc291cmNlVVJMWzBdICE9PSAnLycpIHtcbiAgICAgIHNvdXJjZVJvb3QgKz0gJy8nO1xuICAgIH1cbiAgICAvLyBUaGUgc3BlYyBzYXlzOlxuICAgIC8vICAgTGluZSA0OiBBbiBvcHRpb25hbCBzb3VyY2Ugcm9vdCwgdXNlZnVsIGZvciByZWxvY2F0aW5nIHNvdXJjZVxuICAgIC8vICAgZmlsZXMgb24gYSBzZXJ2ZXIgb3IgcmVtb3ZpbmcgcmVwZWF0ZWQgdmFsdWVzIGluIHRoZVxuICAgIC8vICAg4oCcc291cmNlc+KAnSBlbnRyeS4gIFRoaXMgdmFsdWUgaXMgcHJlcGVuZGVkIHRvIHRoZSBpbmRpdmlkdWFsXG4gICAgLy8gICBlbnRyaWVzIGluIHRoZSDigJxzb3VyY2XigJ0gZmllbGQuXG4gICAgc291cmNlVVJMID0gc291cmNlUm9vdCArIHNvdXJjZVVSTDtcbiAgfVxuXG4gIC8vIEhpc3RvcmljYWxseSwgU291cmNlTWFwQ29uc3VtZXIgZGlkIG5vdCB0YWtlIHRoZSBzb3VyY2VNYXBVUkwgYXNcbiAgLy8gYSBwYXJhbWV0ZXIuICBUaGlzIG1vZGUgaXMgc3RpbGwgc29tZXdoYXQgc3VwcG9ydGVkLCB3aGljaCBpcyB3aHlcbiAgLy8gdGhpcyBjb2RlIGJsb2NrIGlzIGNvbmRpdGlvbmFsLiAgSG93ZXZlciwgaXQncyBwcmVmZXJhYmxlIHRvIHBhc3NcbiAgLy8gdGhlIHNvdXJjZSBtYXAgVVJMIHRvIFNvdXJjZU1hcENvbnN1bWVyLCBzbyB0aGF0IHRoaXMgZnVuY3Rpb25cbiAgLy8gY2FuIGltcGxlbWVudCB0aGUgc291cmNlIFVSTCByZXNvbHV0aW9uIGFsZ29yaXRobSBhcyBvdXRsaW5lZCBpblxuICAvLyB0aGUgc3BlYy4gIFRoaXMgYmxvY2sgaXMgYmFzaWNhbGx5IHRoZSBlcXVpdmFsZW50IG9mOlxuICAvLyAgICBuZXcgVVJMKHNvdXJjZVVSTCwgc291cmNlTWFwVVJMKS50b1N0cmluZygpXG4gIC8vIC4uLiBleGNlcHQgaXQgYXZvaWRzIHVzaW5nIFVSTCwgd2hpY2ggd2Fzbid0IGF2YWlsYWJsZSBpbiB0aGVcbiAgLy8gb2xkZXIgcmVsZWFzZXMgb2Ygbm9kZSBzdGlsbCBzdXBwb3J0ZWQgYnkgdGhpcyBsaWJyYXJ5LlxuICAvL1xuICAvLyBUaGUgc3BlYyBzYXlzOlxuICAvLyAgIElmIHRoZSBzb3VyY2VzIGFyZSBub3QgYWJzb2x1dGUgVVJMcyBhZnRlciBwcmVwZW5kaW5nIG9mIHRoZVxuICAvLyAgIOKAnHNvdXJjZVJvb3TigJ0sIHRoZSBzb3VyY2VzIGFyZSByZXNvbHZlZCByZWxhdGl2ZSB0byB0aGVcbiAgLy8gICBTb3VyY2VNYXAgKGxpa2UgcmVzb2x2aW5nIHNjcmlwdCBzcmMgaW4gYSBodG1sIGRvY3VtZW50KS5cbiAgaWYgKHNvdXJjZU1hcFVSTCkge1xuICAgIHZhciBwYXJzZWQgPSB1cmxQYXJzZShzb3VyY2VNYXBVUkwpO1xuICAgIGlmICghcGFyc2VkKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJzb3VyY2VNYXBVUkwgY291bGQgbm90IGJlIHBhcnNlZFwiKTtcbiAgICB9XG4gICAgaWYgKHBhcnNlZC5wYXRoKSB7XG4gICAgICAvLyBTdHJpcCB0aGUgbGFzdCBwYXRoIGNvbXBvbmVudCwgYnV0IGtlZXAgdGhlIFwiL1wiLlxuICAgICAgdmFyIGluZGV4ID0gcGFyc2VkLnBhdGgubGFzdEluZGV4T2YoJy8nKTtcbiAgICAgIGlmIChpbmRleCA+PSAwKSB7XG4gICAgICAgIHBhcnNlZC5wYXRoID0gcGFyc2VkLnBhdGguc3Vic3RyaW5nKDAsIGluZGV4ICsgMSk7XG4gICAgICB9XG4gICAgfVxuICAgIHNvdXJjZVVSTCA9IGpvaW4odXJsR2VuZXJhdGUocGFyc2VkKSwgc291cmNlVVJMKTtcbiAgfVxuXG4gIHJldHVybiBub3JtYWxpemUoc291cmNlVVJMKTtcbn1cbmV4cG9ydHMuY29tcHV0ZVNvdXJjZVVSTCA9IGNvbXB1dGVTb3VyY2VVUkw7XG4iLCIvKiAtKi0gTW9kZToganM7IGpzLWluZGVudC1sZXZlbDogMjsgLSotICovXG4vKlxuICogQ29weXJpZ2h0IDIwMTEgTW96aWxsYSBGb3VuZGF0aW9uIGFuZCBjb250cmlidXRvcnNcbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBOZXcgQlNEIGxpY2Vuc2UuIFNlZSBMSUNFTlNFIG9yOlxuICogaHR0cDovL29wZW5zb3VyY2Uub3JnL2xpY2Vuc2VzL0JTRC0zLUNsYXVzZVxuICovXG5cbnZhciB1dGlsID0gcmVxdWlyZSgnLi91dGlsJyk7XG52YXIgaGFzID0gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eTtcbnZhciBoYXNOYXRpdmVNYXAgPSB0eXBlb2YgTWFwICE9PSBcInVuZGVmaW5lZFwiO1xuXG4vKipcbiAqIEEgZGF0YSBzdHJ1Y3R1cmUgd2hpY2ggaXMgYSBjb21iaW5hdGlvbiBvZiBhbiBhcnJheSBhbmQgYSBzZXQuIEFkZGluZyBhIG5ld1xuICogbWVtYmVyIGlzIE8oMSksIHRlc3RpbmcgZm9yIG1lbWJlcnNoaXAgaXMgTygxKSwgYW5kIGZpbmRpbmcgdGhlIGluZGV4IG9mIGFuXG4gKiBlbGVtZW50IGlzIE8oMSkuIFJlbW92aW5nIGVsZW1lbnRzIGZyb20gdGhlIHNldCBpcyBub3Qgc3VwcG9ydGVkLiBPbmx5XG4gKiBzdHJpbmdzIGFyZSBzdXBwb3J0ZWQgZm9yIG1lbWJlcnNoaXAuXG4gKi9cbmZ1bmN0aW9uIEFycmF5U2V0KCkge1xuICB0aGlzLl9hcnJheSA9IFtdO1xuICB0aGlzLl9zZXQgPSBoYXNOYXRpdmVNYXAgPyBuZXcgTWFwKCkgOiBPYmplY3QuY3JlYXRlKG51bGwpO1xufVxuXG4vKipcbiAqIFN0YXRpYyBtZXRob2QgZm9yIGNyZWF0aW5nIEFycmF5U2V0IGluc3RhbmNlcyBmcm9tIGFuIGV4aXN0aW5nIGFycmF5LlxuICovXG5BcnJheVNldC5mcm9tQXJyYXkgPSBmdW5jdGlvbiBBcnJheVNldF9mcm9tQXJyYXkoYUFycmF5LCBhQWxsb3dEdXBsaWNhdGVzKSB7XG4gIHZhciBzZXQgPSBuZXcgQXJyYXlTZXQoKTtcbiAgZm9yICh2YXIgaSA9IDAsIGxlbiA9IGFBcnJheS5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICAgIHNldC5hZGQoYUFycmF5W2ldLCBhQWxsb3dEdXBsaWNhdGVzKTtcbiAgfVxuICByZXR1cm4gc2V0O1xufTtcblxuLyoqXG4gKiBSZXR1cm4gaG93IG1hbnkgdW5pcXVlIGl0ZW1zIGFyZSBpbiB0aGlzIEFycmF5U2V0LiBJZiBkdXBsaWNhdGVzIGhhdmUgYmVlblxuICogYWRkZWQsIHRoYW4gdGhvc2UgZG8gbm90IGNvdW50IHRvd2FyZHMgdGhlIHNpemUuXG4gKlxuICogQHJldHVybnMgTnVtYmVyXG4gKi9cbkFycmF5U2V0LnByb3RvdHlwZS5zaXplID0gZnVuY3Rpb24gQXJyYXlTZXRfc2l6ZSgpIHtcbiAgcmV0dXJuIGhhc05hdGl2ZU1hcCA/IHRoaXMuX3NldC5zaXplIDogT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXModGhpcy5fc2V0KS5sZW5ndGg7XG59O1xuXG4vKipcbiAqIEFkZCB0aGUgZ2l2ZW4gc3RyaW5nIHRvIHRoaXMgc2V0LlxuICpcbiAqIEBwYXJhbSBTdHJpbmcgYVN0clxuICovXG5BcnJheVNldC5wcm90b3R5cGUuYWRkID0gZnVuY3Rpb24gQXJyYXlTZXRfYWRkKGFTdHIsIGFBbGxvd0R1cGxpY2F0ZXMpIHtcbiAgdmFyIHNTdHIgPSBoYXNOYXRpdmVNYXAgPyBhU3RyIDogdXRpbC50b1NldFN0cmluZyhhU3RyKTtcbiAgdmFyIGlzRHVwbGljYXRlID0gaGFzTmF0aXZlTWFwID8gdGhpcy5oYXMoYVN0cikgOiBoYXMuY2FsbCh0aGlzLl9zZXQsIHNTdHIpO1xuICB2YXIgaWR4ID0gdGhpcy5fYXJyYXkubGVuZ3RoO1xuICBpZiAoIWlzRHVwbGljYXRlIHx8IGFBbGxvd0R1cGxpY2F0ZXMpIHtcbiAgICB0aGlzLl9hcnJheS5wdXNoKGFTdHIpO1xuICB9XG4gIGlmICghaXNEdXBsaWNhdGUpIHtcbiAgICBpZiAoaGFzTmF0aXZlTWFwKSB7XG4gICAgICB0aGlzLl9zZXQuc2V0KGFTdHIsIGlkeCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuX3NldFtzU3RyXSA9IGlkeDtcbiAgICB9XG4gIH1cbn07XG5cbi8qKlxuICogSXMgdGhlIGdpdmVuIHN0cmluZyBhIG1lbWJlciBvZiB0aGlzIHNldD9cbiAqXG4gKiBAcGFyYW0gU3RyaW5nIGFTdHJcbiAqL1xuQXJyYXlTZXQucHJvdG90eXBlLmhhcyA9IGZ1bmN0aW9uIEFycmF5U2V0X2hhcyhhU3RyKSB7XG4gIGlmIChoYXNOYXRpdmVNYXApIHtcbiAgICByZXR1cm4gdGhpcy5fc2V0LmhhcyhhU3RyKTtcbiAgfSBlbHNlIHtcbiAgICB2YXIgc1N0ciA9IHV0aWwudG9TZXRTdHJpbmcoYVN0cik7XG4gICAgcmV0dXJuIGhhcy5jYWxsKHRoaXMuX3NldCwgc1N0cik7XG4gIH1cbn07XG5cbi8qKlxuICogV2hhdCBpcyB0aGUgaW5kZXggb2YgdGhlIGdpdmVuIHN0cmluZyBpbiB0aGUgYXJyYXk/XG4gKlxuICogQHBhcmFtIFN0cmluZyBhU3RyXG4gKi9cbkFycmF5U2V0LnByb3RvdHlwZS5pbmRleE9mID0gZnVuY3Rpb24gQXJyYXlTZXRfaW5kZXhPZihhU3RyKSB7XG4gIGlmIChoYXNOYXRpdmVNYXApIHtcbiAgICB2YXIgaWR4ID0gdGhpcy5fc2V0LmdldChhU3RyKTtcbiAgICBpZiAoaWR4ID49IDApIHtcbiAgICAgICAgcmV0dXJuIGlkeDtcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgdmFyIHNTdHIgPSB1dGlsLnRvU2V0U3RyaW5nKGFTdHIpO1xuICAgIGlmIChoYXMuY2FsbCh0aGlzLl9zZXQsIHNTdHIpKSB7XG4gICAgICByZXR1cm4gdGhpcy5fc2V0W3NTdHJdO1xuICAgIH1cbiAgfVxuXG4gIHRocm93IG5ldyBFcnJvcignXCInICsgYVN0ciArICdcIiBpcyBub3QgaW4gdGhlIHNldC4nKTtcbn07XG5cbi8qKlxuICogV2hhdCBpcyB0aGUgZWxlbWVudCBhdCB0aGUgZ2l2ZW4gaW5kZXg/XG4gKlxuICogQHBhcmFtIE51bWJlciBhSWR4XG4gKi9cbkFycmF5U2V0LnByb3RvdHlwZS5hdCA9IGZ1bmN0aW9uIEFycmF5U2V0X2F0KGFJZHgpIHtcbiAgaWYgKGFJZHggPj0gMCAmJiBhSWR4IDwgdGhpcy5fYXJyYXkubGVuZ3RoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2FycmF5W2FJZHhdO1xuICB9XG4gIHRocm93IG5ldyBFcnJvcignTm8gZWxlbWVudCBpbmRleGVkIGJ5ICcgKyBhSWR4KTtcbn07XG5cbi8qKlxuICogUmV0dXJucyB0aGUgYXJyYXkgcmVwcmVzZW50YXRpb24gb2YgdGhpcyBzZXQgKHdoaWNoIGhhcyB0aGUgcHJvcGVyIGluZGljZXNcbiAqIGluZGljYXRlZCBieSBpbmRleE9mKS4gTm90ZSB0aGF0IHRoaXMgaXMgYSBjb3B5IG9mIHRoZSBpbnRlcm5hbCBhcnJheSB1c2VkXG4gKiBmb3Igc3RvcmluZyB0aGUgbWVtYmVycyBzbyB0aGF0IG5vIG9uZSBjYW4gbWVzcyB3aXRoIGludGVybmFsIHN0YXRlLlxuICovXG5BcnJheVNldC5wcm90b3R5cGUudG9BcnJheSA9IGZ1bmN0aW9uIEFycmF5U2V0X3RvQXJyYXkoKSB7XG4gIHJldHVybiB0aGlzLl9hcnJheS5zbGljZSgpO1xufTtcblxuZXhwb3J0cy5BcnJheVNldCA9IEFycmF5U2V0O1xuIiwiLyogLSotIE1vZGU6IGpzOyBqcy1pbmRlbnQtbGV2ZWw6IDI7IC0qLSAqL1xuLypcbiAqIENvcHlyaWdodCAyMDE0IE1vemlsbGEgRm91bmRhdGlvbiBhbmQgY29udHJpYnV0b3JzXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgTmV3IEJTRCBsaWNlbnNlLiBTZWUgTElDRU5TRSBvcjpcbiAqIGh0dHA6Ly9vcGVuc291cmNlLm9yZy9saWNlbnNlcy9CU0QtMy1DbGF1c2VcbiAqL1xuXG52YXIgdXRpbCA9IHJlcXVpcmUoJy4vdXRpbCcpO1xuXG4vKipcbiAqIERldGVybWluZSB3aGV0aGVyIG1hcHBpbmdCIGlzIGFmdGVyIG1hcHBpbmdBIHdpdGggcmVzcGVjdCB0byBnZW5lcmF0ZWRcbiAqIHBvc2l0aW9uLlxuICovXG5mdW5jdGlvbiBnZW5lcmF0ZWRQb3NpdGlvbkFmdGVyKG1hcHBpbmdBLCBtYXBwaW5nQikge1xuICAvLyBPcHRpbWl6ZWQgZm9yIG1vc3QgY29tbW9uIGNhc2VcbiAgdmFyIGxpbmVBID0gbWFwcGluZ0EuZ2VuZXJhdGVkTGluZTtcbiAgdmFyIGxpbmVCID0gbWFwcGluZ0IuZ2VuZXJhdGVkTGluZTtcbiAgdmFyIGNvbHVtbkEgPSBtYXBwaW5nQS5nZW5lcmF0ZWRDb2x1bW47XG4gIHZhciBjb2x1bW5CID0gbWFwcGluZ0IuZ2VuZXJhdGVkQ29sdW1uO1xuICByZXR1cm4gbGluZUIgPiBsaW5lQSB8fCBsaW5lQiA9PSBsaW5lQSAmJiBjb2x1bW5CID49IGNvbHVtbkEgfHxcbiAgICAgICAgIHV0aWwuY29tcGFyZUJ5R2VuZXJhdGVkUG9zaXRpb25zSW5mbGF0ZWQobWFwcGluZ0EsIG1hcHBpbmdCKSA8PSAwO1xufVxuXG4vKipcbiAqIEEgZGF0YSBzdHJ1Y3R1cmUgdG8gcHJvdmlkZSBhIHNvcnRlZCB2aWV3IG9mIGFjY3VtdWxhdGVkIG1hcHBpbmdzIGluIGFcbiAqIHBlcmZvcm1hbmNlIGNvbnNjaW91cyBtYW5uZXIuIEl0IHRyYWRlcyBhIG5lZ2xpYmFibGUgb3ZlcmhlYWQgaW4gZ2VuZXJhbFxuICogY2FzZSBmb3IgYSBsYXJnZSBzcGVlZHVwIGluIGNhc2Ugb2YgbWFwcGluZ3MgYmVpbmcgYWRkZWQgaW4gb3JkZXIuXG4gKi9cbmZ1bmN0aW9uIE1hcHBpbmdMaXN0KCkge1xuICB0aGlzLl9hcnJheSA9IFtdO1xuICB0aGlzLl9zb3J0ZWQgPSB0cnVlO1xuICAvLyBTZXJ2ZXMgYXMgaW5maW11bVxuICB0aGlzLl9sYXN0ID0ge2dlbmVyYXRlZExpbmU6IC0xLCBnZW5lcmF0ZWRDb2x1bW46IDB9O1xufVxuXG4vKipcbiAqIEl0ZXJhdGUgdGhyb3VnaCBpbnRlcm5hbCBpdGVtcy4gVGhpcyBtZXRob2QgdGFrZXMgdGhlIHNhbWUgYXJndW1lbnRzIHRoYXRcbiAqIGBBcnJheS5wcm90b3R5cGUuZm9yRWFjaGAgdGFrZXMuXG4gKlxuICogTk9URTogVGhlIG9yZGVyIG9mIHRoZSBtYXBwaW5ncyBpcyBOT1QgZ3VhcmFudGVlZC5cbiAqL1xuTWFwcGluZ0xpc3QucHJvdG90eXBlLnVuc29ydGVkRm9yRWFjaCA9XG4gIGZ1bmN0aW9uIE1hcHBpbmdMaXN0X2ZvckVhY2goYUNhbGxiYWNrLCBhVGhpc0FyZykge1xuICAgIHRoaXMuX2FycmF5LmZvckVhY2goYUNhbGxiYWNrLCBhVGhpc0FyZyk7XG4gIH07XG5cbi8qKlxuICogQWRkIHRoZSBnaXZlbiBzb3VyY2UgbWFwcGluZy5cbiAqXG4gKiBAcGFyYW0gT2JqZWN0IGFNYXBwaW5nXG4gKi9cbk1hcHBpbmdMaXN0LnByb3RvdHlwZS5hZGQgPSBmdW5jdGlvbiBNYXBwaW5nTGlzdF9hZGQoYU1hcHBpbmcpIHtcbiAgaWYgKGdlbmVyYXRlZFBvc2l0aW9uQWZ0ZXIodGhpcy5fbGFzdCwgYU1hcHBpbmcpKSB7XG4gICAgdGhpcy5fbGFzdCA9IGFNYXBwaW5nO1xuICAgIHRoaXMuX2FycmF5LnB1c2goYU1hcHBpbmcpO1xuICB9IGVsc2Uge1xuICAgIHRoaXMuX3NvcnRlZCA9IGZhbHNlO1xuICAgIHRoaXMuX2FycmF5LnB1c2goYU1hcHBpbmcpO1xuICB9XG59O1xuXG4vKipcbiAqIFJldHVybnMgdGhlIGZsYXQsIHNvcnRlZCBhcnJheSBvZiBtYXBwaW5ncy4gVGhlIG1hcHBpbmdzIGFyZSBzb3J0ZWQgYnlcbiAqIGdlbmVyYXRlZCBwb3NpdGlvbi5cbiAqXG4gKiBXQVJOSU5HOiBUaGlzIG1ldGhvZCByZXR1cm5zIGludGVybmFsIGRhdGEgd2l0aG91dCBjb3B5aW5nLCBmb3JcbiAqIHBlcmZvcm1hbmNlLiBUaGUgcmV0dXJuIHZhbHVlIG11c3QgTk9UIGJlIG11dGF0ZWQsIGFuZCBzaG91bGQgYmUgdHJlYXRlZCBhc1xuICogYW4gaW1tdXRhYmxlIGJvcnJvdy4gSWYgeW91IHdhbnQgdG8gdGFrZSBvd25lcnNoaXAsIHlvdSBtdXN0IG1ha2UgeW91ciBvd25cbiAqIGNvcHkuXG4gKi9cbk1hcHBpbmdMaXN0LnByb3RvdHlwZS50b0FycmF5ID0gZnVuY3Rpb24gTWFwcGluZ0xpc3RfdG9BcnJheSgpIHtcbiAgaWYgKCF0aGlzLl9zb3J0ZWQpIHtcbiAgICB0aGlzLl9hcnJheS5zb3J0KHV0aWwuY29tcGFyZUJ5R2VuZXJhdGVkUG9zaXRpb25zSW5mbGF0ZWQpO1xuICAgIHRoaXMuX3NvcnRlZCA9IHRydWU7XG4gIH1cbiAgcmV0dXJuIHRoaXMuX2FycmF5O1xufTtcblxuZXhwb3J0cy5NYXBwaW5nTGlzdCA9IE1hcHBpbmdMaXN0O1xuIiwiLyogLSotIE1vZGU6IGpzOyBqcy1pbmRlbnQtbGV2ZWw6IDI7IC0qLSAqL1xuLypcbiAqIENvcHlyaWdodCAyMDExIE1vemlsbGEgRm91bmRhdGlvbiBhbmQgY29udHJpYnV0b3JzXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgTmV3IEJTRCBsaWNlbnNlLiBTZWUgTElDRU5TRSBvcjpcbiAqIGh0dHA6Ly9vcGVuc291cmNlLm9yZy9saWNlbnNlcy9CU0QtMy1DbGF1c2VcbiAqL1xuXG52YXIgYmFzZTY0VkxRID0gcmVxdWlyZSgnLi9iYXNlNjQtdmxxJyk7XG52YXIgdXRpbCA9IHJlcXVpcmUoJy4vdXRpbCcpO1xudmFyIEFycmF5U2V0ID0gcmVxdWlyZSgnLi9hcnJheS1zZXQnKS5BcnJheVNldDtcbnZhciBNYXBwaW5nTGlzdCA9IHJlcXVpcmUoJy4vbWFwcGluZy1saXN0JykuTWFwcGluZ0xpc3Q7XG5cbi8qKlxuICogQW4gaW5zdGFuY2Ugb2YgdGhlIFNvdXJjZU1hcEdlbmVyYXRvciByZXByZXNlbnRzIGEgc291cmNlIG1hcCB3aGljaCBpc1xuICogYmVpbmcgYnVpbHQgaW5jcmVtZW50YWxseS4gWW91IG1heSBwYXNzIGFuIG9iamVjdCB3aXRoIHRoZSBmb2xsb3dpbmdcbiAqIHByb3BlcnRpZXM6XG4gKlxuICogICAtIGZpbGU6IFRoZSBmaWxlbmFtZSBvZiB0aGUgZ2VuZXJhdGVkIHNvdXJjZS5cbiAqICAgLSBzb3VyY2VSb290OiBBIHJvb3QgZm9yIGFsbCByZWxhdGl2ZSBVUkxzIGluIHRoaXMgc291cmNlIG1hcC5cbiAqL1xuZnVuY3Rpb24gU291cmNlTWFwR2VuZXJhdG9yKGFBcmdzKSB7XG4gIGlmICghYUFyZ3MpIHtcbiAgICBhQXJncyA9IHt9O1xuICB9XG4gIHRoaXMuX2ZpbGUgPSB1dGlsLmdldEFyZyhhQXJncywgJ2ZpbGUnLCBudWxsKTtcbiAgdGhpcy5fc291cmNlUm9vdCA9IHV0aWwuZ2V0QXJnKGFBcmdzLCAnc291cmNlUm9vdCcsIG51bGwpO1xuICB0aGlzLl9za2lwVmFsaWRhdGlvbiA9IHV0aWwuZ2V0QXJnKGFBcmdzLCAnc2tpcFZhbGlkYXRpb24nLCBmYWxzZSk7XG4gIHRoaXMuX3NvdXJjZXMgPSBuZXcgQXJyYXlTZXQoKTtcbiAgdGhpcy5fbmFtZXMgPSBuZXcgQXJyYXlTZXQoKTtcbiAgdGhpcy5fbWFwcGluZ3MgPSBuZXcgTWFwcGluZ0xpc3QoKTtcbiAgdGhpcy5fc291cmNlc0NvbnRlbnRzID0gbnVsbDtcbn1cblxuU291cmNlTWFwR2VuZXJhdG9yLnByb3RvdHlwZS5fdmVyc2lvbiA9IDM7XG5cbi8qKlxuICogQ3JlYXRlcyBhIG5ldyBTb3VyY2VNYXBHZW5lcmF0b3IgYmFzZWQgb24gYSBTb3VyY2VNYXBDb25zdW1lclxuICpcbiAqIEBwYXJhbSBhU291cmNlTWFwQ29uc3VtZXIgVGhlIFNvdXJjZU1hcC5cbiAqL1xuU291cmNlTWFwR2VuZXJhdG9yLmZyb21Tb3VyY2VNYXAgPVxuICBmdW5jdGlvbiBTb3VyY2VNYXBHZW5lcmF0b3JfZnJvbVNvdXJjZU1hcChhU291cmNlTWFwQ29uc3VtZXIpIHtcbiAgICB2YXIgc291cmNlUm9vdCA9IGFTb3VyY2VNYXBDb25zdW1lci5zb3VyY2VSb290O1xuICAgIHZhciBnZW5lcmF0b3IgPSBuZXcgU291cmNlTWFwR2VuZXJhdG9yKHtcbiAgICAgIGZpbGU6IGFTb3VyY2VNYXBDb25zdW1lci5maWxlLFxuICAgICAgc291cmNlUm9vdDogc291cmNlUm9vdFxuICAgIH0pO1xuICAgIGFTb3VyY2VNYXBDb25zdW1lci5lYWNoTWFwcGluZyhmdW5jdGlvbiAobWFwcGluZykge1xuICAgICAgdmFyIG5ld01hcHBpbmcgPSB7XG4gICAgICAgIGdlbmVyYXRlZDoge1xuICAgICAgICAgIGxpbmU6IG1hcHBpbmcuZ2VuZXJhdGVkTGluZSxcbiAgICAgICAgICBjb2x1bW46IG1hcHBpbmcuZ2VuZXJhdGVkQ29sdW1uXG4gICAgICAgIH1cbiAgICAgIH07XG5cbiAgICAgIGlmIChtYXBwaW5nLnNvdXJjZSAhPSBudWxsKSB7XG4gICAgICAgIG5ld01hcHBpbmcuc291cmNlID0gbWFwcGluZy5zb3VyY2U7XG4gICAgICAgIGlmIChzb3VyY2VSb290ICE9IG51bGwpIHtcbiAgICAgICAgICBuZXdNYXBwaW5nLnNvdXJjZSA9IHV0aWwucmVsYXRpdmUoc291cmNlUm9vdCwgbmV3TWFwcGluZy5zb3VyY2UpO1xuICAgICAgICB9XG5cbiAgICAgICAgbmV3TWFwcGluZy5vcmlnaW5hbCA9IHtcbiAgICAgICAgICBsaW5lOiBtYXBwaW5nLm9yaWdpbmFsTGluZSxcbiAgICAgICAgICBjb2x1bW46IG1hcHBpbmcub3JpZ2luYWxDb2x1bW5cbiAgICAgICAgfTtcblxuICAgICAgICBpZiAobWFwcGluZy5uYW1lICE9IG51bGwpIHtcbiAgICAgICAgICBuZXdNYXBwaW5nLm5hbWUgPSBtYXBwaW5nLm5hbWU7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgZ2VuZXJhdG9yLmFkZE1hcHBpbmcobmV3TWFwcGluZyk7XG4gICAgfSk7XG4gICAgYVNvdXJjZU1hcENvbnN1bWVyLnNvdXJjZXMuZm9yRWFjaChmdW5jdGlvbiAoc291cmNlRmlsZSkge1xuICAgICAgdmFyIHNvdXJjZVJlbGF0aXZlID0gc291cmNlRmlsZTtcbiAgICAgIGlmIChzb3VyY2VSb290ICE9PSBudWxsKSB7XG4gICAgICAgIHNvdXJjZVJlbGF0aXZlID0gdXRpbC5yZWxhdGl2ZShzb3VyY2VSb290LCBzb3VyY2VGaWxlKTtcbiAgICAgIH1cblxuICAgICAgaWYgKCFnZW5lcmF0b3IuX3NvdXJjZXMuaGFzKHNvdXJjZVJlbGF0aXZlKSkge1xuICAgICAgICBnZW5lcmF0b3IuX3NvdXJjZXMuYWRkKHNvdXJjZVJlbGF0aXZlKTtcbiAgICAgIH1cblxuICAgICAgdmFyIGNvbnRlbnQgPSBhU291cmNlTWFwQ29uc3VtZXIuc291cmNlQ29udGVudEZvcihzb3VyY2VGaWxlKTtcbiAgICAgIGlmIChjb250ZW50ICE9IG51bGwpIHtcbiAgICAgICAgZ2VuZXJhdG9yLnNldFNvdXJjZUNvbnRlbnQoc291cmNlRmlsZSwgY29udGVudCk7XG4gICAgICB9XG4gICAgfSk7XG4gICAgcmV0dXJuIGdlbmVyYXRvcjtcbiAgfTtcblxuLyoqXG4gKiBBZGQgYSBzaW5nbGUgbWFwcGluZyBmcm9tIG9yaWdpbmFsIHNvdXJjZSBsaW5lIGFuZCBjb2x1bW4gdG8gdGhlIGdlbmVyYXRlZFxuICogc291cmNlJ3MgbGluZSBhbmQgY29sdW1uIGZvciB0aGlzIHNvdXJjZSBtYXAgYmVpbmcgY3JlYXRlZC4gVGhlIG1hcHBpbmdcbiAqIG9iamVjdCBzaG91bGQgaGF2ZSB0aGUgZm9sbG93aW5nIHByb3BlcnRpZXM6XG4gKlxuICogICAtIGdlbmVyYXRlZDogQW4gb2JqZWN0IHdpdGggdGhlIGdlbmVyYXRlZCBsaW5lIGFuZCBjb2x1bW4gcG9zaXRpb25zLlxuICogICAtIG9yaWdpbmFsOiBBbiBvYmplY3Qgd2l0aCB0aGUgb3JpZ2luYWwgbGluZSBhbmQgY29sdW1uIHBvc2l0aW9ucy5cbiAqICAgLSBzb3VyY2U6IFRoZSBvcmlnaW5hbCBzb3VyY2UgZmlsZSAocmVsYXRpdmUgdG8gdGhlIHNvdXJjZVJvb3QpLlxuICogICAtIG5hbWU6IEFuIG9wdGlvbmFsIG9yaWdpbmFsIHRva2VuIG5hbWUgZm9yIHRoaXMgbWFwcGluZy5cbiAqL1xuU291cmNlTWFwR2VuZXJhdG9yLnByb3RvdHlwZS5hZGRNYXBwaW5nID1cbiAgZnVuY3Rpb24gU291cmNlTWFwR2VuZXJhdG9yX2FkZE1hcHBpbmcoYUFyZ3MpIHtcbiAgICB2YXIgZ2VuZXJhdGVkID0gdXRpbC5nZXRBcmcoYUFyZ3MsICdnZW5lcmF0ZWQnKTtcbiAgICB2YXIgb3JpZ2luYWwgPSB1dGlsLmdldEFyZyhhQXJncywgJ29yaWdpbmFsJywgbnVsbCk7XG4gICAgdmFyIHNvdXJjZSA9IHV0aWwuZ2V0QXJnKGFBcmdzLCAnc291cmNlJywgbnVsbCk7XG4gICAgdmFyIG5hbWUgPSB1dGlsLmdldEFyZyhhQXJncywgJ25hbWUnLCBudWxsKTtcblxuICAgIGlmICghdGhpcy5fc2tpcFZhbGlkYXRpb24pIHtcbiAgICAgIHRoaXMuX3ZhbGlkYXRlTWFwcGluZyhnZW5lcmF0ZWQsIG9yaWdpbmFsLCBzb3VyY2UsIG5hbWUpO1xuICAgIH1cblxuICAgIGlmIChzb3VyY2UgIT0gbnVsbCkge1xuICAgICAgc291cmNlID0gU3RyaW5nKHNvdXJjZSk7XG4gICAgICBpZiAoIXRoaXMuX3NvdXJjZXMuaGFzKHNvdXJjZSkpIHtcbiAgICAgICAgdGhpcy5fc291cmNlcy5hZGQoc291cmNlKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAobmFtZSAhPSBudWxsKSB7XG4gICAgICBuYW1lID0gU3RyaW5nKG5hbWUpO1xuICAgICAgaWYgKCF0aGlzLl9uYW1lcy5oYXMobmFtZSkpIHtcbiAgICAgICAgdGhpcy5fbmFtZXMuYWRkKG5hbWUpO1xuICAgICAgfVxuICAgIH1cblxuICAgIHRoaXMuX21hcHBpbmdzLmFkZCh7XG4gICAgICBnZW5lcmF0ZWRMaW5lOiBnZW5lcmF0ZWQubGluZSxcbiAgICAgIGdlbmVyYXRlZENvbHVtbjogZ2VuZXJhdGVkLmNvbHVtbixcbiAgICAgIG9yaWdpbmFsTGluZTogb3JpZ2luYWwgIT0gbnVsbCAmJiBvcmlnaW5hbC5saW5lLFxuICAgICAgb3JpZ2luYWxDb2x1bW46IG9yaWdpbmFsICE9IG51bGwgJiYgb3JpZ2luYWwuY29sdW1uLFxuICAgICAgc291cmNlOiBzb3VyY2UsXG4gICAgICBuYW1lOiBuYW1lXG4gICAgfSk7XG4gIH07XG5cbi8qKlxuICogU2V0IHRoZSBzb3VyY2UgY29udGVudCBmb3IgYSBzb3VyY2UgZmlsZS5cbiAqL1xuU291cmNlTWFwR2VuZXJhdG9yLnByb3RvdHlwZS5zZXRTb3VyY2VDb250ZW50ID1cbiAgZnVuY3Rpb24gU291cmNlTWFwR2VuZXJhdG9yX3NldFNvdXJjZUNvbnRlbnQoYVNvdXJjZUZpbGUsIGFTb3VyY2VDb250ZW50KSB7XG4gICAgdmFyIHNvdXJjZSA9IGFTb3VyY2VGaWxlO1xuICAgIGlmICh0aGlzLl9zb3VyY2VSb290ICE9IG51bGwpIHtcbiAgICAgIHNvdXJjZSA9IHV0aWwucmVsYXRpdmUodGhpcy5fc291cmNlUm9vdCwgc291cmNlKTtcbiAgICB9XG5cbiAgICBpZiAoYVNvdXJjZUNvbnRlbnQgIT0gbnVsbCkge1xuICAgICAgLy8gQWRkIHRoZSBzb3VyY2UgY29udGVudCB0byB0aGUgX3NvdXJjZXNDb250ZW50cyBtYXAuXG4gICAgICAvLyBDcmVhdGUgYSBuZXcgX3NvdXJjZXNDb250ZW50cyBtYXAgaWYgdGhlIHByb3BlcnR5IGlzIG51bGwuXG4gICAgICBpZiAoIXRoaXMuX3NvdXJjZXNDb250ZW50cykge1xuICAgICAgICB0aGlzLl9zb3VyY2VzQ29udGVudHMgPSBPYmplY3QuY3JlYXRlKG51bGwpO1xuICAgICAgfVxuICAgICAgdGhpcy5fc291cmNlc0NvbnRlbnRzW3V0aWwudG9TZXRTdHJpbmcoc291cmNlKV0gPSBhU291cmNlQ29udGVudDtcbiAgICB9IGVsc2UgaWYgKHRoaXMuX3NvdXJjZXNDb250ZW50cykge1xuICAgICAgLy8gUmVtb3ZlIHRoZSBzb3VyY2UgZmlsZSBmcm9tIHRoZSBfc291cmNlc0NvbnRlbnRzIG1hcC5cbiAgICAgIC8vIElmIHRoZSBfc291cmNlc0NvbnRlbnRzIG1hcCBpcyBlbXB0eSwgc2V0IHRoZSBwcm9wZXJ0eSB0byBudWxsLlxuICAgICAgZGVsZXRlIHRoaXMuX3NvdXJjZXNDb250ZW50c1t1dGlsLnRvU2V0U3RyaW5nKHNvdXJjZSldO1xuICAgICAgaWYgKE9iamVjdC5rZXlzKHRoaXMuX3NvdXJjZXNDb250ZW50cykubGVuZ3RoID09PSAwKSB7XG4gICAgICAgIHRoaXMuX3NvdXJjZXNDb250ZW50cyA9IG51bGw7XG4gICAgICB9XG4gICAgfVxuICB9O1xuXG4vKipcbiAqIEFwcGxpZXMgdGhlIG1hcHBpbmdzIG9mIGEgc3ViLXNvdXJjZS1tYXAgZm9yIGEgc3BlY2lmaWMgc291cmNlIGZpbGUgdG8gdGhlXG4gKiBzb3VyY2UgbWFwIGJlaW5nIGdlbmVyYXRlZC4gRWFjaCBtYXBwaW5nIHRvIHRoZSBzdXBwbGllZCBzb3VyY2UgZmlsZSBpc1xuICogcmV3cml0dGVuIHVzaW5nIHRoZSBzdXBwbGllZCBzb3VyY2UgbWFwLiBOb3RlOiBUaGUgcmVzb2x1dGlvbiBmb3IgdGhlXG4gKiByZXN1bHRpbmcgbWFwcGluZ3MgaXMgdGhlIG1pbmltaXVtIG9mIHRoaXMgbWFwIGFuZCB0aGUgc3VwcGxpZWQgbWFwLlxuICpcbiAqIEBwYXJhbSBhU291cmNlTWFwQ29uc3VtZXIgVGhlIHNvdXJjZSBtYXAgdG8gYmUgYXBwbGllZC5cbiAqIEBwYXJhbSBhU291cmNlRmlsZSBPcHRpb25hbC4gVGhlIGZpbGVuYW1lIG9mIHRoZSBzb3VyY2UgZmlsZS5cbiAqICAgICAgICBJZiBvbWl0dGVkLCBTb3VyY2VNYXBDb25zdW1lcidzIGZpbGUgcHJvcGVydHkgd2lsbCBiZSB1c2VkLlxuICogQHBhcmFtIGFTb3VyY2VNYXBQYXRoIE9wdGlvbmFsLiBUaGUgZGlybmFtZSBvZiB0aGUgcGF0aCB0byB0aGUgc291cmNlIG1hcFxuICogICAgICAgIHRvIGJlIGFwcGxpZWQuIElmIHJlbGF0aXZlLCBpdCBpcyByZWxhdGl2ZSB0byB0aGUgU291cmNlTWFwQ29uc3VtZXIuXG4gKiAgICAgICAgVGhpcyBwYXJhbWV0ZXIgaXMgbmVlZGVkIHdoZW4gdGhlIHR3byBzb3VyY2UgbWFwcyBhcmVuJ3QgaW4gdGhlIHNhbWVcbiAqICAgICAgICBkaXJlY3RvcnksIGFuZCB0aGUgc291cmNlIG1hcCB0byBiZSBhcHBsaWVkIGNvbnRhaW5zIHJlbGF0aXZlIHNvdXJjZVxuICogICAgICAgIHBhdGhzLiBJZiBzbywgdGhvc2UgcmVsYXRpdmUgc291cmNlIHBhdGhzIG5lZWQgdG8gYmUgcmV3cml0dGVuXG4gKiAgICAgICAgcmVsYXRpdmUgdG8gdGhlIFNvdXJjZU1hcEdlbmVyYXRvci5cbiAqL1xuU291cmNlTWFwR2VuZXJhdG9yLnByb3RvdHlwZS5hcHBseVNvdXJjZU1hcCA9XG4gIGZ1bmN0aW9uIFNvdXJjZU1hcEdlbmVyYXRvcl9hcHBseVNvdXJjZU1hcChhU291cmNlTWFwQ29uc3VtZXIsIGFTb3VyY2VGaWxlLCBhU291cmNlTWFwUGF0aCkge1xuICAgIHZhciBzb3VyY2VGaWxlID0gYVNvdXJjZUZpbGU7XG4gICAgLy8gSWYgYVNvdXJjZUZpbGUgaXMgb21pdHRlZCwgd2Ugd2lsbCB1c2UgdGhlIGZpbGUgcHJvcGVydHkgb2YgdGhlIFNvdXJjZU1hcFxuICAgIGlmIChhU291cmNlRmlsZSA9PSBudWxsKSB7XG4gICAgICBpZiAoYVNvdXJjZU1hcENvbnN1bWVyLmZpbGUgPT0gbnVsbCkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgJ1NvdXJjZU1hcEdlbmVyYXRvci5wcm90b3R5cGUuYXBwbHlTb3VyY2VNYXAgcmVxdWlyZXMgZWl0aGVyIGFuIGV4cGxpY2l0IHNvdXJjZSBmaWxlLCAnICtcbiAgICAgICAgICAnb3IgdGhlIHNvdXJjZSBtYXBcXCdzIFwiZmlsZVwiIHByb3BlcnR5LiBCb3RoIHdlcmUgb21pdHRlZC4nXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgICBzb3VyY2VGaWxlID0gYVNvdXJjZU1hcENvbnN1bWVyLmZpbGU7XG4gICAgfVxuICAgIHZhciBzb3VyY2VSb290ID0gdGhpcy5fc291cmNlUm9vdDtcbiAgICAvLyBNYWtlIFwic291cmNlRmlsZVwiIHJlbGF0aXZlIGlmIGFuIGFic29sdXRlIFVybCBpcyBwYXNzZWQuXG4gICAgaWYgKHNvdXJjZVJvb3QgIT0gbnVsbCkge1xuICAgICAgc291cmNlRmlsZSA9IHV0aWwucmVsYXRpdmUoc291cmNlUm9vdCwgc291cmNlRmlsZSk7XG4gICAgfVxuICAgIC8vIEFwcGx5aW5nIHRoZSBTb3VyY2VNYXAgY2FuIGFkZCBhbmQgcmVtb3ZlIGl0ZW1zIGZyb20gdGhlIHNvdXJjZXMgYW5kXG4gICAgLy8gdGhlIG5hbWVzIGFycmF5LlxuICAgIHZhciBuZXdTb3VyY2VzID0gbmV3IEFycmF5U2V0KCk7XG4gICAgdmFyIG5ld05hbWVzID0gbmV3IEFycmF5U2V0KCk7XG5cbiAgICAvLyBGaW5kIG1hcHBpbmdzIGZvciB0aGUgXCJzb3VyY2VGaWxlXCJcbiAgICB0aGlzLl9tYXBwaW5ncy51bnNvcnRlZEZvckVhY2goZnVuY3Rpb24gKG1hcHBpbmcpIHtcbiAgICAgIGlmIChtYXBwaW5nLnNvdXJjZSA9PT0gc291cmNlRmlsZSAmJiBtYXBwaW5nLm9yaWdpbmFsTGluZSAhPSBudWxsKSB7XG4gICAgICAgIC8vIENoZWNrIGlmIGl0IGNhbiBiZSBtYXBwZWQgYnkgdGhlIHNvdXJjZSBtYXAsIHRoZW4gdXBkYXRlIHRoZSBtYXBwaW5nLlxuICAgICAgICB2YXIgb3JpZ2luYWwgPSBhU291cmNlTWFwQ29uc3VtZXIub3JpZ2luYWxQb3NpdGlvbkZvcih7XG4gICAgICAgICAgbGluZTogbWFwcGluZy5vcmlnaW5hbExpbmUsXG4gICAgICAgICAgY29sdW1uOiBtYXBwaW5nLm9yaWdpbmFsQ29sdW1uXG4gICAgICAgIH0pO1xuICAgICAgICBpZiAob3JpZ2luYWwuc291cmNlICE9IG51bGwpIHtcbiAgICAgICAgICAvLyBDb3B5IG1hcHBpbmdcbiAgICAgICAgICBtYXBwaW5nLnNvdXJjZSA9IG9yaWdpbmFsLnNvdXJjZTtcbiAgICAgICAgICBpZiAoYVNvdXJjZU1hcFBhdGggIT0gbnVsbCkge1xuICAgICAgICAgICAgbWFwcGluZy5zb3VyY2UgPSB1dGlsLmpvaW4oYVNvdXJjZU1hcFBhdGgsIG1hcHBpbmcuc291cmNlKVxuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoc291cmNlUm9vdCAhPSBudWxsKSB7XG4gICAgICAgICAgICBtYXBwaW5nLnNvdXJjZSA9IHV0aWwucmVsYXRpdmUoc291cmNlUm9vdCwgbWFwcGluZy5zb3VyY2UpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBtYXBwaW5nLm9yaWdpbmFsTGluZSA9IG9yaWdpbmFsLmxpbmU7XG4gICAgICAgICAgbWFwcGluZy5vcmlnaW5hbENvbHVtbiA9IG9yaWdpbmFsLmNvbHVtbjtcbiAgICAgICAgICBpZiAob3JpZ2luYWwubmFtZSAhPSBudWxsKSB7XG4gICAgICAgICAgICBtYXBwaW5nLm5hbWUgPSBvcmlnaW5hbC5uYW1lO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICB2YXIgc291cmNlID0gbWFwcGluZy5zb3VyY2U7XG4gICAgICBpZiAoc291cmNlICE9IG51bGwgJiYgIW5ld1NvdXJjZXMuaGFzKHNvdXJjZSkpIHtcbiAgICAgICAgbmV3U291cmNlcy5hZGQoc291cmNlKTtcbiAgICAgIH1cblxuICAgICAgdmFyIG5hbWUgPSBtYXBwaW5nLm5hbWU7XG4gICAgICBpZiAobmFtZSAhPSBudWxsICYmICFuZXdOYW1lcy5oYXMobmFtZSkpIHtcbiAgICAgICAgbmV3TmFtZXMuYWRkKG5hbWUpO1xuICAgICAgfVxuXG4gICAgfSwgdGhpcyk7XG4gICAgdGhpcy5fc291cmNlcyA9IG5ld1NvdXJjZXM7XG4gICAgdGhpcy5fbmFtZXMgPSBuZXdOYW1lcztcblxuICAgIC8vIENvcHkgc291cmNlc0NvbnRlbnRzIG9mIGFwcGxpZWQgbWFwLlxuICAgIGFTb3VyY2VNYXBDb25zdW1lci5zb3VyY2VzLmZvckVhY2goZnVuY3Rpb24gKHNvdXJjZUZpbGUpIHtcbiAgICAgIHZhciBjb250ZW50ID0gYVNvdXJjZU1hcENvbnN1bWVyLnNvdXJjZUNvbnRlbnRGb3Ioc291cmNlRmlsZSk7XG4gICAgICBpZiAoY29udGVudCAhPSBudWxsKSB7XG4gICAgICAgIGlmIChhU291cmNlTWFwUGF0aCAhPSBudWxsKSB7XG4gICAgICAgICAgc291cmNlRmlsZSA9IHV0aWwuam9pbihhU291cmNlTWFwUGF0aCwgc291cmNlRmlsZSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHNvdXJjZVJvb3QgIT0gbnVsbCkge1xuICAgICAgICAgIHNvdXJjZUZpbGUgPSB1dGlsLnJlbGF0aXZlKHNvdXJjZVJvb3QsIHNvdXJjZUZpbGUpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuc2V0U291cmNlQ29udGVudChzb3VyY2VGaWxlLCBjb250ZW50KTtcbiAgICAgIH1cbiAgICB9LCB0aGlzKTtcbiAgfTtcblxuLyoqXG4gKiBBIG1hcHBpbmcgY2FuIGhhdmUgb25lIG9mIHRoZSB0aHJlZSBsZXZlbHMgb2YgZGF0YTpcbiAqXG4gKiAgIDEuIEp1c3QgdGhlIGdlbmVyYXRlZCBwb3NpdGlvbi5cbiAqICAgMi4gVGhlIEdlbmVyYXRlZCBwb3NpdGlvbiwgb3JpZ2luYWwgcG9zaXRpb24sIGFuZCBvcmlnaW5hbCBzb3VyY2UuXG4gKiAgIDMuIEdlbmVyYXRlZCBhbmQgb3JpZ2luYWwgcG9zaXRpb24sIG9yaWdpbmFsIHNvdXJjZSwgYXMgd2VsbCBhcyBhIG5hbWVcbiAqICAgICAgdG9rZW4uXG4gKlxuICogVG8gbWFpbnRhaW4gY29uc2lzdGVuY3ksIHdlIHZhbGlkYXRlIHRoYXQgYW55IG5ldyBtYXBwaW5nIGJlaW5nIGFkZGVkIGZhbGxzXG4gKiBpbiB0byBvbmUgb2YgdGhlc2UgY2F0ZWdvcmllcy5cbiAqL1xuU291cmNlTWFwR2VuZXJhdG9yLnByb3RvdHlwZS5fdmFsaWRhdGVNYXBwaW5nID1cbiAgZnVuY3Rpb24gU291cmNlTWFwR2VuZXJhdG9yX3ZhbGlkYXRlTWFwcGluZyhhR2VuZXJhdGVkLCBhT3JpZ2luYWwsIGFTb3VyY2UsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYU5hbWUpIHtcbiAgICAvLyBXaGVuIGFPcmlnaW5hbCBpcyB0cnV0aHkgYnV0IGhhcyBlbXB0eSB2YWx1ZXMgZm9yIC5saW5lIGFuZCAuY29sdW1uLFxuICAgIC8vIGl0IGlzIG1vc3QgbGlrZWx5IGEgcHJvZ3JhbW1lciBlcnJvci4gSW4gdGhpcyBjYXNlIHdlIHRocm93IGEgdmVyeVxuICAgIC8vIHNwZWNpZmljIGVycm9yIG1lc3NhZ2UgdG8gdHJ5IHRvIGd1aWRlIHRoZW0gdGhlIHJpZ2h0IHdheS5cbiAgICAvLyBGb3IgZXhhbXBsZTogaHR0cHM6Ly9naXRodWIuY29tL1BvbHltZXIvcG9seW1lci1idW5kbGVyL3B1bGwvNTE5XG4gICAgaWYgKGFPcmlnaW5hbCAmJiB0eXBlb2YgYU9yaWdpbmFsLmxpbmUgIT09ICdudW1iZXInICYmIHR5cGVvZiBhT3JpZ2luYWwuY29sdW1uICE9PSAnbnVtYmVyJykge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgICAnb3JpZ2luYWwubGluZSBhbmQgb3JpZ2luYWwuY29sdW1uIGFyZSBub3QgbnVtYmVycyAtLSB5b3UgcHJvYmFibHkgbWVhbnQgdG8gb21pdCAnICtcbiAgICAgICAgICAgICd0aGUgb3JpZ2luYWwgbWFwcGluZyBlbnRpcmVseSBhbmQgb25seSBtYXAgdGhlIGdlbmVyYXRlZCBwb3NpdGlvbi4gSWYgc28sIHBhc3MgJyArXG4gICAgICAgICAgICAnbnVsbCBmb3IgdGhlIG9yaWdpbmFsIG1hcHBpbmcgaW5zdGVhZCBvZiBhbiBvYmplY3Qgd2l0aCBlbXB0eSBvciBudWxsIHZhbHVlcy4nXG4gICAgICAgICk7XG4gICAgfVxuXG4gICAgaWYgKGFHZW5lcmF0ZWQgJiYgJ2xpbmUnIGluIGFHZW5lcmF0ZWQgJiYgJ2NvbHVtbicgaW4gYUdlbmVyYXRlZFxuICAgICAgICAmJiBhR2VuZXJhdGVkLmxpbmUgPiAwICYmIGFHZW5lcmF0ZWQuY29sdW1uID49IDBcbiAgICAgICAgJiYgIWFPcmlnaW5hbCAmJiAhYVNvdXJjZSAmJiAhYU5hbWUpIHtcbiAgICAgIC8vIENhc2UgMS5cbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgZWxzZSBpZiAoYUdlbmVyYXRlZCAmJiAnbGluZScgaW4gYUdlbmVyYXRlZCAmJiAnY29sdW1uJyBpbiBhR2VuZXJhdGVkXG4gICAgICAgICAgICAgJiYgYU9yaWdpbmFsICYmICdsaW5lJyBpbiBhT3JpZ2luYWwgJiYgJ2NvbHVtbicgaW4gYU9yaWdpbmFsXG4gICAgICAgICAgICAgJiYgYUdlbmVyYXRlZC5saW5lID4gMCAmJiBhR2VuZXJhdGVkLmNvbHVtbiA+PSAwXG4gICAgICAgICAgICAgJiYgYU9yaWdpbmFsLmxpbmUgPiAwICYmIGFPcmlnaW5hbC5jb2x1bW4gPj0gMFxuICAgICAgICAgICAgICYmIGFTb3VyY2UpIHtcbiAgICAgIC8vIENhc2VzIDIgYW5kIDMuXG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIG1hcHBpbmc6ICcgKyBKU09OLnN0cmluZ2lmeSh7XG4gICAgICAgIGdlbmVyYXRlZDogYUdlbmVyYXRlZCxcbiAgICAgICAgc291cmNlOiBhU291cmNlLFxuICAgICAgICBvcmlnaW5hbDogYU9yaWdpbmFsLFxuICAgICAgICBuYW1lOiBhTmFtZVxuICAgICAgfSkpO1xuICAgIH1cbiAgfTtcblxuLyoqXG4gKiBTZXJpYWxpemUgdGhlIGFjY3VtdWxhdGVkIG1hcHBpbmdzIGluIHRvIHRoZSBzdHJlYW0gb2YgYmFzZSA2NCBWTFFzXG4gKiBzcGVjaWZpZWQgYnkgdGhlIHNvdXJjZSBtYXAgZm9ybWF0LlxuICovXG5Tb3VyY2VNYXBHZW5lcmF0b3IucHJvdG90eXBlLl9zZXJpYWxpemVNYXBwaW5ncyA9XG4gIGZ1bmN0aW9uIFNvdXJjZU1hcEdlbmVyYXRvcl9zZXJpYWxpemVNYXBwaW5ncygpIHtcbiAgICB2YXIgcHJldmlvdXNHZW5lcmF0ZWRDb2x1bW4gPSAwO1xuICAgIHZhciBwcmV2aW91c0dlbmVyYXRlZExpbmUgPSAxO1xuICAgIHZhciBwcmV2aW91c09yaWdpbmFsQ29sdW1uID0gMDtcbiAgICB2YXIgcHJldmlvdXNPcmlnaW5hbExpbmUgPSAwO1xuICAgIHZhciBwcmV2aW91c05hbWUgPSAwO1xuICAgIHZhciBwcmV2aW91c1NvdXJjZSA9IDA7XG4gICAgdmFyIHJlc3VsdCA9ICcnO1xuICAgIHZhciBuZXh0O1xuICAgIHZhciBtYXBwaW5nO1xuICAgIHZhciBuYW1lSWR4O1xuICAgIHZhciBzb3VyY2VJZHg7XG5cbiAgICB2YXIgbWFwcGluZ3MgPSB0aGlzLl9tYXBwaW5ncy50b0FycmF5KCk7XG4gICAgZm9yICh2YXIgaSA9IDAsIGxlbiA9IG1hcHBpbmdzLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICBtYXBwaW5nID0gbWFwcGluZ3NbaV07XG4gICAgICBuZXh0ID0gJydcblxuICAgICAgaWYgKG1hcHBpbmcuZ2VuZXJhdGVkTGluZSAhPT0gcHJldmlvdXNHZW5lcmF0ZWRMaW5lKSB7XG4gICAgICAgIHByZXZpb3VzR2VuZXJhdGVkQ29sdW1uID0gMDtcbiAgICAgICAgd2hpbGUgKG1hcHBpbmcuZ2VuZXJhdGVkTGluZSAhPT0gcHJldmlvdXNHZW5lcmF0ZWRMaW5lKSB7XG4gICAgICAgICAgbmV4dCArPSAnOyc7XG4gICAgICAgICAgcHJldmlvdXNHZW5lcmF0ZWRMaW5lKys7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGVsc2Uge1xuICAgICAgICBpZiAoaSA+IDApIHtcbiAgICAgICAgICBpZiAoIXV0aWwuY29tcGFyZUJ5R2VuZXJhdGVkUG9zaXRpb25zSW5mbGF0ZWQobWFwcGluZywgbWFwcGluZ3NbaSAtIDFdKSkge1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgfVxuICAgICAgICAgIG5leHQgKz0gJywnO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIG5leHQgKz0gYmFzZTY0VkxRLmVuY29kZShtYXBwaW5nLmdlbmVyYXRlZENvbHVtblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLSBwcmV2aW91c0dlbmVyYXRlZENvbHVtbik7XG4gICAgICBwcmV2aW91c0dlbmVyYXRlZENvbHVtbiA9IG1hcHBpbmcuZ2VuZXJhdGVkQ29sdW1uO1xuXG4gICAgICBpZiAobWFwcGluZy5zb3VyY2UgIT0gbnVsbCkge1xuICAgICAgICBzb3VyY2VJZHggPSB0aGlzLl9zb3VyY2VzLmluZGV4T2YobWFwcGluZy5zb3VyY2UpO1xuICAgICAgICBuZXh0ICs9IGJhc2U2NFZMUS5lbmNvZGUoc291cmNlSWR4IC0gcHJldmlvdXNTb3VyY2UpO1xuICAgICAgICBwcmV2aW91c1NvdXJjZSA9IHNvdXJjZUlkeDtcblxuICAgICAgICAvLyBsaW5lcyBhcmUgc3RvcmVkIDAtYmFzZWQgaW4gU291cmNlTWFwIHNwZWMgdmVyc2lvbiAzXG4gICAgICAgIG5leHQgKz0gYmFzZTY0VkxRLmVuY29kZShtYXBwaW5nLm9yaWdpbmFsTGluZSAtIDFcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLSBwcmV2aW91c09yaWdpbmFsTGluZSk7XG4gICAgICAgIHByZXZpb3VzT3JpZ2luYWxMaW5lID0gbWFwcGluZy5vcmlnaW5hbExpbmUgLSAxO1xuXG4gICAgICAgIG5leHQgKz0gYmFzZTY0VkxRLmVuY29kZShtYXBwaW5nLm9yaWdpbmFsQ29sdW1uXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC0gcHJldmlvdXNPcmlnaW5hbENvbHVtbik7XG4gICAgICAgIHByZXZpb3VzT3JpZ2luYWxDb2x1bW4gPSBtYXBwaW5nLm9yaWdpbmFsQ29sdW1uO1xuXG4gICAgICAgIGlmIChtYXBwaW5nLm5hbWUgIT0gbnVsbCkge1xuICAgICAgICAgIG5hbWVJZHggPSB0aGlzLl9uYW1lcy5pbmRleE9mKG1hcHBpbmcubmFtZSk7XG4gICAgICAgICAgbmV4dCArPSBiYXNlNjRWTFEuZW5jb2RlKG5hbWVJZHggLSBwcmV2aW91c05hbWUpO1xuICAgICAgICAgIHByZXZpb3VzTmFtZSA9IG5hbWVJZHg7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgcmVzdWx0ICs9IG5leHQ7XG4gICAgfVxuXG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfTtcblxuU291cmNlTWFwR2VuZXJhdG9yLnByb3RvdHlwZS5fZ2VuZXJhdGVTb3VyY2VzQ29udGVudCA9XG4gIGZ1bmN0aW9uIFNvdXJjZU1hcEdlbmVyYXRvcl9nZW5lcmF0ZVNvdXJjZXNDb250ZW50KGFTb3VyY2VzLCBhU291cmNlUm9vdCkge1xuICAgIHJldHVybiBhU291cmNlcy5tYXAoZnVuY3Rpb24gKHNvdXJjZSkge1xuICAgICAgaWYgKCF0aGlzLl9zb3VyY2VzQ29udGVudHMpIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICB9XG4gICAgICBpZiAoYVNvdXJjZVJvb3QgIT0gbnVsbCkge1xuICAgICAgICBzb3VyY2UgPSB1dGlsLnJlbGF0aXZlKGFTb3VyY2VSb290LCBzb3VyY2UpO1xuICAgICAgfVxuICAgICAgdmFyIGtleSA9IHV0aWwudG9TZXRTdHJpbmcoc291cmNlKTtcbiAgICAgIHJldHVybiBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwodGhpcy5fc291cmNlc0NvbnRlbnRzLCBrZXkpXG4gICAgICAgID8gdGhpcy5fc291cmNlc0NvbnRlbnRzW2tleV1cbiAgICAgICAgOiBudWxsO1xuICAgIH0sIHRoaXMpO1xuICB9O1xuXG4vKipcbiAqIEV4dGVybmFsaXplIHRoZSBzb3VyY2UgbWFwLlxuICovXG5Tb3VyY2VNYXBHZW5lcmF0b3IucHJvdG90eXBlLnRvSlNPTiA9XG4gIGZ1bmN0aW9uIFNvdXJjZU1hcEdlbmVyYXRvcl90b0pTT04oKSB7XG4gICAgdmFyIG1hcCA9IHtcbiAgICAgIHZlcnNpb246IHRoaXMuX3ZlcnNpb24sXG4gICAgICBzb3VyY2VzOiB0aGlzLl9zb3VyY2VzLnRvQXJyYXkoKSxcbiAgICAgIG5hbWVzOiB0aGlzLl9uYW1lcy50b0FycmF5KCksXG4gICAgICBtYXBwaW5nczogdGhpcy5fc2VyaWFsaXplTWFwcGluZ3MoKVxuICAgIH07XG4gICAgaWYgKHRoaXMuX2ZpbGUgIT0gbnVsbCkge1xuICAgICAgbWFwLmZpbGUgPSB0aGlzLl9maWxlO1xuICAgIH1cbiAgICBpZiAodGhpcy5fc291cmNlUm9vdCAhPSBudWxsKSB7XG4gICAgICBtYXAuc291cmNlUm9vdCA9IHRoaXMuX3NvdXJjZVJvb3Q7XG4gICAgfVxuICAgIGlmICh0aGlzLl9zb3VyY2VzQ29udGVudHMpIHtcbiAgICAgIG1hcC5zb3VyY2VzQ29udGVudCA9IHRoaXMuX2dlbmVyYXRlU291cmNlc0NvbnRlbnQobWFwLnNvdXJjZXMsIG1hcC5zb3VyY2VSb290KTtcbiAgICB9XG5cbiAgICByZXR1cm4gbWFwO1xuICB9O1xuXG4vKipcbiAqIFJlbmRlciB0aGUgc291cmNlIG1hcCBiZWluZyBnZW5lcmF0ZWQgdG8gYSBzdHJpbmcuXG4gKi9cblNvdXJjZU1hcEdlbmVyYXRvci5wcm90b3R5cGUudG9TdHJpbmcgPVxuICBmdW5jdGlvbiBTb3VyY2VNYXBHZW5lcmF0b3JfdG9TdHJpbmcoKSB7XG4gICAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KHRoaXMudG9KU09OKCkpO1xuICB9O1xuXG5leHBvcnRzLlNvdXJjZU1hcEdlbmVyYXRvciA9IFNvdXJjZU1hcEdlbmVyYXRvcjtcbiIsIi8qIC0qLSBNb2RlOiBqczsganMtaW5kZW50LWxldmVsOiAyOyAtKi0gKi9cbi8qXG4gKiBDb3B5cmlnaHQgMjAxMSBNb3ppbGxhIEZvdW5kYXRpb24gYW5kIGNvbnRyaWJ1dG9yc1xuICogTGljZW5zZWQgdW5kZXIgdGhlIE5ldyBCU0QgbGljZW5zZS4gU2VlIExJQ0VOU0Ugb3I6XG4gKiBodHRwOi8vb3BlbnNvdXJjZS5vcmcvbGljZW5zZXMvQlNELTMtQ2xhdXNlXG4gKi9cblxuZXhwb3J0cy5HUkVBVEVTVF9MT1dFUl9CT1VORCA9IDE7XG5leHBvcnRzLkxFQVNUX1VQUEVSX0JPVU5EID0gMjtcblxuLyoqXG4gKiBSZWN1cnNpdmUgaW1wbGVtZW50YXRpb24gb2YgYmluYXJ5IHNlYXJjaC5cbiAqXG4gKiBAcGFyYW0gYUxvdyBJbmRpY2VzIGhlcmUgYW5kIGxvd2VyIGRvIG5vdCBjb250YWluIHRoZSBuZWVkbGUuXG4gKiBAcGFyYW0gYUhpZ2ggSW5kaWNlcyBoZXJlIGFuZCBoaWdoZXIgZG8gbm90IGNvbnRhaW4gdGhlIG5lZWRsZS5cbiAqIEBwYXJhbSBhTmVlZGxlIFRoZSBlbGVtZW50IGJlaW5nIHNlYXJjaGVkIGZvci5cbiAqIEBwYXJhbSBhSGF5c3RhY2sgVGhlIG5vbi1lbXB0eSBhcnJheSBiZWluZyBzZWFyY2hlZC5cbiAqIEBwYXJhbSBhQ29tcGFyZSBGdW5jdGlvbiB3aGljaCB0YWtlcyB0d28gZWxlbWVudHMgYW5kIHJldHVybnMgLTEsIDAsIG9yIDEuXG4gKiBAcGFyYW0gYUJpYXMgRWl0aGVyICdiaW5hcnlTZWFyY2guR1JFQVRFU1RfTE9XRVJfQk9VTkQnIG9yXG4gKiAgICAgJ2JpbmFyeVNlYXJjaC5MRUFTVF9VUFBFUl9CT1VORCcuIFNwZWNpZmllcyB3aGV0aGVyIHRvIHJldHVybiB0aGVcbiAqICAgICBjbG9zZXN0IGVsZW1lbnQgdGhhdCBpcyBzbWFsbGVyIHRoYW4gb3IgZ3JlYXRlciB0aGFuIHRoZSBvbmUgd2UgYXJlXG4gKiAgICAgc2VhcmNoaW5nIGZvciwgcmVzcGVjdGl2ZWx5LCBpZiB0aGUgZXhhY3QgZWxlbWVudCBjYW5ub3QgYmUgZm91bmQuXG4gKi9cbmZ1bmN0aW9uIHJlY3Vyc2l2ZVNlYXJjaChhTG93LCBhSGlnaCwgYU5lZWRsZSwgYUhheXN0YWNrLCBhQ29tcGFyZSwgYUJpYXMpIHtcbiAgLy8gVGhpcyBmdW5jdGlvbiB0ZXJtaW5hdGVzIHdoZW4gb25lIG9mIHRoZSBmb2xsb3dpbmcgaXMgdHJ1ZTpcbiAgLy9cbiAgLy8gICAxLiBXZSBmaW5kIHRoZSBleGFjdCBlbGVtZW50IHdlIGFyZSBsb29raW5nIGZvci5cbiAgLy9cbiAgLy8gICAyLiBXZSBkaWQgbm90IGZpbmQgdGhlIGV4YWN0IGVsZW1lbnQsIGJ1dCB3ZSBjYW4gcmV0dXJuIHRoZSBpbmRleCBvZlxuICAvLyAgICAgIHRoZSBuZXh0LWNsb3Nlc3QgZWxlbWVudC5cbiAgLy9cbiAgLy8gICAzLiBXZSBkaWQgbm90IGZpbmQgdGhlIGV4YWN0IGVsZW1lbnQsIGFuZCB0aGVyZSBpcyBubyBuZXh0LWNsb3Nlc3RcbiAgLy8gICAgICBlbGVtZW50IHRoYW4gdGhlIG9uZSB3ZSBhcmUgc2VhcmNoaW5nIGZvciwgc28gd2UgcmV0dXJuIC0xLlxuICB2YXIgbWlkID0gTWF0aC5mbG9vcigoYUhpZ2ggLSBhTG93KSAvIDIpICsgYUxvdztcbiAgdmFyIGNtcCA9IGFDb21wYXJlKGFOZWVkbGUsIGFIYXlzdGFja1ttaWRdLCB0cnVlKTtcbiAgaWYgKGNtcCA9PT0gMCkge1xuICAgIC8vIEZvdW5kIHRoZSBlbGVtZW50IHdlIGFyZSBsb29raW5nIGZvci5cbiAgICByZXR1cm4gbWlkO1xuICB9XG4gIGVsc2UgaWYgKGNtcCA+IDApIHtcbiAgICAvLyBPdXIgbmVlZGxlIGlzIGdyZWF0ZXIgdGhhbiBhSGF5c3RhY2tbbWlkXS5cbiAgICBpZiAoYUhpZ2ggLSBtaWQgPiAxKSB7XG4gICAgICAvLyBUaGUgZWxlbWVudCBpcyBpbiB0aGUgdXBwZXIgaGFsZi5cbiAgICAgIHJldHVybiByZWN1cnNpdmVTZWFyY2gobWlkLCBhSGlnaCwgYU5lZWRsZSwgYUhheXN0YWNrLCBhQ29tcGFyZSwgYUJpYXMpO1xuICAgIH1cblxuICAgIC8vIFRoZSBleGFjdCBuZWVkbGUgZWxlbWVudCB3YXMgbm90IGZvdW5kIGluIHRoaXMgaGF5c3RhY2suIERldGVybWluZSBpZlxuICAgIC8vIHdlIGFyZSBpbiB0ZXJtaW5hdGlvbiBjYXNlICgzKSBvciAoMikgYW5kIHJldHVybiB0aGUgYXBwcm9wcmlhdGUgdGhpbmcuXG4gICAgaWYgKGFCaWFzID09IGV4cG9ydHMuTEVBU1RfVVBQRVJfQk9VTkQpIHtcbiAgICAgIHJldHVybiBhSGlnaCA8IGFIYXlzdGFjay5sZW5ndGggPyBhSGlnaCA6IC0xO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gbWlkO1xuICAgIH1cbiAgfVxuICBlbHNlIHtcbiAgICAvLyBPdXIgbmVlZGxlIGlzIGxlc3MgdGhhbiBhSGF5c3RhY2tbbWlkXS5cbiAgICBpZiAobWlkIC0gYUxvdyA+IDEpIHtcbiAgICAgIC8vIFRoZSBlbGVtZW50IGlzIGluIHRoZSBsb3dlciBoYWxmLlxuICAgICAgcmV0dXJuIHJlY3Vyc2l2ZVNlYXJjaChhTG93LCBtaWQsIGFOZWVkbGUsIGFIYXlzdGFjaywgYUNvbXBhcmUsIGFCaWFzKTtcbiAgICB9XG5cbiAgICAvLyB3ZSBhcmUgaW4gdGVybWluYXRpb24gY2FzZSAoMykgb3IgKDIpIGFuZCByZXR1cm4gdGhlIGFwcHJvcHJpYXRlIHRoaW5nLlxuICAgIGlmIChhQmlhcyA9PSBleHBvcnRzLkxFQVNUX1VQUEVSX0JPVU5EKSB7XG4gICAgICByZXR1cm4gbWlkO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gYUxvdyA8IDAgPyAtMSA6IGFMb3c7XG4gICAgfVxuICB9XG59XG5cbi8qKlxuICogVGhpcyBpcyBhbiBpbXBsZW1lbnRhdGlvbiBvZiBiaW5hcnkgc2VhcmNoIHdoaWNoIHdpbGwgYWx3YXlzIHRyeSBhbmQgcmV0dXJuXG4gKiB0aGUgaW5kZXggb2YgdGhlIGNsb3Nlc3QgZWxlbWVudCBpZiB0aGVyZSBpcyBubyBleGFjdCBoaXQuIFRoaXMgaXMgYmVjYXVzZVxuICogbWFwcGluZ3MgYmV0d2VlbiBvcmlnaW5hbCBhbmQgZ2VuZXJhdGVkIGxpbmUvY29sIHBhaXJzIGFyZSBzaW5nbGUgcG9pbnRzLFxuICogYW5kIHRoZXJlIGlzIGFuIGltcGxpY2l0IHJlZ2lvbiBiZXR3ZWVuIGVhY2ggb2YgdGhlbSwgc28gYSBtaXNzIGp1c3QgbWVhbnNcbiAqIHRoYXQgeW91IGFyZW4ndCBvbiB0aGUgdmVyeSBzdGFydCBvZiBhIHJlZ2lvbi5cbiAqXG4gKiBAcGFyYW0gYU5lZWRsZSBUaGUgZWxlbWVudCB5b3UgYXJlIGxvb2tpbmcgZm9yLlxuICogQHBhcmFtIGFIYXlzdGFjayBUaGUgYXJyYXkgdGhhdCBpcyBiZWluZyBzZWFyY2hlZC5cbiAqIEBwYXJhbSBhQ29tcGFyZSBBIGZ1bmN0aW9uIHdoaWNoIHRha2VzIHRoZSBuZWVkbGUgYW5kIGFuIGVsZW1lbnQgaW4gdGhlXG4gKiAgICAgYXJyYXkgYW5kIHJldHVybnMgLTEsIDAsIG9yIDEgZGVwZW5kaW5nIG9uIHdoZXRoZXIgdGhlIG5lZWRsZSBpcyBsZXNzXG4gKiAgICAgdGhhbiwgZXF1YWwgdG8sIG9yIGdyZWF0ZXIgdGhhbiB0aGUgZWxlbWVudCwgcmVzcGVjdGl2ZWx5LlxuICogQHBhcmFtIGFCaWFzIEVpdGhlciAnYmluYXJ5U2VhcmNoLkdSRUFURVNUX0xPV0VSX0JPVU5EJyBvclxuICogICAgICdiaW5hcnlTZWFyY2guTEVBU1RfVVBQRVJfQk9VTkQnLiBTcGVjaWZpZXMgd2hldGhlciB0byByZXR1cm4gdGhlXG4gKiAgICAgY2xvc2VzdCBlbGVtZW50IHRoYXQgaXMgc21hbGxlciB0aGFuIG9yIGdyZWF0ZXIgdGhhbiB0aGUgb25lIHdlIGFyZVxuICogICAgIHNlYXJjaGluZyBmb3IsIHJlc3BlY3RpdmVseSwgaWYgdGhlIGV4YWN0IGVsZW1lbnQgY2Fubm90IGJlIGZvdW5kLlxuICogICAgIERlZmF1bHRzIHRvICdiaW5hcnlTZWFyY2guR1JFQVRFU1RfTE9XRVJfQk9VTkQnLlxuICovXG5leHBvcnRzLnNlYXJjaCA9IGZ1bmN0aW9uIHNlYXJjaChhTmVlZGxlLCBhSGF5c3RhY2ssIGFDb21wYXJlLCBhQmlhcykge1xuICBpZiAoYUhheXN0YWNrLmxlbmd0aCA9PT0gMCkge1xuICAgIHJldHVybiAtMTtcbiAgfVxuXG4gIHZhciBpbmRleCA9IHJlY3Vyc2l2ZVNlYXJjaCgtMSwgYUhheXN0YWNrLmxlbmd0aCwgYU5lZWRsZSwgYUhheXN0YWNrLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYUNvbXBhcmUsIGFCaWFzIHx8IGV4cG9ydHMuR1JFQVRFU1RfTE9XRVJfQk9VTkQpO1xuICBpZiAoaW5kZXggPCAwKSB7XG4gICAgcmV0dXJuIC0xO1xuICB9XG5cbiAgLy8gV2UgaGF2ZSBmb3VuZCBlaXRoZXIgdGhlIGV4YWN0IGVsZW1lbnQsIG9yIHRoZSBuZXh0LWNsb3Nlc3QgZWxlbWVudCB0aGFuXG4gIC8vIHRoZSBvbmUgd2UgYXJlIHNlYXJjaGluZyBmb3IuIEhvd2V2ZXIsIHRoZXJlIG1heSBiZSBtb3JlIHRoYW4gb25lIHN1Y2hcbiAgLy8gZWxlbWVudC4gTWFrZSBzdXJlIHdlIGFsd2F5cyByZXR1cm4gdGhlIHNtYWxsZXN0IG9mIHRoZXNlLlxuICB3aGlsZSAoaW5kZXggLSAxID49IDApIHtcbiAgICBpZiAoYUNvbXBhcmUoYUhheXN0YWNrW2luZGV4XSwgYUhheXN0YWNrW2luZGV4IC0gMV0sIHRydWUpICE9PSAwKSB7XG4gICAgICBicmVhaztcbiAgICB9XG4gICAgLS1pbmRleDtcbiAgfVxuXG4gIHJldHVybiBpbmRleDtcbn07XG4iLCIvKiAtKi0gTW9kZToganM7IGpzLWluZGVudC1sZXZlbDogMjsgLSotICovXG4vKlxuICogQ29weXJpZ2h0IDIwMTEgTW96aWxsYSBGb3VuZGF0aW9uIGFuZCBjb250cmlidXRvcnNcbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBOZXcgQlNEIGxpY2Vuc2UuIFNlZSBMSUNFTlNFIG9yOlxuICogaHR0cDovL29wZW5zb3VyY2Uub3JnL2xpY2Vuc2VzL0JTRC0zLUNsYXVzZVxuICovXG5cbi8vIEl0IHR1cm5zIG91dCB0aGF0IHNvbWUgKG1vc3Q/KSBKYXZhU2NyaXB0IGVuZ2luZXMgZG9uJ3Qgc2VsZi1ob3N0XG4vLyBgQXJyYXkucHJvdG90eXBlLnNvcnRgLiBUaGlzIG1ha2VzIHNlbnNlIGJlY2F1c2UgQysrIHdpbGwgbGlrZWx5IHJlbWFpblxuLy8gZmFzdGVyIHRoYW4gSlMgd2hlbiBkb2luZyByYXcgQ1BVLWludGVuc2l2ZSBzb3J0aW5nLiBIb3dldmVyLCB3aGVuIHVzaW5nIGFcbi8vIGN1c3RvbSBjb21wYXJhdG9yIGZ1bmN0aW9uLCBjYWxsaW5nIGJhY2sgYW5kIGZvcnRoIGJldHdlZW4gdGhlIFZNJ3MgQysrIGFuZFxuLy8gSklUJ2QgSlMgaXMgcmF0aGVyIHNsb3cgKmFuZCogbG9zZXMgSklUIHR5cGUgaW5mb3JtYXRpb24sIHJlc3VsdGluZyBpblxuLy8gd29yc2UgZ2VuZXJhdGVkIGNvZGUgZm9yIHRoZSBjb21wYXJhdG9yIGZ1bmN0aW9uIHRoYW4gd291bGQgYmUgb3B0aW1hbC4gSW5cbi8vIGZhY3QsIHdoZW4gc29ydGluZyB3aXRoIGEgY29tcGFyYXRvciwgdGhlc2UgY29zdHMgb3V0d2VpZ2ggdGhlIGJlbmVmaXRzIG9mXG4vLyBzb3J0aW5nIGluIEMrKy4gQnkgdXNpbmcgb3VyIG93biBKUy1pbXBsZW1lbnRlZCBRdWljayBTb3J0IChiZWxvdyksIHdlIGdldFxuLy8gYSB+MzUwMG1zIG1lYW4gc3BlZWQtdXAgaW4gYGJlbmNoL2JlbmNoLmh0bWxgLlxuXG5mdW5jdGlvbiBTb3J0VGVtcGxhdGUoY29tcGFyYXRvcikge1xuXG4vKipcbiAqIFN3YXAgdGhlIGVsZW1lbnRzIGluZGV4ZWQgYnkgYHhgIGFuZCBgeWAgaW4gdGhlIGFycmF5IGBhcnlgLlxuICpcbiAqIEBwYXJhbSB7QXJyYXl9IGFyeVxuICogICAgICAgIFRoZSBhcnJheS5cbiAqIEBwYXJhbSB7TnVtYmVyfSB4XG4gKiAgICAgICAgVGhlIGluZGV4IG9mIHRoZSBmaXJzdCBpdGVtLlxuICogQHBhcmFtIHtOdW1iZXJ9IHlcbiAqICAgICAgICBUaGUgaW5kZXggb2YgdGhlIHNlY29uZCBpdGVtLlxuICovXG5mdW5jdGlvbiBzd2FwKGFyeSwgeCwgeSkge1xuICB2YXIgdGVtcCA9IGFyeVt4XTtcbiAgYXJ5W3hdID0gYXJ5W3ldO1xuICBhcnlbeV0gPSB0ZW1wO1xufVxuXG4vKipcbiAqIFJldHVybnMgYSByYW5kb20gaW50ZWdlciB3aXRoaW4gdGhlIHJhbmdlIGBsb3cgLi4gaGlnaGAgaW5jbHVzaXZlLlxuICpcbiAqIEBwYXJhbSB7TnVtYmVyfSBsb3dcbiAqICAgICAgICBUaGUgbG93ZXIgYm91bmQgb24gdGhlIHJhbmdlLlxuICogQHBhcmFtIHtOdW1iZXJ9IGhpZ2hcbiAqICAgICAgICBUaGUgdXBwZXIgYm91bmQgb24gdGhlIHJhbmdlLlxuICovXG5mdW5jdGlvbiByYW5kb21JbnRJblJhbmdlKGxvdywgaGlnaCkge1xuICByZXR1cm4gTWF0aC5yb3VuZChsb3cgKyAoTWF0aC5yYW5kb20oKSAqIChoaWdoIC0gbG93KSkpO1xufVxuXG4vKipcbiAqIFRoZSBRdWljayBTb3J0IGFsZ29yaXRobS5cbiAqXG4gKiBAcGFyYW0ge0FycmF5fSBhcnlcbiAqICAgICAgICBBbiBhcnJheSB0byBzb3J0LlxuICogQHBhcmFtIHtmdW5jdGlvbn0gY29tcGFyYXRvclxuICogICAgICAgIEZ1bmN0aW9uIHRvIHVzZSB0byBjb21wYXJlIHR3byBpdGVtcy5cbiAqIEBwYXJhbSB7TnVtYmVyfSBwXG4gKiAgICAgICAgU3RhcnQgaW5kZXggb2YgdGhlIGFycmF5XG4gKiBAcGFyYW0ge051bWJlcn0gclxuICogICAgICAgIEVuZCBpbmRleCBvZiB0aGUgYXJyYXlcbiAqL1xuZnVuY3Rpb24gZG9RdWlja1NvcnQoYXJ5LCBjb21wYXJhdG9yLCBwLCByKSB7XG4gIC8vIElmIG91ciBsb3dlciBib3VuZCBpcyBsZXNzIHRoYW4gb3VyIHVwcGVyIGJvdW5kLCB3ZSAoMSkgcGFydGl0aW9uIHRoZVxuICAvLyBhcnJheSBpbnRvIHR3byBwaWVjZXMgYW5kICgyKSByZWN1cnNlIG9uIGVhY2ggaGFsZi4gSWYgaXQgaXMgbm90LCB0aGlzIGlzXG4gIC8vIHRoZSBlbXB0eSBhcnJheSBhbmQgb3VyIGJhc2UgY2FzZS5cblxuICBpZiAocCA8IHIpIHtcbiAgICAvLyAoMSkgUGFydGl0aW9uaW5nLlxuICAgIC8vXG4gICAgLy8gVGhlIHBhcnRpdGlvbmluZyBjaG9vc2VzIGEgcGl2b3QgYmV0d2VlbiBgcGAgYW5kIGByYCBhbmQgbW92ZXMgYWxsXG4gICAgLy8gZWxlbWVudHMgdGhhdCBhcmUgbGVzcyB0aGFuIG9yIGVxdWFsIHRvIHRoZSBwaXZvdCB0byB0aGUgYmVmb3JlIGl0LCBhbmRcbiAgICAvLyBhbGwgdGhlIGVsZW1lbnRzIHRoYXQgYXJlIGdyZWF0ZXIgdGhhbiBpdCBhZnRlciBpdC4gVGhlIGVmZmVjdCBpcyB0aGF0XG4gICAgLy8gb25jZSBwYXJ0aXRpb24gaXMgZG9uZSwgdGhlIHBpdm90IGlzIGluIHRoZSBleGFjdCBwbGFjZSBpdCB3aWxsIGJlIHdoZW5cbiAgICAvLyB0aGUgYXJyYXkgaXMgcHV0IGluIHNvcnRlZCBvcmRlciwgYW5kIGl0IHdpbGwgbm90IG5lZWQgdG8gYmUgbW92ZWRcbiAgICAvLyBhZ2Fpbi4gVGhpcyBydW5zIGluIE8obikgdGltZS5cblxuICAgIC8vIEFsd2F5cyBjaG9vc2UgYSByYW5kb20gcGl2b3Qgc28gdGhhdCBhbiBpbnB1dCBhcnJheSB3aGljaCBpcyByZXZlcnNlXG4gICAgLy8gc29ydGVkIGRvZXMgbm90IGNhdXNlIE8obl4yKSBydW5uaW5nIHRpbWUuXG4gICAgdmFyIHBpdm90SW5kZXggPSByYW5kb21JbnRJblJhbmdlKHAsIHIpO1xuICAgIHZhciBpID0gcCAtIDE7XG5cbiAgICBzd2FwKGFyeSwgcGl2b3RJbmRleCwgcik7XG4gICAgdmFyIHBpdm90ID0gYXJ5W3JdO1xuXG4gICAgLy8gSW1tZWRpYXRlbHkgYWZ0ZXIgYGpgIGlzIGluY3JlbWVudGVkIGluIHRoaXMgbG9vcCwgdGhlIGZvbGxvd2luZyBob2xkXG4gICAgLy8gdHJ1ZTpcbiAgICAvL1xuICAgIC8vICAgKiBFdmVyeSBlbGVtZW50IGluIGBhcnlbcCAuLiBpXWAgaXMgbGVzcyB0aGFuIG9yIGVxdWFsIHRvIHRoZSBwaXZvdC5cbiAgICAvL1xuICAgIC8vICAgKiBFdmVyeSBlbGVtZW50IGluIGBhcnlbaSsxIC4uIGotMV1gIGlzIGdyZWF0ZXIgdGhhbiB0aGUgcGl2b3QuXG4gICAgZm9yICh2YXIgaiA9IHA7IGogPCByOyBqKyspIHtcbiAgICAgIGlmIChjb21wYXJhdG9yKGFyeVtqXSwgcGl2b3QsIGZhbHNlKSA8PSAwKSB7XG4gICAgICAgIGkgKz0gMTtcbiAgICAgICAgc3dhcChhcnksIGksIGopO1xuICAgICAgfVxuICAgIH1cblxuICAgIHN3YXAoYXJ5LCBpICsgMSwgaik7XG4gICAgdmFyIHEgPSBpICsgMTtcblxuICAgIC8vICgyKSBSZWN1cnNlIG9uIGVhY2ggaGFsZi5cblxuICAgIGRvUXVpY2tTb3J0KGFyeSwgY29tcGFyYXRvciwgcCwgcSAtIDEpO1xuICAgIGRvUXVpY2tTb3J0KGFyeSwgY29tcGFyYXRvciwgcSArIDEsIHIpO1xuICB9XG59XG5cbiAgcmV0dXJuIGRvUXVpY2tTb3J0O1xufVxuXG5mdW5jdGlvbiBjbG9uZVNvcnQoY29tcGFyYXRvcikge1xuICBsZXQgdGVtcGxhdGUgPSBTb3J0VGVtcGxhdGUudG9TdHJpbmcoKTtcbiAgbGV0IHRlbXBsYXRlRm4gPSBuZXcgRnVuY3Rpb24oYHJldHVybiAke3RlbXBsYXRlfWApKCk7XG4gIHJldHVybiB0ZW1wbGF0ZUZuKGNvbXBhcmF0b3IpO1xufVxuXG4vKipcbiAqIFNvcnQgdGhlIGdpdmVuIGFycmF5IGluLXBsYWNlIHdpdGggdGhlIGdpdmVuIGNvbXBhcmF0b3IgZnVuY3Rpb24uXG4gKlxuICogQHBhcmFtIHtBcnJheX0gYXJ5XG4gKiAgICAgICAgQW4gYXJyYXkgdG8gc29ydC5cbiAqIEBwYXJhbSB7ZnVuY3Rpb259IGNvbXBhcmF0b3JcbiAqICAgICAgICBGdW5jdGlvbiB0byB1c2UgdG8gY29tcGFyZSB0d28gaXRlbXMuXG4gKi9cblxubGV0IHNvcnRDYWNoZSA9IG5ldyBXZWFrTWFwKCk7XG5leHBvcnRzLnF1aWNrU29ydCA9IGZ1bmN0aW9uIChhcnksIGNvbXBhcmF0b3IsIHN0YXJ0ID0gMCkge1xuICBsZXQgZG9RdWlja1NvcnQgPSBzb3J0Q2FjaGUuZ2V0KGNvbXBhcmF0b3IpO1xuICBpZiAoZG9RdWlja1NvcnQgPT09IHZvaWQgMCkge1xuICAgIGRvUXVpY2tTb3J0ID0gY2xvbmVTb3J0KGNvbXBhcmF0b3IpO1xuICAgIHNvcnRDYWNoZS5zZXQoY29tcGFyYXRvciwgZG9RdWlja1NvcnQpO1xuICB9XG4gIGRvUXVpY2tTb3J0KGFyeSwgY29tcGFyYXRvciwgc3RhcnQsIGFyeS5sZW5ndGggLSAxKTtcbn07XG4iLCIvKiAtKi0gTW9kZToganM7IGpzLWluZGVudC1sZXZlbDogMjsgLSotICovXG4vKlxuICogQ29weXJpZ2h0IDIwMTEgTW96aWxsYSBGb3VuZGF0aW9uIGFuZCBjb250cmlidXRvcnNcbiAqIExpY2Vuc2VkIHVuZGVyIHRoZSBOZXcgQlNEIGxpY2Vuc2UuIFNlZSBMSUNFTlNFIG9yOlxuICogaHR0cDovL29wZW5zb3VyY2Uub3JnL2xpY2Vuc2VzL0JTRC0zLUNsYXVzZVxuICovXG5cbnZhciB1dGlsID0gcmVxdWlyZSgnLi91dGlsJyk7XG52YXIgYmluYXJ5U2VhcmNoID0gcmVxdWlyZSgnLi9iaW5hcnktc2VhcmNoJyk7XG52YXIgQXJyYXlTZXQgPSByZXF1aXJlKCcuL2FycmF5LXNldCcpLkFycmF5U2V0O1xudmFyIGJhc2U2NFZMUSA9IHJlcXVpcmUoJy4vYmFzZTY0LXZscScpO1xudmFyIHF1aWNrU29ydCA9IHJlcXVpcmUoJy4vcXVpY2stc29ydCcpLnF1aWNrU29ydDtcblxuZnVuY3Rpb24gU291cmNlTWFwQ29uc3VtZXIoYVNvdXJjZU1hcCwgYVNvdXJjZU1hcFVSTCkge1xuICB2YXIgc291cmNlTWFwID0gYVNvdXJjZU1hcDtcbiAgaWYgKHR5cGVvZiBhU291cmNlTWFwID09PSAnc3RyaW5nJykge1xuICAgIHNvdXJjZU1hcCA9IHV0aWwucGFyc2VTb3VyY2VNYXBJbnB1dChhU291cmNlTWFwKTtcbiAgfVxuXG4gIHJldHVybiBzb3VyY2VNYXAuc2VjdGlvbnMgIT0gbnVsbFxuICAgID8gbmV3IEluZGV4ZWRTb3VyY2VNYXBDb25zdW1lcihzb3VyY2VNYXAsIGFTb3VyY2VNYXBVUkwpXG4gICAgOiBuZXcgQmFzaWNTb3VyY2VNYXBDb25zdW1lcihzb3VyY2VNYXAsIGFTb3VyY2VNYXBVUkwpO1xufVxuXG5Tb3VyY2VNYXBDb25zdW1lci5mcm9tU291cmNlTWFwID0gZnVuY3Rpb24oYVNvdXJjZU1hcCwgYVNvdXJjZU1hcFVSTCkge1xuICByZXR1cm4gQmFzaWNTb3VyY2VNYXBDb25zdW1lci5mcm9tU291cmNlTWFwKGFTb3VyY2VNYXAsIGFTb3VyY2VNYXBVUkwpO1xufVxuXG4vKipcbiAqIFRoZSB2ZXJzaW9uIG9mIHRoZSBzb3VyY2UgbWFwcGluZyBzcGVjIHRoYXQgd2UgYXJlIGNvbnN1bWluZy5cbiAqL1xuU291cmNlTWFwQ29uc3VtZXIucHJvdG90eXBlLl92ZXJzaW9uID0gMztcblxuLy8gYF9fZ2VuZXJhdGVkTWFwcGluZ3NgIGFuZCBgX19vcmlnaW5hbE1hcHBpbmdzYCBhcmUgYXJyYXlzIHRoYXQgaG9sZCB0aGVcbi8vIHBhcnNlZCBtYXBwaW5nIGNvb3JkaW5hdGVzIGZyb20gdGhlIHNvdXJjZSBtYXAncyBcIm1hcHBpbmdzXCIgYXR0cmlidXRlLiBUaGV5XG4vLyBhcmUgbGF6aWx5IGluc3RhbnRpYXRlZCwgYWNjZXNzZWQgdmlhIHRoZSBgX2dlbmVyYXRlZE1hcHBpbmdzYCBhbmRcbi8vIGBfb3JpZ2luYWxNYXBwaW5nc2AgZ2V0dGVycyByZXNwZWN0aXZlbHksIGFuZCB3ZSBvbmx5IHBhcnNlIHRoZSBtYXBwaW5nc1xuLy8gYW5kIGNyZWF0ZSB0aGVzZSBhcnJheXMgb25jZSBxdWVyaWVkIGZvciBhIHNvdXJjZSBsb2NhdGlvbi4gV2UganVtcCB0aHJvdWdoXG4vLyB0aGVzZSBob29wcyBiZWNhdXNlIHRoZXJlIGNhbiBiZSBtYW55IHRob3VzYW5kcyBvZiBtYXBwaW5ncywgYW5kIHBhcnNpbmdcbi8vIHRoZW0gaXMgZXhwZW5zaXZlLCBzbyB3ZSBvbmx5IHdhbnQgdG8gZG8gaXQgaWYgd2UgbXVzdC5cbi8vXG4vLyBFYWNoIG9iamVjdCBpbiB0aGUgYXJyYXlzIGlzIG9mIHRoZSBmb3JtOlxuLy9cbi8vICAgICB7XG4vLyAgICAgICBnZW5lcmF0ZWRMaW5lOiBUaGUgbGluZSBudW1iZXIgaW4gdGhlIGdlbmVyYXRlZCBjb2RlLFxuLy8gICAgICAgZ2VuZXJhdGVkQ29sdW1uOiBUaGUgY29sdW1uIG51bWJlciBpbiB0aGUgZ2VuZXJhdGVkIGNvZGUsXG4vLyAgICAgICBzb3VyY2U6IFRoZSBwYXRoIHRvIHRoZSBvcmlnaW5hbCBzb3VyY2UgZmlsZSB0aGF0IGdlbmVyYXRlZCB0aGlzXG4vLyAgICAgICAgICAgICAgIGNodW5rIG9mIGNvZGUsXG4vLyAgICAgICBvcmlnaW5hbExpbmU6IFRoZSBsaW5lIG51bWJlciBpbiB0aGUgb3JpZ2luYWwgc291cmNlIHRoYXRcbi8vICAgICAgICAgICAgICAgICAgICAgY29ycmVzcG9uZHMgdG8gdGhpcyBjaHVuayBvZiBnZW5lcmF0ZWQgY29kZSxcbi8vICAgICAgIG9yaWdpbmFsQ29sdW1uOiBUaGUgY29sdW1uIG51bWJlciBpbiB0aGUgb3JpZ2luYWwgc291cmNlIHRoYXRcbi8vICAgICAgICAgICAgICAgICAgICAgICBjb3JyZXNwb25kcyB0byB0aGlzIGNodW5rIG9mIGdlbmVyYXRlZCBjb2RlLFxuLy8gICAgICAgbmFtZTogVGhlIG5hbWUgb2YgdGhlIG9yaWdpbmFsIHN5bWJvbCB3aGljaCBnZW5lcmF0ZWQgdGhpcyBjaHVuayBvZlxuLy8gICAgICAgICAgICAgY29kZS5cbi8vICAgICB9XG4vL1xuLy8gQWxsIHByb3BlcnRpZXMgZXhjZXB0IGZvciBgZ2VuZXJhdGVkTGluZWAgYW5kIGBnZW5lcmF0ZWRDb2x1bW5gIGNhbiBiZVxuLy8gYG51bGxgLlxuLy9cbi8vIGBfZ2VuZXJhdGVkTWFwcGluZ3NgIGlzIG9yZGVyZWQgYnkgdGhlIGdlbmVyYXRlZCBwb3NpdGlvbnMuXG4vL1xuLy8gYF9vcmlnaW5hbE1hcHBpbmdzYCBpcyBvcmRlcmVkIGJ5IHRoZSBvcmlnaW5hbCBwb3NpdGlvbnMuXG5cblNvdXJjZU1hcENvbnN1bWVyLnByb3RvdHlwZS5fX2dlbmVyYXRlZE1hcHBpbmdzID0gbnVsbDtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShTb3VyY2VNYXBDb25zdW1lci5wcm90b3R5cGUsICdfZ2VuZXJhdGVkTWFwcGluZ3MnLCB7XG4gIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKCF0aGlzLl9fZ2VuZXJhdGVkTWFwcGluZ3MpIHtcbiAgICAgIHRoaXMuX3BhcnNlTWFwcGluZ3ModGhpcy5fbWFwcGluZ3MsIHRoaXMuc291cmNlUm9vdCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMuX19nZW5lcmF0ZWRNYXBwaW5ncztcbiAgfVxufSk7XG5cblNvdXJjZU1hcENvbnN1bWVyLnByb3RvdHlwZS5fX29yaWdpbmFsTWFwcGluZ3MgPSBudWxsO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KFNvdXJjZU1hcENvbnN1bWVyLnByb3RvdHlwZSwgJ19vcmlnaW5hbE1hcHBpbmdzJywge1xuICBjb25maWd1cmFibGU6IHRydWUsXG4gIGVudW1lcmFibGU6IHRydWUsXG4gIGdldDogZnVuY3Rpb24gKCkge1xuICAgIGlmICghdGhpcy5fX29yaWdpbmFsTWFwcGluZ3MpIHtcbiAgICAgIHRoaXMuX3BhcnNlTWFwcGluZ3ModGhpcy5fbWFwcGluZ3MsIHRoaXMuc291cmNlUm9vdCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMuX19vcmlnaW5hbE1hcHBpbmdzO1xuICB9XG59KTtcblxuU291cmNlTWFwQ29uc3VtZXIucHJvdG90eXBlLl9jaGFySXNNYXBwaW5nU2VwYXJhdG9yID1cbiAgZnVuY3Rpb24gU291cmNlTWFwQ29uc3VtZXJfY2hhcklzTWFwcGluZ1NlcGFyYXRvcihhU3RyLCBpbmRleCkge1xuICAgIHZhciBjID0gYVN0ci5jaGFyQXQoaW5kZXgpO1xuICAgIHJldHVybiBjID09PSBcIjtcIiB8fCBjID09PSBcIixcIjtcbiAgfTtcblxuLyoqXG4gKiBQYXJzZSB0aGUgbWFwcGluZ3MgaW4gYSBzdHJpbmcgaW4gdG8gYSBkYXRhIHN0cnVjdHVyZSB3aGljaCB3ZSBjYW4gZWFzaWx5XG4gKiBxdWVyeSAodGhlIG9yZGVyZWQgYXJyYXlzIGluIHRoZSBgdGhpcy5fX2dlbmVyYXRlZE1hcHBpbmdzYCBhbmRcbiAqIGB0aGlzLl9fb3JpZ2luYWxNYXBwaW5nc2AgcHJvcGVydGllcykuXG4gKi9cblNvdXJjZU1hcENvbnN1bWVyLnByb3RvdHlwZS5fcGFyc2VNYXBwaW5ncyA9XG4gIGZ1bmN0aW9uIFNvdXJjZU1hcENvbnN1bWVyX3BhcnNlTWFwcGluZ3MoYVN0ciwgYVNvdXJjZVJvb3QpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJTdWJjbGFzc2VzIG11c3QgaW1wbGVtZW50IF9wYXJzZU1hcHBpbmdzXCIpO1xuICB9O1xuXG5Tb3VyY2VNYXBDb25zdW1lci5HRU5FUkFURURfT1JERVIgPSAxO1xuU291cmNlTWFwQ29uc3VtZXIuT1JJR0lOQUxfT1JERVIgPSAyO1xuXG5Tb3VyY2VNYXBDb25zdW1lci5HUkVBVEVTVF9MT1dFUl9CT1VORCA9IDE7XG5Tb3VyY2VNYXBDb25zdW1lci5MRUFTVF9VUFBFUl9CT1VORCA9IDI7XG5cbi8qKlxuICogSXRlcmF0ZSBvdmVyIGVhY2ggbWFwcGluZyBiZXR3ZWVuIGFuIG9yaWdpbmFsIHNvdXJjZS9saW5lL2NvbHVtbiBhbmQgYVxuICogZ2VuZXJhdGVkIGxpbmUvY29sdW1uIGluIHRoaXMgc291cmNlIG1hcC5cbiAqXG4gKiBAcGFyYW0gRnVuY3Rpb24gYUNhbGxiYWNrXG4gKiAgICAgICAgVGhlIGZ1bmN0aW9uIHRoYXQgaXMgY2FsbGVkIHdpdGggZWFjaCBtYXBwaW5nLlxuICogQHBhcmFtIE9iamVjdCBhQ29udGV4dFxuICogICAgICAgIE9wdGlvbmFsLiBJZiBzcGVjaWZpZWQsIHRoaXMgb2JqZWN0IHdpbGwgYmUgdGhlIHZhbHVlIG9mIGB0aGlzYCBldmVyeVxuICogICAgICAgIHRpbWUgdGhhdCBgYUNhbGxiYWNrYCBpcyBjYWxsZWQuXG4gKiBAcGFyYW0gYU9yZGVyXG4gKiAgICAgICAgRWl0aGVyIGBTb3VyY2VNYXBDb25zdW1lci5HRU5FUkFURURfT1JERVJgIG9yXG4gKiAgICAgICAgYFNvdXJjZU1hcENvbnN1bWVyLk9SSUdJTkFMX09SREVSYC4gU3BlY2lmaWVzIHdoZXRoZXIgeW91IHdhbnQgdG9cbiAqICAgICAgICBpdGVyYXRlIG92ZXIgdGhlIG1hcHBpbmdzIHNvcnRlZCBieSB0aGUgZ2VuZXJhdGVkIGZpbGUncyBsaW5lL2NvbHVtblxuICogICAgICAgIG9yZGVyIG9yIHRoZSBvcmlnaW5hbCdzIHNvdXJjZS9saW5lL2NvbHVtbiBvcmRlciwgcmVzcGVjdGl2ZWx5LiBEZWZhdWx0cyB0b1xuICogICAgICAgIGBTb3VyY2VNYXBDb25zdW1lci5HRU5FUkFURURfT1JERVJgLlxuICovXG5Tb3VyY2VNYXBDb25zdW1lci5wcm90b3R5cGUuZWFjaE1hcHBpbmcgPVxuICBmdW5jdGlvbiBTb3VyY2VNYXBDb25zdW1lcl9lYWNoTWFwcGluZyhhQ2FsbGJhY2ssIGFDb250ZXh0LCBhT3JkZXIpIHtcbiAgICB2YXIgY29udGV4dCA9IGFDb250ZXh0IHx8IG51bGw7XG4gICAgdmFyIG9yZGVyID0gYU9yZGVyIHx8IFNvdXJjZU1hcENvbnN1bWVyLkdFTkVSQVRFRF9PUkRFUjtcblxuICAgIHZhciBtYXBwaW5ncztcbiAgICBzd2l0Y2ggKG9yZGVyKSB7XG4gICAgY2FzZSBTb3VyY2VNYXBDb25zdW1lci5HRU5FUkFURURfT1JERVI6XG4gICAgICBtYXBwaW5ncyA9IHRoaXMuX2dlbmVyYXRlZE1hcHBpbmdzO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSBTb3VyY2VNYXBDb25zdW1lci5PUklHSU5BTF9PUkRFUjpcbiAgICAgIG1hcHBpbmdzID0gdGhpcy5fb3JpZ2luYWxNYXBwaW5ncztcbiAgICAgIGJyZWFrO1xuICAgIGRlZmF1bHQ6XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJVbmtub3duIG9yZGVyIG9mIGl0ZXJhdGlvbi5cIik7XG4gICAgfVxuXG4gICAgdmFyIHNvdXJjZVJvb3QgPSB0aGlzLnNvdXJjZVJvb3Q7XG4gICAgdmFyIGJvdW5kQ2FsbGJhY2sgPSBhQ2FsbGJhY2suYmluZChjb250ZXh0KTtcbiAgICB2YXIgbmFtZXMgPSB0aGlzLl9uYW1lcztcbiAgICB2YXIgc291cmNlcyA9IHRoaXMuX3NvdXJjZXM7XG4gICAgdmFyIHNvdXJjZU1hcFVSTCA9IHRoaXMuX3NvdXJjZU1hcFVSTDtcblxuICAgIGZvciAodmFyIGkgPSAwLCBuID0gbWFwcGluZ3MubGVuZ3RoOyBpIDwgbjsgaSsrKSB7XG4gICAgICB2YXIgbWFwcGluZyA9IG1hcHBpbmdzW2ldO1xuICAgICAgdmFyIHNvdXJjZSA9IG1hcHBpbmcuc291cmNlID09PSBudWxsID8gbnVsbCA6IHNvdXJjZXMuYXQobWFwcGluZy5zb3VyY2UpO1xuICAgICAgc291cmNlID0gdXRpbC5jb21wdXRlU291cmNlVVJMKHNvdXJjZVJvb3QsIHNvdXJjZSwgc291cmNlTWFwVVJMKTtcbiAgICAgIGJvdW5kQ2FsbGJhY2soe1xuICAgICAgICBzb3VyY2U6IHNvdXJjZSxcbiAgICAgICAgZ2VuZXJhdGVkTGluZTogbWFwcGluZy5nZW5lcmF0ZWRMaW5lLFxuICAgICAgICBnZW5lcmF0ZWRDb2x1bW46IG1hcHBpbmcuZ2VuZXJhdGVkQ29sdW1uLFxuICAgICAgICBvcmlnaW5hbExpbmU6IG1hcHBpbmcub3JpZ2luYWxMaW5lLFxuICAgICAgICBvcmlnaW5hbENvbHVtbjogbWFwcGluZy5vcmlnaW5hbENvbHVtbixcbiAgICAgICAgbmFtZTogbWFwcGluZy5uYW1lID09PSBudWxsID8gbnVsbCA6IG5hbWVzLmF0KG1hcHBpbmcubmFtZSlcbiAgICAgIH0pO1xuICAgIH1cbiAgfTtcblxuLyoqXG4gKiBSZXR1cm5zIGFsbCBnZW5lcmF0ZWQgbGluZSBhbmQgY29sdW1uIGluZm9ybWF0aW9uIGZvciB0aGUgb3JpZ2luYWwgc291cmNlLFxuICogbGluZSwgYW5kIGNvbHVtbiBwcm92aWRlZC4gSWYgbm8gY29sdW1uIGlzIHByb3ZpZGVkLCByZXR1cm5zIGFsbCBtYXBwaW5nc1xuICogY29ycmVzcG9uZGluZyB0byBhIGVpdGhlciB0aGUgbGluZSB3ZSBhcmUgc2VhcmNoaW5nIGZvciBvciB0aGUgbmV4dFxuICogY2xvc2VzdCBsaW5lIHRoYXQgaGFzIGFueSBtYXBwaW5ncy4gT3RoZXJ3aXNlLCByZXR1cm5zIGFsbCBtYXBwaW5nc1xuICogY29ycmVzcG9uZGluZyB0byB0aGUgZ2l2ZW4gbGluZSBhbmQgZWl0aGVyIHRoZSBjb2x1bW4gd2UgYXJlIHNlYXJjaGluZyBmb3JcbiAqIG9yIHRoZSBuZXh0IGNsb3Nlc3QgY29sdW1uIHRoYXQgaGFzIGFueSBvZmZzZXRzLlxuICpcbiAqIFRoZSBvbmx5IGFyZ3VtZW50IGlzIGFuIG9iamVjdCB3aXRoIHRoZSBmb2xsb3dpbmcgcHJvcGVydGllczpcbiAqXG4gKiAgIC0gc291cmNlOiBUaGUgZmlsZW5hbWUgb2YgdGhlIG9yaWdpbmFsIHNvdXJjZS5cbiAqICAgLSBsaW5lOiBUaGUgbGluZSBudW1iZXIgaW4gdGhlIG9yaWdpbmFsIHNvdXJjZS4gIFRoZSBsaW5lIG51bWJlciBpcyAxLWJhc2VkLlxuICogICAtIGNvbHVtbjogT3B0aW9uYWwuIHRoZSBjb2x1bW4gbnVtYmVyIGluIHRoZSBvcmlnaW5hbCBzb3VyY2UuXG4gKiAgICBUaGUgY29sdW1uIG51bWJlciBpcyAwLWJhc2VkLlxuICpcbiAqIGFuZCBhbiBhcnJheSBvZiBvYmplY3RzIGlzIHJldHVybmVkLCBlYWNoIHdpdGggdGhlIGZvbGxvd2luZyBwcm9wZXJ0aWVzOlxuICpcbiAqICAgLSBsaW5lOiBUaGUgbGluZSBudW1iZXIgaW4gdGhlIGdlbmVyYXRlZCBzb3VyY2UsIG9yIG51bGwuICBUaGVcbiAqICAgIGxpbmUgbnVtYmVyIGlzIDEtYmFzZWQuXG4gKiAgIC0gY29sdW1uOiBUaGUgY29sdW1uIG51bWJlciBpbiB0aGUgZ2VuZXJhdGVkIHNvdXJjZSwgb3IgbnVsbC5cbiAqICAgIFRoZSBjb2x1bW4gbnVtYmVyIGlzIDAtYmFzZWQuXG4gKi9cblNvdXJjZU1hcENvbnN1bWVyLnByb3RvdHlwZS5hbGxHZW5lcmF0ZWRQb3NpdGlvbnNGb3IgPVxuICBmdW5jdGlvbiBTb3VyY2VNYXBDb25zdW1lcl9hbGxHZW5lcmF0ZWRQb3NpdGlvbnNGb3IoYUFyZ3MpIHtcbiAgICB2YXIgbGluZSA9IHV0aWwuZ2V0QXJnKGFBcmdzLCAnbGluZScpO1xuXG4gICAgLy8gV2hlbiB0aGVyZSBpcyBubyBleGFjdCBtYXRjaCwgQmFzaWNTb3VyY2VNYXBDb25zdW1lci5wcm90b3R5cGUuX2ZpbmRNYXBwaW5nXG4gICAgLy8gcmV0dXJucyB0aGUgaW5kZXggb2YgdGhlIGNsb3Nlc3QgbWFwcGluZyBsZXNzIHRoYW4gdGhlIG5lZWRsZS4gQnlcbiAgICAvLyBzZXR0aW5nIG5lZWRsZS5vcmlnaW5hbENvbHVtbiB0byAwLCB3ZSB0aHVzIGZpbmQgdGhlIGxhc3QgbWFwcGluZyBmb3JcbiAgICAvLyB0aGUgZ2l2ZW4gbGluZSwgcHJvdmlkZWQgc3VjaCBhIG1hcHBpbmcgZXhpc3RzLlxuICAgIHZhciBuZWVkbGUgPSB7XG4gICAgICBzb3VyY2U6IHV0aWwuZ2V0QXJnKGFBcmdzLCAnc291cmNlJyksXG4gICAgICBvcmlnaW5hbExpbmU6IGxpbmUsXG4gICAgICBvcmlnaW5hbENvbHVtbjogdXRpbC5nZXRBcmcoYUFyZ3MsICdjb2x1bW4nLCAwKVxuICAgIH07XG5cbiAgICBuZWVkbGUuc291cmNlID0gdGhpcy5fZmluZFNvdXJjZUluZGV4KG5lZWRsZS5zb3VyY2UpO1xuICAgIGlmIChuZWVkbGUuc291cmNlIDwgMCkge1xuICAgICAgcmV0dXJuIFtdO1xuICAgIH1cblxuICAgIHZhciBtYXBwaW5ncyA9IFtdO1xuXG4gICAgdmFyIGluZGV4ID0gdGhpcy5fZmluZE1hcHBpbmcobmVlZGxlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX29yaWdpbmFsTWFwcGluZ3MsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJvcmlnaW5hbExpbmVcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIm9yaWdpbmFsQ29sdW1uXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdXRpbC5jb21wYXJlQnlPcmlnaW5hbFBvc2l0aW9ucyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBiaW5hcnlTZWFyY2guTEVBU1RfVVBQRVJfQk9VTkQpO1xuICAgIGlmIChpbmRleCA+PSAwKSB7XG4gICAgICB2YXIgbWFwcGluZyA9IHRoaXMuX29yaWdpbmFsTWFwcGluZ3NbaW5kZXhdO1xuXG4gICAgICBpZiAoYUFyZ3MuY29sdW1uID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgdmFyIG9yaWdpbmFsTGluZSA9IG1hcHBpbmcub3JpZ2luYWxMaW5lO1xuXG4gICAgICAgIC8vIEl0ZXJhdGUgdW50aWwgZWl0aGVyIHdlIHJ1biBvdXQgb2YgbWFwcGluZ3MsIG9yIHdlIHJ1biBpbnRvXG4gICAgICAgIC8vIGEgbWFwcGluZyBmb3IgYSBkaWZmZXJlbnQgbGluZSB0aGFuIHRoZSBvbmUgd2UgZm91bmQuIFNpbmNlXG4gICAgICAgIC8vIG1hcHBpbmdzIGFyZSBzb3J0ZWQsIHRoaXMgaXMgZ3VhcmFudGVlZCB0byBmaW5kIGFsbCBtYXBwaW5ncyBmb3JcbiAgICAgICAgLy8gdGhlIGxpbmUgd2UgZm91bmQuXG4gICAgICAgIHdoaWxlIChtYXBwaW5nICYmIG1hcHBpbmcub3JpZ2luYWxMaW5lID09PSBvcmlnaW5hbExpbmUpIHtcbiAgICAgICAgICBtYXBwaW5ncy5wdXNoKHtcbiAgICAgICAgICAgIGxpbmU6IHV0aWwuZ2V0QXJnKG1hcHBpbmcsICdnZW5lcmF0ZWRMaW5lJywgbnVsbCksXG4gICAgICAgICAgICBjb2x1bW46IHV0aWwuZ2V0QXJnKG1hcHBpbmcsICdnZW5lcmF0ZWRDb2x1bW4nLCBudWxsKSxcbiAgICAgICAgICAgIGxhc3RDb2x1bW46IHV0aWwuZ2V0QXJnKG1hcHBpbmcsICdsYXN0R2VuZXJhdGVkQ29sdW1uJywgbnVsbClcbiAgICAgICAgICB9KTtcblxuICAgICAgICAgIG1hcHBpbmcgPSB0aGlzLl9vcmlnaW5hbE1hcHBpbmdzWysraW5kZXhdO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB2YXIgb3JpZ2luYWxDb2x1bW4gPSBtYXBwaW5nLm9yaWdpbmFsQ29sdW1uO1xuXG4gICAgICAgIC8vIEl0ZXJhdGUgdW50aWwgZWl0aGVyIHdlIHJ1biBvdXQgb2YgbWFwcGluZ3MsIG9yIHdlIHJ1biBpbnRvXG4gICAgICAgIC8vIGEgbWFwcGluZyBmb3IgYSBkaWZmZXJlbnQgbGluZSB0aGFuIHRoZSBvbmUgd2Ugd2VyZSBzZWFyY2hpbmcgZm9yLlxuICAgICAgICAvLyBTaW5jZSBtYXBwaW5ncyBhcmUgc29ydGVkLCB0aGlzIGlzIGd1YXJhbnRlZWQgdG8gZmluZCBhbGwgbWFwcGluZ3MgZm9yXG4gICAgICAgIC8vIHRoZSBsaW5lIHdlIGFyZSBzZWFyY2hpbmcgZm9yLlxuICAgICAgICB3aGlsZSAobWFwcGluZyAmJlxuICAgICAgICAgICAgICAgbWFwcGluZy5vcmlnaW5hbExpbmUgPT09IGxpbmUgJiZcbiAgICAgICAgICAgICAgIG1hcHBpbmcub3JpZ2luYWxDb2x1bW4gPT0gb3JpZ2luYWxDb2x1bW4pIHtcbiAgICAgICAgICBtYXBwaW5ncy5wdXNoKHtcbiAgICAgICAgICAgIGxpbmU6IHV0aWwuZ2V0QXJnKG1hcHBpbmcsICdnZW5lcmF0ZWRMaW5lJywgbnVsbCksXG4gICAgICAgICAgICBjb2x1bW46IHV0aWwuZ2V0QXJnKG1hcHBpbmcsICdnZW5lcmF0ZWRDb2x1bW4nLCBudWxsKSxcbiAgICAgICAgICAgIGxhc3RDb2x1bW46IHV0aWwuZ2V0QXJnKG1hcHBpbmcsICdsYXN0R2VuZXJhdGVkQ29sdW1uJywgbnVsbClcbiAgICAgICAgICB9KTtcblxuICAgICAgICAgIG1hcHBpbmcgPSB0aGlzLl9vcmlnaW5hbE1hcHBpbmdzWysraW5kZXhdO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIG1hcHBpbmdzO1xuICB9O1xuXG5leHBvcnRzLlNvdXJjZU1hcENvbnN1bWVyID0gU291cmNlTWFwQ29uc3VtZXI7XG5cbi8qKlxuICogQSBCYXNpY1NvdXJjZU1hcENvbnN1bWVyIGluc3RhbmNlIHJlcHJlc2VudHMgYSBwYXJzZWQgc291cmNlIG1hcCB3aGljaCB3ZSBjYW5cbiAqIHF1ZXJ5IGZvciBpbmZvcm1hdGlvbiBhYm91dCB0aGUgb3JpZ2luYWwgZmlsZSBwb3NpdGlvbnMgYnkgZ2l2aW5nIGl0IGEgZmlsZVxuICogcG9zaXRpb24gaW4gdGhlIGdlbmVyYXRlZCBzb3VyY2UuXG4gKlxuICogVGhlIGZpcnN0IHBhcmFtZXRlciBpcyB0aGUgcmF3IHNvdXJjZSBtYXAgKGVpdGhlciBhcyBhIEpTT04gc3RyaW5nLCBvclxuICogYWxyZWFkeSBwYXJzZWQgdG8gYW4gb2JqZWN0KS4gQWNjb3JkaW5nIHRvIHRoZSBzcGVjLCBzb3VyY2UgbWFwcyBoYXZlIHRoZVxuICogZm9sbG93aW5nIGF0dHJpYnV0ZXM6XG4gKlxuICogICAtIHZlcnNpb246IFdoaWNoIHZlcnNpb24gb2YgdGhlIHNvdXJjZSBtYXAgc3BlYyB0aGlzIG1hcCBpcyBmb2xsb3dpbmcuXG4gKiAgIC0gc291cmNlczogQW4gYXJyYXkgb2YgVVJMcyB0byB0aGUgb3JpZ2luYWwgc291cmNlIGZpbGVzLlxuICogICAtIG5hbWVzOiBBbiBhcnJheSBvZiBpZGVudGlmaWVycyB3aGljaCBjYW4gYmUgcmVmZXJyZW5jZWQgYnkgaW5kaXZpZHVhbCBtYXBwaW5ncy5cbiAqICAgLSBzb3VyY2VSb290OiBPcHRpb25hbC4gVGhlIFVSTCByb290IGZyb20gd2hpY2ggYWxsIHNvdXJjZXMgYXJlIHJlbGF0aXZlLlxuICogICAtIHNvdXJjZXNDb250ZW50OiBPcHRpb25hbC4gQW4gYXJyYXkgb2YgY29udGVudHMgb2YgdGhlIG9yaWdpbmFsIHNvdXJjZSBmaWxlcy5cbiAqICAgLSBtYXBwaW5nczogQSBzdHJpbmcgb2YgYmFzZTY0IFZMUXMgd2hpY2ggY29udGFpbiB0aGUgYWN0dWFsIG1hcHBpbmdzLlxuICogICAtIGZpbGU6IE9wdGlvbmFsLiBUaGUgZ2VuZXJhdGVkIGZpbGUgdGhpcyBzb3VyY2UgbWFwIGlzIGFzc29jaWF0ZWQgd2l0aC5cbiAqXG4gKiBIZXJlIGlzIGFuIGV4YW1wbGUgc291cmNlIG1hcCwgdGFrZW4gZnJvbSB0aGUgc291cmNlIG1hcCBzcGVjWzBdOlxuICpcbiAqICAgICB7XG4gKiAgICAgICB2ZXJzaW9uIDogMyxcbiAqICAgICAgIGZpbGU6IFwib3V0LmpzXCIsXG4gKiAgICAgICBzb3VyY2VSb290IDogXCJcIixcbiAqICAgICAgIHNvdXJjZXM6IFtcImZvby5qc1wiLCBcImJhci5qc1wiXSxcbiAqICAgICAgIG5hbWVzOiBbXCJzcmNcIiwgXCJtYXBzXCIsIFwiYXJlXCIsIFwiZnVuXCJdLFxuICogICAgICAgbWFwcGluZ3M6IFwiQUEsQUI7O0FCQ0RFO1wiXG4gKiAgICAgfVxuICpcbiAqIFRoZSBzZWNvbmQgcGFyYW1ldGVyLCBpZiBnaXZlbiwgaXMgYSBzdHJpbmcgd2hvc2UgdmFsdWUgaXMgdGhlIFVSTFxuICogYXQgd2hpY2ggdGhlIHNvdXJjZSBtYXAgd2FzIGZvdW5kLiAgVGhpcyBVUkwgaXMgdXNlZCB0byBjb21wdXRlIHRoZVxuICogc291cmNlcyBhcnJheS5cbiAqXG4gKiBbMF06IGh0dHBzOi8vZG9jcy5nb29nbGUuY29tL2RvY3VtZW50L2QvMVUxUkdBZWhRd1J5cFVUb3ZGMUtSbHBpT0Z6ZTBiLV8yZ2M2ZkFIMEtZMGsvZWRpdD9wbGk9MSNcbiAqL1xuZnVuY3Rpb24gQmFzaWNTb3VyY2VNYXBDb25zdW1lcihhU291cmNlTWFwLCBhU291cmNlTWFwVVJMKSB7XG4gIHZhciBzb3VyY2VNYXAgPSBhU291cmNlTWFwO1xuICBpZiAodHlwZW9mIGFTb3VyY2VNYXAgPT09ICdzdHJpbmcnKSB7XG4gICAgc291cmNlTWFwID0gdXRpbC5wYXJzZVNvdXJjZU1hcElucHV0KGFTb3VyY2VNYXApO1xuICB9XG5cbiAgdmFyIHZlcnNpb24gPSB1dGlsLmdldEFyZyhzb3VyY2VNYXAsICd2ZXJzaW9uJyk7XG4gIHZhciBzb3VyY2VzID0gdXRpbC5nZXRBcmcoc291cmNlTWFwLCAnc291cmNlcycpO1xuICAvLyBTYXNzIDMuMyBsZWF2ZXMgb3V0IHRoZSAnbmFtZXMnIGFycmF5LCBzbyB3ZSBkZXZpYXRlIGZyb20gdGhlIHNwZWMgKHdoaWNoXG4gIC8vIHJlcXVpcmVzIHRoZSBhcnJheSkgdG8gcGxheSBuaWNlIGhlcmUuXG4gIHZhciBuYW1lcyA9IHV0aWwuZ2V0QXJnKHNvdXJjZU1hcCwgJ25hbWVzJywgW10pO1xuICB2YXIgc291cmNlUm9vdCA9IHV0aWwuZ2V0QXJnKHNvdXJjZU1hcCwgJ3NvdXJjZVJvb3QnLCBudWxsKTtcbiAgdmFyIHNvdXJjZXNDb250ZW50ID0gdXRpbC5nZXRBcmcoc291cmNlTWFwLCAnc291cmNlc0NvbnRlbnQnLCBudWxsKTtcbiAgdmFyIG1hcHBpbmdzID0gdXRpbC5nZXRBcmcoc291cmNlTWFwLCAnbWFwcGluZ3MnKTtcbiAgdmFyIGZpbGUgPSB1dGlsLmdldEFyZyhzb3VyY2VNYXAsICdmaWxlJywgbnVsbCk7XG5cbiAgLy8gT25jZSBhZ2FpbiwgU2FzcyBkZXZpYXRlcyBmcm9tIHRoZSBzcGVjIGFuZCBzdXBwbGllcyB0aGUgdmVyc2lvbiBhcyBhXG4gIC8vIHN0cmluZyByYXRoZXIgdGhhbiBhIG51bWJlciwgc28gd2UgdXNlIGxvb3NlIGVxdWFsaXR5IGNoZWNraW5nIGhlcmUuXG4gIGlmICh2ZXJzaW9uICE9IHRoaXMuX3ZlcnNpb24pIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ1Vuc3VwcG9ydGVkIHZlcnNpb246ICcgKyB2ZXJzaW9uKTtcbiAgfVxuXG4gIGlmIChzb3VyY2VSb290KSB7XG4gICAgc291cmNlUm9vdCA9IHV0aWwubm9ybWFsaXplKHNvdXJjZVJvb3QpO1xuICB9XG5cbiAgc291cmNlcyA9IHNvdXJjZXNcbiAgICAubWFwKFN0cmluZylcbiAgICAvLyBTb21lIHNvdXJjZSBtYXBzIHByb2R1Y2UgcmVsYXRpdmUgc291cmNlIHBhdGhzIGxpa2UgXCIuL2Zvby5qc1wiIGluc3RlYWQgb2ZcbiAgICAvLyBcImZvby5qc1wiLiAgTm9ybWFsaXplIHRoZXNlIGZpcnN0IHNvIHRoYXQgZnV0dXJlIGNvbXBhcmlzb25zIHdpbGwgc3VjY2VlZC5cbiAgICAvLyBTZWUgYnVnemlsLmxhLzEwOTA3NjguXG4gICAgLm1hcCh1dGlsLm5vcm1hbGl6ZSlcbiAgICAvLyBBbHdheXMgZW5zdXJlIHRoYXQgYWJzb2x1dGUgc291cmNlcyBhcmUgaW50ZXJuYWxseSBzdG9yZWQgcmVsYXRpdmUgdG9cbiAgICAvLyB0aGUgc291cmNlIHJvb3QsIGlmIHRoZSBzb3VyY2Ugcm9vdCBpcyBhYnNvbHV0ZS4gTm90IGRvaW5nIHRoaXMgd291bGRcbiAgICAvLyBiZSBwYXJ0aWN1bGFybHkgcHJvYmxlbWF0aWMgd2hlbiB0aGUgc291cmNlIHJvb3QgaXMgYSBwcmVmaXggb2YgdGhlXG4gICAgLy8gc291cmNlICh2YWxpZCwgYnV0IHdoeT8/KS4gU2VlIGdpdGh1YiBpc3N1ZSAjMTk5IGFuZCBidWd6aWwubGEvMTE4ODk4Mi5cbiAgICAubWFwKGZ1bmN0aW9uIChzb3VyY2UpIHtcbiAgICAgIHJldHVybiBzb3VyY2VSb290ICYmIHV0aWwuaXNBYnNvbHV0ZShzb3VyY2VSb290KSAmJiB1dGlsLmlzQWJzb2x1dGUoc291cmNlKVxuICAgICAgICA/IHV0aWwucmVsYXRpdmUoc291cmNlUm9vdCwgc291cmNlKVxuICAgICAgICA6IHNvdXJjZTtcbiAgICB9KTtcblxuICAvLyBQYXNzIGB0cnVlYCBiZWxvdyB0byBhbGxvdyBkdXBsaWNhdGUgbmFtZXMgYW5kIHNvdXJjZXMuIFdoaWxlIHNvdXJjZSBtYXBzXG4gIC8vIGFyZSBpbnRlbmRlZCB0byBiZSBjb21wcmVzc2VkIGFuZCBkZWR1cGxpY2F0ZWQsIHRoZSBUeXBlU2NyaXB0IGNvbXBpbGVyXG4gIC8vIHNvbWV0aW1lcyBnZW5lcmF0ZXMgc291cmNlIG1hcHMgd2l0aCBkdXBsaWNhdGVzIGluIHRoZW0uIFNlZSBHaXRodWIgaXNzdWVcbiAgLy8gIzcyIGFuZCBidWd6aWwubGEvODg5NDkyLlxuICB0aGlzLl9uYW1lcyA9IEFycmF5U2V0LmZyb21BcnJheShuYW1lcy5tYXAoU3RyaW5nKSwgdHJ1ZSk7XG4gIHRoaXMuX3NvdXJjZXMgPSBBcnJheVNldC5mcm9tQXJyYXkoc291cmNlcywgdHJ1ZSk7XG5cbiAgdGhpcy5fYWJzb2x1dGVTb3VyY2VzID0gdGhpcy5fc291cmNlcy50b0FycmF5KCkubWFwKGZ1bmN0aW9uIChzKSB7XG4gICAgcmV0dXJuIHV0aWwuY29tcHV0ZVNvdXJjZVVSTChzb3VyY2VSb290LCBzLCBhU291cmNlTWFwVVJMKTtcbiAgfSk7XG5cbiAgdGhpcy5zb3VyY2VSb290ID0gc291cmNlUm9vdDtcbiAgdGhpcy5zb3VyY2VzQ29udGVudCA9IHNvdXJjZXNDb250ZW50O1xuICB0aGlzLl9tYXBwaW5ncyA9IG1hcHBpbmdzO1xuICB0aGlzLl9zb3VyY2VNYXBVUkwgPSBhU291cmNlTWFwVVJMO1xuICB0aGlzLmZpbGUgPSBmaWxlO1xufVxuXG5CYXNpY1NvdXJjZU1hcENvbnN1bWVyLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoU291cmNlTWFwQ29uc3VtZXIucHJvdG90eXBlKTtcbkJhc2ljU291cmNlTWFwQ29uc3VtZXIucHJvdG90eXBlLmNvbnN1bWVyID0gU291cmNlTWFwQ29uc3VtZXI7XG5cbi8qKlxuICogVXRpbGl0eSBmdW5jdGlvbiB0byBmaW5kIHRoZSBpbmRleCBvZiBhIHNvdXJjZS4gIFJldHVybnMgLTEgaWYgbm90XG4gKiBmb3VuZC5cbiAqL1xuQmFzaWNTb3VyY2VNYXBDb25zdW1lci5wcm90b3R5cGUuX2ZpbmRTb3VyY2VJbmRleCA9IGZ1bmN0aW9uKGFTb3VyY2UpIHtcbiAgdmFyIHJlbGF0aXZlU291cmNlID0gYVNvdXJjZTtcbiAgaWYgKHRoaXMuc291cmNlUm9vdCAhPSBudWxsKSB7XG4gICAgcmVsYXRpdmVTb3VyY2UgPSB1dGlsLnJlbGF0aXZlKHRoaXMuc291cmNlUm9vdCwgcmVsYXRpdmVTb3VyY2UpO1xuICB9XG5cbiAgaWYgKHRoaXMuX3NvdXJjZXMuaGFzKHJlbGF0aXZlU291cmNlKSkge1xuICAgIHJldHVybiB0aGlzLl9zb3VyY2VzLmluZGV4T2YocmVsYXRpdmVTb3VyY2UpO1xuICB9XG5cbiAgLy8gTWF5YmUgYVNvdXJjZSBpcyBhbiBhYnNvbHV0ZSBVUkwgYXMgcmV0dXJuZWQgYnkgfHNvdXJjZXN8LiAgSW5cbiAgLy8gdGhpcyBjYXNlIHdlIGNhbid0IHNpbXBseSB1bmRvIHRoZSB0cmFuc2Zvcm0uXG4gIHZhciBpO1xuICBmb3IgKGkgPSAwOyBpIDwgdGhpcy5fYWJzb2x1dGVTb3VyY2VzLmxlbmd0aDsgKytpKSB7XG4gICAgaWYgKHRoaXMuX2Fic29sdXRlU291cmNlc1tpXSA9PSBhU291cmNlKSB7XG4gICAgICByZXR1cm4gaTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gLTE7XG59O1xuXG4vKipcbiAqIENyZWF0ZSBhIEJhc2ljU291cmNlTWFwQ29uc3VtZXIgZnJvbSBhIFNvdXJjZU1hcEdlbmVyYXRvci5cbiAqXG4gKiBAcGFyYW0gU291cmNlTWFwR2VuZXJhdG9yIGFTb3VyY2VNYXBcbiAqICAgICAgICBUaGUgc291cmNlIG1hcCB0aGF0IHdpbGwgYmUgY29uc3VtZWQuXG4gKiBAcGFyYW0gU3RyaW5nIGFTb3VyY2VNYXBVUkxcbiAqICAgICAgICBUaGUgVVJMIGF0IHdoaWNoIHRoZSBzb3VyY2UgbWFwIGNhbiBiZSBmb3VuZCAob3B0aW9uYWwpXG4gKiBAcmV0dXJucyBCYXNpY1NvdXJjZU1hcENvbnN1bWVyXG4gKi9cbkJhc2ljU291cmNlTWFwQ29uc3VtZXIuZnJvbVNvdXJjZU1hcCA9XG4gIGZ1bmN0aW9uIFNvdXJjZU1hcENvbnN1bWVyX2Zyb21Tb3VyY2VNYXAoYVNvdXJjZU1hcCwgYVNvdXJjZU1hcFVSTCkge1xuICAgIHZhciBzbWMgPSBPYmplY3QuY3JlYXRlKEJhc2ljU291cmNlTWFwQ29uc3VtZXIucHJvdG90eXBlKTtcblxuICAgIHZhciBuYW1lcyA9IHNtYy5fbmFtZXMgPSBBcnJheVNldC5mcm9tQXJyYXkoYVNvdXJjZU1hcC5fbmFtZXMudG9BcnJheSgpLCB0cnVlKTtcbiAgICB2YXIgc291cmNlcyA9IHNtYy5fc291cmNlcyA9IEFycmF5U2V0LmZyb21BcnJheShhU291cmNlTWFwLl9zb3VyY2VzLnRvQXJyYXkoKSwgdHJ1ZSk7XG4gICAgc21jLnNvdXJjZVJvb3QgPSBhU291cmNlTWFwLl9zb3VyY2VSb290O1xuICAgIHNtYy5zb3VyY2VzQ29udGVudCA9IGFTb3VyY2VNYXAuX2dlbmVyYXRlU291cmNlc0NvbnRlbnQoc21jLl9zb3VyY2VzLnRvQXJyYXkoKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNtYy5zb3VyY2VSb290KTtcbiAgICBzbWMuZmlsZSA9IGFTb3VyY2VNYXAuX2ZpbGU7XG4gICAgc21jLl9zb3VyY2VNYXBVUkwgPSBhU291cmNlTWFwVVJMO1xuICAgIHNtYy5fYWJzb2x1dGVTb3VyY2VzID0gc21jLl9zb3VyY2VzLnRvQXJyYXkoKS5tYXAoZnVuY3Rpb24gKHMpIHtcbiAgICAgIHJldHVybiB1dGlsLmNvbXB1dGVTb3VyY2VVUkwoc21jLnNvdXJjZVJvb3QsIHMsIGFTb3VyY2VNYXBVUkwpO1xuICAgIH0pO1xuXG4gICAgLy8gQmVjYXVzZSB3ZSBhcmUgbW9kaWZ5aW5nIHRoZSBlbnRyaWVzIChieSBjb252ZXJ0aW5nIHN0cmluZyBzb3VyY2VzIGFuZFxuICAgIC8vIG5hbWVzIHRvIGluZGljZXMgaW50byB0aGUgc291cmNlcyBhbmQgbmFtZXMgQXJyYXlTZXRzKSwgd2UgaGF2ZSB0byBtYWtlXG4gICAgLy8gYSBjb3B5IG9mIHRoZSBlbnRyeSBvciBlbHNlIGJhZCB0aGluZ3MgaGFwcGVuLiBTaGFyZWQgbXV0YWJsZSBzdGF0ZVxuICAgIC8vIHN0cmlrZXMgYWdhaW4hIFNlZSBnaXRodWIgaXNzdWUgIzE5MS5cblxuICAgIHZhciBnZW5lcmF0ZWRNYXBwaW5ncyA9IGFTb3VyY2VNYXAuX21hcHBpbmdzLnRvQXJyYXkoKS5zbGljZSgpO1xuICAgIHZhciBkZXN0R2VuZXJhdGVkTWFwcGluZ3MgPSBzbWMuX19nZW5lcmF0ZWRNYXBwaW5ncyA9IFtdO1xuICAgIHZhciBkZXN0T3JpZ2luYWxNYXBwaW5ncyA9IHNtYy5fX29yaWdpbmFsTWFwcGluZ3MgPSBbXTtcblxuICAgIGZvciAodmFyIGkgPSAwLCBsZW5ndGggPSBnZW5lcmF0ZWRNYXBwaW5ncy5sZW5ndGg7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgdmFyIHNyY01hcHBpbmcgPSBnZW5lcmF0ZWRNYXBwaW5nc1tpXTtcbiAgICAgIHZhciBkZXN0TWFwcGluZyA9IG5ldyBNYXBwaW5nO1xuICAgICAgZGVzdE1hcHBpbmcuZ2VuZXJhdGVkTGluZSA9IHNyY01hcHBpbmcuZ2VuZXJhdGVkTGluZTtcbiAgICAgIGRlc3RNYXBwaW5nLmdlbmVyYXRlZENvbHVtbiA9IHNyY01hcHBpbmcuZ2VuZXJhdGVkQ29sdW1uO1xuXG4gICAgICBpZiAoc3JjTWFwcGluZy5zb3VyY2UpIHtcbiAgICAgICAgZGVzdE1hcHBpbmcuc291cmNlID0gc291cmNlcy5pbmRleE9mKHNyY01hcHBpbmcuc291cmNlKTtcbiAgICAgICAgZGVzdE1hcHBpbmcub3JpZ2luYWxMaW5lID0gc3JjTWFwcGluZy5vcmlnaW5hbExpbmU7XG4gICAgICAgIGRlc3RNYXBwaW5nLm9yaWdpbmFsQ29sdW1uID0gc3JjTWFwcGluZy5vcmlnaW5hbENvbHVtbjtcblxuICAgICAgICBpZiAoc3JjTWFwcGluZy5uYW1lKSB7XG4gICAgICAgICAgZGVzdE1hcHBpbmcubmFtZSA9IG5hbWVzLmluZGV4T2Yoc3JjTWFwcGluZy5uYW1lKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGRlc3RPcmlnaW5hbE1hcHBpbmdzLnB1c2goZGVzdE1hcHBpbmcpO1xuICAgICAgfVxuXG4gICAgICBkZXN0R2VuZXJhdGVkTWFwcGluZ3MucHVzaChkZXN0TWFwcGluZyk7XG4gICAgfVxuXG4gICAgcXVpY2tTb3J0KHNtYy5fX29yaWdpbmFsTWFwcGluZ3MsIHV0aWwuY29tcGFyZUJ5T3JpZ2luYWxQb3NpdGlvbnMpO1xuXG4gICAgcmV0dXJuIHNtYztcbiAgfTtcblxuLyoqXG4gKiBUaGUgdmVyc2lvbiBvZiB0aGUgc291cmNlIG1hcHBpbmcgc3BlYyB0aGF0IHdlIGFyZSBjb25zdW1pbmcuXG4gKi9cbkJhc2ljU291cmNlTWFwQ29uc3VtZXIucHJvdG90eXBlLl92ZXJzaW9uID0gMztcblxuLyoqXG4gKiBUaGUgbGlzdCBvZiBvcmlnaW5hbCBzb3VyY2VzLlxuICovXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoQmFzaWNTb3VyY2VNYXBDb25zdW1lci5wcm90b3R5cGUsICdzb3VyY2VzJywge1xuICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdGhpcy5fYWJzb2x1dGVTb3VyY2VzLnNsaWNlKCk7XG4gIH1cbn0pO1xuXG4vKipcbiAqIFByb3ZpZGUgdGhlIEpJVCB3aXRoIGEgbmljZSBzaGFwZSAvIGhpZGRlbiBjbGFzcy5cbiAqL1xuZnVuY3Rpb24gTWFwcGluZygpIHtcbiAgdGhpcy5nZW5lcmF0ZWRMaW5lID0gMDtcbiAgdGhpcy5nZW5lcmF0ZWRDb2x1bW4gPSAwO1xuICB0aGlzLnNvdXJjZSA9IG51bGw7XG4gIHRoaXMub3JpZ2luYWxMaW5lID0gbnVsbDtcbiAgdGhpcy5vcmlnaW5hbENvbHVtbiA9IG51bGw7XG4gIHRoaXMubmFtZSA9IG51bGw7XG59XG5cbi8qKlxuICogUGFyc2UgdGhlIG1hcHBpbmdzIGluIGEgc3RyaW5nIGluIHRvIGEgZGF0YSBzdHJ1Y3R1cmUgd2hpY2ggd2UgY2FuIGVhc2lseVxuICogcXVlcnkgKHRoZSBvcmRlcmVkIGFycmF5cyBpbiB0aGUgYHRoaXMuX19nZW5lcmF0ZWRNYXBwaW5nc2AgYW5kXG4gKiBgdGhpcy5fX29yaWdpbmFsTWFwcGluZ3NgIHByb3BlcnRpZXMpLlxuICovXG5cbmNvbnN0IGNvbXBhcmVHZW5lcmF0ZWQgPSB1dGlsLmNvbXBhcmVCeUdlbmVyYXRlZFBvc2l0aW9uc0RlZmxhdGVkTm9MaW5lO1xuZnVuY3Rpb24gc29ydEdlbmVyYXRlZChhcnJheSwgc3RhcnQpIHtcbiAgbGV0IGwgPSBhcnJheS5sZW5ndGg7XG4gIGxldCBuID0gYXJyYXkubGVuZ3RoIC0gc3RhcnQ7XG4gIGlmIChuIDw9IDEpIHtcbiAgICByZXR1cm47XG4gIH0gZWxzZSBpZiAobiA9PSAyKSB7XG4gICAgbGV0IGEgPSBhcnJheVtzdGFydF07XG4gICAgbGV0IGIgPSBhcnJheVtzdGFydCArIDFdO1xuICAgIGlmIChjb21wYXJlR2VuZXJhdGVkKGEsIGIpID4gMCkge1xuICAgICAgYXJyYXlbc3RhcnRdID0gYjtcbiAgICAgIGFycmF5W3N0YXJ0ICsgMV0gPSBhO1xuICAgIH1cbiAgfSBlbHNlIGlmIChuIDwgMjApIHtcbiAgICBmb3IgKGxldCBpID0gc3RhcnQ7IGkgPCBsOyBpKyspIHtcbiAgICAgIGZvciAobGV0IGogPSBpOyBqID4gc3RhcnQ7IGotLSkge1xuICAgICAgICBsZXQgYSA9IGFycmF5W2ogLSAxXTtcbiAgICAgICAgbGV0IGIgPSBhcnJheVtqXTtcbiAgICAgICAgaWYgKGNvbXBhcmVHZW5lcmF0ZWQoYSwgYikgPD0gMCkge1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICAgIGFycmF5W2ogLSAxXSA9IGI7XG4gICAgICAgIGFycmF5W2pdID0gYTtcbiAgICAgIH1cbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgcXVpY2tTb3J0KGFycmF5LCBjb21wYXJlR2VuZXJhdGVkLCBzdGFydCk7XG4gIH1cbn1cbkJhc2ljU291cmNlTWFwQ29uc3VtZXIucHJvdG90eXBlLl9wYXJzZU1hcHBpbmdzID1cbiAgZnVuY3Rpb24gU291cmNlTWFwQ29uc3VtZXJfcGFyc2VNYXBwaW5ncyhhU3RyLCBhU291cmNlUm9vdCkge1xuICAgIHZhciBnZW5lcmF0ZWRMaW5lID0gMTtcbiAgICB2YXIgcHJldmlvdXNHZW5lcmF0ZWRDb2x1bW4gPSAwO1xuICAgIHZhciBwcmV2aW91c09yaWdpbmFsTGluZSA9IDA7XG4gICAgdmFyIHByZXZpb3VzT3JpZ2luYWxDb2x1bW4gPSAwO1xuICAgIHZhciBwcmV2aW91c1NvdXJjZSA9IDA7XG4gICAgdmFyIHByZXZpb3VzTmFtZSA9IDA7XG4gICAgdmFyIGxlbmd0aCA9IGFTdHIubGVuZ3RoO1xuICAgIHZhciBpbmRleCA9IDA7XG4gICAgdmFyIGNhY2hlZFNlZ21lbnRzID0ge307XG4gICAgdmFyIHRlbXAgPSB7fTtcbiAgICB2YXIgb3JpZ2luYWxNYXBwaW5ncyA9IFtdO1xuICAgIHZhciBnZW5lcmF0ZWRNYXBwaW5ncyA9IFtdO1xuICAgIHZhciBtYXBwaW5nLCBzdHIsIHNlZ21lbnQsIGVuZCwgdmFsdWU7XG5cbiAgICBsZXQgc3ViYXJyYXlTdGFydCA9IDA7XG4gICAgd2hpbGUgKGluZGV4IDwgbGVuZ3RoKSB7XG4gICAgICBpZiAoYVN0ci5jaGFyQXQoaW5kZXgpID09PSAnOycpIHtcbiAgICAgICAgZ2VuZXJhdGVkTGluZSsrO1xuICAgICAgICBpbmRleCsrO1xuICAgICAgICBwcmV2aW91c0dlbmVyYXRlZENvbHVtbiA9IDA7XG5cbiAgICAgICAgc29ydEdlbmVyYXRlZChnZW5lcmF0ZWRNYXBwaW5ncywgc3ViYXJyYXlTdGFydCk7XG4gICAgICAgIHN1YmFycmF5U3RhcnQgPSBnZW5lcmF0ZWRNYXBwaW5ncy5sZW5ndGg7XG4gICAgICB9XG4gICAgICBlbHNlIGlmIChhU3RyLmNoYXJBdChpbmRleCkgPT09ICcsJykge1xuICAgICAgICBpbmRleCsrO1xuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgIG1hcHBpbmcgPSBuZXcgTWFwcGluZygpO1xuICAgICAgICBtYXBwaW5nLmdlbmVyYXRlZExpbmUgPSBnZW5lcmF0ZWRMaW5lO1xuXG4gICAgICAgIGZvciAoZW5kID0gaW5kZXg7IGVuZCA8IGxlbmd0aDsgZW5kKyspIHtcbiAgICAgICAgICBpZiAodGhpcy5fY2hhcklzTWFwcGluZ1NlcGFyYXRvcihhU3RyLCBlbmQpKSB7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgc3RyID0gYVN0ci5zbGljZShpbmRleCwgZW5kKTtcblxuICAgICAgICBzZWdtZW50ID0gW107XG4gICAgICAgIHdoaWxlIChpbmRleCA8IGVuZCkge1xuICAgICAgICAgIGJhc2U2NFZMUS5kZWNvZGUoYVN0ciwgaW5kZXgsIHRlbXApO1xuICAgICAgICAgIHZhbHVlID0gdGVtcC52YWx1ZTtcbiAgICAgICAgICBpbmRleCA9IHRlbXAucmVzdDtcbiAgICAgICAgICBzZWdtZW50LnB1c2godmFsdWUpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHNlZ21lbnQubGVuZ3RoID09PSAyKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdGb3VuZCBhIHNvdXJjZSwgYnV0IG5vIGxpbmUgYW5kIGNvbHVtbicpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHNlZ21lbnQubGVuZ3RoID09PSAzKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdGb3VuZCBhIHNvdXJjZSBhbmQgbGluZSwgYnV0IG5vIGNvbHVtbicpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gR2VuZXJhdGVkIGNvbHVtbi5cbiAgICAgICAgbWFwcGluZy5nZW5lcmF0ZWRDb2x1bW4gPSBwcmV2aW91c0dlbmVyYXRlZENvbHVtbiArIHNlZ21lbnRbMF07XG4gICAgICAgIHByZXZpb3VzR2VuZXJhdGVkQ29sdW1uID0gbWFwcGluZy5nZW5lcmF0ZWRDb2x1bW47XG5cbiAgICAgICAgaWYgKHNlZ21lbnQubGVuZ3RoID4gMSkge1xuICAgICAgICAgIC8vIE9yaWdpbmFsIHNvdXJjZS5cbiAgICAgICAgICBtYXBwaW5nLnNvdXJjZSA9IHByZXZpb3VzU291cmNlICsgc2VnbWVudFsxXTtcbiAgICAgICAgICBwcmV2aW91c1NvdXJjZSArPSBzZWdtZW50WzFdO1xuXG4gICAgICAgICAgLy8gT3JpZ2luYWwgbGluZS5cbiAgICAgICAgICBtYXBwaW5nLm9yaWdpbmFsTGluZSA9IHByZXZpb3VzT3JpZ2luYWxMaW5lICsgc2VnbWVudFsyXTtcbiAgICAgICAgICBwcmV2aW91c09yaWdpbmFsTGluZSA9IG1hcHBpbmcub3JpZ2luYWxMaW5lO1xuICAgICAgICAgIC8vIExpbmVzIGFyZSBzdG9yZWQgMC1iYXNlZFxuICAgICAgICAgIG1hcHBpbmcub3JpZ2luYWxMaW5lICs9IDE7XG5cbiAgICAgICAgICAvLyBPcmlnaW5hbCBjb2x1bW4uXG4gICAgICAgICAgbWFwcGluZy5vcmlnaW5hbENvbHVtbiA9IHByZXZpb3VzT3JpZ2luYWxDb2x1bW4gKyBzZWdtZW50WzNdO1xuICAgICAgICAgIHByZXZpb3VzT3JpZ2luYWxDb2x1bW4gPSBtYXBwaW5nLm9yaWdpbmFsQ29sdW1uO1xuXG4gICAgICAgICAgaWYgKHNlZ21lbnQubGVuZ3RoID4gNCkge1xuICAgICAgICAgICAgLy8gT3JpZ2luYWwgbmFtZS5cbiAgICAgICAgICAgIG1hcHBpbmcubmFtZSA9IHByZXZpb3VzTmFtZSArIHNlZ21lbnRbNF07XG4gICAgICAgICAgICBwcmV2aW91c05hbWUgKz0gc2VnbWVudFs0XTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBnZW5lcmF0ZWRNYXBwaW5ncy5wdXNoKG1hcHBpbmcpO1xuICAgICAgICBpZiAodHlwZW9mIG1hcHBpbmcub3JpZ2luYWxMaW5lID09PSAnbnVtYmVyJykge1xuICAgICAgICAgIGxldCBjdXJyZW50U291cmNlID0gbWFwcGluZy5zb3VyY2U7XG4gICAgICAgICAgd2hpbGUgKG9yaWdpbmFsTWFwcGluZ3MubGVuZ3RoIDw9IGN1cnJlbnRTb3VyY2UpIHtcbiAgICAgICAgICAgIG9yaWdpbmFsTWFwcGluZ3MucHVzaChudWxsKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKG9yaWdpbmFsTWFwcGluZ3NbY3VycmVudFNvdXJjZV0gPT09IG51bGwpIHtcbiAgICAgICAgICAgIG9yaWdpbmFsTWFwcGluZ3NbY3VycmVudFNvdXJjZV0gPSBbXTtcbiAgICAgICAgICB9XG4gICAgICAgICAgb3JpZ2luYWxNYXBwaW5nc1tjdXJyZW50U291cmNlXS5wdXNoKG1hcHBpbmcpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgc29ydEdlbmVyYXRlZChnZW5lcmF0ZWRNYXBwaW5ncywgc3ViYXJyYXlTdGFydCk7XG4gICAgdGhpcy5fX2dlbmVyYXRlZE1hcHBpbmdzID0gZ2VuZXJhdGVkTWFwcGluZ3M7XG5cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IG9yaWdpbmFsTWFwcGluZ3MubGVuZ3RoOyBpKyspIHtcbiAgICAgIGlmIChvcmlnaW5hbE1hcHBpbmdzW2ldICE9IG51bGwpIHtcbiAgICAgICAgcXVpY2tTb3J0KG9yaWdpbmFsTWFwcGluZ3NbaV0sIHV0aWwuY29tcGFyZUJ5T3JpZ2luYWxQb3NpdGlvbnNOb1NvdXJjZSk7XG4gICAgICB9XG4gICAgfVxuICAgIHRoaXMuX19vcmlnaW5hbE1hcHBpbmdzID0gW10uY29uY2F0KC4uLm9yaWdpbmFsTWFwcGluZ3MpO1xuICB9O1xuXG4vKipcbiAqIEZpbmQgdGhlIG1hcHBpbmcgdGhhdCBiZXN0IG1hdGNoZXMgdGhlIGh5cG90aGV0aWNhbCBcIm5lZWRsZVwiIG1hcHBpbmcgdGhhdFxuICogd2UgYXJlIHNlYXJjaGluZyBmb3IgaW4gdGhlIGdpdmVuIFwiaGF5c3RhY2tcIiBvZiBtYXBwaW5ncy5cbiAqL1xuQmFzaWNTb3VyY2VNYXBDb25zdW1lci5wcm90b3R5cGUuX2ZpbmRNYXBwaW5nID1cbiAgZnVuY3Rpb24gU291cmNlTWFwQ29uc3VtZXJfZmluZE1hcHBpbmcoYU5lZWRsZSwgYU1hcHBpbmdzLCBhTGluZU5hbWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFDb2x1bW5OYW1lLCBhQ29tcGFyYXRvciwgYUJpYXMpIHtcbiAgICAvLyBUbyByZXR1cm4gdGhlIHBvc2l0aW9uIHdlIGFyZSBzZWFyY2hpbmcgZm9yLCB3ZSBtdXN0IGZpcnN0IGZpbmQgdGhlXG4gICAgLy8gbWFwcGluZyBmb3IgdGhlIGdpdmVuIHBvc2l0aW9uIGFuZCB0aGVuIHJldHVybiB0aGUgb3Bwb3NpdGUgcG9zaXRpb24gaXRcbiAgICAvLyBwb2ludHMgdG8uIEJlY2F1c2UgdGhlIG1hcHBpbmdzIGFyZSBzb3J0ZWQsIHdlIGNhbiB1c2UgYmluYXJ5IHNlYXJjaCB0b1xuICAgIC8vIGZpbmQgdGhlIGJlc3QgbWFwcGluZy5cblxuICAgIGlmIChhTmVlZGxlW2FMaW5lTmFtZV0gPD0gMCkge1xuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignTGluZSBtdXN0IGJlIGdyZWF0ZXIgdGhhbiBvciBlcXVhbCB0byAxLCBnb3QgJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICArIGFOZWVkbGVbYUxpbmVOYW1lXSk7XG4gICAgfVxuICAgIGlmIChhTmVlZGxlW2FDb2x1bW5OYW1lXSA8IDApIHtcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0NvbHVtbiBtdXN0IGJlIGdyZWF0ZXIgdGhhbiBvciBlcXVhbCB0byAwLCBnb3QgJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICArIGFOZWVkbGVbYUNvbHVtbk5hbWVdKTtcbiAgICB9XG5cbiAgICByZXR1cm4gYmluYXJ5U2VhcmNoLnNlYXJjaChhTmVlZGxlLCBhTWFwcGluZ3MsIGFDb21wYXJhdG9yLCBhQmlhcyk7XG4gIH07XG5cbi8qKlxuICogQ29tcHV0ZSB0aGUgbGFzdCBjb2x1bW4gZm9yIGVhY2ggZ2VuZXJhdGVkIG1hcHBpbmcuIFRoZSBsYXN0IGNvbHVtbiBpc1xuICogaW5jbHVzaXZlLlxuICovXG5CYXNpY1NvdXJjZU1hcENvbnN1bWVyLnByb3RvdHlwZS5jb21wdXRlQ29sdW1uU3BhbnMgPVxuICBmdW5jdGlvbiBTb3VyY2VNYXBDb25zdW1lcl9jb21wdXRlQ29sdW1uU3BhbnMoKSB7XG4gICAgZm9yICh2YXIgaW5kZXggPSAwOyBpbmRleCA8IHRoaXMuX2dlbmVyYXRlZE1hcHBpbmdzLmxlbmd0aDsgKytpbmRleCkge1xuICAgICAgdmFyIG1hcHBpbmcgPSB0aGlzLl9nZW5lcmF0ZWRNYXBwaW5nc1tpbmRleF07XG5cbiAgICAgIC8vIE1hcHBpbmdzIGRvIG5vdCBjb250YWluIGEgZmllbGQgZm9yIHRoZSBsYXN0IGdlbmVyYXRlZCBjb2x1bW50LiBXZVxuICAgICAgLy8gY2FuIGNvbWUgdXAgd2l0aCBhbiBvcHRpbWlzdGljIGVzdGltYXRlLCBob3dldmVyLCBieSBhc3N1bWluZyB0aGF0XG4gICAgICAvLyBtYXBwaW5ncyBhcmUgY29udGlndW91cyAoaS5lLiBnaXZlbiB0d28gY29uc2VjdXRpdmUgbWFwcGluZ3MsIHRoZVxuICAgICAgLy8gZmlyc3QgbWFwcGluZyBlbmRzIHdoZXJlIHRoZSBzZWNvbmQgb25lIHN0YXJ0cykuXG4gICAgICBpZiAoaW5kZXggKyAxIDwgdGhpcy5fZ2VuZXJhdGVkTWFwcGluZ3MubGVuZ3RoKSB7XG4gICAgICAgIHZhciBuZXh0TWFwcGluZyA9IHRoaXMuX2dlbmVyYXRlZE1hcHBpbmdzW2luZGV4ICsgMV07XG5cbiAgICAgICAgaWYgKG1hcHBpbmcuZ2VuZXJhdGVkTGluZSA9PT0gbmV4dE1hcHBpbmcuZ2VuZXJhdGVkTGluZSkge1xuICAgICAgICAgIG1hcHBpbmcubGFzdEdlbmVyYXRlZENvbHVtbiA9IG5leHRNYXBwaW5nLmdlbmVyYXRlZENvbHVtbiAtIDE7XG4gICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLy8gVGhlIGxhc3QgbWFwcGluZyBmb3IgZWFjaCBsaW5lIHNwYW5zIHRoZSBlbnRpcmUgbGluZS5cbiAgICAgIG1hcHBpbmcubGFzdEdlbmVyYXRlZENvbHVtbiA9IEluZmluaXR5O1xuICAgIH1cbiAgfTtcblxuLyoqXG4gKiBSZXR1cm5zIHRoZSBvcmlnaW5hbCBzb3VyY2UsIGxpbmUsIGFuZCBjb2x1bW4gaW5mb3JtYXRpb24gZm9yIHRoZSBnZW5lcmF0ZWRcbiAqIHNvdXJjZSdzIGxpbmUgYW5kIGNvbHVtbiBwb3NpdGlvbnMgcHJvdmlkZWQuIFRoZSBvbmx5IGFyZ3VtZW50IGlzIGFuIG9iamVjdFxuICogd2l0aCB0aGUgZm9sbG93aW5nIHByb3BlcnRpZXM6XG4gKlxuICogICAtIGxpbmU6IFRoZSBsaW5lIG51bWJlciBpbiB0aGUgZ2VuZXJhdGVkIHNvdXJjZS4gIFRoZSBsaW5lIG51bWJlclxuICogICAgIGlzIDEtYmFzZWQuXG4gKiAgIC0gY29sdW1uOiBUaGUgY29sdW1uIG51bWJlciBpbiB0aGUgZ2VuZXJhdGVkIHNvdXJjZS4gIFRoZSBjb2x1bW5cbiAqICAgICBudW1iZXIgaXMgMC1iYXNlZC5cbiAqICAgLSBiaWFzOiBFaXRoZXIgJ1NvdXJjZU1hcENvbnN1bWVyLkdSRUFURVNUX0xPV0VSX0JPVU5EJyBvclxuICogICAgICdTb3VyY2VNYXBDb25zdW1lci5MRUFTVF9VUFBFUl9CT1VORCcuIFNwZWNpZmllcyB3aGV0aGVyIHRvIHJldHVybiB0aGVcbiAqICAgICBjbG9zZXN0IGVsZW1lbnQgdGhhdCBpcyBzbWFsbGVyIHRoYW4gb3IgZ3JlYXRlciB0aGFuIHRoZSBvbmUgd2UgYXJlXG4gKiAgICAgc2VhcmNoaW5nIGZvciwgcmVzcGVjdGl2ZWx5LCBpZiB0aGUgZXhhY3QgZWxlbWVudCBjYW5ub3QgYmUgZm91bmQuXG4gKiAgICAgRGVmYXVsdHMgdG8gJ1NvdXJjZU1hcENvbnN1bWVyLkdSRUFURVNUX0xPV0VSX0JPVU5EJy5cbiAqXG4gKiBhbmQgYW4gb2JqZWN0IGlzIHJldHVybmVkIHdpdGggdGhlIGZvbGxvd2luZyBwcm9wZXJ0aWVzOlxuICpcbiAqICAgLSBzb3VyY2U6IFRoZSBvcmlnaW5hbCBzb3VyY2UgZmlsZSwgb3IgbnVsbC5cbiAqICAgLSBsaW5lOiBUaGUgbGluZSBudW1iZXIgaW4gdGhlIG9yaWdpbmFsIHNvdXJjZSwgb3IgbnVsbC4gIFRoZVxuICogICAgIGxpbmUgbnVtYmVyIGlzIDEtYmFzZWQuXG4gKiAgIC0gY29sdW1uOiBUaGUgY29sdW1uIG51bWJlciBpbiB0aGUgb3JpZ2luYWwgc291cmNlLCBvciBudWxsLiAgVGhlXG4gKiAgICAgY29sdW1uIG51bWJlciBpcyAwLWJhc2VkLlxuICogICAtIG5hbWU6IFRoZSBvcmlnaW5hbCBpZGVudGlmaWVyLCBvciBudWxsLlxuICovXG5CYXNpY1NvdXJjZU1hcENvbnN1bWVyLnByb3RvdHlwZS5vcmlnaW5hbFBvc2l0aW9uRm9yID1cbiAgZnVuY3Rpb24gU291cmNlTWFwQ29uc3VtZXJfb3JpZ2luYWxQb3NpdGlvbkZvcihhQXJncykge1xuICAgIHZhciBuZWVkbGUgPSB7XG4gICAgICBnZW5lcmF0ZWRMaW5lOiB1dGlsLmdldEFyZyhhQXJncywgJ2xpbmUnKSxcbiAgICAgIGdlbmVyYXRlZENvbHVtbjogdXRpbC5nZXRBcmcoYUFyZ3MsICdjb2x1bW4nKVxuICAgIH07XG5cbiAgICB2YXIgaW5kZXggPSB0aGlzLl9maW5kTWFwcGluZyhcbiAgICAgIG5lZWRsZSxcbiAgICAgIHRoaXMuX2dlbmVyYXRlZE1hcHBpbmdzLFxuICAgICAgXCJnZW5lcmF0ZWRMaW5lXCIsXG4gICAgICBcImdlbmVyYXRlZENvbHVtblwiLFxuICAgICAgdXRpbC5jb21wYXJlQnlHZW5lcmF0ZWRQb3NpdGlvbnNEZWZsYXRlZCxcbiAgICAgIHV0aWwuZ2V0QXJnKGFBcmdzLCAnYmlhcycsIFNvdXJjZU1hcENvbnN1bWVyLkdSRUFURVNUX0xPV0VSX0JPVU5EKVxuICAgICk7XG5cbiAgICBpZiAoaW5kZXggPj0gMCkge1xuICAgICAgdmFyIG1hcHBpbmcgPSB0aGlzLl9nZW5lcmF0ZWRNYXBwaW5nc1tpbmRleF07XG5cbiAgICAgIGlmIChtYXBwaW5nLmdlbmVyYXRlZExpbmUgPT09IG5lZWRsZS5nZW5lcmF0ZWRMaW5lKSB7XG4gICAgICAgIHZhciBzb3VyY2UgPSB1dGlsLmdldEFyZyhtYXBwaW5nLCAnc291cmNlJywgbnVsbCk7XG4gICAgICAgIGlmIChzb3VyY2UgIT09IG51bGwpIHtcbiAgICAgICAgICBzb3VyY2UgPSB0aGlzLl9zb3VyY2VzLmF0KHNvdXJjZSk7XG4gICAgICAgICAgc291cmNlID0gdXRpbC5jb21wdXRlU291cmNlVVJMKHRoaXMuc291cmNlUm9vdCwgc291cmNlLCB0aGlzLl9zb3VyY2VNYXBVUkwpO1xuICAgICAgICB9XG4gICAgICAgIHZhciBuYW1lID0gdXRpbC5nZXRBcmcobWFwcGluZywgJ25hbWUnLCBudWxsKTtcbiAgICAgICAgaWYgKG5hbWUgIT09IG51bGwpIHtcbiAgICAgICAgICBuYW1lID0gdGhpcy5fbmFtZXMuYXQobmFtZSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICBzb3VyY2U6IHNvdXJjZSxcbiAgICAgICAgICBsaW5lOiB1dGlsLmdldEFyZyhtYXBwaW5nLCAnb3JpZ2luYWxMaW5lJywgbnVsbCksXG4gICAgICAgICAgY29sdW1uOiB1dGlsLmdldEFyZyhtYXBwaW5nLCAnb3JpZ2luYWxDb2x1bW4nLCBudWxsKSxcbiAgICAgICAgICBuYW1lOiBuYW1lXG4gICAgICAgIH07XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHtcbiAgICAgIHNvdXJjZTogbnVsbCxcbiAgICAgIGxpbmU6IG51bGwsXG4gICAgICBjb2x1bW46IG51bGwsXG4gICAgICBuYW1lOiBudWxsXG4gICAgfTtcbiAgfTtcblxuLyoqXG4gKiBSZXR1cm4gdHJ1ZSBpZiB3ZSBoYXZlIHRoZSBzb3VyY2UgY29udGVudCBmb3IgZXZlcnkgc291cmNlIGluIHRoZSBzb3VyY2VcbiAqIG1hcCwgZmFsc2Ugb3RoZXJ3aXNlLlxuICovXG5CYXNpY1NvdXJjZU1hcENvbnN1bWVyLnByb3RvdHlwZS5oYXNDb250ZW50c09mQWxsU291cmNlcyA9XG4gIGZ1bmN0aW9uIEJhc2ljU291cmNlTWFwQ29uc3VtZXJfaGFzQ29udGVudHNPZkFsbFNvdXJjZXMoKSB7XG4gICAgaWYgKCF0aGlzLnNvdXJjZXNDb250ZW50KSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLnNvdXJjZXNDb250ZW50Lmxlbmd0aCA+PSB0aGlzLl9zb3VyY2VzLnNpemUoKSAmJlxuICAgICAgIXRoaXMuc291cmNlc0NvbnRlbnQuc29tZShmdW5jdGlvbiAoc2MpIHsgcmV0dXJuIHNjID09IG51bGw7IH0pO1xuICB9O1xuXG4vKipcbiAqIFJldHVybnMgdGhlIG9yaWdpbmFsIHNvdXJjZSBjb250ZW50LiBUaGUgb25seSBhcmd1bWVudCBpcyB0aGUgdXJsIG9mIHRoZVxuICogb3JpZ2luYWwgc291cmNlIGZpbGUuIFJldHVybnMgbnVsbCBpZiBubyBvcmlnaW5hbCBzb3VyY2UgY29udGVudCBpc1xuICogYXZhaWxhYmxlLlxuICovXG5CYXNpY1NvdXJjZU1hcENvbnN1bWVyLnByb3RvdHlwZS5zb3VyY2VDb250ZW50Rm9yID1cbiAgZnVuY3Rpb24gU291cmNlTWFwQ29uc3VtZXJfc291cmNlQ29udGVudEZvcihhU291cmNlLCBudWxsT25NaXNzaW5nKSB7XG4gICAgaWYgKCF0aGlzLnNvdXJjZXNDb250ZW50KSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICB2YXIgaW5kZXggPSB0aGlzLl9maW5kU291cmNlSW5kZXgoYVNvdXJjZSk7XG4gICAgaWYgKGluZGV4ID49IDApIHtcbiAgICAgIHJldHVybiB0aGlzLnNvdXJjZXNDb250ZW50W2luZGV4XTtcbiAgICB9XG5cbiAgICB2YXIgcmVsYXRpdmVTb3VyY2UgPSBhU291cmNlO1xuICAgIGlmICh0aGlzLnNvdXJjZVJvb3QgIT0gbnVsbCkge1xuICAgICAgcmVsYXRpdmVTb3VyY2UgPSB1dGlsLnJlbGF0aXZlKHRoaXMuc291cmNlUm9vdCwgcmVsYXRpdmVTb3VyY2UpO1xuICAgIH1cblxuICAgIHZhciB1cmw7XG4gICAgaWYgKHRoaXMuc291cmNlUm9vdCAhPSBudWxsXG4gICAgICAgICYmICh1cmwgPSB1dGlsLnVybFBhcnNlKHRoaXMuc291cmNlUm9vdCkpKSB7XG4gICAgICAvLyBYWFg6IGZpbGU6Ly8gVVJJcyBhbmQgYWJzb2x1dGUgcGF0aHMgbGVhZCB0byB1bmV4cGVjdGVkIGJlaGF2aW9yIGZvclxuICAgICAgLy8gbWFueSB1c2Vycy4gV2UgY2FuIGhlbHAgdGhlbSBvdXQgd2hlbiB0aGV5IGV4cGVjdCBmaWxlOi8vIFVSSXMgdG9cbiAgICAgIC8vIGJlaGF2ZSBsaWtlIGl0IHdvdWxkIGlmIHRoZXkgd2VyZSBydW5uaW5nIGEgbG9jYWwgSFRUUCBzZXJ2ZXIuIFNlZVxuICAgICAgLy8gaHR0cHM6Ly9idWd6aWxsYS5tb3ppbGxhLm9yZy9zaG93X2J1Zy5jZ2k/aWQ9ODg1NTk3LlxuICAgICAgdmFyIGZpbGVVcmlBYnNQYXRoID0gcmVsYXRpdmVTb3VyY2UucmVwbGFjZSgvXmZpbGU6XFwvXFwvLywgXCJcIik7XG4gICAgICBpZiAodXJsLnNjaGVtZSA9PSBcImZpbGVcIlxuICAgICAgICAgICYmIHRoaXMuX3NvdXJjZXMuaGFzKGZpbGVVcmlBYnNQYXRoKSkge1xuICAgICAgICByZXR1cm4gdGhpcy5zb3VyY2VzQ29udGVudFt0aGlzLl9zb3VyY2VzLmluZGV4T2YoZmlsZVVyaUFic1BhdGgpXVxuICAgICAgfVxuXG4gICAgICBpZiAoKCF1cmwucGF0aCB8fCB1cmwucGF0aCA9PSBcIi9cIilcbiAgICAgICAgICAmJiB0aGlzLl9zb3VyY2VzLmhhcyhcIi9cIiArIHJlbGF0aXZlU291cmNlKSkge1xuICAgICAgICByZXR1cm4gdGhpcy5zb3VyY2VzQ29udGVudFt0aGlzLl9zb3VyY2VzLmluZGV4T2YoXCIvXCIgKyByZWxhdGl2ZVNvdXJjZSldO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIFRoaXMgZnVuY3Rpb24gaXMgdXNlZCByZWN1cnNpdmVseSBmcm9tXG4gICAgLy8gSW5kZXhlZFNvdXJjZU1hcENvbnN1bWVyLnByb3RvdHlwZS5zb3VyY2VDb250ZW50Rm9yLiBJbiB0aGF0IGNhc2UsIHdlXG4gICAgLy8gZG9uJ3Qgd2FudCB0byB0aHJvdyBpZiB3ZSBjYW4ndCBmaW5kIHRoZSBzb3VyY2UgLSB3ZSBqdXN0IHdhbnQgdG9cbiAgICAvLyByZXR1cm4gbnVsbCwgc28gd2UgcHJvdmlkZSBhIGZsYWcgdG8gZXhpdCBncmFjZWZ1bGx5LlxuICAgIGlmIChudWxsT25NaXNzaW5nKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ1wiJyArIHJlbGF0aXZlU291cmNlICsgJ1wiIGlzIG5vdCBpbiB0aGUgU291cmNlTWFwLicpO1xuICAgIH1cbiAgfTtcblxuLyoqXG4gKiBSZXR1cm5zIHRoZSBnZW5lcmF0ZWQgbGluZSBhbmQgY29sdW1uIGluZm9ybWF0aW9uIGZvciB0aGUgb3JpZ2luYWwgc291cmNlLFxuICogbGluZSwgYW5kIGNvbHVtbiBwb3NpdGlvbnMgcHJvdmlkZWQuIFRoZSBvbmx5IGFyZ3VtZW50IGlzIGFuIG9iamVjdCB3aXRoXG4gKiB0aGUgZm9sbG93aW5nIHByb3BlcnRpZXM6XG4gKlxuICogICAtIHNvdXJjZTogVGhlIGZpbGVuYW1lIG9mIHRoZSBvcmlnaW5hbCBzb3VyY2UuXG4gKiAgIC0gbGluZTogVGhlIGxpbmUgbnVtYmVyIGluIHRoZSBvcmlnaW5hbCBzb3VyY2UuICBUaGUgbGluZSBudW1iZXJcbiAqICAgICBpcyAxLWJhc2VkLlxuICogICAtIGNvbHVtbjogVGhlIGNvbHVtbiBudW1iZXIgaW4gdGhlIG9yaWdpbmFsIHNvdXJjZS4gIFRoZSBjb2x1bW5cbiAqICAgICBudW1iZXIgaXMgMC1iYXNlZC5cbiAqICAgLSBiaWFzOiBFaXRoZXIgJ1NvdXJjZU1hcENvbnN1bWVyLkdSRUFURVNUX0xPV0VSX0JPVU5EJyBvclxuICogICAgICdTb3VyY2VNYXBDb25zdW1lci5MRUFTVF9VUFBFUl9CT1VORCcuIFNwZWNpZmllcyB3aGV0aGVyIHRvIHJldHVybiB0aGVcbiAqICAgICBjbG9zZXN0IGVsZW1lbnQgdGhhdCBpcyBzbWFsbGVyIHRoYW4gb3IgZ3JlYXRlciB0aGFuIHRoZSBvbmUgd2UgYXJlXG4gKiAgICAgc2VhcmNoaW5nIGZvciwgcmVzcGVjdGl2ZWx5LCBpZiB0aGUgZXhhY3QgZWxlbWVudCBjYW5ub3QgYmUgZm91bmQuXG4gKiAgICAgRGVmYXVsdHMgdG8gJ1NvdXJjZU1hcENvbnN1bWVyLkdSRUFURVNUX0xPV0VSX0JPVU5EJy5cbiAqXG4gKiBhbmQgYW4gb2JqZWN0IGlzIHJldHVybmVkIHdpdGggdGhlIGZvbGxvd2luZyBwcm9wZXJ0aWVzOlxuICpcbiAqICAgLSBsaW5lOiBUaGUgbGluZSBudW1iZXIgaW4gdGhlIGdlbmVyYXRlZCBzb3VyY2UsIG9yIG51bGwuICBUaGVcbiAqICAgICBsaW5lIG51bWJlciBpcyAxLWJhc2VkLlxuICogICAtIGNvbHVtbjogVGhlIGNvbHVtbiBudW1iZXIgaW4gdGhlIGdlbmVyYXRlZCBzb3VyY2UsIG9yIG51bGwuXG4gKiAgICAgVGhlIGNvbHVtbiBudW1iZXIgaXMgMC1iYXNlZC5cbiAqL1xuQmFzaWNTb3VyY2VNYXBDb25zdW1lci5wcm90b3R5cGUuZ2VuZXJhdGVkUG9zaXRpb25Gb3IgPVxuICBmdW5jdGlvbiBTb3VyY2VNYXBDb25zdW1lcl9nZW5lcmF0ZWRQb3NpdGlvbkZvcihhQXJncykge1xuICAgIHZhciBzb3VyY2UgPSB1dGlsLmdldEFyZyhhQXJncywgJ3NvdXJjZScpO1xuICAgIHNvdXJjZSA9IHRoaXMuX2ZpbmRTb3VyY2VJbmRleChzb3VyY2UpO1xuICAgIGlmIChzb3VyY2UgPCAwKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBsaW5lOiBudWxsLFxuICAgICAgICBjb2x1bW46IG51bGwsXG4gICAgICAgIGxhc3RDb2x1bW46IG51bGxcbiAgICAgIH07XG4gICAgfVxuXG4gICAgdmFyIG5lZWRsZSA9IHtcbiAgICAgIHNvdXJjZTogc291cmNlLFxuICAgICAgb3JpZ2luYWxMaW5lOiB1dGlsLmdldEFyZyhhQXJncywgJ2xpbmUnKSxcbiAgICAgIG9yaWdpbmFsQ29sdW1uOiB1dGlsLmdldEFyZyhhQXJncywgJ2NvbHVtbicpXG4gICAgfTtcblxuICAgIHZhciBpbmRleCA9IHRoaXMuX2ZpbmRNYXBwaW5nKFxuICAgICAgbmVlZGxlLFxuICAgICAgdGhpcy5fb3JpZ2luYWxNYXBwaW5ncyxcbiAgICAgIFwib3JpZ2luYWxMaW5lXCIsXG4gICAgICBcIm9yaWdpbmFsQ29sdW1uXCIsXG4gICAgICB1dGlsLmNvbXBhcmVCeU9yaWdpbmFsUG9zaXRpb25zLFxuICAgICAgdXRpbC5nZXRBcmcoYUFyZ3MsICdiaWFzJywgU291cmNlTWFwQ29uc3VtZXIuR1JFQVRFU1RfTE9XRVJfQk9VTkQpXG4gICAgKTtcblxuICAgIGlmIChpbmRleCA+PSAwKSB7XG4gICAgICB2YXIgbWFwcGluZyA9IHRoaXMuX29yaWdpbmFsTWFwcGluZ3NbaW5kZXhdO1xuXG4gICAgICBpZiAobWFwcGluZy5zb3VyY2UgPT09IG5lZWRsZS5zb3VyY2UpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICBsaW5lOiB1dGlsLmdldEFyZyhtYXBwaW5nLCAnZ2VuZXJhdGVkTGluZScsIG51bGwpLFxuICAgICAgICAgIGNvbHVtbjogdXRpbC5nZXRBcmcobWFwcGluZywgJ2dlbmVyYXRlZENvbHVtbicsIG51bGwpLFxuICAgICAgICAgIGxhc3RDb2x1bW46IHV0aWwuZ2V0QXJnKG1hcHBpbmcsICdsYXN0R2VuZXJhdGVkQ29sdW1uJywgbnVsbClcbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4ge1xuICAgICAgbGluZTogbnVsbCxcbiAgICAgIGNvbHVtbjogbnVsbCxcbiAgICAgIGxhc3RDb2x1bW46IG51bGxcbiAgICB9O1xuICB9O1xuXG5leHBvcnRzLkJhc2ljU291cmNlTWFwQ29uc3VtZXIgPSBCYXNpY1NvdXJjZU1hcENvbnN1bWVyO1xuXG4vKipcbiAqIEFuIEluZGV4ZWRTb3VyY2VNYXBDb25zdW1lciBpbnN0YW5jZSByZXByZXNlbnRzIGEgcGFyc2VkIHNvdXJjZSBtYXAgd2hpY2hcbiAqIHdlIGNhbiBxdWVyeSBmb3IgaW5mb3JtYXRpb24uIEl0IGRpZmZlcnMgZnJvbSBCYXNpY1NvdXJjZU1hcENvbnN1bWVyIGluXG4gKiB0aGF0IGl0IHRha2VzIFwiaW5kZXhlZFwiIHNvdXJjZSBtYXBzIChpLmUuIG9uZXMgd2l0aCBhIFwic2VjdGlvbnNcIiBmaWVsZCkgYXNcbiAqIGlucHV0LlxuICpcbiAqIFRoZSBmaXJzdCBwYXJhbWV0ZXIgaXMgYSByYXcgc291cmNlIG1hcCAoZWl0aGVyIGFzIGEgSlNPTiBzdHJpbmcsIG9yIGFscmVhZHlcbiAqIHBhcnNlZCB0byBhbiBvYmplY3QpLiBBY2NvcmRpbmcgdG8gdGhlIHNwZWMgZm9yIGluZGV4ZWQgc291cmNlIG1hcHMsIHRoZXlcbiAqIGhhdmUgdGhlIGZvbGxvd2luZyBhdHRyaWJ1dGVzOlxuICpcbiAqICAgLSB2ZXJzaW9uOiBXaGljaCB2ZXJzaW9uIG9mIHRoZSBzb3VyY2UgbWFwIHNwZWMgdGhpcyBtYXAgaXMgZm9sbG93aW5nLlxuICogICAtIGZpbGU6IE9wdGlvbmFsLiBUaGUgZ2VuZXJhdGVkIGZpbGUgdGhpcyBzb3VyY2UgbWFwIGlzIGFzc29jaWF0ZWQgd2l0aC5cbiAqICAgLSBzZWN0aW9uczogQSBsaXN0IG9mIHNlY3Rpb24gZGVmaW5pdGlvbnMuXG4gKlxuICogRWFjaCB2YWx1ZSB1bmRlciB0aGUgXCJzZWN0aW9uc1wiIGZpZWxkIGhhcyB0d28gZmllbGRzOlxuICogICAtIG9mZnNldDogVGhlIG9mZnNldCBpbnRvIHRoZSBvcmlnaW5hbCBzcGVjaWZpZWQgYXQgd2hpY2ggdGhpcyBzZWN0aW9uXG4gKiAgICAgICBiZWdpbnMgdG8gYXBwbHksIGRlZmluZWQgYXMgYW4gb2JqZWN0IHdpdGggYSBcImxpbmVcIiBhbmQgXCJjb2x1bW5cIlxuICogICAgICAgZmllbGQuXG4gKiAgIC0gbWFwOiBBIHNvdXJjZSBtYXAgZGVmaW5pdGlvbi4gVGhpcyBzb3VyY2UgbWFwIGNvdWxkIGFsc28gYmUgaW5kZXhlZCxcbiAqICAgICAgIGJ1dCBkb2Vzbid0IGhhdmUgdG8gYmUuXG4gKlxuICogSW5zdGVhZCBvZiB0aGUgXCJtYXBcIiBmaWVsZCwgaXQncyBhbHNvIHBvc3NpYmxlIHRvIGhhdmUgYSBcInVybFwiIGZpZWxkXG4gKiBzcGVjaWZ5aW5nIGEgVVJMIHRvIHJldHJpZXZlIGEgc291cmNlIG1hcCBmcm9tLCBidXQgdGhhdCdzIGN1cnJlbnRseVxuICogdW5zdXBwb3J0ZWQuXG4gKlxuICogSGVyZSdzIGFuIGV4YW1wbGUgc291cmNlIG1hcCwgdGFrZW4gZnJvbSB0aGUgc291cmNlIG1hcCBzcGVjWzBdLCBidXRcbiAqIG1vZGlmaWVkIHRvIG9taXQgYSBzZWN0aW9uIHdoaWNoIHVzZXMgdGhlIFwidXJsXCIgZmllbGQuXG4gKlxuICogIHtcbiAqICAgIHZlcnNpb24gOiAzLFxuICogICAgZmlsZTogXCJhcHAuanNcIixcbiAqICAgIHNlY3Rpb25zOiBbe1xuICogICAgICBvZmZzZXQ6IHtsaW5lOjEwMCwgY29sdW1uOjEwfSxcbiAqICAgICAgbWFwOiB7XG4gKiAgICAgICAgdmVyc2lvbiA6IDMsXG4gKiAgICAgICAgZmlsZTogXCJzZWN0aW9uLmpzXCIsXG4gKiAgICAgICAgc291cmNlczogW1wiZm9vLmpzXCIsIFwiYmFyLmpzXCJdLFxuICogICAgICAgIG5hbWVzOiBbXCJzcmNcIiwgXCJtYXBzXCIsIFwiYXJlXCIsIFwiZnVuXCJdLFxuICogICAgICAgIG1hcHBpbmdzOiBcIkFBQUEsRTs7QUJDREU7XCJcbiAqICAgICAgfVxuICogICAgfV0sXG4gKiAgfVxuICpcbiAqIFRoZSBzZWNvbmQgcGFyYW1ldGVyLCBpZiBnaXZlbiwgaXMgYSBzdHJpbmcgd2hvc2UgdmFsdWUgaXMgdGhlIFVSTFxuICogYXQgd2hpY2ggdGhlIHNvdXJjZSBtYXAgd2FzIGZvdW5kLiAgVGhpcyBVUkwgaXMgdXNlZCB0byBjb21wdXRlIHRoZVxuICogc291cmNlcyBhcnJheS5cbiAqXG4gKiBbMF06IGh0dHBzOi8vZG9jcy5nb29nbGUuY29tL2RvY3VtZW50L2QvMVUxUkdBZWhRd1J5cFVUb3ZGMUtSbHBpT0Z6ZTBiLV8yZ2M2ZkFIMEtZMGsvZWRpdCNoZWFkaW5nPWguNTM1ZXMzeGVwcmd0XG4gKi9cbmZ1bmN0aW9uIEluZGV4ZWRTb3VyY2VNYXBDb25zdW1lcihhU291cmNlTWFwLCBhU291cmNlTWFwVVJMKSB7XG4gIHZhciBzb3VyY2VNYXAgPSBhU291cmNlTWFwO1xuICBpZiAodHlwZW9mIGFTb3VyY2VNYXAgPT09ICdzdHJpbmcnKSB7XG4gICAgc291cmNlTWFwID0gdXRpbC5wYXJzZVNvdXJjZU1hcElucHV0KGFTb3VyY2VNYXApO1xuICB9XG5cbiAgdmFyIHZlcnNpb24gPSB1dGlsLmdldEFyZyhzb3VyY2VNYXAsICd2ZXJzaW9uJyk7XG4gIHZhciBzZWN0aW9ucyA9IHV0aWwuZ2V0QXJnKHNvdXJjZU1hcCwgJ3NlY3Rpb25zJyk7XG5cbiAgaWYgKHZlcnNpb24gIT0gdGhpcy5fdmVyc2lvbikge1xuICAgIHRocm93IG5ldyBFcnJvcignVW5zdXBwb3J0ZWQgdmVyc2lvbjogJyArIHZlcnNpb24pO1xuICB9XG5cbiAgdGhpcy5fc291cmNlcyA9IG5ldyBBcnJheVNldCgpO1xuICB0aGlzLl9uYW1lcyA9IG5ldyBBcnJheVNldCgpO1xuXG4gIHZhciBsYXN0T2Zmc2V0ID0ge1xuICAgIGxpbmU6IC0xLFxuICAgIGNvbHVtbjogMFxuICB9O1xuICB0aGlzLl9zZWN0aW9ucyA9IHNlY3Rpb25zLm1hcChmdW5jdGlvbiAocykge1xuICAgIGlmIChzLnVybCkge1xuICAgICAgLy8gVGhlIHVybCBmaWVsZCB3aWxsIHJlcXVpcmUgc3VwcG9ydCBmb3IgYXN5bmNocm9uaWNpdHkuXG4gICAgICAvLyBTZWUgaHR0cHM6Ly9naXRodWIuY29tL21vemlsbGEvc291cmNlLW1hcC9pc3N1ZXMvMTZcbiAgICAgIHRocm93IG5ldyBFcnJvcignU3VwcG9ydCBmb3IgdXJsIGZpZWxkIGluIHNlY3Rpb25zIG5vdCBpbXBsZW1lbnRlZC4nKTtcbiAgICB9XG4gICAgdmFyIG9mZnNldCA9IHV0aWwuZ2V0QXJnKHMsICdvZmZzZXQnKTtcbiAgICB2YXIgb2Zmc2V0TGluZSA9IHV0aWwuZ2V0QXJnKG9mZnNldCwgJ2xpbmUnKTtcbiAgICB2YXIgb2Zmc2V0Q29sdW1uID0gdXRpbC5nZXRBcmcob2Zmc2V0LCAnY29sdW1uJyk7XG5cbiAgICBpZiAob2Zmc2V0TGluZSA8IGxhc3RPZmZzZXQubGluZSB8fFxuICAgICAgICAob2Zmc2V0TGluZSA9PT0gbGFzdE9mZnNldC5saW5lICYmIG9mZnNldENvbHVtbiA8IGxhc3RPZmZzZXQuY29sdW1uKSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdTZWN0aW9uIG9mZnNldHMgbXVzdCBiZSBvcmRlcmVkIGFuZCBub24tb3ZlcmxhcHBpbmcuJyk7XG4gICAgfVxuICAgIGxhc3RPZmZzZXQgPSBvZmZzZXQ7XG5cbiAgICByZXR1cm4ge1xuICAgICAgZ2VuZXJhdGVkT2Zmc2V0OiB7XG4gICAgICAgIC8vIFRoZSBvZmZzZXQgZmllbGRzIGFyZSAwLWJhc2VkLCBidXQgd2UgdXNlIDEtYmFzZWQgaW5kaWNlcyB3aGVuXG4gICAgICAgIC8vIGVuY29kaW5nL2RlY29kaW5nIGZyb20gVkxRLlxuICAgICAgICBnZW5lcmF0ZWRMaW5lOiBvZmZzZXRMaW5lICsgMSxcbiAgICAgICAgZ2VuZXJhdGVkQ29sdW1uOiBvZmZzZXRDb2x1bW4gKyAxXG4gICAgICB9LFxuICAgICAgY29uc3VtZXI6IG5ldyBTb3VyY2VNYXBDb25zdW1lcih1dGlsLmdldEFyZyhzLCAnbWFwJyksIGFTb3VyY2VNYXBVUkwpXG4gICAgfVxuICB9KTtcbn1cblxuSW5kZXhlZFNvdXJjZU1hcENvbnN1bWVyLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoU291cmNlTWFwQ29uc3VtZXIucHJvdG90eXBlKTtcbkluZGV4ZWRTb3VyY2VNYXBDb25zdW1lci5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBTb3VyY2VNYXBDb25zdW1lcjtcblxuLyoqXG4gKiBUaGUgdmVyc2lvbiBvZiB0aGUgc291cmNlIG1hcHBpbmcgc3BlYyB0aGF0IHdlIGFyZSBjb25zdW1pbmcuXG4gKi9cbkluZGV4ZWRTb3VyY2VNYXBDb25zdW1lci5wcm90b3R5cGUuX3ZlcnNpb24gPSAzO1xuXG4vKipcbiAqIFRoZSBsaXN0IG9mIG9yaWdpbmFsIHNvdXJjZXMuXG4gKi9cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShJbmRleGVkU291cmNlTWFwQ29uc3VtZXIucHJvdG90eXBlLCAnc291cmNlcycsIHtcbiAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIHNvdXJjZXMgPSBbXTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuX3NlY3Rpb25zLmxlbmd0aDsgaSsrKSB7XG4gICAgICBmb3IgKHZhciBqID0gMDsgaiA8IHRoaXMuX3NlY3Rpb25zW2ldLmNvbnN1bWVyLnNvdXJjZXMubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgc291cmNlcy5wdXNoKHRoaXMuX3NlY3Rpb25zW2ldLmNvbnN1bWVyLnNvdXJjZXNbal0pO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gc291cmNlcztcbiAgfVxufSk7XG5cbi8qKlxuICogUmV0dXJucyB0aGUgb3JpZ2luYWwgc291cmNlLCBsaW5lLCBhbmQgY29sdW1uIGluZm9ybWF0aW9uIGZvciB0aGUgZ2VuZXJhdGVkXG4gKiBzb3VyY2UncyBsaW5lIGFuZCBjb2x1bW4gcG9zaXRpb25zIHByb3ZpZGVkLiBUaGUgb25seSBhcmd1bWVudCBpcyBhbiBvYmplY3RcbiAqIHdpdGggdGhlIGZvbGxvd2luZyBwcm9wZXJ0aWVzOlxuICpcbiAqICAgLSBsaW5lOiBUaGUgbGluZSBudW1iZXIgaW4gdGhlIGdlbmVyYXRlZCBzb3VyY2UuICBUaGUgbGluZSBudW1iZXJcbiAqICAgICBpcyAxLWJhc2VkLlxuICogICAtIGNvbHVtbjogVGhlIGNvbHVtbiBudW1iZXIgaW4gdGhlIGdlbmVyYXRlZCBzb3VyY2UuICBUaGUgY29sdW1uXG4gKiAgICAgbnVtYmVyIGlzIDAtYmFzZWQuXG4gKlxuICogYW5kIGFuIG9iamVjdCBpcyByZXR1cm5lZCB3aXRoIHRoZSBmb2xsb3dpbmcgcHJvcGVydGllczpcbiAqXG4gKiAgIC0gc291cmNlOiBUaGUgb3JpZ2luYWwgc291cmNlIGZpbGUsIG9yIG51bGwuXG4gKiAgIC0gbGluZTogVGhlIGxpbmUgbnVtYmVyIGluIHRoZSBvcmlnaW5hbCBzb3VyY2UsIG9yIG51bGwuICBUaGVcbiAqICAgICBsaW5lIG51bWJlciBpcyAxLWJhc2VkLlxuICogICAtIGNvbHVtbjogVGhlIGNvbHVtbiBudW1iZXIgaW4gdGhlIG9yaWdpbmFsIHNvdXJjZSwgb3IgbnVsbC4gIFRoZVxuICogICAgIGNvbHVtbiBudW1iZXIgaXMgMC1iYXNlZC5cbiAqICAgLSBuYW1lOiBUaGUgb3JpZ2luYWwgaWRlbnRpZmllciwgb3IgbnVsbC5cbiAqL1xuSW5kZXhlZFNvdXJjZU1hcENvbnN1bWVyLnByb3RvdHlwZS5vcmlnaW5hbFBvc2l0aW9uRm9yID1cbiAgZnVuY3Rpb24gSW5kZXhlZFNvdXJjZU1hcENvbnN1bWVyX29yaWdpbmFsUG9zaXRpb25Gb3IoYUFyZ3MpIHtcbiAgICB2YXIgbmVlZGxlID0ge1xuICAgICAgZ2VuZXJhdGVkTGluZTogdXRpbC5nZXRBcmcoYUFyZ3MsICdsaW5lJyksXG4gICAgICBnZW5lcmF0ZWRDb2x1bW46IHV0aWwuZ2V0QXJnKGFBcmdzLCAnY29sdW1uJylcbiAgICB9O1xuXG4gICAgLy8gRmluZCB0aGUgc2VjdGlvbiBjb250YWluaW5nIHRoZSBnZW5lcmF0ZWQgcG9zaXRpb24gd2UncmUgdHJ5aW5nIHRvIG1hcFxuICAgIC8vIHRvIGFuIG9yaWdpbmFsIHBvc2l0aW9uLlxuICAgIHZhciBzZWN0aW9uSW5kZXggPSBiaW5hcnlTZWFyY2guc2VhcmNoKG5lZWRsZSwgdGhpcy5fc2VjdGlvbnMsXG4gICAgICBmdW5jdGlvbihuZWVkbGUsIHNlY3Rpb24pIHtcbiAgICAgICAgdmFyIGNtcCA9IG5lZWRsZS5nZW5lcmF0ZWRMaW5lIC0gc2VjdGlvbi5nZW5lcmF0ZWRPZmZzZXQuZ2VuZXJhdGVkTGluZTtcbiAgICAgICAgaWYgKGNtcCkge1xuICAgICAgICAgIHJldHVybiBjbXA7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gKG5lZWRsZS5nZW5lcmF0ZWRDb2x1bW4gLVxuICAgICAgICAgICAgICAgIHNlY3Rpb24uZ2VuZXJhdGVkT2Zmc2V0LmdlbmVyYXRlZENvbHVtbik7XG4gICAgICB9KTtcbiAgICB2YXIgc2VjdGlvbiA9IHRoaXMuX3NlY3Rpb25zW3NlY3Rpb25JbmRleF07XG5cbiAgICBpZiAoIXNlY3Rpb24pIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHNvdXJjZTogbnVsbCxcbiAgICAgICAgbGluZTogbnVsbCxcbiAgICAgICAgY29sdW1uOiBudWxsLFxuICAgICAgICBuYW1lOiBudWxsXG4gICAgICB9O1xuICAgIH1cblxuICAgIHJldHVybiBzZWN0aW9uLmNvbnN1bWVyLm9yaWdpbmFsUG9zaXRpb25Gb3Ioe1xuICAgICAgbGluZTogbmVlZGxlLmdlbmVyYXRlZExpbmUgLVxuICAgICAgICAoc2VjdGlvbi5nZW5lcmF0ZWRPZmZzZXQuZ2VuZXJhdGVkTGluZSAtIDEpLFxuICAgICAgY29sdW1uOiBuZWVkbGUuZ2VuZXJhdGVkQ29sdW1uIC1cbiAgICAgICAgKHNlY3Rpb24uZ2VuZXJhdGVkT2Zmc2V0LmdlbmVyYXRlZExpbmUgPT09IG5lZWRsZS5nZW5lcmF0ZWRMaW5lXG4gICAgICAgICA/IHNlY3Rpb24uZ2VuZXJhdGVkT2Zmc2V0LmdlbmVyYXRlZENvbHVtbiAtIDFcbiAgICAgICAgIDogMCksXG4gICAgICBiaWFzOiBhQXJncy5iaWFzXG4gICAgfSk7XG4gIH07XG5cbi8qKlxuICogUmV0dXJuIHRydWUgaWYgd2UgaGF2ZSB0aGUgc291cmNlIGNvbnRlbnQgZm9yIGV2ZXJ5IHNvdXJjZSBpbiB0aGUgc291cmNlXG4gKiBtYXAsIGZhbHNlIG90aGVyd2lzZS5cbiAqL1xuSW5kZXhlZFNvdXJjZU1hcENvbnN1bWVyLnByb3RvdHlwZS5oYXNDb250ZW50c09mQWxsU291cmNlcyA9XG4gIGZ1bmN0aW9uIEluZGV4ZWRTb3VyY2VNYXBDb25zdW1lcl9oYXNDb250ZW50c09mQWxsU291cmNlcygpIHtcbiAgICByZXR1cm4gdGhpcy5fc2VjdGlvbnMuZXZlcnkoZnVuY3Rpb24gKHMpIHtcbiAgICAgIHJldHVybiBzLmNvbnN1bWVyLmhhc0NvbnRlbnRzT2ZBbGxTb3VyY2VzKCk7XG4gICAgfSk7XG4gIH07XG5cbi8qKlxuICogUmV0dXJucyB0aGUgb3JpZ2luYWwgc291cmNlIGNvbnRlbnQuIFRoZSBvbmx5IGFyZ3VtZW50IGlzIHRoZSB1cmwgb2YgdGhlXG4gKiBvcmlnaW5hbCBzb3VyY2UgZmlsZS4gUmV0dXJucyBudWxsIGlmIG5vIG9yaWdpbmFsIHNvdXJjZSBjb250ZW50IGlzXG4gKiBhdmFpbGFibGUuXG4gKi9cbkluZGV4ZWRTb3VyY2VNYXBDb25zdW1lci5wcm90b3R5cGUuc291cmNlQ29udGVudEZvciA9XG4gIGZ1bmN0aW9uIEluZGV4ZWRTb3VyY2VNYXBDb25zdW1lcl9zb3VyY2VDb250ZW50Rm9yKGFTb3VyY2UsIG51bGxPbk1pc3NpbmcpIHtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuX3NlY3Rpb25zLmxlbmd0aDsgaSsrKSB7XG4gICAgICB2YXIgc2VjdGlvbiA9IHRoaXMuX3NlY3Rpb25zW2ldO1xuXG4gICAgICB2YXIgY29udGVudCA9IHNlY3Rpb24uY29uc3VtZXIuc291cmNlQ29udGVudEZvcihhU291cmNlLCB0cnVlKTtcbiAgICAgIGlmIChjb250ZW50KSB7XG4gICAgICAgIHJldHVybiBjb250ZW50O1xuICAgICAgfVxuICAgIH1cbiAgICBpZiAobnVsbE9uTWlzc2luZykge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdcIicgKyBhU291cmNlICsgJ1wiIGlzIG5vdCBpbiB0aGUgU291cmNlTWFwLicpO1xuICAgIH1cbiAgfTtcblxuLyoqXG4gKiBSZXR1cm5zIHRoZSBnZW5lcmF0ZWQgbGluZSBhbmQgY29sdW1uIGluZm9ybWF0aW9uIGZvciB0aGUgb3JpZ2luYWwgc291cmNlLFxuICogbGluZSwgYW5kIGNvbHVtbiBwb3NpdGlvbnMgcHJvdmlkZWQuIFRoZSBvbmx5IGFyZ3VtZW50IGlzIGFuIG9iamVjdCB3aXRoXG4gKiB0aGUgZm9sbG93aW5nIHByb3BlcnRpZXM6XG4gKlxuICogICAtIHNvdXJjZTogVGhlIGZpbGVuYW1lIG9mIHRoZSBvcmlnaW5hbCBzb3VyY2UuXG4gKiAgIC0gbGluZTogVGhlIGxpbmUgbnVtYmVyIGluIHRoZSBvcmlnaW5hbCBzb3VyY2UuICBUaGUgbGluZSBudW1iZXJcbiAqICAgICBpcyAxLWJhc2VkLlxuICogICAtIGNvbHVtbjogVGhlIGNvbHVtbiBudW1iZXIgaW4gdGhlIG9yaWdpbmFsIHNvdXJjZS4gIFRoZSBjb2x1bW5cbiAqICAgICBudW1iZXIgaXMgMC1iYXNlZC5cbiAqXG4gKiBhbmQgYW4gb2JqZWN0IGlzIHJldHVybmVkIHdpdGggdGhlIGZvbGxvd2luZyBwcm9wZXJ0aWVzOlxuICpcbiAqICAgLSBsaW5lOiBUaGUgbGluZSBudW1iZXIgaW4gdGhlIGdlbmVyYXRlZCBzb3VyY2UsIG9yIG51bGwuICBUaGVcbiAqICAgICBsaW5lIG51bWJlciBpcyAxLWJhc2VkLiBcbiAqICAgLSBjb2x1bW46IFRoZSBjb2x1bW4gbnVtYmVyIGluIHRoZSBnZW5lcmF0ZWQgc291cmNlLCBvciBudWxsLlxuICogICAgIFRoZSBjb2x1bW4gbnVtYmVyIGlzIDAtYmFzZWQuXG4gKi9cbkluZGV4ZWRTb3VyY2VNYXBDb25zdW1lci5wcm90b3R5cGUuZ2VuZXJhdGVkUG9zaXRpb25Gb3IgPVxuICBmdW5jdGlvbiBJbmRleGVkU291cmNlTWFwQ29uc3VtZXJfZ2VuZXJhdGVkUG9zaXRpb25Gb3IoYUFyZ3MpIHtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuX3NlY3Rpb25zLmxlbmd0aDsgaSsrKSB7XG4gICAgICB2YXIgc2VjdGlvbiA9IHRoaXMuX3NlY3Rpb25zW2ldO1xuXG4gICAgICAvLyBPbmx5IGNvbnNpZGVyIHRoaXMgc2VjdGlvbiBpZiB0aGUgcmVxdWVzdGVkIHNvdXJjZSBpcyBpbiB0aGUgbGlzdCBvZlxuICAgICAgLy8gc291cmNlcyBvZiB0aGUgY29uc3VtZXIuXG4gICAgICBpZiAoc2VjdGlvbi5jb25zdW1lci5fZmluZFNvdXJjZUluZGV4KHV0aWwuZ2V0QXJnKGFBcmdzLCAnc291cmNlJykpID09PSAtMSkge1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cbiAgICAgIHZhciBnZW5lcmF0ZWRQb3NpdGlvbiA9IHNlY3Rpb24uY29uc3VtZXIuZ2VuZXJhdGVkUG9zaXRpb25Gb3IoYUFyZ3MpO1xuICAgICAgaWYgKGdlbmVyYXRlZFBvc2l0aW9uKSB7XG4gICAgICAgIHZhciByZXQgPSB7XG4gICAgICAgICAgbGluZTogZ2VuZXJhdGVkUG9zaXRpb24ubGluZSArXG4gICAgICAgICAgICAoc2VjdGlvbi5nZW5lcmF0ZWRPZmZzZXQuZ2VuZXJhdGVkTGluZSAtIDEpLFxuICAgICAgICAgIGNvbHVtbjogZ2VuZXJhdGVkUG9zaXRpb24uY29sdW1uICtcbiAgICAgICAgICAgIChzZWN0aW9uLmdlbmVyYXRlZE9mZnNldC5nZW5lcmF0ZWRMaW5lID09PSBnZW5lcmF0ZWRQb3NpdGlvbi5saW5lXG4gICAgICAgICAgICAgPyBzZWN0aW9uLmdlbmVyYXRlZE9mZnNldC5nZW5lcmF0ZWRDb2x1bW4gLSAxXG4gICAgICAgICAgICAgOiAwKVxuICAgICAgICB9O1xuICAgICAgICByZXR1cm4gcmV0O1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiB7XG4gICAgICBsaW5lOiBudWxsLFxuICAgICAgY29sdW1uOiBudWxsXG4gICAgfTtcbiAgfTtcblxuLyoqXG4gKiBQYXJzZSB0aGUgbWFwcGluZ3MgaW4gYSBzdHJpbmcgaW4gdG8gYSBkYXRhIHN0cnVjdHVyZSB3aGljaCB3ZSBjYW4gZWFzaWx5XG4gKiBxdWVyeSAodGhlIG9yZGVyZWQgYXJyYXlzIGluIHRoZSBgdGhpcy5fX2dlbmVyYXRlZE1hcHBpbmdzYCBhbmRcbiAqIGB0aGlzLl9fb3JpZ2luYWxNYXBwaW5nc2AgcHJvcGVydGllcykuXG4gKi9cbkluZGV4ZWRTb3VyY2VNYXBDb25zdW1lci5wcm90b3R5cGUuX3BhcnNlTWFwcGluZ3MgPVxuICBmdW5jdGlvbiBJbmRleGVkU291cmNlTWFwQ29uc3VtZXJfcGFyc2VNYXBwaW5ncyhhU3RyLCBhU291cmNlUm9vdCkge1xuICAgIHRoaXMuX19nZW5lcmF0ZWRNYXBwaW5ncyA9IFtdO1xuICAgIHRoaXMuX19vcmlnaW5hbE1hcHBpbmdzID0gW107XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLl9zZWN0aW9ucy5sZW5ndGg7IGkrKykge1xuICAgICAgdmFyIHNlY3Rpb24gPSB0aGlzLl9zZWN0aW9uc1tpXTtcbiAgICAgIHZhciBzZWN0aW9uTWFwcGluZ3MgPSBzZWN0aW9uLmNvbnN1bWVyLl9nZW5lcmF0ZWRNYXBwaW5ncztcbiAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgc2VjdGlvbk1hcHBpbmdzLmxlbmd0aDsgaisrKSB7XG4gICAgICAgIHZhciBtYXBwaW5nID0gc2VjdGlvbk1hcHBpbmdzW2pdO1xuXG4gICAgICAgIHZhciBzb3VyY2UgPSBzZWN0aW9uLmNvbnN1bWVyLl9zb3VyY2VzLmF0KG1hcHBpbmcuc291cmNlKTtcbiAgICAgICAgc291cmNlID0gdXRpbC5jb21wdXRlU291cmNlVVJMKHNlY3Rpb24uY29uc3VtZXIuc291cmNlUm9vdCwgc291cmNlLCB0aGlzLl9zb3VyY2VNYXBVUkwpO1xuICAgICAgICB0aGlzLl9zb3VyY2VzLmFkZChzb3VyY2UpO1xuICAgICAgICBzb3VyY2UgPSB0aGlzLl9zb3VyY2VzLmluZGV4T2Yoc291cmNlKTtcblxuICAgICAgICB2YXIgbmFtZSA9IG51bGw7XG4gICAgICAgIGlmIChtYXBwaW5nLm5hbWUpIHtcbiAgICAgICAgICBuYW1lID0gc2VjdGlvbi5jb25zdW1lci5fbmFtZXMuYXQobWFwcGluZy5uYW1lKTtcbiAgICAgICAgICB0aGlzLl9uYW1lcy5hZGQobmFtZSk7XG4gICAgICAgICAgbmFtZSA9IHRoaXMuX25hbWVzLmluZGV4T2YobmFtZSk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBUaGUgbWFwcGluZ3MgY29taW5nIGZyb20gdGhlIGNvbnN1bWVyIGZvciB0aGUgc2VjdGlvbiBoYXZlXG4gICAgICAgIC8vIGdlbmVyYXRlZCBwb3NpdGlvbnMgcmVsYXRpdmUgdG8gdGhlIHN0YXJ0IG9mIHRoZSBzZWN0aW9uLCBzbyB3ZVxuICAgICAgICAvLyBuZWVkIHRvIG9mZnNldCB0aGVtIHRvIGJlIHJlbGF0aXZlIHRvIHRoZSBzdGFydCBvZiB0aGUgY29uY2F0ZW5hdGVkXG4gICAgICAgIC8vIGdlbmVyYXRlZCBmaWxlLlxuICAgICAgICB2YXIgYWRqdXN0ZWRNYXBwaW5nID0ge1xuICAgICAgICAgIHNvdXJjZTogc291cmNlLFxuICAgICAgICAgIGdlbmVyYXRlZExpbmU6IG1hcHBpbmcuZ2VuZXJhdGVkTGluZSArXG4gICAgICAgICAgICAoc2VjdGlvbi5nZW5lcmF0ZWRPZmZzZXQuZ2VuZXJhdGVkTGluZSAtIDEpLFxuICAgICAgICAgIGdlbmVyYXRlZENvbHVtbjogbWFwcGluZy5nZW5lcmF0ZWRDb2x1bW4gK1xuICAgICAgICAgICAgKHNlY3Rpb24uZ2VuZXJhdGVkT2Zmc2V0LmdlbmVyYXRlZExpbmUgPT09IG1hcHBpbmcuZ2VuZXJhdGVkTGluZVxuICAgICAgICAgICAgPyBzZWN0aW9uLmdlbmVyYXRlZE9mZnNldC5nZW5lcmF0ZWRDb2x1bW4gLSAxXG4gICAgICAgICAgICA6IDApLFxuICAgICAgICAgIG9yaWdpbmFsTGluZTogbWFwcGluZy5vcmlnaW5hbExpbmUsXG4gICAgICAgICAgb3JpZ2luYWxDb2x1bW46IG1hcHBpbmcub3JpZ2luYWxDb2x1bW4sXG4gICAgICAgICAgbmFtZTogbmFtZVxuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMuX19nZW5lcmF0ZWRNYXBwaW5ncy5wdXNoKGFkanVzdGVkTWFwcGluZyk7XG4gICAgICAgIGlmICh0eXBlb2YgYWRqdXN0ZWRNYXBwaW5nLm9yaWdpbmFsTGluZSA9PT0gJ251bWJlcicpIHtcbiAgICAgICAgICB0aGlzLl9fb3JpZ2luYWxNYXBwaW5ncy5wdXNoKGFkanVzdGVkTWFwcGluZyk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBxdWlja1NvcnQodGhpcy5fX2dlbmVyYXRlZE1hcHBpbmdzLCB1dGlsLmNvbXBhcmVCeUdlbmVyYXRlZFBvc2l0aW9uc0RlZmxhdGVkKTtcbiAgICBxdWlja1NvcnQodGhpcy5fX29yaWdpbmFsTWFwcGluZ3MsIHV0aWwuY29tcGFyZUJ5T3JpZ2luYWxQb3NpdGlvbnMpO1xuICB9O1xuXG5leHBvcnRzLkluZGV4ZWRTb3VyY2VNYXBDb25zdW1lciA9IEluZGV4ZWRTb3VyY2VNYXBDb25zdW1lcjtcbiIsIi8qIC0qLSBNb2RlOiBqczsganMtaW5kZW50LWxldmVsOiAyOyAtKi0gKi9cbi8qXG4gKiBDb3B5cmlnaHQgMjAxMSBNb3ppbGxhIEZvdW5kYXRpb24gYW5kIGNvbnRyaWJ1dG9yc1xuICogTGljZW5zZWQgdW5kZXIgdGhlIE5ldyBCU0QgbGljZW5zZS4gU2VlIExJQ0VOU0Ugb3I6XG4gKiBodHRwOi8vb3BlbnNvdXJjZS5vcmcvbGljZW5zZXMvQlNELTMtQ2xhdXNlXG4gKi9cblxudmFyIFNvdXJjZU1hcEdlbmVyYXRvciA9IHJlcXVpcmUoJy4vc291cmNlLW1hcC1nZW5lcmF0b3InKS5Tb3VyY2VNYXBHZW5lcmF0b3I7XG52YXIgdXRpbCA9IHJlcXVpcmUoJy4vdXRpbCcpO1xuXG4vLyBNYXRjaGVzIGEgV2luZG93cy1zdHlsZSBgXFxyXFxuYCBuZXdsaW5lIG9yIGEgYFxcbmAgbmV3bGluZSB1c2VkIGJ5IGFsbCBvdGhlclxuLy8gb3BlcmF0aW5nIHN5c3RlbXMgdGhlc2UgZGF5cyAoY2FwdHVyaW5nIHRoZSByZXN1bHQpLlxudmFyIFJFR0VYX05FV0xJTkUgPSAvKFxccj9cXG4pLztcblxuLy8gTmV3bGluZSBjaGFyYWN0ZXIgY29kZSBmb3IgY2hhckNvZGVBdCgpIGNvbXBhcmlzb25zXG52YXIgTkVXTElORV9DT0RFID0gMTA7XG5cbi8vIFByaXZhdGUgc3ltYm9sIGZvciBpZGVudGlmeWluZyBgU291cmNlTm9kZWBzIHdoZW4gbXVsdGlwbGUgdmVyc2lvbnMgb2Zcbi8vIHRoZSBzb3VyY2UtbWFwIGxpYnJhcnkgYXJlIGxvYWRlZC4gVGhpcyBNVVNUIE5PVCBDSEFOR0UgYWNyb3NzXG4vLyB2ZXJzaW9ucyFcbnZhciBpc1NvdXJjZU5vZGUgPSBcIiQkJGlzU291cmNlTm9kZSQkJFwiO1xuXG4vKipcbiAqIFNvdXJjZU5vZGVzIHByb3ZpZGUgYSB3YXkgdG8gYWJzdHJhY3Qgb3ZlciBpbnRlcnBvbGF0aW5nL2NvbmNhdGVuYXRpbmdcbiAqIHNuaXBwZXRzIG9mIGdlbmVyYXRlZCBKYXZhU2NyaXB0IHNvdXJjZSBjb2RlIHdoaWxlIG1haW50YWluaW5nIHRoZSBsaW5lIGFuZFxuICogY29sdW1uIGluZm9ybWF0aW9uIGFzc29jaWF0ZWQgd2l0aCB0aGUgb3JpZ2luYWwgc291cmNlIGNvZGUuXG4gKlxuICogQHBhcmFtIGFMaW5lIFRoZSBvcmlnaW5hbCBsaW5lIG51bWJlci5cbiAqIEBwYXJhbSBhQ29sdW1uIFRoZSBvcmlnaW5hbCBjb2x1bW4gbnVtYmVyLlxuICogQHBhcmFtIGFTb3VyY2UgVGhlIG9yaWdpbmFsIHNvdXJjZSdzIGZpbGVuYW1lLlxuICogQHBhcmFtIGFDaHVua3MgT3B0aW9uYWwuIEFuIGFycmF5IG9mIHN0cmluZ3Mgd2hpY2ggYXJlIHNuaXBwZXRzIG9mXG4gKiAgICAgICAgZ2VuZXJhdGVkIEpTLCBvciBvdGhlciBTb3VyY2VOb2Rlcy5cbiAqIEBwYXJhbSBhTmFtZSBUaGUgb3JpZ2luYWwgaWRlbnRpZmllci5cbiAqL1xuZnVuY3Rpb24gU291cmNlTm9kZShhTGluZSwgYUNvbHVtbiwgYVNvdXJjZSwgYUNodW5rcywgYU5hbWUpIHtcbiAgdGhpcy5jaGlsZHJlbiA9IFtdO1xuICB0aGlzLnNvdXJjZUNvbnRlbnRzID0ge307XG4gIHRoaXMubGluZSA9IGFMaW5lID09IG51bGwgPyBudWxsIDogYUxpbmU7XG4gIHRoaXMuY29sdW1uID0gYUNvbHVtbiA9PSBudWxsID8gbnVsbCA6IGFDb2x1bW47XG4gIHRoaXMuc291cmNlID0gYVNvdXJjZSA9PSBudWxsID8gbnVsbCA6IGFTb3VyY2U7XG4gIHRoaXMubmFtZSA9IGFOYW1lID09IG51bGwgPyBudWxsIDogYU5hbWU7XG4gIHRoaXNbaXNTb3VyY2VOb2RlXSA9IHRydWU7XG4gIGlmIChhQ2h1bmtzICE9IG51bGwpIHRoaXMuYWRkKGFDaHVua3MpO1xufVxuXG4vKipcbiAqIENyZWF0ZXMgYSBTb3VyY2VOb2RlIGZyb20gZ2VuZXJhdGVkIGNvZGUgYW5kIGEgU291cmNlTWFwQ29uc3VtZXIuXG4gKlxuICogQHBhcmFtIGFHZW5lcmF0ZWRDb2RlIFRoZSBnZW5lcmF0ZWQgY29kZVxuICogQHBhcmFtIGFTb3VyY2VNYXBDb25zdW1lciBUaGUgU291cmNlTWFwIGZvciB0aGUgZ2VuZXJhdGVkIGNvZGVcbiAqIEBwYXJhbSBhUmVsYXRpdmVQYXRoIE9wdGlvbmFsLiBUaGUgcGF0aCB0aGF0IHJlbGF0aXZlIHNvdXJjZXMgaW4gdGhlXG4gKiAgICAgICAgU291cmNlTWFwQ29uc3VtZXIgc2hvdWxkIGJlIHJlbGF0aXZlIHRvLlxuICovXG5Tb3VyY2VOb2RlLmZyb21TdHJpbmdXaXRoU291cmNlTWFwID1cbiAgZnVuY3Rpb24gU291cmNlTm9kZV9mcm9tU3RyaW5nV2l0aFNvdXJjZU1hcChhR2VuZXJhdGVkQ29kZSwgYVNvdXJjZU1hcENvbnN1bWVyLCBhUmVsYXRpdmVQYXRoKSB7XG4gICAgLy8gVGhlIFNvdXJjZU5vZGUgd2Ugd2FudCB0byBmaWxsIHdpdGggdGhlIGdlbmVyYXRlZCBjb2RlXG4gICAgLy8gYW5kIHRoZSBTb3VyY2VNYXBcbiAgICB2YXIgbm9kZSA9IG5ldyBTb3VyY2VOb2RlKCk7XG5cbiAgICAvLyBBbGwgZXZlbiBpbmRpY2VzIG9mIHRoaXMgYXJyYXkgYXJlIG9uZSBsaW5lIG9mIHRoZSBnZW5lcmF0ZWQgY29kZSxcbiAgICAvLyB3aGlsZSBhbGwgb2RkIGluZGljZXMgYXJlIHRoZSBuZXdsaW5lcyBiZXR3ZWVuIHR3byBhZGphY2VudCBsaW5lc1xuICAgIC8vIChzaW5jZSBgUkVHRVhfTkVXTElORWAgY2FwdHVyZXMgaXRzIG1hdGNoKS5cbiAgICAvLyBQcm9jZXNzZWQgZnJhZ21lbnRzIGFyZSBhY2Nlc3NlZCBieSBjYWxsaW5nIGBzaGlmdE5leHRMaW5lYC5cbiAgICB2YXIgcmVtYWluaW5nTGluZXMgPSBhR2VuZXJhdGVkQ29kZS5zcGxpdChSRUdFWF9ORVdMSU5FKTtcbiAgICB2YXIgcmVtYWluaW5nTGluZXNJbmRleCA9IDA7XG4gICAgdmFyIHNoaWZ0TmV4dExpbmUgPSBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBsaW5lQ29udGVudHMgPSBnZXROZXh0TGluZSgpO1xuICAgICAgLy8gVGhlIGxhc3QgbGluZSBvZiBhIGZpbGUgbWlnaHQgbm90IGhhdmUgYSBuZXdsaW5lLlxuICAgICAgdmFyIG5ld0xpbmUgPSBnZXROZXh0TGluZSgpIHx8IFwiXCI7XG4gICAgICByZXR1cm4gbGluZUNvbnRlbnRzICsgbmV3TGluZTtcblxuICAgICAgZnVuY3Rpb24gZ2V0TmV4dExpbmUoKSB7XG4gICAgICAgIHJldHVybiByZW1haW5pbmdMaW5lc0luZGV4IDwgcmVtYWluaW5nTGluZXMubGVuZ3RoID9cbiAgICAgICAgICAgIHJlbWFpbmluZ0xpbmVzW3JlbWFpbmluZ0xpbmVzSW5kZXgrK10gOiB1bmRlZmluZWQ7XG4gICAgICB9XG4gICAgfTtcblxuICAgIC8vIFdlIG5lZWQgdG8gcmVtZW1iZXIgdGhlIHBvc2l0aW9uIG9mIFwicmVtYWluaW5nTGluZXNcIlxuICAgIHZhciBsYXN0R2VuZXJhdGVkTGluZSA9IDEsIGxhc3RHZW5lcmF0ZWRDb2x1bW4gPSAwO1xuXG4gICAgLy8gVGhlIGdlbmVyYXRlIFNvdXJjZU5vZGVzIHdlIG5lZWQgYSBjb2RlIHJhbmdlLlxuICAgIC8vIFRvIGV4dHJhY3QgaXQgY3VycmVudCBhbmQgbGFzdCBtYXBwaW5nIGlzIHVzZWQuXG4gICAgLy8gSGVyZSB3ZSBzdG9yZSB0aGUgbGFzdCBtYXBwaW5nLlxuICAgIHZhciBsYXN0TWFwcGluZyA9IG51bGw7XG5cbiAgICBhU291cmNlTWFwQ29uc3VtZXIuZWFjaE1hcHBpbmcoZnVuY3Rpb24gKG1hcHBpbmcpIHtcbiAgICAgIGlmIChsYXN0TWFwcGluZyAhPT0gbnVsbCkge1xuICAgICAgICAvLyBXZSBhZGQgdGhlIGNvZGUgZnJvbSBcImxhc3RNYXBwaW5nXCIgdG8gXCJtYXBwaW5nXCI6XG4gICAgICAgIC8vIEZpcnN0IGNoZWNrIGlmIHRoZXJlIGlzIGEgbmV3IGxpbmUgaW4gYmV0d2Vlbi5cbiAgICAgICAgaWYgKGxhc3RHZW5lcmF0ZWRMaW5lIDwgbWFwcGluZy5nZW5lcmF0ZWRMaW5lKSB7XG4gICAgICAgICAgLy8gQXNzb2NpYXRlIGZpcnN0IGxpbmUgd2l0aCBcImxhc3RNYXBwaW5nXCJcbiAgICAgICAgICBhZGRNYXBwaW5nV2l0aENvZGUobGFzdE1hcHBpbmcsIHNoaWZ0TmV4dExpbmUoKSk7XG4gICAgICAgICAgbGFzdEdlbmVyYXRlZExpbmUrKztcbiAgICAgICAgICBsYXN0R2VuZXJhdGVkQ29sdW1uID0gMDtcbiAgICAgICAgICAvLyBUaGUgcmVtYWluaW5nIGNvZGUgaXMgYWRkZWQgd2l0aG91dCBtYXBwaW5nXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgLy8gVGhlcmUgaXMgbm8gbmV3IGxpbmUgaW4gYmV0d2Vlbi5cbiAgICAgICAgICAvLyBBc3NvY2lhdGUgdGhlIGNvZGUgYmV0d2VlbiBcImxhc3RHZW5lcmF0ZWRDb2x1bW5cIiBhbmRcbiAgICAgICAgICAvLyBcIm1hcHBpbmcuZ2VuZXJhdGVkQ29sdW1uXCIgd2l0aCBcImxhc3RNYXBwaW5nXCJcbiAgICAgICAgICB2YXIgbmV4dExpbmUgPSByZW1haW5pbmdMaW5lc1tyZW1haW5pbmdMaW5lc0luZGV4XSB8fCAnJztcbiAgICAgICAgICB2YXIgY29kZSA9IG5leHRMaW5lLnN1YnN0cigwLCBtYXBwaW5nLmdlbmVyYXRlZENvbHVtbiAtXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGFzdEdlbmVyYXRlZENvbHVtbik7XG4gICAgICAgICAgcmVtYWluaW5nTGluZXNbcmVtYWluaW5nTGluZXNJbmRleF0gPSBuZXh0TGluZS5zdWJzdHIobWFwcGluZy5nZW5lcmF0ZWRDb2x1bW4gLVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhc3RHZW5lcmF0ZWRDb2x1bW4pO1xuICAgICAgICAgIGxhc3RHZW5lcmF0ZWRDb2x1bW4gPSBtYXBwaW5nLmdlbmVyYXRlZENvbHVtbjtcbiAgICAgICAgICBhZGRNYXBwaW5nV2l0aENvZGUobGFzdE1hcHBpbmcsIGNvZGUpO1xuICAgICAgICAgIC8vIE5vIG1vcmUgcmVtYWluaW5nIGNvZGUsIGNvbnRpbnVlXG4gICAgICAgICAgbGFzdE1hcHBpbmcgPSBtYXBwaW5nO1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgLy8gV2UgYWRkIHRoZSBnZW5lcmF0ZWQgY29kZSB1bnRpbCB0aGUgZmlyc3QgbWFwcGluZ1xuICAgICAgLy8gdG8gdGhlIFNvdXJjZU5vZGUgd2l0aG91dCBhbnkgbWFwcGluZy5cbiAgICAgIC8vIEVhY2ggbGluZSBpcyBhZGRlZCBhcyBzZXBhcmF0ZSBzdHJpbmcuXG4gICAgICB3aGlsZSAobGFzdEdlbmVyYXRlZExpbmUgPCBtYXBwaW5nLmdlbmVyYXRlZExpbmUpIHtcbiAgICAgICAgbm9kZS5hZGQoc2hpZnROZXh0TGluZSgpKTtcbiAgICAgICAgbGFzdEdlbmVyYXRlZExpbmUrKztcbiAgICAgIH1cbiAgICAgIGlmIChsYXN0R2VuZXJhdGVkQ29sdW1uIDwgbWFwcGluZy5nZW5lcmF0ZWRDb2x1bW4pIHtcbiAgICAgICAgdmFyIG5leHRMaW5lID0gcmVtYWluaW5nTGluZXNbcmVtYWluaW5nTGluZXNJbmRleF0gfHwgJyc7XG4gICAgICAgIG5vZGUuYWRkKG5leHRMaW5lLnN1YnN0cigwLCBtYXBwaW5nLmdlbmVyYXRlZENvbHVtbikpO1xuICAgICAgICByZW1haW5pbmdMaW5lc1tyZW1haW5pbmdMaW5lc0luZGV4XSA9IG5leHRMaW5lLnN1YnN0cihtYXBwaW5nLmdlbmVyYXRlZENvbHVtbik7XG4gICAgICAgIGxhc3RHZW5lcmF0ZWRDb2x1bW4gPSBtYXBwaW5nLmdlbmVyYXRlZENvbHVtbjtcbiAgICAgIH1cbiAgICAgIGxhc3RNYXBwaW5nID0gbWFwcGluZztcbiAgICB9LCB0aGlzKTtcbiAgICAvLyBXZSBoYXZlIHByb2Nlc3NlZCBhbGwgbWFwcGluZ3MuXG4gICAgaWYgKHJlbWFpbmluZ0xpbmVzSW5kZXggPCByZW1haW5pbmdMaW5lcy5sZW5ndGgpIHtcbiAgICAgIGlmIChsYXN0TWFwcGluZykge1xuICAgICAgICAvLyBBc3NvY2lhdGUgdGhlIHJlbWFpbmluZyBjb2RlIGluIHRoZSBjdXJyZW50IGxpbmUgd2l0aCBcImxhc3RNYXBwaW5nXCJcbiAgICAgICAgYWRkTWFwcGluZ1dpdGhDb2RlKGxhc3RNYXBwaW5nLCBzaGlmdE5leHRMaW5lKCkpO1xuICAgICAgfVxuICAgICAgLy8gYW5kIGFkZCB0aGUgcmVtYWluaW5nIGxpbmVzIHdpdGhvdXQgYW55IG1hcHBpbmdcbiAgICAgIG5vZGUuYWRkKHJlbWFpbmluZ0xpbmVzLnNwbGljZShyZW1haW5pbmdMaW5lc0luZGV4KS5qb2luKFwiXCIpKTtcbiAgICB9XG5cbiAgICAvLyBDb3B5IHNvdXJjZXNDb250ZW50IGludG8gU291cmNlTm9kZVxuICAgIGFTb3VyY2VNYXBDb25zdW1lci5zb3VyY2VzLmZvckVhY2goZnVuY3Rpb24gKHNvdXJjZUZpbGUpIHtcbiAgICAgIHZhciBjb250ZW50ID0gYVNvdXJjZU1hcENvbnN1bWVyLnNvdXJjZUNvbnRlbnRGb3Ioc291cmNlRmlsZSk7XG4gICAgICBpZiAoY29udGVudCAhPSBudWxsKSB7XG4gICAgICAgIGlmIChhUmVsYXRpdmVQYXRoICE9IG51bGwpIHtcbiAgICAgICAgICBzb3VyY2VGaWxlID0gdXRpbC5qb2luKGFSZWxhdGl2ZVBhdGgsIHNvdXJjZUZpbGUpO1xuICAgICAgICB9XG4gICAgICAgIG5vZGUuc2V0U291cmNlQ29udGVudChzb3VyY2VGaWxlLCBjb250ZW50KTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIHJldHVybiBub2RlO1xuXG4gICAgZnVuY3Rpb24gYWRkTWFwcGluZ1dpdGhDb2RlKG1hcHBpbmcsIGNvZGUpIHtcbiAgICAgIGlmIChtYXBwaW5nID09PSBudWxsIHx8IG1hcHBpbmcuc291cmNlID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgbm9kZS5hZGQoY29kZSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB2YXIgc291cmNlID0gYVJlbGF0aXZlUGF0aFxuICAgICAgICAgID8gdXRpbC5qb2luKGFSZWxhdGl2ZVBhdGgsIG1hcHBpbmcuc291cmNlKVxuICAgICAgICAgIDogbWFwcGluZy5zb3VyY2U7XG4gICAgICAgIG5vZGUuYWRkKG5ldyBTb3VyY2VOb2RlKG1hcHBpbmcub3JpZ2luYWxMaW5lLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtYXBwaW5nLm9yaWdpbmFsQ29sdW1uLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzb3VyY2UsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvZGUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1hcHBpbmcubmFtZSkpO1xuICAgICAgfVxuICAgIH1cbiAgfTtcblxuLyoqXG4gKiBBZGQgYSBjaHVuayBvZiBnZW5lcmF0ZWQgSlMgdG8gdGhpcyBzb3VyY2Ugbm9kZS5cbiAqXG4gKiBAcGFyYW0gYUNodW5rIEEgc3RyaW5nIHNuaXBwZXQgb2YgZ2VuZXJhdGVkIEpTIGNvZGUsIGFub3RoZXIgaW5zdGFuY2Ugb2ZcbiAqICAgICAgICBTb3VyY2VOb2RlLCBvciBhbiBhcnJheSB3aGVyZSBlYWNoIG1lbWJlciBpcyBvbmUgb2YgdGhvc2UgdGhpbmdzLlxuICovXG5Tb3VyY2VOb2RlLnByb3RvdHlwZS5hZGQgPSBmdW5jdGlvbiBTb3VyY2VOb2RlX2FkZChhQ2h1bmspIHtcbiAgaWYgKEFycmF5LmlzQXJyYXkoYUNodW5rKSkge1xuICAgIGFDaHVuay5mb3JFYWNoKGZ1bmN0aW9uIChjaHVuaykge1xuICAgICAgdGhpcy5hZGQoY2h1bmspO1xuICAgIH0sIHRoaXMpO1xuICB9XG4gIGVsc2UgaWYgKGFDaHVua1tpc1NvdXJjZU5vZGVdIHx8IHR5cGVvZiBhQ2h1bmsgPT09IFwic3RyaW5nXCIpIHtcbiAgICBpZiAoYUNodW5rKSB7XG4gICAgICB0aGlzLmNoaWxkcmVuLnB1c2goYUNodW5rKTtcbiAgICB9XG4gIH1cbiAgZWxzZSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcbiAgICAgIFwiRXhwZWN0ZWQgYSBTb3VyY2VOb2RlLCBzdHJpbmcsIG9yIGFuIGFycmF5IG9mIFNvdXJjZU5vZGVzIGFuZCBzdHJpbmdzLiBHb3QgXCIgKyBhQ2h1bmtcbiAgICApO1xuICB9XG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBBZGQgYSBjaHVuayBvZiBnZW5lcmF0ZWQgSlMgdG8gdGhlIGJlZ2lubmluZyBvZiB0aGlzIHNvdXJjZSBub2RlLlxuICpcbiAqIEBwYXJhbSBhQ2h1bmsgQSBzdHJpbmcgc25pcHBldCBvZiBnZW5lcmF0ZWQgSlMgY29kZSwgYW5vdGhlciBpbnN0YW5jZSBvZlxuICogICAgICAgIFNvdXJjZU5vZGUsIG9yIGFuIGFycmF5IHdoZXJlIGVhY2ggbWVtYmVyIGlzIG9uZSBvZiB0aG9zZSB0aGluZ3MuXG4gKi9cblNvdXJjZU5vZGUucHJvdG90eXBlLnByZXBlbmQgPSBmdW5jdGlvbiBTb3VyY2VOb2RlX3ByZXBlbmQoYUNodW5rKSB7XG4gIGlmIChBcnJheS5pc0FycmF5KGFDaHVuaykpIHtcbiAgICBmb3IgKHZhciBpID0gYUNodW5rLmxlbmd0aC0xOyBpID49IDA7IGktLSkge1xuICAgICAgdGhpcy5wcmVwZW5kKGFDaHVua1tpXSk7XG4gICAgfVxuICB9XG4gIGVsc2UgaWYgKGFDaHVua1tpc1NvdXJjZU5vZGVdIHx8IHR5cGVvZiBhQ2h1bmsgPT09IFwic3RyaW5nXCIpIHtcbiAgICB0aGlzLmNoaWxkcmVuLnVuc2hpZnQoYUNodW5rKTtcbiAgfVxuICBlbHNlIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFxuICAgICAgXCJFeHBlY3RlZCBhIFNvdXJjZU5vZGUsIHN0cmluZywgb3IgYW4gYXJyYXkgb2YgU291cmNlTm9kZXMgYW5kIHN0cmluZ3MuIEdvdCBcIiArIGFDaHVua1xuICAgICk7XG4gIH1cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIFdhbGsgb3ZlciB0aGUgdHJlZSBvZiBKUyBzbmlwcGV0cyBpbiB0aGlzIG5vZGUgYW5kIGl0cyBjaGlsZHJlbi4gVGhlXG4gKiB3YWxraW5nIGZ1bmN0aW9uIGlzIGNhbGxlZCBvbmNlIGZvciBlYWNoIHNuaXBwZXQgb2YgSlMgYW5kIGlzIHBhc3NlZCB0aGF0XG4gKiBzbmlwcGV0IGFuZCB0aGUgaXRzIG9yaWdpbmFsIGFzc29jaWF0ZWQgc291cmNlJ3MgbGluZS9jb2x1bW4gbG9jYXRpb24uXG4gKlxuICogQHBhcmFtIGFGbiBUaGUgdHJhdmVyc2FsIGZ1bmN0aW9uLlxuICovXG5Tb3VyY2VOb2RlLnByb3RvdHlwZS53YWxrID0gZnVuY3Rpb24gU291cmNlTm9kZV93YWxrKGFGbikge1xuICB2YXIgY2h1bms7XG4gIGZvciAodmFyIGkgPSAwLCBsZW4gPSB0aGlzLmNoaWxkcmVuLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgY2h1bmsgPSB0aGlzLmNoaWxkcmVuW2ldO1xuICAgIGlmIChjaHVua1tpc1NvdXJjZU5vZGVdKSB7XG4gICAgICBjaHVuay53YWxrKGFGbik7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgaWYgKGNodW5rICE9PSAnJykge1xuICAgICAgICBhRm4oY2h1bmssIHsgc291cmNlOiB0aGlzLnNvdXJjZSxcbiAgICAgICAgICAgICAgICAgICAgIGxpbmU6IHRoaXMubGluZSxcbiAgICAgICAgICAgICAgICAgICAgIGNvbHVtbjogdGhpcy5jb2x1bW4sXG4gICAgICAgICAgICAgICAgICAgICBuYW1lOiB0aGlzLm5hbWUgfSk7XG4gICAgICB9XG4gICAgfVxuICB9XG59O1xuXG4vKipcbiAqIExpa2UgYFN0cmluZy5wcm90b3R5cGUuam9pbmAgZXhjZXB0IGZvciBTb3VyY2VOb2Rlcy4gSW5zZXJ0cyBgYVN0cmAgYmV0d2VlblxuICogZWFjaCBvZiBgdGhpcy5jaGlsZHJlbmAuXG4gKlxuICogQHBhcmFtIGFTZXAgVGhlIHNlcGFyYXRvci5cbiAqL1xuU291cmNlTm9kZS5wcm90b3R5cGUuam9pbiA9IGZ1bmN0aW9uIFNvdXJjZU5vZGVfam9pbihhU2VwKSB7XG4gIHZhciBuZXdDaGlsZHJlbjtcbiAgdmFyIGk7XG4gIHZhciBsZW4gPSB0aGlzLmNoaWxkcmVuLmxlbmd0aDtcbiAgaWYgKGxlbiA+IDApIHtcbiAgICBuZXdDaGlsZHJlbiA9IFtdO1xuICAgIGZvciAoaSA9IDA7IGkgPCBsZW4tMTsgaSsrKSB7XG4gICAgICBuZXdDaGlsZHJlbi5wdXNoKHRoaXMuY2hpbGRyZW5baV0pO1xuICAgICAgbmV3Q2hpbGRyZW4ucHVzaChhU2VwKTtcbiAgICB9XG4gICAgbmV3Q2hpbGRyZW4ucHVzaCh0aGlzLmNoaWxkcmVuW2ldKTtcbiAgICB0aGlzLmNoaWxkcmVuID0gbmV3Q2hpbGRyZW47XG4gIH1cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIENhbGwgU3RyaW5nLnByb3RvdHlwZS5yZXBsYWNlIG9uIHRoZSB2ZXJ5IHJpZ2h0LW1vc3Qgc291cmNlIHNuaXBwZXQuIFVzZWZ1bFxuICogZm9yIHRyaW1taW5nIHdoaXRlc3BhY2UgZnJvbSB0aGUgZW5kIG9mIGEgc291cmNlIG5vZGUsIGV0Yy5cbiAqXG4gKiBAcGFyYW0gYVBhdHRlcm4gVGhlIHBhdHRlcm4gdG8gcmVwbGFjZS5cbiAqIEBwYXJhbSBhUmVwbGFjZW1lbnQgVGhlIHRoaW5nIHRvIHJlcGxhY2UgdGhlIHBhdHRlcm4gd2l0aC5cbiAqL1xuU291cmNlTm9kZS5wcm90b3R5cGUucmVwbGFjZVJpZ2h0ID0gZnVuY3Rpb24gU291cmNlTm9kZV9yZXBsYWNlUmlnaHQoYVBhdHRlcm4sIGFSZXBsYWNlbWVudCkge1xuICB2YXIgbGFzdENoaWxkID0gdGhpcy5jaGlsZHJlblt0aGlzLmNoaWxkcmVuLmxlbmd0aCAtIDFdO1xuICBpZiAobGFzdENoaWxkW2lzU291cmNlTm9kZV0pIHtcbiAgICBsYXN0Q2hpbGQucmVwbGFjZVJpZ2h0KGFQYXR0ZXJuLCBhUmVwbGFjZW1lbnQpO1xuICB9XG4gIGVsc2UgaWYgKHR5cGVvZiBsYXN0Q2hpbGQgPT09ICdzdHJpbmcnKSB7XG4gICAgdGhpcy5jaGlsZHJlblt0aGlzLmNoaWxkcmVuLmxlbmd0aCAtIDFdID0gbGFzdENoaWxkLnJlcGxhY2UoYVBhdHRlcm4sIGFSZXBsYWNlbWVudCk7XG4gIH1cbiAgZWxzZSB7XG4gICAgdGhpcy5jaGlsZHJlbi5wdXNoKCcnLnJlcGxhY2UoYVBhdHRlcm4sIGFSZXBsYWNlbWVudCkpO1xuICB9XG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBTZXQgdGhlIHNvdXJjZSBjb250ZW50IGZvciBhIHNvdXJjZSBmaWxlLiBUaGlzIHdpbGwgYmUgYWRkZWQgdG8gdGhlIFNvdXJjZU1hcEdlbmVyYXRvclxuICogaW4gdGhlIHNvdXJjZXNDb250ZW50IGZpZWxkLlxuICpcbiAqIEBwYXJhbSBhU291cmNlRmlsZSBUaGUgZmlsZW5hbWUgb2YgdGhlIHNvdXJjZSBmaWxlXG4gKiBAcGFyYW0gYVNvdXJjZUNvbnRlbnQgVGhlIGNvbnRlbnQgb2YgdGhlIHNvdXJjZSBmaWxlXG4gKi9cblNvdXJjZU5vZGUucHJvdG90eXBlLnNldFNvdXJjZUNvbnRlbnQgPVxuICBmdW5jdGlvbiBTb3VyY2VOb2RlX3NldFNvdXJjZUNvbnRlbnQoYVNvdXJjZUZpbGUsIGFTb3VyY2VDb250ZW50KSB7XG4gICAgdGhpcy5zb3VyY2VDb250ZW50c1t1dGlsLnRvU2V0U3RyaW5nKGFTb3VyY2VGaWxlKV0gPSBhU291cmNlQ29udGVudDtcbiAgfTtcblxuLyoqXG4gKiBXYWxrIG92ZXIgdGhlIHRyZWUgb2YgU291cmNlTm9kZXMuIFRoZSB3YWxraW5nIGZ1bmN0aW9uIGlzIGNhbGxlZCBmb3IgZWFjaFxuICogc291cmNlIGZpbGUgY29udGVudCBhbmQgaXMgcGFzc2VkIHRoZSBmaWxlbmFtZSBhbmQgc291cmNlIGNvbnRlbnQuXG4gKlxuICogQHBhcmFtIGFGbiBUaGUgdHJhdmVyc2FsIGZ1bmN0aW9uLlxuICovXG5Tb3VyY2VOb2RlLnByb3RvdHlwZS53YWxrU291cmNlQ29udGVudHMgPVxuICBmdW5jdGlvbiBTb3VyY2VOb2RlX3dhbGtTb3VyY2VDb250ZW50cyhhRm4pIHtcbiAgICBmb3IgKHZhciBpID0gMCwgbGVuID0gdGhpcy5jaGlsZHJlbi5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICAgICAgaWYgKHRoaXMuY2hpbGRyZW5baV1baXNTb3VyY2VOb2RlXSkge1xuICAgICAgICB0aGlzLmNoaWxkcmVuW2ldLndhbGtTb3VyY2VDb250ZW50cyhhRm4pO1xuICAgICAgfVxuICAgIH1cblxuICAgIHZhciBzb3VyY2VzID0gT2JqZWN0LmtleXModGhpcy5zb3VyY2VDb250ZW50cyk7XG4gICAgZm9yICh2YXIgaSA9IDAsIGxlbiA9IHNvdXJjZXMubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgIGFGbih1dGlsLmZyb21TZXRTdHJpbmcoc291cmNlc1tpXSksIHRoaXMuc291cmNlQ29udGVudHNbc291cmNlc1tpXV0pO1xuICAgIH1cbiAgfTtcblxuLyoqXG4gKiBSZXR1cm4gdGhlIHN0cmluZyByZXByZXNlbnRhdGlvbiBvZiB0aGlzIHNvdXJjZSBub2RlLiBXYWxrcyBvdmVyIHRoZSB0cmVlXG4gKiBhbmQgY29uY2F0ZW5hdGVzIGFsbCB0aGUgdmFyaW91cyBzbmlwcGV0cyB0b2dldGhlciB0byBvbmUgc3RyaW5nLlxuICovXG5Tb3VyY2VOb2RlLnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uIFNvdXJjZU5vZGVfdG9TdHJpbmcoKSB7XG4gIHZhciBzdHIgPSBcIlwiO1xuICB0aGlzLndhbGsoZnVuY3Rpb24gKGNodW5rKSB7XG4gICAgc3RyICs9IGNodW5rO1xuICB9KTtcbiAgcmV0dXJuIHN0cjtcbn07XG5cbi8qKlxuICogUmV0dXJucyB0aGUgc3RyaW5nIHJlcHJlc2VudGF0aW9uIG9mIHRoaXMgc291cmNlIG5vZGUgYWxvbmcgd2l0aCBhIHNvdXJjZVxuICogbWFwLlxuICovXG5Tb3VyY2VOb2RlLnByb3RvdHlwZS50b1N0cmluZ1dpdGhTb3VyY2VNYXAgPSBmdW5jdGlvbiBTb3VyY2VOb2RlX3RvU3RyaW5nV2l0aFNvdXJjZU1hcChhQXJncykge1xuICB2YXIgZ2VuZXJhdGVkID0ge1xuICAgIGNvZGU6IFwiXCIsXG4gICAgbGluZTogMSxcbiAgICBjb2x1bW46IDBcbiAgfTtcbiAgdmFyIG1hcCA9IG5ldyBTb3VyY2VNYXBHZW5lcmF0b3IoYUFyZ3MpO1xuICB2YXIgc291cmNlTWFwcGluZ0FjdGl2ZSA9IGZhbHNlO1xuICB2YXIgbGFzdE9yaWdpbmFsU291cmNlID0gbnVsbDtcbiAgdmFyIGxhc3RPcmlnaW5hbExpbmUgPSBudWxsO1xuICB2YXIgbGFzdE9yaWdpbmFsQ29sdW1uID0gbnVsbDtcbiAgdmFyIGxhc3RPcmlnaW5hbE5hbWUgPSBudWxsO1xuICB0aGlzLndhbGsoZnVuY3Rpb24gKGNodW5rLCBvcmlnaW5hbCkge1xuICAgIGdlbmVyYXRlZC5jb2RlICs9IGNodW5rO1xuICAgIGlmIChvcmlnaW5hbC5zb3VyY2UgIT09IG51bGxcbiAgICAgICAgJiYgb3JpZ2luYWwubGluZSAhPT0gbnVsbFxuICAgICAgICAmJiBvcmlnaW5hbC5jb2x1bW4gIT09IG51bGwpIHtcbiAgICAgIGlmKGxhc3RPcmlnaW5hbFNvdXJjZSAhPT0gb3JpZ2luYWwuc291cmNlXG4gICAgICAgICB8fCBsYXN0T3JpZ2luYWxMaW5lICE9PSBvcmlnaW5hbC5saW5lXG4gICAgICAgICB8fCBsYXN0T3JpZ2luYWxDb2x1bW4gIT09IG9yaWdpbmFsLmNvbHVtblxuICAgICAgICAgfHwgbGFzdE9yaWdpbmFsTmFtZSAhPT0gb3JpZ2luYWwubmFtZSkge1xuICAgICAgICBtYXAuYWRkTWFwcGluZyh7XG4gICAgICAgICAgc291cmNlOiBvcmlnaW5hbC5zb3VyY2UsXG4gICAgICAgICAgb3JpZ2luYWw6IHtcbiAgICAgICAgICAgIGxpbmU6IG9yaWdpbmFsLmxpbmUsXG4gICAgICAgICAgICBjb2x1bW46IG9yaWdpbmFsLmNvbHVtblxuICAgICAgICAgIH0sXG4gICAgICAgICAgZ2VuZXJhdGVkOiB7XG4gICAgICAgICAgICBsaW5lOiBnZW5lcmF0ZWQubGluZSxcbiAgICAgICAgICAgIGNvbHVtbjogZ2VuZXJhdGVkLmNvbHVtblxuICAgICAgICAgIH0sXG4gICAgICAgICAgbmFtZTogb3JpZ2luYWwubmFtZVxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICAgIGxhc3RPcmlnaW5hbFNvdXJjZSA9IG9yaWdpbmFsLnNvdXJjZTtcbiAgICAgIGxhc3RPcmlnaW5hbExpbmUgPSBvcmlnaW5hbC5saW5lO1xuICAgICAgbGFzdE9yaWdpbmFsQ29sdW1uID0gb3JpZ2luYWwuY29sdW1uO1xuICAgICAgbGFzdE9yaWdpbmFsTmFtZSA9IG9yaWdpbmFsLm5hbWU7XG4gICAgICBzb3VyY2VNYXBwaW5nQWN0aXZlID0gdHJ1ZTtcbiAgICB9IGVsc2UgaWYgKHNvdXJjZU1hcHBpbmdBY3RpdmUpIHtcbiAgICAgIG1hcC5hZGRNYXBwaW5nKHtcbiAgICAgICAgZ2VuZXJhdGVkOiB7XG4gICAgICAgICAgbGluZTogZ2VuZXJhdGVkLmxpbmUsXG4gICAgICAgICAgY29sdW1uOiBnZW5lcmF0ZWQuY29sdW1uXG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgbGFzdE9yaWdpbmFsU291cmNlID0gbnVsbDtcbiAgICAgIHNvdXJjZU1hcHBpbmdBY3RpdmUgPSBmYWxzZTtcbiAgICB9XG4gICAgZm9yICh2YXIgaWR4ID0gMCwgbGVuZ3RoID0gY2h1bmsubGVuZ3RoOyBpZHggPCBsZW5ndGg7IGlkeCsrKSB7XG4gICAgICBpZiAoY2h1bmsuY2hhckNvZGVBdChpZHgpID09PSBORVdMSU5FX0NPREUpIHtcbiAgICAgICAgZ2VuZXJhdGVkLmxpbmUrKztcbiAgICAgICAgZ2VuZXJhdGVkLmNvbHVtbiA9IDA7XG4gICAgICAgIC8vIE1hcHBpbmdzIGVuZCBhdCBlb2xcbiAgICAgICAgaWYgKGlkeCArIDEgPT09IGxlbmd0aCkge1xuICAgICAgICAgIGxhc3RPcmlnaW5hbFNvdXJjZSA9IG51bGw7XG4gICAgICAgICAgc291cmNlTWFwcGluZ0FjdGl2ZSA9IGZhbHNlO1xuICAgICAgICB9IGVsc2UgaWYgKHNvdXJjZU1hcHBpbmdBY3RpdmUpIHtcbiAgICAgICAgICBtYXAuYWRkTWFwcGluZyh7XG4gICAgICAgICAgICBzb3VyY2U6IG9yaWdpbmFsLnNvdXJjZSxcbiAgICAgICAgICAgIG9yaWdpbmFsOiB7XG4gICAgICAgICAgICAgIGxpbmU6IG9yaWdpbmFsLmxpbmUsXG4gICAgICAgICAgICAgIGNvbHVtbjogb3JpZ2luYWwuY29sdW1uXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZ2VuZXJhdGVkOiB7XG4gICAgICAgICAgICAgIGxpbmU6IGdlbmVyYXRlZC5saW5lLFxuICAgICAgICAgICAgICBjb2x1bW46IGdlbmVyYXRlZC5jb2x1bW5cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBuYW1lOiBvcmlnaW5hbC5uYW1lXG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGdlbmVyYXRlZC5jb2x1bW4rKztcbiAgICAgIH1cbiAgICB9XG4gIH0pO1xuICB0aGlzLndhbGtTb3VyY2VDb250ZW50cyhmdW5jdGlvbiAoc291cmNlRmlsZSwgc291cmNlQ29udGVudCkge1xuICAgIG1hcC5zZXRTb3VyY2VDb250ZW50KHNvdXJjZUZpbGUsIHNvdXJjZUNvbnRlbnQpO1xuICB9KTtcblxuICByZXR1cm4geyBjb2RlOiBnZW5lcmF0ZWQuY29kZSwgbWFwOiBtYXAgfTtcbn07XG5cbmV4cG9ydHMuU291cmNlTm9kZSA9IFNvdXJjZU5vZGU7XG4iLCIvKlxuICogQ29weXJpZ2h0IDIwMDktMjAxMSBNb3ppbGxhIEZvdW5kYXRpb24gYW5kIGNvbnRyaWJ1dG9yc1xuICogTGljZW5zZWQgdW5kZXIgdGhlIE5ldyBCU0QgbGljZW5zZS4gU2VlIExJQ0VOU0UudHh0IG9yOlxuICogaHR0cDovL29wZW5zb3VyY2Uub3JnL2xpY2Vuc2VzL0JTRC0zLUNsYXVzZVxuICovXG5leHBvcnRzLlNvdXJjZU1hcEdlbmVyYXRvciA9IHJlcXVpcmUoJy4vbGliL3NvdXJjZS1tYXAtZ2VuZXJhdG9yJykuU291cmNlTWFwR2VuZXJhdG9yO1xuZXhwb3J0cy5Tb3VyY2VNYXBDb25zdW1lciA9IHJlcXVpcmUoJy4vbGliL3NvdXJjZS1tYXAtY29uc3VtZXInKS5Tb3VyY2VNYXBDb25zdW1lcjtcbmV4cG9ydHMuU291cmNlTm9kZSA9IHJlcXVpcmUoJy4vbGliL3NvdXJjZS1ub2RlJykuU291cmNlTm9kZTtcbiIsImltcG9ydCB7IFNvdXJjZU1hcENvbnN1bWVyIH0gZnJvbSAnc291cmNlLW1hcC1qcydcbmltcG9ydCB0eXBlIHsgUmF3U291cmNlTWFwIH0gZnJvbSAnc291cmNlLW1hcC1qcydcbmltcG9ydCB0eXBlIHsgVml0ZXN0IH0gZnJvbSAnLi4vbm9kZSdcbmltcG9ydCB0eXBlIHsgRXJyb3JXaXRoRGlmZiwgUGFyc2VkU3RhY2ssIFBvc2l0aW9uIH0gZnJvbSAnLi4vdHlwZXMvZ2VuZXJhbCdcbmltcG9ydCB7IG5vdE51bGxpc2ggfSBmcm9tICcuL2Jhc2UnXG5cbmV4cG9ydCBjb25zdCBsaW5lU3BsaXRSRSA9IC9cXHI/XFxuL1xuXG5leHBvcnQgZnVuY3Rpb24gZ2V0T3JpZ2luYWxQb3MobWFwOiBSYXdTb3VyY2VNYXAgfCBudWxsIHwgdW5kZWZpbmVkLCB7IGxpbmUsIGNvbHVtbiB9OiBQb3NpdGlvbik6IFByb21pc2U8UG9zaXRpb24gfCBudWxsPiB7XG4gIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xuICAgIGlmICghbWFwKVxuICAgICAgcmV0dXJuIHJlc29sdmUobnVsbClcblxuICAgIGNvbnN0IGNvbnN1bWVyID0gbmV3IFNvdXJjZU1hcENvbnN1bWVyKG1hcClcbiAgICBjb25zdCBwb3MgPSBjb25zdW1lci5vcmlnaW5hbFBvc2l0aW9uRm9yKHsgbGluZSwgY29sdW1uIH0pXG4gICAgaWYgKHBvcy5saW5lICE9IG51bGwgJiYgcG9zLmNvbHVtbiAhPSBudWxsKVxuICAgICAgcmVzb2x2ZShwb3MgYXMgUG9zaXRpb24pXG5cbiAgICBlbHNlXG4gICAgICByZXNvbHZlKG51bGwpXG4gIH0pXG59XG5cbmNvbnN0IHN0YWNrRm5DYWxsUkUgPSAvYXQgKC4qKSBcXCgoLispOihcXGQrKTooXFxkKylcXCkkL1xuY29uc3Qgc3RhY2tCYXJlUGF0aFJFID0gL2F0ID8oLiopICguKyk6KFxcZCspOihcXGQrKSQvXG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBpbnRlcnByZXRTb3VyY2VQb3Moc3RhY2tGcmFtZXM6IFBhcnNlZFN0YWNrW10sIGN0eDogVml0ZXN0KTogUHJvbWlzZTxQYXJzZWRTdGFja1tdPiB7XG4gIGZvciAoY29uc3QgZnJhbWUgb2Ygc3RhY2tGcmFtZXMpIHtcbiAgICBjb25zdCB0cmFuc2Zvcm1SZXN1bHQgPSBjdHguc2VydmVyLm1vZHVsZUdyYXBoLmdldE1vZHVsZUJ5SWQoZnJhbWUuZmlsZSk/LnNzclRyYW5zZm9ybVJlc3VsdFxuICAgIGlmICghdHJhbnNmb3JtUmVzdWx0KVxuICAgICAgY29udGludWVcbiAgICBjb25zdCBzb3VyY2VQb3MgPSBhd2FpdCBnZXRPcmlnaW5hbFBvcyh0cmFuc2Zvcm1SZXN1bHQubWFwIGFzIGFueSBhcyBSYXdTb3VyY2VNYXAgfCB1bmRlZmluZWQsIGZyYW1lKVxuICAgIGlmIChzb3VyY2VQb3MpXG4gICAgICBmcmFtZS5zb3VyY2VQb3MgPSBzb3VyY2VQb3NcbiAgfVxuXG4gIHJldHVybiBzdGFja0ZyYW1lc1xufVxuXG5jb25zdCBzdGFja0lnbm9yZVBhdHRlcm5zID0gW1xuICAnbm9kZTppbnRlcm5hbCcsXG4gICcvdml0ZXN0L2Rpc3QvJyxcbiAgJy9ub2RlX21vZHVsZXMvY2hhaS8nLFxuICAnL25vZGVfbW9kdWxlcy90aW55cG9vbC8nLFxuICAnL25vZGVfbW9kdWxlcy90aW55c3B5LycsXG5dXG5cbmV4cG9ydCBmdW5jdGlvbiBwYXJzZVN0YWNrdHJhY2UoZTogRXJyb3JXaXRoRGlmZiwgZnVsbCA9IGZhbHNlKTogUGFyc2VkU3RhY2tbXSB7XG4gIGlmIChlLnN0YWNrcylcbiAgICByZXR1cm4gZS5zdGFja3NcblxuICBjb25zdCBzdGFja1N0ciA9IGUuc3RhY2sgfHwgZS5zdGFja1N0ciB8fCAnJ1xuICBjb25zdCBzdGFja0ZyYW1lcyA9IHN0YWNrU3RyXG4gICAgLnNwbGl0KCdcXG4nKVxuICAgIC5tYXAoKHJhdyk6IFBhcnNlZFN0YWNrIHwgbnVsbCA9PiB7XG4gICAgICBjb25zdCBsaW5lID0gcmF3LnRyaW0oKVxuICAgICAgY29uc3QgbWF0Y2ggPSBsaW5lLm1hdGNoKHN0YWNrRm5DYWxsUkUpIHx8IGxpbmUubWF0Y2goc3RhY2tCYXJlUGF0aFJFKVxuICAgICAgaWYgKCFtYXRjaClcbiAgICAgICAgcmV0dXJuIG51bGxcblxuICAgICAgbGV0IGZpbGUgPSBtYXRjaFsyXVxuICAgICAgaWYgKGZpbGUuc3RhcnRzV2l0aCgnZmlsZTovLycpKVxuICAgICAgICBmaWxlID0gZmlsZS5zbGljZSg3KVxuXG4gICAgICBpZiAoIWZ1bGwgJiYgc3RhY2tJZ25vcmVQYXR0ZXJucy5zb21lKHAgPT4gZmlsZS5pbmNsdWRlcyhwKSkpXG4gICAgICAgIHJldHVybiBudWxsXG5cbiAgICAgIHJldHVybiB7XG4gICAgICAgIG1ldGhvZDogbWF0Y2hbMV0sXG4gICAgICAgIGZpbGU6IG1hdGNoWzJdLFxuICAgICAgICBsaW5lOiBwYXJzZUludChtYXRjaFszXSksXG4gICAgICAgIGNvbHVtbjogcGFyc2VJbnQobWF0Y2hbNF0pLFxuICAgICAgfVxuICAgIH0pXG4gICAgLmZpbHRlcihub3ROdWxsaXNoKVxuXG4gIGUuc3RhY2tzID0gc3RhY2tGcmFtZXNcbiAgcmV0dXJuIHN0YWNrRnJhbWVzXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBwb3NUb051bWJlcihcbiAgc291cmNlOiBzdHJpbmcsXG4gIHBvczogbnVtYmVyIHwgUG9zaXRpb24sXG4pOiBudW1iZXIge1xuICBpZiAodHlwZW9mIHBvcyA9PT0gJ251bWJlcicpXG4gICAgcmV0dXJuIHBvc1xuICBjb25zdCBsaW5lcyA9IHNvdXJjZS5zcGxpdChsaW5lU3BsaXRSRSlcbiAgY29uc3QgeyBsaW5lLCBjb2x1bW4gfSA9IHBvc1xuICBsZXQgc3RhcnQgPSAwXG5cbiAgaWYgKGxpbmUgPiBsaW5lcy5sZW5ndGgpXG4gICAgcmV0dXJuIHNvdXJjZS5sZW5ndGhcblxuICBmb3IgKGxldCBpID0gMDsgaSA8IGxpbmUgLSAxOyBpKyspXG4gICAgc3RhcnQgKz0gbGluZXNbaV0ubGVuZ3RoICsgMVxuXG4gIHJldHVybiBzdGFydCArIGNvbHVtblxufVxuXG5leHBvcnQgZnVuY3Rpb24gbnVtYmVyVG9Qb3MoXG4gIHNvdXJjZTogc3RyaW5nLFxuICBvZmZzZXQ6IG51bWJlciB8IFBvc2l0aW9uLFxuKTogUG9zaXRpb24ge1xuICBpZiAodHlwZW9mIG9mZnNldCAhPT0gJ251bWJlcicpIHJldHVybiBvZmZzZXRcbiAgaWYgKG9mZnNldCA+IHNvdXJjZS5sZW5ndGgpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICBgb2Zmc2V0IGlzIGxvbmdlciB0aGFuIHNvdXJjZSBsZW5ndGghIG9mZnNldCAke29mZnNldH0gPiBsZW5ndGggJHtzb3VyY2UubGVuZ3RofWAsXG4gICAgKVxuICB9XG4gIGNvbnN0IGxpbmVzID0gc291cmNlLnNwbGl0KGxpbmVTcGxpdFJFKVxuICBsZXQgY291bnRlZCA9IDBcbiAgbGV0IGxpbmUgPSAwXG4gIGxldCBjb2x1bW4gPSAwXG4gIGZvciAoOyBsaW5lIDwgbGluZXMubGVuZ3RoOyBsaW5lKyspIHtcbiAgICBjb25zdCBsaW5lTGVuZ3RoID0gbGluZXNbbGluZV0ubGVuZ3RoICsgMVxuICAgIGlmIChjb3VudGVkICsgbGluZUxlbmd0aCA+PSBvZmZzZXQpIHtcbiAgICAgIGNvbHVtbiA9IG9mZnNldCAtIGNvdW50ZWQgKyAxXG4gICAgICBicmVha1xuICAgIH1cbiAgICBjb3VudGVkICs9IGxpbmVMZW5ndGhcbiAgfVxuICByZXR1cm4geyBsaW5lOiBsaW5lICsgMSwgY29sdW1uIH1cbn1cbiIsImV4cG9ydCBjb25zdCBGX1JJR0hUID0gJ+KGkidcbmV4cG9ydCBjb25zdCBGX0RPV04gPSAn4oaTJ1xuZXhwb3J0IGNvbnN0IEZfVVAgPSAn4oaRJ1xuZXhwb3J0IGNvbnN0IEZfRE9XTl9SSUdIVCA9ICfihrMnXG5leHBvcnQgY29uc3QgRl9QT0lOVEVSID0gJ+KdrydcbmV4cG9ydCBjb25zdCBGX0RPVCA9ICfCtydcbmV4cG9ydCBjb25zdCBGX0NIRUNLID0gJ+KImidcbmV4cG9ydCBjb25zdCBGX0NST1NTID0gJ8OXJ1xuZXhwb3J0IGNvbnN0IEZfTE9OR19EQVNIID0gJ+KOrydcbmV4cG9ydCBjb25zdCBGX1JJR0hUX1RSSSA9ICfilrYnXG4iLCIvKiBlc2xpbnQtZGlzYWJsZSBwcmVmZXItdGVtcGxhdGUgKi9cbi8qIGVzbGludC1kaXNhYmxlIG5vLXRlbXBsYXRlLWN1cmx5LWluLXN0cmluZyAqL1xuaW1wb3J0IHsgZXhpc3RzU3luYywgcHJvbWlzZXMgYXMgZnMgfSBmcm9tICdmcydcbmltcG9ydCB7IHJlbGF0aXZlIH0gZnJvbSAncGF0aGUnXG5pbXBvcnQgYyBmcm9tICdwaWNvY29sb3JzJ1xuaW1wb3J0ICogYXMgZGlmZiBmcm9tICdkaWZmJ1xuaW1wb3J0IGNsaVRydW5jYXRlIGZyb20gJ2NsaS10cnVuY2F0ZSdcbmltcG9ydCB0eXBlIHsgVml0ZXN0IH0gZnJvbSAnLi4vLi4vLi4vbm9kZSdcbmltcG9ydCB0eXBlIHsgRXJyb3JXaXRoRGlmZiwgUGFyc2VkU3RhY2ssIFBvc2l0aW9uIH0gZnJvbSAnLi4vLi4vLi4vdHlwZXMvZ2VuZXJhbCdcbmltcG9ydCB7IGludGVycHJldFNvdXJjZVBvcywgbGluZVNwbGl0UkUsIHBhcnNlU3RhY2t0cmFjZSwgcG9zVG9OdW1iZXIgfSBmcm9tICcuLi8uLi8uLi91dGlscy9zb3VyY2UtbWFwJ1xuaW1wb3J0IHsgRl9QT0lOVEVSIH0gZnJvbSAnLi9maWd1cmVzJ1xuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gcHJpbnRFcnJvcihlcnJvcjogdW5rbm93biwgY3R4OiBWaXRlc3QpIHtcbiAgbGV0IGUgPSBlcnJvciBhcyBFcnJvcldpdGhEaWZmXG5cbiAgaWYgKHR5cGVvZiBlcnJvciA9PT0gJ3N0cmluZycpIHtcbiAgICBlID0ge1xuICAgICAgbWVzc2FnZTogZXJyb3Iuc3BsaXQoL1xcbi9nKVswXSxcbiAgICAgIHN0YWNrOiBlcnJvcixcbiAgICB9IGFzIGFueVxuICB9XG5cbiAgY29uc3Qgc3RhY2tzID0gcGFyc2VTdGFja3RyYWNlKGUpXG5cbiAgYXdhaXQgaW50ZXJwcmV0U291cmNlUG9zKHN0YWNrcywgY3R4KVxuXG4gIGNvbnN0IG5lYXJlc3QgPSBzdGFja3MuZmluZChzdGFjayA9PlxuICAgIGN0eC5zZXJ2ZXIubW9kdWxlR3JhcGguZ2V0TW9kdWxlQnlJZChzdGFjay5maWxlKVxuICAgICAgJiYgZXhpc3RzU3luYyhzdGFjay5maWxlKSxcbiAgKVxuXG4gIHByaW50RXJyb3JNZXNzYWdlKGUsIGN0eC5jb25zb2xlKVxuICBhd2FpdCBwcmludFN0YWNrKGN0eCwgc3RhY2tzLCBuZWFyZXN0LCBhc3luYyhzLCBwb3MpID0+IHtcbiAgICBpZiAocyA9PT0gbmVhcmVzdCAmJiBuZWFyZXN0KSB7XG4gICAgICBjb25zdCBzb3VyY2VDb2RlID0gYXdhaXQgZnMucmVhZEZpbGUobmVhcmVzdC5maWxlLCAndXRmLTgnKVxuICAgICAgY3R4LmxvZyhjLnllbGxvdyhnZW5lcmF0ZUNvZGVGcmFtZShzb3VyY2VDb2RlLCA0LCBwb3MpKSlcbiAgICB9XG4gIH0pXG5cbiAgaGFuZGxlSW1wb3J0T3V0c2lkZU1vZHVsZUVycm9yKGUuc3RhY2sgfHwgZS5zdGFja1N0ciB8fCAnJywgY3R4KVxuXG4gIGlmIChlLnNob3dEaWZmKVxuICAgIGRpc3BsYXlEaWZmKGUuYWN0dWFsLCBlLmV4cGVjdGVkLCBjdHguY29uc29sZSlcbn1cblxuY29uc3QgZXNtRXJyb3JzID0gW1xuICAnQ2Fubm90IHVzZSBpbXBvcnQgc3RhdGVtZW50IG91dHNpZGUgYSBtb2R1bGUnLFxuICAnVW5leHBlY3RlZCB0b2tlbiBcXCdleHBvcnRcXCcnLFxuXVxuXG5mdW5jdGlvbiBoYW5kbGVJbXBvcnRPdXRzaWRlTW9kdWxlRXJyb3Ioc3RhY2s6IHN0cmluZywgY3R4OiBWaXRlc3QpIHtcbiAgaWYgKCFlc21FcnJvcnMuc29tZShlID0+IHN0YWNrLmluY2x1ZGVzKGUpKSlcbiAgICByZXR1cm5cblxuICBjb25zdCBwYXRoID0gc3RhY2suc3BsaXQoJ1xcbicpWzBdLnRyaW0oKVxuICBsZXQgbmFtZSA9IHBhdGguc3BsaXQoJy9ub2RlX21vZHVsZXMvJykucG9wKCkgfHwgJydcbiAgaWYgKG5hbWU/LnN0YXJ0c1dpdGgoJ0AnKSlcbiAgICBuYW1lID0gbmFtZS5zcGxpdCgnLycpLnNsaWNlKDAsIDIpLmpvaW4oJy8nKVxuICBlbHNlXG4gICAgbmFtZSA9IG5hbWUuc3BsaXQoJy8nKVswXVxuXG4gIGN0eC5jb25zb2xlLmVycm9yKGMueWVsbG93KFxuICAgIGBNb2R1bGUgJHtwYXRofSBzZWVtcyB0byBiZSBhbiBFUyBNb2R1bGUgYnV0IHNoaXBwZWQgaW4gYSBDb21tb25KUyBwYWNrYWdlLiBgXG4rIGBZb3UgbWlnaHQgd2FudCB0byBjcmVhdGUgYW4gaXNzdWUgdG8gdGhlIHBhY2thZ2UgJHtjLmJvbGQoYFwiJHtuYW1lfVwiYCl9IGFza2luZyBgXG4rICd0aGVtIHRvIHNoaXAgdGhlIGZpbGUgaW4gLm1qcyBleHRlbnNpb24gb3IgYWRkIFwidHlwZVwiOiBcIm1vZHVsZVwiIGluIHRoZWlyIHBhY2thZ2UuanNvbi4nXG4rICdcXG5cXG4nXG4rICdBcyBhIHRlbXBvcmFyeSB3b3JrYXJvdW5kIHlvdSBjYW4gdHJ5IHRvIGlubGluZSB0aGUgcGFja2FnZSBieSB1cGRhdGluZyB5b3VyIGNvbmZpZzonXG4rICdcXG5cXG4nXG4rIGMuZ3JheShjLmRpbSgnLy8gdml0ZXN0LmNvbmZpZy5qcycpKVxuKyAnXFxuJ1xuKyBjLmdyZWVuKGBleHBvcnQgZGVmYXVsdCB7XG4gIHRlc3Q6IHtcbiAgICBkZXBzOiB7XG4gICAgICBpbmxpbmU6IFtcbiAgICAgICAgJHtjLnllbGxvdyhjLmJvbGQoYFwiJHtuYW1lfVwiYCkpfVxuICAgICAgXVxuICAgIH1cbiAgfVxufVxcbmApKSlcbn1cblxuZnVuY3Rpb24gZGlzcGxheURpZmYoYWN0dWFsOiBzdHJpbmcsIGV4cGVjdGVkOiBzdHJpbmcsIGNvbnNvbGU6IENvbnNvbGUpIHtcbiAgY29uc29sZS5lcnJvcihjLmdyYXkodW5pZmllZERpZmYoYWN0dWFsLCBleHBlY3RlZCkpICsgJ1xcbicpXG59XG5cbmZ1bmN0aW9uIHByaW50RXJyb3JNZXNzYWdlKGVycm9yOiBFcnJvcldpdGhEaWZmLCBjb25zb2xlOiBDb25zb2xlKSB7XG4gIGNvbnN0IGVycm9yTmFtZSA9IGVycm9yLm5hbWUgfHwgZXJyb3IubmFtZVN0ciB8fCAnVW5rbm93biBFcnJvcidcbiAgY29uc29sZS5lcnJvcihjLnJlZChgJHtjLmJvbGQoZXJyb3JOYW1lKX06ICR7ZXJyb3IubWVzc2FnZX1gKSlcbn1cblxuYXN5bmMgZnVuY3Rpb24gcHJpbnRTdGFjayhcbiAgY3R4OiBWaXRlc3QsXG4gIHN0YWNrOiBQYXJzZWRTdGFja1tdLFxuICBoaWdobGlnaHQ/OiBQYXJzZWRTdGFjayxcbiAgb25TdGFjaz86ICgoc3RhY2s6IFBhcnNlZFN0YWNrLCBwb3M6IFBvc2l0aW9uKSA9PiB2b2lkKSxcbikge1xuICBpZiAoIXN0YWNrLmxlbmd0aClcbiAgICByZXR1cm5cblxuICBmb3IgKGNvbnN0IGZyYW1lIG9mIHN0YWNrKSB7XG4gICAgY29uc3QgcG9zID0gZnJhbWUuc291cmNlUG9zIHx8IGZyYW1lXG4gICAgY29uc3QgY29sb3IgPSBmcmFtZSA9PT0gaGlnaGxpZ2h0ID8gYy55ZWxsb3cgOiBjLmdyYXlcbiAgICBjb25zdCBwYXRoID0gcmVsYXRpdmUoY3R4LmNvbmZpZy5yb290LCBmcmFtZS5maWxlKVxuXG4gICAgY3R4LmxvZyhjb2xvcihgICR7Yy5kaW0oRl9QT0lOVEVSKX0gJHtbZnJhbWUubWV0aG9kLCBjLmRpbShgJHtwYXRofToke3Bvcy5saW5lfToke3Bvcy5jb2x1bW59YCldLmZpbHRlcihCb29sZWFuKS5qb2luKCcgJyl9YCkpXG4gICAgYXdhaXQgb25TdGFjaz8uKGZyYW1lLCBwb3MpXG5cbiAgICAvLyByZWFjaGVkIGF0IHRlc3QgZmlsZSwgc2tpcCB0aGUgZm9sbG93IHN0YWNrXG4gICAgaWYgKGZyYW1lLmZpbGUgaW4gY3R4LnN0YXRlLmZpbGVzTWFwKVxuICAgICAgYnJlYWtcbiAgfVxuICBjdHgubG9nKClcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdlbmVyYXRlQ29kZUZyYW1lKFxuICBzb3VyY2U6IHN0cmluZyxcbiAgaW5kZW50ID0gMCxcbiAgc3RhcnQ6IG51bWJlciB8IFBvc2l0aW9uID0gMCxcbiAgZW5kPzogbnVtYmVyLFxuICByYW5nZSA9IDIsXG4pOiBzdHJpbmcge1xuICBzdGFydCA9IHBvc1RvTnVtYmVyKHNvdXJjZSwgc3RhcnQpXG4gIGVuZCA9IGVuZCB8fCBzdGFydFxuICBjb25zdCBsaW5lcyA9IHNvdXJjZS5zcGxpdChsaW5lU3BsaXRSRSlcbiAgbGV0IGNvdW50ID0gMFxuICBsZXQgcmVzOiBzdHJpbmdbXSA9IFtdXG5cbiAgY29uc3QgY29sdW1ucyA9IHByb2Nlc3Muc3Rkb3V0LmNvbHVtbnMgfHwgODBcblxuICBmdW5jdGlvbiBsaW5lTm8obm86IG51bWJlciB8IHN0cmluZyA9ICcnKSB7XG4gICAgcmV0dXJuIGMuZ3JheShgJHtTdHJpbmcobm8pLnBhZFN0YXJ0KDMsICcgJyl9fCBgKVxuICB9XG5cbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBsaW5lcy5sZW5ndGg7IGkrKykge1xuICAgIGNvdW50ICs9IGxpbmVzW2ldLmxlbmd0aCArIDFcbiAgICBpZiAoY291bnQgPj0gc3RhcnQpIHtcbiAgICAgIGZvciAobGV0IGogPSBpIC0gcmFuZ2U7IGogPD0gaSArIHJhbmdlIHx8IGVuZCA+IGNvdW50OyBqKyspIHtcbiAgICAgICAgaWYgKGogPCAwIHx8IGogPj0gbGluZXMubGVuZ3RoKVxuICAgICAgICAgIGNvbnRpbnVlXG5cbiAgICAgICAgY29uc3QgbGluZUxlbmd0aCA9IGxpbmVzW2pdLmxlbmd0aFxuXG4gICAgICAgIC8vIHRvIGxvbmcsIG1heWJlIGl0J3MgYSBtaW5pZmllZCBmaWxlLCBza2lwIGZvciBjb2RlZnJhbWVcbiAgICAgICAgaWYgKGxpbmVMZW5ndGggPiAyMDApXG4gICAgICAgICAgcmV0dXJuICcnXG5cbiAgICAgICAgcmVzLnB1c2gobGluZU5vKGogKyAxKSArIGNsaVRydW5jYXRlKGxpbmVzW2pdLCBjb2x1bW5zIC0gNSAtIGluZGVudCkpXG5cbiAgICAgICAgaWYgKGogPT09IGkpIHtcbiAgICAgICAgICAvLyBwdXNoIHVuZGVybGluZVxuICAgICAgICAgIGNvbnN0IHBhZCA9IHN0YXJ0IC0gKGNvdW50IC0gbGluZUxlbmd0aClcbiAgICAgICAgICBjb25zdCBsZW5ndGggPSBNYXRoLm1heCgxLCBlbmQgPiBjb3VudCA/IGxpbmVMZW5ndGggLSBwYWQgOiBlbmQgLSBzdGFydClcbiAgICAgICAgICByZXMucHVzaChsaW5lTm8oKSArICcgJy5yZXBlYXQocGFkKSArIGMucmVkKCdeJy5yZXBlYXQobGVuZ3RoKSkpXG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoaiA+IGkpIHtcbiAgICAgICAgICBpZiAoZW5kID4gY291bnQpIHtcbiAgICAgICAgICAgIGNvbnN0IGxlbmd0aCA9IE1hdGgubWF4KDEsIE1hdGgubWluKGVuZCAtIGNvdW50LCBsaW5lTGVuZ3RoKSlcbiAgICAgICAgICAgIHJlcy5wdXNoKGxpbmVObygpICsgYy5yZWQoJ14nLnJlcGVhdChsZW5ndGgpKSlcbiAgICAgICAgICB9XG4gICAgICAgICAgY291bnQgKz0gbGluZUxlbmd0aCArIDFcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgYnJlYWtcbiAgICB9XG4gIH1cblxuICBpZiAoaW5kZW50KVxuICAgIHJlcyA9IHJlcy5tYXAobGluZSA9PiAnICcucmVwZWF0KGluZGVudCkgKyBsaW5lKVxuXG4gIHJldHVybiByZXMuam9pbignXFxuJylcbn1cblxuLyoqXG4gKiBSZXR1cm5zIHVuaWZpZWQgZGlmZiBiZXR3ZWVuIHR3byBzdHJpbmdzIHdpdGggY29sb3VyZWQgQU5TSSBvdXRwdXQuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7U3RyaW5nfSBhY3R1YWxcbiAqIEBwYXJhbSB7U3RyaW5nfSBleHBlY3RlZFxuICogQHJldHVybiB7c3RyaW5nfSBUaGUgZGlmZi5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHVuaWZpZWREaWZmKGFjdHVhbDogc3RyaW5nLCBleHBlY3RlZDogc3RyaW5nKSB7XG4gIGlmIChhY3R1YWwgPT09IGV4cGVjdGVkKVxuICAgIHJldHVybiAnJ1xuXG4gIGNvbnN0IGluZGVudCA9ICcgICdcbiAgY29uc3QgZGlmZkxpbWl0ID0gMTVcblxuICBjb25zdCBjb3VudHMgPSB7XG4gICAgJysnOiAwLFxuICAgICctJzogMCxcbiAgfVxuICBsZXQgcHJldmlvdXNTdGF0ZTogJy0nIHwgJysnIHwgbnVsbCA9IG51bGxcbiAgbGV0IHByZXZpb3VzQ291bnQgPSAwXG4gIGZ1bmN0aW9uIHByZXByb2Nlc3MobGluZTogc3RyaW5nKSB7XG4gICAgaWYgKCFsaW5lIHx8IGxpbmUubWF0Y2goL1xcXFwgTm8gbmV3bGluZS8pKVxuICAgICAgcmV0dXJuXG5cbiAgICBjb25zdCBjaGFyID0gbGluZVswXSBhcyAnKycgfCAnLSdcbiAgICBpZiAoJy0rJy5pbmNsdWRlcyhjaGFyKSkge1xuICAgICAgaWYgKHByZXZpb3VzU3RhdGUgIT09IGNoYXIpIHtcbiAgICAgICAgcHJldmlvdXNTdGF0ZSA9IGNoYXJcbiAgICAgICAgcHJldmlvdXNDb3VudCA9IDBcbiAgICAgIH1cbiAgICAgIHByZXZpb3VzQ291bnQrK1xuICAgICAgY291bnRzW2NoYXJdKytcbiAgICAgIGlmIChwcmV2aW91c0NvdW50ID09PSBkaWZmTGltaXQpXG4gICAgICAgIHJldHVybiBjLmRpbShjaGFyICsgJyAuLi4nKVxuICAgICAgZWxzZSBpZiAocHJldmlvdXNDb3VudCA+IGRpZmZMaW1pdClcbiAgICAgICAgcmV0dXJuXG4gICAgfVxuICAgIHJldHVybiBsaW5lXG4gIH1cblxuICBjb25zdCBtc2cgPSBkaWZmLmNyZWF0ZVBhdGNoKCdzdHJpbmcnLCBleHBlY3RlZCwgYWN0dWFsKVxuICBjb25zdCBsaW5lcyA9IG1zZy5zcGxpdCgnXFxuJykuc2xpY2UoNSkubWFwKHByZXByb2Nlc3MpLmZpbHRlcihCb29sZWFuKSBhcyBzdHJpbmdbXVxuICBjb25zdCBpc0NvbXBhY3QgPSBjb3VudHNbJysnXSA9PT0gMSAmJiBjb3VudHNbJy0nXSA9PT0gMSAmJiBsaW5lcy5sZW5ndGggPT09IDJcblxuICBsZXQgZm9ybWF0dGVkID0gbGluZXMubWFwKChsaW5lOiBzdHJpbmcpID0+IHtcbiAgICBpZiAobGluZVswXSA9PT0gJy0nKSB7XG4gICAgICBsaW5lID0gZm9ybWF0TGluZShsaW5lLnNsaWNlKDEpKVxuICAgICAgaWYgKGlzQ29tcGFjdClcbiAgICAgICAgcmV0dXJuIGMuZ3JlZW4obGluZSlcbiAgICAgIHJldHVybiBjLmdyZWVuKGAtICR7Zm9ybWF0TGluZShsaW5lKX1gKVxuICAgIH1cbiAgICBpZiAobGluZVswXSA9PT0gJysnKSB7XG4gICAgICBsaW5lID0gZm9ybWF0TGluZShsaW5lLnNsaWNlKDEpKVxuICAgICAgaWYgKGlzQ29tcGFjdClcbiAgICAgICAgcmV0dXJuIGMucmVkKGxpbmUpXG4gICAgICByZXR1cm4gYy5yZWQoYCsgJHtmb3JtYXRMaW5lKGxpbmUpfWApXG4gICAgfVxuICAgIGlmIChsaW5lLm1hdGNoKC9AQC8pKVxuICAgICAgcmV0dXJuICctLSdcbiAgICByZXR1cm4gJyAnICsgbGluZVxuICB9KVxuXG4gIC8vIENvbXBhY3QgbW9kZVxuICBpZiAoaXNDb21wYWN0KSB7XG4gICAgZm9ybWF0dGVkID0gW1xuICAgICAgYCR7Yy5ncmVlbignLSBFeHBlY3RlZCcpfSAgICR7Zm9ybWF0dGVkWzBdfWAsXG4gICAgICBgJHtjLnJlZCgnKyBSZWNlaXZlZCcpfSAgICR7Zm9ybWF0dGVkWzFdfWAsXG4gICAgXVxuICB9XG4gIGVsc2Uge1xuICAgIGZvcm1hdHRlZC51bnNoaWZ0KFxuICAgICAgYy5ncmVlbignLSBFeHBlY3RlZCAgLSAnICsgY291bnRzWyctJ10pLFxuICAgICAgYy5yZWQoJysgUmVjZWl2ZWQgICsgJyArIGNvdW50c1snKyddKSxcbiAgICAgICcnLFxuICAgIClcbiAgfVxuXG4gIHJldHVybiBmb3JtYXR0ZWQubWFwKGkgPT4gaW5kZW50ICsgaSkuam9pbignXFxuJylcbn1cblxuZnVuY3Rpb24gZm9ybWF0TGluZShsaW5lOiBzdHJpbmcpIHtcbiAgcmV0dXJuIGNsaVRydW5jYXRlKGxpbmUsIChwcm9jZXNzLnN0ZG91dC5jb2x1bW5zIHx8IDgwKSAtIDQpXG59XG4iXSwibmFtZXMiOlsicmVxdWlyZSQkMCIsInV0aWwiLCJBcnJheVNldCIsIk1hcHBpbmdMaXN0IiwiYmFzZTY0VkxRIiwicmVxdWlyZSQkMSIsInJlcXVpcmUkJDIiLCJyZXF1aXJlJCQzIiwiU291cmNlTWFwR2VuZXJhdG9yIiwicmVxdWlyZSQkNCIsIlNvdXJjZU1hcENvbnN1bWVyIiwiZnMiLCJkaWZmLmNyZWF0ZVBhdGNoIl0sIm1hcHBpbmdzIjoiOzs7O0FBQUEsU0FBUyxJQUFJLEdBQUcsRUFBRTtBQUNsQixJQUFJLENBQUMsU0FBUyxHQUFHO0FBQ2pCLEVBQUUsSUFBSSxFQUFFLFNBQVMsSUFBSSxDQUFDLFNBQVMsRUFBRSxTQUFTLEVBQUU7QUFDNUMsSUFBSSxJQUFJLE9BQU8sR0FBRyxTQUFTLENBQUMsTUFBTSxHQUFHLENBQUMsSUFBSSxTQUFTLENBQUMsQ0FBQyxDQUFDLEtBQUssU0FBUyxHQUFHLFNBQVMsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUM7QUFDekYsSUFBSSxJQUFJLFFBQVEsR0FBRyxPQUFPLENBQUMsUUFBUSxDQUFDO0FBQ3BDO0FBQ0EsSUFBSSxJQUFJLE9BQU8sT0FBTyxLQUFLLFVBQVUsRUFBRTtBQUN2QyxNQUFNLFFBQVEsR0FBRyxPQUFP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
