(function () {
	'use strict';

	var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

	function createCommonjsModule(fn, module) {
		return module = { exports: {} }, fn(module, module.exports), module.exports;
	}

	var check = function (it) {
	  return it && it.Math == Math && it;
	};

	// https://github.com/zloirock/core-js/issues/86#issuecomment-115759028
	var global_1 =
	  // eslint-disable-next-line no-undef
	  check(typeof globalThis == 'object' && globalThis) ||
	  check(typeof window == 'object' && window) ||
	  check(typeof self == 'object' && self) ||
	  check(typeof commonjsGlobal == 'object' && commonjsGlobal) ||
	  // eslint-disable-next-line no-new-func
	  (function () { return this; })() || Function('return this')();

	var fails = function (exec) {
	  try {
	    return !!exec();
	  } catch (error) {
	    return true;
	  }
	};

	// Detect IE8's incomplete defineProperty implementation
	var descriptors = !fails(function () {
	  return Object.defineProperty({}, 1, { get: function () { return 7; } })[1] != 7;
	});

	var nativePropertyIsEnumerable = {}.propertyIsEnumerable;
	var getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;

	// Nashorn ~ JDK8 bug
	var NASHORN_BUG = getOwnPropertyDescriptor && !nativePropertyIsEnumerable.call({ 1: 2 }, 1);

	// `Object.prototype.propertyIsEnumerable` method implementation
	// https://tc39.es/ecma262/#sec-object.prototype.propertyisenumerable
	var f = NASHORN_BUG ? function propertyIsEnumerable(V) {
	  var descriptor = getOwnPropertyDescriptor(this, V);
	  return !!descriptor && descriptor.enumerable;
	} : nativePropertyIsEnumerable;

	var objectPropertyIsEnumerable = {
		f: f
	};

	var createPropertyDescriptor = function (bitmap, value) {
	  return {
	    enumerable: !(bitmap & 1),
	    configurable: !(bitmap & 2),
	    writable: !(bitmap & 4),
	    value: value
	  };
	};

	var toString = {}.toString;

	var classofRaw = function (it) {
	  return toString.call(it).slice(8, -1);
	};

	var split = ''.split;

	// fallback for non-array-like ES3 and non-enumerable old V8 strings
	var indexedObject = fails(function () {
	  // throws an error in rhino, see https://github.com/mozilla/rhino/issues/346
	  // eslint-disable-next-line no-prototype-builtins
	  return !Object('z').propertyIsEnumerable(0);
	}) ? function (it) {
	  return classofRaw(it) == 'String' ? split.call(it, '') : Object(it);
	} : Object;

	// `RequireObjectCoercible` abstract operation
	// https://tc39.es/ecma262/#sec-requireobjectcoercible
	var requireObjectCoercible = function (it) {
	  if (it == undefined) throw TypeError("Can't call method on " + it);
	  return it;
	};

	// toObject with fallback for non-array-like ES3 strings



	var toIndexedObject = function (it) {
	  return indexedObject(requireObjectCoercible(it));
	};

	var isObject = function (it) {
	  return typeof it === 'object' ? it !== null : typeof it === 'function';
	};

	// `ToPrimitive` abstract operation
	// https://tc39.es/ecma262/#sec-toprimitive
	// instead of the ES6 spec version, we didn't implement @@toPrimitive case
	// and the second argument - flag - preferred type is a string
	var toPrimitive = function (input, PREFERRED_STRING) {
	  if (!isObject(input)) return input;
	  var fn, val;
	  if (PREFERRED_STRING && typeof (fn = input.toString) == 'function' && !isObject(val = fn.call(input))) return val;
	  if (typeof (fn = input.valueOf) == 'function' && !isObject(val = fn.call(input))) return val;
	  if (!PREFERRED_STRING && typeof (fn = input.toString) == 'function' && !isObject(val = fn.call(input))) return val;
	  throw TypeError("Can't convert object to primitive value");
	};

	var hasOwnProperty = {}.hasOwnProperty;

	var has = function (it, key) {
	  return hasOwnProperty.call(it, key);
	};

	var document$1 = global_1.document;
	// typeof document.createElement is 'object' in old IE
	var EXISTS = isObject(document$1) && isObject(document$1.createElement);

	var documentCreateElement = function (it) {
	  return EXISTS ? document$1.createElement(it) : {};
	};

	// Thank's IE8 for his funny defineProperty
	var ie8DomDefine = !descriptors && !fails(function () {
	  return Object.defineProperty(documentCreateElement('div'), 'a', {
	    get: function () { return 7; }
	  }).a != 7;
	});

	var nativeGetOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;

	// `Object.getOwnPropertyDescriptor` method
	// https://tc39.es/ecma262/#sec-object.getownpropertydescriptor
	var f$1 = descriptors ? nativeGetOwnPropertyDescriptor : function getOwnPropertyDescriptor(O, P) {
	  O = toIndexedObject(O);
	  P = toPrimitive(P, true);
	  if (ie8DomDefine) try {
	    return nativeGetOwnPropertyDescriptor(O, P);
	  } catch (error) { /* empty */ }
	  if (has(O, P)) return createPropertyDescriptor(!objectPropertyIsEnumerable.f.call(O, P), O[P]);
	};

	var objectGetOwnPropertyDescriptor = {
		f: f$1
	};

	var anObject = function (it) {
	  if (!isObject(it)) {
	    throw TypeError(String(it) + ' is not an object');
	  } return it;
	};

	var nativeDefineProperty = Object.defineProperty;

	// `Object.defineProperty` method
	// https://tc39.es/ecma262/#sec-object.defineproperty
	var f$2 = descriptors ? nativeDefineProperty : function defineProperty(O, P, Attributes) {
	  anObject(O);
	  P = toPrimitive(P, true);
	  anObject(Attributes);
	  if (ie8DomDefine) try {
	    return nativeDefineProperty(O, P, Attributes);
	  } catch (error) { /* empty */ }
	  if ('get' in Attributes || 'set' in Attributes) throw TypeError('Accessors not supported');
	  if ('value' in Attributes) O[P] = Attributes.value;
	  return O;
	};

	var objectDefineProperty = {
		f: f$2
	};

	var createNonEnumerableProperty = descriptors ? function (object, key, value) {
	  return objectDefineProperty.f(object, key, createPropertyDescriptor(1, value));
	} : function (object, key, value) {
	  object[key] = value;
	  return object;
	};

	var setGlobal = function (key, value) {
	  try {
	    createNonEnumerableProperty(global_1, key, value);
	  } catch (error) {
	    global_1[key] = value;
	  } return value;
	};

	var SHARED = '__core-js_shared__';
	var store = global_1[SHARED] || setGlobal(SHARED, {});

	var sharedStore = store;

	var functionToString = Function.toString;

	// this helper broken in `3.4.1-3.4.4`, so we can't use `shared` helper
	if (typeof sharedStore.inspectSource != 'function') {
	  sharedStore.inspectSource = function (it) {
	    return functionToString.call(it);
	  };
	}

	var inspectSource = sharedStore.inspectSource;

	var WeakMap = global_1.WeakMap;

	var nativeWeakMap = typeof WeakMap === 'function' && /native code/.test(inspectSource(WeakMap));

	var shared = createCommonjsModule(function (module) {
	(module.exports = function (key, value) {
	  return sharedStore[key] || (sharedStore[key] = value !== undefined ? value : {});
	})('versions', []).push({
	  version: '3.8.2',
	  mode:  'global',
	  copyright: '© 2021 Denis Pushkarev (zloirock.ru)'
	});
	});

	var id = 0;
	var postfix = Math.random();

	var uid = function (key) {
	  return 'Symbol(' + String(key === undefined ? '' : key) + ')_' + (++id + postfix).toString(36);
	};

	var keys = shared('keys');

	var sharedKey = function (key) {
	  return keys[key] || (keys[key] = uid(key));
	};

	var hiddenKeys = {};

	var WeakMap$1 = global_1.WeakMap;
	var set, get, has$1;

	var enforce = function (it) {
	  return has$1(it) ? get(it) : set(it, {});
	};

	var getterFor = function (TYPE) {
	  return function (it) {
	    var state;
	    if (!isObject(it) || (state = get(it)).type !== TYPE) {
	      throw TypeError('Incompatible receiver, ' + TYPE + ' required');
	    } return state;
	  };
	};

	if (nativeWeakMap) {
	  var store$1 = sharedStore.state || (sharedStore.state = new WeakMap$1());
	  var wmget = store$1.get;
	  var wmhas = store$1.has;
	  var wmset = store$1.set;
	  set = function (it, metadata) {
	    metadata.facade = it;
	    wmset.call(store$1, it, metadata);
	    return metadata;
	  };
	  get = function (it) {
	    return wmget.call(store$1, it) || {};
	  };
	  has$1 = function (it) {
	    return wmhas.call(store$1, it);
	  };
	} else {
	  var STATE = sharedKey('state');
	  hiddenKeys[STATE] = true;
	  set = function (it, metadata) {
	    metadata.facade = it;
	    createNonEnumerableProperty(it, STATE, metadata);
	    return metadata;
	  };
	  get = function (it) {
	    return has(it, STATE) ? it[STATE] : {};
	  };
	  has$1 = function (it) {
	    return has(it, STATE);
	  };
	}

	var internalState = {
	  set: set,
	  get: get,
	  has: has$1,
	  enforce: enforce,
	  getterFor: getterFor
	};

	var redefine = createCommonjsModule(function (module) {
	var getInternalState = internalState.get;
	var enforceInternalState = internalState.enforce;
	var TEMPLATE = String(String).split('String');

	(module.exports = function (O, key, value, options) {
	  var unsafe = options ? !!options.unsafe : false;
	  var simple = options ? !!options.enumerable : false;
	  var noTargetGet = options ? !!options.noTargetGet : false;
	  var state;
	  if (typeof value == 'function') {
	    if (typeof key == 'string' && !has(value, 'name')) {
	      createNonEnumerableProperty(value, 'name', key);
	    }
	    state = enforceInternalState(value);
	    if (!state.source) {
	      state.source = TEMPLATE.join(typeof key == 'string' ? key : '');
	    }
	  }
	  if (O === global_1) {
	    if (simple) O[key] = value;
	    else setGlobal(key, value);
	    return;
	  } else if (!unsafe) {
	    delete O[key];
	  } else if (!noTargetGet && O[key]) {
	    simple = true;
	  }
	  if (simple) O[key] = value;
	  else createNonEnumerableProperty(O, key, value);
	// add fake Function#toString for correct work wrapped methods / constructors with methods like LoDash isNative
	})(Function.prototype, 'toString', function toString() {
	  return typeof this == 'function' && getInternalState(this).source || inspectSource(this);
	});
	});

	var path = global_1;

	var aFunction = function (variable) {
	  return typeof variable == 'function' ? variable : undefined;
	};

	var getBuiltIn = function (namespace, method) {
	  return arguments.length < 2 ? aFunction(path[namespace]) || aFunction(global_1[namespace])
	    : path[namespace] && path[namespace][method] || global_1[namespace] && global_1[namespace][method];
	};

	var ceil = Math.ceil;
	var floor = Math.floor;

	// `ToInteger` abstract operation
	// https://tc39.es/ecma262/#sec-tointeger
	var toInteger = function (argument) {
	  return isNaN(argument = +argument) ? 0 : (argument > 0 ? floor : ceil)(argument);
	};

	var min = Math.min;

	// `ToLength` abstract operation
	// https://tc39.es/ecma262/#sec-tolength
	var toLength = function (argument) {
	  return argument > 0 ? min(toInteger(argument), 0x1FFFFFFFFFFFFF) : 0; // 2 ** 53 - 1 == 9007199254740991
	};

	var max = Math.max;
	var min$1 = Math.min;

	// Helper for a popular repeating case of the spec:
	// Let integer be ? ToInteger(index).
	// If integer < 0, let result be max((length + integer), 0); else let result be min(integer, length).
	var toAbsoluteIndex = function (index, length) {
	  var integer = toInteger(index);
	  return integer < 0 ? max(integer + length, 0) : min$1(integer, length);
	};

	// `Array.prototype.{ indexOf, includes }` methods implementation
	var createMethod = function (IS_INCLUDES) {
	  return function ($this, el, fromIndex) {
	    var O = toIndexedObject($this);
	    var length = toLength(O.length);
	    var index = toAbsoluteIndex(fromIndex, length);
	    var value;
	    // Array#includes uses SameValueZero equality algorithm
	    // eslint-disable-next-line no-self-compare
	    if (IS_INCLUDES && el != el) while (length > index) {
	      value = O[index++];
	      // eslint-disable-next-line no-self-compare
	      if (value != value) return true;
	    // Array#indexOf ignores holes, Array#includes - not
	    } else for (;length > index; index++) {
	      if ((IS_INCLUDES || index in O) && O[index] === el) return IS_INCLUDES || index || 0;
	    } return !IS_INCLUDES && -1;
	  };
	};

	var arrayIncludes = {
	  // `Array.prototype.includes` method
	  // https://tc39.es/ecma262/#sec-array.prototype.includes
	  includes: createMethod(true),
	  // `Array.prototype.indexOf` method
	  // https://tc39.es/ecma262/#sec-array.prototype.indexof
	  indexOf: createMethod(false)
	};

	var indexOf = arrayIncludes.indexOf;


	var objectKeysInternal = function (object, names) {
	  var O = toIndexedObject(object);
	  var i = 0;
	  var result = [];
	  var key;
	  for (key in O) !has(hiddenKeys, key) && has(O, key) && result.push(key);
	  // Don't enum bug & hidden keys
	  while (names.length > i) if (has(O, key = names[i++])) {
	    ~indexOf(result, key) || result.push(key);
	  }
	  return result;
	};

	// IE8- don't enum bug keys
	var enumBugKeys = [
	  'constructor',
	  'hasOwnProperty',
	  'isPrototypeOf',
	  'propertyIsEnumerable',
	  'toLocaleString',
	  'toString',
	  'valueOf'
	];

	var hiddenKeys$1 = enumBugKeys.concat('length', 'prototype');

	// `Object.getOwnPropertyNames` method
	// https://tc39.es/ecma262/#sec-object.getownpropertynames
	var f$3 = Object.getOwnPropertyNames || function getOwnPropertyNames(O) {
	  return objectKeysInternal(O, hiddenKeys$1);
	};

	var objectGetOwnPropertyNames = {
		f: f$3
	};

	var f$4 = Object.getOwnPropertySymbols;

	var objectGetOwnPropertySymbols = {
		f: f$4
	};

	// all object keys, includes non-enumerable and symbols
	var ownKeys = getBuiltIn('Reflect', 'ownKeys') || function ownKeys(it) {
	  var keys = objectGetOwnPropertyNames.f(anObject(it));
	  var getOwnPropertySymbols = objectGetOwnPropertySymbols.f;
	  return getOwnPropertySymbols ? keys.concat(getOwnPropertySymbols(it)) : keys;
	};

	var copyConstructorProperties = function (target, source) {
	  var keys = ownKeys(source);
	  var defineProperty = objectDefineProperty.f;
	  var getOwnPropertyDescriptor = objectGetOwnPropertyDescriptor.f;
	  for (var i = 0; i < keys.length; i++) {
	    var key = keys[i];
	    if (!has(target, key)) defineProperty(target, key, getOwnPropertyDescriptor(source, key));
	  }
	};

	var replacement = /#|\.prototype\./;

	var isForced = function (feature, detection) {
	  var value = data[normalize(feature)];
	  return value == POLYFILL ? true
	    : value == NATIVE ? false
	    : typeof detection == 'function' ? fails(detection)
	    : !!detection;
	};

	var normalize = isForced.normalize = function (string) {
	  return String(string).replace(replacement, '.').toLowerCase();
	};

	var data = isForced.data = {};
	var NATIVE = isForced.NATIVE = 'N';
	var POLYFILL = isForced.POLYFILL = 'P';

	var isForced_1 = isForced;

	var getOwnPropertyDescriptor$1 = objectGetOwnPropertyDescriptor.f;






	/*
	  options.target      - name of the target object
	  options.global      - target is the global object
	  options.stat        - export as static methods of target
	  options.proto       - export as prototype methods of target
	  options.real        - real prototype method for the `pure` version
	  options.forced      - export even if the native feature is available
	  options.bind        - bind methods to the target, required for the `pure` version
	  options.wrap        - wrap constructors to preventing global pollution, required for the `pure` version
	  options.unsafe      - use the simple assignment of property instead of delete + defineProperty
	  options.sham        - add a flag to not completely full polyfills
	  options.enumerable  - export as enumerable property
	  options.noTargetGet - prevent calling a getter on target
	*/
	var _export = function (options, source) {
	  var TARGET = options.target;
	  var GLOBAL = options.global;
	  var STATIC = options.stat;
	  var FORCED, target, key, targetProperty, sourceProperty, descriptor;
	  if (GLOBAL) {
	    target = global_1;
	  } else if (STATIC) {
	    target = global_1[TARGET] || setGlobal(TARGET, {});
	  } else {
	    target = (global_1[TARGET] || {}).prototype;
	  }
	  if (target) for (key in source) {
	    sourceProperty = source[key];
	    if (options.noTargetGet) {
	      descriptor = getOwnPropertyDescriptor$1(target, key);
	      targetProperty = descriptor && descriptor.value;
	    } else targetProperty = target[key];
	    FORCED = isForced_1(GLOBAL ? key : TARGET + (STATIC ? '.' : '#') + key, options.forced);
	    // contained in target
	    if (!FORCED && targetProperty !== undefined) {
	      if (typeof sourceProperty === typeof targetProperty) continue;
	      copyConstructorProperties(sourceProperty, targetProperty);
	    }
	    // add a flag to not completely full polyfills
	    if (options.sham || (targetProperty && targetProperty.sham)) {
	      createNonEnumerableProperty(sourceProperty, 'sham', true);
	    }
	    // extend global
	    redefine(target, key, sourceProperty, options);
	  }
	};

	var aFunction$1 = function (it) {
	  if (typeof it != 'function') {
	    throw TypeError(String(it) + ' is not a function');
	  } return it;
	};

	// optional / simple context binding
	var functionBindContext = function (fn, that, length) {
	  aFunction$1(fn);
	  if (that === undefined) return fn;
	  switch (length) {
	    case 0: return function () {
	      return fn.call(that);
	    };
	    case 1: return function (a) {
	      return fn.call(that, a);
	    };
	    case 2: return function (a, b) {
	      return fn.call(that, a, b);
	    };
	    case 3: return function (a, b, c) {
	      return fn.call(that, a, b, c);
	    };
	  }
	  return function (/* ...args */) {
	    return fn.apply(that, arguments);
	  };
	};

	// `ToObject` abstract operation
	// https://tc39.es/ecma262/#sec-toobject
	var toObject = function (argument) {
	  return Object(requireObjectCoercible(argument));
	};

	// `IsArray` abstract operation
	// https://tc39.es/ecma262/#sec-isarray
	var isArray = Array.isArray || function isArray(arg) {
	  return classofRaw(arg) == 'Array';
	};

	var nativeSymbol = !!Object.getOwnPropertySymbols && !fails(function () {
	  // Chrome 38 Symbol has incorrect toString conversion
	  // eslint-disable-next-line no-undef
	  return !String(Symbol());
	});

	var useSymbolAsUid = nativeSymbol
	  // eslint-disable-next-line no-undef
	  && !Symbol.sham
	  // eslint-disable-next-line no-undef
	  && typeof Symbol.iterator == 'symbol';

	var WellKnownSymbolsStore = shared('wks');
	var Symbol$1 = global_1.Symbol;
	var createWellKnownSymbol = useSymbolAsUid ? Symbol$1 : Symbol$1 && Symbol$1.withoutSetter || uid;

	var wellKnownSymbol = function (name) {
	  if (!has(WellKnownSymbolsStore, name)) {
	    if (nativeSymbol && has(Symbol$1, name)) WellKnownSymbolsStore[name] = Symbol$1[name];
	    else WellKnownSymbolsStore[name] = createWellKnownSymbol('Symbol.' + name);
	  } return WellKnownSymbolsStore[name];
	};

	var SPECIES = wellKnownSymbol('species');

	// `ArraySpeciesCreate` abstract operation
	// https://tc39.es/ecma262/#sec-arrayspeciescreate
	var arraySpeciesCreate = function (originalArray, length) {
	  var C;
	  if (isArray(originalArray)) {
	    C = originalArray.constructor;
	    // cross-realm fallback
	    if (typeof C == 'function' && (C === Array || isArray(C.prototype))) C = undefined;
	    else if (isObject(C)) {
	      C = C[SPECIES];
	      if (C === null) C = undefined;
	    }
	  } return new (C === undefined ? Array : C)(length === 0 ? 0 : length);
	};

	var push = [].push;

	// `Array.prototype.{ forEach, map, filter, some, every, find, findIndex, filterOut }` methods implementation
	var createMethod$1 = function (TYPE) {
	  var IS_MAP = TYPE == 1;
	  var IS_FILTER = TYPE == 2;
	  var IS_SOME = TYPE == 3;
	  var IS_EVERY = TYPE == 4;
	  var IS_FIND_INDEX = TYPE == 6;
	  var IS_FILTER_OUT = TYPE == 7;
	  var NO_HOLES = TYPE == 5 || IS_FIND_INDEX;
	  return function ($this, callbackfn, that, specificCreate) {
	    var O = toObject($this);
	    var self = indexedObject(O);
	    var boundFunction = functionBindContext(callbackfn, that, 3);
	    var length = toLength(self.length);
	    var index = 0;
	    var create = specificCreate || arraySpeciesCreate;
	    var target = IS_MAP ? create($this, length) : IS_FILTER || IS_FILTER_OUT ? create($this, 0) : undefined;
	    var value, result;
	    for (;length > index; index++) if (NO_HOLES || index in self) {
	      value = self[index];
	      result = boundFunction(value, index, O);
	      if (TYPE) {
	        if (IS_MAP) target[index] = result; // map
	        else if (result) switch (TYPE) {
	          case 3: return true;              // some
	          case 5: return value;             // find
	          case 6: return index;             // findIndex
	          case 2: push.call(target, value); // filter
	        } else switch (TYPE) {
	          case 4: return false;             // every
	          case 7: push.call(target, value); // filterOut
	        }
	      }
	    }
	    return IS_FIND_INDEX ? -1 : IS_SOME || IS_EVERY ? IS_EVERY : target;
	  };
	};

	var arrayIteration = {
	  // `Array.prototype.forEach` method
	  // https://tc39.es/ecma262/#sec-array.prototype.foreach
	  forEach: createMethod$1(0),
	  // `Array.prototype.map` method
	  // https://tc39.es/ecma262/#sec-array.prototype.map
	  map: createMethod$1(1),
	  // `Array.prototype.filter` method
	  // https://tc39.es/ecma262/#sec-array.prototype.filter
	  filter: createMethod$1(2),
	  // `Array.prototype.some` method
	  // https://tc39.es/ecma262/#sec-array.prototype.some
	  some: createMethod$1(3),
	  // `Array.prototype.every` method
	  // https://tc39.es/ecma262/#sec-array.prototype.every
	  every: createMethod$1(4),
	  // `Array.prototype.find` method
	  // https://tc39.es/ecma262/#sec-array.prototype.find
	  find: createMethod$1(5),
	  // `Array.prototype.findIndex` method
	  // https://tc39.es/ecma262/#sec-array.prototype.findIndex
	  findIndex: createMethod$1(6),
	  // `Array.prototype.filterOut` method
	  // https://github.com/tc39/proposal-array-filtering
	  filterOut: createMethod$1(7)
	};

	var arrayMethodIsStrict = function (METHOD_NAME, argument) {
	  var method = [][METHOD_NAME];
	  return !!method && fails(function () {
	    // eslint-disable-next-line no-useless-call,no-throw-literal
	    method.call(null, argument || function () { throw 1; }, 1);
	  });
	};

	var defineProperty = Object.defineProperty;
	var cache = {};

	var thrower = function (it) { throw it; };

	var arrayMethodUsesToLength = function (METHOD_NAME, options) {
	  if (has(cache, METHOD_NAME)) return cache[METHOD_NAME];
	  if (!options) options = {};
	  var method = [][METHOD_NAME];
	  var ACCESSORS = has(options, 'ACCESSORS') ? options.ACCESSORS : false;
	  var argument0 = has(options, 0) ? options[0] : thrower;
	  var argument1 = has(options, 1) ? options[1] : undefined;

	  return cache[METHOD_NAME] = !!method && !fails(function () {
	    if (ACCESSORS && !descriptors) return true;
	    var O = { length: -1 };

	    if (ACCESSORS) defineProperty(O, 1, { enumerable: true, get: thrower });
	    else O[1] = 1;

	    method.call(O, argument0, argument1);
	  });
	};

	var $forEach = arrayIteration.forEach;



	var STRICT_METHOD = arrayMethodIsStrict('forEach');
	var USES_TO_LENGTH = arrayMethodUsesToLength('forEach');

	// `Array.prototype.forEach` method implementation
	// https://tc39.es/ecma262/#sec-array.prototype.foreach
	var arrayForEach = (!STRICT_METHOD || !USES_TO_LENGTH) ? function forEach(callbackfn /* , thisArg */) {
	  return $forEach(this, callbackfn, arguments.length > 1 ? arguments[1] : undefined);
	} : [].forEach;

	// `Array.prototype.forEach` method
	// https://tc39.es/ecma262/#sec-array.prototype.foreach
	_export({ target: 'Array', proto: true, forced: [].forEach != arrayForEach }, {
	  forEach: arrayForEach
	});

	// iterable DOM collections
	// flag - `iterable` interface - 'entries', 'keys', 'values', 'forEach' methods
	var domIterables = {
	  CSSRuleList: 0,
	  CSSStyleDeclaration: 0,
	  CSSValueList: 0,
	  ClientRectList: 0,
	  DOMRectList: 0,
	  DOMStringList: 0,
	  DOMTokenList: 1,
	  DataTransferItemList: 0,
	  FileList: 0,
	  HTMLAllCollection: 0,
	  HTMLCollection: 0,
	  HTMLFormElement: 0,
	  HTMLSelectElement: 0,
	  MediaList: 0,
	  MimeTypeArray: 0,
	  NamedNodeMap: 0,
	  NodeList: 1,
	  PaintRequestList: 0,
	  Plugin: 0,
	  PluginArray: 0,
	  SVGLengthList: 0,
	  SVGNumberList: 0,
	  SVGPathSegList: 0,
	  SVGPointList: 0,
	  SVGStringList: 0,
	  SVGTransformList: 0,
	  SourceBufferList: 0,
	  StyleSheetList: 0,
	  TextTrackCueList: 0,
	  TextTrackList: 0,
	  TouchList: 0
	};

	for (var COLLECTION_NAME in domIterables) {
	  var Collection = global_1[COLLECTION_NAME];
	  var CollectionPrototype = Collection && Collection.prototype;
	  // some Chrome versions have non-configurable methods on DOMTokenList
	  if (CollectionPrototype && CollectionPrototype.forEach !== arrayForEach) try {
	    createNonEnumerableProperty(CollectionPrototype, 'forEach', arrayForEach);
	  } catch (error) {
	    CollectionPrototype.forEach = arrayForEach;
	  }
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

	/*! npm.im/object-fit-images 3.2.4 */

	var OFI = 'bfred-it:object-fit-images';
	var propRegex = /(object-fit|object-position)\s*:\s*([-.\w\s%]+)/g;
	var testImg = typeof Image === 'undefined' ? {style: {'object-position': 1}} : new Image();
	var supportsObjectFit = 'object-fit' in testImg.style;
	var supportsObjectPosition = 'object-position' in testImg.style;
	var supportsOFI = 'background-size' in testImg.style;
	var supportsCurrentSrc = typeof testImg.currentSrc === 'string';
	var nativeGetAttribute = testImg.getAttribute;
	var nativeSetAttribute = testImg.setAttribute;
	var autoModeEnabled = false;

	function createPlaceholder(w, h) {
		return ("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='" + w + "' height='" + h + "'%3E%3C/svg%3E");
	}

	function polyfillCurrentSrc(el) {
		if (el.srcset && !supportsCurrentSrc && window.picturefill) {
			var pf = window.picturefill._;
			// parse srcset with picturefill where currentSrc isn't available
			if (!el[pf.ns] || !el[pf.ns].evaled) {
				// force synchronous srcset parsing
				pf.fillImg(el, {reselect: true});
			}

			if (!el[pf.ns].curSrc) {
				// force picturefill to parse srcset
				el[pf.ns].supported = false;
				pf.fillImg(el, {reselect: true});
			}

			// retrieve parsed currentSrc, if any
			el.currentSrc = el[pf.ns].curSrc || el.src;
		}
	}

	function getStyle(el) {
		var style = getComputedStyle(el).fontFamily;
		var parsed;
		var props = {};
		while ((parsed = propRegex.exec(style)) !== null) {
			props[parsed[1]] = parsed[2];
		}
		return props;
	}

	function setPlaceholder(img, width, height) {
		// Default: fill width, no height
		var placeholder = createPlaceholder(width || 1, height || 0);

		// Only set placeholder if it's different
		if (nativeGetAttribute.call(img, 'src') !== placeholder) {
			nativeSetAttribute.call(img, 'src', placeholder);
		}
	}

	function onImageReady(img, callback) {
		// naturalWidth is only available when the image headers are loaded,
		// this loop will poll it every 100ms.
		if (img.naturalWidth) {
			callback(img);
		} else {
			setTimeout(onImageReady, 100, img, callback);
		}
	}

	function fixOne(el) {
		var style = getStyle(el);
		var ofi = el[OFI];
		style['object-fit'] = style['object-fit'] || 'fill'; // default value

		// Avoid running where unnecessary, unless OFI had already done its deed
		if (!ofi.img) {
			// fill is the default behavior so no action is necessary
			if (style['object-fit'] === 'fill') {
				return;
			}

			// Where object-fit is supported and object-position isn't (Safari < 10)
			if (
				!ofi.skipTest && // unless user wants to apply regardless of browser support
				supportsObjectFit && // if browser already supports object-fit
				!style['object-position'] // unless object-position is used
			) {
				return;
			}
		}

		// keep a clone in memory while resetting the original to a blank
		if (!ofi.img) {
			ofi.img = new Image(el.width, el.height);
			ofi.img.srcset = nativeGetAttribute.call(el, "data-ofi-srcset") || el.srcset;
			ofi.img.src = nativeGetAttribute.call(el, "data-ofi-src") || el.src;

			// preserve for any future cloneNode calls
			// https://github.com/bfred-it/object-fit-images/issues/53
			nativeSetAttribute.call(el, "data-ofi-src", el.src);
			if (el.srcset) {
				nativeSetAttribute.call(el, "data-ofi-srcset", el.srcset);
			}

			setPlaceholder(el, el.naturalWidth || el.width, el.naturalHeight || el.height);

			// remove srcset because it overrides src
			if (el.srcset) {
				el.srcset = '';
			}
			try {
				keepSrcUsable(el);
			} catch (err) {
				if (window.console) {
					console.warn('https://bit.ly/ofi-old-browser');
				}
			}
		}

		polyfillCurrentSrc(ofi.img);

		el.style.backgroundImage = "url(\"" + ((ofi.img.currentSrc || ofi.img.src).replace(/"/g, '\\"')) + "\")";
		el.style.backgroundPosition = style['object-position'] || 'center';
		el.style.backgroundRepeat = 'no-repeat';
		el.style.backgroundOrigin = 'content-box';

		if (/scale-down/.test(style['object-fit'])) {
			onImageReady(ofi.img, function () {
				if (ofi.img.naturalWidth > el.width || ofi.img.naturalHeight > el.height) {
					el.style.backgroundSize = 'contain';
				} else {
					el.style.backgroundSize = 'auto';
				}
			});
		} else {
			el.style.backgroundSize = style['object-fit'].replace('none', 'auto').replace('fill', '100% 100%');
		}

		onImageReady(ofi.img, function (img) {
			setPlaceholder(el, img.naturalWidth, img.naturalHeight);
		});
	}

	function keepSrcUsable(el) {
		var descriptors = {
			get: function get(prop) {
				return el[OFI].img[prop ? prop : 'src'];
			},
			set: function set(value, prop) {
				el[OFI].img[prop ? prop : 'src'] = value;
				nativeSetAttribute.call(el, ("data-ofi-" + prop), value); // preserve for any future cloneNode
				fixOne(el);
				return value;
			}
		};
		Object.defineProperty(el, 'src', descriptors);
		Object.defineProperty(el, 'currentSrc', {
			get: function () { return descriptors.get('currentSrc'); }
		});
		Object.defineProperty(el, 'srcset', {
			get: function () { return descriptors.get('srcset'); },
			set: function (ss) { return descriptors.set(ss, 'srcset'); }
		});
	}

	function hijackAttributes() {
		function getOfiImageMaybe(el, name) {
			return el[OFI] && el[OFI].img && (name === 'src' || name === 'srcset') ? el[OFI].img : el;
		}
		if (!supportsObjectPosition) {
			HTMLImageElement.prototype.getAttribute = function (name) {
				return nativeGetAttribute.call(getOfiImageMaybe(this, name), name);
			};

			HTMLImageElement.prototype.setAttribute = function (name, value) {
				return nativeSetAttribute.call(getOfiImageMaybe(this, name), name, String(value));
			};
		}
	}

	function fix(imgs, opts) {
		var startAutoMode = !autoModeEnabled && !imgs;
		opts = opts || {};
		imgs = imgs || 'img';

		if ((supportsObjectPosition && !opts.skipTest) || !supportsOFI) {
			return false;
		}

		// use imgs as a selector or just select all images
		if (imgs === 'img') {
			imgs = document.getElementsByTagName('img');
		} else if (typeof imgs === 'string') {
			imgs = document.querySelectorAll(imgs);
		} else if (!('length' in imgs)) {
			imgs = [imgs];
		}

		// apply fix to all
		for (var i = 0; i < imgs.length; i++) {
			imgs[i][OFI] = imgs[i][OFI] || {
				skipTest: opts.skipTest
			};
			fixOne(imgs[i]);
		}

		if (startAutoMode) {
			document.body.addEventListener('load', function (e) {
				if (e.target.tagName === 'IMG') {
					fix(e.target, {
						skipTest: opts.skipTest
					});
				}
			}, true);
			autoModeEnabled = true;
			imgs = 'img'; // reset to a generic selector for watchMQ
		}

		// if requested, watch media queries for object-fit change
		if (opts.watchMQ) {
			window.addEventListener('resize', fix.bind(null, imgs, {
				skipTest: opts.skipTest
			}));
		}
	}

	fix.supportsObjectFit = supportsObjectFit;
	fix.supportsObjectPosition = supportsObjectPosition;

	hijackAttributes();

	var ofi_commonJs = fix;

	var evEmitter = createCommonjsModule(function (module) {
	/**
	 * EvEmitter v1.1.0
	 * Lil' event emitter
	 * MIT License
	 */

	/* jshint unused: true, undef: true, strict: true */

	( function( global, factory ) {
	  // universal module definition
	  /* jshint strict: false */ /* globals define, module, window */
	  if (  module.exports ) {
	    // CommonJS - Browserify, Webpack
	    module.exports = factory();
	  } else {
	    // Browser globals
	    global.EvEmitter = factory();
	  }

	}( typeof window != 'undefined' ? window : commonjsGlobal, function() {

	function EvEmitter() {}

	var proto = EvEmitter.prototype;

	proto.on = function( eventName, listener ) {
	  if ( !eventName || !listener ) {
	    return;
	  }
	  // set events hash
	  var events = this._events = this._events || {};
	  // set listeners array
	  var listeners = events[ eventName ] = events[ eventName ] || [];
	  // only add once
	  if ( listeners.indexOf( listener ) == -1 ) {
	    listeners.push( listener );
	  }

	  return this;
	};

	proto.once = function( eventName, listener ) {
	  if ( !eventName || !listener ) {
	    return;
	  }
	  // add event
	  this.on( eventName, listener );
	  // set once flag
	  // set onceEvents hash
	  var onceEvents = this._onceEvents = this._onceEvents || {};
	  // set onceListeners object
	  var onceListeners = onceEvents[ eventName ] = onceEvents[ eventName ] || {};
	  // set flag
	  onceListeners[ listener ] = true;

	  return this;
	};

	proto.off = function( eventName, listener ) {
	  var listeners = this._events && this._events[ eventName ];
	  if ( !listeners || !listeners.length ) {
	    return;
	  }
	  var index = listeners.indexOf( listener );
	  if ( index != -1 ) {
	    listeners.splice( index, 1 );
	  }

	  return this;
	};

	proto.emitEvent = function( eventName, args ) {
	  var listeners = this._events && this._events[ eventName ];
	  if ( !listeners || !listeners.length ) {
	    return;
	  }
	  // copy over to avoid interference if .off() in listener
	  listeners = listeners.slice(0);
	  args = args || [];
	  // once stuff
	  var onceListeners = this._onceEvents && this._onceEvents[ eventName ];

	  for ( var i=0; i < listeners.length; i++ ) {
	    var listener = listeners[i];
	    var isOnce = onceListeners && onceListeners[ listener ];
	    if ( isOnce ) {
	      // remove listener
	      // remove before trigger to prevent recursion
	      this.off( eventName, listener );
	      // unset once flag
	      delete onceListeners[ listener ];
	    }
	    // trigger listener
	    listener.apply( this, args );
	  }

	  return this;
	};

	proto.allOff = function() {
	  delete this._events;
	  delete this._onceEvents;
	};

	return EvEmitter;

	}));
	});

	var getSize = createCommonjsModule(function (module) {
	/*!
	 * getSize v2.0.3
	 * measure size of elements
	 * MIT license
	 */

	/* jshint browser: true, strict: true, undef: true, unused: true */
	/* globals console: false */

	( function( window, factory ) {
	  /* jshint strict: false */ /* globals define, module */
	  if (  module.exports ) {
	    // CommonJS
	    module.exports = factory();
	  } else {
	    // browser global
	    window.getSize = factory();
	  }

	})( window, function factory() {

	// -------------------------- helpers -------------------------- //

	// get a number from a string, not a percentage
	function getStyleSize( value ) {
	  var num = parseFloat( value );
	  // not a percent like '100%', and a number
	  var isValid = value.indexOf('%') == -1 && !isNaN( num );
	  return isValid && num;
	}

	function noop() {}

	var logError = typeof console == 'undefined' ? noop :
	  function( message ) {
	    console.error( message );
	  };

	// -------------------------- measurements -------------------------- //

	var measurements = [
	  'paddingLeft',
	  'paddingRight',
	  'paddingTop',
	  'paddingBottom',
	  'marginLeft',
	  'marginRight',
	  'marginTop',
	  'marginBottom',
	  'borderLeftWidth',
	  'borderRightWidth',
	  'borderTopWidth',
	  'borderBottomWidth'
	];

	var measurementsLength = measurements.length;

	function getZeroSize() {
	  var size = {
	    width: 0,
	    height: 0,
	    innerWidth: 0,
	    innerHeight: 0,
	    outerWidth: 0,
	    outerHeight: 0
	  };
	  for ( var i=0; i < measurementsLength; i++ ) {
	    var measurement = measurements[i];
	    size[ measurement ] = 0;
	  }
	  return size;
	}

	// -------------------------- getStyle -------------------------- //

	/**
	 * getStyle, get style of element, check for Firefox bug
	 * https://bugzilla.mozilla.org/show_bug.cgi?id=548397
	 */
	function getStyle( elem ) {
	  var style = getComputedStyle( elem );
	  if ( !style ) {
	    logError( 'Style returned ' + style +
	      '. Are you running this code in a hidden iframe on Firefox? ' +
	      'See https://bit.ly/getsizebug1' );
	  }
	  return style;
	}

	// -------------------------- setup -------------------------- //

	var isSetup = false;

	var isBoxSizeOuter;

	/**
	 * setup
	 * check isBoxSizerOuter
	 * do on first getSize() rather than on page load for Firefox bug
	 */
	function setup() {
	  // setup once
	  if ( isSetup ) {
	    return;
	  }
	  isSetup = true;

	  // -------------------------- box sizing -------------------------- //

	  /**
	   * Chrome & Safari measure the outer-width on style.width on border-box elems
	   * IE11 & Firefox<29 measures the inner-width
	   */
	  var div = document.createElement('div');
	  div.style.width = '200px';
	  div.style.padding = '1px 2px 3px 4px';
	  div.style.borderStyle = 'solid';
	  div.style.borderWidth = '1px 2px 3px 4px';
	  div.style.boxSizing = 'border-box';

	  var body = document.body || document.documentElement;
	  body.appendChild( div );
	  var style = getStyle( div );
	  // round value for browser zoom. desandro/masonry#928
	  isBoxSizeOuter = Math.round( getStyleSize( style.width ) ) == 200;
	  getSize.isBoxSizeOuter = isBoxSizeOuter;

	  body.removeChild( div );
	}

	// -------------------------- getSize -------------------------- //

	function getSize( elem ) {
	  setup();

	  // use querySeletor if elem is string
	  if ( typeof elem == 'string' ) {
	    elem = document.querySelector( elem );
	  }

	  // do not proceed on non-objects
	  if ( !elem || typeof elem != 'object' || !elem.nodeType ) {
	    return;
	  }

	  var style = getStyle( elem );

	  // if hidden, everything is 0
	  if ( style.display == 'none' ) {
	    return getZeroSize();
	  }

	  var size = {};
	  size.width = elem.offsetWidth;
	  size.height = elem.offsetHeight;

	  var isBorderBox = size.isBorderBox = style.boxSizing == 'border-box';

	  // get all measurements
	  for ( var i=0; i < measurementsLength; i++ ) {
	    var measurement = measurements[i];
	    var value = style[ measurement ];
	    var num = parseFloat( value );
	    // any 'auto', 'medium' value will be 0
	    size[ measurement ] = !isNaN( num ) ? num : 0;
	  }

	  var paddingWidth = size.paddingLeft + size.paddingRight;
	  var paddingHeight = size.paddingTop + size.paddingBottom;
	  var marginWidth = size.marginLeft + size.marginRight;
	  var marginHeight = size.marginTop + size.marginBottom;
	  var borderWidth = size.borderLeftWidth + size.borderRightWidth;
	  var borderHeight = size.borderTopWidth + size.borderBottomWidth;

	  var isBorderBoxSizeOuter = isBorderBox && isBoxSizeOuter;

	  // overwrite width and height if we can get it from style
	  var styleWidth = getStyleSize( style.width );
	  if ( styleWidth !== false ) {
	    size.width = styleWidth +
	      // add padding and border unless it's already including it
	      ( isBorderBoxSizeOuter ? 0 : paddingWidth + borderWidth );
	  }

	  var styleHeight = getStyleSize( style.height );
	  if ( styleHeight !== false ) {
	    size.height = styleHeight +
	      // add padding and border unless it's already including it
	      ( isBorderBoxSizeOuter ? 0 : paddingHeight + borderHeight );
	  }

	  size.innerWidth = size.width - ( paddingWidth + borderWidth );
	  size.innerHeight = size.height - ( paddingHeight + borderHeight );

	  size.outerWidth = size.width + marginWidth;
	  size.outerHeight = size.height + marginHeight;

	  return size;
	}

	return getSize;

	});
	});

	var matchesSelector = createCommonjsModule(function (module) {
	/**
	 * matchesSelector v2.0.2
	 * matchesSelector( element, '.selector' )
	 * MIT license
	 */

	/*jshint browser: true, strict: true, undef: true, unused: true */

	( function( window, factory ) {
	  // universal module definition
	  if (  module.exports ) {
	    // CommonJS
	    module.exports = factory();
	  } else {
	    // browser global
	    window.matchesSelector = factory();
	  }

	}( window, function factory() {

	  var matchesMethod = ( function() {
	    var ElemProto = window.Element.prototype;
	    // check for the standard method name first
	    if ( ElemProto.matches ) {
	      return 'matches';
	    }
	    // check un-prefixed
	    if ( ElemProto.matchesSelector ) {
	      return 'matchesSelector';
	    }
	    // check vendor prefixes
	    var prefixes = [ 'webkit', 'moz', 'ms', 'o' ];

	    for ( var i=0; i < prefixes.length; i++ ) {
	      var prefix = prefixes[i];
	      var method = prefix + 'MatchesSelector';
	      if ( ElemProto[ method ] ) {
	        return method;
	      }
	    }
	  })();

	  return function matchesSelector( elem, selector ) {
	    return elem[ matchesMethod ]( selector );
	  };

	}));
	});

	var utils = createCommonjsModule(function (module) {
	/**
	 * Fizzy UI utils v2.0.7
	 * MIT license
	 */

	/*jshint browser: true, undef: true, unused: true, strict: true */

	( function( window, factory ) {
	  // universal module definition
	  /*jshint strict: false */ /*globals define, module, require */

	  if (  module.exports ) {
	    // CommonJS
	    module.exports = factory(
	      window,
	      matchesSelector
	    );
	  } else {
	    // browser global
	    window.fizzyUIUtils = factory(
	      window,
	      window.matchesSelector
	    );
	  }

	}( window, function factory( window, matchesSelector ) {

	var utils = {};

	// ----- extend ----- //

	// extends objects
	utils.extend = function( a, b ) {
	  for ( var prop in b ) {
	    a[ prop ] = b[ prop ];
	  }
	  return a;
	};

	// ----- modulo ----- //

	utils.modulo = function( num, div ) {
	  return ( ( num % div ) + div ) % div;
	};

	// ----- makeArray ----- //

	var arraySlice = Array.prototype.slice;

	// turn element or nodeList into an array
	utils.makeArray = function( obj ) {
	  if ( Array.isArray( obj ) ) {
	    // use object if already an array
	    return obj;
	  }
	  // return empty array if undefined or null. #6
	  if ( obj === null || obj === undefined ) {
	    return [];
	  }

	  var isArrayLike = typeof obj == 'object' && typeof obj.length == 'number';
	  if ( isArrayLike ) {
	    // convert nodeList to array
	    return arraySlice.call( obj );
	  }

	  // array of single index
	  return [ obj ];
	};

	// ----- removeFrom ----- //

	utils.removeFrom = function( ary, obj ) {
	  var index = ary.indexOf( obj );
	  if ( index != -1 ) {
	    ary.splice( index, 1 );
	  }
	};

	// ----- getParent ----- //

	utils.getParent = function( elem, selector ) {
	  while ( elem.parentNode && elem != document.body ) {
	    elem = elem.parentNode;
	    if ( matchesSelector( elem, selector ) ) {
	      return elem;
	    }
	  }
	};

	// ----- getQueryElement ----- //

	// use element as selector string
	utils.getQueryElement = function( elem ) {
	  if ( typeof elem == 'string' ) {
	    return document.querySelector( elem );
	  }
	  return elem;
	};

	// ----- handleEvent ----- //

	// enable .ontype to trigger from .addEventListener( elem, 'type' )
	utils.handleEvent = function( event ) {
	  var method = 'on' + event.type;
	  if ( this[ method ] ) {
	    this[ method ]( event );
	  }
	};

	// ----- filterFindElements ----- //

	utils.filterFindElements = function( elems, selector ) {
	  // make array of elems
	  elems = utils.makeArray( elems );
	  var ffElems = [];

	  elems.forEach( function( elem ) {
	    // check that elem is an actual element
	    if ( !( elem instanceof HTMLElement ) ) {
	      return;
	    }
	    // add elem if no selector
	    if ( !selector ) {
	      ffElems.push( elem );
	      return;
	    }
	    // filter & find items if we have a selector
	    // filter
	    if ( matchesSelector( elem, selector ) ) {
	      ffElems.push( elem );
	    }
	    // find children
	    var childElems = elem.querySelectorAll( selector );
	    // concat childElems to filterFound array
	    for ( var i=0; i < childElems.length; i++ ) {
	      ffElems.push( childElems[i] );
	    }
	  });

	  return ffElems;
	};

	// ----- debounceMethod ----- //

	utils.debounceMethod = function( _class, methodName, threshold ) {
	  threshold = threshold || 100;
	  // original method
	  var method = _class.prototype[ methodName ];
	  var timeoutName = methodName + 'Timeout';

	  _class.prototype[ methodName ] = function() {
	    var timeout = this[ timeoutName ];
	    clearTimeout( timeout );

	    var args = arguments;
	    var _this = this;
	    this[ timeoutName ] = setTimeout( function() {
	      method.apply( _this, args );
	      delete _this[ timeoutName ];
	    }, threshold );
	  };
	};

	// ----- docReady ----- //

	utils.docReady = function( callback ) {
	  var readyState = document.readyState;
	  if ( readyState == 'complete' || readyState == 'interactive' ) {
	    // do async to allow for other scripts to run. metafizzy/flickity#441
	    setTimeout( callback );
	  } else {
	    document.addEventListener( 'DOMContentLoaded', callback );
	  }
	};

	// ----- htmlInit ----- //

	// http://jamesroberts.name/blog/2010/02/22/string-functions-for-javascript-trim-to-camel-case-to-dashed-and-to-underscore/
	utils.toDashed = function( str ) {
	  return str.replace( /(.)([A-Z])/g, function( match, $1, $2 ) {
	    return $1 + '-' + $2;
	  }).toLowerCase();
	};

	var console = window.console;
	/**
	 * allow user to initialize classes via [data-namespace] or .js-namespace class
	 * htmlInit( Widget, 'widgetName' )
	 * options are parsed from data-namespace-options
	 */
	utils.htmlInit = function( WidgetClass, namespace ) {
	  utils.docReady( function() {
	    var dashedNamespace = utils.toDashed( namespace );
	    var dataAttr = 'data-' + dashedNamespace;
	    var dataAttrElems = document.querySelectorAll( '[' + dataAttr + ']' );
	    var jsDashElems = document.querySelectorAll( '.js-' + dashedNamespace );
	    var elems = utils.makeArray( dataAttrElems )
	      .concat( utils.makeArray( jsDashElems ) );
	    var dataOptionsAttr = dataAttr + '-options';
	    var jQuery = window.jQuery;

	    elems.forEach( function( elem ) {
	      var attr = elem.getAttribute( dataAttr ) ||
	        elem.getAttribute( dataOptionsAttr );
	      var options;
	      try {
	        options = attr && JSON.parse( attr );
	      } catch ( error ) {
	        // log error, do not initialize
	        if ( console ) {
	          console.error( 'Error parsing ' + dataAttr + ' on ' + elem.className +
	          ': ' + error );
	        }
	        return;
	      }
	      // initialize
	      var instance = new WidgetClass( elem, options );
	      // make available via $().data('namespace')
	      if ( jQuery ) {
	        jQuery.data( elem, namespace, instance );
	      }
	    });

	  });
	};

	// -----  ----- //

	return utils;

	}));
	});

	var cell = createCommonjsModule(function (module) {
	// Flickity.Cell
	( function( window, factory ) {
	  // universal module definition
	  if (  module.exports ) {
	    // CommonJS
	    module.exports = factory(
	        window,
	        getSize
	    );
	  } else {
	    // browser global
	    window.Flickity = window.Flickity || {};
	    window.Flickity.Cell = factory(
	        window,
	        window.getSize
	    );
	  }

	}( window, function factory( window, getSize ) {

	function Cell( elem, parent ) {
	  this.element = elem;
	  this.parent = parent;

	  this.create();
	}

	var proto = Cell.prototype;

	proto.create = function() {
	  this.element.style.position = 'absolute';
	  this.element.setAttribute( 'aria-hidden', 'true' );
	  this.x = 0;
	  this.shift = 0;
	};

	proto.destroy = function() {
	  // reset style
	  this.unselect();
	  this.element.style.position = '';
	  var side = this.parent.originSide;
	  this.element.style[ side ] = '';
	  this.element.removeAttribute('aria-hidden');
	};

	proto.getSize = function() {
	  this.size = getSize( this.element );
	};

	proto.setPosition = function( x ) {
	  this.x = x;
	  this.updateTarget();
	  this.renderPosition( x );
	};

	// setDefaultTarget v1 method, backwards compatibility, remove in v3
	proto.updateTarget = proto.setDefaultTarget = function() {
	  var marginProperty = this.parent.originSide == 'left' ? 'marginLeft' : 'marginRight';
	  this.target = this.x + this.size[ marginProperty ] +
	    this.size.width * this.parent.cellAlign;
	};

	proto.renderPosition = function( x ) {
	  // render position of cell with in slider
	  var side = this.parent.originSide;
	  this.element.style[ side ] = this.parent.getPositionValue( x );
	};

	proto.select = function() {
	  this.element.classList.add('is-selected');
	  this.element.removeAttribute('aria-hidden');
	};

	proto.unselect = function() {
	  this.element.classList.remove('is-selected');
	  this.element.setAttribute( 'aria-hidden', 'true' );
	};

	/**
	 * @param {Integer} shift - 0, 1, or -1
	 */
	proto.wrapShift = function( shift ) {
	  this.shift = shift;
	  this.renderPosition( this.x + this.parent.slideableWidth * shift );
	};

	proto.remove = function() {
	  this.element.parentNode.removeChild( this.element );
	};

	return Cell;

	} ) );
	});

	var slide = createCommonjsModule(function (module) {
	// slide
	( function( window, factory ) {
	  // universal module definition
	  if (  module.exports ) {
	    // CommonJS
	    module.exports = factory();
	  } else {
	    // browser global
	    window.Flickity = window.Flickity || {};
	    window.Flickity.Slide = factory();
	  }

	}( window, function factory() {

	function Slide( parent ) {
	  this.parent = parent;
	  this.isOriginLeft = parent.originSide == 'left';
	  this.cells = [];
	  this.outerWidth = 0;
	  this.height = 0;
	}

	var proto = Slide.prototype;

	proto.addCell = function( cell ) {
	  this.cells.push( cell );
	  this.outerWidth += cell.size.outerWidth;
	  this.height = Math.max( cell.size.outerHeight, this.height );
	  // first cell stuff
	  if ( this.cells.length == 1 ) {
	    this.x = cell.x; // x comes from first cell
	    var beginMargin = this.isOriginLeft ? 'marginLeft' : 'marginRight';
	    this.firstMargin = cell.size[ beginMargin ];
	  }
	};

	proto.updateTarget = function() {
	  var endMargin = this.isOriginLeft ? 'marginRight' : 'marginLeft';
	  var lastCell = this.getLastCell();
	  var lastMargin = lastCell ? lastCell.size[ endMargin ] : 0;
	  var slideWidth = this.outerWidth - ( this.firstMargin + lastMargin );
	  this.target = this.x + this.firstMargin + slideWidth * this.parent.cellAlign;
	};

	proto.getLastCell = function() {
	  return this.cells[ this.cells.length - 1 ];
	};

	proto.select = function() {
	  this.cells.forEach( function( cell ) {
	    cell.select();
	  } );
	};

	proto.unselect = function() {
	  this.cells.forEach( function( cell ) {
	    cell.unselect();
	  } );
	};

	proto.getCellElements = function() {
	  return this.cells.map( function( cell ) {
	    return cell.element;
	  } );
	};

	return Slide;

	} ) );
	});

	var animate = createCommonjsModule(function (module) {
	// animate
	( function( window, factory ) {
	  // universal module definition
	  if (  module.exports ) {
	    // CommonJS
	    module.exports = factory(
	        window,
	        utils
	    );
	  } else {
	    // browser global
	    window.Flickity = window.Flickity || {};
	    window.Flickity.animatePrototype = factory(
	        window,
	        window.fizzyUIUtils
	    );
	  }

	}( window, function factory( window, utils ) {

	// -------------------------- animate -------------------------- //

	var proto = {};

	proto.startAnimation = function() {
	  if ( this.isAnimating ) {
	    return;
	  }

	  this.isAnimating = true;
	  this.restingFrames = 0;
	  this.animate();
	};

	proto.animate = function() {
	  this.applyDragForce();
	  this.applySelectedAttraction();

	  var previousX = this.x;

	  this.integratePhysics();
	  this.positionSlider();
	  this.settle( previousX );
	  // animate next frame
	  if ( this.isAnimating ) {
	    var _this = this;
	    requestAnimationFrame( function animateFrame() {
	      _this.animate();
	    } );
	  }
	};

	proto.positionSlider = function() {
	  var x = this.x;
	  // wrap position around
	  if ( this.options.wrapAround && this.cells.length > 1 ) {
	    x = utils.modulo( x, this.slideableWidth );
	    x -= this.slideableWidth;
	    this.shiftWrapCells( x );
	  }

	  this.setTranslateX( x, this.isAnimating );
	  this.dispatchScrollEvent();
	};

	proto.setTranslateX = function( x, is3d ) {
	  x += this.cursorPosition;
	  // reverse if right-to-left and using transform
	  x = this.options.rightToLeft ? -x : x;
	  var translateX = this.getPositionValue( x );
	  // use 3D transforms for hardware acceleration on iOS
	  // but use 2D when settled, for better font-rendering
	  this.slider.style.transform = is3d ?
	    'translate3d(' + translateX + ',0,0)' : 'translateX(' + translateX + ')';
	};

	proto.dispatchScrollEvent = function() {
	  var firstSlide = this.slides[0];
	  if ( !firstSlide ) {
	    return;
	  }
	  var positionX = -this.x - firstSlide.target;
	  var progress = positionX / this.slidesWidth;
	  this.dispatchEvent( 'scroll', null, [ progress, positionX ] );
	};

	proto.positionSliderAtSelected = function() {
	  if ( !this.cells.length ) {
	    return;
	  }
	  this.x = -this.selectedSlide.target;
	  this.velocity = 0; // stop wobble
	  this.positionSlider();
	};

	proto.getPositionValue = function( position ) {
	  if ( this.options.percentPosition ) {
	    // percent position, round to 2 digits, like 12.34%
	    return ( Math.round( ( position / this.size.innerWidth ) * 10000 ) * 0.01 ) + '%';
	  } else {
	    // pixel positioning
	    return Math.round( position ) + 'px';
	  }
	};

	proto.settle = function( previousX ) {
	  // keep track of frames where x hasn't moved
	  var isResting = !this.isPointerDown &&
	      Math.round( this.x * 100 ) == Math.round( previousX * 100 );
	  if ( isResting ) {
	    this.restingFrames++;
	  }
	  // stop animating if resting for 3 or more frames
	  if ( this.restingFrames > 2 ) {
	    this.isAnimating = false;
	    delete this.isFreeScrolling;
	    // render position with translateX when settled
	    this.positionSlider();
	    this.dispatchEvent( 'settle', null, [ this.selectedIndex ] );
	  }
	};

	proto.shiftWrapCells = function( x ) {
	  // shift before cells
	  var beforeGap = this.cursorPosition + x;
	  this._shiftCells( this.beforeShiftCells, beforeGap, -1 );
	  // shift after cells
	  var afterGap = this.size.innerWidth - ( x + this.slideableWidth + this.cursorPosition );
	  this._shiftCells( this.afterShiftCells, afterGap, 1 );
	};

	proto._shiftCells = function( cells, gap, shift ) {
	  for ( var i = 0; i < cells.length; i++ ) {
	    var cell = cells[i];
	    var cellShift = gap > 0 ? shift : 0;
	    cell.wrapShift( cellShift );
	    gap -= cell.size.outerWidth;
	  }
	};

	proto._unshiftCells = function( cells ) {
	  if ( !cells || !cells.length ) {
	    return;
	  }
	  for ( var i = 0; i < cells.length; i++ ) {
	    cells[i].wrapShift( 0 );
	  }
	};

	// -------------------------- physics -------------------------- //

	proto.integratePhysics = function() {
	  this.x += this.velocity;
	  this.velocity *= this.getFrictionFactor();
	};

	proto.applyForce = function( force ) {
	  this.velocity += force;
	};

	proto.getFrictionFactor = function() {
	  return 1 - this.options[ this.isFreeScrolling ? 'freeScrollFriction' : 'friction' ];
	};

	proto.getRestingPosition = function() {
	  // my thanks to Steven Wittens, who simplified this math greatly
	  return this.x + this.velocity / ( 1 - this.getFrictionFactor() );
	};

	proto.applyDragForce = function() {
	  if ( !this.isDraggable || !this.isPointerDown ) {
	    return;
	  }
	  // change the position to drag position by applying force
	  var dragVelocity = this.dragX - this.x;
	  var dragForce = dragVelocity - this.velocity;
	  this.applyForce( dragForce );
	};

	proto.applySelectedAttraction = function() {
	  // do not attract if pointer down or no slides
	  var dragDown = this.isDraggable && this.isPointerDown;
	  if ( dragDown || this.isFreeScrolling || !this.slides.length ) {
	    return;
	  }
	  var distance = this.selectedSlide.target * -1 - this.x;
	  var force = distance * this.options.selectedAttraction;
	  this.applyForce( force );
	};

	return proto;

	} ) );
	});

	var flickity = createCommonjsModule(function (module) {
	// Flickity main
	/* eslint-disable max-params */
	( function( window, factory ) {
	  // universal module definition
	  if (  module.exports ) {
	    // CommonJS
	    module.exports = factory(
	        window,
	        evEmitter,
	        getSize,
	        utils,
	        cell,
	        slide,
	        animate
	    );
	  } else {
	    // browser global
	    var _Flickity = window.Flickity;

	    window.Flickity = factory(
	        window,
	        window.EvEmitter,
	        window.getSize,
	        window.fizzyUIUtils,
	        _Flickity.Cell,
	        _Flickity.Slide,
	        _Flickity.animatePrototype
	    );
	  }

	}( window, function factory( window, EvEmitter, getSize,
	    utils, Cell, Slide, animatePrototype ) {

	// vars
	var jQuery = window.jQuery;
	var getComputedStyle = window.getComputedStyle;
	var console = window.console;

	function moveElements( elems, toElem ) {
	  elems = utils.makeArray( elems );
	  while ( elems.length ) {
	    toElem.appendChild( elems.shift() );
	  }
	}

	// -------------------------- Flickity -------------------------- //

	// globally unique identifiers
	var GUID = 0;
	// internal store of all Flickity intances
	var instances = {};

	function Flickity( element, options ) {
	  var queryElement = utils.getQueryElement( element );
	  if ( !queryElement ) {
	    if ( console ) {
	      console.error( 'Bad element for Flickity: ' + ( queryElement || element ) );
	    }
	    return;
	  }
	  this.element = queryElement;
	  // do not initialize twice on same element
	  if ( this.element.flickityGUID ) {
	    var instance = instances[ this.element.flickityGUID ];
	    if ( instance ) instance.option( options );
	    return instance;
	  }

	  // add jQuery
	  if ( jQuery ) {
	    this.$element = jQuery( this.element );
	  }
	  // options
	  this.options = utils.extend( {}, this.constructor.defaults );
	  this.option( options );

	  // kick things off
	  this._create();
	}

	Flickity.defaults = {
	  accessibility: true,
	  // adaptiveHeight: false,
	  cellAlign: 'center',
	  // cellSelector: undefined,
	  // contain: false,
	  freeScrollFriction: 0.075, // friction when free-scrolling
	  friction: 0.28, // friction when selecting
	  namespaceJQueryEvents: true,
	  // initialIndex: 0,
	  percentPosition: true,
	  resize: true,
	  selectedAttraction: 0.025,
	  setGallerySize: true,
	  // watchCSS: false,
	  // wrapAround: false
	};

	// hash of methods triggered on _create()
	Flickity.createMethods = [];

	var proto = Flickity.prototype;
	// inherit EventEmitter
	utils.extend( proto, EvEmitter.prototype );

	proto._create = function() {
	  // add id for Flickity.data
	  var id = this.guid = ++GUID;
	  this.element.flickityGUID = id; // expando
	  instances[ id ] = this; // associate via id
	  // initial properties
	  this.selectedIndex = 0;
	  // how many frames slider has been in same position
	  this.restingFrames = 0;
	  // initial physics properties
	  this.x = 0;
	  this.velocity = 0;
	  this.originSide = this.options.rightToLeft ? 'right' : 'left';
	  // create viewport & slider
	  this.viewport = document.createElement('div');
	  this.viewport.className = 'flickity-viewport';
	  this._createSlider();

	  if ( this.options.resize || this.options.watchCSS ) {
	    window.addEventListener( 'resize', this );
	  }

	  // add listeners from on option
	  for ( var eventName in this.options.on ) {
	    var listener = this.options.on[ eventName ];
	    this.on( eventName, listener );
	  }

	  Flickity.createMethods.forEach( function( method ) {
	    this[ method ]();
	  }, this );

	  if ( this.options.watchCSS ) {
	    this.watchCSS();
	  } else {
	    this.activate();
	  }

	};

	/**
	 * set options
	 * @param {Object} opts - options to extend
	 */
	proto.option = function( opts ) {
	  utils.extend( this.options, opts );
	};

	proto.activate = function() {
	  if ( this.isActive ) {
	    return;
	  }
	  this.isActive = true;
	  this.element.classList.add('flickity-enabled');
	  if ( this.options.rightToLeft ) {
	    this.element.classList.add('flickity-rtl');
	  }

	  this.getSize();
	  // move initial cell elements so they can be loaded as cells
	  var cellElems = this._filterFindCellElements( this.element.children );
	  moveElements( cellElems, this.slider );
	  this.viewport.appendChild( this.slider );
	  this.element.appendChild( this.viewport );
	  // get cells from children
	  this.reloadCells();

	  if ( this.options.accessibility ) {
	    // allow element to focusable
	    this.element.tabIndex = 0;
	    // listen for key presses
	    this.element.addEventListener( 'keydown', this );
	  }

	  this.emitEvent('activate');
	  this.selectInitialIndex();
	  // flag for initial activation, for using initialIndex
	  this.isInitActivated = true;
	  // ready event. #493
	  this.dispatchEvent('ready');
	};

	// slider positions the cells
	proto._createSlider = function() {
	  // slider element does all the positioning
	  var slider = document.createElement('div');
	  slider.className = 'flickity-slider';
	  slider.style[ this.originSide ] = 0;
	  this.slider = slider;
	};

	proto._filterFindCellElements = function( elems ) {
	  return utils.filterFindElements( elems, this.options.cellSelector );
	};

	// goes through all children
	proto.reloadCells = function() {
	  // collection of item elements
	  this.cells = this._makeCells( this.slider.children );
	  this.positionCells();
	  this._getWrapShiftCells();
	  this.setGallerySize();
	};

	/**
	 * turn elements into Flickity.Cells
	 * @param {[Array, NodeList, HTMLElement]} elems - elements to make into cells
	 * @returns {Array} items - collection of new Flickity Cells
	 */
	proto._makeCells = function( elems ) {
	  var cellElems = this._filterFindCellElements( elems );

	  // create new Flickity for collection
	  var cells = cellElems.map( function( cellElem ) {
	    return new Cell( cellElem, this );
	  }, this );

	  return cells;
	};

	proto.getLastCell = function() {
	  return this.cells[ this.cells.length - 1 ];
	};

	proto.getLastSlide = function() {
	  return this.slides[ this.slides.length - 1 ];
	};

	// positions all cells
	proto.positionCells = function() {
	  // size all cells
	  this._sizeCells( this.cells );
	  // position all cells
	  this._positionCells( 0 );
	};

	/**
	 * position certain cells
	 * @param {Integer} index - which cell to start with
	 */
	proto._positionCells = function( index ) {
	  index = index || 0;
	  // also measure maxCellHeight
	  // start 0 if positioning all cells
	  this.maxCellHeight = index ? this.maxCellHeight || 0 : 0;
	  var cellX = 0;
	  // get cellX
	  if ( index > 0 ) {
	    var startCell = this.cells[ index - 1 ];
	    cellX = startCell.x + startCell.size.outerWidth;
	  }
	  var len = this.cells.length;
	  for ( var i = index; i < len; i++ ) {
	    var cell = this.cells[i];
	    cell.setPosition( cellX );
	    cellX += cell.size.outerWidth;
	    this.maxCellHeight = Math.max( cell.size.outerHeight, this.maxCellHeight );
	  }
	  // keep track of cellX for wrap-around
	  this.slideableWidth = cellX;
	  // slides
	  this.updateSlides();
	  // contain slides target
	  this._containSlides();
	  // update slidesWidth
	  this.slidesWidth = len ? this.getLastSlide().target - this.slides[0].target : 0;
	};

	/**
	 * cell.getSize() on multiple cells
	 * @param {Array} cells - cells to size
	 */
	proto._sizeCells = function( cells ) {
	  cells.forEach( function( cell ) {
	    cell.getSize();
	  } );
	};

	// --------------------------  -------------------------- //

	proto.updateSlides = function() {
	  this.slides = [];
	  if ( !this.cells.length ) {
	    return;
	  }

	  var slide = new Slide( this );
	  this.slides.push( slide );
	  var isOriginLeft = this.originSide == 'left';
	  var nextMargin = isOriginLeft ? 'marginRight' : 'marginLeft';

	  var canCellFit = this._getCanCellFit();

	  this.cells.forEach( function( cell, i ) {
	    // just add cell if first cell in slide
	    if ( !slide.cells.length ) {
	      slide.addCell( cell );
	      return;
	    }

	    var slideWidth = ( slide.outerWidth - slide.firstMargin ) +
	      ( cell.size.outerWidth - cell.size[ nextMargin ] );

	    if ( canCellFit.call( this, i, slideWidth ) ) {
	      slide.addCell( cell );
	    } else {
	      // doesn't fit, new slide
	      slide.updateTarget();

	      slide = new Slide( this );
	      this.slides.push( slide );
	      slide.addCell( cell );
	    }
	  }, this );
	  // last slide
	  slide.updateTarget();
	  // update .selectedSlide
	  this.updateSelectedSlide();
	};

	proto._getCanCellFit = function() {
	  var groupCells = this.options.groupCells;
	  if ( !groupCells ) {
	    return function() {
	      return false;
	    };
	  } else if ( typeof groupCells == 'number' ) {
	    // group by number. 3 -> [0,1,2], [3,4,5], ...
	    var number = parseInt( groupCells, 10 );
	    return function( i ) {
	      return ( i % number ) !== 0;
	    };
	  }
	  // default, group by width of slide
	  // parse '75%
	  var percentMatch = typeof groupCells == 'string' &&
	    groupCells.match( /^(\d+)%$/ );
	  var percent = percentMatch ? parseInt( percentMatch[1], 10 ) / 100 : 1;
	  return function( i, slideWidth ) {
	    /* eslint-disable-next-line no-invalid-this */
	    return slideWidth <= ( this.size.innerWidth + 1 ) * percent;
	  };
	};

	// alias _init for jQuery plugin .flickity()
	proto._init =
	proto.reposition = function() {
	  this.positionCells();
	  this.positionSliderAtSelected();
	};

	proto.getSize = function() {
	  this.size = getSize( this.element );
	  this.setCellAlign();
	  this.cursorPosition = this.size.innerWidth * this.cellAlign;
	};

	var cellAlignShorthands = {
	  // cell align, then based on origin side
	  center: {
	    left: 0.5,
	    right: 0.5,
	  },
	  left: {
	    left: 0,
	    right: 1,
	  },
	  right: {
	    right: 0,
	    left: 1,
	  },
	};

	proto.setCellAlign = function() {
	  var shorthand = cellAlignShorthands[ this.options.cellAlign ];
	  this.cellAlign = shorthand ? shorthand[ this.originSide ] : this.options.cellAlign;
	};

	proto.setGallerySize = function() {
	  if ( this.options.setGallerySize ) {
	    var height = this.options.adaptiveHeight && this.selectedSlide ?
	      this.selectedSlide.height : this.maxCellHeight;
	    this.viewport.style.height = height + 'px';
	  }
	};

	proto._getWrapShiftCells = function() {
	  // only for wrap-around
	  if ( !this.options.wrapAround ) {
	    return;
	  }
	  // unshift previous cells
	  this._unshiftCells( this.beforeShiftCells );
	  this._unshiftCells( this.afterShiftCells );
	  // get before cells
	  // initial gap
	  var gapX = this.cursorPosition;
	  var cellIndex = this.cells.length - 1;
	  this.beforeShiftCells = this._getGapCells( gapX, cellIndex, -1 );
	  // get after cells
	  // ending gap between last cell and end of gallery viewport
	  gapX = this.size.innerWidth - this.cursorPosition;
	  // start cloning at first cell, working forwards
	  this.afterShiftCells = this._getGapCells( gapX, 0, 1 );
	};

	proto._getGapCells = function( gapX, cellIndex, increment ) {
	  // keep adding cells until the cover the initial gap
	  var cells = [];
	  while ( gapX > 0 ) {
	    var cell = this.cells[ cellIndex ];
	    if ( !cell ) {
	      break;
	    }
	    cells.push( cell );
	    cellIndex += increment;
	    gapX -= cell.size.outerWidth;
	  }
	  return cells;
	};

	// ----- contain ----- //

	// contain cell targets so no excess sliding
	proto._containSlides = function() {
	  if ( !this.options.contain || this.options.wrapAround || !this.cells.length ) {
	    return;
	  }
	  var isRightToLeft = this.options.rightToLeft;
	  var beginMargin = isRightToLeft ? 'marginRight' : 'marginLeft';
	  var endMargin = isRightToLeft ? 'marginLeft' : 'marginRight';
	  var contentWidth = this.slideableWidth - this.getLastCell().size[ endMargin ];
	  // content is less than gallery size
	  var isContentSmaller = contentWidth < this.size.innerWidth;
	  // bounds
	  var beginBound = this.cursorPosition + this.cells[0].size[ beginMargin ];
	  var endBound = contentWidth - this.size.innerWidth * ( 1 - this.cellAlign );
	  // contain each cell target
	  this.slides.forEach( function( slide ) {
	    if ( isContentSmaller ) {
	      // all cells fit inside gallery
	      slide.target = contentWidth * this.cellAlign;
	    } else {
	      // contain to bounds
	      slide.target = Math.max( slide.target, beginBound );
	      slide.target = Math.min( slide.target, endBound );
	    }
	  }, this );
	};

	// -----  ----- //

	/**
	 * emits events via eventEmitter and jQuery events
	 * @param {String} type - name of event
	 * @param {Event} event - original event
	 * @param {Array} args - extra arguments
	 */
	proto.dispatchEvent = function( type, event, args ) {
	  var emitArgs = event ? [ event ].concat( args ) : args;
	  this.emitEvent( type, emitArgs );

	  if ( jQuery && this.$element ) {
	    // default trigger with type if no event
	    type += this.options.namespaceJQueryEvents ? '.flickity' : '';
	    var $event = type;
	    if ( event ) {
	      // create jQuery event
	      var jQEvent = new jQuery.Event( event );
	      jQEvent.type = type;
	      $event = jQEvent;
	    }
	    this.$element.trigger( $event, args );
	  }
	};

	// -------------------------- select -------------------------- //

	/**
	 * @param {Integer} index - index of the slide
	 * @param {Boolean} isWrap - will wrap-around to last/first if at the end
	 * @param {Boolean} isInstant - will immediately set position at selected cell
	 */
	proto.select = function( index, isWrap, isInstant ) {
	  if ( !this.isActive ) {
	    return;
	  }
	  index = parseInt( index, 10 );
	  this._wrapSelect( index );

	  if ( this.options.wrapAround || isWrap ) {
	    index = utils.modulo( index, this.slides.length );
	  }
	  // bail if invalid index
	  if ( !this.slides[ index ] ) {
	    return;
	  }
	  var prevIndex = this.selectedIndex;
	  this.selectedIndex = index;
	  this.updateSelectedSlide();
	  if ( isInstant ) {
	    this.positionSliderAtSelected();
	  } else {
	    this.startAnimation();
	  }
	  if ( this.options.adaptiveHeight ) {
	    this.setGallerySize();
	  }
	  // events
	  this.dispatchEvent( 'select', null, [ index ] );
	  // change event if new index
	  if ( index != prevIndex ) {
	    this.dispatchEvent( 'change', null, [ index ] );
	  }
	  // old v1 event name, remove in v3
	  this.dispatchEvent('cellSelect');
	};

	// wraps position for wrapAround, to move to closest slide. #113
	proto._wrapSelect = function( index ) {
	  var len = this.slides.length;
	  var isWrapping = this.options.wrapAround && len > 1;
	  if ( !isWrapping ) {
	    return index;
	  }
	  var wrapIndex = utils.modulo( index, len );
	  // go to shortest
	  var delta = Math.abs( wrapIndex - this.selectedIndex );
	  var backWrapDelta = Math.abs( ( wrapIndex + len ) - this.selectedIndex );
	  var forewardWrapDelta = Math.abs( ( wrapIndex - len ) - this.selectedIndex );
	  if ( !this.isDragSelect && backWrapDelta < delta ) {
	    index += len;
	  } else if ( !this.isDragSelect && forewardWrapDelta < delta ) {
	    index -= len;
	  }
	  // wrap position so slider is within normal area
	  if ( index < 0 ) {
	    this.x -= this.slideableWidth;
	  } else if ( index >= len ) {
	    this.x += this.slideableWidth;
	  }
	};

	proto.previous = function( isWrap, isInstant ) {
	  this.select( this.selectedIndex - 1, isWrap, isInstant );
	};

	proto.next = function( isWrap, isInstant ) {
	  this.select( this.selectedIndex + 1, isWrap, isInstant );
	};

	proto.updateSelectedSlide = function() {
	  var slide = this.slides[ this.selectedIndex ];
	  // selectedIndex could be outside of slides, if triggered before resize()
	  if ( !slide ) {
	    return;
	  }
	  // unselect previous selected slide
	  this.unselectSelectedSlide();
	  // update new selected slide
	  this.selectedSlide = slide;
	  slide.select();
	  this.selectedCells = slide.cells;
	  this.selectedElements = slide.getCellElements();
	  // HACK: selectedCell & selectedElement is first cell in slide, backwards compatibility
	  // Remove in v3?
	  this.selectedCell = slide.cells[0];
	  this.selectedElement = this.selectedElements[0];
	};

	proto.unselectSelectedSlide = function() {
	  if ( this.selectedSlide ) {
	    this.selectedSlide.unselect();
	  }
	};

	proto.selectInitialIndex = function() {
	  var initialIndex = this.options.initialIndex;
	  // already activated, select previous selectedIndex
	  if ( this.isInitActivated ) {
	    this.select( this.selectedIndex, false, true );
	    return;
	  }
	  // select with selector string
	  if ( initialIndex && typeof initialIndex == 'string' ) {
	    var cell = this.queryCell( initialIndex );
	    if ( cell ) {
	      this.selectCell( initialIndex, false, true );
	      return;
	    }
	  }

	  var index = 0;
	  // select with number
	  if ( initialIndex && this.slides[ initialIndex ] ) {
	    index = initialIndex;
	  }
	  // select instantly
	  this.select( index, false, true );
	};

	/**
	 * select slide from number or cell element
	 * @param {[Element, Number]} value - zero-based index or element to select
	 * @param {Boolean} isWrap - enables wrapping around for extra index
	 * @param {Boolean} isInstant - disables slide animation
	 */
	proto.selectCell = function( value, isWrap, isInstant ) {
	  // get cell
	  var cell = this.queryCell( value );
	  if ( !cell ) {
	    return;
	  }

	  var index = this.getCellSlideIndex( cell );
	  this.select( index, isWrap, isInstant );
	};

	proto.getCellSlideIndex = function( cell ) {
	  // get index of slides that has cell
	  for ( var i = 0; i < this.slides.length; i++ ) {
	    var slide = this.slides[i];
	    var index = slide.cells.indexOf( cell );
	    if ( index != -1 ) {
	      return i;
	    }
	  }
	};

	// -------------------------- get cells -------------------------- //

	/**
	 * get Flickity.Cell, given an Element
	 * @param {Element} elem - matching cell element
	 * @returns {Flickity.Cell} cell - matching cell
	 */
	proto.getCell = function( elem ) {
	  // loop through cells to get the one that matches
	  for ( var i = 0; i < this.cells.length; i++ ) {
	    var cell = this.cells[i];
	    if ( cell.element == elem ) {
	      return cell;
	    }
	  }
	};

	/**
	 * get collection of Flickity.Cells, given Elements
	 * @param {[Element, Array, NodeList]} elems - multiple elements
	 * @returns {Array} cells - Flickity.Cells
	 */
	proto.getCells = function( elems ) {
	  elems = utils.makeArray( elems );
	  var cells = [];
	  elems.forEach( function( elem ) {
	    var cell = this.getCell( elem );
	    if ( cell ) {
	      cells.push( cell );
	    }
	  }, this );
	  return cells;
	};

	/**
	 * get cell elements
	 * @returns {Array} cellElems
	 */
	proto.getCellElements = function() {
	  return this.cells.map( function( cell ) {
	    return cell.element;
	  } );
	};

	/**
	 * get parent cell from an element
	 * @param {Element} elem - child element
	 * @returns {Flickit.Cell} cell - parent cell
	 */
	proto.getParentCell = function( elem ) {
	  // first check if elem is cell
	  var cell = this.getCell( elem );
	  if ( cell ) {
	    return cell;
	  }
	  // try to get parent cell elem
	  elem = utils.getParent( elem, '.flickity-slider > *' );
	  return this.getCell( elem );
	};

	/**
	 * get cells adjacent to a slide
	 * @param {Integer} adjCount - number of adjacent slides
	 * @param {Integer} index - index of slide to start
	 * @returns {Array} cells - array of Flickity.Cells
	 */
	proto.getAdjacentCellElements = function( adjCount, index ) {
	  if ( !adjCount ) {
	    return this.selectedSlide.getCellElements();
	  }
	  index = index === undefined ? this.selectedIndex : index;

	  var len = this.slides.length;
	  if ( 1 + ( adjCount * 2 ) >= len ) {
	    return this.getCellElements();
	  }

	  var cellElems = [];
	  for ( var i = index - adjCount; i <= index + adjCount; i++ ) {
	    var slideIndex = this.options.wrapAround ? utils.modulo( i, len ) : i;
	    var slide = this.slides[ slideIndex ];
	    if ( slide ) {
	      cellElems = cellElems.concat( slide.getCellElements() );
	    }
	  }
	  return cellElems;
	};

	/**
	 * select slide from number or cell element
	 * @param {[Element, String, Number]} selector - element, selector string, or index
	 * @returns {Flickity.Cell} - matching cell
	 */
	proto.queryCell = function( selector ) {
	  if ( typeof selector == 'number' ) {
	    // use number as index
	    return this.cells[ selector ];
	  }
	  if ( typeof selector == 'string' ) {
	    // do not select invalid selectors from hash: #123, #/. #791
	    if ( selector.match( /^[#.]?[\d/]/ ) ) {
	      return;
	    }
	    // use string as selector, get element
	    selector = this.element.querySelector( selector );
	  }
	  // get cell from element
	  return this.getCell( selector );
	};

	// -------------------------- events -------------------------- //

	proto.uiChange = function() {
	  this.emitEvent('uiChange');
	};

	// keep focus on element when child UI elements are clicked
	proto.childUIPointerDown = function( event ) {
	  // HACK iOS does not allow touch events to bubble up?!
	  if ( event.type != 'touchstart' ) {
	    event.preventDefault();
	  }
	  this.focus();
	};

	// ----- resize ----- //

	proto.onresize = function() {
	  this.watchCSS();
	  this.resize();
	};

	utils.debounceMethod( Flickity, 'onresize', 150 );

	proto.resize = function() {
	  if ( !this.isActive ) {
	    return;
	  }
	  this.getSize();
	  // wrap values
	  if ( this.options.wrapAround ) {
	    this.x = utils.modulo( this.x, this.slideableWidth );
	  }
	  this.positionCells();
	  this._getWrapShiftCells();
	  this.setGallerySize();
	  this.emitEvent('resize');
	  // update selected index for group slides, instant
	  // TODO: position can be lost between groups of various numbers
	  var selectedElement = this.selectedElements && this.selectedElements[0];
	  this.selectCell( selectedElement, false, true );
	};

	// watches the :after property, activates/deactivates
	proto.watchCSS = function() {
	  var watchOption = this.options.watchCSS;
	  if ( !watchOption ) {
	    return;
	  }

	  var afterContent = getComputedStyle( this.element, ':after' ).content;
	  // activate if :after { content: 'flickity' }
	  if ( afterContent.indexOf('flickity') != -1 ) {
	    this.activate();
	  } else {
	    this.deactivate();
	  }
	};

	// ----- keydown ----- //

	// go previous/next if left/right keys pressed
	proto.onkeydown = function( event ) {
	  // only work if element is in focus
	  var isNotFocused = document.activeElement && document.activeElement != this.element;
	  if ( !this.options.accessibility || isNotFocused ) {
	    return;
	  }

	  var handler = Flickity.keyboardHandlers[ event.keyCode ];
	  if ( handler ) {
	    handler.call( this );
	  }
	};

	Flickity.keyboardHandlers = {
	  // left arrow
	  37: function() {
	    var leftMethod = this.options.rightToLeft ? 'next' : 'previous';
	    this.uiChange();
	    this[ leftMethod ]();
	  },
	  // right arrow
	  39: function() {
	    var rightMethod = this.options.rightToLeft ? 'previous' : 'next';
	    this.uiChange();
	    this[ rightMethod ]();
	  },
	};

	// ----- focus ----- //

	proto.focus = function() {
	  // TODO remove scrollTo once focus options gets more support
	  // https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/focus ...
	  //    #Browser_compatibility
	  var prevScrollY = window.pageYOffset;
	  this.element.focus({ preventScroll: true });
	  // hack to fix scroll jump after focus, #76
	  if ( window.pageYOffset != prevScrollY ) {
	    window.scrollTo( window.pageXOffset, prevScrollY );
	  }
	};

	// -------------------------- destroy -------------------------- //

	// deactivate all Flickity functionality, but keep stuff available
	proto.deactivate = function() {
	  if ( !this.isActive ) {
	    return;
	  }
	  this.element.classList.remove('flickity-enabled');
	  this.element.classList.remove('flickity-rtl');
	  this.unselectSelectedSlide();
	  // destroy cells
	  this.cells.forEach( function( cell ) {
	    cell.destroy();
	  } );
	  this.element.removeChild( this.viewport );
	  // move child elements back into element
	  moveElements( this.slider.children, this.element );
	  if ( this.options.accessibility ) {
	    this.element.removeAttribute('tabIndex');
	    this.element.removeEventListener( 'keydown', this );
	  }
	  // set flags
	  this.isActive = false;
	  this.emitEvent('deactivate');
	};

	proto.destroy = function() {
	  this.deactivate();
	  window.removeEventListener( 'resize', this );
	  this.allOff();
	  this.emitEvent('destroy');
	  if ( jQuery && this.$element ) {
	    jQuery.removeData( this.element, 'flickity' );
	  }
	  delete this.element.flickityGUID;
	  delete instances[ this.guid ];
	};

	// -------------------------- prototype -------------------------- //

	utils.extend( proto, animatePrototype );

	// -------------------------- extras -------------------------- //

	/**
	 * get Flickity instance from element
	 * @param {[Element, String]} elem - element or selector string
	 * @returns {Flickity} - Flickity instance
	 */
	Flickity.data = function( elem ) {
	  elem = utils.getQueryElement( elem );
	  var id = elem && elem.flickityGUID;
	  return id && instances[ id ];
	};

	utils.htmlInit( Flickity, 'flickity' );

	if ( jQuery && jQuery.bridget ) {
	  jQuery.bridget( 'flickity', Flickity );
	}

	// set internal jQuery, for Webpack + jQuery v3, #478
	Flickity.setJQuery = function( jq ) {
	  jQuery = jq;
	};

	Flickity.Cell = Cell;
	Flickity.Slide = Slide;

	return Flickity;

	} ) );
	});

	var unipointer = createCommonjsModule(function (module) {
	/*!
	 * Unipointer v2.3.0
	 * base class for doing one thing with pointer event
	 * MIT license
	 */

	/*jshint browser: true, undef: true, unused: true, strict: true */

	( function( window, factory ) {
	  // universal module definition
	  /* jshint strict: false */ /*global define, module, require */
	  if (  module.exports ) {
	    // CommonJS
	    module.exports = factory(
	      window,
	      evEmitter
	    );
	  } else {
	    // browser global
	    window.Unipointer = factory(
	      window,
	      window.EvEmitter
	    );
	  }

	}( window, function factory( window, EvEmitter ) {

	function noop() {}

	function Unipointer() {}

	// inherit EvEmitter
	var proto = Unipointer.prototype = Object.create( EvEmitter.prototype );

	proto.bindStartEvent = function( elem ) {
	  this._bindStartEvent( elem, true );
	};

	proto.unbindStartEvent = function( elem ) {
	  this._bindStartEvent( elem, false );
	};

	/**
	 * Add or remove start event
	 * @param {Boolean} isAdd - remove if falsey
	 */
	proto._bindStartEvent = function( elem, isAdd ) {
	  // munge isAdd, default to true
	  isAdd = isAdd === undefined ? true : isAdd;
	  var bindMethod = isAdd ? 'addEventListener' : 'removeEventListener';

	  // default to mouse events
	  var startEvent = 'mousedown';
	  if ( window.PointerEvent ) {
	    // Pointer Events
	    startEvent = 'pointerdown';
	  } else if ( 'ontouchstart' in window ) {
	    // Touch Events. iOS Safari
	    startEvent = 'touchstart';
	  }
	  elem[ bindMethod ]( startEvent, this );
	};

	// trigger handler methods for events
	proto.handleEvent = function( event ) {
	  var method = 'on' + event.type;
	  if ( this[ method ] ) {
	    this[ method ]( event );
	  }
	};

	// returns the touch that we're keeping track of
	proto.getTouch = function( touches ) {
	  for ( var i=0; i < touches.length; i++ ) {
	    var touch = touches[i];
	    if ( touch.identifier == this.pointerIdentifier ) {
	      return touch;
	    }
	  }
	};

	// ----- start event ----- //

	proto.onmousedown = function( event ) {
	  // dismiss clicks from right or middle buttons
	  var button = event.button;
	  if ( button && ( button !== 0 && button !== 1 ) ) {
	    return;
	  }
	  this._pointerDown( event, event );
	};

	proto.ontouchstart = function( event ) {
	  this._pointerDown( event, event.changedTouches[0] );
	};

	proto.onpointerdown = function( event ) {
	  this._pointerDown( event, event );
	};

	/**
	 * pointer start
	 * @param {Event} event
	 * @param {Event or Touch} pointer
	 */
	proto._pointerDown = function( event, pointer ) {
	  // dismiss right click and other pointers
	  // button = 0 is okay, 1-4 not
	  if ( event.button || this.isPointerDown ) {
	    return;
	  }

	  this.isPointerDown = true;
	  // save pointer identifier to match up touch events
	  this.pointerIdentifier = pointer.pointerId !== undefined ?
	    // pointerId for pointer events, touch.indentifier for touch events
	    pointer.pointerId : pointer.identifier;

	  this.pointerDown( event, pointer );
	};

	proto.pointerDown = function( event, pointer ) {
	  this._bindPostStartEvents( event );
	  this.emitEvent( 'pointerDown', [ event, pointer ] );
	};

	// hash of events to be bound after start event
	var postStartEvents = {
	  mousedown: [ 'mousemove', 'mouseup' ],
	  touchstart: [ 'touchmove', 'touchend', 'touchcancel' ],
	  pointerdown: [ 'pointermove', 'pointerup', 'pointercancel' ],
	};

	proto._bindPostStartEvents = function( event ) {
	  if ( !event ) {
	    return;
	  }
	  // get proper events to match start event
	  var events = postStartEvents[ event.type ];
	  // bind events to node
	  events.forEach( function( eventName ) {
	    window.addEventListener( eventName, this );
	  }, this );
	  // save these arguments
	  this._boundPointerEvents = events;
	};

	proto._unbindPostStartEvents = function() {
	  // check for _boundEvents, in case dragEnd triggered twice (old IE8 bug)
	  if ( !this._boundPointerEvents ) {
	    return;
	  }
	  this._boundPointerEvents.forEach( function( eventName ) {
	    window.removeEventListener( eventName, this );
	  }, this );

	  delete this._boundPointerEvents;
	};

	// ----- move event ----- //

	proto.onmousemove = function( event ) {
	  this._pointerMove( event, event );
	};

	proto.onpointermove = function( event ) {
	  if ( event.pointerId == this.pointerIdentifier ) {
	    this._pointerMove( event, event );
	  }
	};

	proto.ontouchmove = function( event ) {
	  var touch = this.getTouch( event.changedTouches );
	  if ( touch ) {
	    this._pointerMove( event, touch );
	  }
	};

	/**
	 * pointer move
	 * @param {Event} event
	 * @param {Event or Touch} pointer
	 * @private
	 */
	proto._pointerMove = function( event, pointer ) {
	  this.pointerMove( event, pointer );
	};

	// public
	proto.pointerMove = function( event, pointer ) {
	  this.emitEvent( 'pointerMove', [ event, pointer ] );
	};

	// ----- end event ----- //


	proto.onmouseup = function( event ) {
	  this._pointerUp( event, event );
	};

	proto.onpointerup = function( event ) {
	  if ( event.pointerId == this.pointerIdentifier ) {
	    this._pointerUp( event, event );
	  }
	};

	proto.ontouchend = function( event ) {
	  var touch = this.getTouch( event.changedTouches );
	  if ( touch ) {
	    this._pointerUp( event, touch );
	  }
	};

	/**
	 * pointer up
	 * @param {Event} event
	 * @param {Event or Touch} pointer
	 * @private
	 */
	proto._pointerUp = function( event, pointer ) {
	  this._pointerDone();
	  this.pointerUp( event, pointer );
	};

	// public
	proto.pointerUp = function( event, pointer ) {
	  this.emitEvent( 'pointerUp', [ event, pointer ] );
	};

	// ----- pointer done ----- //

	// triggered on pointer up & pointer cancel
	proto._pointerDone = function() {
	  this._pointerReset();
	  this._unbindPostStartEvents();
	  this.pointerDone();
	};

	proto._pointerReset = function() {
	  // reset properties
	  this.isPointerDown = false;
	  delete this.pointerIdentifier;
	};

	proto.pointerDone = noop;

	// ----- pointer cancel ----- //

	proto.onpointercancel = function( event ) {
	  if ( event.pointerId == this.pointerIdentifier ) {
	    this._pointerCancel( event, event );
	  }
	};

	proto.ontouchcancel = function( event ) {
	  var touch = this.getTouch( event.changedTouches );
	  if ( touch ) {
	    this._pointerCancel( event, touch );
	  }
	};

	/**
	 * pointer cancel
	 * @param {Event} event
	 * @param {Event or Touch} pointer
	 * @private
	 */
	proto._pointerCancel = function( event, pointer ) {
	  this._pointerDone();
	  this.pointerCancel( event, pointer );
	};

	// public
	proto.pointerCancel = function( event, pointer ) {
	  this.emitEvent( 'pointerCancel', [ event, pointer ] );
	};

	// -----  ----- //

	// utility function for getting x/y coords from event
	Unipointer.getPointerPoint = function( pointer ) {
	  return {
	    x: pointer.pageX,
	    y: pointer.pageY
	  };
	};

	// -----  ----- //

	return Unipointer;

	}));
	});

	var unidragger = createCommonjsModule(function (module) {
	/*!
	 * Unidragger v2.3.1
	 * Draggable base class
	 * MIT license
	 */

	/*jshint browser: true, unused: true, undef: true, strict: true */

	( function( window, factory ) {
	  // universal module definition
	  /*jshint strict: false */ /*globals define, module, require */

	  if (  module.exports ) {
	    // CommonJS
	    module.exports = factory(
	      window,
	      unipointer
	    );
	  } else {
	    // browser global
	    window.Unidragger = factory(
	      window,
	      window.Unipointer
	    );
	  }

	}( window, function factory( window, Unipointer ) {

	// -------------------------- Unidragger -------------------------- //

	function Unidragger() {}

	// inherit Unipointer & EvEmitter
	var proto = Unidragger.prototype = Object.create( Unipointer.prototype );

	// ----- bind start ----- //

	proto.bindHandles = function() {
	  this._bindHandles( true );
	};

	proto.unbindHandles = function() {
	  this._bindHandles( false );
	};

	/**
	 * Add or remove start event
	 * @param {Boolean} isAdd
	 */
	proto._bindHandles = function( isAdd ) {
	  // munge isAdd, default to true
	  isAdd = isAdd === undefined ? true : isAdd;
	  // bind each handle
	  var bindMethod = isAdd ? 'addEventListener' : 'removeEventListener';
	  var touchAction = isAdd ? this._touchActionValue : '';
	  for ( var i=0; i < this.handles.length; i++ ) {
	    var handle = this.handles[i];
	    this._bindStartEvent( handle, isAdd );
	    handle[ bindMethod ]( 'click', this );
	    // touch-action: none to override browser touch gestures. metafizzy/flickity#540
	    if ( window.PointerEvent ) {
	      handle.style.touchAction = touchAction;
	    }
	  }
	};

	// prototype so it can be overwriteable by Flickity
	proto._touchActionValue = 'none';

	// ----- start event ----- //

	/**
	 * pointer start
	 * @param {Event} event
	 * @param {Event or Touch} pointer
	 */
	proto.pointerDown = function( event, pointer ) {
	  var isOkay = this.okayPointerDown( event );
	  if ( !isOkay ) {
	    return;
	  }
	  // track start event position
	  // Safari 9 overrides pageX and pageY. These values needs to be copied. flickity#842
	  this.pointerDownPointer = {
	    pageX: pointer.pageX,
	    pageY: pointer.pageY,
	  };

	  event.preventDefault();
	  this.pointerDownBlur();
	  // bind move and end events
	  this._bindPostStartEvents( event );
	  this.emitEvent( 'pointerDown', [ event, pointer ] );
	};

	// nodes that have text fields
	var cursorNodes = {
	  TEXTAREA: true,
	  INPUT: true,
	  SELECT: true,
	  OPTION: true,
	};

	// input types that do not have text fields
	var clickTypes = {
	  radio: true,
	  checkbox: true,
	  button: true,
	  submit: true,
	  image: true,
	  file: true,
	};

	// dismiss inputs with text fields. flickity#403, flickity#404
	proto.okayPointerDown = function( event ) {
	  var isCursorNode = cursorNodes[ event.target.nodeName ];
	  var isClickType = clickTypes[ event.target.type ];
	  var isOkay = !isCursorNode || isClickType;
	  if ( !isOkay ) {
	    this._pointerReset();
	  }
	  return isOkay;
	};

	// kludge to blur previously focused input
	proto.pointerDownBlur = function() {
	  var focused = document.activeElement;
	  // do not blur body for IE10, metafizzy/flickity#117
	  var canBlur = focused && focused.blur && focused != document.body;
	  if ( canBlur ) {
	    focused.blur();
	  }
	};

	// ----- move event ----- //

	/**
	 * drag move
	 * @param {Event} event
	 * @param {Event or Touch} pointer
	 */
	proto.pointerMove = function( event, pointer ) {
	  var moveVector = this._dragPointerMove( event, pointer );
	  this.emitEvent( 'pointerMove', [ event, pointer, moveVector ] );
	  this._dragMove( event, pointer, moveVector );
	};

	// base pointer move logic
	proto._dragPointerMove = function( event, pointer ) {
	  var moveVector = {
	    x: pointer.pageX - this.pointerDownPointer.pageX,
	    y: pointer.pageY - this.pointerDownPointer.pageY
	  };
	  // start drag if pointer has moved far enough to start drag
	  if ( !this.isDragging && this.hasDragStarted( moveVector ) ) {
	    this._dragStart( event, pointer );
	  }
	  return moveVector;
	};

	// condition if pointer has moved far enough to start drag
	proto.hasDragStarted = function( moveVector ) {
	  return Math.abs( moveVector.x ) > 3 || Math.abs( moveVector.y ) > 3;
	};

	// ----- end event ----- //

	/**
	 * pointer up
	 * @param {Event} event
	 * @param {Event or Touch} pointer
	 */
	proto.pointerUp = function( event, pointer ) {
	  this.emitEvent( 'pointerUp', [ event, pointer ] );
	  this._dragPointerUp( event, pointer );
	};

	proto._dragPointerUp = function( event, pointer ) {
	  if ( this.isDragging ) {
	    this._dragEnd( event, pointer );
	  } else {
	    // pointer didn't move enough for drag to start
	    this._staticClick( event, pointer );
	  }
	};

	// -------------------------- drag -------------------------- //

	// dragStart
	proto._dragStart = function( event, pointer ) {
	  this.isDragging = true;
	  // prevent clicks
	  this.isPreventingClicks = true;
	  this.dragStart( event, pointer );
	};

	proto.dragStart = function( event, pointer ) {
	  this.emitEvent( 'dragStart', [ event, pointer ] );
	};

	// dragMove
	proto._dragMove = function( event, pointer, moveVector ) {
	  // do not drag if not dragging yet
	  if ( !this.isDragging ) {
	    return;
	  }

	  this.dragMove( event, pointer, moveVector );
	};

	proto.dragMove = function( event, pointer, moveVector ) {
	  event.preventDefault();
	  this.emitEvent( 'dragMove', [ event, pointer, moveVector ] );
	};

	// dragEnd
	proto._dragEnd = function( event, pointer ) {
	  // set flags
	  this.isDragging = false;
	  // re-enable clicking async
	  setTimeout( function() {
	    delete this.isPreventingClicks;
	  }.bind( this ) );

	  this.dragEnd( event, pointer );
	};

	proto.dragEnd = function( event, pointer ) {
	  this.emitEvent( 'dragEnd', [ event, pointer ] );
	};

	// ----- onclick ----- //

	// handle all clicks and prevent clicks when dragging
	proto.onclick = function( event ) {
	  if ( this.isPreventingClicks ) {
	    event.preventDefault();
	  }
	};

	// ----- staticClick ----- //

	// triggered after pointer down & up with no/tiny movement
	proto._staticClick = function( event, pointer ) {
	  // ignore emulated mouse up clicks
	  if ( this.isIgnoringMouseUp && event.type == 'mouseup' ) {
	    return;
	  }

	  this.staticClick( event, pointer );

	  // set flag for emulated clicks 300ms after touchend
	  if ( event.type != 'mouseup' ) {
	    this.isIgnoringMouseUp = true;
	    // reset flag after 300ms
	    setTimeout( function() {
	      delete this.isIgnoringMouseUp;
	    }.bind( this ), 400 );
	  }
	};

	proto.staticClick = function( event, pointer ) {
	  this.emitEvent( 'staticClick', [ event, pointer ] );
	};

	// ----- utils ----- //

	Unidragger.getPointerPoint = Unipointer.getPointerPoint;

	// -----  ----- //

	return Unidragger;

	}));
	});

	var drag = createCommonjsModule(function (module) {
	// drag
	( function( window, factory ) {
	  // universal module definition
	  if (  module.exports ) {
	    // CommonJS
	    module.exports = factory(
	        window,
	        flickity,
	        unidragger,
	        utils
	    );
	  } else {
	    // browser global
	    window.Flickity = factory(
	        window,
	        window.Flickity,
	        window.Unidragger,
	        window.fizzyUIUtils
	    );
	  }

	}( window, function factory( window, Flickity, Unidragger, utils ) {

	// ----- defaults ----- //

	utils.extend( Flickity.defaults, {
	  draggable: '>1',
	  dragThreshold: 3,
	} );

	// ----- create ----- //

	Flickity.createMethods.push('_createDrag');

	// -------------------------- drag prototype -------------------------- //

	var proto = Flickity.prototype;
	utils.extend( proto, Unidragger.prototype );
	proto._touchActionValue = 'pan-y';

	// --------------------------  -------------------------- //

	var isTouch = 'createTouch' in document;
	var isTouchmoveScrollCanceled = false;

	proto._createDrag = function() {
	  this.on( 'activate', this.onActivateDrag );
	  this.on( 'uiChange', this._uiChangeDrag );
	  this.on( 'deactivate', this.onDeactivateDrag );
	  this.on( 'cellChange', this.updateDraggable );
	  // TODO updateDraggable on resize? if groupCells & slides change
	  // HACK - add seemingly innocuous handler to fix iOS 10 scroll behavior
	  // #457, RubaXa/Sortable#973
	  if ( isTouch && !isTouchmoveScrollCanceled ) {
	    window.addEventListener( 'touchmove', function() {} );
	    isTouchmoveScrollCanceled = true;
	  }
	};

	proto.onActivateDrag = function() {
	  this.handles = [ this.viewport ];
	  this.bindHandles();
	  this.updateDraggable();
	};

	proto.onDeactivateDrag = function() {
	  this.unbindHandles();
	  this.element.classList.remove('is-draggable');
	};

	proto.updateDraggable = function() {
	  // disable dragging if less than 2 slides. #278
	  if ( this.options.draggable == '>1' ) {
	    this.isDraggable = this.slides.length > 1;
	  } else {
	    this.isDraggable = this.options.draggable;
	  }
	  if ( this.isDraggable ) {
	    this.element.classList.add('is-draggable');
	  } else {
	    this.element.classList.remove('is-draggable');
	  }
	};

	// backwards compatibility
	proto.bindDrag = function() {
	  this.options.draggable = true;
	  this.updateDraggable();
	};

	proto.unbindDrag = function() {
	  this.options.draggable = false;
	  this.updateDraggable();
	};

	proto._uiChangeDrag = function() {
	  delete this.isFreeScrolling;
	};

	// -------------------------- pointer events -------------------------- //

	proto.pointerDown = function( event, pointer ) {
	  if ( !this.isDraggable ) {
	    this._pointerDownDefault( event, pointer );
	    return;
	  }
	  var isOkay = this.okayPointerDown( event );
	  if ( !isOkay ) {
	    return;
	  }

	  this._pointerDownPreventDefault( event );
	  this.pointerDownFocus( event );
	  // blur
	  if ( document.activeElement != this.element ) {
	    // do not blur if already focused
	    this.pointerDownBlur();
	  }

	  // stop if it was moving
	  this.dragX = this.x;
	  this.viewport.classList.add('is-pointer-down');
	  // track scrolling
	  this.pointerDownScroll = getScrollPosition();
	  window.addEventListener( 'scroll', this );

	  this._pointerDownDefault( event, pointer );
	};

	// default pointerDown logic, used for staticClick
	proto._pointerDownDefault = function( event, pointer ) {
	  // track start event position
	  // Safari 9 overrides pageX and pageY. These values needs to be copied. #779
	  this.pointerDownPointer = {
	    pageX: pointer.pageX,
	    pageY: pointer.pageY,
	  };
	  // bind move and end events
	  this._bindPostStartEvents( event );
	  this.dispatchEvent( 'pointerDown', event, [ pointer ] );
	};

	var focusNodes = {
	  INPUT: true,
	  TEXTAREA: true,
	  SELECT: true,
	};

	proto.pointerDownFocus = function( event ) {
	  var isFocusNode = focusNodes[ event.target.nodeName ];
	  if ( !isFocusNode ) {
	    this.focus();
	  }
	};

	proto._pointerDownPreventDefault = function( event ) {
	  var isTouchStart = event.type == 'touchstart';
	  var isTouchPointer = event.pointerType == 'touch';
	  var isFocusNode = focusNodes[ event.target.nodeName ];
	  if ( !isTouchStart && !isTouchPointer && !isFocusNode ) {
	    event.preventDefault();
	  }
	};

	// ----- move ----- //

	proto.hasDragStarted = function( moveVector ) {
	  return Math.abs( moveVector.x ) > this.options.dragThreshold;
	};

	// ----- up ----- //

	proto.pointerUp = function( event, pointer ) {
	  delete this.isTouchScrolling;
	  this.viewport.classList.remove('is-pointer-down');
	  this.dispatchEvent( 'pointerUp', event, [ pointer ] );
	  this._dragPointerUp( event, pointer );
	};

	proto.pointerDone = function() {
	  window.removeEventListener( 'scroll', this );
	  delete this.pointerDownScroll;
	};

	// -------------------------- dragging -------------------------- //

	proto.dragStart = function( event, pointer ) {
	  if ( !this.isDraggable ) {
	    return;
	  }
	  this.dragStartPosition = this.x;
	  this.startAnimation();
	  window.removeEventListener( 'scroll', this );
	  this.dispatchEvent( 'dragStart', event, [ pointer ] );
	};

	proto.pointerMove = function( event, pointer ) {
	  var moveVector = this._dragPointerMove( event, pointer );
	  this.dispatchEvent( 'pointerMove', event, [ pointer, moveVector ] );
	  this._dragMove( event, pointer, moveVector );
	};

	proto.dragMove = function( event, pointer, moveVector ) {
	  if ( !this.isDraggable ) {
	    return;
	  }
	  event.preventDefault();

	  this.previousDragX = this.dragX;
	  // reverse if right-to-left
	  var direction = this.options.rightToLeft ? -1 : 1;
	  if ( this.options.wrapAround ) {
	    // wrap around move. #589
	    moveVector.x %= this.slideableWidth;
	  }
	  var dragX = this.dragStartPosition + moveVector.x * direction;

	  if ( !this.options.wrapAround && this.slides.length ) {
	    // slow drag
	    var originBound = Math.max( -this.slides[0].target, this.dragStartPosition );
	    dragX = dragX > originBound ? ( dragX + originBound ) * 0.5 : dragX;
	    var endBound = Math.min( -this.getLastSlide().target, this.dragStartPosition );
	    dragX = dragX < endBound ? ( dragX + endBound ) * 0.5 : dragX;
	  }

	  this.dragX = dragX;

	  this.dragMoveTime = new Date();
	  this.dispatchEvent( 'dragMove', event, [ pointer, moveVector ] );
	};

	proto.dragEnd = function( event, pointer ) {
	  if ( !this.isDraggable ) {
	    return;
	  }
	  if ( this.options.freeScroll ) {
	    this.isFreeScrolling = true;
	  }
	  // set selectedIndex based on where flick will end up
	  var index = this.dragEndRestingSelect();

	  if ( this.options.freeScroll && !this.options.wrapAround ) {
	    // if free-scroll & not wrap around
	    // do not free-scroll if going outside of bounding slides
	    // so bounding slides can attract slider, and keep it in bounds
	    var restingX = this.getRestingPosition();
	    this.isFreeScrolling = -restingX > this.slides[0].target &&
	      -restingX < this.getLastSlide().target;
	  } else if ( !this.options.freeScroll && index == this.selectedIndex ) {
	    // boost selection if selected index has not changed
	    index += this.dragEndBoostSelect();
	  }
	  delete this.previousDragX;
	  // apply selection
	  // TODO refactor this, selecting here feels weird
	  // HACK, set flag so dragging stays in correct direction
	  this.isDragSelect = this.options.wrapAround;
	  this.select( index );
	  delete this.isDragSelect;
	  this.dispatchEvent( 'dragEnd', event, [ pointer ] );
	};

	proto.dragEndRestingSelect = function() {
	  var restingX = this.getRestingPosition();
	  // how far away from selected slide
	  var distance = Math.abs( this.getSlideDistance( -restingX, this.selectedIndex ) );
	  // get closet resting going up and going down
	  var positiveResting = this._getClosestResting( restingX, distance, 1 );
	  var negativeResting = this._getClosestResting( restingX, distance, -1 );
	  // use closer resting for wrap-around
	  var index = positiveResting.distance < negativeResting.distance ?
	    positiveResting.index : negativeResting.index;
	  return index;
	};

	/**
	 * given resting X and distance to selected cell
	 * get the distance and index of the closest cell
	 * @param {Number} restingX - estimated post-flick resting position
	 * @param {Number} distance - distance to selected cell
	 * @param {Integer} increment - +1 or -1, going up or down
	 * @returns {Object} - { distance: {Number}, index: {Integer} }
	 */
	proto._getClosestResting = function( restingX, distance, increment ) {
	  var index = this.selectedIndex;
	  var minDistance = Infinity;
	  var condition = this.options.contain && !this.options.wrapAround ?
	    // if contain, keep going if distance is equal to minDistance
	    function( dist, minDist ) {
	      return dist <= minDist;
	    } : function( dist, minDist ) {
	      return dist < minDist;
	    };
	  while ( condition( distance, minDistance ) ) {
	    // measure distance to next cell
	    index += increment;
	    minDistance = distance;
	    distance = this.getSlideDistance( -restingX, index );
	    if ( distance === null ) {
	      break;
	    }
	    distance = Math.abs( distance );
	  }
	  return {
	    distance: minDistance,
	    // selected was previous index
	    index: index - increment,
	  };
	};

	/**
	 * measure distance between x and a slide target
	 * @param {Number} x - horizontal position
	 * @param {Integer} index - slide index
	 * @returns {Number} - slide distance
	 */
	proto.getSlideDistance = function( x, index ) {
	  var len = this.slides.length;
	  // wrap around if at least 2 slides
	  var isWrapAround = this.options.wrapAround && len > 1;
	  var slideIndex = isWrapAround ? utils.modulo( index, len ) : index;
	  var slide = this.slides[ slideIndex ];
	  if ( !slide ) {
	    return null;
	  }
	  // add distance for wrap-around slides
	  var wrap = isWrapAround ? this.slideableWidth * Math.floor( index/len ) : 0;
	  return x - ( slide.target + wrap );
	};

	proto.dragEndBoostSelect = function() {
	  // do not boost if no previousDragX or dragMoveTime
	  if ( this.previousDragX === undefined || !this.dragMoveTime ||
	    // or if drag was held for 100 ms
	    new Date() - this.dragMoveTime > 100 ) {
	    return 0;
	  }

	  var distance = this.getSlideDistance( -this.dragX, this.selectedIndex );
	  var delta = this.previousDragX - this.dragX;
	  if ( distance > 0 && delta > 0 ) {
	    // boost to next if moving towards the right, and positive velocity
	    return 1;
	  } else if ( distance < 0 && delta < 0 ) {
	    // boost to previous if moving towards the left, and negative velocity
	    return -1;
	  }
	  return 0;
	};

	// ----- staticClick ----- //

	proto.staticClick = function( event, pointer ) {
	  // get clickedCell, if cell was clicked
	  var clickedCell = this.getParentCell( event.target );
	  var cellElem = clickedCell && clickedCell.element;
	  var cellIndex = clickedCell && this.cells.indexOf( clickedCell );
	  this.dispatchEvent( 'staticClick', event, [ pointer, cellElem, cellIndex ] );
	};

	// ----- scroll ----- //

	proto.onscroll = function() {
	  var scroll = getScrollPosition();
	  var scrollMoveX = this.pointerDownScroll.x - scroll.x;
	  var scrollMoveY = this.pointerDownScroll.y - scroll.y;
	  // cancel click/tap if scroll is too much
	  if ( Math.abs( scrollMoveX ) > 3 || Math.abs( scrollMoveY ) > 3 ) {
	    this._pointerDone();
	  }
	};

	// ----- utils ----- //

	function getScrollPosition() {
	  return {
	    x: window.pageXOffset,
	    y: window.pageYOffset,
	  };
	}

	// -----  ----- //

	return Flickity;

	} ) );
	});

	var prevNextButton = createCommonjsModule(function (module) {
	// prev/next buttons
	( function( window, factory ) {
	  // universal module definition
	  if (  module.exports ) {
	    // CommonJS
	    module.exports = factory(
	        window,
	        flickity,
	        unipointer,
	        utils
	    );
	  } else {
	    // browser global
	    factory(
	        window,
	        window.Flickity,
	        window.Unipointer,
	        window.fizzyUIUtils
	    );
	  }

	}( window, function factory( window, Flickity, Unipointer, utils ) {

	var svgURI = 'http://www.w3.org/2000/svg';

	// -------------------------- PrevNextButton -------------------------- //

	function PrevNextButton( direction, parent ) {
	  this.direction = direction;
	  this.parent = parent;
	  this._create();
	}

	PrevNextButton.prototype = Object.create( Unipointer.prototype );

	PrevNextButton.prototype._create = function() {
	  // properties
	  this.isEnabled = true;
	  this.isPrevious = this.direction == -1;
	  var leftDirection = this.parent.options.rightToLeft ? 1 : -1;
	  this.isLeft = this.direction == leftDirection;

	  var element = this.element = document.createElement('button');
	  element.className = 'flickity-button flickity-prev-next-button';
	  element.className += this.isPrevious ? ' previous' : ' next';
	  // prevent button from submitting form http://stackoverflow.com/a/10836076/182183
	  element.setAttribute( 'type', 'button' );
	  // init as disabled
	  this.disable();

	  element.setAttribute( 'aria-label', this.isPrevious ? 'Previous' : 'Next' );

	  // create arrow
	  var svg = this.createSVG();
	  element.appendChild( svg );
	  // events
	  this.parent.on( 'select', this.update.bind( this ) );
	  this.on( 'pointerDown', this.parent.childUIPointerDown.bind( this.parent ) );
	};

	PrevNextButton.prototype.activate = function() {
	  this.bindStartEvent( this.element );
	  this.element.addEventListener( 'click', this );
	  // add to DOM
	  this.parent.element.appendChild( this.element );
	};

	PrevNextButton.prototype.deactivate = function() {
	  // remove from DOM
	  this.parent.element.removeChild( this.element );
	  // click events
	  this.unbindStartEvent( this.element );
	  this.element.removeEventListener( 'click', this );
	};

	PrevNextButton.prototype.createSVG = function() {
	  var svg = document.createElementNS( svgURI, 'svg' );
	  svg.setAttribute( 'class', 'flickity-button-icon' );
	  svg.setAttribute( 'viewBox', '0 0 100 100' );
	  var path = document.createElementNS( svgURI, 'path' );
	  var pathMovements = getArrowMovements( this.parent.options.arrowShape );
	  path.setAttribute( 'd', pathMovements );
	  path.setAttribute( 'class', 'arrow' );
	  // rotate arrow
	  if ( !this.isLeft ) {
	    path.setAttribute( 'transform', 'translate(100, 100) rotate(180) ' );
	  }
	  svg.appendChild( path );
	  return svg;
	};

	// get SVG path movmement
	function getArrowMovements( shape ) {
	  // use shape as movement if string
	  if ( typeof shape == 'string' ) {
	    return shape;
	  }
	  // create movement string
	  return 'M ' + shape.x0 + ',50' +
	    ' L ' + shape.x1 + ',' + ( shape.y1 + 50 ) +
	    ' L ' + shape.x2 + ',' + ( shape.y2 + 50 ) +
	    ' L ' + shape.x3 + ',50 ' +
	    ' L ' + shape.x2 + ',' + ( 50 - shape.y2 ) +
	    ' L ' + shape.x1 + ',' + ( 50 - shape.y1 ) +
	    ' Z';
	}

	PrevNextButton.prototype.handleEvent = utils.handleEvent;

	PrevNextButton.prototype.onclick = function() {
	  if ( !this.isEnabled ) {
	    return;
	  }
	  this.parent.uiChange();
	  var method = this.isPrevious ? 'previous' : 'next';
	  this.parent[ method ]();
	};

	// -----  ----- //

	PrevNextButton.prototype.enable = function() {
	  if ( this.isEnabled ) {
	    return;
	  }
	  this.element.disabled = false;
	  this.isEnabled = true;
	};

	PrevNextButton.prototype.disable = function() {
	  if ( !this.isEnabled ) {
	    return;
	  }
	  this.element.disabled = true;
	  this.isEnabled = false;
	};

	PrevNextButton.prototype.update = function() {
	  // index of first or last slide, if previous or next
	  var slides = this.parent.slides;
	  // enable is wrapAround and at least 2 slides
	  if ( this.parent.options.wrapAround && slides.length > 1 ) {
	    this.enable();
	    return;
	  }
	  var lastIndex = slides.length ? slides.length - 1 : 0;
	  var boundIndex = this.isPrevious ? 0 : lastIndex;
	  var method = this.parent.selectedIndex == boundIndex ? 'disable' : 'enable';
	  this[ method ]();
	};

	PrevNextButton.prototype.destroy = function() {
	  this.deactivate();
	  this.allOff();
	};

	// -------------------------- Flickity prototype -------------------------- //

	utils.extend( Flickity.defaults, {
	  prevNextButtons: true,
	  arrowShape: {
	    x0: 10,
	    x1: 60, y1: 50,
	    x2: 70, y2: 40,
	    x3: 30,
	  },
	} );

	Flickity.createMethods.push('_createPrevNextButtons');
	var proto = Flickity.prototype;

	proto._createPrevNextButtons = function() {
	  if ( !this.options.prevNextButtons ) {
	    return;
	  }

	  this.prevButton = new PrevNextButton( -1, this );
	  this.nextButton = new PrevNextButton( 1, this );

	  this.on( 'activate', this.activatePrevNextButtons );
	};

	proto.activatePrevNextButtons = function() {
	  this.prevButton.activate();
	  this.nextButton.activate();
	  this.on( 'deactivate', this.deactivatePrevNextButtons );
	};

	proto.deactivatePrevNextButtons = function() {
	  this.prevButton.deactivate();
	  this.nextButton.deactivate();
	  this.off( 'deactivate', this.deactivatePrevNextButtons );
	};

	// --------------------------  -------------------------- //

	Flickity.PrevNextButton = PrevNextButton;

	return Flickity;

	} ) );
	});

	var pageDots = createCommonjsModule(function (module) {
	// page dots
	( function( window, factory ) {
	  // universal module definition
	  if (  module.exports ) {
	    // CommonJS
	    module.exports = factory(
	        window,
	        flickity,
	        unipointer,
	        utils
	    );
	  } else {
	    // browser global
	    factory(
	        window,
	        window.Flickity,
	        window.Unipointer,
	        window.fizzyUIUtils
	    );
	  }

	}( window, function factory( window, Flickity, Unipointer, utils ) {

	function PageDots( parent ) {
	  this.parent = parent;
	  this._create();
	}

	PageDots.prototype = Object.create( Unipointer.prototype );

	PageDots.prototype._create = function() {
	  // create holder element
	  this.holder = document.createElement('ol');
	  this.holder.className = 'flickity-page-dots';
	  // create dots, array of elements
	  this.dots = [];
	  // events
	  this.handleClick = this.onClick.bind( this );
	  this.on( 'pointerDown', this.parent.childUIPointerDown.bind( this.parent ) );
	};

	PageDots.prototype.activate = function() {
	  this.setDots();
	  this.holder.addEventListener( 'click', this.handleClick );
	  this.bindStartEvent( this.holder );
	  // add to DOM
	  this.parent.element.appendChild( this.holder );
	};

	PageDots.prototype.deactivate = function() {
	  this.holder.removeEventListener( 'click', this.handleClick );
	  this.unbindStartEvent( this.holder );
	  // remove from DOM
	  this.parent.element.removeChild( this.holder );
	};

	PageDots.prototype.setDots = function() {
	  // get difference between number of slides and number of dots
	  var delta = this.parent.slides.length - this.dots.length;
	  if ( delta > 0 ) {
	    this.addDots( delta );
	  } else if ( delta < 0 ) {
	    this.removeDots( -delta );
	  }
	};

	PageDots.prototype.addDots = function( count ) {
	  var fragment = document.createDocumentFragment();
	  var newDots = [];
	  var length = this.dots.length;
	  var max = length + count;

	  for ( var i = length; i < max; i++ ) {
	    var dot = document.createElement('li');
	    dot.className = 'dot';
	    dot.setAttribute( 'aria-label', 'Page dot ' + ( i + 1 ) );
	    fragment.appendChild( dot );
	    newDots.push( dot );
	  }

	  this.holder.appendChild( fragment );
	  this.dots = this.dots.concat( newDots );
	};

	PageDots.prototype.removeDots = function( count ) {
	  // remove from this.dots collection
	  var removeDots = this.dots.splice( this.dots.length - count, count );
	  // remove from DOM
	  removeDots.forEach( function( dot ) {
	    this.holder.removeChild( dot );
	  }, this );
	};

	PageDots.prototype.updateSelected = function() {
	  // remove selected class on previous
	  if ( this.selectedDot ) {
	    this.selectedDot.className = 'dot';
	    this.selectedDot.removeAttribute('aria-current');
	  }
	  // don't proceed if no dots
	  if ( !this.dots.length ) {
	    return;
	  }
	  this.selectedDot = this.dots[ this.parent.selectedIndex ];
	  this.selectedDot.className = 'dot is-selected';
	  this.selectedDot.setAttribute( 'aria-current', 'step' );
	};

	PageDots.prototype.onTap = // old method name, backwards-compatible
	PageDots.prototype.onClick = function( event ) {
	  var target = event.target;
	  // only care about dot clicks
	  if ( target.nodeName != 'LI' ) {
	    return;
	  }

	  this.parent.uiChange();
	  var index = this.dots.indexOf( target );
	  this.parent.select( index );
	};

	PageDots.prototype.destroy = function() {
	  this.deactivate();
	  this.allOff();
	};

	Flickity.PageDots = PageDots;

	// -------------------------- Flickity -------------------------- //

	utils.extend( Flickity.defaults, {
	  pageDots: true,
	} );

	Flickity.createMethods.push('_createPageDots');

	var proto = Flickity.prototype;

	proto._createPageDots = function() {
	  if ( !this.options.pageDots ) {
	    return;
	  }
	  this.pageDots = new PageDots( this );
	  // events
	  this.on( 'activate', this.activatePageDots );
	  this.on( 'select', this.updateSelectedPageDots );
	  this.on( 'cellChange', this.updatePageDots );
	  this.on( 'resize', this.updatePageDots );
	  this.on( 'deactivate', this.deactivatePageDots );
	};

	proto.activatePageDots = function() {
	  this.pageDots.activate();
	};

	proto.updateSelectedPageDots = function() {
	  this.pageDots.updateSelected();
	};

	proto.updatePageDots = function() {
	  this.pageDots.setDots();
	};

	proto.deactivatePageDots = function() {
	  this.pageDots.deactivate();
	};

	// -----  ----- //

	Flickity.PageDots = PageDots;

	return Flickity;

	} ) );
	});

	var player = createCommonjsModule(function (module) {
	// player & autoPlay
	( function( window, factory ) {
	  // universal module definition
	  if (  module.exports ) {
	    // CommonJS
	    module.exports = factory(
	        evEmitter,
	        utils,
	        flickity
	    );
	  } else {
	    // browser global
	    factory(
	        window.EvEmitter,
	        window.fizzyUIUtils,
	        window.Flickity
	    );
	  }

	}( window, function factory( EvEmitter, utils, Flickity ) {

	// -------------------------- Player -------------------------- //

	function Player( parent ) {
	  this.parent = parent;
	  this.state = 'stopped';
	  // visibility change event handler
	  this.onVisibilityChange = this.visibilityChange.bind( this );
	  this.onVisibilityPlay = this.visibilityPlay.bind( this );
	}

	Player.prototype = Object.create( EvEmitter.prototype );

	// start play
	Player.prototype.play = function() {
	  if ( this.state == 'playing' ) {
	    return;
	  }
	  // do not play if page is hidden, start playing when page is visible
	  var isPageHidden = document.hidden;
	  if ( isPageHidden ) {
	    document.addEventListener( 'visibilitychange', this.onVisibilityPlay );
	    return;
	  }

	  this.state = 'playing';
	  // listen to visibility change
	  document.addEventListener( 'visibilitychange', this.onVisibilityChange );
	  // start ticking
	  this.tick();
	};

	Player.prototype.tick = function() {
	  // do not tick if not playing
	  if ( this.state != 'playing' ) {
	    return;
	  }

	  var time = this.parent.options.autoPlay;
	  // default to 3 seconds
	  time = typeof time == 'number' ? time : 3000;
	  var _this = this;
	  // HACK: reset ticks if stopped and started within interval
	  this.clear();
	  this.timeout = setTimeout( function() {
	    _this.parent.next( true );
	    _this.tick();
	  }, time );
	};

	Player.prototype.stop = function() {
	  this.state = 'stopped';
	  this.clear();
	  // remove visibility change event
	  document.removeEventListener( 'visibilitychange', this.onVisibilityChange );
	};

	Player.prototype.clear = function() {
	  clearTimeout( this.timeout );
	};

	Player.prototype.pause = function() {
	  if ( this.state == 'playing' ) {
	    this.state = 'paused';
	    this.clear();
	  }
	};

	Player.prototype.unpause = function() {
	  // re-start play if paused
	  if ( this.state == 'paused' ) {
	    this.play();
	  }
	};

	// pause if page visibility is hidden, unpause if visible
	Player.prototype.visibilityChange = function() {
	  var isPageHidden = document.hidden;
	  this[ isPageHidden ? 'pause' : 'unpause' ]();
	};

	Player.prototype.visibilityPlay = function() {
	  this.play();
	  document.removeEventListener( 'visibilitychange', this.onVisibilityPlay );
	};

	// -------------------------- Flickity -------------------------- //

	utils.extend( Flickity.defaults, {
	  pauseAutoPlayOnHover: true,
	} );

	Flickity.createMethods.push('_createPlayer');
	var proto = Flickity.prototype;

	proto._createPlayer = function() {
	  this.player = new Player( this );

	  this.on( 'activate', this.activatePlayer );
	  this.on( 'uiChange', this.stopPlayer );
	  this.on( 'pointerDown', this.stopPlayer );
	  this.on( 'deactivate', this.deactivatePlayer );
	};

	proto.activatePlayer = function() {
	  if ( !this.options.autoPlay ) {
	    return;
	  }
	  this.player.play();
	  this.element.addEventListener( 'mouseenter', this );
	};

	// Player API, don't hate the ... thanks I know where the door is

	proto.playPlayer = function() {
	  this.player.play();
	};

	proto.stopPlayer = function() {
	  this.player.stop();
	};

	proto.pausePlayer = function() {
	  this.player.pause();
	};

	proto.unpausePlayer = function() {
	  this.player.unpause();
	};

	proto.deactivatePlayer = function() {
	  this.player.stop();
	  this.element.removeEventListener( 'mouseenter', this );
	};

	// ----- mouseenter/leave ----- //

	// pause auto-play on hover
	proto.onmouseenter = function() {
	  if ( !this.options.pauseAutoPlayOnHover ) {
	    return;
	  }
	  this.player.pause();
	  this.element.addEventListener( 'mouseleave', this );
	};

	// resume auto-play on hover off
	proto.onmouseleave = function() {
	  this.player.unpause();
	  this.element.removeEventListener( 'mouseleave', this );
	};

	// -----  ----- //

	Flickity.Player = Player;

	return Flickity;

	} ) );
	});

	var addRemoveCell = createCommonjsModule(function (module) {
	// add, remove cell
	( function( window, factory ) {
	  // universal module definition
	  if (  module.exports ) {
	    // CommonJS
	    module.exports = factory(
	        window,
	        flickity,
	        utils
	    );
	  } else {
	    // browser global
	    factory(
	        window,
	        window.Flickity,
	        window.fizzyUIUtils
	    );
	  }

	}( window, function factory( window, Flickity, utils ) {

	// append cells to a document fragment
	function getCellsFragment( cells ) {
	  var fragment = document.createDocumentFragment();
	  cells.forEach( function( cell ) {
	    fragment.appendChild( cell.element );
	  } );
	  return fragment;
	}

	// -------------------------- add/remove cell prototype -------------------------- //

	var proto = Flickity.prototype;

	/**
	 * Insert, prepend, or append cells
	 * @param {[Element, Array, NodeList]} elems - Elements to insert
	 * @param {Integer} index - Zero-based number to insert
	 */
	proto.insert = function( elems, index ) {
	  var cells = this._makeCells( elems );
	  if ( !cells || !cells.length ) {
	    return;
	  }
	  var len = this.cells.length;
	  // default to append
	  index = index === undefined ? len : index;
	  // add cells with document fragment
	  var fragment = getCellsFragment( cells );
	  // append to slider
	  var isAppend = index == len;
	  if ( isAppend ) {
	    this.slider.appendChild( fragment );
	  } else {
	    var insertCellElement = this.cells[ index ].element;
	    this.slider.insertBefore( fragment, insertCellElement );
	  }
	  // add to this.cells
	  if ( index === 0 ) {
	    // prepend, add to start
	    this.cells = cells.concat( this.cells );
	  } else if ( isAppend ) {
	    // append, add to end
	    this.cells = this.cells.concat( cells );
	  } else {
	    // insert in this.cells
	    var endCells = this.cells.splice( index, len - index );
	    this.cells = this.cells.concat( cells ).concat( endCells );
	  }

	  this._sizeCells( cells );
	  this.cellChange( index, true );
	};

	proto.append = function( elems ) {
	  this.insert( elems, this.cells.length );
	};

	proto.prepend = function( elems ) {
	  this.insert( elems, 0 );
	};

	/**
	 * Remove cells
	 * @param {[Element, Array, NodeList]} elems - ELements to remove
	 */
	proto.remove = function( elems ) {
	  var cells = this.getCells( elems );
	  if ( !cells || !cells.length ) {
	    return;
	  }

	  var minCellIndex = this.cells.length - 1;
	  // remove cells from collection & DOM
	  cells.forEach( function( cell ) {
	    cell.remove();
	    var index = this.cells.indexOf( cell );
	    minCellIndex = Math.min( index, minCellIndex );
	    utils.removeFrom( this.cells, cell );
	  }, this );

	  this.cellChange( minCellIndex, true );
	};

	/**
	 * logic to be run after a cell's size changes
	 * @param {Element} elem - cell's element
	 */
	proto.cellSizeChange = function( elem ) {
	  var cell = this.getCell( elem );
	  if ( !cell ) {
	    return;
	  }
	  cell.getSize();

	  var index = this.cells.indexOf( cell );
	  this.cellChange( index );
	};

	/**
	 * logic any time a cell is changed: added, removed, or size changed
	 * @param {Integer} changedCellIndex - index of the changed cell, optional
	 * @param {Boolean} isPositioningSlider - Positions slider after selection
	 */
	proto.cellChange = function( changedCellIndex, isPositioningSlider ) {
	  var prevSelectedElem = this.selectedElement;
	  this._positionCells( changedCellIndex );
	  this._getWrapShiftCells();
	  this.setGallerySize();
	  // update selectedIndex
	  // try to maintain position & select previous selected element
	  var cell = this.getCell( prevSelectedElem );
	  if ( cell ) {
	    this.selectedIndex = this.getCellSlideIndex( cell );
	  }
	  this.selectedIndex = Math.min( this.slides.length - 1, this.selectedIndex );

	  this.emitEvent( 'cellChange', [ changedCellIndex ] );
	  // position slider
	  this.select( this.selectedIndex );
	  // do not position slider after lazy load
	  if ( isPositioningSlider ) {
	    this.positionSliderAtSelected();
	  }
	};

	// -----  ----- //

	return Flickity;

	} ) );
	});

	var lazyload = createCommonjsModule(function (module) {
	// lazyload
	( function( window, factory ) {
	  // universal module definition
	  if (  module.exports ) {
	    // CommonJS
	    module.exports = factory(
	        window,
	        flickity,
	        utils
	    );
	  } else {
	    // browser global
	    factory(
	        window,
	        window.Flickity,
	        window.fizzyUIUtils
	    );
	  }

	}( window, function factory( window, Flickity, utils ) {

	Flickity.createMethods.push('_createLazyload');
	var proto = Flickity.prototype;

	proto._createLazyload = function() {
	  this.on( 'select', this.lazyLoad );
	};

	proto.lazyLoad = function() {
	  var lazyLoad = this.options.lazyLoad;
	  if ( !lazyLoad ) {
	    return;
	  }
	  // get adjacent cells, use lazyLoad option for adjacent count
	  var adjCount = typeof lazyLoad == 'number' ? lazyLoad : 0;
	  var cellElems = this.getAdjacentCellElements( adjCount );
	  // get lazy images in those cells
	  var lazyImages = [];
	  cellElems.forEach( function( cellElem ) {
	    var lazyCellImages = getCellLazyImages( cellElem );
	    lazyImages = lazyImages.concat( lazyCellImages );
	  } );
	  // load lazy images
	  lazyImages.forEach( function( img ) {
	    new LazyLoader( img, this );
	  }, this );
	};

	function getCellLazyImages( cellElem ) {
	  // check if cell element is lazy image
	  if ( cellElem.nodeName == 'IMG' ) {
	    var lazyloadAttr = cellElem.getAttribute('data-flickity-lazyload');
	    var srcAttr = cellElem.getAttribute('data-flickity-lazyload-src');
	    var srcsetAttr = cellElem.getAttribute('data-flickity-lazyload-srcset');
	    if ( lazyloadAttr || srcAttr || srcsetAttr ) {
	      return [ cellElem ];
	    }
	  }
	  // select lazy images in cell
	  var lazySelector = 'img[data-flickity-lazyload], ' +
	    'img[data-flickity-lazyload-src], img[data-flickity-lazyload-srcset]';
	  var imgs = cellElem.querySelectorAll( lazySelector );
	  return utils.makeArray( imgs );
	}

	// -------------------------- LazyLoader -------------------------- //

	/**
	 * class to handle loading images
	 * @param {Image} img - Image element
	 * @param {Flickity} flickity - Flickity instance
	 */
	function LazyLoader( img, flickity ) {
	  this.img = img;
	  this.flickity = flickity;
	  this.load();
	}

	LazyLoader.prototype.handleEvent = utils.handleEvent;

	LazyLoader.prototype.load = function() {
	  this.img.addEventListener( 'load', this );
	  this.img.addEventListener( 'error', this );
	  // get src & srcset
	  var src = this.img.getAttribute('data-flickity-lazyload') ||
	    this.img.getAttribute('data-flickity-lazyload-src');
	  var srcset = this.img.getAttribute('data-flickity-lazyload-srcset');
	  // set src & serset
	  this.img.src = src;
	  if ( srcset ) {
	    this.img.setAttribute( 'srcset', srcset );
	  }
	  // remove attr
	  this.img.removeAttribute('data-flickity-lazyload');
	  this.img.removeAttribute('data-flickity-lazyload-src');
	  this.img.removeAttribute('data-flickity-lazyload-srcset');
	};

	LazyLoader.prototype.onload = function( event ) {
	  this.complete( event, 'flickity-lazyloaded' );
	};

	LazyLoader.prototype.onerror = function( event ) {
	  this.complete( event, 'flickity-lazyerror' );
	};

	LazyLoader.prototype.complete = function( event, className ) {
	  // unbind events
	  this.img.removeEventListener( 'load', this );
	  this.img.removeEventListener( 'error', this );

	  var cell = this.flickity.getParentCell( this.img );
	  var cellElem = cell && cell.element;
	  this.flickity.cellSizeChange( cellElem );

	  this.img.classList.add( className );
	  this.flickity.dispatchEvent( 'lazyLoad', event, cellElem );
	};

	// -----  ----- //

	Flickity.LazyLoader = LazyLoader;

	return Flickity;

	} ) );
	});

	var js = createCommonjsModule(function (module) {
	/*!
	 * Flickity v2.2.2
	 * Touch, responsive, flickable carousels
	 *
	 * Licensed GPLv3 for open source use
	 * or Flickity Commercial License for commercial use
	 *
	 * https://flickity.metafizzy.co
	 * Copyright 2015-2021 Metafizzy
	 */

	( function( window, factory ) {
	  // universal module definition
	  if (  module.exports ) {
	    // CommonJS
	    module.exports = factory(
	        flickity,
	        drag,
	        prevNextButton,
	        pageDots,
	        player,
	        addRemoveCell,
	        lazyload
	    );
	  }

	} )( window, function factory( Flickity ) {
	  return Flickity;
	} );
	});

	var imagesloaded = createCommonjsModule(function (module) {
	/*!
	 * imagesLoaded v4.1.4
	 * JavaScript is all like "You images are done yet or what?"
	 * MIT License
	 */

	( function( window, factory ) {  // universal module definition

	  /*global define: false, module: false, require: false */

	  if (  module.exports ) {
	    // CommonJS
	    module.exports = factory(
	      window,
	      evEmitter
	    );
	  } else {
	    // browser global
	    window.imagesLoaded = factory(
	      window,
	      window.EvEmitter
	    );
	  }

	})( typeof window !== 'undefined' ? window : commonjsGlobal,

	// --------------------------  factory -------------------------- //

	function factory( window, EvEmitter ) {

	var $ = window.jQuery;
	var console = window.console;

	// -------------------------- helpers -------------------------- //

	// extend objects
	function extend( a, b ) {
	  for ( var prop in b ) {
	    a[ prop ] = b[ prop ];
	  }
	  return a;
	}

	var arraySlice = Array.prototype.slice;

	// turn element or nodeList into an array
	function makeArray( obj ) {
	  if ( Array.isArray( obj ) ) {
	    // use object if already an array
	    return obj;
	  }

	  var isArrayLike = typeof obj == 'object' && typeof obj.length == 'number';
	  if ( isArrayLike ) {
	    // convert nodeList to array
	    return arraySlice.call( obj );
	  }

	  // array of single index
	  return [ obj ];
	}

	// -------------------------- imagesLoaded -------------------------- //

	/**
	 * @param {Array, Element, NodeList, String} elem
	 * @param {Object or Function} options - if function, use as callback
	 * @param {Function} onAlways - callback function
	 */
	function ImagesLoaded( elem, options, onAlways ) {
	  // coerce ImagesLoaded() without new, to be new ImagesLoaded()
	  if ( !( this instanceof ImagesLoaded ) ) {
	    return new ImagesLoaded( elem, options, onAlways );
	  }
	  // use elem as selector string
	  var queryElem = elem;
	  if ( typeof elem == 'string' ) {
	    queryElem = document.querySelectorAll( elem );
	  }
	  // bail if bad element
	  if ( !queryElem ) {
	    console.error( 'Bad element for imagesLoaded ' + ( queryElem || elem ) );
	    return;
	  }

	  this.elements = makeArray( queryElem );
	  this.options = extend( {}, this.options );
	  // shift arguments if no options set
	  if ( typeof options == 'function' ) {
	    onAlways = options;
	  } else {
	    extend( this.options, options );
	  }

	  if ( onAlways ) {
	    this.on( 'always', onAlways );
	  }

	  this.getImages();

	  if ( $ ) {
	    // add jQuery Deferred object
	    this.jqDeferred = new $.Deferred();
	  }

	  // HACK check async to allow time to bind listeners
	  setTimeout( this.check.bind( this ) );
	}

	ImagesLoaded.prototype = Object.create( EvEmitter.prototype );

	ImagesLoaded.prototype.options = {};

	ImagesLoaded.prototype.getImages = function() {
	  this.images = [];

	  // filter & find items if we have an item selector
	  this.elements.forEach( this.addElementImages, this );
	};

	/**
	 * @param {Node} element
	 */
	ImagesLoaded.prototype.addElementImages = function( elem ) {
	  // filter siblings
	  if ( elem.nodeName == 'IMG' ) {
	    this.addImage( elem );
	  }
	  // get background image on element
	  if ( this.options.background === true ) {
	    this.addElementBackgroundImages( elem );
	  }

	  // find children
	  // no non-element nodes, #143
	  var nodeType = elem.nodeType;
	  if ( !nodeType || !elementNodeTypes[ nodeType ] ) {
	    return;
	  }
	  var childImgs = elem.querySelectorAll('img');
	  // concat childElems to filterFound array
	  for ( var i=0; i < childImgs.length; i++ ) {
	    var img = childImgs[i];
	    this.addImage( img );
	  }

	  // get child background images
	  if ( typeof this.options.background == 'string' ) {
	    var children = elem.querySelectorAll( this.options.background );
	    for ( i=0; i < children.length; i++ ) {
	      var child = children[i];
	      this.addElementBackgroundImages( child );
	    }
	  }
	};

	var elementNodeTypes = {
	  1: true,
	  9: true,
	  11: true
	};

	ImagesLoaded.prototype.addElementBackgroundImages = function( elem ) {
	  var style = getComputedStyle( elem );
	  if ( !style ) {
	    // Firefox returns null if in a hidden iframe https://bugzil.la/548397
	    return;
	  }
	  // get url inside url("...")
	  var reURL = /url\((['"])?(.*?)\1\)/gi;
	  var matches = reURL.exec( style.backgroundImage );
	  while ( matches !== null ) {
	    var url = matches && matches[2];
	    if ( url ) {
	      this.addBackground( url, elem );
	    }
	    matches = reURL.exec( style.backgroundImage );
	  }
	};

	/**
	 * @param {Image} img
	 */
	ImagesLoaded.prototype.addImage = function( img ) {
	  var loadingImage = new LoadingImage( img );
	  this.images.push( loadingImage );
	};

	ImagesLoaded.prototype.addBackground = function( url, elem ) {
	  var background = new Background( url, elem );
	  this.images.push( background );
	};

	ImagesLoaded.prototype.check = function() {
	  var _this = this;
	  this.progressedCount = 0;
	  this.hasAnyBroken = false;
	  // complete if no images
	  if ( !this.images.length ) {
	    this.complete();
	    return;
	  }

	  function onProgress( image, elem, message ) {
	    // HACK - Chrome triggers event before object properties have changed. #83
	    setTimeout( function() {
	      _this.progress( image, elem, message );
	    });
	  }

	  this.images.forEach( function( loadingImage ) {
	    loadingImage.once( 'progress', onProgress );
	    loadingImage.check();
	  });
	};

	ImagesLoaded.prototype.progress = function( image, elem, message ) {
	  this.progressedCount++;
	  this.hasAnyBroken = this.hasAnyBroken || !image.isLoaded;
	  // progress event
	  this.emitEvent( 'progress', [ this, image, elem ] );
	  if ( this.jqDeferred && this.jqDeferred.notify ) {
	    this.jqDeferred.notify( this, image );
	  }
	  // check if completed
	  if ( this.progressedCount == this.images.length ) {
	    this.complete();
	  }

	  if ( this.options.debug && console ) {
	    console.log( 'progress: ' + message, image, elem );
	  }
	};

	ImagesLoaded.prototype.complete = function() {
	  var eventName = this.hasAnyBroken ? 'fail' : 'done';
	  this.isComplete = true;
	  this.emitEvent( eventName, [ this ] );
	  this.emitEvent( 'always', [ this ] );
	  if ( this.jqDeferred ) {
	    var jqMethod = this.hasAnyBroken ? 'reject' : 'resolve';
	    this.jqDeferred[ jqMethod ]( this );
	  }
	};

	// --------------------------  -------------------------- //

	function LoadingImage( img ) {
	  this.img = img;
	}

	LoadingImage.prototype = Object.create( EvEmitter.prototype );

	LoadingImage.prototype.check = function() {
	  // If complete is true and browser supports natural sizes,
	  // try to check for image status manually.
	  var isComplete = this.getIsImageComplete();
	  if ( isComplete ) {
	    // report based on naturalWidth
	    this.confirm( this.img.naturalWidth !== 0, 'naturalWidth' );
	    return;
	  }

	  // If none of the checks above matched, simulate loading on detached element.
	  this.proxyImage = new Image();
	  this.proxyImage.addEventListener( 'load', this );
	  this.proxyImage.addEventListener( 'error', this );
	  // bind to image as well for Firefox. #191
	  this.img.addEventListener( 'load', this );
	  this.img.addEventListener( 'error', this );
	  this.proxyImage.src = this.img.src;
	};

	LoadingImage.prototype.getIsImageComplete = function() {
	  // check for non-zero, non-undefined naturalWidth
	  // fixes Safari+InfiniteScroll+Masonry bug infinite-scroll#671
	  return this.img.complete && this.img.naturalWidth;
	};

	LoadingImage.prototype.confirm = function( isLoaded, message ) {
	  this.isLoaded = isLoaded;
	  this.emitEvent( 'progress', [ this, this.img, message ] );
	};

	// ----- events ----- //

	// trigger specified handler for event type
	LoadingImage.prototype.handleEvent = function( event ) {
	  var method = 'on' + event.type;
	  if ( this[ method ] ) {
	    this[ method ]( event );
	  }
	};

	LoadingImage.prototype.onload = function() {
	  this.confirm( true, 'onload' );
	  this.unbindEvents();
	};

	LoadingImage.prototype.onerror = function() {
	  this.confirm( false, 'onerror' );
	  this.unbindEvents();
	};

	LoadingImage.prototype.unbindEvents = function() {
	  this.proxyImage.removeEventListener( 'load', this );
	  this.proxyImage.removeEventListener( 'error', this );
	  this.img.removeEventListener( 'load', this );
	  this.img.removeEventListener( 'error', this );
	};

	// -------------------------- Background -------------------------- //

	function Background( url, element ) {
	  this.url = url;
	  this.element = element;
	  this.img = new Image();
	}

	// inherit LoadingImage prototype
	Background.prototype = Object.create( LoadingImage.prototype );

	Background.prototype.check = function() {
	  this.img.addEventListener( 'load', this );
	  this.img.addEventListener( 'error', this );
	  this.img.src = this.url;
	  // check if image is already complete
	  var isComplete = this.getIsImageComplete();
	  if ( isComplete ) {
	    this.confirm( this.img.naturalWidth !== 0, 'naturalWidth' );
	    this.unbindEvents();
	  }
	};

	Background.prototype.unbindEvents = function() {
	  this.img.removeEventListener( 'load', this );
	  this.img.removeEventListener( 'error', this );
	};

	Background.prototype.confirm = function( isLoaded, message ) {
	  this.isLoaded = isLoaded;
	  this.emitEvent( 'progress', [ this, this.element, message ] );
	};

	// -------------------------- jQuery -------------------------- //

	ImagesLoaded.makeJQueryPlugin = function( jQuery ) {
	  jQuery = jQuery || window.jQuery;
	  if ( !jQuery ) {
	    return;
	  }
	  // set local variable
	  $ = jQuery;
	  // $().imagesLoaded()
	  $.fn.imagesLoaded = function( options, callback ) {
	    var instance = new ImagesLoaded( this, options, callback );
	    return instance.jqDeferred.promise( $(this) );
	  };
	};
	// try making plugin
	ImagesLoaded.makeJQueryPlugin();

	// --------------------------  -------------------------- //

	return ImagesLoaded;

	});
	});

	var flickityImagesloaded = createCommonjsModule(function (module) {
	/*!
	 * Flickity imagesLoaded v2.0.0
	 * enables imagesLoaded option for Flickity
	 */

	/*jshint browser: true, strict: true, undef: true, unused: true */

	( function( window, factory ) {
	  // universal module definition
	  /*jshint strict: false */ /*globals define, module, require */
	  if (  module.exports ) {
	    // CommonJS
	    module.exports = factory(
	      window,
	      js,
	      imagesloaded
	    );
	  } else {
	    // browser global
	    window.Flickity = factory(
	      window,
	      window.Flickity,
	      window.imagesLoaded
	    );
	  }

	}( window, function factory( window, Flickity, imagesLoaded ) {

	Flickity.createMethods.push('_createImagesLoaded');

	var proto = Flickity.prototype;

	proto._createImagesLoaded = function() {
	  this.on( 'activate', this.imagesLoaded );
	};

	proto.imagesLoaded = function() {
	  if ( !this.options.imagesLoaded ) {
	    return;
	  }
	  var _this = this;
	  function onImagesLoadedProgress( instance, image ) {
	    var cell = _this.getParentCell( image.img );
	    _this.cellSizeChange( cell && cell.element );
	    if ( !_this.options.freeScroll ) {
	      _this.positionSliderAtSelected();
	    }
	  }
	  imagesLoaded( this.slider ).on( 'progress', onImagesLoadedProgress );
	};

	return Flickity;

	}));
	});

	function _toConsumableArray$1(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

	// Older browsers don't support event options, feature detect it.

	// Adopted and modified solution from Bohdan Didukh (2017)
	// https://stackoverflow.com/questions/41594997/ios-10-safari-prevent-scrolling-behind-a-fixed-overlay-and-maintain-scroll-posi

	var hasPassiveEvents = false;
	if (typeof window !== 'undefined') {
	  var passiveTestOptions = {
	    get passive() {
	      hasPassiveEvents = true;
	      return undefined;
	    }
	  };
	  window.addEventListener('testPassive', null, passiveTestOptions);
	  window.removeEventListener('testPassive', null, passiveTestOptions);
	}

	var isIosDevice = typeof window !== 'undefined' && window.navigator && window.navigator.platform && (/iP(ad|hone|od)/.test(window.navigator.platform) || window.navigator.platform === 'MacIntel' && window.navigator.maxTouchPoints > 1);


	var locks = [];
	var documentListenerAdded = false;
	var initialClientY = -1;
	var previousBodyOverflowSetting = void 0;
	var previousBodyPaddingRight = void 0;

	// returns true if `el` should be allowed to receive touchmove events.
	var allowTouchMove = function allowTouchMove(el) {
	  return locks.some(function (lock) {
	    if (lock.options.allowTouchMove && lock.options.allowTouchMove(el)) {
	      return true;
	    }

	    return false;
	  });
	};

	var preventDefault = function preventDefault(rawEvent) {
	  var e = rawEvent || window.event;

	  // For the case whereby consumers adds a touchmove event listener to document.
	  // Recall that we do document.addEventListener('touchmove', preventDefault, { passive: false })
	  // in disableBodyScroll - so if we provide this opportunity to allowTouchMove, then
	  // the touchmove event on document will break.
	  if (allowTouchMove(e.target)) {
	    return true;
	  }

	  // Do not prevent if the event has more than one touch (usually meaning this is a multi touch gesture like pinch to zoom).
	  if (e.touches.length > 1) return true;

	  if (e.preventDefault) e.preventDefault();

	  return false;
	};

	var setOverflowHidden = function setOverflowHidden(options) {
	  // If previousBodyPaddingRight is already set, don't set it again.
	  if (previousBodyPaddingRight === undefined) {
	    var _reserveScrollBarGap = !!options && options.reserveScrollBarGap === true;
	    var scrollBarGap = window.innerWidth - document.documentElement.clientWidth;

	    if (_reserveScrollBarGap && scrollBarGap > 0) {
	      previousBodyPaddingRight = document.body.style.paddingRight;
	      document.body.style.paddingRight = scrollBarGap + 'px';
	    }
	  }

	  // If previousBodyOverflowSetting is already set, don't set it again.
	  if (previousBodyOverflowSetting === undefined) {
	    previousBodyOverflowSetting = document.body.style.overflow;
	    document.body.style.overflow = 'hidden';
	  }
	};

	var restoreOverflowSetting = function restoreOverflowSetting() {
	  if (previousBodyPaddingRight !== undefined) {
	    document.body.style.paddingRight = previousBodyPaddingRight;

	    // Restore previousBodyPaddingRight to undefined so setOverflowHidden knows it
	    // can be set again.
	    previousBodyPaddingRight = undefined;
	  }

	  if (previousBodyOverflowSetting !== undefined) {
	    document.body.style.overflow = previousBodyOverflowSetting;

	    // Restore previousBodyOverflowSetting to undefined
	    // so setOverflowHidden knows it can be set again.
	    previousBodyOverflowSetting = undefined;
	  }
	};

	// https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollHeight#Problems_and_solutions
	var isTargetElementTotallyScrolled = function isTargetElementTotallyScrolled(targetElement) {
	  return targetElement ? targetElement.scrollHeight - targetElement.scrollTop <= targetElement.clientHeight : false;
	};

	var handleScroll = function handleScroll(event, targetElement) {
	  var clientY = event.targetTouches[0].clientY - initialClientY;

	  if (allowTouchMove(event.target)) {
	    return false;
	  }

	  if (targetElement && targetElement.scrollTop === 0 && clientY > 0) {
	    // element is at the top of its scroll.
	    return preventDefault(event);
	  }

	  if (isTargetElementTotallyScrolled(targetElement) && clientY < 0) {
	    // element is at the bottom of its scroll.
	    return preventDefault(event);
	  }

	  event.stopPropagation();
	  return true;
	};

	var disableBodyScroll = function disableBodyScroll(targetElement, options) {
	  // targetElement must be provided
	  if (!targetElement) {
	    // eslint-disable-next-line no-console
	    console.error('disableBodyScroll unsuccessful - targetElement must be provided when calling disableBodyScroll on IOS devices.');
	    return;
	  }

	  // disableBodyScroll must not have been called on this targetElement before
	  if (locks.some(function (lock) {
	    return lock.targetElement === targetElement;
	  })) {
	    return;
	  }

	  var lock = {
	    targetElement: targetElement,
	    options: options || {}
	  };

	  locks = [].concat(_toConsumableArray$1(locks), [lock]);

	  if (isIosDevice) {
	    targetElement.ontouchstart = function (event) {
	      if (event.targetTouches.length === 1) {
	        // detect single touch.
	        initialClientY = event.targetTouches[0].clientY;
	      }
	    };
	    targetElement.ontouchmove = function (event) {
	      if (event.targetTouches.length === 1) {
	        // detect single touch.
	        handleScroll(event, targetElement);
	      }
	    };

	    if (!documentListenerAdded) {
	      document.addEventListener('touchmove', preventDefault, hasPassiveEvents ? { passive: false } : undefined);
	      documentListenerAdded = true;
	    }
	  } else {
	    setOverflowHidden(options);
	  }
	};

	var enableBodyScroll = function enableBodyScroll(targetElement) {
	  if (!targetElement) {
	    // eslint-disable-next-line no-console
	    console.error('enableBodyScroll unsuccessful - targetElement must be provided when calling enableBodyScroll on IOS devices.');
	    return;
	  }

	  locks = locks.filter(function (lock) {
	    return lock.targetElement !== targetElement;
	  });

	  if (isIosDevice) {
	    targetElement.ontouchstart = null;
	    targetElement.ontouchmove = null;

	    if (documentListenerAdded && locks.length === 0) {
	      document.removeEventListener('touchmove', preventDefault, hasPassiveEvents ? { passive: false } : undefined);
	      documentListenerAdded = false;
	    }
	  } else if (!locks.length) {
	    restoreOverflowSetting();
	  }
	};

	var burger = document.querySelector('.hamburger');
	var nav_target = document.querySelector('.main-navigation');

	var toggleResponsiveMenu = function toggleResponsiveMenu() {
	  var IS_NAV_OPEN = document.body.classList.contains('nav-is-open');

	  if (IS_NAV_OPEN) {
	    floatingNav.closeNav();
	  } else {
	    floatingNav.openNav();
	  }
	};

	var floatingNav = {
	  openNav: function openNav() {
	    document.body.classList.add('nav-is-open');
	    disableBodyScroll(nav_target);
	  },
	  closeNav: function closeNav() {
	    document.body.classList.remove('nav-is-open');
	    enableBodyScroll(nav_target);
	  }
	};

	var init = function init() {
	  burger.addEventListener('click', function () {
	    return toggleResponsiveMenu();
	  });
	};

	var Nav = {
	  init: init
	};

	var aPossiblePrototype = function (it) {
	  if (!isObject(it) && it !== null) {
	    throw TypeError("Can't set " + String(it) + ' as a prototype');
	  } return it;
	};

	// `Object.setPrototypeOf` method
	// https://tc39.es/ecma262/#sec-object.setprototypeof
	// Works with __proto__ only. Old v8 can't work with null proto objects.
	/* eslint-disable no-proto */
	var objectSetPrototypeOf = Object.setPrototypeOf || ('__proto__' in {} ? function () {
	  var CORRECT_SETTER = false;
	  var test = {};
	  var setter;
	  try {
	    setter = Object.getOwnPropertyDescriptor(Object.prototype, '__proto__').set;
	    setter.call(test, []);
	    CORRECT_SETTER = test instanceof Array;
	  } catch (error) { /* empty */ }
	  return function setPrototypeOf(O, proto) {
	    anObject(O);
	    aPossiblePrototype(proto);
	    if (CORRECT_SETTER) setter.call(O, proto);
	    else O.__proto__ = proto;
	    return O;
	  };
	}() : undefined);

	// makes subclassing work correct for wrapped built-ins
	var inheritIfRequired = function ($this, dummy, Wrapper) {
	  var NewTarget, NewTargetPrototype;
	  if (
	    // it can work only with native `setPrototypeOf`
	    objectSetPrototypeOf &&
	    // we haven't completely correct pre-ES6 way for getting `new.target`, so use this
	    typeof (NewTarget = dummy.constructor) == 'function' &&
	    NewTarget !== Wrapper &&
	    isObject(NewTargetPrototype = NewTarget.prototype) &&
	    NewTargetPrototype !== Wrapper.prototype
	  ) objectSetPrototypeOf($this, NewTargetPrototype);
	  return $this;
	};

	// `Object.keys` method
	// https://tc39.es/ecma262/#sec-object.keys
	var objectKeys = Object.keys || function keys(O) {
	  return objectKeysInternal(O, enumBugKeys);
	};

	// `Object.defineProperties` method
	// https://tc39.es/ecma262/#sec-object.defineproperties
	var objectDefineProperties = descriptors ? Object.defineProperties : function defineProperties(O, Properties) {
	  anObject(O);
	  var keys = objectKeys(Properties);
	  var length = keys.length;
	  var index = 0;
	  var key;
	  while (length > index) objectDefineProperty.f(O, key = keys[index++], Properties[key]);
	  return O;
	};

	var html = getBuiltIn('document', 'documentElement');

	var GT = '>';
	var LT = '<';
	var PROTOTYPE = 'prototype';
	var SCRIPT = 'script';
	var IE_PROTO = sharedKey('IE_PROTO');

	var EmptyConstructor = function () { /* empty */ };

	var scriptTag = function (content) {
	  return LT + SCRIPT + GT + content + LT + '/' + SCRIPT + GT;
	};

	// Create object with fake `null` prototype: use ActiveX Object with cleared prototype
	var NullProtoObjectViaActiveX = function (activeXDocument) {
	  activeXDocument.write(scriptTag(''));
	  activeXDocument.close();
	  var temp = activeXDocument.parentWindow.Object;
	  activeXDocument = null; // avoid memory leak
	  return temp;
	};

	// Create object with fake `null` prototype: use iframe Object with cleared prototype
	var NullProtoObjectViaIFrame = function () {
	  // Thrash, waste and sodomy: IE GC bug
	  var iframe = documentCreateElement('iframe');
	  var JS = 'java' + SCRIPT + ':';
	  var iframeDocument;
	  iframe.style.display = 'none';
	  html.appendChild(iframe);
	  // https://github.com/zloirock/core-js/issues/475
	  iframe.src = String(JS);
	  iframeDocument = iframe.contentWindow.document;
	  iframeDocument.open();
	  iframeDocument.write(scriptTag('document.F=Object'));
	  iframeDocument.close();
	  return iframeDocument.F;
	};

	// Check for document.domain and active x support
	// No need to use active x approach when document.domain is not set
	// see https://github.com/es-shims/es5-shim/issues/150
	// variation of https://github.com/kitcambridge/es5-shim/commit/4f738ac066346
	// avoid IE GC bug
	var activeXDocument;
	var NullProtoObject = function () {
	  try {
	    /* global ActiveXObject */
	    activeXDocument = document.domain && new ActiveXObject('htmlfile');
	  } catch (error) { /* ignore */ }
	  NullProtoObject = activeXDocument ? NullProtoObjectViaActiveX(activeXDocument) : NullProtoObjectViaIFrame();
	  var length = enumBugKeys.length;
	  while (length--) delete NullProtoObject[PROTOTYPE][enumBugKeys[length]];
	  return NullProtoObject();
	};

	hiddenKeys[IE_PROTO] = true;

	// `Object.create` method
	// https://tc39.es/ecma262/#sec-object.create
	var objectCreate = Object.create || function create(O, Properties) {
	  var result;
	  if (O !== null) {
	    EmptyConstructor[PROTOTYPE] = anObject(O);
	    result = new EmptyConstructor();
	    EmptyConstructor[PROTOTYPE] = null;
	    // add "__proto__" for Object.getPrototypeOf polyfill
	    result[IE_PROTO] = O;
	  } else result = NullProtoObject();
	  return Properties === undefined ? result : objectDefineProperties(result, Properties);
	};

	// a string of all valid unicode whitespaces
	// eslint-disable-next-line max-len
	var whitespaces = '\u0009\u000A\u000B\u000C\u000D\u0020\u00A0\u1680\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200A\u202F\u205F\u3000\u2028\u2029\uFEFF';

	var whitespace = '[' + whitespaces + ']';
	var ltrim = RegExp('^' + whitespace + whitespace + '*');
	var rtrim = RegExp(whitespace + whitespace + '*$');

	// `String.prototype.{ trim, trimStart, trimEnd, trimLeft, trimRight }` methods implementation
	var createMethod$2 = function (TYPE) {
	  return function ($this) {
	    var string = String(requireObjectCoercible($this));
	    if (TYPE & 1) string = string.replace(ltrim, '');
	    if (TYPE & 2) string = string.replace(rtrim, '');
	    return string;
	  };
	};

	var stringTrim = {
	  // `String.prototype.{ trimLeft, trimStart }` methods
	  // https://tc39.es/ecma262/#sec-string.prototype.trimstart
	  start: createMethod$2(1),
	  // `String.prototype.{ trimRight, trimEnd }` methods
	  // https://tc39.es/ecma262/#sec-string.prototype.trimend
	  end: createMethod$2(2),
	  // `String.prototype.trim` method
	  // https://tc39.es/ecma262/#sec-string.prototype.trim
	  trim: createMethod$2(3)
	};

	var getOwnPropertyNames = objectGetOwnPropertyNames.f;
	var getOwnPropertyDescriptor$2 = objectGetOwnPropertyDescriptor.f;
	var defineProperty$1 = objectDefineProperty.f;
	var trim = stringTrim.trim;

	var NUMBER = 'Number';
	var NativeNumber = global_1[NUMBER];
	var NumberPrototype = NativeNumber.prototype;

	// Opera ~12 has broken Object#toString
	var BROKEN_CLASSOF = classofRaw(objectCreate(NumberPrototype)) == NUMBER;

	// `ToNumber` abstract operation
	// https://tc39.es/ecma262/#sec-tonumber
	var toNumber = function (argument) {
	  var it = toPrimitive(argument, false);
	  var first, third, radix, maxCode, digits, length, index, code;
	  if (typeof it == 'string' && it.length > 2) {
	    it = trim(it);
	    first = it.charCodeAt(0);
	    if (first === 43 || first === 45) {
	      third = it.charCodeAt(2);
	      if (third === 88 || third === 120) return NaN; // Number('+0x1') should be NaN, old V8 fix
	    } else if (first === 48) {
	      switch (it.charCodeAt(1)) {
	        case 66: case 98: radix = 2; maxCode = 49; break; // fast equal of /^0b[01]+$/i
	        case 79: case 111: radix = 8; maxCode = 55; break; // fast equal of /^0o[0-7]+$/i
	        default: return +it;
	      }
	      digits = it.slice(2);
	      length = digits.length;
	      for (index = 0; index < length; index++) {
	        code = digits.charCodeAt(index);
	        // parseInt parses a string to a first unavailable symbol
	        // but ToNumber should return NaN if a string contains unavailable symbols
	        if (code < 48 || code > maxCode) return NaN;
	      } return parseInt(digits, radix);
	    }
	  } return +it;
	};

	// `Number` constructor
	// https://tc39.es/ecma262/#sec-number-constructor
	if (isForced_1(NUMBER, !NativeNumber(' 0o1') || !NativeNumber('0b1') || NativeNumber('+0x1'))) {
	  var NumberWrapper = function Number(value) {
	    var it = arguments.length < 1 ? 0 : value;
	    var dummy = this;
	    return dummy instanceof NumberWrapper
	      // check on 1..constructor(foo) case
	      && (BROKEN_CLASSOF ? fails(function () { NumberPrototype.valueOf.call(dummy); }) : classofRaw(dummy) != NUMBER)
	        ? inheritIfRequired(new NativeNumber(toNumber(it)), dummy, NumberWrapper) : toNumber(it);
	  };
	  for (var keys$1 = descriptors ? getOwnPropertyNames(NativeNumber) : (
	    // ES3:
	    'MAX_VALUE,MIN_VALUE,NaN,NEGATIVE_INFINITY,POSITIVE_INFINITY,' +
	    // ES2015 (in case, if modules with ES2015 Number statics required before):
	    'EPSILON,isFinite,isInteger,isNaN,isSafeInteger,MAX_SAFE_INTEGER,' +
	    'MIN_SAFE_INTEGER,parseFloat,parseInt,isInteger,' +
	    // ESNext
	    'fromString,range'
	  ).split(','), j = 0, key; keys$1.length > j; j++) {
	    if (has(NativeNumber, key = keys$1[j]) && !has(NumberWrapper, key)) {
	      defineProperty$1(NumberWrapper, key, getOwnPropertyDescriptor$2(NativeNumber, key));
	    }
	  }
	  NumberWrapper.prototype = NumberPrototype;
	  NumberPrototype.constructor = NumberWrapper;
	  redefine(global_1, NUMBER, NumberWrapper);
	}

	// Google Map set-up fucntions
	var initMap = function initMap(mapId, options, callback) {
	  if (!document.getElementById(mapId)) return;
	  var defaults = {
	    lat: Number(-37.84124),
	    lng: Number(144.938421),
	    style: [{
	      "featureType": "water",
	      "elementType": "geometry",
	      "stylers": [{
	        "color": "#e9e9e9"
	      }, {
	        "lightness": 17
	      }]
	    }, {
	      "featureType": "landscape",
	      "elementType": "geometry",
	      "stylers": [{
	        "color": "#f5f5f5"
	      }, {
	        "lightness": 20
	      }]
	    }, {
	      "featureType": "road.highway",
	      "elementType": "geometry.fill",
	      "stylers": [{
	        "color": "#ffffff"
	      }, {
	        "lightness": 17
	      }]
	    }, {
	      "featureType": "road.highway",
	      "elementType": "geometry.stroke",
	      "stylers": [{
	        "color": "#ffffff"
	      }, {
	        "lightness": 29
	      }, {
	        "weight": 0.2
	      }]
	    }, {
	      "featureType": "road.arterial",
	      "elementType": "geometry",
	      "stylers": [{
	        "color": "#ffffff"
	      }, {
	        "lightness": 18
	      }]
	    }, {
	      "featureType": "road.local",
	      "elementType": "geometry",
	      "stylers": [{
	        "color": "#ffffff"
	      }, {
	        "lightness": 16
	      }]
	    }, {
	      "featureType": "poi",
	      "elementType": "geometry",
	      "stylers": [{
	        "color": "#f5f5f5"
	      }, {
	        "lightness": 21
	      }]
	    }, {
	      "featureType": "poi.park",
	      "elementType": "geometry",
	      "stylers": [{
	        "color": "#dedede"
	      }, {
	        "lightness": 21
	      }]
	    }, {
	      "elementType": "labels.text.stroke",
	      "stylers": [{
	        "visibility": "on"
	      }, {
	        "color": "#ffffff"
	      }, {
	        "lightness": 16
	      }]
	    }, {
	      "elementType": "labels.text.fill",
	      "stylers": [{
	        "saturation": 36
	      }, {
	        "color": "#333333"
	      }, {
	        "lightness": 40
	      }]
	    }, {
	      "elementType": "labels.icon",
	      "stylers": [{
	        "visibility": "off"
	      }]
	    }, {
	      "featureType": "transit",
	      "elementType": "geometry",
	      "stylers": [{
	        "color": "#f2f2f2"
	      }, {
	        "lightness": 19
	      }]
	    }, {
	      "featureType": "administrative",
	      "elementType": "geometry.fill",
	      "stylers": [{
	        "color": "#fefefe"
	      }, {
	        "lightness": 20
	      }]
	    }, {
	      "featureType": "administrative",
	      "elementType": "geometry.stroke",
	      "stylers": [{
	        "color": "#fefefe"
	      }, {
	        "lightness": 17
	      }, {
	        "weight": 1.2
	      }]
	    }],
	    zoom: 14
	  };
	  if (!options) options = defaults;
	  var location = {
	    lat: Number(document.getElementById(mapId).dataset.lat),
	    lng: Number(document.getElementById(mapId).dataset.lng)
	  };

	  if (!location.lat || !location.lng) {
	    location.lat = defaults.lat;
	    location.lng = defaults.lng;
	    console.warn('GMaps element did not have valid "data-lat" or "data-lng" attributes set, using default values...');
	  }

	  var icon = {
	    url: options.icon.img || "".concat(WP.templateUrl, "/images/marker.png"),
	    size: new google.maps.Size(28, 39),
	    anchor: new google.maps.Point(14, 39),
	    scaledSize: new google.maps.Size(28, 39)
	  };
	  var svgIcon = {
	    path: 'M10,26 C3.33333333,19.0152317 0,13.6818983 0,10 C0,4.4771525 4.4771525,0 10,0 C15.5228475,0 20,4.4771525 20,10 C20,13.6818983 16.6666667,19.0152317 10,26 Z M10,14 C12.209139,14 14,12.209139 14,10 C14,7.790861 12.209139,6 10,6 C7.790861,6 6,7.790861 6,10 C6,12.209139 7.790861,14 10,14 Z',
	    fillColor: '#fa0000',
	    anchor: new google.maps.Point(10, 26),
	    fillOpacity: 1,
	    strokeWeight: 0,
	    scale: 1
	  };
	  var map = new google.maps.Map(document.getElementById(mapId), {
	    zoom: options.zoom || defaults.zoom,
	    zoomControl: false,
	    mapTypeControl: false,
	    scaleControl: false,
	    streetViewControl: false,
	    rotateControl: false,
	    fullscreenControl: false,
	    center: location,
	    styles: options.style || defaults.style
	  });
	  var marker = new google.maps.Marker({
	    position: location,
	    map: map,
	    icon: icon
	  });
	  callback(map);
	}; // Handle loading of GMaps script


	var loadScript = function loadScript(url, completeCallback) {
	  var script = document.createElement('script'),
	      done = false,
	      head = document.getElementsByTagName("head")[0];
	  script.src = url;

	  script.onload = script.onreadystatechange = function () {
	    if (!done && (!this.readyState || this.readyState == "loaded" || this.readyState == "complete")) {
	      done = true;
	      if (completeCallback) completeCallback(); // IE memory leak

	      script.onload = script.onreadystatechange = null;
	      head.removeChild(script);
	    }
	  };

	  head.appendChild(script);
	}; // Set up Maps


	var setupGoogleMapsApi = function setupGoogleMapsApi(mapsArray, options) {
	  var mapEl = document.getElementById(mapsArray[0]);

	  if (mapEl) {
	    loadScript('https://maps.googleapis.com/maps/api/js?key=AIzaSyBbfBApLr--vuC2WatrGZtkdA5l-mV42pE', function () {
	      processMaps(mapsArray, options);
	    });
	  }
	}; // Pan Map


	var panMap = function panMap(mapId, options) {
	  initMap(mapId, options, function (map) {
	    map.panBy(0, 0);
	  });
	}; // Process Maps


	var processMaps = function processMaps(mapsArray, options) {
	  if (!Array.isArray(mapsArray)) return console.error('Need to pass an array if Google Map IDs');
	  mapsArray.forEach(function (m) {
	    panMap(m, options);
	  });
	};

	var gmaps = {
	  setupGoogleMapsApi: setupGoogleMapsApi
	};

	/* ============================================================
	  Execution code
	  ============================================================ */
	// Google MAP

	var snazzyStyle = [{
	  featureType: 'all',
	  elementType: 'all',
	  stylers: [{
	    visibility: 'on'
	  }]
	}, {
	  featureType: 'all',
	  elementType: 'labels',
	  stylers: [{
	    visibility: 'off'
	  }, {
	    saturation: '-100'
	  }]
	}, {
	  featureType: 'all',
	  elementType: 'labels.text.fill',
	  stylers: [{
	    saturation: 36
	  }, {
	    color: '#000000'
	  }, {
	    lightness: 40
	  }, {
	    visibility: 'off'
	  }]
	}, {
	  featureType: 'all',
	  elementType: 'labels.text.stroke',
	  stylers: [{
	    visibility: 'off'
	  }, {
	    color: '#000000'
	  }, {
	    lightness: 16
	  }]
	}, {
	  featureType: 'all',
	  elementType: 'labels.icon',
	  stylers: [{
	    visibility: 'off'
	  }]
	}, {
	  featureType: 'administrative',
	  elementType: 'geometry.fill',
	  stylers: [{
	    color: '#000000'
	  }, {
	    lightness: 20
	  }]
	}, {
	  featureType: 'administrative',
	  elementType: 'geometry.stroke',
	  stylers: [{
	    color: '#000000'
	  }, {
	    lightness: 17
	  }, {
	    weight: 1.2
	  }]
	}, {
	  featureType: 'landscape',
	  elementType: 'geometry',
	  stylers: [{
	    color: '#000000'
	  }, {
	    lightness: 20
	  }]
	}, {
	  featureType: 'landscape',
	  elementType: 'geometry.fill',
	  stylers: [{
	    color: '#4d6059'
	  }]
	}, {
	  featureType: 'landscape',
	  elementType: 'geometry.stroke',
	  stylers: [{
	    color: '#4d6059'
	  }]
	}, {
	  featureType: 'landscape.natural',
	  elementType: 'geometry.fill',
	  stylers: [{
	    color: '#4d6059'
	  }]
	}, {
	  featureType: 'poi',
	  elementType: 'geometry',
	  stylers: [{
	    lightness: 21
	  }]
	}, {
	  featureType: 'poi',
	  elementType: 'geometry.fill',
	  stylers: [{
	    color: '#4d6059'
	  }]
	}, {
	  featureType: 'poi',
	  elementType: 'geometry.stroke',
	  stylers: [{
	    color: '#4d6059'
	  }]
	}, {
	  featureType: 'road',
	  elementType: 'geometry',
	  stylers: [{
	    visibility: 'on'
	  }, {
	    color: '#7f8d89'
	  }]
	}, {
	  featureType: 'road',
	  elementType: 'geometry.fill',
	  stylers: [{
	    color: '#7f8d89'
	  }]
	}, {
	  featureType: 'road.highway',
	  elementType: 'geometry.fill',
	  stylers: [{
	    color: '#7f8d89'
	  }, {
	    lightness: 17
	  }]
	}, {
	  featureType: 'road.highway',
	  elementType: 'geometry.stroke',
	  stylers: [{
	    color: '#7f8d89'
	  }, {
	    lightness: 29
	  }, {
	    weight: 0.2
	  }]
	}, {
	  featureType: 'road.arterial',
	  elementType: 'geometry',
	  stylers: [{
	    color: '#000000'
	  }, {
	    lightness: 18
	  }]
	}, {
	  featureType: 'road.arterial',
	  elementType: 'geometry.fill',
	  stylers: [{
	    color: '#7f8d89'
	  }]
	}, {
	  featureType: 'road.arterial',
	  elementType: 'geometry.stroke',
	  stylers: [{
	    color: '#7f8d89'
	  }]
	}, {
	  featureType: 'road.local',
	  elementType: 'geometry',
	  stylers: [{
	    color: '#000000'
	  }, {
	    lightness: 16
	  }]
	}, {
	  featureType: 'road.local',
	  elementType: 'geometry.fill',
	  stylers: [{
	    color: '#7f8d89'
	  }]
	}, {
	  featureType: 'road.local',
	  elementType: 'geometry.stroke',
	  stylers: [{
	    color: '#7f8d89'
	  }]
	}, {
	  featureType: 'transit',
	  elementType: 'geometry',
	  stylers: [{
	    color: '#000000'
	  }, {
	    lightness: 19
	  }]
	}, {
	  featureType: 'water',
	  elementType: 'all',
	  stylers: [{
	    color: '#2b3638'
	  }, {
	    visibility: 'on'
	  }]
	}, {
	  featureType: 'water',
	  elementType: 'geometry',
	  stylers: [{
	    color: '#2b3638'
	  }, {
	    lightness: 17
	  }]
	}, {
	  featureType: 'water',
	  elementType: 'geometry.fill',
	  stylers: [{
	    color: '#24282b'
	  }]
	}, {
	  featureType: 'water',
	  elementType: 'geometry.stroke',
	  stylers: [{
	    color: '#24282b'
	  }]
	}, {
	  featureType: 'water',
	  elementType: 'labels',
	  stylers: [{
	    visibility: 'off'
	  }]
	}, {
	  featureType: 'water',
	  elementType: 'labels.text',
	  stylers: [{
	    visibility: 'off'
	  }]
	}, {
	  featureType: 'water',
	  elementType: 'labels.text.fill',
	  stylers: [{
	    visibility: 'off'
	  }]
	}, {
	  featureType: 'water',
	  elementType: 'labels.text.stroke',
	  stylers: [{
	    visibility: 'off'
	  }]
	}, {
	  featureType: 'water',
	  elementType: 'labels.icon',
	  stylers: [{
	    visibility: 'off'
	  }]
	}];
	gmaps.setupGoogleMapsApi(['map'], {
	  style: snazzyStyle,
	  zoom: 18,
	  icon: {
	    /* global WP */
	    img: "".concat(WP.templateUrl, "/images/marker_alt.png")
	  }
	});
	ofi_commonJs();
	Nav.init();

	var stdSliders = _toConsumableArray(document.querySelectorAll('.standard-slider'));

	if (stdSliders) {
	  stdSliders.forEach(function (s) {
	    var slider = new js(s, {
	      cellAlign: 'left',
	      wrapAround: true,
	      imagesLoaded: true,
	      watchCSS: true,
	      contain: true
	    });
	    return slider;
	  });
	}

}());
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2NyaXB0LmpzIiwic291cmNlcyI6WyIuLi9ub2RlX21vZHVsZXMvY29yZS1qcy9pbnRlcm5hbHMvZ2xvYmFsLmpzIiwiLi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvaW50ZXJuYWxzL2ZhaWxzLmpzIiwiLi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvaW50ZXJuYWxzL2Rlc2NyaXB0b3JzLmpzIiwiLi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvaW50ZXJuYWxzL29iamVjdC1wcm9wZXJ0eS1pcy1lbnVtZXJhYmxlLmpzIiwiLi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvaW50ZXJuYWxzL2NyZWF0ZS1wcm9wZXJ0eS1kZXNjcmlwdG9yLmpzIiwiLi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvaW50ZXJuYWxzL2NsYXNzb2YtcmF3LmpzIiwiLi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvaW50ZXJuYWxzL2luZGV4ZWQtb2JqZWN0LmpzIiwiLi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvaW50ZXJuYWxzL3JlcXVpcmUtb2JqZWN0LWNvZXJjaWJsZS5qcyIsIi4uL25vZGVfbW9kdWxlcy9jb3JlLWpzL2ludGVybmFscy90by1pbmRleGVkLW9iamVjdC5qcyIsIi4uL25vZGVfbW9kdWxlcy9jb3JlLWpzL2ludGVybmFscy9pcy1vYmplY3QuanMiLCIuLi9ub2RlX21vZHVsZXMvY29yZS1qcy9pbnRlcm5hbHMvdG8tcHJpbWl0aXZlLmpzIiwiLi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvaW50ZXJuYWxzL2hhcy5qcyIsIi4uL25vZGVfbW9kdWxlcy9jb3JlLWpzL2ludGVybmFscy9kb2N1bWVudC1jcmVhdGUtZWxlbWVudC5qcyIsIi4uL25vZGVfbW9kdWxlcy9jb3JlLWpzL2ludGVybmFscy9pZTgtZG9tLWRlZmluZS5qcyIsIi4uL25vZGVfbW9kdWxlcy9jb3JlLWpzL2ludGVybmFscy9vYmplY3QtZ2V0LW93bi1wcm9wZXJ0eS1kZXNjcmlwdG9yLmpzIiwiLi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvaW50ZXJuYWxzL2FuLW9iamVjdC5qcyIsIi4uL25vZGVfbW9kdWxlcy9jb3JlLWpzL2ludGVybmFscy9vYmplY3QtZGVmaW5lLXByb3BlcnR5LmpzIiwiLi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvaW50ZXJuYWxzL2NyZWF0ZS1ub24tZW51bWVyYWJsZS1wcm9wZXJ0eS5qcyIsIi4uL25vZGVfbW9kdWxlcy9jb3JlLWpzL2ludGVybmFscy9zZXQtZ2xvYmFsLmpzIiwiLi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvaW50ZXJuYWxzL3NoYXJlZC1zdG9yZS5qcyIsIi4uL25vZGVfbW9kdWxlcy9jb3JlLWpzL2ludGVybmFscy9pbnNwZWN0LXNvdXJjZS5qcyIsIi4uL25vZGVfbW9kdWxlcy9jb3JlLWpzL2ludGVybmFscy9uYXRpdmUtd2Vhay1tYXAuanMiLCIuLi9ub2RlX21vZHVsZXMvY29yZS1qcy9pbnRlcm5hbHMvc2hhcmVkLmpzIiwiLi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvaW50ZXJuYWxzL3VpZC5qcyIsIi4uL25vZGVfbW9kdWxlcy9jb3JlLWpzL2ludGVybmFscy9zaGFyZWQta2V5LmpzIiwiLi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvaW50ZXJuYWxzL2hpZGRlbi1rZXlzLmpzIiwiLi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvaW50ZXJuYWxzL2ludGVybmFsLXN0YXRlLmpzIiwiLi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvaW50ZXJuYWxzL3JlZGVmaW5lLmpzIiwiLi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvaW50ZXJuYWxzL3BhdGguanMiLCIuLi9ub2RlX21vZHVsZXMvY29yZS1qcy9pbnRlcm5hbHMvZ2V0LWJ1aWx0LWluLmpzIiwiLi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvaW50ZXJuYWxzL3RvLWludGVnZXIuanMiLCIuLi9ub2RlX21vZHVsZXMvY29yZS1qcy9pbnRlcm5hbHMvdG8tbGVuZ3RoLmpzIiwiLi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvaW50ZXJuYWxzL3RvLWFic29sdXRlLWluZGV4LmpzIiwiLi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvaW50ZXJuYWxzL2FycmF5LWluY2x1ZGVzLmpzIiwiLi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvaW50ZXJuYWxzL29iamVjdC1rZXlzLWludGVybmFsLmpzIiwiLi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvaW50ZXJuYWxzL2VudW0tYnVnLWtleXMuanMiLCIuLi9ub2RlX21vZHVsZXMvY29yZS1qcy9pbnRlcm5hbHMvb2JqZWN0LWdldC1vd24tcHJvcGVydHktbmFtZXMuanMiLCIuLi9ub2RlX21vZHVsZXMvY29yZS1qcy9pbnRlcm5hbHMvb2JqZWN0LWdldC1vd24tcHJvcGVydHktc3ltYm9scy5qcyIsIi4uL25vZGVfbW9kdWxlcy9jb3JlLWpzL2ludGVybmFscy9vd24ta2V5cy5qcyIsIi4uL25vZGVfbW9kdWxlcy9jb3JlLWpzL2ludGVybmFscy9jb3B5LWNvbnN0cnVjdG9yLXByb3BlcnRpZXMuanMiLCIuLi9ub2RlX21vZHVsZXMvY29yZS1qcy9pbnRlcm5hbHMvaXMtZm9yY2VkLmpzIiwiLi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvaW50ZXJuYWxzL2V4cG9ydC5qcyIsIi4uL25vZGVfbW9kdWxlcy9jb3JlLWpzL2ludGVybmFscy9hLWZ1bmN0aW9uLmpzIiwiLi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvaW50ZXJuYWxzL2Z1bmN0aW9uLWJpbmQtY29udGV4dC5qcyIsIi4uL25vZGVfbW9kdWxlcy9jb3JlLWpzL2ludGVybmFscy90by1vYmplY3QuanMiLCIuLi9ub2RlX21vZHVsZXMvY29yZS1qcy9pbnRlcm5hbHMvaXMtYXJyYXkuanMiLCIuLi9ub2RlX21vZHVsZXMvY29yZS1qcy9pbnRlcm5hbHMvbmF0aXZlLXN5bWJvbC5qcyIsIi4uL25vZGVfbW9kdWxlcy9jb3JlLWpzL2ludGVybmFscy91c2Utc3ltYm9sLWFzLXVpZC5qcyIsIi4uL25vZGVfbW9kdWxlcy9jb3JlLWpzL2ludGVybmFscy93ZWxsLWtub3duLXN5bWJvbC5qcyIsIi4uL25vZGVfbW9kdWxlcy9jb3JlLWpzL2ludGVybmFscy9hcnJheS1zcGVjaWVzLWNyZWF0ZS5qcyIsIi4uL25vZGVfbW9kdWxlcy9jb3JlLWpzL2ludGVybmFscy9hcnJheS1pdGVyYXRpb24uanMiLCIuLi9ub2RlX21vZHVsZXMvY29yZS1qcy9pbnRlcm5hbHMvYXJyYXktbWV0aG9kLWlzLXN0cmljdC5qcyIsIi4uL25vZGVfbW9kdWxlcy9jb3JlLWpzL2ludGVybmFscy9hcnJheS1tZXRob2QtdXNlcy10by1sZW5ndGguanMiLCIuLi9ub2RlX21vZHVsZXMvY29yZS1qcy9pbnRlcm5hbHMvYXJyYXktZm9yLWVhY2guanMiLCIuLi9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL2VzLmFycmF5LmZvci1lYWNoLmpzIiwiLi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvaW50ZXJuYWxzL2RvbS1pdGVyYWJsZXMuanMiLCIuLi9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL3dlYi5kb20tY29sbGVjdGlvbnMuZm9yLWVhY2guanMiLCIuLi9ub2RlX21vZHVsZXMvb2JqZWN0LWZpdC1pbWFnZXMvZGlzdC9vZmkuY29tbW9uLWpzLmpzIiwiLi4vbm9kZV9tb2R1bGVzL2V2LWVtaXR0ZXIvZXYtZW1pdHRlci5qcyIsIi4uL25vZGVfbW9kdWxlcy9nZXQtc2l6ZS9nZXQtc2l6ZS5qcyIsIi4uL25vZGVfbW9kdWxlcy9kZXNhbmRyby1tYXRjaGVzLXNlbGVjdG9yL21hdGNoZXMtc2VsZWN0b3IuanMiLCIuLi9ub2RlX21vZHVsZXMvZml6enktdWktdXRpbHMvdXRpbHMuanMiLCIuLi9ub2RlX21vZHVsZXMvZmxpY2tpdHkvanMvY2VsbC5qcyIsIi4uL25vZGVfbW9kdWxlcy9mbGlja2l0eS9qcy9zbGlkZS5qcyIsIi4uL25vZGVfbW9kdWxlcy9mbGlja2l0eS9qcy9hbmltYXRlLmpzIiwiLi4vbm9kZV9tb2R1bGVzL2ZsaWNraXR5L2pzL2ZsaWNraXR5LmpzIiwiLi4vbm9kZV9tb2R1bGVzL3VuaXBvaW50ZXIvdW5pcG9pbnRlci5qcyIsIi4uL25vZGVfbW9kdWxlcy91bmlkcmFnZ2VyL3VuaWRyYWdnZXIuanMiLCIuLi9ub2RlX21vZHVsZXMvZmxpY2tpdHkvanMvZHJhZy5qcyIsIi4uL25vZGVfbW9kdWxlcy9mbGlja2l0eS9qcy9wcmV2LW5leHQtYnV0dG9uLmpzIiwiLi4vbm9kZV9tb2R1bGVzL2ZsaWNraXR5L2pzL3BhZ2UtZG90cy5qcyIsIi4uL25vZGVfbW9kdWxlcy9mbGlja2l0eS9qcy9wbGF5ZXIuanMiLCIuLi9ub2RlX21vZHVsZXMvZmxpY2tpdHkvanMvYWRkLXJlbW92ZS1jZWxsLmpzIiwiLi4vbm9kZV9tb2R1bGVzL2ZsaWNraXR5L2pzL2xhenlsb2FkLmpzIiwiLi4vbm9kZV9tb2R1bGVzL2ZsaWNraXR5L2pzL2luZGV4LmpzIiwiLi4vbm9kZV9tb2R1bGVzL2ltYWdlc2xvYWRlZC9pbWFnZXNsb2FkZWQuanMiLCIuLi9ub2RlX21vZHVsZXMvZmxpY2tpdHktaW1hZ2VzbG9hZGVkL2ZsaWNraXR5LWltYWdlc2xvYWRlZC5qcyIsIi4uL25vZGVfbW9kdWxlcy9ib2R5LXNjcm9sbC1sb2NrL2xpYi9ib2R5U2Nyb2xsTG9jay5lc20uanMiLCIuLi9zcmMvanMvY29tcG9uZW50cy9uYXZpZ2F0aW9uLmpzIiwiLi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvaW50ZXJuYWxzL2EtcG9zc2libGUtcHJvdG90eXBlLmpzIiwiLi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvaW50ZXJuYWxzL29iamVjdC1zZXQtcHJvdG90eXBlLW9mLmpzIiwiLi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvaW50ZXJuYWxzL2luaGVyaXQtaWYtcmVxdWlyZWQuanMiLCIuLi9ub2RlX21vZHVsZXMvY29yZS1qcy9pbnRlcm5hbHMvb2JqZWN0LWtleXMuanMiLCIuLi9ub2RlX21vZHVsZXMvY29yZS1qcy9pbnRlcm5hbHMvb2JqZWN0LWRlZmluZS1wcm9wZXJ0aWVzLmpzIiwiLi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvaW50ZXJuYWxzL2h0bWwuanMiLCIuLi9ub2RlX21vZHVsZXMvY29yZS1qcy9pbnRlcm5hbHMvb2JqZWN0LWNyZWF0ZS5qcyIsIi4uL25vZGVfbW9kdWxlcy9jb3JlLWpzL2ludGVybmFscy93aGl0ZXNwYWNlcy5qcyIsIi4uL25vZGVfbW9kdWxlcy9jb3JlLWpzL2ludGVybmFscy9zdHJpbmctdHJpbS5qcyIsIi4uL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvZXMubnVtYmVyLmNvbnN0cnVjdG9yLmpzIiwiLi4vc3JjL2pzL2NvbXBvbmVudHMvZ21hcHMuanMiLCIuLi9zcmMvanMvbXlzY3JpcHQuanMiXSwic291cmNlc0NvbnRlbnQiOlsidmFyIGNoZWNrID0gZnVuY3Rpb24gKGl0KSB7XG4gIHJldHVybiBpdCAmJiBpdC5NYXRoID09IE1hdGggJiYgaXQ7XG59O1xuXG4vLyBodHRwczovL2dpdGh1Yi5jb20vemxvaXJvY2svY29yZS1qcy9pc3N1ZXMvODYjaXNzdWVjb21tZW50LTExNTc1OTAyOFxubW9kdWxlLmV4cG9ydHMgPVxuICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tdW5kZWZcbiAgY2hlY2sodHlwZW9mIGdsb2JhbFRoaXMgPT0gJ29iamVjdCcgJiYgZ2xvYmFsVGhpcykgfHxcbiAgY2hlY2sodHlwZW9mIHdpbmRvdyA9PSAnb2JqZWN0JyAmJiB3aW5kb3cpIHx8XG4gIGNoZWNrKHR5cGVvZiBzZWxmID09ICdvYmplY3QnICYmIHNlbGYpIHx8XG4gIGNoZWNrKHR5cGVvZiBnbG9iYWwgPT0gJ29iamVjdCcgJiYgZ2xvYmFsKSB8fFxuICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tbmV3LWZ1bmNcbiAgKGZ1bmN0aW9uICgpIHsgcmV0dXJuIHRoaXM7IH0pKCkgfHwgRnVuY3Rpb24oJ3JldHVybiB0aGlzJykoKTtcbiIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGV4ZWMpIHtcbiAgdHJ5IHtcbiAgICByZXR1cm4gISFleGVjKCk7XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cbn07XG4iLCJ2YXIgZmFpbHMgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvZmFpbHMnKTtcblxuLy8gRGV0ZWN0IElFOCdzIGluY29tcGxldGUgZGVmaW5lUHJvcGVydHkgaW1wbGVtZW50YXRpb25cbm1vZHVsZS5leHBvcnRzID0gIWZhaWxzKGZ1bmN0aW9uICgpIHtcbiAgcmV0dXJuIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh7fSwgMSwgeyBnZXQ6IGZ1bmN0aW9uICgpIHsgcmV0dXJuIDc7IH0gfSlbMV0gIT0gNztcbn0pO1xuIiwiJ3VzZSBzdHJpY3QnO1xudmFyIG5hdGl2ZVByb3BlcnR5SXNFbnVtZXJhYmxlID0ge30ucHJvcGVydHlJc0VudW1lcmFibGU7XG52YXIgZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcjtcblxuLy8gTmFzaG9ybiB+IEpESzggYnVnXG52YXIgTkFTSE9STl9CVUcgPSBnZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IgJiYgIW5hdGl2ZVByb3BlcnR5SXNFbnVtZXJhYmxlLmNhbGwoeyAxOiAyIH0sIDEpO1xuXG4vLyBgT2JqZWN0LnByb3RvdHlwZS5wcm9wZXJ0eUlzRW51bWVyYWJsZWAgbWV0aG9kIGltcGxlbWVudGF0aW9uXG4vLyBodHRwczovL3RjMzkuZXMvZWNtYTI2Mi8jc2VjLW9iamVjdC5wcm90b3R5cGUucHJvcGVydHlpc2VudW1lcmFibGVcbmV4cG9ydHMuZiA9IE5BU0hPUk5fQlVHID8gZnVuY3Rpb24gcHJvcGVydHlJc0VudW1lcmFibGUoVikge1xuICB2YXIgZGVzY3JpcHRvciA9IGdldE93blByb3BlcnR5RGVzY3JpcHRvcih0aGlzLCBWKTtcbiAgcmV0dXJuICEhZGVzY3JpcHRvciAmJiBkZXNjcmlwdG9yLmVudW1lcmFibGU7XG59IDogbmF0aXZlUHJvcGVydHlJc0VudW1lcmFibGU7XG4iLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChiaXRtYXAsIHZhbHVlKSB7XG4gIHJldHVybiB7XG4gICAgZW51bWVyYWJsZTogIShiaXRtYXAgJiAxKSxcbiAgICBjb25maWd1cmFibGU6ICEoYml0bWFwICYgMiksXG4gICAgd3JpdGFibGU6ICEoYml0bWFwICYgNCksXG4gICAgdmFsdWU6IHZhbHVlXG4gIH07XG59O1xuIiwidmFyIHRvU3RyaW5nID0ge30udG9TdHJpbmc7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGl0KSB7XG4gIHJldHVybiB0b1N0cmluZy5jYWxsKGl0KS5zbGljZSg4LCAtMSk7XG59O1xuIiwidmFyIGZhaWxzID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2ZhaWxzJyk7XG52YXIgY2xhc3NvZiA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9jbGFzc29mLXJhdycpO1xuXG52YXIgc3BsaXQgPSAnJy5zcGxpdDtcblxuLy8gZmFsbGJhY2sgZm9yIG5vbi1hcnJheS1saWtlIEVTMyBhbmQgbm9uLWVudW1lcmFibGUgb2xkIFY4IHN0cmluZ3Ncbm1vZHVsZS5leHBvcnRzID0gZmFpbHMoZnVuY3Rpb24gKCkge1xuICAvLyB0aHJvd3MgYW4gZXJyb3IgaW4gcmhpbm8sIHNlZSBodHRwczovL2dpdGh1Yi5jb20vbW96aWxsYS9yaGluby9pc3N1ZXMvMzQ2XG4gIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1wcm90b3R5cGUtYnVpbHRpbnNcbiAgcmV0dXJuICFPYmplY3QoJ3onKS5wcm9wZXJ0eUlzRW51bWVyYWJsZSgwKTtcbn0pID8gZnVuY3Rpb24gKGl0KSB7XG4gIHJldHVybiBjbGFzc29mKGl0KSA9PSAnU3RyaW5nJyA/IHNwbGl0LmNhbGwoaXQsICcnKSA6IE9iamVjdChpdCk7XG59IDogT2JqZWN0O1xuIiwiLy8gYFJlcXVpcmVPYmplY3RDb2VyY2libGVgIGFic3RyYWN0IG9wZXJhdGlvblxuLy8gaHR0cHM6Ly90YzM5LmVzL2VjbWEyNjIvI3NlYy1yZXF1aXJlb2JqZWN0Y29lcmNpYmxlXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChpdCkge1xuICBpZiAoaXQgPT0gdW5kZWZpbmVkKSB0aHJvdyBUeXBlRXJyb3IoXCJDYW4ndCBjYWxsIG1ldGhvZCBvbiBcIiArIGl0KTtcbiAgcmV0dXJuIGl0O1xufTtcbiIsIi8vIHRvT2JqZWN0IHdpdGggZmFsbGJhY2sgZm9yIG5vbi1hcnJheS1saWtlIEVTMyBzdHJpbmdzXG52YXIgSW5kZXhlZE9iamVjdCA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9pbmRleGVkLW9iamVjdCcpO1xudmFyIHJlcXVpcmVPYmplY3RDb2VyY2libGUgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvcmVxdWlyZS1vYmplY3QtY29lcmNpYmxlJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGl0KSB7XG4gIHJldHVybiBJbmRleGVkT2JqZWN0KHJlcXVpcmVPYmplY3RDb2VyY2libGUoaXQpKTtcbn07XG4iLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChpdCkge1xuICByZXR1cm4gdHlwZW9mIGl0ID09PSAnb2JqZWN0JyA/IGl0ICE9PSBudWxsIDogdHlwZW9mIGl0ID09PSAnZnVuY3Rpb24nO1xufTtcbiIsInZhciBpc09iamVjdCA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9pcy1vYmplY3QnKTtcblxuLy8gYFRvUHJpbWl0aXZlYCBhYnN0cmFjdCBvcGVyYXRpb25cbi8vIGh0dHBzOi8vdGMzOS5lcy9lY21hMjYyLyNzZWMtdG9wcmltaXRpdmVcbi8vIGluc3RlYWQgb2YgdGhlIEVTNiBzcGVjIHZlcnNpb24sIHdlIGRpZG4ndCBpbXBsZW1lbnQgQEB0b1ByaW1pdGl2ZSBjYXNlXG4vLyBhbmQgdGhlIHNlY29uZCBhcmd1bWVudCAtIGZsYWcgLSBwcmVmZXJyZWQgdHlwZSBpcyBhIHN0cmluZ1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoaW5wdXQsIFBSRUZFUlJFRF9TVFJJTkcpIHtcbiAgaWYgKCFpc09iamVjdChpbnB1dCkpIHJldHVybiBpbnB1dDtcbiAgdmFyIGZuLCB2YWw7XG4gIGlmIChQUkVGRVJSRURfU1RSSU5HICYmIHR5cGVvZiAoZm4gPSBpbnB1dC50b1N0cmluZykgPT0gJ2Z1bmN0aW9uJyAmJiAhaXNPYmplY3QodmFsID0gZm4uY2FsbChpbnB1dCkpKSByZXR1cm4gdmFsO1xuICBpZiAodHlwZW9mIChmbiA9IGlucHV0LnZhbHVlT2YpID09ICdmdW5jdGlvbicgJiYgIWlzT2JqZWN0KHZhbCA9IGZuLmNhbGwoaW5wdXQpKSkgcmV0dXJuIHZhbDtcbiAgaWYgKCFQUkVGRVJSRURfU1RSSU5HICYmIHR5cGVvZiAoZm4gPSBpbnB1dC50b1N0cmluZykgPT0gJ2Z1bmN0aW9uJyAmJiAhaXNPYmplY3QodmFsID0gZm4uY2FsbChpbnB1dCkpKSByZXR1cm4gdmFsO1xuICB0aHJvdyBUeXBlRXJyb3IoXCJDYW4ndCBjb252ZXJ0IG9iamVjdCB0byBwcmltaXRpdmUgdmFsdWVcIik7XG59O1xuIiwidmFyIGhhc093blByb3BlcnR5ID0ge30uaGFzT3duUHJvcGVydHk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGl0LCBrZXkpIHtcbiAgcmV0dXJuIGhhc093blByb3BlcnR5LmNhbGwoaXQsIGtleSk7XG59O1xuIiwidmFyIGdsb2JhbCA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9nbG9iYWwnKTtcbnZhciBpc09iamVjdCA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9pcy1vYmplY3QnKTtcblxudmFyIGRvY3VtZW50ID0gZ2xvYmFsLmRvY3VtZW50O1xuLy8gdHlwZW9mIGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQgaXMgJ29iamVjdCcgaW4gb2xkIElFXG52YXIgRVhJU1RTID0gaXNPYmplY3QoZG9jdW1lbnQpICYmIGlzT2JqZWN0KGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChpdCkge1xuICByZXR1cm4gRVhJU1RTID8gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChpdCkgOiB7fTtcbn07XG4iLCJ2YXIgREVTQ1JJUFRPUlMgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvZGVzY3JpcHRvcnMnKTtcbnZhciBmYWlscyA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9mYWlscycpO1xudmFyIGNyZWF0ZUVsZW1lbnQgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvZG9jdW1lbnQtY3JlYXRlLWVsZW1lbnQnKTtcblxuLy8gVGhhbmsncyBJRTggZm9yIGhpcyBmdW5ueSBkZWZpbmVQcm9wZXJ0eVxubW9kdWxlLmV4cG9ydHMgPSAhREVTQ1JJUFRPUlMgJiYgIWZhaWxzKGZ1bmN0aW9uICgpIHtcbiAgcmV0dXJuIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShjcmVhdGVFbGVtZW50KCdkaXYnKSwgJ2EnLCB7XG4gICAgZ2V0OiBmdW5jdGlvbiAoKSB7IHJldHVybiA3OyB9XG4gIH0pLmEgIT0gNztcbn0pO1xuIiwidmFyIERFU0NSSVBUT1JTID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2Rlc2NyaXB0b3JzJyk7XG52YXIgcHJvcGVydHlJc0VudW1lcmFibGVNb2R1bGUgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvb2JqZWN0LXByb3BlcnR5LWlzLWVudW1lcmFibGUnKTtcbnZhciBjcmVhdGVQcm9wZXJ0eURlc2NyaXB0b3IgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvY3JlYXRlLXByb3BlcnR5LWRlc2NyaXB0b3InKTtcbnZhciB0b0luZGV4ZWRPYmplY3QgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvdG8taW5kZXhlZC1vYmplY3QnKTtcbnZhciB0b1ByaW1pdGl2ZSA9IHJlcXVpcmUoJy4uL2ludGVybmFscy90by1wcmltaXRpdmUnKTtcbnZhciBoYXMgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvaGFzJyk7XG52YXIgSUU4X0RPTV9ERUZJTkUgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvaWU4LWRvbS1kZWZpbmUnKTtcblxudmFyIG5hdGl2ZUdldE93blByb3BlcnR5RGVzY3JpcHRvciA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3I7XG5cbi8vIGBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yYCBtZXRob2Rcbi8vIGh0dHBzOi8vdGMzOS5lcy9lY21hMjYyLyNzZWMtb2JqZWN0LmdldG93bnByb3BlcnR5ZGVzY3JpcHRvclxuZXhwb3J0cy5mID0gREVTQ1JJUFRPUlMgPyBuYXRpdmVHZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IgOiBmdW5jdGlvbiBnZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IoTywgUCkge1xuICBPID0gdG9JbmRleGVkT2JqZWN0KE8pO1xuICBQID0gdG9QcmltaXRpdmUoUCwgdHJ1ZSk7XG4gIGlmIChJRThfRE9NX0RFRklORSkgdHJ5IHtcbiAgICByZXR1cm4gbmF0aXZlR2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKE8sIFApO1xuICB9IGNhdGNoIChlcnJvcikgeyAvKiBlbXB0eSAqLyB9XG4gIGlmIChoYXMoTywgUCkpIHJldHVybiBjcmVhdGVQcm9wZXJ0eURlc2NyaXB0b3IoIXByb3BlcnR5SXNFbnVtZXJhYmxlTW9kdWxlLmYuY2FsbChPLCBQKSwgT1tQXSk7XG59O1xuIiwidmFyIGlzT2JqZWN0ID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2lzLW9iamVjdCcpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChpdCkge1xuICBpZiAoIWlzT2JqZWN0KGl0KSkge1xuICAgIHRocm93IFR5cGVFcnJvcihTdHJpbmcoaXQpICsgJyBpcyBub3QgYW4gb2JqZWN0Jyk7XG4gIH0gcmV0dXJuIGl0O1xufTtcbiIsInZhciBERVNDUklQVE9SUyA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9kZXNjcmlwdG9ycycpO1xudmFyIElFOF9ET01fREVGSU5FID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2llOC1kb20tZGVmaW5lJyk7XG52YXIgYW5PYmplY3QgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvYW4tb2JqZWN0Jyk7XG52YXIgdG9QcmltaXRpdmUgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvdG8tcHJpbWl0aXZlJyk7XG5cbnZhciBuYXRpdmVEZWZpbmVQcm9wZXJ0eSA9IE9iamVjdC5kZWZpbmVQcm9wZXJ0eTtcblxuLy8gYE9iamVjdC5kZWZpbmVQcm9wZXJ0eWAgbWV0aG9kXG4vLyBodHRwczovL3RjMzkuZXMvZWNtYTI2Mi8jc2VjLW9iamVjdC5kZWZpbmVwcm9wZXJ0eVxuZXhwb3J0cy5mID0gREVTQ1JJUFRPUlMgPyBuYXRpdmVEZWZpbmVQcm9wZXJ0eSA6IGZ1bmN0aW9uIGRlZmluZVByb3BlcnR5KE8sIFAsIEF0dHJpYnV0ZXMpIHtcbiAgYW5PYmplY3QoTyk7XG4gIFAgPSB0b1ByaW1pdGl2ZShQLCB0cnVlKTtcbiAgYW5PYmplY3QoQXR0cmlidXRlcyk7XG4gIGlmIChJRThfRE9NX0RFRklORSkgdHJ5IHtcbiAgICByZXR1cm4gbmF0aXZlRGVmaW5lUHJvcGVydHkoTywgUCwgQXR0cmlidXRlcyk7XG4gIH0gY2F0Y2ggKGVycm9yKSB7IC8qIGVtcHR5ICovIH1cbiAgaWYgKCdnZXQnIGluIEF0dHJpYnV0ZXMgfHwgJ3NldCcgaW4gQXR0cmlidXRlcykgdGhyb3cgVHlwZUVycm9yKCdBY2Nlc3NvcnMgbm90IHN1cHBvcnRlZCcpO1xuICBpZiAoJ3ZhbHVlJyBpbiBBdHRyaWJ1dGVzKSBPW1BdID0gQXR0cmlidXRlcy52YWx1ZTtcbiAgcmV0dXJuIE87XG59O1xuIiwidmFyIERFU0NSSVBUT1JTID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2Rlc2NyaXB0b3JzJyk7XG52YXIgZGVmaW5lUHJvcGVydHlNb2R1bGUgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvb2JqZWN0LWRlZmluZS1wcm9wZXJ0eScpO1xudmFyIGNyZWF0ZVByb3BlcnR5RGVzY3JpcHRvciA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9jcmVhdGUtcHJvcGVydHktZGVzY3JpcHRvcicpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IERFU0NSSVBUT1JTID8gZnVuY3Rpb24gKG9iamVjdCwga2V5LCB2YWx1ZSkge1xuICByZXR1cm4gZGVmaW5lUHJvcGVydHlNb2R1bGUuZihvYmplY3QsIGtleSwgY3JlYXRlUHJvcGVydHlEZXNjcmlwdG9yKDEsIHZhbHVlKSk7XG59IDogZnVuY3Rpb24gKG9iamVjdCwga2V5LCB2YWx1ZSkge1xuICBvYmplY3Rba2V5XSA9IHZhbHVlO1xuICByZXR1cm4gb2JqZWN0O1xufTtcbiIsInZhciBnbG9iYWwgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvZ2xvYmFsJyk7XG52YXIgY3JlYXRlTm9uRW51bWVyYWJsZVByb3BlcnR5ID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2NyZWF0ZS1ub24tZW51bWVyYWJsZS1wcm9wZXJ0eScpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChrZXksIHZhbHVlKSB7XG4gIHRyeSB7XG4gICAgY3JlYXRlTm9uRW51bWVyYWJsZVByb3BlcnR5KGdsb2JhbCwga2V5LCB2YWx1ZSk7XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgZ2xvYmFsW2tleV0gPSB2YWx1ZTtcbiAgfSByZXR1cm4gdmFsdWU7XG59O1xuIiwidmFyIGdsb2JhbCA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9nbG9iYWwnKTtcbnZhciBzZXRHbG9iYWwgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvc2V0LWdsb2JhbCcpO1xuXG52YXIgU0hBUkVEID0gJ19fY29yZS1qc19zaGFyZWRfXyc7XG52YXIgc3RvcmUgPSBnbG9iYWxbU0hBUkVEXSB8fCBzZXRHbG9iYWwoU0hBUkVELCB7fSk7XG5cbm1vZHVsZS5leHBvcnRzID0gc3RvcmU7XG4iLCJ2YXIgc3RvcmUgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvc2hhcmVkLXN0b3JlJyk7XG5cbnZhciBmdW5jdGlvblRvU3RyaW5nID0gRnVuY3Rpb24udG9TdHJpbmc7XG5cbi8vIHRoaXMgaGVscGVyIGJyb2tlbiBpbiBgMy40LjEtMy40LjRgLCBzbyB3ZSBjYW4ndCB1c2UgYHNoYXJlZGAgaGVscGVyXG5pZiAodHlwZW9mIHN0b3JlLmluc3BlY3RTb3VyY2UgIT0gJ2Z1bmN0aW9uJykge1xuICBzdG9yZS5pbnNwZWN0U291cmNlID0gZnVuY3Rpb24gKGl0KSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uVG9TdHJpbmcuY2FsbChpdCk7XG4gIH07XG59XG5cbm1vZHVsZS5leHBvcnRzID0gc3RvcmUuaW5zcGVjdFNvdXJjZTtcbiIsInZhciBnbG9iYWwgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvZ2xvYmFsJyk7XG52YXIgaW5zcGVjdFNvdXJjZSA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9pbnNwZWN0LXNvdXJjZScpO1xuXG52YXIgV2Vha01hcCA9IGdsb2JhbC5XZWFrTWFwO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHR5cGVvZiBXZWFrTWFwID09PSAnZnVuY3Rpb24nICYmIC9uYXRpdmUgY29kZS8udGVzdChpbnNwZWN0U291cmNlKFdlYWtNYXApKTtcbiIsInZhciBJU19QVVJFID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2lzLXB1cmUnKTtcbnZhciBzdG9yZSA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9zaGFyZWQtc3RvcmUnKTtcblxuKG1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGtleSwgdmFsdWUpIHtcbiAgcmV0dXJuIHN0b3JlW2tleV0gfHwgKHN0b3JlW2tleV0gPSB2YWx1ZSAhPT0gdW5kZWZpbmVkID8gdmFsdWUgOiB7fSk7XG59KSgndmVyc2lvbnMnLCBbXSkucHVzaCh7XG4gIHZlcnNpb246ICczLjguMicsXG4gIG1vZGU6IElTX1BVUkUgPyAncHVyZScgOiAnZ2xvYmFsJyxcbiAgY29weXJpZ2h0OiAnwqkgMjAyMSBEZW5pcyBQdXNoa2FyZXYgKHpsb2lyb2NrLnJ1KSdcbn0pO1xuIiwidmFyIGlkID0gMDtcbnZhciBwb3N0Zml4ID0gTWF0aC5yYW5kb20oKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoa2V5KSB7XG4gIHJldHVybiAnU3ltYm9sKCcgKyBTdHJpbmcoa2V5ID09PSB1bmRlZmluZWQgPyAnJyA6IGtleSkgKyAnKV8nICsgKCsraWQgKyBwb3N0Zml4KS50b1N0cmluZygzNik7XG59O1xuIiwidmFyIHNoYXJlZCA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9zaGFyZWQnKTtcbnZhciB1aWQgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvdWlkJyk7XG5cbnZhciBrZXlzID0gc2hhcmVkKCdrZXlzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGtleSkge1xuICByZXR1cm4ga2V5c1trZXldIHx8IChrZXlzW2tleV0gPSB1aWQoa2V5KSk7XG59O1xuIiwibW9kdWxlLmV4cG9ydHMgPSB7fTtcbiIsInZhciBOQVRJVkVfV0VBS19NQVAgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvbmF0aXZlLXdlYWstbWFwJyk7XG52YXIgZ2xvYmFsID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2dsb2JhbCcpO1xudmFyIGlzT2JqZWN0ID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2lzLW9iamVjdCcpO1xudmFyIGNyZWF0ZU5vbkVudW1lcmFibGVQcm9wZXJ0eSA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9jcmVhdGUtbm9uLWVudW1lcmFibGUtcHJvcGVydHknKTtcbnZhciBvYmplY3RIYXMgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvaGFzJyk7XG52YXIgc2hhcmVkID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL3NoYXJlZC1zdG9yZScpO1xudmFyIHNoYXJlZEtleSA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9zaGFyZWQta2V5Jyk7XG52YXIgaGlkZGVuS2V5cyA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9oaWRkZW4ta2V5cycpO1xuXG52YXIgV2Vha01hcCA9IGdsb2JhbC5XZWFrTWFwO1xudmFyIHNldCwgZ2V0LCBoYXM7XG5cbnZhciBlbmZvcmNlID0gZnVuY3Rpb24gKGl0KSB7XG4gIHJldHVybiBoYXMoaXQpID8gZ2V0KGl0KSA6IHNldChpdCwge30pO1xufTtcblxudmFyIGdldHRlckZvciA9IGZ1bmN0aW9uIChUWVBFKSB7XG4gIHJldHVybiBmdW5jdGlvbiAoaXQpIHtcbiAgICB2YXIgc3RhdGU7XG4gICAgaWYgKCFpc09iamVjdChpdCkgfHwgKHN0YXRlID0gZ2V0KGl0KSkudHlwZSAhPT0gVFlQRSkge1xuICAgICAgdGhyb3cgVHlwZUVycm9yKCdJbmNvbXBhdGlibGUgcmVjZWl2ZXIsICcgKyBUWVBFICsgJyByZXF1aXJlZCcpO1xuICAgIH0gcmV0dXJuIHN0YXRlO1xuICB9O1xufTtcblxuaWYgKE5BVElWRV9XRUFLX01BUCkge1xuICB2YXIgc3RvcmUgPSBzaGFyZWQuc3RhdGUgfHwgKHNoYXJlZC5zdGF0ZSA9IG5ldyBXZWFrTWFwKCkpO1xuICB2YXIgd21nZXQgPSBzdG9yZS5nZXQ7XG4gIHZhciB3bWhhcyA9IHN0b3JlLmhhcztcbiAgdmFyIHdtc2V0ID0gc3RvcmUuc2V0O1xuICBzZXQgPSBmdW5jdGlvbiAoaXQsIG1ldGFkYXRhKSB7XG4gICAgbWV0YWRhdGEuZmFjYWRlID0gaXQ7XG4gICAgd21zZXQuY2FsbChzdG9yZSwgaXQsIG1ldGFkYXRhKTtcbiAgICByZXR1cm4gbWV0YWRhdGE7XG4gIH07XG4gIGdldCA9IGZ1bmN0aW9uIChpdCkge1xuICAgIHJldHVybiB3bWdldC5jYWxsKHN0b3JlLCBpdCkgfHwge307XG4gIH07XG4gIGhhcyA9IGZ1bmN0aW9uIChpdCkge1xuICAgIHJldHVybiB3bWhhcy5jYWxsKHN0b3JlLCBpdCk7XG4gIH07XG59IGVsc2Uge1xuICB2YXIgU1RBVEUgPSBzaGFyZWRLZXkoJ3N0YXRlJyk7XG4gIGhpZGRlbktleXNbU1RBVEVdID0gdHJ1ZTtcbiAgc2V0ID0gZnVuY3Rpb24gKGl0LCBtZXRhZGF0YSkge1xuICAgIG1ldGFkYXRhLmZhY2FkZSA9IGl0O1xuICAgIGNyZWF0ZU5vbkVudW1lcmFibGVQcm9wZXJ0eShpdCwgU1RBVEUsIG1ldGFkYXRhKTtcbiAgICByZXR1cm4gbWV0YWRhdGE7XG4gIH07XG4gIGdldCA9IGZ1bmN0aW9uIChpdCkge1xuICAgIHJldHVybiBvYmplY3RIYXMoaXQsIFNUQVRFKSA/IGl0W1NUQVRFXSA6IHt9O1xuICB9O1xuICBoYXMgPSBmdW5jdGlvbiAoaXQpIHtcbiAgICByZXR1cm4gb2JqZWN0SGFzKGl0LCBTVEFURSk7XG4gIH07XG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBzZXQ6IHNldCxcbiAgZ2V0OiBnZXQsXG4gIGhhczogaGFzLFxuICBlbmZvcmNlOiBlbmZvcmNlLFxuICBnZXR0ZXJGb3I6IGdldHRlckZvclxufTtcbiIsInZhciBnbG9iYWwgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvZ2xvYmFsJyk7XG52YXIgY3JlYXRlTm9uRW51bWVyYWJsZVByb3BlcnR5ID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2NyZWF0ZS1ub24tZW51bWVyYWJsZS1wcm9wZXJ0eScpO1xudmFyIGhhcyA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9oYXMnKTtcbnZhciBzZXRHbG9iYWwgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvc2V0LWdsb2JhbCcpO1xudmFyIGluc3BlY3RTb3VyY2UgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvaW5zcGVjdC1zb3VyY2UnKTtcbnZhciBJbnRlcm5hbFN0YXRlTW9kdWxlID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2ludGVybmFsLXN0YXRlJyk7XG5cbnZhciBnZXRJbnRlcm5hbFN0YXRlID0gSW50ZXJuYWxTdGF0ZU1vZHVsZS5nZXQ7XG52YXIgZW5mb3JjZUludGVybmFsU3RhdGUgPSBJbnRlcm5hbFN0YXRlTW9kdWxlLmVuZm9yY2U7XG52YXIgVEVNUExBVEUgPSBTdHJpbmcoU3RyaW5nKS5zcGxpdCgnU3RyaW5nJyk7XG5cbihtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChPLCBrZXksIHZhbHVlLCBvcHRpb25zKSB7XG4gIHZhciB1bnNhZmUgPSBvcHRpb25zID8gISFvcHRpb25zLnVuc2FmZSA6IGZhbHNlO1xuICB2YXIgc2ltcGxlID0gb3B0aW9ucyA/ICEhb3B0aW9ucy5lbnVtZXJhYmxlIDogZmFsc2U7XG4gIHZhciBub1RhcmdldEdldCA9IG9wdGlvbnMgPyAhIW9wdGlvbnMubm9UYXJnZXRHZXQgOiBmYWxzZTtcbiAgdmFyIHN0YXRlO1xuICBpZiAodHlwZW9mIHZhbHVlID09ICdmdW5jdGlvbicpIHtcbiAgICBpZiAodHlwZW9mIGtleSA9PSAnc3RyaW5nJyAmJiAhaGFzKHZhbHVlLCAnbmFtZScpKSB7XG4gICAgICBjcmVhdGVOb25FbnVtZXJhYmxlUHJvcGVydHkodmFsdWUsICduYW1lJywga2V5KTtcbiAgICB9XG4gICAgc3RhdGUgPSBlbmZvcmNlSW50ZXJuYWxTdGF0ZSh2YWx1ZSk7XG4gICAgaWYgKCFzdGF0ZS5zb3VyY2UpIHtcbiAgICAgIHN0YXRlLnNvdXJjZSA9IFRFTVBMQVRFLmpvaW4odHlwZW9mIGtleSA9PSAnc3RyaW5nJyA/IGtleSA6ICcnKTtcbiAgICB9XG4gIH1cbiAgaWYgKE8gPT09IGdsb2JhbCkge1xuICAgIGlmIChzaW1wbGUpIE9ba2V5XSA9IHZhbHVlO1xuICAgIGVsc2Ugc2V0R2xvYmFsKGtleSwgdmFsdWUpO1xuICAgIHJldHVybjtcbiAgfSBlbHNlIGlmICghdW5zYWZlKSB7XG4gICAgZGVsZXRlIE9ba2V5XTtcbiAgfSBlbHNlIGlmICghbm9UYXJnZXRHZXQgJiYgT1trZXldKSB7XG4gICAgc2ltcGxlID0gdHJ1ZTtcbiAgfVxuICBpZiAoc2ltcGxlKSBPW2tleV0gPSB2YWx1ZTtcbiAgZWxzZSBjcmVhdGVOb25FbnVtZXJhYmxlUHJvcGVydHkoTywga2V5LCB2YWx1ZSk7XG4vLyBhZGQgZmFrZSBGdW5jdGlvbiN0b1N0cmluZyBmb3IgY29ycmVjdCB3b3JrIHdyYXBwZWQgbWV0aG9kcyAvIGNvbnN0cnVjdG9ycyB3aXRoIG1ldGhvZHMgbGlrZSBMb0Rhc2ggaXNOYXRpdmVcbn0pKEZ1bmN0aW9uLnByb3RvdHlwZSwgJ3RvU3RyaW5nJywgZnVuY3Rpb24gdG9TdHJpbmcoKSB7XG4gIHJldHVybiB0eXBlb2YgdGhpcyA9PSAnZnVuY3Rpb24nICYmIGdldEludGVybmFsU3RhdGUodGhpcykuc291cmNlIHx8IGluc3BlY3RTb3VyY2UodGhpcyk7XG59KTtcbiIsInZhciBnbG9iYWwgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvZ2xvYmFsJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZ2xvYmFsO1xuIiwidmFyIHBhdGggPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvcGF0aCcpO1xudmFyIGdsb2JhbCA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9nbG9iYWwnKTtcblxudmFyIGFGdW5jdGlvbiA9IGZ1bmN0aW9uICh2YXJpYWJsZSkge1xuICByZXR1cm4gdHlwZW9mIHZhcmlhYmxlID09ICdmdW5jdGlvbicgPyB2YXJpYWJsZSA6IHVuZGVmaW5lZDtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKG5hbWVzcGFjZSwgbWV0aG9kKSB7XG4gIHJldHVybiBhcmd1bWVudHMubGVuZ3RoIDwgMiA/IGFGdW5jdGlvbihwYXRoW25hbWVzcGFjZV0pIHx8IGFGdW5jdGlvbihnbG9iYWxbbmFtZXNwYWNlXSlcbiAgICA6IHBhdGhbbmFtZXNwYWNlXSAmJiBwYXRoW25hbWVzcGFjZV1bbWV0aG9kXSB8fCBnbG9iYWxbbmFtZXNwYWNlXSAmJiBnbG9iYWxbbmFtZXNwYWNlXVttZXRob2RdO1xufTtcbiIsInZhciBjZWlsID0gTWF0aC5jZWlsO1xudmFyIGZsb29yID0gTWF0aC5mbG9vcjtcblxuLy8gYFRvSW50ZWdlcmAgYWJzdHJhY3Qgb3BlcmF0aW9uXG4vLyBodHRwczovL3RjMzkuZXMvZWNtYTI2Mi8jc2VjLXRvaW50ZWdlclxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoYXJndW1lbnQpIHtcbiAgcmV0dXJuIGlzTmFOKGFyZ3VtZW50ID0gK2FyZ3VtZW50KSA/IDAgOiAoYXJndW1lbnQgPiAwID8gZmxvb3IgOiBjZWlsKShhcmd1bWVudCk7XG59O1xuIiwidmFyIHRvSW50ZWdlciA9IHJlcXVpcmUoJy4uL2ludGVybmFscy90by1pbnRlZ2VyJyk7XG5cbnZhciBtaW4gPSBNYXRoLm1pbjtcblxuLy8gYFRvTGVuZ3RoYCBhYnN0cmFjdCBvcGVyYXRpb25cbi8vIGh0dHBzOi8vdGMzOS5lcy9lY21hMjYyLyNzZWMtdG9sZW5ndGhcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGFyZ3VtZW50KSB7XG4gIHJldHVybiBhcmd1bWVudCA+IDAgPyBtaW4odG9JbnRlZ2VyKGFyZ3VtZW50KSwgMHgxRkZGRkZGRkZGRkZGRikgOiAwOyAvLyAyICoqIDUzIC0gMSA9PSA5MDA3MTk5MjU0NzQwOTkxXG59O1xuIiwidmFyIHRvSW50ZWdlciA9IHJlcXVpcmUoJy4uL2ludGVybmFscy90by1pbnRlZ2VyJyk7XG5cbnZhciBtYXggPSBNYXRoLm1heDtcbnZhciBtaW4gPSBNYXRoLm1pbjtcblxuLy8gSGVscGVyIGZvciBhIHBvcHVsYXIgcmVwZWF0aW5nIGNhc2Ugb2YgdGhlIHNwZWM6XG4vLyBMZXQgaW50ZWdlciBiZSA/IFRvSW50ZWdlcihpbmRleCkuXG4vLyBJZiBpbnRlZ2VyIDwgMCwgbGV0IHJlc3VsdCBiZSBtYXgoKGxlbmd0aCArIGludGVnZXIpLCAwKTsgZWxzZSBsZXQgcmVzdWx0IGJlIG1pbihpbnRlZ2VyLCBsZW5ndGgpLlxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoaW5kZXgsIGxlbmd0aCkge1xuICB2YXIgaW50ZWdlciA9IHRvSW50ZWdlcihpbmRleCk7XG4gIHJldHVybiBpbnRlZ2VyIDwgMCA/IG1heChpbnRlZ2VyICsgbGVuZ3RoLCAwKSA6IG1pbihpbnRlZ2VyLCBsZW5ndGgpO1xufTtcbiIsInZhciB0b0luZGV4ZWRPYmplY3QgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvdG8taW5kZXhlZC1vYmplY3QnKTtcbnZhciB0b0xlbmd0aCA9IHJlcXVpcmUoJy4uL2ludGVybmFscy90by1sZW5ndGgnKTtcbnZhciB0b0Fic29sdXRlSW5kZXggPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvdG8tYWJzb2x1dGUtaW5kZXgnKTtcblxuLy8gYEFycmF5LnByb3RvdHlwZS57IGluZGV4T2YsIGluY2x1ZGVzIH1gIG1ldGhvZHMgaW1wbGVtZW50YXRpb25cbnZhciBjcmVhdGVNZXRob2QgPSBmdW5jdGlvbiAoSVNfSU5DTFVERVMpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uICgkdGhpcywgZWwsIGZyb21JbmRleCkge1xuICAgIHZhciBPID0gdG9JbmRleGVkT2JqZWN0KCR0aGlzKTtcbiAgICB2YXIgbGVuZ3RoID0gdG9MZW5ndGgoTy5sZW5ndGgpO1xuICAgIHZhciBpbmRleCA9IHRvQWJzb2x1dGVJbmRleChmcm9tSW5kZXgsIGxlbmd0aCk7XG4gICAgdmFyIHZhbHVlO1xuICAgIC8vIEFycmF5I2luY2x1ZGVzIHVzZXMgU2FtZVZhbHVlWmVybyBlcXVhbGl0eSBhbGdvcml0aG1cbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tc2VsZi1jb21wYXJlXG4gICAgaWYgKElTX0lOQ0xVREVTICYmIGVsICE9IGVsKSB3aGlsZSAobGVuZ3RoID4gaW5kZXgpIHtcbiAgICAgIHZhbHVlID0gT1tpbmRleCsrXTtcbiAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1zZWxmLWNvbXBhcmVcbiAgICAgIGlmICh2YWx1ZSAhPSB2YWx1ZSkgcmV0dXJuIHRydWU7XG4gICAgLy8gQXJyYXkjaW5kZXhPZiBpZ25vcmVzIGhvbGVzLCBBcnJheSNpbmNsdWRlcyAtIG5vdFxuICAgIH0gZWxzZSBmb3IgKDtsZW5ndGggPiBpbmRleDsgaW5kZXgrKykge1xuICAgICAgaWYgKChJU19JTkNMVURFUyB8fCBpbmRleCBpbiBPKSAmJiBPW2luZGV4XSA9PT0gZWwpIHJldHVybiBJU19JTkNMVURFUyB8fCBpbmRleCB8fCAwO1xuICAgIH0gcmV0dXJuICFJU19JTkNMVURFUyAmJiAtMTtcbiAgfTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICAvLyBgQXJyYXkucHJvdG90eXBlLmluY2x1ZGVzYCBtZXRob2RcbiAgLy8gaHR0cHM6Ly90YzM5LmVzL2VjbWEyNjIvI3NlYy1hcnJheS5wcm90b3R5cGUuaW5jbHVkZXNcbiAgaW5jbHVkZXM6IGNyZWF0ZU1ldGhvZCh0cnVlKSxcbiAgLy8gYEFycmF5LnByb3RvdHlwZS5pbmRleE9mYCBtZXRob2RcbiAgLy8gaHR0cHM6Ly90YzM5LmVzL2VjbWEyNjIvI3NlYy1hcnJheS5wcm90b3R5cGUuaW5kZXhvZlxuICBpbmRleE9mOiBjcmVhdGVNZXRob2QoZmFsc2UpXG59O1xuIiwidmFyIGhhcyA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9oYXMnKTtcbnZhciB0b0luZGV4ZWRPYmplY3QgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvdG8taW5kZXhlZC1vYmplY3QnKTtcbnZhciBpbmRleE9mID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2FycmF5LWluY2x1ZGVzJykuaW5kZXhPZjtcbnZhciBoaWRkZW5LZXlzID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2hpZGRlbi1rZXlzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKG9iamVjdCwgbmFtZXMpIHtcbiAgdmFyIE8gPSB0b0luZGV4ZWRPYmplY3Qob2JqZWN0KTtcbiAgdmFyIGkgPSAwO1xuICB2YXIgcmVzdWx0ID0gW107XG4gIHZhciBrZXk7XG4gIGZvciAoa2V5IGluIE8pICFoYXMoaGlkZGVuS2V5cywga2V5KSAmJiBoYXMoTywga2V5KSAmJiByZXN1bHQucHVzaChrZXkpO1xuICAvLyBEb24ndCBlbnVtIGJ1ZyAmIGhpZGRlbiBrZXlzXG4gIHdoaWxlIChuYW1lcy5sZW5ndGggPiBpKSBpZiAoaGFzKE8sIGtleSA9IG5hbWVzW2krK10pKSB7XG4gICAgfmluZGV4T2YocmVzdWx0LCBrZXkpIHx8IHJlc3VsdC5wdXNoKGtleSk7XG4gIH1cbiAgcmV0dXJuIHJlc3VsdDtcbn07XG4iLCIvLyBJRTgtIGRvbid0IGVudW0gYnVnIGtleXNcbm1vZHVsZS5leHBvcnRzID0gW1xuICAnY29uc3RydWN0b3InLFxuICAnaGFzT3duUHJvcGVydHknLFxuICAnaXNQcm90b3R5cGVPZicsXG4gICdwcm9wZXJ0eUlzRW51bWVyYWJsZScsXG4gICd0b0xvY2FsZVN0cmluZycsXG4gICd0b1N0cmluZycsXG4gICd2YWx1ZU9mJ1xuXTtcbiIsInZhciBpbnRlcm5hbE9iamVjdEtleXMgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvb2JqZWN0LWtleXMtaW50ZXJuYWwnKTtcbnZhciBlbnVtQnVnS2V5cyA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9lbnVtLWJ1Zy1rZXlzJyk7XG5cbnZhciBoaWRkZW5LZXlzID0gZW51bUJ1Z0tleXMuY29uY2F0KCdsZW5ndGgnLCAncHJvdG90eXBlJyk7XG5cbi8vIGBPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lc2AgbWV0aG9kXG4vLyBodHRwczovL3RjMzkuZXMvZWNtYTI2Mi8jc2VjLW9iamVjdC5nZXRvd25wcm9wZXJ0eW5hbWVzXG5leHBvcnRzLmYgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyB8fCBmdW5jdGlvbiBnZXRPd25Qcm9wZXJ0eU5hbWVzKE8pIHtcbiAgcmV0dXJuIGludGVybmFsT2JqZWN0S2V5cyhPLCBoaWRkZW5LZXlzKTtcbn07XG4iLCJleHBvcnRzLmYgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlTeW1ib2xzO1xuIiwidmFyIGdldEJ1aWx0SW4gPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvZ2V0LWJ1aWx0LWluJyk7XG52YXIgZ2V0T3duUHJvcGVydHlOYW1lc01vZHVsZSA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9vYmplY3QtZ2V0LW93bi1wcm9wZXJ0eS1uYW1lcycpO1xudmFyIGdldE93blByb3BlcnR5U3ltYm9sc01vZHVsZSA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9vYmplY3QtZ2V0LW93bi1wcm9wZXJ0eS1zeW1ib2xzJyk7XG52YXIgYW5PYmplY3QgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvYW4tb2JqZWN0Jyk7XG5cbi8vIGFsbCBvYmplY3Qga2V5cywgaW5jbHVkZXMgbm9uLWVudW1lcmFibGUgYW5kIHN5bWJvbHNcbm1vZHVsZS5leHBvcnRzID0gZ2V0QnVpbHRJbignUmVmbGVjdCcsICdvd25LZXlzJykgfHwgZnVuY3Rpb24gb3duS2V5cyhpdCkge1xuICB2YXIga2V5cyA9IGdldE93blByb3BlcnR5TmFtZXNNb2R1bGUuZihhbk9iamVjdChpdCkpO1xuICB2YXIgZ2V0T3duUHJvcGVydHlTeW1ib2xzID0gZ2V0T3duUHJvcGVydHlTeW1ib2xzTW9kdWxlLmY7XG4gIHJldHVybiBnZXRPd25Qcm9wZXJ0eVN5bWJvbHMgPyBrZXlzLmNvbmNhdChnZXRPd25Qcm9wZXJ0eVN5bWJvbHMoaXQpKSA6IGtleXM7XG59O1xuIiwidmFyIGhhcyA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9oYXMnKTtcbnZhciBvd25LZXlzID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL293bi1rZXlzJyk7XG52YXIgZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yTW9kdWxlID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL29iamVjdC1nZXQtb3duLXByb3BlcnR5LWRlc2NyaXB0b3InKTtcbnZhciBkZWZpbmVQcm9wZXJ0eU1vZHVsZSA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9vYmplY3QtZGVmaW5lLXByb3BlcnR5Jyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKHRhcmdldCwgc291cmNlKSB7XG4gIHZhciBrZXlzID0gb3duS2V5cyhzb3VyY2UpO1xuICB2YXIgZGVmaW5lUHJvcGVydHkgPSBkZWZpbmVQcm9wZXJ0eU1vZHVsZS5mO1xuICB2YXIgZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yID0gZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yTW9kdWxlLmY7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwga2V5cy5sZW5ndGg7IGkrKykge1xuICAgIHZhciBrZXkgPSBrZXlzW2ldO1xuICAgIGlmICghaGFzKHRhcmdldCwga2V5KSkgZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBrZXksIGdldE93blByb3BlcnR5RGVzY3JpcHRvcihzb3VyY2UsIGtleSkpO1xuICB9XG59O1xuIiwidmFyIGZhaWxzID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2ZhaWxzJyk7XG5cbnZhciByZXBsYWNlbWVudCA9IC8jfFxcLnByb3RvdHlwZVxcLi87XG5cbnZhciBpc0ZvcmNlZCA9IGZ1bmN0aW9uIChmZWF0dXJlLCBkZXRlY3Rpb24pIHtcbiAgdmFyIHZhbHVlID0gZGF0YVtub3JtYWxpemUoZmVhdHVyZSldO1xuICByZXR1cm4gdmFsdWUgPT0gUE9MWUZJTEwgPyB0cnVlXG4gICAgOiB2YWx1ZSA9PSBOQVRJVkUgPyBmYWxzZVxuICAgIDogdHlwZW9mIGRldGVjdGlvbiA9PSAnZnVuY3Rpb24nID8gZmFpbHMoZGV0ZWN0aW9uKVxuICAgIDogISFkZXRlY3Rpb247XG59O1xuXG52YXIgbm9ybWFsaXplID0gaXNGb3JjZWQubm9ybWFsaXplID0gZnVuY3Rpb24gKHN0cmluZykge1xuICByZXR1cm4gU3RyaW5nKHN0cmluZykucmVwbGFjZShyZXBsYWNlbWVudCwgJy4nKS50b0xvd2VyQ2FzZSgpO1xufTtcblxudmFyIGRhdGEgPSBpc0ZvcmNlZC5kYXRhID0ge307XG52YXIgTkFUSVZFID0gaXNGb3JjZWQuTkFUSVZFID0gJ04nO1xudmFyIFBPTFlGSUxMID0gaXNGb3JjZWQuUE9MWUZJTEwgPSAnUCc7XG5cbm1vZHVsZS5leHBvcnRzID0gaXNGb3JjZWQ7XG4iLCJ2YXIgZ2xvYmFsID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2dsb2JhbCcpO1xudmFyIGdldE93blByb3BlcnR5RGVzY3JpcHRvciA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9vYmplY3QtZ2V0LW93bi1wcm9wZXJ0eS1kZXNjcmlwdG9yJykuZjtcbnZhciBjcmVhdGVOb25FbnVtZXJhYmxlUHJvcGVydHkgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvY3JlYXRlLW5vbi1lbnVtZXJhYmxlLXByb3BlcnR5Jyk7XG52YXIgcmVkZWZpbmUgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvcmVkZWZpbmUnKTtcbnZhciBzZXRHbG9iYWwgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvc2V0LWdsb2JhbCcpO1xudmFyIGNvcHlDb25zdHJ1Y3RvclByb3BlcnRpZXMgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvY29weS1jb25zdHJ1Y3Rvci1wcm9wZXJ0aWVzJyk7XG52YXIgaXNGb3JjZWQgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvaXMtZm9yY2VkJyk7XG5cbi8qXG4gIG9wdGlvbnMudGFyZ2V0ICAgICAgLSBuYW1lIG9mIHRoZSB0YXJnZXQgb2JqZWN0XG4gIG9wdGlvbnMuZ2xvYmFsICAgICAgLSB0YXJnZXQgaXMgdGhlIGdsb2JhbCBvYmplY3RcbiAgb3B0aW9ucy5zdGF0ICAgICAgICAtIGV4cG9ydCBhcyBzdGF0aWMgbWV0aG9kcyBvZiB0YXJnZXRcbiAgb3B0aW9ucy5wcm90byAgICAgICAtIGV4cG9ydCBhcyBwcm90b3R5cGUgbWV0aG9kcyBvZiB0YXJnZXRcbiAgb3B0aW9ucy5yZWFsICAgICAgICAtIHJlYWwgcHJvdG90eXBlIG1ldGhvZCBmb3IgdGhlIGBwdXJlYCB2ZXJzaW9uXG4gIG9wdGlvbnMuZm9yY2VkICAgICAgLSBleHBvcnQgZXZlbiBpZiB0aGUgbmF0aXZlIGZlYXR1cmUgaXMgYXZhaWxhYmxlXG4gIG9wdGlvbnMuYmluZCAgICAgICAgLSBiaW5kIG1ldGhvZHMgdG8gdGhlIHRhcmdldCwgcmVxdWlyZWQgZm9yIHRoZSBgcHVyZWAgdmVyc2lvblxuICBvcHRpb25zLndyYXAgICAgICAgIC0gd3JhcCBjb25zdHJ1Y3RvcnMgdG8gcHJldmVudGluZyBnbG9iYWwgcG9sbHV0aW9uLCByZXF1aXJlZCBmb3IgdGhlIGBwdXJlYCB2ZXJzaW9uXG4gIG9wdGlvbnMudW5zYWZlICAgICAgLSB1c2UgdGhlIHNpbXBsZSBhc3NpZ25tZW50IG9mIHByb3BlcnR5IGluc3RlYWQgb2YgZGVsZXRlICsgZGVmaW5lUHJvcGVydHlcbiAgb3B0aW9ucy5zaGFtICAgICAgICAtIGFkZCBhIGZsYWcgdG8gbm90IGNvbXBsZXRlbHkgZnVsbCBwb2x5ZmlsbHNcbiAgb3B0aW9ucy5lbnVtZXJhYmxlICAtIGV4cG9ydCBhcyBlbnVtZXJhYmxlIHByb3BlcnR5XG4gIG9wdGlvbnMubm9UYXJnZXRHZXQgLSBwcmV2ZW50IGNhbGxpbmcgYSBnZXR0ZXIgb24gdGFyZ2V0XG4qL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAob3B0aW9ucywgc291cmNlKSB7XG4gIHZhciBUQVJHRVQgPSBvcHRpb25zLnRhcmdldDtcbiAgdmFyIEdMT0JBTCA9IG9wdGlvbnMuZ2xvYmFsO1xuICB2YXIgU1RBVElDID0gb3B0aW9ucy5zdGF0O1xuICB2YXIgRk9SQ0VELCB0YXJnZXQsIGtleSwgdGFyZ2V0UHJvcGVydHksIHNvdXJjZVByb3BlcnR5LCBkZXNjcmlwdG9yO1xuICBpZiAoR0xPQkFMKSB7XG4gICAgdGFyZ2V0ID0gZ2xvYmFsO1xuICB9IGVsc2UgaWYgKFNUQVRJQykge1xuICAgIHRhcmdldCA9IGdsb2JhbFtUQVJHRVRdIHx8IHNldEdsb2JhbChUQVJHRVQsIHt9KTtcbiAgfSBlbHNlIHtcbiAgICB0YXJnZXQgPSAoZ2xvYmFsW1RBUkdFVF0gfHwge30pLnByb3RvdHlwZTtcbiAgfVxuICBpZiAodGFyZ2V0KSBmb3IgKGtleSBpbiBzb3VyY2UpIHtcbiAgICBzb3VyY2VQcm9wZXJ0eSA9IHNvdXJjZVtrZXldO1xuICAgIGlmIChvcHRpb25zLm5vVGFyZ2V0R2V0KSB7XG4gICAgICBkZXNjcmlwdG9yID0gZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKHRhcmdldCwga2V5KTtcbiAgICAgIHRhcmdldFByb3BlcnR5ID0gZGVzY3JpcHRvciAmJiBkZXNjcmlwdG9yLnZhbHVlO1xuICAgIH0gZWxzZSB0YXJnZXRQcm9wZXJ0eSA9IHRhcmdldFtrZXldO1xuICAgIEZPUkNFRCA9IGlzRm9yY2VkKEdMT0JBTCA/IGtleSA6IFRBUkdFVCArIChTVEFUSUMgPyAnLicgOiAnIycpICsga2V5LCBvcHRpb25zLmZvcmNlZCk7XG4gICAgLy8gY29udGFpbmVkIGluIHRhcmdldFxuICAgIGlmICghRk9SQ0VEICYmIHRhcmdldFByb3BlcnR5ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIGlmICh0eXBlb2Ygc291cmNlUHJvcGVydHkgPT09IHR5cGVvZiB0YXJnZXRQcm9wZXJ0eSkgY29udGludWU7XG4gICAgICBjb3B5Q29uc3RydWN0b3JQcm9wZXJ0aWVzKHNvdXJjZVByb3BlcnR5LCB0YXJnZXRQcm9wZXJ0eSk7XG4gICAgfVxuICAgIC8vIGFkZCBhIGZsYWcgdG8gbm90IGNvbXBsZXRlbHkgZnVsbCBwb2x5ZmlsbHNcbiAgICBpZiAob3B0aW9ucy5zaGFtIHx8ICh0YXJnZXRQcm9wZXJ0eSAmJiB0YXJnZXRQcm9wZXJ0eS5zaGFtKSkge1xuICAgICAgY3JlYXRlTm9uRW51bWVyYWJsZVByb3BlcnR5KHNvdXJjZVByb3BlcnR5LCAnc2hhbScsIHRydWUpO1xuICAgIH1cbiAgICAvLyBleHRlbmQgZ2xvYmFsXG4gICAgcmVkZWZpbmUodGFyZ2V0LCBrZXksIHNvdXJjZVByb3BlcnR5LCBvcHRpb25zKTtcbiAgfVxufTtcbiIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGl0KSB7XG4gIGlmICh0eXBlb2YgaXQgIT0gJ2Z1bmN0aW9uJykge1xuICAgIHRocm93IFR5cGVFcnJvcihTdHJpbmcoaXQpICsgJyBpcyBub3QgYSBmdW5jdGlvbicpO1xuICB9IHJldHVybiBpdDtcbn07XG4iLCJ2YXIgYUZ1bmN0aW9uID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2EtZnVuY3Rpb24nKTtcblxuLy8gb3B0aW9uYWwgLyBzaW1wbGUgY29udGV4dCBiaW5kaW5nXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChmbiwgdGhhdCwgbGVuZ3RoKSB7XG4gIGFGdW5jdGlvbihmbik7XG4gIGlmICh0aGF0ID09PSB1bmRlZmluZWQpIHJldHVybiBmbjtcbiAgc3dpdGNoIChsZW5ndGgpIHtcbiAgICBjYXNlIDA6IHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4gZm4uY2FsbCh0aGF0KTtcbiAgICB9O1xuICAgIGNhc2UgMTogcmV0dXJuIGZ1bmN0aW9uIChhKSB7XG4gICAgICByZXR1cm4gZm4uY2FsbCh0aGF0LCBhKTtcbiAgICB9O1xuICAgIGNhc2UgMjogcmV0dXJuIGZ1bmN0aW9uIChhLCBiKSB7XG4gICAgICByZXR1cm4gZm4uY2FsbCh0aGF0LCBhLCBiKTtcbiAgICB9O1xuICAgIGNhc2UgMzogcmV0dXJuIGZ1bmN0aW9uIChhLCBiLCBjKSB7XG4gICAgICByZXR1cm4gZm4uY2FsbCh0aGF0LCBhLCBiLCBjKTtcbiAgICB9O1xuICB9XG4gIHJldHVybiBmdW5jdGlvbiAoLyogLi4uYXJncyAqLykge1xuICAgIHJldHVybiBmbi5hcHBseSh0aGF0LCBhcmd1bWVudHMpO1xuICB9O1xufTtcbiIsInZhciByZXF1aXJlT2JqZWN0Q29lcmNpYmxlID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL3JlcXVpcmUtb2JqZWN0LWNvZXJjaWJsZScpO1xuXG4vLyBgVG9PYmplY3RgIGFic3RyYWN0IG9wZXJhdGlvblxuLy8gaHR0cHM6Ly90YzM5LmVzL2VjbWEyNjIvI3NlYy10b29iamVjdFxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoYXJndW1lbnQpIHtcbiAgcmV0dXJuIE9iamVjdChyZXF1aXJlT2JqZWN0Q29lcmNpYmxlKGFyZ3VtZW50KSk7XG59O1xuIiwidmFyIGNsYXNzb2YgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvY2xhc3NvZi1yYXcnKTtcblxuLy8gYElzQXJyYXlgIGFic3RyYWN0IG9wZXJhdGlvblxuLy8gaHR0cHM6Ly90YzM5LmVzL2VjbWEyNjIvI3NlYy1pc2FycmF5XG5tb2R1bGUuZXhwb3J0cyA9IEFycmF5LmlzQXJyYXkgfHwgZnVuY3Rpb24gaXNBcnJheShhcmcpIHtcbiAgcmV0dXJuIGNsYXNzb2YoYXJnKSA9PSAnQXJyYXknO1xufTtcbiIsInZhciBmYWlscyA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9mYWlscycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9ICEhT2JqZWN0LmdldE93blByb3BlcnR5U3ltYm9scyAmJiAhZmFpbHMoZnVuY3Rpb24gKCkge1xuICAvLyBDaHJvbWUgMzggU3ltYm9sIGhhcyBpbmNvcnJlY3QgdG9TdHJpbmcgY29udmVyc2lvblxuICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tdW5kZWZcbiAgcmV0dXJuICFTdHJpbmcoU3ltYm9sKCkpO1xufSk7XG4iLCJ2YXIgTkFUSVZFX1NZTUJPTCA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9uYXRpdmUtc3ltYm9sJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gTkFUSVZFX1NZTUJPTFxuICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tdW5kZWZcbiAgJiYgIVN5bWJvbC5zaGFtXG4gIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby11bmRlZlxuICAmJiB0eXBlb2YgU3ltYm9sLml0ZXJhdG9yID09ICdzeW1ib2wnO1xuIiwidmFyIGdsb2JhbCA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9nbG9iYWwnKTtcbnZhciBzaGFyZWQgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvc2hhcmVkJyk7XG52YXIgaGFzID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2hhcycpO1xudmFyIHVpZCA9IHJlcXVpcmUoJy4uL2ludGVybmFscy91aWQnKTtcbnZhciBOQVRJVkVfU1lNQk9MID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL25hdGl2ZS1zeW1ib2wnKTtcbnZhciBVU0VfU1lNQk9MX0FTX1VJRCA9IHJlcXVpcmUoJy4uL2ludGVybmFscy91c2Utc3ltYm9sLWFzLXVpZCcpO1xuXG52YXIgV2VsbEtub3duU3ltYm9sc1N0b3JlID0gc2hhcmVkKCd3a3MnKTtcbnZhciBTeW1ib2wgPSBnbG9iYWwuU3ltYm9sO1xudmFyIGNyZWF0ZVdlbGxLbm93blN5bWJvbCA9IFVTRV9TWU1CT0xfQVNfVUlEID8gU3ltYm9sIDogU3ltYm9sICYmIFN5bWJvbC53aXRob3V0U2V0dGVyIHx8IHVpZDtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAobmFtZSkge1xuICBpZiAoIWhhcyhXZWxsS25vd25TeW1ib2xzU3RvcmUsIG5hbWUpKSB7XG4gICAgaWYgKE5BVElWRV9TWU1CT0wgJiYgaGFzKFN5bWJvbCwgbmFtZSkpIFdlbGxLbm93blN5bWJvbHNTdG9yZVtuYW1lXSA9IFN5bWJvbFtuYW1lXTtcbiAgICBlbHNlIFdlbGxLbm93blN5bWJvbHNTdG9yZVtuYW1lXSA9IGNyZWF0ZVdlbGxLbm93blN5bWJvbCgnU3ltYm9sLicgKyBuYW1lKTtcbiAgfSByZXR1cm4gV2VsbEtub3duU3ltYm9sc1N0b3JlW25hbWVdO1xufTtcbiIsInZhciBpc09iamVjdCA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9pcy1vYmplY3QnKTtcbnZhciBpc0FycmF5ID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2lzLWFycmF5Jyk7XG52YXIgd2VsbEtub3duU3ltYm9sID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL3dlbGwta25vd24tc3ltYm9sJyk7XG5cbnZhciBTUEVDSUVTID0gd2VsbEtub3duU3ltYm9sKCdzcGVjaWVzJyk7XG5cbi8vIGBBcnJheVNwZWNpZXNDcmVhdGVgIGFic3RyYWN0IG9wZXJhdGlvblxuLy8gaHR0cHM6Ly90YzM5LmVzL2VjbWEyNjIvI3NlYy1hcnJheXNwZWNpZXNjcmVhdGVcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKG9yaWdpbmFsQXJyYXksIGxlbmd0aCkge1xuICB2YXIgQztcbiAgaWYgKGlzQXJyYXkob3JpZ2luYWxBcnJheSkpIHtcbiAgICBDID0gb3JpZ2luYWxBcnJheS5jb25zdHJ1Y3RvcjtcbiAgICAvLyBjcm9zcy1yZWFsbSBmYWxsYmFja1xuICAgIGlmICh0eXBlb2YgQyA9PSAnZnVuY3Rpb24nICYmIChDID09PSBBcnJheSB8fCBpc0FycmF5KEMucHJvdG90eXBlKSkpIEMgPSB1bmRlZmluZWQ7XG4gICAgZWxzZSBpZiAoaXNPYmplY3QoQykpIHtcbiAgICAgIEMgPSBDW1NQRUNJRVNdO1xuICAgICAgaWYgKEMgPT09IG51bGwpIEMgPSB1bmRlZmluZWQ7XG4gICAgfVxuICB9IHJldHVybiBuZXcgKEMgPT09IHVuZGVmaW5lZCA/IEFycmF5IDogQykobGVuZ3RoID09PSAwID8gMCA6IGxlbmd0aCk7XG59O1xuIiwidmFyIGJpbmQgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvZnVuY3Rpb24tYmluZC1jb250ZXh0Jyk7XG52YXIgSW5kZXhlZE9iamVjdCA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9pbmRleGVkLW9iamVjdCcpO1xudmFyIHRvT2JqZWN0ID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL3RvLW9iamVjdCcpO1xudmFyIHRvTGVuZ3RoID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL3RvLWxlbmd0aCcpO1xudmFyIGFycmF5U3BlY2llc0NyZWF0ZSA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9hcnJheS1zcGVjaWVzLWNyZWF0ZScpO1xuXG52YXIgcHVzaCA9IFtdLnB1c2g7XG5cbi8vIGBBcnJheS5wcm90b3R5cGUueyBmb3JFYWNoLCBtYXAsIGZpbHRlciwgc29tZSwgZXZlcnksIGZpbmQsIGZpbmRJbmRleCwgZmlsdGVyT3V0IH1gIG1ldGhvZHMgaW1wbGVtZW50YXRpb25cbnZhciBjcmVhdGVNZXRob2QgPSBmdW5jdGlvbiAoVFlQRSkge1xuICB2YXIgSVNfTUFQID0gVFlQRSA9PSAxO1xuICB2YXIgSVNfRklMVEVSID0gVFlQRSA9PSAyO1xuICB2YXIgSVNfU09NRSA9IFRZUEUgPT0gMztcbiAgdmFyIElTX0VWRVJZID0gVFlQRSA9PSA0O1xuICB2YXIgSVNfRklORF9JTkRFWCA9IFRZUEUgPT0gNjtcbiAgdmFyIElTX0ZJTFRFUl9PVVQgPSBUWVBFID09IDc7XG4gIHZhciBOT19IT0xFUyA9IFRZUEUgPT0gNSB8fCBJU19GSU5EX0lOREVYO1xuICByZXR1cm4gZnVuY3Rpb24gKCR0aGlzLCBjYWxsYmFja2ZuLCB0aGF0LCBzcGVjaWZpY0NyZWF0ZSkge1xuICAgIHZhciBPID0gdG9PYmplY3QoJHRoaXMpO1xuICAgIHZhciBzZWxmID0gSW5kZXhlZE9iamVjdChPKTtcbiAgICB2YXIgYm91bmRGdW5jdGlvbiA9IGJpbmQoY2FsbGJhY2tmbiwgdGhhdCwgMyk7XG4gICAgdmFyIGxlbmd0aCA9IHRvTGVuZ3RoKHNlbGYubGVuZ3RoKTtcbiAgICB2YXIgaW5kZXggPSAwO1xuICAgIHZhciBjcmVhdGUgPSBzcGVjaWZpY0NyZWF0ZSB8fCBhcnJheVNwZWNpZXNDcmVhdGU7XG4gICAgdmFyIHRhcmdldCA9IElTX01BUCA/IGNyZWF0ZSgkdGhpcywgbGVuZ3RoKSA6IElTX0ZJTFRFUiB8fCBJU19GSUxURVJfT1VUID8gY3JlYXRlKCR0aGlzLCAwKSA6IHVuZGVmaW5lZDtcbiAgICB2YXIgdmFsdWUsIHJlc3VsdDtcbiAgICBmb3IgKDtsZW5ndGggPiBpbmRleDsgaW5kZXgrKykgaWYgKE5PX0hPTEVTIHx8IGluZGV4IGluIHNlbGYpIHtcbiAgICAgIHZhbHVlID0gc2VsZltpbmRleF07XG4gICAgICByZXN1bHQgPSBib3VuZEZ1bmN0aW9uKHZhbHVlLCBpbmRleCwgTyk7XG4gICAgICBpZiAoVFlQRSkge1xuICAgICAgICBpZiAoSVNfTUFQKSB0YXJnZXRbaW5kZXhdID0gcmVzdWx0OyAvLyBtYXBcbiAgICAgICAgZWxzZSBpZiAocmVzdWx0KSBzd2l0Y2ggKFRZUEUpIHtcbiAgICAgICAgICBjYXNlIDM6IHJldHVybiB0cnVlOyAgICAgICAgICAgICAgLy8gc29tZVxuICAgICAgICAgIGNhc2UgNTogcmV0dXJuIHZhbHVlOyAgICAgICAgICAgICAvLyBmaW5kXG4gICAgICAgICAgY2FzZSA2OiByZXR1cm4gaW5kZXg7ICAgICAgICAgICAgIC8vIGZpbmRJbmRleFxuICAgICAgICAgIGNhc2UgMjogcHVzaC5jYWxsKHRhcmdldCwgdmFsdWUpOyAvLyBmaWx0ZXJcbiAgICAgICAgfSBlbHNlIHN3aXRjaCAoVFlQRSkge1xuICAgICAgICAgIGNhc2UgNDogcmV0dXJuIGZhbHNlOyAgICAgICAgICAgICAvLyBldmVyeVxuICAgICAgICAgIGNhc2UgNzogcHVzaC5jYWxsKHRhcmdldCwgdmFsdWUpOyAvLyBmaWx0ZXJPdXRcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gSVNfRklORF9JTkRFWCA/IC0xIDogSVNfU09NRSB8fCBJU19FVkVSWSA/IElTX0VWRVJZIDogdGFyZ2V0O1xuICB9O1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIC8vIGBBcnJheS5wcm90b3R5cGUuZm9yRWFjaGAgbWV0aG9kXG4gIC8vIGh0dHBzOi8vdGMzOS5lcy9lY21hMjYyLyNzZWMtYXJyYXkucHJvdG90eXBlLmZvcmVhY2hcbiAgZm9yRWFjaDogY3JlYXRlTWV0aG9kKDApLFxuICAvLyBgQXJyYXkucHJvdG90eXBlLm1hcGAgbWV0aG9kXG4gIC8vIGh0dHBzOi8vdGMzOS5lcy9lY21hMjYyLyNzZWMtYXJyYXkucHJvdG90eXBlLm1hcFxuICBtYXA6IGNyZWF0ZU1ldGhvZCgxKSxcbiAgLy8gYEFycmF5LnByb3RvdHlwZS5maWx0ZXJgIG1ldGhvZFxuICAvLyBodHRwczovL3RjMzkuZXMvZWNtYTI2Mi8jc2VjLWFycmF5LnByb3RvdHlwZS5maWx0ZXJcbiAgZmlsdGVyOiBjcmVhdGVNZXRob2QoMiksXG4gIC8vIGBBcnJheS5wcm90b3R5cGUuc29tZWAgbWV0aG9kXG4gIC8vIGh0dHBzOi8vdGMzOS5lcy9lY21hMjYyLyNzZWMtYXJyYXkucHJvdG90eXBlLnNvbWVcbiAgc29tZTogY3JlYXRlTWV0aG9kKDMpLFxuICAvLyBgQXJyYXkucHJvdG90eXBlLmV2ZXJ5YCBtZXRob2RcbiAgLy8gaHR0cHM6Ly90YzM5LmVzL2VjbWEyNjIvI3NlYy1hcnJheS5wcm90b3R5cGUuZXZlcnlcbiAgZXZlcnk6IGNyZWF0ZU1ldGhvZCg0KSxcbiAgLy8gYEFycmF5LnByb3RvdHlwZS5maW5kYCBtZXRob2RcbiAgLy8gaHR0cHM6Ly90YzM5LmVzL2VjbWEyNjIvI3NlYy1hcnJheS5wcm90b3R5cGUuZmluZFxuICBmaW5kOiBjcmVhdGVNZXRob2QoNSksXG4gIC8vIGBBcnJheS5wcm90b3R5cGUuZmluZEluZGV4YCBtZXRob2RcbiAgLy8gaHR0cHM6Ly90YzM5LmVzL2VjbWEyNjIvI3NlYy1hcnJheS5wcm90b3R5cGUuZmluZEluZGV4XG4gIGZpbmRJbmRleDogY3JlYXRlTWV0aG9kKDYpLFxuICAvLyBgQXJyYXkucHJvdG90eXBlLmZpbHRlck91dGAgbWV0aG9kXG4gIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS90YzM5L3Byb3Bvc2FsLWFycmF5LWZpbHRlcmluZ1xuICBmaWx0ZXJPdXQ6IGNyZWF0ZU1ldGhvZCg3KVxufTtcbiIsIid1c2Ugc3RyaWN0JztcbnZhciBmYWlscyA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9mYWlscycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChNRVRIT0RfTkFNRSwgYXJndW1lbnQpIHtcbiAgdmFyIG1ldGhvZCA9IFtdW01FVEhPRF9OQU1FXTtcbiAgcmV0dXJuICEhbWV0aG9kICYmIGZhaWxzKGZ1bmN0aW9uICgpIHtcbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tdXNlbGVzcy1jYWxsLG5vLXRocm93LWxpdGVyYWxcbiAgICBtZXRob2QuY2FsbChudWxsLCBhcmd1bWVudCB8fCBmdW5jdGlvbiAoKSB7IHRocm93IDE7IH0sIDEpO1xuICB9KTtcbn07XG4iLCJ2YXIgREVTQ1JJUFRPUlMgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvZGVzY3JpcHRvcnMnKTtcbnZhciBmYWlscyA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9mYWlscycpO1xudmFyIGhhcyA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9oYXMnKTtcblxudmFyIGRlZmluZVByb3BlcnR5ID0gT2JqZWN0LmRlZmluZVByb3BlcnR5O1xudmFyIGNhY2hlID0ge307XG5cbnZhciB0aHJvd2VyID0gZnVuY3Rpb24gKGl0KSB7IHRocm93IGl0OyB9O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChNRVRIT0RfTkFNRSwgb3B0aW9ucykge1xuICBpZiAoaGFzKGNhY2hlLCBNRVRIT0RfTkFNRSkpIHJldHVybiBjYWNoZVtNRVRIT0RfTkFNRV07XG4gIGlmICghb3B0aW9ucykgb3B0aW9ucyA9IHt9O1xuICB2YXIgbWV0aG9kID0gW11bTUVUSE9EX05BTUVdO1xuICB2YXIgQUNDRVNTT1JTID0gaGFzKG9wdGlvbnMsICdBQ0NFU1NPUlMnKSA/IG9wdGlvbnMuQUNDRVNTT1JTIDogZmFsc2U7XG4gIHZhciBhcmd1bWVudDAgPSBoYXMob3B0aW9ucywgMCkgPyBvcHRpb25zWzBdIDogdGhyb3dlcjtcbiAgdmFyIGFyZ3VtZW50MSA9IGhhcyhvcHRpb25zLCAxKSA/IG9wdGlvbnNbMV0gOiB1bmRlZmluZWQ7XG5cbiAgcmV0dXJuIGNhY2hlW01FVEhPRF9OQU1FXSA9ICEhbWV0aG9kICYmICFmYWlscyhmdW5jdGlvbiAoKSB7XG4gICAgaWYgKEFDQ0VTU09SUyAmJiAhREVTQ1JJUFRPUlMpIHJldHVybiB0cnVlO1xuICAgIHZhciBPID0geyBsZW5ndGg6IC0xIH07XG5cbiAgICBpZiAoQUNDRVNTT1JTKSBkZWZpbmVQcm9wZXJ0eShPLCAxLCB7IGVudW1lcmFibGU6IHRydWUsIGdldDogdGhyb3dlciB9KTtcbiAgICBlbHNlIE9bMV0gPSAxO1xuXG4gICAgbWV0aG9kLmNhbGwoTywgYXJndW1lbnQwLCBhcmd1bWVudDEpO1xuICB9KTtcbn07XG4iLCIndXNlIHN0cmljdCc7XG52YXIgJGZvckVhY2ggPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvYXJyYXktaXRlcmF0aW9uJykuZm9yRWFjaDtcbnZhciBhcnJheU1ldGhvZElzU3RyaWN0ID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2FycmF5LW1ldGhvZC1pcy1zdHJpY3QnKTtcbnZhciBhcnJheU1ldGhvZFVzZXNUb0xlbmd0aCA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9hcnJheS1tZXRob2QtdXNlcy10by1sZW5ndGgnKTtcblxudmFyIFNUUklDVF9NRVRIT0QgPSBhcnJheU1ldGhvZElzU3RyaWN0KCdmb3JFYWNoJyk7XG52YXIgVVNFU19UT19MRU5HVEggPSBhcnJheU1ldGhvZFVzZXNUb0xlbmd0aCgnZm9yRWFjaCcpO1xuXG4vLyBgQXJyYXkucHJvdG90eXBlLmZvckVhY2hgIG1ldGhvZCBpbXBsZW1lbnRhdGlvblxuLy8gaHR0cHM6Ly90YzM5LmVzL2VjbWEyNjIvI3NlYy1hcnJheS5wcm90b3R5cGUuZm9yZWFjaFxubW9kdWxlLmV4cG9ydHMgPSAoIVNUUklDVF9NRVRIT0QgfHwgIVVTRVNfVE9fTEVOR1RIKSA/IGZ1bmN0aW9uIGZvckVhY2goY2FsbGJhY2tmbiAvKiAsIHRoaXNBcmcgKi8pIHtcbiAgcmV0dXJuICRmb3JFYWNoKHRoaXMsIGNhbGxiYWNrZm4sIGFyZ3VtZW50cy5sZW5ndGggPiAxID8gYXJndW1lbnRzWzFdIDogdW5kZWZpbmVkKTtcbn0gOiBbXS5mb3JFYWNoO1xuIiwiJ3VzZSBzdHJpY3QnO1xudmFyICQgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvZXhwb3J0Jyk7XG52YXIgZm9yRWFjaCA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9hcnJheS1mb3ItZWFjaCcpO1xuXG4vLyBgQXJyYXkucHJvdG90eXBlLmZvckVhY2hgIG1ldGhvZFxuLy8gaHR0cHM6Ly90YzM5LmVzL2VjbWEyNjIvI3NlYy1hcnJheS5wcm90b3R5cGUuZm9yZWFjaFxuJCh7IHRhcmdldDogJ0FycmF5JywgcHJvdG86IHRydWUsIGZvcmNlZDogW10uZm9yRWFjaCAhPSBmb3JFYWNoIH0sIHtcbiAgZm9yRWFjaDogZm9yRWFjaFxufSk7XG4iLCIvLyBpdGVyYWJsZSBET00gY29sbGVjdGlvbnNcbi8vIGZsYWcgLSBgaXRlcmFibGVgIGludGVyZmFjZSAtICdlbnRyaWVzJywgJ2tleXMnLCAndmFsdWVzJywgJ2ZvckVhY2gnIG1ldGhvZHNcbm1vZHVsZS5leHBvcnRzID0ge1xuICBDU1NSdWxlTGlzdDogMCxcbiAgQ1NTU3R5bGVEZWNsYXJhdGlvbjogMCxcbiAgQ1NTVmFsdWVMaXN0OiAwLFxuICBDbGllbnRSZWN0TGlzdDogMCxcbiAgRE9NUmVjdExpc3Q6IDAsXG4gIERPTVN0cmluZ0xpc3Q6IDAsXG4gIERPTVRva2VuTGlzdDogMSxcbiAgRGF0YVRyYW5zZmVySXRlbUxpc3Q6IDAsXG4gIEZpbGVMaXN0OiAwLFxuICBIVE1MQWxsQ29sbGVjdGlvbjogMCxcbiAgSFRNTENvbGxlY3Rpb246IDAsXG4gIEhUTUxGb3JtRWxlbWVudDogMCxcbiAgSFRNTFNlbGVjdEVsZW1lbnQ6IDAsXG4gIE1lZGlhTGlzdDogMCxcbiAgTWltZVR5cGVBcnJheTogMCxcbiAgTmFtZWROb2RlTWFwOiAwLFxuICBOb2RlTGlzdDogMSxcbiAgUGFpbnRSZXF1ZXN0TGlzdDogMCxcbiAgUGx1Z2luOiAwLFxuICBQbHVnaW5BcnJheTogMCxcbiAgU1ZHTGVuZ3RoTGlzdDogMCxcbiAgU1ZHTnVtYmVyTGlzdDogMCxcbiAgU1ZHUGF0aFNlZ0xpc3Q6IDAsXG4gIFNWR1BvaW50TGlzdDogMCxcbiAgU1ZHU3RyaW5nTGlzdDogMCxcbiAgU1ZHVHJhbnNmb3JtTGlzdDogMCxcbiAgU291cmNlQnVmZmVyTGlzdDogMCxcbiAgU3R5bGVTaGVldExpc3Q6IDAsXG4gIFRleHRUcmFja0N1ZUxpc3Q6IDAsXG4gIFRleHRUcmFja0xpc3Q6IDAsXG4gIFRvdWNoTGlzdDogMFxufTtcbiIsInZhciBnbG9iYWwgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvZ2xvYmFsJyk7XG52YXIgRE9NSXRlcmFibGVzID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2RvbS1pdGVyYWJsZXMnKTtcbnZhciBmb3JFYWNoID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2FycmF5LWZvci1lYWNoJyk7XG52YXIgY3JlYXRlTm9uRW51bWVyYWJsZVByb3BlcnR5ID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2NyZWF0ZS1ub24tZW51bWVyYWJsZS1wcm9wZXJ0eScpO1xuXG5mb3IgKHZhciBDT0xMRUNUSU9OX05BTUUgaW4gRE9NSXRlcmFibGVzKSB7XG4gIHZhciBDb2xsZWN0aW9uID0gZ2xvYmFsW0NPTExFQ1RJT05fTkFNRV07XG4gIHZhciBDb2xsZWN0aW9uUHJvdG90eXBlID0gQ29sbGVjdGlvbiAmJiBDb2xsZWN0aW9uLnByb3RvdHlwZTtcbiAgLy8gc29tZSBDaHJvbWUgdmVyc2lvbnMgaGF2ZSBub24tY29uZmlndXJhYmxlIG1ldGhvZHMgb24gRE9NVG9rZW5MaXN0XG4gIGlmIChDb2xsZWN0aW9uUHJvdG90eXBlICYmIENvbGxlY3Rpb25Qcm90b3R5cGUuZm9yRWFjaCAhPT0gZm9yRWFjaCkgdHJ5IHtcbiAgICBjcmVhdGVOb25FbnVtZXJhYmxlUHJvcGVydHkoQ29sbGVjdGlvblByb3RvdHlwZSwgJ2ZvckVhY2gnLCBmb3JFYWNoKTtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBDb2xsZWN0aW9uUHJvdG90eXBlLmZvckVhY2ggPSBmb3JFYWNoO1xuICB9XG59XG4iLCIvKiEgbnBtLmltL29iamVjdC1maXQtaW1hZ2VzIDMuMi40ICovXG4ndXNlIHN0cmljdCc7XG5cbnZhciBPRkkgPSAnYmZyZWQtaXQ6b2JqZWN0LWZpdC1pbWFnZXMnO1xudmFyIHByb3BSZWdleCA9IC8ob2JqZWN0LWZpdHxvYmplY3QtcG9zaXRpb24pXFxzKjpcXHMqKFstLlxcd1xccyVdKykvZztcbnZhciB0ZXN0SW1nID0gdHlwZW9mIEltYWdlID09PSAndW5kZWZpbmVkJyA/IHtzdHlsZTogeydvYmplY3QtcG9zaXRpb24nOiAxfX0gOiBuZXcgSW1hZ2UoKTtcbnZhciBzdXBwb3J0c09iamVjdEZpdCA9ICdvYmplY3QtZml0JyBpbiB0ZXN0SW1nLnN0eWxlO1xudmFyIHN1cHBvcnRzT2JqZWN0UG9zaXRpb24gPSAnb2JqZWN0LXBvc2l0aW9uJyBpbiB0ZXN0SW1nLnN0eWxlO1xudmFyIHN1cHBvcnRzT0ZJID0gJ2JhY2tncm91bmQtc2l6ZScgaW4gdGVzdEltZy5zdHlsZTtcbnZhciBzdXBwb3J0c0N1cnJlbnRTcmMgPSB0eXBlb2YgdGVzdEltZy5jdXJyZW50U3JjID09PSAnc3RyaW5nJztcbnZhciBuYXRpdmVHZXRBdHRyaWJ1dGUgPSB0ZXN0SW1nLmdldEF0dHJpYnV0ZTtcbnZhciBuYXRpdmVTZXRBdHRyaWJ1dGUgPSB0ZXN0SW1nLnNldEF0dHJpYnV0ZTtcbnZhciBhdXRvTW9kZUVuYWJsZWQgPSBmYWxzZTtcblxuZnVuY3Rpb24gY3JlYXRlUGxhY2Vob2xkZXIodywgaCkge1xuXHRyZXR1cm4gKFwiZGF0YTppbWFnZS9zdmcreG1sLCUzQ3N2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHdpZHRoPSdcIiArIHcgKyBcIicgaGVpZ2h0PSdcIiArIGggKyBcIiclM0UlM0Mvc3ZnJTNFXCIpO1xufVxuXG5mdW5jdGlvbiBwb2x5ZmlsbEN1cnJlbnRTcmMoZWwpIHtcblx0aWYgKGVsLnNyY3NldCAmJiAhc3VwcG9ydHNDdXJyZW50U3JjICYmIHdpbmRvdy5waWN0dXJlZmlsbCkge1xuXHRcdHZhciBwZiA9IHdpbmRvdy5waWN0dXJlZmlsbC5fO1xuXHRcdC8vIHBhcnNlIHNyY3NldCB3aXRoIHBpY3R1cmVmaWxsIHdoZXJlIGN1cnJlbnRTcmMgaXNuJ3QgYXZhaWxhYmxlXG5cdFx0aWYgKCFlbFtwZi5uc10gfHwgIWVsW3BmLm5zXS5ldmFsZWQpIHtcblx0XHRcdC8vIGZvcmNlIHN5bmNocm9ub3VzIHNyY3NldCBwYXJzaW5nXG5cdFx0XHRwZi5maWxsSW1nKGVsLCB7cmVzZWxlY3Q6IHRydWV9KTtcblx0XHR9XG5cblx0XHRpZiAoIWVsW3BmLm5zXS5jdXJTcmMpIHtcblx0XHRcdC8vIGZvcmNlIHBpY3R1cmVmaWxsIHRvIHBhcnNlIHNyY3NldFxuXHRcdFx0ZWxbcGYubnNdLnN1cHBvcnRlZCA9IGZhbHNlO1xuXHRcdFx0cGYuZmlsbEltZyhlbCwge3Jlc2VsZWN0OiB0cnVlfSk7XG5cdFx0fVxuXG5cdFx0Ly8gcmV0cmlldmUgcGFyc2VkIGN1cnJlbnRTcmMsIGlmIGFueVxuXHRcdGVsLmN1cnJlbnRTcmMgPSBlbFtwZi5uc10uY3VyU3JjIHx8IGVsLnNyYztcblx0fVxufVxuXG5mdW5jdGlvbiBnZXRTdHlsZShlbCkge1xuXHR2YXIgc3R5bGUgPSBnZXRDb21wdXRlZFN0eWxlKGVsKS5mb250RmFtaWx5O1xuXHR2YXIgcGFyc2VkO1xuXHR2YXIgcHJvcHMgPSB7fTtcblx0d2hpbGUgKChwYXJzZWQgPSBwcm9wUmVnZXguZXhlYyhzdHlsZSkpICE9PSBudWxsKSB7XG5cdFx0cHJvcHNbcGFyc2VkWzFdXSA9IHBhcnNlZFsyXTtcblx0fVxuXHRyZXR1cm4gcHJvcHM7XG59XG5cbmZ1bmN0aW9uIHNldFBsYWNlaG9sZGVyKGltZywgd2lkdGgsIGhlaWdodCkge1xuXHQvLyBEZWZhdWx0OiBmaWxsIHdpZHRoLCBubyBoZWlnaHRcblx0dmFyIHBsYWNlaG9sZGVyID0gY3JlYXRlUGxhY2Vob2xkZXIod2lkdGggfHwgMSwgaGVpZ2h0IHx8IDApO1xuXG5cdC8vIE9ubHkgc2V0IHBsYWNlaG9sZGVyIGlmIGl0J3MgZGlmZmVyZW50XG5cdGlmIChuYXRpdmVHZXRBdHRyaWJ1dGUuY2FsbChpbWcsICdzcmMnKSAhPT0gcGxhY2Vob2xkZXIpIHtcblx0XHRuYXRpdmVTZXRBdHRyaWJ1dGUuY2FsbChpbWcsICdzcmMnLCBwbGFjZWhvbGRlcik7XG5cdH1cbn1cblxuZnVuY3Rpb24gb25JbWFnZVJlYWR5KGltZywgY2FsbGJhY2spIHtcblx0Ly8gbmF0dXJhbFdpZHRoIGlzIG9ubHkgYXZhaWxhYmxlIHdoZW4gdGhlIGltYWdlIGhlYWRlcnMgYXJlIGxvYWRlZCxcblx0Ly8gdGhpcyBsb29wIHdpbGwgcG9sbCBpdCBldmVyeSAxMDBtcy5cblx0aWYgKGltZy5uYXR1cmFsV2lkdGgpIHtcblx0XHRjYWxsYmFjayhpbWcpO1xuXHR9IGVsc2Uge1xuXHRcdHNldFRpbWVvdXQob25JbWFnZVJlYWR5LCAxMDAsIGltZywgY2FsbGJhY2spO1xuXHR9XG59XG5cbmZ1bmN0aW9uIGZpeE9uZShlbCkge1xuXHR2YXIgc3R5bGUgPSBnZXRTdHlsZShlbCk7XG5cdHZhciBvZmkgPSBlbFtPRkldO1xuXHRzdHlsZVsnb2JqZWN0LWZpdCddID0gc3R5bGVbJ29iamVjdC1maXQnXSB8fCAnZmlsbCc7IC8vIGRlZmF1bHQgdmFsdWVcblxuXHQvLyBBdm9pZCBydW5uaW5nIHdoZXJlIHVubmVjZXNzYXJ5LCB1bmxlc3MgT0ZJIGhhZCBhbHJlYWR5IGRvbmUgaXRzIGRlZWRcblx0aWYgKCFvZmkuaW1nKSB7XG5cdFx0Ly8gZmlsbCBpcyB0aGUgZGVmYXVsdCBiZWhhdmlvciBzbyBubyBhY3Rpb24gaXMgbmVjZXNzYXJ5XG5cdFx0aWYgKHN0eWxlWydvYmplY3QtZml0J10gPT09ICdmaWxsJykge1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdC8vIFdoZXJlIG9iamVjdC1maXQgaXMgc3VwcG9ydGVkIGFuZCBvYmplY3QtcG9zaXRpb24gaXNuJ3QgKFNhZmFyaSA8IDEwKVxuXHRcdGlmIChcblx0XHRcdCFvZmkuc2tpcFRlc3QgJiYgLy8gdW5sZXNzIHVzZXIgd2FudHMgdG8gYXBwbHkgcmVnYXJkbGVzcyBvZiBicm93c2VyIHN1cHBvcnRcblx0XHRcdHN1cHBvcnRzT2JqZWN0Rml0ICYmIC8vIGlmIGJyb3dzZXIgYWxyZWFkeSBzdXBwb3J0cyBvYmplY3QtZml0XG5cdFx0XHQhc3R5bGVbJ29iamVjdC1wb3NpdGlvbiddIC8vIHVubGVzcyBvYmplY3QtcG9zaXRpb24gaXMgdXNlZFxuXHRcdCkge1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblx0fVxuXG5cdC8vIGtlZXAgYSBjbG9uZSBpbiBtZW1vcnkgd2hpbGUgcmVzZXR0aW5nIHRoZSBvcmlnaW5hbCB0byBhIGJsYW5rXG5cdGlmICghb2ZpLmltZykge1xuXHRcdG9maS5pbWcgPSBuZXcgSW1hZ2UoZWwud2lkdGgsIGVsLmhlaWdodCk7XG5cdFx0b2ZpLmltZy5zcmNzZXQgPSBuYXRpdmVHZXRBdHRyaWJ1dGUuY2FsbChlbCwgXCJkYXRhLW9maS1zcmNzZXRcIikgfHwgZWwuc3Jjc2V0O1xuXHRcdG9maS5pbWcuc3JjID0gbmF0aXZlR2V0QXR0cmlidXRlLmNhbGwoZWwsIFwiZGF0YS1vZmktc3JjXCIpIHx8IGVsLnNyYztcblxuXHRcdC8vIHByZXNlcnZlIGZvciBhbnkgZnV0dXJlIGNsb25lTm9kZSBjYWxsc1xuXHRcdC8vIGh0dHBzOi8vZ2l0aHViLmNvbS9iZnJlZC1pdC9vYmplY3QtZml0LWltYWdlcy9pc3N1ZXMvNTNcblx0XHRuYXRpdmVTZXRBdHRyaWJ1dGUuY2FsbChlbCwgXCJkYXRhLW9maS1zcmNcIiwgZWwuc3JjKTtcblx0XHRpZiAoZWwuc3Jjc2V0KSB7XG5cdFx0XHRuYXRpdmVTZXRBdHRyaWJ1dGUuY2FsbChlbCwgXCJkYXRhLW9maS1zcmNzZXRcIiwgZWwuc3Jjc2V0KTtcblx0XHR9XG5cblx0XHRzZXRQbGFjZWhvbGRlcihlbCwgZWwubmF0dXJhbFdpZHRoIHx8IGVsLndpZHRoLCBlbC5uYXR1cmFsSGVpZ2h0IHx8IGVsLmhlaWdodCk7XG5cblx0XHQvLyByZW1vdmUgc3Jjc2V0IGJlY2F1c2UgaXQgb3ZlcnJpZGVzIHNyY1xuXHRcdGlmIChlbC5zcmNzZXQpIHtcblx0XHRcdGVsLnNyY3NldCA9ICcnO1xuXHRcdH1cblx0XHR0cnkge1xuXHRcdFx0a2VlcFNyY1VzYWJsZShlbCk7XG5cdFx0fSBjYXRjaCAoZXJyKSB7XG5cdFx0XHRpZiAod2luZG93LmNvbnNvbGUpIHtcblx0XHRcdFx0Y29uc29sZS53YXJuKCdodHRwczovL2JpdC5seS9vZmktb2xkLWJyb3dzZXInKTtcblx0XHRcdH1cblx0XHR9XG5cdH1cblxuXHRwb2x5ZmlsbEN1cnJlbnRTcmMob2ZpLmltZyk7XG5cblx0ZWwuc3R5bGUuYmFja2dyb3VuZEltYWdlID0gXCJ1cmwoXFxcIlwiICsgKChvZmkuaW1nLmN1cnJlbnRTcmMgfHwgb2ZpLmltZy5zcmMpLnJlcGxhY2UoL1wiL2csICdcXFxcXCInKSkgKyBcIlxcXCIpXCI7XG5cdGVsLnN0eWxlLmJhY2tncm91bmRQb3NpdGlvbiA9IHN0eWxlWydvYmplY3QtcG9zaXRpb24nXSB8fCAnY2VudGVyJztcblx0ZWwuc3R5bGUuYmFja2dyb3VuZFJlcGVhdCA9ICduby1yZXBlYXQnO1xuXHRlbC5zdHlsZS5iYWNrZ3JvdW5kT3JpZ2luID0gJ2NvbnRlbnQtYm94JztcblxuXHRpZiAoL3NjYWxlLWRvd24vLnRlc3Qoc3R5bGVbJ29iamVjdC1maXQnXSkpIHtcblx0XHRvbkltYWdlUmVhZHkob2ZpLmltZywgZnVuY3Rpb24gKCkge1xuXHRcdFx0aWYgKG9maS5pbWcubmF0dXJhbFdpZHRoID4gZWwud2lkdGggfHwgb2ZpLmltZy5uYXR1cmFsSGVpZ2h0ID4gZWwuaGVpZ2h0KSB7XG5cdFx0XHRcdGVsLnN0eWxlLmJhY2tncm91bmRTaXplID0gJ2NvbnRhaW4nO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0ZWwuc3R5bGUuYmFja2dyb3VuZFNpemUgPSAnYXV0byc7XG5cdFx0XHR9XG5cdFx0fSk7XG5cdH0gZWxzZSB7XG5cdFx0ZWwuc3R5bGUuYmFja2dyb3VuZFNpemUgPSBzdHlsZVsnb2JqZWN0LWZpdCddLnJlcGxhY2UoJ25vbmUnLCAnYXV0bycpLnJlcGxhY2UoJ2ZpbGwnLCAnMTAwJSAxMDAlJyk7XG5cdH1cblxuXHRvbkltYWdlUmVhZHkob2ZpLmltZywgZnVuY3Rpb24gKGltZykge1xuXHRcdHNldFBsYWNlaG9sZGVyKGVsLCBpbWcubmF0dXJhbFdpZHRoLCBpbWcubmF0dXJhbEhlaWdodCk7XG5cdH0pO1xufVxuXG5mdW5jdGlvbiBrZWVwU3JjVXNhYmxlKGVsKSB7XG5cdHZhciBkZXNjcmlwdG9ycyA9IHtcblx0XHRnZXQ6IGZ1bmN0aW9uIGdldChwcm9wKSB7XG5cdFx0XHRyZXR1cm4gZWxbT0ZJXS5pbWdbcHJvcCA/IHByb3AgOiAnc3JjJ107XG5cdFx0fSxcblx0XHRzZXQ6IGZ1bmN0aW9uIHNldCh2YWx1ZSwgcHJvcCkge1xuXHRcdFx0ZWxbT0ZJXS5pbWdbcHJvcCA/IHByb3AgOiAnc3JjJ10gPSB2YWx1ZTtcblx0XHRcdG5hdGl2ZVNldEF0dHJpYnV0ZS5jYWxsKGVsLCAoXCJkYXRhLW9maS1cIiArIHByb3ApLCB2YWx1ZSk7IC8vIHByZXNlcnZlIGZvciBhbnkgZnV0dXJlIGNsb25lTm9kZVxuXHRcdFx0Zml4T25lKGVsKTtcblx0XHRcdHJldHVybiB2YWx1ZTtcblx0XHR9XG5cdH07XG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShlbCwgJ3NyYycsIGRlc2NyaXB0b3JzKTtcblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGVsLCAnY3VycmVudFNyYycsIHtcblx0XHRnZXQ6IGZ1bmN0aW9uICgpIHsgcmV0dXJuIGRlc2NyaXB0b3JzLmdldCgnY3VycmVudFNyYycpOyB9XG5cdH0pO1xuXHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZWwsICdzcmNzZXQnLCB7XG5cdFx0Z2V0OiBmdW5jdGlvbiAoKSB7IHJldHVybiBkZXNjcmlwdG9ycy5nZXQoJ3NyY3NldCcpOyB9LFxuXHRcdHNldDogZnVuY3Rpb24gKHNzKSB7IHJldHVybiBkZXNjcmlwdG9ycy5zZXQoc3MsICdzcmNzZXQnKTsgfVxuXHR9KTtcbn1cblxuZnVuY3Rpb24gaGlqYWNrQXR0cmlidXRlcygpIHtcblx0ZnVuY3Rpb24gZ2V0T2ZpSW1hZ2VNYXliZShlbCwgbmFtZSkge1xuXHRcdHJldHVybiBlbFtPRkldICYmIGVsW09GSV0uaW1nICYmIChuYW1lID09PSAnc3JjJyB8fCBuYW1lID09PSAnc3Jjc2V0JykgPyBlbFtPRkldLmltZyA6IGVsO1xuXHR9XG5cdGlmICghc3VwcG9ydHNPYmplY3RQb3NpdGlvbikge1xuXHRcdEhUTUxJbWFnZUVsZW1lbnQucHJvdG90eXBlLmdldEF0dHJpYnV0ZSA9IGZ1bmN0aW9uIChuYW1lKSB7XG5cdFx0XHRyZXR1cm4gbmF0aXZlR2V0QXR0cmlidXRlLmNhbGwoZ2V0T2ZpSW1hZ2VNYXliZSh0aGlzLCBuYW1lKSwgbmFtZSk7XG5cdFx0fTtcblxuXHRcdEhUTUxJbWFnZUVsZW1lbnQucHJvdG90eXBlLnNldEF0dHJpYnV0ZSA9IGZ1bmN0aW9uIChuYW1lLCB2YWx1ZSkge1xuXHRcdFx0cmV0dXJuIG5hdGl2ZVNldEF0dHJpYnV0ZS5jYWxsKGdldE9maUltYWdlTWF5YmUodGhpcywgbmFtZSksIG5hbWUsIFN0cmluZyh2YWx1ZSkpO1xuXHRcdH07XG5cdH1cbn1cblxuZnVuY3Rpb24gZml4KGltZ3MsIG9wdHMpIHtcblx0dmFyIHN0YXJ0QXV0b01vZGUgPSAhYXV0b01vZGVFbmFibGVkICYmICFpbWdzO1xuXHRvcHRzID0gb3B0cyB8fCB7fTtcblx0aW1ncyA9IGltZ3MgfHwgJ2ltZyc7XG5cblx0aWYgKChzdXBwb3J0c09iamVjdFBvc2l0aW9uICYmICFvcHRzLnNraXBUZXN0KSB8fCAhc3VwcG9ydHNPRkkpIHtcblx0XHRyZXR1cm4gZmFsc2U7XG5cdH1cblxuXHQvLyB1c2UgaW1ncyBhcyBhIHNlbGVjdG9yIG9yIGp1c3Qgc2VsZWN0IGFsbCBpbWFnZXNcblx0aWYgKGltZ3MgPT09ICdpbWcnKSB7XG5cdFx0aW1ncyA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdpbWcnKTtcblx0fSBlbHNlIGlmICh0eXBlb2YgaW1ncyA9PT0gJ3N0cmluZycpIHtcblx0XHRpbWdzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChpbWdzKTtcblx0fSBlbHNlIGlmICghKCdsZW5ndGgnIGluIGltZ3MpKSB7XG5cdFx0aW1ncyA9IFtpbWdzXTtcblx0fVxuXG5cdC8vIGFwcGx5IGZpeCB0byBhbGxcblx0Zm9yICh2YXIgaSA9IDA7IGkgPCBpbWdzLmxlbmd0aDsgaSsrKSB7XG5cdFx0aW1nc1tpXVtPRkldID0gaW1nc1tpXVtPRkldIHx8IHtcblx0XHRcdHNraXBUZXN0OiBvcHRzLnNraXBUZXN0XG5cdFx0fTtcblx0XHRmaXhPbmUoaW1nc1tpXSk7XG5cdH1cblxuXHRpZiAoc3RhcnRBdXRvTW9kZSkge1xuXHRcdGRvY3VtZW50LmJvZHkuYWRkRXZlbnRMaXN0ZW5lcignbG9hZCcsIGZ1bmN0aW9uIChlKSB7XG5cdFx0XHRpZiAoZS50YXJnZXQudGFnTmFtZSA9PT0gJ0lNRycpIHtcblx0XHRcdFx0Zml4KGUudGFyZ2V0LCB7XG5cdFx0XHRcdFx0c2tpcFRlc3Q6IG9wdHMuc2tpcFRlc3Rcblx0XHRcdFx0fSk7XG5cdFx0XHR9XG5cdFx0fSwgdHJ1ZSk7XG5cdFx0YXV0b01vZGVFbmFibGVkID0gdHJ1ZTtcblx0XHRpbWdzID0gJ2ltZyc7IC8vIHJlc2V0IHRvIGEgZ2VuZXJpYyBzZWxlY3RvciBmb3Igd2F0Y2hNUVxuXHR9XG5cblx0Ly8gaWYgcmVxdWVzdGVkLCB3YXRjaCBtZWRpYSBxdWVyaWVzIGZvciBvYmplY3QtZml0IGNoYW5nZVxuXHRpZiAob3B0cy53YXRjaE1RKSB7XG5cdFx0d2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3Jlc2l6ZScsIGZpeC5iaW5kKG51bGwsIGltZ3MsIHtcblx0XHRcdHNraXBUZXN0OiBvcHRzLnNraXBUZXN0XG5cdFx0fSkpO1xuXHR9XG59XG5cbmZpeC5zdXBwb3J0c09iamVjdEZpdCA9IHN1cHBvcnRzT2JqZWN0Rml0O1xuZml4LnN1cHBvcnRzT2JqZWN0UG9zaXRpb24gPSBzdXBwb3J0c09iamVjdFBvc2l0aW9uO1xuXG5oaWphY2tBdHRyaWJ1dGVzKCk7XG5cbm1vZHVsZS5leHBvcnRzID0gZml4O1xuIiwiLyoqXG4gKiBFdkVtaXR0ZXIgdjEuMS4wXG4gKiBMaWwnIGV2ZW50IGVtaXR0ZXJcbiAqIE1JVCBMaWNlbnNlXG4gKi9cblxuLyoganNoaW50IHVudXNlZDogdHJ1ZSwgdW5kZWY6IHRydWUsIHN0cmljdDogdHJ1ZSAqL1xuXG4oIGZ1bmN0aW9uKCBnbG9iYWwsIGZhY3RvcnkgKSB7XG4gIC8vIHVuaXZlcnNhbCBtb2R1bGUgZGVmaW5pdGlvblxuICAvKiBqc2hpbnQgc3RyaWN0OiBmYWxzZSAqLyAvKiBnbG9iYWxzIGRlZmluZSwgbW9kdWxlLCB3aW5kb3cgKi9cbiAgaWYgKCB0eXBlb2YgZGVmaW5lID09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCApIHtcbiAgICAvLyBBTUQgLSBSZXF1aXJlSlNcbiAgICBkZWZpbmUoIGZhY3RvcnkgKTtcbiAgfSBlbHNlIGlmICggdHlwZW9mIG1vZHVsZSA9PSAnb2JqZWN0JyAmJiBtb2R1bGUuZXhwb3J0cyApIHtcbiAgICAvLyBDb21tb25KUyAtIEJyb3dzZXJpZnksIFdlYnBhY2tcbiAgICBtb2R1bGUuZXhwb3J0cyA9IGZhY3RvcnkoKTtcbiAgfSBlbHNlIHtcbiAgICAvLyBCcm93c2VyIGdsb2JhbHNcbiAgICBnbG9iYWwuRXZFbWl0dGVyID0gZmFjdG9yeSgpO1xuICB9XG5cbn0oIHR5cGVvZiB3aW5kb3cgIT0gJ3VuZGVmaW5lZCcgPyB3aW5kb3cgOiB0aGlzLCBmdW5jdGlvbigpIHtcblxuXCJ1c2Ugc3RyaWN0XCI7XG5cbmZ1bmN0aW9uIEV2RW1pdHRlcigpIHt9XG5cbnZhciBwcm90byA9IEV2RW1pdHRlci5wcm90b3R5cGU7XG5cbnByb3RvLm9uID0gZnVuY3Rpb24oIGV2ZW50TmFtZSwgbGlzdGVuZXIgKSB7XG4gIGlmICggIWV2ZW50TmFtZSB8fCAhbGlzdGVuZXIgKSB7XG4gICAgcmV0dXJuO1xuICB9XG4gIC8vIHNldCBldmVudHMgaGFzaFxuICB2YXIgZXZlbnRzID0gdGhpcy5fZXZlbnRzID0gdGhpcy5fZXZlbnRzIHx8IHt9O1xuICAvLyBzZXQgbGlzdGVuZXJzIGFycmF5XG4gIHZhciBsaXN0ZW5lcnMgPSBldmVudHNbIGV2ZW50TmFtZSBdID0gZXZlbnRzWyBldmVudE5hbWUgXSB8fCBbXTtcbiAgLy8gb25seSBhZGQgb25jZVxuICBpZiAoIGxpc3RlbmVycy5pbmRleE9mKCBsaXN0ZW5lciApID09IC0xICkge1xuICAgIGxpc3RlbmVycy5wdXNoKCBsaXN0ZW5lciApO1xuICB9XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5wcm90by5vbmNlID0gZnVuY3Rpb24oIGV2ZW50TmFtZSwgbGlzdGVuZXIgKSB7XG4gIGlmICggIWV2ZW50TmFtZSB8fCAhbGlzdGVuZXIgKSB7XG4gICAgcmV0dXJuO1xuICB9XG4gIC8vIGFkZCBldmVudFxuICB0aGlzLm9uKCBldmVudE5hbWUsIGxpc3RlbmVyICk7XG4gIC8vIHNldCBvbmNlIGZsYWdcbiAgLy8gc2V0IG9uY2VFdmVudHMgaGFzaFxuICB2YXIgb25jZUV2ZW50cyA9IHRoaXMuX29uY2VFdmVudHMgPSB0aGlzLl9vbmNlRXZlbnRzIHx8IHt9O1xuICAvLyBzZXQgb25jZUxpc3RlbmVycyBvYmplY3RcbiAgdmFyIG9uY2VMaXN0ZW5lcnMgPSBvbmNlRXZlbnRzWyBldmVudE5hbWUgXSA9IG9uY2VFdmVudHNbIGV2ZW50TmFtZSBdIHx8IHt9O1xuICAvLyBzZXQgZmxhZ1xuICBvbmNlTGlzdGVuZXJzWyBsaXN0ZW5lciBdID0gdHJ1ZTtcblxuICByZXR1cm4gdGhpcztcbn07XG5cbnByb3RvLm9mZiA9IGZ1bmN0aW9uKCBldmVudE5hbWUsIGxpc3RlbmVyICkge1xuICB2YXIgbGlzdGVuZXJzID0gdGhpcy5fZXZlbnRzICYmIHRoaXMuX2V2ZW50c1sgZXZlbnROYW1lIF07XG4gIGlmICggIWxpc3RlbmVycyB8fCAhbGlzdGVuZXJzLmxlbmd0aCApIHtcbiAgICByZXR1cm47XG4gIH1cbiAgdmFyIGluZGV4ID0gbGlzdGVuZXJzLmluZGV4T2YoIGxpc3RlbmVyICk7XG4gIGlmICggaW5kZXggIT0gLTEgKSB7XG4gICAgbGlzdGVuZXJzLnNwbGljZSggaW5kZXgsIDEgKTtcbiAgfVxuXG4gIHJldHVybiB0aGlzO1xufTtcblxucHJvdG8uZW1pdEV2ZW50ID0gZnVuY3Rpb24oIGV2ZW50TmFtZSwgYXJncyApIHtcbiAgdmFyIGxpc3RlbmVycyA9IHRoaXMuX2V2ZW50cyAmJiB0aGlzLl9ldmVudHNbIGV2ZW50TmFtZSBdO1xuICBpZiAoICFsaXN0ZW5lcnMgfHwgIWxpc3RlbmVycy5sZW5ndGggKSB7XG4gICAgcmV0dXJuO1xuICB9XG4gIC8vIGNvcHkgb3ZlciB0byBhdm9pZCBpbnRlcmZlcmVuY2UgaWYgLm9mZigpIGluIGxpc3RlbmVyXG4gIGxpc3RlbmVycyA9IGxpc3RlbmVycy5zbGljZSgwKTtcbiAgYXJncyA9IGFyZ3MgfHwgW107XG4gIC8vIG9uY2Ugc3R1ZmZcbiAgdmFyIG9uY2VMaXN0ZW5lcnMgPSB0aGlzLl9vbmNlRXZlbnRzICYmIHRoaXMuX29uY2VFdmVudHNbIGV2ZW50TmFtZSBdO1xuXG4gIGZvciAoIHZhciBpPTA7IGkgPCBsaXN0ZW5lcnMubGVuZ3RoOyBpKysgKSB7XG4gICAgdmFyIGxpc3RlbmVyID0gbGlzdGVuZXJzW2ldXG4gICAgdmFyIGlzT25jZSA9IG9uY2VMaXN0ZW5lcnMgJiYgb25jZUxpc3RlbmVyc1sgbGlzdGVuZXIgXTtcbiAgICBpZiAoIGlzT25jZSApIHtcbiAgICAgIC8vIHJlbW92ZSBsaXN0ZW5lclxuICAgICAgLy8gcmVtb3ZlIGJlZm9yZSB0cmlnZ2VyIHRvIHByZXZlbnQgcmVjdXJzaW9uXG4gICAgICB0aGlzLm9mZiggZXZlbnROYW1lLCBsaXN0ZW5lciApO1xuICAgICAgLy8gdW5zZXQgb25jZSBmbGFnXG4gICAgICBkZWxldGUgb25jZUxpc3RlbmVyc1sgbGlzdGVuZXIgXTtcbiAgICB9XG4gICAgLy8gdHJpZ2dlciBsaXN0ZW5lclxuICAgIGxpc3RlbmVyLmFwcGx5KCB0aGlzLCBhcmdzICk7XG4gIH1cblxuICByZXR1cm4gdGhpcztcbn07XG5cbnByb3RvLmFsbE9mZiA9IGZ1bmN0aW9uKCkge1xuICBkZWxldGUgdGhpcy5fZXZlbnRzO1xuICBkZWxldGUgdGhpcy5fb25jZUV2ZW50cztcbn07XG5cbnJldHVybiBFdkVtaXR0ZXI7XG5cbn0pKTtcbiIsIi8qIVxuICogZ2V0U2l6ZSB2Mi4wLjNcbiAqIG1lYXN1cmUgc2l6ZSBvZiBlbGVtZW50c1xuICogTUlUIGxpY2Vuc2VcbiAqL1xuXG4vKiBqc2hpbnQgYnJvd3NlcjogdHJ1ZSwgc3RyaWN0OiB0cnVlLCB1bmRlZjogdHJ1ZSwgdW51c2VkOiB0cnVlICovXG4vKiBnbG9iYWxzIGNvbnNvbGU6IGZhbHNlICovXG5cbiggZnVuY3Rpb24oIHdpbmRvdywgZmFjdG9yeSApIHtcbiAgLyoganNoaW50IHN0cmljdDogZmFsc2UgKi8gLyogZ2xvYmFscyBkZWZpbmUsIG1vZHVsZSAqL1xuICBpZiAoIHR5cGVvZiBkZWZpbmUgPT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kICkge1xuICAgIC8vIEFNRFxuICAgIGRlZmluZSggZmFjdG9yeSApO1xuICB9IGVsc2UgaWYgKCB0eXBlb2YgbW9kdWxlID09ICdvYmplY3QnICYmIG1vZHVsZS5leHBvcnRzICkge1xuICAgIC8vIENvbW1vbkpTXG4gICAgbW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KCk7XG4gIH0gZWxzZSB7XG4gICAgLy8gYnJvd3NlciBnbG9iYWxcbiAgICB3aW5kb3cuZ2V0U2l6ZSA9IGZhY3RvcnkoKTtcbiAgfVxuXG59KSggd2luZG93LCBmdW5jdGlvbiBmYWN0b3J5KCkge1xuJ3VzZSBzdHJpY3QnO1xuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSBoZWxwZXJzIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIC8vXG5cbi8vIGdldCBhIG51bWJlciBmcm9tIGEgc3RyaW5nLCBub3QgYSBwZXJjZW50YWdlXG5mdW5jdGlvbiBnZXRTdHlsZVNpemUoIHZhbHVlICkge1xuICB2YXIgbnVtID0gcGFyc2VGbG9hdCggdmFsdWUgKTtcbiAgLy8gbm90IGEgcGVyY2VudCBsaWtlICcxMDAlJywgYW5kIGEgbnVtYmVyXG4gIHZhciBpc1ZhbGlkID0gdmFsdWUuaW5kZXhPZignJScpID09IC0xICYmICFpc05hTiggbnVtICk7XG4gIHJldHVybiBpc1ZhbGlkICYmIG51bTtcbn1cblxuZnVuY3Rpb24gbm9vcCgpIHt9XG5cbnZhciBsb2dFcnJvciA9IHR5cGVvZiBjb25zb2xlID09ICd1bmRlZmluZWQnID8gbm9vcCA6XG4gIGZ1bmN0aW9uKCBtZXNzYWdlICkge1xuICAgIGNvbnNvbGUuZXJyb3IoIG1lc3NhZ2UgKTtcbiAgfTtcblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gbWVhc3VyZW1lbnRzIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIC8vXG5cbnZhciBtZWFzdXJlbWVudHMgPSBbXG4gICdwYWRkaW5nTGVmdCcsXG4gICdwYWRkaW5nUmlnaHQnLFxuICAncGFkZGluZ1RvcCcsXG4gICdwYWRkaW5nQm90dG9tJyxcbiAgJ21hcmdpbkxlZnQnLFxuICAnbWFyZ2luUmlnaHQnLFxuICAnbWFyZ2luVG9wJyxcbiAgJ21hcmdpbkJvdHRvbScsXG4gICdib3JkZXJMZWZ0V2lkdGgnLFxuICAnYm9yZGVyUmlnaHRXaWR0aCcsXG4gICdib3JkZXJUb3BXaWR0aCcsXG4gICdib3JkZXJCb3R0b21XaWR0aCdcbl07XG5cbnZhciBtZWFzdXJlbWVudHNMZW5ndGggPSBtZWFzdXJlbWVudHMubGVuZ3RoO1xuXG5mdW5jdGlvbiBnZXRaZXJvU2l6ZSgpIHtcbiAgdmFyIHNpemUgPSB7XG4gICAgd2lkdGg6IDAsXG4gICAgaGVpZ2h0OiAwLFxuICAgIGlubmVyV2lkdGg6IDAsXG4gICAgaW5uZXJIZWlnaHQ6IDAsXG4gICAgb3V0ZXJXaWR0aDogMCxcbiAgICBvdXRlckhlaWdodDogMFxuICB9O1xuICBmb3IgKCB2YXIgaT0wOyBpIDwgbWVhc3VyZW1lbnRzTGVuZ3RoOyBpKysgKSB7XG4gICAgdmFyIG1lYXN1cmVtZW50ID0gbWVhc3VyZW1lbnRzW2ldO1xuICAgIHNpemVbIG1lYXN1cmVtZW50IF0gPSAwO1xuICB9XG4gIHJldHVybiBzaXplO1xufVxuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSBnZXRTdHlsZSAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSAvL1xuXG4vKipcbiAqIGdldFN0eWxlLCBnZXQgc3R5bGUgb2YgZWxlbWVudCwgY2hlY2sgZm9yIEZpcmVmb3ggYnVnXG4gKiBodHRwczovL2J1Z3ppbGxhLm1vemlsbGEub3JnL3Nob3dfYnVnLmNnaT9pZD01NDgzOTdcbiAqL1xuZnVuY3Rpb24gZ2V0U3R5bGUoIGVsZW0gKSB7XG4gIHZhciBzdHlsZSA9IGdldENvbXB1dGVkU3R5bGUoIGVsZW0gKTtcbiAgaWYgKCAhc3R5bGUgKSB7XG4gICAgbG9nRXJyb3IoICdTdHlsZSByZXR1cm5lZCAnICsgc3R5bGUgK1xuICAgICAgJy4gQXJlIHlvdSBydW5uaW5nIHRoaXMgY29kZSBpbiBhIGhpZGRlbiBpZnJhbWUgb24gRmlyZWZveD8gJyArXG4gICAgICAnU2VlIGh0dHBzOi8vYml0Lmx5L2dldHNpemVidWcxJyApO1xuICB9XG4gIHJldHVybiBzdHlsZTtcbn1cblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gc2V0dXAgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gLy9cblxudmFyIGlzU2V0dXAgPSBmYWxzZTtcblxudmFyIGlzQm94U2l6ZU91dGVyO1xuXG4vKipcbiAqIHNldHVwXG4gKiBjaGVjayBpc0JveFNpemVyT3V0ZXJcbiAqIGRvIG9uIGZpcnN0IGdldFNpemUoKSByYXRoZXIgdGhhbiBvbiBwYWdlIGxvYWQgZm9yIEZpcmVmb3ggYnVnXG4gKi9cbmZ1bmN0aW9uIHNldHVwKCkge1xuICAvLyBzZXR1cCBvbmNlXG4gIGlmICggaXNTZXR1cCApIHtcbiAgICByZXR1cm47XG4gIH1cbiAgaXNTZXR1cCA9IHRydWU7XG5cbiAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gYm94IHNpemluZyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSAvL1xuXG4gIC8qKlxuICAgKiBDaHJvbWUgJiBTYWZhcmkgbWVhc3VyZSB0aGUgb3V0ZXItd2lkdGggb24gc3R5bGUud2lkdGggb24gYm9yZGVyLWJveCBlbGVtc1xuICAgKiBJRTExICYgRmlyZWZveDwyOSBtZWFzdXJlcyB0aGUgaW5uZXItd2lkdGhcbiAgICovXG4gIHZhciBkaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgZGl2LnN0eWxlLndpZHRoID0gJzIwMHB4JztcbiAgZGl2LnN0eWxlLnBhZGRpbmcgPSAnMXB4IDJweCAzcHggNHB4JztcbiAgZGl2LnN0eWxlLmJvcmRlclN0eWxlID0gJ3NvbGlkJztcbiAgZGl2LnN0eWxlLmJvcmRlcldpZHRoID0gJzFweCAycHggM3B4IDRweCc7XG4gIGRpdi5zdHlsZS5ib3hTaXppbmcgPSAnYm9yZGVyLWJveCc7XG5cbiAgdmFyIGJvZHkgPSBkb2N1bWVudC5ib2R5IHx8IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudDtcbiAgYm9keS5hcHBlbmRDaGlsZCggZGl2ICk7XG4gIHZhciBzdHlsZSA9IGdldFN0eWxlKCBkaXYgKTtcbiAgLy8gcm91bmQgdmFsdWUgZm9yIGJyb3dzZXIgem9vbS4gZGVzYW5kcm8vbWFzb25yeSM5MjhcbiAgaXNCb3hTaXplT3V0ZXIgPSBNYXRoLnJvdW5kKCBnZXRTdHlsZVNpemUoIHN0eWxlLndpZHRoICkgKSA9PSAyMDA7XG4gIGdldFNpemUuaXNCb3hTaXplT3V0ZXIgPSBpc0JveFNpemVPdXRlcjtcblxuICBib2R5LnJlbW92ZUNoaWxkKCBkaXYgKTtcbn1cblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gZ2V0U2l6ZSAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSAvL1xuXG5mdW5jdGlvbiBnZXRTaXplKCBlbGVtICkge1xuICBzZXR1cCgpO1xuXG4gIC8vIHVzZSBxdWVyeVNlbGV0b3IgaWYgZWxlbSBpcyBzdHJpbmdcbiAgaWYgKCB0eXBlb2YgZWxlbSA9PSAnc3RyaW5nJyApIHtcbiAgICBlbGVtID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvciggZWxlbSApO1xuICB9XG5cbiAgLy8gZG8gbm90IHByb2NlZWQgb24gbm9uLW9iamVjdHNcbiAgaWYgKCAhZWxlbSB8fCB0eXBlb2YgZWxlbSAhPSAnb2JqZWN0JyB8fCAhZWxlbS5ub2RlVHlwZSApIHtcbiAgICByZXR1cm47XG4gIH1cblxuICB2YXIgc3R5bGUgPSBnZXRTdHlsZSggZWxlbSApO1xuXG4gIC8vIGlmIGhpZGRlbiwgZXZlcnl0aGluZyBpcyAwXG4gIGlmICggc3R5bGUuZGlzcGxheSA9PSAnbm9uZScgKSB7XG4gICAgcmV0dXJuIGdldFplcm9TaXplKCk7XG4gIH1cblxuICB2YXIgc2l6ZSA9IHt9O1xuICBzaXplLndpZHRoID0gZWxlbS5vZmZzZXRXaWR0aDtcbiAgc2l6ZS5oZWlnaHQgPSBlbGVtLm9mZnNldEhlaWdodDtcblxuICB2YXIgaXNCb3JkZXJCb3ggPSBzaXplLmlzQm9yZGVyQm94ID0gc3R5bGUuYm94U2l6aW5nID09ICdib3JkZXItYm94JztcblxuICAvLyBnZXQgYWxsIG1lYXN1cmVtZW50c1xuICBmb3IgKCB2YXIgaT0wOyBpIDwgbWVhc3VyZW1lbnRzTGVuZ3RoOyBpKysgKSB7XG4gICAgdmFyIG1lYXN1cmVtZW50ID0gbWVhc3VyZW1lbnRzW2ldO1xuICAgIHZhciB2YWx1ZSA9IHN0eWxlWyBtZWFzdXJlbWVudCBdO1xuICAgIHZhciBudW0gPSBwYXJzZUZsb2F0KCB2YWx1ZSApO1xuICAgIC8vIGFueSAnYXV0bycsICdtZWRpdW0nIHZhbHVlIHdpbGwgYmUgMFxuICAgIHNpemVbIG1lYXN1cmVtZW50IF0gPSAhaXNOYU4oIG51bSApID8gbnVtIDogMDtcbiAgfVxuXG4gIHZhciBwYWRkaW5nV2lkdGggPSBzaXplLnBhZGRpbmdMZWZ0ICsgc2l6ZS5wYWRkaW5nUmlnaHQ7XG4gIHZhciBwYWRkaW5nSGVpZ2h0ID0gc2l6ZS5wYWRkaW5nVG9wICsgc2l6ZS5wYWRkaW5nQm90dG9tO1xuICB2YXIgbWFyZ2luV2lkdGggPSBzaXplLm1hcmdpbkxlZnQgKyBzaXplLm1hcmdpblJpZ2h0O1xuICB2YXIgbWFyZ2luSGVpZ2h0ID0gc2l6ZS5tYXJnaW5Ub3AgKyBzaXplLm1hcmdpbkJvdHRvbTtcbiAgdmFyIGJvcmRlcldpZHRoID0gc2l6ZS5ib3JkZXJMZWZ0V2lkdGggKyBzaXplLmJvcmRlclJpZ2h0V2lkdGg7XG4gIHZhciBib3JkZXJIZWlnaHQgPSBzaXplLmJvcmRlclRvcFdpZHRoICsgc2l6ZS5ib3JkZXJCb3R0b21XaWR0aDtcblxuICB2YXIgaXNCb3JkZXJCb3hTaXplT3V0ZXIgPSBpc0JvcmRlckJveCAmJiBpc0JveFNpemVPdXRlcjtcblxuICAvLyBvdmVyd3JpdGUgd2lkdGggYW5kIGhlaWdodCBpZiB3ZSBjYW4gZ2V0IGl0IGZyb20gc3R5bGVcbiAgdmFyIHN0eWxlV2lkdGggPSBnZXRTdHlsZVNpemUoIHN0eWxlLndpZHRoICk7XG4gIGlmICggc3R5bGVXaWR0aCAhPT0gZmFsc2UgKSB7XG4gICAgc2l6ZS53aWR0aCA9IHN0eWxlV2lkdGggK1xuICAgICAgLy8gYWRkIHBhZGRpbmcgYW5kIGJvcmRlciB1bmxlc3MgaXQncyBhbHJlYWR5IGluY2x1ZGluZyBpdFxuICAgICAgKCBpc0JvcmRlckJveFNpemVPdXRlciA/IDAgOiBwYWRkaW5nV2lkdGggKyBib3JkZXJXaWR0aCApO1xuICB9XG5cbiAgdmFyIHN0eWxlSGVpZ2h0ID0gZ2V0U3R5bGVTaXplKCBzdHlsZS5oZWlnaHQgKTtcbiAgaWYgKCBzdHlsZUhlaWdodCAhPT0gZmFsc2UgKSB7XG4gICAgc2l6ZS5oZWlnaHQgPSBzdHlsZUhlaWdodCArXG4gICAgICAvLyBhZGQgcGFkZGluZyBhbmQgYm9yZGVyIHVubGVzcyBpdCdzIGFscmVhZHkgaW5jbHVkaW5nIGl0XG4gICAgICAoIGlzQm9yZGVyQm94U2l6ZU91dGVyID8gMCA6IHBhZGRpbmdIZWlnaHQgKyBib3JkZXJIZWlnaHQgKTtcbiAgfVxuXG4gIHNpemUuaW5uZXJXaWR0aCA9IHNpemUud2lkdGggLSAoIHBhZGRpbmdXaWR0aCArIGJvcmRlcldpZHRoICk7XG4gIHNpemUuaW5uZXJIZWlnaHQgPSBzaXplLmhlaWdodCAtICggcGFkZGluZ0hlaWdodCArIGJvcmRlckhlaWdodCApO1xuXG4gIHNpemUub3V0ZXJXaWR0aCA9IHNpemUud2lkdGggKyBtYXJnaW5XaWR0aDtcbiAgc2l6ZS5vdXRlckhlaWdodCA9IHNpemUuaGVpZ2h0ICsgbWFyZ2luSGVpZ2h0O1xuXG4gIHJldHVybiBzaXplO1xufVxuXG5yZXR1cm4gZ2V0U2l6ZTtcblxufSk7XG4iLCIvKipcbiAqIG1hdGNoZXNTZWxlY3RvciB2Mi4wLjJcbiAqIG1hdGNoZXNTZWxlY3RvciggZWxlbWVudCwgJy5zZWxlY3RvcicgKVxuICogTUlUIGxpY2Vuc2VcbiAqL1xuXG4vKmpzaGludCBicm93c2VyOiB0cnVlLCBzdHJpY3Q6IHRydWUsIHVuZGVmOiB0cnVlLCB1bnVzZWQ6IHRydWUgKi9cblxuKCBmdW5jdGlvbiggd2luZG93LCBmYWN0b3J5ICkge1xuICAvKmdsb2JhbCBkZWZpbmU6IGZhbHNlLCBtb2R1bGU6IGZhbHNlICovXG4gICd1c2Ugc3RyaWN0JztcbiAgLy8gdW5pdmVyc2FsIG1vZHVsZSBkZWZpbml0aW9uXG4gIGlmICggdHlwZW9mIGRlZmluZSA9PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQgKSB7XG4gICAgLy8gQU1EXG4gICAgZGVmaW5lKCBmYWN0b3J5ICk7XG4gIH0gZWxzZSBpZiAoIHR5cGVvZiBtb2R1bGUgPT0gJ29iamVjdCcgJiYgbW9kdWxlLmV4cG9ydHMgKSB7XG4gICAgLy8gQ29tbW9uSlNcbiAgICBtb2R1bGUuZXhwb3J0cyA9IGZhY3RvcnkoKTtcbiAgfSBlbHNlIHtcbiAgICAvLyBicm93c2VyIGdsb2JhbFxuICAgIHdpbmRvdy5tYXRjaGVzU2VsZWN0b3IgPSBmYWN0b3J5KCk7XG4gIH1cblxufSggd2luZG93LCBmdW5jdGlvbiBmYWN0b3J5KCkge1xuICAndXNlIHN0cmljdCc7XG5cbiAgdmFyIG1hdGNoZXNNZXRob2QgPSAoIGZ1bmN0aW9uKCkge1xuICAgIHZhciBFbGVtUHJvdG8gPSB3aW5kb3cuRWxlbWVudC5wcm90b3R5cGU7XG4gICAgLy8gY2hlY2sgZm9yIHRoZSBzdGFuZGFyZCBtZXRob2QgbmFtZSBmaXJzdFxuICAgIGlmICggRWxlbVByb3RvLm1hdGNoZXMgKSB7XG4gICAgICByZXR1cm4gJ21hdGNoZXMnO1xuICAgIH1cbiAgICAvLyBjaGVjayB1bi1wcmVmaXhlZFxuICAgIGlmICggRWxlbVByb3RvLm1hdGNoZXNTZWxlY3RvciApIHtcbiAgICAgIHJldHVybiAnbWF0Y2hlc1NlbGVjdG9yJztcbiAgICB9XG4gICAgLy8gY2hlY2sgdmVuZG9yIHByZWZpeGVzXG4gICAgdmFyIHByZWZpeGVzID0gWyAnd2Via2l0JywgJ21veicsICdtcycsICdvJyBdO1xuXG4gICAgZm9yICggdmFyIGk9MDsgaSA8IHByZWZpeGVzLmxlbmd0aDsgaSsrICkge1xuICAgICAgdmFyIHByZWZpeCA9IHByZWZpeGVzW2ldO1xuICAgICAgdmFyIG1ldGhvZCA9IHByZWZpeCArICdNYXRjaGVzU2VsZWN0b3InO1xuICAgICAgaWYgKCBFbGVtUHJvdG9bIG1ldGhvZCBdICkge1xuICAgICAgICByZXR1cm4gbWV0aG9kO1xuICAgICAgfVxuICAgIH1cbiAgfSkoKTtcblxuICByZXR1cm4gZnVuY3Rpb24gbWF0Y2hlc1NlbGVjdG9yKCBlbGVtLCBzZWxlY3RvciApIHtcbiAgICByZXR1cm4gZWxlbVsgbWF0Y2hlc01ldGhvZCBdKCBzZWxlY3RvciApO1xuICB9O1xuXG59KSk7XG4iLCIvKipcbiAqIEZpenp5IFVJIHV0aWxzIHYyLjAuN1xuICogTUlUIGxpY2Vuc2VcbiAqL1xuXG4vKmpzaGludCBicm93c2VyOiB0cnVlLCB1bmRlZjogdHJ1ZSwgdW51c2VkOiB0cnVlLCBzdHJpY3Q6IHRydWUgKi9cblxuKCBmdW5jdGlvbiggd2luZG93LCBmYWN0b3J5ICkge1xuICAvLyB1bml2ZXJzYWwgbW9kdWxlIGRlZmluaXRpb25cbiAgLypqc2hpbnQgc3RyaWN0OiBmYWxzZSAqLyAvKmdsb2JhbHMgZGVmaW5lLCBtb2R1bGUsIHJlcXVpcmUgKi9cblxuICBpZiAoIHR5cGVvZiBkZWZpbmUgPT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kICkge1xuICAgIC8vIEFNRFxuICAgIGRlZmluZSggW1xuICAgICAgJ2Rlc2FuZHJvLW1hdGNoZXMtc2VsZWN0b3IvbWF0Y2hlcy1zZWxlY3RvcidcbiAgICBdLCBmdW5jdGlvbiggbWF0Y2hlc1NlbGVjdG9yICkge1xuICAgICAgcmV0dXJuIGZhY3RvcnkoIHdpbmRvdywgbWF0Y2hlc1NlbGVjdG9yICk7XG4gICAgfSk7XG4gIH0gZWxzZSBpZiAoIHR5cGVvZiBtb2R1bGUgPT0gJ29iamVjdCcgJiYgbW9kdWxlLmV4cG9ydHMgKSB7XG4gICAgLy8gQ29tbW9uSlNcbiAgICBtb2R1bGUuZXhwb3J0cyA9IGZhY3RvcnkoXG4gICAgICB3aW5kb3csXG4gICAgICByZXF1aXJlKCdkZXNhbmRyby1tYXRjaGVzLXNlbGVjdG9yJylcbiAgICApO1xuICB9IGVsc2Uge1xuICAgIC8vIGJyb3dzZXIgZ2xvYmFsXG4gICAgd2luZG93LmZpenp5VUlVdGlscyA9IGZhY3RvcnkoXG4gICAgICB3aW5kb3csXG4gICAgICB3aW5kb3cubWF0Y2hlc1NlbGVjdG9yXG4gICAgKTtcbiAgfVxuXG59KCB3aW5kb3csIGZ1bmN0aW9uIGZhY3RvcnkoIHdpbmRvdywgbWF0Y2hlc1NlbGVjdG9yICkge1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciB1dGlscyA9IHt9O1xuXG4vLyAtLS0tLSBleHRlbmQgLS0tLS0gLy9cblxuLy8gZXh0ZW5kcyBvYmplY3RzXG51dGlscy5leHRlbmQgPSBmdW5jdGlvbiggYSwgYiApIHtcbiAgZm9yICggdmFyIHByb3AgaW4gYiApIHtcbiAgICBhWyBwcm9wIF0gPSBiWyBwcm9wIF07XG4gIH1cbiAgcmV0dXJuIGE7XG59O1xuXG4vLyAtLS0tLSBtb2R1bG8gLS0tLS0gLy9cblxudXRpbHMubW9kdWxvID0gZnVuY3Rpb24oIG51bSwgZGl2ICkge1xuICByZXR1cm4gKCAoIG51bSAlIGRpdiApICsgZGl2ICkgJSBkaXY7XG59O1xuXG4vLyAtLS0tLSBtYWtlQXJyYXkgLS0tLS0gLy9cblxudmFyIGFycmF5U2xpY2UgPSBBcnJheS5wcm90b3R5cGUuc2xpY2U7XG5cbi8vIHR1cm4gZWxlbWVudCBvciBub2RlTGlzdCBpbnRvIGFuIGFycmF5XG51dGlscy5tYWtlQXJyYXkgPSBmdW5jdGlvbiggb2JqICkge1xuICBpZiAoIEFycmF5LmlzQXJyYXkoIG9iaiApICkge1xuICAgIC8vIHVzZSBvYmplY3QgaWYgYWxyZWFkeSBhbiBhcnJheVxuICAgIHJldHVybiBvYmo7XG4gIH1cbiAgLy8gcmV0dXJuIGVtcHR5IGFycmF5IGlmIHVuZGVmaW5lZCBvciBudWxsLiAjNlxuICBpZiAoIG9iaiA9PT0gbnVsbCB8fCBvYmogPT09IHVuZGVmaW5lZCApIHtcbiAgICByZXR1cm4gW107XG4gIH1cblxuICB2YXIgaXNBcnJheUxpa2UgPSB0eXBlb2Ygb2JqID09ICdvYmplY3QnICYmIHR5cGVvZiBvYmoubGVuZ3RoID09ICdudW1iZXInO1xuICBpZiAoIGlzQXJyYXlMaWtlICkge1xuICAgIC8vIGNvbnZlcnQgbm9kZUxpc3QgdG8gYXJyYXlcbiAgICByZXR1cm4gYXJyYXlTbGljZS5jYWxsKCBvYmogKTtcbiAgfVxuXG4gIC8vIGFycmF5IG9mIHNpbmdsZSBpbmRleFxuICByZXR1cm4gWyBvYmogXTtcbn07XG5cbi8vIC0tLS0tIHJlbW92ZUZyb20gLS0tLS0gLy9cblxudXRpbHMucmVtb3ZlRnJvbSA9IGZ1bmN0aW9uKCBhcnksIG9iaiApIHtcbiAgdmFyIGluZGV4ID0gYXJ5LmluZGV4T2YoIG9iaiApO1xuICBpZiAoIGluZGV4ICE9IC0xICkge1xuICAgIGFyeS5zcGxpY2UoIGluZGV4LCAxICk7XG4gIH1cbn07XG5cbi8vIC0tLS0tIGdldFBhcmVudCAtLS0tLSAvL1xuXG51dGlscy5nZXRQYXJlbnQgPSBmdW5jdGlvbiggZWxlbSwgc2VsZWN0b3IgKSB7XG4gIHdoaWxlICggZWxlbS5wYXJlbnROb2RlICYmIGVsZW0gIT0gZG9jdW1lbnQuYm9keSApIHtcbiAgICBlbGVtID0gZWxlbS5wYXJlbnROb2RlO1xuICAgIGlmICggbWF0Y2hlc1NlbGVjdG9yKCBlbGVtLCBzZWxlY3RvciApICkge1xuICAgICAgcmV0dXJuIGVsZW07XG4gICAgfVxuICB9XG59O1xuXG4vLyAtLS0tLSBnZXRRdWVyeUVsZW1lbnQgLS0tLS0gLy9cblxuLy8gdXNlIGVsZW1lbnQgYXMgc2VsZWN0b3Igc3RyaW5nXG51dGlscy5nZXRRdWVyeUVsZW1lbnQgPSBmdW5jdGlvbiggZWxlbSApIHtcbiAgaWYgKCB0eXBlb2YgZWxlbSA9PSAnc3RyaW5nJyApIHtcbiAgICByZXR1cm4gZG9jdW1lbnQucXVlcnlTZWxlY3RvciggZWxlbSApO1xuICB9XG4gIHJldHVybiBlbGVtO1xufTtcblxuLy8gLS0tLS0gaGFuZGxlRXZlbnQgLS0tLS0gLy9cblxuLy8gZW5hYmxlIC5vbnR5cGUgdG8gdHJpZ2dlciBmcm9tIC5hZGRFdmVudExpc3RlbmVyKCBlbGVtLCAndHlwZScgKVxudXRpbHMuaGFuZGxlRXZlbnQgPSBmdW5jdGlvbiggZXZlbnQgKSB7XG4gIHZhciBtZXRob2QgPSAnb24nICsgZXZlbnQudHlwZTtcbiAgaWYgKCB0aGlzWyBtZXRob2QgXSApIHtcbiAgICB0aGlzWyBtZXRob2QgXSggZXZlbnQgKTtcbiAgfVxufTtcblxuLy8gLS0tLS0gZmlsdGVyRmluZEVsZW1lbnRzIC0tLS0tIC8vXG5cbnV0aWxzLmZpbHRlckZpbmRFbGVtZW50cyA9IGZ1bmN0aW9uKCBlbGVtcywgc2VsZWN0b3IgKSB7XG4gIC8vIG1ha2UgYXJyYXkgb2YgZWxlbXNcbiAgZWxlbXMgPSB1dGlscy5tYWtlQXJyYXkoIGVsZW1zICk7XG4gIHZhciBmZkVsZW1zID0gW107XG5cbiAgZWxlbXMuZm9yRWFjaCggZnVuY3Rpb24oIGVsZW0gKSB7XG4gICAgLy8gY2hlY2sgdGhhdCBlbGVtIGlzIGFuIGFjdHVhbCBlbGVtZW50XG4gICAgaWYgKCAhKCBlbGVtIGluc3RhbmNlb2YgSFRNTEVsZW1lbnQgKSApIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgLy8gYWRkIGVsZW0gaWYgbm8gc2VsZWN0b3JcbiAgICBpZiAoICFzZWxlY3RvciApIHtcbiAgICAgIGZmRWxlbXMucHVzaCggZWxlbSApO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICAvLyBmaWx0ZXIgJiBmaW5kIGl0ZW1zIGlmIHdlIGhhdmUgYSBzZWxlY3RvclxuICAgIC8vIGZpbHRlclxuICAgIGlmICggbWF0Y2hlc1NlbGVjdG9yKCBlbGVtLCBzZWxlY3RvciApICkge1xuICAgICAgZmZFbGVtcy5wdXNoKCBlbGVtICk7XG4gICAgfVxuICAgIC8vIGZpbmQgY2hpbGRyZW5cbiAgICB2YXIgY2hpbGRFbGVtcyA9IGVsZW0ucXVlcnlTZWxlY3RvckFsbCggc2VsZWN0b3IgKTtcbiAgICAvLyBjb25jYXQgY2hpbGRFbGVtcyB0byBmaWx0ZXJGb3VuZCBhcnJheVxuICAgIGZvciAoIHZhciBpPTA7IGkgPCBjaGlsZEVsZW1zLmxlbmd0aDsgaSsrICkge1xuICAgICAgZmZFbGVtcy5wdXNoKCBjaGlsZEVsZW1zW2ldICk7XG4gICAgfVxuICB9KTtcblxuICByZXR1cm4gZmZFbGVtcztcbn07XG5cbi8vIC0tLS0tIGRlYm91bmNlTWV0aG9kIC0tLS0tIC8vXG5cbnV0aWxzLmRlYm91bmNlTWV0aG9kID0gZnVuY3Rpb24oIF9jbGFzcywgbWV0aG9kTmFtZSwgdGhyZXNob2xkICkge1xuICB0aHJlc2hvbGQgPSB0aHJlc2hvbGQgfHwgMTAwO1xuICAvLyBvcmlnaW5hbCBtZXRob2RcbiAgdmFyIG1ldGhvZCA9IF9jbGFzcy5wcm90b3R5cGVbIG1ldGhvZE5hbWUgXTtcbiAgdmFyIHRpbWVvdXROYW1lID0gbWV0aG9kTmFtZSArICdUaW1lb3V0JztcblxuICBfY2xhc3MucHJvdG90eXBlWyBtZXRob2ROYW1lIF0gPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgdGltZW91dCA9IHRoaXNbIHRpbWVvdXROYW1lIF07XG4gICAgY2xlYXJUaW1lb3V0KCB0aW1lb3V0ICk7XG5cbiAgICB2YXIgYXJncyA9IGFyZ3VtZW50cztcbiAgICB2YXIgX3RoaXMgPSB0aGlzO1xuICAgIHRoaXNbIHRpbWVvdXROYW1lIF0gPSBzZXRUaW1lb3V0KCBmdW5jdGlvbigpIHtcbiAgICAgIG1ldGhvZC5hcHBseSggX3RoaXMsIGFyZ3MgKTtcbiAgICAgIGRlbGV0ZSBfdGhpc1sgdGltZW91dE5hbWUgXTtcbiAgICB9LCB0aHJlc2hvbGQgKTtcbiAgfTtcbn07XG5cbi8vIC0tLS0tIGRvY1JlYWR5IC0tLS0tIC8vXG5cbnV0aWxzLmRvY1JlYWR5ID0gZnVuY3Rpb24oIGNhbGxiYWNrICkge1xuICB2YXIgcmVhZHlTdGF0ZSA9IGRvY3VtZW50LnJlYWR5U3RhdGU7XG4gIGlmICggcmVhZHlTdGF0ZSA9PSAnY29tcGxldGUnIHx8IHJlYWR5U3RhdGUgPT0gJ2ludGVyYWN0aXZlJyApIHtcbiAgICAvLyBkbyBhc3luYyB0byBhbGxvdyBmb3Igb3RoZXIgc2NyaXB0cyB0byBydW4uIG1ldGFmaXp6eS9mbGlja2l0eSM0NDFcbiAgICBzZXRUaW1lb3V0KCBjYWxsYmFjayApO1xuICB9IGVsc2Uge1xuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoICdET01Db250ZW50TG9hZGVkJywgY2FsbGJhY2sgKTtcbiAgfVxufTtcblxuLy8gLS0tLS0gaHRtbEluaXQgLS0tLS0gLy9cblxuLy8gaHR0cDovL2phbWVzcm9iZXJ0cy5uYW1lL2Jsb2cvMjAxMC8wMi8yMi9zdHJpbmctZnVuY3Rpb25zLWZvci1qYXZhc2NyaXB0LXRyaW0tdG8tY2FtZWwtY2FzZS10by1kYXNoZWQtYW5kLXRvLXVuZGVyc2NvcmUvXG51dGlscy50b0Rhc2hlZCA9IGZ1bmN0aW9uKCBzdHIgKSB7XG4gIHJldHVybiBzdHIucmVwbGFjZSggLyguKShbQS1aXSkvZywgZnVuY3Rpb24oIG1hdGNoLCAkMSwgJDIgKSB7XG4gICAgcmV0dXJuICQxICsgJy0nICsgJDI7XG4gIH0pLnRvTG93ZXJDYXNlKCk7XG59O1xuXG52YXIgY29uc29sZSA9IHdpbmRvdy5jb25zb2xlO1xuLyoqXG4gKiBhbGxvdyB1c2VyIHRvIGluaXRpYWxpemUgY2xhc3NlcyB2aWEgW2RhdGEtbmFtZXNwYWNlXSBvciAuanMtbmFtZXNwYWNlIGNsYXNzXG4gKiBodG1sSW5pdCggV2lkZ2V0LCAnd2lkZ2V0TmFtZScgKVxuICogb3B0aW9ucyBhcmUgcGFyc2VkIGZyb20gZGF0YS1uYW1lc3BhY2Utb3B0aW9uc1xuICovXG51dGlscy5odG1sSW5pdCA9IGZ1bmN0aW9uKCBXaWRnZXRDbGFzcywgbmFtZXNwYWNlICkge1xuICB1dGlscy5kb2NSZWFkeSggZnVuY3Rpb24oKSB7XG4gICAgdmFyIGRhc2hlZE5hbWVzcGFjZSA9IHV0aWxzLnRvRGFzaGVkKCBuYW1lc3BhY2UgKTtcbiAgICB2YXIgZGF0YUF0dHIgPSAnZGF0YS0nICsgZGFzaGVkTmFtZXNwYWNlO1xuICAgIHZhciBkYXRhQXR0ckVsZW1zID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCggJ1snICsgZGF0YUF0dHIgKyAnXScgKTtcbiAgICB2YXIganNEYXNoRWxlbXMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCAnLmpzLScgKyBkYXNoZWROYW1lc3BhY2UgKTtcbiAgICB2YXIgZWxlbXMgPSB1dGlscy5tYWtlQXJyYXkoIGRhdGFBdHRyRWxlbXMgKVxuICAgICAgLmNvbmNhdCggdXRpbHMubWFrZUFycmF5KCBqc0Rhc2hFbGVtcyApICk7XG4gICAgdmFyIGRhdGFPcHRpb25zQXR0ciA9IGRhdGFBdHRyICsgJy1vcHRpb25zJztcbiAgICB2YXIgalF1ZXJ5ID0gd2luZG93LmpRdWVyeTtcblxuICAgIGVsZW1zLmZvckVhY2goIGZ1bmN0aW9uKCBlbGVtICkge1xuICAgICAgdmFyIGF0dHIgPSBlbGVtLmdldEF0dHJpYnV0ZSggZGF0YUF0dHIgKSB8fFxuICAgICAgICBlbGVtLmdldEF0dHJpYnV0ZSggZGF0YU9wdGlvbnNBdHRyICk7XG4gICAgICB2YXIgb3B0aW9ucztcbiAgICAgIHRyeSB7XG4gICAgICAgIG9wdGlvbnMgPSBhdHRyICYmIEpTT04ucGFyc2UoIGF0dHIgKTtcbiAgICAgIH0gY2F0Y2ggKCBlcnJvciApIHtcbiAgICAgICAgLy8gbG9nIGVycm9yLCBkbyBub3QgaW5pdGlhbGl6ZVxuICAgICAgICBpZiAoIGNvbnNvbGUgKSB7XG4gICAgICAgICAgY29uc29sZS5lcnJvciggJ0Vycm9yIHBhcnNpbmcgJyArIGRhdGFBdHRyICsgJyBvbiAnICsgZWxlbS5jbGFzc05hbWUgK1xuICAgICAgICAgICc6ICcgKyBlcnJvciApO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIC8vIGluaXRpYWxpemVcbiAgICAgIHZhciBpbnN0YW5jZSA9IG5ldyBXaWRnZXRDbGFzcyggZWxlbSwgb3B0aW9ucyApO1xuICAgICAgLy8gbWFrZSBhdmFpbGFibGUgdmlhICQoKS5kYXRhKCduYW1lc3BhY2UnKVxuICAgICAgaWYgKCBqUXVlcnkgKSB7XG4gICAgICAgIGpRdWVyeS5kYXRhKCBlbGVtLCBuYW1lc3BhY2UsIGluc3RhbmNlICk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgfSk7XG59O1xuXG4vLyAtLS0tLSAgLS0tLS0gLy9cblxucmV0dXJuIHV0aWxzO1xuXG59KSk7XG4iLCIvLyBGbGlja2l0eS5DZWxsXG4oIGZ1bmN0aW9uKCB3aW5kb3csIGZhY3RvcnkgKSB7XG4gIC8vIHVuaXZlcnNhbCBtb2R1bGUgZGVmaW5pdGlvblxuICBpZiAoIHR5cGVvZiBkZWZpbmUgPT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kICkge1xuICAgIC8vIEFNRFxuICAgIGRlZmluZSggW1xuICAgICAgJ2dldC1zaXplL2dldC1zaXplJyxcbiAgICBdLCBmdW5jdGlvbiggZ2V0U2l6ZSApIHtcbiAgICAgIHJldHVybiBmYWN0b3J5KCB3aW5kb3csIGdldFNpemUgKTtcbiAgICB9ICk7XG4gIH0gZWxzZSBpZiAoIHR5cGVvZiBtb2R1bGUgPT0gJ29iamVjdCcgJiYgbW9kdWxlLmV4cG9ydHMgKSB7XG4gICAgLy8gQ29tbW9uSlNcbiAgICBtb2R1bGUuZXhwb3J0cyA9IGZhY3RvcnkoXG4gICAgICAgIHdpbmRvdyxcbiAgICAgICAgcmVxdWlyZSgnZ2V0LXNpemUnKVxuICAgICk7XG4gIH0gZWxzZSB7XG4gICAgLy8gYnJvd3NlciBnbG9iYWxcbiAgICB3aW5kb3cuRmxpY2tpdHkgPSB3aW5kb3cuRmxpY2tpdHkgfHwge307XG4gICAgd2luZG93LkZsaWNraXR5LkNlbGwgPSBmYWN0b3J5KFxuICAgICAgICB3aW5kb3csXG4gICAgICAgIHdpbmRvdy5nZXRTaXplXG4gICAgKTtcbiAgfVxuXG59KCB3aW5kb3csIGZ1bmN0aW9uIGZhY3RvcnkoIHdpbmRvdywgZ2V0U2l6ZSApIHtcblxuJ3VzZSBzdHJpY3QnO1xuXG5mdW5jdGlvbiBDZWxsKCBlbGVtLCBwYXJlbnQgKSB7XG4gIHRoaXMuZWxlbWVudCA9IGVsZW07XG4gIHRoaXMucGFyZW50ID0gcGFyZW50O1xuXG4gIHRoaXMuY3JlYXRlKCk7XG59XG5cbnZhciBwcm90byA9IENlbGwucHJvdG90eXBlO1xuXG5wcm90by5jcmVhdGUgPSBmdW5jdGlvbigpIHtcbiAgdGhpcy5lbGVtZW50LnN0eWxlLnBvc2l0aW9uID0gJ2Fic29sdXRlJztcbiAgdGhpcy5lbGVtZW50LnNldEF0dHJpYnV0ZSggJ2FyaWEtaGlkZGVuJywgJ3RydWUnICk7XG4gIHRoaXMueCA9IDA7XG4gIHRoaXMuc2hpZnQgPSAwO1xufTtcblxucHJvdG8uZGVzdHJveSA9IGZ1bmN0aW9uKCkge1xuICAvLyByZXNldCBzdHlsZVxuICB0aGlzLnVuc2VsZWN0KCk7XG4gIHRoaXMuZWxlbWVudC5zdHlsZS5wb3NpdGlvbiA9ICcnO1xuICB2YXIgc2lkZSA9IHRoaXMucGFyZW50Lm9yaWdpblNpZGU7XG4gIHRoaXMuZWxlbWVudC5zdHlsZVsgc2lkZSBdID0gJyc7XG4gIHRoaXMuZWxlbWVudC5yZW1vdmVBdHRyaWJ1dGUoJ2FyaWEtaGlkZGVuJyk7XG59O1xuXG5wcm90by5nZXRTaXplID0gZnVuY3Rpb24oKSB7XG4gIHRoaXMuc2l6ZSA9IGdldFNpemUoIHRoaXMuZWxlbWVudCApO1xufTtcblxucHJvdG8uc2V0UG9zaXRpb24gPSBmdW5jdGlvbiggeCApIHtcbiAgdGhpcy54ID0geDtcbiAgdGhpcy51cGRhdGVUYXJnZXQoKTtcbiAgdGhpcy5yZW5kZXJQb3NpdGlvbiggeCApO1xufTtcblxuLy8gc2V0RGVmYXVsdFRhcmdldCB2MSBtZXRob2QsIGJhY2t3YXJkcyBjb21wYXRpYmlsaXR5LCByZW1vdmUgaW4gdjNcbnByb3RvLnVwZGF0ZVRhcmdldCA9IHByb3RvLnNldERlZmF1bHRUYXJnZXQgPSBmdW5jdGlvbigpIHtcbiAgdmFyIG1hcmdpblByb3BlcnR5ID0gdGhpcy5wYXJlbnQub3JpZ2luU2lkZSA9PSAnbGVmdCcgPyAnbWFyZ2luTGVmdCcgOiAnbWFyZ2luUmlnaHQnO1xuICB0aGlzLnRhcmdldCA9IHRoaXMueCArIHRoaXMuc2l6ZVsgbWFyZ2luUHJvcGVydHkgXSArXG4gICAgdGhpcy5zaXplLndpZHRoICogdGhpcy5wYXJlbnQuY2VsbEFsaWduO1xufTtcblxucHJvdG8ucmVuZGVyUG9zaXRpb24gPSBmdW5jdGlvbiggeCApIHtcbiAgLy8gcmVuZGVyIHBvc2l0aW9uIG9mIGNlbGwgd2l0aCBpbiBzbGlkZXJcbiAgdmFyIHNpZGUgPSB0aGlzLnBhcmVudC5vcmlnaW5TaWRlO1xuICB0aGlzLmVsZW1lbnQuc3R5bGVbIHNpZGUgXSA9IHRoaXMucGFyZW50LmdldFBvc2l0aW9uVmFsdWUoIHggKTtcbn07XG5cbnByb3RvLnNlbGVjdCA9IGZ1bmN0aW9uKCkge1xuICB0aGlzLmVsZW1lbnQuY2xhc3NMaXN0LmFkZCgnaXMtc2VsZWN0ZWQnKTtcbiAgdGhpcy5lbGVtZW50LnJlbW92ZUF0dHJpYnV0ZSgnYXJpYS1oaWRkZW4nKTtcbn07XG5cbnByb3RvLnVuc2VsZWN0ID0gZnVuY3Rpb24oKSB7XG4gIHRoaXMuZWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKCdpcy1zZWxlY3RlZCcpO1xuICB0aGlzLmVsZW1lbnQuc2V0QXR0cmlidXRlKCAnYXJpYS1oaWRkZW4nLCAndHJ1ZScgKTtcbn07XG5cbi8qKlxuICogQHBhcmFtIHtJbnRlZ2VyfSBzaGlmdCAtIDAsIDEsIG9yIC0xXG4gKi9cbnByb3RvLndyYXBTaGlmdCA9IGZ1bmN0aW9uKCBzaGlmdCApIHtcbiAgdGhpcy5zaGlmdCA9IHNoaWZ0O1xuICB0aGlzLnJlbmRlclBvc2l0aW9uKCB0aGlzLnggKyB0aGlzLnBhcmVudC5zbGlkZWFibGVXaWR0aCAqIHNoaWZ0ICk7XG59O1xuXG5wcm90by5yZW1vdmUgPSBmdW5jdGlvbigpIHtcbiAgdGhpcy5lbGVtZW50LnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQoIHRoaXMuZWxlbWVudCApO1xufTtcblxucmV0dXJuIENlbGw7XG5cbn0gKSApO1xuIiwiLy8gc2xpZGVcbiggZnVuY3Rpb24oIHdpbmRvdywgZmFjdG9yeSApIHtcbiAgLy8gdW5pdmVyc2FsIG1vZHVsZSBkZWZpbml0aW9uXG4gIGlmICggdHlwZW9mIGRlZmluZSA9PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQgKSB7XG4gICAgLy8gQU1EXG4gICAgZGVmaW5lKCBmYWN0b3J5ICk7XG4gIH0gZWxzZSBpZiAoIHR5cGVvZiBtb2R1bGUgPT0gJ29iamVjdCcgJiYgbW9kdWxlLmV4cG9ydHMgKSB7XG4gICAgLy8gQ29tbW9uSlNcbiAgICBtb2R1bGUuZXhwb3J0cyA9IGZhY3RvcnkoKTtcbiAgfSBlbHNlIHtcbiAgICAvLyBicm93c2VyIGdsb2JhbFxuICAgIHdpbmRvdy5GbGlja2l0eSA9IHdpbmRvdy5GbGlja2l0eSB8fCB7fTtcbiAgICB3aW5kb3cuRmxpY2tpdHkuU2xpZGUgPSBmYWN0b3J5KCk7XG4gIH1cblxufSggd2luZG93LCBmdW5jdGlvbiBmYWN0b3J5KCkge1xuJ3VzZSBzdHJpY3QnO1xuXG5mdW5jdGlvbiBTbGlkZSggcGFyZW50ICkge1xuICB0aGlzLnBhcmVudCA9IHBhcmVudDtcbiAgdGhpcy5pc09yaWdpbkxlZnQgPSBwYXJlbnQub3JpZ2luU2lkZSA9PSAnbGVmdCc7XG4gIHRoaXMuY2VsbHMgPSBbXTtcbiAgdGhpcy5vdXRlcldpZHRoID0gMDtcbiAgdGhpcy5oZWlnaHQgPSAwO1xufVxuXG52YXIgcHJvdG8gPSBTbGlkZS5wcm90b3R5cGU7XG5cbnByb3RvLmFkZENlbGwgPSBmdW5jdGlvbiggY2VsbCApIHtcbiAgdGhpcy5jZWxscy5wdXNoKCBjZWxsICk7XG4gIHRoaXMub3V0ZXJXaWR0aCArPSBjZWxsLnNpemUub3V0ZXJXaWR0aDtcbiAgdGhpcy5oZWlnaHQgPSBNYXRoLm1heCggY2VsbC5zaXplLm91dGVySGVpZ2h0LCB0aGlzLmhlaWdodCApO1xuICAvLyBmaXJzdCBjZWxsIHN0dWZmXG4gIGlmICggdGhpcy5jZWxscy5sZW5ndGggPT0gMSApIHtcbiAgICB0aGlzLnggPSBjZWxsLng7IC8vIHggY29tZXMgZnJvbSBmaXJzdCBjZWxsXG4gICAgdmFyIGJlZ2luTWFyZ2luID0gdGhpcy5pc09yaWdpbkxlZnQgPyAnbWFyZ2luTGVmdCcgOiAnbWFyZ2luUmlnaHQnO1xuICAgIHRoaXMuZmlyc3RNYXJnaW4gPSBjZWxsLnNpemVbIGJlZ2luTWFyZ2luIF07XG4gIH1cbn07XG5cbnByb3RvLnVwZGF0ZVRhcmdldCA9IGZ1bmN0aW9uKCkge1xuICB2YXIgZW5kTWFyZ2luID0gdGhpcy5pc09yaWdpbkxlZnQgPyAnbWFyZ2luUmlnaHQnIDogJ21hcmdpbkxlZnQnO1xuICB2YXIgbGFzdENlbGwgPSB0aGlzLmdldExhc3RDZWxsKCk7XG4gIHZhciBsYXN0TWFyZ2luID0gbGFzdENlbGwgPyBsYXN0Q2VsbC5zaXplWyBlbmRNYXJnaW4gXSA6IDA7XG4gIHZhciBzbGlkZVdpZHRoID0gdGhpcy5vdXRlcldpZHRoIC0gKCB0aGlzLmZpcnN0TWFyZ2luICsgbGFzdE1hcmdpbiApO1xuICB0aGlzLnRhcmdldCA9IHRoaXMueCArIHRoaXMuZmlyc3RNYXJnaW4gKyBzbGlkZVdpZHRoICogdGhpcy5wYXJlbnQuY2VsbEFsaWduO1xufTtcblxucHJvdG8uZ2V0TGFzdENlbGwgPSBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIHRoaXMuY2VsbHNbIHRoaXMuY2VsbHMubGVuZ3RoIC0gMSBdO1xufTtcblxucHJvdG8uc2VsZWN0ID0gZnVuY3Rpb24oKSB7XG4gIHRoaXMuY2VsbHMuZm9yRWFjaCggZnVuY3Rpb24oIGNlbGwgKSB7XG4gICAgY2VsbC5zZWxlY3QoKTtcbiAgfSApO1xufTtcblxucHJvdG8udW5zZWxlY3QgPSBmdW5jdGlvbigpIHtcbiAgdGhpcy5jZWxscy5mb3JFYWNoKCBmdW5jdGlvbiggY2VsbCApIHtcbiAgICBjZWxsLnVuc2VsZWN0KCk7XG4gIH0gKTtcbn07XG5cbnByb3RvLmdldENlbGxFbGVtZW50cyA9IGZ1bmN0aW9uKCkge1xuICByZXR1cm4gdGhpcy5jZWxscy5tYXAoIGZ1bmN0aW9uKCBjZWxsICkge1xuICAgIHJldHVybiBjZWxsLmVsZW1lbnQ7XG4gIH0gKTtcbn07XG5cbnJldHVybiBTbGlkZTtcblxufSApICk7XG4iLCIvLyBhbmltYXRlXG4oIGZ1bmN0aW9uKCB3aW5kb3csIGZhY3RvcnkgKSB7XG4gIC8vIHVuaXZlcnNhbCBtb2R1bGUgZGVmaW5pdGlvblxuICBpZiAoIHR5cGVvZiBkZWZpbmUgPT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kICkge1xuICAgIC8vIEFNRFxuICAgIGRlZmluZSggW1xuICAgICAgJ2Zpenp5LXVpLXV0aWxzL3V0aWxzJyxcbiAgICBdLCBmdW5jdGlvbiggdXRpbHMgKSB7XG4gICAgICByZXR1cm4gZmFjdG9yeSggd2luZG93LCB1dGlscyApO1xuICAgIH0gKTtcbiAgfSBlbHNlIGlmICggdHlwZW9mIG1vZHVsZSA9PSAnb2JqZWN0JyAmJiBtb2R1bGUuZXhwb3J0cyApIHtcbiAgICAvLyBDb21tb25KU1xuICAgIG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeShcbiAgICAgICAgd2luZG93LFxuICAgICAgICByZXF1aXJlKCdmaXp6eS11aS11dGlscycpXG4gICAgKTtcbiAgfSBlbHNlIHtcbiAgICAvLyBicm93c2VyIGdsb2JhbFxuICAgIHdpbmRvdy5GbGlja2l0eSA9IHdpbmRvdy5GbGlja2l0eSB8fCB7fTtcbiAgICB3aW5kb3cuRmxpY2tpdHkuYW5pbWF0ZVByb3RvdHlwZSA9IGZhY3RvcnkoXG4gICAgICAgIHdpbmRvdyxcbiAgICAgICAgd2luZG93LmZpenp5VUlVdGlsc1xuICAgICk7XG4gIH1cblxufSggd2luZG93LCBmdW5jdGlvbiBmYWN0b3J5KCB3aW5kb3csIHV0aWxzICkge1xuXG4ndXNlIHN0cmljdCc7XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIGFuaW1hdGUgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gLy9cblxudmFyIHByb3RvID0ge307XG5cbnByb3RvLnN0YXJ0QW5pbWF0aW9uID0gZnVuY3Rpb24oKSB7XG4gIGlmICggdGhpcy5pc0FuaW1hdGluZyApIHtcbiAgICByZXR1cm47XG4gIH1cblxuICB0aGlzLmlzQW5pbWF0aW5nID0gdHJ1ZTtcbiAgdGhpcy5yZXN0aW5nRnJhbWVzID0gMDtcbiAgdGhpcy5hbmltYXRlKCk7XG59O1xuXG5wcm90by5hbmltYXRlID0gZnVuY3Rpb24oKSB7XG4gIHRoaXMuYXBwbHlEcmFnRm9yY2UoKTtcbiAgdGhpcy5hcHBseVNlbGVjdGVkQXR0cmFjdGlvbigpO1xuXG4gIHZhciBwcmV2aW91c1ggPSB0aGlzLng7XG5cbiAgdGhpcy5pbnRlZ3JhdGVQaHlzaWNzKCk7XG4gIHRoaXMucG9zaXRpb25TbGlkZXIoKTtcbiAgdGhpcy5zZXR0bGUoIHByZXZpb3VzWCApO1xuICAvLyBhbmltYXRlIG5leHQgZnJhbWVcbiAgaWYgKCB0aGlzLmlzQW5pbWF0aW5nICkge1xuICAgIHZhciBfdGhpcyA9IHRoaXM7XG4gICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKCBmdW5jdGlvbiBhbmltYXRlRnJhbWUoKSB7XG4gICAgICBfdGhpcy5hbmltYXRlKCk7XG4gICAgfSApO1xuICB9XG59O1xuXG5wcm90by5wb3NpdGlvblNsaWRlciA9IGZ1bmN0aW9uKCkge1xuICB2YXIgeCA9IHRoaXMueDtcbiAgLy8gd3JhcCBwb3NpdGlvbiBhcm91bmRcbiAgaWYgKCB0aGlzLm9wdGlvbnMud3JhcEFyb3VuZCAmJiB0aGlzLmNlbGxzLmxlbmd0aCA+IDEgKSB7XG4gICAgeCA9IHV0aWxzLm1vZHVsbyggeCwgdGhpcy5zbGlkZWFibGVXaWR0aCApO1xuICAgIHggLT0gdGhpcy5zbGlkZWFibGVXaWR0aDtcbiAgICB0aGlzLnNoaWZ0V3JhcENlbGxzKCB4ICk7XG4gIH1cblxuICB0aGlzLnNldFRyYW5zbGF0ZVgoIHgsIHRoaXMuaXNBbmltYXRpbmcgKTtcbiAgdGhpcy5kaXNwYXRjaFNjcm9sbEV2ZW50KCk7XG59O1xuXG5wcm90by5zZXRUcmFuc2xhdGVYID0gZnVuY3Rpb24oIHgsIGlzM2QgKSB7XG4gIHggKz0gdGhpcy5jdXJzb3JQb3NpdGlvbjtcbiAgLy8gcmV2ZXJzZSBpZiByaWdodC10by1sZWZ0IGFuZCB1c2luZyB0cmFuc2Zvcm1cbiAgeCA9IHRoaXMub3B0aW9ucy5yaWdodFRvTGVmdCA/IC14IDogeDtcbiAgdmFyIHRyYW5zbGF0ZVggPSB0aGlzLmdldFBvc2l0aW9uVmFsdWUoIHggKTtcbiAgLy8gdXNlIDNEIHRyYW5zZm9ybXMgZm9yIGhhcmR3YXJlIGFjY2VsZXJhdGlvbiBvbiBpT1NcbiAgLy8gYnV0IHVzZSAyRCB3aGVuIHNldHRsZWQsIGZvciBiZXR0ZXIgZm9udC1yZW5kZXJpbmdcbiAgdGhpcy5zbGlkZXIuc3R5bGUudHJhbnNmb3JtID0gaXMzZCA/XG4gICAgJ3RyYW5zbGF0ZTNkKCcgKyB0cmFuc2xhdGVYICsgJywwLDApJyA6ICd0cmFuc2xhdGVYKCcgKyB0cmFuc2xhdGVYICsgJyknO1xufTtcblxucHJvdG8uZGlzcGF0Y2hTY3JvbGxFdmVudCA9IGZ1bmN0aW9uKCkge1xuICB2YXIgZmlyc3RTbGlkZSA9IHRoaXMuc2xpZGVzWzBdO1xuICBpZiAoICFmaXJzdFNsaWRlICkge1xuICAgIHJldHVybjtcbiAgfVxuICB2YXIgcG9zaXRpb25YID0gLXRoaXMueCAtIGZpcnN0U2xpZGUudGFyZ2V0O1xuICB2YXIgcHJvZ3Jlc3MgPSBwb3NpdGlvblggLyB0aGlzLnNsaWRlc1dpZHRoO1xuICB0aGlzLmRpc3BhdGNoRXZlbnQoICdzY3JvbGwnLCBudWxsLCBbIHByb2dyZXNzLCBwb3NpdGlvblggXSApO1xufTtcblxucHJvdG8ucG9zaXRpb25TbGlkZXJBdFNlbGVjdGVkID0gZnVuY3Rpb24oKSB7XG4gIGlmICggIXRoaXMuY2VsbHMubGVuZ3RoICkge1xuICAgIHJldHVybjtcbiAgfVxuICB0aGlzLnggPSAtdGhpcy5zZWxlY3RlZFNsaWRlLnRhcmdldDtcbiAgdGhpcy52ZWxvY2l0eSA9IDA7IC8vIHN0b3Agd29iYmxlXG4gIHRoaXMucG9zaXRpb25TbGlkZXIoKTtcbn07XG5cbnByb3RvLmdldFBvc2l0aW9uVmFsdWUgPSBmdW5jdGlvbiggcG9zaXRpb24gKSB7XG4gIGlmICggdGhpcy5vcHRpb25zLnBlcmNlbnRQb3NpdGlvbiApIHtcbiAgICAvLyBwZXJjZW50IHBvc2l0aW9uLCByb3VuZCB0byAyIGRpZ2l0cywgbGlrZSAxMi4zNCVcbiAgICByZXR1cm4gKCBNYXRoLnJvdW5kKCAoIHBvc2l0aW9uIC8gdGhpcy5zaXplLmlubmVyV2lkdGggKSAqIDEwMDAwICkgKiAwLjAxICkgKyAnJSc7XG4gIH0gZWxzZSB7XG4gICAgLy8gcGl4ZWwgcG9zaXRpb25pbmdcbiAgICByZXR1cm4gTWF0aC5yb3VuZCggcG9zaXRpb24gKSArICdweCc7XG4gIH1cbn07XG5cbnByb3RvLnNldHRsZSA9IGZ1bmN0aW9uKCBwcmV2aW91c1ggKSB7XG4gIC8vIGtlZXAgdHJhY2sgb2YgZnJhbWVzIHdoZXJlIHggaGFzbid0IG1vdmVkXG4gIHZhciBpc1Jlc3RpbmcgPSAhdGhpcy5pc1BvaW50ZXJEb3duICYmXG4gICAgICBNYXRoLnJvdW5kKCB0aGlzLnggKiAxMDAgKSA9PSBNYXRoLnJvdW5kKCBwcmV2aW91c1ggKiAxMDAgKTtcbiAgaWYgKCBpc1Jlc3RpbmcgKSB7XG4gICAgdGhpcy5yZXN0aW5nRnJhbWVzKys7XG4gIH1cbiAgLy8gc3RvcCBhbmltYXRpbmcgaWYgcmVzdGluZyBmb3IgMyBvciBtb3JlIGZyYW1lc1xuICBpZiAoIHRoaXMucmVzdGluZ0ZyYW1lcyA+IDIgKSB7XG4gICAgdGhpcy5pc0FuaW1hdGluZyA9IGZhbHNlO1xuICAgIGRlbGV0ZSB0aGlzLmlzRnJlZVNjcm9sbGluZztcbiAgICAvLyByZW5kZXIgcG9zaXRpb24gd2l0aCB0cmFuc2xhdGVYIHdoZW4gc2V0dGxlZFxuICAgIHRoaXMucG9zaXRpb25TbGlkZXIoKTtcbiAgICB0aGlzLmRpc3BhdGNoRXZlbnQoICdzZXR0bGUnLCBudWxsLCBbIHRoaXMuc2VsZWN0ZWRJbmRleCBdICk7XG4gIH1cbn07XG5cbnByb3RvLnNoaWZ0V3JhcENlbGxzID0gZnVuY3Rpb24oIHggKSB7XG4gIC8vIHNoaWZ0IGJlZm9yZSBjZWxsc1xuICB2YXIgYmVmb3JlR2FwID0gdGhpcy5jdXJzb3JQb3NpdGlvbiArIHg7XG4gIHRoaXMuX3NoaWZ0Q2VsbHMoIHRoaXMuYmVmb3JlU2hpZnRDZWxscywgYmVmb3JlR2FwLCAtMSApO1xuICAvLyBzaGlmdCBhZnRlciBjZWxsc1xuICB2YXIgYWZ0ZXJHYXAgPSB0aGlzLnNpemUuaW5uZXJXaWR0aCAtICggeCArIHRoaXMuc2xpZGVhYmxlV2lkdGggKyB0aGlzLmN1cnNvclBvc2l0aW9uICk7XG4gIHRoaXMuX3NoaWZ0Q2VsbHMoIHRoaXMuYWZ0ZXJTaGlmdENlbGxzLCBhZnRlckdhcCwgMSApO1xufTtcblxucHJvdG8uX3NoaWZ0Q2VsbHMgPSBmdW5jdGlvbiggY2VsbHMsIGdhcCwgc2hpZnQgKSB7XG4gIGZvciAoIHZhciBpID0gMDsgaSA8IGNlbGxzLmxlbmd0aDsgaSsrICkge1xuICAgIHZhciBjZWxsID0gY2VsbHNbaV07XG4gICAgdmFyIGNlbGxTaGlmdCA9IGdhcCA+IDAgPyBzaGlmdCA6IDA7XG4gICAgY2VsbC53cmFwU2hpZnQoIGNlbGxTaGlmdCApO1xuICAgIGdhcCAtPSBjZWxsLnNpemUub3V0ZXJXaWR0aDtcbiAgfVxufTtcblxucHJvdG8uX3Vuc2hpZnRDZWxscyA9IGZ1bmN0aW9uKCBjZWxscyApIHtcbiAgaWYgKCAhY2VsbHMgfHwgIWNlbGxzLmxlbmd0aCApIHtcbiAgICByZXR1cm47XG4gIH1cbiAgZm9yICggdmFyIGkgPSAwOyBpIDwgY2VsbHMubGVuZ3RoOyBpKysgKSB7XG4gICAgY2VsbHNbaV0ud3JhcFNoaWZ0KCAwICk7XG4gIH1cbn07XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIHBoeXNpY3MgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gLy9cblxucHJvdG8uaW50ZWdyYXRlUGh5c2ljcyA9IGZ1bmN0aW9uKCkge1xuICB0aGlzLnggKz0gdGhpcy52ZWxvY2l0eTtcbiAgdGhpcy52ZWxvY2l0eSAqPSB0aGlzLmdldEZyaWN0aW9uRmFjdG9yKCk7XG59O1xuXG5wcm90by5hcHBseUZvcmNlID0gZnVuY3Rpb24oIGZvcmNlICkge1xuICB0aGlzLnZlbG9jaXR5ICs9IGZvcmNlO1xufTtcblxucHJvdG8uZ2V0RnJpY3Rpb25GYWN0b3IgPSBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIDEgLSB0aGlzLm9wdGlvbnNbIHRoaXMuaXNGcmVlU2Nyb2xsaW5nID8gJ2ZyZWVTY3JvbGxGcmljdGlvbicgOiAnZnJpY3Rpb24nIF07XG59O1xuXG5wcm90by5nZXRSZXN0aW5nUG9zaXRpb24gPSBmdW5jdGlvbigpIHtcbiAgLy8gbXkgdGhhbmtzIHRvIFN0ZXZlbiBXaXR0ZW5zLCB3aG8gc2ltcGxpZmllZCB0aGlzIG1hdGggZ3JlYXRseVxuICByZXR1cm4gdGhpcy54ICsgdGhpcy52ZWxvY2l0eSAvICggMSAtIHRoaXMuZ2V0RnJpY3Rpb25GYWN0b3IoKSApO1xufTtcblxucHJvdG8uYXBwbHlEcmFnRm9yY2UgPSBmdW5jdGlvbigpIHtcbiAgaWYgKCAhdGhpcy5pc0RyYWdnYWJsZSB8fCAhdGhpcy5pc1BvaW50ZXJEb3duICkge1xuICAgIHJldHVybjtcbiAgfVxuICAvLyBjaGFuZ2UgdGhlIHBvc2l0aW9uIHRvIGRyYWcgcG9zaXRpb24gYnkgYXBwbHlpbmcgZm9yY2VcbiAgdmFyIGRyYWdWZWxvY2l0eSA9IHRoaXMuZHJhZ1ggLSB0aGlzLng7XG4gIHZhciBkcmFnRm9yY2UgPSBkcmFnVmVsb2NpdHkgLSB0aGlzLnZlbG9jaXR5O1xuICB0aGlzLmFwcGx5Rm9yY2UoIGRyYWdGb3JjZSApO1xufTtcblxucHJvdG8uYXBwbHlTZWxlY3RlZEF0dHJhY3Rpb24gPSBmdW5jdGlvbigpIHtcbiAgLy8gZG8gbm90IGF0dHJhY3QgaWYgcG9pbnRlciBkb3duIG9yIG5vIHNsaWRlc1xuICB2YXIgZHJhZ0Rvd24gPSB0aGlzLmlzRHJhZ2dhYmxlICYmIHRoaXMuaXNQb2ludGVyRG93bjtcbiAgaWYgKCBkcmFnRG93biB8fCB0aGlzLmlzRnJlZVNjcm9sbGluZyB8fCAhdGhpcy5zbGlkZXMubGVuZ3RoICkge1xuICAgIHJldHVybjtcbiAgfVxuICB2YXIgZGlzdGFuY2UgPSB0aGlzLnNlbGVjdGVkU2xpZGUudGFyZ2V0ICogLTEgLSB0aGlzLng7XG4gIHZhciBmb3JjZSA9IGRpc3RhbmNlICogdGhpcy5vcHRpb25zLnNlbGVjdGVkQXR0cmFjdGlvbjtcbiAgdGhpcy5hcHBseUZvcmNlKCBmb3JjZSApO1xufTtcblxucmV0dXJuIHByb3RvO1xuXG59ICkgKTtcbiIsIi8vIEZsaWNraXR5IG1haW5cbi8qIGVzbGludC1kaXNhYmxlIG1heC1wYXJhbXMgKi9cbiggZnVuY3Rpb24oIHdpbmRvdywgZmFjdG9yeSApIHtcbiAgLy8gdW5pdmVyc2FsIG1vZHVsZSBkZWZpbml0aW9uXG4gIGlmICggdHlwZW9mIGRlZmluZSA9PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQgKSB7XG4gICAgLy8gQU1EXG4gICAgZGVmaW5lKCBbXG4gICAgICAnZXYtZW1pdHRlci9ldi1lbWl0dGVyJyxcbiAgICAgICdnZXQtc2l6ZS9nZXQtc2l6ZScsXG4gICAgICAnZml6enktdWktdXRpbHMvdXRpbHMnLFxuICAgICAgJy4vY2VsbCcsXG4gICAgICAnLi9zbGlkZScsXG4gICAgICAnLi9hbmltYXRlJyxcbiAgICBdLCBmdW5jdGlvbiggRXZFbWl0dGVyLCBnZXRTaXplLCB1dGlscywgQ2VsbCwgU2xpZGUsIGFuaW1hdGVQcm90b3R5cGUgKSB7XG4gICAgICByZXR1cm4gZmFjdG9yeSggd2luZG93LCBFdkVtaXR0ZXIsIGdldFNpemUsIHV0aWxzLCBDZWxsLCBTbGlkZSwgYW5pbWF0ZVByb3RvdHlwZSApO1xuICAgIH0gKTtcbiAgfSBlbHNlIGlmICggdHlwZW9mIG1vZHVsZSA9PSAnb2JqZWN0JyAmJiBtb2R1bGUuZXhwb3J0cyApIHtcbiAgICAvLyBDb21tb25KU1xuICAgIG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeShcbiAgICAgICAgd2luZG93LFxuICAgICAgICByZXF1aXJlKCdldi1lbWl0dGVyJyksXG4gICAgICAgIHJlcXVpcmUoJ2dldC1zaXplJyksXG4gICAgICAgIHJlcXVpcmUoJ2Zpenp5LXVpLXV0aWxzJyksXG4gICAgICAgIHJlcXVpcmUoJy4vY2VsbCcpLFxuICAgICAgICByZXF1aXJlKCcuL3NsaWRlJyksXG4gICAgICAgIHJlcXVpcmUoJy4vYW5pbWF0ZScpXG4gICAgKTtcbiAgfSBlbHNlIHtcbiAgICAvLyBicm93c2VyIGdsb2JhbFxuICAgIHZhciBfRmxpY2tpdHkgPSB3aW5kb3cuRmxpY2tpdHk7XG5cbiAgICB3aW5kb3cuRmxpY2tpdHkgPSBmYWN0b3J5KFxuICAgICAgICB3aW5kb3csXG4gICAgICAgIHdpbmRvdy5FdkVtaXR0ZXIsXG4gICAgICAgIHdpbmRvdy5nZXRTaXplLFxuICAgICAgICB3aW5kb3cuZml6enlVSVV0aWxzLFxuICAgICAgICBfRmxpY2tpdHkuQ2VsbCxcbiAgICAgICAgX0ZsaWNraXR5LlNsaWRlLFxuICAgICAgICBfRmxpY2tpdHkuYW5pbWF0ZVByb3RvdHlwZVxuICAgICk7XG4gIH1cblxufSggd2luZG93LCBmdW5jdGlvbiBmYWN0b3J5KCB3aW5kb3csIEV2RW1pdHRlciwgZ2V0U2l6ZSxcbiAgICB1dGlscywgQ2VsbCwgU2xpZGUsIGFuaW1hdGVQcm90b3R5cGUgKSB7XG5cbi8qIGVzbGludC1lbmFibGUgbWF4LXBhcmFtcyAqL1xuJ3VzZSBzdHJpY3QnO1xuXG4vLyB2YXJzXG52YXIgalF1ZXJ5ID0gd2luZG93LmpRdWVyeTtcbnZhciBnZXRDb21wdXRlZFN0eWxlID0gd2luZG93LmdldENvbXB1dGVkU3R5bGU7XG52YXIgY29uc29sZSA9IHdpbmRvdy5jb25zb2xlO1xuXG5mdW5jdGlvbiBtb3ZlRWxlbWVudHMoIGVsZW1zLCB0b0VsZW0gKSB7XG4gIGVsZW1zID0gdXRpbHMubWFrZUFycmF5KCBlbGVtcyApO1xuICB3aGlsZSAoIGVsZW1zLmxlbmd0aCApIHtcbiAgICB0b0VsZW0uYXBwZW5kQ2hpbGQoIGVsZW1zLnNoaWZ0KCkgKTtcbiAgfVxufVxuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSBGbGlja2l0eSAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSAvL1xuXG4vLyBnbG9iYWxseSB1bmlxdWUgaWRlbnRpZmllcnNcbnZhciBHVUlEID0gMDtcbi8vIGludGVybmFsIHN0b3JlIG9mIGFsbCBGbGlja2l0eSBpbnRhbmNlc1xudmFyIGluc3RhbmNlcyA9IHt9O1xuXG5mdW5jdGlvbiBGbGlja2l0eSggZWxlbWVudCwgb3B0aW9ucyApIHtcbiAgdmFyIHF1ZXJ5RWxlbWVudCA9IHV0aWxzLmdldFF1ZXJ5RWxlbWVudCggZWxlbWVudCApO1xuICBpZiAoICFxdWVyeUVsZW1lbnQgKSB7XG4gICAgaWYgKCBjb25zb2xlICkge1xuICAgICAgY29uc29sZS5lcnJvciggJ0JhZCBlbGVtZW50IGZvciBGbGlja2l0eTogJyArICggcXVlcnlFbGVtZW50IHx8IGVsZW1lbnQgKSApO1xuICAgIH1cbiAgICByZXR1cm47XG4gIH1cbiAgdGhpcy5lbGVtZW50ID0gcXVlcnlFbGVtZW50O1xuICAvLyBkbyBub3QgaW5pdGlhbGl6ZSB0d2ljZSBvbiBzYW1lIGVsZW1lbnRcbiAgaWYgKCB0aGlzLmVsZW1lbnQuZmxpY2tpdHlHVUlEICkge1xuICAgIHZhciBpbnN0YW5jZSA9IGluc3RhbmNlc1sgdGhpcy5lbGVtZW50LmZsaWNraXR5R1VJRCBdO1xuICAgIGlmICggaW5zdGFuY2UgKSBpbnN0YW5jZS5vcHRpb24oIG9wdGlvbnMgKTtcbiAgICByZXR1cm4gaW5zdGFuY2U7XG4gIH1cblxuICAvLyBhZGQgalF1ZXJ5XG4gIGlmICggalF1ZXJ5ICkge1xuICAgIHRoaXMuJGVsZW1lbnQgPSBqUXVlcnkoIHRoaXMuZWxlbWVudCApO1xuICB9XG4gIC8vIG9wdGlvbnNcbiAgdGhpcy5vcHRpb25zID0gdXRpbHMuZXh0ZW5kKCB7fSwgdGhpcy5jb25zdHJ1Y3Rvci5kZWZhdWx0cyApO1xuICB0aGlzLm9wdGlvbiggb3B0aW9ucyApO1xuXG4gIC8vIGtpY2sgdGhpbmdzIG9mZlxuICB0aGlzLl9jcmVhdGUoKTtcbn1cblxuRmxpY2tpdHkuZGVmYXVsdHMgPSB7XG4gIGFjY2Vzc2liaWxpdHk6IHRydWUsXG4gIC8vIGFkYXB0aXZlSGVpZ2h0OiBmYWxzZSxcbiAgY2VsbEFsaWduOiAnY2VudGVyJyxcbiAgLy8gY2VsbFNlbGVjdG9yOiB1bmRlZmluZWQsXG4gIC8vIGNvbnRhaW46IGZhbHNlLFxuICBmcmVlU2Nyb2xsRnJpY3Rpb246IDAuMDc1LCAvLyBmcmljdGlvbiB3aGVuIGZyZWUtc2Nyb2xsaW5nXG4gIGZyaWN0aW9uOiAwLjI4LCAvLyBmcmljdGlvbiB3aGVuIHNlbGVjdGluZ1xuICBuYW1lc3BhY2VKUXVlcnlFdmVudHM6IHRydWUsXG4gIC8vIGluaXRpYWxJbmRleDogMCxcbiAgcGVyY2VudFBvc2l0aW9uOiB0cnVlLFxuICByZXNpemU6IHRydWUsXG4gIHNlbGVjdGVkQXR0cmFjdGlvbjogMC4wMjUsXG4gIHNldEdhbGxlcnlTaXplOiB0cnVlLFxuICAvLyB3YXRjaENTUzogZmFsc2UsXG4gIC8vIHdyYXBBcm91bmQ6IGZhbHNlXG59O1xuXG4vLyBoYXNoIG9mIG1ldGhvZHMgdHJpZ2dlcmVkIG9uIF9jcmVhdGUoKVxuRmxpY2tpdHkuY3JlYXRlTWV0aG9kcyA9IFtdO1xuXG52YXIgcHJvdG8gPSBGbGlja2l0eS5wcm90b3R5cGU7XG4vLyBpbmhlcml0IEV2ZW50RW1pdHRlclxudXRpbHMuZXh0ZW5kKCBwcm90bywgRXZFbWl0dGVyLnByb3RvdHlwZSApO1xuXG5wcm90by5fY3JlYXRlID0gZnVuY3Rpb24oKSB7XG4gIC8vIGFkZCBpZCBmb3IgRmxpY2tpdHkuZGF0YVxuICB2YXIgaWQgPSB0aGlzLmd1aWQgPSArK0dVSUQ7XG4gIHRoaXMuZWxlbWVudC5mbGlja2l0eUdVSUQgPSBpZDsgLy8gZXhwYW5kb1xuICBpbnN0YW5jZXNbIGlkIF0gPSB0aGlzOyAvLyBhc3NvY2lhdGUgdmlhIGlkXG4gIC8vIGluaXRpYWwgcHJvcGVydGllc1xuICB0aGlzLnNlbGVjdGVkSW5kZXggPSAwO1xuICAvLyBob3cgbWFueSBmcmFtZXMgc2xpZGVyIGhhcyBiZWVuIGluIHNhbWUgcG9zaXRpb25cbiAgdGhpcy5yZXN0aW5nRnJhbWVzID0gMDtcbiAgLy8gaW5pdGlhbCBwaHlzaWNzIHByb3BlcnRpZXNcbiAgdGhpcy54ID0gMDtcbiAgdGhpcy52ZWxvY2l0eSA9IDA7XG4gIHRoaXMub3JpZ2luU2lkZSA9IHRoaXMub3B0aW9ucy5yaWdodFRvTGVmdCA/ICdyaWdodCcgOiAnbGVmdCc7XG4gIC8vIGNyZWF0ZSB2aWV3cG9ydCAmIHNsaWRlclxuICB0aGlzLnZpZXdwb3J0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gIHRoaXMudmlld3BvcnQuY2xhc3NOYW1lID0gJ2ZsaWNraXR5LXZpZXdwb3J0JztcbiAgdGhpcy5fY3JlYXRlU2xpZGVyKCk7XG5cbiAgaWYgKCB0aGlzLm9wdGlvbnMucmVzaXplIHx8IHRoaXMub3B0aW9ucy53YXRjaENTUyApIHtcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lciggJ3Jlc2l6ZScsIHRoaXMgKTtcbiAgfVxuXG4gIC8vIGFkZCBsaXN0ZW5lcnMgZnJvbSBvbiBvcHRpb25cbiAgZm9yICggdmFyIGV2ZW50TmFtZSBpbiB0aGlzLm9wdGlvbnMub24gKSB7XG4gICAgdmFyIGxpc3RlbmVyID0gdGhpcy5vcHRpb25zLm9uWyBldmVudE5hbWUgXTtcbiAgICB0aGlzLm9uKCBldmVudE5hbWUsIGxpc3RlbmVyICk7XG4gIH1cblxuICBGbGlja2l0eS5jcmVhdGVNZXRob2RzLmZvckVhY2goIGZ1bmN0aW9uKCBtZXRob2QgKSB7XG4gICAgdGhpc1sgbWV0aG9kIF0oKTtcbiAgfSwgdGhpcyApO1xuXG4gIGlmICggdGhpcy5vcHRpb25zLndhdGNoQ1NTICkge1xuICAgIHRoaXMud2F0Y2hDU1MoKTtcbiAgfSBlbHNlIHtcbiAgICB0aGlzLmFjdGl2YXRlKCk7XG4gIH1cblxufTtcblxuLyoqXG4gKiBzZXQgb3B0aW9uc1xuICogQHBhcmFtIHtPYmplY3R9IG9wdHMgLSBvcHRpb25zIHRvIGV4dGVuZFxuICovXG5wcm90by5vcHRpb24gPSBmdW5jdGlvbiggb3B0cyApIHtcbiAgdXRpbHMuZXh0ZW5kKCB0aGlzLm9wdGlvbnMsIG9wdHMgKTtcbn07XG5cbnByb3RvLmFjdGl2YXRlID0gZnVuY3Rpb24oKSB7XG4gIGlmICggdGhpcy5pc0FjdGl2ZSApIHtcbiAgICByZXR1cm47XG4gIH1cbiAgdGhpcy5pc0FjdGl2ZSA9IHRydWU7XG4gIHRoaXMuZWxlbWVudC5jbGFzc0xpc3QuYWRkKCdmbGlja2l0eS1lbmFibGVkJyk7XG4gIGlmICggdGhpcy5vcHRpb25zLnJpZ2h0VG9MZWZ0ICkge1xuICAgIHRoaXMuZWxlbWVudC5jbGFzc0xpc3QuYWRkKCdmbGlja2l0eS1ydGwnKTtcbiAgfVxuXG4gIHRoaXMuZ2V0U2l6ZSgpO1xuICAvLyBtb3ZlIGluaXRpYWwgY2VsbCBlbGVtZW50cyBzbyB0aGV5IGNhbiBiZSBsb2FkZWQgYXMgY2VsbHNcbiAgdmFyIGNlbGxFbGVtcyA9IHRoaXMuX2ZpbHRlckZpbmRDZWxsRWxlbWVudHMoIHRoaXMuZWxlbWVudC5jaGlsZHJlbiApO1xuICBtb3ZlRWxlbWVudHMoIGNlbGxFbGVtcywgdGhpcy5zbGlkZXIgKTtcbiAgdGhpcy52aWV3cG9ydC5hcHBlbmRDaGlsZCggdGhpcy5zbGlkZXIgKTtcbiAgdGhpcy5lbGVtZW50LmFwcGVuZENoaWxkKCB0aGlzLnZpZXdwb3J0ICk7XG4gIC8vIGdldCBjZWxscyBmcm9tIGNoaWxkcmVuXG4gIHRoaXMucmVsb2FkQ2VsbHMoKTtcblxuICBpZiAoIHRoaXMub3B0aW9ucy5hY2Nlc3NpYmlsaXR5ICkge1xuICAgIC8vIGFsbG93IGVsZW1lbnQgdG8gZm9jdXNhYmxlXG4gICAgdGhpcy5lbGVtZW50LnRhYkluZGV4ID0gMDtcbiAgICAvLyBsaXN0ZW4gZm9yIGtleSBwcmVzc2VzXG4gICAgdGhpcy5lbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoICdrZXlkb3duJywgdGhpcyApO1xuICB9XG5cbiAgdGhpcy5lbWl0RXZlbnQoJ2FjdGl2YXRlJyk7XG4gIHRoaXMuc2VsZWN0SW5pdGlhbEluZGV4KCk7XG4gIC8vIGZsYWcgZm9yIGluaXRpYWwgYWN0aXZhdGlvbiwgZm9yIHVzaW5nIGluaXRpYWxJbmRleFxuICB0aGlzLmlzSW5pdEFjdGl2YXRlZCA9IHRydWU7XG4gIC8vIHJlYWR5IGV2ZW50LiAjNDkzXG4gIHRoaXMuZGlzcGF0Y2hFdmVudCgncmVhZHknKTtcbn07XG5cbi8vIHNsaWRlciBwb3NpdGlvbnMgdGhlIGNlbGxzXG5wcm90by5fY3JlYXRlU2xpZGVyID0gZnVuY3Rpb24oKSB7XG4gIC8vIHNsaWRlciBlbGVtZW50IGRvZXMgYWxsIHRoZSBwb3NpdGlvbmluZ1xuICB2YXIgc2xpZGVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gIHNsaWRlci5jbGFzc05hbWUgPSAnZmxpY2tpdHktc2xpZGVyJztcbiAgc2xpZGVyLnN0eWxlWyB0aGlzLm9yaWdpblNpZGUgXSA9IDA7XG4gIHRoaXMuc2xpZGVyID0gc2xpZGVyO1xufTtcblxucHJvdG8uX2ZpbHRlckZpbmRDZWxsRWxlbWVudHMgPSBmdW5jdGlvbiggZWxlbXMgKSB7XG4gIHJldHVybiB1dGlscy5maWx0ZXJGaW5kRWxlbWVudHMoIGVsZW1zLCB0aGlzLm9wdGlvbnMuY2VsbFNlbGVjdG9yICk7XG59O1xuXG4vLyBnb2VzIHRocm91Z2ggYWxsIGNoaWxkcmVuXG5wcm90by5yZWxvYWRDZWxscyA9IGZ1bmN0aW9uKCkge1xuICAvLyBjb2xsZWN0aW9uIG9mIGl0ZW0gZWxlbWVudHNcbiAgdGhpcy5jZWxscyA9IHRoaXMuX21ha2VDZWxscyggdGhpcy5zbGlkZXIuY2hpbGRyZW4gKTtcbiAgdGhpcy5wb3NpdGlvbkNlbGxzKCk7XG4gIHRoaXMuX2dldFdyYXBTaGlmdENlbGxzKCk7XG4gIHRoaXMuc2V0R2FsbGVyeVNpemUoKTtcbn07XG5cbi8qKlxuICogdHVybiBlbGVtZW50cyBpbnRvIEZsaWNraXR5LkNlbGxzXG4gKiBAcGFyYW0ge1tBcnJheSwgTm9kZUxpc3QsIEhUTUxFbGVtZW50XX0gZWxlbXMgLSBlbGVtZW50cyB0byBtYWtlIGludG8gY2VsbHNcbiAqIEByZXR1cm5zIHtBcnJheX0gaXRlbXMgLSBjb2xsZWN0aW9uIG9mIG5ldyBGbGlja2l0eSBDZWxsc1xuICovXG5wcm90by5fbWFrZUNlbGxzID0gZnVuY3Rpb24oIGVsZW1zICkge1xuICB2YXIgY2VsbEVsZW1zID0gdGhpcy5fZmlsdGVyRmluZENlbGxFbGVtZW50cyggZWxlbXMgKTtcblxuICAvLyBjcmVhdGUgbmV3IEZsaWNraXR5IGZvciBjb2xsZWN0aW9uXG4gIHZhciBjZWxscyA9IGNlbGxFbGVtcy5tYXAoIGZ1bmN0aW9uKCBjZWxsRWxlbSApIHtcbiAgICByZXR1cm4gbmV3IENlbGwoIGNlbGxFbGVtLCB0aGlzICk7XG4gIH0sIHRoaXMgKTtcblxuICByZXR1cm4gY2VsbHM7XG59O1xuXG5wcm90by5nZXRMYXN0Q2VsbCA9IGZ1bmN0aW9uKCkge1xuICByZXR1cm4gdGhpcy5jZWxsc1sgdGhpcy5jZWxscy5sZW5ndGggLSAxIF07XG59O1xuXG5wcm90by5nZXRMYXN0U2xpZGUgPSBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIHRoaXMuc2xpZGVzWyB0aGlzLnNsaWRlcy5sZW5ndGggLSAxIF07XG59O1xuXG4vLyBwb3NpdGlvbnMgYWxsIGNlbGxzXG5wcm90by5wb3NpdGlvbkNlbGxzID0gZnVuY3Rpb24oKSB7XG4gIC8vIHNpemUgYWxsIGNlbGxzXG4gIHRoaXMuX3NpemVDZWxscyggdGhpcy5jZWxscyApO1xuICAvLyBwb3NpdGlvbiBhbGwgY2VsbHNcbiAgdGhpcy5fcG9zaXRpb25DZWxscyggMCApO1xufTtcblxuLyoqXG4gKiBwb3NpdGlvbiBjZXJ0YWluIGNlbGxzXG4gKiBAcGFyYW0ge0ludGVnZXJ9IGluZGV4IC0gd2hpY2ggY2VsbCB0byBzdGFydCB3aXRoXG4gKi9cbnByb3RvLl9wb3NpdGlvbkNlbGxzID0gZnVuY3Rpb24oIGluZGV4ICkge1xuICBpbmRleCA9IGluZGV4IHx8IDA7XG4gIC8vIGFsc28gbWVhc3VyZSBtYXhDZWxsSGVpZ2h0XG4gIC8vIHN0YXJ0IDAgaWYgcG9zaXRpb25pbmcgYWxsIGNlbGxzXG4gIHRoaXMubWF4Q2VsbEhlaWdodCA9IGluZGV4ID8gdGhpcy5tYXhDZWxsSGVpZ2h0IHx8IDAgOiAwO1xuICB2YXIgY2VsbFggPSAwO1xuICAvLyBnZXQgY2VsbFhcbiAgaWYgKCBpbmRleCA+IDAgKSB7XG4gICAgdmFyIHN0YXJ0Q2VsbCA9IHRoaXMuY2VsbHNbIGluZGV4IC0gMSBdO1xuICAgIGNlbGxYID0gc3RhcnRDZWxsLnggKyBzdGFydENlbGwuc2l6ZS5vdXRlcldpZHRoO1xuICB9XG4gIHZhciBsZW4gPSB0aGlzLmNlbGxzLmxlbmd0aDtcbiAgZm9yICggdmFyIGkgPSBpbmRleDsgaSA8IGxlbjsgaSsrICkge1xuICAgIHZhciBjZWxsID0gdGhpcy5jZWxsc1tpXTtcbiAgICBjZWxsLnNldFBvc2l0aW9uKCBjZWxsWCApO1xuICAgIGNlbGxYICs9IGNlbGwuc2l6ZS5vdXRlcldpZHRoO1xuICAgIHRoaXMubWF4Q2VsbEhlaWdodCA9IE1hdGgubWF4KCBjZWxsLnNpemUub3V0ZXJIZWlnaHQsIHRoaXMubWF4Q2VsbEhlaWdodCApO1xuICB9XG4gIC8vIGtlZXAgdHJhY2sgb2YgY2VsbFggZm9yIHdyYXAtYXJvdW5kXG4gIHRoaXMuc2xpZGVhYmxlV2lkdGggPSBjZWxsWDtcbiAgLy8gc2xpZGVzXG4gIHRoaXMudXBkYXRlU2xpZGVzKCk7XG4gIC8vIGNvbnRhaW4gc2xpZGVzIHRhcmdldFxuICB0aGlzLl9jb250YWluU2xpZGVzKCk7XG4gIC8vIHVwZGF0ZSBzbGlkZXNXaWR0aFxuICB0aGlzLnNsaWRlc1dpZHRoID0gbGVuID8gdGhpcy5nZXRMYXN0U2xpZGUoKS50YXJnZXQgLSB0aGlzLnNsaWRlc1swXS50YXJnZXQgOiAwO1xufTtcblxuLyoqXG4gKiBjZWxsLmdldFNpemUoKSBvbiBtdWx0aXBsZSBjZWxsc1xuICogQHBhcmFtIHtBcnJheX0gY2VsbHMgLSBjZWxscyB0byBzaXplXG4gKi9cbnByb3RvLl9zaXplQ2VsbHMgPSBmdW5jdGlvbiggY2VsbHMgKSB7XG4gIGNlbGxzLmZvckVhY2goIGZ1bmN0aW9uKCBjZWxsICkge1xuICAgIGNlbGwuZ2V0U2l6ZSgpO1xuICB9ICk7XG59O1xuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSAgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gLy9cblxucHJvdG8udXBkYXRlU2xpZGVzID0gZnVuY3Rpb24oKSB7XG4gIHRoaXMuc2xpZGVzID0gW107XG4gIGlmICggIXRoaXMuY2VsbHMubGVuZ3RoICkge1xuICAgIHJldHVybjtcbiAgfVxuXG4gIHZhciBzbGlkZSA9IG5ldyBTbGlkZSggdGhpcyApO1xuICB0aGlzLnNsaWRlcy5wdXNoKCBzbGlkZSApO1xuICB2YXIgaXNPcmlnaW5MZWZ0ID0gdGhpcy5vcmlnaW5TaWRlID09ICdsZWZ0JztcbiAgdmFyIG5leHRNYXJnaW4gPSBpc09yaWdpbkxlZnQgPyAnbWFyZ2luUmlnaHQnIDogJ21hcmdpbkxlZnQnO1xuXG4gIHZhciBjYW5DZWxsRml0ID0gdGhpcy5fZ2V0Q2FuQ2VsbEZpdCgpO1xuXG4gIHRoaXMuY2VsbHMuZm9yRWFjaCggZnVuY3Rpb24oIGNlbGwsIGkgKSB7XG4gICAgLy8ganVzdCBhZGQgY2VsbCBpZiBmaXJzdCBjZWxsIGluIHNsaWRlXG4gICAgaWYgKCAhc2xpZGUuY2VsbHMubGVuZ3RoICkge1xuICAgICAgc2xpZGUuYWRkQ2VsbCggY2VsbCApO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHZhciBzbGlkZVdpZHRoID0gKCBzbGlkZS5vdXRlcldpZHRoIC0gc2xpZGUuZmlyc3RNYXJnaW4gKSArXG4gICAgICAoIGNlbGwuc2l6ZS5vdXRlcldpZHRoIC0gY2VsbC5zaXplWyBuZXh0TWFyZ2luIF0gKTtcblxuICAgIGlmICggY2FuQ2VsbEZpdC5jYWxsKCB0aGlzLCBpLCBzbGlkZVdpZHRoICkgKSB7XG4gICAgICBzbGlkZS5hZGRDZWxsKCBjZWxsICk7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIGRvZXNuJ3QgZml0LCBuZXcgc2xpZGVcbiAgICAgIHNsaWRlLnVwZGF0ZVRhcmdldCgpO1xuXG4gICAgICBzbGlkZSA9IG5ldyBTbGlkZSggdGhpcyApO1xuICAgICAgdGhpcy5zbGlkZXMucHVzaCggc2xpZGUgKTtcbiAgICAgIHNsaWRlLmFkZENlbGwoIGNlbGwgKTtcbiAgICB9XG4gIH0sIHRoaXMgKTtcbiAgLy8gbGFzdCBzbGlkZVxuICBzbGlkZS51cGRhdGVUYXJnZXQoKTtcbiAgLy8gdXBkYXRlIC5zZWxlY3RlZFNsaWRlXG4gIHRoaXMudXBkYXRlU2VsZWN0ZWRTbGlkZSgpO1xufTtcblxucHJvdG8uX2dldENhbkNlbGxGaXQgPSBmdW5jdGlvbigpIHtcbiAgdmFyIGdyb3VwQ2VsbHMgPSB0aGlzLm9wdGlvbnMuZ3JvdXBDZWxscztcbiAgaWYgKCAhZ3JvdXBDZWxscyApIHtcbiAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfTtcbiAgfSBlbHNlIGlmICggdHlwZW9mIGdyb3VwQ2VsbHMgPT0gJ251bWJlcicgKSB7XG4gICAgLy8gZ3JvdXAgYnkgbnVtYmVyLiAzIC0+IFswLDEsMl0sIFszLDQsNV0sIC4uLlxuICAgIHZhciBudW1iZXIgPSBwYXJzZUludCggZ3JvdXBDZWxscywgMTAgKTtcbiAgICByZXR1cm4gZnVuY3Rpb24oIGkgKSB7XG4gICAgICByZXR1cm4gKCBpICUgbnVtYmVyICkgIT09IDA7XG4gICAgfTtcbiAgfVxuICAvLyBkZWZhdWx0LCBncm91cCBieSB3aWR0aCBvZiBzbGlkZVxuICAvLyBwYXJzZSAnNzUlXG4gIHZhciBwZXJjZW50TWF0Y2ggPSB0eXBlb2YgZ3JvdXBDZWxscyA9PSAnc3RyaW5nJyAmJlxuICAgIGdyb3VwQ2VsbHMubWF0Y2goIC9eKFxcZCspJSQvICk7XG4gIHZhciBwZXJjZW50ID0gcGVyY2VudE1hdGNoID8gcGFyc2VJbnQoIHBlcmNlbnRNYXRjaFsxXSwgMTAgKSAvIDEwMCA6IDE7XG4gIHJldHVybiBmdW5jdGlvbiggaSwgc2xpZGVXaWR0aCApIHtcbiAgICAvKiBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8taW52YWxpZC10aGlzICovXG4gICAgcmV0dXJuIHNsaWRlV2lkdGggPD0gKCB0aGlzLnNpemUuaW5uZXJXaWR0aCArIDEgKSAqIHBlcmNlbnQ7XG4gIH07XG59O1xuXG4vLyBhbGlhcyBfaW5pdCBmb3IgalF1ZXJ5IHBsdWdpbiAuZmxpY2tpdHkoKVxucHJvdG8uX2luaXQgPVxucHJvdG8ucmVwb3NpdGlvbiA9IGZ1bmN0aW9uKCkge1xuICB0aGlzLnBvc2l0aW9uQ2VsbHMoKTtcbiAgdGhpcy5wb3NpdGlvblNsaWRlckF0U2VsZWN0ZWQoKTtcbn07XG5cbnByb3RvLmdldFNpemUgPSBmdW5jdGlvbigpIHtcbiAgdGhpcy5zaXplID0gZ2V0U2l6ZSggdGhpcy5lbGVtZW50ICk7XG4gIHRoaXMuc2V0Q2VsbEFsaWduKCk7XG4gIHRoaXMuY3Vyc29yUG9zaXRpb24gPSB0aGlzLnNpemUuaW5uZXJXaWR0aCAqIHRoaXMuY2VsbEFsaWduO1xufTtcblxudmFyIGNlbGxBbGlnblNob3J0aGFuZHMgPSB7XG4gIC8vIGNlbGwgYWxpZ24sIHRoZW4gYmFzZWQgb24gb3JpZ2luIHNpZGVcbiAgY2VudGVyOiB7XG4gICAgbGVmdDogMC41LFxuICAgIHJpZ2h0OiAwLjUsXG4gIH0sXG4gIGxlZnQ6IHtcbiAgICBsZWZ0OiAwLFxuICAgIHJpZ2h0OiAxLFxuICB9LFxuICByaWdodDoge1xuICAgIHJpZ2h0OiAwLFxuICAgIGxlZnQ6IDEsXG4gIH0sXG59O1xuXG5wcm90by5zZXRDZWxsQWxpZ24gPSBmdW5jdGlvbigpIHtcbiAgdmFyIHNob3J0aGFuZCA9IGNlbGxBbGlnblNob3J0aGFuZHNbIHRoaXMub3B0aW9ucy5jZWxsQWxpZ24gXTtcbiAgdGhpcy5jZWxsQWxpZ24gPSBzaG9ydGhhbmQgPyBzaG9ydGhhbmRbIHRoaXMub3JpZ2luU2lkZSBdIDogdGhpcy5vcHRpb25zLmNlbGxBbGlnbjtcbn07XG5cbnByb3RvLnNldEdhbGxlcnlTaXplID0gZnVuY3Rpb24oKSB7XG4gIGlmICggdGhpcy5vcHRpb25zLnNldEdhbGxlcnlTaXplICkge1xuICAgIHZhciBoZWlnaHQgPSB0aGlzLm9wdGlvbnMuYWRhcHRpdmVIZWlnaHQgJiYgdGhpcy5zZWxlY3RlZFNsaWRlID9cbiAgICAgIHRoaXMuc2VsZWN0ZWRTbGlkZS5oZWlnaHQgOiB0aGlzLm1heENlbGxIZWlnaHQ7XG4gICAgdGhpcy52aWV3cG9ydC5zdHlsZS5oZWlnaHQgPSBoZWlnaHQgKyAncHgnO1xuICB9XG59O1xuXG5wcm90by5fZ2V0V3JhcFNoaWZ0Q2VsbHMgPSBmdW5jdGlvbigpIHtcbiAgLy8gb25seSBmb3Igd3JhcC1hcm91bmRcbiAgaWYgKCAhdGhpcy5vcHRpb25zLndyYXBBcm91bmQgKSB7XG4gICAgcmV0dXJuO1xuICB9XG4gIC8vIHVuc2hpZnQgcHJldmlvdXMgY2VsbHNcbiAgdGhpcy5fdW5zaGlmdENlbGxzKCB0aGlzLmJlZm9yZVNoaWZ0Q2VsbHMgKTtcbiAgdGhpcy5fdW5zaGlmdENlbGxzKCB0aGlzLmFmdGVyU2hpZnRDZWxscyApO1xuICAvLyBnZXQgYmVmb3JlIGNlbGxzXG4gIC8vIGluaXRpYWwgZ2FwXG4gIHZhciBnYXBYID0gdGhpcy5jdXJzb3JQb3NpdGlvbjtcbiAgdmFyIGNlbGxJbmRleCA9IHRoaXMuY2VsbHMubGVuZ3RoIC0gMTtcbiAgdGhpcy5iZWZvcmVTaGlmdENlbGxzID0gdGhpcy5fZ2V0R2FwQ2VsbHMoIGdhcFgsIGNlbGxJbmRleCwgLTEgKTtcbiAgLy8gZ2V0IGFmdGVyIGNlbGxzXG4gIC8vIGVuZGluZyBnYXAgYmV0d2VlbiBsYXN0IGNlbGwgYW5kIGVuZCBvZiBnYWxsZXJ5IHZpZXdwb3J0XG4gIGdhcFggPSB0aGlzLnNpemUuaW5uZXJXaWR0aCAtIHRoaXMuY3Vyc29yUG9zaXRpb247XG4gIC8vIHN0YXJ0IGNsb25pbmcgYXQgZmlyc3QgY2VsbCwgd29ya2luZyBmb3J3YXJkc1xuICB0aGlzLmFmdGVyU2hpZnRDZWxscyA9IHRoaXMuX2dldEdhcENlbGxzKCBnYXBYLCAwLCAxICk7XG59O1xuXG5wcm90by5fZ2V0R2FwQ2VsbHMgPSBmdW5jdGlvbiggZ2FwWCwgY2VsbEluZGV4LCBpbmNyZW1lbnQgKSB7XG4gIC8vIGtlZXAgYWRkaW5nIGNlbGxzIHVudGlsIHRoZSBjb3ZlciB0aGUgaW5pdGlhbCBnYXBcbiAgdmFyIGNlbGxzID0gW107XG4gIHdoaWxlICggZ2FwWCA+IDAgKSB7XG4gICAgdmFyIGNlbGwgPSB0aGlzLmNlbGxzWyBjZWxsSW5kZXggXTtcbiAgICBpZiAoICFjZWxsICkge1xuICAgICAgYnJlYWs7XG4gICAgfVxuICAgIGNlbGxzLnB1c2goIGNlbGwgKTtcbiAgICBjZWxsSW5kZXggKz0gaW5jcmVtZW50O1xuICAgIGdhcFggLT0gY2VsbC5zaXplLm91dGVyV2lkdGg7XG4gIH1cbiAgcmV0dXJuIGNlbGxzO1xufTtcblxuLy8gLS0tLS0gY29udGFpbiAtLS0tLSAvL1xuXG4vLyBjb250YWluIGNlbGwgdGFyZ2V0cyBzbyBubyBleGNlc3Mgc2xpZGluZ1xucHJvdG8uX2NvbnRhaW5TbGlkZXMgPSBmdW5jdGlvbigpIHtcbiAgaWYgKCAhdGhpcy5vcHRpb25zLmNvbnRhaW4gfHwgdGhpcy5vcHRpb25zLndyYXBBcm91bmQgfHwgIXRoaXMuY2VsbHMubGVuZ3RoICkge1xuICAgIHJldHVybjtcbiAgfVxuICB2YXIgaXNSaWdodFRvTGVmdCA9IHRoaXMub3B0aW9ucy5yaWdodFRvTGVmdDtcbiAgdmFyIGJlZ2luTWFyZ2luID0gaXNSaWdodFRvTGVmdCA/ICdtYXJnaW5SaWdodCcgOiAnbWFyZ2luTGVmdCc7XG4gIHZhciBlbmRNYXJnaW4gPSBpc1JpZ2h0VG9MZWZ0ID8gJ21hcmdpbkxlZnQnIDogJ21hcmdpblJpZ2h0JztcbiAgdmFyIGNvbnRlbnRXaWR0aCA9IHRoaXMuc2xpZGVhYmxlV2lkdGggLSB0aGlzLmdldExhc3RDZWxsKCkuc2l6ZVsgZW5kTWFyZ2luIF07XG4gIC8vIGNvbnRlbnQgaXMgbGVzcyB0aGFuIGdhbGxlcnkgc2l6ZVxuICB2YXIgaXNDb250ZW50U21hbGxlciA9IGNvbnRlbnRXaWR0aCA8IHRoaXMuc2l6ZS5pbm5lcldpZHRoO1xuICAvLyBib3VuZHNcbiAgdmFyIGJlZ2luQm91bmQgPSB0aGlzLmN1cnNvclBvc2l0aW9uICsgdGhpcy5jZWxsc1swXS5zaXplWyBiZWdpbk1hcmdpbiBdO1xuICB2YXIgZW5kQm91bmQgPSBjb250ZW50V2lkdGggLSB0aGlzLnNpemUuaW5uZXJXaWR0aCAqICggMSAtIHRoaXMuY2VsbEFsaWduICk7XG4gIC8vIGNvbnRhaW4gZWFjaCBjZWxsIHRhcmdldFxuICB0aGlzLnNsaWRlcy5mb3JFYWNoKCBmdW5jdGlvbiggc2xpZGUgKSB7XG4gICAgaWYgKCBpc0NvbnRlbnRTbWFsbGVyICkge1xuICAgICAgLy8gYWxsIGNlbGxzIGZpdCBpbnNpZGUgZ2FsbGVyeVxuICAgICAgc2xpZGUudGFyZ2V0ID0gY29udGVudFdpZHRoICogdGhpcy5jZWxsQWxpZ247XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIGNvbnRhaW4gdG8gYm91bmRzXG4gICAgICBzbGlkZS50YXJnZXQgPSBNYXRoLm1heCggc2xpZGUudGFyZ2V0LCBiZWdpbkJvdW5kICk7XG4gICAgICBzbGlkZS50YXJnZXQgPSBNYXRoLm1pbiggc2xpZGUudGFyZ2V0LCBlbmRCb3VuZCApO1xuICAgIH1cbiAgfSwgdGhpcyApO1xufTtcblxuLy8gLS0tLS0gIC0tLS0tIC8vXG5cbi8qKlxuICogZW1pdHMgZXZlbnRzIHZpYSBldmVudEVtaXR0ZXIgYW5kIGpRdWVyeSBldmVudHNcbiAqIEBwYXJhbSB7U3RyaW5nfSB0eXBlIC0gbmFtZSBvZiBldmVudFxuICogQHBhcmFtIHtFdmVudH0gZXZlbnQgLSBvcmlnaW5hbCBldmVudFxuICogQHBhcmFtIHtBcnJheX0gYXJncyAtIGV4dHJhIGFyZ3VtZW50c1xuICovXG5wcm90by5kaXNwYXRjaEV2ZW50ID0gZnVuY3Rpb24oIHR5cGUsIGV2ZW50LCBhcmdzICkge1xuICB2YXIgZW1pdEFyZ3MgPSBldmVudCA/IFsgZXZlbnQgXS5jb25jYXQoIGFyZ3MgKSA6IGFyZ3M7XG4gIHRoaXMuZW1pdEV2ZW50KCB0eXBlLCBlbWl0QXJncyApO1xuXG4gIGlmICggalF1ZXJ5ICYmIHRoaXMuJGVsZW1lbnQgKSB7XG4gICAgLy8gZGVmYXVsdCB0cmlnZ2VyIHdpdGggdHlwZSBpZiBubyBldmVudFxuICAgIHR5cGUgKz0gdGhpcy5vcHRpb25zLm5hbWVzcGFjZUpRdWVyeUV2ZW50cyA/ICcuZmxpY2tpdHknIDogJyc7XG4gICAgdmFyICRldmVudCA9IHR5cGU7XG4gICAgaWYgKCBldmVudCApIHtcbiAgICAgIC8vIGNyZWF0ZSBqUXVlcnkgZXZlbnRcbiAgICAgIHZhciBqUUV2ZW50ID0gbmV3IGpRdWVyeS5FdmVudCggZXZlbnQgKTtcbiAgICAgIGpRRXZlbnQudHlwZSA9IHR5cGU7XG4gICAgICAkZXZlbnQgPSBqUUV2ZW50O1xuICAgIH1cbiAgICB0aGlzLiRlbGVtZW50LnRyaWdnZXIoICRldmVudCwgYXJncyApO1xuICB9XG59O1xuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSBzZWxlY3QgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gLy9cblxuLyoqXG4gKiBAcGFyYW0ge0ludGVnZXJ9IGluZGV4IC0gaW5kZXggb2YgdGhlIHNsaWRlXG4gKiBAcGFyYW0ge0Jvb2xlYW59IGlzV3JhcCAtIHdpbGwgd3JhcC1hcm91bmQgdG8gbGFzdC9maXJzdCBpZiBhdCB0aGUgZW5kXG4gKiBAcGFyYW0ge0Jvb2xlYW59IGlzSW5zdGFudCAtIHdpbGwgaW1tZWRpYXRlbHkgc2V0IHBvc2l0aW9uIGF0IHNlbGVjdGVkIGNlbGxcbiAqL1xucHJvdG8uc2VsZWN0ID0gZnVuY3Rpb24oIGluZGV4LCBpc1dyYXAsIGlzSW5zdGFudCApIHtcbiAgaWYgKCAhdGhpcy5pc0FjdGl2ZSApIHtcbiAgICByZXR1cm47XG4gIH1cbiAgaW5kZXggPSBwYXJzZUludCggaW5kZXgsIDEwICk7XG4gIHRoaXMuX3dyYXBTZWxlY3QoIGluZGV4ICk7XG5cbiAgaWYgKCB0aGlzLm9wdGlvbnMud3JhcEFyb3VuZCB8fCBpc1dyYXAgKSB7XG4gICAgaW5kZXggPSB1dGlscy5tb2R1bG8oIGluZGV4LCB0aGlzLnNsaWRlcy5sZW5ndGggKTtcbiAgfVxuICAvLyBiYWlsIGlmIGludmFsaWQgaW5kZXhcbiAgaWYgKCAhdGhpcy5zbGlkZXNbIGluZGV4IF0gKSB7XG4gICAgcmV0dXJuO1xuICB9XG4gIHZhciBwcmV2SW5kZXggPSB0aGlzLnNlbGVjdGVkSW5kZXg7XG4gIHRoaXMuc2VsZWN0ZWRJbmRleCA9IGluZGV4O1xuICB0aGlzLnVwZGF0ZVNlbGVjdGVkU2xpZGUoKTtcbiAgaWYgKCBpc0luc3RhbnQgKSB7XG4gICAgdGhpcy5wb3NpdGlvblNsaWRlckF0U2VsZWN0ZWQoKTtcbiAgfSBlbHNlIHtcbiAgICB0aGlzLnN0YXJ0QW5pbWF0aW9uKCk7XG4gIH1cbiAgaWYgKCB0aGlzLm9wdGlvbnMuYWRhcHRpdmVIZWlnaHQgKSB7XG4gICAgdGhpcy5zZXRHYWxsZXJ5U2l6ZSgpO1xuICB9XG4gIC8vIGV2ZW50c1xuICB0aGlzLmRpc3BhdGNoRXZlbnQoICdzZWxlY3QnLCBudWxsLCBbIGluZGV4IF0gKTtcbiAgLy8gY2hhbmdlIGV2ZW50IGlmIG5ldyBpbmRleFxuICBpZiAoIGluZGV4ICE9IHByZXZJbmRleCApIHtcbiAgICB0aGlzLmRpc3BhdGNoRXZlbnQoICdjaGFuZ2UnLCBudWxsLCBbIGluZGV4IF0gKTtcbiAgfVxuICAvLyBvbGQgdjEgZXZlbnQgbmFtZSwgcmVtb3ZlIGluIHYzXG4gIHRoaXMuZGlzcGF0Y2hFdmVudCgnY2VsbFNlbGVjdCcpO1xufTtcblxuLy8gd3JhcHMgcG9zaXRpb24gZm9yIHdyYXBBcm91bmQsIHRvIG1vdmUgdG8gY2xvc2VzdCBzbGlkZS4gIzExM1xucHJvdG8uX3dyYXBTZWxlY3QgPSBmdW5jdGlvbiggaW5kZXggKSB7XG4gIHZhciBsZW4gPSB0aGlzLnNsaWRlcy5sZW5ndGg7XG4gIHZhciBpc1dyYXBwaW5nID0gdGhpcy5vcHRpb25zLndyYXBBcm91bmQgJiYgbGVuID4gMTtcbiAgaWYgKCAhaXNXcmFwcGluZyApIHtcbiAgICByZXR1cm4gaW5kZXg7XG4gIH1cbiAgdmFyIHdyYXBJbmRleCA9IHV0aWxzLm1vZHVsbyggaW5kZXgsIGxlbiApO1xuICAvLyBnbyB0byBzaG9ydGVzdFxuICB2YXIgZGVsdGEgPSBNYXRoLmFicyggd3JhcEluZGV4IC0gdGhpcy5zZWxlY3RlZEluZGV4ICk7XG4gIHZhciBiYWNrV3JhcERlbHRhID0gTWF0aC5hYnMoICggd3JhcEluZGV4ICsgbGVuICkgLSB0aGlzLnNlbGVjdGVkSW5kZXggKTtcbiAgdmFyIGZvcmV3YXJkV3JhcERlbHRhID0gTWF0aC5hYnMoICggd3JhcEluZGV4IC0gbGVuICkgLSB0aGlzLnNlbGVjdGVkSW5kZXggKTtcbiAgaWYgKCAhdGhpcy5pc0RyYWdTZWxlY3QgJiYgYmFja1dyYXBEZWx0YSA8IGRlbHRhICkge1xuICAgIGluZGV4ICs9IGxlbjtcbiAgfSBlbHNlIGlmICggIXRoaXMuaXNEcmFnU2VsZWN0ICYmIGZvcmV3YXJkV3JhcERlbHRhIDwgZGVsdGEgKSB7XG4gICAgaW5kZXggLT0gbGVuO1xuICB9XG4gIC8vIHdyYXAgcG9zaXRpb24gc28gc2xpZGVyIGlzIHdpdGhpbiBub3JtYWwgYXJlYVxuICBpZiAoIGluZGV4IDwgMCApIHtcbiAgICB0aGlzLnggLT0gdGhpcy5zbGlkZWFibGVXaWR0aDtcbiAgfSBlbHNlIGlmICggaW5kZXggPj0gbGVuICkge1xuICAgIHRoaXMueCArPSB0aGlzLnNsaWRlYWJsZVdpZHRoO1xuICB9XG59O1xuXG5wcm90by5wcmV2aW91cyA9IGZ1bmN0aW9uKCBpc1dyYXAsIGlzSW5zdGFudCApIHtcbiAgdGhpcy5zZWxlY3QoIHRoaXMuc2VsZWN0ZWRJbmRleCAtIDEsIGlzV3JhcCwgaXNJbnN0YW50ICk7XG59O1xuXG5wcm90by5uZXh0ID0gZnVuY3Rpb24oIGlzV3JhcCwgaXNJbnN0YW50ICkge1xuICB0aGlzLnNlbGVjdCggdGhpcy5zZWxlY3RlZEluZGV4ICsgMSwgaXNXcmFwLCBpc0luc3RhbnQgKTtcbn07XG5cbnByb3RvLnVwZGF0ZVNlbGVjdGVkU2xpZGUgPSBmdW5jdGlvbigpIHtcbiAgdmFyIHNsaWRlID0gdGhpcy5zbGlkZXNbIHRoaXMuc2VsZWN0ZWRJbmRleCBdO1xuICAvLyBzZWxlY3RlZEluZGV4IGNvdWxkIGJlIG91dHNpZGUgb2Ygc2xpZGVzLCBpZiB0cmlnZ2VyZWQgYmVmb3JlIHJlc2l6ZSgpXG4gIGlmICggIXNsaWRlICkge1xuICAgIHJldHVybjtcbiAgfVxuICAvLyB1bnNlbGVjdCBwcmV2aW91cyBzZWxlY3RlZCBzbGlkZVxuICB0aGlzLnVuc2VsZWN0U2VsZWN0ZWRTbGlkZSgpO1xuICAvLyB1cGRhdGUgbmV3IHNlbGVjdGVkIHNsaWRlXG4gIHRoaXMuc2VsZWN0ZWRTbGlkZSA9IHNsaWRlO1xuICBzbGlkZS5zZWxlY3QoKTtcbiAgdGhpcy5zZWxlY3RlZENlbGxzID0gc2xpZGUuY2VsbHM7XG4gIHRoaXMuc2VsZWN0ZWRFbGVtZW50cyA9IHNsaWRlLmdldENlbGxFbGVtZW50cygpO1xuICAvLyBIQUNLOiBzZWxlY3RlZENlbGwgJiBzZWxlY3RlZEVsZW1lbnQgaXMgZmlyc3QgY2VsbCBpbiBzbGlkZSwgYmFja3dhcmRzIGNvbXBhdGliaWxpdHlcbiAgLy8gUmVtb3ZlIGluIHYzP1xuICB0aGlzLnNlbGVjdGVkQ2VsbCA9IHNsaWRlLmNlbGxzWzBdO1xuICB0aGlzLnNlbGVjdGVkRWxlbWVudCA9IHRoaXMuc2VsZWN0ZWRFbGVtZW50c1swXTtcbn07XG5cbnByb3RvLnVuc2VsZWN0U2VsZWN0ZWRTbGlkZSA9IGZ1bmN0aW9uKCkge1xuICBpZiAoIHRoaXMuc2VsZWN0ZWRTbGlkZSApIHtcbiAgICB0aGlzLnNlbGVjdGVkU2xpZGUudW5zZWxlY3QoKTtcbiAgfVxufTtcblxucHJvdG8uc2VsZWN0SW5pdGlhbEluZGV4ID0gZnVuY3Rpb24oKSB7XG4gIHZhciBpbml0aWFsSW5kZXggPSB0aGlzLm9wdGlvbnMuaW5pdGlhbEluZGV4O1xuICAvLyBhbHJlYWR5IGFjdGl2YXRlZCwgc2VsZWN0IHByZXZpb3VzIHNlbGVjdGVkSW5kZXhcbiAgaWYgKCB0aGlzLmlzSW5pdEFjdGl2YXRlZCApIHtcbiAgICB0aGlzLnNlbGVjdCggdGhpcy5zZWxlY3RlZEluZGV4LCBmYWxzZSwgdHJ1ZSApO1xuICAgIHJldHVybjtcbiAgfVxuICAvLyBzZWxlY3Qgd2l0aCBzZWxlY3RvciBzdHJpbmdcbiAgaWYgKCBpbml0aWFsSW5kZXggJiYgdHlwZW9mIGluaXRpYWxJbmRleCA9PSAnc3RyaW5nJyApIHtcbiAgICB2YXIgY2VsbCA9IHRoaXMucXVlcnlDZWxsKCBpbml0aWFsSW5kZXggKTtcbiAgICBpZiAoIGNlbGwgKSB7XG4gICAgICB0aGlzLnNlbGVjdENlbGwoIGluaXRpYWxJbmRleCwgZmFsc2UsIHRydWUgKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gIH1cblxuICB2YXIgaW5kZXggPSAwO1xuICAvLyBzZWxlY3Qgd2l0aCBudW1iZXJcbiAgaWYgKCBpbml0aWFsSW5kZXggJiYgdGhpcy5zbGlkZXNbIGluaXRpYWxJbmRleCBdICkge1xuICAgIGluZGV4ID0gaW5pdGlhbEluZGV4O1xuICB9XG4gIC8vIHNlbGVjdCBpbnN0YW50bHlcbiAgdGhpcy5zZWxlY3QoIGluZGV4LCBmYWxzZSwgdHJ1ZSApO1xufTtcblxuLyoqXG4gKiBzZWxlY3Qgc2xpZGUgZnJvbSBudW1iZXIgb3IgY2VsbCBlbGVtZW50XG4gKiBAcGFyYW0ge1tFbGVtZW50LCBOdW1iZXJdfSB2YWx1ZSAtIHplcm8tYmFzZWQgaW5kZXggb3IgZWxlbWVudCB0byBzZWxlY3RcbiAqIEBwYXJhbSB7Qm9vbGVhbn0gaXNXcmFwIC0gZW5hYmxlcyB3cmFwcGluZyBhcm91bmQgZm9yIGV4dHJhIGluZGV4XG4gKiBAcGFyYW0ge0Jvb2xlYW59IGlzSW5zdGFudCAtIGRpc2FibGVzIHNsaWRlIGFuaW1hdGlvblxuICovXG5wcm90by5zZWxlY3RDZWxsID0gZnVuY3Rpb24oIHZhbHVlLCBpc1dyYXAsIGlzSW5zdGFudCApIHtcbiAgLy8gZ2V0IGNlbGxcbiAgdmFyIGNlbGwgPSB0aGlzLnF1ZXJ5Q2VsbCggdmFsdWUgKTtcbiAgaWYgKCAhY2VsbCApIHtcbiAgICByZXR1cm47XG4gIH1cblxuICB2YXIgaW5kZXggPSB0aGlzLmdldENlbGxTbGlkZUluZGV4KCBjZWxsICk7XG4gIHRoaXMuc2VsZWN0KCBpbmRleCwgaXNXcmFwLCBpc0luc3RhbnQgKTtcbn07XG5cbnByb3RvLmdldENlbGxTbGlkZUluZGV4ID0gZnVuY3Rpb24oIGNlbGwgKSB7XG4gIC8vIGdldCBpbmRleCBvZiBzbGlkZXMgdGhhdCBoYXMgY2VsbFxuICBmb3IgKCB2YXIgaSA9IDA7IGkgPCB0aGlzLnNsaWRlcy5sZW5ndGg7IGkrKyApIHtcbiAgICB2YXIgc2xpZGUgPSB0aGlzLnNsaWRlc1tpXTtcbiAgICB2YXIgaW5kZXggPSBzbGlkZS5jZWxscy5pbmRleE9mKCBjZWxsICk7XG4gICAgaWYgKCBpbmRleCAhPSAtMSApIHtcbiAgICAgIHJldHVybiBpO1xuICAgIH1cbiAgfVxufTtcblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gZ2V0IGNlbGxzIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIC8vXG5cbi8qKlxuICogZ2V0IEZsaWNraXR5LkNlbGwsIGdpdmVuIGFuIEVsZW1lbnRcbiAqIEBwYXJhbSB7RWxlbWVudH0gZWxlbSAtIG1hdGNoaW5nIGNlbGwgZWxlbWVudFxuICogQHJldHVybnMge0ZsaWNraXR5LkNlbGx9IGNlbGwgLSBtYXRjaGluZyBjZWxsXG4gKi9cbnByb3RvLmdldENlbGwgPSBmdW5jdGlvbiggZWxlbSApIHtcbiAgLy8gbG9vcCB0aHJvdWdoIGNlbGxzIHRvIGdldCB0aGUgb25lIHRoYXQgbWF0Y2hlc1xuICBmb3IgKCB2YXIgaSA9IDA7IGkgPCB0aGlzLmNlbGxzLmxlbmd0aDsgaSsrICkge1xuICAgIHZhciBjZWxsID0gdGhpcy5jZWxsc1tpXTtcbiAgICBpZiAoIGNlbGwuZWxlbWVudCA9PSBlbGVtICkge1xuICAgICAgcmV0dXJuIGNlbGw7XG4gICAgfVxuICB9XG59O1xuXG4vKipcbiAqIGdldCBjb2xsZWN0aW9uIG9mIEZsaWNraXR5LkNlbGxzLCBnaXZlbiBFbGVtZW50c1xuICogQHBhcmFtIHtbRWxlbWVudCwgQXJyYXksIE5vZGVMaXN0XX0gZWxlbXMgLSBtdWx0aXBsZSBlbGVtZW50c1xuICogQHJldHVybnMge0FycmF5fSBjZWxscyAtIEZsaWNraXR5LkNlbGxzXG4gKi9cbnByb3RvLmdldENlbGxzID0gZnVuY3Rpb24oIGVsZW1zICkge1xuICBlbGVtcyA9IHV0aWxzLm1ha2VBcnJheSggZWxlbXMgKTtcbiAgdmFyIGNlbGxzID0gW107XG4gIGVsZW1zLmZvckVhY2goIGZ1bmN0aW9uKCBlbGVtICkge1xuICAgIHZhciBjZWxsID0gdGhpcy5nZXRDZWxsKCBlbGVtICk7XG4gICAgaWYgKCBjZWxsICkge1xuICAgICAgY2VsbHMucHVzaCggY2VsbCApO1xuICAgIH1cbiAgfSwgdGhpcyApO1xuICByZXR1cm4gY2VsbHM7XG59O1xuXG4vKipcbiAqIGdldCBjZWxsIGVsZW1lbnRzXG4gKiBAcmV0dXJucyB7QXJyYXl9IGNlbGxFbGVtc1xuICovXG5wcm90by5nZXRDZWxsRWxlbWVudHMgPSBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIHRoaXMuY2VsbHMubWFwKCBmdW5jdGlvbiggY2VsbCApIHtcbiAgICByZXR1cm4gY2VsbC5lbGVtZW50O1xuICB9ICk7XG59O1xuXG4vKipcbiAqIGdldCBwYXJlbnQgY2VsbCBmcm9tIGFuIGVsZW1lbnRcbiAqIEBwYXJhbSB7RWxlbWVudH0gZWxlbSAtIGNoaWxkIGVsZW1lbnRcbiAqIEByZXR1cm5zIHtGbGlja2l0LkNlbGx9IGNlbGwgLSBwYXJlbnQgY2VsbFxuICovXG5wcm90by5nZXRQYXJlbnRDZWxsID0gZnVuY3Rpb24oIGVsZW0gKSB7XG4gIC8vIGZpcnN0IGNoZWNrIGlmIGVsZW0gaXMgY2VsbFxuICB2YXIgY2VsbCA9IHRoaXMuZ2V0Q2VsbCggZWxlbSApO1xuICBpZiAoIGNlbGwgKSB7XG4gICAgcmV0dXJuIGNlbGw7XG4gIH1cbiAgLy8gdHJ5IHRvIGdldCBwYXJlbnQgY2VsbCBlbGVtXG4gIGVsZW0gPSB1dGlscy5nZXRQYXJlbnQoIGVsZW0sICcuZmxpY2tpdHktc2xpZGVyID4gKicgKTtcbiAgcmV0dXJuIHRoaXMuZ2V0Q2VsbCggZWxlbSApO1xufTtcblxuLyoqXG4gKiBnZXQgY2VsbHMgYWRqYWNlbnQgdG8gYSBzbGlkZVxuICogQHBhcmFtIHtJbnRlZ2VyfSBhZGpDb3VudCAtIG51bWJlciBvZiBhZGphY2VudCBzbGlkZXNcbiAqIEBwYXJhbSB7SW50ZWdlcn0gaW5kZXggLSBpbmRleCBvZiBzbGlkZSB0byBzdGFydFxuICogQHJldHVybnMge0FycmF5fSBjZWxscyAtIGFycmF5IG9mIEZsaWNraXR5LkNlbGxzXG4gKi9cbnByb3RvLmdldEFkamFjZW50Q2VsbEVsZW1lbnRzID0gZnVuY3Rpb24oIGFkakNvdW50LCBpbmRleCApIHtcbiAgaWYgKCAhYWRqQ291bnQgKSB7XG4gICAgcmV0dXJuIHRoaXMuc2VsZWN0ZWRTbGlkZS5nZXRDZWxsRWxlbWVudHMoKTtcbiAgfVxuICBpbmRleCA9IGluZGV4ID09PSB1bmRlZmluZWQgPyB0aGlzLnNlbGVjdGVkSW5kZXggOiBpbmRleDtcblxuICB2YXIgbGVuID0gdGhpcy5zbGlkZXMubGVuZ3RoO1xuICBpZiAoIDEgKyAoIGFkakNvdW50ICogMiApID49IGxlbiApIHtcbiAgICByZXR1cm4gdGhpcy5nZXRDZWxsRWxlbWVudHMoKTtcbiAgfVxuXG4gIHZhciBjZWxsRWxlbXMgPSBbXTtcbiAgZm9yICggdmFyIGkgPSBpbmRleCAtIGFkakNvdW50OyBpIDw9IGluZGV4ICsgYWRqQ291bnQ7IGkrKyApIHtcbiAgICB2YXIgc2xpZGVJbmRleCA9IHRoaXMub3B0aW9ucy53cmFwQXJvdW5kID8gdXRpbHMubW9kdWxvKCBpLCBsZW4gKSA6IGk7XG4gICAgdmFyIHNsaWRlID0gdGhpcy5zbGlkZXNbIHNsaWRlSW5kZXggXTtcbiAgICBpZiAoIHNsaWRlICkge1xuICAgICAgY2VsbEVsZW1zID0gY2VsbEVsZW1zLmNvbmNhdCggc2xpZGUuZ2V0Q2VsbEVsZW1lbnRzKCkgKTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGNlbGxFbGVtcztcbn07XG5cbi8qKlxuICogc2VsZWN0IHNsaWRlIGZyb20gbnVtYmVyIG9yIGNlbGwgZWxlbWVudFxuICogQHBhcmFtIHtbRWxlbWVudCwgU3RyaW5nLCBOdW1iZXJdfSBzZWxlY3RvciAtIGVsZW1lbnQsIHNlbGVjdG9yIHN0cmluZywgb3IgaW5kZXhcbiAqIEByZXR1cm5zIHtGbGlja2l0eS5DZWxsfSAtIG1hdGNoaW5nIGNlbGxcbiAqL1xucHJvdG8ucXVlcnlDZWxsID0gZnVuY3Rpb24oIHNlbGVjdG9yICkge1xuICBpZiAoIHR5cGVvZiBzZWxlY3RvciA9PSAnbnVtYmVyJyApIHtcbiAgICAvLyB1c2UgbnVtYmVyIGFzIGluZGV4XG4gICAgcmV0dXJuIHRoaXMuY2VsbHNbIHNlbGVjdG9yIF07XG4gIH1cbiAgaWYgKCB0eXBlb2Ygc2VsZWN0b3IgPT0gJ3N0cmluZycgKSB7XG4gICAgLy8gZG8gbm90IHNlbGVjdCBpbnZhbGlkIHNlbGVjdG9ycyBmcm9tIGhhc2g6ICMxMjMsICMvLiAjNzkxXG4gICAgaWYgKCBzZWxlY3Rvci5tYXRjaCggL15bIy5dP1tcXGQvXS8gKSApIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgLy8gdXNlIHN0cmluZyBhcyBzZWxlY3RvciwgZ2V0IGVsZW1lbnRcbiAgICBzZWxlY3RvciA9IHRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yKCBzZWxlY3RvciApO1xuICB9XG4gIC8vIGdldCBjZWxsIGZyb20gZWxlbWVudFxuICByZXR1cm4gdGhpcy5nZXRDZWxsKCBzZWxlY3RvciApO1xufTtcblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gZXZlbnRzIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIC8vXG5cbnByb3RvLnVpQ2hhbmdlID0gZnVuY3Rpb24oKSB7XG4gIHRoaXMuZW1pdEV2ZW50KCd1aUNoYW5nZScpO1xufTtcblxuLy8ga2VlcCBmb2N1cyBvbiBlbGVtZW50IHdoZW4gY2hpbGQgVUkgZWxlbWVudHMgYXJlIGNsaWNrZWRcbnByb3RvLmNoaWxkVUlQb2ludGVyRG93biA9IGZ1bmN0aW9uKCBldmVudCApIHtcbiAgLy8gSEFDSyBpT1MgZG9lcyBub3QgYWxsb3cgdG91Y2ggZXZlbnRzIHRvIGJ1YmJsZSB1cD8hXG4gIGlmICggZXZlbnQudHlwZSAhPSAndG91Y2hzdGFydCcgKSB7XG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgfVxuICB0aGlzLmZvY3VzKCk7XG59O1xuXG4vLyAtLS0tLSByZXNpemUgLS0tLS0gLy9cblxucHJvdG8ub25yZXNpemUgPSBmdW5jdGlvbigpIHtcbiAgdGhpcy53YXRjaENTUygpO1xuICB0aGlzLnJlc2l6ZSgpO1xufTtcblxudXRpbHMuZGVib3VuY2VNZXRob2QoIEZsaWNraXR5LCAnb25yZXNpemUnLCAxNTAgKTtcblxucHJvdG8ucmVzaXplID0gZnVuY3Rpb24oKSB7XG4gIGlmICggIXRoaXMuaXNBY3RpdmUgKSB7XG4gICAgcmV0dXJuO1xuICB9XG4gIHRoaXMuZ2V0U2l6ZSgpO1xuICAvLyB3cmFwIHZhbHVlc1xuICBpZiAoIHRoaXMub3B0aW9ucy53cmFwQXJvdW5kICkge1xuICAgIHRoaXMueCA9IHV0aWxzLm1vZHVsbyggdGhpcy54LCB0aGlzLnNsaWRlYWJsZVdpZHRoICk7XG4gIH1cbiAgdGhpcy5wb3NpdGlvbkNlbGxzKCk7XG4gIHRoaXMuX2dldFdyYXBTaGlmdENlbGxzKCk7XG4gIHRoaXMuc2V0R2FsbGVyeVNpemUoKTtcbiAgdGhpcy5lbWl0RXZlbnQoJ3Jlc2l6ZScpO1xuICAvLyB1cGRhdGUgc2VsZWN0ZWQgaW5kZXggZm9yIGdyb3VwIHNsaWRlcywgaW5zdGFudFxuICAvLyBUT0RPOiBwb3NpdGlvbiBjYW4gYmUgbG9zdCBiZXR3ZWVuIGdyb3VwcyBvZiB2YXJpb3VzIG51bWJlcnNcbiAgdmFyIHNlbGVjdGVkRWxlbWVudCA9IHRoaXMuc2VsZWN0ZWRFbGVtZW50cyAmJiB0aGlzLnNlbGVjdGVkRWxlbWVudHNbMF07XG4gIHRoaXMuc2VsZWN0Q2VsbCggc2VsZWN0ZWRFbGVtZW50LCBmYWxzZSwgdHJ1ZSApO1xufTtcblxuLy8gd2F0Y2hlcyB0aGUgOmFmdGVyIHByb3BlcnR5LCBhY3RpdmF0ZXMvZGVhY3RpdmF0ZXNcbnByb3RvLndhdGNoQ1NTID0gZnVuY3Rpb24oKSB7XG4gIHZhciB3YXRjaE9wdGlvbiA9IHRoaXMub3B0aW9ucy53YXRjaENTUztcbiAgaWYgKCAhd2F0Y2hPcHRpb24gKSB7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgdmFyIGFmdGVyQ29udGVudCA9IGdldENvbXB1dGVkU3R5bGUoIHRoaXMuZWxlbWVudCwgJzphZnRlcicgKS5jb250ZW50O1xuICAvLyBhY3RpdmF0ZSBpZiA6YWZ0ZXIgeyBjb250ZW50OiAnZmxpY2tpdHknIH1cbiAgaWYgKCBhZnRlckNvbnRlbnQuaW5kZXhPZignZmxpY2tpdHknKSAhPSAtMSApIHtcbiAgICB0aGlzLmFjdGl2YXRlKCk7XG4gIH0gZWxzZSB7XG4gICAgdGhpcy5kZWFjdGl2YXRlKCk7XG4gIH1cbn07XG5cbi8vIC0tLS0tIGtleWRvd24gLS0tLS0gLy9cblxuLy8gZ28gcHJldmlvdXMvbmV4dCBpZiBsZWZ0L3JpZ2h0IGtleXMgcHJlc3NlZFxucHJvdG8ub25rZXlkb3duID0gZnVuY3Rpb24oIGV2ZW50ICkge1xuICAvLyBvbmx5IHdvcmsgaWYgZWxlbWVudCBpcyBpbiBmb2N1c1xuICB2YXIgaXNOb3RGb2N1c2VkID0gZG9jdW1lbnQuYWN0aXZlRWxlbWVudCAmJiBkb2N1bWVudC5hY3RpdmVFbGVtZW50ICE9IHRoaXMuZWxlbWVudDtcbiAgaWYgKCAhdGhpcy5vcHRpb25zLmFjY2Vzc2liaWxpdHkgfHwgaXNOb3RGb2N1c2VkICkge1xuICAgIHJldHVybjtcbiAgfVxuXG4gIHZhciBoYW5kbGVyID0gRmxpY2tpdHkua2V5Ym9hcmRIYW5kbGVyc1sgZXZlbnQua2V5Q29kZSBdO1xuICBpZiAoIGhhbmRsZXIgKSB7XG4gICAgaGFuZGxlci5jYWxsKCB0aGlzICk7XG4gIH1cbn07XG5cbkZsaWNraXR5LmtleWJvYXJkSGFuZGxlcnMgPSB7XG4gIC8vIGxlZnQgYXJyb3dcbiAgMzc6IGZ1bmN0aW9uKCkge1xuICAgIHZhciBsZWZ0TWV0aG9kID0gdGhpcy5vcHRpb25zLnJpZ2h0VG9MZWZ0ID8gJ25leHQnIDogJ3ByZXZpb3VzJztcbiAgICB0aGlzLnVpQ2hhbmdlKCk7XG4gICAgdGhpc1sgbGVmdE1ldGhvZCBdKCk7XG4gIH0sXG4gIC8vIHJpZ2h0IGFycm93XG4gIDM5OiBmdW5jdGlvbigpIHtcbiAgICB2YXIgcmlnaHRNZXRob2QgPSB0aGlzLm9wdGlvbnMucmlnaHRUb0xlZnQgPyAncHJldmlvdXMnIDogJ25leHQnO1xuICAgIHRoaXMudWlDaGFuZ2UoKTtcbiAgICB0aGlzWyByaWdodE1ldGhvZCBdKCk7XG4gIH0sXG59O1xuXG4vLyAtLS0tLSBmb2N1cyAtLS0tLSAvL1xuXG5wcm90by5mb2N1cyA9IGZ1bmN0aW9uKCkge1xuICAvLyBUT0RPIHJlbW92ZSBzY3JvbGxUbyBvbmNlIGZvY3VzIG9wdGlvbnMgZ2V0cyBtb3JlIHN1cHBvcnRcbiAgLy8gaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvQVBJL0hUTUxFbGVtZW50L2ZvY3VzIC4uLlxuICAvLyAgICAjQnJvd3Nlcl9jb21wYXRpYmlsaXR5XG4gIHZhciBwcmV2U2Nyb2xsWSA9IHdpbmRvdy5wYWdlWU9mZnNldDtcbiAgdGhpcy5lbGVtZW50LmZvY3VzKHsgcHJldmVudFNjcm9sbDogdHJ1ZSB9KTtcbiAgLy8gaGFjayB0byBmaXggc2Nyb2xsIGp1bXAgYWZ0ZXIgZm9jdXMsICM3NlxuICBpZiAoIHdpbmRvdy5wYWdlWU9mZnNldCAhPSBwcmV2U2Nyb2xsWSApIHtcbiAgICB3aW5kb3cuc2Nyb2xsVG8oIHdpbmRvdy5wYWdlWE9mZnNldCwgcHJldlNjcm9sbFkgKTtcbiAgfVxufTtcblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gZGVzdHJveSAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSAvL1xuXG4vLyBkZWFjdGl2YXRlIGFsbCBGbGlja2l0eSBmdW5jdGlvbmFsaXR5LCBidXQga2VlcCBzdHVmZiBhdmFpbGFibGVcbnByb3RvLmRlYWN0aXZhdGUgPSBmdW5jdGlvbigpIHtcbiAgaWYgKCAhdGhpcy5pc0FjdGl2ZSApIHtcbiAgICByZXR1cm47XG4gIH1cbiAgdGhpcy5lbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoJ2ZsaWNraXR5LWVuYWJsZWQnKTtcbiAgdGhpcy5lbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoJ2ZsaWNraXR5LXJ0bCcpO1xuICB0aGlzLnVuc2VsZWN0U2VsZWN0ZWRTbGlkZSgpO1xuICAvLyBkZXN0cm95IGNlbGxzXG4gIHRoaXMuY2VsbHMuZm9yRWFjaCggZnVuY3Rpb24oIGNlbGwgKSB7XG4gICAgY2VsbC5kZXN0cm95KCk7XG4gIH0gKTtcbiAgdGhpcy5lbGVtZW50LnJlbW92ZUNoaWxkKCB0aGlzLnZpZXdwb3J0ICk7XG4gIC8vIG1vdmUgY2hpbGQgZWxlbWVudHMgYmFjayBpbnRvIGVsZW1lbnRcbiAgbW92ZUVsZW1lbnRzKCB0aGlzLnNsaWRlci5jaGlsZHJlbiwgdGhpcy5lbGVtZW50ICk7XG4gIGlmICggdGhpcy5vcHRpb25zLmFjY2Vzc2liaWxpdHkgKSB7XG4gICAgdGhpcy5lbGVtZW50LnJlbW92ZUF0dHJpYnV0ZSgndGFiSW5kZXgnKTtcbiAgICB0aGlzLmVsZW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lciggJ2tleWRvd24nLCB0aGlzICk7XG4gIH1cbiAgLy8gc2V0IGZsYWdzXG4gIHRoaXMuaXNBY3RpdmUgPSBmYWxzZTtcbiAgdGhpcy5lbWl0RXZlbnQoJ2RlYWN0aXZhdGUnKTtcbn07XG5cbnByb3RvLmRlc3Ryb3kgPSBmdW5jdGlvbigpIHtcbiAgdGhpcy5kZWFjdGl2YXRlKCk7XG4gIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCAncmVzaXplJywgdGhpcyApO1xuICB0aGlzLmFsbE9mZigpO1xuICB0aGlzLmVtaXRFdmVudCgnZGVzdHJveScpO1xuICBpZiAoIGpRdWVyeSAmJiB0aGlzLiRlbGVtZW50ICkge1xuICAgIGpRdWVyeS5yZW1vdmVEYXRhKCB0aGlzLmVsZW1lbnQsICdmbGlja2l0eScgKTtcbiAgfVxuICBkZWxldGUgdGhpcy5lbGVtZW50LmZsaWNraXR5R1VJRDtcbiAgZGVsZXRlIGluc3RhbmNlc1sgdGhpcy5ndWlkIF07XG59O1xuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSBwcm90b3R5cGUgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gLy9cblxudXRpbHMuZXh0ZW5kKCBwcm90bywgYW5pbWF0ZVByb3RvdHlwZSApO1xuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSBleHRyYXMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gLy9cblxuLyoqXG4gKiBnZXQgRmxpY2tpdHkgaW5zdGFuY2UgZnJvbSBlbGVtZW50XG4gKiBAcGFyYW0ge1tFbGVtZW50LCBTdHJpbmddfSBlbGVtIC0gZWxlbWVudCBvciBzZWxlY3RvciBzdHJpbmdcbiAqIEByZXR1cm5zIHtGbGlja2l0eX0gLSBGbGlja2l0eSBpbnN0YW5jZVxuICovXG5GbGlja2l0eS5kYXRhID0gZnVuY3Rpb24oIGVsZW0gKSB7XG4gIGVsZW0gPSB1dGlscy5nZXRRdWVyeUVsZW1lbnQoIGVsZW0gKTtcbiAgdmFyIGlkID0gZWxlbSAmJiBlbGVtLmZsaWNraXR5R1VJRDtcbiAgcmV0dXJuIGlkICYmIGluc3RhbmNlc1sgaWQgXTtcbn07XG5cbnV0aWxzLmh0bWxJbml0KCBGbGlja2l0eSwgJ2ZsaWNraXR5JyApO1xuXG5pZiAoIGpRdWVyeSAmJiBqUXVlcnkuYnJpZGdldCApIHtcbiAgalF1ZXJ5LmJyaWRnZXQoICdmbGlja2l0eScsIEZsaWNraXR5ICk7XG59XG5cbi8vIHNldCBpbnRlcm5hbCBqUXVlcnksIGZvciBXZWJwYWNrICsgalF1ZXJ5IHYzLCAjNDc4XG5GbGlja2l0eS5zZXRKUXVlcnkgPSBmdW5jdGlvbigganEgKSB7XG4gIGpRdWVyeSA9IGpxO1xufTtcblxuRmxpY2tpdHkuQ2VsbCA9IENlbGw7XG5GbGlja2l0eS5TbGlkZSA9IFNsaWRlO1xuXG5yZXR1cm4gRmxpY2tpdHk7XG5cbn0gKSApO1xuIiwiLyohXG4gKiBVbmlwb2ludGVyIHYyLjMuMFxuICogYmFzZSBjbGFzcyBmb3IgZG9pbmcgb25lIHRoaW5nIHdpdGggcG9pbnRlciBldmVudFxuICogTUlUIGxpY2Vuc2VcbiAqL1xuXG4vKmpzaGludCBicm93c2VyOiB0cnVlLCB1bmRlZjogdHJ1ZSwgdW51c2VkOiB0cnVlLCBzdHJpY3Q6IHRydWUgKi9cblxuKCBmdW5jdGlvbiggd2luZG93LCBmYWN0b3J5ICkge1xuICAvLyB1bml2ZXJzYWwgbW9kdWxlIGRlZmluaXRpb25cbiAgLyoganNoaW50IHN0cmljdDogZmFsc2UgKi8gLypnbG9iYWwgZGVmaW5lLCBtb2R1bGUsIHJlcXVpcmUgKi9cbiAgaWYgKCB0eXBlb2YgZGVmaW5lID09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCApIHtcbiAgICAvLyBBTURcbiAgICBkZWZpbmUoIFtcbiAgICAgICdldi1lbWl0dGVyL2V2LWVtaXR0ZXInXG4gICAgXSwgZnVuY3Rpb24oIEV2RW1pdHRlciApIHtcbiAgICAgIHJldHVybiBmYWN0b3J5KCB3aW5kb3csIEV2RW1pdHRlciApO1xuICAgIH0pO1xuICB9IGVsc2UgaWYgKCB0eXBlb2YgbW9kdWxlID09ICdvYmplY3QnICYmIG1vZHVsZS5leHBvcnRzICkge1xuICAgIC8vIENvbW1vbkpTXG4gICAgbW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KFxuICAgICAgd2luZG93LFxuICAgICAgcmVxdWlyZSgnZXYtZW1pdHRlcicpXG4gICAgKTtcbiAgfSBlbHNlIHtcbiAgICAvLyBicm93c2VyIGdsb2JhbFxuICAgIHdpbmRvdy5Vbmlwb2ludGVyID0gZmFjdG9yeShcbiAgICAgIHdpbmRvdyxcbiAgICAgIHdpbmRvdy5FdkVtaXR0ZXJcbiAgICApO1xuICB9XG5cbn0oIHdpbmRvdywgZnVuY3Rpb24gZmFjdG9yeSggd2luZG93LCBFdkVtaXR0ZXIgKSB7XG5cbid1c2Ugc3RyaWN0JztcblxuZnVuY3Rpb24gbm9vcCgpIHt9XG5cbmZ1bmN0aW9uIFVuaXBvaW50ZXIoKSB7fVxuXG4vLyBpbmhlcml0IEV2RW1pdHRlclxudmFyIHByb3RvID0gVW5pcG9pbnRlci5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKCBFdkVtaXR0ZXIucHJvdG90eXBlICk7XG5cbnByb3RvLmJpbmRTdGFydEV2ZW50ID0gZnVuY3Rpb24oIGVsZW0gKSB7XG4gIHRoaXMuX2JpbmRTdGFydEV2ZW50KCBlbGVtLCB0cnVlICk7XG59O1xuXG5wcm90by51bmJpbmRTdGFydEV2ZW50ID0gZnVuY3Rpb24oIGVsZW0gKSB7XG4gIHRoaXMuX2JpbmRTdGFydEV2ZW50KCBlbGVtLCBmYWxzZSApO1xufTtcblxuLyoqXG4gKiBBZGQgb3IgcmVtb3ZlIHN0YXJ0IGV2ZW50XG4gKiBAcGFyYW0ge0Jvb2xlYW59IGlzQWRkIC0gcmVtb3ZlIGlmIGZhbHNleVxuICovXG5wcm90by5fYmluZFN0YXJ0RXZlbnQgPSBmdW5jdGlvbiggZWxlbSwgaXNBZGQgKSB7XG4gIC8vIG11bmdlIGlzQWRkLCBkZWZhdWx0IHRvIHRydWVcbiAgaXNBZGQgPSBpc0FkZCA9PT0gdW5kZWZpbmVkID8gdHJ1ZSA6IGlzQWRkO1xuICB2YXIgYmluZE1ldGhvZCA9IGlzQWRkID8gJ2FkZEV2ZW50TGlzdGVuZXInIDogJ3JlbW92ZUV2ZW50TGlzdGVuZXInO1xuXG4gIC8vIGRlZmF1bHQgdG8gbW91c2UgZXZlbnRzXG4gIHZhciBzdGFydEV2ZW50ID0gJ21vdXNlZG93bic7XG4gIGlmICggd2luZG93LlBvaW50ZXJFdmVudCApIHtcbiAgICAvLyBQb2ludGVyIEV2ZW50c1xuICAgIHN0YXJ0RXZlbnQgPSAncG9pbnRlcmRvd24nO1xuICB9IGVsc2UgaWYgKCAnb250b3VjaHN0YXJ0JyBpbiB3aW5kb3cgKSB7XG4gICAgLy8gVG91Y2ggRXZlbnRzLiBpT1MgU2FmYXJpXG4gICAgc3RhcnRFdmVudCA9ICd0b3VjaHN0YXJ0JztcbiAgfVxuICBlbGVtWyBiaW5kTWV0aG9kIF0oIHN0YXJ0RXZlbnQsIHRoaXMgKTtcbn07XG5cbi8vIHRyaWdnZXIgaGFuZGxlciBtZXRob2RzIGZvciBldmVudHNcbnByb3RvLmhhbmRsZUV2ZW50ID0gZnVuY3Rpb24oIGV2ZW50ICkge1xuICB2YXIgbWV0aG9kID0gJ29uJyArIGV2ZW50LnR5cGU7XG4gIGlmICggdGhpc1sgbWV0aG9kIF0gKSB7XG4gICAgdGhpc1sgbWV0aG9kIF0oIGV2ZW50ICk7XG4gIH1cbn07XG5cbi8vIHJldHVybnMgdGhlIHRvdWNoIHRoYXQgd2UncmUga2VlcGluZyB0cmFjayBvZlxucHJvdG8uZ2V0VG91Y2ggPSBmdW5jdGlvbiggdG91Y2hlcyApIHtcbiAgZm9yICggdmFyIGk9MDsgaSA8IHRvdWNoZXMubGVuZ3RoOyBpKysgKSB7XG4gICAgdmFyIHRvdWNoID0gdG91Y2hlc1tpXTtcbiAgICBpZiAoIHRvdWNoLmlkZW50aWZpZXIgPT0gdGhpcy5wb2ludGVySWRlbnRpZmllciApIHtcbiAgICAgIHJldHVybiB0b3VjaDtcbiAgICB9XG4gIH1cbn07XG5cbi8vIC0tLS0tIHN0YXJ0IGV2ZW50IC0tLS0tIC8vXG5cbnByb3RvLm9ubW91c2Vkb3duID0gZnVuY3Rpb24oIGV2ZW50ICkge1xuICAvLyBkaXNtaXNzIGNsaWNrcyBmcm9tIHJpZ2h0IG9yIG1pZGRsZSBidXR0b25zXG4gIHZhciBidXR0b24gPSBldmVudC5idXR0b247XG4gIGlmICggYnV0dG9uICYmICggYnV0dG9uICE9PSAwICYmIGJ1dHRvbiAhPT0gMSApICkge1xuICAgIHJldHVybjtcbiAgfVxuICB0aGlzLl9wb2ludGVyRG93biggZXZlbnQsIGV2ZW50ICk7XG59O1xuXG5wcm90by5vbnRvdWNoc3RhcnQgPSBmdW5jdGlvbiggZXZlbnQgKSB7XG4gIHRoaXMuX3BvaW50ZXJEb3duKCBldmVudCwgZXZlbnQuY2hhbmdlZFRvdWNoZXNbMF0gKTtcbn07XG5cbnByb3RvLm9ucG9pbnRlcmRvd24gPSBmdW5jdGlvbiggZXZlbnQgKSB7XG4gIHRoaXMuX3BvaW50ZXJEb3duKCBldmVudCwgZXZlbnQgKTtcbn07XG5cbi8qKlxuICogcG9pbnRlciBzdGFydFxuICogQHBhcmFtIHtFdmVudH0gZXZlbnRcbiAqIEBwYXJhbSB7RXZlbnQgb3IgVG91Y2h9IHBvaW50ZXJcbiAqL1xucHJvdG8uX3BvaW50ZXJEb3duID0gZnVuY3Rpb24oIGV2ZW50LCBwb2ludGVyICkge1xuICAvLyBkaXNtaXNzIHJpZ2h0IGNsaWNrIGFuZCBvdGhlciBwb2ludGVyc1xuICAvLyBidXR0b24gPSAwIGlzIG9rYXksIDEtNCBub3RcbiAgaWYgKCBldmVudC5idXR0b24gfHwgdGhpcy5pc1BvaW50ZXJEb3duICkge1xuICAgIHJldHVybjtcbiAgfVxuXG4gIHRoaXMuaXNQb2ludGVyRG93biA9IHRydWU7XG4gIC8vIHNhdmUgcG9pbnRlciBpZGVudGlmaWVyIHRvIG1hdGNoIHVwIHRvdWNoIGV2ZW50c1xuICB0aGlzLnBvaW50ZXJJZGVudGlmaWVyID0gcG9pbnRlci5wb2ludGVySWQgIT09IHVuZGVmaW5lZCA/XG4gICAgLy8gcG9pbnRlcklkIGZvciBwb2ludGVyIGV2ZW50cywgdG91Y2guaW5kZW50aWZpZXIgZm9yIHRvdWNoIGV2ZW50c1xuICAgIHBvaW50ZXIucG9pbnRlcklkIDogcG9pbnRlci5pZGVudGlmaWVyO1xuXG4gIHRoaXMucG9pbnRlckRvd24oIGV2ZW50LCBwb2ludGVyICk7XG59O1xuXG5wcm90by5wb2ludGVyRG93biA9IGZ1bmN0aW9uKCBldmVudCwgcG9pbnRlciApIHtcbiAgdGhpcy5fYmluZFBvc3RTdGFydEV2ZW50cyggZXZlbnQgKTtcbiAgdGhpcy5lbWl0RXZlbnQoICdwb2ludGVyRG93bicsIFsgZXZlbnQsIHBvaW50ZXIgXSApO1xufTtcblxuLy8gaGFzaCBvZiBldmVudHMgdG8gYmUgYm91bmQgYWZ0ZXIgc3RhcnQgZXZlbnRcbnZhciBwb3N0U3RhcnRFdmVudHMgPSB7XG4gIG1vdXNlZG93bjogWyAnbW91c2Vtb3ZlJywgJ21vdXNldXAnIF0sXG4gIHRvdWNoc3RhcnQ6IFsgJ3RvdWNobW92ZScsICd0b3VjaGVuZCcsICd0b3VjaGNhbmNlbCcgXSxcbiAgcG9pbnRlcmRvd246IFsgJ3BvaW50ZXJtb3ZlJywgJ3BvaW50ZXJ1cCcsICdwb2ludGVyY2FuY2VsJyBdLFxufTtcblxucHJvdG8uX2JpbmRQb3N0U3RhcnRFdmVudHMgPSBmdW5jdGlvbiggZXZlbnQgKSB7XG4gIGlmICggIWV2ZW50ICkge1xuICAgIHJldHVybjtcbiAgfVxuICAvLyBnZXQgcHJvcGVyIGV2ZW50cyB0byBtYXRjaCBzdGFydCBldmVudFxuICB2YXIgZXZlbnRzID0gcG9zdFN0YXJ0RXZlbnRzWyBldmVudC50eXBlIF07XG4gIC8vIGJpbmQgZXZlbnRzIHRvIG5vZGVcbiAgZXZlbnRzLmZvckVhY2goIGZ1bmN0aW9uKCBldmVudE5hbWUgKSB7XG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoIGV2ZW50TmFtZSwgdGhpcyApO1xuICB9LCB0aGlzICk7XG4gIC8vIHNhdmUgdGhlc2UgYXJndW1lbnRzXG4gIHRoaXMuX2JvdW5kUG9pbnRlckV2ZW50cyA9IGV2ZW50cztcbn07XG5cbnByb3RvLl91bmJpbmRQb3N0U3RhcnRFdmVudHMgPSBmdW5jdGlvbigpIHtcbiAgLy8gY2hlY2sgZm9yIF9ib3VuZEV2ZW50cywgaW4gY2FzZSBkcmFnRW5kIHRyaWdnZXJlZCB0d2ljZSAob2xkIElFOCBidWcpXG4gIGlmICggIXRoaXMuX2JvdW5kUG9pbnRlckV2ZW50cyApIHtcbiAgICByZXR1cm47XG4gIH1cbiAgdGhpcy5fYm91bmRQb2ludGVyRXZlbnRzLmZvckVhY2goIGZ1bmN0aW9uKCBldmVudE5hbWUgKSB7XG4gICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoIGV2ZW50TmFtZSwgdGhpcyApO1xuICB9LCB0aGlzICk7XG5cbiAgZGVsZXRlIHRoaXMuX2JvdW5kUG9pbnRlckV2ZW50cztcbn07XG5cbi8vIC0tLS0tIG1vdmUgZXZlbnQgLS0tLS0gLy9cblxucHJvdG8ub25tb3VzZW1vdmUgPSBmdW5jdGlvbiggZXZlbnQgKSB7XG4gIHRoaXMuX3BvaW50ZXJNb3ZlKCBldmVudCwgZXZlbnQgKTtcbn07XG5cbnByb3RvLm9ucG9pbnRlcm1vdmUgPSBmdW5jdGlvbiggZXZlbnQgKSB7XG4gIGlmICggZXZlbnQucG9pbnRlcklkID09IHRoaXMucG9pbnRlcklkZW50aWZpZXIgKSB7XG4gICAgdGhpcy5fcG9pbnRlck1vdmUoIGV2ZW50LCBldmVudCApO1xuICB9XG59O1xuXG5wcm90by5vbnRvdWNobW92ZSA9IGZ1bmN0aW9uKCBldmVudCApIHtcbiAgdmFyIHRvdWNoID0gdGhpcy5nZXRUb3VjaCggZXZlbnQuY2hhbmdlZFRvdWNoZXMgKTtcbiAgaWYgKCB0b3VjaCApIHtcbiAgICB0aGlzLl9wb2ludGVyTW92ZSggZXZlbnQsIHRvdWNoICk7XG4gIH1cbn07XG5cbi8qKlxuICogcG9pbnRlciBtb3ZlXG4gKiBAcGFyYW0ge0V2ZW50fSBldmVudFxuICogQHBhcmFtIHtFdmVudCBvciBUb3VjaH0gcG9pbnRlclxuICogQHByaXZhdGVcbiAqL1xucHJvdG8uX3BvaW50ZXJNb3ZlID0gZnVuY3Rpb24oIGV2ZW50LCBwb2ludGVyICkge1xuICB0aGlzLnBvaW50ZXJNb3ZlKCBldmVudCwgcG9pbnRlciApO1xufTtcblxuLy8gcHVibGljXG5wcm90by5wb2ludGVyTW92ZSA9IGZ1bmN0aW9uKCBldmVudCwgcG9pbnRlciApIHtcbiAgdGhpcy5lbWl0RXZlbnQoICdwb2ludGVyTW92ZScsIFsgZXZlbnQsIHBvaW50ZXIgXSApO1xufTtcblxuLy8gLS0tLS0gZW5kIGV2ZW50IC0tLS0tIC8vXG5cblxucHJvdG8ub25tb3VzZXVwID0gZnVuY3Rpb24oIGV2ZW50ICkge1xuICB0aGlzLl9wb2ludGVyVXAoIGV2ZW50LCBldmVudCApO1xufTtcblxucHJvdG8ub25wb2ludGVydXAgPSBmdW5jdGlvbiggZXZlbnQgKSB7XG4gIGlmICggZXZlbnQucG9pbnRlcklkID09IHRoaXMucG9pbnRlcklkZW50aWZpZXIgKSB7XG4gICAgdGhpcy5fcG9pbnRlclVwKCBldmVudCwgZXZlbnQgKTtcbiAgfVxufTtcblxucHJvdG8ub250b3VjaGVuZCA9IGZ1bmN0aW9uKCBldmVudCApIHtcbiAgdmFyIHRvdWNoID0gdGhpcy5nZXRUb3VjaCggZXZlbnQuY2hhbmdlZFRvdWNoZXMgKTtcbiAgaWYgKCB0b3VjaCApIHtcbiAgICB0aGlzLl9wb2ludGVyVXAoIGV2ZW50LCB0b3VjaCApO1xuICB9XG59O1xuXG4vKipcbiAqIHBvaW50ZXIgdXBcbiAqIEBwYXJhbSB7RXZlbnR9IGV2ZW50XG4gKiBAcGFyYW0ge0V2ZW50IG9yIFRvdWNofSBwb2ludGVyXG4gKiBAcHJpdmF0ZVxuICovXG5wcm90by5fcG9pbnRlclVwID0gZnVuY3Rpb24oIGV2ZW50LCBwb2ludGVyICkge1xuICB0aGlzLl9wb2ludGVyRG9uZSgpO1xuICB0aGlzLnBvaW50ZXJVcCggZXZlbnQsIHBvaW50ZXIgKTtcbn07XG5cbi8vIHB1YmxpY1xucHJvdG8ucG9pbnRlclVwID0gZnVuY3Rpb24oIGV2ZW50LCBwb2ludGVyICkge1xuICB0aGlzLmVtaXRFdmVudCggJ3BvaW50ZXJVcCcsIFsgZXZlbnQsIHBvaW50ZXIgXSApO1xufTtcblxuLy8gLS0tLS0gcG9pbnRlciBkb25lIC0tLS0tIC8vXG5cbi8vIHRyaWdnZXJlZCBvbiBwb2ludGVyIHVwICYgcG9pbnRlciBjYW5jZWxcbnByb3RvLl9wb2ludGVyRG9uZSA9IGZ1bmN0aW9uKCkge1xuICB0aGlzLl9wb2ludGVyUmVzZXQoKTtcbiAgdGhpcy5fdW5iaW5kUG9zdFN0YXJ0RXZlbnRzKCk7XG4gIHRoaXMucG9pbnRlckRvbmUoKTtcbn07XG5cbnByb3RvLl9wb2ludGVyUmVzZXQgPSBmdW5jdGlvbigpIHtcbiAgLy8gcmVzZXQgcHJvcGVydGllc1xuICB0aGlzLmlzUG9pbnRlckRvd24gPSBmYWxzZTtcbiAgZGVsZXRlIHRoaXMucG9pbnRlcklkZW50aWZpZXI7XG59O1xuXG5wcm90by5wb2ludGVyRG9uZSA9IG5vb3A7XG5cbi8vIC0tLS0tIHBvaW50ZXIgY2FuY2VsIC0tLS0tIC8vXG5cbnByb3RvLm9ucG9pbnRlcmNhbmNlbCA9IGZ1bmN0aW9uKCBldmVudCApIHtcbiAgaWYgKCBldmVudC5wb2ludGVySWQgPT0gdGhpcy5wb2ludGVySWRlbnRpZmllciApIHtcbiAgICB0aGlzLl9wb2ludGVyQ2FuY2VsKCBldmVudCwgZXZlbnQgKTtcbiAgfVxufTtcblxucHJvdG8ub250b3VjaGNhbmNlbCA9IGZ1bmN0aW9uKCBldmVudCApIHtcbiAgdmFyIHRvdWNoID0gdGhpcy5nZXRUb3VjaCggZXZlbnQuY2hhbmdlZFRvdWNoZXMgKTtcbiAgaWYgKCB0b3VjaCApIHtcbiAgICB0aGlzLl9wb2ludGVyQ2FuY2VsKCBldmVudCwgdG91Y2ggKTtcbiAgfVxufTtcblxuLyoqXG4gKiBwb2ludGVyIGNhbmNlbFxuICogQHBhcmFtIHtFdmVudH0gZXZlbnRcbiAqIEBwYXJhbSB7RXZlbnQgb3IgVG91Y2h9IHBvaW50ZXJcbiAqIEBwcml2YXRlXG4gKi9cbnByb3RvLl9wb2ludGVyQ2FuY2VsID0gZnVuY3Rpb24oIGV2ZW50LCBwb2ludGVyICkge1xuICB0aGlzLl9wb2ludGVyRG9uZSgpO1xuICB0aGlzLnBvaW50ZXJDYW5jZWwoIGV2ZW50LCBwb2ludGVyICk7XG59O1xuXG4vLyBwdWJsaWNcbnByb3RvLnBvaW50ZXJDYW5jZWwgPSBmdW5jdGlvbiggZXZlbnQsIHBvaW50ZXIgKSB7XG4gIHRoaXMuZW1pdEV2ZW50KCAncG9pbnRlckNhbmNlbCcsIFsgZXZlbnQsIHBvaW50ZXIgXSApO1xufTtcblxuLy8gLS0tLS0gIC0tLS0tIC8vXG5cbi8vIHV0aWxpdHkgZnVuY3Rpb24gZm9yIGdldHRpbmcgeC95IGNvb3JkcyBmcm9tIGV2ZW50XG5Vbmlwb2ludGVyLmdldFBvaW50ZXJQb2ludCA9IGZ1bmN0aW9uKCBwb2ludGVyICkge1xuICByZXR1cm4ge1xuICAgIHg6IHBvaW50ZXIucGFnZVgsXG4gICAgeTogcG9pbnRlci5wYWdlWVxuICB9O1xufTtcblxuLy8gLS0tLS0gIC0tLS0tIC8vXG5cbnJldHVybiBVbmlwb2ludGVyO1xuXG59KSk7XG4iLCIvKiFcbiAqIFVuaWRyYWdnZXIgdjIuMy4xXG4gKiBEcmFnZ2FibGUgYmFzZSBjbGFzc1xuICogTUlUIGxpY2Vuc2VcbiAqL1xuXG4vKmpzaGludCBicm93c2VyOiB0cnVlLCB1bnVzZWQ6IHRydWUsIHVuZGVmOiB0cnVlLCBzdHJpY3Q6IHRydWUgKi9cblxuKCBmdW5jdGlvbiggd2luZG93LCBmYWN0b3J5ICkge1xuICAvLyB1bml2ZXJzYWwgbW9kdWxlIGRlZmluaXRpb25cbiAgLypqc2hpbnQgc3RyaWN0OiBmYWxzZSAqLyAvKmdsb2JhbHMgZGVmaW5lLCBtb2R1bGUsIHJlcXVpcmUgKi9cblxuICBpZiAoIHR5cGVvZiBkZWZpbmUgPT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kICkge1xuICAgIC8vIEFNRFxuICAgIGRlZmluZSggW1xuICAgICAgJ3VuaXBvaW50ZXIvdW5pcG9pbnRlcidcbiAgICBdLCBmdW5jdGlvbiggVW5pcG9pbnRlciApIHtcbiAgICAgIHJldHVybiBmYWN0b3J5KCB3aW5kb3csIFVuaXBvaW50ZXIgKTtcbiAgICB9KTtcbiAgfSBlbHNlIGlmICggdHlwZW9mIG1vZHVsZSA9PSAnb2JqZWN0JyAmJiBtb2R1bGUuZXhwb3J0cyApIHtcbiAgICAvLyBDb21tb25KU1xuICAgIG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeShcbiAgICAgIHdpbmRvdyxcbiAgICAgIHJlcXVpcmUoJ3VuaXBvaW50ZXInKVxuICAgICk7XG4gIH0gZWxzZSB7XG4gICAgLy8gYnJvd3NlciBnbG9iYWxcbiAgICB3aW5kb3cuVW5pZHJhZ2dlciA9IGZhY3RvcnkoXG4gICAgICB3aW5kb3csXG4gICAgICB3aW5kb3cuVW5pcG9pbnRlclxuICAgICk7XG4gIH1cblxufSggd2luZG93LCBmdW5jdGlvbiBmYWN0b3J5KCB3aW5kb3csIFVuaXBvaW50ZXIgKSB7XG5cbid1c2Ugc3RyaWN0JztcblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gVW5pZHJhZ2dlciAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSAvL1xuXG5mdW5jdGlvbiBVbmlkcmFnZ2VyKCkge31cblxuLy8gaW5oZXJpdCBVbmlwb2ludGVyICYgRXZFbWl0dGVyXG52YXIgcHJvdG8gPSBVbmlkcmFnZ2VyLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoIFVuaXBvaW50ZXIucHJvdG90eXBlICk7XG5cbi8vIC0tLS0tIGJpbmQgc3RhcnQgLS0tLS0gLy9cblxucHJvdG8uYmluZEhhbmRsZXMgPSBmdW5jdGlvbigpIHtcbiAgdGhpcy5fYmluZEhhbmRsZXMoIHRydWUgKTtcbn07XG5cbnByb3RvLnVuYmluZEhhbmRsZXMgPSBmdW5jdGlvbigpIHtcbiAgdGhpcy5fYmluZEhhbmRsZXMoIGZhbHNlICk7XG59O1xuXG4vKipcbiAqIEFkZCBvciByZW1vdmUgc3RhcnQgZXZlbnRcbiAqIEBwYXJhbSB7Qm9vbGVhbn0gaXNBZGRcbiAqL1xucHJvdG8uX2JpbmRIYW5kbGVzID0gZnVuY3Rpb24oIGlzQWRkICkge1xuICAvLyBtdW5nZSBpc0FkZCwgZGVmYXVsdCB0byB0cnVlXG4gIGlzQWRkID0gaXNBZGQgPT09IHVuZGVmaW5lZCA/IHRydWUgOiBpc0FkZDtcbiAgLy8gYmluZCBlYWNoIGhhbmRsZVxuICB2YXIgYmluZE1ldGhvZCA9IGlzQWRkID8gJ2FkZEV2ZW50TGlzdGVuZXInIDogJ3JlbW92ZUV2ZW50TGlzdGVuZXInO1xuICB2YXIgdG91Y2hBY3Rpb24gPSBpc0FkZCA/IHRoaXMuX3RvdWNoQWN0aW9uVmFsdWUgOiAnJztcbiAgZm9yICggdmFyIGk9MDsgaSA8IHRoaXMuaGFuZGxlcy5sZW5ndGg7IGkrKyApIHtcbiAgICB2YXIgaGFuZGxlID0gdGhpcy5oYW5kbGVzW2ldO1xuICAgIHRoaXMuX2JpbmRTdGFydEV2ZW50KCBoYW5kbGUsIGlzQWRkICk7XG4gICAgaGFuZGxlWyBiaW5kTWV0aG9kIF0oICdjbGljaycsIHRoaXMgKTtcbiAgICAvLyB0b3VjaC1hY3Rpb246IG5vbmUgdG8gb3ZlcnJpZGUgYnJvd3NlciB0b3VjaCBnZXN0dXJlcy4gbWV0YWZpenp5L2ZsaWNraXR5IzU0MFxuICAgIGlmICggd2luZG93LlBvaW50ZXJFdmVudCApIHtcbiAgICAgIGhhbmRsZS5zdHlsZS50b3VjaEFjdGlvbiA9IHRvdWNoQWN0aW9uO1xuICAgIH1cbiAgfVxufTtcblxuLy8gcHJvdG90eXBlIHNvIGl0IGNhbiBiZSBvdmVyd3JpdGVhYmxlIGJ5IEZsaWNraXR5XG5wcm90by5fdG91Y2hBY3Rpb25WYWx1ZSA9ICdub25lJztcblxuLy8gLS0tLS0gc3RhcnQgZXZlbnQgLS0tLS0gLy9cblxuLyoqXG4gKiBwb2ludGVyIHN0YXJ0XG4gKiBAcGFyYW0ge0V2ZW50fSBldmVudFxuICogQHBhcmFtIHtFdmVudCBvciBUb3VjaH0gcG9pbnRlclxuICovXG5wcm90by5wb2ludGVyRG93biA9IGZ1bmN0aW9uKCBldmVudCwgcG9pbnRlciApIHtcbiAgdmFyIGlzT2theSA9IHRoaXMub2theVBvaW50ZXJEb3duKCBldmVudCApO1xuICBpZiAoICFpc09rYXkgKSB7XG4gICAgcmV0dXJuO1xuICB9XG4gIC8vIHRyYWNrIHN0YXJ0IGV2ZW50IHBvc2l0aW9uXG4gIC8vIFNhZmFyaSA5IG92ZXJyaWRlcyBwYWdlWCBhbmQgcGFnZVkuIFRoZXNlIHZhbHVlcyBuZWVkcyB0byBiZSBjb3BpZWQuIGZsaWNraXR5Izg0MlxuICB0aGlzLnBvaW50ZXJEb3duUG9pbnRlciA9IHtcbiAgICBwYWdlWDogcG9pbnRlci5wYWdlWCxcbiAgICBwYWdlWTogcG9pbnRlci5wYWdlWSxcbiAgfTtcblxuICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICB0aGlzLnBvaW50ZXJEb3duQmx1cigpO1xuICAvLyBiaW5kIG1vdmUgYW5kIGVuZCBldmVudHNcbiAgdGhpcy5fYmluZFBvc3RTdGFydEV2ZW50cyggZXZlbnQgKTtcbiAgdGhpcy5lbWl0RXZlbnQoICdwb2ludGVyRG93bicsIFsgZXZlbnQsIHBvaW50ZXIgXSApO1xufTtcblxuLy8gbm9kZXMgdGhhdCBoYXZlIHRleHQgZmllbGRzXG52YXIgY3Vyc29yTm9kZXMgPSB7XG4gIFRFWFRBUkVBOiB0cnVlLFxuICBJTlBVVDogdHJ1ZSxcbiAgU0VMRUNUOiB0cnVlLFxuICBPUFRJT046IHRydWUsXG59O1xuXG4vLyBpbnB1dCB0eXBlcyB0aGF0IGRvIG5vdCBoYXZlIHRleHQgZmllbGRzXG52YXIgY2xpY2tUeXBlcyA9IHtcbiAgcmFkaW86IHRydWUsXG4gIGNoZWNrYm94OiB0cnVlLFxuICBidXR0b246IHRydWUsXG4gIHN1Ym1pdDogdHJ1ZSxcbiAgaW1hZ2U6IHRydWUsXG4gIGZpbGU6IHRydWUsXG59O1xuXG4vLyBkaXNtaXNzIGlucHV0cyB3aXRoIHRleHQgZmllbGRzLiBmbGlja2l0eSM0MDMsIGZsaWNraXR5IzQwNFxucHJvdG8ub2theVBvaW50ZXJEb3duID0gZnVuY3Rpb24oIGV2ZW50ICkge1xuICB2YXIgaXNDdXJzb3JOb2RlID0gY3Vyc29yTm9kZXNbIGV2ZW50LnRhcmdldC5ub2RlTmFtZSBdO1xuICB2YXIgaXNDbGlja1R5cGUgPSBjbGlja1R5cGVzWyBldmVudC50YXJnZXQudHlwZSBdO1xuICB2YXIgaXNPa2F5ID0gIWlzQ3Vyc29yTm9kZSB8fCBpc0NsaWNrVHlwZTtcbiAgaWYgKCAhaXNPa2F5ICkge1xuICAgIHRoaXMuX3BvaW50ZXJSZXNldCgpO1xuICB9XG4gIHJldHVybiBpc09rYXk7XG59O1xuXG4vLyBrbHVkZ2UgdG8gYmx1ciBwcmV2aW91c2x5IGZvY3VzZWQgaW5wdXRcbnByb3RvLnBvaW50ZXJEb3duQmx1ciA9IGZ1bmN0aW9uKCkge1xuICB2YXIgZm9jdXNlZCA9IGRvY3VtZW50LmFjdGl2ZUVsZW1lbnQ7XG4gIC8vIGRvIG5vdCBibHVyIGJvZHkgZm9yIElFMTAsIG1ldGFmaXp6eS9mbGlja2l0eSMxMTdcbiAgdmFyIGNhbkJsdXIgPSBmb2N1c2VkICYmIGZvY3VzZWQuYmx1ciAmJiBmb2N1c2VkICE9IGRvY3VtZW50LmJvZHk7XG4gIGlmICggY2FuQmx1ciApIHtcbiAgICBmb2N1c2VkLmJsdXIoKTtcbiAgfVxufTtcblxuLy8gLS0tLS0gbW92ZSBldmVudCAtLS0tLSAvL1xuXG4vKipcbiAqIGRyYWcgbW92ZVxuICogQHBhcmFtIHtFdmVudH0gZXZlbnRcbiAqIEBwYXJhbSB7RXZlbnQgb3IgVG91Y2h9IHBvaW50ZXJcbiAqL1xucHJvdG8ucG9pbnRlck1vdmUgPSBmdW5jdGlvbiggZXZlbnQsIHBvaW50ZXIgKSB7XG4gIHZhciBtb3ZlVmVjdG9yID0gdGhpcy5fZHJhZ1BvaW50ZXJNb3ZlKCBldmVudCwgcG9pbnRlciApO1xuICB0aGlzLmVtaXRFdmVudCggJ3BvaW50ZXJNb3ZlJywgWyBldmVudCwgcG9pbnRlciwgbW92ZVZlY3RvciBdICk7XG4gIHRoaXMuX2RyYWdNb3ZlKCBldmVudCwgcG9pbnRlciwgbW92ZVZlY3RvciApO1xufTtcblxuLy8gYmFzZSBwb2ludGVyIG1vdmUgbG9naWNcbnByb3RvLl9kcmFnUG9pbnRlck1vdmUgPSBmdW5jdGlvbiggZXZlbnQsIHBvaW50ZXIgKSB7XG4gIHZhciBtb3ZlVmVjdG9yID0ge1xuICAgIHg6IHBvaW50ZXIucGFnZVggLSB0aGlzLnBvaW50ZXJEb3duUG9pbnRlci5wYWdlWCxcbiAgICB5OiBwb2ludGVyLnBhZ2VZIC0gdGhpcy5wb2ludGVyRG93blBvaW50ZXIucGFnZVlcbiAgfTtcbiAgLy8gc3RhcnQgZHJhZyBpZiBwb2ludGVyIGhhcyBtb3ZlZCBmYXIgZW5vdWdoIHRvIHN0YXJ0IGRyYWdcbiAgaWYgKCAhdGhpcy5pc0RyYWdnaW5nICYmIHRoaXMuaGFzRHJhZ1N0YXJ0ZWQoIG1vdmVWZWN0b3IgKSApIHtcbiAgICB0aGlzLl9kcmFnU3RhcnQoIGV2ZW50LCBwb2ludGVyICk7XG4gIH1cbiAgcmV0dXJuIG1vdmVWZWN0b3I7XG59O1xuXG4vLyBjb25kaXRpb24gaWYgcG9pbnRlciBoYXMgbW92ZWQgZmFyIGVub3VnaCB0byBzdGFydCBkcmFnXG5wcm90by5oYXNEcmFnU3RhcnRlZCA9IGZ1bmN0aW9uKCBtb3ZlVmVjdG9yICkge1xuICByZXR1cm4gTWF0aC5hYnMoIG1vdmVWZWN0b3IueCApID4gMyB8fCBNYXRoLmFicyggbW92ZVZlY3Rvci55ICkgPiAzO1xufTtcblxuLy8gLS0tLS0gZW5kIGV2ZW50IC0tLS0tIC8vXG5cbi8qKlxuICogcG9pbnRlciB1cFxuICogQHBhcmFtIHtFdmVudH0gZXZlbnRcbiAqIEBwYXJhbSB7RXZlbnQgb3IgVG91Y2h9IHBvaW50ZXJcbiAqL1xucHJvdG8ucG9pbnRlclVwID0gZnVuY3Rpb24oIGV2ZW50LCBwb2ludGVyICkge1xuICB0aGlzLmVtaXRFdmVudCggJ3BvaW50ZXJVcCcsIFsgZXZlbnQsIHBvaW50ZXIgXSApO1xuICB0aGlzLl9kcmFnUG9pbnRlclVwKCBldmVudCwgcG9pbnRlciApO1xufTtcblxucHJvdG8uX2RyYWdQb2ludGVyVXAgPSBmdW5jdGlvbiggZXZlbnQsIHBvaW50ZXIgKSB7XG4gIGlmICggdGhpcy5pc0RyYWdnaW5nICkge1xuICAgIHRoaXMuX2RyYWdFbmQoIGV2ZW50LCBwb2ludGVyICk7XG4gIH0gZWxzZSB7XG4gICAgLy8gcG9pbnRlciBkaWRuJ3QgbW92ZSBlbm91Z2ggZm9yIGRyYWcgdG8gc3RhcnRcbiAgICB0aGlzLl9zdGF0aWNDbGljayggZXZlbnQsIHBvaW50ZXIgKTtcbiAgfVxufTtcblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gZHJhZyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSAvL1xuXG4vLyBkcmFnU3RhcnRcbnByb3RvLl9kcmFnU3RhcnQgPSBmdW5jdGlvbiggZXZlbnQsIHBvaW50ZXIgKSB7XG4gIHRoaXMuaXNEcmFnZ2luZyA9IHRydWU7XG4gIC8vIHByZXZlbnQgY2xpY2tzXG4gIHRoaXMuaXNQcmV2ZW50aW5nQ2xpY2tzID0gdHJ1ZTtcbiAgdGhpcy5kcmFnU3RhcnQoIGV2ZW50LCBwb2ludGVyICk7XG59O1xuXG5wcm90by5kcmFnU3RhcnQgPSBmdW5jdGlvbiggZXZlbnQsIHBvaW50ZXIgKSB7XG4gIHRoaXMuZW1pdEV2ZW50KCAnZHJhZ1N0YXJ0JywgWyBldmVudCwgcG9pbnRlciBdICk7XG59O1xuXG4vLyBkcmFnTW92ZVxucHJvdG8uX2RyYWdNb3ZlID0gZnVuY3Rpb24oIGV2ZW50LCBwb2ludGVyLCBtb3ZlVmVjdG9yICkge1xuICAvLyBkbyBub3QgZHJhZyBpZiBub3QgZHJhZ2dpbmcgeWV0XG4gIGlmICggIXRoaXMuaXNEcmFnZ2luZyApIHtcbiAgICByZXR1cm47XG4gIH1cblxuICB0aGlzLmRyYWdNb3ZlKCBldmVudCwgcG9pbnRlciwgbW92ZVZlY3RvciApO1xufTtcblxucHJvdG8uZHJhZ01vdmUgPSBmdW5jdGlvbiggZXZlbnQsIHBvaW50ZXIsIG1vdmVWZWN0b3IgKSB7XG4gIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gIHRoaXMuZW1pdEV2ZW50KCAnZHJhZ01vdmUnLCBbIGV2ZW50LCBwb2ludGVyLCBtb3ZlVmVjdG9yIF0gKTtcbn07XG5cbi8vIGRyYWdFbmRcbnByb3RvLl9kcmFnRW5kID0gZnVuY3Rpb24oIGV2ZW50LCBwb2ludGVyICkge1xuICAvLyBzZXQgZmxhZ3NcbiAgdGhpcy5pc0RyYWdnaW5nID0gZmFsc2U7XG4gIC8vIHJlLWVuYWJsZSBjbGlja2luZyBhc3luY1xuICBzZXRUaW1lb3V0KCBmdW5jdGlvbigpIHtcbiAgICBkZWxldGUgdGhpcy5pc1ByZXZlbnRpbmdDbGlja3M7XG4gIH0uYmluZCggdGhpcyApICk7XG5cbiAgdGhpcy5kcmFnRW5kKCBldmVudCwgcG9pbnRlciApO1xufTtcblxucHJvdG8uZHJhZ0VuZCA9IGZ1bmN0aW9uKCBldmVudCwgcG9pbnRlciApIHtcbiAgdGhpcy5lbWl0RXZlbnQoICdkcmFnRW5kJywgWyBldmVudCwgcG9pbnRlciBdICk7XG59O1xuXG4vLyAtLS0tLSBvbmNsaWNrIC0tLS0tIC8vXG5cbi8vIGhhbmRsZSBhbGwgY2xpY2tzIGFuZCBwcmV2ZW50IGNsaWNrcyB3aGVuIGRyYWdnaW5nXG5wcm90by5vbmNsaWNrID0gZnVuY3Rpb24oIGV2ZW50ICkge1xuICBpZiAoIHRoaXMuaXNQcmV2ZW50aW5nQ2xpY2tzICkge1xuICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gIH1cbn07XG5cbi8vIC0tLS0tIHN0YXRpY0NsaWNrIC0tLS0tIC8vXG5cbi8vIHRyaWdnZXJlZCBhZnRlciBwb2ludGVyIGRvd24gJiB1cCB3aXRoIG5vL3RpbnkgbW92ZW1lbnRcbnByb3RvLl9zdGF0aWNDbGljayA9IGZ1bmN0aW9uKCBldmVudCwgcG9pbnRlciApIHtcbiAgLy8gaWdub3JlIGVtdWxhdGVkIG1vdXNlIHVwIGNsaWNrc1xuICBpZiAoIHRoaXMuaXNJZ25vcmluZ01vdXNlVXAgJiYgZXZlbnQudHlwZSA9PSAnbW91c2V1cCcgKSB7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgdGhpcy5zdGF0aWNDbGljayggZXZlbnQsIHBvaW50ZXIgKTtcblxuICAvLyBzZXQgZmxhZyBmb3IgZW11bGF0ZWQgY2xpY2tzIDMwMG1zIGFmdGVyIHRvdWNoZW5kXG4gIGlmICggZXZlbnQudHlwZSAhPSAnbW91c2V1cCcgKSB7XG4gICAgdGhpcy5pc0lnbm9yaW5nTW91c2VVcCA9IHRydWU7XG4gICAgLy8gcmVzZXQgZmxhZyBhZnRlciAzMDBtc1xuICAgIHNldFRpbWVvdXQoIGZ1bmN0aW9uKCkge1xuICAgICAgZGVsZXRlIHRoaXMuaXNJZ25vcmluZ01vdXNlVXA7XG4gICAgfS5iaW5kKCB0aGlzICksIDQwMCApO1xuICB9XG59O1xuXG5wcm90by5zdGF0aWNDbGljayA9IGZ1bmN0aW9uKCBldmVudCwgcG9pbnRlciApIHtcbiAgdGhpcy5lbWl0RXZlbnQoICdzdGF0aWNDbGljaycsIFsgZXZlbnQsIHBvaW50ZXIgXSApO1xufTtcblxuLy8gLS0tLS0gdXRpbHMgLS0tLS0gLy9cblxuVW5pZHJhZ2dlci5nZXRQb2ludGVyUG9pbnQgPSBVbmlwb2ludGVyLmdldFBvaW50ZXJQb2ludDtcblxuLy8gLS0tLS0gIC0tLS0tIC8vXG5cbnJldHVybiBVbmlkcmFnZ2VyO1xuXG59KSk7XG4iLCIvLyBkcmFnXG4oIGZ1bmN0aW9uKCB3aW5kb3csIGZhY3RvcnkgKSB7XG4gIC8vIHVuaXZlcnNhbCBtb2R1bGUgZGVmaW5pdGlvblxuICBpZiAoIHR5cGVvZiBkZWZpbmUgPT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kICkge1xuICAgIC8vIEFNRFxuICAgIGRlZmluZSggW1xuICAgICAgJy4vZmxpY2tpdHknLFxuICAgICAgJ3VuaWRyYWdnZXIvdW5pZHJhZ2dlcicsXG4gICAgICAnZml6enktdWktdXRpbHMvdXRpbHMnLFxuICAgIF0sIGZ1bmN0aW9uKCBGbGlja2l0eSwgVW5pZHJhZ2dlciwgdXRpbHMgKSB7XG4gICAgICByZXR1cm4gZmFjdG9yeSggd2luZG93LCBGbGlja2l0eSwgVW5pZHJhZ2dlciwgdXRpbHMgKTtcbiAgICB9ICk7XG4gIH0gZWxzZSBpZiAoIHR5cGVvZiBtb2R1bGUgPT0gJ29iamVjdCcgJiYgbW9kdWxlLmV4cG9ydHMgKSB7XG4gICAgLy8gQ29tbW9uSlNcbiAgICBtb2R1bGUuZXhwb3J0cyA9IGZhY3RvcnkoXG4gICAgICAgIHdpbmRvdyxcbiAgICAgICAgcmVxdWlyZSgnLi9mbGlja2l0eScpLFxuICAgICAgICByZXF1aXJlKCd1bmlkcmFnZ2VyJyksXG4gICAgICAgIHJlcXVpcmUoJ2Zpenp5LXVpLXV0aWxzJylcbiAgICApO1xuICB9IGVsc2Uge1xuICAgIC8vIGJyb3dzZXIgZ2xvYmFsXG4gICAgd2luZG93LkZsaWNraXR5ID0gZmFjdG9yeShcbiAgICAgICAgd2luZG93LFxuICAgICAgICB3aW5kb3cuRmxpY2tpdHksXG4gICAgICAgIHdpbmRvdy5VbmlkcmFnZ2VyLFxuICAgICAgICB3aW5kb3cuZml6enlVSVV0aWxzXG4gICAgKTtcbiAgfVxuXG59KCB3aW5kb3csIGZ1bmN0aW9uIGZhY3RvcnkoIHdpbmRvdywgRmxpY2tpdHksIFVuaWRyYWdnZXIsIHV0aWxzICkge1xuXG4ndXNlIHN0cmljdCc7XG5cbi8vIC0tLS0tIGRlZmF1bHRzIC0tLS0tIC8vXG5cbnV0aWxzLmV4dGVuZCggRmxpY2tpdHkuZGVmYXVsdHMsIHtcbiAgZHJhZ2dhYmxlOiAnPjEnLFxuICBkcmFnVGhyZXNob2xkOiAzLFxufSApO1xuXG4vLyAtLS0tLSBjcmVhdGUgLS0tLS0gLy9cblxuRmxpY2tpdHkuY3JlYXRlTWV0aG9kcy5wdXNoKCdfY3JlYXRlRHJhZycpO1xuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSBkcmFnIHByb3RvdHlwZSAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSAvL1xuXG52YXIgcHJvdG8gPSBGbGlja2l0eS5wcm90b3R5cGU7XG51dGlscy5leHRlbmQoIHByb3RvLCBVbmlkcmFnZ2VyLnByb3RvdHlwZSApO1xucHJvdG8uX3RvdWNoQWN0aW9uVmFsdWUgPSAncGFuLXknO1xuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSAgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gLy9cblxudmFyIGlzVG91Y2ggPSAnY3JlYXRlVG91Y2gnIGluIGRvY3VtZW50O1xudmFyIGlzVG91Y2htb3ZlU2Nyb2xsQ2FuY2VsZWQgPSBmYWxzZTtcblxucHJvdG8uX2NyZWF0ZURyYWcgPSBmdW5jdGlvbigpIHtcbiAgdGhpcy5vbiggJ2FjdGl2YXRlJywgdGhpcy5vbkFjdGl2YXRlRHJhZyApO1xuICB0aGlzLm9uKCAndWlDaGFuZ2UnLCB0aGlzLl91aUNoYW5nZURyYWcgKTtcbiAgdGhpcy5vbiggJ2RlYWN0aXZhdGUnLCB0aGlzLm9uRGVhY3RpdmF0ZURyYWcgKTtcbiAgdGhpcy5vbiggJ2NlbGxDaGFuZ2UnLCB0aGlzLnVwZGF0ZURyYWdnYWJsZSApO1xuICAvLyBUT0RPIHVwZGF0ZURyYWdnYWJsZSBvbiByZXNpemU/IGlmIGdyb3VwQ2VsbHMgJiBzbGlkZXMgY2hhbmdlXG4gIC8vIEhBQ0sgLSBhZGQgc2VlbWluZ2x5IGlubm9jdW91cyBoYW5kbGVyIHRvIGZpeCBpT1MgMTAgc2Nyb2xsIGJlaGF2aW9yXG4gIC8vICM0NTcsIFJ1YmFYYS9Tb3J0YWJsZSM5NzNcbiAgaWYgKCBpc1RvdWNoICYmICFpc1RvdWNobW92ZVNjcm9sbENhbmNlbGVkICkge1xuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCAndG91Y2htb3ZlJywgZnVuY3Rpb24oKSB7fSApO1xuICAgIGlzVG91Y2htb3ZlU2Nyb2xsQ2FuY2VsZWQgPSB0cnVlO1xuICB9XG59O1xuXG5wcm90by5vbkFjdGl2YXRlRHJhZyA9IGZ1bmN0aW9uKCkge1xuICB0aGlzLmhhbmRsZXMgPSBbIHRoaXMudmlld3BvcnQgXTtcbiAgdGhpcy5iaW5kSGFuZGxlcygpO1xuICB0aGlzLnVwZGF0ZURyYWdnYWJsZSgpO1xufTtcblxucHJvdG8ub25EZWFjdGl2YXRlRHJhZyA9IGZ1bmN0aW9uKCkge1xuICB0aGlzLnVuYmluZEhhbmRsZXMoKTtcbiAgdGhpcy5lbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoJ2lzLWRyYWdnYWJsZScpO1xufTtcblxucHJvdG8udXBkYXRlRHJhZ2dhYmxlID0gZnVuY3Rpb24oKSB7XG4gIC8vIGRpc2FibGUgZHJhZ2dpbmcgaWYgbGVzcyB0aGFuIDIgc2xpZGVzLiAjMjc4XG4gIGlmICggdGhpcy5vcHRpb25zLmRyYWdnYWJsZSA9PSAnPjEnICkge1xuICAgIHRoaXMuaXNEcmFnZ2FibGUgPSB0aGlzLnNsaWRlcy5sZW5ndGggPiAxO1xuICB9IGVsc2Uge1xuICAgIHRoaXMuaXNEcmFnZ2FibGUgPSB0aGlzLm9wdGlvbnMuZHJhZ2dhYmxlO1xuICB9XG4gIGlmICggdGhpcy5pc0RyYWdnYWJsZSApIHtcbiAgICB0aGlzLmVsZW1lbnQuY2xhc3NMaXN0LmFkZCgnaXMtZHJhZ2dhYmxlJyk7XG4gIH0gZWxzZSB7XG4gICAgdGhpcy5lbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoJ2lzLWRyYWdnYWJsZScpO1xuICB9XG59O1xuXG4vLyBiYWNrd2FyZHMgY29tcGF0aWJpbGl0eVxucHJvdG8uYmluZERyYWcgPSBmdW5jdGlvbigpIHtcbiAgdGhpcy5vcHRpb25zLmRyYWdnYWJsZSA9IHRydWU7XG4gIHRoaXMudXBkYXRlRHJhZ2dhYmxlKCk7XG59O1xuXG5wcm90by51bmJpbmREcmFnID0gZnVuY3Rpb24oKSB7XG4gIHRoaXMub3B0aW9ucy5kcmFnZ2FibGUgPSBmYWxzZTtcbiAgdGhpcy51cGRhdGVEcmFnZ2FibGUoKTtcbn07XG5cbnByb3RvLl91aUNoYW5nZURyYWcgPSBmdW5jdGlvbigpIHtcbiAgZGVsZXRlIHRoaXMuaXNGcmVlU2Nyb2xsaW5nO1xufTtcblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gcG9pbnRlciBldmVudHMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gLy9cblxucHJvdG8ucG9pbnRlckRvd24gPSBmdW5jdGlvbiggZXZlbnQsIHBvaW50ZXIgKSB7XG4gIGlmICggIXRoaXMuaXNEcmFnZ2FibGUgKSB7XG4gICAgdGhpcy5fcG9pbnRlckRvd25EZWZhdWx0KCBldmVudCwgcG9pbnRlciApO1xuICAgIHJldHVybjtcbiAgfVxuICB2YXIgaXNPa2F5ID0gdGhpcy5va2F5UG9pbnRlckRvd24oIGV2ZW50ICk7XG4gIGlmICggIWlzT2theSApIHtcbiAgICByZXR1cm47XG4gIH1cblxuICB0aGlzLl9wb2ludGVyRG93blByZXZlbnREZWZhdWx0KCBldmVudCApO1xuICB0aGlzLnBvaW50ZXJEb3duRm9jdXMoIGV2ZW50ICk7XG4gIC8vIGJsdXJcbiAgaWYgKCBkb2N1bWVudC5hY3RpdmVFbGVtZW50ICE9IHRoaXMuZWxlbWVudCApIHtcbiAgICAvLyBkbyBub3QgYmx1ciBpZiBhbHJlYWR5IGZvY3VzZWRcbiAgICB0aGlzLnBvaW50ZXJEb3duQmx1cigpO1xuICB9XG5cbiAgLy8gc3RvcCBpZiBpdCB3YXMgbW92aW5nXG4gIHRoaXMuZHJhZ1ggPSB0aGlzLng7XG4gIHRoaXMudmlld3BvcnQuY2xhc3NMaXN0LmFkZCgnaXMtcG9pbnRlci1kb3duJyk7XG4gIC8vIHRyYWNrIHNjcm9sbGluZ1xuICB0aGlzLnBvaW50ZXJEb3duU2Nyb2xsID0gZ2V0U2Nyb2xsUG9zaXRpb24oKTtcbiAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoICdzY3JvbGwnLCB0aGlzICk7XG5cbiAgdGhpcy5fcG9pbnRlckRvd25EZWZhdWx0KCBldmVudCwgcG9pbnRlciApO1xufTtcblxuLy8gZGVmYXVsdCBwb2ludGVyRG93biBsb2dpYywgdXNlZCBmb3Igc3RhdGljQ2xpY2tcbnByb3RvLl9wb2ludGVyRG93bkRlZmF1bHQgPSBmdW5jdGlvbiggZXZlbnQsIHBvaW50ZXIgKSB7XG4gIC8vIHRyYWNrIHN0YXJ0IGV2ZW50IHBvc2l0aW9uXG4gIC8vIFNhZmFyaSA5IG92ZXJyaWRlcyBwYWdlWCBhbmQgcGFnZVkuIFRoZXNlIHZhbHVlcyBuZWVkcyB0byBiZSBjb3BpZWQuICM3NzlcbiAgdGhpcy5wb2ludGVyRG93blBvaW50ZXIgPSB7XG4gICAgcGFnZVg6IHBvaW50ZXIucGFnZVgsXG4gICAgcGFnZVk6IHBvaW50ZXIucGFnZVksXG4gIH07XG4gIC8vIGJpbmQgbW92ZSBhbmQgZW5kIGV2ZW50c1xuICB0aGlzLl9iaW5kUG9zdFN0YXJ0RXZlbnRzKCBldmVudCApO1xuICB0aGlzLmRpc3BhdGNoRXZlbnQoICdwb2ludGVyRG93bicsIGV2ZW50LCBbIHBvaW50ZXIgXSApO1xufTtcblxudmFyIGZvY3VzTm9kZXMgPSB7XG4gIElOUFVUOiB0cnVlLFxuICBURVhUQVJFQTogdHJ1ZSxcbiAgU0VMRUNUOiB0cnVlLFxufTtcblxucHJvdG8ucG9pbnRlckRvd25Gb2N1cyA9IGZ1bmN0aW9uKCBldmVudCApIHtcbiAgdmFyIGlzRm9jdXNOb2RlID0gZm9jdXNOb2Rlc1sgZXZlbnQudGFyZ2V0Lm5vZGVOYW1lIF07XG4gIGlmICggIWlzRm9jdXNOb2RlICkge1xuICAgIHRoaXMuZm9jdXMoKTtcbiAgfVxufTtcblxucHJvdG8uX3BvaW50ZXJEb3duUHJldmVudERlZmF1bHQgPSBmdW5jdGlvbiggZXZlbnQgKSB7XG4gIHZhciBpc1RvdWNoU3RhcnQgPSBldmVudC50eXBlID09ICd0b3VjaHN0YXJ0JztcbiAgdmFyIGlzVG91Y2hQb2ludGVyID0gZXZlbnQucG9pbnRlclR5cGUgPT0gJ3RvdWNoJztcbiAgdmFyIGlzRm9jdXNOb2RlID0gZm9jdXNOb2Rlc1sgZXZlbnQudGFyZ2V0Lm5vZGVOYW1lIF07XG4gIGlmICggIWlzVG91Y2hTdGFydCAmJiAhaXNUb3VjaFBvaW50ZXIgJiYgIWlzRm9jdXNOb2RlICkge1xuICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gIH1cbn07XG5cbi8vIC0tLS0tIG1vdmUgLS0tLS0gLy9cblxucHJvdG8uaGFzRHJhZ1N0YXJ0ZWQgPSBmdW5jdGlvbiggbW92ZVZlY3RvciApIHtcbiAgcmV0dXJuIE1hdGguYWJzKCBtb3ZlVmVjdG9yLnggKSA+IHRoaXMub3B0aW9ucy5kcmFnVGhyZXNob2xkO1xufTtcblxuLy8gLS0tLS0gdXAgLS0tLS0gLy9cblxucHJvdG8ucG9pbnRlclVwID0gZnVuY3Rpb24oIGV2ZW50LCBwb2ludGVyICkge1xuICBkZWxldGUgdGhpcy5pc1RvdWNoU2Nyb2xsaW5nO1xuICB0aGlzLnZpZXdwb3J0LmNsYXNzTGlzdC5yZW1vdmUoJ2lzLXBvaW50ZXItZG93bicpO1xuICB0aGlzLmRpc3BhdGNoRXZlbnQoICdwb2ludGVyVXAnLCBldmVudCwgWyBwb2ludGVyIF0gKTtcbiAgdGhpcy5fZHJhZ1BvaW50ZXJVcCggZXZlbnQsIHBvaW50ZXIgKTtcbn07XG5cbnByb3RvLnBvaW50ZXJEb25lID0gZnVuY3Rpb24oKSB7XG4gIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCAnc2Nyb2xsJywgdGhpcyApO1xuICBkZWxldGUgdGhpcy5wb2ludGVyRG93blNjcm9sbDtcbn07XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIGRyYWdnaW5nIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIC8vXG5cbnByb3RvLmRyYWdTdGFydCA9IGZ1bmN0aW9uKCBldmVudCwgcG9pbnRlciApIHtcbiAgaWYgKCAhdGhpcy5pc0RyYWdnYWJsZSApIHtcbiAgICByZXR1cm47XG4gIH1cbiAgdGhpcy5kcmFnU3RhcnRQb3NpdGlvbiA9IHRoaXMueDtcbiAgdGhpcy5zdGFydEFuaW1hdGlvbigpO1xuICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lciggJ3Njcm9sbCcsIHRoaXMgKTtcbiAgdGhpcy5kaXNwYXRjaEV2ZW50KCAnZHJhZ1N0YXJ0JywgZXZlbnQsIFsgcG9pbnRlciBdICk7XG59O1xuXG5wcm90by5wb2ludGVyTW92ZSA9IGZ1bmN0aW9uKCBldmVudCwgcG9pbnRlciApIHtcbiAgdmFyIG1vdmVWZWN0b3IgPSB0aGlzLl9kcmFnUG9pbnRlck1vdmUoIGV2ZW50LCBwb2ludGVyICk7XG4gIHRoaXMuZGlzcGF0Y2hFdmVudCggJ3BvaW50ZXJNb3ZlJywgZXZlbnQsIFsgcG9pbnRlciwgbW92ZVZlY3RvciBdICk7XG4gIHRoaXMuX2RyYWdNb3ZlKCBldmVudCwgcG9pbnRlciwgbW92ZVZlY3RvciApO1xufTtcblxucHJvdG8uZHJhZ01vdmUgPSBmdW5jdGlvbiggZXZlbnQsIHBvaW50ZXIsIG1vdmVWZWN0b3IgKSB7XG4gIGlmICggIXRoaXMuaXNEcmFnZ2FibGUgKSB7XG4gICAgcmV0dXJuO1xuICB9XG4gIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cbiAgdGhpcy5wcmV2aW91c0RyYWdYID0gdGhpcy5kcmFnWDtcbiAgLy8gcmV2ZXJzZSBpZiByaWdodC10by1sZWZ0XG4gIHZhciBkaXJlY3Rpb24gPSB0aGlzLm9wdGlvbnMucmlnaHRUb0xlZnQgPyAtMSA6IDE7XG4gIGlmICggdGhpcy5vcHRpb25zLndyYXBBcm91bmQgKSB7XG4gICAgLy8gd3JhcCBhcm91bmQgbW92ZS4gIzU4OVxuICAgIG1vdmVWZWN0b3IueCAlPSB0aGlzLnNsaWRlYWJsZVdpZHRoO1xuICB9XG4gIHZhciBkcmFnWCA9IHRoaXMuZHJhZ1N0YXJ0UG9zaXRpb24gKyBtb3ZlVmVjdG9yLnggKiBkaXJlY3Rpb247XG5cbiAgaWYgKCAhdGhpcy5vcHRpb25zLndyYXBBcm91bmQgJiYgdGhpcy5zbGlkZXMubGVuZ3RoICkge1xuICAgIC8vIHNsb3cgZHJhZ1xuICAgIHZhciBvcmlnaW5Cb3VuZCA9IE1hdGgubWF4KCAtdGhpcy5zbGlkZXNbMF0udGFyZ2V0LCB0aGlzLmRyYWdTdGFydFBvc2l0aW9uICk7XG4gICAgZHJhZ1ggPSBkcmFnWCA+IG9yaWdpbkJvdW5kID8gKCBkcmFnWCArIG9yaWdpbkJvdW5kICkgKiAwLjUgOiBkcmFnWDtcbiAgICB2YXIgZW5kQm91bmQgPSBNYXRoLm1pbiggLXRoaXMuZ2V0TGFzdFNsaWRlKCkudGFyZ2V0LCB0aGlzLmRyYWdTdGFydFBvc2l0aW9uICk7XG4gICAgZHJhZ1ggPSBkcmFnWCA8IGVuZEJvdW5kID8gKCBkcmFnWCArIGVuZEJvdW5kICkgKiAwLjUgOiBkcmFnWDtcbiAgfVxuXG4gIHRoaXMuZHJhZ1ggPSBkcmFnWDtcblxuICB0aGlzLmRyYWdNb3ZlVGltZSA9IG5ldyBEYXRlKCk7XG4gIHRoaXMuZGlzcGF0Y2hFdmVudCggJ2RyYWdNb3ZlJywgZXZlbnQsIFsgcG9pbnRlciwgbW92ZVZlY3RvciBdICk7XG59O1xuXG5wcm90by5kcmFnRW5kID0gZnVuY3Rpb24oIGV2ZW50LCBwb2ludGVyICkge1xuICBpZiAoICF0aGlzLmlzRHJhZ2dhYmxlICkge1xuICAgIHJldHVybjtcbiAgfVxuICBpZiAoIHRoaXMub3B0aW9ucy5mcmVlU2Nyb2xsICkge1xuICAgIHRoaXMuaXNGcmVlU2Nyb2xsaW5nID0gdHJ1ZTtcbiAgfVxuICAvLyBzZXQgc2VsZWN0ZWRJbmRleCBiYXNlZCBvbiB3aGVyZSBmbGljayB3aWxsIGVuZCB1cFxuICB2YXIgaW5kZXggPSB0aGlzLmRyYWdFbmRSZXN0aW5nU2VsZWN0KCk7XG5cbiAgaWYgKCB0aGlzLm9wdGlvbnMuZnJlZVNjcm9sbCAmJiAhdGhpcy5vcHRpb25zLndyYXBBcm91bmQgKSB7XG4gICAgLy8gaWYgZnJlZS1zY3JvbGwgJiBub3Qgd3JhcCBhcm91bmRcbiAgICAvLyBkbyBub3QgZnJlZS1zY3JvbGwgaWYgZ29pbmcgb3V0c2lkZSBvZiBib3VuZGluZyBzbGlkZXNcbiAgICAvLyBzbyBib3VuZGluZyBzbGlkZXMgY2FuIGF0dHJhY3Qgc2xpZGVyLCBhbmQga2VlcCBpdCBpbiBib3VuZHNcbiAgICB2YXIgcmVzdGluZ1ggPSB0aGlzLmdldFJlc3RpbmdQb3NpdGlvbigpO1xuICAgIHRoaXMuaXNGcmVlU2Nyb2xsaW5nID0gLXJlc3RpbmdYID4gdGhpcy5zbGlkZXNbMF0udGFyZ2V0ICYmXG4gICAgICAtcmVzdGluZ1ggPCB0aGlzLmdldExhc3RTbGlkZSgpLnRhcmdldDtcbiAgfSBlbHNlIGlmICggIXRoaXMub3B0aW9ucy5mcmVlU2Nyb2xsICYmIGluZGV4ID09IHRoaXMuc2VsZWN0ZWRJbmRleCApIHtcbiAgICAvLyBib29zdCBzZWxlY3Rpb24gaWYgc2VsZWN0ZWQgaW5kZXggaGFzIG5vdCBjaGFuZ2VkXG4gICAgaW5kZXggKz0gdGhpcy5kcmFnRW5kQm9vc3RTZWxlY3QoKTtcbiAgfVxuICBkZWxldGUgdGhpcy5wcmV2aW91c0RyYWdYO1xuICAvLyBhcHBseSBzZWxlY3Rpb25cbiAgLy8gVE9ETyByZWZhY3RvciB0aGlzLCBzZWxlY3RpbmcgaGVyZSBmZWVscyB3ZWlyZFxuICAvLyBIQUNLLCBzZXQgZmxhZyBzbyBkcmFnZ2luZyBzdGF5cyBpbiBjb3JyZWN0IGRpcmVjdGlvblxuICB0aGlzLmlzRHJhZ1NlbGVjdCA9IHRoaXMub3B0aW9ucy53cmFwQXJvdW5kO1xuICB0aGlzLnNlbGVjdCggaW5kZXggKTtcbiAgZGVsZXRlIHRoaXMuaXNEcmFnU2VsZWN0O1xuICB0aGlzLmRpc3BhdGNoRXZlbnQoICdkcmFnRW5kJywgZXZlbnQsIFsgcG9pbnRlciBdICk7XG59O1xuXG5wcm90by5kcmFnRW5kUmVzdGluZ1NlbGVjdCA9IGZ1bmN0aW9uKCkge1xuICB2YXIgcmVzdGluZ1ggPSB0aGlzLmdldFJlc3RpbmdQb3NpdGlvbigpO1xuICAvLyBob3cgZmFyIGF3YXkgZnJvbSBzZWxlY3RlZCBzbGlkZVxuICB2YXIgZGlzdGFuY2UgPSBNYXRoLmFicyggdGhpcy5nZXRTbGlkZURpc3RhbmNlKCAtcmVzdGluZ1gsIHRoaXMuc2VsZWN0ZWRJbmRleCApICk7XG4gIC8vIGdldCBjbG9zZXQgcmVzdGluZyBnb2luZyB1cCBhbmQgZ29pbmcgZG93blxuICB2YXIgcG9zaXRpdmVSZXN0aW5nID0gdGhpcy5fZ2V0Q2xvc2VzdFJlc3RpbmcoIHJlc3RpbmdYLCBkaXN0YW5jZSwgMSApO1xuICB2YXIgbmVnYXRpdmVSZXN0aW5nID0gdGhpcy5fZ2V0Q2xvc2VzdFJlc3RpbmcoIHJlc3RpbmdYLCBkaXN0YW5jZSwgLTEgKTtcbiAgLy8gdXNlIGNsb3NlciByZXN0aW5nIGZvciB3cmFwLWFyb3VuZFxuICB2YXIgaW5kZXggPSBwb3NpdGl2ZVJlc3RpbmcuZGlzdGFuY2UgPCBuZWdhdGl2ZVJlc3RpbmcuZGlzdGFuY2UgP1xuICAgIHBvc2l0aXZlUmVzdGluZy5pbmRleCA6IG5lZ2F0aXZlUmVzdGluZy5pbmRleDtcbiAgcmV0dXJuIGluZGV4O1xufTtcblxuLyoqXG4gKiBnaXZlbiByZXN0aW5nIFggYW5kIGRpc3RhbmNlIHRvIHNlbGVjdGVkIGNlbGxcbiAqIGdldCB0aGUgZGlzdGFuY2UgYW5kIGluZGV4IG9mIHRoZSBjbG9zZXN0IGNlbGxcbiAqIEBwYXJhbSB7TnVtYmVyfSByZXN0aW5nWCAtIGVzdGltYXRlZCBwb3N0LWZsaWNrIHJlc3RpbmcgcG9zaXRpb25cbiAqIEBwYXJhbSB7TnVtYmVyfSBkaXN0YW5jZSAtIGRpc3RhbmNlIHRvIHNlbGVjdGVkIGNlbGxcbiAqIEBwYXJhbSB7SW50ZWdlcn0gaW5jcmVtZW50IC0gKzEgb3IgLTEsIGdvaW5nIHVwIG9yIGRvd25cbiAqIEByZXR1cm5zIHtPYmplY3R9IC0geyBkaXN0YW5jZToge051bWJlcn0sIGluZGV4OiB7SW50ZWdlcn0gfVxuICovXG5wcm90by5fZ2V0Q2xvc2VzdFJlc3RpbmcgPSBmdW5jdGlvbiggcmVzdGluZ1gsIGRpc3RhbmNlLCBpbmNyZW1lbnQgKSB7XG4gIHZhciBpbmRleCA9IHRoaXMuc2VsZWN0ZWRJbmRleDtcbiAgdmFyIG1pbkRpc3RhbmNlID0gSW5maW5pdHk7XG4gIHZhciBjb25kaXRpb24gPSB0aGlzLm9wdGlvbnMuY29udGFpbiAmJiAhdGhpcy5vcHRpb25zLndyYXBBcm91bmQgP1xuICAgIC8vIGlmIGNvbnRhaW4sIGtlZXAgZ29pbmcgaWYgZGlzdGFuY2UgaXMgZXF1YWwgdG8gbWluRGlzdGFuY2VcbiAgICBmdW5jdGlvbiggZGlzdCwgbWluRGlzdCApIHtcbiAgICAgIHJldHVybiBkaXN0IDw9IG1pbkRpc3Q7XG4gICAgfSA6IGZ1bmN0aW9uKCBkaXN0LCBtaW5EaXN0ICkge1xuICAgICAgcmV0dXJuIGRpc3QgPCBtaW5EaXN0O1xuICAgIH07XG4gIHdoaWxlICggY29uZGl0aW9uKCBkaXN0YW5jZSwgbWluRGlzdGFuY2UgKSApIHtcbiAgICAvLyBtZWFzdXJlIGRpc3RhbmNlIHRvIG5leHQgY2VsbFxuICAgIGluZGV4ICs9IGluY3JlbWVudDtcbiAgICBtaW5EaXN0YW5jZSA9IGRpc3RhbmNlO1xuICAgIGRpc3RhbmNlID0gdGhpcy5nZXRTbGlkZURpc3RhbmNlKCAtcmVzdGluZ1gsIGluZGV4ICk7XG4gICAgaWYgKCBkaXN0YW5jZSA9PT0gbnVsbCApIHtcbiAgICAgIGJyZWFrO1xuICAgIH1cbiAgICBkaXN0YW5jZSA9IE1hdGguYWJzKCBkaXN0YW5jZSApO1xuICB9XG4gIHJldHVybiB7XG4gICAgZGlzdGFuY2U6IG1pbkRpc3RhbmNlLFxuICAgIC8vIHNlbGVjdGVkIHdhcyBwcmV2aW91cyBpbmRleFxuICAgIGluZGV4OiBpbmRleCAtIGluY3JlbWVudCxcbiAgfTtcbn07XG5cbi8qKlxuICogbWVhc3VyZSBkaXN0YW5jZSBiZXR3ZWVuIHggYW5kIGEgc2xpZGUgdGFyZ2V0XG4gKiBAcGFyYW0ge051bWJlcn0geCAtIGhvcml6b250YWwgcG9zaXRpb25cbiAqIEBwYXJhbSB7SW50ZWdlcn0gaW5kZXggLSBzbGlkZSBpbmRleFxuICogQHJldHVybnMge051bWJlcn0gLSBzbGlkZSBkaXN0YW5jZVxuICovXG5wcm90by5nZXRTbGlkZURpc3RhbmNlID0gZnVuY3Rpb24oIHgsIGluZGV4ICkge1xuICB2YXIgbGVuID0gdGhpcy5zbGlkZXMubGVuZ3RoO1xuICAvLyB3cmFwIGFyb3VuZCBpZiBhdCBsZWFzdCAyIHNsaWRlc1xuICB2YXIgaXNXcmFwQXJvdW5kID0gdGhpcy5vcHRpb25zLndyYXBBcm91bmQgJiYgbGVuID4gMTtcbiAgdmFyIHNsaWRlSW5kZXggPSBpc1dyYXBBcm91bmQgPyB1dGlscy5tb2R1bG8oIGluZGV4LCBsZW4gKSA6IGluZGV4O1xuICB2YXIgc2xpZGUgPSB0aGlzLnNsaWRlc1sgc2xpZGVJbmRleCBdO1xuICBpZiAoICFzbGlkZSApIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuICAvLyBhZGQgZGlzdGFuY2UgZm9yIHdyYXAtYXJvdW5kIHNsaWRlc1xuICB2YXIgd3JhcCA9IGlzV3JhcEFyb3VuZCA/IHRoaXMuc2xpZGVhYmxlV2lkdGggKiBNYXRoLmZsb29yKCBpbmRleC9sZW4gKSA6IDA7XG4gIHJldHVybiB4IC0gKCBzbGlkZS50YXJnZXQgKyB3cmFwICk7XG59O1xuXG5wcm90by5kcmFnRW5kQm9vc3RTZWxlY3QgPSBmdW5jdGlvbigpIHtcbiAgLy8gZG8gbm90IGJvb3N0IGlmIG5vIHByZXZpb3VzRHJhZ1ggb3IgZHJhZ01vdmVUaW1lXG4gIGlmICggdGhpcy5wcmV2aW91c0RyYWdYID09PSB1bmRlZmluZWQgfHwgIXRoaXMuZHJhZ01vdmVUaW1lIHx8XG4gICAgLy8gb3IgaWYgZHJhZyB3YXMgaGVsZCBmb3IgMTAwIG1zXG4gICAgbmV3IERhdGUoKSAtIHRoaXMuZHJhZ01vdmVUaW1lID4gMTAwICkge1xuICAgIHJldHVybiAwO1xuICB9XG5cbiAgdmFyIGRpc3RhbmNlID0gdGhpcy5nZXRTbGlkZURpc3RhbmNlKCAtdGhpcy5kcmFnWCwgdGhpcy5zZWxlY3RlZEluZGV4ICk7XG4gIHZhciBkZWx0YSA9IHRoaXMucHJldmlvdXNEcmFnWCAtIHRoaXMuZHJhZ1g7XG4gIGlmICggZGlzdGFuY2UgPiAwICYmIGRlbHRhID4gMCApIHtcbiAgICAvLyBib29zdCB0byBuZXh0IGlmIG1vdmluZyB0b3dhcmRzIHRoZSByaWdodCwgYW5kIHBvc2l0aXZlIHZlbG9jaXR5XG4gICAgcmV0dXJuIDE7XG4gIH0gZWxzZSBpZiAoIGRpc3RhbmNlIDwgMCAmJiBkZWx0YSA8IDAgKSB7XG4gICAgLy8gYm9vc3QgdG8gcHJldmlvdXMgaWYgbW92aW5nIHRvd2FyZHMgdGhlIGxlZnQsIGFuZCBuZWdhdGl2ZSB2ZWxvY2l0eVxuICAgIHJldHVybiAtMTtcbiAgfVxuICByZXR1cm4gMDtcbn07XG5cbi8vIC0tLS0tIHN0YXRpY0NsaWNrIC0tLS0tIC8vXG5cbnByb3RvLnN0YXRpY0NsaWNrID0gZnVuY3Rpb24oIGV2ZW50LCBwb2ludGVyICkge1xuICAvLyBnZXQgY2xpY2tlZENlbGwsIGlmIGNlbGwgd2FzIGNsaWNrZWRcbiAgdmFyIGNsaWNrZWRDZWxsID0gdGhpcy5nZXRQYXJlbnRDZWxsKCBldmVudC50YXJnZXQgKTtcbiAgdmFyIGNlbGxFbGVtID0gY2xpY2tlZENlbGwgJiYgY2xpY2tlZENlbGwuZWxlbWVudDtcbiAgdmFyIGNlbGxJbmRleCA9IGNsaWNrZWRDZWxsICYmIHRoaXMuY2VsbHMuaW5kZXhPZiggY2xpY2tlZENlbGwgKTtcbiAgdGhpcy5kaXNwYXRjaEV2ZW50KCAnc3RhdGljQ2xpY2snLCBldmVudCwgWyBwb2ludGVyLCBjZWxsRWxlbSwgY2VsbEluZGV4IF0gKTtcbn07XG5cbi8vIC0tLS0tIHNjcm9sbCAtLS0tLSAvL1xuXG5wcm90by5vbnNjcm9sbCA9IGZ1bmN0aW9uKCkge1xuICB2YXIgc2Nyb2xsID0gZ2V0U2Nyb2xsUG9zaXRpb24oKTtcbiAgdmFyIHNjcm9sbE1vdmVYID0gdGhpcy5wb2ludGVyRG93blNjcm9sbC54IC0gc2Nyb2xsLng7XG4gIHZhciBzY3JvbGxNb3ZlWSA9IHRoaXMucG9pbnRlckRvd25TY3JvbGwueSAtIHNjcm9sbC55O1xuICAvLyBjYW5jZWwgY2xpY2svdGFwIGlmIHNjcm9sbCBpcyB0b28gbXVjaFxuICBpZiAoIE1hdGguYWJzKCBzY3JvbGxNb3ZlWCApID4gMyB8fCBNYXRoLmFicyggc2Nyb2xsTW92ZVkgKSA+IDMgKSB7XG4gICAgdGhpcy5fcG9pbnRlckRvbmUoKTtcbiAgfVxufTtcblxuLy8gLS0tLS0gdXRpbHMgLS0tLS0gLy9cblxuZnVuY3Rpb24gZ2V0U2Nyb2xsUG9zaXRpb24oKSB7XG4gIHJldHVybiB7XG4gICAgeDogd2luZG93LnBhZ2VYT2Zmc2V0LFxuICAgIHk6IHdpbmRvdy5wYWdlWU9mZnNldCxcbiAgfTtcbn1cblxuLy8gLS0tLS0gIC0tLS0tIC8vXG5cbnJldHVybiBGbGlja2l0eTtcblxufSApICk7XG4iLCIvLyBwcmV2L25leHQgYnV0dG9uc1xuKCBmdW5jdGlvbiggd2luZG93LCBmYWN0b3J5ICkge1xuICAvLyB1bml2ZXJzYWwgbW9kdWxlIGRlZmluaXRpb25cbiAgaWYgKCB0eXBlb2YgZGVmaW5lID09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCApIHtcbiAgICAvLyBBTURcbiAgICBkZWZpbmUoIFtcbiAgICAgICcuL2ZsaWNraXR5JyxcbiAgICAgICd1bmlwb2ludGVyL3VuaXBvaW50ZXInLFxuICAgICAgJ2Zpenp5LXVpLXV0aWxzL3V0aWxzJyxcbiAgICBdLCBmdW5jdGlvbiggRmxpY2tpdHksIFVuaXBvaW50ZXIsIHV0aWxzICkge1xuICAgICAgcmV0dXJuIGZhY3RvcnkoIHdpbmRvdywgRmxpY2tpdHksIFVuaXBvaW50ZXIsIHV0aWxzICk7XG4gICAgfSApO1xuICB9IGVsc2UgaWYgKCB0eXBlb2YgbW9kdWxlID09ICdvYmplY3QnICYmIG1vZHVsZS5leHBvcnRzICkge1xuICAgIC8vIENvbW1vbkpTXG4gICAgbW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KFxuICAgICAgICB3aW5kb3csXG4gICAgICAgIHJlcXVpcmUoJy4vZmxpY2tpdHknKSxcbiAgICAgICAgcmVxdWlyZSgndW5pcG9pbnRlcicpLFxuICAgICAgICByZXF1aXJlKCdmaXp6eS11aS11dGlscycpXG4gICAgKTtcbiAgfSBlbHNlIHtcbiAgICAvLyBicm93c2VyIGdsb2JhbFxuICAgIGZhY3RvcnkoXG4gICAgICAgIHdpbmRvdyxcbiAgICAgICAgd2luZG93LkZsaWNraXR5LFxuICAgICAgICB3aW5kb3cuVW5pcG9pbnRlcixcbiAgICAgICAgd2luZG93LmZpenp5VUlVdGlsc1xuICAgICk7XG4gIH1cblxufSggd2luZG93LCBmdW5jdGlvbiBmYWN0b3J5KCB3aW5kb3csIEZsaWNraXR5LCBVbmlwb2ludGVyLCB1dGlscyApIHtcbid1c2Ugc3RyaWN0JztcblxudmFyIHN2Z1VSSSA9ICdodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Zyc7XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIFByZXZOZXh0QnV0dG9uIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIC8vXG5cbmZ1bmN0aW9uIFByZXZOZXh0QnV0dG9uKCBkaXJlY3Rpb24sIHBhcmVudCApIHtcbiAgdGhpcy5kaXJlY3Rpb24gPSBkaXJlY3Rpb247XG4gIHRoaXMucGFyZW50ID0gcGFyZW50O1xuICB0aGlzLl9jcmVhdGUoKTtcbn1cblxuUHJldk5leHRCdXR0b24ucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZSggVW5pcG9pbnRlci5wcm90b3R5cGUgKTtcblxuUHJldk5leHRCdXR0b24ucHJvdG90eXBlLl9jcmVhdGUgPSBmdW5jdGlvbigpIHtcbiAgLy8gcHJvcGVydGllc1xuICB0aGlzLmlzRW5hYmxlZCA9IHRydWU7XG4gIHRoaXMuaXNQcmV2aW91cyA9IHRoaXMuZGlyZWN0aW9uID09IC0xO1xuICB2YXIgbGVmdERpcmVjdGlvbiA9IHRoaXMucGFyZW50Lm9wdGlvbnMucmlnaHRUb0xlZnQgPyAxIDogLTE7XG4gIHRoaXMuaXNMZWZ0ID0gdGhpcy5kaXJlY3Rpb24gPT0gbGVmdERpcmVjdGlvbjtcblxuICB2YXIgZWxlbWVudCA9IHRoaXMuZWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2J1dHRvbicpO1xuICBlbGVtZW50LmNsYXNzTmFtZSA9ICdmbGlja2l0eS1idXR0b24gZmxpY2tpdHktcHJldi1uZXh0LWJ1dHRvbic7XG4gIGVsZW1lbnQuY2xhc3NOYW1lICs9IHRoaXMuaXNQcmV2aW91cyA/ICcgcHJldmlvdXMnIDogJyBuZXh0JztcbiAgLy8gcHJldmVudCBidXR0b24gZnJvbSBzdWJtaXR0aW5nIGZvcm0gaHR0cDovL3N0YWNrb3ZlcmZsb3cuY29tL2EvMTA4MzYwNzYvMTgyMTgzXG4gIGVsZW1lbnQuc2V0QXR0cmlidXRlKCAndHlwZScsICdidXR0b24nICk7XG4gIC8vIGluaXQgYXMgZGlzYWJsZWRcbiAgdGhpcy5kaXNhYmxlKCk7XG5cbiAgZWxlbWVudC5zZXRBdHRyaWJ1dGUoICdhcmlhLWxhYmVsJywgdGhpcy5pc1ByZXZpb3VzID8gJ1ByZXZpb3VzJyA6ICdOZXh0JyApO1xuXG4gIC8vIGNyZWF0ZSBhcnJvd1xuICB2YXIgc3ZnID0gdGhpcy5jcmVhdGVTVkcoKTtcbiAgZWxlbWVudC5hcHBlbmRDaGlsZCggc3ZnICk7XG4gIC8vIGV2ZW50c1xuICB0aGlzLnBhcmVudC5vbiggJ3NlbGVjdCcsIHRoaXMudXBkYXRlLmJpbmQoIHRoaXMgKSApO1xuICB0aGlzLm9uKCAncG9pbnRlckRvd24nLCB0aGlzLnBhcmVudC5jaGlsZFVJUG9pbnRlckRvd24uYmluZCggdGhpcy5wYXJlbnQgKSApO1xufTtcblxuUHJldk5leHRCdXR0b24ucHJvdG90eXBlLmFjdGl2YXRlID0gZnVuY3Rpb24oKSB7XG4gIHRoaXMuYmluZFN0YXJ0RXZlbnQoIHRoaXMuZWxlbWVudCApO1xuICB0aGlzLmVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lciggJ2NsaWNrJywgdGhpcyApO1xuICAvLyBhZGQgdG8gRE9NXG4gIHRoaXMucGFyZW50LmVsZW1lbnQuYXBwZW5kQ2hpbGQoIHRoaXMuZWxlbWVudCApO1xufTtcblxuUHJldk5leHRCdXR0b24ucHJvdG90eXBlLmRlYWN0aXZhdGUgPSBmdW5jdGlvbigpIHtcbiAgLy8gcmVtb3ZlIGZyb20gRE9NXG4gIHRoaXMucGFyZW50LmVsZW1lbnQucmVtb3ZlQ2hpbGQoIHRoaXMuZWxlbWVudCApO1xuICAvLyBjbGljayBldmVudHNcbiAgdGhpcy51bmJpbmRTdGFydEV2ZW50KCB0aGlzLmVsZW1lbnQgKTtcbiAgdGhpcy5lbGVtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoICdjbGljaycsIHRoaXMgKTtcbn07XG5cblByZXZOZXh0QnV0dG9uLnByb3RvdHlwZS5jcmVhdGVTVkcgPSBmdW5jdGlvbigpIHtcbiAgdmFyIHN2ZyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUyggc3ZnVVJJLCAnc3ZnJyApO1xuICBzdmcuc2V0QXR0cmlidXRlKCAnY2xhc3MnLCAnZmxpY2tpdHktYnV0dG9uLWljb24nICk7XG4gIHN2Zy5zZXRBdHRyaWJ1dGUoICd2aWV3Qm94JywgJzAgMCAxMDAgMTAwJyApO1xuICB2YXIgcGF0aCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUyggc3ZnVVJJLCAncGF0aCcgKTtcbiAgdmFyIHBhdGhNb3ZlbWVudHMgPSBnZXRBcnJvd01vdmVtZW50cyggdGhpcy5wYXJlbnQub3B0aW9ucy5hcnJvd1NoYXBlICk7XG4gIHBhdGguc2V0QXR0cmlidXRlKCAnZCcsIHBhdGhNb3ZlbWVudHMgKTtcbiAgcGF0aC5zZXRBdHRyaWJ1dGUoICdjbGFzcycsICdhcnJvdycgKTtcbiAgLy8gcm90YXRlIGFycm93XG4gIGlmICggIXRoaXMuaXNMZWZ0ICkge1xuICAgIHBhdGguc2V0QXR0cmlidXRlKCAndHJhbnNmb3JtJywgJ3RyYW5zbGF0ZSgxMDAsIDEwMCkgcm90YXRlKDE4MCkgJyApO1xuICB9XG4gIHN2Zy5hcHBlbmRDaGlsZCggcGF0aCApO1xuICByZXR1cm4gc3ZnO1xufTtcblxuLy8gZ2V0IFNWRyBwYXRoIG1vdm1lbWVudFxuZnVuY3Rpb24gZ2V0QXJyb3dNb3ZlbWVudHMoIHNoYXBlICkge1xuICAvLyB1c2Ugc2hhcGUgYXMgbW92ZW1lbnQgaWYgc3RyaW5nXG4gIGlmICggdHlwZW9mIHNoYXBlID09ICdzdHJpbmcnICkge1xuICAgIHJldHVybiBzaGFwZTtcbiAgfVxuICAvLyBjcmVhdGUgbW92ZW1lbnQgc3RyaW5nXG4gIHJldHVybiAnTSAnICsgc2hhcGUueDAgKyAnLDUwJyArXG4gICAgJyBMICcgKyBzaGFwZS54MSArICcsJyArICggc2hhcGUueTEgKyA1MCApICtcbiAgICAnIEwgJyArIHNoYXBlLngyICsgJywnICsgKCBzaGFwZS55MiArIDUwICkgK1xuICAgICcgTCAnICsgc2hhcGUueDMgKyAnLDUwICcgK1xuICAgICcgTCAnICsgc2hhcGUueDIgKyAnLCcgKyAoIDUwIC0gc2hhcGUueTIgKSArXG4gICAgJyBMICcgKyBzaGFwZS54MSArICcsJyArICggNTAgLSBzaGFwZS55MSApICtcbiAgICAnIFonO1xufVxuXG5QcmV2TmV4dEJ1dHRvbi5wcm90b3R5cGUuaGFuZGxlRXZlbnQgPSB1dGlscy5oYW5kbGVFdmVudDtcblxuUHJldk5leHRCdXR0b24ucHJvdG90eXBlLm9uY2xpY2sgPSBmdW5jdGlvbigpIHtcbiAgaWYgKCAhdGhpcy5pc0VuYWJsZWQgKSB7XG4gICAgcmV0dXJuO1xuICB9XG4gIHRoaXMucGFyZW50LnVpQ2hhbmdlKCk7XG4gIHZhciBtZXRob2QgPSB0aGlzLmlzUHJldmlvdXMgPyAncHJldmlvdXMnIDogJ25leHQnO1xuICB0aGlzLnBhcmVudFsgbWV0aG9kIF0oKTtcbn07XG5cbi8vIC0tLS0tICAtLS0tLSAvL1xuXG5QcmV2TmV4dEJ1dHRvbi5wcm90b3R5cGUuZW5hYmxlID0gZnVuY3Rpb24oKSB7XG4gIGlmICggdGhpcy5pc0VuYWJsZWQgKSB7XG4gICAgcmV0dXJuO1xuICB9XG4gIHRoaXMuZWxlbWVudC5kaXNhYmxlZCA9IGZhbHNlO1xuICB0aGlzLmlzRW5hYmxlZCA9IHRydWU7XG59O1xuXG5QcmV2TmV4dEJ1dHRvbi5wcm90b3R5cGUuZGlzYWJsZSA9IGZ1bmN0aW9uKCkge1xuICBpZiAoICF0aGlzLmlzRW5hYmxlZCApIHtcbiAgICByZXR1cm47XG4gIH1cbiAgdGhpcy5lbGVtZW50LmRpc2FibGVkID0gdHJ1ZTtcbiAgdGhpcy5pc0VuYWJsZWQgPSBmYWxzZTtcbn07XG5cblByZXZOZXh0QnV0dG9uLnByb3RvdHlwZS51cGRhdGUgPSBmdW5jdGlvbigpIHtcbiAgLy8gaW5kZXggb2YgZmlyc3Qgb3IgbGFzdCBzbGlkZSwgaWYgcHJldmlvdXMgb3IgbmV4dFxuICB2YXIgc2xpZGVzID0gdGhpcy5wYXJlbnQuc2xpZGVzO1xuICAvLyBlbmFibGUgaXMgd3JhcEFyb3VuZCBhbmQgYXQgbGVhc3QgMiBzbGlkZXNcbiAgaWYgKCB0aGlzLnBhcmVudC5vcHRpb25zLndyYXBBcm91bmQgJiYgc2xpZGVzLmxlbmd0aCA+IDEgKSB7XG4gICAgdGhpcy5lbmFibGUoKTtcbiAgICByZXR1cm47XG4gIH1cbiAgdmFyIGxhc3RJbmRleCA9IHNsaWRlcy5sZW5ndGggPyBzbGlkZXMubGVuZ3RoIC0gMSA6IDA7XG4gIHZhciBib3VuZEluZGV4ID0gdGhpcy5pc1ByZXZpb3VzID8gMCA6IGxhc3RJbmRleDtcbiAgdmFyIG1ldGhvZCA9IHRoaXMucGFyZW50LnNlbGVjdGVkSW5kZXggPT0gYm91bmRJbmRleCA/ICdkaXNhYmxlJyA6ICdlbmFibGUnO1xuICB0aGlzWyBtZXRob2QgXSgpO1xufTtcblxuUHJldk5leHRCdXR0b24ucHJvdG90eXBlLmRlc3Ryb3kgPSBmdW5jdGlvbigpIHtcbiAgdGhpcy5kZWFjdGl2YXRlKCk7XG4gIHRoaXMuYWxsT2ZmKCk7XG59O1xuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSBGbGlja2l0eSBwcm90b3R5cGUgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gLy9cblxudXRpbHMuZXh0ZW5kKCBGbGlja2l0eS5kZWZhdWx0cywge1xuICBwcmV2TmV4dEJ1dHRvbnM6IHRydWUsXG4gIGFycm93U2hhcGU6IHtcbiAgICB4MDogMTAsXG4gICAgeDE6IDYwLCB5MTogNTAsXG4gICAgeDI6IDcwLCB5MjogNDAsXG4gICAgeDM6IDMwLFxuICB9LFxufSApO1xuXG5GbGlja2l0eS5jcmVhdGVNZXRob2RzLnB1c2goJ19jcmVhdGVQcmV2TmV4dEJ1dHRvbnMnKTtcbnZhciBwcm90byA9IEZsaWNraXR5LnByb3RvdHlwZTtcblxucHJvdG8uX2NyZWF0ZVByZXZOZXh0QnV0dG9ucyA9IGZ1bmN0aW9uKCkge1xuICBpZiAoICF0aGlzLm9wdGlvbnMucHJldk5leHRCdXR0b25zICkge1xuICAgIHJldHVybjtcbiAgfVxuXG4gIHRoaXMucHJldkJ1dHRvbiA9IG5ldyBQcmV2TmV4dEJ1dHRvbiggLTEsIHRoaXMgKTtcbiAgdGhpcy5uZXh0QnV0dG9uID0gbmV3IFByZXZOZXh0QnV0dG9uKCAxLCB0aGlzICk7XG5cbiAgdGhpcy5vbiggJ2FjdGl2YXRlJywgdGhpcy5hY3RpdmF0ZVByZXZOZXh0QnV0dG9ucyApO1xufTtcblxucHJvdG8uYWN0aXZhdGVQcmV2TmV4dEJ1dHRvbnMgPSBmdW5jdGlvbigpIHtcbiAgdGhpcy5wcmV2QnV0dG9uLmFjdGl2YXRlKCk7XG4gIHRoaXMubmV4dEJ1dHRvbi5hY3RpdmF0ZSgpO1xuICB0aGlzLm9uKCAnZGVhY3RpdmF0ZScsIHRoaXMuZGVhY3RpdmF0ZVByZXZOZXh0QnV0dG9ucyApO1xufTtcblxucHJvdG8uZGVhY3RpdmF0ZVByZXZOZXh0QnV0dG9ucyA9IGZ1bmN0aW9uKCkge1xuICB0aGlzLnByZXZCdXR0b24uZGVhY3RpdmF0ZSgpO1xuICB0aGlzLm5leHRCdXR0b24uZGVhY3RpdmF0ZSgpO1xuICB0aGlzLm9mZiggJ2RlYWN0aXZhdGUnLCB0aGlzLmRlYWN0aXZhdGVQcmV2TmV4dEJ1dHRvbnMgKTtcbn07XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tICAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSAvL1xuXG5GbGlja2l0eS5QcmV2TmV4dEJ1dHRvbiA9IFByZXZOZXh0QnV0dG9uO1xuXG5yZXR1cm4gRmxpY2tpdHk7XG5cbn0gKSApO1xuIiwiLy8gcGFnZSBkb3RzXG4oIGZ1bmN0aW9uKCB3aW5kb3csIGZhY3RvcnkgKSB7XG4gIC8vIHVuaXZlcnNhbCBtb2R1bGUgZGVmaW5pdGlvblxuICBpZiAoIHR5cGVvZiBkZWZpbmUgPT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kICkge1xuICAgIC8vIEFNRFxuICAgIGRlZmluZSggW1xuICAgICAgJy4vZmxpY2tpdHknLFxuICAgICAgJ3VuaXBvaW50ZXIvdW5pcG9pbnRlcicsXG4gICAgICAnZml6enktdWktdXRpbHMvdXRpbHMnLFxuICAgIF0sIGZ1bmN0aW9uKCBGbGlja2l0eSwgVW5pcG9pbnRlciwgdXRpbHMgKSB7XG4gICAgICByZXR1cm4gZmFjdG9yeSggd2luZG93LCBGbGlja2l0eSwgVW5pcG9pbnRlciwgdXRpbHMgKTtcbiAgICB9ICk7XG4gIH0gZWxzZSBpZiAoIHR5cGVvZiBtb2R1bGUgPT0gJ29iamVjdCcgJiYgbW9kdWxlLmV4cG9ydHMgKSB7XG4gICAgLy8gQ29tbW9uSlNcbiAgICBtb2R1bGUuZXhwb3J0cyA9IGZhY3RvcnkoXG4gICAgICAgIHdpbmRvdyxcbiAgICAgICAgcmVxdWlyZSgnLi9mbGlja2l0eScpLFxuICAgICAgICByZXF1aXJlKCd1bmlwb2ludGVyJyksXG4gICAgICAgIHJlcXVpcmUoJ2Zpenp5LXVpLXV0aWxzJylcbiAgICApO1xuICB9IGVsc2Uge1xuICAgIC8vIGJyb3dzZXIgZ2xvYmFsXG4gICAgZmFjdG9yeShcbiAgICAgICAgd2luZG93LFxuICAgICAgICB3aW5kb3cuRmxpY2tpdHksXG4gICAgICAgIHdpbmRvdy5Vbmlwb2ludGVyLFxuICAgICAgICB3aW5kb3cuZml6enlVSVV0aWxzXG4gICAgKTtcbiAgfVxuXG59KCB3aW5kb3csIGZ1bmN0aW9uIGZhY3RvcnkoIHdpbmRvdywgRmxpY2tpdHksIFVuaXBvaW50ZXIsIHV0aWxzICkge1xuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSBQYWdlRG90cyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSAvL1xuXG4ndXNlIHN0cmljdCc7XG5cbmZ1bmN0aW9uIFBhZ2VEb3RzKCBwYXJlbnQgKSB7XG4gIHRoaXMucGFyZW50ID0gcGFyZW50O1xuICB0aGlzLl9jcmVhdGUoKTtcbn1cblxuUGFnZURvdHMucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZSggVW5pcG9pbnRlci5wcm90b3R5cGUgKTtcblxuUGFnZURvdHMucHJvdG90eXBlLl9jcmVhdGUgPSBmdW5jdGlvbigpIHtcbiAgLy8gY3JlYXRlIGhvbGRlciBlbGVtZW50XG4gIHRoaXMuaG9sZGVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnb2wnKTtcbiAgdGhpcy5ob2xkZXIuY2xhc3NOYW1lID0gJ2ZsaWNraXR5LXBhZ2UtZG90cyc7XG4gIC8vIGNyZWF0ZSBkb3RzLCBhcnJheSBvZiBlbGVtZW50c1xuICB0aGlzLmRvdHMgPSBbXTtcbiAgLy8gZXZlbnRzXG4gIHRoaXMuaGFuZGxlQ2xpY2sgPSB0aGlzLm9uQ2xpY2suYmluZCggdGhpcyApO1xuICB0aGlzLm9uKCAncG9pbnRlckRvd24nLCB0aGlzLnBhcmVudC5jaGlsZFVJUG9pbnRlckRvd24uYmluZCggdGhpcy5wYXJlbnQgKSApO1xufTtcblxuUGFnZURvdHMucHJvdG90eXBlLmFjdGl2YXRlID0gZnVuY3Rpb24oKSB7XG4gIHRoaXMuc2V0RG90cygpO1xuICB0aGlzLmhvbGRlci5hZGRFdmVudExpc3RlbmVyKCAnY2xpY2snLCB0aGlzLmhhbmRsZUNsaWNrICk7XG4gIHRoaXMuYmluZFN0YXJ0RXZlbnQoIHRoaXMuaG9sZGVyICk7XG4gIC8vIGFkZCB0byBET01cbiAgdGhpcy5wYXJlbnQuZWxlbWVudC5hcHBlbmRDaGlsZCggdGhpcy5ob2xkZXIgKTtcbn07XG5cblBhZ2VEb3RzLnByb3RvdHlwZS5kZWFjdGl2YXRlID0gZnVuY3Rpb24oKSB7XG4gIHRoaXMuaG9sZGVyLnJlbW92ZUV2ZW50TGlzdGVuZXIoICdjbGljaycsIHRoaXMuaGFuZGxlQ2xpY2sgKTtcbiAgdGhpcy51bmJpbmRTdGFydEV2ZW50KCB0aGlzLmhvbGRlciApO1xuICAvLyByZW1vdmUgZnJvbSBET01cbiAgdGhpcy5wYXJlbnQuZWxlbWVudC5yZW1vdmVDaGlsZCggdGhpcy5ob2xkZXIgKTtcbn07XG5cblBhZ2VEb3RzLnByb3RvdHlwZS5zZXREb3RzID0gZnVuY3Rpb24oKSB7XG4gIC8vIGdldCBkaWZmZXJlbmNlIGJldHdlZW4gbnVtYmVyIG9mIHNsaWRlcyBhbmQgbnVtYmVyIG9mIGRvdHNcbiAgdmFyIGRlbHRhID0gdGhpcy5wYXJlbnQuc2xpZGVzLmxlbmd0aCAtIHRoaXMuZG90cy5sZW5ndGg7XG4gIGlmICggZGVsdGEgPiAwICkge1xuICAgIHRoaXMuYWRkRG90cyggZGVsdGEgKTtcbiAgfSBlbHNlIGlmICggZGVsdGEgPCAwICkge1xuICAgIHRoaXMucmVtb3ZlRG90cyggLWRlbHRhICk7XG4gIH1cbn07XG5cblBhZ2VEb3RzLnByb3RvdHlwZS5hZGREb3RzID0gZnVuY3Rpb24oIGNvdW50ICkge1xuICB2YXIgZnJhZ21lbnQgPSBkb2N1bWVudC5jcmVhdGVEb2N1bWVudEZyYWdtZW50KCk7XG4gIHZhciBuZXdEb3RzID0gW107XG4gIHZhciBsZW5ndGggPSB0aGlzLmRvdHMubGVuZ3RoO1xuICB2YXIgbWF4ID0gbGVuZ3RoICsgY291bnQ7XG5cbiAgZm9yICggdmFyIGkgPSBsZW5ndGg7IGkgPCBtYXg7IGkrKyApIHtcbiAgICB2YXIgZG90ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnbGknKTtcbiAgICBkb3QuY2xhc3NOYW1lID0gJ2RvdCc7XG4gICAgZG90LnNldEF0dHJpYnV0ZSggJ2FyaWEtbGFiZWwnLCAnUGFnZSBkb3QgJyArICggaSArIDEgKSApO1xuICAgIGZyYWdtZW50LmFwcGVuZENoaWxkKCBkb3QgKTtcbiAgICBuZXdEb3RzLnB1c2goIGRvdCApO1xuICB9XG5cbiAgdGhpcy5ob2xkZXIuYXBwZW5kQ2hpbGQoIGZyYWdtZW50ICk7XG4gIHRoaXMuZG90cyA9IHRoaXMuZG90cy5jb25jYXQoIG5ld0RvdHMgKTtcbn07XG5cblBhZ2VEb3RzLnByb3RvdHlwZS5yZW1vdmVEb3RzID0gZnVuY3Rpb24oIGNvdW50ICkge1xuICAvLyByZW1vdmUgZnJvbSB0aGlzLmRvdHMgY29sbGVjdGlvblxuICB2YXIgcmVtb3ZlRG90cyA9IHRoaXMuZG90cy5zcGxpY2UoIHRoaXMuZG90cy5sZW5ndGggLSBjb3VudCwgY291bnQgKTtcbiAgLy8gcmVtb3ZlIGZyb20gRE9NXG4gIHJlbW92ZURvdHMuZm9yRWFjaCggZnVuY3Rpb24oIGRvdCApIHtcbiAgICB0aGlzLmhvbGRlci5yZW1vdmVDaGlsZCggZG90ICk7XG4gIH0sIHRoaXMgKTtcbn07XG5cblBhZ2VEb3RzLnByb3RvdHlwZS51cGRhdGVTZWxlY3RlZCA9IGZ1bmN0aW9uKCkge1xuICAvLyByZW1vdmUgc2VsZWN0ZWQgY2xhc3Mgb24gcHJldmlvdXNcbiAgaWYgKCB0aGlzLnNlbGVjdGVkRG90ICkge1xuICAgIHRoaXMuc2VsZWN0ZWREb3QuY2xhc3NOYW1lID0gJ2RvdCc7XG4gICAgdGhpcy5zZWxlY3RlZERvdC5yZW1vdmVBdHRyaWJ1dGUoJ2FyaWEtY3VycmVudCcpO1xuICB9XG4gIC8vIGRvbid0IHByb2NlZWQgaWYgbm8gZG90c1xuICBpZiAoICF0aGlzLmRvdHMubGVuZ3RoICkge1xuICAgIHJldHVybjtcbiAgfVxuICB0aGlzLnNlbGVjdGVkRG90ID0gdGhpcy5kb3RzWyB0aGlzLnBhcmVudC5zZWxlY3RlZEluZGV4IF07XG4gIHRoaXMuc2VsZWN0ZWREb3QuY2xhc3NOYW1lID0gJ2RvdCBpcy1zZWxlY3RlZCc7XG4gIHRoaXMuc2VsZWN0ZWREb3Quc2V0QXR0cmlidXRlKCAnYXJpYS1jdXJyZW50JywgJ3N0ZXAnICk7XG59O1xuXG5QYWdlRG90cy5wcm90b3R5cGUub25UYXAgPSAvLyBvbGQgbWV0aG9kIG5hbWUsIGJhY2t3YXJkcy1jb21wYXRpYmxlXG5QYWdlRG90cy5wcm90b3R5cGUub25DbGljayA9IGZ1bmN0aW9uKCBldmVudCApIHtcbiAgdmFyIHRhcmdldCA9IGV2ZW50LnRhcmdldDtcbiAgLy8gb25seSBjYXJlIGFib3V0IGRvdCBjbGlja3NcbiAgaWYgKCB0YXJnZXQubm9kZU5hbWUgIT0gJ0xJJyApIHtcbiAgICByZXR1cm47XG4gIH1cblxuICB0aGlzLnBhcmVudC51aUNoYW5nZSgpO1xuICB2YXIgaW5kZXggPSB0aGlzLmRvdHMuaW5kZXhPZiggdGFyZ2V0ICk7XG4gIHRoaXMucGFyZW50LnNlbGVjdCggaW5kZXggKTtcbn07XG5cblBhZ2VEb3RzLnByb3RvdHlwZS5kZXN0cm95ID0gZnVuY3Rpb24oKSB7XG4gIHRoaXMuZGVhY3RpdmF0ZSgpO1xuICB0aGlzLmFsbE9mZigpO1xufTtcblxuRmxpY2tpdHkuUGFnZURvdHMgPSBQYWdlRG90cztcblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gRmxpY2tpdHkgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gLy9cblxudXRpbHMuZXh0ZW5kKCBGbGlja2l0eS5kZWZhdWx0cywge1xuICBwYWdlRG90czogdHJ1ZSxcbn0gKTtcblxuRmxpY2tpdHkuY3JlYXRlTWV0aG9kcy5wdXNoKCdfY3JlYXRlUGFnZURvdHMnKTtcblxudmFyIHByb3RvID0gRmxpY2tpdHkucHJvdG90eXBlO1xuXG5wcm90by5fY3JlYXRlUGFnZURvdHMgPSBmdW5jdGlvbigpIHtcbiAgaWYgKCAhdGhpcy5vcHRpb25zLnBhZ2VEb3RzICkge1xuICAgIHJldHVybjtcbiAgfVxuICB0aGlzLnBhZ2VEb3RzID0gbmV3IFBhZ2VEb3RzKCB0aGlzICk7XG4gIC8vIGV2ZW50c1xuICB0aGlzLm9uKCAnYWN0aXZhdGUnLCB0aGlzLmFjdGl2YXRlUGFnZURvdHMgKTtcbiAgdGhpcy5vbiggJ3NlbGVjdCcsIHRoaXMudXBkYXRlU2VsZWN0ZWRQYWdlRG90cyApO1xuICB0aGlzLm9uKCAnY2VsbENoYW5nZScsIHRoaXMudXBkYXRlUGFnZURvdHMgKTtcbiAgdGhpcy5vbiggJ3Jlc2l6ZScsIHRoaXMudXBkYXRlUGFnZURvdHMgKTtcbiAgdGhpcy5vbiggJ2RlYWN0aXZhdGUnLCB0aGlzLmRlYWN0aXZhdGVQYWdlRG90cyApO1xufTtcblxucHJvdG8uYWN0aXZhdGVQYWdlRG90cyA9IGZ1bmN0aW9uKCkge1xuICB0aGlzLnBhZ2VEb3RzLmFjdGl2YXRlKCk7XG59O1xuXG5wcm90by51cGRhdGVTZWxlY3RlZFBhZ2VEb3RzID0gZnVuY3Rpb24oKSB7XG4gIHRoaXMucGFnZURvdHMudXBkYXRlU2VsZWN0ZWQoKTtcbn07XG5cbnByb3RvLnVwZGF0ZVBhZ2VEb3RzID0gZnVuY3Rpb24oKSB7XG4gIHRoaXMucGFnZURvdHMuc2V0RG90cygpO1xufTtcblxucHJvdG8uZGVhY3RpdmF0ZVBhZ2VEb3RzID0gZnVuY3Rpb24oKSB7XG4gIHRoaXMucGFnZURvdHMuZGVhY3RpdmF0ZSgpO1xufTtcblxuLy8gLS0tLS0gIC0tLS0tIC8vXG5cbkZsaWNraXR5LlBhZ2VEb3RzID0gUGFnZURvdHM7XG5cbnJldHVybiBGbGlja2l0eTtcblxufSApICk7XG4iLCIvLyBwbGF5ZXIgJiBhdXRvUGxheVxuKCBmdW5jdGlvbiggd2luZG93LCBmYWN0b3J5ICkge1xuICAvLyB1bml2ZXJzYWwgbW9kdWxlIGRlZmluaXRpb25cbiAgaWYgKCB0eXBlb2YgZGVmaW5lID09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCApIHtcbiAgICAvLyBBTURcbiAgICBkZWZpbmUoIFtcbiAgICAgICdldi1lbWl0dGVyL2V2LWVtaXR0ZXInLFxuICAgICAgJ2Zpenp5LXVpLXV0aWxzL3V0aWxzJyxcbiAgICAgICcuL2ZsaWNraXR5JyxcbiAgICBdLCBmdW5jdGlvbiggRXZFbWl0dGVyLCB1dGlscywgRmxpY2tpdHkgKSB7XG4gICAgICByZXR1cm4gZmFjdG9yeSggRXZFbWl0dGVyLCB1dGlscywgRmxpY2tpdHkgKTtcbiAgICB9ICk7XG4gIH0gZWxzZSBpZiAoIHR5cGVvZiBtb2R1bGUgPT0gJ29iamVjdCcgJiYgbW9kdWxlLmV4cG9ydHMgKSB7XG4gICAgLy8gQ29tbW9uSlNcbiAgICBtb2R1bGUuZXhwb3J0cyA9IGZhY3RvcnkoXG4gICAgICAgIHJlcXVpcmUoJ2V2LWVtaXR0ZXInKSxcbiAgICAgICAgcmVxdWlyZSgnZml6enktdWktdXRpbHMnKSxcbiAgICAgICAgcmVxdWlyZSgnLi9mbGlja2l0eScpXG4gICAgKTtcbiAgfSBlbHNlIHtcbiAgICAvLyBicm93c2VyIGdsb2JhbFxuICAgIGZhY3RvcnkoXG4gICAgICAgIHdpbmRvdy5FdkVtaXR0ZXIsXG4gICAgICAgIHdpbmRvdy5maXp6eVVJVXRpbHMsXG4gICAgICAgIHdpbmRvdy5GbGlja2l0eVxuICAgICk7XG4gIH1cblxufSggd2luZG93LCBmdW5jdGlvbiBmYWN0b3J5KCBFdkVtaXR0ZXIsIHV0aWxzLCBGbGlja2l0eSApIHtcblxuJ3VzZSBzdHJpY3QnO1xuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSBQbGF5ZXIgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gLy9cblxuZnVuY3Rpb24gUGxheWVyKCBwYXJlbnQgKSB7XG4gIHRoaXMucGFyZW50ID0gcGFyZW50O1xuICB0aGlzLnN0YXRlID0gJ3N0b3BwZWQnO1xuICAvLyB2aXNpYmlsaXR5IGNoYW5nZSBldmVudCBoYW5kbGVyXG4gIHRoaXMub25WaXNpYmlsaXR5Q2hhbmdlID0gdGhpcy52aXNpYmlsaXR5Q2hhbmdlLmJpbmQoIHRoaXMgKTtcbiAgdGhpcy5vblZpc2liaWxpdHlQbGF5ID0gdGhpcy52aXNpYmlsaXR5UGxheS5iaW5kKCB0aGlzICk7XG59XG5cblBsYXllci5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKCBFdkVtaXR0ZXIucHJvdG90eXBlICk7XG5cbi8vIHN0YXJ0IHBsYXlcblBsYXllci5wcm90b3R5cGUucGxheSA9IGZ1bmN0aW9uKCkge1xuICBpZiAoIHRoaXMuc3RhdGUgPT0gJ3BsYXlpbmcnICkge1xuICAgIHJldHVybjtcbiAgfVxuICAvLyBkbyBub3QgcGxheSBpZiBwYWdlIGlzIGhpZGRlbiwgc3RhcnQgcGxheWluZyB3aGVuIHBhZ2UgaXMgdmlzaWJsZVxuICB2YXIgaXNQYWdlSGlkZGVuID0gZG9jdW1lbnQuaGlkZGVuO1xuICBpZiAoIGlzUGFnZUhpZGRlbiApIHtcbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCAndmlzaWJpbGl0eWNoYW5nZScsIHRoaXMub25WaXNpYmlsaXR5UGxheSApO1xuICAgIHJldHVybjtcbiAgfVxuXG4gIHRoaXMuc3RhdGUgPSAncGxheWluZyc7XG4gIC8vIGxpc3RlbiB0byB2aXNpYmlsaXR5IGNoYW5nZVxuICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCAndmlzaWJpbGl0eWNoYW5nZScsIHRoaXMub25WaXNpYmlsaXR5Q2hhbmdlICk7XG4gIC8vIHN0YXJ0IHRpY2tpbmdcbiAgdGhpcy50aWNrKCk7XG59O1xuXG5QbGF5ZXIucHJvdG90eXBlLnRpY2sgPSBmdW5jdGlvbigpIHtcbiAgLy8gZG8gbm90IHRpY2sgaWYgbm90IHBsYXlpbmdcbiAgaWYgKCB0aGlzLnN0YXRlICE9ICdwbGF5aW5nJyApIHtcbiAgICByZXR1cm47XG4gIH1cblxuICB2YXIgdGltZSA9IHRoaXMucGFyZW50Lm9wdGlvbnMuYXV0b1BsYXk7XG4gIC8vIGRlZmF1bHQgdG8gMyBzZWNvbmRzXG4gIHRpbWUgPSB0eXBlb2YgdGltZSA9PSAnbnVtYmVyJyA/IHRpbWUgOiAzMDAwO1xuICB2YXIgX3RoaXMgPSB0aGlzO1xuICAvLyBIQUNLOiByZXNldCB0aWNrcyBpZiBzdG9wcGVkIGFuZCBzdGFydGVkIHdpdGhpbiBpbnRlcnZhbFxuICB0aGlzLmNsZWFyKCk7XG4gIHRoaXMudGltZW91dCA9IHNldFRpbWVvdXQoIGZ1bmN0aW9uKCkge1xuICAgIF90aGlzLnBhcmVudC5uZXh0KCB0cnVlICk7XG4gICAgX3RoaXMudGljaygpO1xuICB9LCB0aW1lICk7XG59O1xuXG5QbGF5ZXIucHJvdG90eXBlLnN0b3AgPSBmdW5jdGlvbigpIHtcbiAgdGhpcy5zdGF0ZSA9ICdzdG9wcGVkJztcbiAgdGhpcy5jbGVhcigpO1xuICAvLyByZW1vdmUgdmlzaWJpbGl0eSBjaGFuZ2UgZXZlbnRcbiAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lciggJ3Zpc2liaWxpdHljaGFuZ2UnLCB0aGlzLm9uVmlzaWJpbGl0eUNoYW5nZSApO1xufTtcblxuUGxheWVyLnByb3RvdHlwZS5jbGVhciA9IGZ1bmN0aW9uKCkge1xuICBjbGVhclRpbWVvdXQoIHRoaXMudGltZW91dCApO1xufTtcblxuUGxheWVyLnByb3RvdHlwZS5wYXVzZSA9IGZ1bmN0aW9uKCkge1xuICBpZiAoIHRoaXMuc3RhdGUgPT0gJ3BsYXlpbmcnICkge1xuICAgIHRoaXMuc3RhdGUgPSAncGF1c2VkJztcbiAgICB0aGlzLmNsZWFyKCk7XG4gIH1cbn07XG5cblBsYXllci5wcm90b3R5cGUudW5wYXVzZSA9IGZ1bmN0aW9uKCkge1xuICAvLyByZS1zdGFydCBwbGF5IGlmIHBhdXNlZFxuICBpZiAoIHRoaXMuc3RhdGUgPT0gJ3BhdXNlZCcgKSB7XG4gICAgdGhpcy5wbGF5KCk7XG4gIH1cbn07XG5cbi8vIHBhdXNlIGlmIHBhZ2UgdmlzaWJpbGl0eSBpcyBoaWRkZW4sIHVucGF1c2UgaWYgdmlzaWJsZVxuUGxheWVyLnByb3RvdHlwZS52aXNpYmlsaXR5Q2hhbmdlID0gZnVuY3Rpb24oKSB7XG4gIHZhciBpc1BhZ2VIaWRkZW4gPSBkb2N1bWVudC5oaWRkZW47XG4gIHRoaXNbIGlzUGFnZUhpZGRlbiA/ICdwYXVzZScgOiAndW5wYXVzZScgXSgpO1xufTtcblxuUGxheWVyLnByb3RvdHlwZS52aXNpYmlsaXR5UGxheSA9IGZ1bmN0aW9uKCkge1xuICB0aGlzLnBsYXkoKTtcbiAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lciggJ3Zpc2liaWxpdHljaGFuZ2UnLCB0aGlzLm9uVmlzaWJpbGl0eVBsYXkgKTtcbn07XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIEZsaWNraXR5IC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIC8vXG5cbnV0aWxzLmV4dGVuZCggRmxpY2tpdHkuZGVmYXVsdHMsIHtcbiAgcGF1c2VBdXRvUGxheU9uSG92ZXI6IHRydWUsXG59ICk7XG5cbkZsaWNraXR5LmNyZWF0ZU1ldGhvZHMucHVzaCgnX2NyZWF0ZVBsYXllcicpO1xudmFyIHByb3RvID0gRmxpY2tpdHkucHJvdG90eXBlO1xuXG5wcm90by5fY3JlYXRlUGxheWVyID0gZnVuY3Rpb24oKSB7XG4gIHRoaXMucGxheWVyID0gbmV3IFBsYXllciggdGhpcyApO1xuXG4gIHRoaXMub24oICdhY3RpdmF0ZScsIHRoaXMuYWN0aXZhdGVQbGF5ZXIgKTtcbiAgdGhpcy5vbiggJ3VpQ2hhbmdlJywgdGhpcy5zdG9wUGxheWVyICk7XG4gIHRoaXMub24oICdwb2ludGVyRG93bicsIHRoaXMuc3RvcFBsYXllciApO1xuICB0aGlzLm9uKCAnZGVhY3RpdmF0ZScsIHRoaXMuZGVhY3RpdmF0ZVBsYXllciApO1xufTtcblxucHJvdG8uYWN0aXZhdGVQbGF5ZXIgPSBmdW5jdGlvbigpIHtcbiAgaWYgKCAhdGhpcy5vcHRpb25zLmF1dG9QbGF5ICkge1xuICAgIHJldHVybjtcbiAgfVxuICB0aGlzLnBsYXllci5wbGF5KCk7XG4gIHRoaXMuZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCAnbW91c2VlbnRlcicsIHRoaXMgKTtcbn07XG5cbi8vIFBsYXllciBBUEksIGRvbid0IGhhdGUgdGhlIC4uLiB0aGFua3MgSSBrbm93IHdoZXJlIHRoZSBkb29yIGlzXG5cbnByb3RvLnBsYXlQbGF5ZXIgPSBmdW5jdGlvbigpIHtcbiAgdGhpcy5wbGF5ZXIucGxheSgpO1xufTtcblxucHJvdG8uc3RvcFBsYXllciA9IGZ1bmN0aW9uKCkge1xuICB0aGlzLnBsYXllci5zdG9wKCk7XG59O1xuXG5wcm90by5wYXVzZVBsYXllciA9IGZ1bmN0aW9uKCkge1xuICB0aGlzLnBsYXllci5wYXVzZSgpO1xufTtcblxucHJvdG8udW5wYXVzZVBsYXllciA9IGZ1bmN0aW9uKCkge1xuICB0aGlzLnBsYXllci51bnBhdXNlKCk7XG59O1xuXG5wcm90by5kZWFjdGl2YXRlUGxheWVyID0gZnVuY3Rpb24oKSB7XG4gIHRoaXMucGxheWVyLnN0b3AoKTtcbiAgdGhpcy5lbGVtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoICdtb3VzZWVudGVyJywgdGhpcyApO1xufTtcblxuLy8gLS0tLS0gbW91c2VlbnRlci9sZWF2ZSAtLS0tLSAvL1xuXG4vLyBwYXVzZSBhdXRvLXBsYXkgb24gaG92ZXJcbnByb3RvLm9ubW91c2VlbnRlciA9IGZ1bmN0aW9uKCkge1xuICBpZiAoICF0aGlzLm9wdGlvbnMucGF1c2VBdXRvUGxheU9uSG92ZXIgKSB7XG4gICAgcmV0dXJuO1xuICB9XG4gIHRoaXMucGxheWVyLnBhdXNlKCk7XG4gIHRoaXMuZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCAnbW91c2VsZWF2ZScsIHRoaXMgKTtcbn07XG5cbi8vIHJlc3VtZSBhdXRvLXBsYXkgb24gaG92ZXIgb2ZmXG5wcm90by5vbm1vdXNlbGVhdmUgPSBmdW5jdGlvbigpIHtcbiAgdGhpcy5wbGF5ZXIudW5wYXVzZSgpO1xuICB0aGlzLmVsZW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lciggJ21vdXNlbGVhdmUnLCB0aGlzICk7XG59O1xuXG4vLyAtLS0tLSAgLS0tLS0gLy9cblxuRmxpY2tpdHkuUGxheWVyID0gUGxheWVyO1xuXG5yZXR1cm4gRmxpY2tpdHk7XG5cbn0gKSApO1xuIiwiLy8gYWRkLCByZW1vdmUgY2VsbFxuKCBmdW5jdGlvbiggd2luZG93LCBmYWN0b3J5ICkge1xuICAvLyB1bml2ZXJzYWwgbW9kdWxlIGRlZmluaXRpb25cbiAgaWYgKCB0eXBlb2YgZGVmaW5lID09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCApIHtcbiAgICAvLyBBTURcbiAgICBkZWZpbmUoIFtcbiAgICAgICcuL2ZsaWNraXR5JyxcbiAgICAgICdmaXp6eS11aS11dGlscy91dGlscycsXG4gICAgXSwgZnVuY3Rpb24oIEZsaWNraXR5LCB1dGlscyApIHtcbiAgICAgIHJldHVybiBmYWN0b3J5KCB3aW5kb3csIEZsaWNraXR5LCB1dGlscyApO1xuICAgIH0gKTtcbiAgfSBlbHNlIGlmICggdHlwZW9mIG1vZHVsZSA9PSAnb2JqZWN0JyAmJiBtb2R1bGUuZXhwb3J0cyApIHtcbiAgICAvLyBDb21tb25KU1xuICAgIG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeShcbiAgICAgICAgd2luZG93LFxuICAgICAgICByZXF1aXJlKCcuL2ZsaWNraXR5JyksXG4gICAgICAgIHJlcXVpcmUoJ2Zpenp5LXVpLXV0aWxzJylcbiAgICApO1xuICB9IGVsc2Uge1xuICAgIC8vIGJyb3dzZXIgZ2xvYmFsXG4gICAgZmFjdG9yeShcbiAgICAgICAgd2luZG93LFxuICAgICAgICB3aW5kb3cuRmxpY2tpdHksXG4gICAgICAgIHdpbmRvdy5maXp6eVVJVXRpbHNcbiAgICApO1xuICB9XG5cbn0oIHdpbmRvdywgZnVuY3Rpb24gZmFjdG9yeSggd2luZG93LCBGbGlja2l0eSwgdXRpbHMgKSB7XG5cbid1c2Ugc3RyaWN0JztcblxuLy8gYXBwZW5kIGNlbGxzIHRvIGEgZG9jdW1lbnQgZnJhZ21lbnRcbmZ1bmN0aW9uIGdldENlbGxzRnJhZ21lbnQoIGNlbGxzICkge1xuICB2YXIgZnJhZ21lbnQgPSBkb2N1bWVudC5jcmVhdGVEb2N1bWVudEZyYWdtZW50KCk7XG4gIGNlbGxzLmZvckVhY2goIGZ1bmN0aW9uKCBjZWxsICkge1xuICAgIGZyYWdtZW50LmFwcGVuZENoaWxkKCBjZWxsLmVsZW1lbnQgKTtcbiAgfSApO1xuICByZXR1cm4gZnJhZ21lbnQ7XG59XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIGFkZC9yZW1vdmUgY2VsbCBwcm90b3R5cGUgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gLy9cblxudmFyIHByb3RvID0gRmxpY2tpdHkucHJvdG90eXBlO1xuXG4vKipcbiAqIEluc2VydCwgcHJlcGVuZCwgb3IgYXBwZW5kIGNlbGxzXG4gKiBAcGFyYW0ge1tFbGVtZW50LCBBcnJheSwgTm9kZUxpc3RdfSBlbGVtcyAtIEVsZW1lbnRzIHRvIGluc2VydFxuICogQHBhcmFtIHtJbnRlZ2VyfSBpbmRleCAtIFplcm8tYmFzZWQgbnVtYmVyIHRvIGluc2VydFxuICovXG5wcm90by5pbnNlcnQgPSBmdW5jdGlvbiggZWxlbXMsIGluZGV4ICkge1xuICB2YXIgY2VsbHMgPSB0aGlzLl9tYWtlQ2VsbHMoIGVsZW1zICk7XG4gIGlmICggIWNlbGxzIHx8ICFjZWxscy5sZW5ndGggKSB7XG4gICAgcmV0dXJuO1xuICB9XG4gIHZhciBsZW4gPSB0aGlzLmNlbGxzLmxlbmd0aDtcbiAgLy8gZGVmYXVsdCB0byBhcHBlbmRcbiAgaW5kZXggPSBpbmRleCA9PT0gdW5kZWZpbmVkID8gbGVuIDogaW5kZXg7XG4gIC8vIGFkZCBjZWxscyB3aXRoIGRvY3VtZW50IGZyYWdtZW50XG4gIHZhciBmcmFnbWVudCA9IGdldENlbGxzRnJhZ21lbnQoIGNlbGxzICk7XG4gIC8vIGFwcGVuZCB0byBzbGlkZXJcbiAgdmFyIGlzQXBwZW5kID0gaW5kZXggPT0gbGVuO1xuICBpZiAoIGlzQXBwZW5kICkge1xuICAgIHRoaXMuc2xpZGVyLmFwcGVuZENoaWxkKCBmcmFnbWVudCApO1xuICB9IGVsc2Uge1xuICAgIHZhciBpbnNlcnRDZWxsRWxlbWVudCA9IHRoaXMuY2VsbHNbIGluZGV4IF0uZWxlbWVudDtcbiAgICB0aGlzLnNsaWRlci5pbnNlcnRCZWZvcmUoIGZyYWdtZW50LCBpbnNlcnRDZWxsRWxlbWVudCApO1xuICB9XG4gIC8vIGFkZCB0byB0aGlzLmNlbGxzXG4gIGlmICggaW5kZXggPT09IDAgKSB7XG4gICAgLy8gcHJlcGVuZCwgYWRkIHRvIHN0YXJ0XG4gICAgdGhpcy5jZWxscyA9IGNlbGxzLmNvbmNhdCggdGhpcy5jZWxscyApO1xuICB9IGVsc2UgaWYgKCBpc0FwcGVuZCApIHtcbiAgICAvLyBhcHBlbmQsIGFkZCB0byBlbmRcbiAgICB0aGlzLmNlbGxzID0gdGhpcy5jZWxscy5jb25jYXQoIGNlbGxzICk7XG4gIH0gZWxzZSB7XG4gICAgLy8gaW5zZXJ0IGluIHRoaXMuY2VsbHNcbiAgICB2YXIgZW5kQ2VsbHMgPSB0aGlzLmNlbGxzLnNwbGljZSggaW5kZXgsIGxlbiAtIGluZGV4ICk7XG4gICAgdGhpcy5jZWxscyA9IHRoaXMuY2VsbHMuY29uY2F0KCBjZWxscyApLmNvbmNhdCggZW5kQ2VsbHMgKTtcbiAgfVxuXG4gIHRoaXMuX3NpemVDZWxscyggY2VsbHMgKTtcbiAgdGhpcy5jZWxsQ2hhbmdlKCBpbmRleCwgdHJ1ZSApO1xufTtcblxucHJvdG8uYXBwZW5kID0gZnVuY3Rpb24oIGVsZW1zICkge1xuICB0aGlzLmluc2VydCggZWxlbXMsIHRoaXMuY2VsbHMubGVuZ3RoICk7XG59O1xuXG5wcm90by5wcmVwZW5kID0gZnVuY3Rpb24oIGVsZW1zICkge1xuICB0aGlzLmluc2VydCggZWxlbXMsIDAgKTtcbn07XG5cbi8qKlxuICogUmVtb3ZlIGNlbGxzXG4gKiBAcGFyYW0ge1tFbGVtZW50LCBBcnJheSwgTm9kZUxpc3RdfSBlbGVtcyAtIEVMZW1lbnRzIHRvIHJlbW92ZVxuICovXG5wcm90by5yZW1vdmUgPSBmdW5jdGlvbiggZWxlbXMgKSB7XG4gIHZhciBjZWxscyA9IHRoaXMuZ2V0Q2VsbHMoIGVsZW1zICk7XG4gIGlmICggIWNlbGxzIHx8ICFjZWxscy5sZW5ndGggKSB7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgdmFyIG1pbkNlbGxJbmRleCA9IHRoaXMuY2VsbHMubGVuZ3RoIC0gMTtcbiAgLy8gcmVtb3ZlIGNlbGxzIGZyb20gY29sbGVjdGlvbiAmIERPTVxuICBjZWxscy5mb3JFYWNoKCBmdW5jdGlvbiggY2VsbCApIHtcbiAgICBjZWxsLnJlbW92ZSgpO1xuICAgIHZhciBpbmRleCA9IHRoaXMuY2VsbHMuaW5kZXhPZiggY2VsbCApO1xuICAgIG1pbkNlbGxJbmRleCA9IE1hdGgubWluKCBpbmRleCwgbWluQ2VsbEluZGV4ICk7XG4gICAgdXRpbHMucmVtb3ZlRnJvbSggdGhpcy5jZWxscywgY2VsbCApO1xuICB9LCB0aGlzICk7XG5cbiAgdGhpcy5jZWxsQ2hhbmdlKCBtaW5DZWxsSW5kZXgsIHRydWUgKTtcbn07XG5cbi8qKlxuICogbG9naWMgdG8gYmUgcnVuIGFmdGVyIGEgY2VsbCdzIHNpemUgY2hhbmdlc1xuICogQHBhcmFtIHtFbGVtZW50fSBlbGVtIC0gY2VsbCdzIGVsZW1lbnRcbiAqL1xucHJvdG8uY2VsbFNpemVDaGFuZ2UgPSBmdW5jdGlvbiggZWxlbSApIHtcbiAgdmFyIGNlbGwgPSB0aGlzLmdldENlbGwoIGVsZW0gKTtcbiAgaWYgKCAhY2VsbCApIHtcbiAgICByZXR1cm47XG4gIH1cbiAgY2VsbC5nZXRTaXplKCk7XG5cbiAgdmFyIGluZGV4ID0gdGhpcy5jZWxscy5pbmRleE9mKCBjZWxsICk7XG4gIHRoaXMuY2VsbENoYW5nZSggaW5kZXggKTtcbn07XG5cbi8qKlxuICogbG9naWMgYW55IHRpbWUgYSBjZWxsIGlzIGNoYW5nZWQ6IGFkZGVkLCByZW1vdmVkLCBvciBzaXplIGNoYW5nZWRcbiAqIEBwYXJhbSB7SW50ZWdlcn0gY2hhbmdlZENlbGxJbmRleCAtIGluZGV4IG9mIHRoZSBjaGFuZ2VkIGNlbGwsIG9wdGlvbmFsXG4gKiBAcGFyYW0ge0Jvb2xlYW59IGlzUG9zaXRpb25pbmdTbGlkZXIgLSBQb3NpdGlvbnMgc2xpZGVyIGFmdGVyIHNlbGVjdGlvblxuICovXG5wcm90by5jZWxsQ2hhbmdlID0gZnVuY3Rpb24oIGNoYW5nZWRDZWxsSW5kZXgsIGlzUG9zaXRpb25pbmdTbGlkZXIgKSB7XG4gIHZhciBwcmV2U2VsZWN0ZWRFbGVtID0gdGhpcy5zZWxlY3RlZEVsZW1lbnQ7XG4gIHRoaXMuX3Bvc2l0aW9uQ2VsbHMoIGNoYW5nZWRDZWxsSW5kZXggKTtcbiAgdGhpcy5fZ2V0V3JhcFNoaWZ0Q2VsbHMoKTtcbiAgdGhpcy5zZXRHYWxsZXJ5U2l6ZSgpO1xuICAvLyB1cGRhdGUgc2VsZWN0ZWRJbmRleFxuICAvLyB0cnkgdG8gbWFpbnRhaW4gcG9zaXRpb24gJiBzZWxlY3QgcHJldmlvdXMgc2VsZWN0ZWQgZWxlbWVudFxuICB2YXIgY2VsbCA9IHRoaXMuZ2V0Q2VsbCggcHJldlNlbGVjdGVkRWxlbSApO1xuICBpZiAoIGNlbGwgKSB7XG4gICAgdGhpcy5zZWxlY3RlZEluZGV4ID0gdGhpcy5nZXRDZWxsU2xpZGVJbmRleCggY2VsbCApO1xuICB9XG4gIHRoaXMuc2VsZWN0ZWRJbmRleCA9IE1hdGgubWluKCB0aGlzLnNsaWRlcy5sZW5ndGggLSAxLCB0aGlzLnNlbGVjdGVkSW5kZXggKTtcblxuICB0aGlzLmVtaXRFdmVudCggJ2NlbGxDaGFuZ2UnLCBbIGNoYW5nZWRDZWxsSW5kZXggXSApO1xuICAvLyBwb3NpdGlvbiBzbGlkZXJcbiAgdGhpcy5zZWxlY3QoIHRoaXMuc2VsZWN0ZWRJbmRleCApO1xuICAvLyBkbyBub3QgcG9zaXRpb24gc2xpZGVyIGFmdGVyIGxhenkgbG9hZFxuICBpZiAoIGlzUG9zaXRpb25pbmdTbGlkZXIgKSB7XG4gICAgdGhpcy5wb3NpdGlvblNsaWRlckF0U2VsZWN0ZWQoKTtcbiAgfVxufTtcblxuLy8gLS0tLS0gIC0tLS0tIC8vXG5cbnJldHVybiBGbGlja2l0eTtcblxufSApICk7XG4iLCIvLyBsYXp5bG9hZFxuKCBmdW5jdGlvbiggd2luZG93LCBmYWN0b3J5ICkge1xuICAvLyB1bml2ZXJzYWwgbW9kdWxlIGRlZmluaXRpb25cbiAgaWYgKCB0eXBlb2YgZGVmaW5lID09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCApIHtcbiAgICAvLyBBTURcbiAgICBkZWZpbmUoIFtcbiAgICAgICcuL2ZsaWNraXR5JyxcbiAgICAgICdmaXp6eS11aS11dGlscy91dGlscycsXG4gICAgXSwgZnVuY3Rpb24oIEZsaWNraXR5LCB1dGlscyApIHtcbiAgICAgIHJldHVybiBmYWN0b3J5KCB3aW5kb3csIEZsaWNraXR5LCB1dGlscyApO1xuICAgIH0gKTtcbiAgfSBlbHNlIGlmICggdHlwZW9mIG1vZHVsZSA9PSAnb2JqZWN0JyAmJiBtb2R1bGUuZXhwb3J0cyApIHtcbiAgICAvLyBDb21tb25KU1xuICAgIG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeShcbiAgICAgICAgd2luZG93LFxuICAgICAgICByZXF1aXJlKCcuL2ZsaWNraXR5JyksXG4gICAgICAgIHJlcXVpcmUoJ2Zpenp5LXVpLXV0aWxzJylcbiAgICApO1xuICB9IGVsc2Uge1xuICAgIC8vIGJyb3dzZXIgZ2xvYmFsXG4gICAgZmFjdG9yeShcbiAgICAgICAgd2luZG93LFxuICAgICAgICB3aW5kb3cuRmxpY2tpdHksXG4gICAgICAgIHdpbmRvdy5maXp6eVVJVXRpbHNcbiAgICApO1xuICB9XG5cbn0oIHdpbmRvdywgZnVuY3Rpb24gZmFjdG9yeSggd2luZG93LCBGbGlja2l0eSwgdXRpbHMgKSB7XG4ndXNlIHN0cmljdCc7XG5cbkZsaWNraXR5LmNyZWF0ZU1ldGhvZHMucHVzaCgnX2NyZWF0ZUxhenlsb2FkJyk7XG52YXIgcHJvdG8gPSBGbGlja2l0eS5wcm90b3R5cGU7XG5cbnByb3RvLl9jcmVhdGVMYXp5bG9hZCA9IGZ1bmN0aW9uKCkge1xuICB0aGlzLm9uKCAnc2VsZWN0JywgdGhpcy5sYXp5TG9hZCApO1xufTtcblxucHJvdG8ubGF6eUxvYWQgPSBmdW5jdGlvbigpIHtcbiAgdmFyIGxhenlMb2FkID0gdGhpcy5vcHRpb25zLmxhenlMb2FkO1xuICBpZiAoICFsYXp5TG9hZCApIHtcbiAgICByZXR1cm47XG4gIH1cbiAgLy8gZ2V0IGFkamFjZW50IGNlbGxzLCB1c2UgbGF6eUxvYWQgb3B0aW9uIGZvciBhZGphY2VudCBjb3VudFxuICB2YXIgYWRqQ291bnQgPSB0eXBlb2YgbGF6eUxvYWQgPT0gJ251bWJlcicgPyBsYXp5TG9hZCA6IDA7XG4gIHZhciBjZWxsRWxlbXMgPSB0aGlzLmdldEFkamFjZW50Q2VsbEVsZW1lbnRzKCBhZGpDb3VudCApO1xuICAvLyBnZXQgbGF6eSBpbWFnZXMgaW4gdGhvc2UgY2VsbHNcbiAgdmFyIGxhenlJbWFnZXMgPSBbXTtcbiAgY2VsbEVsZW1zLmZvckVhY2goIGZ1bmN0aW9uKCBjZWxsRWxlbSApIHtcbiAgICB2YXIgbGF6eUNlbGxJbWFnZXMgPSBnZXRDZWxsTGF6eUltYWdlcyggY2VsbEVsZW0gKTtcbiAgICBsYXp5SW1hZ2VzID0gbGF6eUltYWdlcy5jb25jYXQoIGxhenlDZWxsSW1hZ2VzICk7XG4gIH0gKTtcbiAgLy8gbG9hZCBsYXp5IGltYWdlc1xuICBsYXp5SW1hZ2VzLmZvckVhY2goIGZ1bmN0aW9uKCBpbWcgKSB7XG4gICAgbmV3IExhenlMb2FkZXIoIGltZywgdGhpcyApO1xuICB9LCB0aGlzICk7XG59O1xuXG5mdW5jdGlvbiBnZXRDZWxsTGF6eUltYWdlcyggY2VsbEVsZW0gKSB7XG4gIC8vIGNoZWNrIGlmIGNlbGwgZWxlbWVudCBpcyBsYXp5IGltYWdlXG4gIGlmICggY2VsbEVsZW0ubm9kZU5hbWUgPT0gJ0lNRycgKSB7XG4gICAgdmFyIGxhenlsb2FkQXR0ciA9IGNlbGxFbGVtLmdldEF0dHJpYnV0ZSgnZGF0YS1mbGlja2l0eS1sYXp5bG9hZCcpO1xuICAgIHZhciBzcmNBdHRyID0gY2VsbEVsZW0uZ2V0QXR0cmlidXRlKCdkYXRhLWZsaWNraXR5LWxhenlsb2FkLXNyYycpO1xuICAgIHZhciBzcmNzZXRBdHRyID0gY2VsbEVsZW0uZ2V0QXR0cmlidXRlKCdkYXRhLWZsaWNraXR5LWxhenlsb2FkLXNyY3NldCcpO1xuICAgIGlmICggbGF6eWxvYWRBdHRyIHx8IHNyY0F0dHIgfHwgc3Jjc2V0QXR0ciApIHtcbiAgICAgIHJldHVybiBbIGNlbGxFbGVtIF07XG4gICAgfVxuICB9XG4gIC8vIHNlbGVjdCBsYXp5IGltYWdlcyBpbiBjZWxsXG4gIHZhciBsYXp5U2VsZWN0b3IgPSAnaW1nW2RhdGEtZmxpY2tpdHktbGF6eWxvYWRdLCAnICtcbiAgICAnaW1nW2RhdGEtZmxpY2tpdHktbGF6eWxvYWQtc3JjXSwgaW1nW2RhdGEtZmxpY2tpdHktbGF6eWxvYWQtc3Jjc2V0XSc7XG4gIHZhciBpbWdzID0gY2VsbEVsZW0ucXVlcnlTZWxlY3RvckFsbCggbGF6eVNlbGVjdG9yICk7XG4gIHJldHVybiB1dGlscy5tYWtlQXJyYXkoIGltZ3MgKTtcbn1cblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gTGF6eUxvYWRlciAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSAvL1xuXG4vKipcbiAqIGNsYXNzIHRvIGhhbmRsZSBsb2FkaW5nIGltYWdlc1xuICogQHBhcmFtIHtJbWFnZX0gaW1nIC0gSW1hZ2UgZWxlbWVudFxuICogQHBhcmFtIHtGbGlja2l0eX0gZmxpY2tpdHkgLSBGbGlja2l0eSBpbnN0YW5jZVxuICovXG5mdW5jdGlvbiBMYXp5TG9hZGVyKCBpbWcsIGZsaWNraXR5ICkge1xuICB0aGlzLmltZyA9IGltZztcbiAgdGhpcy5mbGlja2l0eSA9IGZsaWNraXR5O1xuICB0aGlzLmxvYWQoKTtcbn1cblxuTGF6eUxvYWRlci5wcm90b3R5cGUuaGFuZGxlRXZlbnQgPSB1dGlscy5oYW5kbGVFdmVudDtcblxuTGF6eUxvYWRlci5wcm90b3R5cGUubG9hZCA9IGZ1bmN0aW9uKCkge1xuICB0aGlzLmltZy5hZGRFdmVudExpc3RlbmVyKCAnbG9hZCcsIHRoaXMgKTtcbiAgdGhpcy5pbWcuYWRkRXZlbnRMaXN0ZW5lciggJ2Vycm9yJywgdGhpcyApO1xuICAvLyBnZXQgc3JjICYgc3Jjc2V0XG4gIHZhciBzcmMgPSB0aGlzLmltZy5nZXRBdHRyaWJ1dGUoJ2RhdGEtZmxpY2tpdHktbGF6eWxvYWQnKSB8fFxuICAgIHRoaXMuaW1nLmdldEF0dHJpYnV0ZSgnZGF0YS1mbGlja2l0eS1sYXp5bG9hZC1zcmMnKTtcbiAgdmFyIHNyY3NldCA9IHRoaXMuaW1nLmdldEF0dHJpYnV0ZSgnZGF0YS1mbGlja2l0eS1sYXp5bG9hZC1zcmNzZXQnKTtcbiAgLy8gc2V0IHNyYyAmIHNlcnNldFxuICB0aGlzLmltZy5zcmMgPSBzcmM7XG4gIGlmICggc3Jjc2V0ICkge1xuICAgIHRoaXMuaW1nLnNldEF0dHJpYnV0ZSggJ3NyY3NldCcsIHNyY3NldCApO1xuICB9XG4gIC8vIHJlbW92ZSBhdHRyXG4gIHRoaXMuaW1nLnJlbW92ZUF0dHJpYnV0ZSgnZGF0YS1mbGlja2l0eS1sYXp5bG9hZCcpO1xuICB0aGlzLmltZy5yZW1vdmVBdHRyaWJ1dGUoJ2RhdGEtZmxpY2tpdHktbGF6eWxvYWQtc3JjJyk7XG4gIHRoaXMuaW1nLnJlbW92ZUF0dHJpYnV0ZSgnZGF0YS1mbGlja2l0eS1sYXp5bG9hZC1zcmNzZXQnKTtcbn07XG5cbkxhenlMb2FkZXIucHJvdG90eXBlLm9ubG9hZCA9IGZ1bmN0aW9uKCBldmVudCApIHtcbiAgdGhpcy5jb21wbGV0ZSggZXZlbnQsICdmbGlja2l0eS1sYXp5bG9hZGVkJyApO1xufTtcblxuTGF6eUxvYWRlci5wcm90b3R5cGUub25lcnJvciA9IGZ1bmN0aW9uKCBldmVudCApIHtcbiAgdGhpcy5jb21wbGV0ZSggZXZlbnQsICdmbGlja2l0eS1sYXp5ZXJyb3InICk7XG59O1xuXG5MYXp5TG9hZGVyLnByb3RvdHlwZS5jb21wbGV0ZSA9IGZ1bmN0aW9uKCBldmVudCwgY2xhc3NOYW1lICkge1xuICAvLyB1bmJpbmQgZXZlbnRzXG4gIHRoaXMuaW1nLnJlbW92ZUV2ZW50TGlzdGVuZXIoICdsb2FkJywgdGhpcyApO1xuICB0aGlzLmltZy5yZW1vdmVFdmVudExpc3RlbmVyKCAnZXJyb3InLCB0aGlzICk7XG5cbiAgdmFyIGNlbGwgPSB0aGlzLmZsaWNraXR5LmdldFBhcmVudENlbGwoIHRoaXMuaW1nICk7XG4gIHZhciBjZWxsRWxlbSA9IGNlbGwgJiYgY2VsbC5lbGVtZW50O1xuICB0aGlzLmZsaWNraXR5LmNlbGxTaXplQ2hhbmdlKCBjZWxsRWxlbSApO1xuXG4gIHRoaXMuaW1nLmNsYXNzTGlzdC5hZGQoIGNsYXNzTmFtZSApO1xuICB0aGlzLmZsaWNraXR5LmRpc3BhdGNoRXZlbnQoICdsYXp5TG9hZCcsIGV2ZW50LCBjZWxsRWxlbSApO1xufTtcblxuLy8gLS0tLS0gIC0tLS0tIC8vXG5cbkZsaWNraXR5LkxhenlMb2FkZXIgPSBMYXp5TG9hZGVyO1xuXG5yZXR1cm4gRmxpY2tpdHk7XG5cbn0gKSApO1xuIiwiLyohXG4gKiBGbGlja2l0eSB2Mi4yLjJcbiAqIFRvdWNoLCByZXNwb25zaXZlLCBmbGlja2FibGUgY2Fyb3VzZWxzXG4gKlxuICogTGljZW5zZWQgR1BMdjMgZm9yIG9wZW4gc291cmNlIHVzZVxuICogb3IgRmxpY2tpdHkgQ29tbWVyY2lhbCBMaWNlbnNlIGZvciBjb21tZXJjaWFsIHVzZVxuICpcbiAqIGh0dHBzOi8vZmxpY2tpdHkubWV0YWZpenp5LmNvXG4gKiBDb3B5cmlnaHQgMjAxNS0yMDIxIE1ldGFmaXp6eVxuICovXG5cbiggZnVuY3Rpb24oIHdpbmRvdywgZmFjdG9yeSApIHtcbiAgLy8gdW5pdmVyc2FsIG1vZHVsZSBkZWZpbml0aW9uXG4gIGlmICggdHlwZW9mIGRlZmluZSA9PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQgKSB7XG4gICAgLy8gQU1EXG4gICAgZGVmaW5lKCBbXG4gICAgICAnLi9mbGlja2l0eScsXG4gICAgICAnLi9kcmFnJyxcbiAgICAgICcuL3ByZXYtbmV4dC1idXR0b24nLFxuICAgICAgJy4vcGFnZS1kb3RzJyxcbiAgICAgICcuL3BsYXllcicsXG4gICAgICAnLi9hZGQtcmVtb3ZlLWNlbGwnLFxuICAgICAgJy4vbGF6eWxvYWQnLFxuICAgIF0sIGZhY3RvcnkgKTtcbiAgfSBlbHNlIGlmICggdHlwZW9mIG1vZHVsZSA9PSAnb2JqZWN0JyAmJiBtb2R1bGUuZXhwb3J0cyApIHtcbiAgICAvLyBDb21tb25KU1xuICAgIG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeShcbiAgICAgICAgcmVxdWlyZSgnLi9mbGlja2l0eScpLFxuICAgICAgICByZXF1aXJlKCcuL2RyYWcnKSxcbiAgICAgICAgcmVxdWlyZSgnLi9wcmV2LW5leHQtYnV0dG9uJyksXG4gICAgICAgIHJlcXVpcmUoJy4vcGFnZS1kb3RzJyksXG4gICAgICAgIHJlcXVpcmUoJy4vcGxheWVyJyksXG4gICAgICAgIHJlcXVpcmUoJy4vYWRkLXJlbW92ZS1jZWxsJyksXG4gICAgICAgIHJlcXVpcmUoJy4vbGF6eWxvYWQnKVxuICAgICk7XG4gIH1cblxufSApKCB3aW5kb3csIGZ1bmN0aW9uIGZhY3RvcnkoIEZsaWNraXR5ICkge1xuICByZXR1cm4gRmxpY2tpdHk7XG59ICk7XG4iLCIvKiFcbiAqIGltYWdlc0xvYWRlZCB2NC4xLjRcbiAqIEphdmFTY3JpcHQgaXMgYWxsIGxpa2UgXCJZb3UgaW1hZ2VzIGFyZSBkb25lIHlldCBvciB3aGF0P1wiXG4gKiBNSVQgTGljZW5zZVxuICovXG5cbiggZnVuY3Rpb24oIHdpbmRvdywgZmFjdG9yeSApIHsgJ3VzZSBzdHJpY3QnO1xuICAvLyB1bml2ZXJzYWwgbW9kdWxlIGRlZmluaXRpb25cblxuICAvKmdsb2JhbCBkZWZpbmU6IGZhbHNlLCBtb2R1bGU6IGZhbHNlLCByZXF1aXJlOiBmYWxzZSAqL1xuXG4gIGlmICggdHlwZW9mIGRlZmluZSA9PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQgKSB7XG4gICAgLy8gQU1EXG4gICAgZGVmaW5lKCBbXG4gICAgICAnZXYtZW1pdHRlci9ldi1lbWl0dGVyJ1xuICAgIF0sIGZ1bmN0aW9uKCBFdkVtaXR0ZXIgKSB7XG4gICAgICByZXR1cm4gZmFjdG9yeSggd2luZG93LCBFdkVtaXR0ZXIgKTtcbiAgICB9KTtcbiAgfSBlbHNlIGlmICggdHlwZW9mIG1vZHVsZSA9PSAnb2JqZWN0JyAmJiBtb2R1bGUuZXhwb3J0cyApIHtcbiAgICAvLyBDb21tb25KU1xuICAgIG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeShcbiAgICAgIHdpbmRvdyxcbiAgICAgIHJlcXVpcmUoJ2V2LWVtaXR0ZXInKVxuICAgICk7XG4gIH0gZWxzZSB7XG4gICAgLy8gYnJvd3NlciBnbG9iYWxcbiAgICB3aW5kb3cuaW1hZ2VzTG9hZGVkID0gZmFjdG9yeShcbiAgICAgIHdpbmRvdyxcbiAgICAgIHdpbmRvdy5FdkVtaXR0ZXJcbiAgICApO1xuICB9XG5cbn0pKCB0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJyA/IHdpbmRvdyA6IHRoaXMsXG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tICBmYWN0b3J5IC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIC8vXG5cbmZ1bmN0aW9uIGZhY3RvcnkoIHdpbmRvdywgRXZFbWl0dGVyICkge1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciAkID0gd2luZG93LmpRdWVyeTtcbnZhciBjb25zb2xlID0gd2luZG93LmNvbnNvbGU7XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIGhlbHBlcnMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gLy9cblxuLy8gZXh0ZW5kIG9iamVjdHNcbmZ1bmN0aW9uIGV4dGVuZCggYSwgYiApIHtcbiAgZm9yICggdmFyIHByb3AgaW4gYiApIHtcbiAgICBhWyBwcm9wIF0gPSBiWyBwcm9wIF07XG4gIH1cbiAgcmV0dXJuIGE7XG59XG5cbnZhciBhcnJheVNsaWNlID0gQXJyYXkucHJvdG90eXBlLnNsaWNlO1xuXG4vLyB0dXJuIGVsZW1lbnQgb3Igbm9kZUxpc3QgaW50byBhbiBhcnJheVxuZnVuY3Rpb24gbWFrZUFycmF5KCBvYmogKSB7XG4gIGlmICggQXJyYXkuaXNBcnJheSggb2JqICkgKSB7XG4gICAgLy8gdXNlIG9iamVjdCBpZiBhbHJlYWR5IGFuIGFycmF5XG4gICAgcmV0dXJuIG9iajtcbiAgfVxuXG4gIHZhciBpc0FycmF5TGlrZSA9IHR5cGVvZiBvYmogPT0gJ29iamVjdCcgJiYgdHlwZW9mIG9iai5sZW5ndGggPT0gJ251bWJlcic7XG4gIGlmICggaXNBcnJheUxpa2UgKSB7XG4gICAgLy8gY29udmVydCBub2RlTGlzdCB0byBhcnJheVxuICAgIHJldHVybiBhcnJheVNsaWNlLmNhbGwoIG9iaiApO1xuICB9XG5cbiAgLy8gYXJyYXkgb2Ygc2luZ2xlIGluZGV4XG4gIHJldHVybiBbIG9iaiBdO1xufVxuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSBpbWFnZXNMb2FkZWQgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gLy9cblxuLyoqXG4gKiBAcGFyYW0ge0FycmF5LCBFbGVtZW50LCBOb2RlTGlzdCwgU3RyaW5nfSBlbGVtXG4gKiBAcGFyYW0ge09iamVjdCBvciBGdW5jdGlvbn0gb3B0aW9ucyAtIGlmIGZ1bmN0aW9uLCB1c2UgYXMgY2FsbGJhY2tcbiAqIEBwYXJhbSB7RnVuY3Rpb259IG9uQWx3YXlzIC0gY2FsbGJhY2sgZnVuY3Rpb25cbiAqL1xuZnVuY3Rpb24gSW1hZ2VzTG9hZGVkKCBlbGVtLCBvcHRpb25zLCBvbkFsd2F5cyApIHtcbiAgLy8gY29lcmNlIEltYWdlc0xvYWRlZCgpIHdpdGhvdXQgbmV3LCB0byBiZSBuZXcgSW1hZ2VzTG9hZGVkKClcbiAgaWYgKCAhKCB0aGlzIGluc3RhbmNlb2YgSW1hZ2VzTG9hZGVkICkgKSB7XG4gICAgcmV0dXJuIG5ldyBJbWFnZXNMb2FkZWQoIGVsZW0sIG9wdGlvbnMsIG9uQWx3YXlzICk7XG4gIH1cbiAgLy8gdXNlIGVsZW0gYXMgc2VsZWN0b3Igc3RyaW5nXG4gIHZhciBxdWVyeUVsZW0gPSBlbGVtO1xuICBpZiAoIHR5cGVvZiBlbGVtID09ICdzdHJpbmcnICkge1xuICAgIHF1ZXJ5RWxlbSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoIGVsZW0gKTtcbiAgfVxuICAvLyBiYWlsIGlmIGJhZCBlbGVtZW50XG4gIGlmICggIXF1ZXJ5RWxlbSApIHtcbiAgICBjb25zb2xlLmVycm9yKCAnQmFkIGVsZW1lbnQgZm9yIGltYWdlc0xvYWRlZCAnICsgKCBxdWVyeUVsZW0gfHwgZWxlbSApICk7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgdGhpcy5lbGVtZW50cyA9IG1ha2VBcnJheSggcXVlcnlFbGVtICk7XG4gIHRoaXMub3B0aW9ucyA9IGV4dGVuZCgge30sIHRoaXMub3B0aW9ucyApO1xuICAvLyBzaGlmdCBhcmd1bWVudHMgaWYgbm8gb3B0aW9ucyBzZXRcbiAgaWYgKCB0eXBlb2Ygb3B0aW9ucyA9PSAnZnVuY3Rpb24nICkge1xuICAgIG9uQWx3YXlzID0gb3B0aW9ucztcbiAgfSBlbHNlIHtcbiAgICBleHRlbmQoIHRoaXMub3B0aW9ucywgb3B0aW9ucyApO1xuICB9XG5cbiAgaWYgKCBvbkFsd2F5cyApIHtcbiAgICB0aGlzLm9uKCAnYWx3YXlzJywgb25BbHdheXMgKTtcbiAgfVxuXG4gIHRoaXMuZ2V0SW1hZ2VzKCk7XG5cbiAgaWYgKCAkICkge1xuICAgIC8vIGFkZCBqUXVlcnkgRGVmZXJyZWQgb2JqZWN0XG4gICAgdGhpcy5qcURlZmVycmVkID0gbmV3ICQuRGVmZXJyZWQoKTtcbiAgfVxuXG4gIC8vIEhBQ0sgY2hlY2sgYXN5bmMgdG8gYWxsb3cgdGltZSB0byBiaW5kIGxpc3RlbmVyc1xuICBzZXRUaW1lb3V0KCB0aGlzLmNoZWNrLmJpbmQoIHRoaXMgKSApO1xufVxuXG5JbWFnZXNMb2FkZWQucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZSggRXZFbWl0dGVyLnByb3RvdHlwZSApO1xuXG5JbWFnZXNMb2FkZWQucHJvdG90eXBlLm9wdGlvbnMgPSB7fTtcblxuSW1hZ2VzTG9hZGVkLnByb3RvdHlwZS5nZXRJbWFnZXMgPSBmdW5jdGlvbigpIHtcbiAgdGhpcy5pbWFnZXMgPSBbXTtcblxuICAvLyBmaWx0ZXIgJiBmaW5kIGl0ZW1zIGlmIHdlIGhhdmUgYW4gaXRlbSBzZWxlY3RvclxuICB0aGlzLmVsZW1lbnRzLmZvckVhY2goIHRoaXMuYWRkRWxlbWVudEltYWdlcywgdGhpcyApO1xufTtcblxuLyoqXG4gKiBAcGFyYW0ge05vZGV9IGVsZW1lbnRcbiAqL1xuSW1hZ2VzTG9hZGVkLnByb3RvdHlwZS5hZGRFbGVtZW50SW1hZ2VzID0gZnVuY3Rpb24oIGVsZW0gKSB7XG4gIC8vIGZpbHRlciBzaWJsaW5nc1xuICBpZiAoIGVsZW0ubm9kZU5hbWUgPT0gJ0lNRycgKSB7XG4gICAgdGhpcy5hZGRJbWFnZSggZWxlbSApO1xuICB9XG4gIC8vIGdldCBiYWNrZ3JvdW5kIGltYWdlIG9uIGVsZW1lbnRcbiAgaWYgKCB0aGlzLm9wdGlvbnMuYmFja2dyb3VuZCA9PT0gdHJ1ZSApIHtcbiAgICB0aGlzLmFkZEVsZW1lbnRCYWNrZ3JvdW5kSW1hZ2VzKCBlbGVtICk7XG4gIH1cblxuICAvLyBmaW5kIGNoaWxkcmVuXG4gIC8vIG5vIG5vbi1lbGVtZW50IG5vZGVzLCAjMTQzXG4gIHZhciBub2RlVHlwZSA9IGVsZW0ubm9kZVR5cGU7XG4gIGlmICggIW5vZGVUeXBlIHx8ICFlbGVtZW50Tm9kZVR5cGVzWyBub2RlVHlwZSBdICkge1xuICAgIHJldHVybjtcbiAgfVxuICB2YXIgY2hpbGRJbWdzID0gZWxlbS5xdWVyeVNlbGVjdG9yQWxsKCdpbWcnKTtcbiAgLy8gY29uY2F0IGNoaWxkRWxlbXMgdG8gZmlsdGVyRm91bmQgYXJyYXlcbiAgZm9yICggdmFyIGk9MDsgaSA8IGNoaWxkSW1ncy5sZW5ndGg7IGkrKyApIHtcbiAgICB2YXIgaW1nID0gY2hpbGRJbWdzW2ldO1xuICAgIHRoaXMuYWRkSW1hZ2UoIGltZyApO1xuICB9XG5cbiAgLy8gZ2V0IGNoaWxkIGJhY2tncm91bmQgaW1hZ2VzXG4gIGlmICggdHlwZW9mIHRoaXMub3B0aW9ucy5iYWNrZ3JvdW5kID09ICdzdHJpbmcnICkge1xuICAgIHZhciBjaGlsZHJlbiA9IGVsZW0ucXVlcnlTZWxlY3RvckFsbCggdGhpcy5vcHRpb25zLmJhY2tncm91bmQgKTtcbiAgICBmb3IgKCBpPTA7IGkgPCBjaGlsZHJlbi5sZW5ndGg7IGkrKyApIHtcbiAgICAgIHZhciBjaGlsZCA9IGNoaWxkcmVuW2ldO1xuICAgICAgdGhpcy5hZGRFbGVtZW50QmFja2dyb3VuZEltYWdlcyggY2hpbGQgKTtcbiAgICB9XG4gIH1cbn07XG5cbnZhciBlbGVtZW50Tm9kZVR5cGVzID0ge1xuICAxOiB0cnVlLFxuICA5OiB0cnVlLFxuICAxMTogdHJ1ZVxufTtcblxuSW1hZ2VzTG9hZGVkLnByb3RvdHlwZS5hZGRFbGVtZW50QmFja2dyb3VuZEltYWdlcyA9IGZ1bmN0aW9uKCBlbGVtICkge1xuICB2YXIgc3R5bGUgPSBnZXRDb21wdXRlZFN0eWxlKCBlbGVtICk7XG4gIGlmICggIXN0eWxlICkge1xuICAgIC8vIEZpcmVmb3ggcmV0dXJucyBudWxsIGlmIGluIGEgaGlkZGVuIGlmcmFtZSBodHRwczovL2J1Z3ppbC5sYS81NDgzOTdcbiAgICByZXR1cm47XG4gIH1cbiAgLy8gZ2V0IHVybCBpbnNpZGUgdXJsKFwiLi4uXCIpXG4gIHZhciByZVVSTCA9IC91cmxcXCgoWydcIl0pPyguKj8pXFwxXFwpL2dpO1xuICB2YXIgbWF0Y2hlcyA9IHJlVVJMLmV4ZWMoIHN0eWxlLmJhY2tncm91bmRJbWFnZSApO1xuICB3aGlsZSAoIG1hdGNoZXMgIT09IG51bGwgKSB7XG4gICAgdmFyIHVybCA9IG1hdGNoZXMgJiYgbWF0Y2hlc1syXTtcbiAgICBpZiAoIHVybCApIHtcbiAgICAgIHRoaXMuYWRkQmFja2dyb3VuZCggdXJsLCBlbGVtICk7XG4gICAgfVxuICAgIG1hdGNoZXMgPSByZVVSTC5leGVjKCBzdHlsZS5iYWNrZ3JvdW5kSW1hZ2UgKTtcbiAgfVxufTtcblxuLyoqXG4gKiBAcGFyYW0ge0ltYWdlfSBpbWdcbiAqL1xuSW1hZ2VzTG9hZGVkLnByb3RvdHlwZS5hZGRJbWFnZSA9IGZ1bmN0aW9uKCBpbWcgKSB7XG4gIHZhciBsb2FkaW5nSW1hZ2UgPSBuZXcgTG9hZGluZ0ltYWdlKCBpbWcgKTtcbiAgdGhpcy5pbWFnZXMucHVzaCggbG9hZGluZ0ltYWdlICk7XG59O1xuXG5JbWFnZXNMb2FkZWQucHJvdG90eXBlLmFkZEJhY2tncm91bmQgPSBmdW5jdGlvbiggdXJsLCBlbGVtICkge1xuICB2YXIgYmFja2dyb3VuZCA9IG5ldyBCYWNrZ3JvdW5kKCB1cmwsIGVsZW0gKTtcbiAgdGhpcy5pbWFnZXMucHVzaCggYmFja2dyb3VuZCApO1xufTtcblxuSW1hZ2VzTG9hZGVkLnByb3RvdHlwZS5jaGVjayA9IGZ1bmN0aW9uKCkge1xuICB2YXIgX3RoaXMgPSB0aGlzO1xuICB0aGlzLnByb2dyZXNzZWRDb3VudCA9IDA7XG4gIHRoaXMuaGFzQW55QnJva2VuID0gZmFsc2U7XG4gIC8vIGNvbXBsZXRlIGlmIG5vIGltYWdlc1xuICBpZiAoICF0aGlzLmltYWdlcy5sZW5ndGggKSB7XG4gICAgdGhpcy5jb21wbGV0ZSgpO1xuICAgIHJldHVybjtcbiAgfVxuXG4gIGZ1bmN0aW9uIG9uUHJvZ3Jlc3MoIGltYWdlLCBlbGVtLCBtZXNzYWdlICkge1xuICAgIC8vIEhBQ0sgLSBDaHJvbWUgdHJpZ2dlcnMgZXZlbnQgYmVmb3JlIG9iamVjdCBwcm9wZXJ0aWVzIGhhdmUgY2hhbmdlZC4gIzgzXG4gICAgc2V0VGltZW91dCggZnVuY3Rpb24oKSB7XG4gICAgICBfdGhpcy5wcm9ncmVzcyggaW1hZ2UsIGVsZW0sIG1lc3NhZ2UgKTtcbiAgICB9KTtcbiAgfVxuXG4gIHRoaXMuaW1hZ2VzLmZvckVhY2goIGZ1bmN0aW9uKCBsb2FkaW5nSW1hZ2UgKSB7XG4gICAgbG9hZGluZ0ltYWdlLm9uY2UoICdwcm9ncmVzcycsIG9uUHJvZ3Jlc3MgKTtcbiAgICBsb2FkaW5nSW1hZ2UuY2hlY2soKTtcbiAgfSk7XG59O1xuXG5JbWFnZXNMb2FkZWQucHJvdG90eXBlLnByb2dyZXNzID0gZnVuY3Rpb24oIGltYWdlLCBlbGVtLCBtZXNzYWdlICkge1xuICB0aGlzLnByb2dyZXNzZWRDb3VudCsrO1xuICB0aGlzLmhhc0FueUJyb2tlbiA9IHRoaXMuaGFzQW55QnJva2VuIHx8ICFpbWFnZS5pc0xvYWRlZDtcbiAgLy8gcHJvZ3Jlc3MgZXZlbnRcbiAgdGhpcy5lbWl0RXZlbnQoICdwcm9ncmVzcycsIFsgdGhpcywgaW1hZ2UsIGVsZW0gXSApO1xuICBpZiAoIHRoaXMuanFEZWZlcnJlZCAmJiB0aGlzLmpxRGVmZXJyZWQubm90aWZ5ICkge1xuICAgIHRoaXMuanFEZWZlcnJlZC5ub3RpZnkoIHRoaXMsIGltYWdlICk7XG4gIH1cbiAgLy8gY2hlY2sgaWYgY29tcGxldGVkXG4gIGlmICggdGhpcy5wcm9ncmVzc2VkQ291bnQgPT0gdGhpcy5pbWFnZXMubGVuZ3RoICkge1xuICAgIHRoaXMuY29tcGxldGUoKTtcbiAgfVxuXG4gIGlmICggdGhpcy5vcHRpb25zLmRlYnVnICYmIGNvbnNvbGUgKSB7XG4gICAgY29uc29sZS5sb2coICdwcm9ncmVzczogJyArIG1lc3NhZ2UsIGltYWdlLCBlbGVtICk7XG4gIH1cbn07XG5cbkltYWdlc0xvYWRlZC5wcm90b3R5cGUuY29tcGxldGUgPSBmdW5jdGlvbigpIHtcbiAgdmFyIGV2ZW50TmFtZSA9IHRoaXMuaGFzQW55QnJva2VuID8gJ2ZhaWwnIDogJ2RvbmUnO1xuICB0aGlzLmlzQ29tcGxldGUgPSB0cnVlO1xuICB0aGlzLmVtaXRFdmVudCggZXZlbnROYW1lLCBbIHRoaXMgXSApO1xuICB0aGlzLmVtaXRFdmVudCggJ2Fsd2F5cycsIFsgdGhpcyBdICk7XG4gIGlmICggdGhpcy5qcURlZmVycmVkICkge1xuICAgIHZhciBqcU1ldGhvZCA9IHRoaXMuaGFzQW55QnJva2VuID8gJ3JlamVjdCcgOiAncmVzb2x2ZSc7XG4gICAgdGhpcy5qcURlZmVycmVkWyBqcU1ldGhvZCBdKCB0aGlzICk7XG4gIH1cbn07XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tICAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSAvL1xuXG5mdW5jdGlvbiBMb2FkaW5nSW1hZ2UoIGltZyApIHtcbiAgdGhpcy5pbWcgPSBpbWc7XG59XG5cbkxvYWRpbmdJbWFnZS5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKCBFdkVtaXR0ZXIucHJvdG90eXBlICk7XG5cbkxvYWRpbmdJbWFnZS5wcm90b3R5cGUuY2hlY2sgPSBmdW5jdGlvbigpIHtcbiAgLy8gSWYgY29tcGxldGUgaXMgdHJ1ZSBhbmQgYnJvd3NlciBzdXBwb3J0cyBuYXR1cmFsIHNpemVzLFxuICAvLyB0cnkgdG8gY2hlY2sgZm9yIGltYWdlIHN0YXR1cyBtYW51YWxseS5cbiAgdmFyIGlzQ29tcGxldGUgPSB0aGlzLmdldElzSW1hZ2VDb21wbGV0ZSgpO1xuICBpZiAoIGlzQ29tcGxldGUgKSB7XG4gICAgLy8gcmVwb3J0IGJhc2VkIG9uIG5hdHVyYWxXaWR0aFxuICAgIHRoaXMuY29uZmlybSggdGhpcy5pbWcubmF0dXJhbFdpZHRoICE9PSAwLCAnbmF0dXJhbFdpZHRoJyApO1xuICAgIHJldHVybjtcbiAgfVxuXG4gIC8vIElmIG5vbmUgb2YgdGhlIGNoZWNrcyBhYm92ZSBtYXRjaGVkLCBzaW11bGF0ZSBsb2FkaW5nIG9uIGRldGFjaGVkIGVsZW1lbnQuXG4gIHRoaXMucHJveHlJbWFnZSA9IG5ldyBJbWFnZSgpO1xuICB0aGlzLnByb3h5SW1hZ2UuYWRkRXZlbnRMaXN0ZW5lciggJ2xvYWQnLCB0aGlzICk7XG4gIHRoaXMucHJveHlJbWFnZS5hZGRFdmVudExpc3RlbmVyKCAnZXJyb3InLCB0aGlzICk7XG4gIC8vIGJpbmQgdG8gaW1hZ2UgYXMgd2VsbCBmb3IgRmlyZWZveC4gIzE5MVxuICB0aGlzLmltZy5hZGRFdmVudExpc3RlbmVyKCAnbG9hZCcsIHRoaXMgKTtcbiAgdGhpcy5pbWcuYWRkRXZlbnRMaXN0ZW5lciggJ2Vycm9yJywgdGhpcyApO1xuICB0aGlzLnByb3h5SW1hZ2Uuc3JjID0gdGhpcy5pbWcuc3JjO1xufTtcblxuTG9hZGluZ0ltYWdlLnByb3RvdHlwZS5nZXRJc0ltYWdlQ29tcGxldGUgPSBmdW5jdGlvbigpIHtcbiAgLy8gY2hlY2sgZm9yIG5vbi16ZXJvLCBub24tdW5kZWZpbmVkIG5hdHVyYWxXaWR0aFxuICAvLyBmaXhlcyBTYWZhcmkrSW5maW5pdGVTY3JvbGwrTWFzb25yeSBidWcgaW5maW5pdGUtc2Nyb2xsIzY3MVxuICByZXR1cm4gdGhpcy5pbWcuY29tcGxldGUgJiYgdGhpcy5pbWcubmF0dXJhbFdpZHRoO1xufTtcblxuTG9hZGluZ0ltYWdlLnByb3RvdHlwZS5jb25maXJtID0gZnVuY3Rpb24oIGlzTG9hZGVkLCBtZXNzYWdlICkge1xuICB0aGlzLmlzTG9hZGVkID0gaXNMb2FkZWQ7XG4gIHRoaXMuZW1pdEV2ZW50KCAncHJvZ3Jlc3MnLCBbIHRoaXMsIHRoaXMuaW1nLCBtZXNzYWdlIF0gKTtcbn07XG5cbi8vIC0tLS0tIGV2ZW50cyAtLS0tLSAvL1xuXG4vLyB0cmlnZ2VyIHNwZWNpZmllZCBoYW5kbGVyIGZvciBldmVudCB0eXBlXG5Mb2FkaW5nSW1hZ2UucHJvdG90eXBlLmhhbmRsZUV2ZW50ID0gZnVuY3Rpb24oIGV2ZW50ICkge1xuICB2YXIgbWV0aG9kID0gJ29uJyArIGV2ZW50LnR5cGU7XG4gIGlmICggdGhpc1sgbWV0aG9kIF0gKSB7XG4gICAgdGhpc1sgbWV0aG9kIF0oIGV2ZW50ICk7XG4gIH1cbn07XG5cbkxvYWRpbmdJbWFnZS5wcm90b3R5cGUub25sb2FkID0gZnVuY3Rpb24oKSB7XG4gIHRoaXMuY29uZmlybSggdHJ1ZSwgJ29ubG9hZCcgKTtcbiAgdGhpcy51bmJpbmRFdmVudHMoKTtcbn07XG5cbkxvYWRpbmdJbWFnZS5wcm90b3R5cGUub25lcnJvciA9IGZ1bmN0aW9uKCkge1xuICB0aGlzLmNvbmZpcm0oIGZhbHNlLCAnb25lcnJvcicgKTtcbiAgdGhpcy51bmJpbmRFdmVudHMoKTtcbn07XG5cbkxvYWRpbmdJbWFnZS5wcm90b3R5cGUudW5iaW5kRXZlbnRzID0gZnVuY3Rpb24oKSB7XG4gIHRoaXMucHJveHlJbWFnZS5yZW1vdmVFdmVudExpc3RlbmVyKCAnbG9hZCcsIHRoaXMgKTtcbiAgdGhpcy5wcm94eUltYWdlLnJlbW92ZUV2ZW50TGlzdGVuZXIoICdlcnJvcicsIHRoaXMgKTtcbiAgdGhpcy5pbWcucmVtb3ZlRXZlbnRMaXN0ZW5lciggJ2xvYWQnLCB0aGlzICk7XG4gIHRoaXMuaW1nLnJlbW92ZUV2ZW50TGlzdGVuZXIoICdlcnJvcicsIHRoaXMgKTtcbn07XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIEJhY2tncm91bmQgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gLy9cblxuZnVuY3Rpb24gQmFja2dyb3VuZCggdXJsLCBlbGVtZW50ICkge1xuICB0aGlzLnVybCA9IHVybDtcbiAgdGhpcy5lbGVtZW50ID0gZWxlbWVudDtcbiAgdGhpcy5pbWcgPSBuZXcgSW1hZ2UoKTtcbn1cblxuLy8gaW5oZXJpdCBMb2FkaW5nSW1hZ2UgcHJvdG90eXBlXG5CYWNrZ3JvdW5kLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoIExvYWRpbmdJbWFnZS5wcm90b3R5cGUgKTtcblxuQmFja2dyb3VuZC5wcm90b3R5cGUuY2hlY2sgPSBmdW5jdGlvbigpIHtcbiAgdGhpcy5pbWcuYWRkRXZlbnRMaXN0ZW5lciggJ2xvYWQnLCB0aGlzICk7XG4gIHRoaXMuaW1nLmFkZEV2ZW50TGlzdGVuZXIoICdlcnJvcicsIHRoaXMgKTtcbiAgdGhpcy5pbWcuc3JjID0gdGhpcy51cmw7XG4gIC8vIGNoZWNrIGlmIGltYWdlIGlzIGFscmVhZHkgY29tcGxldGVcbiAgdmFyIGlzQ29tcGxldGUgPSB0aGlzLmdldElzSW1hZ2VDb21wbGV0ZSgpO1xuICBpZiAoIGlzQ29tcGxldGUgKSB7XG4gICAgdGhpcy5jb25maXJtKCB0aGlzLmltZy5uYXR1cmFsV2lkdGggIT09IDAsICduYXR1cmFsV2lkdGgnICk7XG4gICAgdGhpcy51bmJpbmRFdmVudHMoKTtcbiAgfVxufTtcblxuQmFja2dyb3VuZC5wcm90b3R5cGUudW5iaW5kRXZlbnRzID0gZnVuY3Rpb24oKSB7XG4gIHRoaXMuaW1nLnJlbW92ZUV2ZW50TGlzdGVuZXIoICdsb2FkJywgdGhpcyApO1xuICB0aGlzLmltZy5yZW1vdmVFdmVudExpc3RlbmVyKCAnZXJyb3InLCB0aGlzICk7XG59O1xuXG5CYWNrZ3JvdW5kLnByb3RvdHlwZS5jb25maXJtID0gZnVuY3Rpb24oIGlzTG9hZGVkLCBtZXNzYWdlICkge1xuICB0aGlzLmlzTG9hZGVkID0gaXNMb2FkZWQ7XG4gIHRoaXMuZW1pdEV2ZW50KCAncHJvZ3Jlc3MnLCBbIHRoaXMsIHRoaXMuZWxlbWVudCwgbWVzc2FnZSBdICk7XG59O1xuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSBqUXVlcnkgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gLy9cblxuSW1hZ2VzTG9hZGVkLm1ha2VKUXVlcnlQbHVnaW4gPSBmdW5jdGlvbiggalF1ZXJ5ICkge1xuICBqUXVlcnkgPSBqUXVlcnkgfHwgd2luZG93LmpRdWVyeTtcbiAgaWYgKCAhalF1ZXJ5ICkge1xuICAgIHJldHVybjtcbiAgfVxuICAvLyBzZXQgbG9jYWwgdmFyaWFibGVcbiAgJCA9IGpRdWVyeTtcbiAgLy8gJCgpLmltYWdlc0xvYWRlZCgpXG4gICQuZm4uaW1hZ2VzTG9hZGVkID0gZnVuY3Rpb24oIG9wdGlvbnMsIGNhbGxiYWNrICkge1xuICAgIHZhciBpbnN0YW5jZSA9IG5ldyBJbWFnZXNMb2FkZWQoIHRoaXMsIG9wdGlvbnMsIGNhbGxiYWNrICk7XG4gICAgcmV0dXJuIGluc3RhbmNlLmpxRGVmZXJyZWQucHJvbWlzZSggJCh0aGlzKSApO1xuICB9O1xufTtcbi8vIHRyeSBtYWtpbmcgcGx1Z2luXG5JbWFnZXNMb2FkZWQubWFrZUpRdWVyeVBsdWdpbigpO1xuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSAgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gLy9cblxucmV0dXJuIEltYWdlc0xvYWRlZDtcblxufSk7XG4iLCIvKiFcbiAqIEZsaWNraXR5IGltYWdlc0xvYWRlZCB2Mi4wLjBcbiAqIGVuYWJsZXMgaW1hZ2VzTG9hZGVkIG9wdGlvbiBmb3IgRmxpY2tpdHlcbiAqL1xuXG4vKmpzaGludCBicm93c2VyOiB0cnVlLCBzdHJpY3Q6IHRydWUsIHVuZGVmOiB0cnVlLCB1bnVzZWQ6IHRydWUgKi9cblxuKCBmdW5jdGlvbiggd2luZG93LCBmYWN0b3J5ICkge1xuICAvLyB1bml2ZXJzYWwgbW9kdWxlIGRlZmluaXRpb25cbiAgLypqc2hpbnQgc3RyaWN0OiBmYWxzZSAqLyAvKmdsb2JhbHMgZGVmaW5lLCBtb2R1bGUsIHJlcXVpcmUgKi9cbiAgaWYgKCB0eXBlb2YgZGVmaW5lID09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCApIHtcbiAgICAvLyBBTURcbiAgICBkZWZpbmUoIFtcbiAgICAgICdmbGlja2l0eS9qcy9pbmRleCcsXG4gICAgICAnaW1hZ2VzbG9hZGVkL2ltYWdlc2xvYWRlZCdcbiAgICBdLCBmdW5jdGlvbiggRmxpY2tpdHksIGltYWdlc0xvYWRlZCApIHtcbiAgICAgIHJldHVybiBmYWN0b3J5KCB3aW5kb3csIEZsaWNraXR5LCBpbWFnZXNMb2FkZWQgKTtcbiAgICB9KTtcbiAgfSBlbHNlIGlmICggdHlwZW9mIG1vZHVsZSA9PSAnb2JqZWN0JyAmJiBtb2R1bGUuZXhwb3J0cyApIHtcbiAgICAvLyBDb21tb25KU1xuICAgIG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeShcbiAgICAgIHdpbmRvdyxcbiAgICAgIHJlcXVpcmUoJ2ZsaWNraXR5JyksXG4gICAgICByZXF1aXJlKCdpbWFnZXNsb2FkZWQnKVxuICAgICk7XG4gIH0gZWxzZSB7XG4gICAgLy8gYnJvd3NlciBnbG9iYWxcbiAgICB3aW5kb3cuRmxpY2tpdHkgPSBmYWN0b3J5KFxuICAgICAgd2luZG93LFxuICAgICAgd2luZG93LkZsaWNraXR5LFxuICAgICAgd2luZG93LmltYWdlc0xvYWRlZFxuICAgICk7XG4gIH1cblxufSggd2luZG93LCBmdW5jdGlvbiBmYWN0b3J5KCB3aW5kb3csIEZsaWNraXR5LCBpbWFnZXNMb2FkZWQgKSB7XG4ndXNlIHN0cmljdCc7XG5cbkZsaWNraXR5LmNyZWF0ZU1ldGhvZHMucHVzaCgnX2NyZWF0ZUltYWdlc0xvYWRlZCcpO1xuXG52YXIgcHJvdG8gPSBGbGlja2l0eS5wcm90b3R5cGU7XG5cbnByb3RvLl9jcmVhdGVJbWFnZXNMb2FkZWQgPSBmdW5jdGlvbigpIHtcbiAgdGhpcy5vbiggJ2FjdGl2YXRlJywgdGhpcy5pbWFnZXNMb2FkZWQgKTtcbn07XG5cbnByb3RvLmltYWdlc0xvYWRlZCA9IGZ1bmN0aW9uKCkge1xuICBpZiAoICF0aGlzLm9wdGlvbnMuaW1hZ2VzTG9hZGVkICkge1xuICAgIHJldHVybjtcbiAgfVxuICB2YXIgX3RoaXMgPSB0aGlzO1xuICBmdW5jdGlvbiBvbkltYWdlc0xvYWRlZFByb2dyZXNzKCBpbnN0YW5jZSwgaW1hZ2UgKSB7XG4gICAgdmFyIGNlbGwgPSBfdGhpcy5nZXRQYXJlbnRDZWxsKCBpbWFnZS5pbWcgKTtcbiAgICBfdGhpcy5jZWxsU2l6ZUNoYW5nZSggY2VsbCAmJiBjZWxsLmVsZW1lbnQgKTtcbiAgICBpZiAoICFfdGhpcy5vcHRpb25zLmZyZWVTY3JvbGwgKSB7XG4gICAgICBfdGhpcy5wb3NpdGlvblNsaWRlckF0U2VsZWN0ZWQoKTtcbiAgICB9XG4gIH1cbiAgaW1hZ2VzTG9hZGVkKCB0aGlzLnNsaWRlciApLm9uKCAncHJvZ3Jlc3MnLCBvbkltYWdlc0xvYWRlZFByb2dyZXNzICk7XG59O1xuXG5yZXR1cm4gRmxpY2tpdHk7XG5cbn0pKTtcbiIsImZ1bmN0aW9uIF90b0NvbnN1bWFibGVBcnJheShhcnIpIHsgaWYgKEFycmF5LmlzQXJyYXkoYXJyKSkgeyBmb3IgKHZhciBpID0gMCwgYXJyMiA9IEFycmF5KGFyci5sZW5ndGgpOyBpIDwgYXJyLmxlbmd0aDsgaSsrKSB7IGFycjJbaV0gPSBhcnJbaV07IH0gcmV0dXJuIGFycjI7IH0gZWxzZSB7IHJldHVybiBBcnJheS5mcm9tKGFycik7IH0gfVxuXG4vLyBPbGRlciBicm93c2VycyBkb24ndCBzdXBwb3J0IGV2ZW50IG9wdGlvbnMsIGZlYXR1cmUgZGV0ZWN0IGl0LlxuXG4vLyBBZG9wdGVkIGFuZCBtb2RpZmllZCBzb2x1dGlvbiBmcm9tIEJvaGRhbiBEaWR1a2ggKDIwMTcpXG4vLyBodHRwczovL3N0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy80MTU5NDk5Ny9pb3MtMTAtc2FmYXJpLXByZXZlbnQtc2Nyb2xsaW5nLWJlaGluZC1hLWZpeGVkLW92ZXJsYXktYW5kLW1haW50YWluLXNjcm9sbC1wb3NpXG5cbnZhciBoYXNQYXNzaXZlRXZlbnRzID0gZmFsc2U7XG5pZiAodHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgdmFyIHBhc3NpdmVUZXN0T3B0aW9ucyA9IHtcbiAgICBnZXQgcGFzc2l2ZSgpIHtcbiAgICAgIGhhc1Bhc3NpdmVFdmVudHMgPSB0cnVlO1xuICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICB9XG4gIH07XG4gIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCd0ZXN0UGFzc2l2ZScsIG51bGwsIHBhc3NpdmVUZXN0T3B0aW9ucyk7XG4gIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCd0ZXN0UGFzc2l2ZScsIG51bGwsIHBhc3NpdmVUZXN0T3B0aW9ucyk7XG59XG5cbnZhciBpc0lvc0RldmljZSA9IHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnICYmIHdpbmRvdy5uYXZpZ2F0b3IgJiYgd2luZG93Lm5hdmlnYXRvci5wbGF0Zm9ybSAmJiAoL2lQKGFkfGhvbmV8b2QpLy50ZXN0KHdpbmRvdy5uYXZpZ2F0b3IucGxhdGZvcm0pIHx8IHdpbmRvdy5uYXZpZ2F0b3IucGxhdGZvcm0gPT09ICdNYWNJbnRlbCcgJiYgd2luZG93Lm5hdmlnYXRvci5tYXhUb3VjaFBvaW50cyA+IDEpO1xuXG5cbnZhciBsb2NrcyA9IFtdO1xudmFyIGRvY3VtZW50TGlzdGVuZXJBZGRlZCA9IGZhbHNlO1xudmFyIGluaXRpYWxDbGllbnRZID0gLTE7XG52YXIgcHJldmlvdXNCb2R5T3ZlcmZsb3dTZXR0aW5nID0gdm9pZCAwO1xudmFyIHByZXZpb3VzQm9keVBhZGRpbmdSaWdodCA9IHZvaWQgMDtcblxuLy8gcmV0dXJucyB0cnVlIGlmIGBlbGAgc2hvdWxkIGJlIGFsbG93ZWQgdG8gcmVjZWl2ZSB0b3VjaG1vdmUgZXZlbnRzLlxudmFyIGFsbG93VG91Y2hNb3ZlID0gZnVuY3Rpb24gYWxsb3dUb3VjaE1vdmUoZWwpIHtcbiAgcmV0dXJuIGxvY2tzLnNvbWUoZnVuY3Rpb24gKGxvY2spIHtcbiAgICBpZiAobG9jay5vcHRpb25zLmFsbG93VG91Y2hNb3ZlICYmIGxvY2sub3B0aW9ucy5hbGxvd1RvdWNoTW92ZShlbCkpIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICAgIHJldHVybiBmYWxzZTtcbiAgfSk7XG59O1xuXG52YXIgcHJldmVudERlZmF1bHQgPSBmdW5jdGlvbiBwcmV2ZW50RGVmYXVsdChyYXdFdmVudCkge1xuICB2YXIgZSA9IHJhd0V2ZW50IHx8IHdpbmRvdy5ldmVudDtcblxuICAvLyBGb3IgdGhlIGNhc2Ugd2hlcmVieSBjb25zdW1lcnMgYWRkcyBhIHRvdWNobW92ZSBldmVudCBsaXN0ZW5lciB0byBkb2N1bWVudC5cbiAgLy8gUmVjYWxsIHRoYXQgd2UgZG8gZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2htb3ZlJywgcHJldmVudERlZmF1bHQsIHsgcGFzc2l2ZTogZmFsc2UgfSlcbiAgLy8gaW4gZGlzYWJsZUJvZHlTY3JvbGwgLSBzbyBpZiB3ZSBwcm92aWRlIHRoaXMgb3Bwb3J0dW5pdHkgdG8gYWxsb3dUb3VjaE1vdmUsIHRoZW5cbiAgLy8gdGhlIHRvdWNobW92ZSBldmVudCBvbiBkb2N1bWVudCB3aWxsIGJyZWFrLlxuICBpZiAoYWxsb3dUb3VjaE1vdmUoZS50YXJnZXQpKSB7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICAvLyBEbyBub3QgcHJldmVudCBpZiB0aGUgZXZlbnQgaGFzIG1vcmUgdGhhbiBvbmUgdG91Y2ggKHVzdWFsbHkgbWVhbmluZyB0aGlzIGlzIGEgbXVsdGkgdG91Y2ggZ2VzdHVyZSBsaWtlIHBpbmNoIHRvIHpvb20pLlxuICBpZiAoZS50b3VjaGVzLmxlbmd0aCA+IDEpIHJldHVybiB0cnVlO1xuXG4gIGlmIChlLnByZXZlbnREZWZhdWx0KSBlLnByZXZlbnREZWZhdWx0KCk7XG5cbiAgcmV0dXJuIGZhbHNlO1xufTtcblxudmFyIHNldE92ZXJmbG93SGlkZGVuID0gZnVuY3Rpb24gc2V0T3ZlcmZsb3dIaWRkZW4ob3B0aW9ucykge1xuICAvLyBJZiBwcmV2aW91c0JvZHlQYWRkaW5nUmlnaHQgaXMgYWxyZWFkeSBzZXQsIGRvbid0IHNldCBpdCBhZ2Fpbi5cbiAgaWYgKHByZXZpb3VzQm9keVBhZGRpbmdSaWdodCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgdmFyIF9yZXNlcnZlU2Nyb2xsQmFyR2FwID0gISFvcHRpb25zICYmIG9wdGlvbnMucmVzZXJ2ZVNjcm9sbEJhckdhcCA9PT0gdHJ1ZTtcbiAgICB2YXIgc2Nyb2xsQmFyR2FwID0gd2luZG93LmlubmVyV2lkdGggLSBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuY2xpZW50V2lkdGg7XG5cbiAgICBpZiAoX3Jlc2VydmVTY3JvbGxCYXJHYXAgJiYgc2Nyb2xsQmFyR2FwID4gMCkge1xuICAgICAgcHJldmlvdXNCb2R5UGFkZGluZ1JpZ2h0ID0gZG9jdW1lbnQuYm9keS5zdHlsZS5wYWRkaW5nUmlnaHQ7XG4gICAgICBkb2N1bWVudC5ib2R5LnN0eWxlLnBhZGRpbmdSaWdodCA9IHNjcm9sbEJhckdhcCArICdweCc7XG4gICAgfVxuICB9XG5cbiAgLy8gSWYgcHJldmlvdXNCb2R5T3ZlcmZsb3dTZXR0aW5nIGlzIGFscmVhZHkgc2V0LCBkb24ndCBzZXQgaXQgYWdhaW4uXG4gIGlmIChwcmV2aW91c0JvZHlPdmVyZmxvd1NldHRpbmcgPT09IHVuZGVmaW5lZCkge1xuICAgIHByZXZpb3VzQm9keU92ZXJmbG93U2V0dGluZyA9IGRvY3VtZW50LmJvZHkuc3R5bGUub3ZlcmZsb3c7XG4gICAgZG9jdW1lbnQuYm9keS5zdHlsZS5vdmVyZmxvdyA9ICdoaWRkZW4nO1xuICB9XG59O1xuXG52YXIgcmVzdG9yZU92ZXJmbG93U2V0dGluZyA9IGZ1bmN0aW9uIHJlc3RvcmVPdmVyZmxvd1NldHRpbmcoKSB7XG4gIGlmIChwcmV2aW91c0JvZHlQYWRkaW5nUmlnaHQgIT09IHVuZGVmaW5lZCkge1xuICAgIGRvY3VtZW50LmJvZHkuc3R5bGUucGFkZGluZ1JpZ2h0ID0gcHJldmlvdXNCb2R5UGFkZGluZ1JpZ2h0O1xuXG4gICAgLy8gUmVzdG9yZSBwcmV2aW91c0JvZHlQYWRkaW5nUmlnaHQgdG8gdW5kZWZpbmVkIHNvIHNldE92ZXJmbG93SGlkZGVuIGtub3dzIGl0XG4gICAgLy8gY2FuIGJlIHNldCBhZ2Fpbi5cbiAgICBwcmV2aW91c0JvZHlQYWRkaW5nUmlnaHQgPSB1bmRlZmluZWQ7XG4gIH1cblxuICBpZiAocHJldmlvdXNCb2R5T3ZlcmZsb3dTZXR0aW5nICE9PSB1bmRlZmluZWQpIHtcbiAgICBkb2N1bWVudC5ib2R5LnN0eWxlLm92ZXJmbG93ID0gcHJldmlvdXNCb2R5T3ZlcmZsb3dTZXR0aW5nO1xuXG4gICAgLy8gUmVzdG9yZSBwcmV2aW91c0JvZHlPdmVyZmxvd1NldHRpbmcgdG8gdW5kZWZpbmVkXG4gICAgLy8gc28gc2V0T3ZlcmZsb3dIaWRkZW4ga25vd3MgaXQgY2FuIGJlIHNldCBhZ2Fpbi5cbiAgICBwcmV2aW91c0JvZHlPdmVyZmxvd1NldHRpbmcgPSB1bmRlZmluZWQ7XG4gIH1cbn07XG5cbi8vIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0FQSS9FbGVtZW50L3Njcm9sbEhlaWdodCNQcm9ibGVtc19hbmRfc29sdXRpb25zXG52YXIgaXNUYXJnZXRFbGVtZW50VG90YWxseVNjcm9sbGVkID0gZnVuY3Rpb24gaXNUYXJnZXRFbGVtZW50VG90YWxseVNjcm9sbGVkKHRhcmdldEVsZW1lbnQpIHtcbiAgcmV0dXJuIHRhcmdldEVsZW1lbnQgPyB0YXJnZXRFbGVtZW50LnNjcm9sbEhlaWdodCAtIHRhcmdldEVsZW1lbnQuc2Nyb2xsVG9wIDw9IHRhcmdldEVsZW1lbnQuY2xpZW50SGVpZ2h0IDogZmFsc2U7XG59O1xuXG52YXIgaGFuZGxlU2Nyb2xsID0gZnVuY3Rpb24gaGFuZGxlU2Nyb2xsKGV2ZW50LCB0YXJnZXRFbGVtZW50KSB7XG4gIHZhciBjbGllbnRZID0gZXZlbnQudGFyZ2V0VG91Y2hlc1swXS5jbGllbnRZIC0gaW5pdGlhbENsaWVudFk7XG5cbiAgaWYgKGFsbG93VG91Y2hNb3ZlKGV2ZW50LnRhcmdldCkpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBpZiAodGFyZ2V0RWxlbWVudCAmJiB0YXJnZXRFbGVtZW50LnNjcm9sbFRvcCA9PT0gMCAmJiBjbGllbnRZID4gMCkge1xuICAgIC8vIGVsZW1lbnQgaXMgYXQgdGhlIHRvcCBvZiBpdHMgc2Nyb2xsLlxuICAgIHJldHVybiBwcmV2ZW50RGVmYXVsdChldmVudCk7XG4gIH1cblxuICBpZiAoaXNUYXJnZXRFbGVtZW50VG90YWxseVNjcm9sbGVkKHRhcmdldEVsZW1lbnQpICYmIGNsaWVudFkgPCAwKSB7XG4gICAgLy8gZWxlbWVudCBpcyBhdCB0aGUgYm90dG9tIG9mIGl0cyBzY3JvbGwuXG4gICAgcmV0dXJuIHByZXZlbnREZWZhdWx0KGV2ZW50KTtcbiAgfVxuXG4gIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuICByZXR1cm4gdHJ1ZTtcbn07XG5cbmV4cG9ydCB2YXIgZGlzYWJsZUJvZHlTY3JvbGwgPSBmdW5jdGlvbiBkaXNhYmxlQm9keVNjcm9sbCh0YXJnZXRFbGVtZW50LCBvcHRpb25zKSB7XG4gIC8vIHRhcmdldEVsZW1lbnQgbXVzdCBiZSBwcm92aWRlZFxuICBpZiAoIXRhcmdldEVsZW1lbnQpIHtcbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tY29uc29sZVxuICAgIGNvbnNvbGUuZXJyb3IoJ2Rpc2FibGVCb2R5U2Nyb2xsIHVuc3VjY2Vzc2Z1bCAtIHRhcmdldEVsZW1lbnQgbXVzdCBiZSBwcm92aWRlZCB3aGVuIGNhbGxpbmcgZGlzYWJsZUJvZHlTY3JvbGwgb24gSU9TIGRldmljZXMuJyk7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgLy8gZGlzYWJsZUJvZHlTY3JvbGwgbXVzdCBub3QgaGF2ZSBiZWVuIGNhbGxlZCBvbiB0aGlzIHRhcmdldEVsZW1lbnQgYmVmb3JlXG4gIGlmIChsb2Nrcy5zb21lKGZ1bmN0aW9uIChsb2NrKSB7XG4gICAgcmV0dXJuIGxvY2sudGFyZ2V0RWxlbWVudCA9PT0gdGFyZ2V0RWxlbWVudDtcbiAgfSkpIHtcbiAgICByZXR1cm47XG4gIH1cblxuICB2YXIgbG9jayA9IHtcbiAgICB0YXJnZXRFbGVtZW50OiB0YXJnZXRFbGVtZW50LFxuICAgIG9wdGlvbnM6IG9wdGlvbnMgfHwge31cbiAgfTtcblxuICBsb2NrcyA9IFtdLmNvbmNhdChfdG9Db25zdW1hYmxlQXJyYXkobG9ja3MpLCBbbG9ja10pO1xuXG4gIGlmIChpc0lvc0RldmljZSkge1xuICAgIHRhcmdldEVsZW1lbnQub250b3VjaHN0YXJ0ID0gZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgICBpZiAoZXZlbnQudGFyZ2V0VG91Y2hlcy5sZW5ndGggPT09IDEpIHtcbiAgICAgICAgLy8gZGV0ZWN0IHNpbmdsZSB0b3VjaC5cbiAgICAgICAgaW5pdGlhbENsaWVudFkgPSBldmVudC50YXJnZXRUb3VjaGVzWzBdLmNsaWVudFk7XG4gICAgICB9XG4gICAgfTtcbiAgICB0YXJnZXRFbGVtZW50Lm9udG91Y2htb3ZlID0gZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgICBpZiAoZXZlbnQudGFyZ2V0VG91Y2hlcy5sZW5ndGggPT09IDEpIHtcbiAgICAgICAgLy8gZGV0ZWN0IHNpbmdsZSB0b3VjaC5cbiAgICAgICAgaGFuZGxlU2Nyb2xsKGV2ZW50LCB0YXJnZXRFbGVtZW50KTtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgaWYgKCFkb2N1bWVudExpc3RlbmVyQWRkZWQpIHtcbiAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNobW92ZScsIHByZXZlbnREZWZhdWx0LCBoYXNQYXNzaXZlRXZlbnRzID8geyBwYXNzaXZlOiBmYWxzZSB9IDogdW5kZWZpbmVkKTtcbiAgICAgIGRvY3VtZW50TGlzdGVuZXJBZGRlZCA9IHRydWU7XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIHNldE92ZXJmbG93SGlkZGVuKG9wdGlvbnMpO1xuICB9XG59O1xuXG5leHBvcnQgdmFyIGNsZWFyQWxsQm9keVNjcm9sbExvY2tzID0gZnVuY3Rpb24gY2xlYXJBbGxCb2R5U2Nyb2xsTG9ja3MoKSB7XG4gIGlmIChpc0lvc0RldmljZSkge1xuICAgIC8vIENsZWFyIGFsbCBsb2NrcyBvbnRvdWNoc3RhcnQvb250b3VjaG1vdmUgaGFuZGxlcnMsIGFuZCB0aGUgcmVmZXJlbmNlcy5cbiAgICBsb2Nrcy5mb3JFYWNoKGZ1bmN0aW9uIChsb2NrKSB7XG4gICAgICBsb2NrLnRhcmdldEVsZW1lbnQub250b3VjaHN0YXJ0ID0gbnVsbDtcbiAgICAgIGxvY2sudGFyZ2V0RWxlbWVudC5vbnRvdWNobW92ZSA9IG51bGw7XG4gICAgfSk7XG5cbiAgICBpZiAoZG9jdW1lbnRMaXN0ZW5lckFkZGVkKSB7XG4gICAgICBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCd0b3VjaG1vdmUnLCBwcmV2ZW50RGVmYXVsdCwgaGFzUGFzc2l2ZUV2ZW50cyA/IHsgcGFzc2l2ZTogZmFsc2UgfSA6IHVuZGVmaW5lZCk7XG4gICAgICBkb2N1bWVudExpc3RlbmVyQWRkZWQgPSBmYWxzZTtcbiAgICB9XG5cbiAgICAvLyBSZXNldCBpbml0aWFsIGNsaWVudFkuXG4gICAgaW5pdGlhbENsaWVudFkgPSAtMTtcbiAgfSBlbHNlIHtcbiAgICByZXN0b3JlT3ZlcmZsb3dTZXR0aW5nKCk7XG4gIH1cblxuICBsb2NrcyA9IFtdO1xufTtcblxuZXhwb3J0IHZhciBlbmFibGVCb2R5U2Nyb2xsID0gZnVuY3Rpb24gZW5hYmxlQm9keVNjcm9sbCh0YXJnZXRFbGVtZW50KSB7XG4gIGlmICghdGFyZ2V0RWxlbWVudCkge1xuICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1jb25zb2xlXG4gICAgY29uc29sZS5lcnJvcignZW5hYmxlQm9keVNjcm9sbCB1bnN1Y2Nlc3NmdWwgLSB0YXJnZXRFbGVtZW50IG11c3QgYmUgcHJvdmlkZWQgd2hlbiBjYWxsaW5nIGVuYWJsZUJvZHlTY3JvbGwgb24gSU9TIGRldmljZXMuJyk7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgbG9ja3MgPSBsb2Nrcy5maWx0ZXIoZnVuY3Rpb24gKGxvY2spIHtcbiAgICByZXR1cm4gbG9jay50YXJnZXRFbGVtZW50ICE9PSB0YXJnZXRFbGVtZW50O1xuICB9KTtcblxuICBpZiAoaXNJb3NEZXZpY2UpIHtcbiAgICB0YXJnZXRFbGVtZW50Lm9udG91Y2hzdGFydCA9IG51bGw7XG4gICAgdGFyZ2V0RWxlbWVudC5vbnRvdWNobW92ZSA9IG51bGw7XG5cbiAgICBpZiAoZG9jdW1lbnRMaXN0ZW5lckFkZGVkICYmIGxvY2tzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcigndG91Y2htb3ZlJywgcHJldmVudERlZmF1bHQsIGhhc1Bhc3NpdmVFdmVudHMgPyB7IHBhc3NpdmU6IGZhbHNlIH0gOiB1bmRlZmluZWQpO1xuICAgICAgZG9jdW1lbnRMaXN0ZW5lckFkZGVkID0gZmFsc2U7XG4gICAgfVxuICB9IGVsc2UgaWYgKCFsb2Nrcy5sZW5ndGgpIHtcbiAgICByZXN0b3JlT3ZlcmZsb3dTZXR0aW5nKCk7XG4gIH1cbn07XG5cbiIsImltcG9ydCB7IGRpc2FibGVCb2R5U2Nyb2xsLCBlbmFibGVCb2R5U2Nyb2xsLCBjbGVhckFsbEJvZHlTY3JvbGxMb2NrcyB9IGZyb20gJ2JvZHktc2Nyb2xsLWxvY2snO1xuY29uc3QgYnVyZ2VyID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmhhbWJ1cmdlcicpO1xuY29uc3QgbmF2X3RhcmdldCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5tYWluLW5hdmlnYXRpb24nKTtcblxuY29uc3QgdG9nZ2xlUmVzcG9uc2l2ZU1lbnUgPSAoKSA9PiB7XG4gIGNvbnN0IElTX05BVl9PUEVOID0gZG9jdW1lbnQuYm9keS5jbGFzc0xpc3QuY29udGFpbnMoICduYXYtaXMtb3BlbicgKTtcblx0aWYgKCBJU19OQVZfT1BFTiApIHtcblx0XHRmbG9hdGluZ05hdi5jbG9zZU5hdigpO1xuXHR9IGVsc2Uge1xuXHRcdGZsb2F0aW5nTmF2Lm9wZW5OYXYoKTtcblx0fVxufVxuXG5jb25zdCBmbG9hdGluZ05hdiA9IHtcblxuXHRvcGVuTmF2IDogZnVuY3Rpb24oKSB7XG4gICAgZG9jdW1lbnQuYm9keS5jbGFzc0xpc3QuYWRkKCAnbmF2LWlzLW9wZW4nICk7XG4gICAgZGlzYWJsZUJvZHlTY3JvbGwoIG5hdl90YXJnZXQgKTtcblx0fSxcblxuXHRjbG9zZU5hdiA6IGZ1bmN0aW9uKCkge1xuICAgIGRvY3VtZW50LmJvZHkuY2xhc3NMaXN0LnJlbW92ZSggJ25hdi1pcy1vcGVuJyApO1xuICAgIGVuYWJsZUJvZHlTY3JvbGwoIG5hdl90YXJnZXQgKTtcblx0fVxufVxuXG5jb25zdCBpbml0ID0gKCkgPT4ge1xuICBidXJnZXIuYWRkRXZlbnRMaXN0ZW5lciggJ2NsaWNrJywgKCkgPT4gdG9nZ2xlUmVzcG9uc2l2ZU1lbnUoKSApO1xufVxuXG5leHBvcnQgZGVmYXVsdCB7XG4gIGluaXQsXG59OyIsInZhciBpc09iamVjdCA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9pcy1vYmplY3QnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoaXQpIHtcbiAgaWYgKCFpc09iamVjdChpdCkgJiYgaXQgIT09IG51bGwpIHtcbiAgICB0aHJvdyBUeXBlRXJyb3IoXCJDYW4ndCBzZXQgXCIgKyBTdHJpbmcoaXQpICsgJyBhcyBhIHByb3RvdHlwZScpO1xuICB9IHJldHVybiBpdDtcbn07XG4iLCJ2YXIgYW5PYmplY3QgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvYW4tb2JqZWN0Jyk7XG52YXIgYVBvc3NpYmxlUHJvdG90eXBlID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2EtcG9zc2libGUtcHJvdG90eXBlJyk7XG5cbi8vIGBPYmplY3Quc2V0UHJvdG90eXBlT2ZgIG1ldGhvZFxuLy8gaHR0cHM6Ly90YzM5LmVzL2VjbWEyNjIvI3NlYy1vYmplY3Quc2V0cHJvdG90eXBlb2Zcbi8vIFdvcmtzIHdpdGggX19wcm90b19fIG9ubHkuIE9sZCB2OCBjYW4ndCB3b3JrIHdpdGggbnVsbCBwcm90byBvYmplY3RzLlxuLyogZXNsaW50LWRpc2FibGUgbm8tcHJvdG8gKi9cbm1vZHVsZS5leHBvcnRzID0gT2JqZWN0LnNldFByb3RvdHlwZU9mIHx8ICgnX19wcm90b19fJyBpbiB7fSA/IGZ1bmN0aW9uICgpIHtcbiAgdmFyIENPUlJFQ1RfU0VUVEVSID0gZmFsc2U7XG4gIHZhciB0ZXN0ID0ge307XG4gIHZhciBzZXR0ZXI7XG4gIHRyeSB7XG4gICAgc2V0dGVyID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcihPYmplY3QucHJvdG90eXBlLCAnX19wcm90b19fJykuc2V0O1xuICAgIHNldHRlci5jYWxsKHRlc3QsIFtdKTtcbiAgICBDT1JSRUNUX1NFVFRFUiA9IHRlc3QgaW5zdGFuY2VvZiBBcnJheTtcbiAgfSBjYXRjaCAoZXJyb3IpIHsgLyogZW1wdHkgKi8gfVxuICByZXR1cm4gZnVuY3Rpb24gc2V0UHJvdG90eXBlT2YoTywgcHJvdG8pIHtcbiAgICBhbk9iamVjdChPKTtcbiAgICBhUG9zc2libGVQcm90b3R5cGUocHJvdG8pO1xuICAgIGlmIChDT1JSRUNUX1NFVFRFUikgc2V0dGVyLmNhbGwoTywgcHJvdG8pO1xuICAgIGVsc2UgTy5fX3Byb3RvX18gPSBwcm90bztcbiAgICByZXR1cm4gTztcbiAgfTtcbn0oKSA6IHVuZGVmaW5lZCk7XG4iLCJ2YXIgaXNPYmplY3QgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvaXMtb2JqZWN0Jyk7XG52YXIgc2V0UHJvdG90eXBlT2YgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvb2JqZWN0LXNldC1wcm90b3R5cGUtb2YnKTtcblxuLy8gbWFrZXMgc3ViY2xhc3Npbmcgd29yayBjb3JyZWN0IGZvciB3cmFwcGVkIGJ1aWx0LWluc1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoJHRoaXMsIGR1bW15LCBXcmFwcGVyKSB7XG4gIHZhciBOZXdUYXJnZXQsIE5ld1RhcmdldFByb3RvdHlwZTtcbiAgaWYgKFxuICAgIC8vIGl0IGNhbiB3b3JrIG9ubHkgd2l0aCBuYXRpdmUgYHNldFByb3RvdHlwZU9mYFxuICAgIHNldFByb3RvdHlwZU9mICYmXG4gICAgLy8gd2UgaGF2ZW4ndCBjb21wbGV0ZWx5IGNvcnJlY3QgcHJlLUVTNiB3YXkgZm9yIGdldHRpbmcgYG5ldy50YXJnZXRgLCBzbyB1c2UgdGhpc1xuICAgIHR5cGVvZiAoTmV3VGFyZ2V0ID0gZHVtbXkuY29uc3RydWN0b3IpID09ICdmdW5jdGlvbicgJiZcbiAgICBOZXdUYXJnZXQgIT09IFdyYXBwZXIgJiZcbiAgICBpc09iamVjdChOZXdUYXJnZXRQcm90b3R5cGUgPSBOZXdUYXJnZXQucHJvdG90eXBlKSAmJlxuICAgIE5ld1RhcmdldFByb3RvdHlwZSAhPT0gV3JhcHBlci5wcm90b3R5cGVcbiAgKSBzZXRQcm90b3R5cGVPZigkdGhpcywgTmV3VGFyZ2V0UHJvdG90eXBlKTtcbiAgcmV0dXJuICR0aGlzO1xufTtcbiIsInZhciBpbnRlcm5hbE9iamVjdEtleXMgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvb2JqZWN0LWtleXMtaW50ZXJuYWwnKTtcbnZhciBlbnVtQnVnS2V5cyA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9lbnVtLWJ1Zy1rZXlzJyk7XG5cbi8vIGBPYmplY3Qua2V5c2AgbWV0aG9kXG4vLyBodHRwczovL3RjMzkuZXMvZWNtYTI2Mi8jc2VjLW9iamVjdC5rZXlzXG5tb2R1bGUuZXhwb3J0cyA9IE9iamVjdC5rZXlzIHx8IGZ1bmN0aW9uIGtleXMoTykge1xuICByZXR1cm4gaW50ZXJuYWxPYmplY3RLZXlzKE8sIGVudW1CdWdLZXlzKTtcbn07XG4iLCJ2YXIgREVTQ1JJUFRPUlMgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvZGVzY3JpcHRvcnMnKTtcbnZhciBkZWZpbmVQcm9wZXJ0eU1vZHVsZSA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9vYmplY3QtZGVmaW5lLXByb3BlcnR5Jyk7XG52YXIgYW5PYmplY3QgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvYW4tb2JqZWN0Jyk7XG52YXIgb2JqZWN0S2V5cyA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9vYmplY3Qta2V5cycpO1xuXG4vLyBgT2JqZWN0LmRlZmluZVByb3BlcnRpZXNgIG1ldGhvZFxuLy8gaHR0cHM6Ly90YzM5LmVzL2VjbWEyNjIvI3NlYy1vYmplY3QuZGVmaW5lcHJvcGVydGllc1xubW9kdWxlLmV4cG9ydHMgPSBERVNDUklQVE9SUyA/IE9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzIDogZnVuY3Rpb24gZGVmaW5lUHJvcGVydGllcyhPLCBQcm9wZXJ0aWVzKSB7XG4gIGFuT2JqZWN0KE8pO1xuICB2YXIga2V5cyA9IG9iamVjdEtleXMoUHJvcGVydGllcyk7XG4gIHZhciBsZW5ndGggPSBrZXlzLmxlbmd0aDtcbiAgdmFyIGluZGV4ID0gMDtcbiAgdmFyIGtleTtcbiAgd2hpbGUgKGxlbmd0aCA+IGluZGV4KSBkZWZpbmVQcm9wZXJ0eU1vZHVsZS5mKE8sIGtleSA9IGtleXNbaW5kZXgrK10sIFByb3BlcnRpZXNba2V5XSk7XG4gIHJldHVybiBPO1xufTtcbiIsInZhciBnZXRCdWlsdEluID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2dldC1idWlsdC1pbicpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGdldEJ1aWx0SW4oJ2RvY3VtZW50JywgJ2RvY3VtZW50RWxlbWVudCcpO1xuIiwidmFyIGFuT2JqZWN0ID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2FuLW9iamVjdCcpO1xudmFyIGRlZmluZVByb3BlcnRpZXMgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvb2JqZWN0LWRlZmluZS1wcm9wZXJ0aWVzJyk7XG52YXIgZW51bUJ1Z0tleXMgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvZW51bS1idWcta2V5cycpO1xudmFyIGhpZGRlbktleXMgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvaGlkZGVuLWtleXMnKTtcbnZhciBodG1sID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2h0bWwnKTtcbnZhciBkb2N1bWVudENyZWF0ZUVsZW1lbnQgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvZG9jdW1lbnQtY3JlYXRlLWVsZW1lbnQnKTtcbnZhciBzaGFyZWRLZXkgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvc2hhcmVkLWtleScpO1xuXG52YXIgR1QgPSAnPic7XG52YXIgTFQgPSAnPCc7XG52YXIgUFJPVE9UWVBFID0gJ3Byb3RvdHlwZSc7XG52YXIgU0NSSVBUID0gJ3NjcmlwdCc7XG52YXIgSUVfUFJPVE8gPSBzaGFyZWRLZXkoJ0lFX1BST1RPJyk7XG5cbnZhciBFbXB0eUNvbnN0cnVjdG9yID0gZnVuY3Rpb24gKCkgeyAvKiBlbXB0eSAqLyB9O1xuXG52YXIgc2NyaXB0VGFnID0gZnVuY3Rpb24gKGNvbnRlbnQpIHtcbiAgcmV0dXJuIExUICsgU0NSSVBUICsgR1QgKyBjb250ZW50ICsgTFQgKyAnLycgKyBTQ1JJUFQgKyBHVDtcbn07XG5cbi8vIENyZWF0ZSBvYmplY3Qgd2l0aCBmYWtlIGBudWxsYCBwcm90b3R5cGU6IHVzZSBBY3RpdmVYIE9iamVjdCB3aXRoIGNsZWFyZWQgcHJvdG90eXBlXG52YXIgTnVsbFByb3RvT2JqZWN0VmlhQWN0aXZlWCA9IGZ1bmN0aW9uIChhY3RpdmVYRG9jdW1lbnQpIHtcbiAgYWN0aXZlWERvY3VtZW50LndyaXRlKHNjcmlwdFRhZygnJykpO1xuICBhY3RpdmVYRG9jdW1lbnQuY2xvc2UoKTtcbiAgdmFyIHRlbXAgPSBhY3RpdmVYRG9jdW1lbnQucGFyZW50V2luZG93Lk9iamVjdDtcbiAgYWN0aXZlWERvY3VtZW50ID0gbnVsbDsgLy8gYXZvaWQgbWVtb3J5IGxlYWtcbiAgcmV0dXJuIHRlbXA7XG59O1xuXG4vLyBDcmVhdGUgb2JqZWN0IHdpdGggZmFrZSBgbnVsbGAgcHJvdG90eXBlOiB1c2UgaWZyYW1lIE9iamVjdCB3aXRoIGNsZWFyZWQgcHJvdG90eXBlXG52YXIgTnVsbFByb3RvT2JqZWN0VmlhSUZyYW1lID0gZnVuY3Rpb24gKCkge1xuICAvLyBUaHJhc2gsIHdhc3RlIGFuZCBzb2RvbXk6IElFIEdDIGJ1Z1xuICB2YXIgaWZyYW1lID0gZG9jdW1lbnRDcmVhdGVFbGVtZW50KCdpZnJhbWUnKTtcbiAgdmFyIEpTID0gJ2phdmEnICsgU0NSSVBUICsgJzonO1xuICB2YXIgaWZyYW1lRG9jdW1lbnQ7XG4gIGlmcmFtZS5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuICBodG1sLmFwcGVuZENoaWxkKGlmcmFtZSk7XG4gIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS96bG9pcm9jay9jb3JlLWpzL2lzc3Vlcy80NzVcbiAgaWZyYW1lLnNyYyA9IFN0cmluZyhKUyk7XG4gIGlmcmFtZURvY3VtZW50ID0gaWZyYW1lLmNvbnRlbnRXaW5kb3cuZG9jdW1lbnQ7XG4gIGlmcmFtZURvY3VtZW50Lm9wZW4oKTtcbiAgaWZyYW1lRG9jdW1lbnQud3JpdGUoc2NyaXB0VGFnKCdkb2N1bWVudC5GPU9iamVjdCcpKTtcbiAgaWZyYW1lRG9jdW1lbnQuY2xvc2UoKTtcbiAgcmV0dXJuIGlmcmFtZURvY3VtZW50LkY7XG59O1xuXG4vLyBDaGVjayBmb3IgZG9jdW1lbnQuZG9tYWluIGFuZCBhY3RpdmUgeCBzdXBwb3J0XG4vLyBObyBuZWVkIHRvIHVzZSBhY3RpdmUgeCBhcHByb2FjaCB3aGVuIGRvY3VtZW50LmRvbWFpbiBpcyBub3Qgc2V0XG4vLyBzZWUgaHR0cHM6Ly9naXRodWIuY29tL2VzLXNoaW1zL2VzNS1zaGltL2lzc3Vlcy8xNTBcbi8vIHZhcmlhdGlvbiBvZiBodHRwczovL2dpdGh1Yi5jb20va2l0Y2FtYnJpZGdlL2VzNS1zaGltL2NvbW1pdC80ZjczOGFjMDY2MzQ2XG4vLyBhdm9pZCBJRSBHQyBidWdcbnZhciBhY3RpdmVYRG9jdW1lbnQ7XG52YXIgTnVsbFByb3RvT2JqZWN0ID0gZnVuY3Rpb24gKCkge1xuICB0cnkge1xuICAgIC8qIGdsb2JhbCBBY3RpdmVYT2JqZWN0ICovXG4gICAgYWN0aXZlWERvY3VtZW50ID0gZG9jdW1lbnQuZG9tYWluICYmIG5ldyBBY3RpdmVYT2JqZWN0KCdodG1sZmlsZScpO1xuICB9IGNhdGNoIChlcnJvcikgeyAvKiBpZ25vcmUgKi8gfVxuICBOdWxsUHJvdG9PYmplY3QgPSBhY3RpdmVYRG9jdW1lbnQgPyBOdWxsUHJvdG9PYmplY3RWaWFBY3RpdmVYKGFjdGl2ZVhEb2N1bWVudCkgOiBOdWxsUHJvdG9PYmplY3RWaWFJRnJhbWUoKTtcbiAgdmFyIGxlbmd0aCA9IGVudW1CdWdLZXlzLmxlbmd0aDtcbiAgd2hpbGUgKGxlbmd0aC0tKSBkZWxldGUgTnVsbFByb3RvT2JqZWN0W1BST1RPVFlQRV1bZW51bUJ1Z0tleXNbbGVuZ3RoXV07XG4gIHJldHVybiBOdWxsUHJvdG9PYmplY3QoKTtcbn07XG5cbmhpZGRlbktleXNbSUVfUFJPVE9dID0gdHJ1ZTtcblxuLy8gYE9iamVjdC5jcmVhdGVgIG1ldGhvZFxuLy8gaHR0cHM6Ly90YzM5LmVzL2VjbWEyNjIvI3NlYy1vYmplY3QuY3JlYXRlXG5tb2R1bGUuZXhwb3J0cyA9IE9iamVjdC5jcmVhdGUgfHwgZnVuY3Rpb24gY3JlYXRlKE8sIFByb3BlcnRpZXMpIHtcbiAgdmFyIHJlc3VsdDtcbiAgaWYgKE8gIT09IG51bGwpIHtcbiAgICBFbXB0eUNvbnN0cnVjdG9yW1BST1RPVFlQRV0gPSBhbk9iamVjdChPKTtcbiAgICByZXN1bHQgPSBuZXcgRW1wdHlDb25zdHJ1Y3RvcigpO1xuICAgIEVtcHR5Q29uc3RydWN0b3JbUFJPVE9UWVBFXSA9IG51bGw7XG4gICAgLy8gYWRkIFwiX19wcm90b19fXCIgZm9yIE9iamVjdC5nZXRQcm90b3R5cGVPZiBwb2x5ZmlsbFxuICAgIHJlc3VsdFtJRV9QUk9UT10gPSBPO1xuICB9IGVsc2UgcmVzdWx0ID0gTnVsbFByb3RvT2JqZWN0KCk7XG4gIHJldHVybiBQcm9wZXJ0aWVzID09PSB1bmRlZmluZWQgPyByZXN1bHQgOiBkZWZpbmVQcm9wZXJ0aWVzKHJlc3VsdCwgUHJvcGVydGllcyk7XG59O1xuIiwiLy8gYSBzdHJpbmcgb2YgYWxsIHZhbGlkIHVuaWNvZGUgd2hpdGVzcGFjZXNcbi8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBtYXgtbGVuXG5tb2R1bGUuZXhwb3J0cyA9ICdcXHUwMDA5XFx1MDAwQVxcdTAwMEJcXHUwMDBDXFx1MDAwRFxcdTAwMjBcXHUwMEEwXFx1MTY4MFxcdTIwMDBcXHUyMDAxXFx1MjAwMlxcdTIwMDNcXHUyMDA0XFx1MjAwNVxcdTIwMDZcXHUyMDA3XFx1MjAwOFxcdTIwMDlcXHUyMDBBXFx1MjAyRlxcdTIwNUZcXHUzMDAwXFx1MjAyOFxcdTIwMjlcXHVGRUZGJztcbiIsInZhciByZXF1aXJlT2JqZWN0Q29lcmNpYmxlID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL3JlcXVpcmUtb2JqZWN0LWNvZXJjaWJsZScpO1xudmFyIHdoaXRlc3BhY2VzID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL3doaXRlc3BhY2VzJyk7XG5cbnZhciB3aGl0ZXNwYWNlID0gJ1snICsgd2hpdGVzcGFjZXMgKyAnXSc7XG52YXIgbHRyaW0gPSBSZWdFeHAoJ14nICsgd2hpdGVzcGFjZSArIHdoaXRlc3BhY2UgKyAnKicpO1xudmFyIHJ0cmltID0gUmVnRXhwKHdoaXRlc3BhY2UgKyB3aGl0ZXNwYWNlICsgJyokJyk7XG5cbi8vIGBTdHJpbmcucHJvdG90eXBlLnsgdHJpbSwgdHJpbVN0YXJ0LCB0cmltRW5kLCB0cmltTGVmdCwgdHJpbVJpZ2h0IH1gIG1ldGhvZHMgaW1wbGVtZW50YXRpb25cbnZhciBjcmVhdGVNZXRob2QgPSBmdW5jdGlvbiAoVFlQRSkge1xuICByZXR1cm4gZnVuY3Rpb24gKCR0aGlzKSB7XG4gICAgdmFyIHN0cmluZyA9IFN0cmluZyhyZXF1aXJlT2JqZWN0Q29lcmNpYmxlKCR0aGlzKSk7XG4gICAgaWYgKFRZUEUgJiAxKSBzdHJpbmcgPSBzdHJpbmcucmVwbGFjZShsdHJpbSwgJycpO1xuICAgIGlmIChUWVBFICYgMikgc3RyaW5nID0gc3RyaW5nLnJlcGxhY2UocnRyaW0sICcnKTtcbiAgICByZXR1cm4gc3RyaW5nO1xuICB9O1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIC8vIGBTdHJpbmcucHJvdG90eXBlLnsgdHJpbUxlZnQsIHRyaW1TdGFydCB9YCBtZXRob2RzXG4gIC8vIGh0dHBzOi8vdGMzOS5lcy9lY21hMjYyLyNzZWMtc3RyaW5nLnByb3RvdHlwZS50cmltc3RhcnRcbiAgc3RhcnQ6IGNyZWF0ZU1ldGhvZCgxKSxcbiAgLy8gYFN0cmluZy5wcm90b3R5cGUueyB0cmltUmlnaHQsIHRyaW1FbmQgfWAgbWV0aG9kc1xuICAvLyBodHRwczovL3RjMzkuZXMvZWNtYTI2Mi8jc2VjLXN0cmluZy5wcm90b3R5cGUudHJpbWVuZFxuICBlbmQ6IGNyZWF0ZU1ldGhvZCgyKSxcbiAgLy8gYFN0cmluZy5wcm90b3R5cGUudHJpbWAgbWV0aG9kXG4gIC8vIGh0dHBzOi8vdGMzOS5lcy9lY21hMjYyLyNzZWMtc3RyaW5nLnByb3RvdHlwZS50cmltXG4gIHRyaW06IGNyZWF0ZU1ldGhvZCgzKVxufTtcbiIsIid1c2Ugc3RyaWN0JztcbnZhciBERVNDUklQVE9SUyA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9kZXNjcmlwdG9ycycpO1xudmFyIGdsb2JhbCA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9nbG9iYWwnKTtcbnZhciBpc0ZvcmNlZCA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9pcy1mb3JjZWQnKTtcbnZhciByZWRlZmluZSA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9yZWRlZmluZScpO1xudmFyIGhhcyA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9oYXMnKTtcbnZhciBjbGFzc29mID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2NsYXNzb2YtcmF3Jyk7XG52YXIgaW5oZXJpdElmUmVxdWlyZWQgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvaW5oZXJpdC1pZi1yZXF1aXJlZCcpO1xudmFyIHRvUHJpbWl0aXZlID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL3RvLXByaW1pdGl2ZScpO1xudmFyIGZhaWxzID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2ZhaWxzJyk7XG52YXIgY3JlYXRlID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL29iamVjdC1jcmVhdGUnKTtcbnZhciBnZXRPd25Qcm9wZXJ0eU5hbWVzID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL29iamVjdC1nZXQtb3duLXByb3BlcnR5LW5hbWVzJykuZjtcbnZhciBnZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvb2JqZWN0LWdldC1vd24tcHJvcGVydHktZGVzY3JpcHRvcicpLmY7XG52YXIgZGVmaW5lUHJvcGVydHkgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvb2JqZWN0LWRlZmluZS1wcm9wZXJ0eScpLmY7XG52YXIgdHJpbSA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9zdHJpbmctdHJpbScpLnRyaW07XG5cbnZhciBOVU1CRVIgPSAnTnVtYmVyJztcbnZhciBOYXRpdmVOdW1iZXIgPSBnbG9iYWxbTlVNQkVSXTtcbnZhciBOdW1iZXJQcm90b3R5cGUgPSBOYXRpdmVOdW1iZXIucHJvdG90eXBlO1xuXG4vLyBPcGVyYSB+MTIgaGFzIGJyb2tlbiBPYmplY3QjdG9TdHJpbmdcbnZhciBCUk9LRU5fQ0xBU1NPRiA9IGNsYXNzb2YoY3JlYXRlKE51bWJlclByb3RvdHlwZSkpID09IE5VTUJFUjtcblxuLy8gYFRvTnVtYmVyYCBhYnN0cmFjdCBvcGVyYXRpb25cbi8vIGh0dHBzOi8vdGMzOS5lcy9lY21hMjYyLyNzZWMtdG9udW1iZXJcbnZhciB0b051bWJlciA9IGZ1bmN0aW9uIChhcmd1bWVudCkge1xuICB2YXIgaXQgPSB0b1ByaW1pdGl2ZShhcmd1bWVudCwgZmFsc2UpO1xuICB2YXIgZmlyc3QsIHRoaXJkLCByYWRpeCwgbWF4Q29kZSwgZGlnaXRzLCBsZW5ndGgsIGluZGV4LCBjb2RlO1xuICBpZiAodHlwZW9mIGl0ID09ICdzdHJpbmcnICYmIGl0Lmxlbmd0aCA+IDIpIHtcbiAgICBpdCA9IHRyaW0oaXQpO1xuICAgIGZpcnN0ID0gaXQuY2hhckNvZGVBdCgwKTtcbiAgICBpZiAoZmlyc3QgPT09IDQzIHx8IGZpcnN0ID09PSA0NSkge1xuICAgICAgdGhpcmQgPSBpdC5jaGFyQ29kZUF0KDIpO1xuICAgICAgaWYgKHRoaXJkID09PSA4OCB8fCB0aGlyZCA9PT0gMTIwKSByZXR1cm4gTmFOOyAvLyBOdW1iZXIoJysweDEnKSBzaG91bGQgYmUgTmFOLCBvbGQgVjggZml4XG4gICAgfSBlbHNlIGlmIChmaXJzdCA9PT0gNDgpIHtcbiAgICAgIHN3aXRjaCAoaXQuY2hhckNvZGVBdCgxKSkge1xuICAgICAgICBjYXNlIDY2OiBjYXNlIDk4OiByYWRpeCA9IDI7IG1heENvZGUgPSA0OTsgYnJlYWs7IC8vIGZhc3QgZXF1YWwgb2YgL14wYlswMV0rJC9pXG4gICAgICAgIGNhc2UgNzk6IGNhc2UgMTExOiByYWRpeCA9IDg7IG1heENvZGUgPSA1NTsgYnJlYWs7IC8vIGZhc3QgZXF1YWwgb2YgL14wb1swLTddKyQvaVxuICAgICAgICBkZWZhdWx0OiByZXR1cm4gK2l0O1xuICAgICAgfVxuICAgICAgZGlnaXRzID0gaXQuc2xpY2UoMik7XG4gICAgICBsZW5ndGggPSBkaWdpdHMubGVuZ3RoO1xuICAgICAgZm9yIChpbmRleCA9IDA7IGluZGV4IDwgbGVuZ3RoOyBpbmRleCsrKSB7XG4gICAgICAgIGNvZGUgPSBkaWdpdHMuY2hhckNvZGVBdChpbmRleCk7XG4gICAgICAgIC8vIHBhcnNlSW50IHBhcnNlcyBhIHN0cmluZyB0byBhIGZpcnN0IHVuYXZhaWxhYmxlIHN5bWJvbFxuICAgICAgICAvLyBidXQgVG9OdW1iZXIgc2hvdWxkIHJldHVybiBOYU4gaWYgYSBzdHJpbmcgY29udGFpbnMgdW5hdmFpbGFibGUgc3ltYm9sc1xuICAgICAgICBpZiAoY29kZSA8IDQ4IHx8IGNvZGUgPiBtYXhDb2RlKSByZXR1cm4gTmFOO1xuICAgICAgfSByZXR1cm4gcGFyc2VJbnQoZGlnaXRzLCByYWRpeCk7XG4gICAgfVxuICB9IHJldHVybiAraXQ7XG59O1xuXG4vLyBgTnVtYmVyYCBjb25zdHJ1Y3RvclxuLy8gaHR0cHM6Ly90YzM5LmVzL2VjbWEyNjIvI3NlYy1udW1iZXItY29uc3RydWN0b3JcbmlmIChpc0ZvcmNlZChOVU1CRVIsICFOYXRpdmVOdW1iZXIoJyAwbzEnKSB8fCAhTmF0aXZlTnVtYmVyKCcwYjEnKSB8fCBOYXRpdmVOdW1iZXIoJysweDEnKSkpIHtcbiAgdmFyIE51bWJlcldyYXBwZXIgPSBmdW5jdGlvbiBOdW1iZXIodmFsdWUpIHtcbiAgICB2YXIgaXQgPSBhcmd1bWVudHMubGVuZ3RoIDwgMSA/IDAgOiB2YWx1ZTtcbiAgICB2YXIgZHVtbXkgPSB0aGlzO1xuICAgIHJldHVybiBkdW1teSBpbnN0YW5jZW9mIE51bWJlcldyYXBwZXJcbiAgICAgIC8vIGNoZWNrIG9uIDEuLmNvbnN0cnVjdG9yKGZvbykgY2FzZVxuICAgICAgJiYgKEJST0tFTl9DTEFTU09GID8gZmFpbHMoZnVuY3Rpb24gKCkgeyBOdW1iZXJQcm90b3R5cGUudmFsdWVPZi5jYWxsKGR1bW15KTsgfSkgOiBjbGFzc29mKGR1bW15KSAhPSBOVU1CRVIpXG4gICAgICAgID8gaW5oZXJpdElmUmVxdWlyZWQobmV3IE5hdGl2ZU51bWJlcih0b051bWJlcihpdCkpLCBkdW1teSwgTnVtYmVyV3JhcHBlcikgOiB0b051bWJlcihpdCk7XG4gIH07XG4gIGZvciAodmFyIGtleXMgPSBERVNDUklQVE9SUyA/IGdldE93blByb3BlcnR5TmFtZXMoTmF0aXZlTnVtYmVyKSA6IChcbiAgICAvLyBFUzM6XG4gICAgJ01BWF9WQUxVRSxNSU5fVkFMVUUsTmFOLE5FR0FUSVZFX0lORklOSVRZLFBPU0lUSVZFX0lORklOSVRZLCcgK1xuICAgIC8vIEVTMjAxNSAoaW4gY2FzZSwgaWYgbW9kdWxlcyB3aXRoIEVTMjAxNSBOdW1iZXIgc3RhdGljcyByZXF1aXJlZCBiZWZvcmUpOlxuICAgICdFUFNJTE9OLGlzRmluaXRlLGlzSW50ZWdlcixpc05hTixpc1NhZmVJbnRlZ2VyLE1BWF9TQUZFX0lOVEVHRVIsJyArXG4gICAgJ01JTl9TQUZFX0lOVEVHRVIscGFyc2VGbG9hdCxwYXJzZUludCxpc0ludGVnZXIsJyArXG4gICAgLy8gRVNOZXh0XG4gICAgJ2Zyb21TdHJpbmcscmFuZ2UnXG4gICkuc3BsaXQoJywnKSwgaiA9IDAsIGtleTsga2V5cy5sZW5ndGggPiBqOyBqKyspIHtcbiAgICBpZiAoaGFzKE5hdGl2ZU51bWJlciwga2V5ID0ga2V5c1tqXSkgJiYgIWhhcyhOdW1iZXJXcmFwcGVyLCBrZXkpKSB7XG4gICAgICBkZWZpbmVQcm9wZXJ0eShOdW1iZXJXcmFwcGVyLCBrZXksIGdldE93blByb3BlcnR5RGVzY3JpcHRvcihOYXRpdmVOdW1iZXIsIGtleSkpO1xuICAgIH1cbiAgfVxuICBOdW1iZXJXcmFwcGVyLnByb3RvdHlwZSA9IE51bWJlclByb3RvdHlwZTtcbiAgTnVtYmVyUHJvdG90eXBlLmNvbnN0cnVjdG9yID0gTnVtYmVyV3JhcHBlcjtcbiAgcmVkZWZpbmUoZ2xvYmFsLCBOVU1CRVIsIE51bWJlcldyYXBwZXIpO1xufVxuIiwiLy8gR29vZ2xlIE1hcCBzZXQtdXAgZnVjbnRpb25zXG5jb25zdCBpbml0TWFwID0gZnVuY3Rpb24oIG1hcElkLCBvcHRpb25zLCBjYWxsYmFjayApIHtcblx0aWYgKCFkb2N1bWVudC5nZXRFbGVtZW50QnlJZCggbWFwSWQgKSkgcmV0dXJuO1xuXHRjb25zdCBkZWZhdWx0cyA9IHtcblx0XHRsYXQ6IE51bWJlcigtMzcuODQxMjQpLFxuXHRcdGxuZzogTnVtYmVyKDE0NC45Mzg0MjEpLFxuXHRcdHN0eWxlIDogW3tcImZlYXR1cmVUeXBlXCI6XCJ3YXRlclwiLFwiZWxlbWVudFR5cGVcIjpcImdlb21ldHJ5XCIsXCJzdHlsZXJzXCI6W3tcImNvbG9yXCI6XCIjZTllOWU5XCJ9LHtcImxpZ2h0bmVzc1wiOjE3fV19LHtcImZlYXR1cmVUeXBlXCI6XCJsYW5kc2NhcGVcIixcImVsZW1lbnRUeXBlXCI6XCJnZW9tZXRyeVwiLFwic3R5bGVyc1wiOlt7XCJjb2xvclwiOlwiI2Y1ZjVmNVwifSx7XCJsaWdodG5lc3NcIjoyMH1dfSx7XCJmZWF0dXJlVHlwZVwiOlwicm9hZC5oaWdod2F5XCIsXCJlbGVtZW50VHlwZVwiOlwiZ2VvbWV0cnkuZmlsbFwiLFwic3R5bGVyc1wiOlt7XCJjb2xvclwiOlwiI2ZmZmZmZlwifSx7XCJsaWdodG5lc3NcIjoxN31dfSx7XCJmZWF0dXJlVHlwZVwiOlwicm9hZC5oaWdod2F5XCIsXCJlbGVtZW50VHlwZVwiOlwiZ2VvbWV0cnkuc3Ryb2tlXCIsXCJzdHlsZXJzXCI6W3tcImNvbG9yXCI6XCIjZmZmZmZmXCJ9LHtcImxpZ2h0bmVzc1wiOjI5fSx7XCJ3ZWlnaHRcIjowLjJ9XX0se1wiZmVhdHVyZVR5cGVcIjpcInJvYWQuYXJ0ZXJpYWxcIixcImVsZW1lbnRUeXBlXCI6XCJnZW9tZXRyeVwiLFwic3R5bGVyc1wiOlt7XCJjb2xvclwiOlwiI2ZmZmZmZlwifSx7XCJsaWdodG5lc3NcIjoxOH1dfSx7XCJmZWF0dXJlVHlwZVwiOlwicm9hZC5sb2NhbFwiLFwiZWxlbWVudFR5cGVcIjpcImdlb21ldHJ5XCIsXCJzdHlsZXJzXCI6W3tcImNvbG9yXCI6XCIjZmZmZmZmXCJ9LHtcImxpZ2h0bmVzc1wiOjE2fV19LHtcImZlYXR1cmVUeXBlXCI6XCJwb2lcIixcImVsZW1lbnRUeXBlXCI6XCJnZW9tZXRyeVwiLFwic3R5bGVyc1wiOlt7XCJjb2xvclwiOlwiI2Y1ZjVmNVwifSx7XCJsaWdodG5lc3NcIjoyMX1dfSx7XCJmZWF0dXJlVHlwZVwiOlwicG9pLnBhcmtcIixcImVsZW1lbnRUeXBlXCI6XCJnZW9tZXRyeVwiLFwic3R5bGVyc1wiOlt7XCJjb2xvclwiOlwiI2RlZGVkZVwifSx7XCJsaWdodG5lc3NcIjoyMX1dfSx7XCJlbGVtZW50VHlwZVwiOlwibGFiZWxzLnRleHQuc3Ryb2tlXCIsXCJzdHlsZXJzXCI6W3tcInZpc2liaWxpdHlcIjpcIm9uXCJ9LHtcImNvbG9yXCI6XCIjZmZmZmZmXCJ9LHtcImxpZ2h0bmVzc1wiOjE2fV19LHtcImVsZW1lbnRUeXBlXCI6XCJsYWJlbHMudGV4dC5maWxsXCIsXCJzdHlsZXJzXCI6W3tcInNhdHVyYXRpb25cIjozNn0se1wiY29sb3JcIjpcIiMzMzMzMzNcIn0se1wibGlnaHRuZXNzXCI6NDB9XX0se1wiZWxlbWVudFR5cGVcIjpcImxhYmVscy5pY29uXCIsXCJzdHlsZXJzXCI6W3tcInZpc2liaWxpdHlcIjpcIm9mZlwifV19LHtcImZlYXR1cmVUeXBlXCI6XCJ0cmFuc2l0XCIsXCJlbGVtZW50VHlwZVwiOlwiZ2VvbWV0cnlcIixcInN0eWxlcnNcIjpbe1wiY29sb3JcIjpcIiNmMmYyZjJcIn0se1wibGlnaHRuZXNzXCI6MTl9XX0se1wiZmVhdHVyZVR5cGVcIjpcImFkbWluaXN0cmF0aXZlXCIsXCJlbGVtZW50VHlwZVwiOlwiZ2VvbWV0cnkuZmlsbFwiLFwic3R5bGVyc1wiOlt7XCJjb2xvclwiOlwiI2ZlZmVmZVwifSx7XCJsaWdodG5lc3NcIjoyMH1dfSx7XCJmZWF0dXJlVHlwZVwiOlwiYWRtaW5pc3RyYXRpdmVcIixcImVsZW1lbnRUeXBlXCI6XCJnZW9tZXRyeS5zdHJva2VcIixcInN0eWxlcnNcIjpbe1wiY29sb3JcIjpcIiNmZWZlZmVcIn0se1wibGlnaHRuZXNzXCI6MTd9LHtcIndlaWdodFwiOjEuMn1dfV0sXG5cdFx0em9vbSA6IDE0XG5cdH07XG5cdGlmICghb3B0aW9ucykgb3B0aW9ucyA9IGRlZmF1bHRzO1xuXG5cdGxldCBsb2NhdGlvbiA9IHtcblx0XHRsYXQ6IE51bWJlcihkb2N1bWVudC5nZXRFbGVtZW50QnlJZCggbWFwSWQgKS5kYXRhc2V0LmxhdCksIFxuXHRcdGxuZzogTnVtYmVyKGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCBtYXBJZCApLmRhdGFzZXQubG5nKVxuXHR9O1xuXHRpZiAoICFsb2NhdGlvbi5sYXQgfHwgIWxvY2F0aW9uLmxuZyApIHtcblx0XHRsb2NhdGlvbi5sYXQgPSBkZWZhdWx0cy5sYXQ7XG5cdFx0bG9jYXRpb24ubG5nID0gZGVmYXVsdHMubG5nO1xuXHRcdGNvbnNvbGUud2FybiggJ0dNYXBzIGVsZW1lbnQgZGlkIG5vdCBoYXZlIHZhbGlkIFwiZGF0YS1sYXRcIiBvciBcImRhdGEtbG5nXCIgYXR0cmlidXRlcyBzZXQsIHVzaW5nIGRlZmF1bHQgdmFsdWVzLi4uJyApO1xuXHR9XG5cdHZhciBpY29uID0ge1xuXHRcdFx0dXJsOiBvcHRpb25zLmljb24uaW1nIHx8IGAke1dQLnRlbXBsYXRlVXJsfS9pbWFnZXMvbWFya2VyLnBuZ2AsXG5cdFx0XHRzaXplOiBuZXcgZ29vZ2xlLm1hcHMuU2l6ZSggMjgsIDM5ICksXG5cdFx0XHRhbmNob3I6IG5ldyBnb29nbGUubWFwcy5Qb2ludCggMTQsIDM5ICksXG5cdFx0XHRzY2FsZWRTaXplOiBuZXcgZ29vZ2xlLm1hcHMuU2l6ZSggMjgsIDM5IClcblx0fTtcblx0dmFyIHN2Z0ljb24gPSB7XG5cdFx0cGF0aDogJ00xMCwyNiBDMy4zMzMzMzMzMywxOS4wMTUyMzE3IDAsMTMuNjgxODk4MyAwLDEwIEMwLDQuNDc3MTUyNSA0LjQ3NzE1MjUsMCAxMCwwIEMxNS41MjI4NDc1LDAgMjAsNC40NzcxNTI1IDIwLDEwIEMyMCwxMy42ODE4OTgzIDE2LjY2NjY2NjcsMTkuMDE1MjMxNyAxMCwyNiBaIE0xMCwxNCBDMTIuMjA5MTM5LDE0IDE0LDEyLjIwOTEzOSAxNCwxMCBDMTQsNy43OTA4NjEgMTIuMjA5MTM5LDYgMTAsNiBDNy43OTA4NjEsNiA2LDcuNzkwODYxIDYsMTAgQzYsMTIuMjA5MTM5IDcuNzkwODYxLDE0IDEwLDE0IFonLFxuXHRcdGZpbGxDb2xvcjogJyNmYTAwMDAnLFxuXHRcdGFuY2hvcjogbmV3IGdvb2dsZS5tYXBzLlBvaW50KCAxMCwgMjYgKSxcblx0XHRmaWxsT3BhY2l0eTogMSxcblx0XHRzdHJva2VXZWlnaHQ6IDAsXG5cdFx0c2NhbGU6IDFcblx0fTtcblx0dmFyIG1hcCA9IG5ldyBnb29nbGUubWFwcy5NYXAoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoIG1hcElkICksIHtcblx0XHR6b29tOiBvcHRpb25zLnpvb20gfHwgZGVmYXVsdHMuem9vbSxcblx0XHR6b29tQ29udHJvbDogXHRcdFx0XHRmYWxzZSxcblx0XHRtYXBUeXBlQ29udHJvbDogXHRcdGZhbHNlLFxuXHRcdHNjYWxlQ29udHJvbDogXHRcdFx0ZmFsc2UsXG5cdFx0c3RyZWV0Vmlld0NvbnRyb2w6IFx0ZmFsc2UsXG5cdFx0cm90YXRlQ29udHJvbDogXHRcdFx0ZmFsc2UsXG5cdFx0ZnVsbHNjcmVlbkNvbnRyb2w6IFx0ZmFsc2UsXG5cdFx0Y2VudGVyOiBsb2NhdGlvbixcblx0XHRzdHlsZXM6IG9wdGlvbnMuc3R5bGUgfHwgZGVmYXVsdHMuc3R5bGVcblx0fSk7XG5cdFxuXHR2YXIgbWFya2VyID0gbmV3IGdvb2dsZS5tYXBzLk1hcmtlcih7XG5cdFx0cG9zaXRpb246IGxvY2F0aW9uLFxuXHRcdG1hcDogbWFwLFxuXHRcdGljb246IGljb25cblx0fSk7XG5cdGNhbGxiYWNrKCBtYXAgKTtcbn1cblxuLy8gSGFuZGxlIGxvYWRpbmcgb2YgR01hcHMgc2NyaXB0XG5jb25zdCBsb2FkU2NyaXB0ID0gZnVuY3Rpb24odXJsLCBjb21wbGV0ZUNhbGxiYWNrKSB7XG5cdHZhciBzY3JpcHQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzY3JpcHQnKSwgZG9uZSA9IGZhbHNlLFxuXHRcdFx0aGVhZCA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKFwiaGVhZFwiKVswXTtcblx0c2NyaXB0LnNyYyA9IHVybDtcblx0c2NyaXB0Lm9ubG9hZCA9IHNjcmlwdC5vbnJlYWR5c3RhdGVjaGFuZ2UgPSBmdW5jdGlvbigpe1xuXHRcdGlmICggIWRvbmUgJiYgKCF0aGlzLnJlYWR5U3RhdGUgfHxcblx0XHRcdFx0dGhpcy5yZWFkeVN0YXRlID09IFwibG9hZGVkXCIgfHwgdGhpcy5yZWFkeVN0YXRlID09IFwiY29tcGxldGVcIikgKSB7XG5cdFx0XHRkb25lID0gdHJ1ZTtcblx0XHRcdGlmIChjb21wbGV0ZUNhbGxiYWNrKSBjb21wbGV0ZUNhbGxiYWNrKCk7XG5cdFx0XHQvLyBJRSBtZW1vcnkgbGVha1xuXHRcdFx0c2NyaXB0Lm9ubG9hZCA9IHNjcmlwdC5vbnJlYWR5c3RhdGVjaGFuZ2UgPSBudWxsO1xuXHRcdFx0aGVhZC5yZW1vdmVDaGlsZCggc2NyaXB0ICk7XG5cdFx0fVxuXHR9O1xuXHRoZWFkLmFwcGVuZENoaWxkKHNjcmlwdCk7XG59XG5cbi8vIFNldCB1cCBNYXBzXG5jb25zdCBzZXR1cEdvb2dsZU1hcHNBcGkgPSBmdW5jdGlvbiggbWFwc0FycmF5LCBvcHRpb25zICkge1xuXHRjb25zdCBtYXBFbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCBtYXBzQXJyYXlbMF0gKTtcblx0aWYgKCBtYXBFbCApIHtcblx0XHRsb2FkU2NyaXB0KCBcblx0XHRcdCdodHRwczovL21hcHMuZ29vZ2xlYXBpcy5jb20vbWFwcy9hcGkvanM/a2V5PUFJemFTeUJiZkJBcExyLS12dUMyV2F0ckdadGtkQTVsLW1WNDJwRScsIFxuXHRcdFx0ZnVuY3Rpb24oKSB7IHByb2Nlc3NNYXBzKCBtYXBzQXJyYXksIG9wdGlvbnMgKSB9XG5cdFx0KTtcblx0fVxufVxuXG4vLyBQYW4gTWFwXG5jb25zdCBwYW5NYXAgPSBmdW5jdGlvbiggbWFwSWQsIG9wdGlvbnMgKSB7XG5cdGluaXRNYXAoIG1hcElkLCBvcHRpb25zLCBmdW5jdGlvbiggbWFwICkgeyBtYXAucGFuQnkoMCwgMCkgfSApXG59XG5cbi8vIFByb2Nlc3MgTWFwc1xuY29uc3QgcHJvY2Vzc01hcHMgPSBmdW5jdGlvbiggbWFwc0FycmF5LCBvcHRpb25zICkge1xuXHRpZiAoICFBcnJheS5pc0FycmF5KCBtYXBzQXJyYXkgKSApIHJldHVybiBjb25zb2xlLmVycm9yKCAnTmVlZCB0byBwYXNzIGFuIGFycmF5IGlmIEdvb2dsZSBNYXAgSURzJyApO1xuXHRtYXBzQXJyYXkuZm9yRWFjaCggbSA9PiB7XG5cdFx0cGFuTWFwKCBtLCBvcHRpb25zICk7XG5cdH0pO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHsgXG5cdHNldHVwR29vZ2xlTWFwc0FwaSBcbn0iLCIvLyBFeHRlcm5hbCBQbHVnaW5zICYgUG9seWZpbGxzXG5pbXBvcnQgb2JqZWN0Rml0SW1hZ2VzIGZyb20gJ29iamVjdC1maXQtaW1hZ2VzJztcblxuLy8gSWYgdXNpbmcgZmxpY2tpdHksIHVuY29tbWVudCB0aGUgcmVxdWlyZXNcbmltcG9ydCBGbGlja2l0eSBmcm9tICdmbGlja2l0eSc7XG5pbXBvcnQgJ2ZsaWNraXR5LWltYWdlc2xvYWRlZCc7XG5cbi8vIE15IENvbXBvbmVudHNcbmltcG9ydCBOYXYgZnJvbSAnLi9jb21wb25lbnRzL25hdmlnYXRpb24nO1xuaW1wb3J0IE1hcHMgZnJvbSAnLi9jb21wb25lbnRzL2dtYXBzJztcbi8qID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICBFeGVjdXRpb24gY29kZVxuICA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT0gKi9cblxuLy8gR29vZ2xlIE1BUFxuY29uc3Qgc25henp5U3R5bGUgPSBbeyBmZWF0dXJlVHlwZTogJ2FsbCcsIGVsZW1lbnRUeXBlOiAnYWxsJywgc3R5bGVyczogW3sgdmlzaWJpbGl0eTogJ29uJyB9XSB9LCB7IGZlYXR1cmVUeXBlOiAnYWxsJywgZWxlbWVudFR5cGU6ICdsYWJlbHMnLCBzdHlsZXJzOiBbeyB2aXNpYmlsaXR5OiAnb2ZmJyB9LCB7IHNhdHVyYXRpb246ICctMTAwJyB9XSB9LCB7IGZlYXR1cmVUeXBlOiAnYWxsJywgZWxlbWVudFR5cGU6ICdsYWJlbHMudGV4dC5maWxsJywgc3R5bGVyczogW3sgc2F0dXJhdGlvbjogMzYgfSwgeyBjb2xvcjogJyMwMDAwMDAnIH0sIHsgbGlnaHRuZXNzOiA0MCB9LCB7IHZpc2liaWxpdHk6ICdvZmYnIH1dIH0sIHsgZmVhdHVyZVR5cGU6ICdhbGwnLCBlbGVtZW50VHlwZTogJ2xhYmVscy50ZXh0LnN0cm9rZScsIHN0eWxlcnM6IFt7IHZpc2liaWxpdHk6ICdvZmYnIH0sIHsgY29sb3I6ICcjMDAwMDAwJyB9LCB7IGxpZ2h0bmVzczogMTYgfV0gfSwgeyBmZWF0dXJlVHlwZTogJ2FsbCcsIGVsZW1lbnRUeXBlOiAnbGFiZWxzLmljb24nLCBzdHlsZXJzOiBbeyB2aXNpYmlsaXR5OiAnb2ZmJyB9XSB9LCB7IGZlYXR1cmVUeXBlOiAnYWRtaW5pc3RyYXRpdmUnLCBlbGVtZW50VHlwZTogJ2dlb21ldHJ5LmZpbGwnLCBzdHlsZXJzOiBbeyBjb2xvcjogJyMwMDAwMDAnIH0sIHsgbGlnaHRuZXNzOiAyMCB9XSB9LCB7IGZlYXR1cmVUeXBlOiAnYWRtaW5pc3RyYXRpdmUnLCBlbGVtZW50VHlwZTogJ2dlb21ldHJ5LnN0cm9rZScsIHN0eWxlcnM6IFt7IGNvbG9yOiAnIzAwMDAwMCcgfSwgeyBsaWdodG5lc3M6IDE3IH0sIHsgd2VpZ2h0OiAxLjIgfV0gfSwgeyBmZWF0dXJlVHlwZTogJ2xhbmRzY2FwZScsIGVsZW1lbnRUeXBlOiAnZ2VvbWV0cnknLCBzdHlsZXJzOiBbeyBjb2xvcjogJyMwMDAwMDAnIH0sIHsgbGlnaHRuZXNzOiAyMCB9XSB9LCB7IGZlYXR1cmVUeXBlOiAnbGFuZHNjYXBlJywgZWxlbWVudFR5cGU6ICdnZW9tZXRyeS5maWxsJywgc3R5bGVyczogW3sgY29sb3I6ICcjNGQ2MDU5JyB9XSB9LCB7IGZlYXR1cmVUeXBlOiAnbGFuZHNjYXBlJywgZWxlbWVudFR5cGU6ICdnZW9tZXRyeS5zdHJva2UnLCBzdHlsZXJzOiBbeyBjb2xvcjogJyM0ZDYwNTknIH1dIH0sIHsgZmVhdHVyZVR5cGU6ICdsYW5kc2NhcGUubmF0dXJhbCcsIGVsZW1lbnRUeXBlOiAnZ2VvbWV0cnkuZmlsbCcsIHN0eWxlcnM6IFt7IGNvbG9yOiAnIzRkNjA1OScgfV0gfSwgeyBmZWF0dXJlVHlwZTogJ3BvaScsIGVsZW1lbnRUeXBlOiAnZ2VvbWV0cnknLCBzdHlsZXJzOiBbeyBsaWdodG5lc3M6IDIxIH1dIH0sIHsgZmVhdHVyZVR5cGU6ICdwb2knLCBlbGVtZW50VHlwZTogJ2dlb21ldHJ5LmZpbGwnLCBzdHlsZXJzOiBbeyBjb2xvcjogJyM0ZDYwNTknIH1dIH0sIHsgZmVhdHVyZVR5cGU6ICdwb2knLCBlbGVtZW50VHlwZTogJ2dlb21ldHJ5LnN0cm9rZScsIHN0eWxlcnM6IFt7IGNvbG9yOiAnIzRkNjA1OScgfV0gfSwgeyBmZWF0dXJlVHlwZTogJ3JvYWQnLCBlbGVtZW50VHlwZTogJ2dlb21ldHJ5Jywgc3R5bGVyczogW3sgdmlzaWJpbGl0eTogJ29uJyB9LCB7IGNvbG9yOiAnIzdmOGQ4OScgfV0gfSwgeyBmZWF0dXJlVHlwZTogJ3JvYWQnLCBlbGVtZW50VHlwZTogJ2dlb21ldHJ5LmZpbGwnLCBzdHlsZXJzOiBbeyBjb2xvcjogJyM3ZjhkODknIH1dIH0sIHsgZmVhdHVyZVR5cGU6ICdyb2FkLmhpZ2h3YXknLCBlbGVtZW50VHlwZTogJ2dlb21ldHJ5LmZpbGwnLCBzdHlsZXJzOiBbeyBjb2xvcjogJyM3ZjhkODknIH0sIHsgbGlnaHRuZXNzOiAxNyB9XSB9LCB7IGZlYXR1cmVUeXBlOiAncm9hZC5oaWdod2F5JywgZWxlbWVudFR5cGU6ICdnZW9tZXRyeS5zdHJva2UnLCBzdHlsZXJzOiBbeyBjb2xvcjogJyM3ZjhkODknIH0sIHsgbGlnaHRuZXNzOiAyOSB9LCB7IHdlaWdodDogMC4yIH1dIH0sIHsgZmVhdHVyZVR5cGU6ICdyb2FkLmFydGVyaWFsJywgZWxlbWVudFR5cGU6ICdnZW9tZXRyeScsIHN0eWxlcnM6IFt7IGNvbG9yOiAnIzAwMDAwMCcgfSwgeyBsaWdodG5lc3M6IDE4IH1dIH0sIHsgZmVhdHVyZVR5cGU6ICdyb2FkLmFydGVyaWFsJywgZWxlbWVudFR5cGU6ICdnZW9tZXRyeS5maWxsJywgc3R5bGVyczogW3sgY29sb3I6ICcjN2Y4ZDg5JyB9XSB9LCB7IGZlYXR1cmVUeXBlOiAncm9hZC5hcnRlcmlhbCcsIGVsZW1lbnRUeXBlOiAnZ2VvbWV0cnkuc3Ryb2tlJywgc3R5bGVyczogW3sgY29sb3I6ICcjN2Y4ZDg5JyB9XSB9LCB7IGZlYXR1cmVUeXBlOiAncm9hZC5sb2NhbCcsIGVsZW1lbnRUeXBlOiAnZ2VvbWV0cnknLCBzdHlsZXJzOiBbeyBjb2xvcjogJyMwMDAwMDAnIH0sIHsgbGlnaHRuZXNzOiAxNiB9XSB9LCB7IGZlYXR1cmVUeXBlOiAncm9hZC5sb2NhbCcsIGVsZW1lbnRUeXBlOiAnZ2VvbWV0cnkuZmlsbCcsIHN0eWxlcnM6IFt7IGNvbG9yOiAnIzdmOGQ4OScgfV0gfSwgeyBmZWF0dXJlVHlwZTogJ3JvYWQubG9jYWwnLCBlbGVtZW50VHlwZTogJ2dlb21ldHJ5LnN0cm9rZScsIHN0eWxlcnM6IFt7IGNvbG9yOiAnIzdmOGQ4OScgfV0gfSwgeyBmZWF0dXJlVHlwZTogJ3RyYW5zaXQnLCBlbGVtZW50VHlwZTogJ2dlb21ldHJ5Jywgc3R5bGVyczogW3sgY29sb3I6ICcjMDAwMDAwJyB9LCB7IGxpZ2h0bmVzczogMTkgfV0gfSwgeyBmZWF0dXJlVHlwZTogJ3dhdGVyJywgZWxlbWVudFR5cGU6ICdhbGwnLCBzdHlsZXJzOiBbeyBjb2xvcjogJyMyYjM2MzgnIH0sIHsgdmlzaWJpbGl0eTogJ29uJyB9XSB9LCB7IGZlYXR1cmVUeXBlOiAnd2F0ZXInLCBlbGVtZW50VHlwZTogJ2dlb21ldHJ5Jywgc3R5bGVyczogW3sgY29sb3I6ICcjMmIzNjM4JyB9LCB7IGxpZ2h0bmVzczogMTcgfV0gfSwgeyBmZWF0dXJlVHlwZTogJ3dhdGVyJywgZWxlbWVudFR5cGU6ICdnZW9tZXRyeS5maWxsJywgc3R5bGVyczogW3sgY29sb3I6ICcjMjQyODJiJyB9XSB9LCB7IGZlYXR1cmVUeXBlOiAnd2F0ZXInLCBlbGVtZW50VHlwZTogJ2dlb21ldHJ5LnN0cm9rZScsIHN0eWxlcnM6IFt7IGNvbG9yOiAnIzI0MjgyYicgfV0gfSwgeyBmZWF0dXJlVHlwZTogJ3dhdGVyJywgZWxlbWVudFR5cGU6ICdsYWJlbHMnLCBzdHlsZXJzOiBbeyB2aXNpYmlsaXR5OiAnb2ZmJyB9XSB9LCB7IGZlYXR1cmVUeXBlOiAnd2F0ZXInLCBlbGVtZW50VHlwZTogJ2xhYmVscy50ZXh0Jywgc3R5bGVyczogW3sgdmlzaWJpbGl0eTogJ29mZicgfV0gfSwgeyBmZWF0dXJlVHlwZTogJ3dhdGVyJywgZWxlbWVudFR5cGU6ICdsYWJlbHMudGV4dC5maWxsJywgc3R5bGVyczogW3sgdmlzaWJpbGl0eTogJ29mZicgfV0gfSwgeyBmZWF0dXJlVHlwZTogJ3dhdGVyJywgZWxlbWVudFR5cGU6ICdsYWJlbHMudGV4dC5zdHJva2UnLCBzdHlsZXJzOiBbeyB2aXNpYmlsaXR5OiAnb2ZmJyB9XSB9LCB7IGZlYXR1cmVUeXBlOiAnd2F0ZXInLCBlbGVtZW50VHlwZTogJ2xhYmVscy5pY29uJywgc3R5bGVyczogW3sgdmlzaWJpbGl0eTogJ29mZicgfV0gfV07XG5cbk1hcHMuc2V0dXBHb29nbGVNYXBzQXBpKFsnbWFwJ10sIHtcbiAgc3R5bGU6IHNuYXp6eVN0eWxlLFxuICB6b29tOiAxOCxcbiAgaWNvbjoge1xuICAgIC8qIGdsb2JhbCBXUCAqL1xuICAgIGltZzogYCR7V1AudGVtcGxhdGVVcmx9L2ltYWdlcy9tYXJrZXJfYWx0LnBuZ2AsXG4gIH0sXG59KTtcblxub2JqZWN0Rml0SW1hZ2VzKCk7XG5cbk5hdi5pbml0KCk7XG5cbmNvbnN0IHN0ZFNsaWRlcnMgPSBbLi4uZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLnN0YW5kYXJkLXNsaWRlcicpXTtcblxuaWYgKHN0ZFNsaWRlcnMpIHtcbiAgc3RkU2xpZGVycy5mb3JFYWNoKChzKSA9PiB7XG4gICAgY29uc3Qgc2xpZGVyID0gbmV3IEZsaWNraXR5KHMsIHtcbiAgICAgIGNlbGxBbGlnbjogJ2xlZnQnLFxuICAgICAgd3JhcEFyb3VuZDogdHJ1ZSxcbiAgICAgIGltYWdlc0xvYWRlZDogdHJ1ZSxcbiAgICAgIHdhdGNoQ1NTOiB0cnVlLFxuICAgICAgY29udGFpbjogdHJ1ZSxcbiAgICB9KTtcbiAgICByZXR1cm4gc2xpZGVyO1xuICB9KTtcbn1cbiJdLCJuYW1lcyI6WyJnbG9iYWwiLCJjbGFzc29mIiwiSW5kZXhlZE9iamVjdCIsImRvY3VtZW50IiwiREVTQ1JJUFRPUlMiLCJjcmVhdGVFbGVtZW50IiwiSUU4X0RPTV9ERUZJTkUiLCJwcm9wZXJ0eUlzRW51bWVyYWJsZU1vZHVsZSIsImRlZmluZVByb3BlcnR5TW9kdWxlIiwic3RvcmUiLCJXZWFrTWFwIiwiaGFzIiwiTkFUSVZFX1dFQUtfTUFQIiwic2hhcmVkIiwib2JqZWN0SGFzIiwiSW50ZXJuYWxTdGF0ZU1vZHVsZSIsIm1pbiIsInJlcXVpcmUkJDAiLCJoaWRkZW5LZXlzIiwiaW50ZXJuYWxPYmplY3RLZXlzIiwiZ2V0T3duUHJvcGVydHlOYW1lc01vZHVsZSIsImdldE93blByb3BlcnR5U3ltYm9sc01vZHVsZSIsImdldE93blByb3BlcnR5RGVzY3JpcHRvck1vZHVsZSIsImdldE93blByb3BlcnR5RGVzY3JpcHRvciIsImlzRm9yY2VkIiwiYUZ1bmN0aW9uIiwiTkFUSVZFX1NZTUJPTCIsIlN5bWJvbCIsIlVTRV9TWU1CT0xfQVNfVUlEIiwiY3JlYXRlTWV0aG9kIiwiYmluZCIsIiQiLCJmb3JFYWNoIiwiRE9NSXRlcmFibGVzIiwidGhpcyIsInJlcXVpcmUkJDEiLCJyZXF1aXJlJCQyIiwicmVxdWlyZSQkMyIsInJlcXVpcmUkJDQiLCJyZXF1aXJlJCQ1IiwicmVxdWlyZSQkNiIsIl90b0NvbnN1bWFibGVBcnJheSIsImJ1cmdlciIsInF1ZXJ5U2VsZWN0b3IiLCJuYXZfdGFyZ2V0IiwidG9nZ2xlUmVzcG9uc2l2ZU1lbnUiLCJJU19OQVZfT1BFTiIsImJvZHkiLCJjbGFzc0xpc3QiLCJjb250YWlucyIsImZsb2F0aW5nTmF2IiwiY2xvc2VOYXYiLCJvcGVuTmF2IiwiYWRkIiwiZGlzYWJsZUJvZHlTY3JvbGwiLCJyZW1vdmUiLCJlbmFibGVCb2R5U2Nyb2xsIiwiaW5pdCIsImFkZEV2ZW50TGlzdGVuZXIiLCJzZXRQcm90b3R5cGVPZiIsImRlZmluZVByb3BlcnRpZXMiLCJkZWZpbmVQcm9wZXJ0eSIsImNyZWF0ZSIsImtleXMiLCJpbml0TWFwIiwibWFwSWQiLCJvcHRpb25zIiwiY2FsbGJhY2siLCJnZXRFbGVtZW50QnlJZCIsImRlZmF1bHRzIiwibGF0IiwiTnVtYmVyIiwibG5nIiwic3R5bGUiLCJ6b29tIiwibG9jYXRpb24iLCJkYXRhc2V0IiwiY29uc29sZSIsIndhcm4iLCJpY29uIiwidXJsIiwiaW1nIiwiV1AiLCJ0ZW1wbGF0ZVVybCIsInNpemUiLCJnb29nbGUiLCJtYXBzIiwiU2l6ZSIsImFuY2hvciIsIlBvaW50Iiwic2NhbGVkU2l6ZSIsInN2Z0ljb24iLCJwYXRoIiwiZmlsbENvbG9yIiwiZmlsbE9wYWNpdHkiLCJzdHJva2VXZWlnaHQiLCJzY2FsZSIsIm1hcCIsIk1hcCIsInpvb21Db250cm9sIiwibWFwVHlwZUNvbnRyb2wiLCJzY2FsZUNvbnRyb2wiLCJzdHJlZXRWaWV3Q29udHJvbCIsInJvdGF0ZUNvbnRyb2wiLCJmdWxsc2NyZWVuQ29udHJvbCIsImNlbnRlciIsInN0eWxlcyIsIm1hcmtlciIsIk1hcmtlciIsInBvc2l0aW9uIiwibG9hZFNjcmlwdCIsImNvbXBsZXRlQ2FsbGJhY2siLCJzY3JpcHQiLCJkb25lIiwiaGVhZCIsImdldEVsZW1lbnRzQnlUYWdOYW1lIiwic3JjIiwib25sb2FkIiwib25yZWFkeXN0YXRlY2hhbmdlIiwicmVhZHlTdGF0ZSIsInJlbW92ZUNoaWxkIiwiYXBwZW5kQ2hpbGQiLCJzZXR1cEdvb2dsZU1hcHNBcGkiLCJtYXBzQXJyYXkiLCJtYXBFbCIsInByb2Nlc3NNYXBzIiwicGFuTWFwIiwicGFuQnkiLCJBcnJheSIsImlzQXJyYXkiLCJlcnJvciIsIm0iLCJzbmF6enlTdHlsZSIsImZlYXR1cmVUeXBlIiwiZWxlbWVudFR5cGUiLCJzdHlsZXJzIiwidmlzaWJpbGl0eSIsInNhdHVyYXRpb24iLCJjb2xvciIsImxpZ2h0bmVzcyIsIndlaWdodCIsIk1hcHMiLCJvYmplY3RGaXRJbWFnZXMiLCJOYXYiLCJzdGRTbGlkZXJzIiwicXVlcnlTZWxlY3RvckFsbCIsInMiLCJzbGlkZXIiLCJGbGlja2l0eSIsImNlbGxBbGlnbiIsIndyYXBBcm91bmQiLCJpbWFnZXNMb2FkZWQiLCJ3YXRjaENTUyIsImNvbnRhaW4iXSwibWFwcGluZ3MiOiI7Ozs7Ozs7OztDQUFBLElBQUksS0FBSyxHQUFHLFVBQVUsRUFBRSxFQUFFO0NBQzFCLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxDQUFDLElBQUksSUFBSSxJQUFJLElBQUksRUFBRSxDQUFDO0NBQ3JDLENBQUMsQ0FBQztBQUNGO0NBQ0E7Q0FDQSxZQUFjO0NBQ2Q7Q0FDQSxFQUFFLEtBQUssQ0FBQyxPQUFPLFVBQVUsSUFBSSxRQUFRLElBQUksVUFBVSxDQUFDO0NBQ3BELEVBQUUsS0FBSyxDQUFDLE9BQU8sTUFBTSxJQUFJLFFBQVEsSUFBSSxNQUFNLENBQUM7Q0FDNUMsRUFBRSxLQUFLLENBQUMsT0FBTyxJQUFJLElBQUksUUFBUSxJQUFJLElBQUksQ0FBQztDQUN4QyxFQUFFLEtBQUssQ0FBQyxPQUFPQSxjQUFNLElBQUksUUFBUSxJQUFJQSxjQUFNLENBQUM7Q0FDNUM7Q0FDQSxFQUFFLENBQUMsWUFBWSxFQUFFLE9BQU8sSUFBSSxDQUFDLEVBQUUsR0FBRyxJQUFJLFFBQVEsQ0FBQyxhQUFhLENBQUMsRUFBRTs7Q0NaL0QsU0FBYyxHQUFHLFVBQVUsSUFBSSxFQUFFO0NBQ2pDLEVBQUUsSUFBSTtDQUNOLElBQUksT0FBTyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUM7Q0FDcEIsR0FBRyxDQUFDLE9BQU8sS0FBSyxFQUFFO0NBQ2xCLElBQUksT0FBTyxJQUFJLENBQUM7Q0FDaEIsR0FBRztDQUNILENBQUM7O0NDSkQ7Q0FDQSxlQUFjLEdBQUcsQ0FB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QUssQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFLENBQUM7Q0FDN0MsQ0FBQyxDQUFDO0FBQ0Y7Q0FDQSxLQUFLLENBQUMsWUFBWSxHQUFHLFdBQVc7Q0FDaEMsRUFBRSxPQUFPLElBQUksQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFLENBQUM7Q0FDL0MsQ0FBQyxDQUFDO0FBQ0Y7Q0FDQTtDQUNBLEtBQUssQ0FBQyxhQUFhLEdBQUcsV0FBVztDQUNqQztDQUNBLEVBQUUsSUFBSSxDQUFDLFVBQVUsRUFBRSxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUM7Q0FDaEM7Q0FDQSxFQUFFLElBQUksQ0FBQyxjQUFjLEVBQUUsQ0FBQyxFQUFFLENBQUM7Q0FDM0IsQ0FBQyxDQUFDO0FBQ0Y7Q0FDQTtDQUNBO0NBQ0E7Q0FDQTtDQUNBLEtBQUssQ0FBQyxjQUFjLEdBQUcsVUFBVSxLQUFLLEdBQUc7Q0FDekMsRUFBRSxLQUFLLEdBQUcsS0FBSyxJQUFJLENBQUMsQ0FBQztDQUNyQjtDQUNBO0NBQ0EsRUFBRSxJQUFJLENBQUMsYUFBYSxHQUFHLEtBQUssR0FBRyxJQUFJLENBQUMsYUFBYSxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7Q0FDM0QsRUFBRSxJQUFJLEtBQUssR0FBRyxDQUFDLENBQUM7Q0FDaEI7Q0FDQSxFQUFFLEtBQUssS0FBSyxHQUFHLENBQUMsR0FBRztDQUNuQixJQUFJLElBQUksU0FBUyxHQUFHLElBQUksQ0FBQyxLQUFLLEVBQUUsS0FBSyxHQUFHLENBQUMsRUFBRSxDQUFDO0NBQzVDLElBQUksS0FBSyxHQUFHLFNBQVMsQ0FBQyxDQUFDLEdBQUcsU0FBUyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUM7Q0FDcEQsR0FBRztDQUNILEVBQUUsSUFBSSxHQUFHLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUM7Q0FDOUIsRUFBRSxNQUFNLElBQUksQ0FBQyxHQUFHLEtBQUssRUFBRSxDQUFDLEdBQUcsR0FBRyxFQUFFLENBQUMsRUFB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
