function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
  try {
    var info = gen[key](arg);
    var value = info.value;
  } catch (error) {
    reject(error);
    return;
  }

  if (info.done) {
    resolve(value);
  } else {
    Promise.resolve(value).then(_next, _throw);
  }
}

function _asyncToGenerator(fn) {
  return function () {
    var self = this,
        args = arguments;
    return new Promise(function (resolve, reject) {
      var gen = fn.apply(self, args);

      function _next(value) {
        asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value);
      }

      function _throw(err) {
        asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err);
      }

      _next(undefined);
    });
  };
}

function _extends() {
  _extends = Object.assign || function (target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];

      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }

    return target;
  };

  return _extends.apply(this, arguments);
}

var runtime = {exports: {}};

/**
 * Copyright (c) 2014-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

(function (module) {
var runtime = (function (exports) {

  var Op = Object.prototype;
  var hasOwn = Op.hasOwnProperty;
  var undefined$1; // More compressible than void 0.
  var $Symbol = typeof Symbol === "function" ? Symbol : {};
  var iteratorSymbol = $Symbol.iterator || "@@iterator";
  var asyncIteratorSymbol = $Symbol.asyncIterator || "@@asyncIterator";
  var toStringTagSymbol = $Symbol.toStringTag || "@@toStringTag";

  function define(obj, key, value) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
    return obj[key];
  }
  try {
    // IE 8 has a broken Object.defineProperty that only works on DOM objects.
    define({}, "");
  } catch (err) {
    define = function(obj, key, value) {
      return obj[key] = value;
    };
  }

  function wrap(innerFn, outerFn, self, tryLocsList) {
    // If outerFn provided and outerFn.prototype is a Generator, then outerFn.prototype instanceof Generator.
    var protoGenerator = outerFn && outerFn.prototype instanceof Generator ? outerFn : Generator;
    var generator = Object.create(protoGenerator.prototype);
    var context = new Context(tryLocsList || []);

    // The ._invoke method unifies the implementations of the .next,
    // .throw, and .return methods.
    generator._invoke = makeInvokeMethod(innerFn, self, context);

    return generator;
  }
  exports.wrap = wrap;

  // Try/catch helper to minimize deoptimizations. Returns a completion
  // record like context.tryEntries[i].completion. This interface could
  // have been (and was previously) designed to take a closure to be
  // invoked without arguments, but in all the cases we care about we
  // already have an existing method we want to call, so there's no need
  // to create a new function object. We can even get away with assuming
  // the method takes exactly one argument, since that happens to be true
  // in every case, so we don't have to touch the arguments object. The
  // only additional allocation required is the completion record, which
  // has a stable shape and so hopefully should be cheap to allocate.
  function tryCatch(fn, obj, arg) {
    try {
      return { type: "normal", arg: fn.call(obj, arg) };
    } catch (err) {
      return { type: "throw", arg: err };
    }
  }

  var GenStateSuspendedStart = "suspendedStart";
  var GenStateSuspendedYield = "suspendedYield";
  var GenStateExecuting = "executing";
  var GenStateCompleted = "completed";

  // Returning this object from the innerFn has the same effect as
  // breaking out of the dispatch switch statement.
  var ContinueSentinel = {};

  // Dummy constructor functions that we use as the .constructor and
  // .constructor.prototype properties for functions that return Generator
  // objects. For full spec compliance, you may wish to configure your
  // minifier not to mangle the names of these two functions.
  function Generator() {}
  function GeneratorFunction() {}
  function GeneratorFunctionPrototype() {}

  // This is a polyfill for %IteratorPrototype% for environments that
  // don't natively support it.
  var IteratorPrototype = {};
  define(IteratorPrototype, iteratorSymbol, function () {
    return this;
  });

  var getProto = Object.getPrototypeOf;
  var NativeIteratorPrototype = getProto && getProto(getProto(values([])));
  if (NativeIteratorPrototype &&
      NativeIteratorPrototype !== Op &&
      hasOwn.call(NativeIteratorPrototype, iteratorSymbol)) {
    // This environment has a native %IteratorPrototype%; use it instead
    // of the polyfill.
    IteratorPrototype = NativeIteratorPrototype;
  }

  var Gp = GeneratorFunctionPrototype.prototype =
    Generator.prototype = Object.create(IteratorPrototype);
  GeneratorFunction.prototype = GeneratorFunctionPrototype;
  define(Gp, "constructor", GeneratorFunctionPrototype);
  define(GeneratorFunctionPrototype, "constructor", GeneratorFunction);
  GeneratorFunction.displayName = define(
    GeneratorFunctionPrototype,
    toStringTagSymbol,
    "GeneratorFunction"
  );

  // Helper for defining the .next, .throw, and .return methods of the
  // Iterator interface in terms of a single ._invoke method.
  function defineIteratorMethods(prototype) {
    ["next", "throw", "return"].forEach(function(method) {
      define(prototype, method, function(arg) {
        return this._invoke(method, arg);
      });
    });
  }

  exports.isGeneratorFunction = function(genFun) {
    var ctor = typeof genFun === "function" && genFun.constructor;
    return ctor
      ? ctor === GeneratorFunction ||
        // For the native GeneratorFunction constructor, the best we can
        // do is to check its .name property.
        (ctor.displayName || ctor.name) === "GeneratorFunction"
      : false;
  };

  exports.mark = function(genFun) {
    if (Object.setPrototypeOf) {
      Object.setPrototypeOf(genFun, GeneratorFunctionPrototype);
    } else {
      genFun.__proto__ = GeneratorFunctionPrototype;
      define(genFun, toStringTagSymbol, "GeneratorFunction");
    }
    genFun.prototype = Object.create(Gp);
    return genFun;
  };

  // Within the body of any async function, `await x` is transformed to
  // `yield regeneratorRuntime.awrap(x)`, so that the runtime can test
  // `hasOwn.call(value, "__await")` to determine if the yielded value is
  // meant to be awaited.
  exports.awrap = function(arg) {
    return { __await: arg };
  };

  function AsyncIterator(generator, PromiseImpl) {
    function invoke(method, arg, resolve, reject) {
      var record = tryCatch(generator[method], generator, arg);
      if (record.type === "throw") {
        reject(record.arg);
      } else {
        var result = record.arg;
        var value = result.value;
        if (value &&
            typeof value === "object" &&
            hasOwn.call(value, "__await")) {
          return PromiseImpl.resolve(value.__await).then(function(value) {
            invoke("next", value, resolve, reject);
          }, function(err) {
            invoke("throw", err, resolve, reject);
          });
        }

        return PromiseImpl.resolve(value).then(function(unwrapped) {
          // When a yielded Promise is resolved, its final value becomes
          // the .value of the Promise<{value,done}> result for the
          // current iteration.
          result.value = unwrapped;
          resolve(result);
        }, function(error) {
          // If a rejected Promise was yielded, throw the rejection back
          // into the async generator function so it can be handled there.
          return invoke("throw", error, resolve, reject);
        });
      }
    }

    var previousPromise;

    function enqueue(method, arg) {
      function callInvokeWithMethodAndArg() {
        return new PromiseImpl(function(resolve, reject) {
          invoke(method, arg, resolve, reject);
        });
      }

      return previousPromise =
        // If enqueue has been called before, then we want to wait until
        // all previous Promises have been resolved before calling invoke,
        // so that results are always delivered in the correct order. If
        // enqueue has not been called before, then it is important to
        // call invoke immediately, without waiting on a callback to fire,
        // so that the async generator function has the opportunity to do
        // any necessary setup in a predictable way. This predictability
        // is why the Promise constructor synchronously invokes its
        // executor callback, and why async functions synchronously
        // execute code before the first await. Since we implement simple
        // async functions in terms of async generators, it is especially
        // important to get this right, even though it requires care.
        previousPromise ? previousPromise.then(
          callInvokeWithMethodAndArg,
          // Avoid propagating failures to Promises returned by later
          // invocations of the iterator.
          callInvokeWithMethodAndArg
        ) : callInvokeWithMethodAndArg();
    }

    // Define the unified helper method that is used to implement .next,
    // .throw, and .return (see defineIteratorMethods).
    this._invoke = enqueue;
  }

  defineIteratorMethods(AsyncIterator.prototype);
  define(AsyncIterator.prototype, asyncIteratorSymbol, function () {
    return this;
  });
  exports.AsyncIterator = AsyncIterator;

  // Note that simple async functions are implemented on top of
  // AsyncIterator objects; they just return a Promise for the value of
  // the final result produced by the iterator.
  exports.async = function(innerFn, outerFn, self, tryLocsList, PromiseImpl) {
    if (PromiseImpl === void 0) PromiseImpl = Promise;

    var iter = new AsyncIterator(
      wrap(innerFn, outerFn, self, tryLocsList),
      PromiseImpl
    );

    return exports.isGeneratorFunction(outerFn)
      ? iter // If outerFn is a generator, return the full iterator.
      : iter.next().then(function(result) {
          return result.done ? result.value : iter.next();
        });
  };

  function makeInvokeMethod(innerFn, self, context) {
    var state = GenStateSuspendedStart;

    return function invoke(method, arg) {
      if (state === GenStateExecuting) {
        throw new Error("Generator is already running");
      }

      if (state === GenStateCompleted) {
        if (method === "throw") {
          throw arg;
        }

        // Be forgiving, per 25.3.3.3.3 of the spec:
        // https://people.mozilla.org/~jorendorff/es6-draft.html#sec-generatorresume
        return doneResult();
      }

      context.method = method;
      context.arg = arg;

      while (true) {
        var delegate = context.delegate;
        if (delegate) {
          var delegateResult = maybeInvokeDelegate(delegate, context);
          if (delegateResult) {
            if (delegateResult === ContinueSentinel) continue;
            return delegateResult;
          }
        }

        if (context.method === "next") {
          // Setting context._sent for legacy support of Babel's
          // function.sent implementation.
          context.sent = context._sent = context.arg;

        } else if (context.method === "throw") {
          if (state === GenStateSuspendedStart) {
            state = GenStateCompleted;
            throw context.arg;
          }

          context.dispatchException(context.arg);

        } else if (context.method === "return") {
          context.abrupt("return", context.arg);
        }

        state = GenStateExecuting;

        var record = tryCatch(innerFn, self, context);
        if (record.type === "normal") {
          // If an exception is thrown from innerFn, we leave state ===
          // GenStateExecuting and loop back for another invocation.
          state = context.done
            ? GenStateCompleted
            : GenStateSuspendedYield;

          if (record.arg === ContinueSentinel) {
            continue;
          }

          return {
            value: record.arg,
            done: context.done
          };

        } else if (record.type === "throw") {
          state = GenStateCompleted;
          // Dispatch the exception by looping back around to the
          // context.dispatchException(context.arg) call above.
          context.method = "throw";
          context.arg = record.arg;
        }
      }
    };
  }

  // Call delegate.iterator[context.method](context.arg) and handle the
  // result, either by returning a { value, done } result from the
  // delegate iterator, or by modifying context.method and context.arg,
  // setting context.delegate to null, and returning the ContinueSentinel.
  function maybeInvokeDelegate(delegate, context) {
    var method = delegate.iterator[context.method];
    if (method === undefined$1) {
      // A .throw or .return when the delegate iterator has no .throw
      // method always terminates the yield* loop.
      context.delegate = null;

      if (context.method === "throw") {
        // Note: ["return"] must be used for ES3 parsing compatibility.
        if (delegate.iterator["return"]) {
          // If the delegate iterator has a return method, give it a
          // chance to clean up.
          context.method = "return";
          context.arg = undefined$1;
          maybeInvokeDelegate(delegate, context);

          if (context.method === "throw") {
            // If maybeInvokeDelegate(context) changed context.method from
            // "return" to "throw", let that override the TypeError below.
            return ContinueSentinel;
          }
        }

        context.method = "throw";
        context.arg = new TypeError(
          "The iterator does not provide a 'throw' method");
      }

      return ContinueSentinel;
    }

    var record = tryCatch(method, delegate.iterator, context.arg);

    if (record.type === "throw") {
      context.method = "throw";
      context.arg = record.arg;
      context.delegate = null;
      return ContinueSentinel;
    }

    var info = record.arg;

    if (! info) {
      context.method = "throw";
      context.arg = new TypeError("iterator result is not an object");
      context.delegate = null;
      return ContinueSentinel;
    }

    if (info.done) {
      // Assign the result of the finished delegate to the temporary
      // variable specified by delegate.resultName (see delegateYield).
      context[delegate.resultName] = info.value;

      // Resume execution at the desired location (see delegateYield).
      context.next = delegate.nextLoc;

      // If context.method was "throw" but the delegate handled the
      // exception, let the outer generator proceed normally. If
      // context.method was "next", forget context.arg since it has been
      // "consumed" by the delegate iterator. If context.method was
      // "return", allow the original .return call to continue in the
      // outer generator.
      if (context.method !== "return") {
        context.method = "next";
        context.arg = undefined$1;
      }

    } else {
      // Re-yield the result returned by the delegate method.
      return info;
    }

    // The delegate iterator is finished, so forget it and continue with
    // the outer generator.
    context.delegate = null;
    return ContinueSentinel;
  }

  // Define Generator.prototype.{next,throw,return} in terms of the
  // unified ._invoke helper method.
  defineIteratorMethods(Gp);

  define(Gp, toStringTagSymbol, "Generator");

  // A Generator should always return itself as the iterator object when the
  // @@iterator function is called on it. Some browsers' implementations of the
  // iterator prototype chain incorrectly implement this, causing the Generator
  // object to not be returned from this call. This ensures that doesn't happen.
  // See https://github.com/facebook/regenerator/issues/274 for more details.
  define(Gp, iteratorSymbol, function() {
    return this;
  });

  define(Gp, "toString", function() {
    return "[object Generator]";
  });

  function pushTryEntry(locs) {
    var entry = { tryLoc: locs[0] };

    if (1 in locs) {
      entry.catchLoc = locs[1];
    }

    if (2 in locs) {
      entry.finallyLoc = locs[2];
      entry.afterLoc = locs[3];
    }

    this.tryEntries.push(entry);
  }

  function resetTryEntry(entry) {
    var record = entry.completion || {};
    record.type = "normal";
    delete record.arg;
    entry.completion = record;
  }

  function Context(tryLocsList) {
    // The root entry object (effectively a try statement without a catch
    // or a finally block) gives us a place to store values thrown from
    // locations where there is no enclosing try statement.
    this.tryEntries = [{ tryLoc: "root" }];
    tryLocsList.forEach(pushTryEntry, this);
    this.reset(true);
  }

  exports.keys = function(object) {
    var keys = [];
    for (var key in object) {
      keys.push(key);
    }
    keys.reverse();

    // Rather than returning an object with a next method, we keep
    // things simple and return the next function itself.
    return function next() {
      while (keys.length) {
        var key = keys.pop();
        if (key in object) {
          next.value = key;
          next.done = false;
          return next;
        }
      }

      // To avoid creating an additional object, we just hang the .value
      // and .done properties off the next function object itself. This
      // also ensures that the minifier will not anonymize the function.
      next.done = true;
      return next;
    };
  };

  function values(iterable) {
    if (iterable) {
      var iteratorMethod = iterable[iteratorSymbol];
      if (iteratorMethod) {
        return iteratorMethod.call(iterable);
      }

      if (typeof iterable.next === "function") {
        return iterable;
      }

      if (!isNaN(iterable.length)) {
        var i = -1, next = function next() {
          while (++i < iterable.length) {
            if (hasOwn.call(iterable, i)) {
              next.value = iterable[i];
              next.done = false;
              return next;
            }
          }

          next.value = undefined$1;
          next.done = true;

          return next;
        };

        return next.next = next;
      }
    }

    // Return an iterator with no values.
    return { next: doneResult };
  }
  exports.values = values;

  function doneResult() {
    return { value: undefined$1, done: true };
  }

  Context.prototype = {
    constructor: Context,

    reset: function(skipTempReset) {
      this.prev = 0;
      this.next = 0;
      // Resetting context._sent for legacy support of Babel's
      // function.sent implementation.
      this.sent = this._sent = undefined$1;
      this.done = false;
      this.delegate = null;

      this.method = "next";
      this.arg = undefined$1;

      this.tryEntries.forEach(resetTryEntry);

      if (!skipTempReset) {
        for (var name in this) {
          // Not sure about the optimal order of these conditions:
          if (name.charAt(0) === "t" &&
              hasOwn.call(this, name) &&
              !isNaN(+name.slice(1))) {
            this[name] = undefined$1;
          }
        }
      }
    },

    stop: function() {
      this.done = true;

      var rootEntry = this.tryEntries[0];
      var rootRecord = rootEntry.completion;
      if (rootRecord.type === "throw") {
        throw rootRecord.arg;
      }

      return this.rval;
    },

    dispatchException: function(exception) {
      if (this.done) {
        throw exception;
      }

      var context = this;
      function handle(loc, caught) {
        record.type = "throw";
        record.arg = exception;
        context.next = loc;

        if (caught) {
          // If the dispatched exception was caught by a catch block,
          // then let that catch block handle the exception normally.
          context.method = "next";
          context.arg = undefined$1;
        }

        return !! caught;
      }

      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        var record = entry.completion;

        if (entry.tryLoc === "root") {
          // Exception thrown outside of any try block that could handle
          // it, so set the completion value of the entire function to
          // throw the exception.
          return handle("end");
        }

        if (entry.tryLoc <= this.prev) {
          var hasCatch = hasOwn.call(entry, "catchLoc");
          var hasFinally = hasOwn.call(entry, "finallyLoc");

          if (hasCatch && hasFinally) {
            if (this.prev < entry.catchLoc) {
              return handle(entry.catchLoc, true);
            } else if (this.prev < entry.finallyLoc) {
              return handle(entry.finallyLoc);
            }

          } else if (hasCatch) {
            if (this.prev < entry.catchLoc) {
              return handle(entry.catchLoc, true);
            }

          } else if (hasFinally) {
            if (this.prev < entry.finallyLoc) {
              return handle(entry.finallyLoc);
            }

          } else {
            throw new Error("try statement without catch or finally");
          }
        }
      }
    },

    abrupt: function(type, arg) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.tryLoc <= this.prev &&
            hasOwn.call(entry, "finallyLoc") &&
            this.prev < entry.finallyLoc) {
          var finallyEntry = entry;
          break;
        }
      }

      if (finallyEntry &&
          (type === "break" ||
           type === "continue") &&
          finallyEntry.tryLoc <= arg &&
          arg <= finallyEntry.finallyLoc) {
        // Ignore the finally entry if control is not jumping to a
        // location outside the try/catch block.
        finallyEntry = null;
      }

      var record = finallyEntry ? finallyEntry.completion : {};
      record.type = type;
      record.arg = arg;

      if (finallyEntry) {
        this.method = "next";
        this.next = finallyEntry.finallyLoc;
        return ContinueSentinel;
      }

      return this.complete(record);
    },

    complete: function(record, afterLoc) {
      if (record.type === "throw") {
        throw record.arg;
      }

      if (record.type === "break" ||
          record.type === "continue") {
        this.next = record.arg;
      } else if (record.type === "return") {
        this.rval = this.arg = record.arg;
        this.method = "return";
        this.next = "end";
      } else if (record.type === "normal" && afterLoc) {
        this.next = afterLoc;
      }

      return ContinueSentinel;
    },

    finish: function(finallyLoc) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.finallyLoc === finallyLoc) {
          this.complete(entry.completion, entry.afterLoc);
          resetTryEntry(entry);
          return ContinueSentinel;
        }
      }
    },

    "catch": function(tryLoc) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.tryLoc === tryLoc) {
          var record = entry.completion;
          if (record.type === "throw") {
            var thrown = record.arg;
            resetTryEntry(entry);
          }
          return thrown;
        }
      }

      // The context.catch method must only be called with a location
      // argument that corresponds to a known catch block.
      throw new Error("illegal catch attempt");
    },

    delegateYield: function(iterable, resultName, nextLoc) {
      this.delegate = {
        iterator: values(iterable),
        resultName: resultName,
        nextLoc: nextLoc
      };

      if (this.method === "next") {
        // Deliberately forget the last sent value so that we don't
        // accidentally pass it on to the delegate.
        this.arg = undefined$1;
      }

      return ContinueSentinel;
    }
  };

  // Regardless of whether this script is executing as a CommonJS module
  // or not, return the runtime object so that we can declare the variable
  // regeneratorRuntime in the outer scope, which allows this module to be
  // injected easily by `bin/regenerator --include-runtime script.js`.
  return exports;

}(
  // If this script is executing as a CommonJS module, use module.exports
  // as the regeneratorRuntime namespace. Otherwise create a new empty
  // object. Either way, the resulting object will be used to initialize
  // the regeneratorRuntime variable at the top of this file.
  module.exports 
));

try {
  regeneratorRuntime = runtime;
} catch (accidentalStrictMode) {
  // This module should not be running in strict mode, so the above
  // assignment should always work unless something is misconfigured. Just
  // in case runtime.js accidentally runs in strict mode, in modern engines
  // we can explicitly access globalThis. In older engines we can escape
  // strict mode using a global Function call. This could conceivably fail
  // if a Content Security Policy forbids using Function, but in that case
  // the proper solution is to fix the accidental strict mode problem. If
  // you've misconfigured your bundler to force strict mode and applied a
  // CSP to forbid Function, and you're not willing to fix either of those
  // problems, please detail your unique predicament in a GitHub issue.
  if (typeof globalThis === "object") {
    globalThis.regeneratorRuntime = runtime;
  } else {
    Function("r", "regeneratorRuntime = r")(runtime);
  }
}
}(runtime));

var _regeneratorRuntime = runtime.exports;

var MessageType = {
  Method: 'method',
  MethodDefined: 'method-defined',
  SetMethods: 'set-methods',
  ServiceMethod: 'service-method'
};
var Connection = /*#__PURE__*/function () {
  function Connection(port, options) {
    var _this = this;

    this.port = void 0;
    this.remote = {};
    this.api = {};
    this.options = {};
    this.serviceMethods = {};

    this.portOnMessage = /*#__PURE__*/function () {
      var _ref = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee(event) {
        var name, method, args, result, exists, methodNames, _name, _method, _args, _result;

        return _regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _context.t0 = event.data.type;
                _context.next = _context.t0 === MessageType.Method ? 3 : _context.t0 === MessageType.MethodDefined ? 17 : _context.t0 === MessageType.SetMethods ? 19 : _context.t0 === MessageType.ServiceMethod ? 22 : 36;
                break;

              case 3:
                _context.prev = 3;
                name = event.data.name;
                method = _this.api[name];
                args = event.data.args;
                _context.next = 9;
                return method.apply(null, args);

              case 9:
                result = _context.sent;
                event.ports[0].postMessage({
                  result: result
                });
                _context.next = 16;
                break;

              case 13:
                _context.prev = 13;
                _context.t1 = _context["catch"](3);
                event.ports[0].postMessage({
                  error: _this.serializeError(_context.t1)
                });

              case 16:
                return _context.abrupt("break", 36);

              case 17:
                try {
                  exists = !!_this.api[event.data.name];
                  event.ports[0].postMessage({
                    result: exists
                  });
                } catch (e) {
                  event.ports[0].postMessage({
                    error: _this.serializeError(e)
                  });
                }

                return _context.abrupt("break", 36);

              case 19:
                methodNames = event.data.api;
                console.log(methodNames);
                return _context.abrupt("break", 36);

              case 22:
                _context.prev = 22;
                _name = event.data.name;
                _method = _this.serviceMethods[_name];
                _args = event.data.args;
                _context.next = 28;
                return _method.apply(null, _args);

              case 28:
                _result = _context.sent;
                event.ports[0].postMessage({
                  result: _result
                });
                _context.next = 35;
                break;

              case 32:
                _context.prev = 32;
                _context.t2 = _context["catch"](22);
                event.ports[0].postMessage({
                  error: _this.serializeError(_context.t2)
                });

              case 35:
                return _context.abrupt("break", 36);

              case 36:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, null, [[3, 13], [22, 32]]);
      }));

      return function (_x) {
        return _ref.apply(this, arguments);
      };
    }();

    this.port = port;
    this.options = Object.assign({}, options);
    this.port.onmessage = this.portOnMessage;
    this.remote = new Proxy(this.remote, {
      get: function get(_target, prop) {
        return _this.generateFunction(prop);
      },
      set: function set(_target, prop, value) {
        _this.api[prop] = value;
        return true;
      }
    });

    if (this.options.pluginObject) {
      Object.setPrototypeOf(this.options.pluginObject, this.remote);
    }
  }

  var _proto = Connection.prototype;

  _proto.setServiceMethods = function setServiceMethods(api) {
    this.serviceMethods = api;
  };

  _proto.setLocalMethods = function setLocalMethods(api) {
    var names = Object.keys(api);
    this.port.postMessage({
      type: MessageType.SetMethods,
      api: names
    });
    this.api = api;
  };

  _proto.callServiceMethod = function callServiceMethod(methodName) {
    for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
      args[_key - 1] = arguments[_key];
    }

    var message = {
      type: MessageType.ServiceMethod,
      name: methodName,
      args: args
    };
    return this.sendMessage(message);
  };

  _proto.methodDefined = function methodDefined(methodName) {
    var message = {
      type: MessageType.MethodDefined,
      name: methodName
    };
    return this.sendMessage(message);
  };

  _proto.sendMessage = function sendMessage(message) {
    var _this2 = this;

    return new Promise(function (resolve, reject) {
      var _MessageChannel = new MessageChannel(),
          port1 = _MessageChannel.port1,
          port2 = _MessageChannel.port2;

      port1.onmessage = function (event) {
        var data = event.data;
        port1.close();

        if (data.error) {
          reject(data.error);
        } else {
          resolve(data.result);
        }
      };

      _this2.port.postMessage(message, [port2]);
    });
  };

  _proto.close = function close() {
    this.port.close();
  };

  _proto.serializeError = function serializeError(error) {
    console.log(error);
    return [].concat(Object.keys(error), ['message']).reduce(function (acc, it) {
      acc[it] = error[it];
      return acc;
    }, {});
  };

  _proto.generateFunction = function generateFunction(name) {
    var _this3 = this;

    var newFunc = function newFunc() {
      for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        args[_key2] = arguments[_key2];
      }

      return new Promise(function (resolve, reject) {
        var _MessageChannel2 = new MessageChannel(),
            port1 = _MessageChannel2.port1,
            port2 = _MessageChannel2.port2;

        port1.onmessage = function (_ref2) {
          var data = _ref2.data;
          port1.close();

          if (data.error) {
            reject(data.error);
          } else {
            var result = data.result;

            if (_this3.options.completeFuncs && _this3.options.completeFuncs[name]) {
              result = _this3.options.completeFuncs[name](result);
            }

            resolve(result);
          }
        };

        if (_this3.options.prepareFuncs && _this3.options.prepareFuncs[name]) {
          args = _this3.options.prepareFuncs[name](args);
        }

        _this3.port.postMessage({
          type: MessageType.Method,
          name: name,
          args: args
        }, [port2]);
      });
    };

    return newFunc;
  };

  return Connection;
}();

