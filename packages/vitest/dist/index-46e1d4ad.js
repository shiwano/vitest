import { builtinModules } from 'module';
import path from 'path';
import { pathToFileURL, fileURLToPath as fileURLToPath$2, URL as URL$1 } from 'url';
import fs, { promises, realpathSync, statSync, Stats } from 'fs';
import assert from 'assert';
import { format as format$2, inspect } from 'util';
import { d as dirname$2, r as resolve } from './index-1964368a.js';

const BUILTIN_MODULES$1 = new Set(builtinModules);
function normalizeSlash$1(str) {
  return str.replace(/\\/g, "/");
}
function pcall$1(fn, ...args) {
  try {
    return Promise.resolve(fn(...args)).catch((err) => perr$1(err));
  } catch (err) {
    return perr$1(err);
  }
}
function perr$1(_err) {
  const err = new Error(_err);
  err.code = _err.code;
  Error.captureStackTrace(err, pcall$1);
  return Promise.reject(err);
}

function fileURLToPath$1(id) {
  if (typeof id === "string" && !id.startsWith("file://")) {
    return normalizeSlash$1(id);
  }
  return normalizeSlash$1(fileURLToPath$2(id));
}
function normalizeid$1(id) {
  if (typeof id !== "string") {
    id = id.toString();
  }
  if (/(node|data|http|https|file):/.test(id)) {
    return id;
  }
  if (BUILTIN_MODULES$1.has(id)) {
    return "node:" + id;
  }
  return "file://" + normalizeSlash$1(id);
}
function isNodeBuiltin(id = "") {
  id = id.replace(/^node:/, "").split("/")[0];
  return BUILTIN_MODULES$1.has(id);
}
const ProtocolRegex = /^(?<proto>.{2,}?):.+$/;
function getProtocol(id) {
  const proto = id.match(ProtocolRegex);
  return proto ? proto.groups.proto : null;
}

function normalizeWindowsPath$1(input = "") {
  if (!input.includes("\\")) {
    return input;
  }
  return input.replace(/\\/g, "/");
}

const _UNC_REGEX$1 = /^[/][/]/;
const _UNC_DRIVE_REGEX$1 = /^[/][/]([.]{1,2}[/])?([a-zA-Z]):[/]/;
const _IS_ABSOLUTE_RE$1 = /^\/|^\\|^[a-zA-Z]:[/\\]/;
const sep$1 = "/";
const delimiter$1 = ":";
const normalize$1 = function(path2) {
  if (path2.length === 0) {
    return ".";
  }
  path2 = normalizeWindowsPath$1(path2);
  const isUNCPath = path2.match(_UNC_REGEX$1);
  const hasUNCDrive = isUNCPath && path2.match(_UNC_DRIVE_REGEX$1);
  const isPathAbsolute = isAbsolute$1(path2);
  const trailingSeparator = path2[path2.length - 1] === "/";
  path2 = normalizeString$1(path2, !isPathAbsolute);
  if (path2.length === 0) {
    if (isPathAbsolute) {
      return "/";
    }
    return trailingSeparator ? "./" : ".";
  }
  if (trailingSeparator) {
    path2 += "/";
  }
  if (isUNCPath) {
    if (hasUNCDrive) {
      return `//./${path2}`;
    }
    return `//${path2}`;
  }
  return isPathAbsolute && !isAbsolute$1(path2) ? `/${path2}` : path2;
};
const join$1 = function(...args) {
  if (args.length === 0) {
    return ".";
  }
  let joined;
  for (let i = 0; i < args.length; ++i) {
    const arg = args[i];
    if (arg.length > 0) {
      if (joined === void 0) {
        joined = arg;
      } else {
        joined += `/${arg}`;
      }
    }
  }
  if (joined === void 0) {
    return ".";
  }
  return normalize$1(joined);
};
const resolve$2 = function(...args) {
  args = args.map((arg) => normalizeWindowsPath$1(arg));
  let resolvedPath = "";
  let resolvedAbsolute = false;
  for (let i = args.length - 1; i >= -1 && !resolvedAbsolute; i--) {
    const path2 = i >= 0 ? args[i] : process.cwd();
    if (path2.length === 0) {
      continue;
    }
    resolvedPath = `${path2}/${resolvedPath}`;
    resolvedAbsolute = isAbsolute$1(path2);
  }
  resolvedPath = normalizeString$1(resolvedPath, !resolvedAbsolute);
  if (resolvedAbsolute && !isAbsolute$1(resolvedPath)) {
    return `/${resolvedPath}`;
  }
  return resolvedPath.length > 0 ? resolvedPath : ".";
};
function normalizeString$1(path2, allowAboveRoot) {
  let res = "";
  let lastSegmentLength = 0;
  let lastSlash = -1;
  let dots = 0;
  let char = null;
  for (let i = 0; i <= path2.length; ++i) {
    if (i < path2.length) {
      char = path2[i];
    } else if (char === "/") {
      break;
    } else {
      char = "/";
    }
    if (char === "/") {
      if (lastSlash === i - 1 || dots === 1) ; else if (dots === 2) {
        if (res.length < 2 || lastSegmentLength !== 2 || res[res.length - 1] !== "." || res[res.length - 2] !== ".") {
          if (res.length > 2) {
            const lastSlashIndex = res.lastIndexOf("/");
            if (lastSlashIndex === -1) {
              res = "";
              lastSegmentLength = 0;
            } else {
              res = res.slice(0, lastSlashIndex);
              lastSegmentLength = res.length - 1 - res.lastIndexOf("/");
            }
            lastSlash = i;
            dots = 0;
            continue;
          } else if (res.length !== 0) {
            res = "";
            lastSegmentLength = 0;
            lastSlash = i;
            dots = 0;
            continue;
          }
        }
        if (allowAboveRoot) {
          res += res.length > 0 ? "/.." : "..";
          lastSegmentLength = 2;
        }
      } else {
        if (res.length > 0) {
          res += `/${path2.slice(lastSlash + 1, i)}`;
        } else {
          res = path2.slice(lastSlash + 1, i);
        }
        lastSegmentLength = i - lastSlash - 1;
      }
      lastSlash = i;
      dots = 0;
    } else if (char === "." && dots !== -1) {
      ++dots;
    } else {
      dots = -1;
    }
  }
  return res;
}
const isAbsolute$1 = function(p) {
  return _IS_ABSOLUTE_RE$1.test(p);
};
const toNamespacedPath$1 = function(p) {
  return normalizeWindowsPath$1(p);
};
const extname$1 = function(p) {
  return path.posix.extname(normalizeWindowsPath$1(p));
};
const relative$1 = function(from, to) {
  return path.posix.relative(normalizeWindowsPath$1(from), normalizeWindowsPath$1(to));
};
const dirname$1 = function(p) {
  return path.posix.dirname(normalizeWindowsPath$1(p));
};
const format$1 = function(p) {
  return normalizeWindowsPath$1(path.posix.format(p));
};
const basename$1 = function(p, ext) {
  return path.posix.basename(normalizeWindowsPath$1(p), ext);
};
const parse$d = function(p) {
  return path.posix.parse(normalizeWindowsPath$1(p));
};

const _path$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  sep: sep$1,
  delimiter: delimiter$1,
  normalize: normalize$1,
  join: join$1,
  resolve: resolve$2,
  normalizeString: normalizeString$1,
  isAbsolute: isAbsolute$1,
  toNamespacedPath: toNamespacedPath$1,
  extname: extname$1,
  relative: relative$1,
  dirname: dirname$1,
  format: format$1,
  basename: basename$1,
  parse: parse$d
});

({
  ..._path$1
});

var re$b = {exports: {}};

// Note: this is the semver.org version of the spec that it implements
// Not necessarily the package version of this code.
const SEMVER_SPEC_VERSION$1 = '2.0.0';

const MAX_LENGTH$5 = 256;
const MAX_SAFE_INTEGER$3 = Number.MAX_SAFE_INTEGER ||
  /* istanbul ignore next */ 9007199254740991;

// Max safe segment length for coercion.
const MAX_SAFE_COMPONENT_LENGTH$1 = 16;

var constants$1 = {
  SEMVER_SPEC_VERSION: SEMVER_SPEC_VERSION$1,
  MAX_LENGTH: MAX_LENGTH$5,
  MAX_SAFE_INTEGER: MAX_SAFE_INTEGER$3,
  MAX_SAFE_COMPONENT_LENGTH: MAX_SAFE_COMPONENT_LENGTH$1
};

const debug$7 = (
  typeof process === 'object' &&
  process.env &&
  process.env.NODE_DEBUG &&
  /\bsemver\b/i.test(process.env.NODE_DEBUG)
) ? (...args) => console.error('SEMVER', ...args)
  : () => {};

var debug_1$1 = debug$7;

(function (module, exports) {
const { MAX_SAFE_COMPONENT_LENGTH } = constants$1;
const debug = debug_1$1;
exports = module.exports = {};

// The actual regexps go on exports.re
const re = exports.re = [];
const src = exports.src = [];
const t = exports.t = {};
let R = 0;

const createToken = (name, value, isGlobal) => {
  const index = R++;
  debug(index, value);
  t[name] = index;
  src[index] = value;
  re[index] = new RegExp(value, isGlobal ? 'g' : undefined);
};

// The following Regular Expressions can be used for tokenizing,
// validating, and parsing SemVer version strings.

// ## Numeric Identifier
// A single `0`, or a non-zero digit followed by zero or more digits.

createToken('NUMERICIDENTIFIER', '0|[1-9]\\d*');
createToken('NUMERICIDENTIFIERLOOSE', '[0-9]+');

// ## Non-numeric Identifier
// Zero or more digits, followed by a letter or hyphen, and then zero or
// more letters, digits, or hyphens.

createToken('NONNUMERICIDENTIFIER', '\\d*[a-zA-Z-][a-zA-Z0-9-]*');

// ## Main Version
// Three dot-separated numeric identifiers.

createToken('MAINVERSION', `(${src[t.NUMERICIDENTIFIER]})\\.` +
                   `(${src[t.NUMERICIDENTIFIER]})\\.` +
                   `(${src[t.NUMERICIDENTIFIER]})`);

createToken('MAINVERSIONLOOSE', `(${src[t.NUMERICIDENTIFIERLOOSE]})\\.` +
                        `(${src[t.NUMERICIDENTIFIERLOOSE]})\\.` +
                        `(${src[t.NUMERICIDENTIFIERLOOSE]})`);

// ## Pre-release Version Identifier
// A numeric identifier, or a non-numeric identifier.

createToken('PRERELEASEIDENTIFIER', `(?:${src[t.NUMERICIDENTIFIER]
}|${src[t.NONNUMERICIDENTIFIER]})`);

createToken('PRERELEASEIDENTIFIERLOOSE', `(?:${src[t.NUMERICIDENTIFIERLOOSE]
}|${src[t.NONNUMERICIDENTIFIER]})`);

// ## Pre-release Version
// Hyphen, followed by one or more dot-separated pre-release version
// identifiers.

createToken('PRERELEASE', `(?:-(${src[t.PRERELEASEIDENTIFIER]
}(?:\\.${src[t.PRERELEASEIDENTIFIER]})*))`);

createToken('PRERELEASELOOSE', `(?:-?(${src[t.PRERELEASEIDENTIFIERLOOSE]
}(?:\\.${src[t.PRERELEASEIDENTIFIERLOOSE]})*))`);

// ## Build Metadata Identifier
// Any combination of digits, letters, or hyphens.

createToken('BUILDIDENTIFIER', '[0-9A-Za-z-]+');

// ## Build Metadata
// Plus sign, followed by one or more period-separated build metadata
// identifiers.

createToken('BUILD', `(?:\\+(${src[t.BUILDIDENTIFIER]
}(?:\\.${src[t.BUILDIDENTIFIER]})*))`);

// ## Full Version String
// A main version, followed optionally by a pre-release version and
// build metadata.

// Note that the only major, minor, patch, and pre-release sections of
// the version string are capturing groups.  The build metadata is not a
// capturing group, because it should not ever be used in version
// comparison.

createToken('FULLPLAIN', `v?${src[t.MAINVERSION]
}${src[t.PRERELEASE]}?${
  src[t.BUILD]}?`);

createToken('FULL', `^${src[t.FULLPLAIN]}$`);

// like full, but allows v1.2.3 and =1.2.3, which people do sometimes.
// also, 1.0.0alpha1 (prerelease without the hyphen) which is pretty
// common in the npm registry.
createToken('LOOSEPLAIN', `[v=\\s]*${src[t.MAINVERSIONLOOSE]
}${src[t.PRERELEASELOOSE]}?${
  src[t.BUILD]}?`);

createToken('LOOSE', `^${src[t.LOOSEPLAIN]}$`);

createToken('GTLT', '((?:<|>)?=?)');

// Something like "2.*" or "1.2.x".
// Note that "x.x" is a valid xRange identifer, meaning "any version"
// Only the first item is strictly required.
createToken('XRANGEIDENTIFIERLOOSE', `${src[t.NUMERICIDENTIFIERLOOSE]}|x|X|\\*`);
createToken('XRANGEIDENTIFIER', `${src[t.NUMERICIDENTIFIER]}|x|X|\\*`);

createToken('XRANGEPLAIN', `[v=\\s]*(${src[t.XRANGEIDENTIFIER]})` +
                   `(?:\\.(${src[t.XRANGEIDENTIFIER]})` +
                   `(?:\\.(${src[t.XRANGEIDENTIFIER]})` +
                   `(?:${src[t.PRERELEASE]})?${
                     src[t.BUILD]}?` +
                   `)?)?`);

createToken('XRANGEPLAINLOOSE', `[v=\\s]*(${src[t.XRANGEIDENTIFIERLOOSE]})` +
                        `(?:\\.(${src[t.XRANGEIDENTIFIERLOOSE]})` +
                        `(?:\\.(${src[t.XRANGEIDENTIFIERLOOSE]})` +
                        `(?:${src[t.PRERELEASELOOSE]})?${
                          src[t.BUILD]}?` +
                        `)?)?`);

createToken('XRANGE', `^${src[t.GTLT]}\\s*${src[t.XRANGEPLAIN]}$`);
createToken('XRANGELOOSE', `^${src[t.GTLT]}\\s*${src[t.XRANGEPLAINLOOSE]}$`);

// Coercion.
// Extract anything that could conceivably be a part of a valid semver
createToken('COERCE', `${'(^|[^\\d])' +
              '(\\d{1,'}${MAX_SAFE_COMPONENT_LENGTH}})` +
              `(?:\\.(\\d{1,${MAX_SAFE_COMPONENT_LENGTH}}))?` +
              `(?:\\.(\\d{1,${MAX_SAFE_COMPONENT_LENGTH}}))?` +
              `(?:$|[^\\d])`);
createToken('COERCERTL', src[t.COERCE], true);

// Tilde ranges.
// Meaning is "reasonably at or greater than"
createToken('LONETILDE', '(?:~>?)');

createToken('TILDETRIM', `(\\s*)${src[t.LONETILDE]}\\s+`, true);
exports.tildeTrimReplace = '$1~';

createToken('TILDE', `^${src[t.LONETILDE]}${src[t.XRANGEPLAIN]}$`);
createToken('TILDELOOSE', `^${src[t.LONETILDE]}${src[t.XRANGEPLAINLOOSE]}$`);

// Caret ranges.
// Meaning is "at least and backwards compatible with"
createToken('LONECARET', '(?:\\^)');

createToken('CARETTRIM', `(\\s*)${src[t.LONECARET]}\\s+`, true);
exports.caretTrimReplace = '$1^';

createToken('CARET', `^${src[t.LONECARET]}${src[t.XRANGEPLAIN]}$`);
createToken('CARETLOOSE', `^${src[t.LONECARET]}${src[t.XRANGEPLAINLOOSE]}$`);

// A simple gt/lt/eq thing, or just "" to indicate "any version"
createToken('COMPARATORLOOSE', `^${src[t.GTLT]}\\s*(${src[t.LOOSEPLAIN]})$|^$`);
createToken('COMPARATOR', `^${src[t.GTLT]}\\s*(${src[t.FULLPLAIN]})$|^$`);

// An expression to strip any whitespace between the gtlt and the thing
// it modifies, so that `> 1.2.3` ==> `>1.2.3`
createToken('COMPARATORTRIM', `(\\s*)${src[t.GTLT]
}\\s*(${src[t.LOOSEPLAIN]}|${src[t.XRANGEPLAIN]})`, true);
exports.comparatorTrimReplace = '$1$2$3';

// Something like `1.2.3 - 1.2.4`
// Note that these all use the loose form, because they'll be
// checked against either the strict or loose comparator form
// later.
createToken('HYPHENRANGE', `^\\s*(${src[t.XRANGEPLAIN]})` +
                   `\\s+-\\s+` +
                   `(${src[t.XRANGEPLAIN]})` +
                   `\\s*$`);

createToken('HYPHENRANGELOOSE', `^\\s*(${src[t.XRANGEPLAINLOOSE]})` +
                        `\\s+-\\s+` +
                        `(${src[t.XRANGEPLAINLOOSE]})` +
                        `\\s*$`);

// Star ranges basically just allow anything at all.
createToken('STAR', '(<|>)?=?\\s*\\*');
// >=0.0.0 is like a star
createToken('GTE0', '^\\s*>=\\s*0\.0\.0\\s*$');
createToken('GTE0PRE', '^\\s*>=\\s*0\.0\.0-0\\s*$');
}(re$b, re$b.exports));

// parse out just the options we care about so we always get a consistent
// obj with keys in a consistent order.
const opts$1 = ['includePrerelease', 'loose', 'rtl'];
const parseOptions$9 = options =>
  !options ? {}
  : typeof options !== 'object' ? { loose: true }
  : opts$1.filter(k => options[k]).reduce((options, k) => {
    options[k] = true;
    return options
  }, {});
var parseOptions_1$1 = parseOptions$9;

const numeric$1 = /^[0-9]+$/;
const compareIdentifiers$3 = (a, b) => {
  const anum = numeric$1.test(a);
  const bnum = numeric$1.test(b);

  if (anum && bnum) {
    a = +a;
    b = +b;
  }

  return a === b ? 0
    : (anum && !bnum) ? -1
    : (bnum && !anum) ? 1
    : a < b ? -1
    : 1
};

const rcompareIdentifiers$1 = (a, b) => compareIdentifiers$3(b, a);

var identifiers$1 = {
  compareIdentifiers: compareIdentifiers$3,
  rcompareIdentifiers: rcompareIdentifiers$1
};

const debug$6 = debug_1$1;
const { MAX_LENGTH: MAX_LENGTH$4, MAX_SAFE_INTEGER: MAX_SAFE_INTEGER$2 } = constants$1;
const { re: re$a, t: t$9 } = re$b.exports;

const parseOptions$8 = parseOptions_1$1;
const { compareIdentifiers: compareIdentifiers$2 } = identifiers$1;
class SemVer$t {
  constructor (version, options) {
    options = parseOptions$8(options);

    if (version instanceof SemVer$t) {
      if (version.loose === !!options.loose &&
          version.includePrerelease === !!options.includePrerelease) {
        return version
      } else {
        version = version.version;
      }
    } else if (typeof version !== 'string') {
      throw new TypeError(`Invalid Version: ${version}`)
    }

    if (version.length > MAX_LENGTH$4) {
      throw new TypeError(
        `version is longer than ${MAX_LENGTH$4} characters`
      )
    }

    debug$6('SemVer', version, options);
    this.options = options;
    this.loose = !!options.loose;
    // this isn't actually relevant for versions, but keep it so that we
    // don't run into trouble passing this.options around.
    this.includePrerelease = !!options.includePrerelease;

    const m = version.trim().match(options.loose ? re$a[t$9.LOOSE] : re$a[t$9.FULL]);

    if (!m) {
      throw new TypeError(`Invalid Version: ${version}`)
    }

    this.raw = version;

    // these are actually numbers
    this.major = +m[1];
    this.minor = +m[2];
    this.patch = +m[3];

    if (this.major > MAX_SAFE_INTEGER$2 || this.major < 0) {
      throw new TypeError('Invalid major version')
    }

    if (this.minor > MAX_SAFE_INTEGER$2 || this.minor < 0) {
      throw new TypeError('Invalid minor version')
    }

    if (this.patch > MAX_SAFE_INTEGER$2 || this.patch < 0) {
      throw new TypeError('Invalid patch version')
    }

    // numberify any prerelease numeric ids
    if (!m[4]) {
      this.prerelease = [];
    } else {
      this.prerelease = m[4].split('.').map((id) => {
        if (/^[0-9]+$/.test(id)) {
          const num = +id;
          if (num >= 0 && num < MAX_SAFE_INTEGER$2) {
            return num
          }
        }
        return id
      });
    }

    this.build = m[5] ? m[5].split('.') : [];
    this.format();
  }

  format () {
    this.version = `${this.major}.${this.minor}.${this.patch}`;
    if (this.prerelease.length) {
      this.version += `-${this.prerelease.join('.')}`;
    }
    return this.version
  }

  toString () {
    return this.version
  }

  compare (other) {
    debug$6('SemVer.compare', this.version, this.options, other);
    if (!(other instanceof SemVer$t)) {
      if (typeof other === 'string' && other === this.version) {
        return 0
      }
      other = new SemVer$t(other, this.options);
    }

    if (other.version === this.version) {
      return 0
    }

    return this.compareMain(other) || this.comparePre(other)
  }

  compareMain (other) {
    if (!(other instanceof SemVer$t)) {
      other = new SemVer$t(other, this.options);
    }

    return (
      compareIdentifiers$2(this.major, other.major) ||
      compareIdentifiers$2(this.minor, other.minor) ||
      compareIdentifiers$2(this.patch, other.patch)
    )
  }

  comparePre (other) {
    if (!(other instanceof SemVer$t)) {
      other = new SemVer$t(other, this.options);
    }

    // NOT having a prerelease is > having one
    if (this.prerelease.length && !other.prerelease.length) {
      return -1
    } else if (!this.prerelease.length && other.prerelease.length) {
      return 1
    } else if (!this.prerelease.length && !other.prerelease.length) {
      return 0
    }

    let i = 0;
    do {
      const a = this.prerelease[i];
      const b = other.prerelease[i];
      debug$6('prerelease compare', i, a, b);
      if (a === undefined && b === undefined) {
        return 0
      } else if (b === undefined) {
        return 1
      } else if (a === undefined) {
        return -1
      } else if (a === b) {
        continue
      } else {
        return compareIdentifiers$2(a, b)
      }
    } while (++i)
  }

  compareBuild (other) {
    if (!(other instanceof SemVer$t)) {
      other = new SemVer$t(other, this.options);
    }

    let i = 0;
    do {
      const a = this.build[i];
      const b = other.build[i];
      debug$6('prerelease compare', i, a, b);
      if (a === undefined && b === undefined) {
        return 0
      } else if (b === undefined) {
        return 1
      } else if (a === undefined) {
        return -1
      } else if (a === b) {
        continue
      } else {
        return compareIdentifiers$2(a, b)
      }
    } while (++i)
  }

  // preminor will bump the version up to the next minor release, and immediately
  // down to pre-release. premajor and prepatch work the same way.
  inc (release, identifier) {
    switch (release) {
      case 'premajor':
        this.prerelease.length = 0;
        this.patch = 0;
        this.minor = 0;
        this.major++;
        this.inc('pre', identifier);
        break
      case 'preminor':
        this.prerelease.length = 0;
        this.patch = 0;
        this.minor++;
        this.inc('pre', identifier);
        break
      case 'prepatch':
        // If this is already a prerelease, it will bump to the next version
        // drop any prereleases that might already exist, since they are not
        // relevant at this point.
        this.prerelease.length = 0;
        this.inc('patch', identifier);
        this.inc('pre', identifier);
        break
      // If the input is a non-prerelease version, this acts the same as
      // prepatch.
      case 'prerelease':
        if (this.prerelease.length === 0) {
          this.inc('patch', identifier);
        }
        this.inc('pre', identifier);
        break

      case 'major':
        // If this is a pre-major version, bump up to the same major version.
        // Otherwise increment major.
        // 1.0.0-5 bumps to 1.0.0
        // 1.1.0 bumps to 2.0.0
        if (
          this.minor !== 0 ||
          this.patch !== 0 ||
          this.prerelease.length === 0
        ) {
          this.major++;
        }
        this.minor = 0;
        this.patch = 0;
        this.prerelease = [];
        break
      case 'minor':
        // If this is a pre-minor version, bump up to the same minor version.
        // Otherwise increment minor.
        // 1.2.0-5 bumps to 1.2.0
        // 1.2.1 bumps to 1.3.0
        if (this.patch !== 0 || this.prerelease.length === 0) {
          this.minor++;
        }
        this.patch = 0;
        this.prerelease = [];
        break
      case 'patch':
        // If this is not a pre-release version, it will increment the patch.
        // If it is a pre-release it will bump up to the same patch version.
        // 1.2.0-5 patches to 1.2.0
        // 1.2.0 patches to 1.2.1
        if (this.prerelease.length === 0) {
          this.patch++;
        }
        this.prerelease = [];
        break
      // This probably shouldn't be used publicly.
      // 1.0.0 'pre' would become 1.0.0-0 which is the wrong direction.
      case 'pre':
        if (this.prerelease.length === 0) {
          this.prerelease = [0];
        } else {
          let i = this.prerelease.length;
          while (--i >= 0) {
            if (typeof this.prerelease[i] === 'number') {
              this.prerelease[i]++;
              i = -2;
            }
          }
          if (i === -1) {
            // didn't increment anything
            this.prerelease.push(0);
          }
        }
        if (identifier) {
          // 1.2.0-beta.1 bumps to 1.2.0-beta.2,
          // 1.2.0-beta.fooblz or 1.2.0-beta bumps to 1.2.0-beta.0
          if (this.prerelease[0] === identifier) {
            if (isNaN(this.prerelease[1])) {
              this.prerelease = [identifier, 0];
            }
          } else {
            this.prerelease = [identifier, 0];
          }
        }
        break

      default:
        throw new Error(`invalid increment argument: ${release}`)
    }
    this.format();
    this.raw = this.version;
    return this
  }
}

var semver$5 = SemVer$t;

const {MAX_LENGTH: MAX_LENGTH$3} = constants$1;
const { re: re$9, t: t$8 } = re$b.exports;
const SemVer$s = semver$5;

const parseOptions$7 = parseOptions_1$1;
const parse$c = (version, options) => {
  options = parseOptions$7(options);

  if (version instanceof SemVer$s) {
    return version
  }

  if (typeof version !== 'string') {
    return null
  }

  if (version.length > MAX_LENGTH$3) {
    return null
  }

  const r = options.loose ? re$9[t$8.LOOSE] : re$9[t$8.FULL];
  if (!r.test(version)) {
    return null
  }

  try {
    return new SemVer$s(version, options)
  } catch (er) {
    return null
  }
};

var parse_1$1 = parse$c;

const parse$b = parse_1$1;
const valid$3 = (version, options) => {
  const v = parse$b(version, options);
  return v ? v.version : null
};
var valid_1$1 = valid$3;

const parse$a = parse_1$1;
const clean$1 = (version, options) => {
  const s = parse$a(version.trim().replace(/^[=v]+/, ''), options);
  return s ? s.version : null
};
var clean_1$1 = clean$1;

const SemVer$r = semver$5;

const inc$1 = (version, release, options, identifier) => {
  if (typeof (options) === 'string') {
    identifier = options;
    options = undefined;
  }

  try {
    return new SemVer$r(version, options).inc(release, identifier).version
  } catch (er) {
    return null
  }
};
var inc_1$1 = inc$1;

const SemVer$q = semver$5;
const compare$l = (a, b, loose) =>
  new SemVer$q(a, loose).compare(new SemVer$q(b, loose));

var compare_1$1 = compare$l;

const compare$k = compare_1$1;
const eq$5 = (a, b, loose) => compare$k(a, b, loose) === 0;
var eq_1$1 = eq$5;

const parse$9 = parse_1$1;
const eq$4 = eq_1$1;

const diff$1 = (version1, version2) => {
  if (eq$4(version1, version2)) {
    return null
  } else {
    const v1 = parse$9(version1);
    const v2 = parse$9(version2);
    const hasPre = v1.prerelease.length || v2.prerelease.length;
    const prefix = hasPre ? 'pre' : '';
    const defaultResult = hasPre ? 'prerelease' : '';
    for (const key in v1) {
      if (key === 'major' || key === 'minor' || key === 'patch') {
        if (v1[key] !== v2[key]) {
          return prefix + key
        }
      }
    }
    return defaultResult // may be undefined
  }
};
var diff_1$1 = diff$1;

const SemVer$p = semver$5;
const major$1 = (a, loose) => new SemVer$p(a, loose).major;
var major_1$1 = major$1;

const SemVer$o = semver$5;
const minor$1 = (a, loose) => new SemVer$o(a, loose).minor;
var minor_1$1 = minor$1;

const SemVer$n = semver$5;
const patch$1 = (a, loose) => new SemVer$n(a, loose).patch;
var patch_1$1 = patch$1;

const parse$8 = parse_1$1;
const prerelease$1 = (version, options) => {
  const parsed = parse$8(version, options);
  return (parsed && parsed.prerelease.length) ? parsed.prerelease : null
};
var prerelease_1$1 = prerelease$1;

const compare$j = compare_1$1;
const rcompare$1 = (a, b, loose) => compare$j(b, a, loose);
var rcompare_1$1 = rcompare$1;

const compare$i = compare_1$1;
const compareLoose$1 = (a, b) => compare$i(a, b, true);
var compareLoose_1$1 = compareLoose$1;

const SemVer$m = semver$5;
const compareBuild$5 = (a, b, loose) => {
  const versionA = new SemVer$m(a, loose);
  const versionB = new SemVer$m(b, loose);
  return versionA.compare(versionB) || versionA.compareBuild(versionB)
};
var compareBuild_1$1 = compareBuild$5;

const compareBuild$4 = compareBuild_1$1;
const sort$1 = (list, loose) => list.sort((a, b) => compareBuild$4(a, b, loose));
var sort_1$1 = sort$1;

const compareBuild$3 = compareBuild_1$1;
const rsort$1 = (list, loose) => list.sort((a, b) => compareBuild$3(b, a, loose));
var rsort_1$1 = rsort$1;

const compare$h = compare_1$1;
const gt$7 = (a, b, loose) => compare$h(a, b, loose) > 0;
var gt_1$1 = gt$7;

const compare$g = compare_1$1;
const lt$5 = (a, b, loose) => compare$g(a, b, loose) < 0;
var lt_1$1 = lt$5;

const compare$f = compare_1$1;
const neq$3 = (a, b, loose) => compare$f(a, b, loose) !== 0;
var neq_1$1 = neq$3;

const compare$e = compare_1$1;
const gte$5 = (a, b, loose) => compare$e(a, b, loose) >= 0;
var gte_1$1 = gte$5;

const compare$d = compare_1$1;
const lte$5 = (a, b, loose) => compare$d(a, b, loose) <= 0;
var lte_1$1 = lte$5;

const eq$3 = eq_1$1;
const neq$2 = neq_1$1;
const gt$6 = gt_1$1;
const gte$4 = gte_1$1;
const lt$4 = lt_1$1;
const lte$4 = lte_1$1;

const cmp$3 = (a, op, b, loose) => {
  switch (op) {
    case '===':
      if (typeof a === 'object')
        a = a.version;
      if (typeof b === 'object')
        b = b.version;
      return a === b

    case '!==':
      if (typeof a === 'object')
        a = a.version;
      if (typeof b === 'object')
        b = b.version;
      return a !== b

    case '':
    case '=':
    case '==':
      return eq$3(a, b, loose)

    case '!=':
      return neq$2(a, b, loose)

    case '>':
      return gt$6(a, b, loose)

    case '>=':
      return gte$4(a, b, loose)

    case '<':
      return lt$4(a, b, loose)

    case '<=':
      return lte$4(a, b, loose)

    default:
      throw new TypeError(`Invalid operator: ${op}`)
  }
};
var cmp_1$1 = cmp$3;

const SemVer$l = semver$5;
const parse$7 = parse_1$1;
const {re: re$8, t: t$7} = re$b.exports;

const coerce$1 = (version, options) => {
  if (version instanceof SemVer$l) {
    return version
  }

  if (typeof version === 'number') {
    version = String(version);
  }

  if (typeof version !== 'string') {
    return null
  }

  options = options || {};

  let match = null;
  if (!options.rtl) {
    match = version.match(re$8[t$7.COERCE]);
  } else {
    // Find the right-most coercible string that does not share
    // a terminus with a more left-ward coercible string.
    // Eg, '1.2.3.4' wants to coerce '2.3.4', not '3.4' or '4'
    //
    // Walk through the string checking with a /g regexp
    // Manually set the index so as to pick up overlapping matches.
    // Stop when we get a match that ends at the string end, since no
    // coercible string can be more right-ward without the same terminus.
    let next;
    while ((next = re$8[t$7.COERCERTL].exec(version)) &&
        (!match || match.index + match[0].length !== version.length)
    ) {
      if (!match ||
            next.index + next[0].length !== match.index + match[0].length) {
        match = next;
      }
      re$8[t$7.COERCERTL].lastIndex = next.index + next[1].length + next[2].length;
    }
    // leave it in a clean state
    re$8[t$7.COERCERTL].lastIndex = -1;
  }

  if (match === null)
    return null

  return parse$7(`${match[2]}.${match[3] || '0'}.${match[4] || '0'}`, options)
};
var coerce_1$1 = coerce$1;

var yallist$1 = Yallist$3;

Yallist$3.Node = Node$1;
Yallist$3.create = Yallist$3;

function Yallist$3 (list) {
  var self = this;
  if (!(self instanceof Yallist$3)) {
    self = new Yallist$3();
  }

  self.tail = null;
  self.head = null;
  self.length = 0;

  if (list && typeof list.forEach === 'function') {
    list.forEach(function (item) {
      self.push(item);
    });
  } else if (arguments.length > 0) {
    for (var i = 0, l = arguments.length; i < l; i++) {
      self.push(arguments[i]);
    }
  }

  return self
}

Yallist$3.prototype.removeNode = function (node) {
  if (node.list !== this) {
    throw new Error('removing node which does not belong to this list')
  }

  var next = node.next;
  var prev = node.prev;

  if (next) {
    next.prev = prev;
  }

  if (prev) {
    prev.next = next;
  }

  if (node === this.head) {
    this.head = next;
  }
  if (node === this.tail) {
    this.tail = prev;
  }

  node.list.length--;
  node.next = null;
  node.prev = null;
  node.list = null;

  return next
};

Yallist$3.prototype.unshiftNode = function (node) {
  if (node === this.head) {
    return
  }

  if (node.list) {
    node.list.removeNode(node);
  }

  var head = this.head;
  node.list = this;
  node.next = head;
  if (head) {
    head.prev = node;
  }

  this.head = node;
  if (!this.tail) {
    this.tail = node;
  }
  this.length++;
};

Yallist$3.prototype.pushNode = function (node) {
  if (node === this.tail) {
    return
  }

  if (node.list) {
    node.list.removeNode(node);
  }

  var tail = this.tail;
  node.list = this;
  node.prev = tail;
  if (tail) {
    tail.next = node;
  }

  this.tail = node;
  if (!this.head) {
    this.head = node;
  }
  this.length++;
};

Yallist$3.prototype.push = function () {
  for (var i = 0, l = arguments.length; i < l; i++) {
    push$1(this, arguments[i]);
  }
  return this.length
};

Yallist$3.prototype.unshift = function () {
  for (var i = 0, l = arguments.length; i < l; i++) {
    unshift$1(this, arguments[i]);
  }
  return this.length
};

Yallist$3.prototype.pop = function () {
  if (!this.tail) {
    return undefined
  }

  var res = this.tail.value;
  this.tail = this.tail.prev;
  if (this.tail) {
    this.tail.next = null;
  } else {
    this.head = null;
  }
  this.length--;
  return res
};

Yallist$3.prototype.shift = function () {
  if (!this.head) {
    return undefined
  }

  var res = this.head.value;
  this.head = this.head.next;
  if (this.head) {
    this.head.prev = null;
  } else {
    this.tail = null;
  }
  this.length--;
  return res
};

Yallist$3.prototype.forEach = function (fn, thisp) {
  thisp = thisp || this;
  for (var walker = this.head, i = 0; walker !== null; i++) {
    fn.call(thisp, walker.value, i, this);
    walker = walker.next;
  }
};

Yallist$3.prototype.forEachReverse = function (fn, thisp) {
  thisp = thisp || this;
  for (var walker = this.tail, i = this.length - 1; walker !== null; i--) {
    fn.call(thisp, walker.value, i, this);
    walker = walker.prev;
  }
};

Yallist$3.prototype.get = function (n) {
  for (var i = 0, walker = this.head; walker !== null && i < n; i++) {
    // abort out of the list early if we hit a cycle
    walker = walker.next;
  }
  if (i === n && walker !== null) {
    return walker.value
  }
};

Yallist$3.prototype.getReverse = function (n) {
  for (var i = 0, walker = this.tail; walker !== null && i < n; i++) {
    // abort out of the list early if we hit a cycle
    walker = walker.prev;
  }
  if (i === n && walker !== null) {
    return walker.value
  }
};

Yallist$3.prototype.map = function (fn, thisp) {
  thisp = thisp || this;
  var res = new Yallist$3();
  for (var walker = this.head; walker !== null;) {
    res.push(fn.call(thisp, walker.value, this));
    walker = walker.next;
  }
  return res
};

Yallist$3.prototype.mapReverse = function (fn, thisp) {
  thisp = thisp || this;
  var res = new Yallist$3();
  for (var walker = this.tail; walker !== null;) {
    res.push(fn.call(thisp, walker.value, this));
    walker = walker.prev;
  }
  return res
};

Yallist$3.prototype.reduce = function (fn, initial) {
  var acc;
  var walker = this.head;
  if (arguments.length > 1) {
    acc = initial;
  } else if (this.head) {
    walker = this.head.next;
    acc = this.head.value;
  } else {
    throw new TypeError('Reduce of empty list with no initial value')
  }

  for (var i = 0; walker !== null; i++) {
    acc = fn(acc, walker.value, i);
    walker = walker.next;
  }

  return acc
};

Yallist$3.prototype.reduceReverse = function (fn, initial) {
  var acc;
  var walker = this.tail;
  if (arguments.length > 1) {
    acc = initial;
  } else if (this.tail) {
    walker = this.tail.prev;
    acc = this.tail.value;
  } else {
    throw new TypeError('Reduce of empty list with no initial value')
  }

  for (var i = this.length - 1; walker !== null; i--) {
    acc = fn(acc, walker.value, i);
    walker = walker.prev;
  }

  return acc
};

Yallist$3.prototype.toArray = function () {
  var arr = new Array(this.length);
  for (var i = 0, walker = this.head; walker !== null; i++) {
    arr[i] = walker.value;
    walker = walker.next;
  }
  return arr
};

Yallist$3.prototype.toArrayReverse = function () {
  var arr = new Array(this.length);
  for (var i = 0, walker = this.tail; walker !== null; i++) {
    arr[i] = walker.value;
    walker = walker.prev;
  }
  return arr
};

Yallist$3.prototype.slice = function (from, to) {
  to = to || this.length;
  if (to < 0) {
    to += this.length;
  }
  from = from || 0;
  if (from < 0) {
    from += this.length;
  }
  var ret = new Yallist$3();
  if (to < from || to < 0) {
    return ret
  }
  if (from < 0) {
    from = 0;
  }
  if (to > this.length) {
    to = this.length;
  }
  for (var i = 0, walker = this.head; walker !== null && i < from; i++) {
    walker = walker.next;
  }
  for (; walker !== null && i < to; i++, walker = walker.next) {
    ret.push(walker.value);
  }
  return ret
};

Yallist$3.prototype.sliceReverse = function (from, to) {
  to = to || this.length;
  if (to < 0) {
    to += this.length;
  }
  from = from || 0;
  if (from < 0) {
    from += this.length;
  }
  var ret = new Yallist$3();
  if (to < from || to < 0) {
    return ret
  }
  if (from < 0) {
    from = 0;
  }
  if (to > this.length) {
    to = this.length;
  }
  for (var i = this.length, walker = this.tail; walker !== null && i > to; i--) {
    walker = walker.prev;
  }
  for (; walker !== null && i > from; i--, walker = walker.prev) {
    ret.push(walker.value);
  }
  return ret
};

Yallist$3.prototype.splice = function (start, deleteCount, ...nodes) {
  if (start > this.length) {
    start = this.length - 1;
  }
  if (start < 0) {
    start = this.length + start;
  }

  for (var i = 0, walker = this.head; walker !== null && i < start; i++) {
    walker = walker.next;
  }

  var ret = [];
  for (var i = 0; walker && i < deleteCount; i++) {
    ret.push(walker.value);
    walker = this.removeNode(walker);
  }
  if (walker === null) {
    walker = this.tail;
  }

  if (walker !== this.head && walker !== this.tail) {
    walker = walker.prev;
  }

  for (var i = 0; i < nodes.length; i++) {
    walker = insert$1(this, walker, nodes[i]);
  }
  return ret;
};

Yallist$3.prototype.reverse = function () {
  var head = this.head;
  var tail = this.tail;
  for (var walker = head; walker !== null; walker = walker.prev) {
    var p = walker.prev;
    walker.prev = walker.next;
    walker.next = p;
  }
  this.head = tail;
  this.tail = head;
  return this
};

function insert$1 (self, node, value) {
  var inserted = node === self.head ?
    new Node$1(value, null, node, self) :
    new Node$1(value, node, node.next, self);

  if (inserted.next === null) {
    self.tail = inserted;
  }
  if (inserted.prev === null) {
    self.head = inserted;
  }

  self.length++;

  return inserted
}

function push$1 (self, item) {
  self.tail = new Node$1(item, self.tail, null, self);
  if (!self.head) {
    self.head = self.tail;
  }
  self.length++;
}

function unshift$1 (self, item) {
  self.head = new Node$1(item, null, self.head, self);
  if (!self.tail) {
    self.tail = self.head;
  }
  self.length++;
}

function Node$1 (value, prev, next, list) {
  if (!(this instanceof Node$1)) {
    return new Node$1(value, prev, next, list)
  }

  this.list = list;
  this.value = value;

  if (prev) {
    prev.next = this;
    this.prev = prev;
  } else {
    this.prev = null;
  }

  if (next) {
    next.prev = this;
    this.next = next;
  } else {
    this.next = null;
  }
}

try {
  // add if support for Symbol.iterator is present
  require('./iterator.js')(Yallist$3);
} catch (er) {}

// A linked list to keep track of recently-used-ness
const Yallist$2 = yallist$1;

const MAX$1 = Symbol('max');
const LENGTH$1 = Symbol('length');
const LENGTH_CALCULATOR$1 = Symbol('lengthCalculator');
const ALLOW_STALE$1 = Symbol('allowStale');
const MAX_AGE$1 = Symbol('maxAge');
const DISPOSE$1 = Symbol('dispose');
const NO_DISPOSE_ON_SET$1 = Symbol('noDisposeOnSet');
const LRU_LIST$1 = Symbol('lruList');
const CACHE$1 = Symbol('cache');
const UPDATE_AGE_ON_GET$1 = Symbol('updateAgeOnGet');

const naiveLength$1 = () => 1;

// lruList is a yallist where the head is the youngest
// item, and the tail is the oldest.  the list contains the Hit
// objects as the entries.
// Each Hit object has a reference to its Yallist.Node.  This
// never changes.
//
// cache is a Map (or PseudoMap) that matches the keys to
// the Yallist.Node object.
class LRUCache$1 {
  constructor (options) {
    if (typeof options === 'number')
      options = { max: options };

    if (!options)
      options = {};

    if (options.max && (typeof options.max !== 'number' || options.max < 0))
      throw new TypeError('max must be a non-negative number')
    // Kind of weird to have a default max of Infinity, but oh well.
    this[MAX$1] = options.max || Infinity;

    const lc = options.length || naiveLength$1;
    this[LENGTH_CALCULATOR$1] = (typeof lc !== 'function') ? naiveLength$1 : lc;
    this[ALLOW_STALE$1] = options.stale || false;
    if (options.maxAge && typeof options.maxAge !== 'number')
      throw new TypeError('maxAge must be a number')
    this[MAX_AGE$1] = options.maxAge || 0;
    this[DISPOSE$1] = options.dispose;
    this[NO_DISPOSE_ON_SET$1] = options.noDisposeOnSet || false;
    this[UPDATE_AGE_ON_GET$1] = options.updateAgeOnGet || false;
    this.reset();
  }

  // resize the cache when the max changes.
  set max (mL) {
    if (typeof mL !== 'number' || mL < 0)
      throw new TypeError('max must be a non-negative number')

    this[MAX$1] = mL || Infinity;
    trim$1(this);
  }
  get max () {
    return this[MAX$1]
  }

  set allowStale (allowStale) {
    this[ALLOW_STALE$1] = !!allowStale;
  }
  get allowStale () {
    return this[ALLOW_STALE$1]
  }

  set maxAge (mA) {
    if (typeof mA !== 'number')
      throw new TypeError('maxAge must be a non-negative number')

    this[MAX_AGE$1] = mA;
    trim$1(this);
  }
  get maxAge () {
    return this[MAX_AGE$1]
  }

  // resize the cache when the lengthCalculator changes.
  set lengthCalculator (lC) {
    if (typeof lC !== 'function')
      lC = naiveLength$1;

    if (lC !== this[LENGTH_CALCULATOR$1]) {
      this[LENGTH_CALCULATOR$1] = lC;
      this[LENGTH$1] = 0;
      this[LRU_LIST$1].forEach(hit => {
        hit.length = this[LENGTH_CALCULATOR$1](hit.value, hit.key);
        this[LENGTH$1] += hit.length;
      });
    }
    trim$1(this);
  }
  get lengthCalculator () { return this[LENGTH_CALCULATOR$1] }

  get length () { return this[LENGTH$1] }
  get itemCount () { return this[LRU_LIST$1].length }

  rforEach (fn, thisp) {
    thisp = thisp || this;
    for (let walker = this[LRU_LIST$1].tail; walker !== null;) {
      const prev = walker.prev;
      forEachStep$1(this, fn, walker, thisp);
      walker = prev;
    }
  }

  forEach (fn, thisp) {
    thisp = thisp || this;
    for (let walker = this[LRU_LIST$1].head; walker !== null;) {
      const next = walker.next;
      forEachStep$1(this, fn, walker, thisp);
      walker = next;
    }
  }

  keys () {
    return this[LRU_LIST$1].toArray().map(k => k.key)
  }

  values () {
    return this[LRU_LIST$1].toArray().map(k => k.value)
  }

  reset () {
    if (this[DISPOSE$1] &&
        this[LRU_LIST$1] &&
        this[LRU_LIST$1].length) {
      this[LRU_LIST$1].forEach(hit => this[DISPOSE$1](hit.key, hit.value));
    }

    this[CACHE$1] = new Map(); // hash of items by key
    this[LRU_LIST$1] = new Yallist$2(); // list of items in order of use recency
    this[LENGTH$1] = 0; // length of items in the list
  }

  dump () {
    return this[LRU_LIST$1].map(hit =>
      isStale$1(this, hit) ? false : {
        k: hit.key,
        v: hit.value,
        e: hit.now + (hit.maxAge || 0)
      }).toArray().filter(h => h)
  }

  dumpLru () {
    return this[LRU_LIST$1]
  }

  set (key, value, maxAge) {
    maxAge = maxAge || this[MAX_AGE$1];

    if (maxAge && typeof maxAge !== 'number')
      throw new TypeError('maxAge must be a number')

    const now = maxAge ? Date.now() : 0;
    const len = this[LENGTH_CALCULATOR$1](value, key);

    if (this[CACHE$1].has(key)) {
      if (len > this[MAX$1]) {
        del$1(this, this[CACHE$1].get(key));
        return false
      }

      const node = this[CACHE$1].get(key);
      const item = node.value;

      // dispose of the old one before overwriting
      // split out into 2 ifs for better coverage tracking
      if (this[DISPOSE$1]) {
        if (!this[NO_DISPOSE_ON_SET$1])
          this[DISPOSE$1](key, item.value);
      }

      item.now = now;
      item.maxAge = maxAge;
      item.value = value;
      this[LENGTH$1] += len - item.length;
      item.length = len;
      this.get(key);
      trim$1(this);
      return true
    }

    const hit = new Entry$1(key, value, len, now, maxAge);

    // oversized objects fall out of cache automatically.
    if (hit.length > this[MAX$1]) {
      if (this[DISPOSE$1])
        this[DISPOSE$1](key, value);

      return false
    }

    this[LENGTH$1] += hit.length;
    this[LRU_LIST$1].unshift(hit);
    this[CACHE$1].set(key, this[LRU_LIST$1].head);
    trim$1(this);
    return true
  }

  has (key) {
    if (!this[CACHE$1].has(key)) return false
    const hit = this[CACHE$1].get(key).value;
    return !isStale$1(this, hit)
  }

  get (key) {
    return get$1(this, key, true)
  }

  peek (key) {
    return get$1(this, key, false)
  }

  pop () {
    const node = this[LRU_LIST$1].tail;
    if (!node)
      return null

    del$1(this, node);
    return node.value
  }

  del (key) {
    del$1(this, this[CACHE$1].get(key));
  }

  load (arr) {
    // reset the cache
    this.reset();

    const now = Date.now();
    // A previous serialized cache has the most recent items first
    for (let l = arr.length - 1; l >= 0; l--) {
      const hit = arr[l];
      const expiresAt = hit.e || 0;
      if (expiresAt === 0)
        // the item was created without expiration in a non aged cache
        this.set(hit.k, hit.v);
      else {
        const maxAge = expiresAt - now;
        // dont add already expired items
        if (maxAge > 0) {
          this.set(hit.k, hit.v, maxAge);
        }
      }
    }
  }

  prune () {
    this[CACHE$1].forEach((value, key) => get$1(this, key, false));
  }
}

const get$1 = (self, key, doUse) => {
  const node = self[CACHE$1].get(key);
  if (node) {
    const hit = node.value;
    if (isStale$1(self, hit)) {
      del$1(self, node);
      if (!self[ALLOW_STALE$1])
        return undefined
    } else {
      if (doUse) {
        if (self[UPDATE_AGE_ON_GET$1])
          node.value.now = Date.now();
        self[LRU_LIST$1].unshiftNode(node);
      }
    }
    return hit.value
  }
};

const isStale$1 = (self, hit) => {
  if (!hit || (!hit.maxAge && !self[MAX_AGE$1]))
    return false

  const diff = Date.now() - hit.now;
  return hit.maxAge ? diff > hit.maxAge
    : self[MAX_AGE$1] && (diff > self[MAX_AGE$1])
};

const trim$1 = self => {
  if (self[LENGTH$1] > self[MAX$1]) {
    for (let walker = self[LRU_LIST$1].tail;
      self[LENGTH$1] > self[MAX$1] && walker !== null;) {
      // We know that we're about to delete this one, and also
      // what the next least recently used key will be, so just
      // go ahead and set it now.
      const prev = walker.prev;
      del$1(self, walker);
      walker = prev;
    }
  }
};

const del$1 = (self, node) => {
  if (node) {
    const hit = node.value;
    if (self[DISPOSE$1])
      self[DISPOSE$1](hit.key, hit.value);

    self[LENGTH$1] -= hit.length;
    self[CACHE$1].delete(hit.key);
    self[LRU_LIST$1].removeNode(node);
  }
};

class Entry$1 {
  constructor (key, value, length, now, maxAge) {
    this.key = key;
    this.value = value;
    this.length = length;
    this.now = now;
    this.maxAge = maxAge || 0;
  }
}

const forEachStep$1 = (self, fn, node, thisp) => {
  let hit = node.value;
  if (isStale$1(self, hit)) {
    del$1(self, node);
    if (!self[ALLOW_STALE$1])
      hit = undefined;
  }
  if (hit)
    fn.call(thisp, hit.value, hit.key, self);
};

var lruCache$1 = LRUCache$1;

// hoisted class for cyclic dependency
class Range$l {
  constructor (range, options) {
    options = parseOptions$6(options);

    if (range instanceof Range$l) {
      if (
        range.loose === !!options.loose &&
        range.includePrerelease === !!options.includePrerelease
      ) {
        return range
      } else {
        return new Range$l(range.raw, options)
      }
    }

    if (range instanceof Comparator$7) {
      // just put it in the set and return
      this.raw = range.value;
      this.set = [[range]];
      this.format();
      return this
    }

    this.options = options;
    this.loose = !!options.loose;
    this.includePrerelease = !!options.includePrerelease;

    // First, split based on boolean or ||
    this.raw = range;
    this.set = range
      .split(/\s*\|\|\s*/)
      // map the range to a 2d array of comparators
      .map(range => this.parseRange(range.trim()))
      // throw out any comparator lists that are empty
      // this generally means that it was not a valid range, which is allowed
      // in loose mode, but will still throw if the WHOLE range is invalid.
      .filter(c => c.length);

    if (!this.set.length) {
      throw new TypeError(`Invalid SemVer Range: ${range}`)
    }

    // if we have any that are not the null set, throw out null sets.
    if (this.set.length > 1) {
      // keep the first one, in case they're all null sets
      const first = this.set[0];
      this.set = this.set.filter(c => !isNullSet$1(c[0]));
      if (this.set.length === 0)
        this.set = [first];
      else if (this.set.length > 1) {
        // if we have any that are *, then the range is just *
        for (const c of this.set) {
          if (c.length === 1 && isAny$1(c[0])) {
            this.set = [c];
            break
          }
        }
      }
    }

    this.format();
  }

  format () {
    this.range = this.set
      .map((comps) => {
        return comps.join(' ').trim()
      })
      .join('||')
      .trim();
    return this.range
  }

  toString () {
    return this.range
  }

  parseRange (range) {
    range = range.trim();

    // memoize range parsing for performance.
    // this is a very hot path, and fully deterministic.
    const memoOpts = Object.keys(this.options).join(',');
    const memoKey = `parseRange:${memoOpts}:${range}`;
    const cached = cache$1.get(memoKey);
    if (cached)
      return cached

    const loose = this.options.loose;
    // `1.2.3 - 1.2.4` => `>=1.2.3 <=1.2.4`
    const hr = loose ? re$7[t$6.HYPHENRANGELOOSE] : re$7[t$6.HYPHENRANGE];
    range = range.replace(hr, hyphenReplace$1(this.options.includePrerelease));
    debug$5('hyphen replace', range);
    // `> 1.2.3 < 1.2.5` => `>1.2.3 <1.2.5`
    range = range.replace(re$7[t$6.COMPARATORTRIM], comparatorTrimReplace$1);
    debug$5('comparator trim', range, re$7[t$6.COMPARATORTRIM]);

    // `~ 1.2.3` => `~1.2.3`
    range = range.replace(re$7[t$6.TILDETRIM], tildeTrimReplace$1);

    // `^ 1.2.3` => `^1.2.3`
    range = range.replace(re$7[t$6.CARETTRIM], caretTrimReplace$1);

    // normalize spaces
    range = range.split(/\s+/).join(' ');

    // At this point, the range is completely trimmed and
    // ready to be split into comparators.

    const compRe = loose ? re$7[t$6.COMPARATORLOOSE] : re$7[t$6.COMPARATOR];
    const rangeList = range
      .split(' ')
      .map(comp => parseComparator$1(comp, this.options))
      .join(' ')
      .split(/\s+/)
      // >=0.0.0 is equivalent to *
      .map(comp => replaceGTE0$1(comp, this.options))
      // in loose mode, throw out any that are not valid comparators
      .filter(this.options.loose ? comp => !!comp.match(compRe) : () => true)
      .map(comp => new Comparator$7(comp, this.options));

    // if any comparators are the null set, then replace with JUST null set
    // if more than one comparator, remove any * comparators
    // also, don't include the same comparator more than once
    rangeList.length;
    const rangeMap = new Map();
    for (const comp of rangeList) {
      if (isNullSet$1(comp))
        return [comp]
      rangeMap.set(comp.value, comp);
    }
    if (rangeMap.size > 1 && rangeMap.has(''))
      rangeMap.delete('');

    const result = [...rangeMap.values()];
    cache$1.set(memoKey, result);
    return result
  }

  intersects (range, options) {
    if (!(range instanceof Range$l)) {
      throw new TypeError('a Range is required')
    }

    return this.set.some((thisComparators) => {
      return (
        isSatisfiable$1(thisComparators, options) &&
        range.set.some((rangeComparators) => {
          return (
            isSatisfiable$1(rangeComparators, options) &&
            thisComparators.every((thisComparator) => {
              return rangeComparators.every((rangeComparator) => {
                return thisComparator.intersects(rangeComparator, options)
              })
            })
          )
        })
      )
    })
  }

  // if ANY of the sets match ALL of its comparators, then pass
  test (version) {
    if (!version) {
      return false
    }

    if (typeof version === 'string') {
      try {
        version = new SemVer$k(version, this.options);
      } catch (er) {
        return false
      }
    }

    for (let i = 0; i < this.set.length; i++) {
      if (testSet$1(this.set[i], version, this.options)) {
        return true
      }
    }
    return false
  }
}
var range$1 = Range$l;

const LRU$1 = lruCache$1;
const cache$1 = new LRU$1({ max: 1000 });

const parseOptions$6 = parseOptions_1$1;
const Comparator$7 = comparator$1;
const debug$5 = debug_1$1;
const SemVer$k = semver$5;
const {
  re: re$7,
  t: t$6,
  comparatorTrimReplace: comparatorTrimReplace$1,
  tildeTrimReplace: tildeTrimReplace$1,
  caretTrimReplace: caretTrimReplace$1
} = re$b.exports;

const isNullSet$1 = c => c.value === '<0.0.0-0';
const isAny$1 = c => c.value === '';

// take a set of comparators and determine whether there
// exists a version which can satisfy it
const isSatisfiable$1 = (comparators, options) => {
  let result = true;
  const remainingComparators = comparators.slice();
  let testComparator = remainingComparators.pop();

  while (result && remainingComparators.length) {
    result = remainingComparators.every((otherComparator) => {
      return testComparator.intersects(otherComparator, options)
    });

    testComparator = remainingComparators.pop();
  }

  return result
};

// comprised of xranges, tildes, stars, and gtlt's at this point.
// already replaced the hyphen ranges
// turn into a set of JUST comparators.
const parseComparator$1 = (comp, options) => {
  debug$5('comp', comp, options);
  comp = replaceCarets$1(comp, options);
  debug$5('caret', comp);
  comp = replaceTildes$1(comp, options);
  debug$5('tildes', comp);
  comp = replaceXRanges$1(comp, options);
  debug$5('xrange', comp);
  comp = replaceStars$1(comp, options);
  debug$5('stars', comp);
  return comp
};

const isX$1 = id => !id || id.toLowerCase() === 'x' || id === '*';

// ~, ~> --> * (any, kinda silly)
// ~2, ~2.x, ~2.x.x, ~>2, ~>2.x ~>2.x.x --> >=2.0.0 <3.0.0-0
// ~2.0, ~2.0.x, ~>2.0, ~>2.0.x --> >=2.0.0 <2.1.0-0
// ~1.2, ~1.2.x, ~>1.2, ~>1.2.x --> >=1.2.0 <1.3.0-0
// ~1.2.3, ~>1.2.3 --> >=1.2.3 <1.3.0-0
// ~1.2.0, ~>1.2.0 --> >=1.2.0 <1.3.0-0
const replaceTildes$1 = (comp, options) =>
  comp.trim().split(/\s+/).map((comp) => {
    return replaceTilde$1(comp, options)
  }).join(' ');

const replaceTilde$1 = (comp, options) => {
  const r = options.loose ? re$7[t$6.TILDELOOSE] : re$7[t$6.TILDE];
  return comp.replace(r, (_, M, m, p, pr) => {
    debug$5('tilde', comp, _, M, m, p, pr);
    let ret;

    if (isX$1(M)) {
      ret = '';
    } else if (isX$1(m)) {
      ret = `>=${M}.0.0 <${+M + 1}.0.0-0`;
    } else if (isX$1(p)) {
      // ~1.2 == >=1.2.0 <1.3.0-0
      ret = `>=${M}.${m}.0 <${M}.${+m + 1}.0-0`;
    } else if (pr) {
      debug$5('replaceTilde pr', pr);
      ret = `>=${M}.${m}.${p}-${pr
      } <${M}.${+m + 1}.0-0`;
    } else {
      // ~1.2.3 == >=1.2.3 <1.3.0-0
      ret = `>=${M}.${m}.${p
      } <${M}.${+m + 1}.0-0`;
    }

    debug$5('tilde return', ret);
    return ret
  })
};

// ^ --> * (any, kinda silly)
// ^2, ^2.x, ^2.x.x --> >=2.0.0 <3.0.0-0
// ^2.0, ^2.0.x --> >=2.0.0 <3.0.0-0
// ^1.2, ^1.2.x --> >=1.2.0 <2.0.0-0
// ^1.2.3 --> >=1.2.3 <2.0.0-0
// ^1.2.0 --> >=1.2.0 <2.0.0-0
const replaceCarets$1 = (comp, options) =>
  comp.trim().split(/\s+/).map((comp) => {
    return replaceCaret$1(comp, options)
  }).join(' ');

const replaceCaret$1 = (comp, options) => {
  debug$5('caret', comp, options);
  const r = options.loose ? re$7[t$6.CARETLOOSE] : re$7[t$6.CARET];
  const z = options.includePrerelease ? '-0' : '';
  return comp.replace(r, (_, M, m, p, pr) => {
    debug$5('caret', comp, _, M, m, p, pr);
    let ret;

    if (isX$1(M)) {
      ret = '';
    } else if (isX$1(m)) {
      ret = `>=${M}.0.0${z} <${+M + 1}.0.0-0`;
    } else if (isX$1(p)) {
      if (M === '0') {
        ret = `>=${M}.${m}.0${z} <${M}.${+m + 1}.0-0`;
      } else {
        ret = `>=${M}.${m}.0${z} <${+M + 1}.0.0-0`;
      }
    } else if (pr) {
      debug$5('replaceCaret pr', pr);
      if (M === '0') {
        if (m === '0') {
          ret = `>=${M}.${m}.${p}-${pr
          } <${M}.${m}.${+p + 1}-0`;
        } else {
          ret = `>=${M}.${m}.${p}-${pr
          } <${M}.${+m + 1}.0-0`;
        }
      } else {
        ret = `>=${M}.${m}.${p}-${pr
        } <${+M + 1}.0.0-0`;
      }
    } else {
      debug$5('no pr');
      if (M === '0') {
        if (m === '0') {
          ret = `>=${M}.${m}.${p
          }${z} <${M}.${m}.${+p + 1}-0`;
        } else {
          ret = `>=${M}.${m}.${p
          }${z} <${M}.${+m + 1}.0-0`;
        }
      } else {
        ret = `>=${M}.${m}.${p
        } <${+M + 1}.0.0-0`;
      }
    }

    debug$5('caret return', ret);
    return ret
  })
};

const replaceXRanges$1 = (comp, options) => {
  debug$5('replaceXRanges', comp, options);
  return comp.split(/\s+/).map((comp) => {
    return replaceXRange$1(comp, options)
  }).join(' ')
};

const replaceXRange$1 = (comp, options) => {
  comp = comp.trim();
  const r = options.loose ? re$7[t$6.XRANGELOOSE] : re$7[t$6.XRANGE];
  return comp.replace(r, (ret, gtlt, M, m, p, pr) => {
    debug$5('xRange', comp, ret, gtlt, M, m, p, pr);
    const xM = isX$1(M);
    const xm = xM || isX$1(m);
    const xp = xm || isX$1(p);
    const anyX = xp;

    if (gtlt === '=' && anyX) {
      gtlt = '';
    }

    // if we're including prereleases in the match, then we need
    // to fix this to -0, the lowest possible prerelease value
    pr = options.includePrerelease ? '-0' : '';

    if (xM) {
      if (gtlt === '>' || gtlt === '<') {
        // nothing is allowed
        ret = '<0.0.0-0';
      } else {
        // nothing is forbidden
        ret = '*';
      }
    } else if (gtlt && anyX) {
      // we know patch is an x, because we have any x at all.
      // replace X with 0
      if (xm) {
        m = 0;
      }
      p = 0;

      if (gtlt === '>') {
        // >1 => >=2.0.0
        // >1.2 => >=1.3.0
        gtlt = '>=';
        if (xm) {
          M = +M + 1;
          m = 0;
          p = 0;
        } else {
          m = +m + 1;
          p = 0;
        }
      } else if (gtlt === '<=') {
        // <=0.7.x is actually <0.8.0, since any 0.7.x should
        // pass.  Similarly, <=7.x is actually <8.0.0, etc.
        gtlt = '<';
        if (xm) {
          M = +M + 1;
        } else {
          m = +m + 1;
        }
      }

      if (gtlt === '<')
        pr = '-0';

      ret = `${gtlt + M}.${m}.${p}${pr}`;
    } else if (xm) {
      ret = `>=${M}.0.0${pr} <${+M + 1}.0.0-0`;
    } else if (xp) {
      ret = `>=${M}.${m}.0${pr
      } <${M}.${+m + 1}.0-0`;
    }

    debug$5('xRange return', ret);

    return ret
  })
};

// Because * is AND-ed with everything else in the comparator,
// and '' means "any version", just remove the *s entirely.
const replaceStars$1 = (comp, options) => {
  debug$5('replaceStars', comp, options);
  // Looseness is ignored here.  star is always as loose as it gets!
  return comp.trim().replace(re$7[t$6.STAR], '')
};

const replaceGTE0$1 = (comp, options) => {
  debug$5('replaceGTE0', comp, options);
  return comp.trim()
    .replace(re$7[options.includePrerelease ? t$6.GTE0PRE : t$6.GTE0], '')
};

// This function is passed to string.replace(re[t.HYPHENRANGE])
// M, m, patch, prerelease, build
// 1.2 - 3.4.5 => >=1.2.0 <=3.4.5
// 1.2.3 - 3.4 => >=1.2.0 <3.5.0-0 Any 3.4.x will do
// 1.2 - 3.4 => >=1.2.0 <3.5.0-0
const hyphenReplace$1 = incPr => ($0,
  from, fM, fm, fp, fpr, fb,
  to, tM, tm, tp, tpr, tb) => {
  if (isX$1(fM)) {
    from = '';
  } else if (isX$1(fm)) {
    from = `>=${fM}.0.0${incPr ? '-0' : ''}`;
  } else if (isX$1(fp)) {
    from = `>=${fM}.${fm}.0${incPr ? '-0' : ''}`;
  } else if (fpr) {
    from = `>=${from}`;
  } else {
    from = `>=${from}${incPr ? '-0' : ''}`;
  }

  if (isX$1(tM)) {
    to = '';
  } else if (isX$1(tm)) {
    to = `<${+tM + 1}.0.0-0`;
  } else if (isX$1(tp)) {
    to = `<${tM}.${+tm + 1}.0-0`;
  } else if (tpr) {
    to = `<=${tM}.${tm}.${tp}-${tpr}`;
  } else if (incPr) {
    to = `<${tM}.${tm}.${+tp + 1}-0`;
  } else {
    to = `<=${to}`;
  }

  return (`${from} ${to}`).trim()
};

const testSet$1 = (set, version, options) => {
  for (let i = 0; i < set.length; i++) {
    if (!set[i].test(version)) {
      return false
    }
  }

  if (version.prerelease.length && !options.includePrerelease) {
    // Find the set of versions that are allowed to have prereleases
    // For example, ^1.2.3-pr.1 desugars to >=1.2.3-pr.1 <2.0.0
    // That should allow `1.2.3-pr.2` to pass.
    // However, `1.2.4-alpha.notready` should NOT be allowed,
    // even though it's within the range set by the comparators.
    for (let i = 0; i < set.length; i++) {
      debug$5(set[i].semver);
      if (set[i].semver === Comparator$7.ANY) {
        continue
      }

      if (set[i].semver.prerelease.length > 0) {
        const allowed = set[i].semver;
        if (allowed.major === version.major &&
            allowed.minor === version.minor &&
            allowed.patch === version.patch) {
          return true
        }
      }
    }

    // Version has a -pre, but it's not one of the ones we like.
    return false
  }

  return true
};

const ANY$5 = Symbol('SemVer ANY');
// hoisted class for cyclic dependency
class Comparator$6 {
  static get ANY () {
    return ANY$5
  }
  constructor (comp, options) {
    options = parseOptions$5(options);

    if (comp instanceof Comparator$6) {
      if (comp.loose === !!options.loose) {
        return comp
      } else {
        comp = comp.value;
      }
    }

    debug$4('comparator', comp, options);
    this.options = options;
    this.loose = !!options.loose;
    this.parse(comp);

    if (this.semver === ANY$5) {
      this.value = '';
    } else {
      this.value = this.operator + this.semver.version;
    }

    debug$4('comp', this);
  }

  parse (comp) {
    const r = this.options.loose ? re$6[t$5.COMPARATORLOOSE] : re$6[t$5.COMPARATOR];
    const m = comp.match(r);

    if (!m) {
      throw new TypeError(`Invalid comparator: ${comp}`)
    }

    this.operator = m[1] !== undefined ? m[1] : '';
    if (this.operator === '=') {
      this.operator = '';
    }

    // if it literally is just '>' or '' then allow anything.
    if (!m[2]) {
      this.semver = ANY$5;
    } else {
      this.semver = new SemVer$j(m[2], this.options.loose);
    }
  }

  toString () {
    return this.value
  }

  test (version) {
    debug$4('Comparator.test', version, this.options.loose);

    if (this.semver === ANY$5 || version === ANY$5) {
      return true
    }

    if (typeof version === 'string') {
      try {
        version = new SemVer$j(version, this.options);
      } catch (er) {
        return false
      }
    }

    return cmp$2(version, this.operator, this.semver, this.options)
  }

  intersects (comp, options) {
    if (!(comp instanceof Comparator$6)) {
      throw new TypeError('a Comparator is required')
    }

    if (!options || typeof options !== 'object') {
      options = {
        loose: !!options,
        includePrerelease: false
      };
    }

    if (this.operator === '') {
      if (this.value === '') {
        return true
      }
      return new Range$k(comp.value, options).test(this.value)
    } else if (comp.operator === '') {
      if (comp.value === '') {
        return true
      }
      return new Range$k(this.value, options).test(comp.semver)
    }

    const sameDirectionIncreasing =
      (this.operator === '>=' || this.operator === '>') &&
      (comp.operator === '>=' || comp.operator === '>');
    const sameDirectionDecreasing =
      (this.operator === '<=' || this.operator === '<') &&
      (comp.operator === '<=' || comp.operator === '<');
    const sameSemVer = this.semver.version === comp.semver.version;
    const differentDirectionsInclusive =
      (this.operator === '>=' || this.operator === '<=') &&
      (comp.operator === '>=' || comp.operator === '<=');
    const oppositeDirectionsLessThan =
      cmp$2(this.semver, '<', comp.semver, options) &&
      (this.operator === '>=' || this.operator === '>') &&
        (comp.operator === '<=' || comp.operator === '<');
    const oppositeDirectionsGreaterThan =
      cmp$2(this.semver, '>', comp.semver, options) &&
      (this.operator === '<=' || this.operator === '<') &&
        (comp.operator === '>=' || comp.operator === '>');

    return (
      sameDirectionIncreasing ||
      sameDirectionDecreasing ||
      (sameSemVer && differentDirectionsInclusive) ||
      oppositeDirectionsLessThan ||
      oppositeDirectionsGreaterThan
    )
  }
}

var comparator$1 = Comparator$6;

const parseOptions$5 = parseOptions_1$1;
const {re: re$6, t: t$5} = re$b.exports;
const cmp$2 = cmp_1$1;
const debug$4 = debug_1$1;
const SemVer$j = semver$5;
const Range$k = range$1;

const Range$j = range$1;
const satisfies$7 = (version, range, options) => {
  try {
    range = new Range$j(range, options);
  } catch (er) {
    return false
  }
  return range.test(version)
};
var satisfies_1$1 = satisfies$7;

const Range$i = range$1;

// Mostly just for testing and legacy API reasons
const toComparators$1 = (range, options) =>
  new Range$i(range, options).set
    .map(comp => comp.map(c => c.value).join(' ').trim().split(' '));

var toComparators_1$1 = toComparators$1;

const SemVer$i = semver$5;
const Range$h = range$1;

const maxSatisfying$1 = (versions, range, options) => {
  let max = null;
  let maxSV = null;
  let rangeObj = null;
  try {
    rangeObj = new Range$h(range, options);
  } catch (er) {
    return null
  }
  versions.forEach((v) => {
    if (rangeObj.test(v)) {
      // satisfies(v, range, options)
      if (!max || maxSV.compare(v) === -1) {
        // compare(max, v, true)
        max = v;
        maxSV = new SemVer$i(max, options);
      }
    }
  });
  return max
};
var maxSatisfying_1$1 = maxSatisfying$1;

const SemVer$h = semver$5;
const Range$g = range$1;
const minSatisfying$1 = (versions, range, options) => {
  let min = null;
  let minSV = null;
  let rangeObj = null;
  try {
    rangeObj = new Range$g(range, options);
  } catch (er) {
    return null
  }
  versions.forEach((v) => {
    if (rangeObj.test(v)) {
      // satisfies(v, range, options)
      if (!min || minSV.compare(v) === 1) {
        // compare(min, v, true)
        min = v;
        minSV = new SemVer$h(min, options);
      }
    }
  });
  return min
};
var minSatisfying_1$1 = minSatisfying$1;

const SemVer$g = semver$5;
const Range$f = range$1;
const gt$5 = gt_1$1;

const minVersion$1 = (range, loose) => {
  range = new Range$f(range, loose);

  let minver = new SemVer$g('0.0.0');
  if (range.test(minver)) {
    return minver
  }

  minver = new SemVer$g('0.0.0-0');
  if (range.test(minver)) {
    return minver
  }

  minver = null;
  for (let i = 0; i < range.set.length; ++i) {
    const comparators = range.set[i];

    let setMin = null;
    comparators.forEach((comparator) => {
      // Clone to avoid manipulating the comparator's semver object.
      const compver = new SemVer$g(comparator.semver.version);
      switch (comparator.operator) {
        case '>':
          if (compver.prerelease.length === 0) {
            compver.patch++;
          } else {
            compver.prerelease.push(0);
          }
          compver.raw = compver.format();
          /* fallthrough */
        case '':
        case '>=':
          if (!setMin || gt$5(compver, setMin)) {
            setMin = compver;
          }
          break
        case '<':
        case '<=':
          /* Ignore maximum versions */
          break
        /* istanbul ignore next */
        default:
          throw new Error(`Unexpected operation: ${comparator.operator}`)
      }
    });
    if (setMin && (!minver || gt$5(minver, setMin)))
      minver = setMin;
  }

  if (minver && range.test(minver)) {
    return minver
  }

  return null
};
var minVersion_1$1 = minVersion$1;

const Range$e = range$1;
const validRange$1 = (range, options) => {
  try {
    // Return '*' instead of '' so that truthiness works.
    // This will throw if it's invalid anyway
    return new Range$e(range, options).range || '*'
  } catch (er) {
    return null
  }
};
var valid$2 = validRange$1;

const SemVer$f = semver$5;
const Comparator$5 = comparator$1;
const {ANY: ANY$4} = Comparator$5;
const Range$d = range$1;
const satisfies$6 = satisfies_1$1;
const gt$4 = gt_1$1;
const lt$3 = lt_1$1;
const lte$3 = lte_1$1;
const gte$3 = gte_1$1;

const outside$5 = (version, range, hilo, options) => {
  version = new SemVer$f(version, options);
  range = new Range$d(range, options);

  let gtfn, ltefn, ltfn, comp, ecomp;
  switch (hilo) {
    case '>':
      gtfn = gt$4;
      ltefn = lte$3;
      ltfn = lt$3;
      comp = '>';
      ecomp = '>=';
      break
    case '<':
      gtfn = lt$3;
      ltefn = gte$3;
      ltfn = gt$4;
      comp = '<';
      ecomp = '<=';
      break
    default:
      throw new TypeError('Must provide a hilo val of "<" or ">"')
  }

  // If it satisfies the range it is not outside
  if (satisfies$6(version, range, options)) {
    return false
  }

  // From now on, variable terms are as if we're in "gtr" mode.
  // but note that everything is flipped for the "ltr" function.

  for (let i = 0; i < range.set.length; ++i) {
    const comparators = range.set[i];

    let high = null;
    let low = null;

    comparators.forEach((comparator) => {
      if (comparator.semver === ANY$4) {
        comparator = new Comparator$5('>=0.0.0');
      }
      high = high || comparator;
      low = low || comparator;
      if (gtfn(comparator.semver, high.semver, options)) {
        high = comparator;
      } else if (ltfn(comparator.semver, low.semver, options)) {
        low = comparator;
      }
    });

    // If the edge version comparator has a operator then our version
    // isn't outside it
    if (high.operator === comp || high.operator === ecomp) {
      return false
    }

    // If the lowest version comparator has an operator and our version
    // is less than it then it isn't higher than the range
    if ((!low.operator || low.operator === comp) &&
        ltefn(version, low.semver)) {
      return false
    } else if (low.operator === ecomp && ltfn(version, low.semver)) {
      return false
    }
  }
  return true
};

var outside_1$1 = outside$5;

// Determine if version is greater than all the versions possible in the range.
const outside$4 = outside_1$1;
const gtr$1 = (version, range, options) => outside$4(version, range, '>', options);
var gtr_1$1 = gtr$1;

const outside$3 = outside_1$1;
// Determine if version is less than all the versions possible in the range
const ltr$1 = (version, range, options) => outside$3(version, range, '<', options);
var ltr_1$1 = ltr$1;

const Range$c = range$1;
const intersects$1 = (r1, r2, options) => {
  r1 = new Range$c(r1, options);
  r2 = new Range$c(r2, options);
  return r1.intersects(r2)
};
var intersects_1$1 = intersects$1;

// given a set of versions and a range, create a "simplified" range
// that includes the same versions that the original range does
// If the original range is shorter than the simplified one, return that.
const satisfies$5 = satisfies_1$1;
const compare$c = compare_1$1;
var simplify$1 = (versions, range, options) => {
  const set = [];
  let min = null;
  let prev = null;
  const v = versions.sort((a, b) => compare$c(a, b, options));
  for (const version of v) {
    const included = satisfies$5(version, range, options);
    if (included) {
      prev = version;
      if (!min)
        min = version;
    } else {
      if (prev) {
        set.push([min, prev]);
      }
      prev = null;
      min = null;
    }
  }
  if (min)
    set.push([min, null]);

  const ranges = [];
  for (const [min, max] of set) {
    if (min === max)
      ranges.push(min);
    else if (!max && min === v[0])
      ranges.push('*');
    else if (!max)
      ranges.push(`>=${min}`);
    else if (min === v[0])
      ranges.push(`<=${max}`);
    else
      ranges.push(`${min} - ${max}`);
  }
  const simplified = ranges.join(' || ');
  const original = typeof range.raw === 'string' ? range.raw : String(range);
  return simplified.length < original.length ? simplified : range
};

const Range$b = range$1;
const Comparator$4 = comparator$1;
const { ANY: ANY$3 } = Comparator$4;
const satisfies$4 = satisfies_1$1;
const compare$b = compare_1$1;

// Complex range `r1 || r2 || ...` is a subset of `R1 || R2 || ...` iff:
// - Every simple range `r1, r2, ...` is a null set, OR
// - Every simple range `r1, r2, ...` which is not a null set is a subset of
//   some `R1, R2, ...`
//
// Simple range `c1 c2 ...` is a subset of simple range `C1 C2 ...` iff:
// - If c is only the ANY comparator
//   - If C is only the ANY comparator, return true
//   - Else if in prerelease mode, return false
//   - else replace c with `[>=0.0.0]`
// - If C is only the ANY comparator
//   - if in prerelease mode, return true
//   - else replace C with `[>=0.0.0]`
// - Let EQ be the set of = comparators in c
// - If EQ is more than one, return true (null set)
// - Let GT be the highest > or >= comparator in c
// - Let LT be the lowest < or <= comparator in c
// - If GT and LT, and GT.semver > LT.semver, return true (null set)
// - If any C is a = range, and GT or LT are set, return false
// - If EQ
//   - If GT, and EQ does not satisfy GT, return true (null set)
//   - If LT, and EQ does not satisfy LT, return true (null set)
//   - If EQ satisfies every C, return true
//   - Else return false
// - If GT
//   - If GT.semver is lower than any > or >= comp in C, return false
//   - If GT is >=, and GT.semver does not satisfy every C, return false
//   - If GT.semver has a prerelease, and not in prerelease mode
//     - If no C has a prerelease and the GT.semver tuple, return false
// - If LT
//   - If LT.semver is greater than any < or <= comp in C, return false
//   - If LT is <=, and LT.semver does not satisfy every C, return false
//   - If GT.semver has a prerelease, and not in prerelease mode
//     - If no C has a prerelease and the LT.semver tuple, return false
// - Else return true

const subset$1 = (sub, dom, options = {}) => {
  if (sub === dom)
    return true

  sub = new Range$b(sub, options);
  dom = new Range$b(dom, options);
  let sawNonNull = false;

  OUTER: for (const simpleSub of sub.set) {
    for (const simpleDom of dom.set) {
      const isSub = simpleSubset$1(simpleSub, simpleDom, options);
      sawNonNull = sawNonNull || isSub !== null;
      if (isSub)
        continue OUTER
    }
    // the null set is a subset of everything, but null simple ranges in
    // a complex range should be ignored.  so if we saw a non-null range,
    // then we know this isn't a subset, but if EVERY simple range was null,
    // then it is a subset.
    if (sawNonNull)
      return false
  }
  return true
};

const simpleSubset$1 = (sub, dom, options) => {
  if (sub === dom)
    return true

  if (sub.length === 1 && sub[0].semver === ANY$3) {
    if (dom.length === 1 && dom[0].semver === ANY$3)
      return true
    else if (options.includePrerelease)
      sub = [ new Comparator$4('>=0.0.0-0') ];
    else
      sub = [ new Comparator$4('>=0.0.0') ];
  }

  if (dom.length === 1 && dom[0].semver === ANY$3) {
    if (options.includePrerelease)
      return true
    else
      dom = [ new Comparator$4('>=0.0.0') ];
  }

  const eqSet = new Set();
  let gt, lt;
  for (const c of sub) {
    if (c.operator === '>' || c.operator === '>=')
      gt = higherGT$1(gt, c, options);
    else if (c.operator === '<' || c.operator === '<=')
      lt = lowerLT$1(lt, c, options);
    else
      eqSet.add(c.semver);
  }

  if (eqSet.size > 1)
    return null

  let gtltComp;
  if (gt && lt) {
    gtltComp = compare$b(gt.semver, lt.semver, options);
    if (gtltComp > 0)
      return null
    else if (gtltComp === 0 && (gt.operator !== '>=' || lt.operator !== '<='))
      return null
  }

  // will iterate one or zero times
  for (const eq of eqSet) {
    if (gt && !satisfies$4(eq, String(gt), options))
      return null

    if (lt && !satisfies$4(eq, String(lt), options))
      return null

    for (const c of dom) {
      if (!satisfies$4(eq, String(c), options))
        return false
    }

    return true
  }

  let higher, lower;
  let hasDomLT, hasDomGT;
  // if the subset has a prerelease, we need a comparator in the superset
  // with the same tuple and a prerelease, or it's not a subset
  let needDomLTPre = lt &&
    !options.includePrerelease &&
    lt.semver.prerelease.length ? lt.semver : false;
  let needDomGTPre = gt &&
    !options.includePrerelease &&
    gt.semver.prerelease.length ? gt.semver : false;
  // exception: <1.2.3-0 is the same as <1.2.3
  if (needDomLTPre && needDomLTPre.prerelease.length === 1 &&
      lt.operator === '<' && needDomLTPre.prerelease[0] === 0) {
    needDomLTPre = false;
  }

  for (const c of dom) {
    hasDomGT = hasDomGT || c.operator === '>' || c.operator === '>=';
    hasDomLT = hasDomLT || c.operator === '<' || c.operator === '<=';
    if (gt) {
      if (needDomGTPre) {
        if (c.semver.prerelease && c.semver.prerelease.length &&
            c.semver.major === needDomGTPre.major &&
            c.semver.minor === needDomGTPre.minor &&
            c.semver.patch === needDomGTPre.patch) {
          needDomGTPre = false;
        }
      }
      if (c.operator === '>' || c.operator === '>=') {
        higher = higherGT$1(gt, c, options);
        if (higher === c && higher !== gt)
          return false
      } else if (gt.operator === '>=' && !satisfies$4(gt.semver, String(c), options))
        return false
    }
    if (lt) {
      if (needDomLTPre) {
        if (c.semver.prerelease && c.semver.prerelease.length &&
            c.semver.major === needDomLTPre.major &&
            c.semver.minor === needDomLTPre.minor &&
            c.semver.patch === needDomLTPre.patch) {
          needDomLTPre = false;
        }
      }
      if (c.operator === '<' || c.operator === '<=') {
        lower = lowerLT$1(lt, c, options);
        if (lower === c && lower !== lt)
          return false
      } else if (lt.operator === '<=' && !satisfies$4(lt.semver, String(c), options))
        return false
    }
    if (!c.operator && (lt || gt) && gtltComp !== 0)
      return false
  }

  // if there was a < or >, and nothing in the dom, then must be false
  // UNLESS it was limited by another range in the other direction.
  // Eg, >1.0.0 <1.0.1 is still a subset of <2.0.0
  if (gt && hasDomLT && !lt && gtltComp !== 0)
    return false

  if (lt && hasDomGT && !gt && gtltComp !== 0)
    return false

  // we needed a prerelease range in a specific tuple, but didn't get one
  // then this isn't a subset.  eg >=1.2.3-pre is not a subset of >=1.0.0,
  // because it includes prereleases in the 1.2.3 tuple
  if (needDomGTPre || needDomLTPre)
    return false

  return true
};

// >=1.2.3 is lower than >1.2.3
const higherGT$1 = (a, b, options) => {
  if (!a)
    return b
  const comp = compare$b(a.semver, b.semver, options);
  return comp > 0 ? a
    : comp < 0 ? b
    : b.operator === '>' && a.operator === '>=' ? b
    : a
};

// <=1.2.3 is higher than <1.2.3
const lowerLT$1 = (a, b, options) => {
  if (!a)
    return b
  const comp = compare$b(a.semver, b.semver, options);
  return comp < 0 ? a
    : comp > 0 ? b
    : b.operator === '<' && a.operator === '<=' ? b
    : a
};

var subset_1$1 = subset$1;

// just pre-load all the stuff that index.js lazily exports
const internalRe$1 = re$b.exports;
var semver$4 = {
  re: internalRe$1.re,
  src: internalRe$1.src,
  tokens: internalRe$1.t,
  SEMVER_SPEC_VERSION: constants$1.SEMVER_SPEC_VERSION,
  SemVer: semver$5,
  compareIdentifiers: identifiers$1.compareIdentifiers,
  rcompareIdentifiers: identifiers$1.rcompareIdentifiers,
  parse: parse_1$1,
  valid: valid_1$1,
  clean: clean_1$1,
  inc: inc_1$1,
  diff: diff_1$1,
  major: major_1$1,
  minor: minor_1$1,
  patch: patch_1$1,
  prerelease: prerelease_1$1,
  compare: compare_1$1,
  rcompare: rcompare_1$1,
  compareLoose: compareLoose_1$1,
  compareBuild: compareBuild_1$1,
  sort: sort_1$1,
  rsort: rsort_1$1,
  gt: gt_1$1,
  lt: lt_1$1,
  eq: eq_1$1,
  neq: neq_1$1,
  gte: gte_1$1,
  lte: lte_1$1,
  cmp: cmp_1$1,
  coerce: coerce_1$1,
  Comparator: comparator$1,
  Range: range$1,
  satisfies: satisfies_1$1,
  toComparators: toComparators_1$1,
  maxSatisfying: maxSatisfying_1$1,
  minSatisfying: minSatisfying_1$1,
  minVersion: minVersion_1$1,
  validRange: valid$2,
  outside: outside_1$1,
  gtr: gtr_1$1,
  ltr: ltr_1$1,
  intersects: intersects_1$1,
  simplifyRange: simplify$1,
  subset: subset_1$1,
};

var semver$3 = semver$4;

var builtins$1 = function ({
  version = process.version,
  experimental = false
} = {}) {
  var coreModules = [
    'assert',
    'buffer',
    'child_process',
    'cluster',
    'console',
    'constants',
    'crypto',
    'dgram',
    'dns',
    'domain',
    'events',
    'fs',
    'http',
    'https',
    'module',
    'net',
    'os',
    'path',
    'punycode',
    'querystring',
    'readline',
    'repl',
    'stream',
    'string_decoder',
    'sys',
    'timers',
    'tls',
    'tty',
    'url',
    'util',
    'vm',
    'zlib'
  ];

  if (semver$3.lt(version, '6.0.0')) coreModules.push('freelist');
  if (semver$3.gte(version, '1.0.0')) coreModules.push('v8');
  if (semver$3.gte(version, '1.1.0')) coreModules.push('process');
  if (semver$3.gte(version, '8.0.0')) coreModules.push('inspector');
  if (semver$3.gte(version, '8.1.0')) coreModules.push('async_hooks');
  if (semver$3.gte(version, '8.4.0')) coreModules.push('http2');
  if (semver$3.gte(version, '8.5.0')) coreModules.push('perf_hooks');
  if (semver$3.gte(version, '10.0.0')) coreModules.push('trace_events');

  if (
    semver$3.gte(version, '10.5.0') &&
    (experimental || semver$3.gte(version, '12.0.0'))
  ) {
    coreModules.push('worker_threads');
  }
  if (semver$3.gte(version, '12.16.0') && experimental) {
    coreModules.push('wasi');
  }
  
  return coreModules
};

// Manually “tree shaken” from:

const reader$1 = {read: read$1};
const packageJsonReader$1 = reader$1;

/**
 * @param {string} jsonPath
 * @returns {{string: string}}
 */
function read$1(jsonPath) {
  return find$1(path.dirname(jsonPath))
}

/**
 * @param {string} dir
 * @returns {{string: string}}
 */
function find$1(dir) {
  try {
    const string = fs.readFileSync(
      path.toNamespacedPath(path.join(dir, 'package.json')),
      'utf8'
    );
    return {string}
  } catch (error) {
    if (error.code === 'ENOENT') {
      const parent = path.dirname(dir);
      if (dir !== parent) return find$1(parent)
      return {string: undefined}
      // Throw all other errors.
      /* c8 ignore next 4 */
    }

    throw error
  }
}

// Manually “tree shaken” from:

const isWindows$1 = process.platform === 'win32';

const own$3 = {}.hasOwnProperty;

const codes$1 = {};

/**
 * @typedef {(...args: unknown[]) => string} MessageFunction
 */

/** @type {Map<string, MessageFunction|string>} */
const messages$1 = new Map();
const nodeInternalPrefix$1 = '__node_internal_';
/** @type {number} */
let userStackTraceLimit$1;

codes$1.ERR_INVALID_MODULE_SPECIFIER = createError$1(
  'ERR_INVALID_MODULE_SPECIFIER',
  /**
   * @param {string} request
   * @param {string} reason
   * @param {string} [base]
   */
  (request, reason, base = undefined) => {
    return `Invalid module "${request}" ${reason}${
      base ? ` imported from ${base}` : ''
    }`
  },
  TypeError
);

codes$1.ERR_INVALID_PACKAGE_CONFIG = createError$1(
  'ERR_INVALID_PACKAGE_CONFIG',
  /**
   * @param {string} path
   * @param {string} [base]
   * @param {string} [message]
   */
  (path, base, message) => {
    return `Invalid package config ${path}${
      base ? ` while importing ${base}` : ''
    }${message ? `. ${message}` : ''}`
  },
  Error
);

codes$1.ERR_INVALID_PACKAGE_TARGET = createError$1(
  'ERR_INVALID_PACKAGE_TARGET',
  /**
   * @param {string} pkgPath
   * @param {string} key
   * @param {unknown} target
   * @param {boolean} [isImport=false]
   * @param {string} [base]
   */
  (pkgPath, key, target, isImport = false, base = undefined) => {
    const relError =
      typeof target === 'string' &&
      !isImport &&
      target.length > 0 &&
      !target.startsWith('./');
    if (key === '.') {
      assert(isImport === false);
      return (
        `Invalid "exports" main target ${JSON.stringify(target)} defined ` +
        `in the package config ${pkgPath}package.json${
          base ? ` imported from ${base}` : ''
        }${relError ? '; targets must start with "./"' : ''}`
      )
    }

    return `Invalid "${
      isImport ? 'imports' : 'exports'
    }" target ${JSON.stringify(
      target
    )} defined for '${key}' in the package config ${pkgPath}package.json${
      base ? ` imported from ${base}` : ''
    }${relError ? '; targets must start with "./"' : ''}`
  },
  Error
);

codes$1.ERR_MODULE_NOT_FOUND = createError$1(
  'ERR_MODULE_NOT_FOUND',
  /**
   * @param {string} path
   * @param {string} base
   * @param {string} [type]
   */
  (path, base, type = 'package') => {
    return `Cannot find ${type} '${path}' imported from ${base}`
  },
  Error
);

codes$1.ERR_PACKAGE_IMPORT_NOT_DEFINED = createError$1(
  'ERR_PACKAGE_IMPORT_NOT_DEFINED',
  /**
   * @param {string} specifier
   * @param {string} packagePath
   * @param {string} base
   */
  (specifier, packagePath, base) => {
    return `Package import specifier "${specifier}" is not defined${
      packagePath ? ` in package ${packagePath}package.json` : ''
    } imported from ${base}`
  },
  TypeError
);

codes$1.ERR_PACKAGE_PATH_NOT_EXPORTED = createError$1(
  'ERR_PACKAGE_PATH_NOT_EXPORTED',
  /**
   * @param {string} pkgPath
   * @param {string} subpath
   * @param {string} [base]
   */
  (pkgPath, subpath, base = undefined) => {
    if (subpath === '.')
      return `No "exports" main defined in ${pkgPath}package.json${
        base ? ` imported from ${base}` : ''
      }`
    return `Package subpath '${subpath}' is not defined by "exports" in ${pkgPath}package.json${
      base ? ` imported from ${base}` : ''
    }`
  },
  Error
);

codes$1.ERR_UNSUPPORTED_DIR_IMPORT = createError$1(
  'ERR_UNSUPPORTED_DIR_IMPORT',
  "Directory import '%s' is not supported " +
    'resolving ES modules imported from %s',
  Error
);

codes$1.ERR_UNKNOWN_FILE_EXTENSION = createError$1(
  'ERR_UNKNOWN_FILE_EXTENSION',
  'Unknown file extension "%s" for %s',
  TypeError
);

codes$1.ERR_INVALID_ARG_VALUE = createError$1(
  'ERR_INVALID_ARG_VALUE',
  /**
   * @param {string} name
   * @param {unknown} value
   * @param {string} [reason='is invalid']
   */
  (name, value, reason = 'is invalid') => {
    let inspected = inspect(value);

    if (inspected.length > 128) {
      inspected = `${inspected.slice(0, 128)}...`;
    }

    const type = name.includes('.') ? 'property' : 'argument';

    return `The ${type} '${name}' ${reason}. Received ${inspected}`
  },
  TypeError
  // Note: extra classes have been shaken out.
  // , RangeError
);

codes$1.ERR_UNSUPPORTED_ESM_URL_SCHEME = createError$1(
  'ERR_UNSUPPORTED_ESM_URL_SCHEME',
  /**
   * @param {URL} url
   */
  (url) => {
    let message =
      'Only file and data URLs are supported by the default ESM loader';

    if (isWindows$1 && url.protocol.length === 2) {
      message += '. On Windows, absolute paths must be valid file:// URLs';
    }

    message += `. Received protocol '${url.protocol}'`;
    return message
  },
  Error
);

/**
 * Utility function for registering the error codes. Only used here. Exported
 * *only* to allow for testing.
 * @param {string} sym
 * @param {MessageFunction|string} value
 * @param {ErrorConstructor} def
 * @returns {new (...args: unknown[]) => Error}
 */
function createError$1(sym, value, def) {
  // Special case for SystemError that formats the error message differently
  // The SystemErrors only have SystemError as their base classes.
  messages$1.set(sym, value);

  return makeNodeErrorWithCode$1(def, sym)
}

/**
 * @param {ErrorConstructor} Base
 * @param {string} key
 * @returns {ErrorConstructor}
 */
function makeNodeErrorWithCode$1(Base, key) {
  // @ts-expect-error It’s a Node error.
  return NodeError
  /**
   * @param {unknown[]} args
   */
  function NodeError(...args) {
    const limit = Error.stackTraceLimit;
    if (isErrorStackTraceLimitWritable$1()) Error.stackTraceLimit = 0;
    const error = new Base();
    // Reset the limit and setting the name property.
    if (isErrorStackTraceLimitWritable$1()) Error.stackTraceLimit = limit;
    const message = getMessage$1(key, args, error);
    Object.defineProperty(error, 'message', {
      value: message,
      enumerable: false,
      writable: true,
      configurable: true
    });
    Object.defineProperty(error, 'toString', {
      /** @this {Error} */
      value() {
        return `${this.name} [${key}]: ${this.message}`
      },
      enumerable: false,
      writable: true,
      configurable: true
    });
    addCodeToName$1(error, Base.name, key);
    // @ts-expect-error It’s a Node error.
    error.code = key;
    return error
  }
}

const addCodeToName$1 = hideStackFrames$1(
  /**
   * @param {Error} error
   * @param {string} name
   * @param {string} code
   * @returns {void}
   */
  function (error, name, code) {
    // Set the stack
    error = captureLargerStackTrace$1(error);
    // Add the error code to the name to include it in the stack trace.
    error.name = `${name} [${code}]`;
    // Access the stack to generate the error message including the error code
    // from the name.
    error.stack; // eslint-disable-line no-unused-expressions
    // Reset the name to the actual name.
    if (name === 'SystemError') {
      Object.defineProperty(error, 'name', {
        value: name,
        enumerable: false,
        writable: true,
        configurable: true
      });
    } else {
      delete error.name;
    }
  }
);

/**
 * @returns {boolean}
 */
function isErrorStackTraceLimitWritable$1() {
  const desc = Object.getOwnPropertyDescriptor(Error, 'stackTraceLimit');
  if (desc === undefined) {
    return Object.isExtensible(Error)
  }

  return own$3.call(desc, 'writable') ? desc.writable : desc.set !== undefined
}

/**
 * This function removes unnecessary frames from Node.js core errors.
 * @template {(...args: unknown[]) => unknown} T
 * @type {(fn: T) => T}
 */
function hideStackFrames$1(fn) {
  // We rename the functions that will be hidden to cut off the stacktrace
  // at the outermost one
  const hidden = nodeInternalPrefix$1 + fn.name;
  Object.defineProperty(fn, 'name', {value: hidden});
  return fn
}

const captureLargerStackTrace$1 = hideStackFrames$1(
  /**
   * @param {Error} error
   * @returns {Error}
   */
  function (error) {
    const stackTraceLimitIsWritable = isErrorStackTraceLimitWritable$1();
    if (stackTraceLimitIsWritable) {
      userStackTraceLimit$1 = Error.stackTraceLimit;
      Error.stackTraceLimit = Number.POSITIVE_INFINITY;
    }

    Error.captureStackTrace(error);

    // Reset the limit
    if (stackTraceLimitIsWritable) Error.stackTraceLimit = userStackTraceLimit$1;

    return error
  }
);

/**
 * @param {string} key
 * @param {unknown[]} args
 * @param {Error} self
 * @returns {string}
 */
function getMessage$1(key, args, self) {
  const message = messages$1.get(key);

  if (typeof message === 'function') {
    assert(
      message.length <= args.length, // Default options do not count.
      `Code: ${key}; The provided arguments length (${args.length}) does not ` +
        `match the required ones (${message.length}).`
    );
    return Reflect.apply(message, self, args)
  }

  const expectedLength = (message.match(/%[dfijoOs]/g) || []).length;
  assert(
    expectedLength === args.length,
    `Code: ${key}; The provided arguments length (${args.length}) does not ` +
      `match the required ones (${expectedLength}).`
  );
  if (args.length === 0) return message

  args.unshift(message);
  return Reflect.apply(format$2, null, args)
}

// Manually “tree shaken” from:

const {ERR_UNKNOWN_FILE_EXTENSION: ERR_UNKNOWN_FILE_EXTENSION$1} = codes$1;

const extensionFormatMap$1 = {
  __proto__: null,
  '.cjs': 'commonjs',
  '.js': 'module',
  '.mjs': 'module'
};

/**
 * @param {string} url
 * @returns {{format: string|null}}
 */
function defaultGetFormat$1(url) {
  if (url.startsWith('node:')) {
    return {format: 'builtin'}
  }

  const parsed = new URL$1(url);

  if (parsed.protocol === 'data:') {
    const {1: mime} = /^([^/]+\/[^;,]+)[^,]*?(;base64)?,/.exec(
      parsed.pathname
    ) || [null, null];
    const format = mime === 'text/javascript' ? 'module' : null;
    return {format}
  }

  if (parsed.protocol === 'file:') {
    const ext = path.extname(parsed.pathname);
    /** @type {string} */
    let format;
    if (ext === '.js') {
      format = getPackageType$1(parsed.href) === 'module' ? 'module' : 'commonjs';
    } else {
      format = extensionFormatMap$1[ext];
    }

    if (!format) {
      throw new ERR_UNKNOWN_FILE_EXTENSION$1(ext, fileURLToPath$2(url))
    }

    return {format: format || null}
  }

  return {format: null}
}

// Manually “tree shaken” from:

builtins$1();

const {
  ERR_INVALID_MODULE_SPECIFIER: ERR_INVALID_MODULE_SPECIFIER$1,
  ERR_INVALID_PACKAGE_CONFIG: ERR_INVALID_PACKAGE_CONFIG$1,
  ERR_INVALID_PACKAGE_TARGET: ERR_INVALID_PACKAGE_TARGET$1,
  ERR_MODULE_NOT_FOUND: ERR_MODULE_NOT_FOUND$1,
  ERR_PACKAGE_IMPORT_NOT_DEFINED: ERR_PACKAGE_IMPORT_NOT_DEFINED$1,
  ERR_PACKAGE_PATH_NOT_EXPORTED: ERR_PACKAGE_PATH_NOT_EXPORTED$1,
  ERR_UNSUPPORTED_DIR_IMPORT: ERR_UNSUPPORTED_DIR_IMPORT$1,
  ERR_UNSUPPORTED_ESM_URL_SCHEME: ERR_UNSUPPORTED_ESM_URL_SCHEME$1,
  ERR_INVALID_ARG_VALUE: ERR_INVALID_ARG_VALUE$1
} = codes$1;

const own$2 = {}.hasOwnProperty;

Object.freeze(['node', 'import']);

const invalidSegmentRegEx$1 = /(^|\\|\/)(\.\.?|node_modules)(\\|\/|$)/;
const patternRegEx$1 = /\*/g;
const encodedSepRegEx$1 = /%2f|%2c/i;
/** @type {Set<string>} */
const emittedPackageWarnings$1 = new Set();
/** @type {Map<string, PackageConfig>} */
const packageJsonCache$1 = new Map();

/**
 * @param {string} match
 * @param {URL} pjsonUrl
 * @param {boolean} isExports
 * @param {URL} base
 * @returns {void}
 */
function emitFolderMapDeprecation$1(match, pjsonUrl, isExports, base) {
  const pjsonPath = fileURLToPath$2(pjsonUrl);

  if (emittedPackageWarnings$1.has(pjsonPath + '|' + match)) return
  emittedPackageWarnings$1.add(pjsonPath + '|' + match);
  process.emitWarning(
    `Use of deprecated folder mapping "${match}" in the ${
      isExports ? '"exports"' : '"imports"'
    } field module resolution of the package at ${pjsonPath}${
      base ? ` imported from ${fileURLToPath$2(base)}` : ''
    }.\n` +
      `Update this package.json to use a subpath pattern like "${match}*".`,
    'DeprecationWarning',
    'DEP0148'
  );
}

/**
 * @param {URL} url
 * @param {URL} packageJsonUrl
 * @param {URL} base
 * @param {unknown} [main]
 * @returns {void}
 */
function emitLegacyIndexDeprecation$1(url, packageJsonUrl, base, main) {
  const {format} = defaultGetFormat$1(url.href);
  if (format !== 'module') return
  const path = fileURLToPath$2(url.href);
  const pkgPath = fileURLToPath$2(new URL$1('.', packageJsonUrl));
  const basePath = fileURLToPath$2(base);
  if (main)
    process.emitWarning(
      `Package ${pkgPath} has a "main" field set to ${JSON.stringify(main)}, ` +
        `excluding the full filename and extension to the resolved file at "${path.slice(
          pkgPath.length
        )}", imported from ${basePath}.\n Automatic extension resolution of the "main" field is` +
        'deprecated for ES modules.',
      'DeprecationWarning',
      'DEP0151'
    );
  else
    process.emitWarning(
      `No "main" or "exports" field defined in the package.json for ${pkgPath} resolving the main entry point "${path.slice(
        pkgPath.length
      )}", imported from ${basePath}.\nDefault "index" lookups for the main are deprecated for ES modules.`,
      'DeprecationWarning',
      'DEP0151'
    );
}

/**
 * @param {string} path
 * @returns {Stats}
 */
function tryStatSync$1(path) {
  // Note: from Node 15 onwards we can use `throwIfNoEntry: false` instead.
  try {
    return statSync(path)
  } catch {
    return new Stats()
  }
}

/**
 * @param {string} path
 * @param {string|URL} specifier Note: `specifier` is actually optional, not base.
 * @param {URL} [base]
 * @returns {PackageConfig}
 */
function getPackageConfig$1(path, specifier, base) {
  const existing = packageJsonCache$1.get(path);
  if (existing !== undefined) {
    return existing
  }

  const source = packageJsonReader$1.read(path).string;

  if (source === undefined) {
    /** @type {PackageConfig} */
    const packageConfig = {
      pjsonPath: path,
      exists: false,
      main: undefined,
      name: undefined,
      type: 'none',
      exports: undefined,
      imports: undefined
    };
    packageJsonCache$1.set(path, packageConfig);
    return packageConfig
  }

  /** @type {Object.<string, unknown>} */
  let packageJson;
  try {
    packageJson = JSON.parse(source);
  } catch (error) {
    throw new ERR_INVALID_PACKAGE_CONFIG$1(
      path,
      (base ? `"${specifier}" from ` : '') + fileURLToPath$2(base || specifier),
      error.message
    )
  }

  const {exports, imports, main, name, type} = packageJson;

  /** @type {PackageConfig} */
  const packageConfig = {
    pjsonPath: path,
    exists: true,
    main: typeof main === 'string' ? main : undefined,
    name: typeof name === 'string' ? name : undefined,
    type: type === 'module' || type === 'commonjs' ? type : 'none',
    // @ts-expect-error Assume `Object.<string, unknown>`.
    exports,
    // @ts-expect-error Assume `Object.<string, unknown>`.
    imports: imports && typeof imports === 'object' ? imports : undefined
  };
  packageJsonCache$1.set(path, packageConfig);
  return packageConfig
}

/**
 * @param {URL|string} resolved
 * @returns {PackageConfig}
 */
function getPackageScopeConfig$1(resolved) {
  let packageJsonUrl = new URL$1('./package.json', resolved);

  while (true) {
    const packageJsonPath = packageJsonUrl.pathname;

    if (packageJsonPath.endsWith('node_modules/package.json')) break

    const packageConfig = getPackageConfig$1(
      fileURLToPath$2(packageJsonUrl),
      resolved
    );
    if (packageConfig.exists) return packageConfig

    const lastPackageJsonUrl = packageJsonUrl;
    packageJsonUrl = new URL$1('../package.json', packageJsonUrl);

    // Terminates at root where ../package.json equals ../../package.json
    // (can't just check "/package.json" for Windows support).
    if (packageJsonUrl.pathname === lastPackageJsonUrl.pathname) break
  }

  const packageJsonPath = fileURLToPath$2(packageJsonUrl);
  /** @type {PackageConfig} */
  const packageConfig = {
    pjsonPath: packageJsonPath,
    exists: false,
    main: undefined,
    name: undefined,
    type: 'none',
    exports: undefined,
    imports: undefined
  };
  packageJsonCache$1.set(packageJsonPath, packageConfig);
  return packageConfig
}

/**
 * Legacy CommonJS main resolution:
 * 1. let M = pkg_url + (json main field)
 * 2. TRY(M, M.js, M.json, M.node)
 * 3. TRY(M/index.js, M/index.json, M/index.node)
 * 4. TRY(pkg_url/index.js, pkg_url/index.json, pkg_url/index.node)
 * 5. NOT_FOUND
 *
 * @param {URL} url
 * @returns {boolean}
 */
function fileExists$1(url) {
  return tryStatSync$1(fileURLToPath$2(url)).isFile()
}

/**
 * @param {URL} packageJsonUrl
 * @param {PackageConfig} packageConfig
 * @param {URL} base
 * @returns {URL}
 */
function legacyMainResolve$1(packageJsonUrl, packageConfig, base) {
  /** @type {URL} */
  let guess;
  if (packageConfig.main !== undefined) {
    guess = new URL$1(`./${packageConfig.main}`, packageJsonUrl);
    // Note: fs check redundances will be handled by Descriptor cache here.
    if (fileExists$1(guess)) return guess

    const tries = [
      `./${packageConfig.main}.js`,
      `./${packageConfig.main}.json`,
      `./${packageConfig.main}.node`,
      `./${packageConfig.main}/index.js`,
      `./${packageConfig.main}/index.json`,
      `./${packageConfig.main}/index.node`
    ];
    let i = -1;

    while (++i < tries.length) {
      guess = new URL$1(tries[i], packageJsonUrl);
      if (fileExists$1(guess)) break
      guess = undefined;
    }

    if (guess) {
      emitLegacyIndexDeprecation$1(
        guess,
        packageJsonUrl,
        base,
        packageConfig.main
      );
      return guess
    }
    // Fallthrough.
  }

  const tries = ['./index.js', './index.json', './index.node'];
  let i = -1;

  while (++i < tries.length) {
    guess = new URL$1(tries[i], packageJsonUrl);
    if (fileExists$1(guess)) break
    guess = undefined;
  }

  if (guess) {
    emitLegacyIndexDeprecation$1(guess, packageJsonUrl, base, packageConfig.main);
    return guess
  }

  // Not found.
  throw new ERR_MODULE_NOT_FOUND$1(
    fileURLToPath$2(new URL$1('.', packageJsonUrl)),
    fileURLToPath$2(base)
  )
}

/**
 * @param {URL} resolved
 * @param {URL} base
 * @returns {URL}
 */
function finalizeResolution$1(resolved, base) {
  if (encodedSepRegEx$1.test(resolved.pathname))
    throw new ERR_INVALID_MODULE_SPECIFIER$1(
      resolved.pathname,
      'must not include encoded "/" or "\\" characters',
      fileURLToPath$2(base)
    )

  const path = fileURLToPath$2(resolved);

  const stats = tryStatSync$1(path.endsWith('/') ? path.slice(-1) : path);

  if (stats.isDirectory()) {
    const error = new ERR_UNSUPPORTED_DIR_IMPORT$1(path, fileURLToPath$2(base));
    // @ts-expect-error Add this for `import.meta.resolve`.
    error.url = String(resolved);
    throw error
  }

  if (!stats.isFile()) {
    throw new ERR_MODULE_NOT_FOUND$1(
      path || resolved.pathname,
      base && fileURLToPath$2(base),
      'module'
    )
  }

  return resolved
}

/**
 * @param {string} specifier
 * @param {URL?} packageJsonUrl
 * @param {URL} base
 * @returns {never}
 */
function throwImportNotDefined$1(specifier, packageJsonUrl, base) {
  throw new ERR_PACKAGE_IMPORT_NOT_DEFINED$1(
    specifier,
    packageJsonUrl && fileURLToPath$2(new URL$1('.', packageJsonUrl)),
    fileURLToPath$2(base)
  )
}

/**
 * @param {string} subpath
 * @param {URL} packageJsonUrl
 * @param {URL} base
 * @returns {never}
 */
function throwExportsNotFound$1(subpath, packageJsonUrl, base) {
  throw new ERR_PACKAGE_PATH_NOT_EXPORTED$1(
    fileURLToPath$2(new URL$1('.', packageJsonUrl)),
    subpath,
    base && fileURLToPath$2(base)
  )
}

/**
 * @param {string} subpath
 * @param {URL} packageJsonUrl
 * @param {boolean} internal
 * @param {URL} [base]
 * @returns {never}
 */
function throwInvalidSubpath$1(subpath, packageJsonUrl, internal, base) {
  const reason = `request is not a valid subpath for the "${
    internal ? 'imports' : 'exports'
  }" resolution of ${fileURLToPath$2(packageJsonUrl)}`;

  throw new ERR_INVALID_MODULE_SPECIFIER$1(
    subpath,
    reason,
    base && fileURLToPath$2(base)
  )
}

/**
 * @param {string} subpath
 * @param {unknown} target
 * @param {URL} packageJsonUrl
 * @param {boolean} internal
 * @param {URL} [base]
 * @returns {never}
 */
function throwInvalidPackageTarget$1(
  subpath,
  target,
  packageJsonUrl,
  internal,
  base
) {
  target =
    typeof target === 'object' && target !== null
      ? JSON.stringify(target, null, '')
      : `${target}`;

  throw new ERR_INVALID_PACKAGE_TARGET$1(
    fileURLToPath$2(new URL$1('.', packageJsonUrl)),
    subpath,
    target,
    internal,
    base && fileURLToPath$2(base)
  )
}

/**
 * @param {string} target
 * @param {string} subpath
 * @param {string} match
 * @param {URL} packageJsonUrl
 * @param {URL} base
 * @param {boolean} pattern
 * @param {boolean} internal
 * @param {Set<string>} conditions
 * @returns {URL}
 */
function resolvePackageTargetString$1(
  target,
  subpath,
  match,
  packageJsonUrl,
  base,
  pattern,
  internal,
  conditions
) {
  if (subpath !== '' && !pattern && target[target.length - 1] !== '/')
    throwInvalidPackageTarget$1(match, target, packageJsonUrl, internal, base);

  if (!target.startsWith('./')) {
    if (internal && !target.startsWith('../') && !target.startsWith('/')) {
      let isURL = false;

      try {
        new URL$1(target);
        isURL = true;
      } catch {}

      if (!isURL) {
        const exportTarget = pattern
          ? target.replace(patternRegEx$1, subpath)
          : target + subpath;

        return packageResolve$1(exportTarget, packageJsonUrl, conditions)
      }
    }

    throwInvalidPackageTarget$1(match, target, packageJsonUrl, internal, base);
  }

  if (invalidSegmentRegEx$1.test(target.slice(2)))
    throwInvalidPackageTarget$1(match, target, packageJsonUrl, internal, base);

  const resolved = new URL$1(target, packageJsonUrl);
  const resolvedPath = resolved.pathname;
  const packagePath = new URL$1('.', packageJsonUrl).pathname;

  if (!resolvedPath.startsWith(packagePath))
    throwInvalidPackageTarget$1(match, target, packageJsonUrl, internal, base);

  if (subpath === '') return resolved

  if (invalidSegmentRegEx$1.test(subpath))
    throwInvalidSubpath$1(match + subpath, packageJsonUrl, internal, base);

  if (pattern) return new URL$1(resolved.href.replace(patternRegEx$1, subpath))
  return new URL$1(subpath, resolved)
}

/**
 * @param {string} key
 * @returns {boolean}
 */
function isArrayIndex$1(key) {
  const keyNumber = Number(key);
  if (`${keyNumber}` !== key) return false
  return keyNumber >= 0 && keyNumber < 0xffff_ffff
}

/**
 * @param {URL} packageJsonUrl
 * @param {unknown} target
 * @param {string} subpath
 * @param {string} packageSubpath
 * @param {URL} base
 * @param {boolean} pattern
 * @param {boolean} internal
 * @param {Set<string>} conditions
 * @returns {URL}
 */
function resolvePackageTarget$1(
  packageJsonUrl,
  target,
  subpath,
  packageSubpath,
  base,
  pattern,
  internal,
  conditions
) {
  if (typeof target === 'string') {
    return resolvePackageTargetString$1(
      target,
      subpath,
      packageSubpath,
      packageJsonUrl,
      base,
      pattern,
      internal,
      conditions
    )
  }

  if (Array.isArray(target)) {
    /** @type {unknown[]} */
    const targetList = target;
    if (targetList.length === 0) return null

    /** @type {Error} */
    let lastException;
    let i = -1;

    while (++i < targetList.length) {
      const targetItem = targetList[i];
      /** @type {URL} */
      let resolved;
      try {
        resolved = resolvePackageTarget$1(
          packageJsonUrl,
          targetItem,
          subpath,
          packageSubpath,
          base,
          pattern,
          internal,
          conditions
        );
      } catch (error) {
        lastException = error;
        if (error.code === 'ERR_INVALID_PACKAGE_TARGET') continue
        throw error
      }

      if (resolved === undefined) continue

      if (resolved === null) {
        lastException = null;
        continue
      }

      return resolved
    }

    if (lastException === undefined || lastException === null) {
      // @ts-expect-error The diff between `undefined` and `null` seems to be
      // intentional
      return lastException
    }

    throw lastException
  }

  if (typeof target === 'object' && target !== null) {
    const keys = Object.getOwnPropertyNames(target);
    let i = -1;

    while (++i < keys.length) {
      const key = keys[i];
      if (isArrayIndex$1(key)) {
        throw new ERR_INVALID_PACKAGE_CONFIG$1(
          fileURLToPath$2(packageJsonUrl),
          base,
          '"exports" cannot contain numeric property keys.'
        )
      }
    }

    i = -1;

    while (++i < keys.length) {
      const key = keys[i];
      if (key === 'default' || (conditions && conditions.has(key))) {
        /** @type {unknown} */
        const conditionalTarget = target[key];
        const resolved = resolvePackageTarget$1(
          packageJsonUrl,
          conditionalTarget,
          subpath,
          packageSubpath,
          base,
          pattern,
          internal,
          conditions
        );
        if (resolved === undefined) continue
        return resolved
      }
    }

    return undefined
  }

  if (target === null) {
    return null
  }

  throwInvalidPackageTarget$1(
    packageSubpath,
    target,
    packageJsonUrl,
    internal,
    base
  );
}

/**
 * @param {unknown} exports
 * @param {URL} packageJsonUrl
 * @param {URL} base
 * @returns {boolean}
 */
function isConditionalExportsMainSugar$1(exports, packageJsonUrl, base) {
  if (typeof exports === 'string' || Array.isArray(exports)) return true
  if (typeof exports !== 'object' || exports === null) return false

  const keys = Object.getOwnPropertyNames(exports);
  let isConditionalSugar = false;
  let i = 0;
  let j = -1;
  while (++j < keys.length) {
    const key = keys[j];
    const curIsConditionalSugar = key === '' || key[0] !== '.';
    if (i++ === 0) {
      isConditionalSugar = curIsConditionalSugar;
    } else if (isConditionalSugar !== curIsConditionalSugar) {
      throw new ERR_INVALID_PACKAGE_CONFIG$1(
        fileURLToPath$2(packageJsonUrl),
        base,
        '"exports" cannot contain some keys starting with \'.\' and some not.' +
          ' The exports object must either be an object of package subpath keys' +
          ' or an object of main entry condition name keys only.'
      )
    }
  }

  return isConditionalSugar
}

/**
 * @param {URL} packageJsonUrl
 * @param {string} packageSubpath
 * @param {Object.<string, unknown>} packageConfig
 * @param {URL} base
 * @param {Set<string>} conditions
 * @returns {ResolveObject}
 */
function packageExportsResolve$1(
  packageJsonUrl,
  packageSubpath,
  packageConfig,
  base,
  conditions
) {
  let exports = packageConfig.exports;
  if (isConditionalExportsMainSugar$1(exports, packageJsonUrl, base))
    exports = {'.': exports};

  if (own$2.call(exports, packageSubpath)) {
    const target = exports[packageSubpath];
    const resolved = resolvePackageTarget$1(
      packageJsonUrl,
      target,
      '',
      packageSubpath,
      base,
      false,
      false,
      conditions
    );
    if (resolved === null || resolved === undefined)
      throwExportsNotFound$1(packageSubpath, packageJsonUrl, base);
    return {resolved, exact: true}
  }

  let bestMatch = '';
  const keys = Object.getOwnPropertyNames(exports);
  let i = -1;

  while (++i < keys.length) {
    const key = keys[i];
    if (
      key[key.length - 1] === '*' &&
      packageSubpath.startsWith(key.slice(0, -1)) &&
      packageSubpath.length >= key.length &&
      key.length > bestMatch.length
    ) {
      bestMatch = key;
    } else if (
      key[key.length - 1] === '/' &&
      packageSubpath.startsWith(key) &&
      key.length > bestMatch.length
    ) {
      bestMatch = key;
    }
  }

  if (bestMatch) {
    const target = exports[bestMatch];
    const pattern = bestMatch[bestMatch.length - 1] === '*';
    const subpath = packageSubpath.slice(bestMatch.length - (pattern ? 1 : 0));
    const resolved = resolvePackageTarget$1(
      packageJsonUrl,
      target,
      subpath,
      bestMatch,
      base,
      pattern,
      false,
      conditions
    );
    if (resolved === null || resolved === undefined)
      throwExportsNotFound$1(packageSubpath, packageJsonUrl, base);
    if (!pattern)
      emitFolderMapDeprecation$1(bestMatch, packageJsonUrl, true, base);
    return {resolved, exact: pattern}
  }

  throwExportsNotFound$1(packageSubpath, packageJsonUrl, base);
}

/**
 * @param {string} name
 * @param {URL} base
 * @param {Set<string>} [conditions]
 * @returns {ResolveObject}
 */
function packageImportsResolve$1(name, base, conditions) {
  if (name === '#' || name.startsWith('#/')) {
    const reason = 'is not a valid internal imports specifier name';
    throw new ERR_INVALID_MODULE_SPECIFIER$1(name, reason, fileURLToPath$2(base))
  }

  /** @type {URL} */
  let packageJsonUrl;

  const packageConfig = getPackageScopeConfig$1(base);

  if (packageConfig.exists) {
    packageJsonUrl = pathToFileURL(packageConfig.pjsonPath);
    const imports = packageConfig.imports;
    if (imports) {
      if (own$2.call(imports, name)) {
        const resolved = resolvePackageTarget$1(
          packageJsonUrl,
          imports[name],
          '',
          name,
          base,
          false,
          true,
          conditions
        );
        if (resolved !== null) return {resolved, exact: true}
      } else {
        let bestMatch = '';
        const keys = Object.getOwnPropertyNames(imports);
        let i = -1;

        while (++i < keys.length) {
          const key = keys[i];

          if (
            key[key.length - 1] === '*' &&
            name.startsWith(key.slice(0, -1)) &&
            name.length >= key.length &&
            key.length > bestMatch.length
          ) {
            bestMatch = key;
          } else if (
            key[key.length - 1] === '/' &&
            name.startsWith(key) &&
            key.length > bestMatch.length
          ) {
            bestMatch = key;
          }
        }

        if (bestMatch) {
          const target = imports[bestMatch];
          const pattern = bestMatch[bestMatch.length - 1] === '*';
          const subpath = name.slice(bestMatch.length - (pattern ? 1 : 0));
          const resolved = resolvePackageTarget$1(
            packageJsonUrl,
            target,
            subpath,
            bestMatch,
            base,
            pattern,
            true,
            conditions
          );
          if (resolved !== null) {
            if (!pattern)
              emitFolderMapDeprecation$1(bestMatch, packageJsonUrl, false, base);
            return {resolved, exact: pattern}
          }
        }
      }
    }
  }

  throwImportNotDefined$1(name, packageJsonUrl, base);
}

/**
 * @param {string} url
 * @returns {PackageType}
 */
function getPackageType$1(url) {
  const packageConfig = getPackageScopeConfig$1(url);
  return packageConfig.type
}

/**
 * @param {string} specifier
 * @param {URL} base
 */
function parsePackageName$1(specifier, base) {
  let separatorIndex = specifier.indexOf('/');
  let validPackageName = true;
  let isScoped = false;
  if (specifier[0] === '@') {
    isScoped = true;
    if (separatorIndex === -1 || specifier.length === 0) {
      validPackageName = false;
    } else {
      separatorIndex = specifier.indexOf('/', separatorIndex + 1);
    }
  }

  const packageName =
    separatorIndex === -1 ? specifier : specifier.slice(0, separatorIndex);

  // Package name cannot have leading . and cannot have percent-encoding or
  // separators.
  let i = -1;
  while (++i < packageName.length) {
    if (packageName[i] === '%' || packageName[i] === '\\') {
      validPackageName = false;
      break
    }
  }

  if (!validPackageName) {
    throw new ERR_INVALID_MODULE_SPECIFIER$1(
      specifier,
      'is not a valid package name',
      fileURLToPath$2(base)
    )
  }

  const packageSubpath =
    '.' + (separatorIndex === -1 ? '' : specifier.slice(separatorIndex));

  return {packageName, packageSubpath, isScoped}
}

/**
 * @param {string} specifier
 * @param {URL} base
 * @param {Set<string>} conditions
 * @returns {URL}
 */
function packageResolve$1(specifier, base, conditions) {
  const {packageName, packageSubpath, isScoped} = parsePackageName$1(
    specifier,
    base
  );

  // ResolveSelf
  const packageConfig = getPackageScopeConfig$1(base);

  // Can’t test.
  /* c8 ignore next 16 */
  if (packageConfig.exists) {
    const packageJsonUrl = pathToFileURL(packageConfig.pjsonPath);
    if (
      packageConfig.name === packageName &&
      packageConfig.exports !== undefined &&
      packageConfig.exports !== null
    ) {
      return packageExportsResolve$1(
        packageJsonUrl,
        packageSubpath,
        packageConfig,
        base,
        conditions
      ).resolved
    }
  }

  let packageJsonUrl = new URL$1(
    './node_modules/' + packageName + '/package.json',
    base
  );
  let packageJsonPath = fileURLToPath$2(packageJsonUrl);
  /** @type {string} */
  let lastPath;
  do {
    const stat = tryStatSync$1(packageJsonPath.slice(0, -13));
    if (!stat.isDirectory()) {
      lastPath = packageJsonPath;
      packageJsonUrl = new URL$1(
        (isScoped ? '../../../../node_modules/' : '../../../node_modules/') +
          packageName +
          '/package.json',
        packageJsonUrl
      );
      packageJsonPath = fileURLToPath$2(packageJsonUrl);
      continue
    }

    // Package match.
    const packageConfig = getPackageConfig$1(packageJsonPath, specifier, base);
    if (packageConfig.exports !== undefined && packageConfig.exports !== null)
      return packageExportsResolve$1(
        packageJsonUrl,
        packageSubpath,
        packageConfig,
        base,
        conditions
      ).resolved
    if (packageSubpath === '.')
      return legacyMainResolve$1(packageJsonUrl, packageConfig, base)
    return new URL$1(packageSubpath, packageJsonUrl)
    // Cross-platform root check.
  } while (packageJsonPath.length !== lastPath.length)

  throw new ERR_MODULE_NOT_FOUND$1(packageName, fileURLToPath$2(base))
}

/**
 * @param {string} specifier
 * @returns {boolean}
 */
function isRelativeSpecifier$1(specifier) {
  if (specifier[0] === '.') {
    if (specifier.length === 1 || specifier[1] === '/') return true
    if (
      specifier[1] === '.' &&
      (specifier.length === 2 || specifier[2] === '/')
    ) {
      return true
    }
  }

  return false
}

/**
 * @param {string} specifier
 * @returns {boolean}
 */
function shouldBeTreatedAsRelativeOrAbsolutePath$1(specifier) {
  if (specifier === '') return false
  if (specifier[0] === '/') return true
  return isRelativeSpecifier$1(specifier)
}

/**
 * The “Resolver Algorithm Specification” as detailed in the Node docs (which is
 * sync and slightly lower-level than `resolve`).
 *
 *
 *
 * @param {string} specifier
 * @param {URL} base
 * @param {Set<string>} [conditions]
 * @returns {URL}
 */
function moduleResolve$1(specifier, base, conditions) {
  // Order swapped from spec for minor perf gain.
  // Ok since relative URLs cannot parse as URLs.
  /** @type {URL} */
  let resolved;

  if (shouldBeTreatedAsRelativeOrAbsolutePath$1(specifier)) {
    resolved = new URL$1(specifier, base);
  } else if (specifier[0] === '#') {
({resolved} = packageImportsResolve$1(specifier, base, conditions));
  } else {
    try {
      resolved = new URL$1(specifier);
    } catch {
      resolved = packageResolve$1(specifier, base, conditions);
    }
  }

  return finalizeResolution$1(resolved, base)
}

const DEFAULT_CONDITIONS_SET$1 = new Set(["node", "import"]);
const DEFAULT_URL$1 = pathToFileURL(process.cwd());
const DEFAULT_EXTENSIONS$1 = [".mjs", ".cjs", ".js", ".json"];
const NOT_FOUND_ERRORS$1 = new Set(["ERR_MODULE_NOT_FOUND", "ERR_UNSUPPORTED_DIR_IMPORT", "MODULE_NOT_FOUND"]);
function _tryModuleResolve$1(id, url, conditions) {
  try {
    return moduleResolve$1(id, url, conditions);
  } catch (err) {
    if (!NOT_FOUND_ERRORS$1.has(err.code)) {
      throw err;
    }
    return null;
  }
}
function _resolve$1(id, opts = {}) {
  if (/(node|data|http|https):/.test(id)) {
    return id;
  }
  if (BUILTIN_MODULES$1.has(id)) {
    return "node:" + id;
  }
  if (isAbsolute$1(id)) {
    return id;
  }
  const conditionsSet = opts.conditions ? new Set(opts.conditions) : DEFAULT_CONDITIONS_SET$1;
  const _urls = (Array.isArray(opts.url) ? opts.url : [opts.url]).filter(Boolean).map((u) => new URL(normalizeid$1(u.toString())));
  if (!_urls.length) {
    _urls.push(DEFAULT_URL$1);
  }
  const urls = [..._urls];
  for (const url of _urls) {
    if (url.protocol === "file:" && !url.pathname.includes("node_modules")) {
      const newURL = new URL(url);
      newURL.pathname += "/node_modules";
      urls.push(newURL);
    }
  }
  let resolved;
  for (const url of urls) {
    resolved = _tryModuleResolve$1(id, url, conditionsSet);
    if (resolved) {
      break;
    }
    for (const prefix of ["", "/index"]) {
      for (const ext of opts.extensions || DEFAULT_EXTENSIONS$1) {
        resolved = _tryModuleResolve$1(id + prefix + ext, url, conditionsSet);
        if (resolved) {
          break;
        }
      }
      if (resolved) {
        break;
      }
    }
  }
  if (!resolved) {
    const err = new Error(`Cannot find module ${id} imported from ${urls.join(", ")}`);
    err.code = "ERR_MODULE_NOT_FOUND";
    throw err;
  }
  const realPath = realpathSync(fileURLToPath$1(resolved));
  return pathToFileURL(realPath).toString();
}
function resolveSync$1(id, opts) {
  return _resolve$1(id, opts);
}
function resolvePathSync$1(id, opts) {
  return fileURLToPath$1(resolveSync$1(id, opts));
}
function resolvePath$1(id, opts) {
  return pcall$1(resolvePathSync$1, id, opts);
}

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var ParseOptions;
(function (ParseOptions) {
    ParseOptions.DEFAULT = {
        allowTrailingComma: false
    };
})(ParseOptions || (ParseOptions = {}));

const BUILTIN_MODULES = new Set(builtinModules);
function normalizeSlash(str) {
  return str.replace(/\\/g, "/");
}
function pcall(fn, ...args) {
  try {
    return Promise.resolve(fn(...args)).catch((err) => perr(err));
  } catch (err) {
    return perr(err);
  }
}
function perr(_err) {
  const err = new Error(_err);
  err.code = _err.code;
  Error.captureStackTrace(err, pcall);
  return Promise.reject(err);
}

function fileURLToPath(id) {
  if (typeof id === "string" && !id.startsWith("file://")) {
    return normalizeSlash(id);
  }
  return normalizeSlash(fileURLToPath$2(id));
}
function normalizeid(id) {
  if (typeof id !== "string") {
    id = id.toString();
  }
  if (/(node|data|http|https|file):/.test(id)) {
    return id;
  }
  if (BUILTIN_MODULES.has(id)) {
    return "node:" + id;
  }
  return "file://" + normalizeSlash(id);
}

function normalizeWindowsPath(input = "") {
  if (!input.includes("\\")) {
    return input;
  }
  return input.replace(/\\/g, "/");
}

const _UNC_REGEX = /^[/][/]/;
const _UNC_DRIVE_REGEX = /^[/][/]([.]{1,2}[/])?([a-zA-Z]):[/]/;
const _IS_ABSOLUTE_RE = /^\/|^\\|^[a-zA-Z]:[/\\]/;
const sep = "/";
const delimiter = ":";
const normalize = function(path2) {
  if (path2.length === 0) {
    return ".";
  }
  path2 = normalizeWindowsPath(path2);
  const isUNCPath = path2.match(_UNC_REGEX);
  const hasUNCDrive = isUNCPath && path2.match(_UNC_DRIVE_REGEX);
  const isPathAbsolute = isAbsolute(path2);
  const trailingSeparator = path2[path2.length - 1] === "/";
  path2 = normalizeString(path2, !isPathAbsolute);
  if (path2.length === 0) {
    if (isPathAbsolute) {
      return "/";
    }
    return trailingSeparator ? "./" : ".";
  }
  if (trailingSeparator) {
    path2 += "/";
  }
  if (isUNCPath) {
    if (hasUNCDrive) {
      return `//./${path2}`;
    }
    return `//${path2}`;
  }
  return isPathAbsolute && !isAbsolute(path2) ? `/${path2}` : path2;
};
const join = function(...args) {
  if (args.length === 0) {
    return ".";
  }
  let joined;
  for (let i = 0; i < args.length; ++i) {
    const arg = args[i];
    if (arg.length > 0) {
      if (joined === void 0) {
        joined = arg;
      } else {
        joined += `/${arg}`;
      }
    }
  }
  if (joined === void 0) {
    return ".";
  }
  return normalize(joined);
};
const resolve$1 = function(...args) {
  args = args.map((arg) => normalizeWindowsPath(arg));
  let resolvedPath = "";
  let resolvedAbsolute = false;
  for (let i = args.length - 1; i >= -1 && !resolvedAbsolute; i--) {
    const path2 = i >= 0 ? args[i] : process.cwd();
    if (path2.length === 0) {
      continue;
    }
    resolvedPath = `${path2}/${resolvedPath}`;
    resolvedAbsolute = isAbsolute(path2);
  }
  resolvedPath = normalizeString(resolvedPath, !resolvedAbsolute);
  if (resolvedAbsolute && !isAbsolute(resolvedPath)) {
    return `/${resolvedPath}`;
  }
  return resolvedPath.length > 0 ? resolvedPath : ".";
};
function normalizeString(path2, allowAboveRoot) {
  let res = "";
  let lastSegmentLength = 0;
  let lastSlash = -1;
  let dots = 0;
  let char = null;
  for (let i = 0; i <= path2.length; ++i) {
    if (i < path2.length) {
      char = path2[i];
    } else if (char === "/") {
      break;
    } else {
      char = "/";
    }
    if (char === "/") {
      if (lastSlash === i - 1 || dots === 1) ; else if (dots === 2) {
        if (res.length < 2 || lastSegmentLength !== 2 || res[res.length - 1] !== "." || res[res.length - 2] !== ".") {
          if (res.length > 2) {
            const lastSlashIndex = res.lastIndexOf("/");
            if (lastSlashIndex === -1) {
              res = "";
              lastSegmentLength = 0;
            } else {
              res = res.slice(0, lastSlashIndex);
              lastSegmentLength = res.length - 1 - res.lastIndexOf("/");
            }
            lastSlash = i;
            dots = 0;
            continue;
          } else if (res.length !== 0) {
            res = "";
            lastSegmentLength = 0;
            lastSlash = i;
            dots = 0;
            continue;
          }
        }
        if (allowAboveRoot) {
          res += res.length > 0 ? "/.." : "..";
          lastSegmentLength = 2;
        }
      } else {
        if (res.length > 0) {
          res += `/${path2.slice(lastSlash + 1, i)}`;
        } else {
          res = path2.slice(lastSlash + 1, i);
        }
        lastSegmentLength = i - lastSlash - 1;
      }
      lastSlash = i;
      dots = 0;
    } else if (char === "." && dots !== -1) {
      ++dots;
    } else {
      dots = -1;
    }
  }
  return res;
}
const isAbsolute = function(p) {
  return _IS_ABSOLUTE_RE.test(p);
};
const toNamespacedPath = function(p) {
  return normalizeWindowsPath(p);
};
const extname = function(p) {
  return path.posix.extname(normalizeWindowsPath(p));
};
const relative = function(from, to) {
  return path.posix.relative(normalizeWindowsPath(from), normalizeWindowsPath(to));
};
const dirname = function(p) {
  return path.posix.dirname(normalizeWindowsPath(p));
};
const format = function(p) {
  return normalizeWindowsPath(path.posix.format(p));
};
const basename = function(p, ext) {
  return path.posix.basename(normalizeWindowsPath(p), ext);
};
const parse$6 = function(p) {
  return path.posix.parse(normalizeWindowsPath(p));
};

const _path = /*#__PURE__*/Object.freeze({
  __proto__: null,
  sep: sep,
  delimiter: delimiter,
  normalize: normalize,
  join: join,
  resolve: resolve$1,
  normalizeString: normalizeString,
  isAbsolute: isAbsolute,
  toNamespacedPath: toNamespacedPath,
  extname: extname,
  relative: relative,
  dirname: dirname,
  format: format,
  basename: basename,
  parse: parse$6
});

({
  ..._path
});

var re$5 = {exports: {}};

// Note: this is the semver.org version of the spec that it implements
// Not necessarily the package version of this code.
const SEMVER_SPEC_VERSION = '2.0.0';

const MAX_LENGTH$2 = 256;
const MAX_SAFE_INTEGER$1 = Number.MAX_SAFE_INTEGER ||
  /* istanbul ignore next */ 9007199254740991;

// Max safe segment length for coercion.
const MAX_SAFE_COMPONENT_LENGTH = 16;

var constants = {
  SEMVER_SPEC_VERSION,
  MAX_LENGTH: MAX_LENGTH$2,
  MAX_SAFE_INTEGER: MAX_SAFE_INTEGER$1,
  MAX_SAFE_COMPONENT_LENGTH
};

const debug$3 = (
  typeof process === 'object' &&
  process.env &&
  process.env.NODE_DEBUG &&
  /\bsemver\b/i.test(process.env.NODE_DEBUG)
) ? (...args) => console.error('SEMVER', ...args)
  : () => {};

var debug_1 = debug$3;

(function (module, exports) {
const { MAX_SAFE_COMPONENT_LENGTH } = constants;
const debug = debug_1;
exports = module.exports = {};

// The actual regexps go on exports.re
const re = exports.re = [];
const src = exports.src = [];
const t = exports.t = {};
let R = 0;

const createToken = (name, value, isGlobal) => {
  const index = R++;
  debug(index, value);
  t[name] = index;
  src[index] = value;
  re[index] = new RegExp(value, isGlobal ? 'g' : undefined);
};

// The following Regular Expressions can be used for tokenizing,
// validating, and parsing SemVer version strings.

// ## Numeric Identifier
// A single `0`, or a non-zero digit followed by zero or more digits.

createToken('NUMERICIDENTIFIER', '0|[1-9]\\d*');
createToken('NUMERICIDENTIFIERLOOSE', '[0-9]+');

// ## Non-numeric Identifier
// Zero or more digits, followed by a letter or hyphen, and then zero or
// more letters, digits, or hyphens.

createToken('NONNUMERICIDENTIFIER', '\\d*[a-zA-Z-][a-zA-Z0-9-]*');

// ## Main Version
// Three dot-separated numeric identifiers.

createToken('MAINVERSION', `(${src[t.NUMERICIDENTIFIER]})\\.` +
                   `(${src[t.NUMERICIDENTIFIER]})\\.` +
                   `(${src[t.NUMERICIDENTIFIER]})`);

createToken('MAINVERSIONLOOSE', `(${src[t.NUMERICIDENTIFIERLOOSE]})\\.` +
                        `(${src[t.NUMERICIDENTIFIERLOOSE]})\\.` +
                        `(${src[t.NUMERICIDENTIFIERLOOSE]})`);

// ## Pre-release Version Identifier
// A numeric identifier, or a non-numeric identifier.

createToken('PRERELEASEIDENTIFIER', `(?:${src[t.NUMERICIDENTIFIER]
}|${src[t.NONNUMERICIDENTIFIER]})`);

createToken('PRERELEASEIDENTIFIERLOOSE', `(?:${src[t.NUMERICIDENTIFIERLOOSE]
}|${src[t.NONNUMERICIDENTIFIER]})`);

// ## Pre-release Version
// Hyphen, followed by one or more dot-separated pre-release version
// identifiers.

createToken('PRERELEASE', `(?:-(${src[t.PRERELEASEIDENTIFIER]
}(?:\\.${src[t.PRERELEASEIDENTIFIER]})*))`);

createToken('PRERELEASELOOSE', `(?:-?(${src[t.PRERELEASEIDENTIFIERLOOSE]
}(?:\\.${src[t.PRERELEASEIDENTIFIERLOOSE]})*))`);

// ## Build Metadata Identifier
// Any combination of digits, letters, or hyphens.

createToken('BUILDIDENTIFIER', '[0-9A-Za-z-]+');

// ## Build Metadata
// Plus sign, followed by one or more period-separated build metadata
// identifiers.

createToken('BUILD', `(?:\\+(${src[t.BUILDIDENTIFIER]
}(?:\\.${src[t.BUILDIDENTIFIER]})*))`);

// ## Full Version String
// A main version, followed optionally by a pre-release version and
// build metadata.

// Note that the only major, minor, patch, and pre-release sections of
// the version string are capturing groups.  The build metadata is not a
// capturing group, because it should not ever be used in version
// comparison.

createToken('FULLPLAIN', `v?${src[t.MAINVERSION]
}${src[t.PRERELEASE]}?${
  src[t.BUILD]}?`);

createToken('FULL', `^${src[t.FULLPLAIN]}$`);

// like full, but allows v1.2.3 and =1.2.3, which people do sometimes.
// also, 1.0.0alpha1 (prerelease without the hyphen) which is pretty
// common in the npm registry.
createToken('LOOSEPLAIN', `[v=\\s]*${src[t.MAINVERSIONLOOSE]
}${src[t.PRERELEASELOOSE]}?${
  src[t.BUILD]}?`);

createToken('LOOSE', `^${src[t.LOOSEPLAIN]}$`);

createToken('GTLT', '((?:<|>)?=?)');

// Something like "2.*" or "1.2.x".
// Note that "x.x" is a valid xRange identifer, meaning "any version"
// Only the first item is strictly required.
createToken('XRANGEIDENTIFIERLOOSE', `${src[t.NUMERICIDENTIFIERLOOSE]}|x|X|\\*`);
createToken('XRANGEIDENTIFIER', `${src[t.NUMERICIDENTIFIER]}|x|X|\\*`);

createToken('XRANGEPLAIN', `[v=\\s]*(${src[t.XRANGEIDENTIFIER]})` +
                   `(?:\\.(${src[t.XRANGEIDENTIFIER]})` +
                   `(?:\\.(${src[t.XRANGEIDENTIFIER]})` +
                   `(?:${src[t.PRERELEASE]})?${
                     src[t.BUILD]}?` +
                   `)?)?`);

createToken('XRANGEPLAINLOOSE', `[v=\\s]*(${src[t.XRANGEIDENTIFIERLOOSE]})` +
                        `(?:\\.(${src[t.XRANGEIDENTIFIERLOOSE]})` +
                        `(?:\\.(${src[t.XRANGEIDENTIFIERLOOSE]})` +
                        `(?:${src[t.PRERELEASELOOSE]})?${
                          src[t.BUILD]}?` +
                        `)?)?`);

createToken('XRANGE', `^${src[t.GTLT]}\\s*${src[t.XRANGEPLAIN]}$`);
createToken('XRANGELOOSE', `^${src[t.GTLT]}\\s*${src[t.XRANGEPLAINLOOSE]}$`);

// Coercion.
// Extract anything that could conceivably be a part of a valid semver
createToken('COERCE', `${'(^|[^\\d])' +
              '(\\d{1,'}${MAX_SAFE_COMPONENT_LENGTH}})` +
              `(?:\\.(\\d{1,${MAX_SAFE_COMPONENT_LENGTH}}))?` +
              `(?:\\.(\\d{1,${MAX_SAFE_COMPONENT_LENGTH}}))?` +
              `(?:$|[^\\d])`);
createToken('COERCERTL', src[t.COERCE], true);

// Tilde ranges.
// Meaning is "reasonably at or greater than"
createToken('LONETILDE', '(?:~>?)');

createToken('TILDETRIM', `(\\s*)${src[t.LONETILDE]}\\s+`, true);
exports.tildeTrimReplace = '$1~';

createToken('TILDE', `^${src[t.LONETILDE]}${src[t.XRANGEPLAIN]}$`);
createToken('TILDELOOSE', `^${src[t.LONETILDE]}${src[t.XRANGEPLAINLOOSE]}$`);

// Caret ranges.
// Meaning is "at least and backwards compatible with"
createToken('LONECARET', '(?:\\^)');

createToken('CARETTRIM', `(\\s*)${src[t.LONECARET]}\\s+`, true);
exports.caretTrimReplace = '$1^';

createToken('CARET', `^${src[t.LONECARET]}${src[t.XRANGEPLAIN]}$`);
createToken('CARETLOOSE', `^${src[t.LONECARET]}${src[t.XRANGEPLAINLOOSE]}$`);

// A simple gt/lt/eq thing, or just "" to indicate "any version"
createToken('COMPARATORLOOSE', `^${src[t.GTLT]}\\s*(${src[t.LOOSEPLAIN]})$|^$`);
createToken('COMPARATOR', `^${src[t.GTLT]}\\s*(${src[t.FULLPLAIN]})$|^$`);

// An expression to strip any whitespace between the gtlt and the thing
// it modifies, so that `> 1.2.3` ==> `>1.2.3`
createToken('COMPARATORTRIM', `(\\s*)${src[t.GTLT]
}\\s*(${src[t.LOOSEPLAIN]}|${src[t.XRANGEPLAIN]})`, true);
exports.comparatorTrimReplace = '$1$2$3';

// Something like `1.2.3 - 1.2.4`
// Note that these all use the loose form, because they'll be
// checked against either the strict or loose comparator form
// later.
createToken('HYPHENRANGE', `^\\s*(${src[t.XRANGEPLAIN]})` +
                   `\\s+-\\s+` +
                   `(${src[t.XRANGEPLAIN]})` +
                   `\\s*$`);

createToken('HYPHENRANGELOOSE', `^\\s*(${src[t.XRANGEPLAINLOOSE]})` +
                        `\\s+-\\s+` +
                        `(${src[t.XRANGEPLAINLOOSE]})` +
                        `\\s*$`);

// Star ranges basically just allow anything at all.
createToken('STAR', '(<|>)?=?\\s*\\*');
// >=0.0.0 is like a star
createToken('GTE0', '^\\s*>=\\s*0\.0\.0\\s*$');
createToken('GTE0PRE', '^\\s*>=\\s*0\.0\.0-0\\s*$');
}(re$5, re$5.exports));

// parse out just the options we care about so we always get a consistent
// obj with keys in a consistent order.
const opts = ['includePrerelease', 'loose', 'rtl'];
const parseOptions$4 = options =>
  !options ? {}
  : typeof options !== 'object' ? { loose: true }
  : opts.filter(k => options[k]).reduce((options, k) => {
    options[k] = true;
    return options
  }, {});
var parseOptions_1 = parseOptions$4;

const numeric = /^[0-9]+$/;
const compareIdentifiers$1 = (a, b) => {
  const anum = numeric.test(a);
  const bnum = numeric.test(b);

  if (anum && bnum) {
    a = +a;
    b = +b;
  }

  return a === b ? 0
    : (anum && !bnum) ? -1
    : (bnum && !anum) ? 1
    : a < b ? -1
    : 1
};

const rcompareIdentifiers = (a, b) => compareIdentifiers$1(b, a);

var identifiers = {
  compareIdentifiers: compareIdentifiers$1,
  rcompareIdentifiers
};

const debug$2 = debug_1;
const { MAX_LENGTH: MAX_LENGTH$1, MAX_SAFE_INTEGER } = constants;
const { re: re$4, t: t$4 } = re$5.exports;

const parseOptions$3 = parseOptions_1;
const { compareIdentifiers } = identifiers;
class SemVer$e {
  constructor (version, options) {
    options = parseOptions$3(options);

    if (version instanceof SemVer$e) {
      if (version.loose === !!options.loose &&
          version.includePrerelease === !!options.includePrerelease) {
        return version
      } else {
        version = version.version;
      }
    } else if (typeof version !== 'string') {
      throw new TypeError(`Invalid Version: ${version}`)
    }

    if (version.length > MAX_LENGTH$1) {
      throw new TypeError(
        `version is longer than ${MAX_LENGTH$1} characters`
      )
    }

    debug$2('SemVer', version, options);
    this.options = options;
    this.loose = !!options.loose;
    // this isn't actually relevant for versions, but keep it so that we
    // don't run into trouble passing this.options around.
    this.includePrerelease = !!options.includePrerelease;

    const m = version.trim().match(options.loose ? re$4[t$4.LOOSE] : re$4[t$4.FULL]);

    if (!m) {
      throw new TypeError(`Invalid Version: ${version}`)
    }

    this.raw = version;

    // these are actually numbers
    this.major = +m[1];
    this.minor = +m[2];
    this.patch = +m[3];

    if (this.major > MAX_SAFE_INTEGER || this.major < 0) {
      throw new TypeError('Invalid major version')
    }

    if (this.minor > MAX_SAFE_INTEGER || this.minor < 0) {
      throw new TypeError('Invalid minor version')
    }

    if (this.patch > MAX_SAFE_INTEGER || this.patch < 0) {
      throw new TypeError('Invalid patch version')
    }

    // numberify any prerelease numeric ids
    if (!m[4]) {
      this.prerelease = [];
    } else {
      this.prerelease = m[4].split('.').map((id) => {
        if (/^[0-9]+$/.test(id)) {
          const num = +id;
          if (num >= 0 && num < MAX_SAFE_INTEGER) {
            return num
          }
        }
        return id
      });
    }

    this.build = m[5] ? m[5].split('.') : [];
    this.format();
  }

  format () {
    this.version = `${this.major}.${this.minor}.${this.patch}`;
    if (this.prerelease.length) {
      this.version += `-${this.prerelease.join('.')}`;
    }
    return this.version
  }

  toString () {
    return this.version
  }

  compare (other) {
    debug$2('SemVer.compare', this.version, this.options, other);
    if (!(other instanceof SemVer$e)) {
      if (typeof other === 'string' && other === this.version) {
        return 0
      }
      other = new SemVer$e(other, this.options);
    }

    if (other.version === this.version) {
      return 0
    }

    return this.compareMain(other) || this.comparePre(other)
  }

  compareMain (other) {
    if (!(other instanceof SemVer$e)) {
      other = new SemVer$e(other, this.options);
    }

    return (
      compareIdentifiers(this.major, other.major) ||
      compareIdentifiers(this.minor, other.minor) ||
      compareIdentifiers(this.patch, other.patch)
    )
  }

  comparePre (other) {
    if (!(other instanceof SemVer$e)) {
      other = new SemVer$e(other, this.options);
    }

    // NOT having a prerelease is > having one
    if (this.prerelease.length && !other.prerelease.length) {
      return -1
    } else if (!this.prerelease.length && other.prerelease.length) {
      return 1
    } else if (!this.prerelease.length && !other.prerelease.length) {
      return 0
    }

    let i = 0;
    do {
      const a = this.prerelease[i];
      const b = other.prerelease[i];
      debug$2('prerelease compare', i, a, b);
      if (a === undefined && b === undefined) {
        return 0
      } else if (b === undefined) {
        return 1
      } else if (a === undefined) {
        return -1
      } else if (a === b) {
        continue
      } else {
        return compareIdentifiers(a, b)
      }
    } while (++i)
  }

  compareBuild (other) {
    if (!(other instanceof SemVer$e)) {
      other = new SemVer$e(other, this.options);
    }

    let i = 0;
    do {
      const a = this.build[i];
      const b = other.build[i];
      debug$2('prerelease compare', i, a, b);
      if (a === undefined && b === undefined) {
        return 0
      } else if (b === undefined) {
        return 1
      } else if (a === undefined) {
        return -1
      } else if (a === b) {
        continue
      } else {
        return compareIdentifiers(a, b)
      }
    } while (++i)
  }

  // preminor will bump the version up to the next minor release, and immediately
  // down to pre-release. premajor and prepatch work the same way.
  inc (release, identifier) {
    switch (release) {
      case 'premajor':
        this.prerelease.length = 0;
        this.patch = 0;
        this.minor = 0;
        this.major++;
        this.inc('pre', identifier);
        break
      case 'preminor':
        this.prerelease.length = 0;
        this.patch = 0;
        this.minor++;
        this.inc('pre', identifier);
        break
      case 'prepatch':
        // If this is already a prerelease, it will bump to the next version
        // drop any prereleases that might already exist, since they are not
        // relevant at this point.
        this.prerelease.length = 0;
        this.inc('patch', identifier);
        this.inc('pre', identifier);
        break
      // If the input is a non-prerelease version, this acts the same as
      // prepatch.
      case 'prerelease':
        if (this.prerelease.length === 0) {
          this.inc('patch', identifier);
        }
        this.inc('pre', identifier);
        break

      case 'major':
        // If this is a pre-major version, bump up to the same major version.
        // Otherwise increment major.
        // 1.0.0-5 bumps to 1.0.0
        // 1.1.0 bumps to 2.0.0
        if (
          this.minor !== 0 ||
          this.patch !== 0 ||
          this.prerelease.length === 0
        ) {
          this.major++;
        }
        this.minor = 0;
        this.patch = 0;
        this.prerelease = [];
        break
      case 'minor':
        // If this is a pre-minor version, bump up to the same minor version.
        // Otherwise increment minor.
        // 1.2.0-5 bumps to 1.2.0
        // 1.2.1 bumps to 1.3.0
        if (this.patch !== 0 || this.prerelease.length === 0) {
          this.minor++;
        }
        this.patch = 0;
        this.prerelease = [];
        break
      case 'patch':
        // If this is not a pre-release version, it will increment the patch.
        // If it is a pre-release it will bump up to the same patch version.
        // 1.2.0-5 patches to 1.2.0
        // 1.2.0 patches to 1.2.1
        if (this.prerelease.length === 0) {
          this.patch++;
        }
        this.prerelease = [];
        break
      // This probably shouldn't be used publicly.
      // 1.0.0 'pre' would become 1.0.0-0 which is the wrong direction.
      case 'pre':
        if (this.prerelease.length === 0) {
          this.prerelease = [0];
        } else {
          let i = this.prerelease.length;
          while (--i >= 0) {
            if (typeof this.prerelease[i] === 'number') {
              this.prerelease[i]++;
              i = -2;
            }
          }
          if (i === -1) {
            // didn't increment anything
            this.prerelease.push(0);
          }
        }
        if (identifier) {
          // 1.2.0-beta.1 bumps to 1.2.0-beta.2,
          // 1.2.0-beta.fooblz or 1.2.0-beta bumps to 1.2.0-beta.0
          if (this.prerelease[0] === identifier) {
            if (isNaN(this.prerelease[1])) {
              this.prerelease = [identifier, 0];
            }
          } else {
            this.prerelease = [identifier, 0];
          }
        }
        break

      default:
        throw new Error(`invalid increment argument: ${release}`)
    }
    this.format();
    this.raw = this.version;
    return this
  }
}

var semver$2 = SemVer$e;

const {MAX_LENGTH} = constants;
const { re: re$3, t: t$3 } = re$5.exports;
const SemVer$d = semver$2;

const parseOptions$2 = parseOptions_1;
const parse$5 = (version, options) => {
  options = parseOptions$2(options);

  if (version instanceof SemVer$d) {
    return version
  }

  if (typeof version !== 'string') {
    return null
  }

  if (version.length > MAX_LENGTH) {
    return null
  }

  const r = options.loose ? re$3[t$3.LOOSE] : re$3[t$3.FULL];
  if (!r.test(version)) {
    return null
  }

  try {
    return new SemVer$d(version, options)
  } catch (er) {
    return null
  }
};

var parse_1 = parse$5;

const parse$4 = parse_1;
const valid$1 = (version, options) => {
  const v = parse$4(version, options);
  return v ? v.version : null
};
var valid_1 = valid$1;

const parse$3 = parse_1;
const clean = (version, options) => {
  const s = parse$3(version.trim().replace(/^[=v]+/, ''), options);
  return s ? s.version : null
};
var clean_1 = clean;

const SemVer$c = semver$2;

const inc = (version, release, options, identifier) => {
  if (typeof (options) === 'string') {
    identifier = options;
    options = undefined;
  }

  try {
    return new SemVer$c(version, options).inc(release, identifier).version
  } catch (er) {
    return null
  }
};
var inc_1 = inc;

const SemVer$b = semver$2;
const compare$a = (a, b, loose) =>
  new SemVer$b(a, loose).compare(new SemVer$b(b, loose));

var compare_1 = compare$a;

const compare$9 = compare_1;
const eq$2 = (a, b, loose) => compare$9(a, b, loose) === 0;
var eq_1 = eq$2;

const parse$2 = parse_1;
const eq$1 = eq_1;

const diff = (version1, version2) => {
  if (eq$1(version1, version2)) {
    return null
  } else {
    const v1 = parse$2(version1);
    const v2 = parse$2(version2);
    const hasPre = v1.prerelease.length || v2.prerelease.length;
    const prefix = hasPre ? 'pre' : '';
    const defaultResult = hasPre ? 'prerelease' : '';
    for (const key in v1) {
      if (key === 'major' || key === 'minor' || key === 'patch') {
        if (v1[key] !== v2[key]) {
          return prefix + key
        }
      }
    }
    return defaultResult // may be undefined
  }
};
var diff_1 = diff;

const SemVer$a = semver$2;
const major = (a, loose) => new SemVer$a(a, loose).major;
var major_1 = major;

const SemVer$9 = semver$2;
const minor = (a, loose) => new SemVer$9(a, loose).minor;
var minor_1 = minor;

const SemVer$8 = semver$2;
const patch = (a, loose) => new SemVer$8(a, loose).patch;
var patch_1 = patch;

const parse$1 = parse_1;
const prerelease = (version, options) => {
  const parsed = parse$1(version, options);
  return (parsed && parsed.prerelease.length) ? parsed.prerelease : null
};
var prerelease_1 = prerelease;

const compare$8 = compare_1;
const rcompare = (a, b, loose) => compare$8(b, a, loose);
var rcompare_1 = rcompare;

const compare$7 = compare_1;
const compareLoose = (a, b) => compare$7(a, b, true);
var compareLoose_1 = compareLoose;

const SemVer$7 = semver$2;
const compareBuild$2 = (a, b, loose) => {
  const versionA = new SemVer$7(a, loose);
  const versionB = new SemVer$7(b, loose);
  return versionA.compare(versionB) || versionA.compareBuild(versionB)
};
var compareBuild_1 = compareBuild$2;

const compareBuild$1 = compareBuild_1;
const sort = (list, loose) => list.sort((a, b) => compareBuild$1(a, b, loose));
var sort_1 = sort;

const compareBuild = compareBuild_1;
const rsort = (list, loose) => list.sort((a, b) => compareBuild(b, a, loose));
var rsort_1 = rsort;

const compare$6 = compare_1;
const gt$3 = (a, b, loose) => compare$6(a, b, loose) > 0;
var gt_1 = gt$3;

const compare$5 = compare_1;
const lt$2 = (a, b, loose) => compare$5(a, b, loose) < 0;
var lt_1 = lt$2;

const compare$4 = compare_1;
const neq$1 = (a, b, loose) => compare$4(a, b, loose) !== 0;
var neq_1 = neq$1;

const compare$3 = compare_1;
const gte$2 = (a, b, loose) => compare$3(a, b, loose) >= 0;
var gte_1 = gte$2;

const compare$2 = compare_1;
const lte$2 = (a, b, loose) => compare$2(a, b, loose) <= 0;
var lte_1 = lte$2;

const eq = eq_1;
const neq = neq_1;
const gt$2 = gt_1;
const gte$1 = gte_1;
const lt$1 = lt_1;
const lte$1 = lte_1;

const cmp$1 = (a, op, b, loose) => {
  switch (op) {
    case '===':
      if (typeof a === 'object')
        a = a.version;
      if (typeof b === 'object')
        b = b.version;
      return a === b

    case '!==':
      if (typeof a === 'object')
        a = a.version;
      if (typeof b === 'object')
        b = b.version;
      return a !== b

    case '':
    case '=':
    case '==':
      return eq(a, b, loose)

    case '!=':
      return neq(a, b, loose)

    case '>':
      return gt$2(a, b, loose)

    case '>=':
      return gte$1(a, b, loose)

    case '<':
      return lt$1(a, b, loose)

    case '<=':
      return lte$1(a, b, loose)

    default:
      throw new TypeError(`Invalid operator: ${op}`)
  }
};
var cmp_1 = cmp$1;

const SemVer$6 = semver$2;
const parse = parse_1;
const {re: re$2, t: t$2} = re$5.exports;

const coerce = (version, options) => {
  if (version instanceof SemVer$6) {
    return version
  }

  if (typeof version === 'number') {
    version = String(version);
  }

  if (typeof version !== 'string') {
    return null
  }

  options = options || {};

  let match = null;
  if (!options.rtl) {
    match = version.match(re$2[t$2.COERCE]);
  } else {
    // Find the right-most coercible string that does not share
    // a terminus with a more left-ward coercible string.
    // Eg, '1.2.3.4' wants to coerce '2.3.4', not '3.4' or '4'
    //
    // Walk through the string checking with a /g regexp
    // Manually set the index so as to pick up overlapping matches.
    // Stop when we get a match that ends at the string end, since no
    // coercible string can be more right-ward without the same terminus.
    let next;
    while ((next = re$2[t$2.COERCERTL].exec(version)) &&
        (!match || match.index + match[0].length !== version.length)
    ) {
      if (!match ||
            next.index + next[0].length !== match.index + match[0].length) {
        match = next;
      }
      re$2[t$2.COERCERTL].lastIndex = next.index + next[1].length + next[2].length;
    }
    // leave it in a clean state
    re$2[t$2.COERCERTL].lastIndex = -1;
  }

  if (match === null)
    return null

  return parse(`${match[2]}.${match[3] || '0'}.${match[4] || '0'}`, options)
};
var coerce_1 = coerce;

var yallist = Yallist$1;

Yallist$1.Node = Node;
Yallist$1.create = Yallist$1;

function Yallist$1 (list) {
  var self = this;
  if (!(self instanceof Yallist$1)) {
    self = new Yallist$1();
  }

  self.tail = null;
  self.head = null;
  self.length = 0;

  if (list && typeof list.forEach === 'function') {
    list.forEach(function (item) {
      self.push(item);
    });
  } else if (arguments.length > 0) {
    for (var i = 0, l = arguments.length; i < l; i++) {
      self.push(arguments[i]);
    }
  }

  return self
}

Yallist$1.prototype.removeNode = function (node) {
  if (node.list !== this) {
    throw new Error('removing node which does not belong to this list')
  }

  var next = node.next;
  var prev = node.prev;

  if (next) {
    next.prev = prev;
  }

  if (prev) {
    prev.next = next;
  }

  if (node === this.head) {
    this.head = next;
  }
  if (node === this.tail) {
    this.tail = prev;
  }

  node.list.length--;
  node.next = null;
  node.prev = null;
  node.list = null;

  return next
};

Yallist$1.prototype.unshiftNode = function (node) {
  if (node === this.head) {
    return
  }

  if (node.list) {
    node.list.removeNode(node);
  }

  var head = this.head;
  node.list = this;
  node.next = head;
  if (head) {
    head.prev = node;
  }

  this.head = node;
  if (!this.tail) {
    this.tail = node;
  }
  this.length++;
};

Yallist$1.prototype.pushNode = function (node) {
  if (node === this.tail) {
    return
  }

  if (node.list) {
    node.list.removeNode(node);
  }

  var tail = this.tail;
  node.list = this;
  node.prev = tail;
  if (tail) {
    tail.next = node;
  }

  this.tail = node;
  if (!this.head) {
    this.head = node;
  }
  this.length++;
};

Yallist$1.prototype.push = function () {
  for (var i = 0, l = arguments.length; i < l; i++) {
    push(this, arguments[i]);
  }
  return this.length
};

Yallist$1.prototype.unshift = function () {
  for (var i = 0, l = arguments.length; i < l; i++) {
    unshift(this, arguments[i]);
  }
  return this.length
};

Yallist$1.prototype.pop = function () {
  if (!this.tail) {
    return undefined
  }

  var res = this.tail.value;
  this.tail = this.tail.prev;
  if (this.tail) {
    this.tail.next = null;
  } else {
    this.head = null;
  }
  this.length--;
  return res
};

Yallist$1.prototype.shift = function () {
  if (!this.head) {
    return undefined
  }

  var res = this.head.value;
  this.head = this.head.next;
  if (this.head) {
    this.head.prev = null;
  } else {
    this.tail = null;
  }
  this.length--;
  return res
};

Yallist$1.prototype.forEach = function (fn, thisp) {
  thisp = thisp || this;
  for (var walker = this.head, i = 0; walker !== null; i++) {
    fn.call(thisp, walker.value, i, this);
    walker = walker.next;
  }
};

Yallist$1.prototype.forEachReverse = function (fn, thisp) {
  thisp = thisp || this;
  for (var walker = this.tail, i = this.length - 1; walker !== null; i--) {
    fn.call(thisp, walker.value, i, this);
    walker = walker.prev;
  }
};

Yallist$1.prototype.get = function (n) {
  for (var i = 0, walker = this.head; walker !== null && i < n; i++) {
    // abort out of the list early if we hit a cycle
    walker = walker.next;
  }
  if (i === n && walker !== null) {
    return walker.value
  }
};

Yallist$1.prototype.getReverse = function (n) {
  for (var i = 0, walker = this.tail; walker !== null && i < n; i++) {
    // abort out of the list early if we hit a cycle
    walker = walker.prev;
  }
  if (i === n && walker !== null) {
    return walker.value
  }
};

Yallist$1.prototype.map = function (fn, thisp) {
  thisp = thisp || this;
  var res = new Yallist$1();
  for (var walker = this.head; walker !== null;) {
    res.push(fn.call(thisp, walker.value, this));
    walker = walker.next;
  }
  return res
};

Yallist$1.prototype.mapReverse = function (fn, thisp) {
  thisp = thisp || this;
  var res = new Yallist$1();
  for (var walker = this.tail; walker !== null;) {
    res.push(fn.call(thisp, walker.value, this));
    walker = walker.prev;
  }
  return res
};

Yallist$1.prototype.reduce = function (fn, initial) {
  var acc;
  var walker = this.head;
  if (arguments.length > 1) {
    acc = initial;
  } else if (this.head) {
    walker = this.head.next;
    acc = this.head.value;
  } else {
    throw new TypeError('Reduce of empty list with no initial value')
  }

  for (var i = 0; walker !== null; i++) {
    acc = fn(acc, walker.value, i);
    walker = walker.next;
  }

  return acc
};

Yallist$1.prototype.reduceReverse = function (fn, initial) {
  var acc;
  var walker = this.tail;
  if (arguments.length > 1) {
    acc = initial;
  } else if (this.tail) {
    walker = this.tail.prev;
    acc = this.tail.value;
  } else {
    throw new TypeError('Reduce of empty list with no initial value')
  }

  for (var i = this.length - 1; walker !== null; i--) {
    acc = fn(acc, walker.value, i);
    walker = walker.prev;
  }

  return acc
};

Yallist$1.prototype.toArray = function () {
  var arr = new Array(this.length);
  for (var i = 0, walker = this.head; walker !== null; i++) {
    arr[i] = walker.value;
    walker = walker.next;
  }
  return arr
};

Yallist$1.prototype.toArrayReverse = function () {
  var arr = new Array(this.length);
  for (var i = 0, walker = this.tail; walker !== null; i++) {
    arr[i] = walker.value;
    walker = walker.prev;
  }
  return arr
};

Yallist$1.prototype.slice = function (from, to) {
  to = to || this.length;
  if (to < 0) {
    to += this.length;
  }
  from = from || 0;
  if (from < 0) {
    from += this.length;
  }
  var ret = new Yallist$1();
  if (to < from || to < 0) {
    return ret
  }
  if (from < 0) {
    from = 0;
  }
  if (to > this.length) {
    to = this.length;
  }
  for (var i = 0, walker = this.head; walker !== null && i < from; i++) {
    walker = walker.next;
  }
  for (; walker !== null && i < to; i++, walker = walker.next) {
    ret.push(walker.value);
  }
  return ret
};

Yallist$1.prototype.sliceReverse = function (from, to) {
  to = to || this.length;
  if (to < 0) {
    to += this.length;
  }
  from = from || 0;
  if (from < 0) {
    from += this.length;
  }
  var ret = new Yallist$1();
  if (to < from || to < 0) {
    return ret
  }
  if (from < 0) {
    from = 0;
  }
  if (to > this.length) {
    to = this.length;
  }
  for (var i = this.length, walker = this.tail; walker !== null && i > to; i--) {
    walker = walker.prev;
  }
  for (; walker !== null && i > from; i--, walker = walker.prev) {
    ret.push(walker.value);
  }
  return ret
};

Yallist$1.prototype.splice = function (start, deleteCount, ...nodes) {
  if (start > this.length) {
    start = this.length - 1;
  }
  if (start < 0) {
    start = this.length + start;
  }

  for (var i = 0, walker = this.head; walker !== null && i < start; i++) {
    walker = walker.next;
  }

  var ret = [];
  for (var i = 0; walker && i < deleteCount; i++) {
    ret.push(walker.value);
    walker = this.removeNode(walker);
  }
  if (walker === null) {
    walker = this.tail;
  }

  if (walker !== this.head && walker !== this.tail) {
    walker = walker.prev;
  }

  for (var i = 0; i < nodes.length; i++) {
    walker = insert(this, walker, nodes[i]);
  }
  return ret;
};

Yallist$1.prototype.reverse = function () {
  var head = this.head;
  var tail = this.tail;
  for (var walker = head; walker !== null; walker = walker.prev) {
    var p = walker.prev;
    walker.prev = walker.next;
    walker.next = p;
  }
  this.head = tail;
  this.tail = head;
  return this
};

function insert (self, node, value) {
  var inserted = node === self.head ?
    new Node(value, null, node, self) :
    new Node(value, node, node.next, self);

  if (inserted.next === null) {
    self.tail = inserted;
  }
  if (inserted.prev === null) {
    self.head = inserted;
  }

  self.length++;

  return inserted
}

function push (self, item) {
  self.tail = new Node(item, self.tail, null, self);
  if (!self.head) {
    self.head = self.tail;
  }
  self.length++;
}

function unshift (self, item) {
  self.head = new Node(item, null, self.head, self);
  if (!self.tail) {
    self.tail = self.head;
  }
  self.length++;
}

function Node (value, prev, next, list) {
  if (!(this instanceof Node)) {
    return new Node(value, prev, next, list)
  }

  this.list = list;
  this.value = value;

  if (prev) {
    prev.next = this;
    this.prev = prev;
  } else {
    this.prev = null;
  }

  if (next) {
    next.prev = this;
    this.next = next;
  } else {
    this.next = null;
  }
}

try {
  // add if support for Symbol.iterator is present
  require('./iterator.js')(Yallist$1);
} catch (er) {}

// A linked list to keep track of recently-used-ness
const Yallist = yallist;

const MAX = Symbol('max');
const LENGTH = Symbol('length');
const LENGTH_CALCULATOR = Symbol('lengthCalculator');
const ALLOW_STALE = Symbol('allowStale');
const MAX_AGE = Symbol('maxAge');
const DISPOSE = Symbol('dispose');
const NO_DISPOSE_ON_SET = Symbol('noDisposeOnSet');
const LRU_LIST = Symbol('lruList');
const CACHE = Symbol('cache');
const UPDATE_AGE_ON_GET = Symbol('updateAgeOnGet');

const naiveLength = () => 1;

// lruList is a yallist where the head is the youngest
// item, and the tail is the oldest.  the list contains the Hit
// objects as the entries.
// Each Hit object has a reference to its Yallist.Node.  This
// never changes.
//
// cache is a Map (or PseudoMap) that matches the keys to
// the Yallist.Node object.
class LRUCache {
  constructor (options) {
    if (typeof options === 'number')
      options = { max: options };

    if (!options)
      options = {};

    if (options.max && (typeof options.max !== 'number' || options.max < 0))
      throw new TypeError('max must be a non-negative number')
    // Kind of weird to have a default max of Infinity, but oh well.
    this[MAX] = options.max || Infinity;

    const lc = options.length || naiveLength;
    this[LENGTH_CALCULATOR] = (typeof lc !== 'function') ? naiveLength : lc;
    this[ALLOW_STALE] = options.stale || false;
    if (options.maxAge && typeof options.maxAge !== 'number')
      throw new TypeError('maxAge must be a number')
    this[MAX_AGE] = options.maxAge || 0;
    this[DISPOSE] = options.dispose;
    this[NO_DISPOSE_ON_SET] = options.noDisposeOnSet || false;
    this[UPDATE_AGE_ON_GET] = options.updateAgeOnGet || false;
    this.reset();
  }

  // resize the cache when the max changes.
  set max (mL) {
    if (typeof mL !== 'number' || mL < 0)
      throw new TypeError('max must be a non-negative number')

    this[MAX] = mL || Infinity;
    trim(this);
  }
  get max () {
    return this[MAX]
  }

  set allowStale (allowStale) {
    this[ALLOW_STALE] = !!allowStale;
  }
  get allowStale () {
    return this[ALLOW_STALE]
  }

  set maxAge (mA) {
    if (typeof mA !== 'number')
      throw new TypeError('maxAge must be a non-negative number')

    this[MAX_AGE] = mA;
    trim(this);
  }
  get maxAge () {
    return this[MAX_AGE]
  }

  // resize the cache when the lengthCalculator changes.
  set lengthCalculator (lC) {
    if (typeof lC !== 'function')
      lC = naiveLength;

    if (lC !== this[LENGTH_CALCULATOR]) {
      this[LENGTH_CALCULATOR] = lC;
      this[LENGTH] = 0;
      this[LRU_LIST].forEach(hit => {
        hit.length = this[LENGTH_CALCULATOR](hit.value, hit.key);
        this[LENGTH] += hit.length;
      });
    }
    trim(this);
  }
  get lengthCalculator () { return this[LENGTH_CALCULATOR] }

  get length () { return this[LENGTH] }
  get itemCount () { return this[LRU_LIST].length }

  rforEach (fn, thisp) {
    thisp = thisp || this;
    for (let walker = this[LRU_LIST].tail; walker !== null;) {
      const prev = walker.prev;
      forEachStep(this, fn, walker, thisp);
      walker = prev;
    }
  }

  forEach (fn, thisp) {
    thisp = thisp || this;
    for (let walker = this[LRU_LIST].head; walker !== null;) {
      const next = walker.next;
      forEachStep(this, fn, walker, thisp);
      walker = next;
    }
  }

  keys () {
    return this[LRU_LIST].toArray().map(k => k.key)
  }

  values () {
    return this[LRU_LIST].toArray().map(k => k.value)
  }

  reset () {
    if (this[DISPOSE] &&
        this[LRU_LIST] &&
        this[LRU_LIST].length) {
      this[LRU_LIST].forEach(hit => this[DISPOSE](hit.key, hit.value));
    }

    this[CACHE] = new Map(); // hash of items by key
    this[LRU_LIST] = new Yallist(); // list of items in order of use recency
    this[LENGTH] = 0; // length of items in the list
  }

  dump () {
    return this[LRU_LIST].map(hit =>
      isStale(this, hit) ? false : {
        k: hit.key,
        v: hit.value,
        e: hit.now + (hit.maxAge || 0)
      }).toArray().filter(h => h)
  }

  dumpLru () {
    return this[LRU_LIST]
  }

  set (key, value, maxAge) {
    maxAge = maxAge || this[MAX_AGE];

    if (maxAge && typeof maxAge !== 'number')
      throw new TypeError('maxAge must be a number')

    const now = maxAge ? Date.now() : 0;
    const len = this[LENGTH_CALCULATOR](value, key);

    if (this[CACHE].has(key)) {
      if (len > this[MAX]) {
        del(this, this[CACHE].get(key));
        return false
      }

      const node = this[CACHE].get(key);
      const item = node.value;

      // dispose of the old one before overwriting
      // split out into 2 ifs for better coverage tracking
      if (this[DISPOSE]) {
        if (!this[NO_DISPOSE_ON_SET])
          this[DISPOSE](key, item.value);
      }

      item.now = now;
      item.maxAge = maxAge;
      item.value = value;
      this[LENGTH] += len - item.length;
      item.length = len;
      this.get(key);
      trim(this);
      return true
    }

    const hit = new Entry(key, value, len, now, maxAge);

    // oversized objects fall out of cache automatically.
    if (hit.length > this[MAX]) {
      if (this[DISPOSE])
        this[DISPOSE](key, value);

      return false
    }

    this[LENGTH] += hit.length;
    this[LRU_LIST].unshift(hit);
    this[CACHE].set(key, this[LRU_LIST].head);
    trim(this);
    return true
  }

  has (key) {
    if (!this[CACHE].has(key)) return false
    const hit = this[CACHE].get(key).value;
    return !isStale(this, hit)
  }

  get (key) {
    return get(this, key, true)
  }

  peek (key) {
    return get(this, key, false)
  }

  pop () {
    const node = this[LRU_LIST].tail;
    if (!node)
      return null

    del(this, node);
    return node.value
  }

  del (key) {
    del(this, this[CACHE].get(key));
  }

  load (arr) {
    // reset the cache
    this.reset();

    const now = Date.now();
    // A previous serialized cache has the most recent items first
    for (let l = arr.length - 1; l >= 0; l--) {
      const hit = arr[l];
      const expiresAt = hit.e || 0;
      if (expiresAt === 0)
        // the item was created without expiration in a non aged cache
        this.set(hit.k, hit.v);
      else {
        const maxAge = expiresAt - now;
        // dont add already expired items
        if (maxAge > 0) {
          this.set(hit.k, hit.v, maxAge);
        }
      }
    }
  }

  prune () {
    this[CACHE].forEach((value, key) => get(this, key, false));
  }
}

const get = (self, key, doUse) => {
  const node = self[CACHE].get(key);
  if (node) {
    const hit = node.value;
    if (isStale(self, hit)) {
      del(self, node);
      if (!self[ALLOW_STALE])
        return undefined
    } else {
      if (doUse) {
        if (self[UPDATE_AGE_ON_GET])
          node.value.now = Date.now();
        self[LRU_LIST].unshiftNode(node);
      }
    }
    return hit.value
  }
};

const isStale = (self, hit) => {
  if (!hit || (!hit.maxAge && !self[MAX_AGE]))
    return false

  const diff = Date.now() - hit.now;
  return hit.maxAge ? diff > hit.maxAge
    : self[MAX_AGE] && (diff > self[MAX_AGE])
};

const trim = self => {
  if (self[LENGTH] > self[MAX]) {
    for (let walker = self[LRU_LIST].tail;
      self[LENGTH] > self[MAX] && walker !== null;) {
      // We know that we're about to delete this one, and also
      // what the next least recently used key will be, so just
      // go ahead and set it now.
      const prev = walker.prev;
      del(self, walker);
      walker = prev;
    }
  }
};

const del = (self, node) => {
  if (node) {
    const hit = node.value;
    if (self[DISPOSE])
      self[DISPOSE](hit.key, hit.value);

    self[LENGTH] -= hit.length;
    self[CACHE].delete(hit.key);
    self[LRU_LIST].removeNode(node);
  }
};

class Entry {
  constructor (key, value, length, now, maxAge) {
    this.key = key;
    this.value = value;
    this.length = length;
    this.now = now;
    this.maxAge = maxAge || 0;
  }
}

const forEachStep = (self, fn, node, thisp) => {
  let hit = node.value;
  if (isStale(self, hit)) {
    del(self, node);
    if (!self[ALLOW_STALE])
      hit = undefined;
  }
  if (hit)
    fn.call(thisp, hit.value, hit.key, self);
};

var lruCache = LRUCache;

// hoisted class for cyclic dependency
class Range$a {
  constructor (range, options) {
    options = parseOptions$1(options);

    if (range instanceof Range$a) {
      if (
        range.loose === !!options.loose &&
        range.includePrerelease === !!options.includePrerelease
      ) {
        return range
      } else {
        return new Range$a(range.raw, options)
      }
    }

    if (range instanceof Comparator$3) {
      // just put it in the set and return
      this.raw = range.value;
      this.set = [[range]];
      this.format();
      return this
    }

    this.options = options;
    this.loose = !!options.loose;
    this.includePrerelease = !!options.includePrerelease;

    // First, split based on boolean or ||
    this.raw = range;
    this.set = range
      .split(/\s*\|\|\s*/)
      // map the range to a 2d array of comparators
      .map(range => this.parseRange(range.trim()))
      // throw out any comparator lists that are empty
      // this generally means that it was not a valid range, which is allowed
      // in loose mode, but will still throw if the WHOLE range is invalid.
      .filter(c => c.length);

    if (!this.set.length) {
      throw new TypeError(`Invalid SemVer Range: ${range}`)
    }

    // if we have any that are not the null set, throw out null sets.
    if (this.set.length > 1) {
      // keep the first one, in case they're all null sets
      const first = this.set[0];
      this.set = this.set.filter(c => !isNullSet(c[0]));
      if (this.set.length === 0)
        this.set = [first];
      else if (this.set.length > 1) {
        // if we have any that are *, then the range is just *
        for (const c of this.set) {
          if (c.length === 1 && isAny(c[0])) {
            this.set = [c];
            break
          }
        }
      }
    }

    this.format();
  }

  format () {
    this.range = this.set
      .map((comps) => {
        return comps.join(' ').trim()
      })
      .join('||')
      .trim();
    return this.range
  }

  toString () {
    return this.range
  }

  parseRange (range) {
    range = range.trim();

    // memoize range parsing for performance.
    // this is a very hot path, and fully deterministic.
    const memoOpts = Object.keys(this.options).join(',');
    const memoKey = `parseRange:${memoOpts}:${range}`;
    const cached = cache.get(memoKey);
    if (cached)
      return cached

    const loose = this.options.loose;
    // `1.2.3 - 1.2.4` => `>=1.2.3 <=1.2.4`
    const hr = loose ? re$1[t$1.HYPHENRANGELOOSE] : re$1[t$1.HYPHENRANGE];
    range = range.replace(hr, hyphenReplace(this.options.includePrerelease));
    debug$1('hyphen replace', range);
    // `> 1.2.3 < 1.2.5` => `>1.2.3 <1.2.5`
    range = range.replace(re$1[t$1.COMPARATORTRIM], comparatorTrimReplace);
    debug$1('comparator trim', range, re$1[t$1.COMPARATORTRIM]);

    // `~ 1.2.3` => `~1.2.3`
    range = range.replace(re$1[t$1.TILDETRIM], tildeTrimReplace);

    // `^ 1.2.3` => `^1.2.3`
    range = range.replace(re$1[t$1.CARETTRIM], caretTrimReplace);

    // normalize spaces
    range = range.split(/\s+/).join(' ');

    // At this point, the range is completely trimmed and
    // ready to be split into comparators.

    const compRe = loose ? re$1[t$1.COMPARATORLOOSE] : re$1[t$1.COMPARATOR];
    const rangeList = range
      .split(' ')
      .map(comp => parseComparator(comp, this.options))
      .join(' ')
      .split(/\s+/)
      // >=0.0.0 is equivalent to *
      .map(comp => replaceGTE0(comp, this.options))
      // in loose mode, throw out any that are not valid comparators
      .filter(this.options.loose ? comp => !!comp.match(compRe) : () => true)
      .map(comp => new Comparator$3(comp, this.options));

    // if any comparators are the null set, then replace with JUST null set
    // if more than one comparator, remove any * comparators
    // also, don't include the same comparator more than once
    rangeList.length;
    const rangeMap = new Map();
    for (const comp of rangeList) {
      if (isNullSet(comp))
        return [comp]
      rangeMap.set(comp.value, comp);
    }
    if (rangeMap.size > 1 && rangeMap.has(''))
      rangeMap.delete('');

    const result = [...rangeMap.values()];
    cache.set(memoKey, result);
    return result
  }

  intersects (range, options) {
    if (!(range instanceof Range$a)) {
      throw new TypeError('a Range is required')
    }

    return this.set.some((thisComparators) => {
      return (
        isSatisfiable(thisComparators, options) &&
        range.set.some((rangeComparators) => {
          return (
            isSatisfiable(rangeComparators, options) &&
            thisComparators.every((thisComparator) => {
              return rangeComparators.every((rangeComparator) => {
                return thisComparator.intersects(rangeComparator, options)
              })
            })
          )
        })
      )
    })
  }

  // if ANY of the sets match ALL of its comparators, then pass
  test (version) {
    if (!version) {
      return false
    }

    if (typeof version === 'string') {
      try {
        version = new SemVer$5(version, this.options);
      } catch (er) {
        return false
      }
    }

    for (let i = 0; i < this.set.length; i++) {
      if (testSet(this.set[i], version, this.options)) {
        return true
      }
    }
    return false
  }
}
var range = Range$a;

const LRU = lruCache;
const cache = new LRU({ max: 1000 });

const parseOptions$1 = parseOptions_1;
const Comparator$3 = comparator;
const debug$1 = debug_1;
const SemVer$5 = semver$2;
const {
  re: re$1,
  t: t$1,
  comparatorTrimReplace,
  tildeTrimReplace,
  caretTrimReplace
} = re$5.exports;

const isNullSet = c => c.value === '<0.0.0-0';
const isAny = c => c.value === '';

// take a set of comparators and determine whether there
// exists a version which can satisfy it
const isSatisfiable = (comparators, options) => {
  let result = true;
  const remainingComparators = comparators.slice();
  let testComparator = remainingComparators.pop();

  while (result && remainingComparators.length) {
    result = remainingComparators.every((otherComparator) => {
      return testComparator.intersects(otherComparator, options)
    });

    testComparator = remainingComparators.pop();
  }

  return result
};

// comprised of xranges, tildes, stars, and gtlt's at this point.
// already replaced the hyphen ranges
// turn into a set of JUST comparators.
const parseComparator = (comp, options) => {
  debug$1('comp', comp, options);
  comp = replaceCarets(comp, options);
  debug$1('caret', comp);
  comp = replaceTildes(comp, options);
  debug$1('tildes', comp);
  comp = replaceXRanges(comp, options);
  debug$1('xrange', comp);
  comp = replaceStars(comp, options);
  debug$1('stars', comp);
  return comp
};

const isX = id => !id || id.toLowerCase() === 'x' || id === '*';

// ~, ~> --> * (any, kinda silly)
// ~2, ~2.x, ~2.x.x, ~>2, ~>2.x ~>2.x.x --> >=2.0.0 <3.0.0-0
// ~2.0, ~2.0.x, ~>2.0, ~>2.0.x --> >=2.0.0 <2.1.0-0
// ~1.2, ~1.2.x, ~>1.2, ~>1.2.x --> >=1.2.0 <1.3.0-0
// ~1.2.3, ~>1.2.3 --> >=1.2.3 <1.3.0-0
// ~1.2.0, ~>1.2.0 --> >=1.2.0 <1.3.0-0
const replaceTildes = (comp, options) =>
  comp.trim().split(/\s+/).map((comp) => {
    return replaceTilde(comp, options)
  }).join(' ');

const replaceTilde = (comp, options) => {
  const r = options.loose ? re$1[t$1.TILDELOOSE] : re$1[t$1.TILDE];
  return comp.replace(r, (_, M, m, p, pr) => {
    debug$1('tilde', comp, _, M, m, p, pr);
    let ret;

    if (isX(M)) {
      ret = '';
    } else if (isX(m)) {
      ret = `>=${M}.0.0 <${+M + 1}.0.0-0`;
    } else if (isX(p)) {
      // ~1.2 == >=1.2.0 <1.3.0-0
      ret = `>=${M}.${m}.0 <${M}.${+m + 1}.0-0`;
    } else if (pr) {
      debug$1('replaceTilde pr', pr);
      ret = `>=${M}.${m}.${p}-${pr
      } <${M}.${+m + 1}.0-0`;
    } else {
      // ~1.2.3 == >=1.2.3 <1.3.0-0
      ret = `>=${M}.${m}.${p
      } <${M}.${+m + 1}.0-0`;
    }

    debug$1('tilde return', ret);
    return ret
  })
};

// ^ --> * (any, kinda silly)
// ^2, ^2.x, ^2.x.x --> >=2.0.0 <3.0.0-0
// ^2.0, ^2.0.x --> >=2.0.0 <3.0.0-0
// ^1.2, ^1.2.x --> >=1.2.0 <2.0.0-0
// ^1.2.3 --> >=1.2.3 <2.0.0-0
// ^1.2.0 --> >=1.2.0 <2.0.0-0
const replaceCarets = (comp, options) =>
  comp.trim().split(/\s+/).map((comp) => {
    return replaceCaret(comp, options)
  }).join(' ');

const replaceCaret = (comp, options) => {
  debug$1('caret', comp, options);
  const r = options.loose ? re$1[t$1.CARETLOOSE] : re$1[t$1.CARET];
  const z = options.includePrerelease ? '-0' : '';
  return comp.replace(r, (_, M, m, p, pr) => {
    debug$1('caret', comp, _, M, m, p, pr);
    let ret;

    if (isX(M)) {
      ret = '';
    } else if (isX(m)) {
      ret = `>=${M}.0.0${z} <${+M + 1}.0.0-0`;
    } else if (isX(p)) {
      if (M === '0') {
        ret = `>=${M}.${m}.0${z} <${M}.${+m + 1}.0-0`;
      } else {
        ret = `>=${M}.${m}.0${z} <${+M + 1}.0.0-0`;
      }
    } else if (pr) {
      debug$1('replaceCaret pr', pr);
      if (M === '0') {
        if (m === '0') {
          ret = `>=${M}.${m}.${p}-${pr
          } <${M}.${m}.${+p + 1}-0`;
        } else {
          ret = `>=${M}.${m}.${p}-${pr
          } <${M}.${+m + 1}.0-0`;
        }
      } else {
        ret = `>=${M}.${m}.${p}-${pr
        } <${+M + 1}.0.0-0`;
      }
    } else {
      debug$1('no pr');
      if (M === '0') {
        if (m === '0') {
          ret = `>=${M}.${m}.${p
          }${z} <${M}.${m}.${+p + 1}-0`;
        } else {
          ret = `>=${M}.${m}.${p
          }${z} <${M}.${+m + 1}.0-0`;
        }
      } else {
        ret = `>=${M}.${m}.${p
        } <${+M + 1}.0.0-0`;
      }
    }

    debug$1('caret return', ret);
    return ret
  })
};

const replaceXRanges = (comp, options) => {
  debug$1('replaceXRanges', comp, options);
  return comp.split(/\s+/).map((comp) => {
    return replaceXRange(comp, options)
  }).join(' ')
};

const replaceXRange = (comp, options) => {
  comp = comp.trim();
  const r = options.loose ? re$1[t$1.XRANGELOOSE] : re$1[t$1.XRANGE];
  return comp.replace(r, (ret, gtlt, M, m, p, pr) => {
    debug$1('xRange', comp, ret, gtlt, M, m, p, pr);
    const xM = isX(M);
    const xm = xM || isX(m);
    const xp = xm || isX(p);
    const anyX = xp;

    if (gtlt === '=' && anyX) {
      gtlt = '';
    }

    // if we're including prereleases in the match, then we need
    // to fix this to -0, the lowest possible prerelease value
    pr = options.includePrerelease ? '-0' : '';

    if (xM) {
      if (gtlt === '>' || gtlt === '<') {
        // nothing is allowed
        ret = '<0.0.0-0';
      } else {
        // nothing is forbidden
        ret = '*';
      }
    } else if (gtlt && anyX) {
      // we know patch is an x, because we have any x at all.
      // replace X with 0
      if (xm) {
        m = 0;
      }
      p = 0;

      if (gtlt === '>') {
        // >1 => >=2.0.0
        // >1.2 => >=1.3.0
        gtlt = '>=';
        if (xm) {
          M = +M + 1;
          m = 0;
          p = 0;
        } else {
          m = +m + 1;
          p = 0;
        }
      } else if (gtlt === '<=') {
        // <=0.7.x is actually <0.8.0, since any 0.7.x should
        // pass.  Similarly, <=7.x is actually <8.0.0, etc.
        gtlt = '<';
        if (xm) {
          M = +M + 1;
        } else {
          m = +m + 1;
        }
      }

      if (gtlt === '<')
        pr = '-0';

      ret = `${gtlt + M}.${m}.${p}${pr}`;
    } else if (xm) {
      ret = `>=${M}.0.0${pr} <${+M + 1}.0.0-0`;
    } else if (xp) {
      ret = `>=${M}.${m}.0${pr
      } <${M}.${+m + 1}.0-0`;
    }

    debug$1('xRange return', ret);

    return ret
  })
};

// Because * is AND-ed with everything else in the comparator,
// and '' means "any version", just remove the *s entirely.
const replaceStars = (comp, options) => {
  debug$1('replaceStars', comp, options);
  // Looseness is ignored here.  star is always as loose as it gets!
  return comp.trim().replace(re$1[t$1.STAR], '')
};

const replaceGTE0 = (comp, options) => {
  debug$1('replaceGTE0', comp, options);
  return comp.trim()
    .replace(re$1[options.includePrerelease ? t$1.GTE0PRE : t$1.GTE0], '')
};

// This function is passed to string.replace(re[t.HYPHENRANGE])
// M, m, patch, prerelease, build
// 1.2 - 3.4.5 => >=1.2.0 <=3.4.5
// 1.2.3 - 3.4 => >=1.2.0 <3.5.0-0 Any 3.4.x will do
// 1.2 - 3.4 => >=1.2.0 <3.5.0-0
const hyphenReplace = incPr => ($0,
  from, fM, fm, fp, fpr, fb,
  to, tM, tm, tp, tpr, tb) => {
  if (isX(fM)) {
    from = '';
  } else if (isX(fm)) {
    from = `>=${fM}.0.0${incPr ? '-0' : ''}`;
  } else if (isX(fp)) {
    from = `>=${fM}.${fm}.0${incPr ? '-0' : ''}`;
  } else if (fpr) {
    from = `>=${from}`;
  } else {
    from = `>=${from}${incPr ? '-0' : ''}`;
  }

  if (isX(tM)) {
    to = '';
  } else if (isX(tm)) {
    to = `<${+tM + 1}.0.0-0`;
  } else if (isX(tp)) {
    to = `<${tM}.${+tm + 1}.0-0`;
  } else if (tpr) {
    to = `<=${tM}.${tm}.${tp}-${tpr}`;
  } else if (incPr) {
    to = `<${tM}.${tm}.${+tp + 1}-0`;
  } else {
    to = `<=${to}`;
  }

  return (`${from} ${to}`).trim()
};

const testSet = (set, version, options) => {
  for (let i = 0; i < set.length; i++) {
    if (!set[i].test(version)) {
      return false
    }
  }

  if (version.prerelease.length && !options.includePrerelease) {
    // Find the set of versions that are allowed to have prereleases
    // For example, ^1.2.3-pr.1 desugars to >=1.2.3-pr.1 <2.0.0
    // That should allow `1.2.3-pr.2` to pass.
    // However, `1.2.4-alpha.notready` should NOT be allowed,
    // even though it's within the range set by the comparators.
    for (let i = 0; i < set.length; i++) {
      debug$1(set[i].semver);
      if (set[i].semver === Comparator$3.ANY) {
        continue
      }

      if (set[i].semver.prerelease.length > 0) {
        const allowed = set[i].semver;
        if (allowed.major === version.major &&
            allowed.minor === version.minor &&
            allowed.patch === version.patch) {
          return true
        }
      }
    }

    // Version has a -pre, but it's not one of the ones we like.
    return false
  }

  return true
};

const ANY$2 = Symbol('SemVer ANY');
// hoisted class for cyclic dependency
class Comparator$2 {
  static get ANY () {
    return ANY$2
  }
  constructor (comp, options) {
    options = parseOptions(options);

    if (comp instanceof Comparator$2) {
      if (comp.loose === !!options.loose) {
        return comp
      } else {
        comp = comp.value;
      }
    }

    debug('comparator', comp, options);
    this.options = options;
    this.loose = !!options.loose;
    this.parse(comp);

    if (this.semver === ANY$2) {
      this.value = '';
    } else {
      this.value = this.operator + this.semver.version;
    }

    debug('comp', this);
  }

  parse (comp) {
    const r = this.options.loose ? re[t.COMPARATORLOOSE] : re[t.COMPARATOR];
    const m = comp.match(r);

    if (!m) {
      throw new TypeError(`Invalid comparator: ${comp}`)
    }

    this.operator = m[1] !== undefined ? m[1] : '';
    if (this.operator === '=') {
      this.operator = '';
    }

    // if it literally is just '>' or '' then allow anything.
    if (!m[2]) {
      this.semver = ANY$2;
    } else {
      this.semver = new SemVer$4(m[2], this.options.loose);
    }
  }

  toString () {
    return this.value
  }

  test (version) {
    debug('Comparator.test', version, this.options.loose);

    if (this.semver === ANY$2 || version === ANY$2) {
      return true
    }

    if (typeof version === 'string') {
      try {
        version = new SemVer$4(version, this.options);
      } catch (er) {
        return false
      }
    }

    return cmp(version, this.operator, this.semver, this.options)
  }

  intersects (comp, options) {
    if (!(comp instanceof Comparator$2)) {
      throw new TypeError('a Comparator is required')
    }

    if (!options || typeof options !== 'object') {
      options = {
        loose: !!options,
        includePrerelease: false
      };
    }

    if (this.operator === '') {
      if (this.value === '') {
        return true
      }
      return new Range$9(comp.value, options).test(this.value)
    } else if (comp.operator === '') {
      if (comp.value === '') {
        return true
      }
      return new Range$9(this.value, options).test(comp.semver)
    }

    const sameDirectionIncreasing =
      (this.operator === '>=' || this.operator === '>') &&
      (comp.operator === '>=' || comp.operator === '>');
    const sameDirectionDecreasing =
      (this.operator === '<=' || this.operator === '<') &&
      (comp.operator === '<=' || comp.operator === '<');
    const sameSemVer = this.semver.version === comp.semver.version;
    const differentDirectionsInclusive =
      (this.operator === '>=' || this.operator === '<=') &&
      (comp.operator === '>=' || comp.operator === '<=');
    const oppositeDirectionsLessThan =
      cmp(this.semver, '<', comp.semver, options) &&
      (this.operator === '>=' || this.operator === '>') &&
        (comp.operator === '<=' || comp.operator === '<');
    const oppositeDirectionsGreaterThan =
      cmp(this.semver, '>', comp.semver, options) &&
      (this.operator === '<=' || this.operator === '<') &&
        (comp.operator === '>=' || comp.operator === '>');

    return (
      sameDirectionIncreasing ||
      sameDirectionDecreasing ||
      (sameSemVer && differentDirectionsInclusive) ||
      oppositeDirectionsLessThan ||
      oppositeDirectionsGreaterThan
    )
  }
}

var comparator = Comparator$2;

const parseOptions = parseOptions_1;
const {re, t} = re$5.exports;
const cmp = cmp_1;
const debug = debug_1;
const SemVer$4 = semver$2;
const Range$9 = range;

const Range$8 = range;
const satisfies$3 = (version, range, options) => {
  try {
    range = new Range$8(range, options);
  } catch (er) {
    return false
  }
  return range.test(version)
};
var satisfies_1 = satisfies$3;

const Range$7 = range;

// Mostly just for testing and legacy API reasons
const toComparators = (range, options) =>
  new Range$7(range, options).set
    .map(comp => comp.map(c => c.value).join(' ').trim().split(' '));

var toComparators_1 = toComparators;

const SemVer$3 = semver$2;
const Range$6 = range;

const maxSatisfying = (versions, range, options) => {
  let max = null;
  let maxSV = null;
  let rangeObj = null;
  try {
    rangeObj = new Range$6(range, options);
  } catch (er) {
    return null
  }
  versions.forEach((v) => {
    if (rangeObj.test(v)) {
      // satisfies(v, range, options)
      if (!max || maxSV.compare(v) === -1) {
        // compare(max, v, true)
        max = v;
        maxSV = new SemVer$3(max, options);
      }
    }
  });
  return max
};
var maxSatisfying_1 = maxSatisfying;

const SemVer$2 = semver$2;
const Range$5 = range;
const minSatisfying = (versions, range, options) => {
  let min = null;
  let minSV = null;
  let rangeObj = null;
  try {
    rangeObj = new Range$5(range, options);
  } catch (er) {
    return null
  }
  versions.forEach((v) => {
    if (rangeObj.test(v)) {
      // satisfies(v, range, options)
      if (!min || minSV.compare(v) === 1) {
        // compare(min, v, true)
        min = v;
        minSV = new SemVer$2(min, options);
      }
    }
  });
  return min
};
var minSatisfying_1 = minSatisfying;

const SemVer$1 = semver$2;
const Range$4 = range;
const gt$1 = gt_1;

const minVersion = (range, loose) => {
  range = new Range$4(range, loose);

  let minver = new SemVer$1('0.0.0');
  if (range.test(minver)) {
    return minver
  }

  minver = new SemVer$1('0.0.0-0');
  if (range.test(minver)) {
    return minver
  }

  minver = null;
  for (let i = 0; i < range.set.length; ++i) {
    const comparators = range.set[i];

    let setMin = null;
    comparators.forEach((comparator) => {
      // Clone to avoid manipulating the comparator's semver object.
      const compver = new SemVer$1(comparator.semver.version);
      switch (comparator.operator) {
        case '>':
          if (compver.prerelease.length === 0) {
            compver.patch++;
          } else {
            compver.prerelease.push(0);
          }
          compver.raw = compver.format();
          /* fallthrough */
        case '':
        case '>=':
          if (!setMin || gt$1(compver, setMin)) {
            setMin = compver;
          }
          break
        case '<':
        case '<=':
          /* Ignore maximum versions */
          break
        /* istanbul ignore next */
        default:
          throw new Error(`Unexpected operation: ${comparator.operator}`)
      }
    });
    if (setMin && (!minver || gt$1(minver, setMin)))
      minver = setMin;
  }

  if (minver && range.test(minver)) {
    return minver
  }

  return null
};
var minVersion_1 = minVersion;

const Range$3 = range;
const validRange = (range, options) => {
  try {
    // Return '*' instead of '' so that truthiness works.
    // This will throw if it's invalid anyway
    return new Range$3(range, options).range || '*'
  } catch (er) {
    return null
  }
};
var valid = validRange;

const SemVer = semver$2;
const Comparator$1 = comparator;
const {ANY: ANY$1} = Comparator$1;
const Range$2 = range;
const satisfies$2 = satisfies_1;
const gt = gt_1;
const lt = lt_1;
const lte = lte_1;
const gte = gte_1;

const outside$2 = (version, range, hilo, options) => {
  version = new SemVer(version, options);
  range = new Range$2(range, options);

  let gtfn, ltefn, ltfn, comp, ecomp;
  switch (hilo) {
    case '>':
      gtfn = gt;
      ltefn = lte;
      ltfn = lt;
      comp = '>';
      ecomp = '>=';
      break
    case '<':
      gtfn = lt;
      ltefn = gte;
      ltfn = gt;
      comp = '<';
      ecomp = '<=';
      break
    default:
      throw new TypeError('Must provide a hilo val of "<" or ">"')
  }

  // If it satisfies the range it is not outside
  if (satisfies$2(version, range, options)) {
    return false
  }

  // From now on, variable terms are as if we're in "gtr" mode.
  // but note that everything is flipped for the "ltr" function.

  for (let i = 0; i < range.set.length; ++i) {
    const comparators = range.set[i];

    let high = null;
    let low = null;

    comparators.forEach((comparator) => {
      if (comparator.semver === ANY$1) {
        comparator = new Comparator$1('>=0.0.0');
      }
      high = high || comparator;
      low = low || comparator;
      if (gtfn(comparator.semver, high.semver, options)) {
        high = comparator;
      } else if (ltfn(comparator.semver, low.semver, options)) {
        low = comparator;
      }
    });

    // If the edge version comparator has a operator then our version
    // isn't outside it
    if (high.operator === comp || high.operator === ecomp) {
      return false
    }

    // If the lowest version comparator has an operator and our version
    // is less than it then it isn't higher than the range
    if ((!low.operator || low.operator === comp) &&
        ltefn(version, low.semver)) {
      return false
    } else if (low.operator === ecomp && ltfn(version, low.semver)) {
      return false
    }
  }
  return true
};

var outside_1 = outside$2;

// Determine if version is greater than all the versions possible in the range.
const outside$1 = outside_1;
const gtr = (version, range, options) => outside$1(version, range, '>', options);
var gtr_1 = gtr;

const outside = outside_1;
// Determine if version is less than all the versions possible in the range
const ltr = (version, range, options) => outside(version, range, '<', options);
var ltr_1 = ltr;

const Range$1 = range;
const intersects = (r1, r2, options) => {
  r1 = new Range$1(r1, options);
  r2 = new Range$1(r2, options);
  return r1.intersects(r2)
};
var intersects_1 = intersects;

// given a set of versions and a range, create a "simplified" range
// that includes the same versions that the original range does
// If the original range is shorter than the simplified one, return that.
const satisfies$1 = satisfies_1;
const compare$1 = compare_1;
var simplify = (versions, range, options) => {
  const set = [];
  let min = null;
  let prev = null;
  const v = versions.sort((a, b) => compare$1(a, b, options));
  for (const version of v) {
    const included = satisfies$1(version, range, options);
    if (included) {
      prev = version;
      if (!min)
        min = version;
    } else {
      if (prev) {
        set.push([min, prev]);
      }
      prev = null;
      min = null;
    }
  }
  if (min)
    set.push([min, null]);

  const ranges = [];
  for (const [min, max] of set) {
    if (min === max)
      ranges.push(min);
    else if (!max && min === v[0])
      ranges.push('*');
    else if (!max)
      ranges.push(`>=${min}`);
    else if (min === v[0])
      ranges.push(`<=${max}`);
    else
      ranges.push(`${min} - ${max}`);
  }
  const simplified = ranges.join(' || ');
  const original = typeof range.raw === 'string' ? range.raw : String(range);
  return simplified.length < original.length ? simplified : range
};

const Range = range;
const Comparator = comparator;
const { ANY } = Comparator;
const satisfies = satisfies_1;
const compare = compare_1;

// Complex range `r1 || r2 || ...` is a subset of `R1 || R2 || ...` iff:
// - Every simple range `r1, r2, ...` is a null set, OR
// - Every simple range `r1, r2, ...` which is not a null set is a subset of
//   some `R1, R2, ...`
//
// Simple range `c1 c2 ...` is a subset of simple range `C1 C2 ...` iff:
// - If c is only the ANY comparator
//   - If C is only the ANY comparator, return true
//   - Else if in prerelease mode, return false
//   - else replace c with `[>=0.0.0]`
// - If C is only the ANY comparator
//   - if in prerelease mode, return true
//   - else replace C with `[>=0.0.0]`
// - Let EQ be the set of = comparators in c
// - If EQ is more than one, return true (null set)
// - Let GT be the highest > or >= comparator in c
// - Let LT be the lowest < or <= comparator in c
// - If GT and LT, and GT.semver > LT.semver, return true (null set)
// - If any C is a = range, and GT or LT are set, return false
// - If EQ
//   - If GT, and EQ does not satisfy GT, return true (null set)
//   - If LT, and EQ does not satisfy LT, return true (null set)
//   - If EQ satisfies every C, return true
//   - Else return false
// - If GT
//   - If GT.semver is lower than any > or >= comp in C, return false
//   - If GT is >=, and GT.semver does not satisfy every C, return false
//   - If GT.semver has a prerelease, and not in prerelease mode
//     - If no C has a prerelease and the GT.semver tuple, return false
// - If LT
//   - If LT.semver is greater than any < or <= comp in C, return false
//   - If LT is <=, and LT.semver does not satisfy every C, return false
//   - If GT.semver has a prerelease, and not in prerelease mode
//     - If no C has a prerelease and the LT.semver tuple, return false
// - Else return true

const subset = (sub, dom, options = {}) => {
  if (sub === dom)
    return true

  sub = new Range(sub, options);
  dom = new Range(dom, options);
  let sawNonNull = false;

  OUTER: for (const simpleSub of sub.set) {
    for (const simpleDom of dom.set) {
      const isSub = simpleSubset(simpleSub, simpleDom, options);
      sawNonNull = sawNonNull || isSub !== null;
      if (isSub)
        continue OUTER
    }
    // the null set is a subset of everything, but null simple ranges in
    // a complex range should be ignored.  so if we saw a non-null range,
    // then we know this isn't a subset, but if EVERY simple range was null,
    // then it is a subset.
    if (sawNonNull)
      return false
  }
  return true
};

const simpleSubset = (sub, dom, options) => {
  if (sub === dom)
    return true

  if (sub.length === 1 && sub[0].semver === ANY) {
    if (dom.length === 1 && dom[0].semver === ANY)
      return true
    else if (options.includePrerelease)
      sub = [ new Comparator('>=0.0.0-0') ];
    else
      sub = [ new Comparator('>=0.0.0') ];
  }

  if (dom.length === 1 && dom[0].semver === ANY) {
    if (options.includePrerelease)
      return true
    else
      dom = [ new Comparator('>=0.0.0') ];
  }

  const eqSet = new Set();
  let gt, lt;
  for (const c of sub) {
    if (c.operator === '>' || c.operator === '>=')
      gt = higherGT(gt, c, options);
    else if (c.operator === '<' || c.operator === '<=')
      lt = lowerLT(lt, c, options);
    else
      eqSet.add(c.semver);
  }

  if (eqSet.size > 1)
    return null

  let gtltComp;
  if (gt && lt) {
    gtltComp = compare(gt.semver, lt.semver, options);
    if (gtltComp > 0)
      return null
    else if (gtltComp === 0 && (gt.operator !== '>=' || lt.operator !== '<='))
      return null
  }

  // will iterate one or zero times
  for (const eq of eqSet) {
    if (gt && !satisfies(eq, String(gt), options))
      return null

    if (lt && !satisfies(eq, String(lt), options))
      return null

    for (const c of dom) {
      if (!satisfies(eq, String(c), options))
        return false
    }

    return true
  }

  let higher, lower;
  let hasDomLT, hasDomGT;
  // if the subset has a prerelease, we need a comparator in the superset
  // with the same tuple and a prerelease, or it's not a subset
  let needDomLTPre = lt &&
    !options.includePrerelease &&
    lt.semver.prerelease.length ? lt.semver : false;
  let needDomGTPre = gt &&
    !options.includePrerelease &&
    gt.semver.prerelease.length ? gt.semver : false;
  // exception: <1.2.3-0 is the same as <1.2.3
  if (needDomLTPre && needDomLTPre.prerelease.length === 1 &&
      lt.operator === '<' && needDomLTPre.prerelease[0] === 0) {
    needDomLTPre = false;
  }

  for (const c of dom) {
    hasDomGT = hasDomGT || c.operator === '>' || c.operator === '>=';
    hasDomLT = hasDomLT || c.operator === '<' || c.operator === '<=';
    if (gt) {
      if (needDomGTPre) {
        if (c.semver.prerelease && c.semver.prerelease.length &&
            c.semver.major === needDomGTPre.major &&
            c.semver.minor === needDomGTPre.minor &&
            c.semver.patch === needDomGTPre.patch) {
          needDomGTPre = false;
        }
      }
      if (c.operator === '>' || c.operator === '>=') {
        higher = higherGT(gt, c, options);
        if (higher === c && higher !== gt)
          return false
      } else if (gt.operator === '>=' && !satisfies(gt.semver, String(c), options))
        return false
    }
    if (lt) {
      if (needDomLTPre) {
        if (c.semver.prerelease && c.semver.prerelease.length &&
            c.semver.major === needDomLTPre.major &&
            c.semver.minor === needDomLTPre.minor &&
            c.semver.patch === needDomLTPre.patch) {
          needDomLTPre = false;
        }
      }
      if (c.operator === '<' || c.operator === '<=') {
        lower = lowerLT(lt, c, options);
        if (lower === c && lower !== lt)
          return false
      } else if (lt.operator === '<=' && !satisfies(lt.semver, String(c), options))
        return false
    }
    if (!c.operator && (lt || gt) && gtltComp !== 0)
      return false
  }

  // if there was a < or >, and nothing in the dom, then must be false
  // UNLESS it was limited by another range in the other direction.
  // Eg, >1.0.0 <1.0.1 is still a subset of <2.0.0
  if (gt && hasDomLT && !lt && gtltComp !== 0)
    return false

  if (lt && hasDomGT && !gt && gtltComp !== 0)
    return false

  // we needed a prerelease range in a specific tuple, but didn't get one
  // then this isn't a subset.  eg >=1.2.3-pre is not a subset of >=1.0.0,
  // because it includes prereleases in the 1.2.3 tuple
  if (needDomGTPre || needDomLTPre)
    return false

  return true
};

// >=1.2.3 is lower than >1.2.3
const higherGT = (a, b, options) => {
  if (!a)
    return b
  const comp = compare(a.semver, b.semver, options);
  return comp > 0 ? a
    : comp < 0 ? b
    : b.operator === '>' && a.operator === '>=' ? b
    : a
};

// <=1.2.3 is higher than <1.2.3
const lowerLT = (a, b, options) => {
  if (!a)
    return b
  const comp = compare(a.semver, b.semver, options);
  return comp < 0 ? a
    : comp > 0 ? b
    : b.operator === '<' && a.operator === '<=' ? b
    : a
};

var subset_1 = subset;

// just pre-load all the stuff that index.js lazily exports
const internalRe = re$5.exports;
var semver$1 = {
  re: internalRe.re,
  src: internalRe.src,
  tokens: internalRe.t,
  SEMVER_SPEC_VERSION: constants.SEMVER_SPEC_VERSION,
  SemVer: semver$2,
  compareIdentifiers: identifiers.compareIdentifiers,
  rcompareIdentifiers: identifiers.rcompareIdentifiers,
  parse: parse_1,
  valid: valid_1,
  clean: clean_1,
  inc: inc_1,
  diff: diff_1,
  major: major_1,
  minor: minor_1,
  patch: patch_1,
  prerelease: prerelease_1,
  compare: compare_1,
  rcompare: rcompare_1,
  compareLoose: compareLoose_1,
  compareBuild: compareBuild_1,
  sort: sort_1,
  rsort: rsort_1,
  gt: gt_1,
  lt: lt_1,
  eq: eq_1,
  neq: neq_1,
  gte: gte_1,
  lte: lte_1,
  cmp: cmp_1,
  coerce: coerce_1,
  Comparator: comparator,
  Range: range,
  satisfies: satisfies_1,
  toComparators: toComparators_1,
  maxSatisfying: maxSatisfying_1,
  minSatisfying: minSatisfying_1,
  minVersion: minVersion_1,
  validRange: valid,
  outside: outside_1,
  gtr: gtr_1,
  ltr: ltr_1,
  intersects: intersects_1,
  simplifyRange: simplify,
  subset: subset_1,
};

var semver = semver$1;

var builtins = function ({
  version = process.version,
  experimental = false
} = {}) {
  var coreModules = [
    'assert',
    'buffer',
    'child_process',
    'cluster',
    'console',
    'constants',
    'crypto',
    'dgram',
    'dns',
    'domain',
    'events',
    'fs',
    'http',
    'https',
    'module',
    'net',
    'os',
    'path',
    'punycode',
    'querystring',
    'readline',
    'repl',
    'stream',
    'string_decoder',
    'sys',
    'timers',
    'tls',
    'tty',
    'url',
    'util',
    'vm',
    'zlib'
  ];

  if (semver.lt(version, '6.0.0')) coreModules.push('freelist');
  if (semver.gte(version, '1.0.0')) coreModules.push('v8');
  if (semver.gte(version, '1.1.0')) coreModules.push('process');
  if (semver.gte(version, '8.0.0')) coreModules.push('inspector');
  if (semver.gte(version, '8.1.0')) coreModules.push('async_hooks');
  if (semver.gte(version, '8.4.0')) coreModules.push('http2');
  if (semver.gte(version, '8.5.0')) coreModules.push('perf_hooks');
  if (semver.gte(version, '10.0.0')) coreModules.push('trace_events');

  if (
    semver.gte(version, '10.5.0') &&
    (experimental || semver.gte(version, '12.0.0'))
  ) {
    coreModules.push('worker_threads');
  }
  if (semver.gte(version, '12.16.0') && experimental) {
    coreModules.push('wasi');
  }
  
  return coreModules
};

// Manually “tree shaken” from:

const reader = {read};
const packageJsonReader = reader;

/**
 * @param {string} jsonPath
 * @returns {{string: string}}
 */
function read(jsonPath) {
  return find(path.dirname(jsonPath))
}

/**
 * @param {string} dir
 * @returns {{string: string}}
 */
function find(dir) {
  try {
    const string = fs.readFileSync(
      path.toNamespacedPath(path.join(dir, 'package.json')),
      'utf8'
    );
    return {string}
  } catch (error) {
    if (error.code === 'ENOENT') {
      const parent = path.dirname(dir);
      if (dir !== parent) return find(parent)
      return {string: undefined}
      // Throw all other errors.
      /* c8 ignore next 4 */
    }

    throw error
  }
}

// Manually “tree shaken” from:

const isWindows$2 = process.platform === 'win32';

const own$1 = {}.hasOwnProperty;

const codes = {};

/**
 * @typedef {(...args: unknown[]) => string} MessageFunction
 */

/** @type {Map<string, MessageFunction|string>} */
const messages = new Map();
const nodeInternalPrefix = '__node_internal_';
/** @type {number} */
let userStackTraceLimit;

codes.ERR_INVALID_MODULE_SPECIFIER = createError(
  'ERR_INVALID_MODULE_SPECIFIER',
  /**
   * @param {string} request
   * @param {string} reason
   * @param {string} [base]
   */
  (request, reason, base = undefined) => {
    return `Invalid module "${request}" ${reason}${
      base ? ` imported from ${base}` : ''
    }`
  },
  TypeError
);

codes.ERR_INVALID_PACKAGE_CONFIG = createError(
  'ERR_INVALID_PACKAGE_CONFIG',
  /**
   * @param {string} path
   * @param {string} [base]
   * @param {string} [message]
   */
  (path, base, message) => {
    return `Invalid package config ${path}${
      base ? ` while importing ${base}` : ''
    }${message ? `. ${message}` : ''}`
  },
  Error
);

codes.ERR_INVALID_PACKAGE_TARGET = createError(
  'ERR_INVALID_PACKAGE_TARGET',
  /**
   * @param {string} pkgPath
   * @param {string} key
   * @param {unknown} target
   * @param {boolean} [isImport=false]
   * @param {string} [base]
   */
  (pkgPath, key, target, isImport = false, base = undefined) => {
    const relError =
      typeof target === 'string' &&
      !isImport &&
      target.length > 0 &&
      !target.startsWith('./');
    if (key === '.') {
      assert(isImport === false);
      return (
        `Invalid "exports" main target ${JSON.stringify(target)} defined ` +
        `in the package config ${pkgPath}package.json${
          base ? ` imported from ${base}` : ''
        }${relError ? '; targets must start with "./"' : ''}`
      )
    }

    return `Invalid "${
      isImport ? 'imports' : 'exports'
    }" target ${JSON.stringify(
      target
    )} defined for '${key}' in the package config ${pkgPath}package.json${
      base ? ` imported from ${base}` : ''
    }${relError ? '; targets must start with "./"' : ''}`
  },
  Error
);

codes.ERR_MODULE_NOT_FOUND = createError(
  'ERR_MODULE_NOT_FOUND',
  /**
   * @param {string} path
   * @param {string} base
   * @param {string} [type]
   */
  (path, base, type = 'package') => {
    return `Cannot find ${type} '${path}' imported from ${base}`
  },
  Error
);

codes.ERR_PACKAGE_IMPORT_NOT_DEFINED = createError(
  'ERR_PACKAGE_IMPORT_NOT_DEFINED',
  /**
   * @param {string} specifier
   * @param {string} packagePath
   * @param {string} base
   */
  (specifier, packagePath, base) => {
    return `Package import specifier "${specifier}" is not defined${
      packagePath ? ` in package ${packagePath}package.json` : ''
    } imported from ${base}`
  },
  TypeError
);

codes.ERR_PACKAGE_PATH_NOT_EXPORTED = createError(
  'ERR_PACKAGE_PATH_NOT_EXPORTED',
  /**
   * @param {string} pkgPath
   * @param {string} subpath
   * @param {string} [base]
   */
  (pkgPath, subpath, base = undefined) => {
    if (subpath === '.')
      return `No "exports" main defined in ${pkgPath}package.json${
        base ? ` imported from ${base}` : ''
      }`
    return `Package subpath '${subpath}' is not defined by "exports" in ${pkgPath}package.json${
      base ? ` imported from ${base}` : ''
    }`
  },
  Error
);

codes.ERR_UNSUPPORTED_DIR_IMPORT = createError(
  'ERR_UNSUPPORTED_DIR_IMPORT',
  "Directory import '%s' is not supported " +
    'resolving ES modules imported from %s',
  Error
);

codes.ERR_UNKNOWN_FILE_EXTENSION = createError(
  'ERR_UNKNOWN_FILE_EXTENSION',
  'Unknown file extension "%s" for %s',
  TypeError
);

codes.ERR_INVALID_ARG_VALUE = createError(
  'ERR_INVALID_ARG_VALUE',
  /**
   * @param {string} name
   * @param {unknown} value
   * @param {string} [reason='is invalid']
   */
  (name, value, reason = 'is invalid') => {
    let inspected = inspect(value);

    if (inspected.length > 128) {
      inspected = `${inspected.slice(0, 128)}...`;
    }

    const type = name.includes('.') ? 'property' : 'argument';

    return `The ${type} '${name}' ${reason}. Received ${inspected}`
  },
  TypeError
  // Note: extra classes have been shaken out.
  // , RangeError
);

codes.ERR_UNSUPPORTED_ESM_URL_SCHEME = createError(
  'ERR_UNSUPPORTED_ESM_URL_SCHEME',
  /**
   * @param {URL} url
   */
  (url) => {
    let message =
      'Only file and data URLs are supported by the default ESM loader';

    if (isWindows$2 && url.protocol.length === 2) {
      message += '. On Windows, absolute paths must be valid file:// URLs';
    }

    message += `. Received protocol '${url.protocol}'`;
    return message
  },
  Error
);

/**
 * Utility function for registering the error codes. Only used here. Exported
 * *only* to allow for testing.
 * @param {string} sym
 * @param {MessageFunction|string} value
 * @param {ErrorConstructor} def
 * @returns {new (...args: unknown[]) => Error}
 */
function createError(sym, value, def) {
  // Special case for SystemError that formats the error message differently
  // The SystemErrors only have SystemError as their base classes.
  messages.set(sym, value);

  return makeNodeErrorWithCode(def, sym)
}

/**
 * @param {ErrorConstructor} Base
 * @param {string} key
 * @returns {ErrorConstructor}
 */
function makeNodeErrorWithCode(Base, key) {
  // @ts-expect-error It’s a Node error.
  return NodeError
  /**
   * @param {unknown[]} args
   */
  function NodeError(...args) {
    const limit = Error.stackTraceLimit;
    if (isErrorStackTraceLimitWritable()) Error.stackTraceLimit = 0;
    const error = new Base();
    // Reset the limit and setting the name property.
    if (isErrorStackTraceLimitWritable()) Error.stackTraceLimit = limit;
    const message = getMessage(key, args, error);
    Object.defineProperty(error, 'message', {
      value: message,
      enumerable: false,
      writable: true,
      configurable: true
    });
    Object.defineProperty(error, 'toString', {
      /** @this {Error} */
      value() {
        return `${this.name} [${key}]: ${this.message}`
      },
      enumerable: false,
      writable: true,
      configurable: true
    });
    addCodeToName(error, Base.name, key);
    // @ts-expect-error It’s a Node error.
    error.code = key;
    return error
  }
}

const addCodeToName = hideStackFrames(
  /**
   * @param {Error} error
   * @param {string} name
   * @param {string} code
   * @returns {void}
   */
  function (error, name, code) {
    // Set the stack
    error = captureLargerStackTrace(error);
    // Add the error code to the name to include it in the stack trace.
    error.name = `${name} [${code}]`;
    // Access the stack to generate the error message including the error code
    // from the name.
    error.stack; // eslint-disable-line no-unused-expressions
    // Reset the name to the actual name.
    if (name === 'SystemError') {
      Object.defineProperty(error, 'name', {
        value: name,
        enumerable: false,
        writable: true,
        configurable: true
      });
    } else {
      delete error.name;
    }
  }
);

/**
 * @returns {boolean}
 */
function isErrorStackTraceLimitWritable() {
  const desc = Object.getOwnPropertyDescriptor(Error, 'stackTraceLimit');
  if (desc === undefined) {
    return Object.isExtensible(Error)
  }

  return own$1.call(desc, 'writable') ? desc.writable : desc.set !== undefined
}

/**
 * This function removes unnecessary frames from Node.js core errors.
 * @template {(...args: unknown[]) => unknown} T
 * @type {(fn: T) => T}
 */
function hideStackFrames(fn) {
  // We rename the functions that will be hidden to cut off the stacktrace
  // at the outermost one
  const hidden = nodeInternalPrefix + fn.name;
  Object.defineProperty(fn, 'name', {value: hidden});
  return fn
}

const captureLargerStackTrace = hideStackFrames(
  /**
   * @param {Error} error
   * @returns {Error}
   */
  function (error) {
    const stackTraceLimitIsWritable = isErrorStackTraceLimitWritable();
    if (stackTraceLimitIsWritable) {
      userStackTraceLimit = Error.stackTraceLimit;
      Error.stackTraceLimit = Number.POSITIVE_INFINITY;
    }

    Error.captureStackTrace(error);

    // Reset the limit
    if (stackTraceLimitIsWritable) Error.stackTraceLimit = userStackTraceLimit;

    return error
  }
);

/**
 * @param {string} key
 * @param {unknown[]} args
 * @param {Error} self
 * @returns {string}
 */
function getMessage(key, args, self) {
  const message = messages.get(key);

  if (typeof message === 'function') {
    assert(
      message.length <= args.length, // Default options do not count.
      `Code: ${key}; The provided arguments length (${args.length}) does not ` +
        `match the required ones (${message.length}).`
    );
    return Reflect.apply(message, self, args)
  }

  const expectedLength = (message.match(/%[dfijoOs]/g) || []).length;
  assert(
    expectedLength === args.length,
    `Code: ${key}; The provided arguments length (${args.length}) does not ` +
      `match the required ones (${expectedLength}).`
  );
  if (args.length === 0) return message

  args.unshift(message);
  return Reflect.apply(format$2, null, args)
}

// Manually “tree shaken” from:

const {ERR_UNKNOWN_FILE_EXTENSION} = codes;

const extensionFormatMap = {
  __proto__: null,
  '.cjs': 'commonjs',
  '.js': 'module',
  '.mjs': 'module'
};

/**
 * @param {string} url
 * @returns {{format: string|null}}
 */
function defaultGetFormat(url) {
  if (url.startsWith('node:')) {
    return {format: 'builtin'}
  }

  const parsed = new URL$1(url);

  if (parsed.protocol === 'data:') {
    const {1: mime} = /^([^/]+\/[^;,]+)[^,]*?(;base64)?,/.exec(
      parsed.pathname
    ) || [null, null];
    const format = mime === 'text/javascript' ? 'module' : null;
    return {format}
  }

  if (parsed.protocol === 'file:') {
    const ext = path.extname(parsed.pathname);
    /** @type {string} */
    let format;
    if (ext === '.js') {
      format = getPackageType(parsed.href) === 'module' ? 'module' : 'commonjs';
    } else {
      format = extensionFormatMap[ext];
    }

    if (!format) {
      throw new ERR_UNKNOWN_FILE_EXTENSION(ext, fileURLToPath$2(url))
    }

    return {format: format || null}
  }

  return {format: null}
}

// Manually “tree shaken” from:

builtins();

const {
  ERR_INVALID_MODULE_SPECIFIER,
  ERR_INVALID_PACKAGE_CONFIG,
  ERR_INVALID_PACKAGE_TARGET,
  ERR_MODULE_NOT_FOUND,
  ERR_PACKAGE_IMPORT_NOT_DEFINED,
  ERR_PACKAGE_PATH_NOT_EXPORTED,
  ERR_UNSUPPORTED_DIR_IMPORT,
  ERR_UNSUPPORTED_ESM_URL_SCHEME,
  ERR_INVALID_ARG_VALUE
} = codes;

const own = {}.hasOwnProperty;

Object.freeze(['node', 'import']);

const invalidSegmentRegEx = /(^|\\|\/)(\.\.?|node_modules)(\\|\/|$)/;
const patternRegEx = /\*/g;
const encodedSepRegEx = /%2f|%2c/i;
/** @type {Set<string>} */
const emittedPackageWarnings = new Set();
/** @type {Map<string, PackageConfig>} */
const packageJsonCache = new Map();

/**
 * @param {string} match
 * @param {URL} pjsonUrl
 * @param {boolean} isExports
 * @param {URL} base
 * @returns {void}
 */
function emitFolderMapDeprecation(match, pjsonUrl, isExports, base) {
  const pjsonPath = fileURLToPath$2(pjsonUrl);

  if (emittedPackageWarnings.has(pjsonPath + '|' + match)) return
  emittedPackageWarnings.add(pjsonPath + '|' + match);
  process.emitWarning(
    `Use of deprecated folder mapping "${match}" in the ${
      isExports ? '"exports"' : '"imports"'
    } field module resolution of the package at ${pjsonPath}${
      base ? ` imported from ${fileURLToPath$2(base)}` : ''
    }.\n` +
      `Update this package.json to use a subpath pattern like "${match}*".`,
    'DeprecationWarning',
    'DEP0148'
  );
}

/**
 * @param {URL} url
 * @param {URL} packageJsonUrl
 * @param {URL} base
 * @param {unknown} [main]
 * @returns {void}
 */
function emitLegacyIndexDeprecation(url, packageJsonUrl, base, main) {
  const {format} = defaultGetFormat(url.href);
  if (format !== 'module') return
  const path = fileURLToPath$2(url.href);
  const pkgPath = fileURLToPath$2(new URL$1('.', packageJsonUrl));
  const basePath = fileURLToPath$2(base);
  if (main)
    process.emitWarning(
      `Package ${pkgPath} has a "main" field set to ${JSON.stringify(main)}, ` +
        `excluding the full filename and extension to the resolved file at "${path.slice(
          pkgPath.length
        )}", imported from ${basePath}.\n Automatic extension resolution of the "main" field is` +
        'deprecated for ES modules.',
      'DeprecationWarning',
      'DEP0151'
    );
  else
    process.emitWarning(
      `No "main" or "exports" field defined in the package.json for ${pkgPath} resolving the main entry point "${path.slice(
        pkgPath.length
      )}", imported from ${basePath}.\nDefault "index" lookups for the main are deprecated for ES modules.`,
      'DeprecationWarning',
      'DEP0151'
    );
}

/**
 * @param {string} path
 * @returns {Stats}
 */
function tryStatSync(path) {
  // Note: from Node 15 onwards we can use `throwIfNoEntry: false` instead.
  try {
    return statSync(path)
  } catch {
    return new Stats()
  }
}

/**
 * @param {string} path
 * @param {string|URL} specifier Note: `specifier` is actually optional, not base.
 * @param {URL} [base]
 * @returns {PackageConfig}
 */
function getPackageConfig(path, specifier, base) {
  const existing = packageJsonCache.get(path);
  if (existing !== undefined) {
    return existing
  }

  const source = packageJsonReader.read(path).string;

  if (source === undefined) {
    /** @type {PackageConfig} */
    const packageConfig = {
      pjsonPath: path,
      exists: false,
      main: undefined,
      name: undefined,
      type: 'none',
      exports: undefined,
      imports: undefined
    };
    packageJsonCache.set(path, packageConfig);
    return packageConfig
  }

  /** @type {Object.<string, unknown>} */
  let packageJson;
  try {
    packageJson = JSON.parse(source);
  } catch (error) {
    throw new ERR_INVALID_PACKAGE_CONFIG(
      path,
      (base ? `"${specifier}" from ` : '') + fileURLToPath$2(base || specifier),
      error.message
    )
  }

  const {exports, imports, main, name, type} = packageJson;

  /** @type {PackageConfig} */
  const packageConfig = {
    pjsonPath: path,
    exists: true,
    main: typeof main === 'string' ? main : undefined,
    name: typeof name === 'string' ? name : undefined,
    type: type === 'module' || type === 'commonjs' ? type : 'none',
    // @ts-expect-error Assume `Object.<string, unknown>`.
    exports,
    // @ts-expect-error Assume `Object.<string, unknown>`.
    imports: imports && typeof imports === 'object' ? imports : undefined
  };
  packageJsonCache.set(path, packageConfig);
  return packageConfig
}

/**
 * @param {URL|string} resolved
 * @returns {PackageConfig}
 */
function getPackageScopeConfig(resolved) {
  let packageJsonUrl = new URL$1('./package.json', resolved);

  while (true) {
    const packageJsonPath = packageJsonUrl.pathname;

    if (packageJsonPath.endsWith('node_modules/package.json')) break

    const packageConfig = getPackageConfig(
      fileURLToPath$2(packageJsonUrl),
      resolved
    );
    if (packageConfig.exists) return packageConfig

    const lastPackageJsonUrl = packageJsonUrl;
    packageJsonUrl = new URL$1('../package.json', packageJsonUrl);

    // Terminates at root where ../package.json equals ../../package.json
    // (can't just check "/package.json" for Windows support).
    if (packageJsonUrl.pathname === lastPackageJsonUrl.pathname) break
  }

  const packageJsonPath = fileURLToPath$2(packageJsonUrl);
  /** @type {PackageConfig} */
  const packageConfig = {
    pjsonPath: packageJsonPath,
    exists: false,
    main: undefined,
    name: undefined,
    type: 'none',
    exports: undefined,
    imports: undefined
  };
  packageJsonCache.set(packageJsonPath, packageConfig);
  return packageConfig
}

/**
 * Legacy CommonJS main resolution:
 * 1. let M = pkg_url + (json main field)
 * 2. TRY(M, M.js, M.json, M.node)
 * 3. TRY(M/index.js, M/index.json, M/index.node)
 * 4. TRY(pkg_url/index.js, pkg_url/index.json, pkg_url/index.node)
 * 5. NOT_FOUND
 *
 * @param {URL} url
 * @returns {boolean}
 */
function fileExists(url) {
  return tryStatSync(fileURLToPath$2(url)).isFile()
}

/**
 * @param {URL} packageJsonUrl
 * @param {PackageConfig} packageConfig
 * @param {URL} base
 * @returns {URL}
 */
function legacyMainResolve(packageJsonUrl, packageConfig, base) {
  /** @type {URL} */
  let guess;
  if (packageConfig.main !== undefined) {
    guess = new URL$1(`./${packageConfig.main}`, packageJsonUrl);
    // Note: fs check redundances will be handled by Descriptor cache here.
    if (fileExists(guess)) return guess

    const tries = [
      `./${packageConfig.main}.js`,
      `./${packageConfig.main}.json`,
      `./${packageConfig.main}.node`,
      `./${packageConfig.main}/index.js`,
      `./${packageConfig.main}/index.json`,
      `./${packageConfig.main}/index.node`
    ];
    let i = -1;

    while (++i < tries.length) {
      guess = new URL$1(tries[i], packageJsonUrl);
      if (fileExists(guess)) break
      guess = undefined;
    }

    if (guess) {
      emitLegacyIndexDeprecation(
        guess,
        packageJsonUrl,
        base,
        packageConfig.main
      );
      return guess
    }
    // Fallthrough.
  }

  const tries = ['./index.js', './index.json', './index.node'];
  let i = -1;

  while (++i < tries.length) {
    guess = new URL$1(tries[i], packageJsonUrl);
    if (fileExists(guess)) break
    guess = undefined;
  }

  if (guess) {
    emitLegacyIndexDeprecation(guess, packageJsonUrl, base, packageConfig.main);
    return guess
  }

  // Not found.
  throw new ERR_MODULE_NOT_FOUND(
    fileURLToPath$2(new URL$1('.', packageJsonUrl)),
    fileURLToPath$2(base)
  )
}

/**
 * @param {URL} resolved
 * @param {URL} base
 * @returns {URL}
 */
function finalizeResolution(resolved, base) {
  if (encodedSepRegEx.test(resolved.pathname))
    throw new ERR_INVALID_MODULE_SPECIFIER(
      resolved.pathname,
      'must not include encoded "/" or "\\" characters',
      fileURLToPath$2(base)
    )

  const path = fileURLToPath$2(resolved);

  const stats = tryStatSync(path.endsWith('/') ? path.slice(-1) : path);

  if (stats.isDirectory()) {
    const error = new ERR_UNSUPPORTED_DIR_IMPORT(path, fileURLToPath$2(base));
    // @ts-expect-error Add this for `import.meta.resolve`.
    error.url = String(resolved);
    throw error
  }

  if (!stats.isFile()) {
    throw new ERR_MODULE_NOT_FOUND(
      path || resolved.pathname,
      base && fileURLToPath$2(base),
      'module'
    )
  }

  return resolved
}

/**
 * @param {string} specifier
 * @param {URL?} packageJsonUrl
 * @param {URL} base
 * @returns {never}
 */
function throwImportNotDefined(specifier, packageJsonUrl, base) {
  throw new ERR_PACKAGE_IMPORT_NOT_DEFINED(
    specifier,
    packageJsonUrl && fileURLToPath$2(new URL$1('.', packageJsonUrl)),
    fileURLToPath$2(base)
  )
}

/**
 * @param {string} subpath
 * @param {URL} packageJsonUrl
 * @param {URL} base
 * @returns {never}
 */
function throwExportsNotFound(subpath, packageJsonUrl, base) {
  throw new ERR_PACKAGE_PATH_NOT_EXPORTED(
    fileURLToPath$2(new URL$1('.', packageJsonUrl)),
    subpath,
    base && fileURLToPath$2(base)
  )
}

/**
 * @param {string} subpath
 * @param {URL} packageJsonUrl
 * @param {boolean} internal
 * @param {URL} [base]
 * @returns {never}
 */
function throwInvalidSubpath(subpath, packageJsonUrl, internal, base) {
  const reason = `request is not a valid subpath for the "${
    internal ? 'imports' : 'exports'
  }" resolution of ${fileURLToPath$2(packageJsonUrl)}`;

  throw new ERR_INVALID_MODULE_SPECIFIER(
    subpath,
    reason,
    base && fileURLToPath$2(base)
  )
}

/**
 * @param {string} subpath
 * @param {unknown} target
 * @param {URL} packageJsonUrl
 * @param {boolean} internal
 * @param {URL} [base]
 * @returns {never}
 */
function throwInvalidPackageTarget(
  subpath,
  target,
  packageJsonUrl,
  internal,
  base
) {
  target =
    typeof target === 'object' && target !== null
      ? JSON.stringify(target, null, '')
      : `${target}`;

  throw new ERR_INVALID_PACKAGE_TARGET(
    fileURLToPath$2(new URL$1('.', packageJsonUrl)),
    subpath,
    target,
    internal,
    base && fileURLToPath$2(base)
  )
}

/**
 * @param {string} target
 * @param {string} subpath
 * @param {string} match
 * @param {URL} packageJsonUrl
 * @param {URL} base
 * @param {boolean} pattern
 * @param {boolean} internal
 * @param {Set<string>} conditions
 * @returns {URL}
 */
function resolvePackageTargetString(
  target,
  subpath,
  match,
  packageJsonUrl,
  base,
  pattern,
  internal,
  conditions
) {
  if (subpath !== '' && !pattern && target[target.length - 1] !== '/')
    throwInvalidPackageTarget(match, target, packageJsonUrl, internal, base);

  if (!target.startsWith('./')) {
    if (internal && !target.startsWith('../') && !target.startsWith('/')) {
      let isURL = false;

      try {
        new URL$1(target);
        isURL = true;
      } catch {}

      if (!isURL) {
        const exportTarget = pattern
          ? target.replace(patternRegEx, subpath)
          : target + subpath;

        return packageResolve(exportTarget, packageJsonUrl, conditions)
      }
    }

    throwInvalidPackageTarget(match, target, packageJsonUrl, internal, base);
  }

  if (invalidSegmentRegEx.test(target.slice(2)))
    throwInvalidPackageTarget(match, target, packageJsonUrl, internal, base);

  const resolved = new URL$1(target, packageJsonUrl);
  const resolvedPath = resolved.pathname;
  const packagePath = new URL$1('.', packageJsonUrl).pathname;

  if (!resolvedPath.startsWith(packagePath))
    throwInvalidPackageTarget(match, target, packageJsonUrl, internal, base);

  if (subpath === '') return resolved

  if (invalidSegmentRegEx.test(subpath))
    throwInvalidSubpath(match + subpath, packageJsonUrl, internal, base);

  if (pattern) return new URL$1(resolved.href.replace(patternRegEx, subpath))
  return new URL$1(subpath, resolved)
}

/**
 * @param {string} key
 * @returns {boolean}
 */
function isArrayIndex(key) {
  const keyNumber = Number(key);
  if (`${keyNumber}` !== key) return false
  return keyNumber >= 0 && keyNumber < 0xffff_ffff
}

/**
 * @param {URL} packageJsonUrl
 * @param {unknown} target
 * @param {string} subpath
 * @param {string} packageSubpath
 * @param {URL} base
 * @param {boolean} pattern
 * @param {boolean} internal
 * @param {Set<string>} conditions
 * @returns {URL}
 */
function resolvePackageTarget(
  packageJsonUrl,
  target,
  subpath,
  packageSubpath,
  base,
  pattern,
  internal,
  conditions
) {
  if (typeof target === 'string') {
    return resolvePackageTargetString(
      target,
      subpath,
      packageSubpath,
      packageJsonUrl,
      base,
      pattern,
      internal,
      conditions
    )
  }

  if (Array.isArray(target)) {
    /** @type {unknown[]} */
    const targetList = target;
    if (targetList.length === 0) return null

    /** @type {Error} */
    let lastException;
    let i = -1;

    while (++i < targetList.length) {
      const targetItem = targetList[i];
      /** @type {URL} */
      let resolved;
      try {
        resolved = resolvePackageTarget(
          packageJsonUrl,
          targetItem,
          subpath,
          packageSubpath,
          base,
          pattern,
          internal,
          conditions
        );
      } catch (error) {
        lastException = error;
        if (error.code === 'ERR_INVALID_PACKAGE_TARGET') continue
        throw error
      }

      if (resolved === undefined) continue

      if (resolved === null) {
        lastException = null;
        continue
      }

      return resolved
    }

    if (lastException === undefined || lastException === null) {
      // @ts-expect-error The diff between `undefined` and `null` seems to be
      // intentional
      return lastException
    }

    throw lastException
  }

  if (typeof target === 'object' && target !== null) {
    const keys = Object.getOwnPropertyNames(target);
    let i = -1;

    while (++i < keys.length) {
      const key = keys[i];
      if (isArrayIndex(key)) {
        throw new ERR_INVALID_PACKAGE_CONFIG(
          fileURLToPath$2(packageJsonUrl),
          base,
          '"exports" cannot contain numeric property keys.'
        )
      }
    }

    i = -1;

    while (++i < keys.length) {
      const key = keys[i];
      if (key === 'default' || (conditions && conditions.has(key))) {
        /** @type {unknown} */
        const conditionalTarget = target[key];
        const resolved = resolvePackageTarget(
          packageJsonUrl,
          conditionalTarget,
          subpath,
          packageSubpath,
          base,
          pattern,
          internal,
          conditions
        );
        if (resolved === undefined) continue
        return resolved
      }
    }

    return undefined
  }

  if (target === null) {
    return null
  }

  throwInvalidPackageTarget(
    packageSubpath,
    target,
    packageJsonUrl,
    internal,
    base
  );
}

/**
 * @param {unknown} exports
 * @param {URL} packageJsonUrl
 * @param {URL} base
 * @returns {boolean}
 */
function isConditionalExportsMainSugar(exports, packageJsonUrl, base) {
  if (typeof exports === 'string' || Array.isArray(exports)) return true
  if (typeof exports !== 'object' || exports === null) return false

  const keys = Object.getOwnPropertyNames(exports);
  let isConditionalSugar = false;
  let i = 0;
  let j = -1;
  while (++j < keys.length) {
    const key = keys[j];
    const curIsConditionalSugar = key === '' || key[0] !== '.';
    if (i++ === 0) {
      isConditionalSugar = curIsConditionalSugar;
    } else if (isConditionalSugar !== curIsConditionalSugar) {
      throw new ERR_INVALID_PACKAGE_CONFIG(
        fileURLToPath$2(packageJsonUrl),
        base,
        '"exports" cannot contain some keys starting with \'.\' and some not.' +
          ' The exports object must either be an object of package subpath keys' +
          ' or an object of main entry condition name keys only.'
      )
    }
  }

  return isConditionalSugar
}

/**
 * @param {URL} packageJsonUrl
 * @param {string} packageSubpath
 * @param {Object.<string, unknown>} packageConfig
 * @param {URL} base
 * @param {Set<string>} conditions
 * @returns {ResolveObject}
 */
function packageExportsResolve(
  packageJsonUrl,
  packageSubpath,
  packageConfig,
  base,
  conditions
) {
  let exports = packageConfig.exports;
  if (isConditionalExportsMainSugar(exports, packageJsonUrl, base))
    exports = {'.': exports};

  if (own.call(exports, packageSubpath)) {
    const target = exports[packageSubpath];
    const resolved = resolvePackageTarget(
      packageJsonUrl,
      target,
      '',
      packageSubpath,
      base,
      false,
      false,
      conditions
    );
    if (resolved === null || resolved === undefined)
      throwExportsNotFound(packageSubpath, packageJsonUrl, base);
    return {resolved, exact: true}
  }

  let bestMatch = '';
  const keys = Object.getOwnPropertyNames(exports);
  let i = -1;

  while (++i < keys.length) {
    const key = keys[i];
    if (
      key[key.length - 1] === '*' &&
      packageSubpath.startsWith(key.slice(0, -1)) &&
      packageSubpath.length >= key.length &&
      key.length > bestMatch.length
    ) {
      bestMatch = key;
    } else if (
      key[key.length - 1] === '/' &&
      packageSubpath.startsWith(key) &&
      key.length > bestMatch.length
    ) {
      bestMatch = key;
    }
  }

  if (bestMatch) {
    const target = exports[bestMatch];
    const pattern = bestMatch[bestMatch.length - 1] === '*';
    const subpath = packageSubpath.slice(bestMatch.length - (pattern ? 1 : 0));
    const resolved = resolvePackageTarget(
      packageJsonUrl,
      target,
      subpath,
      bestMatch,
      base,
      pattern,
      false,
      conditions
    );
    if (resolved === null || resolved === undefined)
      throwExportsNotFound(packageSubpath, packageJsonUrl, base);
    if (!pattern)
      emitFolderMapDeprecation(bestMatch, packageJsonUrl, true, base);
    return {resolved, exact: pattern}
  }

  throwExportsNotFound(packageSubpath, packageJsonUrl, base);
}

/**
 * @param {string} name
 * @param {URL} base
 * @param {Set<string>} [conditions]
 * @returns {ResolveObject}
 */
function packageImportsResolve(name, base, conditions) {
  if (name === '#' || name.startsWith('#/')) {
    const reason = 'is not a valid internal imports specifier name';
    throw new ERR_INVALID_MODULE_SPECIFIER(name, reason, fileURLToPath$2(base))
  }

  /** @type {URL} */
  let packageJsonUrl;

  const packageConfig = getPackageScopeConfig(base);

  if (packageConfig.exists) {
    packageJsonUrl = pathToFileURL(packageConfig.pjsonPath);
    const imports = packageConfig.imports;
    if (imports) {
      if (own.call(imports, name)) {
        const resolved = resolvePackageTarget(
          packageJsonUrl,
          imports[name],
          '',
          name,
          base,
          false,
          true,
          conditions
        );
        if (resolved !== null) return {resolved, exact: true}
      } else {
        let bestMatch = '';
        const keys = Object.getOwnPropertyNames(imports);
        let i = -1;

        while (++i < keys.length) {
          const key = keys[i];

          if (
            key[key.length - 1] === '*' &&
            name.startsWith(key.slice(0, -1)) &&
            name.length >= key.length &&
            key.length > bestMatch.length
          ) {
            bestMatch = key;
          } else if (
            key[key.length - 1] === '/' &&
            name.startsWith(key) &&
            key.length > bestMatch.length
          ) {
            bestMatch = key;
          }
        }

        if (bestMatch) {
          const target = imports[bestMatch];
          const pattern = bestMatch[bestMatch.length - 1] === '*';
          const subpath = name.slice(bestMatch.length - (pattern ? 1 : 0));
          const resolved = resolvePackageTarget(
            packageJsonUrl,
            target,
            subpath,
            bestMatch,
            base,
            pattern,
            true,
            conditions
          );
          if (resolved !== null) {
            if (!pattern)
              emitFolderMapDeprecation(bestMatch, packageJsonUrl, false, base);
            return {resolved, exact: pattern}
          }
        }
      }
    }
  }

  throwImportNotDefined(name, packageJsonUrl, base);
}

/**
 * @param {string} url
 * @returns {PackageType}
 */
function getPackageType(url) {
  const packageConfig = getPackageScopeConfig(url);
  return packageConfig.type
}

/**
 * @param {string} specifier
 * @param {URL} base
 */
function parsePackageName(specifier, base) {
  let separatorIndex = specifier.indexOf('/');
  let validPackageName = true;
  let isScoped = false;
  if (specifier[0] === '@') {
    isScoped = true;
    if (separatorIndex === -1 || specifier.length === 0) {
      validPackageName = false;
    } else {
      separatorIndex = specifier.indexOf('/', separatorIndex + 1);
    }
  }

  const packageName =
    separatorIndex === -1 ? specifier : specifier.slice(0, separatorIndex);

  // Package name cannot have leading . and cannot have percent-encoding or
  // separators.
  let i = -1;
  while (++i < packageName.length) {
    if (packageName[i] === '%' || packageName[i] === '\\') {
      validPackageName = false;
      break
    }
  }

  if (!validPackageName) {
    throw new ERR_INVALID_MODULE_SPECIFIER(
      specifier,
      'is not a valid package name',
      fileURLToPath$2(base)
    )
  }

  const packageSubpath =
    '.' + (separatorIndex === -1 ? '' : specifier.slice(separatorIndex));

  return {packageName, packageSubpath, isScoped}
}

/**
 * @param {string} specifier
 * @param {URL} base
 * @param {Set<string>} conditions
 * @returns {URL}
 */
function packageResolve(specifier, base, conditions) {
  const {packageName, packageSubpath, isScoped} = parsePackageName(
    specifier,
    base
  );

  // ResolveSelf
  const packageConfig = getPackageScopeConfig(base);

  // Can’t test.
  /* c8 ignore next 16 */
  if (packageConfig.exists) {
    const packageJsonUrl = pathToFileURL(packageConfig.pjsonPath);
    if (
      packageConfig.name === packageName &&
      packageConfig.exports !== undefined &&
      packageConfig.exports !== null
    ) {
      return packageExportsResolve(
        packageJsonUrl,
        packageSubpath,
        packageConfig,
        base,
        conditions
      ).resolved
    }
  }

  let packageJsonUrl = new URL$1(
    './node_modules/' + packageName + '/package.json',
    base
  );
  let packageJsonPath = fileURLToPath$2(packageJsonUrl);
  /** @type {string} */
  let lastPath;
  do {
    const stat = tryStatSync(packageJsonPath.slice(0, -13));
    if (!stat.isDirectory()) {
      lastPath = packageJsonPath;
      packageJsonUrl = new URL$1(
        (isScoped ? '../../../../node_modules/' : '../../../node_modules/') +
          packageName +
          '/package.json',
        packageJsonUrl
      );
      packageJsonPath = fileURLToPath$2(packageJsonUrl);
      continue
    }

    // Package match.
    const packageConfig = getPackageConfig(packageJsonPath, specifier, base);
    if (packageConfig.exports !== undefined && packageConfig.exports !== null)
      return packageExportsResolve(
        packageJsonUrl,
        packageSubpath,
        packageConfig,
        base,
        conditions
      ).resolved
    if (packageSubpath === '.')
      return legacyMainResolve(packageJsonUrl, packageConfig, base)
    return new URL$1(packageSubpath, packageJsonUrl)
    // Cross-platform root check.
  } while (packageJsonPath.length !== lastPath.length)

  throw new ERR_MODULE_NOT_FOUND(packageName, fileURLToPath$2(base))
}

/**
 * @param {string} specifier
 * @returns {boolean}
 */
function isRelativeSpecifier(specifier) {
  if (specifier[0] === '.') {
    if (specifier.length === 1 || specifier[1] === '/') return true
    if (
      specifier[1] === '.' &&
      (specifier.length === 2 || specifier[2] === '/')
    ) {
      return true
    }
  }

  return false
}

/**
 * @param {string} specifier
 * @returns {boolean}
 */
function shouldBeTreatedAsRelativeOrAbsolutePath(specifier) {
  if (specifier === '') return false
  if (specifier[0] === '/') return true
  return isRelativeSpecifier(specifier)
}

/**
 * The “Resolver Algorithm Specification” as detailed in the Node docs (which is
 * sync and slightly lower-level than `resolve`).
 *
 *
 *
 * @param {string} specifier
 * @param {URL} base
 * @param {Set<string>} [conditions]
 * @returns {URL}
 */
function moduleResolve(specifier, base, conditions) {
  // Order swapped from spec for minor perf gain.
  // Ok since relative URLs cannot parse as URLs.
  /** @type {URL} */
  let resolved;

  if (shouldBeTreatedAsRelativeOrAbsolutePath(specifier)) {
    resolved = new URL$1(specifier, base);
  } else if (specifier[0] === '#') {
({resolved} = packageImportsResolve(specifier, base, conditions));
  } else {
    try {
      resolved = new URL$1(specifier);
    } catch {
      resolved = packageResolve(specifier, base, conditions);
    }
  }

  return finalizeResolution(resolved, base)
}

const DEFAULT_CONDITIONS_SET = new Set(["node", "import"]);
const DEFAULT_URL = pathToFileURL(process.cwd());
const DEFAULT_EXTENSIONS = [".mjs", ".cjs", ".js", ".json"];
const NOT_FOUND_ERRORS = new Set(["ERR_MODULE_NOT_FOUND", "ERR_UNSUPPORTED_DIR_IMPORT", "MODULE_NOT_FOUND"]);
function _tryModuleResolve(id, url, conditions) {
  try {
    return moduleResolve(id, url, conditions);
  } catch (err) {
    if (!NOT_FOUND_ERRORS.has(err.code)) {
      throw err;
    }
    return null;
  }
}
function _resolve(id, opts = {}) {
  if (/(node|data|http|https):/.test(id)) {
    return id;
  }
  if (BUILTIN_MODULES.has(id)) {
    return "node:" + id;
  }
  if (isAbsolute(id)) {
    return id;
  }
  const conditionsSet = opts.conditions ? new Set(opts.conditions) : DEFAULT_CONDITIONS_SET;
  const _urls = (Array.isArray(opts.url) ? opts.url : [opts.url]).filter(Boolean).map((u) => new URL(normalizeid(u.toString())));
  if (!_urls.length) {
    _urls.push(DEFAULT_URL);
  }
  const urls = [..._urls];
  for (const url of _urls) {
    if (url.protocol === "file:" && !url.pathname.includes("node_modules")) {
      const newURL = new URL(url);
      newURL.pathname += "/node_modules";
      urls.push(newURL);
    }
  }
  let resolved;
  for (const url of urls) {
    resolved = _tryModuleResolve(id, url, conditionsSet);
    if (resolved) {
      break;
    }
    for (const prefix of ["", "/index"]) {
      for (const ext of opts.extensions || DEFAULT_EXTENSIONS) {
        resolved = _tryModuleResolve(id + prefix + ext, url, conditionsSet);
        if (resolved) {
          break;
        }
      }
      if (resolved) {
        break;
      }
    }
  }
  if (!resolved) {
    const err = new Error(`Cannot find module ${id} imported from ${urls.join(", ")}`);
    err.code = "ERR_MODULE_NOT_FOUND";
    throw err;
  }
  const realPath = realpathSync(fileURLToPath(resolved));
  return pathToFileURL(realPath).toString();
}
function resolveSync(id, opts) {
  return _resolve(id, opts);
}
function resolvePathSync(id, opts) {
  return fileURLToPath(resolveSync(id, opts));
}
function resolvePath(id, opts) {
  return pcall(resolvePathSync, id, opts);
}

const defaultFindOptions = {
  startingFrom: ".",
  rootPattern: /^node_modules$/,
  test: (filePath) => {
    try {
      if (statSync(filePath).isFile()) {
        return true;
      }
    } catch {
    }
    return null;
  }
};
async function findNearestFile(filename, _options = {}) {
  const options = { ...defaultFindOptions, ..._options };
  const basePath = resolve$2(options.startingFrom);
  const leadingSlash = basePath[0] === "/";
  const segments = basePath.split("/").filter(Boolean);
  if (leadingSlash) {
    segments[0] = "/" + segments[0];
  }
  let root = segments.findIndex((r) => r.match(options.rootPattern));
  if (root === -1)
    root = 0;
  for (let i = segments.length; i > root; i--) {
    const filePath = join$1(...segments.slice(0, i), filename);
    if (await options.test(filePath)) {
      return filePath;
    }
  }
  throw new Error(`Cannot find matching ${filename} in ${options.startingFrom} or parent directories`);
}
async function readPackageJSON(id, opts = {}) {
  const resolvedPath = await resolvePackageJSON(id, opts);
  const blob = await promises.readFile(resolvedPath, "utf-8");
  return JSON.parse(blob);
}
async function resolvePackageJSON(id = process.cwd(), opts = {}) {
  const resolvedPath = isAbsolute$1(id) ? id : await resolvePath(id, opts);
  return findNearestFile("package.json", { startingFrom: resolvedPath });
}

const ESM_RE = /([\s;]|^)(import[\w,{}\s*]*from|import\s*['"*{]|export\b\s*(?:[*{]|default|type|function|const|var|let|async function)|import\.meta\b)/m;
const BUILTIN_EXTENSIONS = new Set([".mjs", ".cjs", ".node", ".wasm"]);
function hasESMSyntax(code) {
  return ESM_RE.test(code);
}
const CJS_RE = /([\s;]|^)(module.exports\b|exports\.\w|require\s*\(|global\.\w)/m;
function hasCJSSyntax(code) {
  return CJS_RE.test(code);
}
const validNodeImportDefaults = {
  allowedProtocols: ["node", "file", "data"]
};
async function isValidNodeImport(id, _opts = {}) {
  if (isNodeBuiltin(id)) {
    return true;
  }
  const opts = { ...validNodeImportDefaults, ..._opts };
  const proto = getProtocol(id);
  if (proto && !opts.allowedProtocols.includes(proto)) {
    return false;
  }
  if (proto === "data") {
    return true;
  }
  const resolvedPath = await resolvePath$1(id, opts);
  const extension = extname$1(resolvedPath);
  if (BUILTIN_EXTENSIONS.has(extension)) {
    return true;
  }
  if (extension !== ".js") {
    return false;
  }
  if (resolvedPath.match(/\.(\w+-)?esm?(-\w+)?\.js$/)) {
    return false;
  }
  const pkg = await readPackageJSON(resolvedPath).catch(() => null);
  if (pkg?.type === "module") {
    return true;
  }
  const code = opts.code || await promises.readFile(resolvedPath, "utf-8").catch(() => null) || "";
  return hasCJSSyntax(code) || !hasESMSyntax(code);
}

const isWindows = process.platform === "win32";
function slash(str) {
  return str.replace(/\\/g, "/");
}
function normalizeId(id, base) {
  if (base && id.startsWith(base))
    id = `/${id.slice(base.length)}`;
  return id.replace(/^\/@id\/__x00__/, "\0").replace(/^\/@id\//, "").replace(/^__vite-browser-external:/, "").replace(/^node:/, "").replace(/[?&]v=\w+/, "?").replace(/\?$/, "");
}
function isPrimitive(v) {
  return v !== Object(v);
}
function toFilePath(id, root) {
  let absolute = slash(id).startsWith("/@fs/") ? id.slice(4) : id.startsWith(dirname$2(root)) ? id : id.startsWith("/") ? slash(resolve(root, id.slice(1))) : id;
  if (absolute.startsWith("//"))
    absolute = absolute.slice(1);
  return isWindows && absolute.startsWith("/") ? fileURLToPath$2(pathToFileURL(absolute.slice(1)).href) : absolute;
}

function createBirpc(functions, options) {
  const {
    post,
    on,
    eventNames = [],
    serialize = (i) => i,
    deserialize = (i) => i
  } = options;
  const rpcPromiseMap = /* @__PURE__ */ new Map();
  on(async (data) => {
    const msg = deserialize(data);
    if (msg.t === "q") {
      const { m: method, a: args } = msg;
      let result, error;
      try {
        result = await functions[method](...args);
      } catch (e) {
        error = e;
      }
      if (msg.i)
        post(serialize({ t: "s", i: msg.i, r: result, e: error }));
    } else {
      const { i: ack, r: result, e: error } = msg;
      const promise = rpcPromiseMap.get(ack);
      if (error)
        promise?.reject(error);
      else
        promise?.resolve(result);
      rpcPromiseMap.delete(ack);
    }
  });
  return new Proxy({}, {
    get(_, method) {
      const sendEvent = (...args) => {
        post(serialize({ m: method, a: args, t: "q" }));
      };
      if (eventNames.includes(method)) {
        sendEvent.asEvent = sendEvent;
        return sendEvent;
      }
      const sendCall = (...args) => {
        return new Promise((resolve, reject) => {
          const id = nanoid();
          rpcPromiseMap.set(id, { resolve, reject });
          post(serialize({ m: method, a: args, i: id, t: "q" }));
        });
      };
      sendCall.asEvent = sendEvent;
      return sendCall;
    }
  });
}
const urlAlphabet = "useandom-26T198340PX75pxJACKVERYMINDBUSHWOLF_GQZbfghjklqvwyzrict";
function nanoid(size = 21) {
  let id = "";
  let i = size;
  while (i--)
    id += urlAlphabet[Math.random() * 64 | 0];
  return id;
}

export { isValidNodeImport as a, isPrimitive as b, createBirpc as c, isNodeBuiltin as i, normalizeId as n, slash as s, toFilePath as t };
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXgtNDZlMWQ0YWQuanMiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL25vZGVfbW9kdWxlcy8ucG5wbS9tbGx5QDAuMy4xNy9ub2RlX21vZHVsZXMvbWxseS9kaXN0L2luZGV4Lm1qcyIsIi4uLy4uL3ZpdGUtbm9kZS9kaXN0L3V0aWxzLmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzLy5wbnBtL2JpcnBjQDAuMS4wL25vZGVfbW9kdWxlcy9iaXJwYy9kaXN0L2luZGV4Lm1qcyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBidWlsdGluTW9kdWxlcywgY3JlYXRlUmVxdWlyZSB9IGZyb20gJ21vZHVsZSc7XG5pbXBvcnQgcGF0aCwgeyBkaXJuYW1lIGFzIGRpcm5hbWUkMiB9IGZyb20gJ3BhdGgnO1xuaW1wb3J0IHsgZmlsZVVSTFRvUGF0aCBhcyBmaWxlVVJMVG9QYXRoJDIsIFVSTCBhcyBVUkwkMSwgcGF0aFRvRmlsZVVSTCB9IGZyb20gJ3VybCc7XG5pbXBvcnQgZnMsIHsgcHJvbWlzZXMsIHN0YXRTeW5jLCBTdGF0cywgcmVhbHBhdGhTeW5jIH0gZnJvbSAnZnMnO1xuaW1wb3J0IGFzc2VydCBmcm9tICdhc3NlcnQnO1xuaW1wb3J0IHsgZm9ybWF0IGFzIGZvcm1hdCQyLCBpbnNwZWN0IH0gZnJvbSAndXRpbCc7XG5cbmNvbnN0IEJVSUxUSU5fTU9EVUxFUyQxID0gbmV3IFNldChidWlsdGluTW9kdWxlcyk7XG5mdW5jdGlvbiBub3JtYWxpemVTbGFzaCQxKHN0cikge1xuICByZXR1cm4gc3RyLnJlcGxhY2UoL1xcXFwvZywgXCIvXCIpO1xufVxuZnVuY3Rpb24gcGNhbGwkMShmbiwgLi4uYXJncykge1xuICB0cnkge1xuICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoZm4oLi4uYXJncykpLmNhdGNoKChlcnIpID0+IHBlcnIkMShlcnIpKTtcbiAgfSBjYXRjaCAoZXJyKSB7XG4gICAgcmV0dXJuIHBlcnIkMShlcnIpO1xuICB9XG59XG5mdW5jdGlvbiBwZXJyJDEoX2Vycikge1xuICBjb25zdCBlcnIgPSBuZXcgRXJyb3IoX2Vycik7XG4gIGVyci5jb2RlID0gX2Vyci5jb2RlO1xuICBFcnJvci5jYXB0dXJlU3RhY2tUcmFjZShlcnIsIHBjYWxsJDEpO1xuICByZXR1cm4gUHJvbWlzZS5yZWplY3QoZXJyKTtcbn1cbmZ1bmN0aW9uIGlzT2JqZWN0KHZhbCkge1xuICByZXR1cm4gdmFsICE9PSBudWxsICYmIHR5cGVvZiB2YWwgPT09IFwib2JqZWN0XCI7XG59XG5mdW5jdGlvbiBtYXRjaEFsbChyZWdleCwgc3RyaW5nLCBhZGRpdGlvbikge1xuICBjb25zdCBtYXRjaGVzID0gW107XG4gIGZvciAoY29uc3QgbWF0Y2ggb2Ygc3RyaW5nLm1hdGNoQWxsKHJlZ2V4KSkge1xuICAgIG1hdGNoZXMucHVzaCh7XG4gICAgICAuLi5hZGRpdGlvbixcbiAgICAgIC4uLm1hdGNoLmdyb3VwcyxcbiAgICAgIGNvZGU6IG1hdGNoWzBdLFxuICAgICAgc3RhcnQ6IG1hdGNoLmluZGV4LFxuICAgICAgZW5kOiBtYXRjaC5pbmRleCArIG1hdGNoWzBdLmxlbmd0aFxuICAgIH0pO1xuICB9XG4gIHJldHVybiBtYXRjaGVzO1xufVxuXG5jb25zdCBFU01fU1RBVElDX0lNUE9SVF9SRSA9IC9eKD88PVxccyopaW1wb3J0XFxzKihbXCInXFxzXSooPzxpbXBvcnRzPltcXHcqJHt9XFxuXFxyXFx0LCAvXSspZnJvbVxccyopP1tcIiddXFxzKig/PHNwZWNpZmllcj4uKltAXFx3Xy1dKylcXHMqW1wiJ11bXlxcbl0qJC9nbTtcbmNvbnN0IERZTkFNSUNfSU1QT1JUX1JFID0gL2ltcG9ydFxccypcXCgoPzxleHByZXNzaW9uPig/OlteKShdK3xcXCgoPzpbXikoXSt8XFwoW14pKF0qXFwpKSpcXCkpKilcXCkvZ207XG5jb25zdCBFWFBPUlRfREVDQUxfUkUgPSAvXFxiZXhwb3J0XFxzKyg/PGRlY2xhcmF0aW9uPihhc3luYyBmdW5jdGlvbnxmdW5jdGlvbnxsZXR8Y29uc3R8dmFyfGNsYXNzKSlcXHMrKD88bmFtZT5bXFx3JF9dKykvZztcbmNvbnN0IEVYUE9SVF9OQU1FRF9SRSA9IC9cXGJleHBvcnRcXHMreyg/PGV4cG9ydHM+W159XSspfS9nO1xuY29uc3QgRVhQT1JUX0RFRkFVTFRfUkUgPSAvXFxiZXhwb3J0XFxzK2RlZmF1bHRcXHMrL2c7XG5mdW5jdGlvbiBmaW5kU3RhdGljSW1wb3J0cyhjb2RlKSB7XG4gIHJldHVybiBtYXRjaEFsbChFU01fU1RBVElDX0lNUE9SVF9SRSwgY29kZSwgeyB0eXBlOiBcInN0YXRpY1wiIH0pO1xufVxuZnVuY3Rpb24gZmluZER5bmFtaWNJbXBvcnRzKGNvZGUpIHtcbiAgcmV0dXJuIG1hdGNoQWxsKERZTkFNSUNfSU1QT1JUX1JFLCBjb2RlLCB7IHR5cGU6IFwiZHluYW1pY1wiIH0pO1xufVxuZnVuY3Rpb24gcGFyc2VTdGF0aWNJbXBvcnQobWF0Y2hlZCkge1xuICBjb25zdCBjbGVhbmVkSW1wb3J0cyA9IChtYXRjaGVkLmltcG9ydHMgfHwgXCJcIikucmVwbGFjZSgvKFxcL1xcL1teXFxuXSpcXG58XFwvXFwqLipcXCpcXC8pL2csIFwiXCIpLnJlcGxhY2UoL1xccysvZywgXCIgXCIpO1xuICBjb25zdCBuYW1lZEltcG9ydHMgPSB7fTtcbiAgZm9yIChjb25zdCBuYW1lZEltcG9ydCBvZiBjbGVhbmVkSW1wb3J0cy5tYXRjaCgvXFx7KFtefV0qKVxcfS8pPy5bMV0/LnNwbGl0KFwiLFwiKSB8fCBbXSkge1xuICAgIGNvbnN0IFssIHNvdXJjZSA9IG5hbWVkSW1wb3J0LnRyaW0oKSwgaW1wb3J0TmFtZSA9IHNvdXJjZV0gPSBuYW1lZEltcG9ydC5tYXRjaCgvXlxccyooW15cXHNdKikgYXMgKFteXFxzXSopXFxzKiQvKSB8fCBbXTtcbiAgICBpZiAoc291cmNlKSB7XG4gICAgICBuYW1lZEltcG9ydHNbc291cmNlXSA9IGltcG9ydE5hbWU7XG4gICAgfVxuICB9XG4gIGNvbnN0IHRvcExldmVsSW1wb3J0cyA9IGNsZWFuZWRJbXBvcnRzLnJlcGxhY2UoL1xceyhbXn1dKilcXH0vLCBcIlwiKTtcbiAgY29uc3QgbmFtZXNwYWNlZEltcG9ydCA9IHRvcExldmVsSW1wb3J0cy5tYXRjaCgvXFwqIGFzIFxccyooW15cXHNdKikvKT8uWzFdO1xuICBjb25zdCBkZWZhdWx0SW1wb3J0ID0gdG9wTGV2ZWxJbXBvcnRzLnNwbGl0KFwiLFwiKS5maW5kKChpKSA9PiAhaS5tYXRjaCgvWyp7fV0vKSk/LnRyaW0oKSB8fCB2b2lkIDA7XG4gIHJldHVybiB7XG4gICAgLi4ubWF0Y2hlZCxcbiAgICBkZWZhdWx0SW1wb3J0LFxuICAgIG5hbWVzcGFjZWRJbXBvcnQsXG4gICAgbmFtZWRJbXBvcnRzXG4gIH07XG59XG5mdW5jdGlvbiBmaW5kRXhwb3J0cyhjb2RlKSB7XG4gIGNvbnN0IGRlY2xhcmVkRXhwb3J0cyA9IG1hdGNoQWxsKEVYUE9SVF9ERUNBTF9SRSwgY29kZSwgeyB0eXBlOiBcImRlY2xhcmF0aW9uXCIgfSk7XG4gIGNvbnN0IG5hbWVkRXhwb3J0cyA9IG1hdGNoQWxsKEVYUE9SVF9OQU1FRF9SRSwgY29kZSwgeyB0eXBlOiBcIm5hbWVkXCIgfSk7XG4gIGZvciAoY29uc3QgbmFtZWRFeHBvcnQgb2YgbmFtZWRFeHBvcnRzKSB7XG4gICAgbmFtZWRFeHBvcnQubmFtZXMgPSBuYW1lZEV4cG9ydC5leHBvcnRzLnNwbGl0KC9cXHMqLFxccyovZykubWFwKChuYW1lKSA9PiBuYW1lLnJlcGxhY2UoL14uKj9cXHNhc1xccy8sIFwiXCIpLnRyaW0oKSk7XG4gIH1cbiAgY29uc3QgZGVmYXVsdEV4cG9ydCA9IG1hdGNoQWxsKEVYUE9SVF9ERUZBVUxUX1JFLCBjb2RlLCB7IHR5cGU6IFwiZGVmYXVsdFwiLCBuYW1lOiBcImRlZmF1bHRcIiB9KTtcbiAgY29uc3QgZXhwb3J0cyA9IFtdLmNvbmNhdChkZWNsYXJlZEV4cG9ydHMsIG5hbWVkRXhwb3J0cywgZGVmYXVsdEV4cG9ydCk7XG4gIGZvciAoY29uc3QgZXhwIG9mIGV4cG9ydHMpIHtcbiAgICBpZiAoIWV4cC5uYW1lICYmIGV4cC5uYW1lcyAmJiBleHAubmFtZXMubGVuZ3RoID09PSAxKSB7XG4gICAgICBleHAubmFtZSA9IGV4cC5uYW1lc1swXTtcbiAgICB9XG4gICAgaWYgKGV4cC5uYW1lID09PSBcImRlZmF1bHRcIiAmJiBleHAudHlwZSAhPT0gXCJkZWZhdWx0XCIpIHtcbiAgICAgIGV4cC5fdHlwZSA9IGV4cC50eXBlO1xuICAgICAgZXhwLnR5cGUgPSBcImRlZmF1bHRcIjtcbiAgICB9XG4gICAgaWYgKCFleHAubmFtZXMgJiYgZXhwLm5hbWUpIHtcbiAgICAgIGV4cC5uYW1lcyA9IFtleHAubmFtZV07XG4gICAgfVxuICB9XG4gIHJldHVybiBleHBvcnRzO1xufVxuXG5mdW5jdGlvbiBmaWxlVVJMVG9QYXRoJDEoaWQpIHtcbiAgaWYgKHR5cGVvZiBpZCA9PT0gXCJzdHJpbmdcIiAmJiAhaWQuc3RhcnRzV2l0aChcImZpbGU6Ly9cIikpIHtcbiAgICByZXR1cm4gbm9ybWFsaXplU2xhc2gkMShpZCk7XG4gIH1cbiAgcmV0dXJuIG5vcm1hbGl6ZVNsYXNoJDEoZmlsZVVSTFRvUGF0aCQyKGlkKSk7XG59XG5jb25zdCBJTlZBTElEX0NIQVJfUkUgPSAvW1xceDAwLVxceDFGXFx4N0Y8PiojXCJ7fXxeW1xcXWA7Lz86QCY9KyQsXSsvZztcbmZ1bmN0aW9uIHNhbml0aXplVVJJQ29tcG9uZW50KG5hbWUgPSBcIlwiLCByZXBsYWNlbWVudCA9IFwiX1wiKSB7XG4gIHJldHVybiBuYW1lLnJlcGxhY2UoSU5WQUxJRF9DSEFSX1JFLCByZXBsYWNlbWVudCk7XG59XG5mdW5jdGlvbiBzYW5pdGl6ZUZpbGVQYXRoKGZpbGVQYXRoID0gXCJcIikge1xuICByZXR1cm4gZmlsZVBhdGguc3BsaXQoL1svXFxcXF0vZykubWFwKChwKSA9PiBzYW5pdGl6ZVVSSUNvbXBvbmVudChwKSkuam9pbihcIi9cIikucmVwbGFjZSgvXihbYS16QS1aXSlfXFwvLywgXCIkMTovXCIpO1xufVxuZnVuY3Rpb24gbm9ybWFsaXplaWQkMShpZCkge1xuICBpZiAodHlwZW9mIGlkICE9PSBcInN0cmluZ1wiKSB7XG4gICAgaWQgPSBpZC50b1N0cmluZygpO1xuICB9XG4gIGlmICgvKG5vZGV8ZGF0YXxodHRwfGh0dHBzfGZpbGUpOi8udGVzdChpZCkpIHtcbiAgICByZXR1cm4gaWQ7XG4gIH1cbiAgaWYgKEJVSUxUSU5fTU9EVUxFUyQxLmhhcyhpZCkpIHtcbiAgICByZXR1cm4gXCJub2RlOlwiICsgaWQ7XG4gIH1cbiAgcmV0dXJuIFwiZmlsZTovL1wiICsgbm9ybWFsaXplU2xhc2gkMShpZCk7XG59XG5hc3luYyBmdW5jdGlvbiBsb2FkVVJMKHVybCkge1xuICBjb25zdCBjb2RlID0gYXdhaXQgcHJvbWlzZXMucmVhZEZpbGUoZmlsZVVSTFRvUGF0aCQxKHVybCksIFwidXRmLThcIik7XG4gIHJldHVybiBjb2RlO1xufVxuZnVuY3Rpb24gdG9EYXRhVVJMKGNvZGUpIHtcbiAgY29uc3QgYmFzZTY0ID0gQnVmZmVyLmZyb20oY29kZSkudG9TdHJpbmcoXCJiYXNlNjRcIik7XG4gIHJldHVybiBgZGF0YTp0ZXh0L2phdmFzY3JpcHQ7YmFzZTY0LCR7YmFzZTY0fWA7XG59XG5mdW5jdGlvbiBpc05vZGVCdWlsdGluKGlkID0gXCJcIikge1xuICBpZCA9IGlkLnJlcGxhY2UoL15ub2RlOi8sIFwiXCIpLnNwbGl0KFwiL1wiKVswXTtcbiAgcmV0dXJuIEJVSUxUSU5fTU9EVUxFUyQxLmhhcyhpZCk7XG59XG5jb25zdCBQcm90b2NvbFJlZ2V4ID0gL14oPzxwcm90bz4uezIsfT8pOi4rJC87XG5mdW5jdGlvbiBnZXRQcm90b2NvbChpZCkge1xuICBjb25zdCBwcm90byA9IGlkLm1hdGNoKFByb3RvY29sUmVnZXgpO1xuICByZXR1cm4gcHJvdG8gPyBwcm90by5ncm91cHMucHJvdG8gOiBudWxsO1xufVxuXG5mdW5jdGlvbiBjcmVhdGVDb21tb25KUyh1cmwpIHtcbiAgY29uc3QgX19maWxlbmFtZSA9IGZpbGVVUkxUb1BhdGgkMSh1cmwpO1xuICBjb25zdCBfX2Rpcm5hbWUgPSBkaXJuYW1lJDIoX19maWxlbmFtZSk7XG4gIGxldCBfbmF0aXZlUmVxdWlyZTtcbiAgY29uc3QgZ2V0TmF0aXZlUmVxdWlyZSA9ICgpID0+IF9uYXRpdmVSZXF1aXJlIHx8IChfbmF0aXZlUmVxdWlyZSA9IGNyZWF0ZVJlcXVpcmUodXJsKSk7XG4gIGZ1bmN0aW9uIHJlcXVpcmUoaWQpIHtcbiAgICByZXR1cm4gZ2V0TmF0aXZlUmVxdWlyZSgpKGlkKTtcbiAgfVxuICByZXF1aXJlLnJlc29sdmUgPSAoaWQsIG9wdGlvbnMpID0+IGdldE5hdGl2ZVJlcXVpcmUoKS5yZXNvbHZlKGlkLCBvcHRpb25zKTtcbiAgcmV0dXJuIHtcbiAgICBfX2ZpbGVuYW1lLFxuICAgIF9fZGlybmFtZSxcbiAgICByZXF1aXJlXG4gIH07XG59XG5mdW5jdGlvbiBpbnRlcm9wRGVmYXVsdChzb3VyY2VNb2R1bGUpIHtcbiAgaWYgKCFpc09iamVjdChzb3VyY2VNb2R1bGUpIHx8ICEoXCJkZWZhdWx0XCIgaW4gc291cmNlTW9kdWxlKSkge1xuICAgIHJldHVybiBzb3VyY2VNb2R1bGU7XG4gIH1cbiAgY29uc3QgbmV3TW9kdWxlID0gc291cmNlTW9kdWxlLmRlZmF1bHQ7XG4gIGZvciAoY29uc3Qga2V5IGluIHNvdXJjZU1vZHVsZSkge1xuICAgIGlmIChrZXkgPT09IFwiZGVmYXVsdFwiKSB7XG4gICAgICB0cnkge1xuICAgICAgICBpZiAoIShrZXkgaW4gbmV3TW9kdWxlKSkge1xuICAgICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShuZXdNb2R1bGUsIGtleSwge1xuICAgICAgICAgICAgZW51bWVyYWJsZTogZmFsc2UsXG4gICAgICAgICAgICBjb25maWd1cmFibGU6IGZhbHNlLFxuICAgICAgICAgICAgZ2V0KCkge1xuICAgICAgICAgICAgICByZXR1cm4gbmV3TW9kdWxlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICB9IGNhdGNoIChfZXJyKSB7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGlmICghKGtleSBpbiBuZXdNb2R1bGUpKSB7XG4gICAgICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KG5ld01vZHVsZSwga2V5LCB7XG4gICAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgZ2V0KCkge1xuICAgICAgICAgICAgICByZXR1cm4gc291cmNlTW9kdWxlW2tleV07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgIH0gY2F0Y2ggKF9lcnIpIHtcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgcmV0dXJuIG5ld01vZHVsZTtcbn1cblxuZnVuY3Rpb24gbm9ybWFsaXplV2luZG93c1BhdGgkMShpbnB1dCA9IFwiXCIpIHtcbiAgaWYgKCFpbnB1dC5pbmNsdWRlcyhcIlxcXFxcIikpIHtcbiAgICByZXR1cm4gaW5wdXQ7XG4gIH1cbiAgcmV0dXJuIGlucHV0LnJlcGxhY2UoL1xcXFwvZywgXCIvXCIpO1xufVxuXG5jb25zdCBfVU5DX1JFR0VYJDEgPSAvXlsvXVsvXS87XG5jb25zdCBfVU5DX0RSSVZFX1JFR0VYJDEgPSAvXlsvXVsvXShbLl17MSwyfVsvXSk/KFthLXpBLVpdKTpbL10vO1xuY29uc3QgX0lTX0FCU09MVVRFX1JFJDEgPSAvXlxcL3xeXFxcXHxeW2EtekEtWl06Wy9cXFxcXS87XG5jb25zdCBzZXAkMSA9IFwiL1wiO1xuY29uc3QgZGVsaW1pdGVyJDEgPSBcIjpcIjtcbmNvbnN0IG5vcm1hbGl6ZSQxID0gZnVuY3Rpb24ocGF0aDIpIHtcbiAgaWYgKHBhdGgyLmxlbmd0aCA9PT0gMCkge1xuICAgIHJldHVybiBcIi5cIjtcbiAgfVxuICBwYXRoMiA9IG5vcm1hbGl6ZVdpbmRvd3NQYXRoJDEocGF0aDIpO1xuICBjb25zdCBpc1VOQ1BhdGggPSBwYXRoMi5tYXRjaChfVU5DX1JFR0VYJDEpO1xuICBjb25zdCBoYXNVTkNEcml2ZSA9IGlzVU5DUGF0aCAmJiBwYXRoMi5tYXRjaChfVU5DX0RSSVZFX1JFR0VYJDEpO1xuICBjb25zdCBpc1BhdGhBYnNvbHV0ZSA9IGlzQWJzb2x1dGUkMShwYXRoMik7XG4gIGNvbnN0IHRyYWlsaW5nU2VwYXJhdG9yID0gcGF0aDJbcGF0aDIubGVuZ3RoIC0gMV0gPT09IFwiL1wiO1xuICBwYXRoMiA9IG5vcm1hbGl6ZVN0cmluZyQxKHBhdGgyLCAhaXNQYXRoQWJzb2x1dGUpO1xuICBpZiAocGF0aDIubGVuZ3RoID09PSAwKSB7XG4gICAgaWYgKGlzUGF0aEFic29sdXRlKSB7XG4gICAgICByZXR1cm4gXCIvXCI7XG4gICAgfVxuICAgIHJldHVybiB0cmFpbGluZ1NlcGFyYXRvciA/IFwiLi9cIiA6IFwiLlwiO1xuICB9XG4gIGlmICh0cmFpbGluZ1NlcGFyYXRvcikge1xuICAgIHBhdGgyICs9IFwiL1wiO1xuICB9XG4gIGlmIChpc1VOQ1BhdGgpIHtcbiAgICBpZiAoaGFzVU5DRHJpdmUpIHtcbiAgICAgIHJldHVybiBgLy8uLyR7cGF0aDJ9YDtcbiAgICB9XG4gICAgcmV0dXJuIGAvLyR7cGF0aDJ9YDtcbiAgfVxuICByZXR1cm4gaXNQYXRoQWJzb2x1dGUgJiYgIWlzQWJzb2x1dGUkMShwYXRoMikgPyBgLyR7cGF0aDJ9YCA6IHBhdGgyO1xufTtcbmNvbnN0IGpvaW4kMSA9IGZ1bmN0aW9uKC4uLmFyZ3MpIHtcbiAgaWYgKGFyZ3MubGVuZ3RoID09PSAwKSB7XG4gICAgcmV0dXJuIFwiLlwiO1xuICB9XG4gIGxldCBqb2luZWQ7XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgYXJncy5sZW5ndGg7ICsraSkge1xuICAgIGNvbnN0IGFyZyA9IGFyZ3NbaV07XG4gICAgaWYgKGFyZy5sZW5ndGggPiAwKSB7XG4gICAgICBpZiAoam9pbmVkID09PSB2b2lkIDApIHtcbiAgICAgICAgam9pbmVkID0gYXJnO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgam9pbmVkICs9IGAvJHthcmd9YDtcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgaWYgKGpvaW5lZCA9PT0gdm9pZCAwKSB7XG4gICAgcmV0dXJuIFwiLlwiO1xuICB9XG4gIHJldHVybiBub3JtYWxpemUkMShqb2luZWQpO1xufTtcbmNvbnN0IHJlc29sdmUkMiA9IGZ1bmN0aW9uKC4uLmFyZ3MpIHtcbiAgYXJncyA9IGFyZ3MubWFwKChhcmcpID0+IG5vcm1hbGl6ZVdpbmRvd3NQYXRoJDEoYXJnKSk7XG4gIGxldCByZXNvbHZlZFBhdGggPSBcIlwiO1xuICBsZXQgcmVzb2x2ZWRBYnNvbHV0ZSA9IGZhbHNlO1xuICBmb3IgKGxldCBpID0gYXJncy5sZW5ndGggLSAxOyBpID49IC0xICYmICFyZXNvbHZlZEFic29sdXRlOyBpLS0pIHtcbiAgICBjb25zdCBwYXRoMiA9IGkgPj0gMCA/IGFyZ3NbaV0gOiBwcm9jZXNzLmN3ZCgpO1xuICAgIGlmIChwYXRoMi5sZW5ndGggPT09IDApIHtcbiAgICAgIGNvbnRpbnVlO1xuICAgIH1cbiAgICByZXNvbHZlZFBhdGggPSBgJHtwYXRoMn0vJHtyZXNvbHZlZFBhdGh9YDtcbiAgICByZXNvbHZlZEFic29sdXRlID0gaXNBYnNvbHV0ZSQxKHBhdGgyKTtcbiAgfVxuICByZXNvbHZlZFBhdGggPSBub3JtYWxpemVTdHJpbmckMShyZXNvbHZlZFBhdGgsICFyZXNvbHZlZEFic29sdXRlKTtcbiAgaWYgKHJlc29sdmVkQWJzb2x1dGUgJiYgIWlzQWJzb2x1dGUkMShyZXNvbHZlZFBhdGgpKSB7XG4gICAgcmV0dXJuIGAvJHtyZXNvbHZlZFBhdGh9YDtcbiAgfVxuICByZXR1cm4gcmVzb2x2ZWRQYXRoLmxlbmd0aCA+IDAgPyByZXNvbHZlZFBhdGggOiBcIi5cIjtcbn07XG5mdW5jdGlvbiBub3JtYWxpemVTdHJpbmckMShwYXRoMiwgYWxsb3dBYm92ZVJvb3QpIHtcbiAgbGV0IHJlcyA9IFwiXCI7XG4gIGxldCBsYXN0U2VnbWVudExlbmd0aCA9IDA7XG4gIGxldCBsYXN0U2xhc2ggPSAtMTtcbiAgbGV0IGRvdHMgPSAwO1xuICBsZXQgY2hhciA9IG51bGw7XG4gIGZvciAobGV0IGkgPSAwOyBpIDw9IHBhdGgyLmxlbmd0aDsgKytpKSB7XG4gICAgaWYgKGkgPCBwYXRoMi5sZW5ndGgpIHtcbiAgICAgIGNoYXIgPSBwYXRoMltpXTtcbiAgICB9IGVsc2UgaWYgKGNoYXIgPT09IFwiL1wiKSB7XG4gICAgICBicmVhaztcbiAgICB9IGVsc2Uge1xuICAgICAgY2hhciA9IFwiL1wiO1xuICAgIH1cbiAgICBpZiAoY2hhciA9PT0gXCIvXCIpIHtcbiAgICAgIGlmIChsYXN0U2xhc2ggPT09IGkgLSAxIHx8IGRvdHMgPT09IDEpIDsgZWxzZSBpZiAoZG90cyA9PT0gMikge1xuICAgICAgICBpZiAocmVzLmxlbmd0aCA8IDIgfHwgbGFzdFNlZ21lbnRMZW5ndGggIT09IDIgfHwgcmVzW3Jlcy5sZW5ndGggLSAxXSAhPT0gXCIuXCIgfHwgcmVzW3Jlcy5sZW5ndGggLSAyXSAhPT0gXCIuXCIpIHtcbiAgICAgICAgICBpZiAocmVzLmxlbmd0aCA+IDIpIHtcbiAgICAgICAgICAgIGNvbnN0IGxhc3RTbGFzaEluZGV4ID0gcmVzLmxhc3RJbmRleE9mKFwiL1wiKTtcbiAgICAgICAgICAgIGlmIChsYXN0U2xhc2hJbmRleCA9PT0gLTEpIHtcbiAgICAgICAgICAgICAgcmVzID0gXCJcIjtcbiAgICAgICAgICAgICAgbGFzdFNlZ21lbnRMZW5ndGggPSAwO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgcmVzID0gcmVzLnNsaWNlKDAsIGxhc3RTbGFzaEluZGV4KTtcbiAgICAgICAgICAgICAgbGFzdFNlZ21lbnRMZW5ndGggPSByZXMubGVuZ3RoIC0gMSAtIHJlcy5sYXN0SW5kZXhPZihcIi9cIik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBsYXN0U2xhc2ggPSBpO1xuICAgICAgICAgICAgZG90cyA9IDA7XG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICB9IGVsc2UgaWYgKHJlcy5sZW5ndGggIT09IDApIHtcbiAgICAgICAgICAgIHJlcyA9IFwiXCI7XG4gICAgICAgICAgICBsYXN0U2VnbWVudExlbmd0aCA9IDA7XG4gICAgICAgICAgICBsYXN0U2xhc2ggPSBpO1xuICAgICAgICAgICAgZG90cyA9IDA7XG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGFsbG93QWJvdmVSb290KSB7XG4gICAgICAgICAgcmVzICs9IHJlcy5sZW5ndGggPiAwID8gXCIvLi5cIiA6IFwiLi5cIjtcbiAgICAgICAgICBsYXN0U2VnbWVudExlbmd0aCA9IDI7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGlmIChyZXMubGVuZ3RoID4gMCkge1xuICAgICAgICAgIHJlcyArPSBgLyR7cGF0aDIuc2xpY2UobGFzdFNsYXNoICsgMSwgaSl9YDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXMgPSBwYXRoMi5zbGljZShsYXN0U2xhc2ggKyAxLCBpKTtcbiAgICAgICAgfVxuICAgICAgICBsYXN0U2VnbWVudExlbmd0aCA9IGkgLSBsYXN0U2xhc2ggLSAxO1xuICAgICAgfVxuICAgICAgbGFzdFNsYXNoID0gaTtcbiAgICAgIGRvdHMgPSAwO1xuICAgIH0gZWxzZSBpZiAoY2hhciA9PT0gXCIuXCIgJiYgZG90cyAhPT0gLTEpIHtcbiAgICAgICsrZG90cztcbiAgICB9IGVsc2Uge1xuICAgICAgZG90cyA9IC0xO1xuICAgIH1cbiAgfVxuICByZXR1cm4gcmVzO1xufVxuY29uc3QgaXNBYnNvbHV0ZSQxID0gZnVuY3Rpb24ocCkge1xuICByZXR1cm4gX0lTX0FCU09MVVRFX1JFJDEudGVzdChwKTtcbn07XG5jb25zdCB0b05hbWVzcGFjZWRQYXRoJDEgPSBmdW5jdGlvbihwKSB7XG4gIHJldHVybiBub3JtYWxpemVXaW5kb3dzUGF0aCQxKHApO1xufTtcbmNvbnN0IGV4dG5hbWUkMSA9IGZ1bmN0aW9uKHApIHtcbiAgcmV0dXJuIHBhdGgucG9zaXguZXh0bmFtZShub3JtYWxpemVXaW5kb3dzUGF0aCQxKHApKTtcbn07XG5jb25zdCByZWxhdGl2ZSQxID0gZnVuY3Rpb24oZnJvbSwgdG8pIHtcbiAgcmV0dXJuIHBhdGgucG9zaXgucmVsYXRpdmUobm9ybWFsaXplV2luZG93c1BhdGgkMShmcm9tKSwgbm9ybWFsaXplV2luZG93c1BhdGgkMSh0bykpO1xufTtcbmNvbnN0IGRpcm5hbWUkMSA9IGZ1bmN0aW9uKHApIHtcbiAgcmV0dXJuIHBhdGgucG9zaXguZGlybmFtZShub3JtYWxpemVXaW5kb3dzUGF0aCQxKHApKTtcbn07XG5jb25zdCBmb3JtYXQkMSA9IGZ1bmN0aW9uKHApIHtcbiAgcmV0dXJuIG5vcm1hbGl6ZVdpbmRvd3NQYXRoJDEocGF0aC5wb3NpeC5mb3JtYXQocCkpO1xufTtcbmNvbnN0IGJhc2VuYW1lJDEgPSBmdW5jdGlvbihwLCBleHQpIHtcbiAgcmV0dXJuIHBhdGgucG9zaXguYmFzZW5hbWUobm9ybWFsaXplV2luZG93c1BhdGgkMShwKSwgZXh0KTtcbn07XG5jb25zdCBwYXJzZSRkID0gZnVuY3Rpb24ocCkge1xuICByZXR1cm4gcGF0aC5wb3NpeC5wYXJzZShub3JtYWxpemVXaW5kb3dzUGF0aCQxKHApKTtcbn07XG5cbmNvbnN0IF9wYXRoJDEgPSAvKiNfX1BVUkVfXyovT2JqZWN0LmZyZWV6ZSh7XG4gIF9fcHJvdG9fXzogbnVsbCxcbiAgc2VwOiBzZXAkMSxcbiAgZGVsaW1pdGVyOiBkZWxpbWl0ZXIkMSxcbiAgbm9ybWFsaXplOiBub3JtYWxpemUkMSxcbiAgam9pbjogam9pbiQxLFxuICByZXNvbHZlOiByZXNvbHZlJDIsXG4gIG5vcm1hbGl6ZVN0cmluZzogbm9ybWFsaXplU3RyaW5nJDEsXG4gIGlzQWJzb2x1dGU6IGlzQWJzb2x1dGUkMSxcbiAgdG9OYW1lc3BhY2VkUGF0aDogdG9OYW1lc3BhY2VkUGF0aCQxLFxuICBleHRuYW1lOiBleHRuYW1lJDEsXG4gIHJlbGF0aXZlOiByZWxhdGl2ZSQxLFxuICBkaXJuYW1lOiBkaXJuYW1lJDEsXG4gIGZvcm1hdDogZm9ybWF0JDEsXG4gIGJhc2VuYW1lOiBiYXNlbmFtZSQxLFxuICBwYXJzZTogcGFyc2UkZFxufSk7XG5cbih7XG4gIC4uLl9wYXRoJDFcbn0pO1xuXG52YXIgcmUkYiA9IHtleHBvcnRzOiB7fX07XG5cbi8vIE5vdGU6IHRoaXMgaXMgdGhlIHNlbXZlci5vcmcgdmVyc2lvbiBvZiB0aGUgc3BlYyB0aGF0IGl0IGltcGxlbWVudHNcbi8vIE5vdCBuZWNlc3NhcmlseSB0aGUgcGFja2FnZSB2ZXJzaW9uIG9mIHRoaXMgY29kZS5cbmNvbnN0IFNFTVZFUl9TUEVDX1ZFUlNJT04kMSA9ICcyLjAuMCc7XG5cbmNvbnN0IE1BWF9MRU5HVEgkNSA9IDI1NjtcbmNvbnN0IE1BWF9TQUZFX0lOVEVHRVIkMyA9IE51bWJlci5NQVhfU0FGRV9JTlRFR0VSIHx8XG4gIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovIDkwMDcxOTkyNTQ3NDA5OTE7XG5cbi8vIE1heCBzYWZlIHNlZ21lbnQgbGVuZ3RoIGZvciBjb2VyY2lvbi5cbmNvbnN0IE1BWF9TQUZFX0NPTVBPTkVOVF9MRU5HVEgkMSA9IDE2O1xuXG52YXIgY29uc3RhbnRzJDEgPSB7XG4gIFNFTVZFUl9TUEVDX1ZFUlNJT046IFNFTVZFUl9TUEVDX1ZFUlNJT04kMSxcbiAgTUFYX0xFTkdUSDogTUFYX0xFTkdUSCQ1LFxuICBNQVhfU0FGRV9JTlRFR0VSOiBNQVhfU0FGRV9JTlRFR0VSJDMsXG4gIE1BWF9TQUZFX0NPTVBPTkVOVF9MRU5HVEg6IE1BWF9TQUZFX0NPTVBPTkVOVF9MRU5HVEgkMVxufTtcblxuY29uc3QgZGVidWckNyA9IChcbiAgdHlwZW9mIHByb2Nlc3MgPT09ICdvYmplY3QnICYmXG4gIHByb2Nlc3MuZW52ICYmXG4gIHByb2Nlc3MuZW52Lk5PREVfREVCVUcgJiZcbiAgL1xcYnNlbXZlclxcYi9pLnRlc3QocHJvY2Vzcy5lbnYuTk9ERV9ERUJVRylcbikgPyAoLi4uYXJncykgPT4gY29uc29sZS5lcnJvcignU0VNVkVSJywgLi4uYXJncylcbiAgOiAoKSA9PiB7fTtcblxudmFyIGRlYnVnXzEkMSA9IGRlYnVnJDc7XG5cbihmdW5jdGlvbiAobW9kdWxlLCBleHBvcnRzKSB7XG5jb25zdCB7IE1BWF9TQUZFX0NPTVBPTkVOVF9MRU5HVEggfSA9IGNvbnN0YW50cyQxO1xuY29uc3QgZGVidWcgPSBkZWJ1Z18xJDE7XG5leHBvcnRzID0gbW9kdWxlLmV4cG9ydHMgPSB7fTtcblxuLy8gVGhlIGFjdHVhbCByZWdleHBzIGdvIG9uIGV4cG9ydHMucmVcbmNvbnN0IHJlID0gZXhwb3J0cy5yZSA9IFtdO1xuY29uc3Qgc3JjID0gZXhwb3J0cy5zcmMgPSBbXTtcbmNvbnN0IHQgPSBleHBvcnRzLnQgPSB7fTtcbmxldCBSID0gMDtcblxuY29uc3QgY3JlYXRlVG9rZW4gPSAobmFtZSwgdmFsdWUsIGlzR2xvYmFsKSA9PiB7XG4gIGNvbnN0IGluZGV4ID0gUisrO1xuICBkZWJ1ZyhpbmRleCwgdmFsdWUpO1xuICB0W25hbWVdID0gaW5kZXg7XG4gIHNyY1tpbmRleF0gPSB2YWx1ZTtcbiAgcmVbaW5kZXhdID0gbmV3IFJlZ0V4cCh2YWx1ZSwgaXNHbG9iYWwgPyAnZycgOiB1bmRlZmluZWQpO1xufTtcblxuLy8gVGhlIGZvbGxvd2luZyBSZWd1bGFyIEV4cHJlc3Npb25zIGNhbiBiZSB1c2VkIGZvciB0b2tlbml6aW5nLFxuLy8gdmFsaWRhdGluZywgYW5kIHBhcnNpbmcgU2VtVmVyIHZlcnNpb24gc3RyaW5ncy5cblxuLy8gIyMgTnVtZXJpYyBJZGVudGlmaWVyXG4vLyBBIHNpbmdsZSBgMGAsIG9yIGEgbm9uLXplcm8gZGlnaXQgZm9sbG93ZWQgYnkgemVybyBvciBtb3JlIGRpZ2l0cy5cblxuY3JlYXRlVG9rZW4oJ05VTUVSSUNJREVOVElGSUVSJywgJzB8WzEtOV1cXFxcZConKTtcbmNyZWF0ZVRva2VuKCdOVU1FUklDSURFTlRJRklFUkxPT1NFJywgJ1swLTldKycpO1xuXG4vLyAjIyBOb24tbnVtZXJpYyBJZGVudGlmaWVyXG4vLyBaZXJvIG9yIG1vcmUgZGlnaXRzLCBmb2xsb3dlZCBieSBhIGxldHRlciBvciBoeXBoZW4sIGFuZCB0aGVuIHplcm8gb3Jcbi8vIG1vcmUgbGV0dGVycywgZGlnaXRzLCBvciBoeXBoZW5zLlxuXG5jcmVhdGVUb2tlbignTk9OTlVNRVJJQ0lERU5USUZJRVInLCAnXFxcXGQqW2EtekEtWi1dW2EtekEtWjAtOS1dKicpO1xuXG4vLyAjIyBNYWluIFZlcnNpb25cbi8vIFRocmVlIGRvdC1zZXBhcmF0ZWQgbnVtZXJpYyBpZGVudGlmaWVycy5cblxuY3JlYXRlVG9rZW4oJ01BSU5WRVJTSU9OJywgYCgke3NyY1t0Lk5VTUVSSUNJREVOVElGSUVSXX0pXFxcXC5gICtcbiAgICAgICAgICAgICAgICAgICBgKCR7c3JjW3QuTlVNRVJJQ0lERU5USUZJRVJdfSlcXFxcLmAgK1xuICAgICAgICAgICAgICAgICAgIGAoJHtzcmNbdC5OVU1FUklDSURFTlRJRklFUl19KWApO1xuXG5jcmVhdGVUb2tlbignTUFJTlZFUlNJT05MT09TRScsIGAoJHtzcmNbdC5OVU1FUklDSURFTlRJRklFUkxPT1NFXX0pXFxcXC5gICtcbiAgICAgICAgICAgICAgICAgICAgICAgIGAoJHtzcmNbdC5OVU1FUklDSURFTlRJRklFUkxPT1NFXX0pXFxcXC5gICtcbiAgICAgICAgICAgICAgICAgICAgICAgIGAoJHtzcmNbdC5OVU1FUklDSURFTlRJRklFUkxPT1NFXX0pYCk7XG5cbi8vICMjIFByZS1yZWxlYXNlIFZlcnNpb24gSWRlbnRpZmllclxuLy8gQSBudW1lcmljIGlkZW50aWZpZXIsIG9yIGEgbm9uLW51bWVyaWMgaWRlbnRpZmllci5cblxuY3JlYXRlVG9rZW4oJ1BSRVJFTEVBU0VJREVOVElGSUVSJywgYCg/OiR7c3JjW3QuTlVNRVJJQ0lERU5USUZJRVJdXG59fCR7c3JjW3QuTk9OTlVNRVJJQ0lERU5USUZJRVJdfSlgKTtcblxuY3JlYXRlVG9rZW4oJ1BSRVJFTEVBU0VJREVOVElGSUVSTE9PU0UnLCBgKD86JHtzcmNbdC5OVU1FUklDSURFTlRJRklFUkxPT1NFXVxufXwke3NyY1t0Lk5PTk5VTUVSSUNJREVOVElGSUVSXX0pYCk7XG5cbi8vICMjIFByZS1yZWxlYXNlIFZlcnNpb25cbi8vIEh5cGhlbiwgZm9sbG93ZWQgYnkgb25lIG9yIG1vcmUgZG90LXNlcGFyYXRlZCBwcmUtcmVsZWFzZSB2ZXJzaW9uXG4vLyBpZGVudGlmaWVycy5cblxuY3JlYXRlVG9rZW4oJ1BSRVJFTEVBU0UnLCBgKD86LSgke3NyY1t0LlBSRVJFTEVBU0VJREVOVElGSUVSXVxufSg/OlxcXFwuJHtzcmNbdC5QUkVSRUxFQVNFSURFTlRJRklFUl19KSopKWApO1xuXG5jcmVhdGVUb2tlbignUFJFUkVMRUFTRUxPT1NFJywgYCg/Oi0/KCR7c3JjW3QuUFJFUkVMRUFTRUlERU5USUZJRVJMT09TRV1cbn0oPzpcXFxcLiR7c3JjW3QuUFJFUkVMRUFTRUlERU5USUZJRVJMT09TRV19KSopKWApO1xuXG4vLyAjIyBCdWlsZCBNZXRhZGF0YSBJZGVudGlmaWVyXG4vLyBBbnkgY29tYmluYXRpb24gb2YgZGlnaXRzLCBsZXR0ZXJzLCBvciBoeXBoZW5zLlxuXG5jcmVhdGVUb2tlbignQlVJTERJREVOVElGSUVSJywgJ1swLTlBLVphLXotXSsnKTtcblxuLy8gIyMgQnVpbGQgTWV0YWRhdGFcbi8vIFBsdXMgc2lnbiwgZm9sbG93ZWQgYnkgb25lIG9yIG1vcmUgcGVyaW9kLXNlcGFyYXRlZCBidWlsZCBtZXRhZGF0YVxuLy8gaWRlbnRpZmllcnMuXG5cbmNyZWF0ZVRva2VuKCdCVUlMRCcsIGAoPzpcXFxcKygke3NyY1t0LkJVSUxESURFTlRJRklFUl1cbn0oPzpcXFxcLiR7c3JjW3QuQlVJTERJREVOVElGSUVSXX0pKikpYCk7XG5cbi8vICMjIEZ1bGwgVmVyc2lvbiBTdHJpbmdcbi8vIEEgbWFpbiB2ZXJzaW9uLCBmb2xsb3dlZCBvcHRpb25hbGx5IGJ5IGEgcHJlLXJlbGVhc2UgdmVyc2lvbiBhbmRcbi8vIGJ1aWxkIG1ldGFkYXRhLlxuXG4vLyBOb3RlIHRoYXQgdGhlIG9ubHkgbWFqb3IsIG1pbm9yLCBwYXRjaCwgYW5kIHByZS1yZWxlYXNlIHNlY3Rpb25zIG9mXG4vLyB0aGUgdmVyc2lvbiBzdHJpbmcgYXJlIGNhcHR1cmluZyBncm91cHMuICBUaGUgYnVpbGQgbWV0YWRhdGEgaXMgbm90IGFcbi8vIGNhcHR1cmluZyBncm91cCwgYmVjYXVzZSBpdCBzaG91bGQgbm90IGV2ZXIgYmUgdXNlZCBpbiB2ZXJzaW9uXG4vLyBjb21wYXJpc29uLlxuXG5jcmVhdGVUb2tlbignRlVMTFBMQUlOJywgYHY/JHtzcmNbdC5NQUlOVkVSU0lPTl1cbn0ke3NyY1t0LlBSRVJFTEVBU0VdfT8ke1xuICBzcmNbdC5CVUlMRF19P2ApO1xuXG5jcmVhdGVUb2tlbignRlVMTCcsIGBeJHtzcmNbdC5GVUxMUExBSU5dfSRgKTtcblxuLy8gbGlrZSBmdWxsLCBidXQgYWxsb3dzIHYxLjIuMyBhbmQgPTEuMi4zLCB3aGljaCBwZW9wbGUgZG8gc29tZXRpbWVzLlxuLy8gYWxzbywgMS4wLjBhbHBoYTEgKHByZXJlbGVhc2Ugd2l0aG91dCB0aGUgaHlwaGVuKSB3aGljaCBpcyBwcmV0dHlcbi8vIGNvbW1vbiBpbiB0aGUgbnBtIHJlZ2lzdHJ5LlxuY3JlYXRlVG9rZW4oJ0xPT1NFUExBSU4nLCBgW3Y9XFxcXHNdKiR7c3JjW3QuTUFJTlZFUlNJT05MT09TRV1cbn0ke3NyY1t0LlBSRVJFTEVBU0VMT09TRV19PyR7XG4gIHNyY1t0LkJVSUxEXX0/YCk7XG5cbmNyZWF0ZVRva2VuKCdMT09TRScsIGBeJHtzcmNbdC5MT09TRVBMQUlOXX0kYCk7XG5cbmNyZWF0ZVRva2VuKCdHVExUJywgJygoPzo8fD4pPz0/KScpO1xuXG4vLyBTb21ldGhpbmcgbGlrZSBcIjIuKlwiIG9yIFwiMS4yLnhcIi5cbi8vIE5vdGUgdGhhdCBcIngueFwiIGlzIGEgdmFsaWQgeFJhbmdlIGlkZW50aWZlciwgbWVhbmluZyBcImFueSB2ZXJzaW9uXCJcbi8vIE9ubHkgdGhlIGZpcnN0IGl0ZW0gaXMgc3RyaWN0bHkgcmVxdWlyZWQuXG5jcmVhdGVUb2tlbignWFJBTkdFSURFTlRJRklFUkxPT1NFJywgYCR7c3JjW3QuTlVNRVJJQ0lERU5USUZJRVJMT09TRV19fHh8WHxcXFxcKmApO1xuY3JlYXRlVG9rZW4oJ1hSQU5HRUlERU5USUZJRVInLCBgJHtzcmNbdC5OVU1FUklDSURFTlRJRklFUl19fHh8WHxcXFxcKmApO1xuXG5jcmVhdGVUb2tlbignWFJBTkdFUExBSU4nLCBgW3Y9XFxcXHNdKigke3NyY1t0LlhSQU5HRUlERU5USUZJRVJdfSlgICtcbiAgICAgICAgICAgICAgICAgICBgKD86XFxcXC4oJHtzcmNbdC5YUkFOR0VJREVOVElGSUVSXX0pYCArXG4gICAgICAgICAgICAgICAgICAgYCg/OlxcXFwuKCR7c3JjW3QuWFJBTkdFSURFTlRJRklFUl19KWAgK1xuICAgICAgICAgICAgICAgICAgIGAoPzoke3NyY1t0LlBSRVJFTEVBU0VdfSk/JHtcbiAgICAgICAgICAgICAgICAgICAgIHNyY1t0LkJVSUxEXX0/YCArXG4gICAgICAgICAgICAgICAgICAgYCk/KT9gKTtcblxuY3JlYXRlVG9rZW4oJ1hSQU5HRVBMQUlOTE9PU0UnLCBgW3Y9XFxcXHNdKigke3NyY1t0LlhSQU5HRUlERU5USUZJRVJMT09TRV19KWAgK1xuICAgICAgICAgICAgICAgICAgICAgICAgYCg/OlxcXFwuKCR7c3JjW3QuWFJBTkdFSURFTlRJRklFUkxPT1NFXX0pYCArXG4gICAgICAgICAgICAgICAgICAgICAgICBgKD86XFxcXC4oJHtzcmNbdC5YUkFOR0VJREVOVElGSUVSTE9PU0VdfSlgICtcbiAgICAgICAgICAgICAgICAgICAgICAgIGAoPzoke3NyY1t0LlBSRVJFTEVBU0VMT09TRV19KT8ke1xuICAgICAgICAgICAgICAgICAgICAgICAgICBzcmNbdC5CVUlMRF19P2AgK1xuICAgICAgICAgICAgICAgICAgICAgICAgYCk/KT9gKTtcblxuY3JlYXRlVG9rZW4oJ1hSQU5HRScsIGBeJHtzcmNbdC5HVExUXX1cXFxccyoke3NyY1t0LlhSQU5HRVBMQUlOXX0kYCk7XG5jcmVhdGVUb2tlbignWFJBTkdFTE9PU0UnLCBgXiR7c3JjW3QuR1RMVF19XFxcXHMqJHtzcmNbdC5YUkFOR0VQTEFJTkxPT1NFXX0kYCk7XG5cbi8vIENvZXJjaW9uLlxuLy8gRXh0cmFjdCBhbnl0aGluZyB0aGF0IGNvdWxkIGNvbmNlaXZhYmx5IGJlIGEgcGFydCBvZiBhIHZhbGlkIHNlbXZlclxuY3JlYXRlVG9rZW4oJ0NPRVJDRScsIGAkeycoXnxbXlxcXFxkXSknICtcbiAgICAgICAgICAgICAgJyhcXFxcZHsxLCd9JHtNQVhfU0FGRV9DT01QT05FTlRfTEVOR1RIfX0pYCArXG4gICAgICAgICAgICAgIGAoPzpcXFxcLihcXFxcZHsxLCR7TUFYX1NBRkVfQ09NUE9ORU5UX0xFTkdUSH19KSk/YCArXG4gICAgICAgICAgICAgIGAoPzpcXFxcLihcXFxcZHsxLCR7TUFYX1NBRkVfQ09NUE9ORU5UX0xFTkdUSH19KSk/YCArXG4gICAgICAgICAgICAgIGAoPzokfFteXFxcXGRdKWApO1xuY3JlYXRlVG9rZW4oJ0NPRVJDRVJUTCcsIHNyY1t0LkNPRVJDRV0sIHRydWUpO1xuXG4vLyBUaWxkZSByYW5nZXMuXG4vLyBNZWFuaW5nIGlzIFwicmVhc29uYWJseSBhdCBvciBncmVhdGVyIHRoYW5cIlxuY3JlYXRlVG9rZW4oJ0xPTkVUSUxERScsICcoPzp+Pj8pJyk7XG5cbmNyZWF0ZVRva2VuKCdUSUxERVRSSU0nLCBgKFxcXFxzKikke3NyY1t0LkxPTkVUSUxERV19XFxcXHMrYCwgdHJ1ZSk7XG5leHBvcnRzLnRpbGRlVHJpbVJlcGxhY2UgPSAnJDF+JztcblxuY3JlYXRlVG9rZW4oJ1RJTERFJywgYF4ke3NyY1t0LkxPTkVUSUxERV19JHtzcmNbdC5YUkFOR0VQTEFJTl19JGApO1xuY3JlYXRlVG9rZW4oJ1RJTERFTE9PU0UnLCBgXiR7c3JjW3QuTE9ORVRJTERFXX0ke3NyY1t0LlhSQU5HRVBMQUlOTE9PU0VdfSRgKTtcblxuLy8gQ2FyZXQgcmFuZ2VzLlxuLy8gTWVhbmluZyBpcyBcImF0IGxlYXN0IGFuZCBiYWNrd2FyZHMgY29tcGF0aWJsZSB3aXRoXCJcbmNyZWF0ZVRva2VuKCdMT05FQ0FSRVQnLCAnKD86XFxcXF4pJyk7XG5cbmNyZWF0ZVRva2VuKCdDQVJFVFRSSU0nLCBgKFxcXFxzKikke3NyY1t0LkxPTkVDQVJFVF19XFxcXHMrYCwgdHJ1ZSk7XG5leHBvcnRzLmNhcmV0VHJpbVJlcGxhY2UgPSAnJDFeJztcblxuY3JlYXRlVG9rZW4oJ0NBUkVUJywgYF4ke3NyY1t0LkxPTkVDQVJFVF19JHtzcmNbdC5YUkFOR0VQTEFJTl19JGApO1xuY3JlYXRlVG9rZW4oJ0NBUkVUTE9PU0UnLCBgXiR7c3JjW3QuTE9ORUNBUkVUXX0ke3NyY1t0LlhSQU5HRVBMQUlOTE9PU0VdfSRgKTtcblxuLy8gQSBzaW1wbGUgZ3QvbHQvZXEgdGhpbmcsIG9yIGp1c3QgXCJcIiB0byBpbmRpY2F0ZSBcImFueSB2ZXJzaW9uXCJcbmNyZWF0ZVRva2VuKCdDT01QQVJBVE9STE9PU0UnLCBgXiR7c3JjW3QuR1RMVF19XFxcXHMqKCR7c3JjW3QuTE9PU0VQTEFJTl19KSR8XiRgKTtcbmNyZWF0ZVRva2VuKCdDT01QQVJBVE9SJywgYF4ke3NyY1t0LkdUTFRdfVxcXFxzKigke3NyY1t0LkZVTExQTEFJTl19KSR8XiRgKTtcblxuLy8gQW4gZXhwcmVzc2lvbiB0byBzdHJpcCBhbnkgd2hpdGVzcGFjZSBiZXR3ZWVuIHRoZSBndGx0IGFuZCB0aGUgdGhpbmdcbi8vIGl0IG1vZGlmaWVzLCBzbyB0aGF0IGA+IDEuMi4zYCA9PT4gYD4xLjIuM2BcbmNyZWF0ZVRva2VuKCdDT01QQVJBVE9SVFJJTScsIGAoXFxcXHMqKSR7c3JjW3QuR1RMVF1cbn1cXFxccyooJHtzcmNbdC5MT09TRVBMQUlOXX18JHtzcmNbdC5YUkFOR0VQTEFJTl19KWAsIHRydWUpO1xuZXhwb3J0cy5jb21wYXJhdG9yVHJpbVJlcGxhY2UgPSAnJDEkMiQzJztcblxuLy8gU29tZXRoaW5nIGxpa2UgYDEuMi4zIC0gMS4yLjRgXG4vLyBOb3RlIHRoYXQgdGhlc2UgYWxsIHVzZSB0aGUgbG9vc2UgZm9ybSwgYmVjYXVzZSB0aGV5J2xsIGJlXG4vLyBjaGVja2VkIGFnYWluc3QgZWl0aGVyIHRoZSBzdHJpY3Qgb3IgbG9vc2UgY29tcGFyYXRvciBmb3JtXG4vLyBsYXRlci5cbmNyZWF0ZVRva2VuKCdIWVBIRU5SQU5HRScsIGBeXFxcXHMqKCR7c3JjW3QuWFJBTkdFUExBSU5dfSlgICtcbiAgICAgICAgICAgICAgICAgICBgXFxcXHMrLVxcXFxzK2AgK1xuICAgICAgICAgICAgICAgICAgIGAoJHtzcmNbdC5YUkFOR0VQTEFJTl19KWAgK1xuICAgICAgICAgICAgICAgICAgIGBcXFxccyokYCk7XG5cbmNyZWF0ZVRva2VuKCdIWVBIRU5SQU5HRUxPT1NFJywgYF5cXFxccyooJHtzcmNbdC5YUkFOR0VQTEFJTkxPT1NFXX0pYCArXG4gICAgICAgICAgICAgICAgICAgICAgICBgXFxcXHMrLVxcXFxzK2AgK1xuICAgICAgICAgICAgICAgICAgICAgICAgYCgke3NyY1t0LlhSQU5HRVBMQUlOTE9PU0VdfSlgICtcbiAgICAgICAgICAgICAgICAgICAgICAgIGBcXFxccyokYCk7XG5cbi8vIFN0YXIgcmFuZ2VzIGJhc2ljYWxseSBqdXN0IGFsbG93IGFueXRoaW5nIGF0IGFsbC5cbmNyZWF0ZVRva2VuKCdTVEFSJywgJyg8fD4pPz0/XFxcXHMqXFxcXConKTtcbi8vID49MC4wLjAgaXMgbGlrZSBhIHN0YXJcbmNyZWF0ZVRva2VuKCdHVEUwJywgJ15cXFxccyo+PVxcXFxzKjBcXC4wXFwuMFxcXFxzKiQnKTtcbmNyZWF0ZVRva2VuKCdHVEUwUFJFJywgJ15cXFxccyo+PVxcXFxzKjBcXC4wXFwuMC0wXFxcXHMqJCcpO1xufShyZSRiLCByZSRiLmV4cG9ydHMpKTtcblxuLy8gcGFyc2Ugb3V0IGp1c3QgdGhlIG9wdGlvbnMgd2UgY2FyZSBhYm91dCBzbyB3ZSBhbHdheXMgZ2V0IGEgY29uc2lzdGVudFxuLy8gb2JqIHdpdGgga2V5cyBpbiBhIGNvbnNpc3RlbnQgb3JkZXIuXG5jb25zdCBvcHRzJDEgPSBbJ2luY2x1ZGVQcmVyZWxlYXNlJywgJ2xvb3NlJywgJ3J0bCddO1xuY29uc3QgcGFyc2VPcHRpb25zJDkgPSBvcHRpb25zID0+XG4gICFvcHRpb25zID8ge31cbiAgOiB0eXBlb2Ygb3B0aW9ucyAhPT0gJ29iamVjdCcgPyB7IGxvb3NlOiB0cnVlIH1cbiAgOiBvcHRzJDEuZmlsdGVyKGsgPT4gb3B0aW9uc1trXSkucmVkdWNlKChvcHRpb25zLCBrKSA9PiB7XG4gICAgb3B0aW9uc1trXSA9IHRydWU7XG4gICAgcmV0dXJuIG9wdGlvbnNcbiAgfSwge30pO1xudmFyIHBhcnNlT3B0aW9uc18xJDEgPSBwYXJzZU9wdGlvbnMkOTtcblxuY29uc3QgbnVtZXJpYyQxID0gL15bMC05XSskLztcbmNvbnN0IGNvbXBhcmVJZGVudGlmaWVycyQzID0gKGEsIGIpID0+IHtcbiAgY29uc3QgYW51bSA9IG51bWVyaWMkMS50ZXN0KGEpO1xuICBjb25zdCBibnVtID0gbnVtZXJpYyQxLnRlc3QoYik7XG5cbiAgaWYgKGFudW0gJiYgYm51bSkge1xuICAgIGEgPSArYTtcbiAgICBiID0gK2I7XG4gIH1cblxuICByZXR1cm4gYSA9PT0gYiA/IDBcbiAgICA6IChhbnVtICYmICFibnVtKSA/IC0xXG4gICAgOiAoYm51bSAmJiAhYW51bSkgPyAxXG4gICAgOiBhIDwgYiA/IC0xXG4gICAgOiAxXG59O1xuXG5jb25zdCByY29tcGFyZUlkZW50aWZpZXJzJDEgPSAoYSwgYikgPT4gY29tcGFyZUlkZW50aWZpZXJzJDMoYiwgYSk7XG5cbnZhciBpZGVudGlmaWVycyQxID0ge1xuICBjb21wYXJlSWRlbnRpZmllcnM6IGNvbXBhcmVJZGVudGlmaWVycyQzLFxuICByY29tcGFyZUlkZW50aWZpZXJzOiByY29tcGFyZUlkZW50aWZpZXJzJDFcbn07XG5cbmNvbnN0IGRlYnVnJDYgPSBkZWJ1Z18xJDE7XG5jb25zdCB7IE1BWF9MRU5HVEg6IE1BWF9MRU5HVEgkNCwgTUFYX1NBRkVfSU5URUdFUjogTUFYX1NBRkVfSU5URUdFUiQyIH0gPSBjb25zdGFudHMkMTtcbmNvbnN0IHsgcmU6IHJlJGEsIHQ6IHQkOSB9ID0gcmUkYi5leHBvcnRzO1xuXG5jb25zdCBwYXJzZU9wdGlvbnMkOCA9IHBhcnNlT3B0aW9uc18xJDE7XG5jb25zdCB7IGNvbXBhcmVJZGVudGlmaWVyczogY29tcGFyZUlkZW50aWZpZXJzJDIgfSA9IGlkZW50aWZpZXJzJDE7XG5jbGFzcyBTZW1WZXIkdCB7XG4gIGNvbnN0cnVjdG9yICh2ZXJzaW9uLCBvcHRpb25zKSB7XG4gICAgb3B0aW9ucyA9IHBhcnNlT3B0aW9ucyQ4KG9wdGlvbnMpO1xuXG4gICAgaWYgKHZlcnNpb24gaW5zdGFuY2VvZiBTZW1WZXIkdCkge1xuICAgICAgaWYgKHZlcnNpb24ubG9vc2UgPT09ICEhb3B0aW9ucy5sb29zZSAmJlxuICAgICAgICAgIHZlcnNpb24uaW5jbHVkZVByZXJlbGVhc2UgPT09ICEhb3B0aW9ucy5pbmNsdWRlUHJlcmVsZWFzZSkge1xuICAgICAgICByZXR1cm4gdmVyc2lvblxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdmVyc2lvbiA9IHZlcnNpb24udmVyc2lvbjtcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKHR5cGVvZiB2ZXJzaW9uICE9PSAnc3RyaW5nJykge1xuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihgSW52YWxpZCBWZXJzaW9uOiAke3ZlcnNpb259YClcbiAgICB9XG5cbiAgICBpZiAodmVyc2lvbi5sZW5ndGggPiBNQVhfTEVOR1RIJDQpIHtcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXG4gICAgICAgIGB2ZXJzaW9uIGlzIGxvbmdlciB0aGFuICR7TUFYX0xFTkdUSCQ0fSBjaGFyYWN0ZXJzYFxuICAgICAgKVxuICAgIH1cblxuICAgIGRlYnVnJDYoJ1NlbVZlcicsIHZlcnNpb24sIG9wdGlvbnMpO1xuICAgIHRoaXMub3B0aW9ucyA9IG9wdGlvbnM7XG4gICAgdGhpcy5sb29zZSA9ICEhb3B0aW9ucy5sb29zZTtcbiAgICAvLyB0aGlzIGlzbid0IGFjdHVhbGx5IHJlbGV2YW50IGZvciB2ZXJzaW9ucywgYnV0IGtlZXAgaXQgc28gdGhhdCB3ZVxuICAgIC8vIGRvbid0IHJ1biBpbnRvIHRyb3VibGUgcGFzc2luZyB0aGlzLm9wdGlvbnMgYXJvdW5kLlxuICAgIHRoaXMuaW5jbHVkZVByZXJlbGVhc2UgPSAhIW9wdGlvbnMuaW5jbHVkZVByZXJlbGVhc2U7XG5cbiAgICBjb25zdCBtID0gdmVyc2lvbi50cmltKCkubWF0Y2gob3B0aW9ucy5sb29zZSA/IHJlJGFbdCQ5LkxPT1NFXSA6IHJlJGFbdCQ5LkZVTExdKTtcblxuICAgIGlmICghbSkge1xuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihgSW52YWxpZCBWZXJzaW9uOiAke3ZlcnNpb259YClcbiAgICB9XG5cbiAgICB0aGlzLnJhdyA9IHZlcnNpb247XG5cbiAgICAvLyB0aGVzZSBhcmUgYWN0dWFsbHkgbnVtYmVyc1xuICAgIHRoaXMubWFqb3IgPSArbVsxXTtcbiAgICB0aGlzLm1pbm9yID0gK21bMl07XG4gICAgdGhpcy5wYXRjaCA9ICttWzNdO1xuXG4gICAgaWYgKHRoaXMubWFqb3IgPiBNQVhfU0FGRV9JTlRFR0VSJDIgfHwgdGhpcy5tYWpvciA8IDApIHtcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0ludmFsaWQgbWFqb3IgdmVyc2lvbicpXG4gICAgfVxuXG4gICAgaWYgKHRoaXMubWlub3IgPiBNQVhfU0FGRV9JTlRFR0VSJDIgfHwgdGhpcy5taW5vciA8IDApIHtcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0ludmFsaWQgbWlub3IgdmVyc2lvbicpXG4gICAgfVxuXG4gICAgaWYgKHRoaXMucGF0Y2ggPiBNQVhfU0FGRV9JTlRFR0VSJDIgfHwgdGhpcy5wYXRjaCA8IDApIHtcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0ludmFsaWQgcGF0Y2ggdmVyc2lvbicpXG4gICAgfVxuXG4gICAgLy8gbnVtYmVyaWZ5IGFueSBwcmVyZWxlYXNlIG51bWVyaWMgaWRzXG4gICAgaWYgKCFtWzRdKSB7XG4gICAgICB0aGlzLnByZXJlbGVhc2UgPSBbXTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5wcmVyZWxlYXNlID0gbVs0XS5zcGxpdCgnLicpLm1hcCgoaWQpID0+IHtcbiAgICAgICAgaWYgKC9eWzAtOV0rJC8udGVzdChpZCkpIHtcbiAgICAgICAgICBjb25zdCBudW0gPSAraWQ7XG4gICAgICAgICAgaWYgKG51bSA+PSAwICYmIG51bSA8IE1BWF9TQUZFX0lOVEVHRVIkMikge1xuICAgICAgICAgICAgcmV0dXJuIG51bVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gaWRcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIHRoaXMuYnVpbGQgPSBtWzVdID8gbVs1XS5zcGxpdCgnLicpIDogW107XG4gICAgdGhpcy5mb3JtYXQoKTtcbiAgfVxuXG4gIGZvcm1hdCAoKSB7XG4gICAgdGhpcy52ZXJzaW9uID0gYCR7dGhpcy5tYWpvcn0uJHt0aGlzLm1pbm9yfS4ke3RoaXMucGF0Y2h9YDtcbiAgICBpZiAodGhpcy5wcmVyZWxlYXNlLmxlbmd0aCkge1xuICAgICAgdGhpcy52ZXJzaW9uICs9IGAtJHt0aGlzLnByZXJlbGVhc2Uuam9pbignLicpfWA7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLnZlcnNpb25cbiAgfVxuXG4gIHRvU3RyaW5nICgpIHtcbiAgICByZXR1cm4gdGhpcy52ZXJzaW9uXG4gIH1cblxuICBjb21wYXJlIChvdGhlcikge1xuICAgIGRlYnVnJDYoJ1NlbVZlci5jb21wYXJlJywgdGhpcy52ZXJzaW9uLCB0aGlzLm9wdGlvbnMsIG90aGVyKTtcbiAgICBpZiAoIShvdGhlciBpbnN0YW5jZW9mIFNlbVZlciR0KSkge1xuICAgICAgaWYgKHR5cGVvZiBvdGhlciA9PT0gJ3N0cmluZycgJiYgb3RoZXIgPT09IHRoaXMudmVyc2lvbikge1xuICAgICAgICByZXR1cm4gMFxuICAgICAgfVxuICAgICAgb3RoZXIgPSBuZXcgU2VtVmVyJHQob3RoZXIsIHRoaXMub3B0aW9ucyk7XG4gICAgfVxuXG4gICAgaWYgKG90aGVyLnZlcnNpb24gPT09IHRoaXMudmVyc2lvbikge1xuICAgICAgcmV0dXJuIDBcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5jb21wYXJlTWFpbihvdGhlcikgfHwgdGhpcy5jb21wYXJlUHJlKG90aGVyKVxuICB9XG5cbiAgY29tcGFyZU1haW4gKG90aGVyKSB7XG4gICAgaWYgKCEob3RoZXIgaW5zdGFuY2VvZiBTZW1WZXIkdCkpIHtcbiAgICAgIG90aGVyID0gbmV3IFNlbVZlciR0KG90aGVyLCB0aGlzLm9wdGlvbnMpO1xuICAgIH1cblxuICAgIHJldHVybiAoXG4gICAgICBjb21wYXJlSWRlbnRpZmllcnMkMih0aGlzLm1ham9yLCBvdGhlci5tYWpvcikgfHxcbiAgICAgIGNvbXBhcmVJZGVudGlmaWVycyQyKHRoaXMubWlub3IsIG90aGVyLm1pbm9yKSB8fFxuICAgICAgY29tcGFyZUlkZW50aWZpZXJzJDIodGhpcy5wYXRjaCwgb3RoZXIucGF0Y2gpXG4gICAgKVxuICB9XG5cbiAgY29tcGFyZVByZSAob3RoZXIpIHtcbiAgICBpZiAoIShvdGhlciBpbnN0YW5jZW9mIFNlbVZlciR0KSkge1xuICAgICAgb3RoZXIgPSBuZXcgU2VtVmVyJHQob3RoZXIsIHRoaXMub3B0aW9ucyk7XG4gICAgfVxuXG4gICAgLy8gTk9UIGhhdmluZyBhIHByZXJlbGVhc2UgaXMgPiBoYXZpbmcgb25lXG4gICAgaWYgKHRoaXMucHJlcmVsZWFzZS5sZW5ndGggJiYgIW90aGVyLnByZXJlbGVhc2UubGVuZ3RoKSB7XG4gICAgICByZXR1cm4gLTFcbiAgICB9IGVsc2UgaWYgKCF0aGlzLnByZXJlbGVhc2UubGVuZ3RoICYmIG90aGVyLnByZXJlbGVhc2UubGVuZ3RoKSB7XG4gICAgICByZXR1cm4gMVxuICAgIH0gZWxzZSBpZiAoIXRoaXMucHJlcmVsZWFzZS5sZW5ndGggJiYgIW90aGVyLnByZXJlbGVhc2UubGVuZ3RoKSB7XG4gICAgICByZXR1cm4gMFxuICAgIH1cblxuICAgIGxldCBpID0gMDtcbiAgICBkbyB7XG4gICAgICBjb25zdCBhID0gdGhpcy5wcmVyZWxlYXNlW2ldO1xuICAgICAgY29uc3QgYiA9IG90aGVyLnByZXJlbGVhc2VbaV07XG4gICAgICBkZWJ1ZyQ2KCdwcmVyZWxlYXNlIGNvbXBhcmUnLCBpLCBhLCBiKTtcbiAgICAgIGlmIChhID09PSB1bmRlZmluZWQgJiYgYiA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHJldHVybiAwXG4gICAgICB9IGVsc2UgaWYgKGIgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICByZXR1cm4gMVxuICAgICAgfSBlbHNlIGlmIChhID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgcmV0dXJuIC0xXG4gICAgICB9IGVsc2UgaWYgKGEgPT09IGIpIHtcbiAgICAgICAgY29udGludWVcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBjb21wYXJlSWRlbnRpZmllcnMkMihhLCBiKVxuICAgICAgfVxuICAgIH0gd2hpbGUgKCsraSlcbiAgfVxuXG4gIGNvbXBhcmVCdWlsZCAob3RoZXIpIHtcbiAgICBpZiAoIShvdGhlciBpbnN0YW5jZW9mIFNlbVZlciR0KSkge1xuICAgICAgb3RoZXIgPSBuZXcgU2VtVmVyJHQob3RoZXIsIHRoaXMub3B0aW9ucyk7XG4gICAgfVxuXG4gICAgbGV0IGkgPSAwO1xuICAgIGRvIHtcbiAgICAgIGNvbnN0IGEgPSB0aGlzLmJ1aWxkW2ldO1xuICAgICAgY29uc3QgYiA9IG90aGVyLmJ1aWxkW2ldO1xuICAgICAgZGVidWckNigncHJlcmVsZWFzZSBjb21wYXJlJywgaSwgYSwgYik7XG4gICAgICBpZiAoYSA9PT0gdW5kZWZpbmVkICYmIGIgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICByZXR1cm4gMFxuICAgICAgfSBlbHNlIGlmIChiID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgcmV0dXJuIDFcbiAgICAgIH0gZWxzZSBpZiAoYSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHJldHVybiAtMVxuICAgICAgfSBlbHNlIGlmIChhID09PSBiKSB7XG4gICAgICAgIGNvbnRpbnVlXG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gY29tcGFyZUlkZW50aWZpZXJzJDIoYSwgYilcbiAgICAgIH1cbiAgICB9IHdoaWxlICgrK2kpXG4gIH1cblxuICAvLyBwcmVtaW5vciB3aWxsIGJ1bXAgdGhlIHZlcnNpb24gdXAgdG8gdGhlIG5leHQgbWlub3IgcmVsZWFzZSwgYW5kIGltbWVkaWF0ZWx5XG4gIC8vIGRvd24gdG8gcHJlLXJlbGVhc2UuIHByZW1ham9yIGFuZCBwcmVwYXRjaCB3b3JrIHRoZSBzYW1lIHdheS5cbiAgaW5jIChyZWxlYXNlLCBpZGVudGlmaWVyKSB7XG4gICAgc3dpdGNoIChyZWxlYXNlKSB7XG4gICAgICBjYXNlICdwcmVtYWpvcic6XG4gICAgICAgIHRoaXMucHJlcmVsZWFzZS5sZW5ndGggPSAwO1xuICAgICAgICB0aGlzLnBhdGNoID0gMDtcbiAgICAgICAgdGhpcy5taW5vciA9IDA7XG4gICAgICAgIHRoaXMubWFqb3IrKztcbiAgICAgICAgdGhpcy5pbmMoJ3ByZScsIGlkZW50aWZpZXIpO1xuICAgICAgICBicmVha1xuICAgICAgY2FzZSAncHJlbWlub3InOlxuICAgICAgICB0aGlzLnByZXJlbGVhc2UubGVuZ3RoID0gMDtcbiAgICAgICAgdGhpcy5wYXRjaCA9IDA7XG4gICAgICAgIHRoaXMubWlub3IrKztcbiAgICAgICAgdGhpcy5pbmMoJ3ByZScsIGlkZW50aWZpZXIpO1xuICAgICAgICBicmVha1xuICAgICAgY2FzZSAncHJlcGF0Y2gnOlxuICAgICAgICAvLyBJZiB0aGlzIGlzIGFscmVhZHkgYSBwcmVyZWxlYXNlLCBpdCB3aWxsIGJ1bXAgdG8gdGhlIG5leHQgdmVyc2lvblxuICAgICAgICAvLyBkcm9wIGFueSBwcmVyZWxlYXNlcyB0aGF0IG1pZ2h0IGFscmVhZHkgZXhpc3QsIHNpbmNlIHRoZXkgYXJlIG5vdFxuICAgICAgICAvLyByZWxldmFudCBhdCB0aGlzIHBvaW50LlxuICAgICAgICB0aGlzLnByZXJlbGVhc2UubGVuZ3RoID0gMDtcbiAgICAgICAgdGhpcy5pbmMoJ3BhdGNoJywgaWRlbnRpZmllcik7XG4gICAgICAgIHRoaXMuaW5jKCdwcmUnLCBpZGVudGlmaWVyKTtcbiAgICAgICAgYnJlYWtcbiAgICAgIC8vIElmIHRoZSBpbnB1dCBpcyBhIG5vbi1wcmVyZWxlYXNlIHZlcnNpb24sIHRoaXMgYWN0cyB0aGUgc2FtZSBhc1xuICAgICAgLy8gcHJlcGF0Y2guXG4gICAgICBjYXNlICdwcmVyZWxlYXNlJzpcbiAgICAgICAgaWYgKHRoaXMucHJlcmVsZWFzZS5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICB0aGlzLmluYygncGF0Y2gnLCBpZGVudGlmaWVyKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmluYygncHJlJywgaWRlbnRpZmllcik7XG4gICAgICAgIGJyZWFrXG5cbiAgICAgIGNhc2UgJ21ham9yJzpcbiAgICAgICAgLy8gSWYgdGhpcyBpcyBhIHByZS1tYWpvciB2ZXJzaW9uLCBidW1wIHVwIHRvIHRoZSBzYW1lIG1ham9yIHZlcnNpb24uXG4gICAgICAgIC8vIE90aGVyd2lzZSBpbmNyZW1lbnQgbWFqb3IuXG4gICAgICAgIC8vIDEuMC4wLTUgYnVtcHMgdG8gMS4wLjBcbiAgICAgICAgLy8gMS4xLjAgYnVtcHMgdG8gMi4wLjBcbiAgICAgICAgaWYgKFxuICAgICAgICAgIHRoaXMubWlub3IgIT09IDAgfHxcbiAgICAgICAgICB0aGlzLnBhdGNoICE9PSAwIHx8XG4gICAgICAgICAgdGhpcy5wcmVyZWxlYXNlLmxlbmd0aCA9PT0gMFxuICAgICAgICApIHtcbiAgICAgICAgICB0aGlzLm1ham9yKys7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5taW5vciA9IDA7XG4gICAgICAgIHRoaXMucGF0Y2ggPSAwO1xuICAgICAgICB0aGlzLnByZXJlbGVhc2UgPSBbXTtcbiAgICAgICAgYnJlYWtcbiAgICAgIGNhc2UgJ21pbm9yJzpcbiAgICAgICAgLy8gSWYgdGhpcyBpcyBhIHByZS1taW5vciB2ZXJzaW9uLCBidW1wIHVwIHRvIHRoZSBzYW1lIG1pbm9yIHZlcnNpb24uXG4gICAgICAgIC8vIE90aGVyd2lzZSBpbmNyZW1lbnQgbWlub3IuXG4gICAgICAgIC8vIDEuMi4wLTUgYnVtcHMgdG8gMS4yLjBcbiAgICAgICAgLy8gMS4yLjEgYnVtcHMgdG8gMS4zLjBcbiAgICAgICAgaWYgKHRoaXMucGF0Y2ggIT09IDAgfHwgdGhpcy5wcmVyZWxlYXNlLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgIHRoaXMubWlub3IrKztcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnBhdGNoID0gMDtcbiAgICAgICAgdGhpcy5wcmVyZWxlYXNlID0gW107XG4gICAgICAgIGJyZWFrXG4gICAgICBjYXNlICdwYXRjaCc6XG4gICAgICAgIC8vIElmIHRoaXMgaXMgbm90IGEgcHJlLXJlbGVhc2UgdmVyc2lvbiwgaXQgd2lsbCBpbmNyZW1lbnQgdGhlIHBhdGNoLlxuICAgICAgICAvLyBJZiBpdCBpcyBhIHByZS1yZWxlYXNlIGl0IHdpbGwgYnVtcCB1cCB0byB0aGUgc2FtZSBwYXRjaCB2ZXJzaW9uLlxuICAgICAgICAvLyAxLjIuMC01IHBhdGNoZXMgdG8gMS4yLjBcbiAgICAgICAgLy8gMS4yLjAgcGF0Y2hlcyB0byAxLjIuMVxuICAgICAgICBpZiAodGhpcy5wcmVyZWxlYXNlLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgIHRoaXMucGF0Y2grKztcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnByZXJlbGVhc2UgPSBbXTtcbiAgICAgICAgYnJlYWtcbiAgICAgIC8vIFRoaXMgcHJvYmFibHkgc2hvdWxkbid0IGJlIHVzZWQgcHVibGljbHkuXG4gICAgICAvLyAxLjAuMCAncHJlJyB3b3VsZCBiZWNvbWUgMS4wLjAtMCB3aGljaCBpcyB0aGUgd3JvbmcgZGlyZWN0aW9uLlxuICAgICAgY2FzZSAncHJlJzpcbiAgICAgICAgaWYgKHRoaXMucHJlcmVsZWFzZS5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICB0aGlzLnByZXJlbGVhc2UgPSBbMF07XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgbGV0IGkgPSB0aGlzLnByZXJlbGVhc2UubGVuZ3RoO1xuICAgICAgICAgIHdoaWxlICgtLWkgPj0gMCkge1xuICAgICAgICAgICAgaWYgKHR5cGVvZiB0aGlzLnByZXJlbGVhc2VbaV0gPT09ICdudW1iZXInKSB7XG4gICAgICAgICAgICAgIHRoaXMucHJlcmVsZWFzZVtpXSsrO1xuICAgICAgICAgICAgICBpID0gLTI7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmIChpID09PSAtMSkge1xuICAgICAgICAgICAgLy8gZGlkbid0IGluY3JlbWVudCBhbnl0aGluZ1xuICAgICAgICAgICAgdGhpcy5wcmVyZWxlYXNlLnB1c2goMCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmIChpZGVudGlmaWVyKSB7XG4gICAgICAgICAgLy8gMS4yLjAtYmV0YS4xIGJ1bXBzIHRvIDEuMi4wLWJldGEuMixcbiAgICAgICAgICAvLyAxLjIuMC1iZXRhLmZvb2JseiBvciAxLjIuMC1iZXRhIGJ1bXBzIHRvIDEuMi4wLWJldGEuMFxuICAgICAgICAgIGlmICh0aGlzLnByZXJlbGVhc2VbMF0gPT09IGlkZW50aWZpZXIpIHtcbiAgICAgICAgICAgIGlmIChpc05hTih0aGlzLnByZXJlbGVhc2VbMV0pKSB7XG4gICAgICAgICAgICAgIHRoaXMucHJlcmVsZWFzZSA9IFtpZGVudGlmaWVyLCAwXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5wcmVyZWxlYXNlID0gW2lkZW50aWZpZXIsIDBdO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBicmVha1xuXG4gICAgICBkZWZhdWx0OlxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYGludmFsaWQgaW5jcmVtZW50IGFyZ3VtZW50OiAke3JlbGVhc2V9YClcbiAgICB9XG4gICAgdGhpcy5mb3JtYXQoKTtcbiAgICB0aGlzLnJhdyA9IHRoaXMudmVyc2lvbjtcbiAgICByZXR1cm4gdGhpc1xuICB9XG59XG5cbnZhciBzZW12ZXIkNSA9IFNlbVZlciR0O1xuXG5jb25zdCB7TUFYX0xFTkdUSDogTUFYX0xFTkdUSCQzfSA9IGNvbnN0YW50cyQxO1xuY29uc3QgeyByZTogcmUkOSwgdDogdCQ4IH0gPSByZSRiLmV4cG9ydHM7XG5jb25zdCBTZW1WZXIkcyA9IHNlbXZlciQ1O1xuXG5jb25zdCBwYXJzZU9wdGlvbnMkNyA9IHBhcnNlT3B0aW9uc18xJDE7XG5jb25zdCBwYXJzZSRjID0gKHZlcnNpb24sIG9wdGlvbnMpID0+IHtcbiAgb3B0aW9ucyA9IHBhcnNlT3B0aW9ucyQ3KG9wdGlvbnMpO1xuXG4gIGlmICh2ZXJzaW9uIGluc3RhbmNlb2YgU2VtVmVyJHMpIHtcbiAgICByZXR1cm4gdmVyc2lvblxuICB9XG5cbiAgaWYgKHR5cGVvZiB2ZXJzaW9uICE9PSAnc3RyaW5nJykge1xuICAgIHJldHVybiBudWxsXG4gIH1cblxuICBpZiAodmVyc2lvbi5sZW5ndGggPiBNQVhfTEVOR1RIJDMpIHtcbiAgICByZXR1cm4gbnVsbFxuICB9XG5cbiAgY29uc3QgciA9IG9wdGlvbnMubG9vc2UgPyByZSQ5W3QkOC5MT09TRV0gOiByZSQ5W3QkOC5GVUxMXTtcbiAgaWYgKCFyLnRlc3QodmVyc2lvbikpIHtcbiAgICByZXR1cm4gbnVsbFxuICB9XG5cbiAgdHJ5IHtcbiAgICByZXR1cm4gbmV3IFNlbVZlciRzKHZlcnNpb24sIG9wdGlvbnMpXG4gIH0gY2F0Y2ggKGVyKSB7XG4gICAgcmV0dXJuIG51bGxcbiAgfVxufTtcblxudmFyIHBhcnNlXzEkMSA9IHBhcnNlJGM7XG5cbmNvbnN0IHBhcnNlJGIgPSBwYXJzZV8xJDE7XG5jb25zdCB2YWxpZCQzID0gKHZlcnNpb24sIG9wdGlvbnMpID0+IHtcbiAgY29uc3QgdiA9IHBhcnNlJGIodmVyc2lvbiwgb3B0aW9ucyk7XG4gIHJldHVybiB2ID8gdi52ZXJzaW9uIDogbnVsbFxufTtcbnZhciB2YWxpZF8xJDEgPSB2YWxpZCQzO1xuXG5jb25zdCBwYXJzZSRhID0gcGFyc2VfMSQxO1xuY29uc3QgY2xlYW4kMSA9ICh2ZXJzaW9uLCBvcHRpb25zKSA9PiB7XG4gIGNvbnN0IHMgPSBwYXJzZSRhKHZlcnNpb24udHJpbSgpLnJlcGxhY2UoL15bPXZdKy8sICcnKSwgb3B0aW9ucyk7XG4gIHJldHVybiBzID8gcy52ZXJzaW9uIDogbnVsbFxufTtcbnZhciBjbGVhbl8xJDEgPSBjbGVhbiQxO1xuXG5jb25zdCBTZW1WZXIkciA9IHNlbXZlciQ1O1xuXG5jb25zdCBpbmMkMSA9ICh2ZXJzaW9uLCByZWxlYXNlLCBvcHRpb25zLCBpZGVudGlmaWVyKSA9PiB7XG4gIGlmICh0eXBlb2YgKG9wdGlvbnMpID09PSAnc3RyaW5nJykge1xuICAgIGlkZW50aWZpZXIgPSBvcHRpb25zO1xuICAgIG9wdGlvbnMgPSB1bmRlZmluZWQ7XG4gIH1cblxuICB0cnkge1xuICAgIHJldHVybiBuZXcgU2VtVmVyJHIodmVyc2lvbiwgb3B0aW9ucykuaW5jKHJlbGVhc2UsIGlkZW50aWZpZXIpLnZlcnNpb25cbiAgfSBjYXRjaCAoZXIpIHtcbiAgICByZXR1cm4gbnVsbFxuICB9XG59O1xudmFyIGluY18xJDEgPSBpbmMkMTtcblxuY29uc3QgU2VtVmVyJHEgPSBzZW12ZXIkNTtcbmNvbnN0IGNvbXBhcmUkbCA9IChhLCBiLCBsb29zZSkgPT5cbiAgbmV3IFNlbVZlciRxKGEsIGxvb3NlKS5jb21wYXJlKG5ldyBTZW1WZXIkcShiLCBsb29zZSkpO1xuXG52YXIgY29tcGFyZV8xJDEgPSBjb21wYXJlJGw7XG5cbmNvbnN0IGNvbXBhcmUkayA9IGNvbXBhcmVfMSQxO1xuY29uc3QgZXEkNSA9IChhLCBiLCBsb29zZSkgPT4gY29tcGFyZSRrKGEsIGIsIGxvb3NlKSA9PT0gMDtcbnZhciBlcV8xJDEgPSBlcSQ1O1xuXG5jb25zdCBwYXJzZSQ5ID0gcGFyc2VfMSQxO1xuY29uc3QgZXEkNCA9IGVxXzEkMTtcblxuY29uc3QgZGlmZiQxID0gKHZlcnNpb24xLCB2ZXJzaW9uMikgPT4ge1xuICBpZiAoZXEkNCh2ZXJzaW9uMSwgdmVyc2lvbjIpKSB7XG4gICAgcmV0dXJuIG51bGxcbiAgfSBlbHNlIHtcbiAgICBjb25zdCB2MSA9IHBhcnNlJDkodmVyc2lvbjEpO1xuICAgIGNvbnN0IHYyID0gcGFyc2UkOSh2ZXJzaW9uMik7XG4gICAgY29uc3QgaGFzUHJlID0gdjEucHJlcmVsZWFzZS5sZW5ndGggfHwgdjIucHJlcmVsZWFzZS5sZW5ndGg7XG4gICAgY29uc3QgcHJlZml4ID0gaGFzUHJlID8gJ3ByZScgOiAnJztcbiAgICBjb25zdCBkZWZhdWx0UmVzdWx0ID0gaGFzUHJlID8gJ3ByZXJlbGVhc2UnIDogJyc7XG4gICAgZm9yIChjb25zdCBrZXkgaW4gdjEpIHtcbiAgICAgIGlmIChrZXkgPT09ICdtYWpvcicgfHwga2V5ID09PSAnbWlub3InIHx8IGtleSA9PT0gJ3BhdGNoJykge1xuICAgICAgICBpZiAodjFba2V5XSAhPT0gdjJba2V5XSkge1xuICAgICAgICAgIHJldHVybiBwcmVmaXggKyBrZXlcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gZGVmYXVsdFJlc3VsdCAvLyBtYXkgYmUgdW5kZWZpbmVkXG4gIH1cbn07XG52YXIgZGlmZl8xJDEgPSBkaWZmJDE7XG5cbmNvbnN0IFNlbVZlciRwID0gc2VtdmVyJDU7XG5jb25zdCBtYWpvciQxID0gKGEsIGxvb3NlKSA9PiBuZXcgU2VtVmVyJHAoYSwgbG9vc2UpLm1ham9yO1xudmFyIG1ham9yXzEkMSA9IG1ham9yJDE7XG5cbmNvbnN0IFNlbVZlciRvID0gc2VtdmVyJDU7XG5jb25zdCBtaW5vciQxID0gKGEsIGxvb3NlKSA9PiBuZXcgU2VtVmVyJG8oYSwgbG9vc2UpLm1pbm9yO1xudmFyIG1pbm9yXzEkMSA9IG1pbm9yJDE7XG5cbmNvbnN0IFNlbVZlciRuID0gc2VtdmVyJDU7XG5jb25zdCBwYXRjaCQxID0gKGEsIGxvb3NlKSA9PiBuZXcgU2VtVmVyJG4oYSwgbG9vc2UpLnBhdGNoO1xudmFyIHBhdGNoXzEkMSA9IHBhdGNoJDE7XG5cbmNvbnN0IHBhcnNlJDggPSBwYXJzZV8xJDE7XG5jb25zdCBwcmVyZWxlYXNlJDEgPSAodmVyc2lvbiwgb3B0aW9ucykgPT4ge1xuICBjb25zdCBwYXJzZWQgPSBwYXJzZSQ4KHZlcnNpb24sIG9wdGlvbnMpO1xuICByZXR1cm4gKHBhcnNlZCAmJiBwYXJzZWQucHJlcmVsZWFzZS5sZW5ndGgpID8gcGFyc2VkLnByZXJlbGVhc2UgOiBudWxsXG59O1xudmFyIHByZXJlbGVhc2VfMSQxID0gcHJlcmVsZWFzZSQxO1xuXG5jb25zdCBjb21wYXJlJGogPSBjb21wYXJlXzEkMTtcbmNvbnN0IHJjb21wYXJlJDEgPSAoYSwgYiwgbG9vc2UpID0+IGNvbXBhcmUkaihiLCBhLCBsb29zZSk7XG52YXIgcmNvbXBhcmVfMSQxID0gcmNvbXBhcmUkMTtcblxuY29uc3QgY29tcGFyZSRpID0gY29tcGFyZV8xJDE7XG5jb25zdCBjb21wYXJlTG9vc2UkMSA9IChhLCBiKSA9PiBjb21wYXJlJGkoYSwgYiwgdHJ1ZSk7XG52YXIgY29tcGFyZUxvb3NlXzEkMSA9IGNvbXBhcmVMb29zZSQxO1xuXG5jb25zdCBTZW1WZXIkbSA9IHNlbXZlciQ1O1xuY29uc3QgY29tcGFyZUJ1aWxkJDUgPSAoYSwgYiwgbG9vc2UpID0+IHtcbiAgY29uc3QgdmVyc2lvbkEgPSBuZXcgU2VtVmVyJG0oYSwgbG9vc2UpO1xuICBjb25zdCB2ZXJzaW9uQiA9IG5ldyBTZW1WZXIkbShiLCBsb29zZSk7XG4gIHJldHVybiB2ZXJzaW9uQS5jb21wYXJlKHZlcnNpb25CKSB8fCB2ZXJzaW9uQS5jb21wYXJlQnVpbGQodmVyc2lvbkIpXG59O1xudmFyIGNvbXBhcmVCdWlsZF8xJDEgPSBjb21wYXJlQnVpbGQkNTtcblxuY29uc3QgY29tcGFyZUJ1aWxkJDQgPSBjb21wYXJlQnVpbGRfMSQxO1xuY29uc3Qgc29ydCQxID0gKGxpc3QsIGxvb3NlKSA9PiBsaXN0LnNvcnQoKGEsIGIpID0+IGNvbXBhcmVCdWlsZCQ0KGEsIGIsIGxvb3NlKSk7XG52YXIgc29ydF8xJDEgPSBzb3J0JDE7XG5cbmNvbnN0IGNvbXBhcmVCdWlsZCQzID0gY29tcGFyZUJ1aWxkXzEkMTtcbmNvbnN0IHJzb3J0JDEgPSAobGlzdCwgbG9vc2UpID0+IGxpc3Quc29ydCgoYSwgYikgPT4gY29tcGFyZUJ1aWxkJDMoYiwgYSwgbG9vc2UpKTtcbnZhciByc29ydF8xJDEgPSByc29ydCQxO1xuXG5jb25zdCBjb21wYXJlJGggPSBjb21wYXJlXzEkMTtcbmNvbnN0IGd0JDcgPSAoYSwgYiwgbG9vc2UpID0+IGNvbXBhcmUkaChhLCBiLCBsb29zZSkgPiAwO1xudmFyIGd0XzEkMSA9IGd0JDc7XG5cbmNvbnN0IGNvbXBhcmUkZyA9IGNvbXBhcmVfMSQxO1xuY29uc3QgbHQkNSA9IChhLCBiLCBsb29zZSkgPT4gY29tcGFyZSRnKGEsIGIsIGxvb3NlKSA8IDA7XG52YXIgbHRfMSQxID0gbHQkNTtcblxuY29uc3QgY29tcGFyZSRmID0gY29tcGFyZV8xJDE7XG5jb25zdCBuZXEkMyA9IChhLCBiLCBsb29zZSkgPT4gY29tcGFyZSRmKGEsIGIsIGxvb3NlKSAhPT0gMDtcbnZhciBuZXFfMSQxID0gbmVxJDM7XG5cbmNvbnN0IGNvbXBhcmUkZSA9IGNvbXBhcmVfMSQxO1xuY29uc3QgZ3RlJDUgPSAoYSwgYiwgbG9vc2UpID0+IGNvbXBhcmUkZShhLCBiLCBsb29zZSkgPj0gMDtcbnZhciBndGVfMSQxID0gZ3RlJDU7XG5cbmNvbnN0IGNvbXBhcmUkZCA9IGNvbXBhcmVfMSQxO1xuY29uc3QgbHRlJDUgPSAoYSwgYiwgbG9vc2UpID0+IGNvbXBhcmUkZChhLCBiLCBsb29zZSkgPD0gMDtcbnZhciBsdGVfMSQxID0gbHRlJDU7XG5cbmNvbnN0IGVxJDMgPSBlcV8xJDE7XG5jb25zdCBuZXEkMiA9IG5lcV8xJDE7XG5jb25zdCBndCQ2ID0gZ3RfMSQxO1xuY29uc3QgZ3RlJDQgPSBndGVfMSQxO1xuY29uc3QgbHQkNCA9IGx0XzEkMTtcbmNvbnN0IGx0ZSQ0ID0gbHRlXzEkMTtcblxuY29uc3QgY21wJDMgPSAoYSwgb3AsIGIsIGxvb3NlKSA9PiB7XG4gIHN3aXRjaCAob3ApIHtcbiAgICBjYXNlICc9PT0nOlxuICAgICAgaWYgKHR5cGVvZiBhID09PSAnb2JqZWN0JylcbiAgICAgICAgYSA9IGEudmVyc2lvbjtcbiAgICAgIGlmICh0eXBlb2YgYiA9PT0gJ29iamVjdCcpXG4gICAgICAgIGIgPSBiLnZlcnNpb247XG4gICAgICByZXR1cm4gYSA9PT0gYlxuXG4gICAgY2FzZSAnIT09JzpcbiAgICAgIGlmICh0eXBlb2YgYSA9PT0gJ29iamVjdCcpXG4gICAgICAgIGEgPSBhLnZlcnNpb247XG4gICAgICBpZiAodHlwZW9mIGIgPT09ICdvYmplY3QnKVxuICAgICAgICBiID0gYi52ZXJzaW9uO1xuICAgICAgcmV0dXJuIGEgIT09IGJcblxuICAgIGNhc2UgJyc6XG4gICAgY2FzZSAnPSc6XG4gICAgY2FzZSAnPT0nOlxuICAgICAgcmV0dXJuIGVxJDMoYSwgYiwgbG9vc2UpXG5cbiAgICBjYXNlICchPSc6XG4gICAgICByZXR1cm4gbmVxJDIoYSwgYiwgbG9vc2UpXG5cbiAgICBjYXNlICc+JzpcbiAgICAgIHJldHVybiBndCQ2KGEsIGIsIGxvb3NlKVxuXG4gICAgY2FzZSAnPj0nOlxuICAgICAgcmV0dXJuIGd0ZSQ0KGEsIGIsIGxvb3NlKVxuXG4gICAgY2FzZSAnPCc6XG4gICAgICByZXR1cm4gbHQkNChhLCBiLCBsb29zZSlcblxuICAgIGNhc2UgJzw9JzpcbiAgICAgIHJldHVybiBsdGUkNChhLCBiLCBsb29zZSlcblxuICAgIGRlZmF1bHQ6XG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKGBJbnZhbGlkIG9wZXJhdG9yOiAke29wfWApXG4gIH1cbn07XG52YXIgY21wXzEkMSA9IGNtcCQzO1xuXG5jb25zdCBTZW1WZXIkbCA9IHNlbXZlciQ1O1xuY29uc3QgcGFyc2UkNyA9IHBhcnNlXzEkMTtcbmNvbnN0IHtyZTogcmUkOCwgdDogdCQ3fSA9IHJlJGIuZXhwb3J0cztcblxuY29uc3QgY29lcmNlJDEgPSAodmVyc2lvbiwgb3B0aW9ucykgPT4ge1xuICBpZiAodmVyc2lvbiBpbnN0YW5jZW9mIFNlbVZlciRsKSB7XG4gICAgcmV0dXJuIHZlcnNpb25cbiAgfVxuXG4gIGlmICh0eXBlb2YgdmVyc2lvbiA9PT0gJ251bWJlcicpIHtcbiAgICB2ZXJzaW9uID0gU3RyaW5nKHZlcnNpb24pO1xuICB9XG5cbiAgaWYgKHR5cGVvZiB2ZXJzaW9uICE9PSAnc3RyaW5nJykge1xuICAgIHJldHVybiBudWxsXG4gIH1cblxuICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcblxuICBsZXQgbWF0Y2ggPSBudWxsO1xuICBpZiAoIW9wdGlvbnMucnRsKSB7XG4gICAgbWF0Y2ggPSB2ZXJzaW9uLm1hdGNoKHJlJDhbdCQ3LkNPRVJDRV0pO1xuICB9IGVsc2Uge1xuICAgIC8vIEZpbmQgdGhlIHJpZ2h0LW1vc3QgY29lcmNpYmxlIHN0cmluZyB0aGF0IGRvZXMgbm90IHNoYXJlXG4gICAgLy8gYSB0ZXJtaW51cyB3aXRoIGEgbW9yZSBsZWZ0LXdhcmQgY29lcmNpYmxlIHN0cmluZy5cbiAgICAvLyBFZywgJzEuMi4zLjQnIHdhbnRzIHRvIGNvZXJjZSAnMi4zLjQnLCBub3QgJzMuNCcgb3IgJzQnXG4gICAgLy9cbiAgICAvLyBXYWxrIHRocm91Z2ggdGhlIHN0cmluZyBjaGVja2luZyB3aXRoIGEgL2cgcmVnZXhwXG4gICAgLy8gTWFudWFsbHkgc2V0IHRoZSBpbmRleCBzbyBhcyB0byBwaWNrIHVwIG92ZXJsYXBwaW5nIG1hdGNoZXMuXG4gICAgLy8gU3RvcCB3aGVuIHdlIGdldCBhIG1hdGNoIHRoYXQgZW5kcyBhdCB0aGUgc3RyaW5nIGVuZCwgc2luY2Ugbm9cbiAgICAvLyBjb2VyY2libGUgc3RyaW5nIGNhbiBiZSBtb3JlIHJpZ2h0LXdhcmQgd2l0aG91dCB0aGUgc2FtZSB0ZXJtaW51cy5cbiAgICBsZXQgbmV4dDtcbiAgICB3aGlsZSAoKG5leHQgPSByZSQ4W3QkNy5DT0VSQ0VSVExdLmV4ZWModmVyc2lvbikpICYmXG4gICAgICAgICghbWF0Y2ggfHwgbWF0Y2guaW5kZXggKyBtYXRjaFswXS5sZW5ndGggIT09IHZlcnNpb24ubGVuZ3RoKVxuICAgICkge1xuICAgICAgaWYgKCFtYXRjaCB8fFxuICAgICAgICAgICAgbmV4dC5pbmRleCArIG5leHRbMF0ubGVuZ3RoICE9PSBtYXRjaC5pbmRleCArIG1hdGNoWzBdLmxlbmd0aCkge1xuICAgICAgICBtYXRjaCA9IG5leHQ7XG4gICAgICB9XG4gICAgICByZSQ4W3QkNy5DT0VSQ0VSVExdLmxhc3RJbmRleCA9IG5leHQuaW5kZXggKyBuZXh0WzFdLmxlbmd0aCArIG5leHRbMl0ubGVuZ3RoO1xuICAgIH1cbiAgICAvLyBsZWF2ZSBpdCBpbiBhIGNsZWFuIHN0YXRlXG4gICAgcmUkOFt0JDcuQ09FUkNFUlRMXS5sYXN0SW5kZXggPSAtMTtcbiAgfVxuXG4gIGlmIChtYXRjaCA9PT0gbnVsbClcbiAgICByZXR1cm4gbnVsbFxuXG4gIHJldHVybiBwYXJzZSQ3KGAke21hdGNoWzJdfS4ke21hdGNoWzNdIHx8ICcwJ30uJHttYXRjaFs0XSB8fCAnMCd9YCwgb3B0aW9ucylcbn07XG52YXIgY29lcmNlXzEkMSA9IGNvZXJjZSQxO1xuXG52YXIgeWFsbGlzdCQxID0gWWFsbGlzdCQzO1xuXG5ZYWxsaXN0JDMuTm9kZSA9IE5vZGUkMTtcbllhbGxpc3QkMy5jcmVhdGUgPSBZYWxsaXN0JDM7XG5cbmZ1bmN0aW9uIFlhbGxpc3QkMyAobGlzdCkge1xuICB2YXIgc2VsZiA9IHRoaXM7XG4gIGlmICghKHNlbGYgaW5zdGFuY2VvZiBZYWxsaXN0JDMpKSB7XG4gICAgc2VsZiA9IG5ldyBZYWxsaXN0JDMoKTtcbiAgfVxuXG4gIHNlbGYudGFpbCA9IG51bGw7XG4gIHNlbGYuaGVhZCA9IG51bGw7XG4gIHNlbGYubGVuZ3RoID0gMDtcblxuICBpZiAobGlzdCAmJiB0eXBlb2YgbGlzdC5mb3JFYWNoID09PSAnZnVuY3Rpb24nKSB7XG4gICAgbGlzdC5mb3JFYWNoKGZ1bmN0aW9uIChpdGVtKSB7XG4gICAgICBzZWxmLnB1c2goaXRlbSk7XG4gICAgfSk7XG4gIH0gZWxzZSBpZiAoYXJndW1lbnRzLmxlbmd0aCA+IDApIHtcbiAgICBmb3IgKHZhciBpID0gMCwgbCA9IGFyZ3VtZW50cy5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICAgIHNlbGYucHVzaChhcmd1bWVudHNbaV0pO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBzZWxmXG59XG5cbllhbGxpc3QkMy5wcm90b3R5cGUucmVtb3ZlTm9kZSA9IGZ1bmN0aW9uIChub2RlKSB7XG4gIGlmIChub2RlLmxpc3QgIT09IHRoaXMpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3JlbW92aW5nIG5vZGUgd2hpY2ggZG9lcyBub3QgYmVsb25nIHRvIHRoaXMgbGlzdCcpXG4gIH1cblxuICB2YXIgbmV4dCA9IG5vZGUubmV4dDtcbiAgdmFyIHByZXYgPSBub2RlLnByZXY7XG5cbiAgaWYgKG5leHQpIHtcbiAgICBuZXh0LnByZXYgPSBwcmV2O1xuICB9XG5cbiAgaWYgKHByZXYpIHtcbiAgICBwcmV2Lm5leHQgPSBuZXh0O1xuICB9XG5cbiAgaWYgKG5vZGUgPT09IHRoaXMuaGVhZCkge1xuICAgIHRoaXMuaGVhZCA9IG5leHQ7XG4gIH1cbiAgaWYgKG5vZGUgPT09IHRoaXMudGFpbCkge1xuICAgIHRoaXMudGFpbCA9IHByZXY7XG4gIH1cblxuICBub2RlLmxpc3QubGVuZ3RoLS07XG4gIG5vZGUubmV4dCA9IG51bGw7XG4gIG5vZGUucHJldiA9IG51bGw7XG4gIG5vZGUubGlzdCA9IG51bGw7XG5cbiAgcmV0dXJuIG5leHRcbn07XG5cbllhbGxpc3QkMy5wcm90b3R5cGUudW5zaGlmdE5vZGUgPSBmdW5jdGlvbiAobm9kZSkge1xuICBpZiAobm9kZSA9PT0gdGhpcy5oZWFkKSB7XG4gICAgcmV0dXJuXG4gIH1cblxuICBpZiAobm9kZS5saXN0KSB7XG4gICAgbm9kZS5saXN0LnJlbW92ZU5vZGUobm9kZSk7XG4gIH1cblxuICB2YXIgaGVhZCA9IHRoaXMuaGVhZDtcbiAgbm9kZS5saXN0ID0gdGhpcztcbiAgbm9kZS5uZXh0ID0gaGVhZDtcbiAgaWYgKGhlYWQpIHtcbiAgICBoZWFkLnByZXYgPSBub2RlO1xuICB9XG5cbiAgdGhpcy5oZWFkID0gbm9kZTtcbiAgaWYgKCF0aGlzLnRhaWwpIHtcbiAgICB0aGlzLnRhaWwgPSBub2RlO1xuICB9XG4gIHRoaXMubGVuZ3RoKys7XG59O1xuXG5ZYWxsaXN0JDMucHJvdG90eXBlLnB1c2hOb2RlID0gZnVuY3Rpb24gKG5vZGUpIHtcbiAgaWYgKG5vZGUgPT09IHRoaXMudGFpbCkge1xuICAgIHJldHVyblxuICB9XG5cbiAgaWYgKG5vZGUubGlzdCkge1xuICAgIG5vZGUubGlzdC5yZW1vdmVOb2RlKG5vZGUpO1xuICB9XG5cbiAgdmFyIHRhaWwgPSB0aGlzLnRhaWw7XG4gIG5vZGUubGlzdCA9IHRoaXM7XG4gIG5vZGUucHJldiA9IHRhaWw7XG4gIGlmICh0YWlsKSB7XG4gICAgdGFpbC5uZXh0ID0gbm9kZTtcbiAgfVxuXG4gIHRoaXMudGFpbCA9IG5vZGU7XG4gIGlmICghdGhpcy5oZWFkKSB7XG4gICAgdGhpcy5oZWFkID0gbm9kZTtcbiAgfVxuICB0aGlzLmxlbmd0aCsrO1xufTtcblxuWWFsbGlzdCQzLnByb3RvdHlwZS5wdXNoID0gZnVuY3Rpb24gKCkge1xuICBmb3IgKHZhciBpID0gMCwgbCA9IGFyZ3VtZW50cy5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICBwdXNoJDEodGhpcywgYXJndW1lbnRzW2ldKTtcbiAgfVxuICByZXR1cm4gdGhpcy5sZW5ndGhcbn07XG5cbllhbGxpc3QkMy5wcm90b3R5cGUudW5zaGlmdCA9IGZ1bmN0aW9uICgpIHtcbiAgZm9yICh2YXIgaSA9IDAsIGwgPSBhcmd1bWVudHMubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgdW5zaGlmdCQxKHRoaXMsIGFyZ3VtZW50c1tpXSk7XG4gIH1cbiAgcmV0dXJuIHRoaXMubGVuZ3RoXG59O1xuXG5ZYWxsaXN0JDMucHJvdG90eXBlLnBvcCA9IGZ1bmN0aW9uICgpIHtcbiAgaWYgKCF0aGlzLnRhaWwpIHtcbiAgICByZXR1cm4gdW5kZWZpbmVkXG4gIH1cblxuICB2YXIgcmVzID0gdGhpcy50YWlsLnZhbHVlO1xuICB0aGlzLnRhaWwgPSB0aGlzLnRhaWwucHJldjtcbiAgaWYgKHRoaXMudGFpbCkge1xuICAgIHRoaXMudGFpbC5uZXh0ID0gbnVsbDtcbiAgfSBlbHNlIHtcbiAgICB0aGlzLmhlYWQgPSBudWxsO1xuICB9XG4gIHRoaXMubGVuZ3RoLS07XG4gIHJldHVybiByZXNcbn07XG5cbllhbGxpc3QkMy5wcm90b3R5cGUuc2hpZnQgPSBmdW5jdGlvbiAoKSB7XG4gIGlmICghdGhpcy5oZWFkKSB7XG4gICAgcmV0dXJuIHVuZGVmaW5lZFxuICB9XG5cbiAgdmFyIHJlcyA9IHRoaXMuaGVhZC52YWx1ZTtcbiAgdGhpcy5oZWFkID0gdGhpcy5oZWFkLm5leHQ7XG4gIGlmICh0aGlzLmhlYWQpIHtcbiAgICB0aGlzLmhlYWQucHJldiA9IG51bGw7XG4gIH0gZWxzZSB7XG4gICAgdGhpcy50YWlsID0gbnVsbDtcbiAgfVxuICB0aGlzLmxlbmd0aC0tO1xuICByZXR1cm4gcmVzXG59O1xuXG5ZYWxsaXN0JDMucHJvdG90eXBlLmZvckVhY2ggPSBmdW5jdGlvbiAoZm4sIHRoaXNwKSB7XG4gIHRoaXNwID0gdGhpc3AgfHwgdGhpcztcbiAgZm9yICh2YXIgd2Fsa2VyID0gdGhpcy5oZWFkLCBpID0gMDsgd2Fsa2VyICE9PSBudWxsOyBpKyspIHtcbiAgICBmbi5jYWxsKHRoaXNwLCB3YWxrZXIudmFsdWUsIGksIHRoaXMpO1xuICAgIHdhbGtlciA9IHdhbGtlci5uZXh0O1xuICB9XG59O1xuXG5ZYWxsaXN0JDMucHJvdG90eXBlLmZvckVhY2hSZXZlcnNlID0gZnVuY3Rpb24gKGZuLCB0aGlzcCkge1xuICB0aGlzcCA9IHRoaXNwIHx8IHRoaXM7XG4gIGZvciAodmFyIHdhbGtlciA9IHRoaXMudGFpbCwgaSA9IHRoaXMubGVuZ3RoIC0gMTsgd2Fsa2VyICE9PSBudWxsOyBpLS0pIHtcbiAgICBmbi5jYWxsKHRoaXNwLCB3YWxrZXIudmFsdWUsIGksIHRoaXMpO1xuICAgIHdhbGtlciA9IHdhbGtlci5wcmV2O1xuICB9XG59O1xuXG5ZYWxsaXN0JDMucHJvdG90eXBlLmdldCA9IGZ1bmN0aW9uIChuKSB7XG4gIGZvciAodmFyIGkgPSAwLCB3YWxrZXIgPSB0aGlzLmhlYWQ7IHdhbGtlciAhPT0gbnVsbCAmJiBpIDwgbjsgaSsrKSB7XG4gICAgLy8gYWJvcnQgb3V0IG9mIHRoZSBsaXN0IGVhcmx5IGlmIHdlIGhpdCBhIGN5Y2xlXG4gICAgd2Fsa2VyID0gd2Fsa2VyLm5leHQ7XG4gIH1cbiAgaWYgKGkgPT09IG4gJiYgd2Fsa2VyICE9PSBudWxsKSB7XG4gICAgcmV0dXJuIHdhbGtlci52YWx1ZVxuICB9XG59O1xuXG5ZYWxsaXN0JDMucHJvdG90eXBlLmdldFJldmVyc2UgPSBmdW5jdGlvbiAobikge1xuICBmb3IgKHZhciBpID0gMCwgd2Fsa2VyID0gdGhpcy50YWlsOyB3YWxrZXIgIT09IG51bGwgJiYgaSA8IG47IGkrKykge1xuICAgIC8vIGFib3J0IG91dCBvZiB0aGUgbGlzdCBlYXJseSBpZiB3ZSBoaXQgYSBjeWNsZVxuICAgIHdhbGtlciA9IHdhbGtlci5wcmV2O1xuICB9XG4gIGlmIChpID09PSBuICYmIHdhbGtlciAhPT0gbnVsbCkge1xuICAgIHJldHVybiB3YWxrZXIudmFsdWVcbiAgfVxufTtcblxuWWFsbGlzdCQzLnByb3RvdHlwZS5tYXAgPSBmdW5jdGlvbiAoZm4sIHRoaXNwKSB7XG4gIHRoaXNwID0gdGhpc3AgfHwgdGhpcztcbiAgdmFyIHJlcyA9IG5ldyBZYWxsaXN0JDMoKTtcbiAgZm9yICh2YXIgd2Fsa2VyID0gdGhpcy5oZWFkOyB3YWxrZXIgIT09IG51bGw7KSB7XG4gICAgcmVzLnB1c2goZm4uY2FsbCh0aGlzcCwgd2Fsa2VyLnZhbHVlLCB0aGlzKSk7XG4gICAgd2Fsa2VyID0gd2Fsa2VyLm5leHQ7XG4gIH1cbiAgcmV0dXJuIHJlc1xufTtcblxuWWFsbGlzdCQzLnByb3RvdHlwZS5tYXBSZXZlcnNlID0gZnVuY3Rpb24gKGZuLCB0aGlzcCkge1xuICB0aGlzcCA9IHRoaXNwIHx8IHRoaXM7XG4gIHZhciByZXMgPSBuZXcgWWFsbGlzdCQzKCk7XG4gIGZvciAodmFyIHdhbGtlciA9IHRoaXMudGFpbDsgd2Fsa2VyICE9PSBudWxsOykge1xuICAgIHJlcy5wdXNoKGZuLmNhbGwodGhpc3AsIHdhbGtlci52YWx1ZSwgdGhpcykpO1xuICAgIHdhbGtlciA9IHdhbGtlci5wcmV2O1xuICB9XG4gIHJldHVybiByZXNcbn07XG5cbllhbGxpc3QkMy5wcm90b3R5cGUucmVkdWNlID0gZnVuY3Rpb24gKGZuLCBpbml0aWFsKSB7XG4gIHZhciBhY2M7XG4gIHZhciB3YWxrZXIgPSB0aGlzLmhlYWQ7XG4gIGlmIChhcmd1bWVudHMubGVuZ3RoID4gMSkge1xuICAgIGFjYyA9IGluaXRpYWw7XG4gIH0gZWxzZSBpZiAodGhpcy5oZWFkKSB7XG4gICAgd2Fsa2VyID0gdGhpcy5oZWFkLm5leHQ7XG4gICAgYWNjID0gdGhpcy5oZWFkLnZhbHVlO1xuICB9IGVsc2Uge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ1JlZHVjZSBvZiBlbXB0eSBsaXN0IHdpdGggbm8gaW5pdGlhbCB2YWx1ZScpXG4gIH1cblxuICBmb3IgKHZhciBpID0gMDsgd2Fsa2VyICE9PSBudWxsOyBpKyspIHtcbiAgICBhY2MgPSBmbihhY2MsIHdhbGtlci52YWx1ZSwgaSk7XG4gICAgd2Fsa2VyID0gd2Fsa2VyLm5leHQ7XG4gIH1cblxuICByZXR1cm4gYWNjXG59O1xuXG5ZYWxsaXN0JDMucHJvdG90eXBlLnJlZHVjZVJldmVyc2UgPSBmdW5jdGlvbiAoZm4sIGluaXRpYWwpIHtcbiAgdmFyIGFjYztcbiAgdmFyIHdhbGtlciA9IHRoaXMudGFpbDtcbiAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPiAxKSB7XG4gICAgYWNjID0gaW5pdGlhbDtcbiAgfSBlbHNlIGlmICh0aGlzLnRhaWwpIHtcbiAgICB3YWxrZXIgPSB0aGlzLnRhaWwucHJldjtcbiAgICBhY2MgPSB0aGlzLnRhaWwudmFsdWU7XG4gIH0gZWxzZSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcignUmVkdWNlIG9mIGVtcHR5IGxpc3Qgd2l0aCBubyBpbml0aWFsIHZhbHVlJylcbiAgfVxuXG4gIGZvciAodmFyIGkgPSB0aGlzLmxlbmd0aCAtIDE7IHdhbGtlciAhPT0gbnVsbDsgaS0tKSB7XG4gICAgYWNjID0gZm4oYWNjLCB3YWxrZXIudmFsdWUsIGkpO1xuICAgIHdhbGtlciA9IHdhbGtlci5wcmV2O1xuICB9XG5cbiAgcmV0dXJuIGFjY1xufTtcblxuWWFsbGlzdCQzLnByb3RvdHlwZS50b0FycmF5ID0gZnVuY3Rpb24gKCkge1xuICB2YXIgYXJyID0gbmV3IEFycmF5KHRoaXMubGVuZ3RoKTtcbiAgZm9yICh2YXIgaSA9IDAsIHdhbGtlciA9IHRoaXMuaGVhZDsgd2Fsa2VyICE9PSBudWxsOyBpKyspIHtcbiAgICBhcnJbaV0gPSB3YWxrZXIudmFsdWU7XG4gICAgd2Fsa2VyID0gd2Fsa2VyLm5leHQ7XG4gIH1cbiAgcmV0dXJuIGFyclxufTtcblxuWWFsbGlzdCQzLnByb3RvdHlwZS50b0FycmF5UmV2ZXJzZSA9IGZ1bmN0aW9uICgpIHtcbiAgdmFyIGFyciA9IG5ldyBBcnJheSh0aGlzLmxlbmd0aCk7XG4gIGZvciAodmFyIGkgPSAwLCB3YWxrZXIgPSB0aGlzLnRhaWw7IHdhbGtlciAhPT0gbnVsbDsgaSsrKSB7XG4gICAgYXJyW2ldID0gd2Fsa2VyLnZhbHVlO1xuICAgIHdhbGtlciA9IHdhbGtlci5wcmV2O1xuICB9XG4gIHJldHVybiBhcnJcbn07XG5cbllhbGxpc3QkMy5wcm90b3R5cGUuc2xpY2UgPSBmdW5jdGlvbiAoZnJvbSwgdG8pIHtcbiAgdG8gPSB0byB8fCB0aGlzLmxlbmd0aDtcbiAgaWYgKHRvIDwgMCkge1xuICAgIHRvICs9IHRoaXMubGVuZ3RoO1xuICB9XG4gIGZyb20gPSBmcm9tIHx8IDA7XG4gIGlmIChmcm9tIDwgMCkge1xuICAgIGZyb20gKz0gdGhpcy5sZW5ndGg7XG4gIH1cbiAgdmFyIHJldCA9IG5ldyBZYWxsaXN0JDMoKTtcbiAgaWYgKHRvIDwgZnJvbSB8fCB0byA8IDApIHtcbiAgICByZXR1cm4gcmV0XG4gIH1cbiAgaWYgKGZyb20gPCAwKSB7XG4gICAgZnJvbSA9IDA7XG4gIH1cbiAgaWYgKHRvID4gdGhpcy5sZW5ndGgpIHtcbiAgICB0byA9IHRoaXMubGVuZ3RoO1xuICB9XG4gIGZvciAodmFyIGkgPSAwLCB3YWxrZXIgPSB0aGlzLmhlYWQ7IHdhbGtlciAhPT0gbnVsbCAmJiBpIDwgZnJvbTsgaSsrKSB7XG4gICAgd2Fsa2VyID0gd2Fsa2VyLm5leHQ7XG4gIH1cbiAgZm9yICg7IHdhbGtlciAhPT0gbnVsbCAmJiBpIDwgdG87IGkrKywgd2Fsa2VyID0gd2Fsa2VyLm5leHQpIHtcbiAgICByZXQucHVzaCh3YWxrZXIudmFsdWUpO1xuICB9XG4gIHJldHVybiByZXRcbn07XG5cbllhbGxpc3QkMy5wcm90b3R5cGUuc2xpY2VSZXZlcnNlID0gZnVuY3Rpb24gKGZyb20sIHRvKSB7XG4gIHRvID0gdG8gfHwgdGhpcy5sZW5ndGg7XG4gIGlmICh0byA8IDApIHtcbiAgICB0byArPSB0aGlzLmxlbmd0aDtcbiAgfVxuICBmcm9tID0gZnJvbSB8fCAwO1xuICBpZiAoZnJvbSA8IDApIHtcbiAgICBmcm9tICs9IHRoaXMubGVuZ3RoO1xuICB9XG4gIHZhciByZXQgPSBuZXcgWWFsbGlzdCQzKCk7XG4gIGlmICh0byA8IGZyb20gfHwgdG8gPCAwKSB7XG4gICAgcmV0dXJuIHJldFxuICB9XG4gIGlmIChmcm9tIDwgMCkge1xuICAgIGZyb20gPSAwO1xuICB9XG4gIGlmICh0byA+IHRoaXMubGVuZ3RoKSB7XG4gICAgdG8gPSB0aGlzLmxlbmd0aDtcbiAgfVxuICBmb3IgKHZhciBpID0gdGhpcy5sZW5ndGgsIHdhbGtlciA9IHRoaXMudGFpbDsgd2Fsa2VyICE9PSBudWxsICYmIGkgPiB0bzsgaS0tKSB7XG4gICAgd2Fsa2VyID0gd2Fsa2VyLnByZXY7XG4gIH1cbiAgZm9yICg7IHdhbGtlciAhPT0gbnVsbCAmJiBpID4gZnJvbTsgaS0tLCB3YWxrZXIgPSB3YWxrZXIucHJldikge1xuICAgIHJldC5wdXNoKHdhbGtlci52YWx1ZSk7XG4gIH1cbiAgcmV0dXJuIHJldFxufTtcblxuWWFsbGlzdCQzLnByb3RvdHlwZS5zcGxpY2UgPSBmdW5jdGlvbiAoc3RhcnQsIGRlbGV0ZUNvdW50LCAuLi5ub2Rlcykge1xuICBpZiAoc3RhcnQgPiB0aGlzLmxlbmd0aCkge1xuICAgIHN0YXJ0ID0gdGhpcy5sZW5ndGggLSAxO1xuICB9XG4gIGlmIChzdGFydCA8IDApIHtcbiAgICBzdGFydCA9IHRoaXMubGVuZ3RoICsgc3RhcnQ7XG4gIH1cblxuICBmb3IgKHZhciBpID0gMCwgd2Fsa2VyID0gdGhpcy5oZWFkOyB3YWxrZXIgIT09IG51bGwgJiYgaSA8IHN0YXJ0OyBpKyspIHtcbiAgICB3YWxrZXIgPSB3YWxrZXIubmV4dDtcbiAgfVxuXG4gIHZhciByZXQgPSBbXTtcbiAgZm9yICh2YXIgaSA9IDA7IHdhbGtlciAmJiBpIDwgZGVsZXRlQ291bnQ7IGkrKykge1xuICAgIHJldC5wdXNoKHdhbGtlci52YWx1ZSk7XG4gICAgd2Fsa2VyID0gdGhpcy5yZW1vdmVOb2RlKHdhbGtlcik7XG4gIH1cbiAgaWYgKHdhbGtlciA9PT0gbnVsbCkge1xuICAgIHdhbGtlciA9IHRoaXMudGFpbDtcbiAgfVxuXG4gIGlmICh3YWxrZXIgIT09IHRoaXMuaGVhZCAmJiB3YWxrZXIgIT09IHRoaXMudGFpbCkge1xuICAgIHdhbGtlciA9IHdhbGtlci5wcmV2O1xuICB9XG5cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBub2Rlcy5sZW5ndGg7IGkrKykge1xuICAgIHdhbGtlciA9IGluc2VydCQxKHRoaXMsIHdhbGtlciwgbm9kZXNbaV0pO1xuICB9XG4gIHJldHVybiByZXQ7XG59O1xuXG5ZYWxsaXN0JDMucHJvdG90eXBlLnJldmVyc2UgPSBmdW5jdGlvbiAoKSB7XG4gIHZhciBoZWFkID0gdGhpcy5oZWFkO1xuICB2YXIgdGFpbCA9IHRoaXMudGFpbDtcbiAgZm9yICh2YXIgd2Fsa2VyID0gaGVhZDsgd2Fsa2VyICE9PSBudWxsOyB3YWxrZXIgPSB3YWxrZXIucHJldikge1xuICAgIHZhciBwID0gd2Fsa2VyLnByZXY7XG4gICAgd2Fsa2VyLnByZXYgPSB3YWxrZXIubmV4dDtcbiAgICB3YWxrZXIubmV4dCA9IHA7XG4gIH1cbiAgdGhpcy5oZWFkID0gdGFpbDtcbiAgdGhpcy50YWlsID0gaGVhZDtcbiAgcmV0dXJuIHRoaXNcbn07XG5cbmZ1bmN0aW9uIGluc2VydCQxIChzZWxmLCBub2RlLCB2YWx1ZSkge1xuICB2YXIgaW5zZXJ0ZWQgPSBub2RlID09PSBzZWxmLmhlYWQgP1xuICAgIG5ldyBOb2RlJDEodmFsdWUsIG51bGwsIG5vZGUsIHNlbGYpIDpcbiAgICBuZXcgTm9kZSQxKHZhbHVlLCBub2RlLCBub2RlLm5leHQsIHNlbGYpO1xuXG4gIGlmIChpbnNlcnRlZC5uZXh0ID09PSBudWxsKSB7XG4gICAgc2VsZi50YWlsID0gaW5zZXJ0ZWQ7XG4gIH1cbiAgaWYgKGluc2VydGVkLnByZXYgPT09IG51bGwpIHtcbiAgICBzZWxmLmhlYWQgPSBpbnNlcnRlZDtcbiAgfVxuXG4gIHNlbGYubGVuZ3RoKys7XG5cbiAgcmV0dXJuIGluc2VydGVkXG59XG5cbmZ1bmN0aW9uIHB1c2gkMSAoc2VsZiwgaXRlbSkge1xuICBzZWxmLnRhaWwgPSBuZXcgTm9kZSQxKGl0ZW0sIHNlbGYudGFpbCwgbnVsbCwgc2VsZik7XG4gIGlmICghc2VsZi5oZWFkKSB7XG4gICAgc2VsZi5oZWFkID0gc2VsZi50YWlsO1xuICB9XG4gIHNlbGYubGVuZ3RoKys7XG59XG5cbmZ1bmN0aW9uIHVuc2hpZnQkMSAoc2VsZiwgaXRlbSkge1xuICBzZWxmLmhlYWQgPSBuZXcgTm9kZSQxKGl0ZW0sIG51bGwsIHNlbGYuaGVhZCwgc2VsZik7XG4gIGlmICghc2VsZi50YWlsKSB7XG4gICAgc2VsZi50YWlsID0gc2VsZi5oZWFkO1xuICB9XG4gIHNlbGYubGVuZ3RoKys7XG59XG5cbmZ1bmN0aW9uIE5vZGUkMSAodmFsdWUsIHByZXYsIG5leHQsIGxpc3QpIHtcbiAgaWYgKCEodGhpcyBpbnN0YW5jZW9mIE5vZGUkMSkpIHtcbiAgICByZXR1cm4gbmV3IE5vZGUkMSh2YWx1ZSwgcHJldiwgbmV4dCwgbGlzdClcbiAgfVxuXG4gIHRoaXMubGlzdCA9IGxpc3Q7XG4gIHRoaXMudmFsdWUgPSB2YWx1ZTtcblxuICBpZiAocHJldikge1xuICAgIHByZXYubmV4dCA9IHRoaXM7XG4gICAgdGhpcy5wcmV2ID0gcHJldjtcbiAgfSBlbHNlIHtcbiAgICB0aGlzLnByZXYgPSBudWxsO1xuICB9XG5cbiAgaWYgKG5leHQpIHtcbiAgICBuZXh0LnByZXYgPSB0aGlzO1xuICAgIHRoaXMubmV4dCA9IG5leHQ7XG4gIH0gZWxzZSB7XG4gICAgdGhpcy5uZXh0ID0gbnVsbDtcbiAgfVxufVxuXG50cnkge1xuICAvLyBhZGQgaWYgc3VwcG9ydCBmb3IgU3ltYm9sLml0ZXJhdG9yIGlzIHByZXNlbnRcbiAgcmVxdWlyZSgnLi9pdGVyYXRvci5qcycpKFlhbGxpc3QkMyk7XG59IGNhdGNoIChlcikge31cblxuLy8gQSBsaW5rZWQgbGlzdCB0byBrZWVwIHRyYWNrIG9mIHJlY2VudGx5LXVzZWQtbmVzc1xuY29uc3QgWWFsbGlzdCQyID0geWFsbGlzdCQxO1xuXG5jb25zdCBNQVgkMSA9IFN5bWJvbCgnbWF4Jyk7XG5jb25zdCBMRU5HVEgkMSA9IFN5bWJvbCgnbGVuZ3RoJyk7XG5jb25zdCBMRU5HVEhfQ0FMQ1VMQVRPUiQxID0gU3ltYm9sKCdsZW5ndGhDYWxjdWxhdG9yJyk7XG5jb25zdCBBTExPV19TVEFMRSQxID0gU3ltYm9sKCdhbGxvd1N0YWxlJyk7XG5jb25zdCBNQVhfQUdFJDEgPSBTeW1ib2woJ21heEFnZScpO1xuY29uc3QgRElTUE9TRSQxID0gU3ltYm9sKCdkaXNwb3NlJyk7XG5jb25zdCBOT19ESVNQT1NFX09OX1NFVCQxID0gU3ltYm9sKCdub0Rpc3Bvc2VPblNldCcpO1xuY29uc3QgTFJVX0xJU1QkMSA9IFN5bWJvbCgnbHJ1TGlzdCcpO1xuY29uc3QgQ0FDSEUkMSA9IFN5bWJvbCgnY2FjaGUnKTtcbmNvbnN0IFVQREFURV9BR0VfT05fR0VUJDEgPSBTeW1ib2woJ3VwZGF0ZUFnZU9uR2V0Jyk7XG5cbmNvbnN0IG5haXZlTGVuZ3RoJDEgPSAoKSA9PiAxO1xuXG4vLyBscnVMaXN0IGlzIGEgeWFsbGlzdCB3aGVyZSB0aGUgaGVhZCBpcyB0aGUgeW91bmdlc3Rcbi8vIGl0ZW0sIGFuZCB0aGUgdGFpbCBpcyB0aGUgb2xkZXN0LiAgdGhlIGxpc3QgY29udGFpbnMgdGhlIEhpdFxuLy8gb2JqZWN0cyBhcyB0aGUgZW50cmllcy5cbi8vIEVhY2ggSGl0IG9iamVjdCBoYXMgYSByZWZlcmVuY2UgdG8gaXRzIFlhbGxpc3QuTm9kZS4gIFRoaXNcbi8vIG5ldmVyIGNoYW5nZXMuXG4vL1xuLy8gY2FjaGUgaXMgYSBNYXAgKG9yIFBzZXVkb01hcCkgdGhhdCBtYXRjaGVzIHRoZSBrZXlzIHRvXG4vLyB0aGUgWWFsbGlzdC5Ob2RlIG9iamVjdC5cbmNsYXNzIExSVUNhY2hlJDEge1xuICBjb25zdHJ1Y3RvciAob3B0aW9ucykge1xuICAgIGlmICh0eXBlb2Ygb3B0aW9ucyA9PT0gJ251bWJlcicpXG4gICAgICBvcHRpb25zID0geyBtYXg6IG9wdGlvbnMgfTtcblxuICAgIGlmICghb3B0aW9ucylcbiAgICAgIG9wdGlvbnMgPSB7fTtcblxuICAgIGlmIChvcHRpb25zLm1heCAmJiAodHlwZW9mIG9wdGlvbnMubWF4ICE9PSAnbnVtYmVyJyB8fCBvcHRpb25zLm1heCA8IDApKVxuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignbWF4IG11c3QgYmUgYSBub24tbmVnYXRpdmUgbnVtYmVyJylcbiAgICAvLyBLaW5kIG9mIHdlaXJkIHRvIGhhdmUgYSBkZWZhdWx0IG1heCBvZiBJbmZpbml0eSwgYnV0IG9oIHdlbGwuXG4gICAgdGhpc1tNQVgkMV0gPSBvcHRpb25zLm1heCB8fCBJbmZpbml0eTtcblxuICAgIGNvbnN0IGxjID0gb3B0aW9ucy5sZW5ndGggfHwgbmFpdmVMZW5ndGgkMTtcbiAgICB0aGlzW0xFTkdUSF9DQUxDVUxBVE9SJDFdID0gKHR5cGVvZiBsYyAhPT0gJ2Z1bmN0aW9uJykgPyBuYWl2ZUxlbmd0aCQxIDogbGM7XG4gICAgdGhpc1tBTExPV19TVEFMRSQxXSA9IG9wdGlvbnMuc3RhbGUgfHwgZmFsc2U7XG4gICAgaWYgKG9wdGlvbnMubWF4QWdlICYmIHR5cGVvZiBvcHRpb25zLm1heEFnZSAhPT0gJ251bWJlcicpXG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdtYXhBZ2UgbXVzdCBiZSBhIG51bWJlcicpXG4gICAgdGhpc1tNQVhfQUdFJDFdID0gb3B0aW9ucy5tYXhBZ2UgfHwgMDtcbiAgICB0aGlzW0RJU1BPU0UkMV0gPSBvcHRpb25zLmRpc3Bvc2U7XG4gICAgdGhpc1tOT19ESVNQT1NFX09OX1NFVCQxXSA9IG9wdGlvbnMubm9EaXNwb3NlT25TZXQgfHwgZmFsc2U7XG4gICAgdGhpc1tVUERBVEVfQUdFX09OX0dFVCQxXSA9IG9wdGlvbnMudXBkYXRlQWdlT25HZXQgfHwgZmFsc2U7XG4gICAgdGhpcy5yZXNldCgpO1xuICB9XG5cbiAgLy8gcmVzaXplIHRoZSBjYWNoZSB3aGVuIHRoZSBtYXggY2hhbmdlcy5cbiAgc2V0IG1heCAobUwpIHtcbiAgICBpZiAodHlwZW9mIG1MICE9PSAnbnVtYmVyJyB8fCBtTCA8IDApXG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdtYXggbXVzdCBiZSBhIG5vbi1uZWdhdGl2ZSBudW1iZXInKVxuXG4gICAgdGhpc1tNQVgkMV0gPSBtTCB8fCBJbmZpbml0eTtcbiAgICB0cmltJDEodGhpcyk7XG4gIH1cbiAgZ2V0IG1heCAoKSB7XG4gICAgcmV0dXJuIHRoaXNbTUFYJDFdXG4gIH1cblxuICBzZXQgYWxsb3dTdGFsZSAoYWxsb3dTdGFsZSkge1xuICAgIHRoaXNbQUxMT1dfU1RBTEUkMV0gPSAhIWFsbG93U3RhbGU7XG4gIH1cbiAgZ2V0IGFsbG93U3RhbGUgKCkge1xuICAgIHJldHVybiB0aGlzW0FMTE9XX1NUQUxFJDFdXG4gIH1cblxuICBzZXQgbWF4QWdlIChtQSkge1xuICAgIGlmICh0eXBlb2YgbUEgIT09ICdudW1iZXInKVxuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignbWF4QWdlIG11c3QgYmUgYSBub24tbmVnYXRpdmUgbnVtYmVyJylcblxuICAgIHRoaXNbTUFYX0FHRSQxXSA9IG1BO1xuICAgIHRyaW0kMSh0aGlzKTtcbiAgfVxuICBnZXQgbWF4QWdlICgpIHtcbiAgICByZXR1cm4gdGhpc1tNQVhfQUdFJDFdXG4gIH1cblxuICAvLyByZXNpemUgdGhlIGNhY2hlIHdoZW4gdGhlIGxlbmd0aENhbGN1bGF0b3IgY2hhbmdlcy5cbiAgc2V0IGxlbmd0aENhbGN1bGF0b3IgKGxDKSB7XG4gICAgaWYgKHR5cGVvZiBsQyAhPT0gJ2Z1bmN0aW9uJylcbiAgICAgIGxDID0gbmFpdmVMZW5ndGgkMTtcblxuICAgIGlmIChsQyAhPT0gdGhpc1tMRU5HVEhfQ0FMQ1VMQVRPUiQxXSkge1xuICAgICAgdGhpc1tMRU5HVEhfQ0FMQ1VMQVRPUiQxXSA9IGxDO1xuICAgICAgdGhpc1tMRU5HVEgkMV0gPSAwO1xuICAgICAgdGhpc1tMUlVfTElTVCQxXS5mb3JFYWNoKGhpdCA9PiB7XG4gICAgICAgIGhpdC5sZW5ndGggPSB0aGlzW0xFTkdUSF9DQUxDVUxBVE9SJDFdKGhpdC52YWx1ZSwgaGl0LmtleSk7XG4gICAgICAgIHRoaXNbTEVOR1RIJDFdICs9IGhpdC5sZW5ndGg7XG4gICAgICB9KTtcbiAgICB9XG4gICAgdHJpbSQxKHRoaXMpO1xuICB9XG4gIGdldCBsZW5ndGhDYWxjdWxhdG9yICgpIHsgcmV0dXJuIHRoaXNbTEVOR1RIX0NBTENVTEFUT1IkMV0gfVxuXG4gIGdldCBsZW5ndGggKCkgeyByZXR1cm4gdGhpc1tMRU5HVEgkMV0gfVxuICBnZXQgaXRlbUNvdW50ICgpIHsgcmV0dXJuIHRoaXNbTFJVX0xJU1QkMV0ubGVuZ3RoIH1cblxuICByZm9yRWFjaCAoZm4sIHRoaXNwKSB7XG4gICAgdGhpc3AgPSB0aGlzcCB8fCB0aGlzO1xuICAgIGZvciAobGV0IHdhbGtlciA9IHRoaXNbTFJVX0xJU1QkMV0udGFpbDsgd2Fsa2VyICE9PSBudWxsOykge1xuICAgICAgY29uc3QgcHJldiA9IHdhbGtlci5wcmV2O1xuICAgICAgZm9yRWFjaFN0ZXAkMSh0aGlzLCBmbiwgd2Fsa2VyLCB0aGlzcCk7XG4gICAgICB3YWxrZXIgPSBwcmV2O1xuICAgIH1cbiAgfVxuXG4gIGZvckVhY2ggKGZuLCB0aGlzcCkge1xuICAgIHRoaXNwID0gdGhpc3AgfHwgdGhpcztcbiAgICBmb3IgKGxldCB3YWxrZXIgPSB0aGlzW0xSVV9MSVNUJDFdLmhlYWQ7IHdhbGtlciAhPT0gbnVsbDspIHtcbiAgICAgIGNvbnN0IG5leHQgPSB3YWxrZXIubmV4dDtcbiAgICAgIGZvckVhY2hTdGVwJDEodGhpcywgZm4sIHdhbGtlciwgdGhpc3ApO1xuICAgICAgd2Fsa2VyID0gbmV4dDtcbiAgICB9XG4gIH1cblxuICBrZXlzICgpIHtcbiAgICByZXR1cm4gdGhpc1tMUlVfTElTVCQxXS50b0FycmF5KCkubWFwKGsgPT4gay5rZXkpXG4gIH1cblxuICB2YWx1ZXMgKCkge1xuICAgIHJldHVybiB0aGlzW0xSVV9MSVNUJDFdLnRvQXJyYXkoKS5tYXAoayA9PiBrLnZhbHVlKVxuICB9XG5cbiAgcmVzZXQgKCkge1xuICAgIGlmICh0aGlzW0RJU1BPU0UkMV0gJiZcbiAgICAgICAgdGhpc1tMUlVfTElTVCQxXSAmJlxuICAgICAgICB0aGlzW0xSVV9MSVNUJDFdLmxlbmd0aCkge1xuICAgICAgdGhpc1tMUlVfTElTVCQxXS5mb3JFYWNoKGhpdCA9PiB0aGlzW0RJU1BPU0UkMV0oaGl0LmtleSwgaGl0LnZhbHVlKSk7XG4gICAgfVxuXG4gICAgdGhpc1tDQUNIRSQxXSA9IG5ldyBNYXAoKTsgLy8gaGFzaCBvZiBpdGVtcyBieSBrZXlcbiAgICB0aGlzW0xSVV9MSVNUJDFdID0gbmV3IFlhbGxpc3QkMigpOyAvLyBsaXN0IG9mIGl0ZW1zIGluIG9yZGVyIG9mIHVzZSByZWNlbmN5XG4gICAgdGhpc1tMRU5HVEgkMV0gPSAwOyAvLyBsZW5ndGggb2YgaXRlbXMgaW4gdGhlIGxpc3RcbiAgfVxuXG4gIGR1bXAgKCkge1xuICAgIHJldHVybiB0aGlzW0xSVV9MSVNUJDFdLm1hcChoaXQgPT5cbiAgICAgIGlzU3RhbGUkMSh0aGlzLCBoaXQpID8gZmFsc2UgOiB7XG4gICAgICAgIGs6IGhpdC5rZXksXG4gICAgICAgIHY6IGhpdC52YWx1ZSxcbiAgICAgICAgZTogaGl0Lm5vdyArIChoaXQubWF4QWdlIHx8IDApXG4gICAgICB9KS50b0FycmF5KCkuZmlsdGVyKGggPT4gaClcbiAgfVxuXG4gIGR1bXBMcnUgKCkge1xuICAgIHJldHVybiB0aGlzW0xSVV9MSVNUJDFdXG4gIH1cblxuICBzZXQgKGtleSwgdmFsdWUsIG1heEFnZSkge1xuICAgIG1heEFnZSA9IG1heEFnZSB8fCB0aGlzW01BWF9BR0UkMV07XG5cbiAgICBpZiAobWF4QWdlICYmIHR5cGVvZiBtYXhBZ2UgIT09ICdudW1iZXInKVxuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignbWF4QWdlIG11c3QgYmUgYSBudW1iZXInKVxuXG4gICAgY29uc3Qgbm93ID0gbWF4QWdlID8gRGF0ZS5ub3coKSA6IDA7XG4gICAgY29uc3QgbGVuID0gdGhpc1tMRU5HVEhfQ0FMQ1VMQVRPUiQxXSh2YWx1ZSwga2V5KTtcblxuICAgIGlmICh0aGlzW0NBQ0hFJDFdLmhhcyhrZXkpKSB7XG4gICAgICBpZiAobGVuID4gdGhpc1tNQVgkMV0pIHtcbiAgICAgICAgZGVsJDEodGhpcywgdGhpc1tDQUNIRSQxXS5nZXQoa2V5KSk7XG4gICAgICAgIHJldHVybiBmYWxzZVxuICAgICAgfVxuXG4gICAgICBjb25zdCBub2RlID0gdGhpc1tDQUNIRSQxXS5nZXQoa2V5KTtcbiAgICAgIGNvbnN0IGl0ZW0gPSBub2RlLnZhbHVlO1xuXG4gICAgICAvLyBkaXNwb3NlIG9mIHRoZSBvbGQgb25lIGJlZm9yZSBvdmVyd3JpdGluZ1xuICAgICAgLy8gc3BsaXQgb3V0IGludG8gMiBpZnMgZm9yIGJldHRlciBjb3ZlcmFnZSB0cmFja2luZ1xuICAgICAgaWYgKHRoaXNbRElTUE9TRSQxXSkge1xuICAgICAgICBpZiAoIXRoaXNbTk9fRElTUE9TRV9PTl9TRVQkMV0pXG4gICAgICAgICAgdGhpc1tESVNQT1NFJDFdKGtleSwgaXRlbS52YWx1ZSk7XG4gICAgICB9XG5cbiAgICAgIGl0ZW0ubm93ID0gbm93O1xuICAgICAgaXRlbS5tYXhBZ2UgPSBtYXhBZ2U7XG4gICAgICBpdGVtLnZhbHVlID0gdmFsdWU7XG4gICAgICB0aGlzW0xFTkdUSCQxXSArPSBsZW4gLSBpdGVtLmxlbmd0aDtcbiAgICAgIGl0ZW0ubGVuZ3RoID0gbGVuO1xuICAgICAgdGhpcy5nZXQoa2V5KTtcbiAgICAgIHRyaW0kMSh0aGlzKTtcbiAgICAgIHJldHVybiB0cnVlXG4gICAgfVxuXG4gICAgY29uc3QgaGl0ID0gbmV3IEVudHJ5JDEoa2V5LCB2YWx1ZSwgbGVuLCBub3csIG1heEFnZSk7XG5cbiAgICAvLyBvdmVyc2l6ZWQgb2JqZWN0cyBmYWxsIG91dCBvZiBjYWNoZSBhdXRvbWF0aWNhbGx5LlxuICAgIGlmIChoaXQubGVuZ3RoID4gdGhpc1tNQVgkMV0pIHtcbiAgICAgIGlmICh0aGlzW0RJU1BPU0UkMV0pXG4gICAgICAgIHRoaXNbRElTUE9TRSQxXShrZXksIHZhbHVlKTtcblxuICAgICAgcmV0dXJuIGZhbHNlXG4gICAgfVxuXG4gICAgdGhpc1tMRU5HVEgkMV0gKz0gaGl0Lmxlbmd0aDtcbiAgICB0aGlzW0xSVV9MSVNUJDFdLnVuc2hpZnQoaGl0KTtcbiAgICB0aGlzW0NBQ0hFJDFdLnNldChrZXksIHRoaXNbTFJVX0xJU1QkMV0uaGVhZCk7XG4gICAgdHJpbSQxKHRoaXMpO1xuICAgIHJldHVybiB0cnVlXG4gIH1cblxuICBoYXMgKGtleSkge1xuICAgIGlmICghdGhpc1tDQUNIRSQxXS5oYXMoa2V5KSkgcmV0dXJuIGZhbHNlXG4gICAgY29uc3QgaGl0ID0gdGhpc1tDQUNIRSQxXS5nZXQoa2V5KS52YWx1ZTtcbiAgICByZXR1cm4gIWlzU3RhbGUkMSh0aGlzLCBoaXQpXG4gIH1cblxuICBnZXQgKGtleSkge1xuICAgIHJldHVybiBnZXQkMSh0aGlzLCBrZXksIHRydWUpXG4gIH1cblxuICBwZWVrIChrZXkpIHtcbiAgICByZXR1cm4gZ2V0JDEodGhpcywga2V5LCBmYWxzZSlcbiAgfVxuXG4gIHBvcCAoKSB7XG4gICAgY29uc3Qgbm9kZSA9IHRoaXNbTFJVX0xJU1QkMV0udGFpbDtcbiAgICBpZiAoIW5vZGUpXG4gICAgICByZXR1cm4gbnVsbFxuXG4gICAgZGVsJDEodGhpcywgbm9kZSk7XG4gICAgcmV0dXJuIG5vZGUudmFsdWVcbiAgfVxuXG4gIGRlbCAoa2V5KSB7XG4gICAgZGVsJDEodGhpcywgdGhpc1tDQUNIRSQxXS5nZXQoa2V5KSk7XG4gIH1cblxuICBsb2FkIChhcnIpIHtcbiAgICAvLyByZXNldCB0aGUgY2FjaGVcbiAgICB0aGlzLnJlc2V0KCk7XG5cbiAgICBjb25zdCBub3cgPSBEYXRlLm5vdygpO1xuICAgIC8vIEEgcHJldmlvdXMgc2VyaWFsaXplZCBjYWNoZSBoYXMgdGhlIG1vc3QgcmVjZW50IGl0ZW1zIGZpcnN0XG4gICAgZm9yIChsZXQgbCA9IGFyci5sZW5ndGggLSAxOyBsID49IDA7IGwtLSkge1xuICAgICAgY29uc3QgaGl0ID0gYXJyW2xdO1xuICAgICAgY29uc3QgZXhwaXJlc0F0ID0gaGl0LmUgfHwgMDtcbiAgICAgIGlmIChleHBpcmVzQXQgPT09IDApXG4gICAgICAgIC8vIHRoZSBpdGVtIHdhcyBjcmVhdGVkIHdpdGhvdXQgZXhwaXJhdGlvbiBpbiBhIG5vbiBhZ2VkIGNhY2hlXG4gICAgICAgIHRoaXMuc2V0KGhpdC5rLCBoaXQudik7XG4gICAgICBlbHNlIHtcbiAgICAgICAgY29uc3QgbWF4QWdlID0gZXhwaXJlc0F0IC0gbm93O1xuICAgICAgICAvLyBkb250IGFkZCBhbHJlYWR5IGV4cGlyZWQgaXRlbXNcbiAgICAgICAgaWYgKG1heEFnZSA+IDApIHtcbiAgICAgICAgICB0aGlzLnNldChoaXQuaywgaGl0LnYsIG1heEFnZSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBwcnVuZSAoKSB7XG4gICAgdGhpc1tDQUNIRSQxXS5mb3JFYWNoKCh2YWx1ZSwga2V5KSA9PiBnZXQkMSh0aGlzLCBrZXksIGZhbHNlKSk7XG4gIH1cbn1cblxuY29uc3QgZ2V0JDEgPSAoc2VsZiwga2V5LCBkb1VzZSkgPT4ge1xuICBjb25zdCBub2RlID0gc2VsZltDQUNIRSQxXS5nZXQoa2V5KTtcbiAgaWYgKG5vZGUpIHtcbiAgICBjb25zdCBoaXQgPSBub2RlLnZhbHVlO1xuICAgIGlmIChpc1N0YWxlJDEoc2VsZiwgaGl0KSkge1xuICAgICAgZGVsJDEoc2VsZiwgbm9kZSk7XG4gICAgICBpZiAoIXNlbGZbQUxMT1dfU1RBTEUkMV0pXG4gICAgICAgIHJldHVybiB1bmRlZmluZWRcbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKGRvVXNlKSB7XG4gICAgICAgIGlmIChzZWxmW1VQREFURV9BR0VfT05fR0VUJDFdKVxuICAgICAgICAgIG5vZGUudmFsdWUubm93ID0gRGF0ZS5ub3coKTtcbiAgICAgICAgc2VsZltMUlVfTElTVCQxXS51bnNoaWZ0Tm9kZShub2RlKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGhpdC52YWx1ZVxuICB9XG59O1xuXG5jb25zdCBpc1N0YWxlJDEgPSAoc2VsZiwgaGl0KSA9PiB7XG4gIGlmICghaGl0IHx8ICghaGl0Lm1heEFnZSAmJiAhc2VsZltNQVhfQUdFJDFdKSlcbiAgICByZXR1cm4gZmFsc2VcblxuICBjb25zdCBkaWZmID0gRGF0ZS5ub3coKSAtIGhpdC5ub3c7XG4gIHJldHVybiBoaXQubWF4QWdlID8gZGlmZiA+IGhpdC5tYXhBZ2VcbiAgICA6IHNlbGZbTUFYX0FHRSQxXSAmJiAoZGlmZiA+IHNlbGZbTUFYX0FHRSQxXSlcbn07XG5cbmNvbnN0IHRyaW0kMSA9IHNlbGYgPT4ge1xuICBpZiAoc2VsZltMRU5HVEgkMV0gPiBzZWxmW01BWCQxXSkge1xuICAgIGZvciAobGV0IHdhbGtlciA9IHNlbGZbTFJVX0xJU1QkMV0udGFpbDtcbiAgICAgIHNlbGZbTEVOR1RIJDFdID4gc2VsZltNQVgkMV0gJiYgd2Fsa2VyICE9PSBudWxsOykge1xuICAgICAgLy8gV2Uga25vdyB0aGF0IHdlJ3JlIGFib3V0IHRvIGRlbGV0ZSB0aGlzIG9uZSwgYW5kIGFsc29cbiAgICAgIC8vIHdoYXQgdGhlIG5leHQgbGVhc3QgcmVjZW50bHkgdXNlZCBrZXkgd2lsbCBiZSwgc28ganVzdFxuICAgICAgLy8gZ28gYWhlYWQgYW5kIHNldCBpdCBub3cuXG4gICAgICBjb25zdCBwcmV2ID0gd2Fsa2VyLnByZXY7XG4gICAgICBkZWwkMShzZWxmLCB3YWxrZXIpO1xuICAgICAgd2Fsa2VyID0gcHJldjtcbiAgICB9XG4gIH1cbn07XG5cbmNvbnN0IGRlbCQxID0gKHNlbGYsIG5vZGUpID0+IHtcbiAgaWYgKG5vZGUpIHtcbiAgICBjb25zdCBoaXQgPSBub2RlLnZhbHVlO1xuICAgIGlmIChzZWxmW0RJU1BPU0UkMV0pXG4gICAgICBzZWxmW0RJU1BPU0UkMV0oaGl0LmtleSwgaGl0LnZhbHVlKTtcblxuICAgIHNlbGZbTEVOR1RIJDFdIC09IGhpdC5sZW5ndGg7XG4gICAgc2VsZltDQUNIRSQxXS5kZWxldGUoaGl0LmtleSk7XG4gICAgc2VsZltMUlVfTElTVCQxXS5yZW1vdmVOb2RlKG5vZGUpO1xuICB9XG59O1xuXG5jbGFzcyBFbnRyeSQxIHtcbiAgY29uc3RydWN0b3IgKGtleSwgdmFsdWUsIGxlbmd0aCwgbm93LCBtYXhBZ2UpIHtcbiAgICB0aGlzLmtleSA9IGtleTtcbiAgICB0aGlzLnZhbHVlID0gdmFsdWU7XG4gICAgdGhpcy5sZW5ndGggPSBsZW5ndGg7XG4gICAgdGhpcy5ub3cgPSBub3c7XG4gICAgdGhpcy5tYXhBZ2UgPSBtYXhBZ2UgfHwgMDtcbiAgfVxufVxuXG5jb25zdCBmb3JFYWNoU3RlcCQxID0gKHNlbGYsIGZuLCBub2RlLCB0aGlzcCkgPT4ge1xuICBsZXQgaGl0ID0gbm9kZS52YWx1ZTtcbiAgaWYgKGlzU3RhbGUkMShzZWxmLCBoaXQpKSB7XG4gICAgZGVsJDEoc2VsZiwgbm9kZSk7XG4gICAgaWYgKCFzZWxmW0FMTE9XX1NUQUxFJDFdKVxuICAgICAgaGl0ID0gdW5kZWZpbmVkO1xuICB9XG4gIGlmIChoaXQpXG4gICAgZm4uY2FsbCh0aGlzcCwgaGl0LnZhbHVlLCBoaXQua2V5LCBzZWxmKTtcbn07XG5cbnZhciBscnVDYWNoZSQxID0gTFJVQ2FjaGUkMTtcblxuLy8gaG9pc3RlZCBjbGFzcyBmb3IgY3ljbGljIGRlcGVuZGVuY3lcbmNsYXNzIFJhbmdlJGwge1xuICBjb25zdHJ1Y3RvciAocmFuZ2UsIG9wdGlvbnMpIHtcbiAgICBvcHRpb25zID0gcGFyc2VPcHRpb25zJDYob3B0aW9ucyk7XG5cbiAgICBpZiAocmFuZ2UgaW5zdGFuY2VvZiBSYW5nZSRsKSB7XG4gICAgICBpZiAoXG4gICAgICAgIHJhbmdlLmxvb3NlID09PSAhIW9wdGlvbnMubG9vc2UgJiZcbiAgICAgICAgcmFuZ2UuaW5jbHVkZVByZXJlbGVhc2UgPT09ICEhb3B0aW9ucy5pbmNsdWRlUHJlcmVsZWFzZVxuICAgICAgKSB7XG4gICAgICAgIHJldHVybiByYW5nZVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIG5ldyBSYW5nZSRsKHJhbmdlLnJhdywgb3B0aW9ucylcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAocmFuZ2UgaW5zdGFuY2VvZiBDb21wYXJhdG9yJDcpIHtcbiAgICAgIC8vIGp1c3QgcHV0IGl0IGluIHRoZSBzZXQgYW5kIHJldHVyblxuICAgICAgdGhpcy5yYXcgPSByYW5nZS52YWx1ZTtcbiAgICAgIHRoaXMuc2V0ID0gW1tyYW5nZV1dO1xuICAgICAgdGhpcy5mb3JtYXQoKTtcbiAgICAgIHJldHVybiB0aGlzXG4gICAgfVxuXG4gICAgdGhpcy5vcHRpb25zID0gb3B0aW9ucztcbiAgICB0aGlzLmxvb3NlID0gISFvcHRpb25zLmxvb3NlO1xuICAgIHRoaXMuaW5jbHVkZVByZXJlbGVhc2UgPSAhIW9wdGlvbnMuaW5jbHVkZVByZXJlbGVhc2U7XG5cbiAgICAvLyBGaXJzdCwgc3BsaXQgYmFzZWQgb24gYm9vbGVhbiBvciB8fFxuICAgIHRoaXMucmF3ID0gcmFuZ2U7XG4gICAgdGhpcy5zZXQgPSByYW5nZVxuICAgICAgLnNwbGl0KC9cXHMqXFx8XFx8XFxzKi8pXG4gICAgICAvLyBtYXAgdGhlIHJhbmdlIHRvIGEgMmQgYXJyYXkgb2YgY29tcGFyYXRvcnNcbiAgICAgIC5tYXAocmFuZ2UgPT4gdGhpcy5wYXJzZVJhbmdlKHJhbmdlLnRyaW0oKSkpXG4gICAgICAvLyB0aHJvdyBvdXQgYW55IGNvbXBhcmF0b3IgbGlzdHMgdGhhdCBhcmUgZW1wdHlcbiAgICAgIC8vIHRoaXMgZ2VuZXJhbGx5IG1lYW5zIHRoYXQgaXQgd2FzIG5vdCBhIHZhbGlkIHJhbmdlLCB3aGljaCBpcyBhbGxvd2VkXG4gICAgICAvLyBpbiBsb29zZSBtb2RlLCBidXQgd2lsbCBzdGlsbCB0aHJvdyBpZiB0aGUgV0hPTEUgcmFuZ2UgaXMgaW52YWxpZC5cbiAgICAgIC5maWx0ZXIoYyA9PiBjLmxlbmd0aCk7XG5cbiAgICBpZiAoIXRoaXMuc2V0Lmxlbmd0aCkge1xuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihgSW52YWxpZCBTZW1WZXIgUmFuZ2U6ICR7cmFuZ2V9YClcbiAgICB9XG5cbiAgICAvLyBpZiB3ZSBoYXZlIGFueSB0aGF0IGFyZSBub3QgdGhlIG51bGwgc2V0LCB0aHJvdyBvdXQgbnVsbCBzZXRzLlxuICAgIGlmICh0aGlzLnNldC5sZW5ndGggPiAxKSB7XG4gICAgICAvLyBrZWVwIHRoZSBmaXJzdCBvbmUsIGluIGNhc2UgdGhleSdyZSBhbGwgbnVsbCBzZXRzXG4gICAgICBjb25zdCBmaXJzdCA9IHRoaXMuc2V0WzBdO1xuICAgICAgdGhpcy5zZXQgPSB0aGlzLnNldC5maWx0ZXIoYyA9PiAhaXNOdWxsU2V0JDEoY1swXSkpO1xuICAgICAgaWYgKHRoaXMuc2V0Lmxlbmd0aCA9PT0gMClcbiAgICAgICAgdGhpcy5zZXQgPSBbZmlyc3RdO1xuICAgICAgZWxzZSBpZiAodGhpcy5zZXQubGVuZ3RoID4gMSkge1xuICAgICAgICAvLyBpZiB3ZSBoYXZlIGFueSB0aGF0IGFyZSAqLCB0aGVuIHRoZSByYW5nZSBpcyBqdXN0ICpcbiAgICAgICAgZm9yIChjb25zdCBjIG9mIHRoaXMuc2V0KSB7XG4gICAgICAgICAgaWYgKGMubGVuZ3RoID09PSAxICYmIGlzQW55JDEoY1swXSkpIHtcbiAgICAgICAgICAgIHRoaXMuc2V0ID0gW2NdO1xuICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzLmZvcm1hdCgpO1xuICB9XG5cbiAgZm9ybWF0ICgpIHtcbiAgICB0aGlzLnJhbmdlID0gdGhpcy5zZXRcbiAgICAgIC5tYXAoKGNvbXBzKSA9PiB7XG4gICAgICAgIHJldHVybiBjb21wcy5qb2luKCcgJykudHJpbSgpXG4gICAgICB9KVxuICAgICAgLmpvaW4oJ3x8JylcbiAgICAgIC50cmltKCk7XG4gICAgcmV0dXJuIHRoaXMucmFuZ2VcbiAgfVxuXG4gIHRvU3RyaW5nICgpIHtcbiAgICByZXR1cm4gdGhpcy5yYW5nZVxuICB9XG5cbiAgcGFyc2VSYW5nZSAocmFuZ2UpIHtcbiAgICByYW5nZSA9IHJhbmdlLnRyaW0oKTtcblxuICAgIC8vIG1lbW9pemUgcmFuZ2UgcGFyc2luZyBmb3IgcGVyZm9ybWFuY2UuXG4gICAgLy8gdGhpcyBpcyBhIHZlcnkgaG90IHBhdGgsIGFuZCBmdWxseSBkZXRlcm1pbmlzdGljLlxuICAgIGNvbnN0IG1lbW9PcHRzID0gT2JqZWN0LmtleXModGhpcy5vcHRpb25zKS5qb2luKCcsJyk7XG4gICAgY29uc3QgbWVtb0tleSA9IGBwYXJzZVJhbmdlOiR7bWVtb09wdHN9OiR7cmFuZ2V9YDtcbiAgICBjb25zdCBjYWNoZWQgPSBjYWNoZSQxLmdldChtZW1vS2V5KTtcbiAgICBpZiAoY2FjaGVkKVxuICAgICAgcmV0dXJuIGNhY2hlZFxuXG4gICAgY29uc3QgbG9vc2UgPSB0aGlzLm9wdGlvbnMubG9vc2U7XG4gICAgLy8gYDEuMi4zIC0gMS4yLjRgID0+IGA+PTEuMi4zIDw9MS4yLjRgXG4gICAgY29uc3QgaHIgPSBsb29zZSA/IHJlJDdbdCQ2LkhZUEhFTlJBTkdFTE9PU0VdIDogcmUkN1t0JDYuSFlQSEVOUkFOR0VdO1xuICAgIHJhbmdlID0gcmFuZ2UucmVwbGFjZShociwgaHlwaGVuUmVwbGFjZSQxKHRoaXMub3B0aW9ucy5pbmNsdWRlUHJlcmVsZWFzZSkpO1xuICAgIGRlYnVnJDUoJ2h5cGhlbiByZXBsYWNlJywgcmFuZ2UpO1xuICAgIC8vIGA+IDEuMi4zIDwgMS4yLjVgID0+IGA+MS4yLjMgPDEuMi41YFxuICAgIHJhbmdlID0gcmFuZ2UucmVwbGFjZShyZSQ3W3QkNi5DT01QQVJBVE9SVFJJTV0sIGNvbXBhcmF0b3JUcmltUmVwbGFjZSQxKTtcbiAgICBkZWJ1ZyQ1KCdjb21wYXJhdG9yIHRyaW0nLCByYW5nZSwgcmUkN1t0JDYuQ09NUEFSQVRPUlRSSU1dKTtcblxuICAgIC8vIGB+IDEuMi4zYCA9PiBgfjEuMi4zYFxuICAgIHJhbmdlID0gcmFuZ2UucmVwbGFjZShyZSQ3W3QkNi5USUxERVRSSU1dLCB0aWxkZVRyaW1SZXBsYWNlJDEpO1xuXG4gICAgLy8gYF4gMS4yLjNgID0+IGBeMS4yLjNgXG4gICAgcmFuZ2UgPSByYW5nZS5yZXBsYWNlKHJlJDdbdCQ2LkNBUkVUVFJJTV0sIGNhcmV0VHJpbVJlcGxhY2UkMSk7XG5cbiAgICAvLyBub3JtYWxpemUgc3BhY2VzXG4gICAgcmFuZ2UgPSByYW5nZS5zcGxpdCgvXFxzKy8pLmpvaW4oJyAnKTtcblxuICAgIC8vIEF0IHRoaXMgcG9pbnQsIHRoZSByYW5nZSBpcyBjb21wbGV0ZWx5IHRyaW1tZWQgYW5kXG4gICAgLy8gcmVhZHkgdG8gYmUgc3BsaXQgaW50byBjb21wYXJhdG9ycy5cblxuICAgIGNvbnN0IGNvbXBSZSA9IGxvb3NlID8gcmUkN1t0JDYuQ09NUEFSQVRPUkxPT1NFXSA6IHJlJDdbdCQ2LkNPTVBBUkFUT1JdO1xuICAgIGNvbnN0IHJhbmdlTGlzdCA9IHJhbmdlXG4gICAgICAuc3BsaXQoJyAnKVxuICAgICAgLm1hcChjb21wID0+IHBhcnNlQ29tcGFyYXRvciQxKGNvbXAsIHRoaXMub3B0aW9ucykpXG4gICAgICAuam9pbignICcpXG4gICAgICAuc3BsaXQoL1xccysvKVxuICAgICAgLy8gPj0wLjAuMCBpcyBlcXVpdmFsZW50IHRvICpcbiAgICAgIC5tYXAoY29tcCA9PiByZXBsYWNlR1RFMCQxKGNvbXAsIHRoaXMub3B0aW9ucykpXG4gICAgICAvLyBpbiBsb29zZSBtb2RlLCB0aHJvdyBvdXQgYW55IHRoYXQgYXJlIG5vdCB2YWxpZCBjb21wYXJhdG9yc1xuICAgICAgLmZpbHRlcih0aGlzLm9wdGlvbnMubG9vc2UgPyBjb21wID0+ICEhY29tcC5tYXRjaChjb21wUmUpIDogKCkgPT4gdHJ1ZSlcbiAgICAgIC5tYXAoY29tcCA9PiBuZXcgQ29tcGFyYXRvciQ3KGNvbXAsIHRoaXMub3B0aW9ucykpO1xuXG4gICAgLy8gaWYgYW55IGNvbXBhcmF0b3JzIGFyZSB0aGUgbnVsbCBzZXQsIHRoZW4gcmVwbGFjZSB3aXRoIEpVU1QgbnVsbCBzZXRcbiAgICAvLyBpZiBtb3JlIHRoYW4gb25lIGNvbXBhcmF0b3IsIHJlbW92ZSBhbnkgKiBjb21wYXJhdG9yc1xuICAgIC8vIGFsc28sIGRvbid0IGluY2x1ZGUgdGhlIHNhbWUgY29tcGFyYXRvciBtb3JlIHRoYW4gb25jZVxuICAgIHJhbmdlTGlzdC5sZW5ndGg7XG4gICAgY29uc3QgcmFuZ2VNYXAgPSBuZXcgTWFwKCk7XG4gICAgZm9yIChjb25zdCBjb21wIG9mIHJhbmdlTGlzdCkge1xuICAgICAgaWYgKGlzTnVsbFNldCQxKGNvbXApKVxuICAgICAgICByZXR1cm4gW2NvbXBdXG4gICAgICByYW5nZU1hcC5zZXQoY29tcC52YWx1ZSwgY29tcCk7XG4gICAgfVxuICAgIGlmIChyYW5nZU1hcC5zaXplID4gMSAmJiByYW5nZU1hcC5oYXMoJycpKVxuICAgICAgcmFuZ2VNYXAuZGVsZXRlKCcnKTtcblxuICAgIGNvbnN0IHJlc3VsdCA9IFsuLi5yYW5nZU1hcC52YWx1ZXMoKV07XG4gICAgY2FjaGUkMS5zZXQobWVtb0tleSwgcmVzdWx0KTtcbiAgICByZXR1cm4gcmVzdWx0XG4gIH1cblxuICBpbnRlcnNlY3RzIChyYW5nZSwgb3B0aW9ucykge1xuICAgIGlmICghKHJhbmdlIGluc3RhbmNlb2YgUmFuZ2UkbCkpIHtcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ2EgUmFuZ2UgaXMgcmVxdWlyZWQnKVxuICAgIH1cblxuICAgIHJldHVybiB0aGlzLnNldC5zb21lKCh0aGlzQ29tcGFyYXRvcnMpID0+IHtcbiAgICAgIHJldHVybiAoXG4gICAgICAgIGlzU2F0aXNmaWFibGUkMSh0aGlzQ29tcGFyYXRvcnMsIG9wdGlvbnMpICYmXG4gICAgICAgIHJhbmdlLnNldC5zb21lKChyYW5nZUNvbXBhcmF0b3JzKSA9PiB7XG4gICAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIGlzU2F0aXNmaWFibGUkMShyYW5nZUNvbXBhcmF0b3JzLCBvcHRpb25zKSAmJlxuICAgICAgICAgICAgdGhpc0NvbXBhcmF0b3JzLmV2ZXJ5KCh0aGlzQ29tcGFyYXRvcikgPT4ge1xuICAgICAgICAgICAgICByZXR1cm4gcmFuZ2VDb21wYXJhdG9ycy5ldmVyeSgocmFuZ2VDb21wYXJhdG9yKSA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXNDb21wYXJhdG9yLmludGVyc2VjdHMocmFuZ2VDb21wYXJhdG9yLCBvcHRpb25zKVxuICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgfSlcbiAgICAgICAgICApXG4gICAgICAgIH0pXG4gICAgICApXG4gICAgfSlcbiAgfVxuXG4gIC8vIGlmIEFOWSBvZiB0aGUgc2V0cyBtYXRjaCBBTEwgb2YgaXRzIGNvbXBhcmF0b3JzLCB0aGVuIHBhc3NcbiAgdGVzdCAodmVyc2lvbikge1xuICAgIGlmICghdmVyc2lvbikge1xuICAgICAgcmV0dXJuIGZhbHNlXG4gICAgfVxuXG4gICAgaWYgKHR5cGVvZiB2ZXJzaW9uID09PSAnc3RyaW5nJykge1xuICAgICAgdHJ5IHtcbiAgICAgICAgdmVyc2lvbiA9IG5ldyBTZW1WZXIkayh2ZXJzaW9uLCB0aGlzLm9wdGlvbnMpO1xuICAgICAgfSBjYXRjaCAoZXIpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlXG4gICAgICB9XG4gICAgfVxuXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLnNldC5sZW5ndGg7IGkrKykge1xuICAgICAgaWYgKHRlc3RTZXQkMSh0aGlzLnNldFtpXSwgdmVyc2lvbiwgdGhpcy5vcHRpb25zKSkge1xuICAgICAgICByZXR1cm4gdHJ1ZVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gZmFsc2VcbiAgfVxufVxudmFyIHJhbmdlJDEgPSBSYW5nZSRsO1xuXG5jb25zdCBMUlUkMSA9IGxydUNhY2hlJDE7XG5jb25zdCBjYWNoZSQxID0gbmV3IExSVSQxKHsgbWF4OiAxMDAwIH0pO1xuXG5jb25zdCBwYXJzZU9wdGlvbnMkNiA9IHBhcnNlT3B0aW9uc18xJDE7XG5jb25zdCBDb21wYXJhdG9yJDcgPSBjb21wYXJhdG9yJDE7XG5jb25zdCBkZWJ1ZyQ1ID0gZGVidWdfMSQxO1xuY29uc3QgU2VtVmVyJGsgPSBzZW12ZXIkNTtcbmNvbnN0IHtcbiAgcmU6IHJlJDcsXG4gIHQ6IHQkNixcbiAgY29tcGFyYXRvclRyaW1SZXBsYWNlOiBjb21wYXJhdG9yVHJpbVJlcGxhY2UkMSxcbiAgdGlsZGVUcmltUmVwbGFjZTogdGlsZGVUcmltUmVwbGFjZSQxLFxuICBjYXJldFRyaW1SZXBsYWNlOiBjYXJldFRyaW1SZXBsYWNlJDFcbn0gPSByZSRiLmV4cG9ydHM7XG5cbmNvbnN0IGlzTnVsbFNldCQxID0gYyA9PiBjLnZhbHVlID09PSAnPDAuMC4wLTAnO1xuY29uc3QgaXNBbnkkMSA9IGMgPT4gYy52YWx1ZSA9PT0gJyc7XG5cbi8vIHRha2UgYSBzZXQgb2YgY29tcGFyYXRvcnMgYW5kIGRldGVybWluZSB3aGV0aGVyIHRoZXJlXG4vLyBleGlzdHMgYSB2ZXJzaW9uIHdoaWNoIGNhbiBzYXRpc2Z5IGl0XG5jb25zdCBpc1NhdGlzZmlhYmxlJDEgPSAoY29tcGFyYXRvcnMsIG9wdGlvbnMpID0+IHtcbiAgbGV0IHJlc3VsdCA9IHRydWU7XG4gIGNvbnN0IHJlbWFpbmluZ0NvbXBhcmF0b3JzID0gY29tcGFyYXRvcnMuc2xpY2UoKTtcbiAgbGV0IHRlc3RDb21wYXJhdG9yID0gcmVtYWluaW5nQ29tcGFyYXRvcnMucG9wKCk7XG5cbiAgd2hpbGUgKHJlc3VsdCAmJiByZW1haW5pbmdDb21wYXJhdG9ycy5sZW5ndGgpIHtcbiAgICByZXN1bHQgPSByZW1haW5pbmdDb21wYXJhdG9ycy5ldmVyeSgob3RoZXJDb21wYXJhdG9yKSA9PiB7XG4gICAgICByZXR1cm4gdGVzdENvbXBhcmF0b3IuaW50ZXJzZWN0cyhvdGhlckNvbXBhcmF0b3IsIG9wdGlvbnMpXG4gICAgfSk7XG5cbiAgICB0ZXN0Q29tcGFyYXRvciA9IHJlbWFpbmluZ0NvbXBhcmF0b3JzLnBvcCgpO1xuICB9XG5cbiAgcmV0dXJuIHJlc3VsdFxufTtcblxuLy8gY29tcHJpc2VkIG9mIHhyYW5nZXMsIHRpbGRlcywgc3RhcnMsIGFuZCBndGx0J3MgYXQgdGhpcyBwb2ludC5cbi8vIGFscmVhZHkgcmVwbGFjZWQgdGhlIGh5cGhlbiByYW5nZXNcbi8vIHR1cm4gaW50byBhIHNldCBvZiBKVVNUIGNvbXBhcmF0b3JzLlxuY29uc3QgcGFyc2VDb21wYXJhdG9yJDEgPSAoY29tcCwgb3B0aW9ucykgPT4ge1xuICBkZWJ1ZyQ1KCdjb21wJywgY29tcCwgb3B0aW9ucyk7XG4gIGNvbXAgPSByZXBsYWNlQ2FyZXRzJDEoY29tcCwgb3B0aW9ucyk7XG4gIGRlYnVnJDUoJ2NhcmV0JywgY29tcCk7XG4gIGNvbXAgPSByZXBsYWNlVGlsZGVzJDEoY29tcCwgb3B0aW9ucyk7XG4gIGRlYnVnJDUoJ3RpbGRlcycsIGNvbXApO1xuICBjb21wID0gcmVwbGFjZVhSYW5nZXMkMShjb21wLCBvcHRpb25zKTtcbiAgZGVidWckNSgneHJhbmdlJywgY29tcCk7XG4gIGNvbXAgPSByZXBsYWNlU3RhcnMkMShjb21wLCBvcHRpb25zKTtcbiAgZGVidWckNSgnc3RhcnMnLCBjb21wKTtcbiAgcmV0dXJuIGNvbXBcbn07XG5cbmNvbnN0IGlzWCQxID0gaWQgPT4gIWlkIHx8IGlkLnRvTG93ZXJDYXNlKCkgPT09ICd4JyB8fCBpZCA9PT0gJyonO1xuXG4vLyB+LCB+PiAtLT4gKiAoYW55LCBraW5kYSBzaWxseSlcbi8vIH4yLCB+Mi54LCB+Mi54LngsIH4+Miwgfj4yLnggfj4yLngueCAtLT4gPj0yLjAuMCA8My4wLjAtMFxuLy8gfjIuMCwgfjIuMC54LCB+PjIuMCwgfj4yLjAueCAtLT4gPj0yLjAuMCA8Mi4xLjAtMFxuLy8gfjEuMiwgfjEuMi54LCB+PjEuMiwgfj4xLjIueCAtLT4gPj0xLjIuMCA8MS4zLjAtMFxuLy8gfjEuMi4zLCB+PjEuMi4zIC0tPiA+PTEuMi4zIDwxLjMuMC0wXG4vLyB+MS4yLjAsIH4+MS4yLjAgLS0+ID49MS4yLjAgPDEuMy4wLTBcbmNvbnN0IHJlcGxhY2VUaWxkZXMkMSA9IChjb21wLCBvcHRpb25zKSA9PlxuICBjb21wLnRyaW0oKS5zcGxpdCgvXFxzKy8pLm1hcCgoY29tcCkgPT4ge1xuICAgIHJldHVybiByZXBsYWNlVGlsZGUkMShjb21wLCBvcHRpb25zKVxuICB9KS5qb2luKCcgJyk7XG5cbmNvbnN0IHJlcGxhY2VUaWxkZSQxID0gKGNvbXAsIG9wdGlvbnMpID0+IHtcbiAgY29uc3QgciA9IG9wdGlvbnMubG9vc2UgPyByZSQ3W3QkNi5USUxERUxPT1NFXSA6IHJlJDdbdCQ2LlRJTERFXTtcbiAgcmV0dXJuIGNvbXAucmVwbGFjZShyLCAoXywgTSwgbSwgcCwgcHIpID0+IHtcbiAgICBkZWJ1ZyQ1KCd0aWxkZScsIGNvbXAsIF8sIE0sIG0sIHAsIHByKTtcbiAgICBsZXQgcmV0O1xuXG4gICAgaWYgKGlzWCQxKE0pKSB7XG4gICAgICByZXQgPSAnJztcbiAgICB9IGVsc2UgaWYgKGlzWCQxKG0pKSB7XG4gICAgICByZXQgPSBgPj0ke019LjAuMCA8JHsrTSArIDF9LjAuMC0wYDtcbiAgICB9IGVsc2UgaWYgKGlzWCQxKHApKSB7XG4gICAgICAvLyB+MS4yID09ID49MS4yLjAgPDEuMy4wLTBcbiAgICAgIHJldCA9IGA+PSR7TX0uJHttfS4wIDwke019LiR7K20gKyAxfS4wLTBgO1xuICAgIH0gZWxzZSBpZiAocHIpIHtcbiAgICAgIGRlYnVnJDUoJ3JlcGxhY2VUaWxkZSBwcicsIHByKTtcbiAgICAgIHJldCA9IGA+PSR7TX0uJHttfS4ke3B9LSR7cHJcbiAgICAgIH0gPCR7TX0uJHsrbSArIDF9LjAtMGA7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIH4xLjIuMyA9PSA+PTEuMi4zIDwxLjMuMC0wXG4gICAgICByZXQgPSBgPj0ke019LiR7bX0uJHtwXG4gICAgICB9IDwke019LiR7K20gKyAxfS4wLTBgO1xuICAgIH1cblxuICAgIGRlYnVnJDUoJ3RpbGRlIHJldHVybicsIHJldCk7XG4gICAgcmV0dXJuIHJldFxuICB9KVxufTtcblxuLy8gXiAtLT4gKiAoYW55LCBraW5kYSBzaWxseSlcbi8vIF4yLCBeMi54LCBeMi54LnggLS0+ID49Mi4wLjAgPDMuMC4wLTBcbi8vIF4yLjAsIF4yLjAueCAtLT4gPj0yLjAuMCA8My4wLjAtMFxuLy8gXjEuMiwgXjEuMi54IC0tPiA+PTEuMi4wIDwyLjAuMC0wXG4vLyBeMS4yLjMgLS0+ID49MS4yLjMgPDIuMC4wLTBcbi8vIF4xLjIuMCAtLT4gPj0xLjIuMCA8Mi4wLjAtMFxuY29uc3QgcmVwbGFjZUNhcmV0cyQxID0gKGNvbXAsIG9wdGlvbnMpID0+XG4gIGNvbXAudHJpbSgpLnNwbGl0KC9cXHMrLykubWFwKChjb21wKSA9PiB7XG4gICAgcmV0dXJuIHJlcGxhY2VDYXJldCQxKGNvbXAsIG9wdGlvbnMpXG4gIH0pLmpvaW4oJyAnKTtcblxuY29uc3QgcmVwbGFjZUNhcmV0JDEgPSAoY29tcCwgb3B0aW9ucykgPT4ge1xuICBkZWJ1ZyQ1KCdjYXJldCcsIGNvbXAsIG9wdGlvbnMpO1xuICBjb25zdCByID0gb3B0aW9ucy5sb29zZSA/IHJlJDdbdCQ2LkNBUkVUTE9PU0VdIDogcmUkN1t0JDYuQ0FSRVRdO1xuICBjb25zdCB6ID0gb3B0aW9ucy5pbmNsdWRlUHJlcmVsZWFzZSA/ICctMCcgOiAnJztcbiAgcmV0dXJuIGNvbXAucmVwbGFjZShyLCAoXywgTSwgbSwgcCwgcHIpID0+IHtcbiAgICBkZWJ1ZyQ1KCdjYXJldCcsIGNvbXAsIF8sIE0sIG0sIHAsIHByKTtcbiAgICBsZXQgcmV0O1xuXG4gICAgaWYgKGlzWCQxKE0pKSB7XG4gICAgICByZXQgPSAnJztcbiAgICB9IGVsc2UgaWYgKGlzWCQxKG0pKSB7XG4gICAgICByZXQgPSBgPj0ke019LjAuMCR7en0gPCR7K00gKyAxfS4wLjAtMGA7XG4gICAgfSBlbHNlIGlmIChpc1gkMShwKSkge1xuICAgICAgaWYgKE0gPT09ICcwJykge1xuICAgICAgICByZXQgPSBgPj0ke019LiR7bX0uMCR7en0gPCR7TX0uJHsrbSArIDF9LjAtMGA7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXQgPSBgPj0ke019LiR7bX0uMCR7en0gPCR7K00gKyAxfS4wLjAtMGA7XG4gICAgICB9XG4gICAgfSBlbHNlIGlmIChwcikge1xuICAgICAgZGVidWckNSgncmVwbGFjZUNhcmV0IHByJywgcHIpO1xuICAgICAgaWYgKE0gPT09ICcwJykge1xuICAgICAgICBpZiAobSA9PT0gJzAnKSB7XG4gICAgICAgICAgcmV0ID0gYD49JHtNfS4ke219LiR7cH0tJHtwclxuICAgICAgICAgIH0gPCR7TX0uJHttfS4keytwICsgMX0tMGA7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0ID0gYD49JHtNfS4ke219LiR7cH0tJHtwclxuICAgICAgICAgIH0gPCR7TX0uJHsrbSArIDF9LjAtMGA7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldCA9IGA+PSR7TX0uJHttfS4ke3B9LSR7cHJcbiAgICAgICAgfSA8JHsrTSArIDF9LjAuMC0wYDtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgZGVidWckNSgnbm8gcHInKTtcbiAgICAgIGlmIChNID09PSAnMCcpIHtcbiAgICAgICAgaWYgKG0gPT09ICcwJykge1xuICAgICAgICAgIHJldCA9IGA+PSR7TX0uJHttfS4ke3BcbiAgICAgICAgICB9JHt6fSA8JHtNfS4ke219LiR7K3AgKyAxfS0wYDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXQgPSBgPj0ke019LiR7bX0uJHtwXG4gICAgICAgICAgfSR7en0gPCR7TX0uJHsrbSArIDF9LjAtMGA7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldCA9IGA+PSR7TX0uJHttfS4ke3BcbiAgICAgICAgfSA8JHsrTSArIDF9LjAuMC0wYDtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBkZWJ1ZyQ1KCdjYXJldCByZXR1cm4nLCByZXQpO1xuICAgIHJldHVybiByZXRcbiAgfSlcbn07XG5cbmNvbnN0IHJlcGxhY2VYUmFuZ2VzJDEgPSAoY29tcCwgb3B0aW9ucykgPT4ge1xuICBkZWJ1ZyQ1KCdyZXBsYWNlWFJhbmdlcycsIGNvbXAsIG9wdGlvbnMpO1xuICByZXR1cm4gY29tcC5zcGxpdCgvXFxzKy8pLm1hcCgoY29tcCkgPT4ge1xuICAgIHJldHVybiByZXBsYWNlWFJhbmdlJDEoY29tcCwgb3B0aW9ucylcbiAgfSkuam9pbignICcpXG59O1xuXG5jb25zdCByZXBsYWNlWFJhbmdlJDEgPSAoY29tcCwgb3B0aW9ucykgPT4ge1xuICBjb21wID0gY29tcC50cmltKCk7XG4gIGNvbnN0IHIgPSBvcHRpb25zLmxvb3NlID8gcmUkN1t0JDYuWFJBTkdFTE9PU0VdIDogcmUkN1t0JDYuWFJBTkdFXTtcbiAgcmV0dXJuIGNvbXAucmVwbGFjZShyLCAocmV0LCBndGx0LCBNLCBtLCBwLCBwcikgPT4ge1xuICAgIGRlYnVnJDUoJ3hSYW5nZScsIGNvbXAsIHJldCwgZ3RsdCwgTSwgbSwgcCwgcHIpO1xuICAgIGNvbnN0IHhNID0gaXNYJDEoTSk7XG4gICAgY29uc3QgeG0gPSB4TSB8fCBpc1gkMShtKTtcbiAgICBjb25zdCB4cCA9IHhtIHx8IGlzWCQxKHApO1xuICAgIGNvbnN0IGFueVggPSB4cDtcblxuICAgIGlmIChndGx0ID09PSAnPScgJiYgYW55WCkge1xuICAgICAgZ3RsdCA9ICcnO1xuICAgIH1cblxuICAgIC8vIGlmIHdlJ3JlIGluY2x1ZGluZyBwcmVyZWxlYXNlcyBpbiB0aGUgbWF0Y2gsIHRoZW4gd2UgbmVlZFxuICAgIC8vIHRvIGZpeCB0aGlzIHRvIC0wLCB0aGUgbG93ZXN0IHBvc3NpYmxlIHByZXJlbGVhc2UgdmFsdWVcbiAgICBwciA9IG9wdGlvbnMuaW5jbHVkZVByZXJlbGVhc2UgPyAnLTAnIDogJyc7XG5cbiAgICBpZiAoeE0pIHtcbiAgICAgIGlmIChndGx0ID09PSAnPicgfHwgZ3RsdCA9PT0gJzwnKSB7XG4gICAgICAgIC8vIG5vdGhpbmcgaXMgYWxsb3dlZFxuICAgICAgICByZXQgPSAnPDAuMC4wLTAnO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gbm90aGluZyBpcyBmb3JiaWRkZW5cbiAgICAgICAgcmV0ID0gJyonO1xuICAgICAgfVxuICAgIH0gZWxzZSBpZiAoZ3RsdCAmJiBhbnlYKSB7XG4gICAgICAvLyB3ZSBrbm93IHBhdGNoIGlzIGFuIHgsIGJlY2F1c2Ugd2UgaGF2ZSBhbnkgeCBhdCBhbGwuXG4gICAgICAvLyByZXBsYWNlIFggd2l0aCAwXG4gICAgICBpZiAoeG0pIHtcbiAgICAgICAgbSA9IDA7XG4gICAgICB9XG4gICAgICBwID0gMDtcblxuICAgICAgaWYgKGd0bHQgPT09ICc+Jykge1xuICAgICAgICAvLyA+MSA9PiA+PTIuMC4wXG4gICAgICAgIC8vID4xLjIgPT4gPj0xLjMuMFxuICAgICAgICBndGx0ID0gJz49JztcbiAgICAgICAgaWYgKHhtKSB7XG4gICAgICAgICAgTSA9ICtNICsgMTtcbiAgICAgICAgICBtID0gMDtcbiAgICAgICAgICBwID0gMDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBtID0gK20gKyAxO1xuICAgICAgICAgIHAgPSAwO1xuICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYgKGd0bHQgPT09ICc8PScpIHtcbiAgICAgICAgLy8gPD0wLjcueCBpcyBhY3R1YWxseSA8MC44LjAsIHNpbmNlIGFueSAwLjcueCBzaG91bGRcbiAgICAgICAgLy8gcGFzcy4gIFNpbWlsYXJseSwgPD03LnggaXMgYWN0dWFsbHkgPDguMC4wLCBldGMuXG4gICAgICAgIGd0bHQgPSAnPCc7XG4gICAgICAgIGlmICh4bSkge1xuICAgICAgICAgIE0gPSArTSArIDE7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgbSA9ICttICsgMTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZiAoZ3RsdCA9PT0gJzwnKVxuICAgICAgICBwciA9ICctMCc7XG5cbiAgICAgIHJldCA9IGAke2d0bHQgKyBNfS4ke219LiR7cH0ke3ByfWA7XG4gICAgfSBlbHNlIGlmICh4bSkge1xuICAgICAgcmV0ID0gYD49JHtNfS4wLjAke3ByfSA8JHsrTSArIDF9LjAuMC0wYDtcbiAgICB9IGVsc2UgaWYgKHhwKSB7XG4gICAgICByZXQgPSBgPj0ke019LiR7bX0uMCR7cHJcbiAgICAgIH0gPCR7TX0uJHsrbSArIDF9LjAtMGA7XG4gICAgfVxuXG4gICAgZGVidWckNSgneFJhbmdlIHJldHVybicsIHJldCk7XG5cbiAgICByZXR1cm4gcmV0XG4gIH0pXG59O1xuXG4vLyBCZWNhdXNlICogaXMgQU5ELWVkIHdpdGggZXZlcnl0aGluZyBlbHNlIGluIHRoZSBjb21wYXJhdG9yLFxuLy8gYW5kICcnIG1lYW5zIFwiYW55IHZlcnNpb25cIiwganVzdCByZW1vdmUgdGhlICpzIGVudGlyZWx5LlxuY29uc3QgcmVwbGFjZVN0YXJzJDEgPSAoY29tcCwgb3B0aW9ucykgPT4ge1xuICBkZWJ1ZyQ1KCdyZXBsYWNlU3RhcnMnLCBjb21wLCBvcHRpb25zKTtcbiAgLy8gTG9vc2VuZXNzIGlzIGlnbm9yZWQgaGVyZS4gIHN0YXIgaXMgYWx3YXlzIGFzIGxvb3NlIGFzIGl0IGdldHMhXG4gIHJldHVybiBjb21wLnRyaW0oKS5yZXBsYWNlKHJlJDdbdCQ2LlNUQVJdLCAnJylcbn07XG5cbmNvbnN0IHJlcGxhY2VHVEUwJDEgPSAoY29tcCwgb3B0aW9ucykgPT4ge1xuICBkZWJ1ZyQ1KCdyZXBsYWNlR1RFMCcsIGNvbXAsIG9wdGlvbnMpO1xuICByZXR1cm4gY29tcC50cmltKClcbiAgICAucmVwbGFjZShyZSQ3W29wdGlvbnMuaW5jbHVkZVByZXJlbGVhc2UgPyB0JDYuR1RFMFBSRSA6IHQkNi5HVEUwXSwgJycpXG59O1xuXG4vLyBUaGlzIGZ1bmN0aW9uIGlzIHBhc3NlZCB0byBzdHJpbmcucmVwbGFjZShyZVt0LkhZUEhFTlJBTkdFXSlcbi8vIE0sIG0sIHBhdGNoLCBwcmVyZWxlYXNlLCBidWlsZFxuLy8gMS4yIC0gMy40LjUgPT4gPj0xLjIuMCA8PTMuNC41XG4vLyAxLjIuMyAtIDMuNCA9PiA+PTEuMi4wIDwzLjUuMC0wIEFueSAzLjQueCB3aWxsIGRvXG4vLyAxLjIgLSAzLjQgPT4gPj0xLjIuMCA8My41LjAtMFxuY29uc3QgaHlwaGVuUmVwbGFjZSQxID0gaW5jUHIgPT4gKCQwLFxuICBmcm9tLCBmTSwgZm0sIGZwLCBmcHIsIGZiLFxuICB0bywgdE0sIHRtLCB0cCwgdHByLCB0YikgPT4ge1xuICBpZiAoaXNYJDEoZk0pKSB7XG4gICAgZnJvbSA9ICcnO1xuICB9IGVsc2UgaWYgKGlzWCQxKGZtKSkge1xuICAgIGZyb20gPSBgPj0ke2ZNfS4wLjAke2luY1ByID8gJy0wJyA6ICcnfWA7XG4gIH0gZWxzZSBpZiAoaXNYJDEoZnApKSB7XG4gICAgZnJvbSA9IGA+PSR7Zk19LiR7Zm19LjAke2luY1ByID8gJy0wJyA6ICcnfWA7XG4gIH0gZWxzZSBpZiAoZnByKSB7XG4gICAgZnJvbSA9IGA+PSR7ZnJvbX1gO1xuICB9IGVsc2Uge1xuICAgIGZyb20gPSBgPj0ke2Zyb219JHtpbmNQciA/ICctMCcgOiAnJ31gO1xuICB9XG5cbiAgaWYgKGlzWCQxKHRNKSkge1xuICAgIHRvID0gJyc7XG4gIH0gZWxzZSBpZiAoaXNYJDEodG0pKSB7XG4gICAgdG8gPSBgPCR7K3RNICsgMX0uMC4wLTBgO1xuICB9IGVsc2UgaWYgKGlzWCQxKHRwKSkge1xuICAgIHRvID0gYDwke3RNfS4keyt0bSArIDF9LjAtMGA7XG4gIH0gZWxzZSBpZiAodHByKSB7XG4gICAgdG8gPSBgPD0ke3RNfS4ke3RtfS4ke3RwfS0ke3Rwcn1gO1xuICB9IGVsc2UgaWYgKGluY1ByKSB7XG4gICAgdG8gPSBgPCR7dE19LiR7dG19LiR7K3RwICsgMX0tMGA7XG4gIH0gZWxzZSB7XG4gICAgdG8gPSBgPD0ke3RvfWA7XG4gIH1cblxuICByZXR1cm4gKGAke2Zyb219ICR7dG99YCkudHJpbSgpXG59O1xuXG5jb25zdCB0ZXN0U2V0JDEgPSAoc2V0LCB2ZXJzaW9uLCBvcHRpb25zKSA9PiB7XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgc2V0Lmxlbmd0aDsgaSsrKSB7XG4gICAgaWYgKCFzZXRbaV0udGVzdCh2ZXJzaW9uKSkge1xuICAgICAgcmV0dXJuIGZhbHNlXG4gICAgfVxuICB9XG5cbiAgaWYgKHZlcnNpb24ucHJlcmVsZWFzZS5sZW5ndGggJiYgIW9wdGlvbnMuaW5jbHVkZVByZXJlbGVhc2UpIHtcbiAgICAvLyBGaW5kIHRoZSBzZXQgb2YgdmVyc2lvbnMgdGhhdCBhcmUgYWxsb3dlZCB0byBoYXZlIHByZXJlbGVhc2VzXG4gICAgLy8gRm9yIGV4YW1wbGUsIF4xLjIuMy1wci4xIGRlc3VnYXJzIHRvID49MS4yLjMtcHIuMSA8Mi4wLjBcbiAgICAvLyBUaGF0IHNob3VsZCBhbGxvdyBgMS4yLjMtcHIuMmAgdG8gcGFzcy5cbiAgICAvLyBIb3dldmVyLCBgMS4yLjQtYWxwaGEubm90cmVhZHlgIHNob3VsZCBOT1QgYmUgYWxsb3dlZCxcbiAgICAvLyBldmVuIHRob3VnaCBpdCdzIHdpdGhpbiB0aGUgcmFuZ2Ugc2V0IGJ5IHRoZSBjb21wYXJhdG9ycy5cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHNldC5sZW5ndGg7IGkrKykge1xuICAgICAgZGVidWckNShzZXRbaV0uc2VtdmVyKTtcbiAgICAgIGlmIChzZXRbaV0uc2VtdmVyID09PSBDb21wYXJhdG9yJDcuQU5ZKSB7XG4gICAgICAgIGNvbnRpbnVlXG4gICAgICB9XG5cbiAgICAgIGlmIChzZXRbaV0uc2VtdmVyLnByZXJlbGVhc2UubGVuZ3RoID4gMCkge1xuICAgICAgICBjb25zdCBhbGxvd2VkID0gc2V0W2ldLnNlbXZlcjtcbiAgICAgICAgaWYgKGFsbG93ZWQubWFqb3IgPT09IHZlcnNpb24ubWFqb3IgJiZcbiAgICAgICAgICAgIGFsbG93ZWQubWlub3IgPT09IHZlcnNpb24ubWlub3IgJiZcbiAgICAgICAgICAgIGFsbG93ZWQucGF0Y2ggPT09IHZlcnNpb24ucGF0Y2gpIHtcbiAgICAgICAgICByZXR1cm4gdHJ1ZVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gVmVyc2lvbiBoYXMgYSAtcHJlLCBidXQgaXQncyBub3Qgb25lIG9mIHRoZSBvbmVzIHdlIGxpa2UuXG4gICAgcmV0dXJuIGZhbHNlXG4gIH1cblxuICByZXR1cm4gdHJ1ZVxufTtcblxuY29uc3QgQU5ZJDUgPSBTeW1ib2woJ1NlbVZlciBBTlknKTtcbi8vIGhvaXN0ZWQgY2xhc3MgZm9yIGN5Y2xpYyBkZXBlbmRlbmN5XG5jbGFzcyBDb21wYXJhdG9yJDYge1xuICBzdGF0aWMgZ2V0IEFOWSAoKSB7XG4gICAgcmV0dXJuIEFOWSQ1XG4gIH1cbiAgY29uc3RydWN0b3IgKGNvbXAsIG9wdGlvbnMpIHtcbiAgICBvcHRpb25zID0gcGFyc2VPcHRpb25zJDUob3B0aW9ucyk7XG5cbiAgICBpZiAoY29tcCBpbnN0YW5jZW9mIENvbXBhcmF0b3IkNikge1xuICAgICAgaWYgKGNvbXAubG9vc2UgPT09ICEhb3B0aW9ucy5sb29zZSkge1xuICAgICAgICByZXR1cm4gY29tcFxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29tcCA9IGNvbXAudmFsdWU7XG4gICAgICB9XG4gICAgfVxuXG4gICAgZGVidWckNCgnY29tcGFyYXRvcicsIGNvbXAsIG9wdGlvbnMpO1xuICAgIHRoaXMub3B0aW9ucyA9IG9wdGlvbnM7XG4gICAgdGhpcy5sb29zZSA9ICEhb3B0aW9ucy5sb29zZTtcbiAgICB0aGlzLnBhcnNlKGNvbXApO1xuXG4gICAgaWYgKHRoaXMuc2VtdmVyID09PSBBTlkkNSkge1xuICAgICAgdGhpcy52YWx1ZSA9ICcnO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnZhbHVlID0gdGhpcy5vcGVyYXRvciArIHRoaXMuc2VtdmVyLnZlcnNpb247XG4gICAgfVxuXG4gICAgZGVidWckNCgnY29tcCcsIHRoaXMpO1xuICB9XG5cbiAgcGFyc2UgKGNvbXApIHtcbiAgICBjb25zdCByID0gdGhpcy5vcHRpb25zLmxvb3NlID8gcmUkNlt0JDUuQ09NUEFSQVRPUkxPT1NFXSA6IHJlJDZbdCQ1LkNPTVBBUkFUT1JdO1xuICAgIGNvbnN0IG0gPSBjb21wLm1hdGNoKHIpO1xuXG4gICAgaWYgKCFtKSB7XG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKGBJbnZhbGlkIGNvbXBhcmF0b3I6ICR7Y29tcH1gKVxuICAgIH1cblxuICAgIHRoaXMub3BlcmF0b3IgPSBtWzFdICE9PSB1bmRlZmluZWQgPyBtWzFdIDogJyc7XG4gICAgaWYgKHRoaXMub3BlcmF0b3IgPT09ICc9Jykge1xuICAgICAgdGhpcy5vcGVyYXRvciA9ICcnO1xuICAgIH1cblxuICAgIC8vIGlmIGl0IGxpdGVyYWxseSBpcyBqdXN0ICc+JyBvciAnJyB0aGVuIGFsbG93IGFueXRoaW5nLlxuICAgIGlmICghbVsyXSkge1xuICAgICAgdGhpcy5zZW12ZXIgPSBBTlkkNTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5zZW12ZXIgPSBuZXcgU2VtVmVyJGoobVsyXSwgdGhpcy5vcHRpb25zLmxvb3NlKTtcbiAgICB9XG4gIH1cblxuICB0b1N0cmluZyAoKSB7XG4gICAgcmV0dXJuIHRoaXMudmFsdWVcbiAgfVxuXG4gIHRlc3QgKHZlcnNpb24pIHtcbiAgICBkZWJ1ZyQ0KCdDb21wYXJhdG9yLnRlc3QnLCB2ZXJzaW9uLCB0aGlzLm9wdGlvbnMubG9vc2UpO1xuXG4gICAgaWYgKHRoaXMuc2VtdmVyID09PSBBTlkkNSB8fCB2ZXJzaW9uID09PSBBTlkkNSkge1xuICAgICAgcmV0dXJuIHRydWVcbiAgICB9XG5cbiAgICBpZiAodHlwZW9mIHZlcnNpb24gPT09ICdzdHJpbmcnKSB7XG4gICAgICB0cnkge1xuICAgICAgICB2ZXJzaW9uID0gbmV3IFNlbVZlciRqKHZlcnNpb24sIHRoaXMub3B0aW9ucyk7XG4gICAgICB9IGNhdGNoIChlcikge1xuICAgICAgICByZXR1cm4gZmFsc2VcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gY21wJDIodmVyc2lvbiwgdGhpcy5vcGVyYXRvciwgdGhpcy5zZW12ZXIsIHRoaXMub3B0aW9ucylcbiAgfVxuXG4gIGludGVyc2VjdHMgKGNvbXAsIG9wdGlvbnMpIHtcbiAgICBpZiAoIShjb21wIGluc3RhbmNlb2YgQ29tcGFyYXRvciQ2KSkge1xuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignYSBDb21wYXJhdG9yIGlzIHJlcXVpcmVkJylcbiAgICB9XG5cbiAgICBpZiAoIW9wdGlvbnMgfHwgdHlwZW9mIG9wdGlvbnMgIT09ICdvYmplY3QnKSB7XG4gICAgICBvcHRpb25zID0ge1xuICAgICAgICBsb29zZTogISFvcHRpb25zLFxuICAgICAgICBpbmNsdWRlUHJlcmVsZWFzZTogZmFsc2VcbiAgICAgIH07XG4gICAgfVxuXG4gICAgaWYgKHRoaXMub3BlcmF0b3IgPT09ICcnKSB7XG4gICAgICBpZiAodGhpcy52YWx1ZSA9PT0gJycpIHtcbiAgICAgICAgcmV0dXJuIHRydWVcbiAgICAgIH1cbiAgICAgIHJldHVybiBuZXcgUmFuZ2Ukayhjb21wLnZhbHVlLCBvcHRpb25zKS50ZXN0KHRoaXMudmFsdWUpXG4gICAgfSBlbHNlIGlmIChjb21wLm9wZXJhdG9yID09PSAnJykge1xuICAgICAgaWYgKGNvbXAudmFsdWUgPT09ICcnKSB7XG4gICAgICAgIHJldHVybiB0cnVlXG4gICAgICB9XG4gICAgICByZXR1cm4gbmV3IFJhbmdlJGsodGhpcy52YWx1ZSwgb3B0aW9ucykudGVzdChjb21wLnNlbXZlcilcbiAgICB9XG5cbiAgICBjb25zdCBzYW1lRGlyZWN0aW9uSW5jcmVhc2luZyA9XG4gICAgICAodGhpcy5vcGVyYXRvciA9PT0gJz49JyB8fCB0aGlzLm9wZXJhdG9yID09PSAnPicpICYmXG4gICAgICAoY29tcC5vcGVyYXRvciA9PT0gJz49JyB8fCBjb21wLm9wZXJhdG9yID09PSAnPicpO1xuICAgIGNvbnN0IHNhbWVEaXJlY3Rpb25EZWNyZWFzaW5nID1cbiAgICAgICh0aGlzLm9wZXJhdG9yID09PSAnPD0nIHx8IHRoaXMub3BlcmF0b3IgPT09ICc8JykgJiZcbiAgICAgIChjb21wLm9wZXJhdG9yID09PSAnPD0nIHx8IGNvbXAub3BlcmF0b3IgPT09ICc8Jyk7XG4gICAgY29uc3Qgc2FtZVNlbVZlciA9IHRoaXMuc2VtdmVyLnZlcnNpb24gPT09IGNvbXAuc2VtdmVyLnZlcnNpb247XG4gICAgY29uc3QgZGlmZmVyZW50RGlyZWN0aW9uc0luY2x1c2l2ZSA9XG4gICAgICAodGhpcy5vcGVyYXRvciA9PT0gJz49JyB8fCB0aGlzLm9wZXJhdG9yID09PSAnPD0nKSAmJlxuICAgICAgKGNvbXAub3BlcmF0b3IgPT09ICc+PScgfHwgY29tcC5vcGVyYXRvciA9PT0gJzw9Jyk7XG4gICAgY29uc3Qgb3Bwb3NpdGVEaXJlY3Rpb25zTGVzc1RoYW4gPVxuICAgICAgY21wJDIodGhpcy5zZW12ZXIsICc8JywgY29tcC5zZW12ZXIsIG9wdGlvbnMpICYmXG4gICAgICAodGhpcy5vcGVyYXRvciA9PT0gJz49JyB8fCB0aGlzLm9wZXJhdG9yID09PSAnPicpICYmXG4gICAgICAgIChjb21wLm9wZXJhdG9yID09PSAnPD0nIHx8IGNvbXAub3BlcmF0b3IgPT09ICc8Jyk7XG4gICAgY29uc3Qgb3Bwb3NpdGVEaXJlY3Rpb25zR3JlYXRlclRoYW4gPVxuICAgICAgY21wJDIodGhpcy5zZW12ZXIsICc+JywgY29tcC5zZW12ZXIsIG9wdGlvbnMpICYmXG4gICAgICAodGhpcy5vcGVyYXRvciA9PT0gJzw9JyB8fCB0aGlzLm9wZXJhdG9yID09PSAnPCcpICYmXG4gICAgICAgIChjb21wLm9wZXJhdG9yID09PSAnPj0nIHx8IGNvbXAub3BlcmF0b3IgPT09ICc+Jyk7XG5cbiAgICByZXR1cm4gKFxuICAgICAgc2FtZURpcmVjdGlvbkluY3JlYXNpbmcgfHxcbiAgICAgIHNhbWVEaXJlY3Rpb25EZWNyZWFzaW5nIHx8XG4gICAgICAoc2FtZVNlbVZlciAmJiBkaWZmZXJlbnREaXJlY3Rpb25zSW5jbHVzaXZlKSB8fFxuICAgICAgb3Bwb3NpdGVEaXJlY3Rpb25zTGVzc1RoYW4gfHxcbiAgICAgIG9wcG9zaXRlRGlyZWN0aW9uc0dyZWF0ZXJUaGFuXG4gICAgKVxuICB9XG59XG5cbnZhciBjb21wYXJhdG9yJDEgPSBDb21wYXJhdG9yJDY7XG5cbmNvbnN0IHBhcnNlT3B0aW9ucyQ1ID0gcGFyc2VPcHRpb25zXzEkMTtcbmNvbnN0IHtyZTogcmUkNiwgdDogdCQ1fSA9IHJlJGIuZXhwb3J0cztcbmNvbnN0IGNtcCQyID0gY21wXzEkMTtcbmNvbnN0IGRlYnVnJDQgPSBkZWJ1Z18xJDE7XG5jb25zdCBTZW1WZXIkaiA9IHNlbXZlciQ1O1xuY29uc3QgUmFuZ2UkayA9IHJhbmdlJDE7XG5cbmNvbnN0IFJhbmdlJGogPSByYW5nZSQxO1xuY29uc3Qgc2F0aXNmaWVzJDcgPSAodmVyc2lvbiwgcmFuZ2UsIG9wdGlvbnMpID0+IHtcbiAgdHJ5IHtcbiAgICByYW5nZSA9IG5ldyBSYW5nZSRqKHJhbmdlLCBvcHRpb25zKTtcbiAgfSBjYXRjaCAoZXIpIHtcbiAgICByZXR1cm4gZmFsc2VcbiAgfVxuICByZXR1cm4gcmFuZ2UudGVzdCh2ZXJzaW9uKVxufTtcbnZhciBzYXRpc2ZpZXNfMSQxID0gc2F0aXNmaWVzJDc7XG5cbmNvbnN0IFJhbmdlJGkgPSByYW5nZSQxO1xuXG4vLyBNb3N0bHkganVzdCBmb3IgdGVzdGluZyBhbmQgbGVnYWN5IEFQSSByZWFzb25zXG5jb25zdCB0b0NvbXBhcmF0b3JzJDEgPSAocmFuZ2UsIG9wdGlvbnMpID0+XG4gIG5ldyBSYW5nZSRpKHJhbmdlLCBvcHRpb25zKS5zZXRcbiAgICAubWFwKGNvbXAgPT4gY29tcC5tYXAoYyA9PiBjLnZhbHVlKS5qb2luKCcgJykudHJpbSgpLnNwbGl0KCcgJykpO1xuXG52YXIgdG9Db21wYXJhdG9yc18xJDEgPSB0b0NvbXBhcmF0b3JzJDE7XG5cbmNvbnN0IFNlbVZlciRpID0gc2VtdmVyJDU7XG5jb25zdCBSYW5nZSRoID0gcmFuZ2UkMTtcblxuY29uc3QgbWF4U2F0aXNmeWluZyQxID0gKHZlcnNpb25zLCByYW5nZSwgb3B0aW9ucykgPT4ge1xuICBsZXQgbWF4ID0gbnVsbDtcbiAgbGV0IG1heFNWID0gbnVsbDtcbiAgbGV0IHJhbmdlT2JqID0gbnVsbDtcbiAgdHJ5IHtcbiAgICByYW5nZU9iaiA9IG5ldyBSYW5nZSRoKHJhbmdlLCBvcHRpb25zKTtcbiAgfSBjYXRjaCAoZXIpIHtcbiAgICByZXR1cm4gbnVsbFxuICB9XG4gIHZlcnNpb25zLmZvckVhY2goKHYpID0+IHtcbiAgICBpZiAocmFuZ2VPYmoudGVzdCh2KSkge1xuICAgICAgLy8gc2F0aXNmaWVzKHYsIHJhbmdlLCBvcHRpb25zKVxuICAgICAgaWYgKCFtYXggfHwgbWF4U1YuY29tcGFyZSh2KSA9PT0gLTEpIHtcbiAgICAgICAgLy8gY29tcGFyZShtYXgsIHYsIHRydWUpXG4gICAgICAgIG1heCA9IHY7XG4gICAgICAgIG1heFNWID0gbmV3IFNlbVZlciRpKG1heCwgb3B0aW9ucyk7XG4gICAgICB9XG4gICAgfVxuICB9KTtcbiAgcmV0dXJuIG1heFxufTtcbnZhciBtYXhTYXRpc2Z5aW5nXzEkMSA9IG1heFNhdGlzZnlpbmckMTtcblxuY29uc3QgU2VtVmVyJGggPSBzZW12ZXIkNTtcbmNvbnN0IFJhbmdlJGcgPSByYW5nZSQxO1xuY29uc3QgbWluU2F0aXNmeWluZyQxID0gKHZlcnNpb25zLCByYW5nZSwgb3B0aW9ucykgPT4ge1xuICBsZXQgbWluID0gbnVsbDtcbiAgbGV0IG1pblNWID0gbnVsbDtcbiAgbGV0IHJhbmdlT2JqID0gbnVsbDtcbiAgdHJ5IHtcbiAgICByYW5nZU9iaiA9IG5ldyBSYW5nZSRnKHJhbmdlLCBvcHRpb25zKTtcbiAgfSBjYXRjaCAoZXIpIHtcbiAgICByZXR1cm4gbnVsbFxuICB9XG4gIHZlcnNpb25zLmZvckVhY2goKHYpID0+IHtcbiAgICBpZiAocmFuZ2VPYmoudGVzdCh2KSkge1xuICAgICAgLy8gc2F0aXNmaWVzKHYsIHJhbmdlLCBvcHRpb25zKVxuICAgICAgaWYgKCFtaW4gfHwgbWluU1YuY29tcGFyZSh2KSA9PT0gMSkge1xuICAgICAgICAvLyBjb21wYXJlKG1pbiwgdiwgdHJ1ZSlcbiAgICAgICAgbWluID0gdjtcbiAgICAgICAgbWluU1YgPSBuZXcgU2VtVmVyJGgobWluLCBvcHRpb25zKTtcbiAgICAgIH1cbiAgICB9XG4gIH0pO1xuICByZXR1cm4gbWluXG59O1xudmFyIG1pblNhdGlzZnlpbmdfMSQxID0gbWluU2F0aXNmeWluZyQxO1xuXG5jb25zdCBTZW1WZXIkZyA9IHNlbXZlciQ1O1xuY29uc3QgUmFuZ2UkZiA9IHJhbmdlJDE7XG5jb25zdCBndCQ1ID0gZ3RfMSQxO1xuXG5jb25zdCBtaW5WZXJzaW9uJDEgPSAocmFuZ2UsIGxvb3NlKSA9PiB7XG4gIHJhbmdlID0gbmV3IFJhbmdlJGYocmFuZ2UsIGxvb3NlKTtcblxuICBsZXQgbWludmVyID0gbmV3IFNlbVZlciRnKCcwLjAuMCcpO1xuICBpZiAocmFuZ2UudGVzdChtaW52ZXIpKSB7XG4gICAgcmV0dXJuIG1pbnZlclxuICB9XG5cbiAgbWludmVyID0gbmV3IFNlbVZlciRnKCcwLjAuMC0wJyk7XG4gIGlmIChyYW5nZS50ZXN0KG1pbnZlcikpIHtcbiAgICByZXR1cm4gbWludmVyXG4gIH1cblxuICBtaW52ZXIgPSBudWxsO1xuICBmb3IgKGxldCBpID0gMDsgaSA8IHJhbmdlLnNldC5sZW5ndGg7ICsraSkge1xuICAgIGNvbnN0IGNvbXBhcmF0b3JzID0gcmFuZ2Uuc2V0W2ldO1xuXG4gICAgbGV0IHNldE1pbiA9IG51bGw7XG4gICAgY29tcGFyYXRvcnMuZm9yRWFjaCgoY29tcGFyYXRvcikgPT4ge1xuICAgICAgLy8gQ2xvbmUgdG8gYXZvaWQgbWFuaXB1bGF0aW5nIHRoZSBjb21wYXJhdG9yJ3Mgc2VtdmVyIG9iamVjdC5cbiAgICAgIGNvbnN0IGNvbXB2ZXIgPSBuZXcgU2VtVmVyJGcoY29tcGFyYXRvci5zZW12ZXIudmVyc2lvbik7XG4gICAgICBzd2l0Y2ggKGNvbXBhcmF0b3Iub3BlcmF0b3IpIHtcbiAgICAgICAgY2FzZSAnPic6XG4gICAgICAgICAgaWYgKGNvbXB2ZXIucHJlcmVsZWFzZS5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgIGNvbXB2ZXIucGF0Y2grKztcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29tcHZlci5wcmVyZWxlYXNlLnB1c2goMCk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGNvbXB2ZXIucmF3ID0gY29tcHZlci5mb3JtYXQoKTtcbiAgICAgICAgICAvKiBmYWxsdGhyb3VnaCAqL1xuICAgICAgICBjYXNlICcnOlxuICAgICAgICBjYXNlICc+PSc6XG4gICAgICAgICAgaWYgKCFzZXRNaW4gfHwgZ3QkNShjb21wdmVyLCBzZXRNaW4pKSB7XG4gICAgICAgICAgICBzZXRNaW4gPSBjb21wdmVyO1xuICAgICAgICAgIH1cbiAgICAgICAgICBicmVha1xuICAgICAgICBjYXNlICc8JzpcbiAgICAgICAgY2FzZSAnPD0nOlxuICAgICAgICAgIC8qIElnbm9yZSBtYXhpbXVtIHZlcnNpb25zICovXG4gICAgICAgICAgYnJlYWtcbiAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFVuZXhwZWN0ZWQgb3BlcmF0aW9uOiAke2NvbXBhcmF0b3Iub3BlcmF0b3J9YClcbiAgICAgIH1cbiAgICB9KTtcbiAgICBpZiAoc2V0TWluICYmICghbWludmVyIHx8IGd0JDUobWludmVyLCBzZXRNaW4pKSlcbiAgICAgIG1pbnZlciA9IHNldE1pbjtcbiAgfVxuXG4gIGlmIChtaW52ZXIgJiYgcmFuZ2UudGVzdChtaW52ZXIpKSB7XG4gICAgcmV0dXJuIG1pbnZlclxuICB9XG5cbiAgcmV0dXJuIG51bGxcbn07XG52YXIgbWluVmVyc2lvbl8xJDEgPSBtaW5WZXJzaW9uJDE7XG5cbmNvbnN0IFJhbmdlJGUgPSByYW5nZSQxO1xuY29uc3QgdmFsaWRSYW5nZSQxID0gKHJhbmdlLCBvcHRpb25zKSA9PiB7XG4gIHRyeSB7XG4gICAgLy8gUmV0dXJuICcqJyBpbnN0ZWFkIG9mICcnIHNvIHRoYXQgdHJ1dGhpbmVzcyB3b3Jrcy5cbiAgICAvLyBUaGlzIHdpbGwgdGhyb3cgaWYgaXQncyBpbnZhbGlkIGFueXdheVxuICAgIHJldHVybiBuZXcgUmFuZ2UkZShyYW5nZSwgb3B0aW9ucykucmFuZ2UgfHwgJyonXG4gIH0gY2F0Y2ggKGVyKSB7XG4gICAgcmV0dXJuIG51bGxcbiAgfVxufTtcbnZhciB2YWxpZCQyID0gdmFsaWRSYW5nZSQxO1xuXG5jb25zdCBTZW1WZXIkZiA9IHNlbXZlciQ1O1xuY29uc3QgQ29tcGFyYXRvciQ1ID0gY29tcGFyYXRvciQxO1xuY29uc3Qge0FOWTogQU5ZJDR9ID0gQ29tcGFyYXRvciQ1O1xuY29uc3QgUmFuZ2UkZCA9IHJhbmdlJDE7XG5jb25zdCBzYXRpc2ZpZXMkNiA9IHNhdGlzZmllc18xJDE7XG5jb25zdCBndCQ0ID0gZ3RfMSQxO1xuY29uc3QgbHQkMyA9IGx0XzEkMTtcbmNvbnN0IGx0ZSQzID0gbHRlXzEkMTtcbmNvbnN0IGd0ZSQzID0gZ3RlXzEkMTtcblxuY29uc3Qgb3V0c2lkZSQ1ID0gKHZlcnNpb24sIHJhbmdlLCBoaWxvLCBvcHRpb25zKSA9PiB7XG4gIHZlcnNpb24gPSBuZXcgU2VtVmVyJGYodmVyc2lvbiwgb3B0aW9ucyk7XG4gIHJhbmdlID0gbmV3IFJhbmdlJGQocmFuZ2UsIG9wdGlvbnMpO1xuXG4gIGxldCBndGZuLCBsdGVmbiwgbHRmbiwgY29tcCwgZWNvbXA7XG4gIHN3aXRjaCAoaGlsbykge1xuICAgIGNhc2UgJz4nOlxuICAgICAgZ3RmbiA9IGd0JDQ7XG4gICAgICBsdGVmbiA9IGx0ZSQzO1xuICAgICAgbHRmbiA9IGx0JDM7XG4gICAgICBjb21wID0gJz4nO1xuICAgICAgZWNvbXAgPSAnPj0nO1xuICAgICAgYnJlYWtcbiAgICBjYXNlICc8JzpcbiAgICAgIGd0Zm4gPSBsdCQzO1xuICAgICAgbHRlZm4gPSBndGUkMztcbiAgICAgIGx0Zm4gPSBndCQ0O1xuICAgICAgY29tcCA9ICc8JztcbiAgICAgIGVjb21wID0gJzw9JztcbiAgICAgIGJyZWFrXG4gICAgZGVmYXVsdDpcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ011c3QgcHJvdmlkZSBhIGhpbG8gdmFsIG9mIFwiPFwiIG9yIFwiPlwiJylcbiAgfVxuXG4gIC8vIElmIGl0IHNhdGlzZmllcyB0aGUgcmFuZ2UgaXQgaXMgbm90IG91dHNpZGVcbiAgaWYgKHNhdGlzZmllcyQ2KHZlcnNpb24sIHJhbmdlLCBvcHRpb25zKSkge1xuICAgIHJldHVybiBmYWxzZVxuICB9XG5cbiAgLy8gRnJvbSBub3cgb24sIHZhcmlhYmxlIHRlcm1zIGFyZSBhcyBpZiB3ZSdyZSBpbiBcImd0clwiIG1vZGUuXG4gIC8vIGJ1dCBub3RlIHRoYXQgZXZlcnl0aGluZyBpcyBmbGlwcGVkIGZvciB0aGUgXCJsdHJcIiBmdW5jdGlvbi5cblxuICBmb3IgKGxldCBpID0gMDsgaSA8IHJhbmdlLnNldC5sZW5ndGg7ICsraSkge1xuICAgIGNvbnN0IGNvbXBhcmF0b3JzID0gcmFuZ2Uuc2V0W2ldO1xuXG4gICAgbGV0IGhpZ2ggPSBudWxsO1xuICAgIGxldCBsb3cgPSBudWxsO1xuXG4gICAgY29tcGFyYXRvcnMuZm9yRWFjaCgoY29tcGFyYXRvcikgPT4ge1xuICAgICAgaWYgKGNvbXBhcmF0b3Iuc2VtdmVyID09PSBBTlkkNCkge1xuICAgICAgICBjb21wYXJhdG9yID0gbmV3IENvbXBhcmF0b3IkNSgnPj0wLjAuMCcpO1xuICAgICAgfVxuICAgICAgaGlnaCA9IGhpZ2ggfHwgY29tcGFyYXRvcjtcbiAgICAgIGxvdyA9IGxvdyB8fCBjb21wYXJhdG9yO1xuICAgICAgaWYgKGd0Zm4oY29tcGFyYXRvci5zZW12ZXIsIGhpZ2guc2VtdmVyLCBvcHRpb25zKSkge1xuICAgICAgICBoaWdoID0gY29tcGFyYXRvcjtcbiAgICAgIH0gZWxzZSBpZiAobHRmbihjb21wYXJhdG9yLnNlbXZlciwgbG93LnNlbXZlciwgb3B0aW9ucykpIHtcbiAgICAgICAgbG93ID0gY29tcGFyYXRvcjtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIC8vIElmIHRoZSBlZGdlIHZlcnNpb24gY29tcGFyYXRvciBoYXMgYSBvcGVyYXRvciB0aGVuIG91ciB2ZXJzaW9uXG4gICAgLy8gaXNuJ3Qgb3V0c2lkZSBpdFxuICAgIGlmIChoaWdoLm9wZXJhdG9yID09PSBjb21wIHx8IGhpZ2gub3BlcmF0b3IgPT09IGVjb21wKSB7XG4gICAgICByZXR1cm4gZmFsc2VcbiAgICB9XG5cbiAgICAvLyBJZiB0aGUgbG93ZXN0IHZlcnNpb24gY29tcGFyYXRvciBoYXMgYW4gb3BlcmF0b3IgYW5kIG91ciB2ZXJzaW9uXG4gICAgLy8gaXMgbGVzcyB0aGFuIGl0IHRoZW4gaXQgaXNuJ3QgaGlnaGVyIHRoYW4gdGhlIHJhbmdlXG4gICAgaWYgKCghbG93Lm9wZXJhdG9yIHx8IGxvdy5vcGVyYXRvciA9PT0gY29tcCkgJiZcbiAgICAgICAgbHRlZm4odmVyc2lvbiwgbG93LnNlbXZlcikpIHtcbiAgICAgIHJldHVybiBmYWxzZVxuICAgIH0gZWxzZSBpZiAobG93Lm9wZXJhdG9yID09PSBlY29tcCAmJiBsdGZuKHZlcnNpb24sIGxvdy5zZW12ZXIpKSB7XG4gICAgICByZXR1cm4gZmFsc2VcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHRydWVcbn07XG5cbnZhciBvdXRzaWRlXzEkMSA9IG91dHNpZGUkNTtcblxuLy8gRGV0ZXJtaW5lIGlmIHZlcnNpb24gaXMgZ3JlYXRlciB0aGFuIGFsbCB0aGUgdmVyc2lvbnMgcG9zc2libGUgaW4gdGhlIHJhbmdlLlxuY29uc3Qgb3V0c2lkZSQ0ID0gb3V0c2lkZV8xJDE7XG5jb25zdCBndHIkMSA9ICh2ZXJzaW9uLCByYW5nZSwgb3B0aW9ucykgPT4gb3V0c2lkZSQ0KHZlcnNpb24sIHJhbmdlLCAnPicsIG9wdGlvbnMpO1xudmFyIGd0cl8xJDEgPSBndHIkMTtcblxuY29uc3Qgb3V0c2lkZSQzID0gb3V0c2lkZV8xJDE7XG4vLyBEZXRlcm1pbmUgaWYgdmVyc2lvbiBpcyBsZXNzIHRoYW4gYWxsIHRoZSB2ZXJzaW9ucyBwb3NzaWJsZSBpbiB0aGUgcmFuZ2VcbmNvbnN0IGx0ciQxID0gKHZlcnNpb24sIHJhbmdlLCBvcHRpb25zKSA9PiBvdXRzaWRlJDModmVyc2lvbiwgcmFuZ2UsICc8Jywgb3B0aW9ucyk7XG52YXIgbHRyXzEkMSA9IGx0ciQxO1xuXG5jb25zdCBSYW5nZSRjID0gcmFuZ2UkMTtcbmNvbnN0IGludGVyc2VjdHMkMSA9IChyMSwgcjIsIG9wdGlvbnMpID0+IHtcbiAgcjEgPSBuZXcgUmFuZ2UkYyhyMSwgb3B0aW9ucyk7XG4gIHIyID0gbmV3IFJhbmdlJGMocjIsIG9wdGlvbnMpO1xuICByZXR1cm4gcjEuaW50ZXJzZWN0cyhyMilcbn07XG52YXIgaW50ZXJzZWN0c18xJDEgPSBpbnRlcnNlY3RzJDE7XG5cbi8vIGdpdmVuIGEgc2V0IG9mIHZlcnNpb25zIGFuZCBhIHJhbmdlLCBjcmVhdGUgYSBcInNpbXBsaWZpZWRcIiByYW5nZVxuLy8gdGhhdCBpbmNsdWRlcyB0aGUgc2FtZSB2ZXJzaW9ucyB0aGF0IHRoZSBvcmlnaW5hbCByYW5nZSBkb2VzXG4vLyBJZiB0aGUgb3JpZ2luYWwgcmFuZ2UgaXMgc2hvcnRlciB0aGFuIHRoZSBzaW1wbGlmaWVkIG9uZSwgcmV0dXJuIHRoYXQuXG5jb25zdCBzYXRpc2ZpZXMkNSA9IHNhdGlzZmllc18xJDE7XG5jb25zdCBjb21wYXJlJGMgPSBjb21wYXJlXzEkMTtcbnZhciBzaW1wbGlmeSQxID0gKHZlcnNpb25zLCByYW5nZSwgb3B0aW9ucykgPT4ge1xuICBjb25zdCBzZXQgPSBbXTtcbiAgbGV0IG1pbiA9IG51bGw7XG4gIGxldCBwcmV2ID0gbnVsbDtcbiAgY29uc3QgdiA9IHZlcnNpb25zLnNvcnQoKGEsIGIpID0+IGNvbXBhcmUkYyhhLCBiLCBvcHRpb25zKSk7XG4gIGZvciAoY29uc3QgdmVyc2lvbiBvZiB2KSB7XG4gICAgY29uc3QgaW5jbHVkZWQgPSBzYXRpc2ZpZXMkNSh2ZXJzaW9uLCByYW5nZSwgb3B0aW9ucyk7XG4gICAgaWYgKGluY2x1ZGVkKSB7XG4gICAgICBwcmV2ID0gdmVyc2lvbjtcbiAgICAgIGlmICghbWluKVxuICAgICAgICBtaW4gPSB2ZXJzaW9uO1xuICAgIH0gZWxzZSB7XG4gICAgICBpZiAocHJldikge1xuICAgICAgICBzZXQucHVzaChbbWluLCBwcmV2XSk7XG4gICAgICB9XG4gICAgICBwcmV2ID0gbnVsbDtcbiAgICAgIG1pbiA9IG51bGw7XG4gICAgfVxuICB9XG4gIGlmIChtaW4pXG4gICAgc2V0LnB1c2goW21pbiwgbnVsbF0pO1xuXG4gIGNvbnN0IHJhbmdlcyA9IFtdO1xuICBmb3IgKGNvbnN0IFttaW4sIG1heF0gb2Ygc2V0KSB7XG4gICAgaWYgKG1pbiA9PT0gbWF4KVxuICAgICAgcmFuZ2VzLnB1c2gobWluKTtcbiAgICBlbHNlIGlmICghbWF4ICYmIG1pbiA9PT0gdlswXSlcbiAgICAgIHJhbmdlcy5wdXNoKCcqJyk7XG4gICAgZWxzZSBpZiAoIW1heClcbiAgICAgIHJhbmdlcy5wdXNoKGA+PSR7bWlufWApO1xuICAgIGVsc2UgaWYgKG1pbiA9PT0gdlswXSlcbiAgICAgIHJhbmdlcy5wdXNoKGA8PSR7bWF4fWApO1xuICAgIGVsc2VcbiAgICAgIHJhbmdlcy5wdXNoKGAke21pbn0gLSAke21heH1gKTtcbiAgfVxuICBjb25zdCBzaW1wbGlmaWVkID0gcmFuZ2VzLmpvaW4oJyB8fCAnKTtcbiAgY29uc3Qgb3JpZ2luYWwgPSB0eXBlb2YgcmFuZ2UucmF3ID09PSAnc3RyaW5nJyA/IHJhbmdlLnJhdyA6IFN0cmluZyhyYW5nZSk7XG4gIHJldHVybiBzaW1wbGlmaWVkLmxlbmd0aCA8IG9yaWdpbmFsLmxlbmd0aCA/IHNpbXBsaWZpZWQgOiByYW5nZVxufTtcblxuY29uc3QgUmFuZ2UkYiA9IHJhbmdlJDE7XG5jb25zdCBDb21wYXJhdG9yJDQgPSBjb21wYXJhdG9yJDE7XG5jb25zdCB7IEFOWTogQU5ZJDMgfSA9IENvbXBhcmF0b3IkNDtcbmNvbnN0IHNhdGlzZmllcyQ0ID0gc2F0aXNmaWVzXzEkMTtcbmNvbnN0IGNvbXBhcmUkYiA9IGNvbXBhcmVfMSQxO1xuXG4vLyBDb21wbGV4IHJhbmdlIGByMSB8fCByMiB8fCAuLi5gIGlzIGEgc3Vic2V0IG9mIGBSMSB8fCBSMiB8fCAuLi5gIGlmZjpcbi8vIC0gRXZlcnkgc2ltcGxlIHJhbmdlIGByMSwgcjIsIC4uLmAgaXMgYSBudWxsIHNldCwgT1Jcbi8vIC0gRXZlcnkgc2ltcGxlIHJhbmdlIGByMSwgcjIsIC4uLmAgd2hpY2ggaXMgbm90IGEgbnVsbCBzZXQgaXMgYSBzdWJzZXQgb2Zcbi8vICAgc29tZSBgUjEsIFIyLCAuLi5gXG4vL1xuLy8gU2ltcGxlIHJhbmdlIGBjMSBjMiAuLi5gIGlzIGEgc3Vic2V0IG9mIHNpbXBsZSByYW5nZSBgQzEgQzIgLi4uYCBpZmY6XG4vLyAtIElmIGMgaXMgb25seSB0aGUgQU5ZIGNvbXBhcmF0b3Jcbi8vICAgLSBJZiBDIGlzIG9ubHkgdGhlIEFOWSBjb21wYXJhdG9yLCByZXR1cm4gdHJ1ZVxuLy8gICAtIEVsc2UgaWYgaW4gcHJlcmVsZWFzZSBtb2RlLCByZXR1cm4gZmFsc2Vcbi8vICAgLSBlbHNlIHJlcGxhY2UgYyB3aXRoIGBbPj0wLjAuMF1gXG4vLyAtIElmIEMgaXMgb25seSB0aGUgQU5ZIGNvbXBhcmF0b3Jcbi8vICAgLSBpZiBpbiBwcmVyZWxlYXNlIG1vZGUsIHJldHVybiB0cnVlXG4vLyAgIC0gZWxzZSByZXBsYWNlIEMgd2l0aCBgWz49MC4wLjBdYFxuLy8gLSBMZXQgRVEgYmUgdGhlIHNldCBvZiA9IGNvbXBhcmF0b3JzIGluIGNcbi8vIC0gSWYgRVEgaXMgbW9yZSB0aGFuIG9uZSwgcmV0dXJuIHRydWUgKG51bGwgc2V0KVxuLy8gLSBMZXQgR1QgYmUgdGhlIGhpZ2hlc3QgPiBvciA+PSBjb21wYXJhdG9yIGluIGNcbi8vIC0gTGV0IExUIGJlIHRoZSBsb3dlc3QgPCBvciA8PSBjb21wYXJhdG9yIGluIGNcbi8vIC0gSWYgR1QgYW5kIExULCBhbmQgR1Quc2VtdmVyID4gTFQuc2VtdmVyLCByZXR1cm4gdHJ1ZSAobnVsbCBzZXQpXG4vLyAtIElmIGFueSBDIGlzIGEgPSByYW5nZSwgYW5kIEdUIG9yIExUIGFyZSBzZXQsIHJldHVybiBmYWxzZVxuLy8gLSBJZiBFUVxuLy8gICAtIElmIEdULCBhbmQgRVEgZG9lcyBub3Qgc2F0aXNmeSBHVCwgcmV0dXJuIHRydWUgKG51bGwgc2V0KVxuLy8gICAtIElmIExULCBhbmQgRVEgZG9lcyBub3Qgc2F0aXNmeSBMVCwgcmV0dXJuIHRydWUgKG51bGwgc2V0KVxuLy8gICAtIElmIEVRIHNhdGlzZmllcyBldmVyeSBDLCByZXR1cm4gdHJ1ZVxuLy8gICAtIEVsc2UgcmV0dXJuIGZhbHNlXG4vLyAtIElmIEdUXG4vLyAgIC0gSWYgR1Quc2VtdmVyIGlzIGxvd2VyIHRoYW4gYW55ID4gb3IgPj0gY29tcCBpbiBDLCByZXR1cm4gZmFsc2Vcbi8vICAgLSBJZiBHVCBpcyA+PSwgYW5kIEdULnNlbXZlciBkb2VzIG5vdCBzYXRpc2Z5IGV2ZXJ5IEMsIHJldHVybiBmYWxzZVxuLy8gICAtIElmIEdULnNlbXZlciBoYXMgYSBwcmVyZWxlYXNlLCBhbmQgbm90IGluIHByZXJlbGVhc2UgbW9kZVxuLy8gICAgIC0gSWYgbm8gQyBoYXMgYSBwcmVyZWxlYXNlIGFuZCB0aGUgR1Quc2VtdmVyIHR1cGxlLCByZXR1cm4gZmFsc2Vcbi8vIC0gSWYgTFRcbi8vICAgLSBJZiBMVC5zZW12ZXIgaXMgZ3JlYXRlciB0aGFuIGFueSA8IG9yIDw9IGNvbXAgaW4gQywgcmV0dXJuIGZhbHNlXG4vLyAgIC0gSWYgTFQgaXMgPD0sIGFuZCBMVC5zZW12ZXIgZG9lcyBub3Qgc2F0aXNmeSBldmVyeSBDLCByZXR1cm4gZmFsc2Vcbi8vICAgLSBJZiBHVC5zZW12ZXIgaGFzIGEgcHJlcmVsZWFzZSwgYW5kIG5vdCBpbiBwcmVyZWxlYXNlIG1vZGVcbi8vICAgICAtIElmIG5vIEMgaGFzIGEgcHJlcmVsZWFzZSBhbmQgdGhlIExULnNlbXZlciB0dXBsZSwgcmV0dXJuIGZhbHNlXG4vLyAtIEVsc2UgcmV0dXJuIHRydWVcblxuY29uc3Qgc3Vic2V0JDEgPSAoc3ViLCBkb20sIG9wdGlvbnMgPSB7fSkgPT4ge1xuICBpZiAoc3ViID09PSBkb20pXG4gICAgcmV0dXJuIHRydWVcblxuICBzdWIgPSBuZXcgUmFuZ2UkYihzdWIsIG9wdGlvbnMpO1xuICBkb20gPSBuZXcgUmFuZ2UkYihkb20sIG9wdGlvbnMpO1xuICBsZXQgc2F3Tm9uTnVsbCA9IGZhbHNlO1xuXG4gIE9VVEVSOiBmb3IgKGNvbnN0IHNpbXBsZVN1YiBvZiBzdWIuc2V0KSB7XG4gICAgZm9yIChjb25zdCBzaW1wbGVEb20gb2YgZG9tLnNldCkge1xuICAgICAgY29uc3QgaXNTdWIgPSBzaW1wbGVTdWJzZXQkMShzaW1wbGVTdWIsIHNpbXBsZURvbSwgb3B0aW9ucyk7XG4gICAgICBzYXdOb25OdWxsID0gc2F3Tm9uTnVsbCB8fCBpc1N1YiAhPT0gbnVsbDtcbiAgICAgIGlmIChpc1N1YilcbiAgICAgICAgY29udGludWUgT1VURVJcbiAgICB9XG4gICAgLy8gdGhlIG51bGwgc2V0IGlzIGEgc3Vic2V0IG9mIGV2ZXJ5dGhpbmcsIGJ1dCBudWxsIHNpbXBsZSByYW5nZXMgaW5cbiAgICAvLyBhIGNvbXBsZXggcmFuZ2Ugc2hvdWxkIGJlIGlnbm9yZWQuICBzbyBpZiB3ZSBzYXcgYSBub24tbnVsbCByYW5nZSxcbiAgICAvLyB0aGVuIHdlIGtub3cgdGhpcyBpc24ndCBhIHN1YnNldCwgYnV0IGlmIEVWRVJZIHNpbXBsZSByYW5nZSB3YXMgbnVsbCxcbiAgICAvLyB0aGVuIGl0IGlzIGEgc3Vic2V0LlxuICAgIGlmIChzYXdOb25OdWxsKVxuICAgICAgcmV0dXJuIGZhbHNlXG4gIH1cbiAgcmV0dXJuIHRydWVcbn07XG5cbmNvbnN0IHNpbXBsZVN1YnNldCQxID0gKHN1YiwgZG9tLCBvcHRpb25zKSA9PiB7XG4gIGlmIChzdWIgPT09IGRvbSlcbiAgICByZXR1cm4gdHJ1ZVxuXG4gIGlmIChzdWIubGVuZ3RoID09PSAxICYmIHN1YlswXS5zZW12ZXIgPT09IEFOWSQzKSB7XG4gICAgaWYgKGRvbS5sZW5ndGggPT09IDEgJiYgZG9tWzBdLnNlbXZlciA9PT0gQU5ZJDMpXG4gICAgICByZXR1cm4gdHJ1ZVxuICAgIGVsc2UgaWYgKG9wdGlvbnMuaW5jbHVkZVByZXJlbGVhc2UpXG4gICAgICBzdWIgPSBbIG5ldyBDb21wYXJhdG9yJDQoJz49MC4wLjAtMCcpIF07XG4gICAgZWxzZVxuICAgICAgc3ViID0gWyBuZXcgQ29tcGFyYXRvciQ0KCc+PTAuMC4wJykgXTtcbiAgfVxuXG4gIGlmIChkb20ubGVuZ3RoID09PSAxICYmIGRvbVswXS5zZW12ZXIgPT09IEFOWSQzKSB7XG4gICAgaWYgKG9wdGlvbnMuaW5jbHVkZVByZXJlbGVhc2UpXG4gICAgICByZXR1cm4gdHJ1ZVxuICAgIGVsc2VcbiAgICAgIGRvbSA9IFsgbmV3IENvbXBhcmF0b3IkNCgnPj0wLjAuMCcpIF07XG4gIH1cblxuICBjb25zdCBlcVNldCA9IG5ldyBTZXQoKTtcbiAgbGV0IGd0LCBsdDtcbiAgZm9yIChjb25zdCBjIG9mIHN1Yikge1xuICAgIGlmIChjLm9wZXJhdG9yID09PSAnPicgfHwgYy5vcGVyYXRvciA9PT0gJz49JylcbiAgICAgIGd0ID0gaGlnaGVyR1QkMShndCwgYywgb3B0aW9ucyk7XG4gICAgZWxzZSBpZiAoYy5vcGVyYXRvciA9PT0gJzwnIHx8IGMub3BlcmF0b3IgPT09ICc8PScpXG4gICAgICBsdCA9IGxvd2VyTFQkMShsdCwgYywgb3B0aW9ucyk7XG4gICAgZWxzZVxuICAgICAgZXFTZXQuYWRkKGMuc2VtdmVyKTtcbiAgfVxuXG4gIGlmIChlcVNldC5zaXplID4gMSlcbiAgICByZXR1cm4gbnVsbFxuXG4gIGxldCBndGx0Q29tcDtcbiAgaWYgKGd0ICYmIGx0KSB7XG4gICAgZ3RsdENvbXAgPSBjb21wYXJlJGIoZ3Quc2VtdmVyLCBsdC5zZW12ZXIsIG9wdGlvbnMpO1xuICAgIGlmIChndGx0Q29tcCA+IDApXG4gICAgICByZXR1cm4gbnVsbFxuICAgIGVsc2UgaWYgKGd0bHRDb21wID09PSAwICYmIChndC5vcGVyYXRvciAhPT0gJz49JyB8fCBsdC5vcGVyYXRvciAhPT0gJzw9JykpXG4gICAgICByZXR1cm4gbnVsbFxuICB9XG5cbiAgLy8gd2lsbCBpdGVyYXRlIG9uZSBvciB6ZXJvIHRpbWVzXG4gIGZvciAoY29uc3QgZXEgb2YgZXFTZXQpIHtcbiAgICBpZiAoZ3QgJiYgIXNhdGlzZmllcyQ0KGVxLCBTdHJpbmcoZ3QpLCBvcHRpb25zKSlcbiAgICAgIHJldHVybiBudWxsXG5cbiAgICBpZiAobHQgJiYgIXNhdGlzZmllcyQ0KGVxLCBTdHJpbmcobHQpLCBvcHRpb25zKSlcbiAgICAgIHJldHVybiBudWxsXG5cbiAgICBmb3IgKGNvbnN0IGMgb2YgZG9tKSB7XG4gICAgICBpZiAoIXNhdGlzZmllcyQ0KGVxLCBTdHJpbmcoYyksIG9wdGlvbnMpKVxuICAgICAgICByZXR1cm4gZmFsc2VcbiAgICB9XG5cbiAgICByZXR1cm4gdHJ1ZVxuICB9XG5cbiAgbGV0IGhpZ2hlciwgbG93ZXI7XG4gIGxldCBoYXNEb21MVCwgaGFzRG9tR1Q7XG4gIC8vIGlmIHRoZSBzdWJzZXQgaGFzIGEgcHJlcmVsZWFzZSwgd2UgbmVlZCBhIGNvbXBhcmF0b3IgaW4gdGhlIHN1cGVyc2V0XG4gIC8vIHdpdGggdGhlIHNhbWUgdHVwbGUgYW5kIGEgcHJlcmVsZWFzZSwgb3IgaXQncyBub3QgYSBzdWJzZXRcbiAgbGV0IG5lZWREb21MVFByZSA9IGx0ICYmXG4gICAgIW9wdGlvbnMuaW5jbHVkZVByZXJlbGVhc2UgJiZcbiAgICBsdC5zZW12ZXIucHJlcmVsZWFzZS5sZW5ndGggPyBsdC5zZW12ZXIgOiBmYWxzZTtcbiAgbGV0IG5lZWREb21HVFByZSA9IGd0ICYmXG4gICAgIW9wdGlvbnMuaW5jbHVkZVByZXJlbGVhc2UgJiZcbiAgICBndC5zZW12ZXIucHJlcmVsZWFzZS5sZW5ndGggPyBndC5zZW12ZXIgOiBmYWxzZTtcbiAgLy8gZXhjZXB0aW9uOiA8MS4yLjMtMCBpcyB0aGUgc2FtZSBhcyA8MS4yLjNcbiAgaWYgKG5lZWREb21MVFByZSAmJiBuZWVkRG9tTFRQcmUucHJlcmVsZWFzZS5sZW5ndGggPT09IDEgJiZcbiAgICAgIGx0Lm9wZXJhdG9yID09PSAnPCcgJiYgbmVlZERvbUxUUHJlLnByZXJlbGVhc2VbMF0gPT09IDApIHtcbiAgICBuZWVkRG9tTFRQcmUgPSBmYWxzZTtcbiAgfVxuXG4gIGZvciAoY29uc3QgYyBvZiBkb20pIHtcbiAgICBoYXNEb21HVCA9IGhhc0RvbUdUIHx8IGMub3BlcmF0b3IgPT09ICc+JyB8fCBjLm9wZXJhdG9yID09PSAnPj0nO1xuICAgIGhhc0RvbUxUID0gaGFzRG9tTFQgfHwgYy5vcGVyYXRvciA9PT0gJzwnIHx8IGMub3BlcmF0b3IgPT09ICc8PSc7XG4gICAgaWYgKGd0KSB7XG4gICAgICBpZiAobmVlZERvbUdUUHJlKSB7XG4gICAgICAgIGlmIChjLnNlbXZlci5wcmVyZWxlYXNlICYmIGMuc2VtdmVyLnByZXJlbGVhc2UubGVuZ3RoICYmXG4gICAgICAgICAgICBjLnNlbXZlci5tYWpvciA9PT0gbmVlZERvbUdUUHJlLm1ham9yICYmXG4gICAgICAgICAgICBjLnNlbXZlci5taW5vciA9PT0gbmVlZERvbUdUUHJlLm1pbm9yICYmXG4gICAgICAgICAgICBjLnNlbXZlci5wYXRjaCA9PT0gbmVlZERvbUdUUHJlLnBhdGNoKSB7XG4gICAgICAgICAgbmVlZERvbUdUUHJlID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGlmIChjLm9wZXJhdG9yID09PSAnPicgfHwgYy5vcGVyYXRvciA9PT0gJz49Jykge1xuICAgICAgICBoaWdoZXIgPSBoaWdoZXJHVCQxKGd0LCBjLCBvcHRpb25zKTtcbiAgICAgICAgaWYgKGhpZ2hlciA9PT0gYyAmJiBoaWdoZXIgIT09IGd0KVxuICAgICAgICAgIHJldHVybiBmYWxzZVxuICAgICAgfSBlbHNlIGlmIChndC5vcGVyYXRvciA9PT0gJz49JyAmJiAhc2F0aXNmaWVzJDQoZ3Quc2VtdmVyLCBTdHJpbmcoYyksIG9wdGlvbnMpKVxuICAgICAgICByZXR1cm4gZmFsc2VcbiAgICB9XG4gICAgaWYgKGx0KSB7XG4gICAgICBpZiAobmVlZERvbUxUUHJlKSB7XG4gICAgICAgIGlmIChjLnNlbXZlci5wcmVyZWxlYXNlICYmIGMuc2VtdmVyLnByZXJlbGVhc2UubGVuZ3RoICYmXG4gICAgICAgICAgICBjLnNlbXZlci5tYWpvciA9PT0gbmVlZERvbUxUUHJlLm1ham9yICYmXG4gICAgICAgICAgICBjLnNlbXZlci5taW5vciA9PT0gbmVlZERvbUxUUHJlLm1pbm9yICYmXG4gICAgICAgICAgICBjLnNlbXZlci5wYXRjaCA9PT0gbmVlZERvbUxUUHJlLnBhdGNoKSB7XG4gICAgICAgICAgbmVlZERvbUxUUHJlID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGlmIChjLm9wZXJhdG9yID09PSAnPCcgfHwgYy5vcGVyYXRvciA9PT0gJzw9Jykge1xuICAgICAgICBsb3dlciA9IGxvd2VyTFQkMShsdCwgYywgb3B0aW9ucyk7XG4gICAgICAgIGlmIChsb3dlciA9PT0gYyAmJiBsb3dlciAhPT0gbHQpXG4gICAgICAgICAgcmV0dXJuIGZhbHNlXG4gICAgICB9IGVsc2UgaWYgKGx0Lm9wZXJhdG9yID09PSAnPD0nICYmICFzYXRpc2ZpZXMkNChsdC5zZW12ZXIsIFN0cmluZyhjKSwgb3B0aW9ucykpXG4gICAgICAgIHJldHVybiBmYWxzZVxuICAgIH1cbiAgICBpZiAoIWMub3BlcmF0b3IgJiYgKGx0IHx8IGd0KSAmJiBndGx0Q29tcCAhPT0gMClcbiAgICAgIHJldHVybiBmYWxzZVxuICB9XG5cbiAgLy8gaWYgdGhlcmUgd2FzIGEgPCBvciA+LCBhbmQgbm90aGluZyBpbiB0aGUgZG9tLCB0aGVuIG11c3QgYmUgZmFsc2VcbiAgLy8gVU5MRVNTIGl0IHdhcyBsaW1pdGVkIGJ5IGFub3RoZXIgcmFuZ2UgaW4gdGhlIG90aGVyIGRpcmVjdGlvbi5cbiAgLy8gRWcsID4xLjAuMCA8MS4wLjEgaXMgc3RpbGwgYSBzdWJzZXQgb2YgPDIuMC4wXG4gIGlmIChndCAmJiBoYXNEb21MVCAmJiAhbHQgJiYgZ3RsdENvbXAgIT09IDApXG4gICAgcmV0dXJuIGZhbHNlXG5cbiAgaWYgKGx0ICYmIGhhc0RvbUdUICYmICFndCAmJiBndGx0Q29tcCAhPT0gMClcbiAgICByZXR1cm4gZmFsc2VcblxuICAvLyB3ZSBuZWVkZWQgYSBwcmVyZWxlYXNlIHJhbmdlIGluIGEgc3BlY2lmaWMgdHVwbGUsIGJ1dCBkaWRuJ3QgZ2V0IG9uZVxuICAvLyB0aGVuIHRoaXMgaXNuJ3QgYSBzdWJzZXQuICBlZyA+PTEuMi4zLXByZSBpcyBub3QgYSBzdWJzZXQgb2YgPj0xLjAuMCxcbiAgLy8gYmVjYXVzZSBpdCBpbmNsdWRlcyBwcmVyZWxlYXNlcyBpbiB0aGUgMS4yLjMgdHVwbGVcbiAgaWYgKG5lZWREb21HVFByZSB8fCBuZWVkRG9tTFRQcmUpXG4gICAgcmV0dXJuIGZhbHNlXG5cbiAgcmV0dXJuIHRydWVcbn07XG5cbi8vID49MS4yLjMgaXMgbG93ZXIgdGhhbiA+MS4yLjNcbmNvbnN0IGhpZ2hlckdUJDEgPSAoYSwgYiwgb3B0aW9ucykgPT4ge1xuICBpZiAoIWEpXG4gICAgcmV0dXJuIGJcbiAgY29uc3QgY29tcCA9IGNvbXBhcmUkYihhLnNlbXZlciwgYi5zZW12ZXIsIG9wdGlvbnMpO1xuICByZXR1cm4gY29tcCA+IDAgPyBhXG4gICAgOiBjb21wIDwgMCA/IGJcbiAgICA6IGIub3BlcmF0b3IgPT09ICc+JyAmJiBhLm9wZXJhdG9yID09PSAnPj0nID8gYlxuICAgIDogYVxufTtcblxuLy8gPD0xLjIuMyBpcyBoaWdoZXIgdGhhbiA8MS4yLjNcbmNvbnN0IGxvd2VyTFQkMSA9IChhLCBiLCBvcHRpb25zKSA9PiB7XG4gIGlmICghYSlcbiAgICByZXR1cm4gYlxuICBjb25zdCBjb21wID0gY29tcGFyZSRiKGEuc2VtdmVyLCBiLnNlbXZlciwgb3B0aW9ucyk7XG4gIHJldHVybiBjb21wIDwgMCA/IGFcbiAgICA6IGNvbXAgPiAwID8gYlxuICAgIDogYi5vcGVyYXRvciA9PT0gJzwnICYmIGEub3BlcmF0b3IgPT09ICc8PScgPyBiXG4gICAgOiBhXG59O1xuXG52YXIgc3Vic2V0XzEkMSA9IHN1YnNldCQxO1xuXG4vLyBqdXN0IHByZS1sb2FkIGFsbCB0aGUgc3R1ZmYgdGhhdCBpbmRleC5qcyBsYXppbHkgZXhwb3J0c1xuY29uc3QgaW50ZXJuYWxSZSQxID0gcmUkYi5leHBvcnRzO1xudmFyIHNlbXZlciQ0ID0ge1xuICByZTogaW50ZXJuYWxSZSQxLnJlLFxuICBzcmM6IGludGVybmFsUmUkMS5zcmMsXG4gIHRva2VuczogaW50ZXJuYWxSZSQxLnQsXG4gIFNFTVZFUl9TUEVDX1ZFUlNJT046IGNvbnN0YW50cyQxLlNFTVZFUl9TUEVDX1ZFUlNJT04sXG4gIFNlbVZlcjogc2VtdmVyJDUsXG4gIGNvbXBhcmVJZGVudGlmaWVyczogaWRlbnRpZmllcnMkMS5jb21wYXJlSWRlbnRpZmllcnMsXG4gIHJjb21wYXJlSWRlbnRpZmllcnM6IGlkZW50aWZpZXJzJDEucmNvbXBhcmVJZGVudGlmaWVycyxcbiAgcGFyc2U6IHBhcnNlXzEkMSxcbiAgdmFsaWQ6IHZhbGlkXzEkMSxcbiAgY2xlYW46IGNsZWFuXzEkMSxcbiAgaW5jOiBpbmNfMSQxLFxuICBkaWZmOiBkaWZmXzEkMSxcbiAgbWFqb3I6IG1ham9yXzEkMSxcbiAgbWlub3I6IG1pbm9yXzEkMSxcbiAgcGF0Y2g6IHBhdGNoXzEkMSxcbiAgcHJlcmVsZWFzZTogcHJlcmVsZWFzZV8xJDEsXG4gIGNvbXBhcmU6IGNvbXBhcmVfMSQxLFxuICByY29tcGFyZTogcmNvbXBhcmVfMSQxLFxuICBjb21wYXJlTG9vc2U6IGNvbXBhcmVMb29zZV8xJDEsXG4gIGNvbXBhcmVCdWlsZDogY29tcGFyZUJ1aWxkXzEkMSxcbiAgc29ydDogc29ydF8xJDEsXG4gIHJzb3J0OiByc29ydF8xJDEsXG4gIGd0OiBndF8xJDEsXG4gIGx0OiBsdF8xJDEsXG4gIGVxOiBlcV8xJDEsXG4gIG5lcTogbmVxXzEkMSxcbiAgZ3RlOiBndGVfMSQxLFxuICBsdGU6IGx0ZV8xJDEsXG4gIGNtcDogY21wXzEkMSxcbiAgY29lcmNlOiBjb2VyY2VfMSQxLFxuICBDb21wYXJhdG9yOiBjb21wYXJhdG9yJDEsXG4gIFJhbmdlOiByYW5nZSQxLFxuICBzYXRpc2ZpZXM6IHNhdGlzZmllc18xJDEsXG4gIHRvQ29tcGFyYXRvcnM6IHRvQ29tcGFyYXRvcnNfMSQxLFxuICBtYXhTYXRpc2Z5aW5nOiBtYXhTYXRpc2Z5aW5nXzEkMSxcbiAgbWluU2F0aXNmeWluZzogbWluU2F0aXNmeWluZ18xJDEsXG4gIG1pblZlcnNpb246IG1pblZlcnNpb25fMSQxLFxuICB2YWxpZFJhbmdlOiB2YWxpZCQyLFxuICBvdXRzaWRlOiBvdXRzaWRlXzEkMSxcbiAgZ3RyOiBndHJfMSQxLFxuICBsdHI6IGx0cl8xJDEsXG4gIGludGVyc2VjdHM6IGludGVyc2VjdHNfMSQxLFxuICBzaW1wbGlmeVJhbmdlOiBzaW1wbGlmeSQxLFxuICBzdWJzZXQ6IHN1YnNldF8xJDEsXG59O1xuXG52YXIgc2VtdmVyJDMgPSBzZW12ZXIkNDtcblxudmFyIGJ1aWx0aW5zJDEgPSBmdW5jdGlvbiAoe1xuICB2ZXJzaW9uID0gcHJvY2Vzcy52ZXJzaW9uLFxuICBleHBlcmltZW50YWwgPSBmYWxzZVxufSA9IHt9KSB7XG4gIHZhciBjb3JlTW9kdWxlcyA9IFtcbiAgICAnYXNzZXJ0JyxcbiAgICAnYnVmZmVyJyxcbiAgICAnY2hpbGRfcHJvY2VzcycsXG4gICAgJ2NsdXN0ZXInLFxuICAgICdjb25zb2xlJyxcbiAgICAnY29uc3RhbnRzJyxcbiAgICAnY3J5cHRvJyxcbiAgICAnZGdyYW0nLFxuICAgICdkbnMnLFxuICAgICdkb21haW4nLFxuICAgICdldmVudHMnLFxuICAgICdmcycsXG4gICAgJ2h0dHAnLFxuICAgICdodHRwcycsXG4gICAgJ21vZHVsZScsXG4gICAgJ25ldCcsXG4gICAgJ29zJyxcbiAgICAncGF0aCcsXG4gICAgJ3B1bnljb2RlJyxcbiAgICAncXVlcnlzdHJpbmcnLFxuICAgICdyZWFkbGluZScsXG4gICAgJ3JlcGwnLFxuICAgICdzdHJlYW0nLFxuICAgICdzdHJpbmdfZGVjb2RlcicsXG4gICAgJ3N5cycsXG4gICAgJ3RpbWVycycsXG4gICAgJ3RscycsXG4gICAgJ3R0eScsXG4gICAgJ3VybCcsXG4gICAgJ3V0aWwnLFxuICAgICd2bScsXG4gICAgJ3psaWInXG4gIF07XG5cbiAgaWYgKHNlbXZlciQzLmx0KHZlcnNpb24sICc2LjAuMCcpKSBjb3JlTW9kdWxlcy5wdXNoKCdmcmVlbGlzdCcpO1xuICBpZiAoc2VtdmVyJDMuZ3RlKHZlcnNpb24sICcxLjAuMCcpKSBjb3JlTW9kdWxlcy5wdXNoKCd2OCcpO1xuICBpZiAoc2VtdmVyJDMuZ3RlKHZlcnNpb24sICcxLjEuMCcpKSBjb3JlTW9kdWxlcy5wdXNoKCdwcm9jZXNzJyk7XG4gIGlmIChzZW12ZXIkMy5ndGUodmVyc2lvbiwgJzguMC4wJykpIGNvcmVNb2R1bGVzLnB1c2goJ2luc3BlY3RvcicpO1xuICBpZiAoc2VtdmVyJDMuZ3RlKHZlcnNpb24sICc4LjEuMCcpKSBjb3JlTW9kdWxlcy5wdXNoKCdhc3luY19ob29rcycpO1xuICBpZiAoc2VtdmVyJDMuZ3RlKHZlcnNpb24sICc4LjQuMCcpKSBjb3JlTW9kdWxlcy5wdXNoKCdodHRwMicpO1xuICBpZiAoc2VtdmVyJDMuZ3RlKHZlcnNpb24sICc4LjUuMCcpKSBjb3JlTW9kdWxlcy5wdXNoKCdwZXJmX2hvb2tzJyk7XG4gIGlmIChzZW12ZXIkMy5ndGUodmVyc2lvbiwgJzEwLjAuMCcpKSBjb3JlTW9kdWxlcy5wdXNoKCd0cmFjZV9ldmVudHMnKTtcblxuICBpZiAoXG4gICAgc2VtdmVyJDMuZ3RlKHZlcnNpb24sICcxMC41LjAnKSAmJlxuICAgIChleHBlcmltZW50YWwgfHwgc2VtdmVyJDMuZ3RlKHZlcnNpb24sICcxMi4wLjAnKSlcbiAgKSB7XG4gICAgY29yZU1vZHVsZXMucHVzaCgnd29ya2VyX3RocmVhZHMnKTtcbiAgfVxuICBpZiAoc2VtdmVyJDMuZ3RlKHZlcnNpb24sICcxMi4xNi4wJykgJiYgZXhwZXJpbWVudGFsKSB7XG4gICAgY29yZU1vZHVsZXMucHVzaCgnd2FzaScpO1xuICB9XG4gIFxuICByZXR1cm4gY29yZU1vZHVsZXNcbn07XG5cbi8vIE1hbnVhbGx5IOKAnHRyZWUgc2hha2Vu4oCdIGZyb206XG5cbmNvbnN0IHJlYWRlciQxID0ge3JlYWQ6IHJlYWQkMX07XG5jb25zdCBwYWNrYWdlSnNvblJlYWRlciQxID0gcmVhZGVyJDE7XG5cbi8qKlxuICogQHBhcmFtIHtzdHJpbmd9IGpzb25QYXRoXG4gKiBAcmV0dXJucyB7e3N0cmluZzogc3RyaW5nfX1cbiAqL1xuZnVuY3Rpb24gcmVhZCQxKGpzb25QYXRoKSB7XG4gIHJldHVybiBmaW5kJDEocGF0aC5kaXJuYW1lKGpzb25QYXRoKSlcbn1cblxuLyoqXG4gKiBAcGFyYW0ge3N0cmluZ30gZGlyXG4gKiBAcmV0dXJucyB7e3N0cmluZzogc3RyaW5nfX1cbiAqL1xuZnVuY3Rpb24gZmluZCQxKGRpcikge1xuICB0cnkge1xuICAgIGNvbnN0IHN0cmluZyA9IGZzLnJlYWRGaWxlU3luYyhcbiAgICAgIHBhdGgudG9OYW1lc3BhY2VkUGF0aChwYXRoLmpvaW4oZGlyLCAncGFja2FnZS5qc29uJykpLFxuICAgICAgJ3V0ZjgnXG4gICAgKTtcbiAgICByZXR1cm4ge3N0cmluZ31cbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBpZiAoZXJyb3IuY29kZSA9PT0gJ0VOT0VOVCcpIHtcbiAgICAgIGNvbnN0IHBhcmVudCA9IHBhdGguZGlybmFtZShkaXIpO1xuICAgICAgaWYgKGRpciAhPT0gcGFyZW50KSByZXR1cm4gZmluZCQxKHBhcmVudClcbiAgICAgIHJldHVybiB7c3RyaW5nOiB1bmRlZmluZWR9XG4gICAgICAvLyBUaHJvdyBhbGwgb3RoZXIgZXJyb3JzLlxuICAgICAgLyogYzggaWdub3JlIG5leHQgNCAqL1xuICAgIH1cblxuICAgIHRocm93IGVycm9yXG4gIH1cbn1cblxuLy8gTWFudWFsbHkg4oCcdHJlZSBzaGFrZW7igJ0gZnJvbTpcblxuY29uc3QgaXNXaW5kb3dzJDEgPSBwcm9jZXNzLnBsYXRmb3JtID09PSAnd2luMzInO1xuXG5jb25zdCBvd24kMyA9IHt9Lmhhc093blByb3BlcnR5O1xuXG5jb25zdCBjb2RlcyQxID0ge307XG5cbi8qKlxuICogQHR5cGVkZWYgeyguLi5hcmdzOiB1bmtub3duW10pID0+IHN0cmluZ30gTWVzc2FnZUZ1bmN0aW9uXG4gKi9cblxuLyoqIEB0eXBlIHtNYXA8c3RyaW5nLCBNZXNzYWdlRnVuY3Rpb258c3RyaW5nPn0gKi9cbmNvbnN0IG1lc3NhZ2VzJDEgPSBuZXcgTWFwKCk7XG5jb25zdCBub2RlSW50ZXJuYWxQcmVmaXgkMSA9ICdfX25vZGVfaW50ZXJuYWxfJztcbi8qKiBAdHlwZSB7bnVtYmVyfSAqL1xubGV0IHVzZXJTdGFja1RyYWNlTGltaXQkMTtcblxuY29kZXMkMS5FUlJfSU5WQUxJRF9NT0RVTEVfU1BFQ0lGSUVSID0gY3JlYXRlRXJyb3IkMShcbiAgJ0VSUl9JTlZBTElEX01PRFVMRV9TUEVDSUZJRVInLFxuICAvKipcbiAgICogQHBhcmFtIHtzdHJpbmd9IHJlcXVlc3RcbiAgICogQHBhcmFtIHtzdHJpbmd9IHJlYXNvblxuICAgKiBAcGFyYW0ge3N0cmluZ30gW2Jhc2VdXG4gICAqL1xuICAocmVxdWVzdCwgcmVhc29uLCBiYXNlID0gdW5kZWZpbmVkKSA9PiB7XG4gICAgcmV0dXJuIGBJbnZhbGlkIG1vZHVsZSBcIiR7cmVxdWVzdH1cIiAke3JlYXNvbn0ke1xuICAgICAgYmFzZSA/IGAgaW1wb3J0ZWQgZnJvbSAke2Jhc2V9YCA6ICcnXG4gICAgfWBcbiAgfSxcbiAgVHlwZUVycm9yXG4pO1xuXG5jb2RlcyQxLkVSUl9JTlZBTElEX1BBQ0tBR0VfQ09ORklHID0gY3JlYXRlRXJyb3IkMShcbiAgJ0VSUl9JTlZBTElEX1BBQ0tBR0VfQ09ORklHJyxcbiAgLyoqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBwYXRoXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBbYmFzZV1cbiAgICogQHBhcmFtIHtzdHJpbmd9IFttZXNzYWdlXVxuICAgKi9cbiAgKHBhdGgsIGJhc2UsIG1lc3NhZ2UpID0+IHtcbiAgICByZXR1cm4gYEludmFsaWQgcGFja2FnZSBjb25maWcgJHtwYXRofSR7XG4gICAgICBiYXNlID8gYCB3aGlsZSBpbXBvcnRpbmcgJHtiYXNlfWAgOiAnJ1xuICAgIH0ke21lc3NhZ2UgPyBgLiAke21lc3NhZ2V9YCA6ICcnfWBcbiAgfSxcbiAgRXJyb3Jcbik7XG5cbmNvZGVzJDEuRVJSX0lOVkFMSURfUEFDS0FHRV9UQVJHRVQgPSBjcmVhdGVFcnJvciQxKFxuICAnRVJSX0lOVkFMSURfUEFDS0FHRV9UQVJHRVQnLFxuICAvKipcbiAgICogQHBhcmFtIHtzdHJpbmd9IHBrZ1BhdGhcbiAgICogQHBhcmFtIHtzdHJpbmd9IGtleVxuICAgKiBAcGFyYW0ge3Vua25vd259IHRhcmdldFxuICAgKiBAcGFyYW0ge2Jvb2xlYW59IFtpc0ltcG9ydD1mYWxzZV1cbiAgICogQHBhcmFtIHtzdHJpbmd9IFtiYXNlXVxuICAgKi9cbiAgKHBrZ1BhdGgsIGtleSwgdGFyZ2V0LCBpc0ltcG9ydCA9IGZhbHNlLCBiYXNlID0gdW5kZWZpbmVkKSA9PiB7XG4gICAgY29uc3QgcmVsRXJyb3IgPVxuICAgICAgdHlwZW9mIHRhcmdldCA9PT0gJ3N0cmluZycgJiZcbiAgICAgICFpc0ltcG9ydCAmJlxuICAgICAgdGFyZ2V0Lmxlbmd0aCA+IDAgJiZcbiAgICAgICF0YXJnZXQuc3RhcnRzV2l0aCgnLi8nKTtcbiAgICBpZiAoa2V5ID09PSAnLicpIHtcbiAgICAgIGFzc2VydChpc0ltcG9ydCA9PT0gZmFsc2UpO1xuICAgICAgcmV0dXJuIChcbiAgICAgICAgYEludmFsaWQgXCJleHBvcnRzXCIgbWFpbiB0YXJnZXQgJHtKU09OLnN0cmluZ2lmeSh0YXJnZXQpfSBkZWZpbmVkIGAgK1xuICAgICAgICBgaW4gdGhlIHBhY2thZ2UgY29uZmlnICR7cGtnUGF0aH1wYWNrYWdlLmpzb24ke1xuICAgICAgICAgIGJhc2UgPyBgIGltcG9ydGVkIGZyb20gJHtiYXNlfWAgOiAnJ1xuICAgICAgICB9JHtyZWxFcnJvciA/ICc7IHRhcmdldHMgbXVzdCBzdGFydCB3aXRoIFwiLi9cIicgOiAnJ31gXG4gICAgICApXG4gICAgfVxuXG4gICAgcmV0dXJuIGBJbnZhbGlkIFwiJHtcbiAgICAgIGlzSW1wb3J0ID8gJ2ltcG9ydHMnIDogJ2V4cG9ydHMnXG4gICAgfVwiIHRhcmdldCAke0pTT04uc3RyaW5naWZ5KFxuICAgICAgdGFyZ2V0XG4gICAgKX0gZGVmaW5lZCBmb3IgJyR7a2V5fScgaW4gdGhlIHBhY2thZ2UgY29uZmlnICR7cGtnUGF0aH1wYWNrYWdlLmpzb24ke1xuICAgICAgYmFzZSA/IGAgaW1wb3J0ZWQgZnJvbSAke2Jhc2V9YCA6ICcnXG4gICAgfSR7cmVsRXJyb3IgPyAnOyB0YXJnZXRzIG11c3Qgc3RhcnQgd2l0aCBcIi4vXCInIDogJyd9YFxuICB9LFxuICBFcnJvclxuKTtcblxuY29kZXMkMS5FUlJfTU9EVUxFX05PVF9GT1VORCA9IGNyZWF0ZUVycm9yJDEoXG4gICdFUlJfTU9EVUxFX05PVF9GT1VORCcsXG4gIC8qKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gcGF0aFxuICAgKiBAcGFyYW0ge3N0cmluZ30gYmFzZVxuICAgKiBAcGFyYW0ge3N0cmluZ30gW3R5cGVdXG4gICAqL1xuICAocGF0aCwgYmFzZSwgdHlwZSA9ICdwYWNrYWdlJykgPT4ge1xuICAgIHJldHVybiBgQ2Fubm90IGZpbmQgJHt0eXBlfSAnJHtwYXRofScgaW1wb3J0ZWQgZnJvbSAke2Jhc2V9YFxuICB9LFxuICBFcnJvclxuKTtcblxuY29kZXMkMS5FUlJfUEFDS0FHRV9JTVBPUlRfTk9UX0RFRklORUQgPSBjcmVhdGVFcnJvciQxKFxuICAnRVJSX1BBQ0tBR0VfSU1QT1JUX05PVF9ERUZJTkVEJyxcbiAgLyoqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBzcGVjaWZpZXJcbiAgICogQHBhcmFtIHtzdHJpbmd9IHBhY2thZ2VQYXRoXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBiYXNlXG4gICAqL1xuICAoc3BlY2lmaWVyLCBwYWNrYWdlUGF0aCwgYmFzZSkgPT4ge1xuICAgIHJldHVybiBgUGFja2FnZSBpbXBvcnQgc3BlY2lmaWVyIFwiJHtzcGVjaWZpZXJ9XCIgaXMgbm90IGRlZmluZWQke1xuICAgICAgcGFja2FnZVBhdGggPyBgIGluIHBhY2thZ2UgJHtwYWNrYWdlUGF0aH1wYWNrYWdlLmpzb25gIDogJydcbiAgICB9IGltcG9ydGVkIGZyb20gJHtiYXNlfWBcbiAgfSxcbiAgVHlwZUVycm9yXG4pO1xuXG5jb2RlcyQxLkVSUl9QQUNLQUdFX1BBVEhfTk9UX0VYUE9SVEVEID0gY3JlYXRlRXJyb3IkMShcbiAgJ0VSUl9QQUNLQUdFX1BBVEhfTk9UX0VYUE9SVEVEJyxcbiAgLyoqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBwa2dQYXRoXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBzdWJwYXRoXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBbYmFzZV1cbiAgICovXG4gIChwa2dQYXRoLCBzdWJwYXRoLCBiYXNlID0gdW5kZWZpbmVkKSA9PiB7XG4gICAgaWYgKHN1YnBhdGggPT09ICcuJylcbiAgICAgIHJldHVybiBgTm8gXCJleHBvcnRzXCIgbWFpbiBkZWZpbmVkIGluICR7cGtnUGF0aH1wYWNrYWdlLmpzb24ke1xuICAgICAgICBiYXNlID8gYCBpbXBvcnRlZCBmcm9tICR7YmFzZX1gIDogJydcbiAgICAgIH1gXG4gICAgcmV0dXJuIGBQYWNrYWdlIHN1YnBhdGggJyR7c3VicGF0aH0nIGlzIG5vdCBkZWZpbmVkIGJ5IFwiZXhwb3J0c1wiIGluICR7cGtnUGF0aH1wYWNrYWdlLmpzb24ke1xuICAgICAgYmFzZSA/IGAgaW1wb3J0ZWQgZnJvbSAke2Jhc2V9YCA6ICcnXG4gICAgfWBcbiAgfSxcbiAgRXJyb3Jcbik7XG5cbmNvZGVzJDEuRVJSX1VOU1VQUE9SVEVEX0RJUl9JTVBPUlQgPSBjcmVhdGVFcnJvciQxKFxuICAnRVJSX1VOU1VQUE9SVEVEX0RJUl9JTVBPUlQnLFxuICBcIkRpcmVjdG9yeSBpbXBvcnQgJyVzJyBpcyBub3Qgc3VwcG9ydGVkIFwiICtcbiAgICAncmVzb2x2aW5nIEVTIG1vZHVsZXMgaW1wb3J0ZWQgZnJvbSAlcycsXG4gIEVycm9yXG4pO1xuXG5jb2RlcyQxLkVSUl9VTktOT1dOX0ZJTEVfRVhURU5TSU9OID0gY3JlYXRlRXJyb3IkMShcbiAgJ0VSUl9VTktOT1dOX0ZJTEVfRVhURU5TSU9OJyxcbiAgJ1Vua25vd24gZmlsZSBleHRlbnNpb24gXCIlc1wiIGZvciAlcycsXG4gIFR5cGVFcnJvclxuKTtcblxuY29kZXMkMS5FUlJfSU5WQUxJRF9BUkdfVkFMVUUgPSBjcmVhdGVFcnJvciQxKFxuICAnRVJSX0lOVkFMSURfQVJHX1ZBTFVFJyxcbiAgLyoqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBuYW1lXG4gICAqIEBwYXJhbSB7dW5rbm93bn0gdmFsdWVcbiAgICogQHBhcmFtIHtzdHJpbmd9IFtyZWFzb249J2lzIGludmFsaWQnXVxuICAgKi9cbiAgKG5hbWUsIHZhbHVlLCByZWFzb24gPSAnaXMgaW52YWxpZCcpID0+IHtcbiAgICBsZXQgaW5zcGVjdGVkID0gaW5zcGVjdCh2YWx1ZSk7XG5cbiAgICBpZiAoaW5zcGVjdGVkLmxlbmd0aCA+IDEyOCkge1xuICAgICAgaW5zcGVjdGVkID0gYCR7aW5zcGVjdGVkLnNsaWNlKDAsIDEyOCl9Li4uYDtcbiAgICB9XG5cbiAgICBjb25zdCB0eXBlID0gbmFtZS5pbmNsdWRlcygnLicpID8gJ3Byb3BlcnR5JyA6ICdhcmd1bWVudCc7XG5cbiAgICByZXR1cm4gYFRoZSAke3R5cGV9ICcke25hbWV9JyAke3JlYXNvbn0uIFJlY2VpdmVkICR7aW5zcGVjdGVkfWBcbiAgfSxcbiAgVHlwZUVycm9yXG4gIC8vIE5vdGU6IGV4dHJhIGNsYXNzZXMgaGF2ZSBiZWVuIHNoYWtlbiBvdXQuXG4gIC8vICwgUmFuZ2VFcnJvclxuKTtcblxuY29kZXMkMS5FUlJfVU5TVVBQT1JURURfRVNNX1VSTF9TQ0hFTUUgPSBjcmVhdGVFcnJvciQxKFxuICAnRVJSX1VOU1VQUE9SVEVEX0VTTV9VUkxfU0NIRU1FJyxcbiAgLyoqXG4gICAqIEBwYXJhbSB7VVJMfSB1cmxcbiAgICovXG4gICh1cmwpID0+IHtcbiAgICBsZXQgbWVzc2FnZSA9XG4gICAgICAnT25seSBmaWxlIGFuZCBkYXRhIFVSTHMgYXJlIHN1cHBvcnRlZCBieSB0aGUgZGVmYXVsdCBFU00gbG9hZGVyJztcblxuICAgIGlmIChpc1dpbmRvd3MkMSAmJiB1cmwucHJvdG9jb2wubGVuZ3RoID09PSAyKSB7XG4gICAgICBtZXNzYWdlICs9ICcuIE9uIFdpbmRvd3MsIGFic29sdXRlIHBhdGhzIG11c3QgYmUgdmFsaWQgZmlsZTovLyBVUkxzJztcbiAgICB9XG5cbiAgICBtZXNzYWdlICs9IGAuIFJlY2VpdmVkIHByb3RvY29sICcke3VybC5wcm90b2NvbH0nYDtcbiAgICByZXR1cm4gbWVzc2FnZVxuICB9LFxuICBFcnJvclxuKTtcblxuLyoqXG4gKiBVdGlsaXR5IGZ1bmN0aW9uIGZvciByZWdpc3RlcmluZyB0aGUgZXJyb3IgY29kZXMuIE9ubHkgdXNlZCBoZXJlLiBFeHBvcnRlZFxuICogKm9ubHkqIHRvIGFsbG93IGZvciB0ZXN0aW5nLlxuICogQHBhcmFtIHtzdHJpbmd9IHN5bVxuICogQHBhcmFtIHtNZXNzYWdlRnVuY3Rpb258c3RyaW5nfSB2YWx1ZVxuICogQHBhcmFtIHtFcnJvckNvbnN0cnVjdG9yfSBkZWZcbiAqIEByZXR1cm5zIHtuZXcgKC4uLmFyZ3M6IHVua25vd25bXSkgPT4gRXJyb3J9XG4gKi9cbmZ1bmN0aW9uIGNyZWF0ZUVycm9yJDEoc3ltLCB2YWx1ZSwgZGVmKSB7XG4gIC8vIFNwZWNpYWwgY2FzZSBmb3IgU3lzdGVtRXJyb3IgdGhhdCBmb3JtYXRzIHRoZSBlcnJvciBtZXNzYWdlIGRpZmZlcmVudGx5XG4gIC8vIFRoZSBTeXN0ZW1FcnJvcnMgb25seSBoYXZlIFN5c3RlbUVycm9yIGFzIHRoZWlyIGJhc2UgY2xhc3Nlcy5cbiAgbWVzc2FnZXMkMS5zZXQoc3ltLCB2YWx1ZSk7XG5cbiAgcmV0dXJuIG1ha2VOb2RlRXJyb3JXaXRoQ29kZSQxKGRlZiwgc3ltKVxufVxuXG4vKipcbiAqIEBwYXJhbSB7RXJyb3JDb25zdHJ1Y3Rvcn0gQmFzZVxuICogQHBhcmFtIHtzdHJpbmd9IGtleVxuICogQHJldHVybnMge0Vycm9yQ29uc3RydWN0b3J9XG4gKi9cbmZ1bmN0aW9uIG1ha2VOb2RlRXJyb3JXaXRoQ29kZSQxKEJhc2UsIGtleSkge1xuICAvLyBAdHMtZXhwZWN0LWVycm9yIEl04oCZcyBhIE5vZGUgZXJyb3IuXG4gIHJldHVybiBOb2RlRXJyb3JcbiAgLyoqXG4gICAqIEBwYXJhbSB7dW5rbm93bltdfSBhcmdzXG4gICAqL1xuICBmdW5jdGlvbiBOb2RlRXJyb3IoLi4uYXJncykge1xuICAgIGNvbnN0IGxpbWl0ID0gRXJyb3Iuc3RhY2tUcmFjZUxpbWl0O1xuICAgIGlmIChpc0Vycm9yU3RhY2tUcmFjZUxpbWl0V3JpdGFibGUkMSgpKSBFcnJvci5zdGFja1RyYWNlTGltaXQgPSAwO1xuICAgIGNvbnN0IGVycm9yID0gbmV3IEJhc2UoKTtcbiAgICAvLyBSZXNldCB0aGUgbGltaXQgYW5kIHNldHRpbmcgdGhlIG5hbWUgcHJvcGVydHkuXG4gICAgaWYgKGlzRXJyb3JTdGFja1RyYWNlTGltaXRXcml0YWJsZSQxKCkpIEVycm9yLnN0YWNrVHJhY2VMaW1pdCA9IGxpbWl0O1xuICAgIGNvbnN0IG1lc3NhZ2UgPSBnZXRNZXNzYWdlJDEoa2V5LCBhcmdzLCBlcnJvcik7XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KGVycm9yLCAnbWVzc2FnZScsIHtcbiAgICAgIHZhbHVlOiBtZXNzYWdlLFxuICAgICAgZW51bWVyYWJsZTogZmFsc2UsXG4gICAgICB3cml0YWJsZTogdHJ1ZSxcbiAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgIH0pO1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShlcnJvciwgJ3RvU3RyaW5nJywge1xuICAgICAgLyoqIEB0aGlzIHtFcnJvcn0gKi9cbiAgICAgIHZhbHVlKCkge1xuICAgICAgICByZXR1cm4gYCR7dGhpcy5uYW1lfSBbJHtrZXl9XTogJHt0aGlzLm1lc3NhZ2V9YFxuICAgICAgfSxcbiAgICAgIGVudW1lcmFibGU6IGZhbHNlLFxuICAgICAgd3JpdGFibGU6IHRydWUsXG4gICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICB9KTtcbiAgICBhZGRDb2RlVG9OYW1lJDEoZXJyb3IsIEJhc2UubmFtZSwga2V5KTtcbiAgICAvLyBAdHMtZXhwZWN0LWVycm9yIEl04oCZcyBhIE5vZGUgZXJyb3IuXG4gICAgZXJyb3IuY29kZSA9IGtleTtcbiAgICByZXR1cm4gZXJyb3JcbiAgfVxufVxuXG5jb25zdCBhZGRDb2RlVG9OYW1lJDEgPSBoaWRlU3RhY2tGcmFtZXMkMShcbiAgLyoqXG4gICAqIEBwYXJhbSB7RXJyb3J9IGVycm9yXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBuYW1lXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBjb2RlXG4gICAqIEByZXR1cm5zIHt2b2lkfVxuICAgKi9cbiAgZnVuY3Rpb24gKGVycm9yLCBuYW1lLCBjb2RlKSB7XG4gICAgLy8gU2V0IHRoZSBzdGFja1xuICAgIGVycm9yID0gY2FwdHVyZUxhcmdlclN0YWNrVHJhY2UkMShlcnJvcik7XG4gICAgLy8gQWRkIHRoZSBlcnJvciBjb2RlIHRvIHRoZSBuYW1lIHRvIGluY2x1ZGUgaXQgaW4gdGhlIHN0YWNrIHRyYWNlLlxuICAgIGVycm9yLm5hbWUgPSBgJHtuYW1lfSBbJHtjb2RlfV1gO1xuICAgIC8vIEFjY2VzcyB0aGUgc3RhY2sgdG8gZ2VuZXJhdGUgdGhlIGVycm9yIG1lc3NhZ2UgaW5jbHVkaW5nIHRoZSBlcnJvciBjb2RlXG4gICAgLy8gZnJvbSB0aGUgbmFtZS5cbiAgICBlcnJvci5zdGFjazsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby11bnVzZWQtZXhwcmVzc2lvbnNcbiAgICAvLyBSZXNldCB0aGUgbmFtZSB0byB0aGUgYWN0dWFsIG5hbWUuXG4gICAgaWYgKG5hbWUgPT09ICdTeXN0ZW1FcnJvcicpIHtcbiAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShlcnJvciwgJ25hbWUnLCB7XG4gICAgICAgIHZhbHVlOiBuYW1lLFxuICAgICAgICBlbnVtZXJhYmxlOiBmYWxzZSxcbiAgICAgICAgd3JpdGFibGU6IHRydWUsXG4gICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgICAgfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGRlbGV0ZSBlcnJvci5uYW1lO1xuICAgIH1cbiAgfVxuKTtcblxuLyoqXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAqL1xuZnVuY3Rpb24gaXNFcnJvclN0YWNrVHJhY2VMaW1pdFdyaXRhYmxlJDEoKSB7XG4gIGNvbnN0IGRlc2MgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKEVycm9yLCAnc3RhY2tUcmFjZUxpbWl0Jyk7XG4gIGlmIChkZXNjID09PSB1bmRlZmluZWQpIHtcbiAgICByZXR1cm4gT2JqZWN0LmlzRXh0ZW5zaWJsZShFcnJvcilcbiAgfVxuXG4gIHJldHVybiBvd24kMy5jYWxsKGRlc2MsICd3cml0YWJsZScpID8gZGVzYy53cml0YWJsZSA6IGRlc2Muc2V0ICE9PSB1bmRlZmluZWRcbn1cblxuLyoqXG4gKiBUaGlzIGZ1bmN0aW9uIHJlbW92ZXMgdW5uZWNlc3NhcnkgZnJhbWVzIGZyb20gTm9kZS5qcyBjb3JlIGVycm9ycy5cbiAqIEB0ZW1wbGF0ZSB7KC4uLmFyZ3M6IHVua25vd25bXSkgPT4gdW5rbm93bn0gVFxuICogQHR5cGUgeyhmbjogVCkgPT4gVH1cbiAqL1xuZnVuY3Rpb24gaGlkZVN0YWNrRnJhbWVzJDEoZm4pIHtcbiAgLy8gV2UgcmVuYW1lIHRoZSBmdW5jdGlvbnMgdGhhdCB3aWxsIGJlIGhpZGRlbiB0byBjdXQgb2ZmIHRoZSBzdGFja3RyYWNlXG4gIC8vIGF0IHRoZSBvdXRlcm1vc3Qgb25lXG4gIGNvbnN0IGhpZGRlbiA9IG5vZGVJbnRlcm5hbFByZWZpeCQxICsgZm4ubmFtZTtcbiAgT2JqZWN0LmRlZmluZVByb3BlcnR5KGZuLCAnbmFtZScsIHt2YWx1ZTogaGlkZGVufSk7XG4gIHJldHVybiBmblxufVxuXG5jb25zdCBjYXB0dXJlTGFyZ2VyU3RhY2tUcmFjZSQxID0gaGlkZVN0YWNrRnJhbWVzJDEoXG4gIC8qKlxuICAgKiBAcGFyYW0ge0Vycm9yfSBlcnJvclxuICAgKiBAcmV0dXJucyB7RXJyb3J9XG4gICAqL1xuICBmdW5jdGlvbiAoZXJyb3IpIHtcbiAgICBjb25zdCBzdGFja1RyYWNlTGltaXRJc1dyaXRhYmxlID0gaXNFcnJvclN0YWNrVHJhY2VMaW1pdFdyaXRhYmxlJDEoKTtcbiAgICBpZiAoc3RhY2tUcmFjZUxpbWl0SXNXcml0YWJsZSkge1xuICAgICAgdXNlclN0YWNrVHJhY2VMaW1pdCQxID0gRXJyb3Iuc3RhY2tUcmFjZUxpbWl0O1xuICAgICAgRXJyb3Iuc3RhY2tUcmFjZUxpbWl0ID0gTnVtYmVyLlBPU0lUSVZFX0lORklOSVRZO1xuICAgIH1cblxuICAgIEVycm9yLmNhcHR1cmVTdGFja1RyYWNlKGVycm9yKTtcblxuICAgIC8vIFJlc2V0IHRoZSBsaW1pdFxuICAgIGlmIChzdGFja1RyYWNlTGltaXRJc1dyaXRhYmxlKSBFcnJvci5zdGFja1RyYWNlTGltaXQgPSB1c2VyU3RhY2tUcmFjZUxpbWl0JDE7XG5cbiAgICByZXR1cm4gZXJyb3JcbiAgfVxuKTtcblxuLyoqXG4gKiBAcGFyYW0ge3N0cmluZ30ga2V5XG4gKiBAcGFyYW0ge3Vua25vd25bXX0gYXJnc1xuICogQHBhcmFtIHtFcnJvcn0gc2VsZlxuICogQHJldHVybnMge3N0cmluZ31cbiAqL1xuZnVuY3Rpb24gZ2V0TWVzc2FnZSQxKGtleSwgYXJncywgc2VsZikge1xuICBjb25zdCBtZXNzYWdlID0gbWVzc2FnZXMkMS5nZXQoa2V5KTtcblxuICBpZiAodHlwZW9mIG1lc3NhZ2UgPT09ICdmdW5jdGlvbicpIHtcbiAgICBhc3NlcnQoXG4gICAgICBtZXNzYWdlLmxlbmd0aCA8PSBhcmdzLmxlbmd0aCwgLy8gRGVmYXVsdCBvcHRpb25zIGRvIG5vdCBjb3VudC5cbiAgICAgIGBDb2RlOiAke2tleX07IFRoZSBwcm92aWRlZCBhcmd1bWVudHMgbGVuZ3RoICgke2FyZ3MubGVuZ3RofSkgZG9lcyBub3QgYCArXG4gICAgICAgIGBtYXRjaCB0aGUgcmVxdWlyZWQgb25lcyAoJHttZXNzYWdlLmxlbmd0aH0pLmBcbiAgICApO1xuICAgIHJldHVybiBSZWZsZWN0LmFwcGx5KG1lc3NhZ2UsIHNlbGYsIGFyZ3MpXG4gIH1cblxuICBjb25zdCBleHBlY3RlZExlbmd0aCA9IChtZXNzYWdlLm1hdGNoKC8lW2RmaWpvT3NdL2cpIHx8IFtdKS5sZW5ndGg7XG4gIGFzc2VydChcbiAgICBleHBlY3RlZExlbmd0aCA9PT0gYXJncy5sZW5ndGgsXG4gICAgYENvZGU6ICR7a2V5fTsgVGhlIHByb3ZpZGVkIGFyZ3VtZW50cyBsZW5ndGggKCR7YXJncy5sZW5ndGh9KSBkb2VzIG5vdCBgICtcbiAgICAgIGBtYXRjaCB0aGUgcmVxdWlyZWQgb25lcyAoJHtleHBlY3RlZExlbmd0aH0pLmBcbiAgKTtcbiAgaWYgKGFyZ3MubGVuZ3RoID09PSAwKSByZXR1cm4gbWVzc2FnZVxuXG4gIGFyZ3MudW5zaGlmdChtZXNzYWdlKTtcbiAgcmV0dXJuIFJlZmxlY3QuYXBwbHkoZm9ybWF0JDIsIG51bGwsIGFyZ3MpXG59XG5cbi8vIE1hbnVhbGx5IOKAnHRyZWUgc2hha2Vu4oCdIGZyb206XG5cbmNvbnN0IHtFUlJfVU5LTk9XTl9GSUxFX0VYVEVOU0lPTjogRVJSX1VOS05PV05fRklMRV9FWFRFTlNJT04kMX0gPSBjb2RlcyQxO1xuXG5jb25zdCBleHRlbnNpb25Gb3JtYXRNYXAkMSA9IHtcbiAgX19wcm90b19fOiBudWxsLFxuICAnLmNqcyc6ICdjb21tb25qcycsXG4gICcuanMnOiAnbW9kdWxlJyxcbiAgJy5tanMnOiAnbW9kdWxlJ1xufTtcblxuLyoqXG4gKiBAcGFyYW0ge3N0cmluZ30gdXJsXG4gKiBAcmV0dXJucyB7e2Zvcm1hdDogc3RyaW5nfG51bGx9fVxuICovXG5mdW5jdGlvbiBkZWZhdWx0R2V0Rm9ybWF0JDEodXJsKSB7XG4gIGlmICh1cmwuc3RhcnRzV2l0aCgnbm9kZTonKSkge1xuICAgIHJldHVybiB7Zm9ybWF0OiAnYnVpbHRpbid9XG4gIH1cblxuICBjb25zdCBwYXJzZWQgPSBuZXcgVVJMJDEodXJsKTtcblxuICBpZiAocGFyc2VkLnByb3RvY29sID09PSAnZGF0YTonKSB7XG4gICAgY29uc3QgezE6IG1pbWV9ID0gL14oW14vXStcXC9bXjssXSspW14sXSo/KDtiYXNlNjQpPywvLmV4ZWMoXG4gICAgICBwYXJzZWQucGF0aG5hbWVcbiAgICApIHx8IFtudWxsLCBudWxsXTtcbiAgICBjb25zdCBmb3JtYXQgPSBtaW1lID09PSAndGV4dC9qYXZhc2NyaXB0JyA/ICdtb2R1bGUnIDogbnVsbDtcbiAgICByZXR1cm4ge2Zvcm1hdH1cbiAgfVxuXG4gIGlmIChwYXJzZWQucHJvdG9jb2wgPT09ICdmaWxlOicpIHtcbiAgICBjb25zdCBleHQgPSBwYXRoLmV4dG5hbWUocGFyc2VkLnBhdGhuYW1lKTtcbiAgICAvKiogQHR5cGUge3N0cmluZ30gKi9cbiAgICBsZXQgZm9ybWF0O1xuICAgIGlmIChleHQgPT09ICcuanMnKSB7XG4gICAgICBmb3JtYXQgPSBnZXRQYWNrYWdlVHlwZSQxKHBhcnNlZC5ocmVmKSA9PT0gJ21vZHVsZScgPyAnbW9kdWxlJyA6ICdjb21tb25qcyc7XG4gICAgfSBlbHNlIHtcbiAgICAgIGZvcm1hdCA9IGV4dGVuc2lvbkZvcm1hdE1hcCQxW2V4dF07XG4gICAgfVxuXG4gICAgaWYgKCFmb3JtYXQpIHtcbiAgICAgIHRocm93IG5ldyBFUlJfVU5LTk9XTl9GSUxFX0VYVEVOU0lPTiQxKGV4dCwgZmlsZVVSTFRvUGF0aCQyKHVybCkpXG4gICAgfVxuXG4gICAgcmV0dXJuIHtmb3JtYXQ6IGZvcm1hdCB8fCBudWxsfVxuICB9XG5cbiAgcmV0dXJuIHtmb3JtYXQ6IG51bGx9XG59XG5cbi8vIE1hbnVhbGx5IOKAnHRyZWUgc2hha2Vu4oCdIGZyb206XG5cbmJ1aWx0aW5zJDEoKTtcblxuY29uc3Qge1xuICBFUlJfSU5WQUxJRF9NT0RVTEVfU1BFQ0lGSUVSOiBFUlJfSU5WQUxJRF9NT0RVTEVfU1BFQ0lGSUVSJDEsXG4gIEVSUl9JTlZBTElEX1BBQ0tBR0VfQ09ORklHOiBFUlJfSU5WQUxJRF9QQUNLQUdFX0NPTkZJRyQxLFxuICBFUlJfSU5WQUxJRF9QQUNLQUdFX1RBUkdFVDogRVJSX0lOVkFMSURfUEFDS0FHRV9UQVJHRVQkMSxcbiAgRVJSX01PRFVMRV9OT1RfRk9VTkQ6IEVSUl9NT0RVTEVfTk9UX0ZPVU5EJDEsXG4gIEVSUl9QQUNLQUdFX0lNUE9SVF9OT1RfREVGSU5FRDogRVJSX1BBQ0tBR0VfSU1QT1JUX05PVF9ERUZJTkVEJDEsXG4gIEVSUl9QQUNLQUdFX1BBVEhfTk9UX0VYUE9SVEVEOiBFUlJfUEFDS0FHRV9QQVRIX05PVF9FWFBPUlRFRCQxLFxuICBFUlJfVU5TVVBQT1JURURfRElSX0lNUE9SVDogRVJSX1VOU1VQUE9SVEVEX0RJUl9JTVBPUlQkMSxcbiAgRVJSX1VOU1VQUE9SVEVEX0VTTV9VUkxfU0NIRU1FOiBFUlJfVU5TVVBQT1JURURfRVNNX1VSTF9TQ0hFTUUkMSxcbiAgRVJSX0lOVkFMSURfQVJHX1ZBTFVFOiBFUlJfSU5WQUxJRF9BUkdfVkFMVUUkMVxufSA9IGNvZGVzJDE7XG5cbmNvbnN0IG93biQyID0ge30uaGFzT3duUHJvcGVydHk7XG5cbk9iamVjdC5mcmVlemUoWydub2RlJywgJ2ltcG9ydCddKTtcblxuY29uc3QgaW52YWxpZFNlZ21lbnRSZWdFeCQxID0gLyhefFxcXFx8XFwvKShcXC5cXC4/fG5vZGVfbW9kdWxlcykoXFxcXHxcXC98JCkvO1xuY29uc3QgcGF0dGVyblJlZ0V4JDEgPSAvXFwqL2c7XG5jb25zdCBlbmNvZGVkU2VwUmVnRXgkMSA9IC8lMmZ8JTJjL2k7XG4vKiogQHR5cGUge1NldDxzdHJpbmc+fSAqL1xuY29uc3QgZW1pdHRlZFBhY2thZ2VXYXJuaW5ncyQxID0gbmV3IFNldCgpO1xuLyoqIEB0eXBlIHtNYXA8c3RyaW5nLCBQYWNrYWdlQ29uZmlnPn0gKi9cbmNvbnN0IHBhY2thZ2VKc29uQ2FjaGUkMSA9IG5ldyBNYXAoKTtcblxuLyoqXG4gKiBAcGFyYW0ge3N0cmluZ30gbWF0Y2hcbiAqIEBwYXJhbSB7VVJMfSBwanNvblVybFxuICogQHBhcmFtIHtib29sZWFufSBpc0V4cG9ydHNcbiAqIEBwYXJhbSB7VVJMfSBiYXNlXG4gKiBAcmV0dXJucyB7dm9pZH1cbiAqL1xuZnVuY3Rpb24gZW1pdEZvbGRlck1hcERlcHJlY2F0aW9uJDEobWF0Y2gsIHBqc29uVXJsLCBpc0V4cG9ydHMsIGJhc2UpIHtcbiAgY29uc3QgcGpzb25QYXRoID0gZmlsZVVSTFRvUGF0aCQyKHBqc29uVXJsKTtcblxuICBpZiAoZW1pdHRlZFBhY2thZ2VXYXJuaW5ncyQxLmhhcyhwanNvblBhdGggKyAnfCcgKyBtYXRjaCkpIHJldHVyblxuICBlbWl0dGVkUGFja2FnZVdhcm5pbmdzJDEuYWRkKHBqc29uUGF0aCArICd8JyArIG1hdGNoKTtcbiAgcHJvY2Vzcy5lbWl0V2FybmluZyhcbiAgICBgVXNlIG9mIGRlcHJlY2F0ZWQgZm9sZGVyIG1hcHBpbmcgXCIke21hdGNofVwiIGluIHRoZSAke1xuICAgICAgaXNFeHBvcnRzID8gJ1wiZXhwb3J0c1wiJyA6ICdcImltcG9ydHNcIidcbiAgICB9IGZpZWxkIG1vZHVsZSByZXNvbHV0aW9uIG9mIHRoZSBwYWNrYWdlIGF0ICR7cGpzb25QYXRofSR7XG4gICAgICBiYXNlID8gYCBpbXBvcnRlZCBmcm9tICR7ZmlsZVVSTFRvUGF0aCQyKGJhc2UpfWAgOiAnJ1xuICAgIH0uXFxuYCArXG4gICAgICBgVXBkYXRlIHRoaXMgcGFja2FnZS5qc29uIHRvIHVzZSBhIHN1YnBhdGggcGF0dGVybiBsaWtlIFwiJHttYXRjaH0qXCIuYCxcbiAgICAnRGVwcmVjYXRpb25XYXJuaW5nJyxcbiAgICAnREVQMDE0OCdcbiAgKTtcbn1cblxuLyoqXG4gKiBAcGFyYW0ge1VSTH0gdXJsXG4gKiBAcGFyYW0ge1VSTH0gcGFja2FnZUpzb25VcmxcbiAqIEBwYXJhbSB7VVJMfSBiYXNlXG4gKiBAcGFyYW0ge3Vua25vd259IFttYWluXVxuICogQHJldHVybnMge3ZvaWR9XG4gKi9cbmZ1bmN0aW9uIGVtaXRMZWdhY3lJbmRleERlcHJlY2F0aW9uJDEodXJsLCBwYWNrYWdlSnNvblVybCwgYmFzZSwgbWFpbikge1xuICBjb25zdCB7Zm9ybWF0fSA9IGRlZmF1bHRHZXRGb3JtYXQkMSh1cmwuaHJlZik7XG4gIGlmIChmb3JtYXQgIT09ICdtb2R1bGUnKSByZXR1cm5cbiAgY29uc3QgcGF0aCA9IGZpbGVVUkxUb1BhdGgkMih1cmwuaHJlZik7XG4gIGNvbnN0IHBrZ1BhdGggPSBmaWxlVVJMVG9QYXRoJDIobmV3IFVSTCQxKCcuJywgcGFja2FnZUpzb25VcmwpKTtcbiAgY29uc3QgYmFzZVBhdGggPSBmaWxlVVJMVG9QYXRoJDIoYmFzZSk7XG4gIGlmIChtYWluKVxuICAgIHByb2Nlc3MuZW1pdFdhcm5pbmcoXG4gICAgICBgUGFja2FnZSAke3BrZ1BhdGh9IGhhcyBhIFwibWFpblwiIGZpZWxkIHNldCB0byAke0pTT04uc3RyaW5naWZ5KG1haW4pfSwgYCArXG4gICAgICAgIGBleGNsdWRpbmcgdGhlIGZ1bGwgZmlsZW5hbWUgYW5kIGV4dGVuc2lvbiB0byB0aGUgcmVzb2x2ZWQgZmlsZSBhdCBcIiR7cGF0aC5zbGljZShcbiAgICAgICAgICBwa2dQYXRoLmxlbmd0aFxuICAgICAgICApfVwiLCBpbXBvcnRlZCBmcm9tICR7YmFzZVBhdGh9LlxcbiBBdXRvbWF0aWMgZXh0ZW5zaW9uIHJlc29sdXRpb24gb2YgdGhlIFwibWFpblwiIGZpZWxkIGlzYCArXG4gICAgICAgICdkZXByZWNhdGVkIGZvciBFUyBtb2R1bGVzLicsXG4gICAgICAnRGVwcmVjYXRpb25XYXJuaW5nJyxcbiAgICAgICdERVAwMTUxJ1xuICAgICk7XG4gIGVsc2VcbiAgICBwcm9jZXNzLmVtaXRXYXJuaW5nKFxuICAgICAgYE5vIFwibWFpblwiIG9yIFwiZXhwb3J0c1wiIGZpZWxkIGRlZmluZWQgaW4gdGhlIHBhY2thZ2UuanNvbiBmb3IgJHtwa2dQYXRofSByZXNvbHZpbmcgdGhlIG1haW4gZW50cnkgcG9pbnQgXCIke3BhdGguc2xpY2UoXG4gICAgICAgIHBrZ1BhdGgubGVuZ3RoXG4gICAgICApfVwiLCBpbXBvcnRlZCBmcm9tICR7YmFzZVBhdGh9LlxcbkRlZmF1bHQgXCJpbmRleFwiIGxvb2t1cHMgZm9yIHRoZSBtYWluIGFyZSBkZXByZWNhdGVkIGZvciBFUyBtb2R1bGVzLmAsXG4gICAgICAnRGVwcmVjYXRpb25XYXJuaW5nJyxcbiAgICAgICdERVAwMTUxJ1xuICAgICk7XG59XG5cbi8qKlxuICogQHBhcmFtIHtzdHJpbmd9IHBhdGhcbiAqIEByZXR1cm5zIHtTdGF0c31cbiAqL1xuZnVuY3Rpb24gdHJ5U3RhdFN5bmMkMShwYXRoKSB7XG4gIC8vIE5vdGU6IGZyb20gTm9kZSAxNSBvbndhcmRzIHdlIGNhbiB1c2UgYHRocm93SWZOb0VudHJ5OiBmYWxzZWAgaW5zdGVhZC5cbiAgdHJ5IHtcbiAgICByZXR1cm4gc3RhdFN5bmMocGF0aClcbiAgfSBjYXRjaCB7XG4gICAgcmV0dXJuIG5ldyBTdGF0cygpXG4gIH1cbn1cblxuLyoqXG4gKiBAcGFyYW0ge3N0cmluZ30gcGF0aFxuICogQHBhcmFtIHtzdHJpbmd8VVJMfSBzcGVjaWZpZXIgTm90ZTogYHNwZWNpZmllcmAgaXMgYWN0dWFsbHkgb3B0aW9uYWwsIG5vdCBiYXNlLlxuICogQHBhcmFtIHtVUkx9IFtiYXNlXVxuICogQHJldHVybnMge1BhY2thZ2VDb25maWd9XG4gKi9cbmZ1bmN0aW9uIGdldFBhY2thZ2VDb25maWckMShwYXRoLCBzcGVjaWZpZXIsIGJhc2UpIHtcbiAgY29uc3QgZXhpc3RpbmcgPSBwYWNrYWdlSnNvbkNhY2hlJDEuZ2V0KHBhdGgpO1xuICBpZiAoZXhpc3RpbmcgIT09IHVuZGVmaW5lZCkge1xuICAgIHJldHVybiBleGlzdGluZ1xuICB9XG5cbiAgY29uc3Qgc291cmNlID0gcGFja2FnZUpzb25SZWFkZXIkMS5yZWFkKHBhdGgpLnN0cmluZztcblxuICBpZiAoc291cmNlID09PSB1bmRlZmluZWQpIHtcbiAgICAvKiogQHR5cGUge1BhY2thZ2VDb25maWd9ICovXG4gICAgY29uc3QgcGFja2FnZUNvbmZpZyA9IHtcbiAgICAgIHBqc29uUGF0aDogcGF0aCxcbiAgICAgIGV4aXN0czogZmFsc2UsXG4gICAgICBtYWluOiB1bmRlZmluZWQsXG4gICAgICBuYW1lOiB1bmRlZmluZWQsXG4gICAgICB0eXBlOiAnbm9uZScsXG4gICAgICBleHBvcnRzOiB1bmRlZmluZWQsXG4gICAgICBpbXBvcnRzOiB1bmRlZmluZWRcbiAgICB9O1xuICAgIHBhY2thZ2VKc29uQ2FjaGUkMS5zZXQocGF0aCwgcGFja2FnZUNvbmZpZyk7XG4gICAgcmV0dXJuIHBhY2thZ2VDb25maWdcbiAgfVxuXG4gIC8qKiBAdHlwZSB7T2JqZWN0LjxzdHJpbmcsIHVua25vd24+fSAqL1xuICBsZXQgcGFja2FnZUpzb247XG4gIHRyeSB7XG4gICAgcGFja2FnZUpzb24gPSBKU09OLnBhcnNlKHNvdXJjZSk7XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgdGhyb3cgbmV3IEVSUl9JTlZBTElEX1BBQ0tBR0VfQ09ORklHJDEoXG4gICAgICBwYXRoLFxuICAgICAgKGJhc2UgPyBgXCIke3NwZWNpZmllcn1cIiBmcm9tIGAgOiAnJykgKyBmaWxlVVJMVG9QYXRoJDIoYmFzZSB8fCBzcGVjaWZpZXIpLFxuICAgICAgZXJyb3IubWVzc2FnZVxuICAgIClcbiAgfVxuXG4gIGNvbnN0IHtleHBvcnRzLCBpbXBvcnRzLCBtYWluLCBuYW1lLCB0eXBlfSA9IHBhY2thZ2VKc29uO1xuXG4gIC8qKiBAdHlwZSB7UGFja2FnZUNvbmZpZ30gKi9cbiAgY29uc3QgcGFja2FnZUNvbmZpZyA9IHtcbiAgICBwanNvblBhdGg6IHBhdGgsXG4gICAgZXhpc3RzOiB0cnVlLFxuICAgIG1haW46IHR5cGVvZiBtYWluID09PSAnc3RyaW5nJyA/IG1haW4gOiB1bmRlZmluZWQsXG4gICAgbmFtZTogdHlwZW9mIG5hbWUgPT09ICdzdHJpbmcnID8gbmFtZSA6IHVuZGVmaW5lZCxcbiAgICB0eXBlOiB0eXBlID09PSAnbW9kdWxlJyB8fCB0eXBlID09PSAnY29tbW9uanMnID8gdHlwZSA6ICdub25lJyxcbiAgICAvLyBAdHMtZXhwZWN0LWVycm9yIEFzc3VtZSBgT2JqZWN0LjxzdHJpbmcsIHVua25vd24+YC5cbiAgICBleHBvcnRzLFxuICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgQXNzdW1lIGBPYmplY3QuPHN0cmluZywgdW5rbm93bj5gLlxuICAgIGltcG9ydHM6IGltcG9ydHMgJiYgdHlwZW9mIGltcG9ydHMgPT09ICdvYmplY3QnID8gaW1wb3J0cyA6IHVuZGVmaW5lZFxuICB9O1xuICBwYWNrYWdlSnNvbkNhY2hlJDEuc2V0KHBhdGgsIHBhY2thZ2VDb25maWcpO1xuICByZXR1cm4gcGFja2FnZUNvbmZpZ1xufVxuXG4vKipcbiAqIEBwYXJhbSB7VVJMfHN0cmluZ30gcmVzb2x2ZWRcbiAqIEByZXR1cm5zIHtQYWNrYWdlQ29uZmlnfVxuICovXG5mdW5jdGlvbiBnZXRQYWNrYWdlU2NvcGVDb25maWckMShyZXNvbHZlZCkge1xuICBsZXQgcGFja2FnZUpzb25VcmwgPSBuZXcgVVJMJDEoJy4vcGFja2FnZS5qc29uJywgcmVzb2x2ZWQpO1xuXG4gIHdoaWxlICh0cnVlKSB7XG4gICAgY29uc3QgcGFja2FnZUpzb25QYXRoID0gcGFja2FnZUpzb25VcmwucGF0aG5hbWU7XG5cbiAgICBpZiAocGFja2FnZUpzb25QYXRoLmVuZHNXaXRoKCdub2RlX21vZHVsZXMvcGFja2FnZS5qc29uJykpIGJyZWFrXG5cbiAgICBjb25zdCBwYWNrYWdlQ29uZmlnID0gZ2V0UGFja2FnZUNvbmZpZyQxKFxuICAgICAgZmlsZVVSTFRvUGF0aCQyKHBhY2thZ2VKc29uVXJsKSxcbiAgICAgIHJlc29sdmVkXG4gICAgKTtcbiAgICBpZiAocGFja2FnZUNvbmZpZy5leGlzdHMpIHJldHVybiBwYWNrYWdlQ29uZmlnXG5cbiAgICBjb25zdCBsYXN0UGFja2FnZUpzb25VcmwgPSBwYWNrYWdlSnNvblVybDtcbiAgICBwYWNrYWdlSnNvblVybCA9IG5ldyBVUkwkMSgnLi4vcGFja2FnZS5qc29uJywgcGFja2FnZUpzb25VcmwpO1xuXG4gICAgLy8gVGVybWluYXRlcyBhdCByb290IHdoZXJlIC4uL3BhY2thZ2UuanNvbiBlcXVhbHMgLi4vLi4vcGFja2FnZS5qc29uXG4gICAgLy8gKGNhbid0IGp1c3QgY2hlY2sgXCIvcGFja2FnZS5qc29uXCIgZm9yIFdpbmRvd3Mgc3VwcG9ydCkuXG4gICAgaWYgKHBhY2thZ2VKc29uVXJsLnBhdGhuYW1lID09PSBsYXN0UGFja2FnZUpzb25VcmwucGF0aG5hbWUpIGJyZWFrXG4gIH1cblxuICBjb25zdCBwYWNrYWdlSnNvblBhdGggPSBmaWxlVVJMVG9QYXRoJDIocGFja2FnZUpzb25VcmwpO1xuICAvKiogQHR5cGUge1BhY2thZ2VDb25maWd9ICovXG4gIGNvbnN0IHBhY2thZ2VDb25maWcgPSB7XG4gICAgcGpzb25QYXRoOiBwYWNrYWdlSnNvblBhdGgsXG4gICAgZXhpc3RzOiBmYWxzZSxcbiAgICBtYWluOiB1bmRlZmluZWQsXG4gICAgbmFtZTogdW5kZWZpbmVkLFxuICAgIHR5cGU6ICdub25lJyxcbiAgICBleHBvcnRzOiB1bmRlZmluZWQsXG4gICAgaW1wb3J0czogdW5kZWZpbmVkXG4gIH07XG4gIHBhY2thZ2VKc29uQ2FjaGUkMS5zZXQocGFja2FnZUpzb25QYXRoLCBwYWNrYWdlQ29uZmlnKTtcbiAgcmV0dXJuIHBhY2thZ2VDb25maWdcbn1cblxuLyoqXG4gKiBMZWdhY3kgQ29tbW9uSlMgbWFpbiByZXNvbHV0aW9uOlxuICogMS4gbGV0IE0gPSBwa2dfdXJsICsgKGpzb24gbWFpbiBmaWVsZClcbiAqIDIuIFRSWShNLCBNLmpzLCBNLmpzb24sIE0ubm9kZSlcbiAqIDMuIFRSWShNL2luZGV4LmpzLCBNL2luZGV4Lmpzb24sIE0vaW5kZXgubm9kZSlcbiAqIDQuIFRSWShwa2dfdXJsL2luZGV4LmpzLCBwa2dfdXJsL2luZGV4Lmpzb24sIHBrZ191cmwvaW5kZXgubm9kZSlcbiAqIDUuIE5PVF9GT1VORFxuICpcbiAqIEBwYXJhbSB7VVJMfSB1cmxcbiAqIEByZXR1cm5zIHtib29sZWFufVxuICovXG5mdW5jdGlvbiBmaWxlRXhpc3RzJDEodXJsKSB7XG4gIHJldHVybiB0cnlTdGF0U3luYyQxKGZpbGVVUkxUb1BhdGgkMih1cmwpKS5pc0ZpbGUoKVxufVxuXG4vKipcbiAqIEBwYXJhbSB7VVJMfSBwYWNrYWdlSnNvblVybFxuICogQHBhcmFtIHtQYWNrYWdlQ29uZmlnfSBwYWNrYWdlQ29uZmlnXG4gKiBAcGFyYW0ge1VSTH0gYmFzZVxuICogQHJldHVybnMge1VSTH1cbiAqL1xuZnVuY3Rpb24gbGVnYWN5TWFpblJlc29sdmUkMShwYWNrYWdlSnNvblVybCwgcGFja2FnZUNvbmZpZywgYmFzZSkge1xuICAvKiogQHR5cGUge1VSTH0gKi9cbiAgbGV0IGd1ZXNzO1xuICBpZiAocGFja2FnZUNvbmZpZy5tYWluICE9PSB1bmRlZmluZWQpIHtcbiAgICBndWVzcyA9IG5ldyBVUkwkMShgLi8ke3BhY2thZ2VDb25maWcubWFpbn1gLCBwYWNrYWdlSnNvblVybCk7XG4gICAgLy8gTm90ZTogZnMgY2hlY2sgcmVkdW5kYW5jZXMgd2lsbCBiZSBoYW5kbGVkIGJ5IERlc2NyaXB0b3IgY2FjaGUgaGVyZS5cbiAgICBpZiAoZmlsZUV4aXN0cyQxKGd1ZXNzKSkgcmV0dXJuIGd1ZXNzXG5cbiAgICBjb25zdCB0cmllcyA9IFtcbiAgICAgIGAuLyR7cGFja2FnZUNvbmZpZy5tYWlufS5qc2AsXG4gICAgICBgLi8ke3BhY2thZ2VDb25maWcubWFpbn0uanNvbmAsXG4gICAgICBgLi8ke3BhY2thZ2VDb25maWcubWFpbn0ubm9kZWAsXG4gICAgICBgLi8ke3BhY2thZ2VDb25maWcubWFpbn0vaW5kZXguanNgLFxuICAgICAgYC4vJHtwYWNrYWdlQ29uZmlnLm1haW59L2luZGV4Lmpzb25gLFxuICAgICAgYC4vJHtwYWNrYWdlQ29uZmlnLm1haW59L2luZGV4Lm5vZGVgXG4gICAgXTtcbiAgICBsZXQgaSA9IC0xO1xuXG4gICAgd2hpbGUgKCsraSA8IHRyaWVzLmxlbmd0aCkge1xuICAgICAgZ3Vlc3MgPSBuZXcgVVJMJDEodHJpZXNbaV0sIHBhY2thZ2VKc29uVXJsKTtcbiAgICAgIGlmIChmaWxlRXhpc3RzJDEoZ3Vlc3MpKSBicmVha1xuICAgICAgZ3Vlc3MgPSB1bmRlZmluZWQ7XG4gICAgfVxuXG4gICAgaWYgKGd1ZXNzKSB7XG4gICAgICBlbWl0TGVnYWN5SW5kZXhEZXByZWNhdGlvbiQxKFxuICAgICAgICBndWVzcyxcbiAgICAgICAgcGFja2FnZUpzb25VcmwsXG4gICAgICAgIGJhc2UsXG4gICAgICAgIHBhY2thZ2VDb25maWcubWFpblxuICAgICAgKTtcbiAgICAgIHJldHVybiBndWVzc1xuICAgIH1cbiAgICAvLyBGYWxsdGhyb3VnaC5cbiAgfVxuXG4gIGNvbnN0IHRyaWVzID0gWycuL2luZGV4LmpzJywgJy4vaW5kZXguanNvbicsICcuL2luZGV4Lm5vZGUnXTtcbiAgbGV0IGkgPSAtMTtcblxuICB3aGlsZSAoKytpIDwgdHJpZXMubGVuZ3RoKSB7XG4gICAgZ3Vlc3MgPSBuZXcgVVJMJDEodHJpZXNbaV0sIHBhY2thZ2VKc29uVXJsKTtcbiAgICBpZiAoZmlsZUV4aXN0cyQxKGd1ZXNzKSkgYnJlYWtcbiAgICBndWVzcyA9IHVuZGVmaW5lZDtcbiAgfVxuXG4gIGlmIChndWVzcykge1xuICAgIGVtaXRMZWdhY3lJbmRleERlcHJlY2F0aW9uJDEoZ3Vlc3MsIHBhY2thZ2VKc29uVXJsLCBiYXNlLCBwYWNrYWdlQ29uZmlnLm1haW4pO1xuICAgIHJldHVybiBndWVzc1xuICB9XG5cbiAgLy8gTm90IGZvdW5kLlxuICB0aHJvdyBuZXcgRVJSX01PRFVMRV9OT1RfRk9VTkQkMShcbiAgICBmaWxlVVJMVG9QYXRoJDIobmV3IFVSTCQxKCcuJywgcGFja2FnZUpzb25VcmwpKSxcbiAgICBmaWxlVVJMVG9QYXRoJDIoYmFzZSlcbiAgKVxufVxuXG4vKipcbiAqIEBwYXJhbSB7VVJMfSByZXNvbHZlZFxuICogQHBhcmFtIHtVUkx9IGJhc2VcbiAqIEByZXR1cm5zIHtVUkx9XG4gKi9cbmZ1bmN0aW9uIGZpbmFsaXplUmVzb2x1dGlvbiQxKHJlc29sdmVkLCBiYXNlKSB7XG4gIGlmIChlbmNvZGVkU2VwUmVnRXgkMS50ZXN0KHJlc29sdmVkLnBhdGhuYW1lKSlcbiAgICB0aHJvdyBuZXcgRVJSX0lOVkFMSURfTU9EVUxFX1NQRUNJRklFUiQxKFxuICAgICAgcmVzb2x2ZWQucGF0aG5hbWUsXG4gICAgICAnbXVzdCBub3QgaW5jbHVkZSBlbmNvZGVkIFwiL1wiIG9yIFwiXFxcXFwiIGNoYXJhY3RlcnMnLFxuICAgICAgZmlsZVVSTFRvUGF0aCQyKGJhc2UpXG4gICAgKVxuXG4gIGNvbnN0IHBhdGggPSBmaWxlVVJMVG9QYXRoJDIocmVzb2x2ZWQpO1xuXG4gIGNvbnN0IHN0YXRzID0gdHJ5U3RhdFN5bmMkMShwYXRoLmVuZHNXaXRoKCcvJykgPyBwYXRoLnNsaWNlKC0xKSA6IHBhdGgpO1xuXG4gIGlmIChzdGF0cy5pc0RpcmVjdG9yeSgpKSB7XG4gICAgY29uc3QgZXJyb3IgPSBuZXcgRVJSX1VOU1VQUE9SVEVEX0RJUl9JTVBPUlQkMShwYXRoLCBmaWxlVVJMVG9QYXRoJDIoYmFzZSkpO1xuICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgQWRkIHRoaXMgZm9yIGBpbXBvcnQubWV0YS5yZXNvbHZlYC5cbiAgICBlcnJvci51cmwgPSBTdHJpbmcocmVzb2x2ZWQpO1xuICAgIHRocm93IGVycm9yXG4gIH1cblxuICBpZiAoIXN0YXRzLmlzRmlsZSgpKSB7XG4gICAgdGhyb3cgbmV3IEVSUl9NT0RVTEVfTk9UX0ZPVU5EJDEoXG4gICAgICBwYXRoIHx8IHJlc29sdmVkLnBhdGhuYW1lLFxuICAgICAgYmFzZSAmJiBmaWxlVVJMVG9QYXRoJDIoYmFzZSksXG4gICAgICAnbW9kdWxlJ1xuICAgIClcbiAgfVxuXG4gIHJldHVybiByZXNvbHZlZFxufVxuXG4vKipcbiAqIEBwYXJhbSB7c3RyaW5nfSBzcGVjaWZpZXJcbiAqIEBwYXJhbSB7VVJMP30gcGFja2FnZUpzb25VcmxcbiAqIEBwYXJhbSB7VVJMfSBiYXNlXG4gKiBAcmV0dXJucyB7bmV2ZXJ9XG4gKi9cbmZ1bmN0aW9uIHRocm93SW1wb3J0Tm90RGVmaW5lZCQxKHNwZWNpZmllciwgcGFja2FnZUpzb25VcmwsIGJhc2UpIHtcbiAgdGhyb3cgbmV3IEVSUl9QQUNLQUdFX0lNUE9SVF9OT1RfREVGSU5FRCQxKFxuICAgIHNwZWNpZmllcixcbiAgICBwYWNrYWdlSnNvblVybCAmJiBmaWxlVVJMVG9QYXRoJDIobmV3IFVSTCQxKCcuJywgcGFja2FnZUpzb25VcmwpKSxcbiAgICBmaWxlVVJMVG9QYXRoJDIoYmFzZSlcbiAgKVxufVxuXG4vKipcbiAqIEBwYXJhbSB7c3RyaW5nfSBzdWJwYXRoXG4gKiBAcGFyYW0ge1VSTH0gcGFja2FnZUpzb25VcmxcbiAqIEBwYXJhbSB7VVJMfSBiYXNlXG4gKiBAcmV0dXJucyB7bmV2ZXJ9XG4gKi9cbmZ1bmN0aW9uIHRocm93RXhwb3J0c05vdEZvdW5kJDEoc3VicGF0aCwgcGFja2FnZUpzb25VcmwsIGJhc2UpIHtcbiAgdGhyb3cgbmV3IEVSUl9QQUNLQUdFX1BBVEhfTk9UX0VYUE9SVEVEJDEoXG4gICAgZmlsZVVSTFRvUGF0aCQyKG5ldyBVUkwkMSgnLicsIHBhY2thZ2VKc29uVXJsKSksXG4gICAgc3VicGF0aCxcbiAgICBiYXNlICYmIGZpbGVVUkxUb1BhdGgkMihiYXNlKVxuICApXG59XG5cbi8qKlxuICogQHBhcmFtIHtzdHJpbmd9IHN1YnBhdGhcbiAqIEBwYXJhbSB7VVJMfSBwYWNrYWdlSnNvblVybFxuICogQHBhcmFtIHtib29sZWFufSBpbnRlcm5hbFxuICogQHBhcmFtIHtVUkx9IFtiYXNlXVxuICogQHJldHVybnMge25ldmVyfVxuICovXG5mdW5jdGlvbiB0aHJvd0ludmFsaWRTdWJwYXRoJDEoc3VicGF0aCwgcGFja2FnZUpzb25VcmwsIGludGVybmFsLCBiYXNlKSB7XG4gIGNvbnN0IHJlYXNvbiA9IGByZXF1ZXN0IGlzIG5vdCBhIHZhbGlkIHN1YnBhdGggZm9yIHRoZSBcIiR7XG4gICAgaW50ZXJuYWwgPyAnaW1wb3J0cycgOiAnZXhwb3J0cydcbiAgfVwiIHJlc29sdXRpb24gb2YgJHtmaWxlVVJMVG9QYXRoJDIocGFja2FnZUpzb25VcmwpfWA7XG5cbiAgdGhyb3cgbmV3IEVSUl9JTlZBTElEX01PRFVMRV9TUEVDSUZJRVIkMShcbiAgICBzdWJwYXRoLFxuICAgIHJlYXNvbixcbiAgICBiYXNlICYmIGZpbGVVUkxUb1BhdGgkMihiYXNlKVxuICApXG59XG5cbi8qKlxuICogQHBhcmFtIHtzdHJpbmd9IHN1YnBhdGhcbiAqIEBwYXJhbSB7dW5rbm93bn0gdGFyZ2V0XG4gKiBAcGFyYW0ge1VSTH0gcGFja2FnZUpzb25VcmxcbiAqIEBwYXJhbSB7Ym9vbGVhbn0gaW50ZXJuYWxcbiAqIEBwYXJhbSB7VVJMfSBbYmFzZV1cbiAqIEByZXR1cm5zIHtuZXZlcn1cbiAqL1xuZnVuY3Rpb24gdGhyb3dJbnZhbGlkUGFja2FnZVRhcmdldCQxKFxuICBzdWJwYXRoLFxuICB0YXJnZXQsXG4gIHBhY2thZ2VKc29uVXJsLFxuICBpbnRlcm5hbCxcbiAgYmFzZVxuKSB7XG4gIHRhcmdldCA9XG4gICAgdHlwZW9mIHRhcmdldCA9PT0gJ29iamVjdCcgJiYgdGFyZ2V0ICE9PSBudWxsXG4gICAgICA/IEpTT04uc3RyaW5naWZ5KHRhcmdldCwgbnVsbCwgJycpXG4gICAgICA6IGAke3RhcmdldH1gO1xuXG4gIHRocm93IG5ldyBFUlJfSU5WQUxJRF9QQUNLQUdFX1RBUkdFVCQxKFxuICAgIGZpbGVVUkxUb1BhdGgkMihuZXcgVVJMJDEoJy4nLCBwYWNrYWdlSnNvblVybCkpLFxuICAgIHN1YnBhdGgsXG4gICAgdGFyZ2V0LFxuICAgIGludGVybmFsLFxuICAgIGJhc2UgJiYgZmlsZVVSTFRvUGF0aCQyKGJhc2UpXG4gIClcbn1cblxuLyoqXG4gKiBAcGFyYW0ge3N0cmluZ30gdGFyZ2V0XG4gKiBAcGFyYW0ge3N0cmluZ30gc3VicGF0aFxuICogQHBhcmFtIHtzdHJpbmd9IG1hdGNoXG4gKiBAcGFyYW0ge1VSTH0gcGFja2FnZUpzb25VcmxcbiAqIEBwYXJhbSB7VVJMfSBiYXNlXG4gKiBAcGFyYW0ge2Jvb2xlYW59IHBhdHRlcm5cbiAqIEBwYXJhbSB7Ym9vbGVhbn0gaW50ZXJuYWxcbiAqIEBwYXJhbSB7U2V0PHN0cmluZz59IGNvbmRpdGlvbnNcbiAqIEByZXR1cm5zIHtVUkx9XG4gKi9cbmZ1bmN0aW9uIHJlc29sdmVQYWNrYWdlVGFyZ2V0U3RyaW5nJDEoXG4gIHRhcmdldCxcbiAgc3VicGF0aCxcbiAgbWF0Y2gsXG4gIHBhY2thZ2VKc29uVXJsLFxuICBiYXNlLFxuICBwYXR0ZXJuLFxuICBpbnRlcm5hbCxcbiAgY29uZGl0aW9uc1xuKSB7XG4gIGlmIChzdWJwYXRoICE9PSAnJyAmJiAhcGF0dGVybiAmJiB0YXJnZXRbdGFyZ2V0Lmxlbmd0aCAtIDFdICE9PSAnLycpXG4gICAgdGhyb3dJbnZhbGlkUGFja2FnZVRhcmdldCQxKG1hdGNoLCB0YXJnZXQsIHBhY2thZ2VKc29uVXJsLCBpbnRlcm5hbCwgYmFzZSk7XG5cbiAgaWYgKCF0YXJnZXQuc3RhcnRzV2l0aCgnLi8nKSkge1xuICAgIGlmIChpbnRlcm5hbCAmJiAhdGFyZ2V0LnN0YXJ0c1dpdGgoJy4uLycpICYmICF0YXJnZXQuc3RhcnRzV2l0aCgnLycpKSB7XG4gICAgICBsZXQgaXNVUkwgPSBmYWxzZTtcblxuICAgICAgdHJ5IHtcbiAgICAgICAgbmV3IFVSTCQxKHRhcmdldCk7XG4gICAgICAgIGlzVVJMID0gdHJ1ZTtcbiAgICAgIH0gY2F0Y2gge31cblxuICAgICAgaWYgKCFpc1VSTCkge1xuICAgICAgICBjb25zdCBleHBvcnRUYXJnZXQgPSBwYXR0ZXJuXG4gICAgICAgICAgPyB0YXJnZXQucmVwbGFjZShwYXR0ZXJuUmVnRXgkMSwgc3VicGF0aClcbiAgICAgICAgICA6IHRhcmdldCArIHN1YnBhdGg7XG5cbiAgICAgICAgcmV0dXJuIHBhY2thZ2VSZXNvbHZlJDEoZXhwb3J0VGFyZ2V0LCBwYWNrYWdlSnNvblVybCwgY29uZGl0aW9ucylcbiAgICAgIH1cbiAgICB9XG5cbiAgICB0aHJvd0ludmFsaWRQYWNrYWdlVGFyZ2V0JDEobWF0Y2gsIHRhcmdldCwgcGFja2FnZUpzb25VcmwsIGludGVybmFsLCBiYXNlKTtcbiAgfVxuXG4gIGlmIChpbnZhbGlkU2VnbWVudFJlZ0V4JDEudGVzdCh0YXJnZXQuc2xpY2UoMikpKVxuICAgIHRocm93SW52YWxpZFBhY2thZ2VUYXJnZXQkMShtYXRjaCwgdGFyZ2V0LCBwYWNrYWdlSnNvblVybCwgaW50ZXJuYWwsIGJhc2UpO1xuXG4gIGNvbnN0IHJlc29sdmVkID0gbmV3IFVSTCQxKHRhcmdldCwgcGFja2FnZUpzb25VcmwpO1xuICBjb25zdCByZXNvbHZlZFBhdGggPSByZXNvbHZlZC5wYXRobmFtZTtcbiAgY29uc3QgcGFja2FnZVBhdGggPSBuZXcgVVJMJDEoJy4nLCBwYWNrYWdlSnNvblVybCkucGF0aG5hbWU7XG5cbiAgaWYgKCFyZXNvbHZlZFBhdGguc3RhcnRzV2l0aChwYWNrYWdlUGF0aCkpXG4gICAgdGhyb3dJbnZhbGlkUGFja2FnZVRhcmdldCQxKG1hdGNoLCB0YXJnZXQsIHBhY2thZ2VKc29uVXJsLCBpbnRlcm5hbCwgYmFzZSk7XG5cbiAgaWYgKHN1YnBhdGggPT09ICcnKSByZXR1cm4gcmVzb2x2ZWRcblxuICBpZiAoaW52YWxpZFNlZ21lbnRSZWdFeCQxLnRlc3Qoc3VicGF0aCkpXG4gICAgdGhyb3dJbnZhbGlkU3VicGF0aCQxKG1hdGNoICsgc3VicGF0aCwgcGFja2FnZUpzb25VcmwsIGludGVybmFsLCBiYXNlKTtcblxuICBpZiAocGF0dGVybikgcmV0dXJuIG5ldyBVUkwkMShyZXNvbHZlZC5ocmVmLnJlcGxhY2UocGF0dGVyblJlZ0V4JDEsIHN1YnBhdGgpKVxuICByZXR1cm4gbmV3IFVSTCQxKHN1YnBhdGgsIHJlc29sdmVkKVxufVxuXG4vKipcbiAqIEBwYXJhbSB7c3RyaW5nfSBrZXlcbiAqIEByZXR1cm5zIHtib29sZWFufVxuICovXG5mdW5jdGlvbiBpc0FycmF5SW5kZXgkMShrZXkpIHtcbiAgY29uc3Qga2V5TnVtYmVyID0gTnVtYmVyKGtleSk7XG4gIGlmIChgJHtrZXlOdW1iZXJ9YCAhPT0ga2V5KSByZXR1cm4gZmFsc2VcbiAgcmV0dXJuIGtleU51bWJlciA+PSAwICYmIGtleU51bWJlciA8IDB4ZmZmZl9mZmZmXG59XG5cbi8qKlxuICogQHBhcmFtIHtVUkx9IHBhY2thZ2VKc29uVXJsXG4gKiBAcGFyYW0ge3Vua25vd259IHRhcmdldFxuICogQHBhcmFtIHtzdHJpbmd9IHN1YnBhdGhcbiAqIEBwYXJhbSB7c3RyaW5nfSBwYWNrYWdlU3VicGF0aFxuICogQHBhcmFtIHtVUkx9IGJhc2VcbiAqIEBwYXJhbSB7Ym9vbGVhbn0gcGF0dGVyblxuICogQHBhcmFtIHtib29sZWFufSBpbnRlcm5hbFxuICogQHBhcmFtIHtTZXQ8c3RyaW5nPn0gY29uZGl0aW9uc1xuICogQHJldHVybnMge1VSTH1cbiAqL1xuZnVuY3Rpb24gcmVzb2x2ZVBhY2thZ2VUYXJnZXQkMShcbiAgcGFja2FnZUpzb25VcmwsXG4gIHRhcmdldCxcbiAgc3VicGF0aCxcbiAgcGFja2FnZVN1YnBhdGgsXG4gIGJhc2UsXG4gIHBhdHRlcm4sXG4gIGludGVybmFsLFxuICBjb25kaXRpb25zXG4pIHtcbiAgaWYgKHR5cGVvZiB0YXJnZXQgPT09ICdzdHJpbmcnKSB7XG4gICAgcmV0dXJuIHJlc29sdmVQYWNrYWdlVGFyZ2V0U3RyaW5nJDEoXG4gICAgICB0YXJnZXQsXG4gICAgICBzdWJwYXRoLFxuICAgICAgcGFja2FnZVN1YnBhdGgsXG4gICAgICBwYWNrYWdlSnNvblVybCxcbiAgICAgIGJhc2UsXG4gICAgICBwYXR0ZXJuLFxuICAgICAgaW50ZXJuYWwsXG4gICAgICBjb25kaXRpb25zXG4gICAgKVxuICB9XG5cbiAgaWYgKEFycmF5LmlzQXJyYXkodGFyZ2V0KSkge1xuICAgIC8qKiBAdHlwZSB7dW5rbm93bltdfSAqL1xuICAgIGNvbnN0IHRhcmdldExpc3QgPSB0YXJnZXQ7XG4gICAgaWYgKHRhcmdldExpc3QubGVuZ3RoID09PSAwKSByZXR1cm4gbnVsbFxuXG4gICAgLyoqIEB0eXBlIHtFcnJvcn0gKi9cbiAgICBsZXQgbGFzdEV4Y2VwdGlvbjtcbiAgICBsZXQgaSA9IC0xO1xuXG4gICAgd2hpbGUgKCsraSA8IHRhcmdldExpc3QubGVuZ3RoKSB7XG4gICAgICBjb25zdCB0YXJnZXRJdGVtID0gdGFyZ2V0TGlzdFtpXTtcbiAgICAgIC8qKiBAdHlwZSB7VVJMfSAqL1xuICAgICAgbGV0IHJlc29sdmVkO1xuICAgICAgdHJ5IHtcbiAgICAgICAgcmVzb2x2ZWQgPSByZXNvbHZlUGFja2FnZVRhcmdldCQxKFxuICAgICAgICAgIHBhY2thZ2VKc29uVXJsLFxuICAgICAgICAgIHRhcmdldEl0ZW0sXG4gICAgICAgICAgc3VicGF0aCxcbiAgICAgICAgICBwYWNrYWdlU3VicGF0aCxcbiAgICAgICAgICBiYXNlLFxuICAgICAgICAgIHBhdHRlcm4sXG4gICAgICAgICAgaW50ZXJuYWwsXG4gICAgICAgICAgY29uZGl0aW9uc1xuICAgICAgICApO1xuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgbGFzdEV4Y2VwdGlvbiA9IGVycm9yO1xuICAgICAgICBpZiAoZXJyb3IuY29kZSA9PT0gJ0VSUl9JTlZBTElEX1BBQ0tBR0VfVEFSR0VUJykgY29udGludWVcbiAgICAgICAgdGhyb3cgZXJyb3JcbiAgICAgIH1cblxuICAgICAgaWYgKHJlc29sdmVkID09PSB1bmRlZmluZWQpIGNvbnRpbnVlXG5cbiAgICAgIGlmIChyZXNvbHZlZCA9PT0gbnVsbCkge1xuICAgICAgICBsYXN0RXhjZXB0aW9uID0gbnVsbDtcbiAgICAgICAgY29udGludWVcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHJlc29sdmVkXG4gICAgfVxuXG4gICAgaWYgKGxhc3RFeGNlcHRpb24gPT09IHVuZGVmaW5lZCB8fCBsYXN0RXhjZXB0aW9uID09PSBudWxsKSB7XG4gICAgICAvLyBAdHMtZXhwZWN0LWVycm9yIFRoZSBkaWZmIGJldHdlZW4gYHVuZGVmaW5lZGAgYW5kIGBudWxsYCBzZWVtcyB0byBiZVxuICAgICAgLy8gaW50ZW50aW9uYWxcbiAgICAgIHJldHVybiBsYXN0RXhjZXB0aW9uXG4gICAgfVxuXG4gICAgdGhyb3cgbGFzdEV4Y2VwdGlvblxuICB9XG5cbiAgaWYgKHR5cGVvZiB0YXJnZXQgPT09ICdvYmplY3QnICYmIHRhcmdldCAhPT0gbnVsbCkge1xuICAgIGNvbnN0IGtleXMgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyh0YXJnZXQpO1xuICAgIGxldCBpID0gLTE7XG5cbiAgICB3aGlsZSAoKytpIDwga2V5cy5sZW5ndGgpIHtcbiAgICAgIGNvbnN0IGtleSA9IGtleXNbaV07XG4gICAgICBpZiAoaXNBcnJheUluZGV4JDEoa2V5KSkge1xuICAgICAgICB0aHJvdyBuZXcgRVJSX0lOVkFMSURfUEFDS0FHRV9DT05GSUckMShcbiAgICAgICAgICBmaWxlVVJMVG9QYXRoJDIocGFja2FnZUpzb25VcmwpLFxuICAgICAgICAgIGJhc2UsXG4gICAgICAgICAgJ1wiZXhwb3J0c1wiIGNhbm5vdCBjb250YWluIG51bWVyaWMgcHJvcGVydHkga2V5cy4nXG4gICAgICAgIClcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpID0gLTE7XG5cbiAgICB3aGlsZSAoKytpIDwga2V5cy5sZW5ndGgpIHtcbiAgICAgIGNvbnN0IGtleSA9IGtleXNbaV07XG4gICAgICBpZiAoa2V5ID09PSAnZGVmYXVsdCcgfHwgKGNvbmRpdGlvbnMgJiYgY29uZGl0aW9ucy5oYXMoa2V5KSkpIHtcbiAgICAgICAgLyoqIEB0eXBlIHt1bmtub3dufSAqL1xuICAgICAgICBjb25zdCBjb25kaXRpb25hbFRhcmdldCA9IHRhcmdldFtrZXldO1xuICAgICAgICBjb25zdCByZXNvbHZlZCA9IHJlc29sdmVQYWNrYWdlVGFyZ2V0JDEoXG4gICAgICAgICAgcGFja2FnZUpzb25VcmwsXG4gICAgICAgICAgY29uZGl0aW9uYWxUYXJnZXQsXG4gICAgICAgICAgc3VicGF0aCxcbiAgICAgICAgICBwYWNrYWdlU3VicGF0aCxcbiAgICAgICAgICBiYXNlLFxuICAgICAgICAgIHBhdHRlcm4sXG4gICAgICAgICAgaW50ZXJuYWwsXG4gICAgICAgICAgY29uZGl0aW9uc1xuICAgICAgICApO1xuICAgICAgICBpZiAocmVzb2x2ZWQgPT09IHVuZGVmaW5lZCkgY29udGludWVcbiAgICAgICAgcmV0dXJuIHJlc29sdmVkXG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHVuZGVmaW5lZFxuICB9XG5cbiAgaWYgKHRhcmdldCA9PT0gbnVsbCkge1xuICAgIHJldHVybiBudWxsXG4gIH1cblxuICB0aHJvd0ludmFsaWRQYWNrYWdlVGFyZ2V0JDEoXG4gICAgcGFja2FnZVN1YnBhdGgsXG4gICAgdGFyZ2V0LFxuICAgIHBhY2thZ2VKc29uVXJsLFxuICAgIGludGVybmFsLFxuICAgIGJhc2VcbiAgKTtcbn1cblxuLyoqXG4gKiBAcGFyYW0ge3Vua25vd259IGV4cG9ydHNcbiAqIEBwYXJhbSB7VVJMfSBwYWNrYWdlSnNvblVybFxuICogQHBhcmFtIHtVUkx9IGJhc2VcbiAqIEByZXR1cm5zIHtib29sZWFufVxuICovXG5mdW5jdGlvbiBpc0NvbmRpdGlvbmFsRXhwb3J0c01haW5TdWdhciQxKGV4cG9ydHMsIHBhY2thZ2VKc29uVXJsLCBiYXNlKSB7XG4gIGlmICh0eXBlb2YgZXhwb3J0cyA9PT0gJ3N0cmluZycgfHwgQXJyYXkuaXNBcnJheShleHBvcnRzKSkgcmV0dXJuIHRydWVcbiAgaWYgKHR5cGVvZiBleHBvcnRzICE9PSAnb2JqZWN0JyB8fCBleHBvcnRzID09PSBudWxsKSByZXR1cm4gZmFsc2VcblxuICBjb25zdCBrZXlzID0gT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXMoZXhwb3J0cyk7XG4gIGxldCBpc0NvbmRpdGlvbmFsU3VnYXIgPSBmYWxzZTtcbiAgbGV0IGkgPSAwO1xuICBsZXQgaiA9IC0xO1xuICB3aGlsZSAoKytqIDwga2V5cy5sZW5ndGgpIHtcbiAgICBjb25zdCBrZXkgPSBrZXlzW2pdO1xuICAgIGNvbnN0IGN1cklzQ29uZGl0aW9uYWxTdWdhciA9IGtleSA9PT0gJycgfHwga2V5WzBdICE9PSAnLic7XG4gICAgaWYgKGkrKyA9PT0gMCkge1xuICAgICAgaXNDb25kaXRpb25hbFN1Z2FyID0gY3VySXNDb25kaXRpb25hbFN1Z2FyO1xuICAgIH0gZWxzZSBpZiAoaXNDb25kaXRpb25hbFN1Z2FyICE9PSBjdXJJc0NvbmRpdGlvbmFsU3VnYXIpIHtcbiAgICAgIHRocm93IG5ldyBFUlJfSU5WQUxJRF9QQUNLQUdFX0NPTkZJRyQxKFxuICAgICAgICBmaWxlVVJMVG9QYXRoJDIocGFja2FnZUpzb25VcmwpLFxuICAgICAgICBiYXNlLFxuICAgICAgICAnXCJleHBvcnRzXCIgY2Fubm90IGNvbnRhaW4gc29tZSBrZXlzIHN0YXJ0aW5nIHdpdGggXFwnLlxcJyBhbmQgc29tZSBub3QuJyArXG4gICAgICAgICAgJyBUaGUgZXhwb3J0cyBvYmplY3QgbXVzdCBlaXRoZXIgYmUgYW4gb2JqZWN0IG9mIHBhY2thZ2Ugc3VicGF0aCBrZXlzJyArXG4gICAgICAgICAgJyBvciBhbiBvYmplY3Qgb2YgbWFpbiBlbnRyeSBjb25kaXRpb24gbmFtZSBrZXlzIG9ubHkuJ1xuICAgICAgKVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiBpc0NvbmRpdGlvbmFsU3VnYXJcbn1cblxuLyoqXG4gKiBAcGFyYW0ge1VSTH0gcGFja2FnZUpzb25VcmxcbiAqIEBwYXJhbSB7c3RyaW5nfSBwYWNrYWdlU3VicGF0aFxuICogQHBhcmFtIHtPYmplY3QuPHN0cmluZywgdW5rbm93bj59IHBhY2thZ2VDb25maWdcbiAqIEBwYXJhbSB7VVJMfSBiYXNlXG4gKiBAcGFyYW0ge1NldDxzdHJpbmc+fSBjb25kaXRpb25zXG4gKiBAcmV0dXJucyB7UmVzb2x2ZU9iamVjdH1cbiAqL1xuZnVuY3Rpb24gcGFja2FnZUV4cG9ydHNSZXNvbHZlJDEoXG4gIHBhY2thZ2VKc29uVXJsLFxuICBwYWNrYWdlU3VicGF0aCxcbiAgcGFja2FnZUNvbmZpZyxcbiAgYmFzZSxcbiAgY29uZGl0aW9uc1xuKSB7XG4gIGxldCBleHBvcnRzID0gcGFja2FnZUNvbmZpZy5leHBvcnRzO1xuICBpZiAoaXNDb25kaXRpb25hbEV4cG9ydHNNYWluU3VnYXIkMShleHBvcnRzLCBwYWNrYWdlSnNvblVybCwgYmFzZSkpXG4gICAgZXhwb3J0cyA9IHsnLic6IGV4cG9ydHN9O1xuXG4gIGlmIChvd24kMi5jYWxsKGV4cG9ydHMsIHBhY2thZ2VTdWJwYXRoKSkge1xuICAgIGNvbnN0IHRhcmdldCA9IGV4cG9ydHNbcGFja2FnZVN1YnBhdGhdO1xuICAgIGNvbnN0IHJlc29sdmVkID0gcmVzb2x2ZVBhY2thZ2VUYXJnZXQkMShcbiAgICAgIHBhY2thZ2VKc29uVXJsLFxuICAgICAgdGFyZ2V0LFxuICAgICAgJycsXG4gICAgICBwYWNrYWdlU3VicGF0aCxcbiAgICAgIGJhc2UsXG4gICAgICBmYWxzZSxcbiAgICAgIGZhbHNlLFxuICAgICAgY29uZGl0aW9uc1xuICAgICk7XG4gICAgaWYgKHJlc29sdmVkID09PSBudWxsIHx8IHJlc29sdmVkID09PSB1bmRlZmluZWQpXG4gICAgICB0aHJvd0V4cG9ydHNOb3RGb3VuZCQxKHBhY2thZ2VTdWJwYXRoLCBwYWNrYWdlSnNvblVybCwgYmFzZSk7XG4gICAgcmV0dXJuIHtyZXNvbHZlZCwgZXhhY3Q6IHRydWV9XG4gIH1cblxuICBsZXQgYmVzdE1hdGNoID0gJyc7XG4gIGNvbnN0IGtleXMgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyhleHBvcnRzKTtcbiAgbGV0IGkgPSAtMTtcblxuICB3aGlsZSAoKytpIDwga2V5cy5sZW5ndGgpIHtcbiAgICBjb25zdCBrZXkgPSBrZXlzW2ldO1xuICAgIGlmIChcbiAgICAgIGtleVtrZXkubGVuZ3RoIC0gMV0gPT09ICcqJyAmJlxuICAgICAgcGFja2FnZVN1YnBhdGguc3RhcnRzV2l0aChrZXkuc2xpY2UoMCwgLTEpKSAmJlxuICAgICAgcGFja2FnZVN1YnBhdGgubGVuZ3RoID49IGtleS5sZW5ndGggJiZcbiAgICAgIGtleS5sZW5ndGggPiBiZXN0TWF0Y2gubGVuZ3RoXG4gICAgKSB7XG4gICAgICBiZXN0TWF0Y2ggPSBrZXk7XG4gICAgfSBlbHNlIGlmIChcbiAgICAgIGtleVtrZXkubGVuZ3RoIC0gMV0gPT09ICcvJyAmJlxuICAgICAgcGFja2FnZVN1YnBhdGguc3RhcnRzV2l0aChrZXkpICYmXG4gICAgICBrZXkubGVuZ3RoID4gYmVzdE1hdGNoLmxlbmd0aFxuICAgICkge1xuICAgICAgYmVzdE1hdGNoID0ga2V5O1xuICAgIH1cbiAgfVxuXG4gIGlmIChiZXN0TWF0Y2gpIHtcbiAgICBjb25zdCB0YXJnZXQgPSBleHBvcnRzW2Jlc3RNYXRjaF07XG4gICAgY29uc3QgcGF0dGVybiA9IGJlc3RNYXRjaFtiZXN0TWF0Y2gubGVuZ3RoIC0gMV0gPT09ICcqJztcbiAgICBjb25zdCBzdWJwYXRoID0gcGFja2FnZVN1YnBhdGguc2xpY2UoYmVzdE1hdGNoLmxlbmd0aCAtIChwYXR0ZXJuID8gMSA6IDApKTtcbiAgICBjb25zdCByZXNvbHZlZCA9IHJlc29sdmVQYWNrYWdlVGFyZ2V0JDEoXG4gICAgICBwYWNrYWdlSnNvblVybCxcbiAgICAgIHRhcmdldCxcbiAgICAgIHN1YnBhdGgsXG4gICAgICBiZXN0TWF0Y2gsXG4gICAgICBiYXNlLFxuICAgICAgcGF0dGVybixcbiAgICAgIGZhbHNlLFxuICAgICAgY29uZGl0aW9uc1xuICAgICk7XG4gICAgaWYgKHJlc29sdmVkID09PSBudWxsIHx8IHJlc29sdmVkID09PSB1bmRlZmluZWQpXG4gICAgICB0aHJvd0V4cG9ydHNOb3RGb3VuZCQxKHBhY2thZ2VTdWJwYXRoLCBwYWNrYWdlSnNvblVybCwgYmFzZSk7XG4gICAgaWYgKCFwYXR0ZXJuKVxuICAgICAgZW1pdEZvbGRlck1hcERlcHJlY2F0aW9uJDEoYmVzdE1hdGNoLCBwYWNrYWdlSnNvblVybCwgdHJ1ZSwgYmFzZSk7XG4gICAgcmV0dXJuIHtyZXNvbHZlZCwgZXhhY3Q6IHBhdHRlcm59XG4gIH1cblxuICB0aHJvd0V4cG9ydHNOb3RGb3VuZCQxKHBhY2thZ2VTdWJwYXRoLCBwYWNrYWdlSnNvblVybCwgYmFzZSk7XG59XG5cbi8qKlxuICogQHBhcmFtIHtzdHJpbmd9IG5hbWVcbiAqIEBwYXJhbSB7VVJMfSBiYXNlXG4gKiBAcGFyYW0ge1NldDxzdHJpbmc+fSBbY29uZGl0aW9uc11cbiAqIEByZXR1cm5zIHtSZXNvbHZlT2JqZWN0fVxuICovXG5mdW5jdGlvbiBwYWNrYWdlSW1wb3J0c1Jlc29sdmUkMShuYW1lLCBiYXNlLCBjb25kaXRpb25zKSB7XG4gIGlmIChuYW1lID09PSAnIycgfHwgbmFtZS5zdGFydHNXaXRoKCcjLycpKSB7XG4gICAgY29uc3QgcmVhc29uID0gJ2lzIG5vdCBhIHZhbGlkIGludGVybmFsIGltcG9ydHMgc3BlY2lmaWVyIG5hbWUnO1xuICAgIHRocm93IG5ldyBFUlJfSU5WQUxJRF9NT0RVTEVfU1BFQ0lGSUVSJDEobmFtZSwgcmVhc29uLCBmaWxlVVJMVG9QYXRoJDIoYmFzZSkpXG4gIH1cblxuICAvKiogQHR5cGUge1VSTH0gKi9cbiAgbGV0IHBhY2thZ2VKc29uVXJsO1xuXG4gIGNvbnN0IHBhY2thZ2VDb25maWcgPSBnZXRQYWNrYWdlU2NvcGVDb25maWckMShiYXNlKTtcblxuICBpZiAocGFja2FnZUNvbmZpZy5leGlzdHMpIHtcbiAgICBwYWNrYWdlSnNvblVybCA9IHBhdGhUb0ZpbGVVUkwocGFja2FnZUNvbmZpZy5wanNvblBhdGgpO1xuICAgIGNvbnN0IGltcG9ydHMgPSBwYWNrYWdlQ29uZmlnLmltcG9ydHM7XG4gICAgaWYgKGltcG9ydHMpIHtcbiAgICAgIGlmIChvd24kMi5jYWxsKGltcG9ydHMsIG5hbWUpKSB7XG4gICAgICAgIGNvbnN0IHJlc29sdmVkID0gcmVzb2x2ZVBhY2thZ2VUYXJnZXQkMShcbiAgICAgICAgICBwYWNrYWdlSnNvblVybCxcbiAgICAgICAgICBpbXBvcnRzW25hbWVdLFxuICAgICAgICAgICcnLFxuICAgICAgICAgIG5hbWUsXG4gICAgICAgICAgYmFzZSxcbiAgICAgICAgICBmYWxzZSxcbiAgICAgICAgICB0cnVlLFxuICAgICAgICAgIGNvbmRpdGlvbnNcbiAgICAgICAgKTtcbiAgICAgICAgaWYgKHJlc29sdmVkICE9PSBudWxsKSByZXR1cm4ge3Jlc29sdmVkLCBleGFjdDogdHJ1ZX1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGxldCBiZXN0TWF0Y2ggPSAnJztcbiAgICAgICAgY29uc3Qga2V5cyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzKGltcG9ydHMpO1xuICAgICAgICBsZXQgaSA9IC0xO1xuXG4gICAgICAgIHdoaWxlICgrK2kgPCBrZXlzLmxlbmd0aCkge1xuICAgICAgICAgIGNvbnN0IGtleSA9IGtleXNbaV07XG5cbiAgICAgICAgICBpZiAoXG4gICAgICAgICAgICBrZXlba2V5Lmxlbmd0aCAtIDFdID09PSAnKicgJiZcbiAgICAgICAgICAgIG5hbWUuc3RhcnRzV2l0aChrZXkuc2xpY2UoMCwgLTEpKSAmJlxuICAgICAgICAgICAgbmFtZS5sZW5ndGggPj0ga2V5Lmxlbmd0aCAmJlxuICAgICAgICAgICAga2V5Lmxlbmd0aCA+IGJlc3RNYXRjaC5sZW5ndGhcbiAgICAgICAgICApIHtcbiAgICAgICAgICAgIGJlc3RNYXRjaCA9IGtleTtcbiAgICAgICAgICB9IGVsc2UgaWYgKFxuICAgICAgICAgICAga2V5W2tleS5sZW5ndGggLSAxXSA9PT0gJy8nICYmXG4gICAgICAgICAgICBuYW1lLnN0YXJ0c1dpdGgoa2V5KSAmJlxuICAgICAgICAgICAga2V5Lmxlbmd0aCA+IGJlc3RNYXRjaC5sZW5ndGhcbiAgICAgICAgICApIHtcbiAgICAgICAgICAgIGJlc3RNYXRjaCA9IGtleTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoYmVzdE1hdGNoKSB7XG4gICAgICAgICAgY29uc3QgdGFyZ2V0ID0gaW1wb3J0c1tiZXN0TWF0Y2hdO1xuICAgICAgICAgIGNvbnN0IHBhdHRlcm4gPSBiZXN0TWF0Y2hbYmVzdE1hdGNoLmxlbmd0aCAtIDFdID09PSAnKic7XG4gICAgICAgICAgY29uc3Qgc3VicGF0aCA9IG5hbWUuc2xpY2UoYmVzdE1hdGNoLmxlbmd0aCAtIChwYXR0ZXJuID8gMSA6IDApKTtcbiAgICAgICAgICBjb25zdCByZXNvbHZlZCA9IHJlc29sdmVQYWNrYWdlVGFyZ2V0JDEoXG4gICAgICAgICAgICBwYWNrYWdlSnNvblVybCxcbiAgICAgICAgICAgIHRhcmdldCxcbiAgICAgICAgICAgIHN1YnBhdGgsXG4gICAgICAgICAgICBiZXN0TWF0Y2gsXG4gICAgICAgICAgICBiYXNlLFxuICAgICAgICAgICAgcGF0dGVybixcbiAgICAgICAgICAgIHRydWUsXG4gICAgICAgICAgICBjb25kaXRpb25zXG4gICAgICAgICAgKTtcbiAgICAgICAgICBpZiAocmVzb2x2ZWQgIT09IG51bGwpIHtcbiAgICAgICAgICAgIGlmICghcGF0dGVybilcbiAgICAgICAgICAgICAgZW1pdEZvbGRlck1hcERlcHJlY2F0aW9uJDEoYmVzdE1hdGNoLCBwYWNrYWdlSnNvblVybCwgZmFsc2UsIGJhc2UpO1xuICAgICAgICAgICAgcmV0dXJuIHtyZXNvbHZlZCwgZXhhY3Q6IHBhdHRlcm59XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgdGhyb3dJbXBvcnROb3REZWZpbmVkJDEobmFtZSwgcGFja2FnZUpzb25VcmwsIGJhc2UpO1xufVxuXG4vKipcbiAqIEBwYXJhbSB7c3RyaW5nfSB1cmxcbiAqIEByZXR1cm5zIHtQYWNrYWdlVHlwZX1cbiAqL1xuZnVuY3Rpb24gZ2V0UGFja2FnZVR5cGUkMSh1cmwpIHtcbiAgY29uc3QgcGFja2FnZUNvbmZpZyA9IGdldFBhY2thZ2VTY29wZUNvbmZpZyQxKHVybCk7XG4gIHJldHVybiBwYWNrYWdlQ29uZmlnLnR5cGVcbn1cblxuLyoqXG4gKiBAcGFyYW0ge3N0cmluZ30gc3BlY2lmaWVyXG4gKiBAcGFyYW0ge1VSTH0gYmFzZVxuICovXG5mdW5jdGlvbiBwYXJzZVBhY2thZ2VOYW1lJDEoc3BlY2lmaWVyLCBiYXNlKSB7XG4gIGxldCBzZXBhcmF0b3JJbmRleCA9IHNwZWNpZmllci5pbmRleE9mKCcvJyk7XG4gIGxldCB2YWxpZFBhY2thZ2VOYW1lID0gdHJ1ZTtcbiAgbGV0IGlzU2NvcGVkID0gZmFsc2U7XG4gIGlmIChzcGVjaWZpZXJbMF0gPT09ICdAJykge1xuICAgIGlzU2NvcGVkID0gdHJ1ZTtcbiAgICBpZiAoc2VwYXJhdG9ySW5kZXggPT09IC0xIHx8IHNwZWNpZmllci5sZW5ndGggPT09IDApIHtcbiAgICAgIHZhbGlkUGFja2FnZU5hbWUgPSBmYWxzZTtcbiAgICB9IGVsc2Uge1xuICAgICAgc2VwYXJhdG9ySW5kZXggPSBzcGVjaWZpZXIuaW5kZXhPZignLycsIHNlcGFyYXRvckluZGV4ICsgMSk7XG4gICAgfVxuICB9XG5cbiAgY29uc3QgcGFja2FnZU5hbWUgPVxuICAgIHNlcGFyYXRvckluZGV4ID09PSAtMSA/IHNwZWNpZmllciA6IHNwZWNpZmllci5zbGljZSgwLCBzZXBhcmF0b3JJbmRleCk7XG5cbiAgLy8gUGFja2FnZSBuYW1lIGNhbm5vdCBoYXZlIGxlYWRpbmcgLiBhbmQgY2Fubm90IGhhdmUgcGVyY2VudC1lbmNvZGluZyBvclxuICAvLyBzZXBhcmF0b3JzLlxuICBsZXQgaSA9IC0xO1xuICB3aGlsZSAoKytpIDwgcGFja2FnZU5hbWUubGVuZ3RoKSB7XG4gICAgaWYgKHBhY2thZ2VOYW1lW2ldID09PSAnJScgfHwgcGFja2FnZU5hbWVbaV0gPT09ICdcXFxcJykge1xuICAgICAgdmFsaWRQYWNrYWdlTmFtZSA9IGZhbHNlO1xuICAgICAgYnJlYWtcbiAgICB9XG4gIH1cblxuICBpZiAoIXZhbGlkUGFja2FnZU5hbWUpIHtcbiAgICB0aHJvdyBuZXcgRVJSX0lOVkFMSURfTU9EVUxFX1NQRUNJRklFUiQxKFxuICAgICAgc3BlY2lmaWVyLFxuICAgICAgJ2lzIG5vdCBhIHZhbGlkIHBhY2thZ2UgbmFtZScsXG4gICAgICBmaWxlVVJMVG9QYXRoJDIoYmFzZSlcbiAgICApXG4gIH1cblxuICBjb25zdCBwYWNrYWdlU3VicGF0aCA9XG4gICAgJy4nICsgKHNlcGFyYXRvckluZGV4ID09PSAtMSA/ICcnIDogc3BlY2lmaWVyLnNsaWNlKHNlcGFyYXRvckluZGV4KSk7XG5cbiAgcmV0dXJuIHtwYWNrYWdlTmFtZSwgcGFja2FnZVN1YnBhdGgsIGlzU2NvcGVkfVxufVxuXG4vKipcbiAqIEBwYXJhbSB7c3RyaW5nfSBzcGVjaWZpZXJcbiAqIEBwYXJhbSB7VVJMfSBiYXNlXG4gKiBAcGFyYW0ge1NldDxzdHJpbmc+fSBjb25kaXRpb25zXG4gKiBAcmV0dXJucyB7VVJMfVxuICovXG5mdW5jdGlvbiBwYWNrYWdlUmVzb2x2ZSQxKHNwZWNpZmllciwgYmFzZSwgY29uZGl0aW9ucykge1xuICBjb25zdCB7cGFja2FnZU5hbWUsIHBhY2thZ2VTdWJwYXRoLCBpc1Njb3BlZH0gPSBwYXJzZVBhY2thZ2VOYW1lJDEoXG4gICAgc3BlY2lmaWVyLFxuICAgIGJhc2VcbiAgKTtcblxuICAvLyBSZXNvbHZlU2VsZlxuICBjb25zdCBwYWNrYWdlQ29uZmlnID0gZ2V0UGFja2FnZVNjb3BlQ29uZmlnJDEoYmFzZSk7XG5cbiAgLy8gQ2Fu4oCZdCB0ZXN0LlxuICAvKiBjOCBpZ25vcmUgbmV4dCAxNiAqL1xuICBpZiAocGFja2FnZUNvbmZpZy5leGlzdHMpIHtcbiAgICBjb25zdCBwYWNrYWdlSnNvblVybCA9IHBhdGhUb0ZpbGVVUkwocGFja2FnZUNvbmZpZy5wanNvblBhdGgpO1xuICAgIGlmIChcbiAgICAgIHBhY2thZ2VDb25maWcubmFtZSA9PT0gcGFja2FnZU5hbWUgJiZcbiAgICAgIHBhY2thZ2VDb25maWcuZXhwb3J0cyAhPT0gdW5kZWZpbmVkICYmXG4gICAgICBwYWNrYWdlQ29uZmlnLmV4cG9ydHMgIT09IG51bGxcbiAgICApIHtcbiAgICAgIHJldHVybiBwYWNrYWdlRXhwb3J0c1Jlc29sdmUkMShcbiAgICAgICAgcGFja2FnZUpzb25VcmwsXG4gICAgICAgIHBhY2thZ2VTdWJwYXRoLFxuICAgICAgICBwYWNrYWdlQ29uZmlnLFxuICAgICAgICBiYXNlLFxuICAgICAgICBjb25kaXRpb25zXG4gICAgICApLnJlc29sdmVkXG4gICAgfVxuICB9XG5cbiAgbGV0IHBhY2thZ2VKc29uVXJsID0gbmV3IFVSTCQxKFxuICAgICcuL25vZGVfbW9kdWxlcy8nICsgcGFja2FnZU5hbWUgKyAnL3BhY2thZ2UuanNvbicsXG4gICAgYmFzZVxuICApO1xuICBsZXQgcGFja2FnZUpzb25QYXRoID0gZmlsZVVSTFRvUGF0aCQyKHBhY2thZ2VKc29uVXJsKTtcbiAgLyoqIEB0eXBlIHtzdHJpbmd9ICovXG4gIGxldCBsYXN0UGF0aDtcbiAgZG8ge1xuICAgIGNvbnN0IHN0YXQgPSB0cnlTdGF0U3luYyQxKHBhY2thZ2VKc29uUGF0aC5zbGljZSgwLCAtMTMpKTtcbiAgICBpZiAoIXN0YXQuaXNEaXJlY3RvcnkoKSkge1xuICAgICAgbGFzdFBhdGggPSBwYWNrYWdlSnNvblBhdGg7XG4gICAgICBwYWNrYWdlSnNvblVybCA9IG5ldyBVUkwkMShcbiAgICAgICAgKGlzU2NvcGVkID8gJy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy8nIDogJy4uLy4uLy4uL25vZGVfbW9kdWxlcy8nKSArXG4gICAgICAgICAgcGFja2FnZU5hbWUgK1xuICAgICAgICAgICcvcGFja2FnZS5qc29uJyxcbiAgICAgICAgcGFja2FnZUpzb25VcmxcbiAgICAgICk7XG4gICAgICBwYWNrYWdlSnNvblBhdGggPSBmaWxlVVJMVG9QYXRoJDIocGFja2FnZUpzb25VcmwpO1xuICAgICAgY29udGludWVcbiAgICB9XG5cbiAgICAvLyBQYWNrYWdlIG1hdGNoLlxuICAgIGNvbnN0IHBhY2thZ2VDb25maWcgPSBnZXRQYWNrYWdlQ29uZmlnJDEocGFja2FnZUpzb25QYXRoLCBzcGVjaWZpZXIsIGJhc2UpO1xuICAgIGlmIChwYWNrYWdlQ29uZmlnLmV4cG9ydHMgIT09IHVuZGVmaW5lZCAmJiBwYWNrYWdlQ29uZmlnLmV4cG9ydHMgIT09IG51bGwpXG4gICAgICByZXR1cm4gcGFja2FnZUV4cG9ydHNSZXNvbHZlJDEoXG4gICAgICAgIHBhY2thZ2VKc29uVXJsLFxuICAgICAgICBwYWNrYWdlU3VicGF0aCxcbiAgICAgICAgcGFja2FnZUNvbmZpZyxcbiAgICAgICAgYmFzZSxcbiAgICAgICAgY29uZGl0aW9uc1xuICAgICAgKS5yZXNvbHZlZFxuICAgIGlmIChwYWNrYWdlU3VicGF0aCA9PT0gJy4nKVxuICAgICAgcmV0dXJuIGxlZ2FjeU1haW5SZXNvbHZlJDEocGFja2FnZUpzb25VcmwsIHBhY2thZ2VDb25maWcsIGJhc2UpXG4gICAgcmV0dXJuIG5ldyBVUkwkMShwYWNrYWdlU3VicGF0aCwgcGFja2FnZUpzb25VcmwpXG4gICAgLy8gQ3Jvc3MtcGxhdGZvcm0gcm9vdCBjaGVjay5cbiAgfSB3aGlsZSAocGFja2FnZUpzb25QYXRoLmxlbmd0aCAhPT0gbGFzdFBhdGgubGVuZ3RoKVxuXG4gIHRocm93IG5ldyBFUlJfTU9EVUxFX05PVF9GT1VORCQxKHBhY2thZ2VOYW1lLCBmaWxlVVJMVG9QYXRoJDIoYmFzZSkpXG59XG5cbi8qKlxuICogQHBhcmFtIHtzdHJpbmd9IHNwZWNpZmllclxuICogQHJldHVybnMge2Jvb2xlYW59XG4gKi9cbmZ1bmN0aW9uIGlzUmVsYXRpdmVTcGVjaWZpZXIkMShzcGVjaWZpZXIpIHtcbiAgaWYgKHNwZWNpZmllclswXSA9PT0gJy4nKSB7XG4gICAgaWYgKHNwZWNpZmllci5sZW5ndGggPT09IDEgfHwgc3BlY2lmaWVyWzFdID09PSAnLycpIHJldHVybiB0cnVlXG4gICAgaWYgKFxuICAgICAgc3BlY2lmaWVyWzFdID09PSAnLicgJiZcbiAgICAgIChzcGVjaWZpZXIubGVuZ3RoID09PSAyIHx8IHNwZWNpZmllclsyXSA9PT0gJy8nKVxuICAgICkge1xuICAgICAgcmV0dXJuIHRydWVcbiAgICB9XG4gIH1cblxuICByZXR1cm4gZmFsc2Vcbn1cblxuLyoqXG4gKiBAcGFyYW0ge3N0cmluZ30gc3BlY2lmaWVyXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAqL1xuZnVuY3Rpb24gc2hvdWxkQmVUcmVhdGVkQXNSZWxhdGl2ZU9yQWJzb2x1dGVQYXRoJDEoc3BlY2lmaWVyKSB7XG4gIGlmIChzcGVjaWZpZXIgPT09ICcnKSByZXR1cm4gZmFsc2VcbiAgaWYgKHNwZWNpZmllclswXSA9PT0gJy8nKSByZXR1cm4gdHJ1ZVxuICByZXR1cm4gaXNSZWxhdGl2ZVNwZWNpZmllciQxKHNwZWNpZmllcilcbn1cblxuLyoqXG4gKiBUaGUg4oCcUmVzb2x2ZXIgQWxnb3JpdGhtIFNwZWNpZmljYXRpb27igJ0gYXMgZGV0YWlsZWQgaW4gdGhlIE5vZGUgZG9jcyAod2hpY2ggaXNcbiAqIHN5bmMgYW5kIHNsaWdodGx5IGxvd2VyLWxldmVsIHRoYW4gYHJlc29sdmVgKS5cbiAqXG4gKlxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBzcGVjaWZpZXJcbiAqIEBwYXJhbSB7VVJMfSBiYXNlXG4gKiBAcGFyYW0ge1NldDxzdHJpbmc+fSBbY29uZGl0aW9uc11cbiAqIEByZXR1cm5zIHtVUkx9XG4gKi9cbmZ1bmN0aW9uIG1vZHVsZVJlc29sdmUkMShzcGVjaWZpZXIsIGJhc2UsIGNvbmRpdGlvbnMpIHtcbiAgLy8gT3JkZXIgc3dhcHBlZCBmcm9tIHNwZWMgZm9yIG1pbm9yIHBlcmYgZ2Fpbi5cbiAgLy8gT2sgc2luY2UgcmVsYXRpdmUgVVJMcyBjYW5ub3QgcGFyc2UgYXMgVVJMcy5cbiAgLyoqIEB0eXBlIHtVUkx9ICovXG4gIGxldCByZXNvbHZlZDtcblxuICBpZiAoc2hvdWxkQmVUcmVhdGVkQXNSZWxhdGl2ZU9yQWJzb2x1dGVQYXRoJDEoc3BlY2lmaWVyKSkge1xuICAgIHJlc29sdmVkID0gbmV3IFVSTCQxKHNwZWNpZmllciwgYmFzZSk7XG4gIH0gZWxzZSBpZiAoc3BlY2lmaWVyWzBdID09PSAnIycpIHtcbih7cmVzb2x2ZWR9ID0gcGFja2FnZUltcG9ydHNSZXNvbHZlJDEoc3BlY2lmaWVyLCBiYXNlLCBjb25kaXRpb25zKSk7XG4gIH0gZWxzZSB7XG4gICAgdHJ5IHtcbiAgICAgIHJlc29sdmVkID0gbmV3IFVSTCQxKHNwZWNpZmllcik7XG4gICAgfSBjYXRjaCB7XG4gICAgICByZXNvbHZlZCA9IHBhY2thZ2VSZXNvbHZlJDEoc3BlY2lmaWVyLCBiYXNlLCBjb25kaXRpb25zKTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gZmluYWxpemVSZXNvbHV0aW9uJDEocmVzb2x2ZWQsIGJhc2UpXG59XG5cbmNvbnN0IERFRkFVTFRfQ09ORElUSU9OU19TRVQkMSA9IG5ldyBTZXQoW1wibm9kZVwiLCBcImltcG9ydFwiXSk7XG5jb25zdCBERUZBVUxUX1VSTCQxID0gcGF0aFRvRmlsZVVSTChwcm9jZXNzLmN3ZCgpKTtcbmNvbnN0IERFRkFVTFRfRVhURU5TSU9OUyQxID0gW1wiLm1qc1wiLCBcIi5janNcIiwgXCIuanNcIiwgXCIuanNvblwiXTtcbmNvbnN0IE5PVF9GT1VORF9FUlJPUlMkMSA9IG5ldyBTZXQoW1wiRVJSX01PRFVMRV9OT1RfRk9VTkRcIiwgXCJFUlJfVU5TVVBQT1JURURfRElSX0lNUE9SVFwiLCBcIk1PRFVMRV9OT1RfRk9VTkRcIl0pO1xuZnVuY3Rpb24gX3RyeU1vZHVsZVJlc29sdmUkMShpZCwgdXJsLCBjb25kaXRpb25zKSB7XG4gIHRyeSB7XG4gICAgcmV0dXJuIG1vZHVsZVJlc29sdmUkMShpZCwgdXJsLCBjb25kaXRpb25zKTtcbiAgfSBjYXRjaCAoZXJyKSB7XG4gICAgaWYgKCFOT1RfRk9VTkRfRVJST1JTJDEuaGFzKGVyci5jb2RlKSkge1xuICAgICAgdGhyb3cgZXJyO1xuICAgIH1cbiAgICByZXR1cm4gbnVsbDtcbiAgfVxufVxuZnVuY3Rpb24gX3Jlc29sdmUkMShpZCwgb3B0cyA9IHt9KSB7XG4gIGlmICgvKG5vZGV8ZGF0YXxodHRwfGh0dHBzKTovLnRlc3QoaWQpKSB7XG4gICAgcmV0dXJuIGlkO1xuICB9XG4gIGlmIChCVUlMVElOX01PRFVMRVMkMS5oYXMoaWQpKSB7XG4gICAgcmV0dXJuIFwibm9kZTpcIiArIGlkO1xuICB9XG4gIGlmIChpc0Fic29sdXRlJDEoaWQpKSB7XG4gICAgcmV0dXJuIGlkO1xuICB9XG4gIGNvbnN0IGNvbmRpdGlvbnNTZXQgPSBvcHRzLmNvbmRpdGlvbnMgPyBuZXcgU2V0KG9wdHMuY29uZGl0aW9ucykgOiBERUZBVUxUX0NPTkRJVElPTlNfU0VUJDE7XG4gIGNvbnN0IF91cmxzID0gKEFycmF5LmlzQXJyYXkob3B0cy51cmwpID8gb3B0cy51cmwgOiBbb3B0cy51cmxdKS5maWx0ZXIoQm9vbGVhbikubWFwKCh1KSA9PiBuZXcgVVJMKG5vcm1hbGl6ZWlkJDEodS50b1N0cmluZygpKSkpO1xuICBpZiAoIV91cmxzLmxlbmd0aCkge1xuICAgIF91cmxzLnB1c2goREVGQVVMVF9VUkwkMSk7XG4gIH1cbiAgY29uc3QgdXJscyA9IFsuLi5fdXJsc107XG4gIGZvciAoY29uc3QgdXJsIG9mIF91cmxzKSB7XG4gICAgaWYgKHVybC5wcm90b2NvbCA9PT0gXCJmaWxlOlwiICYmICF1cmwucGF0aG5hbWUuaW5jbHVkZXMoXCJub2RlX21vZHVsZXNcIikpIHtcbiAgICAgIGNvbnN0IG5ld1VSTCA9IG5ldyBVUkwodXJsKTtcbiAgICAgIG5ld1VSTC5wYXRobmFtZSArPSBcIi9ub2RlX21vZHVsZXNcIjtcbiAgICAgIHVybHMucHVzaChuZXdVUkwpO1xuICAgIH1cbiAgfVxuICBsZXQgcmVzb2x2ZWQ7XG4gIGZvciAoY29uc3QgdXJsIG9mIHVybHMpIHtcbiAgICByZXNvbHZlZCA9IF90cnlNb2R1bGVSZXNvbHZlJDEoaWQsIHVybCwgY29uZGl0aW9uc1NldCk7XG4gICAgaWYgKHJlc29sdmVkKSB7XG4gICAgICBicmVhaztcbiAgICB9XG4gICAgZm9yIChjb25zdCBwcmVmaXggb2YgW1wiXCIsIFwiL2luZGV4XCJdKSB7XG4gICAgICBmb3IgKGNvbnN0IGV4dCBvZiBvcHRzLmV4dGVuc2lvbnMgfHwgREVGQVVMVF9FWFRFTlNJT05TJDEpIHtcbiAgICAgICAgcmVzb2x2ZWQgPSBfdHJ5TW9kdWxlUmVzb2x2ZSQxKGlkICsgcHJlZml4ICsgZXh0LCB1cmwsIGNvbmRpdGlvbnNTZXQpO1xuICAgICAgICBpZiAocmVzb2x2ZWQpIHtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgaWYgKHJlc29sdmVkKSB7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cbiAgfVxuICBpZiAoIXJlc29sdmVkKSB7XG4gICAgY29uc3QgZXJyID0gbmV3IEVycm9yKGBDYW5ub3QgZmluZCBtb2R1bGUgJHtpZH0gaW1wb3J0ZWQgZnJvbSAke3VybHMuam9pbihcIiwgXCIpfWApO1xuICAgIGVyci5jb2RlID0gXCJFUlJfTU9EVUxFX05PVF9GT1VORFwiO1xuICAgIHRocm93IGVycjtcbiAgfVxuICBjb25zdCByZWFsUGF0aCA9IHJlYWxwYXRoU3luYyhmaWxlVVJMVG9QYXRoJDEocmVzb2x2ZWQpKTtcbiAgcmV0dXJuIHBhdGhUb0ZpbGVVUkwocmVhbFBhdGgpLnRvU3RyaW5nKCk7XG59XG5mdW5jdGlvbiByZXNvbHZlU3luYyQxKGlkLCBvcHRzKSB7XG4gIHJldHVybiBfcmVzb2x2ZSQxKGlkLCBvcHRzKTtcbn1cbmZ1bmN0aW9uIHJlc29sdmUoaWQsIG9wdHMpIHtcbiAgcmV0dXJuIHBjYWxsJDEocmVzb2x2ZVN5bmMkMSwgaWQsIG9wdHMpO1xufVxuZnVuY3Rpb24gcmVzb2x2ZVBhdGhTeW5jJDEoaWQsIG9wdHMpIHtcbiAgcmV0dXJuIGZpbGVVUkxUb1BhdGgkMShyZXNvbHZlU3luYyQxKGlkLCBvcHRzKSk7XG59XG5mdW5jdGlvbiByZXNvbHZlUGF0aCQxKGlkLCBvcHRzKSB7XG4gIHJldHVybiBwY2FsbCQxKHJlc29sdmVQYXRoU3luYyQxLCBpZCwgb3B0cyk7XG59XG5mdW5jdGlvbiBjcmVhdGVSZXNvbHZlKGRlZmF1bHRzKSB7XG4gIHJldHVybiAoaWQsIHVybCkgPT4ge1xuICAgIHJldHVybiByZXNvbHZlKGlkLCB7IHVybCwgLi4uZGVmYXVsdHMgfSk7XG4gIH07XG59XG5cbmNvbnN0IEVWQUxfRVNNX0lNUE9SVF9SRSA9IC8oPzw9aW1wb3J0IC4qIGZyb20gWydcIl0pKFteJ1wiXSspKD89WydcIl0pfCg/PD1leHBvcnQgLiogZnJvbSBbJ1wiXSkoW14nXCJdKykoPz1bJ1wiXSl8KD88PWltcG9ydFxccypbJ1wiXSkoW14nXCJdKykoPz1bJ1wiXSl8KD88PWltcG9ydFxccypcXChbJ1wiXSkoW14nXCJdKykoPz1bJ1wiXVxcKSkvZztcbmFzeW5jIGZ1bmN0aW9uIGxvYWRNb2R1bGUoaWQsIG9wdHMgPSB7fSkge1xuICBjb25zdCB1cmwgPSBhd2FpdCByZXNvbHZlKGlkLCBvcHRzKTtcbiAgY29uc3QgY29kZSA9IGF3YWl0IGxvYWRVUkwodXJsKTtcbiAgcmV0dXJuIGV2YWxNb2R1bGUoY29kZSwgeyAuLi5vcHRzLCB1cmwgfSk7XG59XG5hc3luYyBmdW5jdGlvbiBldmFsTW9kdWxlKGNvZGUsIG9wdHMgPSB7fSkge1xuICBjb25zdCB0cmFuc2Zvcm1lZCA9IGF3YWl0IHRyYW5zZm9ybU1vZHVsZShjb2RlLCBvcHRzKTtcbiAgY29uc3QgZGF0YVVSTCA9IHRvRGF0YVVSTCh0cmFuc2Zvcm1lZCk7XG4gIHJldHVybiBpbXBvcnQoZGF0YVVSTCkuY2F0Y2goKGVycikgPT4ge1xuICAgIGVyci5zdGFjayA9IGVyci5zdGFjay5yZXBsYWNlKG5ldyBSZWdFeHAoZGF0YVVSTCwgXCJnXCIpLCBvcHRzLnVybCB8fCBcIl9tbGx5X2V2YWxfXCIpO1xuICAgIHRocm93IGVycjtcbiAgfSk7XG59XG5mdW5jdGlvbiB0cmFuc2Zvcm1Nb2R1bGUoY29kZSwgb3B0cykge1xuICBpZiAob3B0cy51cmwgJiYgb3B0cy51cmwuZW5kc1dpdGgoXCIuanNvblwiKSkge1xuICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoXCJleHBvcnQgZGVmYXVsdCBcIiArIGNvZGUpO1xuICB9XG4gIGlmIChvcHRzLnVybCkge1xuICAgIGNvZGUgPSBjb2RlLnJlcGxhY2UoL2ltcG9ydFxcLm1ldGFcXC51cmwvZywgYCcke29wdHMudXJsfSdgKTtcbiAgfVxuICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKGNvZGUpO1xufVxuYXN5bmMgZnVuY3Rpb24gcmVzb2x2ZUltcG9ydHMoY29kZSwgb3B0cykge1xuICBjb25zdCBpbXBvcnRzID0gQXJyYXkuZnJvbShjb2RlLm1hdGNoQWxsKEVWQUxfRVNNX0lNUE9SVF9SRSkpLm1hcCgobSkgPT4gbVswXSk7XG4gIGlmICghaW1wb3J0cy5sZW5ndGgpIHtcbiAgICByZXR1cm4gY29kZTtcbiAgfVxuICBjb25zdCB1bmlxdWVJbXBvcnRzID0gQXJyYXkuZnJvbShuZXcgU2V0KGltcG9ydHMpKTtcbiAgY29uc3QgcmVzb2x2ZWQgPSBuZXcgTWFwKCk7XG4gIGF3YWl0IFByb21pc2UuYWxsKHVuaXF1ZUltcG9ydHMubWFwKGFzeW5jIChpZCkgPT4ge1xuICAgIGxldCB1cmwgPSBhd2FpdCByZXNvbHZlKGlkLCBvcHRzKTtcbiAgICBpZiAodXJsLmVuZHNXaXRoKFwiLmpzb25cIikpIHtcbiAgICAgIGNvbnN0IGNvZGUyID0gYXdhaXQgbG9hZFVSTCh1cmwpO1xuICAgICAgdXJsID0gdG9EYXRhVVJMKGF3YWl0IHRyYW5zZm9ybU1vZHVsZShjb2RlMiwgeyB1cmwgfSkpO1xuICAgIH1cbiAgICByZXNvbHZlZC5zZXQoaWQsIHVybCk7XG4gIH0pKTtcbiAgY29uc3QgcmUgPSBuZXcgUmVnRXhwKHVuaXF1ZUltcG9ydHMubWFwKChpKSA9PiBgKCR7aX0pYCkuam9pbihcInxcIiksIFwiZ1wiKTtcbiAgcmV0dXJuIGNvZGUucmVwbGFjZShyZSwgKGlkKSA9PiByZXNvbHZlZC5nZXQoaWQpKTtcbn1cblxuZnVuY3Rpb24gZ2VuSW1wb3J0KHNwZWNpZmllciwgaW1wb3J0cywgb3B0cyA9IHt9KSB7XG4gIGNvbnN0IHNwZWNpZmllclN0ciA9IGdlblN0cmluZyhzcGVjaWZpZXIsIG9wdHMpO1xuICBpZiAoIWltcG9ydHMpIHtcbiAgICByZXR1cm4gYGltcG9ydCAke3NwZWNpZmllclN0cn1gO1xuICB9XG4gIGNvbnN0IF9pbXBvcnRzID0gKEFycmF5LmlzQXJyYXkoaW1wb3J0cykgPyBpbXBvcnRzIDogW2ltcG9ydHNdKS5tYXAoKGkpID0+IHtcbiAgICBpZiAodHlwZW9mIGkgPT09IFwic3RyaW5nXCIpIHtcbiAgICAgIHJldHVybiB7IG5hbWU6IGkgfTtcbiAgICB9XG4gICAgaWYgKGkubmFtZSA9PT0gaS5hcykge1xuICAgICAgaSA9IHsgbmFtZTogaS5uYW1lIH07XG4gICAgfVxuICAgIHJldHVybiBpO1xuICB9KTtcbiAgY29uc3QgaW1wb3J0c1N0ciA9IF9pbXBvcnRzLm1hcCgoaSkgPT4gaS5hcyA/IGAke2kubmFtZX0gYXMgJHtpLmFzfWAgOiBpLm5hbWUpLmpvaW4oXCIsIFwiKTtcbiAgcmV0dXJuIGBpbXBvcnQgeyAke2ltcG9ydHNTdHJ9IH0gZnJvbSAke2dlblN0cmluZyhzcGVjaWZpZXIsIG9wdHMpfWA7XG59XG5mdW5jdGlvbiBnZW5EeW5hbWljSW1wb3J0KHNwZWNpZmllciwgb3B0cyA9IHt9KSB7XG4gIGNvbnN0IGNvbW1lbnRTdHIgPSBvcHRzLmNvbW1lbnQgPyBgIC8qICR7b3B0cy5jb21tZW50fSAqL2AgOiBcIlwiO1xuICBjb25zdCB3cmFwcGVyU3RyID0gb3B0cy53cmFwcGVyID09PSBmYWxzZSA/IFwiXCIgOiBcIigpID0+IFwiO1xuICBjb25zdCBpbmVyb3BTdHIgPSBvcHRzLmludGVyb3BEZWZhdWx0ID8gXCIudGhlbihtID0+IG0uZGVmYXVsdCB8fCBtKVwiIDogXCJcIjtcbiAgcmV0dXJuIGAke3dyYXBwZXJTdHJ9aW1wb3J0KCR7Z2VuU3RyaW5nKHNwZWNpZmllciwgb3B0cyl9JHtjb21tZW50U3RyfSkke2luZXJvcFN0cn1gO1xufVxuZnVuY3Rpb24gZ2VuU3RyaW5nKGlucHV0LCBvcHRzID0ge30pIHtcbiAgY29uc3Qgc3RyID0gSlNPTi5zdHJpbmdpZnkoaW5wdXQpO1xuICBpZiAoIW9wdHMuc2luZ2xlUXVvdGVzKSB7XG4gICAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KGlucHV0KTtcbiAgfVxuICByZXR1cm4gYCcke3N0ci5yZXBsYWNlKC8nL2csIFwiXFxcXCdcIil9J2A7XG59XG5cbi8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gKiAgQ29weXJpZ2h0IChjKSBNaWNyb3NvZnQgQ29ycG9yYXRpb24uIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKiAgTGljZW5zZWQgdW5kZXIgdGhlIE1JVCBMaWNlbnNlLiBTZWUgTGljZW5zZS50eHQgaW4gdGhlIHByb2plY3Qgcm9vdCBmb3IgbGljZW5zZSBpbmZvcm1hdGlvbi5cbiAqLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL1xudmFyIFBhcnNlT3B0aW9ucztcbihmdW5jdGlvbiAoUGFyc2VPcHRpb25zKSB7XG4gICAgUGFyc2VPcHRpb25zLkRFRkFVTFQgPSB7XG4gICAgICAgIGFsbG93VHJhaWxpbmdDb21tYTogZmFsc2VcbiAgICB9O1xufSkoUGFyc2VPcHRpb25zIHx8IChQYXJzZU9wdGlvbnMgPSB7fSkpO1xuXG5jb25zdCBCVUlMVElOX01PRFVMRVMgPSBuZXcgU2V0KGJ1aWx0aW5Nb2R1bGVzKTtcbmZ1bmN0aW9uIG5vcm1hbGl6ZVNsYXNoKHN0cikge1xuICByZXR1cm4gc3RyLnJlcGxhY2UoL1xcXFwvZywgXCIvXCIpO1xufVxuZnVuY3Rpb24gcGNhbGwoZm4sIC4uLmFyZ3MpIHtcbiAgdHJ5IHtcbiAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKGZuKC4uLmFyZ3MpKS5jYXRjaCgoZXJyKSA9PiBwZXJyKGVycikpO1xuICB9IGNhdGNoIChlcnIpIHtcbiAgICByZXR1cm4gcGVycihlcnIpO1xuICB9XG59XG5mdW5jdGlvbiBwZXJyKF9lcnIpIHtcbiAgY29uc3QgZXJyID0gbmV3IEVycm9yKF9lcnIpO1xuICBlcnIuY29kZSA9IF9lcnIuY29kZTtcbiAgRXJyb3IuY2FwdHVyZVN0YWNrVHJhY2UoZXJyLCBwY2FsbCk7XG4gIHJldHVybiBQcm9taXNlLnJlamVjdChlcnIpO1xufVxuXG5mdW5jdGlvbiBmaWxlVVJMVG9QYXRoKGlkKSB7XG4gIGlmICh0eXBlb2YgaWQgPT09IFwic3RyaW5nXCIgJiYgIWlkLnN0YXJ0c1dpdGgoXCJmaWxlOi8vXCIpKSB7XG4gICAgcmV0dXJuIG5vcm1hbGl6ZVNsYXNoKGlkKTtcbiAgfVxuICByZXR1cm4gbm9ybWFsaXplU2xhc2goZmlsZVVSTFRvUGF0aCQyKGlkKSk7XG59XG5mdW5jdGlvbiBub3JtYWxpemVpZChpZCkge1xuICBpZiAodHlwZW9mIGlkICE9PSBcInN0cmluZ1wiKSB7XG4gICAgaWQgPSBpZC50b1N0cmluZygpO1xuICB9XG4gIGlmICgvKG5vZGV8ZGF0YXxodHRwfGh0dHBzfGZpbGUpOi8udGVzdChpZCkpIHtcbiAgICByZXR1cm4gaWQ7XG4gIH1cbiAgaWYgKEJVSUxUSU5fTU9EVUxFUy5oYXMoaWQpKSB7XG4gICAgcmV0dXJuIFwibm9kZTpcIiArIGlkO1xuICB9XG4gIHJldHVybiBcImZpbGU6Ly9cIiArIG5vcm1hbGl6ZVNsYXNoKGlkKTtcbn1cblxuZnVuY3Rpb24gbm9ybWFsaXplV2luZG93c1BhdGgoaW5wdXQgPSBcIlwiKSB7XG4gIGlmICghaW5wdXQuaW5jbHVkZXMoXCJcXFxcXCIpKSB7XG4gICAgcmV0dXJuIGlucHV0O1xuICB9XG4gIHJldHVybiBpbnB1dC5yZXBsYWNlKC9cXFxcL2csIFwiL1wiKTtcbn1cblxuY29uc3QgX1VOQ19SRUdFWCA9IC9eWy9dWy9dLztcbmNvbnN0IF9VTkNfRFJJVkVfUkVHRVggPSAvXlsvXVsvXShbLl17MSwyfVsvXSk/KFthLXpBLVpdKTpbL10vO1xuY29uc3QgX0lTX0FCU09MVVRFX1JFID0gL15cXC98XlxcXFx8XlthLXpBLVpdOlsvXFxcXF0vO1xuY29uc3Qgc2VwID0gXCIvXCI7XG5jb25zdCBkZWxpbWl0ZXIgPSBcIjpcIjtcbmNvbnN0IG5vcm1hbGl6ZSA9IGZ1bmN0aW9uKHBhdGgyKSB7XG4gIGlmIChwYXRoMi5sZW5ndGggPT09IDApIHtcbiAgICByZXR1cm4gXCIuXCI7XG4gIH1cbiAgcGF0aDIgPSBub3JtYWxpemVXaW5kb3dzUGF0aChwYXRoMik7XG4gIGNvbnN0IGlzVU5DUGF0aCA9IHBhdGgyLm1hdGNoKF9VTkNfUkVHRVgpO1xuICBjb25zdCBoYXNVTkNEcml2ZSA9IGlzVU5DUGF0aCAmJiBwYXRoMi5tYXRjaChfVU5DX0RSSVZFX1JFR0VYKTtcbiAgY29uc3QgaXNQYXRoQWJzb2x1dGUgPSBpc0Fic29sdXRlKHBhdGgyKTtcbiAgY29uc3QgdHJhaWxpbmdTZXBhcmF0b3IgPSBwYXRoMltwYXRoMi5sZW5ndGggLSAxXSA9PT0gXCIvXCI7XG4gIHBhdGgyID0gbm9ybWFsaXplU3RyaW5nKHBhdGgyLCAhaXNQYXRoQWJzb2x1dGUpO1xuICBpZiAocGF0aDIubGVuZ3RoID09PSAwKSB7XG4gICAgaWYgKGlzUGF0aEFic29sdXRlKSB7XG4gICAgICByZXR1cm4gXCIvXCI7XG4gICAgfVxuICAgIHJldHVybiB0cmFpbGluZ1NlcGFyYXRvciA/IFwiLi9cIiA6IFwiLlwiO1xuICB9XG4gIGlmICh0cmFpbGluZ1NlcGFyYXRvcikge1xuICAgIHBhdGgyICs9IFwiL1wiO1xuICB9XG4gIGlmIChpc1VOQ1BhdGgpIHtcbiAgICBpZiAoaGFzVU5DRHJpdmUpIHtcbiAgICAgIHJldHVybiBgLy8uLyR7cGF0aDJ9YDtcbiAgICB9XG4gICAgcmV0dXJuIGAvLyR7cGF0aDJ9YDtcbiAgfVxuICByZXR1cm4gaXNQYXRoQWJzb2x1dGUgJiYgIWlzQWJzb2x1dGUocGF0aDIpID8gYC8ke3BhdGgyfWAgOiBwYXRoMjtcbn07XG5jb25zdCBqb2luID0gZnVuY3Rpb24oLi4uYXJncykge1xuICBpZiAoYXJncy5sZW5ndGggPT09IDApIHtcbiAgICByZXR1cm4gXCIuXCI7XG4gIH1cbiAgbGV0IGpvaW5lZDtcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBhcmdzLmxlbmd0aDsgKytpKSB7XG4gICAgY29uc3QgYXJnID0gYXJnc1tpXTtcbiAgICBpZiAoYXJnLmxlbmd0aCA+IDApIHtcbiAgICAgIGlmIChqb2luZWQgPT09IHZvaWQgMCkge1xuICAgICAgICBqb2luZWQgPSBhcmc7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBqb2luZWQgKz0gYC8ke2FyZ31gO1xuICAgICAgfVxuICAgIH1cbiAgfVxuICBpZiAoam9pbmVkID09PSB2b2lkIDApIHtcbiAgICByZXR1cm4gXCIuXCI7XG4gIH1cbiAgcmV0dXJuIG5vcm1hbGl6ZShqb2luZWQpO1xufTtcbmNvbnN0IHJlc29sdmUkMSA9IGZ1bmN0aW9uKC4uLmFyZ3MpIHtcbiAgYXJncyA9IGFyZ3MubWFwKChhcmcpID0+IG5vcm1hbGl6ZVdpbmRvd3NQYXRoKGFyZykpO1xuICBsZXQgcmVzb2x2ZWRQYXRoID0gXCJcIjtcbiAgbGV0IHJlc29sdmVkQWJzb2x1dGUgPSBmYWxzZTtcbiAgZm9yIChsZXQgaSA9IGFyZ3MubGVuZ3RoIC0gMTsgaSA+PSAtMSAmJiAhcmVzb2x2ZWRBYnNvbHV0ZTsgaS0tKSB7XG4gICAgY29uc3QgcGF0aDIgPSBpID49IDAgPyBhcmdzW2ldIDogcHJvY2Vzcy5jd2QoKTtcbiAgICBpZiAocGF0aDIubGVuZ3RoID09PSAwKSB7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG4gICAgcmVzb2x2ZWRQYXRoID0gYCR7cGF0aDJ9LyR7cmVzb2x2ZWRQYXRofWA7XG4gICAgcmVzb2x2ZWRBYnNvbHV0ZSA9IGlzQWJzb2x1dGUocGF0aDIpO1xuICB9XG4gIHJlc29sdmVkUGF0aCA9IG5vcm1hbGl6ZVN0cmluZyhyZXNvbHZlZFBhdGgsICFyZXNvbHZlZEFic29sdXRlKTtcbiAgaWYgKHJlc29sdmVkQWJzb2x1dGUgJiYgIWlzQWJzb2x1dGUocmVzb2x2ZWRQYXRoKSkge1xuICAgIHJldHVybiBgLyR7cmVzb2x2ZWRQYXRofWA7XG4gIH1cbiAgcmV0dXJuIHJlc29sdmVkUGF0aC5sZW5ndGggPiAwID8gcmVzb2x2ZWRQYXRoIDogXCIuXCI7XG59O1xuZnVuY3Rpb24gbm9ybWFsaXplU3RyaW5nKHBhdGgyLCBhbGxvd0Fib3ZlUm9vdCkge1xuICBsZXQgcmVzID0gXCJcIjtcbiAgbGV0IGxhc3RTZWdtZW50TGVuZ3RoID0gMDtcbiAgbGV0IGxhc3RTbGFzaCA9IC0xO1xuICBsZXQgZG90cyA9IDA7XG4gIGxldCBjaGFyID0gbnVsbDtcbiAgZm9yIChsZXQgaSA9IDA7IGkgPD0gcGF0aDIubGVuZ3RoOyArK2kpIHtcbiAgICBpZiAoaSA8IHBhdGgyLmxlbmd0aCkge1xuICAgICAgY2hhciA9IHBhdGgyW2ldO1xuICAgIH0gZWxzZSBpZiAoY2hhciA9PT0gXCIvXCIpIHtcbiAgICAgIGJyZWFrO1xuICAgIH0gZWxzZSB7XG4gICAgICBjaGFyID0gXCIvXCI7XG4gICAgfVxuICAgIGlmIChjaGFyID09PSBcIi9cIikge1xuICAgICAgaWYgKGxhc3RTbGFzaCA9PT0gaSAtIDEgfHwgZG90cyA9PT0gMSkgOyBlbHNlIGlmIChkb3RzID09PSAyKSB7XG4gICAgICAgIGlmIChyZXMubGVuZ3RoIDwgMiB8fCBsYXN0U2VnbWVudExlbmd0aCAhPT0gMiB8fCByZXNbcmVzLmxlbmd0aCAtIDFdICE9PSBcIi5cIiB8fCByZXNbcmVzLmxlbmd0aCAtIDJdICE9PSBcIi5cIikge1xuICAgICAgICAgIGlmIChyZXMubGVuZ3RoID4gMikge1xuICAgICAgICAgICAgY29uc3QgbGFzdFNsYXNoSW5kZXggPSByZXMubGFzdEluZGV4T2YoXCIvXCIpO1xuICAgICAgICAgICAgaWYgKGxhc3RTbGFzaEluZGV4ID09PSAtMSkge1xuICAgICAgICAgICAgICByZXMgPSBcIlwiO1xuICAgICAgICAgICAgICBsYXN0U2VnbWVudExlbmd0aCA9IDA7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICByZXMgPSByZXMuc2xpY2UoMCwgbGFzdFNsYXNoSW5kZXgpO1xuICAgICAgICAgICAgICBsYXN0U2VnbWVudExlbmd0aCA9IHJlcy5sZW5ndGggLSAxIC0gcmVzLmxhc3RJbmRleE9mKFwiL1wiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGxhc3RTbGFzaCA9IGk7XG4gICAgICAgICAgICBkb3RzID0gMDtcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgIH0gZWxzZSBpZiAocmVzLmxlbmd0aCAhPT0gMCkge1xuICAgICAgICAgICAgcmVzID0gXCJcIjtcbiAgICAgICAgICAgIGxhc3RTZWdtZW50TGVuZ3RoID0gMDtcbiAgICAgICAgICAgIGxhc3RTbGFzaCA9IGk7XG4gICAgICAgICAgICBkb3RzID0gMDtcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAoYWxsb3dBYm92ZVJvb3QpIHtcbiAgICAgICAgICByZXMgKz0gcmVzLmxlbmd0aCA+IDAgPyBcIi8uLlwiIDogXCIuLlwiO1xuICAgICAgICAgIGxhc3RTZWdtZW50TGVuZ3RoID0gMjtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaWYgKHJlcy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgcmVzICs9IGAvJHtwYXRoMi5zbGljZShsYXN0U2xhc2ggKyAxLCBpKX1gO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJlcyA9IHBhdGgyLnNsaWNlKGxhc3RTbGFzaCArIDEsIGkpO1xuICAgICAgICB9XG4gICAgICAgIGxhc3RTZWdtZW50TGVuZ3RoID0gaSAtIGxhc3RTbGFzaCAtIDE7XG4gICAgICB9XG4gICAgICBsYXN0U2xhc2ggPSBpO1xuICAgICAgZG90cyA9IDA7XG4gICAgfSBlbHNlIGlmIChjaGFyID09PSBcIi5cIiAmJiBkb3RzICE9PSAtMSkge1xuICAgICAgKytkb3RzO1xuICAgIH0gZWxzZSB7XG4gICAgICBkb3RzID0gLTE7XG4gICAgfVxuICB9XG4gIHJldHVybiByZXM7XG59XG5jb25zdCBpc0Fic29sdXRlID0gZnVuY3Rpb24ocCkge1xuICByZXR1cm4gX0lTX0FCU09MVVRFX1JFLnRlc3QocCk7XG59O1xuY29uc3QgdG9OYW1lc3BhY2VkUGF0aCA9IGZ1bmN0aW9uKHApIHtcbiAgcmV0dXJuIG5vcm1hbGl6ZVdpbmRvd3NQYXRoKHApO1xufTtcbmNvbnN0IGV4dG5hbWUgPSBmdW5jdGlvbihwKSB7XG4gIHJldHVybiBwYXRoLnBvc2l4LmV4dG5hbWUobm9ybWFsaXplV2luZG93c1BhdGgocCkpO1xufTtcbmNvbnN0IHJlbGF0aXZlID0gZnVuY3Rpb24oZnJvbSwgdG8pIHtcbiAgcmV0dXJuIHBhdGgucG9zaXgucmVsYXRpdmUobm9ybWFsaXplV2luZG93c1BhdGgoZnJvbSksIG5vcm1hbGl6ZVdpbmRvd3NQYXRoKHRvKSk7XG59O1xuY29uc3QgZGlybmFtZSA9IGZ1bmN0aW9uKHApIHtcbiAgcmV0dXJuIHBhdGgucG9zaXguZGlybmFtZShub3JtYWxpemVXaW5kb3dzUGF0aChwKSk7XG59O1xuY29uc3QgZm9ybWF0ID0gZnVuY3Rpb24ocCkge1xuICByZXR1cm4gbm9ybWFsaXplV2luZG93c1BhdGgocGF0aC5wb3NpeC5mb3JtYXQocCkpO1xufTtcbmNvbnN0IGJhc2VuYW1lID0gZnVuY3Rpb24ocCwgZXh0KSB7XG4gIHJldHVybiBwYXRoLnBvc2l4LmJhc2VuYW1lKG5vcm1hbGl6ZVdpbmRvd3NQYXRoKHApLCBleHQpO1xufTtcbmNvbnN0IHBhcnNlJDYgPSBmdW5jdGlvbihwKSB7XG4gIHJldHVybiBwYXRoLnBvc2l4LnBhcnNlKG5vcm1hbGl6ZVdpbmRvd3NQYXRoKHApKTtcbn07XG5cbmNvbnN0IF9wYXRoID0gLyojX19QVVJFX18qL09iamVjdC5mcmVlemUoe1xuICBfX3Byb3RvX186IG51bGwsXG4gIHNlcDogc2VwLFxuICBkZWxpbWl0ZXI6IGRlbGltaXRlcixcbiAgbm9ybWFsaXplOiBub3JtYWxpemUsXG4gIGpvaW46IGpvaW4sXG4gIHJlc29sdmU6IHJlc29sdmUkMSxcbiAgbm9ybWFsaXplU3RyaW5nOiBub3JtYWxpemVTdHJpbmcsXG4gIGlzQWJzb2x1dGU6IGlzQWJzb2x1dGUsXG4gIHRvTmFtZXNwYWNlZFBhdGg6IHRvTmFtZXNwYWNlZFBhdGgsXG4gIGV4dG5hbWU6IGV4dG5hbWUsXG4gIHJlbGF0aXZlOiByZWxhdGl2ZSxcbiAgZGlybmFtZTogZGlybmFtZSxcbiAgZm9ybWF0OiBmb3JtYXQsXG4gIGJhc2VuYW1lOiBiYXNlbmFtZSxcbiAgcGFyc2U6IHBhcnNlJDZcbn0pO1xuXG4oe1xuICAuLi5fcGF0aFxufSk7XG5cbnZhciByZSQ1ID0ge2V4cG9ydHM6IHt9fTtcblxuLy8gTm90ZTogdGhpcyBpcyB0aGUgc2VtdmVyLm9yZyB2ZXJzaW9uIG9mIHRoZSBzcGVjIHRoYXQgaXQgaW1wbGVtZW50c1xuLy8gTm90IG5lY2Vzc2FyaWx5IHRoZSBwYWNrYWdlIHZlcnNpb24gb2YgdGhpcyBjb2RlLlxuY29uc3QgU0VNVkVSX1NQRUNfVkVSU0lPTiA9ICcyLjAuMCc7XG5cbmNvbnN0IE1BWF9MRU5HVEgkMiA9IDI1NjtcbmNvbnN0IE1BWF9TQUZFX0lOVEVHRVIkMSA9IE51bWJlci5NQVhfU0FGRV9JTlRFR0VSIHx8XG4gIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovIDkwMDcxOTkyNTQ3NDA5OTE7XG5cbi8vIE1heCBzYWZlIHNlZ21lbnQgbGVuZ3RoIGZvciBjb2VyY2lvbi5cbmNvbnN0IE1BWF9TQUZFX0NPTVBPTkVOVF9MRU5HVEggPSAxNjtcblxudmFyIGNvbnN0YW50cyA9IHtcbiAgU0VNVkVSX1NQRUNfVkVSU0lPTixcbiAgTUFYX0xFTkdUSDogTUFYX0xFTkdUSCQyLFxuICBNQVhfU0FGRV9JTlRFR0VSOiBNQVhfU0FGRV9JTlRFR0VSJDEsXG4gIE1BWF9TQUZFX0NPTVBPTkVOVF9MRU5HVEhcbn07XG5cbmNvbnN0IGRlYnVnJDMgPSAoXG4gIHR5cGVvZiBwcm9jZXNzID09PSAnb2JqZWN0JyAmJlxuICBwcm9jZXNzLmVudiAmJlxuICBwcm9jZXNzLmVudi5OT0RFX0RFQlVHICYmXG4gIC9cXGJzZW12ZXJcXGIvaS50ZXN0KHByb2Nlc3MuZW52Lk5PREVfREVCVUcpXG4pID8gKC4uLmFyZ3MpID0+IGNvbnNvbGUuZXJyb3IoJ1NFTVZFUicsIC4uLmFyZ3MpXG4gIDogKCkgPT4ge307XG5cbnZhciBkZWJ1Z18xID0gZGVidWckMztcblxuKGZ1bmN0aW9uIChtb2R1bGUsIGV4cG9ydHMpIHtcbmNvbnN0IHsgTUFYX1NBRkVfQ09NUE9ORU5UX0xFTkdUSCB9ID0gY29uc3RhbnRzO1xuY29uc3QgZGVidWcgPSBkZWJ1Z18xO1xuZXhwb3J0cyA9IG1vZHVsZS5leHBvcnRzID0ge307XG5cbi8vIFRoZSBhY3R1YWwgcmVnZXhwcyBnbyBvbiBleHBvcnRzLnJlXG5jb25zdCByZSA9IGV4cG9ydHMucmUgPSBbXTtcbmNvbnN0IHNyYyA9IGV4cG9ydHMuc3JjID0gW107XG5jb25zdCB0ID0gZXhwb3J0cy50ID0ge307XG5sZXQgUiA9IDA7XG5cbmNvbnN0IGNyZWF0ZVRva2VuID0gKG5hbWUsIHZhbHVlLCBpc0dsb2JhbCkgPT4ge1xuICBjb25zdCBpbmRleCA9IFIrKztcbiAgZGVidWcoaW5kZXgsIHZhbHVlKTtcbiAgdFtuYW1lXSA9IGluZGV4O1xuICBzcmNbaW5kZXhdID0gdmFsdWU7XG4gIHJlW2luZGV4XSA9IG5ldyBSZWdFeHAodmFsdWUsIGlzR2xvYmFsID8gJ2cnIDogdW5kZWZpbmVkKTtcbn07XG5cbi8vIFRoZSBmb2xsb3dpbmcgUmVndWxhciBFeHByZXNzaW9ucyBjYW4gYmUgdXNlZCBmb3IgdG9rZW5pemluZyxcbi8vIHZhbGlkYXRpbmcsIGFuZCBwYXJzaW5nIFNlbVZlciB2ZXJzaW9uIHN0cmluZ3MuXG5cbi8vICMjIE51bWVyaWMgSWRlbnRpZmllclxuLy8gQSBzaW5nbGUgYDBgLCBvciBhIG5vbi16ZXJvIGRpZ2l0IGZvbGxvd2VkIGJ5IHplcm8gb3IgbW9yZSBkaWdpdHMuXG5cbmNyZWF0ZVRva2VuKCdOVU1FUklDSURFTlRJRklFUicsICcwfFsxLTldXFxcXGQqJyk7XG5jcmVhdGVUb2tlbignTlVNRVJJQ0lERU5USUZJRVJMT09TRScsICdbMC05XSsnKTtcblxuLy8gIyMgTm9uLW51bWVyaWMgSWRlbnRpZmllclxuLy8gWmVybyBvciBtb3JlIGRpZ2l0cywgZm9sbG93ZWQgYnkgYSBsZXR0ZXIgb3IgaHlwaGVuLCBhbmQgdGhlbiB6ZXJvIG9yXG4vLyBtb3JlIGxldHRlcnMsIGRpZ2l0cywgb3IgaHlwaGVucy5cblxuY3JlYXRlVG9rZW4oJ05PTk5VTUVSSUNJREVOVElGSUVSJywgJ1xcXFxkKlthLXpBLVotXVthLXpBLVowLTktXSonKTtcblxuLy8gIyMgTWFpbiBWZXJzaW9uXG4vLyBUaHJlZSBkb3Qtc2VwYXJhdGVkIG51bWVyaWMgaWRlbnRpZmllcnMuXG5cbmNyZWF0ZVRva2VuKCdNQUlOVkVSU0lPTicsIGAoJHtzcmNbdC5OVU1FUklDSURFTlRJRklFUl19KVxcXFwuYCArXG4gICAgICAgICAgICAgICAgICAgYCgke3NyY1t0Lk5VTUVSSUNJREVOVElGSUVSXX0pXFxcXC5gICtcbiAgICAgICAgICAgICAgICAgICBgKCR7c3JjW3QuTlVNRVJJQ0lERU5USUZJRVJdfSlgKTtcblxuY3JlYXRlVG9rZW4oJ01BSU5WRVJTSU9OTE9PU0UnLCBgKCR7c3JjW3QuTlVNRVJJQ0lERU5USUZJRVJMT09TRV19KVxcXFwuYCArXG4gICAgICAgICAgICAgICAgICAgICAgICBgKCR7c3JjW3QuTlVNRVJJQ0lERU5USUZJRVJMT09TRV19KVxcXFwuYCArXG4gICAgICAgICAgICAgICAgICAgICAgICBgKCR7c3JjW3QuTlVNRVJJQ0lERU5USUZJRVJMT09TRV19KWApO1xuXG4vLyAjIyBQcmUtcmVsZWFzZSBWZXJzaW9uIElkZW50aWZpZXJcbi8vIEEgbnVtZXJpYyBpZGVudGlmaWVyLCBvciBhIG5vbi1udW1lcmljIGlkZW50aWZpZXIuXG5cbmNyZWF0ZVRva2VuKCdQUkVSRUxFQVNFSURFTlRJRklFUicsIGAoPzoke3NyY1t0Lk5VTUVSSUNJREVOVElGSUVSXVxufXwke3NyY1t0Lk5PTk5VTUVSSUNJREVOVElGSUVSXX0pYCk7XG5cbmNyZWF0ZVRva2VuKCdQUkVSRUxFQVNFSURFTlRJRklFUkxPT1NFJywgYCg/OiR7c3JjW3QuTlVNRVJJQ0lERU5USUZJRVJMT09TRV1cbn18JHtzcmNbdC5OT05OVU1FUklDSURFTlRJRklFUl19KWApO1xuXG4vLyAjIyBQcmUtcmVsZWFzZSBWZXJzaW9uXG4vLyBIeXBoZW4sIGZvbGxvd2VkIGJ5IG9uZSBvciBtb3JlIGRvdC1zZXBhcmF0ZWQgcHJlLXJlbGVhc2UgdmVyc2lvblxuLy8gaWRlbnRpZmllcnMuXG5cbmNyZWF0ZVRva2VuKCdQUkVSRUxFQVNFJywgYCg/Oi0oJHtzcmNbdC5QUkVSRUxFQVNFSURFTlRJRklFUl1cbn0oPzpcXFxcLiR7c3JjW3QuUFJFUkVMRUFTRUlERU5USUZJRVJdfSkqKSlgKTtcblxuY3JlYXRlVG9rZW4oJ1BSRVJFTEVBU0VMT09TRScsIGAoPzotPygke3NyY1t0LlBSRVJFTEVBU0VJREVOVElGSUVSTE9PU0VdXG59KD86XFxcXC4ke3NyY1t0LlBSRVJFTEVBU0VJREVOVElGSUVSTE9PU0VdfSkqKSlgKTtcblxuLy8gIyMgQnVpbGQgTWV0YWRhdGEgSWRlbnRpZmllclxuLy8gQW55IGNvbWJpbmF0aW9uIG9mIGRpZ2l0cywgbGV0dGVycywgb3IgaHlwaGVucy5cblxuY3JlYXRlVG9rZW4oJ0JVSUxESURFTlRJRklFUicsICdbMC05QS1aYS16LV0rJyk7XG5cbi8vICMjIEJ1aWxkIE1ldGFkYXRhXG4vLyBQbHVzIHNpZ24sIGZvbGxvd2VkIGJ5IG9uZSBvciBtb3JlIHBlcmlvZC1zZXBhcmF0ZWQgYnVpbGQgbWV0YWRhdGFcbi8vIGlkZW50aWZpZXJzLlxuXG5jcmVhdGVUb2tlbignQlVJTEQnLCBgKD86XFxcXCsoJHtzcmNbdC5CVUlMRElERU5USUZJRVJdXG59KD86XFxcXC4ke3NyY1t0LkJVSUxESURFTlRJRklFUl19KSopKWApO1xuXG4vLyAjIyBGdWxsIFZlcnNpb24gU3RyaW5nXG4vLyBBIG1haW4gdmVyc2lvbiwgZm9sbG93ZWQgb3B0aW9uYWxseSBieSBhIHByZS1yZWxlYXNlIHZlcnNpb24gYW5kXG4vLyBidWlsZCBtZXRhZGF0YS5cblxuLy8gTm90ZSB0aGF0IHRoZSBvbmx5IG1ham9yLCBtaW5vciwgcGF0Y2gsIGFuZCBwcmUtcmVsZWFzZSBzZWN0aW9ucyBvZlxuLy8gdGhlIHZlcnNpb24gc3RyaW5nIGFyZSBjYXB0dXJpbmcgZ3JvdXBzLiAgVGhlIGJ1aWxkIG1ldGFkYXRhIGlzIG5vdCBhXG4vLyBjYXB0dXJpbmcgZ3JvdXAsIGJlY2F1c2UgaXQgc2hvdWxkIG5vdCBldmVyIGJlIHVzZWQgaW4gdmVyc2lvblxuLy8gY29tcGFyaXNvbi5cblxuY3JlYXRlVG9rZW4oJ0ZVTExQTEFJTicsIGB2PyR7c3JjW3QuTUFJTlZFUlNJT05dXG59JHtzcmNbdC5QUkVSRUxFQVNFXX0/JHtcbiAgc3JjW3QuQlVJTERdfT9gKTtcblxuY3JlYXRlVG9rZW4oJ0ZVTEwnLCBgXiR7c3JjW3QuRlVMTFBMQUlOXX0kYCk7XG5cbi8vIGxpa2UgZnVsbCwgYnV0IGFsbG93cyB2MS4yLjMgYW5kID0xLjIuMywgd2hpY2ggcGVvcGxlIGRvIHNvbWV0aW1lcy5cbi8vIGFsc28sIDEuMC4wYWxwaGExIChwcmVyZWxlYXNlIHdpdGhvdXQgdGhlIGh5cGhlbikgd2hpY2ggaXMgcHJldHR5XG4vLyBjb21tb24gaW4gdGhlIG5wbSByZWdpc3RyeS5cbmNyZWF0ZVRva2VuKCdMT09TRVBMQUlOJywgYFt2PVxcXFxzXSoke3NyY1t0Lk1BSU5WRVJTSU9OTE9PU0VdXG59JHtzcmNbdC5QUkVSRUxFQVNFTE9PU0VdfT8ke1xuICBzcmNbdC5CVUlMRF19P2ApO1xuXG5jcmVhdGVUb2tlbignTE9PU0UnLCBgXiR7c3JjW3QuTE9PU0VQTEFJTl19JGApO1xuXG5jcmVhdGVUb2tlbignR1RMVCcsICcoKD86PHw+KT89PyknKTtcblxuLy8gU29tZXRoaW5nIGxpa2UgXCIyLipcIiBvciBcIjEuMi54XCIuXG4vLyBOb3RlIHRoYXQgXCJ4LnhcIiBpcyBhIHZhbGlkIHhSYW5nZSBpZGVudGlmZXIsIG1lYW5pbmcgXCJhbnkgdmVyc2lvblwiXG4vLyBPbmx5IHRoZSBmaXJzdCBpdGVtIGlzIHN0cmljdGx5IHJlcXVpcmVkLlxuY3JlYXRlVG9rZW4oJ1hSQU5HRUlERU5USUZJRVJMT09TRScsIGAke3NyY1t0Lk5VTUVSSUNJREVOVElGSUVSTE9PU0VdfXx4fFh8XFxcXCpgKTtcbmNyZWF0ZVRva2VuKCdYUkFOR0VJREVOVElGSUVSJywgYCR7c3JjW3QuTlVNRVJJQ0lERU5USUZJRVJdfXx4fFh8XFxcXCpgKTtcblxuY3JlYXRlVG9rZW4oJ1hSQU5HRVBMQUlOJywgYFt2PVxcXFxzXSooJHtzcmNbdC5YUkFOR0VJREVOVElGSUVSXX0pYCArXG4gICAgICAgICAgICAgICAgICAgYCg/OlxcXFwuKCR7c3JjW3QuWFJBTkdFSURFTlRJRklFUl19KWAgK1xuICAgICAgICAgICAgICAgICAgIGAoPzpcXFxcLigke3NyY1t0LlhSQU5HRUlERU5USUZJRVJdfSlgICtcbiAgICAgICAgICAgICAgICAgICBgKD86JHtzcmNbdC5QUkVSRUxFQVNFXX0pPyR7XG4gICAgICAgICAgICAgICAgICAgICBzcmNbdC5CVUlMRF19P2AgK1xuICAgICAgICAgICAgICAgICAgIGApPyk/YCk7XG5cbmNyZWF0ZVRva2VuKCdYUkFOR0VQTEFJTkxPT1NFJywgYFt2PVxcXFxzXSooJHtzcmNbdC5YUkFOR0VJREVOVElGSUVSTE9PU0VdfSlgICtcbiAgICAgICAgICAgICAgICAgICAgICAgIGAoPzpcXFxcLigke3NyY1t0LlhSQU5HRUlERU5USUZJRVJMT09TRV19KWAgK1xuICAgICAgICAgICAgICAgICAgICAgICAgYCg/OlxcXFwuKCR7c3JjW3QuWFJBTkdFSURFTlRJRklFUkxPT1NFXX0pYCArXG4gICAgICAgICAgICAgICAgICAgICAgICBgKD86JHtzcmNbdC5QUkVSRUxFQVNFTE9PU0VdfSk/JHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgc3JjW3QuQlVJTERdfT9gICtcbiAgICAgICAgICAgICAgICAgICAgICAgIGApPyk/YCk7XG5cbmNyZWF0ZVRva2VuKCdYUkFOR0UnLCBgXiR7c3JjW3QuR1RMVF19XFxcXHMqJHtzcmNbdC5YUkFOR0VQTEFJTl19JGApO1xuY3JlYXRlVG9rZW4oJ1hSQU5HRUxPT1NFJywgYF4ke3NyY1t0LkdUTFRdfVxcXFxzKiR7c3JjW3QuWFJBTkdFUExBSU5MT09TRV19JGApO1xuXG4vLyBDb2VyY2lvbi5cbi8vIEV4dHJhY3QgYW55dGhpbmcgdGhhdCBjb3VsZCBjb25jZWl2YWJseSBiZSBhIHBhcnQgb2YgYSB2YWxpZCBzZW12ZXJcbmNyZWF0ZVRva2VuKCdDT0VSQ0UnLCBgJHsnKF58W15cXFxcZF0pJyArXG4gICAgICAgICAgICAgICcoXFxcXGR7MSwnfSR7TUFYX1NBRkVfQ09NUE9ORU5UX0xFTkdUSH19KWAgK1xuICAgICAgICAgICAgICBgKD86XFxcXC4oXFxcXGR7MSwke01BWF9TQUZFX0NPTVBPTkVOVF9MRU5HVEh9fSkpP2AgK1xuICAgICAgICAgICAgICBgKD86XFxcXC4oXFxcXGR7MSwke01BWF9TQUZFX0NPTVBPTkVOVF9MRU5HVEh9fSkpP2AgK1xuICAgICAgICAgICAgICBgKD86JHxbXlxcXFxkXSlgKTtcbmNyZWF0ZVRva2VuKCdDT0VSQ0VSVEwnLCBzcmNbdC5DT0VSQ0VdLCB0cnVlKTtcblxuLy8gVGlsZGUgcmFuZ2VzLlxuLy8gTWVhbmluZyBpcyBcInJlYXNvbmFibHkgYXQgb3IgZ3JlYXRlciB0aGFuXCJcbmNyZWF0ZVRva2VuKCdMT05FVElMREUnLCAnKD86fj4/KScpO1xuXG5jcmVhdGVUb2tlbignVElMREVUUklNJywgYChcXFxccyopJHtzcmNbdC5MT05FVElMREVdfVxcXFxzK2AsIHRydWUpO1xuZXhwb3J0cy50aWxkZVRyaW1SZXBsYWNlID0gJyQxfic7XG5cbmNyZWF0ZVRva2VuKCdUSUxERScsIGBeJHtzcmNbdC5MT05FVElMREVdfSR7c3JjW3QuWFJBTkdFUExBSU5dfSRgKTtcbmNyZWF0ZVRva2VuKCdUSUxERUxPT1NFJywgYF4ke3NyY1t0LkxPTkVUSUxERV19JHtzcmNbdC5YUkFOR0VQTEFJTkxPT1NFXX0kYCk7XG5cbi8vIENhcmV0IHJhbmdlcy5cbi8vIE1lYW5pbmcgaXMgXCJhdCBsZWFzdCBhbmQgYmFja3dhcmRzIGNvbXBhdGlibGUgd2l0aFwiXG5jcmVhdGVUb2tlbignTE9ORUNBUkVUJywgJyg/OlxcXFxeKScpO1xuXG5jcmVhdGVUb2tlbignQ0FSRVRUUklNJywgYChcXFxccyopJHtzcmNbdC5MT05FQ0FSRVRdfVxcXFxzK2AsIHRydWUpO1xuZXhwb3J0cy5jYXJldFRyaW1SZXBsYWNlID0gJyQxXic7XG5cbmNyZWF0ZVRva2VuKCdDQVJFVCcsIGBeJHtzcmNbdC5MT05FQ0FSRVRdfSR7c3JjW3QuWFJBTkdFUExBSU5dfSRgKTtcbmNyZWF0ZVRva2VuKCdDQVJFVExPT1NFJywgYF4ke3NyY1t0LkxPTkVDQVJFVF19JHtzcmNbdC5YUkFOR0VQTEFJTkxPT1NFXX0kYCk7XG5cbi8vIEEgc2ltcGxlIGd0L2x0L2VxIHRoaW5nLCBvciBqdXN0IFwiXCIgdG8gaW5kaWNhdGUgXCJhbnkgdmVyc2lvblwiXG5jcmVhdGVUb2tlbignQ09NUEFSQVRPUkxPT1NFJywgYF4ke3NyY1t0LkdUTFRdfVxcXFxzKigke3NyY1t0LkxPT1NFUExBSU5dfSkkfF4kYCk7XG5jcmVhdGVUb2tlbignQ09NUEFSQVRPUicsIGBeJHtzcmNbdC5HVExUXX1cXFxccyooJHtzcmNbdC5GVUxMUExBSU5dfSkkfF4kYCk7XG5cbi8vIEFuIGV4cHJlc3Npb24gdG8gc3RyaXAgYW55IHdoaXRlc3BhY2UgYmV0d2VlbiB0aGUgZ3RsdCBhbmQgdGhlIHRoaW5nXG4vLyBpdCBtb2RpZmllcywgc28gdGhhdCBgPiAxLjIuM2AgPT0+IGA+MS4yLjNgXG5jcmVhdGVUb2tlbignQ09NUEFSQVRPUlRSSU0nLCBgKFxcXFxzKikke3NyY1t0LkdUTFRdXG59XFxcXHMqKCR7c3JjW3QuTE9PU0VQTEFJTl19fCR7c3JjW3QuWFJBTkdFUExBSU5dfSlgLCB0cnVlKTtcbmV4cG9ydHMuY29tcGFyYXRvclRyaW1SZXBsYWNlID0gJyQxJDIkMyc7XG5cbi8vIFNvbWV0aGluZyBsaWtlIGAxLjIuMyAtIDEuMi40YFxuLy8gTm90ZSB0aGF0IHRoZXNlIGFsbCB1c2UgdGhlIGxvb3NlIGZvcm0sIGJlY2F1c2UgdGhleSdsbCBiZVxuLy8gY2hlY2tlZCBhZ2FpbnN0IGVpdGhlciB0aGUgc3RyaWN0IG9yIGxvb3NlIGNvbXBhcmF0b3IgZm9ybVxuLy8gbGF0ZXIuXG5jcmVhdGVUb2tlbignSFlQSEVOUkFOR0UnLCBgXlxcXFxzKigke3NyY1t0LlhSQU5HRVBMQUlOXX0pYCArXG4gICAgICAgICAgICAgICAgICAgYFxcXFxzKy1cXFxccytgICtcbiAgICAgICAgICAgICAgICAgICBgKCR7c3JjW3QuWFJBTkdFUExBSU5dfSlgICtcbiAgICAgICAgICAgICAgICAgICBgXFxcXHMqJGApO1xuXG5jcmVhdGVUb2tlbignSFlQSEVOUkFOR0VMT09TRScsIGBeXFxcXHMqKCR7c3JjW3QuWFJBTkdFUExBSU5MT09TRV19KWAgK1xuICAgICAgICAgICAgICAgICAgICAgICAgYFxcXFxzKy1cXFxccytgICtcbiAgICAgICAgICAgICAgICAgICAgICAgIGAoJHtzcmNbdC5YUkFOR0VQTEFJTkxPT1NFXX0pYCArXG4gICAgICAgICAgICAgICAgICAgICAgICBgXFxcXHMqJGApO1xuXG4vLyBTdGFyIHJhbmdlcyBiYXNpY2FsbHkganVzdCBhbGxvdyBhbnl0aGluZyBhdCBhbGwuXG5jcmVhdGVUb2tlbignU1RBUicsICcoPHw+KT89P1xcXFxzKlxcXFwqJyk7XG4vLyA+PTAuMC4wIGlzIGxpa2UgYSBzdGFyXG5jcmVhdGVUb2tlbignR1RFMCcsICdeXFxcXHMqPj1cXFxccyowXFwuMFxcLjBcXFxccyokJyk7XG5jcmVhdGVUb2tlbignR1RFMFBSRScsICdeXFxcXHMqPj1cXFxccyowXFwuMFxcLjAtMFxcXFxzKiQnKTtcbn0ocmUkNSwgcmUkNS5leHBvcnRzKSk7XG5cbi8vIHBhcnNlIG91dCBqdXN0IHRoZSBvcHRpb25zIHdlIGNhcmUgYWJvdXQgc28gd2UgYWx3YXlzIGdldCBhIGNvbnNpc3RlbnRcbi8vIG9iaiB3aXRoIGtleXMgaW4gYSBjb25zaXN0ZW50IG9yZGVyLlxuY29uc3Qgb3B0cyA9IFsnaW5jbHVkZVByZXJlbGVhc2UnLCAnbG9vc2UnLCAncnRsJ107XG5jb25zdCBwYXJzZU9wdGlvbnMkNCA9IG9wdGlvbnMgPT5cbiAgIW9wdGlvbnMgPyB7fVxuICA6IHR5cGVvZiBvcHRpb25zICE9PSAnb2JqZWN0JyA/IHsgbG9vc2U6IHRydWUgfVxuICA6IG9wdHMuZmlsdGVyKGsgPT4gb3B0aW9uc1trXSkucmVkdWNlKChvcHRpb25zLCBrKSA9PiB7XG4gICAgb3B0aW9uc1trXSA9IHRydWU7XG4gICAgcmV0dXJuIG9wdGlvbnNcbiAgfSwge30pO1xudmFyIHBhcnNlT3B0aW9uc18xID0gcGFyc2VPcHRpb25zJDQ7XG5cbmNvbnN0IG51bWVyaWMgPSAvXlswLTldKyQvO1xuY29uc3QgY29tcGFyZUlkZW50aWZpZXJzJDEgPSAoYSwgYikgPT4ge1xuICBjb25zdCBhbnVtID0gbnVtZXJpYy50ZXN0KGEpO1xuICBjb25zdCBibnVtID0gbnVtZXJpYy50ZXN0KGIpO1xuXG4gIGlmIChhbnVtICYmIGJudW0pIHtcbiAgICBhID0gK2E7XG4gICAgYiA9ICtiO1xuICB9XG5cbiAgcmV0dXJuIGEgPT09IGIgPyAwXG4gICAgOiAoYW51bSAmJiAhYm51bSkgPyAtMVxuICAgIDogKGJudW0gJiYgIWFudW0pID8gMVxuICAgIDogYSA8IGIgPyAtMVxuICAgIDogMVxufTtcblxuY29uc3QgcmNvbXBhcmVJZGVudGlmaWVycyA9IChhLCBiKSA9PiBjb21wYXJlSWRlbnRpZmllcnMkMShiLCBhKTtcblxudmFyIGlkZW50aWZpZXJzID0ge1xuICBjb21wYXJlSWRlbnRpZmllcnM6IGNvbXBhcmVJZGVudGlmaWVycyQxLFxuICByY29tcGFyZUlkZW50aWZpZXJzXG59O1xuXG5jb25zdCBkZWJ1ZyQyID0gZGVidWdfMTtcbmNvbnN0IHsgTUFYX0xFTkdUSDogTUFYX0xFTkdUSCQxLCBNQVhfU0FGRV9JTlRFR0VSIH0gPSBjb25zdGFudHM7XG5jb25zdCB7IHJlOiByZSQ0LCB0OiB0JDQgfSA9IHJlJDUuZXhwb3J0cztcblxuY29uc3QgcGFyc2VPcHRpb25zJDMgPSBwYXJzZU9wdGlvbnNfMTtcbmNvbnN0IHsgY29tcGFyZUlkZW50aWZpZXJzIH0gPSBpZGVudGlmaWVycztcbmNsYXNzIFNlbVZlciRlIHtcbiAgY29uc3RydWN0b3IgKHZlcnNpb24sIG9wdGlvbnMpIHtcbiAgICBvcHRpb25zID0gcGFyc2VPcHRpb25zJDMob3B0aW9ucyk7XG5cbiAgICBpZiAodmVyc2lvbiBpbnN0YW5jZW9mIFNlbVZlciRlKSB7XG4gICAgICBpZiAodmVyc2lvbi5sb29zZSA9PT0gISFvcHRpb25zLmxvb3NlICYmXG4gICAgICAgICAgdmVyc2lvbi5pbmNsdWRlUHJlcmVsZWFzZSA9PT0gISFvcHRpb25zLmluY2x1ZGVQcmVyZWxlYXNlKSB7XG4gICAgICAgIHJldHVybiB2ZXJzaW9uXG4gICAgICB9IGVsc2Uge1xuICAgICAgICB2ZXJzaW9uID0gdmVyc2lvbi52ZXJzaW9uO1xuICAgICAgfVxuICAgIH0gZWxzZSBpZiAodHlwZW9mIHZlcnNpb24gIT09ICdzdHJpbmcnKSB7XG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKGBJbnZhbGlkIFZlcnNpb246ICR7dmVyc2lvbn1gKVxuICAgIH1cblxuICAgIGlmICh2ZXJzaW9uLmxlbmd0aCA+IE1BWF9MRU5HVEgkMSkge1xuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcbiAgICAgICAgYHZlcnNpb24gaXMgbG9uZ2VyIHRoYW4gJHtNQVhfTEVOR1RIJDF9IGNoYXJhY3RlcnNgXG4gICAgICApXG4gICAgfVxuXG4gICAgZGVidWckMignU2VtVmVyJywgdmVyc2lvbiwgb3B0aW9ucyk7XG4gICAgdGhpcy5vcHRpb25zID0gb3B0aW9ucztcbiAgICB0aGlzLmxvb3NlID0gISFvcHRpb25zLmxvb3NlO1xuICAgIC8vIHRoaXMgaXNuJ3QgYWN0dWFsbHkgcmVsZXZhbnQgZm9yIHZlcnNpb25zLCBidXQga2VlcCBpdCBzbyB0aGF0IHdlXG4gICAgLy8gZG9uJ3QgcnVuIGludG8gdHJvdWJsZSBwYXNzaW5nIHRoaXMub3B0aW9ucyBhcm91bmQuXG4gICAgdGhpcy5pbmNsdWRlUHJlcmVsZWFzZSA9ICEhb3B0aW9ucy5pbmNsdWRlUHJlcmVsZWFzZTtcblxuICAgIGNvbnN0IG0gPSB2ZXJzaW9uLnRyaW0oKS5tYXRjaChvcHRpb25zLmxvb3NlID8gcmUkNFt0JDQuTE9PU0VdIDogcmUkNFt0JDQuRlVMTF0pO1xuXG4gICAgaWYgKCFtKSB7XG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKGBJbnZhbGlkIFZlcnNpb246ICR7dmVyc2lvbn1gKVxuICAgIH1cblxuICAgIHRoaXMucmF3ID0gdmVyc2lvbjtcblxuICAgIC8vIHRoZXNlIGFyZSBhY3R1YWxseSBudW1iZXJzXG4gICAgdGhpcy5tYWpvciA9ICttWzFdO1xuICAgIHRoaXMubWlub3IgPSArbVsyXTtcbiAgICB0aGlzLnBhdGNoID0gK21bM107XG5cbiAgICBpZiAodGhpcy5tYWpvciA+IE1BWF9TQUZFX0lOVEVHRVIgfHwgdGhpcy5tYWpvciA8IDApIHtcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0ludmFsaWQgbWFqb3IgdmVyc2lvbicpXG4gICAgfVxuXG4gICAgaWYgKHRoaXMubWlub3IgPiBNQVhfU0FGRV9JTlRFR0VSIHx8IHRoaXMubWlub3IgPCAwKSB7XG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdJbnZhbGlkIG1pbm9yIHZlcnNpb24nKVxuICAgIH1cblxuICAgIGlmICh0aGlzLnBhdGNoID4gTUFYX1NBRkVfSU5URUdFUiB8fCB0aGlzLnBhdGNoIDwgMCkge1xuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignSW52YWxpZCBwYXRjaCB2ZXJzaW9uJylcbiAgICB9XG5cbiAgICAvLyBudW1iZXJpZnkgYW55IHByZXJlbGVhc2UgbnVtZXJpYyBpZHNcbiAgICBpZiAoIW1bNF0pIHtcbiAgICAgIHRoaXMucHJlcmVsZWFzZSA9IFtdO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnByZXJlbGVhc2UgPSBtWzRdLnNwbGl0KCcuJykubWFwKChpZCkgPT4ge1xuICAgICAgICBpZiAoL15bMC05XSskLy50ZXN0KGlkKSkge1xuICAgICAgICAgIGNvbnN0IG51bSA9ICtpZDtcbiAgICAgICAgICBpZiAobnVtID49IDAgJiYgbnVtIDwgTUFYX1NBRkVfSU5URUdFUikge1xuICAgICAgICAgICAgcmV0dXJuIG51bVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gaWRcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIHRoaXMuYnVpbGQgPSBtWzVdID8gbVs1XS5zcGxpdCgnLicpIDogW107XG4gICAgdGhpcy5mb3JtYXQoKTtcbiAgfVxuXG4gIGZvcm1hdCAoKSB7XG4gICAgdGhpcy52ZXJzaW9uID0gYCR7dGhpcy5tYWpvcn0uJHt0aGlzLm1pbm9yfS4ke3RoaXMucGF0Y2h9YDtcbiAgICBpZiAodGhpcy5wcmVyZWxlYXNlLmxlbmd0aCkge1xuICAgICAgdGhpcy52ZXJzaW9uICs9IGAtJHt0aGlzLnByZXJlbGVhc2Uuam9pbignLicpfWA7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLnZlcnNpb25cbiAgfVxuXG4gIHRvU3RyaW5nICgpIHtcbiAgICByZXR1cm4gdGhpcy52ZXJzaW9uXG4gIH1cblxuICBjb21wYXJlIChvdGhlcikge1xuICAgIGRlYnVnJDIoJ1NlbVZlci5jb21wYXJlJywgdGhpcy52ZXJzaW9uLCB0aGlzLm9wdGlvbnMsIG90aGVyKTtcbiAgICBpZiAoIShvdGhlciBpbnN0YW5jZW9mIFNlbVZlciRlKSkge1xuICAgICAgaWYgKHR5cGVvZiBvdGhlciA9PT0gJ3N0cmluZycgJiYgb3RoZXIgPT09IHRoaXMudmVyc2lvbikge1xuICAgICAgICByZXR1cm4gMFxuICAgICAgfVxuICAgICAgb3RoZXIgPSBuZXcgU2VtVmVyJGUob3RoZXIsIHRoaXMub3B0aW9ucyk7XG4gICAgfVxuXG4gICAgaWYgKG90aGVyLnZlcnNpb24gPT09IHRoaXMudmVyc2lvbikge1xuICAgICAgcmV0dXJuIDBcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5jb21wYXJlTWFpbihvdGhlcikgfHwgdGhpcy5jb21wYXJlUHJlKG90aGVyKVxuICB9XG5cbiAgY29tcGFyZU1haW4gKG90aGVyKSB7XG4gICAgaWYgKCEob3RoZXIgaW5zdGFuY2VvZiBTZW1WZXIkZSkpIHtcbiAgICAgIG90aGVyID0gbmV3IFNlbVZlciRlKG90aGVyLCB0aGlzLm9wdGlvbnMpO1xuICAgIH1cblxuICAgIHJldHVybiAoXG4gICAgICBjb21wYXJlSWRlbnRpZmllcnModGhpcy5tYWpvciwgb3RoZXIubWFqb3IpIHx8XG4gICAgICBjb21wYXJlSWRlbnRpZmllcnModGhpcy5taW5vciwgb3RoZXIubWlub3IpIHx8XG4gICAgICBjb21wYXJlSWRlbnRpZmllcnModGhpcy5wYXRjaCwgb3RoZXIucGF0Y2gpXG4gICAgKVxuICB9XG5cbiAgY29tcGFyZVByZSAob3RoZXIpIHtcbiAgICBpZiAoIShvdGhlciBpbnN0YW5jZW9mIFNlbVZlciRlKSkge1xuICAgICAgb3RoZXIgPSBuZXcgU2VtVmVyJGUob3RoZXIsIHRoaXMub3B0aW9ucyk7XG4gICAgfVxuXG4gICAgLy8gTk9UIGhhdmluZyBhIHByZXJlbGVhc2UgaXMgPiBoYXZpbmcgb25lXG4gICAgaWYgKHRoaXMucHJlcmVsZWFzZS5sZW5ndGggJiYgIW90aGVyLnByZXJlbGVhc2UubGVuZ3RoKSB7XG4gICAgICByZXR1cm4gLTFcbiAgICB9IGVsc2UgaWYgKCF0aGlzLnByZXJlbGVhc2UubGVuZ3RoICYmIG90aGVyLnByZXJlbGVhc2UubGVuZ3RoKSB7XG4gICAgICByZXR1cm4gMVxuICAgIH0gZWxzZSBpZiAoIXRoaXMucHJlcmVsZWFzZS5sZW5ndGggJiYgIW90aGVyLnByZXJlbGVhc2UubGVuZ3RoKSB7XG4gICAgICByZXR1cm4gMFxuICAgIH1cblxuICAgIGxldCBpID0gMDtcbiAgICBkbyB7XG4gICAgICBjb25zdCBhID0gdGhpcy5wcmVyZWxlYXNlW2ldO1xuICAgICAgY29uc3QgYiA9IG90aGVyLnByZXJlbGVhc2VbaV07XG4gICAgICBkZWJ1ZyQyKCdwcmVyZWxlYXNlIGNvbXBhcmUnLCBpLCBhLCBiKTtcbiAgICAgIGlmIChhID09PSB1bmRlZmluZWQgJiYgYiA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHJldHVybiAwXG4gICAgICB9IGVsc2UgaWYgKGIgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICByZXR1cm4gMVxuICAgICAgfSBlbHNlIGlmIChhID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgcmV0dXJuIC0xXG4gICAgICB9IGVsc2UgaWYgKGEgPT09IGIpIHtcbiAgICAgICAgY29udGludWVcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBjb21wYXJlSWRlbnRpZmllcnMoYSwgYilcbiAgICAgIH1cbiAgICB9IHdoaWxlICgrK2kpXG4gIH1cblxuICBjb21wYXJlQnVpbGQgKG90aGVyKSB7XG4gICAgaWYgKCEob3RoZXIgaW5zdGFuY2VvZiBTZW1WZXIkZSkpIHtcbiAgICAgIG90aGVyID0gbmV3IFNlbVZlciRlKG90aGVyLCB0aGlzLm9wdGlvbnMpO1xuICAgIH1cblxuICAgIGxldCBpID0gMDtcbiAgICBkbyB7XG4gICAgICBjb25zdCBhID0gdGhpcy5idWlsZFtpXTtcbiAgICAgIGNvbnN0IGIgPSBvdGhlci5idWlsZFtpXTtcbiAgICAgIGRlYnVnJDIoJ3ByZXJlbGVhc2UgY29tcGFyZScsIGksIGEsIGIpO1xuICAgICAgaWYgKGEgPT09IHVuZGVmaW5lZCAmJiBiID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgcmV0dXJuIDBcbiAgICAgIH0gZWxzZSBpZiAoYiA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHJldHVybiAxXG4gICAgICB9IGVsc2UgaWYgKGEgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICByZXR1cm4gLTFcbiAgICAgIH0gZWxzZSBpZiAoYSA9PT0gYikge1xuICAgICAgICBjb250aW51ZVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIGNvbXBhcmVJZGVudGlmaWVycyhhLCBiKVxuICAgICAgfVxuICAgIH0gd2hpbGUgKCsraSlcbiAgfVxuXG4gIC8vIHByZW1pbm9yIHdpbGwgYnVtcCB0aGUgdmVyc2lvbiB1cCB0byB0aGUgbmV4dCBtaW5vciByZWxlYXNlLCBhbmQgaW1tZWRpYXRlbHlcbiAgLy8gZG93biB0byBwcmUtcmVsZWFzZS4gcHJlbWFqb3IgYW5kIHByZXBhdGNoIHdvcmsgdGhlIHNhbWUgd2F5LlxuICBpbmMgKHJlbGVhc2UsIGlkZW50aWZpZXIpIHtcbiAgICBzd2l0Y2ggKHJlbGVhc2UpIHtcbiAgICAgIGNhc2UgJ3ByZW1ham9yJzpcbiAgICAgICAgdGhpcy5wcmVyZWxlYXNlLmxlbmd0aCA9IDA7XG4gICAgICAgIHRoaXMucGF0Y2ggPSAwO1xuICAgICAgICB0aGlzLm1pbm9yID0gMDtcbiAgICAgICAgdGhpcy5tYWpvcisrO1xuICAgICAgICB0aGlzLmluYygncHJlJywgaWRlbnRpZmllcik7XG4gICAgICAgIGJyZWFrXG4gICAgICBjYXNlICdwcmVtaW5vcic6XG4gICAgICAgIHRoaXMucHJlcmVsZWFzZS5sZW5ndGggPSAwO1xuICAgICAgICB0aGlzLnBhdGNoID0gMDtcbiAgICAgICAgdGhpcy5taW5vcisrO1xuICAgICAgICB0aGlzLmluYygncHJlJywgaWRlbnRpZmllcik7XG4gICAgICAgIGJyZWFrXG4gICAgICBjYXNlICdwcmVwYXRjaCc6XG4gICAgICAgIC8vIElmIHRoaXMgaXMgYWxyZWFkeSBhIHByZXJlbGVhc2UsIGl0IHdpbGwgYnVtcCB0byB0aGUgbmV4dCB2ZXJzaW9uXG4gICAgICAgIC8vIGRyb3AgYW55IHByZXJlbGVhc2VzIHRoYXQgbWlnaHQgYWxyZWFkeSBleGlzdCwgc2luY2UgdGhleSBhcmUgbm90XG4gICAgICAgIC8vIHJlbGV2YW50IGF0IHRoaXMgcG9pbnQuXG4gICAgICAgIHRoaXMucHJlcmVsZWFzZS5sZW5ndGggPSAwO1xuICAgICAgICB0aGlzLmluYygncGF0Y2gnLCBpZGVudGlmaWVyKTtcbiAgICAgICAgdGhpcy5pbmMoJ3ByZScsIGlkZW50aWZpZXIpO1xuICAgICAgICBicmVha1xuICAgICAgLy8gSWYgdGhlIGlucHV0IGlzIGEgbm9uLXByZXJlbGVhc2UgdmVyc2lvbiwgdGhpcyBhY3RzIHRoZSBzYW1lIGFzXG4gICAgICAvLyBwcmVwYXRjaC5cbiAgICAgIGNhc2UgJ3ByZXJlbGVhc2UnOlxuICAgICAgICBpZiAodGhpcy5wcmVyZWxlYXNlLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgIHRoaXMuaW5jKCdwYXRjaCcsIGlkZW50aWZpZXIpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuaW5jKCdwcmUnLCBpZGVudGlmaWVyKTtcbiAgICAgICAgYnJlYWtcblxuICAgICAgY2FzZSAnbWFqb3InOlxuICAgICAgICAvLyBJZiB0aGlzIGlzIGEgcHJlLW1ham9yIHZlcnNpb24sIGJ1bXAgdXAgdG8gdGhlIHNhbWUgbWFqb3IgdmVyc2lvbi5cbiAgICAgICAgLy8gT3RoZXJ3aXNlIGluY3JlbWVudCBtYWpvci5cbiAgICAgICAgLy8gMS4wLjAtNSBidW1wcyB0byAxLjAuMFxuICAgICAgICAvLyAxLjEuMCBidW1wcyB0byAyLjAuMFxuICAgICAgICBpZiAoXG4gICAgICAgICAgdGhpcy5taW5vciAhPT0gMCB8fFxuICAgICAgICAgIHRoaXMucGF0Y2ggIT09IDAgfHxcbiAgICAgICAgICB0aGlzLnByZXJlbGVhc2UubGVuZ3RoID09PSAwXG4gICAgICAgICkge1xuICAgICAgICAgIHRoaXMubWFqb3IrKztcbiAgICAgICAgfVxuICAgICAgICB0aGlzLm1pbm9yID0gMDtcbiAgICAgICAgdGhpcy5wYXRjaCA9IDA7XG4gICAgICAgIHRoaXMucHJlcmVsZWFzZSA9IFtdO1xuICAgICAgICBicmVha1xuICAgICAgY2FzZSAnbWlub3InOlxuICAgICAgICAvLyBJZiB0aGlzIGlzIGEgcHJlLW1pbm9yIHZlcnNpb24sIGJ1bXAgdXAgdG8gdGhlIHNhbWUgbWlub3IgdmVyc2lvbi5cbiAgICAgICAgLy8gT3RoZXJ3aXNlIGluY3JlbWVudCBtaW5vci5cbiAgICAgICAgLy8gMS4yLjAtNSBidW1wcyB0byAxLjIuMFxuICAgICAgICAvLyAxLjIuMSBidW1wcyB0byAxLjMuMFxuICAgICAgICBpZiAodGhpcy5wYXRjaCAhPT0gMCB8fCB0aGlzLnByZXJlbGVhc2UubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgdGhpcy5taW5vcisrO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMucGF0Y2ggPSAwO1xuICAgICAgICB0aGlzLnByZXJlbGVhc2UgPSBbXTtcbiAgICAgICAgYnJlYWtcbiAgICAgIGNhc2UgJ3BhdGNoJzpcbiAgICAgICAgLy8gSWYgdGhpcyBpcyBub3QgYSBwcmUtcmVsZWFzZSB2ZXJzaW9uLCBpdCB3aWxsIGluY3JlbWVudCB0aGUgcGF0Y2guXG4gICAgICAgIC8vIElmIGl0IGlzIGEgcHJlLXJlbGVhc2UgaXQgd2lsbCBidW1wIHVwIHRvIHRoZSBzYW1lIHBhdGNoIHZlcnNpb24uXG4gICAgICAgIC8vIDEuMi4wLTUgcGF0Y2hlcyB0byAxLjIuMFxuICAgICAgICAvLyAxLjIuMCBwYXRjaGVzIHRvIDEuMi4xXG4gICAgICAgIGlmICh0aGlzLnByZXJlbGVhc2UubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgdGhpcy5wYXRjaCsrO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMucHJlcmVsZWFzZSA9IFtdO1xuICAgICAgICBicmVha1xuICAgICAgLy8gVGhpcyBwcm9iYWJseSBzaG91bGRuJ3QgYmUgdXNlZCBwdWJsaWNseS5cbiAgICAgIC8vIDEuMC4wICdwcmUnIHdvdWxkIGJlY29tZSAxLjAuMC0wIHdoaWNoIGlzIHRoZSB3cm9uZyBkaXJlY3Rpb24uXG4gICAgICBjYXNlICdwcmUnOlxuICAgICAgICBpZiAodGhpcy5wcmVyZWxlYXNlLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgIHRoaXMucHJlcmVsZWFzZSA9IFswXTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBsZXQgaSA9IHRoaXMucHJlcmVsZWFzZS5sZW5ndGg7XG4gICAgICAgICAgd2hpbGUgKC0taSA+PSAwKSB7XG4gICAgICAgICAgICBpZiAodHlwZW9mIHRoaXMucHJlcmVsZWFzZVtpXSA9PT0gJ251bWJlcicpIHtcbiAgICAgICAgICAgICAgdGhpcy5wcmVyZWxlYXNlW2ldKys7XG4gICAgICAgICAgICAgIGkgPSAtMjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKGkgPT09IC0xKSB7XG4gICAgICAgICAgICAvLyBkaWRuJ3QgaW5jcmVtZW50IGFueXRoaW5nXG4gICAgICAgICAgICB0aGlzLnByZXJlbGVhc2UucHVzaCgwKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGlkZW50aWZpZXIpIHtcbiAgICAgICAgICAvLyAxLjIuMC1iZXRhLjEgYnVtcHMgdG8gMS4yLjAtYmV0YS4yLFxuICAgICAgICAgIC8vIDEuMi4wLWJldGEuZm9vYmx6IG9yIDEuMi4wLWJldGEgYnVtcHMgdG8gMS4yLjAtYmV0YS4wXG4gICAgICAgICAgaWYgKHRoaXMucHJlcmVsZWFzZVswXSA9PT0gaWRlbnRpZmllcikge1xuICAgICAgICAgICAgaWYgKGlzTmFOKHRoaXMucHJlcmVsZWFzZVsxXSkpIHtcbiAgICAgICAgICAgICAgdGhpcy5wcmVyZWxlYXNlID0gW2lkZW50aWZpZXIsIDBdO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLnByZXJlbGVhc2UgPSBbaWRlbnRpZmllciwgMF07XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGJyZWFrXG5cbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgaW52YWxpZCBpbmNyZW1lbnQgYXJndW1lbnQ6ICR7cmVsZWFzZX1gKVxuICAgIH1cbiAgICB0aGlzLmZvcm1hdCgpO1xuICAgIHRoaXMucmF3ID0gdGhpcy52ZXJzaW9uO1xuICAgIHJldHVybiB0aGlzXG4gIH1cbn1cblxudmFyIHNlbXZlciQyID0gU2VtVmVyJGU7XG5cbmNvbnN0IHtNQVhfTEVOR1RIfSA9IGNvbnN0YW50cztcbmNvbnN0IHsgcmU6IHJlJDMsIHQ6IHQkMyB9ID0gcmUkNS5leHBvcnRzO1xuY29uc3QgU2VtVmVyJGQgPSBzZW12ZXIkMjtcblxuY29uc3QgcGFyc2VPcHRpb25zJDIgPSBwYXJzZU9wdGlvbnNfMTtcbmNvbnN0IHBhcnNlJDUgPSAodmVyc2lvbiwgb3B0aW9ucykgPT4ge1xuICBvcHRpb25zID0gcGFyc2VPcHRpb25zJDIob3B0aW9ucyk7XG5cbiAgaWYgKHZlcnNpb24gaW5zdGFuY2VvZiBTZW1WZXIkZCkge1xuICAgIHJldHVybiB2ZXJzaW9uXG4gIH1cblxuICBpZiAodHlwZW9mIHZlcnNpb24gIT09ICdzdHJpbmcnKSB7XG4gICAgcmV0dXJuIG51bGxcbiAgfVxuXG4gIGlmICh2ZXJzaW9uLmxlbmd0aCA+IE1BWF9MRU5HVEgpIHtcbiAgICByZXR1cm4gbnVsbFxuICB9XG5cbiAgY29uc3QgciA9IG9wdGlvbnMubG9vc2UgPyByZSQzW3QkMy5MT09TRV0gOiByZSQzW3QkMy5GVUxMXTtcbiAgaWYgKCFyLnRlc3QodmVyc2lvbikpIHtcbiAgICByZXR1cm4gbnVsbFxuICB9XG5cbiAgdHJ5IHtcbiAgICByZXR1cm4gbmV3IFNlbVZlciRkKHZlcnNpb24sIG9wdGlvbnMpXG4gIH0gY2F0Y2ggKGVyKSB7XG4gICAgcmV0dXJuIG51bGxcbiAgfVxufTtcblxudmFyIHBhcnNlXzEgPSBwYXJzZSQ1O1xuXG5jb25zdCBwYXJzZSQ0ID0gcGFyc2VfMTtcbmNvbnN0IHZhbGlkJDEgPSAodmVyc2lvbiwgb3B0aW9ucykgPT4ge1xuICBjb25zdCB2ID0gcGFyc2UkNCh2ZXJzaW9uLCBvcHRpb25zKTtcbiAgcmV0dXJuIHYgPyB2LnZlcnNpb24gOiBudWxsXG59O1xudmFyIHZhbGlkXzEgPSB2YWxpZCQxO1xuXG5jb25zdCBwYXJzZSQzID0gcGFyc2VfMTtcbmNvbnN0IGNsZWFuID0gKHZlcnNpb24sIG9wdGlvbnMpID0+IHtcbiAgY29uc3QgcyA9IHBhcnNlJDModmVyc2lvbi50cmltKCkucmVwbGFjZSgvXls9dl0rLywgJycpLCBvcHRpb25zKTtcbiAgcmV0dXJuIHMgPyBzLnZlcnNpb24gOiBudWxsXG59O1xudmFyIGNsZWFuXzEgPSBjbGVhbjtcblxuY29uc3QgU2VtVmVyJGMgPSBzZW12ZXIkMjtcblxuY29uc3QgaW5jID0gKHZlcnNpb24sIHJlbGVhc2UsIG9wdGlvbnMsIGlkZW50aWZpZXIpID0+IHtcbiAgaWYgKHR5cGVvZiAob3B0aW9ucykgPT09ICdzdHJpbmcnKSB7XG4gICAgaWRlbnRpZmllciA9IG9wdGlvbnM7XG4gICAgb3B0aW9ucyA9IHVuZGVmaW5lZDtcbiAgfVxuXG4gIHRyeSB7XG4gICAgcmV0dXJuIG5ldyBTZW1WZXIkYyh2ZXJzaW9uLCBvcHRpb25zKS5pbmMocmVsZWFzZSwgaWRlbnRpZmllcikudmVyc2lvblxuICB9IGNhdGNoIChlcikge1xuICAgIHJldHVybiBudWxsXG4gIH1cbn07XG52YXIgaW5jXzEgPSBpbmM7XG5cbmNvbnN0IFNlbVZlciRiID0gc2VtdmVyJDI7XG5jb25zdCBjb21wYXJlJGEgPSAoYSwgYiwgbG9vc2UpID0+XG4gIG5ldyBTZW1WZXIkYihhLCBsb29zZSkuY29tcGFyZShuZXcgU2VtVmVyJGIoYiwgbG9vc2UpKTtcblxudmFyIGNvbXBhcmVfMSA9IGNvbXBhcmUkYTtcblxuY29uc3QgY29tcGFyZSQ5ID0gY29tcGFyZV8xO1xuY29uc3QgZXEkMiA9IChhLCBiLCBsb29zZSkgPT4gY29tcGFyZSQ5KGEsIGIsIGxvb3NlKSA9PT0gMDtcbnZhciBlcV8xID0gZXEkMjtcblxuY29uc3QgcGFyc2UkMiA9IHBhcnNlXzE7XG5jb25zdCBlcSQxID0gZXFfMTtcblxuY29uc3QgZGlmZiA9ICh2ZXJzaW9uMSwgdmVyc2lvbjIpID0+IHtcbiAgaWYgKGVxJDEodmVyc2lvbjEsIHZlcnNpb24yKSkge1xuICAgIHJldHVybiBudWxsXG4gIH0gZWxzZSB7XG4gICAgY29uc3QgdjEgPSBwYXJzZSQyKHZlcnNpb24xKTtcbiAgICBjb25zdCB2MiA9IHBhcnNlJDIodmVyc2lvbjIpO1xuICAgIGNvbnN0IGhhc1ByZSA9IHYxLnByZXJlbGVhc2UubGVuZ3RoIHx8IHYyLnByZXJlbGVhc2UubGVuZ3RoO1xuICAgIGNvbnN0IHByZWZpeCA9IGhhc1ByZSA/ICdwcmUnIDogJyc7XG4gICAgY29uc3QgZGVmYXVsdFJlc3VsdCA9IGhhc1ByZSA/ICdwcmVyZWxlYXNlJyA6ICcnO1xuICAgIGZvciAoY29uc3Qga2V5IGluIHYxKSB7XG4gICAgICBpZiAoa2V5ID09PSAnbWFqb3InIHx8IGtleSA9PT0gJ21pbm9yJyB8fCBrZXkgPT09ICdwYXRjaCcpIHtcbiAgICAgICAgaWYgKHYxW2tleV0gIT09IHYyW2tleV0pIHtcbiAgICAgICAgICByZXR1cm4gcHJlZml4ICsga2V5XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGRlZmF1bHRSZXN1bHQgLy8gbWF5IGJlIHVuZGVmaW5lZFxuICB9XG59O1xudmFyIGRpZmZfMSA9IGRpZmY7XG5cbmNvbnN0IFNlbVZlciRhID0gc2VtdmVyJDI7XG5jb25zdCBtYWpvciA9IChhLCBsb29zZSkgPT4gbmV3IFNlbVZlciRhKGEsIGxvb3NlKS5tYWpvcjtcbnZhciBtYWpvcl8xID0gbWFqb3I7XG5cbmNvbnN0IFNlbVZlciQ5ID0gc2VtdmVyJDI7XG5jb25zdCBtaW5vciA9IChhLCBsb29zZSkgPT4gbmV3IFNlbVZlciQ5KGEsIGxvb3NlKS5taW5vcjtcbnZhciBtaW5vcl8xID0gbWlub3I7XG5cbmNvbnN0IFNlbVZlciQ4ID0gc2VtdmVyJDI7XG5jb25zdCBwYXRjaCA9IChhLCBsb29zZSkgPT4gbmV3IFNlbVZlciQ4KGEsIGxvb3NlKS5wYXRjaDtcbnZhciBwYXRjaF8xID0gcGF0Y2g7XG5cbmNvbnN0IHBhcnNlJDEgPSBwYXJzZV8xO1xuY29uc3QgcHJlcmVsZWFzZSA9ICh2ZXJzaW9uLCBvcHRpb25zKSA9PiB7XG4gIGNvbnN0IHBhcnNlZCA9IHBhcnNlJDEodmVyc2lvbiwgb3B0aW9ucyk7XG4gIHJldHVybiAocGFyc2VkICYmIHBhcnNlZC5wcmVyZWxlYXNlLmxlbmd0aCkgPyBwYXJzZWQucHJlcmVsZWFzZSA6IG51bGxcbn07XG52YXIgcHJlcmVsZWFzZV8xID0gcHJlcmVsZWFzZTtcblxuY29uc3QgY29tcGFyZSQ4ID0gY29tcGFyZV8xO1xuY29uc3QgcmNvbXBhcmUgPSAoYSwgYiwgbG9vc2UpID0+IGNvbXBhcmUkOChiLCBhLCBsb29zZSk7XG52YXIgcmNvbXBhcmVfMSA9IHJjb21wYXJlO1xuXG5jb25zdCBjb21wYXJlJDcgPSBjb21wYXJlXzE7XG5jb25zdCBjb21wYXJlTG9vc2UgPSAoYSwgYikgPT4gY29tcGFyZSQ3KGEsIGIsIHRydWUpO1xudmFyIGNvbXBhcmVMb29zZV8xID0gY29tcGFyZUxvb3NlO1xuXG5jb25zdCBTZW1WZXIkNyA9IHNlbXZlciQyO1xuY29uc3QgY29tcGFyZUJ1aWxkJDIgPSAoYSwgYiwgbG9vc2UpID0+IHtcbiAgY29uc3QgdmVyc2lvbkEgPSBuZXcgU2VtVmVyJDcoYSwgbG9vc2UpO1xuICBjb25zdCB2ZXJzaW9uQiA9IG5ldyBTZW1WZXIkNyhiLCBsb29zZSk7XG4gIHJldHVybiB2ZXJzaW9uQS5jb21wYXJlKHZlcnNpb25CKSB8fCB2ZXJzaW9uQS5jb21wYXJlQnVpbGQodmVyc2lvbkIpXG59O1xudmFyIGNvbXBhcmVCdWlsZF8xID0gY29tcGFyZUJ1aWxkJDI7XG5cbmNvbnN0IGNvbXBhcmVCdWlsZCQxID0gY29tcGFyZUJ1aWxkXzE7XG5jb25zdCBzb3J0ID0gKGxpc3QsIGxvb3NlKSA9PiBsaXN0LnNvcnQoKGEsIGIpID0+IGNvbXBhcmVCdWlsZCQxKGEsIGIsIGxvb3NlKSk7XG52YXIgc29ydF8xID0gc29ydDtcblxuY29uc3QgY29tcGFyZUJ1aWxkID0gY29tcGFyZUJ1aWxkXzE7XG5jb25zdCByc29ydCA9IChsaXN0LCBsb29zZSkgPT4gbGlzdC5zb3J0KChhLCBiKSA9PiBjb21wYXJlQnVpbGQoYiwgYSwgbG9vc2UpKTtcbnZhciByc29ydF8xID0gcnNvcnQ7XG5cbmNvbnN0IGNvbXBhcmUkNiA9IGNvbXBhcmVfMTtcbmNvbnN0IGd0JDMgPSAoYSwgYiwgbG9vc2UpID0+IGNvbXBhcmUkNihhLCBiLCBsb29zZSkgPiAwO1xudmFyIGd0XzEgPSBndCQzO1xuXG5jb25zdCBjb21wYXJlJDUgPSBjb21wYXJlXzE7XG5jb25zdCBsdCQyID0gKGEsIGIsIGxvb3NlKSA9PiBjb21wYXJlJDUoYSwgYiwgbG9vc2UpIDwgMDtcbnZhciBsdF8xID0gbHQkMjtcblxuY29uc3QgY29tcGFyZSQ0ID0gY29tcGFyZV8xO1xuY29uc3QgbmVxJDEgPSAoYSwgYiwgbG9vc2UpID0+IGNvbXBhcmUkNChhLCBiLCBsb29zZSkgIT09IDA7XG52YXIgbmVxXzEgPSBuZXEkMTtcblxuY29uc3QgY29tcGFyZSQzID0gY29tcGFyZV8xO1xuY29uc3QgZ3RlJDIgPSAoYSwgYiwgbG9vc2UpID0+IGNvbXBhcmUkMyhhLCBiLCBsb29zZSkgPj0gMDtcbnZhciBndGVfMSA9IGd0ZSQyO1xuXG5jb25zdCBjb21wYXJlJDIgPSBjb21wYXJlXzE7XG5jb25zdCBsdGUkMiA9IChhLCBiLCBsb29zZSkgPT4gY29tcGFyZSQyKGEsIGIsIGxvb3NlKSA8PSAwO1xudmFyIGx0ZV8xID0gbHRlJDI7XG5cbmNvbnN0IGVxID0gZXFfMTtcbmNvbnN0IG5lcSA9IG5lcV8xO1xuY29uc3QgZ3QkMiA9IGd0XzE7XG5jb25zdCBndGUkMSA9IGd0ZV8xO1xuY29uc3QgbHQkMSA9IGx0XzE7XG5jb25zdCBsdGUkMSA9IGx0ZV8xO1xuXG5jb25zdCBjbXAkMSA9IChhLCBvcCwgYiwgbG9vc2UpID0+IHtcbiAgc3dpdGNoIChvcCkge1xuICAgIGNhc2UgJz09PSc6XG4gICAgICBpZiAodHlwZW9mIGEgPT09ICdvYmplY3QnKVxuICAgICAgICBhID0gYS52ZXJzaW9uO1xuICAgICAgaWYgKHR5cGVvZiBiID09PSAnb2JqZWN0JylcbiAgICAgICAgYiA9IGIudmVyc2lvbjtcbiAgICAgIHJldHVybiBhID09PSBiXG5cbiAgICBjYXNlICchPT0nOlxuICAgICAgaWYgKHR5cGVvZiBhID09PSAnb2JqZWN0JylcbiAgICAgICAgYSA9IGEudmVyc2lvbjtcbiAgICAgIGlmICh0eXBlb2YgYiA9PT0gJ29iamVjdCcpXG4gICAgICAgIGIgPSBiLnZlcnNpb247XG4gICAgICByZXR1cm4gYSAhPT0gYlxuXG4gICAgY2FzZSAnJzpcbiAgICBjYXNlICc9JzpcbiAgICBjYXNlICc9PSc6XG4gICAgICByZXR1cm4gZXEoYSwgYiwgbG9vc2UpXG5cbiAgICBjYXNlICchPSc6XG4gICAgICByZXR1cm4gbmVxKGEsIGIsIGxvb3NlKVxuXG4gICAgY2FzZSAnPic6XG4gICAgICByZXR1cm4gZ3QkMihhLCBiLCBsb29zZSlcblxuICAgIGNhc2UgJz49JzpcbiAgICAgIHJldHVybiBndGUkMShhLCBiLCBsb29zZSlcblxuICAgIGNhc2UgJzwnOlxuICAgICAgcmV0dXJuIGx0JDEoYSwgYiwgbG9vc2UpXG5cbiAgICBjYXNlICc8PSc6XG4gICAgICByZXR1cm4gbHRlJDEoYSwgYiwgbG9vc2UpXG5cbiAgICBkZWZhdWx0OlxuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihgSW52YWxpZCBvcGVyYXRvcjogJHtvcH1gKVxuICB9XG59O1xudmFyIGNtcF8xID0gY21wJDE7XG5cbmNvbnN0IFNlbVZlciQ2ID0gc2VtdmVyJDI7XG5jb25zdCBwYXJzZSA9IHBhcnNlXzE7XG5jb25zdCB7cmU6IHJlJDIsIHQ6IHQkMn0gPSByZSQ1LmV4cG9ydHM7XG5cbmNvbnN0IGNvZXJjZSA9ICh2ZXJzaW9uLCBvcHRpb25zKSA9PiB7XG4gIGlmICh2ZXJzaW9uIGluc3RhbmNlb2YgU2VtVmVyJDYpIHtcbiAgICByZXR1cm4gdmVyc2lvblxuICB9XG5cbiAgaWYgKHR5cGVvZiB2ZXJzaW9uID09PSAnbnVtYmVyJykge1xuICAgIHZlcnNpb24gPSBTdHJpbmcodmVyc2lvbik7XG4gIH1cblxuICBpZiAodHlwZW9mIHZlcnNpb24gIT09ICdzdHJpbmcnKSB7XG4gICAgcmV0dXJuIG51bGxcbiAgfVxuXG4gIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuXG4gIGxldCBtYXRjaCA9IG51bGw7XG4gIGlmICghb3B0aW9ucy5ydGwpIHtcbiAgICBtYXRjaCA9IHZlcnNpb24ubWF0Y2gocmUkMlt0JDIuQ09FUkNFXSk7XG4gIH0gZWxzZSB7XG4gICAgLy8gRmluZCB0aGUgcmlnaHQtbW9zdCBjb2VyY2libGUgc3RyaW5nIHRoYXQgZG9lcyBub3Qgc2hhcmVcbiAgICAvLyBhIHRlcm1pbnVzIHdpdGggYSBtb3JlIGxlZnQtd2FyZCBjb2VyY2libGUgc3RyaW5nLlxuICAgIC8vIEVnLCAnMS4yLjMuNCcgd2FudHMgdG8gY29lcmNlICcyLjMuNCcsIG5vdCAnMy40JyBvciAnNCdcbiAgICAvL1xuICAgIC8vIFdhbGsgdGhyb3VnaCB0aGUgc3RyaW5nIGNoZWNraW5nIHdpdGggYSAvZyByZWdleHBcbiAgICAvLyBNYW51YWxseSBzZXQgdGhlIGluZGV4IHNvIGFzIHRvIHBpY2sgdXAgb3ZlcmxhcHBpbmcgbWF0Y2hlcy5cbiAgICAvLyBTdG9wIHdoZW4gd2UgZ2V0IGEgbWF0Y2ggdGhhdCBlbmRzIGF0IHRoZSBzdHJpbmcgZW5kLCBzaW5jZSBub1xuICAgIC8vIGNvZXJjaWJsZSBzdHJpbmcgY2FuIGJlIG1vcmUgcmlnaHQtd2FyZCB3aXRob3V0IHRoZSBzYW1lIHRlcm1pbnVzLlxuICAgIGxldCBuZXh0O1xuICAgIHdoaWxlICgobmV4dCA9IHJlJDJbdCQyLkNPRVJDRVJUTF0uZXhlYyh2ZXJzaW9uKSkgJiZcbiAgICAgICAgKCFtYXRjaCB8fCBtYXRjaC5pbmRleCArIG1hdGNoWzBdLmxlbmd0aCAhPT0gdmVyc2lvbi5sZW5ndGgpXG4gICAgKSB7XG4gICAgICBpZiAoIW1hdGNoIHx8XG4gICAgICAgICAgICBuZXh0LmluZGV4ICsgbmV4dFswXS5sZW5ndGggIT09IG1hdGNoLmluZGV4ICsgbWF0Y2hbMF0ubGVuZ3RoKSB7XG4gICAgICAgIG1hdGNoID0gbmV4dDtcbiAgICAgIH1cbiAgICAgIHJlJDJbdCQyLkNPRVJDRVJUTF0ubGFzdEluZGV4ID0gbmV4dC5pbmRleCArIG5leHRbMV0ubGVuZ3RoICsgbmV4dFsyXS5sZW5ndGg7XG4gICAgfVxuICAgIC8vIGxlYXZlIGl0IGluIGEgY2xlYW4gc3RhdGVcbiAgICByZSQyW3QkMi5DT0VSQ0VSVExdLmxhc3RJbmRleCA9IC0xO1xuICB9XG5cbiAgaWYgKG1hdGNoID09PSBudWxsKVxuICAgIHJldHVybiBudWxsXG5cbiAgcmV0dXJuIHBhcnNlKGAke21hdGNoWzJdfS4ke21hdGNoWzNdIHx8ICcwJ30uJHttYXRjaFs0XSB8fCAnMCd9YCwgb3B0aW9ucylcbn07XG52YXIgY29lcmNlXzEgPSBjb2VyY2U7XG5cbnZhciB5YWxsaXN0ID0gWWFsbGlzdCQxO1xuXG5ZYWxsaXN0JDEuTm9kZSA9IE5vZGU7XG5ZYWxsaXN0JDEuY3JlYXRlID0gWWFsbGlzdCQxO1xuXG5mdW5jdGlvbiBZYWxsaXN0JDEgKGxpc3QpIHtcbiAgdmFyIHNlbGYgPSB0aGlzO1xuICBpZiAoIShzZWxmIGluc3RhbmNlb2YgWWFsbGlzdCQxKSkge1xuICAgIHNlbGYgPSBuZXcgWWFsbGlzdCQxKCk7XG4gIH1cblxuICBzZWxmLnRhaWwgPSBudWxsO1xuICBzZWxmLmhlYWQgPSBudWxsO1xuICBzZWxmLmxlbmd0aCA9IDA7XG5cbiAgaWYgKGxpc3QgJiYgdHlwZW9mIGxpc3QuZm9yRWFjaCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgIGxpc3QuZm9yRWFjaChmdW5jdGlvbiAoaXRlbSkge1xuICAgICAgc2VsZi5wdXNoKGl0ZW0pO1xuICAgIH0pO1xuICB9IGVsc2UgaWYgKGFyZ3VtZW50cy5sZW5ndGggPiAwKSB7XG4gICAgZm9yICh2YXIgaSA9IDAsIGwgPSBhcmd1bWVudHMubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgICBzZWxmLnB1c2goYXJndW1lbnRzW2ldKTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gc2VsZlxufVxuXG5ZYWxsaXN0JDEucHJvdG90eXBlLnJlbW92ZU5vZGUgPSBmdW5jdGlvbiAobm9kZSkge1xuICBpZiAobm9kZS5saXN0ICE9PSB0aGlzKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdyZW1vdmluZyBub2RlIHdoaWNoIGRvZXMgbm90IGJlbG9uZyB0byB0aGlzIGxpc3QnKVxuICB9XG5cbiAgdmFyIG5leHQgPSBub2RlLm5leHQ7XG4gIHZhciBwcmV2ID0gbm9kZS5wcmV2O1xuXG4gIGlmIChuZXh0KSB7XG4gICAgbmV4dC5wcmV2ID0gcHJldjtcbiAgfVxuXG4gIGlmIChwcmV2KSB7XG4gICAgcHJldi5uZXh0ID0gbmV4dDtcbiAgfVxuXG4gIGlmIChub2RlID09PSB0aGlzLmhlYWQpIHtcbiAgICB0aGlzLmhlYWQgPSBuZXh0O1xuICB9XG4gIGlmIChub2RlID09PSB0aGlzLnRhaWwpIHtcbiAgICB0aGlzLnRhaWwgPSBwcmV2O1xuICB9XG5cbiAgbm9kZS5saXN0Lmxlbmd0aC0tO1xuICBub2RlLm5leHQgPSBudWxsO1xuICBub2RlLnByZXYgPSBudWxsO1xuICBub2RlLmxpc3QgPSBudWxsO1xuXG4gIHJldHVybiBuZXh0XG59O1xuXG5ZYWxsaXN0JDEucHJvdG90eXBlLnVuc2hpZnROb2RlID0gZnVuY3Rpb24gKG5vZGUpIHtcbiAgaWYgKG5vZGUgPT09IHRoaXMuaGVhZCkge1xuICAgIHJldHVyblxuICB9XG5cbiAgaWYgKG5vZGUubGlzdCkge1xuICAgIG5vZGUubGlzdC5yZW1vdmVOb2RlKG5vZGUpO1xuICB9XG5cbiAgdmFyIGhlYWQgPSB0aGlzLmhlYWQ7XG4gIG5vZGUubGlzdCA9IHRoaXM7XG4gIG5vZGUubmV4dCA9IGhlYWQ7XG4gIGlmIChoZWFkKSB7XG4gICAgaGVhZC5wcmV2ID0gbm9kZTtcbiAgfVxuXG4gIHRoaXMuaGVhZCA9IG5vZGU7XG4gIGlmICghdGhpcy50YWlsKSB7XG4gICAgdGhpcy50YWlsID0gbm9kZTtcbiAgfVxuICB0aGlzLmxlbmd0aCsrO1xufTtcblxuWWFsbGlzdCQxLnByb3RvdHlwZS5wdXNoTm9kZSA9IGZ1bmN0aW9uIChub2RlKSB7XG4gIGlmIChub2RlID09PSB0aGlzLnRhaWwpIHtcbiAgICByZXR1cm5cbiAgfVxuXG4gIGlmIChub2RlLmxpc3QpIHtcbiAgICBub2RlLmxpc3QucmVtb3ZlTm9kZShub2RlKTtcbiAgfVxuXG4gIHZhciB0YWlsID0gdGhpcy50YWlsO1xuICBub2RlLmxpc3QgPSB0aGlzO1xuICBub2RlLnByZXYgPSB0YWlsO1xuICBpZiAodGFpbCkge1xuICAgIHRhaWwubmV4dCA9IG5vZGU7XG4gIH1cblxuICB0aGlzLnRhaWwgPSBub2RlO1xuICBpZiAoIXRoaXMuaGVhZCkge1xuICAgIHRoaXMuaGVhZCA9IG5vZGU7XG4gIH1cbiAgdGhpcy5sZW5ndGgrKztcbn07XG5cbllhbGxpc3QkMS5wcm90b3R5cGUucHVzaCA9IGZ1bmN0aW9uICgpIHtcbiAgZm9yICh2YXIgaSA9IDAsIGwgPSBhcmd1bWVudHMubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgcHVzaCh0aGlzLCBhcmd1bWVudHNbaV0pO1xuICB9XG4gIHJldHVybiB0aGlzLmxlbmd0aFxufTtcblxuWWFsbGlzdCQxLnByb3RvdHlwZS51bnNoaWZ0ID0gZnVuY3Rpb24gKCkge1xuICBmb3IgKHZhciBpID0gMCwgbCA9IGFyZ3VtZW50cy5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICB1bnNoaWZ0KHRoaXMsIGFyZ3VtZW50c1tpXSk7XG4gIH1cbiAgcmV0dXJuIHRoaXMubGVuZ3RoXG59O1xuXG5ZYWxsaXN0JDEucHJvdG90eXBlLnBvcCA9IGZ1bmN0aW9uICgpIHtcbiAgaWYgKCF0aGlzLnRhaWwpIHtcbiAgICByZXR1cm4gdW5kZWZpbmVkXG4gIH1cblxuICB2YXIgcmVzID0gdGhpcy50YWlsLnZhbHVlO1xuICB0aGlzLnRhaWwgPSB0aGlzLnRhaWwucHJldjtcbiAgaWYgKHRoaXMudGFpbCkge1xuICAgIHRoaXMudGFpbC5uZXh0ID0gbnVsbDtcbiAgfSBlbHNlIHtcbiAgICB0aGlzLmhlYWQgPSBudWxsO1xuICB9XG4gIHRoaXMubGVuZ3RoLS07XG4gIHJldHVybiByZXNcbn07XG5cbllhbGxpc3QkMS5wcm90b3R5cGUuc2hpZnQgPSBmdW5jdGlvbiAoKSB7XG4gIGlmICghdGhpcy5oZWFkKSB7XG4gICAgcmV0dXJuIHVuZGVmaW5lZFxuICB9XG5cbiAgdmFyIHJlcyA9IHRoaXMuaGVhZC52YWx1ZTtcbiAgdGhpcy5oZWFkID0gdGhpcy5oZWFkLm5leHQ7XG4gIGlmICh0aGlzLmhlYWQpIHtcbiAgICB0aGlzLmhlYWQucHJldiA9IG51bGw7XG4gIH0gZWxzZSB7XG4gICAgdGhpcy50YWlsID0gbnVsbDtcbiAgfVxuICB0aGlzLmxlbmd0aC0tO1xuICByZXR1cm4gcmVzXG59O1xuXG5ZYWxsaXN0JDEucHJvdG90eXBlLmZvckVhY2ggPSBmdW5jdGlvbiAoZm4sIHRoaXNwKSB7XG4gIHRoaXNwID0gdGhpc3AgfHwgdGhpcztcbiAgZm9yICh2YXIgd2Fsa2VyID0gdGhpcy5oZWFkLCBpID0gMDsgd2Fsa2VyICE9PSBudWxsOyBpKyspIHtcbiAgICBmbi5jYWxsKHRoaXNwLCB3YWxrZXIudmFsdWUsIGksIHRoaXMpO1xuICAgIHdhbGtlciA9IHdhbGtlci5uZXh0O1xuICB9XG59O1xuXG5ZYWxsaXN0JDEucHJvdG90eXBlLmZvckVhY2hSZXZlcnNlID0gZnVuY3Rpb24gKGZuLCB0aGlzcCkge1xuICB0aGlzcCA9IHRoaXNwIHx8IHRoaXM7XG4gIGZvciAodmFyIHdhbGtlciA9IHRoaXMudGFpbCwgaSA9IHRoaXMubGVuZ3RoIC0gMTsgd2Fsa2VyICE9PSBudWxsOyBpLS0pIHtcbiAgICBmbi5jYWxsKHRoaXNwLCB3YWxrZXIudmFsdWUsIGksIHRoaXMpO1xuICAgIHdhbGtlciA9IHdhbGtlci5wcmV2O1xuICB9XG59O1xuXG5ZYWxsaXN0JDEucHJvdG90eXBlLmdldCA9IGZ1bmN0aW9uIChuKSB7XG4gIGZvciAodmFyIGkgPSAwLCB3YWxrZXIgPSB0aGlzLmhlYWQ7IHdhbGtlciAhPT0gbnVsbCAmJiBpIDwgbjsgaSsrKSB7XG4gICAgLy8gYWJvcnQgb3V0IG9mIHRoZSBsaXN0IGVhcmx5IGlmIHdlIGhpdCBhIGN5Y2xlXG4gICAgd2Fsa2VyID0gd2Fsa2VyLm5leHQ7XG4gIH1cbiAgaWYgKGkgPT09IG4gJiYgd2Fsa2VyICE9PSBudWxsKSB7XG4gICAgcmV0dXJuIHdhbGtlci52YWx1ZVxuICB9XG59O1xuXG5ZYWxsaXN0JDEucHJvdG90eXBlLmdldFJldmVyc2UgPSBmdW5jdGlvbiAobikge1xuICBmb3IgKHZhciBpID0gMCwgd2Fsa2VyID0gdGhpcy50YWlsOyB3YWxrZXIgIT09IG51bGwgJiYgaSA8IG47IGkrKykge1xuICAgIC8vIGFib3J0IG91dCBvZiB0aGUgbGlzdCBlYXJseSBpZiB3ZSBoaXQgYSBjeWNsZVxuICAgIHdhbGtlciA9IHdhbGtlci5wcmV2O1xuICB9XG4gIGlmIChpID09PSBuICYmIHdhbGtlciAhPT0gbnVsbCkge1xuICAgIHJldHVybiB3YWxrZXIudmFsdWVcbiAgfVxufTtcblxuWWFsbGlzdCQxLnByb3RvdHlwZS5tYXAgPSBmdW5jdGlvbiAoZm4sIHRoaXNwKSB7XG4gIHRoaXNwID0gdGhpc3AgfHwgdGhpcztcbiAgdmFyIHJlcyA9IG5ldyBZYWxsaXN0JDEoKTtcbiAgZm9yICh2YXIgd2Fsa2VyID0gdGhpcy5oZWFkOyB3YWxrZXIgIT09IG51bGw7KSB7XG4gICAgcmVzLnB1c2goZm4uY2FsbCh0aGlzcCwgd2Fsa2VyLnZhbHVlLCB0aGlzKSk7XG4gICAgd2Fsa2VyID0gd2Fsa2VyLm5leHQ7XG4gIH1cbiAgcmV0dXJuIHJlc1xufTtcblxuWWFsbGlzdCQxLnByb3RvdHlwZS5tYXBSZXZlcnNlID0gZnVuY3Rpb24gKGZuLCB0aGlzcCkge1xuICB0aGlzcCA9IHRoaXNwIHx8IHRoaXM7XG4gIHZhciByZXMgPSBuZXcgWWFsbGlzdCQxKCk7XG4gIGZvciAodmFyIHdhbGtlciA9IHRoaXMudGFpbDsgd2Fsa2VyICE9PSBudWxsOykge1xuICAgIHJlcy5wdXNoKGZuLmNhbGwodGhpc3AsIHdhbGtlci52YWx1ZSwgdGhpcykpO1xuICAgIHdhbGtlciA9IHdhbGtlci5wcmV2O1xuICB9XG4gIHJldHVybiByZXNcbn07XG5cbllhbGxpc3QkMS5wcm90b3R5cGUucmVkdWNlID0gZnVuY3Rpb24gKGZuLCBpbml0aWFsKSB7XG4gIHZhciBhY2M7XG4gIHZhciB3YWxrZXIgPSB0aGlzLmhlYWQ7XG4gIGlmIChhcmd1bWVudHMubGVuZ3RoID4gMSkge1xuICAgIGFjYyA9IGluaXRpYWw7XG4gIH0gZWxzZSBpZiAodGhpcy5oZWFkKSB7XG4gICAgd2Fsa2VyID0gdGhpcy5oZWFkLm5leHQ7XG4gICAgYWNjID0gdGhpcy5oZWFkLnZhbHVlO1xuICB9IGVsc2Uge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ1JlZHVjZSBvZiBlbXB0eSBsaXN0IHdpdGggbm8gaW5pdGlhbCB2YWx1ZScpXG4gIH1cblxuICBmb3IgKHZhciBpID0gMDsgd2Fsa2VyICE9PSBudWxsOyBpKyspIHtcbiAgICBhY2MgPSBmbihhY2MsIHdhbGtlci52YWx1ZSwgaSk7XG4gICAgd2Fsa2VyID0gd2Fsa2VyLm5leHQ7XG4gIH1cblxuICByZXR1cm4gYWNjXG59O1xuXG5ZYWxsaXN0JDEucHJvdG90eXBlLnJlZHVjZVJldmVyc2UgPSBmdW5jdGlvbiAoZm4sIGluaXRpYWwpIHtcbiAgdmFyIGFjYztcbiAgdmFyIHdhbGtlciA9IHRoaXMudGFpbDtcbiAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPiAxKSB7XG4gICAgYWNjID0gaW5pdGlhbDtcbiAgfSBlbHNlIGlmICh0aGlzLnRhaWwpIHtcbiAgICB3YWxrZXIgPSB0aGlzLnRhaWwucHJldjtcbiAgICBhY2MgPSB0aGlzLnRhaWwudmFsdWU7XG4gIH0gZWxzZSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcignUmVkdWNlIG9mIGVtcHR5IGxpc3Qgd2l0aCBubyBpbml0aWFsIHZhbHVlJylcbiAgfVxuXG4gIGZvciAodmFyIGkgPSB0aGlzLmxlbmd0aCAtIDE7IHdhbGtlciAhPT0gbnVsbDsgaS0tKSB7XG4gICAgYWNjID0gZm4oYWNjLCB3YWxrZXIudmFsdWUsIGkpO1xuICAgIHdhbGtlciA9IHdhbGtlci5wcmV2O1xuICB9XG5cbiAgcmV0dXJuIGFjY1xufTtcblxuWWFsbGlzdCQxLnByb3RvdHlwZS50b0FycmF5ID0gZnVuY3Rpb24gKCkge1xuICB2YXIgYXJyID0gbmV3IEFycmF5KHRoaXMubGVuZ3RoKTtcbiAgZm9yICh2YXIgaSA9IDAsIHdhbGtlciA9IHRoaXMuaGVhZDsgd2Fsa2VyICE9PSBudWxsOyBpKyspIHtcbiAgICBhcnJbaV0gPSB3YWxrZXIudmFsdWU7XG4gICAgd2Fsa2VyID0gd2Fsa2VyLm5leHQ7XG4gIH1cbiAgcmV0dXJuIGFyclxufTtcblxuWWFsbGlzdCQxLnByb3RvdHlwZS50b0FycmF5UmV2ZXJzZSA9IGZ1bmN0aW9uICgpIHtcbiAgdmFyIGFyciA9IG5ldyBBcnJheSh0aGlzLmxlbmd0aCk7XG4gIGZvciAodmFyIGkgPSAwLCB3YWxrZXIgPSB0aGlzLnRhaWw7IHdhbGtlciAhPT0gbnVsbDsgaSsrKSB7XG4gICAgYXJyW2ldID0gd2Fsa2VyLnZhbHVlO1xuICAgIHdhbGtlciA9IHdhbGtlci5wcmV2O1xuICB9XG4gIHJldHVybiBhcnJcbn07XG5cbllhbGxpc3QkMS5wcm90b3R5cGUuc2xpY2UgPSBmdW5jdGlvbiAoZnJvbSwgdG8pIHtcbiAgdG8gPSB0byB8fCB0aGlzLmxlbmd0aDtcbiAgaWYgKHRvIDwgMCkge1xuICAgIHRvICs9IHRoaXMubGVuZ3RoO1xuICB9XG4gIGZyb20gPSBmcm9tIHx8IDA7XG4gIGlmIChmcm9tIDwgMCkge1xuICAgIGZyb20gKz0gdGhpcy5sZW5ndGg7XG4gIH1cbiAgdmFyIHJldCA9IG5ldyBZYWxsaXN0JDEoKTtcbiAgaWYgKHRvIDwgZnJvbSB8fCB0byA8IDApIHtcbiAgICByZXR1cm4gcmV0XG4gIH1cbiAgaWYgKGZyb20gPCAwKSB7XG4gICAgZnJvbSA9IDA7XG4gIH1cbiAgaWYgKHRvID4gdGhpcy5sZW5ndGgpIHtcbiAgICB0byA9IHRoaXMubGVuZ3RoO1xuICB9XG4gIGZvciAodmFyIGkgPSAwLCB3YWxrZXIgPSB0aGlzLmhlYWQ7IHdhbGtlciAhPT0gbnVsbCAmJiBpIDwgZnJvbTsgaSsrKSB7XG4gICAgd2Fsa2VyID0gd2Fsa2VyLm5leHQ7XG4gIH1cbiAgZm9yICg7IHdhbGtlciAhPT0gbnVsbCAmJiBpIDwgdG87IGkrKywgd2Fsa2VyID0gd2Fsa2VyLm5leHQpIHtcbiAgICByZXQucHVzaCh3YWxrZXIudmFsdWUpO1xuICB9XG4gIHJldHVybiByZXRcbn07XG5cbllhbGxpc3QkMS5wcm90b3R5cGUuc2xpY2VSZXZlcnNlID0gZnVuY3Rpb24gKGZyb20sIHRvKSB7XG4gIHRvID0gdG8gfHwgdGhpcy5sZW5ndGg7XG4gIGlmICh0byA8IDApIHtcbiAgICB0byArPSB0aGlzLmxlbmd0aDtcbiAgfVxuICBmcm9tID0gZnJvbSB8fCAwO1xuICBpZiAoZnJvbSA8IDApIHtcbiAgICBmcm9tICs9IHRoaXMubGVuZ3RoO1xuICB9XG4gIHZhciByZXQgPSBuZXcgWWFsbGlzdCQxKCk7XG4gIGlmICh0byA8IGZyb20gfHwgdG8gPCAwKSB7XG4gICAgcmV0dXJuIHJldFxuICB9XG4gIGlmIChmcm9tIDwgMCkge1xuICAgIGZyb20gPSAwO1xuICB9XG4gIGlmICh0byA+IHRoaXMubGVuZ3RoKSB7XG4gICAgdG8gPSB0aGlzLmxlbmd0aDtcbiAgfVxuICBmb3IgKHZhciBpID0gdGhpcy5sZW5ndGgsIHdhbGtlciA9IHRoaXMudGFpbDsgd2Fsa2VyICE9PSBudWxsICYmIGkgPiB0bzsgaS0tKSB7XG4gICAgd2Fsa2VyID0gd2Fsa2VyLnByZXY7XG4gIH1cbiAgZm9yICg7IHdhbGtlciAhPT0gbnVsbCAmJiBpID4gZnJvbTsgaS0tLCB3YWxrZXIgPSB3YWxrZXIucHJldikge1xuICAgIHJldC5wdXNoKHdhbGtlci52YWx1ZSk7XG4gIH1cbiAgcmV0dXJuIHJldFxufTtcblxuWWFsbGlzdCQxLnByb3RvdHlwZS5zcGxpY2UgPSBmdW5jdGlvbiAoc3RhcnQsIGRlbGV0ZUNvdW50LCAuLi5ub2Rlcykge1xuICBpZiAoc3RhcnQgPiB0aGlzLmxlbmd0aCkge1xuICAgIHN0YXJ0ID0gdGhpcy5sZW5ndGggLSAxO1xuICB9XG4gIGlmIChzdGFydCA8IDApIHtcbiAgICBzdGFydCA9IHRoaXMubGVuZ3RoICsgc3RhcnQ7XG4gIH1cblxuICBmb3IgKHZhciBpID0gMCwgd2Fsa2VyID0gdGhpcy5oZWFkOyB3YWxrZXIgIT09IG51bGwgJiYgaSA8IHN0YXJ0OyBpKyspIHtcbiAgICB3YWxrZXIgPSB3YWxrZXIubmV4dDtcbiAgfVxuXG4gIHZhciByZXQgPSBbXTtcbiAgZm9yICh2YXIgaSA9IDA7IHdhbGtlciAmJiBpIDwgZGVsZXRlQ291bnQ7IGkrKykge1xuICAgIHJldC5wdXNoKHdhbGtlci52YWx1ZSk7XG4gICAgd2Fsa2VyID0gdGhpcy5yZW1vdmVOb2RlKHdhbGtlcik7XG4gIH1cbiAgaWYgKHdhbGtlciA9PT0gbnVsbCkge1xuICAgIHdhbGtlciA9IHRoaXMudGFpbDtcbiAgfVxuXG4gIGlmICh3YWxrZXIgIT09IHRoaXMuaGVhZCAmJiB3YWxrZXIgIT09IHRoaXMudGFpbCkge1xuICAgIHdhbGtlciA9IHdhbGtlci5wcmV2O1xuICB9XG5cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBub2Rlcy5sZW5ndGg7IGkrKykge1xuICAgIHdhbGtlciA9IGluc2VydCh0aGlzLCB3YWxrZXIsIG5vZGVzW2ldKTtcbiAgfVxuICByZXR1cm4gcmV0O1xufTtcblxuWWFsbGlzdCQxLnByb3RvdHlwZS5yZXZlcnNlID0gZnVuY3Rpb24gKCkge1xuICB2YXIgaGVhZCA9IHRoaXMuaGVhZDtcbiAgdmFyIHRhaWwgPSB0aGlzLnRhaWw7XG4gIGZvciAodmFyIHdhbGtlciA9IGhlYWQ7IHdhbGtlciAhPT0gbnVsbDsgd2Fsa2VyID0gd2Fsa2VyLnByZXYpIHtcbiAgICB2YXIgcCA9IHdhbGtlci5wcmV2O1xuICAgIHdhbGtlci5wcmV2ID0gd2Fsa2VyLm5leHQ7XG4gICAgd2Fsa2VyLm5leHQgPSBwO1xuICB9XG4gIHRoaXMuaGVhZCA9IHRhaWw7XG4gIHRoaXMudGFpbCA9IGhlYWQ7XG4gIHJldHVybiB0aGlzXG59O1xuXG5mdW5jdGlvbiBpbnNlcnQgKHNlbGYsIG5vZGUsIHZhbHVlKSB7XG4gIHZhciBpbnNlcnRlZCA9IG5vZGUgPT09IHNlbGYuaGVhZCA/XG4gICAgbmV3IE5vZGUodmFsdWUsIG51bGwsIG5vZGUsIHNlbGYpIDpcbiAgICBuZXcgTm9kZSh2YWx1ZSwgbm9kZSwgbm9kZS5uZXh0LCBzZWxmKTtcblxuICBpZiAoaW5zZXJ0ZWQubmV4dCA9PT0gbnVsbCkge1xuICAgIHNlbGYudGFpbCA9IGluc2VydGVkO1xuICB9XG4gIGlmIChpbnNlcnRlZC5wcmV2ID09PSBudWxsKSB7XG4gICAgc2VsZi5oZWFkID0gaW5zZXJ0ZWQ7XG4gIH1cblxuICBzZWxmLmxlbmd0aCsrO1xuXG4gIHJldHVybiBpbnNlcnRlZFxufVxuXG5mdW5jdGlvbiBwdXNoIChzZWxmLCBpdGVtKSB7XG4gIHNlbGYudGFpbCA9IG5ldyBOb2RlKGl0ZW0sIHNlbGYudGFpbCwgbnVsbCwgc2VsZik7XG4gIGlmICghc2VsZi5oZWFkKSB7XG4gICAgc2VsZi5oZWFkID0gc2VsZi50YWlsO1xuICB9XG4gIHNlbGYubGVuZ3RoKys7XG59XG5cbmZ1bmN0aW9uIHVuc2hpZnQgKHNlbGYsIGl0ZW0pIHtcbiAgc2VsZi5oZWFkID0gbmV3IE5vZGUoaXRlbSwgbnVsbCwgc2VsZi5oZWFkLCBzZWxmKTtcbiAgaWYgKCFzZWxmLnRhaWwpIHtcbiAgICBzZWxmLnRhaWwgPSBzZWxmLmhlYWQ7XG4gIH1cbiAgc2VsZi5sZW5ndGgrKztcbn1cblxuZnVuY3Rpb24gTm9kZSAodmFsdWUsIHByZXYsIG5leHQsIGxpc3QpIHtcbiAgaWYgKCEodGhpcyBpbnN0YW5jZW9mIE5vZGUpKSB7XG4gICAgcmV0dXJuIG5ldyBOb2RlKHZhbHVlLCBwcmV2LCBuZXh0LCBsaXN0KVxuICB9XG5cbiAgdGhpcy5saXN0ID0gbGlzdDtcbiAgdGhpcy52YWx1ZSA9IHZhbHVlO1xuXG4gIGlmIChwcmV2KSB7XG4gICAgcHJldi5uZXh0ID0gdGhpcztcbiAgICB0aGlzLnByZXYgPSBwcmV2O1xuICB9IGVsc2Uge1xuICAgIHRoaXMucHJldiA9IG51bGw7XG4gIH1cblxuICBpZiAobmV4dCkge1xuICAgIG5leHQucHJldiA9IHRoaXM7XG4gICAgdGhpcy5uZXh0ID0gbmV4dDtcbiAgfSBlbHNlIHtcbiAgICB0aGlzLm5leHQgPSBudWxsO1xuICB9XG59XG5cbnRyeSB7XG4gIC8vIGFkZCBpZiBzdXBwb3J0IGZvciBTeW1ib2wuaXRlcmF0b3IgaXMgcHJlc2VudFxuICByZXF1aXJlKCcuL2l0ZXJhdG9yLmpzJykoWWFsbGlzdCQxKTtcbn0gY2F0Y2ggKGVyKSB7fVxuXG4vLyBBIGxpbmtlZCBsaXN0IHRvIGtlZXAgdHJhY2sgb2YgcmVjZW50bHktdXNlZC1uZXNzXG5jb25zdCBZYWxsaXN0ID0geWFsbGlzdDtcblxuY29uc3QgTUFYID0gU3ltYm9sKCdtYXgnKTtcbmNvbnN0IExFTkdUSCA9IFN5bWJvbCgnbGVuZ3RoJyk7XG5jb25zdCBMRU5HVEhfQ0FMQ1VMQVRPUiA9IFN5bWJvbCgnbGVuZ3RoQ2FsY3VsYXRvcicpO1xuY29uc3QgQUxMT1dfU1RBTEUgPSBTeW1ib2woJ2FsbG93U3RhbGUnKTtcbmNvbnN0IE1BWF9BR0UgPSBTeW1ib2woJ21heEFnZScpO1xuY29uc3QgRElTUE9TRSA9IFN5bWJvbCgnZGlzcG9zZScpO1xuY29uc3QgTk9fRElTUE9TRV9PTl9TRVQgPSBTeW1ib2woJ25vRGlzcG9zZU9uU2V0Jyk7XG5jb25zdCBMUlVfTElTVCA9IFN5bWJvbCgnbHJ1TGlzdCcpO1xuY29uc3QgQ0FDSEUgPSBTeW1ib2woJ2NhY2hlJyk7XG5jb25zdCBVUERBVEVfQUdFX09OX0dFVCA9IFN5bWJvbCgndXBkYXRlQWdlT25HZXQnKTtcblxuY29uc3QgbmFpdmVMZW5ndGggPSAoKSA9PiAxO1xuXG4vLyBscnVMaXN0IGlzIGEgeWFsbGlzdCB3aGVyZSB0aGUgaGVhZCBpcyB0aGUgeW91bmdlc3Rcbi8vIGl0ZW0sIGFuZCB0aGUgdGFpbCBpcyB0aGUgb2xkZXN0LiAgdGhlIGxpc3QgY29udGFpbnMgdGhlIEhpdFxuLy8gb2JqZWN0cyBhcyB0aGUgZW50cmllcy5cbi8vIEVhY2ggSGl0IG9iamVjdCBoYXMgYSByZWZlcmVuY2UgdG8gaXRzIFlhbGxpc3QuTm9kZS4gIFRoaXNcbi8vIG5ldmVyIGNoYW5nZXMuXG4vL1xuLy8gY2FjaGUgaXMgYSBNYXAgKG9yIFBzZXVkb01hcCkgdGhhdCBtYXRjaGVzIHRoZSBrZXlzIHRvXG4vLyB0aGUgWWFsbGlzdC5Ob2RlIG9iamVjdC5cbmNsYXNzIExSVUNhY2hlIHtcbiAgY29uc3RydWN0b3IgKG9wdGlvbnMpIHtcbiAgICBpZiAodHlwZW9mIG9wdGlvbnMgPT09ICdudW1iZXInKVxuICAgICAgb3B0aW9ucyA9IHsgbWF4OiBvcHRpb25zIH07XG5cbiAgICBpZiAoIW9wdGlvbnMpXG4gICAgICBvcHRpb25zID0ge307XG5cbiAgICBpZiAob3B0aW9ucy5tYXggJiYgKHR5cGVvZiBvcHRpb25zLm1heCAhPT0gJ251bWJlcicgfHwgb3B0aW9ucy5tYXggPCAwKSlcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ21heCBtdXN0IGJlIGEgbm9uLW5lZ2F0aXZlIG51bWJlcicpXG4gICAgLy8gS2luZCBvZiB3ZWlyZCB0byBoYXZlIGEgZGVmYXVsdCBtYXggb2YgSW5maW5pdHksIGJ1dCBvaCB3ZWxsLlxuICAgIHRoaXNbTUFYXSA9IG9wdGlvbnMubWF4IHx8IEluZmluaXR5O1xuXG4gICAgY29uc3QgbGMgPSBvcHRpb25zLmxlbmd0aCB8fCBuYWl2ZUxlbmd0aDtcbiAgICB0aGlzW0xFTkdUSF9DQUxDVUxBVE9SXSA9ICh0eXBlb2YgbGMgIT09ICdmdW5jdGlvbicpID8gbmFpdmVMZW5ndGggOiBsYztcbiAgICB0aGlzW0FMTE9XX1NUQUxFXSA9IG9wdGlvbnMuc3RhbGUgfHwgZmFsc2U7XG4gICAgaWYgKG9wdGlvbnMubWF4QWdlICYmIHR5cGVvZiBvcHRpb25zLm1heEFnZSAhPT0gJ251bWJlcicpXG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdtYXhBZ2UgbXVzdCBiZSBhIG51bWJlcicpXG4gICAgdGhpc1tNQVhfQUdFXSA9IG9wdGlvbnMubWF4QWdlIHx8IDA7XG4gICAgdGhpc1tESVNQT1NFXSA9IG9wdGlvbnMuZGlzcG9zZTtcbiAgICB0aGlzW05PX0RJU1BPU0VfT05fU0VUXSA9IG9wdGlvbnMubm9EaXNwb3NlT25TZXQgfHwgZmFsc2U7XG4gICAgdGhpc1tVUERBVEVfQUdFX09OX0dFVF0gPSBvcHRpb25zLnVwZGF0ZUFnZU9uR2V0IHx8IGZhbHNlO1xuICAgIHRoaXMucmVzZXQoKTtcbiAgfVxuXG4gIC8vIHJlc2l6ZSB0aGUgY2FjaGUgd2hlbiB0aGUgbWF4IGNoYW5nZXMuXG4gIHNldCBtYXggKG1MKSB7XG4gICAgaWYgKHR5cGVvZiBtTCAhPT0gJ251bWJlcicgfHwgbUwgPCAwKVxuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignbWF4IG11c3QgYmUgYSBub24tbmVnYXRpdmUgbnVtYmVyJylcblxuICAgIHRoaXNbTUFYXSA9IG1MIHx8IEluZmluaXR5O1xuICAgIHRyaW0odGhpcyk7XG4gIH1cbiAgZ2V0IG1heCAoKSB7XG4gICAgcmV0dXJuIHRoaXNbTUFYXVxuICB9XG5cbiAgc2V0IGFsbG93U3RhbGUgKGFsbG93U3RhbGUpIHtcbiAgICB0aGlzW0FMTE9XX1NUQUxFXSA9ICEhYWxsb3dTdGFsZTtcbiAgfVxuICBnZXQgYWxsb3dTdGFsZSAoKSB7XG4gICAgcmV0dXJuIHRoaXNbQUxMT1dfU1RBTEVdXG4gIH1cblxuICBzZXQgbWF4QWdlIChtQSkge1xuICAgIGlmICh0eXBlb2YgbUEgIT09ICdudW1iZXInKVxuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignbWF4QWdlIG11c3QgYmUgYSBub24tbmVnYXRpdmUgbnVtYmVyJylcblxuICAgIHRoaXNbTUFYX0FHRV0gPSBtQTtcbiAgICB0cmltKHRoaXMpO1xuICB9XG4gIGdldCBtYXhBZ2UgKCkge1xuICAgIHJldHVybiB0aGlzW01BWF9BR0VdXG4gIH1cblxuICAvLyByZXNpemUgdGhlIGNhY2hlIHdoZW4gdGhlIGxlbmd0aENhbGN1bGF0b3IgY2hhbmdlcy5cbiAgc2V0IGxlbmd0aENhbGN1bGF0b3IgKGxDKSB7XG4gICAgaWYgKHR5cGVvZiBsQyAhPT0gJ2Z1bmN0aW9uJylcbiAgICAgIGxDID0gbmFpdmVMZW5ndGg7XG5cbiAgICBpZiAobEMgIT09IHRoaXNbTEVOR1RIX0NBTENVTEFUT1JdKSB7XG4gICAgICB0aGlzW0xFTkdUSF9DQUxDVUxBVE9SXSA9IGxDO1xuICAgICAgdGhpc1tMRU5HVEhdID0gMDtcbiAgICAgIHRoaXNbTFJVX0xJU1RdLmZvckVhY2goaGl0ID0+IHtcbiAgICAgICAgaGl0Lmxlbmd0aCA9IHRoaXNbTEVOR1RIX0NBTENVTEFUT1JdKGhpdC52YWx1ZSwgaGl0LmtleSk7XG4gICAgICAgIHRoaXNbTEVOR1RIXSArPSBoaXQubGVuZ3RoO1xuICAgICAgfSk7XG4gICAgfVxuICAgIHRyaW0odGhpcyk7XG4gIH1cbiAgZ2V0IGxlbmd0aENhbGN1bGF0b3IgKCkgeyByZXR1cm4gdGhpc1tMRU5HVEhfQ0FMQ1VMQVRPUl0gfVxuXG4gIGdldCBsZW5ndGggKCkgeyByZXR1cm4gdGhpc1tMRU5HVEhdIH1cbiAgZ2V0IGl0ZW1Db3VudCAoKSB7IHJldHVybiB0aGlzW0xSVV9MSVNUXS5sZW5ndGggfVxuXG4gIHJmb3JFYWNoIChmbiwgdGhpc3ApIHtcbiAgICB0aGlzcCA9IHRoaXNwIHx8IHRoaXM7XG4gICAgZm9yIChsZXQgd2Fsa2VyID0gdGhpc1tMUlVfTElTVF0udGFpbDsgd2Fsa2VyICE9PSBudWxsOykge1xuICAgICAgY29uc3QgcHJldiA9IHdhbGtlci5wcmV2O1xuICAgICAgZm9yRWFjaFN0ZXAodGhpcywgZm4sIHdhbGtlciwgdGhpc3ApO1xuICAgICAgd2Fsa2VyID0gcHJldjtcbiAgICB9XG4gIH1cblxuICBmb3JFYWNoIChmbiwgdGhpc3ApIHtcbiAgICB0aGlzcCA9IHRoaXNwIHx8IHRoaXM7XG4gICAgZm9yIChsZXQgd2Fsa2VyID0gdGhpc1tMUlVfTElTVF0uaGVhZDsgd2Fsa2VyICE9PSBudWxsOykge1xuICAgICAgY29uc3QgbmV4dCA9IHdhbGtlci5uZXh0O1xuICAgICAgZm9yRWFjaFN0ZXAodGhpcywgZm4sIHdhbGtlciwgdGhpc3ApO1xuICAgICAgd2Fsa2VyID0gbmV4dDtcbiAgICB9XG4gIH1cblxuICBrZXlzICgpIHtcbiAgICByZXR1cm4gdGhpc1tMUlVfTElTVF0udG9BcnJheSgpLm1hcChrID0+IGsua2V5KVxuICB9XG5cbiAgdmFsdWVzICgpIHtcbiAgICByZXR1cm4gdGhpc1tMUlVfTElTVF0udG9BcnJheSgpLm1hcChrID0+IGsudmFsdWUpXG4gIH1cblxuICByZXNldCAoKSB7XG4gICAgaWYgKHRoaXNbRElTUE9TRV0gJiZcbiAgICAgICAgdGhpc1tMUlVfTElTVF0gJiZcbiAgICAgICAgdGhpc1tMUlVfTElTVF0ubGVuZ3RoKSB7XG4gICAgICB0aGlzW0xSVV9MSVNUXS5mb3JFYWNoKGhpdCA9PiB0aGlzW0RJU1BPU0VdKGhpdC5rZXksIGhpdC52YWx1ZSkpO1xuICAgIH1cblxuICAgIHRoaXNbQ0FDSEVdID0gbmV3IE1hcCgpOyAvLyBoYXNoIG9mIGl0ZW1zIGJ5IGtleVxuICAgIHRoaXNbTFJVX0xJU1RdID0gbmV3IFlhbGxpc3QoKTsgLy8gbGlzdCBvZiBpdGVtcyBpbiBvcmRlciBvZiB1c2UgcmVjZW5jeVxuICAgIHRoaXNbTEVOR1RIXSA9IDA7IC8vIGxlbmd0aCBvZiBpdGVtcyBpbiB0aGUgbGlzdFxuICB9XG5cbiAgZHVtcCAoKSB7XG4gICAgcmV0dXJuIHRoaXNbTFJVX0xJU1RdLm1hcChoaXQgPT5cbiAgICAgIGlzU3RhbGUodGhpcywgaGl0KSA/IGZhbHNlIDoge1xuICAgICAgICBrOiBoaXQua2V5LFxuICAgICAgICB2OiBoaXQudmFsdWUsXG4gICAgICAgIGU6IGhpdC5ub3cgKyAoaGl0Lm1heEFnZSB8fCAwKVxuICAgICAgfSkudG9BcnJheSgpLmZpbHRlcihoID0+IGgpXG4gIH1cblxuICBkdW1wTHJ1ICgpIHtcbiAgICByZXR1cm4gdGhpc1tMUlVfTElTVF1cbiAgfVxuXG4gIHNldCAoa2V5LCB2YWx1ZSwgbWF4QWdlKSB7XG4gICAgbWF4QWdlID0gbWF4QWdlIHx8IHRoaXNbTUFYX0FHRV07XG5cbiAgICBpZiAobWF4QWdlICYmIHR5cGVvZiBtYXhBZ2UgIT09ICdudW1iZXInKVxuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignbWF4QWdlIG11c3QgYmUgYSBudW1iZXInKVxuXG4gICAgY29uc3Qgbm93ID0gbWF4QWdlID8gRGF0ZS5ub3coKSA6IDA7XG4gICAgY29uc3QgbGVuID0gdGhpc1tMRU5HVEhfQ0FMQ1VMQVRPUl0odmFsdWUsIGtleSk7XG5cbiAgICBpZiAodGhpc1tDQUNIRV0uaGFzKGtleSkpIHtcbiAgICAgIGlmIChsZW4gPiB0aGlzW01BWF0pIHtcbiAgICAgICAgZGVsKHRoaXMsIHRoaXNbQ0FDSEVdLmdldChrZXkpKTtcbiAgICAgICAgcmV0dXJuIGZhbHNlXG4gICAgICB9XG5cbiAgICAgIGNvbnN0IG5vZGUgPSB0aGlzW0NBQ0hFXS5nZXQoa2V5KTtcbiAgICAgIGNvbnN0IGl0ZW0gPSBub2RlLnZhbHVlO1xuXG4gICAgICAvLyBkaXNwb3NlIG9mIHRoZSBvbGQgb25lIGJlZm9yZSBvdmVyd3JpdGluZ1xuICAgICAgLy8gc3BsaXQgb3V0IGludG8gMiBpZnMgZm9yIGJldHRlciBjb3ZlcmFnZSB0cmFja2luZ1xuICAgICAgaWYgKHRoaXNbRElTUE9TRV0pIHtcbiAgICAgICAgaWYgKCF0aGlzW05PX0RJU1BPU0VfT05fU0VUXSlcbiAgICAgICAgICB0aGlzW0RJU1BPU0VdKGtleSwgaXRlbS52YWx1ZSk7XG4gICAgICB9XG5cbiAgICAgIGl0ZW0ubm93ID0gbm93O1xuICAgICAgaXRlbS5tYXhBZ2UgPSBtYXhBZ2U7XG4gICAgICBpdGVtLnZhbHVlID0gdmFsdWU7XG4gICAgICB0aGlzW0xFTkdUSF0gKz0gbGVuIC0gaXRlbS5sZW5ndGg7XG4gICAgICBpdGVtLmxlbmd0aCA9IGxlbjtcbiAgICAgIHRoaXMuZ2V0KGtleSk7XG4gICAgICB0cmltKHRoaXMpO1xuICAgICAgcmV0dXJuIHRydWVcbiAgICB9XG5cbiAgICBjb25zdCBoaXQgPSBuZXcgRW50cnkoa2V5LCB2YWx1ZSwgbGVuLCBub3csIG1heEFnZSk7XG5cbiAgICAvLyBvdmVyc2l6ZWQgb2JqZWN0cyBmYWxsIG91dCBvZiBjYWNoZSBhdXRvbWF0aWNhbGx5LlxuICAgIGlmIChoaXQubGVuZ3RoID4gdGhpc1tNQVhdKSB7XG4gICAgICBpZiAodGhpc1tESVNQT1NFXSlcbiAgICAgICAgdGhpc1tESVNQT1NFXShrZXksIHZhbHVlKTtcblxuICAgICAgcmV0dXJuIGZhbHNlXG4gICAgfVxuXG4gICAgdGhpc1tMRU5HVEhdICs9IGhpdC5sZW5ndGg7XG4gICAgdGhpc1tMUlVfTElTVF0udW5zaGlmdChoaXQpO1xuICAgIHRoaXNbQ0FDSEVdLnNldChrZXksIHRoaXNbTFJVX0xJU1RdLmhlYWQpO1xuICAgIHRyaW0odGhpcyk7XG4gICAgcmV0dXJuIHRydWVcbiAgfVxuXG4gIGhhcyAoa2V5KSB7XG4gICAgaWYgKCF0aGlzW0NBQ0hFXS5oYXMoa2V5KSkgcmV0dXJuIGZhbHNlXG4gICAgY29uc3QgaGl0ID0gdGhpc1tDQUNIRV0uZ2V0KGtleSkudmFsdWU7XG4gICAgcmV0dXJuICFpc1N0YWxlKHRoaXMsIGhpdClcbiAgfVxuXG4gIGdldCAoa2V5KSB7XG4gICAgcmV0dXJuIGdldCh0aGlzLCBrZXksIHRydWUpXG4gIH1cblxuICBwZWVrIChrZXkpIHtcbiAgICByZXR1cm4gZ2V0KHRoaXMsIGtleSwgZmFsc2UpXG4gIH1cblxuICBwb3AgKCkge1xuICAgIGNvbnN0IG5vZGUgPSB0aGlzW0xSVV9MSVNUXS50YWlsO1xuICAgIGlmICghbm9kZSlcbiAgICAgIHJldHVybiBudWxsXG5cbiAgICBkZWwodGhpcywgbm9kZSk7XG4gICAgcmV0dXJuIG5vZGUudmFsdWVcbiAgfVxuXG4gIGRlbCAoa2V5KSB7XG4gICAgZGVsKHRoaXMsIHRoaXNbQ0FDSEVdLmdldChrZXkpKTtcbiAgfVxuXG4gIGxvYWQgKGFycikge1xuICAgIC8vIHJlc2V0IHRoZSBjYWNoZVxuICAgIHRoaXMucmVzZXQoKTtcblxuICAgIGNvbnN0IG5vdyA9IERhdGUubm93KCk7XG4gICAgLy8gQSBwcmV2aW91cyBzZXJpYWxpemVkIGNhY2hlIGhhcyB0aGUgbW9zdCByZWNlbnQgaXRlbXMgZmlyc3RcbiAgICBmb3IgKGxldCBsID0gYXJyLmxlbmd0aCAtIDE7IGwgPj0gMDsgbC0tKSB7XG4gICAgICBjb25zdCBoaXQgPSBhcnJbbF07XG4gICAgICBjb25zdCBleHBpcmVzQXQgPSBoaXQuZSB8fCAwO1xuICAgICAgaWYgKGV4cGlyZXNBdCA9PT0gMClcbiAgICAgICAgLy8gdGhlIGl0ZW0gd2FzIGNyZWF0ZWQgd2l0aG91dCBleHBpcmF0aW9uIGluIGEgbm9uIGFnZWQgY2FjaGVcbiAgICAgICAgdGhpcy5zZXQoaGl0LmssIGhpdC52KTtcbiAgICAgIGVsc2Uge1xuICAgICAgICBjb25zdCBtYXhBZ2UgPSBleHBpcmVzQXQgLSBub3c7XG4gICAgICAgIC8vIGRvbnQgYWRkIGFscmVhZHkgZXhwaXJlZCBpdGVtc1xuICAgICAgICBpZiAobWF4QWdlID4gMCkge1xuICAgICAgICAgIHRoaXMuc2V0KGhpdC5rLCBoaXQudiwgbWF4QWdlKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHBydW5lICgpIHtcbiAgICB0aGlzW0NBQ0hFXS5mb3JFYWNoKCh2YWx1ZSwga2V5KSA9PiBnZXQodGhpcywga2V5LCBmYWxzZSkpO1xuICB9XG59XG5cbmNvbnN0IGdldCA9IChzZWxmLCBrZXksIGRvVXNlKSA9PiB7XG4gIGNvbnN0IG5vZGUgPSBzZWxmW0NBQ0hFXS5nZXQoa2V5KTtcbiAgaWYgKG5vZGUpIHtcbiAgICBjb25zdCBoaXQgPSBub2RlLnZhbHVlO1xuICAgIGlmIChpc1N0YWxlKHNlbGYsIGhpdCkpIHtcbiAgICAgIGRlbChzZWxmLCBub2RlKTtcbiAgICAgIGlmICghc2VsZltBTExPV19TVEFMRV0pXG4gICAgICAgIHJldHVybiB1bmRlZmluZWRcbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKGRvVXNlKSB7XG4gICAgICAgIGlmIChzZWxmW1VQREFURV9BR0VfT05fR0VUXSlcbiAgICAgICAgICBub2RlLnZhbHVlLm5vdyA9IERhdGUubm93KCk7XG4gICAgICAgIHNlbGZbTFJVX0xJU1RdLnVuc2hpZnROb2RlKG5vZGUpO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gaGl0LnZhbHVlXG4gIH1cbn07XG5cbmNvbnN0IGlzU3RhbGUgPSAoc2VsZiwgaGl0KSA9PiB7XG4gIGlmICghaGl0IHx8ICghaGl0Lm1heEFnZSAmJiAhc2VsZltNQVhfQUdFXSkpXG4gICAgcmV0dXJuIGZhbHNlXG5cbiAgY29uc3QgZGlmZiA9IERhdGUubm93KCkgLSBoaXQubm93O1xuICByZXR1cm4gaGl0Lm1heEFnZSA/IGRpZmYgPiBoaXQubWF4QWdlXG4gICAgOiBzZWxmW01BWF9BR0VdICYmIChkaWZmID4gc2VsZltNQVhfQUdFXSlcbn07XG5cbmNvbnN0IHRyaW0gPSBzZWxmID0+IHtcbiAgaWYgKHNlbGZbTEVOR1RIXSA+IHNlbGZbTUFYXSkge1xuICAgIGZvciAobGV0IHdhbGtlciA9IHNlbGZbTFJVX0xJU1RdLnRhaWw7XG4gICAgICBzZWxmW0xFTkdUSF0gPiBzZWxmW01BWF0gJiYgd2Fsa2VyICE9PSBudWxsOykge1xuICAgICAgLy8gV2Uga25vdyB0aGF0IHdlJ3JlIGFib3V0IHRvIGRlbGV0ZSB0aGlzIG9uZSwgYW5kIGFsc29cbiAgICAgIC8vIHdoYXQgdGhlIG5leHQgbGVhc3QgcmVjZW50bHkgdXNlZCBrZXkgd2lsbCBiZSwgc28ganVzdFxuICAgICAgLy8gZ28gYWhlYWQgYW5kIHNldCBpdCBub3cuXG4gICAgICBjb25zdCBwcmV2ID0gd2Fsa2VyLnByZXY7XG4gICAgICBkZWwoc2VsZiwgd2Fsa2VyKTtcbiAgICAgIHdhbGtlciA9IHByZXY7XG4gICAgfVxuICB9XG59O1xuXG5jb25zdCBkZWwgPSAoc2VsZiwgbm9kZSkgPT4ge1xuICBpZiAobm9kZSkge1xuICAgIGNvbnN0IGhpdCA9IG5vZGUudmFsdWU7XG4gICAgaWYgKHNlbGZbRElTUE9TRV0pXG4gICAgICBzZWxmW0RJU1BPU0VdKGhpdC5rZXksIGhpdC52YWx1ZSk7XG5cbiAgICBzZWxmW0xFTkdUSF0gLT0gaGl0Lmxlbmd0aDtcbiAgICBzZWxmW0NBQ0hFXS5kZWxldGUoaGl0LmtleSk7XG4gICAgc2VsZltMUlVfTElTVF0ucmVtb3ZlTm9kZShub2RlKTtcbiAgfVxufTtcblxuY2xhc3MgRW50cnkge1xuICBjb25zdHJ1Y3RvciAoa2V5LCB2YWx1ZSwgbGVuZ3RoLCBub3csIG1heEFnZSkge1xuICAgIHRoaXMua2V5ID0ga2V5O1xuICAgIHRoaXMudmFsdWUgPSB2YWx1ZTtcbiAgICB0aGlzLmxlbmd0aCA9IGxlbmd0aDtcbiAgICB0aGlzLm5vdyA9IG5vdztcbiAgICB0aGlzLm1heEFnZSA9IG1heEFnZSB8fCAwO1xuICB9XG59XG5cbmNvbnN0IGZvckVhY2hTdGVwID0gKHNlbGYsIGZuLCBub2RlLCB0aGlzcCkgPT4ge1xuICBsZXQgaGl0ID0gbm9kZS52YWx1ZTtcbiAgaWYgKGlzU3RhbGUoc2VsZiwgaGl0KSkge1xuICAgIGRlbChzZWxmLCBub2RlKTtcbiAgICBpZiAoIXNlbGZbQUxMT1dfU1RBTEVdKVxuICAgICAgaGl0ID0gdW5kZWZpbmVkO1xuICB9XG4gIGlmIChoaXQpXG4gICAgZm4uY2FsbCh0aGlzcCwgaGl0LnZhbHVlLCBoaXQua2V5LCBzZWxmKTtcbn07XG5cbnZhciBscnVDYWNoZSA9IExSVUNhY2hlO1xuXG4vLyBob2lzdGVkIGNsYXNzIGZvciBjeWNsaWMgZGVwZW5kZW5jeVxuY2xhc3MgUmFuZ2UkYSB7XG4gIGNvbnN0cnVjdG9yIChyYW5nZSwgb3B0aW9ucykge1xuICAgIG9wdGlvbnMgPSBwYXJzZU9wdGlvbnMkMShvcHRpb25zKTtcblxuICAgIGlmIChyYW5nZSBpbnN0YW5jZW9mIFJhbmdlJGEpIHtcbiAgICAgIGlmIChcbiAgICAgICAgcmFuZ2UubG9vc2UgPT09ICEhb3B0aW9ucy5sb29zZSAmJlxuICAgICAgICByYW5nZS5pbmNsdWRlUHJlcmVsZWFzZSA9PT0gISFvcHRpb25zLmluY2x1ZGVQcmVyZWxlYXNlXG4gICAgICApIHtcbiAgICAgICAgcmV0dXJuIHJhbmdlXG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gbmV3IFJhbmdlJGEocmFuZ2UucmF3LCBvcHRpb25zKVxuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChyYW5nZSBpbnN0YW5jZW9mIENvbXBhcmF0b3IkMykge1xuICAgICAgLy8ganVzdCBwdXQgaXQgaW4gdGhlIHNldCBhbmQgcmV0dXJuXG4gICAgICB0aGlzLnJhdyA9IHJhbmdlLnZhbHVlO1xuICAgICAgdGhpcy5zZXQgPSBbW3JhbmdlXV07XG4gICAgICB0aGlzLmZvcm1hdCgpO1xuICAgICAgcmV0dXJuIHRoaXNcbiAgICB9XG5cbiAgICB0aGlzLm9wdGlvbnMgPSBvcHRpb25zO1xuICAgIHRoaXMubG9vc2UgPSAhIW9wdGlvbnMubG9vc2U7XG4gICAgdGhpcy5pbmNsdWRlUHJlcmVsZWFzZSA9ICEhb3B0aW9ucy5pbmNsdWRlUHJlcmVsZWFzZTtcblxuICAgIC8vIEZpcnN0LCBzcGxpdCBiYXNlZCBvbiBib29sZWFuIG9yIHx8XG4gICAgdGhpcy5yYXcgPSByYW5nZTtcbiAgICB0aGlzLnNldCA9IHJhbmdlXG4gICAgICAuc3BsaXQoL1xccypcXHxcXHxcXHMqLylcbiAgICAgIC8vIG1hcCB0aGUgcmFuZ2UgdG8gYSAyZCBhcnJheSBvZiBjb21wYXJhdG9yc1xuICAgICAgLm1hcChyYW5nZSA9PiB0aGlzLnBhcnNlUmFuZ2UocmFuZ2UudHJpbSgpKSlcbiAgICAgIC8vIHRocm93IG91dCBhbnkgY29tcGFyYXRvciBsaXN0cyB0aGF0IGFyZSBlbXB0eVxuICAgICAgLy8gdGhpcyBnZW5lcmFsbHkgbWVhbnMgdGhhdCBpdCB3YXMgbm90IGEgdmFsaWQgcmFuZ2UsIHdoaWNoIGlzIGFsbG93ZWRcbiAgICAgIC8vIGluIGxvb3NlIG1vZGUsIGJ1dCB3aWxsIHN0aWxsIHRocm93IGlmIHRoZSBXSE9MRSByYW5nZSBpcyBpbnZhbGlkLlxuICAgICAgLmZpbHRlcihjID0+IGMubGVuZ3RoKTtcblxuICAgIGlmICghdGhpcy5zZXQubGVuZ3RoKSB7XG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKGBJbnZhbGlkIFNlbVZlciBSYW5nZTogJHtyYW5nZX1gKVxuICAgIH1cblxuICAgIC8vIGlmIHdlIGhhdmUgYW55IHRoYXQgYXJlIG5vdCB0aGUgbnVsbCBzZXQsIHRocm93IG91dCBudWxsIHNldHMuXG4gICAgaWYgKHRoaXMuc2V0Lmxlbmd0aCA+IDEpIHtcbiAgICAgIC8vIGtlZXAgdGhlIGZpcnN0IG9uZSwgaW4gY2FzZSB0aGV5J3JlIGFsbCBudWxsIHNldHNcbiAgICAgIGNvbnN0IGZpcnN0ID0gdGhpcy5zZXRbMF07XG4gICAgICB0aGlzLnNldCA9IHRoaXMuc2V0LmZpbHRlcihjID0+ICFpc051bGxTZXQoY1swXSkpO1xuICAgICAgaWYgKHRoaXMuc2V0Lmxlbmd0aCA9PT0gMClcbiAgICAgICAgdGhpcy5zZXQgPSBbZmlyc3RdO1xuICAgICAgZWxzZSBpZiAodGhpcy5zZXQubGVuZ3RoID4gMSkge1xuICAgICAgICAvLyBpZiB3ZSBoYXZlIGFueSB0aGF0IGFyZSAqLCB0aGVuIHRoZSByYW5nZSBpcyBqdXN0ICpcbiAgICAgICAgZm9yIChjb25zdCBjIG9mIHRoaXMuc2V0KSB7XG4gICAgICAgICAgaWYgKGMubGVuZ3RoID09PSAxICYmIGlzQW55KGNbMF0pKSB7XG4gICAgICAgICAgICB0aGlzLnNldCA9IFtjXTtcbiAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgdGhpcy5mb3JtYXQoKTtcbiAgfVxuXG4gIGZvcm1hdCAoKSB7XG4gICAgdGhpcy5yYW5nZSA9IHRoaXMuc2V0XG4gICAgICAubWFwKChjb21wcykgPT4ge1xuICAgICAgICByZXR1cm4gY29tcHMuam9pbignICcpLnRyaW0oKVxuICAgICAgfSlcbiAgICAgIC5qb2luKCd8fCcpXG4gICAgICAudHJpbSgpO1xuICAgIHJldHVybiB0aGlzLnJhbmdlXG4gIH1cblxuICB0b1N0cmluZyAoKSB7XG4gICAgcmV0dXJuIHRoaXMucmFuZ2VcbiAgfVxuXG4gIHBhcnNlUmFuZ2UgKHJhbmdlKSB7XG4gICAgcmFuZ2UgPSByYW5nZS50cmltKCk7XG5cbiAgICAvLyBtZW1vaXplIHJhbmdlIHBhcnNpbmcgZm9yIHBlcmZvcm1hbmNlLlxuICAgIC8vIHRoaXMgaXMgYSB2ZXJ5IGhvdCBwYXRoLCBhbmQgZnVsbHkgZGV0ZXJtaW5pc3RpYy5cbiAgICBjb25zdCBtZW1vT3B0cyA9IE9iamVjdC5rZXlzKHRoaXMub3B0aW9ucykuam9pbignLCcpO1xuICAgIGNvbnN0IG1lbW9LZXkgPSBgcGFyc2VSYW5nZToke21lbW9PcHRzfToke3JhbmdlfWA7XG4gICAgY29uc3QgY2FjaGVkID0gY2FjaGUuZ2V0KG1lbW9LZXkpO1xuICAgIGlmIChjYWNoZWQpXG4gICAgICByZXR1cm4gY2FjaGVkXG5cbiAgICBjb25zdCBsb29zZSA9IHRoaXMub3B0aW9ucy5sb29zZTtcbiAgICAvLyBgMS4yLjMgLSAxLjIuNGAgPT4gYD49MS4yLjMgPD0xLjIuNGBcbiAgICBjb25zdCBociA9IGxvb3NlID8gcmUkMVt0JDEuSFlQSEVOUkFOR0VMT09TRV0gOiByZSQxW3QkMS5IWVBIRU5SQU5HRV07XG4gICAgcmFuZ2UgPSByYW5nZS5yZXBsYWNlKGhyLCBoeXBoZW5SZXBsYWNlKHRoaXMub3B0aW9ucy5pbmNsdWRlUHJlcmVsZWFzZSkpO1xuICAgIGRlYnVnJDEoJ2h5cGhlbiByZXBsYWNlJywgcmFuZ2UpO1xuICAgIC8vIGA+IDEuMi4zIDwgMS4yLjVgID0+IGA+MS4yLjMgPDEuMi41YFxuICAgIHJhbmdlID0gcmFuZ2UucmVwbGFjZShyZSQxW3QkMS5DT01QQVJBVE9SVFJJTV0sIGNvbXBhcmF0b3JUcmltUmVwbGFjZSk7XG4gICAgZGVidWckMSgnY29tcGFyYXRvciB0cmltJywgcmFuZ2UsIHJlJDFbdCQxLkNPTVBBUkFUT1JUUklNXSk7XG5cbiAgICAvLyBgfiAxLjIuM2AgPT4gYH4xLjIuM2BcbiAgICByYW5nZSA9IHJhbmdlLnJlcGxhY2UocmUkMVt0JDEuVElMREVUUklNXSwgdGlsZGVUcmltUmVwbGFjZSk7XG5cbiAgICAvLyBgXiAxLjIuM2AgPT4gYF4xLjIuM2BcbiAgICByYW5nZSA9IHJhbmdlLnJlcGxhY2UocmUkMVt0JDEuQ0FSRVRUUklNXSwgY2FyZXRUcmltUmVwbGFjZSk7XG5cbiAgICAvLyBub3JtYWxpemUgc3BhY2VzXG4gICAgcmFuZ2UgPSByYW5nZS5zcGxpdCgvXFxzKy8pLmpvaW4oJyAnKTtcblxuICAgIC8vIEF0IHRoaXMgcG9pbnQsIHRoZSByYW5nZSBpcyBjb21wbGV0ZWx5IHRyaW1tZWQgYW5kXG4gICAgLy8gcmVhZHkgdG8gYmUgc3BsaXQgaW50byBjb21wYXJhdG9ycy5cblxuICAgIGNvbnN0IGNvbXBSZSA9IGxvb3NlID8gcmUkMVt0JDEuQ09NUEFSQVRPUkxPT1NFXSA6IHJlJDFbdCQxLkNPTVBBUkFUT1JdO1xuICAgIGNvbnN0IHJhbmdlTGlzdCA9IHJhbmdlXG4gICAgICAuc3BsaXQoJyAnKVxuICAgICAgLm1hcChjb21wID0+IHBhcnNlQ29tcGFyYXRvcihjb21wLCB0aGlzLm9wdGlvbnMpKVxuICAgICAgLmpvaW4oJyAnKVxuICAgICAgLnNwbGl0KC9cXHMrLylcbiAgICAgIC8vID49MC4wLjAgaXMgZXF1aXZhbGVudCB0byAqXG4gICAgICAubWFwKGNvbXAgPT4gcmVwbGFjZUdURTAoY29tcCwgdGhpcy5vcHRpb25zKSlcbiAgICAgIC8vIGluIGxvb3NlIG1vZGUsIHRocm93IG91dCBhbnkgdGhhdCBhcmUgbm90IHZhbGlkIGNvbXBhcmF0b3JzXG4gICAgICAuZmlsdGVyKHRoaXMub3B0aW9ucy5sb29zZSA/IGNvbXAgPT4gISFjb21wLm1hdGNoKGNvbXBSZSkgOiAoKSA9PiB0cnVlKVxuICAgICAgLm1hcChjb21wID0+IG5ldyBDb21wYXJhdG9yJDMoY29tcCwgdGhpcy5vcHRpb25zKSk7XG5cbiAgICAvLyBpZiBhbnkgY29tcGFyYXRvcnMgYXJlIHRoZSBudWxsIHNldCwgdGhlbiByZXBsYWNlIHdpdGggSlVTVCBudWxsIHNldFxuICAgIC8vIGlmIG1vcmUgdGhhbiBvbmUgY29tcGFyYXRvciwgcmVtb3ZlIGFueSAqIGNvbXBhcmF0b3JzXG4gICAgLy8gYWxzbywgZG9uJ3QgaW5jbHVkZSB0aGUgc2FtZSBjb21wYXJhdG9yIG1vcmUgdGhhbiBvbmNlXG4gICAgcmFuZ2VMaXN0Lmxlbmd0aDtcbiAgICBjb25zdCByYW5nZU1hcCA9IG5ldyBNYXAoKTtcbiAgICBmb3IgKGNvbnN0IGNvbXAgb2YgcmFuZ2VMaXN0KSB7XG4gICAgICBpZiAoaXNOdWxsU2V0KGNvbXApKVxuICAgICAgICByZXR1cm4gW2NvbXBdXG4gICAgICByYW5nZU1hcC5zZXQoY29tcC52YWx1ZSwgY29tcCk7XG4gICAgfVxuICAgIGlmIChyYW5nZU1hcC5zaXplID4gMSAmJiByYW5nZU1hcC5oYXMoJycpKVxuICAgICAgcmFuZ2VNYXAuZGVsZXRlKCcnKTtcblxuICAgIGNvbnN0IHJlc3VsdCA9IFsuLi5yYW5nZU1hcC52YWx1ZXMoKV07XG4gICAgY2FjaGUuc2V0KG1lbW9LZXksIHJlc3VsdCk7XG4gICAgcmV0dXJuIHJlc3VsdFxuICB9XG5cbiAgaW50ZXJzZWN0cyAocmFuZ2UsIG9wdGlvbnMpIHtcbiAgICBpZiAoIShyYW5nZSBpbnN0YW5jZW9mIFJhbmdlJGEpKSB7XG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdhIFJhbmdlIGlzIHJlcXVpcmVkJylcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcy5zZXQuc29tZSgodGhpc0NvbXBhcmF0b3JzKSA9PiB7XG4gICAgICByZXR1cm4gKFxuICAgICAgICBpc1NhdGlzZmlhYmxlKHRoaXNDb21wYXJhdG9ycywgb3B0aW9ucykgJiZcbiAgICAgICAgcmFuZ2Uuc2V0LnNvbWUoKHJhbmdlQ29tcGFyYXRvcnMpID0+IHtcbiAgICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgaXNTYXRpc2ZpYWJsZShyYW5nZUNvbXBhcmF0b3JzLCBvcHRpb25zKSAmJlxuICAgICAgICAgICAgdGhpc0NvbXBhcmF0b3JzLmV2ZXJ5KCh0aGlzQ29tcGFyYXRvcikgPT4ge1xuICAgICAgICAgICAgICByZXR1cm4gcmFuZ2VDb21wYXJhdG9ycy5ldmVyeSgocmFuZ2VDb21wYXJhdG9yKSA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXNDb21wYXJhdG9yLmludGVyc2VjdHMocmFuZ2VDb21wYXJhdG9yLCBvcHRpb25zKVxuICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgfSlcbiAgICAgICAgICApXG4gICAgICAgIH0pXG4gICAgICApXG4gICAgfSlcbiAgfVxuXG4gIC8vIGlmIEFOWSBvZiB0aGUgc2V0cyBtYXRjaCBBTEwgb2YgaXRzIGNvbXBhcmF0b3JzLCB0aGVuIHBhc3NcbiAgdGVzdCAodmVyc2lvbikge1xuICAgIGlmICghdmVyc2lvbikge1xuICAgICAgcmV0dXJuIGZhbHNlXG4gICAgfVxuXG4gICAgaWYgKHR5cGVvZiB2ZXJzaW9uID09PSAnc3RyaW5nJykge1xuICAgICAgdHJ5IHtcbiAgICAgICAgdmVyc2lvbiA9IG5ldyBTZW1WZXIkNSh2ZXJzaW9uLCB0aGlzLm9wdGlvbnMpO1xuICAgICAgfSBjYXRjaCAoZXIpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlXG4gICAgICB9XG4gICAgfVxuXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLnNldC5sZW5ndGg7IGkrKykge1xuICAgICAgaWYgKHRlc3RTZXQodGhpcy5zZXRbaV0sIHZlcnNpb24sIHRoaXMub3B0aW9ucykpIHtcbiAgICAgICAgcmV0dXJuIHRydWVcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlXG4gIH1cbn1cbnZhciByYW5nZSA9IFJhbmdlJGE7XG5cbmNvbnN0IExSVSA9IGxydUNhY2hlO1xuY29uc3QgY2FjaGUgPSBuZXcgTFJVKHsgbWF4OiAxMDAwIH0pO1xuXG5jb25zdCBwYXJzZU9wdGlvbnMkMSA9IHBhcnNlT3B0aW9uc18xO1xuY29uc3QgQ29tcGFyYXRvciQzID0gY29tcGFyYXRvcjtcbmNvbnN0IGRlYnVnJDEgPSBkZWJ1Z18xO1xuY29uc3QgU2VtVmVyJDUgPSBzZW12ZXIkMjtcbmNvbnN0IHtcbiAgcmU6IHJlJDEsXG4gIHQ6IHQkMSxcbiAgY29tcGFyYXRvclRyaW1SZXBsYWNlLFxuICB0aWxkZVRyaW1SZXBsYWNlLFxuICBjYXJldFRyaW1SZXBsYWNlXG59ID0gcmUkNS5leHBvcnRzO1xuXG5jb25zdCBpc051bGxTZXQgPSBjID0+IGMudmFsdWUgPT09ICc8MC4wLjAtMCc7XG5jb25zdCBpc0FueSA9IGMgPT4gYy52YWx1ZSA9PT0gJyc7XG5cbi8vIHRha2UgYSBzZXQgb2YgY29tcGFyYXRvcnMgYW5kIGRldGVybWluZSB3aGV0aGVyIHRoZXJlXG4vLyBleGlzdHMgYSB2ZXJzaW9uIHdoaWNoIGNhbiBzYXRpc2Z5IGl0XG5jb25zdCBpc1NhdGlzZmlhYmxlID0gKGNvbXBhcmF0b3JzLCBvcHRpb25zKSA9PiB7XG4gIGxldCByZXN1bHQgPSB0cnVlO1xuICBjb25zdCByZW1haW5pbmdDb21wYXJhdG9ycyA9IGNvbXBhcmF0b3JzLnNsaWNlKCk7XG4gIGxldCB0ZXN0Q29tcGFyYXRvciA9IHJlbWFpbmluZ0NvbXBhcmF0b3JzLnBvcCgpO1xuXG4gIHdoaWxlIChyZXN1bHQgJiYgcmVtYWluaW5nQ29tcGFyYXRvcnMubGVuZ3RoKSB7XG4gICAgcmVzdWx0ID0gcmVtYWluaW5nQ29tcGFyYXRvcnMuZXZlcnkoKG90aGVyQ29tcGFyYXRvcikgPT4ge1xuICAgICAgcmV0dXJuIHRlc3RDb21wYXJhdG9yLmludGVyc2VjdHMob3RoZXJDb21wYXJhdG9yLCBvcHRpb25zKVxuICAgIH0pO1xuXG4gICAgdGVzdENvbXBhcmF0b3IgPSByZW1haW5pbmdDb21wYXJhdG9ycy5wb3AoKTtcbiAgfVxuXG4gIHJldHVybiByZXN1bHRcbn07XG5cbi8vIGNvbXByaXNlZCBvZiB4cmFuZ2VzLCB0aWxkZXMsIHN0YXJzLCBhbmQgZ3RsdCdzIGF0IHRoaXMgcG9pbnQuXG4vLyBhbHJlYWR5IHJlcGxhY2VkIHRoZSBoeXBoZW4gcmFuZ2VzXG4vLyB0dXJuIGludG8gYSBzZXQgb2YgSlVTVCBjb21wYXJhdG9ycy5cbmNvbnN0IHBhcnNlQ29tcGFyYXRvciA9IChjb21wLCBvcHRpb25zKSA9PiB7XG4gIGRlYnVnJDEoJ2NvbXAnLCBjb21wLCBvcHRpb25zKTtcbiAgY29tcCA9IHJlcGxhY2VDYXJldHMoY29tcCwgb3B0aW9ucyk7XG4gIGRlYnVnJDEoJ2NhcmV0JywgY29tcCk7XG4gIGNvbXAgPSByZXBsYWNlVGlsZGVzKGNvbXAsIG9wdGlvbnMpO1xuICBkZWJ1ZyQxKCd0aWxkZXMnLCBjb21wKTtcbiAgY29tcCA9IHJlcGxhY2VYUmFuZ2VzKGNvbXAsIG9wdGlvbnMpO1xuICBkZWJ1ZyQxKCd4cmFuZ2UnLCBjb21wKTtcbiAgY29tcCA9IHJlcGxhY2VTdGFycyhjb21wLCBvcHRpb25zKTtcbiAgZGVidWckMSgnc3RhcnMnLCBjb21wKTtcbiAgcmV0dXJuIGNvbXBcbn07XG5cbmNvbnN0IGlzWCA9IGlkID0+ICFpZCB8fCBpZC50b0xvd2VyQ2FzZSgpID09PSAneCcgfHwgaWQgPT09ICcqJztcblxuLy8gfiwgfj4gLS0+ICogKGFueSwga2luZGEgc2lsbHkpXG4vLyB+MiwgfjIueCwgfjIueC54LCB+PjIsIH4+Mi54IH4+Mi54LnggLS0+ID49Mi4wLjAgPDMuMC4wLTBcbi8vIH4yLjAsIH4yLjAueCwgfj4yLjAsIH4+Mi4wLnggLS0+ID49Mi4wLjAgPDIuMS4wLTBcbi8vIH4xLjIsIH4xLjIueCwgfj4xLjIsIH4+MS4yLnggLS0+ID49MS4yLjAgPDEuMy4wLTBcbi8vIH4xLjIuMywgfj4xLjIuMyAtLT4gPj0xLjIuMyA8MS4zLjAtMFxuLy8gfjEuMi4wLCB+PjEuMi4wIC0tPiA+PTEuMi4wIDwxLjMuMC0wXG5jb25zdCByZXBsYWNlVGlsZGVzID0gKGNvbXAsIG9wdGlvbnMpID0+XG4gIGNvbXAudHJpbSgpLnNwbGl0KC9cXHMrLykubWFwKChjb21wKSA9PiB7XG4gICAgcmV0dXJuIHJlcGxhY2VUaWxkZShjb21wLCBvcHRpb25zKVxuICB9KS5qb2luKCcgJyk7XG5cbmNvbnN0IHJlcGxhY2VUaWxkZSA9IChjb21wLCBvcHRpb25zKSA9PiB7XG4gIGNvbnN0IHIgPSBvcHRpb25zLmxvb3NlID8gcmUkMVt0JDEuVElMREVMT09TRV0gOiByZSQxW3QkMS5USUxERV07XG4gIHJldHVybiBjb21wLnJlcGxhY2UociwgKF8sIE0sIG0sIHAsIHByKSA9PiB7XG4gICAgZGVidWckMSgndGlsZGUnLCBjb21wLCBfLCBNLCBtLCBwLCBwcik7XG4gICAgbGV0IHJldDtcblxuICAgIGlmIChpc1goTSkpIHtcbiAgICAgIHJldCA9ICcnO1xuICAgIH0gZWxzZSBpZiAoaXNYKG0pKSB7XG4gICAgICByZXQgPSBgPj0ke019LjAuMCA8JHsrTSArIDF9LjAuMC0wYDtcbiAgICB9IGVsc2UgaWYgKGlzWChwKSkge1xuICAgICAgLy8gfjEuMiA9PSA+PTEuMi4wIDwxLjMuMC0wXG4gICAgICByZXQgPSBgPj0ke019LiR7bX0uMCA8JHtNfS4keyttICsgMX0uMC0wYDtcbiAgICB9IGVsc2UgaWYgKHByKSB7XG4gICAgICBkZWJ1ZyQxKCdyZXBsYWNlVGlsZGUgcHInLCBwcik7XG4gICAgICByZXQgPSBgPj0ke019LiR7bX0uJHtwfS0ke3ByXG4gICAgICB9IDwke019LiR7K20gKyAxfS4wLTBgO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyB+MS4yLjMgPT0gPj0xLjIuMyA8MS4zLjAtMFxuICAgICAgcmV0ID0gYD49JHtNfS4ke219LiR7cFxuICAgICAgfSA8JHtNfS4keyttICsgMX0uMC0wYDtcbiAgICB9XG5cbiAgICBkZWJ1ZyQxKCd0aWxkZSByZXR1cm4nLCByZXQpO1xuICAgIHJldHVybiByZXRcbiAgfSlcbn07XG5cbi8vIF4gLS0+ICogKGFueSwga2luZGEgc2lsbHkpXG4vLyBeMiwgXjIueCwgXjIueC54IC0tPiA+PTIuMC4wIDwzLjAuMC0wXG4vLyBeMi4wLCBeMi4wLnggLS0+ID49Mi4wLjAgPDMuMC4wLTBcbi8vIF4xLjIsIF4xLjIueCAtLT4gPj0xLjIuMCA8Mi4wLjAtMFxuLy8gXjEuMi4zIC0tPiA+PTEuMi4zIDwyLjAuMC0wXG4vLyBeMS4yLjAgLS0+ID49MS4yLjAgPDIuMC4wLTBcbmNvbnN0IHJlcGxhY2VDYXJldHMgPSAoY29tcCwgb3B0aW9ucykgPT5cbiAgY29tcC50cmltKCkuc3BsaXQoL1xccysvKS5tYXAoKGNvbXApID0+IHtcbiAgICByZXR1cm4gcmVwbGFjZUNhcmV0KGNvbXAsIG9wdGlvbnMpXG4gIH0pLmpvaW4oJyAnKTtcblxuY29uc3QgcmVwbGFjZUNhcmV0ID0gKGNvbXAsIG9wdGlvbnMpID0+IHtcbiAgZGVidWckMSgnY2FyZXQnLCBjb21wLCBvcHRpb25zKTtcbiAgY29uc3QgciA9IG9wdGlvbnMubG9vc2UgPyByZSQxW3QkMS5DQVJFVExPT1NFXSA6IHJlJDFbdCQxLkNBUkVUXTtcbiAgY29uc3QgeiA9IG9wdGlvbnMuaW5jbHVkZVByZXJlbGVhc2UgPyAnLTAnIDogJyc7XG4gIHJldHVybiBjb21wLnJlcGxhY2UociwgKF8sIE0sIG0sIHAsIHByKSA9PiB7XG4gICAgZGVidWckMSgnY2FyZXQnLCBjb21wLCBfLCBNLCBtLCBwLCBwcik7XG4gICAgbGV0IHJldDtcblxuICAgIGlmIChpc1goTSkpIHtcbiAgICAgIHJldCA9ICcnO1xuICAgIH0gZWxzZSBpZiAoaXNYKG0pKSB7XG4gICAgICByZXQgPSBgPj0ke019LjAuMCR7en0gPCR7K00gKyAxfS4wLjAtMGA7XG4gICAgfSBlbHNlIGlmIChpc1gocCkpIHtcbiAgICAgIGlmIChNID09PSAnMCcpIHtcbiAgICAgICAgcmV0ID0gYD49JHtNfS4ke219LjAke3p9IDwke019LiR7K20gKyAxfS4wLTBgO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0ID0gYD49JHtNfS4ke219LjAke3p9IDwkeytNICsgMX0uMC4wLTBgO1xuICAgICAgfVxuICAgIH0gZWxzZSBpZiAocHIpIHtcbiAgICAgIGRlYnVnJDEoJ3JlcGxhY2VDYXJldCBwcicsIHByKTtcbiAgICAgIGlmIChNID09PSAnMCcpIHtcbiAgICAgICAgaWYgKG0gPT09ICcwJykge1xuICAgICAgICAgIHJldCA9IGA+PSR7TX0uJHttfS4ke3B9LSR7cHJcbiAgICAgICAgICB9IDwke019LiR7bX0uJHsrcCArIDF9LTBgO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldCA9IGA+PSR7TX0uJHttfS4ke3B9LSR7cHJcbiAgICAgICAgICB9IDwke019LiR7K20gKyAxfS4wLTBgO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXQgPSBgPj0ke019LiR7bX0uJHtwfS0ke3ByXG4gICAgICAgIH0gPCR7K00gKyAxfS4wLjAtMGA7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGRlYnVnJDEoJ25vIHByJyk7XG4gICAgICBpZiAoTSA9PT0gJzAnKSB7XG4gICAgICAgIGlmIChtID09PSAnMCcpIHtcbiAgICAgICAgICByZXQgPSBgPj0ke019LiR7bX0uJHtwXG4gICAgICAgICAgfSR7en0gPCR7TX0uJHttfS4keytwICsgMX0tMGA7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0ID0gYD49JHtNfS4ke219LiR7cFxuICAgICAgICAgIH0ke3p9IDwke019LiR7K20gKyAxfS4wLTBgO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXQgPSBgPj0ke019LiR7bX0uJHtwXG4gICAgICAgIH0gPCR7K00gKyAxfS4wLjAtMGA7XG4gICAgICB9XG4gICAgfVxuXG4gICAgZGVidWckMSgnY2FyZXQgcmV0dXJuJywgcmV0KTtcbiAgICByZXR1cm4gcmV0XG4gIH0pXG59O1xuXG5jb25zdCByZXBsYWNlWFJhbmdlcyA9IChjb21wLCBvcHRpb25zKSA9PiB7XG4gIGRlYnVnJDEoJ3JlcGxhY2VYUmFuZ2VzJywgY29tcCwgb3B0aW9ucyk7XG4gIHJldHVybiBjb21wLnNwbGl0KC9cXHMrLykubWFwKChjb21wKSA9PiB7XG4gICAgcmV0dXJuIHJlcGxhY2VYUmFuZ2UoY29tcCwgb3B0aW9ucylcbiAgfSkuam9pbignICcpXG59O1xuXG5jb25zdCByZXBsYWNlWFJhbmdlID0gKGNvbXAsIG9wdGlvbnMpID0+IHtcbiAgY29tcCA9IGNvbXAudHJpbSgpO1xuICBjb25zdCByID0gb3B0aW9ucy5sb29zZSA/IHJlJDFbdCQxLlhSQU5HRUxPT1NFXSA6IHJlJDFbdCQxLlhSQU5HRV07XG4gIHJldHVybiBjb21wLnJlcGxhY2UociwgKHJldCwgZ3RsdCwgTSwgbSwgcCwgcHIpID0+IHtcbiAgICBkZWJ1ZyQxKCd4UmFuZ2UnLCBjb21wLCByZXQsIGd0bHQsIE0sIG0sIHAsIHByKTtcbiAgICBjb25zdCB4TSA9IGlzWChNKTtcbiAgICBjb25zdCB4bSA9IHhNIHx8IGlzWChtKTtcbiAgICBjb25zdCB4cCA9IHhtIHx8IGlzWChwKTtcbiAgICBjb25zdCBhbnlYID0geHA7XG5cbiAgICBpZiAoZ3RsdCA9PT0gJz0nICYmIGFueVgpIHtcbiAgICAgIGd0bHQgPSAnJztcbiAgICB9XG5cbiAgICAvLyBpZiB3ZSdyZSBpbmNsdWRpbmcgcHJlcmVsZWFzZXMgaW4gdGhlIG1hdGNoLCB0aGVuIHdlIG5lZWRcbiAgICAvLyB0byBmaXggdGhpcyB0byAtMCwgdGhlIGxvd2VzdCBwb3NzaWJsZSBwcmVyZWxlYXNlIHZhbHVlXG4gICAgcHIgPSBvcHRpb25zLmluY2x1ZGVQcmVyZWxlYXNlID8gJy0wJyA6ICcnO1xuXG4gICAgaWYgKHhNKSB7XG4gICAgICBpZiAoZ3RsdCA9PT0gJz4nIHx8IGd0bHQgPT09ICc8Jykge1xuICAgICAgICAvLyBub3RoaW5nIGlzIGFsbG93ZWRcbiAgICAgICAgcmV0ID0gJzwwLjAuMC0wJztcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIG5vdGhpbmcgaXMgZm9yYmlkZGVuXG4gICAgICAgIHJldCA9ICcqJztcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKGd0bHQgJiYgYW55WCkge1xuICAgICAgLy8gd2Uga25vdyBwYXRjaCBpcyBhbiB4LCBiZWNhdXNlIHdlIGhhdmUgYW55IHggYXQgYWxsLlxuICAgICAgLy8gcmVwbGFjZSBYIHdpdGggMFxuICAgICAgaWYgKHhtKSB7XG4gICAgICAgIG0gPSAwO1xuICAgICAgfVxuICAgICAgcCA9IDA7XG5cbiAgICAgIGlmIChndGx0ID09PSAnPicpIHtcbiAgICAgICAgLy8gPjEgPT4gPj0yLjAuMFxuICAgICAgICAvLyA+MS4yID0+ID49MS4zLjBcbiAgICAgICAgZ3RsdCA9ICc+PSc7XG4gICAgICAgIGlmICh4bSkge1xuICAgICAgICAgIE0gPSArTSArIDE7XG4gICAgICAgICAgbSA9IDA7XG4gICAgICAgICAgcCA9IDA7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgbSA9ICttICsgMTtcbiAgICAgICAgICBwID0gMDtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIGlmIChndGx0ID09PSAnPD0nKSB7XG4gICAgICAgIC8vIDw9MC43LnggaXMgYWN0dWFsbHkgPDAuOC4wLCBzaW5jZSBhbnkgMC43Lnggc2hvdWxkXG4gICAgICAgIC8vIHBhc3MuICBTaW1pbGFybHksIDw9Ny54IGlzIGFjdHVhbGx5IDw4LjAuMCwgZXRjLlxuICAgICAgICBndGx0ID0gJzwnO1xuICAgICAgICBpZiAoeG0pIHtcbiAgICAgICAgICBNID0gK00gKyAxO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIG0gPSArbSArIDE7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgaWYgKGd0bHQgPT09ICc8JylcbiAgICAgICAgcHIgPSAnLTAnO1xuXG4gICAgICByZXQgPSBgJHtndGx0ICsgTX0uJHttfS4ke3B9JHtwcn1gO1xuICAgIH0gZWxzZSBpZiAoeG0pIHtcbiAgICAgIHJldCA9IGA+PSR7TX0uMC4wJHtwcn0gPCR7K00gKyAxfS4wLjAtMGA7XG4gICAgfSBlbHNlIGlmICh4cCkge1xuICAgICAgcmV0ID0gYD49JHtNfS4ke219LjAke3ByXG4gICAgICB9IDwke019LiR7K20gKyAxfS4wLTBgO1xuICAgIH1cblxuICAgIGRlYnVnJDEoJ3hSYW5nZSByZXR1cm4nLCByZXQpO1xuXG4gICAgcmV0dXJuIHJldFxuICB9KVxufTtcblxuLy8gQmVjYXVzZSAqIGlzIEFORC1lZCB3aXRoIGV2ZXJ5dGhpbmcgZWxzZSBpbiB0aGUgY29tcGFyYXRvcixcbi8vIGFuZCAnJyBtZWFucyBcImFueSB2ZXJzaW9uXCIsIGp1c3QgcmVtb3ZlIHRoZSAqcyBlbnRpcmVseS5cbmNvbnN0IHJlcGxhY2VTdGFycyA9IChjb21wLCBvcHRpb25zKSA9PiB7XG4gIGRlYnVnJDEoJ3JlcGxhY2VTdGFycycsIGNvbXAsIG9wdGlvbnMpO1xuICAvLyBMb29zZW5lc3MgaXMgaWdub3JlZCBoZXJlLiAgc3RhciBpcyBhbHdheXMgYXMgbG9vc2UgYXMgaXQgZ2V0cyFcbiAgcmV0dXJuIGNvbXAudHJpbSgpLnJlcGxhY2UocmUkMVt0JDEuU1RBUl0sICcnKVxufTtcblxuY29uc3QgcmVwbGFjZUdURTAgPSAoY29tcCwgb3B0aW9ucykgPT4ge1xuICBkZWJ1ZyQxKCdyZXBsYWNlR1RFMCcsIGNvbXAsIG9wdGlvbnMpO1xuICByZXR1cm4gY29tcC50cmltKClcbiAgICAucmVwbGFjZShyZSQxW29wdGlvbnMuaW5jbHVkZVByZXJlbGVhc2UgPyB0JDEuR1RFMFBSRSA6IHQkMS5HVEUwXSwgJycpXG59O1xuXG4vLyBUaGlzIGZ1bmN0aW9uIGlzIHBhc3NlZCB0byBzdHJpbmcucmVwbGFjZShyZVt0LkhZUEhFTlJBTkdFXSlcbi8vIE0sIG0sIHBhdGNoLCBwcmVyZWxlYXNlLCBidWlsZFxuLy8gMS4yIC0gMy40LjUgPT4gPj0xLjIuMCA8PTMuNC41XG4vLyAxLjIuMyAtIDMuNCA9PiA+PTEuMi4wIDwzLjUuMC0wIEFueSAzLjQueCB3aWxsIGRvXG4vLyAxLjIgLSAzLjQgPT4gPj0xLjIuMCA8My41LjAtMFxuY29uc3QgaHlwaGVuUmVwbGFjZSA9IGluY1ByID0+ICgkMCxcbiAgZnJvbSwgZk0sIGZtLCBmcCwgZnByLCBmYixcbiAgdG8sIHRNLCB0bSwgdHAsIHRwciwgdGIpID0+IHtcbiAgaWYgKGlzWChmTSkpIHtcbiAgICBmcm9tID0gJyc7XG4gIH0gZWxzZSBpZiAoaXNYKGZtKSkge1xuICAgIGZyb20gPSBgPj0ke2ZNfS4wLjAke2luY1ByID8gJy0wJyA6ICcnfWA7XG4gIH0gZWxzZSBpZiAoaXNYKGZwKSkge1xuICAgIGZyb20gPSBgPj0ke2ZNfS4ke2ZtfS4wJHtpbmNQciA/ICctMCcgOiAnJ31gO1xuICB9IGVsc2UgaWYgKGZwcikge1xuICAgIGZyb20gPSBgPj0ke2Zyb219YDtcbiAgfSBlbHNlIHtcbiAgICBmcm9tID0gYD49JHtmcm9tfSR7aW5jUHIgPyAnLTAnIDogJyd9YDtcbiAgfVxuXG4gIGlmIChpc1godE0pKSB7XG4gICAgdG8gPSAnJztcbiAgfSBlbHNlIGlmIChpc1godG0pKSB7XG4gICAgdG8gPSBgPCR7K3RNICsgMX0uMC4wLTBgO1xuICB9IGVsc2UgaWYgKGlzWCh0cCkpIHtcbiAgICB0byA9IGA8JHt0TX0uJHsrdG0gKyAxfS4wLTBgO1xuICB9IGVsc2UgaWYgKHRwcikge1xuICAgIHRvID0gYDw9JHt0TX0uJHt0bX0uJHt0cH0tJHt0cHJ9YDtcbiAgfSBlbHNlIGlmIChpbmNQcikge1xuICAgIHRvID0gYDwke3RNfS4ke3RtfS4keyt0cCArIDF9LTBgO1xuICB9IGVsc2Uge1xuICAgIHRvID0gYDw9JHt0b31gO1xuICB9XG5cbiAgcmV0dXJuIChgJHtmcm9tfSAke3RvfWApLnRyaW0oKVxufTtcblxuY29uc3QgdGVzdFNldCA9IChzZXQsIHZlcnNpb24sIG9wdGlvbnMpID0+IHtcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBzZXQubGVuZ3RoOyBpKyspIHtcbiAgICBpZiAoIXNldFtpXS50ZXN0KHZlcnNpb24pKSB7XG4gICAgICByZXR1cm4gZmFsc2VcbiAgICB9XG4gIH1cblxuICBpZiAodmVyc2lvbi5wcmVyZWxlYXNlLmxlbmd0aCAmJiAhb3B0aW9ucy5pbmNsdWRlUHJlcmVsZWFzZSkge1xuICAgIC8vIEZpbmQgdGhlIHNldCBvZiB2ZXJzaW9ucyB0aGF0IGFyZSBhbGxvd2VkIHRvIGhhdmUgcHJlcmVsZWFzZXNcbiAgICAvLyBGb3IgZXhhbXBsZSwgXjEuMi4zLXByLjEgZGVzdWdhcnMgdG8gPj0xLjIuMy1wci4xIDwyLjAuMFxuICAgIC8vIFRoYXQgc2hvdWxkIGFsbG93IGAxLjIuMy1wci4yYCB0byBwYXNzLlxuICAgIC8vIEhvd2V2ZXIsIGAxLjIuNC1hbHBoYS5ub3RyZWFkeWAgc2hvdWxkIE5PVCBiZSBhbGxvd2VkLFxuICAgIC8vIGV2ZW4gdGhvdWdoIGl0J3Mgd2l0aGluIHRoZSByYW5nZSBzZXQgYnkgdGhlIGNvbXBhcmF0b3JzLlxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgc2V0Lmxlbmd0aDsgaSsrKSB7XG4gICAgICBkZWJ1ZyQxKHNldFtpXS5zZW12ZXIpO1xuICAgICAgaWYgKHNldFtpXS5zZW12ZXIgPT09IENvbXBhcmF0b3IkMy5BTlkpIHtcbiAgICAgICAgY29udGludWVcbiAgICAgIH1cblxuICAgICAgaWYgKHNldFtpXS5zZW12ZXIucHJlcmVsZWFzZS5sZW5ndGggPiAwKSB7XG4gICAgICAgIGNvbnN0IGFsbG93ZWQgPSBzZXRbaV0uc2VtdmVyO1xuICAgICAgICBpZiAoYWxsb3dlZC5tYWpvciA9PT0gdmVyc2lvbi5tYWpvciAmJlxuICAgICAgICAgICAgYWxsb3dlZC5taW5vciA9PT0gdmVyc2lvbi5taW5vciAmJlxuICAgICAgICAgICAgYWxsb3dlZC5wYXRjaCA9PT0gdmVyc2lvbi5wYXRjaCkge1xuICAgICAgICAgIHJldHVybiB0cnVlXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBWZXJzaW9uIGhhcyBhIC1wcmUsIGJ1dCBpdCdzIG5vdCBvbmUgb2YgdGhlIG9uZXMgd2UgbGlrZS5cbiAgICByZXR1cm4gZmFsc2VcbiAgfVxuXG4gIHJldHVybiB0cnVlXG59O1xuXG5jb25zdCBBTlkkMiA9IFN5bWJvbCgnU2VtVmVyIEFOWScpO1xuLy8gaG9pc3RlZCBjbGFzcyBmb3IgY3ljbGljIGRlcGVuZGVuY3lcbmNsYXNzIENvbXBhcmF0b3IkMiB7XG4gIHN0YXRpYyBnZXQgQU5ZICgpIHtcbiAgICByZXR1cm4gQU5ZJDJcbiAgfVxuICBjb25zdHJ1Y3RvciAoY29tcCwgb3B0aW9ucykge1xuICAgIG9wdGlvbnMgPSBwYXJzZU9wdGlvbnMob3B0aW9ucyk7XG5cbiAgICBpZiAoY29tcCBpbnN0YW5jZW9mIENvbXBhcmF0b3IkMikge1xuICAgICAgaWYgKGNvbXAubG9vc2UgPT09ICEhb3B0aW9ucy5sb29zZSkge1xuICAgICAgICByZXR1cm4gY29tcFxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29tcCA9IGNvbXAudmFsdWU7XG4gICAgICB9XG4gICAgfVxuXG4gICAgZGVidWcoJ2NvbXBhcmF0b3InLCBjb21wLCBvcHRpb25zKTtcbiAgICB0aGlzLm9wdGlvbnMgPSBvcHRpb25zO1xuICAgIHRoaXMubG9vc2UgPSAhIW9wdGlvbnMubG9vc2U7XG4gICAgdGhpcy5wYXJzZShjb21wKTtcblxuICAgIGlmICh0aGlzLnNlbXZlciA9PT0gQU5ZJDIpIHtcbiAgICAgIHRoaXMudmFsdWUgPSAnJztcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy52YWx1ZSA9IHRoaXMub3BlcmF0b3IgKyB0aGlzLnNlbXZlci52ZXJzaW9uO1xuICAgIH1cblxuICAgIGRlYnVnKCdjb21wJywgdGhpcyk7XG4gIH1cblxuICBwYXJzZSAoY29tcCkge1xuICAgIGNvbnN0IHIgPSB0aGlzLm9wdGlvbnMubG9vc2UgPyByZVt0LkNPTVBBUkFUT1JMT09TRV0gOiByZVt0LkNPTVBBUkFUT1JdO1xuICAgIGNvbnN0IG0gPSBjb21wLm1hdGNoKHIpO1xuXG4gICAgaWYgKCFtKSB7XG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKGBJbnZhbGlkIGNvbXBhcmF0b3I6ICR7Y29tcH1gKVxuICAgIH1cblxuICAgIHRoaXMub3BlcmF0b3IgPSBtWzFdICE9PSB1bmRlZmluZWQgPyBtWzFdIDogJyc7XG4gICAgaWYgKHRoaXMub3BlcmF0b3IgPT09ICc9Jykge1xuICAgICAgdGhpcy5vcGVyYXRvciA9ICcnO1xuICAgIH1cblxuICAgIC8vIGlmIGl0IGxpdGVyYWxseSBpcyBqdXN0ICc+JyBvciAnJyB0aGVuIGFsbG93IGFueXRoaW5nLlxuICAgIGlmICghbVsyXSkge1xuICAgICAgdGhpcy5zZW12ZXIgPSBBTlkkMjtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5zZW12ZXIgPSBuZXcgU2VtVmVyJDQobVsyXSwgdGhpcy5vcHRpb25zLmxvb3NlKTtcbiAgICB9XG4gIH1cblxuICB0b1N0cmluZyAoKSB7XG4gICAgcmV0dXJuIHRoaXMudmFsdWVcbiAgfVxuXG4gIHRlc3QgKHZlcnNpb24pIHtcbiAgICBkZWJ1ZygnQ29tcGFyYXRvci50ZXN0JywgdmVyc2lvbiwgdGhpcy5vcHRpb25zLmxvb3NlKTtcblxuICAgIGlmICh0aGlzLnNlbXZlciA9PT0gQU5ZJDIgfHwgdmVyc2lvbiA9PT0gQU5ZJDIpIHtcbiAgICAgIHJldHVybiB0cnVlXG4gICAgfVxuXG4gICAgaWYgKHR5cGVvZiB2ZXJzaW9uID09PSAnc3RyaW5nJykge1xuICAgICAgdHJ5IHtcbiAgICAgICAgdmVyc2lvbiA9IG5ldyBTZW1WZXIkNCh2ZXJzaW9uLCB0aGlzLm9wdGlvbnMpO1xuICAgICAgfSBjYXRjaCAoZXIpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlXG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGNtcCh2ZXJzaW9uLCB0aGlzLm9wZXJhdG9yLCB0aGlzLnNlbXZlciwgdGhpcy5vcHRpb25zKVxuICB9XG5cbiAgaW50ZXJzZWN0cyAoY29tcCwgb3B0aW9ucykge1xuICAgIGlmICghKGNvbXAgaW5zdGFuY2VvZiBDb21wYXJhdG9yJDIpKSB7XG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdhIENvbXBhcmF0b3IgaXMgcmVxdWlyZWQnKVxuICAgIH1cblxuICAgIGlmICghb3B0aW9ucyB8fCB0eXBlb2Ygb3B0aW9ucyAhPT0gJ29iamVjdCcpIHtcbiAgICAgIG9wdGlvbnMgPSB7XG4gICAgICAgIGxvb3NlOiAhIW9wdGlvbnMsXG4gICAgICAgIGluY2x1ZGVQcmVyZWxlYXNlOiBmYWxzZVxuICAgICAgfTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5vcGVyYXRvciA9PT0gJycpIHtcbiAgICAgIGlmICh0aGlzLnZhbHVlID09PSAnJykge1xuICAgICAgICByZXR1cm4gdHJ1ZVxuICAgICAgfVxuICAgICAgcmV0dXJuIG5ldyBSYW5nZSQ5KGNvbXAudmFsdWUsIG9wdGlvbnMpLnRlc3QodGhpcy52YWx1ZSlcbiAgICB9IGVsc2UgaWYgKGNvbXAub3BlcmF0b3IgPT09ICcnKSB7XG4gICAgICBpZiAoY29tcC52YWx1ZSA9PT0gJycpIHtcbiAgICAgICAgcmV0dXJuIHRydWVcbiAgICAgIH1cbiAgICAgIHJldHVybiBuZXcgUmFuZ2UkOSh0aGlzLnZhbHVlLCBvcHRpb25zKS50ZXN0KGNvbXAuc2VtdmVyKVxuICAgIH1cblxuICAgIGNvbnN0IHNhbWVEaXJlY3Rpb25JbmNyZWFzaW5nID1cbiAgICAgICh0aGlzLm9wZXJhdG9yID09PSAnPj0nIHx8IHRoaXMub3BlcmF0b3IgPT09ICc+JykgJiZcbiAgICAgIChjb21wLm9wZXJhdG9yID09PSAnPj0nIHx8IGNvbXAub3BlcmF0b3IgPT09ICc+Jyk7XG4gICAgY29uc3Qgc2FtZURpcmVjdGlvbkRlY3JlYXNpbmcgPVxuICAgICAgKHRoaXMub3BlcmF0b3IgPT09ICc8PScgfHwgdGhpcy5vcGVyYXRvciA9PT0gJzwnKSAmJlxuICAgICAgKGNvbXAub3BlcmF0b3IgPT09ICc8PScgfHwgY29tcC5vcGVyYXRvciA9PT0gJzwnKTtcbiAgICBjb25zdCBzYW1lU2VtVmVyID0gdGhpcy5zZW12ZXIudmVyc2lvbiA9PT0gY29tcC5zZW12ZXIudmVyc2lvbjtcbiAgICBjb25zdCBkaWZmZXJlbnREaXJlY3Rpb25zSW5jbHVzaXZlID1cbiAgICAgICh0aGlzLm9wZXJhdG9yID09PSAnPj0nIHx8IHRoaXMub3BlcmF0b3IgPT09ICc8PScpICYmXG4gICAgICAoY29tcC5vcGVyYXRvciA9PT0gJz49JyB8fCBjb21wLm9wZXJhdG9yID09PSAnPD0nKTtcbiAgICBjb25zdCBvcHBvc2l0ZURpcmVjdGlvbnNMZXNzVGhhbiA9XG4gICAgICBjbXAodGhpcy5zZW12ZXIsICc8JywgY29tcC5zZW12ZXIsIG9wdGlvbnMpICYmXG4gICAgICAodGhpcy5vcGVyYXRvciA9PT0gJz49JyB8fCB0aGlzLm9wZXJhdG9yID09PSAnPicpICYmXG4gICAgICAgIChjb21wLm9wZXJhdG9yID09PSAnPD0nIHx8IGNvbXAub3BlcmF0b3IgPT09ICc8Jyk7XG4gICAgY29uc3Qgb3Bwb3NpdGVEaXJlY3Rpb25zR3JlYXRlclRoYW4gPVxuICAgICAgY21wKHRoaXMuc2VtdmVyLCAnPicsIGNvbXAuc2VtdmVyLCBvcHRpb25zKSAmJlxuICAgICAgKHRoaXMub3BlcmF0b3IgPT09ICc8PScgfHwgdGhpcy5vcGVyYXRvciA9PT0gJzwnKSAmJlxuICAgICAgICAoY29tcC5vcGVyYXRvciA9PT0gJz49JyB8fCBjb21wLm9wZXJhdG9yID09PSAnPicpO1xuXG4gICAgcmV0dXJuIChcbiAgICAgIHNhbWVEaXJlY3Rpb25JbmNyZWFzaW5nIHx8XG4gICAgICBzYW1lRGlyZWN0aW9uRGVjcmVhc2luZyB8fFxuICAgICAgKHNhbWVTZW1WZXIgJiYgZGlmZmVyZW50RGlyZWN0aW9uc0luY2x1c2l2ZSkgfHxcbiAgICAgIG9wcG9zaXRlRGlyZWN0aW9uc0xlc3NUaGFuIHx8XG4gICAgICBvcHBvc2l0ZURpcmVjdGlvbnNHcmVhdGVyVGhhblxuICAgIClcbiAgfVxufVxuXG52YXIgY29tcGFyYXRvciA9IENvbXBhcmF0b3IkMjtcblxuY29uc3QgcGFyc2VPcHRpb25zID0gcGFyc2VPcHRpb25zXzE7XG5jb25zdCB7cmUsIHR9ID0gcmUkNS5leHBvcnRzO1xuY29uc3QgY21wID0gY21wXzE7XG5jb25zdCBkZWJ1ZyA9IGRlYnVnXzE7XG5jb25zdCBTZW1WZXIkNCA9IHNlbXZlciQyO1xuY29uc3QgUmFuZ2UkOSA9IHJhbmdlO1xuXG5jb25zdCBSYW5nZSQ4ID0gcmFuZ2U7XG5jb25zdCBzYXRpc2ZpZXMkMyA9ICh2ZXJzaW9uLCByYW5nZSwgb3B0aW9ucykgPT4ge1xuICB0cnkge1xuICAgIHJhbmdlID0gbmV3IFJhbmdlJDgocmFuZ2UsIG9wdGlvbnMpO1xuICB9IGNhdGNoIChlcikge1xuICAgIHJldHVybiBmYWxzZVxuICB9XG4gIHJldHVybiByYW5nZS50ZXN0KHZlcnNpb24pXG59O1xudmFyIHNhdGlzZmllc18xID0gc2F0aXNmaWVzJDM7XG5cbmNvbnN0IFJhbmdlJDcgPSByYW5nZTtcblxuLy8gTW9zdGx5IGp1c3QgZm9yIHRlc3RpbmcgYW5kIGxlZ2FjeSBBUEkgcmVhc29uc1xuY29uc3QgdG9Db21wYXJhdG9ycyA9IChyYW5nZSwgb3B0aW9ucykgPT5cbiAgbmV3IFJhbmdlJDcocmFuZ2UsIG9wdGlvbnMpLnNldFxuICAgIC5tYXAoY29tcCA9PiBjb21wLm1hcChjID0+IGMudmFsdWUpLmpvaW4oJyAnKS50cmltKCkuc3BsaXQoJyAnKSk7XG5cbnZhciB0b0NvbXBhcmF0b3JzXzEgPSB0b0NvbXBhcmF0b3JzO1xuXG5jb25zdCBTZW1WZXIkMyA9IHNlbXZlciQyO1xuY29uc3QgUmFuZ2UkNiA9IHJhbmdlO1xuXG5jb25zdCBtYXhTYXRpc2Z5aW5nID0gKHZlcnNpb25zLCByYW5nZSwgb3B0aW9ucykgPT4ge1xuICBsZXQgbWF4ID0gbnVsbDtcbiAgbGV0IG1heFNWID0gbnVsbDtcbiAgbGV0IHJhbmdlT2JqID0gbnVsbDtcbiAgdHJ5IHtcbiAgICByYW5nZU9iaiA9IG5ldyBSYW5nZSQ2KHJhbmdlLCBvcHRpb25zKTtcbiAgfSBjYXRjaCAoZXIpIHtcbiAgICByZXR1cm4gbnVsbFxuICB9XG4gIHZlcnNpb25zLmZvckVhY2goKHYpID0+IHtcbiAgICBpZiAocmFuZ2VPYmoudGVzdCh2KSkge1xuICAgICAgLy8gc2F0aXNmaWVzKHYsIHJhbmdlLCBvcHRpb25zKVxuICAgICAgaWYgKCFtYXggfHwgbWF4U1YuY29tcGFyZSh2KSA9PT0gLTEpIHtcbiAgICAgICAgLy8gY29tcGFyZShtYXgsIHYsIHRydWUpXG4gICAgICAgIG1heCA9IHY7XG4gICAgICAgIG1heFNWID0gbmV3IFNlbVZlciQzKG1heCwgb3B0aW9ucyk7XG4gICAgICB9XG4gICAgfVxuICB9KTtcbiAgcmV0dXJuIG1heFxufTtcbnZhciBtYXhTYXRpc2Z5aW5nXzEgPSBtYXhTYXRpc2Z5aW5nO1xuXG5jb25zdCBTZW1WZXIkMiA9IHNlbXZlciQyO1xuY29uc3QgUmFuZ2UkNSA9IHJhbmdlO1xuY29uc3QgbWluU2F0aXNmeWluZyA9ICh2ZXJzaW9ucywgcmFuZ2UsIG9wdGlvbnMpID0+IHtcbiAgbGV0IG1pbiA9IG51bGw7XG4gIGxldCBtaW5TViA9IG51bGw7XG4gIGxldCByYW5nZU9iaiA9IG51bGw7XG4gIHRyeSB7XG4gICAgcmFuZ2VPYmogPSBuZXcgUmFuZ2UkNShyYW5nZSwgb3B0aW9ucyk7XG4gIH0gY2F0Y2ggKGVyKSB7XG4gICAgcmV0dXJuIG51bGxcbiAgfVxuICB2ZXJzaW9ucy5mb3JFYWNoKCh2KSA9PiB7XG4gICAgaWYgKHJhbmdlT2JqLnRlc3QodikpIHtcbiAgICAgIC8vIHNhdGlzZmllcyh2LCByYW5nZSwgb3B0aW9ucylcbiAgICAgIGlmICghbWluIHx8IG1pblNWLmNvbXBhcmUodikgPT09IDEpIHtcbiAgICAgICAgLy8gY29tcGFyZShtaW4sIHYsIHRydWUpXG4gICAgICAgIG1pbiA9IHY7XG4gICAgICAgIG1pblNWID0gbmV3IFNlbVZlciQyKG1pbiwgb3B0aW9ucyk7XG4gICAgICB9XG4gICAgfVxuICB9KTtcbiAgcmV0dXJuIG1pblxufTtcbnZhciBtaW5TYXRpc2Z5aW5nXzEgPSBtaW5TYXRpc2Z5aW5nO1xuXG5jb25zdCBTZW1WZXIkMSA9IHNlbXZlciQyO1xuY29uc3QgUmFuZ2UkNCA9IHJhbmdlO1xuY29uc3QgZ3QkMSA9IGd0XzE7XG5cbmNvbnN0IG1pblZlcnNpb24gPSAocmFuZ2UsIGxvb3NlKSA9PiB7XG4gIHJhbmdlID0gbmV3IFJhbmdlJDQocmFuZ2UsIGxvb3NlKTtcblxuICBsZXQgbWludmVyID0gbmV3IFNlbVZlciQxKCcwLjAuMCcpO1xuICBpZiAocmFuZ2UudGVzdChtaW52ZXIpKSB7XG4gICAgcmV0dXJuIG1pbnZlclxuICB9XG5cbiAgbWludmVyID0gbmV3IFNlbVZlciQxKCcwLjAuMC0wJyk7XG4gIGlmIChyYW5nZS50ZXN0KG1pbnZlcikpIHtcbiAgICByZXR1cm4gbWludmVyXG4gIH1cblxuICBtaW52ZXIgPSBudWxsO1xuICBmb3IgKGxldCBpID0gMDsgaSA8IHJhbmdlLnNldC5sZW5ndGg7ICsraSkge1xuICAgIGNvbnN0IGNvbXBhcmF0b3JzID0gcmFuZ2Uuc2V0W2ldO1xuXG4gICAgbGV0IHNldE1pbiA9IG51bGw7XG4gICAgY29tcGFyYXRvcnMuZm9yRWFjaCgoY29tcGFyYXRvcikgPT4ge1xuICAgICAgLy8gQ2xvbmUgdG8gYXZvaWQgbWFuaXB1bGF0aW5nIHRoZSBjb21wYXJhdG9yJ3Mgc2VtdmVyIG9iamVjdC5cbiAgICAgIGNvbnN0IGNvbXB2ZXIgPSBuZXcgU2VtVmVyJDEoY29tcGFyYXRvci5zZW12ZXIudmVyc2lvbik7XG4gICAgICBzd2l0Y2ggKGNvbXBhcmF0b3Iub3BlcmF0b3IpIHtcbiAgICAgICAgY2FzZSAnPic6XG4gICAgICAgICAgaWYgKGNvbXB2ZXIucHJlcmVsZWFzZS5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgIGNvbXB2ZXIucGF0Y2grKztcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29tcHZlci5wcmVyZWxlYXNlLnB1c2goMCk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGNvbXB2ZXIucmF3ID0gY29tcHZlci5mb3JtYXQoKTtcbiAgICAgICAgICAvKiBmYWxsdGhyb3VnaCAqL1xuICAgICAgICBjYXNlICcnOlxuICAgICAgICBjYXNlICc+PSc6XG4gICAgICAgICAgaWYgKCFzZXRNaW4gfHwgZ3QkMShjb21wdmVyLCBzZXRNaW4pKSB7XG4gICAgICAgICAgICBzZXRNaW4gPSBjb21wdmVyO1xuICAgICAgICAgIH1cbiAgICAgICAgICBicmVha1xuICAgICAgICBjYXNlICc8JzpcbiAgICAgICAgY2FzZSAnPD0nOlxuICAgICAgICAgIC8qIElnbm9yZSBtYXhpbXVtIHZlcnNpb25zICovXG4gICAgICAgICAgYnJlYWtcbiAgICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFVuZXhwZWN0ZWQgb3BlcmF0aW9uOiAke2NvbXBhcmF0b3Iub3BlcmF0b3J9YClcbiAgICAgIH1cbiAgICB9KTtcbiAgICBpZiAoc2V0TWluICYmICghbWludmVyIHx8IGd0JDEobWludmVyLCBzZXRNaW4pKSlcbiAgICAgIG1pbnZlciA9IHNldE1pbjtcbiAgfVxuXG4gIGlmIChtaW52ZXIgJiYgcmFuZ2UudGVzdChtaW52ZXIpKSB7XG4gICAgcmV0dXJuIG1pbnZlclxuICB9XG5cbiAgcmV0dXJuIG51bGxcbn07XG52YXIgbWluVmVyc2lvbl8xID0gbWluVmVyc2lvbjtcblxuY29uc3QgUmFuZ2UkMyA9IHJhbmdlO1xuY29uc3QgdmFsaWRSYW5nZSA9IChyYW5nZSwgb3B0aW9ucykgPT4ge1xuICB0cnkge1xuICAgIC8vIFJldHVybiAnKicgaW5zdGVhZCBvZiAnJyBzbyB0aGF0IHRydXRoaW5lc3Mgd29ya3MuXG4gICAgLy8gVGhpcyB3aWxsIHRocm93IGlmIGl0J3MgaW52YWxpZCBhbnl3YXlcbiAgICByZXR1cm4gbmV3IFJhbmdlJDMocmFuZ2UsIG9wdGlvbnMpLnJhbmdlIHx8ICcqJ1xuICB9IGNhdGNoIChlcikge1xuICAgIHJldHVybiBudWxsXG4gIH1cbn07XG52YXIgdmFsaWQgPSB2YWxpZFJhbmdlO1xuXG5jb25zdCBTZW1WZXIgPSBzZW12ZXIkMjtcbmNvbnN0IENvbXBhcmF0b3IkMSA9IGNvbXBhcmF0b3I7XG5jb25zdCB7QU5ZOiBBTlkkMX0gPSBDb21wYXJhdG9yJDE7XG5jb25zdCBSYW5nZSQyID0gcmFuZ2U7XG5jb25zdCBzYXRpc2ZpZXMkMiA9IHNhdGlzZmllc18xO1xuY29uc3QgZ3QgPSBndF8xO1xuY29uc3QgbHQgPSBsdF8xO1xuY29uc3QgbHRlID0gbHRlXzE7XG5jb25zdCBndGUgPSBndGVfMTtcblxuY29uc3Qgb3V0c2lkZSQyID0gKHZlcnNpb24sIHJhbmdlLCBoaWxvLCBvcHRpb25zKSA9PiB7XG4gIHZlcnNpb24gPSBuZXcgU2VtVmVyKHZlcnNpb24sIG9wdGlvbnMpO1xuICByYW5nZSA9IG5ldyBSYW5nZSQyKHJhbmdlLCBvcHRpb25zKTtcblxuICBsZXQgZ3RmbiwgbHRlZm4sIGx0Zm4sIGNvbXAsIGVjb21wO1xuICBzd2l0Y2ggKGhpbG8pIHtcbiAgICBjYXNlICc+JzpcbiAgICAgIGd0Zm4gPSBndDtcbiAgICAgIGx0ZWZuID0gbHRlO1xuICAgICAgbHRmbiA9IGx0O1xuICAgICAgY29tcCA9ICc+JztcbiAgICAgIGVjb21wID0gJz49JztcbiAgICAgIGJyZWFrXG4gICAgY2FzZSAnPCc6XG4gICAgICBndGZuID0gbHQ7XG4gICAgICBsdGVmbiA9IGd0ZTtcbiAgICAgIGx0Zm4gPSBndDtcbiAgICAgIGNvbXAgPSAnPCc7XG4gICAgICBlY29tcCA9ICc8PSc7XG4gICAgICBicmVha1xuICAgIGRlZmF1bHQ6XG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdNdXN0IHByb3ZpZGUgYSBoaWxvIHZhbCBvZiBcIjxcIiBvciBcIj5cIicpXG4gIH1cblxuICAvLyBJZiBpdCBzYXRpc2ZpZXMgdGhlIHJhbmdlIGl0IGlzIG5vdCBvdXRzaWRlXG4gIGlmIChzYXRpc2ZpZXMkMih2ZXJzaW9uLCByYW5nZSwgb3B0aW9ucykpIHtcbiAgICByZXR1cm4gZmFsc2VcbiAgfVxuXG4gIC8vIEZyb20gbm93IG9uLCB2YXJpYWJsZSB0ZXJtcyBhcmUgYXMgaWYgd2UncmUgaW4gXCJndHJcIiBtb2RlLlxuICAvLyBidXQgbm90ZSB0aGF0IGV2ZXJ5dGhpbmcgaXMgZmxpcHBlZCBmb3IgdGhlIFwibHRyXCIgZnVuY3Rpb24uXG5cbiAgZm9yIChsZXQgaSA9IDA7IGkgPCByYW5nZS5zZXQubGVuZ3RoOyArK2kpIHtcbiAgICBjb25zdCBjb21wYXJhdG9ycyA9IHJhbmdlLnNldFtpXTtcblxuICAgIGxldCBoaWdoID0gbnVsbDtcbiAgICBsZXQgbG93ID0gbnVsbDtcblxuICAgIGNvbXBhcmF0b3JzLmZvckVhY2goKGNvbXBhcmF0b3IpID0+IHtcbiAgICAgIGlmIChjb21wYXJhdG9yLnNlbXZlciA9PT0gQU5ZJDEpIHtcbiAgICAgICAgY29tcGFyYXRvciA9IG5ldyBDb21wYXJhdG9yJDEoJz49MC4wLjAnKTtcbiAgICAgIH1cbiAgICAgIGhpZ2ggPSBoaWdoIHx8IGNvbXBhcmF0b3I7XG4gICAgICBsb3cgPSBsb3cgfHwgY29tcGFyYXRvcjtcbiAgICAgIGlmIChndGZuKGNvbXBhcmF0b3Iuc2VtdmVyLCBoaWdoLnNlbXZlciwgb3B0aW9ucykpIHtcbiAgICAgICAgaGlnaCA9IGNvbXBhcmF0b3I7XG4gICAgICB9IGVsc2UgaWYgKGx0Zm4oY29tcGFyYXRvci5zZW12ZXIsIGxvdy5zZW12ZXIsIG9wdGlvbnMpKSB7XG4gICAgICAgIGxvdyA9IGNvbXBhcmF0b3I7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICAvLyBJZiB0aGUgZWRnZSB2ZXJzaW9uIGNvbXBhcmF0b3IgaGFzIGEgb3BlcmF0b3IgdGhlbiBvdXIgdmVyc2lvblxuICAgIC8vIGlzbid0IG91dHNpZGUgaXRcbiAgICBpZiAoaGlnaC5vcGVyYXRvciA9PT0gY29tcCB8fCBoaWdoLm9wZXJhdG9yID09PSBlY29tcCkge1xuICAgICAgcmV0dXJuIGZhbHNlXG4gICAgfVxuXG4gICAgLy8gSWYgdGhlIGxvd2VzdCB2ZXJzaW9uIGNvbXBhcmF0b3IgaGFzIGFuIG9wZXJhdG9yIGFuZCBvdXIgdmVyc2lvblxuICAgIC8vIGlzIGxlc3MgdGhhbiBpdCB0aGVuIGl0IGlzbid0IGhpZ2hlciB0aGFuIHRoZSByYW5nZVxuICAgIGlmICgoIWxvdy5vcGVyYXRvciB8fCBsb3cub3BlcmF0b3IgPT09IGNvbXApICYmXG4gICAgICAgIGx0ZWZuKHZlcnNpb24sIGxvdy5zZW12ZXIpKSB7XG4gICAgICByZXR1cm4gZmFsc2VcbiAgICB9IGVsc2UgaWYgKGxvdy5vcGVyYXRvciA9PT0gZWNvbXAgJiYgbHRmbih2ZXJzaW9uLCBsb3cuc2VtdmVyKSkge1xuICAgICAgcmV0dXJuIGZhbHNlXG4gICAgfVxuICB9XG4gIHJldHVybiB0cnVlXG59O1xuXG52YXIgb3V0c2lkZV8xID0gb3V0c2lkZSQyO1xuXG4vLyBEZXRlcm1pbmUgaWYgdmVyc2lvbiBpcyBncmVhdGVyIHRoYW4gYWxsIHRoZSB2ZXJzaW9ucyBwb3NzaWJsZSBpbiB0aGUgcmFuZ2UuXG5jb25zdCBvdXRzaWRlJDEgPSBvdXRzaWRlXzE7XG5jb25zdCBndHIgPSAodmVyc2lvbiwgcmFuZ2UsIG9wdGlvbnMpID0+IG91dHNpZGUkMSh2ZXJzaW9uLCByYW5nZSwgJz4nLCBvcHRpb25zKTtcbnZhciBndHJfMSA9IGd0cjtcblxuY29uc3Qgb3V0c2lkZSA9IG91dHNpZGVfMTtcbi8vIERldGVybWluZSBpZiB2ZXJzaW9uIGlzIGxlc3MgdGhhbiBhbGwgdGhlIHZlcnNpb25zIHBvc3NpYmxlIGluIHRoZSByYW5nZVxuY29uc3QgbHRyID0gKHZlcnNpb24sIHJhbmdlLCBvcHRpb25zKSA9PiBvdXRzaWRlKHZlcnNpb24sIHJhbmdlLCAnPCcsIG9wdGlvbnMpO1xudmFyIGx0cl8xID0gbHRyO1xuXG5jb25zdCBSYW5nZSQxID0gcmFuZ2U7XG5jb25zdCBpbnRlcnNlY3RzID0gKHIxLCByMiwgb3B0aW9ucykgPT4ge1xuICByMSA9IG5ldyBSYW5nZSQxKHIxLCBvcHRpb25zKTtcbiAgcjIgPSBuZXcgUmFuZ2UkMShyMiwgb3B0aW9ucyk7XG4gIHJldHVybiByMS5pbnRlcnNlY3RzKHIyKVxufTtcbnZhciBpbnRlcnNlY3RzXzEgPSBpbnRlcnNlY3RzO1xuXG4vLyBnaXZlbiBhIHNldCBvZiB2ZXJzaW9ucyBhbmQgYSByYW5nZSwgY3JlYXRlIGEgXCJzaW1wbGlmaWVkXCIgcmFuZ2Vcbi8vIHRoYXQgaW5jbHVkZXMgdGhlIHNhbWUgdmVyc2lvbnMgdGhhdCB0aGUgb3JpZ2luYWwgcmFuZ2UgZG9lc1xuLy8gSWYgdGhlIG9yaWdpbmFsIHJhbmdlIGlzIHNob3J0ZXIgdGhhbiB0aGUgc2ltcGxpZmllZCBvbmUsIHJldHVybiB0aGF0LlxuY29uc3Qgc2F0aXNmaWVzJDEgPSBzYXRpc2ZpZXNfMTtcbmNvbnN0IGNvbXBhcmUkMSA9IGNvbXBhcmVfMTtcbnZhciBzaW1wbGlmeSA9ICh2ZXJzaW9ucywgcmFuZ2UsIG9wdGlvbnMpID0+IHtcbiAgY29uc3Qgc2V0ID0gW107XG4gIGxldCBtaW4gPSBudWxsO1xuICBsZXQgcHJldiA9IG51bGw7XG4gIGNvbnN0IHYgPSB2ZXJzaW9ucy5zb3J0KChhLCBiKSA9PiBjb21wYXJlJDEoYSwgYiwgb3B0aW9ucykpO1xuICBmb3IgKGNvbnN0IHZlcnNpb24gb2Ygdikge1xuICAgIGNvbnN0IGluY2x1ZGVkID0gc2F0aXNmaWVzJDEodmVyc2lvbiwgcmFuZ2UsIG9wdGlvbnMpO1xuICAgIGlmIChpbmNsdWRlZCkge1xuICAgICAgcHJldiA9IHZlcnNpb247XG4gICAgICBpZiAoIW1pbilcbiAgICAgICAgbWluID0gdmVyc2lvbjtcbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKHByZXYpIHtcbiAgICAgICAgc2V0LnB1c2goW21pbiwgcHJldl0pO1xuICAgICAgfVxuICAgICAgcHJldiA9IG51bGw7XG4gICAgICBtaW4gPSBudWxsO1xuICAgIH1cbiAgfVxuICBpZiAobWluKVxuICAgIHNldC5wdXNoKFttaW4sIG51bGxdKTtcblxuICBjb25zdCByYW5nZXMgPSBbXTtcbiAgZm9yIChjb25zdCBbbWluLCBtYXhdIG9mIHNldCkge1xuICAgIGlmIChtaW4gPT09IG1heClcbiAgICAgIHJhbmdlcy5wdXNoKG1pbik7XG4gICAgZWxzZSBpZiAoIW1heCAmJiBtaW4gPT09IHZbMF0pXG4gICAgICByYW5nZXMucHVzaCgnKicpO1xuICAgIGVsc2UgaWYgKCFtYXgpXG4gICAgICByYW5nZXMucHVzaChgPj0ke21pbn1gKTtcbiAgICBlbHNlIGlmIChtaW4gPT09IHZbMF0pXG4gICAgICByYW5nZXMucHVzaChgPD0ke21heH1gKTtcbiAgICBlbHNlXG4gICAgICByYW5nZXMucHVzaChgJHttaW59IC0gJHttYXh9YCk7XG4gIH1cbiAgY29uc3Qgc2ltcGxpZmllZCA9IHJhbmdlcy5qb2luKCcgfHwgJyk7XG4gIGNvbnN0IG9yaWdpbmFsID0gdHlwZW9mIHJhbmdlLnJhdyA9PT0gJ3N0cmluZycgPyByYW5nZS5yYXcgOiBTdHJpbmcocmFuZ2UpO1xuICByZXR1cm4gc2ltcGxpZmllZC5sZW5ndGggPCBvcmlnaW5hbC5sZW5ndGggPyBzaW1wbGlmaWVkIDogcmFuZ2Vcbn07XG5cbmNvbnN0IFJhbmdlID0gcmFuZ2U7XG5jb25zdCBDb21wYXJhdG9yID0gY29tcGFyYXRvcjtcbmNvbnN0IHsgQU5ZIH0gPSBDb21wYXJhdG9yO1xuY29uc3Qgc2F0aXNmaWVzID0gc2F0aXNmaWVzXzE7XG5jb25zdCBjb21wYXJlID0gY29tcGFyZV8xO1xuXG4vLyBDb21wbGV4IHJhbmdlIGByMSB8fCByMiB8fCAuLi5gIGlzIGEgc3Vic2V0IG9mIGBSMSB8fCBSMiB8fCAuLi5gIGlmZjpcbi8vIC0gRXZlcnkgc2ltcGxlIHJhbmdlIGByMSwgcjIsIC4uLmAgaXMgYSBudWxsIHNldCwgT1Jcbi8vIC0gRXZlcnkgc2ltcGxlIHJhbmdlIGByMSwgcjIsIC4uLmAgd2hpY2ggaXMgbm90IGEgbnVsbCBzZXQgaXMgYSBzdWJzZXQgb2Zcbi8vICAgc29tZSBgUjEsIFIyLCAuLi5gXG4vL1xuLy8gU2ltcGxlIHJhbmdlIGBjMSBjMiAuLi5gIGlzIGEgc3Vic2V0IG9mIHNpbXBsZSByYW5nZSBgQzEgQzIgLi4uYCBpZmY6XG4vLyAtIElmIGMgaXMgb25seSB0aGUgQU5ZIGNvbXBhcmF0b3Jcbi8vICAgLSBJZiBDIGlzIG9ubHkgdGhlIEFOWSBjb21wYXJhdG9yLCByZXR1cm4gdHJ1ZVxuLy8gICAtIEVsc2UgaWYgaW4gcHJlcmVsZWFzZSBtb2RlLCByZXR1cm4gZmFsc2Vcbi8vICAgLSBlbHNlIHJlcGxhY2UgYyB3aXRoIGBbPj0wLjAuMF1gXG4vLyAtIElmIEMgaXMgb25seSB0aGUgQU5ZIGNvbXBhcmF0b3Jcbi8vICAgLSBpZiBpbiBwcmVyZWxlYXNlIG1vZGUsIHJldHVybiB0cnVlXG4vLyAgIC0gZWxzZSByZXBsYWNlIEMgd2l0aCBgWz49MC4wLjBdYFxuLy8gLSBMZXQgRVEgYmUgdGhlIHNldCBvZiA9IGNvbXBhcmF0b3JzIGluIGNcbi8vIC0gSWYgRVEgaXMgbW9yZSB0aGFuIG9uZSwgcmV0dXJuIHRydWUgKG51bGwgc2V0KVxuLy8gLSBMZXQgR1QgYmUgdGhlIGhpZ2hlc3QgPiBvciA+PSBjb21wYXJhdG9yIGluIGNcbi8vIC0gTGV0IExUIGJlIHRoZSBsb3dlc3QgPCBvciA8PSBjb21wYXJhdG9yIGluIGNcbi8vIC0gSWYgR1QgYW5kIExULCBhbmQgR1Quc2VtdmVyID4gTFQuc2VtdmVyLCByZXR1cm4gdHJ1ZSAobnVsbCBzZXQpXG4vLyAtIElmIGFueSBDIGlzIGEgPSByYW5nZSwgYW5kIEdUIG9yIExUIGFyZSBzZXQsIHJldHVybiBmYWxzZVxuLy8gLSBJZiBFUVxuLy8gICAtIElmIEdULCBhbmQgRVEgZG9lcyBub3Qgc2F0aXNmeSBHVCwgcmV0dXJuIHRydWUgKG51bGwgc2V0KVxuLy8gICAtIElmIExULCBhbmQgRVEgZG9lcyBub3Qgc2F0aXNmeSBMVCwgcmV0dXJuIHRydWUgKG51bGwgc2V0KVxuLy8gICAtIElmIEVRIHNhdGlzZmllcyBldmVyeSBDLCByZXR1cm4gdHJ1ZVxuLy8gICAtIEVsc2UgcmV0dXJuIGZhbHNlXG4vLyAtIElmIEdUXG4vLyAgIC0gSWYgR1Quc2VtdmVyIGlzIGxvd2VyIHRoYW4gYW55ID4gb3IgPj0gY29tcCBpbiBDLCByZXR1cm4gZmFsc2Vcbi8vICAgLSBJZiBHVCBpcyA+PSwgYW5kIEdULnNlbXZlciBkb2VzIG5vdCBzYXRpc2Z5IGV2ZXJ5IEMsIHJldHVybiBmYWxzZVxuLy8gICAtIElmIEdULnNlbXZlciBoYXMgYSBwcmVyZWxlYXNlLCBhbmQgbm90IGluIHByZXJlbGVhc2UgbW9kZVxuLy8gICAgIC0gSWYgbm8gQyBoYXMgYSBwcmVyZWxlYXNlIGFuZCB0aGUgR1Quc2VtdmVyIHR1cGxlLCByZXR1cm4gZmFsc2Vcbi8vIC0gSWYgTFRcbi8vICAgLSBJZiBMVC5zZW12ZXIgaXMgZ3JlYXRlciB0aGFuIGFueSA8IG9yIDw9IGNvbXAgaW4gQywgcmV0dXJuIGZhbHNlXG4vLyAgIC0gSWYgTFQgaXMgPD0sIGFuZCBMVC5zZW12ZXIgZG9lcyBub3Qgc2F0aXNmeSBldmVyeSBDLCByZXR1cm4gZmFsc2Vcbi8vICAgLSBJZiBHVC5zZW12ZXIgaGFzIGEgcHJlcmVsZWFzZSwgYW5kIG5vdCBpbiBwcmVyZWxlYXNlIG1vZGVcbi8vICAgICAtIElmIG5vIEMgaGFzIGEgcHJlcmVsZWFzZSBhbmQgdGhlIExULnNlbXZlciB0dXBsZSwgcmV0dXJuIGZhbHNlXG4vLyAtIEVsc2UgcmV0dXJuIHRydWVcblxuY29uc3Qgc3Vic2V0ID0gKHN1YiwgZG9tLCBvcHRpb25zID0ge30pID0+IHtcbiAgaWYgKHN1YiA9PT0gZG9tKVxuICAgIHJldHVybiB0cnVlXG5cbiAgc3ViID0gbmV3IFJhbmdlKHN1Yiwgb3B0aW9ucyk7XG4gIGRvbSA9IG5ldyBSYW5nZShkb20sIG9wdGlvbnMpO1xuICBsZXQgc2F3Tm9uTnVsbCA9IGZhbHNlO1xuXG4gIE9VVEVSOiBmb3IgKGNvbnN0IHNpbXBsZVN1YiBvZiBzdWIuc2V0KSB7XG4gICAgZm9yIChjb25zdCBzaW1wbGVEb20gb2YgZG9tLnNldCkge1xuICAgICAgY29uc3QgaXNTdWIgPSBzaW1wbGVTdWJzZXQoc2ltcGxlU3ViLCBzaW1wbGVEb20sIG9wdGlvbnMpO1xuICAgICAgc2F3Tm9uTnVsbCA9IHNhd05vbk51bGwgfHwgaXNTdWIgIT09IG51bGw7XG4gICAgICBpZiAoaXNTdWIpXG4gICAgICAgIGNvbnRpbnVlIE9VVEVSXG4gICAgfVxuICAgIC8vIHRoZSBudWxsIHNldCBpcyBhIHN1YnNldCBvZiBldmVyeXRoaW5nLCBidXQgbnVsbCBzaW1wbGUgcmFuZ2VzIGluXG4gICAgLy8gYSBjb21wbGV4IHJhbmdlIHNob3VsZCBiZSBpZ25vcmVkLiAgc28gaWYgd2Ugc2F3IGEgbm9uLW51bGwgcmFuZ2UsXG4gICAgLy8gdGhlbiB3ZSBrbm93IHRoaXMgaXNuJ3QgYSBzdWJzZXQsIGJ1dCBpZiBFVkVSWSBzaW1wbGUgcmFuZ2Ugd2FzIG51bGwsXG4gICAgLy8gdGhlbiBpdCBpcyBhIHN1YnNldC5cbiAgICBpZiAoc2F3Tm9uTnVsbClcbiAgICAgIHJldHVybiBmYWxzZVxuICB9XG4gIHJldHVybiB0cnVlXG59O1xuXG5jb25zdCBzaW1wbGVTdWJzZXQgPSAoc3ViLCBkb20sIG9wdGlvbnMpID0+IHtcbiAgaWYgKHN1YiA9PT0gZG9tKVxuICAgIHJldHVybiB0cnVlXG5cbiAgaWYgKHN1Yi5sZW5ndGggPT09IDEgJiYgc3ViWzBdLnNlbXZlciA9PT0gQU5ZKSB7XG4gICAgaWYgKGRvbS5sZW5ndGggPT09IDEgJiYgZG9tWzBdLnNlbXZlciA9PT0gQU5ZKVxuICAgICAgcmV0dXJuIHRydWVcbiAgICBlbHNlIGlmIChvcHRpb25zLmluY2x1ZGVQcmVyZWxlYXNlKVxuICAgICAgc3ViID0gWyBuZXcgQ29tcGFyYXRvcignPj0wLjAuMC0wJykgXTtcbiAgICBlbHNlXG4gICAgICBzdWIgPSBbIG5ldyBDb21wYXJhdG9yKCc+PTAuMC4wJykgXTtcbiAgfVxuXG4gIGlmIChkb20ubGVuZ3RoID09PSAxICYmIGRvbVswXS5zZW12ZXIgPT09IEFOWSkge1xuICAgIGlmIChvcHRpb25zLmluY2x1ZGVQcmVyZWxlYXNlKVxuICAgICAgcmV0dXJuIHRydWVcbiAgICBlbHNlXG4gICAgICBkb20gPSBbIG5ldyBDb21wYXJhdG9yKCc+PTAuMC4wJykgXTtcbiAgfVxuXG4gIGNvbnN0IGVxU2V0ID0gbmV3IFNldCgpO1xuICBsZXQgZ3QsIGx0O1xuICBmb3IgKGNvbnN0IGMgb2Ygc3ViKSB7XG4gICAgaWYgKGMub3BlcmF0b3IgPT09ICc+JyB8fCBjLm9wZXJhdG9yID09PSAnPj0nKVxuICAgICAgZ3QgPSBoaWdoZXJHVChndCwgYywgb3B0aW9ucyk7XG4gICAgZWxzZSBpZiAoYy5vcGVyYXRvciA9PT0gJzwnIHx8IGMub3BlcmF0b3IgPT09ICc8PScpXG4gICAgICBsdCA9IGxvd2VyTFQobHQsIGMsIG9wdGlvbnMpO1xuICAgIGVsc2VcbiAgICAgIGVxU2V0LmFkZChjLnNlbXZlcik7XG4gIH1cblxuICBpZiAoZXFTZXQuc2l6ZSA+IDEpXG4gICAgcmV0dXJuIG51bGxcblxuICBsZXQgZ3RsdENvbXA7XG4gIGlmIChndCAmJiBsdCkge1xuICAgIGd0bHRDb21wID0gY29tcGFyZShndC5zZW12ZXIsIGx0LnNlbXZlciwgb3B0aW9ucyk7XG4gICAgaWYgKGd0bHRDb21wID4gMClcbiAgICAgIHJldHVybiBudWxsXG4gICAgZWxzZSBpZiAoZ3RsdENvbXAgPT09IDAgJiYgKGd0Lm9wZXJhdG9yICE9PSAnPj0nIHx8IGx0Lm9wZXJhdG9yICE9PSAnPD0nKSlcbiAgICAgIHJldHVybiBudWxsXG4gIH1cblxuICAvLyB3aWxsIGl0ZXJhdGUgb25lIG9yIHplcm8gdGltZXNcbiAgZm9yIChjb25zdCBlcSBvZiBlcVNldCkge1xuICAgIGlmIChndCAmJiAhc2F0aXNmaWVzKGVxLCBTdHJpbmcoZ3QpLCBvcHRpb25zKSlcbiAgICAgIHJldHVybiBudWxsXG5cbiAgICBpZiAobHQgJiYgIXNhdGlzZmllcyhlcSwgU3RyaW5nKGx0KSwgb3B0aW9ucykpXG4gICAgICByZXR1cm4gbnVsbFxuXG4gICAgZm9yIChjb25zdCBjIG9mIGRvbSkge1xuICAgICAgaWYgKCFzYXRpc2ZpZXMoZXEsIFN0cmluZyhjKSwgb3B0aW9ucykpXG4gICAgICAgIHJldHVybiBmYWxzZVxuICAgIH1cblxuICAgIHJldHVybiB0cnVlXG4gIH1cblxuICBsZXQgaGlnaGVyLCBsb3dlcjtcbiAgbGV0IGhhc0RvbUxULCBoYXNEb21HVDtcbiAgLy8gaWYgdGhlIHN1YnNldCBoYXMgYSBwcmVyZWxlYXNlLCB3ZSBuZWVkIGEgY29tcGFyYXRvciBpbiB0aGUgc3VwZXJzZXRcbiAgLy8gd2l0aCB0aGUgc2FtZSB0dXBsZSBhbmQgYSBwcmVyZWxlYXNlLCBvciBpdCdzIG5vdCBhIHN1YnNldFxuICBsZXQgbmVlZERvbUxUUHJlID0gbHQgJiZcbiAgICAhb3B0aW9ucy5pbmNsdWRlUHJlcmVsZWFzZSAmJlxuICAgIGx0LnNlbXZlci5wcmVyZWxlYXNlLmxlbmd0aCA/IGx0LnNlbXZlciA6IGZhbHNlO1xuICBsZXQgbmVlZERvbUdUUHJlID0gZ3QgJiZcbiAgICAhb3B0aW9ucy5pbmNsdWRlUHJlcmVsZWFzZSAmJlxuICAgIGd0LnNlbXZlci5wcmVyZWxlYXNlLmxlbmd0aCA/IGd0LnNlbXZlciA6IGZhbHNlO1xuICAvLyBleGNlcHRpb246IDwxLjIuMy0wIGlzIHRoZSBzYW1lIGFzIDwxLjIuM1xuICBpZiAobmVlZERvbUxUUHJlICYmIG5lZWREb21MVFByZS5wcmVyZWxlYXNlLmxlbmd0aCA9PT0gMSAmJlxuICAgICAgbHQub3BlcmF0b3IgPT09ICc8JyAmJiBuZWVkRG9tTFRQcmUucHJlcmVsZWFzZVswXSA9PT0gMCkge1xuICAgIG5lZWREb21MVFByZSA9IGZhbHNlO1xuICB9XG5cbiAgZm9yIChjb25zdCBjIG9mIGRvbSkge1xuICAgIGhhc0RvbUdUID0gaGFzRG9tR1QgfHwgYy5vcGVyYXRvciA9PT0gJz4nIHx8IGMub3BlcmF0b3IgPT09ICc+PSc7XG4gICAgaGFzRG9tTFQgPSBoYXNEb21MVCB8fCBjLm9wZXJhdG9yID09PSAnPCcgfHwgYy5vcGVyYXRvciA9PT0gJzw9JztcbiAgICBpZiAoZ3QpIHtcbiAgICAgIGlmIChuZWVkRG9tR1RQcmUpIHtcbiAgICAgICAgaWYgKGMuc2VtdmVyLnByZXJlbGVhc2UgJiYgYy5zZW12ZXIucHJlcmVsZWFzZS5sZW5ndGggJiZcbiAgICAgICAgICAgIGMuc2VtdmVyLm1ham9yID09PSBuZWVkRG9tR1RQcmUubWFqb3IgJiZcbiAgICAgICAgICAgIGMuc2VtdmVyLm1pbm9yID09PSBuZWVkRG9tR1RQcmUubWlub3IgJiZcbiAgICAgICAgICAgIGMuc2VtdmVyLnBhdGNoID09PSBuZWVkRG9tR1RQcmUucGF0Y2gpIHtcbiAgICAgICAgICBuZWVkRG9tR1RQcmUgPSBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgaWYgKGMub3BlcmF0b3IgPT09ICc+JyB8fCBjLm9wZXJhdG9yID09PSAnPj0nKSB7XG4gICAgICAgIGhpZ2hlciA9IGhpZ2hlckdUKGd0LCBjLCBvcHRpb25zKTtcbiAgICAgICAgaWYgKGhpZ2hlciA9PT0gYyAmJiBoaWdoZXIgIT09IGd0KVxuICAgICAgICAgIHJldHVybiBmYWxzZVxuICAgICAgfSBlbHNlIGlmIChndC5vcGVyYXRvciA9PT0gJz49JyAmJiAhc2F0aXNmaWVzKGd0LnNlbXZlciwgU3RyaW5nKGMpLCBvcHRpb25zKSlcbiAgICAgICAgcmV0dXJuIGZhbHNlXG4gICAgfVxuICAgIGlmIChsdCkge1xuICAgICAgaWYgKG5lZWREb21MVFByZSkge1xuICAgICAgICBpZiAoYy5zZW12ZXIucHJlcmVsZWFzZSAmJiBjLnNlbXZlci5wcmVyZWxlYXNlLmxlbmd0aCAmJlxuICAgICAgICAgICAgYy5zZW12ZXIubWFqb3IgPT09IG5lZWREb21MVFByZS5tYWpvciAmJlxuICAgICAgICAgICAgYy5zZW12ZXIubWlub3IgPT09IG5lZWREb21MVFByZS5taW5vciAmJlxuICAgICAgICAgICAgYy5zZW12ZXIucGF0Y2ggPT09IG5lZWREb21MVFByZS5wYXRjaCkge1xuICAgICAgICAgIG5lZWREb21MVFByZSA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBpZiAoYy5vcGVyYXRvciA9PT0gJzwnIHx8IGMub3BlcmF0b3IgPT09ICc8PScpIHtcbiAgICAgICAgbG93ZXIgPSBsb3dlckxUKGx0LCBjLCBvcHRpb25zKTtcbiAgICAgICAgaWYgKGxvd2VyID09PSBjICYmIGxvd2VyICE9PSBsdClcbiAgICAgICAgICByZXR1cm4gZmFsc2VcbiAgICAgIH0gZWxzZSBpZiAobHQub3BlcmF0b3IgPT09ICc8PScgJiYgIXNhdGlzZmllcyhsdC5zZW12ZXIsIFN0cmluZyhjKSwgb3B0aW9ucykpXG4gICAgICAgIHJldHVybiBmYWxzZVxuICAgIH1cbiAgICBpZiAoIWMub3BlcmF0b3IgJiYgKGx0IHx8IGd0KSAmJiBndGx0Q29tcCAhPT0gMClcbiAgICAgIHJldHVybiBmYWxzZVxuICB9XG5cbiAgLy8gaWYgdGhlcmUgd2FzIGEgPCBvciA+LCBhbmQgbm90aGluZyBpbiB0aGUgZG9tLCB0aGVuIG11c3QgYmUgZmFsc2VcbiAgLy8gVU5MRVNTIGl0IHdhcyBsaW1pdGVkIGJ5IGFub3RoZXIgcmFuZ2UgaW4gdGhlIG90aGVyIGRpcmVjdGlvbi5cbiAgLy8gRWcsID4xLjAuMCA8MS4wLjEgaXMgc3RpbGwgYSBzdWJzZXQgb2YgPDIuMC4wXG4gIGlmIChndCAmJiBoYXNEb21MVCAmJiAhbHQgJiYgZ3RsdENvbXAgIT09IDApXG4gICAgcmV0dXJuIGZhbHNlXG5cbiAgaWYgKGx0ICYmIGhhc0RvbUdUICYmICFndCAmJiBndGx0Q29tcCAhPT0gMClcbiAgICByZXR1cm4gZmFsc2VcblxuICAvLyB3ZSBuZWVkZWQgYSBwcmVyZWxlYXNlIHJhbmdlIGluIGEgc3BlY2lmaWMgdHVwbGUsIGJ1dCBkaWRuJ3QgZ2V0IG9uZVxuICAvLyB0aGVuIHRoaXMgaXNuJ3QgYSBzdWJzZXQuICBlZyA+PTEuMi4zLXByZSBpcyBub3QgYSBzdWJzZXQgb2YgPj0xLjAuMCxcbiAgLy8gYmVjYXVzZSBpdCBpbmNsdWRlcyBwcmVyZWxlYXNlcyBpbiB0aGUgMS4yLjMgdHVwbGVcbiAgaWYgKG5lZWREb21HVFByZSB8fCBuZWVkRG9tTFRQcmUpXG4gICAgcmV0dXJuIGZhbHNlXG5cbiAgcmV0dXJuIHRydWVcbn07XG5cbi8vID49MS4yLjMgaXMgbG93ZXIgdGhhbiA+MS4yLjNcbmNvbnN0IGhpZ2hlckdUID0gKGEsIGIsIG9wdGlvbnMpID0+IHtcbiAgaWYgKCFhKVxuICAgIHJldHVybiBiXG4gIGNvbnN0IGNvbXAgPSBjb21wYXJlKGEuc2VtdmVyLCBiLnNlbXZlciwgb3B0aW9ucyk7XG4gIHJldHVybiBjb21wID4gMCA/IGFcbiAgICA6IGNvbXAgPCAwID8gYlxuICAgIDogYi5vcGVyYXRvciA9PT0gJz4nICYmIGEub3BlcmF0b3IgPT09ICc+PScgPyBiXG4gICAgOiBhXG59O1xuXG4vLyA8PTEuMi4zIGlzIGhpZ2hlciB0aGFuIDwxLjIuM1xuY29uc3QgbG93ZXJMVCA9IChhLCBiLCBvcHRpb25zKSA9PiB7XG4gIGlmICghYSlcbiAgICByZXR1cm4gYlxuICBjb25zdCBjb21wID0gY29tcGFyZShhLnNlbXZlciwgYi5zZW12ZXIsIG9wdGlvbnMpO1xuICByZXR1cm4gY29tcCA8IDAgPyBhXG4gICAgOiBjb21wID4gMCA/IGJcbiAgICA6IGIub3BlcmF0b3IgPT09ICc8JyAmJiBhLm9wZXJhdG9yID09PSAnPD0nID8gYlxuICAgIDogYVxufTtcblxudmFyIHN1YnNldF8xID0gc3Vic2V0O1xuXG4vLyBqdXN0IHByZS1sb2FkIGFsbCB0aGUgc3R1ZmYgdGhhdCBpbmRleC5qcyBsYXppbHkgZXhwb3J0c1xuY29uc3QgaW50ZXJuYWxSZSA9IHJlJDUuZXhwb3J0cztcbnZhciBzZW12ZXIkMSA9IHtcbiAgcmU6IGludGVybmFsUmUucmUsXG4gIHNyYzogaW50ZXJuYWxSZS5zcmMsXG4gIHRva2VuczogaW50ZXJuYWxSZS50LFxuICBTRU1WRVJfU1BFQ19WRVJTSU9OOiBjb25zdGFudHMuU0VNVkVSX1NQRUNfVkVSU0lPTixcbiAgU2VtVmVyOiBzZW12ZXIkMixcbiAgY29tcGFyZUlkZW50aWZpZXJzOiBpZGVudGlmaWVycy5jb21wYXJlSWRlbnRpZmllcnMsXG4gIHJjb21wYXJlSWRlbnRpZmllcnM6IGlkZW50aWZpZXJzLnJjb21wYXJlSWRlbnRpZmllcnMsXG4gIHBhcnNlOiBwYXJzZV8xLFxuICB2YWxpZDogdmFsaWRfMSxcbiAgY2xlYW46IGNsZWFuXzEsXG4gIGluYzogaW5jXzEsXG4gIGRpZmY6IGRpZmZfMSxcbiAgbWFqb3I6IG1ham9yXzEsXG4gIG1pbm9yOiBtaW5vcl8xLFxuICBwYXRjaDogcGF0Y2hfMSxcbiAgcHJlcmVsZWFzZTogcHJlcmVsZWFzZV8xLFxuICBjb21wYXJlOiBjb21wYXJlXzEsXG4gIHJjb21wYXJlOiByY29tcGFyZV8xLFxuICBjb21wYXJlTG9vc2U6IGNvbXBhcmVMb29zZV8xLFxuICBjb21wYXJlQnVpbGQ6IGNvbXBhcmVCdWlsZF8xLFxuICBzb3J0OiBzb3J0XzEsXG4gIHJzb3J0OiByc29ydF8xLFxuICBndDogZ3RfMSxcbiAgbHQ6IGx0XzEsXG4gIGVxOiBlcV8xLFxuICBuZXE6IG5lcV8xLFxuICBndGU6IGd0ZV8xLFxuICBsdGU6IGx0ZV8xLFxuICBjbXA6IGNtcF8xLFxuICBjb2VyY2U6IGNvZXJjZV8xLFxuICBDb21wYXJhdG9yOiBjb21wYXJhdG9yLFxuICBSYW5nZTogcmFuZ2UsXG4gIHNhdGlzZmllczogc2F0aXNmaWVzXzEsXG4gIHRvQ29tcGFyYXRvcnM6IHRvQ29tcGFyYXRvcnNfMSxcbiAgbWF4U2F0aXNmeWluZzogbWF4U2F0aXNmeWluZ18xLFxuICBtaW5TYXRpc2Z5aW5nOiBtaW5TYXRpc2Z5aW5nXzEsXG4gIG1pblZlcnNpb246IG1pblZlcnNpb25fMSxcbiAgdmFsaWRSYW5nZTogdmFsaWQsXG4gIG91dHNpZGU6IG91dHNpZGVfMSxcbiAgZ3RyOiBndHJfMSxcbiAgbHRyOiBsdHJfMSxcbiAgaW50ZXJzZWN0czogaW50ZXJzZWN0c18xLFxuICBzaW1wbGlmeVJhbmdlOiBzaW1wbGlmeSxcbiAgc3Vic2V0OiBzdWJzZXRfMSxcbn07XG5cbnZhciBzZW12ZXIgPSBzZW12ZXIkMTtcblxudmFyIGJ1aWx0aW5zID0gZnVuY3Rpb24gKHtcbiAgdmVyc2lvbiA9IHByb2Nlc3MudmVyc2lvbixcbiAgZXhwZXJpbWVudGFsID0gZmFsc2Vcbn0gPSB7fSkge1xuICB2YXIgY29yZU1vZHVsZXMgPSBbXG4gICAgJ2Fzc2VydCcsXG4gICAgJ2J1ZmZlcicsXG4gICAgJ2NoaWxkX3Byb2Nlc3MnLFxuICAgICdjbHVzdGVyJyxcbiAgICAnY29uc29sZScsXG4gICAgJ2NvbnN0YW50cycsXG4gICAgJ2NyeXB0bycsXG4gICAgJ2RncmFtJyxcbiAgICAnZG5zJyxcbiAgICAnZG9tYWluJyxcbiAgICAnZXZlbnRzJyxcbiAgICAnZnMnLFxuICAgICdodHRwJyxcbiAgICAnaHR0cHMnLFxuICAgICdtb2R1bGUnLFxuICAgICduZXQnLFxuICAgICdvcycsXG4gICAgJ3BhdGgnLFxuICAgICdwdW55Y29kZScsXG4gICAgJ3F1ZXJ5c3RyaW5nJyxcbiAgICAncmVhZGxpbmUnLFxuICAgICdyZXBsJyxcbiAgICAnc3RyZWFtJyxcbiAgICAnc3RyaW5nX2RlY29kZXInLFxuICAgICdzeXMnLFxuICAgICd0aW1lcnMnLFxuICAgICd0bHMnLFxuICAgICd0dHknLFxuICAgICd1cmwnLFxuICAgICd1dGlsJyxcbiAgICAndm0nLFxuICAgICd6bGliJ1xuICBdO1xuXG4gIGlmIChzZW12ZXIubHQodmVyc2lvbiwgJzYuMC4wJykpIGNvcmVNb2R1bGVzLnB1c2goJ2ZyZWVsaXN0Jyk7XG4gIGlmIChzZW12ZXIuZ3RlKHZlcnNpb24sICcxLjAuMCcpKSBjb3JlTW9kdWxlcy5wdXNoKCd2OCcpO1xuICBpZiAoc2VtdmVyLmd0ZSh2ZXJzaW9uLCAnMS4xLjAnKSkgY29yZU1vZHVsZXMucHVzaCgncHJvY2VzcycpO1xuICBpZiAoc2VtdmVyLmd0ZSh2ZXJzaW9uLCAnOC4wLjAnKSkgY29yZU1vZHVsZXMucHVzaCgnaW5zcGVjdG9yJyk7XG4gIGlmIChzZW12ZXIuZ3RlKHZlcnNpb24sICc4LjEuMCcpKSBjb3JlTW9kdWxlcy5wdXNoKCdhc3luY19ob29rcycpO1xuICBpZiAoc2VtdmVyLmd0ZSh2ZXJzaW9uLCAnOC40LjAnKSkgY29yZU1vZHVsZXMucHVzaCgnaHR0cDInKTtcbiAgaWYgKHNlbXZlci5ndGUodmVyc2lvbiwgJzguNS4wJykpIGNvcmVNb2R1bGVzLnB1c2goJ3BlcmZfaG9va3MnKTtcbiAgaWYgKHNlbXZlci5ndGUodmVyc2lvbiwgJzEwLjAuMCcpKSBjb3JlTW9kdWxlcy5wdXNoKCd0cmFjZV9ldmVudHMnKTtcblxuICBpZiAoXG4gICAgc2VtdmVyLmd0ZSh2ZXJzaW9uLCAnMTAuNS4wJykgJiZcbiAgICAoZXhwZXJpbWVudGFsIHx8IHNlbXZlci5ndGUodmVyc2lvbiwgJzEyLjAuMCcpKVxuICApIHtcbiAgICBjb3JlTW9kdWxlcy5wdXNoKCd3b3JrZXJfdGhyZWFkcycpO1xuICB9XG4gIGlmIChzZW12ZXIuZ3RlKHZlcnNpb24sICcxMi4xNi4wJykgJiYgZXhwZXJpbWVudGFsKSB7XG4gICAgY29yZU1vZHVsZXMucHVzaCgnd2FzaScpO1xuICB9XG4gIFxuICByZXR1cm4gY29yZU1vZHVsZXNcbn07XG5cbi8vIE1hbnVhbGx5IOKAnHRyZWUgc2hha2Vu4oCdIGZyb206XG5cbmNvbnN0IHJlYWRlciA9IHtyZWFkfTtcbmNvbnN0IHBhY2thZ2VKc29uUmVhZGVyID0gcmVhZGVyO1xuXG4vKipcbiAqIEBwYXJhbSB7c3RyaW5nfSBqc29uUGF0aFxuICogQHJldHVybnMge3tzdHJpbmc6IHN0cmluZ319XG4gKi9cbmZ1bmN0aW9uIHJlYWQoanNvblBhdGgpIHtcbiAgcmV0dXJuIGZpbmQocGF0aC5kaXJuYW1lKGpzb25QYXRoKSlcbn1cblxuLyoqXG4gKiBAcGFyYW0ge3N0cmluZ30gZGlyXG4gKiBAcmV0dXJucyB7e3N0cmluZzogc3RyaW5nfX1cbiAqL1xuZnVuY3Rpb24gZmluZChkaXIpIHtcbiAgdHJ5IHtcbiAgICBjb25zdCBzdHJpbmcgPSBmcy5yZWFkRmlsZVN5bmMoXG4gICAgICBwYXRoLnRvTmFtZXNwYWNlZFBhdGgocGF0aC5qb2luKGRpciwgJ3BhY2thZ2UuanNvbicpKSxcbiAgICAgICd1dGY4J1xuICAgICk7XG4gICAgcmV0dXJuIHtzdHJpbmd9XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgaWYgKGVycm9yLmNvZGUgPT09ICdFTk9FTlQnKSB7XG4gICAgICBjb25zdCBwYXJlbnQgPSBwYXRoLmRpcm5hbWUoZGlyKTtcbiAgICAgIGlmIChkaXIgIT09IHBhcmVudCkgcmV0dXJuIGZpbmQocGFyZW50KVxuICAgICAgcmV0dXJuIHtzdHJpbmc6IHVuZGVmaW5lZH1cbiAgICAgIC8vIFRocm93IGFsbCBvdGhlciBlcnJvcnMuXG4gICAgICAvKiBjOCBpZ25vcmUgbmV4dCA0ICovXG4gICAgfVxuXG4gICAgdGhyb3cgZXJyb3JcbiAgfVxufVxuXG4vLyBNYW51YWxseSDigJx0cmVlIHNoYWtlbuKAnSBmcm9tOlxuXG5jb25zdCBpc1dpbmRvd3MgPSBwcm9jZXNzLnBsYXRmb3JtID09PSAnd2luMzInO1xuXG5jb25zdCBvd24kMSA9IHt9Lmhhc093blByb3BlcnR5O1xuXG5jb25zdCBjb2RlcyA9IHt9O1xuXG4vKipcbiAqIEB0eXBlZGVmIHsoLi4uYXJnczogdW5rbm93bltdKSA9PiBzdHJpbmd9IE1lc3NhZ2VGdW5jdGlvblxuICovXG5cbi8qKiBAdHlwZSB7TWFwPHN0cmluZywgTWVzc2FnZUZ1bmN0aW9ufHN0cmluZz59ICovXG5jb25zdCBtZXNzYWdlcyA9IG5ldyBNYXAoKTtcbmNvbnN0IG5vZGVJbnRlcm5hbFByZWZpeCA9ICdfX25vZGVfaW50ZXJuYWxfJztcbi8qKiBAdHlwZSB7bnVtYmVyfSAqL1xubGV0IHVzZXJTdGFja1RyYWNlTGltaXQ7XG5cbmNvZGVzLkVSUl9JTlZBTElEX01PRFVMRV9TUEVDSUZJRVIgPSBjcmVhdGVFcnJvcihcbiAgJ0VSUl9JTlZBTElEX01PRFVMRV9TUEVDSUZJRVInLFxuICAvKipcbiAgICogQHBhcmFtIHtzdHJpbmd9IHJlcXVlc3RcbiAgICogQHBhcmFtIHtzdHJpbmd9IHJlYXNvblxuICAgKiBAcGFyYW0ge3N0cmluZ30gW2Jhc2VdXG4gICAqL1xuICAocmVxdWVzdCwgcmVhc29uLCBiYXNlID0gdW5kZWZpbmVkKSA9PiB7XG4gICAgcmV0dXJuIGBJbnZhbGlkIG1vZHVsZSBcIiR7cmVxdWVzdH1cIiAke3JlYXNvbn0ke1xuICAgICAgYmFzZSA/IGAgaW1wb3J0ZWQgZnJvbSAke2Jhc2V9YCA6ICcnXG4gICAgfWBcbiAgfSxcbiAgVHlwZUVycm9yXG4pO1xuXG5jb2Rlcy5FUlJfSU5WQUxJRF9QQUNLQUdFX0NPTkZJRyA9IGNyZWF0ZUVycm9yKFxuICAnRVJSX0lOVkFMSURfUEFDS0FHRV9DT05GSUcnLFxuICAvKipcbiAgICogQHBhcmFtIHtzdHJpbmd9IHBhdGhcbiAgICogQHBhcmFtIHtzdHJpbmd9IFtiYXNlXVxuICAgKiBAcGFyYW0ge3N0cmluZ30gW21lc3NhZ2VdXG4gICAqL1xuICAocGF0aCwgYmFzZSwgbWVzc2FnZSkgPT4ge1xuICAgIHJldHVybiBgSW52YWxpZCBwYWNrYWdlIGNvbmZpZyAke3BhdGh9JHtcbiAgICAgIGJhc2UgPyBgIHdoaWxlIGltcG9ydGluZyAke2Jhc2V9YCA6ICcnXG4gICAgfSR7bWVzc2FnZSA/IGAuICR7bWVzc2FnZX1gIDogJyd9YFxuICB9LFxuICBFcnJvclxuKTtcblxuY29kZXMuRVJSX0lOVkFMSURfUEFDS0FHRV9UQVJHRVQgPSBjcmVhdGVFcnJvcihcbiAgJ0VSUl9JTlZBTElEX1BBQ0tBR0VfVEFSR0VUJyxcbiAgLyoqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBwa2dQYXRoXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBrZXlcbiAgICogQHBhcmFtIHt1bmtub3dufSB0YXJnZXRcbiAgICogQHBhcmFtIHtib29sZWFufSBbaXNJbXBvcnQ9ZmFsc2VdXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBbYmFzZV1cbiAgICovXG4gIChwa2dQYXRoLCBrZXksIHRhcmdldCwgaXNJbXBvcnQgPSBmYWxzZSwgYmFzZSA9IHVuZGVmaW5lZCkgPT4ge1xuICAgIGNvbnN0IHJlbEVycm9yID1cbiAgICAgIHR5cGVvZiB0YXJnZXQgPT09ICdzdHJpbmcnICYmXG4gICAgICAhaXNJbXBvcnQgJiZcbiAgICAgIHRhcmdldC5sZW5ndGggPiAwICYmXG4gICAgICAhdGFyZ2V0LnN0YXJ0c1dpdGgoJy4vJyk7XG4gICAgaWYgKGtleSA9PT0gJy4nKSB7XG4gICAgICBhc3NlcnQoaXNJbXBvcnQgPT09IGZhbHNlKTtcbiAgICAgIHJldHVybiAoXG4gICAgICAgIGBJbnZhbGlkIFwiZXhwb3J0c1wiIG1haW4gdGFyZ2V0ICR7SlNPTi5zdHJpbmdpZnkodGFyZ2V0KX0gZGVmaW5lZCBgICtcbiAgICAgICAgYGluIHRoZSBwYWNrYWdlIGNvbmZpZyAke3BrZ1BhdGh9cGFja2FnZS5qc29uJHtcbiAgICAgICAgICBiYXNlID8gYCBpbXBvcnRlZCBmcm9tICR7YmFzZX1gIDogJydcbiAgICAgICAgfSR7cmVsRXJyb3IgPyAnOyB0YXJnZXRzIG11c3Qgc3RhcnQgd2l0aCBcIi4vXCInIDogJyd9YFxuICAgICAgKVxuICAgIH1cblxuICAgIHJldHVybiBgSW52YWxpZCBcIiR7XG4gICAgICBpc0ltcG9ydCA/ICdpbXBvcnRzJyA6ICdleHBvcnRzJ1xuICAgIH1cIiB0YXJnZXQgJHtKU09OLnN0cmluZ2lmeShcbiAgICAgIHRhcmdldFxuICAgICl9IGRlZmluZWQgZm9yICcke2tleX0nIGluIHRoZSBwYWNrYWdlIGNvbmZpZyAke3BrZ1BhdGh9cGFja2FnZS5qc29uJHtcbiAgICAgIGJhc2UgPyBgIGltcG9ydGVkIGZyb20gJHtiYXNlfWAgOiAnJ1xuICAgIH0ke3JlbEVycm9yID8gJzsgdGFyZ2V0cyBtdXN0IHN0YXJ0IHdpdGggXCIuL1wiJyA6ICcnfWBcbiAgfSxcbiAgRXJyb3Jcbik7XG5cbmNvZGVzLkVSUl9NT0RVTEVfTk9UX0ZPVU5EID0gY3JlYXRlRXJyb3IoXG4gICdFUlJfTU9EVUxFX05PVF9GT1VORCcsXG4gIC8qKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gcGF0aFxuICAgKiBAcGFyYW0ge3N0cmluZ30gYmFzZVxuICAgKiBAcGFyYW0ge3N0cmluZ30gW3R5cGVdXG4gICAqL1xuICAocGF0aCwgYmFzZSwgdHlwZSA9ICdwYWNrYWdlJykgPT4ge1xuICAgIHJldHVybiBgQ2Fubm90IGZpbmQgJHt0eXBlfSAnJHtwYXRofScgaW1wb3J0ZWQgZnJvbSAke2Jhc2V9YFxuICB9LFxuICBFcnJvclxuKTtcblxuY29kZXMuRVJSX1BBQ0tBR0VfSU1QT1JUX05PVF9ERUZJTkVEID0gY3JlYXRlRXJyb3IoXG4gICdFUlJfUEFDS0FHRV9JTVBPUlRfTk9UX0RFRklORUQnLFxuICAvKipcbiAgICogQHBhcmFtIHtzdHJpbmd9IHNwZWNpZmllclxuICAgKiBAcGFyYW0ge3N0cmluZ30gcGFja2FnZVBhdGhcbiAgICogQHBhcmFtIHtzdHJpbmd9IGJhc2VcbiAgICovXG4gIChzcGVjaWZpZXIsIHBhY2thZ2VQYXRoLCBiYXNlKSA9PiB7XG4gICAgcmV0dXJuIGBQYWNrYWdlIGltcG9ydCBzcGVjaWZpZXIgXCIke3NwZWNpZmllcn1cIiBpcyBub3QgZGVmaW5lZCR7XG4gICAgICBwYWNrYWdlUGF0aCA/IGAgaW4gcGFja2FnZSAke3BhY2thZ2VQYXRofXBhY2thZ2UuanNvbmAgOiAnJ1xuICAgIH0gaW1wb3J0ZWQgZnJvbSAke2Jhc2V9YFxuICB9LFxuICBUeXBlRXJyb3Jcbik7XG5cbmNvZGVzLkVSUl9QQUNLQUdFX1BBVEhfTk9UX0VYUE9SVEVEID0gY3JlYXRlRXJyb3IoXG4gICdFUlJfUEFDS0FHRV9QQVRIX05PVF9FWFBPUlRFRCcsXG4gIC8qKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gcGtnUGF0aFxuICAgKiBAcGFyYW0ge3N0cmluZ30gc3VicGF0aFxuICAgKiBAcGFyYW0ge3N0cmluZ30gW2Jhc2VdXG4gICAqL1xuICAocGtnUGF0aCwgc3VicGF0aCwgYmFzZSA9IHVuZGVmaW5lZCkgPT4ge1xuICAgIGlmIChzdWJwYXRoID09PSAnLicpXG4gICAgICByZXR1cm4gYE5vIFwiZXhwb3J0c1wiIG1haW4gZGVmaW5lZCBpbiAke3BrZ1BhdGh9cGFja2FnZS5qc29uJHtcbiAgICAgICAgYmFzZSA/IGAgaW1wb3J0ZWQgZnJvbSAke2Jhc2V9YCA6ICcnXG4gICAgICB9YFxuICAgIHJldHVybiBgUGFja2FnZSBzdWJwYXRoICcke3N1YnBhdGh9JyBpcyBub3QgZGVmaW5lZCBieSBcImV4cG9ydHNcIiBpbiAke3BrZ1BhdGh9cGFja2FnZS5qc29uJHtcbiAgICAgIGJhc2UgPyBgIGltcG9ydGVkIGZyb20gJHtiYXNlfWAgOiAnJ1xuICAgIH1gXG4gIH0sXG4gIEVycm9yXG4pO1xuXG5jb2Rlcy5FUlJfVU5TVVBQT1JURURfRElSX0lNUE9SVCA9IGNyZWF0ZUVycm9yKFxuICAnRVJSX1VOU1VQUE9SVEVEX0RJUl9JTVBPUlQnLFxuICBcIkRpcmVjdG9yeSBpbXBvcnQgJyVzJyBpcyBub3Qgc3VwcG9ydGVkIFwiICtcbiAgICAncmVzb2x2aW5nIEVTIG1vZHVsZXMgaW1wb3J0ZWQgZnJvbSAlcycsXG4gIEVycm9yXG4pO1xuXG5jb2Rlcy5FUlJfVU5LTk9XTl9GSUxFX0VYVEVOU0lPTiA9IGNyZWF0ZUVycm9yKFxuICAnRVJSX1VOS05PV05fRklMRV9FWFRFTlNJT04nLFxuICAnVW5rbm93biBmaWxlIGV4dGVuc2lvbiBcIiVzXCIgZm9yICVzJyxcbiAgVHlwZUVycm9yXG4pO1xuXG5jb2Rlcy5FUlJfSU5WQUxJRF9BUkdfVkFMVUUgPSBjcmVhdGVFcnJvcihcbiAgJ0VSUl9JTlZBTElEX0FSR19WQUxVRScsXG4gIC8qKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gbmFtZVxuICAgKiBAcGFyYW0ge3Vua25vd259IHZhbHVlXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBbcmVhc29uPSdpcyBpbnZhbGlkJ11cbiAgICovXG4gIChuYW1lLCB2YWx1ZSwgcmVhc29uID0gJ2lzIGludmFsaWQnKSA9PiB7XG4gICAgbGV0IGluc3BlY3RlZCA9IGluc3BlY3QodmFsdWUpO1xuXG4gICAgaWYgKGluc3BlY3RlZC5sZW5ndGggPiAxMjgpIHtcbiAgICAgIGluc3BlY3RlZCA9IGAke2luc3BlY3RlZC5zbGljZSgwLCAxMjgpfS4uLmA7XG4gICAgfVxuXG4gICAgY29uc3QgdHlwZSA9IG5hbWUuaW5jbHVkZXMoJy4nKSA/ICdwcm9wZXJ0eScgOiAnYXJndW1lbnQnO1xuXG4gICAgcmV0dXJuIGBUaGUgJHt0eXBlfSAnJHtuYW1lfScgJHtyZWFzb259LiBSZWNlaXZlZCAke2luc3BlY3RlZH1gXG4gIH0sXG4gIFR5cGVFcnJvclxuICAvLyBOb3RlOiBleHRyYSBjbGFzc2VzIGhhdmUgYmVlbiBzaGFrZW4gb3V0LlxuICAvLyAsIFJhbmdlRXJyb3Jcbik7XG5cbmNvZGVzLkVSUl9VTlNVUFBPUlRFRF9FU01fVVJMX1NDSEVNRSA9IGNyZWF0ZUVycm9yKFxuICAnRVJSX1VOU1VQUE9SVEVEX0VTTV9VUkxfU0NIRU1FJyxcbiAgLyoqXG4gICAqIEBwYXJhbSB7VVJMfSB1cmxcbiAgICovXG4gICh1cmwpID0+IHtcbiAgICBsZXQgbWVzc2FnZSA9XG4gICAgICAnT25seSBmaWxlIGFuZCBkYXRhIFVSTHMgYXJlIHN1cHBvcnRlZCBieSB0aGUgZGVmYXVsdCBFU00gbG9hZGVyJztcblxuICAgIGlmIChpc1dpbmRvd3MgJiYgdXJsLnByb3RvY29sLmxlbmd0aCA9PT0gMikge1xuICAgICAgbWVzc2FnZSArPSAnLiBPbiBXaW5kb3dzLCBhYnNvbHV0ZSBwYXRocyBtdXN0IGJlIHZhbGlkIGZpbGU6Ly8gVVJMcyc7XG4gICAgfVxuXG4gICAgbWVzc2FnZSArPSBgLiBSZWNlaXZlZCBwcm90b2NvbCAnJHt1cmwucHJvdG9jb2x9J2A7XG4gICAgcmV0dXJuIG1lc3NhZ2VcbiAgfSxcbiAgRXJyb3Jcbik7XG5cbi8qKlxuICogVXRpbGl0eSBmdW5jdGlvbiBmb3IgcmVnaXN0ZXJpbmcgdGhlIGVycm9yIGNvZGVzLiBPbmx5IHVzZWQgaGVyZS4gRXhwb3J0ZWRcbiAqICpvbmx5KiB0byBhbGxvdyBmb3IgdGVzdGluZy5cbiAqIEBwYXJhbSB7c3RyaW5nfSBzeW1cbiAqIEBwYXJhbSB7TWVzc2FnZUZ1bmN0aW9ufHN0cmluZ30gdmFsdWVcbiAqIEBwYXJhbSB7RXJyb3JDb25zdHJ1Y3Rvcn0gZGVmXG4gKiBAcmV0dXJucyB7bmV3ICguLi5hcmdzOiB1bmtub3duW10pID0+IEVycm9yfVxuICovXG5mdW5jdGlvbiBjcmVhdGVFcnJvcihzeW0sIHZhbHVlLCBkZWYpIHtcbiAgLy8gU3BlY2lhbCBjYXNlIGZvciBTeXN0ZW1FcnJvciB0aGF0IGZvcm1hdHMgdGhlIGVycm9yIG1lc3NhZ2UgZGlmZmVyZW50bHlcbiAgLy8gVGhlIFN5c3RlbUVycm9ycyBvbmx5IGhhdmUgU3lzdGVtRXJyb3IgYXMgdGhlaXIgYmFzZSBjbGFzc2VzLlxuICBtZXNzYWdlcy5zZXQoc3ltLCB2YWx1ZSk7XG5cbiAgcmV0dXJuIG1ha2VOb2RlRXJyb3JXaXRoQ29kZShkZWYsIHN5bSlcbn1cblxuLyoqXG4gKiBAcGFyYW0ge0Vycm9yQ29uc3RydWN0b3J9IEJhc2VcbiAqIEBwYXJhbSB7c3RyaW5nfSBrZXlcbiAqIEByZXR1cm5zIHtFcnJvckNvbnN0cnVjdG9yfVxuICovXG5mdW5jdGlvbiBtYWtlTm9kZUVycm9yV2l0aENvZGUoQmFzZSwga2V5KSB7XG4gIC8vIEB0cy1leHBlY3QtZXJyb3IgSXTigJlzIGEgTm9kZSBlcnJvci5cbiAgcmV0dXJuIE5vZGVFcnJvclxuICAvKipcbiAgICogQHBhcmFtIHt1bmtub3duW119IGFyZ3NcbiAgICovXG4gIGZ1bmN0aW9uIE5vZGVFcnJvciguLi5hcmdzKSB7XG4gICAgY29uc3QgbGltaXQgPSBFcnJvci5zdGFja1RyYWNlTGltaXQ7XG4gICAgaWYgKGlzRXJyb3JTdGFja1RyYWNlTGltaXRXcml0YWJsZSgpKSBFcnJvci5zdGFja1RyYWNlTGltaXQgPSAwO1xuICAgIGNvbnN0IGVycm9yID0gbmV3IEJhc2UoKTtcbiAgICAvLyBSZXNldCB0aGUgbGltaXQgYW5kIHNldHRpbmcgdGhlIG5hbWUgcHJvcGVydHkuXG4gICAgaWYgKGlzRXJyb3JTdGFja1RyYWNlTGltaXRXcml0YWJsZSgpKSBFcnJvci5zdGFja1RyYWNlTGltaXQgPSBsaW1pdDtcbiAgICBjb25zdCBtZXNzYWdlID0gZ2V0TWVzc2FnZShrZXksIGFyZ3MsIGVycm9yKTtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoZXJyb3IsICdtZXNzYWdlJywge1xuICAgICAgdmFsdWU6IG1lc3NhZ2UsXG4gICAgICBlbnVtZXJhYmxlOiBmYWxzZSxcbiAgICAgIHdyaXRhYmxlOiB0cnVlLFxuICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgfSk7XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KGVycm9yLCAndG9TdHJpbmcnLCB7XG4gICAgICAvKiogQHRoaXMge0Vycm9yfSAqL1xuICAgICAgdmFsdWUoKSB7XG4gICAgICAgIHJldHVybiBgJHt0aGlzLm5hbWV9IFske2tleX1dOiAke3RoaXMubWVzc2FnZX1gXG4gICAgICB9LFxuICAgICAgZW51bWVyYWJsZTogZmFsc2UsXG4gICAgICB3cml0YWJsZTogdHJ1ZSxcbiAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgIH0pO1xuICAgIGFkZENvZGVUb05hbWUoZXJyb3IsIEJhc2UubmFtZSwga2V5KTtcbiAgICAvLyBAdHMtZXhwZWN0LWVycm9yIEl04oCZcyBhIE5vZGUgZXJyb3IuXG4gICAgZXJyb3IuY29kZSA9IGtleTtcbiAgICByZXR1cm4gZXJyb3JcbiAgfVxufVxuXG5jb25zdCBhZGRDb2RlVG9OYW1lID0gaGlkZVN0YWNrRnJhbWVzKFxuICAvKipcbiAgICogQHBhcmFtIHtFcnJvcn0gZXJyb3JcbiAgICogQHBhcmFtIHtzdHJpbmd9IG5hbWVcbiAgICogQHBhcmFtIHtzdHJpbmd9IGNvZGVcbiAgICogQHJldHVybnMge3ZvaWR9XG4gICAqL1xuICBmdW5jdGlvbiAoZXJyb3IsIG5hbWUsIGNvZGUpIHtcbiAgICAvLyBTZXQgdGhlIHN0YWNrXG4gICAgZXJyb3IgPSBjYXB0dXJlTGFyZ2VyU3RhY2tUcmFjZShlcnJvcik7XG4gICAgLy8gQWRkIHRoZSBlcnJvciBjb2RlIHRvIHRoZSBuYW1lIHRvIGluY2x1ZGUgaXQgaW4gdGhlIHN0YWNrIHRyYWNlLlxuICAgIGVycm9yLm5hbWUgPSBgJHtuYW1lfSBbJHtjb2RlfV1gO1xuICAgIC8vIEFjY2VzcyB0aGUgc3RhY2sgdG8gZ2VuZXJhdGUgdGhlIGVycm9yIG1lc3NhZ2UgaW5jbHVkaW5nIHRoZSBlcnJvciBjb2RlXG4gICAgLy8gZnJvbSB0aGUgbmFtZS5cbiAgICBlcnJvci5zdGFjazsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby11bnVzZWQtZXhwcmVzc2lvbnNcbiAgICAvLyBSZXNldCB0aGUgbmFtZSB0byB0aGUgYWN0dWFsIG5hbWUuXG4gICAgaWYgKG5hbWUgPT09ICdTeXN0ZW1FcnJvcicpIHtcbiAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShlcnJvciwgJ25hbWUnLCB7XG4gICAgICAgIHZhbHVlOiBuYW1lLFxuICAgICAgICBlbnVtZXJhYmxlOiBmYWxzZSxcbiAgICAgICAgd3JpdGFibGU6IHRydWUsXG4gICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgICAgfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGRlbGV0ZSBlcnJvci5uYW1lO1xuICAgIH1cbiAgfVxuKTtcblxuLyoqXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAqL1xuZnVuY3Rpb24gaXNFcnJvclN0YWNrVHJhY2VMaW1pdFdyaXRhYmxlKCkge1xuICBjb25zdCBkZXNjID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihFcnJvciwgJ3N0YWNrVHJhY2VMaW1pdCcpO1xuICBpZiAoZGVzYyA9PT0gdW5kZWZpbmVkKSB7XG4gICAgcmV0dXJuIE9iamVjdC5pc0V4dGVuc2libGUoRXJyb3IpXG4gIH1cblxuICByZXR1cm4gb3duJDEuY2FsbChkZXNjLCAnd3JpdGFibGUnKSA/IGRlc2Mud3JpdGFibGUgOiBkZXNjLnNldCAhPT0gdW5kZWZpbmVkXG59XG5cbi8qKlxuICogVGhpcyBmdW5jdGlvbiByZW1vdmVzIHVubmVjZXNzYXJ5IGZyYW1lcyBmcm9tIE5vZGUuanMgY29yZSBlcnJvcnMuXG4gKiBAdGVtcGxhdGUgeyguLi5hcmdzOiB1bmtub3duW10pID0+IHVua25vd259IFRcbiAqIEB0eXBlIHsoZm46IFQpID0+IFR9XG4gKi9cbmZ1bmN0aW9uIGhpZGVTdGFja0ZyYW1lcyhmbikge1xuICAvLyBXZSByZW5hbWUgdGhlIGZ1bmN0aW9ucyB0aGF0IHdpbGwgYmUgaGlkZGVuIHRvIGN1dCBvZmYgdGhlIHN0YWNrdHJhY2VcbiAgLy8gYXQgdGhlIG91dGVybW9zdCBvbmVcbiAgY29uc3QgaGlkZGVuID0gbm9kZUludGVybmFsUHJlZml4ICsgZm4ubmFtZTtcbiAgT2JqZWN0LmRlZmluZVByb3BlcnR5KGZuLCAnbmFtZScsIHt2YWx1ZTogaGlkZGVufSk7XG4gIHJldHVybiBmblxufVxuXG5jb25zdCBjYXB0dXJlTGFyZ2VyU3RhY2tUcmFjZSA9IGhpZGVTdGFja0ZyYW1lcyhcbiAgLyoqXG4gICAqIEBwYXJhbSB7RXJyb3J9IGVycm9yXG4gICAqIEByZXR1cm5zIHtFcnJvcn1cbiAgICovXG4gIGZ1bmN0aW9uIChlcnJvcikge1xuICAgIGNvbnN0IHN0YWNrVHJhY2VMaW1pdElzV3JpdGFibGUgPSBpc0Vycm9yU3RhY2tUcmFjZUxpbWl0V3JpdGFibGUoKTtcbiAgICBpZiAoc3RhY2tUcmFjZUxpbWl0SXNXcml0YWJsZSkge1xuICAgICAgdXNlclN0YWNrVHJhY2VMaW1pdCA9IEVycm9yLnN0YWNrVHJhY2VMaW1pdDtcbiAgICAgIEVycm9yLnN0YWNrVHJhY2VMaW1pdCA9IE51bWJlci5QT1NJVElWRV9JTkZJTklUWTtcbiAgICB9XG5cbiAgICBFcnJvci5jYXB0dXJlU3RhY2tUcmFjZShlcnJvcik7XG5cbiAgICAvLyBSZXNldCB0aGUgbGltaXRcbiAgICBpZiAoc3RhY2tUcmFjZUxpbWl0SXNXcml0YWJsZSkgRXJyb3Iuc3RhY2tUcmFjZUxpbWl0ID0gdXNlclN0YWNrVHJhY2VMaW1pdDtcblxuICAgIHJldHVybiBlcnJvclxuICB9XG4pO1xuXG4vKipcbiAqIEBwYXJhbSB7c3RyaW5nfSBrZXlcbiAqIEBwYXJhbSB7dW5rbm93bltdfSBhcmdzXG4gKiBAcGFyYW0ge0Vycm9yfSBzZWxmXG4gKiBAcmV0dXJucyB7c3RyaW5nfVxuICovXG5mdW5jdGlvbiBnZXRNZXNzYWdlKGtleSwgYXJncywgc2VsZikge1xuICBjb25zdCBtZXNzYWdlID0gbWVzc2FnZXMuZ2V0KGtleSk7XG5cbiAgaWYgKHR5cGVvZiBtZXNzYWdlID09PSAnZnVuY3Rpb24nKSB7XG4gICAgYXNzZXJ0KFxuICAgICAgbWVzc2FnZS5sZW5ndGggPD0gYXJncy5sZW5ndGgsIC8vIERlZmF1bHQgb3B0aW9ucyBkbyBub3QgY291bnQuXG4gICAgICBgQ29kZTogJHtrZXl9OyBUaGUgcHJvdmlkZWQgYXJndW1lbnRzIGxlbmd0aCAoJHthcmdzLmxlbmd0aH0pIGRvZXMgbm90IGAgK1xuICAgICAgICBgbWF0Y2ggdGhlIHJlcXVpcmVkIG9uZXMgKCR7bWVzc2FnZS5sZW5ndGh9KS5gXG4gICAgKTtcbiAgICByZXR1cm4gUmVmbGVjdC5hcHBseShtZXNzYWdlLCBzZWxmLCBhcmdzKVxuICB9XG5cbiAgY29uc3QgZXhwZWN0ZWRMZW5ndGggPSAobWVzc2FnZS5tYXRjaCgvJVtkZmlqb09zXS9nKSB8fCBbXSkubGVuZ3RoO1xuICBhc3NlcnQoXG4gICAgZXhwZWN0ZWRMZW5ndGggPT09IGFyZ3MubGVuZ3RoLFxuICAgIGBDb2RlOiAke2tleX07IFRoZSBwcm92aWRlZCBhcmd1bWVudHMgbGVuZ3RoICgke2FyZ3MubGVuZ3RofSkgZG9lcyBub3QgYCArXG4gICAgICBgbWF0Y2ggdGhlIHJlcXVpcmVkIG9uZXMgKCR7ZXhwZWN0ZWRMZW5ndGh9KS5gXG4gICk7XG4gIGlmIChhcmdzLmxlbmd0aCA9PT0gMCkgcmV0dXJuIG1lc3NhZ2VcblxuICBhcmdzLnVuc2hpZnQobWVzc2FnZSk7XG4gIHJldHVybiBSZWZsZWN0LmFwcGx5KGZvcm1hdCQyLCBudWxsLCBhcmdzKVxufVxuXG4vLyBNYW51YWxseSDigJx0cmVlIHNoYWtlbuKAnSBmcm9tOlxuXG5jb25zdCB7RVJSX1VOS05PV05fRklMRV9FWFRFTlNJT059ID0gY29kZXM7XG5cbmNvbnN0IGV4dGVuc2lvbkZvcm1hdE1hcCA9IHtcbiAgX19wcm90b19fOiBudWxsLFxuICAnLmNqcyc6ICdjb21tb25qcycsXG4gICcuanMnOiAnbW9kdWxlJyxcbiAgJy5tanMnOiAnbW9kdWxlJ1xufTtcblxuLyoqXG4gKiBAcGFyYW0ge3N0cmluZ30gdXJsXG4gKiBAcmV0dXJucyB7e2Zvcm1hdDogc3RyaW5nfG51bGx9fVxuICovXG5mdW5jdGlvbiBkZWZhdWx0R2V0Rm9ybWF0KHVybCkge1xuICBpZiAodXJsLnN0YXJ0c1dpdGgoJ25vZGU6JykpIHtcbiAgICByZXR1cm4ge2Zvcm1hdDogJ2J1aWx0aW4nfVxuICB9XG5cbiAgY29uc3QgcGFyc2VkID0gbmV3IFVSTCQxKHVybCk7XG5cbiAgaWYgKHBhcnNlZC5wcm90b2NvbCA9PT0gJ2RhdGE6Jykge1xuICAgIGNvbnN0IHsxOiBtaW1lfSA9IC9eKFteL10rXFwvW147LF0rKVteLF0qPyg7YmFzZTY0KT8sLy5leGVjKFxuICAgICAgcGFyc2VkLnBhdGhuYW1lXG4gICAgKSB8fCBbbnVsbCwgbnVsbF07XG4gICAgY29uc3QgZm9ybWF0ID0gbWltZSA9PT0gJ3RleHQvamF2YXNjcmlwdCcgPyAnbW9kdWxlJyA6IG51bGw7XG4gICAgcmV0dXJuIHtmb3JtYXR9XG4gIH1cblxuICBpZiAocGFyc2VkLnByb3RvY29sID09PSAnZmlsZTonKSB7XG4gICAgY29uc3QgZXh0ID0gcGF0aC5leHRuYW1lKHBhcnNlZC5wYXRobmFtZSk7XG4gICAgLyoqIEB0eXBlIHtzdHJpbmd9ICovXG4gICAgbGV0IGZvcm1hdDtcbiAgICBpZiAoZXh0ID09PSAnLmpzJykge1xuICAgICAgZm9ybWF0ID0gZ2V0UGFja2FnZVR5cGUocGFyc2VkLmhyZWYpID09PSAnbW9kdWxlJyA/ICdtb2R1bGUnIDogJ2NvbW1vbmpzJztcbiAgICB9IGVsc2Uge1xuICAgICAgZm9ybWF0ID0gZXh0ZW5zaW9uRm9ybWF0TWFwW2V4dF07XG4gICAgfVxuXG4gICAgaWYgKCFmb3JtYXQpIHtcbiAgICAgIHRocm93IG5ldyBFUlJfVU5LTk9XTl9GSUxFX0VYVEVOU0lPTihleHQsIGZpbGVVUkxUb1BhdGgkMih1cmwpKVxuICAgIH1cblxuICAgIHJldHVybiB7Zm9ybWF0OiBmb3JtYXQgfHwgbnVsbH1cbiAgfVxuXG4gIHJldHVybiB7Zm9ybWF0OiBudWxsfVxufVxuXG4vLyBNYW51YWxseSDigJx0cmVlIHNoYWtlbuKAnSBmcm9tOlxuXG5idWlsdGlucygpO1xuXG5jb25zdCB7XG4gIEVSUl9JTlZBTElEX01PRFVMRV9TUEVDSUZJRVIsXG4gIEVSUl9JTlZBTElEX1BBQ0tBR0VfQ09ORklHLFxuICBFUlJfSU5WQUxJRF9QQUNLQUdFX1RBUkdFVCxcbiAgRVJSX01PRFVMRV9OT1RfRk9VTkQsXG4gIEVSUl9QQUNLQUdFX0lNUE9SVF9OT1RfREVGSU5FRCxcbiAgRVJSX1BBQ0tBR0VfUEFUSF9OT1RfRVhQT1JURUQsXG4gIEVSUl9VTlNVUFBPUlRFRF9ESVJfSU1QT1JULFxuICBFUlJfVU5TVVBQT1JURURfRVNNX1VSTF9TQ0hFTUUsXG4gIEVSUl9JTlZBTElEX0FSR19WQUxVRVxufSA9IGNvZGVzO1xuXG5jb25zdCBvd24gPSB7fS5oYXNPd25Qcm9wZXJ0eTtcblxuT2JqZWN0LmZyZWV6ZShbJ25vZGUnLCAnaW1wb3J0J10pO1xuXG5jb25zdCBpbnZhbGlkU2VnbWVudFJlZ0V4ID0gLyhefFxcXFx8XFwvKShcXC5cXC4/fG5vZGVfbW9kdWxlcykoXFxcXHxcXC98JCkvO1xuY29uc3QgcGF0dGVyblJlZ0V4ID0gL1xcKi9nO1xuY29uc3QgZW5jb2RlZFNlcFJlZ0V4ID0gLyUyZnwlMmMvaTtcbi8qKiBAdHlwZSB7U2V0PHN0cmluZz59ICovXG5jb25zdCBlbWl0dGVkUGFja2FnZVdhcm5pbmdzID0gbmV3IFNldCgpO1xuLyoqIEB0eXBlIHtNYXA8c3RyaW5nLCBQYWNrYWdlQ29uZmlnPn0gKi9cbmNvbnN0IHBhY2thZ2VKc29uQ2FjaGUgPSBuZXcgTWFwKCk7XG5cbi8qKlxuICogQHBhcmFtIHtzdHJpbmd9IG1hdGNoXG4gKiBAcGFyYW0ge1VSTH0gcGpzb25VcmxcbiAqIEBwYXJhbSB7Ym9vbGVhbn0gaXNFeHBvcnRzXG4gKiBAcGFyYW0ge1VSTH0gYmFzZVxuICogQHJldHVybnMge3ZvaWR9XG4gKi9cbmZ1bmN0aW9uIGVtaXRGb2xkZXJNYXBEZXByZWNhdGlvbihtYXRjaCwgcGpzb25VcmwsIGlzRXhwb3J0cywgYmFzZSkge1xuICBjb25zdCBwanNvblBhdGggPSBmaWxlVVJMVG9QYXRoJDIocGpzb25VcmwpO1xuXG4gIGlmIChlbWl0dGVkUGFja2FnZVdhcm5pbmdzLmhhcyhwanNvblBhdGggKyAnfCcgKyBtYXRjaCkpIHJldHVyblxuICBlbWl0dGVkUGFja2FnZVdhcm5pbmdzLmFkZChwanNvblBhdGggKyAnfCcgKyBtYXRjaCk7XG4gIHByb2Nlc3MuZW1pdFdhcm5pbmcoXG4gICAgYFVzZSBvZiBkZXByZWNhdGVkIGZvbGRlciBtYXBwaW5nIFwiJHttYXRjaH1cIiBpbiB0aGUgJHtcbiAgICAgIGlzRXhwb3J0cyA/ICdcImV4cG9ydHNcIicgOiAnXCJpbXBvcnRzXCInXG4gICAgfSBmaWVsZCBtb2R1bGUgcmVzb2x1dGlvbiBvZiB0aGUgcGFja2FnZSBhdCAke3Bqc29uUGF0aH0ke1xuICAgICAgYmFzZSA/IGAgaW1wb3J0ZWQgZnJvbSAke2ZpbGVVUkxUb1BhdGgkMihiYXNlKX1gIDogJydcbiAgICB9LlxcbmAgK1xuICAgICAgYFVwZGF0ZSB0aGlzIHBhY2thZ2UuanNvbiB0byB1c2UgYSBzdWJwYXRoIHBhdHRlcm4gbGlrZSBcIiR7bWF0Y2h9KlwiLmAsXG4gICAgJ0RlcHJlY2F0aW9uV2FybmluZycsXG4gICAgJ0RFUDAxNDgnXG4gICk7XG59XG5cbi8qKlxuICogQHBhcmFtIHtVUkx9IHVybFxuICogQHBhcmFtIHtVUkx9IHBhY2thZ2VKc29uVXJsXG4gKiBAcGFyYW0ge1VSTH0gYmFzZVxuICogQHBhcmFtIHt1bmtub3dufSBbbWFpbl1cbiAqIEByZXR1cm5zIHt2b2lkfVxuICovXG5mdW5jdGlvbiBlbWl0TGVnYWN5SW5kZXhEZXByZWNhdGlvbih1cmwsIHBhY2thZ2VKc29uVXJsLCBiYXNlLCBtYWluKSB7XG4gIGNvbnN0IHtmb3JtYXR9ID0gZGVmYXVsdEdldEZvcm1hdCh1cmwuaHJlZik7XG4gIGlmIChmb3JtYXQgIT09ICdtb2R1bGUnKSByZXR1cm5cbiAgY29uc3QgcGF0aCA9IGZpbGVVUkxUb1BhdGgkMih1cmwuaHJlZik7XG4gIGNvbnN0IHBrZ1BhdGggPSBmaWxlVVJMVG9QYXRoJDIobmV3IFVSTCQxKCcuJywgcGFja2FnZUpzb25VcmwpKTtcbiAgY29uc3QgYmFzZVBhdGggPSBmaWxlVVJMVG9QYXRoJDIoYmFzZSk7XG4gIGlmIChtYWluKVxuICAgIHByb2Nlc3MuZW1pdFdhcm5pbmcoXG4gICAgICBgUGFja2FnZSAke3BrZ1BhdGh9IGhhcyBhIFwibWFpblwiIGZpZWxkIHNldCB0byAke0pTT04uc3RyaW5naWZ5KG1haW4pfSwgYCArXG4gICAgICAgIGBleGNsdWRpbmcgdGhlIGZ1bGwgZmlsZW5hbWUgYW5kIGV4dGVuc2lvbiB0byB0aGUgcmVzb2x2ZWQgZmlsZSBhdCBcIiR7cGF0aC5zbGljZShcbiAgICAgICAgICBwa2dQYXRoLmxlbmd0aFxuICAgICAgICApfVwiLCBpbXBvcnRlZCBmcm9tICR7YmFzZVBhdGh9LlxcbiBBdXRvbWF0aWMgZXh0ZW5zaW9uIHJlc29sdXRpb24gb2YgdGhlIFwibWFpblwiIGZpZWxkIGlzYCArXG4gICAgICAgICdkZXByZWNhdGVkIGZvciBFUyBtb2R1bGVzLicsXG4gICAgICAnRGVwcmVjYXRpb25XYXJuaW5nJyxcbiAgICAgICdERVAwMTUxJ1xuICAgICk7XG4gIGVsc2VcbiAgICBwcm9jZXNzLmVtaXRXYXJuaW5nKFxuICAgICAgYE5vIFwibWFpblwiIG9yIFwiZXhwb3J0c1wiIGZpZWxkIGRlZmluZWQgaW4gdGhlIHBhY2thZ2UuanNvbiBmb3IgJHtwa2dQYXRofSByZXNvbHZpbmcgdGhlIG1haW4gZW50cnkgcG9pbnQgXCIke3BhdGguc2xpY2UoXG4gICAgICAgIHBrZ1BhdGgubGVuZ3RoXG4gICAgICApfVwiLCBpbXBvcnRlZCBmcm9tICR7YmFzZVBhdGh9LlxcbkRlZmF1bHQgXCJpbmRleFwiIGxvb2t1cHMgZm9yIHRoZSBtYWluIGFyZSBkZXByZWNhdGVkIGZvciBFUyBtb2R1bGVzLmAsXG4gICAgICAnRGVwcmVjYXRpb25XYXJuaW5nJyxcbiAgICAgICdERVAwMTUxJ1xuICAgICk7XG59XG5cbi8qKlxuICogQHBhcmFtIHtzdHJpbmd9IHBhdGhcbiAqIEByZXR1cm5zIHtTdGF0c31cbiAqL1xuZnVuY3Rpb24gdHJ5U3RhdFN5bmMocGF0aCkge1xuICAvLyBOb3RlOiBmcm9tIE5vZGUgMTUgb253YXJkcyB3ZSBjYW4gdXNlIGB0aHJvd0lmTm9FbnRyeTogZmFsc2VgIGluc3RlYWQuXG4gIHRyeSB7XG4gICAgcmV0dXJuIHN0YXRTeW5jKHBhdGgpXG4gIH0gY2F0Y2gge1xuICAgIHJldHVybiBuZXcgU3RhdHMoKVxuICB9XG59XG5cbi8qKlxuICogQHBhcmFtIHtzdHJpbmd9IHBhdGhcbiAqIEBwYXJhbSB7c3RyaW5nfFVSTH0gc3BlY2lmaWVyIE5vdGU6IGBzcGVjaWZpZXJgIGlzIGFjdHVhbGx5IG9wdGlvbmFsLCBub3QgYmFzZS5cbiAqIEBwYXJhbSB7VVJMfSBbYmFzZV1cbiAqIEByZXR1cm5zIHtQYWNrYWdlQ29uZmlnfVxuICovXG5mdW5jdGlvbiBnZXRQYWNrYWdlQ29uZmlnKHBhdGgsIHNwZWNpZmllciwgYmFzZSkge1xuICBjb25zdCBleGlzdGluZyA9IHBhY2thZ2VKc29uQ2FjaGUuZ2V0KHBhdGgpO1xuICBpZiAoZXhpc3RpbmcgIT09IHVuZGVmaW5lZCkge1xuICAgIHJldHVybiBleGlzdGluZ1xuICB9XG5cbiAgY29uc3Qgc291cmNlID0gcGFja2FnZUpzb25SZWFkZXIucmVhZChwYXRoKS5zdHJpbmc7XG5cbiAgaWYgKHNvdXJjZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgLyoqIEB0eXBlIHtQYWNrYWdlQ29uZmlnfSAqL1xuICAgIGNvbnN0IHBhY2thZ2VDb25maWcgPSB7XG4gICAgICBwanNvblBhdGg6IHBhdGgsXG4gICAgICBleGlzdHM6IGZhbHNlLFxuICAgICAgbWFpbjogdW5kZWZpbmVkLFxuICAgICAgbmFtZTogdW5kZWZpbmVkLFxuICAgICAgdHlwZTogJ25vbmUnLFxuICAgICAgZXhwb3J0czogdW5kZWZpbmVkLFxuICAgICAgaW1wb3J0czogdW5kZWZpbmVkXG4gICAgfTtcbiAgICBwYWNrYWdlSnNvbkNhY2hlLnNldChwYXRoLCBwYWNrYWdlQ29uZmlnKTtcbiAgICByZXR1cm4gcGFja2FnZUNvbmZpZ1xuICB9XG5cbiAgLyoqIEB0eXBlIHtPYmplY3QuPHN0cmluZywgdW5rbm93bj59ICovXG4gIGxldCBwYWNrYWdlSnNvbjtcbiAgdHJ5IHtcbiAgICBwYWNrYWdlSnNvbiA9IEpTT04ucGFyc2Uoc291cmNlKTtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICB0aHJvdyBuZXcgRVJSX0lOVkFMSURfUEFDS0FHRV9DT05GSUcoXG4gICAgICBwYXRoLFxuICAgICAgKGJhc2UgPyBgXCIke3NwZWNpZmllcn1cIiBmcm9tIGAgOiAnJykgKyBmaWxlVVJMVG9QYXRoJDIoYmFzZSB8fCBzcGVjaWZpZXIpLFxuICAgICAgZXJyb3IubWVzc2FnZVxuICAgIClcbiAgfVxuXG4gIGNvbnN0IHtleHBvcnRzLCBpbXBvcnRzLCBtYWluLCBuYW1lLCB0eXBlfSA9IHBhY2thZ2VKc29uO1xuXG4gIC8qKiBAdHlwZSB7UGFja2FnZUNvbmZpZ30gKi9cbiAgY29uc3QgcGFja2FnZUNvbmZpZyA9IHtcbiAgICBwanNvblBhdGg6IHBhdGgsXG4gICAgZXhpc3RzOiB0cnVlLFxuICAgIG1haW46IHR5cGVvZiBtYWluID09PSAnc3RyaW5nJyA/IG1haW4gOiB1bmRlZmluZWQsXG4gICAgbmFtZTogdHlwZW9mIG5hbWUgPT09ICdzdHJpbmcnID8gbmFtZSA6IHVuZGVmaW5lZCxcbiAgICB0eXBlOiB0eXBlID09PSAnbW9kdWxlJyB8fCB0eXBlID09PSAnY29tbW9uanMnID8gdHlwZSA6ICdub25lJyxcbiAgICAvLyBAdHMtZXhwZWN0LWVycm9yIEFzc3VtZSBgT2JqZWN0LjxzdHJpbmcsIHVua25vd24+YC5cbiAgICBleHBvcnRzLFxuICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgQXNzdW1lIGBPYmplY3QuPHN0cmluZywgdW5rbm93bj5gLlxuICAgIGltcG9ydHM6IGltcG9ydHMgJiYgdHlwZW9mIGltcG9ydHMgPT09ICdvYmplY3QnID8gaW1wb3J0cyA6IHVuZGVmaW5lZFxuICB9O1xuICBwYWNrYWdlSnNvbkNhY2hlLnNldChwYXRoLCBwYWNrYWdlQ29uZmlnKTtcbiAgcmV0dXJuIHBhY2thZ2VDb25maWdcbn1cblxuLyoqXG4gKiBAcGFyYW0ge1VSTHxzdHJpbmd9IHJlc29sdmVkXG4gKiBAcmV0dXJucyB7UGFja2FnZUNvbmZpZ31cbiAqL1xuZnVuY3Rpb24gZ2V0UGFja2FnZVNjb3BlQ29uZmlnKHJlc29sdmVkKSB7XG4gIGxldCBwYWNrYWdlSnNvblVybCA9IG5ldyBVUkwkMSgnLi9wYWNrYWdlLmpzb24nLCByZXNvbHZlZCk7XG5cbiAgd2hpbGUgKHRydWUpIHtcbiAgICBjb25zdCBwYWNrYWdlSnNvblBhdGggPSBwYWNrYWdlSnNvblVybC5wYXRobmFtZTtcblxuICAgIGlmIChwYWNrYWdlSnNvblBhdGguZW5kc1dpdGgoJ25vZGVfbW9kdWxlcy9wYWNrYWdlLmpzb24nKSkgYnJlYWtcblxuICAgIGNvbnN0IHBhY2thZ2VDb25maWcgPSBnZXRQYWNrYWdlQ29uZmlnKFxuICAgICAgZmlsZVVSTFRvUGF0aCQyKHBhY2thZ2VKc29uVXJsKSxcbiAgICAgIHJlc29sdmVkXG4gICAgKTtcbiAgICBpZiAocGFja2FnZUNvbmZpZy5leGlzdHMpIHJldHVybiBwYWNrYWdlQ29uZmlnXG5cbiAgICBjb25zdCBsYXN0UGFja2FnZUpzb25VcmwgPSBwYWNrYWdlSnNvblVybDtcbiAgICBwYWNrYWdlSnNvblVybCA9IG5ldyBVUkwkMSgnLi4vcGFja2FnZS5qc29uJywgcGFja2FnZUpzb25VcmwpO1xuXG4gICAgLy8gVGVybWluYXRlcyBhdCByb290IHdoZXJlIC4uL3BhY2thZ2UuanNvbiBlcXVhbHMgLi4vLi4vcGFja2FnZS5qc29uXG4gICAgLy8gKGNhbid0IGp1c3QgY2hlY2sgXCIvcGFja2FnZS5qc29uXCIgZm9yIFdpbmRvd3Mgc3VwcG9ydCkuXG4gICAgaWYgKHBhY2thZ2VKc29uVXJsLnBhdGhuYW1lID09PSBsYXN0UGFja2FnZUpzb25VcmwucGF0aG5hbWUpIGJyZWFrXG4gIH1cblxuICBjb25zdCBwYWNrYWdlSnNvblBhdGggPSBmaWxlVVJMVG9QYXRoJDIocGFja2FnZUpzb25VcmwpO1xuICAvKiogQHR5cGUge1BhY2thZ2VDb25maWd9ICovXG4gIGNvbnN0IHBhY2thZ2VDb25maWcgPSB7XG4gICAgcGpzb25QYXRoOiBwYWNrYWdlSnNvblBhdGgsXG4gICAgZXhpc3RzOiBmYWxzZSxcbiAgICBtYWluOiB1bmRlZmluZWQsXG4gICAgbmFtZTogdW5kZWZpbmVkLFxuICAgIHR5cGU6ICdub25lJyxcbiAgICBleHBvcnRzOiB1bmRlZmluZWQsXG4gICAgaW1wb3J0czogdW5kZWZpbmVkXG4gIH07XG4gIHBhY2thZ2VKc29uQ2FjaGUuc2V0KHBhY2thZ2VKc29uUGF0aCwgcGFja2FnZUNvbmZpZyk7XG4gIHJldHVybiBwYWNrYWdlQ29uZmlnXG59XG5cbi8qKlxuICogTGVnYWN5IENvbW1vbkpTIG1haW4gcmVzb2x1dGlvbjpcbiAqIDEuIGxldCBNID0gcGtnX3VybCArIChqc29uIG1haW4gZmllbGQpXG4gKiAyLiBUUlkoTSwgTS5qcywgTS5qc29uLCBNLm5vZGUpXG4gKiAzLiBUUlkoTS9pbmRleC5qcywgTS9pbmRleC5qc29uLCBNL2luZGV4Lm5vZGUpXG4gKiA0LiBUUlkocGtnX3VybC9pbmRleC5qcywgcGtnX3VybC9pbmRleC5qc29uLCBwa2dfdXJsL2luZGV4Lm5vZGUpXG4gKiA1LiBOT1RfRk9VTkRcbiAqXG4gKiBAcGFyYW0ge1VSTH0gdXJsXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAqL1xuZnVuY3Rpb24gZmlsZUV4aXN0cyh1cmwpIHtcbiAgcmV0dXJuIHRyeVN0YXRTeW5jKGZpbGVVUkxUb1BhdGgkMih1cmwpKS5pc0ZpbGUoKVxufVxuXG4vKipcbiAqIEBwYXJhbSB7VVJMfSBwYWNrYWdlSnNvblVybFxuICogQHBhcmFtIHtQYWNrYWdlQ29uZmlnfSBwYWNrYWdlQ29uZmlnXG4gKiBAcGFyYW0ge1VSTH0gYmFzZVxuICogQHJldHVybnMge1VSTH1cbiAqL1xuZnVuY3Rpb24gbGVnYWN5TWFpblJlc29sdmUocGFja2FnZUpzb25VcmwsIHBhY2thZ2VDb25maWcsIGJhc2UpIHtcbiAgLyoqIEB0eXBlIHtVUkx9ICovXG4gIGxldCBndWVzcztcbiAgaWYgKHBhY2thZ2VDb25maWcubWFpbiAhPT0gdW5kZWZpbmVkKSB7XG4gICAgZ3Vlc3MgPSBuZXcgVVJMJDEoYC4vJHtwYWNrYWdlQ29uZmlnLm1haW59YCwgcGFja2FnZUpzb25VcmwpO1xuICAgIC8vIE5vdGU6IGZzIGNoZWNrIHJlZHVuZGFuY2VzIHdpbGwgYmUgaGFuZGxlZCBieSBEZXNjcmlwdG9yIGNhY2hlIGhlcmUuXG4gICAgaWYgKGZpbGVFeGlzdHMoZ3Vlc3MpKSByZXR1cm4gZ3Vlc3NcblxuICAgIGNvbnN0IHRyaWVzID0gW1xuICAgICAgYC4vJHtwYWNrYWdlQ29uZmlnLm1haW59LmpzYCxcbiAgICAgIGAuLyR7cGFja2FnZUNvbmZpZy5tYWlufS5qc29uYCxcbiAgICAgIGAuLyR7cGFja2FnZUNvbmZpZy5tYWlufS5ub2RlYCxcbiAgICAgIGAuLyR7cGFja2FnZUNvbmZpZy5tYWlufS9pbmRleC5qc2AsXG4gICAgICBgLi8ke3BhY2thZ2VDb25maWcubWFpbn0vaW5kZXguanNvbmAsXG4gICAgICBgLi8ke3BhY2thZ2VDb25maWcubWFpbn0vaW5kZXgubm9kZWBcbiAgICBdO1xuICAgIGxldCBpID0gLTE7XG5cbiAgICB3aGlsZSAoKytpIDwgdHJpZXMubGVuZ3RoKSB7XG4gICAgICBndWVzcyA9IG5ldyBVUkwkMSh0cmllc1tpXSwgcGFja2FnZUpzb25VcmwpO1xuICAgICAgaWYgKGZpbGVFeGlzdHMoZ3Vlc3MpKSBicmVha1xuICAgICAgZ3Vlc3MgPSB1bmRlZmluZWQ7XG4gICAgfVxuXG4gICAgaWYgKGd1ZXNzKSB7XG4gICAgICBlbWl0TGVnYWN5SW5kZXhEZXByZWNhdGlvbihcbiAgICAgICAgZ3Vlc3MsXG4gICAgICAgIHBhY2thZ2VKc29uVXJsLFxuICAgICAgICBiYXNlLFxuICAgICAgICBwYWNrYWdlQ29uZmlnLm1haW5cbiAgICAgICk7XG4gICAgICByZXR1cm4gZ3Vlc3NcbiAgICB9XG4gICAgLy8gRmFsbHRocm91Z2guXG4gIH1cblxuICBjb25zdCB0cmllcyA9IFsnLi9pbmRleC5qcycsICcuL2luZGV4Lmpzb24nLCAnLi9pbmRleC5ub2RlJ107XG4gIGxldCBpID0gLTE7XG5cbiAgd2hpbGUgKCsraSA8IHRyaWVzLmxlbmd0aCkge1xuICAgIGd1ZXNzID0gbmV3IFVSTCQxKHRyaWVzW2ldLCBwYWNrYWdlSnNvblVybCk7XG4gICAgaWYgKGZpbGVFeGlzdHMoZ3Vlc3MpKSBicmVha1xuICAgIGd1ZXNzID0gdW5kZWZpbmVkO1xuICB9XG5cbiAgaWYgKGd1ZXNzKSB7XG4gICAgZW1pdExlZ2FjeUluZGV4RGVwcmVjYXRpb24oZ3Vlc3MsIHBhY2thZ2VKc29uVXJsLCBiYXNlLCBwYWNrYWdlQ29uZmlnLm1haW4pO1xuICAgIHJldHVybiBndWVzc1xuICB9XG5cbiAgLy8gTm90IGZvdW5kLlxuICB0aHJvdyBuZXcgRVJSX01PRFVMRV9OT1RfRk9VTkQoXG4gICAgZmlsZVVSTFRvUGF0aCQyKG5ldyBVUkwkMSgnLicsIHBhY2thZ2VKc29uVXJsKSksXG4gICAgZmlsZVVSTFRvUGF0aCQyKGJhc2UpXG4gIClcbn1cblxuLyoqXG4gKiBAcGFyYW0ge1VSTH0gcmVzb2x2ZWRcbiAqIEBwYXJhbSB7VVJMfSBiYXNlXG4gKiBAcmV0dXJucyB7VVJMfVxuICovXG5mdW5jdGlvbiBmaW5hbGl6ZVJlc29sdXRpb24ocmVzb2x2ZWQsIGJhc2UpIHtcbiAgaWYgKGVuY29kZWRTZXBSZWdFeC50ZXN0KHJlc29sdmVkLnBhdGhuYW1lKSlcbiAgICB0aHJvdyBuZXcgRVJSX0lOVkFMSURfTU9EVUxFX1NQRUNJRklFUihcbiAgICAgIHJlc29sdmVkLnBhdGhuYW1lLFxuICAgICAgJ211c3Qgbm90IGluY2x1ZGUgZW5jb2RlZCBcIi9cIiBvciBcIlxcXFxcIiBjaGFyYWN0ZXJzJyxcbiAgICAgIGZpbGVVUkxUb1BhdGgkMihiYXNlKVxuICAgIClcblxuICBjb25zdCBwYXRoID0gZmlsZVVSTFRvUGF0aCQyKHJlc29sdmVkKTtcblxuICBjb25zdCBzdGF0cyA9IHRyeVN0YXRTeW5jKHBhdGguZW5kc1dpdGgoJy8nKSA/IHBhdGguc2xpY2UoLTEpIDogcGF0aCk7XG5cbiAgaWYgKHN0YXRzLmlzRGlyZWN0b3J5KCkpIHtcbiAgICBjb25zdCBlcnJvciA9IG5ldyBFUlJfVU5TVVBQT1JURURfRElSX0lNUE9SVChwYXRoLCBmaWxlVVJMVG9QYXRoJDIoYmFzZSkpO1xuICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgQWRkIHRoaXMgZm9yIGBpbXBvcnQubWV0YS5yZXNvbHZlYC5cbiAgICBlcnJvci51cmwgPSBTdHJpbmcocmVzb2x2ZWQpO1xuICAgIHRocm93IGVycm9yXG4gIH1cblxuICBpZiAoIXN0YXRzLmlzRmlsZSgpKSB7XG4gICAgdGhyb3cgbmV3IEVSUl9NT0RVTEVfTk9UX0ZPVU5EKFxuICAgICAgcGF0aCB8fCByZXNvbHZlZC5wYXRobmFtZSxcbiAgICAgIGJhc2UgJiYgZmlsZVVSTFRvUGF0aCQyKGJhc2UpLFxuICAgICAgJ21vZHVsZSdcbiAgICApXG4gIH1cblxuICByZXR1cm4gcmVzb2x2ZWRcbn1cblxuLyoqXG4gKiBAcGFyYW0ge3N0cmluZ30gc3BlY2lmaWVyXG4gKiBAcGFyYW0ge1VSTD99IHBhY2thZ2VKc29uVXJsXG4gKiBAcGFyYW0ge1VSTH0gYmFzZVxuICogQHJldHVybnMge25ldmVyfVxuICovXG5mdW5jdGlvbiB0aHJvd0ltcG9ydE5vdERlZmluZWQoc3BlY2lmaWVyLCBwYWNrYWdlSnNvblVybCwgYmFzZSkge1xuICB0aHJvdyBuZXcgRVJSX1BBQ0tBR0VfSU1QT1JUX05PVF9ERUZJTkVEKFxuICAgIHNwZWNpZmllcixcbiAgICBwYWNrYWdlSnNvblVybCAmJiBmaWxlVVJMVG9QYXRoJDIobmV3IFVSTCQxKCcuJywgcGFja2FnZUpzb25VcmwpKSxcbiAgICBmaWxlVVJMVG9QYXRoJDIoYmFzZSlcbiAgKVxufVxuXG4vKipcbiAqIEBwYXJhbSB7c3RyaW5nfSBzdWJwYXRoXG4gKiBAcGFyYW0ge1VSTH0gcGFja2FnZUpzb25VcmxcbiAqIEBwYXJhbSB7VVJMfSBiYXNlXG4gKiBAcmV0dXJucyB7bmV2ZXJ9XG4gKi9cbmZ1bmN0aW9uIHRocm93RXhwb3J0c05vdEZvdW5kKHN1YnBhdGgsIHBhY2thZ2VKc29uVXJsLCBiYXNlKSB7XG4gIHRocm93IG5ldyBFUlJfUEFDS0FHRV9QQVRIX05PVF9FWFBPUlRFRChcbiAgICBmaWxlVVJMVG9QYXRoJDIobmV3IFVSTCQxKCcuJywgcGFja2FnZUpzb25VcmwpKSxcbiAgICBzdWJwYXRoLFxuICAgIGJhc2UgJiYgZmlsZVVSTFRvUGF0aCQyKGJhc2UpXG4gIClcbn1cblxuLyoqXG4gKiBAcGFyYW0ge3N0cmluZ30gc3VicGF0aFxuICogQHBhcmFtIHtVUkx9IHBhY2thZ2VKc29uVXJsXG4gKiBAcGFyYW0ge2Jvb2xlYW59IGludGVybmFsXG4gKiBAcGFyYW0ge1VSTH0gW2Jhc2VdXG4gKiBAcmV0dXJucyB7bmV2ZXJ9XG4gKi9cbmZ1bmN0aW9uIHRocm93SW52YWxpZFN1YnBhdGgoc3VicGF0aCwgcGFja2FnZUpzb25VcmwsIGludGVybmFsLCBiYXNlKSB7XG4gIGNvbnN0IHJlYXNvbiA9IGByZXF1ZXN0IGlzIG5vdCBhIHZhbGlkIHN1YnBhdGggZm9yIHRoZSBcIiR7XG4gICAgaW50ZXJuYWwgPyAnaW1wb3J0cycgOiAnZXhwb3J0cydcbiAgfVwiIHJlc29sdXRpb24gb2YgJHtmaWxlVVJMVG9QYXRoJDIocGFja2FnZUpzb25VcmwpfWA7XG5cbiAgdGhyb3cgbmV3IEVSUl9JTlZBTElEX01PRFVMRV9TUEVDSUZJRVIoXG4gICAgc3VicGF0aCxcbiAgICByZWFzb24sXG4gICAgYmFzZSAmJiBmaWxlVVJMVG9QYXRoJDIoYmFzZSlcbiAgKVxufVxuXG4vKipcbiAqIEBwYXJhbSB7c3RyaW5nfSBzdWJwYXRoXG4gKiBAcGFyYW0ge3Vua25vd259IHRhcmdldFxuICogQHBhcmFtIHtVUkx9IHBhY2thZ2VKc29uVXJsXG4gKiBAcGFyYW0ge2Jvb2xlYW59IGludGVybmFsXG4gKiBAcGFyYW0ge1VSTH0gW2Jhc2VdXG4gKiBAcmV0dXJucyB7bmV2ZXJ9XG4gKi9cbmZ1bmN0aW9uIHRocm93SW52YWxpZFBhY2thZ2VUYXJnZXQoXG4gIHN1YnBhdGgsXG4gIHRhcmdldCxcbiAgcGFja2FnZUpzb25VcmwsXG4gIGludGVybmFsLFxuICBiYXNlXG4pIHtcbiAgdGFyZ2V0ID1cbiAgICB0eXBlb2YgdGFyZ2V0ID09PSAnb2JqZWN0JyAmJiB0YXJnZXQgIT09IG51bGxcbiAgICAgID8gSlNPTi5zdHJpbmdpZnkodGFyZ2V0LCBudWxsLCAnJylcbiAgICAgIDogYCR7dGFyZ2V0fWA7XG5cbiAgdGhyb3cgbmV3IEVSUl9JTlZBTElEX1BBQ0tBR0VfVEFSR0VUKFxuICAgIGZpbGVVUkxUb1BhdGgkMihuZXcgVVJMJDEoJy4nLCBwYWNrYWdlSnNvblVybCkpLFxuICAgIHN1YnBhdGgsXG4gICAgdGFyZ2V0LFxuICAgIGludGVybmFsLFxuICAgIGJhc2UgJiYgZmlsZVVSTFRvUGF0aCQyKGJhc2UpXG4gIClcbn1cblxuLyoqXG4gKiBAcGFyYW0ge3N0cmluZ30gdGFyZ2V0XG4gKiBAcGFyYW0ge3N0cmluZ30gc3VicGF0aFxuICogQHBhcmFtIHtzdHJpbmd9IG1hdGNoXG4gKiBAcGFyYW0ge1VSTH0gcGFja2FnZUpzb25VcmxcbiAqIEBwYXJhbSB7VVJMfSBiYXNlXG4gKiBAcGFyYW0ge2Jvb2xlYW59IHBhdHRlcm5cbiAqIEBwYXJhbSB7Ym9vbGVhbn0gaW50ZXJuYWxcbiAqIEBwYXJhbSB7U2V0PHN0cmluZz59IGNvbmRpdGlvbnNcbiAqIEByZXR1cm5zIHtVUkx9XG4gKi9cbmZ1bmN0aW9uIHJlc29sdmVQYWNrYWdlVGFyZ2V0U3RyaW5nKFxuICB0YXJnZXQsXG4gIHN1YnBhdGgsXG4gIG1hdGNoLFxuICBwYWNrYWdlSnNvblVybCxcbiAgYmFzZSxcbiAgcGF0dGVybixcbiAgaW50ZXJuYWwsXG4gIGNvbmRpdGlvbnNcbikge1xuICBpZiAoc3VicGF0aCAhPT0gJycgJiYgIXBhdHRlcm4gJiYgdGFyZ2V0W3RhcmdldC5sZW5ndGggLSAxXSAhPT0gJy8nKVxuICAgIHRocm93SW52YWxpZFBhY2thZ2VUYXJnZXQobWF0Y2gsIHRhcmdldCwgcGFja2FnZUpzb25VcmwsIGludGVybmFsLCBiYXNlKTtcblxuICBpZiAoIXRhcmdldC5zdGFydHNXaXRoKCcuLycpKSB7XG4gICAgaWYgKGludGVybmFsICYmICF0YXJnZXQuc3RhcnRzV2l0aCgnLi4vJykgJiYgIXRhcmdldC5zdGFydHNXaXRoKCcvJykpIHtcbiAgICAgIGxldCBpc1VSTCA9IGZhbHNlO1xuXG4gICAgICB0cnkge1xuICAgICAgICBuZXcgVVJMJDEodGFyZ2V0KTtcbiAgICAgICAgaXNVUkwgPSB0cnVlO1xuICAgICAgfSBjYXRjaCB7fVxuXG4gICAgICBpZiAoIWlzVVJMKSB7XG4gICAgICAgIGNvbnN0IGV4cG9ydFRhcmdldCA9IHBhdHRlcm5cbiAgICAgICAgICA/IHRhcmdldC5yZXBsYWNlKHBhdHRlcm5SZWdFeCwgc3VicGF0aClcbiAgICAgICAgICA6IHRhcmdldCArIHN1YnBhdGg7XG5cbiAgICAgICAgcmV0dXJuIHBhY2thZ2VSZXNvbHZlKGV4cG9ydFRhcmdldCwgcGFja2FnZUpzb25VcmwsIGNvbmRpdGlvbnMpXG4gICAgICB9XG4gICAgfVxuXG4gICAgdGhyb3dJbnZhbGlkUGFja2FnZVRhcmdldChtYXRjaCwgdGFyZ2V0LCBwYWNrYWdlSnNvblVybCwgaW50ZXJuYWwsIGJhc2UpO1xuICB9XG5cbiAgaWYgKGludmFsaWRTZWdtZW50UmVnRXgudGVzdCh0YXJnZXQuc2xpY2UoMikpKVxuICAgIHRocm93SW52YWxpZFBhY2thZ2VUYXJnZXQobWF0Y2gsIHRhcmdldCwgcGFja2FnZUpzb25VcmwsIGludGVybmFsLCBiYXNlKTtcblxuICBjb25zdCByZXNvbHZlZCA9IG5ldyBVUkwkMSh0YXJnZXQsIHBhY2thZ2VKc29uVXJsKTtcbiAgY29uc3QgcmVzb2x2ZWRQYXRoID0gcmVzb2x2ZWQucGF0aG5hbWU7XG4gIGNvbnN0IHBhY2thZ2VQYXRoID0gbmV3IFVSTCQxKCcuJywgcGFja2FnZUpzb25VcmwpLnBhdGhuYW1lO1xuXG4gIGlmICghcmVzb2x2ZWRQYXRoLnN0YXJ0c1dpdGgocGFja2FnZVBhdGgpKVxuICAgIHRocm93SW52YWxpZFBhY2thZ2VUYXJnZXQobWF0Y2gsIHRhcmdldCwgcGFja2FnZUpzb25VcmwsIGludGVybmFsLCBiYXNlKTtcblxuICBpZiAoc3VicGF0aCA9PT0gJycpIHJldHVybiByZXNvbHZlZFxuXG4gIGlmIChpbnZhbGlkU2VnbWVudFJlZ0V4LnRlc3Qoc3VicGF0aCkpXG4gICAgdGhyb3dJbnZhbGlkU3VicGF0aChtYXRjaCArIHN1YnBhdGgsIHBhY2thZ2VKc29uVXJsLCBpbnRlcm5hbCwgYmFzZSk7XG5cbiAgaWYgKHBhdHRlcm4pIHJldHVybiBuZXcgVVJMJDEocmVzb2x2ZWQuaHJlZi5yZXBsYWNlKHBhdHRlcm5SZWdFeCwgc3VicGF0aCkpXG4gIHJldHVybiBuZXcgVVJMJDEoc3VicGF0aCwgcmVzb2x2ZWQpXG59XG5cbi8qKlxuICogQHBhcmFtIHtzdHJpbmd9IGtleVxuICogQHJldHVybnMge2Jvb2xlYW59XG4gKi9cbmZ1bmN0aW9uIGlzQXJyYXlJbmRleChrZXkpIHtcbiAgY29uc3Qga2V5TnVtYmVyID0gTnVtYmVyKGtleSk7XG4gIGlmIChgJHtrZXlOdW1iZXJ9YCAhPT0ga2V5KSByZXR1cm4gZmFsc2VcbiAgcmV0dXJuIGtleU51bWJlciA+PSAwICYmIGtleU51bWJlciA8IDB4ZmZmZl9mZmZmXG59XG5cbi8qKlxuICogQHBhcmFtIHtVUkx9IHBhY2thZ2VKc29uVXJsXG4gKiBAcGFyYW0ge3Vua25vd259IHRhcmdldFxuICogQHBhcmFtIHtzdHJpbmd9IHN1YnBhdGhcbiAqIEBwYXJhbSB7c3RyaW5nfSBwYWNrYWdlU3VicGF0aFxuICogQHBhcmFtIHtVUkx9IGJhc2VcbiAqIEBwYXJhbSB7Ym9vbGVhbn0gcGF0dGVyblxuICogQHBhcmFtIHtib29sZWFufSBpbnRlcm5hbFxuICogQHBhcmFtIHtTZXQ8c3RyaW5nPn0gY29uZGl0aW9uc1xuICogQHJldHVybnMge1VSTH1cbiAqL1xuZnVuY3Rpb24gcmVzb2x2ZVBhY2thZ2VUYXJnZXQoXG4gIHBhY2thZ2VKc29uVXJsLFxuICB0YXJnZXQsXG4gIHN1YnBhdGgsXG4gIHBhY2thZ2VTdWJwYXRoLFxuICBiYXNlLFxuICBwYXR0ZXJuLFxuICBpbnRlcm5hbCxcbiAgY29uZGl0aW9uc1xuKSB7XG4gIGlmICh0eXBlb2YgdGFyZ2V0ID09PSAnc3RyaW5nJykge1xuICAgIHJldHVybiByZXNvbHZlUGFja2FnZVRhcmdldFN0cmluZyhcbiAgICAgIHRhcmdldCxcbiAgICAgIHN1YnBhdGgsXG4gICAgICBwYWNrYWdlU3VicGF0aCxcbiAgICAgIHBhY2thZ2VKc29uVXJsLFxuICAgICAgYmFzZSxcbiAgICAgIHBhdHRlcm4sXG4gICAgICBpbnRlcm5hbCxcbiAgICAgIGNvbmRpdGlvbnNcbiAgICApXG4gIH1cblxuICBpZiAoQXJyYXkuaXNBcnJheSh0YXJnZXQpKSB7XG4gICAgLyoqIEB0eXBlIHt1bmtub3duW119ICovXG4gICAgY29uc3QgdGFyZ2V0TGlzdCA9IHRhcmdldDtcbiAgICBpZiAodGFyZ2V0TGlzdC5sZW5ndGggPT09IDApIHJldHVybiBudWxsXG5cbiAgICAvKiogQHR5cGUge0Vycm9yfSAqL1xuICAgIGxldCBsYXN0RXhjZXB0aW9uO1xuICAgIGxldCBpID0gLTE7XG5cbiAgICB3aGlsZSAoKytpIDwgdGFyZ2V0TGlzdC5sZW5ndGgpIHtcbiAgICAgIGNvbnN0IHRhcmdldEl0ZW0gPSB0YXJnZXRMaXN0W2ldO1xuICAgICAgLyoqIEB0eXBlIHtVUkx9ICovXG4gICAgICBsZXQgcmVzb2x2ZWQ7XG4gICAgICB0cnkge1xuICAgICAgICByZXNvbHZlZCA9IHJlc29sdmVQYWNrYWdlVGFyZ2V0KFxuICAgICAgICAgIHBhY2thZ2VKc29uVXJsLFxuICAgICAgICAgIHRhcmdldEl0ZW0sXG4gICAgICAgICAgc3VicGF0aCxcbiAgICAgICAgICBwYWNrYWdlU3VicGF0aCxcbiAgICAgICAgICBiYXNlLFxuICAgICAgICAgIHBhdHRlcm4sXG4gICAgICAgICAgaW50ZXJuYWwsXG4gICAgICAgICAgY29uZGl0aW9uc1xuICAgICAgICApO1xuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgbGFzdEV4Y2VwdGlvbiA9IGVycm9yO1xuICAgICAgICBpZiAoZXJyb3IuY29kZSA9PT0gJ0VSUl9JTlZBTElEX1BBQ0tBR0VfVEFSR0VUJykgY29udGludWVcbiAgICAgICAgdGhyb3cgZXJyb3JcbiAgICAgIH1cblxuICAgICAgaWYgKHJlc29sdmVkID09PSB1bmRlZmluZWQpIGNvbnRpbnVlXG5cbiAgICAgIGlmIChyZXNvbHZlZCA9PT0gbnVsbCkge1xuICAgICAgICBsYXN0RXhjZXB0aW9uID0gbnVsbDtcbiAgICAgICAgY29udGludWVcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHJlc29sdmVkXG4gICAgfVxuXG4gICAgaWYgKGxhc3RFeGNlcHRpb24gPT09IHVuZGVmaW5lZCB8fCBsYXN0RXhjZXB0aW9uID09PSBudWxsKSB7XG4gICAgICAvLyBAdHMtZXhwZWN0LWVycm9yIFRoZSBkaWZmIGJldHdlZW4gYHVuZGVmaW5lZGAgYW5kIGBudWxsYCBzZWVtcyB0byBiZVxuICAgICAgLy8gaW50ZW50aW9uYWxcbiAgICAgIHJldHVybiBsYXN0RXhjZXB0aW9uXG4gICAgfVxuXG4gICAgdGhyb3cgbGFzdEV4Y2VwdGlvblxuICB9XG5cbiAgaWYgKHR5cGVvZiB0YXJnZXQgPT09ICdvYmplY3QnICYmIHRhcmdldCAhPT0gbnVsbCkge1xuICAgIGNvbnN0IGtleXMgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyh0YXJnZXQpO1xuICAgIGxldCBpID0gLTE7XG5cbiAgICB3aGlsZSAoKytpIDwga2V5cy5sZW5ndGgpIHtcbiAgICAgIGNvbnN0IGtleSA9IGtleXNbaV07XG4gICAgICBpZiAoaXNBcnJheUluZGV4KGtleSkpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVSUl9JTlZBTElEX1BBQ0tBR0VfQ09ORklHKFxuICAgICAgICAgIGZpbGVVUkxUb1BhdGgkMihwYWNrYWdlSnNvblVybCksXG4gICAgICAgICAgYmFzZSxcbiAgICAgICAgICAnXCJleHBvcnRzXCIgY2Fubm90IGNvbnRhaW4gbnVtZXJpYyBwcm9wZXJ0eSBrZXlzLidcbiAgICAgICAgKVxuICAgICAgfVxuICAgIH1cblxuICAgIGkgPSAtMTtcblxuICAgIHdoaWxlICgrK2kgPCBrZXlzLmxlbmd0aCkge1xuICAgICAgY29uc3Qga2V5ID0ga2V5c1tpXTtcbiAgICAgIGlmIChrZXkgPT09ICdkZWZhdWx0JyB8fCAoY29uZGl0aW9ucyAmJiBjb25kaXRpb25zLmhhcyhrZXkpKSkge1xuICAgICAgICAvKiogQHR5cGUge3Vua25vd259ICovXG4gICAgICAgIGNvbnN0IGNvbmRpdGlvbmFsVGFyZ2V0ID0gdGFyZ2V0W2tleV07XG4gICAgICAgIGNvbnN0IHJlc29sdmVkID0gcmVzb2x2ZVBhY2thZ2VUYXJnZXQoXG4gICAgICAgICAgcGFja2FnZUpzb25VcmwsXG4gICAgICAgICAgY29uZGl0aW9uYWxUYXJnZXQsXG4gICAgICAgICAgc3VicGF0aCxcbiAgICAgICAgICBwYWNrYWdlU3VicGF0aCxcbiAgICAgICAgICBiYXNlLFxuICAgICAgICAgIHBhdHRlcm4sXG4gICAgICAgICAgaW50ZXJuYWwsXG4gICAgICAgICAgY29uZGl0aW9uc1xuICAgICAgICApO1xuICAgICAgICBpZiAocmVzb2x2ZWQgPT09IHVuZGVmaW5lZCkgY29udGludWVcbiAgICAgICAgcmV0dXJuIHJlc29sdmVkXG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHVuZGVmaW5lZFxuICB9XG5cbiAgaWYgKHRhcmdldCA9PT0gbnVsbCkge1xuICAgIHJldHVybiBudWxsXG4gIH1cblxuICB0aHJvd0ludmFsaWRQYWNrYWdlVGFyZ2V0KFxuICAgIHBhY2thZ2VTdWJwYXRoLFxuICAgIHRhcmdldCxcbiAgICBwYWNrYWdlSnNvblVybCxcbiAgICBpbnRlcm5hbCxcbiAgICBiYXNlXG4gICk7XG59XG5cbi8qKlxuICogQHBhcmFtIHt1bmtub3dufSBleHBvcnRzXG4gKiBAcGFyYW0ge1VSTH0gcGFja2FnZUpzb25VcmxcbiAqIEBwYXJhbSB7VVJMfSBiYXNlXG4gKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAqL1xuZnVuY3Rpb24gaXNDb25kaXRpb25hbEV4cG9ydHNNYWluU3VnYXIoZXhwb3J0cywgcGFja2FnZUpzb25VcmwsIGJhc2UpIHtcbiAgaWYgKHR5cGVvZiBleHBvcnRzID09PSAnc3RyaW5nJyB8fCBBcnJheS5pc0FycmF5KGV4cG9ydHMpKSByZXR1cm4gdHJ1ZVxuICBpZiAodHlwZW9mIGV4cG9ydHMgIT09ICdvYmplY3QnIHx8IGV4cG9ydHMgPT09IG51bGwpIHJldHVybiBmYWxzZVxuXG4gIGNvbnN0IGtleXMgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyhleHBvcnRzKTtcbiAgbGV0IGlzQ29uZGl0aW9uYWxTdWdhciA9IGZhbHNlO1xuICBsZXQgaSA9IDA7XG4gIGxldCBqID0gLTE7XG4gIHdoaWxlICgrK2ogPCBrZXlzLmxlbmd0aCkge1xuICAgIGNvbnN0IGtleSA9IGtleXNbal07XG4gICAgY29uc3QgY3VySXNDb25kaXRpb25hbFN1Z2FyID0ga2V5ID09PSAnJyB8fCBrZXlbMF0gIT09ICcuJztcbiAgICBpZiAoaSsrID09PSAwKSB7XG4gICAgICBpc0NvbmRpdGlvbmFsU3VnYXIgPSBjdXJJc0NvbmRpdGlvbmFsU3VnYXI7XG4gICAgfSBlbHNlIGlmIChpc0NvbmRpdGlvbmFsU3VnYXIgIT09IGN1cklzQ29uZGl0aW9uYWxTdWdhcikge1xuICAgICAgdGhyb3cgbmV3IEVSUl9JTlZBTElEX1BBQ0tBR0VfQ09ORklHKFxuICAgICAgICBmaWxlVVJMVG9QYXRoJDIocGFja2FnZUpzb25VcmwpLFxuICAgICAgICBiYXNlLFxuICAgICAgICAnXCJleHBvcnRzXCIgY2Fubm90IGNvbnRhaW4gc29tZSBrZXlzIHN0YXJ0aW5nIHdpdGggXFwnLlxcJyBhbmQgc29tZSBub3QuJyArXG4gICAgICAgICAgJyBUaGUgZXhwb3J0cyBvYmplY3QgbXVzdCBlaXRoZXIgYmUgYW4gb2JqZWN0IG9mIHBhY2thZ2Ugc3VicGF0aCBrZXlzJyArXG4gICAgICAgICAgJyBvciBhbiBvYmplY3Qgb2YgbWFpbiBlbnRyeSBjb25kaXRpb24gbmFtZSBrZXlzIG9ubHkuJ1xuICAgICAgKVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiBpc0NvbmRpdGlvbmFsU3VnYXJcbn1cblxuLyoqXG4gKiBAcGFyYW0ge1VSTH0gcGFja2FnZUpzb25VcmxcbiAqIEBwYXJhbSB7c3RyaW5nfSBwYWNrYWdlU3VicGF0aFxuICogQHBhcmFtIHtPYmplY3QuPHN0cmluZywgdW5rbm93bj59IHBhY2thZ2VDb25maWdcbiAqIEBwYXJhbSB7VVJMfSBiYXNlXG4gKiBAcGFyYW0ge1NldDxzdHJpbmc+fSBjb25kaXRpb25zXG4gKiBAcmV0dXJucyB7UmVzb2x2ZU9iamVjdH1cbiAqL1xuZnVuY3Rpb24gcGFja2FnZUV4cG9ydHNSZXNvbHZlKFxuICBwYWNrYWdlSnNvblVybCxcbiAgcGFja2FnZVN1YnBhdGgsXG4gIHBhY2thZ2VDb25maWcsXG4gIGJhc2UsXG4gIGNvbmRpdGlvbnNcbikge1xuICBsZXQgZXhwb3J0cyA9IHBhY2thZ2VDb25maWcuZXhwb3J0cztcbiAgaWYgKGlzQ29uZGl0aW9uYWxFeHBvcnRzTWFpblN1Z2FyKGV4cG9ydHMsIHBhY2thZ2VKc29uVXJsLCBiYXNlKSlcbiAgICBleHBvcnRzID0geycuJzogZXhwb3J0c307XG5cbiAgaWYgKG93bi5jYWxsKGV4cG9ydHMsIHBhY2thZ2VTdWJwYXRoKSkge1xuICAgIGNvbnN0IHRhcmdldCA9IGV4cG9ydHNbcGFja2FnZVN1YnBhdGhdO1xuICAgIGNvbnN0IHJlc29sdmVkID0gcmVzb2x2ZVBhY2thZ2VUYXJnZXQoXG4gICAgICBwYWNrYWdlSnNvblVybCxcbiAgICAgIHRhcmdldCxcbiAgICAgICcnLFxuICAgICAgcGFja2FnZVN1YnBhdGgsXG4gICAgICBiYXNlLFxuICAgICAgZmFsc2UsXG4gICAgICBmYWxzZSxcbiAgICAgIGNvbmRpdGlvbnNcbiAgICApO1xuICAgIGlmIChyZXNvbHZlZCA9PT0gbnVsbCB8fCByZXNvbHZlZCA9PT0gdW5kZWZpbmVkKVxuICAgICAgdGhyb3dFeHBvcnRzTm90Rm91bmQocGFja2FnZVN1YnBhdGgsIHBhY2thZ2VKc29uVXJsLCBiYXNlKTtcbiAgICByZXR1cm4ge3Jlc29sdmVkLCBleGFjdDogdHJ1ZX1cbiAgfVxuXG4gIGxldCBiZXN0TWF0Y2ggPSAnJztcbiAgY29uc3Qga2V5cyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzKGV4cG9ydHMpO1xuICBsZXQgaSA9IC0xO1xuXG4gIHdoaWxlICgrK2kgPCBrZXlzLmxlbmd0aCkge1xuICAgIGNvbnN0IGtleSA9IGtleXNbaV07XG4gICAgaWYgKFxuICAgICAga2V5W2tleS5sZW5ndGggLSAxXSA9PT0gJyonICYmXG4gICAgICBwYWNrYWdlU3VicGF0aC5zdGFydHNXaXRoKGtleS5zbGljZSgwLCAtMSkpICYmXG4gICAgICBwYWNrYWdlU3VicGF0aC5sZW5ndGggPj0ga2V5Lmxlbmd0aCAmJlxuICAgICAga2V5Lmxlbmd0aCA+IGJlc3RNYXRjaC5sZW5ndGhcbiAgICApIHtcbiAgICAgIGJlc3RNYXRjaCA9IGtleTtcbiAgICB9IGVsc2UgaWYgKFxuICAgICAga2V5W2tleS5sZW5ndGggLSAxXSA9PT0gJy8nICYmXG4gICAgICBwYWNrYWdlU3VicGF0aC5zdGFydHNXaXRoKGtleSkgJiZcbiAgICAgIGtleS5sZW5ndGggPiBiZXN0TWF0Y2gubGVuZ3RoXG4gICAgKSB7XG4gICAgICBiZXN0TWF0Y2ggPSBrZXk7XG4gICAgfVxuICB9XG5cbiAgaWYgKGJlc3RNYXRjaCkge1xuICAgIGNvbnN0IHRhcmdldCA9IGV4cG9ydHNbYmVzdE1hdGNoXTtcbiAgICBjb25zdCBwYXR0ZXJuID0gYmVzdE1hdGNoW2Jlc3RNYXRjaC5sZW5ndGggLSAxXSA9PT0gJyonO1xuICAgIGNvbnN0IHN1YnBhdGggPSBwYWNrYWdlU3VicGF0aC5zbGljZShiZXN0TWF0Y2gubGVuZ3RoIC0gKHBhdHRlcm4gPyAxIDogMCkpO1xuICAgIGNvbnN0IHJlc29sdmVkID0gcmVzb2x2ZVBhY2thZ2VUYXJnZXQoXG4gICAgICBwYWNrYWdlSnNvblVybCxcbiAgICAgIHRhcmdldCxcbiAgICAgIHN1YnBhdGgsXG4gICAgICBiZXN0TWF0Y2gsXG4gICAgICBiYXNlLFxuICAgICAgcGF0dGVybixcbiAgICAgIGZhbHNlLFxuICAgICAgY29uZGl0aW9uc1xuICAgICk7XG4gICAgaWYgKHJlc29sdmVkID09PSBudWxsIHx8IHJlc29sdmVkID09PSB1bmRlZmluZWQpXG4gICAgICB0aHJvd0V4cG9ydHNOb3RGb3VuZChwYWNrYWdlU3VicGF0aCwgcGFja2FnZUpzb25VcmwsIGJhc2UpO1xuICAgIGlmICghcGF0dGVybilcbiAgICAgIGVtaXRGb2xkZXJNYXBEZXByZWNhdGlvbihiZXN0TWF0Y2gsIHBhY2thZ2VKc29uVXJsLCB0cnVlLCBiYXNlKTtcbiAgICByZXR1cm4ge3Jlc29sdmVkLCBleGFjdDogcGF0dGVybn1cbiAgfVxuXG4gIHRocm93RXhwb3J0c05vdEZvdW5kKHBhY2thZ2VTdWJwYXRoLCBwYWNrYWdlSnNvblVybCwgYmFzZSk7XG59XG5cbi8qKlxuICogQHBhcmFtIHtzdHJpbmd9IG5hbWVcbiAqIEBwYXJhbSB7VVJMfSBiYXNlXG4gKiBAcGFyYW0ge1NldDxzdHJpbmc+fSBbY29uZGl0aW9uc11cbiAqIEByZXR1cm5zIHtSZXNvbHZlT2JqZWN0fVxuICovXG5mdW5jdGlvbiBwYWNrYWdlSW1wb3J0c1Jlc29sdmUobmFtZSwgYmFzZSwgY29uZGl0aW9ucykge1xuICBpZiAobmFtZSA9PT0gJyMnIHx8IG5hbWUuc3RhcnRzV2l0aCgnIy8nKSkge1xuICAgIGNvbnN0IHJlYXNvbiA9ICdpcyBub3QgYSB2YWxpZCBpbnRlcm5hbCBpbXBvcnRzIHNwZWNpZmllciBuYW1lJztcbiAgICB0aHJvdyBuZXcgRVJSX0lOVkFMSURfTU9EVUxFX1NQRUNJRklFUihuYW1lLCByZWFzb24sIGZpbGVVUkxUb1BhdGgkMihiYXNlKSlcbiAgfVxuXG4gIC8qKiBAdHlwZSB7VVJMfSAqL1xuICBsZXQgcGFja2FnZUpzb25Vcmw7XG5cbiAgY29uc3QgcGFja2FnZUNvbmZpZyA9IGdldFBhY2thZ2VTY29wZUNvbmZpZyhiYXNlKTtcblxuICBpZiAocGFja2FnZUNvbmZpZy5leGlzdHMpIHtcbiAgICBwYWNrYWdlSnNvblVybCA9IHBhdGhUb0ZpbGVVUkwocGFja2FnZUNvbmZpZy5wanNvblBhdGgpO1xuICAgIGNvbnN0IGltcG9ydHMgPSBwYWNrYWdlQ29uZmlnLmltcG9ydHM7XG4gICAgaWYgKGltcG9ydHMpIHtcbiAgICAgIGlmIChvd24uY2FsbChpbXBvcnRzLCBuYW1lKSkge1xuICAgICAgICBjb25zdCByZXNvbHZlZCA9IHJlc29sdmVQYWNrYWdlVGFyZ2V0KFxuICAgICAgICAgIHBhY2thZ2VKc29uVXJsLFxuICAgICAgICAgIGltcG9ydHNbbmFtZV0sXG4gICAgICAgICAgJycsXG4gICAgICAgICAgbmFtZSxcbiAgICAgICAgICBiYXNlLFxuICAgICAgICAgIGZhbHNlLFxuICAgICAgICAgIHRydWUsXG4gICAgICAgICAgY29uZGl0aW9uc1xuICAgICAgICApO1xuICAgICAgICBpZiAocmVzb2x2ZWQgIT09IG51bGwpIHJldHVybiB7cmVzb2x2ZWQsIGV4YWN0OiB0cnVlfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbGV0IGJlc3RNYXRjaCA9ICcnO1xuICAgICAgICBjb25zdCBrZXlzID0gT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXMoaW1wb3J0cyk7XG4gICAgICAgIGxldCBpID0gLTE7XG5cbiAgICAgICAgd2hpbGUgKCsraSA8IGtleXMubGVuZ3RoKSB7XG4gICAgICAgICAgY29uc3Qga2V5ID0ga2V5c1tpXTtcblxuICAgICAgICAgIGlmIChcbiAgICAgICAgICAgIGtleVtrZXkubGVuZ3RoIC0gMV0gPT09ICcqJyAmJlxuICAgICAgICAgICAgbmFtZS5zdGFydHNXaXRoKGtleS5zbGljZSgwLCAtMSkpICYmXG4gICAgICAgICAgICBuYW1lLmxlbmd0aCA+PSBrZXkubGVuZ3RoICYmXG4gICAgICAgICAgICBrZXkubGVuZ3RoID4gYmVzdE1hdGNoLmxlbmd0aFxuICAgICAgICAgICkge1xuICAgICAgICAgICAgYmVzdE1hdGNoID0ga2V5O1xuICAgICAgICAgIH0gZWxzZSBpZiAoXG4gICAgICAgICAgICBrZXlba2V5Lmxlbmd0aCAtIDFdID09PSAnLycgJiZcbiAgICAgICAgICAgIG5hbWUuc3RhcnRzV2l0aChrZXkpICYmXG4gICAgICAgICAgICBrZXkubGVuZ3RoID4gYmVzdE1hdGNoLmxlbmd0aFxuICAgICAgICAgICkge1xuICAgICAgICAgICAgYmVzdE1hdGNoID0ga2V5O1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChiZXN0TWF0Y2gpIHtcbiAgICAgICAgICBjb25zdCB0YXJnZXQgPSBpbXBvcnRzW2Jlc3RNYXRjaF07XG4gICAgICAgICAgY29uc3QgcGF0dGVybiA9IGJlc3RNYXRjaFtiZXN0TWF0Y2gubGVuZ3RoIC0gMV0gPT09ICcqJztcbiAgICAgICAgICBjb25zdCBzdWJwYXRoID0gbmFtZS5zbGljZShiZXN0TWF0Y2gubGVuZ3RoIC0gKHBhdHRlcm4gPyAxIDogMCkpO1xuICAgICAgICAgIGNvbnN0IHJlc29sdmVkID0gcmVzb2x2ZVBhY2thZ2VUYXJnZXQoXG4gICAgICAgICAgICBwYWNrYWdlSnNvblVybCxcbiAgICAgICAgICAgIHRhcmdldCxcbiAgICAgICAgICAgIHN1YnBhdGgsXG4gICAgICAgICAgICBiZXN0TWF0Y2gsXG4gICAgICAgICAgICBiYXNlLFxuICAgICAgICAgICAgcGF0dGVybixcbiAgICAgICAgICAgIHRydWUsXG4gICAgICAgICAgICBjb25kaXRpb25zXG4gICAgICAgICAgKTtcbiAgICAgICAgICBpZiAocmVzb2x2ZWQgIT09IG51bGwpIHtcbiAgICAgICAgICAgIGlmICghcGF0dGVybilcbiAgICAgICAgICAgICAgZW1pdEZvbGRlck1hcERlcHJlY2F0aW9uKGJlc3RNYXRjaCwgcGFja2FnZUpzb25VcmwsIGZhbHNlLCBiYXNlKTtcbiAgICAgICAgICAgIHJldHVybiB7cmVzb2x2ZWQsIGV4YWN0OiBwYXR0ZXJufVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHRocm93SW1wb3J0Tm90RGVmaW5lZChuYW1lLCBwYWNrYWdlSnNvblVybCwgYmFzZSk7XG59XG5cbi8qKlxuICogQHBhcmFtIHtzdHJpbmd9IHVybFxuICogQHJldHVybnMge1BhY2thZ2VUeXBlfVxuICovXG5mdW5jdGlvbiBnZXRQYWNrYWdlVHlwZSh1cmwpIHtcbiAgY29uc3QgcGFja2FnZUNvbmZpZyA9IGdldFBhY2thZ2VTY29wZUNvbmZpZyh1cmwpO1xuICByZXR1cm4gcGFja2FnZUNvbmZpZy50eXBlXG59XG5cbi8qKlxuICogQHBhcmFtIHtzdHJpbmd9IHNwZWNpZmllclxuICogQHBhcmFtIHtVUkx9IGJhc2VcbiAqL1xuZnVuY3Rpb24gcGFyc2VQYWNrYWdlTmFtZShzcGVjaWZpZXIsIGJhc2UpIHtcbiAgbGV0IHNlcGFyYXRvckluZGV4ID0gc3BlY2lmaWVyLmluZGV4T2YoJy8nKTtcbiAgbGV0IHZhbGlkUGFja2FnZU5hbWUgPSB0cnVlO1xuICBsZXQgaXNTY29wZWQgPSBmYWxzZTtcbiAgaWYgKHNwZWNpZmllclswXSA9PT0gJ0AnKSB7XG4gICAgaXNTY29wZWQgPSB0cnVlO1xuICAgIGlmIChzZXBhcmF0b3JJbmRleCA9PT0gLTEgfHwgc3BlY2lmaWVyLmxlbmd0aCA9PT0gMCkge1xuICAgICAgdmFsaWRQYWNrYWdlTmFtZSA9IGZhbHNlO1xuICAgIH0gZWxzZSB7XG4gICAgICBzZXBhcmF0b3JJbmRleCA9IHNwZWNpZmllci5pbmRleE9mKCcvJywgc2VwYXJhdG9ySW5kZXggKyAxKTtcbiAgICB9XG4gIH1cblxuICBjb25zdCBwYWNrYWdlTmFtZSA9XG4gICAgc2VwYXJhdG9ySW5kZXggPT09IC0xID8gc3BlY2lmaWVyIDogc3BlY2lmaWVyLnNsaWNlKDAsIHNlcGFyYXRvckluZGV4KTtcblxuICAvLyBQYWNrYWdlIG5hbWUgY2Fubm90IGhhdmUgbGVhZGluZyAuIGFuZCBjYW5ub3QgaGF2ZSBwZXJjZW50LWVuY29kaW5nIG9yXG4gIC8vIHNlcGFyYXRvcnMuXG4gIGxldCBpID0gLTE7XG4gIHdoaWxlICgrK2kgPCBwYWNrYWdlTmFtZS5sZW5ndGgpIHtcbiAgICBpZiAocGFja2FnZU5hbWVbaV0gPT09ICclJyB8fCBwYWNrYWdlTmFtZVtpXSA9PT0gJ1xcXFwnKSB7XG4gICAgICB2YWxpZFBhY2thZ2VOYW1lID0gZmFsc2U7XG4gICAgICBicmVha1xuICAgIH1cbiAgfVxuXG4gIGlmICghdmFsaWRQYWNrYWdlTmFtZSkge1xuICAgIHRocm93IG5ldyBFUlJfSU5WQUxJRF9NT0RVTEVfU1BFQ0lGSUVSKFxuICAgICAgc3BlY2lmaWVyLFxuICAgICAgJ2lzIG5vdCBhIHZhbGlkIHBhY2thZ2UgbmFtZScsXG4gICAgICBmaWxlVVJMVG9QYXRoJDIoYmFzZSlcbiAgICApXG4gIH1cblxuICBjb25zdCBwYWNrYWdlU3VicGF0aCA9XG4gICAgJy4nICsgKHNlcGFyYXRvckluZGV4ID09PSAtMSA/ICcnIDogc3BlY2lmaWVyLnNsaWNlKHNlcGFyYXRvckluZGV4KSk7XG5cbiAgcmV0dXJuIHtwYWNrYWdlTmFtZSwgcGFja2FnZVN1YnBhdGgsIGlzU2NvcGVkfVxufVxuXG4vKipcbiAqIEBwYXJhbSB7c3RyaW5nfSBzcGVjaWZpZXJcbiAqIEBwYXJhbSB7VVJMfSBiYXNlXG4gKiBAcGFyYW0ge1NldDxzdHJpbmc+fSBjb25kaXRpb25zXG4gKiBAcmV0dXJucyB7VVJMfVxuICovXG5mdW5jdGlvbiBwYWNrYWdlUmVzb2x2ZShzcGVjaWZpZXIsIGJhc2UsIGNvbmRpdGlvbnMpIHtcbiAgY29uc3Qge3BhY2thZ2VOYW1lLCBwYWNrYWdlU3VicGF0aCwgaXNTY29wZWR9ID0gcGFyc2VQYWNrYWdlTmFtZShcbiAgICBzcGVjaWZpZXIsXG4gICAgYmFzZVxuICApO1xuXG4gIC8vIFJlc29sdmVTZWxmXG4gIGNvbnN0IHBhY2thZ2VDb25maWcgPSBnZXRQYWNrYWdlU2NvcGVDb25maWcoYmFzZSk7XG5cbiAgLy8gQ2Fu4oCZdCB0ZXN0LlxuICAvKiBjOCBpZ25vcmUgbmV4dCAxNiAqL1xuICBpZiAocGFja2FnZUNvbmZpZy5leGlzdHMpIHtcbiAgICBjb25zdCBwYWNrYWdlSnNvblVybCA9IHBhdGhUb0ZpbGVVUkwocGFja2FnZUNvbmZpZy5wanNvblBhdGgpO1xuICAgIGlmIChcbiAgICAgIHBhY2thZ2VDb25maWcubmFtZSA9PT0gcGFja2FnZU5hbWUgJiZcbiAgICAgIHBhY2thZ2VDb25maWcuZXhwb3J0cyAhPT0gdW5kZWZpbmVkICYmXG4gICAgICBwYWNrYWdlQ29uZmlnLmV4cG9ydHMgIT09IG51bGxcbiAgICApIHtcbiAgICAgIHJldHVybiBwYWNrYWdlRXhwb3J0c1Jlc29sdmUoXG4gICAgICAgIHBhY2thZ2VKc29uVXJsLFxuICAgICAgICBwYWNrYWdlU3VicGF0aCxcbiAgICAgICAgcGFja2FnZUNvbmZpZyxcbiAgICAgICAgYmFzZSxcbiAgICAgICAgY29uZGl0aW9uc1xuICAgICAgKS5yZXNvbHZlZFxuICAgIH1cbiAgfVxuXG4gIGxldCBwYWNrYWdlSnNvblVybCA9IG5ldyBVUkwkMShcbiAgICAnLi9ub2RlX21vZHVsZXMvJyArIHBhY2thZ2VOYW1lICsgJy9wYWNrYWdlLmpzb24nLFxuICAgIGJhc2VcbiAgKTtcbiAgbGV0IHBhY2thZ2VKc29uUGF0aCA9IGZpbGVVUkxUb1BhdGgkMihwYWNrYWdlSnNvblVybCk7XG4gIC8qKiBAdHlwZSB7c3RyaW5nfSAqL1xuICBsZXQgbGFzdFBhdGg7XG4gIGRvIHtcbiAgICBjb25zdCBzdGF0ID0gdHJ5U3RhdFN5bmMocGFja2FnZUpzb25QYXRoLnNsaWNlKDAsIC0xMykpO1xuICAgIGlmICghc3RhdC5pc0RpcmVjdG9yeSgpKSB7XG4gICAgICBsYXN0UGF0aCA9IHBhY2thZ2VKc29uUGF0aDtcbiAgICAgIHBhY2thZ2VKc29uVXJsID0gbmV3IFVSTCQxKFxuICAgICAgICAoaXNTY29wZWQgPyAnLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzLycgOiAnLi4vLi4vLi4vbm9kZV9tb2R1bGVzLycpICtcbiAgICAgICAgICBwYWNrYWdlTmFtZSArXG4gICAgICAgICAgJy9wYWNrYWdlLmpzb24nLFxuICAgICAgICBwYWNrYWdlSnNvblVybFxuICAgICAgKTtcbiAgICAgIHBhY2thZ2VKc29uUGF0aCA9IGZpbGVVUkxUb1BhdGgkMihwYWNrYWdlSnNvblVybCk7XG4gICAgICBjb250aW51ZVxuICAgIH1cblxuICAgIC8vIFBhY2thZ2UgbWF0Y2guXG4gICAgY29uc3QgcGFja2FnZUNvbmZpZyA9IGdldFBhY2thZ2VDb25maWcocGFja2FnZUpzb25QYXRoLCBzcGVjaWZpZXIsIGJhc2UpO1xuICAgIGlmIChwYWNrYWdlQ29uZmlnLmV4cG9ydHMgIT09IHVuZGVmaW5lZCAmJiBwYWNrYWdlQ29uZmlnLmV4cG9ydHMgIT09IG51bGwpXG4gICAgICByZXR1cm4gcGFja2FnZUV4cG9ydHNSZXNvbHZlKFxuICAgICAgICBwYWNrYWdlSnNvblVybCxcbiAgICAgICAgcGFja2FnZVN1YnBhdGgsXG4gICAgICAgIHBhY2thZ2VDb25maWcsXG4gICAgICAgIGJhc2UsXG4gICAgICAgIGNvbmRpdGlvbnNcbiAgICAgICkucmVzb2x2ZWRcbiAgICBpZiAocGFja2FnZVN1YnBhdGggPT09ICcuJylcbiAgICAgIHJldHVybiBsZWdhY3lNYWluUmVzb2x2ZShwYWNrYWdlSnNvblVybCwgcGFja2FnZUNvbmZpZywgYmFzZSlcbiAgICByZXR1cm4gbmV3IFVSTCQxKHBhY2thZ2VTdWJwYXRoLCBwYWNrYWdlSnNvblVybClcbiAgICAvLyBDcm9zcy1wbGF0Zm9ybSByb290IGNoZWNrLlxuICB9IHdoaWxlIChwYWNrYWdlSnNvblBhdGgubGVuZ3RoICE9PSBsYXN0UGF0aC5sZW5ndGgpXG5cbiAgdGhyb3cgbmV3IEVSUl9NT0RVTEVfTk9UX0ZPVU5EKHBhY2thZ2VOYW1lLCBmaWxlVVJMVG9QYXRoJDIoYmFzZSkpXG59XG5cbi8qKlxuICogQHBhcmFtIHtzdHJpbmd9IHNwZWNpZmllclxuICogQHJldHVybnMge2Jvb2xlYW59XG4gKi9cbmZ1bmN0aW9uIGlzUmVsYXRpdmVTcGVjaWZpZXIoc3BlY2lmaWVyKSB7XG4gIGlmIChzcGVjaWZpZXJbMF0gPT09ICcuJykge1xuICAgIGlmIChzcGVjaWZpZXIubGVuZ3RoID09PSAxIHx8IHNwZWNpZmllclsxXSA9PT0gJy8nKSByZXR1cm4gdHJ1ZVxuICAgIGlmIChcbiAgICAgIHNwZWNpZmllclsxXSA9PT0gJy4nICYmXG4gICAgICAoc3BlY2lmaWVyLmxlbmd0aCA9PT0gMiB8fCBzcGVjaWZpZXJbMl0gPT09ICcvJylcbiAgICApIHtcbiAgICAgIHJldHVybiB0cnVlXG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGZhbHNlXG59XG5cbi8qKlxuICogQHBhcmFtIHtzdHJpbmd9IHNwZWNpZmllclxuICogQHJldHVybnMge2Jvb2xlYW59XG4gKi9cbmZ1bmN0aW9uIHNob3VsZEJlVHJlYXRlZEFzUmVsYXRpdmVPckFic29sdXRlUGF0aChzcGVjaWZpZXIpIHtcbiAgaWYgKHNwZWNpZmllciA9PT0gJycpIHJldHVybiBmYWxzZVxuICBpZiAoc3BlY2lmaWVyWzBdID09PSAnLycpIHJldHVybiB0cnVlXG4gIHJldHVybiBpc1JlbGF0aXZlU3BlY2lmaWVyKHNwZWNpZmllcilcbn1cblxuLyoqXG4gKiBUaGUg4oCcUmVzb2x2ZXIgQWxnb3JpdGhtIFNwZWNpZmljYXRpb27igJ0gYXMgZGV0YWlsZWQgaW4gdGhlIE5vZGUgZG9jcyAod2hpY2ggaXNcbiAqIHN5bmMgYW5kIHNsaWdodGx5IGxvd2VyLWxldmVsIHRoYW4gYHJlc29sdmVgKS5cbiAqXG4gKlxuICpcbiAqIEBwYXJhbSB7c3RyaW5nfSBzcGVjaWZpZXJcbiAqIEBwYXJhbSB7VVJMfSBiYXNlXG4gKiBAcGFyYW0ge1NldDxzdHJpbmc+fSBbY29uZGl0aW9uc11cbiAqIEByZXR1cm5zIHtVUkx9XG4gKi9cbmZ1bmN0aW9uIG1vZHVsZVJlc29sdmUoc3BlY2lmaWVyLCBiYXNlLCBjb25kaXRpb25zKSB7XG4gIC8vIE9yZGVyIHN3YXBwZWQgZnJvbSBzcGVjIGZvciBtaW5vciBwZXJmIGdhaW4uXG4gIC8vIE9rIHNpbmNlIHJlbGF0aXZlIFVSTHMgY2Fubm90IHBhcnNlIGFzIFVSTHMuXG4gIC8qKiBAdHlwZSB7VVJMfSAqL1xuICBsZXQgcmVzb2x2ZWQ7XG5cbiAgaWYgKHNob3VsZEJlVHJlYXRlZEFzUmVsYXRpdmVPckFic29sdXRlUGF0aChzcGVjaWZpZXIpKSB7XG4gICAgcmVzb2x2ZWQgPSBuZXcgVVJMJDEoc3BlY2lmaWVyLCBiYXNlKTtcbiAgfSBlbHNlIGlmIChzcGVjaWZpZXJbMF0gPT09ICcjJykge1xuKHtyZXNvbHZlZH0gPSBwYWNrYWdlSW1wb3J0c1Jlc29sdmUoc3BlY2lmaWVyLCBiYXNlLCBjb25kaXRpb25zKSk7XG4gIH0gZWxzZSB7XG4gICAgdHJ5IHtcbiAgICAgIHJlc29sdmVkID0gbmV3IFVSTCQxKHNwZWNpZmllcik7XG4gICAgfSBjYXRjaCB7XG4gICAgICByZXNvbHZlZCA9IHBhY2thZ2VSZXNvbHZlKHNwZWNpZmllciwgYmFzZSwgY29uZGl0aW9ucyk7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGZpbmFsaXplUmVzb2x1dGlvbihyZXNvbHZlZCwgYmFzZSlcbn1cblxuY29uc3QgREVGQVVMVF9DT05ESVRJT05TX1NFVCA9IG5ldyBTZXQoW1wibm9kZVwiLCBcImltcG9ydFwiXSk7XG5jb25zdCBERUZBVUxUX1VSTCA9IHBhdGhUb0ZpbGVVUkwocHJvY2Vzcy5jd2QoKSk7XG5jb25zdCBERUZBVUxUX0VYVEVOU0lPTlMgPSBbXCIubWpzXCIsIFwiLmNqc1wiLCBcIi5qc1wiLCBcIi5qc29uXCJdO1xuY29uc3QgTk9UX0ZPVU5EX0VSUk9SUyA9IG5ldyBTZXQoW1wiRVJSX01PRFVMRV9OT1RfRk9VTkRcIiwgXCJFUlJfVU5TVVBQT1JURURfRElSX0lNUE9SVFwiLCBcIk1PRFVMRV9OT1RfRk9VTkRcIl0pO1xuZnVuY3Rpb24gX3RyeU1vZHVsZVJlc29sdmUoaWQsIHVybCwgY29uZGl0aW9ucykge1xuICB0cnkge1xuICAgIHJldHVybiBtb2R1bGVSZXNvbHZlKGlkLCB1cmwsIGNvbmRpdGlvbnMpO1xuICB9IGNhdGNoIChlcnIpIHtcbiAgICBpZiAoIU5PVF9GT1VORF9FUlJPUlMuaGFzKGVyci5jb2RlKSkge1xuICAgICAgdGhyb3cgZXJyO1xuICAgIH1cbiAgICByZXR1cm4gbnVsbDtcbiAgfVxufVxuZnVuY3Rpb24gX3Jlc29sdmUoaWQsIG9wdHMgPSB7fSkge1xuICBpZiAoLyhub2RlfGRhdGF8aHR0cHxodHRwcyk6Ly50ZXN0KGlkKSkge1xuICAgIHJldHVybiBpZDtcbiAgfVxuICBpZiAoQlVJTFRJTl9NT0RVTEVTLmhhcyhpZCkpIHtcbiAgICByZXR1cm4gXCJub2RlOlwiICsgaWQ7XG4gIH1cbiAgaWYgKGlzQWJzb2x1dGUoaWQpKSB7XG4gICAgcmV0dXJuIGlkO1xuICB9XG4gIGNvbnN0IGNvbmRpdGlvbnNTZXQgPSBvcHRzLmNvbmRpdGlvbnMgPyBuZXcgU2V0KG9wdHMuY29uZGl0aW9ucykgOiBERUZBVUxUX0NPTkRJVElPTlNfU0VUO1xuICBjb25zdCBfdXJscyA9IChBcnJheS5pc0FycmF5KG9wdHMudXJsKSA/IG9wdHMudXJsIDogW29wdHMudXJsXSkuZmlsdGVyKEJvb2xlYW4pLm1hcCgodSkgPT4gbmV3IFVSTChub3JtYWxpemVpZCh1LnRvU3RyaW5nKCkpKSk7XG4gIGlmICghX3VybHMubGVuZ3RoKSB7XG4gICAgX3VybHMucHVzaChERUZBVUxUX1VSTCk7XG4gIH1cbiAgY29uc3QgdXJscyA9IFsuLi5fdXJsc107XG4gIGZvciAoY29uc3QgdXJsIG9mIF91cmxzKSB7XG4gICAgaWYgKHVybC5wcm90b2NvbCA9PT0gXCJmaWxlOlwiICYmICF1cmwucGF0aG5hbWUuaW5jbHVkZXMoXCJub2RlX21vZHVsZXNcIikpIHtcbiAgICAgIGNvbnN0IG5ld1VSTCA9IG5ldyBVUkwodXJsKTtcbiAgICAgIG5ld1VSTC5wYXRobmFtZSArPSBcIi9ub2RlX21vZHVsZXNcIjtcbiAgICAgIHVybHMucHVzaChuZXdVUkwpO1xuICAgIH1cbiAgfVxuICBsZXQgcmVzb2x2ZWQ7XG4gIGZvciAoY29uc3QgdXJsIG9mIHVybHMpIHtcbiAgICByZXNvbHZlZCA9IF90cnlNb2R1bGVSZXNvbHZlKGlkLCB1cmwsIGNvbmRpdGlvbnNTZXQpO1xuICAgIGlmIChyZXNvbHZlZCkge1xuICAgICAgYnJlYWs7XG4gICAgfVxuICAgIGZvciAoY29uc3QgcHJlZml4IG9mIFtcIlwiLCBcIi9pbmRleFwiXSkge1xuICAgICAgZm9yIChjb25zdCBleHQgb2Ygb3B0cy5leHRlbnNpb25zIHx8IERFRkFVTFRfRVhURU5TSU9OUykge1xuICAgICAgICByZXNvbHZlZCA9IF90cnlNb2R1bGVSZXNvbHZlKGlkICsgcHJlZml4ICsgZXh0LCB1cmwsIGNvbmRpdGlvbnNTZXQpO1xuICAgICAgICBpZiAocmVzb2x2ZWQpIHtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgaWYgKHJlc29sdmVkKSB7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cbiAgfVxuICBpZiAoIXJlc29sdmVkKSB7XG4gICAgY29uc3QgZXJyID0gbmV3IEVycm9yKGBDYW5ub3QgZmluZCBtb2R1bGUgJHtpZH0gaW1wb3J0ZWQgZnJvbSAke3VybHMuam9pbihcIiwgXCIpfWApO1xuICAgIGVyci5jb2RlID0gXCJFUlJfTU9EVUxFX05PVF9GT1VORFwiO1xuICAgIHRocm93IGVycjtcbiAgfVxuICBjb25zdCByZWFsUGF0aCA9IHJlYWxwYXRoU3luYyhmaWxlVVJMVG9QYXRoKHJlc29sdmVkKSk7XG4gIHJldHVybiBwYXRoVG9GaWxlVVJMKHJlYWxQYXRoKS50b1N0cmluZygpO1xufVxuZnVuY3Rpb24gcmVzb2x2ZVN5bmMoaWQsIG9wdHMpIHtcbiAgcmV0dXJuIF9yZXNvbHZlKGlkLCBvcHRzKTtcbn1cbmZ1bmN0aW9uIHJlc29sdmVQYXRoU3luYyhpZCwgb3B0cykge1xuICByZXR1cm4gZmlsZVVSTFRvUGF0aChyZXNvbHZlU3luYyhpZCwgb3B0cykpO1xufVxuZnVuY3Rpb24gcmVzb2x2ZVBhdGgoaWQsIG9wdHMpIHtcbiAgcmV0dXJuIHBjYWxsKHJlc29sdmVQYXRoU3luYywgaWQsIG9wdHMpO1xufVxuXG5jb25zdCBkZWZhdWx0RmluZE9wdGlvbnMgPSB7XG4gIHN0YXJ0aW5nRnJvbTogXCIuXCIsXG4gIHJvb3RQYXR0ZXJuOiAvXm5vZGVfbW9kdWxlcyQvLFxuICB0ZXN0OiAoZmlsZVBhdGgpID0+IHtcbiAgICB0cnkge1xuICAgICAgaWYgKHN0YXRTeW5jKGZpbGVQYXRoKS5pc0ZpbGUoKSkge1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH1cbiAgICB9IGNhdGNoIHtcbiAgICB9XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbn07XG5hc3luYyBmdW5jdGlvbiBmaW5kTmVhcmVzdEZpbGUoZmlsZW5hbWUsIF9vcHRpb25zID0ge30pIHtcbiAgY29uc3Qgb3B0aW9ucyA9IHsgLi4uZGVmYXVsdEZpbmRPcHRpb25zLCAuLi5fb3B0aW9ucyB9O1xuICBjb25zdCBiYXNlUGF0aCA9IHJlc29sdmUkMihvcHRpb25zLnN0YXJ0aW5nRnJvbSk7XG4gIGNvbnN0IGxlYWRpbmdTbGFzaCA9IGJhc2VQYXRoWzBdID09PSBcIi9cIjtcbiAgY29uc3Qgc2VnbWVudHMgPSBiYXNlUGF0aC5zcGxpdChcIi9cIikuZmlsdGVyKEJvb2xlYW4pO1xuICBpZiAobGVhZGluZ1NsYXNoKSB7XG4gICAgc2VnbWVudHNbMF0gPSBcIi9cIiArIHNlZ21lbnRzWzBdO1xuICB9XG4gIGxldCByb290ID0gc2VnbWVudHMuZmluZEluZGV4KChyKSA9PiByLm1hdGNoKG9wdGlvbnMucm9vdFBhdHRlcm4pKTtcbiAgaWYgKHJvb3QgPT09IC0xKVxuICAgIHJvb3QgPSAwO1xuICBmb3IgKGxldCBpID0gc2VnbWVudHMubGVuZ3RoOyBpID4gcm9vdDsgaS0tKSB7XG4gICAgY29uc3QgZmlsZVBhdGggPSBqb2luJDEoLi4uc2VnbWVudHMuc2xpY2UoMCwgaSksIGZpbGVuYW1lKTtcbiAgICBpZiAoYXdhaXQgb3B0aW9ucy50ZXN0KGZpbGVQYXRoKSkge1xuICAgICAgcmV0dXJuIGZpbGVQYXRoO1xuICAgIH1cbiAgfVxuICB0aHJvdyBuZXcgRXJyb3IoYENhbm5vdCBmaW5kIG1hdGNoaW5nICR7ZmlsZW5hbWV9IGluICR7b3B0aW9ucy5zdGFydGluZ0Zyb219IG9yIHBhcmVudCBkaXJlY3Rvcmllc2ApO1xufVxuYXN5bmMgZnVuY3Rpb24gcmVhZFBhY2thZ2VKU09OKGlkLCBvcHRzID0ge30pIHtcbiAgY29uc3QgcmVzb2x2ZWRQYXRoID0gYXdhaXQgcmVzb2x2ZVBhY2thZ2VKU09OKGlkLCBvcHRzKTtcbiAgY29uc3QgYmxvYiA9IGF3YWl0IHByb21pc2VzLnJlYWRGaWxlKHJlc29sdmVkUGF0aCwgXCJ1dGYtOFwiKTtcbiAgcmV0dXJuIEpTT04ucGFyc2UoYmxvYik7XG59XG5hc3luYyBmdW5jdGlvbiByZXNvbHZlUGFja2FnZUpTT04oaWQgPSBwcm9jZXNzLmN3ZCgpLCBvcHRzID0ge30pIHtcbiAgY29uc3QgcmVzb2x2ZWRQYXRoID0gaXNBYnNvbHV0ZSQxKGlkKSA/IGlkIDogYXdhaXQgcmVzb2x2ZVBhdGgoaWQsIG9wdHMpO1xuICByZXR1cm4gZmluZE5lYXJlc3RGaWxlKFwicGFja2FnZS5qc29uXCIsIHsgc3RhcnRpbmdGcm9tOiByZXNvbHZlZFBhdGggfSk7XG59XG5cbmNvbnN0IEVTTV9SRSA9IC8oW1xccztdfF4pKGltcG9ydFtcXHcse31cXHMqXSpmcm9tfGltcG9ydFxccypbJ1wiKntdfGV4cG9ydFxcYlxccyooPzpbKntdfGRlZmF1bHR8dHlwZXxmdW5jdGlvbnxjb25zdHx2YXJ8bGV0fGFzeW5jIGZ1bmN0aW9uKXxpbXBvcnRcXC5tZXRhXFxiKS9tO1xuY29uc3QgQlVJTFRJTl9FWFRFTlNJT05TID0gbmV3IFNldChbXCIubWpzXCIsIFwiLmNqc1wiLCBcIi5ub2RlXCIsIFwiLndhc21cIl0pO1xuZnVuY3Rpb24gaGFzRVNNU3ludGF4KGNvZGUpIHtcbiAgcmV0dXJuIEVTTV9SRS50ZXN0KGNvZGUpO1xufVxuY29uc3QgQ0pTX1JFID0gLyhbXFxzO118XikobW9kdWxlLmV4cG9ydHNcXGJ8ZXhwb3J0c1xcLlxcd3xyZXF1aXJlXFxzKlxcKHxnbG9iYWxcXC5cXHcpL207XG5mdW5jdGlvbiBoYXNDSlNTeW50YXgoY29kZSkge1xuICByZXR1cm4gQ0pTX1JFLnRlc3QoY29kZSk7XG59XG5mdW5jdGlvbiBkZXRlY3RTeW50YXgoY29kZSkge1xuICBjb25zdCBoYXNFU00gPSBoYXNFU01TeW50YXgoY29kZSk7XG4gIGNvbnN0IGhhc0NKUyA9IGhhc0NKU1N5bnRheChjb2RlKTtcbiAgcmV0dXJuIHtcbiAgICBoYXNFU00sXG4gICAgaGFzQ0pTLFxuICAgIGlzTWl4ZWQ6IGhhc0VTTSAmJiBoYXNDSlNcbiAgfTtcbn1cbmNvbnN0IHZhbGlkTm9kZUltcG9ydERlZmF1bHRzID0ge1xuICBhbGxvd2VkUHJvdG9jb2xzOiBbXCJub2RlXCIsIFwiZmlsZVwiLCBcImRhdGFcIl1cbn07XG5hc3luYyBmdW5jdGlvbiBpc1ZhbGlkTm9kZUltcG9ydChpZCwgX29wdHMgPSB7fSkge1xuICBpZiAoaXNOb2RlQnVpbHRpbihpZCkpIHtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuICBjb25zdCBvcHRzID0geyAuLi52YWxpZE5vZGVJbXBvcnREZWZhdWx0cywgLi4uX29wdHMgfTtcbiAgY29uc3QgcHJvdG8gPSBnZXRQcm90b2NvbChpZCk7XG4gIGlmIChwcm90byAmJiAhb3B0cy5hbGxvd2VkUHJvdG9jb2xzLmluY2x1ZGVzKHByb3RvKSkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICBpZiAocHJvdG8gPT09IFwiZGF0YVwiKSB7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cbiAgY29uc3QgcmVzb2x2ZWRQYXRoID0gYXdhaXQgcmVzb2x2ZVBhdGgkMShpZCwgb3B0cyk7XG4gIGNvbnN0IGV4dGVuc2lvbiA9IGV4dG5hbWUkMShyZXNvbHZlZFBhdGgpO1xuICBpZiAoQlVJTFRJTl9FWFRFTlNJT05TLmhhcyhleHRlbnNpb24pKSB7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cbiAgaWYgKGV4dGVuc2lvbiAhPT0gXCIuanNcIikge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuICBpZiAocmVzb2x2ZWRQYXRoLm1hdGNoKC9cXC4oXFx3Ky0pP2VzbT8oLVxcdyspP1xcLmpzJC8pKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIGNvbnN0IHBrZyA9IGF3YWl0IHJlYWRQYWNrYWdlSlNPTihyZXNvbHZlZFBhdGgpLmNhdGNoKCgpID0+IG51bGwpO1xuICBpZiAocGtnPy50eXBlID09PSBcIm1vZHVsZVwiKSB7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cbiAgY29uc3QgY29kZSA9IG9wdHMuY29kZSB8fCBhd2FpdCBwcm9taXNlcy5yZWFkRmlsZShyZXNvbHZlZFBhdGgsIFwidXRmLThcIikuY2F0Y2goKCkgPT4gbnVsbCkgfHwgXCJcIjtcbiAgcmV0dXJuIGhhc0NKU1N5bnRheChjb2RlKSB8fCAhaGFzRVNNU3ludGF4KGNvZGUpO1xufVxuXG5leHBvcnQgeyBEWU5BTUlDX0lNUE9SVF9SRSwgRVNNX1NUQVRJQ19JTVBPUlRfUkUsIEVYUE9SVF9ERUNBTF9SRSwgY3JlYXRlQ29tbW9uSlMsIGNyZWF0ZVJlc29sdmUsIGRldGVjdFN5bnRheCwgZXZhbE1vZHVsZSwgZmlsZVVSTFRvUGF0aCQxIGFzIGZpbGVVUkxUb1BhdGgsIGZpbmREeW5hbWljSW1wb3J0cywgZmluZEV4cG9ydHMsIGZpbmRTdGF0aWNJbXBvcnRzLCBnZW5EeW5hbWljSW1wb3J0LCBnZW5JbXBvcnQsIGdldFByb3RvY29sLCBoYXNDSlNTeW50YXgsIGhhc0VTTVN5bnRheCwgaW50ZXJvcERlZmF1bHQsIGlzTm9kZUJ1aWx0aW4sIGlzVmFsaWROb2RlSW1wb3J0LCBsb2FkTW9kdWxlLCBsb2FkVVJMLCBub3JtYWxpemVpZCQxIGFzIG5vcm1hbGl6ZWlkLCBwYXJzZVN0YXRpY0ltcG9ydCwgcmVzb2x2ZSwgcmVzb2x2ZUltcG9ydHMsIHJlc29sdmVQYXRoJDEgYXMgcmVzb2x2ZVBhdGgsIHJlc29sdmVQYXRoU3luYyQxIGFzIHJlc29sdmVQYXRoU3luYywgcmVzb2x2ZVN5bmMkMSBhcyByZXNvbHZlU3luYywgc2FuaXRpemVGaWxlUGF0aCwgc2FuaXRpemVVUklDb21wb25lbnQsIHRvRGF0YVVSTCwgdHJhbnNmb3JtTW9kdWxlIH07XG4iLCJpbXBvcnQgeyBmaWxlVVJMVG9QYXRoLCBwYXRoVG9GaWxlVVJMIH0gZnJvbSAndXJsJztcbmltcG9ydCB7IGRpcm5hbWUsIHJlc29sdmUgfSBmcm9tICdwYXRoZSc7XG5cbmNvbnN0IGlzV2luZG93cyA9IHByb2Nlc3MucGxhdGZvcm0gPT09IFwid2luMzJcIjtcbmZ1bmN0aW9uIHNsYXNoKHN0cikge1xuICByZXR1cm4gc3RyLnJlcGxhY2UoL1xcXFwvZywgXCIvXCIpO1xufVxuZnVuY3Rpb24gbm9ybWFsaXplSWQoaWQsIGJhc2UpIHtcbiAgaWYgKGJhc2UgJiYgaWQuc3RhcnRzV2l0aChiYXNlKSlcbiAgICBpZCA9IGAvJHtpZC5zbGljZShiYXNlLmxlbmd0aCl9YDtcbiAgcmV0dXJuIGlkLnJlcGxhY2UoL15cXC9AaWRcXC9fX3gwMF9fLywgXCJcXDBcIikucmVwbGFjZSgvXlxcL0BpZFxcLy8sIFwiXCIpLnJlcGxhY2UoL15fX3ZpdGUtYnJvd3Nlci1leHRlcm5hbDovLCBcIlwiKS5yZXBsYWNlKC9ebm9kZTovLCBcIlwiKS5yZXBsYWNlKC9bPyZddj1cXHcrLywgXCI/XCIpLnJlcGxhY2UoL1xcPyQvLCBcIlwiKTtcbn1cbmZ1bmN0aW9uIGlzUHJpbWl0aXZlKHYpIHtcbiAgcmV0dXJuIHYgIT09IE9iamVjdCh2KTtcbn1cbmZ1bmN0aW9uIHRvRmlsZVBhdGgoaWQsIHJvb3QpIHtcbiAgbGV0IGFic29sdXRlID0gc2xhc2goaWQpLnN0YXJ0c1dpdGgoXCIvQGZzL1wiKSA/IGlkLnNsaWNlKDQpIDogaWQuc3RhcnRzV2l0aChkaXJuYW1lKHJvb3QpKSA/IGlkIDogaWQuc3RhcnRzV2l0aChcIi9cIikgPyBzbGFzaChyZXNvbHZlKHJvb3QsIGlkLnNsaWNlKDEpKSkgOiBpZDtcbiAgaWYgKGFic29sdXRlLnN0YXJ0c1dpdGgoXCIvL1wiKSlcbiAgICBhYnNvbHV0ZSA9IGFic29sdXRlLnNsaWNlKDEpO1xuICByZXR1cm4gaXNXaW5kb3dzICYmIGFic29sdXRlLnN0YXJ0c1dpdGgoXCIvXCIpID8gZmlsZVVSTFRvUGF0aChwYXRoVG9GaWxlVVJMKGFic29sdXRlLnNsaWNlKDEpKS5ocmVmKSA6IGFic29sdXRlO1xufVxuXG5leHBvcnQgeyBpc1ByaW1pdGl2ZSwgaXNXaW5kb3dzLCBub3JtYWxpemVJZCwgc2xhc2gsIHRvRmlsZVBhdGggfTtcbiIsImZ1bmN0aW9uIGNyZWF0ZUJpcnBjKGZ1bmN0aW9ucywgb3B0aW9ucykge1xuICBjb25zdCB7XG4gICAgcG9zdCxcbiAgICBvbixcbiAgICBldmVudE5hbWVzID0gW10sXG4gICAgc2VyaWFsaXplID0gKGkpID0+IGksXG4gICAgZGVzZXJpYWxpemUgPSAoaSkgPT4gaVxuICB9ID0gb3B0aW9ucztcbiAgY29uc3QgcnBjUHJvbWlzZU1hcCA9IC8qIEBfX1BVUkVfXyAqLyBuZXcgTWFwKCk7XG4gIG9uKGFzeW5jIChkYXRhKSA9PiB7XG4gICAgY29uc3QgbXNnID0gZGVzZXJpYWxpemUoZGF0YSk7XG4gICAgaWYgKG1zZy50ID09PSBcInFcIikge1xuICAgICAgY29uc3QgeyBtOiBtZXRob2QsIGE6IGFyZ3MgfSA9IG1zZztcbiAgICAgIGxldCByZXN1bHQsIGVycm9yO1xuICAgICAgdHJ5IHtcbiAgICAgICAgcmVzdWx0ID0gYXdhaXQgZnVuY3Rpb25zW21ldGhvZF0oLi4uYXJncyk7XG4gICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGVycm9yID0gZTtcbiAgICAgIH1cbiAgICAgIGlmIChtc2cuaSlcbiAgICAgICAgcG9zdChzZXJpYWxpemUoeyB0OiBcInNcIiwgaTogbXNnLmksIHI6IHJlc3VsdCwgZTogZXJyb3IgfSkpO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zdCB7IGk6IGFjaywgcjogcmVzdWx0LCBlOiBlcnJvciB9ID0gbXNnO1xuICAgICAgY29uc3QgcHJvbWlzZSA9IHJwY1Byb21pc2VNYXAuZ2V0KGFjayk7XG4gICAgICBpZiAoZXJyb3IpXG4gICAgICAgIHByb21pc2U/LnJlamVjdChlcnJvcik7XG4gICAgICBlbHNlXG4gICAgICAgIHByb21pc2U/LnJlc29sdmUocmVzdWx0KTtcbiAgICAgIHJwY1Byb21pc2VNYXAuZGVsZXRlKGFjayk7XG4gICAgfVxuICB9KTtcbiAgcmV0dXJuIG5ldyBQcm94eSh7fSwge1xuICAgIGdldChfLCBtZXRob2QpIHtcbiAgICAgIGNvbnN0IHNlbmRFdmVudCA9ICguLi5hcmdzKSA9PiB7XG4gICAgICAgIHBvc3Qoc2VyaWFsaXplKHsgbTogbWV0aG9kLCBhOiBhcmdzLCB0OiBcInFcIiB9KSk7XG4gICAgICB9O1xuICAgICAgaWYgKGV2ZW50TmFtZXMuaW5jbHVkZXMobWV0aG9kKSkge1xuICAgICAgICBzZW5kRXZlbnQuYXNFdmVudCA9IHNlbmRFdmVudDtcbiAgICAgICAgcmV0dXJuIHNlbmRFdmVudDtcbiAgICAgIH1cbiAgICAgIGNvbnN0IHNlbmRDYWxsID0gKC4uLmFyZ3MpID0+IHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICBjb25zdCBpZCA9IG5hbm9pZCgpO1xuICAgICAgICAgIHJwY1Byb21pc2VNYXAuc2V0KGlkLCB7IHJlc29sdmUsIHJlamVjdCB9KTtcbiAgICAgICAgICBwb3N0KHNlcmlhbGl6ZSh7IG06IG1ldGhvZCwgYTogYXJncywgaTogaWQsIHQ6IFwicVwiIH0pKTtcbiAgICAgICAgfSk7XG4gICAgICB9O1xuICAgICAgc2VuZENhbGwuYXNFdmVudCA9IHNlbmRFdmVudDtcbiAgICAgIHJldHVybiBzZW5kQ2FsbDtcbiAgICB9XG4gIH0pO1xufVxuY29uc3QgdXJsQWxwaGFiZXQgPSBcInVzZWFuZG9tLTI2VDE5ODM0MFBYNzVweEpBQ0tWRVJZTUlOREJVU0hXT0xGX0dRWmJmZ2hqa2xxdnd5enJpY3RcIjtcbmZ1bmN0aW9uIG5hbm9pZChzaXplID0gMjEpIHtcbiAgbGV0IGlkID0gXCJcIjtcbiAgbGV0IGkgPSBzaXplO1xuICB3aGlsZSAoaS0tKVxuICAgIGlkICs9IHVybEFscGhhYmV0W01hdGgucmFuZG9tKCkgKiA2NCB8IDBdO1xuICByZXR1cm4gaWQ7XG59XG5cbmV4cG9ydCB7IGNyZWF0ZUJpcnBjIH07XG4iXSwibmFtZXMiOlsiaXNXaW5kb3dzIiwiZGlybmFtZSIsImZpbGVVUkxUb1BhdGgiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7O0FBT0EsTUFBTSxpQkFBaUIsR0FBRyxJQUFJLEdBQUcsQ0FBQyxjQUFjLENBQUMsQ0FBQztBQUNsRCxTQUFTLGdCQUFnQixDQUFDLEdBQUcsRUFBRTtBQUMvQixFQUFFLE9BQU8sR0FBRyxDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUUsR0FBRyxDQUFDLENBQUM7QUFDakMsQ0FBQztBQUNELFNBQVMsT0FBTyxDQUFDLEVBQUUsRUFBRSxHQUFHLElBQUksRUFBRTtBQUM5QixFQUFFLElBQUk7QUFDTixJQUFJLE9BQU8sT0FBTyxDQUFDLE9BQU8s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S0FBSyxTQUFTLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDM0QsSUFBSSxPQUFPLEdBQUcsS0FBSyxDQUFDO0FBQ3BCO0FBQ0EsTUFBTSxTQUFTLEdBQUcsV0FBVyxDQUFDO0FBQzlCLE1BQU0sS0FBSyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxLQUFLLEtBQUssU0FBUyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQzNELElBQUksT0FBTyxHQUFHLEtBQUssQ0FBQztBQUNwQjtBQUNBLE1BQU0sSUFBSSxHQUFHLE1BQU0sQ0FBQztBQUNwQixNQUFNLEtBQUssR0FBRyxPQUFPLENBQUM7QUFDdEIsTUFBTSxJQUFJLEdBQUcsTUFBTSxDQUFDO0FBQ3BCLE1BQU0sS0FBSyxHQUFHLE9BQU8sQ0FBQztBQUN0QixNQUFNLElBQUksR0FBRyxNQUFNLENBQUM7QUFDcEIsTUFBTSxLQUFLLEdBQUcsT0FBTyxDQUFDO0FBQ3RCO0FBQ0EsTUFBTSxLQUFLLEdBQUcsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRSxLQUFLLEtBQUs7QUFDbkMsRUFBRSxRQUFRLEVBQUU7QUFDWixJQUFJLEtBQUssS0FBSztBQUNkLE1BQU0sSUFBSSxPQUFPLENBQUMsS0FBSyxRQUFRO0FBQy9CLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQyxPQUFPLENBQUM7QUFDdEIsTUFBTSxJQUFJLE9BQU8sQ0FBQyxLQUFLLFFBQVE7QUFDL0IsUUFBUSxDQUFDLEdBQUcsQ0FBQyxDQUFDLE9BQU8sQ0FBQztBQUN0QixNQUFNLE9BQU8sQ0FBQyxLQUFLLENBQUM7QUFDcEI7QUFDQSxJQUFJLEtBQUssS0FBSztBQUNkLE1BQU0sSUFBSSxPQUFPLENBQUMsS0FBSyxRQUFRO0FBQy9CLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQyxPQUFPLENBQUM7QUFDdEIsTUFBTSxJQUFJLE9BQU8sQ0FBQyxLQUFLLFFBQVE7QUFDL0Is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Q0FBQyxpQkFBaUIsR0FBRyxJQUFJLEdBQUcsRUFBRSxDQUFDO0FBQ2xELEVBQUUsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLEtBQUs7QUFDN0MsSUFBSSxPQUFPLENBQUMsT0FBTyxFQUFFLElBQUksRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7QUFDM0MsSUFBSSxJQUFJLEdBQUcsQ0FBQztBQUNaO0FBQ0EsSUFBSSxJQUFJLEtBQUssQ0FBQyxDQUFDLENBQUMsRUFBRTtBQUNsQixNQUFNLEdBQUcsR0FBRyxFQUFFLENBQUM7QUFDZixLQUFLLE1BQU0sSUFBSSxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQUU7QUFDekIsTUFBTSxHQUFHLEdBQUcsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUM5QyxLQUFLLE1BQU0sSUFBSSxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQUU7QUFDekIsTUFBTSxJQUFJLENBQUMsS0FBSyxHQUFHLEVBQUU7QUFDckIsUUFBUSxHQUFHLEdBQUcsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDdEQsT0FBTyxNQUFNO0FBQ2IsUUFBUSxHQUFHLEdBQUcsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBQ25ELE9BQU87QUFD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QUFDLENBQUM7QUFDOUIsR0FBRztBQUNILEVBQUUsT0FBTyxZQUFZLENBQUMsTUFBTSxHQUFHLENBQUMsR0FBRyxZQUFZLEdBQUcsR0FBRyxDQUFDO0FBQ3RELENBQUMsQ0FBQztBQUNGLFNBQVMsZUFBZSxDQUFDLEtBQUssRUFBRSxjQUFjLEVBQUU7QUFDaEQsRUFBRSxJQUFJLEdBQUcsR0FBRyxFQUFFLENBQUM7QUFDZixFQUFFLElBQUksaUJBQWlCLEdBQUcsQ0FBQyxDQUFDO0FBQzVCLEVBQUUsSUFBSSxTQUFTLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFDckIsRUFBRSxJQUFJLElBQUksR0FBRyxDQUFDLENBQUM7QUFDZixFQUFFLElBQUksSUFBSSxHQUFHLElBQUksQ0FBQztBQUNsQixFQUFFLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsSUFBSSxLQUFLLENBQUMsTUFBTSxFQUFFLEVBQUUsQ0FBQyxFQUFFO0FBQzFDLElBQUksSUFBSSxDQUFDLEdBQUcsS0FBSyxDQUFDLE1BQU0sRUFBRTtBQUMxQixNQUFNLElBQUksR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDdEIsS0FBSyxNQUFNLElBQUksSUFBSSxLQUFLLEdBQUcsRUFBRTtBQUM3QixNQUFNLE1BQU07QUFDWixLQUFLLE1BQU07QUFDWCxNQUFNLElBQUksR0FBRyxHQUFHLENBQUM7QUFDakIsS0FBSztBQUNMLElBQUksSUFBSSxJQUFJLEtBQUssR0FBRyxFQUFFO0FBQ3RCLE1BQU0sSUFBSSxTQUFTLEtBQUssQ0FBQyxHQUFHLENBQUMsSUFBSSxJQUFJLEtBQUssQ0FBQyxFQUFFLENBQUMsTUFBTSxJQUFJLElBQUksS0FBSyxDQUFDLEVBQUU7QUFDcEUsUUFBUSxJQUFJLEdBQUcsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxJQUFJLGlCQUFpQixLQUFLLENBQUMsSUFBSSxHQUFHLENBQUMsR0FBRyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsS0FBSyxHQUFHLElBQUksR0FBRyxDQUFDLEdBQUcsQ0FBQyxNQUFN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QUM7QUFDdkIsR0FBRyxNQUFNO0FBQ1QsSUFBSSxJQUFJLEdBQUcsQ0FBQyxFQUFFLEVBQUUsSUFBSSxDQUFDLEVBQUUsS0FBSyxHQUFHLElBQUksR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDO0FBQzNDLEdBQUc7QUFDSDtBQUNBLEVBQUUsSUFBSSxHQUFHLENBQUMsRUFBRSxDQUFDLEVBQUU7QUFDZixJQUFJLEVBQUUsR0FBRyxFQUFFLENBQUM7QUFDWixHQUFHLE1BQU0sSUFBSSxHQUFHLENBQUMsRUFBRSxDQUFDLEVBQUU7QUFDdEIsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBQzdCLEdBQUcsTUFBTSxJQUFJLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRTtBQUN0QixJQUFJLEVBQUUsR0FBRyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUNqQyxHQUFHLE1BQU0sSUFBSSxHQUFHLEVBQUU7QUFDbEIsSUFBSSxFQUFFLEdBQUcsQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQztBQUN0QyxHQUFHLE1BQU0sSUFBSSxLQUFLLEVBQUU7QUFDcEIsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUNyQyxHQUFHLE1BQU07QUFDVCxJQUFJLEVBQUUsR0FBRyxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDO0FBQ25CLEdBQUc7QUFDSDtBQUNBLEVBQUUsT0FBTyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxD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
