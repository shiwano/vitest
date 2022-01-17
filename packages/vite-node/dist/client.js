import { builtinModules, createRequire } from 'module';
import { pathToFileURL, fileURLToPath } from 'url';
import vm from 'vm';
import { resolve, dirname } from 'pathe';
import { slash, normalizeId, toFilePath, isPrimitive } from './utils.js';

class ViteNodeRunner {
  constructor(options) {
    this.options = options;
    this.root = options.root || process.cwd();
    this.moduleCache = options.moduleCache || new Map();
    this.externalCache = new Map();
    builtinModules.forEach((m) => this.externalCache.set(m, m));
  }
  async executeFile(file) {
    return await this.cachedRequest(`/@fs/${slash(resolve(file))}`, []);
  }
  async executeId(id) {
    return await this.cachedRequest(id, []);
  }
  async cachedRequest(rawId, callstack) {
    var _a, _b;
    const id = normalizeId(rawId, this.options.base);
    const fsPath = toFilePath(id, this.root);
    if ((_a = this.moduleCache.get(fsPath)) == null ? void 0 : _a.promise)
      return (_b = this.moduleCache.get(fsPath)) == null ? void 0 : _b.promise;
    const promise = this.directRequest(id, fsPath, callstack);
    this.setCache(fsPath, { promise });
    return await promise;
  }
  async directRequest(id, fsPath, callstack) {
    callstack = [...callstack, id];
    const request = async (dep) => {
      var _a;
      if (callstack.includes(dep)) {
        const cacheKey = toFilePath(dep, this.root);
        if (!((_a = this.moduleCache.get(cacheKey)) == null ? void 0 : _a.exports))
          throw new Error(`Circular dependency detected
Stack:
${[...callstack, dep].reverse().map((p) => `- ${p}`).join("\n")}`);
        return this.moduleCache.get(cacheKey).exports;
      }
      return this.cachedRequest(dep, callstack);
    };
    if (this.options.requestStubs && id in this.options.requestStubs)
      return this.options.requestStubs[id];
    const { code: transformed, externalize } = await this.options.fetchModule(id);
    if (externalize) {
      const mod = await interpretedImport(externalize, this.options.interpretDefault ?? true);
      this.setCache(fsPath, { exports: mod });
      return mod;
    }
    if (transformed == null)
      throw new Error(`failed to load ${id}`);
    const url = pathToFileURL(fsPath).href;
    const exports = {};
    this.setCache(fsPath, { code: transformed, exports });
    const __filename = fileURLToPath(url);
    const moduleProxy = {
      set exports(value) {
        exportAll(exports, value);
        exports.default = value;
      },
      get exports() {
        return exports.default;
      }
    };
    const context = this.prepareContext({
      __vite_ssr_import__: request,
      __vite_ssr_dynamic_import__: request,
      __vite_ssr_exports__: exports,
      __vite_ssr_exportAll__: (obj) => exportAll(exports, obj),
      __vite_ssr_import_meta__: { url },
      require: createRequire(url),
      exports,
      module: moduleProxy,
      __filename,
      __dirname: dirname(__filename)
    });
    const fn = vm.runInThisContext(`async (${Object.keys(context).join(",")})=>{{${transformed}
}}`, {
      filename: fsPath,
      lineOffset: 0
    });
    await fn(...Object.values(context));
    return exports;
  }
  prepareContext(context) {
    return context;
  }
  setCache(id, mod) {
    if (!this.moduleCache.has(id))
      this.moduleCache.set(id, mod);
    else
      Object.assign(this.moduleCache.get(id), mod);
  }
}
function hasNestedDefault(target) {
  return "__esModule" in target && target.__esModule && "default" in target.default;
}
function proxyMethod(name, tryDefault) {
  return function(target, key, ...args) {
    const result = Reflect[name](target, key, ...args);
    if (isPrimitive(target.default))
      return result;
    if (tryDefault && key === "default" || typeof result === "undefined")
      return Reflect[name](target.default, key, ...args);
    return result;
  };
}
async function interpretedImport(path, interpretDefault) {
  const mod = await import(path);
  if (interpretDefault && "default" in mod) {
    const tryDefault = hasNestedDefault(mod);
    return new Proxy(mod, {
      get: proxyMethod("get", tryDefault),
      set: proxyMethod("set", tryDefault),
      has: proxyMethod("has", tryDefault),
      deleteProperty: proxyMethod("deleteProperty", tryDefault)
    });
  }
  return mod;
}
function exportAll(exports, sourceModule) {
  for (const key in sourceModule) {
    if (key !== "default") {
      try {
        Object.defineProperty(exports, key, {
          enumerable: true,
          configurable: true,
          get() {
            return sourceModule[key];
          }
        });
      } catch (_err) {
      }
    }
  }
}

export { ViteNodeRunner };
