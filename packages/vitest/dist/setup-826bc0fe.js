import { promises } from 'fs';
import { c as createBirpc } from './index-46e1d4ad.js';
import require$$0$1 from 'stream';
import require$$0 from 'zlib';
import require$$3 from 'net';
import require$$4 from 'tls';
import require$$5 from 'crypto';
import require$$2 from 'events';
import require$$1 from 'https';
import require$$2$1 from 'http';
import require$$7 from 'url';
import { A as API_PATH } from './constants-de5287a6.js';
import { o as interpretSourcePos, l as parseStacktrace } from './diff-19b42f85.js';
import 'module';
import 'path';
import 'assert';
import 'util';
import './index-1964368a.js';
import './index-59e12882.js';
import 'tty';
import 'local-pkg';

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

const parse$3 = (text, reviver) => {
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

var bufferUtil$1 = {exports: {}};

var constants = {
  BINARY_TYPES: ['nodebuffer', 'arraybuffer', 'fragments'],
  EMPTY_BUFFER: Buffer.alloc(0),
  GUID: '258EAFA5-E914-47DA-95CA-C5AB0DC85B11',
  kForOnEventAttribute: Symbol('kIsForOnEventAttribute'),
  kListener: Symbol('kListener'),
  kStatusCode: Symbol('status-code'),
  kWebSocket: Symbol('websocket'),
  NOOP: () => {}
};

const { EMPTY_BUFFER: EMPTY_BUFFER$3 } = constants;

/**
 * Merges an array of buffers into a new buffer.
 *
 * @param {Buffer[]} list The array of buffers to concat
 * @param {Number} totalLength The total length of buffers in the list
 * @return {Buffer} The resulting buffer
 * @public
 */
function concat$1(list, totalLength) {
  if (list.length === 0) return EMPTY_BUFFER$3;
  if (list.length === 1) return list[0];

  const target = Buffer.allocUnsafe(totalLength);
  let offset = 0;

  for (let i = 0; i < list.length; i++) {
    const buf = list[i];
    target.set(buf, offset);
    offset += buf.length;
  }

  if (offset < totalLength) return target.slice(0, offset);

  return target;
}

/**
 * Masks a buffer using the given mask.
 *
 * @param {Buffer} source The buffer to mask
 * @param {Buffer} mask The mask to use
 * @param {Buffer} output The buffer where to store the result
 * @param {Number} offset The offset at which to start writing
 * @param {Number} length The number of bytes to mask.
 * @public
 */
function _mask(source, mask, output, offset, length) {
  for (let i = 0; i < length; i++) {
    output[offset + i] = source[i] ^ mask[i & 3];
  }
}

/**
 * Unmasks a buffer using the given mask.
 *
 * @param {Buffer} buffer The buffer to unmask
 * @param {Buffer} mask The mask to use
 * @public
 */
function _unmask(buffer, mask) {
  for (let i = 0; i < buffer.length; i++) {
    buffer[i] ^= mask[i & 3];
  }
}

/**
 * Converts a buffer to an `ArrayBuffer`.
 *
 * @param {Buffer} buf The buffer to convert
 * @return {ArrayBuffer} Converted buffer
 * @public
 */
function toArrayBuffer$1(buf) {
  if (buf.byteLength === buf.buffer.byteLength) {
    return buf.buffer;
  }

  return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
}

/**
 * Converts `data` to a `Buffer`.
 *
 * @param {*} data The data to convert
 * @return {Buffer} The buffer
 * @throws {TypeError}
 * @public
 */
function toBuffer$2(data) {
  toBuffer$2.readOnly = true;

  if (Buffer.isBuffer(data)) return data;

  let buf;

  if (data instanceof ArrayBuffer) {
    buf = Buffer.from(data);
  } else if (ArrayBuffer.isView(data)) {
    buf = Buffer.from(data.buffer, data.byteOffset, data.byteLength);
  } else {
    buf = Buffer.from(data);
    toBuffer$2.readOnly = false;
  }

  return buf;
}

try {
  const bufferUtil = require('bufferutil');

  bufferUtil$1.exports = {
    concat: concat$1,
    mask(source, mask, output, offset, length) {
      if (length < 48) _mask(source, mask, output, offset, length);
      else bufferUtil.mask(source, mask, output, offset, length);
    },
    toArrayBuffer: toArrayBuffer$1,
    toBuffer: toBuffer$2,
    unmask(buffer, mask) {
      if (buffer.length < 32) _unmask(buffer, mask);
      else bufferUtil.unmask(buffer, mask);
    }
  };
} catch (e) /* istanbul ignore next */ {
  bufferUtil$1.exports = {
    concat: concat$1,
    mask: _mask,
    toArrayBuffer: toArrayBuffer$1,
    toBuffer: toBuffer$2,
    unmask: _unmask
  };
}

const kDone = Symbol('kDone');
const kRun = Symbol('kRun');

/**
 * A very simple job queue with adjustable concurrency. Adapted from
 * https://github.com/STRML/async-limiter
 */
class Limiter$1 {
  /**
   * Creates a new `Limiter`.
   *
   * @param {Number} [concurrency=Infinity] The maximum number of jobs allowed
   *     to run concurrently
   */
  constructor(concurrency) {
    this[kDone] = () => {
      this.pending--;
      this[kRun]();
    };
    this.concurrency = concurrency || Infinity;
    this.jobs = [];
    this.pending = 0;
  }

  /**
   * Adds a job to the queue.
   *
   * @param {Function} job The job to run
   * @public
   */
  add(job) {
    this.jobs.push(job);
    this[kRun]();
  }

  /**
   * Removes a job from the queue and runs it if possible.
   *
   * @private
   */
  [kRun]() {
    if (this.pending === this.concurrency) return;

    if (this.jobs.length) {
      const job = this.jobs.shift();

      this.pending++;
      job(this[kDone]);
    }
  }
}

var limiter = Limiter$1;

const zlib = require$$0;

const bufferUtil = bufferUtil$1.exports;
const Limiter = limiter;
const { kStatusCode: kStatusCode$2 } = constants;

const TRAILER = Buffer.from([0x00, 0x00, 0xff, 0xff]);
const kPerMessageDeflate = Symbol('permessage-deflate');
const kTotalLength = Symbol('total-length');
const kCallback = Symbol('callback');
const kBuffers = Symbol('buffers');
const kError$1 = Symbol('error');

//
// We limit zlib concurrency, which prevents severe memory fragmentation
// as documented in https://github.com/nodejs/node/issues/8871#issuecomment-250915913
// and https://github.com/websockets/ws/issues/1202
//
// Intentionally global; it's the global thread pool that's an issue.
//
let zlibLimiter;

/**
 * permessage-deflate implementation.
 */
class PerMessageDeflate$4 {
  /**
   * Creates a PerMessageDeflate instance.
   *
   * @param {Object} [options] Configuration options
   * @param {(Boolean|Number)} [options.clientMaxWindowBits] Advertise support
   *     for, or request, a custom client window size
   * @param {Boolean} [options.clientNoContextTakeover=false] Advertise/
   *     acknowledge disabling of client context takeover
   * @param {Number} [options.concurrencyLimit=10] The number of concurrent
   *     calls to zlib
   * @param {(Boolean|Number)} [options.serverMaxWindowBits] Request/confirm the
   *     use of a custom server window size
   * @param {Boolean} [options.serverNoContextTakeover=false] Request/accept
   *     disabling of server context takeover
   * @param {Number} [options.threshold=1024] Size (in bytes) below which
   *     messages should not be compressed if context takeover is disabled
   * @param {Object} [options.zlibDeflateOptions] Options to pass to zlib on
   *     deflate
   * @param {Object} [options.zlibInflateOptions] Options to pass to zlib on
   *     inflate
   * @param {Boolean} [isServer=false] Create the instance in either server or
   *     client mode
   * @param {Number} [maxPayload=0] The maximum allowed message length
   */
  constructor(options, isServer, maxPayload) {
    this._maxPayload = maxPayload | 0;
    this._options = options || {};
    this._threshold =
      this._options.threshold !== undefined ? this._options.threshold : 1024;
    this._isServer = !!isServer;
    this._deflate = null;
    this._inflate = null;

    this.params = null;

    if (!zlibLimiter) {
      const concurrency =
        this._options.concurrencyLimit !== undefined
          ? this._options.concurrencyLimit
          : 10;
      zlibLimiter = new Limiter(concurrency);
    }
  }

  /**
   * @type {String}
   */
  static get extensionName() {
    return 'permessage-deflate';
  }

  /**
   * Create an extension negotiation offer.
   *
   * @return {Object} Extension parameters
   * @public
   */
  offer() {
    const params = {};

    if (this._options.serverNoContextTakeover) {
      params.server_no_context_takeover = true;
    }
    if (this._options.clientNoContextTakeover) {
      params.client_no_context_takeover = true;
    }
    if (this._options.serverMaxWindowBits) {
      params.server_max_window_bits = this._options.serverMaxWindowBits;
    }
    if (this._options.clientMaxWindowBits) {
      params.client_max_window_bits = this._options.clientMaxWindowBits;
    } else if (this._options.clientMaxWindowBits == null) {
      params.client_max_window_bits = true;
    }

    return params;
  }

  /**
   * Accept an extension negotiation offer/response.
   *
   * @param {Array} configurations The extension negotiation offers/reponse
   * @return {Object} Accepted configuration
   * @public
   */
  accept(configurations) {
    configurations = this.normalizeParams(configurations);

    this.params = this._isServer
      ? this.acceptAsServer(configurations)
      : this.acceptAsClient(configurations);

    return this.params;
  }

  /**
   * Releases all resources used by the extension.
   *
   * @public
   */
  cleanup() {
    if (this._inflate) {
      this._inflate.close();
      this._inflate = null;
    }

    if (this._deflate) {
      const callback = this._deflate[kCallback];

      this._deflate.close();
      this._deflate = null;

      if (callback) {
        callback(
          new Error(
            'The deflate stream was closed while data was being processed'
          )
        );
      }
    }
  }

  /**
   *  Accept an extension negotiation offer.
   *
   * @param {Array} offers The extension negotiation offers
   * @return {Object} Accepted configuration
   * @private
   */
  acceptAsServer(offers) {
    const opts = this._options;
    const accepted = offers.find((params) => {
      if (
        (opts.serverNoContextTakeover === false &&
          params.server_no_context_takeover) ||
        (params.server_max_window_bits &&
          (opts.serverMaxWindowBits === false ||
            (typeof opts.serverMaxWindowBits === 'number' &&
              opts.serverMaxWindowBits > params.server_max_window_bits))) ||
        (typeof opts.clientMaxWindowBits === 'number' &&
          !params.client_max_window_bits)
      ) {
        return false;
      }

      return true;
    });

    if (!accepted) {
      throw new Error('None of the extension offers can be accepted');
    }

    if (opts.serverNoContextTakeover) {
      accepted.server_no_context_takeover = true;
    }
    if (opts.clientNoContextTakeover) {
      accepted.client_no_context_takeover = true;
    }
    if (typeof opts.serverMaxWindowBits === 'number') {
      accepted.server_max_window_bits = opts.serverMaxWindowBits;
    }
    if (typeof opts.clientMaxWindowBits === 'number') {
      accepted.client_max_window_bits = opts.clientMaxWindowBits;
    } else if (
      accepted.client_max_window_bits === true ||
      opts.clientMaxWindowBits === false
    ) {
      delete accepted.client_max_window_bits;
    }

    return accepted;
  }

  /**
   * Accept the extension negotiation response.
   *
   * @param {Array} response The extension negotiation response
   * @return {Object} Accepted configuration
   * @private
   */
  acceptAsClient(response) {
    const params = response[0];

    if (
      this._options.clientNoContextTakeover === false &&
      params.client_no_context_takeover
    ) {
      throw new Error('Unexpected parameter "client_no_context_takeover"');
    }

    if (!params.client_max_window_bits) {
      if (typeof this._options.clientMaxWindowBits === 'number') {
        params.client_max_window_bits = this._options.clientMaxWindowBits;
      }
    } else if (
      this._options.clientMaxWindowBits === false ||
      (typeof this._options.clientMaxWindowBits === 'number' &&
        params.client_max_window_bits > this._options.clientMaxWindowBits)
    ) {
      throw new Error(
        'Unexpected or invalid parameter "client_max_window_bits"'
      );
    }

    return params;
  }

  /**
   * Normalize parameters.
   *
   * @param {Array} configurations The extension negotiation offers/reponse
   * @return {Array} The offers/response with normalized parameters
   * @private
   */
  normalizeParams(configurations) {
    configurations.forEach((params) => {
      Object.keys(params).forEach((key) => {
        let value = params[key];

        if (value.length > 1) {
          throw new Error(`Parameter "${key}" must have only a single value`);
        }

        value = value[0];

        if (key === 'client_max_window_bits') {
          if (value !== true) {
            const num = +value;
            if (!Number.isInteger(num) || num < 8 || num > 15) {
              throw new TypeError(
                `Invalid value for parameter "${key}": ${value}`
              );
            }
            value = num;
          } else if (!this._isServer) {
            throw new TypeError(
              `Invalid value for parameter "${key}": ${value}`
            );
          }
        } else if (key === 'server_max_window_bits') {
          const num = +value;
          if (!Number.isInteger(num) || num < 8 || num > 15) {
            throw new TypeError(
              `Invalid value for parameter "${key}": ${value}`
            );
          }
          value = num;
        } else if (
          key === 'client_no_context_takeover' ||
          key === 'server_no_context_takeover'
        ) {
          if (value !== true) {
            throw new TypeError(
              `Invalid value for parameter "${key}": ${value}`
            );
          }
        } else {
          throw new Error(`Unknown parameter "${key}"`);
        }

        params[key] = value;
      });
    });

    return configurations;
  }

  /**
   * Decompress data. Concurrency limited.
   *
   * @param {Buffer} data Compressed data
   * @param {Boolean} fin Specifies whether or not this is the last fragment
   * @param {Function} callback Callback
   * @public
   */
  decompress(data, fin, callback) {
    zlibLimiter.add((done) => {
      this._decompress(data, fin, (err, result) => {
        done();
        callback(err, result);
      });
    });
  }

  /**
   * Compress data. Concurrency limited.
   *
   * @param {Buffer} data Data to compress
   * @param {Boolean} fin Specifies whether or not this is the last fragment
   * @param {Function} callback Callback
   * @public
   */
  compress(data, fin, callback) {
    zlibLimiter.add((done) => {
      this._compress(data, fin, (err, result) => {
        done();
        callback(err, result);
      });
    });
  }

  /**
   * Decompress data.
   *
   * @param {Buffer} data Compressed data
   * @param {Boolean} fin Specifies whether or not this is the last fragment
   * @param {Function} callback Callback
   * @private
   */
  _decompress(data, fin, callback) {
    const endpoint = this._isServer ? 'client' : 'server';

    if (!this._inflate) {
      const key = `${endpoint}_max_window_bits`;
      const windowBits =
        typeof this.params[key] !== 'number'
          ? zlib.Z_DEFAULT_WINDOWBITS
          : this.params[key];

      this._inflate = zlib.createInflateRaw({
        ...this._options.zlibInflateOptions,
        windowBits
      });
      this._inflate[kPerMessageDeflate] = this;
      this._inflate[kTotalLength] = 0;
      this._inflate[kBuffers] = [];
      this._inflate.on('error', inflateOnError);
      this._inflate.on('data', inflateOnData);
    }

    this._inflate[kCallback] = callback;

    this._inflate.write(data);
    if (fin) this._inflate.write(TRAILER);

    this._inflate.flush(() => {
      const err = this._inflate[kError$1];

      if (err) {
        this._inflate.close();
        this._inflate = null;
        callback(err);
        return;
      }

      const data = bufferUtil.concat(
        this._inflate[kBuffers],
        this._inflate[kTotalLength]
      );

      if (this._inflate._readableState.endEmitted) {
        this._inflate.close();
        this._inflate = null;
      } else {
        this._inflate[kTotalLength] = 0;
        this._inflate[kBuffers] = [];

        if (fin && this.params[`${endpoint}_no_context_takeover`]) {
          this._inflate.reset();
        }
      }

      callback(null, data);
    });
  }

  /**
   * Compress data.
   *
   * @param {Buffer} data Data to compress
   * @param {Boolean} fin Specifies whether or not this is the last fragment
   * @param {Function} callback Callback
   * @private
   */
  _compress(data, fin, callback) {
    const endpoint = this._isServer ? 'server' : 'client';

    if (!this._deflate) {
      const key = `${endpoint}_max_window_bits`;
      const windowBits =
        typeof this.params[key] !== 'number'
          ? zlib.Z_DEFAULT_WINDOWBITS
          : this.params[key];

      this._deflate = zlib.createDeflateRaw({
        ...this._options.zlibDeflateOptions,
        windowBits
      });

      this._deflate[kTotalLength] = 0;
      this._deflate[kBuffers] = [];

      this._deflate.on('data', deflateOnData);
    }

    this._deflate[kCallback] = callback;

    this._deflate.write(data);
    this._deflate.flush(zlib.Z_SYNC_FLUSH, () => {
      if (!this._deflate) {
        //
        // The deflate stream was closed while data was being processed.
        //
        return;
      }

      let data = bufferUtil.concat(
        this._deflate[kBuffers],
        this._deflate[kTotalLength]
      );

      if (fin) data = data.slice(0, data.length - 4);

      //
      // Ensure that the callback will not be called again in
      // `PerMessageDeflate#cleanup()`.
      //
      this._deflate[kCallback] = null;

      this._deflate[kTotalLength] = 0;
      this._deflate[kBuffers] = [];

      if (fin && this.params[`${endpoint}_no_context_takeover`]) {
        this._deflate.reset();
      }

      callback(null, data);
    });
  }
}

var permessageDeflate = PerMessageDeflate$4;

/**
 * The listener of the `zlib.DeflateRaw` stream `'data'` event.
 *
 * @param {Buffer} chunk A chunk of data
 * @private
 */
function deflateOnData(chunk) {
  this[kBuffers].push(chunk);
  this[kTotalLength] += chunk.length;
}

/**
 * The listener of the `zlib.InflateRaw` stream `'data'` event.
 *
 * @param {Buffer} chunk A chunk of data
 * @private
 */
function inflateOnData(chunk) {
  this[kTotalLength] += chunk.length;

  if (
    this[kPerMessageDeflate]._maxPayload < 1 ||
    this[kTotalLength] <= this[kPerMessageDeflate]._maxPayload
  ) {
    this[kBuffers].push(chunk);
    return;
  }

  this[kError$1] = new RangeError('Max payload size exceeded');
  this[kError$1].code = 'WS_ERR_UNSUPPORTED_MESSAGE_LENGTH';
  this[kError$1][kStatusCode$2] = 1009;
  this.removeListener('data', inflateOnData);
  this.reset();
}

/**
 * The listener of the `zlib.InflateRaw` stream `'error'` event.
 *
 * @param {Error} err The emitted error
 * @private
 */
function inflateOnError(err) {
  //
  // There is no need to call `Zlib#close()` as the handle is automatically
  // closed when an error is emitted.
  //
  this[kPerMessageDeflate]._inflate = null;
  err[kStatusCode$2] = 1007;
  this[kCallback](err);
}

var validation = {exports: {}};

//
// Allowed token characters:
//
// '!', '#', '$', '%', '&', ''', '*', '+', '-',
// '.', 0-9, A-Z, '^', '_', '`', a-z, '|', '~'
//
// tokenChars[32] === 0 // ' '
// tokenChars[33] === 1 // '!'
// tokenChars[34] === 0 // '"'
// ...
//
// prettier-ignore
const tokenChars$2 = [
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, // 0 - 15
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, // 16 - 31
  0, 1, 0, 1, 1, 1, 1, 1, 0, 0, 1, 1, 0, 1, 1, 0, // 32 - 47
  1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, // 48 - 63
  0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, // 64 - 79
  1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1, // 80 - 95
  1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, // 96 - 111
  1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 0 // 112 - 127
];

/**
 * Checks if a status code is allowed in a close frame.
 *
 * @param {Number} code The status code
 * @return {Boolean} `true` if the status code is valid, else `false`
 * @public
 */
function isValidStatusCode$2(code) {
  return (
    (code >= 1000 &&
      code <= 1014 &&
      code !== 1004 &&
      code !== 1005 &&
      code !== 1006) ||
    (code >= 3000 && code <= 4999)
  );
}

/**
 * Checks if a given buffer contains only correct UTF-8.
 * Ported from https://www.cl.cam.ac.uk/%7Emgk25/ucs/utf8_check.c by
 * Markus Kuhn.
 *
 * @param {Buffer} buf The buffer to check
 * @return {Boolean} `true` if `buf` contains only correct UTF-8, else `false`
 * @public
 */
function _isValidUTF8(buf) {
  const len = buf.length;
  let i = 0;

  while (i < len) {
    if ((buf[i] & 0x80) === 0) {
      // 0xxxxxxx
      i++;
    } else if ((buf[i] & 0xe0) === 0xc0) {
      // 110xxxxx 10xxxxxx
      if (
        i + 1 === len ||
        (buf[i + 1] & 0xc0) !== 0x80 ||
        (buf[i] & 0xfe) === 0xc0 // Overlong
      ) {
        return false;
      }

      i += 2;
    } else if ((buf[i] & 0xf0) === 0xe0) {
      // 1110xxxx 10xxxxxx 10xxxxxx
      if (
        i + 2 >= len ||
        (buf[i + 1] & 0xc0) !== 0x80 ||
        (buf[i + 2] & 0xc0) !== 0x80 ||
        (buf[i] === 0xe0 && (buf[i + 1] & 0xe0) === 0x80) || // Overlong
        (buf[i] === 0xed && (buf[i + 1] & 0xe0) === 0xa0) // Surrogate (U+D800 - U+DFFF)
      ) {
        return false;
      }

      i += 3;
    } else if ((buf[i] & 0xf8) === 0xf0) {
      // 11110xxx 10xxxxxx 10xxxxxx 10xxxxxx
      if (
        i + 3 >= len ||
        (buf[i + 1] & 0xc0) !== 0x80 ||
        (buf[i + 2] & 0xc0) !== 0x80 ||
        (buf[i + 3] & 0xc0) !== 0x80 ||
        (buf[i] === 0xf0 && (buf[i + 1] & 0xf0) === 0x80) || // Overlong
        (buf[i] === 0xf4 && buf[i + 1] > 0x8f) ||
        buf[i] > 0xf4 // > U+10FFFF
      ) {
        return false;
      }

      i += 4;
    } else {
      return false;
    }
  }

  return true;
}

try {
  const isValidUTF8 = require('utf-8-validate');

  validation.exports = {
    isValidStatusCode: isValidStatusCode$2,
    isValidUTF8(buf) {
      return buf.length < 150 ? _isValidUTF8(buf) : isValidUTF8(buf);
    },
    tokenChars: tokenChars$2
  };
} catch (e) /* istanbul ignore next */ {
  validation.exports = {
    isValidStatusCode: isValidStatusCode$2,
    isValidUTF8: _isValidUTF8,
    tokenChars: tokenChars$2
  };
}

const { Writable } = require$$0$1;

const PerMessageDeflate$3 = permessageDeflate;
const {
  BINARY_TYPES: BINARY_TYPES$1,
  EMPTY_BUFFER: EMPTY_BUFFER$2,
  kStatusCode: kStatusCode$1,
  kWebSocket: kWebSocket$2
} = constants;
const { concat, toArrayBuffer, unmask } = bufferUtil$1.exports;
const { isValidStatusCode: isValidStatusCode$1, isValidUTF8 } = validation.exports;

const GET_INFO = 0;
const GET_PAYLOAD_LENGTH_16 = 1;
const GET_PAYLOAD_LENGTH_64 = 2;
const GET_MASK = 3;
const GET_DATA = 4;
const INFLATING = 5;

/**
 * HyBi Receiver implementation.
 *
 * @extends Writable
 */
class Receiver$1 extends Writable {
  /**
   * Creates a Receiver instance.
   *
   * @param {Object} [options] Options object
   * @param {String} [options.binaryType=nodebuffer] The type for binary data
   * @param {Object} [options.extensions] An object containing the negotiated
   *     extensions
   * @param {Boolean} [options.isServer=false] Specifies whether to operate in
   *     client or server mode
   * @param {Number} [options.maxPayload=0] The maximum allowed message length
   * @param {Boolean} [options.skipUTF8Validation=false] Specifies whether or
   *     not to skip UTF-8 validation for text and close messages
   */
  constructor(options = {}) {
    super();

    this._binaryType = options.binaryType || BINARY_TYPES$1[0];
    this._extensions = options.extensions || {};
    this._isServer = !!options.isServer;
    this._maxPayload = options.maxPayload | 0;
    this._skipUTF8Validation = !!options.skipUTF8Validation;
    this[kWebSocket$2] = undefined;

    this._bufferedBytes = 0;
    this._buffers = [];

    this._compressed = false;
    this._payloadLength = 0;
    this._mask = undefined;
    this._fragmented = 0;
    this._masked = false;
    this._fin = false;
    this._opcode = 0;

    this._totalPayloadLength = 0;
    this._messageLength = 0;
    this._fragments = [];

    this._state = GET_INFO;
    this._loop = false;
  }

  /**
   * Implements `Writable.prototype._write()`.
   *
   * @param {Buffer} chunk The chunk of data to write
   * @param {String} encoding The character encoding of `chunk`
   * @param {Function} cb Callback
   * @private
   */
  _write(chunk, encoding, cb) {
    if (this._opcode === 0x08 && this._state == GET_INFO) return cb();

    this._bufferedBytes += chunk.length;
    this._buffers.push(chunk);
    this.startLoop(cb);
  }

  /**
   * Consumes `n` bytes from the buffered data.
   *
   * @param {Number} n The number of bytes to consume
   * @return {Buffer} The consumed bytes
   * @private
   */
  consume(n) {
    this._bufferedBytes -= n;

    if (n === this._buffers[0].length) return this._buffers.shift();

    if (n < this._buffers[0].length) {
      const buf = this._buffers[0];
      this._buffers[0] = buf.slice(n);
      return buf.slice(0, n);
    }

    const dst = Buffer.allocUnsafe(n);

    do {
      const buf = this._buffers[0];
      const offset = dst.length - n;

      if (n >= buf.length) {
        dst.set(this._buffers.shift(), offset);
      } else {
        dst.set(new Uint8Array(buf.buffer, buf.byteOffset, n), offset);
        this._buffers[0] = buf.slice(n);
      }

      n -= buf.length;
    } while (n > 0);

    return dst;
  }

  /**
   * Starts the parsing loop.
   *
   * @param {Function} cb Callback
   * @private
   */
  startLoop(cb) {
    let err;
    this._loop = true;

    do {
      switch (this._state) {
        case GET_INFO:
          err = this.getInfo();
          break;
        case GET_PAYLOAD_LENGTH_16:
          err = this.getPayloadLength16();
          break;
        case GET_PAYLOAD_LENGTH_64:
          err = this.getPayloadLength64();
          break;
        case GET_MASK:
          this.getMask();
          break;
        case GET_DATA:
          err = this.getData(cb);
          break;
        default:
          // `INFLATING`
          this._loop = false;
          return;
      }
    } while (this._loop);

    cb(err);
  }

  /**
   * Reads the first two bytes of a frame.
   *
   * @return {(RangeError|undefined)} A possible error
   * @private
   */
  getInfo() {
    if (this._bufferedBytes < 2) {
      this._loop = false;
      return;
    }

    const buf = this.consume(2);

    if ((buf[0] & 0x30) !== 0x00) {
      this._loop = false;
      return error(
        RangeError,
        'RSV2 and RSV3 must be clear',
        true,
        1002,
        'WS_ERR_UNEXPECTED_RSV_2_3'
      );
    }

    const compressed = (buf[0] & 0x40) === 0x40;

    if (compressed && !this._extensions[PerMessageDeflate$3.extensionName]) {
      this._loop = false;
      return error(
        RangeError,
        'RSV1 must be clear',
        true,
        1002,
        'WS_ERR_UNEXPECTED_RSV_1'
      );
    }

    this._fin = (buf[0] & 0x80) === 0x80;
    this._opcode = buf[0] & 0x0f;
    this._payloadLength = buf[1] & 0x7f;

    if (this._opcode === 0x00) {
      if (compressed) {
        this._loop = false;
        return error(
          RangeError,
          'RSV1 must be clear',
          true,
          1002,
          'WS_ERR_UNEXPECTED_RSV_1'
        );
      }

      if (!this._fragmented) {
        this._loop = false;
        return error(
          RangeError,
          'invalid opcode 0',
          true,
          1002,
          'WS_ERR_INVALID_OPCODE'
        );
      }

      this._opcode = this._fragmented;
    } else if (this._opcode === 0x01 || this._opcode === 0x02) {
      if (this._fragmented) {
        this._loop = false;
        return error(
          RangeError,
          `invalid opcode ${this._opcode}`,
          true,
          1002,
          'WS_ERR_INVALID_OPCODE'
        );
      }

      this._compressed = compressed;
    } else if (this._opcode > 0x07 && this._opcode < 0x0b) {
      if (!this._fin) {
        this._loop = false;
        return error(
          RangeError,
          'FIN must be set',
          true,
          1002,
          'WS_ERR_EXPECTED_FIN'
        );
      }

      if (compressed) {
        this._loop = false;
        return error(
          RangeError,
          'RSV1 must be clear',
          true,
          1002,
          'WS_ERR_UNEXPECTED_RSV_1'
        );
      }

      if (this._payloadLength > 0x7d) {
        this._loop = false;
        return error(
          RangeError,
          `invalid payload length ${this._payloadLength}`,
          true,
          1002,
          'WS_ERR_INVALID_CONTROL_PAYLOAD_LENGTH'
        );
      }
    } else {
      this._loop = false;
      return error(
        RangeError,
        `invalid opcode ${this._opcode}`,
        true,
        1002,
        'WS_ERR_INVALID_OPCODE'
      );
    }

    if (!this._fin && !this._fragmented) this._fragmented = this._opcode;
    this._masked = (buf[1] & 0x80) === 0x80;

    if (this._isServer) {
      if (!this._masked) {
        this._loop = false;
        return error(
          RangeError,
          'MASK must be set',
          true,
          1002,
          'WS_ERR_EXPECTED_MASK'
        );
      }
    } else if (this._masked) {
      this._loop = false;
      return error(
        RangeError,
        'MASK must be clear',
        true,
        1002,
        'WS_ERR_UNEXPECTED_MASK'
      );
    }

    if (this._payloadLength === 126) this._state = GET_PAYLOAD_LENGTH_16;
    else if (this._payloadLength === 127) this._state = GET_PAYLOAD_LENGTH_64;
    else return this.haveLength();
  }

  /**
   * Gets extended payload length (7+16).
   *
   * @return {(RangeError|undefined)} A possible error
   * @private
   */
  getPayloadLength16() {
    if (this._bufferedBytes < 2) {
      this._loop = false;
      return;
    }

    this._payloadLength = this.consume(2).readUInt16BE(0);
    return this.haveLength();
  }

  /**
   * Gets extended payload length (7+64).
   *
   * @return {(RangeError|undefined)} A possible error
   * @private
   */
  getPayloadLength64() {
    if (this._bufferedBytes < 8) {
      this._loop = false;
      return;
    }

    const buf = this.consume(8);
    const num = buf.readUInt32BE(0);

    //
    // The maximum safe integer in JavaScript is 2^53 - 1. An error is returned
    // if payload length is greater than this number.
    //
    if (num > Math.pow(2, 53 - 32) - 1) {
      this._loop = false;
      return error(
        RangeError,
        'Unsupported WebSocket frame: payload length > 2^53 - 1',
        false,
        1009,
        'WS_ERR_UNSUPPORTED_DATA_PAYLOAD_LENGTH'
      );
    }

    this._payloadLength = num * Math.pow(2, 32) + buf.readUInt32BE(4);
    return this.haveLength();
  }

  /**
   * Payload length has been read.
   *
   * @return {(RangeError|undefined)} A possible error
   * @private
   */
  haveLength() {
    if (this._payloadLength && this._opcode < 0x08) {
      this._totalPayloadLength += this._payloadLength;
      if (this._totalPayloadLength > this._maxPayload && this._maxPayload > 0) {
        this._loop = false;
        return error(
          RangeError,
          'Max payload size exceeded',
          false,
          1009,
          'WS_ERR_UNSUPPORTED_MESSAGE_LENGTH'
        );
      }
    }

    if (this._masked) this._state = GET_MASK;
    else this._state = GET_DATA;
  }

  /**
   * Reads mask bytes.
   *
   * @private
   */
  getMask() {
    if (this._bufferedBytes < 4) {
      this._loop = false;
      return;
    }

    this._mask = this.consume(4);
    this._state = GET_DATA;
  }

  /**
   * Reads data bytes.
   *
   * @param {Function} cb Callback
   * @return {(Error|RangeError|undefined)} A possible error
   * @private
   */
  getData(cb) {
    let data = EMPTY_BUFFER$2;

    if (this._payloadLength) {
      if (this._bufferedBytes < this._payloadLength) {
        this._loop = false;
        return;
      }

      data = this.consume(this._payloadLength);

      if (
        this._masked &&
        (this._mask[0] | this._mask[1] | this._mask[2] | this._mask[3]) !== 0
      ) {
        unmask(data, this._mask);
      }
    }

    if (this._opcode > 0x07) return this.controlMessage(data);

    if (this._compressed) {
      this._state = INFLATING;
      this.decompress(data, cb);
      return;
    }

    if (data.length) {
      //
      // This message is not compressed so its length is the sum of the payload
      // length of all fragments.
      //
      this._messageLength = this._totalPayloadLength;
      this._fragments.push(data);
    }

    return this.dataMessage();
  }

  /**
   * Decompresses data.
   *
   * @param {Buffer} data Compressed data
   * @param {Function} cb Callback
   * @private
   */
  decompress(data, cb) {
    const perMessageDeflate = this._extensions[PerMessageDeflate$3.extensionName];

    perMessageDeflate.decompress(data, this._fin, (err, buf) => {
      if (err) return cb(err);

      if (buf.length) {
        this._messageLength += buf.length;
        if (this._messageLength > this._maxPayload && this._maxPayload > 0) {
          return cb(
            error(
              RangeError,
              'Max payload size exceeded',
              false,
              1009,
              'WS_ERR_UNSUPPORTED_MESSAGE_LENGTH'
            )
          );
        }

        this._fragments.push(buf);
      }

      const er = this.dataMessage();
      if (er) return cb(er);

      this.startLoop(cb);
    });
  }

  /**
   * Handles a data message.
   *
   * @return {(Error|undefined)} A possible error
   * @private
   */
  dataMessage() {
    if (this._fin) {
      const messageLength = this._messageLength;
      const fragments = this._fragments;

      this._totalPayloadLength = 0;
      this._messageLength = 0;
      this._fragmented = 0;
      this._fragments = [];

      if (this._opcode === 2) {
        let data;

        if (this._binaryType === 'nodebuffer') {
          data = concat(fragments, messageLength);
        } else if (this._binaryType === 'arraybuffer') {
          data = toArrayBuffer(concat(fragments, messageLength));
        } else {
          data = fragments;
        }

        this.emit('message', data, true);
      } else {
        const buf = concat(fragments, messageLength);

        if (!this._skipUTF8Validation && !isValidUTF8(buf)) {
          this._loop = false;
          return error(
            Error,
            'invalid UTF-8 sequence',
            true,
            1007,
            'WS_ERR_INVALID_UTF8'
          );
        }

        this.emit('message', buf, false);
      }
    }

    this._state = GET_INFO;
  }

  /**
   * Handles a control message.
   *
   * @param {Buffer} data Data to handle
   * @return {(Error|RangeError|undefined)} A possible error
   * @private
   */
  controlMessage(data) {
    if (this._opcode === 0x08) {
      this._loop = false;

      if (data.length === 0) {
        this.emit('conclude', 1005, EMPTY_BUFFER$2);
        this.end();
      } else if (data.length === 1) {
        return error(
          RangeError,
          'invalid payload length 1',
          true,
          1002,
          'WS_ERR_INVALID_CONTROL_PAYLOAD_LENGTH'
        );
      } else {
        const code = data.readUInt16BE(0);

        if (!isValidStatusCode$1(code)) {
          return error(
            RangeError,
            `invalid status code ${code}`,
            true,
            1002,
            'WS_ERR_INVALID_CLOSE_CODE'
          );
        }

        const buf = data.slice(2);

        if (!this._skipUTF8Validation && !isValidUTF8(buf)) {
          return error(
            Error,
            'invalid UTF-8 sequence',
            true,
            1007,
            'WS_ERR_INVALID_UTF8'
          );
        }

        this.emit('conclude', code, buf);
        this.end();
      }
    } else if (this._opcode === 0x09) {
      this.emit('ping', data);
    } else {
      this.emit('pong', data);
    }

    this._state = GET_INFO;
  }
}

var receiver = Receiver$1;

/**
 * Builds an error object.
 *
 * @param {function(new:Error|RangeError)} ErrorCtor The error constructor
 * @param {String} message The error message
 * @param {Boolean} prefix Specifies whether or not to add a default prefix to
 *     `message`
 * @param {Number} statusCode The status code
 * @param {String} errorCode The exposed error code
 * @return {(Error|RangeError)} The error
 * @private
 */
function error(ErrorCtor, message, prefix, statusCode, errorCode) {
  const err = new ErrorCtor(
    prefix ? `Invalid WebSocket frame: ${message}` : message
  );

  Error.captureStackTrace(err, error);
  err.code = errorCode;
  err[kStatusCode$1] = statusCode;
  return err;
}

/* eslint no-unused-vars: ["error", { "varsIgnorePattern": "^net|tls$" }] */
const { randomFillSync } = require$$5;

const PerMessageDeflate$2 = permessageDeflate;
const { EMPTY_BUFFER: EMPTY_BUFFER$1 } = constants;
const { isValidStatusCode } = validation.exports;
const { mask: applyMask, toBuffer: toBuffer$1 } = bufferUtil$1.exports;

const maskBuffer = Buffer.alloc(4);

/**
 * HyBi Sender implementation.
 */
class Sender$1 {
  /**
   * Creates a Sender instance.
   *
   * @param {(net.Socket|tls.Socket)} socket The connection socket
   * @param {Object} [extensions] An object containing the negotiated extensions
   * @param {Function} [generateMask] The function used to generate the masking
   *     key
   */
  constructor(socket, extensions, generateMask) {
    this._extensions = extensions || {};

    if (generateMask) {
      this._generateMask = generateMask;
      this._maskBuffer = Buffer.alloc(4);
    }

    this._socket = socket;

    this._firstFragment = true;
    this._compress = false;

    this._bufferedBytes = 0;
    this._deflating = false;
    this._queue = [];
  }

  /**
   * Frames a piece of data according to the HyBi WebSocket protocol.
   *
   * @param {Buffer} data The data to frame
   * @param {Object} options Options object
   * @param {Boolean} [options.fin=false] Specifies whether or not to set the
   *     FIN bit
   * @param {Function} [options.generateMask] The function used to generate the
   *     masking key
   * @param {Boolean} [options.mask=false] Specifies whether or not to mask
   *     `data`
   * @param {Buffer} [options.maskBuffer] The buffer used to store the masking
   *     key
   * @param {Number} options.opcode The opcode
   * @param {Boolean} [options.readOnly=false] Specifies whether `data` can be
   *     modified
   * @param {Boolean} [options.rsv1=false] Specifies whether or not to set the
   *     RSV1 bit
   * @return {Buffer[]} The framed data as a list of `Buffer` instances
   * @public
   */
  static frame(data, options) {
    let mask;
    let merge = false;
    let offset = 2;
    let skipMasking = false;

    if (options.mask) {
      mask = options.maskBuffer || maskBuffer;

      if (options.generateMask) {
        options.generateMask(mask);
      } else {
        randomFillSync(mask, 0, 4);
      }

      skipMasking = (mask[0] | mask[1] | mask[2] | mask[3]) === 0;
      if (options.readOnly && !skipMasking) merge = true;

      offset = 6;
    }

    let payloadLength = data.length;

    if (data.length >= 65536) {
      offset += 8;
      payloadLength = 127;
    } else if (data.length > 125) {
      offset += 2;
      payloadLength = 126;
    }

    const target = Buffer.allocUnsafe(merge ? data.length + offset : offset);

    target[0] = options.fin ? options.opcode | 0x80 : options.opcode;
    if (options.rsv1) target[0] |= 0x40;

    target[1] = payloadLength;

    if (payloadLength === 126) {
      target.writeUInt16BE(data.length, 2);
    } else if (payloadLength === 127) {
      target[2] = target[3] = 0;
      target.writeUIntBE(data.length, 4, 6);
    }

    if (!options.mask) return [target, data];

    target[1] |= 0x80;
    target[offset - 4] = mask[0];
    target[offset - 3] = mask[1];
    target[offset - 2] = mask[2];
    target[offset - 1] = mask[3];

    if (skipMasking) return [target, data];

    if (merge) {
      applyMask(data, mask, target, offset, data.length);
      return [target];
    }

    applyMask(data, mask, data, 0, data.length);
    return [target, data];
  }

  /**
   * Sends a close message to the other peer.
   *
   * @param {Number} [code] The status code component of the body
   * @param {(String|Buffer)} [data] The message component of the body
   * @param {Boolean} [mask=false] Specifies whether or not to mask the message
   * @param {Function} [cb] Callback
   * @public
   */
  close(code, data, mask, cb) {
    let buf;

    if (code === undefined) {
      buf = EMPTY_BUFFER$1;
    } else if (typeof code !== 'number' || !isValidStatusCode(code)) {
      throw new TypeError('First argument must be a valid error code number');
    } else if (data === undefined || !data.length) {
      buf = Buffer.allocUnsafe(2);
      buf.writeUInt16BE(code, 0);
    } else {
      const length = Buffer.byteLength(data);

      if (length > 123) {
        throw new RangeError('The message must not be greater than 123 bytes');
      }

      buf = Buffer.allocUnsafe(2 + length);
      buf.writeUInt16BE(code, 0);

      if (typeof data === 'string') {
        buf.write(data, 2);
      } else {
        buf.set(data, 2);
      }
    }

    if (this._deflating) {
      this.enqueue([this.doClose, buf, mask, cb]);
    } else {
      this.doClose(buf, mask, cb);
    }
  }

  /**
   * Frames and sends a close message.
   *
   * @param {Buffer} data The message to send
   * @param {Boolean} [mask=false] Specifies whether or not to mask `data`
   * @param {Function} [cb] Callback
   * @private
   */
  doClose(data, mask, cb) {
    this.sendFrame(
      Sender$1.frame(data, {
        fin: true,
        rsv1: false,
        opcode: 0x08,
        mask,
        maskBuffer: this._maskBuffer,
        generateMask: this._generateMask,
        readOnly: false
      }),
      cb
    );
  }

  /**
   * Sends a ping message to the other peer.
   *
   * @param {*} data The message to send
   * @param {Boolean} [mask=false] Specifies whether or not to mask `data`
   * @param {Function} [cb] Callback
   * @public
   */
  ping(data, mask, cb) {
    const buf = toBuffer$1(data);

    if (buf.length > 125) {
      throw new RangeError('The data size must not be greater than 125 bytes');
    }

    if (this._deflating) {
      this.enqueue([this.doPing, buf, mask, toBuffer$1.readOnly, cb]);
    } else {
      this.doPing(buf, mask, toBuffer$1.readOnly, cb);
    }
  }

  /**
   * Frames and sends a ping message.
   *
   * @param {Buffer} data The message to send
   * @param {Boolean} [mask=false] Specifies whether or not to mask `data`
   * @param {Boolean} [readOnly=false] Specifies whether `data` can be modified
   * @param {Function} [cb] Callback
   * @private
   */
  doPing(data, mask, readOnly, cb) {
    this.sendFrame(
      Sender$1.frame(data, {
        fin: true,
        rsv1: false,
        opcode: 0x09,
        mask,
        maskBuffer: this._maskBuffer,
        generateMask: this._generateMask,
        readOnly
      }),
      cb
    );
  }

  /**
   * Sends a pong message to the other peer.
   *
   * @param {*} data The message to send
   * @param {Boolean} [mask=false] Specifies whether or not to mask `data`
   * @param {Function} [cb] Callback
   * @public
   */
  pong(data, mask, cb) {
    const buf = toBuffer$1(data);

    if (buf.length > 125) {
      throw new RangeError('The data size must not be greater than 125 bytes');
    }

    if (this._deflating) {
      this.enqueue([this.doPong, buf, mask, toBuffer$1.readOnly, cb]);
    } else {
      this.doPong(buf, mask, toBuffer$1.readOnly, cb);
    }
  }

  /**
   * Frames and sends a pong message.
   *
   * @param {Buffer} data The message to send
   * @param {Boolean} [mask=false] Specifies whether or not to mask `data`
   * @param {Boolean} [readOnly=false] Specifies whether `data` can be modified
   * @param {Function} [cb] Callback
   * @private
   */
  doPong(data, mask, readOnly, cb) {
    this.sendFrame(
      Sender$1.frame(data, {
        fin: true,
        rsv1: false,
        opcode: 0x0a,
        mask,
        maskBuffer: this._maskBuffer,
        generateMask: this._generateMask,
        readOnly
      }),
      cb
    );
  }

  /**
   * Sends a data message to the other peer.
   *
   * @param {*} data The message to send
   * @param {Object} options Options object
   * @param {Boolean} [options.binary=false] Specifies whether `data` is binary
   *     or text
   * @param {Boolean} [options.compress=false] Specifies whether or not to
   *     compress `data`
   * @param {Boolean} [options.fin=false] Specifies whether the fragment is the
   *     last one
   * @param {Boolean} [options.mask=false] Specifies whether or not to mask
   *     `data`
   * @param {Function} [cb] Callback
   * @public
   */
  send(data, options, cb) {
    const buf = toBuffer$1(data);
    const perMessageDeflate = this._extensions[PerMessageDeflate$2.extensionName];
    let opcode = options.binary ? 2 : 1;
    let rsv1 = options.compress;

    if (this._firstFragment) {
      this._firstFragment = false;
      if (
        rsv1 &&
        perMessageDeflate &&
        perMessageDeflate.params[
          perMessageDeflate._isServer
            ? 'server_no_context_takeover'
            : 'client_no_context_takeover'
        ]
      ) {
        rsv1 = buf.length >= perMessageDeflate._threshold;
      }
      this._compress = rsv1;
    } else {
      rsv1 = false;
      opcode = 0;
    }

    if (options.fin) this._firstFragment = true;

    if (perMessageDeflate) {
      const opts = {
        fin: options.fin,
        rsv1,
        opcode,
        mask: options.mask,
        maskBuffer: this._maskBuffer,
        generateMask: this._generateMask,
        readOnly: toBuffer$1.readOnly
      };

      if (this._deflating) {
        this.enqueue([this.dispatch, buf, this._compress, opts, cb]);
      } else {
        this.dispatch(buf, this._compress, opts, cb);
      }
    } else {
      this.sendFrame(
        Sender$1.frame(buf, {
          fin: options.fin,
          rsv1: false,
          opcode,
          mask: options.mask,
          maskBuffer: this._maskBuffer,
          generateMask: this._generateMask,
          readOnly: toBuffer$1.readOnly
        }),
        cb
      );
    }
  }

  /**
   * Dispatches a data message.
   *
   * @param {Buffer} data The message to send
   * @param {Boolean} [compress=false] Specifies whether or not to compress
   *     `data`
   * @param {Object} options Options object
   * @param {Number} options.opcode The opcode
   * @param {Boolean} [options.fin=false] Specifies whether or not to set the
   *     FIN bit
   * @param {Function} [options.generateMask] The function used to generate the
   *     masking key
   * @param {Boolean} [options.mask=false] Specifies whether or not to mask
   *     `data`
   * @param {Buffer} [options.maskBuffer] The buffer used to store the masking
   *     key
   * @param {Boolean} [options.readOnly=false] Specifies whether `data` can be
   *     modified
   * @param {Boolean} [options.rsv1=false] Specifies whether or not to set the
   *     RSV1 bit
   * @param {Function} [cb] Callback
   * @private
   */
  dispatch(data, compress, options, cb) {
    if (!compress) {
      this.sendFrame(Sender$1.frame(data, options), cb);
      return;
    }

    const perMessageDeflate = this._extensions[PerMessageDeflate$2.extensionName];

    this._bufferedBytes += data.length;
    this._deflating = true;
    perMessageDeflate.compress(data, options.fin, (_, buf) => {
      if (this._socket.destroyed) {
        const err = new Error(
          'The socket was closed while data was being compressed'
        );

        if (typeof cb === 'function') cb(err);

        for (let i = 0; i < this._queue.length; i++) {
          const callback = this._queue[i][4];

          if (typeof callback === 'function') callback(err);
        }

        return;
      }

      this._bufferedBytes -= data.length;
      this._deflating = false;
      options.readOnly = false;
      this.sendFrame(Sender$1.frame(buf, options), cb);
      this.dequeue();
    });
  }

  /**
   * Executes queued send operations.
   *
   * @private
   */
  dequeue() {
    while (!this._deflating && this._queue.length) {
      const params = this._queue.shift();

      this._bufferedBytes -= params[1].length;
      Reflect.apply(params[0], this, params.slice(1));
    }
  }

  /**
   * Enqueues a send operation.
   *
   * @param {Array} params Send operation parameters.
   * @private
   */
  enqueue(params) {
    this._bufferedBytes += params[1].length;
    this._queue.push(params);
  }

  /**
   * Sends a frame.
   *
   * @param {Buffer[]} list The frame to send
   * @param {Function} [cb] Callback
   * @private
   */
  sendFrame(list, cb) {
    if (list.length === 2) {
      this._socket.cork();
      this._socket.write(list[0]);
      this._socket.write(list[1], cb);
      this._socket.uncork();
    } else {
      this._socket.write(list[0], cb);
    }
  }
}

var sender = Sender$1;

const { kForOnEventAttribute: kForOnEventAttribute$1, kListener: kListener$1 } = constants;

const kCode = Symbol('kCode');
const kData = Symbol('kData');
const kError = Symbol('kError');
const kMessage = Symbol('kMessage');
const kReason = Symbol('kReason');
const kTarget = Symbol('kTarget');
const kType = Symbol('kType');
const kWasClean = Symbol('kWasClean');

/**
 * Class representing an event.
 */
class Event {
  /**
   * Create a new `Event`.
   *
   * @param {String} type The name of the event
   * @throws {TypeError} If the `type` argument is not specified
   */
  constructor(type) {
    this[kTarget] = null;
    this[kType] = type;
  }

  /**
   * @type {*}
   */
  get target() {
    return this[kTarget];
  }

  /**
   * @type {String}
   */
  get type() {
    return this[kType];
  }
}

Object.defineProperty(Event.prototype, 'target', { enumerable: true });
Object.defineProperty(Event.prototype, 'type', { enumerable: true });

/**
 * Class representing a close event.
 *
 * @extends Event
 */
class CloseEvent extends Event {
  /**
   * Create a new `CloseEvent`.
   *
   * @param {String} type The name of the event
   * @param {Object} [options] A dictionary object that allows for setting
   *     attributes via object members of the same name
   * @param {Number} [options.code=0] The status code explaining why the
   *     connection was closed
   * @param {String} [options.reason=''] A human-readable string explaining why
   *     the connection was closed
   * @param {Boolean} [options.wasClean=false] Indicates whether or not the
   *     connection was cleanly closed
   */
  constructor(type, options = {}) {
    super(type);

    this[kCode] = options.code === undefined ? 0 : options.code;
    this[kReason] = options.reason === undefined ? '' : options.reason;
    this[kWasClean] = options.wasClean === undefined ? false : options.wasClean;
  }

  /**
   * @type {Number}
   */
  get code() {
    return this[kCode];
  }

  /**
   * @type {String}
   */
  get reason() {
    return this[kReason];
  }

  /**
   * @type {Boolean}
   */
  get wasClean() {
    return this[kWasClean];
  }
}

Object.defineProperty(CloseEvent.prototype, 'code', { enumerable: true });
Object.defineProperty(CloseEvent.prototype, 'reason', { enumerable: true });
Object.defineProperty(CloseEvent.prototype, 'wasClean', { enumerable: true });

/**
 * Class representing an error event.
 *
 * @extends Event
 */
class ErrorEvent extends Event {
  /**
   * Create a new `ErrorEvent`.
   *
   * @param {String} type The name of the event
   * @param {Object} [options] A dictionary object that allows for setting
   *     attributes via object members of the same name
   * @param {*} [options.error=null] The error that generated this event
   * @param {String} [options.message=''] The error message
   */
  constructor(type, options = {}) {
    super(type);

    this[kError] = options.error === undefined ? null : options.error;
    this[kMessage] = options.message === undefined ? '' : options.message;
  }

  /**
   * @type {*}
   */
  get error() {
    return this[kError];
  }

  /**
   * @type {String}
   */
  get message() {
    return this[kMessage];
  }
}

Object.defineProperty(ErrorEvent.prototype, 'error', { enumerable: true });
Object.defineProperty(ErrorEvent.prototype, 'message', { enumerable: true });

/**
 * Class representing a message event.
 *
 * @extends Event
 */
class MessageEvent extends Event {
  /**
   * Create a new `MessageEvent`.
   *
   * @param {String} type The name of the event
   * @param {Object} [options] A dictionary object that allows for setting
   *     attributes via object members of the same name
   * @param {*} [options.data=null] The message content
   */
  constructor(type, options = {}) {
    super(type);

    this[kData] = options.data === undefined ? null : options.data;
  }

  /**
   * @type {*}
   */
  get data() {
    return this[kData];
  }
}

Object.defineProperty(MessageEvent.prototype, 'data', { enumerable: true });

/**
 * This provides methods for emulating the `EventTarget` interface. It's not
 * meant to be used directly.
 *
 * @mixin
 */
const EventTarget = {
  /**
   * Register an event listener.
   *
   * @param {String} type A string representing the event type to listen for
   * @param {Function} listener The listener to add
   * @param {Object} [options] An options object specifies characteristics about
   *     the event listener
   * @param {Boolean} [options.once=false] A `Boolean` indicating that the
   *     listener should be invoked at most once after being added. If `true`,
   *     the listener would be automatically removed when invoked.
   * @public
   */
  addEventListener(type, listener, options = {}) {
    let wrapper;

    if (type === 'message') {
      wrapper = function onMessage(data, isBinary) {
        const event = new MessageEvent('message', {
          data: isBinary ? data : data.toString()
        });

        event[kTarget] = this;
        listener.call(this, event);
      };
    } else if (type === 'close') {
      wrapper = function onClose(code, message) {
        const event = new CloseEvent('close', {
          code,
          reason: message.toString(),
          wasClean: this._closeFrameReceived && this._closeFrameSent
        });

        event[kTarget] = this;
        listener.call(this, event);
      };
    } else if (type === 'error') {
      wrapper = function onError(error) {
        const event = new ErrorEvent('error', {
          error,
          message: error.message
        });

        event[kTarget] = this;
        listener.call(this, event);
      };
    } else if (type === 'open') {
      wrapper = function onOpen() {
        const event = new Event('open');

        event[kTarget] = this;
        listener.call(this, event);
      };
    } else {
      return;
    }

    wrapper[kForOnEventAttribute$1] = !!options[kForOnEventAttribute$1];
    wrapper[kListener$1] = listener;

    if (options.once) {
      this.once(type, wrapper);
    } else {
      this.on(type, wrapper);
    }
  },

  /**
   * Remove an event listener.
   *
   * @param {String} type A string representing the event type to remove
   * @param {Function} handler The listener to remove
   * @public
   */
  removeEventListener(type, handler) {
    for (const listener of this.listeners(type)) {
      if (listener[kListener$1] === handler && !listener[kForOnEventAttribute$1]) {
        this.removeListener(type, listener);
        break;
      }
    }
  }
};

var eventTarget = {
  CloseEvent,
  ErrorEvent,
  Event,
  EventTarget,
  MessageEvent
};

const { tokenChars: tokenChars$1 } = validation.exports;

/**
 * Adds an offer to the map of extension offers or a parameter to the map of
 * parameters.
 *
 * @param {Object} dest The map of extension offers or parameters
 * @param {String} name The extension or parameter name
 * @param {(Object|Boolean|String)} elem The extension parameters or the
 *     parameter value
 * @private
 */
function push(dest, name, elem) {
  if (dest[name] === undefined) dest[name] = [elem];
  else dest[name].push(elem);
}

/**
 * Parses the `Sec-WebSocket-Extensions` header into an object.
 *
 * @param {String} header The field value of the header
 * @return {Object} The parsed object
 * @public
 */
function parse$2(header) {
  const offers = Object.create(null);
  let params = Object.create(null);
  let mustUnescape = false;
  let isEscaping = false;
  let inQuotes = false;
  let extensionName;
  let paramName;
  let start = -1;
  let code = -1;
  let end = -1;
  let i = 0;

  for (; i < header.length; i++) {
    code = header.charCodeAt(i);

    if (extensionName === undefined) {
      if (end === -1 && tokenChars$1[code] === 1) {
        if (start === -1) start = i;
      } else if (
        i !== 0 &&
        (code === 0x20 /* ' ' */ || code === 0x09) /* '\t' */
      ) {
        if (end === -1 && start !== -1) end = i;
      } else if (code === 0x3b /* ';' */ || code === 0x2c /* ',' */) {
        if (start === -1) {
          throw new SyntaxError(`Unexpected character at index ${i}`);
        }

        if (end === -1) end = i;
        const name = header.slice(start, end);
        if (code === 0x2c) {
          push(offers, name, params);
          params = Object.create(null);
        } else {
          extensionName = name;
        }

        start = end = -1;
      } else {
        throw new SyntaxError(`Unexpected character at index ${i}`);
      }
    } else if (paramName === undefined) {
      if (end === -1 && tokenChars$1[code] === 1) {
        if (start === -1) start = i;
      } else if (code === 0x20 || code === 0x09) {
        if (end === -1 && start !== -1) end = i;
      } else if (code === 0x3b || code === 0x2c) {
        if (start === -1) {
          throw new SyntaxError(`Unexpected character at index ${i}`);
        }

        if (end === -1) end = i;
        push(params, header.slice(start, end), true);
        if (code === 0x2c) {
          push(offers, extensionName, params);
          params = Object.create(null);
          extensionName = undefined;
        }

        start = end = -1;
      } else if (code === 0x3d /* '=' */ && start !== -1 && end === -1) {
        paramName = header.slice(start, i);
        start = end = -1;
      } else {
        throw new SyntaxError(`Unexpected character at index ${i}`);
      }
    } else {
      //
      // The value of a quoted-string after unescaping must conform to the
      // token ABNF, so only token characters are valid.
      // Ref: https://tools.ietf.org/html/rfc6455#section-9.1
      //
      if (isEscaping) {
        if (tokenChars$1[code] !== 1) {
          throw new SyntaxError(`Unexpected character at index ${i}`);
        }
        if (start === -1) start = i;
        else if (!mustUnescape) mustUnescape = true;
        isEscaping = false;
      } else if (inQuotes) {
        if (tokenChars$1[code] === 1) {
          if (start === -1) start = i;
        } else if (code === 0x22 /* '"' */ && start !== -1) {
          inQuotes = false;
          end = i;
        } else if (code === 0x5c /* '\' */) {
          isEscaping = true;
        } else {
          throw new SyntaxError(`Unexpected character at index ${i}`);
        }
      } else if (code === 0x22 && header.charCodeAt(i - 1) === 0x3d) {
        inQuotes = true;
      } else if (end === -1 && tokenChars$1[code] === 1) {
        if (start === -1) start = i;
      } else if (start !== -1 && (code === 0x20 || code === 0x09)) {
        if (end === -1) end = i;
      } else if (code === 0x3b || code === 0x2c) {
        if (start === -1) {
          throw new SyntaxError(`Unexpected character at index ${i}`);
        }

        if (end === -1) end = i;
        let value = header.slice(start, end);
        if (mustUnescape) {
          value = value.replace(/\\/g, '');
          mustUnescape = false;
        }
        push(params, paramName, value);
        if (code === 0x2c) {
          push(offers, extensionName, params);
          params = Object.create(null);
          extensionName = undefined;
        }

        paramName = undefined;
        start = end = -1;
      } else {
        throw new SyntaxError(`Unexpected character at index ${i}`);
      }
    }
  }

  if (start === -1 || inQuotes || code === 0x20 || code === 0x09) {
    throw new SyntaxError('Unexpected end of input');
  }

  if (end === -1) end = i;
  const token = header.slice(start, end);
  if (extensionName === undefined) {
    push(offers, token, params);
  } else {
    if (paramName === undefined) {
      push(params, token, true);
    } else if (mustUnescape) {
      push(params, paramName, token.replace(/\\/g, ''));
    } else {
      push(params, paramName, token);
    }
    push(offers, extensionName, params);
  }

  return offers;
}

/**
 * Builds the `Sec-WebSocket-Extensions` header field value.
 *
 * @param {Object} extensions The map of extensions and parameters to format
 * @return {String} A string representing the given object
 * @public
 */
function format$1(extensions) {
  return Object.keys(extensions)
    .map((extension) => {
      let configurations = extensions[extension];
      if (!Array.isArray(configurations)) configurations = [configurations];
      return configurations
        .map((params) => {
          return [extension]
            .concat(
              Object.keys(params).map((k) => {
                let values = params[k];
                if (!Array.isArray(values)) values = [values];
                return values
                  .map((v) => (v === true ? k : `${k}=${v}`))
                  .join('; ');
              })
            )
            .join('; ');
        })
        .join(', ');
    })
    .join(', ');
}

var extension$1 = { format: format$1, parse: parse$2 };

/* eslint no-unused-vars: ["error", { "varsIgnorePattern": "^Readable$" }] */

const EventEmitter$1 = require$$2;
const https = require$$1;
const http$1 = require$$2$1;
const net = require$$3;
const tls = require$$4;
const { randomBytes, createHash: createHash$1 } = require$$5;
const { URL: URL$1 } = require$$7;

const PerMessageDeflate$1 = permessageDeflate;
const Receiver = receiver;
const Sender = sender;
const {
  BINARY_TYPES,
  EMPTY_BUFFER,
  GUID: GUID$1,
  kForOnEventAttribute,
  kListener,
  kStatusCode,
  kWebSocket: kWebSocket$1,
  NOOP
} = constants;
const {
  EventTarget: { addEventListener, removeEventListener }
} = eventTarget;
const { format, parse: parse$1 } = extension$1;
const { toBuffer } = bufferUtil$1.exports;

const readyStates = ['CONNECTING', 'OPEN', 'CLOSING', 'CLOSED'];
const subprotocolRegex = /^[!#$%&'*+\-.0-9A-Z^_`|a-z~]+$/;
const protocolVersions = [8, 13];
const closeTimeout = 30 * 1000;

/**
 * Class representing a WebSocket.
 *
 * @extends EventEmitter
 */
class WebSocket$1 extends EventEmitter$1 {
  /**
   * Create a new `WebSocket`.
   *
   * @param {(String|URL)} address The URL to which to connect
   * @param {(String|String[])} [protocols] The subprotocols
   * @param {Object} [options] Connection options
   */
  constructor(address, protocols, options) {
    super();

    this._binaryType = BINARY_TYPES[0];
    this._closeCode = 1006;
    this._closeFrameReceived = false;
    this._closeFrameSent = false;
    this._closeMessage = EMPTY_BUFFER;
    this._closeTimer = null;
    this._extensions = {};
    this._paused = false;
    this._protocol = '';
    this._readyState = WebSocket$1.CONNECTING;
    this._receiver = null;
    this._sender = null;
    this._socket = null;

    if (address !== null) {
      this._bufferedAmount = 0;
      this._isServer = false;
      this._redirects = 0;

      if (protocols === undefined) {
        protocols = [];
      } else if (!Array.isArray(protocols)) {
        if (typeof protocols === 'object' && protocols !== null) {
          options = protocols;
          protocols = [];
        } else {
          protocols = [protocols];
        }
      }

      initAsClient(this, address, protocols, options);
    } else {
      this._isServer = true;
    }
  }

  /**
   * This deviates from the WHATWG interface since ws doesn't support the
   * required default "blob" type (instead we define a custom "nodebuffer"
   * type).
   *
   * @type {String}
   */
  get binaryType() {
    return this._binaryType;
  }

  set binaryType(type) {
    if (!BINARY_TYPES.includes(type)) return;

    this._binaryType = type;

    //
    // Allow to change `binaryType` on the fly.
    //
    if (this._receiver) this._receiver._binaryType = type;
  }

  /**
   * @type {Number}
   */
  get bufferedAmount() {
    if (!this._socket) return this._bufferedAmount;

    return this._socket._writableState.length + this._sender._bufferedBytes;
  }

  /**
   * @type {String}
   */
  get extensions() {
    return Object.keys(this._extensions).join();
  }

  /**
   * @type {Boolean}
   */
  get isPaused() {
    return this._paused;
  }

  /**
   * @type {Function}
   */
  /* istanbul ignore next */
  get onclose() {
    return null;
  }

  /**
   * @type {Function}
   */
  /* istanbul ignore next */
  get onerror() {
    return null;
  }

  /**
   * @type {Function}
   */
  /* istanbul ignore next */
  get onopen() {
    return null;
  }

  /**
   * @type {Function}
   */
  /* istanbul ignore next */
  get onmessage() {
    return null;
  }

  /**
   * @type {String}
   */
  get protocol() {
    return this._protocol;
  }

  /**
   * @type {Number}
   */
  get readyState() {
    return this._readyState;
  }

  /**
   * @type {String}
   */
  get url() {
    return this._url;
  }

  /**
   * Set up the socket and the internal resources.
   *
   * @param {(net.Socket|tls.Socket)} socket The network socket between the
   *     server and client
   * @param {Buffer} head The first packet of the upgraded stream
   * @param {Object} options Options object
   * @param {Function} [options.generateMask] The function used to generate the
   *     masking key
   * @param {Number} [options.maxPayload=0] The maximum allowed message size
   * @param {Boolean} [options.skipUTF8Validation=false] Specifies whether or
   *     not to skip UTF-8 validation for text and close messages
   * @private
   */
  setSocket(socket, head, options) {
    const receiver = new Receiver({
      binaryType: this.binaryType,
      extensions: this._extensions,
      isServer: this._isServer,
      maxPayload: options.maxPayload,
      skipUTF8Validation: options.skipUTF8Validation
    });

    this._sender = new Sender(socket, this._extensions, options.generateMask);
    this._receiver = receiver;
    this._socket = socket;

    receiver[kWebSocket$1] = this;
    socket[kWebSocket$1] = this;

    receiver.on('conclude', receiverOnConclude);
    receiver.on('drain', receiverOnDrain);
    receiver.on('error', receiverOnError);
    receiver.on('message', receiverOnMessage);
    receiver.on('ping', receiverOnPing);
    receiver.on('pong', receiverOnPong);

    socket.setTimeout(0);
    socket.setNoDelay();

    if (head.length > 0) socket.unshift(head);

    socket.on('close', socketOnClose);
    socket.on('data', socketOnData);
    socket.on('end', socketOnEnd);
    socket.on('error', socketOnError$1);

    this._readyState = WebSocket$1.OPEN;
    this.emit('open');
  }

  /**
   * Emit the `'close'` event.
   *
   * @private
   */
  emitClose() {
    if (!this._socket) {
      this._readyState = WebSocket$1.CLOSED;
      this.emit('close', this._closeCode, this._closeMessage);
      return;
    }

    if (this._extensions[PerMessageDeflate$1.extensionName]) {
      this._extensions[PerMessageDeflate$1.extensionName].cleanup();
    }

    this._receiver.removeAllListeners();
    this._readyState = WebSocket$1.CLOSED;
    this.emit('close', this._closeCode, this._closeMessage);
  }

  /**
   * Start a closing handshake.
   *
   *          +----------+   +-----------+   +----------+
   *     - - -|ws.close()|-->|close frame|-->|ws.close()|- - -
   *    |     +----------+   +-----------+   +----------+     |
   *          +----------+   +-----------+         |
   * CLOSING  |ws.close()|<--|close frame|<--+-----+       CLOSING
   *          +----------+   +-----------+   |
   *    |           |                        |   +---+        |
   *                +------------------------+-->|fin| - - - -
   *    |         +---+                      |   +---+
   *     - - - - -|fin|<---------------------+
   *              +---+
   *
   * @param {Number} [code] Status code explaining why the connection is closing
   * @param {(String|Buffer)} [data] The reason why the connection is
   *     closing
   * @public
   */
  close(code, data) {
    if (this.readyState === WebSocket$1.CLOSED) return;
    if (this.readyState === WebSocket$1.CONNECTING) {
      const msg = 'WebSocket was closed before the connection was established';
      return abortHandshake$1(this, this._req, msg);
    }

    if (this.readyState === WebSocket$1.CLOSING) {
      if (
        this._closeFrameSent &&
        (this._closeFrameReceived || this._receiver._writableState.errorEmitted)
      ) {
        this._socket.end();
      }

      return;
    }

    this._readyState = WebSocket$1.CLOSING;
    this._sender.close(code, data, !this._isServer, (err) => {
      //
      // This error is handled by the `'error'` listener on the socket. We only
      // want to know if the close frame has been sent here.
      //
      if (err) return;

      this._closeFrameSent = true;

      if (
        this._closeFrameReceived ||
        this._receiver._writableState.errorEmitted
      ) {
        this._socket.end();
      }
    });

    //
    // Specify a timeout for the closing handshake to complete.
    //
    this._closeTimer = setTimeout(
      this._socket.destroy.bind(this._socket),
      closeTimeout
    );
  }

  /**
   * Pause the socket.
   *
   * @public
   */
  pause() {
    if (
      this.readyState === WebSocket$1.CONNECTING ||
      this.readyState === WebSocket$1.CLOSED
    ) {
      return;
    }

    this._paused = true;
    this._socket.pause();
  }

  /**
   * Send a ping.
   *
   * @param {*} [data] The data to send
   * @param {Boolean} [mask] Indicates whether or not to mask `data`
   * @param {Function} [cb] Callback which is executed when the ping is sent
   * @public
   */
  ping(data, mask, cb) {
    if (this.readyState === WebSocket$1.CONNECTING) {
      throw new Error('WebSocket is not open: readyState 0 (CONNECTING)');
    }

    if (typeof data === 'function') {
      cb = data;
      data = mask = undefined;
    } else if (typeof mask === 'function') {
      cb = mask;
      mask = undefined;
    }

    if (typeof data === 'number') data = data.toString();

    if (this.readyState !== WebSocket$1.OPEN) {
      sendAfterClose(this, data, cb);
      return;
    }

    if (mask === undefined) mask = !this._isServer;
    this._sender.ping(data || EMPTY_BUFFER, mask, cb);
  }

  /**
   * Send a pong.
   *
   * @param {*} [data] The data to send
   * @param {Boolean} [mask] Indicates whether or not to mask `data`
   * @param {Function} [cb] Callback which is executed when the pong is sent
   * @public
   */
  pong(data, mask, cb) {
    if (this.readyState === WebSocket$1.CONNECTING) {
      throw new Error('WebSocket is not open: readyState 0 (CONNECTING)');
    }

    if (typeof data === 'function') {
      cb = data;
      data = mask = undefined;
    } else if (typeof mask === 'function') {
      cb = mask;
      mask = undefined;
    }

    if (typeof data === 'number') data = data.toString();

    if (this.readyState !== WebSocket$1.OPEN) {
      sendAfterClose(this, data, cb);
      return;
    }

    if (mask === undefined) mask = !this._isServer;
    this._sender.pong(data || EMPTY_BUFFER, mask, cb);
  }

  /**
   * Resume the socket.
   *
   * @public
   */
  resume() {
    if (
      this.readyState === WebSocket$1.CONNECTING ||
      this.readyState === WebSocket$1.CLOSED
    ) {
      return;
    }

    this._paused = false;
    if (!this._receiver._writableState.needDrain) this._socket.resume();
  }

  /**
   * Send a data message.
   *
   * @param {*} data The message to send
   * @param {Object} [options] Options object
   * @param {Boolean} [options.binary] Specifies whether `data` is binary or
   *     text
   * @param {Boolean} [options.compress] Specifies whether or not to compress
   *     `data`
   * @param {Boolean} [options.fin=true] Specifies whether the fragment is the
   *     last one
   * @param {Boolean} [options.mask] Specifies whether or not to mask `data`
   * @param {Function} [cb] Callback which is executed when data is written out
   * @public
   */
  send(data, options, cb) {
    if (this.readyState === WebSocket$1.CONNECTING) {
      throw new Error('WebSocket is not open: readyState 0 (CONNECTING)');
    }

    if (typeof options === 'function') {
      cb = options;
      options = {};
    }

    if (typeof data === 'number') data = data.toString();

    if (this.readyState !== WebSocket$1.OPEN) {
      sendAfterClose(this, data, cb);
      return;
    }

    const opts = {
      binary: typeof data !== 'string',
      mask: !this._isServer,
      compress: true,
      fin: true,
      ...options
    };

    if (!this._extensions[PerMessageDeflate$1.extensionName]) {
      opts.compress = false;
    }

    this._sender.send(data || EMPTY_BUFFER, opts, cb);
  }

  /**
   * Forcibly close the connection.
   *
   * @public
   */
  terminate() {
    if (this.readyState === WebSocket$1.CLOSED) return;
    if (this.readyState === WebSocket$1.CONNECTING) {
      const msg = 'WebSocket was closed before the connection was established';
      return abortHandshake$1(this, this._req, msg);
    }

    if (this._socket) {
      this._readyState = WebSocket$1.CLOSING;
      this._socket.destroy();
    }
  }
}

/**
 * @constant {Number} CONNECTING
 * @memberof WebSocket
 */
Object.defineProperty(WebSocket$1, 'CONNECTING', {
  enumerable: true,
  value: readyStates.indexOf('CONNECTING')
});

/**
 * @constant {Number} CONNECTING
 * @memberof WebSocket.prototype
 */
Object.defineProperty(WebSocket$1.prototype, 'CONNECTING', {
  enumerable: true,
  value: readyStates.indexOf('CONNECTING')
});

/**
 * @constant {Number} OPEN
 * @memberof WebSocket
 */
Object.defineProperty(WebSocket$1, 'OPEN', {
  enumerable: true,
  value: readyStates.indexOf('OPEN')
});

/**
 * @constant {Number} OPEN
 * @memberof WebSocket.prototype
 */
Object.defineProperty(WebSocket$1.prototype, 'OPEN', {
  enumerable: true,
  value: readyStates.indexOf('OPEN')
});

/**
 * @constant {Number} CLOSING
 * @memberof WebSocket
 */
Object.defineProperty(WebSocket$1, 'CLOSING', {
  enumerable: true,
  value: readyStates.indexOf('CLOSING')
});

/**
 * @constant {Number} CLOSING
 * @memberof WebSocket.prototype
 */
Object.defineProperty(WebSocket$1.prototype, 'CLOSING', {
  enumerable: true,
  value: readyStates.indexOf('CLOSING')
});

/**
 * @constant {Number} CLOSED
 * @memberof WebSocket
 */
Object.defineProperty(WebSocket$1, 'CLOSED', {
  enumerable: true,
  value: readyStates.indexOf('CLOSED')
});

/**
 * @constant {Number} CLOSED
 * @memberof WebSocket.prototype
 */
Object.defineProperty(WebSocket$1.prototype, 'CLOSED', {
  enumerable: true,
  value: readyStates.indexOf('CLOSED')
});

[
  'binaryType',
  'bufferedAmount',
  'extensions',
  'isPaused',
  'protocol',
  'readyState',
  'url'
].forEach((property) => {
  Object.defineProperty(WebSocket$1.prototype, property, { enumerable: true });
});

//
// Add the `onopen`, `onerror`, `onclose`, and `onmessage` attributes.
// See https://html.spec.whatwg.org/multipage/comms.html#the-websocket-interface
//
['open', 'error', 'close', 'message'].forEach((method) => {
  Object.defineProperty(WebSocket$1.prototype, `on${method}`, {
    enumerable: true,
    get() {
      for (const listener of this.listeners(method)) {
        if (listener[kForOnEventAttribute]) return listener[kListener];
      }

      return null;
    },
    set(handler) {
      for (const listener of this.listeners(method)) {
        if (listener[kForOnEventAttribute]) {
          this.removeListener(method, listener);
          break;
        }
      }

      if (typeof handler !== 'function') return;

      this.addEventListener(method, handler, {
        [kForOnEventAttribute]: true
      });
    }
  });
});

WebSocket$1.prototype.addEventListener = addEventListener;
WebSocket$1.prototype.removeEventListener = removeEventListener;

var websocket = WebSocket$1;

/**
 * Initialize a WebSocket client.
 *
 * @param {WebSocket} websocket The client to initialize
 * @param {(String|URL)} address The URL to which to connect
 * @param {Array} protocols The subprotocols
 * @param {Object} [options] Connection options
 * @param {Boolean} [options.followRedirects=false] Whether or not to follow
 *     redirects
 * @param {Function} [options.generateMask] The function used to generate the
 *     masking key
 * @param {Number} [options.handshakeTimeout] Timeout in milliseconds for the
 *     handshake request
 * @param {Number} [options.maxPayload=104857600] The maximum allowed message
 *     size
 * @param {Number} [options.maxRedirects=10] The maximum number of redirects
 *     allowed
 * @param {String} [options.origin] Value of the `Origin` or
 *     `Sec-WebSocket-Origin` header
 * @param {(Boolean|Object)} [options.perMessageDeflate=true] Enable/disable
 *     permessage-deflate
 * @param {Number} [options.protocolVersion=13] Value of the
 *     `Sec-WebSocket-Version` header
 * @param {Boolean} [options.skipUTF8Validation=false] Specifies whether or
 *     not to skip UTF-8 validation for text and close messages
 * @private
 */
function initAsClient(websocket, address, protocols, options) {
  const opts = {
    protocolVersion: protocolVersions[1],
    maxPayload: 100 * 1024 * 1024,
    skipUTF8Validation: false,
    perMessageDeflate: true,
    followRedirects: false,
    maxRedirects: 10,
    ...options,
    createConnection: undefined,
    socketPath: undefined,
    hostname: undefined,
    protocol: undefined,
    timeout: undefined,
    method: undefined,
    host: undefined,
    path: undefined,
    port: undefined
  };

  if (!protocolVersions.includes(opts.protocolVersion)) {
    throw new RangeError(
      `Unsupported protocol version: ${opts.protocolVersion} ` +
        `(supported versions: ${protocolVersions.join(', ')})`
    );
  }

  let parsedUrl;

  if (address instanceof URL$1) {
    parsedUrl = address;
    websocket._url = address.href;
  } else {
    try {
      parsedUrl = new URL$1(address);
    } catch (e) {
      throw new SyntaxError(`Invalid URL: ${address}`);
    }

    websocket._url = address;
  }

  const isSecure = parsedUrl.protocol === 'wss:';
  const isUnixSocket = parsedUrl.protocol === 'ws+unix:';
  let invalidURLMessage;

  if (parsedUrl.protocol !== 'ws:' && !isSecure && !isUnixSocket) {
    invalidURLMessage =
      'The URL\'s protocol must be one of "ws:", "wss:", or "ws+unix:"';
  } else if (isUnixSocket && !parsedUrl.pathname) {
    invalidURLMessage = "The URL's pathname is empty";
  } else if (parsedUrl.hash) {
    invalidURLMessage = 'The URL contains a fragment identifier';
  }

  if (invalidURLMessage) {
    const err = new SyntaxError(invalidURLMessage);

    if (websocket._redirects === 0) {
      throw err;
    } else {
      emitErrorAndClose(websocket, err);
      return;
    }
  }

  const defaultPort = isSecure ? 443 : 80;
  const key = randomBytes(16).toString('base64');
  const get = isSecure ? https.get : http$1.get;
  const protocolSet = new Set();
  let perMessageDeflate;

  opts.createConnection = isSecure ? tlsConnect : netConnect;
  opts.defaultPort = opts.defaultPort || defaultPort;
  opts.port = parsedUrl.port || defaultPort;
  opts.host = parsedUrl.hostname.startsWith('[')
    ? parsedUrl.hostname.slice(1, -1)
    : parsedUrl.hostname;
  opts.headers = {
    'Sec-WebSocket-Version': opts.protocolVersion,
    'Sec-WebSocket-Key': key,
    Connection: 'Upgrade',
    Upgrade: 'websocket',
    ...opts.headers
  };
  opts.path = parsedUrl.pathname + parsedUrl.search;
  opts.timeout = opts.handshakeTimeout;

  if (opts.perMessageDeflate) {
    perMessageDeflate = new PerMessageDeflate$1(
      opts.perMessageDeflate !== true ? opts.perMessageDeflate : {},
      false,
      opts.maxPayload
    );
    opts.headers['Sec-WebSocket-Extensions'] = format({
      [PerMessageDeflate$1.extensionName]: perMessageDeflate.offer()
    });
  }
  if (protocols.length) {
    for (const protocol of protocols) {
      if (
        typeof protocol !== 'string' ||
        !subprotocolRegex.test(protocol) ||
        protocolSet.has(protocol)
      ) {
        throw new SyntaxError(
          'An invalid or duplicated subprotocol was specified'
        );
      }

      protocolSet.add(protocol);
    }

    opts.headers['Sec-WebSocket-Protocol'] = protocols.join(',');
  }
  if (opts.origin) {
    if (opts.protocolVersion < 13) {
      opts.headers['Sec-WebSocket-Origin'] = opts.origin;
    } else {
      opts.headers.Origin = opts.origin;
    }
  }
  if (parsedUrl.username || parsedUrl.password) {
    opts.auth = `${parsedUrl.username}:${parsedUrl.password}`;
  }

  if (isUnixSocket) {
    const parts = opts.path.split(':');

    opts.socketPath = parts[0];
    opts.path = parts[1];
  }

  let req = (websocket._req = get(opts));

  if (opts.timeout) {
    req.on('timeout', () => {
      abortHandshake$1(websocket, req, 'Opening handshake has timed out');
    });
  }

  req.on('error', (err) => {
    if (req === null || req.aborted) return;

    req = websocket._req = null;
    emitErrorAndClose(websocket, err);
  });

  req.on('response', (res) => {
    const location = res.headers.location;
    const statusCode = res.statusCode;

    if (
      location &&
      opts.followRedirects &&
      statusCode >= 300 &&
      statusCode < 400
    ) {
      if (++websocket._redirects > opts.maxRedirects) {
        abortHandshake$1(websocket, req, 'Maximum redirects exceeded');
        return;
      }

      req.abort();

      let addr;

      try {
        addr = new URL$1(location, address);
      } catch (e) {
        const err = new SyntaxError(`Invalid URL: ${location}`);
        emitErrorAndClose(websocket, err);
        return;
      }

      initAsClient(websocket, addr, protocols, options);
    } else if (!websocket.emit('unexpected-response', req, res)) {
      abortHandshake$1(
        websocket,
        req,
        `Unexpected server response: ${res.statusCode}`
      );
    }
  });

  req.on('upgrade', (res, socket, head) => {
    websocket.emit('upgrade', res);

    //
    // The user may have closed the connection from a listener of the `upgrade`
    // event.
    //
    if (websocket.readyState !== WebSocket$1.CONNECTING) return;

    req = websocket._req = null;

    const digest = createHash$1('sha1')
      .update(key + GUID$1)
      .digest('base64');

    if (res.headers['sec-websocket-accept'] !== digest) {
      abortHandshake$1(websocket, socket, 'Invalid Sec-WebSocket-Accept header');
      return;
    }

    const serverProt = res.headers['sec-websocket-protocol'];
    let protError;

    if (serverProt !== undefined) {
      if (!protocolSet.size) {
        protError = 'Server sent a subprotocol but none was requested';
      } else if (!protocolSet.has(serverProt)) {
        protError = 'Server sent an invalid subprotocol';
      }
    } else if (protocolSet.size) {
      protError = 'Server sent no subprotocol';
    }

    if (protError) {
      abortHandshake$1(websocket, socket, protError);
      return;
    }

    if (serverProt) websocket._protocol = serverProt;

    const secWebSocketExtensions = res.headers['sec-websocket-extensions'];

    if (secWebSocketExtensions !== undefined) {
      if (!perMessageDeflate) {
        const message =
          'Server sent a Sec-WebSocket-Extensions header but no extension ' +
          'was requested';
        abortHandshake$1(websocket, socket, message);
        return;
      }

      let extensions;

      try {
        extensions = parse$1(secWebSocketExtensions);
      } catch (err) {
        const message = 'Invalid Sec-WebSocket-Extensions header';
        abortHandshake$1(websocket, socket, message);
        return;
      }

      const extensionNames = Object.keys(extensions);

      if (
        extensionNames.length !== 1 ||
        extensionNames[0] !== PerMessageDeflate$1.extensionName
      ) {
        const message = 'Server indicated an extension that was not requested';
        abortHandshake$1(websocket, socket, message);
        return;
      }

      try {
        perMessageDeflate.accept(extensions[PerMessageDeflate$1.extensionName]);
      } catch (err) {
        const message = 'Invalid Sec-WebSocket-Extensions header';
        abortHandshake$1(websocket, socket, message);
        return;
      }

      websocket._extensions[PerMessageDeflate$1.extensionName] =
        perMessageDeflate;
    }

    websocket.setSocket(socket, head, {
      generateMask: opts.generateMask,
      maxPayload: opts.maxPayload,
      skipUTF8Validation: opts.skipUTF8Validation
    });
  });
}

/**
 * Emit the `'error'` and `'close'` event.
 *
 * @param {WebSocket} websocket The WebSocket instance
 * @param {Error} The error to emit
 * @private
 */
function emitErrorAndClose(websocket, err) {
  websocket._readyState = WebSocket$1.CLOSING;
  websocket.emit('error', err);
  websocket.emitClose();
}

/**
 * Create a `net.Socket` and initiate a connection.
 *
 * @param {Object} options Connection options
 * @return {net.Socket} The newly created socket used to start the connection
 * @private
 */
function netConnect(options) {
  options.path = options.socketPath;
  return net.connect(options);
}

/**
 * Create a `tls.TLSSocket` and initiate a connection.
 *
 * @param {Object} options Connection options
 * @return {tls.TLSSocket} The newly created socket used to start the connection
 * @private
 */
function tlsConnect(options) {
  options.path = undefined;

  if (!options.servername && options.servername !== '') {
    options.servername = net.isIP(options.host) ? '' : options.host;
  }

  return tls.connect(options);
}

/**
 * Abort the handshake and emit an error.
 *
 * @param {WebSocket} websocket The WebSocket instance
 * @param {(http.ClientRequest|net.Socket|tls.Socket)} stream The request to
 *     abort or the socket to destroy
 * @param {String} message The error message
 * @private
 */
function abortHandshake$1(websocket, stream, message) {
  websocket._readyState = WebSocket$1.CLOSING;

  const err = new Error(message);
  Error.captureStackTrace(err, abortHandshake$1);

  if (stream.setHeader) {
    stream.abort();

    if (stream.socket && !stream.socket.destroyed) {
      //
      // On Node.js >= 14.3.0 `request.abort()` does not destroy the socket if
      // called after the request completed. See
      // https://github.com/websockets/ws/issues/1869.
      //
      stream.socket.destroy();
    }

    stream.once('abort', websocket.emitClose.bind(websocket));
    websocket.emit('error', err);
  } else {
    stream.destroy(err);
    stream.once('error', websocket.emit.bind(websocket, 'error'));
    stream.once('close', websocket.emitClose.bind(websocket));
  }
}

/**
 * Handle cases where the `ping()`, `pong()`, or `send()` methods are called
 * when the `readyState` attribute is `CLOSING` or `CLOSED`.
 *
 * @param {WebSocket} websocket The WebSocket instance
 * @param {*} [data] The data to send
 * @param {Function} [cb] Callback
 * @private
 */
function sendAfterClose(websocket, data, cb) {
  if (data) {
    const length = toBuffer(data).length;

    //
    // The `_bufferedAmount` property is used only when the peer is a client and
    // the opening handshake fails. Under these circumstances, in fact, the
    // `setSocket()` method is not called, so the `_socket` and `_sender`
    // properties are set to `null`.
    //
    if (websocket._socket) websocket._sender._bufferedBytes += length;
    else websocket._bufferedAmount += length;
  }

  if (cb) {
    const err = new Error(
      `WebSocket is not open: readyState ${websocket.readyState} ` +
        `(${readyStates[websocket.readyState]})`
    );
    cb(err);
  }
}

/**
 * The listener of the `Receiver` `'conclude'` event.
 *
 * @param {Number} code The status code
 * @param {Buffer} reason The reason for closing
 * @private
 */
function receiverOnConclude(code, reason) {
  const websocket = this[kWebSocket$1];

  websocket._closeFrameReceived = true;
  websocket._closeMessage = reason;
  websocket._closeCode = code;

  if (websocket._socket[kWebSocket$1] === undefined) return;

  websocket._socket.removeListener('data', socketOnData);
  process.nextTick(resume, websocket._socket);

  if (code === 1005) websocket.close();
  else websocket.close(code, reason);
}

/**
 * The listener of the `Receiver` `'drain'` event.
 *
 * @private
 */
function receiverOnDrain() {
  const websocket = this[kWebSocket$1];

  if (!websocket.isPaused) websocket._socket.resume();
}

/**
 * The listener of the `Receiver` `'error'` event.
 *
 * @param {(RangeError|Error)} err The emitted error
 * @private
 */
function receiverOnError(err) {
  const websocket = this[kWebSocket$1];

  if (websocket._socket[kWebSocket$1] !== undefined) {
    websocket._socket.removeListener('data', socketOnData);

    //
    // On Node.js < 14.0.0 the `'error'` event is emitted synchronously. See
    // https://github.com/websockets/ws/issues/1940.
    //
    process.nextTick(resume, websocket._socket);

    websocket.close(err[kStatusCode]);
  }

  websocket.emit('error', err);
}

/**
 * The listener of the `Receiver` `'finish'` event.
 *
 * @private
 */
function receiverOnFinish() {
  this[kWebSocket$1].emitClose();
}

/**
 * The listener of the `Receiver` `'message'` event.
 *
 * @param {Buffer|ArrayBuffer|Buffer[])} data The message
 * @param {Boolean} isBinary Specifies whether the message is binary or not
 * @private
 */
function receiverOnMessage(data, isBinary) {
  this[kWebSocket$1].emit('message', data, isBinary);
}

/**
 * The listener of the `Receiver` `'ping'` event.
 *
 * @param {Buffer} data The data included in the ping frame
 * @private
 */
function receiverOnPing(data) {
  const websocket = this[kWebSocket$1];

  websocket.pong(data, !websocket._isServer, NOOP);
  websocket.emit('ping', data);
}

/**
 * The listener of the `Receiver` `'pong'` event.
 *
 * @param {Buffer} data The data included in the pong frame
 * @private
 */
function receiverOnPong(data) {
  this[kWebSocket$1].emit('pong', data);
}

/**
 * Resume a readable stream
 *
 * @param {Readable} stream The readable stream
 * @private
 */
function resume(stream) {
  stream.resume();
}

/**
 * The listener of the `net.Socket` `'close'` event.
 *
 * @private
 */
function socketOnClose() {
  const websocket = this[kWebSocket$1];

  this.removeListener('close', socketOnClose);
  this.removeListener('data', socketOnData);
  this.removeListener('end', socketOnEnd);

  websocket._readyState = WebSocket$1.CLOSING;

  let chunk;

  //
  // The close frame might not have been received or the `'end'` event emitted,
  // for example, if the socket was destroyed due to an error. Ensure that the
  // `receiver` stream is closed after writing any remaining buffered data to
  // it. If the readable side of the socket is in flowing mode then there is no
  // buffered data as everything has been already written and `readable.read()`
  // will return `null`. If instead, the socket is paused, any possible buffered
  // data will be read as a single chunk.
  //
  if (
    !this._readableState.endEmitted &&
    !websocket._closeFrameReceived &&
    !websocket._receiver._writableState.errorEmitted &&
    (chunk = websocket._socket.read()) !== null
  ) {
    websocket._receiver.write(chunk);
  }

  websocket._receiver.end();

  this[kWebSocket$1] = undefined;

  clearTimeout(websocket._closeTimer);

  if (
    websocket._receiver._writableState.finished ||
    websocket._receiver._writableState.errorEmitted
  ) {
    websocket.emitClose();
  } else {
    websocket._receiver.on('error', receiverOnFinish);
    websocket._receiver.on('finish', receiverOnFinish);
  }
}

/**
 * The listener of the `net.Socket` `'data'` event.
 *
 * @param {Buffer} chunk A chunk of data
 * @private
 */
function socketOnData(chunk) {
  if (!this[kWebSocket$1]._receiver.write(chunk)) {
    this.pause();
  }
}

/**
 * The listener of the `net.Socket` `'end'` event.
 *
 * @private
 */
function socketOnEnd() {
  const websocket = this[kWebSocket$1];

  websocket._readyState = WebSocket$1.CLOSING;
  websocket._receiver.end();
  this.end();
}

/**
 * The listener of the `net.Socket` `'error'` event.
 *
 * @private
 */
function socketOnError$1() {
  const websocket = this[kWebSocket$1];

  this.removeListener('error', socketOnError$1);
  this.on('error', NOOP);

  if (websocket) {
    websocket._readyState = WebSocket$1.CLOSING;
    this.destroy();
  }
}

const { tokenChars } = validation.exports;

/**
 * Parses the `Sec-WebSocket-Protocol` header into a set of subprotocol names.
 *
 * @param {String} header The field value of the header
 * @return {Set} The subprotocol names
 * @public
 */
function parse(header) {
  const protocols = new Set();
  let start = -1;
  let end = -1;
  let i = 0;

  for (i; i < header.length; i++) {
    const code = header.charCodeAt(i);

    if (end === -1 && tokenChars[code] === 1) {
      if (start === -1) start = i;
    } else if (
      i !== 0 &&
      (code === 0x20 /* ' ' */ || code === 0x09) /* '\t' */
    ) {
      if (end === -1 && start !== -1) end = i;
    } else if (code === 0x2c /* ',' */) {
      if (start === -1) {
        throw new SyntaxError(`Unexpected character at index ${i}`);
      }

      if (end === -1) end = i;

      const protocol = header.slice(start, end);

      if (protocols.has(protocol)) {
        throw new SyntaxError(`The "${protocol}" subprotocol is duplicated`);
      }

      protocols.add(protocol);
      start = end = -1;
    } else {
      throw new SyntaxError(`Unexpected character at index ${i}`);
    }
  }

  if (start === -1 || end !== -1) {
    throw new SyntaxError('Unexpected end of input');
  }

  const protocol = header.slice(start, i);

  if (protocols.has(protocol)) {
    throw new SyntaxError(`The "${protocol}" subprotocol is duplicated`);
  }

  protocols.add(protocol);
  return protocols;
}

var subprotocol$1 = { parse };

/* eslint no-unused-vars: ["error", { "varsIgnorePattern": "^net|tls|https$" }] */

const EventEmitter = require$$2;
const http = require$$2$1;
const { createHash } = require$$5;

const extension = extension$1;
const PerMessageDeflate = permessageDeflate;
const subprotocol = subprotocol$1;
const WebSocket = websocket;
const { GUID, kWebSocket } = constants;

const keyRegex = /^[+/0-9A-Za-z]{22}==$/;

const RUNNING = 0;
const CLOSING = 1;
const CLOSED = 2;

/**
 * Class representing a WebSocket server.
 *
 * @extends EventEmitter
 */
class WebSocketServer extends EventEmitter {
  /**
   * Create a `WebSocketServer` instance.
   *
   * @param {Object} options Configuration options
   * @param {Number} [options.backlog=511] The maximum length of the queue of
   *     pending connections
   * @param {Boolean} [options.clientTracking=true] Specifies whether or not to
   *     track clients
   * @param {Function} [options.handleProtocols] A hook to handle protocols
   * @param {String} [options.host] The hostname where to bind the server
   * @param {Number} [options.maxPayload=104857600] The maximum allowed message
   *     size
   * @param {Boolean} [options.noServer=false] Enable no server mode
   * @param {String} [options.path] Accept only connections matching this path
   * @param {(Boolean|Object)} [options.perMessageDeflate=false] Enable/disable
   *     permessage-deflate
   * @param {Number} [options.port] The port where to bind the server
   * @param {(http.Server|https.Server)} [options.server] A pre-created HTTP/S
   *     server to use
   * @param {Boolean} [options.skipUTF8Validation=false] Specifies whether or
   *     not to skip UTF-8 validation for text and close messages
   * @param {Function} [options.verifyClient] A hook to reject connections
   * @param {Function} [callback] A listener for the `listening` event
   */
  constructor(options, callback) {
    super();

    options = {
      maxPayload: 100 * 1024 * 1024,
      skipUTF8Validation: false,
      perMessageDeflate: false,
      handleProtocols: null,
      clientTracking: true,
      verifyClient: null,
      noServer: false,
      backlog: null, // use default (511 as implemented in net.js)
      server: null,
      host: null,
      path: null,
      port: null,
      ...options
    };

    if (
      (options.port == null && !options.server && !options.noServer) ||
      (options.port != null && (options.server || options.noServer)) ||
      (options.server && options.noServer)
    ) {
      throw new TypeError(
        'One and only one of the "port", "server", or "noServer" options ' +
          'must be specified'
      );
    }

    if (options.port != null) {
      this._server = http.createServer((req, res) => {
        const body = http.STATUS_CODES[426];

        res.writeHead(426, {
          'Content-Length': body.length,
          'Content-Type': 'text/plain'
        });
        res.end(body);
      });
      this._server.listen(
        options.port,
        options.host,
        options.backlog,
        callback
      );
    } else if (options.server) {
      this._server = options.server;
    }

    if (this._server) {
      const emitConnection = this.emit.bind(this, 'connection');

      this._removeListeners = addListeners(this._server, {
        listening: this.emit.bind(this, 'listening'),
        error: this.emit.bind(this, 'error'),
        upgrade: (req, socket, head) => {
          this.handleUpgrade(req, socket, head, emitConnection);
        }
      });
    }

    if (options.perMessageDeflate === true) options.perMessageDeflate = {};
    if (options.clientTracking) {
      this.clients = new Set();
      this._shouldEmitClose = false;
    }

    this.options = options;
    this._state = RUNNING;
  }

  /**
   * Returns the bound address, the address family name, and port of the server
   * as reported by the operating system if listening on an IP socket.
   * If the server is listening on a pipe or UNIX domain socket, the name is
   * returned as a string.
   *
   * @return {(Object|String|null)} The address of the server
   * @public
   */
  address() {
    if (this.options.noServer) {
      throw new Error('The server is operating in "noServer" mode');
    }

    if (!this._server) return null;
    return this._server.address();
  }

  /**
   * Stop the server from accepting new connections and emit the `'close'` event
   * when all existing connections are closed.
   *
   * @param {Function} [cb] A one-time listener for the `'close'` event
   * @public
   */
  close(cb) {
    if (this._state === CLOSED) {
      if (cb) {
        this.once('close', () => {
          cb(new Error('The server is not running'));
        });
      }

      process.nextTick(emitClose, this);
      return;
    }

    if (cb) this.once('close', cb);

    if (this._state === CLOSING) return;
    this._state = CLOSING;

    if (this.options.noServer || this.options.server) {
      if (this._server) {
        this._removeListeners();
        this._removeListeners = this._server = null;
      }

      if (this.clients) {
        if (!this.clients.size) {
          process.nextTick(emitClose, this);
        } else {
          this._shouldEmitClose = true;
        }
      } else {
        process.nextTick(emitClose, this);
      }
    } else {
      const server = this._server;

      this._removeListeners();
      this._removeListeners = this._server = null;

      //
      // The HTTP/S server was created internally. Close it, and rely on its
      // `'close'` event.
      //
      server.close(() => {
        emitClose(this);
      });
    }
  }

  /**
   * See if a given request should be handled by this server instance.
   *
   * @param {http.IncomingMessage} req Request object to inspect
   * @return {Boolean} `true` if the request is valid, else `false`
   * @public
   */
  shouldHandle(req) {
    if (this.options.path) {
      const index = req.url.indexOf('?');
      const pathname = index !== -1 ? req.url.slice(0, index) : req.url;

      if (pathname !== this.options.path) return false;
    }

    return true;
  }

  /**
   * Handle a HTTP Upgrade request.
   *
   * @param {http.IncomingMessage} req The request object
   * @param {(net.Socket|tls.Socket)} socket The network socket between the
   *     server and client
   * @param {Buffer} head The first packet of the upgraded stream
   * @param {Function} cb Callback
   * @public
   */
  handleUpgrade(req, socket, head, cb) {
    socket.on('error', socketOnError);

    const key =
      req.headers['sec-websocket-key'] !== undefined
        ? req.headers['sec-websocket-key']
        : false;
    const version = +req.headers['sec-websocket-version'];

    if (
      req.method !== 'GET' ||
      req.headers.upgrade.toLowerCase() !== 'websocket' ||
      !key ||
      !keyRegex.test(key) ||
      (version !== 8 && version !== 13) ||
      !this.shouldHandle(req)
    ) {
      return abortHandshake(socket, 400);
    }

    const secWebSocketProtocol = req.headers['sec-websocket-protocol'];
    let protocols = new Set();

    if (secWebSocketProtocol !== undefined) {
      try {
        protocols = subprotocol.parse(secWebSocketProtocol);
      } catch (err) {
        return abortHandshake(socket, 400);
      }
    }

    const secWebSocketExtensions = req.headers['sec-websocket-extensions'];
    const extensions = {};

    if (
      this.options.perMessageDeflate &&
      secWebSocketExtensions !== undefined
    ) {
      const perMessageDeflate = new PerMessageDeflate(
        this.options.perMessageDeflate,
        true,
        this.options.maxPayload
      );

      try {
        const offers = extension.parse(secWebSocketExtensions);

        if (offers[PerMessageDeflate.extensionName]) {
          perMessageDeflate.accept(offers[PerMessageDeflate.extensionName]);
          extensions[PerMessageDeflate.extensionName] = perMessageDeflate;
        }
      } catch (err) {
        return abortHandshake(socket, 400);
      }
    }

    //
    // Optionally call external client verification handler.
    //
    if (this.options.verifyClient) {
      const info = {
        origin:
          req.headers[`${version === 8 ? 'sec-websocket-origin' : 'origin'}`],
        secure: !!(req.socket.authorized || req.socket.encrypted),
        req
      };

      if (this.options.verifyClient.length === 2) {
        this.options.verifyClient(info, (verified, code, message, headers) => {
          if (!verified) {
            return abortHandshake(socket, code || 401, message, headers);
          }

          this.completeUpgrade(
            extensions,
            key,
            protocols,
            req,
            socket,
            head,
            cb
          );
        });
        return;
      }

      if (!this.options.verifyClient(info)) return abortHandshake(socket, 401);
    }

    this.completeUpgrade(extensions, key, protocols, req, socket, head, cb);
  }

  /**
   * Upgrade the connection to WebSocket.
   *
   * @param {Object} extensions The accepted extensions
   * @param {String} key The value of the `Sec-WebSocket-Key` header
   * @param {Set} protocols The subprotocols
   * @param {http.IncomingMessage} req The request object
   * @param {(net.Socket|tls.Socket)} socket The network socket between the
   *     server and client
   * @param {Buffer} head The first packet of the upgraded stream
   * @param {Function} cb Callback
   * @throws {Error} If called more than once with the same socket
   * @private
   */
  completeUpgrade(extensions, key, protocols, req, socket, head, cb) {
    //
    // Destroy the socket if the client has already sent a FIN packet.
    //
    if (!socket.readable || !socket.writable) return socket.destroy();

    if (socket[kWebSocket]) {
      throw new Error(
        'server.handleUpgrade() was called more than once with the same ' +
          'socket, possibly due to a misconfiguration'
      );
    }

    if (this._state > RUNNING) return abortHandshake(socket, 503);

    const digest = createHash('sha1')
      .update(key + GUID)
      .digest('base64');

    const headers = [
      'HTTP/1.1 101 Switching Protocols',
      'Upgrade: websocket',
      'Connection: Upgrade',
      `Sec-WebSocket-Accept: ${digest}`
    ];

    const ws = new WebSocket(null);

    if (protocols.size) {
      //
      // Optionally call external protocol selection handler.
      //
      const protocol = this.options.handleProtocols
        ? this.options.handleProtocols(protocols, req)
        : protocols.values().next().value;

      if (protocol) {
        headers.push(`Sec-WebSocket-Protocol: ${protocol}`);
        ws._protocol = protocol;
      }
    }

    if (extensions[PerMessageDeflate.extensionName]) {
      const params = extensions[PerMessageDeflate.extensionName].params;
      const value = extension.format({
        [PerMessageDeflate.extensionName]: [params]
      });
      headers.push(`Sec-WebSocket-Extensions: ${value}`);
      ws._extensions = extensions;
    }

    //
    // Allow external modification/inspection of handshake headers.
    //
    this.emit('headers', headers, req);

    socket.write(headers.concat('\r\n').join('\r\n'));
    socket.removeListener('error', socketOnError);

    ws.setSocket(socket, head, {
      maxPayload: this.options.maxPayload,
      skipUTF8Validation: this.options.skipUTF8Validation
    });

    if (this.clients) {
      this.clients.add(ws);
      ws.on('close', () => {
        this.clients.delete(ws);

        if (this._shouldEmitClose && !this.clients.size) {
          process.nextTick(emitClose, this);
        }
      });
    }

    cb(ws, req);
  }
}

var websocketServer = WebSocketServer;

/**
 * Add event listeners on an `EventEmitter` using a map of <event, listener>
 * pairs.
 *
 * @param {EventEmitter} server The event emitter
 * @param {Object.<String, Function>} map The listeners to add
 * @return {Function} A function that will remove the added listeners when
 *     called
 * @private
 */
function addListeners(server, map) {
  for (const event of Object.keys(map)) server.on(event, map[event]);

  return function removeListeners() {
    for (const event of Object.keys(map)) {
      server.removeListener(event, map[event]);
    }
  };
}

/**
 * Emit a `'close'` event on an `EventEmitter`.
 *
 * @param {EventEmitter} server The event emitter
 * @private
 */
function emitClose(server) {
  server._state = CLOSED;
  server.emit('close');
}

/**
 * Handle premature socket errors.
 *
 * @private
 */
function socketOnError() {
  this.destroy();
}

/**
 * Close the connection when preconditions are not fulfilled.
 *
 * @param {(net.Socket|tls.Socket)} socket The socket of the upgrade request
 * @param {Number} code The HTTP response status code
 * @param {String} [message] The HTTP response body
 * @param {Object} [headers] Additional HTTP response headers
 * @private
 */
function abortHandshake(socket, code, message, headers) {
  if (socket.writable) {
    message = message || http.STATUS_CODES[code];
    headers = {
      Connection: 'close',
      'Content-Type': 'text/html',
      'Content-Length': Buffer.byteLength(message),
      ...headers
    };

    socket.write(
      `HTTP/1.1 ${code} ${http.STATUS_CODES[code]}\r\n` +
        Object.keys(headers)
          .map((h) => `${h}: ${headers[h]}`)
          .join('\r\n') +
        '\r\n\r\n' +
        message
    );
  }

  socket.removeListener('error', socketOnError);
  socket.destroy();
}

function setup(ctx) {
  var _a;
  const wss = new websocketServer({ noServer: true });
  const clients = new Map();
  (_a = ctx.server.httpServer) == null ? void 0 : _a.on("upgrade", (request, socket, head) => {
    if (!request.url)
      return;
    const { pathname } = new URL(request.url, "http://localhost");
    if (pathname !== API_PATH)
      return;
    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit("connection", ws, request);
      setupClient(ws);
    });
  });
  function setupClient(ws) {
    const rpc = createBirpc({
      getFiles() {
        return ctx.state.getFiles();
      },
      readFile(id) {
        return promises.readFile(id, "utf-8");
      },
      writeFile(id, content) {
        return promises.writeFile(id, content, "utf-8");
      },
      async rerun(files) {
        await ctx.rerunFiles(files);
      },
      getConfig() {
        return ctx.config;
      },
      async getTransformResult(id) {
        const result = await ctx.vitenode.transformRequest(id);
        if (result) {
          try {
            result.source = result.source || await promises.readFile(id, "utf-8");
          } catch {
          }
          return result;
        }
      },
      async getModuleGraph(id) {
        const graph = {};
        const externalized = new Set();
        const inlined = new Set();
        function clearId(id2) {
          return (id2 == null ? void 0 : id2.replace(/\?v=\w+$/, "")) || "";
        }
        async function get(mod, seen = new Map()) {
          if (!mod || !mod.id)
            return;
          if (seen.has(mod))
            return seen.get(mod);
          let id2 = clearId(mod.id);
          seen.set(mod, id2);
          const rewrote = await ctx.vitenode.shouldExternalize(id2);
          if (rewrote) {
            id2 = rewrote;
            externalized.add(id2);
            seen.set(mod, id2);
          } else {
            inlined.add(id2);
          }
          const mods = Array.from(mod.importedModules).filter((i) => i.id && !i.id.includes("/vitest/dist/"));
          graph[id2] = (await Promise.all(mods.map((m) => get(m, seen)))).filter(Boolean);
          return id2;
        }
        await get(ctx.server.moduleGraph.getModuleById(id));
        return {
          graph,
          externalized: Array.from(externalized),
          inlined: Array.from(inlined)
        };
      }
    }, {
      post: (msg) => ws.send(msg),
      on: (fn) => ws.on("message", fn),
      eventNames: ["onCollected", "onUserConsoleLog", "onTaskUpdate"],
      serialize: stringify,
      deserialize: parse$3
    });
    clients.set(ws, rpc);
    ws.on("close", () => {
      clients.delete(ws);
    });
  }
  ctx.reporters.push(new WebSocketReporter(ctx, wss, clients));
}
class WebSocketReporter {
  constructor(ctx, wss, clients) {
    this.ctx = ctx;
    this.wss = wss;
    this.clients = clients;
  }
  onCollected(files) {
    if (this.clients.size === 0)
      return;
    this.clients.forEach((client) => {
      var _a;
      (_a = client.onCollected) == null ? void 0 : _a.call(client, files);
    });
  }
  async onTaskUpdate(packs) {
    if (this.clients.size === 0)
      return;
    await Promise.all(packs.map(async (i) => {
      var _a;
      if ((_a = i[1]) == null ? void 0 : _a.error)
        await interpretSourcePos(parseStacktrace(i[1].error), this.ctx);
    }));
    this.clients.forEach((client) => {
      var _a;
      (_a = client.onTaskUpdate) == null ? void 0 : _a.call(client, packs);
    });
  }
  onUserConsoleLog(log) {
    this.clients.forEach((client) => {
      var _a;
      (_a = client.onUserConsoleLog) == null ? void 0 : _a.call(client, log);
    });
  }
}

export { setup };
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2V0dXAtODI2YmMwZmUuanMiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL25vZGVfbW9kdWxlcy8ucG5wbS9mbGF0dGVkQDMuMi40L25vZGVfbW9kdWxlcy9mbGF0dGVkL2VzbS9pbmRleC5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy8ucG5wbS93c0A4LjQuMC9ub2RlX21vZHVsZXMvd3MvbGliL2NvbnN0YW50cy5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy8ucG5wbS93c0A4LjQuMC9ub2RlX21vZHVsZXMvd3MvbGliL2J1ZmZlci11dGlsLmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzLy5wbnBtL3dzQDguNC4wL25vZGVfbW9kdWxlcy93cy9saWIvbGltaXRlci5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy8ucG5wbS93c0A4LjQuMC9ub2RlX21vZHVsZXMvd3MvbGliL3Blcm1lc3NhZ2UtZGVmbGF0ZS5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy8ucG5wbS93c0A4LjQuMC9ub2RlX21vZHVsZXMvd3MvbGliL3ZhbGlkYXRpb24uanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvLnBucG0vd3NAOC40LjAvbm9kZV9tb2R1bGVzL3dzL2xpYi9yZWNlaXZlci5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy8ucG5wbS93c0A4LjQuMC9ub2RlX21vZHVsZXMvd3MvbGliL3NlbmRlci5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy8ucG5wbS93c0A4LjQuMC9ub2RlX21vZHVsZXMvd3MvbGliL2V2ZW50LXRhcmdldC5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy8ucG5wbS93c0A4LjQuMC9ub2RlX21vZHVsZXMvd3MvbGliL2V4dGVuc2lvbi5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy8ucG5wbS93c0A4LjQuMC9ub2RlX21vZHVsZXMvd3MvbGliL3dlYnNvY2tldC5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy8ucG5wbS93c0A4LjQuMC9ub2RlX21vZHVsZXMvd3MvbGliL3N1YnByb3RvY29sLmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzLy5wbnBtL3dzQDguNC4wL25vZGVfbW9kdWxlcy93cy9saWIvd2Vic29ja2V0LXNlcnZlci5qcyIsIi4uL3NyYy9hcGkvc2V0dXAudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLyohIChjKSAyMDIwIEFuZHJlYSBHaWFtbWFyY2hpICovXG5cbmNvbnN0IHtwYXJzZTogJHBhcnNlLCBzdHJpbmdpZnk6ICRzdHJpbmdpZnl9ID0gSlNPTjtcbmNvbnN0IHtrZXlzfSA9IE9iamVjdDtcblxuY29uc3QgUHJpbWl0aXZlID0gU3RyaW5nOyAgIC8vIGl0IGNvdWxkIGJlIE51bWJlclxuY29uc3QgcHJpbWl0aXZlID0gJ3N0cmluZyc7IC8vIGl0IGNvdWxkIGJlICdudW1iZXInXG5cbmNvbnN0IGlnbm9yZSA9IHt9O1xuY29uc3Qgb2JqZWN0ID0gJ29iamVjdCc7XG5cbmNvbnN0IG5vb3AgPSAoXywgdmFsdWUpID0+IHZhbHVlO1xuXG5jb25zdCBwcmltaXRpdmVzID0gdmFsdWUgPT4gKFxuICB2YWx1ZSBpbnN0YW5jZW9mIFByaW1pdGl2ZSA/IFByaW1pdGl2ZSh2YWx1ZSkgOiB2YWx1ZVxuKTtcblxuY29uc3QgUHJpbWl0aXZlcyA9IChfLCB2YWx1ZSkgPT4gKFxuICB0eXBlb2YgdmFsdWUgPT09IHByaW1pdGl2ZSA/IG5ldyBQcmltaXRpdmUodmFsdWUpIDogdmFsdWVcbik7XG5cbmNvbnN0IHJldml2ZSA9IChpbnB1dCwgcGFyc2VkLCBvdXRwdXQsICQpID0+IHtcbiAgY29uc3QgbGF6eSA9IFtdO1xuICBmb3IgKGxldCBrZSA9IGtleXMob3V0cHV0KSwge2xlbmd0aH0gPSBrZSwgeSA9IDA7IHkgPCBsZW5ndGg7IHkrKykge1xuICAgIGNvbnN0IGsgPSBrZVt5XTtcbiAgICBjb25zdCB2YWx1ZSA9IG91dHB1dFtrXTtcbiAgICBpZiAodmFsdWUgaW5zdGFuY2VvZiBQcmltaXRpdmUpIHtcbiAgICAgIGNvbnN0IHRtcCA9IGlucHV0W3ZhbHVlXTtcbiAgICAgIGlmICh0eXBlb2YgdG1wID09PSBvYmplY3QgJiYgIXBhcnNlZC5oYXModG1wKSkge1xuICAgICAgICBwYXJzZWQuYWRkKHRtcCk7XG4gICAgICAgIG91dHB1dFtrXSA9IGlnbm9yZTtcbiAgICAgICAgbGF6eS5wdXNoKHtrLCBhOiBbaW5wdXQsIHBhcnNlZCwgdG1wLCAkXX0pO1xuICAgICAgfVxuICAgICAgZWxzZVxuICAgICAgICBvdXRwdXRba10gPSAkLmNhbGwob3V0cHV0LCBrLCB0bXApO1xuICAgIH1cbiAgICBlbHNlIGlmIChvdXRwdXRba10gIT09IGlnbm9yZSlcbiAgICAgIG91dHB1dFtrXSA9ICQuY2FsbChvdXRwdXQsIGssIHZhbHVlKTtcbiAgfVxuICBmb3IgKGxldCB7bGVuZ3RofSA9IGxhenksIGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICBjb25zdCB7aywgYX0gPSBsYXp5W2ldO1xuICAgIG91dHB1dFtrXSA9ICQuY2FsbChvdXRwdXQsIGssIHJldml2ZS5hcHBseShudWxsLCBhKSk7XG4gIH1cbiAgcmV0dXJuIG91dHB1dDtcbn07XG5cbmNvbnN0IHNldCA9IChrbm93biwgaW5wdXQsIHZhbHVlKSA9PiB7XG4gIGNvbnN0IGluZGV4ID0gUHJpbWl0aXZlKGlucHV0LnB1c2godmFsdWUpIC0gMSk7XG4gIGtub3duLnNldCh2YWx1ZSwgaW5kZXgpO1xuICByZXR1cm4gaW5kZXg7XG59O1xuXG5leHBvcnQgY29uc3QgcGFyc2UgPSAodGV4dCwgcmV2aXZlcikgPT4ge1xuICBjb25zdCBpbnB1dCA9ICRwYXJzZSh0ZXh0LCBQcmltaXRpdmVzKS5tYXAocHJpbWl0aXZlcyk7XG4gIGNvbnN0IHZhbHVlID0gaW5wdXRbMF07XG4gIGNvbnN0ICQgPSByZXZpdmVyIHx8IG5vb3A7XG4gIGNvbnN0IHRtcCA9IHR5cGVvZiB2YWx1ZSA9PT0gb2JqZWN0ICYmIHZhbHVlID9cbiAgICAgICAgICAgICAgcmV2aXZlKGlucHV0LCBuZXcgU2V0LCB2YWx1ZSwgJCkgOlxuICAgICAgICAgICAgICB2YWx1ZTtcbiAgcmV0dXJuICQuY2FsbCh7Jyc6IHRtcH0sICcnLCB0bXApO1xufTtcblxuZXhwb3J0IGNvbnN0IHN0cmluZ2lmeSA9ICh2YWx1ZSwgcmVwbGFjZXIsIHNwYWNlKSA9PiB7XG4gIGNvbnN0ICQgPSByZXBsYWNlciAmJiB0eXBlb2YgcmVwbGFjZXIgPT09IG9iamVjdCA/XG4gICAgICAgICAgICAoaywgdikgPT4gKGsgPT09ICcnIHx8IC0xIDwgcmVwbGFjZXIuaW5kZXhPZihrKSA/IHYgOiB2b2lkIDApIDpcbiAgICAgICAgICAgIChyZXBsYWNlciB8fCBub29wKTtcbiAgY29uc3Qga25vd24gPSBuZXcgTWFwO1xuICBjb25zdCBpbnB1dCA9IFtdO1xuICBjb25zdCBvdXRwdXQgPSBbXTtcbiAgbGV0IGkgPSArc2V0KGtub3duLCBpbnB1dCwgJC5jYWxsKHsnJzogdmFsdWV9LCAnJywgdmFsdWUpKTtcbiAgbGV0IGZpcnN0UnVuID0gIWk7XG4gIHdoaWxlIChpIDwgaW5wdXQubGVuZ3RoKSB7XG4gICAgZmlyc3RSdW4gPSB0cnVlO1xuICAgIG91dHB1dFtpXSA9ICRzdHJpbmdpZnkoaW5wdXRbaSsrXSwgcmVwbGFjZSwgc3BhY2UpO1xuICB9XG4gIHJldHVybiAnWycgKyBvdXRwdXQuam9pbignLCcpICsgJ10nO1xuICBmdW5jdGlvbiByZXBsYWNlKGtleSwgdmFsdWUpIHtcbiAgICBpZiAoZmlyc3RSdW4pIHtcbiAgICAgIGZpcnN0UnVuID0gIWZpcnN0UnVuO1xuICAgICAgcmV0dXJuIHZhbHVlO1xuICAgIH1cbiAgICBjb25zdCBhZnRlciA9ICQuY2FsbCh0aGlzLCBrZXksIHZhbHVlKTtcbiAgICBzd2l0Y2ggKHR5cGVvZiBhZnRlcikge1xuICAgICAgY2FzZSBvYmplY3Q6XG4gICAgICAgIGlmIChhZnRlciA9PT0gbnVsbCkgcmV0dXJuIGFmdGVyO1xuICAgICAgY2FzZSBwcmltaXRpdmU6XG4gICAgICAgIHJldHVybiBrbm93bi5nZXQoYWZ0ZXIpIHx8IHNldChrbm93biwgaW5wdXQsIGFmdGVyKTtcbiAgICB9XG4gICAgcmV0dXJuIGFmdGVyO1xuICB9XG59O1xuXG5leHBvcnQgY29uc3QgdG9KU09OID0gYW55ID0+ICRwYXJzZShzdHJpbmdpZnkoYW55KSk7XG5leHBvcnQgY29uc3QgZnJvbUpTT04gPSBhbnkgPT4gcGFyc2UoJHN0cmluZ2lmeShhbnkpKTtcbiIsIid1c2Ugc3RyaWN0JztcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIEJJTkFSWV9UWVBFUzogWydub2RlYnVmZmVyJywgJ2FycmF5YnVmZmVyJywgJ2ZyYWdtZW50cyddLFxuICBFTVBUWV9CVUZGRVI6IEJ1ZmZlci5hbGxvYygwKSxcbiAgR1VJRDogJzI1OEVBRkE1LUU5MTQtNDdEQS05NUNBLUM1QUIwREM4NUIxMScsXG4gIGtGb3JPbkV2ZW50QXR0cmlidXRlOiBTeW1ib2woJ2tJc0Zvck9uRXZlbnRBdHRyaWJ1dGUnKSxcbiAga0xpc3RlbmVyOiBTeW1ib2woJ2tMaXN0ZW5lcicpLFxuICBrU3RhdHVzQ29kZTogU3ltYm9sKCdzdGF0dXMtY29kZScpLFxuICBrV2ViU29ja2V0OiBTeW1ib2woJ3dlYnNvY2tldCcpLFxuICBOT09QOiAoKSA9PiB7fVxufTtcbiIsIid1c2Ugc3RyaWN0JztcblxuY29uc3QgeyBFTVBUWV9CVUZGRVIgfSA9IHJlcXVpcmUoJy4vY29uc3RhbnRzJyk7XG5cbi8qKlxuICogTWVyZ2VzIGFuIGFycmF5IG9mIGJ1ZmZlcnMgaW50byBhIG5ldyBidWZmZXIuXG4gKlxuICogQHBhcmFtIHtCdWZmZXJbXX0gbGlzdCBUaGUgYXJyYXkgb2YgYnVmZmVycyB0byBjb25jYXRcbiAqIEBwYXJhbSB7TnVtYmVyfSB0b3RhbExlbmd0aCBUaGUgdG90YWwgbGVuZ3RoIG9mIGJ1ZmZlcnMgaW4gdGhlIGxpc3RcbiAqIEByZXR1cm4ge0J1ZmZlcn0gVGhlIHJlc3VsdGluZyBidWZmZXJcbiAqIEBwdWJsaWNcbiAqL1xuZnVuY3Rpb24gY29uY2F0KGxpc3QsIHRvdGFsTGVuZ3RoKSB7XG4gIGlmIChsaXN0Lmxlbmd0aCA9PT0gMCkgcmV0dXJuIEVNUFRZX0JVRkZFUjtcbiAgaWYgKGxpc3QubGVuZ3RoID09PSAxKSByZXR1cm4gbGlzdFswXTtcblxuICBjb25zdCB0YXJnZXQgPSBCdWZmZXIuYWxsb2NVbnNhZmUodG90YWxMZW5ndGgpO1xuICBsZXQgb2Zmc2V0ID0gMDtcblxuICBmb3IgKGxldCBpID0gMDsgaSA8IGxpc3QubGVuZ3RoOyBpKyspIHtcbiAgICBjb25zdCBidWYgPSBsaXN0W2ldO1xuICAgIHRhcmdldC5zZXQoYnVmLCBvZmZzZXQpO1xuICAgIG9mZnNldCArPSBidWYubGVuZ3RoO1xuICB9XG5cbiAgaWYgKG9mZnNldCA8IHRvdGFsTGVuZ3RoKSByZXR1cm4gdGFyZ2V0LnNsaWNlKDAsIG9mZnNldCk7XG5cbiAgcmV0dXJuIHRhcmdldDtcbn1cblxuLyoqXG4gKiBNYXNrcyBhIGJ1ZmZlciB1c2luZyB0aGUgZ2l2ZW4gbWFzay5cbiAqXG4gKiBAcGFyYW0ge0J1ZmZlcn0gc291cmNlIFRoZSBidWZmZXIgdG8gbWFza1xuICogQHBhcmFtIHtCdWZmZXJ9IG1hc2sgVGhlIG1hc2sgdG8gdXNlXG4gKiBAcGFyYW0ge0J1ZmZlcn0gb3V0cHV0IFRoZSBidWZmZXIgd2hlcmUgdG8gc3RvcmUgdGhlIHJlc3VsdFxuICogQHBhcmFtIHtOdW1iZXJ9IG9mZnNldCBUaGUgb2Zmc2V0IGF0IHdoaWNoIHRvIHN0YXJ0IHdyaXRpbmdcbiAqIEBwYXJhbSB7TnVtYmVyfSBsZW5ndGggVGhlIG51bWJlciBvZiBieXRlcyB0byBtYXNrLlxuICogQHB1YmxpY1xuICovXG5mdW5jdGlvbiBfbWFzayhzb3VyY2UsIG1hc2ssIG91dHB1dCwgb2Zmc2V0LCBsZW5ndGgpIHtcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgIG91dHB1dFtvZmZzZXQgKyBpXSA9IHNvdXJjZVtpXSBeIG1hc2tbaSAmIDNdO1xuICB9XG59XG5cbi8qKlxuICogVW5tYXNrcyBhIGJ1ZmZlciB1c2luZyB0aGUgZ2l2ZW4gbWFzay5cbiAqXG4gKiBAcGFyYW0ge0J1ZmZlcn0gYnVmZmVyIFRoZSBidWZmZXIgdG8gdW5tYXNrXG4gKiBAcGFyYW0ge0J1ZmZlcn0gbWFzayBUaGUgbWFzayB0byB1c2VcbiAqIEBwdWJsaWNcbiAqL1xuZnVuY3Rpb24gX3VubWFzayhidWZmZXIsIG1hc2spIHtcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBidWZmZXIubGVuZ3RoOyBpKyspIHtcbiAgICBidWZmZXJbaV0gXj0gbWFza1tpICYgM107XG4gIH1cbn1cblxuLyoqXG4gKiBDb252ZXJ0cyBhIGJ1ZmZlciB0byBhbiBgQXJyYXlCdWZmZXJgLlxuICpcbiAqIEBwYXJhbSB7QnVmZmVyfSBidWYgVGhlIGJ1ZmZlciB0byBjb252ZXJ0XG4gKiBAcmV0dXJuIHtBcnJheUJ1ZmZlcn0gQ29udmVydGVkIGJ1ZmZlclxuICogQHB1YmxpY1xuICovXG5mdW5jdGlvbiB0b0FycmF5QnVmZmVyKGJ1Zikge1xuICBpZiAoYnVmLmJ5dGVMZW5ndGggPT09IGJ1Zi5idWZmZXIuYnl0ZUxlbmd0aCkge1xuICAgIHJldHVybiBidWYuYnVmZmVyO1xuICB9XG5cbiAgcmV0dXJuIGJ1Zi5idWZmZXIuc2xpY2UoYnVmLmJ5dGVPZmZzZXQsIGJ1Zi5ieXRlT2Zmc2V0ICsgYnVmLmJ5dGVMZW5ndGgpO1xufVxuXG4vKipcbiAqIENvbnZlcnRzIGBkYXRhYCB0byBhIGBCdWZmZXJgLlxuICpcbiAqIEBwYXJhbSB7Kn0gZGF0YSBUaGUgZGF0YSB0byBjb252ZXJ0XG4gKiBAcmV0dXJuIHtCdWZmZXJ9IFRoZSBidWZmZXJcbiAqIEB0aHJvd3Mge1R5cGVFcnJvcn1cbiAqIEBwdWJsaWNcbiAqL1xuZnVuY3Rpb24gdG9CdWZmZXIoZGF0YSkge1xuICB0b0J1ZmZlci5yZWFkT25seSA9IHRydWU7XG5cbiAgaWYgKEJ1ZmZlci5pc0J1ZmZlcihkYXRhKSkgcmV0dXJuIGRhdGE7XG5cbiAgbGV0IGJ1ZjtcblxuICBpZiAoZGF0YSBpbnN0YW5jZW9mIEFycmF5QnVmZmVyKSB7XG4gICAgYnVmID0gQnVmZmVyLmZyb20oZGF0YSk7XG4gIH0gZWxzZSBpZiAoQXJyYXlCdWZmZXIuaXNWaWV3KGRhdGEpKSB7XG4gICAgYnVmID0gQnVmZmVyLmZyb20oZGF0YS5idWZmZXIsIGRhdGEuYnl0ZU9mZnNldCwgZGF0YS5ieXRlTGVuZ3RoKTtcbiAgfSBlbHNlIHtcbiAgICBidWYgPSBCdWZmZXIuZnJvbShkYXRhKTtcbiAgICB0b0J1ZmZlci5yZWFkT25seSA9IGZhbHNlO1xuICB9XG5cbiAgcmV0dXJuIGJ1Zjtcbn1cblxudHJ5IHtcbiAgY29uc3QgYnVmZmVyVXRpbCA9IHJlcXVpcmUoJ2J1ZmZlcnV0aWwnKTtcblxuICBtb2R1bGUuZXhwb3J0cyA9IHtcbiAgICBjb25jYXQsXG4gICAgbWFzayhzb3VyY2UsIG1hc2ssIG91dHB1dCwgb2Zmc2V0LCBsZW5ndGgpIHtcbiAgICAgIGlmIChsZW5ndGggPCA0OCkgX21hc2soc291cmNlLCBtYXNrLCBvdXRwdXQsIG9mZnNldCwgbGVuZ3RoKTtcbiAgICAgIGVsc2UgYnVmZmVyVXRpbC5tYXNrKHNvdXJjZSwgbWFzaywgb3V0cHV0LCBvZmZzZXQsIGxlbmd0aCk7XG4gICAgfSxcbiAgICB0b0FycmF5QnVmZmVyLFxuICAgIHRvQnVmZmVyLFxuICAgIHVubWFzayhidWZmZXIsIG1hc2spIHtcbiAgICAgIGlmIChidWZmZXIubGVuZ3RoIDwgMzIpIF91bm1hc2soYnVmZmVyLCBtYXNrKTtcbiAgICAgIGVsc2UgYnVmZmVyVXRpbC51bm1hc2soYnVmZmVyLCBtYXNrKTtcbiAgICB9XG4gIH07XG59IGNhdGNoIChlKSAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqLyB7XG4gIG1vZHVsZS5leHBvcnRzID0ge1xuICAgIGNvbmNhdCxcbiAgICBtYXNrOiBfbWFzayxcbiAgICB0b0FycmF5QnVmZmVyLFxuICAgIHRvQnVmZmVyLFxuICAgIHVubWFzazogX3VubWFza1xuICB9O1xufVxuIiwiJ3VzZSBzdHJpY3QnO1xuXG5jb25zdCBrRG9uZSA9IFN5bWJvbCgna0RvbmUnKTtcbmNvbnN0IGtSdW4gPSBTeW1ib2woJ2tSdW4nKTtcblxuLyoqXG4gKiBBIHZlcnkgc2ltcGxlIGpvYiBxdWV1ZSB3aXRoIGFkanVzdGFibGUgY29uY3VycmVuY3kuIEFkYXB0ZWQgZnJvbVxuICogaHR0cHM6Ly9naXRodWIuY29tL1NUUk1ML2FzeW5jLWxpbWl0ZXJcbiAqL1xuY2xhc3MgTGltaXRlciB7XG4gIC8qKlxuICAgKiBDcmVhdGVzIGEgbmV3IGBMaW1pdGVyYC5cbiAgICpcbiAgICogQHBhcmFtIHtOdW1iZXJ9IFtjb25jdXJyZW5jeT1JbmZpbml0eV0gVGhlIG1heGltdW0gbnVtYmVyIG9mIGpvYnMgYWxsb3dlZFxuICAgKiAgICAgdG8gcnVuIGNvbmN1cnJlbnRseVxuICAgKi9cbiAgY29uc3RydWN0b3IoY29uY3VycmVuY3kpIHtcbiAgICB0aGlzW2tEb25lXSA9ICgpID0+IHtcbiAgICAgIHRoaXMucGVuZGluZy0tO1xuICAgICAgdGhpc1trUnVuXSgpO1xuICAgIH07XG4gICAgdGhpcy5jb25jdXJyZW5jeSA9IGNvbmN1cnJlbmN5IHx8IEluZmluaXR5O1xuICAgIHRoaXMuam9icyA9IFtdO1xuICAgIHRoaXMucGVuZGluZyA9IDA7XG4gIH1cblxuICAvKipcbiAgICogQWRkcyBhIGpvYiB0byB0aGUgcXVldWUuXG4gICAqXG4gICAqIEBwYXJhbSB7RnVuY3Rpb259IGpvYiBUaGUgam9iIHRvIHJ1blxuICAgKiBAcHVibGljXG4gICAqL1xuICBhZGQoam9iKSB7XG4gICAgdGhpcy5qb2JzLnB1c2goam9iKTtcbiAgICB0aGlzW2tSdW5dKCk7XG4gIH1cblxuICAvKipcbiAgICogUmVtb3ZlcyBhIGpvYiBmcm9tIHRoZSBxdWV1ZSBhbmQgcnVucyBpdCBpZiBwb3NzaWJsZS5cbiAgICpcbiAgICogQHByaXZhdGVcbiAgICovXG4gIFtrUnVuXSgpIHtcbiAgICBpZiAodGhpcy5wZW5kaW5nID09PSB0aGlzLmNvbmN1cnJlbmN5KSByZXR1cm47XG5cbiAgICBpZiAodGhpcy5qb2JzLmxlbmd0aCkge1xuICAgICAgY29uc3Qgam9iID0gdGhpcy5qb2JzLnNoaWZ0KCk7XG5cbiAgICAgIHRoaXMucGVuZGluZysrO1xuICAgICAgam9iKHRoaXNba0RvbmVdKTtcbiAgICB9XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBMaW1pdGVyO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5jb25zdCB6bGliID0gcmVxdWlyZSgnemxpYicpO1xuXG5jb25zdCBidWZmZXJVdGlsID0gcmVxdWlyZSgnLi9idWZmZXItdXRpbCcpO1xuY29uc3QgTGltaXRlciA9IHJlcXVpcmUoJy4vbGltaXRlcicpO1xuY29uc3QgeyBrU3RhdHVzQ29kZSB9ID0gcmVxdWlyZSgnLi9jb25zdGFudHMnKTtcblxuY29uc3QgVFJBSUxFUiA9IEJ1ZmZlci5mcm9tKFsweDAwLCAweDAwLCAweGZmLCAweGZmXSk7XG5jb25zdCBrUGVyTWVzc2FnZURlZmxhdGUgPSBTeW1ib2woJ3Blcm1lc3NhZ2UtZGVmbGF0ZScpO1xuY29uc3Qga1RvdGFsTGVuZ3RoID0gU3ltYm9sKCd0b3RhbC1sZW5ndGgnKTtcbmNvbnN0IGtDYWxsYmFjayA9IFN5bWJvbCgnY2FsbGJhY2snKTtcbmNvbnN0IGtCdWZmZXJzID0gU3ltYm9sKCdidWZmZXJzJyk7XG5jb25zdCBrRXJyb3IgPSBTeW1ib2woJ2Vycm9yJyk7XG5cbi8vXG4vLyBXZSBsaW1pdCB6bGliIGNvbmN1cnJlbmN5LCB3aGljaCBwcmV2ZW50cyBzZXZlcmUgbWVtb3J5IGZyYWdtZW50YXRpb25cbi8vIGFzIGRvY3VtZW50ZWQgaW4gaHR0cHM6Ly9naXRodWIuY29tL25vZGVqcy9ub2RlL2lzc3Vlcy84ODcxI2lzc3VlY29tbWVudC0yNTA5MTU5MTNcbi8vIGFuZCBodHRwczovL2dpdGh1Yi5jb20vd2Vic29ja2V0cy93cy9pc3N1ZXMvMTIwMlxuLy9cbi8vIEludGVudGlvbmFsbHkgZ2xvYmFsOyBpdCdzIHRoZSBnbG9iYWwgdGhyZWFkIHBvb2wgdGhhdCdzIGFuIGlzc3VlLlxuLy9cbmxldCB6bGliTGltaXRlcjtcblxuLyoqXG4gKiBwZXJtZXNzYWdlLWRlZmxhdGUgaW1wbGVtZW50YXRpb24uXG4gKi9cbmNsYXNzIFBlck1lc3NhZ2VEZWZsYXRlIHtcbiAgLyoqXG4gICAqIENyZWF0ZXMgYSBQZXJNZXNzYWdlRGVmbGF0ZSBpbnN0YW5jZS5cbiAgICpcbiAgICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zXSBDb25maWd1cmF0aW9uIG9wdGlvbnNcbiAgICogQHBhcmFtIHsoQm9vbGVhbnxOdW1iZXIpfSBbb3B0aW9ucy5jbGllbnRNYXhXaW5kb3dCaXRzXSBBZHZlcnRpc2Ugc3VwcG9ydFxuICAgKiAgICAgZm9yLCBvciByZXF1ZXN0LCBhIGN1c3RvbSBjbGllbnQgd2luZG93IHNpemVcbiAgICogQHBhcmFtIHtCb29sZWFufSBbb3B0aW9ucy5jbGllbnROb0NvbnRleHRUYWtlb3Zlcj1mYWxzZV0gQWR2ZXJ0aXNlL1xuICAgKiAgICAgYWNrbm93bGVkZ2UgZGlzYWJsaW5nIG9mIGNsaWVudCBjb250ZXh0IHRha2VvdmVyXG4gICAqIEBwYXJhbSB7TnVtYmVyfSBbb3B0aW9ucy5jb25jdXJyZW5jeUxpbWl0PTEwXSBUaGUgbnVtYmVyIG9mIGNvbmN1cnJlbnRcbiAgICogICAgIGNhbGxzIHRvIHpsaWJcbiAgICogQHBhcmFtIHsoQm9vbGVhbnxOdW1iZXIpfSBbb3B0aW9ucy5zZXJ2ZXJNYXhXaW5kb3dCaXRzXSBSZXF1ZXN0L2NvbmZpcm0gdGhlXG4gICAqICAgICB1c2Ugb2YgYSBjdXN0b20gc2VydmVyIHdpbmRvdyBzaXplXG4gICAqIEBwYXJhbSB7Qm9vbGVhbn0gW29wdGlvbnMuc2VydmVyTm9Db250ZXh0VGFrZW92ZXI9ZmFsc2VdIFJlcXVlc3QvYWNjZXB0XG4gICAqICAgICBkaXNhYmxpbmcgb2Ygc2VydmVyIGNvbnRleHQgdGFrZW92ZXJcbiAgICogQHBhcmFtIHtOdW1iZXJ9IFtvcHRpb25zLnRocmVzaG9sZD0xMDI0XSBTaXplIChpbiBieXRlcykgYmVsb3cgd2hpY2hcbiAgICogICAgIG1lc3NhZ2VzIHNob3VsZCBub3QgYmUgY29tcHJlc3NlZCBpZiBjb250ZXh0IHRha2VvdmVyIGlzIGRpc2FibGVkXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9ucy56bGliRGVmbGF0ZU9wdGlvbnNdIE9wdGlvbnMgdG8gcGFzcyB0byB6bGliIG9uXG4gICAqICAgICBkZWZsYXRlXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9ucy56bGliSW5mbGF0ZU9wdGlvbnNdIE9wdGlvbnMgdG8gcGFzcyB0byB6bGliIG9uXG4gICAqICAgICBpbmZsYXRlXG4gICAqIEBwYXJhbSB7Qm9vbGVhbn0gW2lzU2VydmVyPWZhbHNlXSBDcmVhdGUgdGhlIGluc3RhbmNlIGluIGVpdGhlciBzZXJ2ZXIgb3JcbiAgICogICAgIGNsaWVudCBtb2RlXG4gICAqIEBwYXJhbSB7TnVtYmVyfSBbbWF4UGF5bG9hZD0wXSBUaGUgbWF4aW11bSBhbGxvd2VkIG1lc3NhZ2UgbGVuZ3RoXG4gICAqL1xuICBjb25zdHJ1Y3RvcihvcHRpb25zLCBpc1NlcnZlciwgbWF4UGF5bG9hZCkge1xuICAgIHRoaXMuX21heFBheWxvYWQgPSBtYXhQYXlsb2FkIHwgMDtcbiAgICB0aGlzLl9vcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcbiAgICB0aGlzLl90aHJlc2hvbGQgPVxuICAgICAgdGhpcy5fb3B0aW9ucy50aHJlc2hvbGQgIT09IHVuZGVmaW5lZCA/IHRoaXMuX29wdGlvbnMudGhyZXNob2xkIDogMTAyNDtcbiAgICB0aGlzLl9pc1NlcnZlciA9ICEhaXNTZXJ2ZXI7XG4gICAgdGhpcy5fZGVmbGF0ZSA9IG51bGw7XG4gICAgdGhpcy5faW5mbGF0ZSA9IG51bGw7XG5cbiAgICB0aGlzLnBhcmFtcyA9IG51bGw7XG5cbiAgICBpZiAoIXpsaWJMaW1pdGVyKSB7XG4gICAgICBjb25zdCBjb25jdXJyZW5jeSA9XG4gICAgICAgIHRoaXMuX29wdGlvbnMuY29uY3VycmVuY3lMaW1pdCAhPT0gdW5kZWZpbmVkXG4gICAgICAgICAgPyB0aGlzLl9vcHRpb25zLmNvbmN1cnJlbmN5TGltaXRcbiAgICAgICAgICA6IDEwO1xuICAgICAgemxpYkxpbWl0ZXIgPSBuZXcgTGltaXRlcihjb25jdXJyZW5jeSk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEB0eXBlIHtTdHJpbmd9XG4gICAqL1xuICBzdGF0aWMgZ2V0IGV4dGVuc2lvbk5hbWUoKSB7XG4gICAgcmV0dXJuICdwZXJtZXNzYWdlLWRlZmxhdGUnO1xuICB9XG5cbiAgLyoqXG4gICAqIENyZWF0ZSBhbiBleHRlbnNpb24gbmVnb3RpYXRpb24gb2ZmZXIuXG4gICAqXG4gICAqIEByZXR1cm4ge09iamVjdH0gRXh0ZW5zaW9uIHBhcmFtZXRlcnNcbiAgICogQHB1YmxpY1xuICAgKi9cbiAgb2ZmZXIoKSB7XG4gICAgY29uc3QgcGFyYW1zID0ge307XG5cbiAgICBpZiAodGhpcy5fb3B0aW9ucy5zZXJ2ZXJOb0NvbnRleHRUYWtlb3Zlcikge1xuICAgICAgcGFyYW1zLnNlcnZlcl9ub19jb250ZXh0X3Rha2VvdmVyID0gdHJ1ZTtcbiAgICB9XG4gICAgaWYgKHRoaXMuX29wdGlvbnMuY2xpZW50Tm9Db250ZXh0VGFrZW92ZXIpIHtcbiAgICAgIHBhcmFtcy5jbGllbnRfbm9fY29udGV4dF90YWtlb3ZlciA9IHRydWU7XG4gICAgfVxuICAgIGlmICh0aGlzLl9vcHRpb25zLnNlcnZlck1heFdpbmRvd0JpdHMpIHtcbiAgICAgIHBhcmFtcy5zZXJ2ZXJfbWF4X3dpbmRvd19iaXRzID0gdGhpcy5fb3B0aW9ucy5zZXJ2ZXJNYXhXaW5kb3dCaXRzO1xuICAgIH1cbiAgICBpZiAodGhpcy5fb3B0aW9ucy5jbGllbnRNYXhXaW5kb3dCaXRzKSB7XG4gICAgICBwYXJhbXMuY2xpZW50X21heF93aW5kb3dfYml0cyA9IHRoaXMuX29wdGlvbnMuY2xpZW50TWF4V2luZG93Qml0cztcbiAgICB9IGVsc2UgaWYgKHRoaXMuX29wdGlvbnMuY2xpZW50TWF4V2luZG93Qml0cyA9PSBudWxsKSB7XG4gICAgICBwYXJhbXMuY2xpZW50X21heF93aW5kb3dfYml0cyA9IHRydWU7XG4gICAgfVxuXG4gICAgcmV0dXJuIHBhcmFtcztcbiAgfVxuXG4gIC8qKlxuICAgKiBBY2NlcHQgYW4gZXh0ZW5zaW9uIG5lZ290aWF0aW9uIG9mZmVyL3Jlc3BvbnNlLlxuICAgKlxuICAgKiBAcGFyYW0ge0FycmF5fSBjb25maWd1cmF0aW9ucyBUaGUgZXh0ZW5zaW9uIG5lZ290aWF0aW9uIG9mZmVycy9yZXBvbnNlXG4gICAqIEByZXR1cm4ge09iamVjdH0gQWNjZXB0ZWQgY29uZmlndXJhdGlvblxuICAgKiBAcHVibGljXG4gICAqL1xuICBhY2NlcHQoY29uZmlndXJhdGlvbnMpIHtcbiAgICBjb25maWd1cmF0aW9ucyA9IHRoaXMubm9ybWFsaXplUGFyYW1zKGNvbmZpZ3VyYXRpb25zKTtcblxuICAgIHRoaXMucGFyYW1zID0gdGhpcy5faXNTZXJ2ZXJcbiAgICAgID8gdGhpcy5hY2NlcHRBc1NlcnZlcihjb25maWd1cmF0aW9ucylcbiAgICAgIDogdGhpcy5hY2NlcHRBc0NsaWVudChjb25maWd1cmF0aW9ucyk7XG5cbiAgICByZXR1cm4gdGhpcy5wYXJhbXM7XG4gIH1cblxuICAvKipcbiAgICogUmVsZWFzZXMgYWxsIHJlc291cmNlcyB1c2VkIGJ5IHRoZSBleHRlbnNpb24uXG4gICAqXG4gICAqIEBwdWJsaWNcbiAgICovXG4gIGNsZWFudXAoKSB7XG4gICAgaWYgKHRoaXMuX2luZmxhdGUpIHtcbiAgICAgIHRoaXMuX2luZmxhdGUuY2xvc2UoKTtcbiAgICAgIHRoaXMuX2luZmxhdGUgPSBudWxsO1xuICAgIH1cblxuICAgIGlmICh0aGlzLl9kZWZsYXRlKSB7XG4gICAgICBjb25zdCBjYWxsYmFjayA9IHRoaXMuX2RlZmxhdGVba0NhbGxiYWNrXTtcblxuICAgICAgdGhpcy5fZGVmbGF0ZS5jbG9zZSgpO1xuICAgICAgdGhpcy5fZGVmbGF0ZSA9IG51bGw7XG5cbiAgICAgIGlmIChjYWxsYmFjaykge1xuICAgICAgICBjYWxsYmFjayhcbiAgICAgICAgICBuZXcgRXJyb3IoXG4gICAgICAgICAgICAnVGhlIGRlZmxhdGUgc3RyZWFtIHdhcyBjbG9zZWQgd2hpbGUgZGF0YSB3YXMgYmVpbmcgcHJvY2Vzc2VkJ1xuICAgICAgICAgIClcbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogIEFjY2VwdCBhbiBleHRlbnNpb24gbmVnb3RpYXRpb24gb2ZmZXIuXG4gICAqXG4gICAqIEBwYXJhbSB7QXJyYXl9IG9mZmVycyBUaGUgZXh0ZW5zaW9uIG5lZ290aWF0aW9uIG9mZmVyc1xuICAgKiBAcmV0dXJuIHtPYmplY3R9IEFjY2VwdGVkIGNvbmZpZ3VyYXRpb25cbiAgICogQHByaXZhdGVcbiAgICovXG4gIGFjY2VwdEFzU2VydmVyKG9mZmVycykge1xuICAgIGNvbnN0IG9wdHMgPSB0aGlzLl9vcHRpb25zO1xuICAgIGNvbnN0IGFjY2VwdGVkID0gb2ZmZXJzLmZpbmQoKHBhcmFtcykgPT4ge1xuICAgICAgaWYgKFxuICAgICAgICAob3B0cy5zZXJ2ZXJOb0NvbnRleHRUYWtlb3ZlciA9PT0gZmFsc2UgJiZcbiAgICAgICAgICBwYXJhbXMuc2VydmVyX25vX2NvbnRleHRfdGFrZW92ZXIpIHx8XG4gICAgICAgIChwYXJhbXMuc2VydmVyX21heF93aW5kb3dfYml0cyAmJlxuICAgICAgICAgIChvcHRzLnNlcnZlck1heFdpbmRvd0JpdHMgPT09IGZhbHNlIHx8XG4gICAgICAgICAgICAodHlwZW9mIG9wdHMuc2VydmVyTWF4V2luZG93Qml0cyA9PT0gJ251bWJlcicgJiZcbiAgICAgICAgICAgICAgb3B0cy5zZXJ2ZXJNYXhXaW5kb3dCaXRzID4gcGFyYW1zLnNlcnZlcl9tYXhfd2luZG93X2JpdHMpKSkgfHxcbiAgICAgICAgKHR5cGVvZiBvcHRzLmNsaWVudE1heFdpbmRvd0JpdHMgPT09ICdudW1iZXInICYmXG4gICAgICAgICAgIXBhcmFtcy5jbGllbnRfbWF4X3dpbmRvd19iaXRzKVxuICAgICAgKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfSk7XG5cbiAgICBpZiAoIWFjY2VwdGVkKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ05vbmUgb2YgdGhlIGV4dGVuc2lvbiBvZmZlcnMgY2FuIGJlIGFjY2VwdGVkJyk7XG4gICAgfVxuXG4gICAgaWYgKG9wdHMuc2VydmVyTm9Db250ZXh0VGFrZW92ZXIpIHtcbiAgICAgIGFjY2VwdGVkLnNlcnZlcl9ub19jb250ZXh0X3Rha2VvdmVyID0gdHJ1ZTtcbiAgICB9XG4gICAgaWYgKG9wdHMuY2xpZW50Tm9Db250ZXh0VGFrZW92ZXIpIHtcbiAgICAgIGFjY2VwdGVkLmNsaWVudF9ub19jb250ZXh0X3Rha2VvdmVyID0gdHJ1ZTtcbiAgICB9XG4gICAgaWYgKHR5cGVvZiBvcHRzLnNlcnZlck1heFdpbmRvd0JpdHMgPT09ICdudW1iZXInKSB7XG4gICAgICBhY2NlcHRlZC5zZXJ2ZXJfbWF4X3dpbmRvd19iaXRzID0gb3B0cy5zZXJ2ZXJNYXhXaW5kb3dCaXRzO1xuICAgIH1cbiAgICBpZiAodHlwZW9mIG9wdHMuY2xpZW50TWF4V2luZG93Qml0cyA9PT0gJ251bWJlcicpIHtcbiAgICAgIGFjY2VwdGVkLmNsaWVudF9tYXhfd2luZG93X2JpdHMgPSBvcHRzLmNsaWVudE1heFdpbmRvd0JpdHM7XG4gICAgfSBlbHNlIGlmIChcbiAgICAgIGFjY2VwdGVkLmNsaWVudF9tYXhfd2luZG93X2JpdHMgPT09IHRydWUgfHxcbiAgICAgIG9wdHMuY2xpZW50TWF4V2luZG93Qml0cyA9PT0gZmFsc2VcbiAgICApIHtcbiAgICAgIGRlbGV0ZSBhY2NlcHRlZC5jbGllbnRfbWF4X3dpbmRvd19iaXRzO1xuICAgIH1cblxuICAgIHJldHVybiBhY2NlcHRlZDtcbiAgfVxuXG4gIC8qKlxuICAgKiBBY2NlcHQgdGhlIGV4dGVuc2lvbiBuZWdvdGlhdGlvbiByZXNwb25zZS5cbiAgICpcbiAgICogQHBhcmFtIHtBcnJheX0gcmVzcG9uc2UgVGhlIGV4dGVuc2lvbiBuZWdvdGlhdGlvbiByZXNwb25zZVxuICAgKiBAcmV0dXJuIHtPYmplY3R9IEFjY2VwdGVkIGNvbmZpZ3VyYXRpb25cbiAgICogQHByaXZhdGVcbiAgICovXG4gIGFjY2VwdEFzQ2xpZW50KHJlc3BvbnNlKSB7XG4gICAgY29uc3QgcGFyYW1zID0gcmVzcG9uc2VbMF07XG5cbiAgICBpZiAoXG4gICAgICB0aGlzLl9vcHRpb25zLmNsaWVudE5vQ29udGV4dFRha2VvdmVyID09PSBmYWxzZSAmJlxuICAgICAgcGFyYW1zLmNsaWVudF9ub19jb250ZXh0X3Rha2VvdmVyXG4gICAgKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ1VuZXhwZWN0ZWQgcGFyYW1ldGVyIFwiY2xpZW50X25vX2NvbnRleHRfdGFrZW92ZXJcIicpO1xuICAgIH1cblxuICAgIGlmICghcGFyYW1zLmNsaWVudF9tYXhfd2luZG93X2JpdHMpIHtcbiAgICAgIGlmICh0eXBlb2YgdGhpcy5fb3B0aW9ucy5jbGllbnRNYXhXaW5kb3dCaXRzID09PSAnbnVtYmVyJykge1xuICAgICAgICBwYXJhbXMuY2xpZW50X21heF93aW5kb3dfYml0cyA9IHRoaXMuX29wdGlvbnMuY2xpZW50TWF4V2luZG93Qml0cztcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKFxuICAgICAgdGhpcy5fb3B0aW9ucy5jbGllbnRNYXhXaW5kb3dCaXRzID09PSBmYWxzZSB8fFxuICAgICAgKHR5cGVvZiB0aGlzLl9vcHRpb25zLmNsaWVudE1heFdpbmRvd0JpdHMgPT09ICdudW1iZXInICYmXG4gICAgICAgIHBhcmFtcy5jbGllbnRfbWF4X3dpbmRvd19iaXRzID4gdGhpcy5fb3B0aW9ucy5jbGllbnRNYXhXaW5kb3dCaXRzKVxuICAgICkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAnVW5leHBlY3RlZCBvciBpbnZhbGlkIHBhcmFtZXRlciBcImNsaWVudF9tYXhfd2luZG93X2JpdHNcIidcbiAgICAgICk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHBhcmFtcztcbiAgfVxuXG4gIC8qKlxuICAgKiBOb3JtYWxpemUgcGFyYW1ldGVycy5cbiAgICpcbiAgICogQHBhcmFtIHtBcnJheX0gY29uZmlndXJhdGlvbnMgVGhlIGV4dGVuc2lvbiBuZWdvdGlhdGlvbiBvZmZlcnMvcmVwb25zZVxuICAgKiBAcmV0dXJuIHtBcnJheX0gVGhlIG9mZmVycy9yZXNwb25zZSB3aXRoIG5vcm1hbGl6ZWQgcGFyYW1ldGVyc1xuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgbm9ybWFsaXplUGFyYW1zKGNvbmZpZ3VyYXRpb25zKSB7XG4gICAgY29uZmlndXJhdGlvbnMuZm9yRWFjaCgocGFyYW1zKSA9PiB7XG4gICAgICBPYmplY3Qua2V5cyhwYXJhbXMpLmZvckVhY2goKGtleSkgPT4ge1xuICAgICAgICBsZXQgdmFsdWUgPSBwYXJhbXNba2V5XTtcblxuICAgICAgICBpZiAodmFsdWUubGVuZ3RoID4gMSkge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgUGFyYW1ldGVyIFwiJHtrZXl9XCIgbXVzdCBoYXZlIG9ubHkgYSBzaW5nbGUgdmFsdWVgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhbHVlID0gdmFsdWVbMF07XG5cbiAgICAgICAgaWYgKGtleSA9PT0gJ2NsaWVudF9tYXhfd2luZG93X2JpdHMnKSB7XG4gICAgICAgICAgaWYgKHZhbHVlICE9PSB0cnVlKSB7XG4gICAgICAgICAgICBjb25zdCBudW0gPSArdmFsdWU7XG4gICAgICAgICAgICBpZiAoIU51bWJlci5pc0ludGVnZXIobnVtKSB8fCBudW0gPCA4IHx8IG51bSA+IDE1KSB7XG4gICAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXG4gICAgICAgICAgICAgICAgYEludmFsaWQgdmFsdWUgZm9yIHBhcmFtZXRlciBcIiR7a2V5fVwiOiAke3ZhbHVlfWBcbiAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhbHVlID0gbnVtO1xuICAgICAgICAgIH0gZWxzZSBpZiAoIXRoaXMuX2lzU2VydmVyKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFxuICAgICAgICAgICAgICBgSW52YWxpZCB2YWx1ZSBmb3IgcGFyYW1ldGVyIFwiJHtrZXl9XCI6ICR7dmFsdWV9YFxuICAgICAgICAgICAgKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSBpZiAoa2V5ID09PSAnc2VydmVyX21heF93aW5kb3dfYml0cycpIHtcbiAgICAgICAgICBjb25zdCBudW0gPSArdmFsdWU7XG4gICAgICAgICAgaWYgKCFOdW1iZXIuaXNJbnRlZ2VyKG51bSkgfHwgbnVtIDwgOCB8fCBudW0gPiAxNSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcbiAgICAgICAgICAgICAgYEludmFsaWQgdmFsdWUgZm9yIHBhcmFtZXRlciBcIiR7a2V5fVwiOiAke3ZhbHVlfWBcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHZhbHVlID0gbnVtO1xuICAgICAgICB9IGVsc2UgaWYgKFxuICAgICAgICAgIGtleSA9PT0gJ2NsaWVudF9ub19jb250ZXh0X3Rha2VvdmVyJyB8fFxuICAgICAgICAgIGtleSA9PT0gJ3NlcnZlcl9ub19jb250ZXh0X3Rha2VvdmVyJ1xuICAgICAgICApIHtcbiAgICAgICAgICBpZiAodmFsdWUgIT09IHRydWUpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXG4gICAgICAgICAgICAgIGBJbnZhbGlkIHZhbHVlIGZvciBwYXJhbWV0ZXIgXCIke2tleX1cIjogJHt2YWx1ZX1gXG4gICAgICAgICAgICApO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFVua25vd24gcGFyYW1ldGVyIFwiJHtrZXl9XCJgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHBhcmFtc1trZXldID0gdmFsdWU7XG4gICAgICB9KTtcbiAgICB9KTtcblxuICAgIHJldHVybiBjb25maWd1cmF0aW9ucztcbiAgfVxuXG4gIC8qKlxuICAgKiBEZWNvbXByZXNzIGRhdGEuIENvbmN1cnJlbmN5IGxpbWl0ZWQuXG4gICAqXG4gICAqIEBwYXJhbSB7QnVmZmVyfSBkYXRhIENvbXByZXNzZWQgZGF0YVxuICAgKiBAcGFyYW0ge0Jvb2xlYW59IGZpbiBTcGVjaWZpZXMgd2hldGhlciBvciBub3QgdGhpcyBpcyB0aGUgbGFzdCBmcmFnbWVudFxuICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBjYWxsYmFjayBDYWxsYmFja1xuICAgKiBAcHVibGljXG4gICAqL1xuICBkZWNvbXByZXNzKGRhdGEsIGZpbiwgY2FsbGJhY2spIHtcbiAgICB6bGliTGltaXRlci5hZGQoKGRvbmUpID0+IHtcbiAgICAgIHRoaXMuX2RlY29tcHJlc3MoZGF0YSwgZmluLCAoZXJyLCByZXN1bHQpID0+IHtcbiAgICAgICAgZG9uZSgpO1xuICAgICAgICBjYWxsYmFjayhlcnIsIHJlc3VsdCk7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDb21wcmVzcyBkYXRhLiBDb25jdXJyZW5jeSBsaW1pdGVkLlxuICAgKlxuICAgKiBAcGFyYW0ge0J1ZmZlcn0gZGF0YSBEYXRhIHRvIGNvbXByZXNzXG4gICAqIEBwYXJhbSB7Qm9vbGVhbn0gZmluIFNwZWNpZmllcyB3aGV0aGVyIG9yIG5vdCB0aGlzIGlzIHRoZSBsYXN0IGZyYWdtZW50XG4gICAqIEBwYXJhbSB7RnVuY3Rpb259IGNhbGxiYWNrIENhbGxiYWNrXG4gICAqIEBwdWJsaWNcbiAgICovXG4gIGNvbXByZXNzKGRhdGEsIGZpbiwgY2FsbGJhY2spIHtcbiAgICB6bGliTGltaXRlci5hZGQoKGRvbmUpID0+IHtcbiAgICAgIHRoaXMuX2NvbXByZXNzKGRhdGEsIGZpbiwgKGVyciwgcmVzdWx0KSA9PiB7XG4gICAgICAgIGRvbmUoKTtcbiAgICAgICAgY2FsbGJhY2soZXJyLCByZXN1bHQpO1xuICAgICAgfSk7XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogRGVjb21wcmVzcyBkYXRhLlxuICAgKlxuICAgKiBAcGFyYW0ge0J1ZmZlcn0gZGF0YSBDb21wcmVzc2VkIGRhdGFcbiAgICogQHBhcmFtIHtCb29sZWFufSBmaW4gU3BlY2lmaWVzIHdoZXRoZXIgb3Igbm90IHRoaXMgaXMgdGhlIGxhc3QgZnJhZ21lbnRcbiAgICogQHBhcmFtIHtGdW5jdGlvbn0gY2FsbGJhY2sgQ2FsbGJhY2tcbiAgICogQHByaXZhdGVcbiAgICovXG4gIF9kZWNvbXByZXNzKGRhdGEsIGZpbiwgY2FsbGJhY2spIHtcbiAgICBjb25zdCBlbmRwb2ludCA9IHRoaXMuX2lzU2VydmVyID8gJ2NsaWVudCcgOiAnc2VydmVyJztcblxuICAgIGlmICghdGhpcy5faW5mbGF0ZSkge1xuICAgICAgY29uc3Qga2V5ID0gYCR7ZW5kcG9pbnR9X21heF93aW5kb3dfYml0c2A7XG4gICAgICBjb25zdCB3aW5kb3dCaXRzID1cbiAgICAgICAgdHlwZW9mIHRoaXMucGFyYW1zW2tleV0gIT09ICdudW1iZXInXG4gICAgICAgICAgPyB6bGliLlpfREVGQVVMVF9XSU5ET1dCSVRTXG4gICAgICAgICAgOiB0aGlzLnBhcmFtc1trZXldO1xuXG4gICAgICB0aGlzLl9pbmZsYXRlID0gemxpYi5jcmVhdGVJbmZsYXRlUmF3KHtcbiAgICAgICAgLi4udGhpcy5fb3B0aW9ucy56bGliSW5mbGF0ZU9wdGlvbnMsXG4gICAgICAgIHdpbmRvd0JpdHNcbiAgICAgIH0pO1xuICAgICAgdGhpcy5faW5mbGF0ZVtrUGVyTWVzc2FnZURlZmxhdGVdID0gdGhpcztcbiAgICAgIHRoaXMuX2luZmxhdGVba1RvdGFsTGVuZ3RoXSA9IDA7XG4gICAgICB0aGlzLl9pbmZsYXRlW2tCdWZmZXJzXSA9IFtdO1xuICAgICAgdGhpcy5faW5mbGF0ZS5vbignZXJyb3InLCBpbmZsYXRlT25FcnJvcik7XG4gICAgICB0aGlzLl9pbmZsYXRlLm9uKCdkYXRhJywgaW5mbGF0ZU9uRGF0YSk7XG4gICAgfVxuXG4gICAgdGhpcy5faW5mbGF0ZVtrQ2FsbGJhY2tdID0gY2FsbGJhY2s7XG5cbiAgICB0aGlzLl9pbmZsYXRlLndyaXRlKGRhdGEpO1xuICAgIGlmIChmaW4pIHRoaXMuX2luZmxhdGUud3JpdGUoVFJBSUxFUik7XG5cbiAgICB0aGlzLl9pbmZsYXRlLmZsdXNoKCgpID0+IHtcbiAgICAgIGNvbnN0IGVyciA9IHRoaXMuX2luZmxhdGVba0Vycm9yXTtcblxuICAgICAgaWYgKGVycikge1xuICAgICAgICB0aGlzLl9pbmZsYXRlLmNsb3NlKCk7XG4gICAgICAgIHRoaXMuX2luZmxhdGUgPSBudWxsO1xuICAgICAgICBjYWxsYmFjayhlcnIpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IGRhdGEgPSBidWZmZXJVdGlsLmNvbmNhdChcbiAgICAgICAgdGhpcy5faW5mbGF0ZVtrQnVmZmVyc10sXG4gICAgICAgIHRoaXMuX2luZmxhdGVba1RvdGFsTGVuZ3RoXVxuICAgICAgKTtcblxuICAgICAgaWYgKHRoaXMuX2luZmxhdGUuX3JlYWRhYmxlU3RhdGUuZW5kRW1pdHRlZCkge1xuICAgICAgICB0aGlzLl9pbmZsYXRlLmNsb3NlKCk7XG4gICAgICAgIHRoaXMuX2luZmxhdGUgPSBudWxsO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5faW5mbGF0ZVtrVG90YWxMZW5ndGhdID0gMDtcbiAgICAgICAgdGhpcy5faW5mbGF0ZVtrQnVmZmVyc10gPSBbXTtcblxuICAgICAgICBpZiAoZmluICYmIHRoaXMucGFyYW1zW2Ake2VuZHBvaW50fV9ub19jb250ZXh0X3Rha2VvdmVyYF0pIHtcbiAgICAgICAgICB0aGlzLl9pbmZsYXRlLnJlc2V0KCk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgY2FsbGJhY2sobnVsbCwgZGF0YSk7XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogQ29tcHJlc3MgZGF0YS5cbiAgICpcbiAgICogQHBhcmFtIHtCdWZmZXJ9IGRhdGEgRGF0YSB0byBjb21wcmVzc1xuICAgKiBAcGFyYW0ge0Jvb2xlYW59IGZpbiBTcGVjaWZpZXMgd2hldGhlciBvciBub3QgdGhpcyBpcyB0aGUgbGFzdCBmcmFnbWVudFxuICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBjYWxsYmFjayBDYWxsYmFja1xuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgX2NvbXByZXNzKGRhdGEsIGZpbiwgY2FsbGJhY2spIHtcbiAgICBjb25zdCBlbmRwb2ludCA9IHRoaXMuX2lzU2VydmVyID8gJ3NlcnZlcicgOiAnY2xpZW50JztcblxuICAgIGlmICghdGhpcy5fZGVmbGF0ZSkge1xuICAgICAgY29uc3Qga2V5ID0gYCR7ZW5kcG9pbnR9X21heF93aW5kb3dfYml0c2A7XG4gICAgICBjb25zdCB3aW5kb3dCaXRzID1cbiAgICAgICAgdHlwZW9mIHRoaXMucGFyYW1zW2tleV0gIT09ICdudW1iZXInXG4gICAgICAgICAgPyB6bGliLlpfREVGQVVMVF9XSU5ET1dCSVRTXG4gICAgICAgICAgOiB0aGlzLnBhcmFtc1trZXldO1xuXG4gICAgICB0aGlzLl9kZWZsYXRlID0gemxpYi5jcmVhdGVEZWZsYXRlUmF3KHtcbiAgICAgICAgLi4udGhpcy5fb3B0aW9ucy56bGliRGVmbGF0ZU9wdGlvbnMsXG4gICAgICAgIHdpbmRvd0JpdHNcbiAgICAgIH0pO1xuXG4gICAgICB0aGlzLl9kZWZsYXRlW2tUb3RhbExlbmd0aF0gPSAwO1xuICAgICAgdGhpcy5fZGVmbGF0ZVtrQnVmZmVyc10gPSBbXTtcblxuICAgICAgdGhpcy5fZGVmbGF0ZS5vbignZGF0YScsIGRlZmxhdGVPbkRhdGEpO1xuICAgIH1cblxuICAgIHRoaXMuX2RlZmxhdGVba0NhbGxiYWNrXSA9IGNhbGxiYWNrO1xuXG4gICAgdGhpcy5fZGVmbGF0ZS53cml0ZShkYXRhKTtcbiAgICB0aGlzLl9kZWZsYXRlLmZsdXNoKHpsaWIuWl9TWU5DX0ZMVVNILCAoKSA9PiB7XG4gICAgICBpZiAoIXRoaXMuX2RlZmxhdGUpIHtcbiAgICAgICAgLy9cbiAgICAgICAgLy8gVGhlIGRlZmxhdGUgc3RyZWFtIHdhcyBjbG9zZWQgd2hpbGUgZGF0YSB3YXMgYmVpbmcgcHJvY2Vzc2VkLlxuICAgICAgICAvL1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGxldCBkYXRhID0gYnVmZmVyVXRpbC5jb25jYXQoXG4gICAgICAgIHRoaXMuX2RlZmxhdGVba0J1ZmZlcnNdLFxuICAgICAgICB0aGlzLl9kZWZsYXRlW2tUb3RhbExlbmd0aF1cbiAgICAgICk7XG5cbiAgICAgIGlmIChmaW4pIGRhdGEgPSBkYXRhLnNsaWNlKDAsIGRhdGEubGVuZ3RoIC0gNCk7XG5cbiAgICAgIC8vXG4gICAgICAvLyBFbnN1cmUgdGhhdCB0aGUgY2FsbGJhY2sgd2lsbCBub3QgYmUgY2FsbGVkIGFnYWluIGluXG4gICAgICAvLyBgUGVyTWVzc2FnZURlZmxhdGUjY2xlYW51cCgpYC5cbiAgICAgIC8vXG4gICAgICB0aGlzLl9kZWZsYXRlW2tDYWxsYmFja10gPSBudWxsO1xuXG4gICAgICB0aGlzLl9kZWZsYXRlW2tUb3RhbExlbmd0aF0gPSAwO1xuICAgICAgdGhpcy5fZGVmbGF0ZVtrQnVmZmVyc10gPSBbXTtcblxuICAgICAgaWYgKGZpbiAmJiB0aGlzLnBhcmFtc1tgJHtlbmRwb2ludH1fbm9fY29udGV4dF90YWtlb3ZlcmBdKSB7XG4gICAgICAgIHRoaXMuX2RlZmxhdGUucmVzZXQoKTtcbiAgICAgIH1cblxuICAgICAgY2FsbGJhY2sobnVsbCwgZGF0YSk7XG4gICAgfSk7XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBQZXJNZXNzYWdlRGVmbGF0ZTtcblxuLyoqXG4gKiBUaGUgbGlzdGVuZXIgb2YgdGhlIGB6bGliLkRlZmxhdGVSYXdgIHN0cmVhbSBgJ2RhdGEnYCBldmVudC5cbiAqXG4gKiBAcGFyYW0ge0J1ZmZlcn0gY2h1bmsgQSBjaHVuayBvZiBkYXRhXG4gKiBAcHJpdmF0ZVxuICovXG5mdW5jdGlvbiBkZWZsYXRlT25EYXRhKGNodW5rKSB7XG4gIHRoaXNba0J1ZmZlcnNdLnB1c2goY2h1bmspO1xuICB0aGlzW2tUb3RhbExlbmd0aF0gKz0gY2h1bmsubGVuZ3RoO1xufVxuXG4vKipcbiAqIFRoZSBsaXN0ZW5lciBvZiB0aGUgYHpsaWIuSW5mbGF0ZVJhd2Agc3RyZWFtIGAnZGF0YSdgIGV2ZW50LlxuICpcbiAqIEBwYXJhbSB7QnVmZmVyfSBjaHVuayBBIGNodW5rIG9mIGRhdGFcbiAqIEBwcml2YXRlXG4gKi9cbmZ1bmN0aW9uIGluZmxhdGVPbkRhdGEoY2h1bmspIHtcbiAgdGhpc1trVG90YWxMZW5ndGhdICs9IGNodW5rLmxlbmd0aDtcblxuICBpZiAoXG4gICAgdGhpc1trUGVyTWVzc2FnZURlZmxhdGVdLl9tYXhQYXlsb2FkIDwgMSB8fFxuICAgIHRoaXNba1RvdGFsTGVuZ3RoXSA8PSB0aGlzW2tQZXJNZXNzYWdlRGVmbGF0ZV0uX21heFBheWxvYWRcbiAgKSB7XG4gICAgdGhpc1trQnVmZmVyc10ucHVzaChjaHVuayk7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgdGhpc1trRXJyb3JdID0gbmV3IFJhbmdlRXJyb3IoJ01heCBwYXlsb2FkIHNpemUgZXhjZWVkZWQnKTtcbiAgdGhpc1trRXJyb3JdLmNvZGUgPSAnV1NfRVJSX1VOU1VQUE9SVEVEX01FU1NBR0VfTEVOR1RIJztcbiAgdGhpc1trRXJyb3JdW2tTdGF0dXNDb2RlXSA9IDEwMDk7XG4gIHRoaXMucmVtb3ZlTGlzdGVuZXIoJ2RhdGEnLCBpbmZsYXRlT25EYXRhKTtcbiAgdGhpcy5yZXNldCgpO1xufVxuXG4vKipcbiAqIFRoZSBsaXN0ZW5lciBvZiB0aGUgYHpsaWIuSW5mbGF0ZVJhd2Agc3RyZWFtIGAnZXJyb3InYCBldmVudC5cbiAqXG4gKiBAcGFyYW0ge0Vycm9yfSBlcnIgVGhlIGVtaXR0ZWQgZXJyb3JcbiAqIEBwcml2YXRlXG4gKi9cbmZ1bmN0aW9uIGluZmxhdGVPbkVycm9yKGVycikge1xuICAvL1xuICAvLyBUaGVyZSBpcyBubyBuZWVkIHRvIGNhbGwgYFpsaWIjY2xvc2UoKWAgYXMgdGhlIGhhbmRsZSBpcyBhdXRvbWF0aWNhbGx5XG4gIC8vIGNsb3NlZCB3aGVuIGFuIGVycm9yIGlzIGVtaXR0ZWQuXG4gIC8vXG4gIHRoaXNba1Blck1lc3NhZ2VEZWZsYXRlXS5faW5mbGF0ZSA9IG51bGw7XG4gIGVycltrU3RhdHVzQ29kZV0gPSAxMDA3O1xuICB0aGlzW2tDYWxsYmFja10oZXJyKTtcbn1cbiIsIid1c2Ugc3RyaWN0JztcblxuLy9cbi8vIEFsbG93ZWQgdG9rZW4gY2hhcmFjdGVyczpcbi8vXG4vLyAnIScsICcjJywgJyQnLCAnJScsICcmJywgJycnLCAnKicsICcrJywgJy0nLFxuLy8gJy4nLCAwLTksIEEtWiwgJ14nLCAnXycsICdgJywgYS16LCAnfCcsICd+J1xuLy9cbi8vIHRva2VuQ2hhcnNbMzJdID09PSAwIC8vICcgJ1xuLy8gdG9rZW5DaGFyc1szM10gPT09IDEgLy8gJyEnXG4vLyB0b2tlbkNoYXJzWzM0XSA9PT0gMCAvLyAnXCInXG4vLyAuLi5cbi8vXG4vLyBwcmV0dGllci1pZ25vcmVcbmNvbnN0IHRva2VuQ2hhcnMgPSBbXG4gIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIC8vIDAgLSAxNVxuICAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAwLCAvLyAxNiAtIDMxXG4gIDAsIDEsIDAsIDEsIDEsIDEsIDEsIDEsIDAsIDAsIDEsIDEsIDAsIDEsIDEsIDAsIC8vIDMyIC0gNDdcbiAgMSwgMSwgMSwgMSwgMSwgMSwgMSwgMSwgMSwgMSwgMCwgMCwgMCwgMCwgMCwgMCwgLy8gNDggLSA2M1xuICAwLCAxLCAxLCAxLCAxLCAxLCAxLCAxLCAxLCAxLCAxLCAxLCAxLCAxLCAxLCAxLCAvLyA2NCAtIDc5XG4gIDEsIDEsIDEsIDEsIDEsIDEsIDEsIDEsIDEsIDEsIDEsIDAsIDAsIDAsIDEsIDEsIC8vIDgwIC0gOTVcbiAgMSwgMSwgMSwgMSwgMSwgMSwgMSwgMSwgMSwgMSwgMSwgMSwgMSwgMSwgMSwgMSwgLy8gOTYgLSAxMTFcbiAgMSwgMSwgMSwgMSwgMSwgMSwgMSwgMSwgMSwgMSwgMSwgMCwgMSwgMCwgMSwgMCAvLyAxMTIgLSAxMjdcbl07XG5cbi8qKlxuICogQ2hlY2tzIGlmIGEgc3RhdHVzIGNvZGUgaXMgYWxsb3dlZCBpbiBhIGNsb3NlIGZyYW1lLlxuICpcbiAqIEBwYXJhbSB7TnVtYmVyfSBjb2RlIFRoZSBzdGF0dXMgY29kZVxuICogQHJldHVybiB7Qm9vbGVhbn0gYHRydWVgIGlmIHRoZSBzdGF0dXMgY29kZSBpcyB2YWxpZCwgZWxzZSBgZmFsc2VgXG4gKiBAcHVibGljXG4gKi9cbmZ1bmN0aW9uIGlzVmFsaWRTdGF0dXNDb2RlKGNvZGUpIHtcbiAgcmV0dXJuIChcbiAgICAoY29kZSA+PSAxMDAwICYmXG4gICAgICBjb2RlIDw9IDEwMTQgJiZcbiAgICAgIGNvZGUgIT09IDEwMDQgJiZcbiAgICAgIGNvZGUgIT09IDEwMDUgJiZcbiAgICAgIGNvZGUgIT09IDEwMDYpIHx8XG4gICAgKGNvZGUgPj0gMzAwMCAmJiBjb2RlIDw9IDQ5OTkpXG4gICk7XG59XG5cbi8qKlxuICogQ2hlY2tzIGlmIGEgZ2l2ZW4gYnVmZmVyIGNvbnRhaW5zIG9ubHkgY29ycmVjdCBVVEYtOC5cbiAqIFBvcnRlZCBmcm9tIGh0dHBzOi8vd3d3LmNsLmNhbS5hYy51ay8lN0VtZ2syNS91Y3MvdXRmOF9jaGVjay5jIGJ5XG4gKiBNYXJrdXMgS3Vobi5cbiAqXG4gKiBAcGFyYW0ge0J1ZmZlcn0gYnVmIFRoZSBidWZmZXIgdG8gY2hlY2tcbiAqIEByZXR1cm4ge0Jvb2xlYW59IGB0cnVlYCBpZiBgYnVmYCBjb250YWlucyBvbmx5IGNvcnJlY3QgVVRGLTgsIGVsc2UgYGZhbHNlYFxuICogQHB1YmxpY1xuICovXG5mdW5jdGlvbiBfaXNWYWxpZFVURjgoYnVmKSB7XG4gIGNvbnN0IGxlbiA9IGJ1Zi5sZW5ndGg7XG4gIGxldCBpID0gMDtcblxuICB3aGlsZSAoaSA8IGxlbikge1xuICAgIGlmICgoYnVmW2ldICYgMHg4MCkgPT09IDApIHtcbiAgICAgIC8vIDB4eHh4eHh4XG4gICAgICBpKys7XG4gICAgfSBlbHNlIGlmICgoYnVmW2ldICYgMHhlMCkgPT09IDB4YzApIHtcbiAgICAgIC8vIDExMHh4eHh4IDEweHh4eHh4XG4gICAgICBpZiAoXG4gICAgICAgIGkgKyAxID09PSBsZW4gfHxcbiAgICAgICAgKGJ1ZltpICsgMV0gJiAweGMwKSAhPT0gMHg4MCB8fFxuICAgICAgICAoYnVmW2ldICYgMHhmZSkgPT09IDB4YzAgLy8gT3ZlcmxvbmdcbiAgICAgICkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG5cbiAgICAgIGkgKz0gMjtcbiAgICB9IGVsc2UgaWYgKChidWZbaV0gJiAweGYwKSA9PT0gMHhlMCkge1xuICAgICAgLy8gMTExMHh4eHggMTB4eHh4eHggMTB4eHh4eHhcbiAgICAgIGlmIChcbiAgICAgICAgaSArIDIgPj0gbGVuIHx8XG4gICAgICAgIChidWZbaSArIDFdICYgMHhjMCkgIT09IDB4ODAgfHxcbiAgICAgICAgKGJ1ZltpICsgMl0gJiAweGMwKSAhPT0gMHg4MCB8fFxuICAgICAgICAoYnVmW2ldID09PSAweGUwICYmIChidWZbaSArIDFdICYgMHhlMCkgPT09IDB4ODApIHx8IC8vIE92ZXJsb25nXG4gICAgICAgIChidWZbaV0gPT09IDB4ZWQgJiYgKGJ1ZltpICsgMV0gJiAweGUwKSA9PT0gMHhhMCkgLy8gU3Vycm9nYXRlIChVK0Q4MDAgLSBVK0RGRkYpXG4gICAgICApIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuXG4gICAgICBpICs9IDM7XG4gICAgfSBlbHNlIGlmICgoYnVmW2ldICYgMHhmOCkgPT09IDB4ZjApIHtcbiAgICAgIC8vIDExMTEweHh4IDEweHh4eHh4IDEweHh4eHh4IDEweHh4eHh4XG4gICAgICBpZiAoXG4gICAgICAgIGkgKyAzID49IGxlbiB8fFxuICAgICAgICAoYnVmW2kgKyAxXSAmIDB4YzApICE9PSAweDgwIHx8XG4gICAgICAgIChidWZbaSArIDJdICYgMHhjMCkgIT09IDB4ODAgfHxcbiAgICAgICAgKGJ1ZltpICsgM10gJiAweGMwKSAhPT0gMHg4MCB8fFxuICAgICAgICAoYnVmW2ldID09PSAweGYwICYmIChidWZbaSArIDFdICYgMHhmMCkgPT09IDB4ODApIHx8IC8vIE92ZXJsb25nXG4gICAgICAgIChidWZbaV0gPT09IDB4ZjQgJiYgYnVmW2kgKyAxXSA+IDB4OGYpIHx8XG4gICAgICAgIGJ1ZltpXSA+IDB4ZjQgLy8gPiBVKzEwRkZGRlxuICAgICAgKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cblxuICAgICAgaSArPSA0O1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHRydWU7XG59XG5cbnRyeSB7XG4gIGNvbnN0IGlzVmFsaWRVVEY4ID0gcmVxdWlyZSgndXRmLTgtdmFsaWRhdGUnKTtcblxuICBtb2R1bGUuZXhwb3J0cyA9IHtcbiAgICBpc1ZhbGlkU3RhdHVzQ29kZSxcbiAgICBpc1ZhbGlkVVRGOChidWYpIHtcbiAgICAgIHJldHVybiBidWYubGVuZ3RoIDwgMTUwID8gX2lzVmFsaWRVVEY4KGJ1ZikgOiBpc1ZhbGlkVVRGOChidWYpO1xuICAgIH0sXG4gICAgdG9rZW5DaGFyc1xuICB9O1xufSBjYXRjaCAoZSkgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi8ge1xuICBtb2R1bGUuZXhwb3J0cyA9IHtcbiAgICBpc1ZhbGlkU3RhdHVzQ29kZSxcbiAgICBpc1ZhbGlkVVRGODogX2lzVmFsaWRVVEY4LFxuICAgIHRva2VuQ2hhcnNcbiAgfTtcbn1cbiIsIid1c2Ugc3RyaWN0JztcblxuY29uc3QgeyBXcml0YWJsZSB9ID0gcmVxdWlyZSgnc3RyZWFtJyk7XG5cbmNvbnN0IFBlck1lc3NhZ2VEZWZsYXRlID0gcmVxdWlyZSgnLi9wZXJtZXNzYWdlLWRlZmxhdGUnKTtcbmNvbnN0IHtcbiAgQklOQVJZX1RZUEVTLFxuICBFTVBUWV9CVUZGRVIsXG4gIGtTdGF0dXNDb2RlLFxuICBrV2ViU29ja2V0XG59ID0gcmVxdWlyZSgnLi9jb25zdGFudHMnKTtcbmNvbnN0IHsgY29uY2F0LCB0b0FycmF5QnVmZmVyLCB1bm1hc2sgfSA9IHJlcXVpcmUoJy4vYnVmZmVyLXV0aWwnKTtcbmNvbnN0IHsgaXNWYWxpZFN0YXR1c0NvZGUsIGlzVmFsaWRVVEY4IH0gPSByZXF1aXJlKCcuL3ZhbGlkYXRpb24nKTtcblxuY29uc3QgR0VUX0lORk8gPSAwO1xuY29uc3QgR0VUX1BBWUxPQURfTEVOR1RIXzE2ID0gMTtcbmNvbnN0IEdFVF9QQVlMT0FEX0xFTkdUSF82NCA9IDI7XG5jb25zdCBHRVRfTUFTSyA9IDM7XG5jb25zdCBHRVRfREFUQSA9IDQ7XG5jb25zdCBJTkZMQVRJTkcgPSA1O1xuXG4vKipcbiAqIEh5QmkgUmVjZWl2ZXIgaW1wbGVtZW50YXRpb24uXG4gKlxuICogQGV4dGVuZHMgV3JpdGFibGVcbiAqL1xuY2xhc3MgUmVjZWl2ZXIgZXh0ZW5kcyBXcml0YWJsZSB7XG4gIC8qKlxuICAgKiBDcmVhdGVzIGEgUmVjZWl2ZXIgaW5zdGFuY2UuXG4gICAqXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9uc10gT3B0aW9ucyBvYmplY3RcbiAgICogQHBhcmFtIHtTdHJpbmd9IFtvcHRpb25zLmJpbmFyeVR5cGU9bm9kZWJ1ZmZlcl0gVGhlIHR5cGUgZm9yIGJpbmFyeSBkYXRhXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9ucy5leHRlbnNpb25zXSBBbiBvYmplY3QgY29udGFpbmluZyB0aGUgbmVnb3RpYXRlZFxuICAgKiAgICAgZXh0ZW5zaW9uc1xuICAgKiBAcGFyYW0ge0Jvb2xlYW59IFtvcHRpb25zLmlzU2VydmVyPWZhbHNlXSBTcGVjaWZpZXMgd2hldGhlciB0byBvcGVyYXRlIGluXG4gICAqICAgICBjbGllbnQgb3Igc2VydmVyIG1vZGVcbiAgICogQHBhcmFtIHtOdW1iZXJ9IFtvcHRpb25zLm1heFBheWxvYWQ9MF0gVGhlIG1heGltdW0gYWxsb3dlZCBtZXNzYWdlIGxlbmd0aFxuICAgKiBAcGFyYW0ge0Jvb2xlYW59IFtvcHRpb25zLnNraXBVVEY4VmFsaWRhdGlvbj1mYWxzZV0gU3BlY2lmaWVzIHdoZXRoZXIgb3JcbiAgICogICAgIG5vdCB0byBza2lwIFVURi04IHZhbGlkYXRpb24gZm9yIHRleHQgYW5kIGNsb3NlIG1lc3NhZ2VzXG4gICAqL1xuICBjb25zdHJ1Y3RvcihvcHRpb25zID0ge30pIHtcbiAgICBzdXBlcigpO1xuXG4gICAgdGhpcy5fYmluYXJ5VHlwZSA9IG9wdGlvbnMuYmluYXJ5VHlwZSB8fCBCSU5BUllfVFlQRVNbMF07XG4gICAgdGhpcy5fZXh0ZW5zaW9ucyA9IG9wdGlvbnMuZXh0ZW5zaW9ucyB8fCB7fTtcbiAgICB0aGlzLl9pc1NlcnZlciA9ICEhb3B0aW9ucy5pc1NlcnZlcjtcbiAgICB0aGlzLl9tYXhQYXlsb2FkID0gb3B0aW9ucy5tYXhQYXlsb2FkIHwgMDtcbiAgICB0aGlzLl9za2lwVVRGOFZhbGlkYXRpb24gPSAhIW9wdGlvbnMuc2tpcFVURjhWYWxpZGF0aW9uO1xuICAgIHRoaXNba1dlYlNvY2tldF0gPSB1bmRlZmluZWQ7XG5cbiAgICB0aGlzLl9idWZmZXJlZEJ5dGVzID0gMDtcbiAgICB0aGlzLl9idWZmZXJzID0gW107XG5cbiAgICB0aGlzLl9jb21wcmVzc2VkID0gZmFsc2U7XG4gICAgdGhpcy5fcGF5bG9hZExlbmd0aCA9IDA7XG4gICAgdGhpcy5fbWFzayA9IHVuZGVmaW5lZDtcbiAgICB0aGlzLl9mcmFnbWVudGVkID0gMDtcbiAgICB0aGlzLl9tYXNrZWQgPSBmYWxzZTtcbiAgICB0aGlzLl9maW4gPSBmYWxzZTtcbiAgICB0aGlzLl9vcGNvZGUgPSAwO1xuXG4gICAgdGhpcy5fdG90YWxQYXlsb2FkTGVuZ3RoID0gMDtcbiAgICB0aGlzLl9tZXNzYWdlTGVuZ3RoID0gMDtcbiAgICB0aGlzLl9mcmFnbWVudHMgPSBbXTtcblxuICAgIHRoaXMuX3N0YXRlID0gR0VUX0lORk87XG4gICAgdGhpcy5fbG9vcCA9IGZhbHNlO1xuICB9XG5cbiAgLyoqXG4gICAqIEltcGxlbWVudHMgYFdyaXRhYmxlLnByb3RvdHlwZS5fd3JpdGUoKWAuXG4gICAqXG4gICAqIEBwYXJhbSB7QnVmZmVyfSBjaHVuayBUaGUgY2h1bmsgb2YgZGF0YSB0byB3cml0ZVxuICAgKiBAcGFyYW0ge1N0cmluZ30gZW5jb2RpbmcgVGhlIGNoYXJhY3RlciBlbmNvZGluZyBvZiBgY2h1bmtgXG4gICAqIEBwYXJhbSB7RnVuY3Rpb259IGNiIENhbGxiYWNrXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBfd3JpdGUoY2h1bmssIGVuY29kaW5nLCBjYikge1xuICAgIGlmICh0aGlzLl9vcGNvZGUgPT09IDB4MDggJiYgdGhpcy5fc3RhdGUgPT0gR0VUX0lORk8pIHJldHVybiBjYigpO1xuXG4gICAgdGhpcy5fYnVmZmVyZWRCeXRlcyArPSBjaHVuay5sZW5ndGg7XG4gICAgdGhpcy5fYnVmZmVycy5wdXNoKGNodW5rKTtcbiAgICB0aGlzLnN0YXJ0TG9vcChjYik7XG4gIH1cblxuICAvKipcbiAgICogQ29uc3VtZXMgYG5gIGJ5dGVzIGZyb20gdGhlIGJ1ZmZlcmVkIGRhdGEuXG4gICAqXG4gICAqIEBwYXJhbSB7TnVtYmVyfSBuIFRoZSBudW1iZXIgb2YgYnl0ZXMgdG8gY29uc3VtZVxuICAgKiBAcmV0dXJuIHtCdWZmZXJ9IFRoZSBjb25zdW1lZCBieXRlc1xuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgY29uc3VtZShuKSB7XG4gICAgdGhpcy5fYnVmZmVyZWRCeXRlcyAtPSBuO1xuXG4gICAgaWYgKG4gPT09IHRoaXMuX2J1ZmZlcnNbMF0ubGVuZ3RoKSByZXR1cm4gdGhpcy5fYnVmZmVycy5zaGlmdCgpO1xuXG4gICAgaWYgKG4gPCB0aGlzLl9idWZmZXJzWzBdLmxlbmd0aCkge1xuICAgICAgY29uc3QgYnVmID0gdGhpcy5fYnVmZmVyc1swXTtcbiAgICAgIHRoaXMuX2J1ZmZlcnNbMF0gPSBidWYuc2xpY2Uobik7XG4gICAgICByZXR1cm4gYnVmLnNsaWNlKDAsIG4pO1xuICAgIH1cblxuICAgIGNvbnN0IGRzdCA9IEJ1ZmZlci5hbGxvY1Vuc2FmZShuKTtcblxuICAgIGRvIHtcbiAgICAgIGNvbnN0IGJ1ZiA9IHRoaXMuX2J1ZmZlcnNbMF07XG4gICAgICBjb25zdCBvZmZzZXQgPSBkc3QubGVuZ3RoIC0gbjtcblxuICAgICAgaWYgKG4gPj0gYnVmLmxlbmd0aCkge1xuICAgICAgICBkc3Quc2V0KHRoaXMuX2J1ZmZlcnMuc2hpZnQoKSwgb2Zmc2V0KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGRzdC5zZXQobmV3IFVpbnQ4QXJyYXkoYnVmLmJ1ZmZlciwgYnVmLmJ5dGVPZmZzZXQsIG4pLCBvZmZzZXQpO1xuICAgICAgICB0aGlzLl9idWZmZXJzWzBdID0gYnVmLnNsaWNlKG4pO1xuICAgICAgfVxuXG4gICAgICBuIC09IGJ1Zi5sZW5ndGg7XG4gICAgfSB3aGlsZSAobiA+IDApO1xuXG4gICAgcmV0dXJuIGRzdDtcbiAgfVxuXG4gIC8qKlxuICAgKiBTdGFydHMgdGhlIHBhcnNpbmcgbG9vcC5cbiAgICpcbiAgICogQHBhcmFtIHtGdW5jdGlvbn0gY2IgQ2FsbGJhY2tcbiAgICogQHByaXZhdGVcbiAgICovXG4gIHN0YXJ0TG9vcChjYikge1xuICAgIGxldCBlcnI7XG4gICAgdGhpcy5fbG9vcCA9IHRydWU7XG5cbiAgICBkbyB7XG4gICAgICBzd2l0Y2ggKHRoaXMuX3N0YXRlKSB7XG4gICAgICAgIGNhc2UgR0VUX0lORk86XG4gICAgICAgICAgZXJyID0gdGhpcy5nZXRJbmZvKCk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgR0VUX1BBWUxPQURfTEVOR1RIXzE2OlxuICAgICAgICAgIGVyciA9IHRoaXMuZ2V0UGF5bG9hZExlbmd0aDE2KCk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgR0VUX1BBWUxPQURfTEVOR1RIXzY0OlxuICAgICAgICAgIGVyciA9IHRoaXMuZ2V0UGF5bG9hZExlbmd0aDY0KCk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgR0VUX01BU0s6XG4gICAgICAgICAgdGhpcy5nZXRNYXNrKCk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgR0VUX0RBVEE6XG4gICAgICAgICAgZXJyID0gdGhpcy5nZXREYXRhKGNiKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAvLyBgSU5GTEFUSU5HYFxuICAgICAgICAgIHRoaXMuX2xvb3AgPSBmYWxzZTtcbiAgICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgfSB3aGlsZSAodGhpcy5fbG9vcCk7XG5cbiAgICBjYihlcnIpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlYWRzIHRoZSBmaXJzdCB0d28gYnl0ZXMgb2YgYSBmcmFtZS5cbiAgICpcbiAgICogQHJldHVybiB7KFJhbmdlRXJyb3J8dW5kZWZpbmVkKX0gQSBwb3NzaWJsZSBlcnJvclxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgZ2V0SW5mbygpIHtcbiAgICBpZiAodGhpcy5fYnVmZmVyZWRCeXRlcyA8IDIpIHtcbiAgICAgIHRoaXMuX2xvb3AgPSBmYWxzZTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBidWYgPSB0aGlzLmNvbnN1bWUoMik7XG5cbiAgICBpZiAoKGJ1ZlswXSAmIDB4MzApICE9PSAweDAwKSB7XG4gICAgICB0aGlzLl9sb29wID0gZmFsc2U7XG4gICAgICByZXR1cm4gZXJyb3IoXG4gICAgICAgIFJhbmdlRXJyb3IsXG4gICAgICAgICdSU1YyIGFuZCBSU1YzIG11c3QgYmUgY2xlYXInLFxuICAgICAgICB0cnVlLFxuICAgICAgICAxMDAyLFxuICAgICAgICAnV1NfRVJSX1VORVhQRUNURURfUlNWXzJfMydcbiAgICAgICk7XG4gICAgfVxuXG4gICAgY29uc3QgY29tcHJlc3NlZCA9IChidWZbMF0gJiAweDQwKSA9PT0gMHg0MDtcblxuICAgIGlmIChjb21wcmVzc2VkICYmICF0aGlzLl9leHRlbnNpb25zW1Blck1lc3NhZ2VEZWZsYXRlLmV4dGVuc2lvbk5hbWVdKSB7XG4gICAgICB0aGlzLl9sb29wID0gZmFsc2U7XG4gICAgICByZXR1cm4gZXJyb3IoXG4gICAgICAgIFJhbmdlRXJyb3IsXG4gICAgICAgICdSU1YxIG11c3QgYmUgY2xlYXInLFxuICAgICAgICB0cnVlLFxuICAgICAgICAxMDAyLFxuICAgICAgICAnV1NfRVJSX1VORVhQRUNURURfUlNWXzEnXG4gICAgICApO1xuICAgIH1cblxuICAgIHRoaXMuX2ZpbiA9IChidWZbMF0gJiAweDgwKSA9PT0gMHg4MDtcbiAgICB0aGlzLl9vcGNvZGUgPSBidWZbMF0gJiAweDBmO1xuICAgIHRoaXMuX3BheWxvYWRMZW5ndGggPSBidWZbMV0gJiAweDdmO1xuXG4gICAgaWYgKHRoaXMuX29wY29kZSA9PT0gMHgwMCkge1xuICAgICAgaWYgKGNvbXByZXNzZWQpIHtcbiAgICAgICAgdGhpcy5fbG9vcCA9IGZhbHNlO1xuICAgICAgICByZXR1cm4gZXJyb3IoXG4gICAgICAgICAgUmFuZ2VFcnJvcixcbiAgICAgICAgICAnUlNWMSBtdXN0IGJlIGNsZWFyJyxcbiAgICAgICAgICB0cnVlLFxuICAgICAgICAgIDEwMDIsXG4gICAgICAgICAgJ1dTX0VSUl9VTkVYUEVDVEVEX1JTVl8xJ1xuICAgICAgICApO1xuICAgICAgfVxuXG4gICAgICBpZiAoIXRoaXMuX2ZyYWdtZW50ZWQpIHtcbiAgICAgICAgdGhpcy5fbG9vcCA9IGZhbHNlO1xuICAgICAgICByZXR1cm4gZXJyb3IoXG4gICAgICAgICAgUmFuZ2VFcnJvcixcbiAgICAgICAgICAnaW52YWxpZCBvcGNvZGUgMCcsXG4gICAgICAgICAgdHJ1ZSxcbiAgICAgICAgICAxMDAyLFxuICAgICAgICAgICdXU19FUlJfSU5WQUxJRF9PUENPREUnXG4gICAgICAgICk7XG4gICAgICB9XG5cbiAgICAgIHRoaXMuX29wY29kZSA9IHRoaXMuX2ZyYWdtZW50ZWQ7XG4gICAgfSBlbHNlIGlmICh0aGlzLl9vcGNvZGUgPT09IDB4MDEgfHwgdGhpcy5fb3Bjb2RlID09PSAweDAyKSB7XG4gICAgICBpZiAodGhpcy5fZnJhZ21lbnRlZCkge1xuICAgICAgICB0aGlzLl9sb29wID0gZmFsc2U7XG4gICAgICAgIHJldHVybiBlcnJvcihcbiAgICAgICAgICBSYW5nZUVycm9yLFxuICAgICAgICAgIGBpbnZhbGlkIG9wY29kZSAke3RoaXMuX29wY29kZX1gLFxuICAgICAgICAgIHRydWUsXG4gICAgICAgICAgMTAwMixcbiAgICAgICAgICAnV1NfRVJSX0lOVkFMSURfT1BDT0RFJ1xuICAgICAgICApO1xuICAgICAgfVxuXG4gICAgICB0aGlzLl9jb21wcmVzc2VkID0gY29tcHJlc3NlZDtcbiAgICB9IGVsc2UgaWYgKHRoaXMuX29wY29kZSA+IDB4MDcgJiYgdGhpcy5fb3Bjb2RlIDwgMHgwYikge1xuICAgICAgaWYgKCF0aGlzLl9maW4pIHtcbiAgICAgICAgdGhpcy5fbG9vcCA9IGZhbHNlO1xuICAgICAgICByZXR1cm4gZXJyb3IoXG4gICAgICAgICAgUmFuZ2VFcnJvcixcbiAgICAgICAgICAnRklOIG11c3QgYmUgc2V0JyxcbiAgICAgICAgICB0cnVlLFxuICAgICAgICAgIDEwMDIsXG4gICAgICAgICAgJ1dTX0VSUl9FWFBFQ1RFRF9GSU4nXG4gICAgICAgICk7XG4gICAgICB9XG5cbiAgICAgIGlmIChjb21wcmVzc2VkKSB7XG4gICAgICAgIHRoaXMuX2xvb3AgPSBmYWxzZTtcbiAgICAgICAgcmV0dXJuIGVycm9yKFxuICAgICAgICAgIFJhbmdlRXJyb3IsXG4gICAgICAgICAgJ1JTVjEgbXVzdCBiZSBjbGVhcicsXG4gICAgICAgICAgdHJ1ZSxcbiAgICAgICAgICAxMDAyLFxuICAgICAgICAgICdXU19FUlJfVU5FWFBFQ1RFRF9SU1ZfMSdcbiAgICAgICAgKTtcbiAgICAgIH1cblxuICAgICAgaWYgKHRoaXMuX3BheWxvYWRMZW5ndGggPiAweDdkKSB7XG4gICAgICAgIHRoaXMuX2xvb3AgPSBmYWxzZTtcbiAgICAgICAgcmV0dXJuIGVycm9yKFxuICAgICAgICAgIFJhbmdlRXJyb3IsXG4gICAgICAgICAgYGludmFsaWQgcGF5bG9hZCBsZW5ndGggJHt0aGlzLl9wYXlsb2FkTGVuZ3RofWAsXG4gICAgICAgICAgdHJ1ZSxcbiAgICAgICAgICAxMDAyLFxuICAgICAgICAgICdXU19FUlJfSU5WQUxJRF9DT05UUk9MX1BBWUxPQURfTEVOR1RIJ1xuICAgICAgICApO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLl9sb29wID0gZmFsc2U7XG4gICAgICByZXR1cm4gZXJyb3IoXG4gICAgICAgIFJhbmdlRXJyb3IsXG4gICAgICAgIGBpbnZhbGlkIG9wY29kZSAke3RoaXMuX29wY29kZX1gLFxuICAgICAgICB0cnVlLFxuICAgICAgICAxMDAyLFxuICAgICAgICAnV1NfRVJSX0lOVkFMSURfT1BDT0RFJ1xuICAgICAgKTtcbiAgICB9XG5cbiAgICBpZiAoIXRoaXMuX2ZpbiAmJiAhdGhpcy5fZnJhZ21lbnRlZCkgdGhpcy5fZnJhZ21lbnRlZCA9IHRoaXMuX29wY29kZTtcbiAgICB0aGlzLl9tYXNrZWQgPSAoYnVmWzFdICYgMHg4MCkgPT09IDB4ODA7XG5cbiAgICBpZiAodGhpcy5faXNTZXJ2ZXIpIHtcbiAgICAgIGlmICghdGhpcy5fbWFza2VkKSB7XG4gICAgICAgIHRoaXMuX2xvb3AgPSBmYWxzZTtcbiAgICAgICAgcmV0dXJuIGVycm9yKFxuICAgICAgICAgIFJhbmdlRXJyb3IsXG4gICAgICAgICAgJ01BU0sgbXVzdCBiZSBzZXQnLFxuICAgICAgICAgIHRydWUsXG4gICAgICAgICAgMTAwMixcbiAgICAgICAgICAnV1NfRVJSX0VYUEVDVEVEX01BU0snXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgfSBlbHNlIGlmICh0aGlzLl9tYXNrZWQpIHtcbiAgICAgIHRoaXMuX2xvb3AgPSBmYWxzZTtcbiAgICAgIHJldHVybiBlcnJvcihcbiAgICAgICAgUmFuZ2VFcnJvcixcbiAgICAgICAgJ01BU0sgbXVzdCBiZSBjbGVhcicsXG4gICAgICAgIHRydWUsXG4gICAgICAgIDEwMDIsXG4gICAgICAgICdXU19FUlJfVU5FWFBFQ1RFRF9NQVNLJ1xuICAgICAgKTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5fcGF5bG9hZExlbmd0aCA9PT0gMTI2KSB0aGlzLl9zdGF0ZSA9IEdFVF9QQVlMT0FEX0xFTkdUSF8xNjtcbiAgICBlbHNlIGlmICh0aGlzLl9wYXlsb2FkTGVuZ3RoID09PSAxMjcpIHRoaXMuX3N0YXRlID0gR0VUX1BBWUxPQURfTEVOR1RIXzY0O1xuICAgIGVsc2UgcmV0dXJuIHRoaXMuaGF2ZUxlbmd0aCgpO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldHMgZXh0ZW5kZWQgcGF5bG9hZCBsZW5ndGggKDcrMTYpLlxuICAgKlxuICAgKiBAcmV0dXJuIHsoUmFuZ2VFcnJvcnx1bmRlZmluZWQpfSBBIHBvc3NpYmxlIGVycm9yXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBnZXRQYXlsb2FkTGVuZ3RoMTYoKSB7XG4gICAgaWYgKHRoaXMuX2J1ZmZlcmVkQnl0ZXMgPCAyKSB7XG4gICAgICB0aGlzLl9sb29wID0gZmFsc2U7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdGhpcy5fcGF5bG9hZExlbmd0aCA9IHRoaXMuY29uc3VtZSgyKS5yZWFkVUludDE2QkUoMCk7XG4gICAgcmV0dXJuIHRoaXMuaGF2ZUxlbmd0aCgpO1xuICB9XG5cbiAgLyoqXG4gICAqIEdldHMgZXh0ZW5kZWQgcGF5bG9hZCBsZW5ndGggKDcrNjQpLlxuICAgKlxuICAgKiBAcmV0dXJuIHsoUmFuZ2VFcnJvcnx1bmRlZmluZWQpfSBBIHBvc3NpYmxlIGVycm9yXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBnZXRQYXlsb2FkTGVuZ3RoNjQoKSB7XG4gICAgaWYgKHRoaXMuX2J1ZmZlcmVkQnl0ZXMgPCA4KSB7XG4gICAgICB0aGlzLl9sb29wID0gZmFsc2U7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3QgYnVmID0gdGhpcy5jb25zdW1lKDgpO1xuICAgIGNvbnN0IG51bSA9IGJ1Zi5yZWFkVUludDMyQkUoMCk7XG5cbiAgICAvL1xuICAgIC8vIFRoZSBtYXhpbXVtIHNhZmUgaW50ZWdlciBpbiBKYXZhU2NyaXB0IGlzIDJeNTMgLSAxLiBBbiBlcnJvciBpcyByZXR1cm5lZFxuICAgIC8vIGlmIHBheWxvYWQgbGVuZ3RoIGlzIGdyZWF0ZXIgdGhhbiB0aGlzIG51bWJlci5cbiAgICAvL1xuICAgIGlmIChudW0gPiBNYXRoLnBvdygyLCA1MyAtIDMyKSAtIDEpIHtcbiAgICAgIHRoaXMuX2xvb3AgPSBmYWxzZTtcbiAgICAgIHJldHVybiBlcnJvcihcbiAgICAgICAgUmFuZ2VFcnJvcixcbiAgICAgICAgJ1Vuc3VwcG9ydGVkIFdlYlNvY2tldCBmcmFtZTogcGF5bG9hZCBsZW5ndGggPiAyXjUzIC0gMScsXG4gICAgICAgIGZhbHNlLFxuICAgICAgICAxMDA5LFxuICAgICAgICAnV1NfRVJSX1VOU1VQUE9SVEVEX0RBVEFfUEFZTE9BRF9MRU5HVEgnXG4gICAgICApO1xuICAgIH1cblxuICAgIHRoaXMuX3BheWxvYWRMZW5ndGggPSBudW0gKiBNYXRoLnBvdygyLCAzMikgKyBidWYucmVhZFVJbnQzMkJFKDQpO1xuICAgIHJldHVybiB0aGlzLmhhdmVMZW5ndGgoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBQYXlsb2FkIGxlbmd0aCBoYXMgYmVlbiByZWFkLlxuICAgKlxuICAgKiBAcmV0dXJuIHsoUmFuZ2VFcnJvcnx1bmRlZmluZWQpfSBBIHBvc3NpYmxlIGVycm9yXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBoYXZlTGVuZ3RoKCkge1xuICAgIGlmICh0aGlzLl9wYXlsb2FkTGVuZ3RoICYmIHRoaXMuX29wY29kZSA8IDB4MDgpIHtcbiAgICAgIHRoaXMuX3RvdGFsUGF5bG9hZExlbmd0aCArPSB0aGlzLl9wYXlsb2FkTGVuZ3RoO1xuICAgICAgaWYgKHRoaXMuX3RvdGFsUGF5bG9hZExlbmd0aCA+IHRoaXMuX21heFBheWxvYWQgJiYgdGhpcy5fbWF4UGF5bG9hZCA+IDApIHtcbiAgICAgICAgdGhpcy5fbG9vcCA9IGZhbHNlO1xuICAgICAgICByZXR1cm4gZXJyb3IoXG4gICAgICAgICAgUmFuZ2VFcnJvcixcbiAgICAgICAgICAnTWF4IHBheWxvYWQgc2l6ZSBleGNlZWRlZCcsXG4gICAgICAgICAgZmFsc2UsXG4gICAgICAgICAgMTAwOSxcbiAgICAgICAgICAnV1NfRVJSX1VOU1VQUE9SVEVEX01FU1NBR0VfTEVOR1RIJ1xuICAgICAgICApO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmICh0aGlzLl9tYXNrZWQpIHRoaXMuX3N0YXRlID0gR0VUX01BU0s7XG4gICAgZWxzZSB0aGlzLl9zdGF0ZSA9IEdFVF9EQVRBO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlYWRzIG1hc2sgYnl0ZXMuXG4gICAqXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBnZXRNYXNrKCkge1xuICAgIGlmICh0aGlzLl9idWZmZXJlZEJ5dGVzIDwgNCkge1xuICAgICAgdGhpcy5fbG9vcCA9IGZhbHNlO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRoaXMuX21hc2sgPSB0aGlzLmNvbnN1bWUoNCk7XG4gICAgdGhpcy5fc3RhdGUgPSBHRVRfREFUQTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZWFkcyBkYXRhIGJ5dGVzLlxuICAgKlxuICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBjYiBDYWxsYmFja1xuICAgKiBAcmV0dXJuIHsoRXJyb3J8UmFuZ2VFcnJvcnx1bmRlZmluZWQpfSBBIHBvc3NpYmxlIGVycm9yXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBnZXREYXRhKGNiKSB7XG4gICAgbGV0IGRhdGEgPSBFTVBUWV9CVUZGRVI7XG5cbiAgICBpZiAodGhpcy5fcGF5bG9hZExlbmd0aCkge1xuICAgICAgaWYgKHRoaXMuX2J1ZmZlcmVkQnl0ZXMgPCB0aGlzLl9wYXlsb2FkTGVuZ3RoKSB7XG4gICAgICAgIHRoaXMuX2xvb3AgPSBmYWxzZTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBkYXRhID0gdGhpcy5jb25zdW1lKHRoaXMuX3BheWxvYWRMZW5ndGgpO1xuXG4gICAgICBpZiAoXG4gICAgICAgIHRoaXMuX21hc2tlZCAmJlxuICAgICAgICAodGhpcy5fbWFza1swXSB8IHRoaXMuX21hc2tbMV0gfCB0aGlzLl9tYXNrWzJdIHwgdGhpcy5fbWFza1szXSkgIT09IDBcbiAgICAgICkge1xuICAgICAgICB1bm1hc2soZGF0YSwgdGhpcy5fbWFzayk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuX29wY29kZSA+IDB4MDcpIHJldHVybiB0aGlzLmNvbnRyb2xNZXNzYWdlKGRhdGEpO1xuXG4gICAgaWYgKHRoaXMuX2NvbXByZXNzZWQpIHtcbiAgICAgIHRoaXMuX3N0YXRlID0gSU5GTEFUSU5HO1xuICAgICAgdGhpcy5kZWNvbXByZXNzKGRhdGEsIGNiKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAoZGF0YS5sZW5ndGgpIHtcbiAgICAgIC8vXG4gICAgICAvLyBUaGlzIG1lc3NhZ2UgaXMgbm90IGNvbXByZXNzZWQgc28gaXRzIGxlbmd0aCBpcyB0aGUgc3VtIG9mIHRoZSBwYXlsb2FkXG4gICAgICAvLyBsZW5ndGggb2YgYWxsIGZyYWdtZW50cy5cbiAgICAgIC8vXG4gICAgICB0aGlzLl9tZXNzYWdlTGVuZ3RoID0gdGhpcy5fdG90YWxQYXlsb2FkTGVuZ3RoO1xuICAgICAgdGhpcy5fZnJhZ21lbnRzLnB1c2goZGF0YSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXMuZGF0YU1lc3NhZ2UoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBEZWNvbXByZXNzZXMgZGF0YS5cbiAgICpcbiAgICogQHBhcmFtIHtCdWZmZXJ9IGRhdGEgQ29tcHJlc3NlZCBkYXRhXG4gICAqIEBwYXJhbSB7RnVuY3Rpb259IGNiIENhbGxiYWNrXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBkZWNvbXByZXNzKGRhdGEsIGNiKSB7XG4gICAgY29uc3QgcGVyTWVzc2FnZURlZmxhdGUgPSB0aGlzLl9leHRlbnNpb25zW1Blck1lc3NhZ2VEZWZsYXRlLmV4dGVuc2lvbk5hbWVdO1xuXG4gICAgcGVyTWVzc2FnZURlZmxhdGUuZGVjb21wcmVzcyhkYXRhLCB0aGlzLl9maW4sIChlcnIsIGJ1ZikgPT4ge1xuICAgICAgaWYgKGVycikgcmV0dXJuIGNiKGVycik7XG5cbiAgICAgIGlmIChidWYubGVuZ3RoKSB7XG4gICAgICAgIHRoaXMuX21lc3NhZ2VMZW5ndGggKz0gYnVmLmxlbmd0aDtcbiAgICAgICAgaWYgKHRoaXMuX21lc3NhZ2VMZW5ndGggPiB0aGlzLl9tYXhQYXlsb2FkICYmIHRoaXMuX21heFBheWxvYWQgPiAwKSB7XG4gICAgICAgICAgcmV0dXJuIGNiKFxuICAgICAgICAgICAgZXJyb3IoXG4gICAgICAgICAgICAgIFJhbmdlRXJyb3IsXG4gICAgICAgICAgICAgICdNYXggcGF5bG9hZCBzaXplIGV4Y2VlZGVkJyxcbiAgICAgICAgICAgICAgZmFsc2UsXG4gICAgICAgICAgICAgIDEwMDksXG4gICAgICAgICAgICAgICdXU19FUlJfVU5TVVBQT1JURURfTUVTU0FHRV9MRU5HVEgnXG4gICAgICAgICAgICApXG4gICAgICAgICAgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuX2ZyYWdtZW50cy5wdXNoKGJ1Zik7XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IGVyID0gdGhpcy5kYXRhTWVzc2FnZSgpO1xuICAgICAgaWYgKGVyKSByZXR1cm4gY2IoZXIpO1xuXG4gICAgICB0aGlzLnN0YXJ0TG9vcChjYik7XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogSGFuZGxlcyBhIGRhdGEgbWVzc2FnZS5cbiAgICpcbiAgICogQHJldHVybiB7KEVycm9yfHVuZGVmaW5lZCl9IEEgcG9zc2libGUgZXJyb3JcbiAgICogQHByaXZhdGVcbiAgICovXG4gIGRhdGFNZXNzYWdlKCkge1xuICAgIGlmICh0aGlzLl9maW4pIHtcbiAgICAgIGNvbnN0IG1lc3NhZ2VMZW5ndGggPSB0aGlzLl9tZXNzYWdlTGVuZ3RoO1xuICAgICAgY29uc3QgZnJhZ21lbnRzID0gdGhpcy5fZnJhZ21lbnRzO1xuXG4gICAgICB0aGlzLl90b3RhbFBheWxvYWRMZW5ndGggPSAwO1xuICAgICAgdGhpcy5fbWVzc2FnZUxlbmd0aCA9IDA7XG4gICAgICB0aGlzLl9mcmFnbWVudGVkID0gMDtcbiAgICAgIHRoaXMuX2ZyYWdtZW50cyA9IFtdO1xuXG4gICAgICBpZiAodGhpcy5fb3Bjb2RlID09PSAyKSB7XG4gICAgICAgIGxldCBkYXRhO1xuXG4gICAgICAgIGlmICh0aGlzLl9iaW5hcnlUeXBlID09PSAnbm9kZWJ1ZmZlcicpIHtcbiAgICAgICAgICBkYXRhID0gY29uY2F0KGZyYWdtZW50cywgbWVzc2FnZUxlbmd0aCk7XG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5fYmluYXJ5VHlwZSA9PT0gJ2FycmF5YnVmZmVyJykge1xuICAgICAgICAgIGRhdGEgPSB0b0FycmF5QnVmZmVyKGNvbmNhdChmcmFnbWVudHMsIG1lc3NhZ2VMZW5ndGgpKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBkYXRhID0gZnJhZ21lbnRzO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5lbWl0KCdtZXNzYWdlJywgZGF0YSwgdHJ1ZSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zdCBidWYgPSBjb25jYXQoZnJhZ21lbnRzLCBtZXNzYWdlTGVuZ3RoKTtcblxuICAgICAgICBpZiAoIXRoaXMuX3NraXBVVEY4VmFsaWRhdGlvbiAmJiAhaXNWYWxpZFVURjgoYnVmKSkge1xuICAgICAgICAgIHRoaXMuX2xvb3AgPSBmYWxzZTtcbiAgICAgICAgICByZXR1cm4gZXJyb3IoXG4gICAgICAgICAgICBFcnJvcixcbiAgICAgICAgICAgICdpbnZhbGlkIFVURi04IHNlcXVlbmNlJyxcbiAgICAgICAgICAgIHRydWUsXG4gICAgICAgICAgICAxMDA3LFxuICAgICAgICAgICAgJ1dTX0VSUl9JTlZBTElEX1VURjgnXG4gICAgICAgICAgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuZW1pdCgnbWVzc2FnZScsIGJ1ZiwgZmFsc2UpO1xuICAgICAgfVxuICAgIH1cblxuICAgIHRoaXMuX3N0YXRlID0gR0VUX0lORk87XG4gIH1cblxuICAvKipcbiAgICogSGFuZGxlcyBhIGNvbnRyb2wgbWVzc2FnZS5cbiAgICpcbiAgICogQHBhcmFtIHtCdWZmZXJ9IGRhdGEgRGF0YSB0byBoYW5kbGVcbiAgICogQHJldHVybiB7KEVycm9yfFJhbmdlRXJyb3J8dW5kZWZpbmVkKX0gQSBwb3NzaWJsZSBlcnJvclxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgY29udHJvbE1lc3NhZ2UoZGF0YSkge1xuICAgIGlmICh0aGlzLl9vcGNvZGUgPT09IDB4MDgpIHtcbiAgICAgIHRoaXMuX2xvb3AgPSBmYWxzZTtcblxuICAgICAgaWYgKGRhdGEubGVuZ3RoID09PSAwKSB7XG4gICAgICAgIHRoaXMuZW1pdCgnY29uY2x1ZGUnLCAxMDA1LCBFTVBUWV9CVUZGRVIpO1xuICAgICAgICB0aGlzLmVuZCgpO1xuICAgICAgfSBlbHNlIGlmIChkYXRhLmxlbmd0aCA9PT0gMSkge1xuICAgICAgICByZXR1cm4gZXJyb3IoXG4gICAgICAgICAgUmFuZ2VFcnJvcixcbiAgICAgICAgICAnaW52YWxpZCBwYXlsb2FkIGxlbmd0aCAxJyxcbiAgICAgICAgICB0cnVlLFxuICAgICAgICAgIDEwMDIsXG4gICAgICAgICAgJ1dTX0VSUl9JTlZBTElEX0NPTlRST0xfUEFZTE9BRF9MRU5HVEgnXG4gICAgICAgICk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zdCBjb2RlID0gZGF0YS5yZWFkVUludDE2QkUoMCk7XG5cbiAgICAgICAgaWYgKCFpc1ZhbGlkU3RhdHVzQ29kZShjb2RlKSkge1xuICAgICAgICAgIHJldHVybiBlcnJvcihcbiAgICAgICAgICAgIFJhbmdlRXJyb3IsXG4gICAgICAgICAgICBgaW52YWxpZCBzdGF0dXMgY29kZSAke2NvZGV9YCxcbiAgICAgICAgICAgIHRydWUsXG4gICAgICAgICAgICAxMDAyLFxuICAgICAgICAgICAgJ1dTX0VSUl9JTlZBTElEX0NMT1NFX0NPREUnXG4gICAgICAgICAgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGJ1ZiA9IGRhdGEuc2xpY2UoMik7XG5cbiAgICAgICAgaWYgKCF0aGlzLl9za2lwVVRGOFZhbGlkYXRpb24gJiYgIWlzVmFsaWRVVEY4KGJ1ZikpIHtcbiAgICAgICAgICByZXR1cm4gZXJyb3IoXG4gICAgICAgICAgICBFcnJvcixcbiAgICAgICAgICAgICdpbnZhbGlkIFVURi04IHNlcXVlbmNlJyxcbiAgICAgICAgICAgIHRydWUsXG4gICAgICAgICAgICAxMDA3LFxuICAgICAgICAgICAgJ1dTX0VSUl9JTlZBTElEX1VURjgnXG4gICAgICAgICAgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuZW1pdCgnY29uY2x1ZGUnLCBjb2RlLCBidWYpO1xuICAgICAgICB0aGlzLmVuZCgpO1xuICAgICAgfVxuICAgIH0gZWxzZSBpZiAodGhpcy5fb3Bjb2RlID09PSAweDA5KSB7XG4gICAgICB0aGlzLmVtaXQoJ3BpbmcnLCBkYXRhKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5lbWl0KCdwb25nJywgZGF0YSk7XG4gICAgfVxuXG4gICAgdGhpcy5fc3RhdGUgPSBHRVRfSU5GTztcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFJlY2VpdmVyO1xuXG4vKipcbiAqIEJ1aWxkcyBhbiBlcnJvciBvYmplY3QuXG4gKlxuICogQHBhcmFtIHtmdW5jdGlvbihuZXc6RXJyb3J8UmFuZ2VFcnJvcil9IEVycm9yQ3RvciBUaGUgZXJyb3IgY29uc3RydWN0b3JcbiAqIEBwYXJhbSB7U3RyaW5nfSBtZXNzYWdlIFRoZSBlcnJvciBtZXNzYWdlXG4gKiBAcGFyYW0ge0Jvb2xlYW59IHByZWZpeCBTcGVjaWZpZXMgd2hldGhlciBvciBub3QgdG8gYWRkIGEgZGVmYXVsdCBwcmVmaXggdG9cbiAqICAgICBgbWVzc2FnZWBcbiAqIEBwYXJhbSB7TnVtYmVyfSBzdGF0dXNDb2RlIFRoZSBzdGF0dXMgY29kZVxuICogQHBhcmFtIHtTdHJpbmd9IGVycm9yQ29kZSBUaGUgZXhwb3NlZCBlcnJvciBjb2RlXG4gKiBAcmV0dXJuIHsoRXJyb3J8UmFuZ2VFcnJvcil9IFRoZSBlcnJvclxuICogQHByaXZhdGVcbiAqL1xuZnVuY3Rpb24gZXJyb3IoRXJyb3JDdG9yLCBtZXNzYWdlLCBwcmVmaXgsIHN0YXR1c0NvZGUsIGVycm9yQ29kZSkge1xuICBjb25zdCBlcnIgPSBuZXcgRXJyb3JDdG9yKFxuICAgIHByZWZpeCA/IGBJbnZhbGlkIFdlYlNvY2tldCBmcmFtZTogJHttZXNzYWdlfWAgOiBtZXNzYWdlXG4gICk7XG5cbiAgRXJyb3IuY2FwdHVyZVN0YWNrVHJhY2UoZXJyLCBlcnJvcik7XG4gIGVyci5jb2RlID0gZXJyb3JDb2RlO1xuICBlcnJba1N0YXR1c0NvZGVdID0gc3RhdHVzQ29kZTtcbiAgcmV0dXJuIGVycjtcbn1cbiIsIi8qIGVzbGludCBuby11bnVzZWQtdmFyczogW1wiZXJyb3JcIiwgeyBcInZhcnNJZ25vcmVQYXR0ZXJuXCI6IFwiXm5ldHx0bHMkXCIgfV0gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG5jb25zdCBuZXQgPSByZXF1aXJlKCduZXQnKTtcbmNvbnN0IHRscyA9IHJlcXVpcmUoJ3RscycpO1xuY29uc3QgeyByYW5kb21GaWxsU3luYyB9ID0gcmVxdWlyZSgnY3J5cHRvJyk7XG5cbmNvbnN0IFBlck1lc3NhZ2VEZWZsYXRlID0gcmVxdWlyZSgnLi9wZXJtZXNzYWdlLWRlZmxhdGUnKTtcbmNvbnN0IHsgRU1QVFlfQlVGRkVSIH0gPSByZXF1aXJlKCcuL2NvbnN0YW50cycpO1xuY29uc3QgeyBpc1ZhbGlkU3RhdHVzQ29kZSB9ID0gcmVxdWlyZSgnLi92YWxpZGF0aW9uJyk7XG5jb25zdCB7IG1hc2s6IGFwcGx5TWFzaywgdG9CdWZmZXIgfSA9IHJlcXVpcmUoJy4vYnVmZmVyLXV0aWwnKTtcblxuY29uc3QgbWFza0J1ZmZlciA9IEJ1ZmZlci5hbGxvYyg0KTtcblxuLyoqXG4gKiBIeUJpIFNlbmRlciBpbXBsZW1lbnRhdGlvbi5cbiAqL1xuY2xhc3MgU2VuZGVyIHtcbiAgLyoqXG4gICAqIENyZWF0ZXMgYSBTZW5kZXIgaW5zdGFuY2UuXG4gICAqXG4gICAqIEBwYXJhbSB7KG5ldC5Tb2NrZXR8dGxzLlNvY2tldCl9IHNvY2tldCBUaGUgY29ubmVjdGlvbiBzb2NrZXRcbiAgICogQHBhcmFtIHtPYmplY3R9IFtleHRlbnNpb25zXSBBbiBvYmplY3QgY29udGFpbmluZyB0aGUgbmVnb3RpYXRlZCBleHRlbnNpb25zXG4gICAqIEBwYXJhbSB7RnVuY3Rpb259IFtnZW5lcmF0ZU1hc2tdIFRoZSBmdW5jdGlvbiB1c2VkIHRvIGdlbmVyYXRlIHRoZSBtYXNraW5nXG4gICAqICAgICBrZXlcbiAgICovXG4gIGNvbnN0cnVjdG9yKHNvY2tldCwgZXh0ZW5zaW9ucywgZ2VuZXJhdGVNYXNrKSB7XG4gICAgdGhpcy5fZXh0ZW5zaW9ucyA9IGV4dGVuc2lvbnMgfHwge307XG5cbiAgICBpZiAoZ2VuZXJhdGVNYXNrKSB7XG4gICAgICB0aGlzLl9nZW5lcmF0ZU1hc2sgPSBnZW5lcmF0ZU1hc2s7XG4gICAgICB0aGlzLl9tYXNrQnVmZmVyID0gQnVmZmVyLmFsbG9jKDQpO1xuICAgIH1cblxuICAgIHRoaXMuX3NvY2tldCA9IHNvY2tldDtcblxuICAgIHRoaXMuX2ZpcnN0RnJhZ21lbnQgPSB0cnVlO1xuICAgIHRoaXMuX2NvbXByZXNzID0gZmFsc2U7XG5cbiAgICB0aGlzLl9idWZmZXJlZEJ5dGVzID0gMDtcbiAgICB0aGlzLl9kZWZsYXRpbmcgPSBmYWxzZTtcbiAgICB0aGlzLl9xdWV1ZSA9IFtdO1xuICB9XG5cbiAgLyoqXG4gICAqIEZyYW1lcyBhIHBpZWNlIG9mIGRhdGEgYWNjb3JkaW5nIHRvIHRoZSBIeUJpIFdlYlNvY2tldCBwcm90b2NvbC5cbiAgICpcbiAgICogQHBhcmFtIHtCdWZmZXJ9IGRhdGEgVGhlIGRhdGEgdG8gZnJhbWVcbiAgICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnMgT3B0aW9ucyBvYmplY3RcbiAgICogQHBhcmFtIHtCb29sZWFufSBbb3B0aW9ucy5maW49ZmFsc2VdIFNwZWNpZmllcyB3aGV0aGVyIG9yIG5vdCB0byBzZXQgdGhlXG4gICAqICAgICBGSU4gYml0XG4gICAqIEBwYXJhbSB7RnVuY3Rpb259IFtvcHRpb25zLmdlbmVyYXRlTWFza10gVGhlIGZ1bmN0aW9uIHVzZWQgdG8gZ2VuZXJhdGUgdGhlXG4gICAqICAgICBtYXNraW5nIGtleVxuICAgKiBAcGFyYW0ge0Jvb2xlYW59IFtvcHRpb25zLm1hc2s9ZmFsc2VdIFNwZWNpZmllcyB3aGV0aGVyIG9yIG5vdCB0byBtYXNrXG4gICAqICAgICBgZGF0YWBcbiAgICogQHBhcmFtIHtCdWZmZXJ9IFtvcHRpb25zLm1hc2tCdWZmZXJdIFRoZSBidWZmZXIgdXNlZCB0byBzdG9yZSB0aGUgbWFza2luZ1xuICAgKiAgICAga2V5XG4gICAqIEBwYXJhbSB7TnVtYmVyfSBvcHRpb25zLm9wY29kZSBUaGUgb3Bjb2RlXG4gICAqIEBwYXJhbSB7Qm9vbGVhbn0gW29wdGlvbnMucmVhZE9ubHk9ZmFsc2VdIFNwZWNpZmllcyB3aGV0aGVyIGBkYXRhYCBjYW4gYmVcbiAgICogICAgIG1vZGlmaWVkXG4gICAqIEBwYXJhbSB7Qm9vbGVhbn0gW29wdGlvbnMucnN2MT1mYWxzZV0gU3BlY2lmaWVzIHdoZXRoZXIgb3Igbm90IHRvIHNldCB0aGVcbiAgICogICAgIFJTVjEgYml0XG4gICAqIEByZXR1cm4ge0J1ZmZlcltdfSBUaGUgZnJhbWVkIGRhdGEgYXMgYSBsaXN0IG9mIGBCdWZmZXJgIGluc3RhbmNlc1xuICAgKiBAcHVibGljXG4gICAqL1xuICBzdGF0aWMgZnJhbWUoZGF0YSwgb3B0aW9ucykge1xuICAgIGxldCBtYXNrO1xuICAgIGxldCBtZXJnZSA9IGZhbHNlO1xuICAgIGxldCBvZmZzZXQgPSAyO1xuICAgIGxldCBza2lwTWFza2luZyA9IGZhbHNlO1xuXG4gICAgaWYgKG9wdGlvbnMubWFzaykge1xuICAgICAgbWFzayA9IG9wdGlvbnMubWFza0J1ZmZlciB8fCBtYXNrQnVmZmVyO1xuXG4gICAgICBpZiAob3B0aW9ucy5nZW5lcmF0ZU1hc2spIHtcbiAgICAgICAgb3B0aW9ucy5nZW5lcmF0ZU1hc2sobWFzayk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByYW5kb21GaWxsU3luYyhtYXNrLCAwLCA0KTtcbiAgICAgIH1cblxuICAgICAgc2tpcE1hc2tpbmcgPSAobWFza1swXSB8IG1hc2tbMV0gfCBtYXNrWzJdIHwgbWFza1szXSkgPT09IDA7XG4gICAgICBpZiAob3B0aW9ucy5yZWFkT25seSAmJiAhc2tpcE1hc2tpbmcpIG1lcmdlID0gdHJ1ZTtcblxuICAgICAgb2Zmc2V0ID0gNjtcbiAgICB9XG5cbiAgICBsZXQgcGF5bG9hZExlbmd0aCA9IGRhdGEubGVuZ3RoO1xuXG4gICAgaWYgKGRhdGEubGVuZ3RoID49IDY1NTM2KSB7XG4gICAgICBvZmZzZXQgKz0gODtcbiAgICAgIHBheWxvYWRMZW5ndGggPSAxMjc7XG4gICAgfSBlbHNlIGlmIChkYXRhLmxlbmd0aCA+IDEyNSkge1xuICAgICAgb2Zmc2V0ICs9IDI7XG4gICAgICBwYXlsb2FkTGVuZ3RoID0gMTI2O1xuICAgIH1cblxuICAgIGNvbnN0IHRhcmdldCA9IEJ1ZmZlci5hbGxvY1Vuc2FmZShtZXJnZSA/IGRhdGEubGVuZ3RoICsgb2Zmc2V0IDogb2Zmc2V0KTtcblxuICAgIHRhcmdldFswXSA9IG9wdGlvbnMuZmluID8gb3B0aW9ucy5vcGNvZGUgfCAweDgwIDogb3B0aW9ucy5vcGNvZGU7XG4gICAgaWYgKG9wdGlvbnMucnN2MSkgdGFyZ2V0WzBdIHw9IDB4NDA7XG5cbiAgICB0YXJnZXRbMV0gPSBwYXlsb2FkTGVuZ3RoO1xuXG4gICAgaWYgKHBheWxvYWRMZW5ndGggPT09IDEyNikge1xuICAgICAgdGFyZ2V0LndyaXRlVUludDE2QkUoZGF0YS5sZW5ndGgsIDIpO1xuICAgIH0gZWxzZSBpZiAocGF5bG9hZExlbmd0aCA9PT0gMTI3KSB7XG4gICAgICB0YXJnZXRbMl0gPSB0YXJnZXRbM10gPSAwO1xuICAgICAgdGFyZ2V0LndyaXRlVUludEJFKGRhdGEubGVuZ3RoLCA0LCA2KTtcbiAgICB9XG5cbiAgICBpZiAoIW9wdGlvbnMubWFzaykgcmV0dXJuIFt0YXJnZXQsIGRhdGFdO1xuXG4gICAgdGFyZ2V0WzFdIHw9IDB4ODA7XG4gICAgdGFyZ2V0W29mZnNldCAtIDRdID0gbWFza1swXTtcbiAgICB0YXJnZXRbb2Zmc2V0IC0gM10gPSBtYXNrWzFdO1xuICAgIHRhcmdldFtvZmZzZXQgLSAyXSA9IG1hc2tbMl07XG4gICAgdGFyZ2V0W29mZnNldCAtIDFdID0gbWFza1szXTtcblxuICAgIGlmIChza2lwTWFza2luZykgcmV0dXJuIFt0YXJnZXQsIGRhdGFdO1xuXG4gICAgaWYgKG1lcmdlKSB7XG4gICAgICBhcHBseU1hc2soZGF0YSwgbWFzaywgdGFyZ2V0LCBvZmZzZXQsIGRhdGEubGVuZ3RoKTtcbiAgICAgIHJldHVybiBbdGFyZ2V0XTtcbiAgICB9XG5cbiAgICBhcHBseU1hc2soZGF0YSwgbWFzaywgZGF0YSwgMCwgZGF0YS5sZW5ndGgpO1xuICAgIHJldHVybiBbdGFyZ2V0LCBkYXRhXTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZW5kcyBhIGNsb3NlIG1lc3NhZ2UgdG8gdGhlIG90aGVyIHBlZXIuXG4gICAqXG4gICAqIEBwYXJhbSB7TnVtYmVyfSBbY29kZV0gVGhlIHN0YXR1cyBjb2RlIGNvbXBvbmVudCBvZiB0aGUgYm9keVxuICAgKiBAcGFyYW0geyhTdHJpbmd8QnVmZmVyKX0gW2RhdGFdIFRoZSBtZXNzYWdlIGNvbXBvbmVudCBvZiB0aGUgYm9keVxuICAgKiBAcGFyYW0ge0Jvb2xlYW59IFttYXNrPWZhbHNlXSBTcGVjaWZpZXMgd2hldGhlciBvciBub3QgdG8gbWFzayB0aGUgbWVzc2FnZVxuICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBbY2JdIENhbGxiYWNrXG4gICAqIEBwdWJsaWNcbiAgICovXG4gIGNsb3NlKGNvZGUsIGRhdGEsIG1hc2ssIGNiKSB7XG4gICAgbGV0IGJ1ZjtcblxuICAgIGlmIChjb2RlID09PSB1bmRlZmluZWQpIHtcbiAgICAgIGJ1ZiA9IEVNUFRZX0JVRkZFUjtcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBjb2RlICE9PSAnbnVtYmVyJyB8fCAhaXNWYWxpZFN0YXR1c0NvZGUoY29kZSkpIHtcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0ZpcnN0IGFyZ3VtZW50IG11c3QgYmUgYSB2YWxpZCBlcnJvciBjb2RlIG51bWJlcicpO1xuICAgIH0gZWxzZSBpZiAoZGF0YSA9PT0gdW5kZWZpbmVkIHx8ICFkYXRhLmxlbmd0aCkge1xuICAgICAgYnVmID0gQnVmZmVyLmFsbG9jVW5zYWZlKDIpO1xuICAgICAgYnVmLndyaXRlVUludDE2QkUoY29kZSwgMCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnN0IGxlbmd0aCA9IEJ1ZmZlci5ieXRlTGVuZ3RoKGRhdGEpO1xuXG4gICAgICBpZiAobGVuZ3RoID4gMTIzKSB7XG4gICAgICAgIHRocm93IG5ldyBSYW5nZUVycm9yKCdUaGUgbWVzc2FnZSBtdXN0IG5vdCBiZSBncmVhdGVyIHRoYW4gMTIzIGJ5dGVzJyk7XG4gICAgICB9XG5cbiAgICAgIGJ1ZiA9IEJ1ZmZlci5hbGxvY1Vuc2FmZSgyICsgbGVuZ3RoKTtcbiAgICAgIGJ1Zi53cml0ZVVJbnQxNkJFKGNvZGUsIDApO1xuXG4gICAgICBpZiAodHlwZW9mIGRhdGEgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgIGJ1Zi53cml0ZShkYXRhLCAyKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGJ1Zi5zZXQoZGF0YSwgMik7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuX2RlZmxhdGluZykge1xuICAgICAgdGhpcy5lbnF1ZXVlKFt0aGlzLmRvQ2xvc2UsIGJ1ZiwgbWFzaywgY2JdKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5kb0Nsb3NlKGJ1ZiwgbWFzaywgY2IpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBGcmFtZXMgYW5kIHNlbmRzIGEgY2xvc2UgbWVzc2FnZS5cbiAgICpcbiAgICogQHBhcmFtIHtCdWZmZXJ9IGRhdGEgVGhlIG1lc3NhZ2UgdG8gc2VuZFxuICAgKiBAcGFyYW0ge0Jvb2xlYW59IFttYXNrPWZhbHNlXSBTcGVjaWZpZXMgd2hldGhlciBvciBub3QgdG8gbWFzayBgZGF0YWBcbiAgICogQHBhcmFtIHtGdW5jdGlvbn0gW2NiXSBDYWxsYmFja1xuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgZG9DbG9zZShkYXRhLCBtYXNrLCBjYikge1xuICAgIHRoaXMuc2VuZEZyYW1lKFxuICAgICAgU2VuZGVyLmZyYW1lKGRhdGEsIHtcbiAgICAgICAgZmluOiB0cnVlLFxuICAgICAgICByc3YxOiBmYWxzZSxcbiAgICAgICAgb3Bjb2RlOiAweDA4LFxuICAgICAgICBtYXNrLFxuICAgICAgICBtYXNrQnVmZmVyOiB0aGlzLl9tYXNrQnVmZmVyLFxuICAgICAgICBnZW5lcmF0ZU1hc2s6IHRoaXMuX2dlbmVyYXRlTWFzayxcbiAgICAgICAgcmVhZE9ubHk6IGZhbHNlXG4gICAgICB9KSxcbiAgICAgIGNiXG4gICAgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZW5kcyBhIHBpbmcgbWVzc2FnZSB0byB0aGUgb3RoZXIgcGVlci5cbiAgICpcbiAgICogQHBhcmFtIHsqfSBkYXRhIFRoZSBtZXNzYWdlIHRvIHNlbmRcbiAgICogQHBhcmFtIHtCb29sZWFufSBbbWFzaz1mYWxzZV0gU3BlY2lmaWVzIHdoZXRoZXIgb3Igbm90IHRvIG1hc2sgYGRhdGFgXG4gICAqIEBwYXJhbSB7RnVuY3Rpb259IFtjYl0gQ2FsbGJhY2tcbiAgICogQHB1YmxpY1xuICAgKi9cbiAgcGluZyhkYXRhLCBtYXNrLCBjYikge1xuICAgIGNvbnN0IGJ1ZiA9IHRvQnVmZmVyKGRhdGEpO1xuXG4gICAgaWYgKGJ1Zi5sZW5ndGggPiAxMjUpIHtcbiAgICAgIHRocm93IG5ldyBSYW5nZUVycm9yKCdUaGUgZGF0YSBzaXplIG11c3Qgbm90IGJlIGdyZWF0ZXIgdGhhbiAxMjUgYnl0ZXMnKTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5fZGVmbGF0aW5nKSB7XG4gICAgICB0aGlzLmVucXVldWUoW3RoaXMuZG9QaW5nLCBidWYsIG1hc2ssIHRvQnVmZmVyLnJlYWRPbmx5LCBjYl0pO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmRvUGluZyhidWYsIG1hc2ssIHRvQnVmZmVyLnJlYWRPbmx5LCBjYik7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEZyYW1lcyBhbmQgc2VuZHMgYSBwaW5nIG1lc3NhZ2UuXG4gICAqXG4gICAqIEBwYXJhbSB7QnVmZmVyfSBkYXRhIFRoZSBtZXNzYWdlIHRvIHNlbmRcbiAgICogQHBhcmFtIHtCb29sZWFufSBbbWFzaz1mYWxzZV0gU3BlY2lmaWVzIHdoZXRoZXIgb3Igbm90IHRvIG1hc2sgYGRhdGFgXG4gICAqIEBwYXJhbSB7Qm9vbGVhbn0gW3JlYWRPbmx5PWZhbHNlXSBTcGVjaWZpZXMgd2hldGhlciBgZGF0YWAgY2FuIGJlIG1vZGlmaWVkXG4gICAqIEBwYXJhbSB7RnVuY3Rpb259IFtjYl0gQ2FsbGJhY2tcbiAgICogQHByaXZhdGVcbiAgICovXG4gIGRvUGluZyhkYXRhLCBtYXNrLCByZWFkT25seSwgY2IpIHtcbiAgICB0aGlzLnNlbmRGcmFtZShcbiAgICAgIFNlbmRlci5mcmFtZShkYXRhLCB7XG4gICAgICAgIGZpbjogdHJ1ZSxcbiAgICAgICAgcnN2MTogZmFsc2UsXG4gICAgICAgIG9wY29kZTogMHgwOSxcbiAgICAgICAgbWFzayxcbiAgICAgICAgbWFza0J1ZmZlcjogdGhpcy5fbWFza0J1ZmZlcixcbiAgICAgICAgZ2VuZXJhdGVNYXNrOiB0aGlzLl9nZW5lcmF0ZU1hc2ssXG4gICAgICAgIHJlYWRPbmx5XG4gICAgICB9KSxcbiAgICAgIGNiXG4gICAgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZW5kcyBhIHBvbmcgbWVzc2FnZSB0byB0aGUgb3RoZXIgcGVlci5cbiAgICpcbiAgICogQHBhcmFtIHsqfSBkYXRhIFRoZSBtZXNzYWdlIHRvIHNlbmRcbiAgICogQHBhcmFtIHtCb29sZWFufSBbbWFzaz1mYWxzZV0gU3BlY2lmaWVzIHdoZXRoZXIgb3Igbm90IHRvIG1hc2sgYGRhdGFgXG4gICAqIEBwYXJhbSB7RnVuY3Rpb259IFtjYl0gQ2FsbGJhY2tcbiAgICogQHB1YmxpY1xuICAgKi9cbiAgcG9uZyhkYXRhLCBtYXNrLCBjYikge1xuICAgIGNvbnN0IGJ1ZiA9IHRvQnVmZmVyKGRhdGEpO1xuXG4gICAgaWYgKGJ1Zi5sZW5ndGggPiAxMjUpIHtcbiAgICAgIHRocm93IG5ldyBSYW5nZUVycm9yKCdUaGUgZGF0YSBzaXplIG11c3Qgbm90IGJlIGdyZWF0ZXIgdGhhbiAxMjUgYnl0ZXMnKTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5fZGVmbGF0aW5nKSB7XG4gICAgICB0aGlzLmVucXVldWUoW3RoaXMuZG9Qb25nLCBidWYsIG1hc2ssIHRvQnVmZmVyLnJlYWRPbmx5LCBjYl0pO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmRvUG9uZyhidWYsIG1hc2ssIHRvQnVmZmVyLnJlYWRPbmx5LCBjYik7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEZyYW1lcyBhbmQgc2VuZHMgYSBwb25nIG1lc3NhZ2UuXG4gICAqXG4gICAqIEBwYXJhbSB7QnVmZmVyfSBkYXRhIFRoZSBtZXNzYWdlIHRvIHNlbmRcbiAgICogQHBhcmFtIHtCb29sZWFufSBbbWFzaz1mYWxzZV0gU3BlY2lmaWVzIHdoZXRoZXIgb3Igbm90IHRvIG1hc2sgYGRhdGFgXG4gICAqIEBwYXJhbSB7Qm9vbGVhbn0gW3JlYWRPbmx5PWZhbHNlXSBTcGVjaWZpZXMgd2hldGhlciBgZGF0YWAgY2FuIGJlIG1vZGlmaWVkXG4gICAqIEBwYXJhbSB7RnVuY3Rpb259IFtjYl0gQ2FsbGJhY2tcbiAgICogQHByaXZhdGVcbiAgICovXG4gIGRvUG9uZyhkYXRhLCBtYXNrLCByZWFkT25seSwgY2IpIHtcbiAgICB0aGlzLnNlbmRGcmFtZShcbiAgICAgIFNlbmRlci5mcmFtZShkYXRhLCB7XG4gICAgICAgIGZpbjogdHJ1ZSxcbiAgICAgICAgcnN2MTogZmFsc2UsXG4gICAgICAgIG9wY29kZTogMHgwYSxcbiAgICAgICAgbWFzayxcbiAgICAgICAgbWFza0J1ZmZlcjogdGhpcy5fbWFza0J1ZmZlcixcbiAgICAgICAgZ2VuZXJhdGVNYXNrOiB0aGlzLl9nZW5lcmF0ZU1hc2ssXG4gICAgICAgIHJlYWRPbmx5XG4gICAgICB9KSxcbiAgICAgIGNiXG4gICAgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZW5kcyBhIGRhdGEgbWVzc2FnZSB0byB0aGUgb3RoZXIgcGVlci5cbiAgICpcbiAgICogQHBhcmFtIHsqfSBkYXRhIFRoZSBtZXNzYWdlIHRvIHNlbmRcbiAgICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnMgT3B0aW9ucyBvYmplY3RcbiAgICogQHBhcmFtIHtCb29sZWFufSBbb3B0aW9ucy5iaW5hcnk9ZmFsc2VdIFNwZWNpZmllcyB3aGV0aGVyIGBkYXRhYCBpcyBiaW5hcnlcbiAgICogICAgIG9yIHRleHRcbiAgICogQHBhcmFtIHtCb29sZWFufSBbb3B0aW9ucy5jb21wcmVzcz1mYWxzZV0gU3BlY2lmaWVzIHdoZXRoZXIgb3Igbm90IHRvXG4gICAqICAgICBjb21wcmVzcyBgZGF0YWBcbiAgICogQHBhcmFtIHtCb29sZWFufSBbb3B0aW9ucy5maW49ZmFsc2VdIFNwZWNpZmllcyB3aGV0aGVyIHRoZSBmcmFnbWVudCBpcyB0aGVcbiAgICogICAgIGxhc3Qgb25lXG4gICAqIEBwYXJhbSB7Qm9vbGVhbn0gW29wdGlvbnMubWFzaz1mYWxzZV0gU3BlY2lmaWVzIHdoZXRoZXIgb3Igbm90IHRvIG1hc2tcbiAgICogICAgIGBkYXRhYFxuICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBbY2JdIENhbGxiYWNrXG4gICAqIEBwdWJsaWNcbiAgICovXG4gIHNlbmQoZGF0YSwgb3B0aW9ucywgY2IpIHtcbiAgICBjb25zdCBidWYgPSB0b0J1ZmZlcihkYXRhKTtcbiAgICBjb25zdCBwZXJNZXNzYWdlRGVmbGF0ZSA9IHRoaXMuX2V4dGVuc2lvbnNbUGVyTWVzc2FnZURlZmxhdGUuZXh0ZW5zaW9uTmFtZV07XG4gICAgbGV0IG9wY29kZSA9IG9wdGlvbnMuYmluYXJ5ID8gMiA6IDE7XG4gICAgbGV0IHJzdjEgPSBvcHRpb25zLmNvbXByZXNzO1xuXG4gICAgaWYgKHRoaXMuX2ZpcnN0RnJhZ21lbnQpIHtcbiAgICAgIHRoaXMuX2ZpcnN0RnJhZ21lbnQgPSBmYWxzZTtcbiAgICAgIGlmIChcbiAgICAgICAgcnN2MSAmJlxuICAgICAgICBwZXJNZXNzYWdlRGVmbGF0ZSAmJlxuICAgICAgICBwZXJNZXNzYWdlRGVmbGF0ZS5wYXJhbXNbXG4gICAgICAgICAgcGVyTWVzc2FnZURlZmxhdGUuX2lzU2VydmVyXG4gICAgICAgICAgICA/ICdzZXJ2ZXJfbm9fY29udGV4dF90YWtlb3ZlcidcbiAgICAgICAgICAgIDogJ2NsaWVudF9ub19jb250ZXh0X3Rha2VvdmVyJ1xuICAgICAgICBdXG4gICAgICApIHtcbiAgICAgICAgcnN2MSA9IGJ1Zi5sZW5ndGggPj0gcGVyTWVzc2FnZURlZmxhdGUuX3RocmVzaG9sZDtcbiAgICAgIH1cbiAgICAgIHRoaXMuX2NvbXByZXNzID0gcnN2MTtcbiAgICB9IGVsc2Uge1xuICAgICAgcnN2MSA9IGZhbHNlO1xuICAgICAgb3Bjb2RlID0gMDtcbiAgICB9XG5cbiAgICBpZiAob3B0aW9ucy5maW4pIHRoaXMuX2ZpcnN0RnJhZ21lbnQgPSB0cnVlO1xuXG4gICAgaWYgKHBlck1lc3NhZ2VEZWZsYXRlKSB7XG4gICAgICBjb25zdCBvcHRzID0ge1xuICAgICAgICBmaW46IG9wdGlvbnMuZmluLFxuICAgICAgICByc3YxLFxuICAgICAgICBvcGNvZGUsXG4gICAgICAgIG1hc2s6IG9wdGlvbnMubWFzayxcbiAgICAgICAgbWFza0J1ZmZlcjogdGhpcy5fbWFza0J1ZmZlcixcbiAgICAgICAgZ2VuZXJhdGVNYXNrOiB0aGlzLl9nZW5lcmF0ZU1hc2ssXG4gICAgICAgIHJlYWRPbmx5OiB0b0J1ZmZlci5yZWFkT25seVxuICAgICAgfTtcblxuICAgICAgaWYgKHRoaXMuX2RlZmxhdGluZykge1xuICAgICAgICB0aGlzLmVucXVldWUoW3RoaXMuZGlzcGF0Y2gsIGJ1ZiwgdGhpcy5fY29tcHJlc3MsIG9wdHMsIGNiXSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLmRpc3BhdGNoKGJ1ZiwgdGhpcy5fY29tcHJlc3MsIG9wdHMsIGNiKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5zZW5kRnJhbWUoXG4gICAgICAgIFNlbmRlci5mcmFtZShidWYsIHtcbiAgICAgICAgICBmaW46IG9wdGlvbnMuZmluLFxuICAgICAgICAgIHJzdjE6IGZhbHNlLFxuICAgICAgICAgIG9wY29kZSxcbiAgICAgICAgICBtYXNrOiBvcHRpb25zLm1hc2ssXG4gICAgICAgICAgbWFza0J1ZmZlcjogdGhpcy5fbWFza0J1ZmZlcixcbiAgICAgICAgICBnZW5lcmF0ZU1hc2s6IHRoaXMuX2dlbmVyYXRlTWFzayxcbiAgICAgICAgICByZWFkT25seTogdG9CdWZmZXIucmVhZE9ubHlcbiAgICAgICAgfSksXG4gICAgICAgIGNiXG4gICAgICApO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBEaXNwYXRjaGVzIGEgZGF0YSBtZXNzYWdlLlxuICAgKlxuICAgKiBAcGFyYW0ge0J1ZmZlcn0gZGF0YSBUaGUgbWVzc2FnZSB0byBzZW5kXG4gICAqIEBwYXJhbSB7Qm9vbGVhbn0gW2NvbXByZXNzPWZhbHNlXSBTcGVjaWZpZXMgd2hldGhlciBvciBub3QgdG8gY29tcHJlc3NcbiAgICogICAgIGBkYXRhYFxuICAgKiBAcGFyYW0ge09iamVjdH0gb3B0aW9ucyBPcHRpb25zIG9iamVjdFxuICAgKiBAcGFyYW0ge051bWJlcn0gb3B0aW9ucy5vcGNvZGUgVGhlIG9wY29kZVxuICAgKiBAcGFyYW0ge0Jvb2xlYW59IFtvcHRpb25zLmZpbj1mYWxzZV0gU3BlY2lmaWVzIHdoZXRoZXIgb3Igbm90IHRvIHNldCB0aGVcbiAgICogICAgIEZJTiBiaXRcbiAgICogQHBhcmFtIHtGdW5jdGlvbn0gW29wdGlvbnMuZ2VuZXJhdGVNYXNrXSBUaGUgZnVuY3Rpb24gdXNlZCB0byBnZW5lcmF0ZSB0aGVcbiAgICogICAgIG1hc2tpbmcga2V5XG4gICAqIEBwYXJhbSB7Qm9vbGVhbn0gW29wdGlvbnMubWFzaz1mYWxzZV0gU3BlY2lmaWVzIHdoZXRoZXIgb3Igbm90IHRvIG1hc2tcbiAgICogICAgIGBkYXRhYFxuICAgKiBAcGFyYW0ge0J1ZmZlcn0gW29wdGlvbnMubWFza0J1ZmZlcl0gVGhlIGJ1ZmZlciB1c2VkIHRvIHN0b3JlIHRoZSBtYXNraW5nXG4gICAqICAgICBrZXlcbiAgICogQHBhcmFtIHtCb29sZWFufSBbb3B0aW9ucy5yZWFkT25seT1mYWxzZV0gU3BlY2lmaWVzIHdoZXRoZXIgYGRhdGFgIGNhbiBiZVxuICAgKiAgICAgbW9kaWZpZWRcbiAgICogQHBhcmFtIHtCb29sZWFufSBbb3B0aW9ucy5yc3YxPWZhbHNlXSBTcGVjaWZpZXMgd2hldGhlciBvciBub3QgdG8gc2V0IHRoZVxuICAgKiAgICAgUlNWMSBiaXRcbiAgICogQHBhcmFtIHtGdW5jdGlvbn0gW2NiXSBDYWxsYmFja1xuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgZGlzcGF0Y2goZGF0YSwgY29tcHJlc3MsIG9wdGlvbnMsIGNiKSB7XG4gICAgaWYgKCFjb21wcmVzcykge1xuICAgICAgdGhpcy5zZW5kRnJhbWUoU2VuZGVyLmZyYW1lKGRhdGEsIG9wdGlvbnMpLCBjYik7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3QgcGVyTWVzc2FnZURlZmxhdGUgPSB0aGlzLl9leHRlbnNpb25zW1Blck1lc3NhZ2VEZWZsYXRlLmV4dGVuc2lvbk5hbWVdO1xuXG4gICAgdGhpcy5fYnVmZmVyZWRCeXRlcyArPSBkYXRhLmxlbmd0aDtcbiAgICB0aGlzLl9kZWZsYXRpbmcgPSB0cnVlO1xuICAgIHBlck1lc3NhZ2VEZWZsYXRlLmNvbXByZXNzKGRhdGEsIG9wdGlvbnMuZmluLCAoXywgYnVmKSA9PiB7XG4gICAgICBpZiAodGhpcy5fc29ja2V0LmRlc3Ryb3llZCkge1xuICAgICAgICBjb25zdCBlcnIgPSBuZXcgRXJyb3IoXG4gICAgICAgICAgJ1RoZSBzb2NrZXQgd2FzIGNsb3NlZCB3aGlsZSBkYXRhIHdhcyBiZWluZyBjb21wcmVzc2VkJ1xuICAgICAgICApO1xuXG4gICAgICAgIGlmICh0eXBlb2YgY2IgPT09ICdmdW5jdGlvbicpIGNiKGVycik7XG5cbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLl9xdWV1ZS5sZW5ndGg7IGkrKykge1xuICAgICAgICAgIGNvbnN0IGNhbGxiYWNrID0gdGhpcy5fcXVldWVbaV1bNF07XG5cbiAgICAgICAgICBpZiAodHlwZW9mIGNhbGxiYWNrID09PSAnZnVuY3Rpb24nKSBjYWxsYmFjayhlcnIpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICB0aGlzLl9idWZmZXJlZEJ5dGVzIC09IGRhdGEubGVuZ3RoO1xuICAgICAgdGhpcy5fZGVmbGF0aW5nID0gZmFsc2U7XG4gICAgICBvcHRpb25zLnJlYWRPbmx5ID0gZmFsc2U7XG4gICAgICB0aGlzLnNlbmRGcmFtZShTZW5kZXIuZnJhbWUoYnVmLCBvcHRpb25zKSwgY2IpO1xuICAgICAgdGhpcy5kZXF1ZXVlKCk7XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogRXhlY3V0ZXMgcXVldWVkIHNlbmQgb3BlcmF0aW9ucy5cbiAgICpcbiAgICogQHByaXZhdGVcbiAgICovXG4gIGRlcXVldWUoKSB7XG4gICAgd2hpbGUgKCF0aGlzLl9kZWZsYXRpbmcgJiYgdGhpcy5fcXVldWUubGVuZ3RoKSB7XG4gICAgICBjb25zdCBwYXJhbXMgPSB0aGlzLl9xdWV1ZS5zaGlmdCgpO1xuXG4gICAgICB0aGlzLl9idWZmZXJlZEJ5dGVzIC09IHBhcmFtc1sxXS5sZW5ndGg7XG4gICAgICBSZWZsZWN0LmFwcGx5KHBhcmFtc1swXSwgdGhpcywgcGFyYW1zLnNsaWNlKDEpKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogRW5xdWV1ZXMgYSBzZW5kIG9wZXJhdGlvbi5cbiAgICpcbiAgICogQHBhcmFtIHtBcnJheX0gcGFyYW1zIFNlbmQgb3BlcmF0aW9uIHBhcmFtZXRlcnMuXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBlbnF1ZXVlKHBhcmFtcykge1xuICAgIHRoaXMuX2J1ZmZlcmVkQnl0ZXMgKz0gcGFyYW1zWzFdLmxlbmd0aDtcbiAgICB0aGlzLl9xdWV1ZS5wdXNoKHBhcmFtcyk7XG4gIH1cblxuICAvKipcbiAgICogU2VuZHMgYSBmcmFtZS5cbiAgICpcbiAgICogQHBhcmFtIHtCdWZmZXJbXX0gbGlzdCBUaGUgZnJhbWUgdG8gc2VuZFxuICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBbY2JdIENhbGxiYWNrXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBzZW5kRnJhbWUobGlzdCwgY2IpIHtcbiAgICBpZiAobGlzdC5sZW5ndGggPT09IDIpIHtcbiAgICAgIHRoaXMuX3NvY2tldC5jb3JrKCk7XG4gICAgICB0aGlzLl9zb2NrZXQud3JpdGUobGlzdFswXSk7XG4gICAgICB0aGlzLl9zb2NrZXQud3JpdGUobGlzdFsxXSwgY2IpO1xuICAgICAgdGhpcy5fc29ja2V0LnVuY29yaygpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLl9zb2NrZXQud3JpdGUobGlzdFswXSwgY2IpO1xuICAgIH1cbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFNlbmRlcjtcbiIsIid1c2Ugc3RyaWN0JztcblxuY29uc3QgeyBrRm9yT25FdmVudEF0dHJpYnV0ZSwga0xpc3RlbmVyIH0gPSByZXF1aXJlKCcuL2NvbnN0YW50cycpO1xuXG5jb25zdCBrQ29kZSA9IFN5bWJvbCgna0NvZGUnKTtcbmNvbnN0IGtEYXRhID0gU3ltYm9sKCdrRGF0YScpO1xuY29uc3Qga0Vycm9yID0gU3ltYm9sKCdrRXJyb3InKTtcbmNvbnN0IGtNZXNzYWdlID0gU3ltYm9sKCdrTWVzc2FnZScpO1xuY29uc3Qga1JlYXNvbiA9IFN5bWJvbCgna1JlYXNvbicpO1xuY29uc3Qga1RhcmdldCA9IFN5bWJvbCgna1RhcmdldCcpO1xuY29uc3Qga1R5cGUgPSBTeW1ib2woJ2tUeXBlJyk7XG5jb25zdCBrV2FzQ2xlYW4gPSBTeW1ib2woJ2tXYXNDbGVhbicpO1xuXG4vKipcbiAqIENsYXNzIHJlcHJlc2VudGluZyBhbiBldmVudC5cbiAqL1xuY2xhc3MgRXZlbnQge1xuICAvKipcbiAgICogQ3JlYXRlIGEgbmV3IGBFdmVudGAuXG4gICAqXG4gICAqIEBwYXJhbSB7U3RyaW5nfSB0eXBlIFRoZSBuYW1lIG9mIHRoZSBldmVudFxuICAgKiBAdGhyb3dzIHtUeXBlRXJyb3J9IElmIHRoZSBgdHlwZWAgYXJndW1lbnQgaXMgbm90IHNwZWNpZmllZFxuICAgKi9cbiAgY29uc3RydWN0b3IodHlwZSkge1xuICAgIHRoaXNba1RhcmdldF0gPSBudWxsO1xuICAgIHRoaXNba1R5cGVdID0gdHlwZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAdHlwZSB7Kn1cbiAgICovXG4gIGdldCB0YXJnZXQoKSB7XG4gICAgcmV0dXJuIHRoaXNba1RhcmdldF07XG4gIH1cblxuICAvKipcbiAgICogQHR5cGUge1N0cmluZ31cbiAgICovXG4gIGdldCB0eXBlKCkge1xuICAgIHJldHVybiB0aGlzW2tUeXBlXTtcbiAgfVxufVxuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoRXZlbnQucHJvdG90eXBlLCAndGFyZ2V0JywgeyBlbnVtZXJhYmxlOiB0cnVlIH0pO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KEV2ZW50LnByb3RvdHlwZSwgJ3R5cGUnLCB7IGVudW1lcmFibGU6IHRydWUgfSk7XG5cbi8qKlxuICogQ2xhc3MgcmVwcmVzZW50aW5nIGEgY2xvc2UgZXZlbnQuXG4gKlxuICogQGV4dGVuZHMgRXZlbnRcbiAqL1xuY2xhc3MgQ2xvc2VFdmVudCBleHRlbmRzIEV2ZW50IHtcbiAgLyoqXG4gICAqIENyZWF0ZSBhIG5ldyBgQ2xvc2VFdmVudGAuXG4gICAqXG4gICAqIEBwYXJhbSB7U3RyaW5nfSB0eXBlIFRoZSBuYW1lIG9mIHRoZSBldmVudFxuICAgKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnNdIEEgZGljdGlvbmFyeSBvYmplY3QgdGhhdCBhbGxvd3MgZm9yIHNldHRpbmdcbiAgICogICAgIGF0dHJpYnV0ZXMgdmlhIG9iamVjdCBtZW1iZXJzIG9mIHRoZSBzYW1lIG5hbWVcbiAgICogQHBhcmFtIHtOdW1iZXJ9IFtvcHRpb25zLmNvZGU9MF0gVGhlIHN0YXR1cyBjb2RlIGV4cGxhaW5pbmcgd2h5IHRoZVxuICAgKiAgICAgY29ubmVjdGlvbiB3YXMgY2xvc2VkXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBbb3B0aW9ucy5yZWFzb249JyddIEEgaHVtYW4tcmVhZGFibGUgc3RyaW5nIGV4cGxhaW5pbmcgd2h5XG4gICAqICAgICB0aGUgY29ubmVjdGlvbiB3YXMgY2xvc2VkXG4gICAqIEBwYXJhbSB7Qm9vbGVhbn0gW29wdGlvbnMud2FzQ2xlYW49ZmFsc2VdIEluZGljYXRlcyB3aGV0aGVyIG9yIG5vdCB0aGVcbiAgICogICAgIGNvbm5lY3Rpb24gd2FzIGNsZWFubHkgY2xvc2VkXG4gICAqL1xuICBjb25zdHJ1Y3Rvcih0eXBlLCBvcHRpb25zID0ge30pIHtcbiAgICBzdXBlcih0eXBlKTtcblxuICAgIHRoaXNba0NvZGVdID0gb3B0aW9ucy5jb2RlID09PSB1bmRlZmluZWQgPyAwIDogb3B0aW9ucy5jb2RlO1xuICAgIHRoaXNba1JlYXNvbl0gPSBvcHRpb25zLnJlYXNvbiA9PT0gdW5kZWZpbmVkID8gJycgOiBvcHRpb25zLnJlYXNvbjtcbiAgICB0aGlzW2tXYXNDbGVhbl0gPSBvcHRpb25zLndhc0NsZWFuID09PSB1bmRlZmluZWQgPyBmYWxzZSA6IG9wdGlvbnMud2FzQ2xlYW47XG4gIH1cblxuICAvKipcbiAgICogQHR5cGUge051bWJlcn1cbiAgICovXG4gIGdldCBjb2RlKCkge1xuICAgIHJldHVybiB0aGlzW2tDb2RlXTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAdHlwZSB7U3RyaW5nfVxuICAgKi9cbiAgZ2V0IHJlYXNvbigpIHtcbiAgICByZXR1cm4gdGhpc1trUmVhc29uXTtcbiAgfVxuXG4gIC8qKlxuICAgKiBAdHlwZSB7Qm9vbGVhbn1cbiAgICovXG4gIGdldCB3YXNDbGVhbigpIHtcbiAgICByZXR1cm4gdGhpc1trV2FzQ2xlYW5dO1xuICB9XG59XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShDbG9zZUV2ZW50LnByb3RvdHlwZSwgJ2NvZGUnLCB7IGVudW1lcmFibGU6IHRydWUgfSk7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoQ2xvc2VFdmVudC5wcm90b3R5cGUsICdyZWFzb24nLCB7IGVudW1lcmFibGU6IHRydWUgfSk7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoQ2xvc2VFdmVudC5wcm90b3R5cGUsICd3YXNDbGVhbicsIHsgZW51bWVyYWJsZTogdHJ1ZSB9KTtcblxuLyoqXG4gKiBDbGFzcyByZXByZXNlbnRpbmcgYW4gZXJyb3IgZXZlbnQuXG4gKlxuICogQGV4dGVuZHMgRXZlbnRcbiAqL1xuY2xhc3MgRXJyb3JFdmVudCBleHRlbmRzIEV2ZW50IHtcbiAgLyoqXG4gICAqIENyZWF0ZSBhIG5ldyBgRXJyb3JFdmVudGAuXG4gICAqXG4gICAqIEBwYXJhbSB7U3RyaW5nfSB0eXBlIFRoZSBuYW1lIG9mIHRoZSBldmVudFxuICAgKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnNdIEEgZGljdGlvbmFyeSBvYmplY3QgdGhhdCBhbGxvd3MgZm9yIHNldHRpbmdcbiAgICogICAgIGF0dHJpYnV0ZXMgdmlhIG9iamVjdCBtZW1iZXJzIG9mIHRoZSBzYW1lIG5hbWVcbiAgICogQHBhcmFtIHsqfSBbb3B0aW9ucy5lcnJvcj1udWxsXSBUaGUgZXJyb3IgdGhhdCBnZW5lcmF0ZWQgdGhpcyBldmVudFxuICAgKiBAcGFyYW0ge1N0cmluZ30gW29wdGlvbnMubWVzc2FnZT0nJ10gVGhlIGVycm9yIG1lc3NhZ2VcbiAgICovXG4gIGNvbnN0cnVjdG9yKHR5cGUsIG9wdGlvbnMgPSB7fSkge1xuICAgIHN1cGVyKHR5cGUpO1xuXG4gICAgdGhpc1trRXJyb3JdID0gb3B0aW9ucy5lcnJvciA9PT0gdW5kZWZpbmVkID8gbnVsbCA6IG9wdGlvbnMuZXJyb3I7XG4gICAgdGhpc1trTWVzc2FnZV0gPSBvcHRpb25zLm1lc3NhZ2UgPT09IHVuZGVmaW5lZCA/ICcnIDogb3B0aW9ucy5tZXNzYWdlO1xuICB9XG5cbiAgLyoqXG4gICAqIEB0eXBlIHsqfVxuICAgKi9cbiAgZ2V0IGVycm9yKCkge1xuICAgIHJldHVybiB0aGlzW2tFcnJvcl07XG4gIH1cblxuICAvKipcbiAgICogQHR5cGUge1N0cmluZ31cbiAgICovXG4gIGdldCBtZXNzYWdlKCkge1xuICAgIHJldHVybiB0aGlzW2tNZXNzYWdlXTtcbiAgfVxufVxuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoRXJyb3JFdmVudC5wcm90b3R5cGUsICdlcnJvcicsIHsgZW51bWVyYWJsZTogdHJ1ZSB9KTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShFcnJvckV2ZW50LnByb3RvdHlwZSwgJ21lc3NhZ2UnLCB7IGVudW1lcmFibGU6IHRydWUgfSk7XG5cbi8qKlxuICogQ2xhc3MgcmVwcmVzZW50aW5nIGEgbWVzc2FnZSBldmVudC5cbiAqXG4gKiBAZXh0ZW5kcyBFdmVudFxuICovXG5jbGFzcyBNZXNzYWdlRXZlbnQgZXh0ZW5kcyBFdmVudCB7XG4gIC8qKlxuICAgKiBDcmVhdGUgYSBuZXcgYE1lc3NhZ2VFdmVudGAuXG4gICAqXG4gICAqIEBwYXJhbSB7U3RyaW5nfSB0eXBlIFRoZSBuYW1lIG9mIHRoZSBldmVudFxuICAgKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnNdIEEgZGljdGlvbmFyeSBvYmplY3QgdGhhdCBhbGxvd3MgZm9yIHNldHRpbmdcbiAgICogICAgIGF0dHJpYnV0ZXMgdmlhIG9iamVjdCBtZW1iZXJzIG9mIHRoZSBzYW1lIG5hbWVcbiAgICogQHBhcmFtIHsqfSBbb3B0aW9ucy5kYXRhPW51bGxdIFRoZSBtZXNzYWdlIGNvbnRlbnRcbiAgICovXG4gIGNvbnN0cnVjdG9yKHR5cGUsIG9wdGlvbnMgPSB7fSkge1xuICAgIHN1cGVyKHR5cGUpO1xuXG4gICAgdGhpc1trRGF0YV0gPSBvcHRpb25zLmRhdGEgPT09IHVuZGVmaW5lZCA/IG51bGwgOiBvcHRpb25zLmRhdGE7XG4gIH1cblxuICAvKipcbiAgICogQHR5cGUgeyp9XG4gICAqL1xuICBnZXQgZGF0YSgpIHtcbiAgICByZXR1cm4gdGhpc1trRGF0YV07XG4gIH1cbn1cblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KE1lc3NhZ2VFdmVudC5wcm90b3R5cGUsICdkYXRhJywgeyBlbnVtZXJhYmxlOiB0cnVlIH0pO1xuXG4vKipcbiAqIFRoaXMgcHJvdmlkZXMgbWV0aG9kcyBmb3IgZW11bGF0aW5nIHRoZSBgRXZlbnRUYXJnZXRgIGludGVyZmFjZS4gSXQncyBub3RcbiAqIG1lYW50IHRvIGJlIHVzZWQgZGlyZWN0bHkuXG4gKlxuICogQG1peGluXG4gKi9cbmNvbnN0IEV2ZW50VGFyZ2V0ID0ge1xuICAvKipcbiAgICogUmVnaXN0ZXIgYW4gZXZlbnQgbGlzdGVuZXIuXG4gICAqXG4gICAqIEBwYXJhbSB7U3RyaW5nfSB0eXBlIEEgc3RyaW5nIHJlcHJlc2VudGluZyB0aGUgZXZlbnQgdHlwZSB0byBsaXN0ZW4gZm9yXG4gICAqIEBwYXJhbSB7RnVuY3Rpb259IGxpc3RlbmVyIFRoZSBsaXN0ZW5lciB0byBhZGRcbiAgICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zXSBBbiBvcHRpb25zIG9iamVjdCBzcGVjaWZpZXMgY2hhcmFjdGVyaXN0aWNzIGFib3V0XG4gICAqICAgICB0aGUgZXZlbnQgbGlzdGVuZXJcbiAgICogQHBhcmFtIHtCb29sZWFufSBbb3B0aW9ucy5vbmNlPWZhbHNlXSBBIGBCb29sZWFuYCBpbmRpY2F0aW5nIHRoYXQgdGhlXG4gICAqICAgICBsaXN0ZW5lciBzaG91bGQgYmUgaW52b2tlZCBhdCBtb3N0IG9uY2UgYWZ0ZXIgYmVpbmcgYWRkZWQuIElmIGB0cnVlYCxcbiAgICogICAgIHRoZSBsaXN0ZW5lciB3b3VsZCBiZSBhdXRvbWF0aWNhbGx5IHJlbW92ZWQgd2hlbiBpbnZva2VkLlxuICAgKiBAcHVibGljXG4gICAqL1xuICBhZGRFdmVudExpc3RlbmVyKHR5cGUsIGxpc3RlbmVyLCBvcHRpb25zID0ge30pIHtcbiAgICBsZXQgd3JhcHBlcjtcblxuICAgIGlmICh0eXBlID09PSAnbWVzc2FnZScpIHtcbiAgICAgIHdyYXBwZXIgPSBmdW5jdGlvbiBvbk1lc3NhZ2UoZGF0YSwgaXNCaW5hcnkpIHtcbiAgICAgICAgY29uc3QgZXZlbnQgPSBuZXcgTWVzc2FnZUV2ZW50KCdtZXNzYWdlJywge1xuICAgICAgICAgIGRhdGE6IGlzQmluYXJ5ID8gZGF0YSA6IGRhdGEudG9TdHJpbmcoKVxuICAgICAgICB9KTtcblxuICAgICAgICBldmVudFtrVGFyZ2V0XSA9IHRoaXM7XG4gICAgICAgIGxpc3RlbmVyLmNhbGwodGhpcywgZXZlbnQpO1xuICAgICAgfTtcbiAgICB9IGVsc2UgaWYgKHR5cGUgPT09ICdjbG9zZScpIHtcbiAgICAgIHdyYXBwZXIgPSBmdW5jdGlvbiBvbkNsb3NlKGNvZGUsIG1lc3NhZ2UpIHtcbiAgICAgICAgY29uc3QgZXZlbnQgPSBuZXcgQ2xvc2VFdmVudCgnY2xvc2UnLCB7XG4gICAgICAgICAgY29kZSxcbiAgICAgICAgICByZWFzb246IG1lc3NhZ2UudG9TdHJpbmcoKSxcbiAgICAgICAgICB3YXNDbGVhbjogdGhpcy5fY2xvc2VGcmFtZVJlY2VpdmVkICYmIHRoaXMuX2Nsb3NlRnJhbWVTZW50XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGV2ZW50W2tUYXJnZXRdID0gdGhpcztcbiAgICAgICAgbGlzdGVuZXIuY2FsbCh0aGlzLCBldmVudCk7XG4gICAgICB9O1xuICAgIH0gZWxzZSBpZiAodHlwZSA9PT0gJ2Vycm9yJykge1xuICAgICAgd3JhcHBlciA9IGZ1bmN0aW9uIG9uRXJyb3IoZXJyb3IpIHtcbiAgICAgICAgY29uc3QgZXZlbnQgPSBuZXcgRXJyb3JFdmVudCgnZXJyb3InLCB7XG4gICAgICAgICAgZXJyb3IsXG4gICAgICAgICAgbWVzc2FnZTogZXJyb3IubWVzc2FnZVxuICAgICAgICB9KTtcblxuICAgICAgICBldmVudFtrVGFyZ2V0XSA9IHRoaXM7XG4gICAgICAgIGxpc3RlbmVyLmNhbGwodGhpcywgZXZlbnQpO1xuICAgICAgfTtcbiAgICB9IGVsc2UgaWYgKHR5cGUgPT09ICdvcGVuJykge1xuICAgICAgd3JhcHBlciA9IGZ1bmN0aW9uIG9uT3BlbigpIHtcbiAgICAgICAgY29uc3QgZXZlbnQgPSBuZXcgRXZlbnQoJ29wZW4nKTtcblxuICAgICAgICBldmVudFtrVGFyZ2V0XSA9IHRoaXM7XG4gICAgICAgIGxpc3RlbmVyLmNhbGwodGhpcywgZXZlbnQpO1xuICAgICAgfTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHdyYXBwZXJba0Zvck9uRXZlbnRBdHRyaWJ1dGVdID0gISFvcHRpb25zW2tGb3JPbkV2ZW50QXR0cmlidXRlXTtcbiAgICB3cmFwcGVyW2tMaXN0ZW5lcl0gPSBsaXN0ZW5lcjtcblxuICAgIGlmIChvcHRpb25zLm9uY2UpIHtcbiAgICAgIHRoaXMub25jZSh0eXBlLCB3cmFwcGVyKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5vbih0eXBlLCB3cmFwcGVyKTtcbiAgICB9XG4gIH0sXG5cbiAgLyoqXG4gICAqIFJlbW92ZSBhbiBldmVudCBsaXN0ZW5lci5cbiAgICpcbiAgICogQHBhcmFtIHtTdHJpbmd9IHR5cGUgQSBzdHJpbmcgcmVwcmVzZW50aW5nIHRoZSBldmVudCB0eXBlIHRvIHJlbW92ZVxuICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBoYW5kbGVyIFRoZSBsaXN0ZW5lciB0byByZW1vdmVcbiAgICogQHB1YmxpY1xuICAgKi9cbiAgcmVtb3ZlRXZlbnRMaXN0ZW5lcih0eXBlLCBoYW5kbGVyKSB7XG4gICAgZm9yIChjb25zdCBsaXN0ZW5lciBvZiB0aGlzLmxpc3RlbmVycyh0eXBlKSkge1xuICAgICAgaWYgKGxpc3RlbmVyW2tMaXN0ZW5lcl0gPT09IGhhbmRsZXIgJiYgIWxpc3RlbmVyW2tGb3JPbkV2ZW50QXR0cmlidXRlXSkge1xuICAgICAgICB0aGlzLnJlbW92ZUxpc3RlbmVyKHR5cGUsIGxpc3RlbmVyKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgQ2xvc2VFdmVudCxcbiAgRXJyb3JFdmVudCxcbiAgRXZlbnQsXG4gIEV2ZW50VGFyZ2V0LFxuICBNZXNzYWdlRXZlbnRcbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbmNvbnN0IHsgdG9rZW5DaGFycyB9ID0gcmVxdWlyZSgnLi92YWxpZGF0aW9uJyk7XG5cbi8qKlxuICogQWRkcyBhbiBvZmZlciB0byB0aGUgbWFwIG9mIGV4dGVuc2lvbiBvZmZlcnMgb3IgYSBwYXJhbWV0ZXIgdG8gdGhlIG1hcCBvZlxuICogcGFyYW1ldGVycy5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gZGVzdCBUaGUgbWFwIG9mIGV4dGVuc2lvbiBvZmZlcnMgb3IgcGFyYW1ldGVyc1xuICogQHBhcmFtIHtTdHJpbmd9IG5hbWUgVGhlIGV4dGVuc2lvbiBvciBwYXJhbWV0ZXIgbmFtZVxuICogQHBhcmFtIHsoT2JqZWN0fEJvb2xlYW58U3RyaW5nKX0gZWxlbSBUaGUgZXh0ZW5zaW9uIHBhcmFtZXRlcnMgb3IgdGhlXG4gKiAgICAgcGFyYW1ldGVyIHZhbHVlXG4gKiBAcHJpdmF0ZVxuICovXG5mdW5jdGlvbiBwdXNoKGRlc3QsIG5hbWUsIGVsZW0pIHtcbiAgaWYgKGRlc3RbbmFtZV0gPT09IHVuZGVmaW5lZCkgZGVzdFtuYW1lXSA9IFtlbGVtXTtcbiAgZWxzZSBkZXN0W25hbWVdLnB1c2goZWxlbSk7XG59XG5cbi8qKlxuICogUGFyc2VzIHRoZSBgU2VjLVdlYlNvY2tldC1FeHRlbnNpb25zYCBoZWFkZXIgaW50byBhbiBvYmplY3QuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGhlYWRlciBUaGUgZmllbGQgdmFsdWUgb2YgdGhlIGhlYWRlclxuICogQHJldHVybiB7T2JqZWN0fSBUaGUgcGFyc2VkIG9iamVjdFxuICogQHB1YmxpY1xuICovXG5mdW5jdGlvbiBwYXJzZShoZWFkZXIpIHtcbiAgY29uc3Qgb2ZmZXJzID0gT2JqZWN0LmNyZWF0ZShudWxsKTtcbiAgbGV0IHBhcmFtcyA9IE9iamVjdC5jcmVhdGUobnVsbCk7XG4gIGxldCBtdXN0VW5lc2NhcGUgPSBmYWxzZTtcbiAgbGV0IGlzRXNjYXBpbmcgPSBmYWxzZTtcbiAgbGV0IGluUXVvdGVzID0gZmFsc2U7XG4gIGxldCBleHRlbnNpb25OYW1lO1xuICBsZXQgcGFyYW1OYW1lO1xuICBsZXQgc3RhcnQgPSAtMTtcbiAgbGV0IGNvZGUgPSAtMTtcbiAgbGV0IGVuZCA9IC0xO1xuICBsZXQgaSA9IDA7XG5cbiAgZm9yICg7IGkgPCBoZWFkZXIubGVuZ3RoOyBpKyspIHtcbiAgICBjb2RlID0gaGVhZGVyLmNoYXJDb2RlQXQoaSk7XG5cbiAgICBpZiAoZXh0ZW5zaW9uTmFtZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICBpZiAoZW5kID09PSAtMSAmJiB0b2tlbkNoYXJzW2NvZGVdID09PSAxKSB7XG4gICAgICAgIGlmIChzdGFydCA9PT0gLTEpIHN0YXJ0ID0gaTtcbiAgICAgIH0gZWxzZSBpZiAoXG4gICAgICAgIGkgIT09IDAgJiZcbiAgICAgICAgKGNvZGUgPT09IDB4MjAgLyogJyAnICovIHx8IGNvZGUgPT09IDB4MDkpIC8qICdcXHQnICovXG4gICAgICApIHtcbiAgICAgICAgaWYgKGVuZCA9PT0gLTEgJiYgc3RhcnQgIT09IC0xKSBlbmQgPSBpO1xuICAgICAgfSBlbHNlIGlmIChjb2RlID09PSAweDNiIC8qICc7JyAqLyB8fCBjb2RlID09PSAweDJjIC8qICcsJyAqLykge1xuICAgICAgICBpZiAoc3RhcnQgPT09IC0xKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IFN5bnRheEVycm9yKGBVbmV4cGVjdGVkIGNoYXJhY3RlciBhdCBpbmRleCAke2l9YCk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoZW5kID09PSAtMSkgZW5kID0gaTtcbiAgICAgICAgY29uc3QgbmFtZSA9IGhlYWRlci5zbGljZShzdGFydCwgZW5kKTtcbiAgICAgICAgaWYgKGNvZGUgPT09IDB4MmMpIHtcbiAgICAgICAgICBwdXNoKG9mZmVycywgbmFtZSwgcGFyYW1zKTtcbiAgICAgICAgICBwYXJhbXMgPSBPYmplY3QuY3JlYXRlKG51bGwpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGV4dGVuc2lvbk5hbWUgPSBuYW1lO1xuICAgICAgICB9XG5cbiAgICAgICAgc3RhcnQgPSBlbmQgPSAtMTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRocm93IG5ldyBTeW50YXhFcnJvcihgVW5leHBlY3RlZCBjaGFyYWN0ZXIgYXQgaW5kZXggJHtpfWApO1xuICAgICAgfVxuICAgIH0gZWxzZSBpZiAocGFyYW1OYW1lID09PSB1bmRlZmluZWQpIHtcbiAgICAgIGlmIChlbmQgPT09IC0xICYmIHRva2VuQ2hhcnNbY29kZV0gPT09IDEpIHtcbiAgICAgICAgaWYgKHN0YXJ0ID09PSAtMSkgc3RhcnQgPSBpO1xuICAgICAgfSBlbHNlIGlmIChjb2RlID09PSAweDIwIHx8IGNvZGUgPT09IDB4MDkpIHtcbiAgICAgICAgaWYgKGVuZCA9PT0gLTEgJiYgc3RhcnQgIT09IC0xKSBlbmQgPSBpO1xuICAgICAgfSBlbHNlIGlmIChjb2RlID09PSAweDNiIHx8IGNvZGUgPT09IDB4MmMpIHtcbiAgICAgICAgaWYgKHN0YXJ0ID09PSAtMSkge1xuICAgICAgICAgIHRocm93IG5ldyBTeW50YXhFcnJvcihgVW5leHBlY3RlZCBjaGFyYWN0ZXIgYXQgaW5kZXggJHtpfWApO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGVuZCA9PT0gLTEpIGVuZCA9IGk7XG4gICAgICAgIHB1c2gocGFyYW1zLCBoZWFkZXIuc2xpY2Uoc3RhcnQsIGVuZCksIHRydWUpO1xuICAgICAgICBpZiAoY29kZSA9PT0gMHgyYykge1xuICAgICAgICAgIHB1c2gob2ZmZXJzLCBleHRlbnNpb25OYW1lLCBwYXJhbXMpO1xuICAgICAgICAgIHBhcmFtcyA9IE9iamVjdC5jcmVhdGUobnVsbCk7XG4gICAgICAgICAgZXh0ZW5zaW9uTmFtZSA9IHVuZGVmaW5lZDtcbiAgICAgICAgfVxuXG4gICAgICAgIHN0YXJ0ID0gZW5kID0gLTE7XG4gICAgICB9IGVsc2UgaWYgKGNvZGUgPT09IDB4M2QgLyogJz0nICovICYmIHN0YXJ0ICE9PSAtMSAmJiBlbmQgPT09IC0xKSB7XG4gICAgICAgIHBhcmFtTmFtZSA9IGhlYWRlci5zbGljZShzdGFydCwgaSk7XG4gICAgICAgIHN0YXJ0ID0gZW5kID0gLTE7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aHJvdyBuZXcgU3ludGF4RXJyb3IoYFVuZXhwZWN0ZWQgY2hhcmFjdGVyIGF0IGluZGV4ICR7aX1gKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgLy9cbiAgICAgIC8vIFRoZSB2YWx1ZSBvZiBhIHF1b3RlZC1zdHJpbmcgYWZ0ZXIgdW5lc2NhcGluZyBtdXN0IGNvbmZvcm0gdG8gdGhlXG4gICAgICAvLyB0b2tlbiBBQk5GLCBzbyBvbmx5IHRva2VuIGNoYXJhY3RlcnMgYXJlIHZhbGlkLlxuICAgICAgLy8gUmVmOiBodHRwczovL3Rvb2xzLmlldGYub3JnL2h0bWwvcmZjNjQ1NSNzZWN0aW9uLTkuMVxuICAgICAgLy9cbiAgICAgIGlmIChpc0VzY2FwaW5nKSB7XG4gICAgICAgIGlmICh0b2tlbkNoYXJzW2NvZGVdICE9PSAxKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IFN5bnRheEVycm9yKGBVbmV4cGVjdGVkIGNoYXJhY3RlciBhdCBpbmRleCAke2l9YCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHN0YXJ0ID09PSAtMSkgc3RhcnQgPSBpO1xuICAgICAgICBlbHNlIGlmICghbXVzdFVuZXNjYXBlKSBtdXN0VW5lc2NhcGUgPSB0cnVlO1xuICAgICAgICBpc0VzY2FwaW5nID0gZmFsc2U7XG4gICAgICB9IGVsc2UgaWYgKGluUXVvdGVzKSB7XG4gICAgICAgIGlmICh0b2tlbkNoYXJzW2NvZGVdID09PSAxKSB7XG4gICAgICAgICAgaWYgKHN0YXJ0ID09PSAtMSkgc3RhcnQgPSBpO1xuICAgICAgICB9IGVsc2UgaWYgKGNvZGUgPT09IDB4MjIgLyogJ1wiJyAqLyAmJiBzdGFydCAhPT0gLTEpIHtcbiAgICAgICAgICBpblF1b3RlcyA9IGZhbHNlO1xuICAgICAgICAgIGVuZCA9IGk7XG4gICAgICAgIH0gZWxzZSBpZiAoY29kZSA9PT0gMHg1YyAvKiAnXFwnICovKSB7XG4gICAgICAgICAgaXNFc2NhcGluZyA9IHRydWU7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhyb3cgbmV3IFN5bnRheEVycm9yKGBVbmV4cGVjdGVkIGNoYXJhY3RlciBhdCBpbmRleCAke2l9YCk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAoY29kZSA9PT0gMHgyMiAmJiBoZWFkZXIuY2hhckNvZGVBdChpIC0gMSkgPT09IDB4M2QpIHtcbiAgICAgICAgaW5RdW90ZXMgPSB0cnVlO1xuICAgICAgfSBlbHNlIGlmIChlbmQgPT09IC0xICYmIHRva2VuQ2hhcnNbY29kZV0gPT09IDEpIHtcbiAgICAgICAgaWYgKHN0YXJ0ID09PSAtMSkgc3RhcnQgPSBpO1xuICAgICAgfSBlbHNlIGlmIChzdGFydCAhPT0gLTEgJiYgKGNvZGUgPT09IDB4MjAgfHwgY29kZSA9PT0gMHgwOSkpIHtcbiAgICAgICAgaWYgKGVuZCA9PT0gLTEpIGVuZCA9IGk7XG4gICAgICB9IGVsc2UgaWYgKGNvZGUgPT09IDB4M2IgfHwgY29kZSA9PT0gMHgyYykge1xuICAgICAgICBpZiAoc3RhcnQgPT09IC0xKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IFN5bnRheEVycm9yKGBVbmV4cGVjdGVkIGNoYXJhY3RlciBhdCBpbmRleCAke2l9YCk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoZW5kID09PSAtMSkgZW5kID0gaTtcbiAgICAgICAgbGV0IHZhbHVlID0gaGVhZGVyLnNsaWNlKHN0YXJ0LCBlbmQpO1xuICAgICAgICBpZiAobXVzdFVuZXNjYXBlKSB7XG4gICAgICAgICAgdmFsdWUgPSB2YWx1ZS5yZXBsYWNlKC9cXFxcL2csICcnKTtcbiAgICAgICAgICBtdXN0VW5lc2NhcGUgPSBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBwdXNoKHBhcmFtcywgcGFyYW1OYW1lLCB2YWx1ZSk7XG4gICAgICAgIGlmIChjb2RlID09PSAweDJjKSB7XG4gICAgICAgICAgcHVzaChvZmZlcnMsIGV4dGVuc2lvbk5hbWUsIHBhcmFtcyk7XG4gICAgICAgICAgcGFyYW1zID0gT2JqZWN0LmNyZWF0ZShudWxsKTtcbiAgICAgICAgICBleHRlbnNpb25OYW1lID0gdW5kZWZpbmVkO1xuICAgICAgICB9XG5cbiAgICAgICAgcGFyYW1OYW1lID0gdW5kZWZpbmVkO1xuICAgICAgICBzdGFydCA9IGVuZCA9IC0xO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhyb3cgbmV3IFN5bnRheEVycm9yKGBVbmV4cGVjdGVkIGNoYXJhY3RlciBhdCBpbmRleCAke2l9YCk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgaWYgKHN0YXJ0ID09PSAtMSB8fCBpblF1b3RlcyB8fCBjb2RlID09PSAweDIwIHx8IGNvZGUgPT09IDB4MDkpIHtcbiAgICB0aHJvdyBuZXcgU3ludGF4RXJyb3IoJ1VuZXhwZWN0ZWQgZW5kIG9mIGlucHV0Jyk7XG4gIH1cblxuICBpZiAoZW5kID09PSAtMSkgZW5kID0gaTtcbiAgY29uc3QgdG9rZW4gPSBoZWFkZXIuc2xpY2Uoc3RhcnQsIGVuZCk7XG4gIGlmIChleHRlbnNpb25OYW1lID09PSB1bmRlZmluZWQpIHtcbiAgICBwdXNoKG9mZmVycywgdG9rZW4sIHBhcmFtcyk7XG4gIH0gZWxzZSB7XG4gICAgaWYgKHBhcmFtTmFtZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICBwdXNoKHBhcmFtcywgdG9rZW4sIHRydWUpO1xuICAgIH0gZWxzZSBpZiAobXVzdFVuZXNjYXBlKSB7XG4gICAgICBwdXNoKHBhcmFtcywgcGFyYW1OYW1lLCB0b2tlbi5yZXBsYWNlKC9cXFxcL2csICcnKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHB1c2gocGFyYW1zLCBwYXJhbU5hbWUsIHRva2VuKTtcbiAgICB9XG4gICAgcHVzaChvZmZlcnMsIGV4dGVuc2lvbk5hbWUsIHBhcmFtcyk7XG4gIH1cblxuICByZXR1cm4gb2ZmZXJzO1xufVxuXG4vKipcbiAqIEJ1aWxkcyB0aGUgYFNlYy1XZWJTb2NrZXQtRXh0ZW5zaW9uc2AgaGVhZGVyIGZpZWxkIHZhbHVlLlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBleHRlbnNpb25zIFRoZSBtYXAgb2YgZXh0ZW5zaW9ucyBhbmQgcGFyYW1ldGVycyB0byBmb3JtYXRcbiAqIEByZXR1cm4ge1N0cmluZ30gQSBzdHJpbmcgcmVwcmVzZW50aW5nIHRoZSBnaXZlbiBvYmplY3RcbiAqIEBwdWJsaWNcbiAqL1xuZnVuY3Rpb24gZm9ybWF0KGV4dGVuc2lvbnMpIHtcbiAgcmV0dXJuIE9iamVjdC5rZXlzKGV4dGVuc2lvbnMpXG4gICAgLm1hcCgoZXh0ZW5zaW9uKSA9PiB7XG4gICAgICBsZXQgY29uZmlndXJhdGlvbnMgPSBleHRlbnNpb25zW2V4dGVuc2lvbl07XG4gICAgICBpZiAoIUFycmF5LmlzQXJyYXkoY29uZmlndXJhdGlvbnMpKSBjb25maWd1cmF0aW9ucyA9IFtjb25maWd1cmF0aW9uc107XG4gICAgICByZXR1cm4gY29uZmlndXJhdGlvbnNcbiAgICAgICAgLm1hcCgocGFyYW1zKSA9PiB7XG4gICAgICAgICAgcmV0dXJuIFtleHRlbnNpb25dXG4gICAgICAgICAgICAuY29uY2F0KFxuICAgICAgICAgICAgICBPYmplY3Qua2V5cyhwYXJhbXMpLm1hcCgoaykgPT4ge1xuICAgICAgICAgICAgICAgIGxldCB2YWx1ZXMgPSBwYXJhbXNba107XG4gICAgICAgICAgICAgICAgaWYgKCFBcnJheS5pc0FycmF5KHZhbHVlcykpIHZhbHVlcyA9IFt2YWx1ZXNdO1xuICAgICAgICAgICAgICAgIHJldHVybiB2YWx1ZXNcbiAgICAgICAgICAgICAgICAgIC5tYXAoKHYpID0+ICh2ID09PSB0cnVlID8gayA6IGAke2t9PSR7dn1gKSlcbiAgICAgICAgICAgICAgICAgIC5qb2luKCc7ICcpO1xuICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgKVxuICAgICAgICAgICAgLmpvaW4oJzsgJyk7XG4gICAgICAgIH0pXG4gICAgICAgIC5qb2luKCcsICcpO1xuICAgIH0pXG4gICAgLmpvaW4oJywgJyk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0geyBmb3JtYXQsIHBhcnNlIH07XG4iLCIvKiBlc2xpbnQgbm8tdW51c2VkLXZhcnM6IFtcImVycm9yXCIsIHsgXCJ2YXJzSWdub3JlUGF0dGVyblwiOiBcIl5SZWFkYWJsZSRcIiB9XSAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbmNvbnN0IEV2ZW50RW1pdHRlciA9IHJlcXVpcmUoJ2V2ZW50cycpO1xuY29uc3QgaHR0cHMgPSByZXF1aXJlKCdodHRwcycpO1xuY29uc3QgaHR0cCA9IHJlcXVpcmUoJ2h0dHAnKTtcbmNvbnN0IG5ldCA9IHJlcXVpcmUoJ25ldCcpO1xuY29uc3QgdGxzID0gcmVxdWlyZSgndGxzJyk7XG5jb25zdCB7IHJhbmRvbUJ5dGVzLCBjcmVhdGVIYXNoIH0gPSByZXF1aXJlKCdjcnlwdG8nKTtcbmNvbnN0IHsgUmVhZGFibGUgfSA9IHJlcXVpcmUoJ3N0cmVhbScpO1xuY29uc3QgeyBVUkwgfSA9IHJlcXVpcmUoJ3VybCcpO1xuXG5jb25zdCBQZXJNZXNzYWdlRGVmbGF0ZSA9IHJlcXVpcmUoJy4vcGVybWVzc2FnZS1kZWZsYXRlJyk7XG5jb25zdCBSZWNlaXZlciA9IHJlcXVpcmUoJy4vcmVjZWl2ZXInKTtcbmNvbnN0IFNlbmRlciA9IHJlcXVpcmUoJy4vc2VuZGVyJyk7XG5jb25zdCB7XG4gIEJJTkFSWV9UWVBFUyxcbiAgRU1QVFlfQlVGRkVSLFxuICBHVUlELFxuICBrRm9yT25FdmVudEF0dHJpYnV0ZSxcbiAga0xpc3RlbmVyLFxuICBrU3RhdHVzQ29kZSxcbiAga1dlYlNvY2tldCxcbiAgTk9PUFxufSA9IHJlcXVpcmUoJy4vY29uc3RhbnRzJyk7XG5jb25zdCB7XG4gIEV2ZW50VGFyZ2V0OiB7IGFkZEV2ZW50TGlzdGVuZXIsIHJlbW92ZUV2ZW50TGlzdGVuZXIgfVxufSA9IHJlcXVpcmUoJy4vZXZlbnQtdGFyZ2V0Jyk7XG5jb25zdCB7IGZvcm1hdCwgcGFyc2UgfSA9IHJlcXVpcmUoJy4vZXh0ZW5zaW9uJyk7XG5jb25zdCB7IHRvQnVmZmVyIH0gPSByZXF1aXJlKCcuL2J1ZmZlci11dGlsJyk7XG5cbmNvbnN0IHJlYWR5U3RhdGVzID0gWydDT05ORUNUSU5HJywgJ09QRU4nLCAnQ0xPU0lORycsICdDTE9TRUQnXTtcbmNvbnN0IHN1YnByb3RvY29sUmVnZXggPSAvXlshIyQlJicqK1xcLS4wLTlBLVpeX2B8YS16fl0rJC87XG5jb25zdCBwcm90b2NvbFZlcnNpb25zID0gWzgsIDEzXTtcbmNvbnN0IGNsb3NlVGltZW91dCA9IDMwICogMTAwMDtcblxuLyoqXG4gKiBDbGFzcyByZXByZXNlbnRpbmcgYSBXZWJTb2NrZXQuXG4gKlxuICogQGV4dGVuZHMgRXZlbnRFbWl0dGVyXG4gKi9cbmNsYXNzIFdlYlNvY2tldCBleHRlbmRzIEV2ZW50RW1pdHRlciB7XG4gIC8qKlxuICAgKiBDcmVhdGUgYSBuZXcgYFdlYlNvY2tldGAuXG4gICAqXG4gICAqIEBwYXJhbSB7KFN0cmluZ3xVUkwpfSBhZGRyZXNzIFRoZSBVUkwgdG8gd2hpY2ggdG8gY29ubmVjdFxuICAgKiBAcGFyYW0geyhTdHJpbmd8U3RyaW5nW10pfSBbcHJvdG9jb2xzXSBUaGUgc3VicHJvdG9jb2xzXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9uc10gQ29ubmVjdGlvbiBvcHRpb25zXG4gICAqL1xuICBjb25zdHJ1Y3RvcihhZGRyZXNzLCBwcm90b2NvbHMsIG9wdGlvbnMpIHtcbiAgICBzdXBlcigpO1xuXG4gICAgdGhpcy5fYmluYXJ5VHlwZSA9IEJJTkFSWV9UWVBFU1swXTtcbiAgICB0aGlzLl9jbG9zZUNvZGUgPSAxMDA2O1xuICAgIHRoaXMuX2Nsb3NlRnJhbWVSZWNlaXZlZCA9IGZhbHNlO1xuICAgIHRoaXMuX2Nsb3NlRnJhbWVTZW50ID0gZmFsc2U7XG4gICAgdGhpcy5fY2xvc2VNZXNzYWdlID0gRU1QVFlfQlVGRkVSO1xuICAgIHRoaXMuX2Nsb3NlVGltZXIgPSBudWxsO1xuICAgIHRoaXMuX2V4dGVuc2lvbnMgPSB7fTtcbiAgICB0aGlzLl9wYXVzZWQgPSBmYWxzZTtcbiAgICB0aGlzLl9wcm90b2NvbCA9ICcnO1xuICAgIHRoaXMuX3JlYWR5U3RhdGUgPSBXZWJTb2NrZXQuQ09OTkVDVElORztcbiAgICB0aGlzLl9yZWNlaXZlciA9IG51bGw7XG4gICAgdGhpcy5fc2VuZGVyID0gbnVsbDtcbiAgICB0aGlzLl9zb2NrZXQgPSBudWxsO1xuXG4gICAgaWYgKGFkZHJlc3MgIT09IG51bGwpIHtcbiAgICAgIHRoaXMuX2J1ZmZlcmVkQW1vdW50ID0gMDtcbiAgICAgIHRoaXMuX2lzU2VydmVyID0gZmFsc2U7XG4gICAgICB0aGlzLl9yZWRpcmVjdHMgPSAwO1xuXG4gICAgICBpZiAocHJvdG9jb2xzID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgcHJvdG9jb2xzID0gW107XG4gICAgICB9IGVsc2UgaWYgKCFBcnJheS5pc0FycmF5KHByb3RvY29scykpIHtcbiAgICAgICAgaWYgKHR5cGVvZiBwcm90b2NvbHMgPT09ICdvYmplY3QnICYmIHByb3RvY29scyAhPT0gbnVsbCkge1xuICAgICAgICAgIG9wdGlvbnMgPSBwcm90b2NvbHM7XG4gICAgICAgICAgcHJvdG9jb2xzID0gW107XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcHJvdG9jb2xzID0gW3Byb3RvY29sc107XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgaW5pdEFzQ2xpZW50KHRoaXMsIGFkZHJlc3MsIHByb3RvY29scywgb3B0aW9ucyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuX2lzU2VydmVyID0gdHJ1ZTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogVGhpcyBkZXZpYXRlcyBmcm9tIHRoZSBXSEFUV0cgaW50ZXJmYWNlIHNpbmNlIHdzIGRvZXNuJ3Qgc3VwcG9ydCB0aGVcbiAgICogcmVxdWlyZWQgZGVmYXVsdCBcImJsb2JcIiB0eXBlIChpbnN0ZWFkIHdlIGRlZmluZSBhIGN1c3RvbSBcIm5vZGVidWZmZXJcIlxuICAgKiB0eXBlKS5cbiAgICpcbiAgICogQHR5cGUge1N0cmluZ31cbiAgICovXG4gIGdldCBiaW5hcnlUeXBlKCkge1xuICAgIHJldHVybiB0aGlzLl9iaW5hcnlUeXBlO1xuICB9XG5cbiAgc2V0IGJpbmFyeVR5cGUodHlwZSkge1xuICAgIGlmICghQklOQVJZX1RZUEVTLmluY2x1ZGVzKHR5cGUpKSByZXR1cm47XG5cbiAgICB0aGlzLl9iaW5hcnlUeXBlID0gdHlwZTtcblxuICAgIC8vXG4gICAgLy8gQWxsb3cgdG8gY2hhbmdlIGBiaW5hcnlUeXBlYCBvbiB0aGUgZmx5LlxuICAgIC8vXG4gICAgaWYgKHRoaXMuX3JlY2VpdmVyKSB0aGlzLl9yZWNlaXZlci5fYmluYXJ5VHlwZSA9IHR5cGU7XG4gIH1cblxuICAvKipcbiAgICogQHR5cGUge051bWJlcn1cbiAgICovXG4gIGdldCBidWZmZXJlZEFtb3VudCgpIHtcbiAgICBpZiAoIXRoaXMuX3NvY2tldCkgcmV0dXJuIHRoaXMuX2J1ZmZlcmVkQW1vdW50O1xuXG4gICAgcmV0dXJuIHRoaXMuX3NvY2tldC5fd3JpdGFibGVTdGF0ZS5sZW5ndGggKyB0aGlzLl9zZW5kZXIuX2J1ZmZlcmVkQnl0ZXM7XG4gIH1cblxuICAvKipcbiAgICogQHR5cGUge1N0cmluZ31cbiAgICovXG4gIGdldCBleHRlbnNpb25zKCkge1xuICAgIHJldHVybiBPYmplY3Qua2V5cyh0aGlzLl9leHRlbnNpb25zKS5qb2luKCk7XG4gIH1cblxuICAvKipcbiAgICogQHR5cGUge0Jvb2xlYW59XG4gICAqL1xuICBnZXQgaXNQYXVzZWQoKSB7XG4gICAgcmV0dXJuIHRoaXMuX3BhdXNlZDtcbiAgfVxuXG4gIC8qKlxuICAgKiBAdHlwZSB7RnVuY3Rpb259XG4gICAqL1xuICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuICBnZXQgb25jbG9zZSgpIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIC8qKlxuICAgKiBAdHlwZSB7RnVuY3Rpb259XG4gICAqL1xuICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuICBnZXQgb25lcnJvcigpIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIC8qKlxuICAgKiBAdHlwZSB7RnVuY3Rpb259XG4gICAqL1xuICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuICBnZXQgb25vcGVuKCkge1xuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgLyoqXG4gICAqIEB0eXBlIHtGdW5jdGlvbn1cbiAgICovXG4gIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG4gIGdldCBvbm1lc3NhZ2UoKSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICAvKipcbiAgICogQHR5cGUge1N0cmluZ31cbiAgICovXG4gIGdldCBwcm90b2NvbCgpIHtcbiAgICByZXR1cm4gdGhpcy5fcHJvdG9jb2w7XG4gIH1cblxuICAvKipcbiAgICogQHR5cGUge051bWJlcn1cbiAgICovXG4gIGdldCByZWFkeVN0YXRlKCkge1xuICAgIHJldHVybiB0aGlzLl9yZWFkeVN0YXRlO1xuICB9XG5cbiAgLyoqXG4gICAqIEB0eXBlIHtTdHJpbmd9XG4gICAqL1xuICBnZXQgdXJsKCkge1xuICAgIHJldHVybiB0aGlzLl91cmw7XG4gIH1cblxuICAvKipcbiAgICogU2V0IHVwIHRoZSBzb2NrZXQgYW5kIHRoZSBpbnRlcm5hbCByZXNvdXJjZXMuXG4gICAqXG4gICAqIEBwYXJhbSB7KG5ldC5Tb2NrZXR8dGxzLlNvY2tldCl9IHNvY2tldCBUaGUgbmV0d29yayBzb2NrZXQgYmV0d2VlbiB0aGVcbiAgICogICAgIHNlcnZlciBhbmQgY2xpZW50XG4gICAqIEBwYXJhbSB7QnVmZmVyfSBoZWFkIFRoZSBmaXJzdCBwYWNrZXQgb2YgdGhlIHVwZ3JhZGVkIHN0cmVhbVxuICAgKiBAcGFyYW0ge09iamVjdH0gb3B0aW9ucyBPcHRpb25zIG9iamVjdFxuICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBbb3B0aW9ucy5nZW5lcmF0ZU1hc2tdIFRoZSBmdW5jdGlvbiB1c2VkIHRvIGdlbmVyYXRlIHRoZVxuICAgKiAgICAgbWFza2luZyBrZXlcbiAgICogQHBhcmFtIHtOdW1iZXJ9IFtvcHRpb25zLm1heFBheWxvYWQ9MF0gVGhlIG1heGltdW0gYWxsb3dlZCBtZXNzYWdlIHNpemVcbiAgICogQHBhcmFtIHtCb29sZWFufSBbb3B0aW9ucy5za2lwVVRGOFZhbGlkYXRpb249ZmFsc2VdIFNwZWNpZmllcyB3aGV0aGVyIG9yXG4gICAqICAgICBub3QgdG8gc2tpcCBVVEYtOCB2YWxpZGF0aW9uIGZvciB0ZXh0IGFuZCBjbG9zZSBtZXNzYWdlc1xuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgc2V0U29ja2V0KHNvY2tldCwgaGVhZCwgb3B0aW9ucykge1xuICAgIGNvbnN0IHJlY2VpdmVyID0gbmV3IFJlY2VpdmVyKHtcbiAgICAgIGJpbmFyeVR5cGU6IHRoaXMuYmluYXJ5VHlwZSxcbiAgICAgIGV4dGVuc2lvbnM6IHRoaXMuX2V4dGVuc2lvbnMsXG4gICAgICBpc1NlcnZlcjogdGhpcy5faXNTZXJ2ZXIsXG4gICAgICBtYXhQYXlsb2FkOiBvcHRpb25zLm1heFBheWxvYWQsXG4gICAgICBza2lwVVRGOFZhbGlkYXRpb246IG9wdGlvbnMuc2tpcFVURjhWYWxpZGF0aW9uXG4gICAgfSk7XG5cbiAgICB0aGlzLl9zZW5kZXIgPSBuZXcgU2VuZGVyKHNvY2tldCwgdGhpcy5fZXh0ZW5zaW9ucywgb3B0aW9ucy5nZW5lcmF0ZU1hc2spO1xuICAgIHRoaXMuX3JlY2VpdmVyID0gcmVjZWl2ZXI7XG4gICAgdGhpcy5fc29ja2V0ID0gc29ja2V0O1xuXG4gICAgcmVjZWl2ZXJba1dlYlNvY2tldF0gPSB0aGlzO1xuICAgIHNvY2tldFtrV2ViU29ja2V0XSA9IHRoaXM7XG5cbiAgICByZWNlaXZlci5vbignY29uY2x1ZGUnLCByZWNlaXZlck9uQ29uY2x1ZGUpO1xuICAgIHJlY2VpdmVyLm9uKCdkcmFpbicsIHJlY2VpdmVyT25EcmFpbik7XG4gICAgcmVjZWl2ZXIub24oJ2Vycm9yJywgcmVjZWl2ZXJPbkVycm9yKTtcbiAgICByZWNlaXZlci5vbignbWVzc2FnZScsIHJlY2VpdmVyT25NZXNzYWdlKTtcbiAgICByZWNlaXZlci5vbigncGluZycsIHJlY2VpdmVyT25QaW5nKTtcbiAgICByZWNlaXZlci5vbigncG9uZycsIHJlY2VpdmVyT25Qb25nKTtcblxuICAgIHNvY2tldC5zZXRUaW1lb3V0KDApO1xuICAgIHNvY2tldC5zZXROb0RlbGF5KCk7XG5cbiAgICBpZiAoaGVhZC5sZW5ndGggPiAwKSBzb2NrZXQudW5zaGlmdChoZWFkKTtcblxuICAgIHNvY2tldC5vbignY2xvc2UnLCBzb2NrZXRPbkNsb3NlKTtcbiAgICBzb2NrZXQub24oJ2RhdGEnLCBzb2NrZXRPbkRhdGEpO1xuICAgIHNvY2tldC5vbignZW5kJywgc29ja2V0T25FbmQpO1xuICAgIHNvY2tldC5vbignZXJyb3InLCBzb2NrZXRPbkVycm9yKTtcblxuICAgIHRoaXMuX3JlYWR5U3RhdGUgPSBXZWJTb2NrZXQuT1BFTjtcbiAgICB0aGlzLmVtaXQoJ29wZW4nKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBFbWl0IHRoZSBgJ2Nsb3NlJ2AgZXZlbnQuXG4gICAqXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBlbWl0Q2xvc2UoKSB7XG4gICAgaWYgKCF0aGlzLl9zb2NrZXQpIHtcbiAgICAgIHRoaXMuX3JlYWR5U3RhdGUgPSBXZWJTb2NrZXQuQ0xPU0VEO1xuICAgICAgdGhpcy5lbWl0KCdjbG9zZScsIHRoaXMuX2Nsb3NlQ29kZSwgdGhpcy5fY2xvc2VNZXNzYWdlKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5fZXh0ZW5zaW9uc1tQZXJNZXNzYWdlRGVmbGF0ZS5leHRlbnNpb25OYW1lXSkge1xuICAgICAgdGhpcy5fZXh0ZW5zaW9uc1tQZXJNZXNzYWdlRGVmbGF0ZS5leHRlbnNpb25OYW1lXS5jbGVhbnVwKCk7XG4gICAgfVxuXG4gICAgdGhpcy5fcmVjZWl2ZXIucmVtb3ZlQWxsTGlzdGVuZXJzKCk7XG4gICAgdGhpcy5fcmVhZHlTdGF0ZSA9IFdlYlNvY2tldC5DTE9TRUQ7XG4gICAgdGhpcy5lbWl0KCdjbG9zZScsIHRoaXMuX2Nsb3NlQ29kZSwgdGhpcy5fY2xvc2VNZXNzYWdlKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTdGFydCBhIGNsb3NpbmcgaGFuZHNoYWtlLlxuICAgKlxuICAgKiAgICAgICAgICArLS0tLS0tLS0tLSsgICArLS0tLS0tLS0tLS0rICAgKy0tLS0tLS0tLS0rXG4gICAqICAgICAtIC0gLXx3cy5jbG9zZSgpfC0tPnxjbG9zZSBmcmFtZXwtLT58d3MuY2xvc2UoKXwtIC0gLVxuICAgKiAgICB8ICAgICArLS0tLS0tLS0tLSsgICArLS0tLS0tLS0tLS0rICAgKy0tLS0tLS0tLS0rICAgICB8XG4gICAqICAgICAgICAgICstLS0tLS0tLS0tKyAgICstLS0tLS0tLS0tLSsgICAgICAgICB8XG4gICAqIENMT1NJTkcgIHx3cy5jbG9zZSgpfDwtLXxjbG9zZSBmcmFtZXw8LS0rLS0tLS0rICAgICAgIENMT1NJTkdcbiAgICogICAgICAgICAgKy0tLS0tLS0tLS0rICAgKy0tLS0tLS0tLS0tKyAgIHxcbiAgICogICAgfCAgICAgICAgICAgfCAgICAgICAgICAgICAgICAgICAgICAgIHwgICArLS0tKyAgICAgICAgfFxuICAgKiAgICAgICAgICAgICAgICArLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tKy0tPnxmaW58IC0gLSAtIC1cbiAgICogICAgfCAgICAgICAgICstLS0rICAgICAgICAgICAgICAgICAgICAgIHwgICArLS0tK1xuICAgKiAgICAgLSAtIC0gLSAtfGZpbnw8LS0tLS0tLS0tLS0tLS0tLS0tLS0tK1xuICAgKiAgICAgICAgICAgICAgKy0tLStcbiAgICpcbiAgICogQHBhcmFtIHtOdW1iZXJ9IFtjb2RlXSBTdGF0dXMgY29kZSBleHBsYWluaW5nIHdoeSB0aGUgY29ubmVjdGlvbiBpcyBjbG9zaW5nXG4gICAqIEBwYXJhbSB7KFN0cmluZ3xCdWZmZXIpfSBbZGF0YV0gVGhlIHJlYXNvbiB3aHkgdGhlIGNvbm5lY3Rpb24gaXNcbiAgICogICAgIGNsb3NpbmdcbiAgICogQHB1YmxpY1xuICAgKi9cbiAgY2xvc2UoY29kZSwgZGF0YSkge1xuICAgIGlmICh0aGlzLnJlYWR5U3RhdGUgPT09IFdlYlNvY2tldC5DTE9TRUQpIHJldHVybjtcbiAgICBpZiAodGhpcy5yZWFkeVN0YXRlID09PSBXZWJTb2NrZXQuQ09OTkVDVElORykge1xuICAgICAgY29uc3QgbXNnID0gJ1dlYlNvY2tldCB3YXMgY2xvc2VkIGJlZm9yZSB0aGUgY29ubmVjdGlvbiB3YXMgZXN0YWJsaXNoZWQnO1xuICAgICAgcmV0dXJuIGFib3J0SGFuZHNoYWtlKHRoaXMsIHRoaXMuX3JlcSwgbXNnKTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5yZWFkeVN0YXRlID09PSBXZWJTb2NrZXQuQ0xPU0lORykge1xuICAgICAgaWYgKFxuICAgICAgICB0aGlzLl9jbG9zZUZyYW1lU2VudCAmJlxuICAgICAgICAodGhpcy5fY2xvc2VGcmFtZVJlY2VpdmVkIHx8IHRoaXMuX3JlY2VpdmVyLl93cml0YWJsZVN0YXRlLmVycm9yRW1pdHRlZClcbiAgICAgICkge1xuICAgICAgICB0aGlzLl9zb2NrZXQuZW5kKCk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0aGlzLl9yZWFkeVN0YXRlID0gV2ViU29ja2V0LkNMT1NJTkc7XG4gICAgdGhpcy5fc2VuZGVyLmNsb3NlKGNvZGUsIGRhdGEsICF0aGlzLl9pc1NlcnZlciwgKGVycikgPT4ge1xuICAgICAgLy9cbiAgICAgIC8vIFRoaXMgZXJyb3IgaXMgaGFuZGxlZCBieSB0aGUgYCdlcnJvcidgIGxpc3RlbmVyIG9uIHRoZSBzb2NrZXQuIFdlIG9ubHlcbiAgICAgIC8vIHdhbnQgdG8ga25vdyBpZiB0aGUgY2xvc2UgZnJhbWUgaGFzIGJlZW4gc2VudCBoZXJlLlxuICAgICAgLy9cbiAgICAgIGlmIChlcnIpIHJldHVybjtcblxuICAgICAgdGhpcy5fY2xvc2VGcmFtZVNlbnQgPSB0cnVlO1xuXG4gICAgICBpZiAoXG4gICAgICAgIHRoaXMuX2Nsb3NlRnJhbWVSZWNlaXZlZCB8fFxuICAgICAgICB0aGlzLl9yZWNlaXZlci5fd3JpdGFibGVTdGF0ZS5lcnJvckVtaXR0ZWRcbiAgICAgICkge1xuICAgICAgICB0aGlzLl9zb2NrZXQuZW5kKCk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICAvL1xuICAgIC8vIFNwZWNpZnkgYSB0aW1lb3V0IGZvciB0aGUgY2xvc2luZyBoYW5kc2hha2UgdG8gY29tcGxldGUuXG4gICAgLy9cbiAgICB0aGlzLl9jbG9zZVRpbWVyID0gc2V0VGltZW91dChcbiAgICAgIHRoaXMuX3NvY2tldC5kZXN0cm95LmJpbmQodGhpcy5fc29ja2V0KSxcbiAgICAgIGNsb3NlVGltZW91dFxuICAgICk7XG4gIH1cblxuICAvKipcbiAgICogUGF1c2UgdGhlIHNvY2tldC5cbiAgICpcbiAgICogQHB1YmxpY1xuICAgKi9cbiAgcGF1c2UoKSB7XG4gICAgaWYgKFxuICAgICAgdGhpcy5yZWFkeVN0YXRlID09PSBXZWJTb2NrZXQuQ09OTkVDVElORyB8fFxuICAgICAgdGhpcy5yZWFkeVN0YXRlID09PSBXZWJTb2NrZXQuQ0xPU0VEXG4gICAgKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdGhpcy5fcGF1c2VkID0gdHJ1ZTtcbiAgICB0aGlzLl9zb2NrZXQucGF1c2UoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZW5kIGEgcGluZy5cbiAgICpcbiAgICogQHBhcmFtIHsqfSBbZGF0YV0gVGhlIGRhdGEgdG8gc2VuZFxuICAgKiBAcGFyYW0ge0Jvb2xlYW59IFttYXNrXSBJbmRpY2F0ZXMgd2hldGhlciBvciBub3QgdG8gbWFzayBgZGF0YWBcbiAgICogQHBhcmFtIHtGdW5jdGlvbn0gW2NiXSBDYWxsYmFjayB3aGljaCBpcyBleGVjdXRlZCB3aGVuIHRoZSBwaW5nIGlzIHNlbnRcbiAgICogQHB1YmxpY1xuICAgKi9cbiAgcGluZyhkYXRhLCBtYXNrLCBjYikge1xuICAgIGlmICh0aGlzLnJlYWR5U3RhdGUgPT09IFdlYlNvY2tldC5DT05ORUNUSU5HKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ1dlYlNvY2tldCBpcyBub3Qgb3BlbjogcmVhZHlTdGF0ZSAwIChDT05ORUNUSU5HKScpO1xuICAgIH1cblxuICAgIGlmICh0eXBlb2YgZGF0YSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgY2IgPSBkYXRhO1xuICAgICAgZGF0YSA9IG1hc2sgPSB1bmRlZmluZWQ7XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgbWFzayA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgY2IgPSBtYXNrO1xuICAgICAgbWFzayA9IHVuZGVmaW5lZDtcbiAgICB9XG5cbiAgICBpZiAodHlwZW9mIGRhdGEgPT09ICdudW1iZXInKSBkYXRhID0gZGF0YS50b1N0cmluZygpO1xuXG4gICAgaWYgKHRoaXMucmVhZHlTdGF0ZSAhPT0gV2ViU29ja2V0Lk9QRU4pIHtcbiAgICAgIHNlbmRBZnRlckNsb3NlKHRoaXMsIGRhdGEsIGNiKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAobWFzayA9PT0gdW5kZWZpbmVkKSBtYXNrID0gIXRoaXMuX2lzU2VydmVyO1xuICAgIHRoaXMuX3NlbmRlci5waW5nKGRhdGEgfHwgRU1QVFlfQlVGRkVSLCBtYXNrLCBjYik7XG4gIH1cblxuICAvKipcbiAgICogU2VuZCBhIHBvbmcuXG4gICAqXG4gICAqIEBwYXJhbSB7Kn0gW2RhdGFdIFRoZSBkYXRhIHRvIHNlbmRcbiAgICogQHBhcmFtIHtCb29sZWFufSBbbWFza10gSW5kaWNhdGVzIHdoZXRoZXIgb3Igbm90IHRvIG1hc2sgYGRhdGFgXG4gICAqIEBwYXJhbSB7RnVuY3Rpb259IFtjYl0gQ2FsbGJhY2sgd2hpY2ggaXMgZXhlY3V0ZWQgd2hlbiB0aGUgcG9uZyBpcyBzZW50XG4gICAqIEBwdWJsaWNcbiAgICovXG4gIHBvbmcoZGF0YSwgbWFzaywgY2IpIHtcbiAgICBpZiAodGhpcy5yZWFkeVN0YXRlID09PSBXZWJTb2NrZXQuQ09OTkVDVElORykge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdXZWJTb2NrZXQgaXMgbm90IG9wZW46IHJlYWR5U3RhdGUgMCAoQ09OTkVDVElORyknKTtcbiAgICB9XG5cbiAgICBpZiAodHlwZW9mIGRhdGEgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIGNiID0gZGF0YTtcbiAgICAgIGRhdGEgPSBtYXNrID0gdW5kZWZpbmVkO1xuICAgIH0gZWxzZSBpZiAodHlwZW9mIG1hc2sgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIGNiID0gbWFzaztcbiAgICAgIG1hc2sgPSB1bmRlZmluZWQ7XG4gICAgfVxuXG4gICAgaWYgKHR5cGVvZiBkYXRhID09PSAnbnVtYmVyJykgZGF0YSA9IGRhdGEudG9TdHJpbmcoKTtcblxuICAgIGlmICh0aGlzLnJlYWR5U3RhdGUgIT09IFdlYlNvY2tldC5PUEVOKSB7XG4gICAgICBzZW5kQWZ0ZXJDbG9zZSh0aGlzLCBkYXRhLCBjYik7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKG1hc2sgPT09IHVuZGVmaW5lZCkgbWFzayA9ICF0aGlzLl9pc1NlcnZlcjtcbiAgICB0aGlzLl9zZW5kZXIucG9uZyhkYXRhIHx8IEVNUFRZX0JVRkZFUiwgbWFzaywgY2IpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlc3VtZSB0aGUgc29ja2V0LlxuICAgKlxuICAgKiBAcHVibGljXG4gICAqL1xuICByZXN1bWUoKSB7XG4gICAgaWYgKFxuICAgICAgdGhpcy5yZWFkeVN0YXRlID09PSBXZWJTb2NrZXQuQ09OTkVDVElORyB8fFxuICAgICAgdGhpcy5yZWFkeVN0YXRlID09PSBXZWJTb2NrZXQuQ0xPU0VEXG4gICAgKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdGhpcy5fcGF1c2VkID0gZmFsc2U7XG4gICAgaWYgKCF0aGlzLl9yZWNlaXZlci5fd3JpdGFibGVTdGF0ZS5uZWVkRHJhaW4pIHRoaXMuX3NvY2tldC5yZXN1bWUoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTZW5kIGEgZGF0YSBtZXNzYWdlLlxuICAgKlxuICAgKiBAcGFyYW0geyp9IGRhdGEgVGhlIG1lc3NhZ2UgdG8gc2VuZFxuICAgKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnNdIE9wdGlvbnMgb2JqZWN0XG4gICAqIEBwYXJhbSB7Qm9vbGVhbn0gW29wdGlvbnMuYmluYXJ5XSBTcGVjaWZpZXMgd2hldGhlciBgZGF0YWAgaXMgYmluYXJ5IG9yXG4gICAqICAgICB0ZXh0XG4gICAqIEBwYXJhbSB7Qm9vbGVhbn0gW29wdGlvbnMuY29tcHJlc3NdIFNwZWNpZmllcyB3aGV0aGVyIG9yIG5vdCB0byBjb21wcmVzc1xuICAgKiAgICAgYGRhdGFgXG4gICAqIEBwYXJhbSB7Qm9vbGVhbn0gW29wdGlvbnMuZmluPXRydWVdIFNwZWNpZmllcyB3aGV0aGVyIHRoZSBmcmFnbWVudCBpcyB0aGVcbiAgICogICAgIGxhc3Qgb25lXG4gICAqIEBwYXJhbSB7Qm9vbGVhbn0gW29wdGlvbnMubWFza10gU3BlY2lmaWVzIHdoZXRoZXIgb3Igbm90IHRvIG1hc2sgYGRhdGFgXG4gICAqIEBwYXJhbSB7RnVuY3Rpb259IFtjYl0gQ2FsbGJhY2sgd2hpY2ggaXMgZXhlY3V0ZWQgd2hlbiBkYXRhIGlzIHdyaXR0ZW4gb3V0XG4gICAqIEBwdWJsaWNcbiAgICovXG4gIHNlbmQoZGF0YSwgb3B0aW9ucywgY2IpIHtcbiAgICBpZiAodGhpcy5yZWFkeVN0YXRlID09PSBXZWJTb2NrZXQuQ09OTkVDVElORykge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdXZWJTb2NrZXQgaXMgbm90IG9wZW46IHJlYWR5U3RhdGUgMCAoQ09OTkVDVElORyknKTtcbiAgICB9XG5cbiAgICBpZiAodHlwZW9mIG9wdGlvbnMgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIGNiID0gb3B0aW9ucztcbiAgICAgIG9wdGlvbnMgPSB7fTtcbiAgICB9XG5cbiAgICBpZiAodHlwZW9mIGRhdGEgPT09ICdudW1iZXInKSBkYXRhID0gZGF0YS50b1N0cmluZygpO1xuXG4gICAgaWYgKHRoaXMucmVhZHlTdGF0ZSAhPT0gV2ViU29ja2V0Lk9QRU4pIHtcbiAgICAgIHNlbmRBZnRlckNsb3NlKHRoaXMsIGRhdGEsIGNiKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBvcHRzID0ge1xuICAgICAgYmluYXJ5OiB0eXBlb2YgZGF0YSAhPT0gJ3N0cmluZycsXG4gICAgICBtYXNrOiAhdGhpcy5faXNTZXJ2ZXIsXG4gICAgICBjb21wcmVzczogdHJ1ZSxcbiAgICAgIGZpbjogdHJ1ZSxcbiAgICAgIC4uLm9wdGlvbnNcbiAgICB9O1xuXG4gICAgaWYgKCF0aGlzLl9leHRlbnNpb25zW1Blck1lc3NhZ2VEZWZsYXRlLmV4dGVuc2lvbk5hbWVdKSB7XG4gICAgICBvcHRzLmNvbXByZXNzID0gZmFsc2U7XG4gICAgfVxuXG4gICAgdGhpcy5fc2VuZGVyLnNlbmQoZGF0YSB8fCBFTVBUWV9CVUZGRVIsIG9wdHMsIGNiKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBGb3JjaWJseSBjbG9zZSB0aGUgY29ubmVjdGlvbi5cbiAgICpcbiAgICogQHB1YmxpY1xuICAgKi9cbiAgdGVybWluYXRlKCkge1xuICAgIGlmICh0aGlzLnJlYWR5U3RhdGUgPT09IFdlYlNvY2tldC5DTE9TRUQpIHJldHVybjtcbiAgICBpZiAodGhpcy5yZWFkeVN0YXRlID09PSBXZWJTb2NrZXQuQ09OTkVDVElORykge1xuICAgICAgY29uc3QgbXNnID0gJ1dlYlNvY2tldCB3YXMgY2xvc2VkIGJlZm9yZSB0aGUgY29ubmVjdGlvbiB3YXMgZXN0YWJsaXNoZWQnO1xuICAgICAgcmV0dXJuIGFib3J0SGFuZHNoYWtlKHRoaXMsIHRoaXMuX3JlcSwgbXNnKTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5fc29ja2V0KSB7XG4gICAgICB0aGlzLl9yZWFkeVN0YXRlID0gV2ViU29ja2V0LkNMT1NJTkc7XG4gICAgICB0aGlzLl9zb2NrZXQuZGVzdHJveSgpO1xuICAgIH1cbiAgfVxufVxuXG4vKipcbiAqIEBjb25zdGFudCB7TnVtYmVyfSBDT05ORUNUSU5HXG4gKiBAbWVtYmVyb2YgV2ViU29ja2V0XG4gKi9cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShXZWJTb2NrZXQsICdDT05ORUNUSU5HJywge1xuICBlbnVtZXJhYmxlOiB0cnVlLFxuICB2YWx1ZTogcmVhZHlTdGF0ZXMuaW5kZXhPZignQ09OTkVDVElORycpXG59KTtcblxuLyoqXG4gKiBAY29uc3RhbnQge051bWJlcn0gQ09OTkVDVElOR1xuICogQG1lbWJlcm9mIFdlYlNvY2tldC5wcm90b3R5cGVcbiAqL1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KFdlYlNvY2tldC5wcm90b3R5cGUsICdDT05ORUNUSU5HJywge1xuICBlbnVtZXJhYmxlOiB0cnVlLFxuICB2YWx1ZTogcmVhZHlTdGF0ZXMuaW5kZXhPZignQ09OTkVDVElORycpXG59KTtcblxuLyoqXG4gKiBAY29uc3RhbnQge051bWJlcn0gT1BFTlxuICogQG1lbWJlcm9mIFdlYlNvY2tldFxuICovXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoV2ViU29ja2V0LCAnT1BFTicsIHtcbiAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgdmFsdWU6IHJlYWR5U3RhdGVzLmluZGV4T2YoJ09QRU4nKVxufSk7XG5cbi8qKlxuICogQGNvbnN0YW50IHtOdW1iZXJ9IE9QRU5cbiAqIEBtZW1iZXJvZiBXZWJTb2NrZXQucHJvdG90eXBlXG4gKi9cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShXZWJTb2NrZXQucHJvdG90eXBlLCAnT1BFTicsIHtcbiAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgdmFsdWU6IHJlYWR5U3RhdGVzLmluZGV4T2YoJ09QRU4nKVxufSk7XG5cbi8qKlxuICogQGNvbnN0YW50IHtOdW1iZXJ9IENMT1NJTkdcbiAqIEBtZW1iZXJvZiBXZWJTb2NrZXRcbiAqL1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KFdlYlNvY2tldCwgJ0NMT1NJTkcnLCB7XG4gIGVudW1lcmFibGU6IHRydWUsXG4gIHZhbHVlOiByZWFkeVN0YXRlcy5pbmRleE9mKCdDTE9TSU5HJylcbn0pO1xuXG4vKipcbiAqIEBjb25zdGFudCB7TnVtYmVyfSBDTE9TSU5HXG4gKiBAbWVtYmVyb2YgV2ViU29ja2V0LnByb3RvdHlwZVxuICovXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoV2ViU29ja2V0LnByb3RvdHlwZSwgJ0NMT1NJTkcnLCB7XG4gIGVudW1lcmFibGU6IHRydWUsXG4gIHZhbHVlOiByZWFkeVN0YXRlcy5pbmRleE9mKCdDTE9TSU5HJylcbn0pO1xuXG4vKipcbiAqIEBjb25zdGFudCB7TnVtYmVyfSBDTE9TRURcbiAqIEBtZW1iZXJvZiBXZWJTb2NrZXRcbiAqL1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KFdlYlNvY2tldCwgJ0NMT1NFRCcsIHtcbiAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgdmFsdWU6IHJlYWR5U3RhdGVzLmluZGV4T2YoJ0NMT1NFRCcpXG59KTtcblxuLyoqXG4gKiBAY29uc3RhbnQge051bWJlcn0gQ0xPU0VEXG4gKiBAbWVtYmVyb2YgV2ViU29ja2V0LnByb3RvdHlwZVxuICovXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoV2ViU29ja2V0LnByb3RvdHlwZSwgJ0NMT1NFRCcsIHtcbiAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgdmFsdWU6IHJlYWR5U3RhdGVzLmluZGV4T2YoJ0NMT1NFRCcpXG59KTtcblxuW1xuICAnYmluYXJ5VHlwZScsXG4gICdidWZmZXJlZEFtb3VudCcsXG4gICdleHRlbnNpb25zJyxcbiAgJ2lzUGF1c2VkJyxcbiAgJ3Byb3RvY29sJyxcbiAgJ3JlYWR5U3RhdGUnLFxuICAndXJsJ1xuXS5mb3JFYWNoKChwcm9wZXJ0eSkgPT4ge1xuICBPYmplY3QuZGVmaW5lUHJvcGVydHkoV2ViU29ja2V0LnByb3RvdHlwZSwgcHJvcGVydHksIHsgZW51bWVyYWJsZTogdHJ1ZSB9KTtcbn0pO1xuXG4vL1xuLy8gQWRkIHRoZSBgb25vcGVuYCwgYG9uZXJyb3JgLCBgb25jbG9zZWAsIGFuZCBgb25tZXNzYWdlYCBhdHRyaWJ1dGVzLlxuLy8gU2VlIGh0dHBzOi8vaHRtbC5zcGVjLndoYXR3Zy5vcmcvbXVsdGlwYWdlL2NvbW1zLmh0bWwjdGhlLXdlYnNvY2tldC1pbnRlcmZhY2Vcbi8vXG5bJ29wZW4nLCAnZXJyb3InLCAnY2xvc2UnLCAnbWVzc2FnZSddLmZvckVhY2goKG1ldGhvZCkgPT4ge1xuICBPYmplY3QuZGVmaW5lUHJvcGVydHkoV2ViU29ja2V0LnByb3RvdHlwZSwgYG9uJHttZXRob2R9YCwge1xuICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgZ2V0KCkge1xuICAgICAgZm9yIChjb25zdCBsaXN0ZW5lciBvZiB0aGlzLmxpc3RlbmVycyhtZXRob2QpKSB7XG4gICAgICAgIGlmIChsaXN0ZW5lcltrRm9yT25FdmVudEF0dHJpYnV0ZV0pIHJldHVybiBsaXN0ZW5lcltrTGlzdGVuZXJdO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9LFxuICAgIHNldChoYW5kbGVyKSB7XG4gICAgICBmb3IgKGNvbnN0IGxpc3RlbmVyIG9mIHRoaXMubGlzdGVuZXJzKG1ldGhvZCkpIHtcbiAgICAgICAgaWYgKGxpc3RlbmVyW2tGb3JPbkV2ZW50QXR0cmlidXRlXSkge1xuICAgICAgICAgIHRoaXMucmVtb3ZlTGlzdGVuZXIobWV0aG9kLCBsaXN0ZW5lcik7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgaWYgKHR5cGVvZiBoYW5kbGVyICE9PSAnZnVuY3Rpb24nKSByZXR1cm47XG5cbiAgICAgIHRoaXMuYWRkRXZlbnRMaXN0ZW5lcihtZXRob2QsIGhhbmRsZXIsIHtcbiAgICAgICAgW2tGb3JPbkV2ZW50QXR0cmlidXRlXTogdHJ1ZVxuICAgICAgfSk7XG4gICAgfVxuICB9KTtcbn0pO1xuXG5XZWJTb2NrZXQucHJvdG90eXBlLmFkZEV2ZW50TGlzdGVuZXIgPSBhZGRFdmVudExpc3RlbmVyO1xuV2ViU29ja2V0LnByb3RvdHlwZS5yZW1vdmVFdmVudExpc3RlbmVyID0gcmVtb3ZlRXZlbnRMaXN0ZW5lcjtcblxubW9kdWxlLmV4cG9ydHMgPSBXZWJTb2NrZXQ7XG5cbi8qKlxuICogSW5pdGlhbGl6ZSBhIFdlYlNvY2tldCBjbGllbnQuXG4gKlxuICogQHBhcmFtIHtXZWJTb2NrZXR9IHdlYnNvY2tldCBUaGUgY2xpZW50IHRvIGluaXRpYWxpemVcbiAqIEBwYXJhbSB7KFN0cmluZ3xVUkwpfSBhZGRyZXNzIFRoZSBVUkwgdG8gd2hpY2ggdG8gY29ubmVjdFxuICogQHBhcmFtIHtBcnJheX0gcHJvdG9jb2xzIFRoZSBzdWJwcm90b2NvbHNcbiAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9uc10gQ29ubmVjdGlvbiBvcHRpb25zXG4gKiBAcGFyYW0ge0Jvb2xlYW59IFtvcHRpb25zLmZvbGxvd1JlZGlyZWN0cz1mYWxzZV0gV2hldGhlciBvciBub3QgdG8gZm9sbG93XG4gKiAgICAgcmVkaXJlY3RzXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBbb3B0aW9ucy5nZW5lcmF0ZU1hc2tdIFRoZSBmdW5jdGlvbiB1c2VkIHRvIGdlbmVyYXRlIHRoZVxuICogICAgIG1hc2tpbmcga2V5XG4gKiBAcGFyYW0ge051bWJlcn0gW29wdGlvbnMuaGFuZHNoYWtlVGltZW91dF0gVGltZW91dCBpbiBtaWxsaXNlY29uZHMgZm9yIHRoZVxuICogICAgIGhhbmRzaGFrZSByZXF1ZXN0XG4gKiBAcGFyYW0ge051bWJlcn0gW29wdGlvbnMubWF4UGF5bG9hZD0xMDQ4NTc2MDBdIFRoZSBtYXhpbXVtIGFsbG93ZWQgbWVzc2FnZVxuICogICAgIHNpemVcbiAqIEBwYXJhbSB7TnVtYmVyfSBbb3B0aW9ucy5tYXhSZWRpcmVjdHM9MTBdIFRoZSBtYXhpbXVtIG51bWJlciBvZiByZWRpcmVjdHNcbiAqICAgICBhbGxvd2VkXG4gKiBAcGFyYW0ge1N0cmluZ30gW29wdGlvbnMub3JpZ2luXSBWYWx1ZSBvZiB0aGUgYE9yaWdpbmAgb3JcbiAqICAgICBgU2VjLVdlYlNvY2tldC1PcmlnaW5gIGhlYWRlclxuICogQHBhcmFtIHsoQm9vbGVhbnxPYmplY3QpfSBbb3B0aW9ucy5wZXJNZXNzYWdlRGVmbGF0ZT10cnVlXSBFbmFibGUvZGlzYWJsZVxuICogICAgIHBlcm1lc3NhZ2UtZGVmbGF0ZVxuICogQHBhcmFtIHtOdW1iZXJ9IFtvcHRpb25zLnByb3RvY29sVmVyc2lvbj0xM10gVmFsdWUgb2YgdGhlXG4gKiAgICAgYFNlYy1XZWJTb2NrZXQtVmVyc2lvbmAgaGVhZGVyXG4gKiBAcGFyYW0ge0Jvb2xlYW59IFtvcHRpb25zLnNraXBVVEY4VmFsaWRhdGlvbj1mYWxzZV0gU3BlY2lmaWVzIHdoZXRoZXIgb3JcbiAqICAgICBub3QgdG8gc2tpcCBVVEYtOCB2YWxpZGF0aW9uIGZvciB0ZXh0IGFuZCBjbG9zZSBtZXNzYWdlc1xuICogQHByaXZhdGVcbiAqL1xuZnVuY3Rpb24gaW5pdEFzQ2xpZW50KHdlYnNvY2tldCwgYWRkcmVzcywgcHJvdG9jb2xzLCBvcHRpb25zKSB7XG4gIGNvbnN0IG9wdHMgPSB7XG4gICAgcHJvdG9jb2xWZXJzaW9uOiBwcm90b2NvbFZlcnNpb25zWzFdLFxuICAgIG1heFBheWxvYWQ6IDEwMCAqIDEwMjQgKiAxMDI0LFxuICAgIHNraXBVVEY4VmFsaWRhdGlvbjogZmFsc2UsXG4gICAgcGVyTWVzc2FnZURlZmxhdGU6IHRydWUsXG4gICAgZm9sbG93UmVkaXJlY3RzOiBmYWxzZSxcbiAgICBtYXhSZWRpcmVjdHM6IDEwLFxuICAgIC4uLm9wdGlvbnMsXG4gICAgY3JlYXRlQ29ubmVjdGlvbjogdW5kZWZpbmVkLFxuICAgIHNvY2tldFBhdGg6IHVuZGVmaW5lZCxcbiAgICBob3N0bmFtZTogdW5kZWZpbmVkLFxuICAgIHByb3RvY29sOiB1bmRlZmluZWQsXG4gICAgdGltZW91dDogdW5kZWZpbmVkLFxuICAgIG1ldGhvZDogdW5kZWZpbmVkLFxuICAgIGhvc3Q6IHVuZGVmaW5lZCxcbiAgICBwYXRoOiB1bmRlZmluZWQsXG4gICAgcG9ydDogdW5kZWZpbmVkXG4gIH07XG5cbiAgaWYgKCFwcm90b2NvbFZlcnNpb25zLmluY2x1ZGVzKG9wdHMucHJvdG9jb2xWZXJzaW9uKSkge1xuICAgIHRocm93IG5ldyBSYW5nZUVycm9yKFxuICAgICAgYFVuc3VwcG9ydGVkIHByb3RvY29sIHZlcnNpb246ICR7b3B0cy5wcm90b2NvbFZlcnNpb259IGAgK1xuICAgICAgICBgKHN1cHBvcnRlZCB2ZXJzaW9uczogJHtwcm90b2NvbFZlcnNpb25zLmpvaW4oJywgJyl9KWBcbiAgICApO1xuICB9XG5cbiAgbGV0IHBhcnNlZFVybDtcblxuICBpZiAoYWRkcmVzcyBpbnN0YW5jZW9mIFVSTCkge1xuICAgIHBhcnNlZFVybCA9IGFkZHJlc3M7XG4gICAgd2Vic29ja2V0Ll91cmwgPSBhZGRyZXNzLmhyZWY7XG4gIH0gZWxzZSB7XG4gICAgdHJ5IHtcbiAgICAgIHBhcnNlZFVybCA9IG5ldyBVUkwoYWRkcmVzcyk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgdGhyb3cgbmV3IFN5bnRheEVycm9yKGBJbnZhbGlkIFVSTDogJHthZGRyZXNzfWApO1xuICAgIH1cblxuICAgIHdlYnNvY2tldC5fdXJsID0gYWRkcmVzcztcbiAgfVxuXG4gIGNvbnN0IGlzU2VjdXJlID0gcGFyc2VkVXJsLnByb3RvY29sID09PSAnd3NzOic7XG4gIGNvbnN0IGlzVW5peFNvY2tldCA9IHBhcnNlZFVybC5wcm90b2NvbCA9PT0gJ3dzK3VuaXg6JztcbiAgbGV0IGludmFsaWRVUkxNZXNzYWdlO1xuXG4gIGlmIChwYXJzZWRVcmwucHJvdG9jb2wgIT09ICd3czonICYmICFpc1NlY3VyZSAmJiAhaXNVbml4U29ja2V0KSB7XG4gICAgaW52YWxpZFVSTE1lc3NhZ2UgPVxuICAgICAgJ1RoZSBVUkxcXCdzIHByb3RvY29sIG11c3QgYmUgb25lIG9mIFwid3M6XCIsIFwid3NzOlwiLCBvciBcIndzK3VuaXg6XCInO1xuICB9IGVsc2UgaWYgKGlzVW5peFNvY2tldCAmJiAhcGFyc2VkVXJsLnBhdGhuYW1lKSB7XG4gICAgaW52YWxpZFVSTE1lc3NhZ2UgPSBcIlRoZSBVUkwncyBwYXRobmFtZSBpcyBlbXB0eVwiO1xuICB9IGVsc2UgaWYgKHBhcnNlZFVybC5oYXNoKSB7XG4gICAgaW52YWxpZFVSTE1lc3NhZ2UgPSAnVGhlIFVSTCBjb250YWlucyBhIGZyYWdtZW50IGlkZW50aWZpZXInO1xuICB9XG5cbiAgaWYgKGludmFsaWRVUkxNZXNzYWdlKSB7XG4gICAgY29uc3QgZXJyID0gbmV3IFN5bnRheEVycm9yKGludmFsaWRVUkxNZXNzYWdlKTtcblxuICAgIGlmICh3ZWJzb2NrZXQuX3JlZGlyZWN0cyA9PT0gMCkge1xuICAgICAgdGhyb3cgZXJyO1xuICAgIH0gZWxzZSB7XG4gICAgICBlbWl0RXJyb3JBbmRDbG9zZSh3ZWJzb2NrZXQsIGVycik7XG4gICAgICByZXR1cm47XG4gICAgfVxuICB9XG5cbiAgY29uc3QgZGVmYXVsdFBvcnQgPSBpc1NlY3VyZSA/IDQ0MyA6IDgwO1xuICBjb25zdCBrZXkgPSByYW5kb21CeXRlcygxNikudG9TdHJpbmcoJ2Jhc2U2NCcpO1xuICBjb25zdCBnZXQgPSBpc1NlY3VyZSA/IGh0dHBzLmdldCA6IGh0dHAuZ2V0O1xuICBjb25zdCBwcm90b2NvbFNldCA9IG5ldyBTZXQoKTtcbiAgbGV0IHBlck1lc3NhZ2VEZWZsYXRlO1xuXG4gIG9wdHMuY3JlYXRlQ29ubmVjdGlvbiA9IGlzU2VjdXJlID8gdGxzQ29ubmVjdCA6IG5ldENvbm5lY3Q7XG4gIG9wdHMuZGVmYXVsdFBvcnQgPSBvcHRzLmRlZmF1bHRQb3J0IHx8IGRlZmF1bHRQb3J0O1xuICBvcHRzLnBvcnQgPSBwYXJzZWRVcmwucG9ydCB8fCBkZWZhdWx0UG9ydDtcbiAgb3B0cy5ob3N0ID0gcGFyc2VkVXJsLmhvc3RuYW1lLnN0YXJ0c1dpdGgoJ1snKVxuICAgID8gcGFyc2VkVXJsLmhvc3RuYW1lLnNsaWNlKDEsIC0xKVxuICAgIDogcGFyc2VkVXJsLmhvc3RuYW1lO1xuICBvcHRzLmhlYWRlcnMgPSB7XG4gICAgJ1NlYy1XZWJTb2NrZXQtVmVyc2lvbic6IG9wdHMucHJvdG9jb2xWZXJzaW9uLFxuICAgICdTZWMtV2ViU29ja2V0LUtleSc6IGtleSxcbiAgICBDb25uZWN0aW9uOiAnVXBncmFkZScsXG4gICAgVXBncmFkZTogJ3dlYnNvY2tldCcsXG4gICAgLi4ub3B0cy5oZWFkZXJzXG4gIH07XG4gIG9wdHMucGF0aCA9IHBhcnNlZFVybC5wYXRobmFtZSArIHBhcnNlZFVybC5zZWFyY2g7XG4gIG9wdHMudGltZW91dCA9IG9wdHMuaGFuZHNoYWtlVGltZW91dDtcblxuICBpZiAob3B0cy5wZXJNZXNzYWdlRGVmbGF0ZSkge1xuICAgIHBlck1lc3NhZ2VEZWZsYXRlID0gbmV3IFBlck1lc3NhZ2VEZWZsYXRlKFxuICAgICAgb3B0cy5wZXJNZXNzYWdlRGVmbGF0ZSAhPT0gdHJ1ZSA/IG9wdHMucGVyTWVzc2FnZURlZmxhdGUgOiB7fSxcbiAgICAgIGZhbHNlLFxuICAgICAgb3B0cy5tYXhQYXlsb2FkXG4gICAgKTtcbiAgICBvcHRzLmhlYWRlcnNbJ1NlYy1XZWJTb2NrZXQtRXh0ZW5zaW9ucyddID0gZm9ybWF0KHtcbiAgICAgIFtQZXJNZXNzYWdlRGVmbGF0ZS5leHRlbnNpb25OYW1lXTogcGVyTWVzc2FnZURlZmxhdGUub2ZmZXIoKVxuICAgIH0pO1xuICB9XG4gIGlmIChwcm90b2NvbHMubGVuZ3RoKSB7XG4gICAgZm9yIChjb25zdCBwcm90b2NvbCBvZiBwcm90b2NvbHMpIHtcbiAgICAgIGlmIChcbiAgICAgICAgdHlwZW9mIHByb3RvY29sICE9PSAnc3RyaW5nJyB8fFxuICAgICAgICAhc3VicHJvdG9jb2xSZWdleC50ZXN0KHByb3RvY29sKSB8fFxuICAgICAgICBwcm90b2NvbFNldC5oYXMocHJvdG9jb2wpXG4gICAgICApIHtcbiAgICAgICAgdGhyb3cgbmV3IFN5bnRheEVycm9yKFxuICAgICAgICAgICdBbiBpbnZhbGlkIG9yIGR1cGxpY2F0ZWQgc3VicHJvdG9jb2wgd2FzIHNwZWNpZmllZCdcbiAgICAgICAgKTtcbiAgICAgIH1cblxuICAgICAgcHJvdG9jb2xTZXQuYWRkKHByb3RvY29sKTtcbiAgICB9XG5cbiAgICBvcHRzLmhlYWRlcnNbJ1NlYy1XZWJTb2NrZXQtUHJvdG9jb2wnXSA9IHByb3RvY29scy5qb2luKCcsJyk7XG4gIH1cbiAgaWYgKG9wdHMub3JpZ2luKSB7XG4gICAgaWYgKG9wdHMucHJvdG9jb2xWZXJzaW9uIDwgMTMpIHtcbiAgICAgIG9wdHMuaGVhZGVyc1snU2VjLVdlYlNvY2tldC1PcmlnaW4nXSA9IG9wdHMub3JpZ2luO1xuICAgIH0gZWxzZSB7XG4gICAgICBvcHRzLmhlYWRlcnMuT3JpZ2luID0gb3B0cy5vcmlnaW47XG4gICAgfVxuICB9XG4gIGlmIChwYXJzZWRVcmwudXNlcm5hbWUgfHwgcGFyc2VkVXJsLnBhc3N3b3JkKSB7XG4gICAgb3B0cy5hdXRoID0gYCR7cGFyc2VkVXJsLnVzZXJuYW1lfToke3BhcnNlZFVybC5wYXNzd29yZH1gO1xuICB9XG5cbiAgaWYgKGlzVW5peFNvY2tldCkge1xuICAgIGNvbnN0IHBhcnRzID0gb3B0cy5wYXRoLnNwbGl0KCc6Jyk7XG5cbiAgICBvcHRzLnNvY2tldFBhdGggPSBwYXJ0c1swXTtcbiAgICBvcHRzLnBhdGggPSBwYXJ0c1sxXTtcbiAgfVxuXG4gIGxldCByZXEgPSAod2Vic29ja2V0Ll9yZXEgPSBnZXQob3B0cykpO1xuXG4gIGlmIChvcHRzLnRpbWVvdXQpIHtcbiAgICByZXEub24oJ3RpbWVvdXQnLCAoKSA9PiB7XG4gICAgICBhYm9ydEhhbmRzaGFrZSh3ZWJzb2NrZXQsIHJlcSwgJ09wZW5pbmcgaGFuZHNoYWtlIGhhcyB0aW1lZCBvdXQnKTtcbiAgICB9KTtcbiAgfVxuXG4gIHJlcS5vbignZXJyb3InLCAoZXJyKSA9PiB7XG4gICAgaWYgKHJlcSA9PT0gbnVsbCB8fCByZXEuYWJvcnRlZCkgcmV0dXJuO1xuXG4gICAgcmVxID0gd2Vic29ja2V0Ll9yZXEgPSBudWxsO1xuICAgIGVtaXRFcnJvckFuZENsb3NlKHdlYnNvY2tldCwgZXJyKTtcbiAgfSk7XG5cbiAgcmVxLm9uKCdyZXNwb25zZScsIChyZXMpID0+IHtcbiAgICBjb25zdCBsb2NhdGlvbiA9IHJlcy5oZWFkZXJzLmxvY2F0aW9uO1xuICAgIGNvbnN0IHN0YXR1c0NvZGUgPSByZXMuc3RhdHVzQ29kZTtcblxuICAgIGlmIChcbiAgICAgIGxvY2F0aW9uICYmXG4gICAgICBvcHRzLmZvbGxvd1JlZGlyZWN0cyAmJlxuICAgICAgc3RhdHVzQ29kZSA+PSAzMDAgJiZcbiAgICAgIHN0YXR1c0NvZGUgPCA0MDBcbiAgICApIHtcbiAgICAgIGlmICgrK3dlYnNvY2tldC5fcmVkaXJlY3RzID4gb3B0cy5tYXhSZWRpcmVjdHMpIHtcbiAgICAgICAgYWJvcnRIYW5kc2hha2Uod2Vic29ja2V0LCByZXEsICdNYXhpbXVtIHJlZGlyZWN0cyBleGNlZWRlZCcpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIHJlcS5hYm9ydCgpO1xuXG4gICAgICBsZXQgYWRkcjtcblxuICAgICAgdHJ5IHtcbiAgICAgICAgYWRkciA9IG5ldyBVUkwobG9jYXRpb24sIGFkZHJlc3MpO1xuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBjb25zdCBlcnIgPSBuZXcgU3ludGF4RXJyb3IoYEludmFsaWQgVVJMOiAke2xvY2F0aW9ufWApO1xuICAgICAgICBlbWl0RXJyb3JBbmRDbG9zZSh3ZWJzb2NrZXQsIGVycik7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgaW5pdEFzQ2xpZW50KHdlYnNvY2tldCwgYWRkciwgcHJvdG9jb2xzLCBvcHRpb25zKTtcbiAgICB9IGVsc2UgaWYgKCF3ZWJzb2NrZXQuZW1pdCgndW5leHBlY3RlZC1yZXNwb25zZScsIHJlcSwgcmVzKSkge1xuICAgICAgYWJvcnRIYW5kc2hha2UoXG4gICAgICAgIHdlYnNvY2tldCxcbiAgICAgICAgcmVxLFxuICAgICAgICBgVW5leHBlY3RlZCBzZXJ2ZXIgcmVzcG9uc2U6ICR7cmVzLnN0YXR1c0NvZGV9YFxuICAgICAgKTtcbiAgICB9XG4gIH0pO1xuXG4gIHJlcS5vbigndXBncmFkZScsIChyZXMsIHNvY2tldCwgaGVhZCkgPT4ge1xuICAgIHdlYnNvY2tldC5lbWl0KCd1cGdyYWRlJywgcmVzKTtcblxuICAgIC8vXG4gICAgLy8gVGhlIHVzZXIgbWF5IGhhdmUgY2xvc2VkIHRoZSBjb25uZWN0aW9uIGZyb20gYSBsaXN0ZW5lciBvZiB0aGUgYHVwZ3JhZGVgXG4gICAgLy8gZXZlbnQuXG4gICAgLy9cbiAgICBpZiAod2Vic29ja2V0LnJlYWR5U3RhdGUgIT09IFdlYlNvY2tldC5DT05ORUNUSU5HKSByZXR1cm47XG5cbiAgICByZXEgPSB3ZWJzb2NrZXQuX3JlcSA9IG51bGw7XG5cbiAgICBjb25zdCBkaWdlc3QgPSBjcmVhdGVIYXNoKCdzaGExJylcbiAgICAgIC51cGRhdGUoa2V5ICsgR1VJRClcbiAgICAgIC5kaWdlc3QoJ2Jhc2U2NCcpO1xuXG4gICAgaWYgKHJlcy5oZWFkZXJzWydzZWMtd2Vic29ja2V0LWFjY2VwdCddICE9PSBkaWdlc3QpIHtcbiAgICAgIGFib3J0SGFuZHNoYWtlKHdlYnNvY2tldCwgc29ja2V0LCAnSW52YWxpZCBTZWMtV2ViU29ja2V0LUFjY2VwdCBoZWFkZXInKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBzZXJ2ZXJQcm90ID0gcmVzLmhlYWRlcnNbJ3NlYy13ZWJzb2NrZXQtcHJvdG9jb2wnXTtcbiAgICBsZXQgcHJvdEVycm9yO1xuXG4gICAgaWYgKHNlcnZlclByb3QgIT09IHVuZGVmaW5lZCkge1xuICAgICAgaWYgKCFwcm90b2NvbFNldC5zaXplKSB7XG4gICAgICAgIHByb3RFcnJvciA9ICdTZXJ2ZXIgc2VudCBhIHN1YnByb3RvY29sIGJ1dCBub25lIHdhcyByZXF1ZXN0ZWQnO1xuICAgICAgfSBlbHNlIGlmICghcHJvdG9jb2xTZXQuaGFzKHNlcnZlclByb3QpKSB7XG4gICAgICAgIHByb3RFcnJvciA9ICdTZXJ2ZXIgc2VudCBhbiBpbnZhbGlkIHN1YnByb3RvY29sJztcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKHByb3RvY29sU2V0LnNpemUpIHtcbiAgICAgIHByb3RFcnJvciA9ICdTZXJ2ZXIgc2VudCBubyBzdWJwcm90b2NvbCc7XG4gICAgfVxuXG4gICAgaWYgKHByb3RFcnJvcikge1xuICAgICAgYWJvcnRIYW5kc2hha2Uod2Vic29ja2V0LCBzb2NrZXQsIHByb3RFcnJvcik7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKHNlcnZlclByb3QpIHdlYnNvY2tldC5fcHJvdG9jb2wgPSBzZXJ2ZXJQcm90O1xuXG4gICAgY29uc3Qgc2VjV2ViU29ja2V0RXh0ZW5zaW9ucyA9IHJlcy5oZWFkZXJzWydzZWMtd2Vic29ja2V0LWV4dGVuc2lvbnMnXTtcblxuICAgIGlmIChzZWNXZWJTb2NrZXRFeHRlbnNpb25zICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIGlmICghcGVyTWVzc2FnZURlZmxhdGUpIHtcbiAgICAgICAgY29uc3QgbWVzc2FnZSA9XG4gICAgICAgICAgJ1NlcnZlciBzZW50IGEgU2VjLVdlYlNvY2tldC1FeHRlbnNpb25zIGhlYWRlciBidXQgbm8gZXh0ZW5zaW9uICcgK1xuICAgICAgICAgICd3YXMgcmVxdWVzdGVkJztcbiAgICAgICAgYWJvcnRIYW5kc2hha2Uod2Vic29ja2V0LCBzb2NrZXQsIG1lc3NhZ2UpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGxldCBleHRlbnNpb25zO1xuXG4gICAgICB0cnkge1xuICAgICAgICBleHRlbnNpb25zID0gcGFyc2Uoc2VjV2ViU29ja2V0RXh0ZW5zaW9ucyk7XG4gICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgY29uc3QgbWVzc2FnZSA9ICdJbnZhbGlkIFNlYy1XZWJTb2NrZXQtRXh0ZW5zaW9ucyBoZWFkZXInO1xuICAgICAgICBhYm9ydEhhbmRzaGFrZSh3ZWJzb2NrZXQsIHNvY2tldCwgbWVzc2FnZSk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgY29uc3QgZXh0ZW5zaW9uTmFtZXMgPSBPYmplY3Qua2V5cyhleHRlbnNpb25zKTtcblxuICAgICAgaWYgKFxuICAgICAgICBleHRlbnNpb25OYW1lcy5sZW5ndGggIT09IDEgfHxcbiAgICAgICAgZXh0ZW5zaW9uTmFtZXNbMF0gIT09IFBlck1lc3NhZ2VEZWZsYXRlLmV4dGVuc2lvbk5hbWVcbiAgICAgICkge1xuICAgICAgICBjb25zdCBtZXNzYWdlID0gJ1NlcnZlciBpbmRpY2F0ZWQgYW4gZXh0ZW5zaW9uIHRoYXQgd2FzIG5vdCByZXF1ZXN0ZWQnO1xuICAgICAgICBhYm9ydEhhbmRzaGFrZSh3ZWJzb2NrZXQsIHNvY2tldCwgbWVzc2FnZSk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgdHJ5IHtcbiAgICAgICAgcGVyTWVzc2FnZURlZmxhdGUuYWNjZXB0KGV4dGVuc2lvbnNbUGVyTWVzc2FnZURlZmxhdGUuZXh0ZW5zaW9uTmFtZV0pO1xuICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgIGNvbnN0IG1lc3NhZ2UgPSAnSW52YWxpZCBTZWMtV2ViU29ja2V0LUV4dGVuc2lvbnMgaGVhZGVyJztcbiAgICAgICAgYWJvcnRIYW5kc2hha2Uod2Vic29ja2V0LCBzb2NrZXQsIG1lc3NhZ2UpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIHdlYnNvY2tldC5fZXh0ZW5zaW9uc1tQZXJNZXNzYWdlRGVmbGF0ZS5leHRlbnNpb25OYW1lXSA9XG4gICAgICAgIHBlck1lc3NhZ2VEZWZsYXRlO1xuICAgIH1cblxuICAgIHdlYnNvY2tldC5zZXRTb2NrZXQoc29ja2V0LCBoZWFkLCB7XG4gICAgICBnZW5lcmF0ZU1hc2s6IG9wdHMuZ2VuZXJhdGVNYXNrLFxuICAgICAgbWF4UGF5bG9hZDogb3B0cy5tYXhQYXlsb2FkLFxuICAgICAgc2tpcFVURjhWYWxpZGF0aW9uOiBvcHRzLnNraXBVVEY4VmFsaWRhdGlvblxuICAgIH0pO1xuICB9KTtcbn1cblxuLyoqXG4gKiBFbWl0IHRoZSBgJ2Vycm9yJ2AgYW5kIGAnY2xvc2UnYCBldmVudC5cbiAqXG4gKiBAcGFyYW0ge1dlYlNvY2tldH0gd2Vic29ja2V0IFRoZSBXZWJTb2NrZXQgaW5zdGFuY2VcbiAqIEBwYXJhbSB7RXJyb3J9IFRoZSBlcnJvciB0byBlbWl0XG4gKiBAcHJpdmF0ZVxuICovXG5mdW5jdGlvbiBlbWl0RXJyb3JBbmRDbG9zZSh3ZWJzb2NrZXQsIGVycikge1xuICB3ZWJzb2NrZXQuX3JlYWR5U3RhdGUgPSBXZWJTb2NrZXQuQ0xPU0lORztcbiAgd2Vic29ja2V0LmVtaXQoJ2Vycm9yJywgZXJyKTtcbiAgd2Vic29ja2V0LmVtaXRDbG9zZSgpO1xufVxuXG4vKipcbiAqIENyZWF0ZSBhIGBuZXQuU29ja2V0YCBhbmQgaW5pdGlhdGUgYSBjb25uZWN0aW9uLlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zIENvbm5lY3Rpb24gb3B0aW9uc1xuICogQHJldHVybiB7bmV0LlNvY2tldH0gVGhlIG5ld2x5IGNyZWF0ZWQgc29ja2V0IHVzZWQgdG8gc3RhcnQgdGhlIGNvbm5lY3Rpb25cbiAqIEBwcml2YXRlXG4gKi9cbmZ1bmN0aW9uIG5ldENvbm5lY3Qob3B0aW9ucykge1xuICBvcHRpb25zLnBhdGggPSBvcHRpb25zLnNvY2tldFBhdGg7XG4gIHJldHVybiBuZXQuY29ubmVjdChvcHRpb25zKTtcbn1cblxuLyoqXG4gKiBDcmVhdGUgYSBgdGxzLlRMU1NvY2tldGAgYW5kIGluaXRpYXRlIGEgY29ubmVjdGlvbi5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gb3B0aW9ucyBDb25uZWN0aW9uIG9wdGlvbnNcbiAqIEByZXR1cm4ge3Rscy5UTFNTb2NrZXR9IFRoZSBuZXdseSBjcmVhdGVkIHNvY2tldCB1c2VkIHRvIHN0YXJ0IHRoZSBjb25uZWN0aW9uXG4gKiBAcHJpdmF0ZVxuICovXG5mdW5jdGlvbiB0bHNDb25uZWN0KG9wdGlvbnMpIHtcbiAgb3B0aW9ucy5wYXRoID0gdW5kZWZpbmVkO1xuXG4gIGlmICghb3B0aW9ucy5zZXJ2ZXJuYW1lICYmIG9wdGlvbnMuc2VydmVybmFtZSAhPT0gJycpIHtcbiAgICBvcHRpb25zLnNlcnZlcm5hbWUgPSBuZXQuaXNJUChvcHRpb25zLmhvc3QpID8gJycgOiBvcHRpb25zLmhvc3Q7XG4gIH1cblxuICByZXR1cm4gdGxzLmNvbm5lY3Qob3B0aW9ucyk7XG59XG5cbi8qKlxuICogQWJvcnQgdGhlIGhhbmRzaGFrZSBhbmQgZW1pdCBhbiBlcnJvci5cbiAqXG4gKiBAcGFyYW0ge1dlYlNvY2tldH0gd2Vic29ja2V0IFRoZSBXZWJTb2NrZXQgaW5zdGFuY2VcbiAqIEBwYXJhbSB7KGh0dHAuQ2xpZW50UmVxdWVzdHxuZXQuU29ja2V0fHRscy5Tb2NrZXQpfSBzdHJlYW0gVGhlIHJlcXVlc3QgdG9cbiAqICAgICBhYm9ydCBvciB0aGUgc29ja2V0IHRvIGRlc3Ryb3lcbiAqIEBwYXJhbSB7U3RyaW5nfSBtZXNzYWdlIFRoZSBlcnJvciBtZXNzYWdlXG4gKiBAcHJpdmF0ZVxuICovXG5mdW5jdGlvbiBhYm9ydEhhbmRzaGFrZSh3ZWJzb2NrZXQsIHN0cmVhbSwgbWVzc2FnZSkge1xuICB3ZWJzb2NrZXQuX3JlYWR5U3RhdGUgPSBXZWJTb2NrZXQuQ0xPU0lORztcblxuICBjb25zdCBlcnIgPSBuZXcgRXJyb3IobWVzc2FnZSk7XG4gIEVycm9yLmNhcHR1cmVTdGFja1RyYWNlKGVyciwgYWJvcnRIYW5kc2hha2UpO1xuXG4gIGlmIChzdHJlYW0uc2V0SGVhZGVyKSB7XG4gICAgc3RyZWFtLmFib3J0KCk7XG5cbiAgICBpZiAoc3RyZWFtLnNvY2tldCAmJiAhc3RyZWFtLnNvY2tldC5kZXN0cm95ZWQpIHtcbiAgICAgIC8vXG4gICAgICAvLyBPbiBOb2RlLmpzID49IDE0LjMuMCBgcmVxdWVzdC5hYm9ydCgpYCBkb2VzIG5vdCBkZXN0cm95IHRoZSBzb2NrZXQgaWZcbiAgICAgIC8vIGNhbGxlZCBhZnRlciB0aGUgcmVxdWVzdCBjb21wbGV0ZWQuIFNlZVxuICAgICAgLy8gaHR0cHM6Ly9naXRodWIuY29tL3dlYnNvY2tldHMvd3MvaXNzdWVzLzE4NjkuXG4gICAgICAvL1xuICAgICAgc3RyZWFtLnNvY2tldC5kZXN0cm95KCk7XG4gICAgfVxuXG4gICAgc3RyZWFtLm9uY2UoJ2Fib3J0Jywgd2Vic29ja2V0LmVtaXRDbG9zZS5iaW5kKHdlYnNvY2tldCkpO1xuICAgIHdlYnNvY2tldC5lbWl0KCdlcnJvcicsIGVycik7XG4gIH0gZWxzZSB7XG4gICAgc3RyZWFtLmRlc3Ryb3koZXJyKTtcbiAgICBzdHJlYW0ub25jZSgnZXJyb3InLCB3ZWJzb2NrZXQuZW1pdC5iaW5kKHdlYnNvY2tldCwgJ2Vycm9yJykpO1xuICAgIHN0cmVhbS5vbmNlKCdjbG9zZScsIHdlYnNvY2tldC5lbWl0Q2xvc2UuYmluZCh3ZWJzb2NrZXQpKTtcbiAgfVxufVxuXG4vKipcbiAqIEhhbmRsZSBjYXNlcyB3aGVyZSB0aGUgYHBpbmcoKWAsIGBwb25nKClgLCBvciBgc2VuZCgpYCBtZXRob2RzIGFyZSBjYWxsZWRcbiAqIHdoZW4gdGhlIGByZWFkeVN0YXRlYCBhdHRyaWJ1dGUgaXMgYENMT1NJTkdgIG9yIGBDTE9TRURgLlxuICpcbiAqIEBwYXJhbSB7V2ViU29ja2V0fSB3ZWJzb2NrZXQgVGhlIFdlYlNvY2tldCBpbnN0YW5jZVxuICogQHBhcmFtIHsqfSBbZGF0YV0gVGhlIGRhdGEgdG8gc2VuZFxuICogQHBhcmFtIHtGdW5jdGlvbn0gW2NiXSBDYWxsYmFja1xuICogQHByaXZhdGVcbiAqL1xuZnVuY3Rpb24gc2VuZEFmdGVyQ2xvc2Uod2Vic29ja2V0LCBkYXRhLCBjYikge1xuICBpZiAoZGF0YSkge1xuICAgIGNvbnN0IGxlbmd0aCA9IHRvQnVmZmVyKGRhdGEpLmxlbmd0aDtcblxuICAgIC8vXG4gICAgLy8gVGhlIGBfYnVmZmVyZWRBbW91bnRgIHByb3BlcnR5IGlzIHVzZWQgb25seSB3aGVuIHRoZSBwZWVyIGlzIGEgY2xpZW50IGFuZFxuICAgIC8vIHRoZSBvcGVuaW5nIGhhbmRzaGFrZSBmYWlscy4gVW5kZXIgdGhlc2UgY2lyY3Vtc3RhbmNlcywgaW4gZmFjdCwgdGhlXG4gICAgLy8gYHNldFNvY2tldCgpYCBtZXRob2QgaXMgbm90IGNhbGxlZCwgc28gdGhlIGBfc29ja2V0YCBhbmQgYF9zZW5kZXJgXG4gICAgLy8gcHJvcGVydGllcyBhcmUgc2V0IHRvIGBudWxsYC5cbiAgICAvL1xuICAgIGlmICh3ZWJzb2NrZXQuX3NvY2tldCkgd2Vic29ja2V0Ll9zZW5kZXIuX2J1ZmZlcmVkQnl0ZXMgKz0gbGVuZ3RoO1xuICAgIGVsc2Ugd2Vic29ja2V0Ll9idWZmZXJlZEFtb3VudCArPSBsZW5ndGg7XG4gIH1cblxuICBpZiAoY2IpIHtcbiAgICBjb25zdCBlcnIgPSBuZXcgRXJyb3IoXG4gICAgICBgV2ViU29ja2V0IGlzIG5vdCBvcGVuOiByZWFkeVN0YXRlICR7d2Vic29ja2V0LnJlYWR5U3RhdGV9IGAgK1xuICAgICAgICBgKCR7cmVhZHlTdGF0ZXNbd2Vic29ja2V0LnJlYWR5U3RhdGVdfSlgXG4gICAgKTtcbiAgICBjYihlcnIpO1xuICB9XG59XG5cbi8qKlxuICogVGhlIGxpc3RlbmVyIG9mIHRoZSBgUmVjZWl2ZXJgIGAnY29uY2x1ZGUnYCBldmVudC5cbiAqXG4gKiBAcGFyYW0ge051bWJlcn0gY29kZSBUaGUgc3RhdHVzIGNvZGVcbiAqIEBwYXJhbSB7QnVmZmVyfSByZWFzb24gVGhlIHJlYXNvbiBmb3IgY2xvc2luZ1xuICogQHByaXZhdGVcbiAqL1xuZnVuY3Rpb24gcmVjZWl2ZXJPbkNvbmNsdWRlKGNvZGUsIHJlYXNvbikge1xuICBjb25zdCB3ZWJzb2NrZXQgPSB0aGlzW2tXZWJTb2NrZXRdO1xuXG4gIHdlYnNvY2tldC5fY2xvc2VGcmFtZVJlY2VpdmVkID0gdHJ1ZTtcbiAgd2Vic29ja2V0Ll9jbG9zZU1lc3NhZ2UgPSByZWFzb247XG4gIHdlYnNvY2tldC5fY2xvc2VDb2RlID0gY29kZTtcblxuICBpZiAod2Vic29ja2V0Ll9zb2NrZXRba1dlYlNvY2tldF0gPT09IHVuZGVmaW5lZCkgcmV0dXJuO1xuXG4gIHdlYnNvY2tldC5fc29ja2V0LnJlbW92ZUxpc3RlbmVyKCdkYXRhJywgc29ja2V0T25EYXRhKTtcbiAgcHJvY2Vzcy5uZXh0VGljayhyZXN1bWUsIHdlYnNvY2tldC5fc29ja2V0KTtcblxuICBpZiAoY29kZSA9PT0gMTAwNSkgd2Vic29ja2V0LmNsb3NlKCk7XG4gIGVsc2Ugd2Vic29ja2V0LmNsb3NlKGNvZGUsIHJlYXNvbik7XG59XG5cbi8qKlxuICogVGhlIGxpc3RlbmVyIG9mIHRoZSBgUmVjZWl2ZXJgIGAnZHJhaW4nYCBldmVudC5cbiAqXG4gKiBAcHJpdmF0ZVxuICovXG5mdW5jdGlvbiByZWNlaXZlck9uRHJhaW4oKSB7XG4gIGNvbnN0IHdlYnNvY2tldCA9IHRoaXNba1dlYlNvY2tldF07XG5cbiAgaWYgKCF3ZWJzb2NrZXQuaXNQYXVzZWQpIHdlYnNvY2tldC5fc29ja2V0LnJlc3VtZSgpO1xufVxuXG4vKipcbiAqIFRoZSBsaXN0ZW5lciBvZiB0aGUgYFJlY2VpdmVyYCBgJ2Vycm9yJ2AgZXZlbnQuXG4gKlxuICogQHBhcmFtIHsoUmFuZ2VFcnJvcnxFcnJvcil9IGVyciBUaGUgZW1pdHRlZCBlcnJvclxuICogQHByaXZhdGVcbiAqL1xuZnVuY3Rpb24gcmVjZWl2ZXJPbkVycm9yKGVycikge1xuICBjb25zdCB3ZWJzb2NrZXQgPSB0aGlzW2tXZWJTb2NrZXRdO1xuXG4gIGlmICh3ZWJzb2NrZXQuX3NvY2tldFtrV2ViU29ja2V0XSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgd2Vic29ja2V0Ll9zb2NrZXQucmVtb3ZlTGlzdGVuZXIoJ2RhdGEnLCBzb2NrZXRPbkRhdGEpO1xuXG4gICAgLy9cbiAgICAvLyBPbiBOb2RlLmpzIDwgMTQuMC4wIHRoZSBgJ2Vycm9yJ2AgZXZlbnQgaXMgZW1pdHRlZCBzeW5jaHJvbm91c2x5LiBTZWVcbiAgICAvLyBodHRwczovL2dpdGh1Yi5jb20vd2Vic29ja2V0cy93cy9pc3N1ZXMvMTk0MC5cbiAgICAvL1xuICAgIHByb2Nlc3MubmV4dFRpY2socmVzdW1lLCB3ZWJzb2NrZXQuX3NvY2tldCk7XG5cbiAgICB3ZWJzb2NrZXQuY2xvc2UoZXJyW2tTdGF0dXNDb2RlXSk7XG4gIH1cblxuICB3ZWJzb2NrZXQuZW1pdCgnZXJyb3InLCBlcnIpO1xufVxuXG4vKipcbiAqIFRoZSBsaXN0ZW5lciBvZiB0aGUgYFJlY2VpdmVyYCBgJ2ZpbmlzaCdgIGV2ZW50LlxuICpcbiAqIEBwcml2YXRlXG4gKi9cbmZ1bmN0aW9uIHJlY2VpdmVyT25GaW5pc2goKSB7XG4gIHRoaXNba1dlYlNvY2tldF0uZW1pdENsb3NlKCk7XG59XG5cbi8qKlxuICogVGhlIGxpc3RlbmVyIG9mIHRoZSBgUmVjZWl2ZXJgIGAnbWVzc2FnZSdgIGV2ZW50LlxuICpcbiAqIEBwYXJhbSB7QnVmZmVyfEFycmF5QnVmZmVyfEJ1ZmZlcltdKX0gZGF0YSBUaGUgbWVzc2FnZVxuICogQHBhcmFtIHtCb29sZWFufSBpc0JpbmFyeSBTcGVjaWZpZXMgd2hldGhlciB0aGUgbWVzc2FnZSBpcyBiaW5hcnkgb3Igbm90XG4gKiBAcHJpdmF0ZVxuICovXG5mdW5jdGlvbiByZWNlaXZlck9uTWVzc2FnZShkYXRhLCBpc0JpbmFyeSkge1xuICB0aGlzW2tXZWJTb2NrZXRdLmVtaXQoJ21lc3NhZ2UnLCBkYXRhLCBpc0JpbmFyeSk7XG59XG5cbi8qKlxuICogVGhlIGxpc3RlbmVyIG9mIHRoZSBgUmVjZWl2ZXJgIGAncGluZydgIGV2ZW50LlxuICpcbiAqIEBwYXJhbSB7QnVmZmVyfSBkYXRhIFRoZSBkYXRhIGluY2x1ZGVkIGluIHRoZSBwaW5nIGZyYW1lXG4gKiBAcHJpdmF0ZVxuICovXG5mdW5jdGlvbiByZWNlaXZlck9uUGluZyhkYXRhKSB7XG4gIGNvbnN0IHdlYnNvY2tldCA9IHRoaXNba1dlYlNvY2tldF07XG5cbiAgd2Vic29ja2V0LnBvbmcoZGF0YSwgIXdlYnNvY2tldC5faXNTZXJ2ZXIsIE5PT1ApO1xuICB3ZWJzb2NrZXQuZW1pdCgncGluZycsIGRhdGEpO1xufVxuXG4vKipcbiAqIFRoZSBsaXN0ZW5lciBvZiB0aGUgYFJlY2VpdmVyYCBgJ3BvbmcnYCBldmVudC5cbiAqXG4gKiBAcGFyYW0ge0J1ZmZlcn0gZGF0YSBUaGUgZGF0YSBpbmNsdWRlZCBpbiB0aGUgcG9uZyBmcmFtZVxuICogQHByaXZhdGVcbiAqL1xuZnVuY3Rpb24gcmVjZWl2ZXJPblBvbmcoZGF0YSkge1xuICB0aGlzW2tXZWJTb2NrZXRdLmVtaXQoJ3BvbmcnLCBkYXRhKTtcbn1cblxuLyoqXG4gKiBSZXN1bWUgYSByZWFkYWJsZSBzdHJlYW1cbiAqXG4gKiBAcGFyYW0ge1JlYWRhYmxlfSBzdHJlYW0gVGhlIHJlYWRhYmxlIHN0cmVhbVxuICogQHByaXZhdGVcbiAqL1xuZnVuY3Rpb24gcmVzdW1lKHN0cmVhbSkge1xuICBzdHJlYW0ucmVzdW1lKCk7XG59XG5cbi8qKlxuICogVGhlIGxpc3RlbmVyIG9mIHRoZSBgbmV0LlNvY2tldGAgYCdjbG9zZSdgIGV2ZW50LlxuICpcbiAqIEBwcml2YXRlXG4gKi9cbmZ1bmN0aW9uIHNvY2tldE9uQ2xvc2UoKSB7XG4gIGNvbnN0IHdlYnNvY2tldCA9IHRoaXNba1dlYlNvY2tldF07XG5cbiAgdGhpcy5yZW1vdmVMaXN0ZW5lcignY2xvc2UnLCBzb2NrZXRPbkNsb3NlKTtcbiAgdGhpcy5yZW1vdmVMaXN0ZW5lcignZGF0YScsIHNvY2tldE9uRGF0YSk7XG4gIHRoaXMucmVtb3ZlTGlzdGVuZXIoJ2VuZCcsIHNvY2tldE9uRW5kKTtcblxuICB3ZWJzb2NrZXQuX3JlYWR5U3RhdGUgPSBXZWJTb2NrZXQuQ0xPU0lORztcblxuICBsZXQgY2h1bms7XG5cbiAgLy9cbiAgLy8gVGhlIGNsb3NlIGZyYW1lIG1pZ2h0IG5vdCBoYXZlIGJlZW4gcmVjZWl2ZWQgb3IgdGhlIGAnZW5kJ2AgZXZlbnQgZW1pdHRlZCxcbiAgLy8gZm9yIGV4YW1wbGUsIGlmIHRoZSBzb2NrZXQgd2FzIGRlc3Ryb3llZCBkdWUgdG8gYW4gZXJyb3IuIEVuc3VyZSB0aGF0IHRoZVxuICAvLyBgcmVjZWl2ZXJgIHN0cmVhbSBpcyBjbG9zZWQgYWZ0ZXIgd3JpdGluZyBhbnkgcmVtYWluaW5nIGJ1ZmZlcmVkIGRhdGEgdG9cbiAgLy8gaXQuIElmIHRoZSByZWFkYWJsZSBzaWRlIG9mIHRoZSBzb2NrZXQgaXMgaW4gZmxvd2luZyBtb2RlIHRoZW4gdGhlcmUgaXMgbm9cbiAgLy8gYnVmZmVyZWQgZGF0YSBhcyBldmVyeXRoaW5nIGhhcyBiZWVuIGFscmVhZHkgd3JpdHRlbiBhbmQgYHJlYWRhYmxlLnJlYWQoKWBcbiAgLy8gd2lsbCByZXR1cm4gYG51bGxgLiBJZiBpbnN0ZWFkLCB0aGUgc29ja2V0IGlzIHBhdXNlZCwgYW55IHBvc3NpYmxlIGJ1ZmZlcmVkXG4gIC8vIGRhdGEgd2lsbCBiZSByZWFkIGFzIGEgc2luZ2xlIGNodW5rLlxuICAvL1xuICBpZiAoXG4gICAgIXRoaXMuX3JlYWRhYmxlU3RhdGUuZW5kRW1pdHRlZCAmJlxuICAgICF3ZWJzb2NrZXQuX2Nsb3NlRnJhbWVSZWNlaXZlZCAmJlxuICAgICF3ZWJzb2NrZXQuX3JlY2VpdmVyLl93cml0YWJsZVN0YXRlLmVycm9yRW1pdHRlZCAmJlxuICAgIChjaHVuayA9IHdlYnNvY2tldC5fc29ja2V0LnJlYWQoKSkgIT09IG51bGxcbiAgKSB7XG4gICAgd2Vic29ja2V0Ll9yZWNlaXZlci53cml0ZShjaHVuayk7XG4gIH1cblxuICB3ZWJzb2NrZXQuX3JlY2VpdmVyLmVuZCgpO1xuXG4gIHRoaXNba1dlYlNvY2tldF0gPSB1bmRlZmluZWQ7XG5cbiAgY2xlYXJUaW1lb3V0KHdlYnNvY2tldC5fY2xvc2VUaW1lcik7XG5cbiAgaWYgKFxuICAgIHdlYnNvY2tldC5fcmVjZWl2ZXIuX3dyaXRhYmxlU3RhdGUuZmluaXNoZWQgfHxcbiAgICB3ZWJzb2NrZXQuX3JlY2VpdmVyLl93cml0YWJsZVN0YXRlLmVycm9yRW1pdHRlZFxuICApIHtcbiAgICB3ZWJzb2NrZXQuZW1pdENsb3NlKCk7XG4gIH0gZWxzZSB7XG4gICAgd2Vic29ja2V0Ll9yZWNlaXZlci5vbignZXJyb3InLCByZWNlaXZlck9uRmluaXNoKTtcbiAgICB3ZWJzb2NrZXQuX3JlY2VpdmVyLm9uKCdmaW5pc2gnLCByZWNlaXZlck9uRmluaXNoKTtcbiAgfVxufVxuXG4vKipcbiAqIFRoZSBsaXN0ZW5lciBvZiB0aGUgYG5ldC5Tb2NrZXRgIGAnZGF0YSdgIGV2ZW50LlxuICpcbiAqIEBwYXJhbSB7QnVmZmVyfSBjaHVuayBBIGNodW5rIG9mIGRhdGFcbiAqIEBwcml2YXRlXG4gKi9cbmZ1bmN0aW9uIHNvY2tldE9uRGF0YShjaHVuaykge1xuICBpZiAoIXRoaXNba1dlYlNvY2tldF0uX3JlY2VpdmVyLndyaXRlKGNodW5rKSkge1xuICAgIHRoaXMucGF1c2UoKTtcbiAgfVxufVxuXG4vKipcbiAqIFRoZSBsaXN0ZW5lciBvZiB0aGUgYG5ldC5Tb2NrZXRgIGAnZW5kJ2AgZXZlbnQuXG4gKlxuICogQHByaXZhdGVcbiAqL1xuZnVuY3Rpb24gc29ja2V0T25FbmQoKSB7XG4gIGNvbnN0IHdlYnNvY2tldCA9IHRoaXNba1dlYlNvY2tldF07XG5cbiAgd2Vic29ja2V0Ll9yZWFkeVN0YXRlID0gV2ViU29ja2V0LkNMT1NJTkc7XG4gIHdlYnNvY2tldC5fcmVjZWl2ZXIuZW5kKCk7XG4gIHRoaXMuZW5kKCk7XG59XG5cbi8qKlxuICogVGhlIGxpc3RlbmVyIG9mIHRoZSBgbmV0LlNvY2tldGAgYCdlcnJvcidgIGV2ZW50LlxuICpcbiAqIEBwcml2YXRlXG4gKi9cbmZ1bmN0aW9uIHNvY2tldE9uRXJyb3IoKSB7XG4gIGNvbnN0IHdlYnNvY2tldCA9IHRoaXNba1dlYlNvY2tldF07XG5cbiAgdGhpcy5yZW1vdmVMaXN0ZW5lcignZXJyb3InLCBzb2NrZXRPbkVycm9yKTtcbiAgdGhpcy5vbignZXJyb3InLCBOT09QKTtcblxuICBpZiAod2Vic29ja2V0KSB7XG4gICAgd2Vic29ja2V0Ll9yZWFkeVN0YXRlID0gV2ViU29ja2V0LkNMT1NJTkc7XG4gICAgdGhpcy5kZXN0cm95KCk7XG4gIH1cbn1cbiIsIid1c2Ugc3RyaWN0JztcblxuY29uc3QgeyB0b2tlbkNoYXJzIH0gPSByZXF1aXJlKCcuL3ZhbGlkYXRpb24nKTtcblxuLyoqXG4gKiBQYXJzZXMgdGhlIGBTZWMtV2ViU29ja2V0LVByb3RvY29sYCBoZWFkZXIgaW50byBhIHNldCBvZiBzdWJwcm90b2NvbCBuYW1lcy5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gaGVhZGVyIFRoZSBmaWVsZCB2YWx1ZSBvZiB0aGUgaGVhZGVyXG4gKiBAcmV0dXJuIHtTZXR9IFRoZSBzdWJwcm90b2NvbCBuYW1lc1xuICogQHB1YmxpY1xuICovXG5mdW5jdGlvbiBwYXJzZShoZWFkZXIpIHtcbiAgY29uc3QgcHJvdG9jb2xzID0gbmV3IFNldCgpO1xuICBsZXQgc3RhcnQgPSAtMTtcbiAgbGV0IGVuZCA9IC0xO1xuICBsZXQgaSA9IDA7XG5cbiAgZm9yIChpOyBpIDwgaGVhZGVyLmxlbmd0aDsgaSsrKSB7XG4gICAgY29uc3QgY29kZSA9IGhlYWRlci5jaGFyQ29kZUF0KGkpO1xuXG4gICAgaWYgKGVuZCA9PT0gLTEgJiYgdG9rZW5DaGFyc1tjb2RlXSA9PT0gMSkge1xuICAgICAgaWYgKHN0YXJ0ID09PSAtMSkgc3RhcnQgPSBpO1xuICAgIH0gZWxzZSBpZiAoXG4gICAgICBpICE9PSAwICYmXG4gICAgICAoY29kZSA9PT0gMHgyMCAvKiAnICcgKi8gfHwgY29kZSA9PT0gMHgwOSkgLyogJ1xcdCcgKi9cbiAgICApIHtcbiAgICAgIGlmIChlbmQgPT09IC0xICYmIHN0YXJ0ICE9PSAtMSkgZW5kID0gaTtcbiAgICB9IGVsc2UgaWYgKGNvZGUgPT09IDB4MmMgLyogJywnICovKSB7XG4gICAgICBpZiAoc3RhcnQgPT09IC0xKSB7XG4gICAgICAgIHRocm93IG5ldyBTeW50YXhFcnJvcihgVW5leHBlY3RlZCBjaGFyYWN0ZXIgYXQgaW5kZXggJHtpfWApO1xuICAgICAgfVxuXG4gICAgICBpZiAoZW5kID09PSAtMSkgZW5kID0gaTtcblxuICAgICAgY29uc3QgcHJvdG9jb2wgPSBoZWFkZXIuc2xpY2Uoc3RhcnQsIGVuZCk7XG5cbiAgICAgIGlmIChwcm90b2NvbHMuaGFzKHByb3RvY29sKSkge1xuICAgICAgICB0aHJvdyBuZXcgU3ludGF4RXJyb3IoYFRoZSBcIiR7cHJvdG9jb2x9XCIgc3VicHJvdG9jb2wgaXMgZHVwbGljYXRlZGApO1xuICAgICAgfVxuXG4gICAgICBwcm90b2NvbHMuYWRkKHByb3RvY29sKTtcbiAgICAgIHN0YXJ0ID0gZW5kID0gLTE7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93IG5ldyBTeW50YXhFcnJvcihgVW5leHBlY3RlZCBjaGFyYWN0ZXIgYXQgaW5kZXggJHtpfWApO1xuICAgIH1cbiAgfVxuXG4gIGlmIChzdGFydCA9PT0gLTEgfHwgZW5kICE9PSAtMSkge1xuICAgIHRocm93IG5ldyBTeW50YXhFcnJvcignVW5leHBlY3RlZCBlbmQgb2YgaW5wdXQnKTtcbiAgfVxuXG4gIGNvbnN0IHByb3RvY29sID0gaGVhZGVyLnNsaWNlKHN0YXJ0LCBpKTtcblxuICBpZiAocHJvdG9jb2xzLmhhcyhwcm90b2NvbCkpIHtcbiAgICB0aHJvdyBuZXcgU3ludGF4RXJyb3IoYFRoZSBcIiR7cHJvdG9jb2x9XCIgc3VicHJvdG9jb2wgaXMgZHVwbGljYXRlZGApO1xuICB9XG5cbiAgcHJvdG9jb2xzLmFkZChwcm90b2NvbCk7XG4gIHJldHVybiBwcm90b2NvbHM7XG59XG5cbm1vZHVsZS5leHBvcnRzID0geyBwYXJzZSB9O1xuIiwiLyogZXNsaW50IG5vLXVudXNlZC12YXJzOiBbXCJlcnJvclwiLCB7IFwidmFyc0lnbm9yZVBhdHRlcm5cIjogXCJebmV0fHRsc3xodHRwcyRcIiB9XSAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbmNvbnN0IEV2ZW50RW1pdHRlciA9IHJlcXVpcmUoJ2V2ZW50cycpO1xuY29uc3QgaHR0cCA9IHJlcXVpcmUoJ2h0dHAnKTtcbmNvbnN0IGh0dHBzID0gcmVxdWlyZSgnaHR0cHMnKTtcbmNvbnN0IG5ldCA9IHJlcXVpcmUoJ25ldCcpO1xuY29uc3QgdGxzID0gcmVxdWlyZSgndGxzJyk7XG5jb25zdCB7IGNyZWF0ZUhhc2ggfSA9IHJlcXVpcmUoJ2NyeXB0bycpO1xuXG5jb25zdCBleHRlbnNpb24gPSByZXF1aXJlKCcuL2V4dGVuc2lvbicpO1xuY29uc3QgUGVyTWVzc2FnZURlZmxhdGUgPSByZXF1aXJlKCcuL3Blcm1lc3NhZ2UtZGVmbGF0ZScpO1xuY29uc3Qgc3VicHJvdG9jb2wgPSByZXF1aXJlKCcuL3N1YnByb3RvY29sJyk7XG5jb25zdCBXZWJTb2NrZXQgPSByZXF1aXJlKCcuL3dlYnNvY2tldCcpO1xuY29uc3QgeyBHVUlELCBrV2ViU29ja2V0IH0gPSByZXF1aXJlKCcuL2NvbnN0YW50cycpO1xuXG5jb25zdCBrZXlSZWdleCA9IC9eWysvMC05QS1aYS16XXsyMn09PSQvO1xuXG5jb25zdCBSVU5OSU5HID0gMDtcbmNvbnN0IENMT1NJTkcgPSAxO1xuY29uc3QgQ0xPU0VEID0gMjtcblxuLyoqXG4gKiBDbGFzcyByZXByZXNlbnRpbmcgYSBXZWJTb2NrZXQgc2VydmVyLlxuICpcbiAqIEBleHRlbmRzIEV2ZW50RW1pdHRlclxuICovXG5jbGFzcyBXZWJTb2NrZXRTZXJ2ZXIgZXh0ZW5kcyBFdmVudEVtaXR0ZXIge1xuICAvKipcbiAgICogQ3JlYXRlIGEgYFdlYlNvY2tldFNlcnZlcmAgaW5zdGFuY2UuXG4gICAqXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zIENvbmZpZ3VyYXRpb24gb3B0aW9uc1xuICAgKiBAcGFyYW0ge051bWJlcn0gW29wdGlvbnMuYmFja2xvZz01MTFdIFRoZSBtYXhpbXVtIGxlbmd0aCBvZiB0aGUgcXVldWUgb2ZcbiAgICogICAgIHBlbmRpbmcgY29ubmVjdGlvbnNcbiAgICogQHBhcmFtIHtCb29sZWFufSBbb3B0aW9ucy5jbGllbnRUcmFja2luZz10cnVlXSBTcGVjaWZpZXMgd2hldGhlciBvciBub3QgdG9cbiAgICogICAgIHRyYWNrIGNsaWVudHNcbiAgICogQHBhcmFtIHtGdW5jdGlvbn0gW29wdGlvbnMuaGFuZGxlUHJvdG9jb2xzXSBBIGhvb2sgdG8gaGFuZGxlIHByb3RvY29sc1xuICAgKiBAcGFyYW0ge1N0cmluZ30gW29wdGlvbnMuaG9zdF0gVGhlIGhvc3RuYW1lIHdoZXJlIHRvIGJpbmQgdGhlIHNlcnZlclxuICAgKiBAcGFyYW0ge051bWJlcn0gW29wdGlvbnMubWF4UGF5bG9hZD0xMDQ4NTc2MDBdIFRoZSBtYXhpbXVtIGFsbG93ZWQgbWVzc2FnZVxuICAgKiAgICAgc2l6ZVxuICAgKiBAcGFyYW0ge0Jvb2xlYW59IFtvcHRpb25zLm5vU2VydmVyPWZhbHNlXSBFbmFibGUgbm8gc2VydmVyIG1vZGVcbiAgICogQHBhcmFtIHtTdHJpbmd9IFtvcHRpb25zLnBhdGhdIEFjY2VwdCBvbmx5IGNvbm5lY3Rpb25zIG1hdGNoaW5nIHRoaXMgcGF0aFxuICAgKiBAcGFyYW0geyhCb29sZWFufE9iamVjdCl9IFtvcHRpb25zLnBlck1lc3NhZ2VEZWZsYXRlPWZhbHNlXSBFbmFibGUvZGlzYWJsZVxuICAgKiAgICAgcGVybWVzc2FnZS1kZWZsYXRlXG4gICAqIEBwYXJhbSB7TnVtYmVyfSBbb3B0aW9ucy5wb3J0XSBUaGUgcG9ydCB3aGVyZSB0byBiaW5kIHRoZSBzZXJ2ZXJcbiAgICogQHBhcmFtIHsoaHR0cC5TZXJ2ZXJ8aHR0cHMuU2VydmVyKX0gW29wdGlvbnMuc2VydmVyXSBBIHByZS1jcmVhdGVkIEhUVFAvU1xuICAgKiAgICAgc2VydmVyIHRvIHVzZVxuICAgKiBAcGFyYW0ge0Jvb2xlYW59IFtvcHRpb25zLnNraXBVVEY4VmFsaWRhdGlvbj1mYWxzZV0gU3BlY2lmaWVzIHdoZXRoZXIgb3JcbiAgICogICAgIG5vdCB0byBza2lwIFVURi04IHZhbGlkYXRpb24gZm9yIHRleHQgYW5kIGNsb3NlIG1lc3NhZ2VzXG4gICAqIEBwYXJhbSB7RnVuY3Rpb259IFtvcHRpb25zLnZlcmlmeUNsaWVudF0gQSBob29rIHRvIHJlamVjdCBjb25uZWN0aW9uc1xuICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBbY2FsbGJhY2tdIEEgbGlzdGVuZXIgZm9yIHRoZSBgbGlzdGVuaW5nYCBldmVudFxuICAgKi9cbiAgY29uc3RydWN0b3Iob3B0aW9ucywgY2FsbGJhY2spIHtcbiAgICBzdXBlcigpO1xuXG4gICAgb3B0aW9ucyA9IHtcbiAgICAgIG1heFBheWxvYWQ6IDEwMCAqIDEwMjQgKiAxMDI0LFxuICAgICAgc2tpcFVURjhWYWxpZGF0aW9uOiBmYWxzZSxcbiAgICAgIHBlck1lc3NhZ2VEZWZsYXRlOiBmYWxzZSxcbiAgICAgIGhhbmRsZVByb3RvY29sczogbnVsbCxcbiAgICAgIGNsaWVudFRyYWNraW5nOiB0cnVlLFxuICAgICAgdmVyaWZ5Q2xpZW50OiBudWxsLFxuICAgICAgbm9TZXJ2ZXI6IGZhbHNlLFxuICAgICAgYmFja2xvZzogbnVsbCwgLy8gdXNlIGRlZmF1bHQgKDUxMSBhcyBpbXBsZW1lbnRlZCBpbiBuZXQuanMpXG4gICAgICBzZXJ2ZXI6IG51bGwsXG4gICAgICBob3N0OiBudWxsLFxuICAgICAgcGF0aDogbnVsbCxcbiAgICAgIHBvcnQ6IG51bGwsXG4gICAgICAuLi5vcHRpb25zXG4gICAgfTtcblxuICAgIGlmIChcbiAgICAgIChvcHRpb25zLnBvcnQgPT0gbnVsbCAmJiAhb3B0aW9ucy5zZXJ2ZXIgJiYgIW9wdGlvbnMubm9TZXJ2ZXIpIHx8XG4gICAgICAob3B0aW9ucy5wb3J0ICE9IG51bGwgJiYgKG9wdGlvbnMuc2VydmVyIHx8IG9wdGlvbnMubm9TZXJ2ZXIpKSB8fFxuICAgICAgKG9wdGlvbnMuc2VydmVyICYmIG9wdGlvbnMubm9TZXJ2ZXIpXG4gICAgKSB7XG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFxuICAgICAgICAnT25lIGFuZCBvbmx5IG9uZSBvZiB0aGUgXCJwb3J0XCIsIFwic2VydmVyXCIsIG9yIFwibm9TZXJ2ZXJcIiBvcHRpb25zICcgK1xuICAgICAgICAgICdtdXN0IGJlIHNwZWNpZmllZCdcbiAgICAgICk7XG4gICAgfVxuXG4gICAgaWYgKG9wdGlvbnMucG9ydCAhPSBudWxsKSB7XG4gICAgICB0aGlzLl9zZXJ2ZXIgPSBodHRwLmNyZWF0ZVNlcnZlcigocmVxLCByZXMpID0+IHtcbiAgICAgICAgY29uc3QgYm9keSA9IGh0dHAuU1RBVFVTX0NPREVTWzQyNl07XG5cbiAgICAgICAgcmVzLndyaXRlSGVhZCg0MjYsIHtcbiAgICAgICAgICAnQ29udGVudC1MZW5ndGgnOiBib2R5Lmxlbmd0aCxcbiAgICAgICAgICAnQ29udGVudC1UeXBlJzogJ3RleHQvcGxhaW4nXG4gICAgICAgIH0pO1xuICAgICAgICByZXMuZW5kKGJvZHkpO1xuICAgICAgfSk7XG4gICAgICB0aGlzLl9zZXJ2ZXIubGlzdGVuKFxuICAgICAgICBvcHRpb25zLnBvcnQsXG4gICAgICAgIG9wdGlvbnMuaG9zdCxcbiAgICAgICAgb3B0aW9ucy5iYWNrbG9nLFxuICAgICAgICBjYWxsYmFja1xuICAgICAgKTtcbiAgICB9IGVsc2UgaWYgKG9wdGlvbnMuc2VydmVyKSB7XG4gICAgICB0aGlzLl9zZXJ2ZXIgPSBvcHRpb25zLnNlcnZlcjtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5fc2VydmVyKSB7XG4gICAgICBjb25zdCBlbWl0Q29ubmVjdGlvbiA9IHRoaXMuZW1pdC5iaW5kKHRoaXMsICdjb25uZWN0aW9uJyk7XG5cbiAgICAgIHRoaXMuX3JlbW92ZUxpc3RlbmVycyA9IGFkZExpc3RlbmVycyh0aGlzLl9zZXJ2ZXIsIHtcbiAgICAgICAgbGlzdGVuaW5nOiB0aGlzLmVtaXQuYmluZCh0aGlzLCAnbGlzdGVuaW5nJyksXG4gICAgICAgIGVycm9yOiB0aGlzLmVtaXQuYmluZCh0aGlzLCAnZXJyb3InKSxcbiAgICAgICAgdXBncmFkZTogKHJlcSwgc29ja2V0LCBoZWFkKSA9PiB7XG4gICAgICAgICAgdGhpcy5oYW5kbGVVcGdyYWRlKHJlcSwgc29ja2V0LCBoZWFkLCBlbWl0Q29ubmVjdGlvbik7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cblxuICAgIGlmIChvcHRpb25zLnBlck1lc3NhZ2VEZWZsYXRlID09PSB0cnVlKSBvcHRpb25zLnBlck1lc3NhZ2VEZWZsYXRlID0ge307XG4gICAgaWYgKG9wdGlvbnMuY2xpZW50VHJhY2tpbmcpIHtcbiAgICAgIHRoaXMuY2xpZW50cyA9IG5ldyBTZXQoKTtcbiAgICAgIHRoaXMuX3Nob3VsZEVtaXRDbG9zZSA9IGZhbHNlO1xuICAgIH1cblxuICAgIHRoaXMub3B0aW9ucyA9IG9wdGlvbnM7XG4gICAgdGhpcy5fc3RhdGUgPSBSVU5OSU5HO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIGJvdW5kIGFkZHJlc3MsIHRoZSBhZGRyZXNzIGZhbWlseSBuYW1lLCBhbmQgcG9ydCBvZiB0aGUgc2VydmVyXG4gICAqIGFzIHJlcG9ydGVkIGJ5IHRoZSBvcGVyYXRpbmcgc3lzdGVtIGlmIGxpc3RlbmluZyBvbiBhbiBJUCBzb2NrZXQuXG4gICAqIElmIHRoZSBzZXJ2ZXIgaXMgbGlzdGVuaW5nIG9uIGEgcGlwZSBvciBVTklYIGRvbWFpbiBzb2NrZXQsIHRoZSBuYW1lIGlzXG4gICAqIHJldHVybmVkIGFzIGEgc3RyaW5nLlxuICAgKlxuICAgKiBAcmV0dXJuIHsoT2JqZWN0fFN0cmluZ3xudWxsKX0gVGhlIGFkZHJlc3Mgb2YgdGhlIHNlcnZlclxuICAgKiBAcHVibGljXG4gICAqL1xuICBhZGRyZXNzKCkge1xuICAgIGlmICh0aGlzLm9wdGlvbnMubm9TZXJ2ZXIpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignVGhlIHNlcnZlciBpcyBvcGVyYXRpbmcgaW4gXCJub1NlcnZlclwiIG1vZGUnKTtcbiAgICB9XG5cbiAgICBpZiAoIXRoaXMuX3NlcnZlcikgcmV0dXJuIG51bGw7XG4gICAgcmV0dXJuIHRoaXMuX3NlcnZlci5hZGRyZXNzKCk7XG4gIH1cblxuICAvKipcbiAgICogU3RvcCB0aGUgc2VydmVyIGZyb20gYWNjZXB0aW5nIG5ldyBjb25uZWN0aW9ucyBhbmQgZW1pdCB0aGUgYCdjbG9zZSdgIGV2ZW50XG4gICAqIHdoZW4gYWxsIGV4aXN0aW5nIGNvbm5lY3Rpb25zIGFyZSBjbG9zZWQuXG4gICAqXG4gICAqIEBwYXJhbSB7RnVuY3Rpb259IFtjYl0gQSBvbmUtdGltZSBsaXN0ZW5lciBmb3IgdGhlIGAnY2xvc2UnYCBldmVudFxuICAgKiBAcHVibGljXG4gICAqL1xuICBjbG9zZShjYikge1xuICAgIGlmICh0aGlzLl9zdGF0ZSA9PT0gQ0xPU0VEKSB7XG4gICAgICBpZiAoY2IpIHtcbiAgICAgICAgdGhpcy5vbmNlKCdjbG9zZScsICgpID0+IHtcbiAgICAgICAgICBjYihuZXcgRXJyb3IoJ1RoZSBzZXJ2ZXIgaXMgbm90IHJ1bm5pbmcnKSk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuXG4gICAgICBwcm9jZXNzLm5leHRUaWNrKGVtaXRDbG9zZSwgdGhpcyk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKGNiKSB0aGlzLm9uY2UoJ2Nsb3NlJywgY2IpO1xuXG4gICAgaWYgKHRoaXMuX3N0YXRlID09PSBDTE9TSU5HKSByZXR1cm47XG4gICAgdGhpcy5fc3RhdGUgPSBDTE9TSU5HO1xuXG4gICAgaWYgKHRoaXMub3B0aW9ucy5ub1NlcnZlciB8fCB0aGlzLm9wdGlvbnMuc2VydmVyKSB7XG4gICAgICBpZiAodGhpcy5fc2VydmVyKSB7XG4gICAgICAgIHRoaXMuX3JlbW92ZUxpc3RlbmVycygpO1xuICAgICAgICB0aGlzLl9yZW1vdmVMaXN0ZW5lcnMgPSB0aGlzLl9zZXJ2ZXIgPSBudWxsO1xuICAgICAgfVxuXG4gICAgICBpZiAodGhpcy5jbGllbnRzKSB7XG4gICAgICAgIGlmICghdGhpcy5jbGllbnRzLnNpemUpIHtcbiAgICAgICAgICBwcm9jZXNzLm5leHRUaWNrKGVtaXRDbG9zZSwgdGhpcyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhpcy5fc2hvdWxkRW1pdENsb3NlID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcHJvY2Vzcy5uZXh0VGljayhlbWl0Q2xvc2UsIHRoaXMpO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBjb25zdCBzZXJ2ZXIgPSB0aGlzLl9zZXJ2ZXI7XG5cbiAgICAgIHRoaXMuX3JlbW92ZUxpc3RlbmVycygpO1xuICAgICAgdGhpcy5fcmVtb3ZlTGlzdGVuZXJzID0gdGhpcy5fc2VydmVyID0gbnVsbDtcblxuICAgICAgLy9cbiAgICAgIC8vIFRoZSBIVFRQL1Mgc2VydmVyIHdhcyBjcmVhdGVkIGludGVybmFsbHkuIENsb3NlIGl0LCBhbmQgcmVseSBvbiBpdHNcbiAgICAgIC8vIGAnY2xvc2UnYCBldmVudC5cbiAgICAgIC8vXG4gICAgICBzZXJ2ZXIuY2xvc2UoKCkgPT4ge1xuICAgICAgICBlbWl0Q2xvc2UodGhpcyk7XG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogU2VlIGlmIGEgZ2l2ZW4gcmVxdWVzdCBzaG91bGQgYmUgaGFuZGxlZCBieSB0aGlzIHNlcnZlciBpbnN0YW5jZS5cbiAgICpcbiAgICogQHBhcmFtIHtodHRwLkluY29taW5nTWVzc2FnZX0gcmVxIFJlcXVlc3Qgb2JqZWN0IHRvIGluc3BlY3RcbiAgICogQHJldHVybiB7Qm9vbGVhbn0gYHRydWVgIGlmIHRoZSByZXF1ZXN0IGlzIHZhbGlkLCBlbHNlIGBmYWxzZWBcbiAgICogQHB1YmxpY1xuICAgKi9cbiAgc2hvdWxkSGFuZGxlKHJlcSkge1xuICAgIGlmICh0aGlzLm9wdGlvbnMucGF0aCkge1xuICAgICAgY29uc3QgaW5kZXggPSByZXEudXJsLmluZGV4T2YoJz8nKTtcbiAgICAgIGNvbnN0IHBhdGhuYW1lID0gaW5kZXggIT09IC0xID8gcmVxLnVybC5zbGljZSgwLCBpbmRleCkgOiByZXEudXJsO1xuXG4gICAgICBpZiAocGF0aG5hbWUgIT09IHRoaXMub3B0aW9ucy5wYXRoKSByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICAvKipcbiAgICogSGFuZGxlIGEgSFRUUCBVcGdyYWRlIHJlcXVlc3QuXG4gICAqXG4gICAqIEBwYXJhbSB7aHR0cC5JbmNvbWluZ01lc3NhZ2V9IHJlcSBUaGUgcmVxdWVzdCBvYmplY3RcbiAgICogQHBhcmFtIHsobmV0LlNvY2tldHx0bHMuU29ja2V0KX0gc29ja2V0IFRoZSBuZXR3b3JrIHNvY2tldCBiZXR3ZWVuIHRoZVxuICAgKiAgICAgc2VydmVyIGFuZCBjbGllbnRcbiAgICogQHBhcmFtIHtCdWZmZXJ9IGhlYWQgVGhlIGZpcnN0IHBhY2tldCBvZiB0aGUgdXBncmFkZWQgc3RyZWFtXG4gICAqIEBwYXJhbSB7RnVuY3Rpb259IGNiIENhbGxiYWNrXG4gICAqIEBwdWJsaWNcbiAgICovXG4gIGhhbmRsZVVwZ3JhZGUocmVxLCBzb2NrZXQsIGhlYWQsIGNiKSB7XG4gICAgc29ja2V0Lm9uKCdlcnJvcicsIHNvY2tldE9uRXJyb3IpO1xuXG4gICAgY29uc3Qga2V5ID1cbiAgICAgIHJlcS5oZWFkZXJzWydzZWMtd2Vic29ja2V0LWtleSddICE9PSB1bmRlZmluZWRcbiAgICAgICAgPyByZXEuaGVhZGVyc1snc2VjLXdlYnNvY2tldC1rZXknXVxuICAgICAgICA6IGZhbHNlO1xuICAgIGNvbnN0IHZlcnNpb24gPSArcmVxLmhlYWRlcnNbJ3NlYy13ZWJzb2NrZXQtdmVyc2lvbiddO1xuXG4gICAgaWYgKFxuICAgICAgcmVxLm1ldGhvZCAhPT0gJ0dFVCcgfHxcbiAgICAgIHJlcS5oZWFkZXJzLnVwZ3JhZGUudG9Mb3dlckNhc2UoKSAhPT0gJ3dlYnNvY2tldCcgfHxcbiAgICAgICFrZXkgfHxcbiAgICAgICFrZXlSZWdleC50ZXN0KGtleSkgfHxcbiAgICAgICh2ZXJzaW9uICE9PSA4ICYmIHZlcnNpb24gIT09IDEzKSB8fFxuICAgICAgIXRoaXMuc2hvdWxkSGFuZGxlKHJlcSlcbiAgICApIHtcbiAgICAgIHJldHVybiBhYm9ydEhhbmRzaGFrZShzb2NrZXQsIDQwMCk7XG4gICAgfVxuXG4gICAgY29uc3Qgc2VjV2ViU29ja2V0UHJvdG9jb2wgPSByZXEuaGVhZGVyc1snc2VjLXdlYnNvY2tldC1wcm90b2NvbCddO1xuICAgIGxldCBwcm90b2NvbHMgPSBuZXcgU2V0KCk7XG5cbiAgICBpZiAoc2VjV2ViU29ja2V0UHJvdG9jb2wgIT09IHVuZGVmaW5lZCkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgcHJvdG9jb2xzID0gc3VicHJvdG9jb2wucGFyc2Uoc2VjV2ViU29ja2V0UHJvdG9jb2wpO1xuICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgIHJldHVybiBhYm9ydEhhbmRzaGFrZShzb2NrZXQsIDQwMCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgY29uc3Qgc2VjV2ViU29ja2V0RXh0ZW5zaW9ucyA9IHJlcS5oZWFkZXJzWydzZWMtd2Vic29ja2V0LWV4dGVuc2lvbnMnXTtcbiAgICBjb25zdCBleHRlbnNpb25zID0ge307XG5cbiAgICBpZiAoXG4gICAgICB0aGlzLm9wdGlvbnMucGVyTWVzc2FnZURlZmxhdGUgJiZcbiAgICAgIHNlY1dlYlNvY2tldEV4dGVuc2lvbnMgIT09IHVuZGVmaW5lZFxuICAgICkge1xuICAgICAgY29uc3QgcGVyTWVzc2FnZURlZmxhdGUgPSBuZXcgUGVyTWVzc2FnZURlZmxhdGUoXG4gICAgICAgIHRoaXMub3B0aW9ucy5wZXJNZXNzYWdlRGVmbGF0ZSxcbiAgICAgICAgdHJ1ZSxcbiAgICAgICAgdGhpcy5vcHRpb25zLm1heFBheWxvYWRcbiAgICAgICk7XG5cbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IG9mZmVycyA9IGV4dGVuc2lvbi5wYXJzZShzZWNXZWJTb2NrZXRFeHRlbnNpb25zKTtcblxuICAgICAgICBpZiAob2ZmZXJzW1Blck1lc3NhZ2VEZWZsYXRlLmV4dGVuc2lvbk5hbWVdKSB7XG4gICAgICAgICAgcGVyTWVzc2FnZURlZmxhdGUuYWNjZXB0KG9mZmVyc1tQZXJNZXNzYWdlRGVmbGF0ZS5leHRlbnNpb25OYW1lXSk7XG4gICAgICAgICAgZXh0ZW5zaW9uc1tQZXJNZXNzYWdlRGVmbGF0ZS5leHRlbnNpb25OYW1lXSA9IHBlck1lc3NhZ2VEZWZsYXRlO1xuICAgICAgICB9XG4gICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgcmV0dXJuIGFib3J0SGFuZHNoYWtlKHNvY2tldCwgNDAwKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvL1xuICAgIC8vIE9wdGlvbmFsbHkgY2FsbCBleHRlcm5hbCBjbGllbnQgdmVyaWZpY2F0aW9uIGhhbmRsZXIuXG4gICAgLy9cbiAgICBpZiAodGhpcy5vcHRpb25zLnZlcmlmeUNsaWVudCkge1xuICAgICAgY29uc3QgaW5mbyA9IHtcbiAgICAgICAgb3JpZ2luOlxuICAgICAgICAgIHJlcS5oZWFkZXJzW2Ake3ZlcnNpb24gPT09IDggPyAnc2VjLXdlYnNvY2tldC1vcmlnaW4nIDogJ29yaWdpbid9YF0sXG4gICAgICAgIHNlY3VyZTogISEocmVxLnNvY2tldC5hdXRob3JpemVkIHx8IHJlcS5zb2NrZXQuZW5jcnlwdGVkKSxcbiAgICAgICAgcmVxXG4gICAgICB9O1xuXG4gICAgICBpZiAodGhpcy5vcHRpb25zLnZlcmlmeUNsaWVudC5sZW5ndGggPT09IDIpIHtcbiAgICAgICAgdGhpcy5vcHRpb25zLnZlcmlmeUNsaWVudChpbmZvLCAodmVyaWZpZWQsIGNvZGUsIG1lc3NhZ2UsIGhlYWRlcnMpID0+IHtcbiAgICAgICAgICBpZiAoIXZlcmlmaWVkKSB7XG4gICAgICAgICAgICByZXR1cm4gYWJvcnRIYW5kc2hha2Uoc29ja2V0LCBjb2RlIHx8IDQwMSwgbWVzc2FnZSwgaGVhZGVycyk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgdGhpcy5jb21wbGV0ZVVwZ3JhZGUoXG4gICAgICAgICAgICBleHRlbnNpb25zLFxuICAgICAgICAgICAga2V5LFxuICAgICAgICAgICAgcHJvdG9jb2xzLFxuICAgICAgICAgICAgcmVxLFxuICAgICAgICAgICAgc29ja2V0LFxuICAgICAgICAgICAgaGVhZCxcbiAgICAgICAgICAgIGNiXG4gICAgICAgICAgKTtcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgaWYgKCF0aGlzLm9wdGlvbnMudmVyaWZ5Q2xpZW50KGluZm8pKSByZXR1cm4gYWJvcnRIYW5kc2hha2Uoc29ja2V0LCA0MDEpO1xuICAgIH1cblxuICAgIHRoaXMuY29tcGxldGVVcGdyYWRlKGV4dGVuc2lvbnMsIGtleSwgcHJvdG9jb2xzLCByZXEsIHNvY2tldCwgaGVhZCwgY2IpO1xuICB9XG5cbiAgLyoqXG4gICAqIFVwZ3JhZGUgdGhlIGNvbm5lY3Rpb24gdG8gV2ViU29ja2V0LlxuICAgKlxuICAgKiBAcGFyYW0ge09iamVjdH0gZXh0ZW5zaW9ucyBUaGUgYWNjZXB0ZWQgZXh0ZW5zaW9uc1xuICAgKiBAcGFyYW0ge1N0cmluZ30ga2V5IFRoZSB2YWx1ZSBvZiB0aGUgYFNlYy1XZWJTb2NrZXQtS2V5YCBoZWFkZXJcbiAgICogQHBhcmFtIHtTZXR9IHByb3RvY29scyBUaGUgc3VicHJvdG9jb2xzXG4gICAqIEBwYXJhbSB7aHR0cC5JbmNvbWluZ01lc3NhZ2V9IHJlcSBUaGUgcmVxdWVzdCBvYmplY3RcbiAgICogQHBhcmFtIHsobmV0LlNvY2tldHx0bHMuU29ja2V0KX0gc29ja2V0IFRoZSBuZXR3b3JrIHNvY2tldCBiZXR3ZWVuIHRoZVxuICAgKiAgICAgc2VydmVyIGFuZCBjbGllbnRcbiAgICogQHBhcmFtIHtCdWZmZXJ9IGhlYWQgVGhlIGZpcnN0IHBhY2tldCBvZiB0aGUgdXBncmFkZWQgc3RyZWFtXG4gICAqIEBwYXJhbSB7RnVuY3Rpb259IGNiIENhbGxiYWNrXG4gICAqIEB0aHJvd3Mge0Vycm9yfSBJZiBjYWxsZWQgbW9yZSB0aGFuIG9uY2Ugd2l0aCB0aGUgc2FtZSBzb2NrZXRcbiAgICogQHByaXZhdGVcbiAgICovXG4gIGNvbXBsZXRlVXBncmFkZShleHRlbnNpb25zLCBrZXksIHByb3RvY29scywgcmVxLCBzb2NrZXQsIGhlYWQsIGNiKSB7XG4gICAgLy9cbiAgICAvLyBEZXN0cm95IHRoZSBzb2NrZXQgaWYgdGhlIGNsaWVudCBoYXMgYWxyZWFkeSBzZW50IGEgRklOIHBhY2tldC5cbiAgICAvL1xuICAgIGlmICghc29ja2V0LnJlYWRhYmxlIHx8ICFzb2NrZXQud3JpdGFibGUpIHJldHVybiBzb2NrZXQuZGVzdHJveSgpO1xuXG4gICAgaWYgKHNvY2tldFtrV2ViU29ja2V0XSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAnc2VydmVyLmhhbmRsZVVwZ3JhZGUoKSB3YXMgY2FsbGVkIG1vcmUgdGhhbiBvbmNlIHdpdGggdGhlIHNhbWUgJyArXG4gICAgICAgICAgJ3NvY2tldCwgcG9zc2libHkgZHVlIHRvIGEgbWlzY29uZmlndXJhdGlvbidcbiAgICAgICk7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuX3N0YXRlID4gUlVOTklORykgcmV0dXJuIGFib3J0SGFuZHNoYWtlKHNvY2tldCwgNTAzKTtcblxuICAgIGNvbnN0IGRpZ2VzdCA9IGNyZWF0ZUhhc2goJ3NoYTEnKVxuICAgICAgLnVwZGF0ZShrZXkgKyBHVUlEKVxuICAgICAgLmRpZ2VzdCgnYmFzZTY0Jyk7XG5cbiAgICBjb25zdCBoZWFkZXJzID0gW1xuICAgICAgJ0hUVFAvMS4xIDEwMSBTd2l0Y2hpbmcgUHJvdG9jb2xzJyxcbiAgICAgICdVcGdyYWRlOiB3ZWJzb2NrZXQnLFxuICAgICAgJ0Nvbm5lY3Rpb246IFVwZ3JhZGUnLFxuICAgICAgYFNlYy1XZWJTb2NrZXQtQWNjZXB0OiAke2RpZ2VzdH1gXG4gICAgXTtcblxuICAgIGNvbnN0IHdzID0gbmV3IFdlYlNvY2tldChudWxsKTtcblxuICAgIGlmIChwcm90b2NvbHMuc2l6ZSkge1xuICAgICAgLy9cbiAgICAgIC8vIE9wdGlvbmFsbHkgY2FsbCBleHRlcm5hbCBwcm90b2NvbCBzZWxlY3Rpb24gaGFuZGxlci5cbiAgICAgIC8vXG4gICAgICBjb25zdCBwcm90b2NvbCA9IHRoaXMub3B0aW9ucy5oYW5kbGVQcm90b2NvbHNcbiAgICAgICAgPyB0aGlzLm9wdGlvbnMuaGFuZGxlUHJvdG9jb2xzKHByb3RvY29scywgcmVxKVxuICAgICAgICA6IHByb3RvY29scy52YWx1ZXMoKS5uZXh0KCkudmFsdWU7XG5cbiAgICAgIGlmIChwcm90b2NvbCkge1xuICAgICAgICBoZWFkZXJzLnB1c2goYFNlYy1XZWJTb2NrZXQtUHJvdG9jb2w6ICR7cHJvdG9jb2x9YCk7XG4gICAgICAgIHdzLl9wcm90b2NvbCA9IHByb3RvY29sO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChleHRlbnNpb25zW1Blck1lc3NhZ2VEZWZsYXRlLmV4dGVuc2lvbk5hbWVdKSB7XG4gICAgICBjb25zdCBwYXJhbXMgPSBleHRlbnNpb25zW1Blck1lc3NhZ2VEZWZsYXRlLmV4dGVuc2lvbk5hbWVdLnBhcmFtcztcbiAgICAgIGNvbnN0IHZhbHVlID0gZXh0ZW5zaW9uLmZvcm1hdCh7XG4gICAgICAgIFtQZXJNZXNzYWdlRGVmbGF0ZS5leHRlbnNpb25OYW1lXTogW3BhcmFtc11cbiAgICAgIH0pO1xuICAgICAgaGVhZGVycy5wdXNoKGBTZWMtV2ViU29ja2V0LUV4dGVuc2lvbnM6ICR7dmFsdWV9YCk7XG4gICAgICB3cy5fZXh0ZW5zaW9ucyA9IGV4dGVuc2lvbnM7XG4gICAgfVxuXG4gICAgLy9cbiAgICAvLyBBbGxvdyBleHRlcm5hbCBtb2RpZmljYXRpb24vaW5zcGVjdGlvbiBvZiBoYW5kc2hha2UgaGVhZGVycy5cbiAgICAvL1xuICAgIHRoaXMuZW1pdCgnaGVhZGVycycsIGhlYWRlcnMsIHJlcSk7XG5cbiAgICBzb2NrZXQud3JpdGUoaGVhZGVycy5jb25jYXQoJ1xcclxcbicpLmpvaW4oJ1xcclxcbicpKTtcbiAgICBzb2NrZXQucmVtb3ZlTGlzdGVuZXIoJ2Vycm9yJywgc29ja2V0T25FcnJvcik7XG5cbiAgICB3cy5zZXRTb2NrZXQoc29ja2V0LCBoZWFkLCB7XG4gICAgICBtYXhQYXlsb2FkOiB0aGlzLm9wdGlvbnMubWF4UGF5bG9hZCxcbiAgICAgIHNraXBVVEY4VmFsaWRhdGlvbjogdGhpcy5vcHRpb25zLnNraXBVVEY4VmFsaWRhdGlvblxuICAgIH0pO1xuXG4gICAgaWYgKHRoaXMuY2xpZW50cykge1xuICAgICAgdGhpcy5jbGllbnRzLmFkZCh3cyk7XG4gICAgICB3cy5vbignY2xvc2UnLCAoKSA9PiB7XG4gICAgICAgIHRoaXMuY2xpZW50cy5kZWxldGUod3MpO1xuXG4gICAgICAgIGlmICh0aGlzLl9zaG91bGRFbWl0Q2xvc2UgJiYgIXRoaXMuY2xpZW50cy5zaXplKSB7XG4gICAgICAgICAgcHJvY2Vzcy5uZXh0VGljayhlbWl0Q2xvc2UsIHRoaXMpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBjYih3cywgcmVxKTtcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFdlYlNvY2tldFNlcnZlcjtcblxuLyoqXG4gKiBBZGQgZXZlbnQgbGlzdGVuZXJzIG9uIGFuIGBFdmVudEVtaXR0ZXJgIHVzaW5nIGEgbWFwIG9mIDxldmVudCwgbGlzdGVuZXI+XG4gKiBwYWlycy5cbiAqXG4gKiBAcGFyYW0ge0V2ZW50RW1pdHRlcn0gc2VydmVyIFRoZSBldmVudCBlbWl0dGVyXG4gKiBAcGFyYW0ge09iamVjdC48U3RyaW5nLCBGdW5jdGlvbj59IG1hcCBUaGUgbGlzdGVuZXJzIHRvIGFkZFxuICogQHJldHVybiB7RnVuY3Rpb259IEEgZnVuY3Rpb24gdGhhdCB3aWxsIHJlbW92ZSB0aGUgYWRkZWQgbGlzdGVuZXJzIHdoZW5cbiAqICAgICBjYWxsZWRcbiAqIEBwcml2YXRlXG4gKi9cbmZ1bmN0aW9uIGFkZExpc3RlbmVycyhzZXJ2ZXIsIG1hcCkge1xuICBmb3IgKGNvbnN0IGV2ZW50IG9mIE9iamVjdC5rZXlzKG1hcCkpIHNlcnZlci5vbihldmVudCwgbWFwW2V2ZW50XSk7XG5cbiAgcmV0dXJuIGZ1bmN0aW9uIHJlbW92ZUxpc3RlbmVycygpIHtcbiAgICBmb3IgKGNvbnN0IGV2ZW50IG9mIE9iamVjdC5rZXlzKG1hcCkpIHtcbiAgICAgIHNlcnZlci5yZW1vdmVMaXN0ZW5lcihldmVudCwgbWFwW2V2ZW50XSk7XG4gICAgfVxuICB9O1xufVxuXG4vKipcbiAqIEVtaXQgYSBgJ2Nsb3NlJ2AgZXZlbnQgb24gYW4gYEV2ZW50RW1pdHRlcmAuXG4gKlxuICogQHBhcmFtIHtFdmVudEVtaXR0ZXJ9IHNlcnZlciBUaGUgZXZlbnQgZW1pdHRlclxuICogQHByaXZhdGVcbiAqL1xuZnVuY3Rpb24gZW1pdENsb3NlKHNlcnZlcikge1xuICBzZXJ2ZXIuX3N0YXRlID0gQ0xPU0VEO1xuICBzZXJ2ZXIuZW1pdCgnY2xvc2UnKTtcbn1cblxuLyoqXG4gKiBIYW5kbGUgcHJlbWF0dXJlIHNvY2tldCBlcnJvcnMuXG4gKlxuICogQHByaXZhdGVcbiAqL1xuZnVuY3Rpb24gc29ja2V0T25FcnJvcigpIHtcbiAgdGhpcy5kZXN0cm95KCk7XG59XG5cbi8qKlxuICogQ2xvc2UgdGhlIGNvbm5lY3Rpb24gd2hlbiBwcmVjb25kaXRpb25zIGFyZSBub3QgZnVsZmlsbGVkLlxuICpcbiAqIEBwYXJhbSB7KG5ldC5Tb2NrZXR8dGxzLlNvY2tldCl9IHNvY2tldCBUaGUgc29ja2V0IG9mIHRoZSB1cGdyYWRlIHJlcXVlc3RcbiAqIEBwYXJhbSB7TnVtYmVyfSBjb2RlIFRoZSBIVFRQIHJlc3BvbnNlIHN0YXR1cyBjb2RlXG4gKiBAcGFyYW0ge1N0cmluZ30gW21lc3NhZ2VdIFRoZSBIVFRQIHJlc3BvbnNlIGJvZHlcbiAqIEBwYXJhbSB7T2JqZWN0fSBbaGVhZGVyc10gQWRkaXRpb25hbCBIVFRQIHJlc3BvbnNlIGhlYWRlcnNcbiAqIEBwcml2YXRlXG4gKi9cbmZ1bmN0aW9uIGFib3J0SGFuZHNoYWtlKHNvY2tldCwgY29kZSwgbWVzc2FnZSwgaGVhZGVycykge1xuICBpZiAoc29ja2V0LndyaXRhYmxlKSB7XG4gICAgbWVzc2FnZSA9IG1lc3NhZ2UgfHwgaHR0cC5TVEFUVVNfQ09ERVNbY29kZV07XG4gICAgaGVhZGVycyA9IHtcbiAgICAgIENvbm5lY3Rpb246ICdjbG9zZScsXG4gICAgICAnQ29udGVudC1UeXBlJzogJ3RleHQvaHRtbCcsXG4gICAgICAnQ29udGVudC1MZW5ndGgnOiBCdWZmZXIuYnl0ZUxlbmd0aChtZXNzYWdlKSxcbiAgICAgIC4uLmhlYWRlcnNcbiAgICB9O1xuXG4gICAgc29ja2V0LndyaXRlKFxuICAgICAgYEhUVFAvMS4xICR7Y29kZX0gJHtodHRwLlNUQVRVU19DT0RFU1tjb2RlXX1cXHJcXG5gICtcbiAgICAgICAgT2JqZWN0LmtleXMoaGVhZGVycylcbiAgICAgICAgICAubWFwKChoKSA9PiBgJHtofTogJHtoZWFkZXJzW2hdfWApXG4gICAgICAgICAgLmpvaW4oJ1xcclxcbicpICtcbiAgICAgICAgJ1xcclxcblxcclxcbicgK1xuICAgICAgICBtZXNzYWdlXG4gICAgKTtcbiAgfVxuXG4gIHNvY2tldC5yZW1vdmVMaXN0ZW5lcignZXJyb3InLCBzb2NrZXRPbkVycm9yKTtcbiAgc29ja2V0LmRlc3Ryb3koKTtcbn1cbiIsImltcG9ydCB7IHByb21pc2VzIGFzIGZzIH0gZnJvbSAnZnMnXG5pbXBvcnQgdHlwZSB7IEJpcnBjUmV0dXJuIH0gZnJvbSAnYmlycGMnXG5pbXBvcnQgeyBjcmVhdGVCaXJwYyB9IGZyb20gJ2JpcnBjJ1xuaW1wb3J0IHsgcGFyc2UsIHN0cmluZ2lmeSB9IGZyb20gJ2ZsYXR0ZWQnXG5pbXBvcnQgdHlwZSB7IFdlYlNvY2tldCB9IGZyb20gJ3dzJ1xuaW1wb3J0IHsgV2ViU29ja2V0U2VydmVyIH0gZnJvbSAnd3MnXG5pbXBvcnQgdHlwZSB7IE1vZHVsZU5vZGUgfSBmcm9tICd2aXRlJ1xuaW1wb3J0IHsgQVBJX1BBVEggfSBmcm9tICcuLi9jb25zdGFudHMnXG5pbXBvcnQgdHlwZSB7IFZpdGVzdCB9IGZyb20gJy4uL25vZGUnXG5pbXBvcnQgdHlwZSB7IEZpbGUsIE1vZHVsZUdyYXBoRGF0YSwgUmVwb3J0ZXIsIFRhc2tSZXN1bHRQYWNrLCBVc2VyQ29uc29sZUxvZyB9IGZyb20gJy4uL3R5cGVzJ1xuaW1wb3J0IHsgaW50ZXJwcmV0U291cmNlUG9zLCBwYXJzZVN0YWNrdHJhY2UgfSBmcm9tICcuLi91dGlscy9zb3VyY2UtbWFwJ1xuaW1wb3J0IHR5cGUgeyBUcmFuc2Zvcm1SZXN1bHRXaXRoU291cmNlLCBXZWJTb2NrZXRFdmVudHMsIFdlYlNvY2tldEhhbmRsZXJzIH0gZnJvbSAnLi90eXBlcydcblxuZXhwb3J0IGZ1bmN0aW9uIHNldHVwKGN0eDogVml0ZXN0KSB7XG4gIGNvbnN0IHdzcyA9IG5ldyBXZWJTb2NrZXRTZXJ2ZXIoeyBub1NlcnZlcjogdHJ1ZSB9KVxuXG4gIGNvbnN0IGNsaWVudHMgPSBuZXcgTWFwPFdlYlNvY2tldCwgQmlycGNSZXR1cm48V2ViU29ja2V0RXZlbnRzPj4oKVxuXG4gIGN0eC5zZXJ2ZXIuaHR0cFNlcnZlcj8ub24oJ3VwZ3JhZGUnLCAocmVxdWVzdCwgc29ja2V0LCBoZWFkKSA9PiB7XG4gICAgaWYgKCFyZXF1ZXN0LnVybClcbiAgICAgIHJldHVyblxuXG4gICAgY29uc3QgeyBwYXRobmFtZSB9ID0gbmV3IFVSTChyZXF1ZXN0LnVybCwgJ2h0dHA6Ly9sb2NhbGhvc3QnKVxuICAgIGlmIChwYXRobmFtZSAhPT0gQVBJX1BBVEgpXG4gICAgICByZXR1cm5cblxuICAgIHdzcy5oYW5kbGVVcGdyYWRlKHJlcXVlc3QsIHNvY2tldCwgaGVhZCwgKHdzKSA9PiB7XG4gICAgICB3c3MuZW1pdCgnY29ubmVjdGlvbicsIHdzLCByZXF1ZXN0KVxuICAgICAgc2V0dXBDbGllbnQod3MpXG4gICAgfSlcbiAgfSlcblxuICBmdW5jdGlvbiBzZXR1cENsaWVudCh3czogV2ViU29ja2V0KSB7XG4gICAgY29uc3QgcnBjID0gY3JlYXRlQmlycGM8V2ViU29ja2V0RXZlbnRzLCBXZWJTb2NrZXRIYW5kbGVycz4oXG4gICAgICB7XG4gICAgICAgIGdldEZpbGVzKCkge1xuICAgICAgICAgIHJldHVybiBjdHguc3RhdGUuZ2V0RmlsZXMoKVxuICAgICAgICB9LFxuICAgICAgICByZWFkRmlsZShpZCkge1xuICAgICAgICAgIHJldHVybiBmcy5yZWFkRmlsZShpZCwgJ3V0Zi04JylcbiAgICAgICAgfSxcbiAgICAgICAgd3JpdGVGaWxlKGlkLCBjb250ZW50KSB7XG4gICAgICAgICAgcmV0dXJuIGZzLndyaXRlRmlsZShpZCwgY29udGVudCwgJ3V0Zi04JylcbiAgICAgICAgfSxcbiAgICAgICAgYXN5bmMgcmVydW4oZmlsZXMpIHtcbiAgICAgICAgICBhd2FpdCBjdHgucmVydW5GaWxlcyhmaWxlcylcbiAgICAgICAgfSxcbiAgICAgICAgZ2V0Q29uZmlnKCkge1xuICAgICAgICAgIHJldHVybiBjdHguY29uZmlnXG4gICAgICAgIH0sXG4gICAgICAgIGFzeW5jIGdldFRyYW5zZm9ybVJlc3VsdChpZCkge1xuICAgICAgICAgIGNvbnN0IHJlc3VsdDogVHJhbnNmb3JtUmVzdWx0V2l0aFNvdXJjZSB8IG51bGwgfCB1bmRlZmluZWQgPSBhd2FpdCBjdHgudml0ZW5vZGUudHJhbnNmb3JtUmVxdWVzdChpZClcbiAgICAgICAgICBpZiAocmVzdWx0KSB7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICByZXN1bHQuc291cmNlID0gcmVzdWx0LnNvdXJjZSB8fCAoYXdhaXQgZnMucmVhZEZpbGUoaWQsICd1dGYtOCcpKVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2F0Y2gge31cbiAgICAgICAgICAgIHJldHVybiByZXN1bHRcbiAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIGFzeW5jIGdldE1vZHVsZUdyYXBoKGlkOiBzdHJpbmcpOiBQcm9taXNlPE1vZHVsZUdyYXBoRGF0YT4ge1xuICAgICAgICAgIGNvbnN0IGdyYXBoOiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmdbXT4gPSB7fVxuICAgICAgICAgIGNvbnN0IGV4dGVybmFsaXplZCA9IG5ldyBTZXQ8c3RyaW5nPigpXG4gICAgICAgICAgY29uc3QgaW5saW5lZCA9IG5ldyBTZXQ8c3RyaW5nPigpXG5cbiAgICAgICAgICBmdW5jdGlvbiBjbGVhcklkKGlkPzogc3RyaW5nIHwgbnVsbCkge1xuICAgICAgICAgICAgcmV0dXJuIGlkPy5yZXBsYWNlKC9cXD92PVxcdyskLywgJycpIHx8ICcnXG4gICAgICAgICAgfVxuICAgICAgICAgIGFzeW5jIGZ1bmN0aW9uIGdldChtb2Q/OiBNb2R1bGVOb2RlLCBzZWVuID0gbmV3IE1hcDxNb2R1bGVOb2RlLCBzdHJpbmc+KCkpIHtcbiAgICAgICAgICAgIGlmICghbW9kIHx8ICFtb2QuaWQpXG4gICAgICAgICAgICAgIHJldHVyblxuICAgICAgICAgICAgaWYgKHNlZW4uaGFzKG1vZCkpXG4gICAgICAgICAgICAgIHJldHVybiBzZWVuLmdldChtb2QpXG4gICAgICAgICAgICBsZXQgaWQgPSBjbGVhcklkKG1vZC5pZClcbiAgICAgICAgICAgIHNlZW4uc2V0KG1vZCwgaWQpXG4gICAgICAgICAgICBjb25zdCByZXdyb3RlID0gYXdhaXQgY3R4LnZpdGVub2RlLnNob3VsZEV4dGVybmFsaXplKGlkKVxuICAgICAgICAgICAgaWYgKHJld3JvdGUpIHtcbiAgICAgICAgICAgICAgaWQgPSByZXdyb3RlXG4gICAgICAgICAgICAgIGV4dGVybmFsaXplZC5hZGQoaWQpXG4gICAgICAgICAgICAgIHNlZW4uc2V0KG1vZCwgaWQpXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgaW5saW5lZC5hZGQoaWQpXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCBtb2RzID0gQXJyYXkuZnJvbShtb2QuaW1wb3J0ZWRNb2R1bGVzKS5maWx0ZXIoaSA9PiBpLmlkICYmICFpLmlkLmluY2x1ZGVzKCcvdml0ZXN0L2Rpc3QvJykpXG4gICAgICAgICAgICBncmFwaFtpZF0gPSAoYXdhaXQgUHJvbWlzZS5hbGwobW9kcy5tYXAobSA9PiBnZXQobSwgc2VlbikpKSkuZmlsdGVyKEJvb2xlYW4pIGFzIHN0cmluZ1tdXG4gICAgICAgICAgICByZXR1cm4gaWRcbiAgICAgICAgICB9XG4gICAgICAgICAgYXdhaXQgZ2V0KGN0eC5zZXJ2ZXIubW9kdWxlR3JhcGguZ2V0TW9kdWxlQnlJZChpZCkpXG4gICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGdyYXBoLFxuICAgICAgICAgICAgZXh0ZXJuYWxpemVkOiBBcnJheS5mcm9tKGV4dGVybmFsaXplZCksXG4gICAgICAgICAgICBpbmxpbmVkOiBBcnJheS5mcm9tKGlubGluZWQpLFxuICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIHBvc3Q6IG1zZyA9PiB3cy5zZW5kKG1zZyksXG4gICAgICAgIG9uOiBmbiA9PiB3cy5vbignbWVzc2FnZScsIGZuKSxcbiAgICAgICAgZXZlbnROYW1lczogWydvbkNvbGxlY3RlZCcsICdvblVzZXJDb25zb2xlTG9nJywgJ29uVGFza1VwZGF0ZSddLFxuICAgICAgICBzZXJpYWxpemU6IHN0cmluZ2lmeSxcbiAgICAgICAgZGVzZXJpYWxpemU6IHBhcnNlLFxuICAgICAgfSxcbiAgICApXG5cbiAgICBjbGllbnRzLnNldCh3cywgcnBjKVxuXG4gICAgd3Mub24oJ2Nsb3NlJywgKCkgPT4ge1xuICAgICAgY2xpZW50cy5kZWxldGUod3MpXG4gICAgfSlcbiAgfVxuXG4gIGN0eC5yZXBvcnRlcnMucHVzaChuZXcgV2ViU29ja2V0UmVwb3J0ZXIoY3R4LCB3c3MsIGNsaWVudHMpKVxufVxuXG5jbGFzcyBXZWJTb2NrZXRSZXBvcnRlciBpbXBsZW1lbnRzIFJlcG9ydGVyIHtcbiAgY29uc3RydWN0b3IoXG4gICAgcHVibGljIGN0eDogVml0ZXN0LFxuICAgIHB1YmxpYyB3c3M6IFdlYlNvY2tldFNlcnZlcixcbiAgICBwdWJsaWMgY2xpZW50czogTWFwPFdlYlNvY2tldCwgQmlycGNSZXR1cm48V2ViU29ja2V0RXZlbnRzPj4sXG4gICkge31cblxuICBvbkNvbGxlY3RlZChmaWxlcz86IEZpbGVbXSkge1xuICAgIGlmICh0aGlzLmNsaWVudHMuc2l6ZSA9PT0gMClcbiAgICAgIHJldHVyblxuICAgIHRoaXMuY2xpZW50cy5mb3JFYWNoKChjbGllbnQpID0+IHtcbiAgICAgIGNsaWVudC5vbkNvbGxlY3RlZD8uKGZpbGVzKVxuICAgIH0pXG4gIH1cblxuICBhc3luYyBvblRhc2tVcGRhdGUocGFja3M6IFRhc2tSZXN1bHRQYWNrW10pIHtcbiAgICBpZiAodGhpcy5jbGllbnRzLnNpemUgPT09IDApXG4gICAgICByZXR1cm5cblxuICAgIGF3YWl0IFByb21pc2UuYWxsKHBhY2tzLm1hcChhc3luYyhpKSA9PiB7XG4gICAgICBpZiAoaVsxXT8uZXJyb3IpXG4gICAgICAgIGF3YWl0IGludGVycHJldFNvdXJjZVBvcyhwYXJzZVN0YWNrdHJhY2UoaVsxXS5lcnJvciBhcyBhbnkpLCB0aGlzLmN0eClcbiAgICB9KSlcblxuICAgIHRoaXMuY2xpZW50cy5mb3JFYWNoKChjbGllbnQpID0+IHtcbiAgICAgIGNsaWVudC5vblRhc2tVcGRhdGU/LihwYWNrcylcbiAgICB9KVxuICB9XG5cbiAgb25Vc2VyQ29uc29sZUxvZyhsb2c6IFVzZXJDb25zb2xlTG9nKSB7XG4gICAgdGhpcy5jbGllbnRzLmZvckVhY2goKGNsaWVudCkgPT4ge1xuICAgICAgY2xpZW50Lm9uVXNlckNvbnNvbGVMb2c/Lihsb2cpXG4gICAgfSlcbiAgfVxufVxuIl0sIm5hbWVzIjpbInBhcnNlIiwiRU1QVFlfQlVGRkVSIiwicmVxdWlyZSQkMCIsImNvbmNhdCIsInRvQXJyYXlCdWZmZXIiLCJ0b0J1ZmZlciIsImJ1ZmZlclV0aWxNb2R1bGUiLCJMaW1pdGVyIiwicmVxdWlyZSQkMSIsInJlcXVpcmUkJDIiLCJrU3RhdHVzQ29kZSIsInJlcXVpcmUkJDMiLCJrRXJyb3IiLCJQZXJNZXNzYWdlRGVmbGF0ZSIsInRva2VuQ2hhcnMiLCJpc1ZhbGlkU3RhdHVzQ29kZSIsInZhbGlkYXRpb25Nb2R1bGUiLCJCSU5BUllfVFlQRVMiLCJrV2ViU29ja2V0IiwicmVxdWlyZSQkNCIsIlJlY2VpdmVyIiwicmVxdWlyZSQkNSIsInJlcXVpcmUkJDYiLCJTZW5kZXIiLCJrRm9yT25FdmVudEF0dHJpYnV0ZSIsImtMaXN0ZW5lciIsImZvcm1hdCIsImV4dGVuc2lvbiIsIkV2ZW50RW1pdHRlciIsImh0dHAiLCJjcmVhdGVIYXNoIiwiVVJMIiwicmVxdWlyZSQkOCIsInJlcXVpcmUkJDkiLCJyZXF1aXJlJCQxMCIsIkdVSUQiLCJyZXF1aXJlJCQxMSIsInJlcXVpcmUkJDEyIiwicmVxdWlyZSQkMTMiLCJyZXF1aXJlJCQxNCIsIldlYlNvY2tldCIsInNvY2tldE9uRXJyb3IiLCJhYm9ydEhhbmRzaGFrZSIsInN1YnByb3RvY29sIiwicmVxdWlyZSQkNyIsIldlYlNvY2tldFNlcnZlciIsImZzIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUE7QUFDQTtBQUNBLE1BQU0sQ0FBQyxLQUFLLEVBQUUsTUFBTSxFQUFFLFNBQVMsRUFBRSxVQUFVLENBQUMsR0FBRyxJQUFJLENBQUM7QUFDcEQsTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLE1BQU0sQ0FBQztBQUN0QjtBQUNBLE1BQU0sU0FBUyxHQUFHLE1BQU0sQ0FBQztBQUN6QixNQUFNLFNBQVMsR0FBRyxRQUFRLENBQUM7QUFDM0I7QUFDQSxNQUFNLE1BQU0sR0FBRyxFQUFFLENBQUM7QUFDbEIsTUFBTSxNQUFNLEdBQUcsUUFBUSxDQUFDO0FBQ3hCO0FBQ0EsTUFBTSxJQUFJLEdBQUcsQ0FBQyxDQUFDLEVBQUUsS0FBSyxLQUFLLEtBQUssQ0FBQztBQUNqQztBQUNBLE1BQU0sVUFBVSxHQUFHLEtBQUs7QUFDeEIsRUFBRSxLQUFLLFlBQVksU0FBUyxHQUFHLFNBQVMsQ0FBQyxLQUFLLENBQUMsR0FBRyxLQUFLO0FBQ3ZELENBQUMsQ0FBQztBQUNGO0FBQ0EsTUFBTSxVQUFV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RUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUM7QUFDaEQsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDO0FBQ2hELEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQztBQUNoRCxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUM7QUFDaEQsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDO0FBQ2hELEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQztBQUNoRCxFQUFF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Q0FBQyxNQUFNLENBQUMsTUFBTSxFQUFFO0FBQ25ELE1BQU0sTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLEVBQUUsQ0FBQztBQUN6QztBQUNBLE1BQU0sSUFBSSxDQUFDLGNBQWMsSUFBSSxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDO0FBQzlDLE1BQU0sT0FBTyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxFQUFFLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUN0RCxLQUFLO0FBQ0wsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsRUFBRSxPQUFPLENBQUMsTUFBTSxFQUFFO0FBQ2xCLElBQUksSUFBSSxDQUFDLGNBQWMsSUFBSSxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDO0FBQzVDLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDN0IsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxFQUFFLFNBQVMsQ0FBQyxJQUFJLEVBQUUsRUFBRSxFQUFFO0FBQ3RCLElBQUksSUFBSSxJQUFJLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtBQUMzQixNQUFNLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFLENBQUM7QUFDMUIsTUFBTSxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNsQyxNQUFNLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztBQUN0QyxNQUFNLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFFLENBQUM7QUFDNUIsS0FBSyxNQUFNO0FBQ1gsTUFBTSxJQUFJLENBQUMsT0FBTyxDQUFDLEtB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
