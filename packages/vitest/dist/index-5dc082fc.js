import { c as commonjsGlobal } from './_commonjsHelpers-c9e3b764.js';
import assert$1 from 'assert';
import require$$2 from 'events';

var signalExit$1 = {exports: {}};

var signals$1 = {exports: {}};

(function (module) {
// This is not the set of all possible signals.
//
// It IS, however, the set of all signals that trigger
// an exit on either Linux or BSD systems.  Linux is a
// superset of the signal names supported on BSD, and
// the unknown signals just fail to register, so we can
// catch that easily enough.
//
// Don't bother with SIGKILL.  It's uncatchable, which
// means that we can't fire any callbacks anyway.
//
// If a user does happen to register a handler on a non-
// fatal signal like SIGWINCH or something, and then
// exit, it'll end up firing `process.emit('exit')`, so
// the handler will be fired anyway.
//
// SIGBUS, SIGFPE, SIGSEGV and SIGILL, when not raised
// artificially, inherently leave the process in a
// state from which it is not safe to try and enter JS
// listeners.
module.exports = [
  'SIGABRT',
  'SIGALRM',
  'SIGHUP',
  'SIGINT',
  'SIGTERM'
];

if (process.platform !== 'win32') {
  module.exports.push(
    'SIGVTALRM',
    'SIGXCPU',
    'SIGXFSZ',
    'SIGUSR2',
    'SIGTRAP',
    'SIGSYS',
    'SIGQUIT',
    'SIGIOT'
    // should detect profiler and enable/disable accordingly.
    // see #21
    // 'SIGPROF'
  );
}

if (process.platform === 'linux') {
  module.exports.push(
    'SIGIO',
    'SIGPOLL',
    'SIGPWR',
    'SIGSTKFLT',
    'SIGUNUSED'
  );
}
}(signals$1));

// Note: since nyc uses this module to output coverage, any lines
// that are in the direct sync flow of nyc's outputCoverage are
// ignored, since we can never get coverage for them.
// grab a reference to node's real process object right away
var process$1 = commonjsGlobal.process;

const processOk = function (process) {
  return process &&
    typeof process === 'object' &&
    typeof process.removeListener === 'function' &&
    typeof process.emit === 'function' &&
    typeof process.reallyExit === 'function' &&
    typeof process.listeners === 'function' &&
    typeof process.kill === 'function' &&
    typeof process.pid === 'number' &&
    typeof process.on === 'function'
};

