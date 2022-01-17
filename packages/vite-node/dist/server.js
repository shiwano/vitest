import { existsSync } from 'fs';
import { isNodeBuiltin, isValidNodeImport } from 'mlly';
import { slash, toFilePath } from './utils.js';
import 'url';
import 'pathe';

const ESM_EXT_RE = /\.(es|esm|esm-browser|esm-bundler|es6|module)\.js$/;
const ESM_FOLDER_RE = /\/esm\/(.*\.js)$/;
const defaultInline = [
  /\/vitest\/dist\//,
  /vitest-virtual-\w+\/dist/,
  /virtual:/,
  /\.ts$/,
  ESM_EXT_RE,
  ESM_FOLDER_RE
];
const depsExternal = [
  /\.cjs.js$/,
  /\.mjs$/
];
function guessCJSversion(id) {
  if (id.match(ESM_EXT_RE)) {
    for (const i of [
      id.replace(ESM_EXT_RE, ".mjs"),
      id.replace(ESM_EXT_RE, ".umd.js"),
      id.replace(ESM_EXT_RE, ".cjs.js"),
      id.replace(ESM_EXT_RE, ".js")
    ]) {
      if (existsSync(i))
        return i;
    }
  }
  if (id.match(ESM_FOLDER_RE)) {
    for (const i of [
      id.replace(ESM_FOLDER_RE, "/umd/$1"),
      id.replace(ESM_FOLDER_RE, "/cjs/$1"),
      id.replace(ESM_FOLDER_RE, "/$1")
    ]) {
      if (existsSync(i))
        return i;
    }
  }
}
async function shouldExternalize(id, config, cache = new Map()) {
  if (!cache.has(id))
    cache.set(id, _shouldExternalize(id, config));
  return cache.get(id);
}
async function _shouldExternalize(id, config) {
  if (isNodeBuiltin(id))
    return id;
  id = patchWindowsImportPath(id);
  if (matchExternalizePattern(id, config == null ? void 0 : config.inline))
    return false;
  if (matchExternalizePattern(id, config == null ? void 0 : config.external))
    return id;
  const isNodeModule = id.includes("/node_modules/");
  id = isNodeModule ? guessCJSversion(id) || id : id;
  if (matchExternalizePattern(id, defaultInline))
    return false;
  if (matchExternalizePattern(id, depsExternal))
    return id;
  if (isNodeModule && await isValidNodeImport(id))
    return id;
  return false;
}
function matchExternalizePattern(id, patterns) {
  if (!patterns)
    return false;
  for (const ex of patterns) {
    if (typeof ex === "string") {
      if (id.includes(`/node_modules/${ex}/`))
        return true;
    } else {
      if (ex.test(id))
        return true;
    }
  }
  return false;
}
function patchWindowsImportPath(path) {
  if (path.match(/^\w:\\/))
    return `file:///${slash(path)}`;
  else if (path.match(/^\w:\//))
    return `file:///${path}`;
  else
    return path;
}

let SOURCEMAPPING_URL = "sourceMa";
SOURCEMAPPING_URL += "ppingURL";
class ViteNodeServer {
  constructor(server, options = {}) {
    this.server = server;
    this.options = options;
    this.promiseMap = new Map();
  }
  shouldExternalize(id) {
    return shouldExternalize(id, this.options.deps);
  }
  async fetchModule(id) {
    const externalize = await this.shouldExternalize(toFilePath(id, this.server.config.root));
    if (externalize)
      return { externalize };
    const r = await this.transformRequest(id);
    return { code: r == null ? void 0 : r.code };
  }
  async transformRequest(id) {
    if (!this.promiseMap.has(id)) {
      this.promiseMap.set(id, this._transformRequest(id).finally(() => {
        this.promiseMap.delete(id);
      }));
    }
    return this.promiseMap.get(id);
  }
  getTransformMode(id) {
    var _a, _b, _c, _d;
    const withoutQuery = id.split("?")[0];
    if ((_b = (_a = this.options.transformMode) == null ? void 0 : _a.web) == null ? void 0 : _b.some((r) => withoutQuery.match(r)))
      return "web";
    if ((_d = (_c = this.options.transformMode) == null ? void 0 : _c.ssr) == null ? void 0 : _d.some((r) => withoutQuery.match(r)))
      return "ssr";
    if (withoutQuery.match(/\.([cm]?[jt]sx?|json)$/))
      return "ssr";
    return "web";
  }
  async _transformRequest(id) {
    let result = null;
    const mode = this.getTransformMode(id);
    if (mode === "web") {
      result = await this.server.transformRequest(id);
      if (result)
        result = await this.server.ssrTransform(result.code, result.map, id);
    } else {
      result = await this.server.transformRequest(id, { ssr: true });
    }
    if (result && !id.includes("node_modules"))
      withInlineSourcemap(result);
    return result;
  }
}
async function withInlineSourcemap(result) {
  const { code, map } = result;
  if (code.includes(`${SOURCEMAPPING_URL}=`))
    return result;
  if (map)
    result.code = `${code}

//# ${SOURCEMAPPING_URL}=data:application/json;charset=utf-8;base64,${Buffer.from(JSON.stringify(map), "utf-8").toString("base64")}
`;
  return result;
}

export { ViteNodeServer, guessCJSversion, shouldExternalize, withInlineSourcemap };
