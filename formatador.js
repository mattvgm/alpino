'use strict';

var require$$2 = require('fs');
var require$$0$1 = require('stream');
var require$$1 = require('string_decoder');
var require$$4 = require('buffer');
var require$$2$1 = require('events');
var require$$0$2 = require('os');
var require$$1$1 = require('tty');
var require$$2$2 = require('util');
var require$$3 = require('path');
var require$$5 = require('node:worker_threads');

var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

function getDefaultExportFromCjs (x) {
	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
}

function getAugmentedNamespace(n) {
  if (n.__esModule) return n;
  var f = n.default;
	if (typeof f == "function") {
		var a = function a () {
			if (this instanceof a) {
				var args = [null];
				args.push.apply(args, arguments);
				var Ctor = Function.bind.apply(f, args);
				return new Ctor();
			}
			return f.apply(this, arguments);
		};
		a.prototype = f.prototype;
  } else a = {};
  Object.defineProperty(a, '__esModule', {value: true});
	Object.keys(n).forEach(function (k) {
		var d = Object.getOwnPropertyDescriptor(n, k);
		Object.defineProperty(a, k, d.get ? d : {
			enumerable: true,
			get: function () {
				return n[k];
			}
		});
	});
	return a;
}

var once$3 = {exports: {}};

// Returns a wrapper function that returns a wrapped callback
// The wrapper function should do some stuff, and return a
// presumably different callback function.
// This makes sure that own properties are retained, so that
// decorations and such are not lost along the way.
var wrappy_1 = wrappy$1;
function wrappy$1 (fn, cb) {
  if (fn && cb) return wrappy$1(fn)(cb)

  if (typeof fn !== 'function')
    throw new TypeError('need wrapper function')

  Object.keys(fn).forEach(function (k) {
    wrapper[k] = fn[k];
  });

  return wrapper

  function wrapper() {
    var args = new Array(arguments.length);
    for (var i = 0; i < args.length; i++) {
      args[i] = arguments[i];
    }
    var ret = fn.apply(this, args);
    var cb = args[args.length-1];
    if (typeof ret === 'function' && ret !== cb) {
      Object.keys(cb).forEach(function (k) {
        ret[k] = cb[k];
      });
    }
    return ret
  }
}

var wrappy = wrappy_1;
once$3.exports = wrappy(once$2);
once$3.exports.strict = wrappy(onceStrict);

once$2.proto = once$2(function () {
  Object.defineProperty(Function.prototype, 'once', {
    value: function () {
      return once$2(this)
    },
    configurable: true
  });

  Object.defineProperty(Function.prototype, 'onceStrict', {
    value: function () {
      return onceStrict(this)
    },
    configurable: true
  });
});

function once$2 (fn) {
  var f = function () {
    if (f.called) return f.value
    f.called = true;
    return f.value = fn.apply(this, arguments)
  };
  f.called = false;
  return f
}

function onceStrict (fn) {
  var f = function () {
    if (f.called)
      throw new Error(f.onceError)
    f.called = true;
    return f.value = fn.apply(this, arguments)
  };
  var name = fn.name || 'Function wrapped with `once`';
  f.onceError = name + " shouldn't be called more than once";
  f.called = false;
  return f
}

var onceExports = once$3.exports;

var once$1 = onceExports;

var noop$3 = function() {};

var isRequest$1 = function(stream) {
	return stream.setHeader && typeof stream.abort === 'function';
};

var isChildProcess = function(stream) {
	return stream.stdio && Array.isArray(stream.stdio) && stream.stdio.length === 3
};

var eos$1 = function(stream, opts, callback) {
	if (typeof opts === 'function') return eos$1(stream, null, opts);
	if (!opts) opts = {};

	callback = once$1(callback || noop$3);

	var ws = stream._writableState;
	var rs = stream._readableState;
	var readable = opts.readable || (opts.readable !== false && stream.readable);
	var writable = opts.writable || (opts.writable !== false && stream.writable);
	var cancelled = false;

	var onlegacyfinish = function() {
		if (!stream.writable) onfinish();
	};

	var onfinish = function() {
		writable = false;
		if (!readable) callback.call(stream);
	};

	var onend = function() {
		readable = false;
		if (!writable) callback.call(stream);
	};

	var onexit = function(exitCode) {
		callback.call(stream, exitCode ? new Error('exited with error code: ' + exitCode) : null);
	};

	var onerror = function(err) {
		callback.call(stream, err);
	};

	var onclose = function() {
		process.nextTick(onclosenexttick);
	};

	var onclosenexttick = function() {
		if (cancelled) return;
		if (readable && !(rs && (rs.ended && !rs.destroyed))) return callback.call(stream, new Error('premature close'));
		if (writable && !(ws && (ws.ended && !ws.destroyed))) return callback.call(stream, new Error('premature close'));
	};

	var onrequest = function() {
		stream.req.on('finish', onfinish);
	};

	if (isRequest$1(stream)) {
		stream.on('complete', onfinish);
		stream.on('abort', onclose);
		if (stream.req) onrequest();
		else stream.on('request', onrequest);
	} else if (writable && !ws) { // legacy streams
		stream.on('end', onlegacyfinish);
		stream.on('close', onlegacyfinish);
	}

	if (isChildProcess(stream)) stream.on('exit', onexit);

	stream.on('end', onend);
	stream.on('finish', onfinish);
	if (opts.error !== false) stream.on('error', onerror);
	stream.on('close', onclose);

	return function() {
		cancelled = true;
		stream.removeListener('complete', onfinish);
		stream.removeListener('abort', onclose);
		stream.removeListener('request', onrequest);
		if (stream.req) stream.req.removeListener('finish', onfinish);
		stream.removeListener('end', onlegacyfinish);
		stream.removeListener('close', onlegacyfinish);
		stream.removeListener('finish', onfinish);
		stream.removeListener('exit', onexit);
		stream.removeListener('end', onend);
		stream.removeListener('error', onerror);
		stream.removeListener('close', onclose);
	};
};

var endOfStream$1 = eos$1;

var once = onceExports;
var eos = endOfStream$1;
var fs$1 = require$$2; // we only need fs to get the ReadStream and WriteStream prototypes

var noop$2 = function () {};
var ancient = /^v?\.0/.test(process.version);

var isFn = function (fn) {
  return typeof fn === 'function'
};

var isFS = function (stream) {
  if (!ancient) return false // newer node version do not need to care about fs is a special way
  if (!fs$1) return false // browser
  return (stream instanceof (fs$1.ReadStream || noop$2) || stream instanceof (fs$1.WriteStream || noop$2)) && isFn(stream.close)
};

var isRequest = function (stream) {
  return stream.setHeader && isFn(stream.abort)
};

var destroyer = function (stream, reading, writing, callback) {
  callback = once(callback);

  var closed = false;
  stream.on('close', function () {
    closed = true;
  });

  eos(stream, {readable: reading, writable: writing}, function (err) {
    if (err) return callback(err)
    closed = true;
    callback();
  });

  var destroyed = false;
  return function (err) {
    if (closed) return
    if (destroyed) return
    destroyed = true;

    if (isFS(stream)) return stream.close(noop$2) // use close for fs streams to avoid fd leaks
    if (isRequest(stream)) return stream.abort() // request.destroy just do .end - .abort is what we want

    if (isFn(stream.destroy)) return stream.destroy()

    callback(err || new Error('stream was destroyed'));
  }
};

var call = function (fn) {
  fn();
};

var pipe = function (from, to) {
  return from.pipe(to)
};

var pump$1 = function () {
  var streams = Array.prototype.slice.call(arguments);
  var callback = isFn(streams[streams.length - 1] || noop$2) && streams.pop() || noop$2;

  if (Array.isArray(streams[0])) streams = streams[0];
  if (streams.length < 2) throw new Error('pump requires two streams per minimum')

  var error;
  var destroys = streams.map(function (stream, i) {
    var reading = i < streams.length - 1;
    var writing = i > 0;
    return destroyer(stream, reading, writing, function (err) {
      if (!error) error = err;
      if (err) destroys.forEach(call);
      if (reading) return
      destroys.forEach(call);
      callback(error);
    })
  });

  return streams.reduce(pipe)
};

var pump_1 = pump$1;

/*
Copyright (c) 2014-2021, Matteo Collina <hello@matteocollina.com>

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted, provided that the above
copyright notice and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF OR
IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
*/

const { Transform: Transform$1 } = require$$0$1;
const { StringDecoder } = require$$1;
const kLast = Symbol('last');
const kDecoder = Symbol('decoder');

function transform$1 (chunk, enc, cb) {
  let list;
  if (this.overflow) { // Line buffer is full. Skip to start of next line.
    const buf = this[kDecoder].write(chunk);
    list = buf.split(this.matcher);

    if (list.length === 1) return cb() // Line ending not found. Discard entire chunk.

    // Line ending found. Discard trailing fragment of previous line and reset overflow state.
    list.shift();
    this.overflow = false;
  } else {
    this[kLast] += this[kDecoder].write(chunk);
    list = this[kLast].split(this.matcher);
  }

  this[kLast] = list.pop();

  for (let i = 0; i < list.length; i++) {
    try {
      push(this, this.mapper(list[i]));
    } catch (error) {
      return cb(error)
    }
  }

  this.overflow = this[kLast].length > this.maxLength;
  if (this.overflow && !this.skipOverflow) {
    cb(new Error('maximum buffer reached'));
    return
  }

  cb();
}

function flush (cb) {
  // forward any gibberish left in there
  this[kLast] += this[kDecoder].end();

  if (this[kLast]) {
    try {
      push(this, this.mapper(this[kLast]));
    } catch (error) {
      return cb(error)
    }
  }

  cb();
}

function push (self, val) {
  if (val !== undefined) {
    self.push(val);
  }
}

function noop$1 (incoming) {
  return incoming
}

function split$1 (matcher, mapper, options) {
  // Set defaults for any arguments not supplied.
  matcher = matcher || /\r?\n/;
  mapper = mapper || noop$1;
  options = options || {};

  // Test arguments explicitly.
  switch (arguments.length) {
    case 1:
      // If mapper is only argument.
      if (typeof matcher === 'function') {
        mapper = matcher;
        matcher = /\r?\n/;
      // If options is only argument.
      } else if (typeof matcher === 'object' && !(matcher instanceof RegExp) && !matcher[Symbol.split]) {
        options = matcher;
        matcher = /\r?\n/;
      }
      break

    case 2:
      // If mapper and options are arguments.
      if (typeof matcher === 'function') {
        options = mapper;
        mapper = matcher;
        matcher = /\r?\n/;
      // If matcher and options are arguments.
      } else if (typeof mapper === 'object') {
        options = mapper;
        mapper = noop$1;
      }
  }

  options = Object.assign({}, options);
  options.autoDestroy = true;
  options.transform = transform$1;
  options.flush = flush;
  options.readableObjectMode = true;

  const stream = new Transform$1(options);

  stream[kLast] = '';
  stream[kDecoder] = new StringDecoder('utf8');
  stream.matcher = matcher;
  stream.mapper = mapper;
  stream.maxLength = options.maxLength;
  stream.skipOverflow = options.skipOverflow || false;
  stream.overflow = false;
  stream._destroy = function (err, cb) {
    // Weird Node v12 bug that we need to work around
    this._writableState.errorEmitted = false;
    cb(err);
  };

  return stream
}

var split2 = split$1;

var ours = {exports: {}};

var stream = {exports: {}};

var primordials;
var hasRequiredPrimordials;

function requirePrimordials () {
	if (hasRequiredPrimordials) return primordials;
	hasRequiredPrimordials = 1;

	/*
	  This file is a reduced and adapted version of the main lib/internal/per_context/primordials.js file defined at

	  https://github.com/nodejs/node/blob/master/lib/internal/per_context/primordials.js

	  Don't try to replace with the original file and keep it up to date with the upstream file.
	*/
	primordials = {
	  ArrayIsArray(self) {
	    return Array.isArray(self)
	  },
	  ArrayPrototypeIncludes(self, el) {
	    return self.includes(el)
	  },
	  ArrayPrototypeIndexOf(self, el) {
	    return self.indexOf(el)
	  },
	  ArrayPrototypeJoin(self, sep) {
	    return self.join(sep)
	  },
	  ArrayPrototypeMap(self, fn) {
	    return self.map(fn)
	  },
	  ArrayPrototypePop(self, el) {
	    return self.pop(el)
	  },
	  ArrayPrototypePush(self, el) {
	    return self.push(el)
	  },
	  ArrayPrototypeSlice(self, start, end) {
	    return self.slice(start, end)
	  },
	  Error,
	  FunctionPrototypeCall(fn, thisArgs, ...args) {
	    return fn.call(thisArgs, ...args)
	  },
	  FunctionPrototypeSymbolHasInstance(self, instance) {
	    return Function.prototype[Symbol.hasInstance].call(self, instance)
	  },
	  MathFloor: Math.floor,
	  Number,
	  NumberIsInteger: Number.isInteger,
	  NumberIsNaN: Number.isNaN,
	  NumberMAX_SAFE_INTEGER: Number.MAX_SAFE_INTEGER,
	  NumberMIN_SAFE_INTEGER: Number.MIN_SAFE_INTEGER,
	  NumberParseInt: Number.parseInt,
	  ObjectDefineProperties(self, props) {
	    return Object.defineProperties(self, props)
	  },
	  ObjectDefineProperty(self, name, prop) {
	    return Object.defineProperty(self, name, prop)
	  },
	  ObjectGetOwnPropertyDescriptor(self, name) {
	    return Object.getOwnPropertyDescriptor(self, name)
	  },
	  ObjectKeys(obj) {
	    return Object.keys(obj)
	  },
	  ObjectSetPrototypeOf(target, proto) {
	    return Object.setPrototypeOf(target, proto)
	  },
	  Promise,
	  PromisePrototypeCatch(self, fn) {
	    return self.catch(fn)
	  },
	  PromisePrototypeThen(self, thenFn, catchFn) {
	    return self.then(thenFn, catchFn)
	  },
	  PromiseReject(err) {
	    return Promise.reject(err)
	  },
	  ReflectApply: Reflect.apply,
	  RegExpPrototypeTest(self, value) {
	    return self.test(value)
	  },
	  SafeSet: Set,
	  String,
	  StringPrototypeSlice(self, start, end) {
	    return self.slice(start, end)
	  },
	  StringPrototypeToLowerCase(self) {
	    return self.toLowerCase()
	  },
	  StringPrototypeToUpperCase(self) {
	    return self.toUpperCase()
	  },
	  StringPrototypeTrim(self) {
	    return self.trim()
	  },
	  Symbol,
	  SymbolFor: Symbol.for,
	  SymbolAsyncIterator: Symbol.asyncIterator,
	  SymbolHasInstance: Symbol.hasInstance,
	  SymbolIterator: Symbol.iterator,
	  TypedArrayPrototypeSet(self, buf, len) {
	    return self.set(buf, len)
	  },
	  Uint8Array
	};
	return primordials;
}

var util$1 = {exports: {}};

var hasRequiredUtil;

function requireUtil () {
	if (hasRequiredUtil) return util$1.exports;
	hasRequiredUtil = 1;
	(function (module) {

		const bufferModule = require$$4;
		const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;
		const Blob = globalThis.Blob || bufferModule.Blob;
		/* eslint-disable indent */
		const isBlob =
		  typeof Blob !== 'undefined'
		    ? function isBlob(b) {
		        // eslint-disable-next-line indent
		        return b instanceof Blob
		      }
		    : function isBlob(b) {
		        return false
		      };
		/* eslint-enable indent */

		// This is a simplified version of AggregateError
		class AggregateError extends Error {
		  constructor(errors) {
		    if (!Array.isArray(errors)) {
		      throw new TypeError(`Expected input to be an Array, got ${typeof errors}`)
		    }
		    let message = '';
		    for (let i = 0; i < errors.length; i++) {
		      message += `    ${errors[i].stack}\n`;
		    }
		    super(message);
		    this.name = 'AggregateError';
		    this.errors = errors;
		  }
		}
		module.exports = {
		  AggregateError,
		  kEmptyObject: Object.freeze({}),
		  once(callback) {
		    let called = false;
		    return function (...args) {
		      if (called) {
		        return
		      }
		      called = true;
		      callback.apply(this, args);
		    }
		  },
		  createDeferredPromise: function () {
		    let resolve;
		    let reject;

		    // eslint-disable-next-line promise/param-names
		    const promise = new Promise((res, rej) => {
		      resolve = res;
		      reject = rej;
		    });
		    return {
		      promise,
		      resolve,
		      reject
		    }
		  },
		  promisify(fn) {
		    return new Promise((resolve, reject) => {
		      fn((err, ...args) => {
		        if (err) {
		          return reject(err)
		        }
		        return resolve(...args)
		      });
		    })
		  },
		  debuglog() {
		    return function () {}
		  },
		  format(format, ...args) {
		    // Simplified version of https://nodejs.org/api/util.html#utilformatformat-args
		    return format.replace(/%([sdifj])/g, function (...[_unused, type]) {
		      const replacement = args.shift();
		      if (type === 'f') {
		        return replacement.toFixed(6)
		      } else if (type === 'j') {
		        return JSON.stringify(replacement)
		      } else if (type === 's' && typeof replacement === 'object') {
		        const ctor = replacement.constructor !== Object ? replacement.constructor.name : '';
		        return `${ctor} {}`.trim()
		      } else {
		        return replacement.toString()
		      }
		    })
		  },
		  inspect(value) {
		    // Vastly simplified version of https://nodejs.org/api/util.html#utilinspectobject-options
		    switch (typeof value) {
		      case 'string':
		        if (value.includes("'")) {
		          if (!value.includes('"')) {
		            return `"${value}"`
		          } else if (!value.includes('`') && !value.includes('${')) {
		            return `\`${value}\``
		          }
		        }
		        return `'${value}'`
		      case 'number':
		        if (isNaN(value)) {
		          return 'NaN'
		        } else if (Object.is(value, -0)) {
		          return String(value)
		        }
		        return value
		      case 'bigint':
		        return `${String(value)}n`
		      case 'boolean':
		      case 'undefined':
		        return String(value)
		      case 'object':
		        return '{}'
		    }
		  },
		  types: {
		    isAsyncFunction(fn) {
		      return fn instanceof AsyncFunction
		    },
		    isArrayBufferView(arr) {
		      return ArrayBuffer.isView(arr)
		    }
		  },
		  isBlob
		};
		module.exports.promisify.custom = Symbol.for('nodejs.util.promisify.custom'); 
	} (util$1));
	return util$1.exports;
}

var operators = {};

/**
 * @author Toru Nagashima <https://github.com/mysticatea>
 * @copyright 2015 Toru Nagashima. All rights reserved.
 * See LICENSE file in root directory for full license.
 */
/**
 * @typedef {object} PrivateData
 * @property {EventTarget} eventTarget The event target.
 * @property {{type:string}} event The original event object.
 * @property {number} eventPhase The current event phase.
 * @property {EventTarget|null} currentTarget The current event target.
 * @property {boolean} canceled The flag to prevent default.
 * @property {boolean} stopped The flag to stop propagation.
 * @property {boolean} immediateStopped The flag to stop propagation immediately.
 * @property {Function|null} passiveListener The listener if the current listener is passive. Otherwise this is null.
 * @property {number} timeStamp The unix time.
 * @private
 */

/**
 * Private data for event wrappers.
 * @type {WeakMap<Event, PrivateData>}
 * @private
 */
const privateData = new WeakMap();

/**
 * Cache for wrapper classes.
 * @type {WeakMap<Object, Function>}
 * @private
 */
const wrappers = new WeakMap();

/**
 * Get private data.
 * @param {Event} event The event object to get private data.
 * @returns {PrivateData} The private data of the event.
 * @private
 */
function pd(event) {
    const retv = privateData.get(event);
    console.assert(
        retv != null,
        "'this' is expected an Event object, but got",
        event
    );
    return retv
}

/**
 * https://dom.spec.whatwg.org/#set-the-canceled-flag
 * @param data {PrivateData} private data.
 */
function setCancelFlag(data) {
    if (data.passiveListener != null) {
        if (
            typeof console !== "undefined" &&
            typeof console.error === "function"
        ) {
            console.error(
                "Unable to preventDefault inside passive event listener invocation.",
                data.passiveListener
            );
        }
        return
    }
    if (!data.event.cancelable) {
        return
    }

    data.canceled = true;
    if (typeof data.event.preventDefault === "function") {
        data.event.preventDefault();
    }
}

/**
 * @see https://dom.spec.whatwg.org/#interface-event
 * @private
 */
/**
 * The event wrapper.
 * @constructor
 * @param {EventTarget} eventTarget The event target of this dispatching.
 * @param {Event|{type:string}} event The original event to wrap.
 */
function Event(eventTarget, event) {
    privateData.set(this, {
        eventTarget,
        event,
        eventPhase: 2,
        currentTarget: eventTarget,
        canceled: false,
        stopped: false,
        immediateStopped: false,
        passiveListener: null,
        timeStamp: event.timeStamp || Date.now(),
    });

    // https://heycam.github.io/webidl/#Unforgeable
    Object.defineProperty(this, "isTrusted", { value: false, enumerable: true });

    // Define accessors
    const keys = Object.keys(event);
    for (let i = 0; i < keys.length; ++i) {
        const key = keys[i];
        if (!(key in this)) {
            Object.defineProperty(this, key, defineRedirectDescriptor(key));
        }
    }
}

// Should be enumerable, but class methods are not enumerable.
Event.prototype = {
    /**
     * The type of this event.
     * @type {string}
     */
    get type() {
        return pd(this).event.type
    },

    /**
     * The target of this event.
     * @type {EventTarget}
     */
    get target() {
        return pd(this).eventTarget
    },

    /**
     * The target of this event.
     * @type {EventTarget}
     */
    get currentTarget() {
        return pd(this).currentTarget
    },

    /**
     * @returns {EventTarget[]} The composed path of this event.
     */
    composedPath() {
        const currentTarget = pd(this).currentTarget;
        if (currentTarget == null) {
            return []
        }
        return [currentTarget]
    },

    /**
     * Constant of NONE.
     * @type {number}
     */
    get NONE() {
        return 0
    },

    /**
     * Constant of CAPTURING_PHASE.
     * @type {number}
     */
    get CAPTURING_PHASE() {
        return 1
    },

    /**
     * Constant of AT_TARGET.
     * @type {number}
     */
    get AT_TARGET() {
        return 2
    },

    /**
     * Constant of BUBBLING_PHASE.
     * @type {number}
     */
    get BUBBLING_PHASE() {
        return 3
    },

    /**
     * The target of this event.
     * @type {number}
     */
    get eventPhase() {
        return pd(this).eventPhase
    },

    /**
     * Stop event bubbling.
     * @returns {void}
     */
    stopPropagation() {
        const data = pd(this);

        data.stopped = true;
        if (typeof data.event.stopPropagation === "function") {
            data.event.stopPropagation();
        }
    },

    /**
     * Stop event bubbling.
     * @returns {void}
     */
    stopImmediatePropagation() {
        const data = pd(this);

        data.stopped = true;
        data.immediateStopped = true;
        if (typeof data.event.stopImmediatePropagation === "function") {
            data.event.stopImmediatePropagation();
        }
    },

    /**
     * The flag to be bubbling.
     * @type {boolean}
     */
    get bubbles() {
        return Boolean(pd(this).event.bubbles)
    },

    /**
     * The flag to be cancelable.
     * @type {boolean}
     */
    get cancelable() {
        return Boolean(pd(this).event.cancelable)
    },

    /**
     * Cancel this event.
     * @returns {void}
     */
    preventDefault() {
        setCancelFlag(pd(this));
    },

    /**
     * The flag to indicate cancellation state.
     * @type {boolean}
     */
    get defaultPrevented() {
        return pd(this).canceled
    },

    /**
     * The flag to be composed.
     * @type {boolean}
     */
    get composed() {
        return Boolean(pd(this).event.composed)
    },

    /**
     * The unix time of this event.
     * @type {number}
     */
    get timeStamp() {
        return pd(this).timeStamp
    },

    /**
     * The target of this event.
     * @type {EventTarget}
     * @deprecated
     */
    get srcElement() {
        return pd(this).eventTarget
    },

    /**
     * The flag to stop event bubbling.
     * @type {boolean}
     * @deprecated
     */
    get cancelBubble() {
        return pd(this).stopped
    },
    set cancelBubble(value) {
        if (!value) {
            return
        }
        const data = pd(this);

        data.stopped = true;
        if (typeof data.event.cancelBubble === "boolean") {
            data.event.cancelBubble = true;
        }
    },

    /**
     * The flag to indicate cancellation state.
     * @type {boolean}
     * @deprecated
     */
    get returnValue() {
        return !pd(this).canceled
    },
    set returnValue(value) {
        if (!value) {
            setCancelFlag(pd(this));
        }
    },

    /**
     * Initialize this event object. But do nothing under event dispatching.
     * @param {string} type The event type.
     * @param {boolean} [bubbles=false] The flag to be possible to bubble up.
     * @param {boolean} [cancelable=false] The flag to be possible to cancel.
     * @deprecated
     */
    initEvent() {
        // Do nothing.
    },
};

// `constructor` is not enumerable.
Object.defineProperty(Event.prototype, "constructor", {
    value: Event,
    configurable: true,
    writable: true,
});

// Ensure `event instanceof window.Event` is `true`.
if (typeof window !== "undefined" && typeof window.Event !== "undefined") {
    Object.setPrototypeOf(Event.prototype, window.Event.prototype);

    // Make association for wrappers.
    wrappers.set(window.Event.prototype, Event);
}

/**
 * Get the property descriptor to redirect a given property.
 * @param {string} key Property name to define property descriptor.
 * @returns {PropertyDescriptor} The property descriptor to redirect the property.
 * @private
 */
function defineRedirectDescriptor(key) {
    return {
        get() {
            return pd(this).event[key]
        },
        set(value) {
            pd(this).event[key] = value;
        },
        configurable: true,
        enumerable: true,
    }
}

/**
 * Get the property descriptor to call a given method property.
 * @param {string} key Property name to define property descriptor.
 * @returns {PropertyDescriptor} The property descriptor to call the method property.
 * @private
 */
function defineCallDescriptor(key) {
    return {
        value() {
            const event = pd(this).event;
            return event[key].apply(event, arguments)
        },
        configurable: true,
        enumerable: true,
    }
}

/**
 * Define new wrapper class.
 * @param {Function} BaseEvent The base wrapper class.
 * @param {Object} proto The prototype of the original event.
 * @returns {Function} The defined wrapper class.
 * @private
 */
function defineWrapper(BaseEvent, proto) {
    const keys = Object.keys(proto);
    if (keys.length === 0) {
        return BaseEvent
    }

    /** CustomEvent */
    function CustomEvent(eventTarget, event) {
        BaseEvent.call(this, eventTarget, event);
    }

    CustomEvent.prototype = Object.create(BaseEvent.prototype, {
        constructor: { value: CustomEvent, configurable: true, writable: true },
    });

    // Define accessors.
    for (let i = 0; i < keys.length; ++i) {
        const key = keys[i];
        if (!(key in BaseEvent.prototype)) {
            const descriptor = Object.getOwnPropertyDescriptor(proto, key);
            const isFunc = typeof descriptor.value === "function";
            Object.defineProperty(
                CustomEvent.prototype,
                key,
                isFunc
                    ? defineCallDescriptor(key)
                    : defineRedirectDescriptor(key)
            );
        }
    }

    return CustomEvent
}

/**
 * Get the wrapper class of a given prototype.
 * @param {Object} proto The prototype of the original event to get its wrapper.
 * @returns {Function} The wrapper class.
 * @private
 */
function getWrapper(proto) {
    if (proto == null || proto === Object.prototype) {
        return Event
    }

    let wrapper = wrappers.get(proto);
    if (wrapper == null) {
        wrapper = defineWrapper(getWrapper(Object.getPrototypeOf(proto)), proto);
        wrappers.set(proto, wrapper);
    }
    return wrapper
}

/**
 * Wrap a given event to management a dispatching.
 * @param {EventTarget} eventTarget The event target of this dispatching.
 * @param {Object} event The event to wrap.
 * @returns {Event} The wrapper instance.
 * @private
 */
function wrapEvent(eventTarget, event) {
    const Wrapper = getWrapper(Object.getPrototypeOf(event));
    return new Wrapper(eventTarget, event)
}

/**
 * Get the immediateStopped flag of a given event.
 * @param {Event} event The event to get.
 * @returns {boolean} The flag to stop propagation immediately.
 * @private
 */
function isStopped(event) {
    return pd(event).immediateStopped
}

/**
 * Set the current event phase of a given event.
 * @param {Event} event The event to set current target.
 * @param {number} eventPhase New event phase.
 * @returns {void}
 * @private
 */
function setEventPhase(event, eventPhase) {
    pd(event).eventPhase = eventPhase;
}

/**
 * Set the current target of a given event.
 * @param {Event} event The event to set current target.
 * @param {EventTarget|null} currentTarget New current target.
 * @returns {void}
 * @private
 */
function setCurrentTarget(event, currentTarget) {
    pd(event).currentTarget = currentTarget;
}

/**
 * Set a passive listener of a given event.
 * @param {Event} event The event to set current target.
 * @param {Function|null} passiveListener New passive listener.
 * @returns {void}
 * @private
 */
function setPassiveListener(event, passiveListener) {
    pd(event).passiveListener = passiveListener;
}

/**
 * @typedef {object} ListenerNode
 * @property {Function} listener
 * @property {1|2|3} listenerType
 * @property {boolean} passive
 * @property {boolean} once
 * @property {ListenerNode|null} next
 * @private
 */

/**
 * @type {WeakMap<object, Map<string, ListenerNode>>}
 * @private
 */
const listenersMap = new WeakMap();

// Listener types
const CAPTURE = 1;
const BUBBLE = 2;
const ATTRIBUTE = 3;

/**
 * Check whether a given value is an object or not.
 * @param {any} x The value to check.
 * @returns {boolean} `true` if the value is an object.
 */
function isObject$1(x) {
    return x !== null && typeof x === "object" //eslint-disable-line no-restricted-syntax
}

/**
 * Get listeners.
 * @param {EventTarget} eventTarget The event target to get.
 * @returns {Map<string, ListenerNode>} The listeners.
 * @private
 */
function getListeners(eventTarget) {
    const listeners = listenersMap.get(eventTarget);
    if (listeners == null) {
        throw new TypeError(
            "'this' is expected an EventTarget object, but got another value."
        )
    }
    return listeners
}

/**
 * Get the property descriptor for the event attribute of a given event.
 * @param {string} eventName The event name to get property descriptor.
 * @returns {PropertyDescriptor} The property descriptor.
 * @private
 */
function defineEventAttributeDescriptor(eventName) {
    return {
        get() {
            const listeners = getListeners(this);
            let node = listeners.get(eventName);
            while (node != null) {
                if (node.listenerType === ATTRIBUTE) {
                    return node.listener
                }
                node = node.next;
            }
            return null
        },

        set(listener) {
            if (typeof listener !== "function" && !isObject$1(listener)) {
                listener = null; // eslint-disable-line no-param-reassign
            }
            const listeners = getListeners(this);

            // Traverse to the tail while removing old value.
            let prev = null;
            let node = listeners.get(eventName);
            while (node != null) {
                if (node.listenerType === ATTRIBUTE) {
                    // Remove old value.
                    if (prev !== null) {
                        prev.next = node.next;
                    } else if (node.next !== null) {
                        listeners.set(eventName, node.next);
                    } else {
                        listeners.delete(eventName);
                    }
                } else {
                    prev = node;
                }

                node = node.next;
            }

            // Add new value.
            if (listener !== null) {
                const newNode = {
                    listener,
                    listenerType: ATTRIBUTE,
                    passive: false,
                    once: false,
                    next: null,
                };
                if (prev === null) {
                    listeners.set(eventName, newNode);
                } else {
                    prev.next = newNode;
                }
            }
        },
        configurable: true,
        enumerable: true,
    }
}

/**
 * Define an event attribute (e.g. `eventTarget.onclick`).
 * @param {Object} eventTargetPrototype The event target prototype to define an event attrbite.
 * @param {string} eventName The event name to define.
 * @returns {void}
 */
function defineEventAttribute(eventTargetPrototype, eventName) {
    Object.defineProperty(
        eventTargetPrototype,
        `on${eventName}`,
        defineEventAttributeDescriptor(eventName)
    );
}

/**
 * Define a custom EventTarget with event attributes.
 * @param {string[]} eventNames Event names for event attributes.
 * @returns {EventTarget} The custom EventTarget.
 * @private
 */
function defineCustomEventTarget(eventNames) {
    /** CustomEventTarget */
    function CustomEventTarget() {
        EventTarget.call(this);
    }

    CustomEventTarget.prototype = Object.create(EventTarget.prototype, {
        constructor: {
            value: CustomEventTarget,
            configurable: true,
            writable: true,
        },
    });

    for (let i = 0; i < eventNames.length; ++i) {
        defineEventAttribute(CustomEventTarget.prototype, eventNames[i]);
    }

    return CustomEventTarget
}

/**
 * EventTarget.
 *
 * - This is constructor if no arguments.
 * - This is a function which returns a CustomEventTarget constructor if there are arguments.
 *
 * For example:
 *
 *     class A extends EventTarget {}
 *     class B extends EventTarget("message") {}
 *     class C extends EventTarget("message", "error") {}
 *     class D extends EventTarget(["message", "error"]) {}
 */
function EventTarget() {
    /*eslint-disable consistent-return */
    if (this instanceof EventTarget) {
        listenersMap.set(this, new Map());
        return
    }
    if (arguments.length === 1 && Array.isArray(arguments[0])) {
        return defineCustomEventTarget(arguments[0])
    }
    if (arguments.length > 0) {
        const types = new Array(arguments.length);
        for (let i = 0; i < arguments.length; ++i) {
            types[i] = arguments[i];
        }
        return defineCustomEventTarget(types)
    }
    throw new TypeError("Cannot call a class as a function")
    /*eslint-enable consistent-return */
}

// Should be enumerable, but class methods are not enumerable.
EventTarget.prototype = {
    /**
     * Add a given listener to this event target.
     * @param {string} eventName The event name to add.
     * @param {Function} listener The listener to add.
     * @param {boolean|{capture?:boolean,passive?:boolean,once?:boolean}} [options] The options for this listener.
     * @returns {void}
     */
    addEventListener(eventName, listener, options) {
        if (listener == null) {
            return
        }
        if (typeof listener !== "function" && !isObject$1(listener)) {
            throw new TypeError("'listener' should be a function or an object.")
        }

        const listeners = getListeners(this);
        const optionsIsObj = isObject$1(options);
        const capture = optionsIsObj
            ? Boolean(options.capture)
            : Boolean(options);
        const listenerType = capture ? CAPTURE : BUBBLE;
        const newNode = {
            listener,
            listenerType,
            passive: optionsIsObj && Boolean(options.passive),
            once: optionsIsObj && Boolean(options.once),
            next: null,
        };

        // Set it as the first node if the first node is null.
        let node = listeners.get(eventName);
        if (node === undefined) {
            listeners.set(eventName, newNode);
            return
        }

        // Traverse to the tail while checking duplication..
        let prev = null;
        while (node != null) {
            if (
                node.listener === listener &&
                node.listenerType === listenerType
            ) {
                // Should ignore duplication.
                return
            }
            prev = node;
            node = node.next;
        }

        // Add it.
        prev.next = newNode;
    },

    /**
     * Remove a given listener from this event target.
     * @param {string} eventName The event name to remove.
     * @param {Function} listener The listener to remove.
     * @param {boolean|{capture?:boolean,passive?:boolean,once?:boolean}} [options] The options for this listener.
     * @returns {void}
     */
    removeEventListener(eventName, listener, options) {
        if (listener == null) {
            return
        }

        const listeners = getListeners(this);
        const capture = isObject$1(options)
            ? Boolean(options.capture)
            : Boolean(options);
        const listenerType = capture ? CAPTURE : BUBBLE;

        let prev = null;
        let node = listeners.get(eventName);
        while (node != null) {
            if (
                node.listener === listener &&
                node.listenerType === listenerType
            ) {
                if (prev !== null) {
                    prev.next = node.next;
                } else if (node.next !== null) {
                    listeners.set(eventName, node.next);
                } else {
                    listeners.delete(eventName);
                }
                return
            }

            prev = node;
            node = node.next;
        }
    },

    /**
     * Dispatch a given event.
     * @param {Event|{type:string}} event The event to dispatch.
     * @returns {boolean} `false` if canceled.
     */
    dispatchEvent(event) {
        if (event == null || typeof event.type !== "string") {
            throw new TypeError('"event.type" should be a string.')
        }

        // If listeners aren't registered, terminate.
        const listeners = getListeners(this);
        const eventName = event.type;
        let node = listeners.get(eventName);
        if (node == null) {
            return true
        }

        // Since we cannot rewrite several properties, so wrap object.
        const wrappedEvent = wrapEvent(this, event);

        // This doesn't process capturing phase and bubbling phase.
        // This isn't participating in a tree.
        let prev = null;
        while (node != null) {
            // Remove this listener if it's once
            if (node.once) {
                if (prev !== null) {
                    prev.next = node.next;
                } else if (node.next !== null) {
                    listeners.set(eventName, node.next);
                } else {
                    listeners.delete(eventName);
                }
            } else {
                prev = node;
            }

            // Call this listener
            setPassiveListener(
                wrappedEvent,
                node.passive ? node.listener : null
            );
            if (typeof node.listener === "function") {
                try {
                    node.listener.call(this, wrappedEvent);
                } catch (err) {
                    if (
                        typeof console !== "undefined" &&
                        typeof console.error === "function"
                    ) {
                        console.error(err);
                    }
                }
            } else if (
                node.listenerType !== ATTRIBUTE &&
                typeof node.listener.handleEvent === "function"
            ) {
                node.listener.handleEvent(wrappedEvent);
            }

            // Break if `event.stopImmediatePropagation` was called.
            if (isStopped(wrappedEvent)) {
                break
            }

            node = node.next;
        }
        setPassiveListener(wrappedEvent, null);
        setEventPhase(wrappedEvent, 0);
        setCurrentTarget(wrappedEvent, null);

        return !wrappedEvent.defaultPrevented
    },
};

// `constructor` is not enumerable.
Object.defineProperty(EventTarget.prototype, "constructor", {
    value: EventTarget,
    configurable: true,
    writable: true,
});

// Ensure `eventTarget instanceof window.EventTarget` is `true`.
if (
    typeof window !== "undefined" &&
    typeof window.EventTarget !== "undefined"
) {
    Object.setPrototypeOf(EventTarget.prototype, window.EventTarget.prototype);
}

/**
 * @author Toru Nagashima <https://github.com/mysticatea>
 * See LICENSE file in root directory for full license.
 */

/**
 * The signal class.
 * @see https://dom.spec.whatwg.org/#abortsignal
 */
class AbortSignal extends EventTarget {
    /**
     * AbortSignal cannot be constructed directly.
     */
    constructor() {
        super();
        throw new TypeError("AbortSignal cannot be constructed directly");
    }
    /**
     * Returns `true` if this `AbortSignal`'s `AbortController` has signaled to abort, and `false` otherwise.
     */
    get aborted() {
        const aborted = abortedFlags.get(this);
        if (typeof aborted !== "boolean") {
            throw new TypeError(`Expected 'this' to be an 'AbortSignal' object, but got ${this === null ? "null" : typeof this}`);
        }
        return aborted;
    }
}
defineEventAttribute(AbortSignal.prototype, "abort");
/**
 * Create an AbortSignal object.
 */
function createAbortSignal() {
    const signal = Object.create(AbortSignal.prototype);
    EventTarget.call(signal);
    abortedFlags.set(signal, false);
    return signal;
}
/**
 * Abort a given signal.
 */
function abortSignal(signal) {
    if (abortedFlags.get(signal) !== false) {
        return;
    }
    abortedFlags.set(signal, true);
    signal.dispatchEvent({ type: "abort" });
}
/**
 * Aborted flag for each instances.
 */
const abortedFlags = new WeakMap();
// Properties should be enumerable.
Object.defineProperties(AbortSignal.prototype, {
    aborted: { enumerable: true },
});
// `toString()` should return `"[object AbortSignal]"`
if (typeof Symbol === "function" && typeof Symbol.toStringTag === "symbol") {
    Object.defineProperty(AbortSignal.prototype, Symbol.toStringTag, {
        configurable: true,
        value: "AbortSignal",
    });
}

/**
 * The AbortController.
 * @see https://dom.spec.whatwg.org/#abortcontroller
 */
class AbortController {
    /**
     * Initialize this controller.
     */
    constructor() {
        signals.set(this, createAbortSignal());
    }
    /**
     * Returns the `AbortSignal` object associated with this object.
     */
    get signal() {
        return getSignal(this);
    }
    /**
     * Abort and signal to any observers that the associated activity is to be aborted.
     */
    abort() {
        abortSignal(getSignal(this));
    }
}
/**
 * Associated signals.
 */
const signals = new WeakMap();
/**
 * Get the associated signal of a given controller.
 */
function getSignal(controller) {
    const signal = signals.get(controller);
    if (signal == null) {
        throw new TypeError(`Expected 'this' to be an 'AbortController' object, but got ${controller === null ? "null" : typeof controller}`);
    }
    return signal;
}
// Properties should be enumerable.
Object.defineProperties(AbortController.prototype, {
    signal: { enumerable: true },
    abort: { enumerable: true },
});
if (typeof Symbol === "function" && typeof Symbol.toStringTag === "symbol") {
    Object.defineProperty(AbortController.prototype, Symbol.toStringTag, {
        configurable: true,
        value: "AbortController",
    });
}

var abortController = /*#__PURE__*/Object.freeze({
	__proto__: null,
	AbortController: AbortController,
	AbortSignal: AbortSignal,
	default: AbortController
});

var require$$0 = /*@__PURE__*/getAugmentedNamespace(abortController);

var errors;
var hasRequiredErrors;

function requireErrors () {
	if (hasRequiredErrors) return errors;
	hasRequiredErrors = 1;

	const { format, inspect, AggregateError: CustomAggregateError } = requireUtil();

	/*
	  This file is a reduced and adapted version of the main lib/internal/errors.js file defined at

	  https://github.com/nodejs/node/blob/master/lib/internal/errors.js

	  Don't try to replace with the original file and keep it up to date (starting from E(...) definitions)
	  with the upstream file.
	*/

	const AggregateError = globalThis.AggregateError || CustomAggregateError;
	const kIsNodeError = Symbol('kIsNodeError');
	const kTypes = [
	  'string',
	  'function',
	  'number',
	  'object',
	  // Accept 'Function' and 'Object' as alternative to the lower cased version.
	  'Function',
	  'Object',
	  'boolean',
	  'bigint',
	  'symbol'
	];
	const classRegExp = /^([A-Z][a-z0-9]*)+$/;
	const nodeInternalPrefix = '__node_internal_';
	const codes = {};
	function assert(value, message) {
	  if (!value) {
	    throw new codes.ERR_INTERNAL_ASSERTION(message)
	  }
	}

	// Only use this for integers! Decimal numbers do not work with this function.
	function addNumericalSeparator(val) {
	  let res = '';
	  let i = val.length;
	  const start = val[0] === '-' ? 1 : 0;
	  for (; i >= start + 4; i -= 3) {
	    res = `_${val.slice(i - 3, i)}${res}`;
	  }
	  return `${val.slice(0, i)}${res}`
	}
	function getMessage(key, msg, args) {
	  if (typeof msg === 'function') {
	    assert(
	      msg.length <= args.length,
	      // Default options do not count.
	      `Code: ${key}; The provided arguments length (${args.length}) does not match the required ones (${msg.length}).`
	    );
	    return msg(...args)
	  }
	  const expectedLength = (msg.match(/%[dfijoOs]/g) || []).length;
	  assert(
	    expectedLength === args.length,
	    `Code: ${key}; The provided arguments length (${args.length}) does not match the required ones (${expectedLength}).`
	  );
	  if (args.length === 0) {
	    return msg
	  }
	  return format(msg, ...args)
	}
	function E(code, message, Base) {
	  if (!Base) {
	    Base = Error;
	  }
	  class NodeError extends Base {
	    constructor(...args) {
	      super(getMessage(code, message, args));
	    }
	    toString() {
	      return `${this.name} [${code}]: ${this.message}`
	    }
	  }
	  Object.defineProperties(NodeError.prototype, {
	    name: {
	      value: Base.name,
	      writable: true,
	      enumerable: false,
	      configurable: true
	    },
	    toString: {
	      value() {
	        return `${this.name} [${code}]: ${this.message}`
	      },
	      writable: true,
	      enumerable: false,
	      configurable: true
	    }
	  });
	  NodeError.prototype.code = code;
	  NodeError.prototype[kIsNodeError] = true;
	  codes[code] = NodeError;
	}
	function hideStackFrames(fn) {
	  // We rename the functions that will be hidden to cut off the stacktrace
	  // at the outermost one
	  const hidden = nodeInternalPrefix + fn.name;
	  Object.defineProperty(fn, 'name', {
	    value: hidden
	  });
	  return fn
	}
	function aggregateTwoErrors(innerError, outerError) {
	  if (innerError && outerError && innerError !== outerError) {
	    if (Array.isArray(outerError.errors)) {
	      // If `outerError` is already an `AggregateError`.
	      outerError.errors.push(innerError);
	      return outerError
	    }
	    const err = new AggregateError([outerError, innerError], outerError.message);
	    err.code = outerError.code;
	    return err
	  }
	  return innerError || outerError
	}
	class AbortError extends Error {
	  constructor(message = 'The operation was aborted', options = undefined) {
	    if (options !== undefined && typeof options !== 'object') {
	      throw new codes.ERR_INVALID_ARG_TYPE('options', 'Object', options)
	    }
	    super(message, options);
	    this.code = 'ABORT_ERR';
	    this.name = 'AbortError';
	  }
	}
	E('ERR_ASSERTION', '%s', Error);
	E(
	  'ERR_INVALID_ARG_TYPE',
	  (name, expected, actual) => {
	    assert(typeof name === 'string', "'name' must be a string");
	    if (!Array.isArray(expected)) {
	      expected = [expected];
	    }
	    let msg = 'The ';
	    if (name.endsWith(' argument')) {
	      // For cases like 'first argument'
	      msg += `${name} `;
	    } else {
	      msg += `"${name}" ${name.includes('.') ? 'property' : 'argument'} `;
	    }
	    msg += 'must be ';
	    const types = [];
	    const instances = [];
	    const other = [];
	    for (const value of expected) {
	      assert(typeof value === 'string', 'All expected entries have to be of type string');
	      if (kTypes.includes(value)) {
	        types.push(value.toLowerCase());
	      } else if (classRegExp.test(value)) {
	        instances.push(value);
	      } else {
	        assert(value !== 'object', 'The value "object" should be written as "Object"');
	        other.push(value);
	      }
	    }

	    // Special handle `object` in case other instances are allowed to outline
	    // the differences between each other.
	    if (instances.length > 0) {
	      const pos = types.indexOf('object');
	      if (pos !== -1) {
	        types.splice(types, pos, 1);
	        instances.push('Object');
	      }
	    }
	    if (types.length > 0) {
	      switch (types.length) {
	        case 1:
	          msg += `of type ${types[0]}`;
	          break
	        case 2:
	          msg += `one of type ${types[0]} or ${types[1]}`;
	          break
	        default: {
	          const last = types.pop();
	          msg += `one of type ${types.join(', ')}, or ${last}`;
	        }
	      }
	      if (instances.length > 0 || other.length > 0) {
	        msg += ' or ';
	      }
	    }
	    if (instances.length > 0) {
	      switch (instances.length) {
	        case 1:
	          msg += `an instance of ${instances[0]}`;
	          break
	        case 2:
	          msg += `an instance of ${instances[0]} or ${instances[1]}`;
	          break
	        default: {
	          const last = instances.pop();
	          msg += `an instance of ${instances.join(', ')}, or ${last}`;
	        }
	      }
	      if (other.length > 0) {
	        msg += ' or ';
	      }
	    }
	    switch (other.length) {
	      case 0:
	        break
	      case 1:
	        if (other[0].toLowerCase() !== other[0]) {
	          msg += 'an ';
	        }
	        msg += `${other[0]}`;
	        break
	      case 2:
	        msg += `one of ${other[0]} or ${other[1]}`;
	        break
	      default: {
	        const last = other.pop();
	        msg += `one of ${other.join(', ')}, or ${last}`;
	      }
	    }
	    if (actual == null) {
	      msg += `. Received ${actual}`;
	    } else if (typeof actual === 'function' && actual.name) {
	      msg += `. Received function ${actual.name}`;
	    } else if (typeof actual === 'object') {
	      var _actual$constructor;
	      if (
	        (_actual$constructor = actual.constructor) !== null &&
	        _actual$constructor !== undefined &&
	        _actual$constructor.name
	      ) {
	        msg += `. Received an instance of ${actual.constructor.name}`;
	      } else {
	        const inspected = inspect(actual, {
	          depth: -1
	        });
	        msg += `. Received ${inspected}`;
	      }
	    } else {
	      let inspected = inspect(actual, {
	        colors: false
	      });
	      if (inspected.length > 25) {
	        inspected = `${inspected.slice(0, 25)}...`;
	      }
	      msg += `. Received type ${typeof actual} (${inspected})`;
	    }
	    return msg
	  },
	  TypeError
	);
	E(
	  'ERR_INVALID_ARG_VALUE',
	  (name, value, reason = 'is invalid') => {
	    let inspected = inspect(value);
	    if (inspected.length > 128) {
	      inspected = inspected.slice(0, 128) + '...';
	    }
	    const type = name.includes('.') ? 'property' : 'argument';
	    return `The ${type} '${name}' ${reason}. Received ${inspected}`
	  },
	  TypeError
	);
	E(
	  'ERR_INVALID_RETURN_VALUE',
	  (input, name, value) => {
	    var _value$constructor;
	    const type =
	      value !== null &&
	      value !== undefined &&
	      (_value$constructor = value.constructor) !== null &&
	      _value$constructor !== undefined &&
	      _value$constructor.name
	        ? `instance of ${value.constructor.name}`
	        : `type ${typeof value}`;
	    return `Expected ${input} to be returned from the "${name}"` + ` function but got ${type}.`
	  },
	  TypeError
	);
	E(
	  'ERR_MISSING_ARGS',
	  (...args) => {
	    assert(args.length > 0, 'At least one arg needs to be specified');
	    let msg;
	    const len = args.length;
	    args = (Array.isArray(args) ? args : [args]).map((a) => `"${a}"`).join(' or ');
	    switch (len) {
	      case 1:
	        msg += `The ${args[0]} argument`;
	        break
	      case 2:
	        msg += `The ${args[0]} and ${args[1]} arguments`;
	        break
	      default:
	        {
	          const last = args.pop();
	          msg += `The ${args.join(', ')}, and ${last} arguments`;
	        }
	        break
	    }
	    return `${msg} must be specified`
	  },
	  TypeError
	);
	E(
	  'ERR_OUT_OF_RANGE',
	  (str, range, input) => {
	    assert(range, 'Missing "range" argument');
	    let received;
	    if (Number.isInteger(input) && Math.abs(input) > 2 ** 32) {
	      received = addNumericalSeparator(String(input));
	    } else if (typeof input === 'bigint') {
	      received = String(input);
	      if (input > 2n ** 32n || input < -(2n ** 32n)) {
	        received = addNumericalSeparator(received);
	      }
	      received += 'n';
	    } else {
	      received = inspect(input);
	    }
	    return `The value of "${str}" is out of range. It must be ${range}. Received ${received}`
	  },
	  RangeError
	);
	E('ERR_MULTIPLE_CALLBACK', 'Callback called multiple times', Error);
	E('ERR_METHOD_NOT_IMPLEMENTED', 'The %s method is not implemented', Error);
	E('ERR_STREAM_ALREADY_FINISHED', 'Cannot call %s after a stream was finished', Error);
	E('ERR_STREAM_CANNOT_PIPE', 'Cannot pipe, not readable', Error);
	E('ERR_STREAM_DESTROYED', 'Cannot call %s after a stream was destroyed', Error);
	E('ERR_STREAM_NULL_VALUES', 'May not write null values to stream', TypeError);
	E('ERR_STREAM_PREMATURE_CLOSE', 'Premature close', Error);
	E('ERR_STREAM_PUSH_AFTER_EOF', 'stream.push() after EOF', Error);
	E('ERR_STREAM_UNSHIFT_AFTER_END_EVENT', 'stream.unshift() after end event', Error);
	E('ERR_STREAM_WRITE_AFTER_END', 'write after end', Error);
	E('ERR_UNKNOWN_ENCODING', 'Unknown encoding: %s', TypeError);
	errors = {
	  AbortError,
	  aggregateTwoErrors: hideStackFrames(aggregateTwoErrors),
	  hideStackFrames,
	  codes
	};
	return errors;
}

/* eslint jsdoc/require-jsdoc: "error" */

var validators;
var hasRequiredValidators;

function requireValidators () {
	if (hasRequiredValidators) return validators;
	hasRequiredValidators = 1;

	const {
	  ArrayIsArray,
	  ArrayPrototypeIncludes,
	  ArrayPrototypeJoin,
	  ArrayPrototypeMap,
	  NumberIsInteger,
	  NumberIsNaN,
	  NumberMAX_SAFE_INTEGER,
	  NumberMIN_SAFE_INTEGER,
	  NumberParseInt,
	  ObjectPrototypeHasOwnProperty,
	  RegExpPrototypeExec,
	  String,
	  StringPrototypeToUpperCase,
	  StringPrototypeTrim
	} = requirePrimordials();
	const {
	  hideStackFrames,
	  codes: { ERR_SOCKET_BAD_PORT, ERR_INVALID_ARG_TYPE, ERR_INVALID_ARG_VALUE, ERR_OUT_OF_RANGE, ERR_UNKNOWN_SIGNAL }
	} = requireErrors();
	const { normalizeEncoding } = requireUtil();
	const { isAsyncFunction, isArrayBufferView } = requireUtil().types;
	const signals = {};

	/**
	 * @param {*} value
	 * @returns {boolean}
	 */
	function isInt32(value) {
	  return value === (value | 0)
	}

	/**
	 * @param {*} value
	 * @returns {boolean}
	 */
	function isUint32(value) {
	  return value === value >>> 0
	}
	const octalReg = /^[0-7]+$/;
	const modeDesc = 'must be a 32-bit unsigned integer or an octal string';

	/**
	 * Parse and validate values that will be converted into mode_t (the S_*
	 * constants). Only valid numbers and octal strings are allowed. They could be
	 * converted to 32-bit unsigned integers or non-negative signed integers in the
	 * C++ land, but any value higher than 0o777 will result in platform-specific
	 * behaviors.
	 *
	 * @param {*} value Values to be validated
	 * @param {string} name Name of the argument
	 * @param {number} [def] If specified, will be returned for invalid values
	 * @returns {number}
	 */
	function parseFileMode(value, name, def) {
	  if (typeof value === 'undefined') {
	    value = def;
	  }
	  if (typeof value === 'string') {
	    if (RegExpPrototypeExec(octalReg, value) === null) {
	      throw new ERR_INVALID_ARG_VALUE(name, value, modeDesc)
	    }
	    value = NumberParseInt(value, 8);
	  }
	  validateUint32(value, name);
	  return value
	}

	/**
	 * @callback validateInteger
	 * @param {*} value
	 * @param {string} name
	 * @param {number} [min]
	 * @param {number} [max]
	 * @returns {asserts value is number}
	 */

	/** @type {validateInteger} */
	const validateInteger = hideStackFrames((value, name, min = NumberMIN_SAFE_INTEGER, max = NumberMAX_SAFE_INTEGER) => {
	  if (typeof value !== 'number') throw new ERR_INVALID_ARG_TYPE(name, 'number', value)
	  if (!NumberIsInteger(value)) throw new ERR_OUT_OF_RANGE(name, 'an integer', value)
	  if (value < min || value > max) throw new ERR_OUT_OF_RANGE(name, `>= ${min} && <= ${max}`, value)
	});

	/**
	 * @callback validateInt32
	 * @param {*} value
	 * @param {string} name
	 * @param {number} [min]
	 * @param {number} [max]
	 * @returns {asserts value is number}
	 */

	/** @type {validateInt32} */
	const validateInt32 = hideStackFrames((value, name, min = -2147483648, max = 2147483647) => {
	  // The defaults for min and max correspond to the limits of 32-bit integers.
	  if (typeof value !== 'number') {
	    throw new ERR_INVALID_ARG_TYPE(name, 'number', value)
	  }
	  if (!NumberIsInteger(value)) {
	    throw new ERR_OUT_OF_RANGE(name, 'an integer', value)
	  }
	  if (value < min || value > max) {
	    throw new ERR_OUT_OF_RANGE(name, `>= ${min} && <= ${max}`, value)
	  }
	});

	/**
	 * @callback validateUint32
	 * @param {*} value
	 * @param {string} name
	 * @param {number|boolean} [positive=false]
	 * @returns {asserts value is number}
	 */

	/** @type {validateUint32} */
	const validateUint32 = hideStackFrames((value, name, positive = false) => {
	  if (typeof value !== 'number') {
	    throw new ERR_INVALID_ARG_TYPE(name, 'number', value)
	  }
	  if (!NumberIsInteger(value)) {
	    throw new ERR_OUT_OF_RANGE(name, 'an integer', value)
	  }
	  const min = positive ? 1 : 0;
	  // 2 ** 32 === 4294967296
	  const max = 4294967295;
	  if (value < min || value > max) {
	    throw new ERR_OUT_OF_RANGE(name, `>= ${min} && <= ${max}`, value)
	  }
	});

	/**
	 * @callback validateString
	 * @param {*} value
	 * @param {string} name
	 * @returns {asserts value is string}
	 */

	/** @type {validateString} */
	function validateString(value, name) {
	  if (typeof value !== 'string') throw new ERR_INVALID_ARG_TYPE(name, 'string', value)
	}

	/**
	 * @callback validateNumber
	 * @param {*} value
	 * @param {string} name
	 * @param {number} [min]
	 * @param {number} [max]
	 * @returns {asserts value is number}
	 */

	/** @type {validateNumber} */
	function validateNumber(value, name, min = undefined, max) {
	  if (typeof value !== 'number') throw new ERR_INVALID_ARG_TYPE(name, 'number', value)
	  if (
	    (min != null && value < min) ||
	    (max != null && value > max) ||
	    ((min != null || max != null) && NumberIsNaN(value))
	  ) {
	    throw new ERR_OUT_OF_RANGE(
	      name,
	      `${min != null ? `>= ${min}` : ''}${min != null && max != null ? ' && ' : ''}${max != null ? `<= ${max}` : ''}`,
	      value
	    )
	  }
	}

	/**
	 * @callback validateOneOf
	 * @template T
	 * @param {T} value
	 * @param {string} name
	 * @param {T[]} oneOf
	 */

	/** @type {validateOneOf} */
	const validateOneOf = hideStackFrames((value, name, oneOf) => {
	  if (!ArrayPrototypeIncludes(oneOf, value)) {
	    const allowed = ArrayPrototypeJoin(
	      ArrayPrototypeMap(oneOf, (v) => (typeof v === 'string' ? `'${v}'` : String(v))),
	      ', '
	    );
	    const reason = 'must be one of: ' + allowed;
	    throw new ERR_INVALID_ARG_VALUE(name, value, reason)
	  }
	});

	/**
	 * @callback validateBoolean
	 * @param {*} value
	 * @param {string} name
	 * @returns {asserts value is boolean}
	 */

	/** @type {validateBoolean} */
	function validateBoolean(value, name) {
	  if (typeof value !== 'boolean') throw new ERR_INVALID_ARG_TYPE(name, 'boolean', value)
	}

	/**
	 * @param {any} options
	 * @param {string} key
	 * @param {boolean} defaultValue
	 * @returns {boolean}
	 */
	function getOwnPropertyValueOrDefault(options, key, defaultValue) {
	  return options == null || !ObjectPrototypeHasOwnProperty(options, key) ? defaultValue : options[key]
	}

	/**
	 * @callback validateObject
	 * @param {*} value
	 * @param {string} name
	 * @param {{
	 *   allowArray?: boolean,
	 *   allowFunction?: boolean,
	 *   nullable?: boolean
	 * }} [options]
	 */

	/** @type {validateObject} */
	const validateObject = hideStackFrames((value, name, options = null) => {
	  const allowArray = getOwnPropertyValueOrDefault(options, 'allowArray', false);
	  const allowFunction = getOwnPropertyValueOrDefault(options, 'allowFunction', false);
	  const nullable = getOwnPropertyValueOrDefault(options, 'nullable', false);
	  if (
	    (!nullable && value === null) ||
	    (!allowArray && ArrayIsArray(value)) ||
	    (typeof value !== 'object' && (!allowFunction || typeof value !== 'function'))
	  ) {
	    throw new ERR_INVALID_ARG_TYPE(name, 'Object', value)
	  }
	});

	/**
	 * @callback validateDictionary - We are using the Web IDL Standard definition
	 *                                of "dictionary" here, which means any value
	 *                                whose Type is either Undefined, Null, or
	 *                                Object (which includes functions).
	 * @param {*} value
	 * @param {string} name
	 * @see https://webidl.spec.whatwg.org/#es-dictionary
	 * @see https://tc39.es/ecma262/#table-typeof-operator-results
	 */

	/** @type {validateDictionary} */
	const validateDictionary = hideStackFrames((value, name) => {
	  if (value != null && typeof value !== 'object' && typeof value !== 'function') {
	    throw new ERR_INVALID_ARG_TYPE(name, 'a dictionary', value)
	  }
	});

	/**
	 * @callback validateArray
	 * @param {*} value
	 * @param {string} name
	 * @param {number} [minLength]
	 * @returns {asserts value is any[]}
	 */

	/** @type {validateArray} */
	const validateArray = hideStackFrames((value, name, minLength = 0) => {
	  if (!ArrayIsArray(value)) {
	    throw new ERR_INVALID_ARG_TYPE(name, 'Array', value)
	  }
	  if (value.length < minLength) {
	    const reason = `must be longer than ${minLength}`;
	    throw new ERR_INVALID_ARG_VALUE(name, value, reason)
	  }
	});

	/**
	 * @callback validateStringArray
	 * @param {*} value
	 * @param {string} name
	 * @returns {asserts value is string[]}
	 */

	/** @type {validateStringArray} */
	function validateStringArray(value, name) {
	  validateArray(value, name);
	  for (let i = 0; i < value.length; i++) {
	    validateString(value[i], `${name}[${i}]`);
	  }
	}

	/**
	 * @callback validateBooleanArray
	 * @param {*} value
	 * @param {string} name
	 * @returns {asserts value is boolean[]}
	 */

	/** @type {validateBooleanArray} */
	function validateBooleanArray(value, name) {
	  validateArray(value, name);
	  for (let i = 0; i < value.length; i++) {
	    validateBoolean(value[i], `${name}[${i}]`);
	  }
	}

	/**
	 * @param {*} signal
	 * @param {string} [name='signal']
	 * @returns {asserts signal is keyof signals}
	 */
	function validateSignalName(signal, name = 'signal') {
	  validateString(signal, name);
	  if (signals[signal] === undefined) {
	    if (signals[StringPrototypeToUpperCase(signal)] !== undefined) {
	      throw new ERR_UNKNOWN_SIGNAL(signal + ' (signals must use all capital letters)')
	    }
	    throw new ERR_UNKNOWN_SIGNAL(signal)
	  }
	}

	/**
	 * @callback validateBuffer
	 * @param {*} buffer
	 * @param {string} [name='buffer']
	 * @returns {asserts buffer is ArrayBufferView}
	 */

	/** @type {validateBuffer} */
	const validateBuffer = hideStackFrames((buffer, name = 'buffer') => {
	  if (!isArrayBufferView(buffer)) {
	    throw new ERR_INVALID_ARG_TYPE(name, ['Buffer', 'TypedArray', 'DataView'], buffer)
	  }
	});

	/**
	 * @param {string} data
	 * @param {string} encoding
	 */
	function validateEncoding(data, encoding) {
	  const normalizedEncoding = normalizeEncoding(encoding);
	  const length = data.length;
	  if (normalizedEncoding === 'hex' && length % 2 !== 0) {
	    throw new ERR_INVALID_ARG_VALUE('encoding', encoding, `is invalid for data of length ${length}`)
	  }
	}

	/**
	 * Check that the port number is not NaN when coerced to a number,
	 * is an integer and that it falls within the legal range of port numbers.
	 * @param {*} port
	 * @param {string} [name='Port']
	 * @param {boolean} [allowZero=true]
	 * @returns {number}
	 */
	function validatePort(port, name = 'Port', allowZero = true) {
	  if (
	    (typeof port !== 'number' && typeof port !== 'string') ||
	    (typeof port === 'string' && StringPrototypeTrim(port).length === 0) ||
	    +port !== +port >>> 0 ||
	    port > 0xffff ||
	    (port === 0 && !allowZero)
	  ) {
	    throw new ERR_SOCKET_BAD_PORT(name, port, allowZero)
	  }
	  return port | 0
	}

	/**
	 * @callback validateAbortSignal
	 * @param {*} signal
	 * @param {string} name
	 */

	/** @type {validateAbortSignal} */
	const validateAbortSignal = hideStackFrames((signal, name) => {
	  if (signal !== undefined && (signal === null || typeof signal !== 'object' || !('aborted' in signal))) {
	    throw new ERR_INVALID_ARG_TYPE(name, 'AbortSignal', signal)
	  }
	});

	/**
	 * @callback validateFunction
	 * @param {*} value
	 * @param {string} name
	 * @returns {asserts value is Function}
	 */

	/** @type {validateFunction} */
	const validateFunction = hideStackFrames((value, name) => {
	  if (typeof value !== 'function') throw new ERR_INVALID_ARG_TYPE(name, 'Function', value)
	});

	/**
	 * @callback validatePlainFunction
	 * @param {*} value
	 * @param {string} name
	 * @returns {asserts value is Function}
	 */

	/** @type {validatePlainFunction} */
	const validatePlainFunction = hideStackFrames((value, name) => {
	  if (typeof value !== 'function' || isAsyncFunction(value)) throw new ERR_INVALID_ARG_TYPE(name, 'Function', value)
	});

	/**
	 * @callback validateUndefined
	 * @param {*} value
	 * @param {string} name
	 * @returns {asserts value is undefined}
	 */

	/** @type {validateUndefined} */
	const validateUndefined = hideStackFrames((value, name) => {
	  if (value !== undefined) throw new ERR_INVALID_ARG_TYPE(name, 'undefined', value)
	});

	/**
	 * @template T
	 * @param {T} value
	 * @param {string} name
	 * @param {T[]} union
	 */
	function validateUnion(value, name, union) {
	  if (!ArrayPrototypeIncludes(union, value)) {
	    throw new ERR_INVALID_ARG_TYPE(name, `('${ArrayPrototypeJoin(union, '|')}')`, value)
	  }
	}

	/*
	  The rules for the Link header field are described here:
	  https://www.rfc-editor.org/rfc/rfc8288.html#section-3

	  This regex validates any string surrounded by angle brackets
	  (not necessarily a valid URI reference) followed by zero or more
	  link-params separated by semicolons.
	*/
	const linkValueRegExp = /^(?:<[^>]*>)(?:\s*;\s*[^;"\s]+(?:=(")?[^;"\s]*\1)?)*$/;

	/**
	 * @param {any} value
	 * @param {string} name
	 */
	function validateLinkHeaderFormat(value, name) {
	  if (typeof value === 'undefined' || !RegExpPrototypeExec(linkValueRegExp, value)) {
	    throw new ERR_INVALID_ARG_VALUE(
	      name,
	      value,
	      'must be an array or string of format "</styles.css>; rel=preload; as=style"'
	    )
	  }
	}

	/**
	 * @param {any} hints
	 * @return {string}
	 */
	function validateLinkHeaderValue(hints) {
	  if (typeof hints === 'string') {
	    validateLinkHeaderFormat(hints, 'hints');
	    return hints
	  } else if (ArrayIsArray(hints)) {
	    const hintsLength = hints.length;
	    let result = '';
	    if (hintsLength === 0) {
	      return result
	    }
	    for (let i = 0; i < hintsLength; i++) {
	      const link = hints[i];
	      validateLinkHeaderFormat(link, 'hints');
	      result += link;
	      if (i !== hintsLength - 1) {
	        result += ', ';
	      }
	    }
	    return result
	  }
	  throw new ERR_INVALID_ARG_VALUE(
	    'hints',
	    hints,
	    'must be an array or string of format "</styles.css>; rel=preload; as=style"'
	  )
	}
	validators = {
	  isInt32,
	  isUint32,
	  parseFileMode,
	  validateArray,
	  validateStringArray,
	  validateBooleanArray,
	  validateBoolean,
	  validateBuffer,
	  validateDictionary,
	  validateEncoding,
	  validateFunction,
	  validateInt32,
	  validateInteger,
	  validateNumber,
	  validateObject,
	  validateOneOf,
	  validatePlainFunction,
	  validatePort,
	  validateSignalName,
	  validateString,
	  validateUint32,
	  validateUndefined,
	  validateUnion,
	  validateAbortSignal,
	  validateLinkHeaderValue
	};
	return validators;
}

var endOfStream = {exports: {}};

var process$1;
var hasRequiredProcess;

function requireProcess () {
	if (hasRequiredProcess) return process$1;
	hasRequiredProcess = 1;
	// for now just expose the builtin process global from node.js
	process$1 = commonjsGlobal.process;
	return process$1;
}

var utils;
var hasRequiredUtils;

function requireUtils () {
	if (hasRequiredUtils) return utils;
	hasRequiredUtils = 1;

	const { Symbol, SymbolAsyncIterator, SymbolIterator, SymbolFor } = requirePrimordials();
	const kDestroyed = Symbol('kDestroyed');
	const kIsErrored = Symbol('kIsErrored');
	const kIsReadable = Symbol('kIsReadable');
	const kIsDisturbed = Symbol('kIsDisturbed');
	const kIsClosedPromise = SymbolFor('nodejs.webstream.isClosedPromise');
	const kControllerErrorFunction = SymbolFor('nodejs.webstream.controllerErrorFunction');
	function isReadableNodeStream(obj, strict = false) {
	  var _obj$_readableState;
	  return !!(
	    (
	      obj &&
	      typeof obj.pipe === 'function' &&
	      typeof obj.on === 'function' &&
	      (!strict || (typeof obj.pause === 'function' && typeof obj.resume === 'function')) &&
	      (!obj._writableState ||
	        ((_obj$_readableState = obj._readableState) === null || _obj$_readableState === undefined
	          ? undefined
	          : _obj$_readableState.readable) !== false) &&
	      // Duplex
	      (!obj._writableState || obj._readableState)
	    ) // Writable has .pipe.
	  )
	}

	function isWritableNodeStream(obj) {
	  var _obj$_writableState;
	  return !!(
	    (
	      obj &&
	      typeof obj.write === 'function' &&
	      typeof obj.on === 'function' &&
	      (!obj._readableState ||
	        ((_obj$_writableState = obj._writableState) === null || _obj$_writableState === undefined
	          ? undefined
	          : _obj$_writableState.writable) !== false)
	    ) // Duplex
	  )
	}

	function isDuplexNodeStream(obj) {
	  return !!(
	    obj &&
	    typeof obj.pipe === 'function' &&
	    obj._readableState &&
	    typeof obj.on === 'function' &&
	    typeof obj.write === 'function'
	  )
	}
	function isNodeStream(obj) {
	  return (
	    obj &&
	    (obj._readableState ||
	      obj._writableState ||
	      (typeof obj.write === 'function' && typeof obj.on === 'function') ||
	      (typeof obj.pipe === 'function' && typeof obj.on === 'function'))
	  )
	}
	function isReadableStream(obj) {
	  return !!(
	    obj &&
	    !isNodeStream(obj) &&
	    typeof obj.pipeThrough === 'function' &&
	    typeof obj.getReader === 'function' &&
	    typeof obj.cancel === 'function'
	  )
	}
	function isWritableStream(obj) {
	  return !!(obj && !isNodeStream(obj) && typeof obj.getWriter === 'function' && typeof obj.abort === 'function')
	}
	function isTransformStream(obj) {
	  return !!(obj && !isNodeStream(obj) && typeof obj.readable === 'object' && typeof obj.writable === 'object')
	}
	function isWebStream(obj) {
	  return isReadableStream(obj) || isWritableStream(obj) || isTransformStream(obj)
	}
	function isIterable(obj, isAsync) {
	  if (obj == null) return false
	  if (isAsync === true) return typeof obj[SymbolAsyncIterator] === 'function'
	  if (isAsync === false) return typeof obj[SymbolIterator] === 'function'
	  return typeof obj[SymbolAsyncIterator] === 'function' || typeof obj[SymbolIterator] === 'function'
	}
	function isDestroyed(stream) {
	  if (!isNodeStream(stream)) return null
	  const wState = stream._writableState;
	  const rState = stream._readableState;
	  const state = wState || rState;
	  return !!(stream.destroyed || stream[kDestroyed] || (state !== null && state !== undefined && state.destroyed))
	}

	// Have been end():d.
	function isWritableEnded(stream) {
	  if (!isWritableNodeStream(stream)) return null
	  if (stream.writableEnded === true) return true
	  const wState = stream._writableState;
	  if (wState !== null && wState !== undefined && wState.errored) return false
	  if (typeof (wState === null || wState === undefined ? undefined : wState.ended) !== 'boolean') return null
	  return wState.ended
	}

	// Have emitted 'finish'.
	function isWritableFinished(stream, strict) {
	  if (!isWritableNodeStream(stream)) return null
	  if (stream.writableFinished === true) return true
	  const wState = stream._writableState;
	  if (wState !== null && wState !== undefined && wState.errored) return false
	  if (typeof (wState === null || wState === undefined ? undefined : wState.finished) !== 'boolean') return null
	  return !!(wState.finished || (strict === false && wState.ended === true && wState.length === 0))
	}

	// Have been push(null):d.
	function isReadableEnded(stream) {
	  if (!isReadableNodeStream(stream)) return null
	  if (stream.readableEnded === true) return true
	  const rState = stream._readableState;
	  if (!rState || rState.errored) return false
	  if (typeof (rState === null || rState === undefined ? undefined : rState.ended) !== 'boolean') return null
	  return rState.ended
	}

	// Have emitted 'end'.
	function isReadableFinished(stream, strict) {
	  if (!isReadableNodeStream(stream)) return null
	  const rState = stream._readableState;
	  if (rState !== null && rState !== undefined && rState.errored) return false
	  if (typeof (rState === null || rState === undefined ? undefined : rState.endEmitted) !== 'boolean') return null
	  return !!(rState.endEmitted || (strict === false && rState.ended === true && rState.length === 0))
	}
	function isReadable(stream) {
	  if (stream && stream[kIsReadable] != null) return stream[kIsReadable]
	  if (typeof (stream === null || stream === undefined ? undefined : stream.readable) !== 'boolean') return null
	  if (isDestroyed(stream)) return false
	  return isReadableNodeStream(stream) && stream.readable && !isReadableFinished(stream)
	}
	function isWritable(stream) {
	  if (typeof (stream === null || stream === undefined ? undefined : stream.writable) !== 'boolean') return null
	  if (isDestroyed(stream)) return false
	  return isWritableNodeStream(stream) && stream.writable && !isWritableEnded(stream)
	}
	function isFinished(stream, opts) {
	  if (!isNodeStream(stream)) {
	    return null
	  }
	  if (isDestroyed(stream)) {
	    return true
	  }
	  if ((opts === null || opts === undefined ? undefined : opts.readable) !== false && isReadable(stream)) {
	    return false
	  }
	  if ((opts === null || opts === undefined ? undefined : opts.writable) !== false && isWritable(stream)) {
	    return false
	  }
	  return true
	}
	function isWritableErrored(stream) {
	  var _stream$_writableStat, _stream$_writableStat2;
	  if (!isNodeStream(stream)) {
	    return null
	  }
	  if (stream.writableErrored) {
	    return stream.writableErrored
	  }
	  return (_stream$_writableStat =
	    (_stream$_writableStat2 = stream._writableState) === null || _stream$_writableStat2 === undefined
	      ? undefined
	      : _stream$_writableStat2.errored) !== null && _stream$_writableStat !== undefined
	    ? _stream$_writableStat
	    : null
	}
	function isReadableErrored(stream) {
	  var _stream$_readableStat, _stream$_readableStat2;
	  if (!isNodeStream(stream)) {
	    return null
	  }
	  if (stream.readableErrored) {
	    return stream.readableErrored
	  }
	  return (_stream$_readableStat =
	    (_stream$_readableStat2 = stream._readableState) === null || _stream$_readableStat2 === undefined
	      ? undefined
	      : _stream$_readableStat2.errored) !== null && _stream$_readableStat !== undefined
	    ? _stream$_readableStat
	    : null
	}
	function isClosed(stream) {
	  if (!isNodeStream(stream)) {
	    return null
	  }
	  if (typeof stream.closed === 'boolean') {
	    return stream.closed
	  }
	  const wState = stream._writableState;
	  const rState = stream._readableState;
	  if (
	    typeof (wState === null || wState === undefined ? undefined : wState.closed) === 'boolean' ||
	    typeof (rState === null || rState === undefined ? undefined : rState.closed) === 'boolean'
	  ) {
	    return (
	      (wState === null || wState === undefined ? undefined : wState.closed) ||
	      (rState === null || rState === undefined ? undefined : rState.closed)
	    )
	  }
	  if (typeof stream._closed === 'boolean' && isOutgoingMessage(stream)) {
	    return stream._closed
	  }
	  return null
	}
	function isOutgoingMessage(stream) {
	  return (
	    typeof stream._closed === 'boolean' &&
	    typeof stream._defaultKeepAlive === 'boolean' &&
	    typeof stream._removedConnection === 'boolean' &&
	    typeof stream._removedContLen === 'boolean'
	  )
	}
	function isServerResponse(stream) {
	  return typeof stream._sent100 === 'boolean' && isOutgoingMessage(stream)
	}
	function isServerRequest(stream) {
	  var _stream$req;
	  return (
	    typeof stream._consuming === 'boolean' &&
	    typeof stream._dumped === 'boolean' &&
	    ((_stream$req = stream.req) === null || _stream$req === undefined ? undefined : _stream$req.upgradeOrConnect) ===
	      undefined
	  )
	}
	function willEmitClose(stream) {
	  if (!isNodeStream(stream)) return null
	  const wState = stream._writableState;
	  const rState = stream._readableState;
	  const state = wState || rState;
	  return (
	    (!state && isServerResponse(stream)) || !!(state && state.autoDestroy && state.emitClose && state.closed === false)
	  )
	}
	function isDisturbed(stream) {
	  var _stream$kIsDisturbed;
	  return !!(
	    stream &&
	    ((_stream$kIsDisturbed = stream[kIsDisturbed]) !== null && _stream$kIsDisturbed !== undefined
	      ? _stream$kIsDisturbed
	      : stream.readableDidRead || stream.readableAborted)
	  )
	}
	function isErrored(stream) {
	  var _ref,
	    _ref2,
	    _ref3,
	    _ref4,
	    _ref5,
	    _stream$kIsErrored,
	    _stream$_readableStat3,
	    _stream$_writableStat3,
	    _stream$_readableStat4,
	    _stream$_writableStat4;
	  return !!(
	    stream &&
	    ((_ref =
	      (_ref2 =
	        (_ref3 =
	          (_ref4 =
	            (_ref5 =
	              (_stream$kIsErrored = stream[kIsErrored]) !== null && _stream$kIsErrored !== undefined
	                ? _stream$kIsErrored
	                : stream.readableErrored) !== null && _ref5 !== undefined
	              ? _ref5
	              : stream.writableErrored) !== null && _ref4 !== undefined
	            ? _ref4
	            : (_stream$_readableStat3 = stream._readableState) === null || _stream$_readableStat3 === undefined
	            ? undefined
	            : _stream$_readableStat3.errorEmitted) !== null && _ref3 !== undefined
	          ? _ref3
	          : (_stream$_writableStat3 = stream._writableState) === null || _stream$_writableStat3 === undefined
	          ? undefined
	          : _stream$_writableStat3.errorEmitted) !== null && _ref2 !== undefined
	        ? _ref2
	        : (_stream$_readableStat4 = stream._readableState) === null || _stream$_readableStat4 === undefined
	        ? undefined
	        : _stream$_readableStat4.errored) !== null && _ref !== undefined
	      ? _ref
	      : (_stream$_writableStat4 = stream._writableState) === null || _stream$_writableStat4 === undefined
	      ? undefined
	      : _stream$_writableStat4.errored)
	  )
	}
	utils = {
	  kDestroyed,
	  isDisturbed,
	  kIsDisturbed,
	  isErrored,
	  kIsErrored,
	  isReadable,
	  kIsReadable,
	  kIsClosedPromise,
	  kControllerErrorFunction,
	  isClosed,
	  isDestroyed,
	  isDuplexNodeStream,
	  isFinished,
	  isIterable,
	  isReadableNodeStream,
	  isReadableStream,
	  isReadableEnded,
	  isReadableFinished,
	  isReadableErrored,
	  isNodeStream,
	  isWebStream,
	  isWritable,
	  isWritableNodeStream,
	  isWritableStream,
	  isWritableEnded,
	  isWritableFinished,
	  isWritableErrored,
	  isServerRequest,
	  isServerResponse,
	  willEmitClose,
	  isTransformStream
	};
	return utils;
}

/* replacement start */

var hasRequiredEndOfStream;

function requireEndOfStream () {
	if (hasRequiredEndOfStream) return endOfStream.exports;
	hasRequiredEndOfStream = 1;
	const process = requireProcess()

	/* replacement end */
	// Ported from https://github.com/mafintosh/end-of-stream with
	// permission from the author, Mathias Buus (@mafintosh).

	;	const { AbortError, codes } = requireErrors();
	const { ERR_INVALID_ARG_TYPE, ERR_STREAM_PREMATURE_CLOSE } = codes;
	const { kEmptyObject, once } = requireUtil();
	const { validateAbortSignal, validateFunction, validateObject, validateBoolean } = requireValidators();
	const { Promise, PromisePrototypeThen } = requirePrimordials();
	const {
	  isClosed,
	  isReadable,
	  isReadableNodeStream,
	  isReadableStream,
	  isReadableFinished,
	  isReadableErrored,
	  isWritable,
	  isWritableNodeStream,
	  isWritableStream,
	  isWritableFinished,
	  isWritableErrored,
	  isNodeStream,
	  willEmitClose: _willEmitClose,
	  kIsClosedPromise
	} = requireUtils();
	function isRequest(stream) {
	  return stream.setHeader && typeof stream.abort === 'function'
	}
	const nop = () => {};
	function eos(stream, options, callback) {
	  var _options$readable, _options$writable;
	  if (arguments.length === 2) {
	    callback = options;
	    options = kEmptyObject;
	  } else if (options == null) {
	    options = kEmptyObject;
	  } else {
	    validateObject(options, 'options');
	  }
	  validateFunction(callback, 'callback');
	  validateAbortSignal(options.signal, 'options.signal');
	  callback = once(callback);
	  if (isReadableStream(stream) || isWritableStream(stream)) {
	    return eosWeb(stream, options, callback)
	  }
	  if (!isNodeStream(stream)) {
	    throw new ERR_INVALID_ARG_TYPE('stream', ['ReadableStream', 'WritableStream', 'Stream'], stream)
	  }
	  const readable =
	    (_options$readable = options.readable) !== null && _options$readable !== undefined
	      ? _options$readable
	      : isReadableNodeStream(stream);
	  const writable =
	    (_options$writable = options.writable) !== null && _options$writable !== undefined
	      ? _options$writable
	      : isWritableNodeStream(stream);
	  const wState = stream._writableState;
	  const rState = stream._readableState;
	  const onlegacyfinish = () => {
	    if (!stream.writable) {
	      onfinish();
	    }
	  };

	  // TODO (ronag): Improve soft detection to include core modules and
	  // common ecosystem modules that do properly emit 'close' but fail
	  // this generic check.
	  let willEmitClose =
	    _willEmitClose(stream) && isReadableNodeStream(stream) === readable && isWritableNodeStream(stream) === writable;
	  let writableFinished = isWritableFinished(stream, false);
	  const onfinish = () => {
	    writableFinished = true;
	    // Stream should not be destroyed here. If it is that
	    // means that user space is doing something differently and
	    // we cannot trust willEmitClose.
	    if (stream.destroyed) {
	      willEmitClose = false;
	    }
	    if (willEmitClose && (!stream.readable || readable)) {
	      return
	    }
	    if (!readable || readableFinished) {
	      callback.call(stream);
	    }
	  };
	  let readableFinished = isReadableFinished(stream, false);
	  const onend = () => {
	    readableFinished = true;
	    // Stream should not be destroyed here. If it is that
	    // means that user space is doing something differently and
	    // we cannot trust willEmitClose.
	    if (stream.destroyed) {
	      willEmitClose = false;
	    }
	    if (willEmitClose && (!stream.writable || writable)) {
	      return
	    }
	    if (!writable || writableFinished) {
	      callback.call(stream);
	    }
	  };
	  const onerror = (err) => {
	    callback.call(stream, err);
	  };
	  let closed = isClosed(stream);
	  const onclose = () => {
	    closed = true;
	    const errored = isWritableErrored(stream) || isReadableErrored(stream);
	    if (errored && typeof errored !== 'boolean') {
	      return callback.call(stream, errored)
	    }
	    if (readable && !readableFinished && isReadableNodeStream(stream, true)) {
	      if (!isReadableFinished(stream, false)) return callback.call(stream, new ERR_STREAM_PREMATURE_CLOSE())
	    }
	    if (writable && !writableFinished) {
	      if (!isWritableFinished(stream, false)) return callback.call(stream, new ERR_STREAM_PREMATURE_CLOSE())
	    }
	    callback.call(stream);
	  };
	  const onclosed = () => {
	    closed = true;
	    const errored = isWritableErrored(stream) || isReadableErrored(stream);
	    if (errored && typeof errored !== 'boolean') {
	      return callback.call(stream, errored)
	    }
	    callback.call(stream);
	  };
	  const onrequest = () => {
	    stream.req.on('finish', onfinish);
	  };
	  if (isRequest(stream)) {
	    stream.on('complete', onfinish);
	    if (!willEmitClose) {
	      stream.on('abort', onclose);
	    }
	    if (stream.req) {
	      onrequest();
	    } else {
	      stream.on('request', onrequest);
	    }
	  } else if (writable && !wState) {
	    // legacy streams
	    stream.on('end', onlegacyfinish);
	    stream.on('close', onlegacyfinish);
	  }

	  // Not all streams will emit 'close' after 'aborted'.
	  if (!willEmitClose && typeof stream.aborted === 'boolean') {
	    stream.on('aborted', onclose);
	  }
	  stream.on('end', onend);
	  stream.on('finish', onfinish);
	  if (options.error !== false) {
	    stream.on('error', onerror);
	  }
	  stream.on('close', onclose);
	  if (closed) {
	    process.nextTick(onclose);
	  } else if (
	    (wState !== null && wState !== undefined && wState.errorEmitted) ||
	    (rState !== null && rState !== undefined && rState.errorEmitted)
	  ) {
	    if (!willEmitClose) {
	      process.nextTick(onclosed);
	    }
	  } else if (
	    !readable &&
	    (!willEmitClose || isReadable(stream)) &&
	    (writableFinished || isWritable(stream) === false)
	  ) {
	    process.nextTick(onclosed);
	  } else if (
	    !writable &&
	    (!willEmitClose || isWritable(stream)) &&
	    (readableFinished || isReadable(stream) === false)
	  ) {
	    process.nextTick(onclosed);
	  } else if (rState && stream.req && stream.aborted) {
	    process.nextTick(onclosed);
	  }
	  const cleanup = () => {
	    callback = nop;
	    stream.removeListener('aborted', onclose);
	    stream.removeListener('complete', onfinish);
	    stream.removeListener('abort', onclose);
	    stream.removeListener('request', onrequest);
	    if (stream.req) stream.req.removeListener('finish', onfinish);
	    stream.removeListener('end', onlegacyfinish);
	    stream.removeListener('close', onlegacyfinish);
	    stream.removeListener('finish', onfinish);
	    stream.removeListener('end', onend);
	    stream.removeListener('error', onerror);
	    stream.removeListener('close', onclose);
	  };
	  if (options.signal && !closed) {
	    const abort = () => {
	      // Keep it because cleanup removes it.
	      const endCallback = callback;
	      cleanup();
	      endCallback.call(
	        stream,
	        new AbortError(undefined, {
	          cause: options.signal.reason
	        })
	      );
	    };
	    if (options.signal.aborted) {
	      process.nextTick(abort);
	    } else {
	      const originalCallback = callback;
	      callback = once((...args) => {
	        options.signal.removeEventListener('abort', abort);
	        originalCallback.apply(stream, args);
	      });
	      options.signal.addEventListener('abort', abort);
	    }
	  }
	  return cleanup
	}
	function eosWeb(stream, options, callback) {
	  let isAborted = false;
	  let abort = nop;
	  if (options.signal) {
	    abort = () => {
	      isAborted = true;
	      callback.call(
	        stream,
	        new AbortError(undefined, {
	          cause: options.signal.reason
	        })
	      );
	    };
	    if (options.signal.aborted) {
	      process.nextTick(abort);
	    } else {
	      const originalCallback = callback;
	      callback = once((...args) => {
	        options.signal.removeEventListener('abort', abort);
	        originalCallback.apply(stream, args);
	      });
	      options.signal.addEventListener('abort', abort);
	    }
	  }
	  const resolverFn = (...args) => {
	    if (!isAborted) {
	      process.nextTick(() => callback.apply(stream, args));
	    }
	  };
	  PromisePrototypeThen(stream[kIsClosedPromise].promise, resolverFn, resolverFn);
	  return nop
	}
	function finished(stream, opts) {
	  var _opts;
	  let autoCleanup = false;
	  if (opts === null) {
	    opts = kEmptyObject;
	  }
	  if ((_opts = opts) !== null && _opts !== undefined && _opts.cleanup) {
	    validateBoolean(opts.cleanup, 'cleanup');
	    autoCleanup = opts.cleanup;
	  }
	  return new Promise((resolve, reject) => {
	    const cleanup = eos(stream, opts, (err) => {
	      if (autoCleanup) {
	        cleanup();
	      }
	      if (err) {
	        reject(err);
	      } else {
	        resolve();
	      }
	    });
	  })
	}
	endOfStream.exports = eos;
	endOfStream.exports.finished = finished;
	return endOfStream.exports;
}

var destroy_1;
var hasRequiredDestroy;

function requireDestroy () {
	if (hasRequiredDestroy) return destroy_1;
	hasRequiredDestroy = 1;

	/* replacement start */

	const process = requireProcess();

	/* replacement end */

	const {
	  aggregateTwoErrors,
	  codes: { ERR_MULTIPLE_CALLBACK },
	  AbortError
	} = requireErrors();
	const { Symbol } = requirePrimordials();
	const { kDestroyed, isDestroyed, isFinished, isServerRequest } = requireUtils();
	const kDestroy = Symbol('kDestroy');
	const kConstruct = Symbol('kConstruct');
	function checkError(err, w, r) {
	  if (err) {
	    // Avoid V8 leak, https://github.com/nodejs/node/pull/34103#issuecomment-652002364
	    err.stack; // eslint-disable-line no-unused-expressions

	    if (w && !w.errored) {
	      w.errored = err;
	    }
	    if (r && !r.errored) {
	      r.errored = err;
	    }
	  }
	}

	// Backwards compat. cb() is undocumented and unused in core but
	// unfortunately might be used by modules.
	function destroy(err, cb) {
	  const r = this._readableState;
	  const w = this._writableState;
	  // With duplex streams we use the writable side for state.
	  const s = w || r;
	  if ((w !== null && w !== undefined && w.destroyed) || (r !== null && r !== undefined && r.destroyed)) {
	    if (typeof cb === 'function') {
	      cb();
	    }
	    return this
	  }

	  // We set destroyed to true before firing error callbacks in order
	  // to make it re-entrance safe in case destroy() is called within callbacks
	  checkError(err, w, r);
	  if (w) {
	    w.destroyed = true;
	  }
	  if (r) {
	    r.destroyed = true;
	  }

	  // If still constructing then defer calling _destroy.
	  if (!s.constructed) {
	    this.once(kDestroy, function (er) {
	      _destroy(this, aggregateTwoErrors(er, err), cb);
	    });
	  } else {
	    _destroy(this, err, cb);
	  }
	  return this
	}
	function _destroy(self, err, cb) {
	  let called = false;
	  function onDestroy(err) {
	    if (called) {
	      return
	    }
	    called = true;
	    const r = self._readableState;
	    const w = self._writableState;
	    checkError(err, w, r);
	    if (w) {
	      w.closed = true;
	    }
	    if (r) {
	      r.closed = true;
	    }
	    if (typeof cb === 'function') {
	      cb(err);
	    }
	    if (err) {
	      process.nextTick(emitErrorCloseNT, self, err);
	    } else {
	      process.nextTick(emitCloseNT, self);
	    }
	  }
	  try {
	    self._destroy(err || null, onDestroy);
	  } catch (err) {
	    onDestroy(err);
	  }
	}
	function emitErrorCloseNT(self, err) {
	  emitErrorNT(self, err);
	  emitCloseNT(self);
	}
	function emitCloseNT(self) {
	  const r = self._readableState;
	  const w = self._writableState;
	  if (w) {
	    w.closeEmitted = true;
	  }
	  if (r) {
	    r.closeEmitted = true;
	  }
	  if ((w !== null && w !== undefined && w.emitClose) || (r !== null && r !== undefined && r.emitClose)) {
	    self.emit('close');
	  }
	}
	function emitErrorNT(self, err) {
	  const r = self._readableState;
	  const w = self._writableState;
	  if ((w !== null && w !== undefined && w.errorEmitted) || (r !== null && r !== undefined && r.errorEmitted)) {
	    return
	  }
	  if (w) {
	    w.errorEmitted = true;
	  }
	  if (r) {
	    r.errorEmitted = true;
	  }
	  self.emit('error', err);
	}
	function undestroy() {
	  const r = this._readableState;
	  const w = this._writableState;
	  if (r) {
	    r.constructed = true;
	    r.closed = false;
	    r.closeEmitted = false;
	    r.destroyed = false;
	    r.errored = null;
	    r.errorEmitted = false;
	    r.reading = false;
	    r.ended = r.readable === false;
	    r.endEmitted = r.readable === false;
	  }
	  if (w) {
	    w.constructed = true;
	    w.destroyed = false;
	    w.closed = false;
	    w.closeEmitted = false;
	    w.errored = null;
	    w.errorEmitted = false;
	    w.finalCalled = false;
	    w.prefinished = false;
	    w.ended = w.writable === false;
	    w.ending = w.writable === false;
	    w.finished = w.writable === false;
	  }
	}
	function errorOrDestroy(stream, err, sync) {
	  // We have tests that rely on errors being emitted
	  // in the same tick, so changing this is semver major.
	  // For now when you opt-in to autoDestroy we allow
	  // the error to be emitted nextTick. In a future
	  // semver major update we should change the default to this.

	  const r = stream._readableState;
	  const w = stream._writableState;
	  if ((w !== null && w !== undefined && w.destroyed) || (r !== null && r !== undefined && r.destroyed)) {
	    return this
	  }
	  if ((r !== null && r !== undefined && r.autoDestroy) || (w !== null && w !== undefined && w.autoDestroy))
	    stream.destroy(err);
	  else if (err) {
	    // Avoid V8 leak, https://github.com/nodejs/node/pull/34103#issuecomment-652002364
	    err.stack; // eslint-disable-line no-unused-expressions

	    if (w && !w.errored) {
	      w.errored = err;
	    }
	    if (r && !r.errored) {
	      r.errored = err;
	    }
	    if (sync) {
	      process.nextTick(emitErrorNT, stream, err);
	    } else {
	      emitErrorNT(stream, err);
	    }
	  }
	}
	function construct(stream, cb) {
	  if (typeof stream._construct !== 'function') {
	    return
	  }
	  const r = stream._readableState;
	  const w = stream._writableState;
	  if (r) {
	    r.constructed = false;
	  }
	  if (w) {
	    w.constructed = false;
	  }
	  stream.once(kConstruct, cb);
	  if (stream.listenerCount(kConstruct) > 1) {
	    // Duplex
	    return
	  }
	  process.nextTick(constructNT, stream);
	}
	function constructNT(stream) {
	  let called = false;
	  function onConstruct(err) {
	    if (called) {
	      errorOrDestroy(stream, err !== null && err !== undefined ? err : new ERR_MULTIPLE_CALLBACK());
	      return
	    }
	    called = true;
	    const r = stream._readableState;
	    const w = stream._writableState;
	    const s = w || r;
	    if (r) {
	      r.constructed = true;
	    }
	    if (w) {
	      w.constructed = true;
	    }
	    if (s.destroyed) {
	      stream.emit(kDestroy, err);
	    } else if (err) {
	      errorOrDestroy(stream, err, true);
	    } else {
	      process.nextTick(emitConstructNT, stream);
	    }
	  }
	  try {
	    stream._construct((err) => {
	      process.nextTick(onConstruct, err);
	    });
	  } catch (err) {
	    process.nextTick(onConstruct, err);
	  }
	}
	function emitConstructNT(stream) {
	  stream.emit(kConstruct);
	}
	function isRequest(stream) {
	  return (stream === null || stream === undefined ? undefined : stream.setHeader) && typeof stream.abort === 'function'
	}
	function emitCloseLegacy(stream) {
	  stream.emit('close');
	}
	function emitErrorCloseLegacy(stream, err) {
	  stream.emit('error', err);
	  process.nextTick(emitCloseLegacy, stream);
	}

	// Normalize destroy for legacy.
	function destroyer(stream, err) {
	  if (!stream || isDestroyed(stream)) {
	    return
	  }
	  if (!err && !isFinished(stream)) {
	    err = new AbortError();
	  }

	  // TODO: Remove isRequest branches.
	  if (isServerRequest(stream)) {
	    stream.socket = null;
	    stream.destroy(err);
	  } else if (isRequest(stream)) {
	    stream.abort();
	  } else if (isRequest(stream.req)) {
	    stream.req.abort();
	  } else if (typeof stream.destroy === 'function') {
	    stream.destroy(err);
	  } else if (typeof stream.close === 'function') {
	    // TODO: Don't lose err?
	    stream.close();
	  } else if (err) {
	    process.nextTick(emitErrorCloseLegacy, stream, err);
	  } else {
	    process.nextTick(emitCloseLegacy, stream);
	  }
	  if (!stream.destroyed) {
	    stream[kDestroyed] = true;
	  }
	}
	destroy_1 = {
	  construct,
	  destroyer,
	  destroy,
	  undestroy,
	  errorOrDestroy
	};
	return destroy_1;
}

var legacy;
var hasRequiredLegacy;

function requireLegacy () {
	if (hasRequiredLegacy) return legacy;
	hasRequiredLegacy = 1;

	const { ArrayIsArray, ObjectSetPrototypeOf } = requirePrimordials();
	const { EventEmitter: EE } = require$$2$1;
	function Stream(opts) {
	  EE.call(this, opts);
	}
	ObjectSetPrototypeOf(Stream.prototype, EE.prototype);
	ObjectSetPrototypeOf(Stream, EE);
	Stream.prototype.pipe = function (dest, options) {
	  const source = this;
	  function ondata(chunk) {
	    if (dest.writable && dest.write(chunk) === false && source.pause) {
	      source.pause();
	    }
	  }
	  source.on('data', ondata);
	  function ondrain() {
	    if (source.readable && source.resume) {
	      source.resume();
	    }
	  }
	  dest.on('drain', ondrain);

	  // If the 'end' option is not supplied, dest.end() will be called when
	  // source gets the 'end' or 'close' events.  Only dest.end() once.
	  if (!dest._isStdio && (!options || options.end !== false)) {
	    source.on('end', onend);
	    source.on('close', onclose);
	  }
	  let didOnEnd = false;
	  function onend() {
	    if (didOnEnd) return
	    didOnEnd = true;
	    dest.end();
	  }
	  function onclose() {
	    if (didOnEnd) return
	    didOnEnd = true;
	    if (typeof dest.destroy === 'function') dest.destroy();
	  }

	  // Don't leave dangling pipes when there are errors.
	  function onerror(er) {
	    cleanup();
	    if (EE.listenerCount(this, 'error') === 0) {
	      this.emit('error', er);
	    }
	  }
	  prependListener(source, 'error', onerror);
	  prependListener(dest, 'error', onerror);

	  // Remove all the event listeners that were added.
	  function cleanup() {
	    source.removeListener('data', ondata);
	    dest.removeListener('drain', ondrain);
	    source.removeListener('end', onend);
	    source.removeListener('close', onclose);
	    source.removeListener('error', onerror);
	    dest.removeListener('error', onerror);
	    source.removeListener('end', cleanup);
	    source.removeListener('close', cleanup);
	    dest.removeListener('close', cleanup);
	  }
	  source.on('end', cleanup);
	  source.on('close', cleanup);
	  dest.on('close', cleanup);
	  dest.emit('pipe', source);

	  // Allow for unix-like usage: A.pipe(B).pipe(C)
	  return dest
	};
	function prependListener(emitter, event, fn) {
	  // Sadly this is not cacheable as some libraries bundle their own
	  // event emitter implementation with them.
	  if (typeof emitter.prependListener === 'function') return emitter.prependListener(event, fn)

	  // This is a hack to make sure that our error handler is attached before any
	  // userland ones.  NEVER DO THIS. This is here only because this code needs
	  // to continue to work with older versions of Node.js that do not include
	  // the prependListener() method. The goal is to eventually remove this hack.
	  if (!emitter._events || !emitter._events[event]) emitter.on(event, fn);
	  else if (ArrayIsArray(emitter._events[event])) emitter._events[event].unshift(fn);
	  else emitter._events[event] = [fn, emitter._events[event]];
	}
	legacy = {
	  Stream,
	  prependListener
	};
	return legacy;
}

var addAbortSignal = {exports: {}};

var hasRequiredAddAbortSignal;

function requireAddAbortSignal () {
	if (hasRequiredAddAbortSignal) return addAbortSignal.exports;
	hasRequiredAddAbortSignal = 1;
	(function (module) {

		const { AbortError, codes } = requireErrors();
		const { isNodeStream, isWebStream, kControllerErrorFunction } = requireUtils();
		const eos = requireEndOfStream();
		const { ERR_INVALID_ARG_TYPE } = codes;

		// This method is inlined here for readable-stream
		// It also does not allow for signal to not exist on the stream
		// https://github.com/nodejs/node/pull/36061#discussion_r533718029
		const validateAbortSignal = (signal, name) => {
		  if (typeof signal !== 'object' || !('aborted' in signal)) {
		    throw new ERR_INVALID_ARG_TYPE(name, 'AbortSignal', signal)
		  }
		};
		module.exports.addAbortSignal = function addAbortSignal(signal, stream) {
		  validateAbortSignal(signal, 'signal');
		  if (!isNodeStream(stream) && !isWebStream(stream)) {
		    throw new ERR_INVALID_ARG_TYPE('stream', ['ReadableStream', 'WritableStream', 'Stream'], stream)
		  }
		  return module.exports.addAbortSignalNoValidate(signal, stream)
		};
		module.exports.addAbortSignalNoValidate = function (signal, stream) {
		  if (typeof signal !== 'object' || !('aborted' in signal)) {
		    return stream
		  }
		  const onAbort = isNodeStream(stream)
		    ? () => {
		        stream.destroy(
		          new AbortError(undefined, {
		            cause: signal.reason
		          })
		        );
		      }
		    : () => {
		        stream[kControllerErrorFunction](
		          new AbortError(undefined, {
		            cause: signal.reason
		          })
		        );
		      };
		  if (signal.aborted) {
		    onAbort();
		  } else {
		    signal.addEventListener('abort', onAbort);
		    eos(stream, () => signal.removeEventListener('abort', onAbort));
		  }
		  return stream
		}; 
	} (addAbortSignal));
	return addAbortSignal.exports;
}

var buffer_list;
var hasRequiredBuffer_list;

function requireBuffer_list () {
	if (hasRequiredBuffer_list) return buffer_list;
	hasRequiredBuffer_list = 1;

	const { StringPrototypeSlice, SymbolIterator, TypedArrayPrototypeSet, Uint8Array } = requirePrimordials();
	const { Buffer } = require$$4;
	const { inspect } = requireUtil();
	buffer_list = class BufferList {
	  constructor() {
	    this.head = null;
	    this.tail = null;
	    this.length = 0;
	  }
	  push(v) {
	    const entry = {
	      data: v,
	      next: null
	    };
	    if (this.length > 0) this.tail.next = entry;
	    else this.head = entry;
	    this.tail = entry;
	    ++this.length;
	  }
	  unshift(v) {
	    const entry = {
	      data: v,
	      next: this.head
	    };
	    if (this.length === 0) this.tail = entry;
	    this.head = entry;
	    ++this.length;
	  }
	  shift() {
	    if (this.length === 0) return
	    const ret = this.head.data;
	    if (this.length === 1) this.head = this.tail = null;
	    else this.head = this.head.next;
	    --this.length;
	    return ret
	  }
	  clear() {
	    this.head = this.tail = null;
	    this.length = 0;
	  }
	  join(s) {
	    if (this.length === 0) return ''
	    let p = this.head;
	    let ret = '' + p.data;
	    while ((p = p.next) !== null) ret += s + p.data;
	    return ret
	  }
	  concat(n) {
	    if (this.length === 0) return Buffer.alloc(0)
	    const ret = Buffer.allocUnsafe(n >>> 0);
	    let p = this.head;
	    let i = 0;
	    while (p) {
	      TypedArrayPrototypeSet(ret, p.data, i);
	      i += p.data.length;
	      p = p.next;
	    }
	    return ret
	  }

	  // Consumes a specified amount of bytes or characters from the buffered data.
	  consume(n, hasStrings) {
	    const data = this.head.data;
	    if (n < data.length) {
	      // `slice` is the same for buffers and strings.
	      const slice = data.slice(0, n);
	      this.head.data = data.slice(n);
	      return slice
	    }
	    if (n === data.length) {
	      // First chunk is a perfect match.
	      return this.shift()
	    }
	    // Result spans more than one buffer.
	    return hasStrings ? this._getString(n) : this._getBuffer(n)
	  }
	  first() {
	    return this.head.data
	  }
	  *[SymbolIterator]() {
	    for (let p = this.head; p; p = p.next) {
	      yield p.data;
	    }
	  }

	  // Consumes a specified amount of characters from the buffered data.
	  _getString(n) {
	    let ret = '';
	    let p = this.head;
	    let c = 0;
	    do {
	      const str = p.data;
	      if (n > str.length) {
	        ret += str;
	        n -= str.length;
	      } else {
	        if (n === str.length) {
	          ret += str;
	          ++c;
	          if (p.next) this.head = p.next;
	          else this.head = this.tail = null;
	        } else {
	          ret += StringPrototypeSlice(str, 0, n);
	          this.head = p;
	          p.data = StringPrototypeSlice(str, n);
	        }
	        break
	      }
	      ++c;
	    } while ((p = p.next) !== null)
	    this.length -= c;
	    return ret
	  }

	  // Consumes a specified amount of bytes from the buffered data.
	  _getBuffer(n) {
	    const ret = Buffer.allocUnsafe(n);
	    const retLen = n;
	    let p = this.head;
	    let c = 0;
	    do {
	      const buf = p.data;
	      if (n > buf.length) {
	        TypedArrayPrototypeSet(ret, buf, retLen - n);
	        n -= buf.length;
	      } else {
	        if (n === buf.length) {
	          TypedArrayPrototypeSet(ret, buf, retLen - n);
	          ++c;
	          if (p.next) this.head = p.next;
	          else this.head = this.tail = null;
	        } else {
	          TypedArrayPrototypeSet(ret, new Uint8Array(buf.buffer, buf.byteOffset, n), retLen - n);
	          this.head = p;
	          p.data = buf.slice(n);
	        }
	        break
	      }
	      ++c;
	    } while ((p = p.next) !== null)
	    this.length -= c;
	    return ret
	  }

	  // Make sure the linked list only shows the minimal necessary information.
	  [Symbol.for('nodejs.util.inspect.custom')](_, options) {
	    return inspect(this, {
	      ...options,
	      // Only inspect one level.
	      depth: 0,
	      // It should not recurse.
	      customInspect: false
	    })
	  }
	};
	return buffer_list;
}

var state;
var hasRequiredState;

function requireState () {
	if (hasRequiredState) return state;
	hasRequiredState = 1;

	const { MathFloor, NumberIsInteger } = requirePrimordials();
	const { ERR_INVALID_ARG_VALUE } = requireErrors().codes;
	function highWaterMarkFrom(options, isDuplex, duplexKey) {
	  return options.highWaterMark != null ? options.highWaterMark : isDuplex ? options[duplexKey] : null
	}
	function getDefaultHighWaterMark(objectMode) {
	  return objectMode ? 16 : 16 * 1024
	}
	function getHighWaterMark(state, options, duplexKey, isDuplex) {
	  const hwm = highWaterMarkFrom(options, isDuplex, duplexKey);
	  if (hwm != null) {
	    if (!NumberIsInteger(hwm) || hwm < 0) {
	      const name = isDuplex ? `options.${duplexKey}` : 'options.highWaterMark';
	      throw new ERR_INVALID_ARG_VALUE(name, hwm)
	    }
	    return MathFloor(hwm)
	  }

	  // Default value
	  return getDefaultHighWaterMark(state.objectMode)
	}
	state = {
	  getHighWaterMark,
	  getDefaultHighWaterMark
	};
	return state;
}

var from_1;
var hasRequiredFrom;

function requireFrom () {
	if (hasRequiredFrom) return from_1;
	hasRequiredFrom = 1;

	/* replacement start */

	const process = requireProcess();

	/* replacement end */

	const { PromisePrototypeThen, SymbolAsyncIterator, SymbolIterator } = requirePrimordials();
	const { Buffer } = require$$4;
	const { ERR_INVALID_ARG_TYPE, ERR_STREAM_NULL_VALUES } = requireErrors().codes;
	function from(Readable, iterable, opts) {
	  let iterator;
	  if (typeof iterable === 'string' || iterable instanceof Buffer) {
	    return new Readable({
	      objectMode: true,
	      ...opts,
	      read() {
	        this.push(iterable);
	        this.push(null);
	      }
	    })
	  }
	  let isAsync;
	  if (iterable && iterable[SymbolAsyncIterator]) {
	    isAsync = true;
	    iterator = iterable[SymbolAsyncIterator]();
	  } else if (iterable && iterable[SymbolIterator]) {
	    isAsync = false;
	    iterator = iterable[SymbolIterator]();
	  } else {
	    throw new ERR_INVALID_ARG_TYPE('iterable', ['Iterable'], iterable)
	  }
	  const readable = new Readable({
	    objectMode: true,
	    highWaterMark: 1,
	    // TODO(ronag): What options should be allowed?
	    ...opts
	  });

	  // Flag to protect against _read
	  // being called before last iteration completion.
	  let reading = false;
	  readable._read = function () {
	    if (!reading) {
	      reading = true;
	      next();
	    }
	  };
	  readable._destroy = function (error, cb) {
	    PromisePrototypeThen(
	      close(error),
	      () => process.nextTick(cb, error),
	      // nextTick is here in case cb throws
	      (e) => process.nextTick(cb, e || error)
	    );
	  };
	  async function close(error) {
	    const hadError = error !== undefined && error !== null;
	    const hasThrow = typeof iterator.throw === 'function';
	    if (hadError && hasThrow) {
	      const { value, done } = await iterator.throw(error);
	      await value;
	      if (done) {
	        return
	      }
	    }
	    if (typeof iterator.return === 'function') {
	      const { value } = await iterator.return();
	      await value;
	    }
	  }
	  async function next() {
	    for (;;) {
	      try {
	        const { value, done } = isAsync ? await iterator.next() : iterator.next();
	        if (done) {
	          readable.push(null);
	        } else {
	          const res = value && typeof value.then === 'function' ? await value : value;
	          if (res === null) {
	            reading = false;
	            throw new ERR_STREAM_NULL_VALUES()
	          } else if (readable.push(res)) {
	            continue
	          } else {
	            reading = false;
	          }
	        }
	      } catch (err) {
	        readable.destroy(err);
	      }
	      break
	    }
	  }
	  return readable
	}
	from_1 = from;
	return from_1;
}

/* replacement start */

var readable;
var hasRequiredReadable;

function requireReadable () {
	if (hasRequiredReadable) return readable;
	hasRequiredReadable = 1;
	const process = requireProcess()

	/* replacement end */
	// Copyright Joyent, Inc. and other Node contributors.
	//
	// Permission is hereby granted, free of charge, to any person obtaining a
	// copy of this software and associated documentation files (the
	// "Software"), to deal in the Software without restriction, including
	// without limitation the rights to use, copy, modify, merge, publish,
	// distribute, sublicense, and/or sell copies of the Software, and to permit
	// persons to whom the Software is furnished to do so, subject to the
	// following conditions:
	//
	// The above copyright notice and this permission notice shall be included
	// in all copies or substantial portions of the Software.
	//
	// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
	// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
	// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
	// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
	// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
	// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
	// USE OR OTHER DEALINGS IN THE SOFTWARE.

	;	const {
	  ArrayPrototypeIndexOf,
	  NumberIsInteger,
	  NumberIsNaN,
	  NumberParseInt,
	  ObjectDefineProperties,
	  ObjectKeys,
	  ObjectSetPrototypeOf,
	  Promise,
	  SafeSet,
	  SymbolAsyncIterator,
	  Symbol
	} = requirePrimordials();
	readable = Readable;
	Readable.ReadableState = ReadableState;
	const { EventEmitter: EE } = require$$2$1;
	const { Stream, prependListener } = requireLegacy();
	const { Buffer } = require$$4;
	const { addAbortSignal } = requireAddAbortSignal();
	const eos = requireEndOfStream();
	let debug = requireUtil().debuglog('stream', (fn) => {
	  debug = fn;
	});
	const BufferList = requireBuffer_list();
	const destroyImpl = requireDestroy();
	const { getHighWaterMark, getDefaultHighWaterMark } = requireState();
	const {
	  aggregateTwoErrors,
	  codes: {
	    ERR_INVALID_ARG_TYPE,
	    ERR_METHOD_NOT_IMPLEMENTED,
	    ERR_OUT_OF_RANGE,
	    ERR_STREAM_PUSH_AFTER_EOF,
	    ERR_STREAM_UNSHIFT_AFTER_END_EVENT
	  }
	} = requireErrors();
	const { validateObject } = requireValidators();
	const kPaused = Symbol('kPaused');
	const { StringDecoder } = require$$1;
	const from = requireFrom();
	ObjectSetPrototypeOf(Readable.prototype, Stream.prototype);
	ObjectSetPrototypeOf(Readable, Stream);
	const nop = () => {};
	const { errorOrDestroy } = destroyImpl;
	function ReadableState(options, stream, isDuplex) {
	  // Duplex streams are both readable and writable, but share
	  // the same options object.
	  // However, some cases require setting options to different
	  // values for the readable and the writable sides of the duplex stream.
	  // These options can be provided separately as readableXXX and writableXXX.
	  if (typeof isDuplex !== 'boolean') isDuplex = stream instanceof requireDuplex();

	  // Object stream flag. Used to make read(n) ignore n and to
	  // make all the buffer merging and length checks go away.
	  this.objectMode = !!(options && options.objectMode);
	  if (isDuplex) this.objectMode = this.objectMode || !!(options && options.readableObjectMode);

	  // The point at which it stops calling _read() to fill the buffer
	  // Note: 0 is a valid value, means "don't call _read preemptively ever"
	  this.highWaterMark = options
	    ? getHighWaterMark(this, options, 'readableHighWaterMark', isDuplex)
	    : getDefaultHighWaterMark(false);

	  // A linked list is used to store data chunks instead of an array because the
	  // linked list can remove elements from the beginning faster than
	  // array.shift().
	  this.buffer = new BufferList();
	  this.length = 0;
	  this.pipes = [];
	  this.flowing = null;
	  this.ended = false;
	  this.endEmitted = false;
	  this.reading = false;

	  // Stream is still being constructed and cannot be
	  // destroyed until construction finished or failed.
	  // Async construction is opt in, therefore we start as
	  // constructed.
	  this.constructed = true;

	  // A flag to be able to tell if the event 'readable'/'data' is emitted
	  // immediately, or on a later tick.  We set this to true at first, because
	  // any actions that shouldn't happen until "later" should generally also
	  // not happen before the first read call.
	  this.sync = true;

	  // Whenever we return null, then we set a flag to say
	  // that we're awaiting a 'readable' event emission.
	  this.needReadable = false;
	  this.emittedReadable = false;
	  this.readableListening = false;
	  this.resumeScheduled = false;
	  this[kPaused] = null;

	  // True if the error was already emitted and should not be thrown again.
	  this.errorEmitted = false;

	  // Should close be emitted on destroy. Defaults to true.
	  this.emitClose = !options || options.emitClose !== false;

	  // Should .destroy() be called after 'end' (and potentially 'finish').
	  this.autoDestroy = !options || options.autoDestroy !== false;

	  // Has it been destroyed.
	  this.destroyed = false;

	  // Indicates whether the stream has errored. When true no further
	  // _read calls, 'data' or 'readable' events should occur. This is needed
	  // since when autoDestroy is disabled we need a way to tell whether the
	  // stream has failed.
	  this.errored = null;

	  // Indicates whether the stream has finished destroying.
	  this.closed = false;

	  // True if close has been emitted or would have been emitted
	  // depending on emitClose.
	  this.closeEmitted = false;

	  // Crypto is kind of old and crusty.  Historically, its default string
	  // encoding is 'binary' so we have to make this configurable.
	  // Everything else in the universe uses 'utf8', though.
	  this.defaultEncoding = (options && options.defaultEncoding) || 'utf8';

	  // Ref the piped dest which we need a drain event on it
	  // type: null | Writable | Set<Writable>.
	  this.awaitDrainWriters = null;
	  this.multiAwaitDrain = false;

	  // If true, a maybeReadMore has been scheduled.
	  this.readingMore = false;
	  this.dataEmitted = false;
	  this.decoder = null;
	  this.encoding = null;
	  if (options && options.encoding) {
	    this.decoder = new StringDecoder(options.encoding);
	    this.encoding = options.encoding;
	  }
	}
	function Readable(options) {
	  if (!(this instanceof Readable)) return new Readable(options)

	  // Checking for a Stream.Duplex instance is faster here instead of inside
	  // the ReadableState constructor, at least with V8 6.5.
	  const isDuplex = this instanceof requireDuplex();
	  this._readableState = new ReadableState(options, this, isDuplex);
	  if (options) {
	    if (typeof options.read === 'function') this._read = options.read;
	    if (typeof options.destroy === 'function') this._destroy = options.destroy;
	    if (typeof options.construct === 'function') this._construct = options.construct;
	    if (options.signal && !isDuplex) addAbortSignal(options.signal, this);
	  }
	  Stream.call(this, options);
	  destroyImpl.construct(this, () => {
	    if (this._readableState.needReadable) {
	      maybeReadMore(this, this._readableState);
	    }
	  });
	}
	Readable.prototype.destroy = destroyImpl.destroy;
	Readable.prototype._undestroy = destroyImpl.undestroy;
	Readable.prototype._destroy = function (err, cb) {
	  cb(err);
	};
	Readable.prototype[EE.captureRejectionSymbol] = function (err) {
	  this.destroy(err);
	};

	// Manually shove something into the read() buffer.
	// This returns true if the highWaterMark has not been hit yet,
	// similar to how Writable.write() returns true if you should
	// write() some more.
	Readable.prototype.push = function (chunk, encoding) {
	  return readableAddChunk(this, chunk, encoding, false)
	};

	// Unshift should *always* be something directly out of read().
	Readable.prototype.unshift = function (chunk, encoding) {
	  return readableAddChunk(this, chunk, encoding, true)
	};
	function readableAddChunk(stream, chunk, encoding, addToFront) {
	  debug('readableAddChunk', chunk);
	  const state = stream._readableState;
	  let err;
	  if (!state.objectMode) {
	    if (typeof chunk === 'string') {
	      encoding = encoding || state.defaultEncoding;
	      if (state.encoding !== encoding) {
	        if (addToFront && state.encoding) {
	          // When unshifting, if state.encoding is set, we have to save
	          // the string in the BufferList with the state encoding.
	          chunk = Buffer.from(chunk, encoding).toString(state.encoding);
	        } else {
	          chunk = Buffer.from(chunk, encoding);
	          encoding = '';
	        }
	      }
	    } else if (chunk instanceof Buffer) {
	      encoding = '';
	    } else if (Stream._isUint8Array(chunk)) {
	      chunk = Stream._uint8ArrayToBuffer(chunk);
	      encoding = '';
	    } else if (chunk != null) {
	      err = new ERR_INVALID_ARG_TYPE('chunk', ['string', 'Buffer', 'Uint8Array'], chunk);
	    }
	  }
	  if (err) {
	    errorOrDestroy(stream, err);
	  } else if (chunk === null) {
	    state.reading = false;
	    onEofChunk(stream, state);
	  } else if (state.objectMode || (chunk && chunk.length > 0)) {
	    if (addToFront) {
	      if (state.endEmitted) errorOrDestroy(stream, new ERR_STREAM_UNSHIFT_AFTER_END_EVENT());
	      else if (state.destroyed || state.errored) return false
	      else addChunk(stream, state, chunk, true);
	    } else if (state.ended) {
	      errorOrDestroy(stream, new ERR_STREAM_PUSH_AFTER_EOF());
	    } else if (state.destroyed || state.errored) {
	      return false
	    } else {
	      state.reading = false;
	      if (state.decoder && !encoding) {
	        chunk = state.decoder.write(chunk);
	        if (state.objectMode || chunk.length !== 0) addChunk(stream, state, chunk, false);
	        else maybeReadMore(stream, state);
	      } else {
	        addChunk(stream, state, chunk, false);
	      }
	    }
	  } else if (!addToFront) {
	    state.reading = false;
	    maybeReadMore(stream, state);
	  }

	  // We can push more data if we are below the highWaterMark.
	  // Also, if we have no data yet, we can stand some more bytes.
	  // This is to work around cases where hwm=0, such as the repl.
	  return !state.ended && (state.length < state.highWaterMark || state.length === 0)
	}
	function addChunk(stream, state, chunk, addToFront) {
	  if (state.flowing && state.length === 0 && !state.sync && stream.listenerCount('data') > 0) {
	    // Use the guard to avoid creating `Set()` repeatedly
	    // when we have multiple pipes.
	    if (state.multiAwaitDrain) {
	      state.awaitDrainWriters.clear();
	    } else {
	      state.awaitDrainWriters = null;
	    }
	    state.dataEmitted = true;
	    stream.emit('data', chunk);
	  } else {
	    // Update the buffer info.
	    state.length += state.objectMode ? 1 : chunk.length;
	    if (addToFront) state.buffer.unshift(chunk);
	    else state.buffer.push(chunk);
	    if (state.needReadable) emitReadable(stream);
	  }
	  maybeReadMore(stream, state);
	}
	Readable.prototype.isPaused = function () {
	  const state = this._readableState;
	  return state[kPaused] === true || state.flowing === false
	};

	// Backwards compatibility.
	Readable.prototype.setEncoding = function (enc) {
	  const decoder = new StringDecoder(enc);
	  this._readableState.decoder = decoder;
	  // If setEncoding(null), decoder.encoding equals utf8.
	  this._readableState.encoding = this._readableState.decoder.encoding;
	  const buffer = this._readableState.buffer;
	  // Iterate over current buffer to convert already stored Buffers:
	  let content = '';
	  for (const data of buffer) {
	    content += decoder.write(data);
	  }
	  buffer.clear();
	  if (content !== '') buffer.push(content);
	  this._readableState.length = content.length;
	  return this
	};

	// Don't raise the hwm > 1GB.
	const MAX_HWM = 0x40000000;
	function computeNewHighWaterMark(n) {
	  if (n > MAX_HWM) {
	    throw new ERR_OUT_OF_RANGE('size', '<= 1GiB', n)
	  } else {
	    // Get the next highest power of 2 to prevent increasing hwm excessively in
	    // tiny amounts.
	    n--;
	    n |= n >>> 1;
	    n |= n >>> 2;
	    n |= n >>> 4;
	    n |= n >>> 8;
	    n |= n >>> 16;
	    n++;
	  }
	  return n
	}

	// This function is designed to be inlinable, so please take care when making
	// changes to the function body.
	function howMuchToRead(n, state) {
	  if (n <= 0 || (state.length === 0 && state.ended)) return 0
	  if (state.objectMode) return 1
	  if (NumberIsNaN(n)) {
	    // Only flow one buffer at a time.
	    if (state.flowing && state.length) return state.buffer.first().length
	    return state.length
	  }
	  if (n <= state.length) return n
	  return state.ended ? state.length : 0
	}

	// You can override either this method, or the async _read(n) below.
	Readable.prototype.read = function (n) {
	  debug('read', n);
	  // Same as parseInt(undefined, 10), however V8 7.3 performance regressed
	  // in this scenario, so we are doing it manually.
	  if (n === undefined) {
	    n = NaN;
	  } else if (!NumberIsInteger(n)) {
	    n = NumberParseInt(n, 10);
	  }
	  const state = this._readableState;
	  const nOrig = n;

	  // If we're asking for more than the current hwm, then raise the hwm.
	  if (n > state.highWaterMark) state.highWaterMark = computeNewHighWaterMark(n);
	  if (n !== 0) state.emittedReadable = false;

	  // If we're doing read(0) to trigger a readable event, but we
	  // already have a bunch of data in the buffer, then just trigger
	  // the 'readable' event and move on.
	  if (
	    n === 0 &&
	    state.needReadable &&
	    ((state.highWaterMark !== 0 ? state.length >= state.highWaterMark : state.length > 0) || state.ended)
	  ) {
	    debug('read: emitReadable', state.length, state.ended);
	    if (state.length === 0 && state.ended) endReadable(this);
	    else emitReadable(this);
	    return null
	  }
	  n = howMuchToRead(n, state);

	  // If we've ended, and we're now clear, then finish it up.
	  if (n === 0 && state.ended) {
	    if (state.length === 0) endReadable(this);
	    return null
	  }

	  // All the actual chunk generation logic needs to be
	  // *below* the call to _read.  The reason is that in certain
	  // synthetic stream cases, such as passthrough streams, _read
	  // may be a completely synchronous operation which may change
	  // the state of the read buffer, providing enough data when
	  // before there was *not* enough.
	  //
	  // So, the steps are:
	  // 1. Figure out what the state of things will be after we do
	  // a read from the buffer.
	  //
	  // 2. If that resulting state will trigger a _read, then call _read.
	  // Note that this may be asynchronous, or synchronous.  Yes, it is
	  // deeply ugly to write APIs this way, but that still doesn't mean
	  // that the Readable class should behave improperly, as streams are
	  // designed to be sync/async agnostic.
	  // Take note if the _read call is sync or async (ie, if the read call
	  // has returned yet), so that we know whether or not it's safe to emit
	  // 'readable' etc.
	  //
	  // 3. Actually pull the requested chunks out of the buffer and return.

	  // if we need a readable event, then we need to do some reading.
	  let doRead = state.needReadable;
	  debug('need readable', doRead);

	  // If we currently have less than the highWaterMark, then also read some.
	  if (state.length === 0 || state.length - n < state.highWaterMark) {
	    doRead = true;
	    debug('length less than watermark', doRead);
	  }

	  // However, if we've ended, then there's no point, if we're already
	  // reading, then it's unnecessary, if we're constructing we have to wait,
	  // and if we're destroyed or errored, then it's not allowed,
	  if (state.ended || state.reading || state.destroyed || state.errored || !state.constructed) {
	    doRead = false;
	    debug('reading, ended or constructing', doRead);
	  } else if (doRead) {
	    debug('do read');
	    state.reading = true;
	    state.sync = true;
	    // If the length is currently zero, then we *need* a readable event.
	    if (state.length === 0) state.needReadable = true;

	    // Call internal read method
	    try {
	      this._read(state.highWaterMark);
	    } catch (err) {
	      errorOrDestroy(this, err);
	    }
	    state.sync = false;
	    // If _read pushed data synchronously, then `reading` will be false,
	    // and we need to re-evaluate how much data we can return to the user.
	    if (!state.reading) n = howMuchToRead(nOrig, state);
	  }
	  let ret;
	  if (n > 0) ret = fromList(n, state);
	  else ret = null;
	  if (ret === null) {
	    state.needReadable = state.length <= state.highWaterMark;
	    n = 0;
	  } else {
	    state.length -= n;
	    if (state.multiAwaitDrain) {
	      state.awaitDrainWriters.clear();
	    } else {
	      state.awaitDrainWriters = null;
	    }
	  }
	  if (state.length === 0) {
	    // If we have nothing in the buffer, then we want to know
	    // as soon as we *do* get something into the buffer.
	    if (!state.ended) state.needReadable = true;

	    // If we tried to read() past the EOF, then emit end on the next tick.
	    if (nOrig !== n && state.ended) endReadable(this);
	  }
	  if (ret !== null && !state.errorEmitted && !state.closeEmitted) {
	    state.dataEmitted = true;
	    this.emit('data', ret);
	  }
	  return ret
	};
	function onEofChunk(stream, state) {
	  debug('onEofChunk');
	  if (state.ended) return
	  if (state.decoder) {
	    const chunk = state.decoder.end();
	    if (chunk && chunk.length) {
	      state.buffer.push(chunk);
	      state.length += state.objectMode ? 1 : chunk.length;
	    }
	  }
	  state.ended = true;
	  if (state.sync) {
	    // If we are sync, wait until next tick to emit the data.
	    // Otherwise we risk emitting data in the flow()
	    // the readable code triggers during a read() call.
	    emitReadable(stream);
	  } else {
	    // Emit 'readable' now to make sure it gets picked up.
	    state.needReadable = false;
	    state.emittedReadable = true;
	    // We have to emit readable now that we are EOF. Modules
	    // in the ecosystem (e.g. dicer) rely on this event being sync.
	    emitReadable_(stream);
	  }
	}

	// Don't emit readable right away in sync mode, because this can trigger
	// another read() call => stack overflow.  This way, it might trigger
	// a nextTick recursion warning, but that's not so bad.
	function emitReadable(stream) {
	  const state = stream._readableState;
	  debug('emitReadable', state.needReadable, state.emittedReadable);
	  state.needReadable = false;
	  if (!state.emittedReadable) {
	    debug('emitReadable', state.flowing);
	    state.emittedReadable = true;
	    process.nextTick(emitReadable_, stream);
	  }
	}
	function emitReadable_(stream) {
	  const state = stream._readableState;
	  debug('emitReadable_', state.destroyed, state.length, state.ended);
	  if (!state.destroyed && !state.errored && (state.length || state.ended)) {
	    stream.emit('readable');
	    state.emittedReadable = false;
	  }

	  // The stream needs another readable event if:
	  // 1. It is not flowing, as the flow mechanism will take
	  //    care of it.
	  // 2. It is not ended.
	  // 3. It is below the highWaterMark, so we can schedule
	  //    another readable later.
	  state.needReadable = !state.flowing && !state.ended && state.length <= state.highWaterMark;
	  flow(stream);
	}

	// At this point, the user has presumably seen the 'readable' event,
	// and called read() to consume some data.  that may have triggered
	// in turn another _read(n) call, in which case reading = true if
	// it's in progress.
	// However, if we're not ended, or reading, and the length < hwm,
	// then go ahead and try to read some more preemptively.
	function maybeReadMore(stream, state) {
	  if (!state.readingMore && state.constructed) {
	    state.readingMore = true;
	    process.nextTick(maybeReadMore_, stream, state);
	  }
	}
	function maybeReadMore_(stream, state) {
	  // Attempt to read more data if we should.
	  //
	  // The conditions for reading more data are (one of):
	  // - Not enough data buffered (state.length < state.highWaterMark). The loop
	  //   is responsible for filling the buffer with enough data if such data
	  //   is available. If highWaterMark is 0 and we are not in the flowing mode
	  //   we should _not_ attempt to buffer any extra data. We'll get more data
	  //   when the stream consumer calls read() instead.
	  // - No data in the buffer, and the stream is in flowing mode. In this mode
	  //   the loop below is responsible for ensuring read() is called. Failing to
	  //   call read here would abort the flow and there's no other mechanism for
	  //   continuing the flow if the stream consumer has just subscribed to the
	  //   'data' event.
	  //
	  // In addition to the above conditions to keep reading data, the following
	  // conditions prevent the data from being read:
	  // - The stream has ended (state.ended).
	  // - There is already a pending 'read' operation (state.reading). This is a
	  //   case where the stream has called the implementation defined _read()
	  //   method, but they are processing the call asynchronously and have _not_
	  //   called push() with new data. In this case we skip performing more
	  //   read()s. The execution ends in this method again after the _read() ends
	  //   up calling push() with more data.
	  while (
	    !state.reading &&
	    !state.ended &&
	    (state.length < state.highWaterMark || (state.flowing && state.length === 0))
	  ) {
	    const len = state.length;
	    debug('maybeReadMore read 0');
	    stream.read(0);
	    if (len === state.length)
	      // Didn't get any data, stop spinning.
	      break
	  }
	  state.readingMore = false;
	}

	// Abstract method.  to be overridden in specific implementation classes.
	// call cb(er, data) where data is <= n in length.
	// for virtual (non-string, non-buffer) streams, "length" is somewhat
	// arbitrary, and perhaps not very meaningful.
	Readable.prototype._read = function (n) {
	  throw new ERR_METHOD_NOT_IMPLEMENTED('_read()')
	};
	Readable.prototype.pipe = function (dest, pipeOpts) {
	  const src = this;
	  const state = this._readableState;
	  if (state.pipes.length === 1) {
	    if (!state.multiAwaitDrain) {
	      state.multiAwaitDrain = true;
	      state.awaitDrainWriters = new SafeSet(state.awaitDrainWriters ? [state.awaitDrainWriters] : []);
	    }
	  }
	  state.pipes.push(dest);
	  debug('pipe count=%d opts=%j', state.pipes.length, pipeOpts);
	  const doEnd = (!pipeOpts || pipeOpts.end !== false) && dest !== process.stdout && dest !== process.stderr;
	  const endFn = doEnd ? onend : unpipe;
	  if (state.endEmitted) process.nextTick(endFn);
	  else src.once('end', endFn);
	  dest.on('unpipe', onunpipe);
	  function onunpipe(readable, unpipeInfo) {
	    debug('onunpipe');
	    if (readable === src) {
	      if (unpipeInfo && unpipeInfo.hasUnpiped === false) {
	        unpipeInfo.hasUnpiped = true;
	        cleanup();
	      }
	    }
	  }
	  function onend() {
	    debug('onend');
	    dest.end();
	  }
	  let ondrain;
	  let cleanedUp = false;
	  function cleanup() {
	    debug('cleanup');
	    // Cleanup event handlers once the pipe is broken.
	    dest.removeListener('close', onclose);
	    dest.removeListener('finish', onfinish);
	    if (ondrain) {
	      dest.removeListener('drain', ondrain);
	    }
	    dest.removeListener('error', onerror);
	    dest.removeListener('unpipe', onunpipe);
	    src.removeListener('end', onend);
	    src.removeListener('end', unpipe);
	    src.removeListener('data', ondata);
	    cleanedUp = true;

	    // If the reader is waiting for a drain event from this
	    // specific writer, then it would cause it to never start
	    // flowing again.
	    // So, if this is awaiting a drain, then we just call it now.
	    // If we don't know, then assume that we are waiting for one.
	    if (ondrain && state.awaitDrainWriters && (!dest._writableState || dest._writableState.needDrain)) ondrain();
	  }
	  function pause() {
	    // If the user unpiped during `dest.write()`, it is possible
	    // to get stuck in a permanently paused state if that write
	    // also returned false.
	    // => Check whether `dest` is still a piping destination.
	    if (!cleanedUp) {
	      if (state.pipes.length === 1 && state.pipes[0] === dest) {
	        debug('false write response, pause', 0);
	        state.awaitDrainWriters = dest;
	        state.multiAwaitDrain = false;
	      } else if (state.pipes.length > 1 && state.pipes.includes(dest)) {
	        debug('false write response, pause', state.awaitDrainWriters.size);
	        state.awaitDrainWriters.add(dest);
	      }
	      src.pause();
	    }
	    if (!ondrain) {
	      // When the dest drains, it reduces the awaitDrain counter
	      // on the source.  This would be more elegant with a .once()
	      // handler in flow(), but adding and removing repeatedly is
	      // too slow.
	      ondrain = pipeOnDrain(src, dest);
	      dest.on('drain', ondrain);
	    }
	  }
	  src.on('data', ondata);
	  function ondata(chunk) {
	    debug('ondata');
	    const ret = dest.write(chunk);
	    debug('dest.write', ret);
	    if (ret === false) {
	      pause();
	    }
	  }

	  // If the dest has an error, then stop piping into it.
	  // However, don't suppress the throwing behavior for this.
	  function onerror(er) {
	    debug('onerror', er);
	    unpipe();
	    dest.removeListener('error', onerror);
	    if (dest.listenerCount('error') === 0) {
	      const s = dest._writableState || dest._readableState;
	      if (s && !s.errorEmitted) {
	        // User incorrectly emitted 'error' directly on the stream.
	        errorOrDestroy(dest, er);
	      } else {
	        dest.emit('error', er);
	      }
	    }
	  }

	  // Make sure our error handler is attached before userland ones.
	  prependListener(dest, 'error', onerror);

	  // Both close and finish should trigger unpipe, but only once.
	  function onclose() {
	    dest.removeListener('finish', onfinish);
	    unpipe();
	  }
	  dest.once('close', onclose);
	  function onfinish() {
	    debug('onfinish');
	    dest.removeListener('close', onclose);
	    unpipe();
	  }
	  dest.once('finish', onfinish);
	  function unpipe() {
	    debug('unpipe');
	    src.unpipe(dest);
	  }

	  // Tell the dest that it's being piped to.
	  dest.emit('pipe', src);

	  // Start the flow if it hasn't been started already.

	  if (dest.writableNeedDrain === true) {
	    if (state.flowing) {
	      pause();
	    }
	  } else if (!state.flowing) {
	    debug('pipe resume');
	    src.resume();
	  }
	  return dest
	};
	function pipeOnDrain(src, dest) {
	  return function pipeOnDrainFunctionResult() {
	    const state = src._readableState;

	    // `ondrain` will call directly,
	    // `this` maybe not a reference to dest,
	    // so we use the real dest here.
	    if (state.awaitDrainWriters === dest) {
	      debug('pipeOnDrain', 1);
	      state.awaitDrainWriters = null;
	    } else if (state.multiAwaitDrain) {
	      debug('pipeOnDrain', state.awaitDrainWriters.size);
	      state.awaitDrainWriters.delete(dest);
	    }
	    if ((!state.awaitDrainWriters || state.awaitDrainWriters.size === 0) && src.listenerCount('data')) {
	      src.resume();
	    }
	  }
	}
	Readable.prototype.unpipe = function (dest) {
	  const state = this._readableState;
	  const unpipeInfo = {
	    hasUnpiped: false
	  };

	  // If we're not piping anywhere, then do nothing.
	  if (state.pipes.length === 0) return this
	  if (!dest) {
	    // remove all.
	    const dests = state.pipes;
	    state.pipes = [];
	    this.pause();
	    for (let i = 0; i < dests.length; i++)
	      dests[i].emit('unpipe', this, {
	        hasUnpiped: false
	      });
	    return this
	  }

	  // Try to find the right one.
	  const index = ArrayPrototypeIndexOf(state.pipes, dest);
	  if (index === -1) return this
	  state.pipes.splice(index, 1);
	  if (state.pipes.length === 0) this.pause();
	  dest.emit('unpipe', this, unpipeInfo);
	  return this
	};

	// Set up data events if they are asked for
	// Ensure readable listeners eventually get something.
	Readable.prototype.on = function (ev, fn) {
	  const res = Stream.prototype.on.call(this, ev, fn);
	  const state = this._readableState;
	  if (ev === 'data') {
	    // Update readableListening so that resume() may be a no-op
	    // a few lines down. This is needed to support once('readable').
	    state.readableListening = this.listenerCount('readable') > 0;

	    // Try start flowing on next tick if stream isn't explicitly paused.
	    if (state.flowing !== false) this.resume();
	  } else if (ev === 'readable') {
	    if (!state.endEmitted && !state.readableListening) {
	      state.readableListening = state.needReadable = true;
	      state.flowing = false;
	      state.emittedReadable = false;
	      debug('on readable', state.length, state.reading);
	      if (state.length) {
	        emitReadable(this);
	      } else if (!state.reading) {
	        process.nextTick(nReadingNextTick, this);
	      }
	    }
	  }
	  return res
	};
	Readable.prototype.addListener = Readable.prototype.on;
	Readable.prototype.removeListener = function (ev, fn) {
	  const res = Stream.prototype.removeListener.call(this, ev, fn);
	  if (ev === 'readable') {
	    // We need to check if there is someone still listening to
	    // readable and reset the state. However this needs to happen
	    // after readable has been emitted but before I/O (nextTick) to
	    // support once('readable', fn) cycles. This means that calling
	    // resume within the same tick will have no
	    // effect.
	    process.nextTick(updateReadableListening, this);
	  }
	  return res
	};
	Readable.prototype.off = Readable.prototype.removeListener;
	Readable.prototype.removeAllListeners = function (ev) {
	  const res = Stream.prototype.removeAllListeners.apply(this, arguments);
	  if (ev === 'readable' || ev === undefined) {
	    // We need to check if there is someone still listening to
	    // readable and reset the state. However this needs to happen
	    // after readable has been emitted but before I/O (nextTick) to
	    // support once('readable', fn) cycles. This means that calling
	    // resume within the same tick will have no
	    // effect.
	    process.nextTick(updateReadableListening, this);
	  }
	  return res
	};
	function updateReadableListening(self) {
	  const state = self._readableState;
	  state.readableListening = self.listenerCount('readable') > 0;
	  if (state.resumeScheduled && state[kPaused] === false) {
	    // Flowing needs to be set to true now, otherwise
	    // the upcoming resume will not flow.
	    state.flowing = true;

	    // Crude way to check if we should resume.
	  } else if (self.listenerCount('data') > 0) {
	    self.resume();
	  } else if (!state.readableListening) {
	    state.flowing = null;
	  }
	}
	function nReadingNextTick(self) {
	  debug('readable nexttick read 0');
	  self.read(0);
	}

	// pause() and resume() are remnants of the legacy readable stream API
	// If the user uses them, then switch into old mode.
	Readable.prototype.resume = function () {
	  const state = this._readableState;
	  if (!state.flowing) {
	    debug('resume');
	    // We flow only if there is no one listening
	    // for readable, but we still have to call
	    // resume().
	    state.flowing = !state.readableListening;
	    resume(this, state);
	  }
	  state[kPaused] = false;
	  return this
	};
	function resume(stream, state) {
	  if (!state.resumeScheduled) {
	    state.resumeScheduled = true;
	    process.nextTick(resume_, stream, state);
	  }
	}
	function resume_(stream, state) {
	  debug('resume', state.reading);
	  if (!state.reading) {
	    stream.read(0);
	  }
	  state.resumeScheduled = false;
	  stream.emit('resume');
	  flow(stream);
	  if (state.flowing && !state.reading) stream.read(0);
	}
	Readable.prototype.pause = function () {
	  debug('call pause flowing=%j', this._readableState.flowing);
	  if (this._readableState.flowing !== false) {
	    debug('pause');
	    this._readableState.flowing = false;
	    this.emit('pause');
	  }
	  this._readableState[kPaused] = true;
	  return this
	};
	function flow(stream) {
	  const state = stream._readableState;
	  debug('flow', state.flowing);
	  while (state.flowing && stream.read() !== null);
	}

	// Wrap an old-style stream as the async data source.
	// This is *not* part of the readable stream interface.
	// It is an ugly unfortunate mess of history.
	Readable.prototype.wrap = function (stream) {
	  let paused = false;

	  // TODO (ronag): Should this.destroy(err) emit
	  // 'error' on the wrapped stream? Would require
	  // a static factory method, e.g. Readable.wrap(stream).

	  stream.on('data', (chunk) => {
	    if (!this.push(chunk) && stream.pause) {
	      paused = true;
	      stream.pause();
	    }
	  });
	  stream.on('end', () => {
	    this.push(null);
	  });
	  stream.on('error', (err) => {
	    errorOrDestroy(this, err);
	  });
	  stream.on('close', () => {
	    this.destroy();
	  });
	  stream.on('destroy', () => {
	    this.destroy();
	  });
	  this._read = () => {
	    if (paused && stream.resume) {
	      paused = false;
	      stream.resume();
	    }
	  };

	  // Proxy all the other methods. Important when wrapping filters and duplexes.
	  const streamKeys = ObjectKeys(stream);
	  for (let j = 1; j < streamKeys.length; j++) {
	    const i = streamKeys[j];
	    if (this[i] === undefined && typeof stream[i] === 'function') {
	      this[i] = stream[i].bind(stream);
	    }
	  }
	  return this
	};
	Readable.prototype[SymbolAsyncIterator] = function () {
	  return streamToAsyncIterator(this)
	};
	Readable.prototype.iterator = function (options) {
	  if (options !== undefined) {
	    validateObject(options, 'options');
	  }
	  return streamToAsyncIterator(this, options)
	};
	function streamToAsyncIterator(stream, options) {
	  if (typeof stream.read !== 'function') {
	    stream = Readable.wrap(stream, {
	      objectMode: true
	    });
	  }
	  const iter = createAsyncIterator(stream, options);
	  iter.stream = stream;
	  return iter
	}
	async function* createAsyncIterator(stream, options) {
	  let callback = nop;
	  function next(resolve) {
	    if (this === stream) {
	      callback();
	      callback = nop;
	    } else {
	      callback = resolve;
	    }
	  }
	  stream.on('readable', next);
	  let error;
	  const cleanup = eos(
	    stream,
	    {
	      writable: false
	    },
	    (err) => {
	      error = err ? aggregateTwoErrors(error, err) : null;
	      callback();
	      callback = nop;
	    }
	  );
	  try {
	    while (true) {
	      const chunk = stream.destroyed ? null : stream.read();
	      if (chunk !== null) {
	        yield chunk;
	      } else if (error) {
	        throw error
	      } else if (error === null) {
	        return
	      } else {
	        await new Promise(next);
	      }
	    }
	  } catch (err) {
	    error = aggregateTwoErrors(error, err);
	    throw error
	  } finally {
	    if (
	      (error || (options === null || options === undefined ? undefined : options.destroyOnReturn) !== false) &&
	      (error === undefined || stream._readableState.autoDestroy)
	    ) {
	      destroyImpl.destroyer(stream, null);
	    } else {
	      stream.off('readable', next);
	      cleanup();
	    }
	  }
	}

	// Making it explicit these properties are not enumerable
	// because otherwise some prototype manipulation in
	// userland will fail.
	ObjectDefineProperties(Readable.prototype, {
	  readable: {
	    __proto__: null,
	    get() {
	      const r = this._readableState;
	      // r.readable === false means that this is part of a Duplex stream
	      // where the readable side was disabled upon construction.
	      // Compat. The user might manually disable readable side through
	      // deprecated setter.
	      return !!r && r.readable !== false && !r.destroyed && !r.errorEmitted && !r.endEmitted
	    },
	    set(val) {
	      // Backwards compat.
	      if (this._readableState) {
	        this._readableState.readable = !!val;
	      }
	    }
	  },
	  readableDidRead: {
	    __proto__: null,
	    enumerable: false,
	    get: function () {
	      return this._readableState.dataEmitted
	    }
	  },
	  readableAborted: {
	    __proto__: null,
	    enumerable: false,
	    get: function () {
	      return !!(
	        this._readableState.readable !== false &&
	        (this._readableState.destroyed || this._readableState.errored) &&
	        !this._readableState.endEmitted
	      )
	    }
	  },
	  readableHighWaterMark: {
	    __proto__: null,
	    enumerable: false,
	    get: function () {
	      return this._readableState.highWaterMark
	    }
	  },
	  readableBuffer: {
	    __proto__: null,
	    enumerable: false,
	    get: function () {
	      return this._readableState && this._readableState.buffer
	    }
	  },
	  readableFlowing: {
	    __proto__: null,
	    enumerable: false,
	    get: function () {
	      return this._readableState.flowing
	    },
	    set: function (state) {
	      if (this._readableState) {
	        this._readableState.flowing = state;
	      }
	    }
	  },
	  readableLength: {
	    __proto__: null,
	    enumerable: false,
	    get() {
	      return this._readableState.length
	    }
	  },
	  readableObjectMode: {
	    __proto__: null,
	    enumerable: false,
	    get() {
	      return this._readableState ? this._readableState.objectMode : false
	    }
	  },
	  readableEncoding: {
	    __proto__: null,
	    enumerable: false,
	    get() {
	      return this._readableState ? this._readableState.encoding : null
	    }
	  },
	  errored: {
	    __proto__: null,
	    enumerable: false,
	    get() {
	      return this._readableState ? this._readableState.errored : null
	    }
	  },
	  closed: {
	    __proto__: null,
	    get() {
	      return this._readableState ? this._readableState.closed : false
	    }
	  },
	  destroyed: {
	    __proto__: null,
	    enumerable: false,
	    get() {
	      return this._readableState ? this._readableState.destroyed : false
	    },
	    set(value) {
	      // We ignore the value if the stream
	      // has not been initialized yet.
	      if (!this._readableState) {
	        return
	      }

	      // Backward compatibility, the user is explicitly
	      // managing destroyed.
	      this._readableState.destroyed = value;
	    }
	  },
	  readableEnded: {
	    __proto__: null,
	    enumerable: false,
	    get() {
	      return this._readableState ? this._readableState.endEmitted : false
	    }
	  }
	});
	ObjectDefineProperties(ReadableState.prototype, {
	  // Legacy getter for `pipesCount`.
	  pipesCount: {
	    __proto__: null,
	    get() {
	      return this.pipes.length
	    }
	  },
	  // Legacy property for `paused`.
	  paused: {
	    __proto__: null,
	    get() {
	      return this[kPaused] !== false
	    },
	    set(value) {
	      this[kPaused] = !!value;
	    }
	  }
	});

	// Exposed for testing purposes only.
	Readable._fromList = fromList;

	// Pluck off n bytes from an array of buffers.
	// Length is the combined lengths of all the buffers in the list.
	// This function is designed to be inlinable, so please take care when making
	// changes to the function body.
	function fromList(n, state) {
	  // nothing buffered.
	  if (state.length === 0) return null
	  let ret;
	  if (state.objectMode) ret = state.buffer.shift();
	  else if (!n || n >= state.length) {
	    // Read it all, truncate the list.
	    if (state.decoder) ret = state.buffer.join('');
	    else if (state.buffer.length === 1) ret = state.buffer.first();
	    else ret = state.buffer.concat(state.length);
	    state.buffer.clear();
	  } else {
	    // read part of list.
	    ret = state.buffer.consume(n, state.decoder);
	  }
	  return ret
	}
	function endReadable(stream) {
	  const state = stream._readableState;
	  debug('endReadable', state.endEmitted);
	  if (!state.endEmitted) {
	    state.ended = true;
	    process.nextTick(endReadableNT, state, stream);
	  }
	}
	function endReadableNT(state, stream) {
	  debug('endReadableNT', state.endEmitted, state.length);

	  // Check that we didn't get one last unshift.
	  if (!state.errored && !state.closeEmitted && !state.endEmitted && state.length === 0) {
	    state.endEmitted = true;
	    stream.emit('end');
	    if (stream.writable && stream.allowHalfOpen === false) {
	      process.nextTick(endWritableNT, stream);
	    } else if (state.autoDestroy) {
	      // In case of duplex streams we need a way to detect
	      // if the writable side is ready for autoDestroy as well.
	      const wState = stream._writableState;
	      const autoDestroy =
	        !wState ||
	        (wState.autoDestroy &&
	          // We don't expect the writable to ever 'finish'
	          // if writable is explicitly set to false.
	          (wState.finished || wState.writable === false));
	      if (autoDestroy) {
	        stream.destroy();
	      }
	    }
	  }
	}
	function endWritableNT(stream) {
	  const writable = stream.writable && !stream.writableEnded && !stream.destroyed;
	  if (writable) {
	    stream.end();
	  }
	}
	Readable.from = function (iterable, opts) {
	  return from(Readable, iterable, opts)
	};
	let webStreamsAdapters;

	// Lazy to avoid circular references
	function lazyWebStreams() {
	  if (webStreamsAdapters === undefined) webStreamsAdapters = {};
	  return webStreamsAdapters
	}
	Readable.fromWeb = function (readableStream, options) {
	  return lazyWebStreams().newStreamReadableFromReadableStream(readableStream, options)
	};
	Readable.toWeb = function (streamReadable, options) {
	  return lazyWebStreams().newReadableStreamFromStreamReadable(streamReadable, options)
	};
	Readable.wrap = function (src, options) {
	  var _ref, _src$readableObjectMo;
	  return new Readable({
	    objectMode:
	      (_ref =
	        (_src$readableObjectMo = src.readableObjectMode) !== null && _src$readableObjectMo !== undefined
	          ? _src$readableObjectMo
	          : src.objectMode) !== null && _ref !== undefined
	        ? _ref
	        : true,
	    ...options,
	    destroy(err, callback) {
	      destroyImpl.destroyer(src, err);
	      callback(err);
	    }
	  }).wrap(src)
	};
	return readable;
}

/* replacement start */

var writable;
var hasRequiredWritable;

function requireWritable () {
	if (hasRequiredWritable) return writable;
	hasRequiredWritable = 1;
	const process = requireProcess()

	/* replacement end */
	// Copyright Joyent, Inc. and other Node contributors.
	//
	// Permission is hereby granted, free of charge, to any person obtaining a
	// copy of this software and associated documentation files (the
	// "Software"), to deal in the Software without restriction, including
	// without limitation the rights to use, copy, modify, merge, publish,
	// distribute, sublicense, and/or sell copies of the Software, and to permit
	// persons to whom the Software is furnished to do so, subject to the
	// following conditions:
	//
	// The above copyright notice and this permission notice shall be included
	// in all copies or substantial portions of the Software.
	//
	// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
	// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
	// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
	// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
	// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
	// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
	// USE OR OTHER DEALINGS IN THE SOFTWARE.

	// A bit simpler than readable streams.
	// Implement an async ._write(chunk, encoding, cb), and it'll handle all
	// the drain event emission and buffering.

	;	const {
	  ArrayPrototypeSlice,
	  Error,
	  FunctionPrototypeSymbolHasInstance,
	  ObjectDefineProperty,
	  ObjectDefineProperties,
	  ObjectSetPrototypeOf,
	  StringPrototypeToLowerCase,
	  Symbol,
	  SymbolHasInstance
	} = requirePrimordials();
	writable = Writable;
	Writable.WritableState = WritableState;
	const { EventEmitter: EE } = require$$2$1;
	const Stream = requireLegacy().Stream;
	const { Buffer } = require$$4;
	const destroyImpl = requireDestroy();
	const { addAbortSignal } = requireAddAbortSignal();
	const { getHighWaterMark, getDefaultHighWaterMark } = requireState();
	const {
	  ERR_INVALID_ARG_TYPE,
	  ERR_METHOD_NOT_IMPLEMENTED,
	  ERR_MULTIPLE_CALLBACK,
	  ERR_STREAM_CANNOT_PIPE,
	  ERR_STREAM_DESTROYED,
	  ERR_STREAM_ALREADY_FINISHED,
	  ERR_STREAM_NULL_VALUES,
	  ERR_STREAM_WRITE_AFTER_END,
	  ERR_UNKNOWN_ENCODING
	} = requireErrors().codes;
	const { errorOrDestroy } = destroyImpl;
	ObjectSetPrototypeOf(Writable.prototype, Stream.prototype);
	ObjectSetPrototypeOf(Writable, Stream);
	function nop() {}
	const kOnFinished = Symbol('kOnFinished');
	function WritableState(options, stream, isDuplex) {
	  // Duplex streams are both readable and writable, but share
	  // the same options object.
	  // However, some cases require setting options to different
	  // values for the readable and the writable sides of the duplex stream,
	  // e.g. options.readableObjectMode vs. options.writableObjectMode, etc.
	  if (typeof isDuplex !== 'boolean') isDuplex = stream instanceof requireDuplex();

	  // Object stream flag to indicate whether or not this stream
	  // contains buffers or objects.
	  this.objectMode = !!(options && options.objectMode);
	  if (isDuplex) this.objectMode = this.objectMode || !!(options && options.writableObjectMode);

	  // The point at which write() starts returning false
	  // Note: 0 is a valid value, means that we always return false if
	  // the entire buffer is not flushed immediately on write().
	  this.highWaterMark = options
	    ? getHighWaterMark(this, options, 'writableHighWaterMark', isDuplex)
	    : getDefaultHighWaterMark(false);

	  // if _final has been called.
	  this.finalCalled = false;

	  // drain event flag.
	  this.needDrain = false;
	  // At the start of calling end()
	  this.ending = false;
	  // When end() has been called, and returned.
	  this.ended = false;
	  // When 'finish' is emitted.
	  this.finished = false;

	  // Has it been destroyed
	  this.destroyed = false;

	  // Should we decode strings into buffers before passing to _write?
	  // this is here so that some node-core streams can optimize string
	  // handling at a lower level.
	  const noDecode = !!(options && options.decodeStrings === false);
	  this.decodeStrings = !noDecode;

	  // Crypto is kind of old and crusty.  Historically, its default string
	  // encoding is 'binary' so we have to make this configurable.
	  // Everything else in the universe uses 'utf8', though.
	  this.defaultEncoding = (options && options.defaultEncoding) || 'utf8';

	  // Not an actual buffer we keep track of, but a measurement
	  // of how much we're waiting to get pushed to some underlying
	  // socket or file.
	  this.length = 0;

	  // A flag to see when we're in the middle of a write.
	  this.writing = false;

	  // When true all writes will be buffered until .uncork() call.
	  this.corked = 0;

	  // A flag to be able to tell if the onwrite cb is called immediately,
	  // or on a later tick.  We set this to true at first, because any
	  // actions that shouldn't happen until "later" should generally also
	  // not happen before the first write call.
	  this.sync = true;

	  // A flag to know if we're processing previously buffered items, which
	  // may call the _write() callback in the same tick, so that we don't
	  // end up in an overlapped onwrite situation.
	  this.bufferProcessing = false;

	  // The callback that's passed to _write(chunk, cb).
	  this.onwrite = onwrite.bind(undefined, stream);

	  // The callback that the user supplies to write(chunk, encoding, cb).
	  this.writecb = null;

	  // The amount that is being written when _write is called.
	  this.writelen = 0;

	  // Storage for data passed to the afterWrite() callback in case of
	  // synchronous _write() completion.
	  this.afterWriteTickInfo = null;
	  resetBuffer(this);

	  // Number of pending user-supplied write callbacks
	  // this must be 0 before 'finish' can be emitted.
	  this.pendingcb = 0;

	  // Stream is still being constructed and cannot be
	  // destroyed until construction finished or failed.
	  // Async construction is opt in, therefore we start as
	  // constructed.
	  this.constructed = true;

	  // Emit prefinish if the only thing we're waiting for is _write cbs
	  // This is relevant for synchronous Transform streams.
	  this.prefinished = false;

	  // True if the error was already emitted and should not be thrown again.
	  this.errorEmitted = false;

	  // Should close be emitted on destroy. Defaults to true.
	  this.emitClose = !options || options.emitClose !== false;

	  // Should .destroy() be called after 'finish' (and potentially 'end').
	  this.autoDestroy = !options || options.autoDestroy !== false;

	  // Indicates whether the stream has errored. When true all write() calls
	  // should return false. This is needed since when autoDestroy
	  // is disabled we need a way to tell whether the stream has failed.
	  this.errored = null;

	  // Indicates whether the stream has finished destroying.
	  this.closed = false;

	  // True if close has been emitted or would have been emitted
	  // depending on emitClose.
	  this.closeEmitted = false;
	  this[kOnFinished] = [];
	}
	function resetBuffer(state) {
	  state.buffered = [];
	  state.bufferedIndex = 0;
	  state.allBuffers = true;
	  state.allNoop = true;
	}
	WritableState.prototype.getBuffer = function getBuffer() {
	  return ArrayPrototypeSlice(this.buffered, this.bufferedIndex)
	};
	ObjectDefineProperty(WritableState.prototype, 'bufferedRequestCount', {
	  __proto__: null,
	  get() {
	    return this.buffered.length - this.bufferedIndex
	  }
	});
	function Writable(options) {
	  // Writable ctor is applied to Duplexes, too.
	  // `realHasInstance` is necessary because using plain `instanceof`
	  // would return false, as no `_writableState` property is attached.

	  // Trying to use the custom `instanceof` for Writable here will also break the
	  // Node.js LazyTransform implementation, which has a non-trivial getter for
	  // `_writableState` that would lead to infinite recursion.

	  // Checking for a Stream.Duplex instance is faster here instead of inside
	  // the WritableState constructor, at least with V8 6.5.
	  const isDuplex = this instanceof requireDuplex();
	  if (!isDuplex && !FunctionPrototypeSymbolHasInstance(Writable, this)) return new Writable(options)
	  this._writableState = new WritableState(options, this, isDuplex);
	  if (options) {
	    if (typeof options.write === 'function') this._write = options.write;
	    if (typeof options.writev === 'function') this._writev = options.writev;
	    if (typeof options.destroy === 'function') this._destroy = options.destroy;
	    if (typeof options.final === 'function') this._final = options.final;
	    if (typeof options.construct === 'function') this._construct = options.construct;
	    if (options.signal) addAbortSignal(options.signal, this);
	  }
	  Stream.call(this, options);
	  destroyImpl.construct(this, () => {
	    const state = this._writableState;
	    if (!state.writing) {
	      clearBuffer(this, state);
	    }
	    finishMaybe(this, state);
	  });
	}
	ObjectDefineProperty(Writable, SymbolHasInstance, {
	  __proto__: null,
	  value: function (object) {
	    if (FunctionPrototypeSymbolHasInstance(this, object)) return true
	    if (this !== Writable) return false
	    return object && object._writableState instanceof WritableState
	  }
	});

	// Otherwise people can pipe Writable streams, which is just wrong.
	Writable.prototype.pipe = function () {
	  errorOrDestroy(this, new ERR_STREAM_CANNOT_PIPE());
	};
	function _write(stream, chunk, encoding, cb) {
	  const state = stream._writableState;
	  if (typeof encoding === 'function') {
	    cb = encoding;
	    encoding = state.defaultEncoding;
	  } else {
	    if (!encoding) encoding = state.defaultEncoding;
	    else if (encoding !== 'buffer' && !Buffer.isEncoding(encoding)) throw new ERR_UNKNOWN_ENCODING(encoding)
	    if (typeof cb !== 'function') cb = nop;
	  }
	  if (chunk === null) {
	    throw new ERR_STREAM_NULL_VALUES()
	  } else if (!state.objectMode) {
	    if (typeof chunk === 'string') {
	      if (state.decodeStrings !== false) {
	        chunk = Buffer.from(chunk, encoding);
	        encoding = 'buffer';
	      }
	    } else if (chunk instanceof Buffer) {
	      encoding = 'buffer';
	    } else if (Stream._isUint8Array(chunk)) {
	      chunk = Stream._uint8ArrayToBuffer(chunk);
	      encoding = 'buffer';
	    } else {
	      throw new ERR_INVALID_ARG_TYPE('chunk', ['string', 'Buffer', 'Uint8Array'], chunk)
	    }
	  }
	  let err;
	  if (state.ending) {
	    err = new ERR_STREAM_WRITE_AFTER_END();
	  } else if (state.destroyed) {
	    err = new ERR_STREAM_DESTROYED('write');
	  }
	  if (err) {
	    process.nextTick(cb, err);
	    errorOrDestroy(stream, err, true);
	    return err
	  }
	  state.pendingcb++;
	  return writeOrBuffer(stream, state, chunk, encoding, cb)
	}
	Writable.prototype.write = function (chunk, encoding, cb) {
	  return _write(this, chunk, encoding, cb) === true
	};
	Writable.prototype.cork = function () {
	  this._writableState.corked++;
	};
	Writable.prototype.uncork = function () {
	  const state = this._writableState;
	  if (state.corked) {
	    state.corked--;
	    if (!state.writing) clearBuffer(this, state);
	  }
	};
	Writable.prototype.setDefaultEncoding = function setDefaultEncoding(encoding) {
	  // node::ParseEncoding() requires lower case.
	  if (typeof encoding === 'string') encoding = StringPrototypeToLowerCase(encoding);
	  if (!Buffer.isEncoding(encoding)) throw new ERR_UNKNOWN_ENCODING(encoding)
	  this._writableState.defaultEncoding = encoding;
	  return this
	};

	// If we're already writing something, then just put this
	// in the queue, and wait our turn.  Otherwise, call _write
	// If we return false, then we need a drain event, so set that flag.
	function writeOrBuffer(stream, state, chunk, encoding, callback) {
	  const len = state.objectMode ? 1 : chunk.length;
	  state.length += len;

	  // stream._write resets state.length
	  const ret = state.length < state.highWaterMark;
	  // We must ensure that previous needDrain will not be reset to false.
	  if (!ret) state.needDrain = true;
	  if (state.writing || state.corked || state.errored || !state.constructed) {
	    state.buffered.push({
	      chunk,
	      encoding,
	      callback
	    });
	    if (state.allBuffers && encoding !== 'buffer') {
	      state.allBuffers = false;
	    }
	    if (state.allNoop && callback !== nop) {
	      state.allNoop = false;
	    }
	  } else {
	    state.writelen = len;
	    state.writecb = callback;
	    state.writing = true;
	    state.sync = true;
	    stream._write(chunk, encoding, state.onwrite);
	    state.sync = false;
	  }

	  // Return false if errored or destroyed in order to break
	  // any synchronous while(stream.write(data)) loops.
	  return ret && !state.errored && !state.destroyed
	}
	function doWrite(stream, state, writev, len, chunk, encoding, cb) {
	  state.writelen = len;
	  state.writecb = cb;
	  state.writing = true;
	  state.sync = true;
	  if (state.destroyed) state.onwrite(new ERR_STREAM_DESTROYED('write'));
	  else if (writev) stream._writev(chunk, state.onwrite);
	  else stream._write(chunk, encoding, state.onwrite);
	  state.sync = false;
	}
	function onwriteError(stream, state, er, cb) {
	  --state.pendingcb;
	  cb(er);
	  // Ensure callbacks are invoked even when autoDestroy is
	  // not enabled. Passing `er` here doesn't make sense since
	  // it's related to one specific write, not to the buffered
	  // writes.
	  errorBuffer(state);
	  // This can emit error, but error must always follow cb.
	  errorOrDestroy(stream, er);
	}
	function onwrite(stream, er) {
	  const state = stream._writableState;
	  const sync = state.sync;
	  const cb = state.writecb;
	  if (typeof cb !== 'function') {
	    errorOrDestroy(stream, new ERR_MULTIPLE_CALLBACK());
	    return
	  }
	  state.writing = false;
	  state.writecb = null;
	  state.length -= state.writelen;
	  state.writelen = 0;
	  if (er) {
	    // Avoid V8 leak, https://github.com/nodejs/node/pull/34103#issuecomment-652002364
	    er.stack; // eslint-disable-line no-unused-expressions

	    if (!state.errored) {
	      state.errored = er;
	    }

	    // In case of duplex streams we need to notify the readable side of the
	    // error.
	    if (stream._readableState && !stream._readableState.errored) {
	      stream._readableState.errored = er;
	    }
	    if (sync) {
	      process.nextTick(onwriteError, stream, state, er, cb);
	    } else {
	      onwriteError(stream, state, er, cb);
	    }
	  } else {
	    if (state.buffered.length > state.bufferedIndex) {
	      clearBuffer(stream, state);
	    }
	    if (sync) {
	      // It is a common case that the callback passed to .write() is always
	      // the same. In that case, we do not schedule a new nextTick(), but
	      // rather just increase a counter, to improve performance and avoid
	      // memory allocations.
	      if (state.afterWriteTickInfo !== null && state.afterWriteTickInfo.cb === cb) {
	        state.afterWriteTickInfo.count++;
	      } else {
	        state.afterWriteTickInfo = {
	          count: 1,
	          cb,
	          stream,
	          state
	        };
	        process.nextTick(afterWriteTick, state.afterWriteTickInfo);
	      }
	    } else {
	      afterWrite(stream, state, 1, cb);
	    }
	  }
	}
	function afterWriteTick({ stream, state, count, cb }) {
	  state.afterWriteTickInfo = null;
	  return afterWrite(stream, state, count, cb)
	}
	function afterWrite(stream, state, count, cb) {
	  const needDrain = !state.ending && !stream.destroyed && state.length === 0 && state.needDrain;
	  if (needDrain) {
	    state.needDrain = false;
	    stream.emit('drain');
	  }
	  while (count-- > 0) {
	    state.pendingcb--;
	    cb();
	  }
	  if (state.destroyed) {
	    errorBuffer(state);
	  }
	  finishMaybe(stream, state);
	}

	// If there's something in the buffer waiting, then invoke callbacks.
	function errorBuffer(state) {
	  if (state.writing) {
	    return
	  }
	  for (let n = state.bufferedIndex; n < state.buffered.length; ++n) {
	    var _state$errored;
	    const { chunk, callback } = state.buffered[n];
	    const len = state.objectMode ? 1 : chunk.length;
	    state.length -= len;
	    callback(
	      (_state$errored = state.errored) !== null && _state$errored !== undefined
	        ? _state$errored
	        : new ERR_STREAM_DESTROYED('write')
	    );
	  }
	  const onfinishCallbacks = state[kOnFinished].splice(0);
	  for (let i = 0; i < onfinishCallbacks.length; i++) {
	    var _state$errored2;
	    onfinishCallbacks[i](
	      (_state$errored2 = state.errored) !== null && _state$errored2 !== undefined
	        ? _state$errored2
	        : new ERR_STREAM_DESTROYED('end')
	    );
	  }
	  resetBuffer(state);
	}

	// If there's something in the buffer waiting, then process it.
	function clearBuffer(stream, state) {
	  if (state.corked || state.bufferProcessing || state.destroyed || !state.constructed) {
	    return
	  }
	  const { buffered, bufferedIndex, objectMode } = state;
	  const bufferedLength = buffered.length - bufferedIndex;
	  if (!bufferedLength) {
	    return
	  }
	  let i = bufferedIndex;
	  state.bufferProcessing = true;
	  if (bufferedLength > 1 && stream._writev) {
	    state.pendingcb -= bufferedLength - 1;
	    const callback = state.allNoop
	      ? nop
	      : (err) => {
	          for (let n = i; n < buffered.length; ++n) {
	            buffered[n].callback(err);
	          }
	        };
	    // Make a copy of `buffered` if it's going to be used by `callback` above,
	    // since `doWrite` will mutate the array.
	    const chunks = state.allNoop && i === 0 ? buffered : ArrayPrototypeSlice(buffered, i);
	    chunks.allBuffers = state.allBuffers;
	    doWrite(stream, state, true, state.length, chunks, '', callback);
	    resetBuffer(state);
	  } else {
	    do {
	      const { chunk, encoding, callback } = buffered[i];
	      buffered[i++] = null;
	      const len = objectMode ? 1 : chunk.length;
	      doWrite(stream, state, false, len, chunk, encoding, callback);
	    } while (i < buffered.length && !state.writing)
	    if (i === buffered.length) {
	      resetBuffer(state);
	    } else if (i > 256) {
	      buffered.splice(0, i);
	      state.bufferedIndex = 0;
	    } else {
	      state.bufferedIndex = i;
	    }
	  }
	  state.bufferProcessing = false;
	}
	Writable.prototype._write = function (chunk, encoding, cb) {
	  if (this._writev) {
	    this._writev(
	      [
	        {
	          chunk,
	          encoding
	        }
	      ],
	      cb
	    );
	  } else {
	    throw new ERR_METHOD_NOT_IMPLEMENTED('_write()')
	  }
	};
	Writable.prototype._writev = null;
	Writable.prototype.end = function (chunk, encoding, cb) {
	  const state = this._writableState;
	  if (typeof chunk === 'function') {
	    cb = chunk;
	    chunk = null;
	    encoding = null;
	  } else if (typeof encoding === 'function') {
	    cb = encoding;
	    encoding = null;
	  }
	  let err;
	  if (chunk !== null && chunk !== undefined) {
	    const ret = _write(this, chunk, encoding);
	    if (ret instanceof Error) {
	      err = ret;
	    }
	  }

	  // .end() fully uncorks.
	  if (state.corked) {
	    state.corked = 1;
	    this.uncork();
	  }
	  if (err) ; else if (!state.errored && !state.ending) {
	    // This is forgiving in terms of unnecessary calls to end() and can hide
	    // logic errors. However, usually such errors are harmless and causing a
	    // hard error can be disproportionately destructive. It is not always
	    // trivial for the user to determine whether end() needs to be called
	    // or not.

	    state.ending = true;
	    finishMaybe(this, state, true);
	    state.ended = true;
	  } else if (state.finished) {
	    err = new ERR_STREAM_ALREADY_FINISHED('end');
	  } else if (state.destroyed) {
	    err = new ERR_STREAM_DESTROYED('end');
	  }
	  if (typeof cb === 'function') {
	    if (err || state.finished) {
	      process.nextTick(cb, err);
	    } else {
	      state[kOnFinished].push(cb);
	    }
	  }
	  return this
	};
	function needFinish(state) {
	  return (
	    state.ending &&
	    !state.destroyed &&
	    state.constructed &&
	    state.length === 0 &&
	    !state.errored &&
	    state.buffered.length === 0 &&
	    !state.finished &&
	    !state.writing &&
	    !state.errorEmitted &&
	    !state.closeEmitted
	  )
	}
	function callFinal(stream, state) {
	  let called = false;
	  function onFinish(err) {
	    if (called) {
	      errorOrDestroy(stream, err !== null && err !== undefined ? err : ERR_MULTIPLE_CALLBACK());
	      return
	    }
	    called = true;
	    state.pendingcb--;
	    if (err) {
	      const onfinishCallbacks = state[kOnFinished].splice(0);
	      for (let i = 0; i < onfinishCallbacks.length; i++) {
	        onfinishCallbacks[i](err);
	      }
	      errorOrDestroy(stream, err, state.sync);
	    } else if (needFinish(state)) {
	      state.prefinished = true;
	      stream.emit('prefinish');
	      // Backwards compat. Don't check state.sync here.
	      // Some streams assume 'finish' will be emitted
	      // asynchronously relative to _final callback.
	      state.pendingcb++;
	      process.nextTick(finish, stream, state);
	    }
	  }
	  state.sync = true;
	  state.pendingcb++;
	  try {
	    stream._final(onFinish);
	  } catch (err) {
	    onFinish(err);
	  }
	  state.sync = false;
	}
	function prefinish(stream, state) {
	  if (!state.prefinished && !state.finalCalled) {
	    if (typeof stream._final === 'function' && !state.destroyed) {
	      state.finalCalled = true;
	      callFinal(stream, state);
	    } else {
	      state.prefinished = true;
	      stream.emit('prefinish');
	    }
	  }
	}
	function finishMaybe(stream, state, sync) {
	  if (needFinish(state)) {
	    prefinish(stream, state);
	    if (state.pendingcb === 0) {
	      if (sync) {
	        state.pendingcb++;
	        process.nextTick(
	          (stream, state) => {
	            if (needFinish(state)) {
	              finish(stream, state);
	            } else {
	              state.pendingcb--;
	            }
	          },
	          stream,
	          state
	        );
	      } else if (needFinish(state)) {
	        state.pendingcb++;
	        finish(stream, state);
	      }
	    }
	  }
	}
	function finish(stream, state) {
	  state.pendingcb--;
	  state.finished = true;
	  const onfinishCallbacks = state[kOnFinished].splice(0);
	  for (let i = 0; i < onfinishCallbacks.length; i++) {
	    onfinishCallbacks[i]();
	  }
	  stream.emit('finish');
	  if (state.autoDestroy) {
	    // In case of duplex streams we need a way to detect
	    // if the readable side is ready for autoDestroy as well.
	    const rState = stream._readableState;
	    const autoDestroy =
	      !rState ||
	      (rState.autoDestroy &&
	        // We don't expect the readable to ever 'end'
	        // if readable is explicitly set to false.
	        (rState.endEmitted || rState.readable === false));
	    if (autoDestroy) {
	      stream.destroy();
	    }
	  }
	}
	ObjectDefineProperties(Writable.prototype, {
	  closed: {
	    __proto__: null,
	    get() {
	      return this._writableState ? this._writableState.closed : false
	    }
	  },
	  destroyed: {
	    __proto__: null,
	    get() {
	      return this._writableState ? this._writableState.destroyed : false
	    },
	    set(value) {
	      // Backward compatibility, the user is explicitly managing destroyed.
	      if (this._writableState) {
	        this._writableState.destroyed = value;
	      }
	    }
	  },
	  writable: {
	    __proto__: null,
	    get() {
	      const w = this._writableState;
	      // w.writable === false means that this is part of a Duplex stream
	      // where the writable side was disabled upon construction.
	      // Compat. The user might manually disable writable side through
	      // deprecated setter.
	      return !!w && w.writable !== false && !w.destroyed && !w.errored && !w.ending && !w.ended
	    },
	    set(val) {
	      // Backwards compatible.
	      if (this._writableState) {
	        this._writableState.writable = !!val;
	      }
	    }
	  },
	  writableFinished: {
	    __proto__: null,
	    get() {
	      return this._writableState ? this._writableState.finished : false
	    }
	  },
	  writableObjectMode: {
	    __proto__: null,
	    get() {
	      return this._writableState ? this._writableState.objectMode : false
	    }
	  },
	  writableBuffer: {
	    __proto__: null,
	    get() {
	      return this._writableState && this._writableState.getBuffer()
	    }
	  },
	  writableEnded: {
	    __proto__: null,
	    get() {
	      return this._writableState ? this._writableState.ending : false
	    }
	  },
	  writableNeedDrain: {
	    __proto__: null,
	    get() {
	      const wState = this._writableState;
	      if (!wState) return false
	      return !wState.destroyed && !wState.ending && wState.needDrain
	    }
	  },
	  writableHighWaterMark: {
	    __proto__: null,
	    get() {
	      return this._writableState && this._writableState.highWaterMark
	    }
	  },
	  writableCorked: {
	    __proto__: null,
	    get() {
	      return this._writableState ? this._writableState.corked : 0
	    }
	  },
	  writableLength: {
	    __proto__: null,
	    get() {
	      return this._writableState && this._writableState.length
	    }
	  },
	  errored: {
	    __proto__: null,
	    enumerable: false,
	    get() {
	      return this._writableState ? this._writableState.errored : null
	    }
	  },
	  writableAborted: {
	    __proto__: null,
	    enumerable: false,
	    get: function () {
	      return !!(
	        this._writableState.writable !== false &&
	        (this._writableState.destroyed || this._writableState.errored) &&
	        !this._writableState.finished
	      )
	    }
	  }
	});
	const destroy = destroyImpl.destroy;
	Writable.prototype.destroy = function (err, cb) {
	  const state = this._writableState;

	  // Invoke pending callbacks.
	  if (!state.destroyed && (state.bufferedIndex < state.buffered.length || state[kOnFinished].length)) {
	    process.nextTick(errorBuffer, state);
	  }
	  destroy.call(this, err, cb);
	  return this
	};
	Writable.prototype._undestroy = destroyImpl.undestroy;
	Writable.prototype._destroy = function (err, cb) {
	  cb(err);
	};
	Writable.prototype[EE.captureRejectionSymbol] = function (err) {
	  this.destroy(err);
	};
	let webStreamsAdapters;

	// Lazy to avoid circular references
	function lazyWebStreams() {
	  if (webStreamsAdapters === undefined) webStreamsAdapters = {};
	  return webStreamsAdapters
	}
	Writable.fromWeb = function (writableStream, options) {
	  return lazyWebStreams().newStreamWritableFromWritableStream(writableStream, options)
	};
	Writable.toWeb = function (streamWritable) {
	  return lazyWebStreams().newWritableStreamFromStreamWritable(streamWritable)
	};
	return writable;
}

/* replacement start */

var duplexify;
var hasRequiredDuplexify;

function requireDuplexify () {
	if (hasRequiredDuplexify) return duplexify;
	hasRequiredDuplexify = 1;
	const process = requireProcess()

	/* replacement end */

	;	const bufferModule = require$$4;
	const {
	  isReadable,
	  isWritable,
	  isIterable,
	  isNodeStream,
	  isReadableNodeStream,
	  isWritableNodeStream,
	  isDuplexNodeStream
	} = requireUtils();
	const eos = requireEndOfStream();
	const {
	  AbortError,
	  codes: { ERR_INVALID_ARG_TYPE, ERR_INVALID_RETURN_VALUE }
	} = requireErrors();
	const { destroyer } = requireDestroy();
	const Duplex = requireDuplex();
	const Readable = requireReadable();
	const { createDeferredPromise } = requireUtil();
	const from = requireFrom();
	const Blob = globalThis.Blob || bufferModule.Blob;
	const isBlob =
	  typeof Blob !== 'undefined'
	    ? function isBlob(b) {
	        return b instanceof Blob
	      }
	    : function isBlob(b) {
	        return false
	      };
	const AbortController = globalThis.AbortController || require$$0.AbortController;
	const { FunctionPrototypeCall } = requirePrimordials();

	// This is needed for pre node 17.
	class Duplexify extends Duplex {
	  constructor(options) {
	    super(options);

	    // https://github.com/nodejs/node/pull/34385

	    if ((options === null || options === undefined ? undefined : options.readable) === false) {
	      this._readableState.readable = false;
	      this._readableState.ended = true;
	      this._readableState.endEmitted = true;
	    }
	    if ((options === null || options === undefined ? undefined : options.writable) === false) {
	      this._writableState.writable = false;
	      this._writableState.ending = true;
	      this._writableState.ended = true;
	      this._writableState.finished = true;
	    }
	  }
	}
	duplexify = function duplexify(body, name) {
	  if (isDuplexNodeStream(body)) {
	    return body
	  }
	  if (isReadableNodeStream(body)) {
	    return _duplexify({
	      readable: body
	    })
	  }
	  if (isWritableNodeStream(body)) {
	    return _duplexify({
	      writable: body
	    })
	  }
	  if (isNodeStream(body)) {
	    return _duplexify({
	      writable: false,
	      readable: false
	    })
	  }

	  // TODO: Webstreams
	  // if (isReadableStream(body)) {
	  //   return _duplexify({ readable: Readable.fromWeb(body) });
	  // }

	  // TODO: Webstreams
	  // if (isWritableStream(body)) {
	  //   return _duplexify({ writable: Writable.fromWeb(body) });
	  // }

	  if (typeof body === 'function') {
	    const { value, write, final, destroy } = fromAsyncGen(body);
	    if (isIterable(value)) {
	      return from(Duplexify, value, {
	        // TODO (ronag): highWaterMark?
	        objectMode: true,
	        write,
	        final,
	        destroy
	      })
	    }
	    const then = value === null || value === undefined ? undefined : value.then;
	    if (typeof then === 'function') {
	      let d;
	      const promise = FunctionPrototypeCall(
	        then,
	        value,
	        (val) => {
	          if (val != null) {
	            throw new ERR_INVALID_RETURN_VALUE('nully', 'body', val)
	          }
	        },
	        (err) => {
	          destroyer(d, err);
	        }
	      );
	      return (d = new Duplexify({
	        // TODO (ronag): highWaterMark?
	        objectMode: true,
	        readable: false,
	        write,
	        final(cb) {
	          final(async () => {
	            try {
	              await promise;
	              process.nextTick(cb, null);
	            } catch (err) {
	              process.nextTick(cb, err);
	            }
	          });
	        },
	        destroy
	      }))
	    }
	    throw new ERR_INVALID_RETURN_VALUE('Iterable, AsyncIterable or AsyncFunction', name, value)
	  }
	  if (isBlob(body)) {
	    return duplexify(body.arrayBuffer())
	  }
	  if (isIterable(body)) {
	    return from(Duplexify, body, {
	      // TODO (ronag): highWaterMark?
	      objectMode: true,
	      writable: false
	    })
	  }

	  // TODO: Webstreams.
	  // if (
	  //   isReadableStream(body?.readable) &&
	  //   isWritableStream(body?.writable)
	  // ) {
	  //   return Duplexify.fromWeb(body);
	  // }

	  if (
	    typeof (body === null || body === undefined ? undefined : body.writable) === 'object' ||
	    typeof (body === null || body === undefined ? undefined : body.readable) === 'object'
	  ) {
	    const readable =
	      body !== null && body !== undefined && body.readable
	        ? isReadableNodeStream(body === null || body === undefined ? undefined : body.readable)
	          ? body === null || body === undefined
	            ? undefined
	            : body.readable
	          : duplexify(body.readable)
	        : undefined;
	    const writable =
	      body !== null && body !== undefined && body.writable
	        ? isWritableNodeStream(body === null || body === undefined ? undefined : body.writable)
	          ? body === null || body === undefined
	            ? undefined
	            : body.writable
	          : duplexify(body.writable)
	        : undefined;
	    return _duplexify({
	      readable,
	      writable
	    })
	  }
	  const then = body === null || body === undefined ? undefined : body.then;
	  if (typeof then === 'function') {
	    let d;
	    FunctionPrototypeCall(
	      then,
	      body,
	      (val) => {
	        if (val != null) {
	          d.push(val);
	        }
	        d.push(null);
	      },
	      (err) => {
	        destroyer(d, err);
	      }
	    );
	    return (d = new Duplexify({
	      objectMode: true,
	      writable: false,
	      read() {}
	    }))
	  }
	  throw new ERR_INVALID_ARG_TYPE(
	    name,
	    [
	      'Blob',
	      'ReadableStream',
	      'WritableStream',
	      'Stream',
	      'Iterable',
	      'AsyncIterable',
	      'Function',
	      '{ readable, writable } pair',
	      'Promise'
	    ],
	    body
	  )
	};
	function fromAsyncGen(fn) {
	  let { promise, resolve } = createDeferredPromise();
	  const ac = new AbortController();
	  const signal = ac.signal;
	  const value = fn(
	    (async function* () {
	      while (true) {
	        const _promise = promise;
	        promise = null;
	        const { chunk, done, cb } = await _promise;
	        process.nextTick(cb);
	        if (done) return
	        if (signal.aborted)
	          throw new AbortError(undefined, {
	            cause: signal.reason
	          })
	        ;({ promise, resolve } = createDeferredPromise());
	        yield chunk;
	      }
	    })(),
	    {
	      signal
	    }
	  );
	  return {
	    value,
	    write(chunk, encoding, cb) {
	      const _resolve = resolve;
	      resolve = null;
	      _resolve({
	        chunk,
	        done: false,
	        cb
	      });
	    },
	    final(cb) {
	      const _resolve = resolve;
	      resolve = null;
	      _resolve({
	        done: true,
	        cb
	      });
	    },
	    destroy(err, cb) {
	      ac.abort();
	      cb(err);
	    }
	  }
	}
	function _duplexify(pair) {
	  const r = pair.readable && typeof pair.readable.read !== 'function' ? Readable.wrap(pair.readable) : pair.readable;
	  const w = pair.writable;
	  let readable = !!isReadable(r);
	  let writable = !!isWritable(w);
	  let ondrain;
	  let onfinish;
	  let onreadable;
	  let onclose;
	  let d;
	  function onfinished(err) {
	    const cb = onclose;
	    onclose = null;
	    if (cb) {
	      cb(err);
	    } else if (err) {
	      d.destroy(err);
	    }
	  }

	  // TODO(ronag): Avoid double buffering.
	  // Implement Writable/Readable/Duplex traits.
	  // See, https://github.com/nodejs/node/pull/33515.
	  d = new Duplexify({
	    // TODO (ronag): highWaterMark?
	    readableObjectMode: !!(r !== null && r !== undefined && r.readableObjectMode),
	    writableObjectMode: !!(w !== null && w !== undefined && w.writableObjectMode),
	    readable,
	    writable
	  });
	  if (writable) {
	    eos(w, (err) => {
	      writable = false;
	      if (err) {
	        destroyer(r, err);
	      }
	      onfinished(err);
	    });
	    d._write = function (chunk, encoding, callback) {
	      if (w.write(chunk, encoding)) {
	        callback();
	      } else {
	        ondrain = callback;
	      }
	    };
	    d._final = function (callback) {
	      w.end();
	      onfinish = callback;
	    };
	    w.on('drain', function () {
	      if (ondrain) {
	        const cb = ondrain;
	        ondrain = null;
	        cb();
	      }
	    });
	    w.on('finish', function () {
	      if (onfinish) {
	        const cb = onfinish;
	        onfinish = null;
	        cb();
	      }
	    });
	  }
	  if (readable) {
	    eos(r, (err) => {
	      readable = false;
	      if (err) {
	        destroyer(r, err);
	      }
	      onfinished(err);
	    });
	    r.on('readable', function () {
	      if (onreadable) {
	        const cb = onreadable;
	        onreadable = null;
	        cb();
	      }
	    });
	    r.on('end', function () {
	      d.push(null);
	    });
	    d._read = function () {
	      while (true) {
	        const buf = r.read();
	        if (buf === null) {
	          onreadable = d._read;
	          return
	        }
	        if (!d.push(buf)) {
	          return
	        }
	      }
	    };
	  }
	  d._destroy = function (err, callback) {
	    if (!err && onclose !== null) {
	      err = new AbortError();
	    }
	    onreadable = null;
	    ondrain = null;
	    onfinish = null;
	    if (onclose === null) {
	      callback(err);
	    } else {
	      onclose = callback;
	      destroyer(w, err);
	      destroyer(r, err);
	    }
	  };
	  return d
	}
	return duplexify;
}

var duplex;
var hasRequiredDuplex;

function requireDuplex () {
	if (hasRequiredDuplex) return duplex;
	hasRequiredDuplex = 1;

	const {
	  ObjectDefineProperties,
	  ObjectGetOwnPropertyDescriptor,
	  ObjectKeys,
	  ObjectSetPrototypeOf
	} = requirePrimordials();
	duplex = Duplex;
	const Readable = requireReadable();
	const Writable = requireWritable();
	ObjectSetPrototypeOf(Duplex.prototype, Readable.prototype);
	ObjectSetPrototypeOf(Duplex, Readable);
	{
	  const keys = ObjectKeys(Writable.prototype);
	  // Allow the keys array to be GC'ed.
	  for (let i = 0; i < keys.length; i++) {
	    const method = keys[i];
	    if (!Duplex.prototype[method]) Duplex.prototype[method] = Writable.prototype[method];
	  }
	}
	function Duplex(options) {
	  if (!(this instanceof Duplex)) return new Duplex(options)
	  Readable.call(this, options);
	  Writable.call(this, options);
	  if (options) {
	    this.allowHalfOpen = options.allowHalfOpen !== false;
	    if (options.readable === false) {
	      this._readableState.readable = false;
	      this._readableState.ended = true;
	      this._readableState.endEmitted = true;
	    }
	    if (options.writable === false) {
	      this._writableState.writable = false;
	      this._writableState.ending = true;
	      this._writableState.ended = true;
	      this._writableState.finished = true;
	    }
	  } else {
	    this.allowHalfOpen = true;
	  }
	}
	ObjectDefineProperties(Duplex.prototype, {
	  writable: {
	    __proto__: null,
	    ...ObjectGetOwnPropertyDescriptor(Writable.prototype, 'writable')
	  },
	  writableHighWaterMark: {
	    __proto__: null,
	    ...ObjectGetOwnPropertyDescriptor(Writable.prototype, 'writableHighWaterMark')
	  },
	  writableObjectMode: {
	    __proto__: null,
	    ...ObjectGetOwnPropertyDescriptor(Writable.prototype, 'writableObjectMode')
	  },
	  writableBuffer: {
	    __proto__: null,
	    ...ObjectGetOwnPropertyDescriptor(Writable.prototype, 'writableBuffer')
	  },
	  writableLength: {
	    __proto__: null,
	    ...ObjectGetOwnPropertyDescriptor(Writable.prototype, 'writableLength')
	  },
	  writableFinished: {
	    __proto__: null,
	    ...ObjectGetOwnPropertyDescriptor(Writable.prototype, 'writableFinished')
	  },
	  writableCorked: {
	    __proto__: null,
	    ...ObjectGetOwnPropertyDescriptor(Writable.prototype, 'writableCorked')
	  },
	  writableEnded: {
	    __proto__: null,
	    ...ObjectGetOwnPropertyDescriptor(Writable.prototype, 'writableEnded')
	  },
	  writableNeedDrain: {
	    __proto__: null,
	    ...ObjectGetOwnPropertyDescriptor(Writable.prototype, 'writableNeedDrain')
	  },
	  destroyed: {
	    __proto__: null,
	    get() {
	      if (this._readableState === undefined || this._writableState === undefined) {
	        return false
	      }
	      return this._readableState.destroyed && this._writableState.destroyed
	    },
	    set(value) {
	      // Backward compatibility, the user is explicitly
	      // managing destroyed.
	      if (this._readableState && this._writableState) {
	        this._readableState.destroyed = value;
	        this._writableState.destroyed = value;
	      }
	    }
	  }
	});
	let webStreamsAdapters;

	// Lazy to avoid circular references
	function lazyWebStreams() {
	  if (webStreamsAdapters === undefined) webStreamsAdapters = {};
	  return webStreamsAdapters
	}
	Duplex.fromWeb = function (pair, options) {
	  return lazyWebStreams().newStreamDuplexFromReadableWritablePair(pair, options)
	};
	Duplex.toWeb = function (duplex) {
	  return lazyWebStreams().newReadableWritablePairFromDuplex(duplex)
	};
	let duplexify;
	Duplex.from = function (body) {
	  if (!duplexify) {
	    duplexify = requireDuplexify();
	  }
	  return duplexify(body, 'body')
	};
	return duplex;
}

var transform;
var hasRequiredTransform;

function requireTransform () {
	if (hasRequiredTransform) return transform;
	hasRequiredTransform = 1;

	const { ObjectSetPrototypeOf, Symbol } = requirePrimordials();
	transform = Transform;
	const { ERR_METHOD_NOT_IMPLEMENTED } = requireErrors().codes;
	const Duplex = requireDuplex();
	const { getHighWaterMark } = requireState();
	ObjectSetPrototypeOf(Transform.prototype, Duplex.prototype);
	ObjectSetPrototypeOf(Transform, Duplex);
	const kCallback = Symbol('kCallback');
	function Transform(options) {
	  if (!(this instanceof Transform)) return new Transform(options)

	  // TODO (ronag): This should preferably always be
	  // applied but would be semver-major. Or even better;
	  // make Transform a Readable with the Writable interface.
	  const readableHighWaterMark = options ? getHighWaterMark(this, options, 'readableHighWaterMark', true) : null;
	  if (readableHighWaterMark === 0) {
	    // A Duplex will buffer both on the writable and readable side while
	    // a Transform just wants to buffer hwm number of elements. To avoid
	    // buffering twice we disable buffering on the writable side.
	    options = {
	      ...options,
	      highWaterMark: null,
	      readableHighWaterMark,
	      // TODO (ronag): 0 is not optimal since we have
	      // a "bug" where we check needDrain before calling _write and not after.
	      // Refs: https://github.com/nodejs/node/pull/32887
	      // Refs: https://github.com/nodejs/node/pull/35941
	      writableHighWaterMark: options.writableHighWaterMark || 0
	    };
	  }
	  Duplex.call(this, options);

	  // We have implemented the _read method, and done the other things
	  // that Readable wants before the first _read call, so unset the
	  // sync guard flag.
	  this._readableState.sync = false;
	  this[kCallback] = null;
	  if (options) {
	    if (typeof options.transform === 'function') this._transform = options.transform;
	    if (typeof options.flush === 'function') this._flush = options.flush;
	  }

	  // When the writable side finishes, then flush out anything remaining.
	  // Backwards compat. Some Transform streams incorrectly implement _final
	  // instead of or in addition to _flush. By using 'prefinish' instead of
	  // implementing _final we continue supporting this unfortunate use case.
	  this.on('prefinish', prefinish);
	}
	function final(cb) {
	  if (typeof this._flush === 'function' && !this.destroyed) {
	    this._flush((er, data) => {
	      if (er) {
	        if (cb) {
	          cb(er);
	        } else {
	          this.destroy(er);
	        }
	        return
	      }
	      if (data != null) {
	        this.push(data);
	      }
	      this.push(null);
	      if (cb) {
	        cb();
	      }
	    });
	  } else {
	    this.push(null);
	    if (cb) {
	      cb();
	    }
	  }
	}
	function prefinish() {
	  if (this._final !== final) {
	    final.call(this);
	  }
	}
	Transform.prototype._final = final;
	Transform.prototype._transform = function (chunk, encoding, callback) {
	  throw new ERR_METHOD_NOT_IMPLEMENTED('_transform()')
	};
	Transform.prototype._write = function (chunk, encoding, callback) {
	  const rState = this._readableState;
	  const wState = this._writableState;
	  const length = rState.length;
	  this._transform(chunk, encoding, (err, val) => {
	    if (err) {
	      callback(err);
	      return
	    }
	    if (val != null) {
	      this.push(val);
	    }
	    if (
	      wState.ended ||
	      // Backwards compat.
	      length === rState.length ||
	      // Backwards compat.
	      rState.length < rState.highWaterMark
	    ) {
	      callback();
	    } else {
	      this[kCallback] = callback;
	    }
	  });
	};
	Transform.prototype._read = function () {
	  if (this[kCallback]) {
	    const callback = this[kCallback];
	    this[kCallback] = null;
	    callback();
	  }
	};
	return transform;
}

var passthrough;
var hasRequiredPassthrough;

function requirePassthrough () {
	if (hasRequiredPassthrough) return passthrough;
	hasRequiredPassthrough = 1;

	const { ObjectSetPrototypeOf } = requirePrimordials();
	passthrough = PassThrough;
	const Transform = requireTransform();
	ObjectSetPrototypeOf(PassThrough.prototype, Transform.prototype);
	ObjectSetPrototypeOf(PassThrough, Transform);
	function PassThrough(options) {
	  if (!(this instanceof PassThrough)) return new PassThrough(options)
	  Transform.call(this, options);
	}
	PassThrough.prototype._transform = function (chunk, encoding, cb) {
	  cb(null, chunk);
	};
	return passthrough;
}

/* replacement start */

var pipeline_1;
var hasRequiredPipeline;

function requirePipeline () {
	if (hasRequiredPipeline) return pipeline_1;
	hasRequiredPipeline = 1;
	const process = requireProcess()

	/* replacement end */
	// Ported from https://github.com/mafintosh/pump with
	// permission from the author, Mathias Buus (@mafintosh).

	;	const { ArrayIsArray, Promise, SymbolAsyncIterator } = requirePrimordials();
	const eos = requireEndOfStream();
	const { once } = requireUtil();
	const destroyImpl = requireDestroy();
	const Duplex = requireDuplex();
	const {
	  aggregateTwoErrors,
	  codes: {
	    ERR_INVALID_ARG_TYPE,
	    ERR_INVALID_RETURN_VALUE,
	    ERR_MISSING_ARGS,
	    ERR_STREAM_DESTROYED,
	    ERR_STREAM_PREMATURE_CLOSE
	  },
	  AbortError
	} = requireErrors();
	const { validateFunction, validateAbortSignal } = requireValidators();
	const {
	  isIterable,
	  isReadable,
	  isReadableNodeStream,
	  isNodeStream,
	  isTransformStream,
	  isWebStream,
	  isReadableStream,
	  isReadableEnded
	} = requireUtils();
	const AbortController = globalThis.AbortController || require$$0.AbortController;
	let PassThrough;
	let Readable;
	function destroyer(stream, reading, writing) {
	  let finished = false;
	  stream.on('close', () => {
	    finished = true;
	  });
	  const cleanup = eos(
	    stream,
	    {
	      readable: reading,
	      writable: writing
	    },
	    (err) => {
	      finished = !err;
	    }
	  );
	  return {
	    destroy: (err) => {
	      if (finished) return
	      finished = true;
	      destroyImpl.destroyer(stream, err || new ERR_STREAM_DESTROYED('pipe'));
	    },
	    cleanup
	  }
	}
	function popCallback(streams) {
	  // Streams should never be an empty array. It should always contain at least
	  // a single stream. Therefore optimize for the average case instead of
	  // checking for length === 0 as well.
	  validateFunction(streams[streams.length - 1], 'streams[stream.length - 1]');
	  return streams.pop()
	}
	function makeAsyncIterable(val) {
	  if (isIterable(val)) {
	    return val
	  } else if (isReadableNodeStream(val)) {
	    // Legacy streams are not Iterable.
	    return fromReadable(val)
	  }
	  throw new ERR_INVALID_ARG_TYPE('val', ['Readable', 'Iterable', 'AsyncIterable'], val)
	}
	async function* fromReadable(val) {
	  if (!Readable) {
	    Readable = requireReadable();
	  }
	  yield* Readable.prototype[SymbolAsyncIterator].call(val);
	}
	async function pumpToNode(iterable, writable, finish, { end }) {
	  let error;
	  let onresolve = null;
	  const resume = (err) => {
	    if (err) {
	      error = err;
	    }
	    if (onresolve) {
	      const callback = onresolve;
	      onresolve = null;
	      callback();
	    }
	  };
	  const wait = () =>
	    new Promise((resolve, reject) => {
	      if (error) {
	        reject(error);
	      } else {
	        onresolve = () => {
	          if (error) {
	            reject(error);
	          } else {
	            resolve();
	          }
	        };
	      }
	    });
	  writable.on('drain', resume);
	  const cleanup = eos(
	    writable,
	    {
	      readable: false
	    },
	    resume
	  );
	  try {
	    if (writable.writableNeedDrain) {
	      await wait();
	    }
	    for await (const chunk of iterable) {
	      if (!writable.write(chunk)) {
	        await wait();
	      }
	    }
	    if (end) {
	      writable.end();
	    }
	    await wait();
	    finish();
	  } catch (err) {
	    finish(error !== err ? aggregateTwoErrors(error, err) : err);
	  } finally {
	    cleanup();
	    writable.off('drain', resume);
	  }
	}
	async function pumpToWeb(readable, writable, finish, { end }) {
	  if (isTransformStream(writable)) {
	    writable = writable.writable;
	  }
	  // https://streams.spec.whatwg.org/#example-manual-write-with-backpressure
	  const writer = writable.getWriter();
	  try {
	    for await (const chunk of readable) {
	      await writer.ready;
	      writer.write(chunk).catch(() => {});
	    }
	    await writer.ready;
	    if (end) {
	      await writer.close();
	    }
	    finish();
	  } catch (err) {
	    try {
	      await writer.abort(err);
	      finish(err);
	    } catch (err) {
	      finish(err);
	    }
	  }
	}
	function pipeline(...streams) {
	  return pipelineImpl(streams, once(popCallback(streams)))
	}
	function pipelineImpl(streams, callback, opts) {
	  if (streams.length === 1 && ArrayIsArray(streams[0])) {
	    streams = streams[0];
	  }
	  if (streams.length < 2) {
	    throw new ERR_MISSING_ARGS('streams')
	  }
	  const ac = new AbortController();
	  const signal = ac.signal;
	  const outerSignal = opts === null || opts === undefined ? undefined : opts.signal;

	  // Need to cleanup event listeners if last stream is readable
	  // https://github.com/nodejs/node/issues/35452
	  const lastStreamCleanup = [];
	  validateAbortSignal(outerSignal, 'options.signal');
	  function abort() {
	    finishImpl(new AbortError());
	  }
	  outerSignal === null || outerSignal === undefined ? undefined : outerSignal.addEventListener('abort', abort);
	  let error;
	  let value;
	  const destroys = [];
	  let finishCount = 0;
	  function finish(err) {
	    finishImpl(err, --finishCount === 0);
	  }
	  function finishImpl(err, final) {
	    if (err && (!error || error.code === 'ERR_STREAM_PREMATURE_CLOSE')) {
	      error = err;
	    }
	    if (!error && !final) {
	      return
	    }
	    while (destroys.length) {
	      destroys.shift()(error);
	    }
	    outerSignal === null || outerSignal === undefined ? undefined : outerSignal.removeEventListener('abort', abort);
	    ac.abort();
	    if (final) {
	      if (!error) {
	        lastStreamCleanup.forEach((fn) => fn());
	      }
	      process.nextTick(callback, error, value);
	    }
	  }
	  let ret;
	  for (let i = 0; i < streams.length; i++) {
	    const stream = streams[i];
	    const reading = i < streams.length - 1;
	    const writing = i > 0;
	    const end = reading || (opts === null || opts === undefined ? undefined : opts.end) !== false;
	    const isLastStream = i === streams.length - 1;
	    if (isNodeStream(stream)) {
	      if (end) {
	        const { destroy, cleanup } = destroyer(stream, reading, writing);
	        destroys.push(destroy);
	        if (isReadable(stream) && isLastStream) {
	          lastStreamCleanup.push(cleanup);
	        }
	      }

	      // Catch stream errors that occur after pipe/pump has completed.
	      function onError(err) {
	        if (err && err.name !== 'AbortError' && err.code !== 'ERR_STREAM_PREMATURE_CLOSE') {
	          finish(err);
	        }
	      }
	      stream.on('error', onError);
	      if (isReadable(stream) && isLastStream) {
	        lastStreamCleanup.push(() => {
	          stream.removeListener('error', onError);
	        });
	      }
	    }
	    if (i === 0) {
	      if (typeof stream === 'function') {
	        ret = stream({
	          signal
	        });
	        if (!isIterable(ret)) {
	          throw new ERR_INVALID_RETURN_VALUE('Iterable, AsyncIterable or Stream', 'source', ret)
	        }
	      } else if (isIterable(stream) || isReadableNodeStream(stream) || isTransformStream(stream)) {
	        ret = stream;
	      } else {
	        ret = Duplex.from(stream);
	      }
	    } else if (typeof stream === 'function') {
	      if (isTransformStream(ret)) {
	        var _ret;
	        ret = makeAsyncIterable((_ret = ret) === null || _ret === undefined ? undefined : _ret.readable);
	      } else {
	        ret = makeAsyncIterable(ret);
	      }
	      ret = stream(ret, {
	        signal
	      });
	      if (reading) {
	        if (!isIterable(ret, true)) {
	          throw new ERR_INVALID_RETURN_VALUE('AsyncIterable', `transform[${i - 1}]`, ret)
	        }
	      } else {
	        var _ret2;
	        if (!PassThrough) {
	          PassThrough = requirePassthrough();
	        }

	        // If the last argument to pipeline is not a stream
	        // we must create a proxy stream so that pipeline(...)
	        // always returns a stream which can be further
	        // composed through `.pipe(stream)`.

	        const pt = new PassThrough({
	          objectMode: true
	        });

	        // Handle Promises/A+ spec, `then` could be a getter that throws on
	        // second use.
	        const then = (_ret2 = ret) === null || _ret2 === undefined ? undefined : _ret2.then;
	        if (typeof then === 'function') {
	          finishCount++;
	          then.call(
	            ret,
	            (val) => {
	              value = val;
	              if (val != null) {
	                pt.write(val);
	              }
	              if (end) {
	                pt.end();
	              }
	              process.nextTick(finish);
	            },
	            (err) => {
	              pt.destroy(err);
	              process.nextTick(finish, err);
	            }
	          );
	        } else if (isIterable(ret, true)) {
	          finishCount++;
	          pumpToNode(ret, pt, finish, {
	            end
	          });
	        } else if (isReadableStream(ret) || isTransformStream(ret)) {
	          const toRead = ret.readable || ret;
	          finishCount++;
	          pumpToNode(toRead, pt, finish, {
	            end
	          });
	        } else {
	          throw new ERR_INVALID_RETURN_VALUE('AsyncIterable or Promise', 'destination', ret)
	        }
	        ret = pt;
	        const { destroy, cleanup } = destroyer(ret, false, true);
	        destroys.push(destroy);
	        if (isLastStream) {
	          lastStreamCleanup.push(cleanup);
	        }
	      }
	    } else if (isNodeStream(stream)) {
	      if (isReadableNodeStream(ret)) {
	        finishCount += 2;
	        const cleanup = pipe(ret, stream, finish, {
	          end
	        });
	        if (isReadable(stream) && isLastStream) {
	          lastStreamCleanup.push(cleanup);
	        }
	      } else if (isTransformStream(ret) || isReadableStream(ret)) {
	        const toRead = ret.readable || ret;
	        finishCount++;
	        pumpToNode(toRead, stream, finish, {
	          end
	        });
	      } else if (isIterable(ret)) {
	        finishCount++;
	        pumpToNode(ret, stream, finish, {
	          end
	        });
	      } else {
	        throw new ERR_INVALID_ARG_TYPE(
	          'val',
	          ['Readable', 'Iterable', 'AsyncIterable', 'ReadableStream', 'TransformStream'],
	          ret
	        )
	      }
	      ret = stream;
	    } else if (isWebStream(stream)) {
	      if (isReadableNodeStream(ret)) {
	        finishCount++;
	        pumpToWeb(makeAsyncIterable(ret), stream, finish, {
	          end
	        });
	      } else if (isReadableStream(ret) || isIterable(ret)) {
	        finishCount++;
	        pumpToWeb(ret, stream, finish, {
	          end
	        });
	      } else if (isTransformStream(ret)) {
	        finishCount++;
	        pumpToWeb(ret.readable, stream, finish, {
	          end
	        });
	      } else {
	        throw new ERR_INVALID_ARG_TYPE(
	          'val',
	          ['Readable', 'Iterable', 'AsyncIterable', 'ReadableStream', 'TransformStream'],
	          ret
	        )
	      }
	      ret = stream;
	    } else {
	      ret = Duplex.from(stream);
	    }
	  }
	  if (
	    (signal !== null && signal !== undefined && signal.aborted) ||
	    (outerSignal !== null && outerSignal !== undefined && outerSignal.aborted)
	  ) {
	    process.nextTick(abort);
	  }
	  return ret
	}
	function pipe(src, dst, finish, { end }) {
	  let ended = false;
	  dst.on('close', () => {
	    if (!ended) {
	      // Finish if the destination closes before the source has completed.
	      finish(new ERR_STREAM_PREMATURE_CLOSE());
	    }
	  });
	  src.pipe(dst, {
	    end: false
	  }); // If end is true we already will have a listener to end dst.

	  if (end) {
	    // Compat. Before node v10.12.0 stdio used to throw an error so
	    // pipe() did/does not end() stdio destinations.
	    // Now they allow it but "secretly" don't close the underlying fd.

	    function endFn() {
	      ended = true;
	      dst.end();
	    }
	    if (isReadableEnded(src)) {
	      // End the destination if the source has already ended.
	      process.nextTick(endFn);
	    } else {
	      src.once('end', endFn);
	    }
	  } else {
	    finish();
	  }
	  eos(
	    src,
	    {
	      readable: true,
	      writable: false
	    },
	    (err) => {
	      const rState = src._readableState;
	      if (
	        err &&
	        err.code === 'ERR_STREAM_PREMATURE_CLOSE' &&
	        rState &&
	        rState.ended &&
	        !rState.errored &&
	        !rState.errorEmitted
	      ) {
	        // Some readable streams will emit 'close' before 'end'. However, since
	        // this is on the readable side 'end' should still be emitted if the
	        // stream has been ended and no error emitted. This should be allowed in
	        // favor of backwards compatibility. Since the stream is piped to a
	        // destination this should not result in any observable difference.
	        // We don't need to check if this is a writable premature close since
	        // eos will only fail with premature close on the reading side for
	        // duplex streams.
	        src.once('end', finish).once('error', finish);
	      } else {
	        finish(err);
	      }
	    }
	  );
	  return eos(
	    dst,
	    {
	      readable: false,
	      writable: true
	    },
	    finish
	  )
	}
	pipeline_1 = {
	  pipelineImpl,
	  pipeline
	};
	return pipeline_1;
}

var compose;
var hasRequiredCompose;

function requireCompose () {
	if (hasRequiredCompose) return compose;
	hasRequiredCompose = 1;

	const { pipeline } = requirePipeline();
	const Duplex = requireDuplex();
	const { destroyer } = requireDestroy();
	const {
	  isNodeStream,
	  isReadable,
	  isWritable,
	  isWebStream,
	  isTransformStream,
	  isWritableStream,
	  isReadableStream
	} = requireUtils();
	const {
	  AbortError,
	  codes: { ERR_INVALID_ARG_VALUE, ERR_MISSING_ARGS }
	} = requireErrors();
	const eos = requireEndOfStream();
	compose = function compose(...streams) {
	  if (streams.length === 0) {
	    throw new ERR_MISSING_ARGS('streams')
	  }
	  if (streams.length === 1) {
	    return Duplex.from(streams[0])
	  }
	  const orgStreams = [...streams];
	  if (typeof streams[0] === 'function') {
	    streams[0] = Duplex.from(streams[0]);
	  }
	  if (typeof streams[streams.length - 1] === 'function') {
	    const idx = streams.length - 1;
	    streams[idx] = Duplex.from(streams[idx]);
	  }
	  for (let n = 0; n < streams.length; ++n) {
	    if (!isNodeStream(streams[n]) && !isWebStream(streams[n])) {
	      // TODO(ronag): Add checks for non streams.
	      continue
	    }
	    if (
	      n < streams.length - 1 &&
	      !(isReadable(streams[n]) || isReadableStream(streams[n]) || isTransformStream(streams[n]))
	    ) {
	      throw new ERR_INVALID_ARG_VALUE(`streams[${n}]`, orgStreams[n], 'must be readable')
	    }
	    if (n > 0 && !(isWritable(streams[n]) || isWritableStream(streams[n]) || isTransformStream(streams[n]))) {
	      throw new ERR_INVALID_ARG_VALUE(`streams[${n}]`, orgStreams[n], 'must be writable')
	    }
	  }
	  let ondrain;
	  let onfinish;
	  let onreadable;
	  let onclose;
	  let d;
	  function onfinished(err) {
	    const cb = onclose;
	    onclose = null;
	    if (cb) {
	      cb(err);
	    } else if (err) {
	      d.destroy(err);
	    } else if (!readable && !writable) {
	      d.destroy();
	    }
	  }
	  const head = streams[0];
	  const tail = pipeline(streams, onfinished);
	  const writable = !!(isWritable(head) || isWritableStream(head) || isTransformStream(head));
	  const readable = !!(isReadable(tail) || isReadableStream(tail) || isTransformStream(tail));

	  // TODO(ronag): Avoid double buffering.
	  // Implement Writable/Readable/Duplex traits.
	  // See, https://github.com/nodejs/node/pull/33515.
	  d = new Duplex({
	    // TODO (ronag): highWaterMark?
	    writableObjectMode: !!(head !== null && head !== undefined && head.writableObjectMode),
	    readableObjectMode: !!(tail !== null && tail !== undefined && tail.writableObjectMode),
	    writable,
	    readable
	  });
	  if (writable) {
	    if (isNodeStream(head)) {
	      d._write = function (chunk, encoding, callback) {
	        if (head.write(chunk, encoding)) {
	          callback();
	        } else {
	          ondrain = callback;
	        }
	      };
	      d._final = function (callback) {
	        head.end();
	        onfinish = callback;
	      };
	      head.on('drain', function () {
	        if (ondrain) {
	          const cb = ondrain;
	          ondrain = null;
	          cb();
	        }
	      });
	    } else if (isWebStream(head)) {
	      const writable = isTransformStream(head) ? head.writable : head;
	      const writer = writable.getWriter();
	      d._write = async function (chunk, encoding, callback) {
	        try {
	          await writer.ready;
	          writer.write(chunk).catch(() => {});
	          callback();
	        } catch (err) {
	          callback(err);
	        }
	      };
	      d._final = async function (callback) {
	        try {
	          await writer.ready;
	          writer.close().catch(() => {});
	          onfinish = callback;
	        } catch (err) {
	          callback(err);
	        }
	      };
	    }
	    const toRead = isTransformStream(tail) ? tail.readable : tail;
	    eos(toRead, () => {
	      if (onfinish) {
	        const cb = onfinish;
	        onfinish = null;
	        cb();
	      }
	    });
	  }
	  if (readable) {
	    if (isNodeStream(tail)) {
	      tail.on('readable', function () {
	        if (onreadable) {
	          const cb = onreadable;
	          onreadable = null;
	          cb();
	        }
	      });
	      tail.on('end', function () {
	        d.push(null);
	      });
	      d._read = function () {
	        while (true) {
	          const buf = tail.read();
	          if (buf === null) {
	            onreadable = d._read;
	            return
	          }
	          if (!d.push(buf)) {
	            return
	          }
	        }
	      };
	    } else if (isWebStream(tail)) {
	      const readable = isTransformStream(tail) ? tail.readable : tail;
	      const reader = readable.getReader();
	      d._read = async function () {
	        while (true) {
	          try {
	            const { value, done } = await reader.read();
	            if (!d.push(value)) {
	              return
	            }
	            if (done) {
	              d.push(null);
	              return
	            }
	          } catch {
	            return
	          }
	        }
	      };
	    }
	  }
	  d._destroy = function (err, callback) {
	    if (!err && onclose !== null) {
	      err = new AbortError();
	    }
	    onreadable = null;
	    ondrain = null;
	    onfinish = null;
	    if (onclose === null) {
	      callback(err);
	    } else {
	      onclose = callback;
	      if (isNodeStream(tail)) {
	        destroyer(tail, err);
	      }
	    }
	  };
	  return d
	};
	return compose;
}

var hasRequiredOperators;

function requireOperators () {
	if (hasRequiredOperators) return operators;
	hasRequiredOperators = 1;

	const AbortController = globalThis.AbortController || require$$0.AbortController;
	const {
	  codes: { ERR_INVALID_ARG_VALUE, ERR_INVALID_ARG_TYPE, ERR_MISSING_ARGS, ERR_OUT_OF_RANGE },
	  AbortError
	} = requireErrors();
	const { validateAbortSignal, validateInteger, validateObject } = requireValidators();
	const kWeakHandler = requirePrimordials().Symbol('kWeak');
	const { finished } = requireEndOfStream();
	const staticCompose = requireCompose();
	const { addAbortSignalNoValidate } = requireAddAbortSignal();
	const { isWritable, isNodeStream } = requireUtils();
	const {
	  ArrayPrototypePush,
	  MathFloor,
	  Number,
	  NumberIsNaN,
	  Promise,
	  PromiseReject,
	  PromisePrototypeThen,
	  Symbol
	} = requirePrimordials();
	const kEmpty = Symbol('kEmpty');
	const kEof = Symbol('kEof');
	function compose(stream, options) {
	  if (options != null) {
	    validateObject(options, 'options');
	  }
	  if ((options === null || options === undefined ? undefined : options.signal) != null) {
	    validateAbortSignal(options.signal, 'options.signal');
	  }
	  if (isNodeStream(stream) && !isWritable(stream)) {
	    throw new ERR_INVALID_ARG_VALUE('stream', stream, 'must be writable')
	  }
	  const composedStream = staticCompose(this, stream);
	  if (options !== null && options !== undefined && options.signal) {
	    // Not validating as we already validated before
	    addAbortSignalNoValidate(options.signal, composedStream);
	  }
	  return composedStream
	}
	function map(fn, options) {
	  if (typeof fn !== 'function') {
	    throw new ERR_INVALID_ARG_TYPE('fn', ['Function', 'AsyncFunction'], fn)
	  }
	  if (options != null) {
	    validateObject(options, 'options');
	  }
	  if ((options === null || options === undefined ? undefined : options.signal) != null) {
	    validateAbortSignal(options.signal, 'options.signal');
	  }
	  let concurrency = 1;
	  if ((options === null || options === undefined ? undefined : options.concurrency) != null) {
	    concurrency = MathFloor(options.concurrency);
	  }
	  validateInteger(concurrency, 'concurrency', 1);
	  return async function* map() {
	    var _options$signal, _options$signal2;
	    const ac = new AbortController();
	    const stream = this;
	    const queue = [];
	    const signal = ac.signal;
	    const signalOpt = {
	      signal
	    };
	    const abort = () => ac.abort();
	    if (
	      options !== null &&
	      options !== undefined &&
	      (_options$signal = options.signal) !== null &&
	      _options$signal !== undefined &&
	      _options$signal.aborted
	    ) {
	      abort();
	    }
	    options === null || options === undefined
	      ? undefined
	      : (_options$signal2 = options.signal) === null || _options$signal2 === undefined
	      ? undefined
	      : _options$signal2.addEventListener('abort', abort);
	    let next;
	    let resume;
	    let done = false;
	    function onDone() {
	      done = true;
	    }
	    async function pump() {
	      try {
	        for await (let val of stream) {
	          var _val;
	          if (done) {
	            return
	          }
	          if (signal.aborted) {
	            throw new AbortError()
	          }
	          try {
	            val = fn(val, signalOpt);
	          } catch (err) {
	            val = PromiseReject(err);
	          }
	          if (val === kEmpty) {
	            continue
	          }
	          if (typeof ((_val = val) === null || _val === undefined ? undefined : _val.catch) === 'function') {
	            val.catch(onDone);
	          }
	          queue.push(val);
	          if (next) {
	            next();
	            next = null;
	          }
	          if (!done && queue.length && queue.length >= concurrency) {
	            await new Promise((resolve) => {
	              resume = resolve;
	            });
	          }
	        }
	        queue.push(kEof);
	      } catch (err) {
	        const val = PromiseReject(err);
	        PromisePrototypeThen(val, undefined, onDone);
	        queue.push(val);
	      } finally {
	        var _options$signal3;
	        done = true;
	        if (next) {
	          next();
	          next = null;
	        }
	        options === null || options === undefined
	          ? undefined
	          : (_options$signal3 = options.signal) === null || _options$signal3 === undefined
	          ? undefined
	          : _options$signal3.removeEventListener('abort', abort);
	      }
	    }
	    pump();
	    try {
	      while (true) {
	        while (queue.length > 0) {
	          const val = await queue[0];
	          if (val === kEof) {
	            return
	          }
	          if (signal.aborted) {
	            throw new AbortError()
	          }
	          if (val !== kEmpty) {
	            yield val;
	          }
	          queue.shift();
	          if (resume) {
	            resume();
	            resume = null;
	          }
	        }
	        await new Promise((resolve) => {
	          next = resolve;
	        });
	      }
	    } finally {
	      ac.abort();
	      done = true;
	      if (resume) {
	        resume();
	        resume = null;
	      }
	    }
	  }.call(this)
	}
	function asIndexedPairs(options = undefined) {
	  if (options != null) {
	    validateObject(options, 'options');
	  }
	  if ((options === null || options === undefined ? undefined : options.signal) != null) {
	    validateAbortSignal(options.signal, 'options.signal');
	  }
	  return async function* asIndexedPairs() {
	    let index = 0;
	    for await (const val of this) {
	      var _options$signal4;
	      if (
	        options !== null &&
	        options !== undefined &&
	        (_options$signal4 = options.signal) !== null &&
	        _options$signal4 !== undefined &&
	        _options$signal4.aborted
	      ) {
	        throw new AbortError({
	          cause: options.signal.reason
	        })
	      }
	      yield [index++, val];
	    }
	  }.call(this)
	}
	async function some(fn, options = undefined) {
	  for await (const unused of filter.call(this, fn, options)) {
	    return true
	  }
	  return false
	}
	async function every(fn, options = undefined) {
	  if (typeof fn !== 'function') {
	    throw new ERR_INVALID_ARG_TYPE('fn', ['Function', 'AsyncFunction'], fn)
	  }
	  // https://en.wikipedia.org/wiki/De_Morgan%27s_laws
	  return !(await some.call(
	    this,
	    async (...args) => {
	      return !(await fn(...args))
	    },
	    options
	  ))
	}
	async function find(fn, options) {
	  for await (const result of filter.call(this, fn, options)) {
	    return result
	  }
	  return undefined
	}
	async function forEach(fn, options) {
	  if (typeof fn !== 'function') {
	    throw new ERR_INVALID_ARG_TYPE('fn', ['Function', 'AsyncFunction'], fn)
	  }
	  async function forEachFn(value, options) {
	    await fn(value, options);
	    return kEmpty
	  }
	  // eslint-disable-next-line no-unused-vars
	  for await (const unused of map.call(this, forEachFn, options));
	}
	function filter(fn, options) {
	  if (typeof fn !== 'function') {
	    throw new ERR_INVALID_ARG_TYPE('fn', ['Function', 'AsyncFunction'], fn)
	  }
	  async function filterFn(value, options) {
	    if (await fn(value, options)) {
	      return value
	    }
	    return kEmpty
	  }
	  return map.call(this, filterFn, options)
	}

	// Specific to provide better error to reduce since the argument is only
	// missing if the stream has no items in it - but the code is still appropriate
	class ReduceAwareErrMissingArgs extends ERR_MISSING_ARGS {
	  constructor() {
	    super('reduce');
	    this.message = 'Reduce of an empty stream requires an initial value';
	  }
	}
	async function reduce(reducer, initialValue, options) {
	  var _options$signal5;
	  if (typeof reducer !== 'function') {
	    throw new ERR_INVALID_ARG_TYPE('reducer', ['Function', 'AsyncFunction'], reducer)
	  }
	  if (options != null) {
	    validateObject(options, 'options');
	  }
	  if ((options === null || options === undefined ? undefined : options.signal) != null) {
	    validateAbortSignal(options.signal, 'options.signal');
	  }
	  let hasInitialValue = arguments.length > 1;
	  if (
	    options !== null &&
	    options !== undefined &&
	    (_options$signal5 = options.signal) !== null &&
	    _options$signal5 !== undefined &&
	    _options$signal5.aborted
	  ) {
	    const err = new AbortError(undefined, {
	      cause: options.signal.reason
	    });
	    this.once('error', () => {}); // The error is already propagated
	    await finished(this.destroy(err));
	    throw err
	  }
	  const ac = new AbortController();
	  const signal = ac.signal;
	  if (options !== null && options !== undefined && options.signal) {
	    const opts = {
	      once: true,
	      [kWeakHandler]: this
	    };
	    options.signal.addEventListener('abort', () => ac.abort(), opts);
	  }
	  let gotAnyItemFromStream = false;
	  try {
	    for await (const value of this) {
	      var _options$signal6;
	      gotAnyItemFromStream = true;
	      if (
	        options !== null &&
	        options !== undefined &&
	        (_options$signal6 = options.signal) !== null &&
	        _options$signal6 !== undefined &&
	        _options$signal6.aborted
	      ) {
	        throw new AbortError()
	      }
	      if (!hasInitialValue) {
	        initialValue = value;
	        hasInitialValue = true;
	      } else {
	        initialValue = await reducer(initialValue, value, {
	          signal
	        });
	      }
	    }
	    if (!gotAnyItemFromStream && !hasInitialValue) {
	      throw new ReduceAwareErrMissingArgs()
	    }
	  } finally {
	    ac.abort();
	  }
	  return initialValue
	}
	async function toArray(options) {
	  if (options != null) {
	    validateObject(options, 'options');
	  }
	  if ((options === null || options === undefined ? undefined : options.signal) != null) {
	    validateAbortSignal(options.signal, 'options.signal');
	  }
	  const result = [];
	  for await (const val of this) {
	    var _options$signal7;
	    if (
	      options !== null &&
	      options !== undefined &&
	      (_options$signal7 = options.signal) !== null &&
	      _options$signal7 !== undefined &&
	      _options$signal7.aborted
	    ) {
	      throw new AbortError(undefined, {
	        cause: options.signal.reason
	      })
	    }
	    ArrayPrototypePush(result, val);
	  }
	  return result
	}
	function flatMap(fn, options) {
	  const values = map.call(this, fn, options);
	  return async function* flatMap() {
	    for await (const val of values) {
	      yield* val;
	    }
	  }.call(this)
	}
	function toIntegerOrInfinity(number) {
	  // We coerce here to align with the spec
	  // https://github.com/tc39/proposal-iterator-helpers/issues/169
	  number = Number(number);
	  if (NumberIsNaN(number)) {
	    return 0
	  }
	  if (number < 0) {
	    throw new ERR_OUT_OF_RANGE('number', '>= 0', number)
	  }
	  return number
	}
	function drop(number, options = undefined) {
	  if (options != null) {
	    validateObject(options, 'options');
	  }
	  if ((options === null || options === undefined ? undefined : options.signal) != null) {
	    validateAbortSignal(options.signal, 'options.signal');
	  }
	  number = toIntegerOrInfinity(number);
	  return async function* drop() {
	    var _options$signal8;
	    if (
	      options !== null &&
	      options !== undefined &&
	      (_options$signal8 = options.signal) !== null &&
	      _options$signal8 !== undefined &&
	      _options$signal8.aborted
	    ) {
	      throw new AbortError()
	    }
	    for await (const val of this) {
	      var _options$signal9;
	      if (
	        options !== null &&
	        options !== undefined &&
	        (_options$signal9 = options.signal) !== null &&
	        _options$signal9 !== undefined &&
	        _options$signal9.aborted
	      ) {
	        throw new AbortError()
	      }
	      if (number-- <= 0) {
	        yield val;
	      }
	    }
	  }.call(this)
	}
	function take(number, options = undefined) {
	  if (options != null) {
	    validateObject(options, 'options');
	  }
	  if ((options === null || options === undefined ? undefined : options.signal) != null) {
	    validateAbortSignal(options.signal, 'options.signal');
	  }
	  number = toIntegerOrInfinity(number);
	  return async function* take() {
	    var _options$signal10;
	    if (
	      options !== null &&
	      options !== undefined &&
	      (_options$signal10 = options.signal) !== null &&
	      _options$signal10 !== undefined &&
	      _options$signal10.aborted
	    ) {
	      throw new AbortError()
	    }
	    for await (const val of this) {
	      var _options$signal11;
	      if (
	        options !== null &&
	        options !== undefined &&
	        (_options$signal11 = options.signal) !== null &&
	        _options$signal11 !== undefined &&
	        _options$signal11.aborted
	      ) {
	        throw new AbortError()
	      }
	      if (number-- > 0) {
	        yield val;
	      } else {
	        return
	      }
	    }
	  }.call(this)
	}
	operators.streamReturningOperators = {
	  asIndexedPairs,
	  drop,
	  filter,
	  flatMap,
	  map,
	  take,
	  compose
	};
	operators.promiseReturningOperators = {
	  every,
	  forEach,
	  reduce,
	  toArray,
	  some,
	  find
	};
	return operators;
}

var promises;
var hasRequiredPromises;

function requirePromises () {
	if (hasRequiredPromises) return promises;
	hasRequiredPromises = 1;

	const { ArrayPrototypePop, Promise } = requirePrimordials();
	const { isIterable, isNodeStream, isWebStream } = requireUtils();
	const { pipelineImpl: pl } = requirePipeline();
	const { finished } = requireEndOfStream();

	function pipeline(...streams) {
	  return new Promise((resolve, reject) => {
	    let signal;
	    let end;
	    const lastArg = streams[streams.length - 1];
	    if (
	      lastArg &&
	      typeof lastArg === 'object' &&
	      !isNodeStream(lastArg) &&
	      !isIterable(lastArg) &&
	      !isWebStream(lastArg)
	    ) {
	      const options = ArrayPrototypePop(streams);
	      signal = options.signal;
	      end = options.end;
	    }
	    pl(
	      streams,
	      (err, value) => {
	        if (err) {
	          reject(err);
	        } else {
	          resolve(value);
	        }
	      },
	      {
	        signal,
	        end
	      }
	    );
	  })
	}
	promises = {
	  finished,
	  pipeline
	};
	return promises;
}

/* replacement start */

var hasRequiredStream;

function requireStream () {
	if (hasRequiredStream) return stream.exports;
	hasRequiredStream = 1;
	const { Buffer } = require$$4

	/* replacement end */
	// Copyright Joyent, Inc. and other Node contributors.
	//
	// Permission is hereby granted, free of charge, to any person obtaining a
	// copy of this software and associated documentation files (the
	// "Software"), to deal in the Software without restriction, including
	// without limitation the rights to use, copy, modify, merge, publish,
	// distribute, sublicense, and/or sell copies of the Software, and to permit
	// persons to whom the Software is furnished to do so, subject to the
	// following conditions:
	//
	// The above copyright notice and this permission notice shall be included
	// in all copies or substantial portions of the Software.
	//
	// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
	// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
	// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
	// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
	// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
	// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
	// USE OR OTHER DEALINGS IN THE SOFTWARE.

	;	const { ObjectDefineProperty, ObjectKeys, ReflectApply } = requirePrimordials();
	const {
	  promisify: { custom: customPromisify }
	} = requireUtil();
	const { streamReturningOperators, promiseReturningOperators } = requireOperators();
	const {
	  codes: { ERR_ILLEGAL_CONSTRUCTOR }
	} = requireErrors();
	const compose = requireCompose();
	const { pipeline } = requirePipeline();
	const { destroyer } = requireDestroy();
	const eos = requireEndOfStream();
	const promises = requirePromises();
	const utils = requireUtils();
	const Stream = (stream.exports = requireLegacy().Stream);
	Stream.isDisturbed = utils.isDisturbed;
	Stream.isErrored = utils.isErrored;
	Stream.isReadable = utils.isReadable;
	Stream.Readable = requireReadable();
	for (const key of ObjectKeys(streamReturningOperators)) {
	  const op = streamReturningOperators[key];
	  function fn(...args) {
	    if (new.target) {
	      throw ERR_ILLEGAL_CONSTRUCTOR()
	    }
	    return Stream.Readable.from(ReflectApply(op, this, args))
	  }
	  ObjectDefineProperty(fn, 'name', {
	    __proto__: null,
	    value: op.name
	  });
	  ObjectDefineProperty(fn, 'length', {
	    __proto__: null,
	    value: op.length
	  });
	  ObjectDefineProperty(Stream.Readable.prototype, key, {
	    __proto__: null,
	    value: fn,
	    enumerable: false,
	    configurable: true,
	    writable: true
	  });
	}
	for (const key of ObjectKeys(promiseReturningOperators)) {
	  const op = promiseReturningOperators[key];
	  function fn(...args) {
	    if (new.target) {
	      throw ERR_ILLEGAL_CONSTRUCTOR()
	    }
	    return ReflectApply(op, this, args)
	  }
	  ObjectDefineProperty(fn, 'name', {
	    __proto__: null,
	    value: op.name
	  });
	  ObjectDefineProperty(fn, 'length', {
	    __proto__: null,
	    value: op.length
	  });
	  ObjectDefineProperty(Stream.Readable.prototype, key, {
	    __proto__: null,
	    value: fn,
	    enumerable: false,
	    configurable: true,
	    writable: true
	  });
	}
	Stream.Writable = requireWritable();
	Stream.Duplex = requireDuplex();
	Stream.Transform = requireTransform();
	Stream.PassThrough = requirePassthrough();
	Stream.pipeline = pipeline;
	const { addAbortSignal } = requireAddAbortSignal();
	Stream.addAbortSignal = addAbortSignal;
	Stream.finished = eos;
	Stream.destroy = destroyer;
	Stream.compose = compose;
	ObjectDefineProperty(Stream, 'promises', {
	  __proto__: null,
	  configurable: true,
	  enumerable: true,
	  get() {
	    return promises
	  }
	});
	ObjectDefineProperty(pipeline, customPromisify, {
	  __proto__: null,
	  enumerable: true,
	  get() {
	    return promises.pipeline
	  }
	});
	ObjectDefineProperty(eos, customPromisify, {
	  __proto__: null,
	  enumerable: true,
	  get() {
	    return promises.finished
	  }
	});

	// Backwards-compat with node 0.4.x
	Stream.Stream = Stream;
	Stream._isUint8Array = function isUint8Array(value) {
	  return value instanceof Uint8Array
	};
	Stream._uint8ArrayToBuffer = function _uint8ArrayToBuffer(chunk) {
	  return Buffer.from(chunk.buffer, chunk.byteOffset, chunk.byteLength)
	};
	return stream.exports;
}

ours.exports;

(function (module) {

	const Stream = require$$0$1;
	if (Stream && process.env.READABLE_STREAM === 'disable') {
	  const promises = Stream.promises;

	  // Explicit export naming is needed for ESM
	  module.exports._uint8ArrayToBuffer = Stream._uint8ArrayToBuffer;
	  module.exports._isUint8Array = Stream._isUint8Array;
	  module.exports.isDisturbed = Stream.isDisturbed;
	  module.exports.isErrored = Stream.isErrored;
	  module.exports.isReadable = Stream.isReadable;
	  module.exports.Readable = Stream.Readable;
	  module.exports.Writable = Stream.Writable;
	  module.exports.Duplex = Stream.Duplex;
	  module.exports.Transform = Stream.Transform;
	  module.exports.PassThrough = Stream.PassThrough;
	  module.exports.addAbortSignal = Stream.addAbortSignal;
	  module.exports.finished = Stream.finished;
	  module.exports.destroy = Stream.destroy;
	  module.exports.pipeline = Stream.pipeline;
	  module.exports.compose = Stream.compose;
	  Object.defineProperty(Stream, 'promises', {
	    configurable: true,
	    enumerable: true,
	    get() {
	      return promises
	    }
	  });
	  module.exports.Stream = Stream.Stream;
	} else {
	  const CustomStream = requireStream();
	  const promises = requirePromises();
	  const originalDestroy = CustomStream.Readable.destroy;
	  module.exports = CustomStream.Readable;

	  // Explicit export naming is needed for ESM
	  module.exports._uint8ArrayToBuffer = CustomStream._uint8ArrayToBuffer;
	  module.exports._isUint8Array = CustomStream._isUint8Array;
	  module.exports.isDisturbed = CustomStream.isDisturbed;
	  module.exports.isErrored = CustomStream.isErrored;
	  module.exports.isReadable = CustomStream.isReadable;
	  module.exports.Readable = CustomStream.Readable;
	  module.exports.Writable = CustomStream.Writable;
	  module.exports.Duplex = CustomStream.Duplex;
	  module.exports.Transform = CustomStream.Transform;
	  module.exports.PassThrough = CustomStream.PassThrough;
	  module.exports.addAbortSignal = CustomStream.addAbortSignal;
	  module.exports.finished = CustomStream.finished;
	  module.exports.destroy = CustomStream.destroy;
	  module.exports.destroy = originalDestroy;
	  module.exports.pipeline = CustomStream.pipeline;
	  module.exports.compose = CustomStream.compose;
	  Object.defineProperty(CustomStream, 'promises', {
	    configurable: true,
	    enumerable: true,
	    get() {
	      return promises
	    }
	  });
	  module.exports.Stream = CustomStream.Stream;
	}

	// Allow default importing
	module.exports.default = module.exports; 
} (ours));

var oursExports = ours.exports;

const metadata = Symbol.for('pino.metadata');
const split = split2;
const { Duplex } = oursExports;

var pinoAbstractTransport = function build (fn, opts = {}) {
  const parseLines = opts.parse === 'lines';
  const parseLine = typeof opts.parseLine === 'function' ? opts.parseLine : JSON.parse;
  const close = opts.close || defaultClose;
  const stream = split(function (line) {
    let value;

    try {
      value = parseLine(line);
    } catch (error) {
      this.emit('unknown', line, error);
      return
    }

    if (value === null) {
      this.emit('unknown', line, 'Null value ignored');
      return
    }

    if (typeof value !== 'object') {
      value = {
        data: value,
        time: Date.now()
      };
    }

    if (stream[metadata]) {
      stream.lastTime = value.time;
      stream.lastLevel = value.level;
      stream.lastObj = value;
    }

    if (parseLines) {
      return line
    }

    return value
  }, { autoDestroy: true });

  stream._destroy = function (err, cb) {
    const promise = close(err, cb);
    if (promise && typeof promise.then === 'function') {
      promise.then(cb, cb);
    }
  };

  if (opts.metadata !== false) {
    stream[metadata] = true;
    stream.lastTime = 0;
    stream.lastLevel = 0;
    stream.lastObj = null;
  }

  let res = fn(stream);

  if (res && typeof res.catch === 'function') {
    res.catch((err) => {
      stream.destroy(err);
    });

    // set it to null to not retain a reference to the promise
    res = null;
  } else if (opts.enablePipelining && res) {
    return Duplex.from({ writable: stream, readable: res, objectMode: true })
  }

  return stream
};

function defaultClose (err, cb) {
  process.nextTick(cb, err);
}

var prettierBytes_1 = prettierBytes;

function prettierBytes (num) {
  if (typeof num !== 'number' || isNaN(num)) {
    throw new TypeError('Expected a number, got ' + typeof num)
  }

  var neg = num < 0;
  var units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

  if (neg) {
    num = -num;
  }

  if (num < 1) {
    return (neg ? '-' : '') + num + ' B'
  }

  var exponent = Math.min(Math.floor(Math.log(num) / Math.log(1000)), units.length - 1);
  num = Number(num / Math.pow(1000, exponent));
  var unit = units[exponent];

  if (num >= 10 || num % 1 === 0) {
    // Do not show decimals when the number is two-digit, or if the number has no
    // decimal component.
    return (neg ? '-' : '') + num.toFixed(0) + ' ' + unit
  } else {
    return (neg ? '-' : '') + num.toFixed(1) + ' ' + unit
  }
}

function Parse (data) {
  if (!(this instanceof Parse)) {
    return new Parse(data)
  }
  this.err = null;
  this.value = null;
  try {
    this.value = JSON.parse(data);
  } catch (err) {
    this.err = err;
  }
}

var parse = Parse;

var hasUnicode$1 = {exports: {}};

var os$1 = require$$0$2;

hasUnicode$1.exports = function () {
  // Recent Win32 platforms (>XP) CAN support unicode in the console but
  // don't have to, and in non-english locales often use traditional local
  // code pages. There's no way, short of windows system calls or execing
  // the chcp command line program to figure this out. As such, we default
  // this to false and encourage your users to override it via config if
  // appropriate.
  if (os$1.type() == "Windows_NT") { return false }

  var isUTF8 = /UTF-?8$/i;
  var ctype = process.env.LC_ALL || process.env.LC_CTYPE || process.env.LANG;
  return isUTF8.test(ctype)
};

var hasUnicodeExports = hasUnicode$1.exports;

var parseMs = milliseconds => {
	if (typeof milliseconds !== 'number') {
		throw new TypeError('Expected a number');
	}

	const roundTowardsZero = milliseconds > 0 ? Math.floor : Math.ceil;

	return {
		days: roundTowardsZero(milliseconds / 86400000),
		hours: roundTowardsZero(milliseconds / 3600000) % 24,
		minutes: roundTowardsZero(milliseconds / 60000) % 60,
		seconds: roundTowardsZero(milliseconds / 1000) % 60,
		milliseconds: roundTowardsZero(milliseconds) % 1000,
		microseconds: roundTowardsZero(milliseconds * 1000) % 1000,
		nanoseconds: roundTowardsZero(milliseconds * 1e6) % 1000
	};
};

const parseMilliseconds = parseMs;

const pluralize = (word, count) => count === 1 ? word : word + 's';

var prettyMs$1 = (milliseconds, options = {}) => {
	if (!Number.isFinite(milliseconds)) {
		throw new TypeError('Expected a finite number');
	}

	if (options.compact) {
		options.secondsDecimalDigits = 0;
		options.millisecondsDecimalDigits = 0;
	}

	const result = [];

	const add = (value, long, short, valueString) => {
		if (value === 0) {
			return;
		}

		const postfix = options.verbose ? ' ' + pluralize(long, value) : short;

		result.push((valueString || value) + postfix);
	};

	const secondsDecimalDigits =
		typeof options.secondsDecimalDigits === 'number' ?
			options.secondsDecimalDigits :
			1;

	if (secondsDecimalDigits < 1) {
		const difference = 1000 - (milliseconds % 1000);
		if (difference < 500) {
			milliseconds += difference;
		}
	}

	const parsed = parseMilliseconds(milliseconds);

	add(Math.trunc(parsed.days / 365), 'year', 'y');
	add(parsed.days % 365, 'day', 'd');
	add(parsed.hours, 'hour', 'h');
	add(parsed.minutes, 'minute', 'm');

	if (
		options.separateMilliseconds ||
		options.formatSubMilliseconds ||
		milliseconds < 1000
	) {
		add(parsed.seconds, 'second', 's');
		if (options.formatSubMilliseconds) {
			add(parsed.milliseconds, 'millisecond', 'ms');
			add(parsed.microseconds, 'microsecond', 'µs');
			add(parsed.nanoseconds, 'nanosecond', 'ns');
		} else {
			const millisecondsAndBelow =
				parsed.milliseconds +
				(parsed.microseconds / 1000) +
				(parsed.nanoseconds / 1e6);

			const millisecondsDecimalDigits =
				typeof options.millisecondsDecimalDigits === 'number' ?
					options.millisecondsDecimalDigits :
					0;

			const millisecondsString = millisecondsDecimalDigits ?
				millisecondsAndBelow.toFixed(millisecondsDecimalDigits) :
				Math.ceil(millisecondsAndBelow);

			add(
				parseFloat(millisecondsString, 10),
				'millisecond',
				'ms',
				millisecondsString
			);
		}
	} else {
		const seconds = (milliseconds / 1000) % 60;
		const secondsDecimalDigits =
			typeof options.secondsDecimalDigits === 'number' ?
				options.secondsDecimalDigits :
				1;
		const secondsFixed = seconds.toFixed(secondsDecimalDigits);
		const secondsString = options.keepDecimalsOnWholeSeconds ?
			secondsFixed :
			secondsFixed.replace(/\.0+$/, '');
		add(parseFloat(secondsString, 10), 'second', 's', secondsString);
	}

	if (result.length === 0) {
		return '0' + (options.verbose ? ' milliseconds' : 'ms');
	}

	if (options.compact) {
		return '~' + result[0];
	}

	if (typeof options.unitCount === 'number') {
		return '~' + result.slice(0, Math.max(options.unitCount, 1)).join(' ');
	}

	return result.join(' ');
};

/*!
 * repeat-string <https://github.com/jonschlinkert/repeat-string>
 *
 * Copyright (c) 2014-2015, Jon Schlinkert.
 * Licensed under the MIT License.
 */

/**
 * Results cache
 */

var res = '';
var cache;

/**
 * Expose `repeat`
 */

var repeatString = repeat$2;

/**
 * Repeat the given `string` the specified `number`
 * of times.
 *
 * **Example:**
 *
 * ```js
 * var repeat = require('repeat-string');
 * repeat('A', 5);
 * //=> AAAAA
 * ```
 *
 * @param {String} `string` The string to repeat
 * @param {Number} `number` The number of times to repeat the string
 * @return {String} Repeated string
 * @api public
 */

function repeat$2(str, num) {
  if (typeof str !== 'string') {
    throw new TypeError('expected a string');
  }

  // cover common, quick use cases
  if (num === 1) return str;
  if (num === 2) return str + str;

  var max = str.length * num;
  if (cache !== str || typeof cache === 'undefined') {
    cache = str;
    res = '';
  } else if (res.length >= max) {
    return res.substr(0, max);
  }

  while (max > res.length && num > 1) {
    if (num & 1) {
      res += str;
    }

    num >>= 1;
    str += str;
  }

  res += str;
  res = res.substr(0, max);
  return res;
}

/*!
 * pad-left <https://github.com/jonschlinkert/pad-left>
 *
 * Copyright (c) 2014-2015, Jon Schlinkert.
 * Licensed under the MIT license.
 */

var repeat$1 = repeatString;

var padLeft$1 = function padLeft(str, num, ch) {
  str = str.toString();

  if (typeof num === 'undefined') {
    return str;
  }

  if (ch === 0) {
    ch = '0';
  } else if (ch) {
    ch = ch.toString();
  } else {
    ch = ' ';
  }

  return repeat$1(ch, num - str.length) + str;
};

var ansiStyles$1 = {exports: {}};

var colorName;
var hasRequiredColorName;

function requireColorName () {
	if (hasRequiredColorName) return colorName;
	hasRequiredColorName = 1;

	colorName = {
		"aliceblue": [240, 248, 255],
		"antiquewhite": [250, 235, 215],
		"aqua": [0, 255, 255],
		"aquamarine": [127, 255, 212],
		"azure": [240, 255, 255],
		"beige": [245, 245, 220],
		"bisque": [255, 228, 196],
		"black": [0, 0, 0],
		"blanchedalmond": [255, 235, 205],
		"blue": [0, 0, 255],
		"blueviolet": [138, 43, 226],
		"brown": [165, 42, 42],
		"burlywood": [222, 184, 135],
		"cadetblue": [95, 158, 160],
		"chartreuse": [127, 255, 0],
		"chocolate": [210, 105, 30],
		"coral": [255, 127, 80],
		"cornflowerblue": [100, 149, 237],
		"cornsilk": [255, 248, 220],
		"crimson": [220, 20, 60],
		"cyan": [0, 255, 255],
		"darkblue": [0, 0, 139],
		"darkcyan": [0, 139, 139],
		"darkgoldenrod": [184, 134, 11],
		"darkgray": [169, 169, 169],
		"darkgreen": [0, 100, 0],
		"darkgrey": [169, 169, 169],
		"darkkhaki": [189, 183, 107],
		"darkmagenta": [139, 0, 139],
		"darkolivegreen": [85, 107, 47],
		"darkorange": [255, 140, 0],
		"darkorchid": [153, 50, 204],
		"darkred": [139, 0, 0],
		"darksalmon": [233, 150, 122],
		"darkseagreen": [143, 188, 143],
		"darkslateblue": [72, 61, 139],
		"darkslategray": [47, 79, 79],
		"darkslategrey": [47, 79, 79],
		"darkturquoise": [0, 206, 209],
		"darkviolet": [148, 0, 211],
		"deeppink": [255, 20, 147],
		"deepskyblue": [0, 191, 255],
		"dimgray": [105, 105, 105],
		"dimgrey": [105, 105, 105],
		"dodgerblue": [30, 144, 255],
		"firebrick": [178, 34, 34],
		"floralwhite": [255, 250, 240],
		"forestgreen": [34, 139, 34],
		"fuchsia": [255, 0, 255],
		"gainsboro": [220, 220, 220],
		"ghostwhite": [248, 248, 255],
		"gold": [255, 215, 0],
		"goldenrod": [218, 165, 32],
		"gray": [128, 128, 128],
		"green": [0, 128, 0],
		"greenyellow": [173, 255, 47],
		"grey": [128, 128, 128],
		"honeydew": [240, 255, 240],
		"hotpink": [255, 105, 180],
		"indianred": [205, 92, 92],
		"indigo": [75, 0, 130],
		"ivory": [255, 255, 240],
		"khaki": [240, 230, 140],
		"lavender": [230, 230, 250],
		"lavenderblush": [255, 240, 245],
		"lawngreen": [124, 252, 0],
		"lemonchiffon": [255, 250, 205],
		"lightblue": [173, 216, 230],
		"lightcoral": [240, 128, 128],
		"lightcyan": [224, 255, 255],
		"lightgoldenrodyellow": [250, 250, 210],
		"lightgray": [211, 211, 211],
		"lightgreen": [144, 238, 144],
		"lightgrey": [211, 211, 211],
		"lightpink": [255, 182, 193],
		"lightsalmon": [255, 160, 122],
		"lightseagreen": [32, 178, 170],
		"lightskyblue": [135, 206, 250],
		"lightslategray": [119, 136, 153],
		"lightslategrey": [119, 136, 153],
		"lightsteelblue": [176, 196, 222],
		"lightyellow": [255, 255, 224],
		"lime": [0, 255, 0],
		"limegreen": [50, 205, 50],
		"linen": [250, 240, 230],
		"magenta": [255, 0, 255],
		"maroon": [128, 0, 0],
		"mediumaquamarine": [102, 205, 170],
		"mediumblue": [0, 0, 205],
		"mediumorchid": [186, 85, 211],
		"mediumpurple": [147, 112, 219],
		"mediumseagreen": [60, 179, 113],
		"mediumslateblue": [123, 104, 238],
		"mediumspringgreen": [0, 250, 154],
		"mediumturquoise": [72, 209, 204],
		"mediumvioletred": [199, 21, 133],
		"midnightblue": [25, 25, 112],
		"mintcream": [245, 255, 250],
		"mistyrose": [255, 228, 225],
		"moccasin": [255, 228, 181],
		"navajowhite": [255, 222, 173],
		"navy": [0, 0, 128],
		"oldlace": [253, 245, 230],
		"olive": [128, 128, 0],
		"olivedrab": [107, 142, 35],
		"orange": [255, 165, 0],
		"orangered": [255, 69, 0],
		"orchid": [218, 112, 214],
		"palegoldenrod": [238, 232, 170],
		"palegreen": [152, 251, 152],
		"paleturquoise": [175, 238, 238],
		"palevioletred": [219, 112, 147],
		"papayawhip": [255, 239, 213],
		"peachpuff": [255, 218, 185],
		"peru": [205, 133, 63],
		"pink": [255, 192, 203],
		"plum": [221, 160, 221],
		"powderblue": [176, 224, 230],
		"purple": [128, 0, 128],
		"rebeccapurple": [102, 51, 153],
		"red": [255, 0, 0],
		"rosybrown": [188, 143, 143],
		"royalblue": [65, 105, 225],
		"saddlebrown": [139, 69, 19],
		"salmon": [250, 128, 114],
		"sandybrown": [244, 164, 96],
		"seagreen": [46, 139, 87],
		"seashell": [255, 245, 238],
		"sienna": [160, 82, 45],
		"silver": [192, 192, 192],
		"skyblue": [135, 206, 235],
		"slateblue": [106, 90, 205],
		"slategray": [112, 128, 144],
		"slategrey": [112, 128, 144],
		"snow": [255, 250, 250],
		"springgreen": [0, 255, 127],
		"steelblue": [70, 130, 180],
		"tan": [210, 180, 140],
		"teal": [0, 128, 128],
		"thistle": [216, 191, 216],
		"tomato": [255, 99, 71],
		"turquoise": [64, 224, 208],
		"violet": [238, 130, 238],
		"wheat": [245, 222, 179],
		"white": [255, 255, 255],
		"whitesmoke": [245, 245, 245],
		"yellow": [255, 255, 0],
		"yellowgreen": [154, 205, 50]
	};
	return colorName;
}

/* MIT license */

var conversions;
var hasRequiredConversions;

function requireConversions () {
	if (hasRequiredConversions) return conversions;
	hasRequiredConversions = 1;
	/* eslint-disable no-mixed-operators */
	const cssKeywords = requireColorName();

	// NOTE: conversions should only return primitive values (i.e. arrays, or
	//       values that give correct `typeof` results).
	//       do not use box values types (i.e. Number(), String(), etc.)

	const reverseKeywords = {};
	for (const key of Object.keys(cssKeywords)) {
		reverseKeywords[cssKeywords[key]] = key;
	}

	const convert = {
		rgb: {channels: 3, labels: 'rgb'},
		hsl: {channels: 3, labels: 'hsl'},
		hsv: {channels: 3, labels: 'hsv'},
		hwb: {channels: 3, labels: 'hwb'},
		cmyk: {channels: 4, labels: 'cmyk'},
		xyz: {channels: 3, labels: 'xyz'},
		lab: {channels: 3, labels: 'lab'},
		lch: {channels: 3, labels: 'lch'},
		hex: {channels: 1, labels: ['hex']},
		keyword: {channels: 1, labels: ['keyword']},
		ansi16: {channels: 1, labels: ['ansi16']},
		ansi256: {channels: 1, labels: ['ansi256']},
		hcg: {channels: 3, labels: ['h', 'c', 'g']},
		apple: {channels: 3, labels: ['r16', 'g16', 'b16']},
		gray: {channels: 1, labels: ['gray']}
	};

	conversions = convert;

	// Hide .channels and .labels properties
	for (const model of Object.keys(convert)) {
		if (!('channels' in convert[model])) {
			throw new Error('missing channels property: ' + model);
		}

		if (!('labels' in convert[model])) {
			throw new Error('missing channel labels property: ' + model);
		}

		if (convert[model].labels.length !== convert[model].channels) {
			throw new Error('channel and label counts mismatch: ' + model);
		}

		const {channels, labels} = convert[model];
		delete convert[model].channels;
		delete convert[model].labels;
		Object.defineProperty(convert[model], 'channels', {value: channels});
		Object.defineProperty(convert[model], 'labels', {value: labels});
	}

	convert.rgb.hsl = function (rgb) {
		const r = rgb[0] / 255;
		const g = rgb[1] / 255;
		const b = rgb[2] / 255;
		const min = Math.min(r, g, b);
		const max = Math.max(r, g, b);
		const delta = max - min;
		let h;
		let s;

		if (max === min) {
			h = 0;
		} else if (r === max) {
			h = (g - b) / delta;
		} else if (g === max) {
			h = 2 + (b - r) / delta;
		} else if (b === max) {
			h = 4 + (r - g) / delta;
		}

		h = Math.min(h * 60, 360);

		if (h < 0) {
			h += 360;
		}

		const l = (min + max) / 2;

		if (max === min) {
			s = 0;
		} else if (l <= 0.5) {
			s = delta / (max + min);
		} else {
			s = delta / (2 - max - min);
		}

		return [h, s * 100, l * 100];
	};

	convert.rgb.hsv = function (rgb) {
		let rdif;
		let gdif;
		let bdif;
		let h;
		let s;

		const r = rgb[0] / 255;
		const g = rgb[1] / 255;
		const b = rgb[2] / 255;
		const v = Math.max(r, g, b);
		const diff = v - Math.min(r, g, b);
		const diffc = function (c) {
			return (v - c) / 6 / diff + 1 / 2;
		};

		if (diff === 0) {
			h = 0;
			s = 0;
		} else {
			s = diff / v;
			rdif = diffc(r);
			gdif = diffc(g);
			bdif = diffc(b);

			if (r === v) {
				h = bdif - gdif;
			} else if (g === v) {
				h = (1 / 3) + rdif - bdif;
			} else if (b === v) {
				h = (2 / 3) + gdif - rdif;
			}

			if (h < 0) {
				h += 1;
			} else if (h > 1) {
				h -= 1;
			}
		}

		return [
			h * 360,
			s * 100,
			v * 100
		];
	};

	convert.rgb.hwb = function (rgb) {
		const r = rgb[0];
		const g = rgb[1];
		let b = rgb[2];
		const h = convert.rgb.hsl(rgb)[0];
		const w = 1 / 255 * Math.min(r, Math.min(g, b));

		b = 1 - 1 / 255 * Math.max(r, Math.max(g, b));

		return [h, w * 100, b * 100];
	};

	convert.rgb.cmyk = function (rgb) {
		const r = rgb[0] / 255;
		const g = rgb[1] / 255;
		const b = rgb[2] / 255;

		const k = Math.min(1 - r, 1 - g, 1 - b);
		const c = (1 - r - k) / (1 - k) || 0;
		const m = (1 - g - k) / (1 - k) || 0;
		const y = (1 - b - k) / (1 - k) || 0;

		return [c * 100, m * 100, y * 100, k * 100];
	};

	function comparativeDistance(x, y) {
		/*
			See https://en.m.wikipedia.org/wiki/Euclidean_distance#Squared_Euclidean_distance
		*/
		return (
			((x[0] - y[0]) ** 2) +
			((x[1] - y[1]) ** 2) +
			((x[2] - y[2]) ** 2)
		);
	}

	convert.rgb.keyword = function (rgb) {
		const reversed = reverseKeywords[rgb];
		if (reversed) {
			return reversed;
		}

		let currentClosestDistance = Infinity;
		let currentClosestKeyword;

		for (const keyword of Object.keys(cssKeywords)) {
			const value = cssKeywords[keyword];

			// Compute comparative distance
			const distance = comparativeDistance(rgb, value);

			// Check if its less, if so set as closest
			if (distance < currentClosestDistance) {
				currentClosestDistance = distance;
				currentClosestKeyword = keyword;
			}
		}

		return currentClosestKeyword;
	};

	convert.keyword.rgb = function (keyword) {
		return cssKeywords[keyword];
	};

	convert.rgb.xyz = function (rgb) {
		let r = rgb[0] / 255;
		let g = rgb[1] / 255;
		let b = rgb[2] / 255;

		// Assume sRGB
		r = r > 0.04045 ? (((r + 0.055) / 1.055) ** 2.4) : (r / 12.92);
		g = g > 0.04045 ? (((g + 0.055) / 1.055) ** 2.4) : (g / 12.92);
		b = b > 0.04045 ? (((b + 0.055) / 1.055) ** 2.4) : (b / 12.92);

		const x = (r * 0.4124) + (g * 0.3576) + (b * 0.1805);
		const y = (r * 0.2126) + (g * 0.7152) + (b * 0.0722);
		const z = (r * 0.0193) + (g * 0.1192) + (b * 0.9505);

		return [x * 100, y * 100, z * 100];
	};

	convert.rgb.lab = function (rgb) {
		const xyz = convert.rgb.xyz(rgb);
		let x = xyz[0];
		let y = xyz[1];
		let z = xyz[2];

		x /= 95.047;
		y /= 100;
		z /= 108.883;

		x = x > 0.008856 ? (x ** (1 / 3)) : (7.787 * x) + (16 / 116);
		y = y > 0.008856 ? (y ** (1 / 3)) : (7.787 * y) + (16 / 116);
		z = z > 0.008856 ? (z ** (1 / 3)) : (7.787 * z) + (16 / 116);

		const l = (116 * y) - 16;
		const a = 500 * (x - y);
		const b = 200 * (y - z);

		return [l, a, b];
	};

	convert.hsl.rgb = function (hsl) {
		const h = hsl[0] / 360;
		const s = hsl[1] / 100;
		const l = hsl[2] / 100;
		let t2;
		let t3;
		let val;

		if (s === 0) {
			val = l * 255;
			return [val, val, val];
		}

		if (l < 0.5) {
			t2 = l * (1 + s);
		} else {
			t2 = l + s - l * s;
		}

		const t1 = 2 * l - t2;

		const rgb = [0, 0, 0];
		for (let i = 0; i < 3; i++) {
			t3 = h + 1 / 3 * -(i - 1);
			if (t3 < 0) {
				t3++;
			}

			if (t3 > 1) {
				t3--;
			}

			if (6 * t3 < 1) {
				val = t1 + (t2 - t1) * 6 * t3;
			} else if (2 * t3 < 1) {
				val = t2;
			} else if (3 * t3 < 2) {
				val = t1 + (t2 - t1) * (2 / 3 - t3) * 6;
			} else {
				val = t1;
			}

			rgb[i] = val * 255;
		}

		return rgb;
	};

	convert.hsl.hsv = function (hsl) {
		const h = hsl[0];
		let s = hsl[1] / 100;
		let l = hsl[2] / 100;
		let smin = s;
		const lmin = Math.max(l, 0.01);

		l *= 2;
		s *= (l <= 1) ? l : 2 - l;
		smin *= lmin <= 1 ? lmin : 2 - lmin;
		const v = (l + s) / 2;
		const sv = l === 0 ? (2 * smin) / (lmin + smin) : (2 * s) / (l + s);

		return [h, sv * 100, v * 100];
	};

	convert.hsv.rgb = function (hsv) {
		const h = hsv[0] / 60;
		const s = hsv[1] / 100;
		let v = hsv[2] / 100;
		const hi = Math.floor(h) % 6;

		const f = h - Math.floor(h);
		const p = 255 * v * (1 - s);
		const q = 255 * v * (1 - (s * f));
		const t = 255 * v * (1 - (s * (1 - f)));
		v *= 255;

		switch (hi) {
			case 0:
				return [v, t, p];
			case 1:
				return [q, v, p];
			case 2:
				return [p, v, t];
			case 3:
				return [p, q, v];
			case 4:
				return [t, p, v];
			case 5:
				return [v, p, q];
		}
	};

	convert.hsv.hsl = function (hsv) {
		const h = hsv[0];
		const s = hsv[1] / 100;
		const v = hsv[2] / 100;
		const vmin = Math.max(v, 0.01);
		let sl;
		let l;

		l = (2 - s) * v;
		const lmin = (2 - s) * vmin;
		sl = s * vmin;
		sl /= (lmin <= 1) ? lmin : 2 - lmin;
		sl = sl || 0;
		l /= 2;

		return [h, sl * 100, l * 100];
	};

	// http://dev.w3.org/csswg/css-color/#hwb-to-rgb
	convert.hwb.rgb = function (hwb) {
		const h = hwb[0] / 360;
		let wh = hwb[1] / 100;
		let bl = hwb[2] / 100;
		const ratio = wh + bl;
		let f;

		// Wh + bl cant be > 1
		if (ratio > 1) {
			wh /= ratio;
			bl /= ratio;
		}

		const i = Math.floor(6 * h);
		const v = 1 - bl;
		f = 6 * h - i;

		if ((i & 0x01) !== 0) {
			f = 1 - f;
		}

		const n = wh + f * (v - wh); // Linear interpolation

		let r;
		let g;
		let b;
		/* eslint-disable max-statements-per-line,no-multi-spaces */
		switch (i) {
			default:
			case 6:
			case 0: r = v;  g = n;  b = wh; break;
			case 1: r = n;  g = v;  b = wh; break;
			case 2: r = wh; g = v;  b = n; break;
			case 3: r = wh; g = n;  b = v; break;
			case 4: r = n;  g = wh; b = v; break;
			case 5: r = v;  g = wh; b = n; break;
		}
		/* eslint-enable max-statements-per-line,no-multi-spaces */

		return [r * 255, g * 255, b * 255];
	};

	convert.cmyk.rgb = function (cmyk) {
		const c = cmyk[0] / 100;
		const m = cmyk[1] / 100;
		const y = cmyk[2] / 100;
		const k = cmyk[3] / 100;

		const r = 1 - Math.min(1, c * (1 - k) + k);
		const g = 1 - Math.min(1, m * (1 - k) + k);
		const b = 1 - Math.min(1, y * (1 - k) + k);

		return [r * 255, g * 255, b * 255];
	};

	convert.xyz.rgb = function (xyz) {
		const x = xyz[0] / 100;
		const y = xyz[1] / 100;
		const z = xyz[2] / 100;
		let r;
		let g;
		let b;

		r = (x * 3.2406) + (y * -1.5372) + (z * -0.4986);
		g = (x * -0.9689) + (y * 1.8758) + (z * 0.0415);
		b = (x * 0.0557) + (y * -0.2040) + (z * 1.0570);

		// Assume sRGB
		r = r > 0.0031308
			? ((1.055 * (r ** (1.0 / 2.4))) - 0.055)
			: r * 12.92;

		g = g > 0.0031308
			? ((1.055 * (g ** (1.0 / 2.4))) - 0.055)
			: g * 12.92;

		b = b > 0.0031308
			? ((1.055 * (b ** (1.0 / 2.4))) - 0.055)
			: b * 12.92;

		r = Math.min(Math.max(0, r), 1);
		g = Math.min(Math.max(0, g), 1);
		b = Math.min(Math.max(0, b), 1);

		return [r * 255, g * 255, b * 255];
	};

	convert.xyz.lab = function (xyz) {
		let x = xyz[0];
		let y = xyz[1];
		let z = xyz[2];

		x /= 95.047;
		y /= 100;
		z /= 108.883;

		x = x > 0.008856 ? (x ** (1 / 3)) : (7.787 * x) + (16 / 116);
		y = y > 0.008856 ? (y ** (1 / 3)) : (7.787 * y) + (16 / 116);
		z = z > 0.008856 ? (z ** (1 / 3)) : (7.787 * z) + (16 / 116);

		const l = (116 * y) - 16;
		const a = 500 * (x - y);
		const b = 200 * (y - z);

		return [l, a, b];
	};

	convert.lab.xyz = function (lab) {
		const l = lab[0];
		const a = lab[1];
		const b = lab[2];
		let x;
		let y;
		let z;

		y = (l + 16) / 116;
		x = a / 500 + y;
		z = y - b / 200;

		const y2 = y ** 3;
		const x2 = x ** 3;
		const z2 = z ** 3;
		y = y2 > 0.008856 ? y2 : (y - 16 / 116) / 7.787;
		x = x2 > 0.008856 ? x2 : (x - 16 / 116) / 7.787;
		z = z2 > 0.008856 ? z2 : (z - 16 / 116) / 7.787;

		x *= 95.047;
		y *= 100;
		z *= 108.883;

		return [x, y, z];
	};

	convert.lab.lch = function (lab) {
		const l = lab[0];
		const a = lab[1];
		const b = lab[2];
		let h;

		const hr = Math.atan2(b, a);
		h = hr * 360 / 2 / Math.PI;

		if (h < 0) {
			h += 360;
		}

		const c = Math.sqrt(a * a + b * b);

		return [l, c, h];
	};

	convert.lch.lab = function (lch) {
		const l = lch[0];
		const c = lch[1];
		const h = lch[2];

		const hr = h / 360 * 2 * Math.PI;
		const a = c * Math.cos(hr);
		const b = c * Math.sin(hr);

		return [l, a, b];
	};

	convert.rgb.ansi16 = function (args, saturation = null) {
		const [r, g, b] = args;
		let value = saturation === null ? convert.rgb.hsv(args)[2] : saturation; // Hsv -> ansi16 optimization

		value = Math.round(value / 50);

		if (value === 0) {
			return 30;
		}

		let ansi = 30
			+ ((Math.round(b / 255) << 2)
			| (Math.round(g / 255) << 1)
			| Math.round(r / 255));

		if (value === 2) {
			ansi += 60;
		}

		return ansi;
	};

	convert.hsv.ansi16 = function (args) {
		// Optimization here; we already know the value and don't need to get
		// it converted for us.
		return convert.rgb.ansi16(convert.hsv.rgb(args), args[2]);
	};

	convert.rgb.ansi256 = function (args) {
		const r = args[0];
		const g = args[1];
		const b = args[2];

		// We use the extended greyscale palette here, with the exception of
		// black and white. normal palette only has 4 greyscale shades.
		if (r === g && g === b) {
			if (r < 8) {
				return 16;
			}

			if (r > 248) {
				return 231;
			}

			return Math.round(((r - 8) / 247) * 24) + 232;
		}

		const ansi = 16
			+ (36 * Math.round(r / 255 * 5))
			+ (6 * Math.round(g / 255 * 5))
			+ Math.round(b / 255 * 5);

		return ansi;
	};

	convert.ansi16.rgb = function (args) {
		let color = args % 10;

		// Handle greyscale
		if (color === 0 || color === 7) {
			if (args > 50) {
				color += 3.5;
			}

			color = color / 10.5 * 255;

			return [color, color, color];
		}

		const mult = (~~(args > 50) + 1) * 0.5;
		const r = ((color & 1) * mult) * 255;
		const g = (((color >> 1) & 1) * mult) * 255;
		const b = (((color >> 2) & 1) * mult) * 255;

		return [r, g, b];
	};

	convert.ansi256.rgb = function (args) {
		// Handle greyscale
		if (args >= 232) {
			const c = (args - 232) * 10 + 8;
			return [c, c, c];
		}

		args -= 16;

		let rem;
		const r = Math.floor(args / 36) / 5 * 255;
		const g = Math.floor((rem = args % 36) / 6) / 5 * 255;
		const b = (rem % 6) / 5 * 255;

		return [r, g, b];
	};

	convert.rgb.hex = function (args) {
		const integer = ((Math.round(args[0]) & 0xFF) << 16)
			+ ((Math.round(args[1]) & 0xFF) << 8)
			+ (Math.round(args[2]) & 0xFF);

		const string = integer.toString(16).toUpperCase();
		return '000000'.substring(string.length) + string;
	};

	convert.hex.rgb = function (args) {
		const match = args.toString(16).match(/[a-f0-9]{6}|[a-f0-9]{3}/i);
		if (!match) {
			return [0, 0, 0];
		}

		let colorString = match[0];

		if (match[0].length === 3) {
			colorString = colorString.split('').map(char => {
				return char + char;
			}).join('');
		}

		const integer = parseInt(colorString, 16);
		const r = (integer >> 16) & 0xFF;
		const g = (integer >> 8) & 0xFF;
		const b = integer & 0xFF;

		return [r, g, b];
	};

	convert.rgb.hcg = function (rgb) {
		const r = rgb[0] / 255;
		const g = rgb[1] / 255;
		const b = rgb[2] / 255;
		const max = Math.max(Math.max(r, g), b);
		const min = Math.min(Math.min(r, g), b);
		const chroma = (max - min);
		let grayscale;
		let hue;

		if (chroma < 1) {
			grayscale = min / (1 - chroma);
		} else {
			grayscale = 0;
		}

		if (chroma <= 0) {
			hue = 0;
		} else
		if (max === r) {
			hue = ((g - b) / chroma) % 6;
		} else
		if (max === g) {
			hue = 2 + (b - r) / chroma;
		} else {
			hue = 4 + (r - g) / chroma;
		}

		hue /= 6;
		hue %= 1;

		return [hue * 360, chroma * 100, grayscale * 100];
	};

	convert.hsl.hcg = function (hsl) {
		const s = hsl[1] / 100;
		const l = hsl[2] / 100;

		const c = l < 0.5 ? (2.0 * s * l) : (2.0 * s * (1.0 - l));

		let f = 0;
		if (c < 1.0) {
			f = (l - 0.5 * c) / (1.0 - c);
		}

		return [hsl[0], c * 100, f * 100];
	};

	convert.hsv.hcg = function (hsv) {
		const s = hsv[1] / 100;
		const v = hsv[2] / 100;

		const c = s * v;
		let f = 0;

		if (c < 1.0) {
			f = (v - c) / (1 - c);
		}

		return [hsv[0], c * 100, f * 100];
	};

	convert.hcg.rgb = function (hcg) {
		const h = hcg[0] / 360;
		const c = hcg[1] / 100;
		const g = hcg[2] / 100;

		if (c === 0.0) {
			return [g * 255, g * 255, g * 255];
		}

		const pure = [0, 0, 0];
		const hi = (h % 1) * 6;
		const v = hi % 1;
		const w = 1 - v;
		let mg = 0;

		/* eslint-disable max-statements-per-line */
		switch (Math.floor(hi)) {
			case 0:
				pure[0] = 1; pure[1] = v; pure[2] = 0; break;
			case 1:
				pure[0] = w; pure[1] = 1; pure[2] = 0; break;
			case 2:
				pure[0] = 0; pure[1] = 1; pure[2] = v; break;
			case 3:
				pure[0] = 0; pure[1] = w; pure[2] = 1; break;
			case 4:
				pure[0] = v; pure[1] = 0; pure[2] = 1; break;
			default:
				pure[0] = 1; pure[1] = 0; pure[2] = w;
		}
		/* eslint-enable max-statements-per-line */

		mg = (1.0 - c) * g;

		return [
			(c * pure[0] + mg) * 255,
			(c * pure[1] + mg) * 255,
			(c * pure[2] + mg) * 255
		];
	};

	convert.hcg.hsv = function (hcg) {
		const c = hcg[1] / 100;
		const g = hcg[2] / 100;

		const v = c + g * (1.0 - c);
		let f = 0;

		if (v > 0.0) {
			f = c / v;
		}

		return [hcg[0], f * 100, v * 100];
	};

	convert.hcg.hsl = function (hcg) {
		const c = hcg[1] / 100;
		const g = hcg[2] / 100;

		const l = g * (1.0 - c) + 0.5 * c;
		let s = 0;

		if (l > 0.0 && l < 0.5) {
			s = c / (2 * l);
		} else
		if (l >= 0.5 && l < 1.0) {
			s = c / (2 * (1 - l));
		}

		return [hcg[0], s * 100, l * 100];
	};

	convert.hcg.hwb = function (hcg) {
		const c = hcg[1] / 100;
		const g = hcg[2] / 100;
		const v = c + g * (1.0 - c);
		return [hcg[0], (v - c) * 100, (1 - v) * 100];
	};

	convert.hwb.hcg = function (hwb) {
		const w = hwb[1] / 100;
		const b = hwb[2] / 100;
		const v = 1 - b;
		const c = v - w;
		let g = 0;

		if (c < 1) {
			g = (v - c) / (1 - c);
		}

		return [hwb[0], c * 100, g * 100];
	};

	convert.apple.rgb = function (apple) {
		return [(apple[0] / 65535) * 255, (apple[1] / 65535) * 255, (apple[2] / 65535) * 255];
	};

	convert.rgb.apple = function (rgb) {
		return [(rgb[0] / 255) * 65535, (rgb[1] / 255) * 65535, (rgb[2] / 255) * 65535];
	};

	convert.gray.rgb = function (args) {
		return [args[0] / 100 * 255, args[0] / 100 * 255, args[0] / 100 * 255];
	};

	convert.gray.hsl = function (args) {
		return [0, 0, args[0]];
	};

	convert.gray.hsv = convert.gray.hsl;

	convert.gray.hwb = function (gray) {
		return [0, 100, gray[0]];
	};

	convert.gray.cmyk = function (gray) {
		return [0, 0, 0, gray[0]];
	};

	convert.gray.lab = function (gray) {
		return [gray[0], 0, 0];
	};

	convert.gray.hex = function (gray) {
		const val = Math.round(gray[0] / 100 * 255) & 0xFF;
		const integer = (val << 16) + (val << 8) + val;

		const string = integer.toString(16).toUpperCase();
		return '000000'.substring(string.length) + string;
	};

	convert.rgb.gray = function (rgb) {
		const val = (rgb[0] + rgb[1] + rgb[2]) / 3;
		return [val / 255 * 100];
	};
	return conversions;
}

var route;
var hasRequiredRoute;

function requireRoute () {
	if (hasRequiredRoute) return route;
	hasRequiredRoute = 1;
	const conversions = requireConversions();

	/*
		This function routes a model to all other models.

		all functions that are routed have a property `.conversion` attached
		to the returned synthetic function. This property is an array
		of strings, each with the steps in between the 'from' and 'to'
		color models (inclusive).

		conversions that are not possible simply are not included.
	*/

	function buildGraph() {
		const graph = {};
		// https://jsperf.com/object-keys-vs-for-in-with-closure/3
		const models = Object.keys(conversions);

		for (let len = models.length, i = 0; i < len; i++) {
			graph[models[i]] = {
				// http://jsperf.com/1-vs-infinity
				// micro-opt, but this is simple.
				distance: -1,
				parent: null
			};
		}

		return graph;
	}

	// https://en.wikipedia.org/wiki/Breadth-first_search
	function deriveBFS(fromModel) {
		const graph = buildGraph();
		const queue = [fromModel]; // Unshift -> queue -> pop

		graph[fromModel].distance = 0;

		while (queue.length) {
			const current = queue.pop();
			const adjacents = Object.keys(conversions[current]);

			for (let len = adjacents.length, i = 0; i < len; i++) {
				const adjacent = adjacents[i];
				const node = graph[adjacent];

				if (node.distance === -1) {
					node.distance = graph[current].distance + 1;
					node.parent = current;
					queue.unshift(adjacent);
				}
			}
		}

		return graph;
	}

	function link(from, to) {
		return function (args) {
			return to(from(args));
		};
	}

	function wrapConversion(toModel, graph) {
		const path = [graph[toModel].parent, toModel];
		let fn = conversions[graph[toModel].parent][toModel];

		let cur = graph[toModel].parent;
		while (graph[cur].parent) {
			path.unshift(graph[cur].parent);
			fn = link(conversions[graph[cur].parent][cur], fn);
			cur = graph[cur].parent;
		}

		fn.conversion = path;
		return fn;
	}

	route = function (fromModel) {
		const graph = deriveBFS(fromModel);
		const conversion = {};

		const models = Object.keys(graph);
		for (let len = models.length, i = 0; i < len; i++) {
			const toModel = models[i];
			const node = graph[toModel];

			if (node.parent === null) {
				// No possible conversion, or this node is the source model.
				continue;
			}

			conversion[toModel] = wrapConversion(toModel, graph);
		}

		return conversion;
	};
	return route;
}

var colorConvert;
var hasRequiredColorConvert;

function requireColorConvert () {
	if (hasRequiredColorConvert) return colorConvert;
	hasRequiredColorConvert = 1;
	const conversions = requireConversions();
	const route = requireRoute();

	const convert = {};

	const models = Object.keys(conversions);

	function wrapRaw(fn) {
		const wrappedFn = function (...args) {
			const arg0 = args[0];
			if (arg0 === undefined || arg0 === null) {
				return arg0;
			}

			if (arg0.length > 1) {
				args = arg0;
			}

			return fn(args);
		};

		// Preserve .conversion property if there is one
		if ('conversion' in fn) {
			wrappedFn.conversion = fn.conversion;
		}

		return wrappedFn;
	}

	function wrapRounded(fn) {
		const wrappedFn = function (...args) {
			const arg0 = args[0];

			if (arg0 === undefined || arg0 === null) {
				return arg0;
			}

			if (arg0.length > 1) {
				args = arg0;
			}

			const result = fn(args);

			// We're assuming the result is an array here.
			// see notice in conversions.js; don't use box types
			// in conversion functions.
			if (typeof result === 'object') {
				for (let len = result.length, i = 0; i < len; i++) {
					result[i] = Math.round(result[i]);
				}
			}

			return result;
		};

		// Preserve .conversion property if there is one
		if ('conversion' in fn) {
			wrappedFn.conversion = fn.conversion;
		}

		return wrappedFn;
	}

	models.forEach(fromModel => {
		convert[fromModel] = {};

		Object.defineProperty(convert[fromModel], 'channels', {value: conversions[fromModel].channels});
		Object.defineProperty(convert[fromModel], 'labels', {value: conversions[fromModel].labels});

		const routes = route(fromModel);
		const routeModels = Object.keys(routes);

		routeModels.forEach(toModel => {
			const fn = routes[toModel];

			convert[fromModel][toModel] = wrapRounded(fn);
			convert[fromModel][toModel].raw = wrapRaw(fn);
		});
	});

	colorConvert = convert;
	return colorConvert;
}

ansiStyles$1.exports;

(function (module) {

	const wrapAnsi16 = (fn, offset) => (...args) => {
		const code = fn(...args);
		return `\u001B[${code + offset}m`;
	};

	const wrapAnsi256 = (fn, offset) => (...args) => {
		const code = fn(...args);
		return `\u001B[${38 + offset};5;${code}m`;
	};

	const wrapAnsi16m = (fn, offset) => (...args) => {
		const rgb = fn(...args);
		return `\u001B[${38 + offset};2;${rgb[0]};${rgb[1]};${rgb[2]}m`;
	};

	const ansi2ansi = n => n;
	const rgb2rgb = (r, g, b) => [r, g, b];

	const setLazyProperty = (object, property, get) => {
		Object.defineProperty(object, property, {
			get: () => {
				const value = get();

				Object.defineProperty(object, property, {
					value,
					enumerable: true,
					configurable: true
				});

				return value;
			},
			enumerable: true,
			configurable: true
		});
	};

	/** @type {typeof import('color-convert')} */
	let colorConvert;
	const makeDynamicStyles = (wrap, targetSpace, identity, isBackground) => {
		if (colorConvert === undefined) {
			colorConvert = requireColorConvert();
		}

		const offset = isBackground ? 10 : 0;
		const styles = {};

		for (const [sourceSpace, suite] of Object.entries(colorConvert)) {
			const name = sourceSpace === 'ansi16' ? 'ansi' : sourceSpace;
			if (sourceSpace === targetSpace) {
				styles[name] = wrap(identity, offset);
			} else if (typeof suite === 'object') {
				styles[name] = wrap(suite[targetSpace], offset);
			}
		}

		return styles;
	};

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

		setLazyProperty(styles.color, 'ansi', () => makeDynamicStyles(wrapAnsi16, 'ansi16', ansi2ansi, false));
		setLazyProperty(styles.color, 'ansi256', () => makeDynamicStyles(wrapAnsi256, 'ansi256', ansi2ansi, false));
		setLazyProperty(styles.color, 'ansi16m', () => makeDynamicStyles(wrapAnsi16m, 'rgb', rgb2rgb, false));
		setLazyProperty(styles.bgColor, 'ansi', () => makeDynamicStyles(wrapAnsi16, 'ansi16', ansi2ansi, true));
		setLazyProperty(styles.bgColor, 'ansi256', () => makeDynamicStyles(wrapAnsi256, 'ansi256', ansi2ansi, true));
		setLazyProperty(styles.bgColor, 'ansi16m', () => makeDynamicStyles(wrapAnsi16m, 'rgb', rgb2rgb, true));

		return styles;
	}

	// Make the export immutable
	Object.defineProperty(module, 'exports', {
		enumerable: true,
		get: assembleStyles
	}); 
} (ansiStyles$1));

var ansiStylesExports = ansiStyles$1.exports;

var hasFlag$1 = (flag, argv = process.argv) => {
	const prefix = flag.startsWith('-') ? '' : (flag.length === 1 ? '-' : '--');
	const position = argv.indexOf(prefix + flag);
	const terminatorPosition = argv.indexOf('--');
	return position !== -1 && (terminatorPosition === -1 || position < terminatorPosition);
};

const os = require$$0$2;
const tty = require$$1$1;
const hasFlag = hasFlag$1;

const {env} = process;

let forceColor;
if (hasFlag('no-color') ||
	hasFlag('no-colors') ||
	hasFlag('color=false') ||
	hasFlag('color=never')) {
	forceColor = 0;
} else if (hasFlag('color') ||
	hasFlag('colors') ||
	hasFlag('color=true') ||
	hasFlag('color=always')) {
	forceColor = 1;
}

if ('FORCE_COLOR' in env) {
	if (env.FORCE_COLOR === 'true') {
		forceColor = 1;
	} else if (env.FORCE_COLOR === 'false') {
		forceColor = 0;
	} else {
		forceColor = env.FORCE_COLOR.length === 0 ? 1 : Math.min(parseInt(env.FORCE_COLOR, 10), 3);
	}
}

function translateLevel(level) {
	if (level === 0) {
		return false;
	}

	return {
		level,
		hasBasic: true,
		has256: level >= 2,
		has16m: level >= 3
	};
}

function supportsColor(haveStream, streamIsTTY) {
	if (forceColor === 0) {
		return 0;
	}

	if (hasFlag('color=16m') ||
		hasFlag('color=full') ||
		hasFlag('color=truecolor')) {
		return 3;
	}

	if (hasFlag('color=256')) {
		return 2;
	}

	if (haveStream && !streamIsTTY && forceColor === undefined) {
		return 0;
	}

	const min = forceColor || 0;

	if (env.TERM === 'dumb') {
		return min;
	}

	if (process.platform === 'win32') {
		// Windows 10 build 10586 is the first Windows release that supports 256 colors.
		// Windows 10 build 14931 is the first release that supports 16m/TrueColor.
		const osRelease = os.release().split('.');
		if (
			Number(osRelease[0]) >= 10 &&
			Number(osRelease[2]) >= 10586
		) {
			return Number(osRelease[2]) >= 14931 ? 3 : 2;
		}

		return 1;
	}

	if ('CI' in env) {
		if (['TRAVIS', 'CIRCLECI', 'APPVEYOR', 'GITLAB_CI', 'GITHUB_ACTIONS', 'BUILDKITE'].some(sign => sign in env) || env.CI_NAME === 'codeship') {
			return 1;
		}

		return min;
	}

	if ('TEAMCITY_VERSION' in env) {
		return /^(9\.(0*[1-9]\d*)\.|\d{2,}\.)/.test(env.TEAMCITY_VERSION) ? 1 : 0;
	}

	if (env.COLORTERM === 'truecolor') {
		return 3;
	}

	if ('TERM_PROGRAM' in env) {
		const version = parseInt((env.TERM_PROGRAM_VERSION || '').split('.')[0], 10);

		switch (env.TERM_PROGRAM) {
			case 'iTerm.app':
				return version >= 3 ? 3 : 2;
			case 'Apple_Terminal':
				return 2;
			// No default
		}
	}

	if (/-256(color)?$/i.test(env.TERM)) {
		return 2;
	}

	if (/^screen|^xterm|^vt100|^vt220|^rxvt|color|ansi|cygwin|linux/i.test(env.TERM)) {
		return 1;
	}

	if ('COLORTERM' in env) {
		return 1;
	}

	return min;
}

function getSupportLevel(stream) {
	const level = supportsColor(stream, stream && stream.isTTY);
	return translateLevel(level);
}

var supportsColor_1 = {
	supportsColor: getSupportLevel,
	stdout: translateLevel(supportsColor(true, tty.isatty(1))),
	stderr: translateLevel(supportsColor(true, tty.isatty(2)))
};

const stringReplaceAll$1 = (string, substring, replacer) => {
	let index = string.indexOf(substring);
	if (index === -1) {
		return string;
	}

	const substringLength = substring.length;
	let endIndex = 0;
	let returnValue = '';
	do {
		returnValue += string.substr(endIndex, index - endIndex) + substring + replacer;
		endIndex = index + substringLength;
		index = string.indexOf(substring, endIndex);
	} while (index !== -1);

	returnValue += string.substr(endIndex);
	return returnValue;
};

const stringEncaseCRLFWithFirstIndex$1 = (string, prefix, postfix, index) => {
	let endIndex = 0;
	let returnValue = '';
	do {
		const gotCR = string[index - 1] === '\r';
		returnValue += string.substr(endIndex, (gotCR ? index - 1 : index) - endIndex) + prefix + (gotCR ? '\r\n' : '\n') + postfix;
		endIndex = index + 1;
		index = string.indexOf('\n', endIndex);
	} while (index !== -1);

	returnValue += string.substr(endIndex);
	return returnValue;
};

var util = {
	stringReplaceAll: stringReplaceAll$1,
	stringEncaseCRLFWithFirstIndex: stringEncaseCRLFWithFirstIndex$1
};

var templates;
var hasRequiredTemplates;

function requireTemplates () {
	if (hasRequiredTemplates) return templates;
	hasRequiredTemplates = 1;
	const TEMPLATE_REGEX = /(?:\\(u(?:[a-f\d]{4}|\{[a-f\d]{1,6}\})|x[a-f\d]{2}|.))|(?:\{(~)?(\w+(?:\([^)]*\))?(?:\.\w+(?:\([^)]*\))?)*)(?:[ \t]|(?=\r?\n)))|(\})|((?:.|[\r\n\f])+?)/gi;
	const STYLE_REGEX = /(?:^|\.)(\w+)(?:\(([^)]*)\))?/g;
	const STRING_REGEX = /^(['"])((?:\\.|(?!\1)[^\\])*)\1$/;
	const ESCAPE_REGEX = /\\(u(?:[a-f\d]{4}|{[a-f\d]{1,6}})|x[a-f\d]{2}|.)|([^\\])/gi;

	const ESCAPES = new Map([
		['n', '\n'],
		['r', '\r'],
		['t', '\t'],
		['b', '\b'],
		['f', '\f'],
		['v', '\v'],
		['0', '\0'],
		['\\', '\\'],
		['e', '\u001B'],
		['a', '\u0007']
	]);

	function unescape(c) {
		const u = c[0] === 'u';
		const bracket = c[1] === '{';

		if ((u && !bracket && c.length === 5) || (c[0] === 'x' && c.length === 3)) {
			return String.fromCharCode(parseInt(c.slice(1), 16));
		}

		if (u && bracket) {
			return String.fromCodePoint(parseInt(c.slice(2, -1), 16));
		}

		return ESCAPES.get(c) || c;
	}

	function parseArguments(name, arguments_) {
		const results = [];
		const chunks = arguments_.trim().split(/\s*,\s*/g);
		let matches;

		for (const chunk of chunks) {
			const number = Number(chunk);
			if (!Number.isNaN(number)) {
				results.push(number);
			} else if ((matches = chunk.match(STRING_REGEX))) {
				results.push(matches[2].replace(ESCAPE_REGEX, (m, escape, character) => escape ? unescape(escape) : character));
			} else {
				throw new Error(`Invalid Chalk template style argument: ${chunk} (in style '${name}')`);
			}
		}

		return results;
	}

	function parseStyle(style) {
		STYLE_REGEX.lastIndex = 0;

		const results = [];
		let matches;

		while ((matches = STYLE_REGEX.exec(style)) !== null) {
			const name = matches[1];

			if (matches[2]) {
				const args = parseArguments(name, matches[2]);
				results.push([name].concat(args));
			} else {
				results.push([name]);
			}
		}

		return results;
	}

	function buildStyle(chalk, styles) {
		const enabled = {};

		for (const layer of styles) {
			for (const style of layer.styles) {
				enabled[style[0]] = layer.inverse ? null : style.slice(1);
			}
		}

		let current = chalk;
		for (const [styleName, styles] of Object.entries(enabled)) {
			if (!Array.isArray(styles)) {
				continue;
			}

			if (!(styleName in current)) {
				throw new Error(`Unknown Chalk style: ${styleName}`);
			}

			current = styles.length > 0 ? current[styleName](...styles) : current[styleName];
		}

		return current;
	}

	templates = (chalk, temporary) => {
		const styles = [];
		const chunks = [];
		let chunk = [];

		// eslint-disable-next-line max-params
		temporary.replace(TEMPLATE_REGEX, (m, escapeCharacter, inverse, style, close, character) => {
			if (escapeCharacter) {
				chunk.push(unescape(escapeCharacter));
			} else if (style) {
				const string = chunk.join('');
				chunk = [];
				chunks.push(styles.length === 0 ? string : buildStyle(chalk, styles)(string));
				styles.push({inverse, styles: parseStyle(style)});
			} else if (close) {
				if (styles.length === 0) {
					throw new Error('Found extraneous } in Chalk template literal');
				}

				chunks.push(buildStyle(chalk, styles)(chunk.join('')));
				chunk = [];
				styles.pop();
			} else {
				chunk.push(character);
			}
		});

		chunks.push(chunk.join(''));

		if (styles.length > 0) {
			const errMessage = `Chalk template literal is missing ${styles.length} closing bracket${styles.length === 1 ? '' : 's'} (\`}\`)`;
			throw new Error(errMessage);
		}

		return chunks.join('');
	};
	return templates;
}

const ansiStyles = ansiStylesExports;
const {stdout: stdoutColor, stderr: stderrColor} = supportsColor_1;
const {
	stringReplaceAll,
	stringEncaseCRLFWithFirstIndex
} = util;

const {isArray} = Array;

// `supportsColor.level` → `ansiStyles.color[name]` mapping
const levelMapping = [
	'ansi',
	'ansi',
	'ansi256',
	'ansi16m'
];

const styles = Object.create(null);

const applyOptions = (object, options = {}) => {
	if (options.level && !(Number.isInteger(options.level) && options.level >= 0 && options.level <= 3)) {
		throw new Error('The `level` option should be an integer from 0 to 3');
	}

	// Detect level if not set manually
	const colorLevel = stdoutColor ? stdoutColor.level : 0;
	object.level = options.level === undefined ? colorLevel : options.level;
};

class ChalkClass {
	constructor(options) {
		// eslint-disable-next-line no-constructor-return
		return chalkFactory(options);
	}
}

const chalkFactory = options => {
	const chalk = {};
	applyOptions(chalk, options);

	chalk.template = (...arguments_) => chalkTag(chalk.template, ...arguments_);

	Object.setPrototypeOf(chalk, Chalk.prototype);
	Object.setPrototypeOf(chalk.template, chalk);

	chalk.template.constructor = () => {
		throw new Error('`chalk.constructor()` is deprecated. Use `new chalk.Instance()` instead.');
	};

	chalk.template.Instance = ChalkClass;

	return chalk.template;
};

function Chalk(options) {
	return chalkFactory(options);
}

for (const [styleName, style] of Object.entries(ansiStyles)) {
	styles[styleName] = {
		get() {
			const builder = createBuilder(this, createStyler(style.open, style.close, this._styler), this._isEmpty);
			Object.defineProperty(this, styleName, {value: builder});
			return builder;
		}
	};
}

styles.visible = {
	get() {
		const builder = createBuilder(this, this._styler, true);
		Object.defineProperty(this, 'visible', {value: builder});
		return builder;
	}
};

const usedModels = ['rgb', 'hex', 'keyword', 'hsl', 'hsv', 'hwb', 'ansi', 'ansi256'];

for (const model of usedModels) {
	styles[model] = {
		get() {
			const {level} = this;
			return function (...arguments_) {
				const styler = createStyler(ansiStyles.color[levelMapping[level]][model](...arguments_), ansiStyles.color.close, this._styler);
				return createBuilder(this, styler, this._isEmpty);
			};
		}
	};
}

for (const model of usedModels) {
	const bgModel = 'bg' + model[0].toUpperCase() + model.slice(1);
	styles[bgModel] = {
		get() {
			const {level} = this;
			return function (...arguments_) {
				const styler = createStyler(ansiStyles.bgColor[levelMapping[level]][model](...arguments_), ansiStyles.bgColor.close, this._styler);
				return createBuilder(this, styler, this._isEmpty);
			};
		}
	};
}

const proto = Object.defineProperties(() => {}, {
	...styles,
	level: {
		enumerable: true,
		get() {
			return this._generator.level;
		},
		set(level) {
			this._generator.level = level;
		}
	}
});

const createStyler = (open, close, parent) => {
	let openAll;
	let closeAll;
	if (parent === undefined) {
		openAll = open;
		closeAll = close;
	} else {
		openAll = parent.openAll + open;
		closeAll = close + parent.closeAll;
	}

	return {
		open,
		close,
		openAll,
		closeAll,
		parent
	};
};

const createBuilder = (self, _styler, _isEmpty) => {
	const builder = (...arguments_) => {
		if (isArray(arguments_[0]) && isArray(arguments_[0].raw)) {
			// Called as a template literal, for example: chalk.red`2 + 3 = {bold ${2+3}}`
			return applyStyle(builder, chalkTag(builder, ...arguments_));
		}

		// Single argument is hot path, implicit coercion is faster than anything
		// eslint-disable-next-line no-implicit-coercion
		return applyStyle(builder, (arguments_.length === 1) ? ('' + arguments_[0]) : arguments_.join(' '));
	};

	// We alter the prototype because we must return a function, but there is
	// no way to create a function with a different prototype
	Object.setPrototypeOf(builder, proto);

	builder._generator = self;
	builder._styler = _styler;
	builder._isEmpty = _isEmpty;

	return builder;
};

const applyStyle = (self, string) => {
	if (self.level <= 0 || !string) {
		return self._isEmpty ? '' : string;
	}

	let styler = self._styler;

	if (styler === undefined) {
		return string;
	}

	const {openAll, closeAll} = styler;
	if (string.indexOf('\u001B') !== -1) {
		while (styler !== undefined) {
			// Replace any instances already present with a re-opening code
			// otherwise only the part of the string until said closing code
			// will be colored, and the rest will simply be 'plain'.
			string = stringReplaceAll(string, styler.close, styler.open);

			styler = styler.parent;
		}
	}

	// We can move both next actions out of loop, because remaining actions in loop won't have
	// any/visible effect on parts we add here. Close the styling before a linebreak and reopen
	// after next line to fix a bleed issue on macOS: https://github.com/chalk/chalk/pull/92
	const lfIndex = string.indexOf('\n');
	if (lfIndex !== -1) {
		string = stringEncaseCRLFWithFirstIndex(string, closeAll, openAll, lfIndex);
	}

	return openAll + string + closeAll;
};

let template;
const chalkTag = (chalk, ...strings) => {
	const [firstString] = strings;

	if (!isArray(firstString) || !isArray(firstString.raw)) {
		// If chalk() was called by itself or with a string,
		// return the string itself as a string.
		return strings.join(' ');
	}

	const arguments_ = strings.slice(1);
	const parts = [firstString.raw[0]];

	for (let i = 1; i < firstString.length; i++) {
		parts.push(
			String(arguments_[i - 1]).replace(/[{}\\]/g, '\\$&'),
			String(firstString.raw[i])
		);
	}

	if (template === undefined) {
		template = requireTemplates();
	}

	return template(chalk, parts.join(''));
};

Object.defineProperties(Chalk.prototype, styles);

const chalk$1 = Chalk(); // eslint-disable-line new-cap
chalk$1.supportsColor = stdoutColor;
chalk$1.stderr = Chalk({level: stderrColor ? stderrColor.level : 0}); // eslint-disable-line new-cap
chalk$1.stderr.supportsColor = stderrColor;

var source = chalk$1;

var jsYaml$1 = {};

var loader$1 = {};

var common$6 = {};

function isNothing(subject) {
  return (typeof subject === 'undefined') || (subject === null);
}


function isObject(subject) {
  return (typeof subject === 'object') && (subject !== null);
}


function toArray(sequence) {
  if (Array.isArray(sequence)) return sequence;
  else if (isNothing(sequence)) return [];

  return [ sequence ];
}


function extend(target, source) {
  var index, length, key, sourceKeys;

  if (source) {
    sourceKeys = Object.keys(source);

    for (index = 0, length = sourceKeys.length; index < length; index += 1) {
      key = sourceKeys[index];
      target[key] = source[key];
    }
  }

  return target;
}


function repeat(string, count) {
  var result = '', cycle;

  for (cycle = 0; cycle < count; cycle += 1) {
    result += string;
  }

  return result;
}


function isNegativeZero(number) {
  return (number === 0) && (Number.NEGATIVE_INFINITY === 1 / number);
}


common$6.isNothing      = isNothing;
common$6.isObject       = isObject;
common$6.toArray        = toArray;
common$6.repeat         = repeat;
common$6.isNegativeZero = isNegativeZero;
common$6.extend         = extend;

function YAMLException$4(reason, mark) {
  // Super constructor
  Error.call(this);

  this.name = 'YAMLException';
  this.reason = reason;
  this.mark = mark;
  this.message = (this.reason || '(unknown reason)') + (this.mark ? ' ' + this.mark.toString() : '');

  // Include stack trace in error object
  if (Error.captureStackTrace) {
    // Chrome and NodeJS
    Error.captureStackTrace(this, this.constructor);
  } else {
    // FF, IE 10+ and Safari 6+. Fallback for others
    this.stack = (new Error()).stack || '';
  }
}


// Inherit from Error
YAMLException$4.prototype = Object.create(Error.prototype);
YAMLException$4.prototype.constructor = YAMLException$4;


YAMLException$4.prototype.toString = function toString(compact) {
  var result = this.name + ': ';

  result += this.reason || '(unknown reason)';

  if (!compact && this.mark) {
    result += ' ' + this.mark.toString();
  }

  return result;
};


var exception = YAMLException$4;

var common$5 = common$6;


function Mark$1(name, buffer, position, line, column) {
  this.name     = name;
  this.buffer   = buffer;
  this.position = position;
  this.line     = line;
  this.column   = column;
}


Mark$1.prototype.getSnippet = function getSnippet(indent, maxLength) {
  var head, start, tail, end, snippet;

  if (!this.buffer) return null;

  indent = indent || 4;
  maxLength = maxLength || 75;

  head = '';
  start = this.position;

  while (start > 0 && '\x00\r\n\x85\u2028\u2029'.indexOf(this.buffer.charAt(start - 1)) === -1) {
    start -= 1;
    if (this.position - start > (maxLength / 2 - 1)) {
      head = ' ... ';
      start += 5;
      break;
    }
  }

  tail = '';
  end = this.position;

  while (end < this.buffer.length && '\x00\r\n\x85\u2028\u2029'.indexOf(this.buffer.charAt(end)) === -1) {
    end += 1;
    if (end - this.position > (maxLength / 2 - 1)) {
      tail = ' ... ';
      end -= 5;
      break;
    }
  }

  snippet = this.buffer.slice(start, end);

  return common$5.repeat(' ', indent) + head + snippet + tail + '\n' +
         common$5.repeat(' ', indent + this.position - start + head.length) + '^';
};


Mark$1.prototype.toString = function toString(compact) {
  var snippet, where = '';

  if (this.name) {
    where += 'in "' + this.name + '" ';
  }

  where += 'at line ' + (this.line + 1) + ', column ' + (this.column + 1);

  if (!compact) {
    snippet = this.getSnippet();

    if (snippet) {
      where += ':\n' + snippet;
    }
  }

  return where;
};


var mark = Mark$1;

var YAMLException$3 = exception;

var TYPE_CONSTRUCTOR_OPTIONS = [
  'kind',
  'resolve',
  'construct',
  'instanceOf',
  'predicate',
  'represent',
  'defaultStyle',
  'styleAliases'
];

var YAML_NODE_KINDS = [
  'scalar',
  'sequence',
  'mapping'
];

function compileStyleAliases(map) {
  var result = {};

  if (map !== null) {
    Object.keys(map).forEach(function (style) {
      map[style].forEach(function (alias) {
        result[String(alias)] = style;
      });
    });
  }

  return result;
}

function Type$h(tag, options) {
  options = options || {};

  Object.keys(options).forEach(function (name) {
    if (TYPE_CONSTRUCTOR_OPTIONS.indexOf(name) === -1) {
      throw new YAMLException$3('Unknown option "' + name + '" is met in definition of "' + tag + '" YAML type.');
    }
  });

  // TODO: Add tag format check.
  this.tag          = tag;
  this.kind         = options['kind']         || null;
  this.resolve      = options['resolve']      || function () { return true; };
  this.construct    = options['construct']    || function (data) { return data; };
  this.instanceOf   = options['instanceOf']   || null;
  this.predicate    = options['predicate']    || null;
  this.represent    = options['represent']    || null;
  this.defaultStyle = options['defaultStyle'] || null;
  this.styleAliases = compileStyleAliases(options['styleAliases'] || null);

  if (YAML_NODE_KINDS.indexOf(this.kind) === -1) {
    throw new YAMLException$3('Unknown kind "' + this.kind + '" is specified for "' + tag + '" YAML type.');
  }
}

var type = Type$h;

/*eslint-disable max-len*/

var common$4        = common$6;
var YAMLException$2 = exception;
var Type$g          = type;


function compileList(schema, name, result) {
  var exclude = [];

  schema.include.forEach(function (includedSchema) {
    result = compileList(includedSchema, name, result);
  });

  schema[name].forEach(function (currentType) {
    result.forEach(function (previousType, previousIndex) {
      if (previousType.tag === currentType.tag && previousType.kind === currentType.kind) {
        exclude.push(previousIndex);
      }
    });

    result.push(currentType);
  });

  return result.filter(function (type, index) {
    return exclude.indexOf(index) === -1;
  });
}


function compileMap(/* lists... */) {
  var result = {
        scalar: {},
        sequence: {},
        mapping: {},
        fallback: {}
      }, index, length;

  function collectType(type) {
    result[type.kind][type.tag] = result['fallback'][type.tag] = type;
  }

  for (index = 0, length = arguments.length; index < length; index += 1) {
    arguments[index].forEach(collectType);
  }
  return result;
}


function Schema$5(definition) {
  this.include  = definition.include  || [];
  this.implicit = definition.implicit || [];
  this.explicit = definition.explicit || [];

  this.implicit.forEach(function (type) {
    if (type.loadKind && type.loadKind !== 'scalar') {
      throw new YAMLException$2('There is a non-scalar type in the implicit list of a schema. Implicit resolving of such types is not supported.');
    }
  });

  this.compiledImplicit = compileList(this, 'implicit', []);
  this.compiledExplicit = compileList(this, 'explicit', []);
  this.compiledTypeMap  = compileMap(this.compiledImplicit, this.compiledExplicit);
}


Schema$5.DEFAULT = null;


Schema$5.create = function createSchema() {
  var schemas, types;

  switch (arguments.length) {
    case 1:
      schemas = Schema$5.DEFAULT;
      types = arguments[0];
      break;

    case 2:
      schemas = arguments[0];
      types = arguments[1];
      break;

    default:
      throw new YAMLException$2('Wrong number of arguments for Schema.create function');
  }

  schemas = common$4.toArray(schemas);
  types = common$4.toArray(types);

  if (!schemas.every(function (schema) { return schema instanceof Schema$5; })) {
    throw new YAMLException$2('Specified list of super schemas (or a single Schema object) contains a non-Schema object.');
  }

  if (!types.every(function (type) { return type instanceof Type$g; })) {
    throw new YAMLException$2('Specified list of YAML types (or a single Type object) contains a non-Type object.');
  }

  return new Schema$5({
    include: schemas,
    explicit: types
  });
};


var schema = Schema$5;

var Type$f = type;

var str = new Type$f('tag:yaml.org,2002:str', {
  kind: 'scalar',
  construct: function (data) { return data !== null ? data : ''; }
});

var Type$e = type;

var seq = new Type$e('tag:yaml.org,2002:seq', {
  kind: 'sequence',
  construct: function (data) { return data !== null ? data : []; }
});

var Type$d = type;

var map = new Type$d('tag:yaml.org,2002:map', {
  kind: 'mapping',
  construct: function (data) { return data !== null ? data : {}; }
});

var Schema$4 = schema;


var failsafe = new Schema$4({
  explicit: [
    str,
    seq,
    map
  ]
});

var Type$c = type;

function resolveYamlNull(data) {
  if (data === null) return true;

  var max = data.length;

  return (max === 1 && data === '~') ||
         (max === 4 && (data === 'null' || data === 'Null' || data === 'NULL'));
}

function constructYamlNull() {
  return null;
}

function isNull(object) {
  return object === null;
}

var _null = new Type$c('tag:yaml.org,2002:null', {
  kind: 'scalar',
  resolve: resolveYamlNull,
  construct: constructYamlNull,
  predicate: isNull,
  represent: {
    canonical: function () { return '~';    },
    lowercase: function () { return 'null'; },
    uppercase: function () { return 'NULL'; },
    camelcase: function () { return 'Null'; }
  },
  defaultStyle: 'lowercase'
});

var Type$b = type;

function resolveYamlBoolean(data) {
  if (data === null) return false;

  var max = data.length;

  return (max === 4 && (data === 'true' || data === 'True' || data === 'TRUE')) ||
         (max === 5 && (data === 'false' || data === 'False' || data === 'FALSE'));
}

function constructYamlBoolean(data) {
  return data === 'true' ||
         data === 'True' ||
         data === 'TRUE';
}

function isBoolean(object) {
  return Object.prototype.toString.call(object) === '[object Boolean]';
}

var bool = new Type$b('tag:yaml.org,2002:bool', {
  kind: 'scalar',
  resolve: resolveYamlBoolean,
  construct: constructYamlBoolean,
  predicate: isBoolean,
  represent: {
    lowercase: function (object) { return object ? 'true' : 'false'; },
    uppercase: function (object) { return object ? 'TRUE' : 'FALSE'; },
    camelcase: function (object) { return object ? 'True' : 'False'; }
  },
  defaultStyle: 'lowercase'
});

var common$3 = common$6;
var Type$a   = type;

function isHexCode(c) {
  return ((0x30/* 0 */ <= c) && (c <= 0x39/* 9 */)) ||
         ((0x41/* A */ <= c) && (c <= 0x46/* F */)) ||
         ((0x61/* a */ <= c) && (c <= 0x66/* f */));
}

function isOctCode(c) {
  return ((0x30/* 0 */ <= c) && (c <= 0x37/* 7 */));
}

function isDecCode(c) {
  return ((0x30/* 0 */ <= c) && (c <= 0x39/* 9 */));
}

function resolveYamlInteger(data) {
  if (data === null) return false;

  var max = data.length,
      index = 0,
      hasDigits = false,
      ch;

  if (!max) return false;

  ch = data[index];

  // sign
  if (ch === '-' || ch === '+') {
    ch = data[++index];
  }

  if (ch === '0') {
    // 0
    if (index + 1 === max) return true;
    ch = data[++index];

    // base 2, base 8, base 16

    if (ch === 'b') {
      // base 2
      index++;

      for (; index < max; index++) {
        ch = data[index];
        if (ch === '_') continue;
        if (ch !== '0' && ch !== '1') return false;
        hasDigits = true;
      }
      return hasDigits && ch !== '_';
    }


    if (ch === 'x') {
      // base 16
      index++;

      for (; index < max; index++) {
        ch = data[index];
        if (ch === '_') continue;
        if (!isHexCode(data.charCodeAt(index))) return false;
        hasDigits = true;
      }
      return hasDigits && ch !== '_';
    }

    // base 8
    for (; index < max; index++) {
      ch = data[index];
      if (ch === '_') continue;
      if (!isOctCode(data.charCodeAt(index))) return false;
      hasDigits = true;
    }
    return hasDigits && ch !== '_';
  }

  // base 10 (except 0) or base 60

  // value should not start with `_`;
  if (ch === '_') return false;

  for (; index < max; index++) {
    ch = data[index];
    if (ch === '_') continue;
    if (ch === ':') break;
    if (!isDecCode(data.charCodeAt(index))) {
      return false;
    }
    hasDigits = true;
  }

  // Should have digits and should not end with `_`
  if (!hasDigits || ch === '_') return false;

  // if !base60 - done;
  if (ch !== ':') return true;

  // base60 almost not used, no needs to optimize
  return /^(:[0-5]?[0-9])+$/.test(data.slice(index));
}

function constructYamlInteger(data) {
  var value = data, sign = 1, ch, base, digits = [];

  if (value.indexOf('_') !== -1) {
    value = value.replace(/_/g, '');
  }

  ch = value[0];

  if (ch === '-' || ch === '+') {
    if (ch === '-') sign = -1;
    value = value.slice(1);
    ch = value[0];
  }

  if (value === '0') return 0;

  if (ch === '0') {
    if (value[1] === 'b') return sign * parseInt(value.slice(2), 2);
    if (value[1] === 'x') return sign * parseInt(value, 16);
    return sign * parseInt(value, 8);
  }

  if (value.indexOf(':') !== -1) {
    value.split(':').forEach(function (v) {
      digits.unshift(parseInt(v, 10));
    });

    value = 0;
    base = 1;

    digits.forEach(function (d) {
      value += (d * base);
      base *= 60;
    });

    return sign * value;

  }

  return sign * parseInt(value, 10);
}

function isInteger(object) {
  return (Object.prototype.toString.call(object)) === '[object Number]' &&
         (object % 1 === 0 && !common$3.isNegativeZero(object));
}

var int = new Type$a('tag:yaml.org,2002:int', {
  kind: 'scalar',
  resolve: resolveYamlInteger,
  construct: constructYamlInteger,
  predicate: isInteger,
  represent: {
    binary:      function (obj) { return obj >= 0 ? '0b' + obj.toString(2) : '-0b' + obj.toString(2).slice(1); },
    octal:       function (obj) { return obj >= 0 ? '0'  + obj.toString(8) : '-0'  + obj.toString(8).slice(1); },
    decimal:     function (obj) { return obj.toString(10); },
    /* eslint-disable max-len */
    hexadecimal: function (obj) { return obj >= 0 ? '0x' + obj.toString(16).toUpperCase() :  '-0x' + obj.toString(16).toUpperCase().slice(1); }
  },
  defaultStyle: 'decimal',
  styleAliases: {
    binary:      [ 2,  'bin' ],
    octal:       [ 8,  'oct' ],
    decimal:     [ 10, 'dec' ],
    hexadecimal: [ 16, 'hex' ]
  }
});

var common$2 = common$6;
var Type$9   = type;

var YAML_FLOAT_PATTERN = new RegExp(
  // 2.5e4, 2.5 and integers
  '^(?:[-+]?(?:0|[1-9][0-9_]*)(?:\\.[0-9_]*)?(?:[eE][-+]?[0-9]+)?' +
  // .2e4, .2
  // special case, seems not from spec
  '|\\.[0-9_]+(?:[eE][-+]?[0-9]+)?' +
  // 20:59
  '|[-+]?[0-9][0-9_]*(?::[0-5]?[0-9])+\\.[0-9_]*' +
  // .inf
  '|[-+]?\\.(?:inf|Inf|INF)' +
  // .nan
  '|\\.(?:nan|NaN|NAN))$');

function resolveYamlFloat(data) {
  if (data === null) return false;

  if (!YAML_FLOAT_PATTERN.test(data) ||
      // Quick hack to not allow integers end with `_`
      // Probably should update regexp & check speed
      data[data.length - 1] === '_') {
    return false;
  }

  return true;
}

function constructYamlFloat(data) {
  var value, sign, base, digits;

  value  = data.replace(/_/g, '').toLowerCase();
  sign   = value[0] === '-' ? -1 : 1;
  digits = [];

  if ('+-'.indexOf(value[0]) >= 0) {
    value = value.slice(1);
  }

  if (value === '.inf') {
    return (sign === 1) ? Number.POSITIVE_INFINITY : Number.NEGATIVE_INFINITY;

  } else if (value === '.nan') {
    return NaN;

  } else if (value.indexOf(':') >= 0) {
    value.split(':').forEach(function (v) {
      digits.unshift(parseFloat(v, 10));
    });

    value = 0.0;
    base = 1;

    digits.forEach(function (d) {
      value += d * base;
      base *= 60;
    });

    return sign * value;

  }
  return sign * parseFloat(value, 10);
}


var SCIENTIFIC_WITHOUT_DOT = /^[-+]?[0-9]+e/;

function representYamlFloat(object, style) {
  var res;

  if (isNaN(object)) {
    switch (style) {
      case 'lowercase': return '.nan';
      case 'uppercase': return '.NAN';
      case 'camelcase': return '.NaN';
    }
  } else if (Number.POSITIVE_INFINITY === object) {
    switch (style) {
      case 'lowercase': return '.inf';
      case 'uppercase': return '.INF';
      case 'camelcase': return '.Inf';
    }
  } else if (Number.NEGATIVE_INFINITY === object) {
    switch (style) {
      case 'lowercase': return '-.inf';
      case 'uppercase': return '-.INF';
      case 'camelcase': return '-.Inf';
    }
  } else if (common$2.isNegativeZero(object)) {
    return '-0.0';
  }

  res = object.toString(10);

  // JS stringifier can build scientific format without dots: 5e-100,
  // while YAML requres dot: 5.e-100. Fix it with simple hack

  return SCIENTIFIC_WITHOUT_DOT.test(res) ? res.replace('e', '.e') : res;
}

function isFloat(object) {
  return (Object.prototype.toString.call(object) === '[object Number]') &&
         (object % 1 !== 0 || common$2.isNegativeZero(object));
}

var float = new Type$9('tag:yaml.org,2002:float', {
  kind: 'scalar',
  resolve: resolveYamlFloat,
  construct: constructYamlFloat,
  predicate: isFloat,
  represent: representYamlFloat,
  defaultStyle: 'lowercase'
});

var Schema$3 = schema;


var json = new Schema$3({
  include: [
    failsafe
  ],
  implicit: [
    _null,
    bool,
    int,
    float
  ]
});

var Schema$2 = schema;


var core = new Schema$2({
  include: [
    json
  ]
});

var Type$8 = type;

var YAML_DATE_REGEXP = new RegExp(
  '^([0-9][0-9][0-9][0-9])'          + // [1] year
  '-([0-9][0-9])'                    + // [2] month
  '-([0-9][0-9])$');                   // [3] day

var YAML_TIMESTAMP_REGEXP = new RegExp(
  '^([0-9][0-9][0-9][0-9])'          + // [1] year
  '-([0-9][0-9]?)'                   + // [2] month
  '-([0-9][0-9]?)'                   + // [3] day
  '(?:[Tt]|[ \\t]+)'                 + // ...
  '([0-9][0-9]?)'                    + // [4] hour
  ':([0-9][0-9])'                    + // [5] minute
  ':([0-9][0-9])'                    + // [6] second
  '(?:\\.([0-9]*))?'                 + // [7] fraction
  '(?:[ \\t]*(Z|([-+])([0-9][0-9]?)' + // [8] tz [9] tz_sign [10] tz_hour
  '(?::([0-9][0-9]))?))?$');           // [11] tz_minute

function resolveYamlTimestamp(data) {
  if (data === null) return false;
  if (YAML_DATE_REGEXP.exec(data) !== null) return true;
  if (YAML_TIMESTAMP_REGEXP.exec(data) !== null) return true;
  return false;
}

function constructYamlTimestamp(data) {
  var match, year, month, day, hour, minute, second, fraction = 0,
      delta = null, tz_hour, tz_minute, date;

  match = YAML_DATE_REGEXP.exec(data);
  if (match === null) match = YAML_TIMESTAMP_REGEXP.exec(data);

  if (match === null) throw new Error('Date resolve error');

  // match: [1] year [2] month [3] day

  year = +(match[1]);
  month = +(match[2]) - 1; // JS month starts with 0
  day = +(match[3]);

  if (!match[4]) { // no hour
    return new Date(Date.UTC(year, month, day));
  }

  // match: [4] hour [5] minute [6] second [7] fraction

  hour = +(match[4]);
  minute = +(match[5]);
  second = +(match[6]);

  if (match[7]) {
    fraction = match[7].slice(0, 3);
    while (fraction.length < 3) { // milli-seconds
      fraction += '0';
    }
    fraction = +fraction;
  }

  // match: [8] tz [9] tz_sign [10] tz_hour [11] tz_minute

  if (match[9]) {
    tz_hour = +(match[10]);
    tz_minute = +(match[11] || 0);
    delta = (tz_hour * 60 + tz_minute) * 60000; // delta in mili-seconds
    if (match[9] === '-') delta = -delta;
  }

  date = new Date(Date.UTC(year, month, day, hour, minute, second, fraction));

  if (delta) date.setTime(date.getTime() - delta);

  return date;
}

function representYamlTimestamp(object /*, style*/) {
  return object.toISOString();
}

var timestamp = new Type$8('tag:yaml.org,2002:timestamp', {
  kind: 'scalar',
  resolve: resolveYamlTimestamp,
  construct: constructYamlTimestamp,
  instanceOf: Date,
  represent: representYamlTimestamp
});

var Type$7 = type;

function resolveYamlMerge(data) {
  return data === '<<' || data === null;
}

var merge = new Type$7('tag:yaml.org,2002:merge', {
  kind: 'scalar',
  resolve: resolveYamlMerge
});

function commonjsRequire(path) {
	throw new Error('Could not dynamically require "' + path + '". Please configure the dynamicRequireTargets or/and ignoreDynamicRequires option of @rollup/plugin-commonjs appropriately for this require call to work.');
}

/*eslint-disable no-bitwise*/

var NodeBuffer;

try {
  // A trick for browserified version, to not include `Buffer` shim
  var _require$1 = commonjsRequire;
  NodeBuffer = _require$1('buffer').Buffer;
} catch (__) {}

var Type$6       = type;


// [ 64, 65, 66 ] -> [ padding, CR, LF ]
var BASE64_MAP = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=\n\r';


function resolveYamlBinary(data) {
  if (data === null) return false;

  var code, idx, bitlen = 0, max = data.length, map = BASE64_MAP;

  // Convert one by one.
  for (idx = 0; idx < max; idx++) {
    code = map.indexOf(data.charAt(idx));

    // Skip CR/LF
    if (code > 64) continue;

    // Fail on illegal characters
    if (code < 0) return false;

    bitlen += 6;
  }

  // If there are any bits left, source was corrupted
  return (bitlen % 8) === 0;
}

function constructYamlBinary(data) {
  var idx, tailbits,
      input = data.replace(/[\r\n=]/g, ''), // remove CR/LF & padding to simplify scan
      max = input.length,
      map = BASE64_MAP,
      bits = 0,
      result = [];

  // Collect by 6*4 bits (3 bytes)

  for (idx = 0; idx < max; idx++) {
    if ((idx % 4 === 0) && idx) {
      result.push((bits >> 16) & 0xFF);
      result.push((bits >> 8) & 0xFF);
      result.push(bits & 0xFF);
    }

    bits = (bits << 6) | map.indexOf(input.charAt(idx));
  }

  // Dump tail

  tailbits = (max % 4) * 6;

  if (tailbits === 0) {
    result.push((bits >> 16) & 0xFF);
    result.push((bits >> 8) & 0xFF);
    result.push(bits & 0xFF);
  } else if (tailbits === 18) {
    result.push((bits >> 10) & 0xFF);
    result.push((bits >> 2) & 0xFF);
  } else if (tailbits === 12) {
    result.push((bits >> 4) & 0xFF);
  }

  // Wrap into Buffer for NodeJS and leave Array for browser
  if (NodeBuffer) {
    // Support node 6.+ Buffer API when available
    return NodeBuffer.from ? NodeBuffer.from(result) : new NodeBuffer(result);
  }

  return result;
}

function representYamlBinary(object /*, style*/) {
  var result = '', bits = 0, idx, tail,
      max = object.length,
      map = BASE64_MAP;

  // Convert every three bytes to 4 ASCII characters.

  for (idx = 0; idx < max; idx++) {
    if ((idx % 3 === 0) && idx) {
      result += map[(bits >> 18) & 0x3F];
      result += map[(bits >> 12) & 0x3F];
      result += map[(bits >> 6) & 0x3F];
      result += map[bits & 0x3F];
    }

    bits = (bits << 8) + object[idx];
  }

  // Dump tail

  tail = max % 3;

  if (tail === 0) {
    result += map[(bits >> 18) & 0x3F];
    result += map[(bits >> 12) & 0x3F];
    result += map[(bits >> 6) & 0x3F];
    result += map[bits & 0x3F];
  } else if (tail === 2) {
    result += map[(bits >> 10) & 0x3F];
    result += map[(bits >> 4) & 0x3F];
    result += map[(bits << 2) & 0x3F];
    result += map[64];
  } else if (tail === 1) {
    result += map[(bits >> 2) & 0x3F];
    result += map[(bits << 4) & 0x3F];
    result += map[64];
    result += map[64];
  }

  return result;
}

function isBinary(object) {
  return NodeBuffer && NodeBuffer.isBuffer(object);
}

var binary = new Type$6('tag:yaml.org,2002:binary', {
  kind: 'scalar',
  resolve: resolveYamlBinary,
  construct: constructYamlBinary,
  predicate: isBinary,
  represent: representYamlBinary
});

var Type$5 = type;

var _hasOwnProperty$3 = Object.prototype.hasOwnProperty;
var _toString$2       = Object.prototype.toString;

function resolveYamlOmap(data) {
  if (data === null) return true;

  var objectKeys = [], index, length, pair, pairKey, pairHasKey,
      object = data;

  for (index = 0, length = object.length; index < length; index += 1) {
    pair = object[index];
    pairHasKey = false;

    if (_toString$2.call(pair) !== '[object Object]') return false;

    for (pairKey in pair) {
      if (_hasOwnProperty$3.call(pair, pairKey)) {
        if (!pairHasKey) pairHasKey = true;
        else return false;
      }
    }

    if (!pairHasKey) return false;

    if (objectKeys.indexOf(pairKey) === -1) objectKeys.push(pairKey);
    else return false;
  }

  return true;
}

function constructYamlOmap(data) {
  return data !== null ? data : [];
}

var omap = new Type$5('tag:yaml.org,2002:omap', {
  kind: 'sequence',
  resolve: resolveYamlOmap,
  construct: constructYamlOmap
});

var Type$4 = type;

var _toString$1 = Object.prototype.toString;

function resolveYamlPairs(data) {
  if (data === null) return true;

  var index, length, pair, keys, result,
      object = data;

  result = new Array(object.length);

  for (index = 0, length = object.length; index < length; index += 1) {
    pair = object[index];

    if (_toString$1.call(pair) !== '[object Object]') return false;

    keys = Object.keys(pair);

    if (keys.length !== 1) return false;

    result[index] = [ keys[0], pair[keys[0]] ];
  }

  return true;
}

function constructYamlPairs(data) {
  if (data === null) return [];

  var index, length, pair, keys, result,
      object = data;

  result = new Array(object.length);

  for (index = 0, length = object.length; index < length; index += 1) {
    pair = object[index];

    keys = Object.keys(pair);

    result[index] = [ keys[0], pair[keys[0]] ];
  }

  return result;
}

var pairs = new Type$4('tag:yaml.org,2002:pairs', {
  kind: 'sequence',
  resolve: resolveYamlPairs,
  construct: constructYamlPairs
});

var Type$3 = type;

var _hasOwnProperty$2 = Object.prototype.hasOwnProperty;

function resolveYamlSet(data) {
  if (data === null) return true;

  var key, object = data;

  for (key in object) {
    if (_hasOwnProperty$2.call(object, key)) {
      if (object[key] !== null) return false;
    }
  }

  return true;
}

function constructYamlSet(data) {
  return data !== null ? data : {};
}

var set = new Type$3('tag:yaml.org,2002:set', {
  kind: 'mapping',
  resolve: resolveYamlSet,
  construct: constructYamlSet
});

var Schema$1 = schema;


var default_safe = new Schema$1({
  include: [
    core
  ],
  implicit: [
    timestamp,
    merge
  ],
  explicit: [
    binary,
    omap,
    pairs,
    set
  ]
});

var Type$2 = type;

function resolveJavascriptUndefined() {
  return true;
}

function constructJavascriptUndefined() {
  /*eslint-disable no-undefined*/
  return undefined;
}

function representJavascriptUndefined() {
  return '';
}

function isUndefined(object) {
  return typeof object === 'undefined';
}

var _undefined = new Type$2('tag:yaml.org,2002:js/undefined', {
  kind: 'scalar',
  resolve: resolveJavascriptUndefined,
  construct: constructJavascriptUndefined,
  predicate: isUndefined,
  represent: representJavascriptUndefined
});

var Type$1 = type;

function resolveJavascriptRegExp(data) {
  if (data === null) return false;
  if (data.length === 0) return false;

  var regexp = data,
      tail   = /\/([gim]*)$/.exec(data),
      modifiers = '';

  // if regexp starts with '/' it can have modifiers and must be properly closed
  // `/foo/gim` - modifiers tail can be maximum 3 chars
  if (regexp[0] === '/') {
    if (tail) modifiers = tail[1];

    if (modifiers.length > 3) return false;
    // if expression starts with /, is should be properly terminated
    if (regexp[regexp.length - modifiers.length - 1] !== '/') return false;
  }

  return true;
}

function constructJavascriptRegExp(data) {
  var regexp = data,
      tail   = /\/([gim]*)$/.exec(data),
      modifiers = '';

  // `/foo/gim` - tail can be maximum 4 chars
  if (regexp[0] === '/') {
    if (tail) modifiers = tail[1];
    regexp = regexp.slice(1, regexp.length - modifiers.length - 1);
  }

  return new RegExp(regexp, modifiers);
}

function representJavascriptRegExp(object /*, style*/) {
  var result = '/' + object.source + '/';

  if (object.global) result += 'g';
  if (object.multiline) result += 'm';
  if (object.ignoreCase) result += 'i';

  return result;
}

function isRegExp(object) {
  return Object.prototype.toString.call(object) === '[object RegExp]';
}

var regexp = new Type$1('tag:yaml.org,2002:js/regexp', {
  kind: 'scalar',
  resolve: resolveJavascriptRegExp,
  construct: constructJavascriptRegExp,
  predicate: isRegExp,
  represent: representJavascriptRegExp
});

var esprima;

// Browserified version does not have esprima
//
// 1. For node.js just require module as deps
// 2. For browser try to require mudule via external AMD system.
//    If not found - try to fallback to window.esprima. If not
//    found too - then fail to parse.
//
try {
  // workaround to exclude package from browserify list.
  var _require = commonjsRequire;
  esprima = _require('esprima');
} catch (_) {
  /*global window */
  if (typeof window !== 'undefined') esprima = window.esprima;
}

var Type = type;

function resolveJavascriptFunction(data) {
  if (data === null) return false;

  try {
    var source = '(' + data + ')',
        ast    = esprima.parse(source, { range: true });

    if (ast.type                    !== 'Program'             ||
        ast.body.length             !== 1                     ||
        ast.body[0].type            !== 'ExpressionStatement' ||
        (ast.body[0].expression.type !== 'ArrowFunctionExpression' &&
          ast.body[0].expression.type !== 'FunctionExpression')) {
      return false;
    }

    return true;
  } catch (err) {
    return false;
  }
}

function constructJavascriptFunction(data) {
  /*jslint evil:true*/

  var source = '(' + data + ')',
      ast    = esprima.parse(source, { range: true }),
      params = [],
      body;

  if (ast.type                    !== 'Program'             ||
      ast.body.length             !== 1                     ||
      ast.body[0].type            !== 'ExpressionStatement' ||
      (ast.body[0].expression.type !== 'ArrowFunctionExpression' &&
        ast.body[0].expression.type !== 'FunctionExpression')) {
    throw new Error('Failed to resolve function');
  }

  ast.body[0].expression.params.forEach(function (param) {
    params.push(param.name);
  });

  body = ast.body[0].expression.body.range;

  // Esprima's ranges include the first '{' and the last '}' characters on
  // function expressions. So cut them out.
  if (ast.body[0].expression.body.type === 'BlockStatement') {
    /*eslint-disable no-new-func*/
    return new Function(params, source.slice(body[0] + 1, body[1] - 1));
  }
  // ES6 arrow functions can omit the BlockStatement. In that case, just return
  // the body.
  /*eslint-disable no-new-func*/
  return new Function(params, 'return ' + source.slice(body[0], body[1]));
}

function representJavascriptFunction(object /*, style*/) {
  return object.toString();
}

function isFunction(object) {
  return Object.prototype.toString.call(object) === '[object Function]';
}

var _function = new Type('tag:yaml.org,2002:js/function', {
  kind: 'scalar',
  resolve: resolveJavascriptFunction,
  construct: constructJavascriptFunction,
  predicate: isFunction,
  represent: representJavascriptFunction
});

var Schema = schema;


var default_full = Schema.DEFAULT = new Schema({
  include: [
    default_safe
  ],
  explicit: [
    _undefined,
    regexp,
    _function
  ]
});

/*eslint-disable max-len,no-use-before-define*/

var common$1              = common$6;
var YAMLException$1       = exception;
var Mark                = mark;
var DEFAULT_SAFE_SCHEMA$1 = default_safe;
var DEFAULT_FULL_SCHEMA$1 = default_full;


var _hasOwnProperty$1 = Object.prototype.hasOwnProperty;


var CONTEXT_FLOW_IN   = 1;
var CONTEXT_FLOW_OUT  = 2;
var CONTEXT_BLOCK_IN  = 3;
var CONTEXT_BLOCK_OUT = 4;


var CHOMPING_CLIP  = 1;
var CHOMPING_STRIP = 2;
var CHOMPING_KEEP  = 3;


var PATTERN_NON_PRINTABLE         = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x84\x86-\x9F\uFFFE\uFFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF]/;
var PATTERN_NON_ASCII_LINE_BREAKS = /[\x85\u2028\u2029]/;
var PATTERN_FLOW_INDICATORS       = /[,\[\]\{\}]/;
var PATTERN_TAG_HANDLE            = /^(?:!|!!|![a-z\-]+!)$/i;
var PATTERN_TAG_URI               = /^(?:!|[^,\[\]\{\}])(?:%[0-9a-f]{2}|[0-9a-z\-#;\/\?:@&=\+\$,_\.!~\*'\(\)\[\]])*$/i;


function _class(obj) { return Object.prototype.toString.call(obj); }

function is_EOL(c) {
  return (c === 0x0A/* LF */) || (c === 0x0D/* CR */);
}

function is_WHITE_SPACE(c) {
  return (c === 0x09/* Tab */) || (c === 0x20/* Space */);
}

function is_WS_OR_EOL(c) {
  return (c === 0x09/* Tab */) ||
         (c === 0x20/* Space */) ||
         (c === 0x0A/* LF */) ||
         (c === 0x0D/* CR */);
}

function is_FLOW_INDICATOR(c) {
  return c === 0x2C/* , */ ||
         c === 0x5B/* [ */ ||
         c === 0x5D/* ] */ ||
         c === 0x7B/* { */ ||
         c === 0x7D/* } */;
}

function fromHexCode(c) {
  var lc;

  if ((0x30/* 0 */ <= c) && (c <= 0x39/* 9 */)) {
    return c - 0x30;
  }

  /*eslint-disable no-bitwise*/
  lc = c | 0x20;

  if ((0x61/* a */ <= lc) && (lc <= 0x66/* f */)) {
    return lc - 0x61 + 10;
  }

  return -1;
}

function escapedHexLen(c) {
  if (c === 0x78/* x */) { return 2; }
  if (c === 0x75/* u */) { return 4; }
  if (c === 0x55/* U */) { return 8; }
  return 0;
}

function fromDecimalCode(c) {
  if ((0x30/* 0 */ <= c) && (c <= 0x39/* 9 */)) {
    return c - 0x30;
  }

  return -1;
}

function simpleEscapeSequence(c) {
  /* eslint-disable indent */
  return (c === 0x30/* 0 */) ? '\x00' :
        (c === 0x61/* a */) ? '\x07' :
        (c === 0x62/* b */) ? '\x08' :
        (c === 0x74/* t */) ? '\x09' :
        (c === 0x09/* Tab */) ? '\x09' :
        (c === 0x6E/* n */) ? '\x0A' :
        (c === 0x76/* v */) ? '\x0B' :
        (c === 0x66/* f */) ? '\x0C' :
        (c === 0x72/* r */) ? '\x0D' :
        (c === 0x65/* e */) ? '\x1B' :
        (c === 0x20/* Space */) ? ' ' :
        (c === 0x22/* " */) ? '\x22' :
        (c === 0x2F/* / */) ? '/' :
        (c === 0x5C/* \ */) ? '\x5C' :
        (c === 0x4E/* N */) ? '\x85' :
        (c === 0x5F/* _ */) ? '\xA0' :
        (c === 0x4C/* L */) ? '\u2028' :
        (c === 0x50/* P */) ? '\u2029' : '';
}

function charFromCodepoint(c) {
  if (c <= 0xFFFF) {
    return String.fromCharCode(c);
  }
  // Encode UTF-16 surrogate pair
  // https://en.wikipedia.org/wiki/UTF-16#Code_points_U.2B010000_to_U.2B10FFFF
  return String.fromCharCode(
    ((c - 0x010000) >> 10) + 0xD800,
    ((c - 0x010000) & 0x03FF) + 0xDC00
  );
}

var simpleEscapeCheck = new Array(256); // integer, for fast access
var simpleEscapeMap = new Array(256);
for (var i = 0; i < 256; i++) {
  simpleEscapeCheck[i] = simpleEscapeSequence(i) ? 1 : 0;
  simpleEscapeMap[i] = simpleEscapeSequence(i);
}


function State$1(input, options) {
  this.input = input;

  this.filename  = options['filename']  || null;
  this.schema    = options['schema']    || DEFAULT_FULL_SCHEMA$1;
  this.onWarning = options['onWarning'] || null;
  this.legacy    = options['legacy']    || false;
  this.json      = options['json']      || false;
  this.listener  = options['listener']  || null;

  this.implicitTypes = this.schema.compiledImplicit;
  this.typeMap       = this.schema.compiledTypeMap;

  this.length     = input.length;
  this.position   = 0;
  this.line       = 0;
  this.lineStart  = 0;
  this.lineIndent = 0;

  this.documents = [];

  /*
  this.version;
  this.checkLineBreaks;
  this.tagMap;
  this.anchorMap;
  this.tag;
  this.anchor;
  this.kind;
  this.result;*/

}


function generateError(state, message) {
  return new YAMLException$1(
    message,
    new Mark(state.filename, state.input, state.position, state.line, (state.position - state.lineStart)));
}

function throwError(state, message) {
  throw generateError(state, message);
}

function throwWarning(state, message) {
  if (state.onWarning) {
    state.onWarning.call(null, generateError(state, message));
  }
}


var directiveHandlers = {

  YAML: function handleYamlDirective(state, name, args) {

    var match, major, minor;

    if (state.version !== null) {
      throwError(state, 'duplication of %YAML directive');
    }

    if (args.length !== 1) {
      throwError(state, 'YAML directive accepts exactly one argument');
    }

    match = /^([0-9]+)\.([0-9]+)$/.exec(args[0]);

    if (match === null) {
      throwError(state, 'ill-formed argument of the YAML directive');
    }

    major = parseInt(match[1], 10);
    minor = parseInt(match[2], 10);

    if (major !== 1) {
      throwError(state, 'unacceptable YAML version of the document');
    }

    state.version = args[0];
    state.checkLineBreaks = (minor < 2);

    if (minor !== 1 && minor !== 2) {
      throwWarning(state, 'unsupported YAML version of the document');
    }
  },

  TAG: function handleTagDirective(state, name, args) {

    var handle, prefix;

    if (args.length !== 2) {
      throwError(state, 'TAG directive accepts exactly two arguments');
    }

    handle = args[0];
    prefix = args[1];

    if (!PATTERN_TAG_HANDLE.test(handle)) {
      throwError(state, 'ill-formed tag handle (first argument) of the TAG directive');
    }

    if (_hasOwnProperty$1.call(state.tagMap, handle)) {
      throwError(state, 'there is a previously declared suffix for "' + handle + '" tag handle');
    }

    if (!PATTERN_TAG_URI.test(prefix)) {
      throwError(state, 'ill-formed tag prefix (second argument) of the TAG directive');
    }

    state.tagMap[handle] = prefix;
  }
};


function captureSegment(state, start, end, checkJson) {
  var _position, _length, _character, _result;

  if (start < end) {
    _result = state.input.slice(start, end);

    if (checkJson) {
      for (_position = 0, _length = _result.length; _position < _length; _position += 1) {
        _character = _result.charCodeAt(_position);
        if (!(_character === 0x09 ||
              (0x20 <= _character && _character <= 0x10FFFF))) {
          throwError(state, 'expected valid JSON character');
        }
      }
    } else if (PATTERN_NON_PRINTABLE.test(_result)) {
      throwError(state, 'the stream contains non-printable characters');
    }

    state.result += _result;
  }
}

function mergeMappings(state, destination, source, overridableKeys) {
  var sourceKeys, key, index, quantity;

  if (!common$1.isObject(source)) {
    throwError(state, 'cannot merge mappings; the provided source object is unacceptable');
  }

  sourceKeys = Object.keys(source);

  for (index = 0, quantity = sourceKeys.length; index < quantity; index += 1) {
    key = sourceKeys[index];

    if (!_hasOwnProperty$1.call(destination, key)) {
      destination[key] = source[key];
      overridableKeys[key] = true;
    }
  }
}

function storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, valueNode, startLine, startPos) {
  var index, quantity;

  // The output is a plain object here, so keys can only be strings.
  // We need to convert keyNode to a string, but doing so can hang the process
  // (deeply nested arrays that explode exponentially using aliases).
  if (Array.isArray(keyNode)) {
    keyNode = Array.prototype.slice.call(keyNode);

    for (index = 0, quantity = keyNode.length; index < quantity; index += 1) {
      if (Array.isArray(keyNode[index])) {
        throwError(state, 'nested arrays are not supported inside keys');
      }

      if (typeof keyNode === 'object' && _class(keyNode[index]) === '[object Object]') {
        keyNode[index] = '[object Object]';
      }
    }
  }

  // Avoid code execution in load() via toString property
  // (still use its own toString for arrays, timestamps,
  // and whatever user schema extensions happen to have @@toStringTag)
  if (typeof keyNode === 'object' && _class(keyNode) === '[object Object]') {
    keyNode = '[object Object]';
  }


  keyNode = String(keyNode);

  if (_result === null) {
    _result = {};
  }

  if (keyTag === 'tag:yaml.org,2002:merge') {
    if (Array.isArray(valueNode)) {
      for (index = 0, quantity = valueNode.length; index < quantity; index += 1) {
        mergeMappings(state, _result, valueNode[index], overridableKeys);
      }
    } else {
      mergeMappings(state, _result, valueNode, overridableKeys);
    }
  } else {
    if (!state.json &&
        !_hasOwnProperty$1.call(overridableKeys, keyNode) &&
        _hasOwnProperty$1.call(_result, keyNode)) {
      state.line = startLine || state.line;
      state.position = startPos || state.position;
      throwError(state, 'duplicated mapping key');
    }
    _result[keyNode] = valueNode;
    delete overridableKeys[keyNode];
  }

  return _result;
}

function readLineBreak(state) {
  var ch;

  ch = state.input.charCodeAt(state.position);

  if (ch === 0x0A/* LF */) {
    state.position++;
  } else if (ch === 0x0D/* CR */) {
    state.position++;
    if (state.input.charCodeAt(state.position) === 0x0A/* LF */) {
      state.position++;
    }
  } else {
    throwError(state, 'a line break is expected');
  }

  state.line += 1;
  state.lineStart = state.position;
}

function skipSeparationSpace(state, allowComments, checkIndent) {
  var lineBreaks = 0,
      ch = state.input.charCodeAt(state.position);

  while (ch !== 0) {
    while (is_WHITE_SPACE(ch)) {
      ch = state.input.charCodeAt(++state.position);
    }

    if (allowComments && ch === 0x23/* # */) {
      do {
        ch = state.input.charCodeAt(++state.position);
      } while (ch !== 0x0A/* LF */ && ch !== 0x0D/* CR */ && ch !== 0);
    }

    if (is_EOL(ch)) {
      readLineBreak(state);

      ch = state.input.charCodeAt(state.position);
      lineBreaks++;
      state.lineIndent = 0;

      while (ch === 0x20/* Space */) {
        state.lineIndent++;
        ch = state.input.charCodeAt(++state.position);
      }
    } else {
      break;
    }
  }

  if (checkIndent !== -1 && lineBreaks !== 0 && state.lineIndent < checkIndent) {
    throwWarning(state, 'deficient indentation');
  }

  return lineBreaks;
}

function testDocumentSeparator(state) {
  var _position = state.position,
      ch;

  ch = state.input.charCodeAt(_position);

  // Condition state.position === state.lineStart is tested
  // in parent on each call, for efficiency. No needs to test here again.
  if ((ch === 0x2D/* - */ || ch === 0x2E/* . */) &&
      ch === state.input.charCodeAt(_position + 1) &&
      ch === state.input.charCodeAt(_position + 2)) {

    _position += 3;

    ch = state.input.charCodeAt(_position);

    if (ch === 0 || is_WS_OR_EOL(ch)) {
      return true;
    }
  }

  return false;
}

function writeFoldedLines(state, count) {
  if (count === 1) {
    state.result += ' ';
  } else if (count > 1) {
    state.result += common$1.repeat('\n', count - 1);
  }
}


function readPlainScalar(state, nodeIndent, withinFlowCollection) {
  var preceding,
      following,
      captureStart,
      captureEnd,
      hasPendingContent,
      _line,
      _lineStart,
      _lineIndent,
      _kind = state.kind,
      _result = state.result,
      ch;

  ch = state.input.charCodeAt(state.position);

  if (is_WS_OR_EOL(ch)      ||
      is_FLOW_INDICATOR(ch) ||
      ch === 0x23/* # */    ||
      ch === 0x26/* & */    ||
      ch === 0x2A/* * */    ||
      ch === 0x21/* ! */    ||
      ch === 0x7C/* | */    ||
      ch === 0x3E/* > */    ||
      ch === 0x27/* ' */    ||
      ch === 0x22/* " */    ||
      ch === 0x25/* % */    ||
      ch === 0x40/* @ */    ||
      ch === 0x60/* ` */) {
    return false;
  }

  if (ch === 0x3F/* ? */ || ch === 0x2D/* - */) {
    following = state.input.charCodeAt(state.position + 1);

    if (is_WS_OR_EOL(following) ||
        withinFlowCollection && is_FLOW_INDICATOR(following)) {
      return false;
    }
  }

  state.kind = 'scalar';
  state.result = '';
  captureStart = captureEnd = state.position;
  hasPendingContent = false;

  while (ch !== 0) {
    if (ch === 0x3A/* : */) {
      following = state.input.charCodeAt(state.position + 1);

      if (is_WS_OR_EOL(following) ||
          withinFlowCollection && is_FLOW_INDICATOR(following)) {
        break;
      }

    } else if (ch === 0x23/* # */) {
      preceding = state.input.charCodeAt(state.position - 1);

      if (is_WS_OR_EOL(preceding)) {
        break;
      }

    } else if ((state.position === state.lineStart && testDocumentSeparator(state)) ||
               withinFlowCollection && is_FLOW_INDICATOR(ch)) {
      break;

    } else if (is_EOL(ch)) {
      _line = state.line;
      _lineStart = state.lineStart;
      _lineIndent = state.lineIndent;
      skipSeparationSpace(state, false, -1);

      if (state.lineIndent >= nodeIndent) {
        hasPendingContent = true;
        ch = state.input.charCodeAt(state.position);
        continue;
      } else {
        state.position = captureEnd;
        state.line = _line;
        state.lineStart = _lineStart;
        state.lineIndent = _lineIndent;
        break;
      }
    }

    if (hasPendingContent) {
      captureSegment(state, captureStart, captureEnd, false);
      writeFoldedLines(state, state.line - _line);
      captureStart = captureEnd = state.position;
      hasPendingContent = false;
    }

    if (!is_WHITE_SPACE(ch)) {
      captureEnd = state.position + 1;
    }

    ch = state.input.charCodeAt(++state.position);
  }

  captureSegment(state, captureStart, captureEnd, false);

  if (state.result) {
    return true;
  }

  state.kind = _kind;
  state.result = _result;
  return false;
}

function readSingleQuotedScalar(state, nodeIndent) {
  var ch,
      captureStart, captureEnd;

  ch = state.input.charCodeAt(state.position);

  if (ch !== 0x27/* ' */) {
    return false;
  }

  state.kind = 'scalar';
  state.result = '';
  state.position++;
  captureStart = captureEnd = state.position;

  while ((ch = state.input.charCodeAt(state.position)) !== 0) {
    if (ch === 0x27/* ' */) {
      captureSegment(state, captureStart, state.position, true);
      ch = state.input.charCodeAt(++state.position);

      if (ch === 0x27/* ' */) {
        captureStart = state.position;
        state.position++;
        captureEnd = state.position;
      } else {
        return true;
      }

    } else if (is_EOL(ch)) {
      captureSegment(state, captureStart, captureEnd, true);
      writeFoldedLines(state, skipSeparationSpace(state, false, nodeIndent));
      captureStart = captureEnd = state.position;

    } else if (state.position === state.lineStart && testDocumentSeparator(state)) {
      throwError(state, 'unexpected end of the document within a single quoted scalar');

    } else {
      state.position++;
      captureEnd = state.position;
    }
  }

  throwError(state, 'unexpected end of the stream within a single quoted scalar');
}

function readDoubleQuotedScalar(state, nodeIndent) {
  var captureStart,
      captureEnd,
      hexLength,
      hexResult,
      tmp,
      ch;

  ch = state.input.charCodeAt(state.position);

  if (ch !== 0x22/* " */) {
    return false;
  }

  state.kind = 'scalar';
  state.result = '';
  state.position++;
  captureStart = captureEnd = state.position;

  while ((ch = state.input.charCodeAt(state.position)) !== 0) {
    if (ch === 0x22/* " */) {
      captureSegment(state, captureStart, state.position, true);
      state.position++;
      return true;

    } else if (ch === 0x5C/* \ */) {
      captureSegment(state, captureStart, state.position, true);
      ch = state.input.charCodeAt(++state.position);

      if (is_EOL(ch)) {
        skipSeparationSpace(state, false, nodeIndent);

        // TODO: rework to inline fn with no type cast?
      } else if (ch < 256 && simpleEscapeCheck[ch]) {
        state.result += simpleEscapeMap[ch];
        state.position++;

      } else if ((tmp = escapedHexLen(ch)) > 0) {
        hexLength = tmp;
        hexResult = 0;

        for (; hexLength > 0; hexLength--) {
          ch = state.input.charCodeAt(++state.position);

          if ((tmp = fromHexCode(ch)) >= 0) {
            hexResult = (hexResult << 4) + tmp;

          } else {
            throwError(state, 'expected hexadecimal character');
          }
        }

        state.result += charFromCodepoint(hexResult);

        state.position++;

      } else {
        throwError(state, 'unknown escape sequence');
      }

      captureStart = captureEnd = state.position;

    } else if (is_EOL(ch)) {
      captureSegment(state, captureStart, captureEnd, true);
      writeFoldedLines(state, skipSeparationSpace(state, false, nodeIndent));
      captureStart = captureEnd = state.position;

    } else if (state.position === state.lineStart && testDocumentSeparator(state)) {
      throwError(state, 'unexpected end of the document within a double quoted scalar');

    } else {
      state.position++;
      captureEnd = state.position;
    }
  }

  throwError(state, 'unexpected end of the stream within a double quoted scalar');
}

function readFlowCollection(state, nodeIndent) {
  var readNext = true,
      _line,
      _tag     = state.tag,
      _result,
      _anchor  = state.anchor,
      following,
      terminator,
      isPair,
      isExplicitPair,
      isMapping,
      overridableKeys = {},
      keyNode,
      keyTag,
      valueNode,
      ch;

  ch = state.input.charCodeAt(state.position);

  if (ch === 0x5B/* [ */) {
    terminator = 0x5D;/* ] */
    isMapping = false;
    _result = [];
  } else if (ch === 0x7B/* { */) {
    terminator = 0x7D;/* } */
    isMapping = true;
    _result = {};
  } else {
    return false;
  }

  if (state.anchor !== null) {
    state.anchorMap[state.anchor] = _result;
  }

  ch = state.input.charCodeAt(++state.position);

  while (ch !== 0) {
    skipSeparationSpace(state, true, nodeIndent);

    ch = state.input.charCodeAt(state.position);

    if (ch === terminator) {
      state.position++;
      state.tag = _tag;
      state.anchor = _anchor;
      state.kind = isMapping ? 'mapping' : 'sequence';
      state.result = _result;
      return true;
    } else if (!readNext) {
      throwError(state, 'missed comma between flow collection entries');
    }

    keyTag = keyNode = valueNode = null;
    isPair = isExplicitPair = false;

    if (ch === 0x3F/* ? */) {
      following = state.input.charCodeAt(state.position + 1);

      if (is_WS_OR_EOL(following)) {
        isPair = isExplicitPair = true;
        state.position++;
        skipSeparationSpace(state, true, nodeIndent);
      }
    }

    _line = state.line;
    composeNode(state, nodeIndent, CONTEXT_FLOW_IN, false, true);
    keyTag = state.tag;
    keyNode = state.result;
    skipSeparationSpace(state, true, nodeIndent);

    ch = state.input.charCodeAt(state.position);

    if ((isExplicitPair || state.line === _line) && ch === 0x3A/* : */) {
      isPair = true;
      ch = state.input.charCodeAt(++state.position);
      skipSeparationSpace(state, true, nodeIndent);
      composeNode(state, nodeIndent, CONTEXT_FLOW_IN, false, true);
      valueNode = state.result;
    }

    if (isMapping) {
      storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, valueNode);
    } else if (isPair) {
      _result.push(storeMappingPair(state, null, overridableKeys, keyTag, keyNode, valueNode));
    } else {
      _result.push(keyNode);
    }

    skipSeparationSpace(state, true, nodeIndent);

    ch = state.input.charCodeAt(state.position);

    if (ch === 0x2C/* , */) {
      readNext = true;
      ch = state.input.charCodeAt(++state.position);
    } else {
      readNext = false;
    }
  }

  throwError(state, 'unexpected end of the stream within a flow collection');
}

function readBlockScalar(state, nodeIndent) {
  var captureStart,
      folding,
      chomping       = CHOMPING_CLIP,
      didReadContent = false,
      detectedIndent = false,
      textIndent     = nodeIndent,
      emptyLines     = 0,
      atMoreIndented = false,
      tmp,
      ch;

  ch = state.input.charCodeAt(state.position);

  if (ch === 0x7C/* | */) {
    folding = false;
  } else if (ch === 0x3E/* > */) {
    folding = true;
  } else {
    return false;
  }

  state.kind = 'scalar';
  state.result = '';

  while (ch !== 0) {
    ch = state.input.charCodeAt(++state.position);

    if (ch === 0x2B/* + */ || ch === 0x2D/* - */) {
      if (CHOMPING_CLIP === chomping) {
        chomping = (ch === 0x2B/* + */) ? CHOMPING_KEEP : CHOMPING_STRIP;
      } else {
        throwError(state, 'repeat of a chomping mode identifier');
      }

    } else if ((tmp = fromDecimalCode(ch)) >= 0) {
      if (tmp === 0) {
        throwError(state, 'bad explicit indentation width of a block scalar; it cannot be less than one');
      } else if (!detectedIndent) {
        textIndent = nodeIndent + tmp - 1;
        detectedIndent = true;
      } else {
        throwError(state, 'repeat of an indentation width identifier');
      }

    } else {
      break;
    }
  }

  if (is_WHITE_SPACE(ch)) {
    do { ch = state.input.charCodeAt(++state.position); }
    while (is_WHITE_SPACE(ch));

    if (ch === 0x23/* # */) {
      do { ch = state.input.charCodeAt(++state.position); }
      while (!is_EOL(ch) && (ch !== 0));
    }
  }

  while (ch !== 0) {
    readLineBreak(state);
    state.lineIndent = 0;

    ch = state.input.charCodeAt(state.position);

    while ((!detectedIndent || state.lineIndent < textIndent) &&
           (ch === 0x20/* Space */)) {
      state.lineIndent++;
      ch = state.input.charCodeAt(++state.position);
    }

    if (!detectedIndent && state.lineIndent > textIndent) {
      textIndent = state.lineIndent;
    }

    if (is_EOL(ch)) {
      emptyLines++;
      continue;
    }

    // End of the scalar.
    if (state.lineIndent < textIndent) {

      // Perform the chomping.
      if (chomping === CHOMPING_KEEP) {
        state.result += common$1.repeat('\n', didReadContent ? 1 + emptyLines : emptyLines);
      } else if (chomping === CHOMPING_CLIP) {
        if (didReadContent) { // i.e. only if the scalar is not empty.
          state.result += '\n';
        }
      }

      // Break this `while` cycle and go to the funciton's epilogue.
      break;
    }

    // Folded style: use fancy rules to handle line breaks.
    if (folding) {

      // Lines starting with white space characters (more-indented lines) are not folded.
      if (is_WHITE_SPACE(ch)) {
        atMoreIndented = true;
        // except for the first content line (cf. Example 8.1)
        state.result += common$1.repeat('\n', didReadContent ? 1 + emptyLines : emptyLines);

      // End of more-indented block.
      } else if (atMoreIndented) {
        atMoreIndented = false;
        state.result += common$1.repeat('\n', emptyLines + 1);

      // Just one line break - perceive as the same line.
      } else if (emptyLines === 0) {
        if (didReadContent) { // i.e. only if we have already read some scalar content.
          state.result += ' ';
        }

      // Several line breaks - perceive as different lines.
      } else {
        state.result += common$1.repeat('\n', emptyLines);
      }

    // Literal style: just add exact number of line breaks between content lines.
    } else {
      // Keep all line breaks except the header line break.
      state.result += common$1.repeat('\n', didReadContent ? 1 + emptyLines : emptyLines);
    }

    didReadContent = true;
    detectedIndent = true;
    emptyLines = 0;
    captureStart = state.position;

    while (!is_EOL(ch) && (ch !== 0)) {
      ch = state.input.charCodeAt(++state.position);
    }

    captureSegment(state, captureStart, state.position, false);
  }

  return true;
}

function readBlockSequence(state, nodeIndent) {
  var _line,
      _tag      = state.tag,
      _anchor   = state.anchor,
      _result   = [],
      following,
      detected  = false,
      ch;

  if (state.anchor !== null) {
    state.anchorMap[state.anchor] = _result;
  }

  ch = state.input.charCodeAt(state.position);

  while (ch !== 0) {

    if (ch !== 0x2D/* - */) {
      break;
    }

    following = state.input.charCodeAt(state.position + 1);

    if (!is_WS_OR_EOL(following)) {
      break;
    }

    detected = true;
    state.position++;

    if (skipSeparationSpace(state, true, -1)) {
      if (state.lineIndent <= nodeIndent) {
        _result.push(null);
        ch = state.input.charCodeAt(state.position);
        continue;
      }
    }

    _line = state.line;
    composeNode(state, nodeIndent, CONTEXT_BLOCK_IN, false, true);
    _result.push(state.result);
    skipSeparationSpace(state, true, -1);

    ch = state.input.charCodeAt(state.position);

    if ((state.line === _line || state.lineIndent > nodeIndent) && (ch !== 0)) {
      throwError(state, 'bad indentation of a sequence entry');
    } else if (state.lineIndent < nodeIndent) {
      break;
    }
  }

  if (detected) {
    state.tag = _tag;
    state.anchor = _anchor;
    state.kind = 'sequence';
    state.result = _result;
    return true;
  }
  return false;
}

function readBlockMapping(state, nodeIndent, flowIndent) {
  var following,
      allowCompact,
      _line,
      _pos,
      _tag          = state.tag,
      _anchor       = state.anchor,
      _result       = {},
      overridableKeys = {},
      keyTag        = null,
      keyNode       = null,
      valueNode     = null,
      atExplicitKey = false,
      detected      = false,
      ch;

  if (state.anchor !== null) {
    state.anchorMap[state.anchor] = _result;
  }

  ch = state.input.charCodeAt(state.position);

  while (ch !== 0) {
    following = state.input.charCodeAt(state.position + 1);
    _line = state.line; // Save the current line.
    _pos = state.position;

    //
    // Explicit notation case. There are two separate blocks:
    // first for the key (denoted by "?") and second for the value (denoted by ":")
    //
    if ((ch === 0x3F/* ? */ || ch === 0x3A/* : */) && is_WS_OR_EOL(following)) {

      if (ch === 0x3F/* ? */) {
        if (atExplicitKey) {
          storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, null);
          keyTag = keyNode = valueNode = null;
        }

        detected = true;
        atExplicitKey = true;
        allowCompact = true;

      } else if (atExplicitKey) {
        // i.e. 0x3A/* : */ === character after the explicit key.
        atExplicitKey = false;
        allowCompact = true;

      } else {
        throwError(state, 'incomplete explicit mapping pair; a key node is missed; or followed by a non-tabulated empty line');
      }

      state.position += 1;
      ch = following;

    //
    // Implicit notation case. Flow-style node as the key first, then ":", and the value.
    //
    } else if (composeNode(state, flowIndent, CONTEXT_FLOW_OUT, false, true)) {

      if (state.line === _line) {
        ch = state.input.charCodeAt(state.position);

        while (is_WHITE_SPACE(ch)) {
          ch = state.input.charCodeAt(++state.position);
        }

        if (ch === 0x3A/* : */) {
          ch = state.input.charCodeAt(++state.position);

          if (!is_WS_OR_EOL(ch)) {
            throwError(state, 'a whitespace character is expected after the key-value separator within a block mapping');
          }

          if (atExplicitKey) {
            storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, null);
            keyTag = keyNode = valueNode = null;
          }

          detected = true;
          atExplicitKey = false;
          allowCompact = false;
          keyTag = state.tag;
          keyNode = state.result;

        } else if (detected) {
          throwError(state, 'can not read an implicit mapping pair; a colon is missed');

        } else {
          state.tag = _tag;
          state.anchor = _anchor;
          return true; // Keep the result of `composeNode`.
        }

      } else if (detected) {
        throwError(state, 'can not read a block mapping entry; a multiline key may not be an implicit key');

      } else {
        state.tag = _tag;
        state.anchor = _anchor;
        return true; // Keep the result of `composeNode`.
      }

    } else {
      break; // Reading is done. Go to the epilogue.
    }

    //
    // Common reading code for both explicit and implicit notations.
    //
    if (state.line === _line || state.lineIndent > nodeIndent) {
      if (composeNode(state, nodeIndent, CONTEXT_BLOCK_OUT, true, allowCompact)) {
        if (atExplicitKey) {
          keyNode = state.result;
        } else {
          valueNode = state.result;
        }
      }

      if (!atExplicitKey) {
        storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, valueNode, _line, _pos);
        keyTag = keyNode = valueNode = null;
      }

      skipSeparationSpace(state, true, -1);
      ch = state.input.charCodeAt(state.position);
    }

    if (state.lineIndent > nodeIndent && (ch !== 0)) {
      throwError(state, 'bad indentation of a mapping entry');
    } else if (state.lineIndent < nodeIndent) {
      break;
    }
  }

  //
  // Epilogue.
  //

  // Special case: last mapping's node contains only the key in explicit notation.
  if (atExplicitKey) {
    storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, null);
  }

  // Expose the resulting mapping.
  if (detected) {
    state.tag = _tag;
    state.anchor = _anchor;
    state.kind = 'mapping';
    state.result = _result;
  }

  return detected;
}

function readTagProperty(state) {
  var _position,
      isVerbatim = false,
      isNamed    = false,
      tagHandle,
      tagName,
      ch;

  ch = state.input.charCodeAt(state.position);

  if (ch !== 0x21/* ! */) return false;

  if (state.tag !== null) {
    throwError(state, 'duplication of a tag property');
  }

  ch = state.input.charCodeAt(++state.position);

  if (ch === 0x3C/* < */) {
    isVerbatim = true;
    ch = state.input.charCodeAt(++state.position);

  } else if (ch === 0x21/* ! */) {
    isNamed = true;
    tagHandle = '!!';
    ch = state.input.charCodeAt(++state.position);

  } else {
    tagHandle = '!';
  }

  _position = state.position;

  if (isVerbatim) {
    do { ch = state.input.charCodeAt(++state.position); }
    while (ch !== 0 && ch !== 0x3E/* > */);

    if (state.position < state.length) {
      tagName = state.input.slice(_position, state.position);
      ch = state.input.charCodeAt(++state.position);
    } else {
      throwError(state, 'unexpected end of the stream within a verbatim tag');
    }
  } else {
    while (ch !== 0 && !is_WS_OR_EOL(ch)) {

      if (ch === 0x21/* ! */) {
        if (!isNamed) {
          tagHandle = state.input.slice(_position - 1, state.position + 1);

          if (!PATTERN_TAG_HANDLE.test(tagHandle)) {
            throwError(state, 'named tag handle cannot contain such characters');
          }

          isNamed = true;
          _position = state.position + 1;
        } else {
          throwError(state, 'tag suffix cannot contain exclamation marks');
        }
      }

      ch = state.input.charCodeAt(++state.position);
    }

    tagName = state.input.slice(_position, state.position);

    if (PATTERN_FLOW_INDICATORS.test(tagName)) {
      throwError(state, 'tag suffix cannot contain flow indicator characters');
    }
  }

  if (tagName && !PATTERN_TAG_URI.test(tagName)) {
    throwError(state, 'tag name cannot contain such characters: ' + tagName);
  }

  if (isVerbatim) {
    state.tag = tagName;

  } else if (_hasOwnProperty$1.call(state.tagMap, tagHandle)) {
    state.tag = state.tagMap[tagHandle] + tagName;

  } else if (tagHandle === '!') {
    state.tag = '!' + tagName;

  } else if (tagHandle === '!!') {
    state.tag = 'tag:yaml.org,2002:' + tagName;

  } else {
    throwError(state, 'undeclared tag handle "' + tagHandle + '"');
  }

  return true;
}

function readAnchorProperty(state) {
  var _position,
      ch;

  ch = state.input.charCodeAt(state.position);

  if (ch !== 0x26/* & */) return false;

  if (state.anchor !== null) {
    throwError(state, 'duplication of an anchor property');
  }

  ch = state.input.charCodeAt(++state.position);
  _position = state.position;

  while (ch !== 0 && !is_WS_OR_EOL(ch) && !is_FLOW_INDICATOR(ch)) {
    ch = state.input.charCodeAt(++state.position);
  }

  if (state.position === _position) {
    throwError(state, 'name of an anchor node must contain at least one character');
  }

  state.anchor = state.input.slice(_position, state.position);
  return true;
}

function readAlias(state) {
  var _position, alias,
      ch;

  ch = state.input.charCodeAt(state.position);

  if (ch !== 0x2A/* * */) return false;

  ch = state.input.charCodeAt(++state.position);
  _position = state.position;

  while (ch !== 0 && !is_WS_OR_EOL(ch) && !is_FLOW_INDICATOR(ch)) {
    ch = state.input.charCodeAt(++state.position);
  }

  if (state.position === _position) {
    throwError(state, 'name of an alias node must contain at least one character');
  }

  alias = state.input.slice(_position, state.position);

  if (!state.anchorMap.hasOwnProperty(alias)) {
    throwError(state, 'unidentified alias "' + alias + '"');
  }

  state.result = state.anchorMap[alias];
  skipSeparationSpace(state, true, -1);
  return true;
}

function composeNode(state, parentIndent, nodeContext, allowToSeek, allowCompact) {
  var allowBlockStyles,
      allowBlockScalars,
      allowBlockCollections,
      indentStatus = 1, // 1: this>parent, 0: this=parent, -1: this<parent
      atNewLine  = false,
      hasContent = false,
      typeIndex,
      typeQuantity,
      type,
      flowIndent,
      blockIndent;

  if (state.listener !== null) {
    state.listener('open', state);
  }

  state.tag    = null;
  state.anchor = null;
  state.kind   = null;
  state.result = null;

  allowBlockStyles = allowBlockScalars = allowBlockCollections =
    CONTEXT_BLOCK_OUT === nodeContext ||
    CONTEXT_BLOCK_IN  === nodeContext;

  if (allowToSeek) {
    if (skipSeparationSpace(state, true, -1)) {
      atNewLine = true;

      if (state.lineIndent > parentIndent) {
        indentStatus = 1;
      } else if (state.lineIndent === parentIndent) {
        indentStatus = 0;
      } else if (state.lineIndent < parentIndent) {
        indentStatus = -1;
      }
    }
  }

  if (indentStatus === 1) {
    while (readTagProperty(state) || readAnchorProperty(state)) {
      if (skipSeparationSpace(state, true, -1)) {
        atNewLine = true;
        allowBlockCollections = allowBlockStyles;

        if (state.lineIndent > parentIndent) {
          indentStatus = 1;
        } else if (state.lineIndent === parentIndent) {
          indentStatus = 0;
        } else if (state.lineIndent < parentIndent) {
          indentStatus = -1;
        }
      } else {
        allowBlockCollections = false;
      }
    }
  }

  if (allowBlockCollections) {
    allowBlockCollections = atNewLine || allowCompact;
  }

  if (indentStatus === 1 || CONTEXT_BLOCK_OUT === nodeContext) {
    if (CONTEXT_FLOW_IN === nodeContext || CONTEXT_FLOW_OUT === nodeContext) {
      flowIndent = parentIndent;
    } else {
      flowIndent = parentIndent + 1;
    }

    blockIndent = state.position - state.lineStart;

    if (indentStatus === 1) {
      if (allowBlockCollections &&
          (readBlockSequence(state, blockIndent) ||
           readBlockMapping(state, blockIndent, flowIndent)) ||
          readFlowCollection(state, flowIndent)) {
        hasContent = true;
      } else {
        if ((allowBlockScalars && readBlockScalar(state, flowIndent)) ||
            readSingleQuotedScalar(state, flowIndent) ||
            readDoubleQuotedScalar(state, flowIndent)) {
          hasContent = true;

        } else if (readAlias(state)) {
          hasContent = true;

          if (state.tag !== null || state.anchor !== null) {
            throwError(state, 'alias node should not have any properties');
          }

        } else if (readPlainScalar(state, flowIndent, CONTEXT_FLOW_IN === nodeContext)) {
          hasContent = true;

          if (state.tag === null) {
            state.tag = '?';
          }
        }

        if (state.anchor !== null) {
          state.anchorMap[state.anchor] = state.result;
        }
      }
    } else if (indentStatus === 0) {
      // Special case: block sequences are allowed to have same indentation level as the parent.
      // http://www.yaml.org/spec/1.2/spec.html#id2799784
      hasContent = allowBlockCollections && readBlockSequence(state, blockIndent);
    }
  }

  if (state.tag !== null && state.tag !== '!') {
    if (state.tag === '?') {
      for (typeIndex = 0, typeQuantity = state.implicitTypes.length; typeIndex < typeQuantity; typeIndex += 1) {
        type = state.implicitTypes[typeIndex];

        // Implicit resolving is not allowed for non-scalar types, and '?'
        // non-specific tag is only assigned to plain scalars. So, it isn't
        // needed to check for 'kind' conformity.

        if (type.resolve(state.result)) { // `state.result` updated in resolver if matched
          state.result = type.construct(state.result);
          state.tag = type.tag;
          if (state.anchor !== null) {
            state.anchorMap[state.anchor] = state.result;
          }
          break;
        }
      }
    } else if (_hasOwnProperty$1.call(state.typeMap[state.kind || 'fallback'], state.tag)) {
      type = state.typeMap[state.kind || 'fallback'][state.tag];

      if (state.result !== null && type.kind !== state.kind) {
        throwError(state, 'unacceptable node kind for !<' + state.tag + '> tag; it should be "' + type.kind + '", not "' + state.kind + '"');
      }

      if (!type.resolve(state.result)) { // `state.result` updated in resolver if matched
        throwError(state, 'cannot resolve a node with !<' + state.tag + '> explicit tag');
      } else {
        state.result = type.construct(state.result);
        if (state.anchor !== null) {
          state.anchorMap[state.anchor] = state.result;
        }
      }
    } else {
      throwError(state, 'unknown tag !<' + state.tag + '>');
    }
  }

  if (state.listener !== null) {
    state.listener('close', state);
  }
  return state.tag !== null ||  state.anchor !== null || hasContent;
}

function readDocument(state) {
  var documentStart = state.position,
      _position,
      directiveName,
      directiveArgs,
      hasDirectives = false,
      ch;

  state.version = null;
  state.checkLineBreaks = state.legacy;
  state.tagMap = {};
  state.anchorMap = {};

  while ((ch = state.input.charCodeAt(state.position)) !== 0) {
    skipSeparationSpace(state, true, -1);

    ch = state.input.charCodeAt(state.position);

    if (state.lineIndent > 0 || ch !== 0x25/* % */) {
      break;
    }

    hasDirectives = true;
    ch = state.input.charCodeAt(++state.position);
    _position = state.position;

    while (ch !== 0 && !is_WS_OR_EOL(ch)) {
      ch = state.input.charCodeAt(++state.position);
    }

    directiveName = state.input.slice(_position, state.position);
    directiveArgs = [];

    if (directiveName.length < 1) {
      throwError(state, 'directive name must not be less than one character in length');
    }

    while (ch !== 0) {
      while (is_WHITE_SPACE(ch)) {
        ch = state.input.charCodeAt(++state.position);
      }

      if (ch === 0x23/* # */) {
        do { ch = state.input.charCodeAt(++state.position); }
        while (ch !== 0 && !is_EOL(ch));
        break;
      }

      if (is_EOL(ch)) break;

      _position = state.position;

      while (ch !== 0 && !is_WS_OR_EOL(ch)) {
        ch = state.input.charCodeAt(++state.position);
      }

      directiveArgs.push(state.input.slice(_position, state.position));
    }

    if (ch !== 0) readLineBreak(state);

    if (_hasOwnProperty$1.call(directiveHandlers, directiveName)) {
      directiveHandlers[directiveName](state, directiveName, directiveArgs);
    } else {
      throwWarning(state, 'unknown document directive "' + directiveName + '"');
    }
  }

  skipSeparationSpace(state, true, -1);

  if (state.lineIndent === 0 &&
      state.input.charCodeAt(state.position)     === 0x2D/* - */ &&
      state.input.charCodeAt(state.position + 1) === 0x2D/* - */ &&
      state.input.charCodeAt(state.position + 2) === 0x2D/* - */) {
    state.position += 3;
    skipSeparationSpace(state, true, -1);

  } else if (hasDirectives) {
    throwError(state, 'directives end mark is expected');
  }

  composeNode(state, state.lineIndent - 1, CONTEXT_BLOCK_OUT, false, true);
  skipSeparationSpace(state, true, -1);

  if (state.checkLineBreaks &&
      PATTERN_NON_ASCII_LINE_BREAKS.test(state.input.slice(documentStart, state.position))) {
    throwWarning(state, 'non-ASCII line breaks are interpreted as content');
  }

  state.documents.push(state.result);

  if (state.position === state.lineStart && testDocumentSeparator(state)) {

    if (state.input.charCodeAt(state.position) === 0x2E/* . */) {
      state.position += 3;
      skipSeparationSpace(state, true, -1);
    }
    return;
  }

  if (state.position < (state.length - 1)) {
    throwError(state, 'end of the stream or a document separator is expected');
  } else {
    return;
  }
}


function loadDocuments(input, options) {
  input = String(input);
  options = options || {};

  if (input.length !== 0) {

    // Add tailing `\n` if not exists
    if (input.charCodeAt(input.length - 1) !== 0x0A/* LF */ &&
        input.charCodeAt(input.length - 1) !== 0x0D/* CR */) {
      input += '\n';
    }

    // Strip BOM
    if (input.charCodeAt(0) === 0xFEFF) {
      input = input.slice(1);
    }
  }

  var state = new State$1(input, options);

  // Use 0 as string terminator. That significantly simplifies bounds check.
  state.input += '\0';

  while (state.input.charCodeAt(state.position) === 0x20/* Space */) {
    state.lineIndent += 1;
    state.position += 1;
  }

  while (state.position < (state.length - 1)) {
    readDocument(state);
  }

  return state.documents;
}


function loadAll(input, iterator, options) {
  var documents = loadDocuments(input, options), index, length;

  if (typeof iterator !== 'function') {
    return documents;
  }

  for (index = 0, length = documents.length; index < length; index += 1) {
    iterator(documents[index]);
  }
}


function load(input, options) {
  var documents = loadDocuments(input, options);

  if (documents.length === 0) {
    /*eslint-disable no-undefined*/
    return undefined;
  } else if (documents.length === 1) {
    return documents[0];
  }
  throw new YAMLException$1('expected a single document in the stream, but found more');
}


function safeLoadAll(input, output, options) {
  if (typeof output === 'function') {
    loadAll(input, output, common$1.extend({ schema: DEFAULT_SAFE_SCHEMA$1 }, options));
  } else {
    return loadAll(input, common$1.extend({ schema: DEFAULT_SAFE_SCHEMA$1 }, options));
  }
}


function safeLoad(input, options) {
  return load(input, common$1.extend({ schema: DEFAULT_SAFE_SCHEMA$1 }, options));
}


loader$1.loadAll     = loadAll;
loader$1.load        = load;
loader$1.safeLoadAll = safeLoadAll;
loader$1.safeLoad    = safeLoad;

var dumper$1 = {};

/*eslint-disable no-use-before-define*/

var common              = common$6;
var YAMLException       = exception;
var DEFAULT_FULL_SCHEMA = default_full;
var DEFAULT_SAFE_SCHEMA = default_safe;

var _toString       = Object.prototype.toString;
var _hasOwnProperty = Object.prototype.hasOwnProperty;

var CHAR_TAB                  = 0x09; /* Tab */
var CHAR_LINE_FEED            = 0x0A; /* LF */
var CHAR_SPACE                = 0x20; /* Space */
var CHAR_EXCLAMATION          = 0x21; /* ! */
var CHAR_DOUBLE_QUOTE         = 0x22; /* " */
var CHAR_SHARP                = 0x23; /* # */
var CHAR_PERCENT              = 0x25; /* % */
var CHAR_AMPERSAND            = 0x26; /* & */
var CHAR_SINGLE_QUOTE         = 0x27; /* ' */
var CHAR_ASTERISK             = 0x2A; /* * */
var CHAR_COMMA                = 0x2C; /* , */
var CHAR_MINUS                = 0x2D; /* - */
var CHAR_COLON                = 0x3A; /* : */
var CHAR_GREATER_THAN         = 0x3E; /* > */
var CHAR_QUESTION             = 0x3F; /* ? */
var CHAR_COMMERCIAL_AT        = 0x40; /* @ */
var CHAR_LEFT_SQUARE_BRACKET  = 0x5B; /* [ */
var CHAR_RIGHT_SQUARE_BRACKET = 0x5D; /* ] */
var CHAR_GRAVE_ACCENT         = 0x60; /* ` */
var CHAR_LEFT_CURLY_BRACKET   = 0x7B; /* { */
var CHAR_VERTICAL_LINE        = 0x7C; /* | */
var CHAR_RIGHT_CURLY_BRACKET  = 0x7D; /* } */

var ESCAPE_SEQUENCES = {};

ESCAPE_SEQUENCES[0x00]   = '\\0';
ESCAPE_SEQUENCES[0x07]   = '\\a';
ESCAPE_SEQUENCES[0x08]   = '\\b';
ESCAPE_SEQUENCES[0x09]   = '\\t';
ESCAPE_SEQUENCES[0x0A]   = '\\n';
ESCAPE_SEQUENCES[0x0B]   = '\\v';
ESCAPE_SEQUENCES[0x0C]   = '\\f';
ESCAPE_SEQUENCES[0x0D]   = '\\r';
ESCAPE_SEQUENCES[0x1B]   = '\\e';
ESCAPE_SEQUENCES[0x22]   = '\\"';
ESCAPE_SEQUENCES[0x5C]   = '\\\\';
ESCAPE_SEQUENCES[0x85]   = '\\N';
ESCAPE_SEQUENCES[0xA0]   = '\\_';
ESCAPE_SEQUENCES[0x2028] = '\\L';
ESCAPE_SEQUENCES[0x2029] = '\\P';

var DEPRECATED_BOOLEANS_SYNTAX = [
  'y', 'Y', 'yes', 'Yes', 'YES', 'on', 'On', 'ON',
  'n', 'N', 'no', 'No', 'NO', 'off', 'Off', 'OFF'
];

function compileStyleMap(schema, map) {
  var result, keys, index, length, tag, style, type;

  if (map === null) return {};

  result = {};
  keys = Object.keys(map);

  for (index = 0, length = keys.length; index < length; index += 1) {
    tag = keys[index];
    style = String(map[tag]);

    if (tag.slice(0, 2) === '!!') {
      tag = 'tag:yaml.org,2002:' + tag.slice(2);
    }
    type = schema.compiledTypeMap['fallback'][tag];

    if (type && _hasOwnProperty.call(type.styleAliases, style)) {
      style = type.styleAliases[style];
    }

    result[tag] = style;
  }

  return result;
}

function encodeHex(character) {
  var string, handle, length;

  string = character.toString(16).toUpperCase();

  if (character <= 0xFF) {
    handle = 'x';
    length = 2;
  } else if (character <= 0xFFFF) {
    handle = 'u';
    length = 4;
  } else if (character <= 0xFFFFFFFF) {
    handle = 'U';
    length = 8;
  } else {
    throw new YAMLException('code point within a string may not be greater than 0xFFFFFFFF');
  }

  return '\\' + handle + common.repeat('0', length - string.length) + string;
}

function State(options) {
  this.schema        = options['schema'] || DEFAULT_FULL_SCHEMA;
  this.indent        = Math.max(1, (options['indent'] || 2));
  this.noArrayIndent = options['noArrayIndent'] || false;
  this.skipInvalid   = options['skipInvalid'] || false;
  this.flowLevel     = (common.isNothing(options['flowLevel']) ? -1 : options['flowLevel']);
  this.styleMap      = compileStyleMap(this.schema, options['styles'] || null);
  this.sortKeys      = options['sortKeys'] || false;
  this.lineWidth     = options['lineWidth'] || 80;
  this.noRefs        = options['noRefs'] || false;
  this.noCompatMode  = options['noCompatMode'] || false;
  this.condenseFlow  = options['condenseFlow'] || false;

  this.implicitTypes = this.schema.compiledImplicit;
  this.explicitTypes = this.schema.compiledExplicit;

  this.tag = null;
  this.result = '';

  this.duplicates = [];
  this.usedDuplicates = null;
}

// Indents every line in a string. Empty lines (\n only) are not indented.
function indentString(string, spaces) {
  var ind = common.repeat(' ', spaces),
      position = 0,
      next = -1,
      result = '',
      line,
      length = string.length;

  while (position < length) {
    next = string.indexOf('\n', position);
    if (next === -1) {
      line = string.slice(position);
      position = length;
    } else {
      line = string.slice(position, next + 1);
      position = next + 1;
    }

    if (line.length && line !== '\n') result += ind;

    result += line;
  }

  return result;
}

function generateNextLine(state, level) {
  return '\n' + common.repeat(' ', state.indent * level);
}

function testImplicitResolving(state, str) {
  var index, length, type;

  for (index = 0, length = state.implicitTypes.length; index < length; index += 1) {
    type = state.implicitTypes[index];

    if (type.resolve(str)) {
      return true;
    }
  }

  return false;
}

// [33] s-white ::= s-space | s-tab
function isWhitespace(c) {
  return c === CHAR_SPACE || c === CHAR_TAB;
}

// Returns true if the character can be printed without escaping.
// From YAML 1.2: "any allowed characters known to be non-printable
// should also be escaped. [However,] This isn’t mandatory"
// Derived from nb-char - \t - #x85 - #xA0 - #x2028 - #x2029.
function isPrintable(c) {
  return  (0x00020 <= c && c <= 0x00007E)
      || ((0x000A1 <= c && c <= 0x00D7FF) && c !== 0x2028 && c !== 0x2029)
      || ((0x0E000 <= c && c <= 0x00FFFD) && c !== 0xFEFF /* BOM */)
      ||  (0x10000 <= c && c <= 0x10FFFF);
}

// Simplified test for values allowed after the first character in plain style.
function isPlainSafe(c) {
  // Uses a subset of nb-char - c-flow-indicator - ":" - "#"
  // where nb-char ::= c-printable - b-char - c-byte-order-mark.
  return isPrintable(c) && c !== 0xFEFF
    // - c-flow-indicator
    && c !== CHAR_COMMA
    && c !== CHAR_LEFT_SQUARE_BRACKET
    && c !== CHAR_RIGHT_SQUARE_BRACKET
    && c !== CHAR_LEFT_CURLY_BRACKET
    && c !== CHAR_RIGHT_CURLY_BRACKET
    // - ":" - "#"
    && c !== CHAR_COLON
    && c !== CHAR_SHARP;
}

// Simplified test for values allowed as the first character in plain style.
function isPlainSafeFirst(c) {
  // Uses a subset of ns-char - c-indicator
  // where ns-char = nb-char - s-white.
  return isPrintable(c) && c !== 0xFEFF
    && !isWhitespace(c) // - s-white
    // - (c-indicator ::=
    // “-” | “?” | “:” | “,” | “[” | “]” | “{” | “}”
    && c !== CHAR_MINUS
    && c !== CHAR_QUESTION
    && c !== CHAR_COLON
    && c !== CHAR_COMMA
    && c !== CHAR_LEFT_SQUARE_BRACKET
    && c !== CHAR_RIGHT_SQUARE_BRACKET
    && c !== CHAR_LEFT_CURLY_BRACKET
    && c !== CHAR_RIGHT_CURLY_BRACKET
    // | “#” | “&” | “*” | “!” | “|” | “>” | “'” | “"”
    && c !== CHAR_SHARP
    && c !== CHAR_AMPERSAND
    && c !== CHAR_ASTERISK
    && c !== CHAR_EXCLAMATION
    && c !== CHAR_VERTICAL_LINE
    && c !== CHAR_GREATER_THAN
    && c !== CHAR_SINGLE_QUOTE
    && c !== CHAR_DOUBLE_QUOTE
    // | “%” | “@” | “`”)
    && c !== CHAR_PERCENT
    && c !== CHAR_COMMERCIAL_AT
    && c !== CHAR_GRAVE_ACCENT;
}

// Determines whether block indentation indicator is required.
function needIndentIndicator(string) {
  var leadingSpaceRe = /^\n* /;
  return leadingSpaceRe.test(string);
}

var STYLE_PLAIN   = 1,
    STYLE_SINGLE  = 2,
    STYLE_LITERAL = 3,
    STYLE_FOLDED  = 4,
    STYLE_DOUBLE  = 5;

// Determines which scalar styles are possible and returns the preferred style.
// lineWidth = -1 => no limit.
// Pre-conditions: str.length > 0.
// Post-conditions:
//    STYLE_PLAIN or STYLE_SINGLE => no \n are in the string.
//    STYLE_LITERAL => no lines are suitable for folding (or lineWidth is -1).
//    STYLE_FOLDED => a line > lineWidth and can be folded (and lineWidth != -1).
function chooseScalarStyle(string, singleLineOnly, indentPerLevel, lineWidth, testAmbiguousType) {
  var i;
  var char;
  var hasLineBreak = false;
  var hasFoldableLine = false; // only checked if shouldTrackWidth
  var shouldTrackWidth = lineWidth !== -1;
  var previousLineBreak = -1; // count the first line correctly
  var plain = isPlainSafeFirst(string.charCodeAt(0))
          && !isWhitespace(string.charCodeAt(string.length - 1));

  if (singleLineOnly) {
    // Case: no block styles.
    // Check for disallowed characters to rule out plain and single.
    for (i = 0; i < string.length; i++) {
      char = string.charCodeAt(i);
      if (!isPrintable(char)) {
        return STYLE_DOUBLE;
      }
      plain = plain && isPlainSafe(char);
    }
  } else {
    // Case: block styles permitted.
    for (i = 0; i < string.length; i++) {
      char = string.charCodeAt(i);
      if (char === CHAR_LINE_FEED) {
        hasLineBreak = true;
        // Check if any line can be folded.
        if (shouldTrackWidth) {
          hasFoldableLine = hasFoldableLine ||
            // Foldable line = too long, and not more-indented.
            (i - previousLineBreak - 1 > lineWidth &&
             string[previousLineBreak + 1] !== ' ');
          previousLineBreak = i;
        }
      } else if (!isPrintable(char)) {
        return STYLE_DOUBLE;
      }
      plain = plain && isPlainSafe(char);
    }
    // in case the end is missing a \n
    hasFoldableLine = hasFoldableLine || (shouldTrackWidth &&
      (i - previousLineBreak - 1 > lineWidth &&
       string[previousLineBreak + 1] !== ' '));
  }
  // Although every style can represent \n without escaping, prefer block styles
  // for multiline, since they're more readable and they don't add empty lines.
  // Also prefer folding a super-long line.
  if (!hasLineBreak && !hasFoldableLine) {
    // Strings interpretable as another type have to be quoted;
    // e.g. the string 'true' vs. the boolean true.
    return plain && !testAmbiguousType(string)
      ? STYLE_PLAIN : STYLE_SINGLE;
  }
  // Edge case: block indentation indicator can only have one digit.
  if (indentPerLevel > 9 && needIndentIndicator(string)) {
    return STYLE_DOUBLE;
  }
  // At this point we know block styles are valid.
  // Prefer literal style unless we want to fold.
  return hasFoldableLine ? STYLE_FOLDED : STYLE_LITERAL;
}

// Note: line breaking/folding is implemented for only the folded style.
// NB. We drop the last trailing newline (if any) of a returned block scalar
//  since the dumper adds its own newline. This always works:
//    • No ending newline => unaffected; already using strip "-" chomping.
//    • Ending newline    => removed then restored.
//  Importantly, this keeps the "+" chomp indicator from gaining an extra line.
function writeScalar(state, string, level, iskey) {
  state.dump = (function () {
    if (string.length === 0) {
      return "''";
    }
    if (!state.noCompatMode &&
        DEPRECATED_BOOLEANS_SYNTAX.indexOf(string) !== -1) {
      return "'" + string + "'";
    }

    var indent = state.indent * Math.max(1, level); // no 0-indent scalars
    // As indentation gets deeper, let the width decrease monotonically
    // to the lower bound min(state.lineWidth, 40).
    // Note that this implies
    //  state.lineWidth ≤ 40 + state.indent: width is fixed at the lower bound.
    //  state.lineWidth > 40 + state.indent: width decreases until the lower bound.
    // This behaves better than a constant minimum width which disallows narrower options,
    // or an indent threshold which causes the width to suddenly increase.
    var lineWidth = state.lineWidth === -1
      ? -1 : Math.max(Math.min(state.lineWidth, 40), state.lineWidth - indent);

    // Without knowing if keys are implicit/explicit, assume implicit for safety.
    var singleLineOnly = iskey
      // No block styles in flow mode.
      || (state.flowLevel > -1 && level >= state.flowLevel);
    function testAmbiguity(string) {
      return testImplicitResolving(state, string);
    }

    switch (chooseScalarStyle(string, singleLineOnly, state.indent, lineWidth, testAmbiguity)) {
      case STYLE_PLAIN:
        return string;
      case STYLE_SINGLE:
        return "'" + string.replace(/'/g, "''") + "'";
      case STYLE_LITERAL:
        return '|' + blockHeader(string, state.indent)
          + dropEndingNewline(indentString(string, indent));
      case STYLE_FOLDED:
        return '>' + blockHeader(string, state.indent)
          + dropEndingNewline(indentString(foldString(string, lineWidth), indent));
      case STYLE_DOUBLE:
        return '"' + escapeString(string) + '"';
      default:
        throw new YAMLException('impossible error: invalid scalar style');
    }
  }());
}

// Pre-conditions: string is valid for a block scalar, 1 <= indentPerLevel <= 9.
function blockHeader(string, indentPerLevel) {
  var indentIndicator = needIndentIndicator(string) ? String(indentPerLevel) : '';

  // note the special case: the string '\n' counts as a "trailing" empty line.
  var clip =          string[string.length - 1] === '\n';
  var keep = clip && (string[string.length - 2] === '\n' || string === '\n');
  var chomp = keep ? '+' : (clip ? '' : '-');

  return indentIndicator + chomp + '\n';
}

// (See the note for writeScalar.)
function dropEndingNewline(string) {
  return string[string.length - 1] === '\n' ? string.slice(0, -1) : string;
}

// Note: a long line without a suitable break point will exceed the width limit.
// Pre-conditions: every char in str isPrintable, str.length > 0, width > 0.
function foldString(string, width) {
  // In folded style, $k$ consecutive newlines output as $k+1$ newlines—
  // unless they're before or after a more-indented line, or at the very
  // beginning or end, in which case $k$ maps to $k$.
  // Therefore, parse each chunk as newline(s) followed by a content line.
  var lineRe = /(\n+)([^\n]*)/g;

  // first line (possibly an empty line)
  var result = (function () {
    var nextLF = string.indexOf('\n');
    nextLF = nextLF !== -1 ? nextLF : string.length;
    lineRe.lastIndex = nextLF;
    return foldLine(string.slice(0, nextLF), width);
  }());
  // If we haven't reached the first content line yet, don't add an extra \n.
  var prevMoreIndented = string[0] === '\n' || string[0] === ' ';
  var moreIndented;

  // rest of the lines
  var match;
  while ((match = lineRe.exec(string))) {
    var prefix = match[1], line = match[2];
    moreIndented = (line[0] === ' ');
    result += prefix
      + (!prevMoreIndented && !moreIndented && line !== ''
        ? '\n' : '')
      + foldLine(line, width);
    prevMoreIndented = moreIndented;
  }

  return result;
}

// Greedy line breaking.
// Picks the longest line under the limit each time,
// otherwise settles for the shortest line over the limit.
// NB. More-indented lines *cannot* be folded, as that would add an extra \n.
function foldLine(line, width) {
  if (line === '' || line[0] === ' ') return line;

  // Since a more-indented line adds a \n, breaks can't be followed by a space.
  var breakRe = / [^ ]/g; // note: the match index will always be <= length-2.
  var match;
  // start is an inclusive index. end, curr, and next are exclusive.
  var start = 0, end, curr = 0, next = 0;
  var result = '';

  // Invariants: 0 <= start <= length-1.
  //   0 <= curr <= next <= max(0, length-2). curr - start <= width.
  // Inside the loop:
  //   A match implies length >= 2, so curr and next are <= length-2.
  while ((match = breakRe.exec(line))) {
    next = match.index;
    // maintain invariant: curr - start <= width
    if (next - start > width) {
      end = (curr > start) ? curr : next; // derive end <= length-2
      result += '\n' + line.slice(start, end);
      // skip the space that was output as \n
      start = end + 1;                    // derive start <= length-1
    }
    curr = next;
  }

  // By the invariants, start <= length-1, so there is something left over.
  // It is either the whole string or a part starting from non-whitespace.
  result += '\n';
  // Insert a break if the remainder is too long and there is a break available.
  if (line.length - start > width && curr > start) {
    result += line.slice(start, curr) + '\n' + line.slice(curr + 1);
  } else {
    result += line.slice(start);
  }

  return result.slice(1); // drop extra \n joiner
}

// Escapes a double-quoted string.
function escapeString(string) {
  var result = '';
  var char, nextChar;
  var escapeSeq;

  for (var i = 0; i < string.length; i++) {
    char = string.charCodeAt(i);
    // Check for surrogate pairs (reference Unicode 3.0 section "3.7 Surrogates").
    if (char >= 0xD800 && char <= 0xDBFF/* high surrogate */) {
      nextChar = string.charCodeAt(i + 1);
      if (nextChar >= 0xDC00 && nextChar <= 0xDFFF/* low surrogate */) {
        // Combine the surrogate pair and store it escaped.
        result += encodeHex((char - 0xD800) * 0x400 + nextChar - 0xDC00 + 0x10000);
        // Advance index one extra since we already used that char here.
        i++; continue;
      }
    }
    escapeSeq = ESCAPE_SEQUENCES[char];
    result += !escapeSeq && isPrintable(char)
      ? string[i]
      : escapeSeq || encodeHex(char);
  }

  return result;
}

function writeFlowSequence(state, level, object) {
  var _result = '',
      _tag    = state.tag,
      index,
      length;

  for (index = 0, length = object.length; index < length; index += 1) {
    // Write only valid elements.
    if (writeNode(state, level, object[index], false, false)) {
      if (index !== 0) _result += ',' + (!state.condenseFlow ? ' ' : '');
      _result += state.dump;
    }
  }

  state.tag = _tag;
  state.dump = '[' + _result + ']';
}

function writeBlockSequence(state, level, object, compact) {
  var _result = '',
      _tag    = state.tag,
      index,
      length;

  for (index = 0, length = object.length; index < length; index += 1) {
    // Write only valid elements.
    if (writeNode(state, level + 1, object[index], true, true)) {
      if (!compact || index !== 0) {
        _result += generateNextLine(state, level);
      }

      if (state.dump && CHAR_LINE_FEED === state.dump.charCodeAt(0)) {
        _result += '-';
      } else {
        _result += '- ';
      }

      _result += state.dump;
    }
  }

  state.tag = _tag;
  state.dump = _result || '[]'; // Empty sequence if no valid values.
}

function writeFlowMapping(state, level, object) {
  var _result       = '',
      _tag          = state.tag,
      objectKeyList = Object.keys(object),
      index,
      length,
      objectKey,
      objectValue,
      pairBuffer;

  for (index = 0, length = objectKeyList.length; index < length; index += 1) {
    pairBuffer = state.condenseFlow ? '"' : '';

    if (index !== 0) pairBuffer += ', ';

    objectKey = objectKeyList[index];
    objectValue = object[objectKey];

    if (!writeNode(state, level, objectKey, false, false)) {
      continue; // Skip this pair because of invalid key;
    }

    if (state.dump.length > 1024) pairBuffer += '? ';

    pairBuffer += state.dump + (state.condenseFlow ? '"' : '') + ':' + (state.condenseFlow ? '' : ' ');

    if (!writeNode(state, level, objectValue, false, false)) {
      continue; // Skip this pair because of invalid value.
    }

    pairBuffer += state.dump;

    // Both key and value are valid.
    _result += pairBuffer;
  }

  state.tag = _tag;
  state.dump = '{' + _result + '}';
}

function writeBlockMapping(state, level, object, compact) {
  var _result       = '',
      _tag          = state.tag,
      objectKeyList = Object.keys(object),
      index,
      length,
      objectKey,
      objectValue,
      explicitPair,
      pairBuffer;

  // Allow sorting keys so that the output file is deterministic
  if (state.sortKeys === true) {
    // Default sorting
    objectKeyList.sort();
  } else if (typeof state.sortKeys === 'function') {
    // Custom sort function
    objectKeyList.sort(state.sortKeys);
  } else if (state.sortKeys) {
    // Something is wrong
    throw new YAMLException('sortKeys must be a boolean or a function');
  }

  for (index = 0, length = objectKeyList.length; index < length; index += 1) {
    pairBuffer = '';

    if (!compact || index !== 0) {
      pairBuffer += generateNextLine(state, level);
    }

    objectKey = objectKeyList[index];
    objectValue = object[objectKey];

    if (!writeNode(state, level + 1, objectKey, true, true, true)) {
      continue; // Skip this pair because of invalid key.
    }

    explicitPair = (state.tag !== null && state.tag !== '?') ||
                   (state.dump && state.dump.length > 1024);

    if (explicitPair) {
      if (state.dump && CHAR_LINE_FEED === state.dump.charCodeAt(0)) {
        pairBuffer += '?';
      } else {
        pairBuffer += '? ';
      }
    }

    pairBuffer += state.dump;

    if (explicitPair) {
      pairBuffer += generateNextLine(state, level);
    }

    if (!writeNode(state, level + 1, objectValue, true, explicitPair)) {
      continue; // Skip this pair because of invalid value.
    }

    if (state.dump && CHAR_LINE_FEED === state.dump.charCodeAt(0)) {
      pairBuffer += ':';
    } else {
      pairBuffer += ': ';
    }

    pairBuffer += state.dump;

    // Both key and value are valid.
    _result += pairBuffer;
  }

  state.tag = _tag;
  state.dump = _result || '{}'; // Empty mapping if no valid pairs.
}

function detectType(state, object, explicit) {
  var _result, typeList, index, length, type, style;

  typeList = explicit ? state.explicitTypes : state.implicitTypes;

  for (index = 0, length = typeList.length; index < length; index += 1) {
    type = typeList[index];

    if ((type.instanceOf  || type.predicate) &&
        (!type.instanceOf || ((typeof object === 'object') && (object instanceof type.instanceOf))) &&
        (!type.predicate  || type.predicate(object))) {

      state.tag = explicit ? type.tag : '?';

      if (type.represent) {
        style = state.styleMap[type.tag] || type.defaultStyle;

        if (_toString.call(type.represent) === '[object Function]') {
          _result = type.represent(object, style);
        } else if (_hasOwnProperty.call(type.represent, style)) {
          _result = type.represent[style](object, style);
        } else {
          throw new YAMLException('!<' + type.tag + '> tag resolver accepts not "' + style + '" style');
        }

        state.dump = _result;
      }

      return true;
    }
  }

  return false;
}

// Serializes `object` and writes it to global `result`.
// Returns true on success, or false on invalid object.
//
function writeNode(state, level, object, block, compact, iskey) {
  state.tag = null;
  state.dump = object;

  if (!detectType(state, object, false)) {
    detectType(state, object, true);
  }

  var type = _toString.call(state.dump);

  if (block) {
    block = (state.flowLevel < 0 || state.flowLevel > level);
  }

  var objectOrArray = type === '[object Object]' || type === '[object Array]',
      duplicateIndex,
      duplicate;

  if (objectOrArray) {
    duplicateIndex = state.duplicates.indexOf(object);
    duplicate = duplicateIndex !== -1;
  }

  if ((state.tag !== null && state.tag !== '?') || duplicate || (state.indent !== 2 && level > 0)) {
    compact = false;
  }

  if (duplicate && state.usedDuplicates[duplicateIndex]) {
    state.dump = '*ref_' + duplicateIndex;
  } else {
    if (objectOrArray && duplicate && !state.usedDuplicates[duplicateIndex]) {
      state.usedDuplicates[duplicateIndex] = true;
    }
    if (type === '[object Object]') {
      if (block && (Object.keys(state.dump).length !== 0)) {
        writeBlockMapping(state, level, state.dump, compact);
        if (duplicate) {
          state.dump = '&ref_' + duplicateIndex + state.dump;
        }
      } else {
        writeFlowMapping(state, level, state.dump);
        if (duplicate) {
          state.dump = '&ref_' + duplicateIndex + ' ' + state.dump;
        }
      }
    } else if (type === '[object Array]') {
      var arrayLevel = (state.noArrayIndent && (level > 0)) ? level - 1 : level;
      if (block && (state.dump.length !== 0)) {
        writeBlockSequence(state, arrayLevel, state.dump, compact);
        if (duplicate) {
          state.dump = '&ref_' + duplicateIndex + state.dump;
        }
      } else {
        writeFlowSequence(state, arrayLevel, state.dump);
        if (duplicate) {
          state.dump = '&ref_' + duplicateIndex + ' ' + state.dump;
        }
      }
    } else if (type === '[object String]') {
      if (state.tag !== '?') {
        writeScalar(state, state.dump, level, iskey);
      }
    } else {
      if (state.skipInvalid) return false;
      throw new YAMLException('unacceptable kind of an object to dump ' + type);
    }

    if (state.tag !== null && state.tag !== '?') {
      state.dump = '!<' + state.tag + '> ' + state.dump;
    }
  }

  return true;
}

function getDuplicateReferences(object, state) {
  var objects = [],
      duplicatesIndexes = [],
      index,
      length;

  inspectNode(object, objects, duplicatesIndexes);

  for (index = 0, length = duplicatesIndexes.length; index < length; index += 1) {
    state.duplicates.push(objects[duplicatesIndexes[index]]);
  }
  state.usedDuplicates = new Array(length);
}

function inspectNode(object, objects, duplicatesIndexes) {
  var objectKeyList,
      index,
      length;

  if (object !== null && typeof object === 'object') {
    index = objects.indexOf(object);
    if (index !== -1) {
      if (duplicatesIndexes.indexOf(index) === -1) {
        duplicatesIndexes.push(index);
      }
    } else {
      objects.push(object);

      if (Array.isArray(object)) {
        for (index = 0, length = object.length; index < length; index += 1) {
          inspectNode(object[index], objects, duplicatesIndexes);
        }
      } else {
        objectKeyList = Object.keys(object);

        for (index = 0, length = objectKeyList.length; index < length; index += 1) {
          inspectNode(object[objectKeyList[index]], objects, duplicatesIndexes);
        }
      }
    }
  }
}

function dump(input, options) {
  options = options || {};

  var state = new State(options);

  if (!state.noRefs) getDuplicateReferences(input, state);

  if (writeNode(state, 0, input, true, true)) return state.dump + '\n';

  return '';
}

function safeDump(input, options) {
  return dump(input, common.extend({ schema: DEFAULT_SAFE_SCHEMA }, options));
}

dumper$1.dump     = dump;
dumper$1.safeDump = safeDump;

var loader = loader$1;
var dumper = dumper$1;


function deprecated(name) {
  return function () {
    throw new Error('Function ' + name + ' is deprecated and cannot be used.');
  };
}


jsYaml$1.Type                = type;
jsYaml$1.Schema              = schema;
jsYaml$1.FAILSAFE_SCHEMA     = failsafe;
jsYaml$1.JSON_SCHEMA         = json;
jsYaml$1.CORE_SCHEMA         = core;
jsYaml$1.DEFAULT_SAFE_SCHEMA = default_safe;
jsYaml$1.DEFAULT_FULL_SCHEMA = default_full;
jsYaml$1.load                = loader.load;
jsYaml$1.loadAll             = loader.loadAll;
jsYaml$1.safeLoad            = loader.safeLoad;
jsYaml$1.safeLoadAll         = loader.safeLoadAll;
jsYaml$1.dump                = dumper.dump;
jsYaml$1.safeDump            = dumper.safeDump;
jsYaml$1.YAMLException       = exception;

// Deprecated schema names from JS-YAML 2.0.x
jsYaml$1.MINIMAL_SCHEMA = failsafe;
jsYaml$1.SAFE_SCHEMA    = default_safe;
jsYaml$1.DEFAULT_SCHEMA = default_full;

// Deprecated functions from JS-YAML 1.x.x
jsYaml$1.scan           = deprecated('scan');
jsYaml$1.parse          = deprecated('parse');
jsYaml$1.compose        = deprecated('compose');
jsYaml$1.addConstructor = deprecated('addConstructor');

var yaml$1 = jsYaml$1;


var jsYaml = yaml$1;

const prettyBytes = prettierBytes_1;
const jsonParse = parse;
const hasUnicode = hasUnicodeExports();
const prettyMs = prettyMs$1;
const padLeft = padLeft$1;
const chalk = source;
const yaml = jsYaml;


const nl = process.platform === 'win32' ? '\r\n' : '\n';

// const emojiLog = {
//     fatal: '💀',
//     error: '🚨',
//     warn: '⚠️',
//     info: '✨',
//     debug: '🐛',
//     trace: '🔍'
// };

const emojiLog = {
    fatal: chalk.red("FATAL"),
    error: chalk.red("ERROR"),
    warn: chalk.yellow("WARN"),
    info: chalk.blue("INFO"),
    debug: chalk.magenta("DEBUG"),
    trace: chalk.magenta("TRACE")
};

const emojiMark = {
    error: '🧨',
    stack: '💥',
};

const indentMark = chalk.gray('|');

const anynl = /\r?\n/;

function isWideEmoji(character) {
    return character !== '⚠️'
}

var pretty = Alpino$1;

function Alpino$1() {
    return parse;

    function parse(lineOrRecord) {

        function unhandled() {
            return lineOrRecord + nl
        }

        let record;
        if (typeof lineOrRecord === 'string') {
            let obj = jsonParse(lineOrRecord);
            if (!obj.value || obj.err) return unhandled();
            record = obj.value;
        }
        else if (typeof lineOrRecord === 'object' && lineOrRecord['v']) {
            record = lineOrRecord;
        }
        else {
            return unhandled();
        }

        if (!record.level) return unhandled();
        if (typeof record.level === 'number') convertLogNumber(record);
        return output(record) + nl
    }

    function extract(obj, ...props) {
        let val = undefined;
        for (const prop of props) {
            val = (val !== undefined) ? val : obj[prop];
            delete obj[prop];
        }
        return val;
    }

    function convertLogNumber(obj) {
        if (obj.level === 10) obj.level = 'trace';
        if (obj.level === 20) obj.level = 'debug';
        if (obj.level === 30) obj.level = 'info';
        if (obj.level === 40) obj.level = 'warn';
        if (obj.level === 50) obj.level = 'error';
        if (obj.level === 60) obj.level = 'fatal';
    }

    function identifyType(inputString) {
        // Check for number
        if (!isNaN(inputString.trim())) {
          return 'number';
        }
      
        // Check for boolean
        if (inputString.trim().toLowerCase() === 'true' || inputString.trim().toLowerCase() === 'false') {
          return 'boolean';
        }
      
        // Check for null
        if (inputString.trim().toLowerCase() === 'null') {
          return 'null';
        }
      
        // Check for date
        if (!isNaN(Date.parse(inputString))) {
          return 'date';
        }
      
        // Default to string
        return 'string';
      }
      
    function formatOutputObject(line){
        const splitValues = line.split(":");
        const isKeyValue = splitValues.length>=2;
        const key = splitValues[0];
        const value =  isKeyValue && splitValues[1];
        const valueType = isKeyValue ? identifyType(value) : identifyType(key);
        let formattedValue = isKeyValue ? value : key;

        switch(valueType){
            case 'string':
                formattedValue = chalk.green(formattedValue);
            case 'number':
                formattedValue = chalk.blue(formattedValue);
            case 'boolean': 
                formattedValue = chalk.magenta(formattedValue);  
            case 'date': 
                formattedValue = chalk.yellow(formattedValue);  
            case 'null': 
                formattedValue = chalk.red(formattedValue);  
            default:
                formattedValue = chalk.white(formattedValue);                 
        }

        return isKeyValue ? `${chalk.white.bold(key)}: ${formattedValue} ` : `${formattedValue}` ;
    }

    function output(obj) {

        const output = [];

        if (!obj.level) obj.level = 'userlvl';
        if (!obj.name) obj.name = '';
        if (!obj.ns) obj.ns = '';

        const level = extract(obj, 'level');
        output.push(formatDate(extract(obj, 'time'),false));
        output.push(formatLevel(level));
        output.push(formatNs(extract(obj, 'ns')));
        output.push(formatName(extract(obj, 'name')));
        const logContext = extract(obj, 'context');
        logContext && output.push(`${chalk.cyan(logContext)}`);

        const reqId = extract(obj, 'reqId');
        if (reqId) {
            output.push(chalk.blueBright(`[${reqId}]`));
        }

        const msg = extract(obj, 'message', 'msg') || '';
        output.push(formatMessage(msg, level));

        /*const pid = */extract(obj, 'pid');
        /*const hostname = */extract(obj, 'hostname');
        /*const v = */extract(obj, 'v');

        const req = extract(obj, 'req');
        const res = extract(obj, 'res');
        const statusCode = (res) ? res.statusCode : extract(obj, 'statusCode');
        const responseTime = extract(obj, 'responseTime', 'elapsed');
        const method = (req) ? req.method : extract(obj, 'method');
        const contentLength = extract(obj, 'contentLength');
        const url = (req) ? req.url : extract(obj, 'url');

        if (method != null) {
            output.push(formatMethod(method));
        }
        if (statusCode != null) {
            output.push(formatStatusCode(statusCode));
        }
        if (url != null) output.push(formatUrl(url));
        if (contentLength != null) output.push(formatBundleSize(contentLength));
        if (responseTime != null) output.push(formatLoadTime(responseTime));

        let err = extract(obj, 'err', 'error');
        let trace = extract(obj, 'trace', 'stack');

        let detailLines = [];

        //TODO : Add a flag to format even without info
        // if (level !== 'info') {
        //     const details = yaml.safeDump(obj, {skipInvalid: true, flowLevel: 0}).trimEnd()
        //     if (details.length < 160) {
        //         output.push((details));
        //     }
        //     else {
        //         detailLines = yaml.safeDump(obj, {skipInvalid: true})
        //             .split(anynl)
        //             .filter(noEmpty)
        //             .map(indent)
        //             .map((line) => formatOutputObject(line));
        //     }
        // }
        if (level !== 'info') {
                detailLines = yaml.safeDump(obj, {skipInvalid: true})
                    .split(anynl)
                    .filter(noEmpty)
                    .filter(val=> val!=="{}")
                    .map(indent)
                    .map((line) => formatOutputObject(line));
            
        }

        let lines = [output.filter(noEmpty).join(' '), ...detailLines];

        if (err) {
            err = Object.assign({}, err);
            trace = extract(err, 'trace', 'stack') || trace;
            lines.push(...formatError(err, trace, msg));
        }

        if (trace) {
            lines.push(...formatTrace(trace, err));
        }

        return lines.filter(line => line.trim()).join(nl);
    }

    function formatError(err, trace, msg) {
        trace = trace instanceof Array ? trace[0] : (trace || '');

        const errNameMatch = trace.match(errorNameRegex);
        let errName = 'Error';
        if (errNameMatch) {
            errName = errNameMatch[1];
            if (errName === err.type) {
                extract(err, 'type');
            }
        }
        
        if (err.name === errName) {
            extract(err, 'name');
        }
        if (msg && msg.includes(err.message)) {
            extract(err, 'message');
        }
        if (msg && msg.includes(err.msg)) {
            extract(err, 'msg');
        }
        
        const errLines = yaml.safeDump(err, { skipInvalid: true })
            .split(anynl).map(errLine => '   ' + errLine);
        errLines.unshift(chalk.bgRed.black(`${formatMark(emojiMark.error)} ${errName}:`));
        
        return errLines
            .filter(errLine => errLine.trim())
            //.map(indent)
            .map(line => formatOutputObject(line))
    }

    function extractPathAndPosition(inputString) {
        const sanitizedPath = inputString.replace(/^\(|\)$/g, '');
        const regex = /^(.*):(\d+):(\d+)$/;
        const matches = regex.exec(sanitizedPath);
        
        if (matches) {
          const path = matches[1];
          const line = parseInt(matches[2], 10);
          const column = parseInt(matches[3], 10);
          
          return { path, line, column };
        }
        
        return inputString;
      }
      

    function prettyTrace(trace){
        if(trace.includes("at")){
            const splitTrace = trace.trimStart().split(" ");
            if(splitTrace[0]==="at"){
                trace = "    at";
            }
            
            //If second content is path
            if(splitTrace[1].includes("/")){
                const {path,line,column} = extractPathAndPosition(splitTrace[1]);
                trace = `${trace} ${chalk.underline.blue(path)}:${chalk.green(line)}:${chalk.magenta(column)}`;
            }
            else {
                trace = `${trace} ${chalk.green(splitTrace[1])}`;
            }

            if(splitTrace[2] && splitTrace[2].includes("/") && (/^\((.*?)\)$/).test(splitTrace[2])){
                const {path,line,column} = extractPathAndPosition(splitTrace[2]);
                trace = `${trace} (${chalk.underline.blue(path)}:${chalk.cyan(line)}:${chalk.magenta(column)})`;
            }            
        }
        else {
            return trace
        }
        return trace
    }

    function formatTrace(trace, err) {
        if (!(trace instanceof Array)) {
            trace = trace.toString().split(anynl);
        }

        let res = [];

        const errNameMatch = trace[0].match(errorNameRegex);
        if (!err) {
            let errName = errNameMatch ? errNameMatch[1] : 'Error';
            res.push(`${formatMark(emojiMark.error)} ${errName}:`);
        }
        if (errNameMatch) {
            trace.shift();
        }
        
        res.push(chalk.bgYellow.black(`${formatMark(emojiMark.stack)} Stack trace:`));
        trace.forEach(eachTrace =>{
            res.push(prettyTrace(eachTrace));
        });
        return res//.map(indent)
    }

    function formatDate(time,showDate=false) {
        const date = new Date(time);
        const hours = padLeft(date.getHours().toString(), 2, '0');
        const minutes = padLeft(date.getMinutes().toString(), 2, '0');
        const seconds = padLeft(date.getSeconds().toString(), 2, '0');
        const day = padLeft(date.getDay().toString(), 2, '0');
        const month = padLeft(date.getMonth().toString(), 2, '0');
        const year = padLeft(date.getFullYear().toString(), 2, '0');
        const prettyDayMonthYear = `${day}/${month}/${year}`;
        const prettyDate = hours + ':' + minutes + ':' + seconds;
        return chalk.gray(showDate ? `${prettyDayMonthYear} ${prettyDate}`  : prettyDate)
    }

    function formatLevel(level) {
        if (!hasUnicode) return formatMessage(level, level);
        const emoji = emojiLog[level];
        const padding = isWideEmoji(emoji) ? '' : ' ';
        return emoji + padding;
    }

    function formatNs(name) {
        return chalk.cyan(name)
    }

    function formatName(name) {
        return chalk.blue(name)
    }

    function formatMessage(message, level) {
        const msg = formatMessageName(message);
        let pretty;
        if (level === 'error') pretty = chalk.red(msg);
        if (level === 'trace') pretty = chalk.white(msg);
        if (level === 'warn') pretty = chalk.magenta(msg);
        if (level === 'debug') pretty = chalk.yellow(msg);
        if (level === 'info' || level === 'userlvl') pretty = chalk.green(msg);
        if (level === 'fatal') pretty = chalk.white.bgRed(msg);

        const lines = pretty.split(anynl);
        if (lines.length === 1) {
            return pretty;
        }

        return [lines[0], ...lines.slice(1).map(indentPlus)].join(nl);
    }

    function indent(line) {
        return padLeft('', 9, ' ') + indentMark + line;
    }

    function indentPlus(line) {
        return indent(' ' + line);
    }

    function formatUrl(url) {
        return chalk.white(url)
    }

    function formatMethod(method) {
        return chalk.white(method)
    }

    function formatStatusCode(statusCode) {
        statusCode = statusCode || 'xxx';
        return chalk.white(statusCode)
    }

    function formatLoadTime(elapsedTime) {
        const elapsed = parseInt(elapsedTime, 10);
        const time = prettyMs(elapsed);
        return chalk.gray(time)
    }

    function formatBundleSize(bundle) {
        const bytes = parseInt(bundle, 10);
        const size = prettyBytes(bytes).replace(/ /, '');
        return chalk.gray(size)
    }

    function formatMessageName(message) {
        if (message === 'request' || message === 'incoming request') return '<--';
        if (message === 'response' || message === 'request completed') return '-->';
        return message
    }

    function formatMark(mark) {
        return hasUnicode ? mark : '';
    }

    function noEmpty(val) {
        return !!val
    }
}

const errorNameRegex = /^((\w*)(Error|Exception)):/;

var atomicSleep = {exports: {}};

/* global SharedArrayBuffer, Atomics */

if (typeof SharedArrayBuffer !== 'undefined' && typeof Atomics !== 'undefined') {
  const nil = new Int32Array(new SharedArrayBuffer(4));

  function sleep (ms) {
    // also filters out NaN, non-number types, including empty strings, but allows bigints
    const valid = ms > 0 && ms < Infinity; 
    if (valid === false) {
      if (typeof ms !== 'number' && typeof ms !== 'bigint') {
        throw TypeError('sleep: ms must be a number')
      }
      throw RangeError('sleep: ms must be a number that is greater than 0 but less than Infinity')
    }

    Atomics.wait(nil, 0, 0, Number(ms));
  }
  atomicSleep.exports = sleep;
} else {

  function sleep (ms) {
    // also filters out NaN, non-number types, including empty strings, but allows bigints
    const valid = ms > 0 && ms < Infinity; 
    if (valid === false) {
      if (typeof ms !== 'number' && typeof ms !== 'bigint') {
        throw TypeError('sleep: ms must be a number')
      }
      throw RangeError('sleep: ms must be a number that is greater than 0 but less than Infinity')
    }
  }

  atomicSleep.exports = sleep;

}

var atomicSleepExports = atomicSleep.exports;

const fs = require$$2;
const EventEmitter = require$$2$1;
const inherits = require$$2$2.inherits;
const path = require$$3;
const sleep = atomicSleepExports;

const BUSY_WRITE_TIMEOUT = 100;

// 16 KB. Don't write more than docker buffer size.
// https://github.com/moby/moby/blob/513ec73831269947d38a644c278ce3cac36783b2/daemon/logger/copier.go#L13
const MAX_WRITE = 16 * 1024;

function openFile (file, sonic) {
  sonic._opening = true;
  sonic._writing = true;
  sonic._asyncDrainScheduled = false;

  // NOTE: 'error' and 'ready' events emitted below only relevant when sonic.sync===false
  // for sync mode, there is no way to add a listener that will receive these

  function fileOpened (err, fd) {
    if (err) {
      sonic._reopening = false;
      sonic._writing = false;
      sonic._opening = false;

      if (sonic.sync) {
        process.nextTick(() => {
          if (sonic.listenerCount('error') > 0) {
            sonic.emit('error', err);
          }
        });
      } else {
        sonic.emit('error', err);
      }
      return
    }

    sonic.fd = fd;
    sonic.file = file;
    sonic._reopening = false;
    sonic._opening = false;
    sonic._writing = false;

    if (sonic.sync) {
      process.nextTick(() => sonic.emit('ready'));
    } else {
      sonic.emit('ready');
    }

    if (sonic._reopening) {
      return
    }

    // start
    if (!sonic._writing && sonic._len > sonic.minLength && !sonic.destroyed) {
      actualWrite(sonic);
    }
  }

  const flags = sonic.append ? 'a' : 'w';
  const mode = sonic.mode;

  if (sonic.sync) {
    try {
      if (sonic.mkdir) fs.mkdirSync(path.dirname(file), { recursive: true });
      const fd = fs.openSync(file, flags, mode);
      fileOpened(null, fd);
    } catch (err) {
      fileOpened(err);
      throw err
    }
  } else if (sonic.mkdir) {
    fs.mkdir(path.dirname(file), { recursive: true }, (err) => {
      if (err) return fileOpened(err)
      fs.open(file, flags, mode, fileOpened);
    });
  } else {
    fs.open(file, flags, mode, fileOpened);
  }
}

function SonicBoom$1 (opts) {
  if (!(this instanceof SonicBoom$1)) {
    return new SonicBoom$1(opts)
  }

  let { fd, dest, minLength, maxLength, maxWrite, sync, append = true, mode, mkdir, retryEAGAIN, fsync } = opts || {};

  fd = fd || dest;

  this._bufs = [];
  this._len = 0;
  this.fd = -1;
  this._writing = false;
  this._writingBuf = '';
  this._ending = false;
  this._reopening = false;
  this._asyncDrainScheduled = false;
  this._hwm = Math.max(minLength || 0, 16387);
  this.file = null;
  this.destroyed = false;
  this.minLength = minLength || 0;
  this.maxLength = maxLength || 0;
  this.maxWrite = maxWrite || MAX_WRITE;
  this.sync = sync || false;
  this._fsync = fsync || false;
  this.append = append || false;
  this.mode = mode;
  this.retryEAGAIN = retryEAGAIN || (() => true);
  this.mkdir = mkdir || false;

  if (typeof fd === 'number') {
    this.fd = fd;
    process.nextTick(() => this.emit('ready'));
  } else if (typeof fd === 'string') {
    openFile(fd, this);
  } else {
    throw new Error('SonicBoom supports only file descriptors and files')
  }
  if (this.minLength >= this.maxWrite) {
    throw new Error(`minLength should be smaller than maxWrite (${this.maxWrite})`)
  }

  this.release = (err, n) => {
    if (err) {
      if ((err.code === 'EAGAIN' || err.code === 'EBUSY') && this.retryEAGAIN(err, this._writingBuf.length, this._len - this._writingBuf.length)) {
        if (this.sync) {
          // This error code should not happen in sync mode, because it is
          // not using the underlining operating system asynchronous functions.
          // However it happens, and so we handle it.
          // Ref: https://github.com/pinojs/pino/issues/783
          try {
            sleep(BUSY_WRITE_TIMEOUT);
            this.release(undefined, 0);
          } catch (err) {
            this.release(err);
          }
        } else {
          // Let's give the destination some time to process the chunk.
          setTimeout(() => {
            fs.write(this.fd, this._writingBuf, 'utf8', this.release);
          }, BUSY_WRITE_TIMEOUT);
        }
      } else {
        this._writing = false;

        this.emit('error', err);
      }
      return
    }

    this.emit('write', n);

    this._len -= n;
    // In case of multi-byte characters, the length of the written buffer
    // may be different from the length of the string. Let's make sure
    // we do not have an accumulated string with a negative length.
    // This also mean that ._len is not precise, but it's not a problem as some
    // writes might be triggered earlier than ._minLength.
    if (this._len < 0) {
      this._len = 0;
    }

    // TODO if we have a multi-byte character in the buffer, we need to
    // n might not be the same as this._writingBuf.length, so we might loose
    // characters here. The solution to this problem is to use a Buffer for _writingBuf.
    this._writingBuf = this._writingBuf.slice(n);

    if (this._writingBuf.length) {
      if (!this.sync) {
        fs.write(this.fd, this._writingBuf, 'utf8', this.release);
        return
      }

      try {
        do {
          const n = fs.writeSync(this.fd, this._writingBuf, 'utf8');
          this._len -= n;
          this._writingBuf = this._writingBuf.slice(n);
        } while (this._writingBuf)
      } catch (err) {
        this.release(err);
        return
      }
    }

    if (this._fsync) {
      fs.fsyncSync(this.fd);
    }

    const len = this._len;
    if (this._reopening) {
      this._writing = false;
      this._reopening = false;
      this.reopen();
    } else if (len > this.minLength) {
      actualWrite(this);
    } else if (this._ending) {
      if (len > 0) {
        actualWrite(this);
      } else {
        this._writing = false;
        actualClose(this);
      }
    } else {
      this._writing = false;
      if (this.sync) {
        if (!this._asyncDrainScheduled) {
          this._asyncDrainScheduled = true;
          process.nextTick(emitDrain, this);
        }
      } else {
        this.emit('drain');
      }
    }
  };

  this.on('newListener', function (name) {
    if (name === 'drain') {
      this._asyncDrainScheduled = false;
    }
  });
}

function emitDrain (sonic) {
  const hasListeners = sonic.listenerCount('drain') > 0;
  if (!hasListeners) return
  sonic._asyncDrainScheduled = false;
  sonic.emit('drain');
}

inherits(SonicBoom$1, EventEmitter);

SonicBoom$1.prototype.write = function (data) {
  if (this.destroyed) {
    throw new Error('SonicBoom destroyed')
  }

  const len = this._len + data.length;
  const bufs = this._bufs;

  if (this.maxLength && len > this.maxLength) {
    this.emit('drop', data);
    return this._len < this._hwm
  }

  if (
    bufs.length === 0 ||
    bufs[bufs.length - 1].length + data.length > this.maxWrite
  ) {
    bufs.push('' + data);
  } else {
    bufs[bufs.length - 1] += data;
  }

  this._len = len;

  if (!this._writing && this._len >= this.minLength) {
    actualWrite(this);
  }

  return this._len < this._hwm
};

SonicBoom$1.prototype.flush = function () {
  if (this.destroyed) {
    throw new Error('SonicBoom destroyed')
  }

  if (this._writing || this.minLength <= 0) {
    return
  }

  if (this._bufs.length === 0) {
    this._bufs.push('');
  }

  actualWrite(this);
};

SonicBoom$1.prototype.reopen = function (file) {
  if (this.destroyed) {
    throw new Error('SonicBoom destroyed')
  }

  if (this._opening) {
    this.once('ready', () => {
      this.reopen(file);
    });
    return
  }

  if (this._ending) {
    return
  }

  if (!this.file) {
    throw new Error('Unable to reopen a file descriptor, you must pass a file to SonicBoom')
  }

  this._reopening = true;

  if (this._writing) {
    return
  }

  const fd = this.fd;
  this.once('ready', () => {
    if (fd !== this.fd) {
      fs.close(fd, (err) => {
        if (err) {
          return this.emit('error', err)
        }
      });
    }
  });

  openFile(file || this.file, this);
};

SonicBoom$1.prototype.end = function () {
  if (this.destroyed) {
    throw new Error('SonicBoom destroyed')
  }

  if (this._opening) {
    this.once('ready', () => {
      this.end();
    });
    return
  }

  if (this._ending) {
    return
  }

  this._ending = true;

  if (this._writing) {
    return
  }

  if (this._len > 0 && this.fd >= 0) {
    actualWrite(this);
  } else {
    actualClose(this);
  }
};

SonicBoom$1.prototype.flushSync = function () {
  if (this.destroyed) {
    throw new Error('SonicBoom destroyed')
  }

  if (this.fd < 0) {
    throw new Error('sonic boom is not ready yet')
  }

  if (!this._writing && this._writingBuf.length > 0) {
    this._bufs.unshift(this._writingBuf);
    this._writingBuf = '';
  }

  let buf = '';
  while (this._bufs.length || buf.length) {
    if (buf.length <= 0) {
      buf = this._bufs[0];
    }
    try {
      const n = fs.writeSync(this.fd, buf, 'utf8');
      buf = buf.slice(n);
      this._len = Math.max(this._len - n, 0);
      if (buf.length <= 0) {
        this._bufs.shift();
      }
    } catch (err) {
      const shouldRetry = err.code === 'EAGAIN' || err.code === 'EBUSY';
      if (shouldRetry && !this.retryEAGAIN(err, buf.length, this._len - buf.length)) {
        throw err
      }

      sleep(BUSY_WRITE_TIMEOUT);
    }
  }
};

SonicBoom$1.prototype.destroy = function () {
  if (this.destroyed) {
    return
  }
  actualClose(this);
};

function actualWrite (sonic) {
  const release = sonic.release;
  sonic._writing = true;
  sonic._writingBuf = sonic._writingBuf || sonic._bufs.shift() || '';

  if (sonic.sync) {
    try {
      const written = fs.writeSync(sonic.fd, sonic._writingBuf, 'utf8');
      release(null, written);
    } catch (err) {
      release(err);
    }
  } else {
    fs.write(sonic.fd, sonic._writingBuf, 'utf8', release);
  }
}

function actualClose (sonic) {
  if (sonic.fd === -1) {
    sonic.once('ready', actualClose.bind(null, sonic));
    return
  }

  sonic.destroyed = true;
  sonic._bufs = [];

  if (sonic.fd !== 1 && sonic.fd !== 2) {
    fs.close(sonic.fd, done);
  } else {
    setImmediate(done);
  }

  function done (err) {
    if (err) {
      sonic.emit('error', err);
      return
    }

    if (sonic._ending && !sonic._writing) {
      sonic.emit('finish');
    }
    sonic.emit('close');
  }
}

/**
 * These export configurations enable JS and TS developers
 * to consumer SonicBoom in whatever way best suits their needs.
 * Some examples of supported import syntax includes:
 * - `const SonicBoom = require('SonicBoom')`
 * - `const { SonicBoom } = require('SonicBoom')`
 * - `import * as SonicBoom from 'SonicBoom'`
 * - `import { SonicBoom } from 'SonicBoom'`
 * - `import SonicBoom from 'SonicBoom'`
 */
SonicBoom$1.SonicBoom = SonicBoom$1;
SonicBoom$1.default = SonicBoom$1;
var sonicBoom = SonicBoom$1;

const pump = pump_1;
const { Transform } = require$$0$1;
const abstractTransport = pinoAbstractTransport;
const Alpino = pretty;
const SonicBoom = sonicBoom;
const { isMainThread } = require$$5;


//This function was implemented In `pino-pretty`
/**
 * Creates a safe SonicBoom instance
 *
 * @param {object} opts Options for SonicBoom
 *
 * @returns {object} A new SonicBoom stream
 */
function buildSafeSonicBoom (opts) {
    const stream = new SonicBoom(opts);
    stream.on('error', filterBrokenPipe);
    // if we are sync: false, we must flush on exit
    if (!opts.sync && isMainThread) {
      setupOnExit(stream);
    }
    return stream
  
    function filterBrokenPipe (err) {
      if (err.code === 'EPIPE') {
        stream.write = noop;
        stream.end = noop;
        stream.flushSync = noop;
        stream.destroy = noop;
        return
      }
      stream.removeListener('error', filterBrokenPipe);
    }
  }

function build(opts = {}) {
    const pretty = Alpino();
    return abstractTransport(
        function (source) {
            const stream = new Transform({
                objectMode: true,
                autoDestroy: true,
                transform(chunk, enc, cb) {
                    const line = pretty(chunk);
                    cb(null, line);
                },
            });

            let destination;

            if (typeof opts.destination === 'object' && typeof opts.destination.write === 'function') {
                destination = opts.destination;
            } else {
                destination = buildSafeSonicBoom({
                    dest: opts.destination || 1,
                    append: opts.append,
                    mkdir: opts.mkdir,
                    sync: opts.sync, // by default sonic will be async
                });
            }

            source.on('unknown', function (line) {
                destination.write(line + '\n');
            });

            pump(source, stream, destination);
            return stream
        },
        { parse: 'lines' }
    )
}

var alpino = build;

var index = /*@__PURE__*/getDefaultExportFromCjs(alpino);

module.exports = index;