// some kind of non-node environment, just no-op
/* istanbul ignore if */
if (!processOk(process$1)) {
  signalExit$1.exports = function () {};
} else {
  var assert = assert$1;
  var signals = signals$1.exports;
  var isWin = /^win/i.test(process$1.platform);

  var EE = require$$2;
  /* istanbul ignore if */
  if (typeof EE !== 'function') {
    EE = EE.EventEmitter;
  }

  var emitter;
  if (process$1.__signal_exit_emitter__) {
    emitter = process$1.__signal_exit_emitter__;
  } else {
    emitter = process$1.__signal_exit_emitter__ = new EE();
    emitter.count = 0;
    emitter.emitted = {};
  }

  // Because this emitter is a global, we have to check to see if a
  // previous version of this library failed to enable infinite listeners.
  // I know what you're about to say.  But literally everything about
  // signal-exit is a compromise with evil.  Get used to it.
  if (!emitter.infinite) {
    emitter.setMaxListeners(Infinity);
    emitter.infinite = true;
  }

  signalExit$1.exports = function (cb, opts) {
    /* istanbul ignore if */
    if (!processOk(commonjsGlobal.process)) {
      return
    }
    assert.equal(typeof cb, 'function', 'a callback must be provided for exit handler');

    if (loaded === false) {
      load();
    }

    var ev = 'exit';
    if (opts && opts.alwaysLast) {
      ev = 'afterexit';
    }

    var remove = function () {
      emitter.removeListener(ev, cb);
      if (emitter.listeners('exit').length === 0 &&
          emitter.listeners('afterexit').length === 0) {
        unload();
      }
    };
    emitter.on(ev, cb);

    return remove
  };

  var unload = function unload () {
    if (!loaded || !processOk(commonjsGlobal.process)) {
      return
    }
    loaded = false;

    signals.forEach(function (sig) {
      try {
        process$1.removeListener(sig, sigListeners[sig]);
      } catch (er) {}
    });
    process$1.emit = originalProcessEmit;
    process$1.reallyExit = originalProcessReallyExit;
    emitter.count -= 1;
  };
  signalExit$1.exports.unload = unload;

  var emit = function emit (event, code, signal) {
    /* istanbul ignore if */
    if (emitter.emitted[event]) {
      return
    }
    emitter.emitted[event] = true;
    emitter.emit(event, code, signal);
  };

  // { <signal>: <listener fn>, ... }
  var sigListeners = {};
  signals.forEach(function (sig) {
    sigListeners[sig] = function listener () {
      /* istanbul ignore if */
      if (!processOk(commonjsGlobal.process)) {
        return
      }
      // If there are no other listeners, an exit is coming!
      // Simplest way: remove us and then re-send the signal.
      // We know that this will kill the process, so we can
      // safely emit now.
      var listeners = process$1.listeners(sig);
      if (listeners.length === emitter.count) {
        unload();
        emit('exit', null, sig);
        /* istanbul ignore next */
        emit('afterexit', null, sig);
        /* istanbul ignore next */
        if (isWin && sig === 'SIGHUP') {
          // "SIGHUP" throws an `ENOSYS` error on Windows,
          // so use a supported signal instead
          sig = 'SIGINT';
        }
        /* istanbul ignore next */
        process$1.kill(process$1.pid, sig);
      }
    };
  });

  signalExit$1.exports.signals = function () {
    return signals
  };

  var loaded = false;

  var load = function load () {
    if (loaded || !processOk(commonjsGlobal.process)) {
      return
    }
    loaded = true;

    // This is the number of onSignalExit's that are in play.
    // It's important so that we can count the correct number of
    // listeners on signals, and don't wait for the other one to
    // handle it instead of us.
    emitter.count += 1;

    signals = signals.filter(function (sig) {
      try {
        process$1.on(sig, sigListeners[sig]);
        return true
      } catch (er) {
        return false
      }
    });

    process$1.emit = processEmit;
    process$1.reallyExit = processReallyExit;
  };
  signalExit$1.exports.load = load;

  var originalProcessReallyExit = process$1.reallyExit;
  var processReallyExit = function processReallyExit (code) {
    /* istanbul ignore if */
    if (!processOk(commonjsGlobal.process)) {
      return
    }
    process$1.exitCode = code || /* istanbul ignore next */ 0;
    emit('exit', process$1.exitCode, null);
    /* istanbul ignore next */
    emit('afterexit', process$1.exitCode, null);
    /* istanbul ignore next */
    originalProcessReallyExit.call(process$1, process$1.exitCode);
  };

  var originalProcessEmit = process$1.emit;
  var processEmit = function processEmit (ev, arg) {
    if (ev === 'exit' && processOk(commonjsGlobal.process)) {
      /* istanbul ignore else */
      if (arg !== undefined) {
        process$1.exitCode = arg;
      }
      var ret = originalProcessEmit.apply(this, arguments);
      /* istanbul ignore next */
      emit('exit', process$1.exitCode, null);
      /* istanbul ignore next */
      emit('afterexit', process$1.exitCode, null);
      /* istanbul ignore next */
      return ret
    } else {
      return originalProcessEmit.apply(this, arguments)
    }
  };
}

var signalExit = signalExit$1.exports;

var onetime$2 = {exports: {}};

var mimicFn$2 = {exports: {}};

const mimicFn$1 = (to, from) => {
	for (const prop of Reflect.ownKeys(from)) {
		Object.defineProperty(to, prop, Object.getOwnPropertyDescriptor(from, prop));
	}

	return to;
};

mimicFn$2.exports = mimicFn$1;
// TODO: Remove this for the next major release
mimicFn$2.exports.default = mimicFn$1;

const mimicFn = mimicFn$2.exports;

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

	mimicFn(onetime, function_);
	calledFunctions.set(onetime, callCount);

	return onetime;
};

onetime$2.exports = onetime;
// TODO: Remove this for the next major release
onetime$2.exports.default = onetime;

onetime$2.exports.callCount = function_ => {
	if (!calledFunctions.has(function_)) {
		throw new Error(`The given function \`${function_.name}\` is not wrapped by the \`onetime\` package`);
	}

	return calledFunctions.get(function_);
};

var onetime$1 = onetime$2.exports;