var PluginHost = /*#__PURE__*/function () {
  function PluginHost(api, options) {
    var _this$options$sandbox,
        _this$options$frameSr,
        _this = this;

    this.iframe = void 0;
    this.remoteOrigin = void 0;
    this.api = void 0;
    this.readyPromise = void 0;
    this.defaultOptions = {
      container: document.body,
      sandboxAttributes: ['allow-scripts']
    };
    this.options = void 0;
    this.compiled = "function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {\n  try {\n    var info = gen[key](arg);\n    var value = info.value;\n  } catch (error) {\n    reject(error);\n    return;\n  }\n\n  if (info.done) {\n    resolve(value);\n  } else {\n    Promise.resolve(value).then(_next, _throw);\n  }\n}\n\nfunction _asyncToGenerator(fn) {\n  return function () {\n    var self = this,\n        args = arguments;\n    return new Promise(function (resolve, reject) {\n      var gen = fn.apply(self, args);\n\n      function _next(value) {\n        asyncGeneratorStep(gen, resolve, reject, _next, _throw, \"next\", value);\n      }\n\n      function _throw(err) {\n        asyncGeneratorStep(gen, resolve, reject, _next, _throw, \"throw\", err);\n      }\n\n      _next(undefined);\n    });\n  };\n}\n\nfunction _extends() {\n  _extends = Object.assign || function (target) {\n    for (var i = 1; i < arguments.length; i++) {\n      var source = arguments[i];\n\n      for (var key in source) {\n        if (Object.prototype.hasOwnProperty.call(source, key)) {\n          target[key] = source[key];\n        }\n      }\n    }\n\n    return target;\n  };\n\n  return _extends.apply(this, arguments);\n}\n\nvar runtime = {exports: {}};\n\n/**\n * Copyright (c) 2014-present, Facebook, Inc.\n *\n * This source code is licensed under the MIT license found in the\n * LICENSE file in the root directory of this source tree.\n */\n\n(function (module) {\nvar runtime = (function (exports) {\n\n  var Op = Object.prototype;\n  var hasOwn = Op.hasOwnProperty;\n  var undefined$1; // More compressible than void 0.\n  var $Symbol = typeof Symbol === \"function\" ? Symbol : {};\n  var iteratorSymbol = $Symbol.iterator || \"@@iterator\";\n  var asyncIteratorSymbol = $Symbol.asyncIterator || \"@@asyncIterator\";\n  var toStringTagSymbol = $Symbol.toStringTag || \"@@toStringTag\";\n\n  function define(obj, key, value) {\n    Object.defineProperty(obj, key, {\n      value: value,\n      enumerable: true,\n      configurable: true,\n      writable: true\n    });\n    return obj[key];\n  }\n  try {\n    // IE 8 has a broken Object.defineProperty that only works on DOM objects.\n    define({}, \"\");\n  } catch (err) {\n    define = function(obj, key, value) {\n      return obj[key] = value;\n    };\n  }\n\n  function wrap(innerFn, outerFn, self, tryLocsList) {\n    // If outerFn provided and outerFn.prototype is a Generator, then outerFn.prototype instanceof Generator.\n    var protoGenerator = outerFn && outerFn.prototype instanceof Generator ? outerFn : Generator;\n    var generator = Object.create(protoGenerator.prototype);\n    var context = new Context(tryLocsList || []);\n\n    // The ._invoke method unifies the implementations of the .next,\n    // .throw, and .return methods.\n    generator._invoke = makeInvokeMethod(innerFn, self, context);\n\n    return generator;\n  }\n  exports.wrap = wrap;\n\n  // Try/catch helper to minimize deoptimizations. Returns a completion\n  // record like context.tryEntries[i].completion. This interface could\n  // have been (and was previously) designed to take a closure to be\n  // invoked without arguments, but in all the cases we care about we\n  // already have an existing method we want to call, so there's no need\n  // to create a new function object. We can even get away with assuming\n  // the method takes exactly one argument, since that happens to be true\n  // in every case, so we don't have to touch the arguments object. The\n  // only additional allocation required is the completion record, which\n  // has a stable shape and so hopefully should be cheap to allocate.\n  function tryCatch(fn, obj, arg) {\n    try {\n      return { type: \"normal\", arg: fn.call(obj, arg) };\n    } catch (err) {\n      return { type: \"throw\", arg: err };\n    }\n  }\n\n  var GenStateSuspendedStart = \"suspendedStart\";\n  var GenStateSuspendedYield = \"suspendedYield\";\n  var GenStateExecuting = \"executing\";\n  var GenStateCompleted = \"completed\";\n\n  // Returning this object from the innerFn has the same effect as\n  // breaking out of the dispatch switch statement.\n  var ContinueSentinel = {};\n\n  // Dummy constructor functions that we use as the .constructor and\n  // .constructor.prototype properties for functions that return Generator\n  // objects. For full spec compliance, you may wish to configure your\n  // minifier not to mangle the names of these two functions.\n  function Generator() {}\n  function GeneratorFunction() {}\n  function GeneratorFunctionPrototype() {}\n\n  // This is a polyfill for %IteratorPrototype% for environments that\n  // don't natively support it.\n  var IteratorPrototype = {};\n  define(IteratorPrototype, iteratorSymbol, function () {\n    return this;\n  });\n\n  var getProto = Object.getPrototypeOf;\n  var NativeIteratorPrototype = getProto && getProto(getProto(values([])));\n  if (NativeIteratorPrototype &&\n      NativeIteratorPrototype !== Op &&\n      hasOwn.call(NativeIteratorPrototype, iteratorSymbol)) {\n    // This environment has a native %IteratorPrototype%; use it instead\n    // of the polyfill.\n    IteratorPrototype = NativeIteratorPrototype;\n  }\n\n  var Gp = GeneratorFunctionPrototype.prototype =\n    Generator.prototype = Object.create(IteratorPrototype);\n  GeneratorFunction.prototype = GeneratorFunctionPrototype;\n  define(Gp, \"constructor\", GeneratorFunctionPrototype);\n  define(GeneratorFunctionPrototype, \"constructor\", GeneratorFunction);\n  GeneratorFunction.displayName = define(\n    GeneratorFunctionPrototype,\n    toStringTagSymbol,\n    \"GeneratorFunction\"\n  );\n\n  // Helper for defining the .next, .throw, and .return methods of the\n  // Iterator interface in terms of a single ._invoke method.\n  function defineIteratorMethods(prototype) {\n    [\"next\", \"throw\", \"return\"].forEach(function(method) {\n      define(prototype, method, function(arg) {\n        return this._invoke(method, arg);\n      });\n    });\n  }\n\n  exports.isGeneratorFunction = function(genFun) {\n    var ctor = typeof genFun === \"function\" && genFun.constructor;\n    return ctor\n      ? ctor === GeneratorFunction ||\n        // For the native GeneratorFunction constructor, the best we can\n        // do is to check its .name property.\n        (ctor.displayName || ctor.name) === \"GeneratorFunction\"\n      : false;\n  };\n\n  exports.mark = function(genFun) {\n    if (Object.setPrototypeOf) {\n      Object.setPrototypeOf(genFun, GeneratorFunctionPrototype);\n    } else {\n      genFun.__proto__ = GeneratorFunctionPrototype;\n      define(genFun, toStringTagSymbol, \"GeneratorFunction\");\n    }\n    genFun.prototype = Object.create(Gp);\n    return genFun;\n  };\n\n  // Within the body of any async function, `await x` is transformed to\n  // `yield regeneratorRuntime.awrap(x)`, so that the runtime can test\n  // `hasOwn.call(value, \"__await\")` to determine if the yielded value is\n  // meant to be awaited.\n  exports.awrap = function(arg) {\n    return { __await: arg };\n  };\n\n  function AsyncIterator(generator, PromiseImpl) {\n    function invoke(method, arg, resolve, reject) {\n      var record = tryCatch(generator[method], generator, arg);\n      if (record.type === \"throw\") {\n        reject(record.arg);\n      } else {\n        var result = record.arg;\n        var value = result.value;\n        if (value &&\n            typeof value === \"object\" &&\n            hasOwn.call(value, \"__await\")) {\n          return PromiseImpl.resolve(value.__await).then(function(value) {\n            invoke(\"next\", value, resolve, reject);\n          }, function(err) {\n            invoke(\"throw\", err, resolve, reject);\n          });\n        }\n\n        return PromiseImpl.resolve(value).then(function(unwrapped) {\n          // When a yielded Promise is resolved, its final value becomes\n          // the .value of the Promise<{value,done}> result for the\n          // current iteration.\n          result.value = unwrapped;\n          resolve(result);\n        }, function(error) {\n          // If a rejected Promise was yielded, throw the rejection back\n          // into the async generator function so it can be handled there.\n          return invoke(\"throw\", error, resolve, reject);\n        });\n      }\n    }\n\n    var previousPromise;\n\n    function enqueue(method, arg) {\n      function callInvokeWithMethodAndArg() {\n        return new PromiseImpl(function(resolve, reject) {\n          invoke(method, arg, resolve, reject);\n        });\n      }\n\n      return previousPromise =\n        // If enqueue has been called before, then we want to wait until\n        // all previous Promises have been resolved before calling invoke,\n        // so that results are always delivered in the correct order. If\n        // enqueue has not been called before, then it is important to\n        // call invoke immediately, without waiting on a callback to fire,\n        // so that the async generator function has the opportunity to do\n        // any necessary setup in a predictable way. This predictability\n        // is why the Promise constructor synchronously invokes its\n        // executor callback, and why async functions synchronously\n        // execute code before the first await. Since we implement simple\n        // async functions in terms of async generators, it is especially\n        // important to get this right, even though it requires care.\n        previousPromise ? previousPromise.then(\n          callInvokeWithMethodAndArg,\n          // Avoid propagating failures to Promises returned by later\n          // invocations of the iterator.\n          callInvokeWithMethodAndArg\n        ) : callInvokeWithMethodAndArg();\n    }\n\n    // Define the unified helper method that is used to implement .next,\n    // .throw, and .return (see defineIteratorMethods).\n    this._invoke = enqueue;\n  }\n\n  defineIteratorMethods(AsyncIterator.prototype);\n  define(AsyncIterator.prototype, asyncIteratorSymbol, function () {\n    return this;\n  });\n  exports.AsyncIterator = AsyncIterator;\n\n  // Note that simple async functions are implemented on top of\n  // AsyncIterator objects; they just return a Promise for the value of\n  // the final result produced by the iterator.\n  exports.async = function(innerFn, outerFn, self, tryLocsList, PromiseImpl) {\n    if (PromiseImpl === void 0) PromiseImpl = Promise;\n\n    var iter = new AsyncIterator(\n      wrap(innerFn, outerFn, self, tryLocsList),\n      PromiseImpl\n    );\n\n    return exports.isGeneratorFunction(outerFn)\n      ? iter // If outerFn is a generator, return the full iterator.\n      : iter.next().then(function(result) {\n          return result.done ? result.value : iter.next();\n        });\n  };\n\n  function makeInvokeMethod(innerFn, self, context) {\n    var state = GenStateSuspendedStart;\n\n    return function invoke(method, arg) {\n      if (state === GenStateExecuting) {\n        throw new Error(\"Generator is already running\");\n      }\n\n      if (state === GenStateCompleted) {\n        if (method === \"throw\") {\n          throw arg;\n        }\n\n        // Be forgiving, per 25.3.3.3.3 of the spec:\n        // https://people.mozilla.org/~jorendorff/es6-draft.html#sec-generatorresume\n        return doneResult();\n      }\n\n      context.method = method;\n      context.arg = arg;\n\n      while (true) {\n        var delegate = context.delegate;\n        if (delegate) {\n          var delegateResult = maybeInvokeDelegate(delegate, context);\n          if (delegateResult) {\n            if (delegateResult === ContinueSentinel) continue;\n            return delegateResult;\n          }\n        }\n\n        if (context.method === \"next\") {\n          // Setting context._sent for legacy support of Babel's\n          // function.sent implementation.\n          context.sent = context._sent = context.arg;\n\n        } else if (context.method === \"throw\") {\n          if (state === GenStateSuspendedStart) {\n            state = GenStateCompleted;\n            throw context.arg;\n          }\n\n          context.dispatchException(context.arg);\n\n        } else if (context.method === \"return\") {\n          context.abrupt(\"return\", context.arg);\n        }\n\n        state = GenStateExecuting;\n\n        var record = tryCatch(innerFn, self, context);\n        if (record.type === \"normal\") {\n          // If an exception is thrown from innerFn, we leave state ===\n          // GenStateExecuting and loop back for another invocation.\n          state = context.done\n            ? GenStateCompleted\n            : GenStateSuspendedYield;\n\n          if (record.arg === ContinueSentinel) {\n            continue;\n          }\n\n          return {\n            value: record.arg,\n            done: context.done\n          };\n\n        } else if (record.type === \"throw\") {\n          state = GenStateCompleted;\n          // Dispatch the exception by looping back around to the\n          // context.dispatchException(context.arg) call above.\n          context.method = \"throw\";\n          context.arg = record.arg;\n        }\n      }\n    };\n  }\n\n  // Call delegate.iterator[context.method](context.arg) and handle the\n  // result, either by returning a { value, done } result from the\n  // delegate iterator, or by modifying context.method and context.arg,\n  // setting context.delegate to null, and returning the ContinueSentinel.\n  function maybeInvokeDelegate(delegate, context) {\n    var method = delegate.iterator[context.method];\n    if (method === undefined$1) {\n      // A .throw or .return when the delegate iterator has no .throw\n      // method always terminates the yield* loop.\n      context.delegate = null;\n\n      if (context.method === \"throw\") {\n        // Note: [\"return\"] must be used for ES3 parsing compatibility.\n        if (delegate.iterator[\"return\"]) {\n          // If the delegate iterator has a return method, give it a\n          // chance to clean up.\n          context.method = \"return\";\n          context.arg = undefined$1;\n          maybeInvokeDelegate(delegate, context);\n\n          if (context.method === \"throw\") {\n            // If maybeInvokeDelegate(context) changed context.method from\n            // \"return\" to \"throw\", let that override the TypeError below.\n            return ContinueSentinel;\n          }\n        }\n\n        context.method = \"throw\";\n        context.arg = new TypeError(\n          \"The iterator does not provide a 'throw' method\");\n      }\n\n      return ContinueSentinel;\n    }\n\n    var record = tryCatch(method, delegate.iterator, context.arg);\n\n    if (record.type === \"throw\") {\n      context.method = \"throw\";\n      context.arg = record.arg;\n      context.delegate = null;\n      return ContinueSentinel;\n    }\n\n    var info = record.arg;\n\n    if (! info) {\n      context.method = \"throw\";\n      context.arg = new TypeError(\"iterator result is not an object\");\n      context.delegate = null;\n      return ContinueSentinel;\n    }\n\n    if (info.done) {\n      // Assign the result of the finished delegate to the temporary\n      // variable specified by delegate.resultName (see delegateYield).\n      context[delegate.resultName] = info.value;\n\n      // Resume execution at the desired location (see delegateYield).\n      context.next = delegate.nextLoc;\n\n      // If context.method was \"throw\" but the delegate handled the\n      // exception, let the outer generator proceed normally. If\n      // context.method was \"next\", forget context.arg since it has been\n      // \"consumed\" by the delegate iterator. If context.method was\n      // \"return\", allow the original .return call to continue in the\n      // outer generator.\n      if (context.method !== \"return\") {\n        context.method = \"next\";\n        context.arg = undefined$1;\n      }\n\n    } else {\n      // Re-yield the result returned by the delegate method.\n      return info;\n    }\n\n    // The delegate iterator is finished, so forget it and continue with\n    // the outer generator.\n    context.delegate = null;\n    return ContinueSentinel;\n  }\n\n  // Define Generator.prototype.{next,throw,return} in terms of the\n  // unified ._invoke helper method.\n  defineIteratorMethods(Gp);\n\n  define(Gp, toStringTagSymbol, \"Generator\");\n\n  // A Generator should always return itself as the iterator object when the\n  // @@iterator function is called on it. Some browsers' implementations of the\n  // iterator prototype chain incorrectly implement this, causing the Generator\n  // object to not be returned from this call. This ensures that doesn't happen.\n  // See https://github.com/facebook/regenerator/issues/274 for more details.\n  define(Gp, iteratorSymbol, function() {\n    return this;\n  });\n\n  define(Gp, \"toString\", function() {\n    return \"[object Generator]\";\n  });\n\n  function pushTryEntry(locs) {\n    var entry = { tryLoc: locs[0] };\n\n    if (1 in locs) {\n      entry.catchLoc = locs[1];\n    }\n\n    if (2 in locs) {\n      entry.finallyLoc = locs[2];\n      entry.afterLoc = locs[3];\n    }\n\n    this.tryEntries.push(entry);\n  }\n\n  function resetTryEntry(entry) {\n    var record = entry.completion || {};\n    record.type = \"normal\";\n    delete record.arg;\n    entry.completion = record;\n  }\n\n  function Context(tryLocsList) {\n    // The root entry object (effectively a try statement without a catch\n    // or a finally block) gives us a place to store values thrown from\n    // locations where there is no enclosing try statement.\n    this.tryEntries = [{ tryLoc: \"root\" }];\n    tryLocsList.forEach(pushTryEntry, this);\n    this.reset(true);\n  }\n\n  exports.keys = function(object) {\n    var keys = [];\n    for (var key in object) {\n      keys.push(key);\n    }\n    keys.reverse();\n\n    // Rather than returning an object with a next method, we keep\n    // things simple and return the next function itself.\n    return function next() {\n      while (keys.length) {\n        var key = keys.pop();\n        if (key in object) {\n          next.value = key;\n          next.done = false;\n          return next;\n        }\n      }\n\n      // To avoid creating an additional object, we just hang the .value\n      // and .done properties off the next function object itself. This\n      // also ensures that the minifier will not anonymize the function.\n      next.done = true;\n      return next;\n    };\n  };\n\n  function values(iterable) {\n    if (iterable) {\n      var iteratorMethod = iterable[iteratorSymbol];\n      if (iteratorMethod) {\n        return iteratorMethod.call(iterable);\n      }\n\n      if (typeof iterable.next === \"function\") {\n        return iterable;\n      }\n\n      if (!isNaN(iterable.length)) {\n        var i = -1, next = function next() {\n          while (++i < iterable.length) {\n            if (hasOwn.call(iterable, i)) {\n              next.value = iterable[i];\n              next.done = false;\n              return next;\n            }\n          }\n\n          next.value = undefined$1;\n          next.done = true;\n\n          return next;\n        };\n\n        return next.next = next;\n      }\n    }\n\n    // Return an iterator with no values.\n    return { next: doneResult };\n  }\n  exports.values = values;\n\n  function doneResult() {\n    return { value: undefined$1, done: true };\n  }\n\n  Context.prototype = {\n    constructor: Context,\n\n    reset: function(skipTempReset) {\n      this.prev = 0;\n      this.next = 0;\n      // Resetting context._sent for legacy support of Babel's\n      // function.sent implementation.\n      this.sent = this._sent = undefined$1;\n      this.done = false;\n      this.delegate = null;\n\n      this.method = \"next\";\n      this.arg = undefined$1;\n\n      this.tryEntries.forEach(resetTryEntry);\n\n      if (!skipTempReset) {\n        for (var name in this) {\n          // Not sure about the optimal order of these conditions:\n          if (name.charAt(0) === \"t\" &&\n              hasOwn.call(this, name) &&\n              !isNaN(+name.slice(1))) {\n            this[name] = undefined$1;\n          }\n        }\n      }\n    },\n\n    stop: function() {\n      this.done = true;\n\n      var rootEntry = this.tryEntries[0];\n      var rootRecord = rootEntry.completion;\n      if (rootRecord.type === \"throw\") {\n        throw rootRecord.arg;\n      }\n\n      return this.rval;\n    },\n\n    dispatchException: function(exception) {\n      if (this.done) {\n        throw exception;\n      }\n\n      var context = this;\n      function handle(loc, caught) {\n        record.type = \"throw\";\n        record.arg = exception;\n        context.next = loc;\n\n        if (caught) {\n          // If the dispatched exception was caught by a catch block,\n          // then let that catch block handle the exception normally.\n          context.method = \"next\";\n          context.arg = undefined$1;\n        }\n\n        return !! caught;\n      }\n\n      for (var i = this.tryEntries.length - 1; i >= 0; --i) {\n        var entry = this.tryEntries[i];\n        var record = entry.completion;\n\n        if (entry.tryLoc === \"root\") {\n          // Exception thrown outside of any try block that could handle\n          // it, so set the completion value of the entire function to\n          // throw the exception.\n          return handle(\"end\");\n        }\n\n        if (entry.tryLoc <= this.prev) {\n          var hasCatch = hasOwn.call(entry, \"catchLoc\");\n          var hasFinally = hasOwn.call(entry, \"finallyLoc\");\n\n          if (hasCatch && hasFinally) {\n            if (this.prev < entry.catchLoc) {\n              return handle(entry.catchLoc, true);\n            } else if (this.prev < entry.finallyLoc) {\n              return handle(entry.finallyLoc);\n            }\n\n          } else if (hasCatch) {\n            if (this.prev < entry.catchLoc) {\n              return handle(entry.catchLoc, true);\n            }\n\n          } else if (hasFinally) {\n            if (this.prev < entry.finallyLoc) {\n              return handle(entry.finallyLoc);\n            }\n\n          } else {\n            throw new Error(\"try statement without catch or finally\");\n          }\n        }\n      }\n    },\n\n    abrupt: function(type, arg) {\n      for (var i = this.tryEntries.length - 1; i >= 0; --i) {\n        var entry = this.tryEntries[i];\n        if (entry.tryLoc <= this.prev &&\n            hasOwn.call(entry, \"finallyLoc\") &&\n            this.prev < entry.finallyLoc) {\n          var finallyEntry = entry;\n          break;\n        }\n      }\n\n      if (finallyEntry &&\n          (type === \"break\" ||\n           type === \"continue\") &&\n          finallyEntry.tryLoc <= arg &&\n          arg <= finallyEntry.finallyLoc) {\n        // Ignore the finally entry if control is not jumping to a\n        // location outside the try/catch block.\n        finallyEntry = null;\n      }\n\n      var record = finallyEntry ? finallyEntry.completion : {};\n      record.type = type;\n      record.arg = arg;\n\n      if (finallyEntry) {\n        this.method = \"next\";\n        this.next = finallyEntry.finallyLoc;\n        return ContinueSentinel;\n      }\n\n      return this.complete(record);\n    },\n\n    complete: function(record, afterLoc) {\n      if (record.type === \"throw\") {\n        throw record.arg;\n      }\n\n      if (record.type === \"break\" ||\n          record.type === \"continue\") {\n        this.next = record.arg;\n      } else if (record.type === \"return\") {\n        this.rval = this.arg = record.arg;\n        this.method = \"return\";\n        this.next = \"end\";\n      } else if (record.type === \"normal\" && afterLoc) {\n        this.next = afterLoc;\n      }\n\n      return ContinueSentinel;\n    },\n\n    finish: function(finallyLoc) {\n      for (var i = this.tryEntries.length - 1; i >= 0; --i) {\n        var entry = this.tryEntries[i];\n        if (entry.finallyLoc === finallyLoc) {\n          this.complete(entry.completion, entry.afterLoc);\n          resetTryEntry(entry);\n          return ContinueSentinel;\n        }\n      }\n    },\n\n    \"catch\": function(tryLoc) {\n      for (var i = this.tryEntries.length - 1; i >= 0; --i) {\n        var entry = this.tryEntries[i];\n        if (entry.tryLoc === tryLoc) {\n          var record = entry.completion;\n          if (record.type === \"throw\") {\n            var thrown = record.arg;\n            resetTryEntry(entry);\n          }\n          return thrown;\n        }\n      }\n\n      // The context.catch method must only be called with a location\n      // argument that corresponds to a known catch block.\n      throw new Error(\"illegal catch attempt\");\n    },\n\n    delegateYield: function(iterable, resultName, nextLoc) {\n      this.delegate = {\n        iterator: values(iterable),\n        resultName: resultName,\n        nextLoc: nextLoc\n      };\n\n      if (this.method === \"next\") {\n        // Deliberately forget the last sent value so that we don't\n        // accidentally pass it on to the delegate.\n        this.arg = undefined$1;\n      }\n\n      return ContinueSentinel;\n    }\n  };\n\n  // Regardless of whether this script is executing as a CommonJS module\n  // or not, return the runtime object so that we can declare the variable\n  // regeneratorRuntime in the outer scope, which allows this module to be\n  // injected easily by `bin/regenerator --include-runtime script.js`.\n  return exports;\n\n}(\n  // If this script is executing as a CommonJS module, use module.exports\n  // as the regeneratorRuntime namespace. Otherwise create a new empty\n  // object. Either way, the resulting object will be used to initialize\n  // the regeneratorRuntime variable at the top of this file.\n  module.exports \n));\n\ntry {\n  regeneratorRuntime = runtime;\n} catch (accidentalStrictMode) {\n  // This module should not be running in strict mode, so the above\n  // assignment should always work unless something is misconfigured. Just\n  // in case runtime.js accidentally runs in strict mode, in modern engines\n  // we can explicitly access globalThis. In older engines we can escape\n  // strict mode using a global Function call. This could conceivably fail\n  // if a Content Security Policy forbids using Function, but in that case\n  // the proper solution is to fix the accidental strict mode problem. If\n  // you've misconfigured your bundler to force strict mode and applied a\n  // CSP to forbid Function, and you're not willing to fix either of those\n  // problems, please detail your unique predicament in a GitHub issue.\n  if (typeof globalThis === \"object\") {\n    globalThis.regeneratorRuntime = runtime;\n  } else {\n    Function(\"r\", \"regeneratorRuntime = r\")(runtime);\n  }\n}\n}(runtime));\n\nvar _regeneratorRuntime = runtime.exports;\n\nvar MessageType = {\n  Method: 'method',\n  MethodDefined: 'method-defined',\n  SetMethods: 'set-methods',\n  ServiceMethod: 'service-method'\n};\nvar Connection = /*#__PURE__*/function () {\n  function Connection(port, options) {\n    var _this = this;\n\n    this.port = void 0;\n    this.remote = {};\n    this.api = {};\n    this.options = {};\n    this.serviceMethods = {};\n\n    this.portOnMessage = /*#__PURE__*/function () {\n      var _ref = _asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee(event) {\n        var name, method, args, result, exists, methodNames, _name, _method, _args, _result;\n\n        return _regeneratorRuntime.wrap(function _callee$(_context) {\n          while (1) {\n            switch (_context.prev = _context.next) {\n              case 0:\n                _context.t0 = event.data.type;\n                _context.next = _context.t0 === MessageType.Method ? 3 : _context.t0 === MessageType.MethodDefined ? 17 : _context.t0 === MessageType.SetMethods ? 19 : _context.t0 === MessageType.ServiceMethod ? 22 : 36;\n                break;\n\n              case 3:\n                _context.prev = 3;\n                name = event.data.name;\n                method = _this.api[name];\n                args = event.data.args;\n                _context.next = 9;\n                return method.apply(null, args);\n\n              case 9:\n                result = _context.sent;\n                event.ports[0].postMessage({\n                  result: result\n                });\n                _context.next = 16;\n                break;\n\n              case 13:\n                _context.prev = 13;\n                _context.t1 = _context[\"catch\"](3);\n                event.ports[0].postMessage({\n                  error: _this.serializeError(_context.t1)\n                });\n\n              case 16:\n                return _context.abrupt(\"break\", 36);\n\n              case 17:\n                try {\n                  exists = !!_this.api[event.data.name];\n                  event.ports[0].postMessage({\n                    result: exists\n                  });\n                } catch (e) {\n                  event.ports[0].postMessage({\n                    error: _this.serializeError(e)\n                  });\n                }\n\n                return _context.abrupt(\"break\", 36);\n\n              case 19:\n                methodNames = event.data.api;\n                console.log(methodNames);\n                return _context.abrupt(\"break\", 36);\n\n              case 22:\n                _context.prev = 22;\n                _name = event.data.name;\n                _method = _this.serviceMethods[_name];\n                _args = event.data.args;\n                _context.next = 28;\n                return _method.apply(null, _args);\n\n              case 28:\n                _result = _context.sent;\n                event.ports[0].postMessage({\n                  result: _result\n                });\n                _context.next = 35;\n                break;\n\n              case 32:\n                _context.prev = 32;\n                _context.t2 = _context[\"catch\"](22);\n                event.ports[0].postMessage({\n                  error: _this.serializeError(_context.t2)\n                });\n\n              case 35:\n                return _context.abrupt(\"break\", 36);\n\n              case 36:\n              case \"end\":\n                return _context.stop();\n            }\n          }\n        }, _callee, null, [[3, 13], [22, 32]]);\n      }));\n\n      return function (_x) {\n        return _ref.apply(this, arguments);\n      };\n    }();\n\n    this.port = port;\n    this.options = Object.assign({}, options);\n    this.port.onmessage = this.portOnMessage;\n    this.remote = new Proxy(this.remote, {\n      get: function get(_target, prop) {\n        return _this.generateFunction(prop);\n      },\n      set: function set(_target, prop, value) {\n        _this.api[prop] = value;\n        return true;\n      }\n    });\n\n    if (this.options.pluginObject) {\n      Object.setPrototypeOf(this.options.pluginObject, this.remote);\n    }\n  }\n\n  var _proto = Connection.prototype;\n\n  _proto.setServiceMethods = function setServiceMethods(api) {\n    this.serviceMethods = api;\n  };\n\n  _proto.setLocalMethods = function setLocalMethods(api) {\n    var names = Object.keys(api);\n    this.port.postMessage({\n      type: MessageType.SetMethods,\n      api: names\n    });\n    this.api = api;\n  };\n\n  _proto.callServiceMethod = function callServiceMethod(methodName) {\n    for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {\n      args[_key - 1] = arguments[_key];\n    }\n\n    var message = {\n      type: MessageType.ServiceMethod,\n      name: methodName,\n      args: args\n    };\n    return this.sendMessage(message);\n  };\n\n  _proto.methodDefined = function methodDefined(methodName) {\n    var message = {\n      type: MessageType.MethodDefined,\n      name: methodName\n    };\n    return this.sendMessage(message);\n  };\n\n  _proto.sendMessage = function sendMessage(message) {\n    var _this2 = this;\n\n    return new Promise(function (resolve, reject) {\n      var _MessageChannel = new MessageChannel(),\n          port1 = _MessageChannel.port1,\n          port2 = _MessageChannel.port2;\n\n      port1.onmessage = function (event) {\n        var data = event.data;\n        port1.close();\n\n        if (data.error) {\n          reject(data.error);\n        } else {\n          resolve(data.result);\n        }\n      };\n\n      _this2.port.postMessage(message, [port2]);\n    });\n  };\n\n  _proto.close = function close() {\n    this.port.close();\n  };\n\n  _proto.serializeError = function serializeError(error) {\n    console.log(error);\n    return [].concat(Object.keys(error), ['message']).reduce(function (acc, it) {\n      acc[it] = error[it];\n      return acc;\n    }, {});\n  };\n\n  _proto.generateFunction = function generateFunction(name) {\n    var _this3 = this;\n\n    var newFunc = function newFunc() {\n      for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {\n        args[_key2] = arguments[_key2];\n      }\n\n      return new Promise(function (resolve, reject) {\n        var _MessageChannel2 = new MessageChannel(),\n            port1 = _MessageChannel2.port1,\n            port2 = _MessageChannel2.port2;\n\n        port1.onmessage = function (_ref2) {\n          var data = _ref2.data;\n          port1.close();\n\n          if (data.error) {\n            reject(data.error);\n          } else {\n            var result = data.result;\n\n            if (_this3.options.completeFuncs && _this3.options.completeFuncs[name]) {\n              result = _this3.options.completeFuncs[name](result);\n            }\n\n            resolve(result);\n          }\n        };\n\n        if (_this3.options.prepareFuncs && _this3.options.prepareFuncs[name]) {\n          args = _this3.options.prepareFuncs[name](args);\n        }\n\n        _this3.port.postMessage({\n          type: MessageType.Method,\n          name: name,\n          args: args\n        }, [port2]);\n      });\n    };\n\n    return newFunc;\n  };\n\n  return Connection;\n}();\n\nvar PluginHost = /*#__PURE__*/function () {\n  function PluginHost(api, options) {\n    var _this$options$sandbox,\n        _this$options$frameSr,\n        _this = this;\n\n    this.iframe = void 0;\n    this.remoteOrigin = void 0;\n    this.api = void 0;\n    this.readyPromise = void 0;\n    this.defaultOptions = {\n      container: document.body,\n      sandboxAttributes: ['allow-scripts']\n    };\n    this.options = void 0;\n    this.compiled = '<TEMPLATE>';\n    this.resolveReady = void 0;\n    this.connection = void 0;\n    this.api = api;\n    this.options = Object.assign(this.defaultOptions, options);\n    this.remoteOrigin = '*';\n\n    if ((_this$options$sandbox = this.options.sandboxAttributes) != null && _this$options$sandbox.includes('allow-same-origin') && (_this$options$frameSr = this.options.frameSrc) != null && _this$options$frameSr.origin) {\n      var _this$options$frameSr2;\n\n      this.remoteOrigin = (_this$options$frameSr2 = this.options.frameSrc) == null ? void 0 : _this$options$frameSr2.origin;\n    }\n\n    this.iframe = this.createIframe();\n    this.readyPromise = new Promise(function (resolve) {\n      _this.resolveReady = resolve;\n    });\n  }\n\n  var _proto = PluginHost.prototype;\n\n  _proto.ready = function ready() {\n    return this.readyPromise;\n  };\n\n  _proto.executeCode = function executeCode(code) {\n    var _this$connection;\n\n    return (_this$connection = this.connection) == null ? void 0 : _this$connection.callServiceMethod('runCode', code);\n  };\n\n  _proto.destroy = function destroy() {\n    var _this$connection2;\n\n    this.iframe.remove();\n    (_this$connection2 = this.connection) == null ? void 0 : _this$connection2.close();\n  };\n\n  _proto.createIframe = function createIframe() {\n    var _this$options$sandbox2, _this$options$contain2;\n\n    var iframe = document.createElement('iframe');\n    iframe.frameBorder = '0';\n    iframe.width = '0';\n    iframe.height = '0';\n    iframe.sandbox = (_this$options$sandbox2 = this.options.sandboxAttributes) == null ? void 0 : _this$options$sandbox2.join(' ');\n    iframe.onload = this.iframeOnLoad.bind(this);\n\n    if (this.options.frameSrc) {\n      var _this$options$contain;\n\n      iframe.src = this.options.frameSrc.href;\n      (_this$options$contain = this.options.container) == null ? void 0 : _this$options$contain.append(iframe);\n      return iframe;\n    }\n\n    var srcdoc = this.getSrcDoc();\n    iframe.setAttribute('srcdoc', srcdoc);\n    (_this$options$contain2 = this.options.container) == null ? void 0 : _this$options$contain2.append(iframe);\n    return iframe;\n  };\n\n  _proto.getSrcDoc = function getSrcDoc() {\n    // var exports = {}\n    // is used to fix electron tests\n    // script close tag must be seperated in\n    // order to avoid parser error\n    var srcdoc = \"\\n<!DOCTYPE html>\\n<html>\\n<head>\\n  <meta charset=\\\"UTF-8\\\">\\n  <script>var exports = {};</scr\" + \"ipt>\\n  <script type=\\\"module\\\">\\n    <INLINE>\\n    const pluginRemote = new PluginRemote({});\\n    window.pluginRemote = pluginRemote;\\n  </scr\" + \"ipt>\\n</head>\\n<body></body>\\n</html>\\n  \";\n    srcdoc = srcdoc.replace('<INLINE>', this.compiled);\n    return srcdoc;\n  };\n\n  _proto.iframeOnLoad = function iframeOnLoad() {\n    var _this$iframe$contentW;\n\n    var channel = new MessageChannel();\n    (_this$iframe$contentW = this.iframe.contentWindow) == null ? void 0 : _this$iframe$contentW.postMessage({\n      type: 'init'\n    }, this.remoteOrigin, [channel.port2]);\n    this.connection = new Connection(channel.port1);\n    this.connection.setServiceMethods({\n      connected: this.connected.bind(this)\n    });\n  };\n\n  _proto.connected = function connected() {\n    var _this$connection3;\n\n    (_this$connection3 = this.connection) == null ? void 0 : _this$connection3.setLocalMethods(this.api);\n    this.resolveReady(undefined);\n  };\n\n  return PluginHost;\n}();\n\nvar application = {};\nvar PluginRemote = /*#__PURE__*/function () {\n  function PluginRemote(api, options) {\n    this.port = void 0;\n    this.api = void 0;\n    this.options = {};\n    this.connection = void 0;\n    window.addEventListener('message', this.initPort.bind(this));\n    this.options = Object.assign({}, options);\n    this.api = api;\n  }\n\n  var _proto = PluginRemote.prototype;\n\n  _proto.initPort = /*#__PURE__*/function () {\n    var _initPort = /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee(event) {\n      return _regeneratorRuntime.wrap(function _callee$(_context) {\n        while (1) {\n          switch (_context.prev = _context.next) {\n            case 0:\n              _context.t0 = event.data.type;\n              _context.next = _context.t0 === 'init' ? 3 : 11;\n              break;\n\n            case 3:\n              this.port = event.ports[0];\n              this.connection = new Connection(this.port, _extends({}, this.options, {\n                pluginObject: application\n              }));\n              this.connection.setServiceMethods({\n                runCode: this.runCode\n              });\n              console.log(this.api);\n              this.connection.setLocalMethods(this.api);\n              _context.next = 10;\n              return this.connection.callServiceMethod('connected');\n\n            case 10:\n              return _context.abrupt(\"break\", 11);\n\n            case 11:\n            case \"end\":\n              return _context.stop();\n          }\n        }\n      }, _callee, this);\n    }));\n\n    function initPort(_x) {\n      return _initPort.apply(this, arguments);\n    }\n\n    return initPort;\n  }();\n\n  _proto.runCode = function runCode(code) {\n    var scriptTag = document.createElement('script');\n    scriptTag.innerHTML = code;\n    document.getElementsByTagName('body')[0].appendChild(scriptTag);\n  };\n\n  return PluginRemote;\n}();\nwindow.application = application;\n\nexport { PluginHost, PluginRemote };\n";
    this.resolveReady = void 0;
    this.connection = void 0;
    this.api = api;
    this.options = Object.assign(this.defaultOptions, options);
    this.remoteOrigin = '*';

    if ((_this$options$sandbox = this.options.sandboxAttributes) != null && _this$options$sandbox.includes('allow-same-origin') && (_this$options$frameSr = this.options.frameSrc) != null && _this$options$frameSr.origin) {
      var _this$options$frameSr2;

      this.remoteOrigin = (_this$options$frameSr2 = this.options.frameSrc) == null ? void 0 : _this$options$frameSr2.origin;
    }

    this.iframe = this.createIframe();
    this.readyPromise = new Promise(function (resolve) {
      _this.resolveReady = resolve;
    });
  }

  var _proto = PluginHost.prototype;

  _proto.ready = function ready() {
    return this.readyPromise;
  };

  _proto.executeCode = function executeCode(code) {
    var _this$connection;

    return (_this$connection = this.connection) == null ? void 0 : _this$connection.callServiceMethod('runCode', code);
  };

  _proto.destroy = function destroy() {
    var _this$connection2;

    this.iframe.remove();
    (_this$connection2 = this.connection) == null ? void 0 : _this$connection2.close();
  };

  _proto.createIframe = function createIframe() {
    var _this$options$sandbox2, _this$options$contain2;

    var iframe = document.createElement('iframe');
    iframe.frameBorder = '0';
    iframe.width = '0';
    iframe.height = '0';
    iframe.sandbox = (_this$options$sandbox2 = this.options.sandboxAttributes) == null ? void 0 : _this$options$sandbox2.join(' ');
    iframe.onload = this.iframeOnLoad.bind(this);

    if (this.options.frameSrc) {
      var _this$options$contain;

      iframe.src = this.options.frameSrc.href;
      (_this$options$contain = this.options.container) == null ? void 0 : _this$options$contain.append(iframe);
      return iframe;
    }

    var srcdoc = this.getSrcDoc();
    iframe.setAttribute('srcdoc', srcdoc);
    (_this$options$contain2 = this.options.container) == null ? void 0 : _this$options$contain2.append(iframe);
    return iframe;
  };

  _proto.getSrcDoc = function getSrcDoc() {
    // var exports = {}
    // is used to fix electron tests
    // script close tag must be seperated in
    // order to avoid parser error
    var srcdoc = "\n<!DOCTYPE html>\n<html>\n<head>\n  <meta charset=\"UTF-8\">\n  <script>var exports = {};</scr" + "ipt>\n  <script type=\"module\">\n    <INLINE>\n    const pluginRemote = new PluginRemote({});\n    window.pluginRemote = pluginRemote;\n  </scr" + "ipt>\n</head>\n<body></body>\n</html>\n  ";
    srcdoc = srcdoc.replace('<INLINE>', this.compiled);
    return srcdoc;
  };

  _proto.iframeOnLoad = function iframeOnLoad() {
    var _this$iframe$contentW;

    var channel = new MessageChannel();
    (_this$iframe$contentW = this.iframe.contentWindow) == null ? void 0 : _this$iframe$contentW.postMessage({
      type: 'init'
    }, this.remoteOrigin, [channel.port2]);
    this.connection = new Connection(channel.port1);
    this.connection.setServiceMethods({
      connected: this.connected.bind(this)
    });
  };

  _proto.connected = function connected() {
    var _this$connection3;

    (_this$connection3 = this.connection) == null ? void 0 : _this$connection3.setLocalMethods(this.api);
    this.resolveReady(undefined);
  };

  return PluginHost;
}();

