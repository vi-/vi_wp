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
	  // Setting overflow on body/documentElement synchronously in Desktop Safari slows down
	  // the responsiveness for some reason. Setting within a setTimeout fixes this.
	  setTimeout(function () {
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
	  });
	};

	var restoreOverflowSetting = function restoreOverflowSetting() {
	  // Setting overflow on body/documentElement synchronously in Desktop Safari slows down
	  // the responsiveness for some reason. Setting within a setTimeout fixes this.
	  setTimeout(function () {
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
	  });
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
	  if (isIosDevice) {
	    // targetElement must be provided, and disableBodyScroll must not have been
	    // called on this targetElement before.
	    if (!targetElement) {
	      // eslint-disable-next-line no-console
	      console.error('disableBodyScroll unsuccessful - targetElement must be provided when calling disableBodyScroll on IOS devices.');
	      return;
	    }

	    if (targetElement && !locks.some(function (lock) {
	      return lock.targetElement === targetElement;
	    })) {
	      var lock = {
	        targetElement: targetElement,
	        options: options || {}
	      };

	      locks = [].concat(_toConsumableArray$1(locks), [lock]);

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
	    }
	  } else {
	    setOverflowHidden(options);
	    var _lock = {
	      targetElement: targetElement,
	      options: options || {}
	    };

	    locks = [].concat(_toConsumableArray$1(locks), [_lock]);
	  }
	};

	var enableBodyScroll = function enableBodyScroll(targetElement) {
	  if (isIosDevice) {
	    if (!targetElement) {
	      // eslint-disable-next-line no-console
	      console.error('enableBodyScroll unsuccessful - targetElement must be provided when calling enableBodyScroll on IOS devices.');
	      return;
	    }

	    targetElement.ontouchstart = null;
	    targetElement.ontouchmove = null;

	    locks = locks.filter(function (lock) {
	      return lock.targetElement !== targetElement;
	    });

	    if (documentListenerAdded && locks.length === 0) {
	      document.removeEventListener('touchmove', preventDefault, hasPassiveEvents ? { passive: false } : undefined);

	      documentListenerAdded = false;
	    }
	  } else {
	    locks = locks.filter(function (lock) {
	      return lock.targetElement !== targetElement;
	    });
	    if (!locks.length) {
	      restoreOverflowSetting();
	    }
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2NyaXB0LmpzIiwic291cmNlcyI6WyIuLi9ub2RlX21vZHVsZXMvY29yZS1qcy9pbnRlcm5hbHMvZ2xvYmFsLmpzIiwiLi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvaW50ZXJuYWxzL2ZhaWxzLmpzIiwiLi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvaW50ZXJuYWxzL2Rlc2NyaXB0b3JzLmpzIiwiLi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvaW50ZXJuYWxzL29iamVjdC1wcm9wZXJ0eS1pcy1lbnVtZXJhYmxlLmpzIiwiLi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvaW50ZXJuYWxzL2NyZWF0ZS1wcm9wZXJ0eS1kZXNjcmlwdG9yLmpzIiwiLi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvaW50ZXJuYWxzL2NsYXNzb2YtcmF3LmpzIiwiLi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvaW50ZXJuYWxzL2luZGV4ZWQtb2JqZWN0LmpzIiwiLi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvaW50ZXJuYWxzL3JlcXVpcmUtb2JqZWN0LWNvZXJjaWJsZS5qcyIsIi4uL25vZGVfbW9kdWxlcy9jb3JlLWpzL2ludGVybmFscy90by1pbmRleGVkLW9iamVjdC5qcyIsIi4uL25vZGVfbW9kdWxlcy9jb3JlLWpzL2ludGVybmFscy9pcy1vYmplY3QuanMiLCIuLi9ub2RlX21vZHVsZXMvY29yZS1qcy9pbnRlcm5hbHMvdG8tcHJpbWl0aXZlLmpzIiwiLi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvaW50ZXJuYWxzL2hhcy5qcyIsIi4uL25vZGVfbW9kdWxlcy9jb3JlLWpzL2ludGVybmFscy9kb2N1bWVudC1jcmVhdGUtZWxlbWVudC5qcyIsIi4uL25vZGVfbW9kdWxlcy9jb3JlLWpzL2ludGVybmFscy9pZTgtZG9tLWRlZmluZS5qcyIsIi4uL25vZGVfbW9kdWxlcy9jb3JlLWpzL2ludGVybmFscy9vYmplY3QtZ2V0LW93bi1wcm9wZXJ0eS1kZXNjcmlwdG9yLmpzIiwiLi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvaW50ZXJuYWxzL2FuLW9iamVjdC5qcyIsIi4uL25vZGVfbW9kdWxlcy9jb3JlLWpzL2ludGVybmFscy9vYmplY3QtZGVmaW5lLXByb3BlcnR5LmpzIiwiLi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvaW50ZXJuYWxzL2NyZWF0ZS1ub24tZW51bWVyYWJsZS1wcm9wZXJ0eS5qcyIsIi4uL25vZGVfbW9kdWxlcy9jb3JlLWpzL2ludGVybmFscy9zZXQtZ2xvYmFsLmpzIiwiLi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvaW50ZXJuYWxzL3NoYXJlZC1zdG9yZS5qcyIsIi4uL25vZGVfbW9kdWxlcy9jb3JlLWpzL2ludGVybmFscy9zaGFyZWQuanMiLCIuLi9ub2RlX21vZHVsZXMvY29yZS1qcy9pbnRlcm5hbHMvZnVuY3Rpb24tdG8tc3RyaW5nLmpzIiwiLi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvaW50ZXJuYWxzL25hdGl2ZS13ZWFrLW1hcC5qcyIsIi4uL25vZGVfbW9kdWxlcy9jb3JlLWpzL2ludGVybmFscy91aWQuanMiLCIuLi9ub2RlX21vZHVsZXMvY29yZS1qcy9pbnRlcm5hbHMvc2hhcmVkLWtleS5qcyIsIi4uL25vZGVfbW9kdWxlcy9jb3JlLWpzL2ludGVybmFscy9oaWRkZW4ta2V5cy5qcyIsIi4uL25vZGVfbW9kdWxlcy9jb3JlLWpzL2ludGVybmFscy9pbnRlcm5hbC1zdGF0ZS5qcyIsIi4uL25vZGVfbW9kdWxlcy9jb3JlLWpzL2ludGVybmFscy9yZWRlZmluZS5qcyIsIi4uL25vZGVfbW9kdWxlcy9jb3JlLWpzL2ludGVybmFscy9wYXRoLmpzIiwiLi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvaW50ZXJuYWxzL2dldC1idWlsdC1pbi5qcyIsIi4uL25vZGVfbW9kdWxlcy9jb3JlLWpzL2ludGVybmFscy90by1pbnRlZ2VyLmpzIiwiLi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvaW50ZXJuYWxzL3RvLWxlbmd0aC5qcyIsIi4uL25vZGVfbW9kdWxlcy9jb3JlLWpzL2ludGVybmFscy90by1hYnNvbHV0ZS1pbmRleC5qcyIsIi4uL25vZGVfbW9kdWxlcy9jb3JlLWpzL2ludGVybmFscy9hcnJheS1pbmNsdWRlcy5qcyIsIi4uL25vZGVfbW9kdWxlcy9jb3JlLWpzL2ludGVybmFscy9vYmplY3Qta2V5cy1pbnRlcm5hbC5qcyIsIi4uL25vZGVfbW9kdWxlcy9jb3JlLWpzL2ludGVybmFscy9lbnVtLWJ1Zy1rZXlzLmpzIiwiLi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvaW50ZXJuYWxzL29iamVjdC1nZXQtb3duLXByb3BlcnR5LW5hbWVzLmpzIiwiLi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvaW50ZXJuYWxzL29iamVjdC1nZXQtb3duLXByb3BlcnR5LXN5bWJvbHMuanMiLCIuLi9ub2RlX21vZHVsZXMvY29yZS1qcy9pbnRlcm5hbHMvb3duLWtleXMuanMiLCIuLi9ub2RlX21vZHVsZXMvY29yZS1qcy9pbnRlcm5hbHMvY29weS1jb25zdHJ1Y3Rvci1wcm9wZXJ0aWVzLmpzIiwiLi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvaW50ZXJuYWxzL2lzLWZvcmNlZC5qcyIsIi4uL25vZGVfbW9kdWxlcy9jb3JlLWpzL2ludGVybmFscy9leHBvcnQuanMiLCIuLi9ub2RlX21vZHVsZXMvY29yZS1qcy9pbnRlcm5hbHMvYS1mdW5jdGlvbi5qcyIsIi4uL25vZGVfbW9kdWxlcy9jb3JlLWpzL2ludGVybmFscy9iaW5kLWNvbnRleHQuanMiLCIuLi9ub2RlX21vZHVsZXMvY29yZS1qcy9pbnRlcm5hbHMvdG8tb2JqZWN0LmpzIiwiLi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvaW50ZXJuYWxzL2lzLWFycmF5LmpzIiwiLi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvaW50ZXJuYWxzL25hdGl2ZS1zeW1ib2wuanMiLCIuLi9ub2RlX21vZHVsZXMvY29yZS1qcy9pbnRlcm5hbHMvd2VsbC1rbm93bi1zeW1ib2wuanMiLCIuLi9ub2RlX21vZHVsZXMvY29yZS1qcy9pbnRlcm5hbHMvYXJyYXktc3BlY2llcy1jcmVhdGUuanMiLCIuLi9ub2RlX21vZHVsZXMvY29yZS1qcy9pbnRlcm5hbHMvYXJyYXktaXRlcmF0aW9uLmpzIiwiLi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvaW50ZXJuYWxzL3Nsb3BweS1hcnJheS1tZXRob2QuanMiLCIuLi9ub2RlX21vZHVsZXMvY29yZS1qcy9pbnRlcm5hbHMvYXJyYXktZm9yLWVhY2guanMiLCIuLi9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL2VzLmFycmF5LmZvci1lYWNoLmpzIiwiLi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvaW50ZXJuYWxzL2RvbS1pdGVyYWJsZXMuanMiLCIuLi9ub2RlX21vZHVsZXMvY29yZS1qcy9tb2R1bGVzL3dlYi5kb20tY29sbGVjdGlvbnMuZm9yLWVhY2guanMiLCIuLi9ub2RlX21vZHVsZXMvb2JqZWN0LWZpdC1pbWFnZXMvZGlzdC9vZmkuY29tbW9uLWpzLmpzIiwiLi4vbm9kZV9tb2R1bGVzL2V2LWVtaXR0ZXIvZXYtZW1pdHRlci5qcyIsIi4uL25vZGVfbW9kdWxlcy9nZXQtc2l6ZS9nZXQtc2l6ZS5qcyIsIi4uL25vZGVfbW9kdWxlcy9kZXNhbmRyby1tYXRjaGVzLXNlbGVjdG9yL21hdGNoZXMtc2VsZWN0b3IuanMiLCIuLi9ub2RlX21vZHVsZXMvZml6enktdWktdXRpbHMvdXRpbHMuanMiLCIuLi9ub2RlX21vZHVsZXMvZmxpY2tpdHkvanMvY2VsbC5qcyIsIi4uL25vZGVfbW9kdWxlcy9mbGlja2l0eS9qcy9zbGlkZS5qcyIsIi4uL25vZGVfbW9kdWxlcy9mbGlja2l0eS9qcy9hbmltYXRlLmpzIiwiLi4vbm9kZV9tb2R1bGVzL2ZsaWNraXR5L2pzL2ZsaWNraXR5LmpzIiwiLi4vbm9kZV9tb2R1bGVzL3VuaXBvaW50ZXIvdW5pcG9pbnRlci5qcyIsIi4uL25vZGVfbW9kdWxlcy91bmlkcmFnZ2VyL3VuaWRyYWdnZXIuanMiLCIuLi9ub2RlX21vZHVsZXMvZmxpY2tpdHkvanMvZHJhZy5qcyIsIi4uL25vZGVfbW9kdWxlcy9mbGlja2l0eS9qcy9wcmV2LW5leHQtYnV0dG9uLmpzIiwiLi4vbm9kZV9tb2R1bGVzL2ZsaWNraXR5L2pzL3BhZ2UtZG90cy5qcyIsIi4uL25vZGVfbW9kdWxlcy9mbGlja2l0eS9qcy9wbGF5ZXIuanMiLCIuLi9ub2RlX21vZHVsZXMvZmxpY2tpdHkvanMvYWRkLXJlbW92ZS1jZWxsLmpzIiwiLi4vbm9kZV9tb2R1bGVzL2ZsaWNraXR5L2pzL2xhenlsb2FkLmpzIiwiLi4vbm9kZV9tb2R1bGVzL2ZsaWNraXR5L2pzL2luZGV4LmpzIiwiLi4vbm9kZV9tb2R1bGVzL2ltYWdlc2xvYWRlZC9pbWFnZXNsb2FkZWQuanMiLCIuLi9ub2RlX21vZHVsZXMvZmxpY2tpdHktaW1hZ2VzbG9hZGVkL2ZsaWNraXR5LWltYWdlc2xvYWRlZC5qcyIsIi4uL25vZGVfbW9kdWxlcy9ib2R5LXNjcm9sbC1sb2NrL2xpYi9ib2R5U2Nyb2xsTG9jay5lc20uanMiLCIuLi9zcmMvanMvY29tcG9uZW50cy9uYXZpZ2F0aW9uLmpzIiwiLi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvaW50ZXJuYWxzL2EtcG9zc2libGUtcHJvdG90eXBlLmpzIiwiLi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvaW50ZXJuYWxzL29iamVjdC1zZXQtcHJvdG90eXBlLW9mLmpzIiwiLi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvaW50ZXJuYWxzL2luaGVyaXQtaWYtcmVxdWlyZWQuanMiLCIuLi9ub2RlX21vZHVsZXMvY29yZS1qcy9pbnRlcm5hbHMvb2JqZWN0LWtleXMuanMiLCIuLi9ub2RlX21vZHVsZXMvY29yZS1qcy9pbnRlcm5hbHMvb2JqZWN0LWRlZmluZS1wcm9wZXJ0aWVzLmpzIiwiLi4vbm9kZV9tb2R1bGVzL2NvcmUtanMvaW50ZXJuYWxzL2h0bWwuanMiLCIuLi9ub2RlX21vZHVsZXMvY29yZS1qcy9pbnRlcm5hbHMvb2JqZWN0LWNyZWF0ZS5qcyIsIi4uL25vZGVfbW9kdWxlcy9jb3JlLWpzL2ludGVybmFscy93aGl0ZXNwYWNlcy5qcyIsIi4uL25vZGVfbW9kdWxlcy9jb3JlLWpzL2ludGVybmFscy9zdHJpbmctdHJpbS5qcyIsIi4uL25vZGVfbW9kdWxlcy9jb3JlLWpzL21vZHVsZXMvZXMubnVtYmVyLmNvbnN0cnVjdG9yLmpzIiwiLi4vc3JjL2pzL2NvbXBvbmVudHMvZ01hcHMuanMiLCIuLi9zcmMvanMvbXlzY3JpcHQuanMiXSwic291cmNlc0NvbnRlbnQiOlsidmFyIGNoZWNrID0gZnVuY3Rpb24gKGl0KSB7XG4gIHJldHVybiBpdCAmJiBpdC5NYXRoID09IE1hdGggJiYgaXQ7XG59O1xuXG4vLyBodHRwczovL2dpdGh1Yi5jb20vemxvaXJvY2svY29yZS1qcy9pc3N1ZXMvODYjaXNzdWVjb21tZW50LTExNTc1OTAyOFxubW9kdWxlLmV4cG9ydHMgPVxuICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tdW5kZWZcbiAgY2hlY2sodHlwZW9mIGdsb2JhbFRoaXMgPT0gJ29iamVjdCcgJiYgZ2xvYmFsVGhpcykgfHxcbiAgY2hlY2sodHlwZW9mIHdpbmRvdyA9PSAnb2JqZWN0JyAmJiB3aW5kb3cpIHx8XG4gIGNoZWNrKHR5cGVvZiBzZWxmID09ICdvYmplY3QnICYmIHNlbGYpIHx8XG4gIGNoZWNrKHR5cGVvZiBnbG9iYWwgPT0gJ29iamVjdCcgJiYgZ2xvYmFsKSB8fFxuICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tbmV3LWZ1bmNcbiAgRnVuY3Rpb24oJ3JldHVybiB0aGlzJykoKTtcbiIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGV4ZWMpIHtcbiAgdHJ5IHtcbiAgICByZXR1cm4gISFleGVjKCk7XG4gIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cbn07XG4iLCJ2YXIgZmFpbHMgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvZmFpbHMnKTtcblxuLy8gVGhhbmsncyBJRTggZm9yIGhpcyBmdW5ueSBkZWZpbmVQcm9wZXJ0eVxubW9kdWxlLmV4cG9ydHMgPSAhZmFpbHMoZnVuY3Rpb24gKCkge1xuICByZXR1cm4gT2JqZWN0LmRlZmluZVByb3BlcnR5KHt9LCAnYScsIHsgZ2V0OiBmdW5jdGlvbiAoKSB7IHJldHVybiA3OyB9IH0pLmEgIT0gNztcbn0pO1xuIiwiJ3VzZSBzdHJpY3QnO1xudmFyIG5hdGl2ZVByb3BlcnR5SXNFbnVtZXJhYmxlID0ge30ucHJvcGVydHlJc0VudW1lcmFibGU7XG52YXIgZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcjtcblxuLy8gTmFzaG9ybiB+IEpESzggYnVnXG52YXIgTkFTSE9STl9CVUcgPSBnZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IgJiYgIW5hdGl2ZVByb3BlcnR5SXNFbnVtZXJhYmxlLmNhbGwoeyAxOiAyIH0sIDEpO1xuXG4vLyBgT2JqZWN0LnByb3RvdHlwZS5wcm9wZXJ0eUlzRW51bWVyYWJsZWAgbWV0aG9kIGltcGxlbWVudGF0aW9uXG4vLyBodHRwczovL3RjMzkuZ2l0aHViLmlvL2VjbWEyNjIvI3NlYy1vYmplY3QucHJvdG90eXBlLnByb3BlcnR5aXNlbnVtZXJhYmxlXG5leHBvcnRzLmYgPSBOQVNIT1JOX0JVRyA/IGZ1bmN0aW9uIHByb3BlcnR5SXNFbnVtZXJhYmxlKFYpIHtcbiAgdmFyIGRlc2NyaXB0b3IgPSBnZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IodGhpcywgVik7XG4gIHJldHVybiAhIWRlc2NyaXB0b3IgJiYgZGVzY3JpcHRvci5lbnVtZXJhYmxlO1xufSA6IG5hdGl2ZVByb3BlcnR5SXNFbnVtZXJhYmxlO1xuIiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoYml0bWFwLCB2YWx1ZSkge1xuICByZXR1cm4ge1xuICAgIGVudW1lcmFibGU6ICEoYml0bWFwICYgMSksXG4gICAgY29uZmlndXJhYmxlOiAhKGJpdG1hcCAmIDIpLFxuICAgIHdyaXRhYmxlOiAhKGJpdG1hcCAmIDQpLFxuICAgIHZhbHVlOiB2YWx1ZVxuICB9O1xufTtcbiIsInZhciB0b1N0cmluZyA9IHt9LnRvU3RyaW5nO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChpdCkge1xuICByZXR1cm4gdG9TdHJpbmcuY2FsbChpdCkuc2xpY2UoOCwgLTEpO1xufTtcbiIsInZhciBmYWlscyA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9mYWlscycpO1xudmFyIGNsYXNzb2YgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvY2xhc3NvZi1yYXcnKTtcblxudmFyIHNwbGl0ID0gJycuc3BsaXQ7XG5cbi8vIGZhbGxiYWNrIGZvciBub24tYXJyYXktbGlrZSBFUzMgYW5kIG5vbi1lbnVtZXJhYmxlIG9sZCBWOCBzdHJpbmdzXG5tb2R1bGUuZXhwb3J0cyA9IGZhaWxzKGZ1bmN0aW9uICgpIHtcbiAgLy8gdGhyb3dzIGFuIGVycm9yIGluIHJoaW5vLCBzZWUgaHR0cHM6Ly9naXRodWIuY29tL21vemlsbGEvcmhpbm8vaXNzdWVzLzM0NlxuICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tcHJvdG90eXBlLWJ1aWx0aW5zXG4gIHJldHVybiAhT2JqZWN0KCd6JykucHJvcGVydHlJc0VudW1lcmFibGUoMCk7XG59KSA/IGZ1bmN0aW9uIChpdCkge1xuICByZXR1cm4gY2xhc3NvZihpdCkgPT0gJ1N0cmluZycgPyBzcGxpdC5jYWxsKGl0LCAnJykgOiBPYmplY3QoaXQpO1xufSA6IE9iamVjdDtcbiIsIi8vIGBSZXF1aXJlT2JqZWN0Q29lcmNpYmxlYCBhYnN0cmFjdCBvcGVyYXRpb25cbi8vIGh0dHBzOi8vdGMzOS5naXRodWIuaW8vZWNtYTI2Mi8jc2VjLXJlcXVpcmVvYmplY3Rjb2VyY2libGVcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGl0KSB7XG4gIGlmIChpdCA9PSB1bmRlZmluZWQpIHRocm93IFR5cGVFcnJvcihcIkNhbid0IGNhbGwgbWV0aG9kIG9uIFwiICsgaXQpO1xuICByZXR1cm4gaXQ7XG59O1xuIiwiLy8gdG9PYmplY3Qgd2l0aCBmYWxsYmFjayBmb3Igbm9uLWFycmF5LWxpa2UgRVMzIHN0cmluZ3NcbnZhciBJbmRleGVkT2JqZWN0ID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2luZGV4ZWQtb2JqZWN0Jyk7XG52YXIgcmVxdWlyZU9iamVjdENvZXJjaWJsZSA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9yZXF1aXJlLW9iamVjdC1jb2VyY2libGUnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoaXQpIHtcbiAgcmV0dXJuIEluZGV4ZWRPYmplY3QocmVxdWlyZU9iamVjdENvZXJjaWJsZShpdCkpO1xufTtcbiIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGl0KSB7XG4gIHJldHVybiB0eXBlb2YgaXQgPT09ICdvYmplY3QnID8gaXQgIT09IG51bGwgOiB0eXBlb2YgaXQgPT09ICdmdW5jdGlvbic7XG59O1xuIiwidmFyIGlzT2JqZWN0ID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2lzLW9iamVjdCcpO1xuXG4vLyBgVG9QcmltaXRpdmVgIGFic3RyYWN0IG9wZXJhdGlvblxuLy8gaHR0cHM6Ly90YzM5LmdpdGh1Yi5pby9lY21hMjYyLyNzZWMtdG9wcmltaXRpdmVcbi8vIGluc3RlYWQgb2YgdGhlIEVTNiBzcGVjIHZlcnNpb24sIHdlIGRpZG4ndCBpbXBsZW1lbnQgQEB0b1ByaW1pdGl2ZSBjYXNlXG4vLyBhbmQgdGhlIHNlY29uZCBhcmd1bWVudCAtIGZsYWcgLSBwcmVmZXJyZWQgdHlwZSBpcyBhIHN0cmluZ1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoaW5wdXQsIFBSRUZFUlJFRF9TVFJJTkcpIHtcbiAgaWYgKCFpc09iamVjdChpbnB1dCkpIHJldHVybiBpbnB1dDtcbiAgdmFyIGZuLCB2YWw7XG4gIGlmIChQUkVGRVJSRURfU1RSSU5HICYmIHR5cGVvZiAoZm4gPSBpbnB1dC50b1N0cmluZykgPT0gJ2Z1bmN0aW9uJyAmJiAhaXNPYmplY3QodmFsID0gZm4uY2FsbChpbnB1dCkpKSByZXR1cm4gdmFsO1xuICBpZiAodHlwZW9mIChmbiA9IGlucHV0LnZhbHVlT2YpID09ICdmdW5jdGlvbicgJiYgIWlzT2JqZWN0KHZhbCA9IGZuLmNhbGwoaW5wdXQpKSkgcmV0dXJuIHZhbDtcbiAgaWYgKCFQUkVGRVJSRURfU1RSSU5HICYmIHR5cGVvZiAoZm4gPSBpbnB1dC50b1N0cmluZykgPT0gJ2Z1bmN0aW9uJyAmJiAhaXNPYmplY3QodmFsID0gZm4uY2FsbChpbnB1dCkpKSByZXR1cm4gdmFsO1xuICB0aHJvdyBUeXBlRXJyb3IoXCJDYW4ndCBjb252ZXJ0IG9iamVjdCB0byBwcmltaXRpdmUgdmFsdWVcIik7XG59O1xuIiwidmFyIGhhc093blByb3BlcnR5ID0ge30uaGFzT3duUHJvcGVydHk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGl0LCBrZXkpIHtcbiAgcmV0dXJuIGhhc093blByb3BlcnR5LmNhbGwoaXQsIGtleSk7XG59O1xuIiwidmFyIGdsb2JhbCA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9nbG9iYWwnKTtcbnZhciBpc09iamVjdCA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9pcy1vYmplY3QnKTtcblxudmFyIGRvY3VtZW50ID0gZ2xvYmFsLmRvY3VtZW50O1xuLy8gdHlwZW9mIGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQgaXMgJ29iamVjdCcgaW4gb2xkIElFXG52YXIgRVhJU1RTID0gaXNPYmplY3QoZG9jdW1lbnQpICYmIGlzT2JqZWN0KGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChpdCkge1xuICByZXR1cm4gRVhJU1RTID8gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChpdCkgOiB7fTtcbn07XG4iLCJ2YXIgREVTQ1JJUFRPUlMgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvZGVzY3JpcHRvcnMnKTtcbnZhciBmYWlscyA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9mYWlscycpO1xudmFyIGNyZWF0ZUVsZW1lbnQgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvZG9jdW1lbnQtY3JlYXRlLWVsZW1lbnQnKTtcblxuLy8gVGhhbmsncyBJRTggZm9yIGhpcyBmdW5ueSBkZWZpbmVQcm9wZXJ0eVxubW9kdWxlLmV4cG9ydHMgPSAhREVTQ1JJUFRPUlMgJiYgIWZhaWxzKGZ1bmN0aW9uICgpIHtcbiAgcmV0dXJuIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShjcmVhdGVFbGVtZW50KCdkaXYnKSwgJ2EnLCB7XG4gICAgZ2V0OiBmdW5jdGlvbiAoKSB7IHJldHVybiA3OyB9XG4gIH0pLmEgIT0gNztcbn0pO1xuIiwidmFyIERFU0NSSVBUT1JTID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2Rlc2NyaXB0b3JzJyk7XG52YXIgcHJvcGVydHlJc0VudW1lcmFibGVNb2R1bGUgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvb2JqZWN0LXByb3BlcnR5LWlzLWVudW1lcmFibGUnKTtcbnZhciBjcmVhdGVQcm9wZXJ0eURlc2NyaXB0b3IgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvY3JlYXRlLXByb3BlcnR5LWRlc2NyaXB0b3InKTtcbnZhciB0b0luZGV4ZWRPYmplY3QgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvdG8taW5kZXhlZC1vYmplY3QnKTtcbnZhciB0b1ByaW1pdGl2ZSA9IHJlcXVpcmUoJy4uL2ludGVybmFscy90by1wcmltaXRpdmUnKTtcbnZhciBoYXMgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvaGFzJyk7XG52YXIgSUU4X0RPTV9ERUZJTkUgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvaWU4LWRvbS1kZWZpbmUnKTtcblxudmFyIG5hdGl2ZUdldE93blByb3BlcnR5RGVzY3JpcHRvciA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3I7XG5cbi8vIGBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yYCBtZXRob2Rcbi8vIGh0dHBzOi8vdGMzOS5naXRodWIuaW8vZWNtYTI2Mi8jc2VjLW9iamVjdC5nZXRvd25wcm9wZXJ0eWRlc2NyaXB0b3JcbmV4cG9ydHMuZiA9IERFU0NSSVBUT1JTID8gbmF0aXZlR2V0T3duUHJvcGVydHlEZXNjcmlwdG9yIDogZnVuY3Rpb24gZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKE8sIFApIHtcbiAgTyA9IHRvSW5kZXhlZE9iamVjdChPKTtcbiAgUCA9IHRvUHJpbWl0aXZlKFAsIHRydWUpO1xuICBpZiAoSUU4X0RPTV9ERUZJTkUpIHRyeSB7XG4gICAgcmV0dXJuIG5hdGl2ZUdldE93blByb3BlcnR5RGVzY3JpcHRvcihPLCBQKTtcbiAgfSBjYXRjaCAoZXJyb3IpIHsgLyogZW1wdHkgKi8gfVxuICBpZiAoaGFzKE8sIFApKSByZXR1cm4gY3JlYXRlUHJvcGVydHlEZXNjcmlwdG9yKCFwcm9wZXJ0eUlzRW51bWVyYWJsZU1vZHVsZS5mLmNhbGwoTywgUCksIE9bUF0pO1xufTtcbiIsInZhciBpc09iamVjdCA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9pcy1vYmplY3QnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoaXQpIHtcbiAgaWYgKCFpc09iamVjdChpdCkpIHtcbiAgICB0aHJvdyBUeXBlRXJyb3IoU3RyaW5nKGl0KSArICcgaXMgbm90IGFuIG9iamVjdCcpO1xuICB9IHJldHVybiBpdDtcbn07XG4iLCJ2YXIgREVTQ1JJUFRPUlMgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvZGVzY3JpcHRvcnMnKTtcbnZhciBJRThfRE9NX0RFRklORSA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9pZTgtZG9tLWRlZmluZScpO1xudmFyIGFuT2JqZWN0ID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2FuLW9iamVjdCcpO1xudmFyIHRvUHJpbWl0aXZlID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL3RvLXByaW1pdGl2ZScpO1xuXG52YXIgbmF0aXZlRGVmaW5lUHJvcGVydHkgPSBPYmplY3QuZGVmaW5lUHJvcGVydHk7XG5cbi8vIGBPYmplY3QuZGVmaW5lUHJvcGVydHlgIG1ldGhvZFxuLy8gaHR0cHM6Ly90YzM5LmdpdGh1Yi5pby9lY21hMjYyLyNzZWMtb2JqZWN0LmRlZmluZXByb3BlcnR5XG5leHBvcnRzLmYgPSBERVNDUklQVE9SUyA/IG5hdGl2ZURlZmluZVByb3BlcnR5IDogZnVuY3Rpb24gZGVmaW5lUHJvcGVydHkoTywgUCwgQXR0cmlidXRlcykge1xuICBhbk9iamVjdChPKTtcbiAgUCA9IHRvUHJpbWl0aXZlKFAsIHRydWUpO1xuICBhbk9iamVjdChBdHRyaWJ1dGVzKTtcbiAgaWYgKElFOF9ET01fREVGSU5FKSB0cnkge1xuICAgIHJldHVybiBuYXRpdmVEZWZpbmVQcm9wZXJ0eShPLCBQLCBBdHRyaWJ1dGVzKTtcbiAgfSBjYXRjaCAoZXJyb3IpIHsgLyogZW1wdHkgKi8gfVxuICBpZiAoJ2dldCcgaW4gQXR0cmlidXRlcyB8fCAnc2V0JyBpbiBBdHRyaWJ1dGVzKSB0aHJvdyBUeXBlRXJyb3IoJ0FjY2Vzc29ycyBub3Qgc3VwcG9ydGVkJyk7XG4gIGlmICgndmFsdWUnIGluIEF0dHJpYnV0ZXMpIE9bUF0gPSBBdHRyaWJ1dGVzLnZhbHVlO1xuICByZXR1cm4gTztcbn07XG4iLCJ2YXIgREVTQ1JJUFRPUlMgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvZGVzY3JpcHRvcnMnKTtcbnZhciBkZWZpbmVQcm9wZXJ0eU1vZHVsZSA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9vYmplY3QtZGVmaW5lLXByb3BlcnR5Jyk7XG52YXIgY3JlYXRlUHJvcGVydHlEZXNjcmlwdG9yID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2NyZWF0ZS1wcm9wZXJ0eS1kZXNjcmlwdG9yJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gREVTQ1JJUFRPUlMgPyBmdW5jdGlvbiAob2JqZWN0LCBrZXksIHZhbHVlKSB7XG4gIHJldHVybiBkZWZpbmVQcm9wZXJ0eU1vZHVsZS5mKG9iamVjdCwga2V5LCBjcmVhdGVQcm9wZXJ0eURlc2NyaXB0b3IoMSwgdmFsdWUpKTtcbn0gOiBmdW5jdGlvbiAob2JqZWN0LCBrZXksIHZhbHVlKSB7XG4gIG9iamVjdFtrZXldID0gdmFsdWU7XG4gIHJldHVybiBvYmplY3Q7XG59O1xuIiwidmFyIGdsb2JhbCA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9nbG9iYWwnKTtcbnZhciBjcmVhdGVOb25FbnVtZXJhYmxlUHJvcGVydHkgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvY3JlYXRlLW5vbi1lbnVtZXJhYmxlLXByb3BlcnR5Jyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGtleSwgdmFsdWUpIHtcbiAgdHJ5IHtcbiAgICBjcmVhdGVOb25FbnVtZXJhYmxlUHJvcGVydHkoZ2xvYmFsLCBrZXksIHZhbHVlKTtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBnbG9iYWxba2V5XSA9IHZhbHVlO1xuICB9IHJldHVybiB2YWx1ZTtcbn07XG4iLCJ2YXIgZ2xvYmFsID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2dsb2JhbCcpO1xudmFyIHNldEdsb2JhbCA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9zZXQtZ2xvYmFsJyk7XG5cbnZhciBTSEFSRUQgPSAnX19jb3JlLWpzX3NoYXJlZF9fJztcbnZhciBzdG9yZSA9IGdsb2JhbFtTSEFSRURdIHx8IHNldEdsb2JhbChTSEFSRUQsIHt9KTtcblxubW9kdWxlLmV4cG9ydHMgPSBzdG9yZTtcbiIsInZhciBJU19QVVJFID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2lzLXB1cmUnKTtcbnZhciBzdG9yZSA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9zaGFyZWQtc3RvcmUnKTtcblxuKG1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGtleSwgdmFsdWUpIHtcbiAgcmV0dXJuIHN0b3JlW2tleV0gfHwgKHN0b3JlW2tleV0gPSB2YWx1ZSAhPT0gdW5kZWZpbmVkID8gdmFsdWUgOiB7fSk7XG59KSgndmVyc2lvbnMnLCBbXSkucHVzaCh7XG4gIHZlcnNpb246ICczLjMuNScsXG4gIG1vZGU6IElTX1BVUkUgPyAncHVyZScgOiAnZ2xvYmFsJyxcbiAgY29weXJpZ2h0OiAnwqkgMjAxOSBEZW5pcyBQdXNoa2FyZXYgKHpsb2lyb2NrLnJ1KSdcbn0pO1xuIiwidmFyIHNoYXJlZCA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9zaGFyZWQnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBzaGFyZWQoJ25hdGl2ZS1mdW5jdGlvbi10by1zdHJpbmcnLCBGdW5jdGlvbi50b1N0cmluZyk7XG4iLCJ2YXIgZ2xvYmFsID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2dsb2JhbCcpO1xudmFyIG5hdGl2ZUZ1bmN0aW9uVG9TdHJpbmcgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvZnVuY3Rpb24tdG8tc3RyaW5nJyk7XG5cbnZhciBXZWFrTWFwID0gZ2xvYmFsLldlYWtNYXA7XG5cbm1vZHVsZS5leHBvcnRzID0gdHlwZW9mIFdlYWtNYXAgPT09ICdmdW5jdGlvbicgJiYgL25hdGl2ZSBjb2RlLy50ZXN0KG5hdGl2ZUZ1bmN0aW9uVG9TdHJpbmcuY2FsbChXZWFrTWFwKSk7XG4iLCJ2YXIgaWQgPSAwO1xudmFyIHBvc3RmaXggPSBNYXRoLnJhbmRvbSgpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChrZXkpIHtcbiAgcmV0dXJuICdTeW1ib2woJyArIFN0cmluZyhrZXkgPT09IHVuZGVmaW5lZCA/ICcnIDoga2V5KSArICcpXycgKyAoKytpZCArIHBvc3RmaXgpLnRvU3RyaW5nKDM2KTtcbn07XG4iLCJ2YXIgc2hhcmVkID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL3NoYXJlZCcpO1xudmFyIHVpZCA9IHJlcXVpcmUoJy4uL2ludGVybmFscy91aWQnKTtcblxudmFyIGtleXMgPSBzaGFyZWQoJ2tleXMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoa2V5KSB7XG4gIHJldHVybiBrZXlzW2tleV0gfHwgKGtleXNba2V5XSA9IHVpZChrZXkpKTtcbn07XG4iLCJtb2R1bGUuZXhwb3J0cyA9IHt9O1xuIiwidmFyIE5BVElWRV9XRUFLX01BUCA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9uYXRpdmUtd2Vhay1tYXAnKTtcbnZhciBnbG9iYWwgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvZ2xvYmFsJyk7XG52YXIgaXNPYmplY3QgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvaXMtb2JqZWN0Jyk7XG52YXIgY3JlYXRlTm9uRW51bWVyYWJsZVByb3BlcnR5ID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2NyZWF0ZS1ub24tZW51bWVyYWJsZS1wcm9wZXJ0eScpO1xudmFyIG9iamVjdEhhcyA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9oYXMnKTtcbnZhciBzaGFyZWRLZXkgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvc2hhcmVkLWtleScpO1xudmFyIGhpZGRlbktleXMgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvaGlkZGVuLWtleXMnKTtcblxudmFyIFdlYWtNYXAgPSBnbG9iYWwuV2Vha01hcDtcbnZhciBzZXQsIGdldCwgaGFzO1xuXG52YXIgZW5mb3JjZSA9IGZ1bmN0aW9uIChpdCkge1xuICByZXR1cm4gaGFzKGl0KSA/IGdldChpdCkgOiBzZXQoaXQsIHt9KTtcbn07XG5cbnZhciBnZXR0ZXJGb3IgPSBmdW5jdGlvbiAoVFlQRSkge1xuICByZXR1cm4gZnVuY3Rpb24gKGl0KSB7XG4gICAgdmFyIHN0YXRlO1xuICAgIGlmICghaXNPYmplY3QoaXQpIHx8IChzdGF0ZSA9IGdldChpdCkpLnR5cGUgIT09IFRZUEUpIHtcbiAgICAgIHRocm93IFR5cGVFcnJvcignSW5jb21wYXRpYmxlIHJlY2VpdmVyLCAnICsgVFlQRSArICcgcmVxdWlyZWQnKTtcbiAgICB9IHJldHVybiBzdGF0ZTtcbiAgfTtcbn07XG5cbmlmIChOQVRJVkVfV0VBS19NQVApIHtcbiAgdmFyIHN0b3JlID0gbmV3IFdlYWtNYXAoKTtcbiAgdmFyIHdtZ2V0ID0gc3RvcmUuZ2V0O1xuICB2YXIgd21oYXMgPSBzdG9yZS5oYXM7XG4gIHZhciB3bXNldCA9IHN0b3JlLnNldDtcbiAgc2V0ID0gZnVuY3Rpb24gKGl0LCBtZXRhZGF0YSkge1xuICAgIHdtc2V0LmNhbGwoc3RvcmUsIGl0LCBtZXRhZGF0YSk7XG4gICAgcmV0dXJuIG1ldGFkYXRhO1xuICB9O1xuICBnZXQgPSBmdW5jdGlvbiAoaXQpIHtcbiAgICByZXR1cm4gd21nZXQuY2FsbChzdG9yZSwgaXQpIHx8IHt9O1xuICB9O1xuICBoYXMgPSBmdW5jdGlvbiAoaXQpIHtcbiAgICByZXR1cm4gd21oYXMuY2FsbChzdG9yZSwgaXQpO1xuICB9O1xufSBlbHNlIHtcbiAgdmFyIFNUQVRFID0gc2hhcmVkS2V5KCdzdGF0ZScpO1xuICBoaWRkZW5LZXlzW1NUQVRFXSA9IHRydWU7XG4gIHNldCA9IGZ1bmN0aW9uIChpdCwgbWV0YWRhdGEpIHtcbiAgICBjcmVhdGVOb25FbnVtZXJhYmxlUHJvcGVydHkoaXQsIFNUQVRFLCBtZXRhZGF0YSk7XG4gICAgcmV0dXJuIG1ldGFkYXRhO1xuICB9O1xuICBnZXQgPSBmdW5jdGlvbiAoaXQpIHtcbiAgICByZXR1cm4gb2JqZWN0SGFzKGl0LCBTVEFURSkgPyBpdFtTVEFURV0gOiB7fTtcbiAgfTtcbiAgaGFzID0gZnVuY3Rpb24gKGl0KSB7XG4gICAgcmV0dXJuIG9iamVjdEhhcyhpdCwgU1RBVEUpO1xuICB9O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgc2V0OiBzZXQsXG4gIGdldDogZ2V0LFxuICBoYXM6IGhhcyxcbiAgZW5mb3JjZTogZW5mb3JjZSxcbiAgZ2V0dGVyRm9yOiBnZXR0ZXJGb3Jcbn07XG4iLCJ2YXIgZ2xvYmFsID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2dsb2JhbCcpO1xudmFyIHNoYXJlZCA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9zaGFyZWQnKTtcbnZhciBjcmVhdGVOb25FbnVtZXJhYmxlUHJvcGVydHkgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvY3JlYXRlLW5vbi1lbnVtZXJhYmxlLXByb3BlcnR5Jyk7XG52YXIgaGFzID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2hhcycpO1xudmFyIHNldEdsb2JhbCA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9zZXQtZ2xvYmFsJyk7XG52YXIgbmF0aXZlRnVuY3Rpb25Ub1N0cmluZyA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9mdW5jdGlvbi10by1zdHJpbmcnKTtcbnZhciBJbnRlcm5hbFN0YXRlTW9kdWxlID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2ludGVybmFsLXN0YXRlJyk7XG5cbnZhciBnZXRJbnRlcm5hbFN0YXRlID0gSW50ZXJuYWxTdGF0ZU1vZHVsZS5nZXQ7XG52YXIgZW5mb3JjZUludGVybmFsU3RhdGUgPSBJbnRlcm5hbFN0YXRlTW9kdWxlLmVuZm9yY2U7XG52YXIgVEVNUExBVEUgPSBTdHJpbmcobmF0aXZlRnVuY3Rpb25Ub1N0cmluZykuc3BsaXQoJ3RvU3RyaW5nJyk7XG5cbnNoYXJlZCgnaW5zcGVjdFNvdXJjZScsIGZ1bmN0aW9uIChpdCkge1xuICByZXR1cm4gbmF0aXZlRnVuY3Rpb25Ub1N0cmluZy5jYWxsKGl0KTtcbn0pO1xuXG4obW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoTywga2V5LCB2YWx1ZSwgb3B0aW9ucykge1xuICB2YXIgdW5zYWZlID0gb3B0aW9ucyA/ICEhb3B0aW9ucy51bnNhZmUgOiBmYWxzZTtcbiAgdmFyIHNpbXBsZSA9IG9wdGlvbnMgPyAhIW9wdGlvbnMuZW51bWVyYWJsZSA6IGZhbHNlO1xuICB2YXIgbm9UYXJnZXRHZXQgPSBvcHRpb25zID8gISFvcHRpb25zLm5vVGFyZ2V0R2V0IDogZmFsc2U7XG4gIGlmICh0eXBlb2YgdmFsdWUgPT0gJ2Z1bmN0aW9uJykge1xuICAgIGlmICh0eXBlb2Yga2V5ID09ICdzdHJpbmcnICYmICFoYXModmFsdWUsICduYW1lJykpIGNyZWF0ZU5vbkVudW1lcmFibGVQcm9wZXJ0eSh2YWx1ZSwgJ25hbWUnLCBrZXkpO1xuICAgIGVuZm9yY2VJbnRlcm5hbFN0YXRlKHZhbHVlKS5zb3VyY2UgPSBURU1QTEFURS5qb2luKHR5cGVvZiBrZXkgPT0gJ3N0cmluZycgPyBrZXkgOiAnJyk7XG4gIH1cbiAgaWYgKE8gPT09IGdsb2JhbCkge1xuICAgIGlmIChzaW1wbGUpIE9ba2V5XSA9IHZhbHVlO1xuICAgIGVsc2Ugc2V0R2xvYmFsKGtleSwgdmFsdWUpO1xuICAgIHJldHVybjtcbiAgfSBlbHNlIGlmICghdW5zYWZlKSB7XG4gICAgZGVsZXRlIE9ba2V5XTtcbiAgfSBlbHNlIGlmICghbm9UYXJnZXRHZXQgJiYgT1trZXldKSB7XG4gICAgc2ltcGxlID0gdHJ1ZTtcbiAgfVxuICBpZiAoc2ltcGxlKSBPW2tleV0gPSB2YWx1ZTtcbiAgZWxzZSBjcmVhdGVOb25FbnVtZXJhYmxlUHJvcGVydHkoTywga2V5LCB2YWx1ZSk7XG4vLyBhZGQgZmFrZSBGdW5jdGlvbiN0b1N0cmluZyBmb3IgY29ycmVjdCB3b3JrIHdyYXBwZWQgbWV0aG9kcyAvIGNvbnN0cnVjdG9ycyB3aXRoIG1ldGhvZHMgbGlrZSBMb0Rhc2ggaXNOYXRpdmVcbn0pKEZ1bmN0aW9uLnByb3RvdHlwZSwgJ3RvU3RyaW5nJywgZnVuY3Rpb24gdG9TdHJpbmcoKSB7XG4gIHJldHVybiB0eXBlb2YgdGhpcyA9PSAnZnVuY3Rpb24nICYmIGdldEludGVybmFsU3RhdGUodGhpcykuc291cmNlIHx8IG5hdGl2ZUZ1bmN0aW9uVG9TdHJpbmcuY2FsbCh0aGlzKTtcbn0pO1xuIiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvZ2xvYmFsJyk7XG4iLCJ2YXIgcGF0aCA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9wYXRoJyk7XG52YXIgZ2xvYmFsID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2dsb2JhbCcpO1xuXG52YXIgYUZ1bmN0aW9uID0gZnVuY3Rpb24gKHZhcmlhYmxlKSB7XG4gIHJldHVybiB0eXBlb2YgdmFyaWFibGUgPT0gJ2Z1bmN0aW9uJyA/IHZhcmlhYmxlIDogdW5kZWZpbmVkO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAobmFtZXNwYWNlLCBtZXRob2QpIHtcbiAgcmV0dXJuIGFyZ3VtZW50cy5sZW5ndGggPCAyID8gYUZ1bmN0aW9uKHBhdGhbbmFtZXNwYWNlXSkgfHwgYUZ1bmN0aW9uKGdsb2JhbFtuYW1lc3BhY2VdKVxuICAgIDogcGF0aFtuYW1lc3BhY2VdICYmIHBhdGhbbmFtZXNwYWNlXVttZXRob2RdIHx8IGdsb2JhbFtuYW1lc3BhY2VdICYmIGdsb2JhbFtuYW1lc3BhY2VdW21ldGhvZF07XG59O1xuIiwidmFyIGNlaWwgPSBNYXRoLmNlaWw7XG52YXIgZmxvb3IgPSBNYXRoLmZsb29yO1xuXG4vLyBgVG9JbnRlZ2VyYCBhYnN0cmFjdCBvcGVyYXRpb25cbi8vIGh0dHBzOi8vdGMzOS5naXRodWIuaW8vZWNtYTI2Mi8jc2VjLXRvaW50ZWdlclxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoYXJndW1lbnQpIHtcbiAgcmV0dXJuIGlzTmFOKGFyZ3VtZW50ID0gK2FyZ3VtZW50KSA/IDAgOiAoYXJndW1lbnQgPiAwID8gZmxvb3IgOiBjZWlsKShhcmd1bWVudCk7XG59O1xuIiwidmFyIHRvSW50ZWdlciA9IHJlcXVpcmUoJy4uL2ludGVybmFscy90by1pbnRlZ2VyJyk7XG5cbnZhciBtaW4gPSBNYXRoLm1pbjtcblxuLy8gYFRvTGVuZ3RoYCBhYnN0cmFjdCBvcGVyYXRpb25cbi8vIGh0dHBzOi8vdGMzOS5naXRodWIuaW8vZWNtYTI2Mi8jc2VjLXRvbGVuZ3RoXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChhcmd1bWVudCkge1xuICByZXR1cm4gYXJndW1lbnQgPiAwID8gbWluKHRvSW50ZWdlcihhcmd1bWVudCksIDB4MUZGRkZGRkZGRkZGRkYpIDogMDsgLy8gMiAqKiA1MyAtIDEgPT0gOTAwNzE5OTI1NDc0MDk5MVxufTtcbiIsInZhciB0b0ludGVnZXIgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvdG8taW50ZWdlcicpO1xuXG52YXIgbWF4ID0gTWF0aC5tYXg7XG52YXIgbWluID0gTWF0aC5taW47XG5cbi8vIEhlbHBlciBmb3IgYSBwb3B1bGFyIHJlcGVhdGluZyBjYXNlIG9mIHRoZSBzcGVjOlxuLy8gTGV0IGludGVnZXIgYmUgPyBUb0ludGVnZXIoaW5kZXgpLlxuLy8gSWYgaW50ZWdlciA8IDAsIGxldCByZXN1bHQgYmUgbWF4KChsZW5ndGggKyBpbnRlZ2VyKSwgMCk7IGVsc2UgbGV0IHJlc3VsdCBiZSBtaW4obGVuZ3RoLCBsZW5ndGgpLlxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoaW5kZXgsIGxlbmd0aCkge1xuICB2YXIgaW50ZWdlciA9IHRvSW50ZWdlcihpbmRleCk7XG4gIHJldHVybiBpbnRlZ2VyIDwgMCA/IG1heChpbnRlZ2VyICsgbGVuZ3RoLCAwKSA6IG1pbihpbnRlZ2VyLCBsZW5ndGgpO1xufTtcbiIsInZhciB0b0luZGV4ZWRPYmplY3QgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvdG8taW5kZXhlZC1vYmplY3QnKTtcbnZhciB0b0xlbmd0aCA9IHJlcXVpcmUoJy4uL2ludGVybmFscy90by1sZW5ndGgnKTtcbnZhciB0b0Fic29sdXRlSW5kZXggPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvdG8tYWJzb2x1dGUtaW5kZXgnKTtcblxuLy8gYEFycmF5LnByb3RvdHlwZS57IGluZGV4T2YsIGluY2x1ZGVzIH1gIG1ldGhvZHMgaW1wbGVtZW50YXRpb25cbnZhciBjcmVhdGVNZXRob2QgPSBmdW5jdGlvbiAoSVNfSU5DTFVERVMpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uICgkdGhpcywgZWwsIGZyb21JbmRleCkge1xuICAgIHZhciBPID0gdG9JbmRleGVkT2JqZWN0KCR0aGlzKTtcbiAgICB2YXIgbGVuZ3RoID0gdG9MZW5ndGgoTy5sZW5ndGgpO1xuICAgIHZhciBpbmRleCA9IHRvQWJzb2x1dGVJbmRleChmcm9tSW5kZXgsIGxlbmd0aCk7XG4gICAgdmFyIHZhbHVlO1xuICAgIC8vIEFycmF5I2luY2x1ZGVzIHVzZXMgU2FtZVZhbHVlWmVybyBlcXVhbGl0eSBhbGdvcml0aG1cbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tc2VsZi1jb21wYXJlXG4gICAgaWYgKElTX0lOQ0xVREVTICYmIGVsICE9IGVsKSB3aGlsZSAobGVuZ3RoID4gaW5kZXgpIHtcbiAgICAgIHZhbHVlID0gT1tpbmRleCsrXTtcbiAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1zZWxmLWNvbXBhcmVcbiAgICAgIGlmICh2YWx1ZSAhPSB2YWx1ZSkgcmV0dXJuIHRydWU7XG4gICAgLy8gQXJyYXkjaW5kZXhPZiBpZ25vcmVzIGhvbGVzLCBBcnJheSNpbmNsdWRlcyAtIG5vdFxuICAgIH0gZWxzZSBmb3IgKDtsZW5ndGggPiBpbmRleDsgaW5kZXgrKykge1xuICAgICAgaWYgKChJU19JTkNMVURFUyB8fCBpbmRleCBpbiBPKSAmJiBPW2luZGV4XSA9PT0gZWwpIHJldHVybiBJU19JTkNMVURFUyB8fCBpbmRleCB8fCAwO1xuICAgIH0gcmV0dXJuICFJU19JTkNMVURFUyAmJiAtMTtcbiAgfTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICAvLyBgQXJyYXkucHJvdG90eXBlLmluY2x1ZGVzYCBtZXRob2RcbiAgLy8gaHR0cHM6Ly90YzM5LmdpdGh1Yi5pby9lY21hMjYyLyNzZWMtYXJyYXkucHJvdG90eXBlLmluY2x1ZGVzXG4gIGluY2x1ZGVzOiBjcmVhdGVNZXRob2QodHJ1ZSksXG4gIC8vIGBBcnJheS5wcm90b3R5cGUuaW5kZXhPZmAgbWV0aG9kXG4gIC8vIGh0dHBzOi8vdGMzOS5naXRodWIuaW8vZWNtYTI2Mi8jc2VjLWFycmF5LnByb3RvdHlwZS5pbmRleG9mXG4gIGluZGV4T2Y6IGNyZWF0ZU1ldGhvZChmYWxzZSlcbn07XG4iLCJ2YXIgaGFzID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2hhcycpO1xudmFyIHRvSW5kZXhlZE9iamVjdCA9IHJlcXVpcmUoJy4uL2ludGVybmFscy90by1pbmRleGVkLW9iamVjdCcpO1xudmFyIGluZGV4T2YgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvYXJyYXktaW5jbHVkZXMnKS5pbmRleE9mO1xudmFyIGhpZGRlbktleXMgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvaGlkZGVuLWtleXMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAob2JqZWN0LCBuYW1lcykge1xuICB2YXIgTyA9IHRvSW5kZXhlZE9iamVjdChvYmplY3QpO1xuICB2YXIgaSA9IDA7XG4gIHZhciByZXN1bHQgPSBbXTtcbiAgdmFyIGtleTtcbiAgZm9yIChrZXkgaW4gTykgIWhhcyhoaWRkZW5LZXlzLCBrZXkpICYmIGhhcyhPLCBrZXkpICYmIHJlc3VsdC5wdXNoKGtleSk7XG4gIC8vIERvbid0IGVudW0gYnVnICYgaGlkZGVuIGtleXNcbiAgd2hpbGUgKG5hbWVzLmxlbmd0aCA+IGkpIGlmIChoYXMoTywga2V5ID0gbmFtZXNbaSsrXSkpIHtcbiAgICB+aW5kZXhPZihyZXN1bHQsIGtleSkgfHwgcmVzdWx0LnB1c2goa2V5KTtcbiAgfVxuICByZXR1cm4gcmVzdWx0O1xufTtcbiIsIi8vIElFOC0gZG9uJ3QgZW51bSBidWcga2V5c1xubW9kdWxlLmV4cG9ydHMgPSBbXG4gICdjb25zdHJ1Y3RvcicsXG4gICdoYXNPd25Qcm9wZXJ0eScsXG4gICdpc1Byb3RvdHlwZU9mJyxcbiAgJ3Byb3BlcnR5SXNFbnVtZXJhYmxlJyxcbiAgJ3RvTG9jYWxlU3RyaW5nJyxcbiAgJ3RvU3RyaW5nJyxcbiAgJ3ZhbHVlT2YnXG5dO1xuIiwidmFyIGludGVybmFsT2JqZWN0S2V5cyA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9vYmplY3Qta2V5cy1pbnRlcm5hbCcpO1xudmFyIGVudW1CdWdLZXlzID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2VudW0tYnVnLWtleXMnKTtcblxudmFyIGhpZGRlbktleXMgPSBlbnVtQnVnS2V5cy5jb25jYXQoJ2xlbmd0aCcsICdwcm90b3R5cGUnKTtcblxuLy8gYE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzYCBtZXRob2Rcbi8vIGh0dHBzOi8vdGMzOS5naXRodWIuaW8vZWNtYTI2Mi8jc2VjLW9iamVjdC5nZXRvd25wcm9wZXJ0eW5hbWVzXG5leHBvcnRzLmYgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyB8fCBmdW5jdGlvbiBnZXRPd25Qcm9wZXJ0eU5hbWVzKE8pIHtcbiAgcmV0dXJuIGludGVybmFsT2JqZWN0S2V5cyhPLCBoaWRkZW5LZXlzKTtcbn07XG4iLCJleHBvcnRzLmYgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlTeW1ib2xzO1xuIiwidmFyIGdldEJ1aWx0SW4gPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvZ2V0LWJ1aWx0LWluJyk7XG52YXIgZ2V0T3duUHJvcGVydHlOYW1lc01vZHVsZSA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9vYmplY3QtZ2V0LW93bi1wcm9wZXJ0eS1uYW1lcycpO1xudmFyIGdldE93blByb3BlcnR5U3ltYm9sc01vZHVsZSA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9vYmplY3QtZ2V0LW93bi1wcm9wZXJ0eS1zeW1ib2xzJyk7XG52YXIgYW5PYmplY3QgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvYW4tb2JqZWN0Jyk7XG5cbi8vIGFsbCBvYmplY3Qga2V5cywgaW5jbHVkZXMgbm9uLWVudW1lcmFibGUgYW5kIHN5bWJvbHNcbm1vZHVsZS5leHBvcnRzID0gZ2V0QnVpbHRJbignUmVmbGVjdCcsICdvd25LZXlzJykgfHwgZnVuY3Rpb24gb3duS2V5cyhpdCkge1xuICB2YXIga2V5cyA9IGdldE93blByb3BlcnR5TmFtZXNNb2R1bGUuZihhbk9iamVjdChpdCkpO1xuICB2YXIgZ2V0T3duUHJvcGVydHlTeW1ib2xzID0gZ2V0T3duUHJvcGVydHlTeW1ib2xzTW9kdWxlLmY7XG4gIHJldHVybiBnZXRPd25Qcm9wZXJ0eVN5bWJvbHMgPyBrZXlzLmNvbmNhdChnZXRPd25Qcm9wZXJ0eVN5bWJvbHMoaXQpKSA6IGtleXM7XG59O1xuIiwidmFyIGhhcyA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9oYXMnKTtcbnZhciBvd25LZXlzID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL293bi1rZXlzJyk7XG52YXIgZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yTW9kdWxlID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL29iamVjdC1nZXQtb3duLXByb3BlcnR5LWRlc2NyaXB0b3InKTtcbnZhciBkZWZpbmVQcm9wZXJ0eU1vZHVsZSA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9vYmplY3QtZGVmaW5lLXByb3BlcnR5Jyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKHRhcmdldCwgc291cmNlKSB7XG4gIHZhciBrZXlzID0gb3duS2V5cyhzb3VyY2UpO1xuICB2YXIgZGVmaW5lUHJvcGVydHkgPSBkZWZpbmVQcm9wZXJ0eU1vZHVsZS5mO1xuICB2YXIgZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yID0gZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yTW9kdWxlLmY7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwga2V5cy5sZW5ndGg7IGkrKykge1xuICAgIHZhciBrZXkgPSBrZXlzW2ldO1xuICAgIGlmICghaGFzKHRhcmdldCwga2V5KSkgZGVmaW5lUHJvcGVydHkodGFyZ2V0LCBrZXksIGdldE93blByb3BlcnR5RGVzY3JpcHRvcihzb3VyY2UsIGtleSkpO1xuICB9XG59O1xuIiwidmFyIGZhaWxzID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2ZhaWxzJyk7XG5cbnZhciByZXBsYWNlbWVudCA9IC8jfFxcLnByb3RvdHlwZVxcLi87XG5cbnZhciBpc0ZvcmNlZCA9IGZ1bmN0aW9uIChmZWF0dXJlLCBkZXRlY3Rpb24pIHtcbiAgdmFyIHZhbHVlID0gZGF0YVtub3JtYWxpemUoZmVhdHVyZSldO1xuICByZXR1cm4gdmFsdWUgPT0gUE9MWUZJTEwgPyB0cnVlXG4gICAgOiB2YWx1ZSA9PSBOQVRJVkUgPyBmYWxzZVxuICAgIDogdHlwZW9mIGRldGVjdGlvbiA9PSAnZnVuY3Rpb24nID8gZmFpbHMoZGV0ZWN0aW9uKVxuICAgIDogISFkZXRlY3Rpb247XG59O1xuXG52YXIgbm9ybWFsaXplID0gaXNGb3JjZWQubm9ybWFsaXplID0gZnVuY3Rpb24gKHN0cmluZykge1xuICByZXR1cm4gU3RyaW5nKHN0cmluZykucmVwbGFjZShyZXBsYWNlbWVudCwgJy4nKS50b0xvd2VyQ2FzZSgpO1xufTtcblxudmFyIGRhdGEgPSBpc0ZvcmNlZC5kYXRhID0ge307XG52YXIgTkFUSVZFID0gaXNGb3JjZWQuTkFUSVZFID0gJ04nO1xudmFyIFBPTFlGSUxMID0gaXNGb3JjZWQuUE9MWUZJTEwgPSAnUCc7XG5cbm1vZHVsZS5leHBvcnRzID0gaXNGb3JjZWQ7XG4iLCJ2YXIgZ2xvYmFsID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2dsb2JhbCcpO1xudmFyIGdldE93blByb3BlcnR5RGVzY3JpcHRvciA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9vYmplY3QtZ2V0LW93bi1wcm9wZXJ0eS1kZXNjcmlwdG9yJykuZjtcbnZhciBjcmVhdGVOb25FbnVtZXJhYmxlUHJvcGVydHkgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvY3JlYXRlLW5vbi1lbnVtZXJhYmxlLXByb3BlcnR5Jyk7XG52YXIgcmVkZWZpbmUgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvcmVkZWZpbmUnKTtcbnZhciBzZXRHbG9iYWwgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvc2V0LWdsb2JhbCcpO1xudmFyIGNvcHlDb25zdHJ1Y3RvclByb3BlcnRpZXMgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvY29weS1jb25zdHJ1Y3Rvci1wcm9wZXJ0aWVzJyk7XG52YXIgaXNGb3JjZWQgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvaXMtZm9yY2VkJyk7XG5cbi8qXG4gIG9wdGlvbnMudGFyZ2V0ICAgICAgLSBuYW1lIG9mIHRoZSB0YXJnZXQgb2JqZWN0XG4gIG9wdGlvbnMuZ2xvYmFsICAgICAgLSB0YXJnZXQgaXMgdGhlIGdsb2JhbCBvYmplY3RcbiAgb3B0aW9ucy5zdGF0ICAgICAgICAtIGV4cG9ydCBhcyBzdGF0aWMgbWV0aG9kcyBvZiB0YXJnZXRcbiAgb3B0aW9ucy5wcm90byAgICAgICAtIGV4cG9ydCBhcyBwcm90b3R5cGUgbWV0aG9kcyBvZiB0YXJnZXRcbiAgb3B0aW9ucy5yZWFsICAgICAgICAtIHJlYWwgcHJvdG90eXBlIG1ldGhvZCBmb3IgdGhlIGBwdXJlYCB2ZXJzaW9uXG4gIG9wdGlvbnMuZm9yY2VkICAgICAgLSBleHBvcnQgZXZlbiBpZiB0aGUgbmF0aXZlIGZlYXR1cmUgaXMgYXZhaWxhYmxlXG4gIG9wdGlvbnMuYmluZCAgICAgICAgLSBiaW5kIG1ldGhvZHMgdG8gdGhlIHRhcmdldCwgcmVxdWlyZWQgZm9yIHRoZSBgcHVyZWAgdmVyc2lvblxuICBvcHRpb25zLndyYXAgICAgICAgIC0gd3JhcCBjb25zdHJ1Y3RvcnMgdG8gcHJldmVudGluZyBnbG9iYWwgcG9sbHV0aW9uLCByZXF1aXJlZCBmb3IgdGhlIGBwdXJlYCB2ZXJzaW9uXG4gIG9wdGlvbnMudW5zYWZlICAgICAgLSB1c2UgdGhlIHNpbXBsZSBhc3NpZ25tZW50IG9mIHByb3BlcnR5IGluc3RlYWQgb2YgZGVsZXRlICsgZGVmaW5lUHJvcGVydHlcbiAgb3B0aW9ucy5zaGFtICAgICAgICAtIGFkZCBhIGZsYWcgdG8gbm90IGNvbXBsZXRlbHkgZnVsbCBwb2x5ZmlsbHNcbiAgb3B0aW9ucy5lbnVtZXJhYmxlICAtIGV4cG9ydCBhcyBlbnVtZXJhYmxlIHByb3BlcnR5XG4gIG9wdGlvbnMubm9UYXJnZXRHZXQgLSBwcmV2ZW50IGNhbGxpbmcgYSBnZXR0ZXIgb24gdGFyZ2V0XG4qL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAob3B0aW9ucywgc291cmNlKSB7XG4gIHZhciBUQVJHRVQgPSBvcHRpb25zLnRhcmdldDtcbiAgdmFyIEdMT0JBTCA9IG9wdGlvbnMuZ2xvYmFsO1xuICB2YXIgU1RBVElDID0gb3B0aW9ucy5zdGF0O1xuICB2YXIgRk9SQ0VELCB0YXJnZXQsIGtleSwgdGFyZ2V0UHJvcGVydHksIHNvdXJjZVByb3BlcnR5LCBkZXNjcmlwdG9yO1xuICBpZiAoR0xPQkFMKSB7XG4gICAgdGFyZ2V0ID0gZ2xvYmFsO1xuICB9IGVsc2UgaWYgKFNUQVRJQykge1xuICAgIHRhcmdldCA9IGdsb2JhbFtUQVJHRVRdIHx8IHNldEdsb2JhbChUQVJHRVQsIHt9KTtcbiAgfSBlbHNlIHtcbiAgICB0YXJnZXQgPSAoZ2xvYmFsW1RBUkdFVF0gfHwge30pLnByb3RvdHlwZTtcbiAgfVxuICBpZiAodGFyZ2V0KSBmb3IgKGtleSBpbiBzb3VyY2UpIHtcbiAgICBzb3VyY2VQcm9wZXJ0eSA9IHNvdXJjZVtrZXldO1xuICAgIGlmIChvcHRpb25zLm5vVGFyZ2V0R2V0KSB7XG4gICAgICBkZXNjcmlwdG9yID0gZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKHRhcmdldCwga2V5KTtcbiAgICAgIHRhcmdldFByb3BlcnR5ID0gZGVzY3JpcHRvciAmJiBkZXNjcmlwdG9yLnZhbHVlO1xuICAgIH0gZWxzZSB0YXJnZXRQcm9wZXJ0eSA9IHRhcmdldFtrZXldO1xuICAgIEZPUkNFRCA9IGlzRm9yY2VkKEdMT0JBTCA/IGtleSA6IFRBUkdFVCArIChTVEFUSUMgPyAnLicgOiAnIycpICsga2V5LCBvcHRpb25zLmZvcmNlZCk7XG4gICAgLy8gY29udGFpbmVkIGluIHRhcmdldFxuICAgIGlmICghRk9SQ0VEICYmIHRhcmdldFByb3BlcnR5ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIGlmICh0eXBlb2Ygc291cmNlUHJvcGVydHkgPT09IHR5cGVvZiB0YXJnZXRQcm9wZXJ0eSkgY29udGludWU7XG4gICAgICBjb3B5Q29uc3RydWN0b3JQcm9wZXJ0aWVzKHNvdXJjZVByb3BlcnR5LCB0YXJnZXRQcm9wZXJ0eSk7XG4gICAgfVxuICAgIC8vIGFkZCBhIGZsYWcgdG8gbm90IGNvbXBsZXRlbHkgZnVsbCBwb2x5ZmlsbHNcbiAgICBpZiAob3B0aW9ucy5zaGFtIHx8ICh0YXJnZXRQcm9wZXJ0eSAmJiB0YXJnZXRQcm9wZXJ0eS5zaGFtKSkge1xuICAgICAgY3JlYXRlTm9uRW51bWVyYWJsZVByb3BlcnR5KHNvdXJjZVByb3BlcnR5LCAnc2hhbScsIHRydWUpO1xuICAgIH1cbiAgICAvLyBleHRlbmQgZ2xvYmFsXG4gICAgcmVkZWZpbmUodGFyZ2V0LCBrZXksIHNvdXJjZVByb3BlcnR5LCBvcHRpb25zKTtcbiAgfVxufTtcbiIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGl0KSB7XG4gIGlmICh0eXBlb2YgaXQgIT0gJ2Z1bmN0aW9uJykge1xuICAgIHRocm93IFR5cGVFcnJvcihTdHJpbmcoaXQpICsgJyBpcyBub3QgYSBmdW5jdGlvbicpO1xuICB9IHJldHVybiBpdDtcbn07XG4iLCJ2YXIgYUZ1bmN0aW9uID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2EtZnVuY3Rpb24nKTtcblxuLy8gb3B0aW9uYWwgLyBzaW1wbGUgY29udGV4dCBiaW5kaW5nXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChmbiwgdGhhdCwgbGVuZ3RoKSB7XG4gIGFGdW5jdGlvbihmbik7XG4gIGlmICh0aGF0ID09PSB1bmRlZmluZWQpIHJldHVybiBmbjtcbiAgc3dpdGNoIChsZW5ndGgpIHtcbiAgICBjYXNlIDA6IHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4gZm4uY2FsbCh0aGF0KTtcbiAgICB9O1xuICAgIGNhc2UgMTogcmV0dXJuIGZ1bmN0aW9uIChhKSB7XG4gICAgICByZXR1cm4gZm4uY2FsbCh0aGF0LCBhKTtcbiAgICB9O1xuICAgIGNhc2UgMjogcmV0dXJuIGZ1bmN0aW9uIChhLCBiKSB7XG4gICAgICByZXR1cm4gZm4uY2FsbCh0aGF0LCBhLCBiKTtcbiAgICB9O1xuICAgIGNhc2UgMzogcmV0dXJuIGZ1bmN0aW9uIChhLCBiLCBjKSB7XG4gICAgICByZXR1cm4gZm4uY2FsbCh0aGF0LCBhLCBiLCBjKTtcbiAgICB9O1xuICB9XG4gIHJldHVybiBmdW5jdGlvbiAoLyogLi4uYXJncyAqLykge1xuICAgIHJldHVybiBmbi5hcHBseSh0aGF0LCBhcmd1bWVudHMpO1xuICB9O1xufTtcbiIsInZhciByZXF1aXJlT2JqZWN0Q29lcmNpYmxlID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL3JlcXVpcmUtb2JqZWN0LWNvZXJjaWJsZScpO1xuXG4vLyBgVG9PYmplY3RgIGFic3RyYWN0IG9wZXJhdGlvblxuLy8gaHR0cHM6Ly90YzM5LmdpdGh1Yi5pby9lY21hMjYyLyNzZWMtdG9vYmplY3Rcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGFyZ3VtZW50KSB7XG4gIHJldHVybiBPYmplY3QocmVxdWlyZU9iamVjdENvZXJjaWJsZShhcmd1bWVudCkpO1xufTtcbiIsInZhciBjbGFzc29mID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2NsYXNzb2YtcmF3Jyk7XG5cbi8vIGBJc0FycmF5YCBhYnN0cmFjdCBvcGVyYXRpb25cbi8vIGh0dHBzOi8vdGMzOS5naXRodWIuaW8vZWNtYTI2Mi8jc2VjLWlzYXJyYXlcbm1vZHVsZS5leHBvcnRzID0gQXJyYXkuaXNBcnJheSB8fCBmdW5jdGlvbiBpc0FycmF5KGFyZykge1xuICByZXR1cm4gY2xhc3NvZihhcmcpID09ICdBcnJheSc7XG59O1xuIiwidmFyIGZhaWxzID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2ZhaWxzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gISFPYmplY3QuZ2V0T3duUHJvcGVydHlTeW1ib2xzICYmICFmYWlscyhmdW5jdGlvbiAoKSB7XG4gIC8vIENocm9tZSAzOCBTeW1ib2wgaGFzIGluY29ycmVjdCB0b1N0cmluZyBjb252ZXJzaW9uXG4gIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby11bmRlZlxuICByZXR1cm4gIVN0cmluZyhTeW1ib2woKSk7XG59KTtcbiIsInZhciBnbG9iYWwgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvZ2xvYmFsJyk7XG52YXIgc2hhcmVkID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL3NoYXJlZCcpO1xudmFyIHVpZCA9IHJlcXVpcmUoJy4uL2ludGVybmFscy91aWQnKTtcbnZhciBOQVRJVkVfU1lNQk9MID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL25hdGl2ZS1zeW1ib2wnKTtcblxudmFyIFN5bWJvbCA9IGdsb2JhbC5TeW1ib2w7XG52YXIgc3RvcmUgPSBzaGFyZWQoJ3drcycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChuYW1lKSB7XG4gIHJldHVybiBzdG9yZVtuYW1lXSB8fCAoc3RvcmVbbmFtZV0gPSBOQVRJVkVfU1lNQk9MICYmIFN5bWJvbFtuYW1lXVxuICAgIHx8IChOQVRJVkVfU1lNQk9MID8gU3ltYm9sIDogdWlkKSgnU3ltYm9sLicgKyBuYW1lKSk7XG59O1xuIiwidmFyIGlzT2JqZWN0ID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2lzLW9iamVjdCcpO1xudmFyIGlzQXJyYXkgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvaXMtYXJyYXknKTtcbnZhciB3ZWxsS25vd25TeW1ib2wgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvd2VsbC1rbm93bi1zeW1ib2wnKTtcblxudmFyIFNQRUNJRVMgPSB3ZWxsS25vd25TeW1ib2woJ3NwZWNpZXMnKTtcblxuLy8gYEFycmF5U3BlY2llc0NyZWF0ZWAgYWJzdHJhY3Qgb3BlcmF0aW9uXG4vLyBodHRwczovL3RjMzkuZ2l0aHViLmlvL2VjbWEyNjIvI3NlYy1hcnJheXNwZWNpZXNjcmVhdGVcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKG9yaWdpbmFsQXJyYXksIGxlbmd0aCkge1xuICB2YXIgQztcbiAgaWYgKGlzQXJyYXkob3JpZ2luYWxBcnJheSkpIHtcbiAgICBDID0gb3JpZ2luYWxBcnJheS5jb25zdHJ1Y3RvcjtcbiAgICAvLyBjcm9zcy1yZWFsbSBmYWxsYmFja1xuICAgIGlmICh0eXBlb2YgQyA9PSAnZnVuY3Rpb24nICYmIChDID09PSBBcnJheSB8fCBpc0FycmF5KEMucHJvdG90eXBlKSkpIEMgPSB1bmRlZmluZWQ7XG4gICAgZWxzZSBpZiAoaXNPYmplY3QoQykpIHtcbiAgICAgIEMgPSBDW1NQRUNJRVNdO1xuICAgICAgaWYgKEMgPT09IG51bGwpIEMgPSB1bmRlZmluZWQ7XG4gICAgfVxuICB9IHJldHVybiBuZXcgKEMgPT09IHVuZGVmaW5lZCA/IEFycmF5IDogQykobGVuZ3RoID09PSAwID8gMCA6IGxlbmd0aCk7XG59O1xuIiwidmFyIGJpbmQgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvYmluZC1jb250ZXh0Jyk7XG52YXIgSW5kZXhlZE9iamVjdCA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9pbmRleGVkLW9iamVjdCcpO1xudmFyIHRvT2JqZWN0ID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL3RvLW9iamVjdCcpO1xudmFyIHRvTGVuZ3RoID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL3RvLWxlbmd0aCcpO1xudmFyIGFycmF5U3BlY2llc0NyZWF0ZSA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9hcnJheS1zcGVjaWVzLWNyZWF0ZScpO1xuXG52YXIgcHVzaCA9IFtdLnB1c2g7XG5cbi8vIGBBcnJheS5wcm90b3R5cGUueyBmb3JFYWNoLCBtYXAsIGZpbHRlciwgc29tZSwgZXZlcnksIGZpbmQsIGZpbmRJbmRleCB9YCBtZXRob2RzIGltcGxlbWVudGF0aW9uXG52YXIgY3JlYXRlTWV0aG9kID0gZnVuY3Rpb24gKFRZUEUpIHtcbiAgdmFyIElTX01BUCA9IFRZUEUgPT0gMTtcbiAgdmFyIElTX0ZJTFRFUiA9IFRZUEUgPT0gMjtcbiAgdmFyIElTX1NPTUUgPSBUWVBFID09IDM7XG4gIHZhciBJU19FVkVSWSA9IFRZUEUgPT0gNDtcbiAgdmFyIElTX0ZJTkRfSU5ERVggPSBUWVBFID09IDY7XG4gIHZhciBOT19IT0xFUyA9IFRZUEUgPT0gNSB8fCBJU19GSU5EX0lOREVYO1xuICByZXR1cm4gZnVuY3Rpb24gKCR0aGlzLCBjYWxsYmFja2ZuLCB0aGF0LCBzcGVjaWZpY0NyZWF0ZSkge1xuICAgIHZhciBPID0gdG9PYmplY3QoJHRoaXMpO1xuICAgIHZhciBzZWxmID0gSW5kZXhlZE9iamVjdChPKTtcbiAgICB2YXIgYm91bmRGdW5jdGlvbiA9IGJpbmQoY2FsbGJhY2tmbiwgdGhhdCwgMyk7XG4gICAgdmFyIGxlbmd0aCA9IHRvTGVuZ3RoKHNlbGYubGVuZ3RoKTtcbiAgICB2YXIgaW5kZXggPSAwO1xuICAgIHZhciBjcmVhdGUgPSBzcGVjaWZpY0NyZWF0ZSB8fCBhcnJheVNwZWNpZXNDcmVhdGU7XG4gICAgdmFyIHRhcmdldCA9IElTX01BUCA/IGNyZWF0ZSgkdGhpcywgbGVuZ3RoKSA6IElTX0ZJTFRFUiA/IGNyZWF0ZSgkdGhpcywgMCkgOiB1bmRlZmluZWQ7XG4gICAgdmFyIHZhbHVlLCByZXN1bHQ7XG4gICAgZm9yICg7bGVuZ3RoID4gaW5kZXg7IGluZGV4KyspIGlmIChOT19IT0xFUyB8fCBpbmRleCBpbiBzZWxmKSB7XG4gICAgICB2YWx1ZSA9IHNlbGZbaW5kZXhdO1xuICAgICAgcmVzdWx0ID0gYm91bmRGdW5jdGlvbih2YWx1ZSwgaW5kZXgsIE8pO1xuICAgICAgaWYgKFRZUEUpIHtcbiAgICAgICAgaWYgKElTX01BUCkgdGFyZ2V0W2luZGV4XSA9IHJlc3VsdDsgLy8gbWFwXG4gICAgICAgIGVsc2UgaWYgKHJlc3VsdCkgc3dpdGNoIChUWVBFKSB7XG4gICAgICAgICAgY2FzZSAzOiByZXR1cm4gdHJ1ZTsgICAgICAgICAgICAgIC8vIHNvbWVcbiAgICAgICAgICBjYXNlIDU6IHJldHVybiB2YWx1ZTsgICAgICAgICAgICAgLy8gZmluZFxuICAgICAgICAgIGNhc2UgNjogcmV0dXJuIGluZGV4OyAgICAgICAgICAgICAvLyBmaW5kSW5kZXhcbiAgICAgICAgICBjYXNlIDI6IHB1c2guY2FsbCh0YXJnZXQsIHZhbHVlKTsgLy8gZmlsdGVyXG4gICAgICAgIH0gZWxzZSBpZiAoSVNfRVZFUlkpIHJldHVybiBmYWxzZTsgIC8vIGV2ZXJ5XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBJU19GSU5EX0lOREVYID8gLTEgOiBJU19TT01FIHx8IElTX0VWRVJZID8gSVNfRVZFUlkgOiB0YXJnZXQ7XG4gIH07XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgLy8gYEFycmF5LnByb3RvdHlwZS5mb3JFYWNoYCBtZXRob2RcbiAgLy8gaHR0cHM6Ly90YzM5LmdpdGh1Yi5pby9lY21hMjYyLyNzZWMtYXJyYXkucHJvdG90eXBlLmZvcmVhY2hcbiAgZm9yRWFjaDogY3JlYXRlTWV0aG9kKDApLFxuICAvLyBgQXJyYXkucHJvdG90eXBlLm1hcGAgbWV0aG9kXG4gIC8vIGh0dHBzOi8vdGMzOS5naXRodWIuaW8vZWNtYTI2Mi8jc2VjLWFycmF5LnByb3RvdHlwZS5tYXBcbiAgbWFwOiBjcmVhdGVNZXRob2QoMSksXG4gIC8vIGBBcnJheS5wcm90b3R5cGUuZmlsdGVyYCBtZXRob2RcbiAgLy8gaHR0cHM6Ly90YzM5LmdpdGh1Yi5pby9lY21hMjYyLyNzZWMtYXJyYXkucHJvdG90eXBlLmZpbHRlclxuICBmaWx0ZXI6IGNyZWF0ZU1ldGhvZCgyKSxcbiAgLy8gYEFycmF5LnByb3RvdHlwZS5zb21lYCBtZXRob2RcbiAgLy8gaHR0cHM6Ly90YzM5LmdpdGh1Yi5pby9lY21hMjYyLyNzZWMtYXJyYXkucHJvdG90eXBlLnNvbWVcbiAgc29tZTogY3JlYXRlTWV0aG9kKDMpLFxuICAvLyBgQXJyYXkucHJvdG90eXBlLmV2ZXJ5YCBtZXRob2RcbiAgLy8gaHR0cHM6Ly90YzM5LmdpdGh1Yi5pby9lY21hMjYyLyNzZWMtYXJyYXkucHJvdG90eXBlLmV2ZXJ5XG4gIGV2ZXJ5OiBjcmVhdGVNZXRob2QoNCksXG4gIC8vIGBBcnJheS5wcm90b3R5cGUuZmluZGAgbWV0aG9kXG4gIC8vIGh0dHBzOi8vdGMzOS5naXRodWIuaW8vZWNtYTI2Mi8jc2VjLWFycmF5LnByb3RvdHlwZS5maW5kXG4gIGZpbmQ6IGNyZWF0ZU1ldGhvZCg1KSxcbiAgLy8gYEFycmF5LnByb3RvdHlwZS5maW5kSW5kZXhgIG1ldGhvZFxuICAvLyBodHRwczovL3RjMzkuZ2l0aHViLmlvL2VjbWEyNjIvI3NlYy1hcnJheS5wcm90b3R5cGUuZmluZEluZGV4XG4gIGZpbmRJbmRleDogY3JlYXRlTWV0aG9kKDYpXG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xudmFyIGZhaWxzID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2ZhaWxzJyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKE1FVEhPRF9OQU1FLCBhcmd1bWVudCkge1xuICB2YXIgbWV0aG9kID0gW11bTUVUSE9EX05BTUVdO1xuICByZXR1cm4gIW1ldGhvZCB8fCAhZmFpbHMoZnVuY3Rpb24gKCkge1xuICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby11c2VsZXNzLWNhbGwsbm8tdGhyb3ctbGl0ZXJhbFxuICAgIG1ldGhvZC5jYWxsKG51bGwsIGFyZ3VtZW50IHx8IGZ1bmN0aW9uICgpIHsgdGhyb3cgMTsgfSwgMSk7XG4gIH0pO1xufTtcbiIsIid1c2Ugc3RyaWN0JztcbnZhciAkZm9yRWFjaCA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9hcnJheS1pdGVyYXRpb24nKS5mb3JFYWNoO1xudmFyIHNsb3BweUFycmF5TWV0aG9kID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL3Nsb3BweS1hcnJheS1tZXRob2QnKTtcblxuLy8gYEFycmF5LnByb3RvdHlwZS5mb3JFYWNoYCBtZXRob2QgaW1wbGVtZW50YXRpb25cbi8vIGh0dHBzOi8vdGMzOS5naXRodWIuaW8vZWNtYTI2Mi8jc2VjLWFycmF5LnByb3RvdHlwZS5mb3JlYWNoXG5tb2R1bGUuZXhwb3J0cyA9IHNsb3BweUFycmF5TWV0aG9kKCdmb3JFYWNoJykgPyBmdW5jdGlvbiBmb3JFYWNoKGNhbGxiYWNrZm4gLyogLCB0aGlzQXJnICovKSB7XG4gIHJldHVybiAkZm9yRWFjaCh0aGlzLCBjYWxsYmFja2ZuLCBhcmd1bWVudHMubGVuZ3RoID4gMSA/IGFyZ3VtZW50c1sxXSA6IHVuZGVmaW5lZCk7XG59IDogW10uZm9yRWFjaDtcbiIsIid1c2Ugc3RyaWN0JztcbnZhciAkID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2V4cG9ydCcpO1xudmFyIGZvckVhY2ggPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvYXJyYXktZm9yLWVhY2gnKTtcblxuLy8gYEFycmF5LnByb3RvdHlwZS5mb3JFYWNoYCBtZXRob2Rcbi8vIGh0dHBzOi8vdGMzOS5naXRodWIuaW8vZWNtYTI2Mi8jc2VjLWFycmF5LnByb3RvdHlwZS5mb3JlYWNoXG4kKHsgdGFyZ2V0OiAnQXJyYXknLCBwcm90bzogdHJ1ZSwgZm9yY2VkOiBbXS5mb3JFYWNoICE9IGZvckVhY2ggfSwge1xuICBmb3JFYWNoOiBmb3JFYWNoXG59KTtcbiIsIi8vIGl0ZXJhYmxlIERPTSBjb2xsZWN0aW9uc1xuLy8gZmxhZyAtIGBpdGVyYWJsZWAgaW50ZXJmYWNlIC0gJ2VudHJpZXMnLCAna2V5cycsICd2YWx1ZXMnLCAnZm9yRWFjaCcgbWV0aG9kc1xubW9kdWxlLmV4cG9ydHMgPSB7XG4gIENTU1J1bGVMaXN0OiAwLFxuICBDU1NTdHlsZURlY2xhcmF0aW9uOiAwLFxuICBDU1NWYWx1ZUxpc3Q6IDAsXG4gIENsaWVudFJlY3RMaXN0OiAwLFxuICBET01SZWN0TGlzdDogMCxcbiAgRE9NU3RyaW5nTGlzdDogMCxcbiAgRE9NVG9rZW5MaXN0OiAxLFxuICBEYXRhVHJhbnNmZXJJdGVtTGlzdDogMCxcbiAgRmlsZUxpc3Q6IDAsXG4gIEhUTUxBbGxDb2xsZWN0aW9uOiAwLFxuICBIVE1MQ29sbGVjdGlvbjogMCxcbiAgSFRNTEZvcm1FbGVtZW50OiAwLFxuICBIVE1MU2VsZWN0RWxlbWVudDogMCxcbiAgTWVkaWFMaXN0OiAwLFxuICBNaW1lVHlwZUFycmF5OiAwLFxuICBOYW1lZE5vZGVNYXA6IDAsXG4gIE5vZGVMaXN0OiAxLFxuICBQYWludFJlcXVlc3RMaXN0OiAwLFxuICBQbHVnaW46IDAsXG4gIFBsdWdpbkFycmF5OiAwLFxuICBTVkdMZW5ndGhMaXN0OiAwLFxuICBTVkdOdW1iZXJMaXN0OiAwLFxuICBTVkdQYXRoU2VnTGlzdDogMCxcbiAgU1ZHUG9pbnRMaXN0OiAwLFxuICBTVkdTdHJpbmdMaXN0OiAwLFxuICBTVkdUcmFuc2Zvcm1MaXN0OiAwLFxuICBTb3VyY2VCdWZmZXJMaXN0OiAwLFxuICBTdHlsZVNoZWV0TGlzdDogMCxcbiAgVGV4dFRyYWNrQ3VlTGlzdDogMCxcbiAgVGV4dFRyYWNrTGlzdDogMCxcbiAgVG91Y2hMaXN0OiAwXG59O1xuIiwidmFyIGdsb2JhbCA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9nbG9iYWwnKTtcbnZhciBET01JdGVyYWJsZXMgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvZG9tLWl0ZXJhYmxlcycpO1xudmFyIGZvckVhY2ggPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvYXJyYXktZm9yLWVhY2gnKTtcbnZhciBjcmVhdGVOb25FbnVtZXJhYmxlUHJvcGVydHkgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvY3JlYXRlLW5vbi1lbnVtZXJhYmxlLXByb3BlcnR5Jyk7XG5cbmZvciAodmFyIENPTExFQ1RJT05fTkFNRSBpbiBET01JdGVyYWJsZXMpIHtcbiAgdmFyIENvbGxlY3Rpb24gPSBnbG9iYWxbQ09MTEVDVElPTl9OQU1FXTtcbiAgdmFyIENvbGxlY3Rpb25Qcm90b3R5cGUgPSBDb2xsZWN0aW9uICYmIENvbGxlY3Rpb24ucHJvdG90eXBlO1xuICAvLyBzb21lIENocm9tZSB2ZXJzaW9ucyBoYXZlIG5vbi1jb25maWd1cmFibGUgbWV0aG9kcyBvbiBET01Ub2tlbkxpc3RcbiAgaWYgKENvbGxlY3Rpb25Qcm90b3R5cGUgJiYgQ29sbGVjdGlvblByb3RvdHlwZS5mb3JFYWNoICE9PSBmb3JFYWNoKSB0cnkge1xuICAgIGNyZWF0ZU5vbkVudW1lcmFibGVQcm9wZXJ0eShDb2xsZWN0aW9uUHJvdG90eXBlLCAnZm9yRWFjaCcsIGZvckVhY2gpO1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIENvbGxlY3Rpb25Qcm90b3R5cGUuZm9yRWFjaCA9IGZvckVhY2g7XG4gIH1cbn1cbiIsIi8qISBucG0uaW0vb2JqZWN0LWZpdC1pbWFnZXMgMy4yLjQgKi9cbid1c2Ugc3RyaWN0JztcblxudmFyIE9GSSA9ICdiZnJlZC1pdDpvYmplY3QtZml0LWltYWdlcyc7XG52YXIgcHJvcFJlZ2V4ID0gLyhvYmplY3QtZml0fG9iamVjdC1wb3NpdGlvbilcXHMqOlxccyooWy0uXFx3XFxzJV0rKS9nO1xudmFyIHRlc3RJbWcgPSB0eXBlb2YgSW1hZ2UgPT09ICd1bmRlZmluZWQnID8ge3N0eWxlOiB7J29iamVjdC1wb3NpdGlvbic6IDF9fSA6IG5ldyBJbWFnZSgpO1xudmFyIHN1cHBvcnRzT2JqZWN0Rml0ID0gJ29iamVjdC1maXQnIGluIHRlc3RJbWcuc3R5bGU7XG52YXIgc3VwcG9ydHNPYmplY3RQb3NpdGlvbiA9ICdvYmplY3QtcG9zaXRpb24nIGluIHRlc3RJbWcuc3R5bGU7XG52YXIgc3VwcG9ydHNPRkkgPSAnYmFja2dyb3VuZC1zaXplJyBpbiB0ZXN0SW1nLnN0eWxlO1xudmFyIHN1cHBvcnRzQ3VycmVudFNyYyA9IHR5cGVvZiB0ZXN0SW1nLmN1cnJlbnRTcmMgPT09ICdzdHJpbmcnO1xudmFyIG5hdGl2ZUdldEF0dHJpYnV0ZSA9IHRlc3RJbWcuZ2V0QXR0cmlidXRlO1xudmFyIG5hdGl2ZVNldEF0dHJpYnV0ZSA9IHRlc3RJbWcuc2V0QXR0cmlidXRlO1xudmFyIGF1dG9Nb2RlRW5hYmxlZCA9IGZhbHNlO1xuXG5mdW5jdGlvbiBjcmVhdGVQbGFjZWhvbGRlcih3LCBoKSB7XG5cdHJldHVybiAoXCJkYXRhOmltYWdlL3N2Zyt4bWwsJTNDc3ZnIHhtbG5zPSdodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Zycgd2lkdGg9J1wiICsgdyArIFwiJyBoZWlnaHQ9J1wiICsgaCArIFwiJyUzRSUzQy9zdmclM0VcIik7XG59XG5cbmZ1bmN0aW9uIHBvbHlmaWxsQ3VycmVudFNyYyhlbCkge1xuXHRpZiAoZWwuc3Jjc2V0ICYmICFzdXBwb3J0c0N1cnJlbnRTcmMgJiYgd2luZG93LnBpY3R1cmVmaWxsKSB7XG5cdFx0dmFyIHBmID0gd2luZG93LnBpY3R1cmVmaWxsLl87XG5cdFx0Ly8gcGFyc2Ugc3Jjc2V0IHdpdGggcGljdHVyZWZpbGwgd2hlcmUgY3VycmVudFNyYyBpc24ndCBhdmFpbGFibGVcblx0XHRpZiAoIWVsW3BmLm5zXSB8fCAhZWxbcGYubnNdLmV2YWxlZCkge1xuXHRcdFx0Ly8gZm9yY2Ugc3luY2hyb25vdXMgc3Jjc2V0IHBhcnNpbmdcblx0XHRcdHBmLmZpbGxJbWcoZWwsIHtyZXNlbGVjdDogdHJ1ZX0pO1xuXHRcdH1cblxuXHRcdGlmICghZWxbcGYubnNdLmN1clNyYykge1xuXHRcdFx0Ly8gZm9yY2UgcGljdHVyZWZpbGwgdG8gcGFyc2Ugc3Jjc2V0XG5cdFx0XHRlbFtwZi5uc10uc3VwcG9ydGVkID0gZmFsc2U7XG5cdFx0XHRwZi5maWxsSW1nKGVsLCB7cmVzZWxlY3Q6IHRydWV9KTtcblx0XHR9XG5cblx0XHQvLyByZXRyaWV2ZSBwYXJzZWQgY3VycmVudFNyYywgaWYgYW55XG5cdFx0ZWwuY3VycmVudFNyYyA9IGVsW3BmLm5zXS5jdXJTcmMgfHwgZWwuc3JjO1xuXHR9XG59XG5cbmZ1bmN0aW9uIGdldFN0eWxlKGVsKSB7XG5cdHZhciBzdHlsZSA9IGdldENvbXB1dGVkU3R5bGUoZWwpLmZvbnRGYW1pbHk7XG5cdHZhciBwYXJzZWQ7XG5cdHZhciBwcm9wcyA9IHt9O1xuXHR3aGlsZSAoKHBhcnNlZCA9IHByb3BSZWdleC5leGVjKHN0eWxlKSkgIT09IG51bGwpIHtcblx0XHRwcm9wc1twYXJzZWRbMV1dID0gcGFyc2VkWzJdO1xuXHR9XG5cdHJldHVybiBwcm9wcztcbn1cblxuZnVuY3Rpb24gc2V0UGxhY2Vob2xkZXIoaW1nLCB3aWR0aCwgaGVpZ2h0KSB7XG5cdC8vIERlZmF1bHQ6IGZpbGwgd2lkdGgsIG5vIGhlaWdodFxuXHR2YXIgcGxhY2Vob2xkZXIgPSBjcmVhdGVQbGFjZWhvbGRlcih3aWR0aCB8fCAxLCBoZWlnaHQgfHwgMCk7XG5cblx0Ly8gT25seSBzZXQgcGxhY2Vob2xkZXIgaWYgaXQncyBkaWZmZXJlbnRcblx0aWYgKG5hdGl2ZUdldEF0dHJpYnV0ZS5jYWxsKGltZywgJ3NyYycpICE9PSBwbGFjZWhvbGRlcikge1xuXHRcdG5hdGl2ZVNldEF0dHJpYnV0ZS5jYWxsKGltZywgJ3NyYycsIHBsYWNlaG9sZGVyKTtcblx0fVxufVxuXG5mdW5jdGlvbiBvbkltYWdlUmVhZHkoaW1nLCBjYWxsYmFjaykge1xuXHQvLyBuYXR1cmFsV2lkdGggaXMgb25seSBhdmFpbGFibGUgd2hlbiB0aGUgaW1hZ2UgaGVhZGVycyBhcmUgbG9hZGVkLFxuXHQvLyB0aGlzIGxvb3Agd2lsbCBwb2xsIGl0IGV2ZXJ5IDEwMG1zLlxuXHRpZiAoaW1nLm5hdHVyYWxXaWR0aCkge1xuXHRcdGNhbGxiYWNrKGltZyk7XG5cdH0gZWxzZSB7XG5cdFx0c2V0VGltZW91dChvbkltYWdlUmVhZHksIDEwMCwgaW1nLCBjYWxsYmFjayk7XG5cdH1cbn1cblxuZnVuY3Rpb24gZml4T25lKGVsKSB7XG5cdHZhciBzdHlsZSA9IGdldFN0eWxlKGVsKTtcblx0dmFyIG9maSA9IGVsW09GSV07XG5cdHN0eWxlWydvYmplY3QtZml0J10gPSBzdHlsZVsnb2JqZWN0LWZpdCddIHx8ICdmaWxsJzsgLy8gZGVmYXVsdCB2YWx1ZVxuXG5cdC8vIEF2b2lkIHJ1bm5pbmcgd2hlcmUgdW5uZWNlc3NhcnksIHVubGVzcyBPRkkgaGFkIGFscmVhZHkgZG9uZSBpdHMgZGVlZFxuXHRpZiAoIW9maS5pbWcpIHtcblx0XHQvLyBmaWxsIGlzIHRoZSBkZWZhdWx0IGJlaGF2aW9yIHNvIG5vIGFjdGlvbiBpcyBuZWNlc3Nhcnlcblx0XHRpZiAoc3R5bGVbJ29iamVjdC1maXQnXSA9PT0gJ2ZpbGwnKSB7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0Ly8gV2hlcmUgb2JqZWN0LWZpdCBpcyBzdXBwb3J0ZWQgYW5kIG9iamVjdC1wb3NpdGlvbiBpc24ndCAoU2FmYXJpIDwgMTApXG5cdFx0aWYgKFxuXHRcdFx0IW9maS5za2lwVGVzdCAmJiAvLyB1bmxlc3MgdXNlciB3YW50cyB0byBhcHBseSByZWdhcmRsZXNzIG9mIGJyb3dzZXIgc3VwcG9ydFxuXHRcdFx0c3VwcG9ydHNPYmplY3RGaXQgJiYgLy8gaWYgYnJvd3NlciBhbHJlYWR5IHN1cHBvcnRzIG9iamVjdC1maXRcblx0XHRcdCFzdHlsZVsnb2JqZWN0LXBvc2l0aW9uJ10gLy8gdW5sZXNzIG9iamVjdC1wb3NpdGlvbiBpcyB1c2VkXG5cdFx0KSB7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXHR9XG5cblx0Ly8ga2VlcCBhIGNsb25lIGluIG1lbW9yeSB3aGlsZSByZXNldHRpbmcgdGhlIG9yaWdpbmFsIHRvIGEgYmxhbmtcblx0aWYgKCFvZmkuaW1nKSB7XG5cdFx0b2ZpLmltZyA9IG5ldyBJbWFnZShlbC53aWR0aCwgZWwuaGVpZ2h0KTtcblx0XHRvZmkuaW1nLnNyY3NldCA9IG5hdGl2ZUdldEF0dHJpYnV0ZS5jYWxsKGVsLCBcImRhdGEtb2ZpLXNyY3NldFwiKSB8fCBlbC5zcmNzZXQ7XG5cdFx0b2ZpLmltZy5zcmMgPSBuYXRpdmVHZXRBdHRyaWJ1dGUuY2FsbChlbCwgXCJkYXRhLW9maS1zcmNcIikgfHwgZWwuc3JjO1xuXG5cdFx0Ly8gcHJlc2VydmUgZm9yIGFueSBmdXR1cmUgY2xvbmVOb2RlIGNhbGxzXG5cdFx0Ly8gaHR0cHM6Ly9naXRodWIuY29tL2JmcmVkLWl0L29iamVjdC1maXQtaW1hZ2VzL2lzc3Vlcy81M1xuXHRcdG5hdGl2ZVNldEF0dHJpYnV0ZS5jYWxsKGVsLCBcImRhdGEtb2ZpLXNyY1wiLCBlbC5zcmMpO1xuXHRcdGlmIChlbC5zcmNzZXQpIHtcblx0XHRcdG5hdGl2ZVNldEF0dHJpYnV0ZS5jYWxsKGVsLCBcImRhdGEtb2ZpLXNyY3NldFwiLCBlbC5zcmNzZXQpO1xuXHRcdH1cblxuXHRcdHNldFBsYWNlaG9sZGVyKGVsLCBlbC5uYXR1cmFsV2lkdGggfHwgZWwud2lkdGgsIGVsLm5hdHVyYWxIZWlnaHQgfHwgZWwuaGVpZ2h0KTtcblxuXHRcdC8vIHJlbW92ZSBzcmNzZXQgYmVjYXVzZSBpdCBvdmVycmlkZXMgc3JjXG5cdFx0aWYgKGVsLnNyY3NldCkge1xuXHRcdFx0ZWwuc3Jjc2V0ID0gJyc7XG5cdFx0fVxuXHRcdHRyeSB7XG5cdFx0XHRrZWVwU3JjVXNhYmxlKGVsKTtcblx0XHR9IGNhdGNoIChlcnIpIHtcblx0XHRcdGlmICh3aW5kb3cuY29uc29sZSkge1xuXHRcdFx0XHRjb25zb2xlLndhcm4oJ2h0dHBzOi8vYml0Lmx5L29maS1vbGQtYnJvd3NlcicpO1xuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdHBvbHlmaWxsQ3VycmVudFNyYyhvZmkuaW1nKTtcblxuXHRlbC5zdHlsZS5iYWNrZ3JvdW5kSW1hZ2UgPSBcInVybChcXFwiXCIgKyAoKG9maS5pbWcuY3VycmVudFNyYyB8fCBvZmkuaW1nLnNyYykucmVwbGFjZSgvXCIvZywgJ1xcXFxcIicpKSArIFwiXFxcIilcIjtcblx0ZWwuc3R5bGUuYmFja2dyb3VuZFBvc2l0aW9uID0gc3R5bGVbJ29iamVjdC1wb3NpdGlvbiddIHx8ICdjZW50ZXInO1xuXHRlbC5zdHlsZS5iYWNrZ3JvdW5kUmVwZWF0ID0gJ25vLXJlcGVhdCc7XG5cdGVsLnN0eWxlLmJhY2tncm91bmRPcmlnaW4gPSAnY29udGVudC1ib3gnO1xuXG5cdGlmICgvc2NhbGUtZG93bi8udGVzdChzdHlsZVsnb2JqZWN0LWZpdCddKSkge1xuXHRcdG9uSW1hZ2VSZWFkeShvZmkuaW1nLCBmdW5jdGlvbiAoKSB7XG5cdFx0XHRpZiAob2ZpLmltZy5uYXR1cmFsV2lkdGggPiBlbC53aWR0aCB8fCBvZmkuaW1nLm5hdHVyYWxIZWlnaHQgPiBlbC5oZWlnaHQpIHtcblx0XHRcdFx0ZWwuc3R5bGUuYmFja2dyb3VuZFNpemUgPSAnY29udGFpbic7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRlbC5zdHlsZS5iYWNrZ3JvdW5kU2l6ZSA9ICdhdXRvJztcblx0XHRcdH1cblx0XHR9KTtcblx0fSBlbHNlIHtcblx0XHRlbC5zdHlsZS5iYWNrZ3JvdW5kU2l6ZSA9IHN0eWxlWydvYmplY3QtZml0J10ucmVwbGFjZSgnbm9uZScsICdhdXRvJykucmVwbGFjZSgnZmlsbCcsICcxMDAlIDEwMCUnKTtcblx0fVxuXG5cdG9uSW1hZ2VSZWFkeShvZmkuaW1nLCBmdW5jdGlvbiAoaW1nKSB7XG5cdFx0c2V0UGxhY2Vob2xkZXIoZWwsIGltZy5uYXR1cmFsV2lkdGgsIGltZy5uYXR1cmFsSGVpZ2h0KTtcblx0fSk7XG59XG5cbmZ1bmN0aW9uIGtlZXBTcmNVc2FibGUoZWwpIHtcblx0dmFyIGRlc2NyaXB0b3JzID0ge1xuXHRcdGdldDogZnVuY3Rpb24gZ2V0KHByb3ApIHtcblx0XHRcdHJldHVybiBlbFtPRkldLmltZ1twcm9wID8gcHJvcCA6ICdzcmMnXTtcblx0XHR9LFxuXHRcdHNldDogZnVuY3Rpb24gc2V0KHZhbHVlLCBwcm9wKSB7XG5cdFx0XHRlbFtPRkldLmltZ1twcm9wID8gcHJvcCA6ICdzcmMnXSA9IHZhbHVlO1xuXHRcdFx0bmF0aXZlU2V0QXR0cmlidXRlLmNhbGwoZWwsIChcImRhdGEtb2ZpLVwiICsgcHJvcCksIHZhbHVlKTsgLy8gcHJlc2VydmUgZm9yIGFueSBmdXR1cmUgY2xvbmVOb2RlXG5cdFx0XHRmaXhPbmUoZWwpO1xuXHRcdFx0cmV0dXJuIHZhbHVlO1xuXHRcdH1cblx0fTtcblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGVsLCAnc3JjJywgZGVzY3JpcHRvcnMpO1xuXHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZWwsICdjdXJyZW50U3JjJywge1xuXHRcdGdldDogZnVuY3Rpb24gKCkgeyByZXR1cm4gZGVzY3JpcHRvcnMuZ2V0KCdjdXJyZW50U3JjJyk7IH1cblx0fSk7XG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShlbCwgJ3NyY3NldCcsIHtcblx0XHRnZXQ6IGZ1bmN0aW9uICgpIHsgcmV0dXJuIGRlc2NyaXB0b3JzLmdldCgnc3Jjc2V0Jyk7IH0sXG5cdFx0c2V0OiBmdW5jdGlvbiAoc3MpIHsgcmV0dXJuIGRlc2NyaXB0b3JzLnNldChzcywgJ3NyY3NldCcpOyB9XG5cdH0pO1xufVxuXG5mdW5jdGlvbiBoaWphY2tBdHRyaWJ1dGVzKCkge1xuXHRmdW5jdGlvbiBnZXRPZmlJbWFnZU1heWJlKGVsLCBuYW1lKSB7XG5cdFx0cmV0dXJuIGVsW09GSV0gJiYgZWxbT0ZJXS5pbWcgJiYgKG5hbWUgPT09ICdzcmMnIHx8IG5hbWUgPT09ICdzcmNzZXQnKSA/IGVsW09GSV0uaW1nIDogZWw7XG5cdH1cblx0aWYgKCFzdXBwb3J0c09iamVjdFBvc2l0aW9uKSB7XG5cdFx0SFRNTEltYWdlRWxlbWVudC5wcm90b3R5cGUuZ2V0QXR0cmlidXRlID0gZnVuY3Rpb24gKG5hbWUpIHtcblx0XHRcdHJldHVybiBuYXRpdmVHZXRBdHRyaWJ1dGUuY2FsbChnZXRPZmlJbWFnZU1heWJlKHRoaXMsIG5hbWUpLCBuYW1lKTtcblx0XHR9O1xuXG5cdFx0SFRNTEltYWdlRWxlbWVudC5wcm90b3R5cGUuc2V0QXR0cmlidXRlID0gZnVuY3Rpb24gKG5hbWUsIHZhbHVlKSB7XG5cdFx0XHRyZXR1cm4gbmF0aXZlU2V0QXR0cmlidXRlLmNhbGwoZ2V0T2ZpSW1hZ2VNYXliZSh0aGlzLCBuYW1lKSwgbmFtZSwgU3RyaW5nKHZhbHVlKSk7XG5cdFx0fTtcblx0fVxufVxuXG5mdW5jdGlvbiBmaXgoaW1ncywgb3B0cykge1xuXHR2YXIgc3RhcnRBdXRvTW9kZSA9ICFhdXRvTW9kZUVuYWJsZWQgJiYgIWltZ3M7XG5cdG9wdHMgPSBvcHRzIHx8IHt9O1xuXHRpbWdzID0gaW1ncyB8fCAnaW1nJztcblxuXHRpZiAoKHN1cHBvcnRzT2JqZWN0UG9zaXRpb24gJiYgIW9wdHMuc2tpcFRlc3QpIHx8ICFzdXBwb3J0c09GSSkge1xuXHRcdHJldHVybiBmYWxzZTtcblx0fVxuXG5cdC8vIHVzZSBpbWdzIGFzIGEgc2VsZWN0b3Igb3IganVzdCBzZWxlY3QgYWxsIGltYWdlc1xuXHRpZiAoaW1ncyA9PT0gJ2ltZycpIHtcblx0XHRpbWdzID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ2ltZycpO1xuXHR9IGVsc2UgaWYgKHR5cGVvZiBpbWdzID09PSAnc3RyaW5nJykge1xuXHRcdGltZ3MgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKGltZ3MpO1xuXHR9IGVsc2UgaWYgKCEoJ2xlbmd0aCcgaW4gaW1ncykpIHtcblx0XHRpbWdzID0gW2ltZ3NdO1xuXHR9XG5cblx0Ly8gYXBwbHkgZml4IHRvIGFsbFxuXHRmb3IgKHZhciBpID0gMDsgaSA8IGltZ3MubGVuZ3RoOyBpKyspIHtcblx0XHRpbWdzW2ldW09GSV0gPSBpbWdzW2ldW09GSV0gfHwge1xuXHRcdFx0c2tpcFRlc3Q6IG9wdHMuc2tpcFRlc3Rcblx0XHR9O1xuXHRcdGZpeE9uZShpbWdzW2ldKTtcblx0fVxuXG5cdGlmIChzdGFydEF1dG9Nb2RlKSB7XG5cdFx0ZG9jdW1lbnQuYm9keS5hZGRFdmVudExpc3RlbmVyKCdsb2FkJywgZnVuY3Rpb24gKGUpIHtcblx0XHRcdGlmIChlLnRhcmdldC50YWdOYW1lID09PSAnSU1HJykge1xuXHRcdFx0XHRmaXgoZS50YXJnZXQsIHtcblx0XHRcdFx0XHRza2lwVGVzdDogb3B0cy5za2lwVGVzdFxuXHRcdFx0XHR9KTtcblx0XHRcdH1cblx0XHR9LCB0cnVlKTtcblx0XHRhdXRvTW9kZUVuYWJsZWQgPSB0cnVlO1xuXHRcdGltZ3MgPSAnaW1nJzsgLy8gcmVzZXQgdG8gYSBnZW5lcmljIHNlbGVjdG9yIGZvciB3YXRjaE1RXG5cdH1cblxuXHQvLyBpZiByZXF1ZXN0ZWQsIHdhdGNoIG1lZGlhIHF1ZXJpZXMgZm9yIG9iamVjdC1maXQgY2hhbmdlXG5cdGlmIChvcHRzLndhdGNoTVEpIHtcblx0XHR3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigncmVzaXplJywgZml4LmJpbmQobnVsbCwgaW1ncywge1xuXHRcdFx0c2tpcFRlc3Q6IG9wdHMuc2tpcFRlc3Rcblx0XHR9KSk7XG5cdH1cbn1cblxuZml4LnN1cHBvcnRzT2JqZWN0Rml0ID0gc3VwcG9ydHNPYmplY3RGaXQ7XG5maXguc3VwcG9ydHNPYmplY3RQb3NpdGlvbiA9IHN1cHBvcnRzT2JqZWN0UG9zaXRpb247XG5cbmhpamFja0F0dHJpYnV0ZXMoKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmaXg7XG4iLCIvKipcbiAqIEV2RW1pdHRlciB2MS4xLjBcbiAqIExpbCcgZXZlbnQgZW1pdHRlclxuICogTUlUIExpY2Vuc2VcbiAqL1xuXG4vKiBqc2hpbnQgdW51c2VkOiB0cnVlLCB1bmRlZjogdHJ1ZSwgc3RyaWN0OiB0cnVlICovXG5cbiggZnVuY3Rpb24oIGdsb2JhbCwgZmFjdG9yeSApIHtcbiAgLy8gdW5pdmVyc2FsIG1vZHVsZSBkZWZpbml0aW9uXG4gIC8qIGpzaGludCBzdHJpY3Q6IGZhbHNlICovIC8qIGdsb2JhbHMgZGVmaW5lLCBtb2R1bGUsIHdpbmRvdyAqL1xuICBpZiAoIHR5cGVvZiBkZWZpbmUgPT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kICkge1xuICAgIC8vIEFNRCAtIFJlcXVpcmVKU1xuICAgIGRlZmluZSggZmFjdG9yeSApO1xuICB9IGVsc2UgaWYgKCB0eXBlb2YgbW9kdWxlID09ICdvYmplY3QnICYmIG1vZHVsZS5leHBvcnRzICkge1xuICAgIC8vIENvbW1vbkpTIC0gQnJvd3NlcmlmeSwgV2VicGFja1xuICAgIG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeSgpO1xuICB9IGVsc2Uge1xuICAgIC8vIEJyb3dzZXIgZ2xvYmFsc1xuICAgIGdsb2JhbC5FdkVtaXR0ZXIgPSBmYWN0b3J5KCk7XG4gIH1cblxufSggdHlwZW9mIHdpbmRvdyAhPSAndW5kZWZpbmVkJyA/IHdpbmRvdyA6IHRoaXMsIGZ1bmN0aW9uKCkge1xuXG5cInVzZSBzdHJpY3RcIjtcblxuZnVuY3Rpb24gRXZFbWl0dGVyKCkge31cblxudmFyIHByb3RvID0gRXZFbWl0dGVyLnByb3RvdHlwZTtcblxucHJvdG8ub24gPSBmdW5jdGlvbiggZXZlbnROYW1lLCBsaXN0ZW5lciApIHtcbiAgaWYgKCAhZXZlbnROYW1lIHx8ICFsaXN0ZW5lciApIHtcbiAgICByZXR1cm47XG4gIH1cbiAgLy8gc2V0IGV2ZW50cyBoYXNoXG4gIHZhciBldmVudHMgPSB0aGlzLl9ldmVudHMgPSB0aGlzLl9ldmVudHMgfHwge307XG4gIC8vIHNldCBsaXN0ZW5lcnMgYXJyYXlcbiAgdmFyIGxpc3RlbmVycyA9IGV2ZW50c1sgZXZlbnROYW1lIF0gPSBldmVudHNbIGV2ZW50TmFtZSBdIHx8IFtdO1xuICAvLyBvbmx5IGFkZCBvbmNlXG4gIGlmICggbGlzdGVuZXJzLmluZGV4T2YoIGxpc3RlbmVyICkgPT0gLTEgKSB7XG4gICAgbGlzdGVuZXJzLnB1c2goIGxpc3RlbmVyICk7XG4gIH1cblxuICByZXR1cm4gdGhpcztcbn07XG5cbnByb3RvLm9uY2UgPSBmdW5jdGlvbiggZXZlbnROYW1lLCBsaXN0ZW5lciApIHtcbiAgaWYgKCAhZXZlbnROYW1lIHx8ICFsaXN0ZW5lciApIHtcbiAgICByZXR1cm47XG4gIH1cbiAgLy8gYWRkIGV2ZW50XG4gIHRoaXMub24oIGV2ZW50TmFtZSwgbGlzdGVuZXIgKTtcbiAgLy8gc2V0IG9uY2UgZmxhZ1xuICAvLyBzZXQgb25jZUV2ZW50cyBoYXNoXG4gIHZhciBvbmNlRXZlbnRzID0gdGhpcy5fb25jZUV2ZW50cyA9IHRoaXMuX29uY2VFdmVudHMgfHwge307XG4gIC8vIHNldCBvbmNlTGlzdGVuZXJzIG9iamVjdFxuICB2YXIgb25jZUxpc3RlbmVycyA9IG9uY2VFdmVudHNbIGV2ZW50TmFtZSBdID0gb25jZUV2ZW50c1sgZXZlbnROYW1lIF0gfHwge307XG4gIC8vIHNldCBmbGFnXG4gIG9uY2VMaXN0ZW5lcnNbIGxpc3RlbmVyIF0gPSB0cnVlO1xuXG4gIHJldHVybiB0aGlzO1xufTtcblxucHJvdG8ub2ZmID0gZnVuY3Rpb24oIGV2ZW50TmFtZSwgbGlzdGVuZXIgKSB7XG4gIHZhciBsaXN0ZW5lcnMgPSB0aGlzLl9ldmVudHMgJiYgdGhpcy5fZXZlbnRzWyBldmVudE5hbWUgXTtcbiAgaWYgKCAhbGlzdGVuZXJzIHx8ICFsaXN0ZW5lcnMubGVuZ3RoICkge1xuICAgIHJldHVybjtcbiAgfVxuICB2YXIgaW5kZXggPSBsaXN0ZW5lcnMuaW5kZXhPZiggbGlzdGVuZXIgKTtcbiAgaWYgKCBpbmRleCAhPSAtMSApIHtcbiAgICBsaXN0ZW5lcnMuc3BsaWNlKCBpbmRleCwgMSApO1xuICB9XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5wcm90by5lbWl0RXZlbnQgPSBmdW5jdGlvbiggZXZlbnROYW1lLCBhcmdzICkge1xuICB2YXIgbGlzdGVuZXJzID0gdGhpcy5fZXZlbnRzICYmIHRoaXMuX2V2ZW50c1sgZXZlbnROYW1lIF07XG4gIGlmICggIWxpc3RlbmVycyB8fCAhbGlzdGVuZXJzLmxlbmd0aCApIHtcbiAgICByZXR1cm47XG4gIH1cbiAgLy8gY29weSBvdmVyIHRvIGF2b2lkIGludGVyZmVyZW5jZSBpZiAub2ZmKCkgaW4gbGlzdGVuZXJcbiAgbGlzdGVuZXJzID0gbGlzdGVuZXJzLnNsaWNlKDApO1xuICBhcmdzID0gYXJncyB8fCBbXTtcbiAgLy8gb25jZSBzdHVmZlxuICB2YXIgb25jZUxpc3RlbmVycyA9IHRoaXMuX29uY2VFdmVudHMgJiYgdGhpcy5fb25jZUV2ZW50c1sgZXZlbnROYW1lIF07XG5cbiAgZm9yICggdmFyIGk9MDsgaSA8IGxpc3RlbmVycy5sZW5ndGg7IGkrKyApIHtcbiAgICB2YXIgbGlzdGVuZXIgPSBsaXN0ZW5lcnNbaV1cbiAgICB2YXIgaXNPbmNlID0gb25jZUxpc3RlbmVycyAmJiBvbmNlTGlzdGVuZXJzWyBsaXN0ZW5lciBdO1xuICAgIGlmICggaXNPbmNlICkge1xuICAgICAgLy8gcmVtb3ZlIGxpc3RlbmVyXG4gICAgICAvLyByZW1vdmUgYmVmb3JlIHRyaWdnZXIgdG8gcHJldmVudCByZWN1cnNpb25cbiAgICAgIHRoaXMub2ZmKCBldmVudE5hbWUsIGxpc3RlbmVyICk7XG4gICAgICAvLyB1bnNldCBvbmNlIGZsYWdcbiAgICAgIGRlbGV0ZSBvbmNlTGlzdGVuZXJzWyBsaXN0ZW5lciBdO1xuICAgIH1cbiAgICAvLyB0cmlnZ2VyIGxpc3RlbmVyXG4gICAgbGlzdGVuZXIuYXBwbHkoIHRoaXMsIGFyZ3MgKTtcbiAgfVxuXG4gIHJldHVybiB0aGlzO1xufTtcblxucHJvdG8uYWxsT2ZmID0gZnVuY3Rpb24oKSB7XG4gIGRlbGV0ZSB0aGlzLl9ldmVudHM7XG4gIGRlbGV0ZSB0aGlzLl9vbmNlRXZlbnRzO1xufTtcblxucmV0dXJuIEV2RW1pdHRlcjtcblxufSkpO1xuIiwiLyohXG4gKiBnZXRTaXplIHYyLjAuM1xuICogbWVhc3VyZSBzaXplIG9mIGVsZW1lbnRzXG4gKiBNSVQgbGljZW5zZVxuICovXG5cbi8qIGpzaGludCBicm93c2VyOiB0cnVlLCBzdHJpY3Q6IHRydWUsIHVuZGVmOiB0cnVlLCB1bnVzZWQ6IHRydWUgKi9cbi8qIGdsb2JhbHMgY29uc29sZTogZmFsc2UgKi9cblxuKCBmdW5jdGlvbiggd2luZG93LCBmYWN0b3J5ICkge1xuICAvKiBqc2hpbnQgc3RyaWN0OiBmYWxzZSAqLyAvKiBnbG9iYWxzIGRlZmluZSwgbW9kdWxlICovXG4gIGlmICggdHlwZW9mIGRlZmluZSA9PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQgKSB7XG4gICAgLy8gQU1EXG4gICAgZGVmaW5lKCBmYWN0b3J5ICk7XG4gIH0gZWxzZSBpZiAoIHR5cGVvZiBtb2R1bGUgPT0gJ29iamVjdCcgJiYgbW9kdWxlLmV4cG9ydHMgKSB7XG4gICAgLy8gQ29tbW9uSlNcbiAgICBtb2R1bGUuZXhwb3J0cyA9IGZhY3RvcnkoKTtcbiAgfSBlbHNlIHtcbiAgICAvLyBicm93c2VyIGdsb2JhbFxuICAgIHdpbmRvdy5nZXRTaXplID0gZmFjdG9yeSgpO1xuICB9XG5cbn0pKCB3aW5kb3csIGZ1bmN0aW9uIGZhY3RvcnkoKSB7XG4ndXNlIHN0cmljdCc7XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIGhlbHBlcnMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gLy9cblxuLy8gZ2V0IGEgbnVtYmVyIGZyb20gYSBzdHJpbmcsIG5vdCBhIHBlcmNlbnRhZ2VcbmZ1bmN0aW9uIGdldFN0eWxlU2l6ZSggdmFsdWUgKSB7XG4gIHZhciBudW0gPSBwYXJzZUZsb2F0KCB2YWx1ZSApO1xuICAvLyBub3QgYSBwZXJjZW50IGxpa2UgJzEwMCUnLCBhbmQgYSBudW1iZXJcbiAgdmFyIGlzVmFsaWQgPSB2YWx1ZS5pbmRleE9mKCclJykgPT0gLTEgJiYgIWlzTmFOKCBudW0gKTtcbiAgcmV0dXJuIGlzVmFsaWQgJiYgbnVtO1xufVxuXG5mdW5jdGlvbiBub29wKCkge31cblxudmFyIGxvZ0Vycm9yID0gdHlwZW9mIGNvbnNvbGUgPT0gJ3VuZGVmaW5lZCcgPyBub29wIDpcbiAgZnVuY3Rpb24oIG1lc3NhZ2UgKSB7XG4gICAgY29uc29sZS5lcnJvciggbWVzc2FnZSApO1xuICB9O1xuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSBtZWFzdXJlbWVudHMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gLy9cblxudmFyIG1lYXN1cmVtZW50cyA9IFtcbiAgJ3BhZGRpbmdMZWZ0JyxcbiAgJ3BhZGRpbmdSaWdodCcsXG4gICdwYWRkaW5nVG9wJyxcbiAgJ3BhZGRpbmdCb3R0b20nLFxuICAnbWFyZ2luTGVmdCcsXG4gICdtYXJnaW5SaWdodCcsXG4gICdtYXJnaW5Ub3AnLFxuICAnbWFyZ2luQm90dG9tJyxcbiAgJ2JvcmRlckxlZnRXaWR0aCcsXG4gICdib3JkZXJSaWdodFdpZHRoJyxcbiAgJ2JvcmRlclRvcFdpZHRoJyxcbiAgJ2JvcmRlckJvdHRvbVdpZHRoJ1xuXTtcblxudmFyIG1lYXN1cmVtZW50c0xlbmd0aCA9IG1lYXN1cmVtZW50cy5sZW5ndGg7XG5cbmZ1bmN0aW9uIGdldFplcm9TaXplKCkge1xuICB2YXIgc2l6ZSA9IHtcbiAgICB3aWR0aDogMCxcbiAgICBoZWlnaHQ6IDAsXG4gICAgaW5uZXJXaWR0aDogMCxcbiAgICBpbm5lckhlaWdodDogMCxcbiAgICBvdXRlcldpZHRoOiAwLFxuICAgIG91dGVySGVpZ2h0OiAwXG4gIH07XG4gIGZvciAoIHZhciBpPTA7IGkgPCBtZWFzdXJlbWVudHNMZW5ndGg7IGkrKyApIHtcbiAgICB2YXIgbWVhc3VyZW1lbnQgPSBtZWFzdXJlbWVudHNbaV07XG4gICAgc2l6ZVsgbWVhc3VyZW1lbnQgXSA9IDA7XG4gIH1cbiAgcmV0dXJuIHNpemU7XG59XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIGdldFN0eWxlIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIC8vXG5cbi8qKlxuICogZ2V0U3R5bGUsIGdldCBzdHlsZSBvZiBlbGVtZW50LCBjaGVjayBmb3IgRmlyZWZveCBidWdcbiAqIGh0dHBzOi8vYnVnemlsbGEubW96aWxsYS5vcmcvc2hvd19idWcuY2dpP2lkPTU0ODM5N1xuICovXG5mdW5jdGlvbiBnZXRTdHlsZSggZWxlbSApIHtcbiAgdmFyIHN0eWxlID0gZ2V0Q29tcHV0ZWRTdHlsZSggZWxlbSApO1xuICBpZiAoICFzdHlsZSApIHtcbiAgICBsb2dFcnJvciggJ1N0eWxlIHJldHVybmVkICcgKyBzdHlsZSArXG4gICAgICAnLiBBcmUgeW91IHJ1bm5pbmcgdGhpcyBjb2RlIGluIGEgaGlkZGVuIGlmcmFtZSBvbiBGaXJlZm94PyAnICtcbiAgICAgICdTZWUgaHR0cHM6Ly9iaXQubHkvZ2V0c2l6ZWJ1ZzEnICk7XG4gIH1cbiAgcmV0dXJuIHN0eWxlO1xufVxuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSBzZXR1cCAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSAvL1xuXG52YXIgaXNTZXR1cCA9IGZhbHNlO1xuXG52YXIgaXNCb3hTaXplT3V0ZXI7XG5cbi8qKlxuICogc2V0dXBcbiAqIGNoZWNrIGlzQm94U2l6ZXJPdXRlclxuICogZG8gb24gZmlyc3QgZ2V0U2l6ZSgpIHJhdGhlciB0aGFuIG9uIHBhZ2UgbG9hZCBmb3IgRmlyZWZveCBidWdcbiAqL1xuZnVuY3Rpb24gc2V0dXAoKSB7XG4gIC8vIHNldHVwIG9uY2VcbiAgaWYgKCBpc1NldHVwICkge1xuICAgIHJldHVybjtcbiAgfVxuICBpc1NldHVwID0gdHJ1ZTtcblxuICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSBib3ggc2l6aW5nIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIC8vXG5cbiAgLyoqXG4gICAqIENocm9tZSAmIFNhZmFyaSBtZWFzdXJlIHRoZSBvdXRlci13aWR0aCBvbiBzdHlsZS53aWR0aCBvbiBib3JkZXItYm94IGVsZW1zXG4gICAqIElFMTEgJiBGaXJlZm94PDI5IG1lYXN1cmVzIHRoZSBpbm5lci13aWR0aFxuICAgKi9cbiAgdmFyIGRpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICBkaXYuc3R5bGUud2lkdGggPSAnMjAwcHgnO1xuICBkaXYuc3R5bGUucGFkZGluZyA9ICcxcHggMnB4IDNweCA0cHgnO1xuICBkaXYuc3R5bGUuYm9yZGVyU3R5bGUgPSAnc29saWQnO1xuICBkaXYuc3R5bGUuYm9yZGVyV2lkdGggPSAnMXB4IDJweCAzcHggNHB4JztcbiAgZGl2LnN0eWxlLmJveFNpemluZyA9ICdib3JkZXItYm94JztcblxuICB2YXIgYm9keSA9IGRvY3VtZW50LmJvZHkgfHwgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50O1xuICBib2R5LmFwcGVuZENoaWxkKCBkaXYgKTtcbiAgdmFyIHN0eWxlID0gZ2V0U3R5bGUoIGRpdiApO1xuICAvLyByb3VuZCB2YWx1ZSBmb3IgYnJvd3NlciB6b29tLiBkZXNhbmRyby9tYXNvbnJ5IzkyOFxuICBpc0JveFNpemVPdXRlciA9IE1hdGgucm91bmQoIGdldFN0eWxlU2l6ZSggc3R5bGUud2lkdGggKSApID09IDIwMDtcbiAgZ2V0U2l6ZS5pc0JveFNpemVPdXRlciA9IGlzQm94U2l6ZU91dGVyO1xuXG4gIGJvZHkucmVtb3ZlQ2hpbGQoIGRpdiApO1xufVxuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSBnZXRTaXplIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIC8vXG5cbmZ1bmN0aW9uIGdldFNpemUoIGVsZW0gKSB7XG4gIHNldHVwKCk7XG5cbiAgLy8gdXNlIHF1ZXJ5U2VsZXRvciBpZiBlbGVtIGlzIHN0cmluZ1xuICBpZiAoIHR5cGVvZiBlbGVtID09ICdzdHJpbmcnICkge1xuICAgIGVsZW0gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCBlbGVtICk7XG4gIH1cblxuICAvLyBkbyBub3QgcHJvY2VlZCBvbiBub24tb2JqZWN0c1xuICBpZiAoICFlbGVtIHx8IHR5cGVvZiBlbGVtICE9ICdvYmplY3QnIHx8ICFlbGVtLm5vZGVUeXBlICkge1xuICAgIHJldHVybjtcbiAgfVxuXG4gIHZhciBzdHlsZSA9IGdldFN0eWxlKCBlbGVtICk7XG5cbiAgLy8gaWYgaGlkZGVuLCBldmVyeXRoaW5nIGlzIDBcbiAgaWYgKCBzdHlsZS5kaXNwbGF5ID09ICdub25lJyApIHtcbiAgICByZXR1cm4gZ2V0WmVyb1NpemUoKTtcbiAgfVxuXG4gIHZhciBzaXplID0ge307XG4gIHNpemUud2lkdGggPSBlbGVtLm9mZnNldFdpZHRoO1xuICBzaXplLmhlaWdodCA9IGVsZW0ub2Zmc2V0SGVpZ2h0O1xuXG4gIHZhciBpc0JvcmRlckJveCA9IHNpemUuaXNCb3JkZXJCb3ggPSBzdHlsZS5ib3hTaXppbmcgPT0gJ2JvcmRlci1ib3gnO1xuXG4gIC8vIGdldCBhbGwgbWVhc3VyZW1lbnRzXG4gIGZvciAoIHZhciBpPTA7IGkgPCBtZWFzdXJlbWVudHNMZW5ndGg7IGkrKyApIHtcbiAgICB2YXIgbWVhc3VyZW1lbnQgPSBtZWFzdXJlbWVudHNbaV07XG4gICAgdmFyIHZhbHVlID0gc3R5bGVbIG1lYXN1cmVtZW50IF07XG4gICAgdmFyIG51bSA9IHBhcnNlRmxvYXQoIHZhbHVlICk7XG4gICAgLy8gYW55ICdhdXRvJywgJ21lZGl1bScgdmFsdWUgd2lsbCBiZSAwXG4gICAgc2l6ZVsgbWVhc3VyZW1lbnQgXSA9ICFpc05hTiggbnVtICkgPyBudW0gOiAwO1xuICB9XG5cbiAgdmFyIHBhZGRpbmdXaWR0aCA9IHNpemUucGFkZGluZ0xlZnQgKyBzaXplLnBhZGRpbmdSaWdodDtcbiAgdmFyIHBhZGRpbmdIZWlnaHQgPSBzaXplLnBhZGRpbmdUb3AgKyBzaXplLnBhZGRpbmdCb3R0b207XG4gIHZhciBtYXJnaW5XaWR0aCA9IHNpemUubWFyZ2luTGVmdCArIHNpemUubWFyZ2luUmlnaHQ7XG4gIHZhciBtYXJnaW5IZWlnaHQgPSBzaXplLm1hcmdpblRvcCArIHNpemUubWFyZ2luQm90dG9tO1xuICB2YXIgYm9yZGVyV2lkdGggPSBzaXplLmJvcmRlckxlZnRXaWR0aCArIHNpemUuYm9yZGVyUmlnaHRXaWR0aDtcbiAgdmFyIGJvcmRlckhlaWdodCA9IHNpemUuYm9yZGVyVG9wV2lkdGggKyBzaXplLmJvcmRlckJvdHRvbVdpZHRoO1xuXG4gIHZhciBpc0JvcmRlckJveFNpemVPdXRlciA9IGlzQm9yZGVyQm94ICYmIGlzQm94U2l6ZU91dGVyO1xuXG4gIC8vIG92ZXJ3cml0ZSB3aWR0aCBhbmQgaGVpZ2h0IGlmIHdlIGNhbiBnZXQgaXQgZnJvbSBzdHlsZVxuICB2YXIgc3R5bGVXaWR0aCA9IGdldFN0eWxlU2l6ZSggc3R5bGUud2lkdGggKTtcbiAgaWYgKCBzdHlsZVdpZHRoICE9PSBmYWxzZSApIHtcbiAgICBzaXplLndpZHRoID0gc3R5bGVXaWR0aCArXG4gICAgICAvLyBhZGQgcGFkZGluZyBhbmQgYm9yZGVyIHVubGVzcyBpdCdzIGFscmVhZHkgaW5jbHVkaW5nIGl0XG4gICAgICAoIGlzQm9yZGVyQm94U2l6ZU91dGVyID8gMCA6IHBhZGRpbmdXaWR0aCArIGJvcmRlcldpZHRoICk7XG4gIH1cblxuICB2YXIgc3R5bGVIZWlnaHQgPSBnZXRTdHlsZVNpemUoIHN0eWxlLmhlaWdodCApO1xuICBpZiAoIHN0eWxlSGVpZ2h0ICE9PSBmYWxzZSApIHtcbiAgICBzaXplLmhlaWdodCA9IHN0eWxlSGVpZ2h0ICtcbiAgICAgIC8vIGFkZCBwYWRkaW5nIGFuZCBib3JkZXIgdW5sZXNzIGl0J3MgYWxyZWFkeSBpbmNsdWRpbmcgaXRcbiAgICAgICggaXNCb3JkZXJCb3hTaXplT3V0ZXIgPyAwIDogcGFkZGluZ0hlaWdodCArIGJvcmRlckhlaWdodCApO1xuICB9XG5cbiAgc2l6ZS5pbm5lcldpZHRoID0gc2l6ZS53aWR0aCAtICggcGFkZGluZ1dpZHRoICsgYm9yZGVyV2lkdGggKTtcbiAgc2l6ZS5pbm5lckhlaWdodCA9IHNpemUuaGVpZ2h0IC0gKCBwYWRkaW5nSGVpZ2h0ICsgYm9yZGVySGVpZ2h0ICk7XG5cbiAgc2l6ZS5vdXRlcldpZHRoID0gc2l6ZS53aWR0aCArIG1hcmdpbldpZHRoO1xuICBzaXplLm91dGVySGVpZ2h0ID0gc2l6ZS5oZWlnaHQgKyBtYXJnaW5IZWlnaHQ7XG5cbiAgcmV0dXJuIHNpemU7XG59XG5cbnJldHVybiBnZXRTaXplO1xuXG59KTtcbiIsIi8qKlxuICogbWF0Y2hlc1NlbGVjdG9yIHYyLjAuMlxuICogbWF0Y2hlc1NlbGVjdG9yKCBlbGVtZW50LCAnLnNlbGVjdG9yJyApXG4gKiBNSVQgbGljZW5zZVxuICovXG5cbi8qanNoaW50IGJyb3dzZXI6IHRydWUsIHN0cmljdDogdHJ1ZSwgdW5kZWY6IHRydWUsIHVudXNlZDogdHJ1ZSAqL1xuXG4oIGZ1bmN0aW9uKCB3aW5kb3csIGZhY3RvcnkgKSB7XG4gIC8qZ2xvYmFsIGRlZmluZTogZmFsc2UsIG1vZHVsZTogZmFsc2UgKi9cbiAgJ3VzZSBzdHJpY3QnO1xuICAvLyB1bml2ZXJzYWwgbW9kdWxlIGRlZmluaXRpb25cbiAgaWYgKCB0eXBlb2YgZGVmaW5lID09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCApIHtcbiAgICAvLyBBTURcbiAgICBkZWZpbmUoIGZhY3RvcnkgKTtcbiAgfSBlbHNlIGlmICggdHlwZW9mIG1vZHVsZSA9PSAnb2JqZWN0JyAmJiBtb2R1bGUuZXhwb3J0cyApIHtcbiAgICAvLyBDb21tb25KU1xuICAgIG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeSgpO1xuICB9IGVsc2Uge1xuICAgIC8vIGJyb3dzZXIgZ2xvYmFsXG4gICAgd2luZG93Lm1hdGNoZXNTZWxlY3RvciA9IGZhY3RvcnkoKTtcbiAgfVxuXG59KCB3aW5kb3csIGZ1bmN0aW9uIGZhY3RvcnkoKSB7XG4gICd1c2Ugc3RyaWN0JztcblxuICB2YXIgbWF0Y2hlc01ldGhvZCA9ICggZnVuY3Rpb24oKSB7XG4gICAgdmFyIEVsZW1Qcm90byA9IHdpbmRvdy5FbGVtZW50LnByb3RvdHlwZTtcbiAgICAvLyBjaGVjayBmb3IgdGhlIHN0YW5kYXJkIG1ldGhvZCBuYW1lIGZpcnN0XG4gICAgaWYgKCBFbGVtUHJvdG8ubWF0Y2hlcyApIHtcbiAgICAgIHJldHVybiAnbWF0Y2hlcyc7XG4gICAgfVxuICAgIC8vIGNoZWNrIHVuLXByZWZpeGVkXG4gICAgaWYgKCBFbGVtUHJvdG8ubWF0Y2hlc1NlbGVjdG9yICkge1xuICAgICAgcmV0dXJuICdtYXRjaGVzU2VsZWN0b3InO1xuICAgIH1cbiAgICAvLyBjaGVjayB2ZW5kb3IgcHJlZml4ZXNcbiAgICB2YXIgcHJlZml4ZXMgPSBbICd3ZWJraXQnLCAnbW96JywgJ21zJywgJ28nIF07XG5cbiAgICBmb3IgKCB2YXIgaT0wOyBpIDwgcHJlZml4ZXMubGVuZ3RoOyBpKysgKSB7XG4gICAgICB2YXIgcHJlZml4ID0gcHJlZml4ZXNbaV07XG4gICAgICB2YXIgbWV0aG9kID0gcHJlZml4ICsgJ01hdGNoZXNTZWxlY3Rvcic7XG4gICAgICBpZiAoIEVsZW1Qcm90b1sgbWV0aG9kIF0gKSB7XG4gICAgICAgIHJldHVybiBtZXRob2Q7XG4gICAgICB9XG4gICAgfVxuICB9KSgpO1xuXG4gIHJldHVybiBmdW5jdGlvbiBtYXRjaGVzU2VsZWN0b3IoIGVsZW0sIHNlbGVjdG9yICkge1xuICAgIHJldHVybiBlbGVtWyBtYXRjaGVzTWV0aG9kIF0oIHNlbGVjdG9yICk7XG4gIH07XG5cbn0pKTtcbiIsIi8qKlxuICogRml6enkgVUkgdXRpbHMgdjIuMC43XG4gKiBNSVQgbGljZW5zZVxuICovXG5cbi8qanNoaW50IGJyb3dzZXI6IHRydWUsIHVuZGVmOiB0cnVlLCB1bnVzZWQ6IHRydWUsIHN0cmljdDogdHJ1ZSAqL1xuXG4oIGZ1bmN0aW9uKCB3aW5kb3csIGZhY3RvcnkgKSB7XG4gIC8vIHVuaXZlcnNhbCBtb2R1bGUgZGVmaW5pdGlvblxuICAvKmpzaGludCBzdHJpY3Q6IGZhbHNlICovIC8qZ2xvYmFscyBkZWZpbmUsIG1vZHVsZSwgcmVxdWlyZSAqL1xuXG4gIGlmICggdHlwZW9mIGRlZmluZSA9PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQgKSB7XG4gICAgLy8gQU1EXG4gICAgZGVmaW5lKCBbXG4gICAgICAnZGVzYW5kcm8tbWF0Y2hlcy1zZWxlY3Rvci9tYXRjaGVzLXNlbGVjdG9yJ1xuICAgIF0sIGZ1bmN0aW9uKCBtYXRjaGVzU2VsZWN0b3IgKSB7XG4gICAgICByZXR1cm4gZmFjdG9yeSggd2luZG93LCBtYXRjaGVzU2VsZWN0b3IgKTtcbiAgICB9KTtcbiAgfSBlbHNlIGlmICggdHlwZW9mIG1vZHVsZSA9PSAnb2JqZWN0JyAmJiBtb2R1bGUuZXhwb3J0cyApIHtcbiAgICAvLyBDb21tb25KU1xuICAgIG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeShcbiAgICAgIHdpbmRvdyxcbiAgICAgIHJlcXVpcmUoJ2Rlc2FuZHJvLW1hdGNoZXMtc2VsZWN0b3InKVxuICAgICk7XG4gIH0gZWxzZSB7XG4gICAgLy8gYnJvd3NlciBnbG9iYWxcbiAgICB3aW5kb3cuZml6enlVSVV0aWxzID0gZmFjdG9yeShcbiAgICAgIHdpbmRvdyxcbiAgICAgIHdpbmRvdy5tYXRjaGVzU2VsZWN0b3JcbiAgICApO1xuICB9XG5cbn0oIHdpbmRvdywgZnVuY3Rpb24gZmFjdG9yeSggd2luZG93LCBtYXRjaGVzU2VsZWN0b3IgKSB7XG5cbid1c2Ugc3RyaWN0JztcblxudmFyIHV0aWxzID0ge307XG5cbi8vIC0tLS0tIGV4dGVuZCAtLS0tLSAvL1xuXG4vLyBleHRlbmRzIG9iamVjdHNcbnV0aWxzLmV4dGVuZCA9IGZ1bmN0aW9uKCBhLCBiICkge1xuICBmb3IgKCB2YXIgcHJvcCBpbiBiICkge1xuICAgIGFbIHByb3AgXSA9IGJbIHByb3AgXTtcbiAgfVxuICByZXR1cm4gYTtcbn07XG5cbi8vIC0tLS0tIG1vZHVsbyAtLS0tLSAvL1xuXG51dGlscy5tb2R1bG8gPSBmdW5jdGlvbiggbnVtLCBkaXYgKSB7XG4gIHJldHVybiAoICggbnVtICUgZGl2ICkgKyBkaXYgKSAlIGRpdjtcbn07XG5cbi8vIC0tLS0tIG1ha2VBcnJheSAtLS0tLSAvL1xuXG52YXIgYXJyYXlTbGljZSA9IEFycmF5LnByb3RvdHlwZS5zbGljZTtcblxuLy8gdHVybiBlbGVtZW50IG9yIG5vZGVMaXN0IGludG8gYW4gYXJyYXlcbnV0aWxzLm1ha2VBcnJheSA9IGZ1bmN0aW9uKCBvYmogKSB7XG4gIGlmICggQXJyYXkuaXNBcnJheSggb2JqICkgKSB7XG4gICAgLy8gdXNlIG9iamVjdCBpZiBhbHJlYWR5IGFuIGFycmF5XG4gICAgcmV0dXJuIG9iajtcbiAgfVxuICAvLyByZXR1cm4gZW1wdHkgYXJyYXkgaWYgdW5kZWZpbmVkIG9yIG51bGwuICM2XG4gIGlmICggb2JqID09PSBudWxsIHx8IG9iaiA9PT0gdW5kZWZpbmVkICkge1xuICAgIHJldHVybiBbXTtcbiAgfVxuXG4gIHZhciBpc0FycmF5TGlrZSA9IHR5cGVvZiBvYmogPT0gJ29iamVjdCcgJiYgdHlwZW9mIG9iai5sZW5ndGggPT0gJ251bWJlcic7XG4gIGlmICggaXNBcnJheUxpa2UgKSB7XG4gICAgLy8gY29udmVydCBub2RlTGlzdCB0byBhcnJheVxuICAgIHJldHVybiBhcnJheVNsaWNlLmNhbGwoIG9iaiApO1xuICB9XG5cbiAgLy8gYXJyYXkgb2Ygc2luZ2xlIGluZGV4XG4gIHJldHVybiBbIG9iaiBdO1xufTtcblxuLy8gLS0tLS0gcmVtb3ZlRnJvbSAtLS0tLSAvL1xuXG51dGlscy5yZW1vdmVGcm9tID0gZnVuY3Rpb24oIGFyeSwgb2JqICkge1xuICB2YXIgaW5kZXggPSBhcnkuaW5kZXhPZiggb2JqICk7XG4gIGlmICggaW5kZXggIT0gLTEgKSB7XG4gICAgYXJ5LnNwbGljZSggaW5kZXgsIDEgKTtcbiAgfVxufTtcblxuLy8gLS0tLS0gZ2V0UGFyZW50IC0tLS0tIC8vXG5cbnV0aWxzLmdldFBhcmVudCA9IGZ1bmN0aW9uKCBlbGVtLCBzZWxlY3RvciApIHtcbiAgd2hpbGUgKCBlbGVtLnBhcmVudE5vZGUgJiYgZWxlbSAhPSBkb2N1bWVudC5ib2R5ICkge1xuICAgIGVsZW0gPSBlbGVtLnBhcmVudE5vZGU7XG4gICAgaWYgKCBtYXRjaGVzU2VsZWN0b3IoIGVsZW0sIHNlbGVjdG9yICkgKSB7XG4gICAgICByZXR1cm4gZWxlbTtcbiAgICB9XG4gIH1cbn07XG5cbi8vIC0tLS0tIGdldFF1ZXJ5RWxlbWVudCAtLS0tLSAvL1xuXG4vLyB1c2UgZWxlbWVudCBhcyBzZWxlY3RvciBzdHJpbmdcbnV0aWxzLmdldFF1ZXJ5RWxlbWVudCA9IGZ1bmN0aW9uKCBlbGVtICkge1xuICBpZiAoIHR5cGVvZiBlbGVtID09ICdzdHJpbmcnICkge1xuICAgIHJldHVybiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCBlbGVtICk7XG4gIH1cbiAgcmV0dXJuIGVsZW07XG59O1xuXG4vLyAtLS0tLSBoYW5kbGVFdmVudCAtLS0tLSAvL1xuXG4vLyBlbmFibGUgLm9udHlwZSB0byB0cmlnZ2VyIGZyb20gLmFkZEV2ZW50TGlzdGVuZXIoIGVsZW0sICd0eXBlJyApXG51dGlscy5oYW5kbGVFdmVudCA9IGZ1bmN0aW9uKCBldmVudCApIHtcbiAgdmFyIG1ldGhvZCA9ICdvbicgKyBldmVudC50eXBlO1xuICBpZiAoIHRoaXNbIG1ldGhvZCBdICkge1xuICAgIHRoaXNbIG1ldGhvZCBdKCBldmVudCApO1xuICB9XG59O1xuXG4vLyAtLS0tLSBmaWx0ZXJGaW5kRWxlbWVudHMgLS0tLS0gLy9cblxudXRpbHMuZmlsdGVyRmluZEVsZW1lbnRzID0gZnVuY3Rpb24oIGVsZW1zLCBzZWxlY3RvciApIHtcbiAgLy8gbWFrZSBhcnJheSBvZiBlbGVtc1xuICBlbGVtcyA9IHV0aWxzLm1ha2VBcnJheSggZWxlbXMgKTtcbiAgdmFyIGZmRWxlbXMgPSBbXTtcblxuICBlbGVtcy5mb3JFYWNoKCBmdW5jdGlvbiggZWxlbSApIHtcbiAgICAvLyBjaGVjayB0aGF0IGVsZW0gaXMgYW4gYWN0dWFsIGVsZW1lbnRcbiAgICBpZiAoICEoIGVsZW0gaW5zdGFuY2VvZiBIVE1MRWxlbWVudCApICkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICAvLyBhZGQgZWxlbSBpZiBubyBzZWxlY3RvclxuICAgIGlmICggIXNlbGVjdG9yICkge1xuICAgICAgZmZFbGVtcy5wdXNoKCBlbGVtICk7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIC8vIGZpbHRlciAmIGZpbmQgaXRlbXMgaWYgd2UgaGF2ZSBhIHNlbGVjdG9yXG4gICAgLy8gZmlsdGVyXG4gICAgaWYgKCBtYXRjaGVzU2VsZWN0b3IoIGVsZW0sIHNlbGVjdG9yICkgKSB7XG4gICAgICBmZkVsZW1zLnB1c2goIGVsZW0gKTtcbiAgICB9XG4gICAgLy8gZmluZCBjaGlsZHJlblxuICAgIHZhciBjaGlsZEVsZW1zID0gZWxlbS5xdWVyeVNlbGVjdG9yQWxsKCBzZWxlY3RvciApO1xuICAgIC8vIGNvbmNhdCBjaGlsZEVsZW1zIHRvIGZpbHRlckZvdW5kIGFycmF5XG4gICAgZm9yICggdmFyIGk9MDsgaSA8IGNoaWxkRWxlbXMubGVuZ3RoOyBpKysgKSB7XG4gICAgICBmZkVsZW1zLnB1c2goIGNoaWxkRWxlbXNbaV0gKTtcbiAgICB9XG4gIH0pO1xuXG4gIHJldHVybiBmZkVsZW1zO1xufTtcblxuLy8gLS0tLS0gZGVib3VuY2VNZXRob2QgLS0tLS0gLy9cblxudXRpbHMuZGVib3VuY2VNZXRob2QgPSBmdW5jdGlvbiggX2NsYXNzLCBtZXRob2ROYW1lLCB0aHJlc2hvbGQgKSB7XG4gIHRocmVzaG9sZCA9IHRocmVzaG9sZCB8fCAxMDA7XG4gIC8vIG9yaWdpbmFsIG1ldGhvZFxuICB2YXIgbWV0aG9kID0gX2NsYXNzLnByb3RvdHlwZVsgbWV0aG9kTmFtZSBdO1xuICB2YXIgdGltZW91dE5hbWUgPSBtZXRob2ROYW1lICsgJ1RpbWVvdXQnO1xuXG4gIF9jbGFzcy5wcm90b3R5cGVbIG1ldGhvZE5hbWUgXSA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciB0aW1lb3V0ID0gdGhpc1sgdGltZW91dE5hbWUgXTtcbiAgICBjbGVhclRpbWVvdXQoIHRpbWVvdXQgKTtcblxuICAgIHZhciBhcmdzID0gYXJndW1lbnRzO1xuICAgIHZhciBfdGhpcyA9IHRoaXM7XG4gICAgdGhpc1sgdGltZW91dE5hbWUgXSA9IHNldFRpbWVvdXQoIGZ1bmN0aW9uKCkge1xuICAgICAgbWV0aG9kLmFwcGx5KCBfdGhpcywgYXJncyApO1xuICAgICAgZGVsZXRlIF90aGlzWyB0aW1lb3V0TmFtZSBdO1xuICAgIH0sIHRocmVzaG9sZCApO1xuICB9O1xufTtcblxuLy8gLS0tLS0gZG9jUmVhZHkgLS0tLS0gLy9cblxudXRpbHMuZG9jUmVhZHkgPSBmdW5jdGlvbiggY2FsbGJhY2sgKSB7XG4gIHZhciByZWFkeVN0YXRlID0gZG9jdW1lbnQucmVhZHlTdGF0ZTtcbiAgaWYgKCByZWFkeVN0YXRlID09ICdjb21wbGV0ZScgfHwgcmVhZHlTdGF0ZSA9PSAnaW50ZXJhY3RpdmUnICkge1xuICAgIC8vIGRvIGFzeW5jIHRvIGFsbG93IGZvciBvdGhlciBzY3JpcHRzIHRvIHJ1bi4gbWV0YWZpenp5L2ZsaWNraXR5IzQ0MVxuICAgIHNldFRpbWVvdXQoIGNhbGxiYWNrICk7XG4gIH0gZWxzZSB7XG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lciggJ0RPTUNvbnRlbnRMb2FkZWQnLCBjYWxsYmFjayApO1xuICB9XG59O1xuXG4vLyAtLS0tLSBodG1sSW5pdCAtLS0tLSAvL1xuXG4vLyBodHRwOi8vamFtZXNyb2JlcnRzLm5hbWUvYmxvZy8yMDEwLzAyLzIyL3N0cmluZy1mdW5jdGlvbnMtZm9yLWphdmFzY3JpcHQtdHJpbS10by1jYW1lbC1jYXNlLXRvLWRhc2hlZC1hbmQtdG8tdW5kZXJzY29yZS9cbnV0aWxzLnRvRGFzaGVkID0gZnVuY3Rpb24oIHN0ciApIHtcbiAgcmV0dXJuIHN0ci5yZXBsYWNlKCAvKC4pKFtBLVpdKS9nLCBmdW5jdGlvbiggbWF0Y2gsICQxLCAkMiApIHtcbiAgICByZXR1cm4gJDEgKyAnLScgKyAkMjtcbiAgfSkudG9Mb3dlckNhc2UoKTtcbn07XG5cbnZhciBjb25zb2xlID0gd2luZG93LmNvbnNvbGU7XG4vKipcbiAqIGFsbG93IHVzZXIgdG8gaW5pdGlhbGl6ZSBjbGFzc2VzIHZpYSBbZGF0YS1uYW1lc3BhY2VdIG9yIC5qcy1uYW1lc3BhY2UgY2xhc3NcbiAqIGh0bWxJbml0KCBXaWRnZXQsICd3aWRnZXROYW1lJyApXG4gKiBvcHRpb25zIGFyZSBwYXJzZWQgZnJvbSBkYXRhLW5hbWVzcGFjZS1vcHRpb25zXG4gKi9cbnV0aWxzLmh0bWxJbml0ID0gZnVuY3Rpb24oIFdpZGdldENsYXNzLCBuYW1lc3BhY2UgKSB7XG4gIHV0aWxzLmRvY1JlYWR5KCBmdW5jdGlvbigpIHtcbiAgICB2YXIgZGFzaGVkTmFtZXNwYWNlID0gdXRpbHMudG9EYXNoZWQoIG5hbWVzcGFjZSApO1xuICAgIHZhciBkYXRhQXR0ciA9ICdkYXRhLScgKyBkYXNoZWROYW1lc3BhY2U7XG4gICAgdmFyIGRhdGFBdHRyRWxlbXMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCAnWycgKyBkYXRhQXR0ciArICddJyApO1xuICAgIHZhciBqc0Rhc2hFbGVtcyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoICcuanMtJyArIGRhc2hlZE5hbWVzcGFjZSApO1xuICAgIHZhciBlbGVtcyA9IHV0aWxzLm1ha2VBcnJheSggZGF0YUF0dHJFbGVtcyApXG4gICAgICAuY29uY2F0KCB1dGlscy5tYWtlQXJyYXkoIGpzRGFzaEVsZW1zICkgKTtcbiAgICB2YXIgZGF0YU9wdGlvbnNBdHRyID0gZGF0YUF0dHIgKyAnLW9wdGlvbnMnO1xuICAgIHZhciBqUXVlcnkgPSB3aW5kb3cualF1ZXJ5O1xuXG4gICAgZWxlbXMuZm9yRWFjaCggZnVuY3Rpb24oIGVsZW0gKSB7XG4gICAgICB2YXIgYXR0ciA9IGVsZW0uZ2V0QXR0cmlidXRlKCBkYXRhQXR0ciApIHx8XG4gICAgICAgIGVsZW0uZ2V0QXR0cmlidXRlKCBkYXRhT3B0aW9uc0F0dHIgKTtcbiAgICAgIHZhciBvcHRpb25zO1xuICAgICAgdHJ5IHtcbiAgICAgICAgb3B0aW9ucyA9IGF0dHIgJiYgSlNPTi5wYXJzZSggYXR0ciApO1xuICAgICAgfSBjYXRjaCAoIGVycm9yICkge1xuICAgICAgICAvLyBsb2cgZXJyb3IsIGRvIG5vdCBpbml0aWFsaXplXG4gICAgICAgIGlmICggY29uc29sZSApIHtcbiAgICAgICAgICBjb25zb2xlLmVycm9yKCAnRXJyb3IgcGFyc2luZyAnICsgZGF0YUF0dHIgKyAnIG9uICcgKyBlbGVtLmNsYXNzTmFtZSArXG4gICAgICAgICAgJzogJyArIGVycm9yICk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgLy8gaW5pdGlhbGl6ZVxuICAgICAgdmFyIGluc3RhbmNlID0gbmV3IFdpZGdldENsYXNzKCBlbGVtLCBvcHRpb25zICk7XG4gICAgICAvLyBtYWtlIGF2YWlsYWJsZSB2aWEgJCgpLmRhdGEoJ25hbWVzcGFjZScpXG4gICAgICBpZiAoIGpRdWVyeSApIHtcbiAgICAgICAgalF1ZXJ5LmRhdGEoIGVsZW0sIG5hbWVzcGFjZSwgaW5zdGFuY2UgKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICB9KTtcbn07XG5cbi8vIC0tLS0tICAtLS0tLSAvL1xuXG5yZXR1cm4gdXRpbHM7XG5cbn0pKTtcbiIsIi8vIEZsaWNraXR5LkNlbGxcbiggZnVuY3Rpb24oIHdpbmRvdywgZmFjdG9yeSApIHtcbiAgLy8gdW5pdmVyc2FsIG1vZHVsZSBkZWZpbml0aW9uXG4gIC8qIGpzaGludCBzdHJpY3Q6IGZhbHNlICovXG4gIGlmICggdHlwZW9mIGRlZmluZSA9PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQgKSB7XG4gICAgLy8gQU1EXG4gICAgZGVmaW5lKCBbXG4gICAgICAnZ2V0LXNpemUvZ2V0LXNpemUnXG4gICAgXSwgZnVuY3Rpb24oIGdldFNpemUgKSB7XG4gICAgICByZXR1cm4gZmFjdG9yeSggd2luZG93LCBnZXRTaXplICk7XG4gICAgfSk7XG4gIH0gZWxzZSBpZiAoIHR5cGVvZiBtb2R1bGUgPT0gJ29iamVjdCcgJiYgbW9kdWxlLmV4cG9ydHMgKSB7XG4gICAgLy8gQ29tbW9uSlNcbiAgICBtb2R1bGUuZXhwb3J0cyA9IGZhY3RvcnkoXG4gICAgICB3aW5kb3csXG4gICAgICByZXF1aXJlKCdnZXQtc2l6ZScpXG4gICAgKTtcbiAgfSBlbHNlIHtcbiAgICAvLyBicm93c2VyIGdsb2JhbFxuICAgIHdpbmRvdy5GbGlja2l0eSA9IHdpbmRvdy5GbGlja2l0eSB8fCB7fTtcbiAgICB3aW5kb3cuRmxpY2tpdHkuQ2VsbCA9IGZhY3RvcnkoXG4gICAgICB3aW5kb3csXG4gICAgICB3aW5kb3cuZ2V0U2l6ZVxuICAgICk7XG4gIH1cblxufSggd2luZG93LCBmdW5jdGlvbiBmYWN0b3J5KCB3aW5kb3csIGdldFNpemUgKSB7XG5cbid1c2Ugc3RyaWN0JztcblxuZnVuY3Rpb24gQ2VsbCggZWxlbSwgcGFyZW50ICkge1xuICB0aGlzLmVsZW1lbnQgPSBlbGVtO1xuICB0aGlzLnBhcmVudCA9IHBhcmVudDtcblxuICB0aGlzLmNyZWF0ZSgpO1xufVxuXG52YXIgcHJvdG8gPSBDZWxsLnByb3RvdHlwZTtcblxucHJvdG8uY3JlYXRlID0gZnVuY3Rpb24oKSB7XG4gIHRoaXMuZWxlbWVudC5zdHlsZS5wb3NpdGlvbiA9ICdhYnNvbHV0ZSc7XG4gIHRoaXMuZWxlbWVudC5zZXRBdHRyaWJ1dGUoICdhcmlhLWhpZGRlbicsICd0cnVlJyApO1xuICB0aGlzLnggPSAwO1xuICB0aGlzLnNoaWZ0ID0gMDtcbn07XG5cbnByb3RvLmRlc3Ryb3kgPSBmdW5jdGlvbigpIHtcbiAgLy8gcmVzZXQgc3R5bGVcbiAgdGhpcy51bnNlbGVjdCgpO1xuICB0aGlzLmVsZW1lbnQuc3R5bGUucG9zaXRpb24gPSAnJztcbiAgdmFyIHNpZGUgPSB0aGlzLnBhcmVudC5vcmlnaW5TaWRlO1xuICB0aGlzLmVsZW1lbnQuc3R5bGVbIHNpZGUgXSA9ICcnO1xufTtcblxucHJvdG8uZ2V0U2l6ZSA9IGZ1bmN0aW9uKCkge1xuICB0aGlzLnNpemUgPSBnZXRTaXplKCB0aGlzLmVsZW1lbnQgKTtcbn07XG5cbnByb3RvLnNldFBvc2l0aW9uID0gZnVuY3Rpb24oIHggKSB7XG4gIHRoaXMueCA9IHg7XG4gIHRoaXMudXBkYXRlVGFyZ2V0KCk7XG4gIHRoaXMucmVuZGVyUG9zaXRpb24oIHggKTtcbn07XG5cbi8vIHNldERlZmF1bHRUYXJnZXQgdjEgbWV0aG9kLCBiYWNrd2FyZHMgY29tcGF0aWJpbGl0eSwgcmVtb3ZlIGluIHYzXG5wcm90by51cGRhdGVUYXJnZXQgPSBwcm90by5zZXREZWZhdWx0VGFyZ2V0ID0gZnVuY3Rpb24oKSB7XG4gIHZhciBtYXJnaW5Qcm9wZXJ0eSA9IHRoaXMucGFyZW50Lm9yaWdpblNpZGUgPT0gJ2xlZnQnID8gJ21hcmdpbkxlZnQnIDogJ21hcmdpblJpZ2h0JztcbiAgdGhpcy50YXJnZXQgPSB0aGlzLnggKyB0aGlzLnNpemVbIG1hcmdpblByb3BlcnR5IF0gK1xuICAgIHRoaXMuc2l6ZS53aWR0aCAqIHRoaXMucGFyZW50LmNlbGxBbGlnbjtcbn07XG5cbnByb3RvLnJlbmRlclBvc2l0aW9uID0gZnVuY3Rpb24oIHggKSB7XG4gIC8vIHJlbmRlciBwb3NpdGlvbiBvZiBjZWxsIHdpdGggaW4gc2xpZGVyXG4gIHZhciBzaWRlID0gdGhpcy5wYXJlbnQub3JpZ2luU2lkZTtcbiAgdGhpcy5lbGVtZW50LnN0eWxlWyBzaWRlIF0gPSB0aGlzLnBhcmVudC5nZXRQb3NpdGlvblZhbHVlKCB4ICk7XG59O1xuXG5wcm90by5zZWxlY3QgPSBmdW5jdGlvbigpIHtcbiAgdGhpcy5lbGVtZW50LmNsYXNzTGlzdC5hZGQoJ2lzLXNlbGVjdGVkJyk7XG4gIHRoaXMuZWxlbWVudC5yZW1vdmVBdHRyaWJ1dGUoJ2FyaWEtaGlkZGVuJyk7XG59O1xuXG5wcm90by51bnNlbGVjdCA9IGZ1bmN0aW9uKCkge1xuICB0aGlzLmVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZSgnaXMtc2VsZWN0ZWQnKTtcbiAgdGhpcy5lbGVtZW50LnNldEF0dHJpYnV0ZSggJ2FyaWEtaGlkZGVuJywgJ3RydWUnICk7XG59O1xuXG4vKipcbiAqIEBwYXJhbSB7SW50ZWdlcn0gZmFjdG9yIC0gMCwgMSwgb3IgLTFcbioqL1xucHJvdG8ud3JhcFNoaWZ0ID0gZnVuY3Rpb24oIHNoaWZ0ICkge1xuICB0aGlzLnNoaWZ0ID0gc2hpZnQ7XG4gIHRoaXMucmVuZGVyUG9zaXRpb24oIHRoaXMueCArIHRoaXMucGFyZW50LnNsaWRlYWJsZVdpZHRoICogc2hpZnQgKTtcbn07XG5cbnByb3RvLnJlbW92ZSA9IGZ1bmN0aW9uKCkge1xuICB0aGlzLmVsZW1lbnQucGFyZW50Tm9kZS5yZW1vdmVDaGlsZCggdGhpcy5lbGVtZW50ICk7XG59O1xuXG5yZXR1cm4gQ2VsbDtcblxufSkpO1xuIiwiLy8gc2xpZGVcbiggZnVuY3Rpb24oIHdpbmRvdywgZmFjdG9yeSApIHtcbiAgLy8gdW5pdmVyc2FsIG1vZHVsZSBkZWZpbml0aW9uXG4gIC8qIGpzaGludCBzdHJpY3Q6IGZhbHNlICovXG4gIGlmICggdHlwZW9mIGRlZmluZSA9PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQgKSB7XG4gICAgLy8gQU1EXG4gICAgZGVmaW5lKCBmYWN0b3J5ICk7XG4gIH0gZWxzZSBpZiAoIHR5cGVvZiBtb2R1bGUgPT0gJ29iamVjdCcgJiYgbW9kdWxlLmV4cG9ydHMgKSB7XG4gICAgLy8gQ29tbW9uSlNcbiAgICBtb2R1bGUuZXhwb3J0cyA9IGZhY3RvcnkoKTtcbiAgfSBlbHNlIHtcbiAgICAvLyBicm93c2VyIGdsb2JhbFxuICAgIHdpbmRvdy5GbGlja2l0eSA9IHdpbmRvdy5GbGlja2l0eSB8fCB7fTtcbiAgICB3aW5kb3cuRmxpY2tpdHkuU2xpZGUgPSBmYWN0b3J5KCk7XG4gIH1cblxufSggd2luZG93LCBmdW5jdGlvbiBmYWN0b3J5KCkge1xuJ3VzZSBzdHJpY3QnO1xuXG5mdW5jdGlvbiBTbGlkZSggcGFyZW50ICkge1xuICB0aGlzLnBhcmVudCA9IHBhcmVudDtcbiAgdGhpcy5pc09yaWdpbkxlZnQgPSBwYXJlbnQub3JpZ2luU2lkZSA9PSAnbGVmdCc7XG4gIHRoaXMuY2VsbHMgPSBbXTtcbiAgdGhpcy5vdXRlcldpZHRoID0gMDtcbiAgdGhpcy5oZWlnaHQgPSAwO1xufVxuXG52YXIgcHJvdG8gPSBTbGlkZS5wcm90b3R5cGU7XG5cbnByb3RvLmFkZENlbGwgPSBmdW5jdGlvbiggY2VsbCApIHtcbiAgdGhpcy5jZWxscy5wdXNoKCBjZWxsICk7XG4gIHRoaXMub3V0ZXJXaWR0aCArPSBjZWxsLnNpemUub3V0ZXJXaWR0aDtcbiAgdGhpcy5oZWlnaHQgPSBNYXRoLm1heCggY2VsbC5zaXplLm91dGVySGVpZ2h0LCB0aGlzLmhlaWdodCApO1xuICAvLyBmaXJzdCBjZWxsIHN0dWZmXG4gIGlmICggdGhpcy5jZWxscy5sZW5ndGggPT0gMSApIHtcbiAgICB0aGlzLnggPSBjZWxsLng7IC8vIHggY29tZXMgZnJvbSBmaXJzdCBjZWxsXG4gICAgdmFyIGJlZ2luTWFyZ2luID0gdGhpcy5pc09yaWdpbkxlZnQgPyAnbWFyZ2luTGVmdCcgOiAnbWFyZ2luUmlnaHQnO1xuICAgIHRoaXMuZmlyc3RNYXJnaW4gPSBjZWxsLnNpemVbIGJlZ2luTWFyZ2luIF07XG4gIH1cbn07XG5cbnByb3RvLnVwZGF0ZVRhcmdldCA9IGZ1bmN0aW9uKCkge1xuICB2YXIgZW5kTWFyZ2luID0gdGhpcy5pc09yaWdpbkxlZnQgPyAnbWFyZ2luUmlnaHQnIDogJ21hcmdpbkxlZnQnO1xuICB2YXIgbGFzdENlbGwgPSB0aGlzLmdldExhc3RDZWxsKCk7XG4gIHZhciBsYXN0TWFyZ2luID0gbGFzdENlbGwgPyBsYXN0Q2VsbC5zaXplWyBlbmRNYXJnaW4gXSA6IDA7XG4gIHZhciBzbGlkZVdpZHRoID0gdGhpcy5vdXRlcldpZHRoIC0gKCB0aGlzLmZpcnN0TWFyZ2luICsgbGFzdE1hcmdpbiApO1xuICB0aGlzLnRhcmdldCA9IHRoaXMueCArIHRoaXMuZmlyc3RNYXJnaW4gKyBzbGlkZVdpZHRoICogdGhpcy5wYXJlbnQuY2VsbEFsaWduO1xufTtcblxucHJvdG8uZ2V0TGFzdENlbGwgPSBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIHRoaXMuY2VsbHNbIHRoaXMuY2VsbHMubGVuZ3RoIC0gMSBdO1xufTtcblxucHJvdG8uc2VsZWN0ID0gZnVuY3Rpb24oKSB7XG4gIHRoaXMuY2VsbHMuZm9yRWFjaCggZnVuY3Rpb24oIGNlbGwgKSB7XG4gICAgY2VsbC5zZWxlY3QoKTtcbiAgfSk7XG59O1xuXG5wcm90by51bnNlbGVjdCA9IGZ1bmN0aW9uKCkge1xuICB0aGlzLmNlbGxzLmZvckVhY2goIGZ1bmN0aW9uKCBjZWxsICkge1xuICAgIGNlbGwudW5zZWxlY3QoKTtcbiAgfSk7XG59O1xuXG5wcm90by5nZXRDZWxsRWxlbWVudHMgPSBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIHRoaXMuY2VsbHMubWFwKCBmdW5jdGlvbiggY2VsbCApIHtcbiAgICByZXR1cm4gY2VsbC5lbGVtZW50O1xuICB9KTtcbn07XG5cbnJldHVybiBTbGlkZTtcblxufSkpO1xuIiwiLy8gYW5pbWF0ZVxuKCBmdW5jdGlvbiggd2luZG93LCBmYWN0b3J5ICkge1xuICAvLyB1bml2ZXJzYWwgbW9kdWxlIGRlZmluaXRpb25cbiAgLyoganNoaW50IHN0cmljdDogZmFsc2UgKi9cbiAgaWYgKCB0eXBlb2YgZGVmaW5lID09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCApIHtcbiAgICAvLyBBTURcbiAgICBkZWZpbmUoIFtcbiAgICAgICdmaXp6eS11aS11dGlscy91dGlscydcbiAgICBdLCBmdW5jdGlvbiggdXRpbHMgKSB7XG4gICAgICByZXR1cm4gZmFjdG9yeSggd2luZG93LCB1dGlscyApO1xuICAgIH0pO1xuICB9IGVsc2UgaWYgKCB0eXBlb2YgbW9kdWxlID09ICdvYmplY3QnICYmIG1vZHVsZS5leHBvcnRzICkge1xuICAgIC8vIENvbW1vbkpTXG4gICAgbW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KFxuICAgICAgd2luZG93LFxuICAgICAgcmVxdWlyZSgnZml6enktdWktdXRpbHMnKVxuICAgICk7XG4gIH0gZWxzZSB7XG4gICAgLy8gYnJvd3NlciBnbG9iYWxcbiAgICB3aW5kb3cuRmxpY2tpdHkgPSB3aW5kb3cuRmxpY2tpdHkgfHwge307XG4gICAgd2luZG93LkZsaWNraXR5LmFuaW1hdGVQcm90b3R5cGUgPSBmYWN0b3J5KFxuICAgICAgd2luZG93LFxuICAgICAgd2luZG93LmZpenp5VUlVdGlsc1xuICAgICk7XG4gIH1cblxufSggd2luZG93LCBmdW5jdGlvbiBmYWN0b3J5KCB3aW5kb3csIHV0aWxzICkge1xuXG4ndXNlIHN0cmljdCc7XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIGFuaW1hdGUgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gLy9cblxudmFyIHByb3RvID0ge307XG5cbnByb3RvLnN0YXJ0QW5pbWF0aW9uID0gZnVuY3Rpb24oKSB7XG4gIGlmICggdGhpcy5pc0FuaW1hdGluZyApIHtcbiAgICByZXR1cm47XG4gIH1cblxuICB0aGlzLmlzQW5pbWF0aW5nID0gdHJ1ZTtcbiAgdGhpcy5yZXN0aW5nRnJhbWVzID0gMDtcbiAgdGhpcy5hbmltYXRlKCk7XG59O1xuXG5wcm90by5hbmltYXRlID0gZnVuY3Rpb24oKSB7XG4gIHRoaXMuYXBwbHlEcmFnRm9yY2UoKTtcbiAgdGhpcy5hcHBseVNlbGVjdGVkQXR0cmFjdGlvbigpO1xuXG4gIHZhciBwcmV2aW91c1ggPSB0aGlzLng7XG5cbiAgdGhpcy5pbnRlZ3JhdGVQaHlzaWNzKCk7XG4gIHRoaXMucG9zaXRpb25TbGlkZXIoKTtcbiAgdGhpcy5zZXR0bGUoIHByZXZpb3VzWCApO1xuICAvLyBhbmltYXRlIG5leHQgZnJhbWVcbiAgaWYgKCB0aGlzLmlzQW5pbWF0aW5nICkge1xuICAgIHZhciBfdGhpcyA9IHRoaXM7XG4gICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKCBmdW5jdGlvbiBhbmltYXRlRnJhbWUoKSB7XG4gICAgICBfdGhpcy5hbmltYXRlKCk7XG4gICAgfSk7XG4gIH1cbn07XG5cbnByb3RvLnBvc2l0aW9uU2xpZGVyID0gZnVuY3Rpb24oKSB7XG4gIHZhciB4ID0gdGhpcy54O1xuICAvLyB3cmFwIHBvc2l0aW9uIGFyb3VuZFxuICBpZiAoIHRoaXMub3B0aW9ucy53cmFwQXJvdW5kICYmIHRoaXMuY2VsbHMubGVuZ3RoID4gMSApIHtcbiAgICB4ID0gdXRpbHMubW9kdWxvKCB4LCB0aGlzLnNsaWRlYWJsZVdpZHRoICk7XG4gICAgeCA9IHggLSB0aGlzLnNsaWRlYWJsZVdpZHRoO1xuICAgIHRoaXMuc2hpZnRXcmFwQ2VsbHMoIHggKTtcbiAgfVxuXG4gIHRoaXMuc2V0VHJhbnNsYXRlWCggeCwgdGhpcy5pc0FuaW1hdGluZyApO1xuICB0aGlzLmRpc3BhdGNoU2Nyb2xsRXZlbnQoKTtcbn07XG5cbnByb3RvLnNldFRyYW5zbGF0ZVggPSBmdW5jdGlvbiggeCwgaXMzZCApIHtcbiAgeCArPSB0aGlzLmN1cnNvclBvc2l0aW9uO1xuICAvLyByZXZlcnNlIGlmIHJpZ2h0LXRvLWxlZnQgYW5kIHVzaW5nIHRyYW5zZm9ybVxuICB4ID0gdGhpcy5vcHRpb25zLnJpZ2h0VG9MZWZ0ID8gLXggOiB4O1xuICB2YXIgdHJhbnNsYXRlWCA9IHRoaXMuZ2V0UG9zaXRpb25WYWx1ZSggeCApO1xuICAvLyB1c2UgM0QgdHJhbmZvcm1zIGZvciBoYXJkd2FyZSBhY2NlbGVyYXRpb24gb24gaU9TXG4gIC8vIGJ1dCB1c2UgMkQgd2hlbiBzZXR0bGVkLCBmb3IgYmV0dGVyIGZvbnQtcmVuZGVyaW5nXG4gIHRoaXMuc2xpZGVyLnN0eWxlLnRyYW5zZm9ybSA9IGlzM2QgP1xuICAgICd0cmFuc2xhdGUzZCgnICsgdHJhbnNsYXRlWCArICcsMCwwKScgOiAndHJhbnNsYXRlWCgnICsgdHJhbnNsYXRlWCArICcpJztcbn07XG5cbnByb3RvLmRpc3BhdGNoU2Nyb2xsRXZlbnQgPSBmdW5jdGlvbigpIHtcbiAgdmFyIGZpcnN0U2xpZGUgPSB0aGlzLnNsaWRlc1swXTtcbiAgaWYgKCAhZmlyc3RTbGlkZSApIHtcbiAgICByZXR1cm47XG4gIH1cbiAgdmFyIHBvc2l0aW9uWCA9IC10aGlzLnggLSBmaXJzdFNsaWRlLnRhcmdldDtcbiAgdmFyIHByb2dyZXNzID0gcG9zaXRpb25YIC8gdGhpcy5zbGlkZXNXaWR0aDtcbiAgdGhpcy5kaXNwYXRjaEV2ZW50KCAnc2Nyb2xsJywgbnVsbCwgWyBwcm9ncmVzcywgcG9zaXRpb25YIF0gKTtcbn07XG5cbnByb3RvLnBvc2l0aW9uU2xpZGVyQXRTZWxlY3RlZCA9IGZ1bmN0aW9uKCkge1xuICBpZiAoICF0aGlzLmNlbGxzLmxlbmd0aCApIHtcbiAgICByZXR1cm47XG4gIH1cbiAgdGhpcy54ID0gLXRoaXMuc2VsZWN0ZWRTbGlkZS50YXJnZXQ7XG4gIHRoaXMudmVsb2NpdHkgPSAwOyAvLyBzdG9wIHdvYmJsZVxuICB0aGlzLnBvc2l0aW9uU2xpZGVyKCk7XG59O1xuXG5wcm90by5nZXRQb3NpdGlvblZhbHVlID0gZnVuY3Rpb24oIHBvc2l0aW9uICkge1xuICBpZiAoIHRoaXMub3B0aW9ucy5wZXJjZW50UG9zaXRpb24gKSB7XG4gICAgLy8gcGVyY2VudCBwb3NpdGlvbiwgcm91bmQgdG8gMiBkaWdpdHMsIGxpa2UgMTIuMzQlXG4gICAgcmV0dXJuICggTWF0aC5yb3VuZCggKCBwb3NpdGlvbiAvIHRoaXMuc2l6ZS5pbm5lcldpZHRoICkgKiAxMDAwMCApICogMC4wMSApKyAnJSc7XG4gIH0gZWxzZSB7XG4gICAgLy8gcGl4ZWwgcG9zaXRpb25pbmdcbiAgICByZXR1cm4gTWF0aC5yb3VuZCggcG9zaXRpb24gKSArICdweCc7XG4gIH1cbn07XG5cbnByb3RvLnNldHRsZSA9IGZ1bmN0aW9uKCBwcmV2aW91c1ggKSB7XG4gIC8vIGtlZXAgdHJhY2sgb2YgZnJhbWVzIHdoZXJlIHggaGFzbid0IG1vdmVkXG4gIGlmICggIXRoaXMuaXNQb2ludGVyRG93biAmJiBNYXRoLnJvdW5kKCB0aGlzLnggKiAxMDAgKSA9PSBNYXRoLnJvdW5kKCBwcmV2aW91c1ggKiAxMDAgKSApIHtcbiAgICB0aGlzLnJlc3RpbmdGcmFtZXMrKztcbiAgfVxuICAvLyBzdG9wIGFuaW1hdGluZyBpZiByZXN0aW5nIGZvciAzIG9yIG1vcmUgZnJhbWVzXG4gIGlmICggdGhpcy5yZXN0aW5nRnJhbWVzID4gMiApIHtcbiAgICB0aGlzLmlzQW5pbWF0aW5nID0gZmFsc2U7XG4gICAgZGVsZXRlIHRoaXMuaXNGcmVlU2Nyb2xsaW5nO1xuICAgIC8vIHJlbmRlciBwb3NpdGlvbiB3aXRoIHRyYW5zbGF0ZVggd2hlbiBzZXR0bGVkXG4gICAgdGhpcy5wb3NpdGlvblNsaWRlcigpO1xuICAgIHRoaXMuZGlzcGF0Y2hFdmVudCggJ3NldHRsZScsIG51bGwsIFsgdGhpcy5zZWxlY3RlZEluZGV4IF0gKTtcbiAgfVxufTtcblxucHJvdG8uc2hpZnRXcmFwQ2VsbHMgPSBmdW5jdGlvbiggeCApIHtcbiAgLy8gc2hpZnQgYmVmb3JlIGNlbGxzXG4gIHZhciBiZWZvcmVHYXAgPSB0aGlzLmN1cnNvclBvc2l0aW9uICsgeDtcbiAgdGhpcy5fc2hpZnRDZWxscyggdGhpcy5iZWZvcmVTaGlmdENlbGxzLCBiZWZvcmVHYXAsIC0xICk7XG4gIC8vIHNoaWZ0IGFmdGVyIGNlbGxzXG4gIHZhciBhZnRlckdhcCA9IHRoaXMuc2l6ZS5pbm5lcldpZHRoIC0gKCB4ICsgdGhpcy5zbGlkZWFibGVXaWR0aCArIHRoaXMuY3Vyc29yUG9zaXRpb24gKTtcbiAgdGhpcy5fc2hpZnRDZWxscyggdGhpcy5hZnRlclNoaWZ0Q2VsbHMsIGFmdGVyR2FwLCAxICk7XG59O1xuXG5wcm90by5fc2hpZnRDZWxscyA9IGZ1bmN0aW9uKCBjZWxscywgZ2FwLCBzaGlmdCApIHtcbiAgZm9yICggdmFyIGk9MDsgaSA8IGNlbGxzLmxlbmd0aDsgaSsrICkge1xuICAgIHZhciBjZWxsID0gY2VsbHNbaV07XG4gICAgdmFyIGNlbGxTaGlmdCA9IGdhcCA+IDAgPyBzaGlmdCA6IDA7XG4gICAgY2VsbC53cmFwU2hpZnQoIGNlbGxTaGlmdCApO1xuICAgIGdhcCAtPSBjZWxsLnNpemUub3V0ZXJXaWR0aDtcbiAgfVxufTtcblxucHJvdG8uX3Vuc2hpZnRDZWxscyA9IGZ1bmN0aW9uKCBjZWxscyApIHtcbiAgaWYgKCAhY2VsbHMgfHwgIWNlbGxzLmxlbmd0aCApIHtcbiAgICByZXR1cm47XG4gIH1cbiAgZm9yICggdmFyIGk9MDsgaSA8IGNlbGxzLmxlbmd0aDsgaSsrICkge1xuICAgIGNlbGxzW2ldLndyYXBTaGlmdCggMCApO1xuICB9XG59O1xuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSBwaHlzaWNzIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIC8vXG5cbnByb3RvLmludGVncmF0ZVBoeXNpY3MgPSBmdW5jdGlvbigpIHtcbiAgdGhpcy54ICs9IHRoaXMudmVsb2NpdHk7XG4gIHRoaXMudmVsb2NpdHkgKj0gdGhpcy5nZXRGcmljdGlvbkZhY3RvcigpO1xufTtcblxucHJvdG8uYXBwbHlGb3JjZSA9IGZ1bmN0aW9uKCBmb3JjZSApIHtcbiAgdGhpcy52ZWxvY2l0eSArPSBmb3JjZTtcbn07XG5cbnByb3RvLmdldEZyaWN0aW9uRmFjdG9yID0gZnVuY3Rpb24oKSB7XG4gIHJldHVybiAxIC0gdGhpcy5vcHRpb25zWyB0aGlzLmlzRnJlZVNjcm9sbGluZyA/ICdmcmVlU2Nyb2xsRnJpY3Rpb24nIDogJ2ZyaWN0aW9uJyBdO1xufTtcblxucHJvdG8uZ2V0UmVzdGluZ1Bvc2l0aW9uID0gZnVuY3Rpb24oKSB7XG4gIC8vIG15IHRoYW5rcyB0byBTdGV2ZW4gV2l0dGVucywgd2hvIHNpbXBsaWZpZWQgdGhpcyBtYXRoIGdyZWF0bHlcbiAgcmV0dXJuIHRoaXMueCArIHRoaXMudmVsb2NpdHkgLyAoIDEgLSB0aGlzLmdldEZyaWN0aW9uRmFjdG9yKCkgKTtcbn07XG5cbnByb3RvLmFwcGx5RHJhZ0ZvcmNlID0gZnVuY3Rpb24oKSB7XG4gIGlmICggIXRoaXMuaXNEcmFnZ2FibGUgfHwgIXRoaXMuaXNQb2ludGVyRG93biApIHtcbiAgICByZXR1cm47XG4gIH1cbiAgLy8gY2hhbmdlIHRoZSBwb3NpdGlvbiB0byBkcmFnIHBvc2l0aW9uIGJ5IGFwcGx5aW5nIGZvcmNlXG4gIHZhciBkcmFnVmVsb2NpdHkgPSB0aGlzLmRyYWdYIC0gdGhpcy54O1xuICB2YXIgZHJhZ0ZvcmNlID0gZHJhZ1ZlbG9jaXR5IC0gdGhpcy52ZWxvY2l0eTtcbiAgdGhpcy5hcHBseUZvcmNlKCBkcmFnRm9yY2UgKTtcbn07XG5cbnByb3RvLmFwcGx5U2VsZWN0ZWRBdHRyYWN0aW9uID0gZnVuY3Rpb24oKSB7XG4gIC8vIGRvIG5vdCBhdHRyYWN0IGlmIHBvaW50ZXIgZG93biBvciBubyBzbGlkZXNcbiAgdmFyIGRyYWdEb3duID0gdGhpcy5pc0RyYWdnYWJsZSAmJiB0aGlzLmlzUG9pbnRlckRvd247XG4gIGlmICggZHJhZ0Rvd24gfHwgdGhpcy5pc0ZyZWVTY3JvbGxpbmcgfHwgIXRoaXMuc2xpZGVzLmxlbmd0aCApIHtcbiAgICByZXR1cm47XG4gIH1cbiAgdmFyIGRpc3RhbmNlID0gdGhpcy5zZWxlY3RlZFNsaWRlLnRhcmdldCAqIC0xIC0gdGhpcy54O1xuICB2YXIgZm9yY2UgPSBkaXN0YW5jZSAqIHRoaXMub3B0aW9ucy5zZWxlY3RlZEF0dHJhY3Rpb247XG4gIHRoaXMuYXBwbHlGb3JjZSggZm9yY2UgKTtcbn07XG5cbnJldHVybiBwcm90bztcblxufSkpO1xuIiwiLy8gRmxpY2tpdHkgbWFpblxuKCBmdW5jdGlvbiggd2luZG93LCBmYWN0b3J5ICkge1xuICAvLyB1bml2ZXJzYWwgbW9kdWxlIGRlZmluaXRpb25cbiAgLyoganNoaW50IHN0cmljdDogZmFsc2UgKi9cbiAgaWYgKCB0eXBlb2YgZGVmaW5lID09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCApIHtcbiAgICAvLyBBTURcbiAgICBkZWZpbmUoIFtcbiAgICAgICdldi1lbWl0dGVyL2V2LWVtaXR0ZXInLFxuICAgICAgJ2dldC1zaXplL2dldC1zaXplJyxcbiAgICAgICdmaXp6eS11aS11dGlscy91dGlscycsXG4gICAgICAnLi9jZWxsJyxcbiAgICAgICcuL3NsaWRlJyxcbiAgICAgICcuL2FuaW1hdGUnXG4gICAgXSwgZnVuY3Rpb24oIEV2RW1pdHRlciwgZ2V0U2l6ZSwgdXRpbHMsIENlbGwsIFNsaWRlLCBhbmltYXRlUHJvdG90eXBlICkge1xuICAgICAgcmV0dXJuIGZhY3RvcnkoIHdpbmRvdywgRXZFbWl0dGVyLCBnZXRTaXplLCB1dGlscywgQ2VsbCwgU2xpZGUsIGFuaW1hdGVQcm90b3R5cGUgKTtcbiAgICB9KTtcbiAgfSBlbHNlIGlmICggdHlwZW9mIG1vZHVsZSA9PSAnb2JqZWN0JyAmJiBtb2R1bGUuZXhwb3J0cyApIHtcbiAgICAvLyBDb21tb25KU1xuICAgIG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeShcbiAgICAgIHdpbmRvdyxcbiAgICAgIHJlcXVpcmUoJ2V2LWVtaXR0ZXInKSxcbiAgICAgIHJlcXVpcmUoJ2dldC1zaXplJyksXG4gICAgICByZXF1aXJlKCdmaXp6eS11aS11dGlscycpLFxuICAgICAgcmVxdWlyZSgnLi9jZWxsJyksXG4gICAgICByZXF1aXJlKCcuL3NsaWRlJyksXG4gICAgICByZXF1aXJlKCcuL2FuaW1hdGUnKVxuICAgICk7XG4gIH0gZWxzZSB7XG4gICAgLy8gYnJvd3NlciBnbG9iYWxcbiAgICB2YXIgX0ZsaWNraXR5ID0gd2luZG93LkZsaWNraXR5O1xuXG4gICAgd2luZG93LkZsaWNraXR5ID0gZmFjdG9yeShcbiAgICAgIHdpbmRvdyxcbiAgICAgIHdpbmRvdy5FdkVtaXR0ZXIsXG4gICAgICB3aW5kb3cuZ2V0U2l6ZSxcbiAgICAgIHdpbmRvdy5maXp6eVVJVXRpbHMsXG4gICAgICBfRmxpY2tpdHkuQ2VsbCxcbiAgICAgIF9GbGlja2l0eS5TbGlkZSxcbiAgICAgIF9GbGlja2l0eS5hbmltYXRlUHJvdG90eXBlXG4gICAgKTtcbiAgfVxuXG59KCB3aW5kb3csIGZ1bmN0aW9uIGZhY3RvcnkoIHdpbmRvdywgRXZFbWl0dGVyLCBnZXRTaXplLFxuICB1dGlscywgQ2VsbCwgU2xpZGUsIGFuaW1hdGVQcm90b3R5cGUgKSB7XG5cbid1c2Ugc3RyaWN0JztcblxuLy8gdmFyc1xudmFyIGpRdWVyeSA9IHdpbmRvdy5qUXVlcnk7XG52YXIgZ2V0Q29tcHV0ZWRTdHlsZSA9IHdpbmRvdy5nZXRDb21wdXRlZFN0eWxlO1xudmFyIGNvbnNvbGUgPSB3aW5kb3cuY29uc29sZTtcblxuZnVuY3Rpb24gbW92ZUVsZW1lbnRzKCBlbGVtcywgdG9FbGVtICkge1xuICBlbGVtcyA9IHV0aWxzLm1ha2VBcnJheSggZWxlbXMgKTtcbiAgd2hpbGUgKCBlbGVtcy5sZW5ndGggKSB7XG4gICAgdG9FbGVtLmFwcGVuZENoaWxkKCBlbGVtcy5zaGlmdCgpICk7XG4gIH1cbn1cblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gRmxpY2tpdHkgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gLy9cblxuLy8gZ2xvYmFsbHkgdW5pcXVlIGlkZW50aWZpZXJzXG52YXIgR1VJRCA9IDA7XG4vLyBpbnRlcm5hbCBzdG9yZSBvZiBhbGwgRmxpY2tpdHkgaW50YW5jZXNcbnZhciBpbnN0YW5jZXMgPSB7fTtcblxuZnVuY3Rpb24gRmxpY2tpdHkoIGVsZW1lbnQsIG9wdGlvbnMgKSB7XG4gIHZhciBxdWVyeUVsZW1lbnQgPSB1dGlscy5nZXRRdWVyeUVsZW1lbnQoIGVsZW1lbnQgKTtcbiAgaWYgKCAhcXVlcnlFbGVtZW50ICkge1xuICAgIGlmICggY29uc29sZSApIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoICdCYWQgZWxlbWVudCBmb3IgRmxpY2tpdHk6ICcgKyAoIHF1ZXJ5RWxlbWVudCB8fCBlbGVtZW50ICkgKTtcbiAgICB9XG4gICAgcmV0dXJuO1xuICB9XG4gIHRoaXMuZWxlbWVudCA9IHF1ZXJ5RWxlbWVudDtcbiAgLy8gZG8gbm90IGluaXRpYWxpemUgdHdpY2Ugb24gc2FtZSBlbGVtZW50XG4gIGlmICggdGhpcy5lbGVtZW50LmZsaWNraXR5R1VJRCApIHtcbiAgICB2YXIgaW5zdGFuY2UgPSBpbnN0YW5jZXNbIHRoaXMuZWxlbWVudC5mbGlja2l0eUdVSUQgXTtcbiAgICBpbnN0YW5jZS5vcHRpb24oIG9wdGlvbnMgKTtcbiAgICByZXR1cm4gaW5zdGFuY2U7XG4gIH1cblxuICAvLyBhZGQgalF1ZXJ5XG4gIGlmICggalF1ZXJ5ICkge1xuICAgIHRoaXMuJGVsZW1lbnQgPSBqUXVlcnkoIHRoaXMuZWxlbWVudCApO1xuICB9XG4gIC8vIG9wdGlvbnNcbiAgdGhpcy5vcHRpb25zID0gdXRpbHMuZXh0ZW5kKCB7fSwgdGhpcy5jb25zdHJ1Y3Rvci5kZWZhdWx0cyApO1xuICB0aGlzLm9wdGlvbiggb3B0aW9ucyApO1xuXG4gIC8vIGtpY2sgdGhpbmdzIG9mZlxuICB0aGlzLl9jcmVhdGUoKTtcbn1cblxuRmxpY2tpdHkuZGVmYXVsdHMgPSB7XG4gIGFjY2Vzc2liaWxpdHk6IHRydWUsXG4gIC8vIGFkYXB0aXZlSGVpZ2h0OiBmYWxzZSxcbiAgY2VsbEFsaWduOiAnY2VudGVyJyxcbiAgLy8gY2VsbFNlbGVjdG9yOiB1bmRlZmluZWQsXG4gIC8vIGNvbnRhaW46IGZhbHNlLFxuICBmcmVlU2Nyb2xsRnJpY3Rpb246IDAuMDc1LCAvLyBmcmljdGlvbiB3aGVuIGZyZWUtc2Nyb2xsaW5nXG4gIGZyaWN0aW9uOiAwLjI4LCAvLyBmcmljdGlvbiB3aGVuIHNlbGVjdGluZ1xuICBuYW1lc3BhY2VKUXVlcnlFdmVudHM6IHRydWUsXG4gIC8vIGluaXRpYWxJbmRleDogMCxcbiAgcGVyY2VudFBvc2l0aW9uOiB0cnVlLFxuICByZXNpemU6IHRydWUsXG4gIHNlbGVjdGVkQXR0cmFjdGlvbjogMC4wMjUsXG4gIHNldEdhbGxlcnlTaXplOiB0cnVlXG4gIC8vIHdhdGNoQ1NTOiBmYWxzZSxcbiAgLy8gd3JhcEFyb3VuZDogZmFsc2Vcbn07XG5cbi8vIGhhc2ggb2YgbWV0aG9kcyB0cmlnZ2VyZWQgb24gX2NyZWF0ZSgpXG5GbGlja2l0eS5jcmVhdGVNZXRob2RzID0gW107XG5cbnZhciBwcm90byA9IEZsaWNraXR5LnByb3RvdHlwZTtcbi8vIGluaGVyaXQgRXZlbnRFbWl0dGVyXG51dGlscy5leHRlbmQoIHByb3RvLCBFdkVtaXR0ZXIucHJvdG90eXBlICk7XG5cbnByb3RvLl9jcmVhdGUgPSBmdW5jdGlvbigpIHtcbiAgLy8gYWRkIGlkIGZvciBGbGlja2l0eS5kYXRhXG4gIHZhciBpZCA9IHRoaXMuZ3VpZCA9ICsrR1VJRDtcbiAgdGhpcy5lbGVtZW50LmZsaWNraXR5R1VJRCA9IGlkOyAvLyBleHBhbmRvXG4gIGluc3RhbmNlc1sgaWQgXSA9IHRoaXM7IC8vIGFzc29jaWF0ZSB2aWEgaWRcbiAgLy8gaW5pdGlhbCBwcm9wZXJ0aWVzXG4gIHRoaXMuc2VsZWN0ZWRJbmRleCA9IDA7XG4gIC8vIGhvdyBtYW55IGZyYW1lcyBzbGlkZXIgaGFzIGJlZW4gaW4gc2FtZSBwb3NpdGlvblxuICB0aGlzLnJlc3RpbmdGcmFtZXMgPSAwO1xuICAvLyBpbml0aWFsIHBoeXNpY3MgcHJvcGVydGllc1xuICB0aGlzLnggPSAwO1xuICB0aGlzLnZlbG9jaXR5ID0gMDtcbiAgdGhpcy5vcmlnaW5TaWRlID0gdGhpcy5vcHRpb25zLnJpZ2h0VG9MZWZ0ID8gJ3JpZ2h0JyA6ICdsZWZ0JztcbiAgLy8gY3JlYXRlIHZpZXdwb3J0ICYgc2xpZGVyXG4gIHRoaXMudmlld3BvcnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgdGhpcy52aWV3cG9ydC5jbGFzc05hbWUgPSAnZmxpY2tpdHktdmlld3BvcnQnO1xuICB0aGlzLl9jcmVhdGVTbGlkZXIoKTtcblxuICBpZiAoIHRoaXMub3B0aW9ucy5yZXNpemUgfHwgdGhpcy5vcHRpb25zLndhdGNoQ1NTICkge1xuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCAncmVzaXplJywgdGhpcyApO1xuICB9XG5cbiAgLy8gYWRkIGxpc3RlbmVycyBmcm9tIG9uIG9wdGlvblxuICBmb3IgKCB2YXIgZXZlbnROYW1lIGluIHRoaXMub3B0aW9ucy5vbiApIHtcbiAgICB2YXIgbGlzdGVuZXIgPSB0aGlzLm9wdGlvbnMub25bIGV2ZW50TmFtZSBdO1xuICAgIHRoaXMub24oIGV2ZW50TmFtZSwgbGlzdGVuZXIgKTtcbiAgfVxuXG4gIEZsaWNraXR5LmNyZWF0ZU1ldGhvZHMuZm9yRWFjaCggZnVuY3Rpb24oIG1ldGhvZCApIHtcbiAgICB0aGlzWyBtZXRob2QgXSgpO1xuICB9LCB0aGlzICk7XG5cbiAgaWYgKCB0aGlzLm9wdGlvbnMud2F0Y2hDU1MgKSB7XG4gICAgdGhpcy53YXRjaENTUygpO1xuICB9IGVsc2Uge1xuICAgIHRoaXMuYWN0aXZhdGUoKTtcbiAgfVxuXG59O1xuXG4vKipcbiAqIHNldCBvcHRpb25zXG4gKiBAcGFyYW0ge09iamVjdH0gb3B0c1xuICovXG5wcm90by5vcHRpb24gPSBmdW5jdGlvbiggb3B0cyApIHtcbiAgdXRpbHMuZXh0ZW5kKCB0aGlzLm9wdGlvbnMsIG9wdHMgKTtcbn07XG5cbnByb3RvLmFjdGl2YXRlID0gZnVuY3Rpb24oKSB7XG4gIGlmICggdGhpcy5pc0FjdGl2ZSApIHtcbiAgICByZXR1cm47XG4gIH1cbiAgdGhpcy5pc0FjdGl2ZSA9IHRydWU7XG4gIHRoaXMuZWxlbWVudC5jbGFzc0xpc3QuYWRkKCdmbGlja2l0eS1lbmFibGVkJyk7XG4gIGlmICggdGhpcy5vcHRpb25zLnJpZ2h0VG9MZWZ0ICkge1xuICAgIHRoaXMuZWxlbWVudC5jbGFzc0xpc3QuYWRkKCdmbGlja2l0eS1ydGwnKTtcbiAgfVxuXG4gIHRoaXMuZ2V0U2l6ZSgpO1xuICAvLyBtb3ZlIGluaXRpYWwgY2VsbCBlbGVtZW50cyBzbyB0aGV5IGNhbiBiZSBsb2FkZWQgYXMgY2VsbHNcbiAgdmFyIGNlbGxFbGVtcyA9IHRoaXMuX2ZpbHRlckZpbmRDZWxsRWxlbWVudHMoIHRoaXMuZWxlbWVudC5jaGlsZHJlbiApO1xuICBtb3ZlRWxlbWVudHMoIGNlbGxFbGVtcywgdGhpcy5zbGlkZXIgKTtcbiAgdGhpcy52aWV3cG9ydC5hcHBlbmRDaGlsZCggdGhpcy5zbGlkZXIgKTtcbiAgdGhpcy5lbGVtZW50LmFwcGVuZENoaWxkKCB0aGlzLnZpZXdwb3J0ICk7XG4gIC8vIGdldCBjZWxscyBmcm9tIGNoaWxkcmVuXG4gIHRoaXMucmVsb2FkQ2VsbHMoKTtcblxuICBpZiAoIHRoaXMub3B0aW9ucy5hY2Nlc3NpYmlsaXR5ICkge1xuICAgIC8vIGFsbG93IGVsZW1lbnQgdG8gZm9jdXNhYmxlXG4gICAgdGhpcy5lbGVtZW50LnRhYkluZGV4ID0gMDtcbiAgICAvLyBsaXN0ZW4gZm9yIGtleSBwcmVzc2VzXG4gICAgdGhpcy5lbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoICdrZXlkb3duJywgdGhpcyApO1xuICB9XG5cbiAgdGhpcy5lbWl0RXZlbnQoJ2FjdGl2YXRlJyk7XG4gIHRoaXMuc2VsZWN0SW5pdGlhbEluZGV4KCk7XG4gIC8vIGZsYWcgZm9yIGluaXRpYWwgYWN0aXZhdGlvbiwgZm9yIHVzaW5nIGluaXRpYWxJbmRleFxuICB0aGlzLmlzSW5pdEFjdGl2YXRlZCA9IHRydWU7XG4gIC8vIHJlYWR5IGV2ZW50LiAjNDkzXG4gIHRoaXMuZGlzcGF0Y2hFdmVudCgncmVhZHknKTtcbn07XG5cbi8vIHNsaWRlciBwb3NpdGlvbnMgdGhlIGNlbGxzXG5wcm90by5fY3JlYXRlU2xpZGVyID0gZnVuY3Rpb24oKSB7XG4gIC8vIHNsaWRlciBlbGVtZW50IGRvZXMgYWxsIHRoZSBwb3NpdGlvbmluZ1xuICB2YXIgc2xpZGVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gIHNsaWRlci5jbGFzc05hbWUgPSAnZmxpY2tpdHktc2xpZGVyJztcbiAgc2xpZGVyLnN0eWxlWyB0aGlzLm9yaWdpblNpZGUgXSA9IDA7XG4gIHRoaXMuc2xpZGVyID0gc2xpZGVyO1xufTtcblxucHJvdG8uX2ZpbHRlckZpbmRDZWxsRWxlbWVudHMgPSBmdW5jdGlvbiggZWxlbXMgKSB7XG4gIHJldHVybiB1dGlscy5maWx0ZXJGaW5kRWxlbWVudHMoIGVsZW1zLCB0aGlzLm9wdGlvbnMuY2VsbFNlbGVjdG9yICk7XG59O1xuXG4vLyBnb2VzIHRocm91Z2ggYWxsIGNoaWxkcmVuXG5wcm90by5yZWxvYWRDZWxscyA9IGZ1bmN0aW9uKCkge1xuICAvLyBjb2xsZWN0aW9uIG9mIGl0ZW0gZWxlbWVudHNcbiAgdGhpcy5jZWxscyA9IHRoaXMuX21ha2VDZWxscyggdGhpcy5zbGlkZXIuY2hpbGRyZW4gKTtcbiAgdGhpcy5wb3NpdGlvbkNlbGxzKCk7XG4gIHRoaXMuX2dldFdyYXBTaGlmdENlbGxzKCk7XG4gIHRoaXMuc2V0R2FsbGVyeVNpemUoKTtcbn07XG5cbi8qKlxuICogdHVybiBlbGVtZW50cyBpbnRvIEZsaWNraXR5LkNlbGxzXG4gKiBAcGFyYW0ge0FycmF5IG9yIE5vZGVMaXN0IG9yIEhUTUxFbGVtZW50fSBlbGVtc1xuICogQHJldHVybnMge0FycmF5fSBpdGVtcyAtIGNvbGxlY3Rpb24gb2YgbmV3IEZsaWNraXR5IENlbGxzXG4gKi9cbnByb3RvLl9tYWtlQ2VsbHMgPSBmdW5jdGlvbiggZWxlbXMgKSB7XG4gIHZhciBjZWxsRWxlbXMgPSB0aGlzLl9maWx0ZXJGaW5kQ2VsbEVsZW1lbnRzKCBlbGVtcyApO1xuXG4gIC8vIGNyZWF0ZSBuZXcgRmxpY2tpdHkgZm9yIGNvbGxlY3Rpb25cbiAgdmFyIGNlbGxzID0gY2VsbEVsZW1zLm1hcCggZnVuY3Rpb24oIGNlbGxFbGVtICkge1xuICAgIHJldHVybiBuZXcgQ2VsbCggY2VsbEVsZW0sIHRoaXMgKTtcbiAgfSwgdGhpcyApO1xuXG4gIHJldHVybiBjZWxscztcbn07XG5cbnByb3RvLmdldExhc3RDZWxsID0gZnVuY3Rpb24oKSB7XG4gIHJldHVybiB0aGlzLmNlbGxzWyB0aGlzLmNlbGxzLmxlbmd0aCAtIDEgXTtcbn07XG5cbnByb3RvLmdldExhc3RTbGlkZSA9IGZ1bmN0aW9uKCkge1xuICByZXR1cm4gdGhpcy5zbGlkZXNbIHRoaXMuc2xpZGVzLmxlbmd0aCAtIDEgXTtcbn07XG5cbi8vIHBvc2l0aW9ucyBhbGwgY2VsbHNcbnByb3RvLnBvc2l0aW9uQ2VsbHMgPSBmdW5jdGlvbigpIHtcbiAgLy8gc2l6ZSBhbGwgY2VsbHNcbiAgdGhpcy5fc2l6ZUNlbGxzKCB0aGlzLmNlbGxzICk7XG4gIC8vIHBvc2l0aW9uIGFsbCBjZWxsc1xuICB0aGlzLl9wb3NpdGlvbkNlbGxzKCAwICk7XG59O1xuXG4vKipcbiAqIHBvc2l0aW9uIGNlcnRhaW4gY2VsbHNcbiAqIEBwYXJhbSB7SW50ZWdlcn0gaW5kZXggLSB3aGljaCBjZWxsIHRvIHN0YXJ0IHdpdGhcbiAqL1xucHJvdG8uX3Bvc2l0aW9uQ2VsbHMgPSBmdW5jdGlvbiggaW5kZXggKSB7XG4gIGluZGV4ID0gaW5kZXggfHwgMDtcbiAgLy8gYWxzbyBtZWFzdXJlIG1heENlbGxIZWlnaHRcbiAgLy8gc3RhcnQgMCBpZiBwb3NpdGlvbmluZyBhbGwgY2VsbHNcbiAgdGhpcy5tYXhDZWxsSGVpZ2h0ID0gaW5kZXggPyB0aGlzLm1heENlbGxIZWlnaHQgfHwgMCA6IDA7XG4gIHZhciBjZWxsWCA9IDA7XG4gIC8vIGdldCBjZWxsWFxuICBpZiAoIGluZGV4ID4gMCApIHtcbiAgICB2YXIgc3RhcnRDZWxsID0gdGhpcy5jZWxsc1sgaW5kZXggLSAxIF07XG4gICAgY2VsbFggPSBzdGFydENlbGwueCArIHN0YXJ0Q2VsbC5zaXplLm91dGVyV2lkdGg7XG4gIH1cbiAgdmFyIGxlbiA9IHRoaXMuY2VsbHMubGVuZ3RoO1xuICBmb3IgKCB2YXIgaT1pbmRleDsgaSA8IGxlbjsgaSsrICkge1xuICAgIHZhciBjZWxsID0gdGhpcy5jZWxsc1tpXTtcbiAgICBjZWxsLnNldFBvc2l0aW9uKCBjZWxsWCApO1xuICAgIGNlbGxYICs9IGNlbGwuc2l6ZS5vdXRlcldpZHRoO1xuICAgIHRoaXMubWF4Q2VsbEhlaWdodCA9IE1hdGgubWF4KCBjZWxsLnNpemUub3V0ZXJIZWlnaHQsIHRoaXMubWF4Q2VsbEhlaWdodCApO1xuICB9XG4gIC8vIGtlZXAgdHJhY2sgb2YgY2VsbFggZm9yIHdyYXAtYXJvdW5kXG4gIHRoaXMuc2xpZGVhYmxlV2lkdGggPSBjZWxsWDtcbiAgLy8gc2xpZGVzXG4gIHRoaXMudXBkYXRlU2xpZGVzKCk7XG4gIC8vIGNvbnRhaW4gc2xpZGVzIHRhcmdldFxuICB0aGlzLl9jb250YWluU2xpZGVzKCk7XG4gIC8vIHVwZGF0ZSBzbGlkZXNXaWR0aFxuICB0aGlzLnNsaWRlc1dpZHRoID0gbGVuID8gdGhpcy5nZXRMYXN0U2xpZGUoKS50YXJnZXQgLSB0aGlzLnNsaWRlc1swXS50YXJnZXQgOiAwO1xufTtcblxuLyoqXG4gKiBjZWxsLmdldFNpemUoKSBvbiBtdWx0aXBsZSBjZWxsc1xuICogQHBhcmFtIHtBcnJheX0gY2VsbHNcbiAqL1xucHJvdG8uX3NpemVDZWxscyA9IGZ1bmN0aW9uKCBjZWxscyApIHtcbiAgY2VsbHMuZm9yRWFjaCggZnVuY3Rpb24oIGNlbGwgKSB7XG4gICAgY2VsbC5nZXRTaXplKCk7XG4gIH0pO1xufTtcblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIC8vXG5cbnByb3RvLnVwZGF0ZVNsaWRlcyA9IGZ1bmN0aW9uKCkge1xuICB0aGlzLnNsaWRlcyA9IFtdO1xuICBpZiAoICF0aGlzLmNlbGxzLmxlbmd0aCApIHtcbiAgICByZXR1cm47XG4gIH1cblxuICB2YXIgc2xpZGUgPSBuZXcgU2xpZGUoIHRoaXMgKTtcbiAgdGhpcy5zbGlkZXMucHVzaCggc2xpZGUgKTtcbiAgdmFyIGlzT3JpZ2luTGVmdCA9IHRoaXMub3JpZ2luU2lkZSA9PSAnbGVmdCc7XG4gIHZhciBuZXh0TWFyZ2luID0gaXNPcmlnaW5MZWZ0ID8gJ21hcmdpblJpZ2h0JyA6ICdtYXJnaW5MZWZ0JztcblxuICB2YXIgY2FuQ2VsbEZpdCA9IHRoaXMuX2dldENhbkNlbGxGaXQoKTtcblxuICB0aGlzLmNlbGxzLmZvckVhY2goIGZ1bmN0aW9uKCBjZWxsLCBpICkge1xuICAgIC8vIGp1c3QgYWRkIGNlbGwgaWYgZmlyc3QgY2VsbCBpbiBzbGlkZVxuICAgIGlmICggIXNsaWRlLmNlbGxzLmxlbmd0aCApIHtcbiAgICAgIHNsaWRlLmFkZENlbGwoIGNlbGwgKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB2YXIgc2xpZGVXaWR0aCA9ICggc2xpZGUub3V0ZXJXaWR0aCAtIHNsaWRlLmZpcnN0TWFyZ2luICkgK1xuICAgICAgKCBjZWxsLnNpemUub3V0ZXJXaWR0aCAtIGNlbGwuc2l6ZVsgbmV4dE1hcmdpbiBdICk7XG5cbiAgICBpZiAoIGNhbkNlbGxGaXQuY2FsbCggdGhpcywgaSwgc2xpZGVXaWR0aCApICkge1xuICAgICAgc2xpZGUuYWRkQ2VsbCggY2VsbCApO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBkb2Vzbid0IGZpdCwgbmV3IHNsaWRlXG4gICAgICBzbGlkZS51cGRhdGVUYXJnZXQoKTtcblxuICAgICAgc2xpZGUgPSBuZXcgU2xpZGUoIHRoaXMgKTtcbiAgICAgIHRoaXMuc2xpZGVzLnB1c2goIHNsaWRlICk7XG4gICAgICBzbGlkZS5hZGRDZWxsKCBjZWxsICk7XG4gICAgfVxuICB9LCB0aGlzICk7XG4gIC8vIGxhc3Qgc2xpZGVcbiAgc2xpZGUudXBkYXRlVGFyZ2V0KCk7XG4gIC8vIHVwZGF0ZSAuc2VsZWN0ZWRTbGlkZVxuICB0aGlzLnVwZGF0ZVNlbGVjdGVkU2xpZGUoKTtcbn07XG5cbnByb3RvLl9nZXRDYW5DZWxsRml0ID0gZnVuY3Rpb24oKSB7XG4gIHZhciBncm91cENlbGxzID0gdGhpcy5vcHRpb25zLmdyb3VwQ2VsbHM7XG4gIGlmICggIWdyb3VwQ2VsbHMgKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH07XG4gIH0gZWxzZSBpZiAoIHR5cGVvZiBncm91cENlbGxzID09ICdudW1iZXInICkge1xuICAgIC8vIGdyb3VwIGJ5IG51bWJlci4gMyAtPiBbMCwxLDJdLCBbMyw0LDVdLCAuLi5cbiAgICB2YXIgbnVtYmVyID0gcGFyc2VJbnQoIGdyb3VwQ2VsbHMsIDEwICk7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKCBpICkge1xuICAgICAgcmV0dXJuICggaSAlIG51bWJlciApICE9PSAwO1xuICAgIH07XG4gIH1cbiAgLy8gZGVmYXVsdCwgZ3JvdXAgYnkgd2lkdGggb2Ygc2xpZGVcbiAgLy8gcGFyc2UgJzc1JVxuICB2YXIgcGVyY2VudE1hdGNoID0gdHlwZW9mIGdyb3VwQ2VsbHMgPT0gJ3N0cmluZycgJiZcbiAgICBncm91cENlbGxzLm1hdGNoKC9eKFxcZCspJSQvKTtcbiAgdmFyIHBlcmNlbnQgPSBwZXJjZW50TWF0Y2ggPyBwYXJzZUludCggcGVyY2VudE1hdGNoWzFdLCAxMCApIC8gMTAwIDogMTtcbiAgcmV0dXJuIGZ1bmN0aW9uKCBpLCBzbGlkZVdpZHRoICkge1xuICAgIHJldHVybiBzbGlkZVdpZHRoIDw9ICggdGhpcy5zaXplLmlubmVyV2lkdGggKyAxICkgKiBwZXJjZW50O1xuICB9O1xufTtcblxuLy8gYWxpYXMgX2luaXQgZm9yIGpRdWVyeSBwbHVnaW4gLmZsaWNraXR5KClcbnByb3RvLl9pbml0ID1cbnByb3RvLnJlcG9zaXRpb24gPSBmdW5jdGlvbigpIHtcbiAgdGhpcy5wb3NpdGlvbkNlbGxzKCk7XG4gIHRoaXMucG9zaXRpb25TbGlkZXJBdFNlbGVjdGVkKCk7XG59O1xuXG5wcm90by5nZXRTaXplID0gZnVuY3Rpb24oKSB7XG4gIHRoaXMuc2l6ZSA9IGdldFNpemUoIHRoaXMuZWxlbWVudCApO1xuICB0aGlzLnNldENlbGxBbGlnbigpO1xuICB0aGlzLmN1cnNvclBvc2l0aW9uID0gdGhpcy5zaXplLmlubmVyV2lkdGggKiB0aGlzLmNlbGxBbGlnbjtcbn07XG5cbnZhciBjZWxsQWxpZ25TaG9ydGhhbmRzID0ge1xuICAvLyBjZWxsIGFsaWduLCB0aGVuIGJhc2VkIG9uIG9yaWdpbiBzaWRlXG4gIGNlbnRlcjoge1xuICAgIGxlZnQ6IDAuNSxcbiAgICByaWdodDogMC41XG4gIH0sXG4gIGxlZnQ6IHtcbiAgICBsZWZ0OiAwLFxuICAgIHJpZ2h0OiAxXG4gIH0sXG4gIHJpZ2h0OiB7XG4gICAgcmlnaHQ6IDAsXG4gICAgbGVmdDogMVxuICB9XG59O1xuXG5wcm90by5zZXRDZWxsQWxpZ24gPSBmdW5jdGlvbigpIHtcbiAgdmFyIHNob3J0aGFuZCA9IGNlbGxBbGlnblNob3J0aGFuZHNbIHRoaXMub3B0aW9ucy5jZWxsQWxpZ24gXTtcbiAgdGhpcy5jZWxsQWxpZ24gPSBzaG9ydGhhbmQgPyBzaG9ydGhhbmRbIHRoaXMub3JpZ2luU2lkZSBdIDogdGhpcy5vcHRpb25zLmNlbGxBbGlnbjtcbn07XG5cbnByb3RvLnNldEdhbGxlcnlTaXplID0gZnVuY3Rpb24oKSB7XG4gIGlmICggdGhpcy5vcHRpb25zLnNldEdhbGxlcnlTaXplICkge1xuICAgIHZhciBoZWlnaHQgPSB0aGlzLm9wdGlvbnMuYWRhcHRpdmVIZWlnaHQgJiYgdGhpcy5zZWxlY3RlZFNsaWRlID9cbiAgICAgIHRoaXMuc2VsZWN0ZWRTbGlkZS5oZWlnaHQgOiB0aGlzLm1heENlbGxIZWlnaHQ7XG4gICAgdGhpcy52aWV3cG9ydC5zdHlsZS5oZWlnaHQgPSBoZWlnaHQgKyAncHgnO1xuICB9XG59O1xuXG5wcm90by5fZ2V0V3JhcFNoaWZ0Q2VsbHMgPSBmdW5jdGlvbigpIHtcbiAgLy8gb25seSBmb3Igd3JhcC1hcm91bmRcbiAgaWYgKCAhdGhpcy5vcHRpb25zLndyYXBBcm91bmQgKSB7XG4gICAgcmV0dXJuO1xuICB9XG4gIC8vIHVuc2hpZnQgcHJldmlvdXMgY2VsbHNcbiAgdGhpcy5fdW5zaGlmdENlbGxzKCB0aGlzLmJlZm9yZVNoaWZ0Q2VsbHMgKTtcbiAgdGhpcy5fdW5zaGlmdENlbGxzKCB0aGlzLmFmdGVyU2hpZnRDZWxscyApO1xuICAvLyBnZXQgYmVmb3JlIGNlbGxzXG4gIC8vIGluaXRpYWwgZ2FwXG4gIHZhciBnYXBYID0gdGhpcy5jdXJzb3JQb3NpdGlvbjtcbiAgdmFyIGNlbGxJbmRleCA9IHRoaXMuY2VsbHMubGVuZ3RoIC0gMTtcbiAgdGhpcy5iZWZvcmVTaGlmdENlbGxzID0gdGhpcy5fZ2V0R2FwQ2VsbHMoIGdhcFgsIGNlbGxJbmRleCwgLTEgKTtcbiAgLy8gZ2V0IGFmdGVyIGNlbGxzXG4gIC8vIGVuZGluZyBnYXAgYmV0d2VlbiBsYXN0IGNlbGwgYW5kIGVuZCBvZiBnYWxsZXJ5IHZpZXdwb3J0XG4gIGdhcFggPSB0aGlzLnNpemUuaW5uZXJXaWR0aCAtIHRoaXMuY3Vyc29yUG9zaXRpb247XG4gIC8vIHN0YXJ0IGNsb25pbmcgYXQgZmlyc3QgY2VsbCwgd29ya2luZyBmb3J3YXJkc1xuICB0aGlzLmFmdGVyU2hpZnRDZWxscyA9IHRoaXMuX2dldEdhcENlbGxzKCBnYXBYLCAwLCAxICk7XG59O1xuXG5wcm90by5fZ2V0R2FwQ2VsbHMgPSBmdW5jdGlvbiggZ2FwWCwgY2VsbEluZGV4LCBpbmNyZW1lbnQgKSB7XG4gIC8vIGtlZXAgYWRkaW5nIGNlbGxzIHVudGlsIHRoZSBjb3ZlciB0aGUgaW5pdGlhbCBnYXBcbiAgdmFyIGNlbGxzID0gW107XG4gIHdoaWxlICggZ2FwWCA+IDAgKSB7XG4gICAgdmFyIGNlbGwgPSB0aGlzLmNlbGxzWyBjZWxsSW5kZXggXTtcbiAgICBpZiAoICFjZWxsICkge1xuICAgICAgYnJlYWs7XG4gICAgfVxuICAgIGNlbGxzLnB1c2goIGNlbGwgKTtcbiAgICBjZWxsSW5kZXggKz0gaW5jcmVtZW50O1xuICAgIGdhcFggLT0gY2VsbC5zaXplLm91dGVyV2lkdGg7XG4gIH1cbiAgcmV0dXJuIGNlbGxzO1xufTtcblxuLy8gLS0tLS0gY29udGFpbiAtLS0tLSAvL1xuXG4vLyBjb250YWluIGNlbGwgdGFyZ2V0cyBzbyBubyBleGNlc3Mgc2xpZGluZ1xucHJvdG8uX2NvbnRhaW5TbGlkZXMgPSBmdW5jdGlvbigpIHtcbiAgaWYgKCAhdGhpcy5vcHRpb25zLmNvbnRhaW4gfHwgdGhpcy5vcHRpb25zLndyYXBBcm91bmQgfHwgIXRoaXMuY2VsbHMubGVuZ3RoICkge1xuICAgIHJldHVybjtcbiAgfVxuICB2YXIgaXNSaWdodFRvTGVmdCA9IHRoaXMub3B0aW9ucy5yaWdodFRvTGVmdDtcbiAgdmFyIGJlZ2luTWFyZ2luID0gaXNSaWdodFRvTGVmdCA/ICdtYXJnaW5SaWdodCcgOiAnbWFyZ2luTGVmdCc7XG4gIHZhciBlbmRNYXJnaW4gPSBpc1JpZ2h0VG9MZWZ0ID8gJ21hcmdpbkxlZnQnIDogJ21hcmdpblJpZ2h0JztcbiAgdmFyIGNvbnRlbnRXaWR0aCA9IHRoaXMuc2xpZGVhYmxlV2lkdGggLSB0aGlzLmdldExhc3RDZWxsKCkuc2l6ZVsgZW5kTWFyZ2luIF07XG4gIC8vIGNvbnRlbnQgaXMgbGVzcyB0aGFuIGdhbGxlcnkgc2l6ZVxuICB2YXIgaXNDb250ZW50U21hbGxlciA9IGNvbnRlbnRXaWR0aCA8IHRoaXMuc2l6ZS5pbm5lcldpZHRoO1xuICAvLyBib3VuZHNcbiAgdmFyIGJlZ2luQm91bmQgPSB0aGlzLmN1cnNvclBvc2l0aW9uICsgdGhpcy5jZWxsc1swXS5zaXplWyBiZWdpbk1hcmdpbiBdO1xuICB2YXIgZW5kQm91bmQgPSBjb250ZW50V2lkdGggLSB0aGlzLnNpemUuaW5uZXJXaWR0aCAqICggMSAtIHRoaXMuY2VsbEFsaWduICk7XG4gIC8vIGNvbnRhaW4gZWFjaCBjZWxsIHRhcmdldFxuICB0aGlzLnNsaWRlcy5mb3JFYWNoKCBmdW5jdGlvbiggc2xpZGUgKSB7XG4gICAgaWYgKCBpc0NvbnRlbnRTbWFsbGVyICkge1xuICAgICAgLy8gYWxsIGNlbGxzIGZpdCBpbnNpZGUgZ2FsbGVyeVxuICAgICAgc2xpZGUudGFyZ2V0ID0gY29udGVudFdpZHRoICogdGhpcy5jZWxsQWxpZ247XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIGNvbnRhaW4gdG8gYm91bmRzXG4gICAgICBzbGlkZS50YXJnZXQgPSBNYXRoLm1heCggc2xpZGUudGFyZ2V0LCBiZWdpbkJvdW5kICk7XG4gICAgICBzbGlkZS50YXJnZXQgPSBNYXRoLm1pbiggc2xpZGUudGFyZ2V0LCBlbmRCb3VuZCApO1xuICAgIH1cbiAgfSwgdGhpcyApO1xufTtcblxuLy8gLS0tLS0gIC0tLS0tIC8vXG5cbi8qKlxuICogZW1pdHMgZXZlbnRzIHZpYSBldmVudEVtaXR0ZXIgYW5kIGpRdWVyeSBldmVudHNcbiAqIEBwYXJhbSB7U3RyaW5nfSB0eXBlIC0gbmFtZSBvZiBldmVudFxuICogQHBhcmFtIHtFdmVudH0gZXZlbnQgLSBvcmlnaW5hbCBldmVudFxuICogQHBhcmFtIHtBcnJheX0gYXJncyAtIGV4dHJhIGFyZ3VtZW50c1xuICovXG5wcm90by5kaXNwYXRjaEV2ZW50ID0gZnVuY3Rpb24oIHR5cGUsIGV2ZW50LCBhcmdzICkge1xuICB2YXIgZW1pdEFyZ3MgPSBldmVudCA/IFsgZXZlbnQgXS5jb25jYXQoIGFyZ3MgKSA6IGFyZ3M7XG4gIHRoaXMuZW1pdEV2ZW50KCB0eXBlLCBlbWl0QXJncyApO1xuXG4gIGlmICggalF1ZXJ5ICYmIHRoaXMuJGVsZW1lbnQgKSB7XG4gICAgLy8gZGVmYXVsdCB0cmlnZ2VyIHdpdGggdHlwZSBpZiBubyBldmVudFxuICAgIHR5cGUgKz0gdGhpcy5vcHRpb25zLm5hbWVzcGFjZUpRdWVyeUV2ZW50cyA/ICcuZmxpY2tpdHknIDogJyc7XG4gICAgdmFyICRldmVudCA9IHR5cGU7XG4gICAgaWYgKCBldmVudCApIHtcbiAgICAgIC8vIGNyZWF0ZSBqUXVlcnkgZXZlbnRcbiAgICAgIHZhciBqUUV2ZW50ID0galF1ZXJ5LkV2ZW50KCBldmVudCApO1xuICAgICAgalFFdmVudC50eXBlID0gdHlwZTtcbiAgICAgICRldmVudCA9IGpRRXZlbnQ7XG4gICAgfVxuICAgIHRoaXMuJGVsZW1lbnQudHJpZ2dlciggJGV2ZW50LCBhcmdzICk7XG4gIH1cbn07XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIHNlbGVjdCAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSAvL1xuXG4vKipcbiAqIEBwYXJhbSB7SW50ZWdlcn0gaW5kZXggLSBpbmRleCBvZiB0aGUgc2xpZGVcbiAqIEBwYXJhbSB7Qm9vbGVhbn0gaXNXcmFwIC0gd2lsbCB3cmFwLWFyb3VuZCB0byBsYXN0L2ZpcnN0IGlmIGF0IHRoZSBlbmRcbiAqIEBwYXJhbSB7Qm9vbGVhbn0gaXNJbnN0YW50IC0gd2lsbCBpbW1lZGlhdGVseSBzZXQgcG9zaXRpb24gYXQgc2VsZWN0ZWQgY2VsbFxuICovXG5wcm90by5zZWxlY3QgPSBmdW5jdGlvbiggaW5kZXgsIGlzV3JhcCwgaXNJbnN0YW50ICkge1xuICBpZiAoICF0aGlzLmlzQWN0aXZlICkge1xuICAgIHJldHVybjtcbiAgfVxuICBpbmRleCA9IHBhcnNlSW50KCBpbmRleCwgMTAgKTtcbiAgdGhpcy5fd3JhcFNlbGVjdCggaW5kZXggKTtcblxuICBpZiAoIHRoaXMub3B0aW9ucy53cmFwQXJvdW5kIHx8IGlzV3JhcCApIHtcbiAgICBpbmRleCA9IHV0aWxzLm1vZHVsbyggaW5kZXgsIHRoaXMuc2xpZGVzLmxlbmd0aCApO1xuICB9XG4gIC8vIGJhaWwgaWYgaW52YWxpZCBpbmRleFxuICBpZiAoICF0aGlzLnNsaWRlc1sgaW5kZXggXSApIHtcbiAgICByZXR1cm47XG4gIH1cbiAgdmFyIHByZXZJbmRleCA9IHRoaXMuc2VsZWN0ZWRJbmRleDtcbiAgdGhpcy5zZWxlY3RlZEluZGV4ID0gaW5kZXg7XG4gIHRoaXMudXBkYXRlU2VsZWN0ZWRTbGlkZSgpO1xuICBpZiAoIGlzSW5zdGFudCApIHtcbiAgICB0aGlzLnBvc2l0aW9uU2xpZGVyQXRTZWxlY3RlZCgpO1xuICB9IGVsc2Uge1xuICAgIHRoaXMuc3RhcnRBbmltYXRpb24oKTtcbiAgfVxuICBpZiAoIHRoaXMub3B0aW9ucy5hZGFwdGl2ZUhlaWdodCApIHtcbiAgICB0aGlzLnNldEdhbGxlcnlTaXplKCk7XG4gIH1cbiAgLy8gZXZlbnRzXG4gIHRoaXMuZGlzcGF0Y2hFdmVudCggJ3NlbGVjdCcsIG51bGwsIFsgaW5kZXggXSApO1xuICAvLyBjaGFuZ2UgZXZlbnQgaWYgbmV3IGluZGV4XG4gIGlmICggaW5kZXggIT0gcHJldkluZGV4ICkge1xuICAgIHRoaXMuZGlzcGF0Y2hFdmVudCggJ2NoYW5nZScsIG51bGwsIFsgaW5kZXggXSApO1xuICB9XG4gIC8vIG9sZCB2MSBldmVudCBuYW1lLCByZW1vdmUgaW4gdjNcbiAgdGhpcy5kaXNwYXRjaEV2ZW50KCdjZWxsU2VsZWN0Jyk7XG59O1xuXG4vLyB3cmFwcyBwb3NpdGlvbiBmb3Igd3JhcEFyb3VuZCwgdG8gbW92ZSB0byBjbG9zZXN0IHNsaWRlLiAjMTEzXG5wcm90by5fd3JhcFNlbGVjdCA9IGZ1bmN0aW9uKCBpbmRleCApIHtcbiAgdmFyIGxlbiA9IHRoaXMuc2xpZGVzLmxlbmd0aDtcbiAgdmFyIGlzV3JhcHBpbmcgPSB0aGlzLm9wdGlvbnMud3JhcEFyb3VuZCAmJiBsZW4gPiAxO1xuICBpZiAoICFpc1dyYXBwaW5nICkge1xuICAgIHJldHVybiBpbmRleDtcbiAgfVxuICB2YXIgd3JhcEluZGV4ID0gdXRpbHMubW9kdWxvKCBpbmRleCwgbGVuICk7XG4gIC8vIGdvIHRvIHNob3J0ZXN0XG4gIHZhciBkZWx0YSA9IE1hdGguYWJzKCB3cmFwSW5kZXggLSB0aGlzLnNlbGVjdGVkSW5kZXggKTtcbiAgdmFyIGJhY2tXcmFwRGVsdGEgPSBNYXRoLmFicyggKCB3cmFwSW5kZXggKyBsZW4gKSAtIHRoaXMuc2VsZWN0ZWRJbmRleCApO1xuICB2YXIgZm9yZXdhcmRXcmFwRGVsdGEgPSBNYXRoLmFicyggKCB3cmFwSW5kZXggLSBsZW4gKSAtIHRoaXMuc2VsZWN0ZWRJbmRleCApO1xuICBpZiAoICF0aGlzLmlzRHJhZ1NlbGVjdCAmJiBiYWNrV3JhcERlbHRhIDwgZGVsdGEgKSB7XG4gICAgaW5kZXggKz0gbGVuO1xuICB9IGVsc2UgaWYgKCAhdGhpcy5pc0RyYWdTZWxlY3QgJiYgZm9yZXdhcmRXcmFwRGVsdGEgPCBkZWx0YSApIHtcbiAgICBpbmRleCAtPSBsZW47XG4gIH1cbiAgLy8gd3JhcCBwb3NpdGlvbiBzbyBzbGlkZXIgaXMgd2l0aGluIG5vcm1hbCBhcmVhXG4gIGlmICggaW5kZXggPCAwICkge1xuICAgIHRoaXMueCAtPSB0aGlzLnNsaWRlYWJsZVdpZHRoO1xuICB9IGVsc2UgaWYgKCBpbmRleCA+PSBsZW4gKSB7XG4gICAgdGhpcy54ICs9IHRoaXMuc2xpZGVhYmxlV2lkdGg7XG4gIH1cbn07XG5cbnByb3RvLnByZXZpb3VzID0gZnVuY3Rpb24oIGlzV3JhcCwgaXNJbnN0YW50ICkge1xuICB0aGlzLnNlbGVjdCggdGhpcy5zZWxlY3RlZEluZGV4IC0gMSwgaXNXcmFwLCBpc0luc3RhbnQgKTtcbn07XG5cbnByb3RvLm5leHQgPSBmdW5jdGlvbiggaXNXcmFwLCBpc0luc3RhbnQgKSB7XG4gIHRoaXMuc2VsZWN0KCB0aGlzLnNlbGVjdGVkSW5kZXggKyAxLCBpc1dyYXAsIGlzSW5zdGFudCApO1xufTtcblxucHJvdG8udXBkYXRlU2VsZWN0ZWRTbGlkZSA9IGZ1bmN0aW9uKCkge1xuICB2YXIgc2xpZGUgPSB0aGlzLnNsaWRlc1sgdGhpcy5zZWxlY3RlZEluZGV4IF07XG4gIC8vIHNlbGVjdGVkSW5kZXggY291bGQgYmUgb3V0c2lkZSBvZiBzbGlkZXMsIGlmIHRyaWdnZXJlZCBiZWZvcmUgcmVzaXplKClcbiAgaWYgKCAhc2xpZGUgKSB7XG4gICAgcmV0dXJuO1xuICB9XG4gIC8vIHVuc2VsZWN0IHByZXZpb3VzIHNlbGVjdGVkIHNsaWRlXG4gIHRoaXMudW5zZWxlY3RTZWxlY3RlZFNsaWRlKCk7XG4gIC8vIHVwZGF0ZSBuZXcgc2VsZWN0ZWQgc2xpZGVcbiAgdGhpcy5zZWxlY3RlZFNsaWRlID0gc2xpZGU7XG4gIHNsaWRlLnNlbGVjdCgpO1xuICB0aGlzLnNlbGVjdGVkQ2VsbHMgPSBzbGlkZS5jZWxscztcbiAgdGhpcy5zZWxlY3RlZEVsZW1lbnRzID0gc2xpZGUuZ2V0Q2VsbEVsZW1lbnRzKCk7XG4gIC8vIEhBQ0s6IHNlbGVjdGVkQ2VsbCAmIHNlbGVjdGVkRWxlbWVudCBpcyBmaXJzdCBjZWxsIGluIHNsaWRlLCBiYWNrd2FyZHMgY29tcGF0aWJpbGl0eVxuICAvLyBSZW1vdmUgaW4gdjM/XG4gIHRoaXMuc2VsZWN0ZWRDZWxsID0gc2xpZGUuY2VsbHNbMF07XG4gIHRoaXMuc2VsZWN0ZWRFbGVtZW50ID0gdGhpcy5zZWxlY3RlZEVsZW1lbnRzWzBdO1xufTtcblxucHJvdG8udW5zZWxlY3RTZWxlY3RlZFNsaWRlID0gZnVuY3Rpb24oKSB7XG4gIGlmICggdGhpcy5zZWxlY3RlZFNsaWRlICkge1xuICAgIHRoaXMuc2VsZWN0ZWRTbGlkZS51bnNlbGVjdCgpO1xuICB9XG59O1xuXG5wcm90by5zZWxlY3RJbml0aWFsSW5kZXggPSBmdW5jdGlvbigpIHtcbiAgdmFyIGluaXRpYWxJbmRleCA9IHRoaXMub3B0aW9ucy5pbml0aWFsSW5kZXg7XG4gIC8vIGFscmVhZHkgYWN0aXZhdGVkLCBzZWxlY3QgcHJldmlvdXMgc2VsZWN0ZWRJbmRleFxuICBpZiAoIHRoaXMuaXNJbml0QWN0aXZhdGVkICkge1xuICAgIHRoaXMuc2VsZWN0KCB0aGlzLnNlbGVjdGVkSW5kZXgsIGZhbHNlLCB0cnVlICk7XG4gICAgcmV0dXJuO1xuICB9XG4gIC8vIHNlbGVjdCB3aXRoIHNlbGVjdG9yIHN0cmluZ1xuICBpZiAoIGluaXRpYWxJbmRleCAmJiB0eXBlb2YgaW5pdGlhbEluZGV4ID09ICdzdHJpbmcnICkge1xuICAgIHZhciBjZWxsID0gdGhpcy5xdWVyeUNlbGwoIGluaXRpYWxJbmRleCApO1xuICAgIGlmICggY2VsbCApIHtcbiAgICAgIHRoaXMuc2VsZWN0Q2VsbCggaW5pdGlhbEluZGV4LCBmYWxzZSwgdHJ1ZSApO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgfVxuXG4gIHZhciBpbmRleCA9IDA7XG4gIC8vIHNlbGVjdCB3aXRoIG51bWJlclxuICBpZiAoIGluaXRpYWxJbmRleCAmJiB0aGlzLnNsaWRlc1sgaW5pdGlhbEluZGV4IF0gKSB7XG4gICAgaW5kZXggPSBpbml0aWFsSW5kZXg7XG4gIH1cbiAgLy8gc2VsZWN0IGluc3RhbnRseVxuICB0aGlzLnNlbGVjdCggaW5kZXgsIGZhbHNlLCB0cnVlICk7XG59O1xuXG4vKipcbiAqIHNlbGVjdCBzbGlkZSBmcm9tIG51bWJlciBvciBjZWxsIGVsZW1lbnRcbiAqIEBwYXJhbSB7RWxlbWVudCBvciBOdW1iZXJ9IGVsZW1cbiAqL1xucHJvdG8uc2VsZWN0Q2VsbCA9IGZ1bmN0aW9uKCB2YWx1ZSwgaXNXcmFwLCBpc0luc3RhbnQgKSB7XG4gIC8vIGdldCBjZWxsXG4gIHZhciBjZWxsID0gdGhpcy5xdWVyeUNlbGwoIHZhbHVlICk7XG4gIGlmICggIWNlbGwgKSB7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgdmFyIGluZGV4ID0gdGhpcy5nZXRDZWxsU2xpZGVJbmRleCggY2VsbCApO1xuICB0aGlzLnNlbGVjdCggaW5kZXgsIGlzV3JhcCwgaXNJbnN0YW50ICk7XG59O1xuXG5wcm90by5nZXRDZWxsU2xpZGVJbmRleCA9IGZ1bmN0aW9uKCBjZWxsICkge1xuICAvLyBnZXQgaW5kZXggb2Ygc2xpZGVzIHRoYXQgaGFzIGNlbGxcbiAgZm9yICggdmFyIGk9MDsgaSA8IHRoaXMuc2xpZGVzLmxlbmd0aDsgaSsrICkge1xuICAgIHZhciBzbGlkZSA9IHRoaXMuc2xpZGVzW2ldO1xuICAgIHZhciBpbmRleCA9IHNsaWRlLmNlbGxzLmluZGV4T2YoIGNlbGwgKTtcbiAgICBpZiAoIGluZGV4ICE9IC0xICkge1xuICAgICAgcmV0dXJuIGk7XG4gICAgfVxuICB9XG59O1xuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSBnZXQgY2VsbHMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gLy9cblxuLyoqXG4gKiBnZXQgRmxpY2tpdHkuQ2VsbCwgZ2l2ZW4gYW4gRWxlbWVudFxuICogQHBhcmFtIHtFbGVtZW50fSBlbGVtXG4gKiBAcmV0dXJucyB7RmxpY2tpdHkuQ2VsbH0gaXRlbVxuICovXG5wcm90by5nZXRDZWxsID0gZnVuY3Rpb24oIGVsZW0gKSB7XG4gIC8vIGxvb3AgdGhyb3VnaCBjZWxscyB0byBnZXQgdGhlIG9uZSB0aGF0IG1hdGNoZXNcbiAgZm9yICggdmFyIGk9MDsgaSA8IHRoaXMuY2VsbHMubGVuZ3RoOyBpKysgKSB7XG4gICAgdmFyIGNlbGwgPSB0aGlzLmNlbGxzW2ldO1xuICAgIGlmICggY2VsbC5lbGVtZW50ID09IGVsZW0gKSB7XG4gICAgICByZXR1cm4gY2VsbDtcbiAgICB9XG4gIH1cbn07XG5cbi8qKlxuICogZ2V0IGNvbGxlY3Rpb24gb2YgRmxpY2tpdHkuQ2VsbHMsIGdpdmVuIEVsZW1lbnRzXG4gKiBAcGFyYW0ge0VsZW1lbnQsIEFycmF5LCBOb2RlTGlzdH0gZWxlbXNcbiAqIEByZXR1cm5zIHtBcnJheX0gY2VsbHMgLSBGbGlja2l0eS5DZWxsc1xuICovXG5wcm90by5nZXRDZWxscyA9IGZ1bmN0aW9uKCBlbGVtcyApIHtcbiAgZWxlbXMgPSB1dGlscy5tYWtlQXJyYXkoIGVsZW1zICk7XG4gIHZhciBjZWxscyA9IFtdO1xuICBlbGVtcy5mb3JFYWNoKCBmdW5jdGlvbiggZWxlbSApIHtcbiAgICB2YXIgY2VsbCA9IHRoaXMuZ2V0Q2VsbCggZWxlbSApO1xuICAgIGlmICggY2VsbCApIHtcbiAgICAgIGNlbGxzLnB1c2goIGNlbGwgKTtcbiAgICB9XG4gIH0sIHRoaXMgKTtcbiAgcmV0dXJuIGNlbGxzO1xufTtcblxuLyoqXG4gKiBnZXQgY2VsbCBlbGVtZW50c1xuICogQHJldHVybnMge0FycmF5fSBjZWxsRWxlbXNcbiAqL1xucHJvdG8uZ2V0Q2VsbEVsZW1lbnRzID0gZnVuY3Rpb24oKSB7XG4gIHJldHVybiB0aGlzLmNlbGxzLm1hcCggZnVuY3Rpb24oIGNlbGwgKSB7XG4gICAgcmV0dXJuIGNlbGwuZWxlbWVudDtcbiAgfSk7XG59O1xuXG4vKipcbiAqIGdldCBwYXJlbnQgY2VsbCBmcm9tIGFuIGVsZW1lbnRcbiAqIEBwYXJhbSB7RWxlbWVudH0gZWxlbVxuICogQHJldHVybnMge0ZsaWNraXQuQ2VsbH0gY2VsbFxuICovXG5wcm90by5nZXRQYXJlbnRDZWxsID0gZnVuY3Rpb24oIGVsZW0gKSB7XG4gIC8vIGZpcnN0IGNoZWNrIGlmIGVsZW0gaXMgY2VsbFxuICB2YXIgY2VsbCA9IHRoaXMuZ2V0Q2VsbCggZWxlbSApO1xuICBpZiAoIGNlbGwgKSB7XG4gICAgcmV0dXJuIGNlbGw7XG4gIH1cbiAgLy8gdHJ5IHRvIGdldCBwYXJlbnQgY2VsbCBlbGVtXG4gIGVsZW0gPSB1dGlscy5nZXRQYXJlbnQoIGVsZW0sICcuZmxpY2tpdHktc2xpZGVyID4gKicgKTtcbiAgcmV0dXJuIHRoaXMuZ2V0Q2VsbCggZWxlbSApO1xufTtcblxuLyoqXG4gKiBnZXQgY2VsbHMgYWRqYWNlbnQgdG8gYSBzbGlkZVxuICogQHBhcmFtIHtJbnRlZ2VyfSBhZGpDb3VudCAtIG51bWJlciBvZiBhZGphY2VudCBzbGlkZXNcbiAqIEBwYXJhbSB7SW50ZWdlcn0gaW5kZXggLSBpbmRleCBvZiBzbGlkZSB0byBzdGFydFxuICogQHJldHVybnMge0FycmF5fSBjZWxscyAtIGFycmF5IG9mIEZsaWNraXR5LkNlbGxzXG4gKi9cbnByb3RvLmdldEFkamFjZW50Q2VsbEVsZW1lbnRzID0gZnVuY3Rpb24oIGFkakNvdW50LCBpbmRleCApIHtcbiAgaWYgKCAhYWRqQ291bnQgKSB7XG4gICAgcmV0dXJuIHRoaXMuc2VsZWN0ZWRTbGlkZS5nZXRDZWxsRWxlbWVudHMoKTtcbiAgfVxuICBpbmRleCA9IGluZGV4ID09PSB1bmRlZmluZWQgPyB0aGlzLnNlbGVjdGVkSW5kZXggOiBpbmRleDtcblxuICB2YXIgbGVuID0gdGhpcy5zbGlkZXMubGVuZ3RoO1xuICBpZiAoIDEgKyAoIGFkakNvdW50ICogMiApID49IGxlbiApIHtcbiAgICByZXR1cm4gdGhpcy5nZXRDZWxsRWxlbWVudHMoKTtcbiAgfVxuXG4gIHZhciBjZWxsRWxlbXMgPSBbXTtcbiAgZm9yICggdmFyIGkgPSBpbmRleCAtIGFkakNvdW50OyBpIDw9IGluZGV4ICsgYWRqQ291bnQgOyBpKysgKSB7XG4gICAgdmFyIHNsaWRlSW5kZXggPSB0aGlzLm9wdGlvbnMud3JhcEFyb3VuZCA/IHV0aWxzLm1vZHVsbyggaSwgbGVuICkgOiBpO1xuICAgIHZhciBzbGlkZSA9IHRoaXMuc2xpZGVzWyBzbGlkZUluZGV4IF07XG4gICAgaWYgKCBzbGlkZSApIHtcbiAgICAgIGNlbGxFbGVtcyA9IGNlbGxFbGVtcy5jb25jYXQoIHNsaWRlLmdldENlbGxFbGVtZW50cygpICk7XG4gICAgfVxuICB9XG4gIHJldHVybiBjZWxsRWxlbXM7XG59O1xuXG4vKipcbiAqIHNlbGVjdCBzbGlkZSBmcm9tIG51bWJlciBvciBjZWxsIGVsZW1lbnRcbiAqIEBwYXJhbSB7RWxlbWVudCwgU2VsZWN0b3IgU3RyaW5nLCBvciBOdW1iZXJ9IHNlbGVjdG9yXG4gKi9cbnByb3RvLnF1ZXJ5Q2VsbCA9IGZ1bmN0aW9uKCBzZWxlY3RvciApIHtcbiAgaWYgKCB0eXBlb2Ygc2VsZWN0b3IgPT0gJ251bWJlcicgKSB7XG4gICAgLy8gdXNlIG51bWJlciBhcyBpbmRleFxuICAgIHJldHVybiB0aGlzLmNlbGxzWyBzZWxlY3RvciBdO1xuICB9XG4gIGlmICggdHlwZW9mIHNlbGVjdG9yID09ICdzdHJpbmcnICkge1xuICAgIC8vIGRvIG5vdCBzZWxlY3QgaW52YWxpZCBzZWxlY3RvcnMgZnJvbSBoYXNoOiAjMTIzLCAjLy4gIzc5MVxuICAgIGlmICggc2VsZWN0b3IubWF0Y2goL15bI1xcLl0/W1xcZFxcL10vKSApIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgLy8gdXNlIHN0cmluZyBhcyBzZWxlY3RvciwgZ2V0IGVsZW1lbnRcbiAgICBzZWxlY3RvciA9IHRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yKCBzZWxlY3RvciApO1xuICB9XG4gIC8vIGdldCBjZWxsIGZyb20gZWxlbWVudFxuICByZXR1cm4gdGhpcy5nZXRDZWxsKCBzZWxlY3RvciApO1xufTtcblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gZXZlbnRzIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIC8vXG5cbnByb3RvLnVpQ2hhbmdlID0gZnVuY3Rpb24oKSB7XG4gIHRoaXMuZW1pdEV2ZW50KCd1aUNoYW5nZScpO1xufTtcblxuLy8ga2VlcCBmb2N1cyBvbiBlbGVtZW50IHdoZW4gY2hpbGQgVUkgZWxlbWVudHMgYXJlIGNsaWNrZWRcbnByb3RvLmNoaWxkVUlQb2ludGVyRG93biA9IGZ1bmN0aW9uKCBldmVudCApIHtcbiAgLy8gSEFDSyBpT1MgZG9lcyBub3QgYWxsb3cgdG91Y2ggZXZlbnRzIHRvIGJ1YmJsZSB1cD8hXG4gIGlmICggZXZlbnQudHlwZSAhPSAndG91Y2hzdGFydCcgKSB7XG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgfVxuICB0aGlzLmZvY3VzKCk7XG59O1xuXG4vLyAtLS0tLSByZXNpemUgLS0tLS0gLy9cblxucHJvdG8ub25yZXNpemUgPSBmdW5jdGlvbigpIHtcbiAgdGhpcy53YXRjaENTUygpO1xuICB0aGlzLnJlc2l6ZSgpO1xufTtcblxudXRpbHMuZGVib3VuY2VNZXRob2QoIEZsaWNraXR5LCAnb25yZXNpemUnLCAxNTAgKTtcblxucHJvdG8ucmVzaXplID0gZnVuY3Rpb24oKSB7XG4gIGlmICggIXRoaXMuaXNBY3RpdmUgKSB7XG4gICAgcmV0dXJuO1xuICB9XG4gIHRoaXMuZ2V0U2l6ZSgpO1xuICAvLyB3cmFwIHZhbHVlc1xuICBpZiAoIHRoaXMub3B0aW9ucy53cmFwQXJvdW5kICkge1xuICAgIHRoaXMueCA9IHV0aWxzLm1vZHVsbyggdGhpcy54LCB0aGlzLnNsaWRlYWJsZVdpZHRoICk7XG4gIH1cbiAgdGhpcy5wb3NpdGlvbkNlbGxzKCk7XG4gIHRoaXMuX2dldFdyYXBTaGlmdENlbGxzKCk7XG4gIHRoaXMuc2V0R2FsbGVyeVNpemUoKTtcbiAgdGhpcy5lbWl0RXZlbnQoJ3Jlc2l6ZScpO1xuICAvLyB1cGRhdGUgc2VsZWN0ZWQgaW5kZXggZm9yIGdyb3VwIHNsaWRlcywgaW5zdGFudFxuICAvLyBUT0RPOiBwb3NpdGlvbiBjYW4gYmUgbG9zdCBiZXR3ZWVuIGdyb3VwcyBvZiB2YXJpb3VzIG51bWJlcnNcbiAgdmFyIHNlbGVjdGVkRWxlbWVudCA9IHRoaXMuc2VsZWN0ZWRFbGVtZW50cyAmJiB0aGlzLnNlbGVjdGVkRWxlbWVudHNbMF07XG4gIHRoaXMuc2VsZWN0Q2VsbCggc2VsZWN0ZWRFbGVtZW50LCBmYWxzZSwgdHJ1ZSApO1xufTtcblxuLy8gd2F0Y2hlcyB0aGUgOmFmdGVyIHByb3BlcnR5LCBhY3RpdmF0ZXMvZGVhY3RpdmF0ZXNcbnByb3RvLndhdGNoQ1NTID0gZnVuY3Rpb24oKSB7XG4gIHZhciB3YXRjaE9wdGlvbiA9IHRoaXMub3B0aW9ucy53YXRjaENTUztcbiAgaWYgKCAhd2F0Y2hPcHRpb24gKSB7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgdmFyIGFmdGVyQ29udGVudCA9IGdldENvbXB1dGVkU3R5bGUoIHRoaXMuZWxlbWVudCwgJzphZnRlcicgKS5jb250ZW50O1xuICAvLyBhY3RpdmF0ZSBpZiA6YWZ0ZXIgeyBjb250ZW50OiAnZmxpY2tpdHknIH1cbiAgaWYgKCBhZnRlckNvbnRlbnQuaW5kZXhPZignZmxpY2tpdHknKSAhPSAtMSApIHtcbiAgICB0aGlzLmFjdGl2YXRlKCk7XG4gIH0gZWxzZSB7XG4gICAgdGhpcy5kZWFjdGl2YXRlKCk7XG4gIH1cbn07XG5cbi8vIC0tLS0tIGtleWRvd24gLS0tLS0gLy9cblxuLy8gZ28gcHJldmlvdXMvbmV4dCBpZiBsZWZ0L3JpZ2h0IGtleXMgcHJlc3NlZFxucHJvdG8ub25rZXlkb3duID0gZnVuY3Rpb24oIGV2ZW50ICkge1xuICAvLyBvbmx5IHdvcmsgaWYgZWxlbWVudCBpcyBpbiBmb2N1c1xuICB2YXIgaXNOb3RGb2N1c2VkID0gZG9jdW1lbnQuYWN0aXZlRWxlbWVudCAmJiBkb2N1bWVudC5hY3RpdmVFbGVtZW50ICE9IHRoaXMuZWxlbWVudDtcbiAgaWYgKCAhdGhpcy5vcHRpb25zLmFjY2Vzc2liaWxpdHkgfHxpc05vdEZvY3VzZWQgKSB7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgdmFyIGhhbmRsZXIgPSBGbGlja2l0eS5rZXlib2FyZEhhbmRsZXJzWyBldmVudC5rZXlDb2RlIF07XG4gIGlmICggaGFuZGxlciApIHtcbiAgICBoYW5kbGVyLmNhbGwoIHRoaXMgKTtcbiAgfVxufTtcblxuRmxpY2tpdHkua2V5Ym9hcmRIYW5kbGVycyA9IHtcbiAgLy8gbGVmdCBhcnJvd1xuICAzNzogZnVuY3Rpb24oKSB7XG4gICAgdmFyIGxlZnRNZXRob2QgPSB0aGlzLm9wdGlvbnMucmlnaHRUb0xlZnQgPyAnbmV4dCcgOiAncHJldmlvdXMnO1xuICAgIHRoaXMudWlDaGFuZ2UoKTtcbiAgICB0aGlzWyBsZWZ0TWV0aG9kIF0oKTtcbiAgfSxcbiAgLy8gcmlnaHQgYXJyb3dcbiAgMzk6IGZ1bmN0aW9uKCkge1xuICAgIHZhciByaWdodE1ldGhvZCA9IHRoaXMub3B0aW9ucy5yaWdodFRvTGVmdCA/ICdwcmV2aW91cycgOiAnbmV4dCc7XG4gICAgdGhpcy51aUNoYW5nZSgpO1xuICAgIHRoaXNbIHJpZ2h0TWV0aG9kIF0oKTtcbiAgfSxcbn07XG5cbi8vIC0tLS0tIGZvY3VzIC0tLS0tIC8vXG5cbnByb3RvLmZvY3VzID0gZnVuY3Rpb24oKSB7XG4gIC8vIFRPRE8gcmVtb3ZlIHNjcm9sbFRvIG9uY2UgZm9jdXMgb3B0aW9ucyBnZXRzIG1vcmUgc3VwcG9ydFxuICAvLyBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9BUEkvSFRNTEVsZW1lbnQvZm9jdXMjQnJvd3Nlcl9jb21wYXRpYmlsaXR5XG4gIHZhciBwcmV2U2Nyb2xsWSA9IHdpbmRvdy5wYWdlWU9mZnNldDtcbiAgdGhpcy5lbGVtZW50LmZvY3VzKHsgcHJldmVudFNjcm9sbDogdHJ1ZSB9KTtcbiAgLy8gaGFjayB0byBmaXggc2Nyb2xsIGp1bXAgYWZ0ZXIgZm9jdXMsICM3NlxuICBpZiAoIHdpbmRvdy5wYWdlWU9mZnNldCAhPSBwcmV2U2Nyb2xsWSApIHtcbiAgICB3aW5kb3cuc2Nyb2xsVG8oIHdpbmRvdy5wYWdlWE9mZnNldCwgcHJldlNjcm9sbFkgKTtcbiAgfVxufTtcblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gZGVzdHJveSAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSAvL1xuXG4vLyBkZWFjdGl2YXRlIGFsbCBGbGlja2l0eSBmdW5jdGlvbmFsaXR5LCBidXQga2VlcCBzdHVmZiBhdmFpbGFibGVcbnByb3RvLmRlYWN0aXZhdGUgPSBmdW5jdGlvbigpIHtcbiAgaWYgKCAhdGhpcy5pc0FjdGl2ZSApIHtcbiAgICByZXR1cm47XG4gIH1cbiAgdGhpcy5lbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoJ2ZsaWNraXR5LWVuYWJsZWQnKTtcbiAgdGhpcy5lbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoJ2ZsaWNraXR5LXJ0bCcpO1xuICB0aGlzLnVuc2VsZWN0U2VsZWN0ZWRTbGlkZSgpO1xuICAvLyBkZXN0cm95IGNlbGxzXG4gIHRoaXMuY2VsbHMuZm9yRWFjaCggZnVuY3Rpb24oIGNlbGwgKSB7XG4gICAgY2VsbC5kZXN0cm95KCk7XG4gIH0pO1xuICB0aGlzLmVsZW1lbnQucmVtb3ZlQ2hpbGQoIHRoaXMudmlld3BvcnQgKTtcbiAgLy8gbW92ZSBjaGlsZCBlbGVtZW50cyBiYWNrIGludG8gZWxlbWVudFxuICBtb3ZlRWxlbWVudHMoIHRoaXMuc2xpZGVyLmNoaWxkcmVuLCB0aGlzLmVsZW1lbnQgKTtcbiAgaWYgKCB0aGlzLm9wdGlvbnMuYWNjZXNzaWJpbGl0eSApIHtcbiAgICB0aGlzLmVsZW1lbnQucmVtb3ZlQXR0cmlidXRlKCd0YWJJbmRleCcpO1xuICAgIHRoaXMuZWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCAna2V5ZG93bicsIHRoaXMgKTtcbiAgfVxuICAvLyBzZXQgZmxhZ3NcbiAgdGhpcy5pc0FjdGl2ZSA9IGZhbHNlO1xuICB0aGlzLmVtaXRFdmVudCgnZGVhY3RpdmF0ZScpO1xufTtcblxucHJvdG8uZGVzdHJveSA9IGZ1bmN0aW9uKCkge1xuICB0aGlzLmRlYWN0aXZhdGUoKTtcbiAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoICdyZXNpemUnLCB0aGlzICk7XG4gIHRoaXMuYWxsT2ZmKCk7XG4gIHRoaXMuZW1pdEV2ZW50KCdkZXN0cm95Jyk7XG4gIGlmICggalF1ZXJ5ICYmIHRoaXMuJGVsZW1lbnQgKSB7XG4gICAgalF1ZXJ5LnJlbW92ZURhdGEoIHRoaXMuZWxlbWVudCwgJ2ZsaWNraXR5JyApO1xuICB9XG4gIGRlbGV0ZSB0aGlzLmVsZW1lbnQuZmxpY2tpdHlHVUlEO1xuICBkZWxldGUgaW5zdGFuY2VzWyB0aGlzLmd1aWQgXTtcbn07XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIHByb3RvdHlwZSAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSAvL1xuXG51dGlscy5leHRlbmQoIHByb3RvLCBhbmltYXRlUHJvdG90eXBlICk7XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIGV4dHJhcyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSAvL1xuXG4vKipcbiAqIGdldCBGbGlja2l0eSBpbnN0YW5jZSBmcm9tIGVsZW1lbnRcbiAqIEBwYXJhbSB7RWxlbWVudH0gZWxlbVxuICogQHJldHVybnMge0ZsaWNraXR5fVxuICovXG5GbGlja2l0eS5kYXRhID0gZnVuY3Rpb24oIGVsZW0gKSB7XG4gIGVsZW0gPSB1dGlscy5nZXRRdWVyeUVsZW1lbnQoIGVsZW0gKTtcbiAgdmFyIGlkID0gZWxlbSAmJiBlbGVtLmZsaWNraXR5R1VJRDtcbiAgcmV0dXJuIGlkICYmIGluc3RhbmNlc1sgaWQgXTtcbn07XG5cbnV0aWxzLmh0bWxJbml0KCBGbGlja2l0eSwgJ2ZsaWNraXR5JyApO1xuXG5pZiAoIGpRdWVyeSAmJiBqUXVlcnkuYnJpZGdldCApIHtcbiAgalF1ZXJ5LmJyaWRnZXQoICdmbGlja2l0eScsIEZsaWNraXR5ICk7XG59XG5cbi8vIHNldCBpbnRlcm5hbCBqUXVlcnksIGZvciBXZWJwYWNrICsgalF1ZXJ5IHYzLCAjNDc4XG5GbGlja2l0eS5zZXRKUXVlcnkgPSBmdW5jdGlvbigganEgKSB7XG4gIGpRdWVyeSA9IGpxO1xufTtcblxuRmxpY2tpdHkuQ2VsbCA9IENlbGw7XG5GbGlja2l0eS5TbGlkZSA9IFNsaWRlO1xuXG5yZXR1cm4gRmxpY2tpdHk7XG5cbn0pKTtcbiIsIi8qIVxuICogVW5pcG9pbnRlciB2Mi4zLjBcbiAqIGJhc2UgY2xhc3MgZm9yIGRvaW5nIG9uZSB0aGluZyB3aXRoIHBvaW50ZXIgZXZlbnRcbiAqIE1JVCBsaWNlbnNlXG4gKi9cblxuLypqc2hpbnQgYnJvd3NlcjogdHJ1ZSwgdW5kZWY6IHRydWUsIHVudXNlZDogdHJ1ZSwgc3RyaWN0OiB0cnVlICovXG5cbiggZnVuY3Rpb24oIHdpbmRvdywgZmFjdG9yeSApIHtcbiAgLy8gdW5pdmVyc2FsIG1vZHVsZSBkZWZpbml0aW9uXG4gIC8qIGpzaGludCBzdHJpY3Q6IGZhbHNlICovIC8qZ2xvYmFsIGRlZmluZSwgbW9kdWxlLCByZXF1aXJlICovXG4gIGlmICggdHlwZW9mIGRlZmluZSA9PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQgKSB7XG4gICAgLy8gQU1EXG4gICAgZGVmaW5lKCBbXG4gICAgICAnZXYtZW1pdHRlci9ldi1lbWl0dGVyJ1xuICAgIF0sIGZ1bmN0aW9uKCBFdkVtaXR0ZXIgKSB7XG4gICAgICByZXR1cm4gZmFjdG9yeSggd2luZG93LCBFdkVtaXR0ZXIgKTtcbiAgICB9KTtcbiAgfSBlbHNlIGlmICggdHlwZW9mIG1vZHVsZSA9PSAnb2JqZWN0JyAmJiBtb2R1bGUuZXhwb3J0cyApIHtcbiAgICAvLyBDb21tb25KU1xuICAgIG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeShcbiAgICAgIHdpbmRvdyxcbiAgICAgIHJlcXVpcmUoJ2V2LWVtaXR0ZXInKVxuICAgICk7XG4gIH0gZWxzZSB7XG4gICAgLy8gYnJvd3NlciBnbG9iYWxcbiAgICB3aW5kb3cuVW5pcG9pbnRlciA9IGZhY3RvcnkoXG4gICAgICB3aW5kb3csXG4gICAgICB3aW5kb3cuRXZFbWl0dGVyXG4gICAgKTtcbiAgfVxuXG59KCB3aW5kb3csIGZ1bmN0aW9uIGZhY3RvcnkoIHdpbmRvdywgRXZFbWl0dGVyICkge1xuXG4ndXNlIHN0cmljdCc7XG5cbmZ1bmN0aW9uIG5vb3AoKSB7fVxuXG5mdW5jdGlvbiBVbmlwb2ludGVyKCkge31cblxuLy8gaW5oZXJpdCBFdkVtaXR0ZXJcbnZhciBwcm90byA9IFVuaXBvaW50ZXIucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZSggRXZFbWl0dGVyLnByb3RvdHlwZSApO1xuXG5wcm90by5iaW5kU3RhcnRFdmVudCA9IGZ1bmN0aW9uKCBlbGVtICkge1xuICB0aGlzLl9iaW5kU3RhcnRFdmVudCggZWxlbSwgdHJ1ZSApO1xufTtcblxucHJvdG8udW5iaW5kU3RhcnRFdmVudCA9IGZ1bmN0aW9uKCBlbGVtICkge1xuICB0aGlzLl9iaW5kU3RhcnRFdmVudCggZWxlbSwgZmFsc2UgKTtcbn07XG5cbi8qKlxuICogQWRkIG9yIHJlbW92ZSBzdGFydCBldmVudFxuICogQHBhcmFtIHtCb29sZWFufSBpc0FkZCAtIHJlbW92ZSBpZiBmYWxzZXlcbiAqL1xucHJvdG8uX2JpbmRTdGFydEV2ZW50ID0gZnVuY3Rpb24oIGVsZW0sIGlzQWRkICkge1xuICAvLyBtdW5nZSBpc0FkZCwgZGVmYXVsdCB0byB0cnVlXG4gIGlzQWRkID0gaXNBZGQgPT09IHVuZGVmaW5lZCA/IHRydWUgOiBpc0FkZDtcbiAgdmFyIGJpbmRNZXRob2QgPSBpc0FkZCA/ICdhZGRFdmVudExpc3RlbmVyJyA6ICdyZW1vdmVFdmVudExpc3RlbmVyJztcblxuICAvLyBkZWZhdWx0IHRvIG1vdXNlIGV2ZW50c1xuICB2YXIgc3RhcnRFdmVudCA9ICdtb3VzZWRvd24nO1xuICBpZiAoIHdpbmRvdy5Qb2ludGVyRXZlbnQgKSB7XG4gICAgLy8gUG9pbnRlciBFdmVudHNcbiAgICBzdGFydEV2ZW50ID0gJ3BvaW50ZXJkb3duJztcbiAgfSBlbHNlIGlmICggJ29udG91Y2hzdGFydCcgaW4gd2luZG93ICkge1xuICAgIC8vIFRvdWNoIEV2ZW50cy4gaU9TIFNhZmFyaVxuICAgIHN0YXJ0RXZlbnQgPSAndG91Y2hzdGFydCc7XG4gIH1cbiAgZWxlbVsgYmluZE1ldGhvZCBdKCBzdGFydEV2ZW50LCB0aGlzICk7XG59O1xuXG4vLyB0cmlnZ2VyIGhhbmRsZXIgbWV0aG9kcyBmb3IgZXZlbnRzXG5wcm90by5oYW5kbGVFdmVudCA9IGZ1bmN0aW9uKCBldmVudCApIHtcbiAgdmFyIG1ldGhvZCA9ICdvbicgKyBldmVudC50eXBlO1xuICBpZiAoIHRoaXNbIG1ldGhvZCBdICkge1xuICAgIHRoaXNbIG1ldGhvZCBdKCBldmVudCApO1xuICB9XG59O1xuXG4vLyByZXR1cm5zIHRoZSB0b3VjaCB0aGF0IHdlJ3JlIGtlZXBpbmcgdHJhY2sgb2ZcbnByb3RvLmdldFRvdWNoID0gZnVuY3Rpb24oIHRvdWNoZXMgKSB7XG4gIGZvciAoIHZhciBpPTA7IGkgPCB0b3VjaGVzLmxlbmd0aDsgaSsrICkge1xuICAgIHZhciB0b3VjaCA9IHRvdWNoZXNbaV07XG4gICAgaWYgKCB0b3VjaC5pZGVudGlmaWVyID09IHRoaXMucG9pbnRlcklkZW50aWZpZXIgKSB7XG4gICAgICByZXR1cm4gdG91Y2g7XG4gICAgfVxuICB9XG59O1xuXG4vLyAtLS0tLSBzdGFydCBldmVudCAtLS0tLSAvL1xuXG5wcm90by5vbm1vdXNlZG93biA9IGZ1bmN0aW9uKCBldmVudCApIHtcbiAgLy8gZGlzbWlzcyBjbGlja3MgZnJvbSByaWdodCBvciBtaWRkbGUgYnV0dG9uc1xuICB2YXIgYnV0dG9uID0gZXZlbnQuYnV0dG9uO1xuICBpZiAoIGJ1dHRvbiAmJiAoIGJ1dHRvbiAhPT0gMCAmJiBidXR0b24gIT09IDEgKSApIHtcbiAgICByZXR1cm47XG4gIH1cbiAgdGhpcy5fcG9pbnRlckRvd24oIGV2ZW50LCBldmVudCApO1xufTtcblxucHJvdG8ub250b3VjaHN0YXJ0ID0gZnVuY3Rpb24oIGV2ZW50ICkge1xuICB0aGlzLl9wb2ludGVyRG93biggZXZlbnQsIGV2ZW50LmNoYW5nZWRUb3VjaGVzWzBdICk7XG59O1xuXG5wcm90by5vbnBvaW50ZXJkb3duID0gZnVuY3Rpb24oIGV2ZW50ICkge1xuICB0aGlzLl9wb2ludGVyRG93biggZXZlbnQsIGV2ZW50ICk7XG59O1xuXG4vKipcbiAqIHBvaW50ZXIgc3RhcnRcbiAqIEBwYXJhbSB7RXZlbnR9IGV2ZW50XG4gKiBAcGFyYW0ge0V2ZW50IG9yIFRvdWNofSBwb2ludGVyXG4gKi9cbnByb3RvLl9wb2ludGVyRG93biA9IGZ1bmN0aW9uKCBldmVudCwgcG9pbnRlciApIHtcbiAgLy8gZGlzbWlzcyByaWdodCBjbGljayBhbmQgb3RoZXIgcG9pbnRlcnNcbiAgLy8gYnV0dG9uID0gMCBpcyBva2F5LCAxLTQgbm90XG4gIGlmICggZXZlbnQuYnV0dG9uIHx8IHRoaXMuaXNQb2ludGVyRG93biApIHtcbiAgICByZXR1cm47XG4gIH1cblxuICB0aGlzLmlzUG9pbnRlckRvd24gPSB0cnVlO1xuICAvLyBzYXZlIHBvaW50ZXIgaWRlbnRpZmllciB0byBtYXRjaCB1cCB0b3VjaCBldmVudHNcbiAgdGhpcy5wb2ludGVySWRlbnRpZmllciA9IHBvaW50ZXIucG9pbnRlcklkICE9PSB1bmRlZmluZWQgP1xuICAgIC8vIHBvaW50ZXJJZCBmb3IgcG9pbnRlciBldmVudHMsIHRvdWNoLmluZGVudGlmaWVyIGZvciB0b3VjaCBldmVudHNcbiAgICBwb2ludGVyLnBvaW50ZXJJZCA6IHBvaW50ZXIuaWRlbnRpZmllcjtcblxuICB0aGlzLnBvaW50ZXJEb3duKCBldmVudCwgcG9pbnRlciApO1xufTtcblxucHJvdG8ucG9pbnRlckRvd24gPSBmdW5jdGlvbiggZXZlbnQsIHBvaW50ZXIgKSB7XG4gIHRoaXMuX2JpbmRQb3N0U3RhcnRFdmVudHMoIGV2ZW50ICk7XG4gIHRoaXMuZW1pdEV2ZW50KCAncG9pbnRlckRvd24nLCBbIGV2ZW50LCBwb2ludGVyIF0gKTtcbn07XG5cbi8vIGhhc2ggb2YgZXZlbnRzIHRvIGJlIGJvdW5kIGFmdGVyIHN0YXJ0IGV2ZW50XG52YXIgcG9zdFN0YXJ0RXZlbnRzID0ge1xuICBtb3VzZWRvd246IFsgJ21vdXNlbW92ZScsICdtb3VzZXVwJyBdLFxuICB0b3VjaHN0YXJ0OiBbICd0b3VjaG1vdmUnLCAndG91Y2hlbmQnLCAndG91Y2hjYW5jZWwnIF0sXG4gIHBvaW50ZXJkb3duOiBbICdwb2ludGVybW92ZScsICdwb2ludGVydXAnLCAncG9pbnRlcmNhbmNlbCcgXSxcbn07XG5cbnByb3RvLl9iaW5kUG9zdFN0YXJ0RXZlbnRzID0gZnVuY3Rpb24oIGV2ZW50ICkge1xuICBpZiAoICFldmVudCApIHtcbiAgICByZXR1cm47XG4gIH1cbiAgLy8gZ2V0IHByb3BlciBldmVudHMgdG8gbWF0Y2ggc3RhcnQgZXZlbnRcbiAgdmFyIGV2ZW50cyA9IHBvc3RTdGFydEV2ZW50c1sgZXZlbnQudHlwZSBdO1xuICAvLyBiaW5kIGV2ZW50cyB0byBub2RlXG4gIGV2ZW50cy5mb3JFYWNoKCBmdW5jdGlvbiggZXZlbnROYW1lICkge1xuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCBldmVudE5hbWUsIHRoaXMgKTtcbiAgfSwgdGhpcyApO1xuICAvLyBzYXZlIHRoZXNlIGFyZ3VtZW50c1xuICB0aGlzLl9ib3VuZFBvaW50ZXJFdmVudHMgPSBldmVudHM7XG59O1xuXG5wcm90by5fdW5iaW5kUG9zdFN0YXJ0RXZlbnRzID0gZnVuY3Rpb24oKSB7XG4gIC8vIGNoZWNrIGZvciBfYm91bmRFdmVudHMsIGluIGNhc2UgZHJhZ0VuZCB0cmlnZ2VyZWQgdHdpY2UgKG9sZCBJRTggYnVnKVxuICBpZiAoICF0aGlzLl9ib3VuZFBvaW50ZXJFdmVudHMgKSB7XG4gICAgcmV0dXJuO1xuICB9XG4gIHRoaXMuX2JvdW5kUG9pbnRlckV2ZW50cy5mb3JFYWNoKCBmdW5jdGlvbiggZXZlbnROYW1lICkge1xuICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCBldmVudE5hbWUsIHRoaXMgKTtcbiAgfSwgdGhpcyApO1xuXG4gIGRlbGV0ZSB0aGlzLl9ib3VuZFBvaW50ZXJFdmVudHM7XG59O1xuXG4vLyAtLS0tLSBtb3ZlIGV2ZW50IC0tLS0tIC8vXG5cbnByb3RvLm9ubW91c2Vtb3ZlID0gZnVuY3Rpb24oIGV2ZW50ICkge1xuICB0aGlzLl9wb2ludGVyTW92ZSggZXZlbnQsIGV2ZW50ICk7XG59O1xuXG5wcm90by5vbnBvaW50ZXJtb3ZlID0gZnVuY3Rpb24oIGV2ZW50ICkge1xuICBpZiAoIGV2ZW50LnBvaW50ZXJJZCA9PSB0aGlzLnBvaW50ZXJJZGVudGlmaWVyICkge1xuICAgIHRoaXMuX3BvaW50ZXJNb3ZlKCBldmVudCwgZXZlbnQgKTtcbiAgfVxufTtcblxucHJvdG8ub250b3VjaG1vdmUgPSBmdW5jdGlvbiggZXZlbnQgKSB7XG4gIHZhciB0b3VjaCA9IHRoaXMuZ2V0VG91Y2goIGV2ZW50LmNoYW5nZWRUb3VjaGVzICk7XG4gIGlmICggdG91Y2ggKSB7XG4gICAgdGhpcy5fcG9pbnRlck1vdmUoIGV2ZW50LCB0b3VjaCApO1xuICB9XG59O1xuXG4vKipcbiAqIHBvaW50ZXIgbW92ZVxuICogQHBhcmFtIHtFdmVudH0gZXZlbnRcbiAqIEBwYXJhbSB7RXZlbnQgb3IgVG91Y2h9IHBvaW50ZXJcbiAqIEBwcml2YXRlXG4gKi9cbnByb3RvLl9wb2ludGVyTW92ZSA9IGZ1bmN0aW9uKCBldmVudCwgcG9pbnRlciApIHtcbiAgdGhpcy5wb2ludGVyTW92ZSggZXZlbnQsIHBvaW50ZXIgKTtcbn07XG5cbi8vIHB1YmxpY1xucHJvdG8ucG9pbnRlck1vdmUgPSBmdW5jdGlvbiggZXZlbnQsIHBvaW50ZXIgKSB7XG4gIHRoaXMuZW1pdEV2ZW50KCAncG9pbnRlck1vdmUnLCBbIGV2ZW50LCBwb2ludGVyIF0gKTtcbn07XG5cbi8vIC0tLS0tIGVuZCBldmVudCAtLS0tLSAvL1xuXG5cbnByb3RvLm9ubW91c2V1cCA9IGZ1bmN0aW9uKCBldmVudCApIHtcbiAgdGhpcy5fcG9pbnRlclVwKCBldmVudCwgZXZlbnQgKTtcbn07XG5cbnByb3RvLm9ucG9pbnRlcnVwID0gZnVuY3Rpb24oIGV2ZW50ICkge1xuICBpZiAoIGV2ZW50LnBvaW50ZXJJZCA9PSB0aGlzLnBvaW50ZXJJZGVudGlmaWVyICkge1xuICAgIHRoaXMuX3BvaW50ZXJVcCggZXZlbnQsIGV2ZW50ICk7XG4gIH1cbn07XG5cbnByb3RvLm9udG91Y2hlbmQgPSBmdW5jdGlvbiggZXZlbnQgKSB7XG4gIHZhciB0b3VjaCA9IHRoaXMuZ2V0VG91Y2goIGV2ZW50LmNoYW5nZWRUb3VjaGVzICk7XG4gIGlmICggdG91Y2ggKSB7XG4gICAgdGhpcy5fcG9pbnRlclVwKCBldmVudCwgdG91Y2ggKTtcbiAgfVxufTtcblxuLyoqXG4gKiBwb2ludGVyIHVwXG4gKiBAcGFyYW0ge0V2ZW50fSBldmVudFxuICogQHBhcmFtIHtFdmVudCBvciBUb3VjaH0gcG9pbnRlclxuICogQHByaXZhdGVcbiAqL1xucHJvdG8uX3BvaW50ZXJVcCA9IGZ1bmN0aW9uKCBldmVudCwgcG9pbnRlciApIHtcbiAgdGhpcy5fcG9pbnRlckRvbmUoKTtcbiAgdGhpcy5wb2ludGVyVXAoIGV2ZW50LCBwb2ludGVyICk7XG59O1xuXG4vLyBwdWJsaWNcbnByb3RvLnBvaW50ZXJVcCA9IGZ1bmN0aW9uKCBldmVudCwgcG9pbnRlciApIHtcbiAgdGhpcy5lbWl0RXZlbnQoICdwb2ludGVyVXAnLCBbIGV2ZW50LCBwb2ludGVyIF0gKTtcbn07XG5cbi8vIC0tLS0tIHBvaW50ZXIgZG9uZSAtLS0tLSAvL1xuXG4vLyB0cmlnZ2VyZWQgb24gcG9pbnRlciB1cCAmIHBvaW50ZXIgY2FuY2VsXG5wcm90by5fcG9pbnRlckRvbmUgPSBmdW5jdGlvbigpIHtcbiAgdGhpcy5fcG9pbnRlclJlc2V0KCk7XG4gIHRoaXMuX3VuYmluZFBvc3RTdGFydEV2ZW50cygpO1xuICB0aGlzLnBvaW50ZXJEb25lKCk7XG59O1xuXG5wcm90by5fcG9pbnRlclJlc2V0ID0gZnVuY3Rpb24oKSB7XG4gIC8vIHJlc2V0IHByb3BlcnRpZXNcbiAgdGhpcy5pc1BvaW50ZXJEb3duID0gZmFsc2U7XG4gIGRlbGV0ZSB0aGlzLnBvaW50ZXJJZGVudGlmaWVyO1xufTtcblxucHJvdG8ucG9pbnRlckRvbmUgPSBub29wO1xuXG4vLyAtLS0tLSBwb2ludGVyIGNhbmNlbCAtLS0tLSAvL1xuXG5wcm90by5vbnBvaW50ZXJjYW5jZWwgPSBmdW5jdGlvbiggZXZlbnQgKSB7XG4gIGlmICggZXZlbnQucG9pbnRlcklkID09IHRoaXMucG9pbnRlcklkZW50aWZpZXIgKSB7XG4gICAgdGhpcy5fcG9pbnRlckNhbmNlbCggZXZlbnQsIGV2ZW50ICk7XG4gIH1cbn07XG5cbnByb3RvLm9udG91Y2hjYW5jZWwgPSBmdW5jdGlvbiggZXZlbnQgKSB7XG4gIHZhciB0b3VjaCA9IHRoaXMuZ2V0VG91Y2goIGV2ZW50LmNoYW5nZWRUb3VjaGVzICk7XG4gIGlmICggdG91Y2ggKSB7XG4gICAgdGhpcy5fcG9pbnRlckNhbmNlbCggZXZlbnQsIHRvdWNoICk7XG4gIH1cbn07XG5cbi8qKlxuICogcG9pbnRlciBjYW5jZWxcbiAqIEBwYXJhbSB7RXZlbnR9IGV2ZW50XG4gKiBAcGFyYW0ge0V2ZW50IG9yIFRvdWNofSBwb2ludGVyXG4gKiBAcHJpdmF0ZVxuICovXG5wcm90by5fcG9pbnRlckNhbmNlbCA9IGZ1bmN0aW9uKCBldmVudCwgcG9pbnRlciApIHtcbiAgdGhpcy5fcG9pbnRlckRvbmUoKTtcbiAgdGhpcy5wb2ludGVyQ2FuY2VsKCBldmVudCwgcG9pbnRlciApO1xufTtcblxuLy8gcHVibGljXG5wcm90by5wb2ludGVyQ2FuY2VsID0gZnVuY3Rpb24oIGV2ZW50LCBwb2ludGVyICkge1xuICB0aGlzLmVtaXRFdmVudCggJ3BvaW50ZXJDYW5jZWwnLCBbIGV2ZW50LCBwb2ludGVyIF0gKTtcbn07XG5cbi8vIC0tLS0tICAtLS0tLSAvL1xuXG4vLyB1dGlsaXR5IGZ1bmN0aW9uIGZvciBnZXR0aW5nIHgveSBjb29yZHMgZnJvbSBldmVudFxuVW5pcG9pbnRlci5nZXRQb2ludGVyUG9pbnQgPSBmdW5jdGlvbiggcG9pbnRlciApIHtcbiAgcmV0dXJuIHtcbiAgICB4OiBwb2ludGVyLnBhZ2VYLFxuICAgIHk6IHBvaW50ZXIucGFnZVlcbiAgfTtcbn07XG5cbi8vIC0tLS0tICAtLS0tLSAvL1xuXG5yZXR1cm4gVW5pcG9pbnRlcjtcblxufSkpO1xuIiwiLyohXG4gKiBVbmlkcmFnZ2VyIHYyLjMuMFxuICogRHJhZ2dhYmxlIGJhc2UgY2xhc3NcbiAqIE1JVCBsaWNlbnNlXG4gKi9cblxuLypqc2hpbnQgYnJvd3NlcjogdHJ1ZSwgdW51c2VkOiB0cnVlLCB1bmRlZjogdHJ1ZSwgc3RyaWN0OiB0cnVlICovXG5cbiggZnVuY3Rpb24oIHdpbmRvdywgZmFjdG9yeSApIHtcbiAgLy8gdW5pdmVyc2FsIG1vZHVsZSBkZWZpbml0aW9uXG4gIC8qanNoaW50IHN0cmljdDogZmFsc2UgKi8gLypnbG9iYWxzIGRlZmluZSwgbW9kdWxlLCByZXF1aXJlICovXG5cbiAgaWYgKCB0eXBlb2YgZGVmaW5lID09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCApIHtcbiAgICAvLyBBTURcbiAgICBkZWZpbmUoIFtcbiAgICAgICd1bmlwb2ludGVyL3VuaXBvaW50ZXInXG4gICAgXSwgZnVuY3Rpb24oIFVuaXBvaW50ZXIgKSB7XG4gICAgICByZXR1cm4gZmFjdG9yeSggd2luZG93LCBVbmlwb2ludGVyICk7XG4gICAgfSk7XG4gIH0gZWxzZSBpZiAoIHR5cGVvZiBtb2R1bGUgPT0gJ29iamVjdCcgJiYgbW9kdWxlLmV4cG9ydHMgKSB7XG4gICAgLy8gQ29tbW9uSlNcbiAgICBtb2R1bGUuZXhwb3J0cyA9IGZhY3RvcnkoXG4gICAgICB3aW5kb3csXG4gICAgICByZXF1aXJlKCd1bmlwb2ludGVyJylcbiAgICApO1xuICB9IGVsc2Uge1xuICAgIC8vIGJyb3dzZXIgZ2xvYmFsXG4gICAgd2luZG93LlVuaWRyYWdnZXIgPSBmYWN0b3J5KFxuICAgICAgd2luZG93LFxuICAgICAgd2luZG93LlVuaXBvaW50ZXJcbiAgICApO1xuICB9XG5cbn0oIHdpbmRvdywgZnVuY3Rpb24gZmFjdG9yeSggd2luZG93LCBVbmlwb2ludGVyICkge1xuXG4ndXNlIHN0cmljdCc7XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIFVuaWRyYWdnZXIgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gLy9cblxuZnVuY3Rpb24gVW5pZHJhZ2dlcigpIHt9XG5cbi8vIGluaGVyaXQgVW5pcG9pbnRlciAmIEV2RW1pdHRlclxudmFyIHByb3RvID0gVW5pZHJhZ2dlci5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKCBVbmlwb2ludGVyLnByb3RvdHlwZSApO1xuXG4vLyAtLS0tLSBiaW5kIHN0YXJ0IC0tLS0tIC8vXG5cbnByb3RvLmJpbmRIYW5kbGVzID0gZnVuY3Rpb24oKSB7XG4gIHRoaXMuX2JpbmRIYW5kbGVzKCB0cnVlICk7XG59O1xuXG5wcm90by51bmJpbmRIYW5kbGVzID0gZnVuY3Rpb24oKSB7XG4gIHRoaXMuX2JpbmRIYW5kbGVzKCBmYWxzZSApO1xufTtcblxuLyoqXG4gKiBBZGQgb3IgcmVtb3ZlIHN0YXJ0IGV2ZW50XG4gKiBAcGFyYW0ge0Jvb2xlYW59IGlzQWRkXG4gKi9cbnByb3RvLl9iaW5kSGFuZGxlcyA9IGZ1bmN0aW9uKCBpc0FkZCApIHtcbiAgLy8gbXVuZ2UgaXNBZGQsIGRlZmF1bHQgdG8gdHJ1ZVxuICBpc0FkZCA9IGlzQWRkID09PSB1bmRlZmluZWQgPyB0cnVlIDogaXNBZGQ7XG4gIC8vIGJpbmQgZWFjaCBoYW5kbGVcbiAgdmFyIGJpbmRNZXRob2QgPSBpc0FkZCA/ICdhZGRFdmVudExpc3RlbmVyJyA6ICdyZW1vdmVFdmVudExpc3RlbmVyJztcbiAgdmFyIHRvdWNoQWN0aW9uID0gaXNBZGQgPyB0aGlzLl90b3VjaEFjdGlvblZhbHVlIDogJyc7XG4gIGZvciAoIHZhciBpPTA7IGkgPCB0aGlzLmhhbmRsZXMubGVuZ3RoOyBpKysgKSB7XG4gICAgdmFyIGhhbmRsZSA9IHRoaXMuaGFuZGxlc1tpXTtcbiAgICB0aGlzLl9iaW5kU3RhcnRFdmVudCggaGFuZGxlLCBpc0FkZCApO1xuICAgIGhhbmRsZVsgYmluZE1ldGhvZCBdKCAnY2xpY2snLCB0aGlzICk7XG4gICAgLy8gdG91Y2gtYWN0aW9uOiBub25lIHRvIG92ZXJyaWRlIGJyb3dzZXIgdG91Y2ggZ2VzdHVyZXMuIG1ldGFmaXp6eS9mbGlja2l0eSM1NDBcbiAgICBpZiAoIHdpbmRvdy5Qb2ludGVyRXZlbnQgKSB7XG4gICAgICBoYW5kbGUuc3R5bGUudG91Y2hBY3Rpb24gPSB0b3VjaEFjdGlvbjtcbiAgICB9XG4gIH1cbn07XG5cbi8vIHByb3RvdHlwZSBzbyBpdCBjYW4gYmUgb3ZlcndyaXRlYWJsZSBieSBGbGlja2l0eVxucHJvdG8uX3RvdWNoQWN0aW9uVmFsdWUgPSAnbm9uZSc7XG5cbi8vIC0tLS0tIHN0YXJ0IGV2ZW50IC0tLS0tIC8vXG5cbi8qKlxuICogcG9pbnRlciBzdGFydFxuICogQHBhcmFtIHtFdmVudH0gZXZlbnRcbiAqIEBwYXJhbSB7RXZlbnQgb3IgVG91Y2h9IHBvaW50ZXJcbiAqL1xucHJvdG8ucG9pbnRlckRvd24gPSBmdW5jdGlvbiggZXZlbnQsIHBvaW50ZXIgKSB7XG4gIHZhciBpc09rYXkgPSB0aGlzLm9rYXlQb2ludGVyRG93biggZXZlbnQgKTtcbiAgaWYgKCAhaXNPa2F5ICkge1xuICAgIHJldHVybjtcbiAgfVxuICAvLyB0cmFjayBzdGFydCBldmVudCBwb3NpdGlvblxuICB0aGlzLnBvaW50ZXJEb3duUG9pbnRlciA9IHBvaW50ZXI7XG5cbiAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgdGhpcy5wb2ludGVyRG93bkJsdXIoKTtcbiAgLy8gYmluZCBtb3ZlIGFuZCBlbmQgZXZlbnRzXG4gIHRoaXMuX2JpbmRQb3N0U3RhcnRFdmVudHMoIGV2ZW50ICk7XG4gIHRoaXMuZW1pdEV2ZW50KCAncG9pbnRlckRvd24nLCBbIGV2ZW50LCBwb2ludGVyIF0gKTtcbn07XG5cbi8vIG5vZGVzIHRoYXQgaGF2ZSB0ZXh0IGZpZWxkc1xudmFyIGN1cnNvck5vZGVzID0ge1xuICBURVhUQVJFQTogdHJ1ZSxcbiAgSU5QVVQ6IHRydWUsXG4gIFNFTEVDVDogdHJ1ZSxcbiAgT1BUSU9OOiB0cnVlLFxufTtcblxuLy8gaW5wdXQgdHlwZXMgdGhhdCBkbyBub3QgaGF2ZSB0ZXh0IGZpZWxkc1xudmFyIGNsaWNrVHlwZXMgPSB7XG4gIHJhZGlvOiB0cnVlLFxuICBjaGVja2JveDogdHJ1ZSxcbiAgYnV0dG9uOiB0cnVlLFxuICBzdWJtaXQ6IHRydWUsXG4gIGltYWdlOiB0cnVlLFxuICBmaWxlOiB0cnVlLFxufTtcblxuLy8gZGlzbWlzcyBpbnB1dHMgd2l0aCB0ZXh0IGZpZWxkcy4gZmxpY2tpdHkjNDAzLCBmbGlja2l0eSM0MDRcbnByb3RvLm9rYXlQb2ludGVyRG93biA9IGZ1bmN0aW9uKCBldmVudCApIHtcbiAgdmFyIGlzQ3Vyc29yTm9kZSA9IGN1cnNvck5vZGVzWyBldmVudC50YXJnZXQubm9kZU5hbWUgXTtcbiAgdmFyIGlzQ2xpY2tUeXBlID0gY2xpY2tUeXBlc1sgZXZlbnQudGFyZ2V0LnR5cGUgXTtcbiAgdmFyIGlzT2theSA9ICFpc0N1cnNvck5vZGUgfHwgaXNDbGlja1R5cGU7XG4gIGlmICggIWlzT2theSApIHtcbiAgICB0aGlzLl9wb2ludGVyUmVzZXQoKTtcbiAgfVxuICByZXR1cm4gaXNPa2F5O1xufTtcblxuLy8ga2x1ZGdlIHRvIGJsdXIgcHJldmlvdXNseSBmb2N1c2VkIGlucHV0XG5wcm90by5wb2ludGVyRG93bkJsdXIgPSBmdW5jdGlvbigpIHtcbiAgdmFyIGZvY3VzZWQgPSBkb2N1bWVudC5hY3RpdmVFbGVtZW50O1xuICAvLyBkbyBub3QgYmx1ciBib2R5IGZvciBJRTEwLCBtZXRhZml6enkvZmxpY2tpdHkjMTE3XG4gIHZhciBjYW5CbHVyID0gZm9jdXNlZCAmJiBmb2N1c2VkLmJsdXIgJiYgZm9jdXNlZCAhPSBkb2N1bWVudC5ib2R5O1xuICBpZiAoIGNhbkJsdXIgKSB7XG4gICAgZm9jdXNlZC5ibHVyKCk7XG4gIH1cbn07XG5cbi8vIC0tLS0tIG1vdmUgZXZlbnQgLS0tLS0gLy9cblxuLyoqXG4gKiBkcmFnIG1vdmVcbiAqIEBwYXJhbSB7RXZlbnR9IGV2ZW50XG4gKiBAcGFyYW0ge0V2ZW50IG9yIFRvdWNofSBwb2ludGVyXG4gKi9cbnByb3RvLnBvaW50ZXJNb3ZlID0gZnVuY3Rpb24oIGV2ZW50LCBwb2ludGVyICkge1xuICB2YXIgbW92ZVZlY3RvciA9IHRoaXMuX2RyYWdQb2ludGVyTW92ZSggZXZlbnQsIHBvaW50ZXIgKTtcbiAgdGhpcy5lbWl0RXZlbnQoICdwb2ludGVyTW92ZScsIFsgZXZlbnQsIHBvaW50ZXIsIG1vdmVWZWN0b3IgXSApO1xuICB0aGlzLl9kcmFnTW92ZSggZXZlbnQsIHBvaW50ZXIsIG1vdmVWZWN0b3IgKTtcbn07XG5cbi8vIGJhc2UgcG9pbnRlciBtb3ZlIGxvZ2ljXG5wcm90by5fZHJhZ1BvaW50ZXJNb3ZlID0gZnVuY3Rpb24oIGV2ZW50LCBwb2ludGVyICkge1xuICB2YXIgbW92ZVZlY3RvciA9IHtcbiAgICB4OiBwb2ludGVyLnBhZ2VYIC0gdGhpcy5wb2ludGVyRG93blBvaW50ZXIucGFnZVgsXG4gICAgeTogcG9pbnRlci5wYWdlWSAtIHRoaXMucG9pbnRlckRvd25Qb2ludGVyLnBhZ2VZXG4gIH07XG4gIC8vIHN0YXJ0IGRyYWcgaWYgcG9pbnRlciBoYXMgbW92ZWQgZmFyIGVub3VnaCB0byBzdGFydCBkcmFnXG4gIGlmICggIXRoaXMuaXNEcmFnZ2luZyAmJiB0aGlzLmhhc0RyYWdTdGFydGVkKCBtb3ZlVmVjdG9yICkgKSB7XG4gICAgdGhpcy5fZHJhZ1N0YXJ0KCBldmVudCwgcG9pbnRlciApO1xuICB9XG4gIHJldHVybiBtb3ZlVmVjdG9yO1xufTtcblxuLy8gY29uZGl0aW9uIGlmIHBvaW50ZXIgaGFzIG1vdmVkIGZhciBlbm91Z2ggdG8gc3RhcnQgZHJhZ1xucHJvdG8uaGFzRHJhZ1N0YXJ0ZWQgPSBmdW5jdGlvbiggbW92ZVZlY3RvciApIHtcbiAgcmV0dXJuIE1hdGguYWJzKCBtb3ZlVmVjdG9yLnggKSA+IDMgfHwgTWF0aC5hYnMoIG1vdmVWZWN0b3IueSApID4gMztcbn07XG5cbi8vIC0tLS0tIGVuZCBldmVudCAtLS0tLSAvL1xuXG4vKipcbiAqIHBvaW50ZXIgdXBcbiAqIEBwYXJhbSB7RXZlbnR9IGV2ZW50XG4gKiBAcGFyYW0ge0V2ZW50IG9yIFRvdWNofSBwb2ludGVyXG4gKi9cbnByb3RvLnBvaW50ZXJVcCA9IGZ1bmN0aW9uKCBldmVudCwgcG9pbnRlciApIHtcbiAgdGhpcy5lbWl0RXZlbnQoICdwb2ludGVyVXAnLCBbIGV2ZW50LCBwb2ludGVyIF0gKTtcbiAgdGhpcy5fZHJhZ1BvaW50ZXJVcCggZXZlbnQsIHBvaW50ZXIgKTtcbn07XG5cbnByb3RvLl9kcmFnUG9pbnRlclVwID0gZnVuY3Rpb24oIGV2ZW50LCBwb2ludGVyICkge1xuICBpZiAoIHRoaXMuaXNEcmFnZ2luZyApIHtcbiAgICB0aGlzLl9kcmFnRW5kKCBldmVudCwgcG9pbnRlciApO1xuICB9IGVsc2Uge1xuICAgIC8vIHBvaW50ZXIgZGlkbid0IG1vdmUgZW5vdWdoIGZvciBkcmFnIHRvIHN0YXJ0XG4gICAgdGhpcy5fc3RhdGljQ2xpY2soIGV2ZW50LCBwb2ludGVyICk7XG4gIH1cbn07XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIGRyYWcgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gLy9cblxuLy8gZHJhZ1N0YXJ0XG5wcm90by5fZHJhZ1N0YXJ0ID0gZnVuY3Rpb24oIGV2ZW50LCBwb2ludGVyICkge1xuICB0aGlzLmlzRHJhZ2dpbmcgPSB0cnVlO1xuICAvLyBwcmV2ZW50IGNsaWNrc1xuICB0aGlzLmlzUHJldmVudGluZ0NsaWNrcyA9IHRydWU7XG4gIHRoaXMuZHJhZ1N0YXJ0KCBldmVudCwgcG9pbnRlciApO1xufTtcblxucHJvdG8uZHJhZ1N0YXJ0ID0gZnVuY3Rpb24oIGV2ZW50LCBwb2ludGVyICkge1xuICB0aGlzLmVtaXRFdmVudCggJ2RyYWdTdGFydCcsIFsgZXZlbnQsIHBvaW50ZXIgXSApO1xufTtcblxuLy8gZHJhZ01vdmVcbnByb3RvLl9kcmFnTW92ZSA9IGZ1bmN0aW9uKCBldmVudCwgcG9pbnRlciwgbW92ZVZlY3RvciApIHtcbiAgLy8gZG8gbm90IGRyYWcgaWYgbm90IGRyYWdnaW5nIHlldFxuICBpZiAoICF0aGlzLmlzRHJhZ2dpbmcgKSB7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgdGhpcy5kcmFnTW92ZSggZXZlbnQsIHBvaW50ZXIsIG1vdmVWZWN0b3IgKTtcbn07XG5cbnByb3RvLmRyYWdNb3ZlID0gZnVuY3Rpb24oIGV2ZW50LCBwb2ludGVyLCBtb3ZlVmVjdG9yICkge1xuICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICB0aGlzLmVtaXRFdmVudCggJ2RyYWdNb3ZlJywgWyBldmVudCwgcG9pbnRlciwgbW92ZVZlY3RvciBdICk7XG59O1xuXG4vLyBkcmFnRW5kXG5wcm90by5fZHJhZ0VuZCA9IGZ1bmN0aW9uKCBldmVudCwgcG9pbnRlciApIHtcbiAgLy8gc2V0IGZsYWdzXG4gIHRoaXMuaXNEcmFnZ2luZyA9IGZhbHNlO1xuICAvLyByZS1lbmFibGUgY2xpY2tpbmcgYXN5bmNcbiAgc2V0VGltZW91dCggZnVuY3Rpb24oKSB7XG4gICAgZGVsZXRlIHRoaXMuaXNQcmV2ZW50aW5nQ2xpY2tzO1xuICB9LmJpbmQoIHRoaXMgKSApO1xuXG4gIHRoaXMuZHJhZ0VuZCggZXZlbnQsIHBvaW50ZXIgKTtcbn07XG5cbnByb3RvLmRyYWdFbmQgPSBmdW5jdGlvbiggZXZlbnQsIHBvaW50ZXIgKSB7XG4gIHRoaXMuZW1pdEV2ZW50KCAnZHJhZ0VuZCcsIFsgZXZlbnQsIHBvaW50ZXIgXSApO1xufTtcblxuLy8gLS0tLS0gb25jbGljayAtLS0tLSAvL1xuXG4vLyBoYW5kbGUgYWxsIGNsaWNrcyBhbmQgcHJldmVudCBjbGlja3Mgd2hlbiBkcmFnZ2luZ1xucHJvdG8ub25jbGljayA9IGZ1bmN0aW9uKCBldmVudCApIHtcbiAgaWYgKCB0aGlzLmlzUHJldmVudGluZ0NsaWNrcyApIHtcbiAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICB9XG59O1xuXG4vLyAtLS0tLSBzdGF0aWNDbGljayAtLS0tLSAvL1xuXG4vLyB0cmlnZ2VyZWQgYWZ0ZXIgcG9pbnRlciBkb3duICYgdXAgd2l0aCBuby90aW55IG1vdmVtZW50XG5wcm90by5fc3RhdGljQ2xpY2sgPSBmdW5jdGlvbiggZXZlbnQsIHBvaW50ZXIgKSB7XG4gIC8vIGlnbm9yZSBlbXVsYXRlZCBtb3VzZSB1cCBjbGlja3NcbiAgaWYgKCB0aGlzLmlzSWdub3JpbmdNb3VzZVVwICYmIGV2ZW50LnR5cGUgPT0gJ21vdXNldXAnICkge1xuICAgIHJldHVybjtcbiAgfVxuXG4gIHRoaXMuc3RhdGljQ2xpY2soIGV2ZW50LCBwb2ludGVyICk7XG5cbiAgLy8gc2V0IGZsYWcgZm9yIGVtdWxhdGVkIGNsaWNrcyAzMDBtcyBhZnRlciB0b3VjaGVuZFxuICBpZiAoIGV2ZW50LnR5cGUgIT0gJ21vdXNldXAnICkge1xuICAgIHRoaXMuaXNJZ25vcmluZ01vdXNlVXAgPSB0cnVlO1xuICAgIC8vIHJlc2V0IGZsYWcgYWZ0ZXIgMzAwbXNcbiAgICBzZXRUaW1lb3V0KCBmdW5jdGlvbigpIHtcbiAgICAgIGRlbGV0ZSB0aGlzLmlzSWdub3JpbmdNb3VzZVVwO1xuICAgIH0uYmluZCggdGhpcyApLCA0MDAgKTtcbiAgfVxufTtcblxucHJvdG8uc3RhdGljQ2xpY2sgPSBmdW5jdGlvbiggZXZlbnQsIHBvaW50ZXIgKSB7XG4gIHRoaXMuZW1pdEV2ZW50KCAnc3RhdGljQ2xpY2snLCBbIGV2ZW50LCBwb2ludGVyIF0gKTtcbn07XG5cbi8vIC0tLS0tIHV0aWxzIC0tLS0tIC8vXG5cblVuaWRyYWdnZXIuZ2V0UG9pbnRlclBvaW50ID0gVW5pcG9pbnRlci5nZXRQb2ludGVyUG9pbnQ7XG5cbi8vIC0tLS0tICAtLS0tLSAvL1xuXG5yZXR1cm4gVW5pZHJhZ2dlcjtcblxufSkpO1xuIiwiLy8gZHJhZ1xuKCBmdW5jdGlvbiggd2luZG93LCBmYWN0b3J5ICkge1xuICAvLyB1bml2ZXJzYWwgbW9kdWxlIGRlZmluaXRpb25cbiAgLyoganNoaW50IHN0cmljdDogZmFsc2UgKi9cbiAgaWYgKCB0eXBlb2YgZGVmaW5lID09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCApIHtcbiAgICAvLyBBTURcbiAgICBkZWZpbmUoIFtcbiAgICAgICcuL2ZsaWNraXR5JyxcbiAgICAgICd1bmlkcmFnZ2VyL3VuaWRyYWdnZXInLFxuICAgICAgJ2Zpenp5LXVpLXV0aWxzL3V0aWxzJ1xuICAgIF0sIGZ1bmN0aW9uKCBGbGlja2l0eSwgVW5pZHJhZ2dlciwgdXRpbHMgKSB7XG4gICAgICByZXR1cm4gZmFjdG9yeSggd2luZG93LCBGbGlja2l0eSwgVW5pZHJhZ2dlciwgdXRpbHMgKTtcbiAgICB9KTtcbiAgfSBlbHNlIGlmICggdHlwZW9mIG1vZHVsZSA9PSAnb2JqZWN0JyAmJiBtb2R1bGUuZXhwb3J0cyApIHtcbiAgICAvLyBDb21tb25KU1xuICAgIG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeShcbiAgICAgIHdpbmRvdyxcbiAgICAgIHJlcXVpcmUoJy4vZmxpY2tpdHknKSxcbiAgICAgIHJlcXVpcmUoJ3VuaWRyYWdnZXInKSxcbiAgICAgIHJlcXVpcmUoJ2Zpenp5LXVpLXV0aWxzJylcbiAgICApO1xuICB9IGVsc2Uge1xuICAgIC8vIGJyb3dzZXIgZ2xvYmFsXG4gICAgd2luZG93LkZsaWNraXR5ID0gZmFjdG9yeShcbiAgICAgIHdpbmRvdyxcbiAgICAgIHdpbmRvdy5GbGlja2l0eSxcbiAgICAgIHdpbmRvdy5VbmlkcmFnZ2VyLFxuICAgICAgd2luZG93LmZpenp5VUlVdGlsc1xuICAgICk7XG4gIH1cblxufSggd2luZG93LCBmdW5jdGlvbiBmYWN0b3J5KCB3aW5kb3csIEZsaWNraXR5LCBVbmlkcmFnZ2VyLCB1dGlscyApIHtcblxuJ3VzZSBzdHJpY3QnO1xuXG4vLyAtLS0tLSBkZWZhdWx0cyAtLS0tLSAvL1xuXG51dGlscy5leHRlbmQoIEZsaWNraXR5LmRlZmF1bHRzLCB7XG4gIGRyYWdnYWJsZTogJz4xJyxcbiAgZHJhZ1RocmVzaG9sZDogMyxcbn0pO1xuXG4vLyAtLS0tLSBjcmVhdGUgLS0tLS0gLy9cblxuRmxpY2tpdHkuY3JlYXRlTWV0aG9kcy5wdXNoKCdfY3JlYXRlRHJhZycpO1xuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSBkcmFnIHByb3RvdHlwZSAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSAvL1xuXG52YXIgcHJvdG8gPSBGbGlja2l0eS5wcm90b3R5cGU7XG51dGlscy5leHRlbmQoIHByb3RvLCBVbmlkcmFnZ2VyLnByb3RvdHlwZSApO1xucHJvdG8uX3RvdWNoQWN0aW9uVmFsdWUgPSAncGFuLXknO1xuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSAgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gLy9cblxudmFyIGlzVG91Y2ggPSAnY3JlYXRlVG91Y2gnIGluIGRvY3VtZW50O1xudmFyIGlzVG91Y2htb3ZlU2Nyb2xsQ2FuY2VsZWQgPSBmYWxzZTtcblxucHJvdG8uX2NyZWF0ZURyYWcgPSBmdW5jdGlvbigpIHtcbiAgdGhpcy5vbiggJ2FjdGl2YXRlJywgdGhpcy5vbkFjdGl2YXRlRHJhZyApO1xuICB0aGlzLm9uKCAndWlDaGFuZ2UnLCB0aGlzLl91aUNoYW5nZURyYWcgKTtcbiAgdGhpcy5vbiggJ2RlYWN0aXZhdGUnLCB0aGlzLm9uRGVhY3RpdmF0ZURyYWcgKTtcbiAgdGhpcy5vbiggJ2NlbGxDaGFuZ2UnLCB0aGlzLnVwZGF0ZURyYWdnYWJsZSApO1xuICAvLyBUT0RPIHVwZGF0ZURyYWdnYWJsZSBvbiByZXNpemU/IGlmIGdyb3VwQ2VsbHMgJiBzbGlkZXMgY2hhbmdlXG4gIC8vIEhBQ0sgLSBhZGQgc2VlbWluZ2x5IGlubm9jdW91cyBoYW5kbGVyIHRvIGZpeCBpT1MgMTAgc2Nyb2xsIGJlaGF2aW9yXG4gIC8vICM0NTcsIFJ1YmFYYS9Tb3J0YWJsZSM5NzNcbiAgaWYgKCBpc1RvdWNoICYmICFpc1RvdWNobW92ZVNjcm9sbENhbmNlbGVkICkge1xuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCAndG91Y2htb3ZlJywgZnVuY3Rpb24oKSB7fSk7XG4gICAgaXNUb3VjaG1vdmVTY3JvbGxDYW5jZWxlZCA9IHRydWU7XG4gIH1cbn07XG5cbnByb3RvLm9uQWN0aXZhdGVEcmFnID0gZnVuY3Rpb24oKSB7XG4gIHRoaXMuaGFuZGxlcyA9IFsgdGhpcy52aWV3cG9ydCBdO1xuICB0aGlzLmJpbmRIYW5kbGVzKCk7XG4gIHRoaXMudXBkYXRlRHJhZ2dhYmxlKCk7XG59O1xuXG5wcm90by5vbkRlYWN0aXZhdGVEcmFnID0gZnVuY3Rpb24oKSB7XG4gIHRoaXMudW5iaW5kSGFuZGxlcygpO1xuICB0aGlzLmVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZSgnaXMtZHJhZ2dhYmxlJyk7XG59O1xuXG5wcm90by51cGRhdGVEcmFnZ2FibGUgPSBmdW5jdGlvbigpIHtcbiAgLy8gZGlzYWJsZSBkcmFnZ2luZyBpZiBsZXNzIHRoYW4gMiBzbGlkZXMuICMyNzhcbiAgaWYgKCB0aGlzLm9wdGlvbnMuZHJhZ2dhYmxlID09ICc+MScgKSB7XG4gICAgdGhpcy5pc0RyYWdnYWJsZSA9IHRoaXMuc2xpZGVzLmxlbmd0aCA+IDE7XG4gIH0gZWxzZSB7XG4gICAgdGhpcy5pc0RyYWdnYWJsZSA9IHRoaXMub3B0aW9ucy5kcmFnZ2FibGU7XG4gIH1cbiAgaWYgKCB0aGlzLmlzRHJhZ2dhYmxlICkge1xuICAgIHRoaXMuZWxlbWVudC5jbGFzc0xpc3QuYWRkKCdpcy1kcmFnZ2FibGUnKTtcbiAgfSBlbHNlIHtcbiAgICB0aGlzLmVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZSgnaXMtZHJhZ2dhYmxlJyk7XG4gIH1cbn07XG5cbi8vIGJhY2t3YXJkcyBjb21wYXRpYmlsaXR5XG5wcm90by5iaW5kRHJhZyA9IGZ1bmN0aW9uKCkge1xuICB0aGlzLm9wdGlvbnMuZHJhZ2dhYmxlID0gdHJ1ZTtcbiAgdGhpcy51cGRhdGVEcmFnZ2FibGUoKTtcbn07XG5cbnByb3RvLnVuYmluZERyYWcgPSBmdW5jdGlvbigpIHtcbiAgdGhpcy5vcHRpb25zLmRyYWdnYWJsZSA9IGZhbHNlO1xuICB0aGlzLnVwZGF0ZURyYWdnYWJsZSgpO1xufTtcblxucHJvdG8uX3VpQ2hhbmdlRHJhZyA9IGZ1bmN0aW9uKCkge1xuICBkZWxldGUgdGhpcy5pc0ZyZWVTY3JvbGxpbmc7XG59O1xuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSBwb2ludGVyIGV2ZW50cyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSAvL1xuXG5wcm90by5wb2ludGVyRG93biA9IGZ1bmN0aW9uKCBldmVudCwgcG9pbnRlciApIHtcbiAgaWYgKCAhdGhpcy5pc0RyYWdnYWJsZSApIHtcbiAgICB0aGlzLl9wb2ludGVyRG93bkRlZmF1bHQoIGV2ZW50LCBwb2ludGVyICk7XG4gICAgcmV0dXJuO1xuICB9XG4gIHZhciBpc09rYXkgPSB0aGlzLm9rYXlQb2ludGVyRG93biggZXZlbnQgKTtcbiAgaWYgKCAhaXNPa2F5ICkge1xuICAgIHJldHVybjtcbiAgfVxuXG4gIHRoaXMuX3BvaW50ZXJEb3duUHJldmVudERlZmF1bHQoIGV2ZW50ICk7XG4gIHRoaXMucG9pbnRlckRvd25Gb2N1cyggZXZlbnQgKTtcbiAgLy8gYmx1clxuICBpZiAoIGRvY3VtZW50LmFjdGl2ZUVsZW1lbnQgIT0gdGhpcy5lbGVtZW50ICkge1xuICAgIC8vIGRvIG5vdCBibHVyIGlmIGFscmVhZHkgZm9jdXNlZFxuICAgIHRoaXMucG9pbnRlckRvd25CbHVyKCk7XG4gIH1cblxuICAvLyBzdG9wIGlmIGl0IHdhcyBtb3ZpbmdcbiAgdGhpcy5kcmFnWCA9IHRoaXMueDtcbiAgdGhpcy52aWV3cG9ydC5jbGFzc0xpc3QuYWRkKCdpcy1wb2ludGVyLWRvd24nKTtcbiAgLy8gdHJhY2sgc2Nyb2xsaW5nXG4gIHRoaXMucG9pbnRlckRvd25TY3JvbGwgPSBnZXRTY3JvbGxQb3NpdGlvbigpO1xuICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lciggJ3Njcm9sbCcsIHRoaXMgKTtcblxuICB0aGlzLl9wb2ludGVyRG93bkRlZmF1bHQoIGV2ZW50LCBwb2ludGVyICk7XG59O1xuXG4vLyBkZWZhdWx0IHBvaW50ZXJEb3duIGxvZ2ljLCB1c2VkIGZvciBzdGF0aWNDbGlja1xucHJvdG8uX3BvaW50ZXJEb3duRGVmYXVsdCA9IGZ1bmN0aW9uKCBldmVudCwgcG9pbnRlciApIHtcbiAgLy8gdHJhY2sgc3RhcnQgZXZlbnQgcG9zaXRpb25cbiAgLy8gU2FmYXJpIDkgb3ZlcnJpZGVzIHBhZ2VYIGFuZCBwYWdlWS4gVGhlc2UgdmFsdWVzIG5lZWRzIHRvIGJlIGNvcGllZC4gIzc3OVxuICB0aGlzLnBvaW50ZXJEb3duUG9pbnRlciA9IHtcbiAgICBwYWdlWDogcG9pbnRlci5wYWdlWCxcbiAgICBwYWdlWTogcG9pbnRlci5wYWdlWSxcbiAgfTtcbiAgLy8gYmluZCBtb3ZlIGFuZCBlbmQgZXZlbnRzXG4gIHRoaXMuX2JpbmRQb3N0U3RhcnRFdmVudHMoIGV2ZW50ICk7XG4gIHRoaXMuZGlzcGF0Y2hFdmVudCggJ3BvaW50ZXJEb3duJywgZXZlbnQsIFsgcG9pbnRlciBdICk7XG59O1xuXG52YXIgZm9jdXNOb2RlcyA9IHtcbiAgSU5QVVQ6IHRydWUsXG4gIFRFWFRBUkVBOiB0cnVlLFxuICBTRUxFQ1Q6IHRydWUsXG59O1xuXG5wcm90by5wb2ludGVyRG93bkZvY3VzID0gZnVuY3Rpb24oIGV2ZW50ICkge1xuICB2YXIgaXNGb2N1c05vZGUgPSBmb2N1c05vZGVzWyBldmVudC50YXJnZXQubm9kZU5hbWUgXTtcbiAgaWYgKCAhaXNGb2N1c05vZGUgKSB7XG4gICAgdGhpcy5mb2N1cygpO1xuICB9XG59O1xuXG5wcm90by5fcG9pbnRlckRvd25QcmV2ZW50RGVmYXVsdCA9IGZ1bmN0aW9uKCBldmVudCApIHtcbiAgdmFyIGlzVG91Y2hTdGFydCA9IGV2ZW50LnR5cGUgPT0gJ3RvdWNoc3RhcnQnO1xuICB2YXIgaXNUb3VjaFBvaW50ZXIgPSBldmVudC5wb2ludGVyVHlwZSA9PSAndG91Y2gnO1xuICB2YXIgaXNGb2N1c05vZGUgPSBmb2N1c05vZGVzWyBldmVudC50YXJnZXQubm9kZU5hbWUgXTtcbiAgaWYgKCAhaXNUb3VjaFN0YXJ0ICYmICFpc1RvdWNoUG9pbnRlciAmJiAhaXNGb2N1c05vZGUgKSB7XG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgfVxufTtcblxuLy8gLS0tLS0gbW92ZSAtLS0tLSAvL1xuXG5wcm90by5oYXNEcmFnU3RhcnRlZCA9IGZ1bmN0aW9uKCBtb3ZlVmVjdG9yICkge1xuICByZXR1cm4gTWF0aC5hYnMoIG1vdmVWZWN0b3IueCApID4gdGhpcy5vcHRpb25zLmRyYWdUaHJlc2hvbGQ7XG59O1xuXG4vLyAtLS0tLSB1cCAtLS0tLSAvL1xuXG5wcm90by5wb2ludGVyVXAgPSBmdW5jdGlvbiggZXZlbnQsIHBvaW50ZXIgKSB7XG4gIGRlbGV0ZSB0aGlzLmlzVG91Y2hTY3JvbGxpbmc7XG4gIHRoaXMudmlld3BvcnQuY2xhc3NMaXN0LnJlbW92ZSgnaXMtcG9pbnRlci1kb3duJyk7XG4gIHRoaXMuZGlzcGF0Y2hFdmVudCggJ3BvaW50ZXJVcCcsIGV2ZW50LCBbIHBvaW50ZXIgXSApO1xuICB0aGlzLl9kcmFnUG9pbnRlclVwKCBldmVudCwgcG9pbnRlciApO1xufTtcblxucHJvdG8ucG9pbnRlckRvbmUgPSBmdW5jdGlvbigpIHtcbiAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoICdzY3JvbGwnLCB0aGlzICk7XG4gIGRlbGV0ZSB0aGlzLnBvaW50ZXJEb3duU2Nyb2xsO1xufTtcblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gZHJhZ2dpbmcgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gLy9cblxucHJvdG8uZHJhZ1N0YXJ0ID0gZnVuY3Rpb24oIGV2ZW50LCBwb2ludGVyICkge1xuICBpZiAoICF0aGlzLmlzRHJhZ2dhYmxlICkge1xuICAgIHJldHVybjtcbiAgfVxuICB0aGlzLmRyYWdTdGFydFBvc2l0aW9uID0gdGhpcy54O1xuICB0aGlzLnN0YXJ0QW5pbWF0aW9uKCk7XG4gIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCAnc2Nyb2xsJywgdGhpcyApO1xuICB0aGlzLmRpc3BhdGNoRXZlbnQoICdkcmFnU3RhcnQnLCBldmVudCwgWyBwb2ludGVyIF0gKTtcbn07XG5cbnByb3RvLnBvaW50ZXJNb3ZlID0gZnVuY3Rpb24oIGV2ZW50LCBwb2ludGVyICkge1xuICB2YXIgbW92ZVZlY3RvciA9IHRoaXMuX2RyYWdQb2ludGVyTW92ZSggZXZlbnQsIHBvaW50ZXIgKTtcbiAgdGhpcy5kaXNwYXRjaEV2ZW50KCAncG9pbnRlck1vdmUnLCBldmVudCwgWyBwb2ludGVyLCBtb3ZlVmVjdG9yIF0gKTtcbiAgdGhpcy5fZHJhZ01vdmUoIGV2ZW50LCBwb2ludGVyLCBtb3ZlVmVjdG9yICk7XG59O1xuXG5wcm90by5kcmFnTW92ZSA9IGZ1bmN0aW9uKCBldmVudCwgcG9pbnRlciwgbW92ZVZlY3RvciApIHtcbiAgaWYgKCAhdGhpcy5pc0RyYWdnYWJsZSApIHtcbiAgICByZXR1cm47XG4gIH1cbiAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcblxuICB0aGlzLnByZXZpb3VzRHJhZ1ggPSB0aGlzLmRyYWdYO1xuICAvLyByZXZlcnNlIGlmIHJpZ2h0LXRvLWxlZnRcbiAgdmFyIGRpcmVjdGlvbiA9IHRoaXMub3B0aW9ucy5yaWdodFRvTGVmdCA/IC0xIDogMTtcbiAgaWYgKCB0aGlzLm9wdGlvbnMud3JhcEFyb3VuZCApIHtcbiAgICAvLyB3cmFwIGFyb3VuZCBtb3ZlLiAjNTg5XG4gICAgbW92ZVZlY3Rvci54ID0gbW92ZVZlY3Rvci54ICUgdGhpcy5zbGlkZWFibGVXaWR0aDtcbiAgfVxuICB2YXIgZHJhZ1ggPSB0aGlzLmRyYWdTdGFydFBvc2l0aW9uICsgbW92ZVZlY3Rvci54ICogZGlyZWN0aW9uO1xuXG4gIGlmICggIXRoaXMub3B0aW9ucy53cmFwQXJvdW5kICYmIHRoaXMuc2xpZGVzLmxlbmd0aCApIHtcbiAgICAvLyBzbG93IGRyYWdcbiAgICB2YXIgb3JpZ2luQm91bmQgPSBNYXRoLm1heCggLXRoaXMuc2xpZGVzWzBdLnRhcmdldCwgdGhpcy5kcmFnU3RhcnRQb3NpdGlvbiApO1xuICAgIGRyYWdYID0gZHJhZ1ggPiBvcmlnaW5Cb3VuZCA/ICggZHJhZ1ggKyBvcmlnaW5Cb3VuZCApICogMC41IDogZHJhZ1g7XG4gICAgdmFyIGVuZEJvdW5kID0gTWF0aC5taW4oIC10aGlzLmdldExhc3RTbGlkZSgpLnRhcmdldCwgdGhpcy5kcmFnU3RhcnRQb3NpdGlvbiApO1xuICAgIGRyYWdYID0gZHJhZ1ggPCBlbmRCb3VuZCA/ICggZHJhZ1ggKyBlbmRCb3VuZCApICogMC41IDogZHJhZ1g7XG4gIH1cblxuICB0aGlzLmRyYWdYID0gZHJhZ1g7XG5cbiAgdGhpcy5kcmFnTW92ZVRpbWUgPSBuZXcgRGF0ZSgpO1xuICB0aGlzLmRpc3BhdGNoRXZlbnQoICdkcmFnTW92ZScsIGV2ZW50LCBbIHBvaW50ZXIsIG1vdmVWZWN0b3IgXSApO1xufTtcblxucHJvdG8uZHJhZ0VuZCA9IGZ1bmN0aW9uKCBldmVudCwgcG9pbnRlciApIHtcbiAgaWYgKCAhdGhpcy5pc0RyYWdnYWJsZSApIHtcbiAgICByZXR1cm47XG4gIH1cbiAgaWYgKCB0aGlzLm9wdGlvbnMuZnJlZVNjcm9sbCApIHtcbiAgICB0aGlzLmlzRnJlZVNjcm9sbGluZyA9IHRydWU7XG4gIH1cbiAgLy8gc2V0IHNlbGVjdGVkSW5kZXggYmFzZWQgb24gd2hlcmUgZmxpY2sgd2lsbCBlbmQgdXBcbiAgdmFyIGluZGV4ID0gdGhpcy5kcmFnRW5kUmVzdGluZ1NlbGVjdCgpO1xuXG4gIGlmICggdGhpcy5vcHRpb25zLmZyZWVTY3JvbGwgJiYgIXRoaXMub3B0aW9ucy53cmFwQXJvdW5kICkge1xuICAgIC8vIGlmIGZyZWUtc2Nyb2xsICYgbm90IHdyYXAgYXJvdW5kXG4gICAgLy8gZG8gbm90IGZyZWUtc2Nyb2xsIGlmIGdvaW5nIG91dHNpZGUgb2YgYm91bmRpbmcgc2xpZGVzXG4gICAgLy8gc28gYm91bmRpbmcgc2xpZGVzIGNhbiBhdHRyYWN0IHNsaWRlciwgYW5kIGtlZXAgaXQgaW4gYm91bmRzXG4gICAgdmFyIHJlc3RpbmdYID0gdGhpcy5nZXRSZXN0aW5nUG9zaXRpb24oKTtcbiAgICB0aGlzLmlzRnJlZVNjcm9sbGluZyA9IC1yZXN0aW5nWCA+IHRoaXMuc2xpZGVzWzBdLnRhcmdldCAmJlxuICAgICAgLXJlc3RpbmdYIDwgdGhpcy5nZXRMYXN0U2xpZGUoKS50YXJnZXQ7XG4gIH0gZWxzZSBpZiAoICF0aGlzLm9wdGlvbnMuZnJlZVNjcm9sbCAmJiBpbmRleCA9PSB0aGlzLnNlbGVjdGVkSW5kZXggKSB7XG4gICAgLy8gYm9vc3Qgc2VsZWN0aW9uIGlmIHNlbGVjdGVkIGluZGV4IGhhcyBub3QgY2hhbmdlZFxuICAgIGluZGV4ICs9IHRoaXMuZHJhZ0VuZEJvb3N0U2VsZWN0KCk7XG4gIH1cbiAgZGVsZXRlIHRoaXMucHJldmlvdXNEcmFnWDtcbiAgLy8gYXBwbHkgc2VsZWN0aW9uXG4gIC8vIFRPRE8gcmVmYWN0b3IgdGhpcywgc2VsZWN0aW5nIGhlcmUgZmVlbHMgd2VpcmRcbiAgLy8gSEFDSywgc2V0IGZsYWcgc28gZHJhZ2dpbmcgc3RheXMgaW4gY29ycmVjdCBkaXJlY3Rpb25cbiAgdGhpcy5pc0RyYWdTZWxlY3QgPSB0aGlzLm9wdGlvbnMud3JhcEFyb3VuZDtcbiAgdGhpcy5zZWxlY3QoIGluZGV4ICk7XG4gIGRlbGV0ZSB0aGlzLmlzRHJhZ1NlbGVjdDtcbiAgdGhpcy5kaXNwYXRjaEV2ZW50KCAnZHJhZ0VuZCcsIGV2ZW50LCBbIHBvaW50ZXIgXSApO1xufTtcblxucHJvdG8uZHJhZ0VuZFJlc3RpbmdTZWxlY3QgPSBmdW5jdGlvbigpIHtcbiAgdmFyIHJlc3RpbmdYID0gdGhpcy5nZXRSZXN0aW5nUG9zaXRpb24oKTtcbiAgLy8gaG93IGZhciBhd2F5IGZyb20gc2VsZWN0ZWQgc2xpZGVcbiAgdmFyIGRpc3RhbmNlID0gTWF0aC5hYnMoIHRoaXMuZ2V0U2xpZGVEaXN0YW5jZSggLXJlc3RpbmdYLCB0aGlzLnNlbGVjdGVkSW5kZXggKSApO1xuICAvLyBnZXQgY2xvc2V0IHJlc3RpbmcgZ29pbmcgdXAgYW5kIGdvaW5nIGRvd25cbiAgdmFyIHBvc2l0aXZlUmVzdGluZyA9IHRoaXMuX2dldENsb3Nlc3RSZXN0aW5nKCByZXN0aW5nWCwgZGlzdGFuY2UsIDEgKTtcbiAgdmFyIG5lZ2F0aXZlUmVzdGluZyA9IHRoaXMuX2dldENsb3Nlc3RSZXN0aW5nKCByZXN0aW5nWCwgZGlzdGFuY2UsIC0xICk7XG4gIC8vIHVzZSBjbG9zZXIgcmVzdGluZyBmb3Igd3JhcC1hcm91bmRcbiAgdmFyIGluZGV4ID0gcG9zaXRpdmVSZXN0aW5nLmRpc3RhbmNlIDwgbmVnYXRpdmVSZXN0aW5nLmRpc3RhbmNlID9cbiAgICBwb3NpdGl2ZVJlc3RpbmcuaW5kZXggOiBuZWdhdGl2ZVJlc3RpbmcuaW5kZXg7XG4gIHJldHVybiBpbmRleDtcbn07XG5cbi8qKlxuICogZ2l2ZW4gcmVzdGluZyBYIGFuZCBkaXN0YW5jZSB0byBzZWxlY3RlZCBjZWxsXG4gKiBnZXQgdGhlIGRpc3RhbmNlIGFuZCBpbmRleCBvZiB0aGUgY2xvc2VzdCBjZWxsXG4gKiBAcGFyYW0ge051bWJlcn0gcmVzdGluZ1ggLSBlc3RpbWF0ZWQgcG9zdC1mbGljayByZXN0aW5nIHBvc2l0aW9uXG4gKiBAcGFyYW0ge051bWJlcn0gZGlzdGFuY2UgLSBkaXN0YW5jZSB0byBzZWxlY3RlZCBjZWxsXG4gKiBAcGFyYW0ge0ludGVnZXJ9IGluY3JlbWVudCAtICsxIG9yIC0xLCBnb2luZyB1cCBvciBkb3duXG4gKiBAcmV0dXJucyB7T2JqZWN0fSAtIHsgZGlzdGFuY2U6IHtOdW1iZXJ9LCBpbmRleDoge0ludGVnZXJ9IH1cbiAqL1xucHJvdG8uX2dldENsb3Nlc3RSZXN0aW5nID0gZnVuY3Rpb24oIHJlc3RpbmdYLCBkaXN0YW5jZSwgaW5jcmVtZW50ICkge1xuICB2YXIgaW5kZXggPSB0aGlzLnNlbGVjdGVkSW5kZXg7XG4gIHZhciBtaW5EaXN0YW5jZSA9IEluZmluaXR5O1xuICB2YXIgY29uZGl0aW9uID0gdGhpcy5vcHRpb25zLmNvbnRhaW4gJiYgIXRoaXMub3B0aW9ucy53cmFwQXJvdW5kID9cbiAgICAvLyBpZiBjb250YWluLCBrZWVwIGdvaW5nIGlmIGRpc3RhbmNlIGlzIGVxdWFsIHRvIG1pbkRpc3RhbmNlXG4gICAgZnVuY3Rpb24oIGQsIG1kICkgeyByZXR1cm4gZCA8PSBtZDsgfSA6IGZ1bmN0aW9uKCBkLCBtZCApIHsgcmV0dXJuIGQgPCBtZDsgfTtcbiAgd2hpbGUgKCBjb25kaXRpb24oIGRpc3RhbmNlLCBtaW5EaXN0YW5jZSApICkge1xuICAgIC8vIG1lYXN1cmUgZGlzdGFuY2UgdG8gbmV4dCBjZWxsXG4gICAgaW5kZXggKz0gaW5jcmVtZW50O1xuICAgIG1pbkRpc3RhbmNlID0gZGlzdGFuY2U7XG4gICAgZGlzdGFuY2UgPSB0aGlzLmdldFNsaWRlRGlzdGFuY2UoIC1yZXN0aW5nWCwgaW5kZXggKTtcbiAgICBpZiAoIGRpc3RhbmNlID09PSBudWxsICkge1xuICAgICAgYnJlYWs7XG4gICAgfVxuICAgIGRpc3RhbmNlID0gTWF0aC5hYnMoIGRpc3RhbmNlICk7XG4gIH1cbiAgcmV0dXJuIHtcbiAgICBkaXN0YW5jZTogbWluRGlzdGFuY2UsXG4gICAgLy8gc2VsZWN0ZWQgd2FzIHByZXZpb3VzIGluZGV4XG4gICAgaW5kZXg6IGluZGV4IC0gaW5jcmVtZW50XG4gIH07XG59O1xuXG4vKipcbiAqIG1lYXN1cmUgZGlzdGFuY2UgYmV0d2VlbiB4IGFuZCBhIHNsaWRlIHRhcmdldFxuICogQHBhcmFtIHtOdW1iZXJ9IHhcbiAqIEBwYXJhbSB7SW50ZWdlcn0gaW5kZXggLSBzbGlkZSBpbmRleFxuICovXG5wcm90by5nZXRTbGlkZURpc3RhbmNlID0gZnVuY3Rpb24oIHgsIGluZGV4ICkge1xuICB2YXIgbGVuID0gdGhpcy5zbGlkZXMubGVuZ3RoO1xuICAvLyB3cmFwIGFyb3VuZCBpZiBhdCBsZWFzdCAyIHNsaWRlc1xuICB2YXIgaXNXcmFwQXJvdW5kID0gdGhpcy5vcHRpb25zLndyYXBBcm91bmQgJiYgbGVuID4gMTtcbiAgdmFyIHNsaWRlSW5kZXggPSBpc1dyYXBBcm91bmQgPyB1dGlscy5tb2R1bG8oIGluZGV4LCBsZW4gKSA6IGluZGV4O1xuICB2YXIgc2xpZGUgPSB0aGlzLnNsaWRlc1sgc2xpZGVJbmRleCBdO1xuICBpZiAoICFzbGlkZSApIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuICAvLyBhZGQgZGlzdGFuY2UgZm9yIHdyYXAtYXJvdW5kIHNsaWRlc1xuICB2YXIgd3JhcCA9IGlzV3JhcEFyb3VuZCA/IHRoaXMuc2xpZGVhYmxlV2lkdGggKiBNYXRoLmZsb29yKCBpbmRleCAvIGxlbiApIDogMDtcbiAgcmV0dXJuIHggLSAoIHNsaWRlLnRhcmdldCArIHdyYXAgKTtcbn07XG5cbnByb3RvLmRyYWdFbmRCb29zdFNlbGVjdCA9IGZ1bmN0aW9uKCkge1xuICAvLyBkbyBub3QgYm9vc3QgaWYgbm8gcHJldmlvdXNEcmFnWCBvciBkcmFnTW92ZVRpbWVcbiAgaWYgKCB0aGlzLnByZXZpb3VzRHJhZ1ggPT09IHVuZGVmaW5lZCB8fCAhdGhpcy5kcmFnTW92ZVRpbWUgfHxcbiAgICAvLyBvciBpZiBkcmFnIHdhcyBoZWxkIGZvciAxMDAgbXNcbiAgICBuZXcgRGF0ZSgpIC0gdGhpcy5kcmFnTW92ZVRpbWUgPiAxMDAgKSB7XG4gICAgcmV0dXJuIDA7XG4gIH1cblxuICB2YXIgZGlzdGFuY2UgPSB0aGlzLmdldFNsaWRlRGlzdGFuY2UoIC10aGlzLmRyYWdYLCB0aGlzLnNlbGVjdGVkSW5kZXggKTtcbiAgdmFyIGRlbHRhID0gdGhpcy5wcmV2aW91c0RyYWdYIC0gdGhpcy5kcmFnWDtcbiAgaWYgKCBkaXN0YW5jZSA+IDAgJiYgZGVsdGEgPiAwICkge1xuICAgIC8vIGJvb3N0IHRvIG5leHQgaWYgbW92aW5nIHRvd2FyZHMgdGhlIHJpZ2h0LCBhbmQgcG9zaXRpdmUgdmVsb2NpdHlcbiAgICByZXR1cm4gMTtcbiAgfSBlbHNlIGlmICggZGlzdGFuY2UgPCAwICYmIGRlbHRhIDwgMCApIHtcbiAgICAvLyBib29zdCB0byBwcmV2aW91cyBpZiBtb3ZpbmcgdG93YXJkcyB0aGUgbGVmdCwgYW5kIG5lZ2F0aXZlIHZlbG9jaXR5XG4gICAgcmV0dXJuIC0xO1xuICB9XG4gIHJldHVybiAwO1xufTtcblxuLy8gLS0tLS0gc3RhdGljQ2xpY2sgLS0tLS0gLy9cblxucHJvdG8uc3RhdGljQ2xpY2sgPSBmdW5jdGlvbiggZXZlbnQsIHBvaW50ZXIgKSB7XG4gIC8vIGdldCBjbGlja2VkQ2VsbCwgaWYgY2VsbCB3YXMgY2xpY2tlZFxuICB2YXIgY2xpY2tlZENlbGwgPSB0aGlzLmdldFBhcmVudENlbGwoIGV2ZW50LnRhcmdldCApO1xuICB2YXIgY2VsbEVsZW0gPSBjbGlja2VkQ2VsbCAmJiBjbGlja2VkQ2VsbC5lbGVtZW50O1xuICB2YXIgY2VsbEluZGV4ID0gY2xpY2tlZENlbGwgJiYgdGhpcy5jZWxscy5pbmRleE9mKCBjbGlja2VkQ2VsbCApO1xuICB0aGlzLmRpc3BhdGNoRXZlbnQoICdzdGF0aWNDbGljaycsIGV2ZW50LCBbIHBvaW50ZXIsIGNlbGxFbGVtLCBjZWxsSW5kZXggXSApO1xufTtcblxuLy8gLS0tLS0gc2Nyb2xsIC0tLS0tIC8vXG5cbnByb3RvLm9uc2Nyb2xsID0gZnVuY3Rpb24oKSB7XG4gIHZhciBzY3JvbGwgPSBnZXRTY3JvbGxQb3NpdGlvbigpO1xuICB2YXIgc2Nyb2xsTW92ZVggPSB0aGlzLnBvaW50ZXJEb3duU2Nyb2xsLnggLSBzY3JvbGwueDtcbiAgdmFyIHNjcm9sbE1vdmVZID0gdGhpcy5wb2ludGVyRG93blNjcm9sbC55IC0gc2Nyb2xsLnk7XG4gIC8vIGNhbmNlbCBjbGljay90YXAgaWYgc2Nyb2xsIGlzIHRvbyBtdWNoXG4gIGlmICggTWF0aC5hYnMoIHNjcm9sbE1vdmVYICkgPiAzIHx8IE1hdGguYWJzKCBzY3JvbGxNb3ZlWSApID4gMyApIHtcbiAgICB0aGlzLl9wb2ludGVyRG9uZSgpO1xuICB9XG59O1xuXG4vLyAtLS0tLSB1dGlscyAtLS0tLSAvL1xuXG5mdW5jdGlvbiBnZXRTY3JvbGxQb3NpdGlvbigpIHtcbiAgcmV0dXJuIHtcbiAgICB4OiB3aW5kb3cucGFnZVhPZmZzZXQsXG4gICAgeTogd2luZG93LnBhZ2VZT2Zmc2V0XG4gIH07XG59XG5cbi8vIC0tLS0tICAtLS0tLSAvL1xuXG5yZXR1cm4gRmxpY2tpdHk7XG5cbn0pKTtcbiIsIi8vIHByZXYvbmV4dCBidXR0b25zXG4oIGZ1bmN0aW9uKCB3aW5kb3csIGZhY3RvcnkgKSB7XG4gIC8vIHVuaXZlcnNhbCBtb2R1bGUgZGVmaW5pdGlvblxuICAvKiBqc2hpbnQgc3RyaWN0OiBmYWxzZSAqL1xuICBpZiAoIHR5cGVvZiBkZWZpbmUgPT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kICkge1xuICAgIC8vIEFNRFxuICAgIGRlZmluZSggW1xuICAgICAgJy4vZmxpY2tpdHknLFxuICAgICAgJ3VuaXBvaW50ZXIvdW5pcG9pbnRlcicsXG4gICAgICAnZml6enktdWktdXRpbHMvdXRpbHMnXG4gICAgXSwgZnVuY3Rpb24oIEZsaWNraXR5LCBVbmlwb2ludGVyLCB1dGlscyApIHtcbiAgICAgIHJldHVybiBmYWN0b3J5KCB3aW5kb3csIEZsaWNraXR5LCBVbmlwb2ludGVyLCB1dGlscyApO1xuICAgIH0pO1xuICB9IGVsc2UgaWYgKCB0eXBlb2YgbW9kdWxlID09ICdvYmplY3QnICYmIG1vZHVsZS5leHBvcnRzICkge1xuICAgIC8vIENvbW1vbkpTXG4gICAgbW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KFxuICAgICAgd2luZG93LFxuICAgICAgcmVxdWlyZSgnLi9mbGlja2l0eScpLFxuICAgICAgcmVxdWlyZSgndW5pcG9pbnRlcicpLFxuICAgICAgcmVxdWlyZSgnZml6enktdWktdXRpbHMnKVxuICAgICk7XG4gIH0gZWxzZSB7XG4gICAgLy8gYnJvd3NlciBnbG9iYWxcbiAgICBmYWN0b3J5KFxuICAgICAgd2luZG93LFxuICAgICAgd2luZG93LkZsaWNraXR5LFxuICAgICAgd2luZG93LlVuaXBvaW50ZXIsXG4gICAgICB3aW5kb3cuZml6enlVSVV0aWxzXG4gICAgKTtcbiAgfVxuXG59KCB3aW5kb3csIGZ1bmN0aW9uIGZhY3RvcnkoIHdpbmRvdywgRmxpY2tpdHksIFVuaXBvaW50ZXIsIHV0aWxzICkge1xuJ3VzZSBzdHJpY3QnO1xuXG52YXIgc3ZnVVJJID0gJ2h0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnJztcblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gUHJldk5leHRCdXR0b24gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gLy9cblxuZnVuY3Rpb24gUHJldk5leHRCdXR0b24oIGRpcmVjdGlvbiwgcGFyZW50ICkge1xuICB0aGlzLmRpcmVjdGlvbiA9IGRpcmVjdGlvbjtcbiAgdGhpcy5wYXJlbnQgPSBwYXJlbnQ7XG4gIHRoaXMuX2NyZWF0ZSgpO1xufVxuXG5QcmV2TmV4dEJ1dHRvbi5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKCBVbmlwb2ludGVyLnByb3RvdHlwZSApO1xuXG5QcmV2TmV4dEJ1dHRvbi5wcm90b3R5cGUuX2NyZWF0ZSA9IGZ1bmN0aW9uKCkge1xuICAvLyBwcm9wZXJ0aWVzXG4gIHRoaXMuaXNFbmFibGVkID0gdHJ1ZTtcbiAgdGhpcy5pc1ByZXZpb3VzID0gdGhpcy5kaXJlY3Rpb24gPT0gLTE7XG4gIHZhciBsZWZ0RGlyZWN0aW9uID0gdGhpcy5wYXJlbnQub3B0aW9ucy5yaWdodFRvTGVmdCA/IDEgOiAtMTtcbiAgdGhpcy5pc0xlZnQgPSB0aGlzLmRpcmVjdGlvbiA9PSBsZWZ0RGlyZWN0aW9uO1xuXG4gIHZhciBlbGVtZW50ID0gdGhpcy5lbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYnV0dG9uJyk7XG4gIGVsZW1lbnQuY2xhc3NOYW1lID0gJ2ZsaWNraXR5LWJ1dHRvbiBmbGlja2l0eS1wcmV2LW5leHQtYnV0dG9uJztcbiAgZWxlbWVudC5jbGFzc05hbWUgKz0gdGhpcy5pc1ByZXZpb3VzID8gJyBwcmV2aW91cycgOiAnIG5leHQnO1xuICAvLyBwcmV2ZW50IGJ1dHRvbiBmcm9tIHN1Ym1pdHRpbmcgZm9ybSBodHRwOi8vc3RhY2tvdmVyZmxvdy5jb20vYS8xMDgzNjA3Ni8xODIxODNcbiAgZWxlbWVudC5zZXRBdHRyaWJ1dGUoICd0eXBlJywgJ2J1dHRvbicgKTtcbiAgLy8gaW5pdCBhcyBkaXNhYmxlZFxuICB0aGlzLmRpc2FibGUoKTtcblxuICBlbGVtZW50LnNldEF0dHJpYnV0ZSggJ2FyaWEtbGFiZWwnLCB0aGlzLmlzUHJldmlvdXMgPyAnUHJldmlvdXMnIDogJ05leHQnICk7XG5cbiAgLy8gY3JlYXRlIGFycm93XG4gIHZhciBzdmcgPSB0aGlzLmNyZWF0ZVNWRygpO1xuICBlbGVtZW50LmFwcGVuZENoaWxkKCBzdmcgKTtcbiAgLy8gZXZlbnRzXG4gIHRoaXMucGFyZW50Lm9uKCAnc2VsZWN0JywgdGhpcy51cGRhdGUuYmluZCggdGhpcyApICk7XG4gIHRoaXMub24oICdwb2ludGVyRG93bicsIHRoaXMucGFyZW50LmNoaWxkVUlQb2ludGVyRG93bi5iaW5kKCB0aGlzLnBhcmVudCApICk7XG59O1xuXG5QcmV2TmV4dEJ1dHRvbi5wcm90b3R5cGUuYWN0aXZhdGUgPSBmdW5jdGlvbigpIHtcbiAgdGhpcy5iaW5kU3RhcnRFdmVudCggdGhpcy5lbGVtZW50ICk7XG4gIHRoaXMuZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCAnY2xpY2snLCB0aGlzICk7XG4gIC8vIGFkZCB0byBET01cbiAgdGhpcy5wYXJlbnQuZWxlbWVudC5hcHBlbmRDaGlsZCggdGhpcy5lbGVtZW50ICk7XG59O1xuXG5QcmV2TmV4dEJ1dHRvbi5wcm90b3R5cGUuZGVhY3RpdmF0ZSA9IGZ1bmN0aW9uKCkge1xuICAvLyByZW1vdmUgZnJvbSBET01cbiAgdGhpcy5wYXJlbnQuZWxlbWVudC5yZW1vdmVDaGlsZCggdGhpcy5lbGVtZW50ICk7XG4gIC8vIGNsaWNrIGV2ZW50c1xuICB0aGlzLnVuYmluZFN0YXJ0RXZlbnQoIHRoaXMuZWxlbWVudCApO1xuICB0aGlzLmVsZW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lciggJ2NsaWNrJywgdGhpcyApO1xufTtcblxuUHJldk5leHRCdXR0b24ucHJvdG90eXBlLmNyZWF0ZVNWRyA9IGZ1bmN0aW9uKCkge1xuICB2YXIgc3ZnID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKCBzdmdVUkksICdzdmcnKTtcbiAgc3ZnLnNldEF0dHJpYnV0ZSggJ2NsYXNzJywgJ2ZsaWNraXR5LWJ1dHRvbi1pY29uJyApO1xuICBzdmcuc2V0QXR0cmlidXRlKCAndmlld0JveCcsICcwIDAgMTAwIDEwMCcgKTtcbiAgdmFyIHBhdGggPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMoIHN2Z1VSSSwgJ3BhdGgnKTtcbiAgdmFyIHBhdGhNb3ZlbWVudHMgPSBnZXRBcnJvd01vdmVtZW50cyggdGhpcy5wYXJlbnQub3B0aW9ucy5hcnJvd1NoYXBlICk7XG4gIHBhdGguc2V0QXR0cmlidXRlKCAnZCcsIHBhdGhNb3ZlbWVudHMgKTtcbiAgcGF0aC5zZXRBdHRyaWJ1dGUoICdjbGFzcycsICdhcnJvdycgKTtcbiAgLy8gcm90YXRlIGFycm93XG4gIGlmICggIXRoaXMuaXNMZWZ0ICkge1xuICAgIHBhdGguc2V0QXR0cmlidXRlKCAndHJhbnNmb3JtJywgJ3RyYW5zbGF0ZSgxMDAsIDEwMCkgcm90YXRlKDE4MCkgJyApO1xuICB9XG4gIHN2Zy5hcHBlbmRDaGlsZCggcGF0aCApO1xuICByZXR1cm4gc3ZnO1xufTtcblxuLy8gZ2V0IFNWRyBwYXRoIG1vdm1lbWVudFxuZnVuY3Rpb24gZ2V0QXJyb3dNb3ZlbWVudHMoIHNoYXBlICkge1xuICAvLyB1c2Ugc2hhcGUgYXMgbW92ZW1lbnQgaWYgc3RyaW5nXG4gIGlmICggdHlwZW9mIHNoYXBlID09ICdzdHJpbmcnICkge1xuICAgIHJldHVybiBzaGFwZTtcbiAgfVxuICAvLyBjcmVhdGUgbW92ZW1lbnQgc3RyaW5nXG4gIHJldHVybiAnTSAnICsgc2hhcGUueDAgKyAnLDUwJyArXG4gICAgJyBMICcgKyBzaGFwZS54MSArICcsJyArICggc2hhcGUueTEgKyA1MCApICtcbiAgICAnIEwgJyArIHNoYXBlLngyICsgJywnICsgKCBzaGFwZS55MiArIDUwICkgK1xuICAgICcgTCAnICsgc2hhcGUueDMgKyAnLDUwICcgK1xuICAgICcgTCAnICsgc2hhcGUueDIgKyAnLCcgKyAoIDUwIC0gc2hhcGUueTIgKSArXG4gICAgJyBMICcgKyBzaGFwZS54MSArICcsJyArICggNTAgLSBzaGFwZS55MSApICtcbiAgICAnIFonO1xufVxuXG5QcmV2TmV4dEJ1dHRvbi5wcm90b3R5cGUuaGFuZGxlRXZlbnQgPSB1dGlscy5oYW5kbGVFdmVudDtcblxuUHJldk5leHRCdXR0b24ucHJvdG90eXBlLm9uY2xpY2sgPSBmdW5jdGlvbigpIHtcbiAgaWYgKCAhdGhpcy5pc0VuYWJsZWQgKSB7XG4gICAgcmV0dXJuO1xuICB9XG4gIHRoaXMucGFyZW50LnVpQ2hhbmdlKCk7XG4gIHZhciBtZXRob2QgPSB0aGlzLmlzUHJldmlvdXMgPyAncHJldmlvdXMnIDogJ25leHQnO1xuICB0aGlzLnBhcmVudFsgbWV0aG9kIF0oKTtcbn07XG5cbi8vIC0tLS0tICAtLS0tLSAvL1xuXG5QcmV2TmV4dEJ1dHRvbi5wcm90b3R5cGUuZW5hYmxlID0gZnVuY3Rpb24oKSB7XG4gIGlmICggdGhpcy5pc0VuYWJsZWQgKSB7XG4gICAgcmV0dXJuO1xuICB9XG4gIHRoaXMuZWxlbWVudC5kaXNhYmxlZCA9IGZhbHNlO1xuICB0aGlzLmlzRW5hYmxlZCA9IHRydWU7XG59O1xuXG5QcmV2TmV4dEJ1dHRvbi5wcm90b3R5cGUuZGlzYWJsZSA9IGZ1bmN0aW9uKCkge1xuICBpZiAoICF0aGlzLmlzRW5hYmxlZCApIHtcbiAgICByZXR1cm47XG4gIH1cbiAgdGhpcy5lbGVtZW50LmRpc2FibGVkID0gdHJ1ZTtcbiAgdGhpcy5pc0VuYWJsZWQgPSBmYWxzZTtcbn07XG5cblByZXZOZXh0QnV0dG9uLnByb3RvdHlwZS51cGRhdGUgPSBmdW5jdGlvbigpIHtcbiAgLy8gaW5kZXggb2YgZmlyc3Qgb3IgbGFzdCBzbGlkZSwgaWYgcHJldmlvdXMgb3IgbmV4dFxuICB2YXIgc2xpZGVzID0gdGhpcy5wYXJlbnQuc2xpZGVzO1xuICAvLyBlbmFibGUgaXMgd3JhcEFyb3VuZCBhbmQgYXQgbGVhc3QgMiBzbGlkZXNcbiAgaWYgKCB0aGlzLnBhcmVudC5vcHRpb25zLndyYXBBcm91bmQgJiYgc2xpZGVzLmxlbmd0aCA+IDEgKSB7XG4gICAgdGhpcy5lbmFibGUoKTtcbiAgICByZXR1cm47XG4gIH1cbiAgdmFyIGxhc3RJbmRleCA9IHNsaWRlcy5sZW5ndGggPyBzbGlkZXMubGVuZ3RoIC0gMSA6IDA7XG4gIHZhciBib3VuZEluZGV4ID0gdGhpcy5pc1ByZXZpb3VzID8gMCA6IGxhc3RJbmRleDtcbiAgdmFyIG1ldGhvZCA9IHRoaXMucGFyZW50LnNlbGVjdGVkSW5kZXggPT0gYm91bmRJbmRleCA/ICdkaXNhYmxlJyA6ICdlbmFibGUnO1xuICB0aGlzWyBtZXRob2QgXSgpO1xufTtcblxuUHJldk5leHRCdXR0b24ucHJvdG90eXBlLmRlc3Ryb3kgPSBmdW5jdGlvbigpIHtcbiAgdGhpcy5kZWFjdGl2YXRlKCk7XG4gIHRoaXMuYWxsT2ZmKCk7XG59O1xuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSBGbGlja2l0eSBwcm90b3R5cGUgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gLy9cblxudXRpbHMuZXh0ZW5kKCBGbGlja2l0eS5kZWZhdWx0cywge1xuICBwcmV2TmV4dEJ1dHRvbnM6IHRydWUsXG4gIGFycm93U2hhcGU6IHtcbiAgICB4MDogMTAsXG4gICAgeDE6IDYwLCB5MTogNTAsXG4gICAgeDI6IDcwLCB5MjogNDAsXG4gICAgeDM6IDMwXG4gIH1cbn0pO1xuXG5GbGlja2l0eS5jcmVhdGVNZXRob2RzLnB1c2goJ19jcmVhdGVQcmV2TmV4dEJ1dHRvbnMnKTtcbnZhciBwcm90byA9IEZsaWNraXR5LnByb3RvdHlwZTtcblxucHJvdG8uX2NyZWF0ZVByZXZOZXh0QnV0dG9ucyA9IGZ1bmN0aW9uKCkge1xuICBpZiAoICF0aGlzLm9wdGlvbnMucHJldk5leHRCdXR0b25zICkge1xuICAgIHJldHVybjtcbiAgfVxuXG4gIHRoaXMucHJldkJ1dHRvbiA9IG5ldyBQcmV2TmV4dEJ1dHRvbiggLTEsIHRoaXMgKTtcbiAgdGhpcy5uZXh0QnV0dG9uID0gbmV3IFByZXZOZXh0QnV0dG9uKCAxLCB0aGlzICk7XG5cbiAgdGhpcy5vbiggJ2FjdGl2YXRlJywgdGhpcy5hY3RpdmF0ZVByZXZOZXh0QnV0dG9ucyApO1xufTtcblxucHJvdG8uYWN0aXZhdGVQcmV2TmV4dEJ1dHRvbnMgPSBmdW5jdGlvbigpIHtcbiAgdGhpcy5wcmV2QnV0dG9uLmFjdGl2YXRlKCk7XG4gIHRoaXMubmV4dEJ1dHRvbi5hY3RpdmF0ZSgpO1xuICB0aGlzLm9uKCAnZGVhY3RpdmF0ZScsIHRoaXMuZGVhY3RpdmF0ZVByZXZOZXh0QnV0dG9ucyApO1xufTtcblxucHJvdG8uZGVhY3RpdmF0ZVByZXZOZXh0QnV0dG9ucyA9IGZ1bmN0aW9uKCkge1xuICB0aGlzLnByZXZCdXR0b24uZGVhY3RpdmF0ZSgpO1xuICB0aGlzLm5leHRCdXR0b24uZGVhY3RpdmF0ZSgpO1xuICB0aGlzLm9mZiggJ2RlYWN0aXZhdGUnLCB0aGlzLmRlYWN0aXZhdGVQcmV2TmV4dEJ1dHRvbnMgKTtcbn07XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tICAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSAvL1xuXG5GbGlja2l0eS5QcmV2TmV4dEJ1dHRvbiA9IFByZXZOZXh0QnV0dG9uO1xuXG5yZXR1cm4gRmxpY2tpdHk7XG5cbn0pKTtcbiIsIi8vIHBhZ2UgZG90c1xuKCBmdW5jdGlvbiggd2luZG93LCBmYWN0b3J5ICkge1xuICAvLyB1bml2ZXJzYWwgbW9kdWxlIGRlZmluaXRpb25cbiAgLyoganNoaW50IHN0cmljdDogZmFsc2UgKi9cbiAgaWYgKCB0eXBlb2YgZGVmaW5lID09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCApIHtcbiAgICAvLyBBTURcbiAgICBkZWZpbmUoIFtcbiAgICAgICcuL2ZsaWNraXR5JyxcbiAgICAgICd1bmlwb2ludGVyL3VuaXBvaW50ZXInLFxuICAgICAgJ2Zpenp5LXVpLXV0aWxzL3V0aWxzJ1xuICAgIF0sIGZ1bmN0aW9uKCBGbGlja2l0eSwgVW5pcG9pbnRlciwgdXRpbHMgKSB7XG4gICAgICByZXR1cm4gZmFjdG9yeSggd2luZG93LCBGbGlja2l0eSwgVW5pcG9pbnRlciwgdXRpbHMgKTtcbiAgICB9KTtcbiAgfSBlbHNlIGlmICggdHlwZW9mIG1vZHVsZSA9PSAnb2JqZWN0JyAmJiBtb2R1bGUuZXhwb3J0cyApIHtcbiAgICAvLyBDb21tb25KU1xuICAgIG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeShcbiAgICAgIHdpbmRvdyxcbiAgICAgIHJlcXVpcmUoJy4vZmxpY2tpdHknKSxcbiAgICAgIHJlcXVpcmUoJ3VuaXBvaW50ZXInKSxcbiAgICAgIHJlcXVpcmUoJ2Zpenp5LXVpLXV0aWxzJylcbiAgICApO1xuICB9IGVsc2Uge1xuICAgIC8vIGJyb3dzZXIgZ2xvYmFsXG4gICAgZmFjdG9yeShcbiAgICAgIHdpbmRvdyxcbiAgICAgIHdpbmRvdy5GbGlja2l0eSxcbiAgICAgIHdpbmRvdy5Vbmlwb2ludGVyLFxuICAgICAgd2luZG93LmZpenp5VUlVdGlsc1xuICAgICk7XG4gIH1cblxufSggd2luZG93LCBmdW5jdGlvbiBmYWN0b3J5KCB3aW5kb3csIEZsaWNraXR5LCBVbmlwb2ludGVyLCB1dGlscyApIHtcblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gUGFnZURvdHMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gLy9cblxuJ3VzZSBzdHJpY3QnO1xuXG5mdW5jdGlvbiBQYWdlRG90cyggcGFyZW50ICkge1xuICB0aGlzLnBhcmVudCA9IHBhcmVudDtcbiAgdGhpcy5fY3JlYXRlKCk7XG59XG5cblBhZ2VEb3RzLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoIFVuaXBvaW50ZXIucHJvdG90eXBlICk7XG5cblBhZ2VEb3RzLnByb3RvdHlwZS5fY3JlYXRlID0gZnVuY3Rpb24oKSB7XG4gIC8vIGNyZWF0ZSBob2xkZXIgZWxlbWVudFxuICB0aGlzLmhvbGRlciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ29sJyk7XG4gIHRoaXMuaG9sZGVyLmNsYXNzTmFtZSA9ICdmbGlja2l0eS1wYWdlLWRvdHMnO1xuICAvLyBjcmVhdGUgZG90cywgYXJyYXkgb2YgZWxlbWVudHNcbiAgdGhpcy5kb3RzID0gW107XG4gIC8vIGV2ZW50c1xuICB0aGlzLmhhbmRsZUNsaWNrID0gdGhpcy5vbkNsaWNrLmJpbmQoIHRoaXMgKTtcbiAgdGhpcy5vbiggJ3BvaW50ZXJEb3duJywgdGhpcy5wYXJlbnQuY2hpbGRVSVBvaW50ZXJEb3duLmJpbmQoIHRoaXMucGFyZW50ICkgKTtcbn07XG5cblBhZ2VEb3RzLnByb3RvdHlwZS5hY3RpdmF0ZSA9IGZ1bmN0aW9uKCkge1xuICB0aGlzLnNldERvdHMoKTtcbiAgdGhpcy5ob2xkZXIuYWRkRXZlbnRMaXN0ZW5lciggJ2NsaWNrJywgdGhpcy5oYW5kbGVDbGljayApO1xuICB0aGlzLmJpbmRTdGFydEV2ZW50KCB0aGlzLmhvbGRlciApO1xuICAvLyBhZGQgdG8gRE9NXG4gIHRoaXMucGFyZW50LmVsZW1lbnQuYXBwZW5kQ2hpbGQoIHRoaXMuaG9sZGVyICk7XG59O1xuXG5QYWdlRG90cy5wcm90b3R5cGUuZGVhY3RpdmF0ZSA9IGZ1bmN0aW9uKCkge1xuICB0aGlzLmhvbGRlci5yZW1vdmVFdmVudExpc3RlbmVyKCAnY2xpY2snLCB0aGlzLmhhbmRsZUNsaWNrICk7XG4gIHRoaXMudW5iaW5kU3RhcnRFdmVudCggdGhpcy5ob2xkZXIgKTtcbiAgLy8gcmVtb3ZlIGZyb20gRE9NXG4gIHRoaXMucGFyZW50LmVsZW1lbnQucmVtb3ZlQ2hpbGQoIHRoaXMuaG9sZGVyICk7XG59O1xuXG5QYWdlRG90cy5wcm90b3R5cGUuc2V0RG90cyA9IGZ1bmN0aW9uKCkge1xuICAvLyBnZXQgZGlmZmVyZW5jZSBiZXR3ZWVuIG51bWJlciBvZiBzbGlkZXMgYW5kIG51bWJlciBvZiBkb3RzXG4gIHZhciBkZWx0YSA9IHRoaXMucGFyZW50LnNsaWRlcy5sZW5ndGggLSB0aGlzLmRvdHMubGVuZ3RoO1xuICBpZiAoIGRlbHRhID4gMCApIHtcbiAgICB0aGlzLmFkZERvdHMoIGRlbHRhICk7XG4gIH0gZWxzZSBpZiAoIGRlbHRhIDwgMCApIHtcbiAgICB0aGlzLnJlbW92ZURvdHMoIC1kZWx0YSApO1xuICB9XG59O1xuXG5QYWdlRG90cy5wcm90b3R5cGUuYWRkRG90cyA9IGZ1bmN0aW9uKCBjb3VudCApIHtcbiAgdmFyIGZyYWdtZW50ID0gZG9jdW1lbnQuY3JlYXRlRG9jdW1lbnRGcmFnbWVudCgpO1xuICB2YXIgbmV3RG90cyA9IFtdO1xuICB2YXIgbGVuZ3RoID0gdGhpcy5kb3RzLmxlbmd0aDtcbiAgdmFyIG1heCA9IGxlbmd0aCArIGNvdW50O1xuXG4gIGZvciAoIHZhciBpID0gbGVuZ3RoOyBpIDwgbWF4OyBpKysgKSB7XG4gICAgdmFyIGRvdCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2xpJyk7XG4gICAgZG90LmNsYXNzTmFtZSA9ICdkb3QnO1xuICAgIGRvdC5zZXRBdHRyaWJ1dGUoICdhcmlhLWxhYmVsJywgJ1BhZ2UgZG90ICcgKyAoIGkgKyAxICkgKTtcbiAgICBmcmFnbWVudC5hcHBlbmRDaGlsZCggZG90ICk7XG4gICAgbmV3RG90cy5wdXNoKCBkb3QgKTtcbiAgfVxuXG4gIHRoaXMuaG9sZGVyLmFwcGVuZENoaWxkKCBmcmFnbWVudCApO1xuICB0aGlzLmRvdHMgPSB0aGlzLmRvdHMuY29uY2F0KCBuZXdEb3RzICk7XG59O1xuXG5QYWdlRG90cy5wcm90b3R5cGUucmVtb3ZlRG90cyA9IGZ1bmN0aW9uKCBjb3VudCApIHtcbiAgLy8gcmVtb3ZlIGZyb20gdGhpcy5kb3RzIGNvbGxlY3Rpb25cbiAgdmFyIHJlbW92ZURvdHMgPSB0aGlzLmRvdHMuc3BsaWNlKCB0aGlzLmRvdHMubGVuZ3RoIC0gY291bnQsIGNvdW50ICk7XG4gIC8vIHJlbW92ZSBmcm9tIERPTVxuICByZW1vdmVEb3RzLmZvckVhY2goIGZ1bmN0aW9uKCBkb3QgKSB7XG4gICAgdGhpcy5ob2xkZXIucmVtb3ZlQ2hpbGQoIGRvdCApO1xuICB9LCB0aGlzICk7XG59O1xuXG5QYWdlRG90cy5wcm90b3R5cGUudXBkYXRlU2VsZWN0ZWQgPSBmdW5jdGlvbigpIHtcbiAgLy8gcmVtb3ZlIHNlbGVjdGVkIGNsYXNzIG9uIHByZXZpb3VzXG4gIGlmICggdGhpcy5zZWxlY3RlZERvdCApIHtcbiAgICB0aGlzLnNlbGVjdGVkRG90LmNsYXNzTmFtZSA9ICdkb3QnO1xuICAgIHRoaXMuc2VsZWN0ZWREb3QucmVtb3ZlQXR0cmlidXRlKCdhcmlhLWN1cnJlbnQnKTtcbiAgfVxuICAvLyBkb24ndCBwcm9jZWVkIGlmIG5vIGRvdHNcbiAgaWYgKCAhdGhpcy5kb3RzLmxlbmd0aCApIHtcbiAgICByZXR1cm47XG4gIH1cbiAgdGhpcy5zZWxlY3RlZERvdCA9IHRoaXMuZG90c1sgdGhpcy5wYXJlbnQuc2VsZWN0ZWRJbmRleCBdO1xuICB0aGlzLnNlbGVjdGVkRG90LmNsYXNzTmFtZSA9ICdkb3QgaXMtc2VsZWN0ZWQnO1xuICB0aGlzLnNlbGVjdGVkRG90LnNldEF0dHJpYnV0ZSggJ2FyaWEtY3VycmVudCcsICdzdGVwJyApO1xufTtcblxuUGFnZURvdHMucHJvdG90eXBlLm9uVGFwID0gLy8gb2xkIG1ldGhvZCBuYW1lLCBiYWNrd2FyZHMtY29tcGF0aWJsZVxuUGFnZURvdHMucHJvdG90eXBlLm9uQ2xpY2sgPSBmdW5jdGlvbiggZXZlbnQgKSB7XG4gIHZhciB0YXJnZXQgPSBldmVudC50YXJnZXQ7XG4gIC8vIG9ubHkgY2FyZSBhYm91dCBkb3QgY2xpY2tzXG4gIGlmICggdGFyZ2V0Lm5vZGVOYW1lICE9ICdMSScgKSB7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgdGhpcy5wYXJlbnQudWlDaGFuZ2UoKTtcbiAgdmFyIGluZGV4ID0gdGhpcy5kb3RzLmluZGV4T2YoIHRhcmdldCApO1xuICB0aGlzLnBhcmVudC5zZWxlY3QoIGluZGV4ICk7XG59O1xuXG5QYWdlRG90cy5wcm90b3R5cGUuZGVzdHJveSA9IGZ1bmN0aW9uKCkge1xuICB0aGlzLmRlYWN0aXZhdGUoKTtcbiAgdGhpcy5hbGxPZmYoKTtcbn07XG5cbkZsaWNraXR5LlBhZ2VEb3RzID0gUGFnZURvdHM7XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIEZsaWNraXR5IC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIC8vXG5cbnV0aWxzLmV4dGVuZCggRmxpY2tpdHkuZGVmYXVsdHMsIHtcbiAgcGFnZURvdHM6IHRydWVcbn0pO1xuXG5GbGlja2l0eS5jcmVhdGVNZXRob2RzLnB1c2goJ19jcmVhdGVQYWdlRG90cycpO1xuXG52YXIgcHJvdG8gPSBGbGlja2l0eS5wcm90b3R5cGU7XG5cbnByb3RvLl9jcmVhdGVQYWdlRG90cyA9IGZ1bmN0aW9uKCkge1xuICBpZiAoICF0aGlzLm9wdGlvbnMucGFnZURvdHMgKSB7XG4gICAgcmV0dXJuO1xuICB9XG4gIHRoaXMucGFnZURvdHMgPSBuZXcgUGFnZURvdHMoIHRoaXMgKTtcbiAgLy8gZXZlbnRzXG4gIHRoaXMub24oICdhY3RpdmF0ZScsIHRoaXMuYWN0aXZhdGVQYWdlRG90cyApO1xuICB0aGlzLm9uKCAnc2VsZWN0JywgdGhpcy51cGRhdGVTZWxlY3RlZFBhZ2VEb3RzICk7XG4gIHRoaXMub24oICdjZWxsQ2hhbmdlJywgdGhpcy51cGRhdGVQYWdlRG90cyApO1xuICB0aGlzLm9uKCAncmVzaXplJywgdGhpcy51cGRhdGVQYWdlRG90cyApO1xuICB0aGlzLm9uKCAnZGVhY3RpdmF0ZScsIHRoaXMuZGVhY3RpdmF0ZVBhZ2VEb3RzICk7XG59O1xuXG5wcm90by5hY3RpdmF0ZVBhZ2VEb3RzID0gZnVuY3Rpb24oKSB7XG4gIHRoaXMucGFnZURvdHMuYWN0aXZhdGUoKTtcbn07XG5cbnByb3RvLnVwZGF0ZVNlbGVjdGVkUGFnZURvdHMgPSBmdW5jdGlvbigpIHtcbiAgdGhpcy5wYWdlRG90cy51cGRhdGVTZWxlY3RlZCgpO1xufTtcblxucHJvdG8udXBkYXRlUGFnZURvdHMgPSBmdW5jdGlvbigpIHtcbiAgdGhpcy5wYWdlRG90cy5zZXREb3RzKCk7XG59O1xuXG5wcm90by5kZWFjdGl2YXRlUGFnZURvdHMgPSBmdW5jdGlvbigpIHtcbiAgdGhpcy5wYWdlRG90cy5kZWFjdGl2YXRlKCk7XG59O1xuXG4vLyAtLS0tLSAgLS0tLS0gLy9cblxuRmxpY2tpdHkuUGFnZURvdHMgPSBQYWdlRG90cztcblxucmV0dXJuIEZsaWNraXR5O1xuXG59KSk7XG4iLCIvLyBwbGF5ZXIgJiBhdXRvUGxheVxuKCBmdW5jdGlvbiggd2luZG93LCBmYWN0b3J5ICkge1xuICAvLyB1bml2ZXJzYWwgbW9kdWxlIGRlZmluaXRpb25cbiAgLyoganNoaW50IHN0cmljdDogZmFsc2UgKi9cbiAgaWYgKCB0eXBlb2YgZGVmaW5lID09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCApIHtcbiAgICAvLyBBTURcbiAgICBkZWZpbmUoIFtcbiAgICAgICdldi1lbWl0dGVyL2V2LWVtaXR0ZXInLFxuICAgICAgJ2Zpenp5LXVpLXV0aWxzL3V0aWxzJyxcbiAgICAgICcuL2ZsaWNraXR5J1xuICAgIF0sIGZ1bmN0aW9uKCBFdkVtaXR0ZXIsIHV0aWxzLCBGbGlja2l0eSApIHtcbiAgICAgIHJldHVybiBmYWN0b3J5KCBFdkVtaXR0ZXIsIHV0aWxzLCBGbGlja2l0eSApO1xuICAgIH0pO1xuICB9IGVsc2UgaWYgKCB0eXBlb2YgbW9kdWxlID09ICdvYmplY3QnICYmIG1vZHVsZS5leHBvcnRzICkge1xuICAgIC8vIENvbW1vbkpTXG4gICAgbW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KFxuICAgICAgcmVxdWlyZSgnZXYtZW1pdHRlcicpLFxuICAgICAgcmVxdWlyZSgnZml6enktdWktdXRpbHMnKSxcbiAgICAgIHJlcXVpcmUoJy4vZmxpY2tpdHknKVxuICAgICk7XG4gIH0gZWxzZSB7XG4gICAgLy8gYnJvd3NlciBnbG9iYWxcbiAgICBmYWN0b3J5KFxuICAgICAgd2luZG93LkV2RW1pdHRlcixcbiAgICAgIHdpbmRvdy5maXp6eVVJVXRpbHMsXG4gICAgICB3aW5kb3cuRmxpY2tpdHlcbiAgICApO1xuICB9XG5cbn0oIHdpbmRvdywgZnVuY3Rpb24gZmFjdG9yeSggRXZFbWl0dGVyLCB1dGlscywgRmxpY2tpdHkgKSB7XG5cbid1c2Ugc3RyaWN0JztcblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gUGxheWVyIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIC8vXG5cbmZ1bmN0aW9uIFBsYXllciggcGFyZW50ICkge1xuICB0aGlzLnBhcmVudCA9IHBhcmVudDtcbiAgdGhpcy5zdGF0ZSA9ICdzdG9wcGVkJztcbiAgLy8gdmlzaWJpbGl0eSBjaGFuZ2UgZXZlbnQgaGFuZGxlclxuICB0aGlzLm9uVmlzaWJpbGl0eUNoYW5nZSA9IHRoaXMudmlzaWJpbGl0eUNoYW5nZS5iaW5kKCB0aGlzICk7XG4gIHRoaXMub25WaXNpYmlsaXR5UGxheSA9IHRoaXMudmlzaWJpbGl0eVBsYXkuYmluZCggdGhpcyApO1xufVxuXG5QbGF5ZXIucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZSggRXZFbWl0dGVyLnByb3RvdHlwZSApO1xuXG4vLyBzdGFydCBwbGF5XG5QbGF5ZXIucHJvdG90eXBlLnBsYXkgPSBmdW5jdGlvbigpIHtcbiAgaWYgKCB0aGlzLnN0YXRlID09ICdwbGF5aW5nJyApIHtcbiAgICByZXR1cm47XG4gIH1cbiAgLy8gZG8gbm90IHBsYXkgaWYgcGFnZSBpcyBoaWRkZW4sIHN0YXJ0IHBsYXlpbmcgd2hlbiBwYWdlIGlzIHZpc2libGVcbiAgdmFyIGlzUGFnZUhpZGRlbiA9IGRvY3VtZW50LmhpZGRlbjtcbiAgaWYgKCBpc1BhZ2VIaWRkZW4gKSB7XG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lciggJ3Zpc2liaWxpdHljaGFuZ2UnLCB0aGlzLm9uVmlzaWJpbGl0eVBsYXkgKTtcbiAgICByZXR1cm47XG4gIH1cblxuICB0aGlzLnN0YXRlID0gJ3BsYXlpbmcnO1xuICAvLyBsaXN0ZW4gdG8gdmlzaWJpbGl0eSBjaGFuZ2VcbiAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lciggJ3Zpc2liaWxpdHljaGFuZ2UnLCB0aGlzLm9uVmlzaWJpbGl0eUNoYW5nZSApO1xuICAvLyBzdGFydCB0aWNraW5nXG4gIHRoaXMudGljaygpO1xufTtcblxuUGxheWVyLnByb3RvdHlwZS50aWNrID0gZnVuY3Rpb24oKSB7XG4gIC8vIGRvIG5vdCB0aWNrIGlmIG5vdCBwbGF5aW5nXG4gIGlmICggdGhpcy5zdGF0ZSAhPSAncGxheWluZycgKSB7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgdmFyIHRpbWUgPSB0aGlzLnBhcmVudC5vcHRpb25zLmF1dG9QbGF5O1xuICAvLyBkZWZhdWx0IHRvIDMgc2Vjb25kc1xuICB0aW1lID0gdHlwZW9mIHRpbWUgPT0gJ251bWJlcicgPyB0aW1lIDogMzAwMDtcbiAgdmFyIF90aGlzID0gdGhpcztcbiAgLy8gSEFDSzogcmVzZXQgdGlja3MgaWYgc3RvcHBlZCBhbmQgc3RhcnRlZCB3aXRoaW4gaW50ZXJ2YWxcbiAgdGhpcy5jbGVhcigpO1xuICB0aGlzLnRpbWVvdXQgPSBzZXRUaW1lb3V0KCBmdW5jdGlvbigpIHtcbiAgICBfdGhpcy5wYXJlbnQubmV4dCggdHJ1ZSApO1xuICAgIF90aGlzLnRpY2soKTtcbiAgfSwgdGltZSApO1xufTtcblxuUGxheWVyLnByb3RvdHlwZS5zdG9wID0gZnVuY3Rpb24oKSB7XG4gIHRoaXMuc3RhdGUgPSAnc3RvcHBlZCc7XG4gIHRoaXMuY2xlYXIoKTtcbiAgLy8gcmVtb3ZlIHZpc2liaWxpdHkgY2hhbmdlIGV2ZW50XG4gIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoICd2aXNpYmlsaXR5Y2hhbmdlJywgdGhpcy5vblZpc2liaWxpdHlDaGFuZ2UgKTtcbn07XG5cblBsYXllci5wcm90b3R5cGUuY2xlYXIgPSBmdW5jdGlvbigpIHtcbiAgY2xlYXJUaW1lb3V0KCB0aGlzLnRpbWVvdXQgKTtcbn07XG5cblBsYXllci5wcm90b3R5cGUucGF1c2UgPSBmdW5jdGlvbigpIHtcbiAgaWYgKCB0aGlzLnN0YXRlID09ICdwbGF5aW5nJyApIHtcbiAgICB0aGlzLnN0YXRlID0gJ3BhdXNlZCc7XG4gICAgdGhpcy5jbGVhcigpO1xuICB9XG59O1xuXG5QbGF5ZXIucHJvdG90eXBlLnVucGF1c2UgPSBmdW5jdGlvbigpIHtcbiAgLy8gcmUtc3RhcnQgcGxheSBpZiBwYXVzZWRcbiAgaWYgKCB0aGlzLnN0YXRlID09ICdwYXVzZWQnICkge1xuICAgIHRoaXMucGxheSgpO1xuICB9XG59O1xuXG4vLyBwYXVzZSBpZiBwYWdlIHZpc2liaWxpdHkgaXMgaGlkZGVuLCB1bnBhdXNlIGlmIHZpc2libGVcblBsYXllci5wcm90b3R5cGUudmlzaWJpbGl0eUNoYW5nZSA9IGZ1bmN0aW9uKCkge1xuICB2YXIgaXNQYWdlSGlkZGVuID0gZG9jdW1lbnQuaGlkZGVuO1xuICB0aGlzWyBpc1BhZ2VIaWRkZW4gPyAncGF1c2UnIDogJ3VucGF1c2UnIF0oKTtcbn07XG5cblBsYXllci5wcm90b3R5cGUudmlzaWJpbGl0eVBsYXkgPSBmdW5jdGlvbigpIHtcbiAgdGhpcy5wbGF5KCk7XG4gIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoICd2aXNpYmlsaXR5Y2hhbmdlJywgdGhpcy5vblZpc2liaWxpdHlQbGF5ICk7XG59O1xuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSBGbGlja2l0eSAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSAvL1xuXG51dGlscy5leHRlbmQoIEZsaWNraXR5LmRlZmF1bHRzLCB7XG4gIHBhdXNlQXV0b1BsYXlPbkhvdmVyOiB0cnVlXG59KTtcblxuRmxpY2tpdHkuY3JlYXRlTWV0aG9kcy5wdXNoKCdfY3JlYXRlUGxheWVyJyk7XG52YXIgcHJvdG8gPSBGbGlja2l0eS5wcm90b3R5cGU7XG5cbnByb3RvLl9jcmVhdGVQbGF5ZXIgPSBmdW5jdGlvbigpIHtcbiAgdGhpcy5wbGF5ZXIgPSBuZXcgUGxheWVyKCB0aGlzICk7XG5cbiAgdGhpcy5vbiggJ2FjdGl2YXRlJywgdGhpcy5hY3RpdmF0ZVBsYXllciApO1xuICB0aGlzLm9uKCAndWlDaGFuZ2UnLCB0aGlzLnN0b3BQbGF5ZXIgKTtcbiAgdGhpcy5vbiggJ3BvaW50ZXJEb3duJywgdGhpcy5zdG9wUGxheWVyICk7XG4gIHRoaXMub24oICdkZWFjdGl2YXRlJywgdGhpcy5kZWFjdGl2YXRlUGxheWVyICk7XG59O1xuXG5wcm90by5hY3RpdmF0ZVBsYXllciA9IGZ1bmN0aW9uKCkge1xuICBpZiAoICF0aGlzLm9wdGlvbnMuYXV0b1BsYXkgKSB7XG4gICAgcmV0dXJuO1xuICB9XG4gIHRoaXMucGxheWVyLnBsYXkoKTtcbiAgdGhpcy5lbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoICdtb3VzZWVudGVyJywgdGhpcyApO1xufTtcblxuLy8gUGxheWVyIEFQSSwgZG9uJ3QgaGF0ZSB0aGUgLi4uIHRoYW5rcyBJIGtub3cgd2hlcmUgdGhlIGRvb3IgaXNcblxucHJvdG8ucGxheVBsYXllciA9IGZ1bmN0aW9uKCkge1xuICB0aGlzLnBsYXllci5wbGF5KCk7XG59O1xuXG5wcm90by5zdG9wUGxheWVyID0gZnVuY3Rpb24oKSB7XG4gIHRoaXMucGxheWVyLnN0b3AoKTtcbn07XG5cbnByb3RvLnBhdXNlUGxheWVyID0gZnVuY3Rpb24oKSB7XG4gIHRoaXMucGxheWVyLnBhdXNlKCk7XG59O1xuXG5wcm90by51bnBhdXNlUGxheWVyID0gZnVuY3Rpb24oKSB7XG4gIHRoaXMucGxheWVyLnVucGF1c2UoKTtcbn07XG5cbnByb3RvLmRlYWN0aXZhdGVQbGF5ZXIgPSBmdW5jdGlvbigpIHtcbiAgdGhpcy5wbGF5ZXIuc3RvcCgpO1xuICB0aGlzLmVsZW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lciggJ21vdXNlZW50ZXInLCB0aGlzICk7XG59O1xuXG4vLyAtLS0tLSBtb3VzZWVudGVyL2xlYXZlIC0tLS0tIC8vXG5cbi8vIHBhdXNlIGF1dG8tcGxheSBvbiBob3ZlclxucHJvdG8ub25tb3VzZWVudGVyID0gZnVuY3Rpb24oKSB7XG4gIGlmICggIXRoaXMub3B0aW9ucy5wYXVzZUF1dG9QbGF5T25Ib3ZlciApIHtcbiAgICByZXR1cm47XG4gIH1cbiAgdGhpcy5wbGF5ZXIucGF1c2UoKTtcbiAgdGhpcy5lbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoICdtb3VzZWxlYXZlJywgdGhpcyApO1xufTtcblxuLy8gcmVzdW1lIGF1dG8tcGxheSBvbiBob3ZlciBvZmZcbnByb3RvLm9ubW91c2VsZWF2ZSA9IGZ1bmN0aW9uKCkge1xuICB0aGlzLnBsYXllci51bnBhdXNlKCk7XG4gIHRoaXMuZWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCAnbW91c2VsZWF2ZScsIHRoaXMgKTtcbn07XG5cbi8vIC0tLS0tICAtLS0tLSAvL1xuXG5GbGlja2l0eS5QbGF5ZXIgPSBQbGF5ZXI7XG5cbnJldHVybiBGbGlja2l0eTtcblxufSkpO1xuIiwiLy8gYWRkLCByZW1vdmUgY2VsbFxuKCBmdW5jdGlvbiggd2luZG93LCBmYWN0b3J5ICkge1xuICAvLyB1bml2ZXJzYWwgbW9kdWxlIGRlZmluaXRpb25cbiAgLyoganNoaW50IHN0cmljdDogZmFsc2UgKi9cbiAgaWYgKCB0eXBlb2YgZGVmaW5lID09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCApIHtcbiAgICAvLyBBTURcbiAgICBkZWZpbmUoIFtcbiAgICAgICcuL2ZsaWNraXR5JyxcbiAgICAgICdmaXp6eS11aS11dGlscy91dGlscydcbiAgICBdLCBmdW5jdGlvbiggRmxpY2tpdHksIHV0aWxzICkge1xuICAgICAgcmV0dXJuIGZhY3RvcnkoIHdpbmRvdywgRmxpY2tpdHksIHV0aWxzICk7XG4gICAgfSk7XG4gIH0gZWxzZSBpZiAoIHR5cGVvZiBtb2R1bGUgPT0gJ29iamVjdCcgJiYgbW9kdWxlLmV4cG9ydHMgKSB7XG4gICAgLy8gQ29tbW9uSlNcbiAgICBtb2R1bGUuZXhwb3J0cyA9IGZhY3RvcnkoXG4gICAgICB3aW5kb3csXG4gICAgICByZXF1aXJlKCcuL2ZsaWNraXR5JyksXG4gICAgICByZXF1aXJlKCdmaXp6eS11aS11dGlscycpXG4gICAgKTtcbiAgfSBlbHNlIHtcbiAgICAvLyBicm93c2VyIGdsb2JhbFxuICAgIGZhY3RvcnkoXG4gICAgICB3aW5kb3csXG4gICAgICB3aW5kb3cuRmxpY2tpdHksXG4gICAgICB3aW5kb3cuZml6enlVSVV0aWxzXG4gICAgKTtcbiAgfVxuXG59KCB3aW5kb3csIGZ1bmN0aW9uIGZhY3RvcnkoIHdpbmRvdywgRmxpY2tpdHksIHV0aWxzICkge1xuXG4ndXNlIHN0cmljdCc7XG5cbi8vIGFwcGVuZCBjZWxscyB0byBhIGRvY3VtZW50IGZyYWdtZW50XG5mdW5jdGlvbiBnZXRDZWxsc0ZyYWdtZW50KCBjZWxscyApIHtcbiAgdmFyIGZyYWdtZW50ID0gZG9jdW1lbnQuY3JlYXRlRG9jdW1lbnRGcmFnbWVudCgpO1xuICBjZWxscy5mb3JFYWNoKCBmdW5jdGlvbiggY2VsbCApIHtcbiAgICBmcmFnbWVudC5hcHBlbmRDaGlsZCggY2VsbC5lbGVtZW50ICk7XG4gIH0pO1xuICByZXR1cm4gZnJhZ21lbnQ7XG59XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIGFkZC9yZW1vdmUgY2VsbCBwcm90b3R5cGUgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gLy9cblxudmFyIHByb3RvID0gRmxpY2tpdHkucHJvdG90eXBlO1xuXG4vKipcbiAqIEluc2VydCwgcHJlcGVuZCwgb3IgYXBwZW5kIGNlbGxzXG4gKiBAcGFyYW0ge0VsZW1lbnQsIEFycmF5LCBOb2RlTGlzdH0gZWxlbXNcbiAqIEBwYXJhbSB7SW50ZWdlcn0gaW5kZXhcbiAqL1xucHJvdG8uaW5zZXJ0ID0gZnVuY3Rpb24oIGVsZW1zLCBpbmRleCApIHtcbiAgdmFyIGNlbGxzID0gdGhpcy5fbWFrZUNlbGxzKCBlbGVtcyApO1xuICBpZiAoICFjZWxscyB8fCAhY2VsbHMubGVuZ3RoICkge1xuICAgIHJldHVybjtcbiAgfVxuICB2YXIgbGVuID0gdGhpcy5jZWxscy5sZW5ndGg7XG4gIC8vIGRlZmF1bHQgdG8gYXBwZW5kXG4gIGluZGV4ID0gaW5kZXggPT09IHVuZGVmaW5lZCA/IGxlbiA6IGluZGV4O1xuICAvLyBhZGQgY2VsbHMgd2l0aCBkb2N1bWVudCBmcmFnbWVudFxuICB2YXIgZnJhZ21lbnQgPSBnZXRDZWxsc0ZyYWdtZW50KCBjZWxscyApO1xuICAvLyBhcHBlbmQgdG8gc2xpZGVyXG4gIHZhciBpc0FwcGVuZCA9IGluZGV4ID09IGxlbjtcbiAgaWYgKCBpc0FwcGVuZCApIHtcbiAgICB0aGlzLnNsaWRlci5hcHBlbmRDaGlsZCggZnJhZ21lbnQgKTtcbiAgfSBlbHNlIHtcbiAgICB2YXIgaW5zZXJ0Q2VsbEVsZW1lbnQgPSB0aGlzLmNlbGxzWyBpbmRleCBdLmVsZW1lbnQ7XG4gICAgdGhpcy5zbGlkZXIuaW5zZXJ0QmVmb3JlKCBmcmFnbWVudCwgaW5zZXJ0Q2VsbEVsZW1lbnQgKTtcbiAgfVxuICAvLyBhZGQgdG8gdGhpcy5jZWxsc1xuICBpZiAoIGluZGV4ID09PSAwICkge1xuICAgIC8vIHByZXBlbmQsIGFkZCB0byBzdGFydFxuICAgIHRoaXMuY2VsbHMgPSBjZWxscy5jb25jYXQoIHRoaXMuY2VsbHMgKTtcbiAgfSBlbHNlIGlmICggaXNBcHBlbmQgKSB7XG4gICAgLy8gYXBwZW5kLCBhZGQgdG8gZW5kXG4gICAgdGhpcy5jZWxscyA9IHRoaXMuY2VsbHMuY29uY2F0KCBjZWxscyApO1xuICB9IGVsc2Uge1xuICAgIC8vIGluc2VydCBpbiB0aGlzLmNlbGxzXG4gICAgdmFyIGVuZENlbGxzID0gdGhpcy5jZWxscy5zcGxpY2UoIGluZGV4LCBsZW4gLSBpbmRleCApO1xuICAgIHRoaXMuY2VsbHMgPSB0aGlzLmNlbGxzLmNvbmNhdCggY2VsbHMgKS5jb25jYXQoIGVuZENlbGxzICk7XG4gIH1cblxuICB0aGlzLl9zaXplQ2VsbHMoIGNlbGxzICk7XG4gIHRoaXMuY2VsbENoYW5nZSggaW5kZXgsIHRydWUgKTtcbn07XG5cbnByb3RvLmFwcGVuZCA9IGZ1bmN0aW9uKCBlbGVtcyApIHtcbiAgdGhpcy5pbnNlcnQoIGVsZW1zLCB0aGlzLmNlbGxzLmxlbmd0aCApO1xufTtcblxucHJvdG8ucHJlcGVuZCA9IGZ1bmN0aW9uKCBlbGVtcyApIHtcbiAgdGhpcy5pbnNlcnQoIGVsZW1zLCAwICk7XG59O1xuXG4vKipcbiAqIFJlbW92ZSBjZWxsc1xuICogQHBhcmFtIHtFbGVtZW50LCBBcnJheSwgTm9kZUxpc3R9IGVsZW1zXG4gKi9cbnByb3RvLnJlbW92ZSA9IGZ1bmN0aW9uKCBlbGVtcyApIHtcbiAgdmFyIGNlbGxzID0gdGhpcy5nZXRDZWxscyggZWxlbXMgKTtcbiAgaWYgKCAhY2VsbHMgfHwgIWNlbGxzLmxlbmd0aCApIHtcbiAgICByZXR1cm47XG4gIH1cblxuICB2YXIgbWluQ2VsbEluZGV4ID0gdGhpcy5jZWxscy5sZW5ndGggLSAxO1xuICAvLyByZW1vdmUgY2VsbHMgZnJvbSBjb2xsZWN0aW9uICYgRE9NXG4gIGNlbGxzLmZvckVhY2goIGZ1bmN0aW9uKCBjZWxsICkge1xuICAgIGNlbGwucmVtb3ZlKCk7XG4gICAgdmFyIGluZGV4ID0gdGhpcy5jZWxscy5pbmRleE9mKCBjZWxsICk7XG4gICAgbWluQ2VsbEluZGV4ID0gTWF0aC5taW4oIGluZGV4LCBtaW5DZWxsSW5kZXggKTtcbiAgICB1dGlscy5yZW1vdmVGcm9tKCB0aGlzLmNlbGxzLCBjZWxsICk7XG4gIH0sIHRoaXMgKTtcblxuICB0aGlzLmNlbGxDaGFuZ2UoIG1pbkNlbGxJbmRleCwgdHJ1ZSApO1xufTtcblxuLyoqXG4gKiBsb2dpYyB0byBiZSBydW4gYWZ0ZXIgYSBjZWxsJ3Mgc2l6ZSBjaGFuZ2VzXG4gKiBAcGFyYW0ge0VsZW1lbnR9IGVsZW0gLSBjZWxsJ3MgZWxlbWVudFxuICovXG5wcm90by5jZWxsU2l6ZUNoYW5nZSA9IGZ1bmN0aW9uKCBlbGVtICkge1xuICB2YXIgY2VsbCA9IHRoaXMuZ2V0Q2VsbCggZWxlbSApO1xuICBpZiAoICFjZWxsICkge1xuICAgIHJldHVybjtcbiAgfVxuICBjZWxsLmdldFNpemUoKTtcblxuICB2YXIgaW5kZXggPSB0aGlzLmNlbGxzLmluZGV4T2YoIGNlbGwgKTtcbiAgdGhpcy5jZWxsQ2hhbmdlKCBpbmRleCApO1xufTtcblxuLyoqXG4gKiBsb2dpYyBhbnkgdGltZSBhIGNlbGwgaXMgY2hhbmdlZDogYWRkZWQsIHJlbW92ZWQsIG9yIHNpemUgY2hhbmdlZFxuICogQHBhcmFtIHtJbnRlZ2VyfSBjaGFuZ2VkQ2VsbEluZGV4IC0gaW5kZXggb2YgdGhlIGNoYW5nZWQgY2VsbCwgb3B0aW9uYWxcbiAqL1xucHJvdG8uY2VsbENoYW5nZSA9IGZ1bmN0aW9uKCBjaGFuZ2VkQ2VsbEluZGV4LCBpc1Bvc2l0aW9uaW5nU2xpZGVyICkge1xuICB2YXIgcHJldlNlbGVjdGVkRWxlbSA9IHRoaXMuc2VsZWN0ZWRFbGVtZW50O1xuICB0aGlzLl9wb3NpdGlvbkNlbGxzKCBjaGFuZ2VkQ2VsbEluZGV4ICk7XG4gIHRoaXMuX2dldFdyYXBTaGlmdENlbGxzKCk7XG4gIHRoaXMuc2V0R2FsbGVyeVNpemUoKTtcbiAgLy8gdXBkYXRlIHNlbGVjdGVkSW5kZXhcbiAgLy8gdHJ5IHRvIG1haW50YWluIHBvc2l0aW9uICYgc2VsZWN0IHByZXZpb3VzIHNlbGVjdGVkIGVsZW1lbnRcbiAgdmFyIGNlbGwgPSB0aGlzLmdldENlbGwoIHByZXZTZWxlY3RlZEVsZW0gKTtcbiAgaWYgKCBjZWxsICkge1xuICAgIHRoaXMuc2VsZWN0ZWRJbmRleCA9IHRoaXMuZ2V0Q2VsbFNsaWRlSW5kZXgoIGNlbGwgKTtcbiAgfVxuICB0aGlzLnNlbGVjdGVkSW5kZXggPSBNYXRoLm1pbiggdGhpcy5zbGlkZXMubGVuZ3RoIC0gMSwgdGhpcy5zZWxlY3RlZEluZGV4ICk7XG5cbiAgdGhpcy5lbWl0RXZlbnQoICdjZWxsQ2hhbmdlJywgWyBjaGFuZ2VkQ2VsbEluZGV4IF0gKTtcbiAgLy8gcG9zaXRpb24gc2xpZGVyXG4gIHRoaXMuc2VsZWN0KCB0aGlzLnNlbGVjdGVkSW5kZXggKTtcbiAgLy8gZG8gbm90IHBvc2l0aW9uIHNsaWRlciBhZnRlciBsYXp5IGxvYWRcbiAgaWYgKCBpc1Bvc2l0aW9uaW5nU2xpZGVyICkge1xuICAgIHRoaXMucG9zaXRpb25TbGlkZXJBdFNlbGVjdGVkKCk7XG4gIH1cbn07XG5cbi8vIC0tLS0tICAtLS0tLSAvL1xuXG5yZXR1cm4gRmxpY2tpdHk7XG5cbn0pKTtcbiIsIi8vIGxhenlsb2FkXG4oIGZ1bmN0aW9uKCB3aW5kb3csIGZhY3RvcnkgKSB7XG4gIC8vIHVuaXZlcnNhbCBtb2R1bGUgZGVmaW5pdGlvblxuICAvKiBqc2hpbnQgc3RyaWN0OiBmYWxzZSAqL1xuICBpZiAoIHR5cGVvZiBkZWZpbmUgPT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kICkge1xuICAgIC8vIEFNRFxuICAgIGRlZmluZSggW1xuICAgICAgJy4vZmxpY2tpdHknLFxuICAgICAgJ2Zpenp5LXVpLXV0aWxzL3V0aWxzJ1xuICAgIF0sIGZ1bmN0aW9uKCBGbGlja2l0eSwgdXRpbHMgKSB7XG4gICAgICByZXR1cm4gZmFjdG9yeSggd2luZG93LCBGbGlja2l0eSwgdXRpbHMgKTtcbiAgICB9KTtcbiAgfSBlbHNlIGlmICggdHlwZW9mIG1vZHVsZSA9PSAnb2JqZWN0JyAmJiBtb2R1bGUuZXhwb3J0cyApIHtcbiAgICAvLyBDb21tb25KU1xuICAgIG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeShcbiAgICAgIHdpbmRvdyxcbiAgICAgIHJlcXVpcmUoJy4vZmxpY2tpdHknKSxcbiAgICAgIHJlcXVpcmUoJ2Zpenp5LXVpLXV0aWxzJylcbiAgICApO1xuICB9IGVsc2Uge1xuICAgIC8vIGJyb3dzZXIgZ2xvYmFsXG4gICAgZmFjdG9yeShcbiAgICAgIHdpbmRvdyxcbiAgICAgIHdpbmRvdy5GbGlja2l0eSxcbiAgICAgIHdpbmRvdy5maXp6eVVJVXRpbHNcbiAgICApO1xuICB9XG5cbn0oIHdpbmRvdywgZnVuY3Rpb24gZmFjdG9yeSggd2luZG93LCBGbGlja2l0eSwgdXRpbHMgKSB7XG4ndXNlIHN0cmljdCc7XG5cbkZsaWNraXR5LmNyZWF0ZU1ldGhvZHMucHVzaCgnX2NyZWF0ZUxhenlsb2FkJyk7XG52YXIgcHJvdG8gPSBGbGlja2l0eS5wcm90b3R5cGU7XG5cbnByb3RvLl9jcmVhdGVMYXp5bG9hZCA9IGZ1bmN0aW9uKCkge1xuICB0aGlzLm9uKCAnc2VsZWN0JywgdGhpcy5sYXp5TG9hZCApO1xufTtcblxucHJvdG8ubGF6eUxvYWQgPSBmdW5jdGlvbigpIHtcbiAgdmFyIGxhenlMb2FkID0gdGhpcy5vcHRpb25zLmxhenlMb2FkO1xuICBpZiAoICFsYXp5TG9hZCApIHtcbiAgICByZXR1cm47XG4gIH1cbiAgLy8gZ2V0IGFkamFjZW50IGNlbGxzLCB1c2UgbGF6eUxvYWQgb3B0aW9uIGZvciBhZGphY2VudCBjb3VudFxuICB2YXIgYWRqQ291bnQgPSB0eXBlb2YgbGF6eUxvYWQgPT0gJ251bWJlcicgPyBsYXp5TG9hZCA6IDA7XG4gIHZhciBjZWxsRWxlbXMgPSB0aGlzLmdldEFkamFjZW50Q2VsbEVsZW1lbnRzKCBhZGpDb3VudCApO1xuICAvLyBnZXQgbGF6eSBpbWFnZXMgaW4gdGhvc2UgY2VsbHNcbiAgdmFyIGxhenlJbWFnZXMgPSBbXTtcbiAgY2VsbEVsZW1zLmZvckVhY2goIGZ1bmN0aW9uKCBjZWxsRWxlbSApIHtcbiAgICB2YXIgbGF6eUNlbGxJbWFnZXMgPSBnZXRDZWxsTGF6eUltYWdlcyggY2VsbEVsZW0gKTtcbiAgICBsYXp5SW1hZ2VzID0gbGF6eUltYWdlcy5jb25jYXQoIGxhenlDZWxsSW1hZ2VzICk7XG4gIH0pO1xuICAvLyBsb2FkIGxhenkgaW1hZ2VzXG4gIGxhenlJbWFnZXMuZm9yRWFjaCggZnVuY3Rpb24oIGltZyApIHtcbiAgICBuZXcgTGF6eUxvYWRlciggaW1nLCB0aGlzICk7XG4gIH0sIHRoaXMgKTtcbn07XG5cbmZ1bmN0aW9uIGdldENlbGxMYXp5SW1hZ2VzKCBjZWxsRWxlbSApIHtcbiAgLy8gY2hlY2sgaWYgY2VsbCBlbGVtZW50IGlzIGxhenkgaW1hZ2VcbiAgaWYgKCBjZWxsRWxlbS5ub2RlTmFtZSA9PSAnSU1HJyApIHtcbiAgICB2YXIgbGF6eWxvYWRBdHRyID0gY2VsbEVsZW0uZ2V0QXR0cmlidXRlKCdkYXRhLWZsaWNraXR5LWxhenlsb2FkJyk7XG4gICAgdmFyIHNyY0F0dHIgPSBjZWxsRWxlbS5nZXRBdHRyaWJ1dGUoJ2RhdGEtZmxpY2tpdHktbGF6eWxvYWQtc3JjJyk7XG4gICAgdmFyIHNyY3NldEF0dHIgPSBjZWxsRWxlbS5nZXRBdHRyaWJ1dGUoJ2RhdGEtZmxpY2tpdHktbGF6eWxvYWQtc3Jjc2V0Jyk7XG4gICAgaWYgKCBsYXp5bG9hZEF0dHIgfHwgc3JjQXR0ciB8fCBzcmNzZXRBdHRyICkge1xuICAgICAgcmV0dXJuIFsgY2VsbEVsZW0gXTtcbiAgICB9XG4gIH1cbiAgLy8gc2VsZWN0IGxhenkgaW1hZ2VzIGluIGNlbGxcbiAgdmFyIGxhenlTZWxlY3RvciA9ICdpbWdbZGF0YS1mbGlja2l0eS1sYXp5bG9hZF0sICcgK1xuICAgICdpbWdbZGF0YS1mbGlja2l0eS1sYXp5bG9hZC1zcmNdLCBpbWdbZGF0YS1mbGlja2l0eS1sYXp5bG9hZC1zcmNzZXRdJztcbiAgdmFyIGltZ3MgPSBjZWxsRWxlbS5xdWVyeVNlbGVjdG9yQWxsKCBsYXp5U2VsZWN0b3IgKTtcbiAgcmV0dXJuIHV0aWxzLm1ha2VBcnJheSggaW1ncyApO1xufVxuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSBMYXp5TG9hZGVyIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIC8vXG5cbi8qKlxuICogY2xhc3MgdG8gaGFuZGxlIGxvYWRpbmcgaW1hZ2VzXG4gKi9cbmZ1bmN0aW9uIExhenlMb2FkZXIoIGltZywgZmxpY2tpdHkgKSB7XG4gIHRoaXMuaW1nID0gaW1nO1xuICB0aGlzLmZsaWNraXR5ID0gZmxpY2tpdHk7XG4gIHRoaXMubG9hZCgpO1xufVxuXG5MYXp5TG9hZGVyLnByb3RvdHlwZS5oYW5kbGVFdmVudCA9IHV0aWxzLmhhbmRsZUV2ZW50O1xuXG5MYXp5TG9hZGVyLnByb3RvdHlwZS5sb2FkID0gZnVuY3Rpb24oKSB7XG4gIHRoaXMuaW1nLmFkZEV2ZW50TGlzdGVuZXIoICdsb2FkJywgdGhpcyApO1xuICB0aGlzLmltZy5hZGRFdmVudExpc3RlbmVyKCAnZXJyb3InLCB0aGlzICk7XG4gIC8vIGdldCBzcmMgJiBzcmNzZXRcbiAgdmFyIHNyYyA9IHRoaXMuaW1nLmdldEF0dHJpYnV0ZSgnZGF0YS1mbGlja2l0eS1sYXp5bG9hZCcpIHx8XG4gICAgdGhpcy5pbWcuZ2V0QXR0cmlidXRlKCdkYXRhLWZsaWNraXR5LWxhenlsb2FkLXNyYycpO1xuICB2YXIgc3Jjc2V0ID0gdGhpcy5pbWcuZ2V0QXR0cmlidXRlKCdkYXRhLWZsaWNraXR5LWxhenlsb2FkLXNyY3NldCcpO1xuICAvLyBzZXQgc3JjICYgc2Vyc2V0XG4gIHRoaXMuaW1nLnNyYyA9IHNyYztcbiAgaWYgKCBzcmNzZXQgKSB7XG4gICAgdGhpcy5pbWcuc2V0QXR0cmlidXRlKCAnc3Jjc2V0Jywgc3Jjc2V0ICk7XG4gIH1cbiAgLy8gcmVtb3ZlIGF0dHJcbiAgdGhpcy5pbWcucmVtb3ZlQXR0cmlidXRlKCdkYXRhLWZsaWNraXR5LWxhenlsb2FkJyk7XG4gIHRoaXMuaW1nLnJlbW92ZUF0dHJpYnV0ZSgnZGF0YS1mbGlja2l0eS1sYXp5bG9hZC1zcmMnKTtcbiAgdGhpcy5pbWcucmVtb3ZlQXR0cmlidXRlKCdkYXRhLWZsaWNraXR5LWxhenlsb2FkLXNyY3NldCcpO1xufTtcblxuTGF6eUxvYWRlci5wcm90b3R5cGUub25sb2FkID0gZnVuY3Rpb24oIGV2ZW50ICkge1xuICB0aGlzLmNvbXBsZXRlKCBldmVudCwgJ2ZsaWNraXR5LWxhenlsb2FkZWQnICk7XG59O1xuXG5MYXp5TG9hZGVyLnByb3RvdHlwZS5vbmVycm9yID0gZnVuY3Rpb24oIGV2ZW50ICkge1xuICB0aGlzLmNvbXBsZXRlKCBldmVudCwgJ2ZsaWNraXR5LWxhenllcnJvcicgKTtcbn07XG5cbkxhenlMb2FkZXIucHJvdG90eXBlLmNvbXBsZXRlID0gZnVuY3Rpb24oIGV2ZW50LCBjbGFzc05hbWUgKSB7XG4gIC8vIHVuYmluZCBldmVudHNcbiAgdGhpcy5pbWcucmVtb3ZlRXZlbnRMaXN0ZW5lciggJ2xvYWQnLCB0aGlzICk7XG4gIHRoaXMuaW1nLnJlbW92ZUV2ZW50TGlzdGVuZXIoICdlcnJvcicsIHRoaXMgKTtcblxuICB2YXIgY2VsbCA9IHRoaXMuZmxpY2tpdHkuZ2V0UGFyZW50Q2VsbCggdGhpcy5pbWcgKTtcbiAgdmFyIGNlbGxFbGVtID0gY2VsbCAmJiBjZWxsLmVsZW1lbnQ7XG4gIHRoaXMuZmxpY2tpdHkuY2VsbFNpemVDaGFuZ2UoIGNlbGxFbGVtICk7XG5cbiAgdGhpcy5pbWcuY2xhc3NMaXN0LmFkZCggY2xhc3NOYW1lICk7XG4gIHRoaXMuZmxpY2tpdHkuZGlzcGF0Y2hFdmVudCggJ2xhenlMb2FkJywgZXZlbnQsIGNlbGxFbGVtICk7XG59O1xuXG4vLyAtLS0tLSAgLS0tLS0gLy9cblxuRmxpY2tpdHkuTGF6eUxvYWRlciA9IExhenlMb2FkZXI7XG5cbnJldHVybiBGbGlja2l0eTtcblxufSkpO1xuIiwiLyohXG4gKiBGbGlja2l0eSB2Mi4yLjFcbiAqIFRvdWNoLCByZXNwb25zaXZlLCBmbGlja2FibGUgY2Fyb3VzZWxzXG4gKlxuICogTGljZW5zZWQgR1BMdjMgZm9yIG9wZW4gc291cmNlIHVzZVxuICogb3IgRmxpY2tpdHkgQ29tbWVyY2lhbCBMaWNlbnNlIGZvciBjb21tZXJjaWFsIHVzZVxuICpcbiAqIGh0dHBzOi8vZmxpY2tpdHkubWV0YWZpenp5LmNvXG4gKiBDb3B5cmlnaHQgMjAxNS0yMDE5IE1ldGFmaXp6eVxuICovXG5cbiggZnVuY3Rpb24oIHdpbmRvdywgZmFjdG9yeSApIHtcbiAgLy8gdW5pdmVyc2FsIG1vZHVsZSBkZWZpbml0aW9uXG4gIC8qIGpzaGludCBzdHJpY3Q6IGZhbHNlICovXG4gIGlmICggdHlwZW9mIGRlZmluZSA9PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQgKSB7XG4gICAgLy8gQU1EXG4gICAgZGVmaW5lKCBbXG4gICAgICAnLi9mbGlja2l0eScsXG4gICAgICAnLi9kcmFnJyxcbiAgICAgICcuL3ByZXYtbmV4dC1idXR0b24nLFxuICAgICAgJy4vcGFnZS1kb3RzJyxcbiAgICAgICcuL3BsYXllcicsXG4gICAgICAnLi9hZGQtcmVtb3ZlLWNlbGwnLFxuICAgICAgJy4vbGF6eWxvYWQnXG4gICAgXSwgZmFjdG9yeSApO1xuICB9IGVsc2UgaWYgKCB0eXBlb2YgbW9kdWxlID09ICdvYmplY3QnICYmIG1vZHVsZS5leHBvcnRzICkge1xuICAgIC8vIENvbW1vbkpTXG4gICAgbW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KFxuICAgICAgcmVxdWlyZSgnLi9mbGlja2l0eScpLFxuICAgICAgcmVxdWlyZSgnLi9kcmFnJyksXG4gICAgICByZXF1aXJlKCcuL3ByZXYtbmV4dC1idXR0b24nKSxcbiAgICAgIHJlcXVpcmUoJy4vcGFnZS1kb3RzJyksXG4gICAgICByZXF1aXJlKCcuL3BsYXllcicpLFxuICAgICAgcmVxdWlyZSgnLi9hZGQtcmVtb3ZlLWNlbGwnKSxcbiAgICAgIHJlcXVpcmUoJy4vbGF6eWxvYWQnKVxuICAgICk7XG4gIH1cblxufSkoIHdpbmRvdywgZnVuY3Rpb24gZmFjdG9yeSggRmxpY2tpdHkgKSB7XG4gIC8qanNoaW50IHN0cmljdDogZmFsc2UqL1xuICByZXR1cm4gRmxpY2tpdHk7XG59KTtcbiIsIi8qIVxuICogaW1hZ2VzTG9hZGVkIHY0LjEuNFxuICogSmF2YVNjcmlwdCBpcyBhbGwgbGlrZSBcIllvdSBpbWFnZXMgYXJlIGRvbmUgeWV0IG9yIHdoYXQ/XCJcbiAqIE1JVCBMaWNlbnNlXG4gKi9cblxuKCBmdW5jdGlvbiggd2luZG93LCBmYWN0b3J5ICkgeyAndXNlIHN0cmljdCc7XG4gIC8vIHVuaXZlcnNhbCBtb2R1bGUgZGVmaW5pdGlvblxuXG4gIC8qZ2xvYmFsIGRlZmluZTogZmFsc2UsIG1vZHVsZTogZmFsc2UsIHJlcXVpcmU6IGZhbHNlICovXG5cbiAgaWYgKCB0eXBlb2YgZGVmaW5lID09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCApIHtcbiAgICAvLyBBTURcbiAgICBkZWZpbmUoIFtcbiAgICAgICdldi1lbWl0dGVyL2V2LWVtaXR0ZXInXG4gICAgXSwgZnVuY3Rpb24oIEV2RW1pdHRlciApIHtcbiAgICAgIHJldHVybiBmYWN0b3J5KCB3aW5kb3csIEV2RW1pdHRlciApO1xuICAgIH0pO1xuICB9IGVsc2UgaWYgKCB0eXBlb2YgbW9kdWxlID09ICdvYmplY3QnICYmIG1vZHVsZS5leHBvcnRzICkge1xuICAgIC8vIENvbW1vbkpTXG4gICAgbW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KFxuICAgICAgd2luZG93LFxuICAgICAgcmVxdWlyZSgnZXYtZW1pdHRlcicpXG4gICAgKTtcbiAgfSBlbHNlIHtcbiAgICAvLyBicm93c2VyIGdsb2JhbFxuICAgIHdpbmRvdy5pbWFnZXNMb2FkZWQgPSBmYWN0b3J5KFxuICAgICAgd2luZG93LFxuICAgICAgd2luZG93LkV2RW1pdHRlclxuICAgICk7XG4gIH1cblxufSkoIHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnID8gd2luZG93IDogdGhpcyxcblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gIGZhY3RvcnkgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gLy9cblxuZnVuY3Rpb24gZmFjdG9yeSggd2luZG93LCBFdkVtaXR0ZXIgKSB7XG5cbid1c2Ugc3RyaWN0JztcblxudmFyICQgPSB3aW5kb3cualF1ZXJ5O1xudmFyIGNvbnNvbGUgPSB3aW5kb3cuY29uc29sZTtcblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gaGVscGVycyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSAvL1xuXG4vLyBleHRlbmQgb2JqZWN0c1xuZnVuY3Rpb24gZXh0ZW5kKCBhLCBiICkge1xuICBmb3IgKCB2YXIgcHJvcCBpbiBiICkge1xuICAgIGFbIHByb3AgXSA9IGJbIHByb3AgXTtcbiAgfVxuICByZXR1cm4gYTtcbn1cblxudmFyIGFycmF5U2xpY2UgPSBBcnJheS5wcm90b3R5cGUuc2xpY2U7XG5cbi8vIHR1cm4gZWxlbWVudCBvciBub2RlTGlzdCBpbnRvIGFuIGFycmF5XG5mdW5jdGlvbiBtYWtlQXJyYXkoIG9iaiApIHtcbiAgaWYgKCBBcnJheS5pc0FycmF5KCBvYmogKSApIHtcbiAgICAvLyB1c2Ugb2JqZWN0IGlmIGFscmVhZHkgYW4gYXJyYXlcbiAgICByZXR1cm4gb2JqO1xuICB9XG5cbiAgdmFyIGlzQXJyYXlMaWtlID0gdHlwZW9mIG9iaiA9PSAnb2JqZWN0JyAmJiB0eXBlb2Ygb2JqLmxlbmd0aCA9PSAnbnVtYmVyJztcbiAgaWYgKCBpc0FycmF5TGlrZSApIHtcbiAgICAvLyBjb252ZXJ0IG5vZGVMaXN0IHRvIGFycmF5XG4gICAgcmV0dXJuIGFycmF5U2xpY2UuY2FsbCggb2JqICk7XG4gIH1cblxuICAvLyBhcnJheSBvZiBzaW5nbGUgaW5kZXhcbiAgcmV0dXJuIFsgb2JqIF07XG59XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIGltYWdlc0xvYWRlZCAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSAvL1xuXG4vKipcbiAqIEBwYXJhbSB7QXJyYXksIEVsZW1lbnQsIE5vZGVMaXN0LCBTdHJpbmd9IGVsZW1cbiAqIEBwYXJhbSB7T2JqZWN0IG9yIEZ1bmN0aW9ufSBvcHRpb25zIC0gaWYgZnVuY3Rpb24sIHVzZSBhcyBjYWxsYmFja1xuICogQHBhcmFtIHtGdW5jdGlvbn0gb25BbHdheXMgLSBjYWxsYmFjayBmdW5jdGlvblxuICovXG5mdW5jdGlvbiBJbWFnZXNMb2FkZWQoIGVsZW0sIG9wdGlvbnMsIG9uQWx3YXlzICkge1xuICAvLyBjb2VyY2UgSW1hZ2VzTG9hZGVkKCkgd2l0aG91dCBuZXcsIHRvIGJlIG5ldyBJbWFnZXNMb2FkZWQoKVxuICBpZiAoICEoIHRoaXMgaW5zdGFuY2VvZiBJbWFnZXNMb2FkZWQgKSApIHtcbiAgICByZXR1cm4gbmV3IEltYWdlc0xvYWRlZCggZWxlbSwgb3B0aW9ucywgb25BbHdheXMgKTtcbiAgfVxuICAvLyB1c2UgZWxlbSBhcyBzZWxlY3RvciBzdHJpbmdcbiAgdmFyIHF1ZXJ5RWxlbSA9IGVsZW07XG4gIGlmICggdHlwZW9mIGVsZW0gPT0gJ3N0cmluZycgKSB7XG4gICAgcXVlcnlFbGVtID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCggZWxlbSApO1xuICB9XG4gIC8vIGJhaWwgaWYgYmFkIGVsZW1lbnRcbiAgaWYgKCAhcXVlcnlFbGVtICkge1xuICAgIGNvbnNvbGUuZXJyb3IoICdCYWQgZWxlbWVudCBmb3IgaW1hZ2VzTG9hZGVkICcgKyAoIHF1ZXJ5RWxlbSB8fCBlbGVtICkgKTtcbiAgICByZXR1cm47XG4gIH1cblxuICB0aGlzLmVsZW1lbnRzID0gbWFrZUFycmF5KCBxdWVyeUVsZW0gKTtcbiAgdGhpcy5vcHRpb25zID0gZXh0ZW5kKCB7fSwgdGhpcy5vcHRpb25zICk7XG4gIC8vIHNoaWZ0IGFyZ3VtZW50cyBpZiBubyBvcHRpb25zIHNldFxuICBpZiAoIHR5cGVvZiBvcHRpb25zID09ICdmdW5jdGlvbicgKSB7XG4gICAgb25BbHdheXMgPSBvcHRpb25zO1xuICB9IGVsc2Uge1xuICAgIGV4dGVuZCggdGhpcy5vcHRpb25zLCBvcHRpb25zICk7XG4gIH1cblxuICBpZiAoIG9uQWx3YXlzICkge1xuICAgIHRoaXMub24oICdhbHdheXMnLCBvbkFsd2F5cyApO1xuICB9XG5cbiAgdGhpcy5nZXRJbWFnZXMoKTtcblxuICBpZiAoICQgKSB7XG4gICAgLy8gYWRkIGpRdWVyeSBEZWZlcnJlZCBvYmplY3RcbiAgICB0aGlzLmpxRGVmZXJyZWQgPSBuZXcgJC5EZWZlcnJlZCgpO1xuICB9XG5cbiAgLy8gSEFDSyBjaGVjayBhc3luYyB0byBhbGxvdyB0aW1lIHRvIGJpbmQgbGlzdGVuZXJzXG4gIHNldFRpbWVvdXQoIHRoaXMuY2hlY2suYmluZCggdGhpcyApICk7XG59XG5cbkltYWdlc0xvYWRlZC5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKCBFdkVtaXR0ZXIucHJvdG90eXBlICk7XG5cbkltYWdlc0xvYWRlZC5wcm90b3R5cGUub3B0aW9ucyA9IHt9O1xuXG5JbWFnZXNMb2FkZWQucHJvdG90eXBlLmdldEltYWdlcyA9IGZ1bmN0aW9uKCkge1xuICB0aGlzLmltYWdlcyA9IFtdO1xuXG4gIC8vIGZpbHRlciAmIGZpbmQgaXRlbXMgaWYgd2UgaGF2ZSBhbiBpdGVtIHNlbGVjdG9yXG4gIHRoaXMuZWxlbWVudHMuZm9yRWFjaCggdGhpcy5hZGRFbGVtZW50SW1hZ2VzLCB0aGlzICk7XG59O1xuXG4vKipcbiAqIEBwYXJhbSB7Tm9kZX0gZWxlbWVudFxuICovXG5JbWFnZXNMb2FkZWQucHJvdG90eXBlLmFkZEVsZW1lbnRJbWFnZXMgPSBmdW5jdGlvbiggZWxlbSApIHtcbiAgLy8gZmlsdGVyIHNpYmxpbmdzXG4gIGlmICggZWxlbS5ub2RlTmFtZSA9PSAnSU1HJyApIHtcbiAgICB0aGlzLmFkZEltYWdlKCBlbGVtICk7XG4gIH1cbiAgLy8gZ2V0IGJhY2tncm91bmQgaW1hZ2Ugb24gZWxlbWVudFxuICBpZiAoIHRoaXMub3B0aW9ucy5iYWNrZ3JvdW5kID09PSB0cnVlICkge1xuICAgIHRoaXMuYWRkRWxlbWVudEJhY2tncm91bmRJbWFnZXMoIGVsZW0gKTtcbiAgfVxuXG4gIC8vIGZpbmQgY2hpbGRyZW5cbiAgLy8gbm8gbm9uLWVsZW1lbnQgbm9kZXMsICMxNDNcbiAgdmFyIG5vZGVUeXBlID0gZWxlbS5ub2RlVHlwZTtcbiAgaWYgKCAhbm9kZVR5cGUgfHwgIWVsZW1lbnROb2RlVHlwZXNbIG5vZGVUeXBlIF0gKSB7XG4gICAgcmV0dXJuO1xuICB9XG4gIHZhciBjaGlsZEltZ3MgPSBlbGVtLnF1ZXJ5U2VsZWN0b3JBbGwoJ2ltZycpO1xuICAvLyBjb25jYXQgY2hpbGRFbGVtcyB0byBmaWx0ZXJGb3VuZCBhcnJheVxuICBmb3IgKCB2YXIgaT0wOyBpIDwgY2hpbGRJbWdzLmxlbmd0aDsgaSsrICkge1xuICAgIHZhciBpbWcgPSBjaGlsZEltZ3NbaV07XG4gICAgdGhpcy5hZGRJbWFnZSggaW1nICk7XG4gIH1cblxuICAvLyBnZXQgY2hpbGQgYmFja2dyb3VuZCBpbWFnZXNcbiAgaWYgKCB0eXBlb2YgdGhpcy5vcHRpb25zLmJhY2tncm91bmQgPT0gJ3N0cmluZycgKSB7XG4gICAgdmFyIGNoaWxkcmVuID0gZWxlbS5xdWVyeVNlbGVjdG9yQWxsKCB0aGlzLm9wdGlvbnMuYmFja2dyb3VuZCApO1xuICAgIGZvciAoIGk9MDsgaSA8IGNoaWxkcmVuLmxlbmd0aDsgaSsrICkge1xuICAgICAgdmFyIGNoaWxkID0gY2hpbGRyZW5baV07XG4gICAgICB0aGlzLmFkZEVsZW1lbnRCYWNrZ3JvdW5kSW1hZ2VzKCBjaGlsZCApO1xuICAgIH1cbiAgfVxufTtcblxudmFyIGVsZW1lbnROb2RlVHlwZXMgPSB7XG4gIDE6IHRydWUsXG4gIDk6IHRydWUsXG4gIDExOiB0cnVlXG59O1xuXG5JbWFnZXNMb2FkZWQucHJvdG90eXBlLmFkZEVsZW1lbnRCYWNrZ3JvdW5kSW1hZ2VzID0gZnVuY3Rpb24oIGVsZW0gKSB7XG4gIHZhciBzdHlsZSA9IGdldENvbXB1dGVkU3R5bGUoIGVsZW0gKTtcbiAgaWYgKCAhc3R5bGUgKSB7XG4gICAgLy8gRmlyZWZveCByZXR1cm5zIG51bGwgaWYgaW4gYSBoaWRkZW4gaWZyYW1lIGh0dHBzOi8vYnVnemlsLmxhLzU0ODM5N1xuICAgIHJldHVybjtcbiAgfVxuICAvLyBnZXQgdXJsIGluc2lkZSB1cmwoXCIuLi5cIilcbiAgdmFyIHJlVVJMID0gL3VybFxcKChbJ1wiXSk/KC4qPylcXDFcXCkvZ2k7XG4gIHZhciBtYXRjaGVzID0gcmVVUkwuZXhlYyggc3R5bGUuYmFja2dyb3VuZEltYWdlICk7XG4gIHdoaWxlICggbWF0Y2hlcyAhPT0gbnVsbCApIHtcbiAgICB2YXIgdXJsID0gbWF0Y2hlcyAmJiBtYXRjaGVzWzJdO1xuICAgIGlmICggdXJsICkge1xuICAgICAgdGhpcy5hZGRCYWNrZ3JvdW5kKCB1cmwsIGVsZW0gKTtcbiAgICB9XG4gICAgbWF0Y2hlcyA9IHJlVVJMLmV4ZWMoIHN0eWxlLmJhY2tncm91bmRJbWFnZSApO1xuICB9XG59O1xuXG4vKipcbiAqIEBwYXJhbSB7SW1hZ2V9IGltZ1xuICovXG5JbWFnZXNMb2FkZWQucHJvdG90eXBlLmFkZEltYWdlID0gZnVuY3Rpb24oIGltZyApIHtcbiAgdmFyIGxvYWRpbmdJbWFnZSA9IG5ldyBMb2FkaW5nSW1hZ2UoIGltZyApO1xuICB0aGlzLmltYWdlcy5wdXNoKCBsb2FkaW5nSW1hZ2UgKTtcbn07XG5cbkltYWdlc0xvYWRlZC5wcm90b3R5cGUuYWRkQmFja2dyb3VuZCA9IGZ1bmN0aW9uKCB1cmwsIGVsZW0gKSB7XG4gIHZhciBiYWNrZ3JvdW5kID0gbmV3IEJhY2tncm91bmQoIHVybCwgZWxlbSApO1xuICB0aGlzLmltYWdlcy5wdXNoKCBiYWNrZ3JvdW5kICk7XG59O1xuXG5JbWFnZXNMb2FkZWQucHJvdG90eXBlLmNoZWNrID0gZnVuY3Rpb24oKSB7XG4gIHZhciBfdGhpcyA9IHRoaXM7XG4gIHRoaXMucHJvZ3Jlc3NlZENvdW50ID0gMDtcbiAgdGhpcy5oYXNBbnlCcm9rZW4gPSBmYWxzZTtcbiAgLy8gY29tcGxldGUgaWYgbm8gaW1hZ2VzXG4gIGlmICggIXRoaXMuaW1hZ2VzLmxlbmd0aCApIHtcbiAgICB0aGlzLmNvbXBsZXRlKCk7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgZnVuY3Rpb24gb25Qcm9ncmVzcyggaW1hZ2UsIGVsZW0sIG1lc3NhZ2UgKSB7XG4gICAgLy8gSEFDSyAtIENocm9tZSB0cmlnZ2VycyBldmVudCBiZWZvcmUgb2JqZWN0IHByb3BlcnRpZXMgaGF2ZSBjaGFuZ2VkLiAjODNcbiAgICBzZXRUaW1lb3V0KCBmdW5jdGlvbigpIHtcbiAgICAgIF90aGlzLnByb2dyZXNzKCBpbWFnZSwgZWxlbSwgbWVzc2FnZSApO1xuICAgIH0pO1xuICB9XG5cbiAgdGhpcy5pbWFnZXMuZm9yRWFjaCggZnVuY3Rpb24oIGxvYWRpbmdJbWFnZSApIHtcbiAgICBsb2FkaW5nSW1hZ2Uub25jZSggJ3Byb2dyZXNzJywgb25Qcm9ncmVzcyApO1xuICAgIGxvYWRpbmdJbWFnZS5jaGVjaygpO1xuICB9KTtcbn07XG5cbkltYWdlc0xvYWRlZC5wcm90b3R5cGUucHJvZ3Jlc3MgPSBmdW5jdGlvbiggaW1hZ2UsIGVsZW0sIG1lc3NhZ2UgKSB7XG4gIHRoaXMucHJvZ3Jlc3NlZENvdW50Kys7XG4gIHRoaXMuaGFzQW55QnJva2VuID0gdGhpcy5oYXNBbnlCcm9rZW4gfHwgIWltYWdlLmlzTG9hZGVkO1xuICAvLyBwcm9ncmVzcyBldmVudFxuICB0aGlzLmVtaXRFdmVudCggJ3Byb2dyZXNzJywgWyB0aGlzLCBpbWFnZSwgZWxlbSBdICk7XG4gIGlmICggdGhpcy5qcURlZmVycmVkICYmIHRoaXMuanFEZWZlcnJlZC5ub3RpZnkgKSB7XG4gICAgdGhpcy5qcURlZmVycmVkLm5vdGlmeSggdGhpcywgaW1hZ2UgKTtcbiAgfVxuICAvLyBjaGVjayBpZiBjb21wbGV0ZWRcbiAgaWYgKCB0aGlzLnByb2dyZXNzZWRDb3VudCA9PSB0aGlzLmltYWdlcy5sZW5ndGggKSB7XG4gICAgdGhpcy5jb21wbGV0ZSgpO1xuICB9XG5cbiAgaWYgKCB0aGlzLm9wdGlvbnMuZGVidWcgJiYgY29uc29sZSApIHtcbiAgICBjb25zb2xlLmxvZyggJ3Byb2dyZXNzOiAnICsgbWVzc2FnZSwgaW1hZ2UsIGVsZW0gKTtcbiAgfVxufTtcblxuSW1hZ2VzTG9hZGVkLnByb3RvdHlwZS5jb21wbGV0ZSA9IGZ1bmN0aW9uKCkge1xuICB2YXIgZXZlbnROYW1lID0gdGhpcy5oYXNBbnlCcm9rZW4gPyAnZmFpbCcgOiAnZG9uZSc7XG4gIHRoaXMuaXNDb21wbGV0ZSA9IHRydWU7XG4gIHRoaXMuZW1pdEV2ZW50KCBldmVudE5hbWUsIFsgdGhpcyBdICk7XG4gIHRoaXMuZW1pdEV2ZW50KCAnYWx3YXlzJywgWyB0aGlzIF0gKTtcbiAgaWYgKCB0aGlzLmpxRGVmZXJyZWQgKSB7XG4gICAgdmFyIGpxTWV0aG9kID0gdGhpcy5oYXNBbnlCcm9rZW4gPyAncmVqZWN0JyA6ICdyZXNvbHZlJztcbiAgICB0aGlzLmpxRGVmZXJyZWRbIGpxTWV0aG9kIF0oIHRoaXMgKTtcbiAgfVxufTtcblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIC8vXG5cbmZ1bmN0aW9uIExvYWRpbmdJbWFnZSggaW1nICkge1xuICB0aGlzLmltZyA9IGltZztcbn1cblxuTG9hZGluZ0ltYWdlLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoIEV2RW1pdHRlci5wcm90b3R5cGUgKTtcblxuTG9hZGluZ0ltYWdlLnByb3RvdHlwZS5jaGVjayA9IGZ1bmN0aW9uKCkge1xuICAvLyBJZiBjb21wbGV0ZSBpcyB0cnVlIGFuZCBicm93c2VyIHN1cHBvcnRzIG5hdHVyYWwgc2l6ZXMsXG4gIC8vIHRyeSB0byBjaGVjayBmb3IgaW1hZ2Ugc3RhdHVzIG1hbnVhbGx5LlxuICB2YXIgaXNDb21wbGV0ZSA9IHRoaXMuZ2V0SXNJbWFnZUNvbXBsZXRlKCk7XG4gIGlmICggaXNDb21wbGV0ZSApIHtcbiAgICAvLyByZXBvcnQgYmFzZWQgb24gbmF0dXJhbFdpZHRoXG4gICAgdGhpcy5jb25maXJtKCB0aGlzLmltZy5uYXR1cmFsV2lkdGggIT09IDAsICduYXR1cmFsV2lkdGgnICk7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgLy8gSWYgbm9uZSBvZiB0aGUgY2hlY2tzIGFib3ZlIG1hdGNoZWQsIHNpbXVsYXRlIGxvYWRpbmcgb24gZGV0YWNoZWQgZWxlbWVudC5cbiAgdGhpcy5wcm94eUltYWdlID0gbmV3IEltYWdlKCk7XG4gIHRoaXMucHJveHlJbWFnZS5hZGRFdmVudExpc3RlbmVyKCAnbG9hZCcsIHRoaXMgKTtcbiAgdGhpcy5wcm94eUltYWdlLmFkZEV2ZW50TGlzdGVuZXIoICdlcnJvcicsIHRoaXMgKTtcbiAgLy8gYmluZCB0byBpbWFnZSBhcyB3ZWxsIGZvciBGaXJlZm94LiAjMTkxXG4gIHRoaXMuaW1nLmFkZEV2ZW50TGlzdGVuZXIoICdsb2FkJywgdGhpcyApO1xuICB0aGlzLmltZy5hZGRFdmVudExpc3RlbmVyKCAnZXJyb3InLCB0aGlzICk7XG4gIHRoaXMucHJveHlJbWFnZS5zcmMgPSB0aGlzLmltZy5zcmM7XG59O1xuXG5Mb2FkaW5nSW1hZ2UucHJvdG90eXBlLmdldElzSW1hZ2VDb21wbGV0ZSA9IGZ1bmN0aW9uKCkge1xuICAvLyBjaGVjayBmb3Igbm9uLXplcm8sIG5vbi11bmRlZmluZWQgbmF0dXJhbFdpZHRoXG4gIC8vIGZpeGVzIFNhZmFyaStJbmZpbml0ZVNjcm9sbCtNYXNvbnJ5IGJ1ZyBpbmZpbml0ZS1zY3JvbGwjNjcxXG4gIHJldHVybiB0aGlzLmltZy5jb21wbGV0ZSAmJiB0aGlzLmltZy5uYXR1cmFsV2lkdGg7XG59O1xuXG5Mb2FkaW5nSW1hZ2UucHJvdG90eXBlLmNvbmZpcm0gPSBmdW5jdGlvbiggaXNMb2FkZWQsIG1lc3NhZ2UgKSB7XG4gIHRoaXMuaXNMb2FkZWQgPSBpc0xvYWRlZDtcbiAgdGhpcy5lbWl0RXZlbnQoICdwcm9ncmVzcycsIFsgdGhpcywgdGhpcy5pbWcsIG1lc3NhZ2UgXSApO1xufTtcblxuLy8gLS0tLS0gZXZlbnRzIC0tLS0tIC8vXG5cbi8vIHRyaWdnZXIgc3BlY2lmaWVkIGhhbmRsZXIgZm9yIGV2ZW50IHR5cGVcbkxvYWRpbmdJbWFnZS5wcm90b3R5cGUuaGFuZGxlRXZlbnQgPSBmdW5jdGlvbiggZXZlbnQgKSB7XG4gIHZhciBtZXRob2QgPSAnb24nICsgZXZlbnQudHlwZTtcbiAgaWYgKCB0aGlzWyBtZXRob2QgXSApIHtcbiAgICB0aGlzWyBtZXRob2QgXSggZXZlbnQgKTtcbiAgfVxufTtcblxuTG9hZGluZ0ltYWdlLnByb3RvdHlwZS5vbmxvYWQgPSBmdW5jdGlvbigpIHtcbiAgdGhpcy5jb25maXJtKCB0cnVlLCAnb25sb2FkJyApO1xuICB0aGlzLnVuYmluZEV2ZW50cygpO1xufTtcblxuTG9hZGluZ0ltYWdlLnByb3RvdHlwZS5vbmVycm9yID0gZnVuY3Rpb24oKSB7XG4gIHRoaXMuY29uZmlybSggZmFsc2UsICdvbmVycm9yJyApO1xuICB0aGlzLnVuYmluZEV2ZW50cygpO1xufTtcblxuTG9hZGluZ0ltYWdlLnByb3RvdHlwZS51bmJpbmRFdmVudHMgPSBmdW5jdGlvbigpIHtcbiAgdGhpcy5wcm94eUltYWdlLnJlbW92ZUV2ZW50TGlzdGVuZXIoICdsb2FkJywgdGhpcyApO1xuICB0aGlzLnByb3h5SW1hZ2UucmVtb3ZlRXZlbnRMaXN0ZW5lciggJ2Vycm9yJywgdGhpcyApO1xuICB0aGlzLmltZy5yZW1vdmVFdmVudExpc3RlbmVyKCAnbG9hZCcsIHRoaXMgKTtcbiAgdGhpcy5pbWcucmVtb3ZlRXZlbnRMaXN0ZW5lciggJ2Vycm9yJywgdGhpcyApO1xufTtcblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gQmFja2dyb3VuZCAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSAvL1xuXG5mdW5jdGlvbiBCYWNrZ3JvdW5kKCB1cmwsIGVsZW1lbnQgKSB7XG4gIHRoaXMudXJsID0gdXJsO1xuICB0aGlzLmVsZW1lbnQgPSBlbGVtZW50O1xuICB0aGlzLmltZyA9IG5ldyBJbWFnZSgpO1xufVxuXG4vLyBpbmhlcml0IExvYWRpbmdJbWFnZSBwcm90b3R5cGVcbkJhY2tncm91bmQucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZSggTG9hZGluZ0ltYWdlLnByb3RvdHlwZSApO1xuXG5CYWNrZ3JvdW5kLnByb3RvdHlwZS5jaGVjayA9IGZ1bmN0aW9uKCkge1xuICB0aGlzLmltZy5hZGRFdmVudExpc3RlbmVyKCAnbG9hZCcsIHRoaXMgKTtcbiAgdGhpcy5pbWcuYWRkRXZlbnRMaXN0ZW5lciggJ2Vycm9yJywgdGhpcyApO1xuICB0aGlzLmltZy5zcmMgPSB0aGlzLnVybDtcbiAgLy8gY2hlY2sgaWYgaW1hZ2UgaXMgYWxyZWFkeSBjb21wbGV0ZVxuICB2YXIgaXNDb21wbGV0ZSA9IHRoaXMuZ2V0SXNJbWFnZUNvbXBsZXRlKCk7XG4gIGlmICggaXNDb21wbGV0ZSApIHtcbiAgICB0aGlzLmNvbmZpcm0oIHRoaXMuaW1nLm5hdHVyYWxXaWR0aCAhPT0gMCwgJ25hdHVyYWxXaWR0aCcgKTtcbiAgICB0aGlzLnVuYmluZEV2ZW50cygpO1xuICB9XG59O1xuXG5CYWNrZ3JvdW5kLnByb3RvdHlwZS51bmJpbmRFdmVudHMgPSBmdW5jdGlvbigpIHtcbiAgdGhpcy5pbWcucmVtb3ZlRXZlbnRMaXN0ZW5lciggJ2xvYWQnLCB0aGlzICk7XG4gIHRoaXMuaW1nLnJlbW92ZUV2ZW50TGlzdGVuZXIoICdlcnJvcicsIHRoaXMgKTtcbn07XG5cbkJhY2tncm91bmQucHJvdG90eXBlLmNvbmZpcm0gPSBmdW5jdGlvbiggaXNMb2FkZWQsIG1lc3NhZ2UgKSB7XG4gIHRoaXMuaXNMb2FkZWQgPSBpc0xvYWRlZDtcbiAgdGhpcy5lbWl0RXZlbnQoICdwcm9ncmVzcycsIFsgdGhpcywgdGhpcy5lbGVtZW50LCBtZXNzYWdlIF0gKTtcbn07XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIGpRdWVyeSAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSAvL1xuXG5JbWFnZXNMb2FkZWQubWFrZUpRdWVyeVBsdWdpbiA9IGZ1bmN0aW9uKCBqUXVlcnkgKSB7XG4gIGpRdWVyeSA9IGpRdWVyeSB8fCB3aW5kb3cualF1ZXJ5O1xuICBpZiAoICFqUXVlcnkgKSB7XG4gICAgcmV0dXJuO1xuICB9XG4gIC8vIHNldCBsb2NhbCB2YXJpYWJsZVxuICAkID0galF1ZXJ5O1xuICAvLyAkKCkuaW1hZ2VzTG9hZGVkKClcbiAgJC5mbi5pbWFnZXNMb2FkZWQgPSBmdW5jdGlvbiggb3B0aW9ucywgY2FsbGJhY2sgKSB7XG4gICAgdmFyIGluc3RhbmNlID0gbmV3IEltYWdlc0xvYWRlZCggdGhpcywgb3B0aW9ucywgY2FsbGJhY2sgKTtcbiAgICByZXR1cm4gaW5zdGFuY2UuanFEZWZlcnJlZC5wcm9taXNlKCAkKHRoaXMpICk7XG4gIH07XG59O1xuLy8gdHJ5IG1ha2luZyBwbHVnaW5cbkltYWdlc0xvYWRlZC5tYWtlSlF1ZXJ5UGx1Z2luKCk7XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tICAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSAvL1xuXG5yZXR1cm4gSW1hZ2VzTG9hZGVkO1xuXG59KTtcbiIsIi8qIVxuICogRmxpY2tpdHkgaW1hZ2VzTG9hZGVkIHYyLjAuMFxuICogZW5hYmxlcyBpbWFnZXNMb2FkZWQgb3B0aW9uIGZvciBGbGlja2l0eVxuICovXG5cbi8qanNoaW50IGJyb3dzZXI6IHRydWUsIHN0cmljdDogdHJ1ZSwgdW5kZWY6IHRydWUsIHVudXNlZDogdHJ1ZSAqL1xuXG4oIGZ1bmN0aW9uKCB3aW5kb3csIGZhY3RvcnkgKSB7XG4gIC8vIHVuaXZlcnNhbCBtb2R1bGUgZGVmaW5pdGlvblxuICAvKmpzaGludCBzdHJpY3Q6IGZhbHNlICovIC8qZ2xvYmFscyBkZWZpbmUsIG1vZHVsZSwgcmVxdWlyZSAqL1xuICBpZiAoIHR5cGVvZiBkZWZpbmUgPT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kICkge1xuICAgIC8vIEFNRFxuICAgIGRlZmluZSggW1xuICAgICAgJ2ZsaWNraXR5L2pzL2luZGV4JyxcbiAgICAgICdpbWFnZXNsb2FkZWQvaW1hZ2VzbG9hZGVkJ1xuICAgIF0sIGZ1bmN0aW9uKCBGbGlja2l0eSwgaW1hZ2VzTG9hZGVkICkge1xuICAgICAgcmV0dXJuIGZhY3RvcnkoIHdpbmRvdywgRmxpY2tpdHksIGltYWdlc0xvYWRlZCApO1xuICAgIH0pO1xuICB9IGVsc2UgaWYgKCB0eXBlb2YgbW9kdWxlID09ICdvYmplY3QnICYmIG1vZHVsZS5leHBvcnRzICkge1xuICAgIC8vIENvbW1vbkpTXG4gICAgbW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KFxuICAgICAgd2luZG93LFxuICAgICAgcmVxdWlyZSgnZmxpY2tpdHknKSxcbiAgICAgIHJlcXVpcmUoJ2ltYWdlc2xvYWRlZCcpXG4gICAgKTtcbiAgfSBlbHNlIHtcbiAgICAvLyBicm93c2VyIGdsb2JhbFxuICAgIHdpbmRvdy5GbGlja2l0eSA9IGZhY3RvcnkoXG4gICAgICB3aW5kb3csXG4gICAgICB3aW5kb3cuRmxpY2tpdHksXG4gICAgICB3aW5kb3cuaW1hZ2VzTG9hZGVkXG4gICAgKTtcbiAgfVxuXG59KCB3aW5kb3csIGZ1bmN0aW9uIGZhY3RvcnkoIHdpbmRvdywgRmxpY2tpdHksIGltYWdlc0xvYWRlZCApIHtcbid1c2Ugc3RyaWN0JztcblxuRmxpY2tpdHkuY3JlYXRlTWV0aG9kcy5wdXNoKCdfY3JlYXRlSW1hZ2VzTG9hZGVkJyk7XG5cbnZhciBwcm90byA9IEZsaWNraXR5LnByb3RvdHlwZTtcblxucHJvdG8uX2NyZWF0ZUltYWdlc0xvYWRlZCA9IGZ1bmN0aW9uKCkge1xuICB0aGlzLm9uKCAnYWN0aXZhdGUnLCB0aGlzLmltYWdlc0xvYWRlZCApO1xufTtcblxucHJvdG8uaW1hZ2VzTG9hZGVkID0gZnVuY3Rpb24oKSB7XG4gIGlmICggIXRoaXMub3B0aW9ucy5pbWFnZXNMb2FkZWQgKSB7XG4gICAgcmV0dXJuO1xuICB9XG4gIHZhciBfdGhpcyA9IHRoaXM7XG4gIGZ1bmN0aW9uIG9uSW1hZ2VzTG9hZGVkUHJvZ3Jlc3MoIGluc3RhbmNlLCBpbWFnZSApIHtcbiAgICB2YXIgY2VsbCA9IF90aGlzLmdldFBhcmVudENlbGwoIGltYWdlLmltZyApO1xuICAgIF90aGlzLmNlbGxTaXplQ2hhbmdlKCBjZWxsICYmIGNlbGwuZWxlbWVudCApO1xuICAgIGlmICggIV90aGlzLm9wdGlvbnMuZnJlZVNjcm9sbCApIHtcbiAgICAgIF90aGlzLnBvc2l0aW9uU2xpZGVyQXRTZWxlY3RlZCgpO1xuICAgIH1cbiAgfVxuICBpbWFnZXNMb2FkZWQoIHRoaXMuc2xpZGVyICkub24oICdwcm9ncmVzcycsIG9uSW1hZ2VzTG9hZGVkUHJvZ3Jlc3MgKTtcbn07XG5cbnJldHVybiBGbGlja2l0eTtcblxufSkpO1xuIiwiZnVuY3Rpb24gX3RvQ29uc3VtYWJsZUFycmF5KGFycikgeyBpZiAoQXJyYXkuaXNBcnJheShhcnIpKSB7IGZvciAodmFyIGkgPSAwLCBhcnIyID0gQXJyYXkoYXJyLmxlbmd0aCk7IGkgPCBhcnIubGVuZ3RoOyBpKyspIHsgYXJyMltpXSA9IGFycltpXTsgfSByZXR1cm4gYXJyMjsgfSBlbHNlIHsgcmV0dXJuIEFycmF5LmZyb20oYXJyKTsgfSB9XG5cbi8vIE9sZGVyIGJyb3dzZXJzIGRvbid0IHN1cHBvcnQgZXZlbnQgb3B0aW9ucywgZmVhdHVyZSBkZXRlY3QgaXQuXG5cbi8vIEFkb3B0ZWQgYW5kIG1vZGlmaWVkIHNvbHV0aW9uIGZyb20gQm9oZGFuIERpZHVraCAoMjAxNylcbi8vIGh0dHBzOi8vc3RhY2tvdmVyZmxvdy5jb20vcXVlc3Rpb25zLzQxNTk0OTk3L2lvcy0xMC1zYWZhcmktcHJldmVudC1zY3JvbGxpbmctYmVoaW5kLWEtZml4ZWQtb3ZlcmxheS1hbmQtbWFpbnRhaW4tc2Nyb2xsLXBvc2lcblxudmFyIGhhc1Bhc3NpdmVFdmVudHMgPSBmYWxzZTtcbmlmICh0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJykge1xuICB2YXIgcGFzc2l2ZVRlc3RPcHRpb25zID0ge1xuICAgIGdldCBwYXNzaXZlKCkge1xuICAgICAgaGFzUGFzc2l2ZUV2ZW50cyA9IHRydWU7XG4gICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIH1cbiAgfTtcbiAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3Rlc3RQYXNzaXZlJywgbnVsbCwgcGFzc2l2ZVRlc3RPcHRpb25zKTtcbiAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3Rlc3RQYXNzaXZlJywgbnVsbCwgcGFzc2l2ZVRlc3RPcHRpb25zKTtcbn1cblxudmFyIGlzSW9zRGV2aWNlID0gdHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcgJiYgd2luZG93Lm5hdmlnYXRvciAmJiB3aW5kb3cubmF2aWdhdG9yLnBsYXRmb3JtICYmICgvaVAoYWR8aG9uZXxvZCkvLnRlc3Qod2luZG93Lm5hdmlnYXRvci5wbGF0Zm9ybSkgfHwgd2luZG93Lm5hdmlnYXRvci5wbGF0Zm9ybSA9PT0gJ01hY0ludGVsJyAmJiB3aW5kb3cubmF2aWdhdG9yLm1heFRvdWNoUG9pbnRzID4gMSk7XG5cblxudmFyIGxvY2tzID0gW107XG52YXIgZG9jdW1lbnRMaXN0ZW5lckFkZGVkID0gZmFsc2U7XG52YXIgaW5pdGlhbENsaWVudFkgPSAtMTtcbnZhciBwcmV2aW91c0JvZHlPdmVyZmxvd1NldHRpbmcgPSB2b2lkIDA7XG52YXIgcHJldmlvdXNCb2R5UGFkZGluZ1JpZ2h0ID0gdm9pZCAwO1xuXG4vLyByZXR1cm5zIHRydWUgaWYgYGVsYCBzaG91bGQgYmUgYWxsb3dlZCB0byByZWNlaXZlIHRvdWNobW92ZSBldmVudHMuXG52YXIgYWxsb3dUb3VjaE1vdmUgPSBmdW5jdGlvbiBhbGxvd1RvdWNoTW92ZShlbCkge1xuICByZXR1cm4gbG9ja3Muc29tZShmdW5jdGlvbiAobG9jaykge1xuICAgIGlmIChsb2NrLm9wdGlvbnMuYWxsb3dUb3VjaE1vdmUgJiYgbG9jay5vcHRpb25zLmFsbG93VG91Y2hNb3ZlKGVsKSkge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgcmV0dXJuIGZhbHNlO1xuICB9KTtcbn07XG5cbnZhciBwcmV2ZW50RGVmYXVsdCA9IGZ1bmN0aW9uIHByZXZlbnREZWZhdWx0KHJhd0V2ZW50KSB7XG4gIHZhciBlID0gcmF3RXZlbnQgfHwgd2luZG93LmV2ZW50O1xuXG4gIC8vIEZvciB0aGUgY2FzZSB3aGVyZWJ5IGNvbnN1bWVycyBhZGRzIGEgdG91Y2htb3ZlIGV2ZW50IGxpc3RlbmVyIHRvIGRvY3VtZW50LlxuICAvLyBSZWNhbGwgdGhhdCB3ZSBkbyBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCd0b3VjaG1vdmUnLCBwcmV2ZW50RGVmYXVsdCwgeyBwYXNzaXZlOiBmYWxzZSB9KVxuICAvLyBpbiBkaXNhYmxlQm9keVNjcm9sbCAtIHNvIGlmIHdlIHByb3ZpZGUgdGhpcyBvcHBvcnR1bml0eSB0byBhbGxvd1RvdWNoTW92ZSwgdGhlblxuICAvLyB0aGUgdG91Y2htb3ZlIGV2ZW50IG9uIGRvY3VtZW50IHdpbGwgYnJlYWsuXG4gIGlmIChhbGxvd1RvdWNoTW92ZShlLnRhcmdldCkpIHtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIC8vIERvIG5vdCBwcmV2ZW50IGlmIHRoZSBldmVudCBoYXMgbW9yZSB0aGFuIG9uZSB0b3VjaCAodXN1YWxseSBtZWFuaW5nIHRoaXMgaXMgYSBtdWx0aSB0b3VjaCBnZXN0dXJlIGxpa2UgcGluY2ggdG8gem9vbSkuXG4gIGlmIChlLnRvdWNoZXMubGVuZ3RoID4gMSkgcmV0dXJuIHRydWU7XG5cbiAgaWYgKGUucHJldmVudERlZmF1bHQpIGUucHJldmVudERlZmF1bHQoKTtcblxuICByZXR1cm4gZmFsc2U7XG59O1xuXG52YXIgc2V0T3ZlcmZsb3dIaWRkZW4gPSBmdW5jdGlvbiBzZXRPdmVyZmxvd0hpZGRlbihvcHRpb25zKSB7XG4gIC8vIFNldHRpbmcgb3ZlcmZsb3cgb24gYm9keS9kb2N1bWVudEVsZW1lbnQgc3luY2hyb25vdXNseSBpbiBEZXNrdG9wIFNhZmFyaSBzbG93cyBkb3duXG4gIC8vIHRoZSByZXNwb25zaXZlbmVzcyBmb3Igc29tZSByZWFzb24uIFNldHRpbmcgd2l0aGluIGEgc2V0VGltZW91dCBmaXhlcyB0aGlzLlxuICBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAvLyBJZiBwcmV2aW91c0JvZHlQYWRkaW5nUmlnaHQgaXMgYWxyZWFkeSBzZXQsIGRvbid0IHNldCBpdCBhZ2Fpbi5cbiAgICBpZiAocHJldmlvdXNCb2R5UGFkZGluZ1JpZ2h0ID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHZhciBfcmVzZXJ2ZVNjcm9sbEJhckdhcCA9ICEhb3B0aW9ucyAmJiBvcHRpb25zLnJlc2VydmVTY3JvbGxCYXJHYXAgPT09IHRydWU7XG4gICAgICB2YXIgc2Nyb2xsQmFyR2FwID0gd2luZG93LmlubmVyV2lkdGggLSBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuY2xpZW50V2lkdGg7XG5cbiAgICAgIGlmIChfcmVzZXJ2ZVNjcm9sbEJhckdhcCAmJiBzY3JvbGxCYXJHYXAgPiAwKSB7XG4gICAgICAgIHByZXZpb3VzQm9keVBhZGRpbmdSaWdodCA9IGRvY3VtZW50LmJvZHkuc3R5bGUucGFkZGluZ1JpZ2h0O1xuICAgICAgICBkb2N1bWVudC5ib2R5LnN0eWxlLnBhZGRpbmdSaWdodCA9IHNjcm9sbEJhckdhcCArICdweCc7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gSWYgcHJldmlvdXNCb2R5T3ZlcmZsb3dTZXR0aW5nIGlzIGFscmVhZHkgc2V0LCBkb24ndCBzZXQgaXQgYWdhaW4uXG4gICAgaWYgKHByZXZpb3VzQm9keU92ZXJmbG93U2V0dGluZyA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICBwcmV2aW91c0JvZHlPdmVyZmxvd1NldHRpbmcgPSBkb2N1bWVudC5ib2R5LnN0eWxlLm92ZXJmbG93O1xuICAgICAgZG9jdW1lbnQuYm9keS5zdHlsZS5vdmVyZmxvdyA9ICdoaWRkZW4nO1xuICAgIH1cbiAgfSk7XG59O1xuXG52YXIgcmVzdG9yZU92ZXJmbG93U2V0dGluZyA9IGZ1bmN0aW9uIHJlc3RvcmVPdmVyZmxvd1NldHRpbmcoKSB7XG4gIC8vIFNldHRpbmcgb3ZlcmZsb3cgb24gYm9keS9kb2N1bWVudEVsZW1lbnQgc3luY2hyb25vdXNseSBpbiBEZXNrdG9wIFNhZmFyaSBzbG93cyBkb3duXG4gIC8vIHRoZSByZXNwb25zaXZlbmVzcyBmb3Igc29tZSByZWFzb24uIFNldHRpbmcgd2l0aGluIGEgc2V0VGltZW91dCBmaXhlcyB0aGlzLlxuICBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICBpZiAocHJldmlvdXNCb2R5UGFkZGluZ1JpZ2h0ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIGRvY3VtZW50LmJvZHkuc3R5bGUucGFkZGluZ1JpZ2h0ID0gcHJldmlvdXNCb2R5UGFkZGluZ1JpZ2h0O1xuXG4gICAgICAvLyBSZXN0b3JlIHByZXZpb3VzQm9keVBhZGRpbmdSaWdodCB0byB1bmRlZmluZWQgc28gc2V0T3ZlcmZsb3dIaWRkZW4ga25vd3MgaXRcbiAgICAgIC8vIGNhbiBiZSBzZXQgYWdhaW4uXG4gICAgICBwcmV2aW91c0JvZHlQYWRkaW5nUmlnaHQgPSB1bmRlZmluZWQ7XG4gICAgfVxuXG4gICAgaWYgKHByZXZpb3VzQm9keU92ZXJmbG93U2V0dGluZyAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICBkb2N1bWVudC5ib2R5LnN0eWxlLm92ZXJmbG93ID0gcHJldmlvdXNCb2R5T3ZlcmZsb3dTZXR0aW5nO1xuXG4gICAgICAvLyBSZXN0b3JlIHByZXZpb3VzQm9keU92ZXJmbG93U2V0dGluZyB0byB1bmRlZmluZWRcbiAgICAgIC8vIHNvIHNldE92ZXJmbG93SGlkZGVuIGtub3dzIGl0IGNhbiBiZSBzZXQgYWdhaW4uXG4gICAgICBwcmV2aW91c0JvZHlPdmVyZmxvd1NldHRpbmcgPSB1bmRlZmluZWQ7XG4gICAgfVxuICB9KTtcbn07XG5cbi8vIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0FQSS9FbGVtZW50L3Njcm9sbEhlaWdodCNQcm9ibGVtc19hbmRfc29sdXRpb25zXG52YXIgaXNUYXJnZXRFbGVtZW50VG90YWxseVNjcm9sbGVkID0gZnVuY3Rpb24gaXNUYXJnZXRFbGVtZW50VG90YWxseVNjcm9sbGVkKHRhcmdldEVsZW1lbnQpIHtcbiAgcmV0dXJuIHRhcmdldEVsZW1lbnQgPyB0YXJnZXRFbGVtZW50LnNjcm9sbEhlaWdodCAtIHRhcmdldEVsZW1lbnQuc2Nyb2xsVG9wIDw9IHRhcmdldEVsZW1lbnQuY2xpZW50SGVpZ2h0IDogZmFsc2U7XG59O1xuXG52YXIgaGFuZGxlU2Nyb2xsID0gZnVuY3Rpb24gaGFuZGxlU2Nyb2xsKGV2ZW50LCB0YXJnZXRFbGVtZW50KSB7XG4gIHZhciBjbGllbnRZID0gZXZlbnQudGFyZ2V0VG91Y2hlc1swXS5jbGllbnRZIC0gaW5pdGlhbENsaWVudFk7XG5cbiAgaWYgKGFsbG93VG91Y2hNb3ZlKGV2ZW50LnRhcmdldCkpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBpZiAodGFyZ2V0RWxlbWVudCAmJiB0YXJnZXRFbGVtZW50LnNjcm9sbFRvcCA9PT0gMCAmJiBjbGllbnRZID4gMCkge1xuICAgIC8vIGVsZW1lbnQgaXMgYXQgdGhlIHRvcCBvZiBpdHMgc2Nyb2xsLlxuICAgIHJldHVybiBwcmV2ZW50RGVmYXVsdChldmVudCk7XG4gIH1cblxuICBpZiAoaXNUYXJnZXRFbGVtZW50VG90YWxseVNjcm9sbGVkKHRhcmdldEVsZW1lbnQpICYmIGNsaWVudFkgPCAwKSB7XG4gICAgLy8gZWxlbWVudCBpcyBhdCB0aGUgYm90dG9tIG9mIGl0cyBzY3JvbGwuXG4gICAgcmV0dXJuIHByZXZlbnREZWZhdWx0KGV2ZW50KTtcbiAgfVxuXG4gIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuICByZXR1cm4gdHJ1ZTtcbn07XG5cbmV4cG9ydCB2YXIgZGlzYWJsZUJvZHlTY3JvbGwgPSBmdW5jdGlvbiBkaXNhYmxlQm9keVNjcm9sbCh0YXJnZXRFbGVtZW50LCBvcHRpb25zKSB7XG4gIGlmIChpc0lvc0RldmljZSkge1xuICAgIC8vIHRhcmdldEVsZW1lbnQgbXVzdCBiZSBwcm92aWRlZCwgYW5kIGRpc2FibGVCb2R5U2Nyb2xsIG11c3Qgbm90IGhhdmUgYmVlblxuICAgIC8vIGNhbGxlZCBvbiB0aGlzIHRhcmdldEVsZW1lbnQgYmVmb3JlLlxuICAgIGlmICghdGFyZ2V0RWxlbWVudCkge1xuICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLWNvbnNvbGVcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ2Rpc2FibGVCb2R5U2Nyb2xsIHVuc3VjY2Vzc2Z1bCAtIHRhcmdldEVsZW1lbnQgbXVzdCBiZSBwcm92aWRlZCB3aGVuIGNhbGxpbmcgZGlzYWJsZUJvZHlTY3JvbGwgb24gSU9TIGRldmljZXMuJyk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKHRhcmdldEVsZW1lbnQgJiYgIWxvY2tzLnNvbWUoZnVuY3Rpb24gKGxvY2spIHtcbiAgICAgIHJldHVybiBsb2NrLnRhcmdldEVsZW1lbnQgPT09IHRhcmdldEVsZW1lbnQ7XG4gICAgfSkpIHtcbiAgICAgIHZhciBsb2NrID0ge1xuICAgICAgICB0YXJnZXRFbGVtZW50OiB0YXJnZXRFbGVtZW50LFxuICAgICAgICBvcHRpb25zOiBvcHRpb25zIHx8IHt9XG4gICAgICB9O1xuXG4gICAgICBsb2NrcyA9IFtdLmNvbmNhdChfdG9Db25zdW1hYmxlQXJyYXkobG9ja3MpLCBbbG9ja10pO1xuXG4gICAgICB0YXJnZXRFbGVtZW50Lm9udG91Y2hzdGFydCA9IGZ1bmN0aW9uIChldmVudCkge1xuICAgICAgICBpZiAoZXZlbnQudGFyZ2V0VG91Y2hlcy5sZW5ndGggPT09IDEpIHtcbiAgICAgICAgICAvLyBkZXRlY3Qgc2luZ2xlIHRvdWNoLlxuICAgICAgICAgIGluaXRpYWxDbGllbnRZID0gZXZlbnQudGFyZ2V0VG91Y2hlc1swXS5jbGllbnRZO1xuICAgICAgICB9XG4gICAgICB9O1xuICAgICAgdGFyZ2V0RWxlbWVudC5vbnRvdWNobW92ZSA9IGZ1bmN0aW9uIChldmVudCkge1xuICAgICAgICBpZiAoZXZlbnQudGFyZ2V0VG91Y2hlcy5sZW5ndGggPT09IDEpIHtcbiAgICAgICAgICAvLyBkZXRlY3Qgc2luZ2xlIHRvdWNoLlxuICAgICAgICAgIGhhbmRsZVNjcm9sbChldmVudCwgdGFyZ2V0RWxlbWVudCk7XG4gICAgICAgIH1cbiAgICAgIH07XG5cbiAgICAgIGlmICghZG9jdW1lbnRMaXN0ZW5lckFkZGVkKSB7XG4gICAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNobW92ZScsIHByZXZlbnREZWZhdWx0LCBoYXNQYXNzaXZlRXZlbnRzID8geyBwYXNzaXZlOiBmYWxzZSB9IDogdW5kZWZpbmVkKTtcbiAgICAgICAgZG9jdW1lbnRMaXN0ZW5lckFkZGVkID0gdHJ1ZTtcbiAgICAgIH1cbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgc2V0T3ZlcmZsb3dIaWRkZW4ob3B0aW9ucyk7XG4gICAgdmFyIF9sb2NrID0ge1xuICAgICAgdGFyZ2V0RWxlbWVudDogdGFyZ2V0RWxlbWVudCxcbiAgICAgIG9wdGlvbnM6IG9wdGlvbnMgfHwge31cbiAgICB9O1xuXG4gICAgbG9ja3MgPSBbXS5jb25jYXQoX3RvQ29uc3VtYWJsZUFycmF5KGxvY2tzKSwgW19sb2NrXSk7XG4gIH1cbn07XG5cbmV4cG9ydCB2YXIgY2xlYXJBbGxCb2R5U2Nyb2xsTG9ja3MgPSBmdW5jdGlvbiBjbGVhckFsbEJvZHlTY3JvbGxMb2NrcygpIHtcbiAgaWYgKGlzSW9zRGV2aWNlKSB7XG4gICAgLy8gQ2xlYXIgYWxsIGxvY2tzIG9udG91Y2hzdGFydC9vbnRvdWNobW92ZSBoYW5kbGVycywgYW5kIHRoZSByZWZlcmVuY2VzLlxuICAgIGxvY2tzLmZvckVhY2goZnVuY3Rpb24gKGxvY2spIHtcbiAgICAgIGxvY2sudGFyZ2V0RWxlbWVudC5vbnRvdWNoc3RhcnQgPSBudWxsO1xuICAgICAgbG9jay50YXJnZXRFbGVtZW50Lm9udG91Y2htb3ZlID0gbnVsbDtcbiAgICB9KTtcblxuICAgIGlmIChkb2N1bWVudExpc3RlbmVyQWRkZWQpIHtcbiAgICAgIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3RvdWNobW92ZScsIHByZXZlbnREZWZhdWx0LCBoYXNQYXNzaXZlRXZlbnRzID8geyBwYXNzaXZlOiBmYWxzZSB9IDogdW5kZWZpbmVkKTtcbiAgICAgIGRvY3VtZW50TGlzdGVuZXJBZGRlZCA9IGZhbHNlO1xuICAgIH1cblxuICAgIGxvY2tzID0gW107XG5cbiAgICAvLyBSZXNldCBpbml0aWFsIGNsaWVudFkuXG4gICAgaW5pdGlhbENsaWVudFkgPSAtMTtcbiAgfSBlbHNlIHtcbiAgICByZXN0b3JlT3ZlcmZsb3dTZXR0aW5nKCk7XG4gICAgbG9ja3MgPSBbXTtcbiAgfVxufTtcblxuZXhwb3J0IHZhciBlbmFibGVCb2R5U2Nyb2xsID0gZnVuY3Rpb24gZW5hYmxlQm9keVNjcm9sbCh0YXJnZXRFbGVtZW50KSB7XG4gIGlmIChpc0lvc0RldmljZSkge1xuICAgIGlmICghdGFyZ2V0RWxlbWVudCkge1xuICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLWNvbnNvbGVcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ2VuYWJsZUJvZHlTY3JvbGwgdW5zdWNjZXNzZnVsIC0gdGFyZ2V0RWxlbWVudCBtdXN0IGJlIHByb3ZpZGVkIHdoZW4gY2FsbGluZyBlbmFibGVCb2R5U2Nyb2xsIG9uIElPUyBkZXZpY2VzLicpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRhcmdldEVsZW1lbnQub250b3VjaHN0YXJ0ID0gbnVsbDtcbiAgICB0YXJnZXRFbGVtZW50Lm9udG91Y2htb3ZlID0gbnVsbDtcblxuICAgIGxvY2tzID0gbG9ja3MuZmlsdGVyKGZ1bmN0aW9uIChsb2NrKSB7XG4gICAgICByZXR1cm4gbG9jay50YXJnZXRFbGVtZW50ICE9PSB0YXJnZXRFbGVtZW50O1xuICAgIH0pO1xuXG4gICAgaWYgKGRvY3VtZW50TGlzdGVuZXJBZGRlZCAmJiBsb2Nrcy5sZW5ndGggPT09IDApIHtcbiAgICAgIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3RvdWNobW92ZScsIHByZXZlbnREZWZhdWx0LCBoYXNQYXNzaXZlRXZlbnRzID8geyBwYXNzaXZlOiBmYWxzZSB9IDogdW5kZWZpbmVkKTtcblxuICAgICAgZG9jdW1lbnRMaXN0ZW5lckFkZGVkID0gZmFsc2U7XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIGxvY2tzID0gbG9ja3MuZmlsdGVyKGZ1bmN0aW9uIChsb2NrKSB7XG4gICAgICByZXR1cm4gbG9jay50YXJnZXRFbGVtZW50ICE9PSB0YXJnZXRFbGVtZW50O1xuICAgIH0pO1xuICAgIGlmICghbG9ja3MubGVuZ3RoKSB7XG4gICAgICByZXN0b3JlT3ZlcmZsb3dTZXR0aW5nKCk7XG4gICAgfVxuICB9XG59O1xuXG4iLCJpbXBvcnQgeyBkaXNhYmxlQm9keVNjcm9sbCwgZW5hYmxlQm9keVNjcm9sbCwgY2xlYXJBbGxCb2R5U2Nyb2xsTG9ja3MgfSBmcm9tICdib2R5LXNjcm9sbC1sb2NrJztcbmNvbnN0IGJ1cmdlciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5oYW1idXJnZXInKTtcbmNvbnN0IG5hdl90YXJnZXQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcubWFpbi1uYXZpZ2F0aW9uJyk7XG5cbmNvbnN0IHRvZ2dsZVJlc3BvbnNpdmVNZW51ID0gKCkgPT4ge1xuICBjb25zdCBJU19OQVZfT1BFTiA9IGRvY3VtZW50LmJvZHkuY2xhc3NMaXN0LmNvbnRhaW5zKCAnbmF2LWlzLW9wZW4nICk7XG5cdGlmICggSVNfTkFWX09QRU4gKSB7XG5cdFx0ZmxvYXRpbmdOYXYuY2xvc2VOYXYoKTtcblx0fSBlbHNlIHtcblx0XHRmbG9hdGluZ05hdi5vcGVuTmF2KCk7XG5cdH1cbn1cblxuY29uc3QgZmxvYXRpbmdOYXYgPSB7XG5cblx0b3Blbk5hdiA6IGZ1bmN0aW9uKCkge1xuICAgIGRvY3VtZW50LmJvZHkuY2xhc3NMaXN0LmFkZCggJ25hdi1pcy1vcGVuJyApO1xuICAgIGRpc2FibGVCb2R5U2Nyb2xsKCBuYXZfdGFyZ2V0ICk7XG5cdH0sXG5cblx0Y2xvc2VOYXYgOiBmdW5jdGlvbigpIHtcbiAgICBkb2N1bWVudC5ib2R5LmNsYXNzTGlzdC5yZW1vdmUoICduYXYtaXMtb3BlbicgKTtcbiAgICBlbmFibGVCb2R5U2Nyb2xsKCBuYXZfdGFyZ2V0ICk7XG5cdH1cbn1cblxuY29uc3QgaW5pdCA9ICgpID0+IHtcbiAgYnVyZ2VyLmFkZEV2ZW50TGlzdGVuZXIoICdjbGljaycsICgpID0+IHRvZ2dsZVJlc3BvbnNpdmVNZW51KCkgKTtcbn1cblxuZXhwb3J0IGRlZmF1bHQge1xuICBpbml0LFxufTsiLCJ2YXIgaXNPYmplY3QgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvaXMtb2JqZWN0Jyk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGl0KSB7XG4gIGlmICghaXNPYmplY3QoaXQpICYmIGl0ICE9PSBudWxsKSB7XG4gICAgdGhyb3cgVHlwZUVycm9yKFwiQ2FuJ3Qgc2V0IFwiICsgU3RyaW5nKGl0KSArICcgYXMgYSBwcm90b3R5cGUnKTtcbiAgfSByZXR1cm4gaXQ7XG59O1xuIiwidmFyIGFuT2JqZWN0ID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2FuLW9iamVjdCcpO1xudmFyIGFQb3NzaWJsZVByb3RvdHlwZSA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9hLXBvc3NpYmxlLXByb3RvdHlwZScpO1xuXG4vLyBgT2JqZWN0LnNldFByb3RvdHlwZU9mYCBtZXRob2Rcbi8vIGh0dHBzOi8vdGMzOS5naXRodWIuaW8vZWNtYTI2Mi8jc2VjLW9iamVjdC5zZXRwcm90b3R5cGVvZlxuLy8gV29ya3Mgd2l0aCBfX3Byb3RvX18gb25seS4gT2xkIHY4IGNhbid0IHdvcmsgd2l0aCBudWxsIHByb3RvIG9iamVjdHMuXG4vKiBlc2xpbnQtZGlzYWJsZSBuby1wcm90byAqL1xubW9kdWxlLmV4cG9ydHMgPSBPYmplY3Quc2V0UHJvdG90eXBlT2YgfHwgKCdfX3Byb3RvX18nIGluIHt9ID8gZnVuY3Rpb24gKCkge1xuICB2YXIgQ09SUkVDVF9TRVRURVIgPSBmYWxzZTtcbiAgdmFyIHRlc3QgPSB7fTtcbiAgdmFyIHNldHRlcjtcbiAgdHJ5IHtcbiAgICBzZXR0ZXIgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKE9iamVjdC5wcm90b3R5cGUsICdfX3Byb3RvX18nKS5zZXQ7XG4gICAgc2V0dGVyLmNhbGwodGVzdCwgW10pO1xuICAgIENPUlJFQ1RfU0VUVEVSID0gdGVzdCBpbnN0YW5jZW9mIEFycmF5O1xuICB9IGNhdGNoIChlcnJvcikgeyAvKiBlbXB0eSAqLyB9XG4gIHJldHVybiBmdW5jdGlvbiBzZXRQcm90b3R5cGVPZihPLCBwcm90bykge1xuICAgIGFuT2JqZWN0KE8pO1xuICAgIGFQb3NzaWJsZVByb3RvdHlwZShwcm90byk7XG4gICAgaWYgKENPUlJFQ1RfU0VUVEVSKSBzZXR0ZXIuY2FsbChPLCBwcm90byk7XG4gICAgZWxzZSBPLl9fcHJvdG9fXyA9IHByb3RvO1xuICAgIHJldHVybiBPO1xuICB9O1xufSgpIDogdW5kZWZpbmVkKTtcbiIsInZhciBpc09iamVjdCA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9pcy1vYmplY3QnKTtcbnZhciBzZXRQcm90b3R5cGVPZiA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9vYmplY3Qtc2V0LXByb3RvdHlwZS1vZicpO1xuXG4vLyBtYWtlcyBzdWJjbGFzc2luZyB3b3JrIGNvcnJlY3QgZm9yIHdyYXBwZWQgYnVpbHQtaW5zXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uICgkdGhpcywgZHVtbXksIFdyYXBwZXIpIHtcbiAgdmFyIE5ld1RhcmdldCwgTmV3VGFyZ2V0UHJvdG90eXBlO1xuICBpZiAoXG4gICAgLy8gaXQgY2FuIHdvcmsgb25seSB3aXRoIG5hdGl2ZSBgc2V0UHJvdG90eXBlT2ZgXG4gICAgc2V0UHJvdG90eXBlT2YgJiZcbiAgICAvLyB3ZSBoYXZlbid0IGNvbXBsZXRlbHkgY29ycmVjdCBwcmUtRVM2IHdheSBmb3IgZ2V0dGluZyBgbmV3LnRhcmdldGAsIHNvIHVzZSB0aGlzXG4gICAgdHlwZW9mIChOZXdUYXJnZXQgPSBkdW1teS5jb25zdHJ1Y3RvcikgPT0gJ2Z1bmN0aW9uJyAmJlxuICAgIE5ld1RhcmdldCAhPT0gV3JhcHBlciAmJlxuICAgIGlzT2JqZWN0KE5ld1RhcmdldFByb3RvdHlwZSA9IE5ld1RhcmdldC5wcm90b3R5cGUpICYmXG4gICAgTmV3VGFyZ2V0UHJvdG90eXBlICE9PSBXcmFwcGVyLnByb3RvdHlwZVxuICApIHNldFByb3RvdHlwZU9mKCR0aGlzLCBOZXdUYXJnZXRQcm90b3R5cGUpO1xuICByZXR1cm4gJHRoaXM7XG59O1xuIiwidmFyIGludGVybmFsT2JqZWN0S2V5cyA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9vYmplY3Qta2V5cy1pbnRlcm5hbCcpO1xudmFyIGVudW1CdWdLZXlzID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2VudW0tYnVnLWtleXMnKTtcblxuLy8gYE9iamVjdC5rZXlzYCBtZXRob2Rcbi8vIGh0dHBzOi8vdGMzOS5naXRodWIuaW8vZWNtYTI2Mi8jc2VjLW9iamVjdC5rZXlzXG5tb2R1bGUuZXhwb3J0cyA9IE9iamVjdC5rZXlzIHx8IGZ1bmN0aW9uIGtleXMoTykge1xuICByZXR1cm4gaW50ZXJuYWxPYmplY3RLZXlzKE8sIGVudW1CdWdLZXlzKTtcbn07XG4iLCJ2YXIgREVTQ1JJUFRPUlMgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvZGVzY3JpcHRvcnMnKTtcbnZhciBkZWZpbmVQcm9wZXJ0eU1vZHVsZSA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9vYmplY3QtZGVmaW5lLXByb3BlcnR5Jyk7XG52YXIgYW5PYmplY3QgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvYW4tb2JqZWN0Jyk7XG52YXIgb2JqZWN0S2V5cyA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9vYmplY3Qta2V5cycpO1xuXG4vLyBgT2JqZWN0LmRlZmluZVByb3BlcnRpZXNgIG1ldGhvZFxuLy8gaHR0cHM6Ly90YzM5LmdpdGh1Yi5pby9lY21hMjYyLyNzZWMtb2JqZWN0LmRlZmluZXByb3BlcnRpZXNcbm1vZHVsZS5leHBvcnRzID0gREVTQ1JJUFRPUlMgPyBPYmplY3QuZGVmaW5lUHJvcGVydGllcyA6IGZ1bmN0aW9uIGRlZmluZVByb3BlcnRpZXMoTywgUHJvcGVydGllcykge1xuICBhbk9iamVjdChPKTtcbiAgdmFyIGtleXMgPSBvYmplY3RLZXlzKFByb3BlcnRpZXMpO1xuICB2YXIgbGVuZ3RoID0ga2V5cy5sZW5ndGg7XG4gIHZhciBpbmRleCA9IDA7XG4gIHZhciBrZXk7XG4gIHdoaWxlIChsZW5ndGggPiBpbmRleCkgZGVmaW5lUHJvcGVydHlNb2R1bGUuZihPLCBrZXkgPSBrZXlzW2luZGV4KytdLCBQcm9wZXJ0aWVzW2tleV0pO1xuICByZXR1cm4gTztcbn07XG4iLCJ2YXIgZ2V0QnVpbHRJbiA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9nZXQtYnVpbHQtaW4nKTtcblxubW9kdWxlLmV4cG9ydHMgPSBnZXRCdWlsdEluKCdkb2N1bWVudCcsICdkb2N1bWVudEVsZW1lbnQnKTtcbiIsInZhciBhbk9iamVjdCA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9hbi1vYmplY3QnKTtcbnZhciBkZWZpbmVQcm9wZXJ0aWVzID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL29iamVjdC1kZWZpbmUtcHJvcGVydGllcycpO1xudmFyIGVudW1CdWdLZXlzID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2VudW0tYnVnLWtleXMnKTtcbnZhciBoaWRkZW5LZXlzID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2hpZGRlbi1rZXlzJyk7XG52YXIgaHRtbCA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9odG1sJyk7XG52YXIgZG9jdW1lbnRDcmVhdGVFbGVtZW50ID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2RvY3VtZW50LWNyZWF0ZS1lbGVtZW50Jyk7XG52YXIgc2hhcmVkS2V5ID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL3NoYXJlZC1rZXknKTtcbnZhciBJRV9QUk9UTyA9IHNoYXJlZEtleSgnSUVfUFJPVE8nKTtcblxudmFyIFBST1RPVFlQRSA9ICdwcm90b3R5cGUnO1xudmFyIEVtcHR5ID0gZnVuY3Rpb24gKCkgeyAvKiBlbXB0eSAqLyB9O1xuXG4vLyBDcmVhdGUgb2JqZWN0IHdpdGggZmFrZSBgbnVsbGAgcHJvdG90eXBlOiB1c2UgaWZyYW1lIE9iamVjdCB3aXRoIGNsZWFyZWQgcHJvdG90eXBlXG52YXIgY3JlYXRlRGljdCA9IGZ1bmN0aW9uICgpIHtcbiAgLy8gVGhyYXNoLCB3YXN0ZSBhbmQgc29kb215OiBJRSBHQyBidWdcbiAgdmFyIGlmcmFtZSA9IGRvY3VtZW50Q3JlYXRlRWxlbWVudCgnaWZyYW1lJyk7XG4gIHZhciBsZW5ndGggPSBlbnVtQnVnS2V5cy5sZW5ndGg7XG4gIHZhciBsdCA9ICc8JztcbiAgdmFyIHNjcmlwdCA9ICdzY3JpcHQnO1xuICB2YXIgZ3QgPSAnPic7XG4gIHZhciBqcyA9ICdqYXZhJyArIHNjcmlwdCArICc6JztcbiAgdmFyIGlmcmFtZURvY3VtZW50O1xuICBpZnJhbWUuc3R5bGUuZGlzcGxheSA9ICdub25lJztcbiAgaHRtbC5hcHBlbmRDaGlsZChpZnJhbWUpO1xuICBpZnJhbWUuc3JjID0gU3RyaW5nKGpzKTtcbiAgaWZyYW1lRG9jdW1lbnQgPSBpZnJhbWUuY29udGVudFdpbmRvdy5kb2N1bWVudDtcbiAgaWZyYW1lRG9jdW1lbnQub3BlbigpO1xuICBpZnJhbWVEb2N1bWVudC53cml0ZShsdCArIHNjcmlwdCArIGd0ICsgJ2RvY3VtZW50LkY9T2JqZWN0JyArIGx0ICsgJy8nICsgc2NyaXB0ICsgZ3QpO1xuICBpZnJhbWVEb2N1bWVudC5jbG9zZSgpO1xuICBjcmVhdGVEaWN0ID0gaWZyYW1lRG9jdW1lbnQuRjtcbiAgd2hpbGUgKGxlbmd0aC0tKSBkZWxldGUgY3JlYXRlRGljdFtQUk9UT1RZUEVdW2VudW1CdWdLZXlzW2xlbmd0aF1dO1xuICByZXR1cm4gY3JlYXRlRGljdCgpO1xufTtcblxuLy8gYE9iamVjdC5jcmVhdGVgIG1ldGhvZFxuLy8gaHR0cHM6Ly90YzM5LmdpdGh1Yi5pby9lY21hMjYyLyNzZWMtb2JqZWN0LmNyZWF0ZVxubW9kdWxlLmV4cG9ydHMgPSBPYmplY3QuY3JlYXRlIHx8IGZ1bmN0aW9uIGNyZWF0ZShPLCBQcm9wZXJ0aWVzKSB7XG4gIHZhciByZXN1bHQ7XG4gIGlmIChPICE9PSBudWxsKSB7XG4gICAgRW1wdHlbUFJPVE9UWVBFXSA9IGFuT2JqZWN0KE8pO1xuICAgIHJlc3VsdCA9IG5ldyBFbXB0eSgpO1xuICAgIEVtcHR5W1BST1RPVFlQRV0gPSBudWxsO1xuICAgIC8vIGFkZCBcIl9fcHJvdG9fX1wiIGZvciBPYmplY3QuZ2V0UHJvdG90eXBlT2YgcG9seWZpbGxcbiAgICByZXN1bHRbSUVfUFJPVE9dID0gTztcbiAgfSBlbHNlIHJlc3VsdCA9IGNyZWF0ZURpY3QoKTtcbiAgcmV0dXJuIFByb3BlcnRpZXMgPT09IHVuZGVmaW5lZCA/IHJlc3VsdCA6IGRlZmluZVByb3BlcnRpZXMocmVzdWx0LCBQcm9wZXJ0aWVzKTtcbn07XG5cbmhpZGRlbktleXNbSUVfUFJPVE9dID0gdHJ1ZTtcbiIsIi8vIGEgc3RyaW5nIG9mIGFsbCB2YWxpZCB1bmljb2RlIHdoaXRlc3BhY2VzXG4vLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbWF4LWxlblxubW9kdWxlLmV4cG9ydHMgPSAnXFx1MDAwOVxcdTAwMEFcXHUwMDBCXFx1MDAwQ1xcdTAwMERcXHUwMDIwXFx1MDBBMFxcdTE2ODBcXHUyMDAwXFx1MjAwMVxcdTIwMDJcXHUyMDAzXFx1MjAwNFxcdTIwMDVcXHUyMDA2XFx1MjAwN1xcdTIwMDhcXHUyMDA5XFx1MjAwQVxcdTIwMkZcXHUyMDVGXFx1MzAwMFxcdTIwMjhcXHUyMDI5XFx1RkVGRic7XG4iLCJ2YXIgcmVxdWlyZU9iamVjdENvZXJjaWJsZSA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9yZXF1aXJlLW9iamVjdC1jb2VyY2libGUnKTtcbnZhciB3aGl0ZXNwYWNlcyA9IHJlcXVpcmUoJy4uL2ludGVybmFscy93aGl0ZXNwYWNlcycpO1xuXG52YXIgd2hpdGVzcGFjZSA9ICdbJyArIHdoaXRlc3BhY2VzICsgJ10nO1xudmFyIGx0cmltID0gUmVnRXhwKCdeJyArIHdoaXRlc3BhY2UgKyB3aGl0ZXNwYWNlICsgJyonKTtcbnZhciBydHJpbSA9IFJlZ0V4cCh3aGl0ZXNwYWNlICsgd2hpdGVzcGFjZSArICcqJCcpO1xuXG4vLyBgU3RyaW5nLnByb3RvdHlwZS57IHRyaW0sIHRyaW1TdGFydCwgdHJpbUVuZCwgdHJpbUxlZnQsIHRyaW1SaWdodCB9YCBtZXRob2RzIGltcGxlbWVudGF0aW9uXG52YXIgY3JlYXRlTWV0aG9kID0gZnVuY3Rpb24gKFRZUEUpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uICgkdGhpcykge1xuICAgIHZhciBzdHJpbmcgPSBTdHJpbmcocmVxdWlyZU9iamVjdENvZXJjaWJsZSgkdGhpcykpO1xuICAgIGlmIChUWVBFICYgMSkgc3RyaW5nID0gc3RyaW5nLnJlcGxhY2UobHRyaW0sICcnKTtcbiAgICBpZiAoVFlQRSAmIDIpIHN0cmluZyA9IHN0cmluZy5yZXBsYWNlKHJ0cmltLCAnJyk7XG4gICAgcmV0dXJuIHN0cmluZztcbiAgfTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICAvLyBgU3RyaW5nLnByb3RvdHlwZS57IHRyaW1MZWZ0LCB0cmltU3RhcnQgfWAgbWV0aG9kc1xuICAvLyBodHRwczovL3RjMzkuZ2l0aHViLmlvL2VjbWEyNjIvI3NlYy1zdHJpbmcucHJvdG90eXBlLnRyaW1zdGFydFxuICBzdGFydDogY3JlYXRlTWV0aG9kKDEpLFxuICAvLyBgU3RyaW5nLnByb3RvdHlwZS57IHRyaW1SaWdodCwgdHJpbUVuZCB9YCBtZXRob2RzXG4gIC8vIGh0dHBzOi8vdGMzOS5naXRodWIuaW8vZWNtYTI2Mi8jc2VjLXN0cmluZy5wcm90b3R5cGUudHJpbWVuZFxuICBlbmQ6IGNyZWF0ZU1ldGhvZCgyKSxcbiAgLy8gYFN0cmluZy5wcm90b3R5cGUudHJpbWAgbWV0aG9kXG4gIC8vIGh0dHBzOi8vdGMzOS5naXRodWIuaW8vZWNtYTI2Mi8jc2VjLXN0cmluZy5wcm90b3R5cGUudHJpbVxuICB0cmltOiBjcmVhdGVNZXRob2QoMylcbn07XG4iLCIndXNlIHN0cmljdCc7XG52YXIgREVTQ1JJUFRPUlMgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvZGVzY3JpcHRvcnMnKTtcbnZhciBnbG9iYWwgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvZ2xvYmFsJyk7XG52YXIgaXNGb3JjZWQgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvaXMtZm9yY2VkJyk7XG52YXIgcmVkZWZpbmUgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvcmVkZWZpbmUnKTtcbnZhciBoYXMgPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvaGFzJyk7XG52YXIgY2xhc3NvZiA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9jbGFzc29mLXJhdycpO1xudmFyIGluaGVyaXRJZlJlcXVpcmVkID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL2luaGVyaXQtaWYtcmVxdWlyZWQnKTtcbnZhciB0b1ByaW1pdGl2ZSA9IHJlcXVpcmUoJy4uL2ludGVybmFscy90by1wcmltaXRpdmUnKTtcbnZhciBmYWlscyA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9mYWlscycpO1xudmFyIGNyZWF0ZSA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9vYmplY3QtY3JlYXRlJyk7XG52YXIgZ2V0T3duUHJvcGVydHlOYW1lcyA9IHJlcXVpcmUoJy4uL2ludGVybmFscy9vYmplY3QtZ2V0LW93bi1wcm9wZXJ0eS1uYW1lcycpLmY7XG52YXIgZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL29iamVjdC1nZXQtb3duLXByb3BlcnR5LWRlc2NyaXB0b3InKS5mO1xudmFyIGRlZmluZVByb3BlcnR5ID0gcmVxdWlyZSgnLi4vaW50ZXJuYWxzL29iamVjdC1kZWZpbmUtcHJvcGVydHknKS5mO1xudmFyIHRyaW0gPSByZXF1aXJlKCcuLi9pbnRlcm5hbHMvc3RyaW5nLXRyaW0nKS50cmltO1xuXG52YXIgTlVNQkVSID0gJ051bWJlcic7XG52YXIgTmF0aXZlTnVtYmVyID0gZ2xvYmFsW05VTUJFUl07XG52YXIgTnVtYmVyUHJvdG90eXBlID0gTmF0aXZlTnVtYmVyLnByb3RvdHlwZTtcblxuLy8gT3BlcmEgfjEyIGhhcyBicm9rZW4gT2JqZWN0I3RvU3RyaW5nXG52YXIgQlJPS0VOX0NMQVNTT0YgPSBjbGFzc29mKGNyZWF0ZShOdW1iZXJQcm90b3R5cGUpKSA9PSBOVU1CRVI7XG5cbi8vIGBUb051bWJlcmAgYWJzdHJhY3Qgb3BlcmF0aW9uXG4vLyBodHRwczovL3RjMzkuZ2l0aHViLmlvL2VjbWEyNjIvI3NlYy10b251bWJlclxudmFyIHRvTnVtYmVyID0gZnVuY3Rpb24gKGFyZ3VtZW50KSB7XG4gIHZhciBpdCA9IHRvUHJpbWl0aXZlKGFyZ3VtZW50LCBmYWxzZSk7XG4gIHZhciBmaXJzdCwgdGhpcmQsIHJhZGl4LCBtYXhDb2RlLCBkaWdpdHMsIGxlbmd0aCwgaW5kZXgsIGNvZGU7XG4gIGlmICh0eXBlb2YgaXQgPT0gJ3N0cmluZycgJiYgaXQubGVuZ3RoID4gMikge1xuICAgIGl0ID0gdHJpbShpdCk7XG4gICAgZmlyc3QgPSBpdC5jaGFyQ29kZUF0KDApO1xuICAgIGlmIChmaXJzdCA9PT0gNDMgfHwgZmlyc3QgPT09IDQ1KSB7XG4gICAgICB0aGlyZCA9IGl0LmNoYXJDb2RlQXQoMik7XG4gICAgICBpZiAodGhpcmQgPT09IDg4IHx8IHRoaXJkID09PSAxMjApIHJldHVybiBOYU47IC8vIE51bWJlcignKzB4MScpIHNob3VsZCBiZSBOYU4sIG9sZCBWOCBmaXhcbiAgICB9IGVsc2UgaWYgKGZpcnN0ID09PSA0OCkge1xuICAgICAgc3dpdGNoIChpdC5jaGFyQ29kZUF0KDEpKSB7XG4gICAgICAgIGNhc2UgNjY6IGNhc2UgOTg6IHJhZGl4ID0gMjsgbWF4Q29kZSA9IDQ5OyBicmVhazsgLy8gZmFzdCBlcXVhbCBvZiAvXjBiWzAxXSskL2lcbiAgICAgICAgY2FzZSA3OTogY2FzZSAxMTE6IHJhZGl4ID0gODsgbWF4Q29kZSA9IDU1OyBicmVhazsgLy8gZmFzdCBlcXVhbCBvZiAvXjBvWzAtN10rJC9pXG4gICAgICAgIGRlZmF1bHQ6IHJldHVybiAraXQ7XG4gICAgICB9XG4gICAgICBkaWdpdHMgPSBpdC5zbGljZSgyKTtcbiAgICAgIGxlbmd0aCA9IGRpZ2l0cy5sZW5ndGg7XG4gICAgICBmb3IgKGluZGV4ID0gMDsgaW5kZXggPCBsZW5ndGg7IGluZGV4KyspIHtcbiAgICAgICAgY29kZSA9IGRpZ2l0cy5jaGFyQ29kZUF0KGluZGV4KTtcbiAgICAgICAgLy8gcGFyc2VJbnQgcGFyc2VzIGEgc3RyaW5nIHRvIGEgZmlyc3QgdW5hdmFpbGFibGUgc3ltYm9sXG4gICAgICAgIC8vIGJ1dCBUb051bWJlciBzaG91bGQgcmV0dXJuIE5hTiBpZiBhIHN0cmluZyBjb250YWlucyB1bmF2YWlsYWJsZSBzeW1ib2xzXG4gICAgICAgIGlmIChjb2RlIDwgNDggfHwgY29kZSA+IG1heENvZGUpIHJldHVybiBOYU47XG4gICAgICB9IHJldHVybiBwYXJzZUludChkaWdpdHMsIHJhZGl4KTtcbiAgICB9XG4gIH0gcmV0dXJuICtpdDtcbn07XG5cbi8vIGBOdW1iZXJgIGNvbnN0cnVjdG9yXG4vLyBodHRwczovL3RjMzkuZ2l0aHViLmlvL2VjbWEyNjIvI3NlYy1udW1iZXItY29uc3RydWN0b3JcbmlmIChpc0ZvcmNlZChOVU1CRVIsICFOYXRpdmVOdW1iZXIoJyAwbzEnKSB8fCAhTmF0aXZlTnVtYmVyKCcwYjEnKSB8fCBOYXRpdmVOdW1iZXIoJysweDEnKSkpIHtcbiAgdmFyIE51bWJlcldyYXBwZXIgPSBmdW5jdGlvbiBOdW1iZXIodmFsdWUpIHtcbiAgICB2YXIgaXQgPSBhcmd1bWVudHMubGVuZ3RoIDwgMSA/IDAgOiB2YWx1ZTtcbiAgICB2YXIgZHVtbXkgPSB0aGlzO1xuICAgIHJldHVybiBkdW1teSBpbnN0YW5jZW9mIE51bWJlcldyYXBwZXJcbiAgICAgIC8vIGNoZWNrIG9uIDEuLmNvbnN0cnVjdG9yKGZvbykgY2FzZVxuICAgICAgJiYgKEJST0tFTl9DTEFTU09GID8gZmFpbHMoZnVuY3Rpb24gKCkgeyBOdW1iZXJQcm90b3R5cGUudmFsdWVPZi5jYWxsKGR1bW15KTsgfSkgOiBjbGFzc29mKGR1bW15KSAhPSBOVU1CRVIpXG4gICAgICAgID8gaW5oZXJpdElmUmVxdWlyZWQobmV3IE5hdGl2ZU51bWJlcih0b051bWJlcihpdCkpLCBkdW1teSwgTnVtYmVyV3JhcHBlcikgOiB0b051bWJlcihpdCk7XG4gIH07XG4gIGZvciAodmFyIGtleXMgPSBERVNDUklQVE9SUyA/IGdldE93blByb3BlcnR5TmFtZXMoTmF0aXZlTnVtYmVyKSA6IChcbiAgICAvLyBFUzM6XG4gICAgJ01BWF9WQUxVRSxNSU5fVkFMVUUsTmFOLE5FR0FUSVZFX0lORklOSVRZLFBPU0lUSVZFX0lORklOSVRZLCcgK1xuICAgIC8vIEVTMjAxNSAoaW4gY2FzZSwgaWYgbW9kdWxlcyB3aXRoIEVTMjAxNSBOdW1iZXIgc3RhdGljcyByZXF1aXJlZCBiZWZvcmUpOlxuICAgICdFUFNJTE9OLGlzRmluaXRlLGlzSW50ZWdlcixpc05hTixpc1NhZmVJbnRlZ2VyLE1BWF9TQUZFX0lOVEVHRVIsJyArXG4gICAgJ01JTl9TQUZFX0lOVEVHRVIscGFyc2VGbG9hdCxwYXJzZUludCxpc0ludGVnZXInXG4gICkuc3BsaXQoJywnKSwgaiA9IDAsIGtleTsga2V5cy5sZW5ndGggPiBqOyBqKyspIHtcbiAgICBpZiAoaGFzKE5hdGl2ZU51bWJlciwga2V5ID0ga2V5c1tqXSkgJiYgIWhhcyhOdW1iZXJXcmFwcGVyLCBrZXkpKSB7XG4gICAgICBkZWZpbmVQcm9wZXJ0eShOdW1iZXJXcmFwcGVyLCBrZXksIGdldE93blByb3BlcnR5RGVzY3JpcHRvcihOYXRpdmVOdW1iZXIsIGtleSkpO1xuICAgIH1cbiAgfVxuICBOdW1iZXJXcmFwcGVyLnByb3RvdHlwZSA9IE51bWJlclByb3RvdHlwZTtcbiAgTnVtYmVyUHJvdG90eXBlLmNvbnN0cnVjdG9yID0gTnVtYmVyV3JhcHBlcjtcbiAgcmVkZWZpbmUoZ2xvYmFsLCBOVU1CRVIsIE51bWJlcldyYXBwZXIpO1xufVxuIiwiLy8gR29vZ2xlIE1hcCBzZXQtdXAgZnVjbnRpb25zXG5jb25zdCBpbml0TWFwID0gZnVuY3Rpb24oIG1hcElkLCBvcHRpb25zLCBjYWxsYmFjayApIHtcblx0aWYgKCFkb2N1bWVudC5nZXRFbGVtZW50QnlJZCggbWFwSWQgKSkgcmV0dXJuO1xuXHRjb25zdCBkZWZhdWx0cyA9IHtcblx0XHRsYXQ6IE51bWJlcigtMzcuODQxMjQpLFxuXHRcdGxuZzogTnVtYmVyKDE0NC45Mzg0MjEpLFxuXHRcdHN0eWxlIDogW3tcImZlYXR1cmVUeXBlXCI6XCJ3YXRlclwiLFwiZWxlbWVudFR5cGVcIjpcImdlb21ldHJ5XCIsXCJzdHlsZXJzXCI6W3tcImNvbG9yXCI6XCIjZTllOWU5XCJ9LHtcImxpZ2h0bmVzc1wiOjE3fV19LHtcImZlYXR1cmVUeXBlXCI6XCJsYW5kc2NhcGVcIixcImVsZW1lbnRUeXBlXCI6XCJnZW9tZXRyeVwiLFwic3R5bGVyc1wiOlt7XCJjb2xvclwiOlwiI2Y1ZjVmNVwifSx7XCJsaWdodG5lc3NcIjoyMH1dfSx7XCJmZWF0dXJlVHlwZVwiOlwicm9hZC5oaWdod2F5XCIsXCJlbGVtZW50VHlwZVwiOlwiZ2VvbWV0cnkuZmlsbFwiLFwic3R5bGVyc1wiOlt7XCJjb2xvclwiOlwiI2ZmZmZmZlwifSx7XCJsaWdodG5lc3NcIjoxN31dfSx7XCJmZWF0dXJlVHlwZVwiOlwicm9hZC5oaWdod2F5XCIsXCJlbGVtZW50VHlwZVwiOlwiZ2VvbWV0cnkuc3Ryb2tlXCIsXCJzdHlsZXJzXCI6W3tcImNvbG9yXCI6XCIjZmZmZmZmXCJ9LHtcImxpZ2h0bmVzc1wiOjI5fSx7XCJ3ZWlnaHRcIjowLjJ9XX0se1wiZmVhdHVyZVR5cGVcIjpcInJvYWQuYXJ0ZXJpYWxcIixcImVsZW1lbnRUeXBlXCI6XCJnZW9tZXRyeVwiLFwic3R5bGVyc1wiOlt7XCJjb2xvclwiOlwiI2ZmZmZmZlwifSx7XCJsaWdodG5lc3NcIjoxOH1dfSx7XCJmZWF0dXJlVHlwZVwiOlwicm9hZC5sb2NhbFwiLFwiZWxlbWVudFR5cGVcIjpcImdlb21ldHJ5XCIsXCJzdHlsZXJzXCI6W3tcImNvbG9yXCI6XCIjZmZmZmZmXCJ9LHtcImxpZ2h0bmVzc1wiOjE2fV19LHtcImZlYXR1cmVUeXBlXCI6XCJwb2lcIixcImVsZW1lbnRUeXBlXCI6XCJnZW9tZXRyeVwiLFwic3R5bGVyc1wiOlt7XCJjb2xvclwiOlwiI2Y1ZjVmNVwifSx7XCJsaWdodG5lc3NcIjoyMX1dfSx7XCJmZWF0dXJlVHlwZVwiOlwicG9pLnBhcmtcIixcImVsZW1lbnRUeXBlXCI6XCJnZW9tZXRyeVwiLFwic3R5bGVyc1wiOlt7XCJjb2xvclwiOlwiI2RlZGVkZVwifSx7XCJsaWdodG5lc3NcIjoyMX1dfSx7XCJlbGVtZW50VHlwZVwiOlwibGFiZWxzLnRleHQuc3Ryb2tlXCIsXCJzdHlsZXJzXCI6W3tcInZpc2liaWxpdHlcIjpcIm9uXCJ9LHtcImNvbG9yXCI6XCIjZmZmZmZmXCJ9LHtcImxpZ2h0bmVzc1wiOjE2fV19LHtcImVsZW1lbnRUeXBlXCI6XCJsYWJlbHMudGV4dC5maWxsXCIsXCJzdHlsZXJzXCI6W3tcInNhdHVyYXRpb25cIjozNn0se1wiY29sb3JcIjpcIiMzMzMzMzNcIn0se1wibGlnaHRuZXNzXCI6NDB9XX0se1wiZWxlbWVudFR5cGVcIjpcImxhYmVscy5pY29uXCIsXCJzdHlsZXJzXCI6W3tcInZpc2liaWxpdHlcIjpcIm9mZlwifV19LHtcImZlYXR1cmVUeXBlXCI6XCJ0cmFuc2l0XCIsXCJlbGVtZW50VHlwZVwiOlwiZ2VvbWV0cnlcIixcInN0eWxlcnNcIjpbe1wiY29sb3JcIjpcIiNmMmYyZjJcIn0se1wibGlnaHRuZXNzXCI6MTl9XX0se1wiZmVhdHVyZVR5cGVcIjpcImFkbWluaXN0cmF0aXZlXCIsXCJlbGVtZW50VHlwZVwiOlwiZ2VvbWV0cnkuZmlsbFwiLFwic3R5bGVyc1wiOlt7XCJjb2xvclwiOlwiI2ZlZmVmZVwifSx7XCJsaWdodG5lc3NcIjoyMH1dfSx7XCJmZWF0dXJlVHlwZVwiOlwiYWRtaW5pc3RyYXRpdmVcIixcImVsZW1lbnRUeXBlXCI6XCJnZW9tZXRyeS5zdHJva2VcIixcInN0eWxlcnNcIjpbe1wiY29sb3JcIjpcIiNmZWZlZmVcIn0se1wibGlnaHRuZXNzXCI6MTd9LHtcIndlaWdodFwiOjEuMn1dfV0sXG5cdFx0em9vbSA6IDE0XG5cdH07XG5cdGlmICghb3B0aW9ucykgb3B0aW9ucyA9IGRlZmF1bHRzO1xuXG5cdGxldCBsb2NhdGlvbiA9IHtcblx0XHRsYXQ6IE51bWJlcihkb2N1bWVudC5nZXRFbGVtZW50QnlJZCggbWFwSWQgKS5kYXRhc2V0LmxhdCksIFxuXHRcdGxuZzogTnVtYmVyKGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCBtYXBJZCApLmRhdGFzZXQubG5nKVxuXHR9O1xuXHRpZiAoICFsb2NhdGlvbi5sYXQgfHwgIWxvY2F0aW9uLmxuZyApIHtcblx0XHRsb2NhdGlvbi5sYXQgPSBkZWZhdWx0cy5sYXQ7XG5cdFx0bG9jYXRpb24ubG5nID0gZGVmYXVsdHMubG5nO1xuXHRcdGNvbnNvbGUud2FybiggJ0dNYXBzIGVsZW1lbnQgZGlkIG5vdCBoYXZlIHZhbGlkIFwiZGF0YS1sYXRcIiBvciBcImRhdGEtbG5nXCIgYXR0cmlidXRlcyBzZXQsIHVzaW5nIGRlZmF1bHQgdmFsdWVzLi4uJyApO1xuXHR9XG5cdHZhciBpY29uID0ge1xuXHRcdFx0dXJsOiBvcHRpb25zLmljb24uaW1nIHx8IGAke1dQLnRlbXBsYXRlVXJsfS9pbWFnZXMvbWFya2VyLnBuZ2AsXG5cdFx0XHRzaXplOiBuZXcgZ29vZ2xlLm1hcHMuU2l6ZSggMjgsIDM5ICksXG5cdFx0XHRhbmNob3I6IG5ldyBnb29nbGUubWFwcy5Qb2ludCggMTQsIDM5ICksXG5cdFx0XHRzY2FsZWRTaXplOiBuZXcgZ29vZ2xlLm1hcHMuU2l6ZSggMjgsIDM5IClcblx0fTtcblx0dmFyIHN2Z0ljb24gPSB7XG5cdFx0cGF0aDogJ00xMCwyNiBDMy4zMzMzMzMzMywxOS4wMTUyMzE3IDAsMTMuNjgxODk4MyAwLDEwIEMwLDQuNDc3MTUyNSA0LjQ3NzE1MjUsMCAxMCwwIEMxNS41MjI4NDc1LDAgMjAsNC40NzcxNTI1IDIwLDEwIEMyMCwxMy42ODE4OTgzIDE2LjY2NjY2NjcsMTkuMDE1MjMxNyAxMCwyNiBaIE0xMCwxNCBDMTIuMjA5MTM5LDE0IDE0LDEyLjIwOTEzOSAxNCwxMCBDMTQsNy43OTA4NjEgMTIuMjA5MTM5LDYgMTAsNiBDNy43OTA4NjEsNiA2LDcuNzkwODYxIDYsMTAgQzYsMTIuMjA5MTM5IDcuNzkwODYxLDE0IDEwLDE0IFonLFxuXHRcdGZpbGxDb2xvcjogJyNmYTAwMDAnLFxuXHRcdGFuY2hvcjogbmV3IGdvb2dsZS5tYXBzLlBvaW50KCAxMCwgMjYgKSxcblx0XHRmaWxsT3BhY2l0eTogMSxcblx0XHRzdHJva2VXZWlnaHQ6IDAsXG5cdFx0c2NhbGU6IDFcblx0fTtcblx0dmFyIG1hcCA9IG5ldyBnb29nbGUubWFwcy5NYXAoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoIG1hcElkICksIHtcblx0XHR6b29tOiBvcHRpb25zLnpvb20gfHwgZGVmYXVsdHMuem9vbSxcblx0XHR6b29tQ29udHJvbDogXHRcdFx0XHRmYWxzZSxcblx0XHRtYXBUeXBlQ29udHJvbDogXHRcdGZhbHNlLFxuXHRcdHNjYWxlQ29udHJvbDogXHRcdFx0ZmFsc2UsXG5cdFx0c3RyZWV0Vmlld0NvbnRyb2w6IFx0ZmFsc2UsXG5cdFx0cm90YXRlQ29udHJvbDogXHRcdFx0ZmFsc2UsXG5cdFx0ZnVsbHNjcmVlbkNvbnRyb2w6IFx0ZmFsc2UsXG5cdFx0Y2VudGVyOiBsb2NhdGlvbixcblx0XHRzdHlsZXM6IG9wdGlvbnMuc3R5bGUgfHwgZGVmYXVsdHMuc3R5bGVcblx0fSk7XG5cdFxuXHR2YXIgbWFya2VyID0gbmV3IGdvb2dsZS5tYXBzLk1hcmtlcih7XG5cdFx0cG9zaXRpb246IGxvY2F0aW9uLFxuXHRcdG1hcDogbWFwLFxuXHRcdGljb246IGljb25cblx0fSk7XG5cdGNhbGxiYWNrKCBtYXAgKTtcbn1cblxuLy8gSGFuZGxlIGxvYWRpbmcgb2YgR01hcHMgc2NyaXB0XG5jb25zdCBsb2FkU2NyaXB0ID0gZnVuY3Rpb24odXJsLCBjb21wbGV0ZUNhbGxiYWNrKSB7XG5cdHZhciBzY3JpcHQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzY3JpcHQnKSwgZG9uZSA9IGZhbHNlLFxuXHRcdFx0aGVhZCA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKFwiaGVhZFwiKVswXTtcblx0c2NyaXB0LnNyYyA9IHVybDtcblx0c2NyaXB0Lm9ubG9hZCA9IHNjcmlwdC5vbnJlYWR5c3RhdGVjaGFuZ2UgPSBmdW5jdGlvbigpe1xuXHRcdGlmICggIWRvbmUgJiYgKCF0aGlzLnJlYWR5U3RhdGUgfHxcblx0XHRcdFx0dGhpcy5yZWFkeVN0YXRlID09IFwibG9hZGVkXCIgfHwgdGhpcy5yZWFkeVN0YXRlID09IFwiY29tcGxldGVcIikgKSB7XG5cdFx0XHRkb25lID0gdHJ1ZTtcblx0XHRcdGlmIChjb21wbGV0ZUNhbGxiYWNrKSBjb21wbGV0ZUNhbGxiYWNrKCk7XG5cdFx0XHQvLyBJRSBtZW1vcnkgbGVha1xuXHRcdFx0c2NyaXB0Lm9ubG9hZCA9IHNjcmlwdC5vbnJlYWR5c3RhdGVjaGFuZ2UgPSBudWxsO1xuXHRcdFx0aGVhZC5yZW1vdmVDaGlsZCggc2NyaXB0ICk7XG5cdFx0fVxuXHR9O1xuXHRoZWFkLmFwcGVuZENoaWxkKHNjcmlwdCk7XG59XG5cbi8vIFNldCB1cCBNYXBzXG5jb25zdCBzZXR1cEdvb2dsZU1hcHNBcGkgPSBmdW5jdGlvbiggbWFwc0FycmF5LCBvcHRpb25zICkge1xuXHRjb25zdCBtYXBFbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCBtYXBzQXJyYXlbMF0gKTtcblx0aWYgKCBtYXBFbCApIHtcblx0XHRsb2FkU2NyaXB0KCBcblx0XHRcdCdodHRwczovL21hcHMuZ29vZ2xlYXBpcy5jb20vbWFwcy9hcGkvanM/a2V5PUFJemFTeUJiZkJBcExyLS12dUMyV2F0ckdadGtkQTVsLW1WNDJwRScsIFxuXHRcdFx0ZnVuY3Rpb24oKSB7IHByb2Nlc3NNYXBzKCBtYXBzQXJyYXksIG9wdGlvbnMgKSB9XG5cdFx0KTtcblx0fVxufVxuXG4vLyBQYW4gTWFwXG5jb25zdCBwYW5NYXAgPSBmdW5jdGlvbiggbWFwSWQsIG9wdGlvbnMgKSB7XG5cdGluaXRNYXAoIG1hcElkLCBvcHRpb25zLCBmdW5jdGlvbiggbWFwICkgeyBtYXAucGFuQnkoMCwgMCkgfSApXG59XG5cbi8vIFByb2Nlc3MgTWFwc1xuY29uc3QgcHJvY2Vzc01hcHMgPSBmdW5jdGlvbiggbWFwc0FycmF5LCBvcHRpb25zICkge1xuXHRpZiAoICFBcnJheS5pc0FycmF5KCBtYXBzQXJyYXkgKSApIHJldHVybiBjb25zb2xlLmVycm9yKCAnTmVlZCB0byBwYXNzIGFuIGFycmF5IGlmIEdvb2dsZSBNYXAgSURzJyApO1xuXHRtYXBzQXJyYXkuZm9yRWFjaCggbSA9PiB7XG5cdFx0cGFuTWFwKCBtLCBvcHRpb25zICk7XG5cdH0pO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHsgXG5cdHNldHVwR29vZ2xlTWFwc0FwaSBcbn0iLCIvLyBFeHRlcm5hbCBQbHVnaW5zICYgUG9seWZpbGxzXG5pbXBvcnQgb2JqZWN0Rml0SW1hZ2VzIGZyb20gJ29iamVjdC1maXQtaW1hZ2VzJztcblxuLy8gSWYgdXNpbmcgZmxpY2tpdHksIHVuY29tbWVudCB0aGUgcmVxdWlyZXNcbmltcG9ydCBGbGlja2l0eSBmcm9tICdmbGlja2l0eSc7XG5pbXBvcnQgJ2ZsaWNraXR5LWltYWdlc2xvYWRlZCc7XG5cbi8vIE15IENvbXBvbmVudHNcbmltcG9ydCBOYXYgZnJvbSAnLi4vLi4vc3JjL2pzL2NvbXBvbmVudHMvbmF2aWdhdGlvbic7XG5pbXBvcnQgTWFwcyBmcm9tICcuLi8uLi9zcmMvanMvY29tcG9uZW50cy9nTWFwcy5qcyc7XG5cblxuLyogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5cdCBFeGVjdXRpb24gY29kZVxuXHQgPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09ICovXG5cbi8vIEdvb2dsZSBNQVBcbmNvbnN0IHNuYXp6eVN0eWxlID0gW3tcImZlYXR1cmVUeXBlXCI6XCJhbGxcIixcImVsZW1lbnRUeXBlXCI6XCJhbGxcIixcInN0eWxlcnNcIjpbe1widmlzaWJpbGl0eVwiOlwib25cIn1dfSx7XCJmZWF0dXJlVHlwZVwiOlwiYWxsXCIsXCJlbGVtZW50VHlwZVwiOlwibGFiZWxzXCIsXCJzdHlsZXJzXCI6W3tcInZpc2liaWxpdHlcIjpcIm9mZlwifSx7XCJzYXR1cmF0aW9uXCI6XCItMTAwXCJ9XX0se1wiZmVhdHVyZVR5cGVcIjpcImFsbFwiLFwiZWxlbWVudFR5cGVcIjpcImxhYmVscy50ZXh0LmZpbGxcIixcInN0eWxlcnNcIjpbe1wic2F0dXJhdGlvblwiOjM2fSx7XCJjb2xvclwiOlwiIzAwMDAwMFwifSx7XCJsaWdodG5lc3NcIjo0MH0se1widmlzaWJpbGl0eVwiOlwib2ZmXCJ9XX0se1wiZmVhdHVyZVR5cGVcIjpcImFsbFwiLFwiZWxlbWVudFR5cGVcIjpcImxhYmVscy50ZXh0LnN0cm9rZVwiLFwic3R5bGVyc1wiOlt7XCJ2aXNpYmlsaXR5XCI6XCJvZmZcIn0se1wiY29sb3JcIjpcIiMwMDAwMDBcIn0se1wibGlnaHRuZXNzXCI6MTZ9XX0se1wiZmVhdHVyZVR5cGVcIjpcImFsbFwiLFwiZWxlbWVudFR5cGVcIjpcImxhYmVscy5pY29uXCIsXCJzdHlsZXJzXCI6W3tcInZpc2liaWxpdHlcIjpcIm9mZlwifV19LHtcImZlYXR1cmVUeXBlXCI6XCJhZG1pbmlzdHJhdGl2ZVwiLFwiZWxlbWVudFR5cGVcIjpcImdlb21ldHJ5LmZpbGxcIixcInN0eWxlcnNcIjpbe1wiY29sb3JcIjpcIiMwMDAwMDBcIn0se1wibGlnaHRuZXNzXCI6MjB9XX0se1wiZmVhdHVyZVR5cGVcIjpcImFkbWluaXN0cmF0aXZlXCIsXCJlbGVtZW50VHlwZVwiOlwiZ2VvbWV0cnkuc3Ryb2tlXCIsXCJzdHlsZXJzXCI6W3tcImNvbG9yXCI6XCIjMDAwMDAwXCJ9LHtcImxpZ2h0bmVzc1wiOjE3fSx7XCJ3ZWlnaHRcIjoxLjJ9XX0se1wiZmVhdHVyZVR5cGVcIjpcImxhbmRzY2FwZVwiLFwiZWxlbWVudFR5cGVcIjpcImdlb21ldHJ5XCIsXCJzdHlsZXJzXCI6W3tcImNvbG9yXCI6XCIjMDAwMDAwXCJ9LHtcImxpZ2h0bmVzc1wiOjIwfV19LHtcImZlYXR1cmVUeXBlXCI6XCJsYW5kc2NhcGVcIixcImVsZW1lbnRUeXBlXCI6XCJnZW9tZXRyeS5maWxsXCIsXCJzdHlsZXJzXCI6W3tcImNvbG9yXCI6XCIjNGQ2MDU5XCJ9XX0se1wiZmVhdHVyZVR5cGVcIjpcImxhbmRzY2FwZVwiLFwiZWxlbWVudFR5cGVcIjpcImdlb21ldHJ5LnN0cm9rZVwiLFwic3R5bGVyc1wiOlt7XCJjb2xvclwiOlwiIzRkNjA1OVwifV19LHtcImZlYXR1cmVUeXBlXCI6XCJsYW5kc2NhcGUubmF0dXJhbFwiLFwiZWxlbWVudFR5cGVcIjpcImdlb21ldHJ5LmZpbGxcIixcInN0eWxlcnNcIjpbe1wiY29sb3JcIjpcIiM0ZDYwNTlcIn1dfSx7XCJmZWF0dXJlVHlwZVwiOlwicG9pXCIsXCJlbGVtZW50VHlwZVwiOlwiZ2VvbWV0cnlcIixcInN0eWxlcnNcIjpbe1wibGlnaHRuZXNzXCI6MjF9XX0se1wiZmVhdHVyZVR5cGVcIjpcInBvaVwiLFwiZWxlbWVudFR5cGVcIjpcImdlb21ldHJ5LmZpbGxcIixcInN0eWxlcnNcIjpbe1wiY29sb3JcIjpcIiM0ZDYwNTlcIn1dfSx7XCJmZWF0dXJlVHlwZVwiOlwicG9pXCIsXCJlbGVtZW50VHlwZVwiOlwiZ2VvbWV0cnkuc3Ryb2tlXCIsXCJzdHlsZXJzXCI6W3tcImNvbG9yXCI6XCIjNGQ2MDU5XCJ9XX0se1wiZmVhdHVyZVR5cGVcIjpcInJvYWRcIixcImVsZW1lbnRUeXBlXCI6XCJnZW9tZXRyeVwiLFwic3R5bGVyc1wiOlt7XCJ2aXNpYmlsaXR5XCI6XCJvblwifSx7XCJjb2xvclwiOlwiIzdmOGQ4OVwifV19LHtcImZlYXR1cmVUeXBlXCI6XCJyb2FkXCIsXCJlbGVtZW50VHlwZVwiOlwiZ2VvbWV0cnkuZmlsbFwiLFwic3R5bGVyc1wiOlt7XCJjb2xvclwiOlwiIzdmOGQ4OVwifV19LHtcImZlYXR1cmVUeXBlXCI6XCJyb2FkLmhpZ2h3YXlcIixcImVsZW1lbnRUeXBlXCI6XCJnZW9tZXRyeS5maWxsXCIsXCJzdHlsZXJzXCI6W3tcImNvbG9yXCI6XCIjN2Y4ZDg5XCJ9LHtcImxpZ2h0bmVzc1wiOjE3fV19LHtcImZlYXR1cmVUeXBlXCI6XCJyb2FkLmhpZ2h3YXlcIixcImVsZW1lbnRUeXBlXCI6XCJnZW9tZXRyeS5zdHJva2VcIixcInN0eWxlcnNcIjpbe1wiY29sb3JcIjpcIiM3ZjhkODlcIn0se1wibGlnaHRuZXNzXCI6Mjl9LHtcIndlaWdodFwiOjAuMn1dfSx7XCJmZWF0dXJlVHlwZVwiOlwicm9hZC5hcnRlcmlhbFwiLFwiZWxlbWVudFR5cGVcIjpcImdlb21ldHJ5XCIsXCJzdHlsZXJzXCI6W3tcImNvbG9yXCI6XCIjMDAwMDAwXCJ9LHtcImxpZ2h0bmVzc1wiOjE4fV19LHtcImZlYXR1cmVUeXBlXCI6XCJyb2FkLmFydGVyaWFsXCIsXCJlbGVtZW50VHlwZVwiOlwiZ2VvbWV0cnkuZmlsbFwiLFwic3R5bGVyc1wiOlt7XCJjb2xvclwiOlwiIzdmOGQ4OVwifV19LHtcImZlYXR1cmVUeXBlXCI6XCJyb2FkLmFydGVyaWFsXCIsXCJlbGVtZW50VHlwZVwiOlwiZ2VvbWV0cnkuc3Ryb2tlXCIsXCJzdHlsZXJzXCI6W3tcImNvbG9yXCI6XCIjN2Y4ZDg5XCJ9XX0se1wiZmVhdHVyZVR5cGVcIjpcInJvYWQubG9jYWxcIixcImVsZW1lbnRUeXBlXCI6XCJnZW9tZXRyeVwiLFwic3R5bGVyc1wiOlt7XCJjb2xvclwiOlwiIzAwMDAwMFwifSx7XCJsaWdodG5lc3NcIjoxNn1dfSx7XCJmZWF0dXJlVHlwZVwiOlwicm9hZC5sb2NhbFwiLFwiZWxlbWVudFR5cGVcIjpcImdlb21ldHJ5LmZpbGxcIixcInN0eWxlcnNcIjpbe1wiY29sb3JcIjpcIiM3ZjhkODlcIn1dfSx7XCJmZWF0dXJlVHlwZVwiOlwicm9hZC5sb2NhbFwiLFwiZWxlbWVudFR5cGVcIjpcImdlb21ldHJ5LnN0cm9rZVwiLFwic3R5bGVyc1wiOlt7XCJjb2xvclwiOlwiIzdmOGQ4OVwifV19LHtcImZlYXR1cmVUeXBlXCI6XCJ0cmFuc2l0XCIsXCJlbGVtZW50VHlwZVwiOlwiZ2VvbWV0cnlcIixcInN0eWxlcnNcIjpbe1wiY29sb3JcIjpcIiMwMDAwMDBcIn0se1wibGlnaHRuZXNzXCI6MTl9XX0se1wiZmVhdHVyZVR5cGVcIjpcIndhdGVyXCIsXCJlbGVtZW50VHlwZVwiOlwiYWxsXCIsXCJzdHlsZXJzXCI6W3tcImNvbG9yXCI6XCIjMmIzNjM4XCJ9LHtcInZpc2liaWxpdHlcIjpcIm9uXCJ9XX0se1wiZmVhdHVyZVR5cGVcIjpcIndhdGVyXCIsXCJlbGVtZW50VHlwZVwiOlwiZ2VvbWV0cnlcIixcInN0eWxlcnNcIjpbe1wiY29sb3JcIjpcIiMyYjM2MzhcIn0se1wibGlnaHRuZXNzXCI6MTd9XX0se1wiZmVhdHVyZVR5cGVcIjpcIndhdGVyXCIsXCJlbGVtZW50VHlwZVwiOlwiZ2VvbWV0cnkuZmlsbFwiLFwic3R5bGVyc1wiOlt7XCJjb2xvclwiOlwiIzI0MjgyYlwifV19LHtcImZlYXR1cmVUeXBlXCI6XCJ3YXRlclwiLFwiZWxlbWVudFR5cGVcIjpcImdlb21ldHJ5LnN0cm9rZVwiLFwic3R5bGVyc1wiOlt7XCJjb2xvclwiOlwiIzI0MjgyYlwifV19LHtcImZlYXR1cmVUeXBlXCI6XCJ3YXRlclwiLFwiZWxlbWVudFR5cGVcIjpcImxhYmVsc1wiLFwic3R5bGVyc1wiOlt7XCJ2aXNpYmlsaXR5XCI6XCJvZmZcIn1dfSx7XCJmZWF0dXJlVHlwZVwiOlwid2F0ZXJcIixcImVsZW1lbnRUeXBlXCI6XCJsYWJlbHMudGV4dFwiLFwic3R5bGVyc1wiOlt7XCJ2aXNpYmlsaXR5XCI6XCJvZmZcIn1dfSx7XCJmZWF0dXJlVHlwZVwiOlwid2F0ZXJcIixcImVsZW1lbnRUeXBlXCI6XCJsYWJlbHMudGV4dC5maWxsXCIsXCJzdHlsZXJzXCI6W3tcInZpc2liaWxpdHlcIjpcIm9mZlwifV19LHtcImZlYXR1cmVUeXBlXCI6XCJ3YXRlclwiLFwiZWxlbWVudFR5cGVcIjpcImxhYmVscy50ZXh0LnN0cm9rZVwiLFwic3R5bGVyc1wiOlt7XCJ2aXNpYmlsaXR5XCI6XCJvZmZcIn1dfSx7XCJmZWF0dXJlVHlwZVwiOlwid2F0ZXJcIixcImVsZW1lbnRUeXBlXCI6XCJsYWJlbHMuaWNvblwiLFwic3R5bGVyc1wiOlt7XCJ2aXNpYmlsaXR5XCI6XCJvZmZcIn1dfV07XG5NYXBzLnNldHVwR29vZ2xlTWFwc0FwaSggWydtYXAnXSwgeyBcblx0c3R5bGU6IHNuYXp6eVN0eWxlLFxuXHR6b29tOiAxOCxcblx0aWNvbiA6IHtcblx0XHRpbWc6IGAke1dQLnRlbXBsYXRlVXJsfS9pbWFnZXMvbWFya2VyX2FsdC5wbmdgXG5cdH1cbn0pO1xuXG5vYmplY3RGaXRJbWFnZXMoKTtcblxuTmF2LmluaXQoKTtcblxuXG5jb25zdCBzdGRfc2xpZGVycyA9IFsuLi5kb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcuc3RhbmRhcmQtc2xpZGVyJyldO1xuXG5pZiAoIHN0ZF9zbGlkZXJzICkge1xuXHRzdGRfc2xpZGVycy5mb3JFYWNoKCAoIHMgKSA9PiB7XG5cdFx0Y29uc3Qgc2xpZGVyID0gbmV3IEZsaWNraXR5KCBzLCB7XG5cdFx0XHRjZWxsQWxpZ246ICdsZWZ0Jyxcblx0XHRcdHdyYXBBcm91bmQ6IHRydWUsXG5cdFx0XHRpbWFnZXNMb2FkZWQ6IHRydWUsXG5cdFx0XHR3YXRjaENTUzogdHJ1ZSxcblx0XHRcdGNvbnRhaW46IHRydWVcblx0XHR9KTtcblx0fSk7XG59XG4iXSwibmFtZXMiOlsiZ2xvYmFsIiwiY2xhc3NvZiIsIkluZGV4ZWRPYmplY3QiLCJkb2N1bWVudCIsIkRFU0NSSVBUT1JTIiwiY3JlYXRlRWxlbWVudCIsIklFOF9ET01fREVGSU5FIiwicHJvcGVydHlJc0VudW1lcmFibGVNb2R1bGUiLCJkZWZpbmVQcm9wZXJ0eU1vZHVsZSIsInN0b3JlIiwibmF0aXZlRnVuY3Rpb25Ub1N0cmluZyIsIldlYWtNYXAiLCJoYXMiLCJOQVRJVkVfV0VBS19NQVAiLCJvYmplY3RIYXMiLCJJbnRlcm5hbFN0YXRlTW9kdWxlIiwicmVxdWlyZSQkMCIsIm1pbiIsImhpZGRlbktleXMiLCJpbnRlcm5hbE9iamVjdEtleXMiLCJnZXRPd25Qcm9wZXJ0eU5hbWVzTW9kdWxlIiwiZ2V0T3duUHJvcGVydHlTeW1ib2xzTW9kdWxlIiwiZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yTW9kdWxlIiwiZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yIiwiaXNGb3JjZWQiLCJhRnVuY3Rpb24iLCJTeW1ib2wiLCJOQVRJVkVfU1lNQk9MIiwiY3JlYXRlTWV0aG9kIiwiYmluZCIsIiQiLCJmb3JFYWNoIiwiRE9NSXRlcmFibGVzIiwidGhpcyIsInJlcXVpcmUkJDEiLCJyZXF1aXJlJCQyIiwicmVxdWlyZSQkMyIsInJlcXVpcmUkJDQiLCJyZXF1aXJlJCQ1IiwicmVxdWlyZSQkNiIsIl90b0NvbnN1bWFibGVBcnJheSIsImJ1cmdlciIsInF1ZXJ5U2VsZWN0b3IiLCJuYXZfdGFyZ2V0IiwidG9nZ2xlUmVzcG9uc2l2ZU1lbnUiLCJJU19OQVZfT1BFTiIsImJvZHkiLCJjbGFzc0xpc3QiLCJjb250YWlucyIsImZsb2F0aW5nTmF2IiwiY2xvc2VOYXYiLCJvcGVuTmF2IiwiYWRkIiwiZGlzYWJsZUJvZHlTY3JvbGwiLCJyZW1vdmUiLCJlbmFibGVCb2R5U2Nyb2xsIiwiaW5pdCIsImFkZEV2ZW50TGlzdGVuZXIiLCJzZXRQcm90b3R5cGVPZiIsImRlZmluZVByb3BlcnRpZXMiLCJjcmVhdGUiLCJrZXlzIiwiaW5pdE1hcCIsIm1hcElkIiwib3B0aW9ucyIsImNhbGxiYWNrIiwiZ2V0RWxlbWVudEJ5SWQiLCJkZWZhdWx0cyIsImxhdCIsIk51bWJlciIsImxuZyIsInN0eWxlIiwiem9vbSIsImxvY2F0aW9uIiwiZGF0YXNldCIsImNvbnNvbGUiLCJ3YXJuIiwiaWNvbiIsInVybCIsImltZyIsIldQIiwidGVtcGxhdGVVcmwiLCJzaXplIiwiZ29vZ2xlIiwibWFwcyIsIlNpemUiLCJhbmNob3IiLCJQb2ludCIsInNjYWxlZFNpemUiLCJzdmdJY29uIiwicGF0aCIsImZpbGxDb2xvciIsImZpbGxPcGFjaXR5Iiwic3Ryb2tlV2VpZ2h0Iiwic2NhbGUiLCJtYXAiLCJNYXAiLCJ6b29tQ29udHJvbCIsIm1hcFR5cGVDb250cm9sIiwic2NhbGVDb250cm9sIiwic3RyZWV0Vmlld0NvbnRyb2wiLCJyb3RhdGVDb250cm9sIiwiZnVsbHNjcmVlbkNvbnRyb2wiLCJjZW50ZXIiLCJzdHlsZXMiLCJtYXJrZXIiLCJNYXJrZXIiLCJwb3NpdGlvbiIsImxvYWRTY3JpcHQiLCJjb21wbGV0ZUNhbGxiYWNrIiwic2NyaXB0IiwiZG9uZSIsImhlYWQiLCJnZXRFbGVtZW50c0J5VGFnTmFtZSIsInNyYyIsIm9ubG9hZCIsIm9ucmVhZHlzdGF0ZWNoYW5nZSIsInJlYWR5U3RhdGUiLCJyZW1vdmVDaGlsZCIsImFwcGVuZENoaWxkIiwic2V0dXBHb29nbGVNYXBzQXBpIiwibWFwc0FycmF5IiwibWFwRWwiLCJwcm9jZXNzTWFwcyIsInBhbk1hcCIsInBhbkJ5IiwiQXJyYXkiLCJpc0FycmF5IiwiZXJyb3IiLCJtIiwic25henp5U3R5bGUiLCJNYXBzIiwib2JqZWN0Rml0SW1hZ2VzIiwiTmF2Iiwic3RkX3NsaWRlcnMiLCJxdWVyeVNlbGVjdG9yQWxsIiwicyIsInNsaWRlciIsIkZsaWNraXR5IiwiY2VsbEFsaWduIiwid3JhcEFyb3VuZCIsImltYWdlc0xvYWRlZCIsIndhdGNoQ1NTIiwiY29udGFpbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O0NBQUEsSUFBSSxLQUFLLEdBQUcsVUFBVSxFQUFFLEVBQUU7R0FDeEIsT0FBTyxFQUFFLElBQUksRUFBRSxDQUFDLElBQUksSUFBSSxJQUFJLElBQUksRUFBRSxDQUFDO0VBQ3BDLENBQUM7OztDQUdGLFlBQWM7O0dBRVosS0FBSyxDQUFDLE9BQU8sVUFBVSxJQUFJLFFBQVEsSUFBSSxVQUFVLENBQUM7R0FDbEQsS0FBSyxDQUFDLE9BQU8sTUFBTSxJQUFJLFFBQVEsSUFBSSxNQUFNLENBQUM7R0FDMUMsS0FBSyxDQUFDLE9BQU8sSUFBSSxJQUFJLFFBQVEsSUFBSSxJQUFJLENBQUM7R0FDdEMsS0FBSyxDQUFDLE9BQU9BLGNBQU0sSUFBSSxRQUFRLElBQUlBLGNBQU0sQ0FBQzs7R0FFMUMsUUFBUSxDQUFDLGFBQWEsQ0FBQyxFQUFFLENBQUM7O0NDWjVCLFNB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