export { signalExit$1 as a, onetime$2 as b, onetime$1 as o, signalExit as s };
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXgtNWRjMDgyZmMuanMiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL25vZGVfbW9kdWxlcy8ucG5wbS9zaWduYWwtZXhpdEAzLjAuNi9ub2RlX21vZHVsZXMvc2lnbmFsLWV4aXQvc2lnbmFscy5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy8ucG5wbS9zaWduYWwtZXhpdEAzLjAuNi9ub2RlX21vZHVsZXMvc2lnbmFsLWV4aXQvaW5kZXguanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvLnBucG0vbWltaWMtZm5AMi4xLjAvbm9kZV9tb2R1bGVzL21pbWljLWZuL2luZGV4LmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzLy5wbnBtL29uZXRpbWVANS4xLjIvbm9kZV9tb2R1bGVzL29uZXRpbWUvaW5kZXguanMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gVGhpcyBpcyBub3QgdGhlIHNldCBvZiBhbGwgcG9zc2libGUgc2lnbmFscy5cbi8vXG4vLyBJdCBJUywgaG93ZXZlciwgdGhlIHNldCBvZiBhbGwgc2lnbmFscyB0aGF0IHRyaWdnZXJcbi8vIGFuIGV4aXQgb24gZWl0aGVyIExpbnV4IG9yIEJTRCBzeXN0ZW1zLiAgTGludXggaXMgYVxuLy8gc3VwZXJzZXQgb2YgdGhlIHNpZ25hbCBuYW1lcyBzdXBwb3J0ZWQgb24gQlNELCBhbmRcbi8vIHRoZSB1bmtub3duIHNpZ25hbHMganVzdCBmYWlsIHRvIHJlZ2lzdGVyLCBzbyB3ZSBjYW5cbi8vIGNhdGNoIHRoYXQgZWFzaWx5IGVub3VnaC5cbi8vXG4vLyBEb24ndCBib3RoZXIgd2l0aCBTSUdLSUxMLiAgSXQncyB1bmNhdGNoYWJsZSwgd2hpY2hcbi8vIG1lYW5zIHRoYXQgd2UgY2FuJ3QgZmlyZSBhbnkgY2FsbGJhY2tzIGFueXdheS5cbi8vXG4vLyBJZiBhIHVzZXIgZG9lcyBoYXBwZW4gdG8gcmVnaXN0ZXIgYSBoYW5kbGVyIG9uIGEgbm9uLVxuLy8gZmF0YWwgc2lnbmFsIGxpa2UgU0lHV0lOQ0ggb3Igc29tZXRoaW5nLCBhbmQgdGhlblxuLy8gZXhpdCwgaXQnbGwgZW5kIHVwIGZpcmluZyBgcHJvY2Vzcy5lbWl0KCdleGl0JylgLCBzb1xuLy8gdGhlIGhhbmRsZXIgd2lsbCBiZSBmaXJlZCBhbnl3YXkuXG4vL1xuLy8gU0lHQlVTLCBTSUdGUEUsIFNJR1NFR1YgYW5kIFNJR0lMTCwgd2hlbiBub3QgcmFpc2VkXG4vLyBhcnRpZmljaWFsbHksIGluaGVyZW50bHkgbGVhdmUgdGhlIHByb2Nlc3MgaW4gYVxuLy8gc3RhdGUgZnJvbSB3aGljaCBpdCBpcyBub3Qgc2FmZSB0byB0cnkgYW5kIGVudGVyIEpTXG4vLyBsaXN0ZW5lcnMuXG5tb2R1bGUuZXhwb3J0cyA9IFtcbiAgJ1NJR0FCUlQnLFxuICAnU0lHQUxSTScsXG4gICdTSUdIVVAnLFxuICAnU0lHSU5UJyxcbiAgJ1NJR1RFUk0nXG5dXG5cbmlmIChwcm9jZXNzLnBsYXRmb3JtICE9PSAnd2luMzInKSB7XG4gIG1vZHVsZS5leHBvcnRzLnB1c2goXG4gICAgJ1NJR1ZUQUxSTScsXG4gICAgJ1NJR1hDUFUnLFxuICAgICdTSUdYRlNaJyxcbiAgICAnU0lHVVNSMicsXG4gICAgJ1NJR1RSQVAnLFxuICAgICdTSUdTWVMnLFxuICAgICdTSUdRVUlUJyxcbiAgICAnU0lHSU9UJ1xuICAgIC8vIHNob3VsZCBkZXRlY3QgcHJvZmlsZXIgYW5kIGVuYWJsZS9kaXNhYmxlIGFjY29yZGluZ2x5LlxuICAgIC8vIHNlZSAjMjFcbiAgICAvLyAnU0lHUFJPRidcbiAgKVxufVxuXG5pZiAocHJvY2Vzcy5wbGF0Zm9ybSA9PT0gJ2xpbnV4Jykge1xuICBtb2R1bGUuZXhwb3J0cy5wdXNoKFxuICAgICdTSUdJTycsXG4gICAgJ1NJR1BPTEwnLFxuICAgICdTSUdQV1InLFxuICAgICdTSUdTVEtGTFQnLFxuICAgICdTSUdVTlVTRUQnXG4gIClcbn1cbiIsIi8vIE5vdGU6IHNpbmNlIG55YyB1c2VzIHRoaXMgbW9kdWxlIHRvIG91dHB1dCBjb3ZlcmFnZSwgYW55IGxpbmVzXG4vLyB0aGF0IGFyZSBpbiB0aGUgZGlyZWN0IHN5bmMgZmxvdyBvZiBueWMncyBvdXRwdXRDb3ZlcmFnZSBhcmVcbi8vIGlnbm9yZWQsIHNpbmNlIHdlIGNhbiBuZXZlciBnZXQgY292ZXJhZ2UgZm9yIHRoZW0uXG4vLyBncmFiIGEgcmVmZXJlbmNlIHRvIG5vZGUncyByZWFsIHByb2Nlc3Mgb2JqZWN0IHJpZ2h0IGF3YXlcbnZhciBwcm9jZXNzID0gZ2xvYmFsLnByb2Nlc3NcblxuY29uc3QgcHJvY2Vzc09rID0gZnVuY3Rpb24gKHByb2Nlc3MpIHtcbiAgcmV0dXJuIHByb2Nlc3MgJiZcbiAgICB0eXBlb2YgcHJvY2VzcyA9PT0gJ29iamVjdCcgJiZcbiAgICB0eXBlb2YgcHJvY2Vzcy5yZW1vdmVMaXN0ZW5lciA9PT0gJ2Z1bmN0aW9uJyAmJlxuICAgIHR5cGVvZiBwcm9jZXNzLmVtaXQgPT09ICdmdW5jdGlvbicgJiZcbiAgICB0eXBlb2YgcHJvY2Vzcy5yZWFsbHlFeGl0ID09PSAnZnVuY3Rpb24nICYmXG4gICAgdHlwZW9mIHByb2Nlc3MubGlzdGVuZXJzID09PSAnZnVuY3Rpb24nICYmXG4gICAgdHlwZW9mIHByb2Nlc3Mua2lsbCA9PT0gJ2Z1bmN0aW9uJyAmJlxuICAgIHR5cGVvZiBwcm9jZXNzLnBpZCA9PT0gJ251bWJlcicgJiZcbiAgICB0eXBlb2YgcHJvY2Vzcy5vbiA9PT0gJ2Z1bmN0aW9uJ1xufVxuXG4vLyBzb21lIGtpbmQgb2Ygbm9uLW5vZGUgZW52aXJvbm1lbnQsIGp1c3Qgbm8tb3Bcbi8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xuaWYgKCFwcm9jZXNzT2socHJvY2VzcykpIHtcbiAgbW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoKSB7fVxufSBlbHNlIHtcbiAgdmFyIGFzc2VydCA9IHJlcXVpcmUoJ2Fzc2VydCcpXG4gIHZhciBzaWduYWxzID0gcmVxdWlyZSgnLi9zaWduYWxzLmpzJylcbiAgdmFyIGlzV2luID0gL153aW4vaS50ZXN0KHByb2Nlc3MucGxhdGZvcm0pXG5cbiAgdmFyIEVFID0gcmVxdWlyZSgnZXZlbnRzJylcbiAgLyogaXN0YW5idWwgaWdub3JlIGlmICovXG4gIGlmICh0eXBlb2YgRUUgIT09ICdmdW5jdGlvbicpIHtcbiAgICBFRSA9IEVFLkV2ZW50RW1pdHRlclxuICB9XG5cbiAgdmFyIGVtaXR0ZXJcbiAgaWYgKHByb2Nlc3MuX19zaWduYWxfZXhpdF9lbWl0dGVyX18pIHtcbiAgICBlbWl0dGVyID0gcHJvY2Vzcy5fX3NpZ25hbF9leGl0X2VtaXR0ZXJfX1xuICB9IGVsc2Uge1xuICAgIGVtaXR0ZXIgPSBwcm9jZXNzLl9fc2lnbmFsX2V4aXRfZW1pdHRlcl9fID0gbmV3IEVFKClcbiAgICBlbWl0dGVyLmNvdW50ID0gMFxuICAgIGVtaXR0ZXIuZW1pdHRlZCA9IHt9XG4gIH1cblxuICAvLyBCZWNhdXNlIHRoaXMgZW1pdHRlciBpcyBhIGdsb2JhbCwgd2UgaGF2ZSB0byBjaGVjayB0byBzZWUgaWYgYVxuICAvLyBwcmV2aW91cyB2ZXJzaW9uIG9mIHRoaXMgbGlicmFyeSBmYWlsZWQgdG8gZW5hYmxlIGluZmluaXRlIGxpc3RlbmVycy5cbiAgLy8gSSBrbm93IHdoYXQgeW91J3JlIGFib3V0IHRvIHNheS4gIEJ1dCBsaXRlcmFsbHkgZXZlcnl0aGluZyBhYm91dFxuICAvLyBzaWduYWwtZXhpdCBpcyBhIGNvbXByb21pc2Ugd2l0aCBldmlsLiAgR2V0IHVzZWQgdG8gaXQuXG4gIGlmICghZW1pdHRlci5pbmZpbml0ZSkge1xuICAgIGVtaXR0ZXIuc2V0TWF4TGlzdGVuZXJzKEluZmluaXR5KVxuICAgIGVtaXR0ZXIuaW5maW5pdGUgPSB0cnVlXG4gIH1cblxuICBtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChjYiwgb3B0cykge1xuICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xuICAgIGlmICghcHJvY2Vzc09rKGdsb2JhbC5wcm9jZXNzKSkge1xuICAgICAgcmV0dXJuXG4gICAgfVxuICAgIGFzc2VydC5lcXVhbCh0eXBlb2YgY2IsICdmdW5jdGlvbicsICdhIGNhbGxiYWNrIG11c3QgYmUgcHJvdmlkZWQgZm9yIGV4aXQgaGFuZGxlcicpXG5cbiAgICBpZiAobG9hZGVkID09PSBmYWxzZSkge1xuICAgICAgbG9hZCgpXG4gICAgfVxuXG4gICAgdmFyIGV2ID0gJ2V4aXQnXG4gICAgaWYgKG9wdHMgJiYgb3B0cy5hbHdheXNMYXN0KSB7XG4gICAgICBldiA9ICdhZnRlcmV4aXQnXG4gICAgfVxuXG4gICAgdmFyIHJlbW92ZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIGVtaXR0ZXIucmVtb3ZlTGlzdGVuZXIoZXYsIGNiKVxuICAgICAgaWYgKGVtaXR0ZXIubGlzdGVuZXJzKCdleGl0JykubGVuZ3RoID09PSAwICYmXG4gICAgICAgICAgZW1pdHRlci5saXN0ZW5lcnMoJ2FmdGVyZXhpdCcpLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICB1bmxvYWQoKVxuICAgICAgfVxuICAgIH1cbiAgICBlbWl0dGVyLm9uKGV2LCBjYilcblxuICAgIHJldHVybiByZW1vdmVcbiAgfVxuXG4gIHZhciB1bmxvYWQgPSBmdW5jdGlvbiB1bmxvYWQgKCkge1xuICAgIGlmICghbG9hZGVkIHx8ICFwcm9jZXNzT2soZ2xvYmFsLnByb2Nlc3MpKSB7XG4gICAgICByZXR1cm5cbiAgICB9XG4gICAgbG9hZGVkID0gZmFsc2VcblxuICAgIHNpZ25hbHMuZm9yRWFjaChmdW5jdGlvbiAoc2lnKSB7XG4gICAgICB0cnkge1xuICAgICAgICBwcm9jZXNzLnJlbW92ZUxpc3RlbmVyKHNpZywgc2lnTGlzdGVuZXJzW3NpZ10pXG4gICAgICB9IGNhdGNoIChlcikge31cbiAgICB9KVxuICAgIHByb2Nlc3MuZW1pdCA9IG9yaWdpbmFsUHJvY2Vzc0VtaXRcbiAgICBwcm9jZXNzLnJlYWxseUV4aXQgPSBvcmlnaW5hbFByb2Nlc3NSZWFsbHlFeGl0XG4gICAgZW1pdHRlci5jb3VudCAtPSAxXG4gIH1cbiAgbW9kdWxlLmV4cG9ydHMudW5sb2FkID0gdW5sb2FkXG5cbiAgdmFyIGVtaXQgPSBmdW5jdGlvbiBlbWl0IChldmVudCwgY29kZSwgc2lnbmFsKSB7XG4gICAgLyogaXN0YW5idWwgaWdub3JlIGlmICovXG4gICAgaWYgKGVtaXR0ZXIuZW1pdHRlZFtldmVudF0pIHtcbiAgICAgIHJldHVyblxuICAgIH1cbiAgICBlbWl0dGVyLmVtaXR0ZWRbZXZlbnRdID0gdHJ1ZVxuICAgIGVtaXR0ZXIuZW1pdChldmVudCwgY29kZSwgc2lnbmFsKVxuICB9XG5cbiAgLy8geyA8c2lnbmFsPjogPGxpc3RlbmVyIGZuPiwgLi4uIH1cbiAgdmFyIHNpZ0xpc3RlbmVycyA9IHt9XG4gIHNpZ25hbHMuZm9yRWFjaChmdW5jdGlvbiAoc2lnKSB7XG4gICAgc2lnTGlzdGVuZXJzW3NpZ10gPSBmdW5jdGlvbiBsaXN0ZW5lciAoKSB7XG4gICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cbiAgICAgIGlmICghcHJvY2Vzc09rKGdsb2JhbC5wcm9jZXNzKSkge1xuICAgICAgICByZXR1cm5cbiAgICAgIH1cbiAgICAgIC8vIElmIHRoZXJlIGFyZSBubyBvdGhlciBsaXN0ZW5lcnMsIGFuIGV4aXQgaXMgY29taW5nIVxuICAgICAgLy8gU2ltcGxlc3Qgd2F5OiByZW1vdmUgdXMgYW5kIHRoZW4gcmUtc2VuZCB0aGUgc2lnbmFsLlxuICAgICAgLy8gV2Uga25vdyB0aGF0IHRoaXMgd2lsbCBraWxsIHRoZSBwcm9jZXNzLCBzbyB3ZSBjYW5cbiAgICAgIC8vIHNhZmVseSBlbWl0IG5vdy5cbiAgICAgIHZhciBsaXN0ZW5lcnMgPSBwcm9jZXNzLmxpc3RlbmVycyhzaWcpXG4gICAgICBpZiAobGlzdGVuZXJzLmxlbmd0aCA9PT0gZW1pdHRlci5jb3VudCkge1xuICAgICAgICB1bmxvYWQoKVxuICAgICAgICBlbWl0KCdleGl0JywgbnVsbCwgc2lnKVxuICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuICAgICAgICBlbWl0KCdhZnRlcmV4aXQnLCBudWxsLCBzaWcpXG4gICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG4gICAgICAgIGlmIChpc1dpbiAmJiBzaWcgPT09ICdTSUdIVVAnKSB7XG4gICAgICAgICAgLy8gXCJTSUdIVVBcIiB0aHJvd3MgYW4gYEVOT1NZU2AgZXJyb3Igb24gV2luZG93cyxcbiAgICAgICAgICAvLyBzbyB1c2UgYSBzdXBwb3J0ZWQgc2lnbmFsIGluc3RlYWRcbiAgICAgICAgICBzaWcgPSAnU0lHSU5UJ1xuICAgICAgICB9XG4gICAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG4gICAgICAgIHByb2Nlc3Mua2lsbChwcm9jZXNzLnBpZCwgc2lnKVxuICAgICAgfVxuICAgIH1cbiAgfSlcblxuICBtb2R1bGUuZXhwb3J0cy5zaWduYWxzID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiBzaWduYWxzXG4gIH1cblxuICB2YXIgbG9hZGVkID0gZmFsc2VcblxuICB2YXIgbG9hZCA9IGZ1bmN0aW9uIGxvYWQgKCkge1xuICAgIGlmIChsb2FkZWQgfHwgIXByb2Nlc3NPayhnbG9iYWwucHJvY2VzcykpIHtcbiAgICAgIHJldHVyblxuICAgIH1cbiAgICBsb2FkZWQgPSB0cnVlXG5cbiAgICAvLyBUaGlzIGlzIHRoZSBudW1iZXIgb2Ygb25TaWduYWxFeGl0J3MgdGhhdCBhcmUgaW4gcGxheS5cbiAgICAvLyBJdCdzIGltcG9ydGFudCBzbyB0aGF0IHdlIGNhbiBjb3VudCB0aGUgY29ycmVjdCBudW1iZXIgb2ZcbiAgICAvLyBsaXN0ZW5lcnMgb24gc2lnbmFscywgYW5kIGRvbid0IHdhaXQgZm9yIHRoZSBvdGhlciBvbmUgdG9cbiAgICAvLyBoYW5kbGUgaXQgaW5zdGVhZCBvZiB1cy5cbiAgICBlbWl0dGVyLmNvdW50ICs9IDFcblxuICAgIHNpZ25hbHMgPSBzaWduYWxzLmZpbHRlcihmdW5jdGlvbiAoc2lnKSB7XG4gICAgICB0cnkge1xuICAgICAgICBwcm9jZXNzLm9uKHNpZywgc2lnTGlzdGVuZXJzW3NpZ10pXG4gICAgICAgIHJldHVybiB0cnVlXG4gICAgICB9IGNhdGNoIChlcikge1xuICAgICAgICByZXR1cm4gZmFsc2VcbiAgICAgIH1cbiAgICB9KVxuXG4gICAgcHJvY2Vzcy5lbWl0ID0gcHJvY2Vzc0VtaXRcbiAgICBwcm9jZXNzLnJlYWxseUV4aXQgPSBwcm9jZXNzUmVhbGx5RXhpdFxuICB9XG4gIG1vZHVsZS5leHBvcnRzLmxvYWQgPSBsb2FkXG5cbiAgdmFyIG9yaWdpbmFsUHJvY2Vzc1JlYWxseUV4aXQgPSBwcm9jZXNzLnJlYWxseUV4aXRcbiAgdmFyIHByb2Nlc3NSZWFsbHlFeGl0ID0gZnVuY3Rpb24gcHJvY2Vzc1JlYWxseUV4aXQgKGNvZGUpIHtcbiAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cbiAgICBpZiAoIXByb2Nlc3NPayhnbG9iYWwucHJvY2VzcykpIHtcbiAgICAgIHJldHVyblxuICAgIH1cbiAgICBwcm9jZXNzLmV4aXRDb2RlID0gY29kZSB8fCAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqLyAwXG4gICAgZW1pdCgnZXhpdCcsIHByb2Nlc3MuZXhpdENvZGUsIG51bGwpXG4gICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbiAgICBlbWl0KCdhZnRlcmV4aXQnLCBwcm9jZXNzLmV4aXRDb2RlLCBudWxsKVxuICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBuZXh0ICovXG4gICAgb3JpZ2luYWxQcm9jZXNzUmVhbGx5RXhpdC5jYWxsKHByb2Nlc3MsIHByb2Nlc3MuZXhpdENvZGUpXG4gIH1cblxuICB2YXIgb3JpZ2luYWxQcm9jZXNzRW1pdCA9IHByb2Nlc3MuZW1pdFxuICB2YXIgcHJvY2Vzc0VtaXQgPSBmdW5jdGlvbiBwcm9jZXNzRW1pdCAoZXYsIGFyZykge1xuICAgIGlmIChldiA9PT0gJ2V4aXQnICYmIHByb2Nlc3NPayhnbG9iYWwucHJvY2VzcykpIHtcbiAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBlbHNlICovXG4gICAgICBpZiAoYXJnICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgcHJvY2Vzcy5leGl0Q29kZSA9IGFyZ1xuICAgICAgfVxuICAgICAgdmFyIHJldCA9IG9yaWdpbmFsUHJvY2Vzc0VtaXQuYXBwbHkodGhpcywgYXJndW1lbnRzKVxuICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbiAgICAgIGVtaXQoJ2V4aXQnLCBwcm9jZXNzLmV4aXRDb2RlLCBudWxsKVxuICAgICAgLyogaXN0YW5idWwgaWdub3JlIG5leHQgKi9cbiAgICAgIGVtaXQoJ2FmdGVyZXhpdCcsIHByb2Nlc3MuZXhpdENvZGUsIG51bGwpXG4gICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgbmV4dCAqL1xuICAgICAgcmV0dXJuIHJldFxuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gb3JpZ2luYWxQcm9jZXNzRW1pdC5hcHBseSh0aGlzLCBhcmd1bWVudHMpXG4gICAgfVxuICB9XG59XG4iLCIndXNlIHN0cmljdCc7XG5cbmNvbnN0IG1pbWljRm4gPSAodG8sIGZyb20pID0+IHtcblx0Zm9yIChjb25zdCBwcm9wIG9mIFJlZmxlY3Qub3duS2V5cyhmcm9tKSkge1xuXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0bywgcHJvcCwgT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihmcm9tLCBwcm9wKSk7XG5cdH1cblxuXHRyZXR1cm4gdG87XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IG1pbWljRm47XG4vLyBUT0RPOiBSZW1vdmUgdGhpcyBmb3IgdGhlIG5leHQgbWFqb3IgcmVsZWFzZVxubW9kdWxlLmV4cG9ydHMuZGVmYXVsdCA9IG1pbWljRm47XG4iLCIndXNlIHN0cmljdCc7XG5jb25zdCBtaW1pY0ZuID0gcmVxdWlyZSgnbWltaWMtZm4nKTtcblxuY29uc3QgY2FsbGVkRnVuY3Rpb25zID0gbmV3IFdlYWtNYXAoKTtcblxuY29uc3Qgb25ldGltZSA9IChmdW5jdGlvbl8sIG9wdGlvbnMgPSB7fSkgPT4ge1xuXHRpZiAodHlwZW9mIGZ1bmN0aW9uXyAhPT0gJ2Z1bmN0aW9uJykge1xuXHRcdHRocm93IG5ldyBUeXBlRXJyb3IoJ0V4cGVjdGVkIGEgZnVuY3Rpb24nKTtcblx0fVxuXG5cdGxldCByZXR1cm5WYWx1ZTtcblx0bGV0IGNhbGxDb3VudCA9IDA7XG5cdGNvbnN0IGZ1bmN0aW9uTmFtZSA9IGZ1bmN0aW9uXy5kaXNwbGF5TmFtZSB8fCBmdW5jdGlvbl8ubmFtZSB8fCAnPGFub255bW91cz4nO1xuXG5cdGNvbnN0IG9uZXRpbWUgPSBmdW5jdGlvbiAoLi4uYXJndW1lbnRzXykge1xuXHRcdGNhbGxlZEZ1bmN0aW9ucy5zZXQob25ldGltZSwgKytjYWxsQ291bnQpO1xuXG5cdFx0aWYgKGNhbGxDb3VudCA9PT0gMSkge1xuXHRcdFx0cmV0dXJuVmFsdWUgPSBmdW5jdGlvbl8uYXBwbHkodGhpcywgYXJndW1lbnRzXyk7XG5cdFx0XHRmdW5jdGlvbl8gPSBudWxsO1xuXHRcdH0gZWxzZSBpZiAob3B0aW9ucy50aHJvdyA9PT0gdHJ1ZSkge1xuXHRcdFx0dGhyb3cgbmV3IEVycm9yKGBGdW5jdGlvbiBcXGAke2Z1bmN0aW9uTmFtZX1cXGAgY2FuIG9ubHkgYmUgY2FsbGVkIG9uY2VgKTtcblx0XHR9XG5cblx0XHRyZXR1cm4gcmV0dXJuVmFsdWU7XG5cdH07XG5cblx0bWltaWNGbihvbmV0aW1lLCBmdW5jdGlvbl8pO1xuXHRjYWxsZWRGdW5jdGlvbnMuc2V0KG9uZXRpbWUsIGNhbGxDb3VudCk7XG5cblx0cmV0dXJuIG9uZXRpbWU7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IG9uZXRpbWU7XG4vLyBUT0RPOiBSZW1vdmUgdGhpcyBmb3IgdGhlIG5leHQgbWFqb3IgcmVsZWFzZVxubW9kdWxlLmV4cG9ydHMuZGVmYXVsdCA9IG9uZXRpbWU7XG5cbm1vZHVsZS5leHBvcnRzLmNhbGxDb3VudCA9IGZ1bmN0aW9uXyA9PiB7XG5cdGlmICghY2FsbGVkRnVuY3Rpb25zLmhhcyhmdW5jdGlvbl8pKSB7XG5cdFx0dGhyb3cgbmV3IEVycm9yKGBUaGUgZ2l2ZW4gZnVuY3Rpb24gXFxgJHtmdW5jdGlvbl8ubmFtZX1cXGAgaXMgbm90IHdyYXBwZWQgYnkgdGhlIFxcYG9uZXRpbWVcXGAgcGFja2FnZWApO1xuXHR9XG5cblx0cmV0dXJuIGNhbGxlZEZ1bmN0aW9ucy5nZXQoZnVuY3Rpb25fKTtcbn07XG4iXSwibmFtZXMiOlsicHJvY2VzcyIsImdsb2JhbCIsInNpZ25hbEV4aXRNb2R1bGUiLCJyZXF1aXJlJCQwIiwicmVxdWlyZSQkMSIsIm1pbWljRm4iLCJtaW1pY0ZuTW9kdWxlIiwib25ldGltZU1vZHVsZSJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O0FBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGlCQUFpQjtBQUNqQixFQUFFLFNBQVM7QUFDWCxFQUFFLFNBQVM7QUFDWCxFQUFFLFFBQVE7QUFDVixFQUFFLFFBQVE7QUFDVixFQUFFLFNBQVM7QUFDWCxFQUFDO0FBQ0Q7QUFDQSxJQUFJLE9BQU8sQ0FBQyxRQUFRLEtBQUssT0FBTyxFQUFFO0FBQ2xDLEVBQUUsTUFBTSxDQUFDLE9BQU8sQ0FBQyxJQUFJO0FBQ3JCLElBQUksV0FBVztBQUNmLElBQUksU0FBUztBQUNiLElBQUksU0FBUztBQUNiLElBQUksU0FBUztBQUNiLElBQUksU0FBUztBQUNiLElBQUksUUFBUTtBQUNaLElBQUksU0FBUztBQUNiLElBQUksUUFBUTtBQUNaO0FBQ0E7QUFDQTtBQUNBLElBQUc7QUFDSCxDQUFDO0FBQ0Q7QUFDQSxJQUFJLE9BQU8sQ0FBQyxRQUFRLEtBQUssT0FBTyxFQUFFO0FBQ2xDLEVBQUUsTUFBTSxDQUFDLE9BQU8sQ0FBQyxJQUFJO0FBQ3JCLElBQUksT0FBTztBQUNYLElBQUksU0FBUztBQUNiLElBQUksUUFBUTtBQUNaLElBQUksV0FBVztBQUNmLElBQUksV0FBVztBQUNmLElBQUc7QUFDSDs7O0FDcERBO0FBQ0E7QUFDQTtB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
