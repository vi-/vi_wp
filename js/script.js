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
	  Function('return this')();

	var fails = function (exec) {
	  try {
	    return !!exec();
	  } catch (error) {
	    return true;
	  }
	};

	// Thank's IE8 for his funny defineProperty
	var descriptors = !fails(function () {
	  return Object.defineProperty({}, 'a', { get: function () { return 7; } }).a != 7;
	});

	var nativePropertyIsEnumerable = {}.propertyIsEnumerable;
	var getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;

	// Nashorn ~ JDK8 bug
	var NASHORN_BUG = getOwnPropertyDescriptor && !nativePropertyIsEnumerable.call({ 1: 2 }, 1);

	// `Object.prototype.propertyIsEnumerable` method implementation
	// https://tc39.github.io/ecma262/#sec-object.prototype.propertyisenumerable
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
	// https://tc39.github.io/ecma262/#sec-requireobjectcoercible
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
	// https://tc39.github.io/ecma262/#sec-toprimitive
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
	// https://tc39.github.io/ecma262/#sec-object.getownpropertydescriptor
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
	// https://tc39.github.io/ecma262/#sec-object.defineproperty
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

	var shared = createCommonjsModule(function (module) {
	(module.exports = function (key, value) {
	  return sharedStore[key] || (sharedStore[key] = value !== undefined ? value : {});
	})('versions', []).push({
	  version: '3.3.5',
	  mode:  'global',
	  copyright: '© 2019 Denis Pushkarev (zloirock.ru)'
	});
	});

	var functionToString = shared('native-function-to-string', Function.toString);

	var WeakMap = global_1.WeakMap;

	var nativeWeakMap = typeof WeakMap === 'function' && /native code/.test(functionToString.call(WeakMap));

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
	  var store$1 = new WeakMap$1();
	  var wmget = store$1.get;
	  var wmhas = store$1.has;
	  var wmset = store$1.set;
	  set = function (it, metadata) {
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
	var TEMPLATE = String(functionToString).split('toString');

	shared('inspectSource', function (it) {
	  return functionToString.call(it);
	});

	(module.exports = function (O, key, value, options) {
	  var unsafe = options ? !!options.unsafe : false;
	  var simple = options ? !!options.enumerable : false;
	  var noTargetGet = options ? !!options.noTargetGet : false;
	  if (typeof value == 'function') {
	    if (typeof key == 'string' && !has(value, 'name')) createNonEnumerableProperty(value, 'name', key);
	    enforceInternalState(value).source = TEMPLATE.join(typeof key == 'string' ? key : '');
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
	  return typeof this == 'function' && getInternalState(this).source || functionToString.call(this);
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
	// https://tc39.github.io/ecma262/#sec-tointeger
	var toInteger = function (argument) {
	  return isNaN(argument = +argument) ? 0 : (argument > 0 ? floor : ceil)(argument);
	};

	var min = Math.min;

	// `ToLength` abstract operation
	// https://tc39.github.io/ecma262/#sec-tolength
	var toLength = function (argument) {
	  return argument > 0 ? min(toInteger(argument), 0x1FFFFFFFFFFFFF) : 0; // 2 ** 53 - 1 == 9007199254740991
	};

	var max = Math.max;
	var min$1 = Math.min;

	// Helper for a popular repeating case of the spec:
	// Let integer be ? ToInteger(index).
	// If integer < 0, let result be max((length + integer), 0); else let result be min(length, length).
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
	  // https://tc39.github.io/ecma262/#sec-array.prototype.includes
	  includes: createMethod(true),
	  // `Array.prototype.indexOf` method
	  // https://tc39.github.io/ecma262/#sec-array.prototype.indexof
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
	// https://tc39.github.io/ecma262/#sec-object.getownpropertynames
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
	var bindContext = function (fn, that, length) {
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
	// https://tc39.github.io/ecma262/#sec-toobject
	var toObject = function (argument) {
	  return Object(requireObjectCoercible(argument));
	};

	// `IsArray` abstract operation
	// https://tc39.github.io/ecma262/#sec-isarray
	var isArray = Array.isArray || function isArray(arg) {
	  return classofRaw(arg) == 'Array';
	};

	var nativeSymbol = !!Object.getOwnPropertySymbols && !fails(function () {
	  // Chrome 38 Symbol has incorrect toString conversion
	  // eslint-disable-next-line no-undef
	  return !String(Symbol());
	});

	var Symbol$1 = global_1.Symbol;
	var store$2 = shared('wks');

	var wellKnownSymbol = function (name) {
	  return store$2[name] || (store$2[name] = nativeSymbol && Symbol$1[name]
	    || (nativeSymbol ? Symbol$1 : uid)('Symbol.' + name));
	};

	var SPECIES = wellKnownSymbol('species');

	// `ArraySpeciesCreate` abstract operation
	// https://tc39.github.io/ecma262/#sec-arrayspeciescreate
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

	// `Array.prototype.{ forEach, map, filter, some, every, find, findIndex }` methods implementation
	var createMethod$1 = function (TYPE) {
	  var IS_MAP = TYPE == 1;
	  var IS_FILTER = TYPE == 2;
	  var IS_SOME = TYPE == 3;
	  var IS_EVERY = TYPE == 4;
	  var IS_FIND_INDEX = TYPE == 6;
	  var NO_HOLES = TYPE == 5 || IS_FIND_INDEX;
	  return function ($this, callbackfn, that, specificCreate) {
	    var O = toObject($this);
	    var self = indexedObject(O);
	    var boundFunction = bindContext(callbackfn, that, 3);
	    var length = toLength(self.length);
	    var index = 0;
	    var create = specificCreate || arraySpeciesCreate;
	    var target = IS_MAP ? create($this, length) : IS_FILTER ? create($this, 0) : undefined;
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
	        } else if (IS_EVERY) return false;  // every
	      }
	    }
	    return IS_FIND_INDEX ? -1 : IS_SOME || IS_EVERY ? IS_EVERY : target;
	  };
	};

	var arrayIteration = {
	  // `Array.prototype.forEach` method
	  // https://tc39.github.io/ecma262/#sec-array.prototype.foreach
	  forEach: createMethod$1(0),
	  // `Array.prototype.map` method
	  // https://tc39.github.io/ecma262/#sec-array.prototype.map
	  map: createMethod$1(1),
	  // `Array.prototype.filter` method
	  // https://tc39.github.io/ecma262/#sec-array.prototype.filter
	  filter: createMethod$1(2),
	  // `Array.prototype.some` method
	  // https://tc39.github.io/ecma262/#sec-array.prototype.some
	  some: createMethod$1(3),
	  // `Array.prototype.every` method
	  // https://tc39.github.io/ecma262/#sec-array.prototype.every
	  every: createMethod$1(4),
	  // `Array.prototype.find` method
	  // https://tc39.github.io/ecma262/#sec-array.prototype.find
	  find: createMethod$1(5),
	  // `Array.prototype.findIndex` method
	  // https://tc39.github.io/ecma262/#sec-array.prototype.findIndex
	  findIndex: createMethod$1(6)
	};

	var sloppyArrayMethod = function (METHOD_NAME, argument) {
	  var method = [][METHOD_NAME];
	  return !method || !fails(function () {
	    // eslint-disable-next-line no-useless-call,no-throw-literal
	    method.call(null, argument || function () { throw 1; }, 1);
	  });
	};

	var $forEach = arrayIteration.forEach;


	// `Array.prototype.forEach` method implementation
	// https://tc39.github.io/ecma262/#sec-array.prototype.foreach
	var arrayForEach = sloppyArrayMethod('forEach') ? function forEach(callbackfn /* , thisArg */) {
	  return $forEach(this, callbackfn, arguments.length > 1 ? arguments[1] : undefined);
	} : [].forEach;

	// `Array.prototype.forEach` method
	// https://tc39.github.io/ecma262/#sec-array.prototype.foreach
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
	  return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread();
	}

	function _arrayWithoutHoles(arr) {
	  if (Array.isArray(arr)) {
	    for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) arr2[i] = arr[i];

	    return arr2;
	  }
	}

	function _iterableToArray(iter) {
	  if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter);
	}

	function _nonIterableSpread() {
	  throw new TypeError("Invalid attempt to spread non-iterable instance");
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
	  /* jshint strict: false */
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
	 * @param {Integer} factor - 0, 1, or -1
	**/
	proto.wrapShift = function( shift ) {
	  this.shift = shift;
	  this.renderPosition( this.x + this.parent.slideableWidth * shift );
	};

	proto.remove = function() {
	  this.element.parentNode.removeChild( this.element );
	};

	return Cell;

	}));
	});

	var slide = createCommonjsModule(function (module) {
	// slide
	( function( window, factory ) {
	  // universal module definition
	  /* jshint strict: false */
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
	  });
	};

	proto.unselect = function() {
	  this.cells.forEach( function( cell ) {
	    cell.unselect();
	  });
	};

	proto.getCellElements = function() {
	  return this.cells.map( function( cell ) {
	    return cell.element;
	  });
	};

	return Slide;

	}));
	});

	var animate = createCommonjsModule(function (module) {
	// animate
	( function( window, factory ) {
	  // universal module definition
	  /* jshint strict: false */
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
	    });
	  }
	};

	proto.positionSlider = function() {
	  var x = this.x;
	  // wrap position around
	  if ( this.options.wrapAround && this.cells.length > 1 ) {
	    x = utils.modulo( x, this.slideableWidth );
	    x = x - this.slideableWidth;
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
	  // use 3D tranforms for hardware acceleration on iOS
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
	    return ( Math.round( ( position / this.size.innerWidth ) * 10000 ) * 0.01 )+ '%';
	  } else {
	    // pixel positioning
	    return Math.round( position ) + 'px';
	  }
	};

	proto.settle = function( previousX ) {
	  // keep track of frames where x hasn't moved
	  if ( !this.isPointerDown && Math.round( this.x * 100 ) == Math.round( previousX * 100 ) ) {
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
	  for ( var i=0; i < cells.length; i++ ) {
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
	  for ( var i=0; i < cells.length; i++ ) {
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

	}));
	});

	var flickity = createCommonjsModule(function (module) {
	// Flickity main
	( function( window, factory ) {
	  // universal module definition
	  /* jshint strict: false */
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
	    instance.option( options );
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
	  setGallerySize: true
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
	 * @param {Object} opts
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
	 * @param {Array or NodeList or HTMLElement} elems
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
	  for ( var i=index; i < len; i++ ) {
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
	 * @param {Array} cells
	 */
	proto._sizeCells = function( cells ) {
	  cells.forEach( function( cell ) {
	    cell.getSize();
	  });
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
	    groupCells.match(/^(\d+)%$/);
	  var percent = percentMatch ? parseInt( percentMatch[1], 10 ) / 100 : 1;
	  return function( i, slideWidth ) {
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
	    right: 0.5
	  },
	  left: {
	    left: 0,
	    right: 1
	  },
	  right: {
	    right: 0,
	    left: 1
	  }
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
	      var jQEvent = jQuery.Event( event );
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
	 * @param {Element or Number} elem
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
	  for ( var i=0; i < this.slides.length; i++ ) {
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
	 * @param {Element} elem
	 * @returns {Flickity.Cell} item
	 */
	proto.getCell = function( elem ) {
	  // loop through cells to get the one that matches
	  for ( var i=0; i < this.cells.length; i++ ) {
	    var cell = this.cells[i];
	    if ( cell.element == elem ) {
	      return cell;
	    }
	  }
	};

	/**
	 * get collection of Flickity.Cells, given Elements
	 * @param {Element, Array, NodeList} elems
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
	  });
	};

	/**
	 * get parent cell from an element
	 * @param {Element} elem
	 * @returns {Flickit.Cell} cell
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
	  for ( var i = index - adjCount; i <= index + adjCount ; i++ ) {
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
	 * @param {Element, Selector String, or Number} selector
	 */
	proto.queryCell = function( selector ) {
	  if ( typeof selector == 'number' ) {
	    // use number as index
	    return this.cells[ selector ];
	  }
	  if ( typeof selector == 'string' ) {
	    // do not select invalid selectors from hash: #123, #/. #791
	    if ( selector.match(/^[#\.]?[\d\/]/) ) {
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
	  if ( !this.options.accessibility ||isNotFocused ) {
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
	  // https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/focus#Browser_compatibility
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
	  });
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
	 * @param {Element} elem
	 * @returns {Flickity}
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

	}));
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
	 * Unidragger v2.3.0
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
	  this.pointerDownPointer = pointer;

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
	  /* jshint strict: false */
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
	});

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
	    window.addEventListener( 'touchmove', function() {});
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
	    moveVector.x = moveVector.x % this.slideableWidth;
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
	    function( d, md ) { return d <= md; } : function( d, md ) { return d < md; };
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
	    index: index - increment
	  };
	};

	/**
	 * measure distance between x and a slide target
	 * @param {Number} x
	 * @param {Integer} index - slide index
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
	  var wrap = isWrapAround ? this.slideableWidth * Math.floor( index / len ) : 0;
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
	    y: window.pageYOffset
	  };
	}

	// -----  ----- //

	return Flickity;

	}));
	});

	var prevNextButton = createCommonjsModule(function (module) {
	// prev/next buttons
	( function( window, factory ) {
	  // universal module definition
	  /* jshint strict: false */
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
	  var svg = document.createElementNS( svgURI, 'svg');
	  svg.setAttribute( 'class', 'flickity-button-icon' );
	  svg.setAttribute( 'viewBox', '0 0 100 100' );
	  var path = document.createElementNS( svgURI, 'path');
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
	    x3: 30
	  }
	});

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

	}));
	});

	var pageDots = createCommonjsModule(function (module) {
	// page dots
	( function( window, factory ) {
	  // universal module definition
	  /* jshint strict: false */
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
	  pageDots: true
	});

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

	}));
	});

	var player = createCommonjsModule(function (module) {
	// player & autoPlay
	( function( window, factory ) {
	  // universal module definition
	  /* jshint strict: false */
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
	  pauseAutoPlayOnHover: true
	});

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

	}));
	});

	var addRemoveCell = createCommonjsModule(function (module) {
	// add, remove cell
	( function( window, factory ) {
	  // universal module definition
	  /* jshint strict: false */
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
	  });
	  return fragment;
	}

	// -------------------------- add/remove cell prototype -------------------------- //

	var proto = Flickity.prototype;

	/**
	 * Insert, prepend, or append cells
	 * @param {Element, Array, NodeList} elems
	 * @param {Integer} index
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
	 * @param {Element, Array, NodeList} elems
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

	}));
	});

	var lazyload = createCommonjsModule(function (module) {
	// lazyload
	( function( window, factory ) {
	  // universal module definition
	  /* jshint strict: false */
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
	  });
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

	}));
	});

	var js = createCommonjsModule(function (module) {
	/*!
	 * Flickity v2.2.1
	 * Touch, responsive, flickable carousels
	 *
	 * Licensed GPLv3 for open source use
	 * or Flickity Commercial License for commercial use
	 *
	 * https://flickity.metafizzy.co
	 * Copyright 2015-2019 Metafizzy
	 */

	( function( window, factory ) {
	  // universal module definition
	  /* jshint strict: false */
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

	})( window, function factory( Flickity ) {
	  /*jshint strict: false*/
	  return Flickity;
	});
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

	var burger = document.querySelector('.hamburger');

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
	  },
	  closeNav: function closeNav() {
	    document.body.classList.remove('nav-is-open');
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
	// https://tc39.github.io/ecma262/#sec-object.setprototypeof
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
	// https://tc39.github.io/ecma262/#sec-object.keys
	var objectKeys = Object.keys || function keys(O) {
	  return objectKeysInternal(O, enumBugKeys);
	};

	// `Object.defineProperties` method
	// https://tc39.github.io/ecma262/#sec-object.defineproperties
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

	var IE_PROTO = sharedKey('IE_PROTO');

	var PROTOTYPE = 'prototype';
	var Empty = function () { /* empty */ };

	// Create object with fake `null` prototype: use iframe Object with cleared prototype
	var createDict = function () {
	  // Thrash, waste and sodomy: IE GC bug
	  var iframe = documentCreateElement('iframe');
	  var length = enumBugKeys.length;
	  var lt = '<';
	  var script = 'script';
	  var gt = '>';
	  var js = 'java' + script + ':';
	  var iframeDocument;
	  iframe.style.display = 'none';
	  html.appendChild(iframe);
	  iframe.src = String(js);
	  iframeDocument = iframe.contentWindow.document;
	  iframeDocument.open();
	  iframeDocument.write(lt + script + gt + 'document.F=Object' + lt + '/' + script + gt);
	  iframeDocument.close();
	  createDict = iframeDocument.F;
	  while (length--) delete createDict[PROTOTYPE][enumBugKeys[length]];
	  return createDict();
	};

	// `Object.create` method
	// https://tc39.github.io/ecma262/#sec-object.create
	var objectCreate = Object.create || function create(O, Properties) {
	  var result;
	  if (O !== null) {
	    Empty[PROTOTYPE] = anObject(O);
	    result = new Empty();
	    Empty[PROTOTYPE] = null;
	    // add "__proto__" for Object.getPrototypeOf polyfill
	    result[IE_PROTO] = O;
	  } else result = createDict();
	  return Properties === undefined ? result : objectDefineProperties(result, Properties);
	};

	hiddenKeys[IE_PROTO] = true;

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
	  // https://tc39.github.io/ecma262/#sec-string.prototype.trimstart
	  start: createMethod$2(1),
	  // `String.prototype.{ trimRight, trimEnd }` methods
	  // https://tc39.github.io/ecma262/#sec-string.prototype.trimend
	  end: createMethod$2(2),
	  // `String.prototype.trim` method
	  // https://tc39.github.io/ecma262/#sec-string.prototype.trim
	  trim: createMethod$2(3)
	};

	var getOwnPropertyNames = objectGetOwnPropertyNames.f;
	var getOwnPropertyDescriptor$2 = objectGetOwnPropertyDescriptor.f;
	var defineProperty = objectDefineProperty.f;
	var trim = stringTrim.trim;

	var NUMBER = 'Number';
	var NativeNumber = global_1[NUMBER];
	var NumberPrototype = NativeNumber.prototype;

	// Opera ~12 has broken Object#toString
	var BROKEN_CLASSOF = classofRaw(objectCreate(NumberPrototype)) == NUMBER;

	// `ToNumber` abstract operation
	// https://tc39.github.io/ecma262/#sec-tonumber
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
	// https://tc39.github.io/ecma262/#sec-number-constructor
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
	    'MIN_SAFE_INTEGER,parseFloat,parseInt,isInteger'
	  ).split(','), j = 0, key; keys$1.length > j; j++) {
	    if (has(NativeNumber, key = keys$1[j]) && !has(NumberWrapper, key)) {
	      defineProperty(NumberWrapper, key, getOwnPropertyDescriptor$2(NativeNumber, key));
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

	var gMaps = {
	  setupGoogleMapsApi: setupGoogleMapsApi
	};

	/* ============================================================
		 Execution code
		 ============================================================ */
	// Google MAP

	var snazzyStyle = [{
	  "featureType": "all",
	  "elementType": "all",
	  "stylers": [{
	    "visibility": "on"
	  }]
	}, {
	  "featureType": "all",
	  "elementType": "labels",
	  "stylers": [{
	    "visibility": "off"
	  }, {
	    "saturation": "-100"
	  }]
	}, {
	  "featureType": "all",
	  "elementType": "labels.text.fill",
	  "stylers": [{
	    "saturation": 36
	  }, {
	    "color": "#000000"
	  }, {
	    "lightness": 40
	  }, {
	    "visibility": "off"
	  }]
	}, {
	  "featureType": "all",
	  "elementType": "labels.text.stroke",
	  "stylers": [{
	    "visibility": "off"
	  }, {
	    "color": "#000000"
	  }, {
	    "lightness": 16
	  }]
	}, {
	  "featureType": "all",
	  "elementType": "labels.icon",
	  "stylers": [{
	    "visibility": "off"
	  }]
	}, {
	  "featureType": "administrative",
	  "elementType": "geometry.fill",
	  "stylers": [{
	    "color": "#000000"
	  }, {
	    "lightness": 20
	  }]
	}, {
	  "featureType": "administrative",
	  "elementType": "geometry.stroke",
	  "stylers": [{
	    "color": "#000000"
	  }, {
	    "lightness": 17
	  }, {
	    "weight": 1.2
	  }]
	}, {
	  "featureType": "landscape",
	  "elementType": "geometry",
	  "stylers": [{
	    "color": "#000000"
	  }, {
	    "lightness": 20
	  }]
	}, {
	  "featureType": "landscape",
	  "elementType": "geometry.fill",
	  "stylers": [{
	    "color": "#4d6059"
	  }]
	}, {
	  "featureType": "landscape",
	  "elementType": "geometry.stroke",
	  "stylers": [{
	    "color": "#4d6059"
	  }]
	}, {
	  "featureType": "landscape.natural",
	  "elementType": "geometry.fill",
	  "stylers": [{
	    "color": "#4d6059"
	  }]
	}, {
	  "featureType": "poi",
	  "elementType": "geometry",
	  "stylers": [{
	    "lightness": 21
	  }]
	}, {
	  "featureType": "poi",
	  "elementType": "geometry.fill",
	  "stylers": [{
	    "color": "#4d6059"
	  }]
	}, {
	  "featureType": "poi",
	  "elementType": "geometry.stroke",
	  "stylers": [{
	    "color": "#4d6059"
	  }]
	}, {
	  "featureType": "road",
	  "elementType": "geometry",
	  "stylers": [{
	    "visibility": "on"
	  }, {
	    "color": "#7f8d89"
	  }]
	}, {
	  "featureType": "road",
	  "elementType": "geometry.fill",
	  "stylers": [{
	    "color": "#7f8d89"
	  }]
	}, {
	  "featureType": "road.highway",
	  "elementType": "geometry.fill",
	  "stylers": [{
	    "color": "#7f8d89"
	  }, {
	    "lightness": 17
	  }]
	}, {
	  "featureType": "road.highway",
	  "elementType": "geometry.stroke",
	  "stylers": [{
	    "color": "#7f8d89"
	  }, {
	    "lightness": 29
	  }, {
	    "weight": 0.2
	  }]
	}, {
	  "featureType": "road.arterial",
	  "elementType": "geometry",
	  "stylers": [{
	    "color": "#000000"
	  }, {
	    "lightness": 18
	  }]
	}, {
	  "featureType": "road.arterial",
	  "elementType": "geometry.fill",
	  "stylers": [{
	    "color": "#7f8d89"
	  }]
	}, {
	  "featureType": "road.arterial",
	  "elementType": "geometry.stroke",
	  "stylers": [{
	    "color": "#7f8d89"
	  }]
	}, {
	  "featureType": "road.local",
	  "elementType": "geometry",
	  "stylers": [{
	    "color": "#000000"
	  }, {
	    "lightness": 16
	  }]
	}, {
	  "featureType": "road.local",
	  "elementType": "geometry.fill",
	  "stylers": [{
	    "color": "#7f8d89"
	  }]
	}, {
	  "featureType": "road.local",
	  "elementType": "geometry.stroke",
	  "stylers": [{
	    "color": "#7f8d89"
	  }]
	}, {
	  "featureType": "transit",
	  "elementType": "geometry",
	  "stylers": [{
	    "color": "#000000"
	  }, {
	    "lightness": 19
	  }]
	}, {
	  "featureType": "water",
	  "elementType": "all",
	  "stylers": [{
	    "color": "#2b3638"
	  }, {
	    "visibility": "on"
	  }]
	}, {
	  "featureType": "water",
	  "elementType": "geometry",
	  "stylers": [{
	    "color": "#2b3638"
	  }, {
	    "lightness": 17
	  }]
	}, {
	  "featureType": "water",
	  "elementType": "geometry.fill",
	  "stylers": [{
	    "color": "#24282b"
	  }]
	}, {
	  "featureType": "water",
	  "elementType": "geometry.stroke",
	  "stylers": [{
	    "color": "#24282b"
	  }]
	}, {
	  "featureType": "water",
	  "elementType": "labels",
	  "stylers": [{
	    "visibility": "off"
	  }]
	}, {
	  "featureType": "water",
	  "elementType": "labels.text",
	  "stylers": [{
	    "visibility": "off"
	  }]
	}, {
	  "featureType": "water",
	  "elementType": "labels.text.fill",
	  "stylers": [{
	    "visibility": "off"
	  }]
	}, {
	  "featureType": "water",
	  "elementType": "labels.text.stroke",
	  "stylers": [{
	    "visibility": "off"
	  }]
	}, {
	  "featureType": "water",
	  "elementType": "labels.icon",
	  "stylers": [{
	    "visibility": "off"
	  }]
	}];
	gMaps.setupGoogleMapsApi(['map'], {
	  style: snazzyStyle,
	  zoom: 18,
	  icon: {
	    img: "".concat(WP.templateUrl, "/images/marker_alt.png")
	  }
	});
	ofi_commonJs();
	Nav.init();

	var std_sliders = _toConsumableArray(document.querySelectorAll('.standard-slider'));

	if (std_sliders) {
	  std_sliders.forEach(function (s) {
	    var slider = new js(s, {
	      cellAlign: 'left',
	      wrapAround: true,
	      imagesLoaded: true,
	      watchCSS: true,
	      contain: true
	    });
	  });
	}

}());
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2NyaXB0LmpzIiwic291cmNlcyI6WyIuLi9ub2RlX21vZHVsZXMvY29yZS1qcy9pbnRlcm5hbHMvZ2xvYmFsLmpzIiwiLi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvaW50ZXJuYWxzL2ZhaWxzLmpzIiwiLi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvaW50ZXJuYWxzL2Rlc2NyaXB0b3JzLmpzIiwiLi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvaW50ZXJuYWxzL29iamVjdC1wcm9wZXJ0eS1pcy1lbnVtZXJhYmxlLmpzIiwiLi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvaW50ZXJuYWxzL2NyZWF0ZS1wcm9wZXJ0eS1kZXNjcmlwdG9yLmpzIiwiLi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvaW50ZXJuYWxzL2NsYXNzb2YtcmF3LmpzIiwiLi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvaW50ZXJuYWxzL2luZGV4ZWQtb2JqZWN0LmpzIiwiLi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvaW50ZXJuYWxzL3JlcXVpcmUtb2JqZWN0LWNvZXJjaWJsZS5qcyIsIi4uL25vZGVfbW9kdWxlcy9jb3JlLWpzL2ludGVybmFscy90by1pbmRleGVkLW9iamVjdC5qcyIsIi4uL25vZGVfbW9kdWxlcy9jb3JlLWpzL2ludGVybmFscy9pcy1vYmplY3QuanMiLCIuLi9ub2RlX21vZHVsZXMvY29yZS1qcy9pbnRlcm5hbHMvdG8tcHJpbWl0aXZlLmpzIiwiLi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvaW50ZXJuYWxzL2hhcy5qcyIsIi4uL25vZGVfbW9kdWxlcy9jb3JlLWpzL2ludGVybmFscy9kb2N1bWVudC1jcmVhdGUtZWxlbWVudC5qcyIsIi4uL25vZGVfbW9kdWxlcy9jb3JlLWpzL2ludGVybmFscy9pZTgtZG9tLWRlZmluZS5qcyIsIi4uL25vZGVfbW9kdWxlcy9jb3JlLWpzL2ludGVybmFscy9vYmplY3QtZ2V0LW93bi1wcm9wZXJ0eS1kZXNjcmlwdG9yLmpzIiwiLi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvaW50ZXJuYWxzL2FuLW9iamVjdC5qcyIsIi4uL25vZGVfbW9kdWxlcy9jb3JlLWpzL2ludGVybmFscy9vYmplY3QtZGVmaW5lLXByb3BlcnR5LmpzIiwiLi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvaW50ZXJuYWxzL2NyZWF0ZS1ub24tZW51bWVyYWJsZS1wcm9wZXJ0eS5qcyIsIi4uL25vZGVfbW9kdWxlcy9jb3JlLWpzL2ludGVybmFscy9zZXQtZ2xvYmFsLmpzIiwiLi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvaW50ZXJuYWxzL3NoYXJlZC1zdG9yZS5qcyIsIi4uL25vZGVfbW9kdWxlcy9jb3JlLWpzL2ludGVybmFscy9zaGFyZWQuanMiLCIuLi9ub2RlX21vZHVsZXMvY29yZS1qcy9pbnRlcm5hbHMvZnVuY3Rpb24tdG8tc3RyaW5nLmpzIiwiLi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvaW50ZXJuYWxzL25hdGl2ZS13ZWFrLW1hcC5qcyIsIi4uL25vZGVfbW9kdWxlcy9jb3JlLWpzL2ludGVybmFscy91aWQuanMiLCIuLi9ub2RlX21vZHVsZXMvY29yZS1qcy9pbnRlcm5hbHMvc2hhcmVkLWtleS5qcyIsIi4uL25vZGVfbW9kdWxlcy9jb3JlLWpzL2ludGVybmFscy9oaWRkZW4ta2V5cy5qcyIsIi4uL25vZGVfbW9kdWxlcy9jb3JlLWpzL2ludGVybmFscy9pbnRlcm5hbC1zdGF0ZS5qcyIsIi4uL25vZGVfbW9kdWxlcy9jb3JlLWpzL2ludGVybmFscy9yZWRlZmluZS5qcyIsIi4uL25vZGVfbW9kdWxlcy9jb3JlLWpzL2ludGVybmFscy9wYXRoLmpzIiwiLi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvaW50ZXJuYWxzL2dldC1idWlsdC1pbi5qcyIsIi4uL25vZGVfbW9kdWxlcy9jb3JlLWpzL2ludGVybmFscy90by1pbnRlZ2VyLmpzIiwiLi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvaW50ZXJuYWxzL3RvLWxlbmd0aC5qcyIsIi4uL25vZGVfbW9kdWxlcy9jb3JlLWpzL2ludGVybmFscy90by1hYnNvbHV0ZS1pbmRleC5qcyIsIi4uL25vZGVfbW9kdWxlcy9jb3JlLWpzL2ludGVybmFscy9hcnJheS1pbmNsdWRlcy5qcyIsIi4uL25vZGVfbW9kdWxlcy9jb3JlLWpzL2ludGVybmFscy9vYmplY3Qta2V5cy1pbnRlcm5hbC5qcyIsIi4uL25vZGVfbW9kdWxlcy9jb3JlLWpzL2ludGVybmFscy9lbnVtLWJ1Zy1rZXlzLmpzIiwiLi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvaW50ZXJuYWxzL29iamVjdC1nZXQtb3duLXByb3BlcnR5LW5hbWVzLmpzIiwiLi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvaW50ZXJuYWxzL29iamVjdC1nZXQtb3duLXByb3BlcnR5LXN5bWJvbHMuanMiLCIuLi9ub2RlX21vZHVsZXMvY29yZS1qcy9pbnRlcm5hbHMvb3duLWtleXMuanMiLCIuLi9ub2RlX21vZHVsZXMvY29yZS1qcy9pbnRlcm5hbHMvY29weS1jb25zdHJ1Y3Rvci1wcm9wZXJ0aWVzLmpzIiwiLi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvaW50ZXJuYWxzL2lzLWZvcmNlZC5qcyIsIi4uL25vZGVfbW9kdWxlcy9jb3JlLWpzL2ludGVybmFscy9leHBvcnQuanMiLCIuLi9ub2RlX21vZHVsZXMvY29yZS1qcy9pbnRlcm5hbHMvYS1mdW5jdGlvbi5qcyIsIi4uL25vZGVfbW9kdWxlcy9jb3JlLWpzL2ludGVybmFscy9iaW5kLWNvbnRleHQuanMiLCIuLi9ub2RlX21vZHVsZXMvY29yZS1qcy9pbnRlcm5hbHMvdG8tb2JqZWN0LmpzIiwiLi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvaW50ZXJuYWxzL2lzLWFycmF5LmpzIiwiLi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvaW50ZXJuYWxzL25hdGl2ZS1zeW1ib2wuanMiLCIuLi9ub2RlX21vZHVsZXMvY29yZS1qcy9pbnRlcm5hbHMvd2VsbC1rbm93bi1zeW1ib2wuanMiLCIuLi9ub2RlX21vZHVsZXMvY29yZS1qcy9pbnRlcm5hbHMvYXJyYXktc3BlY2llcy1jcmVhdGUuanMiLCIuLi9ub2RlX21vZHVsZXMvY29yZS1qcy9pbnRlcm5hbHMvYXJyYXktaXRlcmF0aW9uLmpzIiwiLi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvaW50ZXJuYWxzL3Nsb3BweS1hcnJheS1tZXRob2QuanMiLCIuLi9ub2RlX21vZHVsZXMvY29yZS1qcy9pbnRlcm5hbHMvYXJyYXktZm9yLWVhY2guanMiLCIuLi9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL2VzLmFycmF5LmZvci1lYWNoLmpzIiwiLi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvaW50ZXJuYWxzL2RvbS1pdGVyYWJsZXMuanMiLCIuLi9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL3dlYi5kb20tY29sbGVjdGlvbnMuZm9yLWVhY2guanMiLCIuLi9ub2RlX21vZHVsZXMvb2JqZWN0LWZpdC1pbWFnZXMvZGlzdC9vZmkuY29tbW9uLWpzLmpzIiwiLi4vbm9kZV9tb2R1bGVzL2V2LWVtaXR0ZXIvZXYtZW1pdHRlci5qcyIsIi4uL25vZGVfbW9kdWxlcy9nZXQtc2l6ZS9nZXQtc2l6ZS5qcyIsIi4uL25vZGVfbW9kdWxlcy9kZXNhbmRyby1tYXRjaGVzLXNlbGVjdG9yL21hdGNoZXMtc2VsZWN0b3IuanMiLCIuLi9ub2RlX21vZHVsZXMvZml6enktdWktdXRpbHMvdXRpbHMuanMiLCIuLi9ub2RlX21vZHVsZXMvZmxpY2tpdHkvanMvY2VsbC5qcyIsIi4uL25vZGVfbW9kdWxlcy9mbGlja2l0eS9qcy9zbGlkZS5qcyIsIi4uL25vZGVfbW9kdWxlcy9mbGlja2l0eS9qcy9hbmltYXRlLmpzIiwiLi4vbm9kZV9tb2R1bGVzL2ZsaWNraXR5L2pzL2ZsaWNraXR5LmpzIiwiLi4vbm9kZV9tb2R1bGVzL3VuaXBvaW50ZXIvdW5pcG9pbnRlci5qcyIsIi4uL25vZGVfbW9kdWxlcy91bmlkcmFnZ2VyL3VuaWRyYWdnZXIuanMiLCIuLi9ub2RlX21vZHVsZXMvZmxpY2tpdHkvanMvZHJhZy5qcyIsIi4uL25vZGVfbW9kdWxlcy9mbGlja2l0eS9qcy9wcmV2LW5leHQtYnV0dG9uLmpzIiwiLi4vbm9kZV9tb2R1bGVzL2ZsaWNraXR5L2pzL3BhZ2UtZG90cy5qcyIsIi4uL25vZGVfbW9kdWxlcy9mbGlja2l0eS9qcy9wbGF5ZXIuanMiLCIuLi9ub2RlX21vZHVsZXMvZmxpY2tpdHkvanMvYWRkLXJlbW92ZS1jZWxsLmpzIiwiLi4vbm9kZV9tb2R1bGVzL2ZsaWNraXR5L2pzL2xhenlsb2FkLmpzIiwiLi4vbm9kZV9tb2R1bGVzL2ZsaWNraXR5L2pzL2luZGV4LmpzIiwiLi4vbm9kZV9tb2R1bGVzL2ltYWdlc2xvYWRlZC9pbWFnZXNsb2FkZWQuanMiLCIuLi9ub2RlX21vZHVsZXMvZmxpY2tpdHktaW1hZ2VzbG9hZGVkL2ZsaWNraXR5LWltYWdlc2xvYWRlZC5qcyIsIi4uL3NyYy9qcy9jb21wb25lbnRzL25hdmlnYXRpb24uanMiLCIuLi9ub2RlX21vZHVsZXMvY29yZS1qcy9pbnRlcm5hbHMvYS1wb3NzaWJsZS1wcm90b3R5cGUuanMiLCIuLi9ub2RlX21vZHVsZXMvY29yZS1qcy9pbnRlcm5hbHMvb2JqZWN0LXNldC1wcm90b3R5cGUtb2YuanMiLCIuLi9ub2RlX21vZHVsZXMvY29yZS1qcy9pbnRlcm5hbHMvaW5oZXJpdC1pZi1yZXF1aXJlZC5qcyIsIi4uL25vZGVfbW9kdWxlcy9jb3JlLWpzL2ludGVybmFscy9vYmplY3Qta2V5cy5qcyIsIi4uL25vZGVfbW9kdWxlcy9jb3JlLWpzL2ludGVybmFscy9vYmplY3QtZGVmaW5lLXByb3BlcnRpZXMuanMiLCIuLi9ub2RlX21vZHVsZXMvY29yZS1qcy9pbnRlcm5hbHMvaHRtbC5qcyIsIi4uL25vZGVfbW9kdWxlcy9jb3JlLWpzL2ludGVybmFscy9vYmplY3QtY3JlYXRlLmpzIiwiLi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvaW50ZXJuYWxzL3doaXRlc3BhY2VzLmpzIiwiLi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvaW50ZXJuYWxzL3N0cmluZy10cmltLmpzIiwiLi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvbW9kdWxlcy9lcy5udW1iZXIuY29uc3RydWN0b3IuanMiLCIuLi9zcmMvanMvY29tcG9uZW50cy9nTWFwcy5qcyIsIi4uL3NyYy9qcy9teXNjcmlwdC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyJ2YXIgY2hlY2sgPSBmdW5jdGlvbiAoaXQpIHtcbiAgcmV0dXJuIGl0ICYmIGl0Lk1hdGggPT0gTWF0aCAmJiBpdDtcbn07XG5cbi8vIGh0dHBzOi8vZ2l0aHViLmNvbS96bG9pcm9jay9jb3JlLWpzL2lzc3Vlcy84NiNpc3N1ZWNvbW1lbnQtMTE1NzU5MDI4XG5tb2R1bGUuZXhwb3J0cyA9XG4gIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby11bmRlZlxuICBjaGVjayh0eXBlb2YgZ2xvYmFsVGhpcyA9PSAnb2JqZWN0JyAmJiBnbG9iYWxUaGlzKSB8fFxuICBjaGVjayh0eXBlb2Ygd2luZG93ID09ICdvYmplY3QnICYmIHdpbmRvdykgfHxcbiAgY2hlY2sodHlwZW9mIHNlbGYgPT0gJ29iamVjdCcgJiYgc2VsZikgfHxcbiAgY2hlY2sodHlwZW9mIGdsb2JhbCA9PSAnb2JqZWN0JyAmJiBnbG9iYWwpIHx8XG4gIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1uZXctZnVuY1xuICBGdW5jdGlvbigncmV0dXJuIHRoaXMnKSgpO1xuIiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoZXhlYykge1xuICB0cnkge1xuICAgIHJldHVybiAhIWV4ZWMoKTtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxufTtcbiIsInZhciBmYWlscyA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9mYWlscycpO1xuXG4vLyBUaGFuaydzIElFOCBmb3IgaGlzIGZ1bm55IGRlZmluZVByb3BlcnR5XG5tb2R1bGUuZXhwb3J0cyA9ICFmYWlscyhmdW5jdGlvbiAoKSB7XG4gIHJldHVybiBPYmplY3QuZGVmaW5lUHJvcGVydHkoe30sICdhJywgeyBnZXQ6IGZ1bmN0aW9uICgpIHsgcmV0dXJuIDc7IH0gfSkuYSAhPSA3O1xufSk7XG4iLCIndXNlIHN0cmljdCc7XG52YXIgbmF0aXZlUHJvcGVydHlJc0VudW1lcmFibGUgPSB7fS5wcm9wZXJ0eUlzRW51bWVyYWJsZTtcbnZhciBnZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yO1xuXG4vLyBOYXNob3JuIH4gSkRLOCBidWdcbnZhciBOQVNIT1JOX0JVRyA9IGdldE93blByb3BlcnR5RGVzY3JpcHRvciAmJiAhbmF0aXZlUHJvcGVydHlJc0VudW1lcmFibGUuY2FsbCh7IDE6IDIgfSwgMSk7XG5cbi8vIGBPYmplY3QucHJvdG90eXBlLnByb3BlcnR5SXNFbnVtZXJhYmxlYCBtZXRob2QgaW1wbGVtZW50YXRpb25cbi8vIGh0dHBzOi8vdGMzOS5naXRodWIuaW8vZWNtYTI2Mi8jc2VjLW9iamVjdC5wcm90b3R5cGUucHJvcGVydHlpc2VudW1lcmFibGVcbmV4cG9ydHMuZiA9IE5BU0hPUk5fQlVHID8gZnVuY3Rpb24gcHJvcGVydHlJc0VudW1lcmFibGUoVikge1xuICB2YXIgZGVzY3JpcHRvciA9IGdldE93blByb3BlcnR5RGVzY3JpcHRvcih0aGlzLCBWKTtcbiAgcmV0dXJuICEhZGVzY3JpcHRvciAmJiBkZXNjcmlwdG9yLmVudW1lcmFibGU7XG59IDogbmF0aXZlUHJvcGVydHlJc0VudW1lcmFibGU7XG4iLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChiaXRtYXAsIHZhbHVlKSB7XG4gIHJldHVybiB7XG4gICAgZW51bWVyYWJsZTogIShiaXRtYXAgJiAxKSxcbiAgICBjb25maWd1cmFibGU6ICEoYml0bWFwICYgMiksXG4gICAgd3JpdGFibGU6ICEoYml0bWFwICYgNCksXG4gICAgdmFsdWU6IHZhbHVlXG4gIH07XG59O1xuIiwidmFyIHRvU3RyaW5nID0ge30udG9TdHJpbmc7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGl0KSB7XG4gIHJldHVybiB0b1N0cmluZy5jYWxsKGl0KS5zbGljZSg4LCAtMSk7XG59O1xuIiwidmFyIGZhaWxzID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2ZhaWxzJyk7XG52YXIgY2xhc3NvZiA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9jbGFzc29mLXJhdycpO1xuXG52YXIgc3BsaXQgPSAnJy5zcGxpdDtcblxuLy8gZmFsbGJhY2sgZm9yIG5vbi1hcnJheS1saWtlIEVTMyBhbmQgbm9uLWVudW1lcmFibGUgb2xkIFY4IHN0cmluZ3Ncbm1vZHVsZS5leHBvcnRzID0gZmFpbHMoZnVuY3Rpb24gKCkge1xuICAvLyB0aHJvd3MgYW4gZXJyb3IgaW4gcmhpbm8sIHNlZSBodHRwczovL2dpdGh1Yi5jb20vbW96aWxsYS9yaGluby9pc3N1ZXMvMzQ2XG4gIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1wcm90b3R5cGUtYnVpbHRpbnNcbiAgcmV0dXJuICFPYmplY3QoJ3onKS5wcm9wZXJ0eUlzRW51bWVyYWJsZSgwKTtcbn0pID8gZnVuY3Rpb24gKGl0KSB7XG4gIHJldHVybiBjbGFzc29mKGl0KSA9PSAnU3RyaW5nJyA/IHNwbGl0LmNhbGwoaXQsICcnKSA6IE9iamVjdChpdCk7XG59IDogT2JqZWN0O1xuIiwiLy8gYFJlcXVpcmVPYmplY3RDb2VyY2libGVgIGFic3RyYWN0IG9wZXJhdGlvblxuLy8gaHR0cHM6Ly90YzM5LmdpdGh1Yi5pby9lY21hMjYyLyNzZWMtcmVxdWlyZW9iamVjdGNvZXJjaWJsZVxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoaXQpIHtcbiAgaWYgKGl0ID09IHVuZGVmaW5lZCkgdGhyb3cgVHlwZUVycm9yKFwiQ2FuJ3QgY2FsbCBtZXRob2Qgb24gXCIgKyBpdCk7XG4gIHJldHVybiBpdDtcbn07XG4iLCIvLyB0b09iamVjdCB3aXRoIGZhbGxiYWNrIGZvciBub24tYXJyYXktbGlrZSBFUzMgc3RyaW5nc1xudmFyIEluZGV4ZWRPYmplY3QgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvaW5kZXhlZC1vYmplY3QnKTtcbnZhciByZXF1aXJlT2JqZWN0Q29lcmNpYmxlID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL3JlcXVpcmUtb2JqZWN0LWNvZXJjaWJsZScpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChpdCkge1xuICByZXR1cm4gSW5kZXhlZE9iamVjdChyZXF1aXJlT2JqZWN0Q29lcmNpYmxlKGl0KSk7XG59O1xuIiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoaXQpIHtcbiAgcmV0dXJuIHR5cGVvZiBpdCA9PT0gJ29iamVjdCcgPyBpdCAhPT0gbnVsbCA6IHR5cGVvZiBpdCA9PT0gJ2Z1bmN0aW9uJztcbn07XG4iLCJ2YXIgaXNPYmplY3QgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvaXMtb2JqZWN0Jyk7XG5cbi8vIGBUb1ByaW1pdGl2ZWAgYWJzdHJhY3Qgb3BlcmF0aW9uXG4vLyBodHRwczovL3RjMzkuZ2l0aHViLmlvL2VjbWEyNjIvI3NlYy10b3ByaW1pdGl2ZVxuLy8gaW5zdGVhZCBvZiB0aGUgRVM2IHNwZWMgdmVyc2lvbiwgd2UgZGlkbid0IGltcGxlbWVudCBAQHRvUHJpbWl0aXZlIGNhc2Vcbi8vIGFuZCB0aGUgc2Vjb25kIGFyZ3VtZW50IC0gZmxhZyAtIHByZWZlcnJlZCB0eXBlIGlzIGEgc3RyaW5nXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChpbnB1dCwgUFJFRkVSUkVEX1NUUklORykge1xuICBpZiAoIWlzT2JqZWN0KGlucHV0KSkgcmV0dXJuIGlucHV0O1xuICB2YXIgZm4sIHZhbDtcbiAgaWYgKFBSRUZFUlJFRF9TVFJJTkcgJiYgdHlwZW9mIChmbiA9IGlucHV0LnRvU3RyaW5nKSA9PSAnZnVuY3Rpb24nICYmICFpc09iamVjdCh2YWwgPSBmbi5jYWxsKGlucHV0KSkpIHJldHVybiB2YWw7XG4gIGlmICh0eXBlb2YgKGZuID0gaW5wdXQudmFsdWVPZikgPT0gJ2Z1bmN0aW9uJyAmJiAhaXNPYmplY3QodmFsID0gZm4uY2FsbChpbnB1dCkpKSByZXR1cm4gdmFsO1xuICBpZiAoIVBSRUZFUlJFRF9TVFJJTkcgJiYgdHlwZW9mIChmbiA9IGlucHV0LnRvU3RyaW5nKSA9PSAnZnVuY3Rpb24nICYmICFpc09iamVjdCh2YWwgPSBmbi5jYWxsKGlucHV0KSkpIHJldHVybiB2YWw7XG4gIHRocm93IFR5cGVFcnJvcihcIkNhbid0IGNvbnZlcnQgb2JqZWN0IHRvIHByaW1pdGl2ZSB2YWx1ZVwiKTtcbn07XG4iLCJ2YXIgaGFzT3duUHJvcGVydHkgPSB7fS5oYXNPd25Qcm9wZXJ0eTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoaXQsIGtleSkge1xuICByZXR1cm4gaGFzT3duUHJvcGVydHkuY2FsbChpdCwga2V5KTtcbn07XG4iLCJ2YXIgZ2xvYmFsID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2dsb2JhbCcpO1xudmFyIGlzT2JqZWN0ID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2lzLW9iamVjdCcpO1xuXG52YXIgZG9jdW1lbnQgPSBnbG9iYWwuZG9jdW1lbnQ7XG4vLyB0eXBlb2YgZG9jdW1lbnQuY3JlYXRlRWxlbWVudCBpcyAnb2JqZWN0JyBpbiBvbGQgSUVcbnZhciBFWElTVFMgPSBpc09iamVjdChkb2N1bWVudCkgJiYgaXNPYmplY3QoZG9jdW1lbnQuY3JlYXRlRWxlbWVudCk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGl0KSB7XG4gIHJldHVybiBFWElTVFMgPyBkb2N1bWVudC5jcmVhdGVFbGVtZW50KGl0KSA6IHt9O1xufTtcbiIsInZhciBERVNDUklQVE9SUyA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9kZXNjcmlwdG9ycycpO1xudmFyIGZhaWxzID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2ZhaWxzJyk7XG52YXIgY3JlYXRlRWxlbWVudCA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9kb2N1bWVudC1jcmVhdGUtZWxlbWVudCcpO1xuXG4vLyBUaGFuaydzIElFOCBmb3IgaGlzIGZ1bm55IGRlZmluZVByb3BlcnR5XG5tb2R1bGUuZXhwb3J0cyA9ICFERVNDUklQVE9SUyAmJiAhZmFpbHMoZnVuY3Rpb24gKCkge1xuICByZXR1cm4gT2JqZWN0LmRlZmluZVByb3BlcnR5KGNyZWF0ZUVsZW1lbnQoJ2RpdicpLCAnYScsIHtcbiAgICBnZXQ6IGZ1bmN0aW9uICgpIHsgcmV0dXJuIDc7IH1cbiAgfSkuYSAhPSA3O1xufSk7XG4iLCJ2YXIgREVTQ1JJUFRPUlMgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvZGVzY3JpcHRvcnMnKTtcbnZhciBwcm9wZXJ0eUlzRW51bWVyYWJsZU1vZHVsZSA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9vYmplY3QtcHJvcGVydHktaXMtZW51bWVyYWJsZScpO1xudmFyIGNyZWF0ZVByb3BlcnR5RGVzY3JpcHRvciA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9jcmVhdGUtcHJvcGVydHktZGVzY3JpcHRvcicpO1xudmFyIHRvSW5kZXhlZE9iamVjdCA9IHJlcXVpcmUoJy4uL2ludGVybmFscy90by1pbmRleGVkLW9iamVjdCcpO1xudmFyIHRvUHJpbWl0aXZlID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL3RvLXByaW1pdGl2ZScpO1xudmFyIGhhcyA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9oYXMnKTtcbnZhciBJRThfRE9NX0RFRklORSA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9pZTgtZG9tLWRlZmluZScpO1xuXG52YXIgbmF0aXZlR2V0T3duUHJvcGVydHlEZXNjcmlwdG9yID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcjtcblxuLy8gYE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3JgIG1ldGhvZFxuLy8gaHR0cHM6Ly90YzM5LmdpdGh1Yi5pby9lY21hMjYyLyNzZWMtb2JqZWN0LmdldG93bnByb3BlcnR5ZGVzY3JpcHRvclxuZXhwb3J0cy5mID0gREVTQ1JJUFRPUlMgPyBuYXRpdmVHZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IgOiBmdW5jdGlvbiBnZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IoTywgUCkge1xuICBPID0gdG9JbmRleGVkT2JqZWN0KE8pO1xuICBQID0gdG9QcmltaXRpdmUoUCwgdHJ1ZSk7XG4gIGlmIChJRThfRE9NX0RFRklORSkgdHJ5IHtcbiAgICByZXR1cm4gbmF0aXZlR2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKE8sIFApO1xuICB9IGNhdGNoIChlcnJvcikgeyAvKiBlbXB0eSAqLyB9XG4gIGlmIChoYXMoTywgUCkpIHJldHVybiBjcmVhdGVQcm9wZXJ0eURlc2NyaXB0b3IoIXByb3BlcnR5SXNFbnVtZXJhYmxlTW9kdWxlLmYuY2FsbChPLCBQKSwgT1tQXSk7XG59O1xuIiwidmFyIGlzT2JqZWN0ID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2lzLW9iamVjdCcpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChpdCkge1xuICBpZiAoIWlzT2JqZWN0KGl0KSkge1xuICAgIHRocm93IFR5cGVFcnJvcihTdHJpbmcoaXQpICsgJyBpcyBub3QgYW4gb2JqZWN0Jyk7XG4gIH0gcmV0dXJuIGl0O1xufTtcbiIsInZhciBERVNDUklQVE9SUyA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9kZXNjcmlwdG9ycycpO1xudmFyIElFOF9ET01fREVGSU5FID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2llOC1kb20tZGVmaW5lJyk7XG52YXIgYW5PYmplY3QgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvYW4tb2JqZWN0Jyk7XG52YXIgdG9QcmltaXRpdmUgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvdG8tcHJpbWl0aXZlJyk7XG5cbnZhciBuYXRpdmVEZWZpbmVQcm9wZXJ0eSA9IE9iamVjdC5kZWZpbmVQcm9wZXJ0eTtcblxuLy8gYE9iamVjdC5kZWZpbmVQcm9wZXJ0eWAgbWV0aG9kXG4vLyBodHRwczovL3RjMzkuZ2l0aHViLmlvL2VjbWEyNjIvI3NlYy1vYmplY3QuZGVmaW5lcHJvcGVydHlcbmV4cG9ydHMuZiA9IERFU0NSSVBUT1JTID8gbmF0aXZlRGVmaW5lUHJvcGVydHkgOiBmdW5jdGlvbiBkZWZpbmVQcm9wZXJ0eShPLCBQLCBBdHRyaWJ1dGVzKSB7XG4gIGFuT2JqZWN0KE8pO1xuICBQID0gdG9QcmltaXRpdmUoUCwgdHJ1ZSk7XG4gIGFuT2JqZWN0KEF0dHJpYnV0ZXMpO1xuICBpZiAoSUU4X0RPTV9ERUZJTkUpIHRyeSB7XG4gICAgcmV0dXJuIG5hdGl2ZURlZmluZVByb3BlcnR5KE8sIFAsIEF0dHJpYnV0ZXMpO1xuICB9IGNhdGNoIChlcnJvcikgeyAvKiBlbXB0eSAqLyB9XG4gIGlmICgnZ2V0JyBpbiBBdHRyaWJ1dGVzIHx8ICdzZXQnIGluIEF0dHJpYnV0ZXMpIHRocm93IFR5cGVFcnJvcignQWNjZXNzb3JzIG5vdCBzdXBwb3J0ZWQnKTtcbiAgaWYgKCd2YWx1ZScgaW4gQXR0cmlidXRlcykgT1tQXSA9IEF0dHJpYnV0ZXMudmFsdWU7XG4gIHJldHVybiBPO1xufTtcbiIsInZhciBERVNDUklQVE9SUyA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9kZXNjcmlwdG9ycycpO1xudmFyIGRlZmluZVByb3BlcnR5TW9kdWxlID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL29iamVjdC1kZWZpbmUtcHJvcGVydHknKTtcbnZhciBjcmVhdGVQcm9wZXJ0eURlc2NyaXB0b3IgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvY3JlYXRlLXByb3BlcnR5LWRlc2NyaXB0b3InKTtcblxubW9kdWxlLmV4cG9ydHMgPSBERVNDUklQVE9SUyA/IGZ1bmN0aW9uIChvYmplY3QsIGtleSwgdmFsdWUpIHtcbiAgcmV0dXJuIGRlZmluZVByb3BlcnR5TW9kdWxlLmYob2JqZWN0LCBrZXksIGNyZWF0ZVByb3BlcnR5RGVzY3JpcHRvcigxLCB2YWx1ZSkpO1xufSA6IGZ1bmN0aW9uIChvYmplY3QsIGtleSwgdmFsdWUpIHtcbiAgb2JqZWN0W2tleV0gPSB2YWx1ZTtcbiAgcmV0dXJuIG9iamVjdDtcbn07XG4iLCJ2YXIgZ2xvYmFsID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2dsb2JhbCcpO1xudmFyIGNyZWF0ZU5vbkVudW1lcmFibGVQcm9wZXJ0eSA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9jcmVhdGUtbm9uLWVudW1lcmFibGUtcHJvcGVydHknKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoa2V5LCB2YWx1ZSkge1xuICB0cnkge1xuICAgIGNyZWF0ZU5vbkVudW1lcmFibGVQcm9wZXJ0eShnbG9iYWwsIGtleSwgdmFsdWUpO1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIGdsb2JhbFtrZXldID0gdmFsdWU7XG4gIH0gcmV0dXJuIHZhbHVlO1xufTtcbiIsInZhciBnbG9iYWwgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvZ2xvYmFsJyk7XG52YXIgc2V0R2xvYmFsID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL3NldC1nbG9iYWwnKTtcblxudmFyIFNIQVJFRCA9ICdfX2NvcmUtanNfc2hhcmVkX18nO1xudmFyIHN0b3JlID0gZ2xvYmFsW1NIQVJFRF0gfHwgc2V0R2xvYmFsKFNIQVJFRCwge30pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHN0b3JlO1xuIiwidmFyIElTX1BVUkUgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvaXMtcHVyZScpO1xudmFyIHN0b3JlID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL3NoYXJlZC1zdG9yZScpO1xuXG4obW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoa2V5LCB2YWx1ZSkge1xuICByZXR1cm4gc3RvcmVba2V5XSB8fCAoc3RvcmVba2V5XSA9IHZhbHVlICE9PSB1bmRlZmluZWQgPyB2YWx1ZSA6IHt9KTtcbn0pKCd2ZXJzaW9ucycsIFtdKS5wdXNoKHtcbiAgdmVyc2lvbjogJzMuMy41JyxcbiAgbW9kZTogSVNfUFVSRSA/ICdwdXJlJyA6ICdnbG9iYWwnLFxuICBjb3B5cmlnaHQ6ICfCqSAyMDE5IERlbmlzIFB1c2hrYXJldiAoemxvaXJvY2sucnUpJ1xufSk7XG4iLCJ2YXIgc2hhcmVkID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL3NoYXJlZCcpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHNoYXJlZCgnbmF0aXZlLWZ1bmN0aW9uLXRvLXN0cmluZycsIEZ1bmN0aW9uLnRvU3RyaW5nKTtcbiIsInZhciBnbG9iYWwgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvZ2xvYmFsJyk7XG52YXIgbmF0aXZlRnVuY3Rpb25Ub1N0cmluZyA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9mdW5jdGlvbi10by1zdHJpbmcnKTtcblxudmFyIFdlYWtNYXAgPSBnbG9iYWwuV2Vha01hcDtcblxubW9kdWxlLmV4cG9ydHMgPSB0eXBlb2YgV2Vha01hcCA9PT0gJ2Z1bmN0aW9uJyAmJiAvbmF0aXZlIGNvZGUvLnRlc3QobmF0aXZlRnVuY3Rpb25Ub1N0cmluZy5jYWxsKFdlYWtNYXApKTtcbiIsInZhciBpZCA9IDA7XG52YXIgcG9zdGZpeCA9IE1hdGgucmFuZG9tKCk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGtleSkge1xuICByZXR1cm4gJ1N5bWJvbCgnICsgU3RyaW5nKGtleSA9PT0gdW5kZWZpbmVkID8gJycgOiBrZXkpICsgJylfJyArICgrK2lkICsgcG9zdGZpeCkudG9TdHJpbmcoMzYpO1xufTtcbiIsInZhciBzaGFyZWQgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvc2hhcmVkJyk7XG52YXIgdWlkID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL3VpZCcpO1xuXG52YXIga2V5cyA9IHNoYXJlZCgna2V5cycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChrZXkpIHtcbiAgcmV0dXJuIGtleXNba2V5XSB8fCAoa2V5c1trZXldID0gdWlkKGtleSkpO1xufTtcbiIsIm1vZHVsZS5leHBvcnRzID0ge307XG4iLCJ2YXIgTkFUSVZFX1dFQUtfTUFQID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL25hdGl2ZS13ZWFrLW1hcCcpO1xudmFyIGdsb2JhbCA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9nbG9iYWwnKTtcbnZhciBpc09iamVjdCA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9pcy1vYmplY3QnKTtcbnZhciBjcmVhdGVOb25FbnVtZXJhYmxlUHJvcGVydHkgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvY3JlYXRlLW5vbi1lbnVtZXJhYmxlLXByb3BlcnR5Jyk7XG52YXIgb2JqZWN0SGFzID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2hhcycpO1xudmFyIHNoYXJlZEtleSA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9zaGFyZWQta2V5Jyk7XG52YXIgaGlkZGVuS2V5cyA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9oaWRkZW4ta2V5cycpO1xuXG52YXIgV2Vha01hcCA9IGdsb2JhbC5XZWFrTWFwO1xudmFyIHNldCwgZ2V0LCBoYXM7XG5cbnZhciBlbmZvcmNlID0gZnVuY3Rpb24gKGl0KSB7XG4gIHJldHVybiBoYXMoaXQpID8gZ2V0KGl0KSA6IHNldChpdCwge30pO1xufTtcblxudmFyIGdldHRlckZvciA9IGZ1bmN0aW9uIChUWVBFKSB7XG4gIHJldHVybiBmdW5jdGlvbiAoaXQpIHtcbiAgICB2YXIgc3RhdGU7XG4gICAgaWYgKCFpc09iamVjdChpdCkgfHwgKHN0YXRlID0gZ2V0KGl0KSkudHlwZSAhPT0gVFlQRSkge1xuICAgICAgdGhyb3cgVHlwZUVycm9yKCdJbmNvbXBhdGlibGUgcmVjZWl2ZXIsICcgKyBUWVBFICsgJyByZXF1aXJlZCcpO1xuICAgIH0gcmV0dXJuIHN0YXRlO1xuICB9O1xufTtcblxuaWYgKE5BVElWRV9XRUFLX01BUCkge1xuICB2YXIgc3RvcmUgPSBuZXcgV2Vha01hcCgpO1xuICB2YXIgd21nZXQgPSBzdG9yZS5nZXQ7XG4gIHZhciB3bWhhcyA9IHN0b3JlLmhhcztcbiAgdmFyIHdtc2V0ID0gc3RvcmUuc2V0O1xuICBzZXQgPSBmdW5jdGlvbiAoaXQsIG1ldGFkYXRhKSB7XG4gICAgd21zZXQuY2FsbChzdG9yZSwgaXQsIG1ldGFkYXRhKTtcbiAgICByZXR1cm4gbWV0YWRhdGE7XG4gIH07XG4gIGdldCA9IGZ1bmN0aW9uIChpdCkge1xuICAgIHJldHVybiB3bWdldC5jYWxsKHN0b3JlLCBpdCkgfHwge307XG4gIH07XG4gIGhhcyA9IGZ1bmN0aW9uIChpdCkge1xuICAgIHJldHVybiB3bWhhcy5jYWxsKHN0b3JlLCBpdCk7XG4gIH07XG59IGVsc2Uge1xuICB2YXIgU1RBVEUgPSBzaGFyZWRLZXkoJ3N0YXRlJyk7XG4gIGhpZGRlbktleXNbU1RBVEVdID0gdHJ1ZTtcbiAgc2V0ID0gZnVuY3Rpb24gKGl0LCBtZXRhZGF0YSkge1xuICAgIGNyZWF0ZU5vbkVudW1lcmFibGVQcm9wZXJ0eShpdCwgU1RBVEUsIG1ldGFkYXRhKTtcbiAgICByZXR1cm4gbWV0YWRhdGE7XG4gIH07XG4gIGdldCA9IGZ1bmN0aW9uIChpdCkge1xuICAgIHJldHVybiBvYmplY3RIYXMoaXQsIFNUQVRFKSA/IGl0W1NUQVRFXSA6IHt9O1xuICB9O1xuICBoYXMgPSBmdW5jdGlvbiAoaXQpIHtcbiAgICByZXR1cm4gb2JqZWN0SGFzKGl0LCBTVEFURSk7XG4gIH07XG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBzZXQ6IHNldCxcbiAgZ2V0OiBnZXQsXG4gIGhhczogaGFzLFxuICBlbmZvcmNlOiBlbmZvcmNlLFxuICBnZXR0ZXJGb3I6IGdldHRlckZvclxufTtcbiIsInZhciBnbG9iYWwgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvZ2xvYmFsJyk7XG52YXIgc2hhcmVkID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL3NoYXJlZCcpO1xudmFyIGNyZWF0ZU5vbkVudW1lcmFibGVQcm9wZXJ0eSA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9jcmVhdGUtbm9uLWVudW1lcmFibGUtcHJvcGVydHknKTtcbnZhciBoYXMgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvaGFzJyk7XG52YXIgc2V0R2xvYmFsID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL3NldC1nbG9iYWwnKTtcbnZhciBuYXRpdmVGdW5jdGlvblRvU3RyaW5nID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2Z1bmN0aW9uLXRvLXN0cmluZycpO1xudmFyIEludGVybmFsU3RhdGVNb2R1bGUgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvaW50ZXJuYWwtc3RhdGUnKTtcblxudmFyIGdldEludGVybmFsU3RhdGUgPSBJbnRlcm5hbFN0YXRlTW9kdWxlLmdldDtcbnZhciBlbmZvcmNlSW50ZXJuYWxTdGF0ZSA9IEludGVybmFsU3RhdGVNb2R1bGUuZW5mb3JjZTtcbnZhciBURU1QTEFURSA9IFN0cmluZyhuYXRpdmVGdW5jdGlvblRvU3RyaW5nKS5zcGxpdCgndG9TdHJpbmcnKTtcblxuc2hhcmVkKCdpbnNwZWN0U291cmNlJywgZnVuY3Rpb24gKGl0KSB7XG4gIHJldHVybiBuYXRpdmVGdW5jdGlvblRvU3RyaW5nLmNhbGwoaXQpO1xufSk7XG5cbihtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChPLCBrZXksIHZhbHVlLCBvcHRpb25zKSB7XG4gIHZhciB1bnNhZmUgPSBvcHRpb25zID8gISFvcHRpb25zLnVuc2FmZSA6IGZhbHNlO1xuICB2YXIgc2ltcGxlID0gb3B0aW9ucyA/ICEhb3B0aW9ucy5lbnVtZXJhYmxlIDogZmFsc2U7XG4gIHZhciBub1RhcmdldEdldCA9IG9wdGlvbnMgPyAhIW9wdGlvbnMubm9UYXJnZXRHZXQgOiBmYWxzZTtcbiAgaWYgKHR5cGVvZiB2YWx1ZSA9PSAnZnVuY3Rpb24nKSB7XG4gICAgaWYgKHR5cGVvZiBrZXkgPT0gJ3N0cmluZycgJiYgIWhhcyh2YWx1ZSwgJ25hbWUnKSkgY3JlYXRlTm9uRW51bWVyYWJsZVByb3BlcnR5KHZhbHVlLCAnbmFtZScsIGtleSk7XG4gICAgZW5mb3JjZUludGVybmFsU3RhdGUodmFsdWUpLnNvdXJjZSA9IFRFTVBMQVRFLmpvaW4odHlwZW9mIGtleSA9PSAnc3RyaW5nJyA/IGtleSA6ICcnKTtcbiAgfVxuICBpZiAoTyA9PT0gZ2xvYmFsKSB7XG4gICAgaWYgKHNpbXBsZSkgT1trZXldID0gdmFsdWU7XG4gICAgZWxzZSBzZXRHbG9iYWwoa2V5LCB2YWx1ZSk7XG4gICAgcmV0dXJuO1xuICB9IGVsc2UgaWYgKCF1bnNhZmUpIHtcbiAgICBkZWxldGUgT1trZXldO1xuICB9IGVsc2UgaWYgKCFub1RhcmdldEdldCAmJiBPW2tleV0pIHtcbiAgICBzaW1wbGUgPSB0cnVlO1xuICB9XG4gIGlmIChzaW1wbGUpIE9ba2V5XSA9IHZhbHVlO1xuICBlbHNlIGNyZWF0ZU5vbkVudW1lcmFibGVQcm9wZXJ0eShPLCBrZXksIHZhbHVlKTtcbi8vIGFkZCBmYWtlIEZ1bmN0aW9uI3RvU3RyaW5nIGZvciBjb3JyZWN0IHdvcmsgd3JhcHBlZCBtZXRob2RzIC8gY29uc3RydWN0b3JzIHdpdGggbWV0aG9kcyBsaWtlIExvRGFzaCBpc05hdGl2ZVxufSkoRnVuY3Rpb24ucHJvdG90eXBlLCAndG9TdHJpbmcnLCBmdW5jdGlvbiB0b1N0cmluZygpIHtcbiAgcmV0dXJuIHR5cGVvZiB0aGlzID09ICdmdW5jdGlvbicgJiYgZ2V0SW50ZXJuYWxTdGF0ZSh0aGlzKS5zb3VyY2UgfHwgbmF0aXZlRnVuY3Rpb25Ub1N0cmluZy5jYWxsKHRoaXMpO1xufSk7XG4iLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9nbG9iYWwnKTtcbiIsInZhciBwYXRoID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL3BhdGgnKTtcbnZhciBnbG9iYWwgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvZ2xvYmFsJyk7XG5cbnZhciBhRnVuY3Rpb24gPSBmdW5jdGlvbiAodmFyaWFibGUpIHtcbiAgcmV0dXJuIHR5cGVvZiB2YXJpYWJsZSA9PSAnZnVuY3Rpb24nID8gdmFyaWFibGUgOiB1bmRlZmluZWQ7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChuYW1lc3BhY2UsIG1ldGhvZCkge1xuICByZXR1cm4gYXJndW1lbnRzLmxlbmd0aCA8IDIgPyBhRnVuY3Rpb24ocGF0aFtuYW1lc3BhY2VdKSB8fCBhRnVuY3Rpb24oZ2xvYmFsW25hbWVzcGFjZV0pXG4gICAgOiBwYXRoW25hbWVzcGFjZV0gJiYgcGF0aFtuYW1lc3BhY2VdW21ldGhvZF0gfHwgZ2xvYmFsW25hbWVzcGFjZV0gJiYgZ2xvYmFsW25hbWVzcGFjZV1bbWV0aG9kXTtcbn07XG4iLCJ2YXIgY2VpbCA9IE1hdGguY2VpbDtcbnZhciBmbG9vciA9IE1hdGguZmxvb3I7XG5cbi8vIGBUb0ludGVnZXJgIGFic3RyYWN0IG9wZXJhdGlvblxuLy8gaHR0cHM6Ly90YzM5LmdpdGh1Yi5pby9lY21hMjYyLyNzZWMtdG9pbnRlZ2VyXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChhcmd1bWVudCkge1xuICByZXR1cm4gaXNOYU4oYXJndW1lbnQgPSArYXJndW1lbnQpID8gMCA6IChhcmd1bWVudCA+IDAgPyBmbG9vciA6IGNlaWwpKGFyZ3VtZW50KTtcbn07XG4iLCJ2YXIgdG9JbnRlZ2VyID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL3RvLWludGVnZXInKTtcblxudmFyIG1pbiA9IE1hdGgubWluO1xuXG4vLyBgVG9MZW5ndGhgIGFic3RyYWN0IG9wZXJhdGlvblxuLy8gaHR0cHM6Ly90YzM5LmdpdGh1Yi5pby9lY21hMjYyLyNzZWMtdG9sZW5ndGhcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGFyZ3VtZW50KSB7XG4gIHJldHVybiBhcmd1bWVudCA+IDAgPyBtaW4odG9JbnRlZ2VyKGFyZ3VtZW50KSwgMHgxRkZGRkZGRkZGRkZGRikgOiAwOyAvLyAyICoqIDUzIC0gMSA9PSA5MDA3MTk5MjU0NzQwOTkxXG59O1xuIiwidmFyIHRvSW50ZWdlciA9IHJlcXVpcmUoJy4uL2ludGVybmFscy90by1pbnRlZ2VyJyk7XG5cbnZhciBtYXggPSBNYXRoLm1heDtcbnZhciBtaW4gPSBNYXRoLm1pbjtcblxuLy8gSGVscGVyIGZvciBhIHBvcHVsYXIgcmVwZWF0aW5nIGNhc2Ugb2YgdGhlIHNwZWM6XG4vLyBMZXQgaW50ZWdlciBiZSA/IFRvSW50ZWdlcihpbmRleCkuXG4vLyBJZiBpbnRlZ2VyIDwgMCwgbGV0IHJlc3VsdCBiZSBtYXgoKGxlbmd0aCArIGludGVnZXIpLCAwKTsgZWxzZSBsZXQgcmVzdWx0IGJlIG1pbihsZW5ndGgsIGxlbmd0aCkuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChpbmRleCwgbGVuZ3RoKSB7XG4gIHZhciBpbnRlZ2VyID0gdG9JbnRlZ2VyKGluZGV4KTtcbiAgcmV0dXJuIGludGVnZXIgPCAwID8gbWF4KGludGVnZXIgKyBsZW5ndGgsIDApIDogbWluKGludGVnZXIsIGxlbmd0aCk7XG59O1xuIiwidmFyIHRvSW5kZXhlZE9iamVjdCA9IHJlcXVpcmUoJy4uL2ludGVybmFscy90by1pbmRleGVkLW9iamVjdCcpO1xudmFyIHRvTGVuZ3RoID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL3RvLWxlbmd0aCcpO1xudmFyIHRvQWJzb2x1dGVJbmRleCA9IHJlcXVpcmUoJy4uL2ludGVybmFscy90by1hYnNvbHV0ZS1pbmRleCcpO1xuXG4vLyBgQXJyYXkucHJvdG90eXBlLnsgaW5kZXhPZiwgaW5jbHVkZXMgfWAgbWV0aG9kcyBpbXBsZW1lbnRhdGlvblxudmFyIGNyZWF0ZU1ldGhvZCA9IGZ1bmN0aW9uIChJU19JTkNMVURFUykge1xuICByZXR1cm4gZnVuY3Rpb24gKCR0aGlzLCBlbCwgZnJvbUluZGV4KSB7XG4gICAgdmFyIE8gPSB0b0luZGV4ZWRPYmplY3QoJHRoaXMpO1xuICAgIHZhciBsZW5ndGggPSB0b0xlbmd0aChPLmxlbmd0aCk7XG4gICAgdmFyIGluZGV4ID0gdG9BYnNvbHV0ZUluZGV4KGZyb21JbmRleCwgbGVuZ3RoKTtcbiAgICB2YXIgdmFsdWU7XG4gICAgLy8gQXJyYXkjaW5jbHVkZXMgdXNlcyBTYW1lVmFsdWVaZXJvIGVxdWFsaXR5IGFsZ29yaXRobVxuICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1zZWxmLWNvbXBhcmVcbiAgICBpZiAoSVNfSU5DTFVERVMgJiYgZWwgIT0gZWwpIHdoaWxlIChsZW5ndGggPiBpbmRleCkge1xuICAgICAgdmFsdWUgPSBPW2luZGV4KytdO1xuICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLXNlbGYtY29tcGFyZVxuICAgICAgaWYgKHZhbHVlICE9IHZhbHVlKSByZXR1cm4gdHJ1ZTtcbiAgICAvLyBBcnJheSNpbmRleE9mIGlnbm9yZXMgaG9sZXMsIEFycmF5I2luY2x1ZGVzIC0gbm90XG4gICAgfSBlbHNlIGZvciAoO2xlbmd0aCA+IGluZGV4OyBpbmRleCsrKSB7XG4gICAgICBpZiAoKElTX0lOQ0xVREVTIHx8IGluZGV4IGluIE8pICYmIE9baW5kZXhdID09PSBlbCkgcmV0dXJuIElTX0lOQ0xVREVTIHx8IGluZGV4IHx8IDA7XG4gICAgfSByZXR1cm4gIUlTX0lOQ0xVREVTICYmIC0xO1xuICB9O1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIC8vIGBBcnJheS5wcm90b3R5cGUuaW5jbHVkZXNgIG1ldGhvZFxuICAvLyBodHRwczovL3RjMzkuZ2l0aHViLmlvL2VjbWEyNjIvI3NlYy1hcnJheS5wcm90b3R5cGUuaW5jbHVkZXNcbiAgaW5jbHVkZXM6IGNyZWF0ZU1ldGhvZCh0cnVlKSxcbiAgLy8gYEFycmF5LnByb3RvdHlwZS5pbmRleE9mYCBtZXRob2RcbiAgLy8gaHR0cHM6Ly90YzM5LmdpdGh1Yi5pby9lY21hMjYyLyNzZWMtYXJyYXkucHJvdG90eXBlLmluZGV4b2ZcbiAgaW5kZXhPZjogY3JlYXRlTWV0aG9kKGZhbHNlKVxufTtcbiIsInZhciBoYXMgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvaGFzJyk7XG52YXIgdG9JbmRleGVkT2JqZWN0ID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL3RvLWluZGV4ZWQtb2JqZWN0Jyk7XG52YXIgaW5kZXhPZiA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9hcnJheS1pbmNsdWRlcycpLmluZGV4T2Y7XG52YXIgaGlkZGVuS2V5cyA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9oaWRkZW4ta2V5cycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChvYmplY3QsIG5hbWVzKSB7XG4gIHZhciBPID0gdG9JbmRleGVkT2JqZWN0KG9iamVjdCk7XG4gIHZhciBpID0gMDtcbiAgdmFyIHJlc3VsdCA9IFtdO1xuICB2YXIga2V5O1xuICBmb3IgKGtleSBpbiBPKSAhaGFzKGhpZGRlbktleXMsIGtleSkgJiYgaGFzKE8sIGtleSkgJiYgcmVzdWx0LnB1c2goa2V5KTtcbiAgLy8gRG9uJ3QgZW51bSBidWcgJiBoaWRkZW4ga2V5c1xuICB3aGlsZSAobmFtZXMubGVuZ3RoID4gaSkgaWYgKGhhcyhPLCBrZXkgPSBuYW1lc1tpKytdKSkge1xuICAgIH5pbmRleE9mKHJlc3VsdCwga2V5KSB8fCByZXN1bHQucHVzaChrZXkpO1xuICB9XG4gIHJldHVybiByZXN1bHQ7XG59O1xuIiwiLy8gSUU4LSBkb24ndCBlbnVtIGJ1ZyBrZXlzXG5tb2R1bGUuZXhwb3J0cyA9IFtcbiAgJ2NvbnN0cnVjdG9yJyxcbiAgJ2hhc093blByb3BlcnR5JyxcbiAgJ2lzUHJvdG90eXBlT2YnLFxuICAncHJvcGVydHlJc0VudW1lcmFibGUnLFxuICAndG9Mb2NhbGVTdHJpbmcnLFxuICAndG9TdHJpbmcnLFxuICAndmFsdWVPZidcbl07XG4iLCJ2YXIgaW50ZXJuYWxPYmplY3RLZXlzID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL29iamVjdC1rZXlzLWludGVybmFsJyk7XG52YXIgZW51bUJ1Z0tleXMgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvZW51bS1idWcta2V5cycpO1xuXG52YXIgaGlkZGVuS2V5cyA9IGVudW1CdWdLZXlzLmNvbmNhdCgnbGVuZ3RoJywgJ3Byb3RvdHlwZScpO1xuXG4vLyBgT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXNgIG1ldGhvZFxuLy8gaHR0cHM6Ly90YzM5LmdpdGh1Yi5pby9lY21hMjYyLyNzZWMtb2JqZWN0LmdldG93bnByb3BlcnR5bmFtZXNcbmV4cG9ydHMuZiA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzIHx8IGZ1bmN0aW9uIGdldE93blByb3BlcnR5TmFtZXMoTykge1xuICByZXR1cm4gaW50ZXJuYWxPYmplY3RLZXlzKE8sIGhpZGRlbktleXMpO1xufTtcbiIsImV4cG9ydHMuZiA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eVN5bWJvbHM7XG4iLCJ2YXIgZ2V0QnVpbHRJbiA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9nZXQtYnVpbHQtaW4nKTtcbnZhciBnZXRPd25Qcm9wZXJ0eU5hbWVzTW9kdWxlID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL29iamVjdC1nZXQtb3duLXByb3BlcnR5LW5hbWVzJyk7XG52YXIgZ2V0T3duUHJvcGVydHlTeW1ib2xzTW9kdWxlID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL29iamVjdC1nZXQtb3duLXByb3BlcnR5LXN5bWJvbHMnKTtcbnZhciBhbk9iamVjdCA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9hbi1vYmplY3QnKTtcblxuLy8gYWxsIG9iamVjdCBrZXlzLCBpbmNsdWRlcyBub24tZW51bWVyYWJsZSBhbmQgc3ltYm9sc1xubW9kdWxlLmV4cG9ydHMgPSBnZXRCdWlsdEluKCdSZWZsZWN0JywgJ293bktleXMnKSB8fCBmdW5jdGlvbiBvd25LZXlzKGl0KSB7XG4gIHZhciBrZXlzID0gZ2V0T3duUHJvcGVydHlOYW1lc01vZHVsZS5mKGFuT2JqZWN0KGl0KSk7XG4gIHZhciBnZXRPd25Qcm9wZXJ0eVN5bWJvbHMgPSBnZXRPd25Qcm9wZXJ0eVN5bWJvbHNNb2R1bGUuZjtcbiAgcmV0dXJuIGdldE93blByb3BlcnR5U3ltYm9scyA/IGtleXMuY29uY2F0KGdldE93blByb3BlcnR5U3ltYm9scyhpdCkpIDoga2V5cztcbn07XG4iLCJ2YXIgaGFzID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2hhcycpO1xudmFyIG93bktleXMgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvb3duLWtleXMnKTtcbnZhciBnZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3JNb2R1bGUgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvb2JqZWN0LWdldC1vd24tcHJvcGVydHktZGVzY3JpcHRvcicpO1xudmFyIGRlZmluZVByb3BlcnR5TW9kdWxlID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL29iamVjdC1kZWZpbmUtcHJvcGVydHknKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAodGFyZ2V0LCBzb3VyY2UpIHtcbiAgdmFyIGtleXMgPSBvd25LZXlzKHNvdXJjZSk7XG4gIHZhciBkZWZpbmVQcm9wZXJ0eSA9IGRlZmluZVByb3BlcnR5TW9kdWxlLmY7XG4gIHZhciBnZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IgPSBnZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3JNb2R1bGUuZjtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBrZXlzLmxlbmd0aDsgaSsrKSB7XG4gICAgdmFyIGtleSA9IGtleXNbaV07XG4gICAgaWYgKCFoYXModGFyZ2V0LCBrZXkpKSBkZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIGtleSwgZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKHNvdXJjZSwga2V5KSk7XG4gIH1cbn07XG4iLCJ2YXIgZmFpbHMgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvZmFpbHMnKTtcblxudmFyIHJlcGxhY2VtZW50ID0gLyN8XFwucHJvdG90eXBlXFwuLztcblxudmFyIGlzRm9yY2VkID0gZnVuY3Rpb24gKGZlYXR1cmUsIGRldGVjdGlvbikge1xuICB2YXIgdmFsdWUgPSBkYXRhW25vcm1hbGl6ZShmZWF0dXJlKV07XG4gIHJldHVybiB2YWx1ZSA9PSBQT0xZRklMTCA/IHRydWVcbiAgICA6IHZhbHVlID09IE5BVElWRSA/IGZhbHNlXG4gICAgOiB0eXBlb2YgZGV0ZWN0aW9uID09ICdmdW5jdGlvbicgPyBmYWlscyhkZXRlY3Rpb24pXG4gICAgOiAhIWRldGVjdGlvbjtcbn07XG5cbnZhciBub3JtYWxpemUgPSBpc0ZvcmNlZC5ub3JtYWxpemUgPSBmdW5jdGlvbiAoc3RyaW5nKSB7XG4gIHJldHVybiBTdHJpbmcoc3RyaW5nKS5yZXBsYWNlKHJlcGxhY2VtZW50LCAnLicpLnRvTG93ZXJDYXNlKCk7XG59O1xuXG52YXIgZGF0YSA9IGlzRm9yY2VkLmRhdGEgPSB7fTtcbnZhciBOQVRJVkUgPSBpc0ZvcmNlZC5OQVRJVkUgPSAnTic7XG52YXIgUE9MWUZJTEwgPSBpc0ZvcmNlZC5QT0xZRklMTCA9ICdQJztcblxubW9kdWxlLmV4cG9ydHMgPSBpc0ZvcmNlZDtcbiIsInZhciBnbG9iYWwgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvZ2xvYmFsJyk7XG52YXIgZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL29iamVjdC1nZXQtb3duLXByb3BlcnR5LWRlc2NyaXB0b3InKS5mO1xudmFyIGNyZWF0ZU5vbkVudW1lcmFibGVQcm9wZXJ0eSA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9jcmVhdGUtbm9uLWVudW1lcmFibGUtcHJvcGVydHknKTtcbnZhciByZWRlZmluZSA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9yZWRlZmluZScpO1xudmFyIHNldEdsb2JhbCA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9zZXQtZ2xvYmFsJyk7XG52YXIgY29weUNvbnN0cnVjdG9yUHJvcGVydGllcyA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9jb3B5LWNvbnN0cnVjdG9yLXByb3BlcnRpZXMnKTtcbnZhciBpc0ZvcmNlZCA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9pcy1mb3JjZWQnKTtcblxuLypcbiAgb3B0aW9ucy50YXJnZXQgICAgICAtIG5hbWUgb2YgdGhlIHRhcmdldCBvYmplY3RcbiAgb3B0aW9ucy5nbG9iYWwgICAgICAtIHRhcmdldCBpcyB0aGUgZ2xvYmFsIG9iamVjdFxuICBvcHRpb25zLnN0YXQgICAgICAgIC0gZXhwb3J0IGFzIHN0YXRpYyBtZXRob2RzIG9mIHRhcmdldFxuICBvcHRpb25zLnByb3RvICAgICAgIC0gZXhwb3J0IGFzIHByb3RvdHlwZSBtZXRob2RzIG9mIHRhcmdldFxuICBvcHRpb25zLnJlYWwgICAgICAgIC0gcmVhbCBwcm90b3R5cGUgbWV0aG9kIGZvciB0aGUgYHB1cmVgIHZlcnNpb25cbiAgb3B0aW9ucy5mb3JjZWQgICAgICAtIGV4cG9ydCBldmVuIGlmIHRoZSBuYXRpdmUgZmVhdHVyZSBpcyBhdmFpbGFibGVcbiAgb3B0aW9ucy5iaW5kICAgICAgICAtIGJpbmQgbWV0aG9kcyB0byB0aGUgdGFyZ2V0LCByZXF1aXJlZCBmb3IgdGhlIGBwdXJlYCB2ZXJzaW9uXG4gIG9wdGlvbnMud3JhcCAgICAgICAgLSB3cmFwIGNvbnN0cnVjdG9ycyB0byBwcmV2ZW50aW5nIGdsb2JhbCBwb2xsdXRpb24sIHJlcXVpcmVkIGZvciB0aGUgYHB1cmVgIHZlcnNpb25cbiAgb3B0aW9ucy51bnNhZmUgICAgICAtIHVzZSB0aGUgc2ltcGxlIGFzc2lnbm1lbnQgb2YgcHJvcGVydHkgaW5zdGVhZCBvZiBkZWxldGUgKyBkZWZpbmVQcm9wZXJ0eVxuICBvcHRpb25zLnNoYW0gICAgICAgIC0gYWRkIGEgZmxhZyB0byBub3QgY29tcGxldGVseSBmdWxsIHBvbHlmaWxsc1xuICBvcHRpb25zLmVudW1lcmFibGUgIC0gZXhwb3J0IGFzIGVudW1lcmFibGUgcHJvcGVydHlcbiAgb3B0aW9ucy5ub1RhcmdldEdldCAtIHByZXZlbnQgY2FsbGluZyBhIGdldHRlciBvbiB0YXJnZXRcbiovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChvcHRpb25zLCBzb3VyY2UpIHtcbiAgdmFyIFRBUkdFVCA9IG9wdGlvbnMudGFyZ2V0O1xuICB2YXIgR0xPQkFMID0gb3B0aW9ucy5nbG9iYWw7XG4gIHZhciBTVEFUSUMgPSBvcHRpb25zLnN0YXQ7XG4gIHZhciBGT1JDRUQsIHRhcmdldCwga2V5LCB0YXJnZXRQcm9wZXJ0eSwgc291cmNlUHJvcGVydHksIGRlc2NyaXB0b3I7XG4gIGlmIChHTE9CQUwpIHtcbiAgICB0YXJnZXQgPSBnbG9iYWw7XG4gIH0gZWxzZSBpZiAoU1RBVElDKSB7XG4gICAgdGFyZ2V0ID0gZ2xvYmFsW1RBUkdFVF0gfHwgc2V0R2xvYmFsKFRBUkdFVCwge30pO1xuICB9IGVsc2Uge1xuICAgIHRhcmdldCA9IChnbG9iYWxbVEFSR0VUXSB8fCB7fSkucHJvdG90eXBlO1xuICB9XG4gIGlmICh0YXJnZXQpIGZvciAoa2V5IGluIHNvdXJjZSkge1xuICAgIHNvdXJjZVByb3BlcnR5ID0gc291cmNlW2tleV07XG4gICAgaWYgKG9wdGlvbnMubm9UYXJnZXRHZXQpIHtcbiAgICAgIGRlc2NyaXB0b3IgPSBnZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IodGFyZ2V0LCBrZXkpO1xuICAgICAgdGFyZ2V0UHJvcGVydHkgPSBkZXNjcmlwdG9yICYmIGRlc2NyaXB0b3IudmFsdWU7XG4gICAgfSBlbHNlIHRhcmdldFByb3BlcnR5ID0gdGFyZ2V0W2tleV07XG4gICAgRk9SQ0VEID0gaXNGb3JjZWQoR0xPQkFMID8ga2V5IDogVEFSR0VUICsgKFNUQVRJQyA/ICcuJyA6ICcjJykgKyBrZXksIG9wdGlvbnMuZm9yY2VkKTtcbiAgICAvLyBjb250YWluZWQgaW4gdGFyZ2V0XG4gICAgaWYgKCFGT1JDRUQgJiYgdGFyZ2V0UHJvcGVydHkgIT09IHVuZGVmaW5lZCkge1xuICAgICAgaWYgKHR5cGVvZiBzb3VyY2VQcm9wZXJ0eSA9PT0gdHlwZW9mIHRhcmdldFByb3BlcnR5KSBjb250aW51ZTtcbiAgICAgIGNvcHlDb25zdHJ1Y3RvclByb3BlcnRpZXMoc291cmNlUHJvcGVydHksIHRhcmdldFByb3BlcnR5KTtcbiAgICB9XG4gICAgLy8gYWRkIGEgZmxhZyB0byBub3QgY29tcGxldGVseSBmdWxsIHBvbHlmaWxsc1xuICAgIGlmIChvcHRpb25zLnNoYW0gfHwgKHRhcmdldFByb3BlcnR5ICYmIHRhcmdldFByb3BlcnR5LnNoYW0pKSB7XG4gICAgICBjcmVhdGVOb25FbnVtZXJhYmxlUHJvcGVydHkoc291cmNlUHJvcGVydHksICdzaGFtJywgdHJ1ZSk7XG4gICAgfVxuICAgIC8vIGV4dGVuZCBnbG9iYWxcbiAgICByZWRlZmluZSh0YXJnZXQsIGtleSwgc291cmNlUHJvcGVydHksIG9wdGlvbnMpO1xuICB9XG59O1xuIiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoaXQpIHtcbiAgaWYgKHR5cGVvZiBpdCAhPSAnZnVuY3Rpb24nKSB7XG4gICAgdGhyb3cgVHlwZUVycm9yKFN0cmluZyhpdCkgKyAnIGlzIG5vdCBhIGZ1bmN0aW9uJyk7XG4gIH0gcmV0dXJuIGl0O1xufTtcbiIsInZhciBhRnVuY3Rpb24gPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvYS1mdW5jdGlvbicpO1xuXG4vLyBvcHRpb25hbCAvIHNpbXBsZSBjb250ZXh0IGJpbmRpbmdcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGZuLCB0aGF0LCBsZW5ndGgpIHtcbiAgYUZ1bmN0aW9uKGZuKTtcbiAgaWYgKHRoYXQgPT09IHVuZGVmaW5lZCkgcmV0dXJuIGZuO1xuICBzd2l0Y2ggKGxlbmd0aCkge1xuICAgIGNhc2UgMDogcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiBmbi5jYWxsKHRoYXQpO1xuICAgIH07XG4gICAgY2FzZSAxOiByZXR1cm4gZnVuY3Rpb24gKGEpIHtcbiAgICAgIHJldHVybiBmbi5jYWxsKHRoYXQsIGEpO1xuICAgIH07XG4gICAgY2FzZSAyOiByZXR1cm4gZnVuY3Rpb24gKGEsIGIpIHtcbiAgICAgIHJldHVybiBmbi5jYWxsKHRoYXQsIGEsIGIpO1xuICAgIH07XG4gICAgY2FzZSAzOiByZXR1cm4gZnVuY3Rpb24gKGEsIGIsIGMpIHtcbiAgICAgIHJldHVybiBmbi5jYWxsKHRoYXQsIGEsIGIsIGMpO1xuICAgIH07XG4gIH1cbiAgcmV0dXJuIGZ1bmN0aW9uICgvKiAuLi5hcmdzICovKSB7XG4gICAgcmV0dXJuIGZuLmFwcGx5KHRoYXQsIGFyZ3VtZW50cyk7XG4gIH07XG59O1xuIiwidmFyIHJlcXVpcmVPYmplY3RDb2VyY2libGUgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvcmVxdWlyZS1vYmplY3QtY29lcmNpYmxlJyk7XG5cbi8vIGBUb09iamVjdGAgYWJzdHJhY3Qgb3BlcmF0aW9uXG4vLyBodHRwczovL3RjMzkuZ2l0aHViLmlvL2VjbWEyNjIvI3NlYy10b29iamVjdFxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoYXJndW1lbnQpIHtcbiAgcmV0dXJuIE9iamVjdChyZXF1aXJlT2JqZWN0Q29lcmNpYmxlKGFyZ3VtZW50KSk7XG59O1xuIiwidmFyIGNsYXNzb2YgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvY2xhc3NvZi1yYXcnKTtcblxuLy8gYElzQXJyYXlgIGFic3RyYWN0IG9wZXJhdGlvblxuLy8gaHR0cHM6Ly90YzM5LmdpdGh1Yi5pby9lY21hMjYyLyNzZWMtaXNhcnJheVxubW9kdWxlLmV4cG9ydHMgPSBBcnJheS5pc0FycmF5IHx8IGZ1bmN0aW9uIGlzQXJyYXkoYXJnKSB7XG4gIHJldHVybiBjbGFzc29mKGFyZykgPT0gJ0FycmF5Jztcbn07XG4iLCJ2YXIgZmFpbHMgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvZmFpbHMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSAhIU9iamVjdC5nZXRPd25Qcm9wZXJ0eVN5bWJvbHMgJiYgIWZhaWxzKGZ1bmN0aW9uICgpIHtcbiAgLy8gQ2hyb21lIDM4IFN5bWJvbCBoYXMgaW5jb3JyZWN0IHRvU3RyaW5nIGNvbnZlcnNpb25cbiAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLXVuZGVmXG4gIHJldHVybiAhU3RyaW5nKFN5bWJvbCgpKTtcbn0pO1xuIiwidmFyIGdsb2JhbCA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9nbG9iYWwnKTtcbnZhciBzaGFyZWQgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvc2hhcmVkJyk7XG52YXIgdWlkID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL3VpZCcpO1xudmFyIE5BVElWRV9TWU1CT0wgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvbmF0aXZlLXN5bWJvbCcpO1xuXG52YXIgU3ltYm9sID0gZ2xvYmFsLlN5bWJvbDtcbnZhciBzdG9yZSA9IHNoYXJlZCgnd2tzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKG5hbWUpIHtcbiAgcmV0dXJuIHN0b3JlW25hbWVdIHx8IChzdG9yZVtuYW1lXSA9IE5BVElWRV9TWU1CT0wgJiYgU3ltYm9sW25hbWVdXG4gICAgfHwgKE5BVElWRV9TWU1CT0wgPyBTeW1ib2wgOiB1aWQpKCdTeW1ib2wuJyArIG5hbWUpKTtcbn07XG4iLCJ2YXIgaXNPYmplY3QgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvaXMtb2JqZWN0Jyk7XG52YXIgaXNBcnJheSA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9pcy1hcnJheScpO1xudmFyIHdlbGxLbm93blN5bWJvbCA9IHJlcXVpcmUoJy4uL2ludGVybmFscy93ZWxsLWtub3duLXN5bWJvbCcpO1xuXG52YXIgU1BFQ0lFUyA9IHdlbGxLbm93blN5bWJvbCgnc3BlY2llcycpO1xuXG4vLyBgQXJyYXlTcGVjaWVzQ3JlYXRlYCBhYnN0cmFjdCBvcGVyYXRpb25cbi8vIGh0dHBzOi8vdGMzOS5naXRodWIuaW8vZWNtYTI2Mi8jc2VjLWFycmF5c3BlY2llc2NyZWF0ZVxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAob3JpZ2luYWxBcnJheSwgbGVuZ3RoKSB7XG4gIHZhciBDO1xuICBpZiAoaXNBcnJheShvcmlnaW5hbEFycmF5KSkge1xuICAgIEMgPSBvcmlnaW5hbEFycmF5LmNvbnN0cnVjdG9yO1xuICAgIC8vIGNyb3NzLXJlYWxtIGZhbGxiYWNrXG4gICAgaWYgKHR5cGVvZiBDID09ICdmdW5jdGlvbicgJiYgKEMgPT09IEFycmF5IHx8IGlzQXJyYXkoQy5wcm90b3R5cGUpKSkgQyA9IHVuZGVmaW5lZDtcbiAgICBlbHNlIGlmIChpc09iamVjdChDKSkge1xuICAgICAgQyA9IENbU1BFQ0lFU107XG4gICAgICBpZiAoQyA9PT0gbnVsbCkgQyA9IHVuZGVmaW5lZDtcbiAgICB9XG4gIH0gcmV0dXJuIG5ldyAoQyA9PT0gdW5kZWZpbmVkID8gQXJyYXkgOiBDKShsZW5ndGggPT09IDAgPyAwIDogbGVuZ3RoKTtcbn07XG4iLCJ2YXIgYmluZCA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9iaW5kLWNvbnRleHQnKTtcbnZhciBJbmRleGVkT2JqZWN0ID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2luZGV4ZWQtb2JqZWN0Jyk7XG52YXIgdG9PYmplY3QgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvdG8tb2JqZWN0Jyk7XG52YXIgdG9MZW5ndGggPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvdG8tbGVuZ3RoJyk7XG52YXIgYXJyYXlTcGVjaWVzQ3JlYXRlID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2FycmF5LXNwZWNpZXMtY3JlYXRlJyk7XG5cbnZhciBwdXNoID0gW10ucHVzaDtcblxuLy8gYEFycmF5LnByb3RvdHlwZS57IGZvckVhY2gsIG1hcCwgZmlsdGVyLCBzb21lLCBldmVyeSwgZmluZCwgZmluZEluZGV4IH1gIG1ldGhvZHMgaW1wbGVtZW50YXRpb25cbnZhciBjcmVhdGVNZXRob2QgPSBmdW5jdGlvbiAoVFlQRSkge1xuICB2YXIgSVNfTUFQID0gVFlQRSA9PSAxO1xuICB2YXIgSVNfRklMVEVSID0gVFlQRSA9PSAyO1xuICB2YXIgSVNfU09NRSA9IFRZUEUgPT0gMztcbiAgdmFyIElTX0VWRVJZID0gVFlQRSA9PSA0O1xuICB2YXIgSVNfRklORF9JTkRFWCA9IFRZUEUgPT0gNjtcbiAgdmFyIE5PX0hPTEVTID0gVFlQRSA9PSA1IHx8IElTX0ZJTkRfSU5ERVg7XG4gIHJldHVybiBmdW5jdGlvbiAoJHRoaXMsIGNhbGxiYWNrZm4sIHRoYXQsIHNwZWNpZmljQ3JlYXRlKSB7XG4gICAgdmFyIE8gPSB0b09iamVjdCgkdGhpcyk7XG4gICAgdmFyIHNlbGYgPSBJbmRleGVkT2JqZWN0KE8pO1xuICAgIHZhciBib3VuZEZ1bmN0aW9uID0gYmluZChjYWxsYmFja2ZuLCB0aGF0LCAzKTtcbiAgICB2YXIgbGVuZ3RoID0gdG9MZW5ndGgoc2VsZi5sZW5ndGgpO1xuICAgIHZhciBpbmRleCA9IDA7XG4gICAgdmFyIGNyZWF0ZSA9IHNwZWNpZmljQ3JlYXRlIHx8IGFycmF5U3BlY2llc0NyZWF0ZTtcbiAgICB2YXIgdGFyZ2V0ID0gSVNfTUFQID8gY3JlYXRlKCR0aGlzLCBsZW5ndGgpIDogSVNfRklMVEVSID8gY3JlYXRlKCR0aGlzLCAwKSA6IHVuZGVmaW5lZDtcbiAgICB2YXIgdmFsdWUsIHJlc3VsdDtcbiAgICBmb3IgKDtsZW5ndGggPiBpbmRleDsgaW5kZXgrKykgaWYgKE5PX0hPTEVTIHx8IGluZGV4IGluIHNlbGYpIHtcbiAgICAgIHZhbHVlID0gc2VsZltpbmRleF07XG4gICAgICByZXN1bHQgPSBib3VuZEZ1bmN0aW9uKHZhbHVlLCBpbmRleCwgTyk7XG4gICAgICBpZiAoVFlQRSkge1xuICAgICAgICBpZiAoSVNfTUFQKSB0YXJnZXRbaW5kZXhdID0gcmVzdWx0OyAvLyBtYXBcbiAgICAgICAgZWxzZSBpZiAocmVzdWx0KSBzd2l0Y2ggKFRZUEUpIHtcbiAgICAgICAgICBjYXNlIDM6IHJldHVybiB0cnVlOyAgICAgICAgICAgICAgLy8gc29tZVxuICAgICAgICAgIGNhc2UgNTogcmV0dXJuIHZhbHVlOyAgICAgICAgICAgICAvLyBmaW5kXG4gICAgICAgICAgY2FzZSA2OiByZXR1cm4gaW5kZXg7ICAgICAgICAgICAgIC8vIGZpbmRJbmRleFxuICAgICAgICAgIGNhc2UgMjogcHVzaC5jYWxsKHRhcmdldCwgdmFsdWUpOyAvLyBmaWx0ZXJcbiAgICAgICAgfSBlbHNlIGlmIChJU19FVkVSWSkgcmV0dXJuIGZhbHNlOyAgLy8gZXZlcnlcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIElTX0ZJTkRfSU5ERVggPyAtMSA6IElTX1NPTUUgfHwgSVNfRVZFUlkgPyBJU19FVkVSWSA6IHRhcmdldDtcbiAgfTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICAvLyBgQXJyYXkucHJvdG90eXBlLmZvckVhY2hgIG1ldGhvZFxuICAvLyBodHRwczovL3RjMzkuZ2l0aHViLmlvL2VjbWEyNjIvI3NlYy1hcnJheS5wcm90b3R5cGUuZm9yZWFjaFxuICBmb3JFYWNoOiBjcmVhdGVNZXRob2QoMCksXG4gIC8vIGBBcnJheS5wcm90b3R5cGUubWFwYCBtZXRob2RcbiAgLy8gaHR0cHM6Ly90YzM5LmdpdGh1Yi5pby9lY21hMjYyLyNzZWMtYXJyYXkucHJvdG90eXBlLm1hcFxuICBtYXA6IGNyZWF0ZU1ldGhvZCgxKSxcbiAgLy8gYEFycmF5LnByb3RvdHlwZS5maWx0ZXJgIG1ldGhvZFxuICAvLyBodHRwczovL3RjMzkuZ2l0aHViLmlvL2VjbWEyNjIvI3NlYy1hcnJheS5wcm90b3R5cGUuZmlsdGVyXG4gIGZpbHRlcjogY3JlYXRlTWV0aG9kKDIpLFxuICAvLyBgQXJyYXkucHJvdG90eXBlLnNvbWVgIG1ldGhvZFxuICAvLyBodHRwczovL3RjMzkuZ2l0aHViLmlvL2VjbWEyNjIvI3NlYy1hcnJheS5wcm90b3R5cGUuc29tZVxuICBzb21lOiBjcmVhdGVNZXRob2QoMyksXG4gIC8vIGBBcnJheS5wcm90b3R5cGUuZXZlcnlgIG1ldGhvZFxuICAvLyBodHRwczovL3RjMzkuZ2l0aHViLmlvL2VjbWEyNjIvI3NlYy1hcnJheS5wcm90b3R5cGUuZXZlcnlcbiAgZXZlcnk6IGNyZWF0ZU1ldGhvZCg0KSxcbiAgLy8gYEFycmF5LnByb3RvdHlwZS5maW5kYCBtZXRob2RcbiAgLy8gaHR0cHM6Ly90YzM5LmdpdGh1Yi5pby9lY21hMjYyLyNzZWMtYXJyYXkucHJvdG90eXBlLmZpbmRcbiAgZmluZDogY3JlYXRlTWV0aG9kKDUpLFxuICAvLyBgQXJyYXkucHJvdG90eXBlLmZpbmRJbmRleGAgbWV0aG9kXG4gIC8vIGh0dHBzOi8vdGMzOS5naXRodWIuaW8vZWNtYTI2Mi8jc2VjLWFycmF5LnByb3RvdHlwZS5maW5kSW5kZXhcbiAgZmluZEluZGV4OiBjcmVhdGVNZXRob2QoNilcbn07XG4iLCIndXNlIHN0cmljdCc7XG52YXIgZmFpbHMgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvZmFpbHMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoTUVUSE9EX05BTUUsIGFyZ3VtZW50KSB7XG4gIHZhciBtZXRob2QgPSBbXVtNRVRIT0RfTkFNRV07XG4gIHJldHVybiAhbWV0aG9kIHx8ICFmYWlscyhmdW5jdGlvbiAoKSB7XG4gICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLXVzZWxlc3MtY2FsbCxuby10aHJvdy1saXRlcmFsXG4gICAgbWV0aG9kLmNhbGwobnVsbCwgYXJndW1lbnQgfHwgZnVuY3Rpb24gKCkgeyB0aHJvdyAxOyB9LCAxKTtcbiAgfSk7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xudmFyICRmb3JFYWNoID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2FycmF5LWl0ZXJhdGlvbicpLmZvckVhY2g7XG52YXIgc2xvcHB5QXJyYXlNZXRob2QgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvc2xvcHB5LWFycmF5LW1ldGhvZCcpO1xuXG4vLyBgQXJyYXkucHJvdG90eXBlLmZvckVhY2hgIG1ldGhvZCBpbXBsZW1lbnRhdGlvblxuLy8gaHR0cHM6Ly90YzM5LmdpdGh1Yi5pby9lY21hMjYyLyNzZWMtYXJyYXkucHJvdG90eXBlLmZvcmVhY2hcbm1vZHVsZS5leHBvcnRzID0gc2xvcHB5QXJyYXlNZXRob2QoJ2ZvckVhY2gnKSA/IGZ1bmN0aW9uIGZvckVhY2goY2FsbGJhY2tmbiAvKiAsIHRoaXNBcmcgKi8pIHtcbiAgcmV0dXJuICRmb3JFYWNoKHRoaXMsIGNhbGxiYWNrZm4sIGFyZ3VtZW50cy5sZW5ndGggPiAxID8gYXJndW1lbnRzWzFdIDogdW5kZWZpbmVkKTtcbn0gOiBbXS5mb3JFYWNoO1xuIiwiJ3VzZSBzdHJpY3QnO1xudmFyICQgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvZXhwb3J0Jyk7XG52YXIgZm9yRWFjaCA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9hcnJheS1mb3ItZWFjaCcpO1xuXG4vLyBgQXJyYXkucHJvdG90eXBlLmZvckVhY2hgIG1ldGhvZFxuLy8gaHR0cHM6Ly90YzM5LmdpdGh1Yi5pby9lY21hMjYyLyNzZWMtYXJyYXkucHJvdG90eXBlLmZvcmVhY2hcbiQoeyB0YXJnZXQ6ICdBcnJheScsIHByb3RvOiB0cnVlLCBmb3JjZWQ6IFtdLmZvckVhY2ggIT0gZm9yRWFjaCB9LCB7XG4gIGZvckVhY2g6IGZvckVhY2hcbn0pO1xuIiwiLy8gaXRlcmFibGUgRE9NIGNvbGxlY3Rpb25zXG4vLyBmbGFnIC0gYGl0ZXJhYmxlYCBpbnRlcmZhY2UgLSAnZW50cmllcycsICdrZXlzJywgJ3ZhbHVlcycsICdmb3JFYWNoJyBtZXRob2RzXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgQ1NTUnVsZUxpc3Q6IDAsXG4gIENTU1N0eWxlRGVjbGFyYXRpb246IDAsXG4gIENTU1ZhbHVlTGlzdDogMCxcbiAgQ2xpZW50UmVjdExpc3Q6IDAsXG4gIERPTVJlY3RMaXN0OiAwLFxuICBET01TdHJpbmdMaXN0OiAwLFxuICBET01Ub2tlbkxpc3Q6IDEsXG4gIERhdGFUcmFuc2Zlckl0ZW1MaXN0OiAwLFxuICBGaWxlTGlzdDogMCxcbiAgSFRNTEFsbENvbGxlY3Rpb246IDAsXG4gIEhUTUxDb2xsZWN0aW9uOiAwLFxuICBIVE1MRm9ybUVsZW1lbnQ6IDAsXG4gIEhUTUxTZWxlY3RFbGVtZW50OiAwLFxuICBNZWRpYUxpc3Q6IDAsXG4gIE1pbWVUeXBlQXJyYXk6IDAsXG4gIE5hbWVkTm9kZU1hcDogMCxcbiAgTm9kZUxpc3Q6IDEsXG4gIFBhaW50UmVxdWVzdExpc3Q6IDAsXG4gIFBsdWdpbjogMCxcbiAgUGx1Z2luQXJyYXk6IDAsXG4gIFNWR0xlbmd0aExpc3Q6IDAsXG4gIFNWR051bWJlckxpc3Q6IDAsXG4gIFNWR1BhdGhTZWdMaXN0OiAwLFxuICBTVkdQb2ludExpc3Q6IDAsXG4gIFNWR1N0cmluZ0xpc3Q6IDAsXG4gIFNWR1RyYW5zZm9ybUxpc3Q6IDAsXG4gIFNvdXJjZUJ1ZmZlckxpc3Q6IDAsXG4gIFN0eWxlU2hlZXRMaXN0OiAwLFxuICBUZXh0VHJhY2tDdWVMaXN0OiAwLFxuICBUZXh0VHJhY2tMaXN0OiAwLFxuICBUb3VjaExpc3Q6IDBcbn07XG4iLCJ2YXIgZ2xvYmFsID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2dsb2JhbCcpO1xudmFyIERPTUl0ZXJhYmxlcyA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9kb20taXRlcmFibGVzJyk7XG52YXIgZm9yRWFjaCA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9hcnJheS1mb3ItZWFjaCcpO1xudmFyIGNyZWF0ZU5vbkVudW1lcmFibGVQcm9wZXJ0eSA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9jcmVhdGUtbm9uLWVudW1lcmFibGUtcHJvcGVydHknKTtcblxuZm9yICh2YXIgQ09MTEVDVElPTl9OQU1FIGluIERPTUl0ZXJhYmxlcykge1xuICB2YXIgQ29sbGVjdGlvbiA9IGdsb2JhbFtDT0xMRUNUSU9OX05BTUVdO1xuICB2YXIgQ29sbGVjdGlvblByb3RvdHlwZSA9IENvbGxlY3Rpb24gJiYgQ29sbGVjdGlvbi5wcm90b3R5cGU7XG4gIC8vIHNvbWUgQ2hyb21lIHZlcnNpb25zIGhhdmUgbm9uLWNvbmZpZ3VyYWJsZSBtZXRob2RzIG9uIERPTVRva2VuTGlzdFxuICBpZiAoQ29sbGVjdGlvblByb3RvdHlwZSAmJiBDb2xsZWN0aW9uUHJvdG90eXBlLmZvckVhY2ggIT09IGZvckVhY2gpIHRyeSB7XG4gICAgY3JlYXRlTm9uRW51bWVyYWJsZVByb3BlcnR5KENvbGxlY3Rpb25Qcm90b3R5cGUsICdmb3JFYWNoJywgZm9yRWFjaCk7XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgQ29sbGVjdGlvblByb3RvdHlwZS5mb3JFYWNoID0gZm9yRWFjaDtcbiAgfVxufVxuIiwiLyohIG5wbS5pbS9vYmplY3QtZml0LWltYWdlcyAzLjIuNCAqL1xuJ3VzZSBzdHJpY3QnO1xuXG52YXIgT0ZJID0gJ2JmcmVkLWl0Om9iamVjdC1maXQtaW1hZ2VzJztcbnZhciBwcm9wUmVnZXggPSAvKG9iamVjdC1maXR8b2JqZWN0LXBvc2l0aW9uKVxccyo6XFxzKihbLS5cXHdcXHMlXSspL2c7XG52YXIgdGVzdEltZyA9IHR5cGVvZiBJbWFnZSA9PT0gJ3VuZGVmaW5lZCcgPyB7c3R5bGU6IHsnb2JqZWN0LXBvc2l0aW9uJzogMX19IDogbmV3IEltYWdlKCk7XG52YXIgc3VwcG9ydHNPYmplY3RGaXQgPSAnb2JqZWN0LWZpdCcgaW4gdGVzdEltZy5zdHlsZTtcbnZhciBzdXBwb3J0c09iamVjdFBvc2l0aW9uID0gJ29iamVjdC1wb3NpdGlvbicgaW4gdGVzdEltZy5zdHlsZTtcbnZhciBzdXBwb3J0c09GSSA9ICdiYWNrZ3JvdW5kLXNpemUnIGluIHRlc3RJbWcuc3R5bGU7XG52YXIgc3VwcG9ydHNDdXJyZW50U3JjID0gdHlwZW9mIHRlc3RJbWcuY3VycmVudFNyYyA9PT0gJ3N0cmluZyc7XG52YXIgbmF0aXZlR2V0QXR0cmlidXRlID0gdGVzdEltZy5nZXRBdHRyaWJ1dGU7XG52YXIgbmF0aXZlU2V0QXR0cmlidXRlID0gdGVzdEltZy5zZXRBdHRyaWJ1dGU7XG52YXIgYXV0b01vZGVFbmFibGVkID0gZmFsc2U7XG5cbmZ1bmN0aW9uIGNyZWF0ZVBsYWNlaG9sZGVyKHcsIGgpIHtcblx0cmV0dXJuIChcImRhdGE6aW1hZ2Uvc3ZnK3htbCwlM0NzdmcgeG1sbnM9J2h0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnJyB3aWR0aD0nXCIgKyB3ICsgXCInIGhlaWdodD0nXCIgKyBoICsgXCInJTNFJTNDL3N2ZyUzRVwiKTtcbn1cblxuZnVuY3Rpb24gcG9seWZpbGxDdXJyZW50U3JjKGVsKSB7XG5cdGlmIChlbC5zcmNzZXQgJiYgIXN1cHBvcnRzQ3VycmVudFNyYyAmJiB3aW5kb3cucGljdHVyZWZpbGwpIHtcblx0XHR2YXIgcGYgPSB3aW5kb3cucGljdHVyZWZpbGwuXztcblx0XHQvLyBwYXJzZSBzcmNzZXQgd2l0aCBwaWN0dXJlZmlsbCB3aGVyZSBjdXJyZW50U3JjIGlzbid0IGF2YWlsYWJsZVxuXHRcdGlmICghZWxbcGYubnNdIHx8ICFlbFtwZi5uc10uZXZhbGVkKSB7XG5cdFx0XHQvLyBmb3JjZSBzeW5jaHJvbm91cyBzcmNzZXQgcGFyc2luZ1xuXHRcdFx0cGYuZmlsbEltZyhlbCwge3Jlc2VsZWN0OiB0cnVlfSk7XG5cdFx0fVxuXG5cdFx0aWYgKCFlbFtwZi5uc10uY3VyU3JjKSB7XG5cdFx0XHQvLyBmb3JjZSBwaWN0dXJlZmlsbCB0byBwYXJzZSBzcmNzZXRcblx0XHRcdGVsW3BmLm5zXS5zdXBwb3J0ZWQgPSBmYWxzZTtcblx0XHRcdHBmLmZpbGxJbWcoZWwsIHtyZXNlbGVjdDogdHJ1ZX0pO1xuXHRcdH1cblxuXHRcdC8vIHJldHJpZXZlIHBhcnNlZCBjdXJyZW50U3JjLCBpZiBhbnlcblx0XHRlbC5jdXJyZW50U3JjID0gZWxbcGYubnNdLmN1clNyYyB8fCBlbC5zcmM7XG5cdH1cbn1cblxuZnVuY3Rpb24gZ2V0U3R5bGUoZWwpIHtcblx0dmFyIHN0eWxlID0gZ2V0Q29tcHV0ZWRTdHlsZShlbCkuZm9udEZhbWlseTtcblx0dmFyIHBhcnNlZDtcblx0dmFyIHByb3BzID0ge307XG5cdHdoaWxlICgocGFyc2VkID0gcHJvcFJlZ2V4LmV4ZWMoc3R5bGUpKSAhPT0gbnVsbCkge1xuXHRcdHByb3BzW3BhcnNlZFsxXV0gPSBwYXJzZWRbMl07XG5cdH1cblx0cmV0dXJuIHByb3BzO1xufVxuXG5mdW5jdGlvbiBzZXRQbGFjZWhvbGRlcihpbWcsIHdpZHRoLCBoZWlnaHQpIHtcblx0Ly8gRGVmYXVsdDogZmlsbCB3aWR0aCwgbm8gaGVpZ2h0XG5cdHZhciBwbGFjZWhvbGRlciA9IGNyZWF0ZVBsYWNlaG9sZGVyKHdpZHRoIHx8IDEsIGhlaWdodCB8fCAwKTtcblxuXHQvLyBPbmx5IHNldCBwbGFjZWhvbGRlciBpZiBpdCdzIGRpZmZlcmVudFxuXHRpZiAobmF0aXZlR2V0QXR0cmlidXRlLmNhbGwoaW1nLCAnc3JjJykgIT09IHBsYWNlaG9sZGVyKSB7XG5cdFx0bmF0aXZlU2V0QXR0cmlidXRlLmNhbGwoaW1nLCAnc3JjJywgcGxhY2Vob2xkZXIpO1xuXHR9XG59XG5cbmZ1bmN0aW9uIG9uSW1hZ2VSZWFkeShpbWcsIGNhbGxiYWNrKSB7XG5cdC8vIG5hdHVyYWxXaWR0aCBpcyBvbmx5IGF2YWlsYWJsZSB3aGVuIHRoZSBpbWFnZSBoZWFkZXJzIGFyZSBsb2FkZWQsXG5cdC8vIHRoaXMgbG9vcCB3aWxsIHBvbGwgaXQgZXZlcnkgMTAwbXMuXG5cdGlmIChpbWcubmF0dXJhbFdpZHRoKSB7XG5cdFx0Y2FsbGJhY2soaW1nKTtcblx0fSBlbHNlIHtcblx0XHRzZXRUaW1lb3V0KG9uSW1hZ2VSZWFkeSwgMTAwLCBpbWcsIGNhbGxiYWNrKTtcblx0fVxufVxuXG5mdW5jdGlvbiBmaXhPbmUoZWwpIHtcblx0dmFyIHN0eWxlID0gZ2V0U3R5bGUoZWwpO1xuXHR2YXIgb2ZpID0gZWxbT0ZJXTtcblx0c3R5bGVbJ29iamVjdC1maXQnXSA9IHN0eWxlWydvYmplY3QtZml0J10gfHwgJ2ZpbGwnOyAvLyBkZWZhdWx0IHZhbHVlXG5cblx0Ly8gQXZvaWQgcnVubmluZyB3aGVyZSB1bm5lY2Vzc2FyeSwgdW5sZXNzIE9GSSBoYWQgYWxyZWFkeSBkb25lIGl0cyBkZWVkXG5cdGlmICghb2ZpLmltZykge1xuXHRcdC8vIGZpbGwgaXMgdGhlIGRlZmF1bHQgYmVoYXZpb3Igc28gbm8gYWN0aW9uIGlzIG5lY2Vzc2FyeVxuXHRcdGlmIChzdHlsZVsnb2JqZWN0LWZpdCddID09PSAnZmlsbCcpIHtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHQvLyBXaGVyZSBvYmplY3QtZml0IGlzIHN1cHBvcnRlZCBhbmQgb2JqZWN0LXBvc2l0aW9uIGlzbid0IChTYWZhcmkgPCAxMClcblx0XHRpZiAoXG5cdFx0XHQhb2ZpLnNraXBUZXN0ICYmIC8vIHVubGVzcyB1c2VyIHdhbnRzIHRvIGFwcGx5IHJlZ2FyZGxlc3Mgb2YgYnJvd3NlciBzdXBwb3J0XG5cdFx0XHRzdXBwb3J0c09iamVjdEZpdCAmJiAvLyBpZiBicm93c2VyIGFscmVhZHkgc3VwcG9ydHMgb2JqZWN0LWZpdFxuXHRcdFx0IXN0eWxlWydvYmplY3QtcG9zaXRpb24nXSAvLyB1bmxlc3Mgb2JqZWN0LXBvc2l0aW9uIGlzIHVzZWRcblx0XHQpIHtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cdH1cblxuXHQvLyBrZWVwIGEgY2xvbmUgaW4gbWVtb3J5IHdoaWxlIHJlc2V0dGluZyB0aGUgb3JpZ2luYWwgdG8gYSBibGFua1xuXHRpZiAoIW9maS5pbWcpIHtcblx0XHRvZmkuaW1nID0gbmV3IEltYWdlKGVsLndpZHRoLCBlbC5oZWlnaHQpO1xuXHRcdG9maS5pbWcuc3Jjc2V0ID0gbmF0aXZlR2V0QXR0cmlidXRlLmNhbGwoZWwsIFwiZGF0YS1vZmktc3Jjc2V0XCIpIHx8IGVsLnNyY3NldDtcblx0XHRvZmkuaW1nLnNyYyA9IG5hdGl2ZUdldEF0dHJpYnV0ZS5jYWxsKGVsLCBcImRhdGEtb2ZpLXNyY1wiKSB8fCBlbC5zcmM7XG5cblx0XHQvLyBwcmVzZXJ2ZSBmb3IgYW55IGZ1dHVyZSBjbG9uZU5vZGUgY2FsbHNcblx0XHQvLyBodHRwczovL2dpdGh1Yi5jb20vYmZyZWQtaXQvb2JqZWN0LWZpdC1pbWFnZXMvaXNzdWVzLzUzXG5cdFx0bmF0aXZlU2V0QXR0cmlidXRlLmNhbGwoZWwsIFwiZGF0YS1vZmktc3JjXCIsIGVsLnNyYyk7XG5cdFx0aWYgKGVsLnNyY3NldCkge1xuXHRcdFx0bmF0aXZlU2V0QXR0cmlidXRlLmNhbGwoZWwsIFwiZGF0YS1vZmktc3Jjc2V0XCIsIGVsLnNyY3NldCk7XG5cdFx0fVxuXG5cdFx0c2V0UGxhY2Vob2xkZXIoZWwsIGVsLm5hdHVyYWxXaWR0aCB8fCBlbC53aWR0aCwgZWwubmF0dXJhbEhlaWdodCB8fCBlbC5oZWlnaHQpO1xuXG5cdFx0Ly8gcmVtb3ZlIHNyY3NldCBiZWNhdXNlIGl0IG92ZXJyaWRlcyBzcmNcblx0XHRpZiAoZWwuc3Jjc2V0KSB7XG5cdFx0XHRlbC5zcmNzZXQgPSAnJztcblx0XHR9XG5cdFx0dHJ5IHtcblx0XHRcdGtlZXBTcmNVc2FibGUoZWwpO1xuXHRcdH0gY2F0Y2ggKGVycikge1xuXHRcdFx0aWYgKHdpbmRvdy5jb25zb2xlKSB7XG5cdFx0XHRcdGNvbnNvbGUud2FybignaHR0cHM6Ly9iaXQubHkvb2ZpLW9sZC1icm93c2VyJyk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cblx0cG9seWZpbGxDdXJyZW50U3JjKG9maS5pbWcpO1xuXG5cdGVsLnN0eWxlLmJhY2tncm91bmRJbWFnZSA9IFwidXJsKFxcXCJcIiArICgob2ZpLmltZy5jdXJyZW50U3JjIHx8IG9maS5pbWcuc3JjKS5yZXBsYWNlKC9cIi9nLCAnXFxcXFwiJykpICsgXCJcXFwiKVwiO1xuXHRlbC5zdHlsZS5iYWNrZ3JvdW5kUG9zaXRpb24gPSBzdHlsZVsnb2JqZWN0LXBvc2l0aW9uJ10gfHwgJ2NlbnRlcic7XG5cdGVsLnN0eWxlLmJhY2tncm91bmRSZXBlYXQgPSAnbm8tcmVwZWF0Jztcblx0ZWwuc3R5bGUuYmFja2dyb3VuZE9yaWdpbiA9ICdjb250ZW50LWJveCc7XG5cblx0aWYgKC9zY2FsZS1kb3duLy50ZXN0KHN0eWxlWydvYmplY3QtZml0J10pKSB7XG5cdFx0b25JbWFnZVJlYWR5KG9maS5pbWcsIGZ1bmN0aW9uICgpIHtcblx0XHRcdGlmIChvZmkuaW1nLm5hdHVyYWxXaWR0aCA+IGVsLndpZHRoIHx8IG9maS5pbWcubmF0dXJhbEhlaWdodCA+IGVsLmhlaWdodCkge1xuXHRcdFx0XHRlbC5zdHlsZS5iYWNrZ3JvdW5kU2l6ZSA9ICdjb250YWluJztcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdGVsLnN0eWxlLmJhY2tncm91bmRTaXplID0gJ2F1dG8nO1xuXHRcdFx0fVxuXHRcdH0pO1xuXHR9IGVsc2Uge1xuXHRcdGVsLnN0eWxlLmJhY2tncm91bmRTaXplID0gc3R5bGVbJ29iamVjdC1maXQnXS5yZXBsYWNlKCdub25lJywgJ2F1dG8nKS5yZXBsYWNlKCdmaWxsJywgJzEwMCUgMTAwJScpO1xuXHR9XG5cblx0b25JbWFnZVJlYWR5KG9maS5pbWcsIGZ1bmN0aW9uIChpbWcpIHtcblx0XHRzZXRQbGFjZWhvbGRlcihlbCwgaW1nLm5hdHVyYWxXaWR0aCwgaW1nLm5hdHVyYWxIZWlnaHQpO1xuXHR9KTtcbn1cblxuZnVuY3Rpb24ga2VlcFNyY1VzYWJsZShlbCkge1xuXHR2YXIgZGVzY3JpcHRvcnMgPSB7XG5cdFx0Z2V0OiBmdW5jdGlvbiBnZXQocHJvcCkge1xuXHRcdFx0cmV0dXJuIGVsW09GSV0uaW1nW3Byb3AgPyBwcm9wIDogJ3NyYyddO1xuXHRcdH0sXG5cdFx0c2V0OiBmdW5jdGlvbiBzZXQodmFsdWUsIHByb3ApIHtcblx0XHRcdGVsW09GSV0uaW1nW3Byb3AgPyBwcm9wIDogJ3NyYyddID0gdmFsdWU7XG5cdFx0XHRuYXRpdmVTZXRBdHRyaWJ1dGUuY2FsbChlbCwgKFwiZGF0YS1vZmktXCIgKyBwcm9wKSwgdmFsdWUpOyAvLyBwcmVzZXJ2ZSBmb3IgYW55IGZ1dHVyZSBjbG9uZU5vZGVcblx0XHRcdGZpeE9uZShlbCk7XG5cdFx0XHRyZXR1cm4gdmFsdWU7XG5cdFx0fVxuXHR9O1xuXHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZWwsICdzcmMnLCBkZXNjcmlwdG9ycyk7XG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShlbCwgJ2N1cnJlbnRTcmMnLCB7XG5cdFx0Z2V0OiBmdW5jdGlvbiAoKSB7IHJldHVybiBkZXNjcmlwdG9ycy5nZXQoJ2N1cnJlbnRTcmMnKTsgfVxuXHR9KTtcblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGVsLCAnc3Jjc2V0Jywge1xuXHRcdGdldDogZnVuY3Rpb24gKCkgeyByZXR1cm4gZGVzY3JpcHRvcnMuZ2V0KCdzcmNzZXQnKTsgfSxcblx0XHRzZXQ6IGZ1bmN0aW9uIChzcykgeyByZXR1cm4gZGVzY3JpcHRvcnMuc2V0KHNzLCAnc3Jjc2V0Jyk7IH1cblx0fSk7XG59XG5cbmZ1bmN0aW9uIGhpamFja0F0dHJpYnV0ZXMoKSB7XG5cdGZ1bmN0aW9uIGdldE9maUltYWdlTWF5YmUoZWwsIG5hbWUpIHtcblx0XHRyZXR1cm4gZWxbT0ZJXSAmJiBlbFtPRkldLmltZyAmJiAobmFtZSA9PT0gJ3NyYycgfHwgbmFtZSA9PT0gJ3NyY3NldCcpID8gZWxbT0ZJXS5pbWcgOiBlbDtcblx0fVxuXHRpZiAoIXN1cHBvcnRzT2JqZWN0UG9zaXRpb24pIHtcblx0XHRIVE1MSW1hZ2VFbGVtZW50LnByb3RvdHlwZS5nZXRBdHRyaWJ1dGUgPSBmdW5jdGlvbiAobmFtZSkge1xuXHRcdFx0cmV0dXJuIG5hdGl2ZUdldEF0dHJpYnV0ZS5jYWxsKGdldE9maUltYWdlTWF5YmUodGhpcywgbmFtZSksIG5hbWUpO1xuXHRcdH07XG5cblx0XHRIVE1MSW1hZ2VFbGVtZW50LnByb3RvdHlwZS5zZXRBdHRyaWJ1dGUgPSBmdW5jdGlvbiAobmFtZSwgdmFsdWUpIHtcblx0XHRcdHJldHVybiBuYXRpdmVTZXRBdHRyaWJ1dGUuY2FsbChnZXRPZmlJbWFnZU1heWJlKHRoaXMsIG5hbWUpLCBuYW1lLCBTdHJpbmcodmFsdWUpKTtcblx0XHR9O1xuXHR9XG59XG5cbmZ1bmN0aW9uIGZpeChpbWdzLCBvcHRzKSB7XG5cdHZhciBzdGFydEF1dG9Nb2RlID0gIWF1dG9Nb2RlRW5hYmxlZCAmJiAhaW1ncztcblx0b3B0cyA9IG9wdHMgfHwge307XG5cdGltZ3MgPSBpbWdzIHx8ICdpbWcnO1xuXG5cdGlmICgoc3VwcG9ydHNPYmplY3RQb3NpdGlvbiAmJiAhb3B0cy5za2lwVGVzdCkgfHwgIXN1cHBvcnRzT0ZJKSB7XG5cdFx0cmV0dXJuIGZhbHNlO1xuXHR9XG5cblx0Ly8gdXNlIGltZ3MgYXMgYSBzZWxlY3RvciBvciBqdXN0IHNlbGVjdCBhbGwgaW1hZ2VzXG5cdGlmIChpbWdzID09PSAnaW1nJykge1xuXHRcdGltZ3MgPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnaW1nJyk7XG5cdH0gZWxzZSBpZiAodHlwZW9mIGltZ3MgPT09ICdzdHJpbmcnKSB7XG5cdFx0aW1ncyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoaW1ncyk7XG5cdH0gZWxzZSBpZiAoISgnbGVuZ3RoJyBpbiBpbWdzKSkge1xuXHRcdGltZ3MgPSBbaW1nc107XG5cdH1cblxuXHQvLyBhcHBseSBmaXggdG8gYWxsXG5cdGZvciAodmFyIGkgPSAwOyBpIDwgaW1ncy5sZW5ndGg7IGkrKykge1xuXHRcdGltZ3NbaV1bT0ZJXSA9IGltZ3NbaV1bT0ZJXSB8fCB7XG5cdFx0XHRza2lwVGVzdDogb3B0cy5za2lwVGVzdFxuXHRcdH07XG5cdFx0Zml4T25lKGltZ3NbaV0pO1xuXHR9XG5cblx0aWYgKHN0YXJ0QXV0b01vZGUpIHtcblx0XHRkb2N1bWVudC5ib2R5LmFkZEV2ZW50TGlzdGVuZXIoJ2xvYWQnLCBmdW5jdGlvbiAoZSkge1xuXHRcdFx0aWYgKGUudGFyZ2V0LnRhZ05hbWUgPT09ICdJTUcnKSB7XG5cdFx0XHRcdGZpeChlLnRhcmdldCwge1xuXHRcdFx0XHRcdHNraXBUZXN0OiBvcHRzLnNraXBUZXN0XG5cdFx0XHRcdH0pO1xuXHRcdFx0fVxuXHRcdH0sIHRydWUpO1xuXHRcdGF1dG9Nb2RlRW5hYmxlZCA9IHRydWU7XG5cdFx0aW1ncyA9ICdpbWcnOyAvLyByZXNldCB0byBhIGdlbmVyaWMgc2VsZWN0b3IgZm9yIHdhdGNoTVFcblx0fVxuXG5cdC8vIGlmIHJlcXVlc3RlZCwgd2F0Y2ggbWVkaWEgcXVlcmllcyBmb3Igb2JqZWN0LWZpdCBjaGFuZ2Vcblx0aWYgKG9wdHMud2F0Y2hNUSkge1xuXHRcdHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdyZXNpemUnLCBmaXguYmluZChudWxsLCBpbWdzLCB7XG5cdFx0XHRza2lwVGVzdDogb3B0cy5za2lwVGVzdFxuXHRcdH0pKTtcblx0fVxufVxuXG5maXguc3VwcG9ydHNPYmplY3RGaXQgPSBzdXBwb3J0c09iamVjdEZpdDtcbmZpeC5zdXBwb3J0c09iamVjdFBvc2l0aW9uID0gc3VwcG9ydHNPYmplY3RQb3NpdGlvbjtcblxuaGlqYWNrQXR0cmlidXRlcygpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZpeDtcbiIsIi8qKlxuICogRXZFbWl0dGVyIHYxLjEuMFxuICogTGlsJyBldmVudCBlbWl0dGVyXG4gKiBNSVQgTGljZW5zZVxuICovXG5cbi8qIGpzaGludCB1bnVzZWQ6IHRydWUsIHVuZGVmOiB0cnVlLCBzdHJpY3Q6IHRydWUgKi9cblxuKCBmdW5jdGlvbiggZ2xvYmFsLCBmYWN0b3J5ICkge1xuICAvLyB1bml2ZXJzYWwgbW9kdWxlIGRlZmluaXRpb25cbiAgLyoganNoaW50IHN0cmljdDogZmFsc2UgKi8gLyogZ2xvYmFscyBkZWZpbmUsIG1vZHVsZSwgd2luZG93ICovXG4gIGlmICggdHlwZW9mIGRlZmluZSA9PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQgKSB7XG4gICAgLy8gQU1EIC0gUmVxdWlyZUpTXG4gICAgZGVmaW5lKCBmYWN0b3J5ICk7XG4gIH0gZWxzZSBpZiAoIHR5cGVvZiBtb2R1bGUgPT0gJ29iamVjdCcgJiYgbW9kdWxlLmV4cG9ydHMgKSB7XG4gICAgLy8gQ29tbW9uSlMgLSBCcm93c2VyaWZ5LCBXZWJwYWNrXG4gICAgbW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KCk7XG4gIH0gZWxzZSB7XG4gICAgLy8gQnJvd3NlciBnbG9iYWxzXG4gICAgZ2xvYmFsLkV2RW1pdHRlciA9IGZhY3RvcnkoKTtcbiAgfVxuXG59KCB0eXBlb2Ygd2luZG93ICE9ICd1bmRlZmluZWQnID8gd2luZG93IDogdGhpcywgZnVuY3Rpb24oKSB7XG5cblwidXNlIHN0cmljdFwiO1xuXG5mdW5jdGlvbiBFdkVtaXR0ZXIoKSB7fVxuXG52YXIgcHJvdG8gPSBFdkVtaXR0ZXIucHJvdG90eXBlO1xuXG5wcm90by5vbiA9IGZ1bmN0aW9uKCBldmVudE5hbWUsIGxpc3RlbmVyICkge1xuICBpZiAoICFldmVudE5hbWUgfHwgIWxpc3RlbmVyICkge1xuICAgIHJldHVybjtcbiAgfVxuICAvLyBzZXQgZXZlbnRzIGhhc2hcbiAgdmFyIGV2ZW50cyA9IHRoaXMuX2V2ZW50cyA9IHRoaXMuX2V2ZW50cyB8fCB7fTtcbiAgLy8gc2V0IGxpc3RlbmVycyBhcnJheVxuICB2YXIgbGlzdGVuZXJzID0gZXZlbnRzWyBldmVudE5hbWUgXSA9IGV2ZW50c1sgZXZlbnROYW1lIF0gfHwgW107XG4gIC8vIG9ubHkgYWRkIG9uY2VcbiAgaWYgKCBsaXN0ZW5lcnMuaW5kZXhPZiggbGlzdGVuZXIgKSA9PSAtMSApIHtcbiAgICBsaXN0ZW5lcnMucHVzaCggbGlzdGVuZXIgKTtcbiAgfVxuXG4gIHJldHVybiB0aGlzO1xufTtcblxucHJvdG8ub25jZSA9IGZ1bmN0aW9uKCBldmVudE5hbWUsIGxpc3RlbmVyICkge1xuICBpZiAoICFldmVudE5hbWUgfHwgIWxpc3RlbmVyICkge1xuICAgIHJldHVybjtcbiAgfVxuICAvLyBhZGQgZXZlbnRcbiAgdGhpcy5vbiggZXZlbnROYW1lLCBsaXN0ZW5lciApO1xuICAvLyBzZXQgb25jZSBmbGFnXG4gIC8vIHNldCBvbmNlRXZlbnRzIGhhc2hcbiAgdmFyIG9uY2VFdmVudHMgPSB0aGlzLl9vbmNlRXZlbnRzID0gdGhpcy5fb25jZUV2ZW50cyB8fCB7fTtcbiAgLy8gc2V0IG9uY2VMaXN0ZW5lcnMgb2JqZWN0XG4gIHZhciBvbmNlTGlzdGVuZXJzID0gb25jZUV2ZW50c1sgZXZlbnROYW1lIF0gPSBvbmNlRXZlbnRzWyBldmVudE5hbWUgXSB8fCB7fTtcbiAgLy8gc2V0IGZsYWdcbiAgb25jZUxpc3RlbmVyc1sgbGlzdGVuZXIgXSA9IHRydWU7XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5wcm90by5vZmYgPSBmdW5jdGlvbiggZXZlbnROYW1lLCBsaXN0ZW5lciApIHtcbiAgdmFyIGxpc3RlbmVycyA9IHRoaXMuX2V2ZW50cyAmJiB0aGlzLl9ldmVudHNbIGV2ZW50TmFtZSBdO1xuICBpZiAoICFsaXN0ZW5lcnMgfHwgIWxpc3RlbmVycy5sZW5ndGggKSB7XG4gICAgcmV0dXJuO1xuICB9XG4gIHZhciBpbmRleCA9IGxpc3RlbmVycy5pbmRleE9mKCBsaXN0ZW5lciApO1xuICBpZiAoIGluZGV4ICE9IC0xICkge1xuICAgIGxpc3RlbmVycy5zcGxpY2UoIGluZGV4LCAxICk7XG4gIH1cblxuICByZXR1cm4gdGhpcztcbn07XG5cbnByb3RvLmVtaXRFdmVudCA9IGZ1bmN0aW9uKCBldmVudE5hbWUsIGFyZ3MgKSB7XG4gIHZhciBsaXN0ZW5lcnMgPSB0aGlzLl9ldmVudHMgJiYgdGhpcy5fZXZlbnRzWyBldmVudE5hbWUgXTtcbiAgaWYgKCAhbGlzdGVuZXJzIHx8ICFsaXN0ZW5lcnMubGVuZ3RoICkge1xuICAgIHJldHVybjtcbiAgfVxuICAvLyBjb3B5IG92ZXIgdG8gYXZvaWQgaW50ZXJmZXJlbmNlIGlmIC5vZmYoKSBpbiBsaXN0ZW5lclxuICBsaXN0ZW5lcnMgPSBsaXN0ZW5lcnMuc2xpY2UoMCk7XG4gIGFyZ3MgPSBhcmdzIHx8IFtdO1xuICAvLyBvbmNlIHN0dWZmXG4gIHZhciBvbmNlTGlzdGVuZXJzID0gdGhpcy5fb25jZUV2ZW50cyAmJiB0aGlzLl9vbmNlRXZlbnRzWyBldmVudE5hbWUgXTtcblxuICBmb3IgKCB2YXIgaT0wOyBpIDwgbGlzdGVuZXJzLmxlbmd0aDsgaSsrICkge1xuICAgIHZhciBsaXN0ZW5lciA9IGxpc3RlbmVyc1tpXVxuICAgIHZhciBpc09uY2UgPSBvbmNlTGlzdGVuZXJzICYmIG9uY2VMaXN0ZW5lcnNbIGxpc3RlbmVyIF07XG4gICAgaWYgKCBpc09uY2UgKSB7XG4gICAgICAvLyByZW1vdmUgbGlzdGVuZXJcbiAgICAgIC8vIHJlbW92ZSBiZWZvcmUgdHJpZ2dlciB0byBwcmV2ZW50IHJlY3Vyc2lvblxuICAgICAgdGhpcy5vZmYoIGV2ZW50TmFtZSwgbGlzdGVuZXIgKTtcbiAgICAgIC8vIHVuc2V0IG9uY2UgZmxhZ1xuICAgICAgZGVsZXRlIG9uY2VMaXN0ZW5lcnNbIGxpc3RlbmVyIF07XG4gICAgfVxuICAgIC8vIHRyaWdnZXIgbGlzdGVuZXJcbiAgICBsaXN0ZW5lci5hcHBseSggdGhpcywgYXJncyApO1xuICB9XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5wcm90by5hbGxPZmYgPSBmdW5jdGlvbigpIHtcbiAgZGVsZXRlIHRoaXMuX2V2ZW50cztcbiAgZGVsZXRlIHRoaXMuX29uY2VFdmVudHM7XG59O1xuXG5yZXR1cm4gRXZFbWl0dGVyO1xuXG59KSk7XG4iLCIvKiFcbiAqIGdldFNpemUgdjIuMC4zXG4gKiBtZWFzdXJlIHNpemUgb2YgZWxlbWVudHNcbiAqIE1JVCBsaWNlbnNlXG4gKi9cblxuLyoganNoaW50IGJyb3dzZXI6IHRydWUsIHN0cmljdDogdHJ1ZSwgdW5kZWY6IHRydWUsIHVudXNlZDogdHJ1ZSAqL1xuLyogZ2xvYmFscyBjb25zb2xlOiBmYWxzZSAqL1xuXG4oIGZ1bmN0aW9uKCB3aW5kb3csIGZhY3RvcnkgKSB7XG4gIC8qIGpzaGludCBzdHJpY3Q6IGZhbHNlICovIC8qIGdsb2JhbHMgZGVmaW5lLCBtb2R1bGUgKi9cbiAgaWYgKCB0eXBlb2YgZGVmaW5lID09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCApIHtcbiAgICAvLyBBTURcbiAgICBkZWZpbmUoIGZhY3RvcnkgKTtcbiAgfSBlbHNlIGlmICggdHlwZW9mIG1vZHVsZSA9PSAnb2JqZWN0JyAmJiBtb2R1bGUuZXhwb3J0cyApIHtcbiAgICAvLyBDb21tb25KU1xuICAgIG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeSgpO1xuICB9IGVsc2Uge1xuICAgIC8vIGJyb3dzZXIgZ2xvYmFsXG4gICAgd2luZG93LmdldFNpemUgPSBmYWN0b3J5KCk7XG4gIH1cblxufSkoIHdpbmRvdywgZnVuY3Rpb24gZmFjdG9yeSgpIHtcbid1c2Ugc3RyaWN0JztcblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gaGVscGVycyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSAvL1xuXG4vLyBnZXQgYSBudW1iZXIgZnJvbSBhIHN0cmluZywgbm90IGEgcGVyY2VudGFnZVxuZnVuY3Rpb24gZ2V0U3R5bGVTaXplKCB2YWx1ZSApIHtcbiAgdmFyIG51bSA9IHBhcnNlRmxvYXQoIHZhbHVlICk7XG4gIC8vIG5vdCBhIHBlcmNlbnQgbGlrZSAnMTAwJScsIGFuZCBhIG51bWJlclxuICB2YXIgaXNWYWxpZCA9IHZhbHVlLmluZGV4T2YoJyUnKSA9PSAtMSAmJiAhaXNOYU4oIG51bSApO1xuICByZXR1cm4gaXNWYWxpZCAmJiBudW07XG59XG5cbmZ1bmN0aW9uIG5vb3AoKSB7fVxuXG52YXIgbG9nRXJyb3IgPSB0eXBlb2YgY29uc29sZSA9PSAndW5kZWZpbmVkJyA/IG5vb3AgOlxuICBmdW5jdGlvbiggbWVzc2FnZSApIHtcbiAgICBjb25zb2xlLmVycm9yKCBtZXNzYWdlICk7XG4gIH07XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIG1lYXN1cmVtZW50cyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSAvL1xuXG52YXIgbWVhc3VyZW1lbnRzID0gW1xuICAncGFkZGluZ0xlZnQnLFxuICAncGFkZGluZ1JpZ2h0JyxcbiAgJ3BhZGRpbmdUb3AnLFxuICAncGFkZGluZ0JvdHRvbScsXG4gICdtYXJnaW5MZWZ0JyxcbiAgJ21hcmdpblJpZ2h0JyxcbiAgJ21hcmdpblRvcCcsXG4gICdtYXJnaW5Cb3R0b20nLFxuICAnYm9yZGVyTGVmdFdpZHRoJyxcbiAgJ2JvcmRlclJpZ2h0V2lkdGgnLFxuICAnYm9yZGVyVG9wV2lkdGgnLFxuICAnYm9yZGVyQm90dG9tV2lkdGgnXG5dO1xuXG52YXIgbWVhc3VyZW1lbnRzTGVuZ3RoID0gbWVhc3VyZW1lbnRzLmxlbmd0aDtcblxuZnVuY3Rpb24gZ2V0WmVyb1NpemUoKSB7XG4gIHZhciBzaXplID0ge1xuICAgIHdpZHRoOiAwLFxuICAgIGhlaWdodDogMCxcbiAgICBpbm5lcldpZHRoOiAwLFxuICAgIGlubmVySGVpZ2h0OiAwLFxuICAgIG91dGVyV2lkdGg6IDAsXG4gICAgb3V0ZXJIZWlnaHQ6IDBcbiAgfTtcbiAgZm9yICggdmFyIGk9MDsgaSA8IG1lYXN1cmVtZW50c0xlbmd0aDsgaSsrICkge1xuICAgIHZhciBtZWFzdXJlbWVudCA9IG1lYXN1cmVtZW50c1tpXTtcbiAgICBzaXplWyBtZWFzdXJlbWVudCBdID0gMDtcbiAgfVxuICByZXR1cm4gc2l6ZTtcbn1cblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gZ2V0U3R5bGUgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gLy9cblxuLyoqXG4gKiBnZXRTdHlsZSwgZ2V0IHN0eWxlIG9mIGVsZW1lbnQsIGNoZWNrIGZvciBGaXJlZm94IGJ1Z1xuICogaHR0cHM6Ly9idWd6aWxsYS5tb3ppbGxhLm9yZy9zaG93X2J1Zy5jZ2k/aWQ9NTQ4Mzk3XG4gKi9cbmZ1bmN0aW9uIGdldFN0eWxlKCBlbGVtICkge1xuICB2YXIgc3R5bGUgPSBnZXRDb21wdXRlZFN0eWxlKCBlbGVtICk7XG4gIGlmICggIXN0eWxlICkge1xuICAgIGxvZ0Vycm9yKCAnU3R5bGUgcmV0dXJuZWQgJyArIHN0eWxlICtcbiAgICAgICcuIEFyZSB5b3UgcnVubmluZyB0aGlzIGNvZGUgaW4gYSBoaWRkZW4gaWZyYW1lIG9uIEZpcmVmb3g/ICcgK1xuICAgICAgJ1NlZSBodHRwczovL2JpdC5seS9nZXRzaXplYnVnMScgKTtcbiAgfVxuICByZXR1cm4gc3R5bGU7XG59XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIHNldHVwIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIC8vXG5cbnZhciBpc1NldHVwID0gZmFsc2U7XG5cbnZhciBpc0JveFNpemVPdXRlcjtcblxuLyoqXG4gKiBzZXR1cFxuICogY2hlY2sgaXNCb3hTaXplck91dGVyXG4gKiBkbyBvbiBmaXJzdCBnZXRTaXplKCkgcmF0aGVyIHRoYW4gb24gcGFnZSBsb2FkIGZvciBGaXJlZm94IGJ1Z1xuICovXG5mdW5jdGlvbiBzZXR1cCgpIHtcbiAgLy8gc2V0dXAgb25jZVxuICBpZiAoIGlzU2V0dXAgKSB7XG4gICAgcmV0dXJuO1xuICB9XG4gIGlzU2V0dXAgPSB0cnVlO1xuXG4gIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIGJveCBzaXppbmcgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gLy9cblxuICAvKipcbiAgICogQ2hyb21lICYgU2FmYXJpIG1lYXN1cmUgdGhlIG91dGVyLXdpZHRoIG9uIHN0eWxlLndpZHRoIG9uIGJvcmRlci1ib3ggZWxlbXNcbiAgICogSUUxMSAmIEZpcmVmb3g8MjkgbWVhc3VyZXMgdGhlIGlubmVyLXdpZHRoXG4gICAqL1xuICB2YXIgZGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gIGRpdi5zdHlsZS53aWR0aCA9ICcyMDBweCc7XG4gIGRpdi5zdHlsZS5wYWRkaW5nID0gJzFweCAycHggM3B4IDRweCc7XG4gIGRpdi5zdHlsZS5ib3JkZXJTdHlsZSA9ICdzb2xpZCc7XG4gIGRpdi5zdHlsZS5ib3JkZXJXaWR0aCA9ICcxcHggMnB4IDNweCA0cHgnO1xuICBkaXYuc3R5bGUuYm94U2l6aW5nID0gJ2JvcmRlci1ib3gnO1xuXG4gIHZhciBib2R5ID0gZG9jdW1lbnQuYm9keSB8fCBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQ7XG4gIGJvZHkuYXBwZW5kQ2hpbGQoIGRpdiApO1xuICB2YXIgc3R5bGUgPSBnZXRTdHlsZSggZGl2ICk7XG4gIC8vIHJvdW5kIHZhbHVlIGZvciBicm93c2VyIHpvb20uIGRlc2FuZHJvL21hc29ucnkjOTI4XG4gIGlzQm94U2l6ZU91dGVyID0gTWF0aC5yb3VuZCggZ2V0U3R5bGVTaXplKCBzdHlsZS53aWR0aCApICkgPT0gMjAwO1xuICBnZXRTaXplLmlzQm94U2l6ZU91dGVyID0gaXNCb3hTaXplT3V0ZXI7XG5cbiAgYm9keS5yZW1vdmVDaGlsZCggZGl2ICk7XG59XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIGdldFNpemUgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gLy9cblxuZnVuY3Rpb24gZ2V0U2l6ZSggZWxlbSApIHtcbiAgc2V0dXAoKTtcblxuICAvLyB1c2UgcXVlcnlTZWxldG9yIGlmIGVsZW0gaXMgc3RyaW5nXG4gIGlmICggdHlwZW9mIGVsZW0gPT0gJ3N0cmluZycgKSB7XG4gICAgZWxlbSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoIGVsZW0gKTtcbiAgfVxuXG4gIC8vIGRvIG5vdCBwcm9jZWVkIG9uIG5vbi1vYmplY3RzXG4gIGlmICggIWVsZW0gfHwgdHlwZW9mIGVsZW0gIT0gJ29iamVjdCcgfHwgIWVsZW0ubm9kZVR5cGUgKSB7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgdmFyIHN0eWxlID0gZ2V0U3R5bGUoIGVsZW0gKTtcblxuICAvLyBpZiBoaWRkZW4sIGV2ZXJ5dGhpbmcgaXMgMFxuICBpZiAoIHN0eWxlLmRpc3BsYXkgPT0gJ25vbmUnICkge1xuICAgIHJldHVybiBnZXRaZXJvU2l6ZSgpO1xuICB9XG5cbiAgdmFyIHNpemUgPSB7fTtcbiAgc2l6ZS53aWR0aCA9IGVsZW0ub2Zmc2V0V2lkdGg7XG4gIHNpemUuaGVpZ2h0ID0gZWxlbS5vZmZzZXRIZWlnaHQ7XG5cbiAgdmFyIGlzQm9yZGVyQm94ID0gc2l6ZS5pc0JvcmRlckJveCA9IHN0eWxlLmJveFNpemluZyA9PSAnYm9yZGVyLWJveCc7XG5cbiAgLy8gZ2V0IGFsbCBtZWFzdXJlbWVudHNcbiAgZm9yICggdmFyIGk9MDsgaSA8IG1lYXN1cmVtZW50c0xlbmd0aDsgaSsrICkge1xuICAgIHZhciBtZWFzdXJlbWVudCA9IG1lYXN1cmVtZW50c1tpXTtcbiAgICB2YXIgdmFsdWUgPSBzdHlsZVsgbWVhc3VyZW1lbnQgXTtcbiAgICB2YXIgbnVtID0gcGFyc2VGbG9hdCggdmFsdWUgKTtcbiAgICAvLyBhbnkgJ2F1dG8nLCAnbWVkaXVtJyB2YWx1ZSB3aWxsIGJlIDBcbiAgICBzaXplWyBtZWFzdXJlbWVudCBdID0gIWlzTmFOKCBudW0gKSA/IG51bSA6IDA7XG4gIH1cblxuICB2YXIgcGFkZGluZ1dpZHRoID0gc2l6ZS5wYWRkaW5nTGVmdCArIHNpemUucGFkZGluZ1JpZ2h0O1xuICB2YXIgcGFkZGluZ0hlaWdodCA9IHNpemUucGFkZGluZ1RvcCArIHNpemUucGFkZGluZ0JvdHRvbTtcbiAgdmFyIG1hcmdpbldpZHRoID0gc2l6ZS5tYXJnaW5MZWZ0ICsgc2l6ZS5tYXJnaW5SaWdodDtcbiAgdmFyIG1hcmdpbkhlaWdodCA9IHNpemUubWFyZ2luVG9wICsgc2l6ZS5tYXJnaW5Cb3R0b207XG4gIHZhciBib3JkZXJXaWR0aCA9IHNpemUuYm9yZGVyTGVmdFdpZHRoICsgc2l6ZS5ib3JkZXJSaWdodFdpZHRoO1xuICB2YXIgYm9yZGVySGVpZ2h0ID0gc2l6ZS5ib3JkZXJUb3BXaWR0aCArIHNpemUuYm9yZGVyQm90dG9tV2lkdGg7XG5cbiAgdmFyIGlzQm9yZGVyQm94U2l6ZU91dGVyID0gaXNCb3JkZXJCb3ggJiYgaXNCb3hTaXplT3V0ZXI7XG5cbiAgLy8gb3ZlcndyaXRlIHdpZHRoIGFuZCBoZWlnaHQgaWYgd2UgY2FuIGdldCBpdCBmcm9tIHN0eWxlXG4gIHZhciBzdHlsZVdpZHRoID0gZ2V0U3R5bGVTaXplKCBzdHlsZS53aWR0aCApO1xuICBpZiAoIHN0eWxlV2lkdGggIT09IGZhbHNlICkge1xuICAgIHNpemUud2lkdGggPSBzdHlsZVdpZHRoICtcbiAgICAgIC8vIGFkZCBwYWRkaW5nIGFuZCBib3JkZXIgdW5sZXNzIGl0J3MgYWxyZWFkeSBpbmNsdWRpbmcgaXRcbiAgICAgICggaXNCb3JkZXJCb3hTaXplT3V0ZXIgPyAwIDogcGFkZGluZ1dpZHRoICsgYm9yZGVyV2lkdGggKTtcbiAgfVxuXG4gIHZhciBzdHlsZUhlaWdodCA9IGdldFN0eWxlU2l6ZSggc3R5bGUuaGVpZ2h0ICk7XG4gIGlmICggc3R5bGVIZWlnaHQgIT09IGZhbHNlICkge1xuICAgIHNpemUuaGVpZ2h0ID0gc3R5bGVIZWlnaHQgK1xuICAgICAgLy8gYWRkIHBhZGRpbmcgYW5kIGJvcmRlciB1bmxlc3MgaXQncyBhbHJlYWR5IGluY2x1ZGluZyBpdFxuICAgICAgKCBpc0JvcmRlckJveFNpemVPdXRlciA/IDAgOiBwYWRkaW5nSGVpZ2h0ICsgYm9yZGVySGVpZ2h0ICk7XG4gIH1cblxuICBzaXplLmlubmVyV2lkdGggPSBzaXplLndpZHRoIC0gKCBwYWRkaW5nV2lkdGggKyBib3JkZXJXaWR0aCApO1xuICBzaXplLmlubmVySGVpZ2h0ID0gc2l6ZS5oZWlnaHQgLSAoIHBhZGRpbmdIZWlnaHQgKyBib3JkZXJIZWlnaHQgKTtcblxuICBzaXplLm91dGVyV2lkdGggPSBzaXplLndpZHRoICsgbWFyZ2luV2lkdGg7XG4gIHNpemUub3V0ZXJIZWlnaHQgPSBzaXplLmhlaWdodCArIG1hcmdpbkhlaWdodDtcblxuICByZXR1cm4gc2l6ZTtcbn1cblxucmV0dXJuIGdldFNpemU7XG5cbn0pO1xuIiwiLyoqXG4gKiBtYXRjaGVzU2VsZWN0b3IgdjIuMC4yXG4gKiBtYXRjaGVzU2VsZWN0b3IoIGVsZW1lbnQsICcuc2VsZWN0b3InIClcbiAqIE1JVCBsaWNlbnNlXG4gKi9cblxuLypqc2hpbnQgYnJvd3NlcjogdHJ1ZSwgc3RyaWN0OiB0cnVlLCB1bmRlZjogdHJ1ZSwgdW51c2VkOiB0cnVlICovXG5cbiggZnVuY3Rpb24oIHdpbmRvdywgZmFjdG9yeSApIHtcbiAgLypnbG9iYWwgZGVmaW5lOiBmYWxzZSwgbW9kdWxlOiBmYWxzZSAqL1xuICAndXNlIHN0cmljdCc7XG4gIC8vIHVuaXZlcnNhbCBtb2R1bGUgZGVmaW5pdGlvblxuICBpZiAoIHR5cGVvZiBkZWZpbmUgPT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kICkge1xuICAgIC8vIEFNRFxuICAgIGRlZmluZSggZmFjdG9yeSApO1xuICB9IGVsc2UgaWYgKCB0eXBlb2YgbW9kdWxlID09ICdvYmplY3QnICYmIG1vZHVsZS5leHBvcnRzICkge1xuICAgIC8vIENvbW1vbkpTXG4gICAgbW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KCk7XG4gIH0gZWxzZSB7XG4gICAgLy8gYnJvd3NlciBnbG9iYWxcbiAgICB3aW5kb3cubWF0Y2hlc1NlbGVjdG9yID0gZmFjdG9yeSgpO1xuICB9XG5cbn0oIHdpbmRvdywgZnVuY3Rpb24gZmFjdG9yeSgpIHtcbiAgJ3VzZSBzdHJpY3QnO1xuXG4gIHZhciBtYXRjaGVzTWV0aG9kID0gKCBmdW5jdGlvbigpIHtcbiAgICB2YXIgRWxlbVByb3RvID0gd2luZG93LkVsZW1lbnQucHJvdG90eXBlO1xuICAgIC8vIGNoZWNrIGZvciB0aGUgc3RhbmRhcmQgbWV0aG9kIG5hbWUgZmlyc3RcbiAgICBpZiAoIEVsZW1Qcm90by5tYXRjaGVzICkge1xuICAgICAgcmV0dXJuICdtYXRjaGVzJztcbiAgICB9XG4gICAgLy8gY2hlY2sgdW4tcHJlZml4ZWRcbiAgICBpZiAoIEVsZW1Qcm90by5tYXRjaGVzU2VsZWN0b3IgKSB7XG4gICAgICByZXR1cm4gJ21hdGNoZXNTZWxlY3Rvcic7XG4gICAgfVxuICAgIC8vIGNoZWNrIHZlbmRvciBwcmVmaXhlc1xuICAgIHZhciBwcmVmaXhlcyA9IFsgJ3dlYmtpdCcsICdtb3onLCAnbXMnLCAnbycgXTtcblxuICAgIGZvciAoIHZhciBpPTA7IGkgPCBwcmVmaXhlcy5sZW5ndGg7IGkrKyApIHtcbiAgICAgIHZhciBwcmVmaXggPSBwcmVmaXhlc1tpXTtcbiAgICAgIHZhciBtZXRob2QgPSBwcmVmaXggKyAnTWF0Y2hlc1NlbGVjdG9yJztcbiAgICAgIGlmICggRWxlbVByb3RvWyBtZXRob2QgXSApIHtcbiAgICAgICAgcmV0dXJuIG1ldGhvZDtcbiAgICAgIH1cbiAgICB9XG4gIH0pKCk7XG5cbiAgcmV0dXJuIGZ1bmN0aW9uIG1hdGNoZXNTZWxlY3RvciggZWxlbSwgc2VsZWN0b3IgKSB7XG4gICAgcmV0dXJuIGVsZW1bIG1hdGNoZXNNZXRob2QgXSggc2VsZWN0b3IgKTtcbiAgfTtcblxufSkpO1xuIiwiLyoqXG4gKiBGaXp6eSBVSSB1dGlscyB2Mi4wLjdcbiAqIE1JVCBsaWNlbnNlXG4gKi9cblxuLypqc2hpbnQgYnJvd3NlcjogdHJ1ZSwgdW5kZWY6IHRydWUsIHVudXNlZDogdHJ1ZSwgc3RyaWN0OiB0cnVlICovXG5cbiggZnVuY3Rpb24oIHdpbmRvdywgZmFjdG9yeSApIHtcbiAgLy8gdW5pdmVyc2FsIG1vZHVsZSBkZWZpbml0aW9uXG4gIC8qanNoaW50IHN0cmljdDogZmFsc2UgKi8gLypnbG9iYWxzIGRlZmluZSwgbW9kdWxlLCByZXF1aXJlICovXG5cbiAgaWYgKCB0eXBlb2YgZGVmaW5lID09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCApIHtcbiAgICAvLyBBTURcbiAgICBkZWZpbmUoIFtcbiAgICAgICdkZXNhbmRyby1tYXRjaGVzLXNlbGVjdG9yL21hdGNoZXMtc2VsZWN0b3InXG4gICAgXSwgZnVuY3Rpb24oIG1hdGNoZXNTZWxlY3RvciApIHtcbiAgICAgIHJldHVybiBmYWN0b3J5KCB3aW5kb3csIG1hdGNoZXNTZWxlY3RvciApO1xuICAgIH0pO1xuICB9IGVsc2UgaWYgKCB0eXBlb2YgbW9kdWxlID09ICdvYmplY3QnICYmIG1vZHVsZS5leHBvcnRzICkge1xuICAgIC8vIENvbW1vbkpTXG4gICAgbW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KFxuICAgICAgd2luZG93LFxuICAgICAgcmVxdWlyZSgnZGVzYW5kcm8tbWF0Y2hlcy1zZWxlY3RvcicpXG4gICAgKTtcbiAgfSBlbHNlIHtcbiAgICAvLyBicm93c2VyIGdsb2JhbFxuICAgIHdpbmRvdy5maXp6eVVJVXRpbHMgPSBmYWN0b3J5KFxuICAgICAgd2luZG93LFxuICAgICAgd2luZG93Lm1hdGNoZXNTZWxlY3RvclxuICAgICk7XG4gIH1cblxufSggd2luZG93LCBmdW5jdGlvbiBmYWN0b3J5KCB3aW5kb3csIG1hdGNoZXNTZWxlY3RvciApIHtcblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgdXRpbHMgPSB7fTtcblxuLy8gLS0tLS0gZXh0ZW5kIC0tLS0tIC8vXG5cbi8vIGV4dGVuZHMgb2JqZWN0c1xudXRpbHMuZXh0ZW5kID0gZnVuY3Rpb24oIGEsIGIgKSB7XG4gIGZvciAoIHZhciBwcm9wIGluIGIgKSB7XG4gICAgYVsgcHJvcCBdID0gYlsgcHJvcCBdO1xuICB9XG4gIHJldHVybiBhO1xufTtcblxuLy8gLS0tLS0gbW9kdWxvIC0tLS0tIC8vXG5cbnV0aWxzLm1vZHVsbyA9IGZ1bmN0aW9uKCBudW0sIGRpdiApIHtcbiAgcmV0dXJuICggKCBudW0gJSBkaXYgKSArIGRpdiApICUgZGl2O1xufTtcblxuLy8gLS0tLS0gbWFrZUFycmF5IC0tLS0tIC8vXG5cbnZhciBhcnJheVNsaWNlID0gQXJyYXkucHJvdG90eXBlLnNsaWNlO1xuXG4vLyB0dXJuIGVsZW1lbnQgb3Igbm9kZUxpc3QgaW50byBhbiBhcnJheVxudXRpbHMubWFrZUFycmF5ID0gZnVuY3Rpb24oIG9iaiApIHtcbiAgaWYgKCBBcnJheS5pc0FycmF5KCBvYmogKSApIHtcbiAgICAvLyB1c2Ugb2JqZWN0IGlmIGFscmVhZHkgYW4gYXJyYXlcbiAgICByZXR1cm4gb2JqO1xuICB9XG4gIC8vIHJldHVybiBlbXB0eSBhcnJheSBpZiB1bmRlZmluZWQgb3IgbnVsbC4gIzZcbiAgaWYgKCBvYmogPT09IG51bGwgfHwgb2JqID09PSB1bmRlZmluZWQgKSB7XG4gICAgcmV0dXJuIFtdO1xuICB9XG5cbiAgdmFyIGlzQXJyYXlMaWtlID0gdHlwZW9mIG9iaiA9PSAnb2JqZWN0JyAmJiB0eXBlb2Ygb2JqLmxlbmd0aCA9PSAnbnVtYmVyJztcbiAgaWYgKCBpc0FycmF5TGlrZSApIHtcbiAgICAvLyBjb252ZXJ0IG5vZGVMaXN0IHRvIGFycmF5XG4gICAgcmV0dXJuIGFycmF5U2xpY2UuY2FsbCggb2JqICk7XG4gIH1cblxuICAvLyBhcnJheSBvZiBzaW5nbGUgaW5kZXhcbiAgcmV0dXJuIFsgb2JqIF07XG59O1xuXG4vLyAtLS0tLSByZW1vdmVGcm9tIC0tLS0tIC8vXG5cbnV0aWxzLnJlbW92ZUZyb20gPSBmdW5jdGlvbiggYXJ5LCBvYmogKSB7XG4gIHZhciBpbmRleCA9IGFyeS5pbmRleE9mKCBvYmogKTtcbiAgaWYgKCBpbmRleCAhPSAtMSApIHtcbiAgICBhcnkuc3BsaWNlKCBpbmRleCwgMSApO1xuICB9XG59O1xuXG4vLyAtLS0tLSBnZXRQYXJlbnQgLS0tLS0gLy9cblxudXRpbHMuZ2V0UGFyZW50ID0gZnVuY3Rpb24oIGVsZW0sIHNlbGVjdG9yICkge1xuICB3aGlsZSAoIGVsZW0ucGFyZW50Tm9kZSAmJiBlbGVtICE9IGRvY3VtZW50LmJvZHkgKSB7XG4gICAgZWxlbSA9IGVsZW0ucGFyZW50Tm9kZTtcbiAgICBpZiAoIG1hdGNoZXNTZWxlY3RvciggZWxlbSwgc2VsZWN0b3IgKSApIHtcbiAgICAgIHJldHVybiBlbGVtO1xuICAgIH1cbiAgfVxufTtcblxuLy8gLS0tLS0gZ2V0UXVlcnlFbGVtZW50IC0tLS0tIC8vXG5cbi8vIHVzZSBlbGVtZW50IGFzIHNlbGVjdG9yIHN0cmluZ1xudXRpbHMuZ2V0UXVlcnlFbGVtZW50ID0gZnVuY3Rpb24oIGVsZW0gKSB7XG4gIGlmICggdHlwZW9mIGVsZW0gPT0gJ3N0cmluZycgKSB7XG4gICAgcmV0dXJuIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoIGVsZW0gKTtcbiAgfVxuICByZXR1cm4gZWxlbTtcbn07XG5cbi8vIC0tLS0tIGhhbmRsZUV2ZW50IC0tLS0tIC8vXG5cbi8vIGVuYWJsZSAub250eXBlIHRvIHRyaWdnZXIgZnJvbSAuYWRkRXZlbnRMaXN0ZW5lciggZWxlbSwgJ3R5cGUnIClcbnV0aWxzLmhhbmRsZUV2ZW50ID0gZnVuY3Rpb24oIGV2ZW50ICkge1xuICB2YXIgbWV0aG9kID0gJ29uJyArIGV2ZW50LnR5cGU7XG4gIGlmICggdGhpc1sgbWV0aG9kIF0gKSB7XG4gICAgdGhpc1sgbWV0aG9kIF0oIGV2ZW50ICk7XG4gIH1cbn07XG5cbi8vIC0tLS0tIGZpbHRlckZpbmRFbGVtZW50cyAtLS0tLSAvL1xuXG51dGlscy5maWx0ZXJGaW5kRWxlbWVudHMgPSBmdW5jdGlvbiggZWxlbXMsIHNlbGVjdG9yICkge1xuICAvLyBtYWtlIGFycmF5IG9mIGVsZW1zXG4gIGVsZW1zID0gdXRpbHMubWFrZUFycmF5KCBlbGVtcyApO1xuICB2YXIgZmZFbGVtcyA9IFtdO1xuXG4gIGVsZW1zLmZvckVhY2goIGZ1bmN0aW9uKCBlbGVtICkge1xuICAgIC8vIGNoZWNrIHRoYXQgZWxlbSBpcyBhbiBhY3R1YWwgZWxlbWVudFxuICAgIGlmICggISggZWxlbSBpbnN0YW5jZW9mIEhUTUxFbGVtZW50ICkgKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIC8vIGFkZCBlbGVtIGlmIG5vIHNlbGVjdG9yXG4gICAgaWYgKCAhc2VsZWN0b3IgKSB7XG4gICAgICBmZkVsZW1zLnB1c2goIGVsZW0gKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgLy8gZmlsdGVyICYgZmluZCBpdGVtcyBpZiB3ZSBoYXZlIGEgc2VsZWN0b3JcbiAgICAvLyBmaWx0ZXJcbiAgICBpZiAoIG1hdGNoZXNTZWxlY3RvciggZWxlbSwgc2VsZWN0b3IgKSApIHtcbiAgICAgIGZmRWxlbXMucHVzaCggZWxlbSApO1xuICAgIH1cbiAgICAvLyBmaW5kIGNoaWxkcmVuXG4gICAgdmFyIGNoaWxkRWxlbXMgPSBlbGVtLnF1ZXJ5U2VsZWN0b3JBbGwoIHNlbGVjdG9yICk7XG4gICAgLy8gY29uY2F0IGNoaWxkRWxlbXMgdG8gZmlsdGVyRm91bmQgYXJyYXlcbiAgICBmb3IgKCB2YXIgaT0wOyBpIDwgY2hpbGRFbGVtcy5sZW5ndGg7IGkrKyApIHtcbiAgICAgIGZmRWxlbXMucHVzaCggY2hpbGRFbGVtc1tpXSApO1xuICAgIH1cbiAgfSk7XG5cbiAgcmV0dXJuIGZmRWxlbXM7XG59O1xuXG4vLyAtLS0tLSBkZWJvdW5jZU1ldGhvZCAtLS0tLSAvL1xuXG51dGlscy5kZWJvdW5jZU1ldGhvZCA9IGZ1bmN0aW9uKCBfY2xhc3MsIG1ldGhvZE5hbWUsIHRocmVzaG9sZCApIHtcbiAgdGhyZXNob2xkID0gdGhyZXNob2xkIHx8IDEwMDtcbiAgLy8gb3JpZ2luYWwgbWV0aG9kXG4gIHZhciBtZXRob2QgPSBfY2xhc3MucHJvdG90eXBlWyBtZXRob2ROYW1lIF07XG4gIHZhciB0aW1lb3V0TmFtZSA9IG1ldGhvZE5hbWUgKyAnVGltZW91dCc7XG5cbiAgX2NsYXNzLnByb3RvdHlwZVsgbWV0aG9kTmFtZSBdID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHRpbWVvdXQgPSB0aGlzWyB0aW1lb3V0TmFtZSBdO1xuICAgIGNsZWFyVGltZW91dCggdGltZW91dCApO1xuXG4gICAgdmFyIGFyZ3MgPSBhcmd1bWVudHM7XG4gICAgdmFyIF90aGlzID0gdGhpcztcbiAgICB0aGlzWyB0aW1lb3V0TmFtZSBdID0gc2V0VGltZW91dCggZnVuY3Rpb24oKSB7XG4gICAgICBtZXRob2QuYXBwbHkoIF90aGlzLCBhcmdzICk7XG4gICAgICBkZWxldGUgX3RoaXNbIHRpbWVvdXROYW1lIF07XG4gICAgfSwgdGhyZXNob2xkICk7XG4gIH07XG59O1xuXG4vLyAtLS0tLSBkb2NSZWFkeSAtLS0tLSAvL1xuXG51dGlscy5kb2NSZWFkeSA9IGZ1bmN0aW9uKCBjYWxsYmFjayApIHtcbiAgdmFyIHJlYWR5U3RhdGUgPSBkb2N1bWVudC5yZWFkeVN0YXRlO1xuICBpZiAoIHJlYWR5U3RhdGUgPT0gJ2NvbXBsZXRlJyB8fCByZWFkeVN0YXRlID09ICdpbnRlcmFjdGl2ZScgKSB7XG4gICAgLy8gZG8gYXN5bmMgdG8gYWxsb3cgZm9yIG90aGVyIHNjcmlwdHMgdG8gcnVuLiBtZXRhZml6enkvZmxpY2tpdHkjNDQxXG4gICAgc2V0VGltZW91dCggY2FsbGJhY2sgKTtcbiAgfSBlbHNlIHtcbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCAnRE9NQ29udGVudExvYWRlZCcsIGNhbGxiYWNrICk7XG4gIH1cbn07XG5cbi8vIC0tLS0tIGh0bWxJbml0IC0tLS0tIC8vXG5cbi8vIGh0dHA6Ly9qYW1lc3JvYmVydHMubmFtZS9ibG9nLzIwMTAvMDIvMjIvc3RyaW5nLWZ1bmN0aW9ucy1mb3ItamF2YXNjcmlwdC10cmltLXRvLWNhbWVsLWNhc2UtdG8tZGFzaGVkLWFuZC10by11bmRlcnNjb3JlL1xudXRpbHMudG9EYXNoZWQgPSBmdW5jdGlvbiggc3RyICkge1xuICByZXR1cm4gc3RyLnJlcGxhY2UoIC8oLikoW0EtWl0pL2csIGZ1bmN0aW9uKCBtYXRjaCwgJDEsICQyICkge1xuICAgIHJldHVybiAkMSArICctJyArICQyO1xuICB9KS50b0xvd2VyQ2FzZSgpO1xufTtcblxudmFyIGNvbnNvbGUgPSB3aW5kb3cuY29uc29sZTtcbi8qKlxuICogYWxsb3cgdXNlciB0byBpbml0aWFsaXplIGNsYXNzZXMgdmlhIFtkYXRhLW5hbWVzcGFjZV0gb3IgLmpzLW5hbWVzcGFjZSBjbGFzc1xuICogaHRtbEluaXQoIFdpZGdldCwgJ3dpZGdldE5hbWUnIClcbiAqIG9wdGlvbnMgYXJlIHBhcnNlZCBmcm9tIGRhdGEtbmFtZXNwYWNlLW9wdGlvbnNcbiAqL1xudXRpbHMuaHRtbEluaXQgPSBmdW5jdGlvbiggV2lkZ2V0Q2xhc3MsIG5hbWVzcGFjZSApIHtcbiAgdXRpbHMuZG9jUmVhZHkoIGZ1bmN0aW9uKCkge1xuICAgIHZhciBkYXNoZWROYW1lc3BhY2UgPSB1dGlscy50b0Rhc2hlZCggbmFtZXNwYWNlICk7XG4gICAgdmFyIGRhdGFBdHRyID0gJ2RhdGEtJyArIGRhc2hlZE5hbWVzcGFjZTtcbiAgICB2YXIgZGF0YUF0dHJFbGVtcyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoICdbJyArIGRhdGFBdHRyICsgJ10nICk7XG4gICAgdmFyIGpzRGFzaEVsZW1zID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCggJy5qcy0nICsgZGFzaGVkTmFtZXNwYWNlICk7XG4gICAgdmFyIGVsZW1zID0gdXRpbHMubWFrZUFycmF5KCBkYXRhQXR0ckVsZW1zIClcbiAgICAgIC5jb25jYXQoIHV0aWxzLm1ha2VBcnJheSgganNEYXNoRWxlbXMgKSApO1xuICAgIHZhciBkYXRhT3B0aW9uc0F0dHIgPSBkYXRhQXR0ciArICctb3B0aW9ucyc7XG4gICAgdmFyIGpRdWVyeSA9IHdpbmRvdy5qUXVlcnk7XG5cbiAgICBlbGVtcy5mb3JFYWNoKCBmdW5jdGlvbiggZWxlbSApIHtcbiAgICAgIHZhciBhdHRyID0gZWxlbS5nZXRBdHRyaWJ1dGUoIGRhdGFBdHRyICkgfHxcbiAgICAgICAgZWxlbS5nZXRBdHRyaWJ1dGUoIGRhdGFPcHRpb25zQXR0ciApO1xuICAgICAgdmFyIG9wdGlvbnM7XG4gICAgICB0cnkge1xuICAgICAgICBvcHRpb25zID0gYXR0ciAmJiBKU09OLnBhcnNlKCBhdHRyICk7XG4gICAgICB9IGNhdGNoICggZXJyb3IgKSB7XG4gICAgICAgIC8vIGxvZyBlcnJvciwgZG8gbm90IGluaXRpYWxpemVcbiAgICAgICAgaWYgKCBjb25zb2xlICkge1xuICAgICAgICAgIGNvbnNvbGUuZXJyb3IoICdFcnJvciBwYXJzaW5nICcgKyBkYXRhQXR0ciArICcgb24gJyArIGVsZW0uY2xhc3NOYW1lICtcbiAgICAgICAgICAnOiAnICsgZXJyb3IgKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICAvLyBpbml0aWFsaXplXG4gICAgICB2YXIgaW5zdGFuY2UgPSBuZXcgV2lkZ2V0Q2xhc3MoIGVsZW0sIG9wdGlvbnMgKTtcbiAgICAgIC8vIG1ha2UgYXZhaWxhYmxlIHZpYSAkKCkuZGF0YSgnbmFtZXNwYWNlJylcbiAgICAgIGlmICggalF1ZXJ5ICkge1xuICAgICAgICBqUXVlcnkuZGF0YSggZWxlbSwgbmFtZXNwYWNlLCBpbnN0YW5jZSApO1xuICAgICAgfVxuICAgIH0pO1xuXG4gIH0pO1xufTtcblxuLy8gLS0tLS0gIC0tLS0tIC8vXG5cbnJldHVybiB1dGlscztcblxufSkpO1xuIiwiLy8gRmxpY2tpdHkuQ2VsbFxuKCBmdW5jdGlvbiggd2luZG93LCBmYWN0b3J5ICkge1xuICAvLyB1bml2ZXJzYWwgbW9kdWxlIGRlZmluaXRpb25cbiAgLyoganNoaW50IHN0cmljdDogZmFsc2UgKi9cbiAgaWYgKCB0eXBlb2YgZGVmaW5lID09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCApIHtcbiAgICAvLyBBTURcbiAgICBkZWZpbmUoIFtcbiAgICAgICdnZXQtc2l6ZS9nZXQtc2l6ZSdcbiAgICBdLCBmdW5jdGlvbiggZ2V0U2l6ZSApIHtcbiAgICAgIHJldHVybiBmYWN0b3J5KCB3aW5kb3csIGdldFNpemUgKTtcbiAgICB9KTtcbiAgfSBlbHNlIGlmICggdHlwZW9mIG1vZHVsZSA9PSAnb2JqZWN0JyAmJiBtb2R1bGUuZXhwb3J0cyApIHtcbiAgICAvLyBDb21tb25KU1xuICAgIG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeShcbiAgICAgIHdpbmRvdyxcbiAgICAgIHJlcXVpcmUoJ2dldC1zaXplJylcbiAgICApO1xuICB9IGVsc2Uge1xuICAgIC8vIGJyb3dzZXIgZ2xvYmFsXG4gICAgd2luZG93LkZsaWNraXR5ID0gd2luZG93LkZsaWNraXR5IHx8IHt9O1xuICAgIHdpbmRvdy5GbGlja2l0eS5DZWxsID0gZmFjdG9yeShcbiAgICAgIHdpbmRvdyxcbiAgICAgIHdpbmRvdy5nZXRTaXplXG4gICAgKTtcbiAgfVxuXG59KCB3aW5kb3csIGZ1bmN0aW9uIGZhY3RvcnkoIHdpbmRvdywgZ2V0U2l6ZSApIHtcblxuJ3VzZSBzdHJpY3QnO1xuXG5mdW5jdGlvbiBDZWxsKCBlbGVtLCBwYXJlbnQgKSB7XG4gIHRoaXMuZWxlbWVudCA9IGVsZW07XG4gIHRoaXMucGFyZW50ID0gcGFyZW50O1xuXG4gIHRoaXMuY3JlYXRlKCk7XG59XG5cbnZhciBwcm90byA9IENlbGwucHJvdG90eXBlO1xuXG5wcm90by5jcmVhdGUgPSBmdW5jdGlvbigpIHtcbiAgdGhpcy5lbGVtZW50LnN0eWxlLnBvc2l0aW9uID0gJ2Fic29sdXRlJztcbiAgdGhpcy5lbGVtZW50LnNldEF0dHJpYnV0ZSggJ2FyaWEtaGlkZGVuJywgJ3RydWUnICk7XG4gIHRoaXMueCA9IDA7XG4gIHRoaXMuc2hpZnQgPSAwO1xufTtcblxucHJvdG8uZGVzdHJveSA9IGZ1bmN0aW9uKCkge1xuICAvLyByZXNldCBzdHlsZVxuICB0aGlzLnVuc2VsZWN0KCk7XG4gIHRoaXMuZWxlbWVudC5zdHlsZS5wb3NpdGlvbiA9ICcnO1xuICB2YXIgc2lkZSA9IHRoaXMucGFyZW50Lm9yaWdpblNpZGU7XG4gIHRoaXMuZWxlbWVudC5zdHlsZVsgc2lkZSBdID0gJyc7XG59O1xuXG5wcm90by5nZXRTaXplID0gZnVuY3Rpb24oKSB7XG4gIHRoaXMuc2l6ZSA9IGdldFNpemUoIHRoaXMuZWxlbWVudCApO1xufTtcblxucHJvdG8uc2V0UG9zaXRpb24gPSBmdW5jdGlvbiggeCApIHtcbiAgdGhpcy54ID0geDtcbiAgdGhpcy51cGRhdGVUYXJnZXQoKTtcbiAgdGhpcy5yZW5kZXJQb3NpdGlvbiggeCApO1xufTtcblxuLy8gc2V0RGVmYXVsdFRhcmdldCB2MSBtZXRob2QsIGJhY2t3YXJkcyBjb21wYXRpYmlsaXR5LCByZW1vdmUgaW4gdjNcbnByb3RvLnVwZGF0ZVRhcmdldCA9IHByb3RvLnNldERlZmF1bHRUYXJnZXQgPSBmdW5jdGlvbigpIHtcbiAgdmFyIG1hcmdpblByb3BlcnR5ID0gdGhpcy5wYXJlbnQub3JpZ2luU2lkZSA9PSAnbGVmdCcgPyAnbWFyZ2luTGVmdCcgOiAnbWFyZ2luUmlnaHQnO1xuICB0aGlzLnRhcmdldCA9IHRoaXMueCArIHRoaXMuc2l6ZVsgbWFyZ2luUHJvcGVydHkgXSArXG4gICAgdGhpcy5zaXplLndpZHRoICogdGhpcy5wYXJlbnQuY2VsbEFsaWduO1xufTtcblxucHJvdG8ucmVuZGVyUG9zaXRpb24gPSBmdW5jdGlvbiggeCApIHtcbiAgLy8gcmVuZGVyIHBvc2l0aW9uIG9mIGNlbGwgd2l0aCBpbiBzbGlkZXJcbiAgdmFyIHNpZGUgPSB0aGlzLnBhcmVudC5vcmlnaW5TaWRlO1xuICB0aGlzLmVsZW1lbnQuc3R5bGVbIHNpZGUgXSA9IHRoaXMucGFyZW50LmdldFBvc2l0aW9uVmFsdWUoIHggKTtcbn07XG5cbnByb3RvLnNlbGVjdCA9IGZ1bmN0aW9uKCkge1xuICB0aGlzLmVsZW1lbnQuY2xhc3NMaXN0LmFkZCgnaXMtc2VsZWN0ZWQnKTtcbiAgdGhpcy5lbGVtZW50LnJlbW92ZUF0dHJpYnV0ZSgnYXJpYS1oaWRkZW4nKTtcbn07XG5cbnByb3RvLnVuc2VsZWN0ID0gZnVuY3Rpb24oKSB7XG4gIHRoaXMuZWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKCdpcy1zZWxlY3RlZCcpO1xuICB0aGlzLmVsZW1lbnQuc2V0QXR0cmlidXRlKCAnYXJpYS1oaWRkZW4nLCAndHJ1ZScgKTtcbn07XG5cbi8qKlxuICogQHBhcmFtIHtJbnRlZ2VyfSBmYWN0b3IgLSAwLCAxLCBvciAtMVxuKiovXG5wcm90by53cmFwU2hpZnQgPSBmdW5jdGlvbiggc2hpZnQgKSB7XG4gIHRoaXMuc2hpZnQgPSBzaGlmdDtcbiAgdGhpcy5yZW5kZXJQb3NpdGlvbiggdGhpcy54ICsgdGhpcy5wYXJlbnQuc2xpZGVhYmxlV2lkdGggKiBzaGlmdCApO1xufTtcblxucHJvdG8ucmVtb3ZlID0gZnVuY3Rpb24oKSB7XG4gIHRoaXMuZWxlbWVudC5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKCB0aGlzLmVsZW1lbnQgKTtcbn07XG5cbnJldHVybiBDZWxsO1xuXG59KSk7XG4iLCIvLyBzbGlkZVxuKCBmdW5jdGlvbiggd2luZG93LCBmYWN0b3J5ICkge1xuICAvLyB1bml2ZXJzYWwgbW9kdWxlIGRlZmluaXRpb25cbiAgLyoganNoaW50IHN0cmljdDogZmFsc2UgKi9cbiAgaWYgKCB0eXBlb2YgZGVmaW5lID09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCApIHtcbiAgICAvLyBBTURcbiAgICBkZWZpbmUoIGZhY3RvcnkgKTtcbiAgfSBlbHNlIGlmICggdHlwZW9mIG1vZHVsZSA9PSAnb2JqZWN0JyAmJiBtb2R1bGUuZXhwb3J0cyApIHtcbiAgICAvLyBDb21tb25KU1xuICAgIG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeSgpO1xuICB9IGVsc2Uge1xuICAgIC8vIGJyb3dzZXIgZ2xvYmFsXG4gICAgd2luZG93LkZsaWNraXR5ID0gd2luZG93LkZsaWNraXR5IHx8IHt9O1xuICAgIHdpbmRvdy5GbGlja2l0eS5TbGlkZSA9IGZhY3RvcnkoKTtcbiAgfVxuXG59KCB3aW5kb3csIGZ1bmN0aW9uIGZhY3RvcnkoKSB7XG4ndXNlIHN0cmljdCc7XG5cbmZ1bmN0aW9uIFNsaWRlKCBwYXJlbnQgKSB7XG4gIHRoaXMucGFyZW50ID0gcGFyZW50O1xuICB0aGlzLmlzT3JpZ2luTGVmdCA9IHBhcmVudC5vcmlnaW5TaWRlID09ICdsZWZ0JztcbiAgdGhpcy5jZWxscyA9IFtdO1xuICB0aGlzLm91dGVyV2lkdGggPSAwO1xuICB0aGlzLmhlaWdodCA9IDA7XG59XG5cbnZhciBwcm90byA9IFNsaWRlLnByb3RvdHlwZTtcblxucHJvdG8uYWRkQ2VsbCA9IGZ1bmN0aW9uKCBjZWxsICkge1xuICB0aGlzLmNlbGxzLnB1c2goIGNlbGwgKTtcbiAgdGhpcy5vdXRlcldpZHRoICs9IGNlbGwuc2l6ZS5vdXRlcldpZHRoO1xuICB0aGlzLmhlaWdodCA9IE1hdGgubWF4KCBjZWxsLnNpemUub3V0ZXJIZWlnaHQsIHRoaXMuaGVpZ2h0ICk7XG4gIC8vIGZpcnN0IGNlbGwgc3R1ZmZcbiAgaWYgKCB0aGlzLmNlbGxzLmxlbmd0aCA9PSAxICkge1xuICAgIHRoaXMueCA9IGNlbGwueDsgLy8geCBjb21lcyBmcm9tIGZpcnN0IGNlbGxcbiAgICB2YXIgYmVnaW5NYXJnaW4gPSB0aGlzLmlzT3JpZ2luTGVmdCA/ICdtYXJnaW5MZWZ0JyA6ICdtYXJnaW5SaWdodCc7XG4gICAgdGhpcy5maXJzdE1hcmdpbiA9IGNlbGwuc2l6ZVsgYmVnaW5NYXJnaW4gXTtcbiAgfVxufTtcblxucHJvdG8udXBkYXRlVGFyZ2V0ID0gZnVuY3Rpb24oKSB7XG4gIHZhciBlbmRNYXJnaW4gPSB0aGlzLmlzT3JpZ2luTGVmdCA/ICdtYXJnaW5SaWdodCcgOiAnbWFyZ2luTGVmdCc7XG4gIHZhciBsYXN0Q2VsbCA9IHRoaXMuZ2V0TGFzdENlbGwoKTtcbiAgdmFyIGxhc3RNYXJnaW4gPSBsYXN0Q2VsbCA/IGxhc3RDZWxsLnNpemVbIGVuZE1hcmdpbiBdIDogMDtcbiAgdmFyIHNsaWRlV2lkdGggPSB0aGlzLm91dGVyV2lkdGggLSAoIHRoaXMuZmlyc3RNYXJnaW4gKyBsYXN0TWFyZ2luICk7XG4gIHRoaXMudGFyZ2V0ID0gdGhpcy54ICsgdGhpcy5maXJzdE1hcmdpbiArIHNsaWRlV2lkdGggKiB0aGlzLnBhcmVudC5jZWxsQWxpZ247XG59O1xuXG5wcm90by5nZXRMYXN0Q2VsbCA9IGZ1bmN0aW9uKCkge1xuICByZXR1cm4gdGhpcy5jZWxsc1sgdGhpcy5jZWxscy5sZW5ndGggLSAxIF07XG59O1xuXG5wcm90by5zZWxlY3QgPSBmdW5jdGlvbigpIHtcbiAgdGhpcy5jZWxscy5mb3JFYWNoKCBmdW5jdGlvbiggY2VsbCApIHtcbiAgICBjZWxsLnNlbGVjdCgpO1xuICB9KTtcbn07XG5cbnByb3RvLnVuc2VsZWN0ID0gZnVuY3Rpb24oKSB7XG4gIHRoaXMuY2VsbHMuZm9yRWFjaCggZnVuY3Rpb24oIGNlbGwgKSB7XG4gICAgY2VsbC51bnNlbGVjdCgpO1xuICB9KTtcbn07XG5cbnByb3RvLmdldENlbGxFbGVtZW50cyA9IGZ1bmN0aW9uKCkge1xuICByZXR1cm4gdGhpcy5jZWxscy5tYXAoIGZ1bmN0aW9uKCBjZWxsICkge1xuICAgIHJldHVybiBjZWxsLmVsZW1lbnQ7XG4gIH0pO1xufTtcblxucmV0dXJuIFNsaWRlO1xuXG59KSk7XG4iLCIvLyBhbmltYXRlXG4oIGZ1bmN0aW9uKCB3aW5kb3csIGZhY3RvcnkgKSB7XG4gIC8vIHVuaXZlcnNhbCBtb2R1bGUgZGVmaW5pdGlvblxuICAvKiBqc2hpbnQgc3RyaWN0OiBmYWxzZSAqL1xuICBpZiAoIHR5cGVvZiBkZWZpbmUgPT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kICkge1xuICAgIC8vIEFNRFxuICAgIGRlZmluZSggW1xuICAgICAgJ2Zpenp5LXVpLXV0aWxzL3V0aWxzJ1xuICAgIF0sIGZ1bmN0aW9uKCB1dGlscyApIHtcbiAgICAgIHJldHVybiBmYWN0b3J5KCB3aW5kb3csIHV0aWxzICk7XG4gICAgfSk7XG4gIH0gZWxzZSBpZiAoIHR5cGVvZiBtb2R1bGUgPT0gJ29iamVjdCcgJiYgbW9kdWxlLmV4cG9ydHMgKSB7XG4gICAgLy8gQ29tbW9uSlNcbiAgICBtb2R1bGUuZXhwb3J0cyA9IGZhY3RvcnkoXG4gICAgICB3aW5kb3csXG4gICAgICByZXF1aXJlKCdmaXp6eS11aS11dGlscycpXG4gICAgKTtcbiAgfSBlbHNlIHtcbiAgICAvLyBicm93c2VyIGdsb2JhbFxuICAgIHdpbmRvdy5GbGlja2l0eSA9IHdpbmRvdy5GbGlja2l0eSB8fCB7fTtcbiAgICB3aW5kb3cuRmxpY2tpdHkuYW5pbWF0ZVByb3RvdHlwZSA9IGZhY3RvcnkoXG4gICAgICB3aW5kb3csXG4gICAgICB3aW5kb3cuZml6enlVSVV0aWxzXG4gICAgKTtcbiAgfVxuXG59KCB3aW5kb3csIGZ1bmN0aW9uIGZhY3RvcnkoIHdpbmRvdywgdXRpbHMgKSB7XG5cbid1c2Ugc3RyaWN0JztcblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gYW5pbWF0ZSAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSAvL1xuXG52YXIgcHJvdG8gPSB7fTtcblxucHJvdG8uc3RhcnRBbmltYXRpb24gPSBmdW5jdGlvbigpIHtcbiAgaWYgKCB0aGlzLmlzQW5pbWF0aW5nICkge1xuICAgIHJldHVybjtcbiAgfVxuXG4gIHRoaXMuaXNBbmltYXRpbmcgPSB0cnVlO1xuICB0aGlzLnJlc3RpbmdGcmFtZXMgPSAwO1xuICB0aGlzLmFuaW1hdGUoKTtcbn07XG5cbnByb3RvLmFuaW1hdGUgPSBmdW5jdGlvbigpIHtcbiAgdGhpcy5hcHBseURyYWdGb3JjZSgpO1xuICB0aGlzLmFwcGx5U2VsZWN0ZWRBdHRyYWN0aW9uKCk7XG5cbiAgdmFyIHByZXZpb3VzWCA9IHRoaXMueDtcblxuICB0aGlzLmludGVncmF0ZVBoeXNpY3MoKTtcbiAgdGhpcy5wb3NpdGlvblNsaWRlcigpO1xuICB0aGlzLnNldHRsZSggcHJldmlvdXNYICk7XG4gIC8vIGFuaW1hdGUgbmV4dCBmcmFtZVxuICBpZiAoIHRoaXMuaXNBbmltYXRpbmcgKSB7XG4gICAgdmFyIF90aGlzID0gdGhpcztcbiAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoIGZ1bmN0aW9uIGFuaW1hdGVGcmFtZSgpIHtcbiAgICAgIF90aGlzLmFuaW1hdGUoKTtcbiAgICB9KTtcbiAgfVxufTtcblxucHJvdG8ucG9zaXRpb25TbGlkZXIgPSBmdW5jdGlvbigpIHtcbiAgdmFyIHggPSB0aGlzLng7XG4gIC8vIHdyYXAgcG9zaXRpb24gYXJvdW5kXG4gIGlmICggdGhpcy5vcHRpb25zLndyYXBBcm91bmQgJiYgdGhpcy5jZWxscy5sZW5ndGggPiAxICkge1xuICAgIHggPSB1dGlscy5tb2R1bG8oIHgsIHRoaXMuc2xpZGVhYmxlV2lkdGggKTtcbiAgICB4ID0geCAtIHRoaXMuc2xpZGVhYmxlV2lkdGg7XG4gICAgdGhpcy5zaGlmdFdyYXBDZWxscyggeCApO1xuICB9XG5cbiAgdGhpcy5zZXRUcmFuc2xhdGVYKCB4LCB0aGlzLmlzQW5pbWF0aW5nICk7XG4gIHRoaXMuZGlzcGF0Y2hTY3JvbGxFdmVudCgpO1xufTtcblxucHJvdG8uc2V0VHJhbnNsYXRlWCA9IGZ1bmN0aW9uKCB4LCBpczNkICkge1xuICB4ICs9IHRoaXMuY3Vyc29yUG9zaXRpb247XG4gIC8vIHJldmVyc2UgaWYgcmlnaHQtdG8tbGVmdCBhbmQgdXNpbmcgdHJhbnNmb3JtXG4gIHggPSB0aGlzLm9wdGlvbnMucmlnaHRUb0xlZnQgPyAteCA6IHg7XG4gIHZhciB0cmFuc2xhdGVYID0gdGhpcy5nZXRQb3NpdGlvblZhbHVlKCB4ICk7XG4gIC8vIHVzZSAzRCB0cmFuZm9ybXMgZm9yIGhhcmR3YXJlIGFjY2VsZXJhdGlvbiBvbiBpT1NcbiAgLy8gYnV0IHVzZSAyRCB3aGVuIHNldHRsZWQsIGZvciBiZXR0ZXIgZm9udC1yZW5kZXJpbmdcbiAgdGhpcy5zbGlkZXIuc3R5bGUudHJhbnNmb3JtID0gaXMzZCA/XG4gICAgJ3RyYW5zbGF0ZTNkKCcgKyB0cmFuc2xhdGVYICsgJywwLDApJyA6ICd0cmFuc2xhdGVYKCcgKyB0cmFuc2xhdGVYICsgJyknO1xufTtcblxucHJvdG8uZGlzcGF0Y2hTY3JvbGxFdmVudCA9IGZ1bmN0aW9uKCkge1xuICB2YXIgZmlyc3RTbGlkZSA9IHRoaXMuc2xpZGVzWzBdO1xuICBpZiAoICFmaXJzdFNsaWRlICkge1xuICAgIHJldHVybjtcbiAgfVxuICB2YXIgcG9zaXRpb25YID0gLXRoaXMueCAtIGZpcnN0U2xpZGUudGFyZ2V0O1xuICB2YXIgcHJvZ3Jlc3MgPSBwb3NpdGlvblggLyB0aGlzLnNsaWRlc1dpZHRoO1xuICB0aGlzLmRpc3BhdGNoRXZlbnQoICdzY3JvbGwnLCBudWxsLCBbIHByb2dyZXNzLCBwb3NpdGlvblggXSApO1xufTtcblxucHJvdG8ucG9zaXRpb25TbGlkZXJBdFNlbGVjdGVkID0gZnVuY3Rpb24oKSB7XG4gIGlmICggIXRoaXMuY2VsbHMubGVuZ3RoICkge1xuICAgIHJldHVybjtcbiAgfVxuICB0aGlzLnggPSAtdGhpcy5zZWxlY3RlZFNsaWRlLnRhcmdldDtcbiAgdGhpcy52ZWxvY2l0eSA9IDA7IC8vIHN0b3Agd29iYmxlXG4gIHRoaXMucG9zaXRpb25TbGlkZXIoKTtcbn07XG5cbnByb3RvLmdldFBvc2l0aW9uVmFsdWUgPSBmdW5jdGlvbiggcG9zaXRpb24gKSB7XG4gIGlmICggdGhpcy5vcHRpb25zLnBlcmNlbnRQb3NpdGlvbiApIHtcbiAgICAvLyBwZXJjZW50IHBvc2l0aW9uLCByb3VuZCB0byAyIGRpZ2l0cywgbGlrZSAxMi4zNCVcbiAgICByZXR1cm4gKCBNYXRoLnJvdW5kKCAoIHBvc2l0aW9uIC8gdGhpcy5zaXplLmlubmVyV2lkdGggKSAqIDEwMDAwICkgKiAwLjAxICkrICclJztcbiAgfSBlbHNlIHtcbiAgICAvLyBwaXhlbCBwb3NpdGlvbmluZ1xuICAgIHJldHVybiBNYXRoLnJvdW5kKCBwb3NpdGlvbiApICsgJ3B4JztcbiAgfVxufTtcblxucHJvdG8uc2V0dGxlID0gZnVuY3Rpb24oIHByZXZpb3VzWCApIHtcbiAgLy8ga2VlcCB0cmFjayBvZiBmcmFtZXMgd2hlcmUgeCBoYXNuJ3QgbW92ZWRcbiAgaWYgKCAhdGhpcy5pc1BvaW50ZXJEb3duICYmIE1hdGgucm91bmQoIHRoaXMueCAqIDEwMCApID09IE1hdGgucm91bmQoIHByZXZpb3VzWCAqIDEwMCApICkge1xuICAgIHRoaXMucmVzdGluZ0ZyYW1lcysrO1xuICB9XG4gIC8vIHN0b3AgYW5pbWF0aW5nIGlmIHJlc3RpbmcgZm9yIDMgb3IgbW9yZSBmcmFtZXNcbiAgaWYgKCB0aGlzLnJlc3RpbmdGcmFtZXMgPiAyICkge1xuICAgIHRoaXMuaXNBbmltYXRpbmcgPSBmYWxzZTtcbiAgICBkZWxldGUgdGhpcy5pc0ZyZWVTY3JvbGxpbmc7XG4gICAgLy8gcmVuZGVyIHBvc2l0aW9uIHdpdGggdHJhbnNsYXRlWCB3aGVuIHNldHRsZWRcbiAgICB0aGlzLnBvc2l0aW9uU2xpZGVyKCk7XG4gICAgdGhpcy5kaXNwYXRjaEV2ZW50KCAnc2V0dGxlJywgbnVsbCwgWyB0aGlzLnNlbGVjdGVkSW5kZXggXSApO1xuICB9XG59O1xuXG5wcm90by5zaGlmdFdyYXBDZWxscyA9IGZ1bmN0aW9uKCB4ICkge1xuICAvLyBzaGlmdCBiZWZvcmUgY2VsbHNcbiAgdmFyIGJlZm9yZUdhcCA9IHRoaXMuY3Vyc29yUG9zaXRpb24gKyB4O1xuICB0aGlzLl9zaGlmdENlbGxzKCB0aGlzLmJlZm9yZVNoaWZ0Q2VsbHMsIGJlZm9yZUdhcCwgLTEgKTtcbiAgLy8gc2hpZnQgYWZ0ZXIgY2VsbHNcbiAgdmFyIGFmdGVyR2FwID0gdGhpcy5zaXplLmlubmVyV2lkdGggLSAoIHggKyB0aGlzLnNsaWRlYWJsZVdpZHRoICsgdGhpcy5jdXJzb3JQb3NpdGlvbiApO1xuICB0aGlzLl9zaGlmdENlbGxzKCB0aGlzLmFmdGVyU2hpZnRDZWxscywgYWZ0ZXJHYXAsIDEgKTtcbn07XG5cbnByb3RvLl9zaGlmdENlbGxzID0gZnVuY3Rpb24oIGNlbGxzLCBnYXAsIHNoaWZ0ICkge1xuICBmb3IgKCB2YXIgaT0wOyBpIDwgY2VsbHMubGVuZ3RoOyBpKysgKSB7XG4gICAgdmFyIGNlbGwgPSBjZWxsc1tpXTtcbiAgICB2YXIgY2VsbFNoaWZ0ID0gZ2FwID4gMCA/IHNoaWZ0IDogMDtcbiAgICBjZWxsLndyYXBTaGlmdCggY2VsbFNoaWZ0ICk7XG4gICAgZ2FwIC09IGNlbGwuc2l6ZS5vdXRlcldpZHRoO1xuICB9XG59O1xuXG5wcm90by5fdW5zaGlmdENlbGxzID0gZnVuY3Rpb24oIGNlbGxzICkge1xuICBpZiAoICFjZWxscyB8fCAhY2VsbHMubGVuZ3RoICkge1xuICAgIHJldHVybjtcbiAgfVxuICBmb3IgKCB2YXIgaT0wOyBpIDwgY2VsbHMubGVuZ3RoOyBpKysgKSB7XG4gICAgY2VsbHNbaV0ud3JhcFNoaWZ0KCAwICk7XG4gIH1cbn07XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIHBoeXNpY3MgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gLy9cblxucHJvdG8uaW50ZWdyYXRlUGh5c2ljcyA9IGZ1bmN0aW9uKCkge1xuICB0aGlzLnggKz0gdGhpcy52ZWxvY2l0eTtcbiAgdGhpcy52ZWxvY2l0eSAqPSB0aGlzLmdldEZyaWN0aW9uRmFjdG9yKCk7XG59O1xuXG5wcm90by5hcHBseUZvcmNlID0gZnVuY3Rpb24oIGZvcmNlICkge1xuICB0aGlzLnZlbG9jaXR5ICs9IGZvcmNlO1xufTtcblxucHJvdG8uZ2V0RnJpY3Rpb25GYWN0b3IgPSBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIDEgLSB0aGlzLm9wdGlvbnNbIHRoaXMuaXNGcmVlU2Nyb2xsaW5nID8gJ2ZyZWVTY3JvbGxGcmljdGlvbicgOiAnZnJpY3Rpb24nIF07XG59O1xuXG5wcm90by5nZXRSZXN0aW5nUG9zaXRpb24gPSBmdW5jdGlvbigpIHtcbiAgLy8gbXkgdGhhbmtzIHRvIFN0ZXZlbiBXaXR0ZW5zLCB3aG8gc2ltcGxpZmllZCB0aGlzIG1hdGggZ3JlYXRseVxuICByZXR1cm4gdGhpcy54ICsgdGhpcy52ZWxvY2l0eSAvICggMSAtIHRoaXMuZ2V0RnJpY3Rpb25GYWN0b3IoKSApO1xufTtcblxucHJvdG8uYXBwbHlEcmFnRm9yY2UgPSBmdW5jdGlvbigpIHtcbiAgaWYgKCAhdGhpcy5pc0RyYWdnYWJsZSB8fCAhdGhpcy5pc1BvaW50ZXJEb3duICkge1xuICAgIHJldHVybjtcbiAgfVxuICAvLyBjaGFuZ2UgdGhlIHBvc2l0aW9uIHRvIGRyYWcgcG9zaXRpb24gYnkgYXBwbHlpbmcgZm9yY2VcbiAgdmFyIGRyYWdWZWxvY2l0eSA9IHRoaXMuZHJhZ1ggLSB0aGlzLng7XG4gIHZhciBkcmFnRm9yY2UgPSBkcmFnVmVsb2NpdHkgLSB0aGlzLnZlbG9jaXR5O1xuICB0aGlzLmFwcGx5Rm9yY2UoIGRyYWdGb3JjZSApO1xufTtcblxucHJvdG8uYXBwbHlTZWxlY3RlZEF0dHJhY3Rpb24gPSBmdW5jdGlvbigpIHtcbiAgLy8gZG8gbm90IGF0dHJhY3QgaWYgcG9pbnRlciBkb3duIG9yIG5vIHNsaWRlc1xuICB2YXIgZHJhZ0Rvd24gPSB0aGlzLmlzRHJhZ2dhYmxlICYmIHRoaXMuaXNQb2ludGVyRG93bjtcbiAgaWYgKCBkcmFnRG93biB8fCB0aGlzLmlzRnJlZVNjcm9sbGluZyB8fCAhdGhpcy5zbGlkZXMubGVuZ3RoICkge1xuICAgIHJldHVybjtcbiAgfVxuICB2YXIgZGlzdGFuY2UgPSB0aGlzLnNlbGVjdGVkU2xpZGUudGFyZ2V0ICogLTEgLSB0aGlzLng7XG4gIHZhciBmb3JjZSA9IGRpc3RhbmNlICogdGhpcy5vcHRpb25zLnNlbGVjdGVkQXR0cmFjdGlvbjtcbiAgdGhpcy5hcHBseUZvcmNlKCBmb3JjZSApO1xufTtcblxucmV0dXJuIHByb3RvO1xuXG59KSk7XG4iLCIvLyBGbGlja2l0eSBtYWluXG4oIGZ1bmN0aW9uKCB3aW5kb3csIGZhY3RvcnkgKSB7XG4gIC8vIHVuaXZlcnNhbCBtb2R1bGUgZGVmaW5pdGlvblxuICAvKiBqc2hpbnQgc3RyaWN0OiBmYWxzZSAqL1xuICBpZiAoIHR5cGVvZiBkZWZpbmUgPT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kICkge1xuICAgIC8vIEFNRFxuICAgIGRlZmluZSggW1xuICAgICAgJ2V2LWVtaXR0ZXIvZXYtZW1pdHRlcicsXG4gICAgICAnZ2V0LXNpemUvZ2V0LXNpemUnLFxuICAgICAgJ2Zpenp5LXVpLXV0aWxzL3V0aWxzJyxcbiAgICAgICcuL2NlbGwnLFxuICAgICAgJy4vc2xpZGUnLFxuICAgICAgJy4vYW5pbWF0ZSdcbiAgICBdLCBmdW5jdGlvbiggRXZFbWl0dGVyLCBnZXRTaXplLCB1dGlscywgQ2VsbCwgU2xpZGUsIGFuaW1hdGVQcm90b3R5cGUgKSB7XG4gICAgICByZXR1cm4gZmFjdG9yeSggd2luZG93LCBFdkVtaXR0ZXIsIGdldFNpemUsIHV0aWxzLCBDZWxsLCBTbGlkZSwgYW5pbWF0ZVByb3RvdHlwZSApO1xuICAgIH0pO1xuICB9IGVsc2UgaWYgKCB0eXBlb2YgbW9kdWxlID09ICdvYmplY3QnICYmIG1vZHVsZS5leHBvcnRzICkge1xuICAgIC8vIENvbW1vbkpTXG4gICAgbW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KFxuICAgICAgd2luZG93LFxuICAgICAgcmVxdWlyZSgnZXYtZW1pdHRlcicpLFxuICAgICAgcmVxdWlyZSgnZ2V0LXNpemUnKSxcbiAgICAgIHJlcXVpcmUoJ2Zpenp5LXVpLXV0aWxzJyksXG4gICAgICByZXF1aXJlKCcuL2NlbGwnKSxcbiAgICAgIHJlcXVpcmUoJy4vc2xpZGUnKSxcbiAgICAgIHJlcXVpcmUoJy4vYW5pbWF0ZScpXG4gICAgKTtcbiAgfSBlbHNlIHtcbiAgICAvLyBicm93c2VyIGdsb2JhbFxuICAgIHZhciBfRmxpY2tpdHkgPSB3aW5kb3cuRmxpY2tpdHk7XG5cbiAgICB3aW5kb3cuRmxpY2tpdHkgPSBmYWN0b3J5KFxuICAgICAgd2luZG93LFxuICAgICAgd2luZG93LkV2RW1pdHRlcixcbiAgICAgIHdpbmRvdy5nZXRTaXplLFxuICAgICAgd2luZG93LmZpenp5VUlVdGlscyxcbiAgICAgIF9GbGlja2l0eS5DZWxsLFxuICAgICAgX0ZsaWNraXR5LlNsaWRlLFxuICAgICAgX0ZsaWNraXR5LmFuaW1hdGVQcm90b3R5cGVcbiAgICApO1xuICB9XG5cbn0oIHdpbmRvdywgZnVuY3Rpb24gZmFjdG9yeSggd2luZG93LCBFdkVtaXR0ZXIsIGdldFNpemUsXG4gIHV0aWxzLCBDZWxsLCBTbGlkZSwgYW5pbWF0ZVByb3RvdHlwZSApIHtcblxuJ3VzZSBzdHJpY3QnO1xuXG4vLyB2YXJzXG52YXIgalF1ZXJ5ID0gd2luZG93LmpRdWVyeTtcbnZhciBnZXRDb21wdXRlZFN0eWxlID0gd2luZG93LmdldENvbXB1dGVkU3R5bGU7XG52YXIgY29uc29sZSA9IHdpbmRvdy5jb25zb2xlO1xuXG5mdW5jdGlvbiBtb3ZlRWxlbWVudHMoIGVsZW1zLCB0b0VsZW0gKSB7XG4gIGVsZW1zID0gdXRpbHMubWFrZUFycmF5KCBlbGVtcyApO1xuICB3aGlsZSAoIGVsZW1zLmxlbmd0aCApIHtcbiAgICB0b0VsZW0uYXBwZW5kQ2hpbGQoIGVsZW1zLnNoaWZ0KCkgKTtcbiAgfVxufVxuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSBGbGlja2l0eSAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSAvL1xuXG4vLyBnbG9iYWxseSB1bmlxdWUgaWRlbnRpZmllcnNcbnZhciBHVUlEID0gMDtcbi8vIGludGVybmFsIHN0b3JlIG9mIGFsbCBGbGlja2l0eSBpbnRhbmNlc1xudmFyIGluc3RhbmNlcyA9IHt9O1xuXG5mdW5jdGlvbiBGbGlja2l0eSggZWxlbWVudCwgb3B0aW9ucyApIHtcbiAgdmFyIHF1ZXJ5RWxlbWVudCA9IHV0aWxzLmdldFF1ZXJ5RWxlbWVudCggZWxlbWVudCApO1xuICBpZiAoICFxdWVyeUVsZW1lbnQgKSB7XG4gICAgaWYgKCBjb25zb2xlICkge1xuICAgICAgY29uc29sZS5lcnJvciggJ0JhZCBlbGVtZW50IGZvciBGbGlja2l0eTogJyArICggcXVlcnlFbGVtZW50IHx8IGVsZW1lbnQgKSApO1xuICAgIH1cbiAgICByZXR1cm47XG4gIH1cbiAgdGhpcy5lbGVtZW50ID0gcXVlcnlFbGVtZW50O1xuICAvLyBkbyBub3QgaW5pdGlhbGl6ZSB0d2ljZSBvbiBzYW1lIGVsZW1lbnRcbiAgaWYgKCB0aGlzLmVsZW1lbnQuZmxpY2tpdHlHVUlEICkge1xuICAgIHZhciBpbnN0YW5jZSA9IGluc3RhbmNlc1sgdGhpcy5lbGVtZW50LmZsaWNraXR5R1VJRCBdO1xuICAgIGluc3RhbmNlLm9wdGlvbiggb3B0aW9ucyApO1xuICAgIHJldHVybiBpbnN0YW5jZTtcbiAgfVxuXG4gIC8vIGFkZCBqUXVlcnlcbiAgaWYgKCBqUXVlcnkgKSB7XG4gICAgdGhpcy4kZWxlbWVudCA9IGpRdWVyeSggdGhpcy5lbGVtZW50ICk7XG4gIH1cbiAgLy8gb3B0aW9uc1xuICB0aGlzLm9wdGlvbnMgPSB1dGlscy5leHRlbmQoIHt9LCB0aGlzLmNvbnN0cnVjdG9yLmRlZmF1bHRzICk7XG4gIHRoaXMub3B0aW9uKCBvcHRpb25zICk7XG5cbiAgLy8ga2ljayB0aGluZ3Mgb2ZmXG4gIHRoaXMuX2NyZWF0ZSgpO1xufVxuXG5GbGlja2l0eS5kZWZhdWx0cyA9IHtcbiAgYWNjZXNzaWJpbGl0eTogdHJ1ZSxcbiAgLy8gYWRhcHRpdmVIZWlnaHQ6IGZhbHNlLFxuICBjZWxsQWxpZ246ICdjZW50ZXInLFxuICAvLyBjZWxsU2VsZWN0b3I6IHVuZGVmaW5lZCxcbiAgLy8gY29udGFpbjogZmFsc2UsXG4gIGZyZWVTY3JvbGxGcmljdGlvbjogMC4wNzUsIC8vIGZyaWN0aW9uIHdoZW4gZnJlZS1zY3JvbGxpbmdcbiAgZnJpY3Rpb246IDAuMjgsIC8vIGZyaWN0aW9uIHdoZW4gc2VsZWN0aW5nXG4gIG5hbWVzcGFjZUpRdWVyeUV2ZW50czogdHJ1ZSxcbiAgLy8gaW5pdGlhbEluZGV4OiAwLFxuICBwZXJjZW50UG9zaXRpb246IHRydWUsXG4gIHJlc2l6ZTogdHJ1ZSxcbiAgc2VsZWN0ZWRBdHRyYWN0aW9uOiAwLjAyNSxcbiAgc2V0R2FsbGVyeVNpemU6IHRydWVcbiAgLy8gd2F0Y2hDU1M6IGZhbHNlLFxuICAvLyB3cmFwQXJvdW5kOiBmYWxzZVxufTtcblxuLy8gaGFzaCBvZiBtZXRob2RzIHRyaWdnZXJlZCBvbiBfY3JlYXRlKClcbkZsaWNraXR5LmNyZWF0ZU1ldGhvZHMgPSBbXTtcblxudmFyIHByb3RvID0gRmxpY2tpdHkucHJvdG90eXBlO1xuLy8gaW5oZXJpdCBFdmVudEVtaXR0ZXJcbnV0aWxzLmV4dGVuZCggcHJvdG8sIEV2RW1pdHRlci5wcm90b3R5cGUgKTtcblxucHJvdG8uX2NyZWF0ZSA9IGZ1bmN0aW9uKCkge1xuICAvLyBhZGQgaWQgZm9yIEZsaWNraXR5LmRhdGFcbiAgdmFyIGlkID0gdGhpcy5ndWlkID0gKytHVUlEO1xuICB0aGlzLmVsZW1lbnQuZmxpY2tpdHlHVUlEID0gaWQ7IC8vIGV4cGFuZG9cbiAgaW5zdGFuY2VzWyBpZCBdID0gdGhpczsgLy8gYXNzb2NpYXRlIHZpYSBpZFxuICAvLyBpbml0aWFsIHByb3BlcnRpZXNcbiAgdGhpcy5zZWxlY3RlZEluZGV4ID0gMDtcbiAgLy8gaG93IG1hbnkgZnJhbWVzIHNsaWRlciBoYXMgYmVlbiBpbiBzYW1lIHBvc2l0aW9uXG4gIHRoaXMucmVzdGluZ0ZyYW1lcyA9IDA7XG4gIC8vIGluaXRpYWwgcGh5c2ljcyBwcm9wZXJ0aWVzXG4gIHRoaXMueCA9IDA7XG4gIHRoaXMudmVsb2NpdHkgPSAwO1xuICB0aGlzLm9yaWdpblNpZGUgPSB0aGlzLm9wdGlvbnMucmlnaHRUb0xlZnQgPyAncmlnaHQnIDogJ2xlZnQnO1xuICAvLyBjcmVhdGUgdmlld3BvcnQgJiBzbGlkZXJcbiAgdGhpcy52aWV3cG9ydCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICB0aGlzLnZpZXdwb3J0LmNsYXNzTmFtZSA9ICdmbGlja2l0eS12aWV3cG9ydCc7XG4gIHRoaXMuX2NyZWF0ZVNsaWRlcigpO1xuXG4gIGlmICggdGhpcy5vcHRpb25zLnJlc2l6ZSB8fCB0aGlzLm9wdGlvbnMud2F0Y2hDU1MgKSB7XG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoICdyZXNpemUnLCB0aGlzICk7XG4gIH1cblxuICAvLyBhZGQgbGlzdGVuZXJzIGZyb20gb24gb3B0aW9uXG4gIGZvciAoIHZhciBldmVudE5hbWUgaW4gdGhpcy5vcHRpb25zLm9uICkge1xuICAgIHZhciBsaXN0ZW5lciA9IHRoaXMub3B0aW9ucy5vblsgZXZlbnROYW1lIF07XG4gICAgdGhpcy5vbiggZXZlbnROYW1lLCBsaXN0ZW5lciApO1xuICB9XG5cbiAgRmxpY2tpdHkuY3JlYXRlTWV0aG9kcy5mb3JFYWNoKCBmdW5jdGlvbiggbWV0aG9kICkge1xuICAgIHRoaXNbIG1ldGhvZCBdKCk7XG4gIH0sIHRoaXMgKTtcblxuICBpZiAoIHRoaXMub3B0aW9ucy53YXRjaENTUyApIHtcbiAgICB0aGlzLndhdGNoQ1NTKCk7XG4gIH0gZWxzZSB7XG4gICAgdGhpcy5hY3RpdmF0ZSgpO1xuICB9XG5cbn07XG5cbi8qKlxuICogc2V0IG9wdGlvbnNcbiAqIEBwYXJhbSB7T2JqZWN0fSBvcHRzXG4gKi9cbnByb3RvLm9wdGlvbiA9IGZ1bmN0aW9uKCBvcHRzICkge1xuICB1dGlscy5leHRlbmQoIHRoaXMub3B0aW9ucywgb3B0cyApO1xufTtcblxucHJvdG8uYWN0aXZhdGUgPSBmdW5jdGlvbigpIHtcbiAgaWYgKCB0aGlzLmlzQWN0aXZlICkge1xuICAgIHJldHVybjtcbiAgfVxuICB0aGlzLmlzQWN0aXZlID0gdHJ1ZTtcbiAgdGhpcy5lbGVtZW50LmNsYXNzTGlzdC5hZGQoJ2ZsaWNraXR5LWVuYWJsZWQnKTtcbiAgaWYgKCB0aGlzLm9wdGlvbnMucmlnaHRUb0xlZnQgKSB7XG4gICAgdGhpcy5lbGVtZW50LmNsYXNzTGlzdC5hZGQoJ2ZsaWNraXR5LXJ0bCcpO1xuICB9XG5cbiAgdGhpcy5nZXRTaXplKCk7XG4gIC8vIG1vdmUgaW5pdGlhbCBjZWxsIGVsZW1lbnRzIHNvIHRoZXkgY2FuIGJlIGxvYWRlZCBhcyBjZWxsc1xuICB2YXIgY2VsbEVsZW1zID0gdGhpcy5fZmlsdGVyRmluZENlbGxFbGVtZW50cyggdGhpcy5lbGVtZW50LmNoaWxkcmVuICk7XG4gIG1vdmVFbGVtZW50cyggY2VsbEVsZW1zLCB0aGlzLnNsaWRlciApO1xuICB0aGlzLnZpZXdwb3J0LmFwcGVuZENoaWxkKCB0aGlzLnNsaWRlciApO1xuICB0aGlzLmVsZW1lbnQuYXBwZW5kQ2hpbGQoIHRoaXMudmlld3BvcnQgKTtcbiAgLy8gZ2V0IGNlbGxzIGZyb20gY2hpbGRyZW5cbiAgdGhpcy5yZWxvYWRDZWxscygpO1xuXG4gIGlmICggdGhpcy5vcHRpb25zLmFjY2Vzc2liaWxpdHkgKSB7XG4gICAgLy8gYWxsb3cgZWxlbWVudCB0byBmb2N1c2FibGVcbiAgICB0aGlzLmVsZW1lbnQudGFiSW5kZXggPSAwO1xuICAgIC8vIGxpc3RlbiBmb3Iga2V5IHByZXNzZXNcbiAgICB0aGlzLmVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lciggJ2tleWRvd24nLCB0aGlzICk7XG4gIH1cblxuICB0aGlzLmVtaXRFdmVudCgnYWN0aXZhdGUnKTtcbiAgdGhpcy5zZWxlY3RJbml0aWFsSW5kZXgoKTtcbiAgLy8gZmxhZyBmb3IgaW5pdGlhbCBhY3RpdmF0aW9uLCBmb3IgdXNpbmcgaW5pdGlhbEluZGV4XG4gIHRoaXMuaXNJbml0QWN0aXZhdGVkID0gdHJ1ZTtcbiAgLy8gcmVhZHkgZXZlbnQuICM0OTNcbiAgdGhpcy5kaXNwYXRjaEV2ZW50KCdyZWFkeScpO1xufTtcblxuLy8gc2xpZGVyIHBvc2l0aW9ucyB0aGUgY2VsbHNcbnByb3RvLl9jcmVhdGVTbGlkZXIgPSBmdW5jdGlvbigpIHtcbiAgLy8gc2xpZGVyIGVsZW1lbnQgZG9lcyBhbGwgdGhlIHBvc2l0aW9uaW5nXG4gIHZhciBzbGlkZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgc2xpZGVyLmNsYXNzTmFtZSA9ICdmbGlja2l0eS1zbGlkZXInO1xuICBzbGlkZXIuc3R5bGVbIHRoaXMub3JpZ2luU2lkZSBdID0gMDtcbiAgdGhpcy5zbGlkZXIgPSBzbGlkZXI7XG59O1xuXG5wcm90by5fZmlsdGVyRmluZENlbGxFbGVtZW50cyA9IGZ1bmN0aW9uKCBlbGVtcyApIHtcbiAgcmV0dXJuIHV0aWxzLmZpbHRlckZpbmRFbGVtZW50cyggZWxlbXMsIHRoaXMub3B0aW9ucy5jZWxsU2VsZWN0b3IgKTtcbn07XG5cbi8vIGdvZXMgdGhyb3VnaCBhbGwgY2hpbGRyZW5cbnByb3RvLnJlbG9hZENlbGxzID0gZnVuY3Rpb24oKSB7XG4gIC8vIGNvbGxlY3Rpb24gb2YgaXRlbSBlbGVtZW50c1xuICB0aGlzLmNlbGxzID0gdGhpcy5fbWFrZUNlbGxzKCB0aGlzLnNsaWRlci5jaGlsZHJlbiApO1xuICB0aGlzLnBvc2l0aW9uQ2VsbHMoKTtcbiAgdGhpcy5fZ2V0V3JhcFNoaWZ0Q2VsbHMoKTtcbiAgdGhpcy5zZXRHYWxsZXJ5U2l6ZSgpO1xufTtcblxuLyoqXG4gKiB0dXJuIGVsZW1lbnRzIGludG8gRmxpY2tpdHkuQ2VsbHNcbiAqIEBwYXJhbSB7QXJyYXkgb3IgTm9kZUxpc3Qgb3IgSFRNTEVsZW1lbnR9IGVsZW1zXG4gKiBAcmV0dXJucyB7QXJyYXl9IGl0ZW1zIC0gY29sbGVjdGlvbiBvZiBuZXcgRmxpY2tpdHkgQ2VsbHNcbiAqL1xucHJvdG8uX21ha2VDZWxscyA9IGZ1bmN0aW9uKCBlbGVtcyApIHtcbiAgdmFyIGNlbGxFbGVtcyA9IHRoaXMuX2ZpbHRlckZpbmRDZWxsRWxlbWVudHMoIGVsZW1zICk7XG5cbiAgLy8gY3JlYXRlIG5ldyBGbGlja2l0eSBmb3IgY29sbGVjdGlvblxuICB2YXIgY2VsbHMgPSBjZWxsRWxlbXMubWFwKCBmdW5jdGlvbiggY2VsbEVsZW0gKSB7XG4gICAgcmV0dXJuIG5ldyBDZWxsKCBjZWxsRWxlbSwgdGhpcyApO1xuICB9LCB0aGlzICk7XG5cbiAgcmV0dXJuIGNlbGxzO1xufTtcblxucHJvdG8uZ2V0TGFzdENlbGwgPSBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIHRoaXMuY2VsbHNbIHRoaXMuY2VsbHMubGVuZ3RoIC0gMSBdO1xufTtcblxucHJvdG8uZ2V0TGFzdFNsaWRlID0gZnVuY3Rpb24oKSB7XG4gIHJldHVybiB0aGlzLnNsaWRlc1sgdGhpcy5zbGlkZXMubGVuZ3RoIC0gMSBdO1xufTtcblxuLy8gcG9zaXRpb25zIGFsbCBjZWxsc1xucHJvdG8ucG9zaXRpb25DZWxscyA9IGZ1bmN0aW9uKCkge1xuICAvLyBzaXplIGFsbCBjZWxsc1xuICB0aGlzLl9zaXplQ2VsbHMoIHRoaXMuY2VsbHMgKTtcbiAgLy8gcG9zaXRpb24gYWxsIGNlbGxzXG4gIHRoaXMuX3Bvc2l0aW9uQ2VsbHMoIDAgKTtcbn07XG5cbi8qKlxuICogcG9zaXRpb24gY2VydGFpbiBjZWxsc1xuICogQHBhcmFtIHtJbnRlZ2VyfSBpbmRleCAtIHdoaWNoIGNlbGwgdG8gc3RhcnQgd2l0aFxuICovXG5wcm90by5fcG9zaXRpb25DZWxscyA9IGZ1bmN0aW9uKCBpbmRleCApIHtcbiAgaW5kZXggPSBpbmRleCB8fCAwO1xuICAvLyBhbHNvIG1lYXN1cmUgbWF4Q2VsbEhlaWdodFxuICAvLyBzdGFydCAwIGlmIHBvc2l0aW9uaW5nIGFsbCBjZWxsc1xuICB0aGlzLm1heENlbGxIZWlnaHQgPSBpbmRleCA/IHRoaXMubWF4Q2VsbEhlaWdodCB8fCAwIDogMDtcbiAgdmFyIGNlbGxYID0gMDtcbiAgLy8gZ2V0IGNlbGxYXG4gIGlmICggaW5kZXggPiAwICkge1xuICAgIHZhciBzdGFydENlbGwgPSB0aGlzLmNlbGxzWyBpbmRleCAtIDEgXTtcbiAgICBjZWxsWCA9IHN0YXJ0Q2VsbC54ICsgc3RhcnRDZWxsLnNpemUub3V0ZXJXaWR0aDtcbiAgfVxuICB2YXIgbGVuID0gdGhpcy5jZWxscy5sZW5ndGg7XG4gIGZvciAoIHZhciBpPWluZGV4OyBpIDwgbGVuOyBpKysgKSB7XG4gICAgdmFyIGNlbGwgPSB0aGlzLmNlbGxzW2ldO1xuICAgIGNlbGwuc2V0UG9zaXRpb24oIGNlbGxYICk7XG4gICAgY2VsbFggKz0gY2VsbC5zaXplLm91dGVyV2lkdGg7XG4gICAgdGhpcy5tYXhDZWxsSGVpZ2h0ID0gTWF0aC5tYXgoIGNlbGwuc2l6ZS5vdXRlckhlaWdodCwgdGhpcy5tYXhDZWxsSGVpZ2h0ICk7XG4gIH1cbiAgLy8ga2VlcCB0cmFjayBvZiBjZWxsWCBmb3Igd3JhcC1hcm91bmRcbiAgdGhpcy5zbGlkZWFibGVXaWR0aCA9IGNlbGxYO1xuICAvLyBzbGlkZXNcbiAgdGhpcy51cGRhdGVTbGlkZXMoKTtcbiAgLy8gY29udGFpbiBzbGlkZXMgdGFyZ2V0XG4gIHRoaXMuX2NvbnRhaW5TbGlkZXMoKTtcbiAgLy8gdXBkYXRlIHNsaWRlc1dpZHRoXG4gIHRoaXMuc2xpZGVzV2lkdGggPSBsZW4gPyB0aGlzLmdldExhc3RTbGlkZSgpLnRhcmdldCAtIHRoaXMuc2xpZGVzWzBdLnRhcmdldCA6IDA7XG59O1xuXG4vKipcbiAqIGNlbGwuZ2V0U2l6ZSgpIG9uIG11bHRpcGxlIGNlbGxzXG4gKiBAcGFyYW0ge0FycmF5fSBjZWxsc1xuICovXG5wcm90by5fc2l6ZUNlbGxzID0gZnVuY3Rpb24oIGNlbGxzICkge1xuICBjZWxscy5mb3JFYWNoKCBmdW5jdGlvbiggY2VsbCApIHtcbiAgICBjZWxsLmdldFNpemUoKTtcbiAgfSk7XG59O1xuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSAgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gLy9cblxucHJvdG8udXBkYXRlU2xpZGVzID0gZnVuY3Rpb24oKSB7XG4gIHRoaXMuc2xpZGVzID0gW107XG4gIGlmICggIXRoaXMuY2VsbHMubGVuZ3RoICkge1xuICAgIHJldHVybjtcbiAgfVxuXG4gIHZhciBzbGlkZSA9IG5ldyBTbGlkZSggdGhpcyApO1xuICB0aGlzLnNsaWRlcy5wdXNoKCBzbGlkZSApO1xuICB2YXIgaXNPcmlnaW5MZWZ0ID0gdGhpcy5vcmlnaW5TaWRlID09ICdsZWZ0JztcbiAgdmFyIG5leHRNYXJnaW4gPSBpc09yaWdpbkxlZnQgPyAnbWFyZ2luUmlnaHQnIDogJ21hcmdpbkxlZnQnO1xuXG4gIHZhciBjYW5DZWxsRml0ID0gdGhpcy5fZ2V0Q2FuQ2VsbEZpdCgpO1xuXG4gIHRoaXMuY2VsbHMuZm9yRWFjaCggZnVuY3Rpb24oIGNlbGwsIGkgKSB7XG4gICAgLy8ganVzdCBhZGQgY2VsbCBpZiBmaXJzdCBjZWxsIGluIHNsaWRlXG4gICAgaWYgKCAhc2xpZGUuY2VsbHMubGVuZ3RoICkge1xuICAgICAgc2xpZGUuYWRkQ2VsbCggY2VsbCApO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHZhciBzbGlkZVdpZHRoID0gKCBzbGlkZS5vdXRlcldpZHRoIC0gc2xpZGUuZmlyc3RNYXJnaW4gKSArXG4gICAgICAoIGNlbGwuc2l6ZS5vdXRlcldpZHRoIC0gY2VsbC5zaXplWyBuZXh0TWFyZ2luIF0gKTtcblxuICAgIGlmICggY2FuQ2VsbEZpdC5jYWxsKCB0aGlzLCBpLCBzbGlkZVdpZHRoICkgKSB7XG4gICAgICBzbGlkZS5hZGRDZWxsKCBjZWxsICk7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIGRvZXNuJ3QgZml0LCBuZXcgc2xpZGVcbiAgICAgIHNsaWRlLnVwZGF0ZVRhcmdldCgpO1xuXG4gICAgICBzbGlkZSA9IG5ldyBTbGlkZSggdGhpcyApO1xuICAgICAgdGhpcy5zbGlkZXMucHVzaCggc2xpZGUgKTtcbiAgICAgIHNsaWRlLmFkZENlbGwoIGNlbGwgKTtcbiAgICB9XG4gIH0sIHRoaXMgKTtcbiAgLy8gbGFzdCBzbGlkZVxuICBzbGlkZS51cGRhdGVUYXJnZXQoKTtcbiAgLy8gdXBkYXRlIC5zZWxlY3RlZFNsaWRlXG4gIHRoaXMudXBkYXRlU2VsZWN0ZWRTbGlkZSgpO1xufTtcblxucHJvdG8uX2dldENhbkNlbGxGaXQgPSBmdW5jdGlvbigpIHtcbiAgdmFyIGdyb3VwQ2VsbHMgPSB0aGlzLm9wdGlvbnMuZ3JvdXBDZWxscztcbiAgaWYgKCAhZ3JvdXBDZWxscyApIHtcbiAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfTtcbiAgfSBlbHNlIGlmICggdHlwZW9mIGdyb3VwQ2VsbHMgPT0gJ251bWJlcicgKSB7XG4gICAgLy8gZ3JvdXAgYnkgbnVtYmVyLiAzIC0+IFswLDEsMl0sIFszLDQsNV0sIC4uLlxuICAgIHZhciBudW1iZXIgPSBwYXJzZUludCggZ3JvdXBDZWxscywgMTAgKTtcbiAgICByZXR1cm4gZnVuY3Rpb24oIGkgKSB7XG4gICAgICByZXR1cm4gKCBpICUgbnVtYmVyICkgIT09IDA7XG4gICAgfTtcbiAgfVxuICAvLyBkZWZhdWx0LCBncm91cCBieSB3aWR0aCBvZiBzbGlkZVxuICAvLyBwYXJzZSAnNzUlXG4gIHZhciBwZXJjZW50TWF0Y2ggPSB0eXBlb2YgZ3JvdXBDZWxscyA9PSAnc3RyaW5nJyAmJlxuICAgIGdyb3VwQ2VsbHMubWF0Y2goL14oXFxkKyklJC8pO1xuICB2YXIgcGVyY2VudCA9IHBlcmNlbnRNYXRjaCA/IHBhcnNlSW50KCBwZXJjZW50TWF0Y2hbMV0sIDEwICkgLyAxMDAgOiAxO1xuICByZXR1cm4gZnVuY3Rpb24oIGksIHNsaWRlV2lkdGggKSB7XG4gICAgcmV0dXJuIHNsaWRlV2lkdGggPD0gKCB0aGlzLnNpemUuaW5uZXJXaWR0aCArIDEgKSAqIHBlcmNlbnQ7XG4gIH07XG59O1xuXG4vLyBhbGlhcyBfaW5pdCBmb3IgalF1ZXJ5IHBsdWdpbiAuZmxpY2tpdHkoKVxucHJvdG8uX2luaXQgPVxucHJvdG8ucmVwb3NpdGlvbiA9IGZ1bmN0aW9uKCkge1xuICB0aGlzLnBvc2l0aW9uQ2VsbHMoKTtcbiAgdGhpcy5wb3NpdGlvblNsaWRlckF0U2VsZWN0ZWQoKTtcbn07XG5cbnByb3RvLmdldFNpemUgPSBmdW5jdGlvbigpIHtcbiAgdGhpcy5zaXplID0gZ2V0U2l6ZSggdGhpcy5lbGVtZW50ICk7XG4gIHRoaXMuc2V0Q2VsbEFsaWduKCk7XG4gIHRoaXMuY3Vyc29yUG9zaXRpb24gPSB0aGlzLnNpemUuaW5uZXJXaWR0aCAqIHRoaXMuY2VsbEFsaWduO1xufTtcblxudmFyIGNlbGxBbGlnblNob3J0aGFuZHMgPSB7XG4gIC8vIGNlbGwgYWxpZ24sIHRoZW4gYmFzZWQgb24gb3JpZ2luIHNpZGVcbiAgY2VudGVyOiB7XG4gICAgbGVmdDogMC41LFxuICAgIHJpZ2h0OiAwLjVcbiAgfSxcbiAgbGVmdDoge1xuICAgIGxlZnQ6IDAsXG4gICAgcmlnaHQ6IDFcbiAgfSxcbiAgcmlnaHQ6IHtcbiAgICByaWdodDogMCxcbiAgICBsZWZ0OiAxXG4gIH1cbn07XG5cbnByb3RvLnNldENlbGxBbGlnbiA9IGZ1bmN0aW9uKCkge1xuICB2YXIgc2hvcnRoYW5kID0gY2VsbEFsaWduU2hvcnRoYW5kc1sgdGhpcy5vcHRpb25zLmNlbGxBbGlnbiBdO1xuICB0aGlzLmNlbGxBbGlnbiA9IHNob3J0aGFuZCA/IHNob3J0aGFuZFsgdGhpcy5vcmlnaW5TaWRlIF0gOiB0aGlzLm9wdGlvbnMuY2VsbEFsaWduO1xufTtcblxucHJvdG8uc2V0R2FsbGVyeVNpemUgPSBmdW5jdGlvbigpIHtcbiAgaWYgKCB0aGlzLm9wdGlvbnMuc2V0R2FsbGVyeVNpemUgKSB7XG4gICAgdmFyIGhlaWdodCA9IHRoaXMub3B0aW9ucy5hZGFwdGl2ZUhlaWdodCAmJiB0aGlzLnNlbGVjdGVkU2xpZGUgP1xuICAgICAgdGhpcy5zZWxlY3RlZFNsaWRlLmhlaWdodCA6IHRoaXMubWF4Q2VsbEhlaWdodDtcbiAgICB0aGlzLnZpZXdwb3J0LnN0eWxlLmhlaWdodCA9IGhlaWdodCArICdweCc7XG4gIH1cbn07XG5cbnByb3RvLl9nZXRXcmFwU2hpZnRDZWxscyA9IGZ1bmN0aW9uKCkge1xuICAvLyBvbmx5IGZvciB3cmFwLWFyb3VuZFxuICBpZiAoICF0aGlzLm9wdGlvbnMud3JhcEFyb3VuZCApIHtcbiAgICByZXR1cm47XG4gIH1cbiAgLy8gdW5zaGlmdCBwcmV2aW91cyBjZWxsc1xuICB0aGlzLl91bnNoaWZ0Q2VsbHMoIHRoaXMuYmVmb3JlU2hpZnRDZWxscyApO1xuICB0aGlzLl91bnNoaWZ0Q2VsbHMoIHRoaXMuYWZ0ZXJTaGlmdENlbGxzICk7XG4gIC8vIGdldCBiZWZvcmUgY2VsbHNcbiAgLy8gaW5pdGlhbCBnYXBcbiAgdmFyIGdhcFggPSB0aGlzLmN1cnNvclBvc2l0aW9uO1xuICB2YXIgY2VsbEluZGV4ID0gdGhpcy5jZWxscy5sZW5ndGggLSAxO1xuICB0aGlzLmJlZm9yZVNoaWZ0Q2VsbHMgPSB0aGlzLl9nZXRHYXBDZWxscyggZ2FwWCwgY2VsbEluZGV4LCAtMSApO1xuICAvLyBnZXQgYWZ0ZXIgY2VsbHNcbiAgLy8gZW5kaW5nIGdhcCBiZXR3ZWVuIGxhc3QgY2VsbCBhbmQgZW5kIG9mIGdhbGxlcnkgdmlld3BvcnRcbiAgZ2FwWCA9IHRoaXMuc2l6ZS5pbm5lcldpZHRoIC0gdGhpcy5jdXJzb3JQb3NpdGlvbjtcbiAgLy8gc3RhcnQgY2xvbmluZyBhdCBmaXJzdCBjZWxsLCB3b3JraW5nIGZvcndhcmRzXG4gIHRoaXMuYWZ0ZXJTaGlmdENlbGxzID0gdGhpcy5fZ2V0R2FwQ2VsbHMoIGdhcFgsIDAsIDEgKTtcbn07XG5cbnByb3RvLl9nZXRHYXBDZWxscyA9IGZ1bmN0aW9uKCBnYXBYLCBjZWxsSW5kZXgsIGluY3JlbWVudCApIHtcbiAgLy8ga2VlcCBhZGRpbmcgY2VsbHMgdW50aWwgdGhlIGNvdmVyIHRoZSBpbml0aWFsIGdhcFxuICB2YXIgY2VsbHMgPSBbXTtcbiAgd2hpbGUgKCBnYXBYID4gMCApIHtcbiAgICB2YXIgY2VsbCA9IHRoaXMuY2VsbHNbIGNlbGxJbmRleCBdO1xuICAgIGlmICggIWNlbGwgKSB7XG4gICAgICBicmVhaztcbiAgICB9XG4gICAgY2VsbHMucHVzaCggY2VsbCApO1xuICAgIGNlbGxJbmRleCArPSBpbmNyZW1lbnQ7XG4gICAgZ2FwWCAtPSBjZWxsLnNpemUub3V0ZXJXaWR0aDtcbiAgfVxuICByZXR1cm4gY2VsbHM7XG59O1xuXG4vLyAtLS0tLSBjb250YWluIC0tLS0tIC8vXG5cbi8vIGNvbnRhaW4gY2VsbCB0YXJnZXRzIHNvIG5vIGV4Y2VzcyBzbGlkaW5nXG5wcm90by5fY29udGFpblNsaWRlcyA9IGZ1bmN0aW9uKCkge1xuICBpZiAoICF0aGlzLm9wdGlvbnMuY29udGFpbiB8fCB0aGlzLm9wdGlvbnMud3JhcEFyb3VuZCB8fCAhdGhpcy5jZWxscy5sZW5ndGggKSB7XG4gICAgcmV0dXJuO1xuICB9XG4gIHZhciBpc1JpZ2h0VG9MZWZ0ID0gdGhpcy5vcHRpb25zLnJpZ2h0VG9MZWZ0O1xuICB2YXIgYmVnaW5NYXJnaW4gPSBpc1JpZ2h0VG9MZWZ0ID8gJ21hcmdpblJpZ2h0JyA6ICdtYXJnaW5MZWZ0JztcbiAgdmFyIGVuZE1hcmdpbiA9IGlzUmlnaHRUb0xlZnQgPyAnbWFyZ2luTGVmdCcgOiAnbWFyZ2luUmlnaHQnO1xuICB2YXIgY29udGVudFdpZHRoID0gdGhpcy5zbGlkZWFibGVXaWR0aCAtIHRoaXMuZ2V0TGFzdENlbGwoKS5zaXplWyBlbmRNYXJnaW4gXTtcbiAgLy8gY29udGVudCBpcyBsZXNzIHRoYW4gZ2FsbGVyeSBzaXplXG4gIHZhciBpc0NvbnRlbnRTbWFsbGVyID0gY29udGVudFdpZHRoIDwgdGhpcy5zaXplLmlubmVyV2lkdGg7XG4gIC8vIGJvdW5kc1xuICB2YXIgYmVnaW5Cb3VuZCA9IHRoaXMuY3Vyc29yUG9zaXRpb24gKyB0aGlzLmNlbGxzWzBdLnNpemVbIGJlZ2luTWFyZ2luIF07XG4gIHZhciBlbmRCb3VuZCA9IGNvbnRlbnRXaWR0aCAtIHRoaXMuc2l6ZS5pbm5lcldpZHRoICogKCAxIC0gdGhpcy5jZWxsQWxpZ24gKTtcbiAgLy8gY29udGFpbiBlYWNoIGNlbGwgdGFyZ2V0XG4gIHRoaXMuc2xpZGVzLmZvckVhY2goIGZ1bmN0aW9uKCBzbGlkZSApIHtcbiAgICBpZiAoIGlzQ29udGVudFNtYWxsZXIgKSB7XG4gICAgICAvLyBhbGwgY2VsbHMgZml0IGluc2lkZSBnYWxsZXJ5XG4gICAgICBzbGlkZS50YXJnZXQgPSBjb250ZW50V2lkdGggKiB0aGlzLmNlbGxBbGlnbjtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gY29udGFpbiB0byBib3VuZHNcbiAgICAgIHNsaWRlLnRhcmdldCA9IE1hdGgubWF4KCBzbGlkZS50YXJnZXQsIGJlZ2luQm91bmQgKTtcbiAgICAgIHNsaWRlLnRhcmdldCA9IE1hdGgubWluKCBzbGlkZS50YXJnZXQsIGVuZEJvdW5kICk7XG4gICAgfVxuICB9LCB0aGlzICk7XG59O1xuXG4vLyAtLS0tLSAgLS0tLS0gLy9cblxuLyoqXG4gKiBlbWl0cyBldmVudHMgdmlhIGV2ZW50RW1pdHRlciBhbmQgalF1ZXJ5IGV2ZW50c1xuICogQHBhcmFtIHtTdHJpbmd9IHR5cGUgLSBuYW1lIG9mIGV2ZW50XG4gKiBAcGFyYW0ge0V2ZW50fSBldmVudCAtIG9yaWdpbmFsIGV2ZW50XG4gKiBAcGFyYW0ge0FycmF5fSBhcmdzIC0gZXh0cmEgYXJndW1lbnRzXG4gKi9cbnByb3RvLmRpc3BhdGNoRXZlbnQgPSBmdW5jdGlvbiggdHlwZSwgZXZlbnQsIGFyZ3MgKSB7XG4gIHZhciBlbWl0QXJncyA9IGV2ZW50ID8gWyBldmVudCBdLmNvbmNhdCggYXJncyApIDogYXJncztcbiAgdGhpcy5lbWl0RXZlbnQoIHR5cGUsIGVtaXRBcmdzICk7XG5cbiAgaWYgKCBqUXVlcnkgJiYgdGhpcy4kZWxlbWVudCApIHtcbiAgICAvLyBkZWZhdWx0IHRyaWdnZXIgd2l0aCB0eXBlIGlmIG5vIGV2ZW50XG4gICAgdHlwZSArPSB0aGlzLm9wdGlvbnMubmFtZXNwYWNlSlF1ZXJ5RXZlbnRzID8gJy5mbGlja2l0eScgOiAnJztcbiAgICB2YXIgJGV2ZW50ID0gdHlwZTtcbiAgICBpZiAoIGV2ZW50ICkge1xuICAgICAgLy8gY3JlYXRlIGpRdWVyeSBldmVudFxuICAgICAgdmFyIGpRRXZlbnQgPSBqUXVlcnkuRXZlbnQoIGV2ZW50ICk7XG4gICAgICBqUUV2ZW50LnR5cGUgPSB0eXBlO1xuICAgICAgJGV2ZW50ID0galFFdmVudDtcbiAgICB9XG4gICAgdGhpcy4kZWxlbWVudC50cmlnZ2VyKCAkZXZlbnQsIGFyZ3MgKTtcbiAgfVxufTtcblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gc2VsZWN0IC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIC8vXG5cbi8qKlxuICogQHBhcmFtIHtJbnRlZ2VyfSBpbmRleCAtIGluZGV4IG9mIHRoZSBzbGlkZVxuICogQHBhcmFtIHtCb29sZWFufSBpc1dyYXAgLSB3aWxsIHdyYXAtYXJvdW5kIHRvIGxhc3QvZmlyc3QgaWYgYXQgdGhlIGVuZFxuICogQHBhcmFtIHtCb29sZWFufSBpc0luc3RhbnQgLSB3aWxsIGltbWVkaWF0ZWx5IHNldCBwb3NpdGlvbiBhdCBzZWxlY3RlZCBjZWxsXG4gKi9cbnByb3RvLnNlbGVjdCA9IGZ1bmN0aW9uKCBpbmRleCwgaXNXcmFwLCBpc0luc3RhbnQgKSB7XG4gIGlmICggIXRoaXMuaXNBY3RpdmUgKSB7XG4gICAgcmV0dXJuO1xuICB9XG4gIGluZGV4ID0gcGFyc2VJbnQoIGluZGV4LCAxMCApO1xuICB0aGlzLl93cmFwU2VsZWN0KCBpbmRleCApO1xuXG4gIGlmICggdGhpcy5vcHRpb25zLndyYXBBcm91bmQgfHwgaXNXcmFwICkge1xuICAgIGluZGV4ID0gdXRpbHMubW9kdWxvKCBpbmRleCwgdGhpcy5zbGlkZXMubGVuZ3RoICk7XG4gIH1cbiAgLy8gYmFpbCBpZiBpbnZhbGlkIGluZGV4XG4gIGlmICggIXRoaXMuc2xpZGVzWyBpbmRleCBdICkge1xuICAgIHJldHVybjtcbiAgfVxuICB2YXIgcHJldkluZGV4ID0gdGhpcy5zZWxlY3RlZEluZGV4O1xuICB0aGlzLnNlbGVjdGVkSW5kZXggPSBpbmRleDtcbiAgdGhpcy51cGRhdGVTZWxlY3RlZFNsaWRlKCk7XG4gIGlmICggaXNJbnN0YW50ICkge1xuICAgIHRoaXMucG9zaXRpb25TbGlkZXJBdFNlbGVjdGVkKCk7XG4gIH0gZWxzZSB7XG4gICAgdGhpcy5zdGFydEFuaW1hdGlvbigpO1xuICB9XG4gIGlmICggdGhpcy5vcHRpb25zLmFkYXB0aXZlSGVpZ2h0ICkge1xuICAgIHRoaXMuc2V0R2FsbGVyeVNpemUoKTtcbiAgfVxuICAvLyBldmVudHNcbiAgdGhpcy5kaXNwYXRjaEV2ZW50KCAnc2VsZWN0JywgbnVsbCwgWyBpbmRleCBdICk7XG4gIC8vIGNoYW5nZSBldmVudCBpZiBuZXcgaW5kZXhcbiAgaWYgKCBpbmRleCAhPSBwcmV2SW5kZXggKSB7XG4gICAgdGhpcy5kaXNwYXRjaEV2ZW50KCAnY2hhbmdlJywgbnVsbCwgWyBpbmRleCBdICk7XG4gIH1cbiAgLy8gb2xkIHYxIGV2ZW50IG5hbWUsIHJlbW92ZSBpbiB2M1xuICB0aGlzLmRpc3BhdGNoRXZlbnQoJ2NlbGxTZWxlY3QnKTtcbn07XG5cbi8vIHdyYXBzIHBvc2l0aW9uIGZvciB3cmFwQXJvdW5kLCB0byBtb3ZlIHRvIGNsb3Nlc3Qgc2xpZGUuICMxMTNcbnByb3RvLl93cmFwU2VsZWN0ID0gZnVuY3Rpb24oIGluZGV4ICkge1xuICB2YXIgbGVuID0gdGhpcy5zbGlkZXMubGVuZ3RoO1xuICB2YXIgaXNXcmFwcGluZyA9IHRoaXMub3B0aW9ucy53cmFwQXJvdW5kICYmIGxlbiA+IDE7XG4gIGlmICggIWlzV3JhcHBpbmcgKSB7XG4gICAgcmV0dXJuIGluZGV4O1xuICB9XG4gIHZhciB3cmFwSW5kZXggPSB1dGlscy5tb2R1bG8oIGluZGV4LCBsZW4gKTtcbiAgLy8gZ28gdG8gc2hvcnRlc3RcbiAgdmFyIGRlbHRhID0gTWF0aC5hYnMoIHdyYXBJbmRleCAtIHRoaXMuc2VsZWN0ZWRJbmRleCApO1xuICB2YXIgYmFja1dyYXBEZWx0YSA9IE1hdGguYWJzKCAoIHdyYXBJbmRleCArIGxlbiApIC0gdGhpcy5zZWxlY3RlZEluZGV4ICk7XG4gIHZhciBmb3Jld2FyZFdyYXBEZWx0YSA9IE1hdGguYWJzKCAoIHdyYXBJbmRleCAtIGxlbiApIC0gdGhpcy5zZWxlY3RlZEluZGV4ICk7XG4gIGlmICggIXRoaXMuaXNEcmFnU2VsZWN0ICYmIGJhY2tXcmFwRGVsdGEgPCBkZWx0YSApIHtcbiAgICBpbmRleCArPSBsZW47XG4gIH0gZWxzZSBpZiAoICF0aGlzLmlzRHJhZ1NlbGVjdCAmJiBmb3Jld2FyZFdyYXBEZWx0YSA8IGRlbHRhICkge1xuICAgIGluZGV4IC09IGxlbjtcbiAgfVxuICAvLyB3cmFwIHBvc2l0aW9uIHNvIHNsaWRlciBpcyB3aXRoaW4gbm9ybWFsIGFyZWFcbiAgaWYgKCBpbmRleCA8IDAgKSB7XG4gICAgdGhpcy54IC09IHRoaXMuc2xpZGVhYmxlV2lkdGg7XG4gIH0gZWxzZSBpZiAoIGluZGV4ID49IGxlbiApIHtcbiAgICB0aGlzLnggKz0gdGhpcy5zbGlkZWFibGVXaWR0aDtcbiAgfVxufTtcblxucHJvdG8ucHJldmlvdXMgPSBmdW5jdGlvbiggaXNXcmFwLCBpc0luc3RhbnQgKSB7XG4gIHRoaXMuc2VsZWN0KCB0aGlzLnNlbGVjdGVkSW5kZXggLSAxLCBpc1dyYXAsIGlzSW5zdGFudCApO1xufTtcblxucHJvdG8ubmV4dCA9IGZ1bmN0aW9uKCBpc1dyYXAsIGlzSW5zdGFudCApIHtcbiAgdGhpcy5zZWxlY3QoIHRoaXMuc2VsZWN0ZWRJbmRleCArIDEsIGlzV3JhcCwgaXNJbnN0YW50ICk7XG59O1xuXG5wcm90by51cGRhdGVTZWxlY3RlZFNsaWRlID0gZnVuY3Rpb24oKSB7XG4gIHZhciBzbGlkZSA9IHRoaXMuc2xpZGVzWyB0aGlzLnNlbGVjdGVkSW5kZXggXTtcbiAgLy8gc2VsZWN0ZWRJbmRleCBjb3VsZCBiZSBvdXRzaWRlIG9mIHNsaWRlcywgaWYgdHJpZ2dlcmVkIGJlZm9yZSByZXNpemUoKVxuICBpZiAoICFzbGlkZSApIHtcbiAgICByZXR1cm47XG4gIH1cbiAgLy8gdW5zZWxlY3QgcHJldmlvdXMgc2VsZWN0ZWQgc2xpZGVcbiAgdGhpcy51bnNlbGVjdFNlbGVjdGVkU2xpZGUoKTtcbiAgLy8gdXBkYXRlIG5ldyBzZWxlY3RlZCBzbGlkZVxuICB0aGlzLnNlbGVjdGVkU2xpZGUgPSBzbGlkZTtcbiAgc2xpZGUuc2VsZWN0KCk7XG4gIHRoaXMuc2VsZWN0ZWRDZWxscyA9IHNsaWRlLmNlbGxzO1xuICB0aGlzLnNlbGVjdGVkRWxlbWVudHMgPSBzbGlkZS5nZXRDZWxsRWxlbWVudHMoKTtcbiAgLy8gSEFDSzogc2VsZWN0ZWRDZWxsICYgc2VsZWN0ZWRFbGVtZW50IGlzIGZpcnN0IGNlbGwgaW4gc2xpZGUsIGJhY2t3YXJkcyBjb21wYXRpYmlsaXR5XG4gIC8vIFJlbW92ZSBpbiB2Mz9cbiAgdGhpcy5zZWxlY3RlZENlbGwgPSBzbGlkZS5jZWxsc1swXTtcbiAgdGhpcy5zZWxlY3RlZEVsZW1lbnQgPSB0aGlzLnNlbGVjdGVkRWxlbWVudHNbMF07XG59O1xuXG5wcm90by51bnNlbGVjdFNlbGVjdGVkU2xpZGUgPSBmdW5jdGlvbigpIHtcbiAgaWYgKCB0aGlzLnNlbGVjdGVkU2xpZGUgKSB7XG4gICAgdGhpcy5zZWxlY3RlZFNsaWRlLnVuc2VsZWN0KCk7XG4gIH1cbn07XG5cbnByb3RvLnNlbGVjdEluaXRpYWxJbmRleCA9IGZ1bmN0aW9uKCkge1xuICB2YXIgaW5pdGlhbEluZGV4ID0gdGhpcy5vcHRpb25zLmluaXRpYWxJbmRleDtcbiAgLy8gYWxyZWFkeSBhY3RpdmF0ZWQsIHNlbGVjdCBwcmV2aW91cyBzZWxlY3RlZEluZGV4XG4gIGlmICggdGhpcy5pc0luaXRBY3RpdmF0ZWQgKSB7XG4gICAgdGhpcy5zZWxlY3QoIHRoaXMuc2VsZWN0ZWRJbmRleCwgZmFsc2UsIHRydWUgKTtcbiAgICByZXR1cm47XG4gIH1cbiAgLy8gc2VsZWN0IHdpdGggc2VsZWN0b3Igc3RyaW5nXG4gIGlmICggaW5pdGlhbEluZGV4ICYmIHR5cGVvZiBpbml0aWFsSW5kZXggPT0gJ3N0cmluZycgKSB7XG4gICAgdmFyIGNlbGwgPSB0aGlzLnF1ZXJ5Q2VsbCggaW5pdGlhbEluZGV4ICk7XG4gICAgaWYgKCBjZWxsICkge1xuICAgICAgdGhpcy5zZWxlY3RDZWxsKCBpbml0aWFsSW5kZXgsIGZhbHNlLCB0cnVlICk7XG4gICAgICByZXR1cm47XG4gICAgfVxuICB9XG5cbiAgdmFyIGluZGV4ID0gMDtcbiAgLy8gc2VsZWN0IHdpdGggbnVtYmVyXG4gIGlmICggaW5pdGlhbEluZGV4ICYmIHRoaXMuc2xpZGVzWyBpbml0aWFsSW5kZXggXSApIHtcbiAgICBpbmRleCA9IGluaXRpYWxJbmRleDtcbiAgfVxuICAvLyBzZWxlY3QgaW5zdGFudGx5XG4gIHRoaXMuc2VsZWN0KCBpbmRleCwgZmFsc2UsIHRydWUgKTtcbn07XG5cbi8qKlxuICogc2VsZWN0IHNsaWRlIGZyb20gbnVtYmVyIG9yIGNlbGwgZWxlbWVudFxuICogQHBhcmFtIHtFbGVtZW50IG9yIE51bWJlcn0gZWxlbVxuICovXG5wcm90by5zZWxlY3RDZWxsID0gZnVuY3Rpb24oIHZhbHVlLCBpc1dyYXAsIGlzSW5zdGFudCApIHtcbiAgLy8gZ2V0IGNlbGxcbiAgdmFyIGNlbGwgPSB0aGlzLnF1ZXJ5Q2VsbCggdmFsdWUgKTtcbiAgaWYgKCAhY2VsbCApIHtcbiAgICByZXR1cm47XG4gIH1cblxuICB2YXIgaW5kZXggPSB0aGlzLmdldENlbGxTbGlkZUluZGV4KCBjZWxsICk7XG4gIHRoaXMuc2VsZWN0KCBpbmRleCwgaXNXcmFwLCBpc0luc3RhbnQgKTtcbn07XG5cbnByb3RvLmdldENlbGxTbGlkZUluZGV4ID0gZnVuY3Rpb24oIGNlbGwgKSB7XG4gIC8vIGdldCBpbmRleCBvZiBzbGlkZXMgdGhhdCBoYXMgY2VsbFxuICBmb3IgKCB2YXIgaT0wOyBpIDwgdGhpcy5zbGlkZXMubGVuZ3RoOyBpKysgKSB7XG4gICAgdmFyIHNsaWRlID0gdGhpcy5zbGlkZXNbaV07XG4gICAgdmFyIGluZGV4ID0gc2xpZGUuY2VsbHMuaW5kZXhPZiggY2VsbCApO1xuICAgIGlmICggaW5kZXggIT0gLTEgKSB7XG4gICAgICByZXR1cm4gaTtcbiAgICB9XG4gIH1cbn07XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIGdldCBjZWxscyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSAvL1xuXG4vKipcbiAqIGdldCBGbGlja2l0eS5DZWxsLCBnaXZlbiBhbiBFbGVtZW50XG4gKiBAcGFyYW0ge0VsZW1lbnR9IGVsZW1cbiAqIEByZXR1cm5zIHtGbGlja2l0eS5DZWxsfSBpdGVtXG4gKi9cbnByb3RvLmdldENlbGwgPSBmdW5jdGlvbiggZWxlbSApIHtcbiAgLy8gbG9vcCB0aHJvdWdoIGNlbGxzIHRvIGdldCB0aGUgb25lIHRoYXQgbWF0Y2hlc1xuICBmb3IgKCB2YXIgaT0wOyBpIDwgdGhpcy5jZWxscy5sZW5ndGg7IGkrKyApIHtcbiAgICB2YXIgY2VsbCA9IHRoaXMuY2VsbHNbaV07XG4gICAgaWYgKCBjZWxsLmVsZW1lbnQgPT0gZWxlbSApIHtcbiAgICAgIHJldHVybiBjZWxsO1xuICAgIH1cbiAgfVxufTtcblxuLyoqXG4gKiBnZXQgY29sbGVjdGlvbiBvZiBGbGlja2l0eS5DZWxscywgZ2l2ZW4gRWxlbWVudHNcbiAqIEBwYXJhbSB7RWxlbWVudCwgQXJyYXksIE5vZGVMaXN0fSBlbGVtc1xuICogQHJldHVybnMge0FycmF5fSBjZWxscyAtIEZsaWNraXR5LkNlbGxzXG4gKi9cbnByb3RvLmdldENlbGxzID0gZnVuY3Rpb24oIGVsZW1zICkge1xuICBlbGVtcyA9IHV0aWxzLm1ha2VBcnJheSggZWxlbXMgKTtcbiAgdmFyIGNlbGxzID0gW107XG4gIGVsZW1zLmZvckVhY2goIGZ1bmN0aW9uKCBlbGVtICkge1xuICAgIHZhciBjZWxsID0gdGhpcy5nZXRDZWxsKCBlbGVtICk7XG4gICAgaWYgKCBjZWxsICkge1xuICAgICAgY2VsbHMucHVzaCggY2VsbCApO1xuICAgIH1cbiAgfSwgdGhpcyApO1xuICByZXR1cm4gY2VsbHM7XG59O1xuXG4vKipcbiAqIGdldCBjZWxsIGVsZW1lbnRzXG4gKiBAcmV0dXJucyB7QXJyYXl9IGNlbGxFbGVtc1xuICovXG5wcm90by5nZXRDZWxsRWxlbWVudHMgPSBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIHRoaXMuY2VsbHMubWFwKCBmdW5jdGlvbiggY2VsbCApIHtcbiAgICByZXR1cm4gY2VsbC5lbGVtZW50O1xuICB9KTtcbn07XG5cbi8qKlxuICogZ2V0IHBhcmVudCBjZWxsIGZyb20gYW4gZWxlbWVudFxuICogQHBhcmFtIHtFbGVtZW50fSBlbGVtXG4gKiBAcmV0dXJucyB7RmxpY2tpdC5DZWxsfSBjZWxsXG4gKi9cbnByb3RvLmdldFBhcmVudENlbGwgPSBmdW5jdGlvbiggZWxlbSApIHtcbiAgLy8gZmlyc3QgY2hlY2sgaWYgZWxlbSBpcyBjZWxsXG4gIHZhciBjZWxsID0gdGhpcy5nZXRDZWxsKCBlbGVtICk7XG4gIGlmICggY2VsbCApIHtcbiAgICByZXR1cm4gY2VsbDtcbiAgfVxuICAvLyB0cnkgdG8gZ2V0IHBhcmVudCBjZWxsIGVsZW1cbiAgZWxlbSA9IHV0aWxzLmdldFBhcmVudCggZWxlbSwgJy5mbGlja2l0eS1zbGlkZXIgPiAqJyApO1xuICByZXR1cm4gdGhpcy5nZXRDZWxsKCBlbGVtICk7XG59O1xuXG4vKipcbiAqIGdldCBjZWxscyBhZGphY2VudCB0byBhIHNsaWRlXG4gKiBAcGFyYW0ge0ludGVnZXJ9IGFkakNvdW50IC0gbnVtYmVyIG9mIGFkamFjZW50IHNsaWRlc1xuICogQHBhcmFtIHtJbnRlZ2VyfSBpbmRleCAtIGluZGV4IG9mIHNsaWRlIHRvIHN0YXJ0XG4gKiBAcmV0dXJucyB7QXJyYXl9IGNlbGxzIC0gYXJyYXkgb2YgRmxpY2tpdHkuQ2VsbHNcbiAqL1xucHJvdG8uZ2V0QWRqYWNlbnRDZWxsRWxlbWVudHMgPSBmdW5jdGlvbiggYWRqQ291bnQsIGluZGV4ICkge1xuICBpZiAoICFhZGpDb3VudCApIHtcbiAgICByZXR1cm4gdGhpcy5zZWxlY3RlZFNsaWRlLmdldENlbGxFbGVtZW50cygpO1xuICB9XG4gIGluZGV4ID0gaW5kZXggPT09IHVuZGVmaW5lZCA/IHRoaXMuc2VsZWN0ZWRJbmRleCA6IGluZGV4O1xuXG4gIHZhciBsZW4gPSB0aGlzLnNsaWRlcy5sZW5ndGg7XG4gIGlmICggMSArICggYWRqQ291bnQgKiAyICkgPj0gbGVuICkge1xuICAgIHJldHVybiB0aGlzLmdldENlbGxFbGVtZW50cygpO1xuICB9XG5cbiAgdmFyIGNlbGxFbGVtcyA9IFtdO1xuICBmb3IgKCB2YXIgaSA9IGluZGV4IC0gYWRqQ291bnQ7IGkgPD0gaW5kZXggKyBhZGpDb3VudCA7IGkrKyApIHtcbiAgICB2YXIgc2xpZGVJbmRleCA9IHRoaXMub3B0aW9ucy53cmFwQXJvdW5kID8gdXRpbHMubW9kdWxvKCBpLCBsZW4gKSA6IGk7XG4gICAgdmFyIHNsaWRlID0gdGhpcy5zbGlkZXNbIHNsaWRlSW5kZXggXTtcbiAgICBpZiAoIHNsaWRlICkge1xuICAgICAgY2VsbEVsZW1zID0gY2VsbEVsZW1zLmNvbmNhdCggc2xpZGUuZ2V0Q2VsbEVsZW1lbnRzKCkgKTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGNlbGxFbGVtcztcbn07XG5cbi8qKlxuICogc2VsZWN0IHNsaWRlIGZyb20gbnVtYmVyIG9yIGNlbGwgZWxlbWVudFxuICogQHBhcmFtIHtFbGVtZW50LCBTZWxlY3RvciBTdHJpbmcsIG9yIE51bWJlcn0gc2VsZWN0b3JcbiAqL1xucHJvdG8ucXVlcnlDZWxsID0gZnVuY3Rpb24oIHNlbGVjdG9yICkge1xuICBpZiAoIHR5cGVvZiBzZWxlY3RvciA9PSAnbnVtYmVyJyApIHtcbiAgICAvLyB1c2UgbnVtYmVyIGFzIGluZGV4XG4gICAgcmV0dXJuIHRoaXMuY2VsbHNbIHNlbGVjdG9yIF07XG4gIH1cbiAgaWYgKCB0eXBlb2Ygc2VsZWN0b3IgPT0gJ3N0cmluZycgKSB7XG4gICAgLy8gZG8gbm90IHNlbGVjdCBpbnZhbGlkIHNlbGVjdG9ycyBmcm9tIGhhc2g6ICMxMjMsICMvLiAjNzkxXG4gICAgaWYgKCBzZWxlY3Rvci5tYXRjaCgvXlsjXFwuXT9bXFxkXFwvXS8pICkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICAvLyB1c2Ugc3RyaW5nIGFzIHNlbGVjdG9yLCBnZXQgZWxlbWVudFxuICAgIHNlbGVjdG9yID0gdGhpcy5lbGVtZW50LnF1ZXJ5U2VsZWN0b3IoIHNlbGVjdG9yICk7XG4gIH1cbiAgLy8gZ2V0IGNlbGwgZnJvbSBlbGVtZW50XG4gIHJldHVybiB0aGlzLmdldENlbGwoIHNlbGVjdG9yICk7XG59O1xuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSBldmVudHMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gLy9cblxucHJvdG8udWlDaGFuZ2UgPSBmdW5jdGlvbigpIHtcbiAgdGhpcy5lbWl0RXZlbnQoJ3VpQ2hhbmdlJyk7XG59O1xuXG4vLyBrZWVwIGZvY3VzIG9uIGVsZW1lbnQgd2hlbiBjaGlsZCBVSSBlbGVtZW50cyBhcmUgY2xpY2tlZFxucHJvdG8uY2hpbGRVSVBvaW50ZXJEb3duID0gZnVuY3Rpb24oIGV2ZW50ICkge1xuICAvLyBIQUNLIGlPUyBkb2VzIG5vdCBhbGxvdyB0b3VjaCBldmVudHMgdG8gYnViYmxlIHVwPyFcbiAgaWYgKCBldmVudC50eXBlICE9ICd0b3VjaHN0YXJ0JyApIHtcbiAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICB9XG4gIHRoaXMuZm9jdXMoKTtcbn07XG5cbi8vIC0tLS0tIHJlc2l6ZSAtLS0tLSAvL1xuXG5wcm90by5vbnJlc2l6ZSA9IGZ1bmN0aW9uKCkge1xuICB0aGlzLndhdGNoQ1NTKCk7XG4gIHRoaXMucmVzaXplKCk7XG59O1xuXG51dGlscy5kZWJvdW5jZU1ldGhvZCggRmxpY2tpdHksICdvbnJlc2l6ZScsIDE1MCApO1xuXG5wcm90by5yZXNpemUgPSBmdW5jdGlvbigpIHtcbiAgaWYgKCAhdGhpcy5pc0FjdGl2ZSApIHtcbiAgICByZXR1cm47XG4gIH1cbiAgdGhpcy5nZXRTaXplKCk7XG4gIC8vIHdyYXAgdmFsdWVzXG4gIGlmICggdGhpcy5vcHRpb25zLndyYXBBcm91bmQgKSB7XG4gICAgdGhpcy54ID0gdXRpbHMubW9kdWxvKCB0aGlzLngsIHRoaXMuc2xpZGVhYmxlV2lkdGggKTtcbiAgfVxuICB0aGlzLnBvc2l0aW9uQ2VsbHMoKTtcbiAgdGhpcy5fZ2V0V3JhcFNoaWZ0Q2VsbHMoKTtcbiAgdGhpcy5zZXRHYWxsZXJ5U2l6ZSgpO1xuICB0aGlzLmVtaXRFdmVudCgncmVzaXplJyk7XG4gIC8vIHVwZGF0ZSBzZWxlY3RlZCBpbmRleCBmb3IgZ3JvdXAgc2xpZGVzLCBpbnN0YW50XG4gIC8vIFRPRE86IHBvc2l0aW9uIGNhbiBiZSBsb3N0IGJldHdlZW4gZ3JvdXBzIG9mIHZhcmlvdXMgbnVtYmVyc1xuICB2YXIgc2VsZWN0ZWRFbGVtZW50ID0gdGhpcy5zZWxlY3RlZEVsZW1lbnRzICYmIHRoaXMuc2VsZWN0ZWRFbGVtZW50c1swXTtcbiAgdGhpcy5zZWxlY3RDZWxsKCBzZWxlY3RlZEVsZW1lbnQsIGZhbHNlLCB0cnVlICk7XG59O1xuXG4vLyB3YXRjaGVzIHRoZSA6YWZ0ZXIgcHJvcGVydHksIGFjdGl2YXRlcy9kZWFjdGl2YXRlc1xucHJvdG8ud2F0Y2hDU1MgPSBmdW5jdGlvbigpIHtcbiAgdmFyIHdhdGNoT3B0aW9uID0gdGhpcy5vcHRpb25zLndhdGNoQ1NTO1xuICBpZiAoICF3YXRjaE9wdGlvbiApIHtcbiAgICByZXR1cm47XG4gIH1cblxuICB2YXIgYWZ0ZXJDb250ZW50ID0gZ2V0Q29tcHV0ZWRTdHlsZSggdGhpcy5lbGVtZW50LCAnOmFmdGVyJyApLmNvbnRlbnQ7XG4gIC8vIGFjdGl2YXRlIGlmIDphZnRlciB7IGNvbnRlbnQ6ICdmbGlja2l0eScgfVxuICBpZiAoIGFmdGVyQ29udGVudC5pbmRleE9mKCdmbGlja2l0eScpICE9IC0xICkge1xuICAgIHRoaXMuYWN0aXZhdGUoKTtcbiAgfSBlbHNlIHtcbiAgICB0aGlzLmRlYWN0aXZhdGUoKTtcbiAgfVxufTtcblxuLy8gLS0tLS0ga2V5ZG93biAtLS0tLSAvL1xuXG4vLyBnbyBwcmV2aW91cy9uZXh0IGlmIGxlZnQvcmlnaHQga2V5cyBwcmVzc2VkXG5wcm90by5vbmtleWRvd24gPSBmdW5jdGlvbiggZXZlbnQgKSB7XG4gIC8vIG9ubHkgd29yayBpZiBlbGVtZW50IGlzIGluIGZvY3VzXG4gIHZhciBpc05vdEZvY3VzZWQgPSBkb2N1bWVudC5hY3RpdmVFbGVtZW50ICYmIGRvY3VtZW50LmFjdGl2ZUVsZW1lbnQgIT0gdGhpcy5lbGVtZW50O1xuICBpZiAoICF0aGlzLm9wdGlvbnMuYWNjZXNzaWJpbGl0eSB8fGlzTm90Rm9jdXNlZCApIHtcbiAgICByZXR1cm47XG4gIH1cblxuICB2YXIgaGFuZGxlciA9IEZsaWNraXR5LmtleWJvYXJkSGFuZGxlcnNbIGV2ZW50LmtleUNvZGUgXTtcbiAgaWYgKCBoYW5kbGVyICkge1xuICAgIGhhbmRsZXIuY2FsbCggdGhpcyApO1xuICB9XG59O1xuXG5GbGlja2l0eS5rZXlib2FyZEhhbmRsZXJzID0ge1xuICAvLyBsZWZ0IGFycm93XG4gIDM3OiBmdW5jdGlvbigpIHtcbiAgICB2YXIgbGVmdE1ldGhvZCA9IHRoaXMub3B0aW9ucy5yaWdodFRvTGVmdCA/ICduZXh0JyA6ICdwcmV2aW91cyc7XG4gICAgdGhpcy51aUNoYW5nZSgpO1xuICAgIHRoaXNbIGxlZnRNZXRob2QgXSgpO1xuICB9LFxuICAvLyByaWdodCBhcnJvd1xuICAzOTogZnVuY3Rpb24oKSB7XG4gICAgdmFyIHJpZ2h0TWV0aG9kID0gdGhpcy5vcHRpb25zLnJpZ2h0VG9MZWZ0ID8gJ3ByZXZpb3VzJyA6ICduZXh0JztcbiAgICB0aGlzLnVpQ2hhbmdlKCk7XG4gICAgdGhpc1sgcmlnaHRNZXRob2QgXSgpO1xuICB9LFxufTtcblxuLy8gLS0tLS0gZm9jdXMgLS0tLS0gLy9cblxucHJvdG8uZm9jdXMgPSBmdW5jdGlvbigpIHtcbiAgLy8gVE9ETyByZW1vdmUgc2Nyb2xsVG8gb25jZSBmb2N1cyBvcHRpb25zIGdldHMgbW9yZSBzdXBwb3J0XG4gIC8vIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0FQSS9IVE1MRWxlbWVudC9mb2N1cyNCcm93c2VyX2NvbXBhdGliaWxpdHlcbiAgdmFyIHByZXZTY3JvbGxZID0gd2luZG93LnBhZ2VZT2Zmc2V0O1xuICB0aGlzLmVsZW1lbnQuZm9jdXMoeyBwcmV2ZW50U2Nyb2xsOiB0cnVlIH0pO1xuICAvLyBoYWNrIHRvIGZpeCBzY3JvbGwganVtcCBhZnRlciBmb2N1cywgIzc2XG4gIGlmICggd2luZG93LnBhZ2VZT2Zmc2V0ICE9IHByZXZTY3JvbGxZICkge1xuICAgIHdpbmRvdy5zY3JvbGxUbyggd2luZG93LnBhZ2VYT2Zmc2V0LCBwcmV2U2Nyb2xsWSApO1xuICB9XG59O1xuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSBkZXN0cm95IC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIC8vXG5cbi8vIGRlYWN0aXZhdGUgYWxsIEZsaWNraXR5IGZ1bmN0aW9uYWxpdHksIGJ1dCBrZWVwIHN0dWZmIGF2YWlsYWJsZVxucHJvdG8uZGVhY3RpdmF0ZSA9IGZ1bmN0aW9uKCkge1xuICBpZiAoICF0aGlzLmlzQWN0aXZlICkge1xuICAgIHJldHVybjtcbiAgfVxuICB0aGlzLmVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZSgnZmxpY2tpdHktZW5hYmxlZCcpO1xuICB0aGlzLmVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZSgnZmxpY2tpdHktcnRsJyk7XG4gIHRoaXMudW5zZWxlY3RTZWxlY3RlZFNsaWRlKCk7XG4gIC8vIGRlc3Ryb3kgY2VsbHNcbiAgdGhpcy5jZWxscy5mb3JFYWNoKCBmdW5jdGlvbiggY2VsbCApIHtcbiAgICBjZWxsLmRlc3Ryb3koKTtcbiAgfSk7XG4gIHRoaXMuZWxlbWVudC5yZW1vdmVDaGlsZCggdGhpcy52aWV3cG9ydCApO1xuICAvLyBtb3ZlIGNoaWxkIGVsZW1lbnRzIGJhY2sgaW50byBlbGVtZW50XG4gIG1vdmVFbGVtZW50cyggdGhpcy5zbGlkZXIuY2hpbGRyZW4sIHRoaXMuZWxlbWVudCApO1xuICBpZiAoIHRoaXMub3B0aW9ucy5hY2Nlc3NpYmlsaXR5ICkge1xuICAgIHRoaXMuZWxlbWVudC5yZW1vdmVBdHRyaWJ1dGUoJ3RhYkluZGV4Jyk7XG4gICAgdGhpcy5lbGVtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoICdrZXlkb3duJywgdGhpcyApO1xuICB9XG4gIC8vIHNldCBmbGFnc1xuICB0aGlzLmlzQWN0aXZlID0gZmFsc2U7XG4gIHRoaXMuZW1pdEV2ZW50KCdkZWFjdGl2YXRlJyk7XG59O1xuXG5wcm90by5kZXN0cm95ID0gZnVuY3Rpb24oKSB7XG4gIHRoaXMuZGVhY3RpdmF0ZSgpO1xuICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lciggJ3Jlc2l6ZScsIHRoaXMgKTtcbiAgdGhpcy5hbGxPZmYoKTtcbiAgdGhpcy5lbWl0RXZlbnQoJ2Rlc3Ryb3knKTtcbiAgaWYgKCBqUXVlcnkgJiYgdGhpcy4kZWxlbWVudCApIHtcbiAgICBqUXVlcnkucmVtb3ZlRGF0YSggdGhpcy5lbGVtZW50LCAnZmxpY2tpdHknICk7XG4gIH1cbiAgZGVsZXRlIHRoaXMuZWxlbWVudC5mbGlja2l0eUdVSUQ7XG4gIGRlbGV0ZSBpbnN0YW5jZXNbIHRoaXMuZ3VpZCBdO1xufTtcblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gcHJvdG90eXBlIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIC8vXG5cbnV0aWxzLmV4dGVuZCggcHJvdG8sIGFuaW1hdGVQcm90b3R5cGUgKTtcblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gZXh0cmFzIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIC8vXG5cbi8qKlxuICogZ2V0IEZsaWNraXR5IGluc3RhbmNlIGZyb20gZWxlbWVudFxuICogQHBhcmFtIHtFbGVtZW50fSBlbGVtXG4gKiBAcmV0dXJucyB7RmxpY2tpdHl9XG4gKi9cbkZsaWNraXR5LmRhdGEgPSBmdW5jdGlvbiggZWxlbSApIHtcbiAgZWxlbSA9IHV0aWxzLmdldFF1ZXJ5RWxlbWVudCggZWxlbSApO1xuICB2YXIgaWQgPSBlbGVtICYmIGVsZW0uZmxpY2tpdHlHVUlEO1xuICByZXR1cm4gaWQgJiYgaW5zdGFuY2VzWyBpZCBdO1xufTtcblxudXRpbHMuaHRtbEluaXQoIEZsaWNraXR5LCAnZmxpY2tpdHknICk7XG5cbmlmICggalF1ZXJ5ICYmIGpRdWVyeS5icmlkZ2V0ICkge1xuICBqUXVlcnkuYnJpZGdldCggJ2ZsaWNraXR5JywgRmxpY2tpdHkgKTtcbn1cblxuLy8gc2V0IGludGVybmFsIGpRdWVyeSwgZm9yIFdlYnBhY2sgKyBqUXVlcnkgdjMsICM0NzhcbkZsaWNraXR5LnNldEpRdWVyeSA9IGZ1bmN0aW9uKCBqcSApIHtcbiAgalF1ZXJ5ID0ganE7XG59O1xuXG5GbGlja2l0eS5DZWxsID0gQ2VsbDtcbkZsaWNraXR5LlNsaWRlID0gU2xpZGU7XG5cbnJldHVybiBGbGlja2l0eTtcblxufSkpO1xuIiwiLyohXG4gKiBVbmlwb2ludGVyIHYyLjMuMFxuICogYmFzZSBjbGFzcyBmb3IgZG9pbmcgb25lIHRoaW5nIHdpdGggcG9pbnRlciBldmVudFxuICogTUlUIGxpY2Vuc2VcbiAqL1xuXG4vKmpzaGludCBicm93c2VyOiB0cnVlLCB1bmRlZjogdHJ1ZSwgdW51c2VkOiB0cnVlLCBzdHJpY3Q6IHRydWUgKi9cblxuKCBmdW5jdGlvbiggd2luZG93LCBmYWN0b3J5ICkge1xuICAvLyB1bml2ZXJzYWwgbW9kdWxlIGRlZmluaXRpb25cbiAgLyoganNoaW50IHN0cmljdDogZmFsc2UgKi8gLypnbG9iYWwgZGVmaW5lLCBtb2R1bGUsIHJlcXVpcmUgKi9cbiAgaWYgKCB0eXBlb2YgZGVmaW5lID09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCApIHtcbiAgICAvLyBBTURcbiAgICBkZWZpbmUoIFtcbiAgICAgICdldi1lbWl0dGVyL2V2LWVtaXR0ZXInXG4gICAgXSwgZnVuY3Rpb24oIEV2RW1pdHRlciApIHtcbiAgICAgIHJldHVybiBmYWN0b3J5KCB3aW5kb3csIEV2RW1pdHRlciApO1xuICAgIH0pO1xuICB9IGVsc2UgaWYgKCB0eXBlb2YgbW9kdWxlID09ICdvYmplY3QnICYmIG1vZHVsZS5leHBvcnRzICkge1xuICAgIC8vIENvbW1vbkpTXG4gICAgbW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KFxuICAgICAgd2luZG93LFxuICAgICAgcmVxdWlyZSgnZXYtZW1pdHRlcicpXG4gICAgKTtcbiAgfSBlbHNlIHtcbiAgICAvLyBicm93c2VyIGdsb2JhbFxuICAgIHdpbmRvdy5Vbmlwb2ludGVyID0gZmFjdG9yeShcbiAgICAgIHdpbmRvdyxcbiAgICAgIHdpbmRvdy5FdkVtaXR0ZXJcbiAgICApO1xuICB9XG5cbn0oIHdpbmRvdywgZnVuY3Rpb24gZmFjdG9yeSggd2luZG93LCBFdkVtaXR0ZXIgKSB7XG5cbid1c2Ugc3RyaWN0JztcblxuZnVuY3Rpb24gbm9vcCgpIHt9XG5cbmZ1bmN0aW9uIFVuaXBvaW50ZXIoKSB7fVxuXG4vLyBpbmhlcml0IEV2RW1pdHRlclxudmFyIHByb3RvID0gVW5pcG9pbnRlci5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKCBFdkVtaXR0ZXIucHJvdG90eXBlICk7XG5cbnByb3RvLmJpbmRTdGFydEV2ZW50ID0gZnVuY3Rpb24oIGVsZW0gKSB7XG4gIHRoaXMuX2JpbmRTdGFydEV2ZW50KCBlbGVtLCB0cnVlICk7XG59O1xuXG5wcm90by51bmJpbmRTdGFydEV2ZW50ID0gZnVuY3Rpb24oIGVsZW0gKSB7XG4gIHRoaXMuX2JpbmRTdGFydEV2ZW50KCBlbGVtLCBmYWxzZSApO1xufTtcblxuLyoqXG4gKiBBZGQgb3IgcmVtb3ZlIHN0YXJ0IGV2ZW50XG4gKiBAcGFyYW0ge0Jvb2xlYW59IGlzQWRkIC0gcmVtb3ZlIGlmIGZhbHNleVxuICovXG5wcm90by5fYmluZFN0YXJ0RXZlbnQgPSBmdW5jdGlvbiggZWxlbSwgaXNBZGQgKSB7XG4gIC8vIG11bmdlIGlzQWRkLCBkZWZhdWx0IHRvIHRydWVcbiAgaXNBZGQgPSBpc0FkZCA9PT0gdW5kZWZpbmVkID8gdHJ1ZSA6IGlzQWRkO1xuICB2YXIgYmluZE1ldGhvZCA9IGlzQWRkID8gJ2FkZEV2ZW50TGlzdGVuZXInIDogJ3JlbW92ZUV2ZW50TGlzdGVuZXInO1xuXG4gIC8vIGRlZmF1bHQgdG8gbW91c2UgZXZlbnRzXG4gIHZhciBzdGFydEV2ZW50ID0gJ21vdXNlZG93bic7XG4gIGlmICggd2luZG93LlBvaW50ZXJFdmVudCApIHtcbiAgICAvLyBQb2ludGVyIEV2ZW50c1xuICAgIHN0YXJ0RXZlbnQgPSAncG9pbnRlcmRvd24nO1xuICB9IGVsc2UgaWYgKCAnb250b3VjaHN0YXJ0JyBpbiB3aW5kb3cgKSB7XG4gICAgLy8gVG91Y2ggRXZlbnRzLiBpT1MgU2FmYXJpXG4gICAgc3RhcnRFdmVudCA9ICd0b3VjaHN0YXJ0JztcbiAgfVxuICBlbGVtWyBiaW5kTWV0aG9kIF0oIHN0YXJ0RXZlbnQsIHRoaXMgKTtcbn07XG5cbi8vIHRyaWdnZXIgaGFuZGxlciBtZXRob2RzIGZvciBldmVudHNcbnByb3RvLmhhbmRsZUV2ZW50ID0gZnVuY3Rpb24oIGV2ZW50ICkge1xuICB2YXIgbWV0aG9kID0gJ29uJyArIGV2ZW50LnR5cGU7XG4gIGlmICggdGhpc1sgbWV0aG9kIF0gKSB7XG4gICAgdGhpc1sgbWV0aG9kIF0oIGV2ZW50ICk7XG4gIH1cbn07XG5cbi8vIHJldHVybnMgdGhlIHRvdWNoIHRoYXQgd2UncmUga2VlcGluZyB0cmFjayBvZlxucHJvdG8uZ2V0VG91Y2ggPSBmdW5jdGlvbiggdG91Y2hlcyApIHtcbiAgZm9yICggdmFyIGk9MDsgaSA8IHRvdWNoZXMubGVuZ3RoOyBpKysgKSB7XG4gICAgdmFyIHRvdWNoID0gdG91Y2hlc1tpXTtcbiAgICBpZiAoIHRvdWNoLmlkZW50aWZpZXIgPT0gdGhpcy5wb2ludGVySWRlbnRpZmllciApIHtcbiAgICAgIHJldHVybiB0b3VjaDtcbiAgICB9XG4gIH1cbn07XG5cbi8vIC0tLS0tIHN0YXJ0IGV2ZW50IC0tLS0tIC8vXG5cbnByb3RvLm9ubW91c2Vkb3duID0gZnVuY3Rpb24oIGV2ZW50ICkge1xuICAvLyBkaXNtaXNzIGNsaWNrcyBmcm9tIHJpZ2h0IG9yIG1pZGRsZSBidXR0b25zXG4gIHZhciBidXR0b24gPSBldmVudC5idXR0b247XG4gIGlmICggYnV0dG9uICYmICggYnV0dG9uICE9PSAwICYmIGJ1dHRvbiAhPT0gMSApICkge1xuICAgIHJldHVybjtcbiAgfVxuICB0aGlzLl9wb2ludGVyRG93biggZXZlbnQsIGV2ZW50ICk7XG59O1xuXG5wcm90by5vbnRvdWNoc3RhcnQgPSBmdW5jdGlvbiggZXZlbnQgKSB7XG4gIHRoaXMuX3BvaW50ZXJEb3duKCBldmVudCwgZXZlbnQuY2hhbmdlZFRvdWNoZXNbMF0gKTtcbn07XG5cbnByb3RvLm9ucG9pbnRlcmRvd24gPSBmdW5jdGlvbiggZXZlbnQgKSB7XG4gIHRoaXMuX3BvaW50ZXJEb3duKCBldmVudCwgZXZlbnQgKTtcbn07XG5cbi8qKlxuICogcG9pbnRlciBzdGFydFxuICogQHBhcmFtIHtFdmVudH0gZXZlbnRcbiAqIEBwYXJhbSB7RXZlbnQgb3IgVG91Y2h9IHBvaW50ZXJcbiAqL1xucHJvdG8uX3BvaW50ZXJEb3duID0gZnVuY3Rpb24oIGV2ZW50LCBwb2ludGVyICkge1xuICAvLyBkaXNtaXNzIHJpZ2h0IGNsaWNrIGFuZCBvdGhlciBwb2ludGVyc1xuICAvLyBidXR0b24gPSAwIGlzIG9rYXksIDEtNCBub3RcbiAgaWYgKCBldmVudC5idXR0b24gfHwgdGhpcy5pc1BvaW50ZXJEb3duICkge1xuICAgIHJldHVybjtcbiAgfVxuXG4gIHRoaXMuaXNQb2ludGVyRG93biA9IHRydWU7XG4gIC8vIHNhdmUgcG9pbnRlciBpZGVudGlmaWVyIHRvIG1hdGNoIHVwIHRvdWNoIGV2ZW50c1xuICB0aGlzLnBvaW50ZXJJZGVudGlmaWVyID0gcG9pbnRlci5wb2ludGVySWQgIT09IHVuZGVmaW5lZCA/XG4gICAgLy8gcG9pbnRlcklkIGZvciBwb2ludGVyIGV2ZW50cywgdG91Y2guaW5kZW50aWZpZXIgZm9yIHRvdWNoIGV2ZW50c1xuICAgIHBvaW50ZXIucG9pbnRlcklkIDogcG9pbnRlci5pZGVudGlmaWVyO1xuXG4gIHRoaXMucG9pbnRlckRvd24oIGV2ZW50LCBwb2ludGVyICk7XG59O1xuXG5wcm90by5wb2ludGVyRG93biA9IGZ1bmN0aW9uKCBldmVudCwgcG9pbnRlciApIHtcbiAgdGhpcy5fYmluZFBvc3RTdGFydEV2ZW50cyggZXZlbnQgKTtcbiAgdGhpcy5lbWl0RXZlbnQoICdwb2ludGVyRG93bicsIFsgZXZlbnQsIHBvaW50ZXIgXSApO1xufTtcblxuLy8gaGFzaCBvZiBldmVudHMgdG8gYmUgYm91bmQgYWZ0ZXIgc3RhcnQgZXZlbnRcbnZhciBwb3N0U3RhcnRFdmVudHMgPSB7XG4gIG1vdXNlZG93bjogWyAnbW91c2Vtb3ZlJywgJ21vdXNldXAnIF0sXG4gIHRvdWNoc3RhcnQ6IFsgJ3RvdWNobW92ZScsICd0b3VjaGVuZCcsICd0b3VjaGNhbmNlbCcgXSxcbiAgcG9pbnRlcmRvd246IFsgJ3BvaW50ZXJtb3ZlJywgJ3BvaW50ZXJ1cCcsICdwb2ludGVyY2FuY2VsJyBdLFxufTtcblxucHJvdG8uX2JpbmRQb3N0U3RhcnRFdmVudHMgPSBmdW5jdGlvbiggZXZlbnQgKSB7XG4gIGlmICggIWV2ZW50ICkge1xuICAgIHJldHVybjtcbiAgfVxuICAvLyBnZXQgcHJvcGVyIGV2ZW50cyB0byBtYXRjaCBzdGFydCBldmVudFxuICB2YXIgZXZlbnRzID0gcG9zdFN0YXJ0RXZlbnRzWyBldmVudC50eXBlIF07XG4gIC8vIGJpbmQgZXZlbnRzIHRvIG5vZGVcbiAgZXZlbnRzLmZvckVhY2goIGZ1bmN0aW9uKCBldmVudE5hbWUgKSB7XG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoIGV2ZW50TmFtZSwgdGhpcyApO1xuICB9LCB0aGlzICk7XG4gIC8vIHNhdmUgdGhlc2UgYXJndW1lbnRzXG4gIHRoaXMuX2JvdW5kUG9pbnRlckV2ZW50cyA9IGV2ZW50cztcbn07XG5cbnByb3RvLl91bmJpbmRQb3N0U3RhcnRFdmVudHMgPSBmdW5jdGlvbigpIHtcbiAgLy8gY2hlY2sgZm9yIF9ib3VuZEV2ZW50cywgaW4gY2FzZSBkcmFnRW5kIHRyaWdnZXJlZCB0d2ljZSAob2xkIElFOCBidWcpXG4gIGlmICggIXRoaXMuX2JvdW5kUG9pbnRlckV2ZW50cyApIHtcbiAgICByZXR1cm47XG4gIH1cbiAgdGhpcy5fYm91bmRQb2ludGVyRXZlbnRzLmZvckVhY2goIGZ1bmN0aW9uKCBldmVudE5hbWUgKSB7XG4gICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoIGV2ZW50TmFtZSwgdGhpcyApO1xuICB9LCB0aGlzICk7XG5cbiAgZGVsZXRlIHRoaXMuX2JvdW5kUG9pbnRlckV2ZW50cztcbn07XG5cbi8vIC0tLS0tIG1vdmUgZXZlbnQgLS0tLS0gLy9cblxucHJvdG8ub25tb3VzZW1vdmUgPSBmdW5jdGlvbiggZXZlbnQgKSB7XG4gIHRoaXMuX3BvaW50ZXJNb3ZlKCBldmVudCwgZXZlbnQgKTtcbn07XG5cbnByb3RvLm9ucG9pbnRlcm1vdmUgPSBmdW5jdGlvbiggZXZlbnQgKSB7XG4gIGlmICggZXZlbnQucG9pbnRlcklkID09IHRoaXMucG9pbnRlcklkZW50aWZpZXIgKSB7XG4gICAgdGhpcy5fcG9pbnRlck1vdmUoIGV2ZW50LCBldmVudCApO1xuICB9XG59O1xuXG5wcm90by5vbnRvdWNobW92ZSA9IGZ1bmN0aW9uKCBldmVudCApIHtcbiAgdmFyIHRvdWNoID0gdGhpcy5nZXRUb3VjaCggZXZlbnQuY2hhbmdlZFRvdWNoZXMgKTtcbiAgaWYgKCB0b3VjaCApIHtcbiAgICB0aGlzLl9wb2ludGVyTW92ZSggZXZlbnQsIHRvdWNoICk7XG4gIH1cbn07XG5cbi8qKlxuICogcG9pbnRlciBtb3ZlXG4gKiBAcGFyYW0ge0V2ZW50fSBldmVudFxuICogQHBhcmFtIHtFdmVudCBvciBUb3VjaH0gcG9pbnRlclxuICogQHByaXZhdGVcbiAqL1xucHJvdG8uX3BvaW50ZXJNb3ZlID0gZnVuY3Rpb24oIGV2ZW50LCBwb2ludGVyICkge1xuICB0aGlzLnBvaW50ZXJNb3ZlKCBldmVudCwgcG9pbnRlciApO1xufTtcblxuLy8gcHVibGljXG5wcm90by5wb2ludGVyTW92ZSA9IGZ1bmN0aW9uKCBldmVudCwgcG9pbnRlciApIHtcbiAgdGhpcy5lbWl0RXZlbnQoICdwb2ludGVyTW92ZScsIFsgZXZlbnQsIHBvaW50ZXIgXSApO1xufTtcblxuLy8gLS0tLS0gZW5kIGV2ZW50IC0tLS0tIC8vXG5cblxucHJvdG8ub25tb3VzZXVwID0gZnVuY3Rpb24oIGV2ZW50ICkge1xuICB0aGlzLl9wb2ludGVyVXAoIGV2ZW50LCBldmVudCApO1xufTtcblxucHJvdG8ub25wb2ludGVydXAgPSBmdW5jdGlvbiggZXZlbnQgKSB7XG4gIGlmICggZXZlbnQucG9pbnRlcklkID09IHRoaXMucG9pbnRlcklkZW50aWZpZXIgKSB7XG4gICAgdGhpcy5fcG9pbnRlclVwKCBldmVudCwgZXZlbnQgKTtcbiAgfVxufTtcblxucHJvdG8ub250b3VjaGVuZCA9IGZ1bmN0aW9uKCBldmVudCApIHtcbiAgdmFyIHRvdWNoID0gdGhpcy5nZXRUb3VjaCggZXZlbnQuY2hhbmdlZFRvdWNoZXMgKTtcbiAgaWYgKCB0b3VjaCApIHtcbiAgICB0aGlzLl9wb2ludGVyVXAoIGV2ZW50LCB0b3VjaCApO1xuICB9XG59O1xuXG4vKipcbiAqIHBvaW50ZXIgdXBcbiAqIEBwYXJhbSB7RXZlbnR9IGV2ZW50XG4gKiBAcGFyYW0ge0V2ZW50IG9yIFRvdWNofSBwb2ludGVyXG4gKiBAcHJpdmF0ZVxuICovXG5wcm90by5fcG9pbnRlclVwID0gZnVuY3Rpb24oIGV2ZW50LCBwb2ludGVyICkge1xuICB0aGlzLl9wb2ludGVyRG9uZSgpO1xuICB0aGlzLnBvaW50ZXJVcCggZXZlbnQsIHBvaW50ZXIgKTtcbn07XG5cbi8vIHB1YmxpY1xucHJvdG8ucG9pbnRlclVwID0gZnVuY3Rpb24oIGV2ZW50LCBwb2ludGVyICkge1xuICB0aGlzLmVtaXRFdmVudCggJ3BvaW50ZXJVcCcsIFsgZXZlbnQsIHBvaW50ZXIgXSApO1xufTtcblxuLy8gLS0tLS0gcG9pbnRlciBkb25lIC0tLS0tIC8vXG5cbi8vIHRyaWdnZXJlZCBvbiBwb2ludGVyIHVwICYgcG9pbnRlciBjYW5jZWxcbnByb3RvLl9wb2ludGVyRG9uZSA9IGZ1bmN0aW9uKCkge1xuICB0aGlzLl9wb2ludGVyUmVzZXQoKTtcbiAgdGhpcy5fdW5iaW5kUG9zdFN0YXJ0RXZlbnRzKCk7XG4gIHRoaXMucG9pbnRlckRvbmUoKTtcbn07XG5cbnByb3RvLl9wb2ludGVyUmVzZXQgPSBmdW5jdGlvbigpIHtcbiAgLy8gcmVzZXQgcHJvcGVydGllc1xuICB0aGlzLmlzUG9pbnRlckRvd24gPSBmYWxzZTtcbiAgZGVsZXRlIHRoaXMucG9pbnRlcklkZW50aWZpZXI7XG59O1xuXG5wcm90by5wb2ludGVyRG9uZSA9IG5vb3A7XG5cbi8vIC0tLS0tIHBvaW50ZXIgY2FuY2VsIC0tLS0tIC8vXG5cbnByb3RvLm9ucG9pbnRlcmNhbmNlbCA9IGZ1bmN0aW9uKCBldmVudCApIHtcbiAgaWYgKCBldmVudC5wb2ludGVySWQgPT0gdGhpcy5wb2ludGVySWRlbnRpZmllciApIHtcbiAgICB0aGlzLl9wb2ludGVyQ2FuY2VsKCBldmVudCwgZXZlbnQgKTtcbiAgfVxufTtcblxucHJvdG8ub250b3VjaGNhbmNlbCA9IGZ1bmN0aW9uKCBldmVudCApIHtcbiAgdmFyIHRvdWNoID0gdGhpcy5nZXRUb3VjaCggZXZlbnQuY2hhbmdlZFRvdWNoZXMgKTtcbiAgaWYgKCB0b3VjaCApIHtcbiAgICB0aGlzLl9wb2ludGVyQ2FuY2VsKCBldmVudCwgdG91Y2ggKTtcbiAgfVxufTtcblxuLyoqXG4gKiBwb2ludGVyIGNhbmNlbFxuICogQHBhcmFtIHtFdmVudH0gZXZlbnRcbiAqIEBwYXJhbSB7RXZlbnQgb3IgVG91Y2h9IHBvaW50ZXJcbiAqIEBwcml2YXRlXG4gKi9cbnByb3RvLl9wb2ludGVyQ2FuY2VsID0gZnVuY3Rpb24oIGV2ZW50LCBwb2ludGVyICkge1xuICB0aGlzLl9wb2ludGVyRG9uZSgpO1xuICB0aGlzLnBvaW50ZXJDYW5jZWwoIGV2ZW50LCBwb2ludGVyICk7XG59O1xuXG4vLyBwdWJsaWNcbnByb3RvLnBvaW50ZXJDYW5jZWwgPSBmdW5jdGlvbiggZXZlbnQsIHBvaW50ZXIgKSB7XG4gIHRoaXMuZW1pdEV2ZW50KCAncG9pbnRlckNhbmNlbCcsIFsgZXZlbnQsIHBvaW50ZXIgXSApO1xufTtcblxuLy8gLS0tLS0gIC0tLS0tIC8vXG5cbi8vIHV0aWxpdHkgZnVuY3Rpb24gZm9yIGdldHRpbmcgeC95IGNvb3JkcyBmcm9tIGV2ZW50XG5Vbmlwb2ludGVyLmdldFBvaW50ZXJQb2ludCA9IGZ1bmN0aW9uKCBwb2ludGVyICkge1xuICByZXR1cm4ge1xuICAgIHg6IHBvaW50ZXIucGFnZVgsXG4gICAgeTogcG9pbnRlci5wYWdlWVxuICB9O1xufTtcblxuLy8gLS0tLS0gIC0tLS0tIC8vXG5cbnJldHVybiBVbmlwb2ludGVyO1xuXG59KSk7XG4iLCIvKiFcbiAqIFVuaWRyYWdnZXIgdjIuMy4wXG4gKiBEcmFnZ2FibGUgYmFzZSBjbGFzc1xuICogTUlUIGxpY2Vuc2VcbiAqL1xuXG4vKmpzaGludCBicm93c2VyOiB0cnVlLCB1bnVzZWQ6IHRydWUsIHVuZGVmOiB0cnVlLCBzdHJpY3Q6IHRydWUgKi9cblxuKCBmdW5jdGlvbiggd2luZG93LCBmYWN0b3J5ICkge1xuICAvLyB1bml2ZXJzYWwgbW9kdWxlIGRlZmluaXRpb25cbiAgLypqc2hpbnQgc3RyaWN0OiBmYWxzZSAqLyAvKmdsb2JhbHMgZGVmaW5lLCBtb2R1bGUsIHJlcXVpcmUgKi9cblxuICBpZiAoIHR5cGVvZiBkZWZpbmUgPT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kICkge1xuICAgIC8vIEFNRFxuICAgIGRlZmluZSggW1xuICAgICAgJ3VuaXBvaW50ZXIvdW5pcG9pbnRlcidcbiAgICBdLCBmdW5jdGlvbiggVW5pcG9pbnRlciApIHtcbiAgICAgIHJldHVybiBmYWN0b3J5KCB3aW5kb3csIFVuaXBvaW50ZXIgKTtcbiAgICB9KTtcbiAgfSBlbHNlIGlmICggdHlwZW9mIG1vZHVsZSA9PSAnb2JqZWN0JyAmJiBtb2R1bGUuZXhwb3J0cyApIHtcbiAgICAvLyBDb21tb25KU1xuICAgIG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeShcbiAgICAgIHdpbmRvdyxcbiAgICAgIHJlcXVpcmUoJ3VuaXBvaW50ZXInKVxuICAgICk7XG4gIH0gZWxzZSB7XG4gICAgLy8gYnJvd3NlciBnbG9iYWxcbiAgICB3aW5kb3cuVW5pZHJhZ2dlciA9IGZhY3RvcnkoXG4gICAgICB3aW5kb3csXG4gICAgICB3aW5kb3cuVW5pcG9pbnRlclxuICAgICk7XG4gIH1cblxufSggd2luZG93LCBmdW5jdGlvbiBmYWN0b3J5KCB3aW5kb3csIFVuaXBvaW50ZXIgKSB7XG5cbid1c2Ugc3RyaWN0JztcblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gVW5pZHJhZ2dlciAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSAvL1xuXG5mdW5jdGlvbiBVbmlkcmFnZ2VyKCkge31cblxuLy8gaW5oZXJpdCBVbmlwb2ludGVyICYgRXZFbWl0dGVyXG52YXIgcHJvdG8gPSBVbmlkcmFnZ2VyLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoIFVuaXBvaW50ZXIucHJvdG90eXBlICk7XG5cbi8vIC0tLS0tIGJpbmQgc3RhcnQgLS0tLS0gLy9cblxucHJvdG8uYmluZEhhbmRsZXMgPSBmdW5jdGlvbigpIHtcbiAgdGhpcy5fYmluZEhhbmRsZXMoIHRydWUgKTtcbn07XG5cbnByb3RvLnVuYmluZEhhbmRsZXMgPSBmdW5jdGlvbigpIHtcbiAgdGhpcy5fYmluZEhhbmRsZXMoIGZhbHNlICk7XG59O1xuXG4vKipcbiAqIEFkZCBvciByZW1vdmUgc3RhcnQgZXZlbnRcbiAqIEBwYXJhbSB7Qm9vbGVhbn0gaXNBZGRcbiAqL1xucHJvdG8uX2JpbmRIYW5kbGVzID0gZnVuY3Rpb24oIGlzQWRkICkge1xuICAvLyBtdW5nZSBpc0FkZCwgZGVmYXVsdCB0byB0cnVlXG4gIGlzQWRkID0gaXNBZGQgPT09IHVuZGVmaW5lZCA/IHRydWUgOiBpc0FkZDtcbiAgLy8gYmluZCBlYWNoIGhhbmRsZVxuICB2YXIgYmluZE1ldGhvZCA9IGlzQWRkID8gJ2FkZEV2ZW50TGlzdGVuZXInIDogJ3JlbW92ZUV2ZW50TGlzdGVuZXInO1xuICB2YXIgdG91Y2hBY3Rpb24gPSBpc0FkZCA/IHRoaXMuX3RvdWNoQWN0aW9uVmFsdWUgOiAnJztcbiAgZm9yICggdmFyIGk9MDsgaSA8IHRoaXMuaGFuZGxlcy5sZW5ndGg7IGkrKyApIHtcbiAgICB2YXIgaGFuZGxlID0gdGhpcy5oYW5kbGVzW2ldO1xuICAgIHRoaXMuX2JpbmRTdGFydEV2ZW50KCBoYW5kbGUsIGlzQWRkICk7XG4gICAgaGFuZGxlWyBiaW5kTWV0aG9kIF0oICdjbGljaycsIHRoaXMgKTtcbiAgICAvLyB0b3VjaC1hY3Rpb246IG5vbmUgdG8gb3ZlcnJpZGUgYnJvd3NlciB0b3VjaCBnZXN0dXJlcy4gbWV0YWZpenp5L2ZsaWNraXR5IzU0MFxuICAgIGlmICggd2luZG93LlBvaW50ZXJFdmVudCApIHtcbiAgICAgIGhhbmRsZS5zdHlsZS50b3VjaEFjdGlvbiA9IHRvdWNoQWN0aW9uO1xuICAgIH1cbiAgfVxufTtcblxuLy8gcHJvdG90eXBlIHNvIGl0IGNhbiBiZSBvdmVyd3JpdGVhYmxlIGJ5IEZsaWNraXR5XG5wcm90by5fdG91Y2hBY3Rpb25WYWx1ZSA9ICdub25lJztcblxuLy8gLS0tLS0gc3RhcnQgZXZlbnQgLS0tLS0gLy9cblxuLyoqXG4gKiBwb2ludGVyIHN0YXJ0XG4gKiBAcGFyYW0ge0V2ZW50fSBldmVudFxuICogQHBhcmFtIHtFdmVudCBvciBUb3VjaH0gcG9pbnRlclxuICovXG5wcm90by5wb2ludGVyRG93biA9IGZ1bmN0aW9uKCBldmVudCwgcG9pbnRlciApIHtcbiAgdmFyIGlzT2theSA9IHRoaXMub2theVBvaW50ZXJEb3duKCBldmVudCApO1xuICBpZiAoICFpc09rYXkgKSB7XG4gICAgcmV0dXJuO1xuICB9XG4gIC8vIHRyYWNrIHN0YXJ0IGV2ZW50IHBvc2l0aW9uXG4gIHRoaXMucG9pbnRlckRvd25Qb2ludGVyID0gcG9pbnRlcjtcblxuICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICB0aGlzLnBvaW50ZXJEb3duQmx1cigpO1xuICAvLyBiaW5kIG1vdmUgYW5kIGVuZCBldmVudHNcbiAgdGhpcy5fYmluZFBvc3RTdGFydEV2ZW50cyggZXZlbnQgKTtcbiAgdGhpcy5lbWl0RXZlbnQoICdwb2ludGVyRG93bicsIFsgZXZlbnQsIHBvaW50ZXIgXSApO1xufTtcblxuLy8gbm9kZXMgdGhhdCBoYXZlIHRleHQgZmllbGRzXG52YXIgY3Vyc29yTm9kZXMgPSB7XG4gIFRFWFRBUkVBOiB0cnVlLFxuICBJTlBVVDogdHJ1ZSxcbiAgU0VMRUNUOiB0cnVlLFxuICBPUFRJT046IHRydWUsXG59O1xuXG4vLyBpbnB1dCB0eXBlcyB0aGF0IGRvIG5vdCBoYXZlIHRleHQgZmllbGRzXG52YXIgY2xpY2tUeXBlcyA9IHtcbiAgcmFkaW86IHRydWUsXG4gIGNoZWNrYm94OiB0cnVlLFxuICBidXR0b246IHRydWUsXG4gIHN1Ym1pdDogdHJ1ZSxcbiAgaW1hZ2U6IHRydWUsXG4gIGZpbGU6IHRydWUsXG59O1xuXG4vLyBkaXNtaXNzIGlucHV0cyB3aXRoIHRleHQgZmllbGRzLiBmbGlja2l0eSM0MDMsIGZsaWNraXR5IzQwNFxucHJvdG8ub2theVBvaW50ZXJEb3duID0gZnVuY3Rpb24oIGV2ZW50ICkge1xuICB2YXIgaXNDdXJzb3JOb2RlID0gY3Vyc29yTm9kZXNbIGV2ZW50LnRhcmdldC5ub2RlTmFtZSBdO1xuICB2YXIgaXNDbGlja1R5cGUgPSBjbGlja1R5cGVzWyBldmVudC50YXJnZXQudHlwZSBdO1xuICB2YXIgaXNPa2F5ID0gIWlzQ3Vyc29yTm9kZSB8fCBpc0NsaWNrVHlwZTtcbiAgaWYgKCAhaXNPa2F5ICkge1xuICAgIHRoaXMuX3BvaW50ZXJSZXNldCgpO1xuICB9XG4gIHJldHVybiBpc09rYXk7XG59O1xuXG4vLyBrbHVkZ2UgdG8gYmx1ciBwcmV2aW91c2x5IGZvY3VzZWQgaW5wdXRcbnByb3RvLnBvaW50ZXJEb3duQmx1ciA9IGZ1bmN0aW9uKCkge1xuICB2YXIgZm9jdXNlZCA9IGRvY3VtZW50LmFjdGl2ZUVsZW1lbnQ7XG4gIC8vIGRvIG5vdCBibHVyIGJvZHkgZm9yIElFMTAsIG1ldGFmaXp6eS9mbGlja2l0eSMxMTdcbiAgdmFyIGNhbkJsdXIgPSBmb2N1c2VkICYmIGZvY3VzZWQuYmx1ciAmJiBmb2N1c2VkICE9IGRvY3VtZW50LmJvZHk7XG4gIGlmICggY2FuQmx1ciApIHtcbiAgICBmb2N1c2VkLmJsdXIoKTtcbiAgfVxufTtcblxuLy8gLS0tLS0gbW92ZSBldmVudCAtLS0tLSAvL1xuXG4vKipcbiAqIGRyYWcgbW92ZVxuICogQHBhcmFtIHtFdmVudH0gZXZlbnRcbiAqIEBwYXJhbSB7RXZlbnQgb3IgVG91Y2h9IHBvaW50ZXJcbiAqL1xucHJvdG8ucG9pbnRlck1vdmUgPSBmdW5jdGlvbiggZXZlbnQsIHBvaW50ZXIgKSB7XG4gIHZhciBtb3ZlVmVjdG9yID0gdGhpcy5fZHJhZ1BvaW50ZXJNb3ZlKCBldmVudCwgcG9pbnRlciApO1xuICB0aGlzLmVtaXRFdmVudCggJ3BvaW50ZXJNb3ZlJywgWyBldmVudCwgcG9pbnRlciwgbW92ZVZlY3RvciBdICk7XG4gIHRoaXMuX2RyYWdNb3ZlKCBldmVudCwgcG9pbnRlciwgbW92ZVZlY3RvciApO1xufTtcblxuLy8gYmFzZSBwb2ludGVyIG1vdmUgbG9naWNcbnByb3RvLl9kcmFnUG9pbnRlck1vdmUgPSBmdW5jdGlvbiggZXZlbnQsIHBvaW50ZXIgKSB7XG4gIHZhciBtb3ZlVmVjdG9yID0ge1xuICAgIHg6IHBvaW50ZXIucGFnZVggLSB0aGlzLnBvaW50ZXJEb3duUG9pbnRlci5wYWdlWCxcbiAgICB5OiBwb2ludGVyLnBhZ2VZIC0gdGhpcy5wb2ludGVyRG93blBvaW50ZXIucGFnZVlcbiAgfTtcbiAgLy8gc3RhcnQgZHJhZyBpZiBwb2ludGVyIGhhcyBtb3ZlZCBmYXIgZW5vdWdoIHRvIHN0YXJ0IGRyYWdcbiAgaWYgKCAhdGhpcy5pc0RyYWdnaW5nICYmIHRoaXMuaGFzRHJhZ1N0YXJ0ZWQoIG1vdmVWZWN0b3IgKSApIHtcbiAgICB0aGlzLl9kcmFnU3RhcnQoIGV2ZW50LCBwb2ludGVyICk7XG4gIH1cbiAgcmV0dXJuIG1vdmVWZWN0b3I7XG59O1xuXG4vLyBjb25kaXRpb24gaWYgcG9pbnRlciBoYXMgbW92ZWQgZmFyIGVub3VnaCB0byBzdGFydCBkcmFnXG5wcm90by5oYXNEcmFnU3RhcnRlZCA9IGZ1bmN0aW9uKCBtb3ZlVmVjdG9yICkge1xuICByZXR1cm4gTWF0aC5hYnMoIG1vdmVWZWN0b3IueCApID4gMyB8fCBNYXRoLmFicyggbW92ZVZlY3Rvci55ICkgPiAzO1xufTtcblxuLy8gLS0tLS0gZW5kIGV2ZW50IC0tLS0tIC8vXG5cbi8qKlxuICogcG9pbnRlciB1cFxuICogQHBhcmFtIHtFdmVudH0gZXZlbnRcbiAqIEBwYXJhbSB7RXZlbnQgb3IgVG91Y2h9IHBvaW50ZXJcbiAqL1xucHJvdG8ucG9pbnRlclVwID0gZnVuY3Rpb24oIGV2ZW50LCBwb2ludGVyICkge1xuICB0aGlzLmVtaXRFdmVudCggJ3BvaW50ZXJVcCcsIFsgZXZlbnQsIHBvaW50ZXIgXSApO1xuICB0aGlzLl9kcmFnUG9pbnRlclVwKCBldmVudCwgcG9pbnRlciApO1xufTtcblxucHJvdG8uX2RyYWdQb2ludGVyVXAgPSBmdW5jdGlvbiggZXZlbnQsIHBvaW50ZXIgKSB7XG4gIGlmICggdGhpcy5pc0RyYWdnaW5nICkge1xuICAgIHRoaXMuX2RyYWdFbmQoIGV2ZW50LCBwb2ludGVyICk7XG4gIH0gZWxzZSB7XG4gICAgLy8gcG9pbnRlciBkaWRuJ3QgbW92ZSBlbm91Z2ggZm9yIGRyYWcgdG8gc3RhcnRcbiAgICB0aGlzLl9zdGF0aWNDbGljayggZXZlbnQsIHBvaW50ZXIgKTtcbiAgfVxufTtcblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gZHJhZyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSAvL1xuXG4vLyBkcmFnU3RhcnRcbnByb3RvLl9kcmFnU3RhcnQgPSBmdW5jdGlvbiggZXZlbnQsIHBvaW50ZXIgKSB7XG4gIHRoaXMuaXNEcmFnZ2luZyA9IHRydWU7XG4gIC8vIHByZXZlbnQgY2xpY2tzXG4gIHRoaXMuaXNQcmV2ZW50aW5nQ2xpY2tzID0gdHJ1ZTtcbiAgdGhpcy5kcmFnU3RhcnQoIGV2ZW50LCBwb2ludGVyICk7XG59O1xuXG5wcm90by5kcmFnU3RhcnQgPSBmdW5jdGlvbiggZXZlbnQsIHBvaW50ZXIgKSB7XG4gIHRoaXMuZW1pdEV2ZW50KCAnZHJhZ1N0YXJ0JywgWyBldmVudCwgcG9pbnRlciBdICk7XG59O1xuXG4vLyBkcmFnTW92ZVxucHJvdG8uX2RyYWdNb3ZlID0gZnVuY3Rpb24oIGV2ZW50LCBwb2ludGVyLCBtb3ZlVmVjdG9yICkge1xuICAvLyBkbyBub3QgZHJhZyBpZiBub3QgZHJhZ2dpbmcgeWV0XG4gIGlmICggIXRoaXMuaXNEcmFnZ2luZyApIHtcbiAgICByZXR1cm47XG4gIH1cblxuICB0aGlzLmRyYWdNb3ZlKCBldmVudCwgcG9pbnRlciwgbW92ZVZlY3RvciApO1xufTtcblxucHJvdG8uZHJhZ01vdmUgPSBmdW5jdGlvbiggZXZlbnQsIHBvaW50ZXIsIG1vdmVWZWN0b3IgKSB7XG4gIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gIHRoaXMuZW1pdEV2ZW50KCAnZHJhZ01vdmUnLCBbIGV2ZW50LCBwb2ludGVyLCBtb3ZlVmVjdG9yIF0gKTtcbn07XG5cbi8vIGRyYWdFbmRcbnByb3RvLl9kcmFnRW5kID0gZnVuY3Rpb24oIGV2ZW50LCBwb2ludGVyICkge1xuICAvLyBzZXQgZmxhZ3NcbiAgdGhpcy5pc0RyYWdnaW5nID0gZmFsc2U7XG4gIC8vIHJlLWVuYWJsZSBjbGlja2luZyBhc3luY1xuICBzZXRUaW1lb3V0KCBmdW5jdGlvbigpIHtcbiAgICBkZWxldGUgdGhpcy5pc1ByZXZlbnRpbmdDbGlja3M7XG4gIH0uYmluZCggdGhpcyApICk7XG5cbiAgdGhpcy5kcmFnRW5kKCBldmVudCwgcG9pbnRlciApO1xufTtcblxucHJvdG8uZHJhZ0VuZCA9IGZ1bmN0aW9uKCBldmVudCwgcG9pbnRlciApIHtcbiAgdGhpcy5lbWl0RXZlbnQoICdkcmFnRW5kJywgWyBldmVudCwgcG9pbnRlciBdICk7XG59O1xuXG4vLyAtLS0tLSBvbmNsaWNrIC0tLS0tIC8vXG5cbi8vIGhhbmRsZSBhbGwgY2xpY2tzIGFuZCBwcmV2ZW50IGNsaWNrcyB3aGVuIGRyYWdnaW5nXG5wcm90by5vbmNsaWNrID0gZnVuY3Rpb24oIGV2ZW50ICkge1xuICBpZiAoIHRoaXMuaXNQcmV2ZW50aW5nQ2xpY2tzICkge1xuICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gIH1cbn07XG5cbi8vIC0tLS0tIHN0YXRpY0NsaWNrIC0tLS0tIC8vXG5cbi8vIHRyaWdnZXJlZCBhZnRlciBwb2ludGVyIGRvd24gJiB1cCB3aXRoIG5vL3RpbnkgbW92ZW1lbnRcbnByb3RvLl9zdGF0aWNDbGljayA9IGZ1bmN0aW9uKCBldmVudCwgcG9pbnRlciApIHtcbiAgLy8gaWdub3JlIGVtdWxhdGVkIG1vdXNlIHVwIGNsaWNrc1xuICBpZiAoIHRoaXMuaXNJZ25vcmluZ01vdXNlVXAgJiYgZXZlbnQudHlwZSA9PSAnbW91c2V1cCcgKSB7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgdGhpcy5zdGF0aWNDbGljayggZXZlbnQsIHBvaW50ZXIgKTtcblxuICAvLyBzZXQgZmxhZyBmb3IgZW11bGF0ZWQgY2xpY2tzIDMwMG1zIGFmdGVyIHRvdWNoZW5kXG4gIGlmICggZXZlbnQudHlwZSAhPSAnbW91c2V1cCcgKSB7XG4gICAgdGhpcy5pc0lnbm9yaW5nTW91c2VVcCA9IHRydWU7XG4gICAgLy8gcmVzZXQgZmxhZyBhZnRlciAzMDBtc1xuICAgIHNldFRpbWVvdXQoIGZ1bmN0aW9uKCkge1xuICAgICAgZGVsZXRlIHRoaXMuaXNJZ25vcmluZ01vdXNlVXA7XG4gICAgfS5iaW5kKCB0aGlzICksIDQwMCApO1xuICB9XG59O1xuXG5wcm90by5zdGF0aWNDbGljayA9IGZ1bmN0aW9uKCBldmVudCwgcG9pbnRlciApIHtcbiAgdGhpcy5lbWl0RXZlbnQoICdzdGF0aWNDbGljaycsIFsgZXZlbnQsIHBvaW50ZXIgXSApO1xufTtcblxuLy8gLS0tLS0gdXRpbHMgLS0tLS0gLy9cblxuVW5pZHJhZ2dlci5nZXRQb2ludGVyUG9pbnQgPSBVbmlwb2ludGVyLmdldFBvaW50ZXJQb2ludDtcblxuLy8gLS0tLS0gIC0tLS0tIC8vXG5cbnJldHVybiBVbmlkcmFnZ2VyO1xuXG59KSk7XG4iLCIvLyBkcmFnXG4oIGZ1bmN0aW9uKCB3aW5kb3csIGZhY3RvcnkgKSB7XG4gIC8vIHVuaXZlcnNhbCBtb2R1bGUgZGVmaW5pdGlvblxuICAvKiBqc2hpbnQgc3RyaWN0OiBmYWxzZSAqL1xuICBpZiAoIHR5cGVvZiBkZWZpbmUgPT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kICkge1xuICAgIC8vIEFNRFxuICAgIGRlZmluZSggW1xuICAgICAgJy4vZmxpY2tpdHknLFxuICAgICAgJ3VuaWRyYWdnZXIvdW5pZHJhZ2dlcicsXG4gICAgICAnZml6enktdWktdXRpbHMvdXRpbHMnXG4gICAgXSwgZnVuY3Rpb24oIEZsaWNraXR5LCBVbmlkcmFnZ2VyLCB1dGlscyApIHtcbiAgICAgIHJldHVybiBmYWN0b3J5KCB3aW5kb3csIEZsaWNraXR5LCBVbmlkcmFnZ2VyLCB1dGlscyApO1xuICAgIH0pO1xuICB9IGVsc2UgaWYgKCB0eXBlb2YgbW9kdWxlID09ICdvYmplY3QnICYmIG1vZHVsZS5leHBvcnRzICkge1xuICAgIC8vIENvbW1vbkpTXG4gICAgbW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KFxuICAgICAgd2luZG93LFxuICAgICAgcmVxdWlyZSgnLi9mbGlja2l0eScpLFxuICAgICAgcmVxdWlyZSgndW5pZHJhZ2dlcicpLFxuICAgICAgcmVxdWlyZSgnZml6enktdWktdXRpbHMnKVxuICAgICk7XG4gIH0gZWxzZSB7XG4gICAgLy8gYnJvd3NlciBnbG9iYWxcbiAgICB3aW5kb3cuRmxpY2tpdHkgPSBmYWN0b3J5KFxuICAgICAgd2luZG93LFxuICAgICAgd2luZG93LkZsaWNraXR5LFxuICAgICAgd2luZG93LlVuaWRyYWdnZXIsXG4gICAgICB3aW5kb3cuZml6enlVSVV0aWxzXG4gICAgKTtcbiAgfVxuXG59KCB3aW5kb3csIGZ1bmN0aW9uIGZhY3RvcnkoIHdpbmRvdywgRmxpY2tpdHksIFVuaWRyYWdnZXIsIHV0aWxzICkge1xuXG4ndXNlIHN0cmljdCc7XG5cbi8vIC0tLS0tIGRlZmF1bHRzIC0tLS0tIC8vXG5cbnV0aWxzLmV4dGVuZCggRmxpY2tpdHkuZGVmYXVsdHMsIHtcbiAgZHJhZ2dhYmxlOiAnPjEnLFxuICBkcmFnVGhyZXNob2xkOiAzLFxufSk7XG5cbi8vIC0tLS0tIGNyZWF0ZSAtLS0tLSAvL1xuXG5GbGlja2l0eS5jcmVhdGVNZXRob2RzLnB1c2goJ19jcmVhdGVEcmFnJyk7XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIGRyYWcgcHJvdG90eXBlIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIC8vXG5cbnZhciBwcm90byA9IEZsaWNraXR5LnByb3RvdHlwZTtcbnV0aWxzLmV4dGVuZCggcHJvdG8sIFVuaWRyYWdnZXIucHJvdG90eXBlICk7XG5wcm90by5fdG91Y2hBY3Rpb25WYWx1ZSA9ICdwYW4teSc7XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tICAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSAvL1xuXG52YXIgaXNUb3VjaCA9ICdjcmVhdGVUb3VjaCcgaW4gZG9jdW1lbnQ7XG52YXIgaXNUb3VjaG1vdmVTY3JvbGxDYW5jZWxlZCA9IGZhbHNlO1xuXG5wcm90by5fY3JlYXRlRHJhZyA9IGZ1bmN0aW9uKCkge1xuICB0aGlzLm9uKCAnYWN0aXZhdGUnLCB0aGlzLm9uQWN0aXZhdGVEcmFnICk7XG4gIHRoaXMub24oICd1aUNoYW5nZScsIHRoaXMuX3VpQ2hhbmdlRHJhZyApO1xuICB0aGlzLm9uKCAnZGVhY3RpdmF0ZScsIHRoaXMub25EZWFjdGl2YXRlRHJhZyApO1xuICB0aGlzLm9uKCAnY2VsbENoYW5nZScsIHRoaXMudXBkYXRlRHJhZ2dhYmxlICk7XG4gIC8vIFRPRE8gdXBkYXRlRHJhZ2dhYmxlIG9uIHJlc2l6ZT8gaWYgZ3JvdXBDZWxscyAmIHNsaWRlcyBjaGFuZ2VcbiAgLy8gSEFDSyAtIGFkZCBzZWVtaW5nbHkgaW5ub2N1b3VzIGhhbmRsZXIgdG8gZml4IGlPUyAxMCBzY3JvbGwgYmVoYXZpb3JcbiAgLy8gIzQ1NywgUnViYVhhL1NvcnRhYmxlIzk3M1xuICBpZiAoIGlzVG91Y2ggJiYgIWlzVG91Y2htb3ZlU2Nyb2xsQ2FuY2VsZWQgKSB7XG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoICd0b3VjaG1vdmUnLCBmdW5jdGlvbigpIHt9KTtcbiAgICBpc1RvdWNobW92ZVNjcm9sbENhbmNlbGVkID0gdHJ1ZTtcbiAgfVxufTtcblxucHJvdG8ub25BY3RpdmF0ZURyYWcgPSBmdW5jdGlvbigpIHtcbiAgdGhpcy5oYW5kbGVzID0gWyB0aGlzLnZpZXdwb3J0IF07XG4gIHRoaXMuYmluZEhhbmRsZXMoKTtcbiAgdGhpcy51cGRhdGVEcmFnZ2FibGUoKTtcbn07XG5cbnByb3RvLm9uRGVhY3RpdmF0ZURyYWcgPSBmdW5jdGlvbigpIHtcbiAgdGhpcy51bmJpbmRIYW5kbGVzKCk7XG4gIHRoaXMuZWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKCdpcy1kcmFnZ2FibGUnKTtcbn07XG5cbnByb3RvLnVwZGF0ZURyYWdnYWJsZSA9IGZ1bmN0aW9uKCkge1xuICAvLyBkaXNhYmxlIGRyYWdnaW5nIGlmIGxlc3MgdGhhbiAyIHNsaWRlcy4gIzI3OFxuICBpZiAoIHRoaXMub3B0aW9ucy5kcmFnZ2FibGUgPT0gJz4xJyApIHtcbiAgICB0aGlzLmlzRHJhZ2dhYmxlID0gdGhpcy5zbGlkZXMubGVuZ3RoID4gMTtcbiAgfSBlbHNlIHtcbiAgICB0aGlzLmlzRHJhZ2dhYmxlID0gdGhpcy5vcHRpb25zLmRyYWdnYWJsZTtcbiAgfVxuICBpZiAoIHRoaXMuaXNEcmFnZ2FibGUgKSB7XG4gICAgdGhpcy5lbGVtZW50LmNsYXNzTGlzdC5hZGQoJ2lzLWRyYWdnYWJsZScpO1xuICB9IGVsc2Uge1xuICAgIHRoaXMuZWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKCdpcy1kcmFnZ2FibGUnKTtcbiAgfVxufTtcblxuLy8gYmFja3dhcmRzIGNvbXBhdGliaWxpdHlcbnByb3RvLmJpbmREcmFnID0gZnVuY3Rpb24oKSB7XG4gIHRoaXMub3B0aW9ucy5kcmFnZ2FibGUgPSB0cnVlO1xuICB0aGlzLnVwZGF0ZURyYWdnYWJsZSgpO1xufTtcblxucHJvdG8udW5iaW5kRHJhZyA9IGZ1bmN0aW9uKCkge1xuICB0aGlzLm9wdGlvbnMuZHJhZ2dhYmxlID0gZmFsc2U7XG4gIHRoaXMudXBkYXRlRHJhZ2dhYmxlKCk7XG59O1xuXG5wcm90by5fdWlDaGFuZ2VEcmFnID0gZnVuY3Rpb24oKSB7XG4gIGRlbGV0ZSB0aGlzLmlzRnJlZVNjcm9sbGluZztcbn07XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIHBvaW50ZXIgZXZlbnRzIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIC8vXG5cbnByb3RvLnBvaW50ZXJEb3duID0gZnVuY3Rpb24oIGV2ZW50LCBwb2ludGVyICkge1xuICBpZiAoICF0aGlzLmlzRHJhZ2dhYmxlICkge1xuICAgIHRoaXMuX3BvaW50ZXJEb3duRGVmYXVsdCggZXZlbnQsIHBvaW50ZXIgKTtcbiAgICByZXR1cm47XG4gIH1cbiAgdmFyIGlzT2theSA9IHRoaXMub2theVBvaW50ZXJEb3duKCBldmVudCApO1xuICBpZiAoICFpc09rYXkgKSB7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgdGhpcy5fcG9pbnRlckRvd25QcmV2ZW50RGVmYXVsdCggZXZlbnQgKTtcbiAgdGhpcy5wb2ludGVyRG93bkZvY3VzKCBldmVudCApO1xuICAvLyBibHVyXG4gIGlmICggZG9jdW1lbnQuYWN0aXZlRWxlbWVudCAhPSB0aGlzLmVsZW1lbnQgKSB7XG4gICAgLy8gZG8gbm90IGJsdXIgaWYgYWxyZWFkeSBmb2N1c2VkXG4gICAgdGhpcy5wb2ludGVyRG93bkJsdXIoKTtcbiAgfVxuXG4gIC8vIHN0b3AgaWYgaXQgd2FzIG1vdmluZ1xuICB0aGlzLmRyYWdYID0gdGhpcy54O1xuICB0aGlzLnZpZXdwb3J0LmNsYXNzTGlzdC5hZGQoJ2lzLXBvaW50ZXItZG93bicpO1xuICAvLyB0cmFjayBzY3JvbGxpbmdcbiAgdGhpcy5wb2ludGVyRG93blNjcm9sbCA9IGdldFNjcm9sbFBvc2l0aW9uKCk7XG4gIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCAnc2Nyb2xsJywgdGhpcyApO1xuXG4gIHRoaXMuX3BvaW50ZXJEb3duRGVmYXVsdCggZXZlbnQsIHBvaW50ZXIgKTtcbn07XG5cbi8vIGRlZmF1bHQgcG9pbnRlckRvd24gbG9naWMsIHVzZWQgZm9yIHN0YXRpY0NsaWNrXG5wcm90by5fcG9pbnRlckRvd25EZWZhdWx0ID0gZnVuY3Rpb24oIGV2ZW50LCBwb2ludGVyICkge1xuICAvLyB0cmFjayBzdGFydCBldmVudCBwb3NpdGlvblxuICAvLyBTYWZhcmkgOSBvdmVycmlkZXMgcGFnZVggYW5kIHBhZ2VZLiBUaGVzZSB2YWx1ZXMgbmVlZHMgdG8gYmUgY29waWVkLiAjNzc5XG4gIHRoaXMucG9pbnRlckRvd25Qb2ludGVyID0ge1xuICAgIHBhZ2VYOiBwb2ludGVyLnBhZ2VYLFxuICAgIHBhZ2VZOiBwb2ludGVyLnBhZ2VZLFxuICB9O1xuICAvLyBiaW5kIG1vdmUgYW5kIGVuZCBldmVudHNcbiAgdGhpcy5fYmluZFBvc3RTdGFydEV2ZW50cyggZXZlbnQgKTtcbiAgdGhpcy5kaXNwYXRjaEV2ZW50KCAncG9pbnRlckRvd24nLCBldmVudCwgWyBwb2ludGVyIF0gKTtcbn07XG5cbnZhciBmb2N1c05vZGVzID0ge1xuICBJTlBVVDogdHJ1ZSxcbiAgVEVYVEFSRUE6IHRydWUsXG4gIFNFTEVDVDogdHJ1ZSxcbn07XG5cbnByb3RvLnBvaW50ZXJEb3duRm9jdXMgPSBmdW5jdGlvbiggZXZlbnQgKSB7XG4gIHZhciBpc0ZvY3VzTm9kZSA9IGZvY3VzTm9kZXNbIGV2ZW50LnRhcmdldC5ub2RlTmFtZSBdO1xuICBpZiAoICFpc0ZvY3VzTm9kZSApIHtcbiAgICB0aGlzLmZvY3VzKCk7XG4gIH1cbn07XG5cbnByb3RvLl9wb2ludGVyRG93blByZXZlbnREZWZhdWx0ID0gZnVuY3Rpb24oIGV2ZW50ICkge1xuICB2YXIgaXNUb3VjaFN0YXJ0ID0gZXZlbnQudHlwZSA9PSAndG91Y2hzdGFydCc7XG4gIHZhciBpc1RvdWNoUG9pbnRlciA9IGV2ZW50LnBvaW50ZXJUeXBlID09ICd0b3VjaCc7XG4gIHZhciBpc0ZvY3VzTm9kZSA9IGZvY3VzTm9kZXNbIGV2ZW50LnRhcmdldC5ub2RlTmFtZSBdO1xuICBpZiAoICFpc1RvdWNoU3RhcnQgJiYgIWlzVG91Y2hQb2ludGVyICYmICFpc0ZvY3VzTm9kZSApIHtcbiAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICB9XG59O1xuXG4vLyAtLS0tLSBtb3ZlIC0tLS0tIC8vXG5cbnByb3RvLmhhc0RyYWdTdGFydGVkID0gZnVuY3Rpb24oIG1vdmVWZWN0b3IgKSB7XG4gIHJldHVybiBNYXRoLmFicyggbW92ZVZlY3Rvci54ICkgPiB0aGlzLm9wdGlvbnMuZHJhZ1RocmVzaG9sZDtcbn07XG5cbi8vIC0tLS0tIHVwIC0tLS0tIC8vXG5cbnByb3RvLnBvaW50ZXJVcCA9IGZ1bmN0aW9uKCBldmVudCwgcG9pbnRlciApIHtcbiAgZGVsZXRlIHRoaXMuaXNUb3VjaFNjcm9sbGluZztcbiAgdGhpcy52aWV3cG9ydC5jbGFzc0xpc3QucmVtb3ZlKCdpcy1wb2ludGVyLWRvd24nKTtcbiAgdGhpcy5kaXNwYXRjaEV2ZW50KCAncG9pbnRlclVwJywgZXZlbnQsIFsgcG9pbnRlciBdICk7XG4gIHRoaXMuX2RyYWdQb2ludGVyVXAoIGV2ZW50LCBwb2ludGVyICk7XG59O1xuXG5wcm90by5wb2ludGVyRG9uZSA9IGZ1bmN0aW9uKCkge1xuICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lciggJ3Njcm9sbCcsIHRoaXMgKTtcbiAgZGVsZXRlIHRoaXMucG9pbnRlckRvd25TY3JvbGw7XG59O1xuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSBkcmFnZ2luZyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSAvL1xuXG5wcm90by5kcmFnU3RhcnQgPSBmdW5jdGlvbiggZXZlbnQsIHBvaW50ZXIgKSB7XG4gIGlmICggIXRoaXMuaXNEcmFnZ2FibGUgKSB7XG4gICAgcmV0dXJuO1xuICB9XG4gIHRoaXMuZHJhZ1N0YXJ0UG9zaXRpb24gPSB0aGlzLng7XG4gIHRoaXMuc3RhcnRBbmltYXRpb24oKTtcbiAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoICdzY3JvbGwnLCB0aGlzICk7XG4gIHRoaXMuZGlzcGF0Y2hFdmVudCggJ2RyYWdTdGFydCcsIGV2ZW50LCBbIHBvaW50ZXIgXSApO1xufTtcblxucHJvdG8ucG9pbnRlck1vdmUgPSBmdW5jdGlvbiggZXZlbnQsIHBvaW50ZXIgKSB7XG4gIHZhciBtb3ZlVmVjdG9yID0gdGhpcy5fZHJhZ1BvaW50ZXJNb3ZlKCBldmVudCwgcG9pbnRlciApO1xuICB0aGlzLmRpc3BhdGNoRXZlbnQoICdwb2ludGVyTW92ZScsIGV2ZW50LCBbIHBvaW50ZXIsIG1vdmVWZWN0b3IgXSApO1xuICB0aGlzLl9kcmFnTW92ZSggZXZlbnQsIHBvaW50ZXIsIG1vdmVWZWN0b3IgKTtcbn07XG5cbnByb3RvLmRyYWdNb3ZlID0gZnVuY3Rpb24oIGV2ZW50LCBwb2ludGVyLCBtb3ZlVmVjdG9yICkge1xuICBpZiAoICF0aGlzLmlzRHJhZ2dhYmxlICkge1xuICAgIHJldHVybjtcbiAgfVxuICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gIHRoaXMucHJldmlvdXNEcmFnWCA9IHRoaXMuZHJhZ1g7XG4gIC8vIHJldmVyc2UgaWYgcmlnaHQtdG8tbGVmdFxuICB2YXIgZGlyZWN0aW9uID0gdGhpcy5vcHRpb25zLnJpZ2h0VG9MZWZ0ID8gLTEgOiAxO1xuICBpZiAoIHRoaXMub3B0aW9ucy53cmFwQXJvdW5kICkge1xuICAgIC8vIHdyYXAgYXJvdW5kIG1vdmUuICM1ODlcbiAgICBtb3ZlVmVjdG9yLnggPSBtb3ZlVmVjdG9yLnggJSB0aGlzLnNsaWRlYWJsZVdpZHRoO1xuICB9XG4gIHZhciBkcmFnWCA9IHRoaXMuZHJhZ1N0YXJ0UG9zaXRpb24gKyBtb3ZlVmVjdG9yLnggKiBkaXJlY3Rpb247XG5cbiAgaWYgKCAhdGhpcy5vcHRpb25zLndyYXBBcm91bmQgJiYgdGhpcy5zbGlkZXMubGVuZ3RoICkge1xuICAgIC8vIHNsb3cgZHJhZ1xuICAgIHZhciBvcmlnaW5Cb3VuZCA9IE1hdGgubWF4KCAtdGhpcy5zbGlkZXNbMF0udGFyZ2V0LCB0aGlzLmRyYWdTdGFydFBvc2l0aW9uICk7XG4gICAgZHJhZ1ggPSBkcmFnWCA+IG9yaWdpbkJvdW5kID8gKCBkcmFnWCArIG9yaWdpbkJvdW5kICkgKiAwLjUgOiBkcmFnWDtcbiAgICB2YXIgZW5kQm91bmQgPSBNYXRoLm1pbiggLXRoaXMuZ2V0TGFzdFNsaWRlKCkudGFyZ2V0LCB0aGlzLmRyYWdTdGFydFBvc2l0aW9uICk7XG4gICAgZHJhZ1ggPSBkcmFnWCA8IGVuZEJvdW5kID8gKCBkcmFnWCArIGVuZEJvdW5kICkgKiAwLjUgOiBkcmFnWDtcbiAgfVxuXG4gIHRoaXMuZHJhZ1ggPSBkcmFnWDtcblxuICB0aGlzLmRyYWdNb3ZlVGltZSA9IG5ldyBEYXRlKCk7XG4gIHRoaXMuZGlzcGF0Y2hFdmVudCggJ2RyYWdNb3ZlJywgZXZlbnQsIFsgcG9pbnRlciwgbW92ZVZlY3RvciBdICk7XG59O1xuXG5wcm90by5kcmFnRW5kID0gZnVuY3Rpb24oIGV2ZW50LCBwb2ludGVyICkge1xuICBpZiAoICF0aGlzLmlzRHJhZ2dhYmxlICkge1xuICAgIHJldHVybjtcbiAgfVxuICBpZiAoIHRoaXMub3B0aW9ucy5mcmVlU2Nyb2xsICkge1xuICAgIHRoaXMuaXNGcmVlU2Nyb2xsaW5nID0gdHJ1ZTtcbiAgfVxuICAvLyBzZXQgc2VsZWN0ZWRJbmRleCBiYXNlZCBvbiB3aGVyZSBmbGljayB3aWxsIGVuZCB1cFxuICB2YXIgaW5kZXggPSB0aGlzLmRyYWdFbmRSZXN0aW5nU2VsZWN0KCk7XG5cbiAgaWYgKCB0aGlzLm9wdGlvbnMuZnJlZVNjcm9sbCAmJiAhdGhpcy5vcHRpb25zLndyYXBBcm91bmQgKSB7XG4gICAgLy8gaWYgZnJlZS1zY3JvbGwgJiBub3Qgd3JhcCBhcm91bmRcbiAgICAvLyBkbyBub3QgZnJlZS1zY3JvbGwgaWYgZ29pbmcgb3V0c2lkZSBvZiBib3VuZGluZyBzbGlkZXNcbiAgICAvLyBzbyBib3VuZGluZyBzbGlkZXMgY2FuIGF0dHJhY3Qgc2xpZGVyLCBhbmQga2VlcCBpdCBpbiBib3VuZHNcbiAgICB2YXIgcmVzdGluZ1ggPSB0aGlzLmdldFJlc3RpbmdQb3NpdGlvbigpO1xuICAgIHRoaXMuaXNGcmVlU2Nyb2xsaW5nID0gLXJlc3RpbmdYID4gdGhpcy5zbGlkZXNbMF0udGFyZ2V0ICYmXG4gICAgICAtcmVzdGluZ1ggPCB0aGlzLmdldExhc3RTbGlkZSgpLnRhcmdldDtcbiAgfSBlbHNlIGlmICggIXRoaXMub3B0aW9ucy5mcmVlU2Nyb2xsICYmIGluZGV4ID09IHRoaXMuc2VsZWN0ZWRJbmRleCApIHtcbiAgICAvLyBib29zdCBzZWxlY3Rpb24gaWYgc2VsZWN0ZWQgaW5kZXggaGFzIG5vdCBjaGFuZ2VkXG4gICAgaW5kZXggKz0gdGhpcy5kcmFnRW5kQm9vc3RTZWxlY3QoKTtcbiAgfVxuICBkZWxldGUgdGhpcy5wcmV2aW91c0RyYWdYO1xuICAvLyBhcHBseSBzZWxlY3Rpb25cbiAgLy8gVE9ETyByZWZhY3RvciB0aGlzLCBzZWxlY3RpbmcgaGVyZSBmZWVscyB3ZWlyZFxuICAvLyBIQUNLLCBzZXQgZmxhZyBzbyBkcmFnZ2luZyBzdGF5cyBpbiBjb3JyZWN0IGRpcmVjdGlvblxuICB0aGlzLmlzRHJhZ1NlbGVjdCA9IHRoaXMub3B0aW9ucy53cmFwQXJvdW5kO1xuICB0aGlzLnNlbGVjdCggaW5kZXggKTtcbiAgZGVsZXRlIHRoaXMuaXNEcmFnU2VsZWN0O1xuICB0aGlzLmRpc3BhdGNoRXZlbnQoICdkcmFnRW5kJywgZXZlbnQsIFsgcG9pbnRlciBdICk7XG59O1xuXG5wcm90by5kcmFnRW5kUmVzdGluZ1NlbGVjdCA9IGZ1bmN0aW9uKCkge1xuICB2YXIgcmVzdGluZ1ggPSB0aGlzLmdldFJlc3RpbmdQb3NpdGlvbigpO1xuICAvLyBob3cgZmFyIGF3YXkgZnJvbSBzZWxlY3RlZCBzbGlkZVxuICB2YXIgZGlzdGFuY2UgPSBNYXRoLmFicyggdGhpcy5nZXRTbGlkZURpc3RhbmNlKCAtcmVzdGluZ1gsIHRoaXMuc2VsZWN0ZWRJbmRleCApICk7XG4gIC8vIGdldCBjbG9zZXQgcmVzdGluZyBnb2luZyB1cCBhbmQgZ29pbmcgZG93blxuICB2YXIgcG9zaXRpdmVSZXN0aW5nID0gdGhpcy5fZ2V0Q2xvc2VzdFJlc3RpbmcoIHJlc3RpbmdYLCBkaXN0YW5jZSwgMSApO1xuICB2YXIgbmVnYXRpdmVSZXN0aW5nID0gdGhpcy5fZ2V0Q2xvc2VzdFJlc3RpbmcoIHJlc3RpbmdYLCBkaXN0YW5jZSwgLTEgKTtcbiAgLy8gdXNlIGNsb3NlciByZXN0aW5nIGZvciB3cmFwLWFyb3VuZFxuICB2YXIgaW5kZXggPSBwb3NpdGl2ZVJlc3RpbmcuZGlzdGFuY2UgPCBuZWdhdGl2ZVJlc3RpbmcuZGlzdGFuY2UgP1xuICAgIHBvc2l0aXZlUmVzdGluZy5pbmRleCA6IG5lZ2F0aXZlUmVzdGluZy5pbmRleDtcbiAgcmV0dXJuIGluZGV4O1xufTtcblxuLyoqXG4gKiBnaXZlbiByZXN0aW5nIFggYW5kIGRpc3RhbmNlIHRvIHNlbGVjdGVkIGNlbGxcbiAqIGdldCB0aGUgZGlzdGFuY2UgYW5kIGluZGV4IG9mIHRoZSBjbG9zZXN0IGNlbGxcbiAqIEBwYXJhbSB7TnVtYmVyfSByZXN0aW5nWCAtIGVzdGltYXRlZCBwb3N0LWZsaWNrIHJlc3RpbmcgcG9zaXRpb25cbiAqIEBwYXJhbSB7TnVtYmVyfSBkaXN0YW5jZSAtIGRpc3RhbmNlIHRvIHNlbGVjdGVkIGNlbGxcbiAqIEBwYXJhbSB7SW50ZWdlcn0gaW5jcmVtZW50IC0gKzEgb3IgLTEsIGdvaW5nIHVwIG9yIGRvd25cbiAqIEByZXR1cm5zIHtPYmplY3R9IC0geyBkaXN0YW5jZToge051bWJlcn0sIGluZGV4OiB7SW50ZWdlcn0gfVxuICovXG5wcm90by5fZ2V0Q2xvc2VzdFJlc3RpbmcgPSBmdW5jdGlvbiggcmVzdGluZ1gsIGRpc3RhbmNlLCBpbmNyZW1lbnQgKSB7XG4gIHZhciBpbmRleCA9IHRoaXMuc2VsZWN0ZWRJbmRleDtcbiAgdmFyIG1pbkRpc3RhbmNlID0gSW5maW5pdHk7XG4gIHZhciBjb25kaXRpb24gPSB0aGlzLm9wdGlvbnMuY29udGFpbiAmJiAhdGhpcy5vcHRpb25zLndyYXBBcm91bmQgP1xuICAgIC8vIGlmIGNvbnRhaW4sIGtlZXAgZ29pbmcgaWYgZGlzdGFuY2UgaXMgZXF1YWwgdG8gbWluRGlzdGFuY2VcbiAgICBmdW5jdGlvbiggZCwgbWQgKSB7IHJldHVybiBkIDw9IG1kOyB9IDogZnVuY3Rpb24oIGQsIG1kICkgeyByZXR1cm4gZCA8IG1kOyB9O1xuICB3aGlsZSAoIGNvbmRpdGlvbiggZGlzdGFuY2UsIG1pbkRpc3RhbmNlICkgKSB7XG4gICAgLy8gbWVhc3VyZSBkaXN0YW5jZSB0byBuZXh0IGNlbGxcbiAgICBpbmRleCArPSBpbmNyZW1lbnQ7XG4gICAgbWluRGlzdGFuY2UgPSBkaXN0YW5jZTtcbiAgICBkaXN0YW5jZSA9IHRoaXMuZ2V0U2xpZGVEaXN0YW5jZSggLXJlc3RpbmdYLCBpbmRleCApO1xuICAgIGlmICggZGlzdGFuY2UgPT09IG51bGwgKSB7XG4gICAgICBicmVhaztcbiAgICB9XG4gICAgZGlzdGFuY2UgPSBNYXRoLmFicyggZGlzdGFuY2UgKTtcbiAgfVxuICByZXR1cm4ge1xuICAgIGRpc3RhbmNlOiBtaW5EaXN0YW5jZSxcbiAgICAvLyBzZWxlY3RlZCB3YXMgcHJldmlvdXMgaW5kZXhcbiAgICBpbmRleDogaW5kZXggLSBpbmNyZW1lbnRcbiAgfTtcbn07XG5cbi8qKlxuICogbWVhc3VyZSBkaXN0YW5jZSBiZXR3ZWVuIHggYW5kIGEgc2xpZGUgdGFyZ2V0XG4gKiBAcGFyYW0ge051bWJlcn0geFxuICogQHBhcmFtIHtJbnRlZ2VyfSBpbmRleCAtIHNsaWRlIGluZGV4XG4gKi9cbnByb3RvLmdldFNsaWRlRGlzdGFuY2UgPSBmdW5jdGlvbiggeCwgaW5kZXggKSB7XG4gIHZhciBsZW4gPSB0aGlzLnNsaWRlcy5sZW5ndGg7XG4gIC8vIHdyYXAgYXJvdW5kIGlmIGF0IGxlYXN0IDIgc2xpZGVzXG4gIHZhciBpc1dyYXBBcm91bmQgPSB0aGlzLm9wdGlvbnMud3JhcEFyb3VuZCAmJiBsZW4gPiAxO1xuICB2YXIgc2xpZGVJbmRleCA9IGlzV3JhcEFyb3VuZCA/IHV0aWxzLm1vZHVsbyggaW5kZXgsIGxlbiApIDogaW5kZXg7XG4gIHZhciBzbGlkZSA9IHRoaXMuc2xpZGVzWyBzbGlkZUluZGV4IF07XG4gIGlmICggIXNsaWRlICkge1xuICAgIHJldHVybiBudWxsO1xuICB9XG4gIC8vIGFkZCBkaXN0YW5jZSBmb3Igd3JhcC1hcm91bmQgc2xpZGVzXG4gIHZhciB3cmFwID0gaXNXcmFwQXJvdW5kID8gdGhpcy5zbGlkZWFibGVXaWR0aCAqIE1hdGguZmxvb3IoIGluZGV4IC8gbGVuICkgOiAwO1xuICByZXR1cm4geCAtICggc2xpZGUudGFyZ2V0ICsgd3JhcCApO1xufTtcblxucHJvdG8uZHJhZ0VuZEJvb3N0U2VsZWN0ID0gZnVuY3Rpb24oKSB7XG4gIC8vIGRvIG5vdCBib29zdCBpZiBubyBwcmV2aW91c0RyYWdYIG9yIGRyYWdNb3ZlVGltZVxuICBpZiAoIHRoaXMucHJldmlvdXNEcmFnWCA9PT0gdW5kZWZpbmVkIHx8ICF0aGlzLmRyYWdNb3ZlVGltZSB8fFxuICAgIC8vIG9yIGlmIGRyYWcgd2FzIGhlbGQgZm9yIDEwMCBtc1xuICAgIG5ldyBEYXRlKCkgLSB0aGlzLmRyYWdNb3ZlVGltZSA+IDEwMCApIHtcbiAgICByZXR1cm4gMDtcbiAgfVxuXG4gIHZhciBkaXN0YW5jZSA9IHRoaXMuZ2V0U2xpZGVEaXN0YW5jZSggLXRoaXMuZHJhZ1gsIHRoaXMuc2VsZWN0ZWRJbmRleCApO1xuICB2YXIgZGVsdGEgPSB0aGlzLnByZXZpb3VzRHJhZ1ggLSB0aGlzLmRyYWdYO1xuICBpZiAoIGRpc3RhbmNlID4gMCAmJiBkZWx0YSA+IDAgKSB7XG4gICAgLy8gYm9vc3QgdG8gbmV4dCBpZiBtb3ZpbmcgdG93YXJkcyB0aGUgcmlnaHQsIGFuZCBwb3NpdGl2ZSB2ZWxvY2l0eVxuICAgIHJldHVybiAxO1xuICB9IGVsc2UgaWYgKCBkaXN0YW5jZSA8IDAgJiYgZGVsdGEgPCAwICkge1xuICAgIC8vIGJvb3N0IHRvIHByZXZpb3VzIGlmIG1vdmluZyB0b3dhcmRzIHRoZSBsZWZ0LCBhbmQgbmVnYXRpdmUgdmVsb2NpdHlcbiAgICByZXR1cm4gLTE7XG4gIH1cbiAgcmV0dXJuIDA7XG59O1xuXG4vLyAtLS0tLSBzdGF0aWNDbGljayAtLS0tLSAvL1xuXG5wcm90by5zdGF0aWNDbGljayA9IGZ1bmN0aW9uKCBldmVudCwgcG9pbnRlciApIHtcbiAgLy8gZ2V0IGNsaWNrZWRDZWxsLCBpZiBjZWxsIHdhcyBjbGlja2VkXG4gIHZhciBjbGlja2VkQ2VsbCA9IHRoaXMuZ2V0UGFyZW50Q2VsbCggZXZlbnQudGFyZ2V0ICk7XG4gIHZhciBjZWxsRWxlbSA9IGNsaWNrZWRDZWxsICYmIGNsaWNrZWRDZWxsLmVsZW1lbnQ7XG4gIHZhciBjZWxsSW5kZXggPSBjbGlja2VkQ2VsbCAmJiB0aGlzLmNlbGxzLmluZGV4T2YoIGNsaWNrZWRDZWxsICk7XG4gIHRoaXMuZGlzcGF0Y2hFdmVudCggJ3N0YXRpY0NsaWNrJywgZXZlbnQsIFsgcG9pbnRlciwgY2VsbEVsZW0sIGNlbGxJbmRleCBdICk7XG59O1xuXG4vLyAtLS0tLSBzY3JvbGwgLS0tLS0gLy9cblxucHJvdG8ub25zY3JvbGwgPSBmdW5jdGlvbigpIHtcbiAgdmFyIHNjcm9sbCA9IGdldFNjcm9sbFBvc2l0aW9uKCk7XG4gIHZhciBzY3JvbGxNb3ZlWCA9IHRoaXMucG9pbnRlckRvd25TY3JvbGwueCAtIHNjcm9sbC54O1xuICB2YXIgc2Nyb2xsTW92ZVkgPSB0aGlzLnBvaW50ZXJEb3duU2Nyb2xsLnkgLSBzY3JvbGwueTtcbiAgLy8gY2FuY2VsIGNsaWNrL3RhcCBpZiBzY3JvbGwgaXMgdG9vIG11Y2hcbiAgaWYgKCBNYXRoLmFicyggc2Nyb2xsTW92ZVggKSA+IDMgfHwgTWF0aC5hYnMoIHNjcm9sbE1vdmVZICkgPiAzICkge1xuICAgIHRoaXMuX3BvaW50ZXJEb25lKCk7XG4gIH1cbn07XG5cbi8vIC0tLS0tIHV0aWxzIC0tLS0tIC8vXG5cbmZ1bmN0aW9uIGdldFNjcm9sbFBvc2l0aW9uKCkge1xuICByZXR1cm4ge1xuICAgIHg6IHdpbmRvdy5wYWdlWE9mZnNldCxcbiAgICB5OiB3aW5kb3cucGFnZVlPZmZzZXRcbiAgfTtcbn1cblxuLy8gLS0tLS0gIC0tLS0tIC8vXG5cbnJldHVybiBGbGlja2l0eTtcblxufSkpO1xuIiwiLy8gcHJldi9uZXh0IGJ1dHRvbnNcbiggZnVuY3Rpb24oIHdpbmRvdywgZmFjdG9yeSApIHtcbiAgLy8gdW5pdmVyc2FsIG1vZHVsZSBkZWZpbml0aW9uXG4gIC8qIGpzaGludCBzdHJpY3Q6IGZhbHNlICovXG4gIGlmICggdHlwZW9mIGRlZmluZSA9PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQgKSB7XG4gICAgLy8gQU1EXG4gICAgZGVmaW5lKCBbXG4gICAgICAnLi9mbGlja2l0eScsXG4gICAgICAndW5pcG9pbnRlci91bmlwb2ludGVyJyxcbiAgICAgICdmaXp6eS11aS11dGlscy91dGlscydcbiAgICBdLCBmdW5jdGlvbiggRmxpY2tpdHksIFVuaXBvaW50ZXIsIHV0aWxzICkge1xuICAgICAgcmV0dXJuIGZhY3RvcnkoIHdpbmRvdywgRmxpY2tpdHksIFVuaXBvaW50ZXIsIHV0aWxzICk7XG4gICAgfSk7XG4gIH0gZWxzZSBpZiAoIHR5cGVvZiBtb2R1bGUgPT0gJ29iamVjdCcgJiYgbW9kdWxlLmV4cG9ydHMgKSB7XG4gICAgLy8gQ29tbW9uSlNcbiAgICBtb2R1bGUuZXhwb3J0cyA9IGZhY3RvcnkoXG4gICAgICB3aW5kb3csXG4gICAgICByZXF1aXJlKCcuL2ZsaWNraXR5JyksXG4gICAgICByZXF1aXJlKCd1bmlwb2ludGVyJyksXG4gICAgICByZXF1aXJlKCdmaXp6eS11aS11dGlscycpXG4gICAgKTtcbiAgfSBlbHNlIHtcbiAgICAvLyBicm93c2VyIGdsb2JhbFxuICAgIGZhY3RvcnkoXG4gICAgICB3aW5kb3csXG4gICAgICB3aW5kb3cuRmxpY2tpdHksXG4gICAgICB3aW5kb3cuVW5pcG9pbnRlcixcbiAgICAgIHdpbmRvdy5maXp6eVVJVXRpbHNcbiAgICApO1xuICB9XG5cbn0oIHdpbmRvdywgZnVuY3Rpb24gZmFjdG9yeSggd2luZG93LCBGbGlja2l0eSwgVW5pcG9pbnRlciwgdXRpbHMgKSB7XG4ndXNlIHN0cmljdCc7XG5cbnZhciBzdmdVUkkgPSAnaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnO1xuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSBQcmV2TmV4dEJ1dHRvbiAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSAvL1xuXG5mdW5jdGlvbiBQcmV2TmV4dEJ1dHRvbiggZGlyZWN0aW9uLCBwYXJlbnQgKSB7XG4gIHRoaXMuZGlyZWN0aW9uID0gZGlyZWN0aW9uO1xuICB0aGlzLnBhcmVudCA9IHBhcmVudDtcbiAgdGhpcy5fY3JlYXRlKCk7XG59XG5cblByZXZOZXh0QnV0dG9uLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoIFVuaXBvaW50ZXIucHJvdG90eXBlICk7XG5cblByZXZOZXh0QnV0dG9uLnByb3RvdHlwZS5fY3JlYXRlID0gZnVuY3Rpb24oKSB7XG4gIC8vIHByb3BlcnRpZXNcbiAgdGhpcy5pc0VuYWJsZWQgPSB0cnVlO1xuICB0aGlzLmlzUHJldmlvdXMgPSB0aGlzLmRpcmVjdGlvbiA9PSAtMTtcbiAgdmFyIGxlZnREaXJlY3Rpb24gPSB0aGlzLnBhcmVudC5vcHRpb25zLnJpZ2h0VG9MZWZ0ID8gMSA6IC0xO1xuICB0aGlzLmlzTGVmdCA9IHRoaXMuZGlyZWN0aW9uID09IGxlZnREaXJlY3Rpb247XG5cbiAgdmFyIGVsZW1lbnQgPSB0aGlzLmVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdidXR0b24nKTtcbiAgZWxlbWVudC5jbGFzc05hbWUgPSAnZmxpY2tpdHktYnV0dG9uIGZsaWNraXR5LXByZXYtbmV4dC1idXR0b24nO1xuICBlbGVtZW50LmNsYXNzTmFtZSArPSB0aGlzLmlzUHJldmlvdXMgPyAnIHByZXZpb3VzJyA6ICcgbmV4dCc7XG4gIC8vIHByZXZlbnQgYnV0dG9uIGZyb20gc3VibWl0dGluZyBmb3JtIGh0dHA6Ly9zdGFja292ZXJmbG93LmNvbS9hLzEwODM2MDc2LzE4MjE4M1xuICBlbGVtZW50LnNldEF0dHJpYnV0ZSggJ3R5cGUnLCAnYnV0dG9uJyApO1xuICAvLyBpbml0IGFzIGRpc2FibGVkXG4gIHRoaXMuZGlzYWJsZSgpO1xuXG4gIGVsZW1lbnQuc2V0QXR0cmlidXRlKCAnYXJpYS1sYWJlbCcsIHRoaXMuaXNQcmV2aW91cyA/ICdQcmV2aW91cycgOiAnTmV4dCcgKTtcblxuICAvLyBjcmVhdGUgYXJyb3dcbiAgdmFyIHN2ZyA9IHRoaXMuY3JlYXRlU1ZHKCk7XG4gIGVsZW1lbnQuYXBwZW5kQ2hpbGQoIHN2ZyApO1xuICAvLyBldmVudHNcbiAgdGhpcy5wYXJlbnQub24oICdzZWxlY3QnLCB0aGlzLnVwZGF0ZS5iaW5kKCB0aGlzICkgKTtcbiAgdGhpcy5vbiggJ3BvaW50ZXJEb3duJywgdGhpcy5wYXJlbnQuY2hpbGRVSVBvaW50ZXJEb3duLmJpbmQoIHRoaXMucGFyZW50ICkgKTtcbn07XG5cblByZXZOZXh0QnV0dG9uLnByb3RvdHlwZS5hY3RpdmF0ZSA9IGZ1bmN0aW9uKCkge1xuICB0aGlzLmJpbmRTdGFydEV2ZW50KCB0aGlzLmVsZW1lbnQgKTtcbiAgdGhpcy5lbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoICdjbGljaycsIHRoaXMgKTtcbiAgLy8gYWRkIHRvIERPTVxuICB0aGlzLnBhcmVudC5lbGVtZW50LmFwcGVuZENoaWxkKCB0aGlzLmVsZW1lbnQgKTtcbn07XG5cblByZXZOZXh0QnV0dG9uLnByb3RvdHlwZS5kZWFjdGl2YXRlID0gZnVuY3Rpb24oKSB7XG4gIC8vIHJlbW92ZSBmcm9tIERPTVxuICB0aGlzLnBhcmVudC5lbGVtZW50LnJlbW92ZUNoaWxkKCB0aGlzLmVsZW1lbnQgKTtcbiAgLy8gY2xpY2sgZXZlbnRzXG4gIHRoaXMudW5iaW5kU3RhcnRFdmVudCggdGhpcy5lbGVtZW50ICk7XG4gIHRoaXMuZWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCAnY2xpY2snLCB0aGlzICk7XG59O1xuXG5QcmV2TmV4dEJ1dHRvbi5wcm90b3R5cGUuY3JlYXRlU1ZHID0gZnVuY3Rpb24oKSB7XG4gIHZhciBzdmcgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMoIHN2Z1VSSSwgJ3N2ZycpO1xuICBzdmcuc2V0QXR0cmlidXRlKCAnY2xhc3MnLCAnZmxpY2tpdHktYnV0dG9uLWljb24nICk7XG4gIHN2Zy5zZXRBdHRyaWJ1dGUoICd2aWV3Qm94JywgJzAgMCAxMDAgMTAwJyApO1xuICB2YXIgcGF0aCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUyggc3ZnVVJJLCAncGF0aCcpO1xuICB2YXIgcGF0aE1vdmVtZW50cyA9IGdldEFycm93TW92ZW1lbnRzKCB0aGlzLnBhcmVudC5vcHRpb25zLmFycm93U2hhcGUgKTtcbiAgcGF0aC5zZXRBdHRyaWJ1dGUoICdkJywgcGF0aE1vdmVtZW50cyApO1xuICBwYXRoLnNldEF0dHJpYnV0ZSggJ2NsYXNzJywgJ2Fycm93JyApO1xuICAvLyByb3RhdGUgYXJyb3dcbiAgaWYgKCAhdGhpcy5pc0xlZnQgKSB7XG4gICAgcGF0aC5zZXRBdHRyaWJ1dGUoICd0cmFuc2Zvcm0nLCAndHJhbnNsYXRlKDEwMCwgMTAwKSByb3RhdGUoMTgwKSAnICk7XG4gIH1cbiAgc3ZnLmFwcGVuZENoaWxkKCBwYXRoICk7XG4gIHJldHVybiBzdmc7XG59O1xuXG4vLyBnZXQgU1ZHIHBhdGggbW92bWVtZW50XG5mdW5jdGlvbiBnZXRBcnJvd01vdmVtZW50cyggc2hhcGUgKSB7XG4gIC8vIHVzZSBzaGFwZSBhcyBtb3ZlbWVudCBpZiBzdHJpbmdcbiAgaWYgKCB0eXBlb2Ygc2hhcGUgPT0gJ3N0cmluZycgKSB7XG4gICAgcmV0dXJuIHNoYXBlO1xuICB9XG4gIC8vIGNyZWF0ZSBtb3ZlbWVudCBzdHJpbmdcbiAgcmV0dXJuICdNICcgKyBzaGFwZS54MCArICcsNTAnICtcbiAgICAnIEwgJyArIHNoYXBlLngxICsgJywnICsgKCBzaGFwZS55MSArIDUwICkgK1xuICAgICcgTCAnICsgc2hhcGUueDIgKyAnLCcgKyAoIHNoYXBlLnkyICsgNTAgKSArXG4gICAgJyBMICcgKyBzaGFwZS54MyArICcsNTAgJyArXG4gICAgJyBMICcgKyBzaGFwZS54MiArICcsJyArICggNTAgLSBzaGFwZS55MiApICtcbiAgICAnIEwgJyArIHNoYXBlLngxICsgJywnICsgKCA1MCAtIHNoYXBlLnkxICkgK1xuICAgICcgWic7XG59XG5cblByZXZOZXh0QnV0dG9uLnByb3RvdHlwZS5oYW5kbGVFdmVudCA9IHV0aWxzLmhhbmRsZUV2ZW50O1xuXG5QcmV2TmV4dEJ1dHRvbi5wcm90b3R5cGUub25jbGljayA9IGZ1bmN0aW9uKCkge1xuICBpZiAoICF0aGlzLmlzRW5hYmxlZCApIHtcbiAgICByZXR1cm47XG4gIH1cbiAgdGhpcy5wYXJlbnQudWlDaGFuZ2UoKTtcbiAgdmFyIG1ldGhvZCA9IHRoaXMuaXNQcmV2aW91cyA/ICdwcmV2aW91cycgOiAnbmV4dCc7XG4gIHRoaXMucGFyZW50WyBtZXRob2QgXSgpO1xufTtcblxuLy8gLS0tLS0gIC0tLS0tIC8vXG5cblByZXZOZXh0QnV0dG9uLnByb3RvdHlwZS5lbmFibGUgPSBmdW5jdGlvbigpIHtcbiAgaWYgKCB0aGlzLmlzRW5hYmxlZCApIHtcbiAgICByZXR1cm47XG4gIH1cbiAgdGhpcy5lbGVtZW50LmRpc2FibGVkID0gZmFsc2U7XG4gIHRoaXMuaXNFbmFibGVkID0gdHJ1ZTtcbn07XG5cblByZXZOZXh0QnV0dG9uLnByb3RvdHlwZS5kaXNhYmxlID0gZnVuY3Rpb24oKSB7XG4gIGlmICggIXRoaXMuaXNFbmFibGVkICkge1xuICAgIHJldHVybjtcbiAgfVxuICB0aGlzLmVsZW1lbnQuZGlzYWJsZWQgPSB0cnVlO1xuICB0aGlzLmlzRW5hYmxlZCA9IGZhbHNlO1xufTtcblxuUHJldk5leHRCdXR0b24ucHJvdG90eXBlLnVwZGF0ZSA9IGZ1bmN0aW9uKCkge1xuICAvLyBpbmRleCBvZiBmaXJzdCBvciBsYXN0IHNsaWRlLCBpZiBwcmV2aW91cyBvciBuZXh0XG4gIHZhciBzbGlkZXMgPSB0aGlzLnBhcmVudC5zbGlkZXM7XG4gIC8vIGVuYWJsZSBpcyB3cmFwQXJvdW5kIGFuZCBhdCBsZWFzdCAyIHNsaWRlc1xuICBpZiAoIHRoaXMucGFyZW50Lm9wdGlvbnMud3JhcEFyb3VuZCAmJiBzbGlkZXMubGVuZ3RoID4gMSApIHtcbiAgICB0aGlzLmVuYWJsZSgpO1xuICAgIHJldHVybjtcbiAgfVxuICB2YXIgbGFzdEluZGV4ID0gc2xpZGVzLmxlbmd0aCA/IHNsaWRlcy5sZW5ndGggLSAxIDogMDtcbiAgdmFyIGJvdW5kSW5kZXggPSB0aGlzLmlzUHJldmlvdXMgPyAwIDogbGFzdEluZGV4O1xuICB2YXIgbWV0aG9kID0gdGhpcy5wYXJlbnQuc2VsZWN0ZWRJbmRleCA9PSBib3VuZEluZGV4ID8gJ2Rpc2FibGUnIDogJ2VuYWJsZSc7XG4gIHRoaXNbIG1ldGhvZCBdKCk7XG59O1xuXG5QcmV2TmV4dEJ1dHRvbi5wcm90b3R5cGUuZGVzdHJveSA9IGZ1bmN0aW9uKCkge1xuICB0aGlzLmRlYWN0aXZhdGUoKTtcbiAgdGhpcy5hbGxPZmYoKTtcbn07XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIEZsaWNraXR5IHByb3RvdHlwZSAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSAvL1xuXG51dGlscy5leHRlbmQoIEZsaWNraXR5LmRlZmF1bHRzLCB7XG4gIHByZXZOZXh0QnV0dG9uczogdHJ1ZSxcbiAgYXJyb3dTaGFwZToge1xuICAgIHgwOiAxMCxcbiAgICB4MTogNjAsIHkxOiA1MCxcbiAgICB4MjogNzAsIHkyOiA0MCxcbiAgICB4MzogMzBcbiAgfVxufSk7XG5cbkZsaWNraXR5LmNyZWF0ZU1ldGhvZHMucHVzaCgnX2NyZWF0ZVByZXZOZXh0QnV0dG9ucycpO1xudmFyIHByb3RvID0gRmxpY2tpdHkucHJvdG90eXBlO1xuXG5wcm90by5fY3JlYXRlUHJldk5leHRCdXR0b25zID0gZnVuY3Rpb24oKSB7XG4gIGlmICggIXRoaXMub3B0aW9ucy5wcmV2TmV4dEJ1dHRvbnMgKSB7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgdGhpcy5wcmV2QnV0dG9uID0gbmV3IFByZXZOZXh0QnV0dG9uKCAtMSwgdGhpcyApO1xuICB0aGlzLm5leHRCdXR0b24gPSBuZXcgUHJldk5leHRCdXR0b24oIDEsIHRoaXMgKTtcblxuICB0aGlzLm9uKCAnYWN0aXZhdGUnLCB0aGlzLmFjdGl2YXRlUHJldk5leHRCdXR0b25zICk7XG59O1xuXG5wcm90by5hY3RpdmF0ZVByZXZOZXh0QnV0dG9ucyA9IGZ1bmN0aW9uKCkge1xuICB0aGlzLnByZXZCdXR0b24uYWN0aXZhdGUoKTtcbiAgdGhpcy5uZXh0QnV0dG9uLmFjdGl2YXRlKCk7XG4gIHRoaXMub24oICdkZWFjdGl2YXRlJywgdGhpcy5kZWFjdGl2YXRlUHJldk5leHRCdXR0b25zICk7XG59O1xuXG5wcm90by5kZWFjdGl2YXRlUHJldk5leHRCdXR0b25zID0gZnVuY3Rpb24oKSB7XG4gIHRoaXMucHJldkJ1dHRvbi5kZWFjdGl2YXRlKCk7XG4gIHRoaXMubmV4dEJ1dHRvbi5kZWFjdGl2YXRlKCk7XG4gIHRoaXMub2ZmKCAnZGVhY3RpdmF0ZScsIHRoaXMuZGVhY3RpdmF0ZVByZXZOZXh0QnV0dG9ucyApO1xufTtcblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIC8vXG5cbkZsaWNraXR5LlByZXZOZXh0QnV0dG9uID0gUHJldk5leHRCdXR0b247XG5cbnJldHVybiBGbGlja2l0eTtcblxufSkpO1xuIiwiLy8gcGFnZSBkb3RzXG4oIGZ1bmN0aW9uKCB3aW5kb3csIGZhY3RvcnkgKSB7XG4gIC8vIHVuaXZlcnNhbCBtb2R1bGUgZGVmaW5pdGlvblxuICAvKiBqc2hpbnQgc3RyaWN0OiBmYWxzZSAqL1xuICBpZiAoIHR5cGVvZiBkZWZpbmUgPT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kICkge1xuICAgIC8vIEFNRFxuICAgIGRlZmluZSggW1xuICAgICAgJy4vZmxpY2tpdHknLFxuICAgICAgJ3VuaXBvaW50ZXIvdW5pcG9pbnRlcicsXG4gICAgICAnZml6enktdWktdXRpbHMvdXRpbHMnXG4gICAgXSwgZnVuY3Rpb24oIEZsaWNraXR5LCBVbmlwb2ludGVyLCB1dGlscyApIHtcbiAgICAgIHJldHVybiBmYWN0b3J5KCB3aW5kb3csIEZsaWNraXR5LCBVbmlwb2ludGVyLCB1dGlscyApO1xuICAgIH0pO1xuICB9IGVsc2UgaWYgKCB0eXBlb2YgbW9kdWxlID09ICdvYmplY3QnICYmIG1vZHVsZS5leHBvcnRzICkge1xuICAgIC8vIENvbW1vbkpTXG4gICAgbW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KFxuICAgICAgd2luZG93LFxuICAgICAgcmVxdWlyZSgnLi9mbGlja2l0eScpLFxuICAgICAgcmVxdWlyZSgndW5pcG9pbnRlcicpLFxuICAgICAgcmVxdWlyZSgnZml6enktdWktdXRpbHMnKVxuICAgICk7XG4gIH0gZWxzZSB7XG4gICAgLy8gYnJvd3NlciBnbG9iYWxcbiAgICBmYWN0b3J5KFxuICAgICAgd2luZG93LFxuICAgICAgd2luZG93LkZsaWNraXR5LFxuICAgICAgd2luZG93LlVuaXBvaW50ZXIsXG4gICAgICB3aW5kb3cuZml6enlVSVV0aWxzXG4gICAgKTtcbiAgfVxuXG59KCB3aW5kb3csIGZ1bmN0aW9uIGZhY3RvcnkoIHdpbmRvdywgRmxpY2tpdHksIFVuaXBvaW50ZXIsIHV0aWxzICkge1xuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSBQYWdlRG90cyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSAvL1xuXG4ndXNlIHN0cmljdCc7XG5cbmZ1bmN0aW9uIFBhZ2VEb3RzKCBwYXJlbnQgKSB7XG4gIHRoaXMucGFyZW50ID0gcGFyZW50O1xuICB0aGlzLl9jcmVhdGUoKTtcbn1cblxuUGFnZURvdHMucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZSggVW5pcG9pbnRlci5wcm90b3R5cGUgKTtcblxuUGFnZURvdHMucHJvdG90eXBlLl9jcmVhdGUgPSBmdW5jdGlvbigpIHtcbiAgLy8gY3JlYXRlIGhvbGRlciBlbGVtZW50XG4gIHRoaXMuaG9sZGVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnb2wnKTtcbiAgdGhpcy5ob2xkZXIuY2xhc3NOYW1lID0gJ2ZsaWNraXR5LXBhZ2UtZG90cyc7XG4gIC8vIGNyZWF0ZSBkb3RzLCBhcnJheSBvZiBlbGVtZW50c1xuICB0aGlzLmRvdHMgPSBbXTtcbiAgLy8gZXZlbnRzXG4gIHRoaXMuaGFuZGxlQ2xpY2sgPSB0aGlzLm9uQ2xpY2suYmluZCggdGhpcyApO1xuICB0aGlzLm9uKCAncG9pbnRlckRvd24nLCB0aGlzLnBhcmVudC5jaGlsZFVJUG9pbnRlckRvd24uYmluZCggdGhpcy5wYXJlbnQgKSApO1xufTtcblxuUGFnZURvdHMucHJvdG90eXBlLmFjdGl2YXRlID0gZnVuY3Rpb24oKSB7XG4gIHRoaXMuc2V0RG90cygpO1xuICB0aGlzLmhvbGRlci5hZGRFdmVudExpc3RlbmVyKCAnY2xpY2snLCB0aGlzLmhhbmRsZUNsaWNrICk7XG4gIHRoaXMuYmluZFN0YXJ0RXZlbnQoIHRoaXMuaG9sZGVyICk7XG4gIC8vIGFkZCB0byBET01cbiAgdGhpcy5wYXJlbnQuZWxlbWVudC5hcHBlbmRDaGlsZCggdGhpcy5ob2xkZXIgKTtcbn07XG5cblBhZ2VEb3RzLnByb3RvdHlwZS5kZWFjdGl2YXRlID0gZnVuY3Rpb24oKSB7XG4gIHRoaXMuaG9sZGVyLnJlbW92ZUV2ZW50TGlzdGVuZXIoICdjbGljaycsIHRoaXMuaGFuZGxlQ2xpY2sgKTtcbiAgdGhpcy51bmJpbmRTdGFydEV2ZW50KCB0aGlzLmhvbGRlciApO1xuICAvLyByZW1vdmUgZnJvbSBET01cbiAgdGhpcy5wYXJlbnQuZWxlbWVudC5yZW1vdmVDaGlsZCggdGhpcy5ob2xkZXIgKTtcbn07XG5cblBhZ2VEb3RzLnByb3RvdHlwZS5zZXREb3RzID0gZnVuY3Rpb24oKSB7XG4gIC8vIGdldCBkaWZmZXJlbmNlIGJldHdlZW4gbnVtYmVyIG9mIHNsaWRlcyBhbmQgbnVtYmVyIG9mIGRvdHNcbiAgdmFyIGRlbHRhID0gdGhpcy5wYXJlbnQuc2xpZGVzLmxlbmd0aCAtIHRoaXMuZG90cy5sZW5ndGg7XG4gIGlmICggZGVsdGEgPiAwICkge1xuICAgIHRoaXMuYWRkRG90cyggZGVsdGEgKTtcbiAgfSBlbHNlIGlmICggZGVsdGEgPCAwICkge1xuICAgIHRoaXMucmVtb3ZlRG90cyggLWRlbHRhICk7XG4gIH1cbn07XG5cblBhZ2VEb3RzLnByb3RvdHlwZS5hZGREb3RzID0gZnVuY3Rpb24oIGNvdW50ICkge1xuICB2YXIgZnJhZ21lbnQgPSBkb2N1bWVudC5jcmVhdGVEb2N1bWVudEZyYWdtZW50KCk7XG4gIHZhciBuZXdEb3RzID0gW107XG4gIHZhciBsZW5ndGggPSB0aGlzLmRvdHMubGVuZ3RoO1xuICB2YXIgbWF4ID0gbGVuZ3RoICsgY291bnQ7XG5cbiAgZm9yICggdmFyIGkgPSBsZW5ndGg7IGkgPCBtYXg7IGkrKyApIHtcbiAgICB2YXIgZG90ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnbGknKTtcbiAgICBkb3QuY2xhc3NOYW1lID0gJ2RvdCc7XG4gICAgZG90LnNldEF0dHJpYnV0ZSggJ2FyaWEtbGFiZWwnLCAnUGFnZSBkb3QgJyArICggaSArIDEgKSApO1xuICAgIGZyYWdtZW50LmFwcGVuZENoaWxkKCBkb3QgKTtcbiAgICBuZXdEb3RzLnB1c2goIGRvdCApO1xuICB9XG5cbiAgdGhpcy5ob2xkZXIuYXBwZW5kQ2hpbGQoIGZyYWdtZW50ICk7XG4gIHRoaXMuZG90cyA9IHRoaXMuZG90cy5jb25jYXQoIG5ld0RvdHMgKTtcbn07XG5cblBhZ2VEb3RzLnByb3RvdHlwZS5yZW1vdmVEb3RzID0gZnVuY3Rpb24oIGNvdW50ICkge1xuICAvLyByZW1vdmUgZnJvbSB0aGlzLmRvdHMgY29sbGVjdGlvblxuICB2YXIgcmVtb3ZlRG90cyA9IHRoaXMuZG90cy5zcGxpY2UoIHRoaXMuZG90cy5sZW5ndGggLSBjb3VudCwgY291bnQgKTtcbiAgLy8gcmVtb3ZlIGZyb20gRE9NXG4gIHJlbW92ZURvdHMuZm9yRWFjaCggZnVuY3Rpb24oIGRvdCApIHtcbiAgICB0aGlzLmhvbGRlci5yZW1vdmVDaGlsZCggZG90ICk7XG4gIH0sIHRoaXMgKTtcbn07XG5cblBhZ2VEb3RzLnByb3RvdHlwZS51cGRhdGVTZWxlY3RlZCA9IGZ1bmN0aW9uKCkge1xuICAvLyByZW1vdmUgc2VsZWN0ZWQgY2xhc3Mgb24gcHJldmlvdXNcbiAgaWYgKCB0aGlzLnNlbGVjdGVkRG90ICkge1xuICAgIHRoaXMuc2VsZWN0ZWREb3QuY2xhc3NOYW1lID0gJ2RvdCc7XG4gICAgdGhpcy5zZWxlY3RlZERvdC5yZW1vdmVBdHRyaWJ1dGUoJ2FyaWEtY3VycmVudCcpO1xuICB9XG4gIC8vIGRvbid0IHByb2NlZWQgaWYgbm8gZG90c1xuICBpZiAoICF0aGlzLmRvdHMubGVuZ3RoICkge1xuICAgIHJldHVybjtcbiAgfVxuICB0aGlzLnNlbGVjdGVkRG90ID0gdGhpcy5kb3RzWyB0aGlzLnBhcmVudC5zZWxlY3RlZEluZGV4IF07XG4gIHRoaXMuc2VsZWN0ZWREb3QuY2xhc3NOYW1lID0gJ2RvdCBpcy1zZWxlY3RlZCc7XG4gIHRoaXMuc2VsZWN0ZWREb3Quc2V0QXR0cmlidXRlKCAnYXJpYS1jdXJyZW50JywgJ3N0ZXAnICk7XG59O1xuXG5QYWdlRG90cy5wcm90b3R5cGUub25UYXAgPSAvLyBvbGQgbWV0aG9kIG5hbWUsIGJhY2t3YXJkcy1jb21wYXRpYmxlXG5QYWdlRG90cy5wcm90b3R5cGUub25DbGljayA9IGZ1bmN0aW9uKCBldmVudCApIHtcbiAgdmFyIHRhcmdldCA9IGV2ZW50LnRhcmdldDtcbiAgLy8gb25seSBjYXJlIGFib3V0IGRvdCBjbGlja3NcbiAgaWYgKCB0YXJnZXQubm9kZU5hbWUgIT0gJ0xJJyApIHtcbiAgICByZXR1cm47XG4gIH1cblxuICB0aGlzLnBhcmVudC51aUNoYW5nZSgpO1xuICB2YXIgaW5kZXggPSB0aGlzLmRvdHMuaW5kZXhPZiggdGFyZ2V0ICk7XG4gIHRoaXMucGFyZW50LnNlbGVjdCggaW5kZXggKTtcbn07XG5cblBhZ2VEb3RzLnByb3RvdHlwZS5kZXN0cm95ID0gZnVuY3Rpb24oKSB7XG4gIHRoaXMuZGVhY3RpdmF0ZSgpO1xuICB0aGlzLmFsbE9mZigpO1xufTtcblxuRmxpY2tpdHkuUGFnZURvdHMgPSBQYWdlRG90cztcblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gRmxpY2tpdHkgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gLy9cblxudXRpbHMuZXh0ZW5kKCBGbGlja2l0eS5kZWZhdWx0cywge1xuICBwYWdlRG90czogdHJ1ZVxufSk7XG5cbkZsaWNraXR5LmNyZWF0ZU1ldGhvZHMucHVzaCgnX2NyZWF0ZVBhZ2VEb3RzJyk7XG5cbnZhciBwcm90byA9IEZsaWNraXR5LnByb3RvdHlwZTtcblxucHJvdG8uX2NyZWF0ZVBhZ2VEb3RzID0gZnVuY3Rpb24oKSB7XG4gIGlmICggIXRoaXMub3B0aW9ucy5wYWdlRG90cyApIHtcbiAgICByZXR1cm47XG4gIH1cbiAgdGhpcy5wYWdlRG90cyA9IG5ldyBQYWdlRG90cyggdGhpcyApO1xuICAvLyBldmVudHNcbiAgdGhpcy5vbiggJ2FjdGl2YXRlJywgdGhpcy5hY3RpdmF0ZVBhZ2VEb3RzICk7XG4gIHRoaXMub24oICdzZWxlY3QnLCB0aGlzLnVwZGF0ZVNlbGVjdGVkUGFnZURvdHMgKTtcbiAgdGhpcy5vbiggJ2NlbGxDaGFuZ2UnLCB0aGlzLnVwZGF0ZVBhZ2VEb3RzICk7XG4gIHRoaXMub24oICdyZXNpemUnLCB0aGlzLnVwZGF0ZVBhZ2VEb3RzICk7XG4gIHRoaXMub24oICdkZWFjdGl2YXRlJywgdGhpcy5kZWFjdGl2YXRlUGFnZURvdHMgKTtcbn07XG5cbnByb3RvLmFjdGl2YXRlUGFnZURvdHMgPSBmdW5jdGlvbigpIHtcbiAgdGhpcy5wYWdlRG90cy5hY3RpdmF0ZSgpO1xufTtcblxucHJvdG8udXBkYXRlU2VsZWN0ZWRQYWdlRG90cyA9IGZ1bmN0aW9uKCkge1xuICB0aGlzLnBhZ2VEb3RzLnVwZGF0ZVNlbGVjdGVkKCk7XG59O1xuXG5wcm90by51cGRhdGVQYWdlRG90cyA9IGZ1bmN0aW9uKCkge1xuICB0aGlzLnBhZ2VEb3RzLnNldERvdHMoKTtcbn07XG5cbnByb3RvLmRlYWN0aXZhdGVQYWdlRG90cyA9IGZ1bmN0aW9uKCkge1xuICB0aGlzLnBhZ2VEb3RzLmRlYWN0aXZhdGUoKTtcbn07XG5cbi8vIC0tLS0tICAtLS0tLSAvL1xuXG5GbGlja2l0eS5QYWdlRG90cyA9IFBhZ2VEb3RzO1xuXG5yZXR1cm4gRmxpY2tpdHk7XG5cbn0pKTtcbiIsIi8vIHBsYXllciAmIGF1dG9QbGF5XG4oIGZ1bmN0aW9uKCB3aW5kb3csIGZhY3RvcnkgKSB7XG4gIC8vIHVuaXZlcnNhbCBtb2R1bGUgZGVmaW5pdGlvblxuICAvKiBqc2hpbnQgc3RyaWN0OiBmYWxzZSAqL1xuICBpZiAoIHR5cGVvZiBkZWZpbmUgPT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kICkge1xuICAgIC8vIEFNRFxuICAgIGRlZmluZSggW1xuICAgICAgJ2V2LWVtaXR0ZXIvZXYtZW1pdHRlcicsXG4gICAgICAnZml6enktdWktdXRpbHMvdXRpbHMnLFxuICAgICAgJy4vZmxpY2tpdHknXG4gICAgXSwgZnVuY3Rpb24oIEV2RW1pdHRlciwgdXRpbHMsIEZsaWNraXR5ICkge1xuICAgICAgcmV0dXJuIGZhY3RvcnkoIEV2RW1pdHRlciwgdXRpbHMsIEZsaWNraXR5ICk7XG4gICAgfSk7XG4gIH0gZWxzZSBpZiAoIHR5cGVvZiBtb2R1bGUgPT0gJ29iamVjdCcgJiYgbW9kdWxlLmV4cG9ydHMgKSB7XG4gICAgLy8gQ29tbW9uSlNcbiAgICBtb2R1bGUuZXhwb3J0cyA9IGZhY3RvcnkoXG4gICAgICByZXF1aXJlKCdldi1lbWl0dGVyJyksXG4gICAgICByZXF1aXJlKCdmaXp6eS11aS11dGlscycpLFxuICAgICAgcmVxdWlyZSgnLi9mbGlja2l0eScpXG4gICAgKTtcbiAgfSBlbHNlIHtcbiAgICAvLyBicm93c2VyIGdsb2JhbFxuICAgIGZhY3RvcnkoXG4gICAgICB3aW5kb3cuRXZFbWl0dGVyLFxuICAgICAgd2luZG93LmZpenp5VUlVdGlscyxcbiAgICAgIHdpbmRvdy5GbGlja2l0eVxuICAgICk7XG4gIH1cblxufSggd2luZG93LCBmdW5jdGlvbiBmYWN0b3J5KCBFdkVtaXR0ZXIsIHV0aWxzLCBGbGlja2l0eSApIHtcblxuJ3VzZSBzdHJpY3QnO1xuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSBQbGF5ZXIgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gLy9cblxuZnVuY3Rpb24gUGxheWVyKCBwYXJlbnQgKSB7XG4gIHRoaXMucGFyZW50ID0gcGFyZW50O1xuICB0aGlzLnN0YXRlID0gJ3N0b3BwZWQnO1xuICAvLyB2aXNpYmlsaXR5IGNoYW5nZSBldmVudCBoYW5kbGVyXG4gIHRoaXMub25WaXNpYmlsaXR5Q2hhbmdlID0gdGhpcy52aXNpYmlsaXR5Q2hhbmdlLmJpbmQoIHRoaXMgKTtcbiAgdGhpcy5vblZpc2liaWxpdHlQbGF5ID0gdGhpcy52aXNpYmlsaXR5UGxheS5iaW5kKCB0aGlzICk7XG59XG5cblBsYXllci5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKCBFdkVtaXR0ZXIucHJvdG90eXBlICk7XG5cbi8vIHN0YXJ0IHBsYXlcblBsYXllci5wcm90b3R5cGUucGxheSA9IGZ1bmN0aW9uKCkge1xuICBpZiAoIHRoaXMuc3RhdGUgPT0gJ3BsYXlpbmcnICkge1xuICAgIHJldHVybjtcbiAgfVxuICAvLyBkbyBub3QgcGxheSBpZiBwYWdlIGlzIGhpZGRlbiwgc3RhcnQgcGxheWluZyB3aGVuIHBhZ2UgaXMgdmlzaWJsZVxuICB2YXIgaXNQYWdlSGlkZGVuID0gZG9jdW1lbnQuaGlkZGVuO1xuICBpZiAoIGlzUGFnZUhpZGRlbiApIHtcbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCAndmlzaWJpbGl0eWNoYW5nZScsIHRoaXMub25WaXNpYmlsaXR5UGxheSApO1xuICAgIHJldHVybjtcbiAgfVxuXG4gIHRoaXMuc3RhdGUgPSAncGxheWluZyc7XG4gIC8vIGxpc3RlbiB0byB2aXNpYmlsaXR5IGNoYW5nZVxuICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCAndmlzaWJpbGl0eWNoYW5nZScsIHRoaXMub25WaXNpYmlsaXR5Q2hhbmdlICk7XG4gIC8vIHN0YXJ0IHRpY2tpbmdcbiAgdGhpcy50aWNrKCk7XG59O1xuXG5QbGF5ZXIucHJvdG90eXBlLnRpY2sgPSBmdW5jdGlvbigpIHtcbiAgLy8gZG8gbm90IHRpY2sgaWYgbm90IHBsYXlpbmdcbiAgaWYgKCB0aGlzLnN0YXRlICE9ICdwbGF5aW5nJyApIHtcbiAgICByZXR1cm47XG4gIH1cblxuICB2YXIgdGltZSA9IHRoaXMucGFyZW50Lm9wdGlvbnMuYXV0b1BsYXk7XG4gIC8vIGRlZmF1bHQgdG8gMyBzZWNvbmRzXG4gIHRpbWUgPSB0eXBlb2YgdGltZSA9PSAnbnVtYmVyJyA/IHRpbWUgOiAzMDAwO1xuICB2YXIgX3RoaXMgPSB0aGlzO1xuICAvLyBIQUNLOiByZXNldCB0aWNrcyBpZiBzdG9wcGVkIGFuZCBzdGFydGVkIHdpdGhpbiBpbnRlcnZhbFxuICB0aGlzLmNsZWFyKCk7XG4gIHRoaXMudGltZW91dCA9IHNldFRpbWVvdXQoIGZ1bmN0aW9uKCkge1xuICAgIF90aGlzLnBhcmVudC5uZXh0KCB0cnVlICk7XG4gICAgX3RoaXMudGljaygpO1xuICB9LCB0aW1lICk7XG59O1xuXG5QbGF5ZXIucHJvdG90eXBlLnN0b3AgPSBmdW5jdGlvbigpIHtcbiAgdGhpcy5zdGF0ZSA9ICdzdG9wcGVkJztcbiAgdGhpcy5jbGVhcigpO1xuICAvLyByZW1vdmUgdmlzaWJpbGl0eSBjaGFuZ2UgZXZlbnRcbiAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lciggJ3Zpc2liaWxpdHljaGFuZ2UnLCB0aGlzLm9uVmlzaWJpbGl0eUNoYW5nZSApO1xufTtcblxuUGxheWVyLnByb3RvdHlwZS5jbGVhciA9IGZ1bmN0aW9uKCkge1xuICBjbGVhclRpbWVvdXQoIHRoaXMudGltZW91dCApO1xufTtcblxuUGxheWVyLnByb3RvdHlwZS5wYXVzZSA9IGZ1bmN0aW9uKCkge1xuICBpZiAoIHRoaXMuc3RhdGUgPT0gJ3BsYXlpbmcnICkge1xuICAgIHRoaXMuc3RhdGUgPSAncGF1c2VkJztcbiAgICB0aGlzLmNsZWFyKCk7XG4gIH1cbn07XG5cblBsYXllci5wcm90b3R5cGUudW5wYXVzZSA9IGZ1bmN0aW9uKCkge1xuICAvLyByZS1zdGFydCBwbGF5IGlmIHBhdXNlZFxuICBpZiAoIHRoaXMuc3RhdGUgPT0gJ3BhdXNlZCcgKSB7XG4gICAgdGhpcy5wbGF5KCk7XG4gIH1cbn07XG5cbi8vIHBhdXNlIGlmIHBhZ2UgdmlzaWJpbGl0eSBpcyBoaWRkZW4sIHVucGF1c2UgaWYgdmlzaWJsZVxuUGxheWVyLnByb3RvdHlwZS52aXNpYmlsaXR5Q2hhbmdlID0gZnVuY3Rpb24oKSB7XG4gIHZhciBpc1BhZ2VIaWRkZW4gPSBkb2N1bWVudC5oaWRkZW47XG4gIHRoaXNbIGlzUGFnZUhpZGRlbiA/ICdwYXVzZScgOiAndW5wYXVzZScgXSgpO1xufTtcblxuUGxheWVyLnByb3RvdHlwZS52aXNpYmlsaXR5UGxheSA9IGZ1bmN0aW9uKCkge1xuICB0aGlzLnBsYXkoKTtcbiAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lciggJ3Zpc2liaWxpdHljaGFuZ2UnLCB0aGlzLm9uVmlzaWJpbGl0eVBsYXkgKTtcbn07XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIEZsaWNraXR5IC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIC8vXG5cbnV0aWxzLmV4dGVuZCggRmxpY2tpdHkuZGVmYXVsdHMsIHtcbiAgcGF1c2VBdXRvUGxheU9uSG92ZXI6IHRydWVcbn0pO1xuXG5GbGlja2l0eS5jcmVhdGVNZXRob2RzLnB1c2goJ19jcmVhdGVQbGF5ZXInKTtcbnZhciBwcm90byA9IEZsaWNraXR5LnByb3RvdHlwZTtcblxucHJvdG8uX2NyZWF0ZVBsYXllciA9IGZ1bmN0aW9uKCkge1xuICB0aGlzLnBsYXllciA9IG5ldyBQbGF5ZXIoIHRoaXMgKTtcblxuICB0aGlzLm9uKCAnYWN0aXZhdGUnLCB0aGlzLmFjdGl2YXRlUGxheWVyICk7XG4gIHRoaXMub24oICd1aUNoYW5nZScsIHRoaXMuc3RvcFBsYXllciApO1xuICB0aGlzLm9uKCAncG9pbnRlckRvd24nLCB0aGlzLnN0b3BQbGF5ZXIgKTtcbiAgdGhpcy5vbiggJ2RlYWN0aXZhdGUnLCB0aGlzLmRlYWN0aXZhdGVQbGF5ZXIgKTtcbn07XG5cbnByb3RvLmFjdGl2YXRlUGxheWVyID0gZnVuY3Rpb24oKSB7XG4gIGlmICggIXRoaXMub3B0aW9ucy5hdXRvUGxheSApIHtcbiAgICByZXR1cm47XG4gIH1cbiAgdGhpcy5wbGF5ZXIucGxheSgpO1xuICB0aGlzLmVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lciggJ21vdXNlZW50ZXInLCB0aGlzICk7XG59O1xuXG4vLyBQbGF5ZXIgQVBJLCBkb24ndCBoYXRlIHRoZSAuLi4gdGhhbmtzIEkga25vdyB3aGVyZSB0aGUgZG9vciBpc1xuXG5wcm90by5wbGF5UGxheWVyID0gZnVuY3Rpb24oKSB7XG4gIHRoaXMucGxheWVyLnBsYXkoKTtcbn07XG5cbnByb3RvLnN0b3BQbGF5ZXIgPSBmdW5jdGlvbigpIHtcbiAgdGhpcy5wbGF5ZXIuc3RvcCgpO1xufTtcblxucHJvdG8ucGF1c2VQbGF5ZXIgPSBmdW5jdGlvbigpIHtcbiAgdGhpcy5wbGF5ZXIucGF1c2UoKTtcbn07XG5cbnByb3RvLnVucGF1c2VQbGF5ZXIgPSBmdW5jdGlvbigpIHtcbiAgdGhpcy5wbGF5ZXIudW5wYXVzZSgpO1xufTtcblxucHJvdG8uZGVhY3RpdmF0ZVBsYXllciA9IGZ1bmN0aW9uKCkge1xuICB0aGlzLnBsYXllci5zdG9wKCk7XG4gIHRoaXMuZWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCAnbW91c2VlbnRlcicsIHRoaXMgKTtcbn07XG5cbi8vIC0tLS0tIG1vdXNlZW50ZXIvbGVhdmUgLS0tLS0gLy9cblxuLy8gcGF1c2UgYXV0by1wbGF5IG9uIGhvdmVyXG5wcm90by5vbm1vdXNlZW50ZXIgPSBmdW5jdGlvbigpIHtcbiAgaWYgKCAhdGhpcy5vcHRpb25zLnBhdXNlQXV0b1BsYXlPbkhvdmVyICkge1xuICAgIHJldHVybjtcbiAgfVxuICB0aGlzLnBsYXllci5wYXVzZSgpO1xuICB0aGlzLmVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lciggJ21vdXNlbGVhdmUnLCB0aGlzICk7XG59O1xuXG4vLyByZXN1bWUgYXV0by1wbGF5IG9uIGhvdmVyIG9mZlxucHJvdG8ub25tb3VzZWxlYXZlID0gZnVuY3Rpb24oKSB7XG4gIHRoaXMucGxheWVyLnVucGF1c2UoKTtcbiAgdGhpcy5lbGVtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoICdtb3VzZWxlYXZlJywgdGhpcyApO1xufTtcblxuLy8gLS0tLS0gIC0tLS0tIC8vXG5cbkZsaWNraXR5LlBsYXllciA9IFBsYXllcjtcblxucmV0dXJuIEZsaWNraXR5O1xuXG59KSk7XG4iLCIvLyBhZGQsIHJlbW92ZSBjZWxsXG4oIGZ1bmN0aW9uKCB3aW5kb3csIGZhY3RvcnkgKSB7XG4gIC8vIHVuaXZlcnNhbCBtb2R1bGUgZGVmaW5pdGlvblxuICAvKiBqc2hpbnQgc3RyaWN0OiBmYWxzZSAqL1xuICBpZiAoIHR5cGVvZiBkZWZpbmUgPT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kICkge1xuICAgIC8vIEFNRFxuICAgIGRlZmluZSggW1xuICAgICAgJy4vZmxpY2tpdHknLFxuICAgICAgJ2Zpenp5LXVpLXV0aWxzL3V0aWxzJ1xuICAgIF0sIGZ1bmN0aW9uKCBGbGlja2l0eSwgdXRpbHMgKSB7XG4gICAgICByZXR1cm4gZmFjdG9yeSggd2luZG93LCBGbGlja2l0eSwgdXRpbHMgKTtcbiAgICB9KTtcbiAgfSBlbHNlIGlmICggdHlwZW9mIG1vZHVsZSA9PSAnb2JqZWN0JyAmJiBtb2R1bGUuZXhwb3J0cyApIHtcbiAgICAvLyBDb21tb25KU1xuICAgIG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeShcbiAgICAgIHdpbmRvdyxcbiAgICAgIHJlcXVpcmUoJy4vZmxpY2tpdHknKSxcbiAgICAgIHJlcXVpcmUoJ2Zpenp5LXVpLXV0aWxzJylcbiAgICApO1xuICB9IGVsc2Uge1xuICAgIC8vIGJyb3dzZXIgZ2xvYmFsXG4gICAgZmFjdG9yeShcbiAgICAgIHdpbmRvdyxcbiAgICAgIHdpbmRvdy5GbGlja2l0eSxcbiAgICAgIHdpbmRvdy5maXp6eVVJVXRpbHNcbiAgICApO1xuICB9XG5cbn0oIHdpbmRvdywgZnVuY3Rpb24gZmFjdG9yeSggd2luZG93LCBGbGlja2l0eSwgdXRpbHMgKSB7XG5cbid1c2Ugc3RyaWN0JztcblxuLy8gYXBwZW5kIGNlbGxzIHRvIGEgZG9jdW1lbnQgZnJhZ21lbnRcbmZ1bmN0aW9uIGdldENlbGxzRnJhZ21lbnQoIGNlbGxzICkge1xuICB2YXIgZnJhZ21lbnQgPSBkb2N1bWVudC5jcmVhdGVEb2N1bWVudEZyYWdtZW50KCk7XG4gIGNlbGxzLmZvckVhY2goIGZ1bmN0aW9uKCBjZWxsICkge1xuICAgIGZyYWdtZW50LmFwcGVuZENoaWxkKCBjZWxsLmVsZW1lbnQgKTtcbiAgfSk7XG4gIHJldHVybiBmcmFnbWVudDtcbn1cblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gYWRkL3JlbW92ZSBjZWxsIHByb3RvdHlwZSAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSAvL1xuXG52YXIgcHJvdG8gPSBGbGlja2l0eS5wcm90b3R5cGU7XG5cbi8qKlxuICogSW5zZXJ0LCBwcmVwZW5kLCBvciBhcHBlbmQgY2VsbHNcbiAqIEBwYXJhbSB7RWxlbWVudCwgQXJyYXksIE5vZGVMaXN0fSBlbGVtc1xuICogQHBhcmFtIHtJbnRlZ2VyfSBpbmRleFxuICovXG5wcm90by5pbnNlcnQgPSBmdW5jdGlvbiggZWxlbXMsIGluZGV4ICkge1xuICB2YXIgY2VsbHMgPSB0aGlzLl9tYWtlQ2VsbHMoIGVsZW1zICk7XG4gIGlmICggIWNlbGxzIHx8ICFjZWxscy5sZW5ndGggKSB7XG4gICAgcmV0dXJuO1xuICB9XG4gIHZhciBsZW4gPSB0aGlzLmNlbGxzLmxlbmd0aDtcbiAgLy8gZGVmYXVsdCB0byBhcHBlbmRcbiAgaW5kZXggPSBpbmRleCA9PT0gdW5kZWZpbmVkID8gbGVuIDogaW5kZXg7XG4gIC8vIGFkZCBjZWxscyB3aXRoIGRvY3VtZW50IGZyYWdtZW50XG4gIHZhciBmcmFnbWVudCA9IGdldENlbGxzRnJhZ21lbnQoIGNlbGxzICk7XG4gIC8vIGFwcGVuZCB0byBzbGlkZXJcbiAgdmFyIGlzQXBwZW5kID0gaW5kZXggPT0gbGVuO1xuICBpZiAoIGlzQXBwZW5kICkge1xuICAgIHRoaXMuc2xpZGVyLmFwcGVuZENoaWxkKCBmcmFnbWVudCApO1xuICB9IGVsc2Uge1xuICAgIHZhciBpbnNlcnRDZWxsRWxlbWVudCA9IHRoaXMuY2VsbHNbIGluZGV4IF0uZWxlbWVudDtcbiAgICB0aGlzLnNsaWRlci5pbnNlcnRCZWZvcmUoIGZyYWdtZW50LCBpbnNlcnRDZWxsRWxlbWVudCApO1xuICB9XG4gIC8vIGFkZCB0byB0aGlzLmNlbGxzXG4gIGlmICggaW5kZXggPT09IDAgKSB7XG4gICAgLy8gcHJlcGVuZCwgYWRkIHRvIHN0YXJ0XG4gICAgdGhpcy5jZWxscyA9IGNlbGxzLmNvbmNhdCggdGhpcy5jZWxscyApO1xuICB9IGVsc2UgaWYgKCBpc0FwcGVuZCApIHtcbiAgICAvLyBhcHBlbmQsIGFkZCB0byBlbmRcbiAgICB0aGlzLmNlbGxzID0gdGhpcy5jZWxscy5jb25jYXQoIGNlbGxzICk7XG4gIH0gZWxzZSB7XG4gICAgLy8gaW5zZXJ0IGluIHRoaXMuY2VsbHNcbiAgICB2YXIgZW5kQ2VsbHMgPSB0aGlzLmNlbGxzLnNwbGljZSggaW5kZXgsIGxlbiAtIGluZGV4ICk7XG4gICAgdGhpcy5jZWxscyA9IHRoaXMuY2VsbHMuY29uY2F0KCBjZWxscyApLmNvbmNhdCggZW5kQ2VsbHMgKTtcbiAgfVxuXG4gIHRoaXMuX3NpemVDZWxscyggY2VsbHMgKTtcbiAgdGhpcy5jZWxsQ2hhbmdlKCBpbmRleCwgdHJ1ZSApO1xufTtcblxucHJvdG8uYXBwZW5kID0gZnVuY3Rpb24oIGVsZW1zICkge1xuICB0aGlzLmluc2VydCggZWxlbXMsIHRoaXMuY2VsbHMubGVuZ3RoICk7XG59O1xuXG5wcm90by5wcmVwZW5kID0gZnVuY3Rpb24oIGVsZW1zICkge1xuICB0aGlzLmluc2VydCggZWxlbXMsIDAgKTtcbn07XG5cbi8qKlxuICogUmVtb3ZlIGNlbGxzXG4gKiBAcGFyYW0ge0VsZW1lbnQsIEFycmF5LCBOb2RlTGlzdH0gZWxlbXNcbiAqL1xucHJvdG8ucmVtb3ZlID0gZnVuY3Rpb24oIGVsZW1zICkge1xuICB2YXIgY2VsbHMgPSB0aGlzLmdldENlbGxzKCBlbGVtcyApO1xuICBpZiAoICFjZWxscyB8fCAhY2VsbHMubGVuZ3RoICkge1xuICAgIHJldHVybjtcbiAgfVxuXG4gIHZhciBtaW5DZWxsSW5kZXggPSB0aGlzLmNlbGxzLmxlbmd0aCAtIDE7XG4gIC8vIHJlbW92ZSBjZWxscyBmcm9tIGNvbGxlY3Rpb24gJiBET01cbiAgY2VsbHMuZm9yRWFjaCggZnVuY3Rpb24oIGNlbGwgKSB7XG4gICAgY2VsbC5yZW1vdmUoKTtcbiAgICB2YXIgaW5kZXggPSB0aGlzLmNlbGxzLmluZGV4T2YoIGNlbGwgKTtcbiAgICBtaW5DZWxsSW5kZXggPSBNYXRoLm1pbiggaW5kZXgsIG1pbkNlbGxJbmRleCApO1xuICAgIHV0aWxzLnJlbW92ZUZyb20oIHRoaXMuY2VsbHMsIGNlbGwgKTtcbiAgfSwgdGhpcyApO1xuXG4gIHRoaXMuY2VsbENoYW5nZSggbWluQ2VsbEluZGV4LCB0cnVlICk7XG59O1xuXG4vKipcbiAqIGxvZ2ljIHRvIGJlIHJ1biBhZnRlciBhIGNlbGwncyBzaXplIGNoYW5nZXNcbiAqIEBwYXJhbSB7RWxlbWVudH0gZWxlbSAtIGNlbGwncyBlbGVtZW50XG4gKi9cbnByb3RvLmNlbGxTaXplQ2hhbmdlID0gZnVuY3Rpb24oIGVsZW0gKSB7XG4gIHZhciBjZWxsID0gdGhpcy5nZXRDZWxsKCBlbGVtICk7XG4gIGlmICggIWNlbGwgKSB7XG4gICAgcmV0dXJuO1xuICB9XG4gIGNlbGwuZ2V0U2l6ZSgpO1xuXG4gIHZhciBpbmRleCA9IHRoaXMuY2VsbHMuaW5kZXhPZiggY2VsbCApO1xuICB0aGlzLmNlbGxDaGFuZ2UoIGluZGV4ICk7XG59O1xuXG4vKipcbiAqIGxvZ2ljIGFueSB0aW1lIGEgY2VsbCBpcyBjaGFuZ2VkOiBhZGRlZCwgcmVtb3ZlZCwgb3Igc2l6ZSBjaGFuZ2VkXG4gKiBAcGFyYW0ge0ludGVnZXJ9IGNoYW5nZWRDZWxsSW5kZXggLSBpbmRleCBvZiB0aGUgY2hhbmdlZCBjZWxsLCBvcHRpb25hbFxuICovXG5wcm90by5jZWxsQ2hhbmdlID0gZnVuY3Rpb24oIGNoYW5nZWRDZWxsSW5kZXgsIGlzUG9zaXRpb25pbmdTbGlkZXIgKSB7XG4gIHZhciBwcmV2U2VsZWN0ZWRFbGVtID0gdGhpcy5zZWxlY3RlZEVsZW1lbnQ7XG4gIHRoaXMuX3Bvc2l0aW9uQ2VsbHMoIGNoYW5nZWRDZWxsSW5kZXggKTtcbiAgdGhpcy5fZ2V0V3JhcFNoaWZ0Q2VsbHMoKTtcbiAgdGhpcy5zZXRHYWxsZXJ5U2l6ZSgpO1xuICAvLyB1cGRhdGUgc2VsZWN0ZWRJbmRleFxuICAvLyB0cnkgdG8gbWFpbnRhaW4gcG9zaXRpb24gJiBzZWxlY3QgcHJldmlvdXMgc2VsZWN0ZWQgZWxlbWVudFxuICB2YXIgY2VsbCA9IHRoaXMuZ2V0Q2VsbCggcHJldlNlbGVjdGVkRWxlbSApO1xuICBpZiAoIGNlbGwgKSB7XG4gICAgdGhpcy5zZWxlY3RlZEluZGV4ID0gdGhpcy5nZXRDZWxsU2xpZGVJbmRleCggY2VsbCApO1xuICB9XG4gIHRoaXMuc2VsZWN0ZWRJbmRleCA9IE1hdGgubWluKCB0aGlzLnNsaWRlcy5sZW5ndGggLSAxLCB0aGlzLnNlbGVjdGVkSW5kZXggKTtcblxuICB0aGlzLmVtaXRFdmVudCggJ2NlbGxDaGFuZ2UnLCBbIGNoYW5nZWRDZWxsSW5kZXggXSApO1xuICAvLyBwb3NpdGlvbiBzbGlkZXJcbiAgdGhpcy5zZWxlY3QoIHRoaXMuc2VsZWN0ZWRJbmRleCApO1xuICAvLyBkbyBub3QgcG9zaXRpb24gc2xpZGVyIGFmdGVyIGxhenkgbG9hZFxuICBpZiAoIGlzUG9zaXRpb25pbmdTbGlkZXIgKSB7XG4gICAgdGhpcy5wb3NpdGlvblNsaWRlckF0U2VsZWN0ZWQoKTtcbiAgfVxufTtcblxuLy8gLS0tLS0gIC0tLS0tIC8vXG5cbnJldHVybiBGbGlja2l0eTtcblxufSkpO1xuIiwiLy8gbGF6eWxvYWRcbiggZnVuY3Rpb24oIHdpbmRvdywgZmFjdG9yeSApIHtcbiAgLy8gdW5pdmVyc2FsIG1vZHVsZSBkZWZpbml0aW9uXG4gIC8qIGpzaGludCBzdHJpY3Q6IGZhbHNlICovXG4gIGlmICggdHlwZW9mIGRlZmluZSA9PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQgKSB7XG4gICAgLy8gQU1EXG4gICAgZGVmaW5lKCBbXG4gICAgICAnLi9mbGlja2l0eScsXG4gICAgICAnZml6enktdWktdXRpbHMvdXRpbHMnXG4gICAgXSwgZnVuY3Rpb24oIEZsaWNraXR5LCB1dGlscyApIHtcbiAgICAgIHJldHVybiBmYWN0b3J5KCB3aW5kb3csIEZsaWNraXR5LCB1dGlscyApO1xuICAgIH0pO1xuICB9IGVsc2UgaWYgKCB0eXBlb2YgbW9kdWxlID09ICdvYmplY3QnICYmIG1vZHVsZS5leHBvcnRzICkge1xuICAgIC8vIENvbW1vbkpTXG4gICAgbW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KFxuICAgICAgd2luZG93LFxuICAgICAgcmVxdWlyZSgnLi9mbGlja2l0eScpLFxuICAgICAgcmVxdWlyZSgnZml6enktdWktdXRpbHMnKVxuICAgICk7XG4gIH0gZWxzZSB7XG4gICAgLy8gYnJvd3NlciBnbG9iYWxcbiAgICBmYWN0b3J5KFxuICAgICAgd2luZG93LFxuICAgICAgd2luZG93LkZsaWNraXR5LFxuICAgICAgd2luZG93LmZpenp5VUlVdGlsc1xuICAgICk7XG4gIH1cblxufSggd2luZG93LCBmdW5jdGlvbiBmYWN0b3J5KCB3aW5kb3csIEZsaWNraXR5LCB1dGlscyApIHtcbid1c2Ugc3RyaWN0JztcblxuRmxpY2tpdHkuY3JlYXRlTWV0aG9kcy5wdXNoKCdfY3JlYXRlTGF6eWxvYWQnKTtcbnZhciBwcm90byA9IEZsaWNraXR5LnByb3RvdHlwZTtcblxucHJvdG8uX2NyZWF0ZUxhenlsb2FkID0gZnVuY3Rpb24oKSB7XG4gIHRoaXMub24oICdzZWxlY3QnLCB0aGlzLmxhenlMb2FkICk7XG59O1xuXG5wcm90by5sYXp5TG9hZCA9IGZ1bmN0aW9uKCkge1xuICB2YXIgbGF6eUxvYWQgPSB0aGlzLm9wdGlvbnMubGF6eUxvYWQ7XG4gIGlmICggIWxhenlMb2FkICkge1xuICAgIHJldHVybjtcbiAgfVxuICAvLyBnZXQgYWRqYWNlbnQgY2VsbHMsIHVzZSBsYXp5TG9hZCBvcHRpb24gZm9yIGFkamFjZW50IGNvdW50XG4gIHZhciBhZGpDb3VudCA9IHR5cGVvZiBsYXp5TG9hZCA9PSAnbnVtYmVyJyA/IGxhenlMb2FkIDogMDtcbiAgdmFyIGNlbGxFbGVtcyA9IHRoaXMuZ2V0QWRqYWNlbnRDZWxsRWxlbWVudHMoIGFkakNvdW50ICk7XG4gIC8vIGdldCBsYXp5IGltYWdlcyBpbiB0aG9zZSBjZWxsc1xuICB2YXIgbGF6eUltYWdlcyA9IFtdO1xuICBjZWxsRWxlbXMuZm9yRWFjaCggZnVuY3Rpb24oIGNlbGxFbGVtICkge1xuICAgIHZhciBsYXp5Q2VsbEltYWdlcyA9IGdldENlbGxMYXp5SW1hZ2VzKCBjZWxsRWxlbSApO1xuICAgIGxhenlJbWFnZXMgPSBsYXp5SW1hZ2VzLmNvbmNhdCggbGF6eUNlbGxJbWFnZXMgKTtcbiAgfSk7XG4gIC8vIGxvYWQgbGF6eSBpbWFnZXNcbiAgbGF6eUltYWdlcy5mb3JFYWNoKCBmdW5jdGlvbiggaW1nICkge1xuICAgIG5ldyBMYXp5TG9hZGVyKCBpbWcsIHRoaXMgKTtcbiAgfSwgdGhpcyApO1xufTtcblxuZnVuY3Rpb24gZ2V0Q2VsbExhenlJbWFnZXMoIGNlbGxFbGVtICkge1xuICAvLyBjaGVjayBpZiBjZWxsIGVsZW1lbnQgaXMgbGF6eSBpbWFnZVxuICBpZiAoIGNlbGxFbGVtLm5vZGVOYW1lID09ICdJTUcnICkge1xuICAgIHZhciBsYXp5bG9hZEF0dHIgPSBjZWxsRWxlbS5nZXRBdHRyaWJ1dGUoJ2RhdGEtZmxpY2tpdHktbGF6eWxvYWQnKTtcbiAgICB2YXIgc3JjQXR0ciA9IGNlbGxFbGVtLmdldEF0dHJpYnV0ZSgnZGF0YS1mbGlja2l0eS1sYXp5bG9hZC1zcmMnKTtcbiAgICB2YXIgc3Jjc2V0QXR0ciA9IGNlbGxFbGVtLmdldEF0dHJpYnV0ZSgnZGF0YS1mbGlja2l0eS1sYXp5bG9hZC1zcmNzZXQnKTtcbiAgICBpZiAoIGxhenlsb2FkQXR0ciB8fCBzcmNBdHRyIHx8IHNyY3NldEF0dHIgKSB7XG4gICAgICByZXR1cm4gWyBjZWxsRWxlbSBdO1xuICAgIH1cbiAgfVxuICAvLyBzZWxlY3QgbGF6eSBpbWFnZXMgaW4gY2VsbFxuICB2YXIgbGF6eVNlbGVjdG9yID0gJ2ltZ1tkYXRhLWZsaWNraXR5LWxhenlsb2FkXSwgJyArXG4gICAgJ2ltZ1tkYXRhLWZsaWNraXR5LWxhenlsb2FkLXNyY10sIGltZ1tkYXRhLWZsaWNraXR5LWxhenlsb2FkLXNyY3NldF0nO1xuICB2YXIgaW1ncyA9IGNlbGxFbGVtLnF1ZXJ5U2VsZWN0b3JBbGwoIGxhenlTZWxlY3RvciApO1xuICByZXR1cm4gdXRpbHMubWFrZUFycmF5KCBpbWdzICk7XG59XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIExhenlMb2FkZXIgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gLy9cblxuLyoqXG4gKiBjbGFzcyB0byBoYW5kbGUgbG9hZGluZyBpbWFnZXNcbiAqL1xuZnVuY3Rpb24gTGF6eUxvYWRlciggaW1nLCBmbGlja2l0eSApIHtcbiAgdGhpcy5pbWcgPSBpbWc7XG4gIHRoaXMuZmxpY2tpdHkgPSBmbGlja2l0eTtcbiAgdGhpcy5sb2FkKCk7XG59XG5cbkxhenlMb2FkZXIucHJvdG90eXBlLmhhbmRsZUV2ZW50ID0gdXRpbHMuaGFuZGxlRXZlbnQ7XG5cbkxhenlMb2FkZXIucHJvdG90eXBlLmxvYWQgPSBmdW5jdGlvbigpIHtcbiAgdGhpcy5pbWcuYWRkRXZlbnRMaXN0ZW5lciggJ2xvYWQnLCB0aGlzICk7XG4gIHRoaXMuaW1nLmFkZEV2ZW50TGlzdGVuZXIoICdlcnJvcicsIHRoaXMgKTtcbiAgLy8gZ2V0IHNyYyAmIHNyY3NldFxuICB2YXIgc3JjID0gdGhpcy5pbWcuZ2V0QXR0cmlidXRlKCdkYXRhLWZsaWNraXR5LWxhenlsb2FkJykgfHxcbiAgICB0aGlzLmltZy5nZXRBdHRyaWJ1dGUoJ2RhdGEtZmxpY2tpdHktbGF6eWxvYWQtc3JjJyk7XG4gIHZhciBzcmNzZXQgPSB0aGlzLmltZy5nZXRBdHRyaWJ1dGUoJ2RhdGEtZmxpY2tpdHktbGF6eWxvYWQtc3Jjc2V0Jyk7XG4gIC8vIHNldCBzcmMgJiBzZXJzZXRcbiAgdGhpcy5pbWcuc3JjID0gc3JjO1xuICBpZiAoIHNyY3NldCApIHtcbiAgICB0aGlzLmltZy5zZXRBdHRyaWJ1dGUoICdzcmNzZXQnLCBzcmNzZXQgKTtcbiAgfVxuICAvLyByZW1vdmUgYXR0clxuICB0aGlzLmltZy5yZW1vdmVBdHRyaWJ1dGUoJ2RhdGEtZmxpY2tpdHktbGF6eWxvYWQnKTtcbiAgdGhpcy5pbWcucmVtb3ZlQXR0cmlidXRlKCdkYXRhLWZsaWNraXR5LWxhenlsb2FkLXNyYycpO1xuICB0aGlzLmltZy5yZW1vdmVBdHRyaWJ1dGUoJ2RhdGEtZmxpY2tpdHktbGF6eWxvYWQtc3Jjc2V0Jyk7XG59O1xuXG5MYXp5TG9hZGVyLnByb3RvdHlwZS5vbmxvYWQgPSBmdW5jdGlvbiggZXZlbnQgKSB7XG4gIHRoaXMuY29tcGxldGUoIGV2ZW50LCAnZmxpY2tpdHktbGF6eWxvYWRlZCcgKTtcbn07XG5cbkxhenlMb2FkZXIucHJvdG90eXBlLm9uZXJyb3IgPSBmdW5jdGlvbiggZXZlbnQgKSB7XG4gIHRoaXMuY29tcGxldGUoIGV2ZW50LCAnZmxpY2tpdHktbGF6eWVycm9yJyApO1xufTtcblxuTGF6eUxvYWRlci5wcm90b3R5cGUuY29tcGxldGUgPSBmdW5jdGlvbiggZXZlbnQsIGNsYXNzTmFtZSApIHtcbiAgLy8gdW5iaW5kIGV2ZW50c1xuICB0aGlzLmltZy5yZW1vdmVFdmVudExpc3RlbmVyKCAnbG9hZCcsIHRoaXMgKTtcbiAgdGhpcy5pbWcucmVtb3ZlRXZlbnRMaXN0ZW5lciggJ2Vycm9yJywgdGhpcyApO1xuXG4gIHZhciBjZWxsID0gdGhpcy5mbGlja2l0eS5nZXRQYXJlbnRDZWxsKCB0aGlzLmltZyApO1xuICB2YXIgY2VsbEVsZW0gPSBjZWxsICYmIGNlbGwuZWxlbWVudDtcbiAgdGhpcy5mbGlja2l0eS5jZWxsU2l6ZUNoYW5nZSggY2VsbEVsZW0gKTtcblxuICB0aGlzLmltZy5jbGFzc0xpc3QuYWRkKCBjbGFzc05hbWUgKTtcbiAgdGhpcy5mbGlja2l0eS5kaXNwYXRjaEV2ZW50KCAnbGF6eUxvYWQnLCBldmVudCwgY2VsbEVsZW0gKTtcbn07XG5cbi8vIC0tLS0tICAtLS0tLSAvL1xuXG5GbGlja2l0eS5MYXp5TG9hZGVyID0gTGF6eUxvYWRlcjtcblxucmV0dXJuIEZsaWNraXR5O1xuXG59KSk7XG4iLCIvKiFcbiAqIEZsaWNraXR5IHYyLjIuMVxuICogVG91Y2gsIHJlc3BvbnNpdmUsIGZsaWNrYWJsZSBjYXJvdXNlbHNcbiAqXG4gKiBMaWNlbnNlZCBHUEx2MyBmb3Igb3BlbiBzb3VyY2UgdXNlXG4gKiBvciBGbGlja2l0eSBDb21tZXJjaWFsIExpY2Vuc2UgZm9yIGNvbW1lcmNpYWwgdXNlXG4gKlxuICogaHR0cHM6Ly9mbGlja2l0eS5tZXRhZml6enkuY29cbiAqIENvcHlyaWdodCAyMDE1LTIwMTkgTWV0YWZpenp5XG4gKi9cblxuKCBmdW5jdGlvbiggd2luZG93LCBmYWN0b3J5ICkge1xuICAvLyB1bml2ZXJzYWwgbW9kdWxlIGRlZmluaXRpb25cbiAgLyoganNoaW50IHN0cmljdDogZmFsc2UgKi9cbiAgaWYgKCB0eXBlb2YgZGVmaW5lID09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCApIHtcbiAgICAvLyBBTURcbiAgICBkZWZpbmUoIFtcbiAgICAgICcuL2ZsaWNraXR5JyxcbiAgICAgICcuL2RyYWcnLFxuICAgICAgJy4vcHJldi1uZXh0LWJ1dHRvbicsXG4gICAgICAnLi9wYWdlLWRvdHMnLFxuICAgICAgJy4vcGxheWVyJyxcbiAgICAgICcuL2FkZC1yZW1vdmUtY2VsbCcsXG4gICAgICAnLi9sYXp5bG9hZCdcbiAgICBdLCBmYWN0b3J5ICk7XG4gIH0gZWxzZSBpZiAoIHR5cGVvZiBtb2R1bGUgPT0gJ29iamVjdCcgJiYgbW9kdWxlLmV4cG9ydHMgKSB7XG4gICAgLy8gQ29tbW9uSlNcbiAgICBtb2R1bGUuZXhwb3J0cyA9IGZhY3RvcnkoXG4gICAgICByZXF1aXJlKCcuL2ZsaWNraXR5JyksXG4gICAgICByZXF1aXJlKCcuL2RyYWcnKSxcbiAgICAgIHJlcXVpcmUoJy4vcHJldi1uZXh0LWJ1dHRvbicpLFxuICAgICAgcmVxdWlyZSgnLi9wYWdlLWRvdHMnKSxcbiAgICAgIHJlcXVpcmUoJy4vcGxheWVyJyksXG4gICAgICByZXF1aXJlKCcuL2FkZC1yZW1vdmUtY2VsbCcpLFxuICAgICAgcmVxdWlyZSgnLi9sYXp5bG9hZCcpXG4gICAgKTtcbiAgfVxuXG59KSggd2luZG93LCBmdW5jdGlvbiBmYWN0b3J5KCBGbGlja2l0eSApIHtcbiAgLypqc2hpbnQgc3RyaWN0OiBmYWxzZSovXG4gIHJldHVybiBGbGlja2l0eTtcbn0pO1xuIiwiLyohXG4gKiBpbWFnZXNMb2FkZWQgdjQuMS40XG4gKiBKYXZhU2NyaXB0IGlzIGFsbCBsaWtlIFwiWW91IGltYWdlcyBhcmUgZG9uZSB5ZXQgb3Igd2hhdD9cIlxuICogTUlUIExpY2Vuc2VcbiAqL1xuXG4oIGZ1bmN0aW9uKCB3aW5kb3csIGZhY3RvcnkgKSB7ICd1c2Ugc3RyaWN0JztcbiAgLy8gdW5pdmVyc2FsIG1vZHVsZSBkZWZpbml0aW9uXG5cbiAgLypnbG9iYWwgZGVmaW5lOiBmYWxzZSwgbW9kdWxlOiBmYWxzZSwgcmVxdWlyZTogZmFsc2UgKi9cblxuICBpZiAoIHR5cGVvZiBkZWZpbmUgPT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kICkge1xuICAgIC8vIEFNRFxuICAgIGRlZmluZSggW1xuICAgICAgJ2V2LWVtaXR0ZXIvZXYtZW1pdHRlcidcbiAgICBdLCBmdW5jdGlvbiggRXZFbWl0dGVyICkge1xuICAgICAgcmV0dXJuIGZhY3RvcnkoIHdpbmRvdywgRXZFbWl0dGVyICk7XG4gICAgfSk7XG4gIH0gZWxzZSBpZiAoIHR5cGVvZiBtb2R1bGUgPT0gJ29iamVjdCcgJiYgbW9kdWxlLmV4cG9ydHMgKSB7XG4gICAgLy8gQ29tbW9uSlNcbiAgICBtb2R1bGUuZXhwb3J0cyA9IGZhY3RvcnkoXG4gICAgICB3aW5kb3csXG4gICAgICByZXF1aXJlKCdldi1lbWl0dGVyJylcbiAgICApO1xuICB9IGVsc2Uge1xuICAgIC8vIGJyb3dzZXIgZ2xvYmFsXG4gICAgd2luZG93LmltYWdlc0xvYWRlZCA9IGZhY3RvcnkoXG4gICAgICB3aW5kb3csXG4gICAgICB3aW5kb3cuRXZFbWl0dGVyXG4gICAgKTtcbiAgfVxuXG59KSggdHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcgPyB3aW5kb3cgOiB0aGlzLFxuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSAgZmFjdG9yeSAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSAvL1xuXG5mdW5jdGlvbiBmYWN0b3J5KCB3aW5kb3csIEV2RW1pdHRlciApIHtcblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgJCA9IHdpbmRvdy5qUXVlcnk7XG52YXIgY29uc29sZSA9IHdpbmRvdy5jb25zb2xlO1xuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSBoZWxwZXJzIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIC8vXG5cbi8vIGV4dGVuZCBvYmplY3RzXG5mdW5jdGlvbiBleHRlbmQoIGEsIGIgKSB7XG4gIGZvciAoIHZhciBwcm9wIGluIGIgKSB7XG4gICAgYVsgcHJvcCBdID0gYlsgcHJvcCBdO1xuICB9XG4gIHJldHVybiBhO1xufVxuXG52YXIgYXJyYXlTbGljZSA9IEFycmF5LnByb3RvdHlwZS5zbGljZTtcblxuLy8gdHVybiBlbGVtZW50IG9yIG5vZGVMaXN0IGludG8gYW4gYXJyYXlcbmZ1bmN0aW9uIG1ha2VBcnJheSggb2JqICkge1xuICBpZiAoIEFycmF5LmlzQXJyYXkoIG9iaiApICkge1xuICAgIC8vIHVzZSBvYmplY3QgaWYgYWxyZWFkeSBhbiBhcnJheVxuICAgIHJldHVybiBvYmo7XG4gIH1cblxuICB2YXIgaXNBcnJheUxpa2UgPSB0eXBlb2Ygb2JqID09ICdvYmplY3QnICYmIHR5cGVvZiBvYmoubGVuZ3RoID09ICdudW1iZXInO1xuICBpZiAoIGlzQXJyYXlMaWtlICkge1xuICAgIC8vIGNvbnZlcnQgbm9kZUxpc3QgdG8gYXJyYXlcbiAgICByZXR1cm4gYXJyYXlTbGljZS5jYWxsKCBvYmogKTtcbiAgfVxuXG4gIC8vIGFycmF5IG9mIHNpbmdsZSBpbmRleFxuICByZXR1cm4gWyBvYmogXTtcbn1cblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gaW1hZ2VzTG9hZGVkIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIC8vXG5cbi8qKlxuICogQHBhcmFtIHtBcnJheSwgRWxlbWVudCwgTm9kZUxpc3QsIFN0cmluZ30gZWxlbVxuICogQHBhcmFtIHtPYmplY3Qgb3IgRnVuY3Rpb259IG9wdGlvbnMgLSBpZiBmdW5jdGlvbiwgdXNlIGFzIGNhbGxiYWNrXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBvbkFsd2F5cyAtIGNhbGxiYWNrIGZ1bmN0aW9uXG4gKi9cbmZ1bmN0aW9uIEltYWdlc0xvYWRlZCggZWxlbSwgb3B0aW9ucywgb25BbHdheXMgKSB7XG4gIC8vIGNvZXJjZSBJbWFnZXNMb2FkZWQoKSB3aXRob3V0IG5ldywgdG8gYmUgbmV3IEltYWdlc0xvYWRlZCgpXG4gIGlmICggISggdGhpcyBpbnN0YW5jZW9mIEltYWdlc0xvYWRlZCApICkge1xuICAgIHJldHVybiBuZXcgSW1hZ2VzTG9hZGVkKCBlbGVtLCBvcHRpb25zLCBvbkFsd2F5cyApO1xuICB9XG4gIC8vIHVzZSBlbGVtIGFzIHNlbGVjdG9yIHN0cmluZ1xuICB2YXIgcXVlcnlFbGVtID0gZWxlbTtcbiAgaWYgKCB0eXBlb2YgZWxlbSA9PSAnc3RyaW5nJyApIHtcbiAgICBxdWVyeUVsZW0gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCBlbGVtICk7XG4gIH1cbiAgLy8gYmFpbCBpZiBiYWQgZWxlbWVudFxuICBpZiAoICFxdWVyeUVsZW0gKSB7XG4gICAgY29uc29sZS5lcnJvciggJ0JhZCBlbGVtZW50IGZvciBpbWFnZXNMb2FkZWQgJyArICggcXVlcnlFbGVtIHx8IGVsZW0gKSApO1xuICAgIHJldHVybjtcbiAgfVxuXG4gIHRoaXMuZWxlbWVudHMgPSBtYWtlQXJyYXkoIHF1ZXJ5RWxlbSApO1xuICB0aGlzLm9wdGlvbnMgPSBleHRlbmQoIHt9LCB0aGlzLm9wdGlvbnMgKTtcbiAgLy8gc2hpZnQgYXJndW1lbnRzIGlmIG5vIG9wdGlvbnMgc2V0XG4gIGlmICggdHlwZW9mIG9wdGlvbnMgPT0gJ2Z1bmN0aW9uJyApIHtcbiAgICBvbkFsd2F5cyA9IG9wdGlvbnM7XG4gIH0gZWxzZSB7XG4gICAgZXh0ZW5kKCB0aGlzLm9wdGlvbnMsIG9wdGlvbnMgKTtcbiAgfVxuXG4gIGlmICggb25BbHdheXMgKSB7XG4gICAgdGhpcy5vbiggJ2Fsd2F5cycsIG9uQWx3YXlzICk7XG4gIH1cblxuICB0aGlzLmdldEltYWdlcygpO1xuXG4gIGlmICggJCApIHtcbiAgICAvLyBhZGQgalF1ZXJ5IERlZmVycmVkIG9iamVjdFxuICAgIHRoaXMuanFEZWZlcnJlZCA9IG5ldyAkLkRlZmVycmVkKCk7XG4gIH1cblxuICAvLyBIQUNLIGNoZWNrIGFzeW5jIHRvIGFsbG93IHRpbWUgdG8gYmluZCBsaXN0ZW5lcnNcbiAgc2V0VGltZW91dCggdGhpcy5jaGVjay5iaW5kKCB0aGlzICkgKTtcbn1cblxuSW1hZ2VzTG9hZGVkLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoIEV2RW1pdHRlci5wcm90b3R5cGUgKTtcblxuSW1hZ2VzTG9hZGVkLnByb3RvdHlwZS5vcHRpb25zID0ge307XG5cbkltYWdlc0xvYWRlZC5wcm90b3R5cGUuZ2V0SW1hZ2VzID0gZnVuY3Rpb24oKSB7XG4gIHRoaXMuaW1hZ2VzID0gW107XG5cbiAgLy8gZmlsdGVyICYgZmluZCBpdGVtcyBpZiB3ZSBoYXZlIGFuIGl0ZW0gc2VsZWN0b3JcbiAgdGhpcy5lbGVtZW50cy5mb3JFYWNoKCB0aGlzLmFkZEVsZW1lbnRJbWFnZXMsIHRoaXMgKTtcbn07XG5cbi8qKlxuICogQHBhcmFtIHtOb2RlfSBlbGVtZW50XG4gKi9cbkltYWdlc0xvYWRlZC5wcm90b3R5cGUuYWRkRWxlbWVudEltYWdlcyA9IGZ1bmN0aW9uKCBlbGVtICkge1xuICAvLyBmaWx0ZXIgc2libGluZ3NcbiAgaWYgKCBlbGVtLm5vZGVOYW1lID09ICdJTUcnICkge1xuICAgIHRoaXMuYWRkSW1hZ2UoIGVsZW0gKTtcbiAgfVxuICAvLyBnZXQgYmFja2dyb3VuZCBpbWFnZSBvbiBlbGVtZW50XG4gIGlmICggdGhpcy5vcHRpb25zLmJhY2tncm91bmQgPT09IHRydWUgKSB7XG4gICAgdGhpcy5hZGRFbGVtZW50QmFja2dyb3VuZEltYWdlcyggZWxlbSApO1xuICB9XG5cbiAgLy8gZmluZCBjaGlsZHJlblxuICAvLyBubyBub24tZWxlbWVudCBub2RlcywgIzE0M1xuICB2YXIgbm9kZVR5cGUgPSBlbGVtLm5vZGVUeXBlO1xuICBpZiAoICFub2RlVHlwZSB8fCAhZWxlbWVudE5vZGVUeXBlc1sgbm9kZVR5cGUgXSApIHtcbiAgICByZXR1cm47XG4gIH1cbiAgdmFyIGNoaWxkSW1ncyA9IGVsZW0ucXVlcnlTZWxlY3RvckFsbCgnaW1nJyk7XG4gIC8vIGNvbmNhdCBjaGlsZEVsZW1zIHRvIGZpbHRlckZvdW5kIGFycmF5XG4gIGZvciAoIHZhciBpPTA7IGkgPCBjaGlsZEltZ3MubGVuZ3RoOyBpKysgKSB7XG4gICAgdmFyIGltZyA9IGNoaWxkSW1nc1tpXTtcbiAgICB0aGlzLmFkZEltYWdlKCBpbWcgKTtcbiAgfVxuXG4gIC8vIGdldCBjaGlsZCBiYWNrZ3JvdW5kIGltYWdlc1xuICBpZiAoIHR5cGVvZiB0aGlzLm9wdGlvbnMuYmFja2dyb3VuZCA9PSAnc3RyaW5nJyApIHtcbiAgICB2YXIgY2hpbGRyZW4gPSBlbGVtLnF1ZXJ5U2VsZWN0b3JBbGwoIHRoaXMub3B0aW9ucy5iYWNrZ3JvdW5kICk7XG4gICAgZm9yICggaT0wOyBpIDwgY2hpbGRyZW4ubGVuZ3RoOyBpKysgKSB7XG4gICAgICB2YXIgY2hpbGQgPSBjaGlsZHJlbltpXTtcbiAgICAgIHRoaXMuYWRkRWxlbWVudEJhY2tncm91bmRJbWFnZXMoIGNoaWxkICk7XG4gICAgfVxuICB9XG59O1xuXG52YXIgZWxlbWVudE5vZGVUeXBlcyA9IHtcbiAgMTogdHJ1ZSxcbiAgOTogdHJ1ZSxcbiAgMTE6IHRydWVcbn07XG5cbkltYWdlc0xvYWRlZC5wcm90b3R5cGUuYWRkRWxlbWVudEJhY2tncm91bmRJbWFnZXMgPSBmdW5jdGlvbiggZWxlbSApIHtcbiAgdmFyIHN0eWxlID0gZ2V0Q29tcHV0ZWRTdHlsZSggZWxlbSApO1xuICBpZiAoICFzdHlsZSApIHtcbiAgICAvLyBGaXJlZm94IHJldHVybnMgbnVsbCBpZiBpbiBhIGhpZGRlbiBpZnJhbWUgaHR0cHM6Ly9idWd6aWwubGEvNTQ4Mzk3XG4gICAgcmV0dXJuO1xuICB9XG4gIC8vIGdldCB1cmwgaW5zaWRlIHVybChcIi4uLlwiKVxuICB2YXIgcmVVUkwgPSAvdXJsXFwoKFsnXCJdKT8oLio/KVxcMVxcKS9naTtcbiAgdmFyIG1hdGNoZXMgPSByZVVSTC5leGVjKCBzdHlsZS5iYWNrZ3JvdW5kSW1hZ2UgKTtcbiAgd2hpbGUgKCBtYXRjaGVzICE9PSBudWxsICkge1xuICAgIHZhciB1cmwgPSBtYXRjaGVzICYmIG1hdGNoZXNbMl07XG4gICAgaWYgKCB1cmwgKSB7XG4gICAgICB0aGlzLmFkZEJhY2tncm91bmQoIHVybCwgZWxlbSApO1xuICAgIH1cbiAgICBtYXRjaGVzID0gcmVVUkwuZXhlYyggc3R5bGUuYmFja2dyb3VuZEltYWdlICk7XG4gIH1cbn07XG5cbi8qKlxuICogQHBhcmFtIHtJbWFnZX0gaW1nXG4gKi9cbkltYWdlc0xvYWRlZC5wcm90b3R5cGUuYWRkSW1hZ2UgPSBmdW5jdGlvbiggaW1nICkge1xuICB2YXIgbG9hZGluZ0ltYWdlID0gbmV3IExvYWRpbmdJbWFnZSggaW1nICk7XG4gIHRoaXMuaW1hZ2VzLnB1c2goIGxvYWRpbmdJbWFnZSApO1xufTtcblxuSW1hZ2VzTG9hZGVkLnByb3RvdHlwZS5hZGRCYWNrZ3JvdW5kID0gZnVuY3Rpb24oIHVybCwgZWxlbSApIHtcbiAgdmFyIGJhY2tncm91bmQgPSBuZXcgQmFja2dyb3VuZCggdXJsLCBlbGVtICk7XG4gIHRoaXMuaW1hZ2VzLnB1c2goIGJhY2tncm91bmQgKTtcbn07XG5cbkltYWdlc0xvYWRlZC5wcm90b3R5cGUuY2hlY2sgPSBmdW5jdGlvbigpIHtcbiAgdmFyIF90aGlzID0gdGhpcztcbiAgdGhpcy5wcm9ncmVzc2VkQ291bnQgPSAwO1xuICB0aGlzLmhhc0FueUJyb2tlbiA9IGZhbHNlO1xuICAvLyBjb21wbGV0ZSBpZiBubyBpbWFnZXNcbiAgaWYgKCAhdGhpcy5pbWFnZXMubGVuZ3RoICkge1xuICAgIHRoaXMuY29tcGxldGUoKTtcbiAgICByZXR1cm47XG4gIH1cblxuICBmdW5jdGlvbiBvblByb2dyZXNzKCBpbWFnZSwgZWxlbSwgbWVzc2FnZSApIHtcbiAgICAvLyBIQUNLIC0gQ2hyb21lIHRyaWdnZXJzIGV2ZW50IGJlZm9yZSBvYmplY3QgcHJvcGVydGllcyBoYXZlIGNoYW5nZWQuICM4M1xuICAgIHNldFRpbWVvdXQoIGZ1bmN0aW9uKCkge1xuICAgICAgX3RoaXMucHJvZ3Jlc3MoIGltYWdlLCBlbGVtLCBtZXNzYWdlICk7XG4gICAgfSk7XG4gIH1cblxuICB0aGlzLmltYWdlcy5mb3JFYWNoKCBmdW5jdGlvbiggbG9hZGluZ0ltYWdlICkge1xuICAgIGxvYWRpbmdJbWFnZS5vbmNlKCAncHJvZ3Jlc3MnLCBvblByb2dyZXNzICk7XG4gICAgbG9hZGluZ0ltYWdlLmNoZWNrKCk7XG4gIH0pO1xufTtcblxuSW1hZ2VzTG9hZGVkLnByb3RvdHlwZS5wcm9ncmVzcyA9IGZ1bmN0aW9uKCBpbWFnZSwgZWxlbSwgbWVzc2FnZSApIHtcbiAgdGhpcy5wcm9ncmVzc2VkQ291bnQrKztcbiAgdGhpcy5oYXNBbnlCcm9rZW4gPSB0aGlzLmhhc0FueUJyb2tlbiB8fCAhaW1hZ2UuaXNMb2FkZWQ7XG4gIC8vIHByb2dyZXNzIGV2ZW50XG4gIHRoaXMuZW1pdEV2ZW50KCAncHJvZ3Jlc3MnLCBbIHRoaXMsIGltYWdlLCBlbGVtIF0gKTtcbiAgaWYgKCB0aGlzLmpxRGVmZXJyZWQgJiYgdGhpcy5qcURlZmVycmVkLm5vdGlmeSApIHtcbiAgICB0aGlzLmpxRGVmZXJyZWQubm90aWZ5KCB0aGlzLCBpbWFnZSApO1xuICB9XG4gIC8vIGNoZWNrIGlmIGNvbXBsZXRlZFxuICBpZiAoIHRoaXMucHJvZ3Jlc3NlZENvdW50ID09IHRoaXMuaW1hZ2VzLmxlbmd0aCApIHtcbiAgICB0aGlzLmNvbXBsZXRlKCk7XG4gIH1cblxuICBpZiAoIHRoaXMub3B0aW9ucy5kZWJ1ZyAmJiBjb25zb2xlICkge1xuICAgIGNvbnNvbGUubG9nKCAncHJvZ3Jlc3M6ICcgKyBtZXNzYWdlLCBpbWFnZSwgZWxlbSApO1xuICB9XG59O1xuXG5JbWFnZXNMb2FkZWQucHJvdG90eXBlLmNvbXBsZXRlID0gZnVuY3Rpb24oKSB7XG4gIHZhciBldmVudE5hbWUgPSB0aGlzLmhhc0FueUJyb2tlbiA/ICdmYWlsJyA6ICdkb25lJztcbiAgdGhpcy5pc0NvbXBsZXRlID0gdHJ1ZTtcbiAgdGhpcy5lbWl0RXZlbnQoIGV2ZW50TmFtZSwgWyB0aGlzIF0gKTtcbiAgdGhpcy5lbWl0RXZlbnQoICdhbHdheXMnLCBbIHRoaXMgXSApO1xuICBpZiAoIHRoaXMuanFEZWZlcnJlZCApIHtcbiAgICB2YXIganFNZXRob2QgPSB0aGlzLmhhc0FueUJyb2tlbiA/ICdyZWplY3QnIDogJ3Jlc29sdmUnO1xuICAgIHRoaXMuanFEZWZlcnJlZFsganFNZXRob2QgXSggdGhpcyApO1xuICB9XG59O1xuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSAgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gLy9cblxuZnVuY3Rpb24gTG9hZGluZ0ltYWdlKCBpbWcgKSB7XG4gIHRoaXMuaW1nID0gaW1nO1xufVxuXG5Mb2FkaW5nSW1hZ2UucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZSggRXZFbWl0dGVyLnByb3RvdHlwZSApO1xuXG5Mb2FkaW5nSW1hZ2UucHJvdG90eXBlLmNoZWNrID0gZnVuY3Rpb24oKSB7XG4gIC8vIElmIGNvbXBsZXRlIGlzIHRydWUgYW5kIGJyb3dzZXIgc3VwcG9ydHMgbmF0dXJhbCBzaXplcyxcbiAgLy8gdHJ5IHRvIGNoZWNrIGZvciBpbWFnZSBzdGF0dXMgbWFudWFsbHkuXG4gIHZhciBpc0NvbXBsZXRlID0gdGhpcy5nZXRJc0ltYWdlQ29tcGxldGUoKTtcbiAgaWYgKCBpc0NvbXBsZXRlICkge1xuICAgIC8vIHJlcG9ydCBiYXNlZCBvbiBuYXR1cmFsV2lkdGhcbiAgICB0aGlzLmNvbmZpcm0oIHRoaXMuaW1nLm5hdHVyYWxXaWR0aCAhPT0gMCwgJ25hdHVyYWxXaWR0aCcgKTtcbiAgICByZXR1cm47XG4gIH1cblxuICAvLyBJZiBub25lIG9mIHRoZSBjaGVja3MgYWJvdmUgbWF0Y2hlZCwgc2ltdWxhdGUgbG9hZGluZyBvbiBkZXRhY2hlZCBlbGVtZW50LlxuICB0aGlzLnByb3h5SW1hZ2UgPSBuZXcgSW1hZ2UoKTtcbiAgdGhpcy5wcm94eUltYWdlLmFkZEV2ZW50TGlzdGVuZXIoICdsb2FkJywgdGhpcyApO1xuICB0aGlzLnByb3h5SW1hZ2UuYWRkRXZlbnRMaXN0ZW5lciggJ2Vycm9yJywgdGhpcyApO1xuICAvLyBiaW5kIHRvIGltYWdlIGFzIHdlbGwgZm9yIEZpcmVmb3guICMxOTFcbiAgdGhpcy5pbWcuYWRkRXZlbnRMaXN0ZW5lciggJ2xvYWQnLCB0aGlzICk7XG4gIHRoaXMuaW1nLmFkZEV2ZW50TGlzdGVuZXIoICdlcnJvcicsIHRoaXMgKTtcbiAgdGhpcy5wcm94eUltYWdlLnNyYyA9IHRoaXMuaW1nLnNyYztcbn07XG5cbkxvYWRpbmdJbWFnZS5wcm90b3R5cGUuZ2V0SXNJbWFnZUNvbXBsZXRlID0gZnVuY3Rpb24oKSB7XG4gIC8vIGNoZWNrIGZvciBub24temVybywgbm9uLXVuZGVmaW5lZCBuYXR1cmFsV2lkdGhcbiAgLy8gZml4ZXMgU2FmYXJpK0luZmluaXRlU2Nyb2xsK01hc29ucnkgYnVnIGluZmluaXRlLXNjcm9sbCM2NzFcbiAgcmV0dXJuIHRoaXMuaW1nLmNvbXBsZXRlICYmIHRoaXMuaW1nLm5hdHVyYWxXaWR0aDtcbn07XG5cbkxvYWRpbmdJbWFnZS5wcm90b3R5cGUuY29uZmlybSA9IGZ1bmN0aW9uKCBpc0xvYWRlZCwgbWVzc2FnZSApIHtcbiAgdGhpcy5pc0xvYWRlZCA9IGlzTG9hZGVkO1xuICB0aGlzLmVtaXRFdmVudCggJ3Byb2dyZXNzJywgWyB0aGlzLCB0aGlzLmltZywgbWVzc2FnZSBdICk7XG59O1xuXG4vLyAtLS0tLSBldmVudHMgLS0tLS0gLy9cblxuLy8gdHJpZ2dlciBzcGVjaWZpZWQgaGFuZGxlciBmb3IgZXZlbnQgdHlwZVxuTG9hZGluZ0ltYWdlLnByb3RvdHlwZS5oYW5kbGVFdmVudCA9IGZ1bmN0aW9uKCBldmVudCApIHtcbiAgdmFyIG1ldGhvZCA9ICdvbicgKyBldmVudC50eXBlO1xuICBpZiAoIHRoaXNbIG1ldGhvZCBdICkge1xuICAgIHRoaXNbIG1ldGhvZCBdKCBldmVudCApO1xuICB9XG59O1xuXG5Mb2FkaW5nSW1hZ2UucHJvdG90eXBlLm9ubG9hZCA9IGZ1bmN0aW9uKCkge1xuICB0aGlzLmNvbmZpcm0oIHRydWUsICdvbmxvYWQnICk7XG4gIHRoaXMudW5iaW5kRXZlbnRzKCk7XG59O1xuXG5Mb2FkaW5nSW1hZ2UucHJvdG90eXBlLm9uZXJyb3IgPSBmdW5jdGlvbigpIHtcbiAgdGhpcy5jb25maXJtKCBmYWxzZSwgJ29uZXJyb3InICk7XG4gIHRoaXMudW5iaW5kRXZlbnRzKCk7XG59O1xuXG5Mb2FkaW5nSW1hZ2UucHJvdG90eXBlLnVuYmluZEV2ZW50cyA9IGZ1bmN0aW9uKCkge1xuICB0aGlzLnByb3h5SW1hZ2UucmVtb3ZlRXZlbnRMaXN0ZW5lciggJ2xvYWQnLCB0aGlzICk7XG4gIHRoaXMucHJveHlJbWFnZS5yZW1vdmVFdmVudExpc3RlbmVyKCAnZXJyb3InLCB0aGlzICk7XG4gIHRoaXMuaW1nLnJlbW92ZUV2ZW50TGlzdGVuZXIoICdsb2FkJywgdGhpcyApO1xuICB0aGlzLmltZy5yZW1vdmVFdmVudExpc3RlbmVyKCAnZXJyb3InLCB0aGlzICk7XG59O1xuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSBCYWNrZ3JvdW5kIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIC8vXG5cbmZ1bmN0aW9uIEJhY2tncm91bmQoIHVybCwgZWxlbWVudCApIHtcbiAgdGhpcy51cmwgPSB1cmw7XG4gIHRoaXMuZWxlbWVudCA9IGVsZW1lbnQ7XG4gIHRoaXMuaW1nID0gbmV3IEltYWdlKCk7XG59XG5cbi8vIGluaGVyaXQgTG9hZGluZ0ltYWdlIHByb3RvdHlwZVxuQmFja2dyb3VuZC5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKCBMb2FkaW5nSW1hZ2UucHJvdG90eXBlICk7XG5cbkJhY2tncm91bmQucHJvdG90eXBlLmNoZWNrID0gZnVuY3Rpb24oKSB7XG4gIHRoaXMuaW1nLmFkZEV2ZW50TGlzdGVuZXIoICdsb2FkJywgdGhpcyApO1xuICB0aGlzLmltZy5hZGRFdmVudExpc3RlbmVyKCAnZXJyb3InLCB0aGlzICk7XG4gIHRoaXMuaW1nLnNyYyA9IHRoaXMudXJsO1xuICAvLyBjaGVjayBpZiBpbWFnZSBpcyBhbHJlYWR5IGNvbXBsZXRlXG4gIHZhciBpc0NvbXBsZXRlID0gdGhpcy5nZXRJc0ltYWdlQ29tcGxldGUoKTtcbiAgaWYgKCBpc0NvbXBsZXRlICkge1xuICAgIHRoaXMuY29uZmlybSggdGhpcy5pbWcubmF0dXJhbFdpZHRoICE9PSAwLCAnbmF0dXJhbFdpZHRoJyApO1xuICAgIHRoaXMudW5iaW5kRXZlbnRzKCk7XG4gIH1cbn07XG5cbkJhY2tncm91bmQucHJvdG90eXBlLnVuYmluZEV2ZW50cyA9IGZ1bmN0aW9uKCkge1xuICB0aGlzLmltZy5yZW1vdmVFdmVudExpc3RlbmVyKCAnbG9hZCcsIHRoaXMgKTtcbiAgdGhpcy5pbWcucmVtb3ZlRXZlbnRMaXN0ZW5lciggJ2Vycm9yJywgdGhpcyApO1xufTtcblxuQmFja2dyb3VuZC5wcm90b3R5cGUuY29uZmlybSA9IGZ1bmN0aW9uKCBpc0xvYWRlZCwgbWVzc2FnZSApIHtcbiAgdGhpcy5pc0xvYWRlZCA9IGlzTG9hZGVkO1xuICB0aGlzLmVtaXRFdmVudCggJ3Byb2dyZXNzJywgWyB0aGlzLCB0aGlzLmVsZW1lbnQsIG1lc3NhZ2UgXSApO1xufTtcblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0galF1ZXJ5IC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIC8vXG5cbkltYWdlc0xvYWRlZC5tYWtlSlF1ZXJ5UGx1Z2luID0gZnVuY3Rpb24oIGpRdWVyeSApIHtcbiAgalF1ZXJ5ID0galF1ZXJ5IHx8IHdpbmRvdy5qUXVlcnk7XG4gIGlmICggIWpRdWVyeSApIHtcbiAgICByZXR1cm47XG4gIH1cbiAgLy8gc2V0IGxvY2FsIHZhcmlhYmxlXG4gICQgPSBqUXVlcnk7XG4gIC8vICQoKS5pbWFnZXNMb2FkZWQoKVxuICAkLmZuLmltYWdlc0xvYWRlZCA9IGZ1bmN0aW9uKCBvcHRpb25zLCBjYWxsYmFjayApIHtcbiAgICB2YXIgaW5zdGFuY2UgPSBuZXcgSW1hZ2VzTG9hZGVkKCB0aGlzLCBvcHRpb25zLCBjYWxsYmFjayApO1xuICAgIHJldHVybiBpbnN0YW5jZS5qcURlZmVycmVkLnByb21pc2UoICQodGhpcykgKTtcbiAgfTtcbn07XG4vLyB0cnkgbWFraW5nIHBsdWdpblxuSW1hZ2VzTG9hZGVkLm1ha2VKUXVlcnlQbHVnaW4oKTtcblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIC8vXG5cbnJldHVybiBJbWFnZXNMb2FkZWQ7XG5cbn0pO1xuIiwiLyohXG4gKiBGbGlja2l0eSBpbWFnZXNMb2FkZWQgdjIuMC4wXG4gKiBlbmFibGVzIGltYWdlc0xvYWRlZCBvcHRpb24gZm9yIEZsaWNraXR5XG4gKi9cblxuLypqc2hpbnQgYnJvd3NlcjogdHJ1ZSwgc3RyaWN0OiB0cnVlLCB1bmRlZjogdHJ1ZSwgdW51c2VkOiB0cnVlICovXG5cbiggZnVuY3Rpb24oIHdpbmRvdywgZmFjdG9yeSApIHtcbiAgLy8gdW5pdmVyc2FsIG1vZHVsZSBkZWZpbml0aW9uXG4gIC8qanNoaW50IHN0cmljdDogZmFsc2UgKi8gLypnbG9iYWxzIGRlZmluZSwgbW9kdWxlLCByZXF1aXJlICovXG4gIGlmICggdHlwZW9mIGRlZmluZSA9PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQgKSB7XG4gICAgLy8gQU1EXG4gICAgZGVmaW5lKCBbXG4gICAgICAnZmxpY2tpdHkvanMvaW5kZXgnLFxuICAgICAgJ2ltYWdlc2xvYWRlZC9pbWFnZXNsb2FkZWQnXG4gICAgXSwgZnVuY3Rpb24oIEZsaWNraXR5LCBpbWFnZXNMb2FkZWQgKSB7XG4gICAgICByZXR1cm4gZmFjdG9yeSggd2luZG93LCBGbGlja2l0eSwgaW1hZ2VzTG9hZGVkICk7XG4gICAgfSk7XG4gIH0gZWxzZSBpZiAoIHR5cGVvZiBtb2R1bGUgPT0gJ29iamVjdCcgJiYgbW9kdWxlLmV4cG9ydHMgKSB7XG4gICAgLy8gQ29tbW9uSlNcbiAgICBtb2R1bGUuZXhwb3J0cyA9IGZhY3RvcnkoXG4gICAgICB3aW5kb3csXG4gICAgICByZXF1aXJlKCdmbGlja2l0eScpLFxuICAgICAgcmVxdWlyZSgnaW1hZ2VzbG9hZGVkJylcbiAgICApO1xuICB9IGVsc2Uge1xuICAgIC8vIGJyb3dzZXIgZ2xvYmFsXG4gICAgd2luZG93LkZsaWNraXR5ID0gZmFjdG9yeShcbiAgICAgIHdpbmRvdyxcbiAgICAgIHdpbmRvdy5GbGlja2l0eSxcbiAgICAgIHdpbmRvdy5pbWFnZXNMb2FkZWRcbiAgICApO1xuICB9XG5cbn0oIHdpbmRvdywgZnVuY3Rpb24gZmFjdG9yeSggd2luZG93LCBGbGlja2l0eSwgaW1hZ2VzTG9hZGVkICkge1xuJ3VzZSBzdHJpY3QnO1xuXG5GbGlja2l0eS5jcmVhdGVNZXRob2RzLnB1c2goJ19jcmVhdGVJbWFnZXNMb2FkZWQnKTtcblxudmFyIHByb3RvID0gRmxpY2tpdHkucHJvdG90eXBlO1xuXG5wcm90by5fY3JlYXRlSW1hZ2VzTG9hZGVkID0gZnVuY3Rpb24oKSB7XG4gIHRoaXMub24oICdhY3RpdmF0ZScsIHRoaXMuaW1hZ2VzTG9hZGVkICk7XG59O1xuXG5wcm90by5pbWFnZXNMb2FkZWQgPSBmdW5jdGlvbigpIHtcbiAgaWYgKCAhdGhpcy5vcHRpb25zLmltYWdlc0xvYWRlZCApIHtcbiAgICByZXR1cm47XG4gIH1cbiAgdmFyIF90aGlzID0gdGhpcztcbiAgZnVuY3Rpb24gb25JbWFnZXNMb2FkZWRQcm9ncmVzcyggaW5zdGFuY2UsIGltYWdlICkge1xuICAgIHZhciBjZWxsID0gX3RoaXMuZ2V0UGFyZW50Q2VsbCggaW1hZ2UuaW1nICk7XG4gICAgX3RoaXMuY2VsbFNpemVDaGFuZ2UoIGNlbGwgJiYgY2VsbC5lbGVtZW50ICk7XG4gICAgaWYgKCAhX3RoaXMub3B0aW9ucy5mcmVlU2Nyb2xsICkge1xuICAgICAgX3RoaXMucG9zaXRpb25TbGlkZXJBdFNlbGVjdGVkKCk7XG4gICAgfVxuICB9XG4gIGltYWdlc0xvYWRlZCggdGhpcy5zbGlkZXIgKS5vbiggJ3Byb2dyZXNzJywgb25JbWFnZXNMb2FkZWRQcm9ncmVzcyApO1xufTtcblxucmV0dXJuIEZsaWNraXR5O1xuXG59KSk7XG4iLCJjb25zdCBidXJnZXIgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuaGFtYnVyZ2VyJyk7XG5cbmNvbnN0IHRvZ2dsZVJlc3BvbnNpdmVNZW51ID0gKCkgPT4ge1xuICBjb25zdCBJU19OQVZfT1BFTiA9IGRvY3VtZW50LmJvZHkuY2xhc3NMaXN0LmNvbnRhaW5zKCAnbmF2LWlzLW9wZW4nICk7XG5cdGlmICggSVNfTkFWX09QRU4gKSB7XG5cdFx0ZmxvYXRpbmdOYXYuY2xvc2VOYXYoKTtcblx0fSBlbHNlIHtcblx0XHRmbG9hdGluZ05hdi5vcGVuTmF2KCk7XG5cdH1cbn1cblxuY29uc3QgZmxvYXRpbmdOYXYgPSB7XG5cblx0b3Blbk5hdiA6IGZ1bmN0aW9uKCkge1xuICAgIGRvY3VtZW50LmJvZHkuY2xhc3NMaXN0LmFkZCggJ25hdi1pcy1vcGVuJyApO1xuXHR9LFxuXG5cdGNsb3NlTmF2IDogZnVuY3Rpb24oKSB7XG4gICAgZG9jdW1lbnQuYm9keS5jbGFzc0xpc3QucmVtb3ZlKCAnbmF2LWlzLW9wZW4nICk7XG5cdH1cbn1cblxuY29uc3QgaW5pdCA9ICgpID0+IHtcbiAgYnVyZ2VyLmFkZEV2ZW50TGlzdGVuZXIoICdjbGljaycsICgpID0+IHRvZ2dsZVJlc3BvbnNpdmVNZW51KCkgKTtcbn1cblxuZXhwb3J0IGRlZmF1bHQge1xuICBpbml0LFxufTsiLCJ2YXIgaXNPYmplY3QgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvaXMtb2JqZWN0Jyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGl0KSB7XG4gIGlmICghaXNPYmplY3QoaXQpICYmIGl0ICE9PSBudWxsKSB7XG4gICAgdGhyb3cgVHlwZUVycm9yKFwiQ2FuJ3Qgc2V0IFwiICsgU3RyaW5nKGl0KSArICcgYXMgYSBwcm90b3R5cGUnKTtcbiAgfSByZXR1cm4gaXQ7XG59O1xuIiwidmFyIGFuT2JqZWN0ID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2FuLW9iamVjdCcpO1xudmFyIGFQb3NzaWJsZVByb3RvdHlwZSA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9hLXBvc3NpYmxlLXByb3RvdHlwZScpO1xuXG4vLyBgT2JqZWN0LnNldFByb3RvdHlwZU9mYCBtZXRob2Rcbi8vIGh0dHBzOi8vdGMzOS5naXRodWIuaW8vZWNtYTI2Mi8jc2VjLW9iamVjdC5zZXRwcm90b3R5cGVvZlxuLy8gV29ya3Mgd2l0aCBfX3Byb3RvX18gb25seS4gT2xkIHY4IGNhbid0IHdvcmsgd2l0aCBudWxsIHByb3RvIG9iamVjdHMuXG4vKiBlc2xpbnQtZGlzYWJsZSBuby1wcm90byAqL1xubW9kdWxlLmV4cG9ydHMgPSBPYmplY3Quc2V0UHJvdG90eXBlT2YgfHwgKCdfX3Byb3RvX18nIGluIHt9ID8gZnVuY3Rpb24gKCkge1xuICB2YXIgQ09SUkVDVF9TRVRURVIgPSBmYWxzZTtcbiAgdmFyIHRlc3QgPSB7fTtcbiAgdmFyIHNldHRlcjtcbiAgdHJ5IHtcbiAgICBzZXR0ZXIgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKE9iamVjdC5wcm90b3R5cGUsICdfX3Byb3RvX18nKS5zZXQ7XG4gICAgc2V0dGVyLmNhbGwodGVzdCwgW10pO1xuICAgIENPUlJFQ1RfU0VUVEVSID0gdGVzdCBpbnN0YW5jZW9mIEFycmF5O1xuICB9IGNhdGNoIChlcnJvcikgeyAvKiBlbXB0eSAqLyB9XG4gIHJldHVybiBmdW5jdGlvbiBzZXRQcm90b3R5cGVPZihPLCBwcm90bykge1xuICAgIGFuT2JqZWN0KE8pO1xuICAgIGFQb3NzaWJsZVByb3RvdHlwZShwcm90byk7XG4gICAgaWYgKENPUlJFQ1RfU0VUVEVSKSBzZXR0ZXIuY2FsbChPLCBwcm90byk7XG4gICAgZWxzZSBPLl9fcHJvdG9fXyA9IHByb3RvO1xuICAgIHJldHVybiBPO1xuICB9O1xufSgpIDogdW5kZWZpbmVkKTtcbiIsInZhciBpc09iamVjdCA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9pcy1vYmplY3QnKTtcbnZhciBzZXRQcm90b3R5cGVPZiA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9vYmplY3Qtc2V0LXByb3RvdHlwZS1vZicpO1xuXG4vLyBtYWtlcyBzdWJjbGFzc2luZyB3b3JrIGNvcnJlY3QgZm9yIHdyYXBwZWQgYnVpbHQtaW5zXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uICgkdGhpcywgZHVtbXksIFdyYXBwZXIpIHtcbiAgdmFyIE5ld1RhcmdldCwgTmV3VGFyZ2V0UHJvdG90eXBlO1xuICBpZiAoXG4gICAgLy8gaXQgY2FuIHdvcmsgb25seSB3aXRoIG5hdGl2ZSBgc2V0UHJvdG90eXBlT2ZgXG4gICAgc2V0UHJvdG90eXBlT2YgJiZcbiAgICAvLyB3ZSBoYXZlbid0IGNvbXBsZXRlbHkgY29ycmVjdCBwcmUtRVM2IHdheSBmb3IgZ2V0dGluZyBgbmV3LnRhcmdldGAsIHNvIHVzZSB0aGlzXG4gICAgdHlwZW9mIChOZXdUYXJnZXQgPSBkdW1teS5jb25zdHJ1Y3RvcikgPT0gJ2Z1bmN0aW9uJyAmJlxuICAgIE5ld1RhcmdldCAhPT0gV3JhcHBlciAmJlxuICAgIGlzT2JqZWN0KE5ld1RhcmdldFByb3RvdHlwZSA9IE5ld1RhcmdldC5wcm90b3R5cGUpICYmXG4gICAgTmV3VGFyZ2V0UHJvdG90eXBlICE9PSBXcmFwcGVyLnByb3RvdHlwZVxuICApIHNldFByb3RvdHlwZU9mKCR0aGlzLCBOZXdUYXJnZXRQcm90b3R5cGUpO1xuICByZXR1cm4gJHRoaXM7XG59O1xuIiwidmFyIGludGVybmFsT2JqZWN0S2V5cyA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9vYmplY3Qta2V5cy1pbnRlcm5hbCcpO1xudmFyIGVudW1CdWdLZXlzID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2VudW0tYnVnLWtleXMnKTtcblxuLy8gYE9iamVjdC5rZXlzYCBtZXRob2Rcbi8vIGh0dHBzOi8vdGMzOS5naXRodWIuaW8vZWNtYTI2Mi8jc2VjLW9iamVjdC5rZXlzXG5tb2R1bGUuZXhwb3J0cyA9IE9iamVjdC5rZXlzIHx8IGZ1bmN0aW9uIGtleXMoTykge1xuICByZXR1cm4gaW50ZXJuYWxPYmplY3RLZXlzKE8sIGVudW1CdWdLZXlzKTtcbn07XG4iLCJ2YXIgREVTQ1JJUFRPUlMgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvZGVzY3JpcHRvcnMnKTtcbnZhciBkZWZpbmVQcm9wZXJ0eU1vZHVsZSA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9vYmplY3QtZGVmaW5lLXByb3BlcnR5Jyk7XG52YXIgYW5PYmplY3QgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvYW4tb2JqZWN0Jyk7XG52YXIgb2JqZWN0S2V5cyA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9vYmplY3Qta2V5cycpO1xuXG4vLyBgT2JqZWN0LmRlZmluZVByb3BlcnRpZXNgIG1ldGhvZFxuLy8gaHR0cHM6Ly90YzM5LmdpdGh1Yi5pby9lY21hMjYyLyNzZWMtb2JqZWN0LmRlZmluZXByb3BlcnRpZXNcbm1vZHVsZS5leHBvcnRzID0gREVTQ1JJUFRPUlMgPyBPYmplY3QuZGVmaW5lUHJvcGVydGllcyA6IGZ1bmN0aW9uIGRlZmluZVByb3BlcnRpZXMoTywgUHJvcGVydGllcykge1xuICBhbk9iamVjdChPKTtcbiAgdmFyIGtleXMgPSBvYmplY3RLZXlzKFByb3BlcnRpZXMpO1xuICB2YXIgbGVuZ3RoID0ga2V5cy5sZW5ndGg7XG4gIHZhciBpbmRleCA9IDA7XG4gIHZhciBrZXk7XG4gIHdoaWxlIChsZW5ndGggPiBpbmRleCkgZGVmaW5lUHJvcGVydHlNb2R1bGUuZihPLCBrZXkgPSBrZXlzW2luZGV4KytdLCBQcm9wZXJ0aWVzW2tleV0pO1xuICByZXR1cm4gTztcbn07XG4iLCJ2YXIgZ2V0QnVpbHRJbiA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9nZXQtYnVpbHQtaW4nKTtcblxubW9kdWxlLmV4cG9ydHMgPSBnZXRCdWlsdEluKCdkb2N1bWVudCcsICdkb2N1bWVudEVsZW1lbnQnKTtcbiIsInZhciBhbk9iamVjdCA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9hbi1vYmplY3QnKTtcbnZhciBkZWZpbmVQcm9wZXJ0aWVzID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL29iamVjdC1kZWZpbmUtcHJvcGVydGllcycpO1xudmFyIGVudW1CdWdLZXlzID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2VudW0tYnVnLWtleXMnKTtcbnZhciBoaWRkZW5LZXlzID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2hpZGRlbi1rZXlzJyk7XG52YXIgaHRtbCA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9odG1sJyk7XG52YXIgZG9jdW1lbnRDcmVhdGVFbGVtZW50ID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2RvY3VtZW50LWNyZWF0ZS1lbGVtZW50Jyk7XG52YXIgc2hhcmVkS2V5ID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL3NoYXJlZC1rZXknKTtcbnZhciBJRV9QUk9UTyA9IHNoYXJlZEtleSgnSUVfUFJPVE8nKTtcblxudmFyIFBST1RPVFlQRSA9ICdwcm90b3R5cGUnO1xudmFyIEVtcHR5ID0gZnVuY3Rpb24gKCkgeyAvKiBlbXB0eSAqLyB9O1xuXG4vLyBDcmVhdGUgb2JqZWN0IHdpdGggZmFrZSBgbnVsbGAgcHJvdG90eXBlOiB1c2UgaWZyYW1lIE9iamVjdCB3aXRoIGNsZWFyZWQgcHJvdG90eXBlXG52YXIgY3JlYXRlRGljdCA9IGZ1bmN0aW9uICgpIHtcbiAgLy8gVGhyYXNoLCB3YXN0ZSBhbmQgc29kb215OiBJRSBHQyBidWdcbiAgdmFyIGlmcmFtZSA9IGRvY3VtZW50Q3JlYXRlRWxlbWVudCgnaWZyYW1lJyk7XG4gIHZhciBsZW5ndGggPSBlbnVtQnVnS2V5cy5sZW5ndGg7XG4gIHZhciBsdCA9ICc8JztcbiAgdmFyIHNjcmlwdCA9ICdzY3JpcHQnO1xuICB2YXIgZ3QgPSAnPic7XG4gIHZhciBqcyA9ICdqYXZhJyArIHNjcmlwdCArICc6JztcbiAgdmFyIGlmcmFtZURvY3VtZW50O1xuICBpZnJhbWUuc3R5bGUuZGlzcGxheSA9ICdub25lJztcbiAgaHRtbC5hcHBlbmRDaGlsZChpZnJhbWUpO1xuICBpZnJhbWUuc3JjID0gU3RyaW5nKGpzKTtcbiAgaWZyYW1lRG9jdW1lbnQgPSBpZnJhbWUuY29udGVudFdpbmRvdy5kb2N1bWVudDtcbiAgaWZyYW1lRG9jdW1lbnQub3BlbigpO1xuICBpZnJhbWVEb2N1bWVudC53cml0ZShsdCArIHNjcmlwdCArIGd0ICsgJ2RvY3VtZW50LkY9T2JqZWN0JyArIGx0ICsgJy8nICsgc2NyaXB0ICsgZ3QpO1xuICBpZnJhbWVEb2N1bWVudC5jbG9zZSgpO1xuICBjcmVhdGVEaWN0ID0gaWZyYW1lRG9jdW1lbnQuRjtcbiAgd2hpbGUgKGxlbmd0aC0tKSBkZWxldGUgY3JlYXRlRGljdFtQUk9UT1RZUEVdW2VudW1CdWdLZXlzW2xlbmd0aF1dO1xuICByZXR1cm4gY3JlYXRlRGljdCgpO1xufTtcblxuLy8gYE9iamVjdC5jcmVhdGVgIG1ldGhvZFxuLy8gaHR0cHM6Ly90YzM5LmdpdGh1Yi5pby9lY21hMjYyLyNzZWMtb2JqZWN0LmNyZWF0ZVxubW9kdWxlLmV4cG9ydHMgPSBPYmplY3QuY3JlYXRlIHx8IGZ1bmN0aW9uIGNyZWF0ZShPLCBQcm9wZXJ0aWVzKSB7XG4gIHZhciByZXN1bHQ7XG4gIGlmIChPICE9PSBudWxsKSB7XG4gICAgRW1wdHlbUFJPVE9UWVBFXSA9IGFuT2JqZWN0KE8pO1xuICAgIHJlc3VsdCA9IG5ldyBFbXB0eSgpO1xuICAgIEVtcHR5W1BST1RPVFlQRV0gPSBudWxsO1xuICAgIC8vIGFkZCBcIl9fcHJvdG9fX1wiIGZvciBPYmplY3QuZ2V0UHJvdG90eXBlT2YgcG9seWZpbGxcbiAgICByZXN1bHRbSUVfUFJPVE9dID0gTztcbiAgfSBlbHNlIHJlc3VsdCA9IGNyZWF0ZURpY3QoKTtcbiAgcmV0dXJuIFByb3BlcnRpZXMgPT09IHVuZGVmaW5lZCA/IHJlc3VsdCA6IGRlZmluZVByb3BlcnRpZXMocmVzdWx0LCBQcm9wZXJ0aWVzKTtcbn07XG5cbmhpZGRlbktleXNbSUVfUFJPVE9dID0gdHJ1ZTtcbiIsIi8vIGEgc3RyaW5nIG9mIGFsbCB2YWxpZCB1bmljb2RlIHdoaXRlc3BhY2VzXG4vLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbWF4LWxlblxubW9kdWxlLmV4cG9ydHMgPSAnXFx1MDAwOVxcdTAwMEFcXHUwMDBCXFx1MDAwQ1xcdTAwMERcXHUwMDIwXFx1MDBBMFxcdTE2ODBcXHUyMDAwXFx1MjAwMVxcdTIwMDJcXHUyMDAzXFx1MjAwNFxcdTIwMDVcXHUyMDA2XFx1MjAwN1xcdTIwMDhcXHUyMDA5XFx1MjAwQVxcdTIwMkZcXHUyMDVGXFx1MzAwMFxcdTIwMjhcXHUyMDI5XFx1RkVGRic7XG4iLCJ2YXIgcmVxdWlyZU9iamVjdENvZXJjaWJsZSA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9yZXF1aXJlLW9iamVjdC1jb2VyY2libGUnKTtcbnZhciB3aGl0ZXNwYWNlcyA9IHJlcXVpcmUoJy4uL2ludGVybmFscy93aGl0ZXNwYWNlcycpO1xuXG52YXIgd2hpdGVzcGFjZSA9ICdbJyArIHdoaXRlc3BhY2VzICsgJ10nO1xudmFyIGx0cmltID0gUmVnRXhwKCdeJyArIHdoaXRlc3BhY2UgKyB3aGl0ZXNwYWNlICsgJyonKTtcbnZhciBydHJpbSA9IFJlZ0V4cCh3aGl0ZXNwYWNlICsgd2hpdGVzcGFjZSArICcqJCcpO1xuXG4vLyBgU3RyaW5nLnByb3RvdHlwZS57IHRyaW0sIHRyaW1TdGFydCwgdHJpbUVuZCwgdHJpbUxlZnQsIHRyaW1SaWdodCB9YCBtZXRob2RzIGltcGxlbWVudGF0aW9uXG52YXIgY3JlYXRlTWV0aG9kID0gZnVuY3Rpb24gKFRZUEUpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uICgkdGhpcykge1xuICAgIHZhciBzdHJpbmcgPSBTdHJpbmcocmVxdWlyZU9iamVjdENvZXJjaWJsZSgkdGhpcykpO1xuICAgIGlmIChUWVBFICYgMSkgc3RyaW5nID0gc3RyaW5nLnJlcGxhY2UobHRyaW0sICcnKTtcbiAgICBpZiAoVFlQRSAmIDIpIHN0cmluZyA9IHN0cmluZy5yZXBsYWNlKHJ0cmltLCAnJyk7XG4gICAgcmV0dXJuIHN0cmluZztcbiAgfTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICAvLyBgU3RyaW5nLnByb3RvdHlwZS57IHRyaW1MZWZ0LCB0cmltU3RhcnQgfWAgbWV0aG9kc1xuICAvLyBodHRwczovL3RjMzkuZ2l0aHViLmlvL2VjbWEyNjIvI3NlYy1zdHJpbmcucHJvdG90eXBlLnRyaW1zdGFydFxuICBzdGFydDogY3JlYXRlTWV0aG9kKDEpLFxuICAvLyBgU3RyaW5nLnByb3RvdHlwZS57IHRyaW1SaWdodCwgdHJpbUVuZCB9YCBtZXRob2RzXG4gIC8vIGh0dHBzOi8vdGMzOS5naXRodWIuaW8vZWNtYTI2Mi8jc2VjLXN0cmluZy5wcm90b3R5cGUudHJpbWVuZFxuICBlbmQ6IGNyZWF0ZU1ldGhvZCgyKSxcbiAgLy8gYFN0cmluZy5wcm90b3R5cGUudHJpbWAgbWV0aG9kXG4gIC8vIGh0dHBzOi8vdGMzOS5naXRodWIuaW8vZWNtYTI2Mi8jc2VjLXN0cmluZy5wcm90b3R5cGUudHJpbVxuICB0cmltOiBjcmVhdGVNZXRob2QoMylcbn07XG4iLCIndXNlIHN0cmljdCc7XG52YXIgREVTQ1JJUFRPUlMgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvZGVzY3JpcHRvcnMnKTtcbnZhciBnbG9iYWwgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvZ2xvYmFsJyk7XG52YXIgaXNGb3JjZWQgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvaXMtZm9yY2VkJyk7XG52YXIgcmVkZWZpbmUgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvcmVkZWZpbmUnKTtcbnZhciBoYXMgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvaGFzJyk7XG52YXIgY2xhc3NvZiA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9jbGFzc29mLXJhdycpO1xudmFyIGluaGVyaXRJZlJlcXVpcmVkID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2luaGVyaXQtaWYtcmVxdWlyZWQnKTtcbnZhciB0b1ByaW1pdGl2ZSA9IHJlcXVpcmUoJy4uL2ludGVybmFscy90by1wcmltaXRpdmUnKTtcbnZhciBmYWlscyA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9mYWlscycpO1xudmFyIGNyZWF0ZSA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9vYmplY3QtY3JlYXRlJyk7XG52YXIgZ2V0T3duUHJvcGVydHlOYW1lcyA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9vYmplY3QtZ2V0LW93bi1wcm9wZXJ0eS1uYW1lcycpLmY7XG52YXIgZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL29iamVjdC1nZXQtb3duLXByb3BlcnR5LWRlc2NyaXB0b3InKS5mO1xudmFyIGRlZmluZVByb3BlcnR5ID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL29iamVjdC1kZWZpbmUtcHJvcGVydHknKS5mO1xudmFyIHRyaW0gPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvc3RyaW5nLXRyaW0nKS50cmltO1xuXG52YXIgTlVNQkVSID0gJ051bWJlcic7XG52YXIgTmF0aXZlTnVtYmVyID0gZ2xvYmFsW05VTUJFUl07XG52YXIgTnVtYmVyUHJvdG90eXBlID0gTmF0aXZlTnVtYmVyLnByb3RvdHlwZTtcblxuLy8gT3BlcmEgfjEyIGhhcyBicm9rZW4gT2JqZWN0I3RvU3RyaW5nXG52YXIgQlJPS0VOX0NMQVNTT0YgPSBjbGFzc29mKGNyZWF0ZShOdW1iZXJQcm90b3R5cGUpKSA9PSBOVU1CRVI7XG5cbi8vIGBUb051bWJlcmAgYWJzdHJhY3Qgb3BlcmF0aW9uXG4vLyBodHRwczovL3RjMzkuZ2l0aHViLmlvL2VjbWEyNjIvI3NlYy10b251bWJlclxudmFyIHRvTnVtYmVyID0gZnVuY3Rpb24gKGFyZ3VtZW50KSB7XG4gIHZhciBpdCA9IHRvUHJpbWl0aXZlKGFyZ3VtZW50LCBmYWxzZSk7XG4gIHZhciBmaXJzdCwgdGhpcmQsIHJhZGl4LCBtYXhDb2RlLCBkaWdpdHMsIGxlbmd0aCwgaW5kZXgsIGNvZGU7XG4gIGlmICh0eXBlb2YgaXQgPT0gJ3N0cmluZycgJiYgaXQubGVuZ3RoID4gMikge1xuICAgIGl0ID0gdHJpbShpdCk7XG4gICAgZmlyc3QgPSBpdC5jaGFyQ29kZUF0KDApO1xuICAgIGlmIChmaXJzdCA9PT0gNDMgfHwgZmlyc3QgPT09IDQ1KSB7XG4gICAgICB0aGlyZCA9IGl0LmNoYXJDb2RlQXQoMik7XG4gICAgICBpZiAodGhpcmQgPT09IDg4IHx8IHRoaXJkID09PSAxMjApIHJldHVybiBOYU47IC8vIE51bWJlcignKzB4MScpIHNob3VsZCBiZSBOYU4sIG9sZCBWOCBmaXhcbiAgICB9IGVsc2UgaWYgKGZpcnN0ID09PSA0OCkge1xuICAgICAgc3dpdGNoIChpdC5jaGFyQ29kZUF0KDEpKSB7XG4gICAgICAgIGNhc2UgNjY6IGNhc2UgOTg6IHJhZGl4ID0gMjsgbWF4Q29kZSA9IDQ5OyBicmVhazsgLy8gZmFzdCBlcXVhbCBvZiAvXjBiWzAxXSskL2lcbiAgICAgICAgY2FzZSA3OTogY2FzZSAxMTE6IHJhZGl4ID0gODsgbWF4Q29kZSA9IDU1OyBicmVhazsgLy8gZmFzdCBlcXVhbCBvZiAvXjBvWzAtN10rJC9pXG4gICAgICAgIGRlZmF1bHQ6IHJldHVybiAraXQ7XG4gICAgICB9XG4gICAgICBkaWdpdHMgPSBpdC5zbGljZSgyKTtcbiAgICAgIGxlbmd0aCA9IGRpZ2l0cy5sZW5ndGg7XG4gICAgICBmb3IgKGluZGV4ID0gMDsgaW5kZXggPCBsZW5ndGg7IGluZGV4KyspIHtcbiAgICAgICAgY29kZSA9IGRpZ2l0cy5jaGFyQ29kZUF0KGluZGV4KTtcbiAgICAgICAgLy8gcGFyc2VJbnQgcGFyc2VzIGEgc3RyaW5nIHRvIGEgZmlyc3QgdW5hdmFpbGFibGUgc3ltYm9sXG4gICAgICAgIC8vIGJ1dCBUb051bWJlciBzaG91bGQgcmV0dXJuIE5hTiBpZiBhIHN0cmluZyBjb250YWlucyB1bmF2YWlsYWJsZSBzeW1ib2xzXG4gICAgICAgIGlmIChjb2RlIDwgNDggfHwgY29kZSA+IG1heENvZGUpIHJldHVybiBOYU47XG4gICAgICB9IHJldHVybiBwYXJzZUludChkaWdpdHMsIHJhZGl4KTtcbiAgICB9XG4gIH0gcmV0dXJuICtpdDtcbn07XG5cbi8vIGBOdW1iZXJgIGNvbnN0cnVjdG9yXG4vLyBodHRwczovL3RjMzkuZ2l0aHViLmlvL2VjbWEyNjIvI3NlYy1udW1iZXItY29uc3RydWN0b3JcbmlmIChpc0ZvcmNlZChOVU1CRVIsICFOYXRpdmVOdW1iZXIoJyAwbzEnKSB8fCAhTmF0aXZlTnVtYmVyKCcwYjEnKSB8fCBOYXRpdmVOdW1iZXIoJysweDEnKSkpIHtcbiAgdmFyIE51bWJlcldyYXBwZXIgPSBmdW5jdGlvbiBOdW1iZXIodmFsdWUpIHtcbiAgICB2YXIgaXQgPSBhcmd1bWVudHMubGVuZ3RoIDwgMSA/IDAgOiB2YWx1ZTtcbiAgICB2YXIgZHVtbXkgPSB0aGlzO1xuICAgIHJldHVybiBkdW1teSBpbnN0YW5jZW9mIE51bWJlcldyYXBwZXJcbiAgICAgIC8vIGNoZWNrIG9uIDEuLmNvbnN0cnVjdG9yKGZvbykgY2FzZVxuICAgICAgJiYgKEJST0tFTl9DTEFTU09GID8gZmFpbHMoZnVuY3Rpb24gKCkgeyBOdW1iZXJQcm90b3R5cGUudmFsdWVPZi5jYWxsKGR1bW15KTsgfSkgOiBjbGFzc29mKGR1bW15KSAhPSBOVU1CRVIpXG4gICAgICAgID8gaW5oZXJpdElmUmVxdWlyZWQobmV3IE5hdGl2ZU51bWJlcih0b051bWJlcihpdCkpLCBkdW1teSwgTnVtYmVyV3JhcHBlcikgOiB0b051bWJlcihpdCk7XG4gIH07XG4gIGZvciAodmFyIGtleXMgPSBERVNDUklQVE9SUyA/IGdldE93blByb3BlcnR5TmFtZXMoTmF0aXZlTnVtYmVyKSA6IChcbiAgICAvLyBFUzM6XG4gICAgJ01BWF9WQUxVRSxNSU5fVkFMVUUsTmFOLE5FR0FUSVZFX0lORklOSVRZLFBPU0lUSVZFX0lORklOSVRZLCcgK1xuICAgIC8vIEVTMjAxNSAoaW4gY2FzZSwgaWYgbW9kdWxlcyB3aXRoIEVTMjAxNSBOdW1iZXIgc3RhdGljcyByZXF1aXJlZCBiZWZvcmUpOlxuICAgICdFUFNJTE9OLGlzRmluaXRlLGlzSW50ZWdlcixpc05hTixpc1NhZmVJbnRlZ2VyLE1BWF9TQUZFX0lOVEVHRVIsJyArXG4gICAgJ01JTl9TQUZFX0lOVEVHRVIscGFyc2VGbG9hdCxwYXJzZUludCxpc0ludGVnZXInXG4gICkuc3BsaXQoJywnKSwgaiA9IDAsIGtleTsga2V5cy5sZW5ndGggPiBqOyBqKyspIHtcbiAgICBpZiAoaGFzKE5hdGl2ZU51bWJlciwga2V5ID0ga2V5c1tqXSkgJiYgIWhhcyhOdW1iZXJXcmFwcGVyLCBrZXkpKSB7XG4gICAgICBkZWZpbmVQcm9wZXJ0eShOdW1iZXJXcmFwcGVyLCBrZXksIGdldE93blByb3BlcnR5RGVzY3JpcHRvcihOYXRpdmVOdW1iZXIsIGtleSkpO1xuICAgIH1cbiAgfVxuICBOdW1iZXJXcmFwcGVyLnByb3RvdHlwZSA9IE51bWJlclByb3RvdHlwZTtcbiAgTnVtYmVyUHJvdG90eXBlLmNvbnN0cnVjdG9yID0gTnVtYmVyV3JhcHBlcjtcbiAgcmVkZWZpbmUoZ2xvYmFsLCBOVU1CRVIsIE51bWJlcldyYXBwZXIpO1xufVxuIiwiLy8gR29vZ2xlIE1hcCBzZXQtdXAgZnVjbnRpb25zXG5jb25zdCBpbml0TWFwID0gZnVuY3Rpb24oIG1hcElkLCBvcHRpb25zLCBjYWxsYmFjayApIHtcblx0aWYgKCFkb2N1bWVudC5nZXRFbGVtZW50QnlJZCggbWFwSWQgKSkgcmV0dXJuO1xuXHRjb25zdCBkZWZhdWx0cyA9IHtcblx0XHRsYXQ6IE51bWJlcigtMzcuODQxMjQpLFxuXHRcdGxuZzogTnVtYmVyKDE0NC45Mzg0MjEpLFxuXHRcdHN0eWxlIDogW3tcImZlYXR1cmVUeXBlXCI6XCJ3YXRlclwiLFwiZWxlbWVudFR5cGVcIjpcImdlb21ldHJ5XCIsXCJzdHlsZXJzXCI6W3tcImNvbG9yXCI6XCIjZTllOWU5XCJ9LHtcImxpZ2h0bmVzc1wiOjE3fV19LHtcImZlYXR1cmVUeXBlXCI6XCJsYW5kc2NhcGVcIixcImVsZW1lbnRUeXBlXCI6XCJnZW9tZXRyeVwiLFwic3R5bGVyc1wiOlt7XCJjb2xvclwiOlwiI2Y1ZjVmNVwifSx7XCJsaWdodG5lc3NcIjoyMH1dfSx7XCJmZWF0dXJlVHlwZVwiOlwicm9hZC5oaWdod2F5XCIsXCJlbGVtZW50VHlwZVwiOlwiZ2VvbWV0cnkuZmlsbFwiLFwic3R5bGVyc1wiOlt7XCJjb2xvclwiOlwiI2ZmZmZmZlwifSx7XCJsaWdodG5lc3NcIjoxN31dfSx7XCJmZWF0dXJlVHlwZVwiOlwicm9hZC5oaWdod2F5XCIsXCJlbGVtZW50VHlwZVwiOlwiZ2VvbWV0cnkuc3Ryb2tlXCIsXCJzdHlsZXJzXCI6W3tcImNvbG9yXCI6XCIjZmZmZmZmXCJ9LHtcImxpZ2h0bmVzc1wiOjI5fSx7XCJ3ZWlnaHRcIjowLjJ9XX0se1wiZmVhdHVyZVR5cGVcIjpcInJvYWQuYXJ0ZXJpYWxcIixcImVsZW1lbnRUeXBlXCI6XCJnZW9tZXRyeVwiLFwic3R5bGVyc1wiOlt7XCJjb2xvclwiOlwiI2ZmZmZmZlwifSx7XCJsaWdodG5lc3NcIjoxOH1dfSx7XCJmZWF0dXJlVHlwZVwiOlwicm9hZC5sb2NhbFwiLFwiZWxlbWVudFR5cGVcIjpcImdlb21ldHJ5XCIsXCJzdHlsZXJzXCI6W3tcImNvbG9yXCI6XCIjZmZmZmZmXCJ9LHtcImxpZ2h0bmVzc1wiOjE2fV19LHtcImZlYXR1cmVUeXBlXCI6XCJwb2lcIixcImVsZW1lbnRUeXBlXCI6XCJnZW9tZXRyeVwiLFwic3R5bGVyc1wiOlt7XCJjb2xvclwiOlwiI2Y1ZjVmNVwifSx7XCJsaWdodG5lc3NcIjoyMX1dfSx7XCJmZWF0dXJlVHlwZVwiOlwicG9pLnBhcmtcIixcImVsZW1lbnRUeXBlXCI6XCJnZW9tZXRyeVwiLFwic3R5bGVyc1wiOlt7XCJjb2xvclwiOlwiI2RlZGVkZVwifSx7XCJsaWdodG5lc3NcIjoyMX1dfSx7XCJlbGVtZW50VHlwZVwiOlwibGFiZWxzLnRleHQuc3Ryb2tlXCIsXCJzdHlsZXJzXCI6W3tcInZpc2liaWxpdHlcIjpcIm9uXCJ9LHtcImNvbG9yXCI6XCIjZmZmZmZmXCJ9LHtcImxpZ2h0bmVzc1wiOjE2fV19LHtcImVsZW1lbnRUeXBlXCI6XCJsYWJlbHMudGV4dC5maWxsXCIsXCJzdHlsZXJzXCI6W3tcInNhdHVyYXRpb25cIjozNn0se1wiY29sb3JcIjpcIiMzMzMzMzNcIn0se1wibGlnaHRuZXNzXCI6NDB9XX0se1wiZWxlbWVudFR5cGVcIjpcImxhYmVscy5pY29uXCIsXCJzdHlsZXJzXCI6W3tcInZpc2liaWxpdHlcIjpcIm9mZlwifV19LHtcImZlYXR1cmVUeXBlXCI6XCJ0cmFuc2l0XCIsXCJlbGVtZW50VHlwZVwiOlwiZ2VvbWV0cnlcIixcInN0eWxlcnNcIjpbe1wiY29sb3JcIjpcIiNmMmYyZjJcIn0se1wibGlnaHRuZXNzXCI6MTl9XX0se1wiZmVhdHVyZVR5cGVcIjpcImFkbWluaXN0cmF0aXZlXCIsXCJlbGVtZW50VHlwZVwiOlwiZ2VvbWV0cnkuZmlsbFwiLFwic3R5bGVyc1wiOlt7XCJjb2xvclwiOlwiI2ZlZmVmZVwifSx7XCJsaWdodG5lc3NcIjoyMH1dfSx7XCJmZWF0dXJlVHlwZVwiOlwiYWRtaW5pc3RyYXRpdmVcIixcImVsZW1lbnRUeXBlXCI6XCJnZW9tZXRyeS5zdHJva2VcIixcInN0eWxlcnNcIjpbe1wiY29sb3JcIjpcIiNmZWZlZmVcIn0se1wibGlnaHRuZXNzXCI6MTd9LHtcIndlaWdodFwiOjEuMn1dfV0sXG5cdFx0em9vbSA6IDE0XG5cdH07XG5cdGlmICghb3B0aW9ucykgb3B0aW9ucyA9IGRlZmF1bHRzO1xuXG5cdGxldCBsb2NhdGlvbiA9IHtcblx0XHRsYXQ6IE51bWJlcihkb2N1bWVudC5nZXRFbGVtZW50QnlJZCggbWFwSWQgKS5kYXRhc2V0LmxhdCksIFxuXHRcdGxuZzogTnVtYmVyKGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCBtYXBJZCApLmRhdGFzZXQubG5nKVxuXHR9O1xuXHRpZiAoICFsb2NhdGlvbi5sYXQgfHwgIWxvY2F0aW9uLmxuZyApIHtcblx0XHRsb2NhdGlvbi5sYXQgPSBkZWZhdWx0cy5sYXQ7XG5cdFx0bG9jYXRpb24ubG5nID0gZGVmYXVsdHMubG5nO1xuXHRcdGNvbnNvbGUud2FybiggJ0dNYXBzIGVsZW1lbnQgZGlkIG5vdCBoYXZlIHZhbGlkIFwiZGF0YS1sYXRcIiBvciBcImRhdGEtbG5nXCIgYXR0cmlidXRlcyBzZXQsIHVzaW5nIGRlZmF1bHQgdmFsdWVzLi4uJyApO1xuXHR9XG5cdHZhciBpY29uID0ge1xuXHRcdFx0dXJsOiBvcHRpb25zLmljb24uaW1nIHx8IGAke1dQLnRlbXBsYXRlVXJsfS9pbWFnZXMvbWFya2VyLnBuZ2AsXG5cdFx0XHRzaXplOiBuZXcgZ29vZ2xlLm1hcHMuU2l6ZSggMjgsIDM5ICksXG5cdFx0XHRhbmNob3I6IG5ldyBnb29nbGUubWFwcy5Qb2ludCggMTQsIDM5ICksXG5cdFx0XHRzY2FsZWRTaXplOiBuZXcgZ29vZ2xlLm1hcHMuU2l6ZSggMjgsIDM5IClcblx0fTtcblx0dmFyIHN2Z0ljb24gPSB7XG5cdFx0cGF0aDogJ00xMCwyNiBDMy4zMzMzMzMzMywxOS4wMTUyMzE3IDAsMTMuNjgxODk4MyAwLDEwIEMwLDQuNDc3MTUyNSA0LjQ3NzE1MjUsMCAxMCwwIEMxNS41MjI4NDc1LDAgMjAsNC40NzcxNTI1IDIwLDEwIEMyMCwxMy42ODE4OTgzIDE2LjY2NjY2NjcsMTkuMDE1MjMxNyAxMCwyNiBaIE0xMCwxNCBDMTIuMjA5MTM5LDE0IDE0LDEyLjIwOTEzOSAxNCwxMCBDMTQsNy43OTA4NjEgMTIuMjA5MTM5LDYgMTAsNiBDNy43OTA4NjEsNiA2LDcuNzkwODYxIDYsMTAgQzYsMTIuMjA5MTM5IDcuNzkwODYxLDE0IDEwLDE0IFonLFxuXHRcdGZpbGxDb2xvcjogJyNmYTAwMDAnLFxuXHRcdGFuY2hvcjogbmV3IGdvb2dsZS5tYXBzLlBvaW50KCAxMCwgMjYgKSxcblx0XHRmaWxsT3BhY2l0eTogMSxcblx0XHRzdHJva2VXZWlnaHQ6IDAsXG5cdFx0c2NhbGU6IDFcblx0fTtcblx0dmFyIG1hcCA9IG5ldyBnb29nbGUubWFwcy5NYXAoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoIG1hcElkICksIHtcblx0XHR6b29tOiBvcHRpb25zLnpvb20gfHwgZGVmYXVsdHMuem9vbSxcblx0XHR6b29tQ29udHJvbDogXHRcdFx0XHRmYWxzZSxcblx0XHRtYXBUeXBlQ29udHJvbDogXHRcdGZhbHNlLFxuXHRcdHNjYWxlQ29udHJvbDogXHRcdFx0ZmFsc2UsXG5cdFx0c3RyZWV0Vmlld0NvbnRyb2w6IFx0ZmFsc2UsXG5cdFx0cm90YXRlQ29udHJvbDogXHRcdFx0ZmFsc2UsXG5cdFx0ZnVsbHNjcmVlbkNvbnRyb2w6IFx0ZmFsc2UsXG5cdFx0Y2VudGVyOiBsb2NhdGlvbixcblx0XHRzdHlsZXM6IG9wdGlvbnMuc3R5bGUgfHwgZGVmYXVsdHMuc3R5bGVcblx0fSk7XG5cdFxuXHR2YXIgbWFya2VyID0gbmV3IGdvb2dsZS5tYXBzLk1hcmtlcih7XG5cdFx0cG9zaXRpb246IGxvY2F0aW9uLFxuXHRcdG1hcDogbWFwLFxuXHRcdGljb246IGljb25cblx0fSk7XG5cdGNhbGxiYWNrKCBtYXAgKTtcbn1cblxuLy8gSGFuZGxlIGxvYWRpbmcgb2YgR01hcHMgc2NyaXB0XG5jb25zdCBsb2FkU2NyaXB0ID0gZnVuY3Rpb24odXJsLCBjb21wbGV0ZUNhbGxiYWNrKSB7XG5cdHZhciBzY3JpcHQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzY3JpcHQnKSwgZG9uZSA9IGZhbHNlLFxuXHRcdFx0aGVhZCA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKFwiaGVhZFwiKVswXTtcblx0c2NyaXB0LnNyYyA9IHVybDtcblx0c2NyaXB0Lm9ubG9hZCA9IHNjcmlwdC5vbnJlYWR5c3RhdGVjaGFuZ2UgPSBmdW5jdGlvbigpe1xuXHRcdGlmICggIWRvbmUgJiYgKCF0aGlzLnJlYWR5U3RhdGUgfHxcblx0XHRcdFx0dGhpcy5yZWFkeVN0YXRlID09IFwibG9hZGVkXCIgfHwgdGhpcy5yZWFkeVN0YXRlID09IFwiY29tcGxldGVcIikgKSB7XG5cdFx0XHRkb25lID0gdHJ1ZTtcblx0XHRcdGlmIChjb21wbGV0ZUNhbGxiYWNrKSBjb21wbGV0ZUNhbGxiYWNrKCk7XG5cdFx0XHQvLyBJRSBtZW1vcnkgbGVha1xuXHRcdFx0c2NyaXB0Lm9ubG9hZCA9IHNjcmlwdC5vbnJlYWR5c3RhdGVjaGFuZ2UgPSBudWxsO1xuXHRcdFx0aGVhZC5yZW1vdmVDaGlsZCggc2NyaXB0ICk7XG5cdFx0fVxuXHR9O1xuXHRoZWFkLmFwcGVuZENoaWxkKHNjcmlwdCk7XG59XG5cbi8vIFNldCB1cCBNYXBzXG5jb25zdCBzZXR1cEdvb2dsZU1hcHNBcGkgPSBmdW5jdGlvbiggbWFwc0FycmF5LCBvcHRpb25zICkge1xuXHRjb25zdCBtYXBFbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCBtYXBzQXJyYXlbMF0gKTtcblx0aWYgKCBtYXBFbCApIHtcblx0XHRsb2FkU2NyaXB0KCBcblx0XHRcdCdodHRwczovL21hcHMuZ29vZ2xlYXBpcy5jb20vbWFwcy9hcGkvanM/a2V5PUFJemFTeUJiZkJBcExyLS12dUMyV2F0ckdadGtkQTVsLW1WNDJwRScsIFxuXHRcdFx0ZnVuY3Rpb24oKSB7IHByb2Nlc3NNYXBzKCBtYXBzQXJyYXksIG9wdGlvbnMgKSB9XG5cdFx0KTtcblx0fVxufVxuXG4vLyBQYW4gTWFwXG5jb25zdCBwYW5NYXAgPSBmdW5jdGlvbiggbWFwSWQsIG9wdGlvbnMgKSB7XG5cdGluaXRNYXAoIG1hcElkLCBvcHRpb25zLCBmdW5jdGlvbiggbWFwICkgeyBtYXAucGFuQnkoMCwgMCkgfSApXG59XG5cbi8vIFByb2Nlc3MgTWFwc1xuY29uc3QgcHJvY2Vzc01hcHMgPSBmdW5jdGlvbiggbWFwc0FycmF5LCBvcHRpb25zICkge1xuXHRpZiAoICFBcnJheS5pc0FycmF5KCBtYXBzQXJyYXkgKSApIHJldHVybiBjb25zb2xlLmVycm9yKCAnTmVlZCB0byBwYXNzIGFuIGFycmF5IGlmIEdvb2dsZSBNYXAgSURzJyApO1xuXHRtYXBzQXJyYXkuZm9yRWFjaCggbSA9PiB7XG5cdFx0cGFuTWFwKCBtLCBvcHRpb25zICk7XG5cdH0pO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHsgXG5cdHNldHVwR29vZ2xlTWFwc0FwaSBcbn0iLCIvLyBFeHRlcm5hbCBQbHVnaW5zICYgUG9seWZpbGxzXG5pbXBvcnQgb2JqZWN0Rml0SW1hZ2VzIGZyb20gJ29iamVjdC1maXQtaW1hZ2VzJztcblxuLy8gSWYgdXNpbmcgZmxpY2tpdHksIHVuY29tbWVudCB0aGUgcmVxdWlyZXNcbmltcG9ydCBGbGlja2l0eSBmcm9tICdmbGlja2l0eSc7XG5pbXBvcnQgJ2ZsaWNraXR5LWltYWdlc2xvYWRlZCc7XG5cbi8vIE15IENvbXBvbmVudHNcbmltcG9ydCBOYXYgZnJvbSAnLi4vLi4vc3JjL2pzL2NvbXBvbmVudHMvbmF2aWdhdGlvbic7XG5pbXBvcnQgTWFwcyBmcm9tICcuLi8uLi9zcmMvanMvY29tcG9uZW50cy9nTWFwcy5qcyc7XG5cblxuLyogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5cdCBFeGVjdXRpb24gY29kZVxuXHQgPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09ICovXG5cbi8vIEdvb2dsZSBNQVBcbmNvbnN0IHNuYXp6eVN0eWxlID0gW3tcImZlYXR1cmVUeXBlXCI6XCJhbGxcIixcImVsZW1lbnRUeXBlXCI6XCJhbGxcIixcInN0eWxlcnNcIjpbe1widmlzaWJpbGl0eVwiOlwib25cIn1dfSx7XCJmZWF0dXJlVHlwZVwiOlwiYWxsXCIsXCJlbGVtZW50VHlwZVwiOlwibGFiZWxzXCIsXCJzdHlsZXJzXCI6W3tcInZpc2liaWxpdHlcIjpcIm9mZlwifSx7XCJzYXR1cmF0aW9uXCI6XCItMTAwXCJ9XX0se1wiZmVhdHVyZVR5cGVcIjpcImFsbFwiLFwiZWxlbWVudFR5cGVcIjpcImxhYmVscy50ZXh0LmZpbGxcIixcInN0eWxlcnNcIjpbe1wic2F0dXJhdGlvblwiOjM2fSx7XCJjb2xvclwiOlwiIzAwMDAwMFwifSx7XCJsaWdodG5lc3NcIjo0MH0se1widmlzaWJpbGl0eVwiOlwib2ZmXCJ9XX0se1wiZmVhdHVyZVR5cGVcIjpcImFsbFwiLFwiZWxlbWVudFR5cGVcIjpcImxhYmVscy50ZXh0LnN0cm9rZVwiLFwic3R5bGVyc1wiOlt7XCJ2aXNpYmlsaXR5XCI6XCJvZmZcIn0se1wiY29sb3JcIjpcIiMwMDAwMDBcIn0se1wibGlnaHRuZXNzXCI6MTZ9XX0se1wiZmVhdHVyZVR5cGVcIjpcImFsbFwiLFwiZWxlbWVudFR5cGVcIjpcImxhYmVscy5pY29uXCIsXCJzdHlsZXJzXCI6W3tcInZpc2liaWxpdHlcIjpcIm9mZlwifV19LHtcImZlYXR1cmVUeXBlXCI6XCJhZG1pbmlzdHJhdGl2ZVwiLFwiZWxlbWVudFR5cGVcIjpcImdlb21ldHJ5LmZpbGxcIixcInN0eWxlcnNcIjpbe1wiY29sb3JcIjpcIiMwMDAwMDBcIn0se1wibGlnaHRuZXNzXCI6MjB9XX0se1wiZmVhdHVyZVR5cGVcIjpcImFkbWluaXN0cmF0aXZlXCIsXCJlbGVtZW50VHlwZVwiOlwiZ2VvbWV0cnkuc3Ryb2tlXCIsXCJzdHlsZXJzXCI6W3tcImNvbG9yXCI6XCIjMDAwMDAwXCJ9LHtcImxpZ2h0bmVzc1wiOjE3fSx7XCJ3ZWlnaHRcIjoxLjJ9XX0se1wiZmVhdHVyZVR5cGVcIjpcImxhbmRzY2FwZVwiLFwiZWxlbWVudFR5cGVcIjpcImdlb21ldHJ5XCIsXCJzdHlsZXJzXCI6W3tcImNvbG9yXCI6XCIjMDAwMDAwXCJ9LHtcImxpZ2h0bmVzc1wiOjIwfV19LHtcImZlYXR1cmVUeXBlXCI6XCJsYW5kc2NhcGVcIixcImVsZW1lbnRUeXBlXCI6XCJnZW9tZXRyeS5maWxsXCIsXCJzdHlsZXJzXCI6W3tcImNvbG9yXCI6XCIjNGQ2MDU5XCJ9XX0se1wiZmVhdHVyZVR5cGVcIjpcImxhbmRzY2FwZVwiLFwiZWxlbWVudFR5cGVcIjpcImdlb21ldHJ5LnN0cm9rZVwiLFwic3R5bGVyc1wiOlt7XCJjb2xvclwiOlwiIzRkNjA1OVwifV19LHtcImZlYXR1cmVUeXBlXCI6XCJsYW5kc2NhcGUubmF0dXJhbFwiLFwiZWxlbWVudFR5cGVcIjpcImdlb21ldHJ5LmZpbGxcIixcInN0eWxlcnNcIjpbe1wiY29sb3JcIjpcIiM0ZDYwNTlcIn1dfSx7XCJmZWF0dXJlVHlwZVwiOlwicG9pXCIsXCJlbGVtZW50VHlwZVwiOlwiZ2VvbWV0cnlcIixcInN0eWxlcnNcIjpbe1wibGlnaHRuZXNzXCI6MjF9XX0se1wiZmVhdHVyZVR5cGVcIjpcInBvaVwiLFwiZWxlbWVudFR5cGVcIjpcImdlb21ldHJ5LmZpbGxcIixcInN0eWxlcnNcIjpbe1wiY29sb3JcIjpcIiM0ZDYwNTlcIn1dfSx7XCJmZWF0dXJlVHlwZVwiOlwicG9pXCIsXCJlbGVtZW50VHlwZVwiOlwiZ2VvbWV0cnkuc3Ryb2tlXCIsXCJzdHlsZXJzXCI6W3tcImNvbG9yXCI6XCIjNGQ2MDU5XCJ9XX0se1wiZmVhdHVyZVR5cGVcIjpcInJvYWRcIixcImVsZW1lbnRUeXBlXCI6XCJnZW9tZXRyeVwiLFwic3R5bGVyc1wiOlt7XCJ2aXNpYmlsaXR5XCI6XCJvblwifSx7XCJjb2xvclwiOlwiIzdmOGQ4OVwifV19LHtcImZlYXR1cmVUeXBlXCI6XCJyb2FkXCIsXCJlbGVtZW50VHlwZVwiOlwiZ2VvbWV0cnkuZmlsbFwiLFwic3R5bGVyc1wiOlt7XCJjb2xvclwiOlwiIzdmOGQ4OVwifV19LHtcImZlYXR1cmVUeXBlXCI6XCJyb2FkLmhpZ2h3YXlcIixcImVsZW1lbnRUeXBlXCI6XCJnZW9tZXRyeS5maWxsXCIsXCJzdHlsZXJzXCI6W3tcImNvbG9yXCI6XCIjN2Y4ZDg5XCJ9LHtcImxpZ2h0bmVzc1wiOjE3fV19LHtcImZlYXR1cmVUeXBlXCI6XCJyb2FkLmhpZ2h3YXlcIixcImVsZW1lbnRUeXBlXCI6XCJnZW9tZXRyeS5zdHJva2VcIixcInN0eWxlcnNcIjpbe1wiY29sb3JcIjpcIiM3ZjhkODlcIn0se1wibGlnaHRuZXNzXCI6Mjl9LHtcIndlaWdodFwiOjAuMn1dfSx7XCJmZWF0dXJlVHlwZVwiOlwicm9hZC5hcnRlcmlhbFwiLFwiZWxlbWVudFR5cGVcIjpcImdlb21ldHJ5XCIsXCJzdHlsZXJzXCI6W3tcImNvbG9yXCI6XCIjMDAwMDAwXCJ9LHtcImxpZ2h0bmVzc1wiOjE4fV19LHtcImZlYXR1cmVUeXBlXCI6XCJyb2FkLmFydGVyaWFsXCIsXCJlbGVtZW50VHlwZVwiOlwiZ2VvbWV0cnkuZmlsbFwiLFwic3R5bGVyc1wiOlt7XCJjb2xvclwiOlwiIzdmOGQ4OVwifV19LHtcImZlYXR1cmVUeXBlXCI6XCJyb2FkLmFydGVyaWFsXCIsXCJlbGVtZW50VHlwZVwiOlwiZ2VvbWV0cnkuc3Ryb2tlXCIsXCJzdHlsZXJzXCI6W3tcImNvbG9yXCI6XCIjN2Y4ZDg5XCJ9XX0se1wiZmVhdHVyZVR5cGVcIjpcInJvYWQubG9jYWxcIixcImVsZW1lbnRUeXBlXCI6XCJnZW9tZXRyeVwiLFwic3R5bGVyc1wiOlt7XCJjb2xvclwiOlwiIzAwMDAwMFwifSx7XCJsaWdodG5lc3NcIjoxNn1dfSx7XCJmZWF0dXJlVHlwZVwiOlwicm9hZC5sb2NhbFwiLFwiZWxlbWVudFR5cGVcIjpcImdlb21ldHJ5LmZpbGxcIixcInN0eWxlcnNcIjpbe1wiY29sb3JcIjpcIiM3ZjhkODlcIn1dfSx7XCJmZWF0dXJlVHlwZVwiOlwicm9hZC5sb2NhbFwiLFwiZWxlbWVudFR5cGVcIjpcImdlb21ldHJ5LnN0cm9rZVwiLFwic3R5bGVyc1wiOlt7XCJjb2xvclwiOlwiIzdmOGQ4OVwifV19LHtcImZlYXR1cmVUeXBlXCI6XCJ0cmFuc2l0XCIsXCJlbGVtZW50VHlwZVwiOlwiZ2VvbWV0cnlcIixcInN0eWxlcnNcIjpbe1wiY29sb3JcIjpcIiMwMDAwMDBcIn0se1wibGlnaHRuZXNzXCI6MTl9XX0se1wiZmVhdHVyZVR5cGVcIjpcIndhdGVyXCIsXCJlbGVtZW50VHlwZVwiOlwiYWxsXCIsXCJzdHlsZXJzXCI6W3tcImNvbG9yXCI6XCIjMmIzNjM4XCJ9LHtcInZpc2liaWxpdHlcIjpcIm9uXCJ9XX0se1wiZmVhdHVyZVR5cGVcIjpcIndhdGVyXCIsXCJlbGVtZW50VHlwZVwiOlwiZ2VvbWV0cnlcIixcInN0eWxlcnNcIjpbe1wiY29sb3JcIjpcIiMyYjM2MzhcIn0se1wibGlnaHRuZXNzXCI6MTd9XX0se1wiZmVhdHVyZVR5cGVcIjpcIndhdGVyXCIsXCJlbGVtZW50VHlwZVwiOlwiZ2VvbWV0cnkuZmlsbFwiLFwic3R5bGVyc1wiOlt7XCJjb2xvclwiOlwiIzI0MjgyYlwifV19LHtcImZlYXR1cmVUeXBlXCI6XCJ3YXRlclwiLFwiZWxlbWVudFR5cGVcIjpcImdlb21ldHJ5LnN0cm9rZVwiLFwic3R5bGVyc1wiOlt7XCJjb2xvclwiOlwiIzI0MjgyYlwifV19LHtcImZlYXR1cmVUeXBlXCI6XCJ3YXRlclwiLFwiZWxlbWVudFR5cGVcIjpcImxhYmVsc1wiLFwic3R5bGVyc1wiOlt7XCJ2aXNpYmlsaXR5XCI6XCJvZmZcIn1dfSx7XCJmZWF0dXJlVHlwZVwiOlwid2F0ZXJcIixcImVsZW1lbnRUeXBlXCI6XCJsYWJlbHMudGV4dFwiLFwic3R5bGVyc1wiOlt7XCJ2aXNpYmlsaXR5XCI6XCJvZmZcIn1dfSx7XCJmZWF0dXJlVHlwZVwiOlwid2F0ZXJcIixcImVsZW1lbnRUeXBlXCI6XCJsYWJlbHMudGV4dC5maWxsXCIsXCJzdHlsZXJzXCI6W3tcInZpc2liaWxpdHlcIjpcIm9mZlwifV19LHtcImZlYXR1cmVUeXBlXCI6XCJ3YXRlclwiLFwiZWxlbWVudFR5cGVcIjpcImxhYmVscy50ZXh0LnN0cm9rZVwiLFwic3R5bGVyc1wiOlt7XCJ2aXNpYmlsaXR5XCI6XCJvZmZcIn1dfSx7XCJmZWF0dXJlVHlwZVwiOlwid2F0ZXJcIixcImVsZW1lbnRUeXBlXCI6XCJsYWJlbHMuaWNvblwiLFwic3R5bGVyc1wiOlt7XCJ2aXNpYmlsaXR5XCI6XCJvZmZcIn1dfV07XG5NYXBzLnNldHVwR29vZ2xlTWFwc0FwaSggWydtYXAnXSwgeyBcblx0c3R5bGU6IHNuYXp6eVN0eWxlLFxuXHR6b29tOiAxOCxcblx0aWNvbiA6IHtcblx0XHRpbWc6IGAke1dQLnRlbXBsYXRlVXJsfS9pbWFnZXMvbWFya2VyX2FsdC5wbmdgXG5cdH1cbn0pO1xuXG5vYmplY3RGaXRJbWFnZXMoKTtcblxuTmF2LmluaXQoKTtcblxuXG5jb25zdCBzdGRfc2xpZGVycyA9IFsuLi5kb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcuc3RhbmRhcmQtc2xpZGVyJyldO1xuXG5pZiAoIHN0ZF9zbGlkZXJzICkge1xuXHRzdGRfc2xpZGVycy5mb3JFYWNoKCAoIHMgKSA9PiB7XG5cdFx0Y29uc3Qgc2xpZGVyID0gbmV3IEZsaWNraXR5KCBzLCB7XG5cdFx0XHRjZWxsQWxpZ246ICdsZWZ0Jyxcblx0XHRcdHdyYXBBcm91bmQ6IHRydWUsXG5cdFx0XHRpbWFnZXNMb2FkZWQ6IHRydWUsXG5cdFx0XHR3YXRjaENTUzogdHJ1ZSxcblx0XHRcdGNvbnRhaW46IHRydWVcblx0XHR9KTtcblx0fSk7XG59XG4iXSwibmFtZXMiOlsiZ2xvYmFsIiwiY2xhc3NvZiIsIkluZGV4ZWRPYmplY3QiLCJkb2N1bWVudCIsIkRFU0NSSVBUT1JTIiwiY3JlYXRlRWxlbWVudCIsIklFOF9ET01fREVGSU5FIiwicHJvcGVydHlJc0VudW1lcmFibGVNb2R1bGUiLCJkZWZpbmVQcm9wZXJ0eU1vZHVsZSIsInN0b3JlIiwibmF0aXZlRnVuY3Rpb25Ub1N0cmluZyIsIldlYWtNYXAiLCJoYXMiLCJOQVRJVkVfV0VBS19NQVAiLCJvYmplY3RIYXMiLCJJbnRlcm5hbFN0YXRlTW9kdWxlIiwicmVxdWlyZSQkMCIsIm1pbiIsImhpZGRlbktleXMiLCJpbnRlcm5hbE9iamVjdEtleXMiLCJnZXRPd25Qcm9wZXJ0eU5hbWVzTW9kdWxlIiwiZ2V0T3duUHJvcGVydHlTeW1ib2xzTW9kdWxlIiwiZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yTW9kdWxlIiwiZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yIiwiaXNGb3JjZWQiLCJhRnVuY3Rpb24iLCJTeW1ib2wiLCJOQVRJVkVfU1lNQk9MIiwiY3JlYXRlTWV0aG9kIiwiYmluZCIsIiQiLCJmb3JFYWNoIiwiRE9NSXRlcmFibGVzIiwidGhpcyIsInJlcXVpcmUkJDEiLCJyZXF1aXJlJCQyIiwicmVxdWlyZSQkMyIsInJlcXVpcmUkJDQiLCJyZXF1aXJlJCQ1IiwicmVxdWlyZSQkNiIsImJ1cmdlciIsInF1ZXJ5U2VsZWN0b3IiLCJ0b2dnbGVSZXNwb25zaXZlTWVudSIsIklTX05BVl9PUEVOIiwiYm9keSIsImNsYXNzTGlzdCIsImNvbnRhaW5zIiwiZmxvYXRpbmdOYXYiLCJjbG9zZU5hdiIsIm9wZW5OYXYiLCJhZGQiLCJyZW1vdmUiLCJpbml0IiwiYWRkRXZlbnRMaXN0ZW5lciIsInNldFByb3RvdHlwZU9mIiwiZGVmaW5lUHJvcGVydGllcyIsImNyZWF0ZSIsImtleXMiLCJpbml0TWFwIiwibWFwSWQiLCJvcHRpb25zIiwiY2FsbGJhY2siLCJnZXRFbGVtZW50QnlJZCIsImRlZmF1bHRzIiwibGF0IiwiTnVtYmVyIiwibG5nIiwic3R5bGUiLCJ6b29tIiwibG9jYXRpb24iLCJkYXRhc2V0IiwiY29uc29sZSIsIndhcm4iLCJpY29uIiwidXJsIiwiaW1nIiwiV1AiLCJ0ZW1wbGF0ZVVybCIsInNpemUiLCJnb29nbGUiLCJtYXBzIiwiU2l6ZSIsImFuY2hvciIsIlBvaW50Iiwic2NhbGVkU2l6ZSIsInN2Z0ljb24iLCJwYXRoIiwiZmlsbENvbG9yIiwiZmlsbE9wYWNpdHkiLCJzdHJva2VXZWlnaHQiLCJzY2FsZSIsIm1hcCIsIk1hcCIsInpvb21Db250cm9sIiwibWFwVHlwZUNvbnRyb2wiLCJzY2FsZUNvbnRyb2wiLCJzdHJlZXRWaWV3Q29udHJvbCIsInJvdGF0ZUNvbnRyb2wiLCJmdWxsc2NyZWVuQ29udHJvbCIsImNlbnRlciIsInN0eWxlcyIsIm1hcmtlciIsIk1hcmtlciIsInBvc2l0aW9uIiwibG9hZFNjcmlwdCIsImNvbXBsZXRlQ2FsbGJhY2siLCJzY3JpcHQiLCJkb25lIiwiaGVhZCIsImdldEVsZW1lbnRzQnlUYWdOYW1lIiwic3JjIiwib25sb2FkIiwib25yZWFkeXN0YXRlY2hhbmdlIiwicmVhZHlTdGF0ZSIsInJlbW92ZUNoaWxkIiwiYXBwZW5kQ2hpbGQiLCJzZXR1cEdvb2dsZU1hcHNBcGkiLCJtYXBzQXJyYXkiLCJtYXBFbCIsInByb2Nlc3NNYXBzIiwicGFuTWFwIiwicGFuQnkiLCJBcnJheSIsImlzQXJyYXkiLCJlcnJvciIsIm0iLCJzbmF6enlTdHlsZSIsIk1hcHMiLCJvYmplY3RGaXRJbWFnZXMiLCJOYXYiLCJzdGRfc2xpZGVycyIsInF1ZXJ5U2VsZWN0b3JBbGwiLCJzIiwic2xpZGVyIiwiRmxpY2tpdHkiLCJjZWxsQWxp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QUcsSUFBSSxDQUFDLFFBQVEsRUFBRSxLQUFLLENBQUMsY0FBYyxFQUFFLENBQUM7R0FDbEQsS0FBSyxLQUFLLEdBQUc7S0FDWCxJQUFJLENBQUMsWUFBWSxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsQ0FBQztJQUNuQztFQUNGLENBQUM7Ozs7Ozs7O0NBUUYsS0FBSyxDQUFDLFlBQVksR0FBRyxVQUFVLEtBQUssRUFBRSxPQUFPLEdBQUc7R0FDOUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFLENBQUM7RUFDcEMsQ0FBQzs7O0NBR0YsS0FBSyxDQUFDLFdBQVcsR0FBRyxVQUFVLEtBQUssRUFBRSxPQUFPLEdBQUc7R0FDN0MsSUFBSSxDQUFDLFNBQVMsRUFBRSxhQUFhLEVBQUUsRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFLEVBQUUsQ0FBQztFQUNyRCxDQUFDOzs7OztDQUtGLEtBQUssQ0FBQyxTQUFTLEdBQUcsVUFBVSxLQUFLLEdBQUc7R0FDbEMsSUFBSSxDQUFDLFVBQVUsRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLENBQUM7RUFDakMsQ0FBQzs7Q0FFRixLQUFLLENBQUMsV0FBVyxHQUFHLFVBQVUsS0FBSyxHQUFHO0dBQ3BDLEtBQUssS0FBSyxDQUFDLFNBQVMsSUFBSSxJQUFJLENBQUMsaUJBQWlCLEdBQUc7S0FDL0MsSUFBSSxDQUFDLFVBQVUsRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLENBQUM7SUFDakM7RUFDRixDQUFDOztDQUVGLEtBQUssQ0FBQyxVQUFVLEdBQUcsVUFBVSxLQUFLLEdBQUc7R0FDbkMsSUFBSSxLQUFLLEdBQUcsSUFBSSxDQUFDLFFBQVEsRUFBRSxLQUFLLENBQUMsY0FBYyxFQUFFLENBQUM7R0FDbEQsS0FBSyxLQUFLLEdBQUc7S0FDWCxJQUFJLENBQUMsVUFBVSxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsQ0FBQztJQUNqQztFQUNGLENBQUM7Ozs7Ozs7O0NBUUYsS0FBSyxDQUFDLFVBQVUsR0FBRyxVQUFVLEtBQUssRUFBRSxPQUFP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
