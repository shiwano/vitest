import { createBirpc } from 'birpc';

/*! (c) 2020 Andrea Giammarchi */

const {parse: $parse, stringify: $stringify} = JSON;
const {keys} = Object;

const Primitive = String;   // it could be Number
const primitive = 'string'; // it could be 'number'

const ignore = {};
const object = 'object';

const noop = (_, value) => value;

const primitives = value => (
  value instanceof Primitive ? Primitive(value) : value
);

const Primitives = (_, value) => (
  typeof value === primitive ? new Primitive(value) : value
);

const revive = (input, parsed, output, $) => {
  const lazy = [];
  for (let ke = keys(output), {length} = ke, y = 0; y < length; y++) {
    const k = ke[y];
    const value = output[k];
    if (value instanceof Primitive) {
      const tmp = input[value];
      if (typeof tmp === object && !parsed.has(tmp)) {
        parsed.add(tmp);
        output[k] = ignore;
        lazy.push({k, a: [input, parsed, tmp, $]});
      }
      else
        output[k] = $.call(output, k, tmp);
    }
    else if (output[k] !== ignore)
      output[k] = $.call(output, k, value);
  }
  for (let {length} = lazy, i = 0; i < length; i++) {
    const {k, a} = lazy[i];
    output[k] = $.call(output, k, revive.apply(null, a));
  }
  return output;
};

const set = (known, input, value) => {
  const index = Primitive(input.push(value) - 1);
  known.set(value, index);
  return index;
};

const parse = (text, reviver) => {
  const input = $parse(text, Primitives).map(primitives);
  const value = input[0];
  const $ = reviver || noop;
  const tmp = typeof value === object && value ?
              revive(input, new Set, value, $) :
              value;
  return $.call({'': tmp}, '', tmp);
};

const stringify = (value, replacer, space) => {
  const $ = replacer && typeof replacer === object ?
            (k, v) => (k === '' || -1 < replacer.indexOf(k) ? v : void 0) :
            (replacer || noop);
  const known = new Map;
  const input = [];
  const output = [];
  let i = +set(known, input, $.call({'': value}, '', value));
  let firstRun = !i;
  while (i < input.length) {
    firstRun = true;
    output[i] = $stringify(input[i++], replace, space);
  }
  return '[' + output.join(',') + ']';
  function replace(key, value) {
    if (firstRun) {
      firstRun = !firstRun;
      return value;
    }
    const after = $.call(this, key, value);
    switch (typeof after) {
      case object:
        if (after === null) return after;
      case primitive:
        return known.get(after) || set(known, input, after);
    }
    return after;
  }
};

class StateManager {
  constructor() {
    this.filesMap = new Map();
    this.idMap = new Map();
    this.taskFileMap = new WeakMap();
  }
  getFiles(keys) {
    if (keys)
      return keys.map((key) => this.filesMap.get(key));
    return Array.from(this.filesMap.values());
  }
  getFilepaths() {
    return Array.from(this.filesMap.keys());
  }
  getFailedFilepaths() {
    return this.getFiles().filter((i) => {
      var _a;
      return ((_a = i.result) == null ? void 0 : _a.state) === "fail";
    }).map((i) => i.filepath);
  }
  collectFiles(files = []) {
    files.forEach((file) => {
      this.filesMap.set(file.filepath, file);
      this.updateId(file);
    });
  }
  updateId(task) {
    if (this.idMap.get(task.id) === task)
      return;
    this.idMap.set(task.id, task);
    if (task.type === "suite") {
      task.tasks.forEach((task2) => {
        this.updateId(task2);
      });
    }
  }
  updateTasks(packs) {
    for (const [id, result] of packs) {
      if (this.idMap.has(id))
        this.idMap.get(id).result = result;
    }
  }
  updateUserLog(log) {
    const task = log.taskId && this.idMap.get(log.taskId);
    if (task) {
      if (!task.logs)
        task.logs = [];
      task.logs.push(log);
    }
  }
}

function toArray(array) {
  array = array || [];
  if (Array.isArray(array))
    return array;
  return [array];
}

function getTests(suite) {
  return toArray(suite).flatMap((s) => s.type === "test" ? [s] : s.tasks.flatMap((c) => c.type === "test" ? [c] : getTests(c)));
}
function getTasks(tasks = []) {
  return toArray(tasks).flatMap((s) => s.type === "test" ? [s] : [s, ...getTasks(s.tasks)]);
}
function getSuites(suite) {
  return toArray(suite).flatMap((s) => s.type === "suite" ? [s, ...getSuites(s.tasks)] : []);
}
function hasTests(suite) {
  return toArray(suite).some((s) => s.tasks.some((c) => c.type === "test" || hasTests(c)));
}
function hasFailed(suite) {
  return toArray(suite).some((s) => {
    var _a;
    return ((_a = s.result) == null ? void 0 : _a.state) === "fail" || s.type === "suite" && hasFailed(s.tasks);
  });
}
function hasFailedSnapshot(suite) {
  return getTests(suite).some((s) => {
    var _a, _b;
    const message = (_b = (_a = s.result) == null ? void 0 : _a.error) == null ? void 0 : _b.message;
    return message == null ? void 0 : message.match(/Snapshot .* mismatched/);
  });
}
function getNames(task) {
  const names = [task.name];
  let current = task;
  while ((current == null ? void 0 : current.suite) || (current == null ? void 0 : current.file)) {
    current = current.suite || current.file;
    if (current == null ? void 0 : current.name)
      names.unshift(current.name);
  }
  return names;
}

function createClient(url, options = {}) {
  const {
    handlers = {},
    autoReconnect = true,
    reconnectInterval = 2e3,
    reconnectTries = 10,
    reactive = (v) => v,
    WebSocketConstructor = globalThis.WebSocket
  } = options;
  let tries = reconnectTries;
  const ctx = reactive({
    ws: new WebSocketConstructor(url),
    state: new StateManager(),
    waitForConnection,
    reconnect
  });
  ctx.state.filesMap = reactive(ctx.state.filesMap);
  ctx.state.idMap = reactive(ctx.state.idMap);
  let onMessage;
  ctx.rpc = createBirpc({
    onCollected(files) {
      var _a;
      ctx.state.collectFiles(files);
      (_a = handlers.onCollected) == null ? void 0 : _a.call(handlers, files);
    },
    onTaskUpdate(packs) {
      var _a;
      ctx.state.updateTasks(packs);
      (_a = handlers.onTaskUpdate) == null ? void 0 : _a.call(handlers, packs);
    },
    onUserConsoleLog(log) {
      ctx.state.updateUserLog(log);
    }
  }, {
    post: (msg) => ctx.ws.send(msg),
    on: (fn) => onMessage = fn,
    serialize: stringify,
    deserialize: parse
  });
  let openPromise;
  function reconnect(reset = false) {
    if (reset)
      tries = reconnectTries;
    ctx.ws = new WebSocket(url);
    registerWS();
  }
  function registerWS() {
    openPromise = new Promise((resolve) => {
      ctx.ws.addEventListener("open", () => {
        tries = reconnectTries;
        resolve();
      });
    });
    ctx.ws.addEventListener("message", (v) => {
      onMessage(v.data);
    });
    ctx.ws.addEventListener("close", () => {
      tries -= 1;
      if (autoReconnect && tries > 0)
        setTimeout(reconnect, reconnectInterval);
    });
  }
  registerWS();
  function waitForConnection() {
    return openPromise;
  }
  return ctx;
}

export { createClient, getNames, getSuites, getTasks, getTests, hasFailed, hasFailedSnapshot, hasTests };