var application = {};
var PluginRemote = /*#__PURE__*/function () {
  function PluginRemote(api, options) {
    this.port = void 0;
    this.api = void 0;
    this.options = {};
    this.connection = void 0;
    window.addEventListener('message', this.initPort.bind(this));
    this.options = Object.assign({}, options);
    this.api = api;
  }

  var _proto = PluginRemote.prototype;

  _proto.initPort = /*#__PURE__*/function () {
    var _initPort = /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/_regeneratorRuntime.mark(function _callee(event) {
      return _regeneratorRuntime.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              _context.t0 = event.data.type;
              _context.next = _context.t0 === 'init' ? 3 : 11;
              break;

            case 3:
              this.port = event.ports[0];
              this.connection = new Connection(this.port, _extends({}, this.options, {
                pluginObject: application
              }));
              this.connection.setServiceMethods({
                runCode: this.runCode
              });
              console.log(this.api);
              this.connection.setLocalMethods(this.api);
              _context.next = 10;
              return this.connection.callServiceMethod('connected');

            case 10:
              return _context.abrupt("break", 11);

            case 11:
            case "end":
              return _context.stop();
          }
        }
      }, _callee, this);
    }));

    function initPort(_x) {
      return _initPort.apply(this, arguments);
    }

    return initPort;
  }();

  _proto.runCode = function runCode(code) {
    var scriptTag = document.createElement('script');
    scriptTag.innerHTML = code;
    document.getElementsByTagName('body')[0].appendChild(scriptTag);
  };

  return PluginRemote;
}();
window.application = application;

export { PluginHost, PluginRemote };
//# sourceMappingURL=plugin-frame.esm.js.map
