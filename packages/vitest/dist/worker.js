import { r as resolve, d as dirname, b as basename, j as join } from './index-1964368a.js';
import { s as slash, n as normalizeId$1, t as toFilePath, b as isPrimitive, i as isNodeBuiltin, c as createBirpc } from './index-46e1d4ad.js';
import { d as distDir } from './constants-de5287a6.js';
import { builtinModules, createRequire } from 'module';
import { pathToFileURL, fileURLToPath } from 'url';
import vm from 'vm';
import { existsSync, readdirSync } from 'fs';
import { a as spyOn, s as spies } from './jest-mock-113430de.js';
import { m as mergeSlashes } from './index-59e12882.js';
import { r as rpc } from './rpc-8c7cc374.js';
import 'path';
import 'assert';
import 'util';
import 'chai';
import 'tinyspy';
import 'tty';
import 'local-pkg';

function normalizeId(id, base) {
  if (base && id.startsWith(base))
    id = `/${id.slice(base.length)}`;
  return id.replace(/^\/@id\/__x00__/, "\0").replace(/^\/@id\//, "").replace(/^__vite-browser-external:/, "").replace(/^node:/, "").replace(/[?&]v=\w+/, "?").replace(/\?$/, "");
}

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
    const id = normalizeId$1(rawId, this.options.base);
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

var __defProp = Object.defineProperty;
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
function resolveMockPath(mockPath, root, external) {
  const path = normalizeId(external || mockPath);
  if (external || isNodeBuiltin(mockPath)) {
    const mockDirname = dirname(path);
    const baseFilename = basename(path);
    const mockFolder = resolve(root, "__mocks__", mockDirname);
    if (!existsSync(mockFolder))
      return null;
    const files = readdirSync(mockFolder);
    for (const file of files) {
      const [basename2] = file.split(".");
      if (basename2 === baseFilename)
        return resolve(mockFolder, file).replace(root, "");
    }
    return null;
  }
  const dir = dirname(path);
  const baseId = basename(path);
  const fullPath = resolve(dir, "__mocks__", baseId);
  return existsSync(fullPath) ? fullPath.replace(root, "") : null;
}
function getObjectType(value) {
  return Object.prototype.toString.apply(value).slice(8, -1);
}
function mockPrototype(proto) {
  if (!proto)
    return null;
  const newProto = {};
  const protoDescr = Object.getOwnPropertyDescriptors(proto);
  for (const d in protoDescr) {
    Object.defineProperty(newProto, d, protoDescr[d]);
    if (typeof protoDescr[d].value === "function")
      spyOn(newProto, d).mockImplementation(() => {
      });
  }
  return newProto;
}
function mockObject(obj) {
  const type = getObjectType(obj);
  if (Array.isArray(obj))
    return [];
  else if (type !== "Object" && type !== "Module")
    return obj;
  const newObj = __spreadValues({}, obj);
  const proto = mockPrototype(Object.getPrototypeOf(obj));
  Object.setPrototypeOf(newObj, proto);
  for (const k in obj) {
    newObj[k] = mockObject(obj[k]);
    const type2 = getObjectType(obj[k]);
    if (type2.includes("Function") && !obj[k].__isSpy) {
      spyOn(newObj, k).mockImplementation(() => {
      });
      Object.defineProperty(newObj[k], "length", { value: 0 });
    }
  }
  return newObj;
}
function createMocker(root, mockMap) {
  function getSuiteFilepath() {
    var _a;
    return (_a = process.__vitest_worker__) == null ? void 0 : _a.filepath;
  }
  function getActualPath(path, external) {
    if (external)
      return mergeSlashes(`/@fs/${path}`);
    return normalizeId(path.replace(root, ""));
  }
  function unmockPath(path, nmName) {
    const suitefile = getSuiteFilepath();
    if (suitefile) {
      const fsPath = getActualPath(path, nmName);
      mockMap[suitefile] ?? (mockMap[suitefile] = {});
      delete mockMap[suitefile][fsPath];
    }
  }
  function mockPath(path, nmName, factory) {
    const suitefile = getSuiteFilepath();
    if (suitefile) {
      const fsPath = getActualPath(path, nmName);
      mockMap[suitefile] ?? (mockMap[suitefile] = {});
      mockMap[suitefile][fsPath] = factory || resolveMockPath(path, root, nmName);
    }
  }
  function clearMocks({ clearMocks: clearMocks2, mockReset, restoreMocks }) {
    if (!clearMocks2 && !mockReset && !restoreMocks)
      return;
    spies.forEach((s) => {
      if (restoreMocks)
        s.mockRestore();
      else if (mockReset)
        s.mockReset();
      else if (clearMocks2)
        s.mockClear();
    });
  }
  function resolveDependency(dep) {
    if (dep.startsWith("/node_modules/"))
      return mergeSlashes(`/@fs/${join(root, dep)}`);
    return normalizeId(dep);
  }
  return {
    mockPath,
    unmockPath,
    clearMocks,
    getActualPath,
    mockObject,
    getSuiteFilepath,
    resolveMockPath,
    resolveDependency
  };
}

async function executeInViteNode(options) {
  const runner = new VitestRunner(options);
  const result = [];
  for (const file of options.files)
    result.push(await runner.executeFile(file));
  return result;
}
class VitestRunner extends ViteNodeRunner {
  constructor(options) {
    super(options);
    this.options = options;
    options.requestStubs = options.requestStubs || {
      "/@vite/client": {
        injectQuery: (id) => id,
        createHotContext() {
          return {
            accept: () => {
            },
            prune: () => {
            }
          };
        },
        updateStyle() {
        }
      }
    };
    this.mocker = createMocker(this.root, options.mockMap);
  }
  prepareContext(context) {
    const suite = this.mocker.getSuiteFilepath();
    const mockMap = this.options.mockMap;
    const request = context.__vite_ssr_import__;
    const callFunctionMock = async (dep, mock) => {
      var _a;
      const name = `${dep}__mock`;
      const cached = (_a = this.moduleCache.get(name)) == null ? void 0 : _a.exports;
      if (cached)
        return cached;
      const exports = await mock();
      this.setCache(name, { exports });
      return exports;
    };
    const requestWithMock = async (dep) => {
      var _a;
      const mocks = mockMap[suite || ""] || {};
      const mock = mocks[this.mocker.resolveDependency(dep)];
      if (mock === null) {
        const mockedKey = `${dep}__mock`;
        const cache = this.moduleCache.get(mockedKey);
        if (cache == null ? void 0 : cache.exports)
          return cache.exports;
        const cacheKey = toFilePath(dep, this.root);
        const mod = ((_a = this.moduleCache.get(cacheKey)) == null ? void 0 : _a.exports) || await request(dep);
        const exports = this.mocker.mockObject(mod);
        this.setCache(mockedKey, { exports });
        return exports;
      }
      if (typeof mock === "function")
        return callFunctionMock(dep, mock);
      if (typeof mock === "string")
        dep = mock;
      return request(dep);
    };
    const importActual = (path, nmName) => {
      return request(this.mocker.getActualPath(path, nmName));
    };
    const importMock = async (path, nmName) => {
      if (!suite)
        throw new Error("You can import mock only inside of a running test");
      const mock = (mockMap[suite] || {})[path] || this.mocker.resolveMockPath(path, this.root, nmName);
      if (mock === null) {
        const fsPath = this.mocker.getActualPath(path, nmName);
        const mod = await request(fsPath);
        return this.mocker.mockObject(mod);
      }
      if (typeof mock === "function")
        return callFunctionMock(path, mock);
      return requestWithMock(mock);
    };
    return Object.assign(context, {
      __vite_ssr_import__: requestWithMock,
      __vite_ssr_dynamic_import__: requestWithMock,
      __vitest__mock__: this.mocker.mockPath,
      __vitest__unmock__: this.mocker.unmockPath,
      __vitest__importActual__: importActual,
      __vitest__importMock__: importMock,
      __vitest__clearMocks__: this.mocker.clearMocks
    });
  }
}

let _viteNode;
const moduleCache = new Map();
const mockMap = {};
async function startViteNode(ctx) {
  if (_viteNode)
    return _viteNode;
  const processExit = process.exit;
  process.on("beforeExit", (code) => {
    rpc().onWorkerExit(code);
  });
  process.exit = (code = process.exitCode || 0) => {
    rpc().onWorkerExit(code);
    return processExit(code);
  };
  const { config } = ctx;
  const { run: run2, collect: collect2 } = (await executeInViteNode({
    files: [
      resolve(distDir, "entry.js")
    ],
    fetchModule(id) {
      return rpc().fetch(id);
    },
    moduleCache,
    mockMap,
    interpretDefault: config.deps.interpretDefault ?? true,
    root: config.root,
    base: config.base
  }))[0];
  _viteNode = { run: run2, collect: collect2 };
  return _viteNode;
}
function init(ctx) {
  if (process.__vitest_worker__ && ctx.config.threads && ctx.config.isolate)
    throw new Error(`worker for ${ctx.files.join(",")} already initialized by ${process.__vitest_worker__.ctx.files.join(",")}. This is probably an internal bug of Vitest.`);
  process.stdout.write("\0");
  const { config, port } = ctx;
  process.__vitest_worker__ = {
    ctx,
    moduleCache,
    config,
    rpc: createBirpc({}, {
      eventNames: ["onUserConsoleLog", "onCollected", "onWorkerExit"],
      post(v) {
        port.postMessage(v);
      },
      on(fn) {
        port.addListener("message", fn);
      }
    })
  };
  if (ctx.invalidates)
    ctx.invalidates.forEach((i) => moduleCache.delete(i));
  ctx.files.forEach((i) => moduleCache.delete(i));
}
async function collect(ctx) {
  init(ctx);
  const { collect: collect2 } = await startViteNode(ctx);
  return collect2(ctx.files, ctx.config);
}
async function run(ctx) {
  init(ctx);
  const { run: run2 } = await startViteNode(ctx);
  return run2(ctx.files, ctx.config);
}

export { collect, run };
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid29ya2VyLmpzIiwic291cmNlcyI6WyIuLi9zcmMvdXRpbHMvcGF0aC50cyIsIi4uLy4uL3ZpdGUtbm9kZS9kaXN0L2NsaWVudC5qcyIsIi4uL3NyYy9ub2RlL21vY2tlci50cyIsIi4uL3NyYy9ub2RlL2V4ZWN1dGUudHMiLCIuLi9zcmMvcnVudGltZS93b3JrZXIudHMiXSwic291cmNlc0NvbnRlbnQiOlsiZXhwb3J0IGZ1bmN0aW9uIG5vcm1hbGl6ZUlkKGlkOiBzdHJpbmcsIGJhc2U/OiBzdHJpbmcpOiBzdHJpbmcge1xuICBpZiAoYmFzZSAmJiBpZC5zdGFydHNXaXRoKGJhc2UpKVxuICAgIGlkID0gYC8ke2lkLnNsaWNlKGJhc2UubGVuZ3RoKX1gXG5cbiAgcmV0dXJuIGlkXG4gICAgLnJlcGxhY2UoL15cXC9AaWRcXC9fX3gwMF9fLywgJ1xcMCcpIC8vIHZpcnR1YWwgbW9kdWxlcyBzdGFydCB3aXRoIGBcXDBgXG4gICAgLnJlcGxhY2UoL15cXC9AaWRcXC8vLCAnJylcbiAgICAucmVwbGFjZSgvXl9fdml0ZS1icm93c2VyLWV4dGVybmFsOi8sICcnKVxuICAgIC5yZXBsYWNlKC9ebm9kZTovLCAnJylcbiAgICAucmVwbGFjZSgvWz8mXXY9XFx3Ky8sICc/JykgLy8gcmVtb3ZlID92PSBxdWVyeVxuICAgIC5yZXBsYWNlKC9cXD8kLywgJycpIC8vIHJlbW92ZSBlbmQgcXVlcnkgbWFya1xufVxuIiwiaW1wb3J0IHsgYnVpbHRpbk1vZHVsZXMsIGNyZWF0ZVJlcXVpcmUgfSBmcm9tICdtb2R1bGUnO1xuaW1wb3J0IHsgcGF0aFRvRmlsZVVSTCwgZmlsZVVSTFRvUGF0aCB9IGZyb20gJ3VybCc7XG5pbXBvcnQgdm0gZnJvbSAndm0nO1xuaW1wb3J0IHsgcmVzb2x2ZSwgZGlybmFtZSB9IGZyb20gJ3BhdGhlJztcbmltcG9ydCB7IHNsYXNoLCBub3JtYWxpemVJZCwgdG9GaWxlUGF0aCwgaXNQcmltaXRpdmUgfSBmcm9tICcuL3V0aWxzLmpzJztcblxuY2xhc3MgVml0ZU5vZGVSdW5uZXIge1xuICBjb25zdHJ1Y3RvcihvcHRpb25zKSB7XG4gICAgdGhpcy5vcHRpb25zID0gb3B0aW9ucztcbiAgICB0aGlzLnJvb3QgPSBvcHRpb25zLnJvb3QgfHwgcHJvY2Vzcy5jd2QoKTtcbiAgICB0aGlzLm1vZHVsZUNhY2hlID0gb3B0aW9ucy5tb2R1bGVDYWNoZSB8fCBuZXcgTWFwKCk7XG4gICAgdGhpcy5leHRlcm5hbENhY2hlID0gbmV3IE1hcCgpO1xuICAgIGJ1aWx0aW5Nb2R1bGVzLmZvckVhY2goKG0pID0+IHRoaXMuZXh0ZXJuYWxDYWNoZS5zZXQobSwgbSkpO1xuICB9XG4gIGFzeW5jIGV4ZWN1dGVGaWxlKGZpbGUpIHtcbiAgICByZXR1cm4gYXdhaXQgdGhpcy5jYWNoZWRSZXF1ZXN0KGAvQGZzLyR7c2xhc2gocmVzb2x2ZShmaWxlKSl9YCwgW10pO1xuICB9XG4gIGFzeW5jIGV4ZWN1dGVJZChpZCkge1xuICAgIHJldHVybiBhd2FpdCB0aGlzLmNhY2hlZFJlcXVlc3QoaWQsIFtdKTtcbiAgfVxuICBhc3luYyBjYWNoZWRSZXF1ZXN0KHJhd0lkLCBjYWxsc3RhY2spIHtcbiAgICB2YXIgX2EsIF9iO1xuICAgIGNvbnN0IGlkID0gbm9ybWFsaXplSWQocmF3SWQsIHRoaXMub3B0aW9ucy5iYXNlKTtcbiAgICBjb25zdCBmc1BhdGggPSB0b0ZpbGVQYXRoKGlkLCB0aGlzLnJvb3QpO1xuICAgIGlmICgoX2EgPSB0aGlzLm1vZHVsZUNhY2hlLmdldChmc1BhdGgpKSA9PSBudWxsID8gdm9pZCAwIDogX2EucHJvbWlzZSlcbiAgICAgIHJldHVybiAoX2IgPSB0aGlzLm1vZHVsZUNhY2hlLmdldChmc1BhdGgpKSA9PSBudWxsID8gdm9pZCAwIDogX2IucHJvbWlzZTtcbiAgICBjb25zdCBwcm9taXNlID0gdGhpcy5kaXJlY3RSZXF1ZXN0KGlkLCBmc1BhdGgsIGNhbGxzdGFjayk7XG4gICAgdGhpcy5zZXRDYWNoZShmc1BhdGgsIHsgcHJvbWlzZSB9KTtcbiAgICByZXR1cm4gYXdhaXQgcHJvbWlzZTtcbiAgfVxuICBhc3luYyBkaXJlY3RSZXF1ZXN0KGlkLCBmc1BhdGgsIGNhbGxzdGFjaykge1xuICAgIGNhbGxzdGFjayA9IFsuLi5jYWxsc3RhY2ssIGlkXTtcbiAgICBjb25zdCByZXF1ZXN0ID0gYXN5bmMgKGRlcCkgPT4ge1xuICAgICAgdmFyIF9hO1xuICAgICAgaWYgKGNhbGxzdGFjay5pbmNsdWRlcyhkZXApKSB7XG4gICAgICAgIGNvbnN0IGNhY2hlS2V5ID0gdG9GaWxlUGF0aChkZXAsIHRoaXMucm9vdCk7XG4gICAgICAgIGlmICghKChfYSA9IHRoaXMubW9kdWxlQ2FjaGUuZ2V0KGNhY2hlS2V5KSkgPT0gbnVsbCA/IHZvaWQgMCA6IF9hLmV4cG9ydHMpKVxuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgQ2lyY3VsYXIgZGVwZW5kZW5jeSBkZXRlY3RlZFxuU3RhY2s6XG4ke1suLi5jYWxsc3RhY2ssIGRlcF0ucmV2ZXJzZSgpLm1hcCgocCkgPT4gYC0gJHtwfWApLmpvaW4oXCJcXG5cIil9YCk7XG4gICAgICAgIHJldHVybiB0aGlzLm1vZHVsZUNhY2hlLmdldChjYWNoZUtleSkuZXhwb3J0cztcbiAgICAgIH1cbiAgICAgIHJldHVybiB0aGlzLmNhY2hlZFJlcXVlc3QoZGVwLCBjYWxsc3RhY2spO1xuICAgIH07XG4gICAgaWYgKHRoaXMub3B0aW9ucy5yZXF1ZXN0U3R1YnMgJiYgaWQgaW4gdGhpcy5vcHRpb25zLnJlcXVlc3RTdHVicylcbiAgICAgIHJldHVybiB0aGlzLm9wdGlvbnMucmVxdWVzdFN0dWJzW2lkXTtcbiAgICBjb25zdCB7IGNvZGU6IHRyYW5zZm9ybWVkLCBleHRlcm5hbGl6ZSB9ID0gYXdhaXQgdGhpcy5vcHRpb25zLmZldGNoTW9kdWxlKGlkKTtcbiAgICBpZiAoZXh0ZXJuYWxpemUpIHtcbiAgICAgIGNvbnN0IG1vZCA9IGF3YWl0IGludGVycHJldGVkSW1wb3J0KGV4dGVybmFsaXplLCB0aGlzLm9wdGlvbnMuaW50ZXJwcmV0RGVmYXVsdCA/PyB0cnVlKTtcbiAgICAgIHRoaXMuc2V0Q2FjaGUoZnNQYXRoLCB7IGV4cG9ydHM6IG1vZCB9KTtcbiAgICAgIHJldHVybiBtb2Q7XG4gICAgfVxuICAgIGlmICh0cmFuc2Zvcm1lZCA9PSBudWxsKVxuICAgICAgdGhyb3cgbmV3IEVycm9yKGBmYWlsZWQgdG8gbG9hZCAke2lkfWApO1xuICAgIGNvbnN0IHVybCA9IHBhdGhUb0ZpbGVVUkwoZnNQYXRoKS5ocmVmO1xuICAgIGNvbnN0IGV4cG9ydHMgPSB7fTtcbiAgICB0aGlzLnNldENhY2hlKGZzUGF0aCwgeyBjb2RlOiB0cmFuc2Zvcm1lZCwgZXhwb3J0cyB9KTtcbiAgICBjb25zdCBfX2ZpbGVuYW1lID0gZmlsZVVSTFRvUGF0aCh1cmwpO1xuICAgIGNvbnN0IG1vZHVsZVByb3h5ID0ge1xuICAgICAgc2V0IGV4cG9ydHModmFsdWUpIHtcbiAgICAgICAgZXhwb3J0QWxsKGV4cG9ydHMsIHZhbHVlKTtcbiAgICAgICAgZXhwb3J0cy5kZWZhdWx0ID0gdmFsdWU7XG4gICAgICB9LFxuICAgICAgZ2V0IGV4cG9ydHMoKSB7XG4gICAgICAgIHJldHVybiBleHBvcnRzLmRlZmF1bHQ7XG4gICAgICB9XG4gICAgfTtcbiAgICBjb25zdCBjb250ZXh0ID0gdGhpcy5wcmVwYXJlQ29udGV4dCh7XG4gICAgICBfX3ZpdGVfc3NyX2ltcG9ydF9fOiByZXF1ZXN0LFxuICAgICAgX192aXRlX3Nzcl9keW5hbWljX2ltcG9ydF9fOiByZXF1ZXN0LFxuICAgICAgX192aXRlX3Nzcl9leHBvcnRzX186IGV4cG9ydHMsXG4gICAgICBfX3ZpdGVfc3NyX2V4cG9ydEFsbF9fOiAob2JqKSA9PiBleHBvcnRBbGwoZXhwb3J0cywgb2JqKSxcbiAgICAgIF9fdml0ZV9zc3JfaW1wb3J0X21ldGFfXzogeyB1cmwgfSxcbiAgICAgIHJlcXVpcmU6IGNyZWF0ZVJlcXVpcmUodXJsKSxcbiAgICAgIGV4cG9ydHMsXG4gICAgICBtb2R1bGU6IG1vZHVsZVByb3h5LFxuICAgICAgX19maWxlbmFtZSxcbiAgICAgIF9fZGlybmFtZTogZGlybmFtZShfX2ZpbGVuYW1lKVxuICAgIH0pO1xuICAgIGNvbnN0IGZuID0gdm0ucnVuSW5UaGlzQ29udGV4dChgYXN5bmMgKCR7T2JqZWN0LmtleXMoY29udGV4dCkuam9pbihcIixcIil9KT0+e3ske3RyYW5zZm9ybWVkfVxufX1gLCB7XG4gICAgICBmaWxlbmFtZTogZnNQYXRoLFxuICAgICAgbGluZU9mZnNldDogMFxuICAgIH0pO1xuICAgIGF3YWl0IGZuKC4uLk9iamVjdC52YWx1ZXMoY29udGV4dCkpO1xuICAgIHJldHVybiBleHBvcnRzO1xuICB9XG4gIHByZXBhcmVDb250ZXh0KGNvbnRleHQpIHtcbiAgICByZXR1cm4gY29udGV4dDtcbiAgfVxuICBzZXRDYWNoZShpZCwgbW9kKSB7XG4gICAgaWYgKCF0aGlzLm1vZHVsZUNhY2hlLmhhcyhpZCkpXG4gICAgICB0aGlzLm1vZHVsZUNhY2hlLnNldChpZCwgbW9kKTtcbiAgICBlbHNlXG4gICAgICBPYmplY3QuYXNzaWduKHRoaXMubW9kdWxlQ2FjaGUuZ2V0KGlkKSwgbW9kKTtcbiAgfVxufVxuZnVuY3Rpb24gaGFzTmVzdGVkRGVmYXVsdCh0YXJnZXQpIHtcbiAgcmV0dXJuIFwiX19lc01vZHVsZVwiIGluIHRhcmdldCAmJiB0YXJnZXQuX19lc01vZHVsZSAmJiBcImRlZmF1bHRcIiBpbiB0YXJnZXQuZGVmYXVsdDtcbn1cbmZ1bmN0aW9uIHByb3h5TWV0aG9kKG5hbWUsIHRyeURlZmF1bHQpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKHRhcmdldCwga2V5LCAuLi5hcmdzKSB7XG4gICAgY29uc3QgcmVzdWx0ID0gUmVmbGVjdFtuYW1lXSh0YXJnZXQsIGtleSwgLi4uYXJncyk7XG4gICAgaWYgKGlzUHJpbWl0aXZlKHRhcmdldC5kZWZhdWx0KSlcbiAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgaWYgKHRyeURlZmF1bHQgJiYga2V5ID09PSBcImRlZmF1bHRcIiB8fCB0eXBlb2YgcmVzdWx0ID09PSBcInVuZGVmaW5lZFwiKVxuICAgICAgcmV0dXJuIFJlZmxlY3RbbmFtZV0odGFyZ2V0LmRlZmF1bHQsIGtleSwgLi4uYXJncyk7XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfTtcbn1cbmFzeW5jIGZ1bmN0aW9uIGludGVycHJldGVkSW1wb3J0KHBhdGgsIGludGVycHJldERlZmF1bHQpIHtcbiAgY29uc3QgbW9kID0gYXdhaXQgaW1wb3J0KHBhdGgpO1xuICBpZiAoaW50ZXJwcmV0RGVmYXVsdCAmJiBcImRlZmF1bHRcIiBpbiBtb2QpIHtcbiAgICBjb25zdCB0cnlEZWZhdWx0ID0gaGFzTmVzdGVkRGVmYXVsdChtb2QpO1xuICAgIHJldHVybiBuZXcgUHJveHkobW9kLCB7XG4gICAgICBnZXQ6IHByb3h5TWV0aG9kKFwiZ2V0XCIsIHRyeURlZmF1bHQpLFxuICAgICAgc2V0OiBwcm94eU1ldGhvZChcInNldFwiLCB0cnlEZWZhdWx0KSxcbiAgICAgIGhhczogcHJveHlNZXRob2QoXCJoYXNcIiwgdHJ5RGVmYXVsdCksXG4gICAgICBkZWxldGVQcm9wZXJ0eTogcHJveHlNZXRob2QoXCJkZWxldGVQcm9wZXJ0eVwiLCB0cnlEZWZhdWx0KVxuICAgIH0pO1xuICB9XG4gIHJldHVybiBtb2Q7XG59XG5mdW5jdGlvbiBleHBvcnRBbGwoZXhwb3J0cywgc291cmNlTW9kdWxlKSB7XG4gIGZvciAoY29uc3Qga2V5IGluIHNvdXJjZU1vZHVsZSkge1xuICAgIGlmIChrZXkgIT09IFwiZGVmYXVsdFwiKSB7XG4gICAgICB0cnkge1xuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywga2V5LCB7XG4gICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgICAgICAgZ2V0KCkge1xuICAgICAgICAgICAgcmV0dXJuIHNvdXJjZU1vZHVsZVtrZXldO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9IGNhdGNoIChfZXJyKSB7XG4gICAgICB9XG4gICAgfVxuICB9XG59XG5cbmV4cG9ydCB7IFZpdGVOb2RlUnVubmVyIH07XG4iLCJpbXBvcnQgeyBleGlzdHNTeW5jLCByZWFkZGlyU3luYyB9IGZyb20gJ2ZzJ1xuaW1wb3J0IHsgaXNOb2RlQnVpbHRpbiB9IGZyb20gJ21sbHknXG5pbXBvcnQgeyBiYXNlbmFtZSwgZGlybmFtZSwgam9pbiwgcmVzb2x2ZSB9IGZyb20gJ3BhdGhlJ1xuaW1wb3J0IHsgc3BpZXMsIHNweU9uIH0gZnJvbSAnLi4vaW50ZWdyYXRpb25zL2plc3QtbW9jaydcbmltcG9ydCB7IG1lcmdlU2xhc2hlcywgbm9ybWFsaXplSWQgfSBmcm9tICcuLi91dGlscydcblxuZXhwb3J0IHR5cGUgU3VpdGVNb2NrcyA9IFJlY29yZDxzdHJpbmcsIFJlY29yZDxzdHJpbmcsIHN0cmluZyB8IG51bGwgfCAoKCkgPT4gYW55KT4+XG5cbmZ1bmN0aW9uIHJlc29sdmVNb2NrUGF0aChtb2NrUGF0aDogc3RyaW5nLCByb290OiBzdHJpbmcsIGV4dGVybmFsOiBzdHJpbmcgfCBudWxsKSB7XG4gIGNvbnN0IHBhdGggPSBub3JtYWxpemVJZChleHRlcm5hbCB8fCBtb2NrUGF0aClcblxuICAvLyBpdCdzIGEgbm9kZV9tb2R1bGUgYWxpYXNcbiAgLy8gYWxsIG1vY2tzIHNob3VsZCBiZSBpbnNpZGUgPHJvb3Q+L19fbW9ja3NfX1xuICBpZiAoZXh0ZXJuYWwgfHwgaXNOb2RlQnVpbHRpbihtb2NrUGF0aCkpIHtcbiAgICBjb25zdCBtb2NrRGlybmFtZSA9IGRpcm5hbWUocGF0aCkgLy8gZm9yIG5lc3RlZCBtb2NrczogQHZ1ZXVzZS9pbnRlZ3JhdGlvbi91c2VKd3RcbiAgICBjb25zdCBiYXNlRmlsZW5hbWUgPSBiYXNlbmFtZShwYXRoKVxuICAgIGNvbnN0IG1vY2tGb2xkZXIgPSByZXNvbHZlKHJvb3QsICdfX21vY2tzX18nLCBtb2NrRGlybmFtZSlcblxuICAgIGlmICghZXhpc3RzU3luYyhtb2NrRm9sZGVyKSkgcmV0dXJuIG51bGxcblxuICAgIGNvbnN0IGZpbGVzID0gcmVhZGRpclN5bmMobW9ja0ZvbGRlcilcblxuICAgIGZvciAoY29uc3QgZmlsZSBvZiBmaWxlcykge1xuICAgICAgY29uc3QgW2Jhc2VuYW1lXSA9IGZpbGUuc3BsaXQoJy4nKVxuICAgICAgaWYgKGJhc2VuYW1lID09PSBiYXNlRmlsZW5hbWUpXG4gICAgICAgIHJldHVybiByZXNvbHZlKG1vY2tGb2xkZXIsIGZpbGUpLnJlcGxhY2Uocm9vdCwgJycpXG4gICAgfVxuXG4gICAgcmV0dXJuIG51bGxcbiAgfVxuXG4gIGNvbnN0IGRpciA9IGRpcm5hbWUocGF0aClcbiAgY29uc3QgYmFzZUlkID0gYmFzZW5hbWUocGF0aClcbiAgY29uc3QgZnVsbFBhdGggPSByZXNvbHZlKGRpciwgJ19fbW9ja3NfXycsIGJhc2VJZClcbiAgcmV0dXJuIGV4aXN0c1N5bmMoZnVsbFBhdGgpID8gZnVsbFBhdGgucmVwbGFjZShyb290LCAnJykgOiBudWxsXG59XG5cbmZ1bmN0aW9uIGdldE9iamVjdFR5cGUodmFsdWU6IHVua25vd24pOiBzdHJpbmcge1xuICByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5hcHBseSh2YWx1ZSkuc2xpY2UoOCwgLTEpXG59XG5cbmZ1bmN0aW9uIG1vY2tQcm90b3R5cGUocHJvdG86IGFueSkge1xuICBpZiAoIXByb3RvKSByZXR1cm4gbnVsbFxuXG4gIGNvbnN0IG5ld1Byb3RvOiBhbnkgPSB7fVxuXG4gIGNvbnN0IHByb3RvRGVzY3IgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9ycyhwcm90bylcblxuICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tcmVzdHJpY3RlZC1zeW50YXhcbiAgZm9yIChjb25zdCBkIGluIHByb3RvRGVzY3IpIHtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkobmV3UHJvdG8sIGQsIHByb3RvRGVzY3JbZF0pXG5cbiAgICBpZiAodHlwZW9mIHByb3RvRGVzY3JbZF0udmFsdWUgPT09ICdmdW5jdGlvbicpXG4gICAgICBzcHlPbihuZXdQcm90bywgZCkubW9ja0ltcGxlbWVudGF0aW9uKCgpID0+IHt9KVxuICB9XG5cbiAgcmV0dXJuIG5ld1Byb3RvXG59XG5cbmZ1bmN0aW9uIG1vY2tPYmplY3Qob2JqOiBhbnkpIHtcbiAgY29uc3QgdHlwZSA9IGdldE9iamVjdFR5cGUob2JqKVxuXG4gIGlmIChBcnJheS5pc0FycmF5KG9iaikpXG4gICAgcmV0dXJuIFtdXG4gIGVsc2UgaWYgKHR5cGUgIT09ICdPYmplY3QnICYmIHR5cGUgIT09ICdNb2R1bGUnKVxuICAgIHJldHVybiBvYmpcblxuICBjb25zdCBuZXdPYmogPSB7IC4uLm9iaiB9XG5cbiAgY29uc3QgcHJvdG8gPSBtb2NrUHJvdG90eXBlKE9iamVjdC5nZXRQcm90b3R5cGVPZihvYmopKVxuICBPYmplY3Quc2V0UHJvdG90eXBlT2YobmV3T2JqLCBwcm90bylcblxuICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tcmVzdHJpY3RlZC1zeW50YXhcbiAgZm9yIChjb25zdCBrIGluIG9iaikge1xuICAgIG5ld09ialtrXSA9IG1vY2tPYmplY3Qob2JqW2tdKVxuICAgIGNvbnN0IHR5cGUgPSBnZXRPYmplY3RUeXBlKG9ialtrXSlcblxuICAgIGlmICh0eXBlLmluY2x1ZGVzKCdGdW5jdGlvbicpICYmICFvYmpba10uX19pc1NweSkge1xuICAgICAgc3B5T24obmV3T2JqLCBrKS5tb2NrSW1wbGVtZW50YXRpb24oKCkgPT4ge30pXG4gICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkobmV3T2JqW2tdLCAnbGVuZ3RoJywgeyB2YWx1ZTogMCB9KSAvLyB0aW55c3B5IHJldGFpbnMgbGVuZ3RoLCBidXQgamVzdCBkb2VzbnRcbiAgICB9XG4gIH1cbiAgcmV0dXJuIG5ld09ialxufVxuXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlTW9ja2VyKHJvb3Q6IHN0cmluZywgbW9ja01hcDogU3VpdGVNb2Nrcykge1xuICBmdW5jdGlvbiBnZXRTdWl0ZUZpbGVwYXRoKCkge1xuICAgIHJldHVybiBwcm9jZXNzLl9fdml0ZXN0X3dvcmtlcl9fPy5maWxlcGF0aFxuICB9XG5cbiAgZnVuY3Rpb24gZ2V0QWN0dWFsUGF0aChwYXRoOiBzdHJpbmcsIGV4dGVybmFsOiBzdHJpbmcpIHtcbiAgICBpZiAoZXh0ZXJuYWwpXG4gICAgICByZXR1cm4gbWVyZ2VTbGFzaGVzKGAvQGZzLyR7cGF0aH1gKVxuXG4gICAgcmV0dXJuIG5vcm1hbGl6ZUlkKHBhdGgucmVwbGFjZShyb290LCAnJykpXG4gIH1cblxuICBmdW5jdGlvbiB1bm1vY2tQYXRoKHBhdGg6IHN0cmluZywgbm1OYW1lOiBzdHJpbmcpIHtcbiAgICBjb25zdCBzdWl0ZWZpbGUgPSBnZXRTdWl0ZUZpbGVwYXRoKClcblxuICAgIGlmIChzdWl0ZWZpbGUpIHtcbiAgICAgIGNvbnN0IGZzUGF0aCA9IGdldEFjdHVhbFBhdGgocGF0aCwgbm1OYW1lKVxuICAgICAgbW9ja01hcFtzdWl0ZWZpbGVdID8/PSB7fVxuICAgICAgZGVsZXRlIG1vY2tNYXBbc3VpdGVmaWxlXVtmc1BhdGhdXG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gbW9ja1BhdGgocGF0aDogc3RyaW5nLCBubU5hbWU6IHN0cmluZywgZmFjdG9yeT86ICgpID0+IGFueSkge1xuICAgIGNvbnN0IHN1aXRlZmlsZSA9IGdldFN1aXRlRmlsZXBhdGgoKVxuXG4gICAgaWYgKHN1aXRlZmlsZSkge1xuICAgICAgY29uc3QgZnNQYXRoID0gZ2V0QWN0dWFsUGF0aChwYXRoLCBubU5hbWUpXG4gICAgICBtb2NrTWFwW3N1aXRlZmlsZV0gPz89IHt9XG4gICAgICBtb2NrTWFwW3N1aXRlZmlsZV1bZnNQYXRoXSA9IGZhY3RvcnkgfHwgcmVzb2x2ZU1vY2tQYXRoKHBhdGgsIHJvb3QsIG5tTmFtZSlcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBjbGVhck1vY2tzKHsgY2xlYXJNb2NrcywgbW9ja1Jlc2V0LCByZXN0b3JlTW9ja3MgfTogeyBjbGVhck1vY2tzOiBib29sZWFuOyBtb2NrUmVzZXQ6IGJvb2xlYW47IHJlc3RvcmVNb2NrczogYm9vbGVhbiB9KSB7XG4gICAgaWYgKCFjbGVhck1vY2tzICYmICFtb2NrUmVzZXQgJiYgIXJlc3RvcmVNb2NrcylcbiAgICAgIHJldHVyblxuXG4gICAgc3BpZXMuZm9yRWFjaCgocykgPT4ge1xuICAgICAgaWYgKHJlc3RvcmVNb2NrcylcbiAgICAgICAgcy5tb2NrUmVzdG9yZSgpXG4gICAgICBlbHNlIGlmIChtb2NrUmVzZXQpXG4gICAgICAgIHMubW9ja1Jlc2V0KClcbiAgICAgIGVsc2UgaWYgKGNsZWFyTW9ja3MpXG4gICAgICAgIHMubW9ja0NsZWFyKClcbiAgICB9KVxuICB9XG5cbiAgLy8gbnBtIHJlc29sdmVzIGFzIC9ub2RlX21vZHVsZXMsIGJ1dCB3ZSBzdG9yZSBhcyAvQGZzLy4uLi9ub2RlX21vZHVsZXNcbiAgZnVuY3Rpb24gcmVzb2x2ZURlcGVuZGVuY3koZGVwOiBzdHJpbmcpIHtcbiAgICBpZiAoZGVwLnN0YXJ0c1dpdGgoJy9ub2RlX21vZHVsZXMvJykpXG4gICAgICByZXR1cm4gbWVyZ2VTbGFzaGVzKGAvQGZzLyR7am9pbihyb290LCBkZXApfWApXG5cbiAgICByZXR1cm4gbm9ybWFsaXplSWQoZGVwKVxuICB9XG5cbiAgcmV0dXJuIHtcbiAgICBtb2NrUGF0aCxcbiAgICB1bm1vY2tQYXRoLFxuICAgIGNsZWFyTW9ja3MsXG4gICAgZ2V0QWN0dWFsUGF0aCxcblxuICAgIG1vY2tPYmplY3QsXG4gICAgZ2V0U3VpdGVGaWxlcGF0aCxcbiAgICByZXNvbHZlTW9ja1BhdGgsXG4gICAgcmVzb2x2ZURlcGVuZGVuY3ksXG4gIH1cbn1cbiIsImltcG9ydCB7IFZpdGVOb2RlUnVubmVyIH0gZnJvbSAndml0ZS1ub2RlL2NsaWVudCdcbmltcG9ydCB7IHRvRmlsZVBhdGggfSBmcm9tICd2aXRlLW5vZGUvdXRpbHMnXG5pbXBvcnQgdHlwZSB7IFZpdGVOb2RlUnVubmVyT3B0aW9ucyB9IGZyb20gJ3ZpdGUtbm9kZSdcbmltcG9ydCB0eXBlIHsgU3VpdGVNb2NrcyB9IGZyb20gJy4vbW9ja2VyJ1xuaW1wb3J0IHsgY3JlYXRlTW9ja2VyIH0gZnJvbSAnLi9tb2NrZXInXG5cbmV4cG9ydCBpbnRlcmZhY2UgRXhlY3V0ZU9wdGlvbnMgZXh0ZW5kcyBWaXRlTm9kZVJ1bm5lck9wdGlvbnMge1xuICBmaWxlczogc3RyaW5nW11cbiAgbW9ja01hcDogU3VpdGVNb2Nrc1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZXhlY3V0ZUluVml0ZU5vZGUob3B0aW9uczogRXhlY3V0ZU9wdGlvbnMpIHtcbiAgY29uc3QgcnVubmVyID0gbmV3IFZpdGVzdFJ1bm5lcihvcHRpb25zKVxuXG4gIGNvbnN0IHJlc3VsdDogYW55W10gPSBbXVxuICBmb3IgKGNvbnN0IGZpbGUgb2Ygb3B0aW9ucy5maWxlcylcbiAgICByZXN1bHQucHVzaChhd2FpdCBydW5uZXIuZXhlY3V0ZUZpbGUoZmlsZSkpXG5cbiAgcmV0dXJuIHJlc3VsdFxufVxuXG5leHBvcnQgY2xhc3MgVml0ZXN0UnVubmVyIGV4dGVuZHMgVml0ZU5vZGVSdW5uZXIge1xuICBtb2NrZXI6IFJldHVyblR5cGU8dHlwZW9mIGNyZWF0ZU1vY2tlcj5cblxuICBjb25zdHJ1Y3RvcihwdWJsaWMgb3B0aW9uczogRXhlY3V0ZU9wdGlvbnMpIHtcbiAgICBzdXBlcihvcHRpb25zKVxuXG4gICAgb3B0aW9ucy5yZXF1ZXN0U3R1YnMgPSBvcHRpb25zLnJlcXVlc3RTdHVicyB8fCB7XG4gICAgICAnL0B2aXRlL2NsaWVudCc6IHtcbiAgICAgICAgaW5qZWN0UXVlcnk6IChpZDogc3RyaW5nKSA9PiBpZCxcbiAgICAgICAgY3JlYXRlSG90Q29udGV4dCgpIHtcbiAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgYWNjZXB0OiAoKSA9PiB7fSxcbiAgICAgICAgICAgIHBydW5lOiAoKSA9PiB7fSxcbiAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIHVwZGF0ZVN0eWxlKCkge30sXG4gICAgICB9LFxuICAgIH1cblxuICAgIHRoaXMubW9ja2VyID0gY3JlYXRlTW9ja2VyKHRoaXMucm9vdCwgb3B0aW9ucy5tb2NrTWFwKVxuICB9XG5cbiAgcHJlcGFyZUNvbnRleHQoY29udGV4dDogUmVjb3JkPHN0cmluZywgYW55Pikge1xuICAgIGNvbnN0IHN1aXRlID0gdGhpcy5tb2NrZXIuZ2V0U3VpdGVGaWxlcGF0aCgpXG4gICAgY29uc3QgbW9ja01hcCA9IHRoaXMub3B0aW9ucy5tb2NrTWFwXG4gICAgY29uc3QgcmVxdWVzdCA9IGNvbnRleHQuX192aXRlX3Nzcl9pbXBvcnRfX1xuXG4gICAgY29uc3QgY2FsbEZ1bmN0aW9uTW9jayA9IGFzeW5jKGRlcDogc3RyaW5nLCBtb2NrOiAoKSA9PiBhbnkpID0+IHtcbiAgICAgIGNvbnN0IG5hbWUgPSBgJHtkZXB9X19tb2NrYFxuICAgICAgY29uc3QgY2FjaGVkID0gdGhpcy5tb2R1bGVDYWNoZS5nZXQobmFtZSk/LmV4cG9ydHNcbiAgICAgIGlmIChjYWNoZWQpXG4gICAgICAgIHJldHVybiBjYWNoZWRcbiAgICAgIGNvbnN0IGV4cG9ydHMgPSBhd2FpdCBtb2NrKClcbiAgICAgIHRoaXMuc2V0Q2FjaGUobmFtZSwgeyBleHBvcnRzIH0pXG4gICAgICByZXR1cm4gZXhwb3J0c1xuICAgIH1cblxuICAgIGNvbnN0IHJlcXVlc3RXaXRoTW9jayA9IGFzeW5jKGRlcDogc3RyaW5nKSA9PiB7XG4gICAgICBjb25zdCBtb2NrcyA9IG1vY2tNYXBbc3VpdGUgfHwgJyddIHx8IHt9XG4gICAgICBjb25zdCBtb2NrID0gbW9ja3NbdGhpcy5tb2NrZXIucmVzb2x2ZURlcGVuZGVuY3koZGVwKV1cbiAgICAgIGlmIChtb2NrID09PSBudWxsKSB7XG4gICAgICAgIGNvbnN0IG1vY2tlZEtleSA9IGAke2RlcH1fX21vY2tgXG4gICAgICAgIGNvbnN0IGNhY2hlID0gdGhpcy5tb2R1bGVDYWNoZS5nZXQobW9ja2VkS2V5KVxuICAgICAgICBpZiAoY2FjaGU/LmV4cG9ydHMpXG4gICAgICAgICAgcmV0dXJuIGNhY2hlLmV4cG9ydHNcbiAgICAgICAgY29uc3QgY2FjaGVLZXkgPSB0b0ZpbGVQYXRoKGRlcCwgdGhpcy5yb290KVxuICAgICAgICBjb25zdCBtb2QgPSB0aGlzLm1vZHVsZUNhY2hlLmdldChjYWNoZUtleSk/LmV4cG9ydHMgfHwgYXdhaXQgcmVxdWVzdChkZXApXG4gICAgICAgIGNvbnN0IGV4cG9ydHMgPSB0aGlzLm1vY2tlci5tb2NrT2JqZWN0KG1vZClcbiAgICAgICAgdGhpcy5zZXRDYWNoZShtb2NrZWRLZXksIHsgZXhwb3J0cyB9KVxuICAgICAgICByZXR1cm4gZXhwb3J0c1xuICAgICAgfVxuICAgICAgaWYgKHR5cGVvZiBtb2NrID09PSAnZnVuY3Rpb24nKVxuICAgICAgICByZXR1cm4gY2FsbEZ1bmN0aW9uTW9jayhkZXAsIG1vY2spXG4gICAgICBpZiAodHlwZW9mIG1vY2sgPT09ICdzdHJpbmcnKVxuICAgICAgICBkZXAgPSBtb2NrXG4gICAgICByZXR1cm4gcmVxdWVzdChkZXApXG4gICAgfVxuICAgIGNvbnN0IGltcG9ydEFjdHVhbCA9IChwYXRoOiBzdHJpbmcsIG5tTmFtZTogc3RyaW5nKSA9PiB7XG4gICAgICByZXR1cm4gcmVxdWVzdCh0aGlzLm1vY2tlci5nZXRBY3R1YWxQYXRoKHBhdGgsIG5tTmFtZSkpXG4gICAgfVxuICAgIGNvbnN0IGltcG9ydE1vY2sgPSBhc3luYyhwYXRoOiBzdHJpbmcsIG5tTmFtZTogc3RyaW5nKTogUHJvbWlzZTxhbnk+ID0+IHtcbiAgICAgIGlmICghc3VpdGUpXG4gICAgICAgIHRocm93IG5ldyBFcnJvcignWW91IGNhbiBpbXBvcnQgbW9jayBvbmx5IGluc2lkZSBvZiBhIHJ1bm5pbmcgdGVzdCcpXG5cbiAgICAgIGNvbnN0IG1vY2sgPSAobW9ja01hcFtzdWl0ZV0gfHwge30pW3BhdGhdIHx8IHRoaXMubW9ja2VyLnJlc29sdmVNb2NrUGF0aChwYXRoLCB0aGlzLnJvb3QsIG5tTmFtZSlcbiAgICAgIGlmIChtb2NrID09PSBudWxsKSB7XG4gICAgICAgIGNvbnN0IGZzUGF0aCA9IHRoaXMubW9ja2VyLmdldEFjdHVhbFBhdGgocGF0aCwgbm1OYW1lKVxuICAgICAgICBjb25zdCBtb2QgPSBhd2FpdCByZXF1ZXN0KGZzUGF0aClcbiAgICAgICAgcmV0dXJuIHRoaXMubW9ja2VyLm1vY2tPYmplY3QobW9kKVxuICAgICAgfVxuICAgICAgaWYgKHR5cGVvZiBtb2NrID09PSAnZnVuY3Rpb24nKVxuICAgICAgICByZXR1cm4gY2FsbEZ1bmN0aW9uTW9jayhwYXRoLCBtb2NrKVxuICAgICAgcmV0dXJuIHJlcXVlc3RXaXRoTW9jayhtb2NrKVxuICAgIH1cblxuICAgIHJldHVybiBPYmplY3QuYXNzaWduKGNvbnRleHQsIHtcbiAgICAgIF9fdml0ZV9zc3JfaW1wb3J0X186IHJlcXVlc3RXaXRoTW9jayxcbiAgICAgIF9fdml0ZV9zc3JfZHluYW1pY19pbXBvcnRfXzogcmVxdWVzdFdpdGhNb2NrLFxuXG4gICAgICAvLyB2aXRlc3QubW9jayBBUElcbiAgICAgIF9fdml0ZXN0X19tb2NrX186IHRoaXMubW9ja2VyLm1vY2tQYXRoLFxuICAgICAgX192aXRlc3RfX3VubW9ja19fOiB0aGlzLm1vY2tlci51bm1vY2tQYXRoLFxuICAgICAgX192aXRlc3RfX2ltcG9ydEFjdHVhbF9fOiBpbXBvcnRBY3R1YWwsXG4gICAgICBfX3ZpdGVzdF9faW1wb3J0TW9ja19fOiBpbXBvcnRNb2NrLFxuICAgICAgLy8gc3BpZXMgZnJvbSAnamVzdC1tb2NrJyBhcmUgZGlmZmVyZW50IGluc2lkZSBzdWl0ZXMgYW5kIGV4ZWN1dGUsXG4gICAgICAvLyBzbyB3ZWUgbmVlZCB0byBjYWxsIHRoaXMgdHdpY2UgLSBpbnNpZGUgc3VpdGUgYW5kIGhlcmVcbiAgICAgIF9fdml0ZXN0X19jbGVhck1vY2tzX186IHRoaXMubW9ja2VyLmNsZWFyTW9ja3MsXG4gICAgfSlcbiAgfVxufVxuIiwiaW1wb3J0IHsgcmVzb2x2ZSB9IGZyb20gJ3BhdGhlJ1xuaW1wb3J0IHR5cGUgeyBCaXJwY1JldHVybiB9IGZyb20gJ2JpcnBjJ1xuaW1wb3J0IHsgY3JlYXRlQmlycGMgfSBmcm9tICdiaXJwYydcbmltcG9ydCB0eXBlIHsgTW9kdWxlQ2FjaGUsIFJlc29sdmVkQ29uZmlnLCBUZXN0LCBXb3JrZXJDb250ZXh0LCBXb3JrZXJSUEMgfSBmcm9tICcuLi90eXBlcydcbmltcG9ydCB7IGRpc3REaXIgfSBmcm9tICcuLi9jb25zdGFudHMnXG5pbXBvcnQgeyBleGVjdXRlSW5WaXRlTm9kZSB9IGZyb20gJy4uL25vZGUvZXhlY3V0ZSdcbmltcG9ydCB7IHJwYyB9IGZyb20gJy4vcnBjJ1xuXG5sZXQgX3ZpdGVOb2RlOiB7XG4gIHJ1bjogKGZpbGVzOiBzdHJpbmdbXSwgY29uZmlnOiBSZXNvbHZlZENvbmZpZykgPT4gUHJvbWlzZTx2b2lkPlxuICBjb2xsZWN0OiAoZmlsZXM6IHN0cmluZ1tdLCBjb25maWc6IFJlc29sdmVkQ29uZmlnKSA9PiBQcm9taXNlPHZvaWQ+XG59XG5jb25zdCBtb2R1bGVDYWNoZTogTWFwPHN0cmluZywgTW9kdWxlQ2FjaGU+ID0gbmV3IE1hcCgpXG5jb25zdCBtb2NrTWFwID0ge31cblxuYXN5bmMgZnVuY3Rpb24gc3RhcnRWaXRlTm9kZShjdHg6IFdvcmtlckNvbnRleHQpIHtcbiAgaWYgKF92aXRlTm9kZSlcbiAgICByZXR1cm4gX3ZpdGVOb2RlXG5cbiAgY29uc3QgcHJvY2Vzc0V4aXQgPSBwcm9jZXNzLmV4aXRcblxuICBwcm9jZXNzLm9uKCdiZWZvcmVFeGl0JywgKGNvZGUpID0+IHtcbiAgICBycGMoKS5vbldvcmtlckV4aXQoY29kZSlcbiAgfSlcblxuICBwcm9jZXNzLmV4aXQgPSAoY29kZSA9IHByb2Nlc3MuZXhpdENvZGUgfHwgMCk6IG5ldmVyID0+IHtcbiAgICBycGMoKS5vbldvcmtlckV4aXQoY29kZSlcbiAgICByZXR1cm4gcHJvY2Vzc0V4aXQoY29kZSlcbiAgfVxuXG4gIGNvbnN0IHsgY29uZmlnIH0gPSBjdHhcblxuICBjb25zdCB7IHJ1biwgY29sbGVjdCB9ID0gKGF3YWl0IGV4ZWN1dGVJblZpdGVOb2RlKHtcbiAgICBmaWxlczogW1xuICAgICAgcmVzb2x2ZShkaXN0RGlyLCAnZW50cnkuanMnKSxcbiAgICBdLFxuICAgIGZldGNoTW9kdWxlKGlkKSB7XG4gICAgICByZXR1cm4gcnBjKCkuZmV0Y2goaWQpXG4gICAgfSxcbiAgICBtb2R1bGVDYWNoZSxcbiAgICBtb2NrTWFwLFxuICAgIGludGVycHJldERlZmF1bHQ6IGNvbmZpZy5kZXBzLmludGVycHJldERlZmF1bHQgPz8gdHJ1ZSxcbiAgICByb290OiBjb25maWcucm9vdCxcbiAgICBiYXNlOiBjb25maWcuYmFzZSxcbiAgfSkpWzBdXG5cbiAgX3ZpdGVOb2RlID0geyBydW4sIGNvbGxlY3QgfVxuXG4gIHJldHVybiBfdml0ZU5vZGVcbn1cblxuZnVuY3Rpb24gaW5pdChjdHg6IFdvcmtlckNvbnRleHQpIHtcbiAgaWYgKHByb2Nlc3MuX192aXRlc3Rfd29ya2VyX18gJiYgY3R4LmNvbmZpZy50aHJlYWRzICYmIGN0eC5jb25maWcuaXNvbGF0ZSlcbiAgICB0aHJvdyBuZXcgRXJyb3IoYHdvcmtlciBmb3IgJHtjdHguZmlsZXMuam9pbignLCcpfSBhbHJlYWR5IGluaXRpYWxpemVkIGJ5ICR7cHJvY2Vzcy5fX3ZpdGVzdF93b3JrZXJfXy5jdHguZmlsZXMuam9pbignLCcpfS4gVGhpcyBpcyBwcm9iYWJseSBhbiBpbnRlcm5hbCBidWcgb2YgVml0ZXN0LmApXG5cbiAgcHJvY2Vzcy5zdGRvdXQud3JpdGUoJ1xcMCcpXG5cbiAgY29uc3QgeyBjb25maWcsIHBvcnQgfSA9IGN0eFxuXG4gIHByb2Nlc3MuX192aXRlc3Rfd29ya2VyX18gPSB7XG4gICAgY3R4LFxuICAgIG1vZHVsZUNhY2hlLFxuICAgIGNvbmZpZyxcbiAgICBycGM6IGNyZWF0ZUJpcnBjPFdvcmtlclJQQz4oXG4gICAgICB7fSxcbiAgICAgIHtcbiAgICAgICAgZXZlbnROYW1lczogWydvblVzZXJDb25zb2xlTG9nJywgJ29uQ29sbGVjdGVkJywgJ29uV29ya2VyRXhpdCddLFxuICAgICAgICBwb3N0KHYpIHsgcG9ydC5wb3N0TWVzc2FnZSh2KSB9LFxuICAgICAgICBvbihmbikgeyBwb3J0LmFkZExpc3RlbmVyKCdtZXNzYWdlJywgZm4pIH0sXG4gICAgICB9LFxuICAgICksXG4gIH1cblxuICBpZiAoY3R4LmludmFsaWRhdGVzKVxuICAgIGN0eC5pbnZhbGlkYXRlcy5mb3JFYWNoKGkgPT4gbW9kdWxlQ2FjaGUuZGVsZXRlKGkpKVxuICBjdHguZmlsZXMuZm9yRWFjaChpID0+IG1vZHVsZUNhY2hlLmRlbGV0ZShpKSlcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGNvbGxlY3QoY3R4OiBXb3JrZXJDb250ZXh0KSB7XG4gIGluaXQoY3R4KVxuICBjb25zdCB7IGNvbGxlY3QgfSA9IGF3YWl0IHN0YXJ0Vml0ZU5vZGUoY3R4KVxuICByZXR1cm4gY29sbGVjdChjdHguZmlsZXMsIGN0eC5jb25maWcpXG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBydW4oY3R4OiBXb3JrZXJDb250ZXh0KSB7XG4gIGluaXQoY3R4KVxuICBjb25zdCB7IHJ1biB9ID0gYXdhaXQgc3RhcnRWaXRlTm9kZShjdHgpXG4gIHJldHVybiBydW4oY3R4LmZpbGVzLCBjdHguY29uZmlnKVxufVxuXG5kZWNsYXJlIGdsb2JhbCB7XG4gIG5hbWVzcGFjZSBOb2RlSlMge1xuICAgIGludGVyZmFjZSBQcm9jZXNzIHtcbiAgICAgIF9fdml0ZXN0X3dvcmtlcl9fOiB7XG4gICAgICAgIGN0eDogV29ya2VyQ29udGV4dFxuICAgICAgICBjb25maWc6IFJlc29sdmVkQ29uZmlnXG4gICAgICAgIHJwYzogQmlycGNSZXR1cm48V29ya2VyUlBDPlxuICAgICAgICBjdXJyZW50PzogVGVzdFxuICAgICAgICBmaWxlcGF0aD86IHN0cmluZ1xuICAgICAgICBtb2R1bGVDYWNoZTogTWFwPHN0cmluZywgTW9kdWxlQ2FjaGU+XG4gICAgICB9XG4gICAgfVxuICB9XG59XG4iXSwibmFtZXMiOlsibm9ybWFsaXplSWQiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFPLFNBQVMsV0FBVyxDQUFDLEVBQUUsRUFBRSxJQUFJLEVBQUU7QUFDdEMsRUFBRSxJQUFJLElBQUksSUFBSSxFQUFFLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQztBQUNqQyxJQUFJLEVBQUUsR0FBRyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDckMsRUFBRSxPQUFPLEVBQUUsQ0FBQyxPQUFPLENBQUMsaUJBQWlCLEVBQUUsSUFBSSxDQUFDLENBQUMsT0FBTyxDQUFDLFVBQVUsRUFBRSxFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUMsMkJBQTJCLEVBQUUsRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLFFBQVEsRUFBRSxFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUMsV0FBVyxFQUFFLEdBQUcsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUUsRUFBRSxDQUFDLENBQUM7QUFDakw7O0FDQ0EsTUFBTSxjQUFjLENBQUM7QUFDckIsRUFBRSxXQUFXLENBQUMsT0FBTyxFQUFFO0FBQ3ZCLElBQUksSUFBSSxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUM7QUFDM0IsSUFBSSxJQUFJLENBQUMsSUFBSSxHQUFHLE9BQU8sQ0FBQyxJQUFJLElBQUksT0FBTyxDQUFDLEdBQUcsRUFBRSxDQUFDO0FBQzlDLElBQUksSUFBSSxDQUFDLFdBQVcsR0FBRyxPQUFPLENBQUMsV0FBVyxJQUFJLElBQUksR0FBRyxFQUFFLENBQUM7QUFDeEQsSUFBSSxJQUFJLENBQUMsYUFBYSxHQUFHLElBQUksR0FBRyxFQUFFLENBQUM7QUFDbkMsSUFBSSxjQUFjLENBQUMsT0FBTyxDQUFD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
