/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./node_modules/immutable/dist/immutable.es.js":
/*!*****************************************************!*\
  !*** ./node_modules/immutable/dist/immutable.es.js ***!
  \*****************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Collection": () => (/* binding */ Collection),
/* harmony export */   "Iterable": () => (/* binding */ Iterable),
/* harmony export */   "List": () => (/* binding */ List),
/* harmony export */   "Map": () => (/* binding */ Map),
/* harmony export */   "OrderedMap": () => (/* binding */ OrderedMap),
/* harmony export */   "OrderedSet": () => (/* binding */ OrderedSet),
/* harmony export */   "Range": () => (/* binding */ Range),
/* harmony export */   "Record": () => (/* binding */ Record),
/* harmony export */   "Repeat": () => (/* binding */ Repeat),
/* harmony export */   "Seq": () => (/* binding */ Seq),
/* harmony export */   "Set": () => (/* binding */ Set),
/* harmony export */   "Stack": () => (/* binding */ Stack),
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__),
/* harmony export */   "fromJS": () => (/* binding */ fromJS),
/* harmony export */   "get": () => (/* binding */ get),
/* harmony export */   "getIn": () => (/* binding */ getIn$1),
/* harmony export */   "has": () => (/* binding */ has),
/* harmony export */   "hasIn": () => (/* binding */ hasIn$1),
/* harmony export */   "hash": () => (/* binding */ hash),
/* harmony export */   "is": () => (/* binding */ is),
/* harmony export */   "isAssociative": () => (/* binding */ isAssociative),
/* harmony export */   "isCollection": () => (/* binding */ isCollection),
/* harmony export */   "isImmutable": () => (/* binding */ isImmutable),
/* harmony export */   "isIndexed": () => (/* binding */ isIndexed),
/* harmony export */   "isKeyed": () => (/* binding */ isKeyed),
/* harmony export */   "isList": () => (/* binding */ isList),
/* harmony export */   "isMap": () => (/* binding */ isMap),
/* harmony export */   "isOrdered": () => (/* binding */ isOrdered),
/* harmony export */   "isOrderedMap": () => (/* binding */ isOrderedMap),
/* harmony export */   "isOrderedSet": () => (/* binding */ isOrderedSet),
/* harmony export */   "isPlainObject": () => (/* binding */ isPlainObject),
/* harmony export */   "isRecord": () => (/* binding */ isRecord),
/* harmony export */   "isSeq": () => (/* binding */ isSeq),
/* harmony export */   "isSet": () => (/* binding */ isSet),
/* harmony export */   "isStack": () => (/* binding */ isStack),
/* harmony export */   "isValueObject": () => (/* binding */ isValueObject),
/* harmony export */   "merge": () => (/* binding */ merge),
/* harmony export */   "mergeDeep": () => (/* binding */ mergeDeep$1),
/* harmony export */   "mergeDeepWith": () => (/* binding */ mergeDeepWith$1),
/* harmony export */   "mergeWith": () => (/* binding */ mergeWith),
/* harmony export */   "remove": () => (/* binding */ remove),
/* harmony export */   "removeIn": () => (/* binding */ removeIn),
/* harmony export */   "set": () => (/* binding */ set),
/* harmony export */   "setIn": () => (/* binding */ setIn$1),
/* harmony export */   "update": () => (/* binding */ update$1),
/* harmony export */   "updateIn": () => (/* binding */ updateIn$1),
/* harmony export */   "version": () => (/* binding */ version)
/* harmony export */ });
/**
 * MIT License
 * 
 * Copyright (c) 2014-present, Lee Byron and other contributors.
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
var DELETE = 'delete';

// Constants describing the size of trie nodes.
var SHIFT = 5; // Resulted in best performance after ______?
var SIZE = 1 << SHIFT;
var MASK = SIZE - 1;

// A consistent shared value representing "not set" which equals nothing other
// than itself, and nothing that could be provided externally.
var NOT_SET = {};

// Boolean references, Rough equivalent of `bool &`.
function MakeRef() {
  return { value: false };
}

function SetRef(ref) {
  if (ref) {
    ref.value = true;
  }
}

// A function which returns a value representing an "owner" for transient writes
// to tries. The return value will only ever equal itself, and will not equal
// the return of any subsequent call of this function.
function OwnerID() {}

function ensureSize(iter) {
  if (iter.size === undefined) {
    iter.size = iter.__iterate(returnTrue);
  }
  return iter.size;
}

function wrapIndex(iter, index) {
  // This implements "is array index" which the ECMAString spec defines as:
  //
  //     A String property name P is an array index if and only if
  //     ToString(ToUint32(P)) is equal to P and ToUint32(P) is not equal
  //     to 2^32−1.
  //
  // http://www.ecma-international.org/ecma-262/6.0/#sec-array-exotic-objects
  if (typeof index !== 'number') {
    var uint32Index = index >>> 0; // N >>> 0 is shorthand for ToUint32
    if ('' + uint32Index !== index || uint32Index === 4294967295) {
      return NaN;
    }
    index = uint32Index;
  }
  return index < 0 ? ensureSize(iter) + index : index;
}

function returnTrue() {
  return true;
}

function wholeSlice(begin, end, size) {
  return (
    ((begin === 0 && !isNeg(begin)) ||
      (size !== undefined && begin <= -size)) &&
    (end === undefined || (size !== undefined && end >= size))
  );
}

function resolveBegin(begin, size) {
  return resolveIndex(begin, size, 0);
}

function resolveEnd(end, size) {
  return resolveIndex(end, size, size);
}

function resolveIndex(index, size, defaultIndex) {
  // Sanitize indices using this shorthand for ToInt32(argument)
  // http://www.ecma-international.org/ecma-262/6.0/#sec-toint32
  return index === undefined
    ? defaultIndex
    : isNeg(index)
    ? size === Infinity
      ? size
      : Math.max(0, size + index) | 0
    : size === undefined || size === index
    ? index
    : Math.min(size, index) | 0;
}

function isNeg(value) {
  // Account for -0 which is negative, but not less than 0.
  return value < 0 || (value === 0 && 1 / value === -Infinity);
}

var IS_COLLECTION_SYMBOL = '@@__IMMUTABLE_ITERABLE__@@';

function isCollection(maybeCollection) {
  return Boolean(maybeCollection && maybeCollection[IS_COLLECTION_SYMBOL]);
}

var IS_KEYED_SYMBOL = '@@__IMMUTABLE_KEYED__@@';

function isKeyed(maybeKeyed) {
  return Boolean(maybeKeyed && maybeKeyed[IS_KEYED_SYMBOL]);
}

var IS_INDEXED_SYMBOL = '@@__IMMUTABLE_INDEXED__@@';

function isIndexed(maybeIndexed) {
  return Boolean(maybeIndexed && maybeIndexed[IS_INDEXED_SYMBOL]);
}

function isAssociative(maybeAssociative) {
  return isKeyed(maybeAssociative) || isIndexed(maybeAssociative);
}

var Collection = function Collection(value) {
  return isCollection(value) ? value : Seq(value);
};

var KeyedCollection = /*@__PURE__*/(function (Collection) {
  function KeyedCollection(value) {
    return isKeyed(value) ? value : KeyedSeq(value);
  }

  if ( Collection ) KeyedCollection.__proto__ = Collection;
  KeyedCollection.prototype = Object.create( Collection && Collection.prototype );
  KeyedCollection.prototype.constructor = KeyedCollection;

  return KeyedCollection;
}(Collection));

var IndexedCollection = /*@__PURE__*/(function (Collection) {
  function IndexedCollection(value) {
    return isIndexed(value) ? value : IndexedSeq(value);
  }

  if ( Collection ) IndexedCollection.__proto__ = Collection;
  IndexedCollection.prototype = Object.create( Collection && Collection.prototype );
  IndexedCollection.prototype.constructor = IndexedCollection;

  return IndexedCollection;
}(Collection));

var SetCollection = /*@__PURE__*/(function (Collection) {
  function SetCollection(value) {
    return isCollection(value) && !isAssociative(value) ? value : SetSeq(value);
  }

  if ( Collection ) SetCollection.__proto__ = Collection;
  SetCollection.prototype = Object.create( Collection && Collection.prototype );
  SetCollection.prototype.constructor = SetCollection;

  return SetCollection;
}(Collection));

Collection.Keyed = KeyedCollection;
Collection.Indexed = IndexedCollection;
Collection.Set = SetCollection;

var IS_SEQ_SYMBOL = '@@__IMMUTABLE_SEQ__@@';

function isSeq(maybeSeq) {
  return Boolean(maybeSeq && maybeSeq[IS_SEQ_SYMBOL]);
}

var IS_RECORD_SYMBOL = '@@__IMMUTABLE_RECORD__@@';

function isRecord(maybeRecord) {
  return Boolean(maybeRecord && maybeRecord[IS_RECORD_SYMBOL]);
}

function isImmutable(maybeImmutable) {
  return isCollection(maybeImmutable) || isRecord(maybeImmutable);
}

var IS_ORDERED_SYMBOL = '@@__IMMUTABLE_ORDERED__@@';

function isOrdered(maybeOrdered) {
  return Boolean(maybeOrdered && maybeOrdered[IS_ORDERED_SYMBOL]);
}

var ITERATE_KEYS = 0;
var ITERATE_VALUES = 1;
var ITERATE_ENTRIES = 2;

var REAL_ITERATOR_SYMBOL = typeof Symbol === 'function' && Symbol.iterator;
var FAUX_ITERATOR_SYMBOL = '@@iterator';

var ITERATOR_SYMBOL = REAL_ITERATOR_SYMBOL || FAUX_ITERATOR_SYMBOL;

var Iterator = function Iterator(next) {
  this.next = next;
};

Iterator.prototype.toString = function toString () {
  return '[Iterator]';
};

Iterator.KEYS = ITERATE_KEYS;
Iterator.VALUES = ITERATE_VALUES;
Iterator.ENTRIES = ITERATE_ENTRIES;

Iterator.prototype.inspect = Iterator.prototype.toSource = function () {
  return this.toString();
};
Iterator.prototype[ITERATOR_SYMBOL] = function () {
  return this;
};

function iteratorValue(type, k, v, iteratorResult) {
  var value = type === 0 ? k : type === 1 ? v : [k, v];
  iteratorResult
    ? (iteratorResult.value = value)
    : (iteratorResult = {
        value: value,
        done: false,
      });
  return iteratorResult;
}

function iteratorDone() {
  return { value: undefined, done: true };
}

function hasIterator(maybeIterable) {
  if (Array.isArray(maybeIterable)) {
    // IE11 trick as it does not support `Symbol.iterator`
    return true;
  }

  return !!getIteratorFn(maybeIterable);
}

function isIterator(maybeIterator) {
  return maybeIterator && typeof maybeIterator.next === 'function';
}

function getIterator(iterable) {
  var iteratorFn = getIteratorFn(iterable);
  return iteratorFn && iteratorFn.call(iterable);
}

function getIteratorFn(iterable) {
  var iteratorFn =
    iterable &&
    ((REAL_ITERATOR_SYMBOL && iterable[REAL_ITERATOR_SYMBOL]) ||
      iterable[FAUX_ITERATOR_SYMBOL]);
  if (typeof iteratorFn === 'function') {
    return iteratorFn;
  }
}

function isEntriesIterable(maybeIterable) {
  var iteratorFn = getIteratorFn(maybeIterable);
  return iteratorFn && iteratorFn === maybeIterable.entries;
}

function isKeysIterable(maybeIterable) {
  var iteratorFn = getIteratorFn(maybeIterable);
  return iteratorFn && iteratorFn === maybeIterable.keys;
}

var hasOwnProperty = Object.prototype.hasOwnProperty;

function isArrayLike(value) {
  if (Array.isArray(value) || typeof value === 'string') {
    return true;
  }

  return (
    value &&
    typeof value === 'object' &&
    Number.isInteger(value.length) &&
    value.length >= 0 &&
    (value.length === 0
      ? // Only {length: 0} is considered Array-like.
        Object.keys(value).length === 1
      : // An object is only Array-like if it has a property where the last value
        // in the array-like may be found (which could be undefined).
        value.hasOwnProperty(value.length - 1))
  );
}

var Seq = /*@__PURE__*/(function (Collection) {
  function Seq(value) {
    return value === undefined || value === null
      ? emptySequence()
      : isImmutable(value)
      ? value.toSeq()
      : seqFromValue(value);
  }

  if ( Collection ) Seq.__proto__ = Collection;
  Seq.prototype = Object.create( Collection && Collection.prototype );
  Seq.prototype.constructor = Seq;

  Seq.prototype.toSeq = function toSeq () {
    return this;
  };

  Seq.prototype.toString = function toString () {
    return this.__toString('Seq {', '}');
  };

  Seq.prototype.cacheResult = function cacheResult () {
    if (!this._cache && this.__iterateUncached) {
      this._cache = this.entrySeq().toArray();
      this.size = this._cache.length;
    }
    return this;
  };

  // abstract __iterateUncached(fn, reverse)

  Seq.prototype.__iterate = function __iterate (fn, reverse) {
    var cache = this._cache;
    if (cache) {
      var size = cache.length;
      var i = 0;
      while (i !== size) {
        var entry = cache[reverse ? size - ++i : i++];
        if (fn(entry[1], entry[0], this) === false) {
          break;
        }
      }
      return i;
    }
    return this.__iterateUncached(fn, reverse);
  };

  // abstract __iteratorUncached(type, reverse)

  Seq.prototype.__iterator = function __iterator (type, reverse) {
    var cache = this._cache;
    if (cache) {
      var size = cache.length;
      var i = 0;
      return new Iterator(function () {
        if (i === size) {
          return iteratorDone();
        }
        var entry = cache[reverse ? size - ++i : i++];
        return iteratorValue(type, entry[0], entry[1]);
      });
    }
    return this.__iteratorUncached(type, reverse);
  };

  return Seq;
}(Collection));

var KeyedSeq = /*@__PURE__*/(function (Seq) {
  function KeyedSeq(value) {
    return value === undefined || value === null
      ? emptySequence().toKeyedSeq()
      : isCollection(value)
      ? isKeyed(value)
        ? value.toSeq()
        : value.fromEntrySeq()
      : isRecord(value)
      ? value.toSeq()
      : keyedSeqFromValue(value);
  }

  if ( Seq ) KeyedSeq.__proto__ = Seq;
  KeyedSeq.prototype = Object.create( Seq && Seq.prototype );
  KeyedSeq.prototype.constructor = KeyedSeq;

  KeyedSeq.prototype.toKeyedSeq = function toKeyedSeq () {
    return this;
  };

  return KeyedSeq;
}(Seq));

var IndexedSeq = /*@__PURE__*/(function (Seq) {
  function IndexedSeq(value) {
    return value === undefined || value === null
      ? emptySequence()
      : isCollection(value)
      ? isKeyed(value)
        ? value.entrySeq()
        : value.toIndexedSeq()
      : isRecord(value)
      ? value.toSeq().entrySeq()
      : indexedSeqFromValue(value);
  }

  if ( Seq ) IndexedSeq.__proto__ = Seq;
  IndexedSeq.prototype = Object.create( Seq && Seq.prototype );
  IndexedSeq.prototype.constructor = IndexedSeq;

  IndexedSeq.of = function of (/*...values*/) {
    return IndexedSeq(arguments);
  };

  IndexedSeq.prototype.toIndexedSeq = function toIndexedSeq () {
    return this;
  };

  IndexedSeq.prototype.toString = function toString () {
    return this.__toString('Seq [', ']');
  };

  return IndexedSeq;
}(Seq));

var SetSeq = /*@__PURE__*/(function (Seq) {
  function SetSeq(value) {
    return (
      isCollection(value) && !isAssociative(value) ? value : IndexedSeq(value)
    ).toSetSeq();
  }

  if ( Seq ) SetSeq.__proto__ = Seq;
  SetSeq.prototype = Object.create( Seq && Seq.prototype );
  SetSeq.prototype.constructor = SetSeq;

  SetSeq.of = function of (/*...values*/) {
    return SetSeq(arguments);
  };

  SetSeq.prototype.toSetSeq = function toSetSeq () {
    return this;
  };

  return SetSeq;
}(Seq));

Seq.isSeq = isSeq;
Seq.Keyed = KeyedSeq;
Seq.Set = SetSeq;
Seq.Indexed = IndexedSeq;

Seq.prototype[IS_SEQ_SYMBOL] = true;

// #pragma Root Sequences

var ArraySeq = /*@__PURE__*/(function (IndexedSeq) {
  function ArraySeq(array) {
    this._array = array;
    this.size = array.length;
  }

  if ( IndexedSeq ) ArraySeq.__proto__ = IndexedSeq;
  ArraySeq.prototype = Object.create( IndexedSeq && IndexedSeq.prototype );
  ArraySeq.prototype.constructor = ArraySeq;

  ArraySeq.prototype.get = function get (index, notSetValue) {
    return this.has(index) ? this._array[wrapIndex(this, index)] : notSetValue;
  };

  ArraySeq.prototype.__iterate = function __iterate (fn, reverse) {
    var array = this._array;
    var size = array.length;
    var i = 0;
    while (i !== size) {
      var ii = reverse ? size - ++i : i++;
      if (fn(array[ii], ii, this) === false) {
        break;
      }
    }
    return i;
  };

  ArraySeq.prototype.__iterator = function __iterator (type, reverse) {
    var array = this._array;
    var size = array.length;
    var i = 0;
    return new Iterator(function () {
      if (i === size) {
        return iteratorDone();
      }
      var ii = reverse ? size - ++i : i++;
      return iteratorValue(type, ii, array[ii]);
    });
  };

  return ArraySeq;
}(IndexedSeq));

var ObjectSeq = /*@__PURE__*/(function (KeyedSeq) {
  function ObjectSeq(object) {
    var keys = Object.keys(object).concat(
      Object.getOwnPropertySymbols ? Object.getOwnPropertySymbols(object) : []
    );
    this._object = object;
    this._keys = keys;
    this.size = keys.length;
  }

  if ( KeyedSeq ) ObjectSeq.__proto__ = KeyedSeq;
  ObjectSeq.prototype = Object.create( KeyedSeq && KeyedSeq.prototype );
  ObjectSeq.prototype.constructor = ObjectSeq;

  ObjectSeq.prototype.get = function get (key, notSetValue) {
    if (notSetValue !== undefined && !this.has(key)) {
      return notSetValue;
    }
    return this._object[key];
  };

  ObjectSeq.prototype.has = function has (key) {
    return hasOwnProperty.call(this._object, key);
  };

  ObjectSeq.prototype.__iterate = function __iterate (fn, reverse) {
    var object = this._object;
    var keys = this._keys;
    var size = keys.length;
    var i = 0;
    while (i !== size) {
      var key = keys[reverse ? size - ++i : i++];
      if (fn(object[key], key, this) === false) {
        break;
      }
    }
    return i;
  };

  ObjectSeq.prototype.__iterator = function __iterator (type, reverse) {
    var object = this._object;
    var keys = this._keys;
    var size = keys.length;
    var i = 0;
    return new Iterator(function () {
      if (i === size) {
        return iteratorDone();
      }
      var key = keys[reverse ? size - ++i : i++];
      return iteratorValue(type, key, object[key]);
    });
  };

  return ObjectSeq;
}(KeyedSeq));
ObjectSeq.prototype[IS_ORDERED_SYMBOL] = true;

var CollectionSeq = /*@__PURE__*/(function (IndexedSeq) {
  function CollectionSeq(collection) {
    this._collection = collection;
    this.size = collection.length || collection.size;
  }

  if ( IndexedSeq ) CollectionSeq.__proto__ = IndexedSeq;
  CollectionSeq.prototype = Object.create( IndexedSeq && IndexedSeq.prototype );
  CollectionSeq.prototype.constructor = CollectionSeq;

  CollectionSeq.prototype.__iterateUncached = function __iterateUncached (fn, reverse) {
    if (reverse) {
      return this.cacheResult().__iterate(fn, reverse);
    }
    var collection = this._collection;
    var iterator = getIterator(collection);
    var iterations = 0;
    if (isIterator(iterator)) {
      var step;
      while (!(step = iterator.next()).done) {
        if (fn(step.value, iterations++, this) === false) {
          break;
        }
      }
    }
    return iterations;
  };

  CollectionSeq.prototype.__iteratorUncached = function __iteratorUncached (type, reverse) {
    if (reverse) {
      return this.cacheResult().__iterator(type, reverse);
    }
    var collection = this._collection;
    var iterator = getIterator(collection);
    if (!isIterator(iterator)) {
      return new Iterator(iteratorDone);
    }
    var iterations = 0;
    return new Iterator(function () {
      var step = iterator.next();
      return step.done ? step : iteratorValue(type, iterations++, step.value);
    });
  };

  return CollectionSeq;
}(IndexedSeq));

// # pragma Helper functions

var EMPTY_SEQ;

function emptySequence() {
  return EMPTY_SEQ || (EMPTY_SEQ = new ArraySeq([]));
}

function keyedSeqFromValue(value) {
  var seq = maybeIndexedSeqFromValue(value);
  if (seq) {
    return seq.fromEntrySeq();
  }
  if (typeof value === 'object') {
    return new ObjectSeq(value);
  }
  throw new TypeError(
    'Expected Array or collection object of [k, v] entries, or keyed object: ' +
      value
  );
}

function indexedSeqFromValue(value) {
  var seq = maybeIndexedSeqFromValue(value);
  if (seq) {
    return seq;
  }
  throw new TypeError(
    'Expected Array or collection object of values: ' + value
  );
}

function seqFromValue(value) {
  var seq = maybeIndexedSeqFromValue(value);
  if (seq) {
    return isEntriesIterable(value)
      ? seq.fromEntrySeq()
      : isKeysIterable(value)
      ? seq.toSetSeq()
      : seq;
  }
  if (typeof value === 'object') {
    return new ObjectSeq(value);
  }
  throw new TypeError(
    'Expected Array or collection object of values, or keyed object: ' + value
  );
}

function maybeIndexedSeqFromValue(value) {
  return isArrayLike(value)
    ? new ArraySeq(value)
    : hasIterator(value)
    ? new CollectionSeq(value)
    : undefined;
}

var IS_MAP_SYMBOL = '@@__IMMUTABLE_MAP__@@';

function isMap(maybeMap) {
  return Boolean(maybeMap && maybeMap[IS_MAP_SYMBOL]);
}

function isOrderedMap(maybeOrderedMap) {
  return isMap(maybeOrderedMap) && isOrdered(maybeOrderedMap);
}

function isValueObject(maybeValue) {
  return Boolean(
    maybeValue &&
      typeof maybeValue.equals === 'function' &&
      typeof maybeValue.hashCode === 'function'
  );
}

/**
 * An extension of the "same-value" algorithm as [described for use by ES6 Map
 * and Set](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map#Key_equality)
 *
 * NaN is considered the same as NaN, however -0 and 0 are considered the same
 * value, which is different from the algorithm described by
 * [`Object.is`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/is).
 *
 * This is extended further to allow Objects to describe the values they
 * represent, by way of `valueOf` or `equals` (and `hashCode`).
 *
 * Note: because of this extension, the key equality of Immutable.Map and the
 * value equality of Immutable.Set will differ from ES6 Map and Set.
 *
 * ### Defining custom values
 *
 * The easiest way to describe the value an object represents is by implementing
 * `valueOf`. For example, `Date` represents a value by returning a unix
 * timestamp for `valueOf`:
 *
 *     var date1 = new Date(1234567890000); // Fri Feb 13 2009 ...
 *     var date2 = new Date(1234567890000);
 *     date1.valueOf(); // 1234567890000
 *     assert( date1 !== date2 );
 *     assert( Immutable.is( date1, date2 ) );
 *
 * Note: overriding `valueOf` may have other implications if you use this object
 * where JavaScript expects a primitive, such as implicit string coercion.
 *
 * For more complex types, especially collections, implementing `valueOf` may
 * not be performant. An alternative is to implement `equals` and `hashCode`.
 *
 * `equals` takes another object, presumably of similar type, and returns true
 * if it is equal. Equality is symmetrical, so the same result should be
 * returned if this and the argument are flipped.
 *
 *     assert( a.equals(b) === b.equals(a) );
 *
 * `hashCode` returns a 32bit integer number representing the object which will
 * be used to determine how to store the value object in a Map or Set. You must
 * provide both or neither methods, one must not exist without the other.
 *
 * Also, an important relationship between these methods must be upheld: if two
 * values are equal, they *must* return the same hashCode. If the values are not
 * equal, they might have the same hashCode; this is called a hash collision,
 * and while undesirable for performance reasons, it is acceptable.
 *
 *     if (a.equals(b)) {
 *       assert( a.hashCode() === b.hashCode() );
 *     }
 *
 * All Immutable collections are Value Objects: they implement `equals()`
 * and `hashCode()`.
 */
function is(valueA, valueB) {
  if (valueA === valueB || (valueA !== valueA && valueB !== valueB)) {
    return true;
  }
  if (!valueA || !valueB) {
    return false;
  }
  if (
    typeof valueA.valueOf === 'function' &&
    typeof valueB.valueOf === 'function'
  ) {
    valueA = valueA.valueOf();
    valueB = valueB.valueOf();
    if (valueA === valueB || (valueA !== valueA && valueB !== valueB)) {
      return true;
    }
    if (!valueA || !valueB) {
      return false;
    }
  }
  return !!(
    isValueObject(valueA) &&
    isValueObject(valueB) &&
    valueA.equals(valueB)
  );
}

var imul =
  typeof Math.imul === 'function' && Math.imul(0xffffffff, 2) === -2
    ? Math.imul
    : function imul(a, b) {
        a |= 0; // int
        b |= 0; // int
        var c = a & 0xffff;
        var d = b & 0xffff;
        // Shift by 0 fixes the sign on the high part.
        return (c * d + ((((a >>> 16) * d + c * (b >>> 16)) << 16) >>> 0)) | 0; // int
      };

// v8 has an optimization for storing 31-bit signed numbers.
// Values which have either 00 or 11 as the high order bits qualify.
// This function drops the highest order bit in a signed number, maintaining
// the sign bit.
function smi(i32) {
  return ((i32 >>> 1) & 0x40000000) | (i32 & 0xbfffffff);
}

var defaultValueOf = Object.prototype.valueOf;

function hash(o) {
  if (o == null) {
    return hashNullish(o);
  }

  if (typeof o.hashCode === 'function') {
    // Drop any high bits from accidentally long hash codes.
    return smi(o.hashCode(o));
  }

  var v = valueOf(o);

  if (v == null) {
    return hashNullish(v);
  }

  switch (typeof v) {
    case 'boolean':
      // The hash values for built-in constants are a 1 value for each 5-byte
      // shift region expect for the first, which encodes the value. This
      // reduces the odds of a hash collision for these common values.
      return v ? 0x42108421 : 0x42108420;
    case 'number':
      return hashNumber(v);
    case 'string':
      return v.length > STRING_HASH_CACHE_MIN_STRLEN
        ? cachedHashString(v)
        : hashString(v);
    case 'object':
    case 'function':
      return hashJSObj(v);
    case 'symbol':
      return hashSymbol(v);
    default:
      if (typeof v.toString === 'function') {
        return hashString(v.toString());
      }
      throw new Error('Value type ' + typeof v + ' cannot be hashed.');
  }
}

function hashNullish(nullish) {
  return nullish === null ? 0x42108422 : /* undefined */ 0x42108423;
}

// Compress arbitrarily large numbers into smi hashes.
function hashNumber(n) {
  if (n !== n || n === Infinity) {
    return 0;
  }
  var hash = n | 0;
  if (hash !== n) {
    hash ^= n * 0xffffffff;
  }
  while (n > 0xffffffff) {
    n /= 0xffffffff;
    hash ^= n;
  }
  return smi(hash);
}

function cachedHashString(string) {
  var hashed = stringHashCache[string];
  if (hashed === undefined) {
    hashed = hashString(string);
    if (STRING_HASH_CACHE_SIZE === STRING_HASH_CACHE_MAX_SIZE) {
      STRING_HASH_CACHE_SIZE = 0;
      stringHashCache = {};
    }
    STRING_HASH_CACHE_SIZE++;
    stringHashCache[string] = hashed;
  }
  return hashed;
}

// http://jsperf.com/hashing-strings
function hashString(string) {
  // This is the hash from JVM
  // The hash code for a string is computed as
  // s[0] * 31 ^ (n - 1) + s[1] * 31 ^ (n - 2) + ... + s[n - 1],
  // where s[i] is the ith character of the string and n is the length of
  // the string. We "mod" the result to make it between 0 (inclusive) and 2^31
  // (exclusive) by dropping high bits.
  var hashed = 0;
  for (var ii = 0; ii < string.length; ii++) {
    hashed = (31 * hashed + string.charCodeAt(ii)) | 0;
  }
  return smi(hashed);
}

function hashSymbol(sym) {
  var hashed = symbolMap[sym];
  if (hashed !== undefined) {
    return hashed;
  }

  hashed = nextHash();

  symbolMap[sym] = hashed;

  return hashed;
}

function hashJSObj(obj) {
  var hashed;
  if (usingWeakMap) {
    hashed = weakMap.get(obj);
    if (hashed !== undefined) {
      return hashed;
    }
  }

  hashed = obj[UID_HASH_KEY];
  if (hashed !== undefined) {
    return hashed;
  }

  if (!canDefineProperty) {
    hashed = obj.propertyIsEnumerable && obj.propertyIsEnumerable[UID_HASH_KEY];
    if (hashed !== undefined) {
      return hashed;
    }

    hashed = getIENodeHash(obj);
    if (hashed !== undefined) {
      return hashed;
    }
  }

  hashed = nextHash();

  if (usingWeakMap) {
    weakMap.set(obj, hashed);
  } else if (isExtensible !== undefined && isExtensible(obj) === false) {
    throw new Error('Non-extensible objects are not allowed as keys.');
  } else if (canDefineProperty) {
    Object.defineProperty(obj, UID_HASH_KEY, {
      enumerable: false,
      configurable: false,
      writable: false,
      value: hashed,
    });
  } else if (
    obj.propertyIsEnumerable !== undefined &&
    obj.propertyIsEnumerable === obj.constructor.prototype.propertyIsEnumerable
  ) {
    // Since we can't define a non-enumerable property on the object
    // we'll hijack one of the less-used non-enumerable properties to
    // save our hash on it. Since this is a function it will not show up in
    // `JSON.stringify` which is what we want.
    obj.propertyIsEnumerable = function () {
      return this.constructor.prototype.propertyIsEnumerable.apply(
        this,
        arguments
      );
    };
    obj.propertyIsEnumerable[UID_HASH_KEY] = hashed;
  } else if (obj.nodeType !== undefined) {
    // At this point we couldn't get the IE `uniqueID` to use as a hash
    // and we couldn't use a non-enumerable property to exploit the
    // dontEnum bug so we simply add the `UID_HASH_KEY` on the node
    // itself.
    obj[UID_HASH_KEY] = hashed;
  } else {
    throw new Error('Unable to set a non-enumerable property on object.');
  }

  return hashed;
}

// Get references to ES5 object methods.
var isExtensible = Object.isExtensible;

// True if Object.defineProperty works as expected. IE8 fails this test.
var canDefineProperty = (function () {
  try {
    Object.defineProperty({}, '@', {});
    return true;
  } catch (e) {
    return false;
  }
})();

// IE has a `uniqueID` property on DOM nodes. We can construct the hash from it
// and avoid memory leaks from the IE cloneNode bug.
function getIENodeHash(node) {
  if (node && node.nodeType > 0) {
    switch (node.nodeType) {
      case 1: // Element
        return node.uniqueID;
      case 9: // Document
        return node.documentElement && node.documentElement.uniqueID;
    }
  }
}

function valueOf(obj) {
  return obj.valueOf !== defaultValueOf && typeof obj.valueOf === 'function'
    ? obj.valueOf(obj)
    : obj;
}

function nextHash() {
  var nextHash = ++_objHashUID;
  if (_objHashUID & 0x40000000) {
    _objHashUID = 0;
  }
  return nextHash;
}

// If possible, use a WeakMap.
var usingWeakMap = typeof WeakMap === 'function';
var weakMap;
if (usingWeakMap) {
  weakMap = new WeakMap();
}

var symbolMap = Object.create(null);

var _objHashUID = 0;

var UID_HASH_KEY = '__immutablehash__';
if (typeof Symbol === 'function') {
  UID_HASH_KEY = Symbol(UID_HASH_KEY);
}

var STRING_HASH_CACHE_MIN_STRLEN = 16;
var STRING_HASH_CACHE_MAX_SIZE = 255;
var STRING_HASH_CACHE_SIZE = 0;
var stringHashCache = {};

var ToKeyedSequence = /*@__PURE__*/(function (KeyedSeq) {
  function ToKeyedSequence(indexed, useKeys) {
    this._iter = indexed;
    this._useKeys = useKeys;
    this.size = indexed.size;
  }

  if ( KeyedSeq ) ToKeyedSequence.__proto__ = KeyedSeq;
  ToKeyedSequence.prototype = Object.create( KeyedSeq && KeyedSeq.prototype );
  ToKeyedSequence.prototype.constructor = ToKeyedSequence;

  ToKeyedSequence.prototype.get = function get (key, notSetValue) {
    return this._iter.get(key, notSetValue);
  };

  ToKeyedSequence.prototype.has = function has (key) {
    return this._iter.has(key);
  };

  ToKeyedSequence.prototype.valueSeq = function valueSeq () {
    return this._iter.valueSeq();
  };

  ToKeyedSequence.prototype.reverse = function reverse () {
    var this$1$1 = this;

    var reversedSequence = reverseFactory(this, true);
    if (!this._useKeys) {
      reversedSequence.valueSeq = function () { return this$1$1._iter.toSeq().reverse(); };
    }
    return reversedSequence;
  };

  ToKeyedSequence.prototype.map = function map (mapper, context) {
    var this$1$1 = this;

    var mappedSequence = mapFactory(this, mapper, context);
    if (!this._useKeys) {
      mappedSequence.valueSeq = function () { return this$1$1._iter.toSeq().map(mapper, context); };
    }
    return mappedSequence;
  };

  ToKeyedSequence.prototype.__iterate = function __iterate (fn, reverse) {
    var this$1$1 = this;

    return this._iter.__iterate(function (v, k) { return fn(v, k, this$1$1); }, reverse);
  };

  ToKeyedSequence.prototype.__iterator = function __iterator (type, reverse) {
    return this._iter.__iterator(type, reverse);
  };

  return ToKeyedSequence;
}(KeyedSeq));
ToKeyedSequence.prototype[IS_ORDERED_SYMBOL] = true;

var ToIndexedSequence = /*@__PURE__*/(function (IndexedSeq) {
  function ToIndexedSequence(iter) {
    this._iter = iter;
    this.size = iter.size;
  }

  if ( IndexedSeq ) ToIndexedSequence.__proto__ = IndexedSeq;
  ToIndexedSequence.prototype = Object.create( IndexedSeq && IndexedSeq.prototype );
  ToIndexedSequence.prototype.constructor = ToIndexedSequence;

  ToIndexedSequence.prototype.includes = function includes (value) {
    return this._iter.includes(value);
  };

  ToIndexedSequence.prototype.__iterate = function __iterate (fn, reverse) {
    var this$1$1 = this;

    var i = 0;
    reverse && ensureSize(this);
    return this._iter.__iterate(
      function (v) { return fn(v, reverse ? this$1$1.size - ++i : i++, this$1$1); },
      reverse
    );
  };

  ToIndexedSequence.prototype.__iterator = function __iterator (type, reverse) {
    var this$1$1 = this;

    var iterator = this._iter.__iterator(ITERATE_VALUES, reverse);
    var i = 0;
    reverse && ensureSize(this);
    return new Iterator(function () {
      var step = iterator.next();
      return step.done
        ? step
        : iteratorValue(
            type,
            reverse ? this$1$1.size - ++i : i++,
            step.value,
            step
          );
    });
  };

  return ToIndexedSequence;
}(IndexedSeq));

var ToSetSequence = /*@__PURE__*/(function (SetSeq) {
  function ToSetSequence(iter) {
    this._iter = iter;
    this.size = iter.size;
  }

  if ( SetSeq ) ToSetSequence.__proto__ = SetSeq;
  ToSetSequence.prototype = Object.create( SetSeq && SetSeq.prototype );
  ToSetSequence.prototype.constructor = ToSetSequence;

  ToSetSequence.prototype.has = function has (key) {
    return this._iter.includes(key);
  };

  ToSetSequence.prototype.__iterate = function __iterate (fn, reverse) {
    var this$1$1 = this;

    return this._iter.__iterate(function (v) { return fn(v, v, this$1$1); }, reverse);
  };

  ToSetSequence.prototype.__iterator = function __iterator (type, reverse) {
    var iterator = this._iter.__iterator(ITERATE_VALUES, reverse);
    return new Iterator(function () {
      var step = iterator.next();
      return step.done
        ? step
        : iteratorValue(type, step.value, step.value, step);
    });
  };

  return ToSetSequence;
}(SetSeq));

var FromEntriesSequence = /*@__PURE__*/(function (KeyedSeq) {
  function FromEntriesSequence(entries) {
    this._iter = entries;
    this.size = entries.size;
  }

  if ( KeyedSeq ) FromEntriesSequence.__proto__ = KeyedSeq;
  FromEntriesSequence.prototype = Object.create( KeyedSeq && KeyedSeq.prototype );
  FromEntriesSequence.prototype.constructor = FromEntriesSequence;

  FromEntriesSequence.prototype.entrySeq = function entrySeq () {
    return this._iter.toSeq();
  };

  FromEntriesSequence.prototype.__iterate = function __iterate (fn, reverse) {
    var this$1$1 = this;

    return this._iter.__iterate(function (entry) {
      // Check if entry exists first so array access doesn't throw for holes
      // in the parent iteration.
      if (entry) {
        validateEntry(entry);
        var indexedCollection = isCollection(entry);
        return fn(
          indexedCollection ? entry.get(1) : entry[1],
          indexedCollection ? entry.get(0) : entry[0],
          this$1$1
        );
      }
    }, reverse);
  };

  FromEntriesSequence.prototype.__iterator = function __iterator (type, reverse) {
    var iterator = this._iter.__iterator(ITERATE_VALUES, reverse);
    return new Iterator(function () {
      while (true) {
        var step = iterator.next();
        if (step.done) {
          return step;
        }
        var entry = step.value;
        // Check if entry exists first so array access doesn't throw for holes
        // in the parent iteration.
        if (entry) {
          validateEntry(entry);
          var indexedCollection = isCollection(entry);
          return iteratorValue(
            type,
            indexedCollection ? entry.get(0) : entry[0],
            indexedCollection ? entry.get(1) : entry[1],
            step
          );
        }
      }
    });
  };

  return FromEntriesSequence;
}(KeyedSeq));

ToIndexedSequence.prototype.cacheResult =
  ToKeyedSequence.prototype.cacheResult =
  ToSetSequence.prototype.cacheResult =
  FromEntriesSequence.prototype.cacheResult =
    cacheResultThrough;

function flipFactory(collection) {
  var flipSequence = makeSequence(collection);
  flipSequence._iter = collection;
  flipSequence.size = collection.size;
  flipSequence.flip = function () { return collection; };
  flipSequence.reverse = function () {
    var reversedSequence = collection.reverse.apply(this); // super.reverse()
    reversedSequence.flip = function () { return collection.reverse(); };
    return reversedSequence;
  };
  flipSequence.has = function (key) { return collection.includes(key); };
  flipSequence.includes = function (key) { return collection.has(key); };
  flipSequence.cacheResult = cacheResultThrough;
  flipSequence.__iterateUncached = function (fn, reverse) {
    var this$1$1 = this;

    return collection.__iterate(function (v, k) { return fn(k, v, this$1$1) !== false; }, reverse);
  };
  flipSequence.__iteratorUncached = function (type, reverse) {
    if (type === ITERATE_ENTRIES) {
      var iterator = collection.__iterator(type, reverse);
      return new Iterator(function () {
        var step = iterator.next();
        if (!step.done) {
          var k = step.value[0];
          step.value[0] = step.value[1];
          step.value[1] = k;
        }
        return step;
      });
    }
    return collection.__iterator(
      type === ITERATE_VALUES ? ITERATE_KEYS : ITERATE_VALUES,
      reverse
    );
  };
  return flipSequence;
}

function mapFactory(collection, mapper, context) {
  var mappedSequence = makeSequence(collection);
  mappedSequence.size = collection.size;
  mappedSequence.has = function (key) { return collection.has(key); };
  mappedSequence.get = function (key, notSetValue) {
    var v = collection.get(key, NOT_SET);
    return v === NOT_SET
      ? notSetValue
      : mapper.call(context, v, key, collection);
  };
  mappedSequence.__iterateUncached = function (fn, reverse) {
    var this$1$1 = this;

    return collection.__iterate(
      function (v, k, c) { return fn(mapper.call(context, v, k, c), k, this$1$1) !== false; },
      reverse
    );
  };
  mappedSequence.__iteratorUncached = function (type, reverse) {
    var iterator = collection.__iterator(ITERATE_ENTRIES, reverse);
    return new Iterator(function () {
      var step = iterator.next();
      if (step.done) {
        return step;
      }
      var entry = step.value;
      var key = entry[0];
      return iteratorValue(
        type,
        key,
        mapper.call(context, entry[1], key, collection),
        step
      );
    });
  };
  return mappedSequence;
}

function reverseFactory(collection, useKeys) {
  var this$1$1 = this;

  var reversedSequence = makeSequence(collection);
  reversedSequence._iter = collection;
  reversedSequence.size = collection.size;
  reversedSequence.reverse = function () { return collection; };
  if (collection.flip) {
    reversedSequence.flip = function () {
      var flipSequence = flipFactory(collection);
      flipSequence.reverse = function () { return collection.flip(); };
      return flipSequence;
    };
  }
  reversedSequence.get = function (key, notSetValue) { return collection.get(useKeys ? key : -1 - key, notSetValue); };
  reversedSequence.has = function (key) { return collection.has(useKeys ? key : -1 - key); };
  reversedSequence.includes = function (value) { return collection.includes(value); };
  reversedSequence.cacheResult = cacheResultThrough;
  reversedSequence.__iterate = function (fn, reverse) {
    var this$1$1 = this;

    var i = 0;
    reverse && ensureSize(collection);
    return collection.__iterate(
      function (v, k) { return fn(v, useKeys ? k : reverse ? this$1$1.size - ++i : i++, this$1$1); },
      !reverse
    );
  };
  reversedSequence.__iterator = function (type, reverse) {
    var i = 0;
    reverse && ensureSize(collection);
    var iterator = collection.__iterator(ITERATE_ENTRIES, !reverse);
    return new Iterator(function () {
      var step = iterator.next();
      if (step.done) {
        return step;
      }
      var entry = step.value;
      return iteratorValue(
        type,
        useKeys ? entry[0] : reverse ? this$1$1.size - ++i : i++,
        entry[1],
        step
      );
    });
  };
  return reversedSequence;
}

function filterFactory(collection, predicate, context, useKeys) {
  var filterSequence = makeSequence(collection);
  if (useKeys) {
    filterSequence.has = function (key) {
      var v = collection.get(key, NOT_SET);
      return v !== NOT_SET && !!predicate.call(context, v, key, collection);
    };
    filterSequence.get = function (key, notSetValue) {
      var v = collection.get(key, NOT_SET);
      return v !== NOT_SET && predicate.call(context, v, key, collection)
        ? v
        : notSetValue;
    };
  }
  filterSequence.__iterateUncached = function (fn, reverse) {
    var this$1$1 = this;

    var iterations = 0;
    collection.__iterate(function (v, k, c) {
      if (predicate.call(context, v, k, c)) {
        iterations++;
        return fn(v, useKeys ? k : iterations - 1, this$1$1);
      }
    }, reverse);
    return iterations;
  };
  filterSequence.__iteratorUncached = function (type, reverse) {
    var iterator = collection.__iterator(ITERATE_ENTRIES, reverse);
    var iterations = 0;
    return new Iterator(function () {
      while (true) {
        var step = iterator.next();
        if (step.done) {
          return step;
        }
        var entry = step.value;
        var key = entry[0];
        var value = entry[1];
        if (predicate.call(context, value, key, collection)) {
          return iteratorValue(type, useKeys ? key : iterations++, value, step);
        }
      }
    });
  };
  return filterSequence;
}

function countByFactory(collection, grouper, context) {
  var groups = Map().asMutable();
  collection.__iterate(function (v, k) {
    groups.update(grouper.call(context, v, k, collection), 0, function (a) { return a + 1; });
  });
  return groups.asImmutable();
}

function groupByFactory(collection, grouper, context) {
  var isKeyedIter = isKeyed(collection);
  var groups = (isOrdered(collection) ? OrderedMap() : Map()).asMutable();
  collection.__iterate(function (v, k) {
    groups.update(
      grouper.call(context, v, k, collection),
      function (a) { return ((a = a || []), a.push(isKeyedIter ? [k, v] : v), a); }
    );
  });
  var coerce = collectionClass(collection);
  return groups.map(function (arr) { return reify(collection, coerce(arr)); }).asImmutable();
}

function sliceFactory(collection, begin, end, useKeys) {
  var originalSize = collection.size;

  if (wholeSlice(begin, end, originalSize)) {
    return collection;
  }

  var resolvedBegin = resolveBegin(begin, originalSize);
  var resolvedEnd = resolveEnd(end, originalSize);

  // begin or end will be NaN if they were provided as negative numbers and
  // this collection's size is unknown. In that case, cache first so there is
  // a known size and these do not resolve to NaN.
  if (resolvedBegin !== resolvedBegin || resolvedEnd !== resolvedEnd) {
    return sliceFactory(collection.toSeq().cacheResult(), begin, end, useKeys);
  }

  // Note: resolvedEnd is undefined when the original sequence's length is
  // unknown and this slice did not supply an end and should contain all
  // elements after resolvedBegin.
  // In that case, resolvedSize will be NaN and sliceSize will remain undefined.
  var resolvedSize = resolvedEnd - resolvedBegin;
  var sliceSize;
  if (resolvedSize === resolvedSize) {
    sliceSize = resolvedSize < 0 ? 0 : resolvedSize;
  }

  var sliceSeq = makeSequence(collection);

  // If collection.size is undefined, the size of the realized sliceSeq is
  // unknown at this point unless the number of items to slice is 0
  sliceSeq.size =
    sliceSize === 0 ? sliceSize : (collection.size && sliceSize) || undefined;

  if (!useKeys && isSeq(collection) && sliceSize >= 0) {
    sliceSeq.get = function (index, notSetValue) {
      index = wrapIndex(this, index);
      return index >= 0 && index < sliceSize
        ? collection.get(index + resolvedBegin, notSetValue)
        : notSetValue;
    };
  }

  sliceSeq.__iterateUncached = function (fn, reverse) {
    var this$1$1 = this;

    if (sliceSize === 0) {
      return 0;
    }
    if (reverse) {
      return this.cacheResult().__iterate(fn, reverse);
    }
    var skipped = 0;
    var isSkipping = true;
    var iterations = 0;
    collection.__iterate(function (v, k) {
      if (!(isSkipping && (isSkipping = skipped++ < resolvedBegin))) {
        iterations++;
        return (
          fn(v, useKeys ? k : iterations - 1, this$1$1) !== false &&
          iterations !== sliceSize
        );
      }
    });
    return iterations;
  };

  sliceSeq.__iteratorUncached = function (type, reverse) {
    if (sliceSize !== 0 && reverse) {
      return this.cacheResult().__iterator(type, reverse);
    }
    // Don't bother instantiating parent iterator if taking 0.
    if (sliceSize === 0) {
      return new Iterator(iteratorDone);
    }
    var iterator = collection.__iterator(type, reverse);
    var skipped = 0;
    var iterations = 0;
    return new Iterator(function () {
      while (skipped++ < resolvedBegin) {
        iterator.next();
      }
      if (++iterations > sliceSize) {
        return iteratorDone();
      }
      var step = iterator.next();
      if (useKeys || type === ITERATE_VALUES || step.done) {
        return step;
      }
      if (type === ITERATE_KEYS) {
        return iteratorValue(type, iterations - 1, undefined, step);
      }
      return iteratorValue(type, iterations - 1, step.value[1], step);
    });
  };

  return sliceSeq;
}

function takeWhileFactory(collection, predicate, context) {
  var takeSequence = makeSequence(collection);
  takeSequence.__iterateUncached = function (fn, reverse) {
    var this$1$1 = this;

    if (reverse) {
      return this.cacheResult().__iterate(fn, reverse);
    }
    var iterations = 0;
    collection.__iterate(
      function (v, k, c) { return predicate.call(context, v, k, c) && ++iterations && fn(v, k, this$1$1); }
    );
    return iterations;
  };
  takeSequence.__iteratorUncached = function (type, reverse) {
    var this$1$1 = this;

    if (reverse) {
      return this.cacheResult().__iterator(type, reverse);
    }
    var iterator = collection.__iterator(ITERATE_ENTRIES, reverse);
    var iterating = true;
    return new Iterator(function () {
      if (!iterating) {
        return iteratorDone();
      }
      var step = iterator.next();
      if (step.done) {
        return step;
      }
      var entry = step.value;
      var k = entry[0];
      var v = entry[1];
      if (!predicate.call(context, v, k, this$1$1)) {
        iterating = false;
        return iteratorDone();
      }
      return type === ITERATE_ENTRIES ? step : iteratorValue(type, k, v, step);
    });
  };
  return takeSequence;
}

function skipWhileFactory(collection, predicate, context, useKeys) {
  var skipSequence = makeSequence(collection);
  skipSequence.__iterateUncached = function (fn, reverse) {
    var this$1$1 = this;

    if (reverse) {
      return this.cacheResult().__iterate(fn, reverse);
    }
    var isSkipping = true;
    var iterations = 0;
    collection.__iterate(function (v, k, c) {
      if (!(isSkipping && (isSkipping = predicate.call(context, v, k, c)))) {
        iterations++;
        return fn(v, useKeys ? k : iterations - 1, this$1$1);
      }
    });
    return iterations;
  };
  skipSequence.__iteratorUncached = function (type, reverse) {
    var this$1$1 = this;

    if (reverse) {
      return this.cacheResult().__iterator(type, reverse);
    }
    var iterator = collection.__iterator(ITERATE_ENTRIES, reverse);
    var skipping = true;
    var iterations = 0;
    return new Iterator(function () {
      var step;
      var k;
      var v;
      do {
        step = iterator.next();
        if (step.done) {
          if (useKeys || type === ITERATE_VALUES) {
            return step;
          }
          if (type === ITERATE_KEYS) {
            return iteratorValue(type, iterations++, undefined, step);
          }
          return iteratorValue(type, iterations++, step.value[1], step);
        }
        var entry = step.value;
        k = entry[0];
        v = entry[1];
        skipping && (skipping = predicate.call(context, v, k, this$1$1));
      } while (skipping);
      return type === ITERATE_ENTRIES ? step : iteratorValue(type, k, v, step);
    });
  };
  return skipSequence;
}

function concatFactory(collection, values) {
  var isKeyedCollection = isKeyed(collection);
  var iters = [collection]
    .concat(values)
    .map(function (v) {
      if (!isCollection(v)) {
        v = isKeyedCollection
          ? keyedSeqFromValue(v)
          : indexedSeqFromValue(Array.isArray(v) ? v : [v]);
      } else if (isKeyedCollection) {
        v = KeyedCollection(v);
      }
      return v;
    })
    .filter(function (v) { return v.size !== 0; });

  if (iters.length === 0) {
    return collection;
  }

  if (iters.length === 1) {
    var singleton = iters[0];
    if (
      singleton === collection ||
      (isKeyedCollection && isKeyed(singleton)) ||
      (isIndexed(collection) && isIndexed(singleton))
    ) {
      return singleton;
    }
  }

  var concatSeq = new ArraySeq(iters);
  if (isKeyedCollection) {
    concatSeq = concatSeq.toKeyedSeq();
  } else if (!isIndexed(collection)) {
    concatSeq = concatSeq.toSetSeq();
  }
  concatSeq = concatSeq.flatten(true);
  concatSeq.size = iters.reduce(function (sum, seq) {
    if (sum !== undefined) {
      var size = seq.size;
      if (size !== undefined) {
        return sum + size;
      }
    }
  }, 0);
  return concatSeq;
}

function flattenFactory(collection, depth, useKeys) {
  var flatSequence = makeSequence(collection);
  flatSequence.__iterateUncached = function (fn, reverse) {
    if (reverse) {
      return this.cacheResult().__iterate(fn, reverse);
    }
    var iterations = 0;
    var stopped = false;
    function flatDeep(iter, currentDepth) {
      iter.__iterate(function (v, k) {
        if ((!depth || currentDepth < depth) && isCollection(v)) {
          flatDeep(v, currentDepth + 1);
        } else {
          iterations++;
          if (fn(v, useKeys ? k : iterations - 1, flatSequence) === false) {
            stopped = true;
          }
        }
        return !stopped;
      }, reverse);
    }
    flatDeep(collection, 0);
    return iterations;
  };
  flatSequence.__iteratorUncached = function (type, reverse) {
    if (reverse) {
      return this.cacheResult().__iterator(type, reverse);
    }
    var iterator = collection.__iterator(type, reverse);
    var stack = [];
    var iterations = 0;
    return new Iterator(function () {
      while (iterator) {
        var step = iterator.next();
        if (step.done !== false) {
          iterator = stack.pop();
          continue;
        }
        var v = step.value;
        if (type === ITERATE_ENTRIES) {
          v = v[1];
        }
        if ((!depth || stack.length < depth) && isCollection(v)) {
          stack.push(iterator);
          iterator = v.__iterator(type, reverse);
        } else {
          return useKeys ? step : iteratorValue(type, iterations++, v, step);
        }
      }
      return iteratorDone();
    });
  };
  return flatSequence;
}

function flatMapFactory(collection, mapper, context) {
  var coerce = collectionClass(collection);
  return collection
    .toSeq()
    .map(function (v, k) { return coerce(mapper.call(context, v, k, collection)); })
    .flatten(true);
}

function interposeFactory(collection, separator) {
  var interposedSequence = makeSequence(collection);
  interposedSequence.size = collection.size && collection.size * 2 - 1;
  interposedSequence.__iterateUncached = function (fn, reverse) {
    var this$1$1 = this;

    var iterations = 0;
    collection.__iterate(
      function (v) { return (!iterations || fn(separator, iterations++, this$1$1) !== false) &&
        fn(v, iterations++, this$1$1) !== false; },
      reverse
    );
    return iterations;
  };
  interposedSequence.__iteratorUncached = function (type, reverse) {
    var iterator = collection.__iterator(ITERATE_VALUES, reverse);
    var iterations = 0;
    var step;
    return new Iterator(function () {
      if (!step || iterations % 2) {
        step = iterator.next();
        if (step.done) {
          return step;
        }
      }
      return iterations % 2
        ? iteratorValue(type, iterations++, separator)
        : iteratorValue(type, iterations++, step.value, step);
    });
  };
  return interposedSequence;
}

function sortFactory(collection, comparator, mapper) {
  if (!comparator) {
    comparator = defaultComparator;
  }
  var isKeyedCollection = isKeyed(collection);
  var index = 0;
  var entries = collection
    .toSeq()
    .map(function (v, k) { return [k, v, index++, mapper ? mapper(v, k, collection) : v]; })
    .valueSeq()
    .toArray();
  entries
    .sort(function (a, b) { return comparator(a[3], b[3]) || a[2] - b[2]; })
    .forEach(
      isKeyedCollection
        ? function (v, i) {
            entries[i].length = 2;
          }
        : function (v, i) {
            entries[i] = v[1];
          }
    );
  return isKeyedCollection
    ? KeyedSeq(entries)
    : isIndexed(collection)
    ? IndexedSeq(entries)
    : SetSeq(entries);
}

function maxFactory(collection, comparator, mapper) {
  if (!comparator) {
    comparator = defaultComparator;
  }
  if (mapper) {
    var entry = collection
      .toSeq()
      .map(function (v, k) { return [v, mapper(v, k, collection)]; })
      .reduce(function (a, b) { return (maxCompare(comparator, a[1], b[1]) ? b : a); });
    return entry && entry[0];
  }
  return collection.reduce(function (a, b) { return (maxCompare(comparator, a, b) ? b : a); });
}

function maxCompare(comparator, a, b) {
  var comp = comparator(b, a);
  // b is considered the new max if the comparator declares them equal, but
  // they are not equal and b is in fact a nullish value.
  return (
    (comp === 0 && b !== a && (b === undefined || b === null || b !== b)) ||
    comp > 0
  );
}

function zipWithFactory(keyIter, zipper, iters, zipAll) {
  var zipSequence = makeSequence(keyIter);
  var sizes = new ArraySeq(iters).map(function (i) { return i.size; });
  zipSequence.size = zipAll ? sizes.max() : sizes.min();
  // Note: this a generic base implementation of __iterate in terms of
  // __iterator which may be more generically useful in the future.
  zipSequence.__iterate = function (fn, reverse) {
    /* generic:
    var iterator = this.__iterator(ITERATE_ENTRIES, reverse);
    var step;
    var iterations = 0;
    while (!(step = iterator.next()).done) {
      iterations++;
      if (fn(step.value[1], step.value[0], this) === false) {
        break;
      }
    }
    return iterations;
    */
    // indexed:
    var iterator = this.__iterator(ITERATE_VALUES, reverse);
    var step;
    var iterations = 0;
    while (!(step = iterator.next()).done) {
      if (fn(step.value, iterations++, this) === false) {
        break;
      }
    }
    return iterations;
  };
  zipSequence.__iteratorUncached = function (type, reverse) {
    var iterators = iters.map(
      function (i) { return ((i = Collection(i)), getIterator(reverse ? i.reverse() : i)); }
    );
    var iterations = 0;
    var isDone = false;
    return new Iterator(function () {
      var steps;
      if (!isDone) {
        steps = iterators.map(function (i) { return i.next(); });
        isDone = zipAll ? steps.every(function (s) { return s.done; }) : steps.some(function (s) { return s.done; });
      }
      if (isDone) {
        return iteratorDone();
      }
      return iteratorValue(
        type,
        iterations++,
        zipper.apply(
          null,
          steps.map(function (s) { return s.value; })
        )
      );
    });
  };
  return zipSequence;
}

// #pragma Helper Functions

function reify(iter, seq) {
  return iter === seq ? iter : isSeq(iter) ? seq : iter.constructor(seq);
}

function validateEntry(entry) {
  if (entry !== Object(entry)) {
    throw new TypeError('Expected [K, V] tuple: ' + entry);
  }
}

function collectionClass(collection) {
  return isKeyed(collection)
    ? KeyedCollection
    : isIndexed(collection)
    ? IndexedCollection
    : SetCollection;
}

function makeSequence(collection) {
  return Object.create(
    (isKeyed(collection)
      ? KeyedSeq
      : isIndexed(collection)
      ? IndexedSeq
      : SetSeq
    ).prototype
  );
}

function cacheResultThrough() {
  if (this._iter.cacheResult) {
    this._iter.cacheResult();
    this.size = this._iter.size;
    return this;
  }
  return Seq.prototype.cacheResult.call(this);
}

function defaultComparator(a, b) {
  if (a === undefined && b === undefined) {
    return 0;
  }

  if (a === undefined) {
    return 1;
  }

  if (b === undefined) {
    return -1;
  }

  return a > b ? 1 : a < b ? -1 : 0;
}

function arrCopy(arr, offset) {
  offset = offset || 0;
  var len = Math.max(0, arr.length - offset);
  var newArr = new Array(len);
  for (var ii = 0; ii < len; ii++) {
    newArr[ii] = arr[ii + offset];
  }
  return newArr;
}

function invariant(condition, error) {
  if (!condition) { throw new Error(error); }
}

function assertNotInfinite(size) {
  invariant(
    size !== Infinity,
    'Cannot perform this action with an infinite size.'
  );
}

function coerceKeyPath(keyPath) {
  if (isArrayLike(keyPath) && typeof keyPath !== 'string') {
    return keyPath;
  }
  if (isOrdered(keyPath)) {
    return keyPath.toArray();
  }
  throw new TypeError(
    'Invalid keyPath: expected Ordered Collection or Array: ' + keyPath
  );
}

var toString = Object.prototype.toString;

function isPlainObject(value) {
  // The base prototype's toString deals with Argument objects and native namespaces like Math
  if (
    !value ||
    typeof value !== 'object' ||
    toString.call(value) !== '[object Object]'
  ) {
    return false;
  }

  var proto = Object.getPrototypeOf(value);
  if (proto === null) {
    return true;
  }

  // Iteratively going up the prototype chain is needed for cross-realm environments (differing contexts, iframes, etc)
  var parentProto = proto;
  var nextProto = Object.getPrototypeOf(proto);
  while (nextProto !== null) {
    parentProto = nextProto;
    nextProto = Object.getPrototypeOf(parentProto);
  }
  return parentProto === proto;
}

/**
 * Returns true if the value is a potentially-persistent data structure, either
 * provided by Immutable.js or a plain Array or Object.
 */
function isDataStructure(value) {
  return (
    typeof value === 'object' &&
    (isImmutable(value) || Array.isArray(value) || isPlainObject(value))
  );
}

function quoteString(value) {
  try {
    return typeof value === 'string' ? JSON.stringify(value) : String(value);
  } catch (_ignoreError) {
    return JSON.stringify(value);
  }
}

function has(collection, key) {
  return isImmutable(collection)
    ? collection.has(key)
    : isDataStructure(collection) && hasOwnProperty.call(collection, key);
}

function get(collection, key, notSetValue) {
  return isImmutable(collection)
    ? collection.get(key, notSetValue)
    : !has(collection, key)
    ? notSetValue
    : typeof collection.get === 'function'
    ? collection.get(key)
    : collection[key];
}

function shallowCopy(from) {
  if (Array.isArray(from)) {
    return arrCopy(from);
  }
  var to = {};
  for (var key in from) {
    if (hasOwnProperty.call(from, key)) {
      to[key] = from[key];
    }
  }
  return to;
}

function remove(collection, key) {
  if (!isDataStructure(collection)) {
    throw new TypeError(
      'Cannot update non-data-structure value: ' + collection
    );
  }
  if (isImmutable(collection)) {
    if (!collection.remove) {
      throw new TypeError(
        'Cannot update immutable value without .remove() method: ' + collection
      );
    }
    return collection.remove(key);
  }
  if (!hasOwnProperty.call(collection, key)) {
    return collection;
  }
  var collectionCopy = shallowCopy(collection);
  if (Array.isArray(collectionCopy)) {
    collectionCopy.splice(key, 1);
  } else {
    delete collectionCopy[key];
  }
  return collectionCopy;
}

function set(collection, key, value) {
  if (!isDataStructure(collection)) {
    throw new TypeError(
      'Cannot update non-data-structure value: ' + collection
    );
  }
  if (isImmutable(collection)) {
    if (!collection.set) {
      throw new TypeError(
        'Cannot update immutable value without .set() method: ' + collection
      );
    }
    return collection.set(key, value);
  }
  if (hasOwnProperty.call(collection, key) && value === collection[key]) {
    return collection;
  }
  var collectionCopy = shallowCopy(collection);
  collectionCopy[key] = value;
  return collectionCopy;
}

function updateIn$1(collection, keyPath, notSetValue, updater) {
  if (!updater) {
    updater = notSetValue;
    notSetValue = undefined;
  }
  var updatedValue = updateInDeeply(
    isImmutable(collection),
    collection,
    coerceKeyPath(keyPath),
    0,
    notSetValue,
    updater
  );
  return updatedValue === NOT_SET ? notSetValue : updatedValue;
}

function updateInDeeply(
  inImmutable,
  existing,
  keyPath,
  i,
  notSetValue,
  updater
) {
  var wasNotSet = existing === NOT_SET;
  if (i === keyPath.length) {
    var existingValue = wasNotSet ? notSetValue : existing;
    var newValue = updater(existingValue);
    return newValue === existingValue ? existing : newValue;
  }
  if (!wasNotSet && !isDataStructure(existing)) {
    throw new TypeError(
      'Cannot update within non-data-structure value in path [' +
        keyPath.slice(0, i).map(quoteString) +
        ']: ' +
        existing
    );
  }
  var key = keyPath[i];
  var nextExisting = wasNotSet ? NOT_SET : get(existing, key, NOT_SET);
  var nextUpdated = updateInDeeply(
    nextExisting === NOT_SET ? inImmutable : isImmutable(nextExisting),
    nextExisting,
    keyPath,
    i + 1,
    notSetValue,
    updater
  );
  return nextUpdated === nextExisting
    ? existing
    : nextUpdated === NOT_SET
    ? remove(existing, key)
    : set(
        wasNotSet ? (inImmutable ? emptyMap() : {}) : existing,
        key,
        nextUpdated
      );
}

function setIn$1(collection, keyPath, value) {
  return updateIn$1(collection, keyPath, NOT_SET, function () { return value; });
}

function setIn(keyPath, v) {
  return setIn$1(this, keyPath, v);
}

function removeIn(collection, keyPath) {
  return updateIn$1(collection, keyPath, function () { return NOT_SET; });
}

function deleteIn(keyPath) {
  return removeIn(this, keyPath);
}

function update$1(collection, key, notSetValue, updater) {
  return updateIn$1(collection, [key], notSetValue, updater);
}

function update(key, notSetValue, updater) {
  return arguments.length === 1
    ? key(this)
    : update$1(this, key, notSetValue, updater);
}

function updateIn(keyPath, notSetValue, updater) {
  return updateIn$1(this, keyPath, notSetValue, updater);
}

function merge$1() {
  var iters = [], len = arguments.length;
  while ( len-- ) iters[ len ] = arguments[ len ];

  return mergeIntoKeyedWith(this, iters);
}

function mergeWith$1(merger) {
  var iters = [], len = arguments.length - 1;
  while ( len-- > 0 ) iters[ len ] = arguments[ len + 1 ];

  if (typeof merger !== 'function') {
    throw new TypeError('Invalid merger function: ' + merger);
  }
  return mergeIntoKeyedWith(this, iters, merger);
}

function mergeIntoKeyedWith(collection, collections, merger) {
  var iters = [];
  for (var ii = 0; ii < collections.length; ii++) {
    var collection$1 = KeyedCollection(collections[ii]);
    if (collection$1.size !== 0) {
      iters.push(collection$1);
    }
  }
  if (iters.length === 0) {
    return collection;
  }
  if (
    collection.toSeq().size === 0 &&
    !collection.__ownerID &&
    iters.length === 1
  ) {
    return collection.constructor(iters[0]);
  }
  return collection.withMutations(function (collection) {
    var mergeIntoCollection = merger
      ? function (value, key) {
          update$1(collection, key, NOT_SET, function (oldVal) { return oldVal === NOT_SET ? value : merger(oldVal, value, key); }
          );
        }
      : function (value, key) {
          collection.set(key, value);
        };
    for (var ii = 0; ii < iters.length; ii++) {
      iters[ii].forEach(mergeIntoCollection);
    }
  });
}

function merge(collection) {
  var sources = [], len = arguments.length - 1;
  while ( len-- > 0 ) sources[ len ] = arguments[ len + 1 ];

  return mergeWithSources(collection, sources);
}

function mergeWith(merger, collection) {
  var sources = [], len = arguments.length - 2;
  while ( len-- > 0 ) sources[ len ] = arguments[ len + 2 ];

  return mergeWithSources(collection, sources, merger);
}

function mergeDeep$1(collection) {
  var sources = [], len = arguments.length - 1;
  while ( len-- > 0 ) sources[ len ] = arguments[ len + 1 ];

  return mergeDeepWithSources(collection, sources);
}

function mergeDeepWith$1(merger, collection) {
  var sources = [], len = arguments.length - 2;
  while ( len-- > 0 ) sources[ len ] = arguments[ len + 2 ];

  return mergeDeepWithSources(collection, sources, merger);
}

function mergeDeepWithSources(collection, sources, merger) {
  return mergeWithSources(collection, sources, deepMergerWith(merger));
}

function mergeWithSources(collection, sources, merger) {
  if (!isDataStructure(collection)) {
    throw new TypeError(
      'Cannot merge into non-data-structure value: ' + collection
    );
  }
  if (isImmutable(collection)) {
    return typeof merger === 'function' && collection.mergeWith
      ? collection.mergeWith.apply(collection, [ merger ].concat( sources ))
      : collection.merge
      ? collection.merge.apply(collection, sources)
      : collection.concat.apply(collection, sources);
  }
  var isArray = Array.isArray(collection);
  var merged = collection;
  var Collection = isArray ? IndexedCollection : KeyedCollection;
  var mergeItem = isArray
    ? function (value) {
        // Copy on write
        if (merged === collection) {
          merged = shallowCopy(merged);
        }
        merged.push(value);
      }
    : function (value, key) {
        var hasVal = hasOwnProperty.call(merged, key);
        var nextVal =
          hasVal && merger ? merger(merged[key], value, key) : value;
        if (!hasVal || nextVal !== merged[key]) {
          // Copy on write
          if (merged === collection) {
            merged = shallowCopy(merged);
          }
          merged[key] = nextVal;
        }
      };
  for (var i = 0; i < sources.length; i++) {
    Collection(sources[i]).forEach(mergeItem);
  }
  return merged;
}

function deepMergerWith(merger) {
  function deepMerger(oldValue, newValue, key) {
    return isDataStructure(oldValue) &&
      isDataStructure(newValue) &&
      areMergeable(oldValue, newValue)
      ? mergeWithSources(oldValue, [newValue], deepMerger)
      : merger
      ? merger(oldValue, newValue, key)
      : newValue;
  }
  return deepMerger;
}

/**
 * It's unclear what the desired behavior is for merging two collections that
 * fall into separate categories between keyed, indexed, or set-like, so we only
 * consider them mergeable if they fall into the same category.
 */
function areMergeable(oldDataStructure, newDataStructure) {
  var oldSeq = Seq(oldDataStructure);
  var newSeq = Seq(newDataStructure);
  // This logic assumes that a sequence can only fall into one of the three
  // categories mentioned above (since there's no `isSetLike()` method).
  return (
    isIndexed(oldSeq) === isIndexed(newSeq) &&
    isKeyed(oldSeq) === isKeyed(newSeq)
  );
}

function mergeDeep() {
  var iters = [], len = arguments.length;
  while ( len-- ) iters[ len ] = arguments[ len ];

  return mergeDeepWithSources(this, iters);
}

function mergeDeepWith(merger) {
  var iters = [], len = arguments.length - 1;
  while ( len-- > 0 ) iters[ len ] = arguments[ len + 1 ];

  return mergeDeepWithSources(this, iters, merger);
}

function mergeIn(keyPath) {
  var iters = [], len = arguments.length - 1;
  while ( len-- > 0 ) iters[ len ] = arguments[ len + 1 ];

  return updateIn$1(this, keyPath, emptyMap(), function (m) { return mergeWithSources(m, iters); });
}

function mergeDeepIn(keyPath) {
  var iters = [], len = arguments.length - 1;
  while ( len-- > 0 ) iters[ len ] = arguments[ len + 1 ];

  return updateIn$1(this, keyPath, emptyMap(), function (m) { return mergeDeepWithSources(m, iters); }
  );
}

function withMutations(fn) {
  var mutable = this.asMutable();
  fn(mutable);
  return mutable.wasAltered() ? mutable.__ensureOwner(this.__ownerID) : this;
}

function asMutable() {
  return this.__ownerID ? this : this.__ensureOwner(new OwnerID());
}

function asImmutable() {
  return this.__ensureOwner();
}

function wasAltered() {
  return this.__altered;
}

var Map = /*@__PURE__*/(function (KeyedCollection) {
  function Map(value) {
    return value === undefined || value === null
      ? emptyMap()
      : isMap(value) && !isOrdered(value)
      ? value
      : emptyMap().withMutations(function (map) {
          var iter = KeyedCollection(value);
          assertNotInfinite(iter.size);
          iter.forEach(function (v, k) { return map.set(k, v); });
        });
  }

  if ( KeyedCollection ) Map.__proto__ = KeyedCollection;
  Map.prototype = Object.create( KeyedCollection && KeyedCollection.prototype );
  Map.prototype.constructor = Map;

  Map.of = function of () {
    var keyValues = [], len = arguments.length;
    while ( len-- ) keyValues[ len ] = arguments[ len ];

    return emptyMap().withMutations(function (map) {
      for (var i = 0; i < keyValues.length; i += 2) {
        if (i + 1 >= keyValues.length) {
          throw new Error('Missing value for key: ' + keyValues[i]);
        }
        map.set(keyValues[i], keyValues[i + 1]);
      }
    });
  };

  Map.prototype.toString = function toString () {
    return this.__toString('Map {', '}');
  };

  // @pragma Access

  Map.prototype.get = function get (k, notSetValue) {
    return this._root
      ? this._root.get(0, undefined, k, notSetValue)
      : notSetValue;
  };

  // @pragma Modification

  Map.prototype.set = function set (k, v) {
    return updateMap(this, k, v);
  };

  Map.prototype.remove = function remove (k) {
    return updateMap(this, k, NOT_SET);
  };

  Map.prototype.deleteAll = function deleteAll (keys) {
    var collection = Collection(keys);

    if (collection.size === 0) {
      return this;
    }

    return this.withMutations(function (map) {
      collection.forEach(function (key) { return map.remove(key); });
    });
  };

  Map.prototype.clear = function clear () {
    if (this.size === 0) {
      return this;
    }
    if (this.__ownerID) {
      this.size = 0;
      this._root = null;
      this.__hash = undefined;
      this.__altered = true;
      return this;
    }
    return emptyMap();
  };

  // @pragma Composition

  Map.prototype.sort = function sort (comparator) {
    // Late binding
    return OrderedMap(sortFactory(this, comparator));
  };

  Map.prototype.sortBy = function sortBy (mapper, comparator) {
    // Late binding
    return OrderedMap(sortFactory(this, comparator, mapper));
  };

  Map.prototype.map = function map (mapper, context) {
    var this$1$1 = this;

    return this.withMutations(function (map) {
      map.forEach(function (value, key) {
        map.set(key, mapper.call(context, value, key, this$1$1));
      });
    });
  };

  // @pragma Mutability

  Map.prototype.__iterator = function __iterator (type, reverse) {
    return new MapIterator(this, type, reverse);
  };

  Map.prototype.__iterate = function __iterate (fn, reverse) {
    var this$1$1 = this;

    var iterations = 0;
    this._root &&
      this._root.iterate(function (entry) {
        iterations++;
        return fn(entry[1], entry[0], this$1$1);
      }, reverse);
    return iterations;
  };

  Map.prototype.__ensureOwner = function __ensureOwner (ownerID) {
    if (ownerID === this.__ownerID) {
      return this;
    }
    if (!ownerID) {
      if (this.size === 0) {
        return emptyMap();
      }
      this.__ownerID = ownerID;
      this.__altered = false;
      return this;
    }
    return makeMap(this.size, this._root, ownerID, this.__hash);
  };

  return Map;
}(KeyedCollection));

Map.isMap = isMap;

var MapPrototype = Map.prototype;
MapPrototype[IS_MAP_SYMBOL] = true;
MapPrototype[DELETE] = MapPrototype.remove;
MapPrototype.removeAll = MapPrototype.deleteAll;
MapPrototype.setIn = setIn;
MapPrototype.removeIn = MapPrototype.deleteIn = deleteIn;
MapPrototype.update = update;
MapPrototype.updateIn = updateIn;
MapPrototype.merge = MapPrototype.concat = merge$1;
MapPrototype.mergeWith = mergeWith$1;
MapPrototype.mergeDeep = mergeDeep;
MapPrototype.mergeDeepWith = mergeDeepWith;
MapPrototype.mergeIn = mergeIn;
MapPrototype.mergeDeepIn = mergeDeepIn;
MapPrototype.withMutations = withMutations;
MapPrototype.wasAltered = wasAltered;
MapPrototype.asImmutable = asImmutable;
MapPrototype['@@transducer/init'] = MapPrototype.asMutable = asMutable;
MapPrototype['@@transducer/step'] = function (result, arr) {
  return result.set(arr[0], arr[1]);
};
MapPrototype['@@transducer/result'] = function (obj) {
  return obj.asImmutable();
};

// #pragma Trie Nodes

var ArrayMapNode = function ArrayMapNode(ownerID, entries) {
  this.ownerID = ownerID;
  this.entries = entries;
};

ArrayMapNode.prototype.get = function get (shift, keyHash, key, notSetValue) {
  var entries = this.entries;
  for (var ii = 0, len = entries.length; ii < len; ii++) {
    if (is(key, entries[ii][0])) {
      return entries[ii][1];
    }
  }
  return notSetValue;
};

ArrayMapNode.prototype.update = function update (ownerID, shift, keyHash, key, value, didChangeSize, didAlter) {
  var removed = value === NOT_SET;

  var entries = this.entries;
  var idx = 0;
  var len = entries.length;
  for (; idx < len; idx++) {
    if (is(key, entries[idx][0])) {
      break;
    }
  }
  var exists = idx < len;

  if (exists ? entries[idx][1] === value : removed) {
    return this;
  }

  SetRef(didAlter);
  (removed || !exists) && SetRef(didChangeSize);

  if (removed && entries.length === 1) {
    return; // undefined
  }

  if (!exists && !removed && entries.length >= MAX_ARRAY_MAP_SIZE) {
    return createNodes(ownerID, entries, key, value);
  }

  var isEditable = ownerID && ownerID === this.ownerID;
  var newEntries = isEditable ? entries : arrCopy(entries);

  if (exists) {
    if (removed) {
      idx === len - 1
        ? newEntries.pop()
        : (newEntries[idx] = newEntries.pop());
    } else {
      newEntries[idx] = [key, value];
    }
  } else {
    newEntries.push([key, value]);
  }

  if (isEditable) {
    this.entries = newEntries;
    return this;
  }

  return new ArrayMapNode(ownerID, newEntries);
};

var BitmapIndexedNode = function BitmapIndexedNode(ownerID, bitmap, nodes) {
  this.ownerID = ownerID;
  this.bitmap = bitmap;
  this.nodes = nodes;
};

BitmapIndexedNode.prototype.get = function get (shift, keyHash, key, notSetValue) {
  if (keyHash === undefined) {
    keyHash = hash(key);
  }
  var bit = 1 << ((shift === 0 ? keyHash : keyHash >>> shift) & MASK);
  var bitmap = this.bitmap;
  return (bitmap & bit) === 0
    ? notSetValue
    : this.nodes[popCount(bitmap & (bit - 1))].get(
        shift + SHIFT,
        keyHash,
        key,
        notSetValue
      );
};

BitmapIndexedNode.prototype.update = function update (ownerID, shift, keyHash, key, value, didChangeSize, didAlter) {
  if (keyHash === undefined) {
    keyHash = hash(key);
  }
  var keyHashFrag = (shift === 0 ? keyHash : keyHash >>> shift) & MASK;
  var bit = 1 << keyHashFrag;
  var bitmap = this.bitmap;
  var exists = (bitmap & bit) !== 0;

  if (!exists && value === NOT_SET) {
    return this;
  }

  var idx = popCount(bitmap & (bit - 1));
  var nodes = this.nodes;
  var node = exists ? nodes[idx] : undefined;
  var newNode = updateNode(
    node,
    ownerID,
    shift + SHIFT,
    keyHash,
    key,
    value,
    didChangeSize,
    didAlter
  );

  if (newNode === node) {
    return this;
  }

  if (!exists && newNode && nodes.length >= MAX_BITMAP_INDEXED_SIZE) {
    return expandNodes(ownerID, nodes, bitmap, keyHashFrag, newNode);
  }

  if (
    exists &&
    !newNode &&
    nodes.length === 2 &&
    isLeafNode(nodes[idx ^ 1])
  ) {
    return nodes[idx ^ 1];
  }

  if (exists && newNode && nodes.length === 1 && isLeafNode(newNode)) {
    return newNode;
  }

  var isEditable = ownerID && ownerID === this.ownerID;
  var newBitmap = exists ? (newNode ? bitmap : bitmap ^ bit) : bitmap | bit;
  var newNodes = exists
    ? newNode
      ? setAt(nodes, idx, newNode, isEditable)
      : spliceOut(nodes, idx, isEditable)
    : spliceIn(nodes, idx, newNode, isEditable);

  if (isEditable) {
    this.bitmap = newBitmap;
    this.nodes = newNodes;
    return this;
  }

  return new BitmapIndexedNode(ownerID, newBitmap, newNodes);
};

var HashArrayMapNode = function HashArrayMapNode(ownerID, count, nodes) {
  this.ownerID = ownerID;
  this.count = count;
  this.nodes = nodes;
};

HashArrayMapNode.prototype.get = function get (shift, keyHash, key, notSetValue) {
  if (keyHash === undefined) {
    keyHash = hash(key);
  }
  var idx = (shift === 0 ? keyHash : keyHash >>> shift) & MASK;
  var node = this.nodes[idx];
  return node
    ? node.get(shift + SHIFT, keyHash, key, notSetValue)
    : notSetValue;
};

HashArrayMapNode.prototype.update = function update (ownerID, shift, keyHash, key, value, didChangeSize, didAlter) {
  if (keyHash === undefined) {
    keyHash = hash(key);
  }
  var idx = (shift === 0 ? keyHash : keyHash >>> shift) & MASK;
  var removed = value === NOT_SET;
  var nodes = this.nodes;
  var node = nodes[idx];

  if (removed && !node) {
    return this;
  }

  var newNode = updateNode(
    node,
    ownerID,
    shift + SHIFT,
    keyHash,
    key,
    value,
    didChangeSize,
    didAlter
  );
  if (newNode === node) {
    return this;
  }

  var newCount = this.count;
  if (!node) {
    newCount++;
  } else if (!newNode) {
    newCount--;
    if (newCount < MIN_HASH_ARRAY_MAP_SIZE) {
      return packNodes(ownerID, nodes, newCount, idx);
    }
  }

  var isEditable = ownerID && ownerID === this.ownerID;
  var newNodes = setAt(nodes, idx, newNode, isEditable);

  if (isEditable) {
    this.count = newCount;
    this.nodes = newNodes;
    return this;
  }

  return new HashArrayMapNode(ownerID, newCount, newNodes);
};

var HashCollisionNode = function HashCollisionNode(ownerID, keyHash, entries) {
  this.ownerID = ownerID;
  this.keyHash = keyHash;
  this.entries = entries;
};

HashCollisionNode.prototype.get = function get (shift, keyHash, key, notSetValue) {
  var entries = this.entries;
  for (var ii = 0, len = entries.length; ii < len; ii++) {
    if (is(key, entries[ii][0])) {
      return entries[ii][1];
    }
  }
  return notSetValue;
};

HashCollisionNode.prototype.update = function update (ownerID, shift, keyHash, key, value, didChangeSize, didAlter) {
  if (keyHash === undefined) {
    keyHash = hash(key);
  }

  var removed = value === NOT_SET;

  if (keyHash !== this.keyHash) {
    if (removed) {
      return this;
    }
    SetRef(didAlter);
    SetRef(didChangeSize);
    return mergeIntoNode(this, ownerID, shift, keyHash, [key, value]);
  }

  var entries = this.entries;
  var idx = 0;
  var len = entries.length;
  for (; idx < len; idx++) {
    if (is(key, entries[idx][0])) {
      break;
    }
  }
  var exists = idx < len;

  if (exists ? entries[idx][1] === value : removed) {
    return this;
  }

  SetRef(didAlter);
  (removed || !exists) && SetRef(didChangeSize);

  if (removed && len === 2) {
    return new ValueNode(ownerID, this.keyHash, entries[idx ^ 1]);
  }

  var isEditable = ownerID && ownerID === this.ownerID;
  var newEntries = isEditable ? entries : arrCopy(entries);

  if (exists) {
    if (removed) {
      idx === len - 1
        ? newEntries.pop()
        : (newEntries[idx] = newEntries.pop());
    } else {
      newEntries[idx] = [key, value];
    }
  } else {
    newEntries.push([key, value]);
  }

  if (isEditable) {
    this.entries = newEntries;
    return this;
  }

  return new HashCollisionNode(ownerID, this.keyHash, newEntries);
};

var ValueNode = function ValueNode(ownerID, keyHash, entry) {
  this.ownerID = ownerID;
  this.keyHash = keyHash;
  this.entry = entry;
};

ValueNode.prototype.get = function get (shift, keyHash, key, notSetValue) {
  return is(key, this.entry[0]) ? this.entry[1] : notSetValue;
};

ValueNode.prototype.update = function update (ownerID, shift, keyHash, key, value, didChangeSize, didAlter) {
  var removed = value === NOT_SET;
  var keyMatch = is(key, this.entry[0]);
  if (keyMatch ? value === this.entry[1] : removed) {
    return this;
  }

  SetRef(didAlter);

  if (removed) {
    SetRef(didChangeSize);
    return; // undefined
  }

  if (keyMatch) {
    if (ownerID && ownerID === this.ownerID) {
      this.entry[1] = value;
      return this;
    }
    return new ValueNode(ownerID, this.keyHash, [key, value]);
  }

  SetRef(didChangeSize);
  return mergeIntoNode(this, ownerID, shift, hash(key), [key, value]);
};

// #pragma Iterators

ArrayMapNode.prototype.iterate = HashCollisionNode.prototype.iterate =
  function (fn, reverse) {
    var entries = this.entries;
    for (var ii = 0, maxIndex = entries.length - 1; ii <= maxIndex; ii++) {
      if (fn(entries[reverse ? maxIndex - ii : ii]) === false) {
        return false;
      }
    }
  };

BitmapIndexedNode.prototype.iterate = HashArrayMapNode.prototype.iterate =
  function (fn, reverse) {
    var nodes = this.nodes;
    for (var ii = 0, maxIndex = nodes.length - 1; ii <= maxIndex; ii++) {
      var node = nodes[reverse ? maxIndex - ii : ii];
      if (node && node.iterate(fn, reverse) === false) {
        return false;
      }
    }
  };

// eslint-disable-next-line no-unused-vars
ValueNode.prototype.iterate = function (fn, reverse) {
  return fn(this.entry);
};

var MapIterator = /*@__PURE__*/(function (Iterator) {
  function MapIterator(map, type, reverse) {
    this._type = type;
    this._reverse = reverse;
    this._stack = map._root && mapIteratorFrame(map._root);
  }

  if ( Iterator ) MapIterator.__proto__ = Iterator;
  MapIterator.prototype = Object.create( Iterator && Iterator.prototype );
  MapIterator.prototype.constructor = MapIterator;

  MapIterator.prototype.next = function next () {
    var type = this._type;
    var stack = this._stack;
    while (stack) {
      var node = stack.node;
      var index = stack.index++;
      var maxIndex = (void 0);
      if (node.entry) {
        if (index === 0) {
          return mapIteratorValue(type, node.entry);
        }
      } else if (node.entries) {
        maxIndex = node.entries.length - 1;
        if (index <= maxIndex) {
          return mapIteratorValue(
            type,
            node.entries[this._reverse ? maxIndex - index : index]
          );
        }
      } else {
        maxIndex = node.nodes.length - 1;
        if (index <= maxIndex) {
          var subNode = node.nodes[this._reverse ? maxIndex - index : index];
          if (subNode) {
            if (subNode.entry) {
              return mapIteratorValue(type, subNode.entry);
            }
            stack = this._stack = mapIteratorFrame(subNode, stack);
          }
          continue;
        }
      }
      stack = this._stack = this._stack.__prev;
    }
    return iteratorDone();
  };

  return MapIterator;
}(Iterator));

function mapIteratorValue(type, entry) {
  return iteratorValue(type, entry[0], entry[1]);
}

function mapIteratorFrame(node, prev) {
  return {
    node: node,
    index: 0,
    __prev: prev,
  };
}

function makeMap(size, root, ownerID, hash) {
  var map = Object.create(MapPrototype);
  map.size = size;
  map._root = root;
  map.__ownerID = ownerID;
  map.__hash = hash;
  map.__altered = false;
  return map;
}

var EMPTY_MAP;
function emptyMap() {
  return EMPTY_MAP || (EMPTY_MAP = makeMap(0));
}

function updateMap(map, k, v) {
  var newRoot;
  var newSize;
  if (!map._root) {
    if (v === NOT_SET) {
      return map;
    }
    newSize = 1;
    newRoot = new ArrayMapNode(map.__ownerID, [[k, v]]);
  } else {
    var didChangeSize = MakeRef();
    var didAlter = MakeRef();
    newRoot = updateNode(
      map._root,
      map.__ownerID,
      0,
      undefined,
      k,
      v,
      didChangeSize,
      didAlter
    );
    if (!didAlter.value) {
      return map;
    }
    newSize = map.size + (didChangeSize.value ? (v === NOT_SET ? -1 : 1) : 0);
  }
  if (map.__ownerID) {
    map.size = newSize;
    map._root = newRoot;
    map.__hash = undefined;
    map.__altered = true;
    return map;
  }
  return newRoot ? makeMap(newSize, newRoot) : emptyMap();
}

function updateNode(
  node,
  ownerID,
  shift,
  keyHash,
  key,
  value,
  didChangeSize,
  didAlter
) {
  if (!node) {
    if (value === NOT_SET) {
      return node;
    }
    SetRef(didAlter);
    SetRef(didChangeSize);
    return new ValueNode(ownerID, keyHash, [key, value]);
  }
  return node.update(
    ownerID,
    shift,
    keyHash,
    key,
    value,
    didChangeSize,
    didAlter
  );
}

function isLeafNode(node) {
  return (
    node.constructor === ValueNode || node.constructor === HashCollisionNode
  );
}

function mergeIntoNode(node, ownerID, shift, keyHash, entry) {
  if (node.keyHash === keyHash) {
    return new HashCollisionNode(ownerID, keyHash, [node.entry, entry]);
  }

  var idx1 = (shift === 0 ? node.keyHash : node.keyHash >>> shift) & MASK;
  var idx2 = (shift === 0 ? keyHash : keyHash >>> shift) & MASK;

  var newNode;
  var nodes =
    idx1 === idx2
      ? [mergeIntoNode(node, ownerID, shift + SHIFT, keyHash, entry)]
      : ((newNode = new ValueNode(ownerID, keyHash, entry)),
        idx1 < idx2 ? [node, newNode] : [newNode, node]);

  return new BitmapIndexedNode(ownerID, (1 << idx1) | (1 << idx2), nodes);
}

function createNodes(ownerID, entries, key, value) {
  if (!ownerID) {
    ownerID = new OwnerID();
  }
  var node = new ValueNode(ownerID, hash(key), [key, value]);
  for (var ii = 0; ii < entries.length; ii++) {
    var entry = entries[ii];
    node = node.update(ownerID, 0, undefined, entry[0], entry[1]);
  }
  return node;
}

function packNodes(ownerID, nodes, count, excluding) {
  var bitmap = 0;
  var packedII = 0;
  var packedNodes = new Array(count);
  for (var ii = 0, bit = 1, len = nodes.length; ii < len; ii++, bit <<= 1) {
    var node = nodes[ii];
    if (node !== undefined && ii !== excluding) {
      bitmap |= bit;
      packedNodes[packedII++] = node;
    }
  }
  return new BitmapIndexedNode(ownerID, bitmap, packedNodes);
}

function expandNodes(ownerID, nodes, bitmap, including, node) {
  var count = 0;
  var expandedNodes = new Array(SIZE);
  for (var ii = 0; bitmap !== 0; ii++, bitmap >>>= 1) {
    expandedNodes[ii] = bitmap & 1 ? nodes[count++] : undefined;
  }
  expandedNodes[including] = node;
  return new HashArrayMapNode(ownerID, count + 1, expandedNodes);
}

function popCount(x) {
  x -= (x >> 1) & 0x55555555;
  x = (x & 0x33333333) + ((x >> 2) & 0x33333333);
  x = (x + (x >> 4)) & 0x0f0f0f0f;
  x += x >> 8;
  x += x >> 16;
  return x & 0x7f;
}

function setAt(array, idx, val, canEdit) {
  var newArray = canEdit ? array : arrCopy(array);
  newArray[idx] = val;
  return newArray;
}

function spliceIn(array, idx, val, canEdit) {
  var newLen = array.length + 1;
  if (canEdit && idx + 1 === newLen) {
    array[idx] = val;
    return array;
  }
  var newArray = new Array(newLen);
  var after = 0;
  for (var ii = 0; ii < newLen; ii++) {
    if (ii === idx) {
      newArray[ii] = val;
      after = -1;
    } else {
      newArray[ii] = array[ii + after];
    }
  }
  return newArray;
}

function spliceOut(array, idx, canEdit) {
  var newLen = array.length - 1;
  if (canEdit && idx === newLen) {
    array.pop();
    return array;
  }
  var newArray = new Array(newLen);
  var after = 0;
  for (var ii = 0; ii < newLen; ii++) {
    if (ii === idx) {
      after = 1;
    }
    newArray[ii] = array[ii + after];
  }
  return newArray;
}

var MAX_ARRAY_MAP_SIZE = SIZE / 4;
var MAX_BITMAP_INDEXED_SIZE = SIZE / 2;
var MIN_HASH_ARRAY_MAP_SIZE = SIZE / 4;

var IS_LIST_SYMBOL = '@@__IMMUTABLE_LIST__@@';

function isList(maybeList) {
  return Boolean(maybeList && maybeList[IS_LIST_SYMBOL]);
}

var List = /*@__PURE__*/(function (IndexedCollection) {
  function List(value) {
    var empty = emptyList();
    if (value === undefined || value === null) {
      return empty;
    }
    if (isList(value)) {
      return value;
    }
    var iter = IndexedCollection(value);
    var size = iter.size;
    if (size === 0) {
      return empty;
    }
    assertNotInfinite(size);
    if (size > 0 && size < SIZE) {
      return makeList(0, size, SHIFT, null, new VNode(iter.toArray()));
    }
    return empty.withMutations(function (list) {
      list.setSize(size);
      iter.forEach(function (v, i) { return list.set(i, v); });
    });
  }

  if ( IndexedCollection ) List.__proto__ = IndexedCollection;
  List.prototype = Object.create( IndexedCollection && IndexedCollection.prototype );
  List.prototype.constructor = List;

  List.of = function of (/*...values*/) {
    return this(arguments);
  };

  List.prototype.toString = function toString () {
    return this.__toString('List [', ']');
  };

  // @pragma Access

  List.prototype.get = function get (index, notSetValue) {
    index = wrapIndex(this, index);
    if (index >= 0 && index < this.size) {
      index += this._origin;
      var node = listNodeFor(this, index);
      return node && node.array[index & MASK];
    }
    return notSetValue;
  };

  // @pragma Modification

  List.prototype.set = function set (index, value) {
    return updateList(this, index, value);
  };

  List.prototype.remove = function remove (index) {
    return !this.has(index)
      ? this
      : index === 0
      ? this.shift()
      : index === this.size - 1
      ? this.pop()
      : this.splice(index, 1);
  };

  List.prototype.insert = function insert (index, value) {
    return this.splice(index, 0, value);
  };

  List.prototype.clear = function clear () {
    if (this.size === 0) {
      return this;
    }
    if (this.__ownerID) {
      this.size = this._origin = this._capacity = 0;
      this._level = SHIFT;
      this._root = this._tail = this.__hash = undefined;
      this.__altered = true;
      return this;
    }
    return emptyList();
  };

  List.prototype.push = function push (/*...values*/) {
    var values = arguments;
    var oldSize = this.size;
    return this.withMutations(function (list) {
      setListBounds(list, 0, oldSize + values.length);
      for (var ii = 0; ii < values.length; ii++) {
        list.set(oldSize + ii, values[ii]);
      }
    });
  };

  List.prototype.pop = function pop () {
    return setListBounds(this, 0, -1);
  };

  List.prototype.unshift = function unshift (/*...values*/) {
    var values = arguments;
    return this.withMutations(function (list) {
      setListBounds(list, -values.length);
      for (var ii = 0; ii < values.length; ii++) {
        list.set(ii, values[ii]);
      }
    });
  };

  List.prototype.shift = function shift () {
    return setListBounds(this, 1);
  };

  // @pragma Composition

  List.prototype.concat = function concat (/*...collections*/) {
    var arguments$1 = arguments;

    var seqs = [];
    for (var i = 0; i < arguments.length; i++) {
      var argument = arguments$1[i];
      var seq = IndexedCollection(
        typeof argument !== 'string' && hasIterator(argument)
          ? argument
          : [argument]
      );
      if (seq.size !== 0) {
        seqs.push(seq);
      }
    }
    if (seqs.length === 0) {
      return this;
    }
    if (this.size === 0 && !this.__ownerID && seqs.length === 1) {
      return this.constructor(seqs[0]);
    }
    return this.withMutations(function (list) {
      seqs.forEach(function (seq) { return seq.forEach(function (value) { return list.push(value); }); });
    });
  };

  List.prototype.setSize = function setSize (size) {
    return setListBounds(this, 0, size);
  };

  List.prototype.map = function map (mapper, context) {
    var this$1$1 = this;

    return this.withMutations(function (list) {
      for (var i = 0; i < this$1$1.size; i++) {
        list.set(i, mapper.call(context, list.get(i), i, this$1$1));
      }
    });
  };

  // @pragma Iteration

  List.prototype.slice = function slice (begin, end) {
    var size = this.size;
    if (wholeSlice(begin, end, size)) {
      return this;
    }
    return setListBounds(
      this,
      resolveBegin(begin, size),
      resolveEnd(end, size)
    );
  };

  List.prototype.__iterator = function __iterator (type, reverse) {
    var index = reverse ? this.size : 0;
    var values = iterateList(this, reverse);
    return new Iterator(function () {
      var value = values();
      return value === DONE
        ? iteratorDone()
        : iteratorValue(type, reverse ? --index : index++, value);
    });
  };

  List.prototype.__iterate = function __iterate (fn, reverse) {
    var index = reverse ? this.size : 0;
    var values = iterateList(this, reverse);
    var value;
    while ((value = values()) !== DONE) {
      if (fn(value, reverse ? --index : index++, this) === false) {
        break;
      }
    }
    return index;
  };

  List.prototype.__ensureOwner = function __ensureOwner (ownerID) {
    if (ownerID === this.__ownerID) {
      return this;
    }
    if (!ownerID) {
      if (this.size === 0) {
        return emptyList();
      }
      this.__ownerID = ownerID;
      this.__altered = false;
      return this;
    }
    return makeList(
      this._origin,
      this._capacity,
      this._level,
      this._root,
      this._tail,
      ownerID,
      this.__hash
    );
  };

  return List;
}(IndexedCollection));

List.isList = isList;

var ListPrototype = List.prototype;
ListPrototype[IS_LIST_SYMBOL] = true;
ListPrototype[DELETE] = ListPrototype.remove;
ListPrototype.merge = ListPrototype.concat;
ListPrototype.setIn = setIn;
ListPrototype.deleteIn = ListPrototype.removeIn = deleteIn;
ListPrototype.update = update;
ListPrototype.updateIn = updateIn;
ListPrototype.mergeIn = mergeIn;
ListPrototype.mergeDeepIn = mergeDeepIn;
ListPrototype.withMutations = withMutations;
ListPrototype.wasAltered = wasAltered;
ListPrototype.asImmutable = asImmutable;
ListPrototype['@@transducer/init'] = ListPrototype.asMutable = asMutable;
ListPrototype['@@transducer/step'] = function (result, arr) {
  return result.push(arr);
};
ListPrototype['@@transducer/result'] = function (obj) {
  return obj.asImmutable();
};

var VNode = function VNode(array, ownerID) {
  this.array = array;
  this.ownerID = ownerID;
};

// TODO: seems like these methods are very similar

VNode.prototype.removeBefore = function removeBefore (ownerID, level, index) {
  if (index === level ? 1 << level : this.array.length === 0) {
    return this;
  }
  var originIndex = (index >>> level) & MASK;
  if (originIndex >= this.array.length) {
    return new VNode([], ownerID);
  }
  var removingFirst = originIndex === 0;
  var newChild;
  if (level > 0) {
    var oldChild = this.array[originIndex];
    newChild =
      oldChild && oldChild.removeBefore(ownerID, level - SHIFT, index);
    if (newChild === oldChild && removingFirst) {
      return this;
    }
  }
  if (removingFirst && !newChild) {
    return this;
  }
  var editable = editableVNode(this, ownerID);
  if (!removingFirst) {
    for (var ii = 0; ii < originIndex; ii++) {
      editable.array[ii] = undefined;
    }
  }
  if (newChild) {
    editable.array[originIndex] = newChild;
  }
  return editable;
};

VNode.prototype.removeAfter = function removeAfter (ownerID, level, index) {
  if (index === (level ? 1 << level : 0) || this.array.length === 0) {
    return this;
  }
  var sizeIndex = ((index - 1) >>> level) & MASK;
  if (sizeIndex >= this.array.length) {
    return this;
  }

  var newChild;
  if (level > 0) {
    var oldChild = this.array[sizeIndex];
    newChild =
      oldChild && oldChild.removeAfter(ownerID, level - SHIFT, index);
    if (newChild === oldChild && sizeIndex === this.array.length - 1) {
      return this;
    }
  }

  var editable = editableVNode(this, ownerID);
  editable.array.splice(sizeIndex + 1);
  if (newChild) {
    editable.array[sizeIndex] = newChild;
  }
  return editable;
};

var DONE = {};

function iterateList(list, reverse) {
  var left = list._origin;
  var right = list._capacity;
  var tailPos = getTailOffset(right);
  var tail = list._tail;

  return iterateNodeOrLeaf(list._root, list._level, 0);

  function iterateNodeOrLeaf(node, level, offset) {
    return level === 0
      ? iterateLeaf(node, offset)
      : iterateNode(node, level, offset);
  }

  function iterateLeaf(node, offset) {
    var array = offset === tailPos ? tail && tail.array : node && node.array;
    var from = offset > left ? 0 : left - offset;
    var to = right - offset;
    if (to > SIZE) {
      to = SIZE;
    }
    return function () {
      if (from === to) {
        return DONE;
      }
      var idx = reverse ? --to : from++;
      return array && array[idx];
    };
  }

  function iterateNode(node, level, offset) {
    var values;
    var array = node && node.array;
    var from = offset > left ? 0 : (left - offset) >> level;
    var to = ((right - offset) >> level) + 1;
    if (to > SIZE) {
      to = SIZE;
    }
    return function () {
      while (true) {
        if (values) {
          var value = values();
          if (value !== DONE) {
            return value;
          }
          values = null;
        }
        if (from === to) {
          return DONE;
        }
        var idx = reverse ? --to : from++;
        values = iterateNodeOrLeaf(
          array && array[idx],
          level - SHIFT,
          offset + (idx << level)
        );
      }
    };
  }
}

function makeList(origin, capacity, level, root, tail, ownerID, hash) {
  var list = Object.create(ListPrototype);
  list.size = capacity - origin;
  list._origin = origin;
  list._capacity = capacity;
  list._level = level;
  list._root = root;
  list._tail = tail;
  list.__ownerID = ownerID;
  list.__hash = hash;
  list.__altered = false;
  return list;
}

var EMPTY_LIST;
function emptyList() {
  return EMPTY_LIST || (EMPTY_LIST = makeList(0, 0, SHIFT));
}

function updateList(list, index, value) {
  index = wrapIndex(list, index);

  if (index !== index) {
    return list;
  }

  if (index >= list.size || index < 0) {
    return list.withMutations(function (list) {
      index < 0
        ? setListBounds(list, index).set(0, value)
        : setListBounds(list, 0, index + 1).set(index, value);
    });
  }

  index += list._origin;

  var newTail = list._tail;
  var newRoot = list._root;
  var didAlter = MakeRef();
  if (index >= getTailOffset(list._capacity)) {
    newTail = updateVNode(newTail, list.__ownerID, 0, index, value, didAlter);
  } else {
    newRoot = updateVNode(
      newRoot,
      list.__ownerID,
      list._level,
      index,
      value,
      didAlter
    );
  }

  if (!didAlter.value) {
    return list;
  }

  if (list.__ownerID) {
    list._root = newRoot;
    list._tail = newTail;
    list.__hash = undefined;
    list.__altered = true;
    return list;
  }
  return makeList(list._origin, list._capacity, list._level, newRoot, newTail);
}

function updateVNode(node, ownerID, level, index, value, didAlter) {
  var idx = (index >>> level) & MASK;
  var nodeHas = node && idx < node.array.length;
  if (!nodeHas && value === undefined) {
    return node;
  }

  var newNode;

  if (level > 0) {
    var lowerNode = node && node.array[idx];
    var newLowerNode = updateVNode(
      lowerNode,
      ownerID,
      level - SHIFT,
      index,
      value,
      didAlter
    );
    if (newLowerNode === lowerNode) {
      return node;
    }
    newNode = editableVNode(node, ownerID);
    newNode.array[idx] = newLowerNode;
    return newNode;
  }

  if (nodeHas && node.array[idx] === value) {
    return node;
  }

  if (didAlter) {
    SetRef(didAlter);
  }

  newNode = editableVNode(node, ownerID);
  if (value === undefined && idx === newNode.array.length - 1) {
    newNode.array.pop();
  } else {
    newNode.array[idx] = value;
  }
  return newNode;
}

function editableVNode(node, ownerID) {
  if (ownerID && node && ownerID === node.ownerID) {
    return node;
  }
  return new VNode(node ? node.array.slice() : [], ownerID);
}

function listNodeFor(list, rawIndex) {
  if (rawIndex >= getTailOffset(list._capacity)) {
    return list._tail;
  }
  if (rawIndex < 1 << (list._level + SHIFT)) {
    var node = list._root;
    var level = list._level;
    while (node && level > 0) {
      node = node.array[(rawIndex >>> level) & MASK];
      level -= SHIFT;
    }
    return node;
  }
}

function setListBounds(list, begin, end) {
  // Sanitize begin & end using this shorthand for ToInt32(argument)
  // http://www.ecma-international.org/ecma-262/6.0/#sec-toint32
  if (begin !== undefined) {
    begin |= 0;
  }
  if (end !== undefined) {
    end |= 0;
  }
  var owner = list.__ownerID || new OwnerID();
  var oldOrigin = list._origin;
  var oldCapacity = list._capacity;
  var newOrigin = oldOrigin + begin;
  var newCapacity =
    end === undefined
      ? oldCapacity
      : end < 0
      ? oldCapacity + end
      : oldOrigin + end;
  if (newOrigin === oldOrigin && newCapacity === oldCapacity) {
    return list;
  }

  // If it's going to end after it starts, it's empty.
  if (newOrigin >= newCapacity) {
    return list.clear();
  }

  var newLevel = list._level;
  var newRoot = list._root;

  // New origin might need creating a higher root.
  var offsetShift = 0;
  while (newOrigin + offsetShift < 0) {
    newRoot = new VNode(
      newRoot && newRoot.array.length ? [undefined, newRoot] : [],
      owner
    );
    newLevel += SHIFT;
    offsetShift += 1 << newLevel;
  }
  if (offsetShift) {
    newOrigin += offsetShift;
    oldOrigin += offsetShift;
    newCapacity += offsetShift;
    oldCapacity += offsetShift;
  }

  var oldTailOffset = getTailOffset(oldCapacity);
  var newTailOffset = getTailOffset(newCapacity);

  // New size might need creating a higher root.
  while (newTailOffset >= 1 << (newLevel + SHIFT)) {
    newRoot = new VNode(
      newRoot && newRoot.array.length ? [newRoot] : [],
      owner
    );
    newLevel += SHIFT;
  }

  // Locate or create the new tail.
  var oldTail = list._tail;
  var newTail =
    newTailOffset < oldTailOffset
      ? listNodeFor(list, newCapacity - 1)
      : newTailOffset > oldTailOffset
      ? new VNode([], owner)
      : oldTail;

  // Merge Tail into tree.
  if (
    oldTail &&
    newTailOffset > oldTailOffset &&
    newOrigin < oldCapacity &&
    oldTail.array.length
  ) {
    newRoot = editableVNode(newRoot, owner);
    var node = newRoot;
    for (var level = newLevel; level > SHIFT; level -= SHIFT) {
      var idx = (oldTailOffset >>> level) & MASK;
      node = node.array[idx] = editableVNode(node.array[idx], owner);
    }
    node.array[(oldTailOffset >>> SHIFT) & MASK] = oldTail;
  }

  // If the size has been reduced, there's a chance the tail needs to be trimmed.
  if (newCapacity < oldCapacity) {
    newTail = newTail && newTail.removeAfter(owner, 0, newCapacity);
  }

  // If the new origin is within the tail, then we do not need a root.
  if (newOrigin >= newTailOffset) {
    newOrigin -= newTailOffset;
    newCapacity -= newTailOffset;
    newLevel = SHIFT;
    newRoot = null;
    newTail = newTail && newTail.removeBefore(owner, 0, newOrigin);

    // Otherwise, if the root has been trimmed, garbage collect.
  } else if (newOrigin > oldOrigin || newTailOffset < oldTailOffset) {
    offsetShift = 0;

    // Identify the new top root node of the subtree of the old root.
    while (newRoot) {
      var beginIndex = (newOrigin >>> newLevel) & MASK;
      if ((beginIndex !== newTailOffset >>> newLevel) & MASK) {
        break;
      }
      if (beginIndex) {
        offsetShift += (1 << newLevel) * beginIndex;
      }
      newLevel -= SHIFT;
      newRoot = newRoot.array[beginIndex];
    }

    // Trim the new sides of the new root.
    if (newRoot && newOrigin > oldOrigin) {
      newRoot = newRoot.removeBefore(owner, newLevel, newOrigin - offsetShift);
    }
    if (newRoot && newTailOffset < oldTailOffset) {
      newRoot = newRoot.removeAfter(
        owner,
        newLevel,
        newTailOffset - offsetShift
      );
    }
    if (offsetShift) {
      newOrigin -= offsetShift;
      newCapacity -= offsetShift;
    }
  }

  if (list.__ownerID) {
    list.size = newCapacity - newOrigin;
    list._origin = newOrigin;
    list._capacity = newCapacity;
    list._level = newLevel;
    list._root = newRoot;
    list._tail = newTail;
    list.__hash = undefined;
    list.__altered = true;
    return list;
  }
  return makeList(newOrigin, newCapacity, newLevel, newRoot, newTail);
}

function getTailOffset(size) {
  return size < SIZE ? 0 : ((size - 1) >>> SHIFT) << SHIFT;
}

var OrderedMap = /*@__PURE__*/(function (Map) {
  function OrderedMap(value) {
    return value === undefined || value === null
      ? emptyOrderedMap()
      : isOrderedMap(value)
      ? value
      : emptyOrderedMap().withMutations(function (map) {
          var iter = KeyedCollection(value);
          assertNotInfinite(iter.size);
          iter.forEach(function (v, k) { return map.set(k, v); });
        });
  }

  if ( Map ) OrderedMap.__proto__ = Map;
  OrderedMap.prototype = Object.create( Map && Map.prototype );
  OrderedMap.prototype.constructor = OrderedMap;

  OrderedMap.of = function of (/*...values*/) {
    return this(arguments);
  };

  OrderedMap.prototype.toString = function toString () {
    return this.__toString('OrderedMap {', '}');
  };

  // @pragma Access

  OrderedMap.prototype.get = function get (k, notSetValue) {
    var index = this._map.get(k);
    return index !== undefined ? this._list.get(index)[1] : notSetValue;
  };

  // @pragma Modification

  OrderedMap.prototype.clear = function clear () {
    if (this.size === 0) {
      return this;
    }
    if (this.__ownerID) {
      this.size = 0;
      this._map.clear();
      this._list.clear();
      this.__altered = true;
      return this;
    }
    return emptyOrderedMap();
  };

  OrderedMap.prototype.set = function set (k, v) {
    return updateOrderedMap(this, k, v);
  };

  OrderedMap.prototype.remove = function remove (k) {
    return updateOrderedMap(this, k, NOT_SET);
  };

  OrderedMap.prototype.__iterate = function __iterate (fn, reverse) {
    var this$1$1 = this;

    return this._list.__iterate(
      function (entry) { return entry && fn(entry[1], entry[0], this$1$1); },
      reverse
    );
  };

  OrderedMap.prototype.__iterator = function __iterator (type, reverse) {
    return this._list.fromEntrySeq().__iterator(type, reverse);
  };

  OrderedMap.prototype.__ensureOwner = function __ensureOwner (ownerID) {
    if (ownerID === this.__ownerID) {
      return this;
    }
    var newMap = this._map.__ensureOwner(ownerID);
    var newList = this._list.__ensureOwner(ownerID);
    if (!ownerID) {
      if (this.size === 0) {
        return emptyOrderedMap();
      }
      this.__ownerID = ownerID;
      this.__altered = false;
      this._map = newMap;
      this._list = newList;
      return this;
    }
    return makeOrderedMap(newMap, newList, ownerID, this.__hash);
  };

  return OrderedMap;
}(Map));

OrderedMap.isOrderedMap = isOrderedMap;

OrderedMap.prototype[IS_ORDERED_SYMBOL] = true;
OrderedMap.prototype[DELETE] = OrderedMap.prototype.remove;

function makeOrderedMap(map, list, ownerID, hash) {
  var omap = Object.create(OrderedMap.prototype);
  omap.size = map ? map.size : 0;
  omap._map = map;
  omap._list = list;
  omap.__ownerID = ownerID;
  omap.__hash = hash;
  omap.__altered = false;
  return omap;
}

var EMPTY_ORDERED_MAP;
function emptyOrderedMap() {
  return (
    EMPTY_ORDERED_MAP ||
    (EMPTY_ORDERED_MAP = makeOrderedMap(emptyMap(), emptyList()))
  );
}

function updateOrderedMap(omap, k, v) {
  var map = omap._map;
  var list = omap._list;
  var i = map.get(k);
  var has = i !== undefined;
  var newMap;
  var newList;
  if (v === NOT_SET) {
    // removed
    if (!has) {
      return omap;
    }
    if (list.size >= SIZE && list.size >= map.size * 2) {
      newList = list.filter(function (entry, idx) { return entry !== undefined && i !== idx; });
      newMap = newList
        .toKeyedSeq()
        .map(function (entry) { return entry[0]; })
        .flip()
        .toMap();
      if (omap.__ownerID) {
        newMap.__ownerID = newList.__ownerID = omap.__ownerID;
      }
    } else {
      newMap = map.remove(k);
      newList = i === list.size - 1 ? list.pop() : list.set(i, undefined);
    }
  } else if (has) {
    if (v === list.get(i)[1]) {
      return omap;
    }
    newMap = map;
    newList = list.set(i, [k, v]);
  } else {
    newMap = map.set(k, list.size);
    newList = list.set(list.size, [k, v]);
  }
  if (omap.__ownerID) {
    omap.size = newMap.size;
    omap._map = newMap;
    omap._list = newList;
    omap.__hash = undefined;
    omap.__altered = true;
    return omap;
  }
  return makeOrderedMap(newMap, newList);
}

var IS_STACK_SYMBOL = '@@__IMMUTABLE_STACK__@@';

function isStack(maybeStack) {
  return Boolean(maybeStack && maybeStack[IS_STACK_SYMBOL]);
}

var Stack = /*@__PURE__*/(function (IndexedCollection) {
  function Stack(value) {
    return value === undefined || value === null
      ? emptyStack()
      : isStack(value)
      ? value
      : emptyStack().pushAll(value);
  }

  if ( IndexedCollection ) Stack.__proto__ = IndexedCollection;
  Stack.prototype = Object.create( IndexedCollection && IndexedCollection.prototype );
  Stack.prototype.constructor = Stack;

  Stack.of = function of (/*...values*/) {
    return this(arguments);
  };

  Stack.prototype.toString = function toString () {
    return this.__toString('Stack [', ']');
  };

  // @pragma Access

  Stack.prototype.get = function get (index, notSetValue) {
    var head = this._head;
    index = wrapIndex(this, index);
    while (head && index--) {
      head = head.next;
    }
    return head ? head.value : notSetValue;
  };

  Stack.prototype.peek = function peek () {
    return this._head && this._head.value;
  };

  // @pragma Modification

  Stack.prototype.push = function push (/*...values*/) {
    var arguments$1 = arguments;

    if (arguments.length === 0) {
      return this;
    }
    var newSize = this.size + arguments.length;
    var head = this._head;
    for (var ii = arguments.length - 1; ii >= 0; ii--) {
      head = {
        value: arguments$1[ii],
        next: head,
      };
    }
    if (this.__ownerID) {
      this.size = newSize;
      this._head = head;
      this.__hash = undefined;
      this.__altered = true;
      return this;
    }
    return makeStack(newSize, head);
  };

  Stack.prototype.pushAll = function pushAll (iter) {
    iter = IndexedCollection(iter);
    if (iter.size === 0) {
      return this;
    }
    if (this.size === 0 && isStack(iter)) {
      return iter;
    }
    assertNotInfinite(iter.size);
    var newSize = this.size;
    var head = this._head;
    iter.__iterate(function (value) {
      newSize++;
      head = {
        value: value,
        next: head,
      };
    }, /* reverse */ true);
    if (this.__ownerID) {
      this.size = newSize;
      this._head = head;
      this.__hash = undefined;
      this.__altered = true;
      return this;
    }
    return makeStack(newSize, head);
  };

  Stack.prototype.pop = function pop () {
    return this.slice(1);
  };

  Stack.prototype.clear = function clear () {
    if (this.size === 0) {
      return this;
    }
    if (this.__ownerID) {
      this.size = 0;
      this._head = undefined;
      this.__hash = undefined;
      this.__altered = true;
      return this;
    }
    return emptyStack();
  };

  Stack.prototype.slice = function slice (begin, end) {
    if (wholeSlice(begin, end, this.size)) {
      return this;
    }
    var resolvedBegin = resolveBegin(begin, this.size);
    var resolvedEnd = resolveEnd(end, this.size);
    if (resolvedEnd !== this.size) {
      // super.slice(begin, end);
      return IndexedCollection.prototype.slice.call(this, begin, end);
    }
    var newSize = this.size - resolvedBegin;
    var head = this._head;
    while (resolvedBegin--) {
      head = head.next;
    }
    if (this.__ownerID) {
      this.size = newSize;
      this._head = head;
      this.__hash = undefined;
      this.__altered = true;
      return this;
    }
    return makeStack(newSize, head);
  };

  // @pragma Mutability

  Stack.prototype.__ensureOwner = function __ensureOwner (ownerID) {
    if (ownerID === this.__ownerID) {
      return this;
    }
    if (!ownerID) {
      if (this.size === 0) {
        return emptyStack();
      }
      this.__ownerID = ownerID;
      this.__altered = false;
      return this;
    }
    return makeStack(this.size, this._head, ownerID, this.__hash);
  };

  // @pragma Iteration

  Stack.prototype.__iterate = function __iterate (fn, reverse) {
    var this$1$1 = this;

    if (reverse) {
      return new ArraySeq(this.toArray()).__iterate(
        function (v, k) { return fn(v, k, this$1$1); },
        reverse
      );
    }
    var iterations = 0;
    var node = this._head;
    while (node) {
      if (fn(node.value, iterations++, this) === false) {
        break;
      }
      node = node.next;
    }
    return iterations;
  };

  Stack.prototype.__iterator = function __iterator (type, reverse) {
    if (reverse) {
      return new ArraySeq(this.toArray()).__iterator(type, reverse);
    }
    var iterations = 0;
    var node = this._head;
    return new Iterator(function () {
      if (node) {
        var value = node.value;
        node = node.next;
        return iteratorValue(type, iterations++, value);
      }
      return iteratorDone();
    });
  };

  return Stack;
}(IndexedCollection));

Stack.isStack = isStack;

var StackPrototype = Stack.prototype;
StackPrototype[IS_STACK_SYMBOL] = true;
StackPrototype.shift = StackPrototype.pop;
StackPrototype.unshift = StackPrototype.push;
StackPrototype.unshiftAll = StackPrototype.pushAll;
StackPrototype.withMutations = withMutations;
StackPrototype.wasAltered = wasAltered;
StackPrototype.asImmutable = asImmutable;
StackPrototype['@@transducer/init'] = StackPrototype.asMutable = asMutable;
StackPrototype['@@transducer/step'] = function (result, arr) {
  return result.unshift(arr);
};
StackPrototype['@@transducer/result'] = function (obj) {
  return obj.asImmutable();
};

function makeStack(size, head, ownerID, hash) {
  var map = Object.create(StackPrototype);
  map.size = size;
  map._head = head;
  map.__ownerID = ownerID;
  map.__hash = hash;
  map.__altered = false;
  return map;
}

var EMPTY_STACK;
function emptyStack() {
  return EMPTY_STACK || (EMPTY_STACK = makeStack(0));
}

var IS_SET_SYMBOL = '@@__IMMUTABLE_SET__@@';

function isSet(maybeSet) {
  return Boolean(maybeSet && maybeSet[IS_SET_SYMBOL]);
}

function isOrderedSet(maybeOrderedSet) {
  return isSet(maybeOrderedSet) && isOrdered(maybeOrderedSet);
}

function deepEqual(a, b) {
  if (a === b) {
    return true;
  }

  if (
    !isCollection(b) ||
    (a.size !== undefined && b.size !== undefined && a.size !== b.size) ||
    (a.__hash !== undefined &&
      b.__hash !== undefined &&
      a.__hash !== b.__hash) ||
    isKeyed(a) !== isKeyed(b) ||
    isIndexed(a) !== isIndexed(b) ||
    isOrdered(a) !== isOrdered(b)
  ) {
    return false;
  }

  if (a.size === 0 && b.size === 0) {
    return true;
  }

  var notAssociative = !isAssociative(a);

  if (isOrdered(a)) {
    var entries = a.entries();
    return (
      b.every(function (v, k) {
        var entry = entries.next().value;
        return entry && is(entry[1], v) && (notAssociative || is(entry[0], k));
      }) && entries.next().done
    );
  }

  var flipped = false;

  if (a.size === undefined) {
    if (b.size === undefined) {
      if (typeof a.cacheResult === 'function') {
        a.cacheResult();
      }
    } else {
      flipped = true;
      var _ = a;
      a = b;
      b = _;
    }
  }

  var allEqual = true;
  var bSize = b.__iterate(function (v, k) {
    if (
      notAssociative
        ? !a.has(v)
        : flipped
        ? !is(v, a.get(k, NOT_SET))
        : !is(a.get(k, NOT_SET), v)
    ) {
      allEqual = false;
      return false;
    }
  });

  return allEqual && a.size === bSize;
}

function mixin(ctor, methods) {
  var keyCopier = function (key) {
    ctor.prototype[key] = methods[key];
  };
  Object.keys(methods).forEach(keyCopier);
  Object.getOwnPropertySymbols &&
    Object.getOwnPropertySymbols(methods).forEach(keyCopier);
  return ctor;
}

function toJS(value) {
  if (!value || typeof value !== 'object') {
    return value;
  }
  if (!isCollection(value)) {
    if (!isDataStructure(value)) {
      return value;
    }
    value = Seq(value);
  }
  if (isKeyed(value)) {
    var result$1 = {};
    value.__iterate(function (v, k) {
      result$1[k] = toJS(v);
    });
    return result$1;
  }
  var result = [];
  value.__iterate(function (v) {
    result.push(toJS(v));
  });
  return result;
}

var Set = /*@__PURE__*/(function (SetCollection) {
  function Set(value) {
    return value === undefined || value === null
      ? emptySet()
      : isSet(value) && !isOrdered(value)
      ? value
      : emptySet().withMutations(function (set) {
          var iter = SetCollection(value);
          assertNotInfinite(iter.size);
          iter.forEach(function (v) { return set.add(v); });
        });
  }

  if ( SetCollection ) Set.__proto__ = SetCollection;
  Set.prototype = Object.create( SetCollection && SetCollection.prototype );
  Set.prototype.constructor = Set;

  Set.of = function of (/*...values*/) {
    return this(arguments);
  };

  Set.fromKeys = function fromKeys (value) {
    return this(KeyedCollection(value).keySeq());
  };

  Set.intersect = function intersect (sets) {
    sets = Collection(sets).toArray();
    return sets.length
      ? SetPrototype.intersect.apply(Set(sets.pop()), sets)
      : emptySet();
  };

  Set.union = function union (sets) {
    sets = Collection(sets).toArray();
    return sets.length
      ? SetPrototype.union.apply(Set(sets.pop()), sets)
      : emptySet();
  };

  Set.prototype.toString = function toString () {
    return this.__toString('Set {', '}');
  };

  // @pragma Access

  Set.prototype.has = function has (value) {
    return this._map.has(value);
  };

  // @pragma Modification

  Set.prototype.add = function add (value) {
    return updateSet(this, this._map.set(value, value));
  };

  Set.prototype.remove = function remove (value) {
    return updateSet(this, this._map.remove(value));
  };

  Set.prototype.clear = function clear () {
    return updateSet(this, this._map.clear());
  };

  // @pragma Composition

  Set.prototype.map = function map (mapper, context) {
    var this$1$1 = this;

    // keep track if the set is altered by the map function
    var didChanges = false;

    var newMap = updateSet(
      this,
      this._map.mapEntries(function (ref) {
        var v = ref[1];

        var mapped = mapper.call(context, v, v, this$1$1);

        if (mapped !== v) {
          didChanges = true;
        }

        return [mapped, mapped];
      }, context)
    );

    return didChanges ? newMap : this;
  };

  Set.prototype.union = function union () {
    var iters = [], len = arguments.length;
    while ( len-- ) iters[ len ] = arguments[ len ];

    iters = iters.filter(function (x) { return x.size !== 0; });
    if (iters.length === 0) {
      return this;
    }
    if (this.size === 0 && !this.__ownerID && iters.length === 1) {
      return this.constructor(iters[0]);
    }
    return this.withMutations(function (set) {
      for (var ii = 0; ii < iters.length; ii++) {
        SetCollection(iters[ii]).forEach(function (value) { return set.add(value); });
      }
    });
  };

  Set.prototype.intersect = function intersect () {
    var iters = [], len = arguments.length;
    while ( len-- ) iters[ len ] = arguments[ len ];

    if (iters.length === 0) {
      return this;
    }
    iters = iters.map(function (iter) { return SetCollection(iter); });
    var toRemove = [];
    this.forEach(function (value) {
      if (!iters.every(function (iter) { return iter.includes(value); })) {
        toRemove.push(value);
      }
    });
    return this.withMutations(function (set) {
      toRemove.forEach(function (value) {
        set.remove(value);
      });
    });
  };

  Set.prototype.subtract = function subtract () {
    var iters = [], len = arguments.length;
    while ( len-- ) iters[ len ] = arguments[ len ];

    if (iters.length === 0) {
      return this;
    }
    iters = iters.map(function (iter) { return SetCollection(iter); });
    var toRemove = [];
    this.forEach(function (value) {
      if (iters.some(function (iter) { return iter.includes(value); })) {
        toRemove.push(value);
      }
    });
    return this.withMutations(function (set) {
      toRemove.forEach(function (value) {
        set.remove(value);
      });
    });
  };

  Set.prototype.sort = function sort (comparator) {
    // Late binding
    return OrderedSet(sortFactory(this, comparator));
  };

  Set.prototype.sortBy = function sortBy (mapper, comparator) {
    // Late binding
    return OrderedSet(sortFactory(this, comparator, mapper));
  };

  Set.prototype.wasAltered = function wasAltered () {
    return this._map.wasAltered();
  };

  Set.prototype.__iterate = function __iterate (fn, reverse) {
    var this$1$1 = this;

    return this._map.__iterate(function (k) { return fn(k, k, this$1$1); }, reverse);
  };

  Set.prototype.__iterator = function __iterator (type, reverse) {
    return this._map.__iterator(type, reverse);
  };

  Set.prototype.__ensureOwner = function __ensureOwner (ownerID) {
    if (ownerID === this.__ownerID) {
      return this;
    }
    var newMap = this._map.__ensureOwner(ownerID);
    if (!ownerID) {
      if (this.size === 0) {
        return this.__empty();
      }
      this.__ownerID = ownerID;
      this._map = newMap;
      return this;
    }
    return this.__make(newMap, ownerID);
  };

  return Set;
}(SetCollection));

Set.isSet = isSet;

var SetPrototype = Set.prototype;
SetPrototype[IS_SET_SYMBOL] = true;
SetPrototype[DELETE] = SetPrototype.remove;
SetPrototype.merge = SetPrototype.concat = SetPrototype.union;
SetPrototype.withMutations = withMutations;
SetPrototype.asImmutable = asImmutable;
SetPrototype['@@transducer/init'] = SetPrototype.asMutable = asMutable;
SetPrototype['@@transducer/step'] = function (result, arr) {
  return result.add(arr);
};
SetPrototype['@@transducer/result'] = function (obj) {
  return obj.asImmutable();
};

SetPrototype.__empty = emptySet;
SetPrototype.__make = makeSet;

function updateSet(set, newMap) {
  if (set.__ownerID) {
    set.size = newMap.size;
    set._map = newMap;
    return set;
  }
  return newMap === set._map
    ? set
    : newMap.size === 0
    ? set.__empty()
    : set.__make(newMap);
}

function makeSet(map, ownerID) {
  var set = Object.create(SetPrototype);
  set.size = map ? map.size : 0;
  set._map = map;
  set.__ownerID = ownerID;
  return set;
}

var EMPTY_SET;
function emptySet() {
  return EMPTY_SET || (EMPTY_SET = makeSet(emptyMap()));
}

/**
 * Returns a lazy seq of nums from start (inclusive) to end
 * (exclusive), by step, where start defaults to 0, step to 1, and end to
 * infinity. When start is equal to end, returns empty list.
 */
var Range = /*@__PURE__*/(function (IndexedSeq) {
  function Range(start, end, step) {
    if (!(this instanceof Range)) {
      return new Range(start, end, step);
    }
    invariant(step !== 0, 'Cannot step a Range by 0');
    start = start || 0;
    if (end === undefined) {
      end = Infinity;
    }
    step = step === undefined ? 1 : Math.abs(step);
    if (end < start) {
      step = -step;
    }
    this._start = start;
    this._end = end;
    this._step = step;
    this.size = Math.max(0, Math.ceil((end - start) / step - 1) + 1);
    if (this.size === 0) {
      if (EMPTY_RANGE) {
        return EMPTY_RANGE;
      }
      EMPTY_RANGE = this;
    }
  }

  if ( IndexedSeq ) Range.__proto__ = IndexedSeq;
  Range.prototype = Object.create( IndexedSeq && IndexedSeq.prototype );
  Range.prototype.constructor = Range;

  Range.prototype.toString = function toString () {
    if (this.size === 0) {
      return 'Range []';
    }
    return (
      'Range [ ' +
      this._start +
      '...' +
      this._end +
      (this._step !== 1 ? ' by ' + this._step : '') +
      ' ]'
    );
  };

  Range.prototype.get = function get (index, notSetValue) {
    return this.has(index)
      ? this._start + wrapIndex(this, index) * this._step
      : notSetValue;
  };

  Range.prototype.includes = function includes (searchValue) {
    var possibleIndex = (searchValue - this._start) / this._step;
    return (
      possibleIndex >= 0 &&
      possibleIndex < this.size &&
      possibleIndex === Math.floor(possibleIndex)
    );
  };

  Range.prototype.slice = function slice (begin, end) {
    if (wholeSlice(begin, end, this.size)) {
      return this;
    }
    begin = resolveBegin(begin, this.size);
    end = resolveEnd(end, this.size);
    if (end <= begin) {
      return new Range(0, 0);
    }
    return new Range(
      this.get(begin, this._end),
      this.get(end, this._end),
      this._step
    );
  };

  Range.prototype.indexOf = function indexOf (searchValue) {
    var offsetValue = searchValue - this._start;
    if (offsetValue % this._step === 0) {
      var index = offsetValue / this._step;
      if (index >= 0 && index < this.size) {
        return index;
      }
    }
    return -1;
  };

  Range.prototype.lastIndexOf = function lastIndexOf (searchValue) {
    return this.indexOf(searchValue);
  };

  Range.prototype.__iterate = function __iterate (fn, reverse) {
    var size = this.size;
    var step = this._step;
    var value = reverse ? this._start + (size - 1) * step : this._start;
    var i = 0;
    while (i !== size) {
      if (fn(value, reverse ? size - ++i : i++, this) === false) {
        break;
      }
      value += reverse ? -step : step;
    }
    return i;
  };

  Range.prototype.__iterator = function __iterator (type, reverse) {
    var size = this.size;
    var step = this._step;
    var value = reverse ? this._start + (size - 1) * step : this._start;
    var i = 0;
    return new Iterator(function () {
      if (i === size) {
        return iteratorDone();
      }
      var v = value;
      value += reverse ? -step : step;
      return iteratorValue(type, reverse ? size - ++i : i++, v);
    });
  };

  Range.prototype.equals = function equals (other) {
    return other instanceof Range
      ? this._start === other._start &&
          this._end === other._end &&
          this._step === other._step
      : deepEqual(this, other);
  };

  return Range;
}(IndexedSeq));

var EMPTY_RANGE;

function getIn$1(collection, searchKeyPath, notSetValue) {
  var keyPath = coerceKeyPath(searchKeyPath);
  var i = 0;
  while (i !== keyPath.length) {
    collection = get(collection, keyPath[i++], NOT_SET);
    if (collection === NOT_SET) {
      return notSetValue;
    }
  }
  return collection;
}

function getIn(searchKeyPath, notSetValue) {
  return getIn$1(this, searchKeyPath, notSetValue);
}

function hasIn$1(collection, keyPath) {
  return getIn$1(collection, keyPath, NOT_SET) !== NOT_SET;
}

function hasIn(searchKeyPath) {
  return hasIn$1(this, searchKeyPath);
}

function toObject() {
  assertNotInfinite(this.size);
  var object = {};
  this.__iterate(function (v, k) {
    object[k] = v;
  });
  return object;
}

// Note: all of these methods are deprecated.
Collection.isIterable = isCollection;
Collection.isKeyed = isKeyed;
Collection.isIndexed = isIndexed;
Collection.isAssociative = isAssociative;
Collection.isOrdered = isOrdered;

Collection.Iterator = Iterator;

mixin(Collection, {
  // ### Conversion to other types

  toArray: function toArray() {
    assertNotInfinite(this.size);
    var array = new Array(this.size || 0);
    var useTuples = isKeyed(this);
    var i = 0;
    this.__iterate(function (v, k) {
      // Keyed collections produce an array of tuples.
      array[i++] = useTuples ? [k, v] : v;
    });
    return array;
  },

  toIndexedSeq: function toIndexedSeq() {
    return new ToIndexedSequence(this);
  },

  toJS: function toJS$1() {
    return toJS(this);
  },

  toKeyedSeq: function toKeyedSeq() {
    return new ToKeyedSequence(this, true);
  },

  toMap: function toMap() {
    // Use Late Binding here to solve the circular dependency.
    return Map(this.toKeyedSeq());
  },

  toObject: toObject,

  toOrderedMap: function toOrderedMap() {
    // Use Late Binding here to solve the circular dependency.
    return OrderedMap(this.toKeyedSeq());
  },

  toOrderedSet: function toOrderedSet() {
    // Use Late Binding here to solve the circular dependency.
    return OrderedSet(isKeyed(this) ? this.valueSeq() : this);
  },

  toSet: function toSet() {
    // Use Late Binding here to solve the circular dependency.
    return Set(isKeyed(this) ? this.valueSeq() : this);
  },

  toSetSeq: function toSetSeq() {
    return new ToSetSequence(this);
  },

  toSeq: function toSeq() {
    return isIndexed(this)
      ? this.toIndexedSeq()
      : isKeyed(this)
      ? this.toKeyedSeq()
      : this.toSetSeq();
  },

  toStack: function toStack() {
    // Use Late Binding here to solve the circular dependency.
    return Stack(isKeyed(this) ? this.valueSeq() : this);
  },

  toList: function toList() {
    // Use Late Binding here to solve the circular dependency.
    return List(isKeyed(this) ? this.valueSeq() : this);
  },

  // ### Common JavaScript methods and properties

  toString: function toString() {
    return '[Collection]';
  },

  __toString: function __toString(head, tail) {
    if (this.size === 0) {
      return head + tail;
    }
    return (
      head +
      ' ' +
      this.toSeq().map(this.__toStringMapper).join(', ') +
      ' ' +
      tail
    );
  },

  // ### ES6 Collection methods (ES6 Array and Map)

  concat: function concat() {
    var values = [], len = arguments.length;
    while ( len-- ) values[ len ] = arguments[ len ];

    return reify(this, concatFactory(this, values));
  },

  includes: function includes(searchValue) {
    return this.some(function (value) { return is(value, searchValue); });
  },

  entries: function entries() {
    return this.__iterator(ITERATE_ENTRIES);
  },

  every: function every(predicate, context) {
    assertNotInfinite(this.size);
    var returnValue = true;
    this.__iterate(function (v, k, c) {
      if (!predicate.call(context, v, k, c)) {
        returnValue = false;
        return false;
      }
    });
    return returnValue;
  },

  filter: function filter(predicate, context) {
    return reify(this, filterFactory(this, predicate, context, true));
  },

  find: function find(predicate, context, notSetValue) {
    var entry = this.findEntry(predicate, context);
    return entry ? entry[1] : notSetValue;
  },

  forEach: function forEach(sideEffect, context) {
    assertNotInfinite(this.size);
    return this.__iterate(context ? sideEffect.bind(context) : sideEffect);
  },

  join: function join(separator) {
    assertNotInfinite(this.size);
    separator = separator !== undefined ? '' + separator : ',';
    var joined = '';
    var isFirst = true;
    this.__iterate(function (v) {
      isFirst ? (isFirst = false) : (joined += separator);
      joined += v !== null && v !== undefined ? v.toString() : '';
    });
    return joined;
  },

  keys: function keys() {
    return this.__iterator(ITERATE_KEYS);
  },

  map: function map(mapper, context) {
    return reify(this, mapFactory(this, mapper, context));
  },

  reduce: function reduce$1(reducer, initialReduction, context) {
    return reduce(
      this,
      reducer,
      initialReduction,
      context,
      arguments.length < 2,
      false
    );
  },

  reduceRight: function reduceRight(reducer, initialReduction, context) {
    return reduce(
      this,
      reducer,
      initialReduction,
      context,
      arguments.length < 2,
      true
    );
  },

  reverse: function reverse() {
    return reify(this, reverseFactory(this, true));
  },

  slice: function slice(begin, end) {
    return reify(this, sliceFactory(this, begin, end, true));
  },

  some: function some(predicate, context) {
    return !this.every(not(predicate), context);
  },

  sort: function sort(comparator) {
    return reify(this, sortFactory(this, comparator));
  },

  values: function values() {
    return this.__iterator(ITERATE_VALUES);
  },

  // ### More sequential methods

  butLast: function butLast() {
    return this.slice(0, -1);
  },

  isEmpty: function isEmpty() {
    return this.size !== undefined ? this.size === 0 : !this.some(function () { return true; });
  },

  count: function count(predicate, context) {
    return ensureSize(
      predicate ? this.toSeq().filter(predicate, context) : this
    );
  },

  countBy: function countBy(grouper, context) {
    return countByFactory(this, grouper, context);
  },

  equals: function equals(other) {
    return deepEqual(this, other);
  },

  entrySeq: function entrySeq() {
    var collection = this;
    if (collection._cache) {
      // We cache as an entries array, so we can just return the cache!
      return new ArraySeq(collection._cache);
    }
    var entriesSequence = collection.toSeq().map(entryMapper).toIndexedSeq();
    entriesSequence.fromEntrySeq = function () { return collection.toSeq(); };
    return entriesSequence;
  },

  filterNot: function filterNot(predicate, context) {
    return this.filter(not(predicate), context);
  },

  findEntry: function findEntry(predicate, context, notSetValue) {
    var found = notSetValue;
    this.__iterate(function (v, k, c) {
      if (predicate.call(context, v, k, c)) {
        found = [k, v];
        return false;
      }
    });
    return found;
  },

  findKey: function findKey(predicate, context) {
    var entry = this.findEntry(predicate, context);
    return entry && entry[0];
  },

  findLast: function findLast(predicate, context, notSetValue) {
    return this.toKeyedSeq().reverse().find(predicate, context, notSetValue);
  },

  findLastEntry: function findLastEntry(predicate, context, notSetValue) {
    return this.toKeyedSeq()
      .reverse()
      .findEntry(predicate, context, notSetValue);
  },

  findLastKey: function findLastKey(predicate, context) {
    return this.toKeyedSeq().reverse().findKey(predicate, context);
  },

  first: function first(notSetValue) {
    return this.find(returnTrue, null, notSetValue);
  },

  flatMap: function flatMap(mapper, context) {
    return reify(this, flatMapFactory(this, mapper, context));
  },

  flatten: function flatten(depth) {
    return reify(this, flattenFactory(this, depth, true));
  },

  fromEntrySeq: function fromEntrySeq() {
    return new FromEntriesSequence(this);
  },

  get: function get(searchKey, notSetValue) {
    return this.find(function (_, key) { return is(key, searchKey); }, undefined, notSetValue);
  },

  getIn: getIn,

  groupBy: function groupBy(grouper, context) {
    return groupByFactory(this, grouper, context);
  },

  has: function has(searchKey) {
    return this.get(searchKey, NOT_SET) !== NOT_SET;
  },

  hasIn: hasIn,

  isSubset: function isSubset(iter) {
    iter = typeof iter.includes === 'function' ? iter : Collection(iter);
    return this.every(function (value) { return iter.includes(value); });
  },

  isSuperset: function isSuperset(iter) {
    iter = typeof iter.isSubset === 'function' ? iter : Collection(iter);
    return iter.isSubset(this);
  },

  keyOf: function keyOf(searchValue) {
    return this.findKey(function (value) { return is(value, searchValue); });
  },

  keySeq: function keySeq() {
    return this.toSeq().map(keyMapper).toIndexedSeq();
  },

  last: function last(notSetValue) {
    return this.toSeq().reverse().first(notSetValue);
  },

  lastKeyOf: function lastKeyOf(searchValue) {
    return this.toKeyedSeq().reverse().keyOf(searchValue);
  },

  max: function max(comparator) {
    return maxFactory(this, comparator);
  },

  maxBy: function maxBy(mapper, comparator) {
    return maxFactory(this, comparator, mapper);
  },

  min: function min(comparator) {
    return maxFactory(
      this,
      comparator ? neg(comparator) : defaultNegComparator
    );
  },

  minBy: function minBy(mapper, comparator) {
    return maxFactory(
      this,
      comparator ? neg(comparator) : defaultNegComparator,
      mapper
    );
  },

  rest: function rest() {
    return this.slice(1);
  },

  skip: function skip(amount) {
    return amount === 0 ? this : this.slice(Math.max(0, amount));
  },

  skipLast: function skipLast(amount) {
    return amount === 0 ? this : this.slice(0, -Math.max(0, amount));
  },

  skipWhile: function skipWhile(predicate, context) {
    return reify(this, skipWhileFactory(this, predicate, context, true));
  },

  skipUntil: function skipUntil(predicate, context) {
    return this.skipWhile(not(predicate), context);
  },

  sortBy: function sortBy(mapper, comparator) {
    return reify(this, sortFactory(this, comparator, mapper));
  },

  take: function take(amount) {
    return this.slice(0, Math.max(0, amount));
  },

  takeLast: function takeLast(amount) {
    return this.slice(-Math.max(0, amount));
  },

  takeWhile: function takeWhile(predicate, context) {
    return reify(this, takeWhileFactory(this, predicate, context));
  },

  takeUntil: function takeUntil(predicate, context) {
    return this.takeWhile(not(predicate), context);
  },

  update: function update(fn) {
    return fn(this);
  },

  valueSeq: function valueSeq() {
    return this.toIndexedSeq();
  },

  // ### Hashable Object

  hashCode: function hashCode() {
    return this.__hash || (this.__hash = hashCollection(this));
  },

  // ### Internal

  // abstract __iterate(fn, reverse)

  // abstract __iterator(type, reverse)
});

var CollectionPrototype = Collection.prototype;
CollectionPrototype[IS_COLLECTION_SYMBOL] = true;
CollectionPrototype[ITERATOR_SYMBOL] = CollectionPrototype.values;
CollectionPrototype.toJSON = CollectionPrototype.toArray;
CollectionPrototype.__toStringMapper = quoteString;
CollectionPrototype.inspect = CollectionPrototype.toSource = function () {
  return this.toString();
};
CollectionPrototype.chain = CollectionPrototype.flatMap;
CollectionPrototype.contains = CollectionPrototype.includes;

mixin(KeyedCollection, {
  // ### More sequential methods

  flip: function flip() {
    return reify(this, flipFactory(this));
  },

  mapEntries: function mapEntries(mapper, context) {
    var this$1$1 = this;

    var iterations = 0;
    return reify(
      this,
      this.toSeq()
        .map(function (v, k) { return mapper.call(context, [k, v], iterations++, this$1$1); })
        .fromEntrySeq()
    );
  },

  mapKeys: function mapKeys(mapper, context) {
    var this$1$1 = this;

    return reify(
      this,
      this.toSeq()
        .flip()
        .map(function (k, v) { return mapper.call(context, k, v, this$1$1); })
        .flip()
    );
  },
});

var KeyedCollectionPrototype = KeyedCollection.prototype;
KeyedCollectionPrototype[IS_KEYED_SYMBOL] = true;
KeyedCollectionPrototype[ITERATOR_SYMBOL] = CollectionPrototype.entries;
KeyedCollectionPrototype.toJSON = toObject;
KeyedCollectionPrototype.__toStringMapper = function (v, k) { return quoteString(k) + ': ' + quoteString(v); };

mixin(IndexedCollection, {
  // ### Conversion to other types

  toKeyedSeq: function toKeyedSeq() {
    return new ToKeyedSequence(this, false);
  },

  // ### ES6 Collection methods (ES6 Array and Map)

  filter: function filter(predicate, context) {
    return reify(this, filterFactory(this, predicate, context, false));
  },

  findIndex: function findIndex(predicate, context) {
    var entry = this.findEntry(predicate, context);
    return entry ? entry[0] : -1;
  },

  indexOf: function indexOf(searchValue) {
    var key = this.keyOf(searchValue);
    return key === undefined ? -1 : key;
  },

  lastIndexOf: function lastIndexOf(searchValue) {
    var key = this.lastKeyOf(searchValue);
    return key === undefined ? -1 : key;
  },

  reverse: function reverse() {
    return reify(this, reverseFactory(this, false));
  },

  slice: function slice(begin, end) {
    return reify(this, sliceFactory(this, begin, end, false));
  },

  splice: function splice(index, removeNum /*, ...values*/) {
    var numArgs = arguments.length;
    removeNum = Math.max(removeNum || 0, 0);
    if (numArgs === 0 || (numArgs === 2 && !removeNum)) {
      return this;
    }
    // If index is negative, it should resolve relative to the size of the
    // collection. However size may be expensive to compute if not cached, so
    // only call count() if the number is in fact negative.
    index = resolveBegin(index, index < 0 ? this.count() : this.size);
    var spliced = this.slice(0, index);
    return reify(
      this,
      numArgs === 1
        ? spliced
        : spliced.concat(arrCopy(arguments, 2), this.slice(index + removeNum))
    );
  },

  // ### More collection methods

  findLastIndex: function findLastIndex(predicate, context) {
    var entry = this.findLastEntry(predicate, context);
    return entry ? entry[0] : -1;
  },

  first: function first(notSetValue) {
    return this.get(0, notSetValue);
  },

  flatten: function flatten(depth) {
    return reify(this, flattenFactory(this, depth, false));
  },

  get: function get(index, notSetValue) {
    index = wrapIndex(this, index);
    return index < 0 ||
      this.size === Infinity ||
      (this.size !== undefined && index > this.size)
      ? notSetValue
      : this.find(function (_, key) { return key === index; }, undefined, notSetValue);
  },

  has: function has(index) {
    index = wrapIndex(this, index);
    return (
      index >= 0 &&
      (this.size !== undefined
        ? this.size === Infinity || index < this.size
        : this.indexOf(index) !== -1)
    );
  },

  interpose: function interpose(separator) {
    return reify(this, interposeFactory(this, separator));
  },

  interleave: function interleave(/*...collections*/) {
    var collections = [this].concat(arrCopy(arguments));
    var zipped = zipWithFactory(this.toSeq(), IndexedSeq.of, collections);
    var interleaved = zipped.flatten(true);
    if (zipped.size) {
      interleaved.size = zipped.size * collections.length;
    }
    return reify(this, interleaved);
  },

  keySeq: function keySeq() {
    return Range(0, this.size);
  },

  last: function last(notSetValue) {
    return this.get(-1, notSetValue);
  },

  skipWhile: function skipWhile(predicate, context) {
    return reify(this, skipWhileFactory(this, predicate, context, false));
  },

  zip: function zip(/*, ...collections */) {
    var collections = [this].concat(arrCopy(arguments));
    return reify(this, zipWithFactory(this, defaultZipper, collections));
  },

  zipAll: function zipAll(/*, ...collections */) {
    var collections = [this].concat(arrCopy(arguments));
    return reify(this, zipWithFactory(this, defaultZipper, collections, true));
  },

  zipWith: function zipWith(zipper /*, ...collections */) {
    var collections = arrCopy(arguments);
    collections[0] = this;
    return reify(this, zipWithFactory(this, zipper, collections));
  },
});

var IndexedCollectionPrototype = IndexedCollection.prototype;
IndexedCollectionPrototype[IS_INDEXED_SYMBOL] = true;
IndexedCollectionPrototype[IS_ORDERED_SYMBOL] = true;

mixin(SetCollection, {
  // ### ES6 Collection methods (ES6 Array and Map)

  get: function get(value, notSetValue) {
    return this.has(value) ? value : notSetValue;
  },

  includes: function includes(value) {
    return this.has(value);
  },

  // ### More sequential methods

  keySeq: function keySeq() {
    return this.valueSeq();
  },
});

var SetCollectionPrototype = SetCollection.prototype;
SetCollectionPrototype.has = CollectionPrototype.includes;
SetCollectionPrototype.contains = SetCollectionPrototype.includes;
SetCollectionPrototype.keys = SetCollectionPrototype.values;

// Mixin subclasses

mixin(KeyedSeq, KeyedCollectionPrototype);
mixin(IndexedSeq, IndexedCollectionPrototype);
mixin(SetSeq, SetCollectionPrototype);

// #pragma Helper functions

function reduce(collection, reducer, reduction, context, useFirst, reverse) {
  assertNotInfinite(collection.size);
  collection.__iterate(function (v, k, c) {
    if (useFirst) {
      useFirst = false;
      reduction = v;
    } else {
      reduction = reducer.call(context, reduction, v, k, c);
    }
  }, reverse);
  return reduction;
}

function keyMapper(v, k) {
  return k;
}

function entryMapper(v, k) {
  return [k, v];
}

function not(predicate) {
  return function () {
    return !predicate.apply(this, arguments);
  };
}

function neg(predicate) {
  return function () {
    return -predicate.apply(this, arguments);
  };
}

function defaultZipper() {
  return arrCopy(arguments);
}

function defaultNegComparator(a, b) {
  return a < b ? 1 : a > b ? -1 : 0;
}

function hashCollection(collection) {
  if (collection.size === Infinity) {
    return 0;
  }
  var ordered = isOrdered(collection);
  var keyed = isKeyed(collection);
  var h = ordered ? 1 : 0;
  var size = collection.__iterate(
    keyed
      ? ordered
        ? function (v, k) {
            h = (31 * h + hashMerge(hash(v), hash(k))) | 0;
          }
        : function (v, k) {
            h = (h + hashMerge(hash(v), hash(k))) | 0;
          }
      : ordered
      ? function (v) {
          h = (31 * h + hash(v)) | 0;
        }
      : function (v) {
          h = (h + hash(v)) | 0;
        }
  );
  return murmurHashOfSize(size, h);
}

function murmurHashOfSize(size, h) {
  h = imul(h, 0xcc9e2d51);
  h = imul((h << 15) | (h >>> -15), 0x1b873593);
  h = imul((h << 13) | (h >>> -13), 5);
  h = ((h + 0xe6546b64) | 0) ^ size;
  h = imul(h ^ (h >>> 16), 0x85ebca6b);
  h = imul(h ^ (h >>> 13), 0xc2b2ae35);
  h = smi(h ^ (h >>> 16));
  return h;
}

function hashMerge(a, b) {
  return (a ^ (b + 0x9e3779b9 + (a << 6) + (a >> 2))) | 0; // int
}

var OrderedSet = /*@__PURE__*/(function (Set) {
  function OrderedSet(value) {
    return value === undefined || value === null
      ? emptyOrderedSet()
      : isOrderedSet(value)
      ? value
      : emptyOrderedSet().withMutations(function (set) {
          var iter = SetCollection(value);
          assertNotInfinite(iter.size);
          iter.forEach(function (v) { return set.add(v); });
        });
  }

  if ( Set ) OrderedSet.__proto__ = Set;
  OrderedSet.prototype = Object.create( Set && Set.prototype );
  OrderedSet.prototype.constructor = OrderedSet;

  OrderedSet.of = function of (/*...values*/) {
    return this(arguments);
  };

  OrderedSet.fromKeys = function fromKeys (value) {
    return this(KeyedCollection(value).keySeq());
  };

  OrderedSet.prototype.toString = function toString () {
    return this.__toString('OrderedSet {', '}');
  };

  return OrderedSet;
}(Set));

OrderedSet.isOrderedSet = isOrderedSet;

var OrderedSetPrototype = OrderedSet.prototype;
OrderedSetPrototype[IS_ORDERED_SYMBOL] = true;
OrderedSetPrototype.zip = IndexedCollectionPrototype.zip;
OrderedSetPrototype.zipWith = IndexedCollectionPrototype.zipWith;
OrderedSetPrototype.zipAll = IndexedCollectionPrototype.zipAll;

OrderedSetPrototype.__empty = emptyOrderedSet;
OrderedSetPrototype.__make = makeOrderedSet;

function makeOrderedSet(map, ownerID) {
  var set = Object.create(OrderedSetPrototype);
  set.size = map ? map.size : 0;
  set._map = map;
  set.__ownerID = ownerID;
  return set;
}

var EMPTY_ORDERED_SET;
function emptyOrderedSet() {
  return (
    EMPTY_ORDERED_SET || (EMPTY_ORDERED_SET = makeOrderedSet(emptyOrderedMap()))
  );
}

function throwOnInvalidDefaultValues(defaultValues) {
  if (isRecord(defaultValues)) {
    throw new Error(
      'Can not call `Record` with an immutable Record as default values. Use a plain javascript object instead.'
    );
  }

  if (isImmutable(defaultValues)) {
    throw new Error(
      'Can not call `Record` with an immutable Collection as default values. Use a plain javascript object instead.'
    );
  }

  if (defaultValues === null || typeof defaultValues !== 'object') {
    throw new Error(
      'Can not call `Record` with a non-object as default values. Use a plain javascript object instead.'
    );
  }
}

var Record = function Record(defaultValues, name) {
  var hasInitialized;

  throwOnInvalidDefaultValues(defaultValues);

  var RecordType = function Record(values) {
    var this$1$1 = this;

    if (values instanceof RecordType) {
      return values;
    }
    if (!(this instanceof RecordType)) {
      return new RecordType(values);
    }
    if (!hasInitialized) {
      hasInitialized = true;
      var keys = Object.keys(defaultValues);
      var indices = (RecordTypePrototype._indices = {});
      // Deprecated: left to attempt not to break any external code which
      // relies on a ._name property existing on record instances.
      // Use Record.getDescriptiveName() instead
      RecordTypePrototype._name = name;
      RecordTypePrototype._keys = keys;
      RecordTypePrototype._defaultValues = defaultValues;
      for (var i = 0; i < keys.length; i++) {
        var propName = keys[i];
        indices[propName] = i;
        if (RecordTypePrototype[propName]) {
          /* eslint-disable no-console */
          typeof console === 'object' &&
            console.warn &&
            console.warn(
              'Cannot define ' +
                recordName(this) +
                ' with property "' +
                propName +
                '" since that property name is part of the Record API.'
            );
          /* eslint-enable no-console */
        } else {
          setProp(RecordTypePrototype, propName);
        }
      }
    }
    this.__ownerID = undefined;
    this._values = List().withMutations(function (l) {
      l.setSize(this$1$1._keys.length);
      KeyedCollection(values).forEach(function (v, k) {
        l.set(this$1$1._indices[k], v === this$1$1._defaultValues[k] ? undefined : v);
      });
    });
    return this;
  };

  var RecordTypePrototype = (RecordType.prototype =
    Object.create(RecordPrototype));
  RecordTypePrototype.constructor = RecordType;

  if (name) {
    RecordType.displayName = name;
  }

  return RecordType;
};

Record.prototype.toString = function toString () {
  var str = recordName(this) + ' { ';
  var keys = this._keys;
  var k;
  for (var i = 0, l = keys.length; i !== l; i++) {
    k = keys[i];
    str += (i ? ', ' : '') + k + ': ' + quoteString(this.get(k));
  }
  return str + ' }';
};

Record.prototype.equals = function equals (other) {
  return (
    this === other ||
    (isRecord(other) && recordSeq(this).equals(recordSeq(other)))
  );
};

Record.prototype.hashCode = function hashCode () {
  return recordSeq(this).hashCode();
};

// @pragma Access

Record.prototype.has = function has (k) {
  return this._indices.hasOwnProperty(k);
};

Record.prototype.get = function get (k, notSetValue) {
  if (!this.has(k)) {
    return notSetValue;
  }
  var index = this._indices[k];
  var value = this._values.get(index);
  return value === undefined ? this._defaultValues[k] : value;
};

// @pragma Modification

Record.prototype.set = function set (k, v) {
  if (this.has(k)) {
    var newValues = this._values.set(
      this._indices[k],
      v === this._defaultValues[k] ? undefined : v
    );
    if (newValues !== this._values && !this.__ownerID) {
      return makeRecord(this, newValues);
    }
  }
  return this;
};

Record.prototype.remove = function remove (k) {
  return this.set(k);
};

Record.prototype.clear = function clear () {
  var newValues = this._values.clear().setSize(this._keys.length);

  return this.__ownerID ? this : makeRecord(this, newValues);
};

Record.prototype.wasAltered = function wasAltered () {
  return this._values.wasAltered();
};

Record.prototype.toSeq = function toSeq () {
  return recordSeq(this);
};

Record.prototype.toJS = function toJS$1 () {
  return toJS(this);
};

Record.prototype.entries = function entries () {
  return this.__iterator(ITERATE_ENTRIES);
};

Record.prototype.__iterator = function __iterator (type, reverse) {
  return recordSeq(this).__iterator(type, reverse);
};

Record.prototype.__iterate = function __iterate (fn, reverse) {
  return recordSeq(this).__iterate(fn, reverse);
};

Record.prototype.__ensureOwner = function __ensureOwner (ownerID) {
  if (ownerID === this.__ownerID) {
    return this;
  }
  var newValues = this._values.__ensureOwner(ownerID);
  if (!ownerID) {
    this.__ownerID = ownerID;
    this._values = newValues;
    return this;
  }
  return makeRecord(this, newValues, ownerID);
};

Record.isRecord = isRecord;
Record.getDescriptiveName = recordName;
var RecordPrototype = Record.prototype;
RecordPrototype[IS_RECORD_SYMBOL] = true;
RecordPrototype[DELETE] = RecordPrototype.remove;
RecordPrototype.deleteIn = RecordPrototype.removeIn = deleteIn;
RecordPrototype.getIn = getIn;
RecordPrototype.hasIn = CollectionPrototype.hasIn;
RecordPrototype.merge = merge$1;
RecordPrototype.mergeWith = mergeWith$1;
RecordPrototype.mergeIn = mergeIn;
RecordPrototype.mergeDeep = mergeDeep;
RecordPrototype.mergeDeepWith = mergeDeepWith;
RecordPrototype.mergeDeepIn = mergeDeepIn;
RecordPrototype.setIn = setIn;
RecordPrototype.update = update;
RecordPrototype.updateIn = updateIn;
RecordPrototype.withMutations = withMutations;
RecordPrototype.asMutable = asMutable;
RecordPrototype.asImmutable = asImmutable;
RecordPrototype[ITERATOR_SYMBOL] = RecordPrototype.entries;
RecordPrototype.toJSON = RecordPrototype.toObject =
  CollectionPrototype.toObject;
RecordPrototype.inspect = RecordPrototype.toSource = function () {
  return this.toString();
};

function makeRecord(likeRecord, values, ownerID) {
  var record = Object.create(Object.getPrototypeOf(likeRecord));
  record._values = values;
  record.__ownerID = ownerID;
  return record;
}

function recordName(record) {
  return record.constructor.displayName || record.constructor.name || 'Record';
}

function recordSeq(record) {
  return keyedSeqFromValue(record._keys.map(function (k) { return [k, record.get(k)]; }));
}

function setProp(prototype, name) {
  try {
    Object.defineProperty(prototype, name, {
      get: function () {
        return this.get(name);
      },
      set: function (value) {
        invariant(this.__ownerID, 'Cannot set on an immutable record.');
        this.set(name, value);
      },
    });
  } catch (error) {
    // Object.defineProperty failed. Probably IE8.
  }
}

/**
 * Returns a lazy Seq of `value` repeated `times` times. When `times` is
 * undefined, returns an infinite sequence of `value`.
 */
var Repeat = /*@__PURE__*/(function (IndexedSeq) {
  function Repeat(value, times) {
    if (!(this instanceof Repeat)) {
      return new Repeat(value, times);
    }
    this._value = value;
    this.size = times === undefined ? Infinity : Math.max(0, times);
    if (this.size === 0) {
      if (EMPTY_REPEAT) {
        return EMPTY_REPEAT;
      }
      EMPTY_REPEAT = this;
    }
  }

  if ( IndexedSeq ) Repeat.__proto__ = IndexedSeq;
  Repeat.prototype = Object.create( IndexedSeq && IndexedSeq.prototype );
  Repeat.prototype.constructor = Repeat;

  Repeat.prototype.toString = function toString () {
    if (this.size === 0) {
      return 'Repeat []';
    }
    return 'Repeat [ ' + this._value + ' ' + this.size + ' times ]';
  };

  Repeat.prototype.get = function get (index, notSetValue) {
    return this.has(index) ? this._value : notSetValue;
  };

  Repeat.prototype.includes = function includes (searchValue) {
    return is(this._value, searchValue);
  };

  Repeat.prototype.slice = function slice (begin, end) {
    var size = this.size;
    return wholeSlice(begin, end, size)
      ? this
      : new Repeat(
          this._value,
          resolveEnd(end, size) - resolveBegin(begin, size)
        );
  };

  Repeat.prototype.reverse = function reverse () {
    return this;
  };

  Repeat.prototype.indexOf = function indexOf (searchValue) {
    if (is(this._value, searchValue)) {
      return 0;
    }
    return -1;
  };

  Repeat.prototype.lastIndexOf = function lastIndexOf (searchValue) {
    if (is(this._value, searchValue)) {
      return this.size;
    }
    return -1;
  };

  Repeat.prototype.__iterate = function __iterate (fn, reverse) {
    var size = this.size;
    var i = 0;
    while (i !== size) {
      if (fn(this._value, reverse ? size - ++i : i++, this) === false) {
        break;
      }
    }
    return i;
  };

  Repeat.prototype.__iterator = function __iterator (type, reverse) {
    var this$1$1 = this;

    var size = this.size;
    var i = 0;
    return new Iterator(function () { return i === size
        ? iteratorDone()
        : iteratorValue(type, reverse ? size - ++i : i++, this$1$1._value); }
    );
  };

  Repeat.prototype.equals = function equals (other) {
    return other instanceof Repeat
      ? is(this._value, other._value)
      : deepEqual(other);
  };

  return Repeat;
}(IndexedSeq));

var EMPTY_REPEAT;

function fromJS(value, converter) {
  return fromJSWith(
    [],
    converter || defaultConverter,
    value,
    '',
    converter && converter.length > 2 ? [] : undefined,
    { '': value }
  );
}

function fromJSWith(stack, converter, value, key, keyPath, parentValue) {
  if (
    typeof value !== 'string' &&
    !isImmutable(value) &&
    (isArrayLike(value) || hasIterator(value) || isPlainObject(value))
  ) {
    if (~stack.indexOf(value)) {
      throw new TypeError('Cannot convert circular structure to Immutable');
    }
    stack.push(value);
    keyPath && key !== '' && keyPath.push(key);
    var converted = converter.call(
      parentValue,
      key,
      Seq(value).map(function (v, k) { return fromJSWith(stack, converter, v, k, keyPath, value); }
      ),
      keyPath && keyPath.slice()
    );
    stack.pop();
    keyPath && keyPath.pop();
    return converted;
  }
  return value;
}

function defaultConverter(k, v) {
  // Effectively the opposite of "Collection.toSeq()"
  return isIndexed(v) ? v.toList() : isKeyed(v) ? v.toMap() : v.toSet();
}

var version = "4.1.0";

var Immutable = {
  version: version,

  Collection: Collection,
  // Note: Iterable is deprecated
  Iterable: Collection,

  Seq: Seq,
  Map: Map,
  OrderedMap: OrderedMap,
  List: List,
  Stack: Stack,
  Set: Set,
  OrderedSet: OrderedSet,

  Record: Record,
  Range: Range,
  Repeat: Repeat,

  is: is,
  fromJS: fromJS,
  hash: hash,

  isImmutable: isImmutable,
  isCollection: isCollection,
  isKeyed: isKeyed,
  isIndexed: isIndexed,
  isAssociative: isAssociative,
  isOrdered: isOrdered,
  isValueObject: isValueObject,
  isPlainObject: isPlainObject,
  isSeq: isSeq,
  isList: isList,
  isMap: isMap,
  isOrderedMap: isOrderedMap,
  isStack: isStack,
  isSet: isSet,
  isOrderedSet: isOrderedSet,
  isRecord: isRecord,

  get: get,
  getIn: getIn$1,
  has: has,
  hasIn: hasIn$1,
  merge: merge,
  mergeDeep: mergeDeep$1,
  mergeWith: mergeWith,
  mergeDeepWith: mergeDeepWith$1,
  remove: remove,
  removeIn: removeIn,
  set: set,
  setIn: setIn$1,
  update: update$1,
  updateIn: updateIn$1,
};

// Note: Iterable is deprecated
var Iterable = Collection;

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (Immutable);



/***/ }),

/***/ "./src/TileName.ts":
/*!*************************!*\
  !*** ./src/TileName.ts ***!
  \*************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "blockNameCoordinates": () => (/* binding */ blockNameCoordinates)
/* harmony export */ });
/* harmony import */ var immutable__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! immutable */ "./node_modules/immutable/dist/immutable.es.js");

var blockNameCoordinatesInner = [
    [0 /* TileName.Undecided */, null],
    [1 /* TileName.Empty */, null],
    [2 /* TileName.GrassLeft */, { x: 0, y: 0 }],
    [3 /* TileName.GrassMiddle */, { x: 1, y: 0 }],
    [4 /* TileName.GrassRight */, { x: 2, y: 0 }],
    [5 /* TileName.HalfGrassLeft */, { x: 3, y: 0 }],
    [6 /* TileName.HalfGrassRight */, { x: 4, y: 0 }],
    [7 /* TileName.lightDirt */, { x: 5, y: 0 }],
    [8 /* TileName.LightToDarkDirt */, { x: 6, y: 0 }],
    [9 /* TileName.DarkestDirt */, { x: 7, y: 0 }],
    [10 /* TileName.LeftDirt */, { x: 0, y: 1 }],
    [11 /* TileName.MediumDirt */, { x: 1, y: 1 }],
    [12 /* TileName.RightDirt */, { x: 2, y: 1 }],
    [13 /* TileName.slightBottomLeftHighlightDirt */, { x: 3, y: 1 }],
    [14 /* TileName.slightBottomRightHighlightDirt */, { x: 4, y: 1 }],
    [15 /* TileName.slightTopHighlightDirt */, { x: 5, y: 1 }],
    [16 /* TileName.slightBottomHighlightDirt */, { x: 6, y: 1 }],
    [17 /* TileName.leftBottomDirt */, { x: 0, y: 2 }],
    [18 /* TileName.MiddleBottomDirt */, { x: 1, y: 2 }],
    [19 /* TileName.RightBottomDirt */, { x: 2, y: 2 }],
    [20 /* TileName.singleDirt */, { x: 5, y: 2 }],
    [21 /* TileName.RockTopLeft */, { x: 0, y: 3 }],
    [22 /* TileName.RockTop */, { x: 1, y: 3 }],
    [23 /* TileName.RockTopRight */, { x: 2, y: 3 }],
    [24 /* TileName.RockTopLeftHighlight */, { x: 3, y: 3 }],
    [25 /* TileName.RockTopRightHighlight */, { x: 4, y: 3 }],
    [26 /* TileName.StoneTopLeft */, { x: 5, y: 3 }],
    [27 /* TileName.StoneTop */, { x: 6, y: 3 }],
    [28 /* TileName.StoneTopRight */, { x: 7, y: 3 }],
    [29 /* TileName.RockLeft */, { x: 0, y: 4 }],
    [30 /* TileName.RockDark */, { x: 1, y: 4 }],
    [31 /* TileName.RockRight */, { x: 2, y: 4 }],
    [32 /* TileName.RockBottomLeftHighlight */, { x: 3, y: 4 }],
    [33 /* TileName.RockBottomRightHighlight */, { x: 4, y: 4 }],
    [34 /* TileName.StoneLeft */, { x: 5, y: 4 }],
    [35 /* TileName.StoneMiddle */, { x: 6, y: 4 }],
    [36 /* TileName.StoneRight */, { x: 7, y: 4 }],
    [37 /* TileName.RockBottomLeft */, { x: 0, y: 5 }],
    [38 /* TileName.RockBottom */, { x: 1, y: 5 }],
    [39 /* TileName.RockBottomRight */, { x: 2, y: 5 }],
    [40 /* TileName.RockForwardsDiagonalHighlight */, { x: 3, y: 5 }],
    [41 /* TileName.RockBackwardsDiagonalHighlight */, { x: 4, y: 5 }],
];
var blockNameCoordinates = (0,immutable__WEBPACK_IMPORTED_MODULE_0__.Map)(blockNameCoordinatesInner);


/***/ }),

/***/ "./src/collapse.ts":
/*!*************************!*\
  !*** ./src/collapse.ts ***!
  \*************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "collapseCell": () => (/* binding */ collapseCell)
/* harmony export */ });
/* harmony import */ var immutable__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! immutable */ "./node_modules/immutable/dist/immutable.es.js");
/* harmony import */ var _game__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./game */ "./src/game.ts");
/* harmony import */ var _getPossibleTileGrid__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./getPossibleTileGrid */ "./src/getPossibleTileGrid.ts");
/* harmony import */ var _tileRelations__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./tileRelations */ "./src/tileRelations.ts");




function collapseCell(tile, cell, grid) {
    var constraints = _tileRelations__WEBPACK_IMPORTED_MODULE_2__.tileRelations.get(tile);
    if (!constraints) {
        return _getPossibleTileGrid__WEBPACK_IMPORTED_MODULE_1__.COLLAPSE_FAILURE;
    }
    return constraints.reduce(function (reduction, tiles, offset) {
        return reduction === _getPossibleTileGrid__WEBPACK_IMPORTED_MODULE_1__.COLLAPSE_FAILURE
            ? _getPossibleTileGrid__WEBPACK_IMPORTED_MODULE_1__.COLLAPSE_FAILURE
            : applyIntersection(addCellCoordinates(cell, offset), tiles, grid);
    }, grid);
}
function applyIntersection(cell, tiles, grid) {
    var intersection = getTile(cell, grid).possibilities.intersect(tiles);
    if (intersection.size <= 0) {
        return _getPossibleTileGrid__WEBPACK_IMPORTED_MODULE_1__.COLLAPSE_FAILURE;
    }
    return grid.set((0,_game__WEBPACK_IMPORTED_MODULE_0__.hashCoordinates)(cell), {
        coordinates: cell,
        possibilities: intersection,
    });
}
function addCellCoordinates(base, offset) {
    return { x: base.x + offset.x, y: base.y + offset.y };
}
var emptyItem = (0,immutable__WEBPACK_IMPORTED_MODULE_3__.Set)([1 /* TileName.Empty */]);
function getTile(cell, grid, width, height) {
    if (width === void 0) { width = _game__WEBPACK_IMPORTED_MODULE_0__.Options.numberOfColumns(); }
    if (height === void 0) { height = _game__WEBPACK_IMPORTED_MODULE_0__.Options.numberOfRows(); }
    if (cell.x < 0 || cell.x >= width) {
        return {
            coordinates: cell,
            possibilities: emptyItem,
        };
    }
    else if (cell.y < 0 || cell.y >= height) {
        return {
            coordinates: cell,
            possibilities: emptyItem,
        };
    }
    else {
        return grid.get((0,_game__WEBPACK_IMPORTED_MODULE_0__.hashCoordinates)(cell), {
            coordinates: cell,
            possibilities: emptyItem,
        });
    }
}


/***/ }),

/***/ "./src/game.ts":
/*!*********************!*\
  !*** ./src/game.ts ***!
  \*********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Options": () => (/* binding */ Options),
/* harmony export */   "hashCoordinates": () => (/* binding */ hashCoordinates)
/* harmony export */ });
/* harmony import */ var _getPossibleTileGrid__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./getPossibleTileGrid */ "./src/getPossibleTileGrid.ts");
/* harmony import */ var _TileName__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./TileName */ "./src/TileName.ts");
/* harmony import */ var _tiles_png__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./tiles.png */ "./src/tiles.png");
var __values = (undefined && undefined.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
var __read = (undefined && undefined.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};



var canvasContainer = document.querySelector(".canvas-container");
if (canvasContainer === null) {
    throw new Error("document missing canvas container");
}
var canvas = document.querySelector(".canvas-container canvas");
if (canvas === null) {
    throw new Error("document missing canvas");
}
var ctx = canvas.getContext("2d");
if (ctx === null) {
    throw new Error("canvas missing 2d context");
}
var colors = {
    black: "#292e1e",
    darkBlack: "#0e0f0a",
    white: "#f7fff7",
    blue: "#7bdff2",
    green: "#9cde9f",
    teal: "#48a9a6",
    orange: "#ff8811",
    red: "#ed254e",
};
var Options = {
    numberOfColumns: function () { return 10; },
    numberOfRows: function () {
        return Math.floor(canvasContainer.offsetHeight / Options.cellSize());
    },
    gameSizeFactor: function () { return 0.9; },
    cellSize: function () {
        return Math.floor((canvasContainer.offsetWidth * Options.gameSizeFactor()) /
            Options.numberOfColumns());
    },
};
var updateSize = function () {
    canvas.width = Options.cellSize() * Options.numberOfColumns();
    canvas.height = Options.cellSize() * Options.numberOfRows();
};
var tileMap = new Image();
window.addEventListener("load", function () {
    tileMap.src = _tiles_png__WEBPACK_IMPORTED_MODULE_2__; // Set source path
    tileMap.addEventListener("load", renderLoop, false);
    window.addEventListener("resize", updateSize);
    updateSize();
});
var primeB = 49157;
var primeA = 98317;
var hashCoordinates = function (coords) { return coords.x * primeA + coords.y * primeB; };
var renderLoop = function () {
    var e_1, _a;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    var grid = (0,_getPossibleTileGrid__WEBPACK_IMPORTED_MODULE_0__.getTileGrid)();
    try {
        for (var _b = __values(grid.values()), _c = _b.next(); !_c.done; _c = _b.next()) {
            var _d = __read(_c.value, 2), cellCoords = _d[0], tile = _d[1];
            var tileCoords = _TileName__WEBPACK_IMPORTED_MODULE_1__.blockNameCoordinates.get(tile, null);
            if (tileCoords !== null) {
                drawTile(tileCoords, cellCoords);
            }
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
        }
        finally { if (e_1) throw e_1.error; }
    }
    window.requestAnimationFrame(renderLoop);
};
var tileMapProperties = {
    width: function () { return tileMap.naturalWidth; },
    height: function () { return tileMap.naturalWidth; },
    tileWidth: function () { return 16; },
    tileHeight: function () { return 16; },
    rows: function () { return tileMapProperties.width() / tileMapProperties.tileWidth(); },
    columns: function () { return tileMapProperties.height() / tileMapProperties.tileHeight(); },
};
var drawTile = function (tile, cell) {
    ctx.drawImage(tileMap, tile.x * tileMapProperties.tileWidth(), tile.y * tileMapProperties.tileHeight(), tileMapProperties.tileWidth(), tileMapProperties.tileHeight(), cell.x * Options.cellSize(), cell.y * Options.cellSize(), Options.cellSize() - 2, Options.cellSize() - 2);
};


/***/ }),

/***/ "./src/getPossibleTileGrid.ts":
/*!************************************!*\
  !*** ./src/getPossibleTileGrid.ts ***!
  \************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "COLLAPSE_FAILURE": () => (/* binding */ COLLAPSE_FAILURE),
/* harmony export */   "NO_CELL_TO_COLLAPSE": () => (/* binding */ NO_CELL_TO_COLLAPSE),
/* harmony export */   "getBasicTileGrid": () => (/* binding */ getBasicTileGrid),
/* harmony export */   "getTileGrid": () => (/* binding */ getTileGrid)
/* harmony export */ });
/* harmony import */ var _collapse__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./collapse */ "./src/collapse.ts");
/* harmony import */ var _TileName__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./TileName */ "./src/TileName.ts");
/* harmony import */ var immutable__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! immutable */ "./node_modules/immutable/dist/immutable.es.js");
/* harmony import */ var _game__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./game */ "./src/game.ts");
/* harmony import */ var _selectRandomElementFromCollection__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./selectRandomElementFromCollection */ "./src/selectRandomElementFromCollection.ts");
var __read = (undefined && undefined.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __values = (undefined && undefined.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};





/**
 * creates a set of cell coordinates within a given width and height
 * @param width the width of the field
 * @param height the height of the field
 * @returns a set of all of the cell coordinates
 */
function generateCellCoordinates(width, height) {
    if (width === void 0) { width = _game__WEBPACK_IMPORTED_MODULE_2__.Options.numberOfColumns(); }
    if (height === void 0) { height = _game__WEBPACK_IMPORTED_MODULE_2__.Options.numberOfRows(); }
    return (0,immutable__WEBPACK_IMPORTED_MODULE_4__.Set)().withMutations(function (cells) {
        for (var x = 0; x < width; x++) {
            for (var y = 0; y < height; y++) {
                cells.add({ x: x, y: y });
            }
        }
        return cells;
    });
}
function getBasicTileGrid() {
    var allTiles = (0,immutable__WEBPACK_IMPORTED_MODULE_4__.Set)(_TileName__WEBPACK_IMPORTED_MODULE_1__.blockNameCoordinates.keySeq());
    var allCells = (0,immutable__WEBPACK_IMPORTED_MODULE_4__.Set)(generateCellCoordinates());
    var cellsWithTiles = allCells.map(function (cell) { return [
        (0,_game__WEBPACK_IMPORTED_MODULE_2__.hashCoordinates)(cell),
        { coordinates: cell, possibilities: allTiles },
    ]; });
    return (0,immutable__WEBPACK_IMPORTED_MODULE_4__.Map)(cellsWithTiles);
}
var COLLAPSE_FAILURE = "COLLAPSE_FAILURE";
var NO_CELL_TO_COLLAPSE = "NO_CELL_TO_COLLAPSE";
/**
 * gets the cells with the lowest number of options to pick between
 * @param possibilities the full grid of cells and their possible states
 * @returns a subset of that grid that all share the same number of lowest
 * cells to collapse
 */
function lowestEntropyCells(possibilities) {
    var reduceLowerEntropy = function (previous, options, coords) {
        if (options.possibilities.size === 1) {
            return previous;
        }
        else if (previous === null || options.possibilities.size < previous.size) {
            return { size: options.possibilities.size, cells: (0,immutable__WEBPACK_IMPORTED_MODULE_4__.Map)([[coords, options]]) };
        }
        else if (options.possibilities.size === previous.size) {
            return {
                size: previous.size,
                cells: previous.cells.set(coords, options),
            };
        }
        else {
            return previous;
        }
    };
    var lowestEntropy = possibilities.reduce(reduceLowerEntropy, null);
    if (lowestEntropy === null) {
        //nothing matched to be reduced
        // we are done
        return NO_CELL_TO_COLLAPSE;
    }
    return lowestEntropy.cells;
}
/**
 *
 * @param possibilities the cell coordinates and their possible cell values
 * @returns a cell coordinate and its possible values
 */
function getCellToCollapse(possibilities) {
    var cells = lowestEntropyCells(possibilities);
    if (cells === NO_CELL_TO_COLLAPSE) {
        return NO_CELL_TO_COLLAPSE;
    }
    var selection = (0,_selectRandomElementFromCollection__WEBPACK_IMPORTED_MODULE_3__.selectRandomElementFromCollection)(cells)[0];
    if (selection === undefined) {
        console.error("odd behavior");
        return NO_CELL_TO_COLLAPSE;
    }
    var _a = __read(selection, 2), _hash = _a[0], details = _a[1];
    return details;
}
/**
 * tests wether a grid is fully collapsed, if not it will return collapse
 * failure.
 * @param grid possible tile grid that might be fully collapsed
 * @returns the single tile grid represented by a collapsed grid or collapse
 * failure
 */
function collapsedGrid(grid) {
    var e_1, _a;
    var output = (0,immutable__WEBPACK_IMPORTED_MODULE_4__.Set)().asMutable();
    try {
        for (var _b = __values(grid.entries()), _c = _b.next(); !_c.done; _c = _b.next()) {
            var _d = __read(_c.value, 2), _cell = _d[0], _e = _d[1], coordinates = _e.coordinates, tiles = _e.possibilities;
            var tile = tiles.first();
            if (tile === undefined || tiles.size > 1) {
                return COLLAPSE_FAILURE;
            }
            output.add([coordinates, tile]);
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
        }
        finally { if (e_1) throw e_1.error; }
    }
    return output.asImmutable();
}
var callStack = [];
function runCollapseAttempt(_a) {
    var grid = _a.grid, possibleTiles = _a.possibleTiles, coordinate = _a.coordinate;
    var _b = __read((0,_selectRandomElementFromCollection__WEBPACK_IMPORTED_MODULE_3__.selectRandomElementFromCollection)(possibleTiles), 2), selectedTile = _b[0], remaining = _b[1];
    if (selectedTile === undefined) {
        return; // no more cells to try this has been a bad pick
    }
    var gridAttempt = (0,_collapse__WEBPACK_IMPORTED_MODULE_0__.collapseCell)(selectedTile, coordinate, grid);
    var pushNextIteration = function () {
        var nextIteration = {
            return: runCollapseAttempt,
            state: {
                possibleTiles: remaining,
                grid: grid,
                coordinate: coordinate,
            },
        };
        callStack.push(nextIteration);
    };
    if (gridAttempt === COLLAPSE_FAILURE) {
        // try next option
        pushNextIteration();
        return;
    }
    var finalGrid = collapsedGrid(gridAttempt);
    if (finalGrid === COLLAPSE_FAILURE) {
        // not final try collapse another cell
        pushNextIteration();
        var nextCell = {
            state: gridAttempt,
            return: pickCell,
        };
        callStack.push(nextCell);
    }
    else {
        //final we are done
        doneLoop(grid);
        console.log("done!!");
    }
}
function doneLoop(grid) {
    var entry = {
        return: doneLoop,
        state: grid,
    };
    callStack.push(entry);
    return;
}
function pickCell(grid) {
    var selected = getCellToCollapse(grid);
    if (selected === NO_CELL_TO_COLLAPSE) {
        return;
    }
    var coordinates = selected.coordinates, possibilities = selected.possibilities;
    var firstIteration = {
        return: runCollapseAttempt,
        state: {
            possibleTiles: possibilities,
            grid: grid,
            coordinate: coordinates,
        },
    };
    callStack.push(firstIteration);
    return;
}
function callStackLoop() {
    for (var i = 0; i < 100; i++) {
        var top_1 = callStack.pop();
        if (top_1) {
            top_1.return(top_1.state);
        }
    }
    setTimeout(callStackLoop, 0);
}
function getTileGrid() {
    if (callStack.length === 0) {
        // start process
        var startingGrid = getBasicTileGrid();
        pickCell(startingGrid);
        callStackLoop();
        return getRandomTileGrid(startingGrid);
    }
    var top = callStack[callStack.length - 1].state;
    if (immutable__WEBPACK_IMPORTED_MODULE_4__.Map.isMap(top)) {
        return getRandomTileGrid(top);
    }
    return getRandomTileGrid(top.grid);
}
function getRandomTileGrid(poss) {
    return (0,immutable__WEBPACK_IMPORTED_MODULE_4__.Set)().withMutations(function (mutable) {
        var e_2, _a;
        console.log("mapSize ".concat(poss.size));
        try {
            for (var _b = __values(poss.entries()), _c = _b.next(); !_c.done; _c = _b.next()) {
                var _d = __read(_c.value, 2), _cell = _d[0], _e = _d[1], possibilities = _e.possibilities, coordinates = _e.coordinates;
                var _f = __read((0,_selectRandomElementFromCollection__WEBPACK_IMPORTED_MODULE_3__.selectRandomElementFromCollection)(possibilities), 1), option = _f[0];
                if (option) {
                    mutable.add([coordinates, option]);
                }
                else {
                    console.error("missing options for this cell");
                }
            }
        }
        catch (e_2_1) { e_2 = { error: e_2_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_2) throw e_2.error; }
        }
    });
}


/***/ }),

/***/ "./src/selectRandomElementFromCollection.ts":
/*!**************************************************!*\
  !*** ./src/selectRandomElementFromCollection.ts ***!
  \**************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "selectRandomElementFromCollection": () => (/* binding */ selectRandomElementFromCollection)
/* harmony export */ });
/* harmony import */ var immutable__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! immutable */ "./node_modules/immutable/dist/immutable.es.js");

var randomIndex = function (size) { return Math.floor(size * Math.random()); };
function selectRandomElementFromCollection(map) {
    if (immutable__WEBPACK_IMPORTED_MODULE_0__.Set.isSet(map)) {
        var index_1 = randomIndex(map.count());
        var element_1 = map.find(function () {
            index_1 -= 1;
            return index_1 < 0;
        });
        if (element_1 === undefined) {
            return [undefined, map];
        }
        return [element_1, map.filter(function (val) { return val !== element_1; })];
    }
    var index = randomIndex(map.count());
    var element = map.findEntry(function () {
        index -= 1;
        return index < 0;
    });
    if (element === undefined) {
        return [undefined, map];
    }
    return [element, map.filter(function (_, key) { return key !== element[0]; })];
}


/***/ }),

/***/ "./src/tileRelations.ts":
/*!******************************!*\
  !*** ./src/tileRelations.ts ***!
  \******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "tileRelations": () => (/* binding */ tileRelations)
/* harmony export */ });
/* harmony import */ var immutable__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! immutable */ "./node_modules/immutable/dist/immutable.es.js");

var directions = {
    up: { x: 0, y: -1 },
    down: { x: 0, y: 1 },
    left: { x: -1, y: 0 },
    right: { x: 1, y: 0 },
};
function updateDirectionToInclude(base, offset, adjacent, rules) {
    var existingRules = rules.get(base) || (0,immutable__WEBPACK_IMPORTED_MODULE_0__.Map)();
    var existingTiles = existingRules.get(offset) || (0,immutable__WEBPACK_IMPORTED_MODULE_0__.Set)();
    return rules.set(base, existingRules.set(offset, existingTiles.add(adjacent)));
}
var vertical = function (top, bottom) {
    return function (rules) {
        var topUpdated = updateDirectionToInclude(top, directions.down, bottom, rules);
        return updateDirectionToInclude(bottom, directions.up, top, topUpdated);
    };
};
var horizontal = function (left, right) {
    return function (rules) {
        var leftUpdated = updateDirectionToInclude(left, directions.right, right, rules);
        return updateDirectionToInclude(right, directions.left, left, leftUpdated);
    };
};
var fourSides = function (base, top, bottom, left, right) {
    return function (rules) {
        return buildRelations(vertical(top, base), vertical(base, bottom), horizontal(left, base), horizontal(base, right));
    };
};
function buildRelations() {
    var relationBuilders = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        relationBuilders[_i] = arguments[_i];
    }
    var base = (0,immutable__WEBPACK_IMPORTED_MODULE_0__.Map)();
    return relationBuilders.reduce(function (val, builder) { return builder(val); }, base);
}
var e = 1 /* TileName.Empty */;
var tileRelations = buildRelations(vertical(e, e), horizontal(e, e), fourSides(3 /* TileName.GrassMiddle */, e, e, e, e));


/***/ }),

/***/ "./src/tiles.png":
/*!***********************!*\
  !*** ./src/tiles.png ***!
  \***********************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

module.exports = __webpack_require__.p + "5ff2c90ca96b1c9afd65.png";

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/global */
/******/ 	(() => {
/******/ 		__webpack_require__.g = (function() {
/******/ 			if (typeof globalThis === 'object') return globalThis;
/******/ 			try {
/******/ 				return this || new Function('return this')();
/******/ 			} catch (e) {
/******/ 				if (typeof window === 'object') return window;
/******/ 			}
/******/ 		})();
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/publicPath */
/******/ 	(() => {
/******/ 		var scriptUrl;
/******/ 		if (__webpack_require__.g.importScripts) scriptUrl = __webpack_require__.g.location + "";
/******/ 		var document = __webpack_require__.g.document;
/******/ 		if (!scriptUrl && document) {
/******/ 			if (document.currentScript)
/******/ 				scriptUrl = document.currentScript.src
/******/ 			if (!scriptUrl) {
/******/ 				var scripts = document.getElementsByTagName("script");
/******/ 				if(scripts.length) scriptUrl = scripts[scripts.length - 1].src
/******/ 			}
/******/ 		}
/******/ 		// When supporting browsers where an automatic publicPath is not supported you must specify an output.publicPath manually via configuration
/******/ 		// or pass an empty string ("") and set the __webpack_public_path__ variable from your code to use your own logic.
/******/ 		if (!scriptUrl) throw new Error("Automatic publicPath is not supported in this browser");
/******/ 		scriptUrl = scriptUrl.replace(/#.*$/, "").replace(/\?.*$/, "").replace(/\/[^\/]+$/, "/");
/******/ 		__webpack_require__.p = scriptUrl;
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module is referenced by other modules so it can't be inlined
/******/ 	var __webpack_exports__ = __webpack_require__("./src/game.ts");
/******/ 	
/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi5qcyIsIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQSxlQUFlO0FBQ2Y7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLFdBQVc7QUFDWDs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxtQ0FBbUM7QUFDbkM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQSxDQUFDOztBQUVEO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLENBQUM7O0FBRUQ7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0EsQ0FBQzs7QUFFRDtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU87QUFDUDtBQUNBOztBQUVBO0FBQ0EsV0FBVztBQUNYOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGlCQUFpQixXQUFXO0FBQzVCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQSxpQ0FBaUMsS0FBSztBQUN0Qzs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU87QUFDUDtBQUNBO0FBQ0E7O0FBRUE7QUFDQSxDQUFDOztBQUVEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0EsQ0FBQzs7QUFFRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0EsQ0FBQzs7QUFFRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQSxDQUFDOztBQUVEO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7O0FBRUE7QUFDQSxDQUFDOztBQUVEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMOztBQUVBO0FBQ0EsQ0FBQztBQUNEOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7O0FBRUE7QUFDQSxDQUFDOztBQUVEOztBQUVBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsNENBQTRDO0FBQzVDO0FBQ0Esd0JBQXdCO0FBQ3hCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDZDQUE2QztBQUM3QztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsZ0JBQWdCO0FBQ2hCLGdCQUFnQjtBQUNoQjtBQUNBO0FBQ0E7QUFDQSxnRkFBZ0Y7QUFDaEY7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLG1CQUFtQixvQkFBb0I7QUFDdkM7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQSxJQUFJO0FBQ0o7QUFDQSxJQUFJO0FBQ0o7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTCxJQUFJO0FBQ0o7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLElBQUk7QUFDSjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsSUFBSTtBQUNKO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLDRCQUE0QixTQUFTO0FBQ3JDO0FBQ0EsSUFBSTtBQUNKO0FBQ0E7QUFDQSxDQUFDOztBQUVEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLGdEQUFnRDtBQUNoRDtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsOENBQThDO0FBQzlDO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBLGtEQUFrRCw0QkFBNEI7QUFDOUU7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0EsQ0FBQztBQUNEOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLHFCQUFxQiw4REFBOEQ7QUFDbkY7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7O0FBRUE7QUFDQSxDQUFDOztBQUVEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBLCtDQUErQyw0QkFBNEI7QUFDM0U7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7O0FBRUE7QUFDQSxDQUFDOztBQUVEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDs7QUFFQTtBQUNBLENBQUM7O0FBRUQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLG9DQUFvQztBQUNwQztBQUNBLDJEQUEyRDtBQUMzRCwwQ0FBMEM7QUFDMUM7QUFDQTtBQUNBLHNDQUFzQztBQUN0QywyQ0FBMkM7QUFDM0M7QUFDQTtBQUNBOztBQUVBLGtEQUFrRCxzQ0FBc0M7QUFDeEY7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0Esd0NBQXdDO0FBQ3hDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQSwyQkFBMkIsa0VBQWtFO0FBQzdGO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSwyQ0FBMkM7QUFDM0M7QUFDQTtBQUNBO0FBQ0EsMkNBQTJDO0FBQzNDO0FBQ0E7QUFDQTtBQUNBLHVEQUF1RDtBQUN2RCwwQ0FBMEM7QUFDMUMsaURBQWlEO0FBQ2pEO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSx3QkFBd0IsNEVBQTRFO0FBQ3BHO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSw2RUFBNkUsZUFBZTtBQUM1RixHQUFHO0FBQ0g7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxxQkFBcUI7QUFDckI7QUFDQSxHQUFHO0FBQ0g7QUFDQSxxQ0FBcUMsd0NBQXdDO0FBQzdFOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsMkJBQTJCO0FBQzNCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFFBQVE7QUFDUjtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsUUFBUTtBQUNSO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTCwyQkFBMkIsc0JBQXNCOztBQUVqRDtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsSUFBSTtBQUNKO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsVUFBVTtBQUNWO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU87QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFVBQVU7QUFDVjtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSwyQkFBMkIsd0RBQXdEO0FBQ25GO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EscUJBQXFCO0FBQ3JCLGtEQUFrRDtBQUNsRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSwyQkFBMkIsZ0VBQWdFO0FBQzNGO0FBQ0E7QUFDQTtBQUNBLDRCQUE0QiwrQ0FBK0M7QUFDM0U7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsNkJBQTZCLHVDQUF1QztBQUNwRSxnQ0FBZ0Msc0RBQXNEO0FBQ3RGO0FBQ0E7QUFDQSw2Q0FBNkMsZ0RBQWdEO0FBQzdGOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EscURBQXFELGdCQUFnQjtBQUNyRTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EscUJBQXFCO0FBQ3JCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDZDQUE2QyxrQkFBa0I7QUFDL0QscURBQXFELGdCQUFnQiw4QkFBOEIsZ0JBQWdCO0FBQ25IO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLG1DQUFtQyxpQkFBaUI7QUFDcEQ7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxtQkFBbUIsVUFBVTtBQUM3QjtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLG9CQUFvQjtBQUNwQjs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLElBQUk7QUFDSjtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxJQUFJO0FBQ0o7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGtEQUFrRDtBQUNsRDtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLGdFQUFnRSxlQUFlO0FBQy9FOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLHVEQUF1RCxpQkFBaUI7QUFDeEU7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsbUJBQW1CLHlCQUF5QjtBQUM1QztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxpRUFBaUU7QUFDakU7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHFCQUFxQixtQkFBbUI7QUFDeEM7QUFDQTtBQUNBLEdBQUc7QUFDSDs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esa0JBQWtCLG9CQUFvQjtBQUN0QztBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQSw4REFBOEQsb0NBQW9DO0FBQ2xHOztBQUVBO0FBQ0E7QUFDQTs7QUFFQSw4REFBOEQ7QUFDOUQ7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHlDQUF5Qyx1QkFBdUI7QUFDaEUsU0FBUztBQUNUOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQSxzQkFBc0Isc0JBQXNCO0FBQzVDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7O0FBRUE7QUFDQSxpQ0FBaUMsS0FBSztBQUN0Qzs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQSwwQ0FBMEMseUJBQXlCO0FBQ25FLEtBQUs7QUFDTDs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLE9BQU87QUFDUCxLQUFLO0FBQ0w7O0FBRUE7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU87QUFDUDtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQSxDQUFDOztBQUVEOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EseUNBQXlDLFVBQVU7QUFDbkQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsU0FBUyxXQUFXO0FBQ3BCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQSxZQUFZO0FBQ1o7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE1BQU07QUFDTjtBQUNBO0FBQ0EsSUFBSTtBQUNKO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLElBQUk7QUFDSjtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLHlDQUF5QyxVQUFVO0FBQ25EO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLFNBQVMsV0FBVztBQUNwQjtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxNQUFNO0FBQ047QUFDQTtBQUNBLElBQUk7QUFDSjtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQSxZQUFZO0FBQ1o7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLG9EQUFvRCxnQkFBZ0I7QUFDcEU7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxrREFBa0QsZ0JBQWdCO0FBQ2xFO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxRQUFRO0FBQ1I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxRQUFRO0FBQ1I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQSxDQUFDOztBQUVEO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsSUFBSTtBQUNKO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxtQkFBbUIscUJBQXFCO0FBQ3hDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxnREFBZ0QsVUFBVTtBQUMxRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLG1CQUFtQixjQUFjO0FBQ2pDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxtQkFBbUIsYUFBYTtBQUNoQztBQUNBO0FBQ0E7QUFDQSxNQUFNO0FBQ047QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsbUJBQW1CLGFBQWE7QUFDaEM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EscUNBQXFDLHdCQUF3QjtBQUM3RCxLQUFLO0FBQ0w7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSx1QkFBdUIsb0JBQW9CO0FBQzNDO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsdUJBQXVCLG9CQUFvQjtBQUMzQztBQUNBO0FBQ0EsS0FBSztBQUNMOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0Esb0JBQW9CLHNCQUFzQjtBQUMxQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esb0NBQW9DLHNDQUFzQywwQkFBMEIsSUFBSTtBQUN4RyxLQUFLO0FBQ0w7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQSxzQkFBc0IsbUJBQW1CO0FBQ3pDO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQSxDQUFDOztBQUVEOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHFCQUFxQixrQkFBa0I7QUFDdkM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxJQUFJO0FBQ0o7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxJQUFJO0FBQ0o7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSwrQkFBK0IsZUFBZTtBQUM5QztBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0EsSUFBSTtBQUNKOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EseUNBQXlDLHVCQUF1QjtBQUNoRSxTQUFTO0FBQ1Q7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLHdDQUF3QyxLQUFLO0FBQzdDOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBLHlCQUF5QixtREFBbUQ7QUFDNUU7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQSxDQUFDOztBQUVEOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxvREFBb0QsMENBQTBDO0FBQzlGO0FBQ0E7QUFDQSxnQ0FBZ0Msa0JBQWtCO0FBQ2xEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxNQUFNO0FBQ047QUFDQTtBQUNBO0FBQ0EsSUFBSTtBQUNKO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxJQUFJO0FBQ0o7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esd0NBQXdDLFNBQVM7QUFDakQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsMEJBQTBCLDRCQUE0QjtBQUN0RDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDs7QUFFQTtBQUNBLENBQUM7O0FBRUQ7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTztBQUNQO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE1BQU07QUFDTjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRzs7QUFFSDtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxzQ0FBc0Msb0JBQW9CO0FBQzFELFNBQVM7QUFDVDs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0EsaUNBQWlDLEtBQUs7QUFDdEM7O0FBRUE7O0FBRUE7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQSxPQUFPO0FBQ1A7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUEsd0NBQXdDLHNCQUFzQjtBQUM5RDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHVCQUF1QixtQkFBbUI7QUFDMUMsNERBQTRELHdCQUF3QjtBQUNwRjtBQUNBLEtBQUs7QUFDTDs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0Esd0NBQXdDLDZCQUE2QjtBQUNyRTtBQUNBO0FBQ0EseUNBQXlDLDhCQUE4QjtBQUN2RTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBLE9BQU87QUFDUCxLQUFLO0FBQ0w7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLHdDQUF3Qyw2QkFBNkI7QUFDckU7QUFDQTtBQUNBLHVDQUF1Qyw4QkFBOEI7QUFDckU7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQSxPQUFPO0FBQ1AsS0FBSztBQUNMOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBLDhDQUE4Qyw0QkFBNEI7QUFDMUU7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLENBQUM7O0FBRUQ7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQSxDQUFDOztBQUVEOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQSxHQUFHOztBQUVIO0FBQ0E7QUFDQSxHQUFHOztBQUVIO0FBQ0E7QUFDQSxHQUFHOztBQUVIO0FBQ0E7QUFDQSxHQUFHOztBQUVIO0FBQ0E7QUFDQTtBQUNBLEdBQUc7O0FBRUg7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsR0FBRzs7QUFFSDtBQUNBO0FBQ0E7QUFDQSxHQUFHOztBQUVIO0FBQ0E7QUFDQTtBQUNBLEdBQUc7O0FBRUg7QUFDQTtBQUNBLEdBQUc7O0FBRUg7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRzs7QUFFSDtBQUNBO0FBQ0E7QUFDQSxHQUFHOztBQUVIO0FBQ0E7QUFDQTtBQUNBLEdBQUc7O0FBRUg7O0FBRUE7QUFDQTtBQUNBLEdBQUc7O0FBRUg7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7O0FBRUg7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0EsR0FBRzs7QUFFSDtBQUNBLHdDQUF3QyxnQ0FBZ0M7QUFDeEUsR0FBRzs7QUFFSDtBQUNBO0FBQ0EsR0FBRzs7QUFFSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0EsR0FBRzs7QUFFSDtBQUNBO0FBQ0EsR0FBRzs7QUFFSDtBQUNBO0FBQ0E7QUFDQSxHQUFHOztBQUVIO0FBQ0E7QUFDQTtBQUNBLEdBQUc7O0FBRUg7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBLEdBQUc7O0FBRUg7QUFDQTtBQUNBLEdBQUc7O0FBRUg7QUFDQTtBQUNBLEdBQUc7O0FBRUg7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRzs7QUFFSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHOztBQUVIO0FBQ0E7QUFDQSxHQUFHOztBQUVIO0FBQ0E7QUFDQSxHQUFHOztBQUVIO0FBQ0E7QUFDQSxHQUFHOztBQUVIO0FBQ0E7QUFDQSxHQUFHOztBQUVIO0FBQ0E7QUFDQSxHQUFHOztBQUVIOztBQUVBO0FBQ0E7QUFDQSxHQUFHOztBQUVIO0FBQ0EsZ0ZBQWdGLGNBQWM7QUFDOUYsR0FBRzs7QUFFSDtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7O0FBRUg7QUFDQTtBQUNBLEdBQUc7O0FBRUg7QUFDQTtBQUNBLEdBQUc7O0FBRUg7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxpREFBaUQ7QUFDakQ7QUFDQSxHQUFHOztBQUVIO0FBQ0E7QUFDQSxHQUFHOztBQUVIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0EsR0FBRzs7QUFFSDtBQUNBO0FBQ0E7QUFDQSxHQUFHOztBQUVIO0FBQ0E7QUFDQSxHQUFHOztBQUVIO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRzs7QUFFSDtBQUNBO0FBQ0EsR0FBRzs7QUFFSDtBQUNBO0FBQ0EsR0FBRzs7QUFFSDtBQUNBO0FBQ0EsR0FBRzs7QUFFSDtBQUNBO0FBQ0EsR0FBRzs7QUFFSDtBQUNBO0FBQ0EsR0FBRzs7QUFFSDtBQUNBLHlDQUF5Qyw0QkFBNEI7QUFDckUsR0FBRzs7QUFFSDs7QUFFQTtBQUNBO0FBQ0EsR0FBRzs7QUFFSDtBQUNBO0FBQ0EsR0FBRzs7QUFFSDs7QUFFQTtBQUNBO0FBQ0EseUNBQXlDLDhCQUE4QjtBQUN2RSxHQUFHOztBQUVIO0FBQ0E7QUFDQTtBQUNBLEdBQUc7O0FBRUg7QUFDQSwyQ0FBMkMsZ0NBQWdDO0FBQzNFLEdBQUc7O0FBRUg7QUFDQTtBQUNBLEdBQUc7O0FBRUg7QUFDQTtBQUNBLEdBQUc7O0FBRUg7QUFDQTtBQUNBLEdBQUc7O0FBRUg7QUFDQTtBQUNBLEdBQUc7O0FBRUg7QUFDQTtBQUNBLEdBQUc7O0FBRUg7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7O0FBRUg7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRzs7QUFFSDtBQUNBO0FBQ0EsR0FBRzs7QUFFSDtBQUNBO0FBQ0EsR0FBRzs7QUFFSDtBQUNBO0FBQ0EsR0FBRzs7QUFFSDtBQUNBO0FBQ0EsR0FBRzs7QUFFSDtBQUNBO0FBQ0EsR0FBRzs7QUFFSDtBQUNBO0FBQ0EsR0FBRzs7QUFFSDtBQUNBO0FBQ0EsR0FBRzs7QUFFSDtBQUNBO0FBQ0EsR0FBRzs7QUFFSDtBQUNBO0FBQ0EsR0FBRzs7QUFFSDtBQUNBO0FBQ0EsR0FBRzs7QUFFSDtBQUNBO0FBQ0EsR0FBRzs7QUFFSDtBQUNBO0FBQ0EsR0FBRzs7QUFFSDs7QUFFQTtBQUNBO0FBQ0EsR0FBRzs7QUFFSDs7QUFFQTs7QUFFQTtBQUNBLENBQUM7O0FBRUQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsR0FBRzs7QUFFSDtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsK0JBQStCLDhEQUE4RDtBQUM3RjtBQUNBO0FBQ0EsR0FBRzs7QUFFSDtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsK0JBQStCLDhDQUE4QztBQUM3RTtBQUNBO0FBQ0EsR0FBRztBQUNILENBQUM7O0FBRUQ7QUFDQTtBQUNBO0FBQ0E7QUFDQSw4REFBOEQ7O0FBRTlEO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLEdBQUc7O0FBRUg7O0FBRUE7QUFDQTtBQUNBLEdBQUc7O0FBRUg7QUFDQTtBQUNBO0FBQ0EsR0FBRzs7QUFFSDtBQUNBO0FBQ0E7QUFDQSxHQUFHOztBQUVIO0FBQ0E7QUFDQTtBQUNBLEdBQUc7O0FBRUg7QUFDQTtBQUNBLEdBQUc7O0FBRUg7QUFDQTtBQUNBLEdBQUc7O0FBRUg7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7O0FBRUg7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsR0FBRzs7QUFFSDtBQUNBO0FBQ0EsR0FBRzs7QUFFSDtBQUNBO0FBQ0EsR0FBRzs7QUFFSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxzQ0FBc0MsdUJBQXVCO0FBQzdELEdBQUc7O0FBRUg7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7O0FBRUg7QUFDQTtBQUNBLEdBQUc7O0FBRUg7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7O0FBRUg7QUFDQTtBQUNBLEdBQUc7O0FBRUg7QUFDQTtBQUNBLEdBQUc7O0FBRUg7QUFDQTtBQUNBLEdBQUc7O0FBRUg7QUFDQTtBQUNBO0FBQ0EsR0FBRzs7QUFFSDtBQUNBO0FBQ0E7QUFDQSxHQUFHOztBQUVIO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNILENBQUM7O0FBRUQ7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLEdBQUc7O0FBRUg7QUFDQTtBQUNBLEdBQUc7O0FBRUg7O0FBRUE7QUFDQTtBQUNBLEdBQUc7QUFDSCxDQUFDOztBQUVEO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxNQUFNO0FBQ047QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLDJEQUEyRDtBQUMzRDs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxzQ0FBc0Msb0JBQW9CO0FBQzFELFNBQVM7QUFDVDs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLHdDQUF3QyxLQUFLO0FBQzdDOztBQUVBO0FBQ0EsQ0FBQzs7QUFFRDs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esc0RBQXNEO0FBQ3REO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHNCQUFzQixpQkFBaUI7QUFDdkM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFVBQVU7QUFDVjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPO0FBQ1AsS0FBSztBQUNMO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0EsbUNBQW1DO0FBQ25DO0FBQ0E7QUFDQSxtQ0FBbUMsU0FBUztBQUM1QztBQUNBO0FBQ0E7QUFDQSxrQkFBa0I7QUFDbEI7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0EsMkRBQTJELDRCQUE0QjtBQUN2Rjs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTztBQUNQO0FBQ0E7QUFDQTtBQUNBLE9BQU87QUFDUCxLQUFLO0FBQ0wsSUFBSTtBQUNKO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSxzQ0FBc0M7QUFDdEM7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLENBQUM7O0FBRUQ7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxNQUFNO0FBQ047QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsdUNBQXVDO0FBQ3ZDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBLGlFQUFlLFNBQVMsRUFBQztBQUNpZjs7Ozs7Ozs7Ozs7Ozs7OztBQzF5TDFlO0FBZ0RoQyxJQUFNLHlCQUF5QixHQUF5QztJQUN0RSw2QkFBcUIsSUFBSSxDQUFDO0lBQzFCLHlCQUFpQixJQUFJLENBQUM7SUFDdEIsNkJBQXFCLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUM7SUFDcEMsK0JBQXVCLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUM7SUFDdEMsOEJBQXNCLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUM7SUFDckMsaUNBQXlCLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUM7SUFDeEMsa0NBQTBCLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUM7SUFDekMsNkJBQXFCLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUM7SUFDcEMsbUNBQTJCLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUM7SUFDMUMsK0JBQXVCLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUM7SUFDdEMsNkJBQW9CLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUM7SUFDbkMsK0JBQXNCLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUM7SUFDckMsOEJBQXFCLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUM7SUFDcEMsa0RBQXlDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUM7SUFDeEQsbURBQTBDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUM7SUFDekQsMkNBQWtDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUM7SUFDakQsOENBQXFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUM7SUFDcEQsbUNBQTBCLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUM7SUFDekMscUNBQTRCLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUM7SUFDM0Msb0NBQTJCLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUM7SUFDMUMsK0JBQXNCLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUM7SUFDckMsZ0NBQXVCLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUM7SUFDdEMsNEJBQW1CLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUM7SUFDbEMsaUNBQXdCLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUM7SUFDdkMseUNBQWdDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUM7SUFDL0MsMENBQWlDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUM7SUFDaEQsaUNBQXdCLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUM7SUFDdkMsNkJBQW9CLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUM7SUFDbkMsa0NBQXlCLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUM7SUFDeEMsNkJBQW9CLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUM7SUFDbkMsNkJBQW9CLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUM7SUFDbkMsOEJBQXFCLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUM7SUFDcEMsNENBQW1DLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUM7SUFDbEQsNkNBQW9DLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUM7SUFDbkQsOEJBQXFCLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUM7SUFDcEMsZ0NBQXVCLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUM7SUFDdEMsK0JBQXNCLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUM7SUFDckMsbUNBQTBCLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUM7SUFDekMsK0JBQXNCLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUM7SUFDckMsb0NBQTJCLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUM7SUFDMUMsa0RBQXlDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUM7SUFDeEQsbURBQTBDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUM7Q0FDMUQsQ0FBQztBQUdLLElBQU0sb0JBQW9CLEdBQUcsOENBQUcsQ0FDckMseUJBQXlCLENBQzFCLENBQUM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUNoR21DO0FBTXJCO0FBQ3lDO0FBRVQ7QUFRekMsU0FBUyxZQUFZLENBQzFCLElBQWMsRUFDZCxJQUFxQixFQUNyQixJQUFzQjtJQUV0QixJQUFNLFdBQVcsR0FBRyw2REFBaUIsQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUM1QyxJQUFJLENBQUMsV0FBVyxFQUFFO1FBQ2hCLE9BQU8sa0VBQWdCLENBQUM7S0FDekI7SUFDRCxPQUFPLFdBQVcsQ0FBQyxNQUFNLENBQ3ZCLFVBQUMsU0FBUyxFQUFFLEtBQUssRUFBRSxNQUFNO1FBQ3ZCLGdCQUFTLEtBQUssa0VBQWdCO1lBQzVCLENBQUMsQ0FBQyxrRUFBZ0I7WUFDbEIsQ0FBQyxDQUFDLGlCQUFpQixDQUFDLGtCQUFrQixDQUFDLElBQUksRUFBRSxNQUFNLENBQUMsRUFBRSxLQUFLLEVBQUUsSUFBSSxDQUFDO0lBRnBFLENBRW9FLEVBQ3RFLElBQUksQ0FDTCxDQUFDO0FBQ0osQ0FBQztBQUVELFNBQVMsaUJBQWlCLENBQ3hCLElBQXFCLEVBQ3JCLEtBQW9CLEVBQ3BCLElBQXNCO0lBRXRCLElBQU0sWUFBWSxHQUFHLE9BQU8sQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUMsYUFBYSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUN4RSxJQUFJLFlBQVksQ0FBQyxJQUFJLElBQUksQ0FBQyxFQUFFO1FBQzFCLE9BQU8sa0VBQWdCLENBQUM7S0FDekI7SUFDRCxPQUFPLElBQUksQ0FBQyxHQUFHLENBQUMsc0RBQWUsQ0FBQyxJQUFJLENBQUMsRUFBRTtRQUNyQyxXQUFXLEVBQUUsSUFBSTtRQUNqQixhQUFhLEVBQUUsWUFBWTtLQUM1QixDQUFDLENBQUM7QUFDTCxDQUFDO0FBRUQsU0FBUyxrQkFBa0IsQ0FDekIsSUFBcUIsRUFDckIsTUFBdUI7SUFFdkIsT0FBTyxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLEdBQUcsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDO0FBQ3hELENBQUM7QUFDRCxJQUFNLFNBQVMsR0FBRyw4Q0FBRyxDQUFDLHdCQUFnQixDQUFDLENBQUM7QUFDeEMsU0FBUyxPQUFPLENBQ2QsSUFBcUIsRUFDckIsSUFBc0IsRUFDdEIsS0FBeUMsRUFDekMsTUFBdUM7SUFEdkMsZ0NBQWdCLDBEQUF1QixFQUFFO0lBQ3pDLGtDQUFpQix1REFBb0IsRUFBRTtJQUV2QyxJQUFJLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxJQUFJLElBQUksQ0FBQyxDQUFDLElBQUksS0FBSyxFQUFFO1FBQ2pDLE9BQU87WUFDTCxXQUFXLEVBQUUsSUFBSTtZQUNqQixhQUFhLEVBQUUsU0FBUztTQUN6QixDQUFDO0tBQ0g7U0FBTSxJQUFJLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxJQUFJLElBQUksQ0FBQyxDQUFDLElBQUksTUFBTSxFQUFFO1FBQ3pDLE9BQU87WUFDTCxXQUFXLEVBQUUsSUFBSTtZQUNqQixhQUFhLEVBQUUsU0FBUztTQUN6QixDQUFDO0tBQ0g7U0FBTTtRQUNMLE9BQU8sSUFBSSxDQUFDLEdBQUcsQ0FBQyxzREFBZSxDQUFDLElBQUksQ0FBQyxFQUFFO1lBQ3JDLFdBQVcsRUFBRSxJQUFJO1lBQ2pCLGFBQWEsRUFBRSxTQUFTO1NBQ3pCLENBQUMsQ0FBQztLQUNKO0FBQ0gsQ0FBQzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQzlFMEY7QUFDekM7QUFDWDtBQUV2QyxJQUFNLGVBQWUsR0FDbkIsUUFBUSxDQUFDLGFBQWEsQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDO0FBRTlDLElBQUksZUFBZSxLQUFLLElBQUksRUFBRTtJQUM1QixNQUFNLElBQUksS0FBSyxDQUFDLG1DQUFtQyxDQUFDLENBQUM7Q0FDdEQ7QUFDRCxJQUFNLE1BQU0sR0FBNkIsUUFBUSxDQUFDLGFBQWEsQ0FDN0QsMEJBQTBCLENBQzNCLENBQUM7QUFDRixJQUFJLE1BQU0sS0FBSyxJQUFJLEVBQUU7SUFDbkIsTUFBTSxJQUFJLEtBQUssQ0FBQyx5QkFBeUIsQ0FBQyxDQUFDO0NBQzVDO0FBQ0QsSUFBTSxHQUFHLEdBQUcsTUFBTSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUNwQyxJQUFJLEdBQUcsS0FBSyxJQUFJLEVBQUU7SUFDaEIsTUFBTSxJQUFJLEtBQUssQ0FBQywyQkFBMkIsQ0FBQyxDQUFDO0NBQzlDO0FBRUQsSUFBTSxNQUFNLEdBQUc7SUFDYixLQUFLLEVBQUUsU0FBUztJQUNoQixTQUFTLEVBQUUsU0FBUztJQUNwQixLQUFLLEVBQUUsU0FBUztJQUNoQixJQUFJLEVBQUUsU0FBUztJQUNmLEtBQUssRUFBRSxTQUFTO0lBQ2hCLElBQUksRUFBRSxTQUFTO0lBQ2YsTUFBTSxFQUFFLFNBQVM7SUFDakIsR0FBRyxFQUFFLFNBQVM7Q0FDZixDQUFDO0FBQ0ssSUFBTSxPQUFPLEdBQUc7SUFDckIsZUFBZSxFQUFFLGNBQU0sU0FBRSxFQUFGLENBQUU7SUFDekIsWUFBWSxFQUFFO1FBQ1osV0FBSSxDQUFDLEtBQUssQ0FBQyxlQUFlLENBQUMsWUFBWSxHQUFHLE9BQU8sQ0FBQyxRQUFRLEVBQUUsQ0FBQztJQUE3RCxDQUE2RDtJQUMvRCxjQUFjLEVBQUUsY0FBTSxVQUFHLEVBQUgsQ0FBRztJQUN6QixRQUFRLEVBQUU7UUFDUixXQUFJLENBQUMsS0FBSyxDQUNSLENBQUMsZUFBZSxDQUFDLFdBQVcsR0FBRyxPQUFPLENBQUMsY0FBYyxFQUFFLENBQUM7WUFDdEQsT0FBTyxDQUFDLGVBQWUsRUFBRSxDQUM1QjtJQUhELENBR0M7Q0FDSixDQUFDO0FBQ0YsSUFBTSxVQUFVLEdBQUc7SUFDakIsTUFBTSxDQUFDLEtBQUssR0FBRyxPQUFPLENBQUMsUUFBUSxFQUFFLEdBQUcsT0FBTyxDQUFDLGVBQWUsRUFBRSxDQUFDO0lBQzlELE1BQU0sQ0FBQyxNQUFNLEdBQUcsT0FBTyxDQUFDLFFBQVEsRUFBRSxHQUFHLE9BQU8sQ0FBQyxZQUFZLEVBQUUsQ0FBQztBQUM5RCxDQUFDLENBQUM7QUFFRixJQUFNLE9BQU8sR0FBRyxJQUFJLEtBQUssRUFBRSxDQUFDO0FBRTVCLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxNQUFNLEVBQUU7SUFDOUIsT0FBTyxDQUFDLEdBQUcsR0FBRyx1Q0FBWSxDQUFDLENBQUMsa0JBQWtCO0lBQzlDLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQyxNQUFNLEVBQUUsVUFBVSxFQUFFLEtBQUssQ0FBQyxDQUFDO0lBQ3BELE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxRQUFRLEVBQUUsVUFBVSxDQUFDLENBQUM7SUFDOUMsVUFBVSxFQUFFLENBQUM7QUFDZixDQUFDLENBQUMsQ0FBQztBQVFILElBQU0sTUFBTSxHQUFHLEtBQUs7QUFDcEIsSUFBTSxNQUFNLEdBQUcsS0FBSyxDQUFDO0FBRWQsSUFBTSxlQUFlLEdBQUcsVUFBQyxNQUFrQixJQUFzQixhQUFNLENBQUMsQ0FBQyxHQUFHLE1BQU0sR0FBRyxNQUFNLENBQUMsQ0FBQyxHQUFHLE1BQU0sRUFBckMsQ0FBcUM7QUFFN0csSUFBTSxVQUFVLEdBQUc7O0lBQ2pCLEdBQUcsQ0FBQyxTQUFTLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxNQUFNLENBQUMsS0FBSyxFQUFFLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUNqRCxJQUFNLElBQUksR0FBRyxpRUFBVyxFQUFFLENBQUM7O1FBQzNCLEtBQWlDLHNCQUFJLENBQUMsTUFBTSxFQUFFLDZDQUFFO1lBQXJDLDRCQUFrQixFQUFqQixVQUFVLFVBQUUsSUFBSTtZQUMxQixJQUFNLFVBQVUsR0FBRywrREFBd0IsQ0FBTyxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUM7WUFDOUQsSUFBSSxVQUFVLEtBQUssSUFBSSxFQUFFO2dCQUN2QixRQUFRLENBQUMsVUFBVSxFQUFFLFVBQVUsQ0FBQyxDQUFDO2FBQ2xDO1NBQ0Y7Ozs7Ozs7OztJQUNELE1BQU0sQ0FBQyxxQkFBcUIsQ0FBQyxVQUFVLENBQUMsQ0FBQztBQUMzQyxDQUFDLENBQUM7QUFFRixJQUFNLGlCQUFpQixHQUFHO0lBQ3hCLEtBQUssRUFBRSxjQUFNLGNBQU8sQ0FBQyxZQUFZLEVBQXBCLENBQW9CO0lBQ2pDLE1BQU0sRUFBRSxjQUFNLGNBQU8sQ0FBQyxZQUFZLEVBQXBCLENBQW9CO0lBQ2xDLFNBQVMsRUFBRSxjQUFNLFNBQUUsRUFBRixDQUFFO0lBQ25CLFVBQVUsRUFBRSxjQUFNLFNBQUUsRUFBRixDQUFFO0lBQ3BCLElBQUksRUFBRSxjQUFNLHdCQUFpQixDQUFDLEtBQUssRUFBRSxHQUFHLGlCQUFpQixDQUFDLFNBQVMsRUFBRSxFQUF6RCxDQUF5RDtJQUNyRSxPQUFPLEVBQUUsY0FBTSx3QkFBaUIsQ0FBQyxNQUFNLEVBQUUsR0FBRyxpQkFBaUIsQ0FBQyxVQUFVLEVBQUUsRUFBM0QsQ0FBMkQ7Q0FDM0UsQ0FBQztBQUVGLElBQU0sUUFBUSxHQUFHLFVBQUMsSUFBcUIsRUFBRSxJQUFxQjtJQUM1RCxHQUFHLENBQUMsU0FBUyxDQUNYLE9BQU8sRUFDUCxJQUFJLENBQUMsQ0FBQyxHQUFHLGlCQUFpQixDQUFDLFNBQVMsRUFBRSxFQUN0QyxJQUFJLENBQUMsQ0FBQyxHQUFHLGlCQUFpQixDQUFDLFVBQVUsRUFBRSxFQUN2QyxpQkFBaUIsQ0FBQyxTQUFTLEVBQUUsRUFDN0IsaUJBQWlCLENBQUMsVUFBVSxFQUFFLEVBQzlCLElBQUksQ0FBQyxDQUFDLEdBQUcsT0FBTyxDQUFDLFFBQVEsRUFBRSxFQUMzQixJQUFJLENBQUMsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxRQUFRLEVBQUUsRUFDM0IsT0FBTyxDQUFDLFFBQVEsRUFBRSxHQUFHLENBQUMsRUFDdEIsT0FBTyxDQUFDLFFBQVEsRUFBRSxHQUFHLENBQUMsQ0FDdkIsQ0FBQztBQUNKLENBQUMsQ0FBQzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUNqR2tCO0FBQ3dDO0FBQ1g7QUFNakM7QUFDd0U7QUFFeEY7Ozs7O0dBS0c7QUFDSCxTQUFTLHVCQUF1QixDQUM5QixLQUF5QyxFQUN6QyxNQUF1QztJQUR2QyxnQ0FBZ0IsMERBQXVCLEVBQUU7SUFDekMsa0NBQWlCLHVEQUFvQixFQUFFO0lBRXZDLE9BQU8sOENBQUcsRUFBbUIsQ0FBQyxhQUFhLENBQUMsVUFBQyxLQUFLO1FBQ2hELEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxLQUFLLEVBQUUsQ0FBQyxFQUFFLEVBQUU7WUFDOUIsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtnQkFDL0IsS0FBSyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsS0FBRSxDQUFDLEtBQUUsQ0FBQyxDQUFDO2FBQ3JCO1NBQ0Y7UUFDRCxPQUFPLEtBQUssQ0FBQztJQUNmLENBQUMsQ0FBQyxDQUFDO0FBQ0wsQ0FBQztBQUVNLFNBQVMsZ0JBQWdCO0lBQzlCLElBQU0sUUFBUSxHQUFHLDhDQUFHLENBQVcsa0VBQTJCLEVBQUUsQ0FBQyxDQUFDO0lBQzlELElBQU0sUUFBUSxHQUFHLDhDQUFHLENBQWtCLHVCQUF1QixFQUFFLENBQUMsQ0FBQztJQUNqRSxJQUFNLGNBQWMsR0FBRyxRQUFRLENBQUMsR0FBRyxDQUNqQyxVQUFDLElBQUksSUFBZ0Q7UUFDbkQsc0RBQWUsQ0FBQyxJQUFJLENBQUM7UUFDckIsRUFBRSxXQUFXLEVBQUUsSUFBSSxFQUFFLGFBQWEsRUFBRSxRQUFRLEVBQUU7S0FDL0MsRUFIb0QsQ0FHcEQsQ0FDRixDQUFDO0lBQ0YsT0FBTyw4Q0FBRyxDQUFDLGNBQWMsQ0FBQyxDQUFDO0FBQzdCLENBQUM7QUFFTSxJQUFNLGdCQUFnQixHQUFHLGtCQUFrQixDQUFDO0FBRTVDLElBQU0sbUJBQW1CLEdBQUcscUJBQXFCLENBQUM7QUFFekQ7Ozs7O0dBS0c7QUFDSCxTQUFTLGtCQUFrQixDQUN6QixhQUErQjtJQUcvQixJQUFNLGtCQUFrQixHQUFHLFVBQ3pCLFFBQXdCLEVBQ3hCLE9BQStCLEVBQy9CLE1BQXVCO1FBRXZCLElBQUksT0FBTyxDQUFDLGFBQWEsQ0FBQyxJQUFJLEtBQUssQ0FBQyxFQUFFO1lBQ3BDLE9BQU8sUUFBUSxDQUFDO1NBQ2pCO2FBQU0sSUFBSSxRQUFRLEtBQUssSUFBSSxJQUFJLE9BQU8sQ0FBQyxhQUFhLENBQUMsSUFBSSxHQUFHLFFBQVEsQ0FBQyxJQUFJLEVBQUU7WUFDMUUsT0FBTyxFQUFFLElBQUksRUFBRSxPQUFPLENBQUMsYUFBYSxDQUFDLElBQUksRUFBRSxLQUFLLEVBQUUsOENBQUcsQ0FBQyxDQUFDLENBQUMsTUFBTSxFQUFFLE9BQU8sQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDO1NBQzlFO2FBQU0sSUFBSSxPQUFPLENBQUMsYUFBYSxDQUFDLElBQUksS0FBSyxRQUFRLENBQUMsSUFBSSxFQUFFO1lBQ3ZELE9BQU87Z0JBQ0wsSUFBSSxFQUFFLFFBQVEsQ0FBQyxJQUFJO2dCQUNuQixLQUFLLEVBQUUsUUFBUSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsTUFBTSxFQUFFLE9BQU8sQ0FBQzthQUMzQyxDQUFDO1NBQ0g7YUFBTTtZQUNMLE9BQU8sUUFBUSxDQUFDO1NBQ2pCO0lBQ0gsQ0FBQyxDQUFDO0lBQ0YsSUFBTSxhQUFhLEdBQUcsYUFBYSxDQUFDLE1BQU0sQ0FBQyxrQkFBa0IsRUFBRSxJQUFJLENBQUMsQ0FBQztJQUNyRSxJQUFJLGFBQWEsS0FBSyxJQUFJLEVBQUU7UUFDMUIsK0JBQStCO1FBQy9CLGNBQWM7UUFDZCxPQUFPLG1CQUFtQixDQUFDO0tBQzVCO0lBQ0QsT0FBTyxhQUFhLENBQUMsS0FBSyxDQUFDO0FBQzdCLENBQUM7QUFFRDs7OztHQUlHO0FBQ0gsU0FBUyxpQkFBaUIsQ0FDeEIsYUFBK0I7SUFFL0IsSUFBTSxLQUFLLEdBQUcsa0JBQWtCLENBQUMsYUFBYSxDQUFDLENBQUM7SUFDaEQsSUFBSSxLQUFLLEtBQUssbUJBQW1CLEVBQUU7UUFDakMsT0FBTyxtQkFBbUIsQ0FBQztLQUM1QjtJQUNELElBQU0sU0FBUyxHQUFHLHFHQUFpQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQzlELElBQUksU0FBUyxLQUFLLFNBQVMsRUFBRTtRQUMzQixPQUFPLENBQUMsS0FBSyxDQUFDLGNBQWMsQ0FBQyxDQUFDO1FBQzlCLE9BQU8sbUJBQW1CLENBQUM7S0FDNUI7SUFDSyxnQkFBbUIsU0FBUyxNQUEzQixLQUFLLFVBQUUsT0FBTyxRQUFhO0lBQ2xDLE9BQU8sT0FBTyxDQUFDO0FBQ2pCLENBQUM7QUFzQkQ7Ozs7OztHQU1HO0FBQ0gsU0FBUyxhQUFhLENBQ3BCLElBQXNCOztJQUV0QixJQUFNLE1BQU0sR0FBRyw4Q0FBRyxFQUErQixDQUFDLFNBQVMsRUFBRSxDQUFDOztRQUM5RCxLQUF5RCxzQkFBSSxDQUFDLE9BQU8sRUFBRSw2Q0FBRTtZQUE5RCw0QkFBMEMsRUFBekMsS0FBSyxVQUFFLFVBQWlDLEVBQWhDLFdBQVcsbUJBQWUsS0FBSztZQUNqRCxJQUFNLElBQUksR0FBRyxLQUFLLENBQUMsS0FBSyxFQUFFLENBQUM7WUFDM0IsSUFBSSxJQUFJLEtBQUssU0FBUyxJQUFJLEtBQUssQ0FBQyxJQUFJLEdBQUcsQ0FBQyxFQUFFO2dCQUN4QyxPQUFPLGdCQUFnQixDQUFDO2FBQ3pCO1lBQ0QsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLFdBQVcsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDO1NBQ2pDOzs7Ozs7Ozs7SUFFRCxPQUFPLE1BQU0sQ0FBQyxXQUFXLEVBQUUsQ0FBQztBQUM5QixDQUFDO0FBT0QsSUFBTSxTQUFTLEdBQTRELEVBQUUsQ0FBQztBQVE5RSxTQUFTLGtCQUFrQixDQUFDLEVBSUg7UUFIdkIsSUFBSSxZQUNKLGFBQWEscUJBQ2IsVUFBVTtJQUVKLGdCQUNKLHFHQUFpQyxDQUFDLGFBQWEsQ0FBQyxNQUQzQyxZQUFZLFVBQUUsU0FBUyxRQUNvQixDQUFDO0lBQ25ELElBQUksWUFBWSxLQUFLLFNBQVMsRUFBRTtRQUM5QixPQUFPLENBQUMsZ0RBQWdEO0tBQ3pEO0lBQ0QsSUFBTSxXQUFXLEdBQUcsdURBQVksQ0FBQyxZQUFZLEVBQUUsVUFBVSxFQUFFLElBQUksQ0FBQyxDQUFDO0lBQ2pFLElBQU0saUJBQWlCLEdBQUc7UUFDeEIsSUFBTSxhQUFhLEdBQXVDO1lBQ3hELE1BQU0sRUFBRSxrQkFBa0I7WUFDMUIsS0FBSyxFQUFFO2dCQUNMLGFBQWEsRUFBRSxTQUFTO2dCQUN4QixJQUFJO2dCQUNKLFVBQVU7YUFDWDtTQUNGLENBQUM7UUFDRixTQUFTLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDO0lBQ2hDLENBQUMsQ0FBQztJQUNGLElBQUksV0FBVyxLQUFLLGdCQUFnQixFQUFFO1FBQ3BDLGtCQUFrQjtRQUNsQixpQkFBaUIsRUFBRSxDQUFDO1FBQ3BCLE9BQU87S0FDUjtJQUNELElBQU0sU0FBUyxHQUFHLGFBQWEsQ0FBQyxXQUFXLENBQUMsQ0FBQztJQUM3QyxJQUFJLFNBQVMsS0FBSyxnQkFBZ0IsRUFBRTtRQUNsQyxzQ0FBc0M7UUFDdEMsaUJBQWlCLEVBQUUsQ0FBQztRQUNwQixJQUFNLFFBQVEsR0FBaUM7WUFDN0MsS0FBSyxFQUFFLFdBQVc7WUFDbEIsTUFBTSxFQUFFLFFBQVE7U0FDakIsQ0FBQztRQUNGLFNBQVMsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7S0FDMUI7U0FBTTtRQUNMLG1CQUFtQjtRQUNuQixRQUFRLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDZixPQUFPLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0tBQ3ZCO0FBQ0gsQ0FBQztBQUVELFNBQVMsUUFBUSxDQUFDLElBQXNCO0lBQ3RDLElBQU0sS0FBSyxHQUFpQztRQUMxQyxNQUFNLEVBQUUsUUFBUTtRQUNoQixLQUFLLEVBQUUsSUFBSTtLQUNaLENBQUM7SUFDRixTQUFTLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQ3RCLE9BQU87QUFDVCxDQUFDO0FBRUQsU0FBUyxRQUFRLENBQUMsSUFBc0I7SUFDdEMsSUFBTSxRQUFRLEdBQUcsaUJBQWlCLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDekMsSUFBSSxRQUFRLEtBQUssbUJBQW1CLEVBQUU7UUFDcEMsT0FBTztLQUNSO0lBQ00sZUFBVyxHQUFtQixRQUFRLFlBQTNCLEVBQUUsYUFBYSxHQUFJLFFBQVEsY0FBWixDQUFhO0lBQzlDLElBQU0sY0FBYyxHQUF1QztRQUN6RCxNQUFNLEVBQUUsa0JBQWtCO1FBQzFCLEtBQUssRUFBRTtZQUNMLGFBQWEsRUFBRSxhQUFhO1lBQzVCLElBQUk7WUFDSixVQUFVLEVBQUMsV0FBVztTQUN2QjtLQUNGLENBQUM7SUFDRixTQUFTLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxDQUFDO0lBQy9CLE9BQU87QUFDVCxDQUFDO0FBRUQsU0FBUyxhQUFhO0lBQ3BCLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxHQUFHLEVBQUUsQ0FBQyxFQUFFLEVBQUU7UUFDNUIsSUFBTSxLQUFHLEdBQUcsU0FBUyxDQUFDLEdBQUcsRUFBRSxDQUFDO1FBQzVCLElBQUksS0FBRyxFQUFFO1lBQ1AsS0FBRyxDQUFDLE1BQU0sQ0FBQyxLQUFHLENBQUMsS0FBSyxDQUFDLENBQUM7U0FDdkI7S0FDRjtJQUNELFVBQVUsQ0FBQyxhQUFhLEVBQUUsQ0FBQyxDQUFDLENBQUM7QUFDL0IsQ0FBQztBQUVNLFNBQVMsV0FBVztJQUN6QixJQUFJLFNBQVMsQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO1FBQzFCLGdCQUFnQjtRQUNoQixJQUFNLFlBQVksR0FBRyxnQkFBZ0IsRUFBRSxDQUFDO1FBQ3hDLFFBQVEsQ0FBQyxZQUFZLENBQUMsQ0FBQztRQUN2QixhQUFhLEVBQUUsQ0FBQztRQUNoQixPQUFPLGlCQUFpQixDQUFDLFlBQVksQ0FBQyxDQUFDO0tBQ3hDO0lBQ0QsSUFBTSxHQUFHLEdBQUcsU0FBUyxDQUFDLFNBQVMsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDO0lBQ2xELElBQUksZ0RBQVMsQ0FBQyxHQUFHLENBQUMsRUFBRTtRQUNsQixPQUFPLGlCQUFpQixDQUFDLEdBQUcsQ0FBQyxDQUFDO0tBQy9CO0lBQ0QsT0FBTyxpQkFBaUIsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDckMsQ0FBQztBQUVELFNBQVMsaUJBQWlCLENBQUMsSUFBc0I7SUFDL0MsT0FBTyw4Q0FBRyxFQUErQixDQUFDLGFBQWEsQ0FBQyxVQUFDLE9BQU87O1FBQzlELE9BQU8sQ0FBQyxHQUFHLENBQUMsa0JBQVcsSUFBSSxDQUFDLElBQUksQ0FBRSxDQUFDLENBQUM7O1lBQ3BDLEtBQW9ELHNCQUFJLENBQUMsT0FBTyxFQUFFLDZDQUFFO2dCQUF6RCw0QkFBcUMsRUFBcEMsS0FBSyxVQUFFLFVBQTRCLEVBQTNCLGFBQWEscUJBQUUsV0FBVztnQkFDdEMsZ0JBQVcscUdBQWlDLENBQUMsYUFBYSxDQUFDLE1BQTFELE1BQU0sUUFBb0QsQ0FBQztnQkFDbEUsSUFBSSxNQUFNLEVBQUU7b0JBQ1YsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLFdBQVcsRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDO2lCQUNwQztxQkFBSTtvQkFDSCxPQUFPLENBQUMsS0FBSyxDQUFDLCtCQUErQixDQUFDLENBQUM7aUJBRWhEO2FBQ0Y7Ozs7Ozs7OztJQUNILENBQUMsQ0FBQyxDQUFDO0FBQ0wsQ0FBQzs7Ozs7Ozs7Ozs7Ozs7OztBQ2hSZ0Q7QUFFakQsSUFBTSxXQUFXLEdBQUcsVUFBQyxJQUFZLElBQUssV0FBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQWhDLENBQWdDLENBQUM7QUFLaEUsU0FBUyxpQ0FBaUMsQ0FDL0MsR0FBdUI7SUFDdkIsSUFBSSxnREFBUyxDQUFDLEdBQUcsQ0FBQyxFQUFFO1FBQ2xCLElBQUksT0FBSyxHQUFHLFdBQVcsQ0FBQyxHQUFHLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQztRQUNyQyxJQUFNLFNBQU8sR0FBRyxHQUFHLENBQUMsSUFBSSxDQUFDO1lBQ3ZCLE9BQUssSUFBSSxDQUFDLENBQUM7WUFDWCxPQUFPLE9BQUssR0FBRyxDQUFDLENBQUM7UUFDbkIsQ0FBQyxDQUFDLENBQUM7UUFDSCxJQUFJLFNBQU8sS0FBSyxTQUFTLEVBQUU7WUFDekIsT0FBTyxDQUFDLFNBQVMsRUFBRSxHQUFHLENBQUMsQ0FBQztTQUN6QjtRQUNELE9BQU8sQ0FBQyxTQUFPLEVBQUUsR0FBRyxDQUFDLE1BQU0sQ0FBQyxVQUFDLEdBQUcsSUFBSyxVQUFHLEtBQUssU0FBTyxFQUFmLENBQWUsQ0FBQyxDQUFDLENBQUM7S0FDeEQ7SUFDRCxJQUFJLEtBQUssR0FBRyxXQUFXLENBQUMsR0FBRyxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUM7SUFDckMsSUFBTSxPQUFPLEdBQUcsR0FBRyxDQUFDLFNBQVMsQ0FBQztRQUM1QixLQUFLLElBQUksQ0FBQyxDQUFDO1FBQ1gsT0FBTyxLQUFLLEdBQUcsQ0FBQyxDQUFDO0lBQ25CLENBQUMsQ0FBQyxDQUFDO0lBQ0gsSUFBSSxPQUFPLEtBQUssU0FBUyxFQUFFO1FBQ3pCLE9BQU8sQ0FBQyxTQUFTLEVBQUUsR0FBRyxDQUFDLENBQUM7S0FDekI7SUFDRCxPQUFPLENBQUMsT0FBTyxFQUFFLEdBQUcsQ0FBQyxNQUFNLENBQUMsVUFBQyxDQUFDLEVBQUUsR0FBRyxJQUFLLFVBQUcsS0FBSyxPQUFPLENBQUMsQ0FBQyxDQUFDLEVBQWxCLENBQWtCLENBQUMsQ0FBQyxDQUFDO0FBQy9ELENBQUM7Ozs7Ozs7Ozs7Ozs7Ozs7QUM3Qm9DO0FBU3JDLElBQU0sVUFBVSxHQUE4RDtJQUM1RSxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRTtJQUNuQixJQUFJLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUU7SUFDcEIsSUFBSSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUU7SUFDckIsS0FBSyxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFO0NBQ3RCLENBQUM7QUFFRixTQUFTLHdCQUF3QixDQUMvQixJQUFjLEVBQ2QsTUFBdUIsRUFDdkIsUUFBa0IsRUFDbEIsS0FBeUI7SUFFekIsSUFBTSxhQUFhLEdBQUcsS0FBSyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSw4Q0FBRyxFQUFFLENBQUM7SUFDL0MsSUFBTSxhQUFhLEdBQUcsYUFBYSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsSUFBSSw4Q0FBRyxFQUFFLENBQUM7SUFDekQsT0FBTyxLQUFLLENBQUMsR0FBRyxDQUNkLElBQUksRUFDSixhQUFhLENBQUMsR0FBRyxDQUFDLE1BQU0sRUFBRSxhQUFhLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQ3ZELENBQUM7QUFDSixDQUFDO0FBRUQsSUFBTSxRQUFRLEdBQ1osVUFBQyxHQUFhLEVBQUUsTUFBZ0I7SUFDaEMsaUJBQUMsS0FBSztRQUNKLElBQU0sVUFBVSxHQUFHLHdCQUF3QixDQUN6QyxHQUFHLEVBQ0gsVUFBVSxDQUFDLElBQUksRUFDZixNQUFNLEVBQ04sS0FBSyxDQUNOLENBQUM7UUFDRixPQUFPLHdCQUF3QixDQUFDLE1BQU0sRUFBRSxVQUFVLENBQUMsRUFBRSxFQUFFLEdBQUcsRUFBRSxVQUFVLENBQUMsQ0FBQztJQUMxRSxDQUFDO0FBUkQsQ0FRQyxDQUFDO0FBRUosSUFBTSxVQUFVLEdBQ2QsVUFBQyxJQUFjLEVBQUUsS0FBZTtJQUNoQyxpQkFBQyxLQUFLO1FBQ0osSUFBTSxXQUFXLEdBQUcsd0JBQXdCLENBQzFDLElBQUksRUFDSixVQUFVLENBQUMsS0FBSyxFQUNoQixLQUFLLEVBQ0wsS0FBSyxDQUNOLENBQUM7UUFDRixPQUFPLHdCQUF3QixDQUFDLEtBQUssRUFBRSxVQUFVLENBQUMsSUFBSSxFQUFFLElBQUksRUFBRSxXQUFXLENBQUMsQ0FBQztJQUM3RSxDQUFDO0FBUkQsQ0FRQyxDQUFDO0FBRUosSUFBTSxTQUFTLEdBQ2IsVUFDRSxJQUFjLEVBQ2QsR0FBYSxFQUNiLE1BQWdCLEVBQ2hCLElBQWMsRUFDZCxLQUFlO0lBRWpCLGlCQUFDLEtBQUs7UUFDSixxQkFBYyxDQUNaLFFBQVEsQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLEVBQ25CLFFBQVEsQ0FBQyxJQUFJLEVBQUUsTUFBTSxDQUFDLEVBQ3RCLFVBQVUsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLEVBQ3RCLFVBQVUsQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLENBQ3hCO0lBTEQsQ0FLQztBQU5ILENBTUcsQ0FBQztBQUVOLFNBQVMsY0FBYztJQUNyQiwwQkFBc0M7U0FBdEMsVUFBc0MsRUFBdEMscUJBQXNDLEVBQXRDLElBQXNDO1FBQXRDLHFDQUFzQzs7SUFFdEMsSUFBTSxJQUFJLEdBQXVCLDhDQUFHLEVBQUUsQ0FBQztJQUN2QyxPQUFPLGdCQUFnQixDQUFDLE1BQU0sQ0FBQyxVQUFDLEdBQUcsRUFBRSxPQUFPLElBQUssY0FBTyxDQUFDLEdBQUcsQ0FBQyxFQUFaLENBQVksRUFBRSxJQUFJLENBQUMsQ0FBQztBQUN2RSxDQUFDO0FBQ0QsSUFBTSxDQUFDLHlCQUFpQixDQUFDO0FBQ2xCLElBQU0sYUFBYSxHQUFHLGNBQWMsQ0FDekMsUUFBUSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFDZCxVQUFVLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUNoQixTQUFTLCtCQUF1QixDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FDNUMsQ0FBQzs7Ozs7Ozs7Ozs7Ozs7Ozs7VUNqRkY7VUFDQTs7VUFFQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTs7VUFFQTtVQUNBOztVQUVBO1VBQ0E7VUFDQTs7Ozs7V0N0QkE7V0FDQTtXQUNBO1dBQ0E7V0FDQSx5Q0FBeUMsd0NBQXdDO1dBQ2pGO1dBQ0E7V0FDQTs7Ozs7V0NQQTtXQUNBO1dBQ0E7V0FDQTtXQUNBLEdBQUc7V0FDSDtXQUNBO1dBQ0EsQ0FBQzs7Ozs7V0NQRDs7Ozs7V0NBQTtXQUNBO1dBQ0E7V0FDQSx1REFBdUQsaUJBQWlCO1dBQ3hFO1dBQ0EsZ0RBQWdELGFBQWE7V0FDN0Q7Ozs7O1dDTkE7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7V0FDQTtXQUNBO1dBQ0E7Ozs7O1VFZkE7VUFDQTtVQUNBO1VBQ0EiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly93YXZlLWNvbGxhcHNlLy4vbm9kZV9tb2R1bGVzL2ltbXV0YWJsZS9kaXN0L2ltbXV0YWJsZS5lcy5qcyIsIndlYnBhY2s6Ly93YXZlLWNvbGxhcHNlLy4vc3JjL1RpbGVOYW1lLnRzIiwid2VicGFjazovL3dhdmUtY29sbGFwc2UvLi9zcmMvY29sbGFwc2UudHMiLCJ3ZWJwYWNrOi8vd2F2ZS1jb2xsYXBzZS8uL3NyYy9nYW1lLnRzIiwid2VicGFjazovL3dhdmUtY29sbGFwc2UvLi9zcmMvZ2V0UG9zc2libGVUaWxlR3JpZC50cyIsIndlYnBhY2s6Ly93YXZlLWNvbGxhcHNlLy4vc3JjL3NlbGVjdFJhbmRvbUVsZW1lbnRGcm9tQ29sbGVjdGlvbi50cyIsIndlYnBhY2s6Ly93YXZlLWNvbGxhcHNlLy4vc3JjL3RpbGVSZWxhdGlvbnMudHMiLCJ3ZWJwYWNrOi8vd2F2ZS1jb2xsYXBzZS93ZWJwYWNrL2Jvb3RzdHJhcCIsIndlYnBhY2s6Ly93YXZlLWNvbGxhcHNlL3dlYnBhY2svcnVudGltZS9kZWZpbmUgcHJvcGVydHkgZ2V0dGVycyIsIndlYnBhY2s6Ly93YXZlLWNvbGxhcHNlL3dlYnBhY2svcnVudGltZS9nbG9iYWwiLCJ3ZWJwYWNrOi8vd2F2ZS1jb2xsYXBzZS93ZWJwYWNrL3J1bnRpbWUvaGFzT3duUHJvcGVydHkgc2hvcnRoYW5kIiwid2VicGFjazovL3dhdmUtY29sbGFwc2Uvd2VicGFjay9ydW50aW1lL21ha2UgbmFtZXNwYWNlIG9iamVjdCIsIndlYnBhY2s6Ly93YXZlLWNvbGxhcHNlL3dlYnBhY2svcnVudGltZS9wdWJsaWNQYXRoIiwid2VicGFjazovL3dhdmUtY29sbGFwc2Uvd2VicGFjay9iZWZvcmUtc3RhcnR1cCIsIndlYnBhY2s6Ly93YXZlLWNvbGxhcHNlL3dlYnBhY2svc3RhcnR1cCIsIndlYnBhY2s6Ly93YXZlLWNvbGxhcHNlL3dlYnBhY2svYWZ0ZXItc3RhcnR1cCJdLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIE1JVCBMaWNlbnNlXG4gKiBcbiAqIENvcHlyaWdodCAoYykgMjAxNC1wcmVzZW50LCBMZWUgQnlyb24gYW5kIG90aGVyIGNvbnRyaWJ1dG9ycy5cbiAqIFxuICogUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGEgY29weVxuICogb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGUgXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbFxuICogaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0c1xuICogdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLCBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbFxuICogY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdCBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzXG4gKiBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlIGZvbGxvd2luZyBjb25kaXRpb25zOlxuICogXG4gKiBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZCBpbiBhbGxcbiAqIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG4gKiBcbiAqIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1MgT1JcbiAqIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZLFxuICogRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFXG4gKiBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLCBEQU1BR0VTIE9SIE9USEVSXG4gKiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLFxuICogT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTiBUSEVcbiAqIFNPRlRXQVJFLlxuICovXG52YXIgREVMRVRFID0gJ2RlbGV0ZSc7XG5cbi8vIENvbnN0YW50cyBkZXNjcmliaW5nIHRoZSBzaXplIG9mIHRyaWUgbm9kZXMuXG52YXIgU0hJRlQgPSA1OyAvLyBSZXN1bHRlZCBpbiBiZXN0IHBlcmZvcm1hbmNlIGFmdGVyIF9fX19fXz9cbnZhciBTSVpFID0gMSA8PCBTSElGVDtcbnZhciBNQVNLID0gU0laRSAtIDE7XG5cbi8vIEEgY29uc2lzdGVudCBzaGFyZWQgdmFsdWUgcmVwcmVzZW50aW5nIFwibm90IHNldFwiIHdoaWNoIGVxdWFscyBub3RoaW5nIG90aGVyXG4vLyB0aGFuIGl0c2VsZiwgYW5kIG5vdGhpbmcgdGhhdCBjb3VsZCBiZSBwcm92aWRlZCBleHRlcm5hbGx5LlxudmFyIE5PVF9TRVQgPSB7fTtcblxuLy8gQm9vbGVhbiByZWZlcmVuY2VzLCBSb3VnaCBlcXVpdmFsZW50IG9mIGBib29sICZgLlxuZnVuY3Rpb24gTWFrZVJlZigpIHtcbiAgcmV0dXJuIHsgdmFsdWU6IGZhbHNlIH07XG59XG5cbmZ1bmN0aW9uIFNldFJlZihyZWYpIHtcbiAgaWYgKHJlZikge1xuICAgIHJlZi52YWx1ZSA9IHRydWU7XG4gIH1cbn1cblxuLy8gQSBmdW5jdGlvbiB3aGljaCByZXR1cm5zIGEgdmFsdWUgcmVwcmVzZW50aW5nIGFuIFwib3duZXJcIiBmb3IgdHJhbnNpZW50IHdyaXRlc1xuLy8gdG8gdHJpZXMuIFRoZSByZXR1cm4gdmFsdWUgd2lsbCBvbmx5IGV2ZXIgZXF1YWwgaXRzZWxmLCBhbmQgd2lsbCBub3QgZXF1YWxcbi8vIHRoZSByZXR1cm4gb2YgYW55IHN1YnNlcXVlbnQgY2FsbCBvZiB0aGlzIGZ1bmN0aW9uLlxuZnVuY3Rpb24gT3duZXJJRCgpIHt9XG5cbmZ1bmN0aW9uIGVuc3VyZVNpemUoaXRlcikge1xuICBpZiAoaXRlci5zaXplID09PSB1bmRlZmluZWQpIHtcbiAgICBpdGVyLnNpemUgPSBpdGVyLl9faXRlcmF0ZShyZXR1cm5UcnVlKTtcbiAgfVxuICByZXR1cm4gaXRlci5zaXplO1xufVxuXG5mdW5jdGlvbiB3cmFwSW5kZXgoaXRlciwgaW5kZXgpIHtcbiAgLy8gVGhpcyBpbXBsZW1lbnRzIFwiaXMgYXJyYXkgaW5kZXhcIiB3aGljaCB0aGUgRUNNQVN0cmluZyBzcGVjIGRlZmluZXMgYXM6XG4gIC8vXG4gIC8vICAgICBBIFN0cmluZyBwcm9wZXJ0eSBuYW1lIFAgaXMgYW4gYXJyYXkgaW5kZXggaWYgYW5kIG9ubHkgaWZcbiAgLy8gICAgIFRvU3RyaW5nKFRvVWludDMyKFApKSBpcyBlcXVhbCB0byBQIGFuZCBUb1VpbnQzMihQKSBpcyBub3QgZXF1YWxcbiAgLy8gICAgIHRvIDJeMzLiiJIxLlxuICAvL1xuICAvLyBodHRwOi8vd3d3LmVjbWEtaW50ZXJuYXRpb25hbC5vcmcvZWNtYS0yNjIvNi4wLyNzZWMtYXJyYXktZXhvdGljLW9iamVjdHNcbiAgaWYgKHR5cGVvZiBpbmRleCAhPT0gJ251bWJlcicpIHtcbiAgICB2YXIgdWludDMySW5kZXggPSBpbmRleCA+Pj4gMDsgLy8gTiA+Pj4gMCBpcyBzaG9ydGhhbmQgZm9yIFRvVWludDMyXG4gICAgaWYgKCcnICsgdWludDMySW5kZXggIT09IGluZGV4IHx8IHVpbnQzMkluZGV4ID09PSA0Mjk0OTY3Mjk1KSB7XG4gICAgICByZXR1cm4gTmFOO1xuICAgIH1cbiAgICBpbmRleCA9IHVpbnQzMkluZGV4O1xuICB9XG4gIHJldHVybiBpbmRleCA8IDAgPyBlbnN1cmVTaXplKGl0ZXIpICsgaW5kZXggOiBpbmRleDtcbn1cblxuZnVuY3Rpb24gcmV0dXJuVHJ1ZSgpIHtcbiAgcmV0dXJuIHRydWU7XG59XG5cbmZ1bmN0aW9uIHdob2xlU2xpY2UoYmVnaW4sIGVuZCwgc2l6ZSkge1xuICByZXR1cm4gKFxuICAgICgoYmVnaW4gPT09IDAgJiYgIWlzTmVnKGJlZ2luKSkgfHxcbiAgICAgIChzaXplICE9PSB1bmRlZmluZWQgJiYgYmVnaW4gPD0gLXNpemUpKSAmJlxuICAgIChlbmQgPT09IHVuZGVmaW5lZCB8fCAoc2l6ZSAhPT0gdW5kZWZpbmVkICYmIGVuZCA+PSBzaXplKSlcbiAgKTtcbn1cblxuZnVuY3Rpb24gcmVzb2x2ZUJlZ2luKGJlZ2luLCBzaXplKSB7XG4gIHJldHVybiByZXNvbHZlSW5kZXgoYmVnaW4sIHNpemUsIDApO1xufVxuXG5mdW5jdGlvbiByZXNvbHZlRW5kKGVuZCwgc2l6ZSkge1xuICByZXR1cm4gcmVzb2x2ZUluZGV4KGVuZCwgc2l6ZSwgc2l6ZSk7XG59XG5cbmZ1bmN0aW9uIHJlc29sdmVJbmRleChpbmRleCwgc2l6ZSwgZGVmYXVsdEluZGV4KSB7XG4gIC8vIFNhbml0aXplIGluZGljZXMgdXNpbmcgdGhpcyBzaG9ydGhhbmQgZm9yIFRvSW50MzIoYXJndW1lbnQpXG4gIC8vIGh0dHA6Ly93d3cuZWNtYS1pbnRlcm5hdGlvbmFsLm9yZy9lY21hLTI2Mi82LjAvI3NlYy10b2ludDMyXG4gIHJldHVybiBpbmRleCA9PT0gdW5kZWZpbmVkXG4gICAgPyBkZWZhdWx0SW5kZXhcbiAgICA6IGlzTmVnKGluZGV4KVxuICAgID8gc2l6ZSA9PT0gSW5maW5pdHlcbiAgICAgID8gc2l6ZVxuICAgICAgOiBNYXRoLm1heCgwLCBzaXplICsgaW5kZXgpIHwgMFxuICAgIDogc2l6ZSA9PT0gdW5kZWZpbmVkIHx8IHNpemUgPT09IGluZGV4XG4gICAgPyBpbmRleFxuICAgIDogTWF0aC5taW4oc2l6ZSwgaW5kZXgpIHwgMDtcbn1cblxuZnVuY3Rpb24gaXNOZWcodmFsdWUpIHtcbiAgLy8gQWNjb3VudCBmb3IgLTAgd2hpY2ggaXMgbmVnYXRpdmUsIGJ1dCBub3QgbGVzcyB0aGFuIDAuXG4gIHJldHVybiB2YWx1ZSA8IDAgfHwgKHZhbHVlID09PSAwICYmIDEgLyB2YWx1ZSA9PT0gLUluZmluaXR5KTtcbn1cblxudmFyIElTX0NPTExFQ1RJT05fU1lNQk9MID0gJ0BAX19JTU1VVEFCTEVfSVRFUkFCTEVfX0BAJztcblxuZnVuY3Rpb24gaXNDb2xsZWN0aW9uKG1heWJlQ29sbGVjdGlvbikge1xuICByZXR1cm4gQm9vbGVhbihtYXliZUNvbGxlY3Rpb24gJiYgbWF5YmVDb2xsZWN0aW9uW0lTX0NPTExFQ1RJT05fU1lNQk9MXSk7XG59XG5cbnZhciBJU19LRVlFRF9TWU1CT0wgPSAnQEBfX0lNTVVUQUJMRV9LRVlFRF9fQEAnO1xuXG5mdW5jdGlvbiBpc0tleWVkKG1heWJlS2V5ZWQpIHtcbiAgcmV0dXJuIEJvb2xlYW4obWF5YmVLZXllZCAmJiBtYXliZUtleWVkW0lTX0tFWUVEX1NZTUJPTF0pO1xufVxuXG52YXIgSVNfSU5ERVhFRF9TWU1CT0wgPSAnQEBfX0lNTVVUQUJMRV9JTkRFWEVEX19AQCc7XG5cbmZ1bmN0aW9uIGlzSW5kZXhlZChtYXliZUluZGV4ZWQpIHtcbiAgcmV0dXJuIEJvb2xlYW4obWF5YmVJbmRleGVkICYmIG1heWJlSW5kZXhlZFtJU19JTkRFWEVEX1NZTUJPTF0pO1xufVxuXG5mdW5jdGlvbiBpc0Fzc29jaWF0aXZlKG1heWJlQXNzb2NpYXRpdmUpIHtcbiAgcmV0dXJuIGlzS2V5ZWQobWF5YmVBc3NvY2lhdGl2ZSkgfHwgaXNJbmRleGVkKG1heWJlQXNzb2NpYXRpdmUpO1xufVxuXG52YXIgQ29sbGVjdGlvbiA9IGZ1bmN0aW9uIENvbGxlY3Rpb24odmFsdWUpIHtcbiAgcmV0dXJuIGlzQ29sbGVjdGlvbih2YWx1ZSkgPyB2YWx1ZSA6IFNlcSh2YWx1ZSk7XG59O1xuXG52YXIgS2V5ZWRDb2xsZWN0aW9uID0gLypAX19QVVJFX18qLyhmdW5jdGlvbiAoQ29sbGVjdGlvbikge1xuICBmdW5jdGlvbiBLZXllZENvbGxlY3Rpb24odmFsdWUpIHtcbiAgICByZXR1cm4gaXNLZXllZCh2YWx1ZSkgPyB2YWx1ZSA6IEtleWVkU2VxKHZhbHVlKTtcbiAgfVxuXG4gIGlmICggQ29sbGVjdGlvbiApIEtleWVkQ29sbGVjdGlvbi5fX3Byb3RvX18gPSBDb2xsZWN0aW9uO1xuICBLZXllZENvbGxlY3Rpb24ucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZSggQ29sbGVjdGlvbiAmJiBDb2xsZWN0aW9uLnByb3RvdHlwZSApO1xuICBLZXllZENvbGxlY3Rpb24ucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gS2V5ZWRDb2xsZWN0aW9uO1xuXG4gIHJldHVybiBLZXllZENvbGxlY3Rpb247XG59KENvbGxlY3Rpb24pKTtcblxudmFyIEluZGV4ZWRDb2xsZWN0aW9uID0gLypAX19QVVJFX18qLyhmdW5jdGlvbiAoQ29sbGVjdGlvbikge1xuICBmdW5jdGlvbiBJbmRleGVkQ29sbGVjdGlvbih2YWx1ZSkge1xuICAgIHJldHVybiBpc0luZGV4ZWQodmFsdWUpID8gdmFsdWUgOiBJbmRleGVkU2VxKHZhbHVlKTtcbiAgfVxuXG4gIGlmICggQ29sbGVjdGlvbiApIEluZGV4ZWRDb2xsZWN0aW9uLl9fcHJvdG9fXyA9IENvbGxlY3Rpb247XG4gIEluZGV4ZWRDb2xsZWN0aW9uLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoIENvbGxlY3Rpb24gJiYgQ29sbGVjdGlvbi5wcm90b3R5cGUgKTtcbiAgSW5kZXhlZENvbGxlY3Rpb24ucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gSW5kZXhlZENvbGxlY3Rpb247XG5cbiAgcmV0dXJuIEluZGV4ZWRDb2xsZWN0aW9uO1xufShDb2xsZWN0aW9uKSk7XG5cbnZhciBTZXRDb2xsZWN0aW9uID0gLypAX19QVVJFX18qLyhmdW5jdGlvbiAoQ29sbGVjdGlvbikge1xuICBmdW5jdGlvbiBTZXRDb2xsZWN0aW9uKHZhbHVlKSB7XG4gICAgcmV0dXJuIGlzQ29sbGVjdGlvbih2YWx1ZSkgJiYgIWlzQXNzb2NpYXRpdmUodmFsdWUpID8gdmFsdWUgOiBTZXRTZXEodmFsdWUpO1xuICB9XG5cbiAgaWYgKCBDb2xsZWN0aW9uICkgU2V0Q29sbGVjdGlvbi5fX3Byb3RvX18gPSBDb2xsZWN0aW9uO1xuICBTZXRDb2xsZWN0aW9uLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoIENvbGxlY3Rpb24gJiYgQ29sbGVjdGlvbi5wcm90b3R5cGUgKTtcbiAgU2V0Q29sbGVjdGlvbi5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBTZXRDb2xsZWN0aW9uO1xuXG4gIHJldHVybiBTZXRDb2xsZWN0aW9uO1xufShDb2xsZWN0aW9uKSk7XG5cbkNvbGxlY3Rpb24uS2V5ZWQgPSBLZXllZENvbGxlY3Rpb247XG5Db2xsZWN0aW9uLkluZGV4ZWQgPSBJbmRleGVkQ29sbGVjdGlvbjtcbkNvbGxlY3Rpb24uU2V0ID0gU2V0Q29sbGVjdGlvbjtcblxudmFyIElTX1NFUV9TWU1CT0wgPSAnQEBfX0lNTVVUQUJMRV9TRVFfX0BAJztcblxuZnVuY3Rpb24gaXNTZXEobWF5YmVTZXEpIHtcbiAgcmV0dXJuIEJvb2xlYW4obWF5YmVTZXEgJiYgbWF5YmVTZXFbSVNfU0VRX1NZTUJPTF0pO1xufVxuXG52YXIgSVNfUkVDT1JEX1NZTUJPTCA9ICdAQF9fSU1NVVRBQkxFX1JFQ09SRF9fQEAnO1xuXG5mdW5jdGlvbiBpc1JlY29yZChtYXliZVJlY29yZCkge1xuICByZXR1cm4gQm9vbGVhbihtYXliZVJlY29yZCAmJiBtYXliZVJlY29yZFtJU19SRUNPUkRfU1lNQk9MXSk7XG59XG5cbmZ1bmN0aW9uIGlzSW1tdXRhYmxlKG1heWJlSW1tdXRhYmxlKSB7XG4gIHJldHVybiBpc0NvbGxlY3Rpb24obWF5YmVJbW11dGFibGUpIHx8IGlzUmVjb3JkKG1heWJlSW1tdXRhYmxlKTtcbn1cblxudmFyIElTX09SREVSRURfU1lNQk9MID0gJ0BAX19JTU1VVEFCTEVfT1JERVJFRF9fQEAnO1xuXG5mdW5jdGlvbiBpc09yZGVyZWQobWF5YmVPcmRlcmVkKSB7XG4gIHJldHVybiBCb29sZWFuKG1heWJlT3JkZXJlZCAmJiBtYXliZU9yZGVyZWRbSVNfT1JERVJFRF9TWU1CT0xdKTtcbn1cblxudmFyIElURVJBVEVfS0VZUyA9IDA7XG52YXIgSVRFUkFURV9WQUxVRVMgPSAxO1xudmFyIElURVJBVEVfRU5UUklFUyA9IDI7XG5cbnZhciBSRUFMX0lURVJBVE9SX1NZTUJPTCA9IHR5cGVvZiBTeW1ib2wgPT09ICdmdW5jdGlvbicgJiYgU3ltYm9sLml0ZXJhdG9yO1xudmFyIEZBVVhfSVRFUkFUT1JfU1lNQk9MID0gJ0BAaXRlcmF0b3InO1xuXG52YXIgSVRFUkFUT1JfU1lNQk9MID0gUkVBTF9JVEVSQVRPUl9TWU1CT0wgfHwgRkFVWF9JVEVSQVRPUl9TWU1CT0w7XG5cbnZhciBJdGVyYXRvciA9IGZ1bmN0aW9uIEl0ZXJhdG9yKG5leHQpIHtcbiAgdGhpcy5uZXh0ID0gbmV4dDtcbn07XG5cbkl0ZXJhdG9yLnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uIHRvU3RyaW5nICgpIHtcbiAgcmV0dXJuICdbSXRlcmF0b3JdJztcbn07XG5cbkl0ZXJhdG9yLktFWVMgPSBJVEVSQVRFX0tFWVM7XG5JdGVyYXRvci5WQUxVRVMgPSBJVEVSQVRFX1ZBTFVFUztcbkl0ZXJhdG9yLkVOVFJJRVMgPSBJVEVSQVRFX0VOVFJJRVM7XG5cbkl0ZXJhdG9yLnByb3RvdHlwZS5pbnNwZWN0ID0gSXRlcmF0b3IucHJvdG90eXBlLnRvU291cmNlID0gZnVuY3Rpb24gKCkge1xuICByZXR1cm4gdGhpcy50b1N0cmluZygpO1xufTtcbkl0ZXJhdG9yLnByb3RvdHlwZVtJVEVSQVRPUl9TWU1CT0xdID0gZnVuY3Rpb24gKCkge1xuICByZXR1cm4gdGhpcztcbn07XG5cbmZ1bmN0aW9uIGl0ZXJhdG9yVmFsdWUodHlwZSwgaywgdiwgaXRlcmF0b3JSZXN1bHQpIHtcbiAgdmFyIHZhbHVlID0gdHlwZSA9PT0gMCA/IGsgOiB0eXBlID09PSAxID8gdiA6IFtrLCB2XTtcbiAgaXRlcmF0b3JSZXN1bHRcbiAgICA/IChpdGVyYXRvclJlc3VsdC52YWx1ZSA9IHZhbHVlKVxuICAgIDogKGl0ZXJhdG9yUmVzdWx0ID0ge1xuICAgICAgICB2YWx1ZTogdmFsdWUsXG4gICAgICAgIGRvbmU6IGZhbHNlLFxuICAgICAgfSk7XG4gIHJldHVybiBpdGVyYXRvclJlc3VsdDtcbn1cblxuZnVuY3Rpb24gaXRlcmF0b3JEb25lKCkge1xuICByZXR1cm4geyB2YWx1ZTogdW5kZWZpbmVkLCBkb25lOiB0cnVlIH07XG59XG5cbmZ1bmN0aW9uIGhhc0l0ZXJhdG9yKG1heWJlSXRlcmFibGUpIHtcbiAgaWYgKEFycmF5LmlzQXJyYXkobWF5YmVJdGVyYWJsZSkpIHtcbiAgICAvLyBJRTExIHRyaWNrIGFzIGl0IGRvZXMgbm90IHN1cHBvcnQgYFN5bWJvbC5pdGVyYXRvcmBcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIHJldHVybiAhIWdldEl0ZXJhdG9yRm4obWF5YmVJdGVyYWJsZSk7XG59XG5cbmZ1bmN0aW9uIGlzSXRlcmF0b3IobWF5YmVJdGVyYXRvcikge1xuICByZXR1cm4gbWF5YmVJdGVyYXRvciAmJiB0eXBlb2YgbWF5YmVJdGVyYXRvci5uZXh0ID09PSAnZnVuY3Rpb24nO1xufVxuXG5mdW5jdGlvbiBnZXRJdGVyYXRvcihpdGVyYWJsZSkge1xuICB2YXIgaXRlcmF0b3JGbiA9IGdldEl0ZXJhdG9yRm4oaXRlcmFibGUpO1xuICByZXR1cm4gaXRlcmF0b3JGbiAmJiBpdGVyYXRvckZuLmNhbGwoaXRlcmFibGUpO1xufVxuXG5mdW5jdGlvbiBnZXRJdGVyYXRvckZuKGl0ZXJhYmxlKSB7XG4gIHZhciBpdGVyYXRvckZuID1cbiAgICBpdGVyYWJsZSAmJlxuICAgICgoUkVBTF9JVEVSQVRPUl9TWU1CT0wgJiYgaXRlcmFibGVbUkVBTF9JVEVSQVRPUl9TWU1CT0xdKSB8fFxuICAgICAgaXRlcmFibGVbRkFVWF9JVEVSQVRPUl9TWU1CT0xdKTtcbiAgaWYgKHR5cGVvZiBpdGVyYXRvckZuID09PSAnZnVuY3Rpb24nKSB7XG4gICAgcmV0dXJuIGl0ZXJhdG9yRm47XG4gIH1cbn1cblxuZnVuY3Rpb24gaXNFbnRyaWVzSXRlcmFibGUobWF5YmVJdGVyYWJsZSkge1xuICB2YXIgaXRlcmF0b3JGbiA9IGdldEl0ZXJhdG9yRm4obWF5YmVJdGVyYWJsZSk7XG4gIHJldHVybiBpdGVyYXRvckZuICYmIGl0ZXJhdG9yRm4gPT09IG1heWJlSXRlcmFibGUuZW50cmllcztcbn1cblxuZnVuY3Rpb24gaXNLZXlzSXRlcmFibGUobWF5YmVJdGVyYWJsZSkge1xuICB2YXIgaXRlcmF0b3JGbiA9IGdldEl0ZXJhdG9yRm4obWF5YmVJdGVyYWJsZSk7XG4gIHJldHVybiBpdGVyYXRvckZuICYmIGl0ZXJhdG9yRm4gPT09IG1heWJlSXRlcmFibGUua2V5cztcbn1cblxudmFyIGhhc093blByb3BlcnR5ID0gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eTtcblxuZnVuY3Rpb24gaXNBcnJheUxpa2UodmFsdWUpIHtcbiAgaWYgKEFycmF5LmlzQXJyYXkodmFsdWUpIHx8IHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZycpIHtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIHJldHVybiAoXG4gICAgdmFsdWUgJiZcbiAgICB0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnICYmXG4gICAgTnVtYmVyLmlzSW50ZWdlcih2YWx1ZS5sZW5ndGgpICYmXG4gICAgdmFsdWUubGVuZ3RoID49IDAgJiZcbiAgICAodmFsdWUubGVuZ3RoID09PSAwXG4gICAgICA/IC8vIE9ubHkge2xlbmd0aDogMH0gaXMgY29uc2lkZXJlZCBBcnJheS1saWtlLlxuICAgICAgICBPYmplY3Qua2V5cyh2YWx1ZSkubGVuZ3RoID09PSAxXG4gICAgICA6IC8vIEFuIG9iamVjdCBpcyBvbmx5IEFycmF5LWxpa2UgaWYgaXQgaGFzIGEgcHJvcGVydHkgd2hlcmUgdGhlIGxhc3QgdmFsdWVcbiAgICAgICAgLy8gaW4gdGhlIGFycmF5LWxpa2UgbWF5IGJlIGZvdW5kICh3aGljaCBjb3VsZCBiZSB1bmRlZmluZWQpLlxuICAgICAgICB2YWx1ZS5oYXNPd25Qcm9wZXJ0eSh2YWx1ZS5sZW5ndGggLSAxKSlcbiAgKTtcbn1cblxudmFyIFNlcSA9IC8qQF9fUFVSRV9fKi8oZnVuY3Rpb24gKENvbGxlY3Rpb24pIHtcbiAgZnVuY3Rpb24gU2VxKHZhbHVlKSB7XG4gICAgcmV0dXJuIHZhbHVlID09PSB1bmRlZmluZWQgfHwgdmFsdWUgPT09IG51bGxcbiAgICAgID8gZW1wdHlTZXF1ZW5jZSgpXG4gICAgICA6IGlzSW1tdXRhYmxlKHZhbHVlKVxuICAgICAgPyB2YWx1ZS50b1NlcSgpXG4gICAgICA6IHNlcUZyb21WYWx1ZSh2YWx1ZSk7XG4gIH1cblxuICBpZiAoIENvbGxlY3Rpb24gKSBTZXEuX19wcm90b19fID0gQ29sbGVjdGlvbjtcbiAgU2VxLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoIENvbGxlY3Rpb24gJiYgQ29sbGVjdGlvbi5wcm90b3R5cGUgKTtcbiAgU2VxLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IFNlcTtcblxuICBTZXEucHJvdG90eXBlLnRvU2VxID0gZnVuY3Rpb24gdG9TZXEgKCkge1xuICAgIHJldHVybiB0aGlzO1xuICB9O1xuXG4gIFNlcS5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbiB0b1N0cmluZyAoKSB7XG4gICAgcmV0dXJuIHRoaXMuX190b1N0cmluZygnU2VxIHsnLCAnfScpO1xuICB9O1xuXG4gIFNlcS5wcm90b3R5cGUuY2FjaGVSZXN1bHQgPSBmdW5jdGlvbiBjYWNoZVJlc3VsdCAoKSB7XG4gICAgaWYgKCF0aGlzLl9jYWNoZSAmJiB0aGlzLl9faXRlcmF0ZVVuY2FjaGVkKSB7XG4gICAgICB0aGlzLl9jYWNoZSA9IHRoaXMuZW50cnlTZXEoKS50b0FycmF5KCk7XG4gICAgICB0aGlzLnNpemUgPSB0aGlzLl9jYWNoZS5sZW5ndGg7XG4gICAgfVxuICAgIHJldHVybiB0aGlzO1xuICB9O1xuXG4gIC8vIGFic3RyYWN0IF9faXRlcmF0ZVVuY2FjaGVkKGZuLCByZXZlcnNlKVxuXG4gIFNlcS5wcm90b3R5cGUuX19pdGVyYXRlID0gZnVuY3Rpb24gX19pdGVyYXRlIChmbiwgcmV2ZXJzZSkge1xuICAgIHZhciBjYWNoZSA9IHRoaXMuX2NhY2hlO1xuICAgIGlmIChjYWNoZSkge1xuICAgICAgdmFyIHNpemUgPSBjYWNoZS5sZW5ndGg7XG4gICAgICB2YXIgaSA9IDA7XG4gICAgICB3aGlsZSAoaSAhPT0gc2l6ZSkge1xuICAgICAgICB2YXIgZW50cnkgPSBjYWNoZVtyZXZlcnNlID8gc2l6ZSAtICsraSA6IGkrK107XG4gICAgICAgIGlmIChmbihlbnRyeVsxXSwgZW50cnlbMF0sIHRoaXMpID09PSBmYWxzZSkge1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gaTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuX19pdGVyYXRlVW5jYWNoZWQoZm4sIHJldmVyc2UpO1xuICB9O1xuXG4gIC8vIGFic3RyYWN0IF9faXRlcmF0b3JVbmNhY2hlZCh0eXBlLCByZXZlcnNlKVxuXG4gIFNlcS5wcm90b3R5cGUuX19pdGVyYXRvciA9IGZ1bmN0aW9uIF9faXRlcmF0b3IgKHR5cGUsIHJldmVyc2UpIHtcbiAgICB2YXIgY2FjaGUgPSB0aGlzLl9jYWNoZTtcbiAgICBpZiAoY2FjaGUpIHtcbiAgICAgIHZhciBzaXplID0gY2FjaGUubGVuZ3RoO1xuICAgICAgdmFyIGkgPSAwO1xuICAgICAgcmV0dXJuIG5ldyBJdGVyYXRvcihmdW5jdGlvbiAoKSB7XG4gICAgICAgIGlmIChpID09PSBzaXplKSB7XG4gICAgICAgICAgcmV0dXJuIGl0ZXJhdG9yRG9uZSgpO1xuICAgICAgICB9XG4gICAgICAgIHZhciBlbnRyeSA9IGNhY2hlW3JldmVyc2UgPyBzaXplIC0gKytpIDogaSsrXTtcbiAgICAgICAgcmV0dXJuIGl0ZXJhdG9yVmFsdWUodHlwZSwgZW50cnlbMF0sIGVudHJ5WzFdKTtcbiAgICAgIH0pO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5fX2l0ZXJhdG9yVW5jYWNoZWQodHlwZSwgcmV2ZXJzZSk7XG4gIH07XG5cbiAgcmV0dXJuIFNlcTtcbn0oQ29sbGVjdGlvbikpO1xuXG52YXIgS2V5ZWRTZXEgPSAvKkBfX1BVUkVfXyovKGZ1bmN0aW9uIChTZXEpIHtcbiAgZnVuY3Rpb24gS2V5ZWRTZXEodmFsdWUpIHtcbiAgICByZXR1cm4gdmFsdWUgPT09IHVuZGVmaW5lZCB8fCB2YWx1ZSA9PT0gbnVsbFxuICAgICAgPyBlbXB0eVNlcXVlbmNlKCkudG9LZXllZFNlcSgpXG4gICAgICA6IGlzQ29sbGVjdGlvbih2YWx1ZSlcbiAgICAgID8gaXNLZXllZCh2YWx1ZSlcbiAgICAgICAgPyB2YWx1ZS50b1NlcSgpXG4gICAgICAgIDogdmFsdWUuZnJvbUVudHJ5U2VxKClcbiAgICAgIDogaXNSZWNvcmQodmFsdWUpXG4gICAgICA/IHZhbHVlLnRvU2VxKClcbiAgICAgIDoga2V5ZWRTZXFGcm9tVmFsdWUodmFsdWUpO1xuICB9XG5cbiAgaWYgKCBTZXEgKSBLZXllZFNlcS5fX3Byb3RvX18gPSBTZXE7XG4gIEtleWVkU2VxLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoIFNlcSAmJiBTZXEucHJvdG90eXBlICk7XG4gIEtleWVkU2VxLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IEtleWVkU2VxO1xuXG4gIEtleWVkU2VxLnByb3RvdHlwZS50b0tleWVkU2VxID0gZnVuY3Rpb24gdG9LZXllZFNlcSAoKSB7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH07XG5cbiAgcmV0dXJuIEtleWVkU2VxO1xufShTZXEpKTtcblxudmFyIEluZGV4ZWRTZXEgPSAvKkBfX1BVUkVfXyovKGZ1bmN0aW9uIChTZXEpIHtcbiAgZnVuY3Rpb24gSW5kZXhlZFNlcSh2YWx1ZSkge1xuICAgIHJldHVybiB2YWx1ZSA9PT0gdW5kZWZpbmVkIHx8IHZhbHVlID09PSBudWxsXG4gICAgICA/IGVtcHR5U2VxdWVuY2UoKVxuICAgICAgOiBpc0NvbGxlY3Rpb24odmFsdWUpXG4gICAgICA/IGlzS2V5ZWQodmFsdWUpXG4gICAgICAgID8gdmFsdWUuZW50cnlTZXEoKVxuICAgICAgICA6IHZhbHVlLnRvSW5kZXhlZFNlcSgpXG4gICAgICA6IGlzUmVjb3JkKHZhbHVlKVxuICAgICAgPyB2YWx1ZS50b1NlcSgpLmVudHJ5U2VxKClcbiAgICAgIDogaW5kZXhlZFNlcUZyb21WYWx1ZSh2YWx1ZSk7XG4gIH1cblxuICBpZiAoIFNlcSApIEluZGV4ZWRTZXEuX19wcm90b19fID0gU2VxO1xuICBJbmRleGVkU2VxLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoIFNlcSAmJiBTZXEucHJvdG90eXBlICk7XG4gIEluZGV4ZWRTZXEucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gSW5kZXhlZFNlcTtcblxuICBJbmRleGVkU2VxLm9mID0gZnVuY3Rpb24gb2YgKC8qLi4udmFsdWVzKi8pIHtcbiAgICByZXR1cm4gSW5kZXhlZFNlcShhcmd1bWVudHMpO1xuICB9O1xuXG4gIEluZGV4ZWRTZXEucHJvdG90eXBlLnRvSW5kZXhlZFNlcSA9IGZ1bmN0aW9uIHRvSW5kZXhlZFNlcSAoKSB7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH07XG5cbiAgSW5kZXhlZFNlcS5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbiB0b1N0cmluZyAoKSB7XG4gICAgcmV0dXJuIHRoaXMuX190b1N0cmluZygnU2VxIFsnLCAnXScpO1xuICB9O1xuXG4gIHJldHVybiBJbmRleGVkU2VxO1xufShTZXEpKTtcblxudmFyIFNldFNlcSA9IC8qQF9fUFVSRV9fKi8oZnVuY3Rpb24gKFNlcSkge1xuICBmdW5jdGlvbiBTZXRTZXEodmFsdWUpIHtcbiAgICByZXR1cm4gKFxuICAgICAgaXNDb2xsZWN0aW9uKHZhbHVlKSAmJiAhaXNBc3NvY2lhdGl2ZSh2YWx1ZSkgPyB2YWx1ZSA6IEluZGV4ZWRTZXEodmFsdWUpXG4gICAgKS50b1NldFNlcSgpO1xuICB9XG5cbiAgaWYgKCBTZXEgKSBTZXRTZXEuX19wcm90b19fID0gU2VxO1xuICBTZXRTZXEucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZSggU2VxICYmIFNlcS5wcm90b3R5cGUgKTtcbiAgU2V0U2VxLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IFNldFNlcTtcblxuICBTZXRTZXEub2YgPSBmdW5jdGlvbiBvZiAoLyouLi52YWx1ZXMqLykge1xuICAgIHJldHVybiBTZXRTZXEoYXJndW1lbnRzKTtcbiAgfTtcblxuICBTZXRTZXEucHJvdG90eXBlLnRvU2V0U2VxID0gZnVuY3Rpb24gdG9TZXRTZXEgKCkge1xuICAgIHJldHVybiB0aGlzO1xuICB9O1xuXG4gIHJldHVybiBTZXRTZXE7XG59KFNlcSkpO1xuXG5TZXEuaXNTZXEgPSBpc1NlcTtcblNlcS5LZXllZCA9IEtleWVkU2VxO1xuU2VxLlNldCA9IFNldFNlcTtcblNlcS5JbmRleGVkID0gSW5kZXhlZFNlcTtcblxuU2VxLnByb3RvdHlwZVtJU19TRVFfU1lNQk9MXSA9IHRydWU7XG5cbi8vICNwcmFnbWEgUm9vdCBTZXF1ZW5jZXNcblxudmFyIEFycmF5U2VxID0gLypAX19QVVJFX18qLyhmdW5jdGlvbiAoSW5kZXhlZFNlcSkge1xuICBmdW5jdGlvbiBBcnJheVNlcShhcnJheSkge1xuICAgIHRoaXMuX2FycmF5ID0gYXJyYXk7XG4gICAgdGhpcy5zaXplID0gYXJyYXkubGVuZ3RoO1xuICB9XG5cbiAgaWYgKCBJbmRleGVkU2VxICkgQXJyYXlTZXEuX19wcm90b19fID0gSW5kZXhlZFNlcTtcbiAgQXJyYXlTZXEucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZSggSW5kZXhlZFNlcSAmJiBJbmRleGVkU2VxLnByb3RvdHlwZSApO1xuICBBcnJheVNlcS5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBBcnJheVNlcTtcblxuICBBcnJheVNlcS5wcm90b3R5cGUuZ2V0ID0gZnVuY3Rpb24gZ2V0IChpbmRleCwgbm90U2V0VmFsdWUpIHtcbiAgICByZXR1cm4gdGhpcy5oYXMoaW5kZXgpID8gdGhpcy5fYXJyYXlbd3JhcEluZGV4KHRoaXMsIGluZGV4KV0gOiBub3RTZXRWYWx1ZTtcbiAgfTtcblxuICBBcnJheVNlcS5wcm90b3R5cGUuX19pdGVyYXRlID0gZnVuY3Rpb24gX19pdGVyYXRlIChmbiwgcmV2ZXJzZSkge1xuICAgIHZhciBhcnJheSA9IHRoaXMuX2FycmF5O1xuICAgIHZhciBzaXplID0gYXJyYXkubGVuZ3RoO1xuICAgIHZhciBpID0gMDtcbiAgICB3aGlsZSAoaSAhPT0gc2l6ZSkge1xuICAgICAgdmFyIGlpID0gcmV2ZXJzZSA/IHNpemUgLSArK2kgOiBpKys7XG4gICAgICBpZiAoZm4oYXJyYXlbaWldLCBpaSwgdGhpcykgPT09IGZhbHNlKSB7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gaTtcbiAgfTtcblxuICBBcnJheVNlcS5wcm90b3R5cGUuX19pdGVyYXRvciA9IGZ1bmN0aW9uIF9faXRlcmF0b3IgKHR5cGUsIHJldmVyc2UpIHtcbiAgICB2YXIgYXJyYXkgPSB0aGlzLl9hcnJheTtcbiAgICB2YXIgc2l6ZSA9IGFycmF5Lmxlbmd0aDtcbiAgICB2YXIgaSA9IDA7XG4gICAgcmV0dXJuIG5ldyBJdGVyYXRvcihmdW5jdGlvbiAoKSB7XG4gICAgICBpZiAoaSA9PT0gc2l6ZSkge1xuICAgICAgICByZXR1cm4gaXRlcmF0b3JEb25lKCk7XG4gICAgICB9XG4gICAgICB2YXIgaWkgPSByZXZlcnNlID8gc2l6ZSAtICsraSA6IGkrKztcbiAgICAgIHJldHVybiBpdGVyYXRvclZhbHVlKHR5cGUsIGlpLCBhcnJheVtpaV0pO1xuICAgIH0pO1xuICB9O1xuXG4gIHJldHVybiBBcnJheVNlcTtcbn0oSW5kZXhlZFNlcSkpO1xuXG52YXIgT2JqZWN0U2VxID0gLypAX19QVVJFX18qLyhmdW5jdGlvbiAoS2V5ZWRTZXEpIHtcbiAgZnVuY3Rpb24gT2JqZWN0U2VxKG9iamVjdCkge1xuICAgIHZhciBrZXlzID0gT2JqZWN0LmtleXMob2JqZWN0KS5jb25jYXQoXG4gICAgICBPYmplY3QuZ2V0T3duUHJvcGVydHlTeW1ib2xzID8gT2JqZWN0LmdldE93blByb3BlcnR5U3ltYm9scyhvYmplY3QpIDogW11cbiAgICApO1xuICAgIHRoaXMuX29iamVjdCA9IG9iamVjdDtcbiAgICB0aGlzLl9rZXlzID0ga2V5cztcbiAgICB0aGlzLnNpemUgPSBrZXlzLmxlbmd0aDtcbiAgfVxuXG4gIGlmICggS2V5ZWRTZXEgKSBPYmplY3RTZXEuX19wcm90b19fID0gS2V5ZWRTZXE7XG4gIE9iamVjdFNlcS5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKCBLZXllZFNlcSAmJiBLZXllZFNlcS5wcm90b3R5cGUgKTtcbiAgT2JqZWN0U2VxLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IE9iamVjdFNlcTtcblxuICBPYmplY3RTZXEucHJvdG90eXBlLmdldCA9IGZ1bmN0aW9uIGdldCAoa2V5LCBub3RTZXRWYWx1ZSkge1xuICAgIGlmIChub3RTZXRWYWx1ZSAhPT0gdW5kZWZpbmVkICYmICF0aGlzLmhhcyhrZXkpKSB7XG4gICAgICByZXR1cm4gbm90U2V0VmFsdWU7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLl9vYmplY3Rba2V5XTtcbiAgfTtcblxuICBPYmplY3RTZXEucHJvdG90eXBlLmhhcyA9IGZ1bmN0aW9uIGhhcyAoa2V5KSB7XG4gICAgcmV0dXJuIGhhc093blByb3BlcnR5LmNhbGwodGhpcy5fb2JqZWN0LCBrZXkpO1xuICB9O1xuXG4gIE9iamVjdFNlcS5wcm90b3R5cGUuX19pdGVyYXRlID0gZnVuY3Rpb24gX19pdGVyYXRlIChmbiwgcmV2ZXJzZSkge1xuICAgIHZhciBvYmplY3QgPSB0aGlzLl9vYmplY3Q7XG4gICAgdmFyIGtleXMgPSB0aGlzLl9rZXlzO1xuICAgIHZhciBzaXplID0ga2V5cy5sZW5ndGg7XG4gICAgdmFyIGkgPSAwO1xuICAgIHdoaWxlIChpICE9PSBzaXplKSB7XG4gICAgICB2YXIga2V5ID0ga2V5c1tyZXZlcnNlID8gc2l6ZSAtICsraSA6IGkrK107XG4gICAgICBpZiAoZm4ob2JqZWN0W2tleV0sIGtleSwgdGhpcykgPT09IGZhbHNlKSB7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gaTtcbiAgfTtcblxuICBPYmplY3RTZXEucHJvdG90eXBlLl9faXRlcmF0b3IgPSBmdW5jdGlvbiBfX2l0ZXJhdG9yICh0eXBlLCByZXZlcnNlKSB7XG4gICAgdmFyIG9iamVjdCA9IHRoaXMuX29iamVjdDtcbiAgICB2YXIga2V5cyA9IHRoaXMuX2tleXM7XG4gICAgdmFyIHNpemUgPSBrZXlzLmxlbmd0aDtcbiAgICB2YXIgaSA9IDA7XG4gICAgcmV0dXJuIG5ldyBJdGVyYXRvcihmdW5jdGlvbiAoKSB7XG4gICAgICBpZiAoaSA9PT0gc2l6ZSkge1xuICAgICAgICByZXR1cm4gaXRlcmF0b3JEb25lKCk7XG4gICAgICB9XG4gICAgICB2YXIga2V5ID0ga2V5c1tyZXZlcnNlID8gc2l6ZSAtICsraSA6IGkrK107XG4gICAgICByZXR1cm4gaXRlcmF0b3JWYWx1ZSh0eXBlLCBrZXksIG9iamVjdFtrZXldKTtcbiAgICB9KTtcbiAgfTtcblxuICByZXR1cm4gT2JqZWN0U2VxO1xufShLZXllZFNlcSkpO1xuT2JqZWN0U2VxLnByb3RvdHlwZVtJU19PUkRFUkVEX1NZTUJPTF0gPSB0cnVlO1xuXG52YXIgQ29sbGVjdGlvblNlcSA9IC8qQF9fUFVSRV9fKi8oZnVuY3Rpb24gKEluZGV4ZWRTZXEpIHtcbiAgZnVuY3Rpb24gQ29sbGVjdGlvblNlcShjb2xsZWN0aW9uKSB7XG4gICAgdGhpcy5fY29sbGVjdGlvbiA9IGNvbGxlY3Rpb247XG4gICAgdGhpcy5zaXplID0gY29sbGVjdGlvbi5sZW5ndGggfHwgY29sbGVjdGlvbi5zaXplO1xuICB9XG5cbiAgaWYgKCBJbmRleGVkU2VxICkgQ29sbGVjdGlvblNlcS5fX3Byb3RvX18gPSBJbmRleGVkU2VxO1xuICBDb2xsZWN0aW9uU2VxLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoIEluZGV4ZWRTZXEgJiYgSW5kZXhlZFNlcS5wcm90b3R5cGUgKTtcbiAgQ29sbGVjdGlvblNlcS5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBDb2xsZWN0aW9uU2VxO1xuXG4gIENvbGxlY3Rpb25TZXEucHJvdG90eXBlLl9faXRlcmF0ZVVuY2FjaGVkID0gZnVuY3Rpb24gX19pdGVyYXRlVW5jYWNoZWQgKGZuLCByZXZlcnNlKSB7XG4gICAgaWYgKHJldmVyc2UpIHtcbiAgICAgIHJldHVybiB0aGlzLmNhY2hlUmVzdWx0KCkuX19pdGVyYXRlKGZuLCByZXZlcnNlKTtcbiAgICB9XG4gICAgdmFyIGNvbGxlY3Rpb24gPSB0aGlzLl9jb2xsZWN0aW9uO1xuICAgIHZhciBpdGVyYXRvciA9IGdldEl0ZXJhdG9yKGNvbGxlY3Rpb24pO1xuICAgIHZhciBpdGVyYXRpb25zID0gMDtcbiAgICBpZiAoaXNJdGVyYXRvcihpdGVyYXRvcikpIHtcbiAgICAgIHZhciBzdGVwO1xuICAgICAgd2hpbGUgKCEoc3RlcCA9IGl0ZXJhdG9yLm5leHQoKSkuZG9uZSkge1xuICAgICAgICBpZiAoZm4oc3RlcC52YWx1ZSwgaXRlcmF0aW9ucysrLCB0aGlzKSA9PT0gZmFsc2UpIHtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gaXRlcmF0aW9ucztcbiAgfTtcblxuICBDb2xsZWN0aW9uU2VxLnByb3RvdHlwZS5fX2l0ZXJhdG9yVW5jYWNoZWQgPSBmdW5jdGlvbiBfX2l0ZXJhdG9yVW5jYWNoZWQgKHR5cGUsIHJldmVyc2UpIHtcbiAgICBpZiAocmV2ZXJzZSkge1xuICAgICAgcmV0dXJuIHRoaXMuY2FjaGVSZXN1bHQoKS5fX2l0ZXJhdG9yKHR5cGUsIHJldmVyc2UpO1xuICAgIH1cbiAgICB2YXIgY29sbGVjdGlvbiA9IHRoaXMuX2NvbGxlY3Rpb247XG4gICAgdmFyIGl0ZXJhdG9yID0gZ2V0SXRlcmF0b3IoY29sbGVjdGlvbik7XG4gICAgaWYgKCFpc0l0ZXJhdG9yKGl0ZXJhdG9yKSkge1xuICAgICAgcmV0dXJuIG5ldyBJdGVyYXRvcihpdGVyYXRvckRvbmUpO1xuICAgIH1cbiAgICB2YXIgaXRlcmF0aW9ucyA9IDA7XG4gICAgcmV0dXJuIG5ldyBJdGVyYXRvcihmdW5jdGlvbiAoKSB7XG4gICAgICB2YXIgc3RlcCA9IGl0ZXJhdG9yLm5leHQoKTtcbiAgICAgIHJldHVybiBzdGVwLmRvbmUgPyBzdGVwIDogaXRlcmF0b3JWYWx1ZSh0eXBlLCBpdGVyYXRpb25zKyssIHN0ZXAudmFsdWUpO1xuICAgIH0pO1xuICB9O1xuXG4gIHJldHVybiBDb2xsZWN0aW9uU2VxO1xufShJbmRleGVkU2VxKSk7XG5cbi8vICMgcHJhZ21hIEhlbHBlciBmdW5jdGlvbnNcblxudmFyIEVNUFRZX1NFUTtcblxuZnVuY3Rpb24gZW1wdHlTZXF1ZW5jZSgpIHtcbiAgcmV0dXJuIEVNUFRZX1NFUSB8fCAoRU1QVFlfU0VRID0gbmV3IEFycmF5U2VxKFtdKSk7XG59XG5cbmZ1bmN0aW9uIGtleWVkU2VxRnJvbVZhbHVlKHZhbHVlKSB7XG4gIHZhciBzZXEgPSBtYXliZUluZGV4ZWRTZXFGcm9tVmFsdWUodmFsdWUpO1xuICBpZiAoc2VxKSB7XG4gICAgcmV0dXJuIHNlcS5mcm9tRW50cnlTZXEoKTtcbiAgfVxuICBpZiAodHlwZW9mIHZhbHVlID09PSAnb2JqZWN0Jykge1xuICAgIHJldHVybiBuZXcgT2JqZWN0U2VxKHZhbHVlKTtcbiAgfVxuICB0aHJvdyBuZXcgVHlwZUVycm9yKFxuICAgICdFeHBlY3RlZCBBcnJheSBvciBjb2xsZWN0aW9uIG9iamVjdCBvZiBbaywgdl0gZW50cmllcywgb3Iga2V5ZWQgb2JqZWN0OiAnICtcbiAgICAgIHZhbHVlXG4gICk7XG59XG5cbmZ1bmN0aW9uIGluZGV4ZWRTZXFGcm9tVmFsdWUodmFsdWUpIHtcbiAgdmFyIHNlcSA9IG1heWJlSW5kZXhlZFNlcUZyb21WYWx1ZSh2YWx1ZSk7XG4gIGlmIChzZXEpIHtcbiAgICByZXR1cm4gc2VxO1xuICB9XG4gIHRocm93IG5ldyBUeXBlRXJyb3IoXG4gICAgJ0V4cGVjdGVkIEFycmF5IG9yIGNvbGxlY3Rpb24gb2JqZWN0IG9mIHZhbHVlczogJyArIHZhbHVlXG4gICk7XG59XG5cbmZ1bmN0aW9uIHNlcUZyb21WYWx1ZSh2YWx1ZSkge1xuICB2YXIgc2VxID0gbWF5YmVJbmRleGVkU2VxRnJvbVZhbHVlKHZhbHVlKTtcbiAgaWYgKHNlcSkge1xuICAgIHJldHVybiBpc0VudHJpZXNJdGVyYWJsZSh2YWx1ZSlcbiAgICAgID8gc2VxLmZyb21FbnRyeVNlcSgpXG4gICAgICA6IGlzS2V5c0l0ZXJhYmxlKHZhbHVlKVxuICAgICAgPyBzZXEudG9TZXRTZXEoKVxuICAgICAgOiBzZXE7XG4gIH1cbiAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ29iamVjdCcpIHtcbiAgICByZXR1cm4gbmV3IE9iamVjdFNlcSh2YWx1ZSk7XG4gIH1cbiAgdGhyb3cgbmV3IFR5cGVFcnJvcihcbiAgICAnRXhwZWN0ZWQgQXJyYXkgb3IgY29sbGVjdGlvbiBvYmplY3Qgb2YgdmFsdWVzLCBvciBrZXllZCBvYmplY3Q6ICcgKyB2YWx1ZVxuICApO1xufVxuXG5mdW5jdGlvbiBtYXliZUluZGV4ZWRTZXFGcm9tVmFsdWUodmFsdWUpIHtcbiAgcmV0dXJuIGlzQXJyYXlMaWtlKHZhbHVlKVxuICAgID8gbmV3IEFycmF5U2VxKHZhbHVlKVxuICAgIDogaGFzSXRlcmF0b3IodmFsdWUpXG4gICAgPyBuZXcgQ29sbGVjdGlvblNlcSh2YWx1ZSlcbiAgICA6IHVuZGVmaW5lZDtcbn1cblxudmFyIElTX01BUF9TWU1CT0wgPSAnQEBfX0lNTVVUQUJMRV9NQVBfX0BAJztcblxuZnVuY3Rpb24gaXNNYXAobWF5YmVNYXApIHtcbiAgcmV0dXJuIEJvb2xlYW4obWF5YmVNYXAgJiYgbWF5YmVNYXBbSVNfTUFQX1NZTUJPTF0pO1xufVxuXG5mdW5jdGlvbiBpc09yZGVyZWRNYXAobWF5YmVPcmRlcmVkTWFwKSB7XG4gIHJldHVybiBpc01hcChtYXliZU9yZGVyZWRNYXApICYmIGlzT3JkZXJlZChtYXliZU9yZGVyZWRNYXApO1xufVxuXG5mdW5jdGlvbiBpc1ZhbHVlT2JqZWN0KG1heWJlVmFsdWUpIHtcbiAgcmV0dXJuIEJvb2xlYW4oXG4gICAgbWF5YmVWYWx1ZSAmJlxuICAgICAgdHlwZW9mIG1heWJlVmFsdWUuZXF1YWxzID09PSAnZnVuY3Rpb24nICYmXG4gICAgICB0eXBlb2YgbWF5YmVWYWx1ZS5oYXNoQ29kZSA9PT0gJ2Z1bmN0aW9uJ1xuICApO1xufVxuXG4vKipcbiAqIEFuIGV4dGVuc2lvbiBvZiB0aGUgXCJzYW1lLXZhbHVlXCIgYWxnb3JpdGhtIGFzIFtkZXNjcmliZWQgZm9yIHVzZSBieSBFUzYgTWFwXG4gKiBhbmQgU2V0XShodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9KYXZhU2NyaXB0L1JlZmVyZW5jZS9HbG9iYWxfT2JqZWN0cy9NYXAjS2V5X2VxdWFsaXR5KVxuICpcbiAqIE5hTiBpcyBjb25zaWRlcmVkIHRoZSBzYW1lIGFzIE5hTiwgaG93ZXZlciAtMCBhbmQgMCBhcmUgY29uc2lkZXJlZCB0aGUgc2FtZVxuICogdmFsdWUsIHdoaWNoIGlzIGRpZmZlcmVudCBmcm9tIHRoZSBhbGdvcml0aG0gZGVzY3JpYmVkIGJ5XG4gKiBbYE9iamVjdC5pc2BdKGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0phdmFTY3JpcHQvUmVmZXJlbmNlL0dsb2JhbF9PYmplY3RzL09iamVjdC9pcykuXG4gKlxuICogVGhpcyBpcyBleHRlbmRlZCBmdXJ0aGVyIHRvIGFsbG93IE9iamVjdHMgdG8gZGVzY3JpYmUgdGhlIHZhbHVlcyB0aGV5XG4gKiByZXByZXNlbnQsIGJ5IHdheSBvZiBgdmFsdWVPZmAgb3IgYGVxdWFsc2AgKGFuZCBgaGFzaENvZGVgKS5cbiAqXG4gKiBOb3RlOiBiZWNhdXNlIG9mIHRoaXMgZXh0ZW5zaW9uLCB0aGUga2V5IGVxdWFsaXR5IG9mIEltbXV0YWJsZS5NYXAgYW5kIHRoZVxuICogdmFsdWUgZXF1YWxpdHkgb2YgSW1tdXRhYmxlLlNldCB3aWxsIGRpZmZlciBmcm9tIEVTNiBNYXAgYW5kIFNldC5cbiAqXG4gKiAjIyMgRGVmaW5pbmcgY3VzdG9tIHZhbHVlc1xuICpcbiAqIFRoZSBlYXNpZXN0IHdheSB0byBkZXNjcmliZSB0aGUgdmFsdWUgYW4gb2JqZWN0IHJlcHJlc2VudHMgaXMgYnkgaW1wbGVtZW50aW5nXG4gKiBgdmFsdWVPZmAuIEZvciBleGFtcGxlLCBgRGF0ZWAgcmVwcmVzZW50cyBhIHZhbHVlIGJ5IHJldHVybmluZyBhIHVuaXhcbiAqIHRpbWVzdGFtcCBmb3IgYHZhbHVlT2ZgOlxuICpcbiAqICAgICB2YXIgZGF0ZTEgPSBuZXcgRGF0ZSgxMjM0NTY3ODkwMDAwKTsgLy8gRnJpIEZlYiAxMyAyMDA5IC4uLlxuICogICAgIHZhciBkYXRlMiA9IG5ldyBEYXRlKDEyMzQ1Njc4OTAwMDApO1xuICogICAgIGRhdGUxLnZhbHVlT2YoKTsgLy8gMTIzNDU2Nzg5MDAwMFxuICogICAgIGFzc2VydCggZGF0ZTEgIT09IGRhdGUyICk7XG4gKiAgICAgYXNzZXJ0KCBJbW11dGFibGUuaXMoIGRhdGUxLCBkYXRlMiApICk7XG4gKlxuICogTm90ZTogb3ZlcnJpZGluZyBgdmFsdWVPZmAgbWF5IGhhdmUgb3RoZXIgaW1wbGljYXRpb25zIGlmIHlvdSB1c2UgdGhpcyBvYmplY3RcbiAqIHdoZXJlIEphdmFTY3JpcHQgZXhwZWN0cyBhIHByaW1pdGl2ZSwgc3VjaCBhcyBpbXBsaWNpdCBzdHJpbmcgY29lcmNpb24uXG4gKlxuICogRm9yIG1vcmUgY29tcGxleCB0eXBlcywgZXNwZWNpYWxseSBjb2xsZWN0aW9ucywgaW1wbGVtZW50aW5nIGB2YWx1ZU9mYCBtYXlcbiAqIG5vdCBiZSBwZXJmb3JtYW50LiBBbiBhbHRlcm5hdGl2ZSBpcyB0byBpbXBsZW1lbnQgYGVxdWFsc2AgYW5kIGBoYXNoQ29kZWAuXG4gKlxuICogYGVxdWFsc2AgdGFrZXMgYW5vdGhlciBvYmplY3QsIHByZXN1bWFibHkgb2Ygc2ltaWxhciB0eXBlLCBhbmQgcmV0dXJucyB0cnVlXG4gKiBpZiBpdCBpcyBlcXVhbC4gRXF1YWxpdHkgaXMgc3ltbWV0cmljYWwsIHNvIHRoZSBzYW1lIHJlc3VsdCBzaG91bGQgYmVcbiAqIHJldHVybmVkIGlmIHRoaXMgYW5kIHRoZSBhcmd1bWVudCBhcmUgZmxpcHBlZC5cbiAqXG4gKiAgICAgYXNzZXJ0KCBhLmVxdWFscyhiKSA9PT0gYi5lcXVhbHMoYSkgKTtcbiAqXG4gKiBgaGFzaENvZGVgIHJldHVybnMgYSAzMmJpdCBpbnRlZ2VyIG51bWJlciByZXByZXNlbnRpbmcgdGhlIG9iamVjdCB3aGljaCB3aWxsXG4gKiBiZSB1c2VkIHRvIGRldGVybWluZSBob3cgdG8gc3RvcmUgdGhlIHZhbHVlIG9iamVjdCBpbiBhIE1hcCBvciBTZXQuIFlvdSBtdXN0XG4gKiBwcm92aWRlIGJvdGggb3IgbmVpdGhlciBtZXRob2RzLCBvbmUgbXVzdCBub3QgZXhpc3Qgd2l0aG91dCB0aGUgb3RoZXIuXG4gKlxuICogQWxzbywgYW4gaW1wb3J0YW50IHJlbGF0aW9uc2hpcCBiZXR3ZWVuIHRoZXNlIG1ldGhvZHMgbXVzdCBiZSB1cGhlbGQ6IGlmIHR3b1xuICogdmFsdWVzIGFyZSBlcXVhbCwgdGhleSAqbXVzdCogcmV0dXJuIHRoZSBzYW1lIGhhc2hDb2RlLiBJZiB0aGUgdmFsdWVzIGFyZSBub3RcbiAqIGVxdWFsLCB0aGV5IG1pZ2h0IGhhdmUgdGhlIHNhbWUgaGFzaENvZGU7IHRoaXMgaXMgY2FsbGVkIGEgaGFzaCBjb2xsaXNpb24sXG4gKiBhbmQgd2hpbGUgdW5kZXNpcmFibGUgZm9yIHBlcmZvcm1hbmNlIHJlYXNvbnMsIGl0IGlzIGFjY2VwdGFibGUuXG4gKlxuICogICAgIGlmIChhLmVxdWFscyhiKSkge1xuICogICAgICAgYXNzZXJ0KCBhLmhhc2hDb2RlKCkgPT09IGIuaGFzaENvZGUoKSApO1xuICogICAgIH1cbiAqXG4gKiBBbGwgSW1tdXRhYmxlIGNvbGxlY3Rpb25zIGFyZSBWYWx1ZSBPYmplY3RzOiB0aGV5IGltcGxlbWVudCBgZXF1YWxzKClgXG4gKiBhbmQgYGhhc2hDb2RlKClgLlxuICovXG5mdW5jdGlvbiBpcyh2YWx1ZUEsIHZhbHVlQikge1xuICBpZiAodmFsdWVBID09PSB2YWx1ZUIgfHwgKHZhbHVlQSAhPT0gdmFsdWVBICYmIHZhbHVlQiAhPT0gdmFsdWVCKSkge1xuICAgIHJldHVybiB0cnVlO1xuICB9XG4gIGlmICghdmFsdWVBIHx8ICF2YWx1ZUIpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgaWYgKFxuICAgIHR5cGVvZiB2YWx1ZUEudmFsdWVPZiA9PT0gJ2Z1bmN0aW9uJyAmJlxuICAgIHR5cGVvZiB2YWx1ZUIudmFsdWVPZiA9PT0gJ2Z1bmN0aW9uJ1xuICApIHtcbiAgICB2YWx1ZUEgPSB2YWx1ZUEudmFsdWVPZigpO1xuICAgIHZhbHVlQiA9IHZhbHVlQi52YWx1ZU9mKCk7XG4gICAgaWYgKHZhbHVlQSA9PT0gdmFsdWVCIHx8ICh2YWx1ZUEgIT09IHZhbHVlQSAmJiB2YWx1ZUIgIT09IHZhbHVlQikpIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICBpZiAoIXZhbHVlQSB8fCAhdmFsdWVCKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICB9XG4gIHJldHVybiAhIShcbiAgICBpc1ZhbHVlT2JqZWN0KHZhbHVlQSkgJiZcbiAgICBpc1ZhbHVlT2JqZWN0KHZhbHVlQikgJiZcbiAgICB2YWx1ZUEuZXF1YWxzKHZhbHVlQilcbiAgKTtcbn1cblxudmFyIGltdWwgPVxuICB0eXBlb2YgTWF0aC5pbXVsID09PSAnZnVuY3Rpb24nICYmIE1hdGguaW11bCgweGZmZmZmZmZmLCAyKSA9PT0gLTJcbiAgICA/IE1hdGguaW11bFxuICAgIDogZnVuY3Rpb24gaW11bChhLCBiKSB7XG4gICAgICAgIGEgfD0gMDsgLy8gaW50XG4gICAgICAgIGIgfD0gMDsgLy8gaW50XG4gICAgICAgIHZhciBjID0gYSAmIDB4ZmZmZjtcbiAgICAgICAgdmFyIGQgPSBiICYgMHhmZmZmO1xuICAgICAgICAvLyBTaGlmdCBieSAwIGZpeGVzIHRoZSBzaWduIG9uIHRoZSBoaWdoIHBhcnQuXG4gICAgICAgIHJldHVybiAoYyAqIGQgKyAoKCgoYSA+Pj4gMTYpICogZCArIGMgKiAoYiA+Pj4gMTYpKSA8PCAxNikgPj4+IDApKSB8IDA7IC8vIGludFxuICAgICAgfTtcblxuLy8gdjggaGFzIGFuIG9wdGltaXphdGlvbiBmb3Igc3RvcmluZyAzMS1iaXQgc2lnbmVkIG51bWJlcnMuXG4vLyBWYWx1ZXMgd2hpY2ggaGF2ZSBlaXRoZXIgMDAgb3IgMTEgYXMgdGhlIGhpZ2ggb3JkZXIgYml0cyBxdWFsaWZ5LlxuLy8gVGhpcyBmdW5jdGlvbiBkcm9wcyB0aGUgaGlnaGVzdCBvcmRlciBiaXQgaW4gYSBzaWduZWQgbnVtYmVyLCBtYWludGFpbmluZ1xuLy8gdGhlIHNpZ24gYml0LlxuZnVuY3Rpb24gc21pKGkzMikge1xuICByZXR1cm4gKChpMzIgPj4+IDEpICYgMHg0MDAwMDAwMCkgfCAoaTMyICYgMHhiZmZmZmZmZik7XG59XG5cbnZhciBkZWZhdWx0VmFsdWVPZiA9IE9iamVjdC5wcm90b3R5cGUudmFsdWVPZjtcblxuZnVuY3Rpb24gaGFzaChvKSB7XG4gIGlmIChvID09IG51bGwpIHtcbiAgICByZXR1cm4gaGFzaE51bGxpc2gobyk7XG4gIH1cblxuICBpZiAodHlwZW9mIG8uaGFzaENvZGUgPT09ICdmdW5jdGlvbicpIHtcbiAgICAvLyBEcm9wIGFueSBoaWdoIGJpdHMgZnJvbSBhY2NpZGVudGFsbHkgbG9uZyBoYXNoIGNvZGVzLlxuICAgIHJldHVybiBzbWkoby5oYXNoQ29kZShvKSk7XG4gIH1cblxuICB2YXIgdiA9IHZhbHVlT2Yobyk7XG5cbiAgaWYgKHYgPT0gbnVsbCkge1xuICAgIHJldHVybiBoYXNoTnVsbGlzaCh2KTtcbiAgfVxuXG4gIHN3aXRjaCAodHlwZW9mIHYpIHtcbiAgICBjYXNlICdib29sZWFuJzpcbiAgICAgIC8vIFRoZSBoYXNoIHZhbHVlcyBmb3IgYnVpbHQtaW4gY29uc3RhbnRzIGFyZSBhIDEgdmFsdWUgZm9yIGVhY2ggNS1ieXRlXG4gICAgICAvLyBzaGlmdCByZWdpb24gZXhwZWN0IGZvciB0aGUgZmlyc3QsIHdoaWNoIGVuY29kZXMgdGhlIHZhbHVlLiBUaGlzXG4gICAgICAvLyByZWR1Y2VzIHRoZSBvZGRzIG9mIGEgaGFzaCBjb2xsaXNpb24gZm9yIHRoZXNlIGNvbW1vbiB2YWx1ZXMuXG4gICAgICByZXR1cm4gdiA/IDB4NDIxMDg0MjEgOiAweDQyMTA4NDIwO1xuICAgIGNhc2UgJ251bWJlcic6XG4gICAgICByZXR1cm4gaGFzaE51bWJlcih2KTtcbiAgICBjYXNlICdzdHJpbmcnOlxuICAgICAgcmV0dXJuIHYubGVuZ3RoID4gU1RSSU5HX0hBU0hfQ0FDSEVfTUlOX1NUUkxFTlxuICAgICAgICA/IGNhY2hlZEhhc2hTdHJpbmcodilcbiAgICAgICAgOiBoYXNoU3RyaW5nKHYpO1xuICAgIGNhc2UgJ29iamVjdCc6XG4gICAgY2FzZSAnZnVuY3Rpb24nOlxuICAgICAgcmV0dXJuIGhhc2hKU09iaih2KTtcbiAgICBjYXNlICdzeW1ib2wnOlxuICAgICAgcmV0dXJuIGhhc2hTeW1ib2wodik7XG4gICAgZGVmYXVsdDpcbiAgICAgIGlmICh0eXBlb2Ygdi50b1N0cmluZyA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICByZXR1cm4gaGFzaFN0cmluZyh2LnRvU3RyaW5nKCkpO1xuICAgICAgfVxuICAgICAgdGhyb3cgbmV3IEVycm9yKCdWYWx1ZSB0eXBlICcgKyB0eXBlb2YgdiArICcgY2Fubm90IGJlIGhhc2hlZC4nKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBoYXNoTnVsbGlzaChudWxsaXNoKSB7XG4gIHJldHVybiBudWxsaXNoID09PSBudWxsID8gMHg0MjEwODQyMiA6IC8qIHVuZGVmaW5lZCAqLyAweDQyMTA4NDIzO1xufVxuXG4vLyBDb21wcmVzcyBhcmJpdHJhcmlseSBsYXJnZSBudW1iZXJzIGludG8gc21pIGhhc2hlcy5cbmZ1bmN0aW9uIGhhc2hOdW1iZXIobikge1xuICBpZiAobiAhPT0gbiB8fCBuID09PSBJbmZpbml0eSkge1xuICAgIHJldHVybiAwO1xuICB9XG4gIHZhciBoYXNoID0gbiB8IDA7XG4gIGlmIChoYXNoICE9PSBuKSB7XG4gICAgaGFzaCBePSBuICogMHhmZmZmZmZmZjtcbiAgfVxuICB3aGlsZSAobiA+IDB4ZmZmZmZmZmYpIHtcbiAgICBuIC89IDB4ZmZmZmZmZmY7XG4gICAgaGFzaCBePSBuO1xuICB9XG4gIHJldHVybiBzbWkoaGFzaCk7XG59XG5cbmZ1bmN0aW9uIGNhY2hlZEhhc2hTdHJpbmcoc3RyaW5nKSB7XG4gIHZhciBoYXNoZWQgPSBzdHJpbmdIYXNoQ2FjaGVbc3RyaW5nXTtcbiAgaWYgKGhhc2hlZCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgaGFzaGVkID0gaGFzaFN0cmluZyhzdHJpbmcpO1xuICAgIGlmIChTVFJJTkdfSEFTSF9DQUNIRV9TSVpFID09PSBTVFJJTkdfSEFTSF9DQUNIRV9NQVhfU0laRSkge1xuICAgICAgU1RSSU5HX0hBU0hfQ0FDSEVfU0laRSA9IDA7XG4gICAgICBzdHJpbmdIYXNoQ2FjaGUgPSB7fTtcbiAgICB9XG4gICAgU1RSSU5HX0hBU0hfQ0FDSEVfU0laRSsrO1xuICAgIHN0cmluZ0hhc2hDYWNoZVtzdHJpbmddID0gaGFzaGVkO1xuICB9XG4gIHJldHVybiBoYXNoZWQ7XG59XG5cbi8vIGh0dHA6Ly9qc3BlcmYuY29tL2hhc2hpbmctc3RyaW5nc1xuZnVuY3Rpb24gaGFzaFN0cmluZyhzdHJpbmcpIHtcbiAgLy8gVGhpcyBpcyB0aGUgaGFzaCBmcm9tIEpWTVxuICAvLyBUaGUgaGFzaCBjb2RlIGZvciBhIHN0cmluZyBpcyBjb21wdXRlZCBhc1xuICAvLyBzWzBdICogMzEgXiAobiAtIDEpICsgc1sxXSAqIDMxIF4gKG4gLSAyKSArIC4uLiArIHNbbiAtIDFdLFxuICAvLyB3aGVyZSBzW2ldIGlzIHRoZSBpdGggY2hhcmFjdGVyIG9mIHRoZSBzdHJpbmcgYW5kIG4gaXMgdGhlIGxlbmd0aCBvZlxuICAvLyB0aGUgc3RyaW5nLiBXZSBcIm1vZFwiIHRoZSByZXN1bHQgdG8gbWFrZSBpdCBiZXR3ZWVuIDAgKGluY2x1c2l2ZSkgYW5kIDJeMzFcbiAgLy8gKGV4Y2x1c2l2ZSkgYnkgZHJvcHBpbmcgaGlnaCBiaXRzLlxuICB2YXIgaGFzaGVkID0gMDtcbiAgZm9yICh2YXIgaWkgPSAwOyBpaSA8IHN0cmluZy5sZW5ndGg7IGlpKyspIHtcbiAgICBoYXNoZWQgPSAoMzEgKiBoYXNoZWQgKyBzdHJpbmcuY2hhckNvZGVBdChpaSkpIHwgMDtcbiAgfVxuICByZXR1cm4gc21pKGhhc2hlZCk7XG59XG5cbmZ1bmN0aW9uIGhhc2hTeW1ib2woc3ltKSB7XG4gIHZhciBoYXNoZWQgPSBzeW1ib2xNYXBbc3ltXTtcbiAgaWYgKGhhc2hlZCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgcmV0dXJuIGhhc2hlZDtcbiAgfVxuXG4gIGhhc2hlZCA9IG5leHRIYXNoKCk7XG5cbiAgc3ltYm9sTWFwW3N5bV0gPSBoYXNoZWQ7XG5cbiAgcmV0dXJuIGhhc2hlZDtcbn1cblxuZnVuY3Rpb24gaGFzaEpTT2JqKG9iaikge1xuICB2YXIgaGFzaGVkO1xuICBpZiAodXNpbmdXZWFrTWFwKSB7XG4gICAgaGFzaGVkID0gd2Vha01hcC5nZXQob2JqKTtcbiAgICBpZiAoaGFzaGVkICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIHJldHVybiBoYXNoZWQ7XG4gICAgfVxuICB9XG5cbiAgaGFzaGVkID0gb2JqW1VJRF9IQVNIX0tFWV07XG4gIGlmIChoYXNoZWQgIT09IHVuZGVmaW5lZCkge1xuICAgIHJldHVybiBoYXNoZWQ7XG4gIH1cblxuICBpZiAoIWNhbkRlZmluZVByb3BlcnR5KSB7XG4gICAgaGFzaGVkID0gb2JqLnByb3BlcnR5SXNFbnVtZXJhYmxlICYmIG9iai5wcm9wZXJ0eUlzRW51bWVyYWJsZVtVSURfSEFTSF9LRVldO1xuICAgIGlmIChoYXNoZWQgIT09IHVuZGVmaW5lZCkge1xuICAgICAgcmV0dXJuIGhhc2hlZDtcbiAgICB9XG5cbiAgICBoYXNoZWQgPSBnZXRJRU5vZGVIYXNoKG9iaik7XG4gICAgaWYgKGhhc2hlZCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICByZXR1cm4gaGFzaGVkO1xuICAgIH1cbiAgfVxuXG4gIGhhc2hlZCA9IG5leHRIYXNoKCk7XG5cbiAgaWYgKHVzaW5nV2Vha01hcCkge1xuICAgIHdlYWtNYXAuc2V0KG9iaiwgaGFzaGVkKTtcbiAgfSBlbHNlIGlmIChpc0V4dGVuc2libGUgIT09IHVuZGVmaW5lZCAmJiBpc0V4dGVuc2libGUob2JqKSA9PT0gZmFsc2UpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ05vbi1leHRlbnNpYmxlIG9iamVjdHMgYXJlIG5vdCBhbGxvd2VkIGFzIGtleXMuJyk7XG4gIH0gZWxzZSBpZiAoY2FuRGVmaW5lUHJvcGVydHkpIHtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkob2JqLCBVSURfSEFTSF9LRVksIHtcbiAgICAgIGVudW1lcmFibGU6IGZhbHNlLFxuICAgICAgY29uZmlndXJhYmxlOiBmYWxzZSxcbiAgICAgIHdyaXRhYmxlOiBmYWxzZSxcbiAgICAgIHZhbHVlOiBoYXNoZWQsXG4gICAgfSk7XG4gIH0gZWxzZSBpZiAoXG4gICAgb2JqLnByb3BlcnR5SXNFbnVtZXJhYmxlICE9PSB1bmRlZmluZWQgJiZcbiAgICBvYmoucHJvcGVydHlJc0VudW1lcmFibGUgPT09IG9iai5jb25zdHJ1Y3Rvci5wcm90b3R5cGUucHJvcGVydHlJc0VudW1lcmFibGVcbiAgKSB7XG4gICAgLy8gU2luY2Ugd2UgY2FuJ3QgZGVmaW5lIGEgbm9uLWVudW1lcmFibGUgcHJvcGVydHkgb24gdGhlIG9iamVjdFxuICAgIC8vIHdlJ2xsIGhpamFjayBvbmUgb2YgdGhlIGxlc3MtdXNlZCBub24tZW51bWVyYWJsZSBwcm9wZXJ0aWVzIHRvXG4gICAgLy8gc2F2ZSBvdXIgaGFzaCBvbiBpdC4gU2luY2UgdGhpcyBpcyBhIGZ1bmN0aW9uIGl0IHdpbGwgbm90IHNob3cgdXAgaW5cbiAgICAvLyBgSlNPTi5zdHJpbmdpZnlgIHdoaWNoIGlzIHdoYXQgd2Ugd2FudC5cbiAgICBvYmoucHJvcGVydHlJc0VudW1lcmFibGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4gdGhpcy5jb25zdHJ1Y3Rvci5wcm90b3R5cGUucHJvcGVydHlJc0VudW1lcmFibGUuYXBwbHkoXG4gICAgICAgIHRoaXMsXG4gICAgICAgIGFyZ3VtZW50c1xuICAgICAgKTtcbiAgICB9O1xuICAgIG9iai5wcm9wZXJ0eUlzRW51bWVyYWJsZVtVSURfSEFTSF9LRVldID0gaGFzaGVkO1xuICB9IGVsc2UgaWYgKG9iai5ub2RlVHlwZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgLy8gQXQgdGhpcyBwb2ludCB3ZSBjb3VsZG4ndCBnZXQgdGhlIElFIGB1bmlxdWVJRGAgdG8gdXNlIGFzIGEgaGFzaFxuICAgIC8vIGFuZCB3ZSBjb3VsZG4ndCB1c2UgYSBub24tZW51bWVyYWJsZSBwcm9wZXJ0eSB0byBleHBsb2l0IHRoZVxuICAgIC8vIGRvbnRFbnVtIGJ1ZyBzbyB3ZSBzaW1wbHkgYWRkIHRoZSBgVUlEX0hBU0hfS0VZYCBvbiB0aGUgbm9kZVxuICAgIC8vIGl0c2VsZi5cbiAgICBvYmpbVUlEX0hBU0hfS0VZXSA9IGhhc2hlZDtcbiAgfSBlbHNlIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ1VuYWJsZSB0byBzZXQgYSBub24tZW51bWVyYWJsZSBwcm9wZXJ0eSBvbiBvYmplY3QuJyk7XG4gIH1cblxuICByZXR1cm4gaGFzaGVkO1xufVxuXG4vLyBHZXQgcmVmZXJlbmNlcyB0byBFUzUgb2JqZWN0IG1ldGhvZHMuXG52YXIgaXNFeHRlbnNpYmxlID0gT2JqZWN0LmlzRXh0ZW5zaWJsZTtcblxuLy8gVHJ1ZSBpZiBPYmplY3QuZGVmaW5lUHJvcGVydHkgd29ya3MgYXMgZXhwZWN0ZWQuIElFOCBmYWlscyB0aGlzIHRlc3QuXG52YXIgY2FuRGVmaW5lUHJvcGVydHkgPSAoZnVuY3Rpb24gKCkge1xuICB0cnkge1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh7fSwgJ0AnLCB7fSk7XG4gICAgcmV0dXJuIHRydWU7XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbn0pKCk7XG5cbi8vIElFIGhhcyBhIGB1bmlxdWVJRGAgcHJvcGVydHkgb24gRE9NIG5vZGVzLiBXZSBjYW4gY29uc3RydWN0IHRoZSBoYXNoIGZyb20gaXRcbi8vIGFuZCBhdm9pZCBtZW1vcnkgbGVha3MgZnJvbSB0aGUgSUUgY2xvbmVOb2RlIGJ1Zy5cbmZ1bmN0aW9uIGdldElFTm9kZUhhc2gobm9kZSkge1xuICBpZiAobm9kZSAmJiBub2RlLm5vZGVUeXBlID4gMCkge1xuICAgIHN3aXRjaCAobm9kZS5ub2RlVHlwZSkge1xuICAgICAgY2FzZSAxOiAvLyBFbGVtZW50XG4gICAgICAgIHJldHVybiBub2RlLnVuaXF1ZUlEO1xuICAgICAgY2FzZSA5OiAvLyBEb2N1bWVudFxuICAgICAgICByZXR1cm4gbm9kZS5kb2N1bWVudEVsZW1lbnQgJiYgbm9kZS5kb2N1bWVudEVsZW1lbnQudW5pcXVlSUQ7XG4gICAgfVxuICB9XG59XG5cbmZ1bmN0aW9uIHZhbHVlT2Yob2JqKSB7XG4gIHJldHVybiBvYmoudmFsdWVPZiAhPT0gZGVmYXVsdFZhbHVlT2YgJiYgdHlwZW9mIG9iai52YWx1ZU9mID09PSAnZnVuY3Rpb24nXG4gICAgPyBvYmoudmFsdWVPZihvYmopXG4gICAgOiBvYmo7XG59XG5cbmZ1bmN0aW9uIG5leHRIYXNoKCkge1xuICB2YXIgbmV4dEhhc2ggPSArK19vYmpIYXNoVUlEO1xuICBpZiAoX29iakhhc2hVSUQgJiAweDQwMDAwMDAwKSB7XG4gICAgX29iakhhc2hVSUQgPSAwO1xuICB9XG4gIHJldHVybiBuZXh0SGFzaDtcbn1cblxuLy8gSWYgcG9zc2libGUsIHVzZSBhIFdlYWtNYXAuXG52YXIgdXNpbmdXZWFrTWFwID0gdHlwZW9mIFdlYWtNYXAgPT09ICdmdW5jdGlvbic7XG52YXIgd2Vha01hcDtcbmlmICh1c2luZ1dlYWtNYXApIHtcbiAgd2Vha01hcCA9IG5ldyBXZWFrTWFwKCk7XG59XG5cbnZhciBzeW1ib2xNYXAgPSBPYmplY3QuY3JlYXRlKG51bGwpO1xuXG52YXIgX29iakhhc2hVSUQgPSAwO1xuXG52YXIgVUlEX0hBU0hfS0VZID0gJ19faW1tdXRhYmxlaGFzaF9fJztcbmlmICh0eXBlb2YgU3ltYm9sID09PSAnZnVuY3Rpb24nKSB7XG4gIFVJRF9IQVNIX0tFWSA9IFN5bWJvbChVSURfSEFTSF9LRVkpO1xufVxuXG52YXIgU1RSSU5HX0hBU0hfQ0FDSEVfTUlOX1NUUkxFTiA9IDE2O1xudmFyIFNUUklOR19IQVNIX0NBQ0hFX01BWF9TSVpFID0gMjU1O1xudmFyIFNUUklOR19IQVNIX0NBQ0hFX1NJWkUgPSAwO1xudmFyIHN0cmluZ0hhc2hDYWNoZSA9IHt9O1xuXG52YXIgVG9LZXllZFNlcXVlbmNlID0gLypAX19QVVJFX18qLyhmdW5jdGlvbiAoS2V5ZWRTZXEpIHtcbiAgZnVuY3Rpb24gVG9LZXllZFNlcXVlbmNlKGluZGV4ZWQsIHVzZUtleXMpIHtcbiAgICB0aGlzLl9pdGVyID0gaW5kZXhlZDtcbiAgICB0aGlzLl91c2VLZXlzID0gdXNlS2V5cztcbiAgICB0aGlzLnNpemUgPSBpbmRleGVkLnNpemU7XG4gIH1cblxuICBpZiAoIEtleWVkU2VxICkgVG9LZXllZFNlcXVlbmNlLl9fcHJvdG9fXyA9IEtleWVkU2VxO1xuICBUb0tleWVkU2VxdWVuY2UucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZSggS2V5ZWRTZXEgJiYgS2V5ZWRTZXEucHJvdG90eXBlICk7XG4gIFRvS2V5ZWRTZXF1ZW5jZS5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBUb0tleWVkU2VxdWVuY2U7XG5cbiAgVG9LZXllZFNlcXVlbmNlLnByb3RvdHlwZS5nZXQgPSBmdW5jdGlvbiBnZXQgKGtleSwgbm90U2V0VmFsdWUpIHtcbiAgICByZXR1cm4gdGhpcy5faXRlci5nZXQoa2V5LCBub3RTZXRWYWx1ZSk7XG4gIH07XG5cbiAgVG9LZXllZFNlcXVlbmNlLnByb3RvdHlwZS5oYXMgPSBmdW5jdGlvbiBoYXMgKGtleSkge1xuICAgIHJldHVybiB0aGlzLl9pdGVyLmhhcyhrZXkpO1xuICB9O1xuXG4gIFRvS2V5ZWRTZXF1ZW5jZS5wcm90b3R5cGUudmFsdWVTZXEgPSBmdW5jdGlvbiB2YWx1ZVNlcSAoKSB7XG4gICAgcmV0dXJuIHRoaXMuX2l0ZXIudmFsdWVTZXEoKTtcbiAgfTtcblxuICBUb0tleWVkU2VxdWVuY2UucHJvdG90eXBlLnJldmVyc2UgPSBmdW5jdGlvbiByZXZlcnNlICgpIHtcbiAgICB2YXIgdGhpcyQxJDEgPSB0aGlzO1xuXG4gICAgdmFyIHJldmVyc2VkU2VxdWVuY2UgPSByZXZlcnNlRmFjdG9yeSh0aGlzLCB0cnVlKTtcbiAgICBpZiAoIXRoaXMuX3VzZUtleXMpIHtcbiAgICAgIHJldmVyc2VkU2VxdWVuY2UudmFsdWVTZXEgPSBmdW5jdGlvbiAoKSB7IHJldHVybiB0aGlzJDEkMS5faXRlci50b1NlcSgpLnJldmVyc2UoKTsgfTtcbiAgICB9XG4gICAgcmV0dXJuIHJldmVyc2VkU2VxdWVuY2U7XG4gIH07XG5cbiAgVG9LZXllZFNlcXVlbmNlLnByb3RvdHlwZS5tYXAgPSBmdW5jdGlvbiBtYXAgKG1hcHBlciwgY29udGV4dCkge1xuICAgIHZhciB0aGlzJDEkMSA9IHRoaXM7XG5cbiAgICB2YXIgbWFwcGVkU2VxdWVuY2UgPSBtYXBGYWN0b3J5KHRoaXMsIG1hcHBlciwgY29udGV4dCk7XG4gICAgaWYgKCF0aGlzLl91c2VLZXlzKSB7XG4gICAgICBtYXBwZWRTZXF1ZW5jZS52YWx1ZVNlcSA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuIHRoaXMkMSQxLl9pdGVyLnRvU2VxKCkubWFwKG1hcHBlciwgY29udGV4dCk7IH07XG4gICAgfVxuICAgIHJldHVybiBtYXBwZWRTZXF1ZW5jZTtcbiAgfTtcblxuICBUb0tleWVkU2VxdWVuY2UucHJvdG90eXBlLl9faXRlcmF0ZSA9IGZ1bmN0aW9uIF9faXRlcmF0ZSAoZm4sIHJldmVyc2UpIHtcbiAgICB2YXIgdGhpcyQxJDEgPSB0aGlzO1xuXG4gICAgcmV0dXJuIHRoaXMuX2l0ZXIuX19pdGVyYXRlKGZ1bmN0aW9uICh2LCBrKSB7IHJldHVybiBmbih2LCBrLCB0aGlzJDEkMSk7IH0sIHJldmVyc2UpO1xuICB9O1xuXG4gIFRvS2V5ZWRTZXF1ZW5jZS5wcm90b3R5cGUuX19pdGVyYXRvciA9IGZ1bmN0aW9uIF9faXRlcmF0b3IgKHR5cGUsIHJldmVyc2UpIHtcbiAgICByZXR1cm4gdGhpcy5faXRlci5fX2l0ZXJhdG9yKHR5cGUsIHJldmVyc2UpO1xuICB9O1xuXG4gIHJldHVybiBUb0tleWVkU2VxdWVuY2U7XG59KEtleWVkU2VxKSk7XG5Ub0tleWVkU2VxdWVuY2UucHJvdG90eXBlW0lTX09SREVSRURfU1lNQk9MXSA9IHRydWU7XG5cbnZhciBUb0luZGV4ZWRTZXF1ZW5jZSA9IC8qQF9fUFVSRV9fKi8oZnVuY3Rpb24gKEluZGV4ZWRTZXEpIHtcbiAgZnVuY3Rpb24gVG9JbmRleGVkU2VxdWVuY2UoaXRlcikge1xuICAgIHRoaXMuX2l0ZXIgPSBpdGVyO1xuICAgIHRoaXMuc2l6ZSA9IGl0ZXIuc2l6ZTtcbiAgfVxuXG4gIGlmICggSW5kZXhlZFNlcSApIFRvSW5kZXhlZFNlcXVlbmNlLl9fcHJvdG9fXyA9IEluZGV4ZWRTZXE7XG4gIFRvSW5kZXhlZFNlcXVlbmNlLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoIEluZGV4ZWRTZXEgJiYgSW5kZXhlZFNlcS5wcm90b3R5cGUgKTtcbiAgVG9JbmRleGVkU2VxdWVuY2UucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gVG9JbmRleGVkU2VxdWVuY2U7XG5cbiAgVG9JbmRleGVkU2VxdWVuY2UucHJvdG90eXBlLmluY2x1ZGVzID0gZnVuY3Rpb24gaW5jbHVkZXMgKHZhbHVlKSB7XG4gICAgcmV0dXJuIHRoaXMuX2l0ZXIuaW5jbHVkZXModmFsdWUpO1xuICB9O1xuXG4gIFRvSW5kZXhlZFNlcXVlbmNlLnByb3RvdHlwZS5fX2l0ZXJhdGUgPSBmdW5jdGlvbiBfX2l0ZXJhdGUgKGZuLCByZXZlcnNlKSB7XG4gICAgdmFyIHRoaXMkMSQxID0gdGhpcztcblxuICAgIHZhciBpID0gMDtcbiAgICByZXZlcnNlICYmIGVuc3VyZVNpemUodGhpcyk7XG4gICAgcmV0dXJuIHRoaXMuX2l0ZXIuX19pdGVyYXRlKFxuICAgICAgZnVuY3Rpb24gKHYpIHsgcmV0dXJuIGZuKHYsIHJldmVyc2UgPyB0aGlzJDEkMS5zaXplIC0gKytpIDogaSsrLCB0aGlzJDEkMSk7IH0sXG4gICAgICByZXZlcnNlXG4gICAgKTtcbiAgfTtcblxuICBUb0luZGV4ZWRTZXF1ZW5jZS5wcm90b3R5cGUuX19pdGVyYXRvciA9IGZ1bmN0aW9uIF9faXRlcmF0b3IgKHR5cGUsIHJldmVyc2UpIHtcbiAgICB2YXIgdGhpcyQxJDEgPSB0aGlzO1xuXG4gICAgdmFyIGl0ZXJhdG9yID0gdGhpcy5faXRlci5fX2l0ZXJhdG9yKElURVJBVEVfVkFMVUVTLCByZXZlcnNlKTtcbiAgICB2YXIgaSA9IDA7XG4gICAgcmV2ZXJzZSAmJiBlbnN1cmVTaXplKHRoaXMpO1xuICAgIHJldHVybiBuZXcgSXRlcmF0b3IoZnVuY3Rpb24gKCkge1xuICAgICAgdmFyIHN0ZXAgPSBpdGVyYXRvci5uZXh0KCk7XG4gICAgICByZXR1cm4gc3RlcC5kb25lXG4gICAgICAgID8gc3RlcFxuICAgICAgICA6IGl0ZXJhdG9yVmFsdWUoXG4gICAgICAgICAgICB0eXBlLFxuICAgICAgICAgICAgcmV2ZXJzZSA/IHRoaXMkMSQxLnNpemUgLSArK2kgOiBpKyssXG4gICAgICAgICAgICBzdGVwLnZhbHVlLFxuICAgICAgICAgICAgc3RlcFxuICAgICAgICAgICk7XG4gICAgfSk7XG4gIH07XG5cbiAgcmV0dXJuIFRvSW5kZXhlZFNlcXVlbmNlO1xufShJbmRleGVkU2VxKSk7XG5cbnZhciBUb1NldFNlcXVlbmNlID0gLypAX19QVVJFX18qLyhmdW5jdGlvbiAoU2V0U2VxKSB7XG4gIGZ1bmN0aW9uIFRvU2V0U2VxdWVuY2UoaXRlcikge1xuICAgIHRoaXMuX2l0ZXIgPSBpdGVyO1xuICAgIHRoaXMuc2l6ZSA9IGl0ZXIuc2l6ZTtcbiAgfVxuXG4gIGlmICggU2V0U2VxICkgVG9TZXRTZXF1ZW5jZS5fX3Byb3RvX18gPSBTZXRTZXE7XG4gIFRvU2V0U2VxdWVuY2UucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZSggU2V0U2VxICYmIFNldFNlcS5wcm90b3R5cGUgKTtcbiAgVG9TZXRTZXF1ZW5jZS5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBUb1NldFNlcXVlbmNlO1xuXG4gIFRvU2V0U2VxdWVuY2UucHJvdG90eXBlLmhhcyA9IGZ1bmN0aW9uIGhhcyAoa2V5KSB7XG4gICAgcmV0dXJuIHRoaXMuX2l0ZXIuaW5jbHVkZXMoa2V5KTtcbiAgfTtcblxuICBUb1NldFNlcXVlbmNlLnByb3RvdHlwZS5fX2l0ZXJhdGUgPSBmdW5jdGlvbiBfX2l0ZXJhdGUgKGZuLCByZXZlcnNlKSB7XG4gICAgdmFyIHRoaXMkMSQxID0gdGhpcztcblxuICAgIHJldHVybiB0aGlzLl9pdGVyLl9faXRlcmF0ZShmdW5jdGlvbiAodikgeyByZXR1cm4gZm4odiwgdiwgdGhpcyQxJDEpOyB9LCByZXZlcnNlKTtcbiAgfTtcblxuICBUb1NldFNlcXVlbmNlLnByb3RvdHlwZS5fX2l0ZXJhdG9yID0gZnVuY3Rpb24gX19pdGVyYXRvciAodHlwZSwgcmV2ZXJzZSkge1xuICAgIHZhciBpdGVyYXRvciA9IHRoaXMuX2l0ZXIuX19pdGVyYXRvcihJVEVSQVRFX1ZBTFVFUywgcmV2ZXJzZSk7XG4gICAgcmV0dXJuIG5ldyBJdGVyYXRvcihmdW5jdGlvbiAoKSB7XG4gICAgICB2YXIgc3RlcCA9IGl0ZXJhdG9yLm5leHQoKTtcbiAgICAgIHJldHVybiBzdGVwLmRvbmVcbiAgICAgICAgPyBzdGVwXG4gICAgICAgIDogaXRlcmF0b3JWYWx1ZSh0eXBlLCBzdGVwLnZhbHVlLCBzdGVwLnZhbHVlLCBzdGVwKTtcbiAgICB9KTtcbiAgfTtcblxuICByZXR1cm4gVG9TZXRTZXF1ZW5jZTtcbn0oU2V0U2VxKSk7XG5cbnZhciBGcm9tRW50cmllc1NlcXVlbmNlID0gLypAX19QVVJFX18qLyhmdW5jdGlvbiAoS2V5ZWRTZXEpIHtcbiAgZnVuY3Rpb24gRnJvbUVudHJpZXNTZXF1ZW5jZShlbnRyaWVzKSB7XG4gICAgdGhpcy5faXRlciA9IGVudHJpZXM7XG4gICAgdGhpcy5zaXplID0gZW50cmllcy5zaXplO1xuICB9XG5cbiAgaWYgKCBLZXllZFNlcSApIEZyb21FbnRyaWVzU2VxdWVuY2UuX19wcm90b19fID0gS2V5ZWRTZXE7XG4gIEZyb21FbnRyaWVzU2VxdWVuY2UucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZSggS2V5ZWRTZXEgJiYgS2V5ZWRTZXEucHJvdG90eXBlICk7XG4gIEZyb21FbnRyaWVzU2VxdWVuY2UucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gRnJvbUVudHJpZXNTZXF1ZW5jZTtcblxuICBGcm9tRW50cmllc1NlcXVlbmNlLnByb3RvdHlwZS5lbnRyeVNlcSA9IGZ1bmN0aW9uIGVudHJ5U2VxICgpIHtcbiAgICByZXR1cm4gdGhpcy5faXRlci50b1NlcSgpO1xuICB9O1xuXG4gIEZyb21FbnRyaWVzU2VxdWVuY2UucHJvdG90eXBlLl9faXRlcmF0ZSA9IGZ1bmN0aW9uIF9faXRlcmF0ZSAoZm4sIHJldmVyc2UpIHtcbiAgICB2YXIgdGhpcyQxJDEgPSB0aGlzO1xuXG4gICAgcmV0dXJuIHRoaXMuX2l0ZXIuX19pdGVyYXRlKGZ1bmN0aW9uIChlbnRyeSkge1xuICAgICAgLy8gQ2hlY2sgaWYgZW50cnkgZXhpc3RzIGZpcnN0IHNvIGFycmF5IGFjY2VzcyBkb2Vzbid0IHRocm93IGZvciBob2xlc1xuICAgICAgLy8gaW4gdGhlIHBhcmVudCBpdGVyYXRpb24uXG4gICAgICBpZiAoZW50cnkpIHtcbiAgICAgICAgdmFsaWRhdGVFbnRyeShlbnRyeSk7XG4gICAgICAgIHZhciBpbmRleGVkQ29sbGVjdGlvbiA9IGlzQ29sbGVjdGlvbihlbnRyeSk7XG4gICAgICAgIHJldHVybiBmbihcbiAgICAgICAgICBpbmRleGVkQ29sbGVjdGlvbiA/IGVudHJ5LmdldCgxKSA6IGVudHJ5WzFdLFxuICAgICAgICAgIGluZGV4ZWRDb2xsZWN0aW9uID8gZW50cnkuZ2V0KDApIDogZW50cnlbMF0sXG4gICAgICAgICAgdGhpcyQxJDFcbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICB9LCByZXZlcnNlKTtcbiAgfTtcblxuICBGcm9tRW50cmllc1NlcXVlbmNlLnByb3RvdHlwZS5fX2l0ZXJhdG9yID0gZnVuY3Rpb24gX19pdGVyYXRvciAodHlwZSwgcmV2ZXJzZSkge1xuICAgIHZhciBpdGVyYXRvciA9IHRoaXMuX2l0ZXIuX19pdGVyYXRvcihJVEVSQVRFX1ZBTFVFUywgcmV2ZXJzZSk7XG4gICAgcmV0dXJuIG5ldyBJdGVyYXRvcihmdW5jdGlvbiAoKSB7XG4gICAgICB3aGlsZSAodHJ1ZSkge1xuICAgICAgICB2YXIgc3RlcCA9IGl0ZXJhdG9yLm5leHQoKTtcbiAgICAgICAgaWYgKHN0ZXAuZG9uZSkge1xuICAgICAgICAgIHJldHVybiBzdGVwO1xuICAgICAgICB9XG4gICAgICAgIHZhciBlbnRyeSA9IHN0ZXAudmFsdWU7XG4gICAgICAgIC8vIENoZWNrIGlmIGVudHJ5IGV4aXN0cyBmaXJzdCBzbyBhcnJheSBhY2Nlc3MgZG9lc24ndCB0aHJvdyBmb3IgaG9sZXNcbiAgICAgICAgLy8gaW4gdGhlIHBhcmVudCBpdGVyYXRpb24uXG4gICAgICAgIGlmIChlbnRyeSkge1xuICAgICAgICAgIHZhbGlkYXRlRW50cnkoZW50cnkpO1xuICAgICAgICAgIHZhciBpbmRleGVkQ29sbGVjdGlvbiA9IGlzQ29sbGVjdGlvbihlbnRyeSk7XG4gICAgICAgICAgcmV0dXJuIGl0ZXJhdG9yVmFsdWUoXG4gICAgICAgICAgICB0eXBlLFxuICAgICAgICAgICAgaW5kZXhlZENvbGxlY3Rpb24gPyBlbnRyeS5nZXQoMCkgOiBlbnRyeVswXSxcbiAgICAgICAgICAgIGluZGV4ZWRDb2xsZWN0aW9uID8gZW50cnkuZ2V0KDEpIDogZW50cnlbMV0sXG4gICAgICAgICAgICBzdGVwXG4gICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pO1xuICB9O1xuXG4gIHJldHVybiBGcm9tRW50cmllc1NlcXVlbmNlO1xufShLZXllZFNlcSkpO1xuXG5Ub0luZGV4ZWRTZXF1ZW5jZS5wcm90b3R5cGUuY2FjaGVSZXN1bHQgPVxuICBUb0tleWVkU2VxdWVuY2UucHJvdG90eXBlLmNhY2hlUmVzdWx0ID1cbiAgVG9TZXRTZXF1ZW5jZS5wcm90b3R5cGUuY2FjaGVSZXN1bHQgPVxuICBGcm9tRW50cmllc1NlcXVlbmNlLnByb3RvdHlwZS5jYWNoZVJlc3VsdCA9XG4gICAgY2FjaGVSZXN1bHRUaHJvdWdoO1xuXG5mdW5jdGlvbiBmbGlwRmFjdG9yeShjb2xsZWN0aW9uKSB7XG4gIHZhciBmbGlwU2VxdWVuY2UgPSBtYWtlU2VxdWVuY2UoY29sbGVjdGlvbik7XG4gIGZsaXBTZXF1ZW5jZS5faXRlciA9IGNvbGxlY3Rpb247XG4gIGZsaXBTZXF1ZW5jZS5zaXplID0gY29sbGVjdGlvbi5zaXplO1xuICBmbGlwU2VxdWVuY2UuZmxpcCA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuIGNvbGxlY3Rpb247IH07XG4gIGZsaXBTZXF1ZW5jZS5yZXZlcnNlID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciByZXZlcnNlZFNlcXVlbmNlID0gY29sbGVjdGlvbi5yZXZlcnNlLmFwcGx5KHRoaXMpOyAvLyBzdXBlci5yZXZlcnNlKClcbiAgICByZXZlcnNlZFNlcXVlbmNlLmZsaXAgPSBmdW5jdGlvbiAoKSB7IHJldHVybiBjb2xsZWN0aW9uLnJldmVyc2UoKTsgfTtcbiAgICByZXR1cm4gcmV2ZXJzZWRTZXF1ZW5jZTtcbiAgfTtcbiAgZmxpcFNlcXVlbmNlLmhhcyA9IGZ1bmN0aW9uIChrZXkpIHsgcmV0dXJuIGNvbGxlY3Rpb24uaW5jbHVkZXMoa2V5KTsgfTtcbiAgZmxpcFNlcXVlbmNlLmluY2x1ZGVzID0gZnVuY3Rpb24gKGtleSkgeyByZXR1cm4gY29sbGVjdGlvbi5oYXMoa2V5KTsgfTtcbiAgZmxpcFNlcXVlbmNlLmNhY2hlUmVzdWx0ID0gY2FjaGVSZXN1bHRUaHJvdWdoO1xuICBmbGlwU2VxdWVuY2UuX19pdGVyYXRlVW5jYWNoZWQgPSBmdW5jdGlvbiAoZm4sIHJldmVyc2UpIHtcbiAgICB2YXIgdGhpcyQxJDEgPSB0aGlzO1xuXG4gICAgcmV0dXJuIGNvbGxlY3Rpb24uX19pdGVyYXRlKGZ1bmN0aW9uICh2LCBrKSB7IHJldHVybiBmbihrLCB2LCB0aGlzJDEkMSkgIT09IGZhbHNlOyB9LCByZXZlcnNlKTtcbiAgfTtcbiAgZmxpcFNlcXVlbmNlLl9faXRlcmF0b3JVbmNhY2hlZCA9IGZ1bmN0aW9uICh0eXBlLCByZXZlcnNlKSB7XG4gICAgaWYgKHR5cGUgPT09IElURVJBVEVfRU5UUklFUykge1xuICAgICAgdmFyIGl0ZXJhdG9yID0gY29sbGVjdGlvbi5fX2l0ZXJhdG9yKHR5cGUsIHJldmVyc2UpO1xuICAgICAgcmV0dXJuIG5ldyBJdGVyYXRvcihmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBzdGVwID0gaXRlcmF0b3IubmV4dCgpO1xuICAgICAgICBpZiAoIXN0ZXAuZG9uZSkge1xuICAgICAgICAgIHZhciBrID0gc3RlcC52YWx1ZVswXTtcbiAgICAgICAgICBzdGVwLnZhbHVlWzBdID0gc3RlcC52YWx1ZVsxXTtcbiAgICAgICAgICBzdGVwLnZhbHVlWzFdID0gaztcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gc3RlcDtcbiAgICAgIH0pO1xuICAgIH1cbiAgICByZXR1cm4gY29sbGVjdGlvbi5fX2l0ZXJhdG9yKFxuICAgICAgdHlwZSA9PT0gSVRFUkFURV9WQUxVRVMgPyBJVEVSQVRFX0tFWVMgOiBJVEVSQVRFX1ZBTFVFUyxcbiAgICAgIHJldmVyc2VcbiAgICApO1xuICB9O1xuICByZXR1cm4gZmxpcFNlcXVlbmNlO1xufVxuXG5mdW5jdGlvbiBtYXBGYWN0b3J5KGNvbGxlY3Rpb24sIG1hcHBlciwgY29udGV4dCkge1xuICB2YXIgbWFwcGVkU2VxdWVuY2UgPSBtYWtlU2VxdWVuY2UoY29sbGVjdGlvbik7XG4gIG1hcHBlZFNlcXVlbmNlLnNpemUgPSBjb2xsZWN0aW9uLnNpemU7XG4gIG1hcHBlZFNlcXVlbmNlLmhhcyA9IGZ1bmN0aW9uIChrZXkpIHsgcmV0dXJuIGNvbGxlY3Rpb24uaGFzKGtleSk7IH07XG4gIG1hcHBlZFNlcXVlbmNlLmdldCA9IGZ1bmN0aW9uIChrZXksIG5vdFNldFZhbHVlKSB7XG4gICAgdmFyIHYgPSBjb2xsZWN0aW9uLmdldChrZXksIE5PVF9TRVQpO1xuICAgIHJldHVybiB2ID09PSBOT1RfU0VUXG4gICAgICA/IG5vdFNldFZhbHVlXG4gICAgICA6IG1hcHBlci5jYWxsKGNvbnRleHQsIHYsIGtleSwgY29sbGVjdGlvbik7XG4gIH07XG4gIG1hcHBlZFNlcXVlbmNlLl9faXRlcmF0ZVVuY2FjaGVkID0gZnVuY3Rpb24gKGZuLCByZXZlcnNlKSB7XG4gICAgdmFyIHRoaXMkMSQxID0gdGhpcztcblxuICAgIHJldHVybiBjb2xsZWN0aW9uLl9faXRlcmF0ZShcbiAgICAgIGZ1bmN0aW9uICh2LCBrLCBjKSB7IHJldHVybiBmbihtYXBwZXIuY2FsbChjb250ZXh0LCB2LCBrLCBjKSwgaywgdGhpcyQxJDEpICE9PSBmYWxzZTsgfSxcbiAgICAgIHJldmVyc2VcbiAgICApO1xuICB9O1xuICBtYXBwZWRTZXF1ZW5jZS5fX2l0ZXJhdG9yVW5jYWNoZWQgPSBmdW5jdGlvbiAodHlwZSwgcmV2ZXJzZSkge1xuICAgIHZhciBpdGVyYXRvciA9IGNvbGxlY3Rpb24uX19pdGVyYXRvcihJVEVSQVRFX0VOVFJJRVMsIHJldmVyc2UpO1xuICAgIHJldHVybiBuZXcgSXRlcmF0b3IoZnVuY3Rpb24gKCkge1xuICAgICAgdmFyIHN0ZXAgPSBpdGVyYXRvci5uZXh0KCk7XG4gICAgICBpZiAoc3RlcC5kb25lKSB7XG4gICAgICAgIHJldHVybiBzdGVwO1xuICAgICAgfVxuICAgICAgdmFyIGVudHJ5ID0gc3RlcC52YWx1ZTtcbiAgICAgIHZhciBrZXkgPSBlbnRyeVswXTtcbiAgICAgIHJldHVybiBpdGVyYXRvclZhbHVlKFxuICAgICAgICB0eXBlLFxuICAgICAgICBrZXksXG4gICAgICAgIG1hcHBlci5jYWxsKGNvbnRleHQsIGVudHJ5WzFdLCBrZXksIGNvbGxlY3Rpb24pLFxuICAgICAgICBzdGVwXG4gICAgICApO1xuICAgIH0pO1xuICB9O1xuICByZXR1cm4gbWFwcGVkU2VxdWVuY2U7XG59XG5cbmZ1bmN0aW9uIHJldmVyc2VGYWN0b3J5KGNvbGxlY3Rpb24sIHVzZUtleXMpIHtcbiAgdmFyIHRoaXMkMSQxID0gdGhpcztcblxuICB2YXIgcmV2ZXJzZWRTZXF1ZW5jZSA9IG1ha2VTZXF1ZW5jZShjb2xsZWN0aW9uKTtcbiAgcmV2ZXJzZWRTZXF1ZW5jZS5faXRlciA9IGNvbGxlY3Rpb247XG4gIHJldmVyc2VkU2VxdWVuY2Uuc2l6ZSA9IGNvbGxlY3Rpb24uc2l6ZTtcbiAgcmV2ZXJzZWRTZXF1ZW5jZS5yZXZlcnNlID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gY29sbGVjdGlvbjsgfTtcbiAgaWYgKGNvbGxlY3Rpb24uZmxpcCkge1xuICAgIHJldmVyc2VkU2VxdWVuY2UuZmxpcCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciBmbGlwU2VxdWVuY2UgPSBmbGlwRmFjdG9yeShjb2xsZWN0aW9uKTtcbiAgICAgIGZsaXBTZXF1ZW5jZS5yZXZlcnNlID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gY29sbGVjdGlvbi5mbGlwKCk7IH07XG4gICAgICByZXR1cm4gZmxpcFNlcXVlbmNlO1xuICAgIH07XG4gIH1cbiAgcmV2ZXJzZWRTZXF1ZW5jZS5nZXQgPSBmdW5jdGlvbiAoa2V5LCBub3RTZXRWYWx1ZSkgeyByZXR1cm4gY29sbGVjdGlvbi5nZXQodXNlS2V5cyA/IGtleSA6IC0xIC0ga2V5LCBub3RTZXRWYWx1ZSk7IH07XG4gIHJldmVyc2VkU2VxdWVuY2UuaGFzID0gZnVuY3Rpb24gKGtleSkgeyByZXR1cm4gY29sbGVjdGlvbi5oYXModXNlS2V5cyA/IGtleSA6IC0xIC0ga2V5KTsgfTtcbiAgcmV2ZXJzZWRTZXF1ZW5jZS5pbmNsdWRlcyA9IGZ1bmN0aW9uICh2YWx1ZSkgeyByZXR1cm4gY29sbGVjdGlvbi5pbmNsdWRlcyh2YWx1ZSk7IH07XG4gIHJldmVyc2VkU2VxdWVuY2UuY2FjaGVSZXN1bHQgPSBjYWNoZVJlc3VsdFRocm91Z2g7XG4gIHJldmVyc2VkU2VxdWVuY2UuX19pdGVyYXRlID0gZnVuY3Rpb24gKGZuLCByZXZlcnNlKSB7XG4gICAgdmFyIHRoaXMkMSQxID0gdGhpcztcblxuICAgIHZhciBpID0gMDtcbiAgICByZXZlcnNlICYmIGVuc3VyZVNpemUoY29sbGVjdGlvbik7XG4gICAgcmV0dXJuIGNvbGxlY3Rpb24uX19pdGVyYXRlKFxuICAgICAgZnVuY3Rpb24gKHYsIGspIHsgcmV0dXJuIGZuKHYsIHVzZUtleXMgPyBrIDogcmV2ZXJzZSA/IHRoaXMkMSQxLnNpemUgLSArK2kgOiBpKyssIHRoaXMkMSQxKTsgfSxcbiAgICAgICFyZXZlcnNlXG4gICAgKTtcbiAgfTtcbiAgcmV2ZXJzZWRTZXF1ZW5jZS5fX2l0ZXJhdG9yID0gZnVuY3Rpb24gKHR5cGUsIHJldmVyc2UpIHtcbiAgICB2YXIgaSA9IDA7XG4gICAgcmV2ZXJzZSAmJiBlbnN1cmVTaXplKGNvbGxlY3Rpb24pO1xuICAgIHZhciBpdGVyYXRvciA9IGNvbGxlY3Rpb24uX19pdGVyYXRvcihJVEVSQVRFX0VOVFJJRVMsICFyZXZlcnNlKTtcbiAgICByZXR1cm4gbmV3IEl0ZXJhdG9yKGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciBzdGVwID0gaXRlcmF0b3IubmV4dCgpO1xuICAgICAgaWYgKHN0ZXAuZG9uZSkge1xuICAgICAgICByZXR1cm4gc3RlcDtcbiAgICAgIH1cbiAgICAgIHZhciBlbnRyeSA9IHN0ZXAudmFsdWU7XG4gICAgICByZXR1cm4gaXRlcmF0b3JWYWx1ZShcbiAgICAgICAgdHlwZSxcbiAgICAgICAgdXNlS2V5cyA/IGVudHJ5WzBdIDogcmV2ZXJzZSA/IHRoaXMkMSQxLnNpemUgLSArK2kgOiBpKyssXG4gICAgICAgIGVudHJ5WzFdLFxuICAgICAgICBzdGVwXG4gICAgICApO1xuICAgIH0pO1xuICB9O1xuICByZXR1cm4gcmV2ZXJzZWRTZXF1ZW5jZTtcbn1cblxuZnVuY3Rpb24gZmlsdGVyRmFjdG9yeShjb2xsZWN0aW9uLCBwcmVkaWNhdGUsIGNvbnRleHQsIHVzZUtleXMpIHtcbiAgdmFyIGZpbHRlclNlcXVlbmNlID0gbWFrZVNlcXVlbmNlKGNvbGxlY3Rpb24pO1xuICBpZiAodXNlS2V5cykge1xuICAgIGZpbHRlclNlcXVlbmNlLmhhcyA9IGZ1bmN0aW9uIChrZXkpIHtcbiAgICAgIHZhciB2ID0gY29sbGVjdGlvbi5nZXQoa2V5LCBOT1RfU0VUKTtcbiAgICAgIHJldHVybiB2ICE9PSBOT1RfU0VUICYmICEhcHJlZGljYXRlLmNhbGwoY29udGV4dCwgdiwga2V5LCBjb2xsZWN0aW9uKTtcbiAgICB9O1xuICAgIGZpbHRlclNlcXVlbmNlLmdldCA9IGZ1bmN0aW9uIChrZXksIG5vdFNldFZhbHVlKSB7XG4gICAgICB2YXIgdiA9IGNvbGxlY3Rpb24uZ2V0KGtleSwgTk9UX1NFVCk7XG4gICAgICByZXR1cm4gdiAhPT0gTk9UX1NFVCAmJiBwcmVkaWNhdGUuY2FsbChjb250ZXh0LCB2LCBrZXksIGNvbGxlY3Rpb24pXG4gICAgICAgID8gdlxuICAgICAgICA6IG5vdFNldFZhbHVlO1xuICAgIH07XG4gIH1cbiAgZmlsdGVyU2VxdWVuY2UuX19pdGVyYXRlVW5jYWNoZWQgPSBmdW5jdGlvbiAoZm4sIHJldmVyc2UpIHtcbiAgICB2YXIgdGhpcyQxJDEgPSB0aGlzO1xuXG4gICAgdmFyIGl0ZXJhdGlvbnMgPSAwO1xuICAgIGNvbGxlY3Rpb24uX19pdGVyYXRlKGZ1bmN0aW9uICh2LCBrLCBjKSB7XG4gICAgICBpZiAocHJlZGljYXRlLmNhbGwoY29udGV4dCwgdiwgaywgYykpIHtcbiAgICAgICAgaXRlcmF0aW9ucysrO1xuICAgICAgICByZXR1cm4gZm4odiwgdXNlS2V5cyA/IGsgOiBpdGVyYXRpb25zIC0gMSwgdGhpcyQxJDEpO1xuICAgICAgfVxuICAgIH0sIHJldmVyc2UpO1xuICAgIHJldHVybiBpdGVyYXRpb25zO1xuICB9O1xuICBmaWx0ZXJTZXF1ZW5jZS5fX2l0ZXJhdG9yVW5jYWNoZWQgPSBmdW5jdGlvbiAodHlwZSwgcmV2ZXJzZSkge1xuICAgIHZhciBpdGVyYXRvciA9IGNvbGxlY3Rpb24uX19pdGVyYXRvcihJVEVSQVRFX0VOVFJJRVMsIHJldmVyc2UpO1xuICAgIHZhciBpdGVyYXRpb25zID0gMDtcbiAgICByZXR1cm4gbmV3IEl0ZXJhdG9yKGZ1bmN0aW9uICgpIHtcbiAgICAgIHdoaWxlICh0cnVlKSB7XG4gICAgICAgIHZhciBzdGVwID0gaXRlcmF0b3IubmV4dCgpO1xuICAgICAgICBpZiAoc3RlcC5kb25lKSB7XG4gICAgICAgICAgcmV0dXJuIHN0ZXA7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIGVudHJ5ID0gc3RlcC52YWx1ZTtcbiAgICAgICAgdmFyIGtleSA9IGVudHJ5WzBdO1xuICAgICAgICB2YXIgdmFsdWUgPSBlbnRyeVsxXTtcbiAgICAgICAgaWYgKHByZWRpY2F0ZS5jYWxsKGNvbnRleHQsIHZhbHVlLCBrZXksIGNvbGxlY3Rpb24pKSB7XG4gICAgICAgICAgcmV0dXJuIGl0ZXJhdG9yVmFsdWUodHlwZSwgdXNlS2V5cyA/IGtleSA6IGl0ZXJhdGlvbnMrKywgdmFsdWUsIHN0ZXApO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSk7XG4gIH07XG4gIHJldHVybiBmaWx0ZXJTZXF1ZW5jZTtcbn1cblxuZnVuY3Rpb24gY291bnRCeUZhY3RvcnkoY29sbGVjdGlvbiwgZ3JvdXBlciwgY29udGV4dCkge1xuICB2YXIgZ3JvdXBzID0gTWFwKCkuYXNNdXRhYmxlKCk7XG4gIGNvbGxlY3Rpb24uX19pdGVyYXRlKGZ1bmN0aW9uICh2LCBrKSB7XG4gICAgZ3JvdXBzLnVwZGF0ZShncm91cGVyLmNhbGwoY29udGV4dCwgdiwgaywgY29sbGVjdGlvbiksIDAsIGZ1bmN0aW9uIChhKSB7IHJldHVybiBhICsgMTsgfSk7XG4gIH0pO1xuICByZXR1cm4gZ3JvdXBzLmFzSW1tdXRhYmxlKCk7XG59XG5cbmZ1bmN0aW9uIGdyb3VwQnlGYWN0b3J5KGNvbGxlY3Rpb24sIGdyb3VwZXIsIGNvbnRleHQpIHtcbiAgdmFyIGlzS2V5ZWRJdGVyID0gaXNLZXllZChjb2xsZWN0aW9uKTtcbiAgdmFyIGdyb3VwcyA9IChpc09yZGVyZWQoY29sbGVjdGlvbikgPyBPcmRlcmVkTWFwKCkgOiBNYXAoKSkuYXNNdXRhYmxlKCk7XG4gIGNvbGxlY3Rpb24uX19pdGVyYXRlKGZ1bmN0aW9uICh2LCBrKSB7XG4gICAgZ3JvdXBzLnVwZGF0ZShcbiAgICAgIGdyb3VwZXIuY2FsbChjb250ZXh0LCB2LCBrLCBjb2xsZWN0aW9uKSxcbiAgICAgIGZ1bmN0aW9uIChhKSB7IHJldHVybiAoKGEgPSBhIHx8IFtdKSwgYS5wdXNoKGlzS2V5ZWRJdGVyID8gW2ssIHZdIDogdiksIGEpOyB9XG4gICAgKTtcbiAgfSk7XG4gIHZhciBjb2VyY2UgPSBjb2xsZWN0aW9uQ2xhc3MoY29sbGVjdGlvbik7XG4gIHJldHVybiBncm91cHMubWFwKGZ1bmN0aW9uIChhcnIpIHsgcmV0dXJuIHJlaWZ5KGNvbGxlY3Rpb24sIGNvZXJjZShhcnIpKTsgfSkuYXNJbW11dGFibGUoKTtcbn1cblxuZnVuY3Rpb24gc2xpY2VGYWN0b3J5KGNvbGxlY3Rpb24sIGJlZ2luLCBlbmQsIHVzZUtleXMpIHtcbiAgdmFyIG9yaWdpbmFsU2l6ZSA9IGNvbGxlY3Rpb24uc2l6ZTtcblxuICBpZiAod2hvbGVTbGljZShiZWdpbiwgZW5kLCBvcmlnaW5hbFNpemUpKSB7XG4gICAgcmV0dXJuIGNvbGxlY3Rpb247XG4gIH1cblxuICB2YXIgcmVzb2x2ZWRCZWdpbiA9IHJlc29sdmVCZWdpbihiZWdpbiwgb3JpZ2luYWxTaXplKTtcbiAgdmFyIHJlc29sdmVkRW5kID0gcmVzb2x2ZUVuZChlbmQsIG9yaWdpbmFsU2l6ZSk7XG5cbiAgLy8gYmVnaW4gb3IgZW5kIHdpbGwgYmUgTmFOIGlmIHRoZXkgd2VyZSBwcm92aWRlZCBhcyBuZWdhdGl2ZSBudW1iZXJzIGFuZFxuICAvLyB0aGlzIGNvbGxlY3Rpb24ncyBzaXplIGlzIHVua25vd24uIEluIHRoYXQgY2FzZSwgY2FjaGUgZmlyc3Qgc28gdGhlcmUgaXNcbiAgLy8gYSBrbm93biBzaXplIGFuZCB0aGVzZSBkbyBub3QgcmVzb2x2ZSB0byBOYU4uXG4gIGlmIChyZXNvbHZlZEJlZ2luICE9PSByZXNvbHZlZEJlZ2luIHx8IHJlc29sdmVkRW5kICE9PSByZXNvbHZlZEVuZCkge1xuICAgIHJldHVybiBzbGljZUZhY3RvcnkoY29sbGVjdGlvbi50b1NlcSgpLmNhY2hlUmVzdWx0KCksIGJlZ2luLCBlbmQsIHVzZUtleXMpO1xuICB9XG5cbiAgLy8gTm90ZTogcmVzb2x2ZWRFbmQgaXMgdW5kZWZpbmVkIHdoZW4gdGhlIG9yaWdpbmFsIHNlcXVlbmNlJ3MgbGVuZ3RoIGlzXG4gIC8vIHVua25vd24gYW5kIHRoaXMgc2xpY2UgZGlkIG5vdCBzdXBwbHkgYW4gZW5kIGFuZCBzaG91bGQgY29udGFpbiBhbGxcbiAgLy8gZWxlbWVudHMgYWZ0ZXIgcmVzb2x2ZWRCZWdpbi5cbiAgLy8gSW4gdGhhdCBjYXNlLCByZXNvbHZlZFNpemUgd2lsbCBiZSBOYU4gYW5kIHNsaWNlU2l6ZSB3aWxsIHJlbWFpbiB1bmRlZmluZWQuXG4gIHZhciByZXNvbHZlZFNpemUgPSByZXNvbHZlZEVuZCAtIHJlc29sdmVkQmVnaW47XG4gIHZhciBzbGljZVNpemU7XG4gIGlmIChyZXNvbHZlZFNpemUgPT09IHJlc29sdmVkU2l6ZSkge1xuICAgIHNsaWNlU2l6ZSA9IHJlc29sdmVkU2l6ZSA8IDAgPyAwIDogcmVzb2x2ZWRTaXplO1xuICB9XG5cbiAgdmFyIHNsaWNlU2VxID0gbWFrZVNlcXVlbmNlKGNvbGxlY3Rpb24pO1xuXG4gIC8vIElmIGNvbGxlY3Rpb24uc2l6ZSBpcyB1bmRlZmluZWQsIHRoZSBzaXplIG9mIHRoZSByZWFsaXplZCBzbGljZVNlcSBpc1xuICAvLyB1bmtub3duIGF0IHRoaXMgcG9pbnQgdW5sZXNzIHRoZSBudW1iZXIgb2YgaXRlbXMgdG8gc2xpY2UgaXMgMFxuICBzbGljZVNlcS5zaXplID1cbiAgICBzbGljZVNpemUgPT09IDAgPyBzbGljZVNpemUgOiAoY29sbGVjdGlvbi5zaXplICYmIHNsaWNlU2l6ZSkgfHwgdW5kZWZpbmVkO1xuXG4gIGlmICghdXNlS2V5cyAmJiBpc1NlcShjb2xsZWN0aW9uKSAmJiBzbGljZVNpemUgPj0gMCkge1xuICAgIHNsaWNlU2VxLmdldCA9IGZ1bmN0aW9uIChpbmRleCwgbm90U2V0VmFsdWUpIHtcbiAgICAgIGluZGV4ID0gd3JhcEluZGV4KHRoaXMsIGluZGV4KTtcbiAgICAgIHJldHVybiBpbmRleCA+PSAwICYmIGluZGV4IDwgc2xpY2VTaXplXG4gICAgICAgID8gY29sbGVjdGlvbi5nZXQoaW5kZXggKyByZXNvbHZlZEJlZ2luLCBub3RTZXRWYWx1ZSlcbiAgICAgICAgOiBub3RTZXRWYWx1ZTtcbiAgICB9O1xuICB9XG5cbiAgc2xpY2VTZXEuX19pdGVyYXRlVW5jYWNoZWQgPSBmdW5jdGlvbiAoZm4sIHJldmVyc2UpIHtcbiAgICB2YXIgdGhpcyQxJDEgPSB0aGlzO1xuXG4gICAgaWYgKHNsaWNlU2l6ZSA9PT0gMCkge1xuICAgICAgcmV0dXJuIDA7XG4gICAgfVxuICAgIGlmIChyZXZlcnNlKSB7XG4gICAgICByZXR1cm4gdGhpcy5jYWNoZVJlc3VsdCgpLl9faXRlcmF0ZShmbiwgcmV2ZXJzZSk7XG4gICAgfVxuICAgIHZhciBza2lwcGVkID0gMDtcbiAgICB2YXIgaXNTa2lwcGluZyA9IHRydWU7XG4gICAgdmFyIGl0ZXJhdGlvbnMgPSAwO1xuICAgIGNvbGxlY3Rpb24uX19pdGVyYXRlKGZ1bmN0aW9uICh2LCBrKSB7XG4gICAgICBpZiAoIShpc1NraXBwaW5nICYmIChpc1NraXBwaW5nID0gc2tpcHBlZCsrIDwgcmVzb2x2ZWRCZWdpbikpKSB7XG4gICAgICAgIGl0ZXJhdGlvbnMrKztcbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICBmbih2LCB1c2VLZXlzID8gayA6IGl0ZXJhdGlvbnMgLSAxLCB0aGlzJDEkMSkgIT09IGZhbHNlICYmXG4gICAgICAgICAgaXRlcmF0aW9ucyAhPT0gc2xpY2VTaXplXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgfSk7XG4gICAgcmV0dXJuIGl0ZXJhdGlvbnM7XG4gIH07XG5cbiAgc2xpY2VTZXEuX19pdGVyYXRvclVuY2FjaGVkID0gZnVuY3Rpb24gKHR5cGUsIHJldmVyc2UpIHtcbiAgICBpZiAoc2xpY2VTaXplICE9PSAwICYmIHJldmVyc2UpIHtcbiAgICAgIHJldHVybiB0aGlzLmNhY2hlUmVzdWx0KCkuX19pdGVyYXRvcih0eXBlLCByZXZlcnNlKTtcbiAgICB9XG4gICAgLy8gRG9uJ3QgYm90aGVyIGluc3RhbnRpYXRpbmcgcGFyZW50IGl0ZXJhdG9yIGlmIHRha2luZyAwLlxuICAgIGlmIChzbGljZVNpemUgPT09IDApIHtcbiAgICAgIHJldHVybiBuZXcgSXRlcmF0b3IoaXRlcmF0b3JEb25lKTtcbiAgICB9XG4gICAgdmFyIGl0ZXJhdG9yID0gY29sbGVjdGlvbi5fX2l0ZXJhdG9yKHR5cGUsIHJldmVyc2UpO1xuICAgIHZhciBza2lwcGVkID0gMDtcbiAgICB2YXIgaXRlcmF0aW9ucyA9IDA7XG4gICAgcmV0dXJuIG5ldyBJdGVyYXRvcihmdW5jdGlvbiAoKSB7XG4gICAgICB3aGlsZSAoc2tpcHBlZCsrIDwgcmVzb2x2ZWRCZWdpbikge1xuICAgICAgICBpdGVyYXRvci5uZXh0KCk7XG4gICAgICB9XG4gICAgICBpZiAoKytpdGVyYXRpb25zID4gc2xpY2VTaXplKSB7XG4gICAgICAgIHJldHVybiBpdGVyYXRvckRvbmUoKTtcbiAgICAgIH1cbiAgICAgIHZhciBzdGVwID0gaXRlcmF0b3IubmV4dCgpO1xuICAgICAgaWYgKHVzZUtleXMgfHwgdHlwZSA9PT0gSVRFUkFURV9WQUxVRVMgfHwgc3RlcC5kb25lKSB7XG4gICAgICAgIHJldHVybiBzdGVwO1xuICAgICAgfVxuICAgICAgaWYgKHR5cGUgPT09IElURVJBVEVfS0VZUykge1xuICAgICAgICByZXR1cm4gaXRlcmF0b3JWYWx1ZSh0eXBlLCBpdGVyYXRpb25zIC0gMSwgdW5kZWZpbmVkLCBzdGVwKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBpdGVyYXRvclZhbHVlKHR5cGUsIGl0ZXJhdGlvbnMgLSAxLCBzdGVwLnZhbHVlWzFdLCBzdGVwKTtcbiAgICB9KTtcbiAgfTtcblxuICByZXR1cm4gc2xpY2VTZXE7XG59XG5cbmZ1bmN0aW9uIHRha2VXaGlsZUZhY3RvcnkoY29sbGVjdGlvbiwgcHJlZGljYXRlLCBjb250ZXh0KSB7XG4gIHZhciB0YWtlU2VxdWVuY2UgPSBtYWtlU2VxdWVuY2UoY29sbGVjdGlvbik7XG4gIHRha2VTZXF1ZW5jZS5fX2l0ZXJhdGVVbmNhY2hlZCA9IGZ1bmN0aW9uIChmbiwgcmV2ZXJzZSkge1xuICAgIHZhciB0aGlzJDEkMSA9IHRoaXM7XG5cbiAgICBpZiAocmV2ZXJzZSkge1xuICAgICAgcmV0dXJuIHRoaXMuY2FjaGVSZXN1bHQoKS5fX2l0ZXJhdGUoZm4sIHJldmVyc2UpO1xuICAgIH1cbiAgICB2YXIgaXRlcmF0aW9ucyA9IDA7XG4gICAgY29sbGVjdGlvbi5fX2l0ZXJhdGUoXG4gICAgICBmdW5jdGlvbiAodiwgaywgYykgeyByZXR1cm4gcHJlZGljYXRlLmNhbGwoY29udGV4dCwgdiwgaywgYykgJiYgKytpdGVyYXRpb25zICYmIGZuKHYsIGssIHRoaXMkMSQxKTsgfVxuICAgICk7XG4gICAgcmV0dXJuIGl0ZXJhdGlvbnM7XG4gIH07XG4gIHRha2VTZXF1ZW5jZS5fX2l0ZXJhdG9yVW5jYWNoZWQgPSBmdW5jdGlvbiAodHlwZSwgcmV2ZXJzZSkge1xuICAgIHZhciB0aGlzJDEkMSA9IHRoaXM7XG5cbiAgICBpZiAocmV2ZXJzZSkge1xuICAgICAgcmV0dXJuIHRoaXMuY2FjaGVSZXN1bHQoKS5fX2l0ZXJhdG9yKHR5cGUsIHJldmVyc2UpO1xuICAgIH1cbiAgICB2YXIgaXRlcmF0b3IgPSBjb2xsZWN0aW9uLl9faXRlcmF0b3IoSVRFUkFURV9FTlRSSUVTLCByZXZlcnNlKTtcbiAgICB2YXIgaXRlcmF0aW5nID0gdHJ1ZTtcbiAgICByZXR1cm4gbmV3IEl0ZXJhdG9yKGZ1bmN0aW9uICgpIHtcbiAgICAgIGlmICghaXRlcmF0aW5nKSB7XG4gICAgICAgIHJldHVybiBpdGVyYXRvckRvbmUoKTtcbiAgICAgIH1cbiAgICAgIHZhciBzdGVwID0gaXRlcmF0b3IubmV4dCgpO1xuICAgICAgaWYgKHN0ZXAuZG9uZSkge1xuICAgICAgICByZXR1cm4gc3RlcDtcbiAgICAgIH1cbiAgICAgIHZhciBlbnRyeSA9IHN0ZXAudmFsdWU7XG4gICAgICB2YXIgayA9IGVudHJ5WzBdO1xuICAgICAgdmFyIHYgPSBlbnRyeVsxXTtcbiAgICAgIGlmICghcHJlZGljYXRlLmNhbGwoY29udGV4dCwgdiwgaywgdGhpcyQxJDEpKSB7XG4gICAgICAgIGl0ZXJhdGluZyA9IGZhbHNlO1xuICAgICAgICByZXR1cm4gaXRlcmF0b3JEb25lKCk7XG4gICAgICB9XG4gICAgICByZXR1cm4gdHlwZSA9PT0gSVRFUkFURV9FTlRSSUVTID8gc3RlcCA6IGl0ZXJhdG9yVmFsdWUodHlwZSwgaywgdiwgc3RlcCk7XG4gICAgfSk7XG4gIH07XG4gIHJldHVybiB0YWtlU2VxdWVuY2U7XG59XG5cbmZ1bmN0aW9uIHNraXBXaGlsZUZhY3RvcnkoY29sbGVjdGlvbiwgcHJlZGljYXRlLCBjb250ZXh0LCB1c2VLZXlzKSB7XG4gIHZhciBza2lwU2VxdWVuY2UgPSBtYWtlU2VxdWVuY2UoY29sbGVjdGlvbik7XG4gIHNraXBTZXF1ZW5jZS5fX2l0ZXJhdGVVbmNhY2hlZCA9IGZ1bmN0aW9uIChmbiwgcmV2ZXJzZSkge1xuICAgIHZhciB0aGlzJDEkMSA9IHRoaXM7XG5cbiAgICBpZiAocmV2ZXJzZSkge1xuICAgICAgcmV0dXJuIHRoaXMuY2FjaGVSZXN1bHQoKS5fX2l0ZXJhdGUoZm4sIHJldmVyc2UpO1xuICAgIH1cbiAgICB2YXIgaXNTa2lwcGluZyA9IHRydWU7XG4gICAgdmFyIGl0ZXJhdGlvbnMgPSAwO1xuICAgIGNvbGxlY3Rpb24uX19pdGVyYXRlKGZ1bmN0aW9uICh2LCBrLCBjKSB7XG4gICAgICBpZiAoIShpc1NraXBwaW5nICYmIChpc1NraXBwaW5nID0gcHJlZGljYXRlLmNhbGwoY29udGV4dCwgdiwgaywgYykpKSkge1xuICAgICAgICBpdGVyYXRpb25zKys7XG4gICAgICAgIHJldHVybiBmbih2LCB1c2VLZXlzID8gayA6IGl0ZXJhdGlvbnMgLSAxLCB0aGlzJDEkMSk7XG4gICAgICB9XG4gICAgfSk7XG4gICAgcmV0dXJuIGl0ZXJhdGlvbnM7XG4gIH07XG4gIHNraXBTZXF1ZW5jZS5fX2l0ZXJhdG9yVW5jYWNoZWQgPSBmdW5jdGlvbiAodHlwZSwgcmV2ZXJzZSkge1xuICAgIHZhciB0aGlzJDEkMSA9IHRoaXM7XG5cbiAgICBpZiAocmV2ZXJzZSkge1xuICAgICAgcmV0dXJuIHRoaXMuY2FjaGVSZXN1bHQoKS5fX2l0ZXJhdG9yKHR5cGUsIHJldmVyc2UpO1xuICAgIH1cbiAgICB2YXIgaXRlcmF0b3IgPSBjb2xsZWN0aW9uLl9faXRlcmF0b3IoSVRFUkFURV9FTlRSSUVTLCByZXZlcnNlKTtcbiAgICB2YXIgc2tpcHBpbmcgPSB0cnVlO1xuICAgIHZhciBpdGVyYXRpb25zID0gMDtcbiAgICByZXR1cm4gbmV3IEl0ZXJhdG9yKGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciBzdGVwO1xuICAgICAgdmFyIGs7XG4gICAgICB2YXIgdjtcbiAgICAgIGRvIHtcbiAgICAgICAgc3RlcCA9IGl0ZXJhdG9yLm5leHQoKTtcbiAgICAgICAgaWYgKHN0ZXAuZG9uZSkge1xuICAgICAgICAgIGlmICh1c2VLZXlzIHx8IHR5cGUgPT09IElURVJBVEVfVkFMVUVTKSB7XG4gICAgICAgICAgICByZXR1cm4gc3RlcDtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKHR5cGUgPT09IElURVJBVEVfS0VZUykge1xuICAgICAgICAgICAgcmV0dXJuIGl0ZXJhdG9yVmFsdWUodHlwZSwgaXRlcmF0aW9ucysrLCB1bmRlZmluZWQsIHN0ZXApO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gaXRlcmF0b3JWYWx1ZSh0eXBlLCBpdGVyYXRpb25zKyssIHN0ZXAudmFsdWVbMV0sIHN0ZXApO1xuICAgICAgICB9XG4gICAgICAgIHZhciBlbnRyeSA9IHN0ZXAudmFsdWU7XG4gICAgICAgIGsgPSBlbnRyeVswXTtcbiAgICAgICAgdiA9IGVudHJ5WzFdO1xuICAgICAgICBza2lwcGluZyAmJiAoc2tpcHBpbmcgPSBwcmVkaWNhdGUuY2FsbChjb250ZXh0LCB2LCBrLCB0aGlzJDEkMSkpO1xuICAgICAgfSB3aGlsZSAoc2tpcHBpbmcpO1xuICAgICAgcmV0dXJuIHR5cGUgPT09IElURVJBVEVfRU5UUklFUyA/IHN0ZXAgOiBpdGVyYXRvclZhbHVlKHR5cGUsIGssIHYsIHN0ZXApO1xuICAgIH0pO1xuICB9O1xuICByZXR1cm4gc2tpcFNlcXVlbmNlO1xufVxuXG5mdW5jdGlvbiBjb25jYXRGYWN0b3J5KGNvbGxlY3Rpb24sIHZhbHVlcykge1xuICB2YXIgaXNLZXllZENvbGxlY3Rpb24gPSBpc0tleWVkKGNvbGxlY3Rpb24pO1xuICB2YXIgaXRlcnMgPSBbY29sbGVjdGlvbl1cbiAgICAuY29uY2F0KHZhbHVlcylcbiAgICAubWFwKGZ1bmN0aW9uICh2KSB7XG4gICAgICBpZiAoIWlzQ29sbGVjdGlvbih2KSkge1xuICAgICAgICB2ID0gaXNLZXllZENvbGxlY3Rpb25cbiAgICAgICAgICA/IGtleWVkU2VxRnJvbVZhbHVlKHYpXG4gICAgICAgICAgOiBpbmRleGVkU2VxRnJvbVZhbHVlKEFycmF5LmlzQXJyYXkodikgPyB2IDogW3ZdKTtcbiAgICAgIH0gZWxzZSBpZiAoaXNLZXllZENvbGxlY3Rpb24pIHtcbiAgICAgICAgdiA9IEtleWVkQ29sbGVjdGlvbih2KTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB2O1xuICAgIH0pXG4gICAgLmZpbHRlcihmdW5jdGlvbiAodikgeyByZXR1cm4gdi5zaXplICE9PSAwOyB9KTtcblxuICBpZiAoaXRlcnMubGVuZ3RoID09PSAwKSB7XG4gICAgcmV0dXJuIGNvbGxlY3Rpb247XG4gIH1cblxuICBpZiAoaXRlcnMubGVuZ3RoID09PSAxKSB7XG4gICAgdmFyIHNpbmdsZXRvbiA9IGl0ZXJzWzBdO1xuICAgIGlmIChcbiAgICAgIHNpbmdsZXRvbiA9PT0gY29sbGVjdGlvbiB8fFxuICAgICAgKGlzS2V5ZWRDb2xsZWN0aW9uICYmIGlzS2V5ZWQoc2luZ2xldG9uKSkgfHxcbiAgICAgIChpc0luZGV4ZWQoY29sbGVjdGlvbikgJiYgaXNJbmRleGVkKHNpbmdsZXRvbikpXG4gICAgKSB7XG4gICAgICByZXR1cm4gc2luZ2xldG9uO1xuICAgIH1cbiAgfVxuXG4gIHZhciBjb25jYXRTZXEgPSBuZXcgQXJyYXlTZXEoaXRlcnMpO1xuICBpZiAoaXNLZXllZENvbGxlY3Rpb24pIHtcbiAgICBjb25jYXRTZXEgPSBjb25jYXRTZXEudG9LZXllZFNlcSgpO1xuICB9IGVsc2UgaWYgKCFpc0luZGV4ZWQoY29sbGVjdGlvbikpIHtcbiAgICBjb25jYXRTZXEgPSBjb25jYXRTZXEudG9TZXRTZXEoKTtcbiAgfVxuICBjb25jYXRTZXEgPSBjb25jYXRTZXEuZmxhdHRlbih0cnVlKTtcbiAgY29uY2F0U2VxLnNpemUgPSBpdGVycy5yZWR1Y2UoZnVuY3Rpb24gKHN1bSwgc2VxKSB7XG4gICAgaWYgKHN1bSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICB2YXIgc2l6ZSA9IHNlcS5zaXplO1xuICAgICAgaWYgKHNpemUgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICByZXR1cm4gc3VtICsgc2l6ZTtcbiAgICAgIH1cbiAgICB9XG4gIH0sIDApO1xuICByZXR1cm4gY29uY2F0U2VxO1xufVxuXG5mdW5jdGlvbiBmbGF0dGVuRmFjdG9yeShjb2xsZWN0aW9uLCBkZXB0aCwgdXNlS2V5cykge1xuICB2YXIgZmxhdFNlcXVlbmNlID0gbWFrZVNlcXVlbmNlKGNvbGxlY3Rpb24pO1xuICBmbGF0U2VxdWVuY2UuX19pdGVyYXRlVW5jYWNoZWQgPSBmdW5jdGlvbiAoZm4sIHJldmVyc2UpIHtcbiAgICBpZiAocmV2ZXJzZSkge1xuICAgICAgcmV0dXJuIHRoaXMuY2FjaGVSZXN1bHQoKS5fX2l0ZXJhdGUoZm4sIHJldmVyc2UpO1xuICAgIH1cbiAgICB2YXIgaXRlcmF0aW9ucyA9IDA7XG4gICAgdmFyIHN0b3BwZWQgPSBmYWxzZTtcbiAgICBmdW5jdGlvbiBmbGF0RGVlcChpdGVyLCBjdXJyZW50RGVwdGgpIHtcbiAgICAgIGl0ZXIuX19pdGVyYXRlKGZ1bmN0aW9uICh2LCBrKSB7XG4gICAgICAgIGlmICgoIWRlcHRoIHx8IGN1cnJlbnREZXB0aCA8IGRlcHRoKSAmJiBpc0NvbGxlY3Rpb24odikpIHtcbiAgICAgICAgICBmbGF0RGVlcCh2LCBjdXJyZW50RGVwdGggKyAxKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBpdGVyYXRpb25zKys7XG4gICAgICAgICAgaWYgKGZuKHYsIHVzZUtleXMgPyBrIDogaXRlcmF0aW9ucyAtIDEsIGZsYXRTZXF1ZW5jZSkgPT09IGZhbHNlKSB7XG4gICAgICAgICAgICBzdG9wcGVkID0gdHJ1ZTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuICFzdG9wcGVkO1xuICAgICAgfSwgcmV2ZXJzZSk7XG4gICAgfVxuICAgIGZsYXREZWVwKGNvbGxlY3Rpb24sIDApO1xuICAgIHJldHVybiBpdGVyYXRpb25zO1xuICB9O1xuICBmbGF0U2VxdWVuY2UuX19pdGVyYXRvclVuY2FjaGVkID0gZnVuY3Rpb24gKHR5cGUsIHJldmVyc2UpIHtcbiAgICBpZiAocmV2ZXJzZSkge1xuICAgICAgcmV0dXJuIHRoaXMuY2FjaGVSZXN1bHQoKS5fX2l0ZXJhdG9yKHR5cGUsIHJldmVyc2UpO1xuICAgIH1cbiAgICB2YXIgaXRlcmF0b3IgPSBjb2xsZWN0aW9uLl9faXRlcmF0b3IodHlwZSwgcmV2ZXJzZSk7XG4gICAgdmFyIHN0YWNrID0gW107XG4gICAgdmFyIGl0ZXJhdGlvbnMgPSAwO1xuICAgIHJldHVybiBuZXcgSXRlcmF0b3IoZnVuY3Rpb24gKCkge1xuICAgICAgd2hpbGUgKGl0ZXJhdG9yKSB7XG4gICAgICAgIHZhciBzdGVwID0gaXRlcmF0b3IubmV4dCgpO1xuICAgICAgICBpZiAoc3RlcC5kb25lICE9PSBmYWxzZSkge1xuICAgICAgICAgIGl0ZXJhdG9yID0gc3RhY2sucG9wKCk7XG4gICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIHYgPSBzdGVwLnZhbHVlO1xuICAgICAgICBpZiAodHlwZSA9PT0gSVRFUkFURV9FTlRSSUVTKSB7XG4gICAgICAgICAgdiA9IHZbMV07XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCghZGVwdGggfHwgc3RhY2subGVuZ3RoIDwgZGVwdGgpICYmIGlzQ29sbGVjdGlvbih2KSkge1xuICAgICAgICAgIHN0YWNrLnB1c2goaXRlcmF0b3IpO1xuICAgICAgICAgIGl0ZXJhdG9yID0gdi5fX2l0ZXJhdG9yKHR5cGUsIHJldmVyc2UpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiB1c2VLZXlzID8gc3RlcCA6IGl0ZXJhdG9yVmFsdWUodHlwZSwgaXRlcmF0aW9ucysrLCB2LCBzdGVwKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIGl0ZXJhdG9yRG9uZSgpO1xuICAgIH0pO1xuICB9O1xuICByZXR1cm4gZmxhdFNlcXVlbmNlO1xufVxuXG5mdW5jdGlvbiBmbGF0TWFwRmFjdG9yeShjb2xsZWN0aW9uLCBtYXBwZXIsIGNvbnRleHQpIHtcbiAgdmFyIGNvZXJjZSA9IGNvbGxlY3Rpb25DbGFzcyhjb2xsZWN0aW9uKTtcbiAgcmV0dXJuIGNvbGxlY3Rpb25cbiAgICAudG9TZXEoKVxuICAgIC5tYXAoZnVuY3Rpb24gKHYsIGspIHsgcmV0dXJuIGNvZXJjZShtYXBwZXIuY2FsbChjb250ZXh0LCB2LCBrLCBjb2xsZWN0aW9uKSk7IH0pXG4gICAgLmZsYXR0ZW4odHJ1ZSk7XG59XG5cbmZ1bmN0aW9uIGludGVycG9zZUZhY3RvcnkoY29sbGVjdGlvbiwgc2VwYXJhdG9yKSB7XG4gIHZhciBpbnRlcnBvc2VkU2VxdWVuY2UgPSBtYWtlU2VxdWVuY2UoY29sbGVjdGlvbik7XG4gIGludGVycG9zZWRTZXF1ZW5jZS5zaXplID0gY29sbGVjdGlvbi5zaXplICYmIGNvbGxlY3Rpb24uc2l6ZSAqIDIgLSAxO1xuICBpbnRlcnBvc2VkU2VxdWVuY2UuX19pdGVyYXRlVW5jYWNoZWQgPSBmdW5jdGlvbiAoZm4sIHJldmVyc2UpIHtcbiAgICB2YXIgdGhpcyQxJDEgPSB0aGlzO1xuXG4gICAgdmFyIGl0ZXJhdGlvbnMgPSAwO1xuICAgIGNvbGxlY3Rpb24uX19pdGVyYXRlKFxuICAgICAgZnVuY3Rpb24gKHYpIHsgcmV0dXJuICghaXRlcmF0aW9ucyB8fCBmbihzZXBhcmF0b3IsIGl0ZXJhdGlvbnMrKywgdGhpcyQxJDEpICE9PSBmYWxzZSkgJiZcbiAgICAgICAgZm4odiwgaXRlcmF0aW9ucysrLCB0aGlzJDEkMSkgIT09IGZhbHNlOyB9LFxuICAgICAgcmV2ZXJzZVxuICAgICk7XG4gICAgcmV0dXJuIGl0ZXJhdGlvbnM7XG4gIH07XG4gIGludGVycG9zZWRTZXF1ZW5jZS5fX2l0ZXJhdG9yVW5jYWNoZWQgPSBmdW5jdGlvbiAodHlwZSwgcmV2ZXJzZSkge1xuICAgIHZhciBpdGVyYXRvciA9IGNvbGxlY3Rpb24uX19pdGVyYXRvcihJVEVSQVRFX1ZBTFVFUywgcmV2ZXJzZSk7XG4gICAgdmFyIGl0ZXJhdGlvbnMgPSAwO1xuICAgIHZhciBzdGVwO1xuICAgIHJldHVybiBuZXcgSXRlcmF0b3IoZnVuY3Rpb24gKCkge1xuICAgICAgaWYgKCFzdGVwIHx8IGl0ZXJhdGlvbnMgJSAyKSB7XG4gICAgICAgIHN0ZXAgPSBpdGVyYXRvci5uZXh0KCk7XG4gICAgICAgIGlmIChzdGVwLmRvbmUpIHtcbiAgICAgICAgICByZXR1cm4gc3RlcDtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIGl0ZXJhdGlvbnMgJSAyXG4gICAgICAgID8gaXRlcmF0b3JWYWx1ZSh0eXBlLCBpdGVyYXRpb25zKyssIHNlcGFyYXRvcilcbiAgICAgICAgOiBpdGVyYXRvclZhbHVlKHR5cGUsIGl0ZXJhdGlvbnMrKywgc3RlcC52YWx1ZSwgc3RlcCk7XG4gICAgfSk7XG4gIH07XG4gIHJldHVybiBpbnRlcnBvc2VkU2VxdWVuY2U7XG59XG5cbmZ1bmN0aW9uIHNvcnRGYWN0b3J5KGNvbGxlY3Rpb24sIGNvbXBhcmF0b3IsIG1hcHBlcikge1xuICBpZiAoIWNvbXBhcmF0b3IpIHtcbiAgICBjb21wYXJhdG9yID0gZGVmYXVsdENvbXBhcmF0b3I7XG4gIH1cbiAgdmFyIGlzS2V5ZWRDb2xsZWN0aW9uID0gaXNLZXllZChjb2xsZWN0aW9uKTtcbiAgdmFyIGluZGV4ID0gMDtcbiAgdmFyIGVudHJpZXMgPSBjb2xsZWN0aW9uXG4gICAgLnRvU2VxKClcbiAgICAubWFwKGZ1bmN0aW9uICh2LCBrKSB7IHJldHVybiBbaywgdiwgaW5kZXgrKywgbWFwcGVyID8gbWFwcGVyKHYsIGssIGNvbGxlY3Rpb24pIDogdl07IH0pXG4gICAgLnZhbHVlU2VxKClcbiAgICAudG9BcnJheSgpO1xuICBlbnRyaWVzXG4gICAgLnNvcnQoZnVuY3Rpb24gKGEsIGIpIHsgcmV0dXJuIGNvbXBhcmF0b3IoYVszXSwgYlszXSkgfHwgYVsyXSAtIGJbMl07IH0pXG4gICAgLmZvckVhY2goXG4gICAgICBpc0tleWVkQ29sbGVjdGlvblxuICAgICAgICA/IGZ1bmN0aW9uICh2LCBpKSB7XG4gICAgICAgICAgICBlbnRyaWVzW2ldLmxlbmd0aCA9IDI7XG4gICAgICAgICAgfVxuICAgICAgICA6IGZ1bmN0aW9uICh2LCBpKSB7XG4gICAgICAgICAgICBlbnRyaWVzW2ldID0gdlsxXTtcbiAgICAgICAgICB9XG4gICAgKTtcbiAgcmV0dXJuIGlzS2V5ZWRDb2xsZWN0aW9uXG4gICAgPyBLZXllZFNlcShlbnRyaWVzKVxuICAgIDogaXNJbmRleGVkKGNvbGxlY3Rpb24pXG4gICAgPyBJbmRleGVkU2VxKGVudHJpZXMpXG4gICAgOiBTZXRTZXEoZW50cmllcyk7XG59XG5cbmZ1bmN0aW9uIG1heEZhY3RvcnkoY29sbGVjdGlvbiwgY29tcGFyYXRvciwgbWFwcGVyKSB7XG4gIGlmICghY29tcGFyYXRvcikge1xuICAgIGNvbXBhcmF0b3IgPSBkZWZhdWx0Q29tcGFyYXRvcjtcbiAgfVxuICBpZiAobWFwcGVyKSB7XG4gICAgdmFyIGVudHJ5ID0gY29sbGVjdGlvblxuICAgICAgLnRvU2VxKClcbiAgICAgIC5tYXAoZnVuY3Rpb24gKHYsIGspIHsgcmV0dXJuIFt2LCBtYXBwZXIodiwgaywgY29sbGVjdGlvbildOyB9KVxuICAgICAgLnJlZHVjZShmdW5jdGlvbiAoYSwgYikgeyByZXR1cm4gKG1heENvbXBhcmUoY29tcGFyYXRvciwgYVsxXSwgYlsxXSkgPyBiIDogYSk7IH0pO1xuICAgIHJldHVybiBlbnRyeSAmJiBlbnRyeVswXTtcbiAgfVxuICByZXR1cm4gY29sbGVjdGlvbi5yZWR1Y2UoZnVuY3Rpb24gKGEsIGIpIHsgcmV0dXJuIChtYXhDb21wYXJlKGNvbXBhcmF0b3IsIGEsIGIpID8gYiA6IGEpOyB9KTtcbn1cblxuZnVuY3Rpb24gbWF4Q29tcGFyZShjb21wYXJhdG9yLCBhLCBiKSB7XG4gIHZhciBjb21wID0gY29tcGFyYXRvcihiLCBhKTtcbiAgLy8gYiBpcyBjb25zaWRlcmVkIHRoZSBuZXcgbWF4IGlmIHRoZSBjb21wYXJhdG9yIGRlY2xhcmVzIHRoZW0gZXF1YWwsIGJ1dFxuICAvLyB0aGV5IGFyZSBub3QgZXF1YWwgYW5kIGIgaXMgaW4gZmFjdCBhIG51bGxpc2ggdmFsdWUuXG4gIHJldHVybiAoXG4gICAgKGNvbXAgPT09IDAgJiYgYiAhPT0gYSAmJiAoYiA9PT0gdW5kZWZpbmVkIHx8IGIgPT09IG51bGwgfHwgYiAhPT0gYikpIHx8XG4gICAgY29tcCA+IDBcbiAgKTtcbn1cblxuZnVuY3Rpb24gemlwV2l0aEZhY3Rvcnkoa2V5SXRlciwgemlwcGVyLCBpdGVycywgemlwQWxsKSB7XG4gIHZhciB6aXBTZXF1ZW5jZSA9IG1ha2VTZXF1ZW5jZShrZXlJdGVyKTtcbiAgdmFyIHNpemVzID0gbmV3IEFycmF5U2VxKGl0ZXJzKS5tYXAoZnVuY3Rpb24gKGkpIHsgcmV0dXJuIGkuc2l6ZTsgfSk7XG4gIHppcFNlcXVlbmNlLnNpemUgPSB6aXBBbGwgPyBzaXplcy5tYXgoKSA6IHNpemVzLm1pbigpO1xuICAvLyBOb3RlOiB0aGlzIGEgZ2VuZXJpYyBiYXNlIGltcGxlbWVudGF0aW9uIG9mIF9faXRlcmF0ZSBpbiB0ZXJtcyBvZlxuICAvLyBfX2l0ZXJhdG9yIHdoaWNoIG1heSBiZSBtb3JlIGdlbmVyaWNhbGx5IHVzZWZ1bCBpbiB0aGUgZnV0dXJlLlxuICB6aXBTZXF1ZW5jZS5fX2l0ZXJhdGUgPSBmdW5jdGlvbiAoZm4sIHJldmVyc2UpIHtcbiAgICAvKiBnZW5lcmljOlxuICAgIHZhciBpdGVyYXRvciA9IHRoaXMuX19pdGVyYXRvcihJVEVSQVRFX0VOVFJJRVMsIHJldmVyc2UpO1xuICAgIHZhciBzdGVwO1xuICAgIHZhciBpdGVyYXRpb25zID0gMDtcbiAgICB3aGlsZSAoIShzdGVwID0gaXRlcmF0b3IubmV4dCgpKS5kb25lKSB7XG4gICAgICBpdGVyYXRpb25zKys7XG4gICAgICBpZiAoZm4oc3RlcC52YWx1ZVsxXSwgc3RlcC52YWx1ZVswXSwgdGhpcykgPT09IGZhbHNlKSB7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gaXRlcmF0aW9ucztcbiAgICAqL1xuICAgIC8vIGluZGV4ZWQ6XG4gICAgdmFyIGl0ZXJhdG9yID0gdGhpcy5fX2l0ZXJhdG9yKElURVJBVEVfVkFMVUVTLCByZXZlcnNlKTtcbiAgICB2YXIgc3RlcDtcbiAgICB2YXIgaXRlcmF0aW9ucyA9IDA7XG4gICAgd2hpbGUgKCEoc3RlcCA9IGl0ZXJhdG9yLm5leHQoKSkuZG9uZSkge1xuICAgICAgaWYgKGZuKHN0ZXAudmFsdWUsIGl0ZXJhdGlvbnMrKywgdGhpcykgPT09IGZhbHNlKSB7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gaXRlcmF0aW9ucztcbiAgfTtcbiAgemlwU2VxdWVuY2UuX19pdGVyYXRvclVuY2FjaGVkID0gZnVuY3Rpb24gKHR5cGUsIHJldmVyc2UpIHtcbiAgICB2YXIgaXRlcmF0b3JzID0gaXRlcnMubWFwKFxuICAgICAgZnVuY3Rpb24gKGkpIHsgcmV0dXJuICgoaSA9IENvbGxlY3Rpb24oaSkpLCBnZXRJdGVyYXRvcihyZXZlcnNlID8gaS5yZXZlcnNlKCkgOiBpKSk7IH1cbiAgICApO1xuICAgIHZhciBpdGVyYXRpb25zID0gMDtcbiAgICB2YXIgaXNEb25lID0gZmFsc2U7XG4gICAgcmV0dXJuIG5ldyBJdGVyYXRvcihmdW5jdGlvbiAoKSB7XG4gICAgICB2YXIgc3RlcHM7XG4gICAgICBpZiAoIWlzRG9uZSkge1xuICAgICAgICBzdGVwcyA9IGl0ZXJhdG9ycy5tYXAoZnVuY3Rpb24gKGkpIHsgcmV0dXJuIGkubmV4dCgpOyB9KTtcbiAgICAgICAgaXNEb25lID0gemlwQWxsID8gc3RlcHMuZXZlcnkoZnVuY3Rpb24gKHMpIHsgcmV0dXJuIHMuZG9uZTsgfSkgOiBzdGVwcy5zb21lKGZ1bmN0aW9uIChzKSB7IHJldHVybiBzLmRvbmU7IH0pO1xuICAgICAgfVxuICAgICAgaWYgKGlzRG9uZSkge1xuICAgICAgICByZXR1cm4gaXRlcmF0b3JEb25lKCk7XG4gICAgICB9XG4gICAgICByZXR1cm4gaXRlcmF0b3JWYWx1ZShcbiAgICAgICAgdHlwZSxcbiAgICAgICAgaXRlcmF0aW9ucysrLFxuICAgICAgICB6aXBwZXIuYXBwbHkoXG4gICAgICAgICAgbnVsbCxcbiAgICAgICAgICBzdGVwcy5tYXAoZnVuY3Rpb24gKHMpIHsgcmV0dXJuIHMudmFsdWU7IH0pXG4gICAgICAgIClcbiAgICAgICk7XG4gICAgfSk7XG4gIH07XG4gIHJldHVybiB6aXBTZXF1ZW5jZTtcbn1cblxuLy8gI3ByYWdtYSBIZWxwZXIgRnVuY3Rpb25zXG5cbmZ1bmN0aW9uIHJlaWZ5KGl0ZXIsIHNlcSkge1xuICByZXR1cm4gaXRlciA9PT0gc2VxID8gaXRlciA6IGlzU2VxKGl0ZXIpID8gc2VxIDogaXRlci5jb25zdHJ1Y3RvcihzZXEpO1xufVxuXG5mdW5jdGlvbiB2YWxpZGF0ZUVudHJ5KGVudHJ5KSB7XG4gIGlmIChlbnRyeSAhPT0gT2JqZWN0KGVudHJ5KSkge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0V4cGVjdGVkIFtLLCBWXSB0dXBsZTogJyArIGVudHJ5KTtcbiAgfVxufVxuXG5mdW5jdGlvbiBjb2xsZWN0aW9uQ2xhc3MoY29sbGVjdGlvbikge1xuICByZXR1cm4gaXNLZXllZChjb2xsZWN0aW9uKVxuICAgID8gS2V5ZWRDb2xsZWN0aW9uXG4gICAgOiBpc0luZGV4ZWQoY29sbGVjdGlvbilcbiAgICA/IEluZGV4ZWRDb2xsZWN0aW9uXG4gICAgOiBTZXRDb2xsZWN0aW9uO1xufVxuXG5mdW5jdGlvbiBtYWtlU2VxdWVuY2UoY29sbGVjdGlvbikge1xuICByZXR1cm4gT2JqZWN0LmNyZWF0ZShcbiAgICAoaXNLZXllZChjb2xsZWN0aW9uKVxuICAgICAgPyBLZXllZFNlcVxuICAgICAgOiBpc0luZGV4ZWQoY29sbGVjdGlvbilcbiAgICAgID8gSW5kZXhlZFNlcVxuICAgICAgOiBTZXRTZXFcbiAgICApLnByb3RvdHlwZVxuICApO1xufVxuXG5mdW5jdGlvbiBjYWNoZVJlc3VsdFRocm91Z2goKSB7XG4gIGlmICh0aGlzLl9pdGVyLmNhY2hlUmVzdWx0KSB7XG4gICAgdGhpcy5faXRlci5jYWNoZVJlc3VsdCgpO1xuICAgIHRoaXMuc2l6ZSA9IHRoaXMuX2l0ZXIuc2l6ZTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuICByZXR1cm4gU2VxLnByb3RvdHlwZS5jYWNoZVJlc3VsdC5jYWxsKHRoaXMpO1xufVxuXG5mdW5jdGlvbiBkZWZhdWx0Q29tcGFyYXRvcihhLCBiKSB7XG4gIGlmIChhID09PSB1bmRlZmluZWQgJiYgYiA9PT0gdW5kZWZpbmVkKSB7XG4gICAgcmV0dXJuIDA7XG4gIH1cblxuICBpZiAoYSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgcmV0dXJuIDE7XG4gIH1cblxuICBpZiAoYiA9PT0gdW5kZWZpbmVkKSB7XG4gICAgcmV0dXJuIC0xO1xuICB9XG5cbiAgcmV0dXJuIGEgPiBiID8gMSA6IGEgPCBiID8gLTEgOiAwO1xufVxuXG5mdW5jdGlvbiBhcnJDb3B5KGFyciwgb2Zmc2V0KSB7XG4gIG9mZnNldCA9IG9mZnNldCB8fCAwO1xuICB2YXIgbGVuID0gTWF0aC5tYXgoMCwgYXJyLmxlbmd0aCAtIG9mZnNldCk7XG4gIHZhciBuZXdBcnIgPSBuZXcgQXJyYXkobGVuKTtcbiAgZm9yICh2YXIgaWkgPSAwOyBpaSA8IGxlbjsgaWkrKykge1xuICAgIG5ld0FycltpaV0gPSBhcnJbaWkgKyBvZmZzZXRdO1xuICB9XG4gIHJldHVybiBuZXdBcnI7XG59XG5cbmZ1bmN0aW9uIGludmFyaWFudChjb25kaXRpb24sIGVycm9yKSB7XG4gIGlmICghY29uZGl0aW9uKSB7IHRocm93IG5ldyBFcnJvcihlcnJvcik7IH1cbn1cblxuZnVuY3Rpb24gYXNzZXJ0Tm90SW5maW5pdGUoc2l6ZSkge1xuICBpbnZhcmlhbnQoXG4gICAgc2l6ZSAhPT0gSW5maW5pdHksXG4gICAgJ0Nhbm5vdCBwZXJmb3JtIHRoaXMgYWN0aW9uIHdpdGggYW4gaW5maW5pdGUgc2l6ZS4nXG4gICk7XG59XG5cbmZ1bmN0aW9uIGNvZXJjZUtleVBhdGgoa2V5UGF0aCkge1xuICBpZiAoaXNBcnJheUxpa2Uoa2V5UGF0aCkgJiYgdHlwZW9mIGtleVBhdGggIT09ICdzdHJpbmcnKSB7XG4gICAgcmV0dXJuIGtleVBhdGg7XG4gIH1cbiAgaWYgKGlzT3JkZXJlZChrZXlQYXRoKSkge1xuICAgIHJldHVybiBrZXlQYXRoLnRvQXJyYXkoKTtcbiAgfVxuICB0aHJvdyBuZXcgVHlwZUVycm9yKFxuICAgICdJbnZhbGlkIGtleVBhdGg6IGV4cGVjdGVkIE9yZGVyZWQgQ29sbGVjdGlvbiBvciBBcnJheTogJyArIGtleVBhdGhcbiAgKTtcbn1cblxudmFyIHRvU3RyaW5nID0gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZztcblxuZnVuY3Rpb24gaXNQbGFpbk9iamVjdCh2YWx1ZSkge1xuICAvLyBUaGUgYmFzZSBwcm90b3R5cGUncyB0b1N0cmluZyBkZWFscyB3aXRoIEFyZ3VtZW50IG9iamVjdHMgYW5kIG5hdGl2ZSBuYW1lc3BhY2VzIGxpa2UgTWF0aFxuICBpZiAoXG4gICAgIXZhbHVlIHx8XG4gICAgdHlwZW9mIHZhbHVlICE9PSAnb2JqZWN0JyB8fFxuICAgIHRvU3RyaW5nLmNhbGwodmFsdWUpICE9PSAnW29iamVjdCBPYmplY3RdJ1xuICApIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICB2YXIgcHJvdG8gPSBPYmplY3QuZ2V0UHJvdG90eXBlT2YodmFsdWUpO1xuICBpZiAocHJvdG8gPT09IG51bGwpIHtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIC8vIEl0ZXJhdGl2ZWx5IGdvaW5nIHVwIHRoZSBwcm90b3R5cGUgY2hhaW4gaXMgbmVlZGVkIGZvciBjcm9zcy1yZWFsbSBlbnZpcm9ubWVudHMgKGRpZmZlcmluZyBjb250ZXh0cywgaWZyYW1lcywgZXRjKVxuICB2YXIgcGFyZW50UHJvdG8gPSBwcm90bztcbiAgdmFyIG5leHRQcm90byA9IE9iamVjdC5nZXRQcm90b3R5cGVPZihwcm90byk7XG4gIHdoaWxlIChuZXh0UHJvdG8gIT09IG51bGwpIHtcbiAgICBwYXJlbnRQcm90byA9IG5leHRQcm90bztcbiAgICBuZXh0UHJvdG8gPSBPYmplY3QuZ2V0UHJvdG90eXBlT2YocGFyZW50UHJvdG8pO1xuICB9XG4gIHJldHVybiBwYXJlbnRQcm90byA9PT0gcHJvdG87XG59XG5cbi8qKlxuICogUmV0dXJucyB0cnVlIGlmIHRoZSB2YWx1ZSBpcyBhIHBvdGVudGlhbGx5LXBlcnNpc3RlbnQgZGF0YSBzdHJ1Y3R1cmUsIGVpdGhlclxuICogcHJvdmlkZWQgYnkgSW1tdXRhYmxlLmpzIG9yIGEgcGxhaW4gQXJyYXkgb3IgT2JqZWN0LlxuICovXG5mdW5jdGlvbiBpc0RhdGFTdHJ1Y3R1cmUodmFsdWUpIHtcbiAgcmV0dXJuIChcbiAgICB0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnICYmXG4gICAgKGlzSW1tdXRhYmxlKHZhbHVlKSB8fCBBcnJheS5pc0FycmF5KHZhbHVlKSB8fCBpc1BsYWluT2JqZWN0KHZhbHVlKSlcbiAgKTtcbn1cblxuZnVuY3Rpb24gcXVvdGVTdHJpbmcodmFsdWUpIHtcbiAgdHJ5IHtcbiAgICByZXR1cm4gdHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJyA/IEpTT04uc3RyaW5naWZ5KHZhbHVlKSA6IFN0cmluZyh2YWx1ZSk7XG4gIH0gY2F0Y2ggKF9pZ25vcmVFcnJvcikge1xuICAgIHJldHVybiBKU09OLnN0cmluZ2lmeSh2YWx1ZSk7XG4gIH1cbn1cblxuZnVuY3Rpb24gaGFzKGNvbGxlY3Rpb24sIGtleSkge1xuICByZXR1cm4gaXNJbW11dGFibGUoY29sbGVjdGlvbilcbiAgICA/IGNvbGxlY3Rpb24uaGFzKGtleSlcbiAgICA6IGlzRGF0YVN0cnVjdHVyZShjb2xsZWN0aW9uKSAmJiBoYXNPd25Qcm9wZXJ0eS5jYWxsKGNvbGxlY3Rpb24sIGtleSk7XG59XG5cbmZ1bmN0aW9uIGdldChjb2xsZWN0aW9uLCBrZXksIG5vdFNldFZhbHVlKSB7XG4gIHJldHVybiBpc0ltbXV0YWJsZShjb2xsZWN0aW9uKVxuICAgID8gY29sbGVjdGlvbi5nZXQoa2V5LCBub3RTZXRWYWx1ZSlcbiAgICA6ICFoYXMoY29sbGVjdGlvbiwga2V5KVxuICAgID8gbm90U2V0VmFsdWVcbiAgICA6IHR5cGVvZiBjb2xsZWN0aW9uLmdldCA9PT0gJ2Z1bmN0aW9uJ1xuICAgID8gY29sbGVjdGlvbi5nZXQoa2V5KVxuICAgIDogY29sbGVjdGlvbltrZXldO1xufVxuXG5mdW5jdGlvbiBzaGFsbG93Q29weShmcm9tKSB7XG4gIGlmIChBcnJheS5pc0FycmF5KGZyb20pKSB7XG4gICAgcmV0dXJuIGFyckNvcHkoZnJvbSk7XG4gIH1cbiAgdmFyIHRvID0ge307XG4gIGZvciAodmFyIGtleSBpbiBmcm9tKSB7XG4gICAgaWYgKGhhc093blByb3BlcnR5LmNhbGwoZnJvbSwga2V5KSkge1xuICAgICAgdG9ba2V5XSA9IGZyb21ba2V5XTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHRvO1xufVxuXG5mdW5jdGlvbiByZW1vdmUoY29sbGVjdGlvbiwga2V5KSB7XG4gIGlmICghaXNEYXRhU3RydWN0dXJlKGNvbGxlY3Rpb24pKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcbiAgICAgICdDYW5ub3QgdXBkYXRlIG5vbi1kYXRhLXN0cnVjdHVyZSB2YWx1ZTogJyArIGNvbGxlY3Rpb25cbiAgICApO1xuICB9XG4gIGlmIChpc0ltbXV0YWJsZShjb2xsZWN0aW9uKSkge1xuICAgIGlmICghY29sbGVjdGlvbi5yZW1vdmUpIHtcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXG4gICAgICAgICdDYW5ub3QgdXBkYXRlIGltbXV0YWJsZSB2YWx1ZSB3aXRob3V0IC5yZW1vdmUoKSBtZXRob2Q6ICcgKyBjb2xsZWN0aW9uXG4gICAgICApO1xuICAgIH1cbiAgICByZXR1cm4gY29sbGVjdGlvbi5yZW1vdmUoa2V5KTtcbiAgfVxuICBpZiAoIWhhc093blByb3BlcnR5LmNhbGwoY29sbGVjdGlvbiwga2V5KSkge1xuICAgIHJldHVybiBjb2xsZWN0aW9uO1xuICB9XG4gIHZhciBjb2xsZWN0aW9uQ29weSA9IHNoYWxsb3dDb3B5KGNvbGxlY3Rpb24pO1xuICBpZiAoQXJyYXkuaXNBcnJheShjb2xsZWN0aW9uQ29weSkpIHtcbiAgICBjb2xsZWN0aW9uQ29weS5zcGxpY2Uoa2V5LCAxKTtcbiAgfSBlbHNlIHtcbiAgICBkZWxldGUgY29sbGVjdGlvbkNvcHlba2V5XTtcbiAgfVxuICByZXR1cm4gY29sbGVjdGlvbkNvcHk7XG59XG5cbmZ1bmN0aW9uIHNldChjb2xsZWN0aW9uLCBrZXksIHZhbHVlKSB7XG4gIGlmICghaXNEYXRhU3RydWN0dXJlKGNvbGxlY3Rpb24pKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcbiAgICAgICdDYW5ub3QgdXBkYXRlIG5vbi1kYXRhLXN0cnVjdHVyZSB2YWx1ZTogJyArIGNvbGxlY3Rpb25cbiAgICApO1xuICB9XG4gIGlmIChpc0ltbXV0YWJsZShjb2xsZWN0aW9uKSkge1xuICAgIGlmICghY29sbGVjdGlvbi5zZXQpIHtcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXG4gICAgICAgICdDYW5ub3QgdXBkYXRlIGltbXV0YWJsZSB2YWx1ZSB3aXRob3V0IC5zZXQoKSBtZXRob2Q6ICcgKyBjb2xsZWN0aW9uXG4gICAgICApO1xuICAgIH1cbiAgICByZXR1cm4gY29sbGVjdGlvbi5zZXQoa2V5LCB2YWx1ZSk7XG4gIH1cbiAgaWYgKGhhc093blByb3BlcnR5LmNhbGwoY29sbGVjdGlvbiwga2V5KSAmJiB2YWx1ZSA9PT0gY29sbGVjdGlvbltrZXldKSB7XG4gICAgcmV0dXJuIGNvbGxlY3Rpb247XG4gIH1cbiAgdmFyIGNvbGxlY3Rpb25Db3B5ID0gc2hhbGxvd0NvcHkoY29sbGVjdGlvbik7XG4gIGNvbGxlY3Rpb25Db3B5W2tleV0gPSB2YWx1ZTtcbiAgcmV0dXJuIGNvbGxlY3Rpb25Db3B5O1xufVxuXG5mdW5jdGlvbiB1cGRhdGVJbiQxKGNvbGxlY3Rpb24sIGtleVBhdGgsIG5vdFNldFZhbHVlLCB1cGRhdGVyKSB7XG4gIGlmICghdXBkYXRlcikge1xuICAgIHVwZGF0ZXIgPSBub3RTZXRWYWx1ZTtcbiAgICBub3RTZXRWYWx1ZSA9IHVuZGVmaW5lZDtcbiAgfVxuICB2YXIgdXBkYXRlZFZhbHVlID0gdXBkYXRlSW5EZWVwbHkoXG4gICAgaXNJbW11dGFibGUoY29sbGVjdGlvbiksXG4gICAgY29sbGVjdGlvbixcbiAgICBjb2VyY2VLZXlQYXRoKGtleVBhdGgpLFxuICAgIDAsXG4gICAgbm90U2V0VmFsdWUsXG4gICAgdXBkYXRlclxuICApO1xuICByZXR1cm4gdXBkYXRlZFZhbHVlID09PSBOT1RfU0VUID8gbm90U2V0VmFsdWUgOiB1cGRhdGVkVmFsdWU7XG59XG5cbmZ1bmN0aW9uIHVwZGF0ZUluRGVlcGx5KFxuICBpbkltbXV0YWJsZSxcbiAgZXhpc3RpbmcsXG4gIGtleVBhdGgsXG4gIGksXG4gIG5vdFNldFZhbHVlLFxuICB1cGRhdGVyXG4pIHtcbiAgdmFyIHdhc05vdFNldCA9IGV4aXN0aW5nID09PSBOT1RfU0VUO1xuICBpZiAoaSA9PT0ga2V5UGF0aC5sZW5ndGgpIHtcbiAgICB2YXIgZXhpc3RpbmdWYWx1ZSA9IHdhc05vdFNldCA/IG5vdFNldFZhbHVlIDogZXhpc3Rpbmc7XG4gICAgdmFyIG5ld1ZhbHVlID0gdXBkYXRlcihleGlzdGluZ1ZhbHVlKTtcbiAgICByZXR1cm4gbmV3VmFsdWUgPT09IGV4aXN0aW5nVmFsdWUgPyBleGlzdGluZyA6IG5ld1ZhbHVlO1xuICB9XG4gIGlmICghd2FzTm90U2V0ICYmICFpc0RhdGFTdHJ1Y3R1cmUoZXhpc3RpbmcpKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcbiAgICAgICdDYW5ub3QgdXBkYXRlIHdpdGhpbiBub24tZGF0YS1zdHJ1Y3R1cmUgdmFsdWUgaW4gcGF0aCBbJyArXG4gICAgICAgIGtleVBhdGguc2xpY2UoMCwgaSkubWFwKHF1b3RlU3RyaW5nKSArXG4gICAgICAgICddOiAnICtcbiAgICAgICAgZXhpc3RpbmdcbiAgICApO1xuICB9XG4gIHZhciBrZXkgPSBrZXlQYXRoW2ldO1xuICB2YXIgbmV4dEV4aXN0aW5nID0gd2FzTm90U2V0ID8gTk9UX1NFVCA6IGdldChleGlzdGluZywga2V5LCBOT1RfU0VUKTtcbiAgdmFyIG5leHRVcGRhdGVkID0gdXBkYXRlSW5EZWVwbHkoXG4gICAgbmV4dEV4aXN0aW5nID09PSBOT1RfU0VUID8gaW5JbW11dGFibGUgOiBpc0ltbXV0YWJsZShuZXh0RXhpc3RpbmcpLFxuICAgIG5leHRFeGlzdGluZyxcbiAgICBrZXlQYXRoLFxuICAgIGkgKyAxLFxuICAgIG5vdFNldFZhbHVlLFxuICAgIHVwZGF0ZXJcbiAgKTtcbiAgcmV0dXJuIG5leHRVcGRhdGVkID09PSBuZXh0RXhpc3RpbmdcbiAgICA/IGV4aXN0aW5nXG4gICAgOiBuZXh0VXBkYXRlZCA9PT0gTk9UX1NFVFxuICAgID8gcmVtb3ZlKGV4aXN0aW5nLCBrZXkpXG4gICAgOiBzZXQoXG4gICAgICAgIHdhc05vdFNldCA/IChpbkltbXV0YWJsZSA/IGVtcHR5TWFwKCkgOiB7fSkgOiBleGlzdGluZyxcbiAgICAgICAga2V5LFxuICAgICAgICBuZXh0VXBkYXRlZFxuICAgICAgKTtcbn1cblxuZnVuY3Rpb24gc2V0SW4kMShjb2xsZWN0aW9uLCBrZXlQYXRoLCB2YWx1ZSkge1xuICByZXR1cm4gdXBkYXRlSW4kMShjb2xsZWN0aW9uLCBrZXlQYXRoLCBOT1RfU0VULCBmdW5jdGlvbiAoKSB7IHJldHVybiB2YWx1ZTsgfSk7XG59XG5cbmZ1bmN0aW9uIHNldEluKGtleVBhdGgsIHYpIHtcbiAgcmV0dXJuIHNldEluJDEodGhpcywga2V5UGF0aCwgdik7XG59XG5cbmZ1bmN0aW9uIHJlbW92ZUluKGNvbGxlY3Rpb24sIGtleVBhdGgpIHtcbiAgcmV0dXJuIHVwZGF0ZUluJDEoY29sbGVjdGlvbiwga2V5UGF0aCwgZnVuY3Rpb24gKCkgeyByZXR1cm4gTk9UX1NFVDsgfSk7XG59XG5cbmZ1bmN0aW9uIGRlbGV0ZUluKGtleVBhdGgpIHtcbiAgcmV0dXJuIHJlbW92ZUluKHRoaXMsIGtleVBhdGgpO1xufVxuXG5mdW5jdGlvbiB1cGRhdGUkMShjb2xsZWN0aW9uLCBrZXksIG5vdFNldFZhbHVlLCB1cGRhdGVyKSB7XG4gIHJldHVybiB1cGRhdGVJbiQxKGNvbGxlY3Rpb24sIFtrZXldLCBub3RTZXRWYWx1ZSwgdXBkYXRlcik7XG59XG5cbmZ1bmN0aW9uIHVwZGF0ZShrZXksIG5vdFNldFZhbHVlLCB1cGRhdGVyKSB7XG4gIHJldHVybiBhcmd1bWVudHMubGVuZ3RoID09PSAxXG4gICAgPyBrZXkodGhpcylcbiAgICA6IHVwZGF0ZSQxKHRoaXMsIGtleSwgbm90U2V0VmFsdWUsIHVwZGF0ZXIpO1xufVxuXG5mdW5jdGlvbiB1cGRhdGVJbihrZXlQYXRoLCBub3RTZXRWYWx1ZSwgdXBkYXRlcikge1xuICByZXR1cm4gdXBkYXRlSW4kMSh0aGlzLCBrZXlQYXRoLCBub3RTZXRWYWx1ZSwgdXBkYXRlcik7XG59XG5cbmZ1bmN0aW9uIG1lcmdlJDEoKSB7XG4gIHZhciBpdGVycyA9IFtdLCBsZW4gPSBhcmd1bWVudHMubGVuZ3RoO1xuICB3aGlsZSAoIGxlbi0tICkgaXRlcnNbIGxlbiBdID0gYXJndW1lbnRzWyBsZW4gXTtcblxuICByZXR1cm4gbWVyZ2VJbnRvS2V5ZWRXaXRoKHRoaXMsIGl0ZXJzKTtcbn1cblxuZnVuY3Rpb24gbWVyZ2VXaXRoJDEobWVyZ2VyKSB7XG4gIHZhciBpdGVycyA9IFtdLCBsZW4gPSBhcmd1bWVudHMubGVuZ3RoIC0gMTtcbiAgd2hpbGUgKCBsZW4tLSA+IDAgKSBpdGVyc1sgbGVuIF0gPSBhcmd1bWVudHNbIGxlbiArIDEgXTtcblxuICBpZiAodHlwZW9mIG1lcmdlciAhPT0gJ2Z1bmN0aW9uJykge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0ludmFsaWQgbWVyZ2VyIGZ1bmN0aW9uOiAnICsgbWVyZ2VyKTtcbiAgfVxuICByZXR1cm4gbWVyZ2VJbnRvS2V5ZWRXaXRoKHRoaXMsIGl0ZXJzLCBtZXJnZXIpO1xufVxuXG5mdW5jdGlvbiBtZXJnZUludG9LZXllZFdpdGgoY29sbGVjdGlvbiwgY29sbGVjdGlvbnMsIG1lcmdlcikge1xuICB2YXIgaXRlcnMgPSBbXTtcbiAgZm9yICh2YXIgaWkgPSAwOyBpaSA8IGNvbGxlY3Rpb25zLmxlbmd0aDsgaWkrKykge1xuICAgIHZhciBjb2xsZWN0aW9uJDEgPSBLZXllZENvbGxlY3Rpb24oY29sbGVjdGlvbnNbaWldKTtcbiAgICBpZiAoY29sbGVjdGlvbiQxLnNpemUgIT09IDApIHtcbiAgICAgIGl0ZXJzLnB1c2goY29sbGVjdGlvbiQxKTtcbiAgICB9XG4gIH1cbiAgaWYgKGl0ZXJzLmxlbmd0aCA9PT0gMCkge1xuICAgIHJldHVybiBjb2xsZWN0aW9uO1xuICB9XG4gIGlmIChcbiAgICBjb2xsZWN0aW9uLnRvU2VxKCkuc2l6ZSA9PT0gMCAmJlxuICAgICFjb2xsZWN0aW9uLl9fb3duZXJJRCAmJlxuICAgIGl0ZXJzLmxlbmd0aCA9PT0gMVxuICApIHtcbiAgICByZXR1cm4gY29sbGVjdGlvbi5jb25zdHJ1Y3RvcihpdGVyc1swXSk7XG4gIH1cbiAgcmV0dXJuIGNvbGxlY3Rpb24ud2l0aE11dGF0aW9ucyhmdW5jdGlvbiAoY29sbGVjdGlvbikge1xuICAgIHZhciBtZXJnZUludG9Db2xsZWN0aW9uID0gbWVyZ2VyXG4gICAgICA/IGZ1bmN0aW9uICh2YWx1ZSwga2V5KSB7XG4gICAgICAgICAgdXBkYXRlJDEoY29sbGVjdGlvbiwga2V5LCBOT1RfU0VULCBmdW5jdGlvbiAob2xkVmFsKSB7IHJldHVybiBvbGRWYWwgPT09IE5PVF9TRVQgPyB2YWx1ZSA6IG1lcmdlcihvbGRWYWwsIHZhbHVlLCBrZXkpOyB9XG4gICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgICAgOiBmdW5jdGlvbiAodmFsdWUsIGtleSkge1xuICAgICAgICAgIGNvbGxlY3Rpb24uc2V0KGtleSwgdmFsdWUpO1xuICAgICAgICB9O1xuICAgIGZvciAodmFyIGlpID0gMDsgaWkgPCBpdGVycy5sZW5ndGg7IGlpKyspIHtcbiAgICAgIGl0ZXJzW2lpXS5mb3JFYWNoKG1lcmdlSW50b0NvbGxlY3Rpb24pO1xuICAgIH1cbiAgfSk7XG59XG5cbmZ1bmN0aW9uIG1lcmdlKGNvbGxlY3Rpb24pIHtcbiAgdmFyIHNvdXJjZXMgPSBbXSwgbGVuID0gYXJndW1lbnRzLmxlbmd0aCAtIDE7XG4gIHdoaWxlICggbGVuLS0gPiAwICkgc291cmNlc1sgbGVuIF0gPSBhcmd1bWVudHNbIGxlbiArIDEgXTtcblxuICByZXR1cm4gbWVyZ2VXaXRoU291cmNlcyhjb2xsZWN0aW9uLCBzb3VyY2VzKTtcbn1cblxuZnVuY3Rpb24gbWVyZ2VXaXRoKG1lcmdlciwgY29sbGVjdGlvbikge1xuICB2YXIgc291cmNlcyA9IFtdLCBsZW4gPSBhcmd1bWVudHMubGVuZ3RoIC0gMjtcbiAgd2hpbGUgKCBsZW4tLSA+IDAgKSBzb3VyY2VzWyBsZW4gXSA9IGFyZ3VtZW50c1sgbGVuICsgMiBdO1xuXG4gIHJldHVybiBtZXJnZVdpdGhTb3VyY2VzKGNvbGxlY3Rpb24sIHNvdXJjZXMsIG1lcmdlcik7XG59XG5cbmZ1bmN0aW9uIG1lcmdlRGVlcCQxKGNvbGxlY3Rpb24pIHtcbiAgdmFyIHNvdXJjZXMgPSBbXSwgbGVuID0gYXJndW1lbnRzLmxlbmd0aCAtIDE7XG4gIHdoaWxlICggbGVuLS0gPiAwICkgc291cmNlc1sgbGVuIF0gPSBhcmd1bWVudHNbIGxlbiArIDEgXTtcblxuICByZXR1cm4gbWVyZ2VEZWVwV2l0aFNvdXJjZXMoY29sbGVjdGlvbiwgc291cmNlcyk7XG59XG5cbmZ1bmN0aW9uIG1lcmdlRGVlcFdpdGgkMShtZXJnZXIsIGNvbGxlY3Rpb24pIHtcbiAgdmFyIHNvdXJjZXMgPSBbXSwgbGVuID0gYXJndW1lbnRzLmxlbmd0aCAtIDI7XG4gIHdoaWxlICggbGVuLS0gPiAwICkgc291cmNlc1sgbGVuIF0gPSBhcmd1bWVudHNbIGxlbiArIDIgXTtcblxuICByZXR1cm4gbWVyZ2VEZWVwV2l0aFNvdXJjZXMoY29sbGVjdGlvbiwgc291cmNlcywgbWVyZ2VyKTtcbn1cblxuZnVuY3Rpb24gbWVyZ2VEZWVwV2l0aFNvdXJjZXMoY29sbGVjdGlvbiwgc291cmNlcywgbWVyZ2VyKSB7XG4gIHJldHVybiBtZXJnZVdpdGhTb3VyY2VzKGNvbGxlY3Rpb24sIHNvdXJjZXMsIGRlZXBNZXJnZXJXaXRoKG1lcmdlcikpO1xufVxuXG5mdW5jdGlvbiBtZXJnZVdpdGhTb3VyY2VzKGNvbGxlY3Rpb24sIHNvdXJjZXMsIG1lcmdlcikge1xuICBpZiAoIWlzRGF0YVN0cnVjdHVyZShjb2xsZWN0aW9uKSkge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXG4gICAgICAnQ2Fubm90IG1lcmdlIGludG8gbm9uLWRhdGEtc3RydWN0dXJlIHZhbHVlOiAnICsgY29sbGVjdGlvblxuICAgICk7XG4gIH1cbiAgaWYgKGlzSW1tdXRhYmxlKGNvbGxlY3Rpb24pKSB7XG4gICAgcmV0dXJuIHR5cGVvZiBtZXJnZXIgPT09ICdmdW5jdGlvbicgJiYgY29sbGVjdGlvbi5tZXJnZVdpdGhcbiAgICAgID8gY29sbGVjdGlvbi5tZXJnZVdpdGguYXBwbHkoY29sbGVjdGlvbiwgWyBtZXJnZXIgXS5jb25jYXQoIHNvdXJjZXMgKSlcbiAgICAgIDogY29sbGVjdGlvbi5tZXJnZVxuICAgICAgPyBjb2xsZWN0aW9uLm1lcmdlLmFwcGx5KGNvbGxlY3Rpb24sIHNvdXJjZXMpXG4gICAgICA6IGNvbGxlY3Rpb24uY29uY2F0LmFwcGx5KGNvbGxlY3Rpb24sIHNvdXJjZXMpO1xuICB9XG4gIHZhciBpc0FycmF5ID0gQXJyYXkuaXNBcnJheShjb2xsZWN0aW9uKTtcbiAgdmFyIG1lcmdlZCA9IGNvbGxlY3Rpb247XG4gIHZhciBDb2xsZWN0aW9uID0gaXNBcnJheSA/IEluZGV4ZWRDb2xsZWN0aW9uIDogS2V5ZWRDb2xsZWN0aW9uO1xuICB2YXIgbWVyZ2VJdGVtID0gaXNBcnJheVxuICAgID8gZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgIC8vIENvcHkgb24gd3JpdGVcbiAgICAgICAgaWYgKG1lcmdlZCA9PT0gY29sbGVjdGlvbikge1xuICAgICAgICAgIG1lcmdlZCA9IHNoYWxsb3dDb3B5KG1lcmdlZCk7XG4gICAgICAgIH1cbiAgICAgICAgbWVyZ2VkLnB1c2godmFsdWUpO1xuICAgICAgfVxuICAgIDogZnVuY3Rpb24gKHZhbHVlLCBrZXkpIHtcbiAgICAgICAgdmFyIGhhc1ZhbCA9IGhhc093blByb3BlcnR5LmNhbGwobWVyZ2VkLCBrZXkpO1xuICAgICAgICB2YXIgbmV4dFZhbCA9XG4gICAgICAgICAgaGFzVmFsICYmIG1lcmdlciA/IG1lcmdlcihtZXJnZWRba2V5XSwgdmFsdWUsIGtleSkgOiB2YWx1ZTtcbiAgICAgICAgaWYgKCFoYXNWYWwgfHwgbmV4dFZhbCAhPT0gbWVyZ2VkW2tleV0pIHtcbiAgICAgICAgICAvLyBDb3B5IG9uIHdyaXRlXG4gICAgICAgICAgaWYgKG1lcmdlZCA9PT0gY29sbGVjdGlvbikge1xuICAgICAgICAgICAgbWVyZ2VkID0gc2hhbGxvd0NvcHkobWVyZ2VkKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgbWVyZ2VkW2tleV0gPSBuZXh0VmFsO1xuICAgICAgICB9XG4gICAgICB9O1xuICBmb3IgKHZhciBpID0gMDsgaSA8IHNvdXJjZXMubGVuZ3RoOyBpKyspIHtcbiAgICBDb2xsZWN0aW9uKHNvdXJjZXNbaV0pLmZvckVhY2gobWVyZ2VJdGVtKTtcbiAgfVxuICByZXR1cm4gbWVyZ2VkO1xufVxuXG5mdW5jdGlvbiBkZWVwTWVyZ2VyV2l0aChtZXJnZXIpIHtcbiAgZnVuY3Rpb24gZGVlcE1lcmdlcihvbGRWYWx1ZSwgbmV3VmFsdWUsIGtleSkge1xuICAgIHJldHVybiBpc0RhdGFTdHJ1Y3R1cmUob2xkVmFsdWUpICYmXG4gICAgICBpc0RhdGFTdHJ1Y3R1cmUobmV3VmFsdWUpICYmXG4gICAgICBhcmVNZXJnZWFibGUob2xkVmFsdWUsIG5ld1ZhbHVlKVxuICAgICAgPyBtZXJnZVdpdGhTb3VyY2VzKG9sZFZhbHVlLCBbbmV3VmFsdWVdLCBkZWVwTWVyZ2VyKVxuICAgICAgOiBtZXJnZXJcbiAgICAgID8gbWVyZ2VyKG9sZFZhbHVlLCBuZXdWYWx1ZSwga2V5KVxuICAgICAgOiBuZXdWYWx1ZTtcbiAgfVxuICByZXR1cm4gZGVlcE1lcmdlcjtcbn1cblxuLyoqXG4gKiBJdCdzIHVuY2xlYXIgd2hhdCB0aGUgZGVzaXJlZCBiZWhhdmlvciBpcyBmb3IgbWVyZ2luZyB0d28gY29sbGVjdGlvbnMgdGhhdFxuICogZmFsbCBpbnRvIHNlcGFyYXRlIGNhdGVnb3JpZXMgYmV0d2VlbiBrZXllZCwgaW5kZXhlZCwgb3Igc2V0LWxpa2UsIHNvIHdlIG9ubHlcbiAqIGNvbnNpZGVyIHRoZW0gbWVyZ2VhYmxlIGlmIHRoZXkgZmFsbCBpbnRvIHRoZSBzYW1lIGNhdGVnb3J5LlxuICovXG5mdW5jdGlvbiBhcmVNZXJnZWFibGUob2xkRGF0YVN0cnVjdHVyZSwgbmV3RGF0YVN0cnVjdHVyZSkge1xuICB2YXIgb2xkU2VxID0gU2VxKG9sZERhdGFTdHJ1Y3R1cmUpO1xuICB2YXIgbmV3U2VxID0gU2VxKG5ld0RhdGFTdHJ1Y3R1cmUpO1xuICAvLyBUaGlzIGxvZ2ljIGFzc3VtZXMgdGhhdCBhIHNlcXVlbmNlIGNhbiBvbmx5IGZhbGwgaW50byBvbmUgb2YgdGhlIHRocmVlXG4gIC8vIGNhdGVnb3JpZXMgbWVudGlvbmVkIGFib3ZlIChzaW5jZSB0aGVyZSdzIG5vIGBpc1NldExpa2UoKWAgbWV0aG9kKS5cbiAgcmV0dXJuIChcbiAgICBpc0luZGV4ZWQob2xkU2VxKSA9PT0gaXNJbmRleGVkKG5ld1NlcSkgJiZcbiAgICBpc0tleWVkKG9sZFNlcSkgPT09IGlzS2V5ZWQobmV3U2VxKVxuICApO1xufVxuXG5mdW5jdGlvbiBtZXJnZURlZXAoKSB7XG4gIHZhciBpdGVycyA9IFtdLCBsZW4gPSBhcmd1bWVudHMubGVuZ3RoO1xuICB3aGlsZSAoIGxlbi0tICkgaXRlcnNbIGxlbiBdID0gYXJndW1lbnRzWyBsZW4gXTtcblxuICByZXR1cm4gbWVyZ2VEZWVwV2l0aFNvdXJjZXModGhpcywgaXRlcnMpO1xufVxuXG5mdW5jdGlvbiBtZXJnZURlZXBXaXRoKG1lcmdlcikge1xuICB2YXIgaXRlcnMgPSBbXSwgbGVuID0gYXJndW1lbnRzLmxlbmd0aCAtIDE7XG4gIHdoaWxlICggbGVuLS0gPiAwICkgaXRlcnNbIGxlbiBdID0gYXJndW1lbnRzWyBsZW4gKyAxIF07XG5cbiAgcmV0dXJuIG1lcmdlRGVlcFdpdGhTb3VyY2VzKHRoaXMsIGl0ZXJzLCBtZXJnZXIpO1xufVxuXG5mdW5jdGlvbiBtZXJnZUluKGtleVBhdGgpIHtcbiAgdmFyIGl0ZXJzID0gW10sIGxlbiA9IGFyZ3VtZW50cy5sZW5ndGggLSAxO1xuICB3aGlsZSAoIGxlbi0tID4gMCApIGl0ZXJzWyBsZW4gXSA9IGFyZ3VtZW50c1sgbGVuICsgMSBdO1xuXG4gIHJldHVybiB1cGRhdGVJbiQxKHRoaXMsIGtleVBhdGgsIGVtcHR5TWFwKCksIGZ1bmN0aW9uIChtKSB7IHJldHVybiBtZXJnZVdpdGhTb3VyY2VzKG0sIGl0ZXJzKTsgfSk7XG59XG5cbmZ1bmN0aW9uIG1lcmdlRGVlcEluKGtleVBhdGgpIHtcbiAgdmFyIGl0ZXJzID0gW10sIGxlbiA9IGFyZ3VtZW50cy5sZW5ndGggLSAxO1xuICB3aGlsZSAoIGxlbi0tID4gMCApIGl0ZXJzWyBsZW4gXSA9IGFyZ3VtZW50c1sgbGVuICsgMSBdO1xuXG4gIHJldHVybiB1cGRhdGVJbiQxKHRoaXMsIGtleVBhdGgsIGVtcHR5TWFwKCksIGZ1bmN0aW9uIChtKSB7IHJldHVybiBtZXJnZURlZXBXaXRoU291cmNlcyhtLCBpdGVycyk7IH1cbiAgKTtcbn1cblxuZnVuY3Rpb24gd2l0aE11dGF0aW9ucyhmbikge1xuICB2YXIgbXV0YWJsZSA9IHRoaXMuYXNNdXRhYmxlKCk7XG4gIGZuKG11dGFibGUpO1xuICByZXR1cm4gbXV0YWJsZS53YXNBbHRlcmVkKCkgPyBtdXRhYmxlLl9fZW5zdXJlT3duZXIodGhpcy5fX293bmVySUQpIDogdGhpcztcbn1cblxuZnVuY3Rpb24gYXNNdXRhYmxlKCkge1xuICByZXR1cm4gdGhpcy5fX293bmVySUQgPyB0aGlzIDogdGhpcy5fX2Vuc3VyZU93bmVyKG5ldyBPd25lcklEKCkpO1xufVxuXG5mdW5jdGlvbiBhc0ltbXV0YWJsZSgpIHtcbiAgcmV0dXJuIHRoaXMuX19lbnN1cmVPd25lcigpO1xufVxuXG5mdW5jdGlvbiB3YXNBbHRlcmVkKCkge1xuICByZXR1cm4gdGhpcy5fX2FsdGVyZWQ7XG59XG5cbnZhciBNYXAgPSAvKkBfX1BVUkVfXyovKGZ1bmN0aW9uIChLZXllZENvbGxlY3Rpb24pIHtcbiAgZnVuY3Rpb24gTWFwKHZhbHVlKSB7XG4gICAgcmV0dXJuIHZhbHVlID09PSB1bmRlZmluZWQgfHwgdmFsdWUgPT09IG51bGxcbiAgICAgID8gZW1wdHlNYXAoKVxuICAgICAgOiBpc01hcCh2YWx1ZSkgJiYgIWlzT3JkZXJlZCh2YWx1ZSlcbiAgICAgID8gdmFsdWVcbiAgICAgIDogZW1wdHlNYXAoKS53aXRoTXV0YXRpb25zKGZ1bmN0aW9uIChtYXApIHtcbiAgICAgICAgICB2YXIgaXRlciA9IEtleWVkQ29sbGVjdGlvbih2YWx1ZSk7XG4gICAgICAgICAgYXNzZXJ0Tm90SW5maW5pdGUoaXRlci5zaXplKTtcbiAgICAgICAgICBpdGVyLmZvckVhY2goZnVuY3Rpb24gKHYsIGspIHsgcmV0dXJuIG1hcC5zZXQoaywgdik7IH0pO1xuICAgICAgICB9KTtcbiAgfVxuXG4gIGlmICggS2V5ZWRDb2xsZWN0aW9uICkgTWFwLl9fcHJvdG9fXyA9IEtleWVkQ29sbGVjdGlvbjtcbiAgTWFwLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoIEtleWVkQ29sbGVjdGlvbiAmJiBLZXllZENvbGxlY3Rpb24ucHJvdG90eXBlICk7XG4gIE1hcC5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBNYXA7XG5cbiAgTWFwLm9mID0gZnVuY3Rpb24gb2YgKCkge1xuICAgIHZhciBrZXlWYWx1ZXMgPSBbXSwgbGVuID0gYXJndW1lbnRzLmxlbmd0aDtcbiAgICB3aGlsZSAoIGxlbi0tICkga2V5VmFsdWVzWyBsZW4gXSA9IGFyZ3VtZW50c1sgbGVuIF07XG5cbiAgICByZXR1cm4gZW1wdHlNYXAoKS53aXRoTXV0YXRpb25zKGZ1bmN0aW9uIChtYXApIHtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwga2V5VmFsdWVzLmxlbmd0aDsgaSArPSAyKSB7XG4gICAgICAgIGlmIChpICsgMSA+PSBrZXlWYWx1ZXMubGVuZ3RoKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdNaXNzaW5nIHZhbHVlIGZvciBrZXk6ICcgKyBrZXlWYWx1ZXNbaV0pO1xuICAgICAgICB9XG4gICAgICAgIG1hcC5zZXQoa2V5VmFsdWVzW2ldLCBrZXlWYWx1ZXNbaSArIDFdKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfTtcblxuICBNYXAucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24gdG9TdHJpbmcgKCkge1xuICAgIHJldHVybiB0aGlzLl9fdG9TdHJpbmcoJ01hcCB7JywgJ30nKTtcbiAgfTtcblxuICAvLyBAcHJhZ21hIEFjY2Vzc1xuXG4gIE1hcC5wcm90b3R5cGUuZ2V0ID0gZnVuY3Rpb24gZ2V0IChrLCBub3RTZXRWYWx1ZSkge1xuICAgIHJldHVybiB0aGlzLl9yb290XG4gICAgICA/IHRoaXMuX3Jvb3QuZ2V0KDAsIHVuZGVmaW5lZCwgaywgbm90U2V0VmFsdWUpXG4gICAgICA6IG5vdFNldFZhbHVlO1xuICB9O1xuXG4gIC8vIEBwcmFnbWEgTW9kaWZpY2F0aW9uXG5cbiAgTWFwLnByb3RvdHlwZS5zZXQgPSBmdW5jdGlvbiBzZXQgKGssIHYpIHtcbiAgICByZXR1cm4gdXBkYXRlTWFwKHRoaXMsIGssIHYpO1xuICB9O1xuXG4gIE1hcC5wcm90b3R5cGUucmVtb3ZlID0gZnVuY3Rpb24gcmVtb3ZlIChrKSB7XG4gICAgcmV0dXJuIHVwZGF0ZU1hcCh0aGlzLCBrLCBOT1RfU0VUKTtcbiAgfTtcblxuICBNYXAucHJvdG90eXBlLmRlbGV0ZUFsbCA9IGZ1bmN0aW9uIGRlbGV0ZUFsbCAoa2V5cykge1xuICAgIHZhciBjb2xsZWN0aW9uID0gQ29sbGVjdGlvbihrZXlzKTtcblxuICAgIGlmIChjb2xsZWN0aW9uLnNpemUgPT09IDApIHtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzLndpdGhNdXRhdGlvbnMoZnVuY3Rpb24gKG1hcCkge1xuICAgICAgY29sbGVjdGlvbi5mb3JFYWNoKGZ1bmN0aW9uIChrZXkpIHsgcmV0dXJuIG1hcC5yZW1vdmUoa2V5KTsgfSk7XG4gICAgfSk7XG4gIH07XG5cbiAgTWFwLnByb3RvdHlwZS5jbGVhciA9IGZ1bmN0aW9uIGNsZWFyICgpIHtcbiAgICBpZiAodGhpcy5zaXplID09PSAwKSB7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9XG4gICAgaWYgKHRoaXMuX19vd25lcklEKSB7XG4gICAgICB0aGlzLnNpemUgPSAwO1xuICAgICAgdGhpcy5fcm9vdCA9IG51bGw7XG4gICAgICB0aGlzLl9faGFzaCA9IHVuZGVmaW5lZDtcbiAgICAgIHRoaXMuX19hbHRlcmVkID0gdHJ1ZTtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbiAgICByZXR1cm4gZW1wdHlNYXAoKTtcbiAgfTtcblxuICAvLyBAcHJhZ21hIENvbXBvc2l0aW9uXG5cbiAgTWFwLnByb3RvdHlwZS5zb3J0ID0gZnVuY3Rpb24gc29ydCAoY29tcGFyYXRvcikge1xuICAgIC8vIExhdGUgYmluZGluZ1xuICAgIHJldHVybiBPcmRlcmVkTWFwKHNvcnRGYWN0b3J5KHRoaXMsIGNvbXBhcmF0b3IpKTtcbiAgfTtcblxuICBNYXAucHJvdG90eXBlLnNvcnRCeSA9IGZ1bmN0aW9uIHNvcnRCeSAobWFwcGVyLCBjb21wYXJhdG9yKSB7XG4gICAgLy8gTGF0ZSBiaW5kaW5nXG4gICAgcmV0dXJuIE9yZGVyZWRNYXAoc29ydEZhY3RvcnkodGhpcywgY29tcGFyYXRvciwgbWFwcGVyKSk7XG4gIH07XG5cbiAgTWFwLnByb3RvdHlwZS5tYXAgPSBmdW5jdGlvbiBtYXAgKG1hcHBlciwgY29udGV4dCkge1xuICAgIHZhciB0aGlzJDEkMSA9IHRoaXM7XG5cbiAgICByZXR1cm4gdGhpcy53aXRoTXV0YXRpb25zKGZ1bmN0aW9uIChtYXApIHtcbiAgICAgIG1hcC5mb3JFYWNoKGZ1bmN0aW9uICh2YWx1ZSwga2V5KSB7XG4gICAgICAgIG1hcC5zZXQoa2V5LCBtYXBwZXIuY2FsbChjb250ZXh0LCB2YWx1ZSwga2V5LCB0aGlzJDEkMSkpO1xuICAgICAgfSk7XG4gICAgfSk7XG4gIH07XG5cbiAgLy8gQHByYWdtYSBNdXRhYmlsaXR5XG5cbiAgTWFwLnByb3RvdHlwZS5fX2l0ZXJhdG9yID0gZnVuY3Rpb24gX19pdGVyYXRvciAodHlwZSwgcmV2ZXJzZSkge1xuICAgIHJldHVybiBuZXcgTWFwSXRlcmF0b3IodGhpcywgdHlwZSwgcmV2ZXJzZSk7XG4gIH07XG5cbiAgTWFwLnByb3RvdHlwZS5fX2l0ZXJhdGUgPSBmdW5jdGlvbiBfX2l0ZXJhdGUgKGZuLCByZXZlcnNlKSB7XG4gICAgdmFyIHRoaXMkMSQxID0gdGhpcztcblxuICAgIHZhciBpdGVyYXRpb25zID0gMDtcbiAgICB0aGlzLl9yb290ICYmXG4gICAgICB0aGlzLl9yb290Lml0ZXJhdGUoZnVuY3Rpb24gKGVudHJ5KSB7XG4gICAgICAgIGl0ZXJhdGlvbnMrKztcbiAgICAgICAgcmV0dXJuIGZuKGVudHJ5WzFdLCBlbnRyeVswXSwgdGhpcyQxJDEpO1xuICAgICAgfSwgcmV2ZXJzZSk7XG4gICAgcmV0dXJuIGl0ZXJhdGlvbnM7XG4gIH07XG5cbiAgTWFwLnByb3RvdHlwZS5fX2Vuc3VyZU93bmVyID0gZnVuY3Rpb24gX19lbnN1cmVPd25lciAob3duZXJJRCkge1xuICAgIGlmIChvd25lcklEID09PSB0aGlzLl9fb3duZXJJRCkge1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuICAgIGlmICghb3duZXJJRCkge1xuICAgICAgaWYgKHRoaXMuc2l6ZSA9PT0gMCkge1xuICAgICAgICByZXR1cm4gZW1wdHlNYXAoKTtcbiAgICAgIH1cbiAgICAgIHRoaXMuX19vd25lcklEID0gb3duZXJJRDtcbiAgICAgIHRoaXMuX19hbHRlcmVkID0gZmFsc2U7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9XG4gICAgcmV0dXJuIG1ha2VNYXAodGhpcy5zaXplLCB0aGlzLl9yb290LCBvd25lcklELCB0aGlzLl9faGFzaCk7XG4gIH07XG5cbiAgcmV0dXJuIE1hcDtcbn0oS2V5ZWRDb2xsZWN0aW9uKSk7XG5cbk1hcC5pc01hcCA9IGlzTWFwO1xuXG52YXIgTWFwUHJvdG90eXBlID0gTWFwLnByb3RvdHlwZTtcbk1hcFByb3RvdHlwZVtJU19NQVBfU1lNQk9MXSA9IHRydWU7XG5NYXBQcm90b3R5cGVbREVMRVRFXSA9IE1hcFByb3RvdHlwZS5yZW1vdmU7XG5NYXBQcm90b3R5cGUucmVtb3ZlQWxsID0gTWFwUHJvdG90eXBlLmRlbGV0ZUFsbDtcbk1hcFByb3RvdHlwZS5zZXRJbiA9IHNldEluO1xuTWFwUHJvdG90eXBlLnJlbW92ZUluID0gTWFwUHJvdG90eXBlLmRlbGV0ZUluID0gZGVsZXRlSW47XG5NYXBQcm90b3R5cGUudXBkYXRlID0gdXBkYXRlO1xuTWFwUHJvdG90eXBlLnVwZGF0ZUluID0gdXBkYXRlSW47XG5NYXBQcm90b3R5cGUubWVyZ2UgPSBNYXBQcm90b3R5cGUuY29uY2F0ID0gbWVyZ2UkMTtcbk1hcFByb3RvdHlwZS5tZXJnZVdpdGggPSBtZXJnZVdpdGgkMTtcbk1hcFByb3RvdHlwZS5tZXJnZURlZXAgPSBtZXJnZURlZXA7XG5NYXBQcm90b3R5cGUubWVyZ2VEZWVwV2l0aCA9IG1lcmdlRGVlcFdpdGg7XG5NYXBQcm90b3R5cGUubWVyZ2VJbiA9IG1lcmdlSW47XG5NYXBQcm90b3R5cGUubWVyZ2VEZWVwSW4gPSBtZXJnZURlZXBJbjtcbk1hcFByb3RvdHlwZS53aXRoTXV0YXRpb25zID0gd2l0aE11dGF0aW9ucztcbk1hcFByb3RvdHlwZS53YXNBbHRlcmVkID0gd2FzQWx0ZXJlZDtcbk1hcFByb3RvdHlwZS5hc0ltbXV0YWJsZSA9IGFzSW1tdXRhYmxlO1xuTWFwUHJvdG90eXBlWydAQHRyYW5zZHVjZXIvaW5pdCddID0gTWFwUHJvdG90eXBlLmFzTXV0YWJsZSA9IGFzTXV0YWJsZTtcbk1hcFByb3RvdHlwZVsnQEB0cmFuc2R1Y2VyL3N0ZXAnXSA9IGZ1bmN0aW9uIChyZXN1bHQsIGFycikge1xuICByZXR1cm4gcmVzdWx0LnNldChhcnJbMF0sIGFyclsxXSk7XG59O1xuTWFwUHJvdG90eXBlWydAQHRyYW5zZHVjZXIvcmVzdWx0J10gPSBmdW5jdGlvbiAob2JqKSB7XG4gIHJldHVybiBvYmouYXNJbW11dGFibGUoKTtcbn07XG5cbi8vICNwcmFnbWEgVHJpZSBOb2Rlc1xuXG52YXIgQXJyYXlNYXBOb2RlID0gZnVuY3Rpb24gQXJyYXlNYXBOb2RlKG93bmVySUQsIGVudHJpZXMpIHtcbiAgdGhpcy5vd25lcklEID0gb3duZXJJRDtcbiAgdGhpcy5lbnRyaWVzID0gZW50cmllcztcbn07XG5cbkFycmF5TWFwTm9kZS5wcm90b3R5cGUuZ2V0ID0gZnVuY3Rpb24gZ2V0IChzaGlmdCwga2V5SGFzaCwga2V5LCBub3RTZXRWYWx1ZSkge1xuICB2YXIgZW50cmllcyA9IHRoaXMuZW50cmllcztcbiAgZm9yICh2YXIgaWkgPSAwLCBsZW4gPSBlbnRyaWVzLmxlbmd0aDsgaWkgPCBsZW47IGlpKyspIHtcbiAgICBpZiAoaXMoa2V5LCBlbnRyaWVzW2lpXVswXSkpIHtcbiAgICAgIHJldHVybiBlbnRyaWVzW2lpXVsxXTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIG5vdFNldFZhbHVlO1xufTtcblxuQXJyYXlNYXBOb2RlLnByb3RvdHlwZS51cGRhdGUgPSBmdW5jdGlvbiB1cGRhdGUgKG93bmVySUQsIHNoaWZ0LCBrZXlIYXNoLCBrZXksIHZhbHVlLCBkaWRDaGFuZ2VTaXplLCBkaWRBbHRlcikge1xuICB2YXIgcmVtb3ZlZCA9IHZhbHVlID09PSBOT1RfU0VUO1xuXG4gIHZhciBlbnRyaWVzID0gdGhpcy5lbnRyaWVzO1xuICB2YXIgaWR4ID0gMDtcbiAgdmFyIGxlbiA9IGVudHJpZXMubGVuZ3RoO1xuICBmb3IgKDsgaWR4IDwgbGVuOyBpZHgrKykge1xuICAgIGlmIChpcyhrZXksIGVudHJpZXNbaWR4XVswXSkpIHtcbiAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxuICB2YXIgZXhpc3RzID0gaWR4IDwgbGVuO1xuXG4gIGlmIChleGlzdHMgPyBlbnRyaWVzW2lkeF1bMV0gPT09IHZhbHVlIDogcmVtb3ZlZCkge1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgU2V0UmVmKGRpZEFsdGVyKTtcbiAgKHJlbW92ZWQgfHwgIWV4aXN0cykgJiYgU2V0UmVmKGRpZENoYW5nZVNpemUpO1xuXG4gIGlmIChyZW1vdmVkICYmIGVudHJpZXMubGVuZ3RoID09PSAxKSB7XG4gICAgcmV0dXJuOyAvLyB1bmRlZmluZWRcbiAgfVxuXG4gIGlmICghZXhpc3RzICYmICFyZW1vdmVkICYmIGVudHJpZXMubGVuZ3RoID49IE1BWF9BUlJBWV9NQVBfU0laRSkge1xuICAgIHJldHVybiBjcmVhdGVOb2Rlcyhvd25lcklELCBlbnRyaWVzLCBrZXksIHZhbHVlKTtcbiAgfVxuXG4gIHZhciBpc0VkaXRhYmxlID0gb3duZXJJRCAmJiBvd25lcklEID09PSB0aGlzLm93bmVySUQ7XG4gIHZhciBuZXdFbnRyaWVzID0gaXNFZGl0YWJsZSA/IGVudHJpZXMgOiBhcnJDb3B5KGVudHJpZXMpO1xuXG4gIGlmIChleGlzdHMpIHtcbiAgICBpZiAocmVtb3ZlZCkge1xuICAgICAgaWR4ID09PSBsZW4gLSAxXG4gICAgICAgID8gbmV3RW50cmllcy5wb3AoKVxuICAgICAgICA6IChuZXdFbnRyaWVzW2lkeF0gPSBuZXdFbnRyaWVzLnBvcCgpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgbmV3RW50cmllc1tpZHhdID0gW2tleSwgdmFsdWVdO1xuICAgIH1cbiAgfSBlbHNlIHtcbiAgICBuZXdFbnRyaWVzLnB1c2goW2tleSwgdmFsdWVdKTtcbiAgfVxuXG4gIGlmIChpc0VkaXRhYmxlKSB7XG4gICAgdGhpcy5lbnRyaWVzID0gbmV3RW50cmllcztcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIHJldHVybiBuZXcgQXJyYXlNYXBOb2RlKG93bmVySUQsIG5ld0VudHJpZXMpO1xufTtcblxudmFyIEJpdG1hcEluZGV4ZWROb2RlID0gZnVuY3Rpb24gQml0bWFwSW5kZXhlZE5vZGUob3duZXJJRCwgYml0bWFwLCBub2Rlcykge1xuICB0aGlzLm93bmVySUQgPSBvd25lcklEO1xuICB0aGlzLmJpdG1hcCA9IGJpdG1hcDtcbiAgdGhpcy5ub2RlcyA9IG5vZGVzO1xufTtcblxuQml0bWFwSW5kZXhlZE5vZGUucHJvdG90eXBlLmdldCA9IGZ1bmN0aW9uIGdldCAoc2hpZnQsIGtleUhhc2gsIGtleSwgbm90U2V0VmFsdWUpIHtcbiAgaWYgKGtleUhhc2ggPT09IHVuZGVmaW5lZCkge1xuICAgIGtleUhhc2ggPSBoYXNoKGtleSk7XG4gIH1cbiAgdmFyIGJpdCA9IDEgPDwgKChzaGlmdCA9PT0gMCA/IGtleUhhc2ggOiBrZXlIYXNoID4+PiBzaGlmdCkgJiBNQVNLKTtcbiAgdmFyIGJpdG1hcCA9IHRoaXMuYml0bWFwO1xuICByZXR1cm4gKGJpdG1hcCAmIGJpdCkgPT09IDBcbiAgICA/IG5vdFNldFZhbHVlXG4gICAgOiB0aGlzLm5vZGVzW3BvcENvdW50KGJpdG1hcCAmIChiaXQgLSAxKSldLmdldChcbiAgICAgICAgc2hpZnQgKyBTSElGVCxcbiAgICAgICAga2V5SGFzaCxcbiAgICAgICAga2V5LFxuICAgICAgICBub3RTZXRWYWx1ZVxuICAgICAgKTtcbn07XG5cbkJpdG1hcEluZGV4ZWROb2RlLnByb3RvdHlwZS51cGRhdGUgPSBmdW5jdGlvbiB1cGRhdGUgKG93bmVySUQsIHNoaWZ0LCBrZXlIYXNoLCBrZXksIHZhbHVlLCBkaWRDaGFuZ2VTaXplLCBkaWRBbHRlcikge1xuICBpZiAoa2V5SGFzaCA9PT0gdW5kZWZpbmVkKSB7XG4gICAga2V5SGFzaCA9IGhhc2goa2V5KTtcbiAgfVxuICB2YXIga2V5SGFzaEZyYWcgPSAoc2hpZnQgPT09IDAgPyBrZXlIYXNoIDoga2V5SGFzaCA+Pj4gc2hpZnQpICYgTUFTSztcbiAgdmFyIGJpdCA9IDEgPDwga2V5SGFzaEZyYWc7XG4gIHZhciBiaXRtYXAgPSB0aGlzLmJpdG1hcDtcbiAgdmFyIGV4aXN0cyA9IChiaXRtYXAgJiBiaXQpICE9PSAwO1xuXG4gIGlmICghZXhpc3RzICYmIHZhbHVlID09PSBOT1RfU0VUKSB7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICB2YXIgaWR4ID0gcG9wQ291bnQoYml0bWFwICYgKGJpdCAtIDEpKTtcbiAgdmFyIG5vZGVzID0gdGhpcy5ub2RlcztcbiAgdmFyIG5vZGUgPSBleGlzdHMgPyBub2Rlc1tpZHhdIDogdW5kZWZpbmVkO1xuICB2YXIgbmV3Tm9kZSA9IHVwZGF0ZU5vZGUoXG4gICAgbm9kZSxcbiAgICBvd25lcklELFxuICAgIHNoaWZ0ICsgU0hJRlQsXG4gICAga2V5SGFzaCxcbiAgICBrZXksXG4gICAgdmFsdWUsXG4gICAgZGlkQ2hhbmdlU2l6ZSxcbiAgICBkaWRBbHRlclxuICApO1xuXG4gIGlmIChuZXdOb2RlID09PSBub2RlKSB7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBpZiAoIWV4aXN0cyAmJiBuZXdOb2RlICYmIG5vZGVzLmxlbmd0aCA+PSBNQVhfQklUTUFQX0lOREVYRURfU0laRSkge1xuICAgIHJldHVybiBleHBhbmROb2Rlcyhvd25lcklELCBub2RlcywgYml0bWFwLCBrZXlIYXNoRnJhZywgbmV3Tm9kZSk7XG4gIH1cblxuICBpZiAoXG4gICAgZXhpc3RzICYmXG4gICAgIW5ld05vZGUgJiZcbiAgICBub2Rlcy5sZW5ndGggPT09IDIgJiZcbiAgICBpc0xlYWZOb2RlKG5vZGVzW2lkeCBeIDFdKVxuICApIHtcbiAgICByZXR1cm4gbm9kZXNbaWR4IF4gMV07XG4gIH1cblxuICBpZiAoZXhpc3RzICYmIG5ld05vZGUgJiYgbm9kZXMubGVuZ3RoID09PSAxICYmIGlzTGVhZk5vZGUobmV3Tm9kZSkpIHtcbiAgICByZXR1cm4gbmV3Tm9kZTtcbiAgfVxuXG4gIHZhciBpc0VkaXRhYmxlID0gb3duZXJJRCAmJiBvd25lcklEID09PSB0aGlzLm93bmVySUQ7XG4gIHZhciBuZXdCaXRtYXAgPSBleGlzdHMgPyAobmV3Tm9kZSA/IGJpdG1hcCA6IGJpdG1hcCBeIGJpdCkgOiBiaXRtYXAgfCBiaXQ7XG4gIHZhciBuZXdOb2RlcyA9IGV4aXN0c1xuICAgID8gbmV3Tm9kZVxuICAgICAgPyBzZXRBdChub2RlcywgaWR4LCBuZXdOb2RlLCBpc0VkaXRhYmxlKVxuICAgICAgOiBzcGxpY2VPdXQobm9kZXMsIGlkeCwgaXNFZGl0YWJsZSlcbiAgICA6IHNwbGljZUluKG5vZGVzLCBpZHgsIG5ld05vZGUsIGlzRWRpdGFibGUpO1xuXG4gIGlmIChpc0VkaXRhYmxlKSB7XG4gICAgdGhpcy5iaXRtYXAgPSBuZXdCaXRtYXA7XG4gICAgdGhpcy5ub2RlcyA9IG5ld05vZGVzO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgcmV0dXJuIG5ldyBCaXRtYXBJbmRleGVkTm9kZShvd25lcklELCBuZXdCaXRtYXAsIG5ld05vZGVzKTtcbn07XG5cbnZhciBIYXNoQXJyYXlNYXBOb2RlID0gZnVuY3Rpb24gSGFzaEFycmF5TWFwTm9kZShvd25lcklELCBjb3VudCwgbm9kZXMpIHtcbiAgdGhpcy5vd25lcklEID0gb3duZXJJRDtcbiAgdGhpcy5jb3VudCA9IGNvdW50O1xuICB0aGlzLm5vZGVzID0gbm9kZXM7XG59O1xuXG5IYXNoQXJyYXlNYXBOb2RlLnByb3RvdHlwZS5nZXQgPSBmdW5jdGlvbiBnZXQgKHNoaWZ0LCBrZXlIYXNoLCBrZXksIG5vdFNldFZhbHVlKSB7XG4gIGlmIChrZXlIYXNoID09PSB1bmRlZmluZWQpIHtcbiAgICBrZXlIYXNoID0gaGFzaChrZXkpO1xuICB9XG4gIHZhciBpZHggPSAoc2hpZnQgPT09IDAgPyBrZXlIYXNoIDoga2V5SGFzaCA+Pj4gc2hpZnQpICYgTUFTSztcbiAgdmFyIG5vZGUgPSB0aGlzLm5vZGVzW2lkeF07XG4gIHJldHVybiBub2RlXG4gICAgPyBub2RlLmdldChzaGlmdCArIFNISUZULCBrZXlIYXNoLCBrZXksIG5vdFNldFZhbHVlKVxuICAgIDogbm90U2V0VmFsdWU7XG59O1xuXG5IYXNoQXJyYXlNYXBOb2RlLnByb3RvdHlwZS51cGRhdGUgPSBmdW5jdGlvbiB1cGRhdGUgKG93bmVySUQsIHNoaWZ0LCBrZXlIYXNoLCBrZXksIHZhbHVlLCBkaWRDaGFuZ2VTaXplLCBkaWRBbHRlcikge1xuICBpZiAoa2V5SGFzaCA9PT0gdW5kZWZpbmVkKSB7XG4gICAga2V5SGFzaCA9IGhhc2goa2V5KTtcbiAgfVxuICB2YXIgaWR4ID0gKHNoaWZ0ID09PSAwID8ga2V5SGFzaCA6IGtleUhhc2ggPj4+IHNoaWZ0KSAmIE1BU0s7XG4gIHZhciByZW1vdmVkID0gdmFsdWUgPT09IE5PVF9TRVQ7XG4gIHZhciBub2RlcyA9IHRoaXMubm9kZXM7XG4gIHZhciBub2RlID0gbm9kZXNbaWR4XTtcblxuICBpZiAocmVtb3ZlZCAmJiAhbm9kZSkge1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgdmFyIG5ld05vZGUgPSB1cGRhdGVOb2RlKFxuICAgIG5vZGUsXG4gICAgb3duZXJJRCxcbiAgICBzaGlmdCArIFNISUZULFxuICAgIGtleUhhc2gsXG4gICAga2V5LFxuICAgIHZhbHVlLFxuICAgIGRpZENoYW5nZVNpemUsXG4gICAgZGlkQWx0ZXJcbiAgKTtcbiAgaWYgKG5ld05vZGUgPT09IG5vZGUpIHtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIHZhciBuZXdDb3VudCA9IHRoaXMuY291bnQ7XG4gIGlmICghbm9kZSkge1xuICAgIG5ld0NvdW50Kys7XG4gIH0gZWxzZSBpZiAoIW5ld05vZGUpIHtcbiAgICBuZXdDb3VudC0tO1xuICAgIGlmIChuZXdDb3VudCA8IE1JTl9IQVNIX0FSUkFZX01BUF9TSVpFKSB7XG4gICAgICByZXR1cm4gcGFja05vZGVzKG93bmVySUQsIG5vZGVzLCBuZXdDb3VudCwgaWR4KTtcbiAgICB9XG4gIH1cblxuICB2YXIgaXNFZGl0YWJsZSA9IG93bmVySUQgJiYgb3duZXJJRCA9PT0gdGhpcy5vd25lcklEO1xuICB2YXIgbmV3Tm9kZXMgPSBzZXRBdChub2RlcywgaWR4LCBuZXdOb2RlLCBpc0VkaXRhYmxlKTtcblxuICBpZiAoaXNFZGl0YWJsZSkge1xuICAgIHRoaXMuY291bnQgPSBuZXdDb3VudDtcbiAgICB0aGlzLm5vZGVzID0gbmV3Tm9kZXM7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICByZXR1cm4gbmV3IEhhc2hBcnJheU1hcE5vZGUob3duZXJJRCwgbmV3Q291bnQsIG5ld05vZGVzKTtcbn07XG5cbnZhciBIYXNoQ29sbGlzaW9uTm9kZSA9IGZ1bmN0aW9uIEhhc2hDb2xsaXNpb25Ob2RlKG93bmVySUQsIGtleUhhc2gsIGVudHJpZXMpIHtcbiAgdGhpcy5vd25lcklEID0gb3duZXJJRDtcbiAgdGhpcy5rZXlIYXNoID0ga2V5SGFzaDtcbiAgdGhpcy5lbnRyaWVzID0gZW50cmllcztcbn07XG5cbkhhc2hDb2xsaXNpb25Ob2RlLnByb3RvdHlwZS5nZXQgPSBmdW5jdGlvbiBnZXQgKHNoaWZ0LCBrZXlIYXNoLCBrZXksIG5vdFNldFZhbHVlKSB7XG4gIHZhciBlbnRyaWVzID0gdGhpcy5lbnRyaWVzO1xuICBmb3IgKHZhciBpaSA9IDAsIGxlbiA9IGVudHJpZXMubGVuZ3RoOyBpaSA8IGxlbjsgaWkrKykge1xuICAgIGlmIChpcyhrZXksIGVudHJpZXNbaWldWzBdKSkge1xuICAgICAgcmV0dXJuIGVudHJpZXNbaWldWzFdO1xuICAgIH1cbiAgfVxuICByZXR1cm4gbm90U2V0VmFsdWU7XG59O1xuXG5IYXNoQ29sbGlzaW9uTm9kZS5wcm90b3R5cGUudXBkYXRlID0gZnVuY3Rpb24gdXBkYXRlIChvd25lcklELCBzaGlmdCwga2V5SGFzaCwga2V5LCB2YWx1ZSwgZGlkQ2hhbmdlU2l6ZSwgZGlkQWx0ZXIpIHtcbiAgaWYgKGtleUhhc2ggPT09IHVuZGVmaW5lZCkge1xuICAgIGtleUhhc2ggPSBoYXNoKGtleSk7XG4gIH1cblxuICB2YXIgcmVtb3ZlZCA9IHZhbHVlID09PSBOT1RfU0VUO1xuXG4gIGlmIChrZXlIYXNoICE9PSB0aGlzLmtleUhhc2gpIHtcbiAgICBpZiAocmVtb3ZlZCkge1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuICAgIFNldFJlZihkaWRBbHRlcik7XG4gICAgU2V0UmVmKGRpZENoYW5nZVNpemUpO1xuICAgIHJldHVybiBtZXJnZUludG9Ob2RlKHRoaXMsIG93bmVySUQsIHNoaWZ0LCBrZXlIYXNoLCBba2V5LCB2YWx1ZV0pO1xuICB9XG5cbiAgdmFyIGVudHJpZXMgPSB0aGlzLmVudHJpZXM7XG4gIHZhciBpZHggPSAwO1xuICB2YXIgbGVuID0gZW50cmllcy5sZW5ndGg7XG4gIGZvciAoOyBpZHggPCBsZW47IGlkeCsrKSB7XG4gICAgaWYgKGlzKGtleSwgZW50cmllc1tpZHhdWzBdKSkge1xuICAgICAgYnJlYWs7XG4gICAgfVxuICB9XG4gIHZhciBleGlzdHMgPSBpZHggPCBsZW47XG5cbiAgaWYgKGV4aXN0cyA/IGVudHJpZXNbaWR4XVsxXSA9PT0gdmFsdWUgOiByZW1vdmVkKSB7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBTZXRSZWYoZGlkQWx0ZXIpO1xuICAocmVtb3ZlZCB8fCAhZXhpc3RzKSAmJiBTZXRSZWYoZGlkQ2hhbmdlU2l6ZSk7XG5cbiAgaWYgKHJlbW92ZWQgJiYgbGVuID09PSAyKSB7XG4gICAgcmV0dXJuIG5ldyBWYWx1ZU5vZGUob3duZXJJRCwgdGhpcy5rZXlIYXNoLCBlbnRyaWVzW2lkeCBeIDFdKTtcbiAgfVxuXG4gIHZhciBpc0VkaXRhYmxlID0gb3duZXJJRCAmJiBvd25lcklEID09PSB0aGlzLm93bmVySUQ7XG4gIHZhciBuZXdFbnRyaWVzID0gaXNFZGl0YWJsZSA/IGVudHJpZXMgOiBhcnJDb3B5KGVudHJpZXMpO1xuXG4gIGlmIChleGlzdHMpIHtcbiAgICBpZiAocmVtb3ZlZCkge1xuICAgICAgaWR4ID09PSBsZW4gLSAxXG4gICAgICAgID8gbmV3RW50cmllcy5wb3AoKVxuICAgICAgICA6IChuZXdFbnRyaWVzW2lkeF0gPSBuZXdFbnRyaWVzLnBvcCgpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgbmV3RW50cmllc1tpZHhdID0gW2tleSwgdmFsdWVdO1xuICAgIH1cbiAgfSBlbHNlIHtcbiAgICBuZXdFbnRyaWVzLnB1c2goW2tleSwgdmFsdWVdKTtcbiAgfVxuXG4gIGlmIChpc0VkaXRhYmxlKSB7XG4gICAgdGhpcy5lbnRyaWVzID0gbmV3RW50cmllcztcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIHJldHVybiBuZXcgSGFzaENvbGxpc2lvbk5vZGUob3duZXJJRCwgdGhpcy5rZXlIYXNoLCBuZXdFbnRyaWVzKTtcbn07XG5cbnZhciBWYWx1ZU5vZGUgPSBmdW5jdGlvbiBWYWx1ZU5vZGUob3duZXJJRCwga2V5SGFzaCwgZW50cnkpIHtcbiAgdGhpcy5vd25lcklEID0gb3duZXJJRDtcbiAgdGhpcy5rZXlIYXNoID0ga2V5SGFzaDtcbiAgdGhpcy5lbnRyeSA9IGVudHJ5O1xufTtcblxuVmFsdWVOb2RlLnByb3RvdHlwZS5nZXQgPSBmdW5jdGlvbiBnZXQgKHNoaWZ0LCBrZXlIYXNoLCBrZXksIG5vdFNldFZhbHVlKSB7XG4gIHJldHVybiBpcyhrZXksIHRoaXMuZW50cnlbMF0pID8gdGhpcy5lbnRyeVsxXSA6IG5vdFNldFZhbHVlO1xufTtcblxuVmFsdWVOb2RlLnByb3RvdHlwZS51cGRhdGUgPSBmdW5jdGlvbiB1cGRhdGUgKG93bmVySUQsIHNoaWZ0LCBrZXlIYXNoLCBrZXksIHZhbHVlLCBkaWRDaGFuZ2VTaXplLCBkaWRBbHRlcikge1xuICB2YXIgcmVtb3ZlZCA9IHZhbHVlID09PSBOT1RfU0VUO1xuICB2YXIga2V5TWF0Y2ggPSBpcyhrZXksIHRoaXMuZW50cnlbMF0pO1xuICBpZiAoa2V5TWF0Y2ggPyB2YWx1ZSA9PT0gdGhpcy5lbnRyeVsxXSA6IHJlbW92ZWQpIHtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIFNldFJlZihkaWRBbHRlcik7XG5cbiAgaWYgKHJlbW92ZWQpIHtcbiAgICBTZXRSZWYoZGlkQ2hhbmdlU2l6ZSk7XG4gICAgcmV0dXJuOyAvLyB1bmRlZmluZWRcbiAgfVxuXG4gIGlmIChrZXlNYXRjaCkge1xuICAgIGlmIChvd25lcklEICYmIG93bmVySUQgPT09IHRoaXMub3duZXJJRCkge1xuICAgICAgdGhpcy5lbnRyeVsxXSA9IHZhbHVlO1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuICAgIHJldHVybiBuZXcgVmFsdWVOb2RlKG93bmVySUQsIHRoaXMua2V5SGFzaCwgW2tleSwgdmFsdWVdKTtcbiAgfVxuXG4gIFNldFJlZihkaWRDaGFuZ2VTaXplKTtcbiAgcmV0dXJuIG1lcmdlSW50b05vZGUodGhpcywgb3duZXJJRCwgc2hpZnQsIGhhc2goa2V5KSwgW2tleSwgdmFsdWVdKTtcbn07XG5cbi8vICNwcmFnbWEgSXRlcmF0b3JzXG5cbkFycmF5TWFwTm9kZS5wcm90b3R5cGUuaXRlcmF0ZSA9IEhhc2hDb2xsaXNpb25Ob2RlLnByb3RvdHlwZS5pdGVyYXRlID1cbiAgZnVuY3Rpb24gKGZuLCByZXZlcnNlKSB7XG4gICAgdmFyIGVudHJpZXMgPSB0aGlzLmVudHJpZXM7XG4gICAgZm9yICh2YXIgaWkgPSAwLCBtYXhJbmRleCA9IGVudHJpZXMubGVuZ3RoIC0gMTsgaWkgPD0gbWF4SW5kZXg7IGlpKyspIHtcbiAgICAgIGlmIChmbihlbnRyaWVzW3JldmVyc2UgPyBtYXhJbmRleCAtIGlpIDogaWldKSA9PT0gZmFsc2UpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgIH1cbiAgfTtcblxuQml0bWFwSW5kZXhlZE5vZGUucHJvdG90eXBlLml0ZXJhdGUgPSBIYXNoQXJyYXlNYXBOb2RlLnByb3RvdHlwZS5pdGVyYXRlID1cbiAgZnVuY3Rpb24gKGZuLCByZXZlcnNlKSB7XG4gICAgdmFyIG5vZGVzID0gdGhpcy5ub2RlcztcbiAgICBmb3IgKHZhciBpaSA9IDAsIG1heEluZGV4ID0gbm9kZXMubGVuZ3RoIC0gMTsgaWkgPD0gbWF4SW5kZXg7IGlpKyspIHtcbiAgICAgIHZhciBub2RlID0gbm9kZXNbcmV2ZXJzZSA/IG1heEluZGV4IC0gaWkgOiBpaV07XG4gICAgICBpZiAobm9kZSAmJiBub2RlLml0ZXJhdGUoZm4sIHJldmVyc2UpID09PSBmYWxzZSkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgfVxuICB9O1xuXG4vLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tdW51c2VkLXZhcnNcblZhbHVlTm9kZS5wcm90b3R5cGUuaXRlcmF0ZSA9IGZ1bmN0aW9uIChmbiwgcmV2ZXJzZSkge1xuICByZXR1cm4gZm4odGhpcy5lbnRyeSk7XG59O1xuXG52YXIgTWFwSXRlcmF0b3IgPSAvKkBfX1BVUkVfXyovKGZ1bmN0aW9uIChJdGVyYXRvcikge1xuICBmdW5jdGlvbiBNYXBJdGVyYXRvcihtYXAsIHR5cGUsIHJldmVyc2UpIHtcbiAgICB0aGlzLl90eXBlID0gdHlwZTtcbiAgICB0aGlzLl9yZXZlcnNlID0gcmV2ZXJzZTtcbiAgICB0aGlzLl9zdGFjayA9IG1hcC5fcm9vdCAmJiBtYXBJdGVyYXRvckZyYW1lKG1hcC5fcm9vdCk7XG4gIH1cblxuICBpZiAoIEl0ZXJhdG9yICkgTWFwSXRlcmF0b3IuX19wcm90b19fID0gSXRlcmF0b3I7XG4gIE1hcEl0ZXJhdG9yLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoIEl0ZXJhdG9yICYmIEl0ZXJhdG9yLnByb3RvdHlwZSApO1xuICBNYXBJdGVyYXRvci5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBNYXBJdGVyYXRvcjtcblxuICBNYXBJdGVyYXRvci5wcm90b3R5cGUubmV4dCA9IGZ1bmN0aW9uIG5leHQgKCkge1xuICAgIHZhciB0eXBlID0gdGhpcy5fdHlwZTtcbiAgICB2YXIgc3RhY2sgPSB0aGlzLl9zdGFjaztcbiAgICB3aGlsZSAoc3RhY2spIHtcbiAgICAgIHZhciBub2RlID0gc3RhY2subm9kZTtcbiAgICAgIHZhciBpbmRleCA9IHN0YWNrLmluZGV4Kys7XG4gICAgICB2YXIgbWF4SW5kZXggPSAodm9pZCAwKTtcbiAgICAgIGlmIChub2RlLmVudHJ5KSB7XG4gICAgICAgIGlmIChpbmRleCA9PT0gMCkge1xuICAgICAgICAgIHJldHVybiBtYXBJdGVyYXRvclZhbHVlKHR5cGUsIG5vZGUuZW50cnkpO1xuICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYgKG5vZGUuZW50cmllcykge1xuICAgICAgICBtYXhJbmRleCA9IG5vZGUuZW50cmllcy5sZW5ndGggLSAxO1xuICAgICAgICBpZiAoaW5kZXggPD0gbWF4SW5kZXgpIHtcbiAgICAgICAgICByZXR1cm4gbWFwSXRlcmF0b3JWYWx1ZShcbiAgICAgICAgICAgIHR5cGUsXG4gICAgICAgICAgICBub2RlLmVudHJpZXNbdGhpcy5fcmV2ZXJzZSA/IG1heEluZGV4IC0gaW5kZXggOiBpbmRleF1cbiAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBtYXhJbmRleCA9IG5vZGUubm9kZXMubGVuZ3RoIC0gMTtcbiAgICAgICAgaWYgKGluZGV4IDw9IG1heEluZGV4KSB7XG4gICAgICAgICAgdmFyIHN1Yk5vZGUgPSBub2RlLm5vZGVzW3RoaXMuX3JldmVyc2UgPyBtYXhJbmRleCAtIGluZGV4IDogaW5kZXhdO1xuICAgICAgICAgIGlmIChzdWJOb2RlKSB7XG4gICAgICAgICAgICBpZiAoc3ViTm9kZS5lbnRyeSkge1xuICAgICAgICAgICAgICByZXR1cm4gbWFwSXRlcmF0b3JWYWx1ZSh0eXBlLCBzdWJOb2RlLmVudHJ5KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHN0YWNrID0gdGhpcy5fc3RhY2sgPSBtYXBJdGVyYXRvckZyYW1lKHN1Yk5vZGUsIHN0YWNrKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHN0YWNrID0gdGhpcy5fc3RhY2sgPSB0aGlzLl9zdGFjay5fX3ByZXY7XG4gICAgfVxuICAgIHJldHVybiBpdGVyYXRvckRvbmUoKTtcbiAgfTtcblxuICByZXR1cm4gTWFwSXRlcmF0b3I7XG59KEl0ZXJhdG9yKSk7XG5cbmZ1bmN0aW9uIG1hcEl0ZXJhdG9yVmFsdWUodHlwZSwgZW50cnkpIHtcbiAgcmV0dXJuIGl0ZXJhdG9yVmFsdWUodHlwZSwgZW50cnlbMF0sIGVudHJ5WzFdKTtcbn1cblxuZnVuY3Rpb24gbWFwSXRlcmF0b3JGcmFtZShub2RlLCBwcmV2KSB7XG4gIHJldHVybiB7XG4gICAgbm9kZTogbm9kZSxcbiAgICBpbmRleDogMCxcbiAgICBfX3ByZXY6IHByZXYsXG4gIH07XG59XG5cbmZ1bmN0aW9uIG1ha2VNYXAoc2l6ZSwgcm9vdCwgb3duZXJJRCwgaGFzaCkge1xuICB2YXIgbWFwID0gT2JqZWN0LmNyZWF0ZShNYXBQcm90b3R5cGUpO1xuICBtYXAuc2l6ZSA9IHNpemU7XG4gIG1hcC5fcm9vdCA9IHJvb3Q7XG4gIG1hcC5fX293bmVySUQgPSBvd25lcklEO1xuICBtYXAuX19oYXNoID0gaGFzaDtcbiAgbWFwLl9fYWx0ZXJlZCA9IGZhbHNlO1xuICByZXR1cm4gbWFwO1xufVxuXG52YXIgRU1QVFlfTUFQO1xuZnVuY3Rpb24gZW1wdHlNYXAoKSB7XG4gIHJldHVybiBFTVBUWV9NQVAgfHwgKEVNUFRZX01BUCA9IG1ha2VNYXAoMCkpO1xufVxuXG5mdW5jdGlvbiB1cGRhdGVNYXAobWFwLCBrLCB2KSB7XG4gIHZhciBuZXdSb290O1xuICB2YXIgbmV3U2l6ZTtcbiAgaWYgKCFtYXAuX3Jvb3QpIHtcbiAgICBpZiAodiA9PT0gTk9UX1NFVCkge1xuICAgICAgcmV0dXJuIG1hcDtcbiAgICB9XG4gICAgbmV3U2l6ZSA9IDE7XG4gICAgbmV3Um9vdCA9IG5ldyBBcnJheU1hcE5vZGUobWFwLl9fb3duZXJJRCwgW1trLCB2XV0pO1xuICB9IGVsc2Uge1xuICAgIHZhciBkaWRDaGFuZ2VTaXplID0gTWFrZVJlZigpO1xuICAgIHZhciBkaWRBbHRlciA9IE1ha2VSZWYoKTtcbiAgICBuZXdSb290ID0gdXBkYXRlTm9kZShcbiAgICAgIG1hcC5fcm9vdCxcbiAgICAgIG1hcC5fX293bmVySUQsXG4gICAgICAwLFxuICAgICAgdW5kZWZpbmVkLFxuICAgICAgayxcbiAgICAgIHYsXG4gICAgICBkaWRDaGFuZ2VTaXplLFxuICAgICAgZGlkQWx0ZXJcbiAgICApO1xuICAgIGlmICghZGlkQWx0ZXIudmFsdWUpIHtcbiAgICAgIHJldHVybiBtYXA7XG4gICAgfVxuICAgIG5ld1NpemUgPSBtYXAuc2l6ZSArIChkaWRDaGFuZ2VTaXplLnZhbHVlID8gKHYgPT09IE5PVF9TRVQgPyAtMSA6IDEpIDogMCk7XG4gIH1cbiAgaWYgKG1hcC5fX293bmVySUQpIHtcbiAgICBtYXAuc2l6ZSA9IG5ld1NpemU7XG4gICAgbWFwLl9yb290ID0gbmV3Um9vdDtcbiAgICBtYXAuX19oYXNoID0gdW5kZWZpbmVkO1xuICAgIG1hcC5fX2FsdGVyZWQgPSB0cnVlO1xuICAgIHJldHVybiBtYXA7XG4gIH1cbiAgcmV0dXJuIG5ld1Jvb3QgPyBtYWtlTWFwKG5ld1NpemUsIG5ld1Jvb3QpIDogZW1wdHlNYXAoKTtcbn1cblxuZnVuY3Rpb24gdXBkYXRlTm9kZShcbiAgbm9kZSxcbiAgb3duZXJJRCxcbiAgc2hpZnQsXG4gIGtleUhhc2gsXG4gIGtleSxcbiAgdmFsdWUsXG4gIGRpZENoYW5nZVNpemUsXG4gIGRpZEFsdGVyXG4pIHtcbiAgaWYgKCFub2RlKSB7XG4gICAgaWYgKHZhbHVlID09PSBOT1RfU0VUKSB7XG4gICAgICByZXR1cm4gbm9kZTtcbiAgICB9XG4gICAgU2V0UmVmKGRpZEFsdGVyKTtcbiAgICBTZXRSZWYoZGlkQ2hhbmdlU2l6ZSk7XG4gICAgcmV0dXJuIG5ldyBWYWx1ZU5vZGUob3duZXJJRCwga2V5SGFzaCwgW2tleSwgdmFsdWVdKTtcbiAgfVxuICByZXR1cm4gbm9kZS51cGRhdGUoXG4gICAgb3duZXJJRCxcbiAgICBzaGlmdCxcbiAgICBrZXlIYXNoLFxuICAgIGtleSxcbiAgICB2YWx1ZSxcbiAgICBkaWRDaGFuZ2VTaXplLFxuICAgIGRpZEFsdGVyXG4gICk7XG59XG5cbmZ1bmN0aW9uIGlzTGVhZk5vZGUobm9kZSkge1xuICByZXR1cm4gKFxuICAgIG5vZGUuY29uc3RydWN0b3IgPT09IFZhbHVlTm9kZSB8fCBub2RlLmNvbnN0cnVjdG9yID09PSBIYXNoQ29sbGlzaW9uTm9kZVxuICApO1xufVxuXG5mdW5jdGlvbiBtZXJnZUludG9Ob2RlKG5vZGUsIG93bmVySUQsIHNoaWZ0LCBrZXlIYXNoLCBlbnRyeSkge1xuICBpZiAobm9kZS5rZXlIYXNoID09PSBrZXlIYXNoKSB7XG4gICAgcmV0dXJuIG5ldyBIYXNoQ29sbGlzaW9uTm9kZShvd25lcklELCBrZXlIYXNoLCBbbm9kZS5lbnRyeSwgZW50cnldKTtcbiAgfVxuXG4gIHZhciBpZHgxID0gKHNoaWZ0ID09PSAwID8gbm9kZS5rZXlIYXNoIDogbm9kZS5rZXlIYXNoID4+PiBzaGlmdCkgJiBNQVNLO1xuICB2YXIgaWR4MiA9IChzaGlmdCA9PT0gMCA/IGtleUhhc2ggOiBrZXlIYXNoID4+PiBzaGlmdCkgJiBNQVNLO1xuXG4gIHZhciBuZXdOb2RlO1xuICB2YXIgbm9kZXMgPVxuICAgIGlkeDEgPT09IGlkeDJcbiAgICAgID8gW21lcmdlSW50b05vZGUobm9kZSwgb3duZXJJRCwgc2hpZnQgKyBTSElGVCwga2V5SGFzaCwgZW50cnkpXVxuICAgICAgOiAoKG5ld05vZGUgPSBuZXcgVmFsdWVOb2RlKG93bmVySUQsIGtleUhhc2gsIGVudHJ5KSksXG4gICAgICAgIGlkeDEgPCBpZHgyID8gW25vZGUsIG5ld05vZGVdIDogW25ld05vZGUsIG5vZGVdKTtcblxuICByZXR1cm4gbmV3IEJpdG1hcEluZGV4ZWROb2RlKG93bmVySUQsICgxIDw8IGlkeDEpIHwgKDEgPDwgaWR4MiksIG5vZGVzKTtcbn1cblxuZnVuY3Rpb24gY3JlYXRlTm9kZXMob3duZXJJRCwgZW50cmllcywga2V5LCB2YWx1ZSkge1xuICBpZiAoIW93bmVySUQpIHtcbiAgICBvd25lcklEID0gbmV3IE93bmVySUQoKTtcbiAgfVxuICB2YXIgbm9kZSA9IG5ldyBWYWx1ZU5vZGUob3duZXJJRCwgaGFzaChrZXkpLCBba2V5LCB2YWx1ZV0pO1xuICBmb3IgKHZhciBpaSA9IDA7IGlpIDwgZW50cmllcy5sZW5ndGg7IGlpKyspIHtcbiAgICB2YXIgZW50cnkgPSBlbnRyaWVzW2lpXTtcbiAgICBub2RlID0gbm9kZS51cGRhdGUob3duZXJJRCwgMCwgdW5kZWZpbmVkLCBlbnRyeVswXSwgZW50cnlbMV0pO1xuICB9XG4gIHJldHVybiBub2RlO1xufVxuXG5mdW5jdGlvbiBwYWNrTm9kZXMob3duZXJJRCwgbm9kZXMsIGNvdW50LCBleGNsdWRpbmcpIHtcbiAgdmFyIGJpdG1hcCA9IDA7XG4gIHZhciBwYWNrZWRJSSA9IDA7XG4gIHZhciBwYWNrZWROb2RlcyA9IG5ldyBBcnJheShjb3VudCk7XG4gIGZvciAodmFyIGlpID0gMCwgYml0ID0gMSwgbGVuID0gbm9kZXMubGVuZ3RoOyBpaSA8IGxlbjsgaWkrKywgYml0IDw8PSAxKSB7XG4gICAgdmFyIG5vZGUgPSBub2Rlc1tpaV07XG4gICAgaWYgKG5vZGUgIT09IHVuZGVmaW5lZCAmJiBpaSAhPT0gZXhjbHVkaW5nKSB7XG4gICAgICBiaXRtYXAgfD0gYml0O1xuICAgICAgcGFja2VkTm9kZXNbcGFja2VkSUkrK10gPSBub2RlO1xuICAgIH1cbiAgfVxuICByZXR1cm4gbmV3IEJpdG1hcEluZGV4ZWROb2RlKG93bmVySUQsIGJpdG1hcCwgcGFja2VkTm9kZXMpO1xufVxuXG5mdW5jdGlvbiBleHBhbmROb2Rlcyhvd25lcklELCBub2RlcywgYml0bWFwLCBpbmNsdWRpbmcsIG5vZGUpIHtcbiAgdmFyIGNvdW50ID0gMDtcbiAgdmFyIGV4cGFuZGVkTm9kZXMgPSBuZXcgQXJyYXkoU0laRSk7XG4gIGZvciAodmFyIGlpID0gMDsgYml0bWFwICE9PSAwOyBpaSsrLCBiaXRtYXAgPj4+PSAxKSB7XG4gICAgZXhwYW5kZWROb2Rlc1tpaV0gPSBiaXRtYXAgJiAxID8gbm9kZXNbY291bnQrK10gOiB1bmRlZmluZWQ7XG4gIH1cbiAgZXhwYW5kZWROb2Rlc1tpbmNsdWRpbmddID0gbm9kZTtcbiAgcmV0dXJuIG5ldyBIYXNoQXJyYXlNYXBOb2RlKG93bmVySUQsIGNvdW50ICsgMSwgZXhwYW5kZWROb2Rlcyk7XG59XG5cbmZ1bmN0aW9uIHBvcENvdW50KHgpIHtcbiAgeCAtPSAoeCA+PiAxKSAmIDB4NTU1NTU1NTU7XG4gIHggPSAoeCAmIDB4MzMzMzMzMzMpICsgKCh4ID4+IDIpICYgMHgzMzMzMzMzMyk7XG4gIHggPSAoeCArICh4ID4+IDQpKSAmIDB4MGYwZjBmMGY7XG4gIHggKz0geCA+PiA4O1xuICB4ICs9IHggPj4gMTY7XG4gIHJldHVybiB4ICYgMHg3Zjtcbn1cblxuZnVuY3Rpb24gc2V0QXQoYXJyYXksIGlkeCwgdmFsLCBjYW5FZGl0KSB7XG4gIHZhciBuZXdBcnJheSA9IGNhbkVkaXQgPyBhcnJheSA6IGFyckNvcHkoYXJyYXkpO1xuICBuZXdBcnJheVtpZHhdID0gdmFsO1xuICByZXR1cm4gbmV3QXJyYXk7XG59XG5cbmZ1bmN0aW9uIHNwbGljZUluKGFycmF5LCBpZHgsIHZhbCwgY2FuRWRpdCkge1xuICB2YXIgbmV3TGVuID0gYXJyYXkubGVuZ3RoICsgMTtcbiAgaWYgKGNhbkVkaXQgJiYgaWR4ICsgMSA9PT0gbmV3TGVuKSB7XG4gICAgYXJyYXlbaWR4XSA9IHZhbDtcbiAgICByZXR1cm4gYXJyYXk7XG4gIH1cbiAgdmFyIG5ld0FycmF5ID0gbmV3IEFycmF5KG5ld0xlbik7XG4gIHZhciBhZnRlciA9IDA7XG4gIGZvciAodmFyIGlpID0gMDsgaWkgPCBuZXdMZW47IGlpKyspIHtcbiAgICBpZiAoaWkgPT09IGlkeCkge1xuICAgICAgbmV3QXJyYXlbaWldID0gdmFsO1xuICAgICAgYWZ0ZXIgPSAtMTtcbiAgICB9IGVsc2Uge1xuICAgICAgbmV3QXJyYXlbaWldID0gYXJyYXlbaWkgKyBhZnRlcl07XG4gICAgfVxuICB9XG4gIHJldHVybiBuZXdBcnJheTtcbn1cblxuZnVuY3Rpb24gc3BsaWNlT3V0KGFycmF5LCBpZHgsIGNhbkVkaXQpIHtcbiAgdmFyIG5ld0xlbiA9IGFycmF5Lmxlbmd0aCAtIDE7XG4gIGlmIChjYW5FZGl0ICYmIGlkeCA9PT0gbmV3TGVuKSB7XG4gICAgYXJyYXkucG9wKCk7XG4gICAgcmV0dXJuIGFycmF5O1xuICB9XG4gIHZhciBuZXdBcnJheSA9IG5ldyBBcnJheShuZXdMZW4pO1xuICB2YXIgYWZ0ZXIgPSAwO1xuICBmb3IgKHZhciBpaSA9IDA7IGlpIDwgbmV3TGVuOyBpaSsrKSB7XG4gICAgaWYgKGlpID09PSBpZHgpIHtcbiAgICAgIGFmdGVyID0gMTtcbiAgICB9XG4gICAgbmV3QXJyYXlbaWldID0gYXJyYXlbaWkgKyBhZnRlcl07XG4gIH1cbiAgcmV0dXJuIG5ld0FycmF5O1xufVxuXG52YXIgTUFYX0FSUkFZX01BUF9TSVpFID0gU0laRSAvIDQ7XG52YXIgTUFYX0JJVE1BUF9JTkRFWEVEX1NJWkUgPSBTSVpFIC8gMjtcbnZhciBNSU5fSEFTSF9BUlJBWV9NQVBfU0laRSA9IFNJWkUgLyA0O1xuXG52YXIgSVNfTElTVF9TWU1CT0wgPSAnQEBfX0lNTVVUQUJMRV9MSVNUX19AQCc7XG5cbmZ1bmN0aW9uIGlzTGlzdChtYXliZUxpc3QpIHtcbiAgcmV0dXJuIEJvb2xlYW4obWF5YmVMaXN0ICYmIG1heWJlTGlzdFtJU19MSVNUX1NZTUJPTF0pO1xufVxuXG52YXIgTGlzdCA9IC8qQF9fUFVSRV9fKi8oZnVuY3Rpb24gKEluZGV4ZWRDb2xsZWN0aW9uKSB7XG4gIGZ1bmN0aW9uIExpc3QodmFsdWUpIHtcbiAgICB2YXIgZW1wdHkgPSBlbXB0eUxpc3QoKTtcbiAgICBpZiAodmFsdWUgPT09IHVuZGVmaW5lZCB8fCB2YWx1ZSA9PT0gbnVsbCkge1xuICAgICAgcmV0dXJuIGVtcHR5O1xuICAgIH1cbiAgICBpZiAoaXNMaXN0KHZhbHVlKSkge1xuICAgICAgcmV0dXJuIHZhbHVlO1xuICAgIH1cbiAgICB2YXIgaXRlciA9IEluZGV4ZWRDb2xsZWN0aW9uKHZhbHVlKTtcbiAgICB2YXIgc2l6ZSA9IGl0ZXIuc2l6ZTtcbiAgICBpZiAoc2l6ZSA9PT0gMCkge1xuICAgICAgcmV0dXJuIGVtcHR5O1xuICAgIH1cbiAgICBhc3NlcnROb3RJbmZpbml0ZShzaXplKTtcbiAgICBpZiAoc2l6ZSA+IDAgJiYgc2l6ZSA8IFNJWkUpIHtcbiAgICAgIHJldHVybiBtYWtlTGlzdCgwLCBzaXplLCBTSElGVCwgbnVsbCwgbmV3IFZOb2RlKGl0ZXIudG9BcnJheSgpKSk7XG4gICAgfVxuICAgIHJldHVybiBlbXB0eS53aXRoTXV0YXRpb25zKGZ1bmN0aW9uIChsaXN0KSB7XG4gICAgICBsaXN0LnNldFNpemUoc2l6ZSk7XG4gICAgICBpdGVyLmZvckVhY2goZnVuY3Rpb24gKHYsIGkpIHsgcmV0dXJuIGxpc3Quc2V0KGksIHYpOyB9KTtcbiAgICB9KTtcbiAgfVxuXG4gIGlmICggSW5kZXhlZENvbGxlY3Rpb24gKSBMaXN0Ll9fcHJvdG9fXyA9IEluZGV4ZWRDb2xsZWN0aW9uO1xuICBMaXN0LnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoIEluZGV4ZWRDb2xsZWN0aW9uICYmIEluZGV4ZWRDb2xsZWN0aW9uLnByb3RvdHlwZSApO1xuICBMaXN0LnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IExpc3Q7XG5cbiAgTGlzdC5vZiA9IGZ1bmN0aW9uIG9mICgvKi4uLnZhbHVlcyovKSB7XG4gICAgcmV0dXJuIHRoaXMoYXJndW1lbnRzKTtcbiAgfTtcblxuICBMaXN0LnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uIHRvU3RyaW5nICgpIHtcbiAgICByZXR1cm4gdGhpcy5fX3RvU3RyaW5nKCdMaXN0IFsnLCAnXScpO1xuICB9O1xuXG4gIC8vIEBwcmFnbWEgQWNjZXNzXG5cbiAgTGlzdC5wcm90b3R5cGUuZ2V0ID0gZnVuY3Rpb24gZ2V0IChpbmRleCwgbm90U2V0VmFsdWUpIHtcbiAgICBpbmRleCA9IHdyYXBJbmRleCh0aGlzLCBpbmRleCk7XG4gICAgaWYgKGluZGV4ID49IDAgJiYgaW5kZXggPCB0aGlzLnNpemUpIHtcbiAgICAgIGluZGV4ICs9IHRoaXMuX29yaWdpbjtcbiAgICAgIHZhciBub2RlID0gbGlzdE5vZGVGb3IodGhpcywgaW5kZXgpO1xuICAgICAgcmV0dXJuIG5vZGUgJiYgbm9kZS5hcnJheVtpbmRleCAmIE1BU0tdO1xuICAgIH1cbiAgICByZXR1cm4gbm90U2V0VmFsdWU7XG4gIH07XG5cbiAgLy8gQHByYWdtYSBNb2RpZmljYXRpb25cblxuICBMaXN0LnByb3RvdHlwZS5zZXQgPSBmdW5jdGlvbiBzZXQgKGluZGV4LCB2YWx1ZSkge1xuICAgIHJldHVybiB1cGRhdGVMaXN0KHRoaXMsIGluZGV4LCB2YWx1ZSk7XG4gIH07XG5cbiAgTGlzdC5wcm90b3R5cGUucmVtb3ZlID0gZnVuY3Rpb24gcmVtb3ZlIChpbmRleCkge1xuICAgIHJldHVybiAhdGhpcy5oYXMoaW5kZXgpXG4gICAgICA/IHRoaXNcbiAgICAgIDogaW5kZXggPT09IDBcbiAgICAgID8gdGhpcy5zaGlmdCgpXG4gICAgICA6IGluZGV4ID09PSB0aGlzLnNpemUgLSAxXG4gICAgICA/IHRoaXMucG9wKClcbiAgICAgIDogdGhpcy5zcGxpY2UoaW5kZXgsIDEpO1xuICB9O1xuXG4gIExpc3QucHJvdG90eXBlLmluc2VydCA9IGZ1bmN0aW9uIGluc2VydCAoaW5kZXgsIHZhbHVlKSB7XG4gICAgcmV0dXJuIHRoaXMuc3BsaWNlKGluZGV4LCAwLCB2YWx1ZSk7XG4gIH07XG5cbiAgTGlzdC5wcm90b3R5cGUuY2xlYXIgPSBmdW5jdGlvbiBjbGVhciAoKSB7XG4gICAgaWYgKHRoaXMuc2l6ZSA9PT0gMCkge1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuICAgIGlmICh0aGlzLl9fb3duZXJJRCkge1xuICAgICAgdGhpcy5zaXplID0gdGhpcy5fb3JpZ2luID0gdGhpcy5fY2FwYWNpdHkgPSAwO1xuICAgICAgdGhpcy5fbGV2ZWwgPSBTSElGVDtcbiAgICAgIHRoaXMuX3Jvb3QgPSB0aGlzLl90YWlsID0gdGhpcy5fX2hhc2ggPSB1bmRlZmluZWQ7XG4gICAgICB0aGlzLl9fYWx0ZXJlZCA9IHRydWU7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9XG4gICAgcmV0dXJuIGVtcHR5TGlzdCgpO1xuICB9O1xuXG4gIExpc3QucHJvdG90eXBlLnB1c2ggPSBmdW5jdGlvbiBwdXNoICgvKi4uLnZhbHVlcyovKSB7XG4gICAgdmFyIHZhbHVlcyA9IGFyZ3VtZW50cztcbiAgICB2YXIgb2xkU2l6ZSA9IHRoaXMuc2l6ZTtcbiAgICByZXR1cm4gdGhpcy53aXRoTXV0YXRpb25zKGZ1bmN0aW9uIChsaXN0KSB7XG4gICAgICBzZXRMaXN0Qm91bmRzKGxpc3QsIDAsIG9sZFNpemUgKyB2YWx1ZXMubGVuZ3RoKTtcbiAgICAgIGZvciAodmFyIGlpID0gMDsgaWkgPCB2YWx1ZXMubGVuZ3RoOyBpaSsrKSB7XG4gICAgICAgIGxpc3Quc2V0KG9sZFNpemUgKyBpaSwgdmFsdWVzW2lpXSk7XG4gICAgICB9XG4gICAgfSk7XG4gIH07XG5cbiAgTGlzdC5wcm90b3R5cGUucG9wID0gZnVuY3Rpb24gcG9wICgpIHtcbiAgICByZXR1cm4gc2V0TGlzdEJvdW5kcyh0aGlzLCAwLCAtMSk7XG4gIH07XG5cbiAgTGlzdC5wcm90b3R5cGUudW5zaGlmdCA9IGZ1bmN0aW9uIHVuc2hpZnQgKC8qLi4udmFsdWVzKi8pIHtcbiAgICB2YXIgdmFsdWVzID0gYXJndW1lbnRzO1xuICAgIHJldHVybiB0aGlzLndpdGhNdXRhdGlvbnMoZnVuY3Rpb24gKGxpc3QpIHtcbiAgICAgIHNldExpc3RCb3VuZHMobGlzdCwgLXZhbHVlcy5sZW5ndGgpO1xuICAgICAgZm9yICh2YXIgaWkgPSAwOyBpaSA8IHZhbHVlcy5sZW5ndGg7IGlpKyspIHtcbiAgICAgICAgbGlzdC5zZXQoaWksIHZhbHVlc1tpaV0pO1xuICAgICAgfVxuICAgIH0pO1xuICB9O1xuXG4gIExpc3QucHJvdG90eXBlLnNoaWZ0ID0gZnVuY3Rpb24gc2hpZnQgKCkge1xuICAgIHJldHVybiBzZXRMaXN0Qm91bmRzKHRoaXMsIDEpO1xuICB9O1xuXG4gIC8vIEBwcmFnbWEgQ29tcG9zaXRpb25cblxuICBMaXN0LnByb3RvdHlwZS5jb25jYXQgPSBmdW5jdGlvbiBjb25jYXQgKC8qLi4uY29sbGVjdGlvbnMqLykge1xuICAgIHZhciBhcmd1bWVudHMkMSA9IGFyZ3VtZW50cztcblxuICAgIHZhciBzZXFzID0gW107XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhciBhcmd1bWVudCA9IGFyZ3VtZW50cyQxW2ldO1xuICAgICAgdmFyIHNlcSA9IEluZGV4ZWRDb2xsZWN0aW9uKFxuICAgICAgICB0eXBlb2YgYXJndW1lbnQgIT09ICdzdHJpbmcnICYmIGhhc0l0ZXJhdG9yKGFyZ3VtZW50KVxuICAgICAgICAgID8gYXJndW1lbnRcbiAgICAgICAgICA6IFthcmd1bWVudF1cbiAgICAgICk7XG4gICAgICBpZiAoc2VxLnNpemUgIT09IDApIHtcbiAgICAgICAgc2Vxcy5wdXNoKHNlcSk7XG4gICAgICB9XG4gICAgfVxuICAgIGlmIChzZXFzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuICAgIGlmICh0aGlzLnNpemUgPT09IDAgJiYgIXRoaXMuX19vd25lcklEICYmIHNlcXMubGVuZ3RoID09PSAxKSB7XG4gICAgICByZXR1cm4gdGhpcy5jb25zdHJ1Y3RvcihzZXFzWzBdKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMud2l0aE11dGF0aW9ucyhmdW5jdGlvbiAobGlzdCkge1xuICAgICAgc2Vxcy5mb3JFYWNoKGZ1bmN0aW9uIChzZXEpIHsgcmV0dXJuIHNlcS5mb3JFYWNoKGZ1bmN0aW9uICh2YWx1ZSkgeyByZXR1cm4gbGlzdC5wdXNoKHZhbHVlKTsgfSk7IH0pO1xuICAgIH0pO1xuICB9O1xuXG4gIExpc3QucHJvdG90eXBlLnNldFNpemUgPSBmdW5jdGlvbiBzZXRTaXplIChzaXplKSB7XG4gICAgcmV0dXJuIHNldExpc3RCb3VuZHModGhpcywgMCwgc2l6ZSk7XG4gIH07XG5cbiAgTGlzdC5wcm90b3R5cGUubWFwID0gZnVuY3Rpb24gbWFwIChtYXBwZXIsIGNvbnRleHQpIHtcbiAgICB2YXIgdGhpcyQxJDEgPSB0aGlzO1xuXG4gICAgcmV0dXJuIHRoaXMud2l0aE11dGF0aW9ucyhmdW5jdGlvbiAobGlzdCkge1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzJDEkMS5zaXplOyBpKyspIHtcbiAgICAgICAgbGlzdC5zZXQoaSwgbWFwcGVyLmNhbGwoY29udGV4dCwgbGlzdC5nZXQoaSksIGksIHRoaXMkMSQxKSk7XG4gICAgICB9XG4gICAgfSk7XG4gIH07XG5cbiAgLy8gQHByYWdtYSBJdGVyYXRpb25cblxuICBMaXN0LnByb3RvdHlwZS5zbGljZSA9IGZ1bmN0aW9uIHNsaWNlIChiZWdpbiwgZW5kKSB7XG4gICAgdmFyIHNpemUgPSB0aGlzLnNpemU7XG4gICAgaWYgKHdob2xlU2xpY2UoYmVnaW4sIGVuZCwgc2l6ZSkpIHtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbiAgICByZXR1cm4gc2V0TGlzdEJvdW5kcyhcbiAgICAgIHRoaXMsXG4gICAgICByZXNvbHZlQmVnaW4oYmVnaW4sIHNpemUpLFxuICAgICAgcmVzb2x2ZUVuZChlbmQsIHNpemUpXG4gICAgKTtcbiAgfTtcblxuICBMaXN0LnByb3RvdHlwZS5fX2l0ZXJhdG9yID0gZnVuY3Rpb24gX19pdGVyYXRvciAodHlwZSwgcmV2ZXJzZSkge1xuICAgIHZhciBpbmRleCA9IHJldmVyc2UgPyB0aGlzLnNpemUgOiAwO1xuICAgIHZhciB2YWx1ZXMgPSBpdGVyYXRlTGlzdCh0aGlzLCByZXZlcnNlKTtcbiAgICByZXR1cm4gbmV3IEl0ZXJhdG9yKGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciB2YWx1ZSA9IHZhbHVlcygpO1xuICAgICAgcmV0dXJuIHZhbHVlID09PSBET05FXG4gICAgICAgID8gaXRlcmF0b3JEb25lKClcbiAgICAgICAgOiBpdGVyYXRvclZhbHVlKHR5cGUsIHJldmVyc2UgPyAtLWluZGV4IDogaW5kZXgrKywgdmFsdWUpO1xuICAgIH0pO1xuICB9O1xuXG4gIExpc3QucHJvdG90eXBlLl9faXRlcmF0ZSA9IGZ1bmN0aW9uIF9faXRlcmF0ZSAoZm4sIHJldmVyc2UpIHtcbiAgICB2YXIgaW5kZXggPSByZXZlcnNlID8gdGhpcy5zaXplIDogMDtcbiAgICB2YXIgdmFsdWVzID0gaXRlcmF0ZUxpc3QodGhpcywgcmV2ZXJzZSk7XG4gICAgdmFyIHZhbHVlO1xuICAgIHdoaWxlICgodmFsdWUgPSB2YWx1ZXMoKSkgIT09IERPTkUpIHtcbiAgICAgIGlmIChmbih2YWx1ZSwgcmV2ZXJzZSA/IC0taW5kZXggOiBpbmRleCsrLCB0aGlzKSA9PT0gZmFsc2UpIHtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBpbmRleDtcbiAgfTtcblxuICBMaXN0LnByb3RvdHlwZS5fX2Vuc3VyZU93bmVyID0gZnVuY3Rpb24gX19lbnN1cmVPd25lciAob3duZXJJRCkge1xuICAgIGlmIChvd25lcklEID09PSB0aGlzLl9fb3duZXJJRCkge1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuICAgIGlmICghb3duZXJJRCkge1xuICAgICAgaWYgKHRoaXMuc2l6ZSA9PT0gMCkge1xuICAgICAgICByZXR1cm4gZW1wdHlMaXN0KCk7XG4gICAgICB9XG4gICAgICB0aGlzLl9fb3duZXJJRCA9IG93bmVySUQ7XG4gICAgICB0aGlzLl9fYWx0ZXJlZCA9IGZhbHNlO1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuICAgIHJldHVybiBtYWtlTGlzdChcbiAgICAgIHRoaXMuX29yaWdpbixcbiAgICAgIHRoaXMuX2NhcGFjaXR5LFxuICAgICAgdGhpcy5fbGV2ZWwsXG4gICAgICB0aGlzLl9yb290LFxuICAgICAgdGhpcy5fdGFpbCxcbiAgICAgIG93bmVySUQsXG4gICAgICB0aGlzLl9faGFzaFxuICAgICk7XG4gIH07XG5cbiAgcmV0dXJuIExpc3Q7XG59KEluZGV4ZWRDb2xsZWN0aW9uKSk7XG5cbkxpc3QuaXNMaXN0ID0gaXNMaXN0O1xuXG52YXIgTGlzdFByb3RvdHlwZSA9IExpc3QucHJvdG90eXBlO1xuTGlzdFByb3RvdHlwZVtJU19MSVNUX1NZTUJPTF0gPSB0cnVlO1xuTGlzdFByb3RvdHlwZVtERUxFVEVdID0gTGlzdFByb3RvdHlwZS5yZW1vdmU7XG5MaXN0UHJvdG90eXBlLm1lcmdlID0gTGlzdFByb3RvdHlwZS5jb25jYXQ7XG5MaXN0UHJvdG90eXBlLnNldEluID0gc2V0SW47XG5MaXN0UHJvdG90eXBlLmRlbGV0ZUluID0gTGlzdFByb3RvdHlwZS5yZW1vdmVJbiA9IGRlbGV0ZUluO1xuTGlzdFByb3RvdHlwZS51cGRhdGUgPSB1cGRhdGU7XG5MaXN0UHJvdG90eXBlLnVwZGF0ZUluID0gdXBkYXRlSW47XG5MaXN0UHJvdG90eXBlLm1lcmdlSW4gPSBtZXJnZUluO1xuTGlzdFByb3RvdHlwZS5tZXJnZURlZXBJbiA9IG1lcmdlRGVlcEluO1xuTGlzdFByb3RvdHlwZS53aXRoTXV0YXRpb25zID0gd2l0aE11dGF0aW9ucztcbkxpc3RQcm90b3R5cGUud2FzQWx0ZXJlZCA9IHdhc0FsdGVyZWQ7XG5MaXN0UHJvdG90eXBlLmFzSW1tdXRhYmxlID0gYXNJbW11dGFibGU7XG5MaXN0UHJvdG90eXBlWydAQHRyYW5zZHVjZXIvaW5pdCddID0gTGlzdFByb3RvdHlwZS5hc011dGFibGUgPSBhc011dGFibGU7XG5MaXN0UHJvdG90eXBlWydAQHRyYW5zZHVjZXIvc3RlcCddID0gZnVuY3Rpb24gKHJlc3VsdCwgYXJyKSB7XG4gIHJldHVybiByZXN1bHQucHVzaChhcnIpO1xufTtcbkxpc3RQcm90b3R5cGVbJ0BAdHJhbnNkdWNlci9yZXN1bHQnXSA9IGZ1bmN0aW9uIChvYmopIHtcbiAgcmV0dXJuIG9iai5hc0ltbXV0YWJsZSgpO1xufTtcblxudmFyIFZOb2RlID0gZnVuY3Rpb24gVk5vZGUoYXJyYXksIG93bmVySUQpIHtcbiAgdGhpcy5hcnJheSA9IGFycmF5O1xuICB0aGlzLm93bmVySUQgPSBvd25lcklEO1xufTtcblxuLy8gVE9ETzogc2VlbXMgbGlrZSB0aGVzZSBtZXRob2RzIGFyZSB2ZXJ5IHNpbWlsYXJcblxuVk5vZGUucHJvdG90eXBlLnJlbW92ZUJlZm9yZSA9IGZ1bmN0aW9uIHJlbW92ZUJlZm9yZSAob3duZXJJRCwgbGV2ZWwsIGluZGV4KSB7XG4gIGlmIChpbmRleCA9PT0gbGV2ZWwgPyAxIDw8IGxldmVsIDogdGhpcy5hcnJheS5sZW5ndGggPT09IDApIHtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuICB2YXIgb3JpZ2luSW5kZXggPSAoaW5kZXggPj4+IGxldmVsKSAmIE1BU0s7XG4gIGlmIChvcmlnaW5JbmRleCA+PSB0aGlzLmFycmF5Lmxlbmd0aCkge1xuICAgIHJldHVybiBuZXcgVk5vZGUoW10sIG93bmVySUQpO1xuICB9XG4gIHZhciByZW1vdmluZ0ZpcnN0ID0gb3JpZ2luSW5kZXggPT09IDA7XG4gIHZhciBuZXdDaGlsZDtcbiAgaWYgKGxldmVsID4gMCkge1xuICAgIHZhciBvbGRDaGlsZCA9IHRoaXMuYXJyYXlbb3JpZ2luSW5kZXhdO1xuICAgIG5ld0NoaWxkID1cbiAgICAgIG9sZENoaWxkICYmIG9sZENoaWxkLnJlbW92ZUJlZm9yZShvd25lcklELCBsZXZlbCAtIFNISUZULCBpbmRleCk7XG4gICAgaWYgKG5ld0NoaWxkID09PSBvbGRDaGlsZCAmJiByZW1vdmluZ0ZpcnN0KSB7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9XG4gIH1cbiAgaWYgKHJlbW92aW5nRmlyc3QgJiYgIW5ld0NoaWxkKSB7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cbiAgdmFyIGVkaXRhYmxlID0gZWRpdGFibGVWTm9kZSh0aGlzLCBvd25lcklEKTtcbiAgaWYgKCFyZW1vdmluZ0ZpcnN0KSB7XG4gICAgZm9yICh2YXIgaWkgPSAwOyBpaSA8IG9yaWdpbkluZGV4OyBpaSsrKSB7XG4gICAgICBlZGl0YWJsZS5hcnJheVtpaV0gPSB1bmRlZmluZWQ7XG4gICAgfVxuICB9XG4gIGlmIChuZXdDaGlsZCkge1xuICAgIGVkaXRhYmxlLmFycmF5W29yaWdpbkluZGV4XSA9IG5ld0NoaWxkO1xuICB9XG4gIHJldHVybiBlZGl0YWJsZTtcbn07XG5cblZOb2RlLnByb3RvdHlwZS5yZW1vdmVBZnRlciA9IGZ1bmN0aW9uIHJlbW92ZUFmdGVyIChvd25lcklELCBsZXZlbCwgaW5kZXgpIHtcbiAgaWYgKGluZGV4ID09PSAobGV2ZWwgPyAxIDw8IGxldmVsIDogMCkgfHwgdGhpcy5hcnJheS5sZW5ndGggPT09IDApIHtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuICB2YXIgc2l6ZUluZGV4ID0gKChpbmRleCAtIDEpID4+PiBsZXZlbCkgJiBNQVNLO1xuICBpZiAoc2l6ZUluZGV4ID49IHRoaXMuYXJyYXkubGVuZ3RoKSB7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICB2YXIgbmV3Q2hpbGQ7XG4gIGlmIChsZXZlbCA+IDApIHtcbiAgICB2YXIgb2xkQ2hpbGQgPSB0aGlzLmFycmF5W3NpemVJbmRleF07XG4gICAgbmV3Q2hpbGQgPVxuICAgICAgb2xkQ2hpbGQgJiYgb2xkQ2hpbGQucmVtb3ZlQWZ0ZXIob3duZXJJRCwgbGV2ZWwgLSBTSElGVCwgaW5kZXgpO1xuICAgIGlmIChuZXdDaGlsZCA9PT0gb2xkQ2hpbGQgJiYgc2l6ZUluZGV4ID09PSB0aGlzLmFycmF5Lmxlbmd0aCAtIDEpIHtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbiAgfVxuXG4gIHZhciBlZGl0YWJsZSA9IGVkaXRhYmxlVk5vZGUodGhpcywgb3duZXJJRCk7XG4gIGVkaXRhYmxlLmFycmF5LnNwbGljZShzaXplSW5kZXggKyAxKTtcbiAgaWYgKG5ld0NoaWxkKSB7XG4gICAgZWRpdGFibGUuYXJyYXlbc2l6ZUluZGV4XSA9IG5ld0NoaWxkO1xuICB9XG4gIHJldHVybiBlZGl0YWJsZTtcbn07XG5cbnZhciBET05FID0ge307XG5cbmZ1bmN0aW9uIGl0ZXJhdGVMaXN0KGxpc3QsIHJldmVyc2UpIHtcbiAgdmFyIGxlZnQgPSBsaXN0Ll9vcmlnaW47XG4gIHZhciByaWdodCA9IGxpc3QuX2NhcGFjaXR5O1xuICB2YXIgdGFpbFBvcyA9IGdldFRhaWxPZmZzZXQocmlnaHQpO1xuICB2YXIgdGFpbCA9IGxpc3QuX3RhaWw7XG5cbiAgcmV0dXJuIGl0ZXJhdGVOb2RlT3JMZWFmKGxpc3QuX3Jvb3QsIGxpc3QuX2xldmVsLCAwKTtcblxuICBmdW5jdGlvbiBpdGVyYXRlTm9kZU9yTGVhZihub2RlLCBsZXZlbCwgb2Zmc2V0KSB7XG4gICAgcmV0dXJuIGxldmVsID09PSAwXG4gICAgICA/IGl0ZXJhdGVMZWFmKG5vZGUsIG9mZnNldClcbiAgICAgIDogaXRlcmF0ZU5vZGUobm9kZSwgbGV2ZWwsIG9mZnNldCk7XG4gIH1cblxuICBmdW5jdGlvbiBpdGVyYXRlTGVhZihub2RlLCBvZmZzZXQpIHtcbiAgICB2YXIgYXJyYXkgPSBvZmZzZXQgPT09IHRhaWxQb3MgPyB0YWlsICYmIHRhaWwuYXJyYXkgOiBub2RlICYmIG5vZGUuYXJyYXk7XG4gICAgdmFyIGZyb20gPSBvZmZzZXQgPiBsZWZ0ID8gMCA6IGxlZnQgLSBvZmZzZXQ7XG4gICAgdmFyIHRvID0gcmlnaHQgLSBvZmZzZXQ7XG4gICAgaWYgKHRvID4gU0laRSkge1xuICAgICAgdG8gPSBTSVpFO1xuICAgIH1cbiAgICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgICAgaWYgKGZyb20gPT09IHRvKSB7XG4gICAgICAgIHJldHVybiBET05FO1xuICAgICAgfVxuICAgICAgdmFyIGlkeCA9IHJldmVyc2UgPyAtLXRvIDogZnJvbSsrO1xuICAgICAgcmV0dXJuIGFycmF5ICYmIGFycmF5W2lkeF07XG4gICAgfTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGl0ZXJhdGVOb2RlKG5vZGUsIGxldmVsLCBvZmZzZXQpIHtcbiAgICB2YXIgdmFsdWVzO1xuICAgIHZhciBhcnJheSA9IG5vZGUgJiYgbm9kZS5hcnJheTtcbiAgICB2YXIgZnJvbSA9IG9mZnNldCA+IGxlZnQgPyAwIDogKGxlZnQgLSBvZmZzZXQpID4+IGxldmVsO1xuICAgIHZhciB0byA9ICgocmlnaHQgLSBvZmZzZXQpID4+IGxldmVsKSArIDE7XG4gICAgaWYgKHRvID4gU0laRSkge1xuICAgICAgdG8gPSBTSVpFO1xuICAgIH1cbiAgICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgICAgd2hpbGUgKHRydWUpIHtcbiAgICAgICAgaWYgKHZhbHVlcykge1xuICAgICAgICAgIHZhciB2YWx1ZSA9IHZhbHVlcygpO1xuICAgICAgICAgIGlmICh2YWx1ZSAhPT0gRE9ORSkge1xuICAgICAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgICAgICAgIH1cbiAgICAgICAgICB2YWx1ZXMgPSBudWxsO1xuICAgICAgICB9XG4gICAgICAgIGlmIChmcm9tID09PSB0bykge1xuICAgICAgICAgIHJldHVybiBET05FO1xuICAgICAgICB9XG4gICAgICAgIHZhciBpZHggPSByZXZlcnNlID8gLS10byA6IGZyb20rKztcbiAgICAgICAgdmFsdWVzID0gaXRlcmF0ZU5vZGVPckxlYWYoXG4gICAgICAgICAgYXJyYXkgJiYgYXJyYXlbaWR4XSxcbiAgICAgICAgICBsZXZlbCAtIFNISUZULFxuICAgICAgICAgIG9mZnNldCArIChpZHggPDwgbGV2ZWwpXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgfTtcbiAgfVxufVxuXG5mdW5jdGlvbiBtYWtlTGlzdChvcmlnaW4sIGNhcGFjaXR5LCBsZXZlbCwgcm9vdCwgdGFpbCwgb3duZXJJRCwgaGFzaCkge1xuICB2YXIgbGlzdCA9IE9iamVjdC5jcmVhdGUoTGlzdFByb3RvdHlwZSk7XG4gIGxpc3Quc2l6ZSA9IGNhcGFjaXR5IC0gb3JpZ2luO1xuICBsaXN0Ll9vcmlnaW4gPSBvcmlnaW47XG4gIGxpc3QuX2NhcGFjaXR5ID0gY2FwYWNpdHk7XG4gIGxpc3QuX2xldmVsID0gbGV2ZWw7XG4gIGxpc3QuX3Jvb3QgPSByb290O1xuICBsaXN0Ll90YWlsID0gdGFpbDtcbiAgbGlzdC5fX293bmVySUQgPSBvd25lcklEO1xuICBsaXN0Ll9faGFzaCA9IGhhc2g7XG4gIGxpc3QuX19hbHRlcmVkID0gZmFsc2U7XG4gIHJldHVybiBsaXN0O1xufVxuXG52YXIgRU1QVFlfTElTVDtcbmZ1bmN0aW9uIGVtcHR5TGlzdCgpIHtcbiAgcmV0dXJuIEVNUFRZX0xJU1QgfHwgKEVNUFRZX0xJU1QgPSBtYWtlTGlzdCgwLCAwLCBTSElGVCkpO1xufVxuXG5mdW5jdGlvbiB1cGRhdGVMaXN0KGxpc3QsIGluZGV4LCB2YWx1ZSkge1xuICBpbmRleCA9IHdyYXBJbmRleChsaXN0LCBpbmRleCk7XG5cbiAgaWYgKGluZGV4ICE9PSBpbmRleCkge1xuICAgIHJldHVybiBsaXN0O1xuICB9XG5cbiAgaWYgKGluZGV4ID49IGxpc3Quc2l6ZSB8fCBpbmRleCA8IDApIHtcbiAgICByZXR1cm4gbGlzdC53aXRoTXV0YXRpb25zKGZ1bmN0aW9uIChsaXN0KSB7XG4gICAgICBpbmRleCA8IDBcbiAgICAgICAgPyBzZXRMaXN0Qm91bmRzKGxpc3QsIGluZGV4KS5zZXQoMCwgdmFsdWUpXG4gICAgICAgIDogc2V0TGlzdEJvdW5kcyhsaXN0LCAwLCBpbmRleCArIDEpLnNldChpbmRleCwgdmFsdWUpO1xuICAgIH0pO1xuICB9XG5cbiAgaW5kZXggKz0gbGlzdC5fb3JpZ2luO1xuXG4gIHZhciBuZXdUYWlsID0gbGlzdC5fdGFpbDtcbiAgdmFyIG5ld1Jvb3QgPSBsaXN0Ll9yb290O1xuICB2YXIgZGlkQWx0ZXIgPSBNYWtlUmVmKCk7XG4gIGlmIChpbmRleCA+PSBnZXRUYWlsT2Zmc2V0KGxpc3QuX2NhcGFjaXR5KSkge1xuICAgIG5ld1RhaWwgPSB1cGRhdGVWTm9kZShuZXdUYWlsLCBsaXN0Ll9fb3duZXJJRCwgMCwgaW5kZXgsIHZhbHVlLCBkaWRBbHRlcik7XG4gIH0gZWxzZSB7XG4gICAgbmV3Um9vdCA9IHVwZGF0ZVZOb2RlKFxuICAgICAgbmV3Um9vdCxcbiAgICAgIGxpc3QuX19vd25lcklELFxuICAgICAgbGlzdC5fbGV2ZWwsXG4gICAgICBpbmRleCxcbiAgICAgIHZhbHVlLFxuICAgICAgZGlkQWx0ZXJcbiAgICApO1xuICB9XG5cbiAgaWYgKCFkaWRBbHRlci52YWx1ZSkge1xuICAgIHJldHVybiBsaXN0O1xuICB9XG5cbiAgaWYgKGxpc3QuX19vd25lcklEKSB7XG4gICAgbGlzdC5fcm9vdCA9IG5ld1Jvb3Q7XG4gICAgbGlzdC5fdGFpbCA9IG5ld1RhaWw7XG4gICAgbGlzdC5fX2hhc2ggPSB1bmRlZmluZWQ7XG4gICAgbGlzdC5fX2FsdGVyZWQgPSB0cnVlO1xuICAgIHJldHVybiBsaXN0O1xuICB9XG4gIHJldHVybiBtYWtlTGlzdChsaXN0Ll9vcmlnaW4sIGxpc3QuX2NhcGFjaXR5LCBsaXN0Ll9sZXZlbCwgbmV3Um9vdCwgbmV3VGFpbCk7XG59XG5cbmZ1bmN0aW9uIHVwZGF0ZVZOb2RlKG5vZGUsIG93bmVySUQsIGxldmVsLCBpbmRleCwgdmFsdWUsIGRpZEFsdGVyKSB7XG4gIHZhciBpZHggPSAoaW5kZXggPj4+IGxldmVsKSAmIE1BU0s7XG4gIHZhciBub2RlSGFzID0gbm9kZSAmJiBpZHggPCBub2RlLmFycmF5Lmxlbmd0aDtcbiAgaWYgKCFub2RlSGFzICYmIHZhbHVlID09PSB1bmRlZmluZWQpIHtcbiAgICByZXR1cm4gbm9kZTtcbiAgfVxuXG4gIHZhciBuZXdOb2RlO1xuXG4gIGlmIChsZXZlbCA+IDApIHtcbiAgICB2YXIgbG93ZXJOb2RlID0gbm9kZSAmJiBub2RlLmFycmF5W2lkeF07XG4gICAgdmFyIG5ld0xvd2VyTm9kZSA9IHVwZGF0ZVZOb2RlKFxuICAgICAgbG93ZXJOb2RlLFxuICAgICAgb3duZXJJRCxcbiAgICAgIGxldmVsIC0gU0hJRlQsXG4gICAgICBpbmRleCxcbiAgICAgIHZhbHVlLFxuICAgICAgZGlkQWx0ZXJcbiAgICApO1xuICAgIGlmIChuZXdMb3dlck5vZGUgPT09IGxvd2VyTm9kZSkge1xuICAgICAgcmV0dXJuIG5vZGU7XG4gICAgfVxuICAgIG5ld05vZGUgPSBlZGl0YWJsZVZOb2RlKG5vZGUsIG93bmVySUQpO1xuICAgIG5ld05vZGUuYXJyYXlbaWR4XSA9IG5ld0xvd2VyTm9kZTtcbiAgICByZXR1cm4gbmV3Tm9kZTtcbiAgfVxuXG4gIGlmIChub2RlSGFzICYmIG5vZGUuYXJyYXlbaWR4XSA9PT0gdmFsdWUpIHtcbiAgICByZXR1cm4gbm9kZTtcbiAgfVxuXG4gIGlmIChkaWRBbHRlcikge1xuICAgIFNldFJlZihkaWRBbHRlcik7XG4gIH1cblxuICBuZXdOb2RlID0gZWRpdGFibGVWTm9kZShub2RlLCBvd25lcklEKTtcbiAgaWYgKHZhbHVlID09PSB1bmRlZmluZWQgJiYgaWR4ID09PSBuZXdOb2RlLmFycmF5Lmxlbmd0aCAtIDEpIHtcbiAgICBuZXdOb2RlLmFycmF5LnBvcCgpO1xuICB9IGVsc2Uge1xuICAgIG5ld05vZGUuYXJyYXlbaWR4XSA9IHZhbHVlO1xuICB9XG4gIHJldHVybiBuZXdOb2RlO1xufVxuXG5mdW5jdGlvbiBlZGl0YWJsZVZOb2RlKG5vZGUsIG93bmVySUQpIHtcbiAgaWYgKG93bmVySUQgJiYgbm9kZSAmJiBvd25lcklEID09PSBub2RlLm93bmVySUQpIHtcbiAgICByZXR1cm4gbm9kZTtcbiAgfVxuICByZXR1cm4gbmV3IFZOb2RlKG5vZGUgPyBub2RlLmFycmF5LnNsaWNlKCkgOiBbXSwgb3duZXJJRCk7XG59XG5cbmZ1bmN0aW9uIGxpc3ROb2RlRm9yKGxpc3QsIHJhd0luZGV4KSB7XG4gIGlmIChyYXdJbmRleCA+PSBnZXRUYWlsT2Zmc2V0KGxpc3QuX2NhcGFjaXR5KSkge1xuICAgIHJldHVybiBsaXN0Ll90YWlsO1xuICB9XG4gIGlmIChyYXdJbmRleCA8IDEgPDwgKGxpc3QuX2xldmVsICsgU0hJRlQpKSB7XG4gICAgdmFyIG5vZGUgPSBsaXN0Ll9yb290O1xuICAgIHZhciBsZXZlbCA9IGxpc3QuX2xldmVsO1xuICAgIHdoaWxlIChub2RlICYmIGxldmVsID4gMCkge1xuICAgICAgbm9kZSA9IG5vZGUuYXJyYXlbKHJhd0luZGV4ID4+PiBsZXZlbCkgJiBNQVNLXTtcbiAgICAgIGxldmVsIC09IFNISUZUO1xuICAgIH1cbiAgICByZXR1cm4gbm9kZTtcbiAgfVxufVxuXG5mdW5jdGlvbiBzZXRMaXN0Qm91bmRzKGxpc3QsIGJlZ2luLCBlbmQpIHtcbiAgLy8gU2FuaXRpemUgYmVnaW4gJiBlbmQgdXNpbmcgdGhpcyBzaG9ydGhhbmQgZm9yIFRvSW50MzIoYXJndW1lbnQpXG4gIC8vIGh0dHA6Ly93d3cuZWNtYS1pbnRlcm5hdGlvbmFsLm9yZy9lY21hLTI2Mi82LjAvI3NlYy10b2ludDMyXG4gIGlmIChiZWdpbiAhPT0gdW5kZWZpbmVkKSB7XG4gICAgYmVnaW4gfD0gMDtcbiAgfVxuICBpZiAoZW5kICE9PSB1bmRlZmluZWQpIHtcbiAgICBlbmQgfD0gMDtcbiAgfVxuICB2YXIgb3duZXIgPSBsaXN0Ll9fb3duZXJJRCB8fCBuZXcgT3duZXJJRCgpO1xuICB2YXIgb2xkT3JpZ2luID0gbGlzdC5fb3JpZ2luO1xuICB2YXIgb2xkQ2FwYWNpdHkgPSBsaXN0Ll9jYXBhY2l0eTtcbiAgdmFyIG5ld09yaWdpbiA9IG9sZE9yaWdpbiArIGJlZ2luO1xuICB2YXIgbmV3Q2FwYWNpdHkgPVxuICAgIGVuZCA9PT0gdW5kZWZpbmVkXG4gICAgICA/IG9sZENhcGFjaXR5XG4gICAgICA6IGVuZCA8IDBcbiAgICAgID8gb2xkQ2FwYWNpdHkgKyBlbmRcbiAgICAgIDogb2xkT3JpZ2luICsgZW5kO1xuICBpZiAobmV3T3JpZ2luID09PSBvbGRPcmlnaW4gJiYgbmV3Q2FwYWNpdHkgPT09IG9sZENhcGFjaXR5KSB7XG4gICAgcmV0dXJuIGxpc3Q7XG4gIH1cblxuICAvLyBJZiBpdCdzIGdvaW5nIHRvIGVuZCBhZnRlciBpdCBzdGFydHMsIGl0J3MgZW1wdHkuXG4gIGlmIChuZXdPcmlnaW4gPj0gbmV3Q2FwYWNpdHkpIHtcbiAgICByZXR1cm4gbGlzdC5jbGVhcigpO1xuICB9XG5cbiAgdmFyIG5ld0xldmVsID0gbGlzdC5fbGV2ZWw7XG4gIHZhciBuZXdSb290ID0gbGlzdC5fcm9vdDtcblxuICAvLyBOZXcgb3JpZ2luIG1pZ2h0IG5lZWQgY3JlYXRpbmcgYSBoaWdoZXIgcm9vdC5cbiAgdmFyIG9mZnNldFNoaWZ0ID0gMDtcbiAgd2hpbGUgKG5ld09yaWdpbiArIG9mZnNldFNoaWZ0IDwgMCkge1xuICAgIG5ld1Jvb3QgPSBuZXcgVk5vZGUoXG4gICAgICBuZXdSb290ICYmIG5ld1Jvb3QuYXJyYXkubGVuZ3RoID8gW3VuZGVmaW5lZCwgbmV3Um9vdF0gOiBbXSxcbiAgICAgIG93bmVyXG4gICAgKTtcbiAgICBuZXdMZXZlbCArPSBTSElGVDtcbiAgICBvZmZzZXRTaGlmdCArPSAxIDw8IG5ld0xldmVsO1xuICB9XG4gIGlmIChvZmZzZXRTaGlmdCkge1xuICAgIG5ld09yaWdpbiArPSBvZmZzZXRTaGlmdDtcbiAgICBvbGRPcmlnaW4gKz0gb2Zmc2V0U2hpZnQ7XG4gICAgbmV3Q2FwYWNpdHkgKz0gb2Zmc2V0U2hpZnQ7XG4gICAgb2xkQ2FwYWNpdHkgKz0gb2Zmc2V0U2hpZnQ7XG4gIH1cblxuICB2YXIgb2xkVGFpbE9mZnNldCA9IGdldFRhaWxPZmZzZXQob2xkQ2FwYWNpdHkpO1xuICB2YXIgbmV3VGFpbE9mZnNldCA9IGdldFRhaWxPZmZzZXQobmV3Q2FwYWNpdHkpO1xuXG4gIC8vIE5ldyBzaXplIG1pZ2h0IG5lZWQgY3JlYXRpbmcgYSBoaWdoZXIgcm9vdC5cbiAgd2hpbGUgKG5ld1RhaWxPZmZzZXQgPj0gMSA8PCAobmV3TGV2ZWwgKyBTSElGVCkpIHtcbiAgICBuZXdSb290ID0gbmV3IFZOb2RlKFxuICAgICAgbmV3Um9vdCAmJiBuZXdSb290LmFycmF5Lmxlbmd0aCA/IFtuZXdSb290XSA6IFtdLFxuICAgICAgb3duZXJcbiAgICApO1xuICAgIG5ld0xldmVsICs9IFNISUZUO1xuICB9XG5cbiAgLy8gTG9jYXRlIG9yIGNyZWF0ZSB0aGUgbmV3IHRhaWwuXG4gIHZhciBvbGRUYWlsID0gbGlzdC5fdGFpbDtcbiAgdmFyIG5ld1RhaWwgPVxuICAgIG5ld1RhaWxPZmZzZXQgPCBvbGRUYWlsT2Zmc2V0XG4gICAgICA/IGxpc3ROb2RlRm9yKGxpc3QsIG5ld0NhcGFjaXR5IC0gMSlcbiAgICAgIDogbmV3VGFpbE9mZnNldCA+IG9sZFRhaWxPZmZzZXRcbiAgICAgID8gbmV3IFZOb2RlKFtdLCBvd25lcilcbiAgICAgIDogb2xkVGFpbDtcblxuICAvLyBNZXJnZSBUYWlsIGludG8gdHJlZS5cbiAgaWYgKFxuICAgIG9sZFRhaWwgJiZcbiAgICBuZXdUYWlsT2Zmc2V0ID4gb2xkVGFpbE9mZnNldCAmJlxuICAgIG5ld09yaWdpbiA8IG9sZENhcGFjaXR5ICYmXG4gICAgb2xkVGFpbC5hcnJheS5sZW5ndGhcbiAgKSB7XG4gICAgbmV3Um9vdCA9IGVkaXRhYmxlVk5vZGUobmV3Um9vdCwgb3duZXIpO1xuICAgIHZhciBub2RlID0gbmV3Um9vdDtcbiAgICBmb3IgKHZhciBsZXZlbCA9IG5ld0xldmVsOyBsZXZlbCA+IFNISUZUOyBsZXZlbCAtPSBTSElGVCkge1xuICAgICAgdmFyIGlkeCA9IChvbGRUYWlsT2Zmc2V0ID4+PiBsZXZlbCkgJiBNQVNLO1xuICAgICAgbm9kZSA9IG5vZGUuYXJyYXlbaWR4XSA9IGVkaXRhYmxlVk5vZGUobm9kZS5hcnJheVtpZHhdLCBvd25lcik7XG4gICAgfVxuICAgIG5vZGUuYXJyYXlbKG9sZFRhaWxPZmZzZXQgPj4+IFNISUZUKSAmIE1BU0tdID0gb2xkVGFpbDtcbiAgfVxuXG4gIC8vIElmIHRoZSBzaXplIGhhcyBiZWVuIHJlZHVjZWQsIHRoZXJlJ3MgYSBjaGFuY2UgdGhlIHRhaWwgbmVlZHMgdG8gYmUgdHJpbW1lZC5cbiAgaWYgKG5ld0NhcGFjaXR5IDwgb2xkQ2FwYWNpdHkpIHtcbiAgICBuZXdUYWlsID0gbmV3VGFpbCAmJiBuZXdUYWlsLnJlbW92ZUFmdGVyKG93bmVyLCAwLCBuZXdDYXBhY2l0eSk7XG4gIH1cblxuICAvLyBJZiB0aGUgbmV3IG9yaWdpbiBpcyB3aXRoaW4gdGhlIHRhaWwsIHRoZW4gd2UgZG8gbm90IG5lZWQgYSByb290LlxuICBpZiAobmV3T3JpZ2luID49IG5ld1RhaWxPZmZzZXQpIHtcbiAgICBuZXdPcmlnaW4gLT0gbmV3VGFpbE9mZnNldDtcbiAgICBuZXdDYXBhY2l0eSAtPSBuZXdUYWlsT2Zmc2V0O1xuICAgIG5ld0xldmVsID0gU0hJRlQ7XG4gICAgbmV3Um9vdCA9IG51bGw7XG4gICAgbmV3VGFpbCA9IG5ld1RhaWwgJiYgbmV3VGFpbC5yZW1vdmVCZWZvcmUob3duZXIsIDAsIG5ld09yaWdpbik7XG5cbiAgICAvLyBPdGhlcndpc2UsIGlmIHRoZSByb290IGhhcyBiZWVuIHRyaW1tZWQsIGdhcmJhZ2UgY29sbGVjdC5cbiAgfSBlbHNlIGlmIChuZXdPcmlnaW4gPiBvbGRPcmlnaW4gfHwgbmV3VGFpbE9mZnNldCA8IG9sZFRhaWxPZmZzZXQpIHtcbiAgICBvZmZzZXRTaGlmdCA9IDA7XG5cbiAgICAvLyBJZGVudGlmeSB0aGUgbmV3IHRvcCByb290IG5vZGUgb2YgdGhlIHN1YnRyZWUgb2YgdGhlIG9sZCByb290LlxuICAgIHdoaWxlIChuZXdSb290KSB7XG4gICAgICB2YXIgYmVnaW5JbmRleCA9IChuZXdPcmlnaW4gPj4+IG5ld0xldmVsKSAmIE1BU0s7XG4gICAgICBpZiAoKGJlZ2luSW5kZXggIT09IG5ld1RhaWxPZmZzZXQgPj4+IG5ld0xldmVsKSAmIE1BU0spIHtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgICBpZiAoYmVnaW5JbmRleCkge1xuICAgICAgICBvZmZzZXRTaGlmdCArPSAoMSA8PCBuZXdMZXZlbCkgKiBiZWdpbkluZGV4O1xuICAgICAgfVxuICAgICAgbmV3TGV2ZWwgLT0gU0hJRlQ7XG4gICAgICBuZXdSb290ID0gbmV3Um9vdC5hcnJheVtiZWdpbkluZGV4XTtcbiAgICB9XG5cbiAgICAvLyBUcmltIHRoZSBuZXcgc2lkZXMgb2YgdGhlIG5ldyByb290LlxuICAgIGlmIChuZXdSb290ICYmIG5ld09yaWdpbiA+IG9sZE9yaWdpbikge1xuICAgICAgbmV3Um9vdCA9IG5ld1Jvb3QucmVtb3ZlQmVmb3JlKG93bmVyLCBuZXdMZXZlbCwgbmV3T3JpZ2luIC0gb2Zmc2V0U2hpZnQpO1xuICAgIH1cbiAgICBpZiAobmV3Um9vdCAmJiBuZXdUYWlsT2Zmc2V0IDwgb2xkVGFpbE9mZnNldCkge1xuICAgICAgbmV3Um9vdCA9IG5ld1Jvb3QucmVtb3ZlQWZ0ZXIoXG4gICAgICAgIG93bmVyLFxuICAgICAgICBuZXdMZXZlbCxcbiAgICAgICAgbmV3VGFpbE9mZnNldCAtIG9mZnNldFNoaWZ0XG4gICAgICApO1xuICAgIH1cbiAgICBpZiAob2Zmc2V0U2hpZnQpIHtcbiAgICAgIG5ld09yaWdpbiAtPSBvZmZzZXRTaGlmdDtcbiAgICAgIG5ld0NhcGFjaXR5IC09IG9mZnNldFNoaWZ0O1xuICAgIH1cbiAgfVxuXG4gIGlmIChsaXN0Ll9fb3duZXJJRCkge1xuICAgIGxpc3Quc2l6ZSA9IG5ld0NhcGFjaXR5IC0gbmV3T3JpZ2luO1xuICAgIGxpc3QuX29yaWdpbiA9IG5ld09yaWdpbjtcbiAgICBsaXN0Ll9jYXBhY2l0eSA9IG5ld0NhcGFjaXR5O1xuICAgIGxpc3QuX2xldmVsID0gbmV3TGV2ZWw7XG4gICAgbGlzdC5fcm9vdCA9IG5ld1Jvb3Q7XG4gICAgbGlzdC5fdGFpbCA9IG5ld1RhaWw7XG4gICAgbGlzdC5fX2hhc2ggPSB1bmRlZmluZWQ7XG4gICAgbGlzdC5fX2FsdGVyZWQgPSB0cnVlO1xuICAgIHJldHVybiBsaXN0O1xuICB9XG4gIHJldHVybiBtYWtlTGlzdChuZXdPcmlnaW4sIG5ld0NhcGFjaXR5LCBuZXdMZXZlbCwgbmV3Um9vdCwgbmV3VGFpbCk7XG59XG5cbmZ1bmN0aW9uIGdldFRhaWxPZmZzZXQoc2l6ZSkge1xuICByZXR1cm4gc2l6ZSA8IFNJWkUgPyAwIDogKChzaXplIC0gMSkgPj4+IFNISUZUKSA8PCBTSElGVDtcbn1cblxudmFyIE9yZGVyZWRNYXAgPSAvKkBfX1BVUkVfXyovKGZ1bmN0aW9uIChNYXApIHtcbiAgZnVuY3Rpb24gT3JkZXJlZE1hcCh2YWx1ZSkge1xuICAgIHJldHVybiB2YWx1ZSA9PT0gdW5kZWZpbmVkIHx8IHZhbHVlID09PSBudWxsXG4gICAgICA/IGVtcHR5T3JkZXJlZE1hcCgpXG4gICAgICA6IGlzT3JkZXJlZE1hcCh2YWx1ZSlcbiAgICAgID8gdmFsdWVcbiAgICAgIDogZW1wdHlPcmRlcmVkTWFwKCkud2l0aE11dGF0aW9ucyhmdW5jdGlvbiAobWFwKSB7XG4gICAgICAgICAgdmFyIGl0ZXIgPSBLZXllZENvbGxlY3Rpb24odmFsdWUpO1xuICAgICAgICAgIGFzc2VydE5vdEluZmluaXRlKGl0ZXIuc2l6ZSk7XG4gICAgICAgICAgaXRlci5mb3JFYWNoKGZ1bmN0aW9uICh2LCBrKSB7IHJldHVybiBtYXAuc2V0KGssIHYpOyB9KTtcbiAgICAgICAgfSk7XG4gIH1cblxuICBpZiAoIE1hcCApIE9yZGVyZWRNYXAuX19wcm90b19fID0gTWFwO1xuICBPcmRlcmVkTWFwLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoIE1hcCAmJiBNYXAucHJvdG90eXBlICk7XG4gIE9yZGVyZWRNYXAucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gT3JkZXJlZE1hcDtcblxuICBPcmRlcmVkTWFwLm9mID0gZnVuY3Rpb24gb2YgKC8qLi4udmFsdWVzKi8pIHtcbiAgICByZXR1cm4gdGhpcyhhcmd1bWVudHMpO1xuICB9O1xuXG4gIE9yZGVyZWRNYXAucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24gdG9TdHJpbmcgKCkge1xuICAgIHJldHVybiB0aGlzLl9fdG9TdHJpbmcoJ09yZGVyZWRNYXAgeycsICd9Jyk7XG4gIH07XG5cbiAgLy8gQHByYWdtYSBBY2Nlc3NcblxuICBPcmRlcmVkTWFwLnByb3RvdHlwZS5nZXQgPSBmdW5jdGlvbiBnZXQgKGssIG5vdFNldFZhbHVlKSB7XG4gICAgdmFyIGluZGV4ID0gdGhpcy5fbWFwLmdldChrKTtcbiAgICByZXR1cm4gaW5kZXggIT09IHVuZGVmaW5lZCA/IHRoaXMuX2xpc3QuZ2V0KGluZGV4KVsxXSA6IG5vdFNldFZhbHVlO1xuICB9O1xuXG4gIC8vIEBwcmFnbWEgTW9kaWZpY2F0aW9uXG5cbiAgT3JkZXJlZE1hcC5wcm90b3R5cGUuY2xlYXIgPSBmdW5jdGlvbiBjbGVhciAoKSB7XG4gICAgaWYgKHRoaXMuc2l6ZSA9PT0gMCkge1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuICAgIGlmICh0aGlzLl9fb3duZXJJRCkge1xuICAgICAgdGhpcy5zaXplID0gMDtcbiAgICAgIHRoaXMuX21hcC5jbGVhcigpO1xuICAgICAgdGhpcy5fbGlzdC5jbGVhcigpO1xuICAgICAgdGhpcy5fX2FsdGVyZWQgPSB0cnVlO1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuICAgIHJldHVybiBlbXB0eU9yZGVyZWRNYXAoKTtcbiAgfTtcblxuICBPcmRlcmVkTWFwLnByb3RvdHlwZS5zZXQgPSBmdW5jdGlvbiBzZXQgKGssIHYpIHtcbiAgICByZXR1cm4gdXBkYXRlT3JkZXJlZE1hcCh0aGlzLCBrLCB2KTtcbiAgfTtcblxuICBPcmRlcmVkTWFwLnByb3RvdHlwZS5yZW1vdmUgPSBmdW5jdGlvbiByZW1vdmUgKGspIHtcbiAgICByZXR1cm4gdXBkYXRlT3JkZXJlZE1hcCh0aGlzLCBrLCBOT1RfU0VUKTtcbiAgfTtcblxuICBPcmRlcmVkTWFwLnByb3RvdHlwZS5fX2l0ZXJhdGUgPSBmdW5jdGlvbiBfX2l0ZXJhdGUgKGZuLCByZXZlcnNlKSB7XG4gICAgdmFyIHRoaXMkMSQxID0gdGhpcztcblxuICAgIHJldHVybiB0aGlzLl9saXN0Ll9faXRlcmF0ZShcbiAgICAgIGZ1bmN0aW9uIChlbnRyeSkgeyByZXR1cm4gZW50cnkgJiYgZm4oZW50cnlbMV0sIGVudHJ5WzBdLCB0aGlzJDEkMSk7IH0sXG4gICAgICByZXZlcnNlXG4gICAgKTtcbiAgfTtcblxuICBPcmRlcmVkTWFwLnByb3RvdHlwZS5fX2l0ZXJhdG9yID0gZnVuY3Rpb24gX19pdGVyYXRvciAodHlwZSwgcmV2ZXJzZSkge1xuICAgIHJldHVybiB0aGlzLl9saXN0LmZyb21FbnRyeVNlcSgpLl9faXRlcmF0b3IodHlwZSwgcmV2ZXJzZSk7XG4gIH07XG5cbiAgT3JkZXJlZE1hcC5wcm90b3R5cGUuX19lbnN1cmVPd25lciA9IGZ1bmN0aW9uIF9fZW5zdXJlT3duZXIgKG93bmVySUQpIHtcbiAgICBpZiAob3duZXJJRCA9PT0gdGhpcy5fX293bmVySUQpIHtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbiAgICB2YXIgbmV3TWFwID0gdGhpcy5fbWFwLl9fZW5zdXJlT3duZXIob3duZXJJRCk7XG4gICAgdmFyIG5ld0xpc3QgPSB0aGlzLl9saXN0Ll9fZW5zdXJlT3duZXIob3duZXJJRCk7XG4gICAgaWYgKCFvd25lcklEKSB7XG4gICAgICBpZiAodGhpcy5zaXplID09PSAwKSB7XG4gICAgICAgIHJldHVybiBlbXB0eU9yZGVyZWRNYXAoKTtcbiAgICAgIH1cbiAgICAgIHRoaXMuX19vd25lcklEID0gb3duZXJJRDtcbiAgICAgIHRoaXMuX19hbHRlcmVkID0gZmFsc2U7XG4gICAgICB0aGlzLl9tYXAgPSBuZXdNYXA7XG4gICAgICB0aGlzLl9saXN0ID0gbmV3TGlzdDtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbiAgICByZXR1cm4gbWFrZU9yZGVyZWRNYXAobmV3TWFwLCBuZXdMaXN0LCBvd25lcklELCB0aGlzLl9faGFzaCk7XG4gIH07XG5cbiAgcmV0dXJuIE9yZGVyZWRNYXA7XG59KE1hcCkpO1xuXG5PcmRlcmVkTWFwLmlzT3JkZXJlZE1hcCA9IGlzT3JkZXJlZE1hcDtcblxuT3JkZXJlZE1hcC5wcm90b3R5cGVbSVNfT1JERVJFRF9TWU1CT0xdID0gdHJ1ZTtcbk9yZGVyZWRNYXAucHJvdG90eXBlW0RFTEVURV0gPSBPcmRlcmVkTWFwLnByb3RvdHlwZS5yZW1vdmU7XG5cbmZ1bmN0aW9uIG1ha2VPcmRlcmVkTWFwKG1hcCwgbGlzdCwgb3duZXJJRCwgaGFzaCkge1xuICB2YXIgb21hcCA9IE9iamVjdC5jcmVhdGUoT3JkZXJlZE1hcC5wcm90b3R5cGUpO1xuICBvbWFwLnNpemUgPSBtYXAgPyBtYXAuc2l6ZSA6IDA7XG4gIG9tYXAuX21hcCA9IG1hcDtcbiAgb21hcC5fbGlzdCA9IGxpc3Q7XG4gIG9tYXAuX19vd25lcklEID0gb3duZXJJRDtcbiAgb21hcC5fX2hhc2ggPSBoYXNoO1xuICBvbWFwLl9fYWx0ZXJlZCA9IGZhbHNlO1xuICByZXR1cm4gb21hcDtcbn1cblxudmFyIEVNUFRZX09SREVSRURfTUFQO1xuZnVuY3Rpb24gZW1wdHlPcmRlcmVkTWFwKCkge1xuICByZXR1cm4gKFxuICAgIEVNUFRZX09SREVSRURfTUFQIHx8XG4gICAgKEVNUFRZX09SREVSRURfTUFQID0gbWFrZU9yZGVyZWRNYXAoZW1wdHlNYXAoKSwgZW1wdHlMaXN0KCkpKVxuICApO1xufVxuXG5mdW5jdGlvbiB1cGRhdGVPcmRlcmVkTWFwKG9tYXAsIGssIHYpIHtcbiAgdmFyIG1hcCA9IG9tYXAuX21hcDtcbiAgdmFyIGxpc3QgPSBvbWFwLl9saXN0O1xuICB2YXIgaSA9IG1hcC5nZXQoayk7XG4gIHZhciBoYXMgPSBpICE9PSB1bmRlZmluZWQ7XG4gIHZhciBuZXdNYXA7XG4gIHZhciBuZXdMaXN0O1xuICBpZiAodiA9PT0gTk9UX1NFVCkge1xuICAgIC8vIHJlbW92ZWRcbiAgICBpZiAoIWhhcykge1xuICAgICAgcmV0dXJuIG9tYXA7XG4gICAgfVxuICAgIGlmIChsaXN0LnNpemUgPj0gU0laRSAmJiBsaXN0LnNpemUgPj0gbWFwLnNpemUgKiAyKSB7XG4gICAgICBuZXdMaXN0ID0gbGlzdC5maWx0ZXIoZnVuY3Rpb24gKGVudHJ5LCBpZHgpIHsgcmV0dXJuIGVudHJ5ICE9PSB1bmRlZmluZWQgJiYgaSAhPT0gaWR4OyB9KTtcbiAgICAgIG5ld01hcCA9IG5ld0xpc3RcbiAgICAgICAgLnRvS2V5ZWRTZXEoKVxuICAgICAgICAubWFwKGZ1bmN0aW9uIChlbnRyeSkgeyByZXR1cm4gZW50cnlbMF07IH0pXG4gICAgICAgIC5mbGlwKClcbiAgICAgICAgLnRvTWFwKCk7XG4gICAgICBpZiAob21hcC5fX293bmVySUQpIHtcbiAgICAgICAgbmV3TWFwLl9fb3duZXJJRCA9IG5ld0xpc3QuX19vd25lcklEID0gb21hcC5fX293bmVySUQ7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIG5ld01hcCA9IG1hcC5yZW1vdmUoayk7XG4gICAgICBuZXdMaXN0ID0gaSA9PT0gbGlzdC5zaXplIC0gMSA/IGxpc3QucG9wKCkgOiBsaXN0LnNldChpLCB1bmRlZmluZWQpO1xuICAgIH1cbiAgfSBlbHNlIGlmIChoYXMpIHtcbiAgICBpZiAodiA9PT0gbGlzdC5nZXQoaSlbMV0pIHtcbiAgICAgIHJldHVybiBvbWFwO1xuICAgIH1cbiAgICBuZXdNYXAgPSBtYXA7XG4gICAgbmV3TGlzdCA9IGxpc3Quc2V0KGksIFtrLCB2XSk7XG4gIH0gZWxzZSB7XG4gICAgbmV3TWFwID0gbWFwLnNldChrLCBsaXN0LnNpemUpO1xuICAgIG5ld0xpc3QgPSBsaXN0LnNldChsaXN0LnNpemUsIFtrLCB2XSk7XG4gIH1cbiAgaWYgKG9tYXAuX19vd25lcklEKSB7XG4gICAgb21hcC5zaXplID0gbmV3TWFwLnNpemU7XG4gICAgb21hcC5fbWFwID0gbmV3TWFwO1xuICAgIG9tYXAuX2xpc3QgPSBuZXdMaXN0O1xuICAgIG9tYXAuX19oYXNoID0gdW5kZWZpbmVkO1xuICAgIG9tYXAuX19hbHRlcmVkID0gdHJ1ZTtcbiAgICByZXR1cm4gb21hcDtcbiAgfVxuICByZXR1cm4gbWFrZU9yZGVyZWRNYXAobmV3TWFwLCBuZXdMaXN0KTtcbn1cblxudmFyIElTX1NUQUNLX1NZTUJPTCA9ICdAQF9fSU1NVVRBQkxFX1NUQUNLX19AQCc7XG5cbmZ1bmN0aW9uIGlzU3RhY2sobWF5YmVTdGFjaykge1xuICByZXR1cm4gQm9vbGVhbihtYXliZVN0YWNrICYmIG1heWJlU3RhY2tbSVNfU1RBQ0tfU1lNQk9MXSk7XG59XG5cbnZhciBTdGFjayA9IC8qQF9fUFVSRV9fKi8oZnVuY3Rpb24gKEluZGV4ZWRDb2xsZWN0aW9uKSB7XG4gIGZ1bmN0aW9uIFN0YWNrKHZhbHVlKSB7XG4gICAgcmV0dXJuIHZhbHVlID09PSB1bmRlZmluZWQgfHwgdmFsdWUgPT09IG51bGxcbiAgICAgID8gZW1wdHlTdGFjaygpXG4gICAgICA6IGlzU3RhY2sodmFsdWUpXG4gICAgICA/IHZhbHVlXG4gICAgICA6IGVtcHR5U3RhY2soKS5wdXNoQWxsKHZhbHVlKTtcbiAgfVxuXG4gIGlmICggSW5kZXhlZENvbGxlY3Rpb24gKSBTdGFjay5fX3Byb3RvX18gPSBJbmRleGVkQ29sbGVjdGlvbjtcbiAgU3RhY2sucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZSggSW5kZXhlZENvbGxlY3Rpb24gJiYgSW5kZXhlZENvbGxlY3Rpb24ucHJvdG90eXBlICk7XG4gIFN0YWNrLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IFN0YWNrO1xuXG4gIFN0YWNrLm9mID0gZnVuY3Rpb24gb2YgKC8qLi4udmFsdWVzKi8pIHtcbiAgICByZXR1cm4gdGhpcyhhcmd1bWVudHMpO1xuICB9O1xuXG4gIFN0YWNrLnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uIHRvU3RyaW5nICgpIHtcbiAgICByZXR1cm4gdGhpcy5fX3RvU3RyaW5nKCdTdGFjayBbJywgJ10nKTtcbiAgfTtcblxuICAvLyBAcHJhZ21hIEFjY2Vzc1xuXG4gIFN0YWNrLnByb3RvdHlwZS5nZXQgPSBmdW5jdGlvbiBnZXQgKGluZGV4LCBub3RTZXRWYWx1ZSkge1xuICAgIHZhciBoZWFkID0gdGhpcy5faGVhZDtcbiAgICBpbmRleCA9IHdyYXBJbmRleCh0aGlzLCBpbmRleCk7XG4gICAgd2hpbGUgKGhlYWQgJiYgaW5kZXgtLSkge1xuICAgICAgaGVhZCA9IGhlYWQubmV4dDtcbiAgICB9XG4gICAgcmV0dXJuIGhlYWQgPyBoZWFkLnZhbHVlIDogbm90U2V0VmFsdWU7XG4gIH07XG5cbiAgU3RhY2sucHJvdG90eXBlLnBlZWsgPSBmdW5jdGlvbiBwZWVrICgpIHtcbiAgICByZXR1cm4gdGhpcy5faGVhZCAmJiB0aGlzLl9oZWFkLnZhbHVlO1xuICB9O1xuXG4gIC8vIEBwcmFnbWEgTW9kaWZpY2F0aW9uXG5cbiAgU3RhY2sucHJvdG90eXBlLnB1c2ggPSBmdW5jdGlvbiBwdXNoICgvKi4uLnZhbHVlcyovKSB7XG4gICAgdmFyIGFyZ3VtZW50cyQxID0gYXJndW1lbnRzO1xuXG4gICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDApIHtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbiAgICB2YXIgbmV3U2l6ZSA9IHRoaXMuc2l6ZSArIGFyZ3VtZW50cy5sZW5ndGg7XG4gICAgdmFyIGhlYWQgPSB0aGlzLl9oZWFkO1xuICAgIGZvciAodmFyIGlpID0gYXJndW1lbnRzLmxlbmd0aCAtIDE7IGlpID49IDA7IGlpLS0pIHtcbiAgICAgIGhlYWQgPSB7XG4gICAgICAgIHZhbHVlOiBhcmd1bWVudHMkMVtpaV0sXG4gICAgICAgIG5leHQ6IGhlYWQsXG4gICAgICB9O1xuICAgIH1cbiAgICBpZiAodGhpcy5fX293bmVySUQpIHtcbiAgICAgIHRoaXMuc2l6ZSA9IG5ld1NpemU7XG4gICAgICB0aGlzLl9oZWFkID0gaGVhZDtcbiAgICAgIHRoaXMuX19oYXNoID0gdW5kZWZpbmVkO1xuICAgICAgdGhpcy5fX2FsdGVyZWQgPSB0cnVlO1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuICAgIHJldHVybiBtYWtlU3RhY2sobmV3U2l6ZSwgaGVhZCk7XG4gIH07XG5cbiAgU3RhY2sucHJvdG90eXBlLnB1c2hBbGwgPSBmdW5jdGlvbiBwdXNoQWxsIChpdGVyKSB7XG4gICAgaXRlciA9IEluZGV4ZWRDb2xsZWN0aW9uKGl0ZXIpO1xuICAgIGlmIChpdGVyLnNpemUgPT09IDApIHtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbiAgICBpZiAodGhpcy5zaXplID09PSAwICYmIGlzU3RhY2soaXRlcikpIHtcbiAgICAgIHJldHVybiBpdGVyO1xuICAgIH1cbiAgICBhc3NlcnROb3RJbmZpbml0ZShpdGVyLnNpemUpO1xuICAgIHZhciBuZXdTaXplID0gdGhpcy5zaXplO1xuICAgIHZhciBoZWFkID0gdGhpcy5faGVhZDtcbiAgICBpdGVyLl9faXRlcmF0ZShmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgIG5ld1NpemUrKztcbiAgICAgIGhlYWQgPSB7XG4gICAgICAgIHZhbHVlOiB2YWx1ZSxcbiAgICAgICAgbmV4dDogaGVhZCxcbiAgICAgIH07XG4gICAgfSwgLyogcmV2ZXJzZSAqLyB0cnVlKTtcbiAgICBpZiAodGhpcy5fX293bmVySUQpIHtcbiAgICAgIHRoaXMuc2l6ZSA9IG5ld1NpemU7XG4gICAgICB0aGlzLl9oZWFkID0gaGVhZDtcbiAgICAgIHRoaXMuX19oYXNoID0gdW5kZWZpbmVkO1xuICAgICAgdGhpcy5fX2FsdGVyZWQgPSB0cnVlO1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuICAgIHJldHVybiBtYWtlU3RhY2sobmV3U2l6ZSwgaGVhZCk7XG4gIH07XG5cbiAgU3RhY2sucHJvdG90eXBlLnBvcCA9IGZ1bmN0aW9uIHBvcCAoKSB7XG4gICAgcmV0dXJuIHRoaXMuc2xpY2UoMSk7XG4gIH07XG5cbiAgU3RhY2sucHJvdG90eXBlLmNsZWFyID0gZnVuY3Rpb24gY2xlYXIgKCkge1xuICAgIGlmICh0aGlzLnNpemUgPT09IDApIHtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbiAgICBpZiAodGhpcy5fX293bmVySUQpIHtcbiAgICAgIHRoaXMuc2l6ZSA9IDA7XG4gICAgICB0aGlzLl9oZWFkID0gdW5kZWZpbmVkO1xuICAgICAgdGhpcy5fX2hhc2ggPSB1bmRlZmluZWQ7XG4gICAgICB0aGlzLl9fYWx0ZXJlZCA9IHRydWU7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9XG4gICAgcmV0dXJuIGVtcHR5U3RhY2soKTtcbiAgfTtcblxuICBTdGFjay5wcm90b3R5cGUuc2xpY2UgPSBmdW5jdGlvbiBzbGljZSAoYmVnaW4sIGVuZCkge1xuICAgIGlmICh3aG9sZVNsaWNlKGJlZ2luLCBlbmQsIHRoaXMuc2l6ZSkpIHtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbiAgICB2YXIgcmVzb2x2ZWRCZWdpbiA9IHJlc29sdmVCZWdpbihiZWdpbiwgdGhpcy5zaXplKTtcbiAgICB2YXIgcmVzb2x2ZWRFbmQgPSByZXNvbHZlRW5kKGVuZCwgdGhpcy5zaXplKTtcbiAgICBpZiAocmVzb2x2ZWRFbmQgIT09IHRoaXMuc2l6ZSkge1xuICAgICAgLy8gc3VwZXIuc2xpY2UoYmVnaW4sIGVuZCk7XG4gICAgICByZXR1cm4gSW5kZXhlZENvbGxlY3Rpb24ucHJvdG90eXBlLnNsaWNlLmNhbGwodGhpcywgYmVnaW4sIGVuZCk7XG4gICAgfVxuICAgIHZhciBuZXdTaXplID0gdGhpcy5zaXplIC0gcmVzb2x2ZWRCZWdpbjtcbiAgICB2YXIgaGVhZCA9IHRoaXMuX2hlYWQ7XG4gICAgd2hpbGUgKHJlc29sdmVkQmVnaW4tLSkge1xuICAgICAgaGVhZCA9IGhlYWQubmV4dDtcbiAgICB9XG4gICAgaWYgKHRoaXMuX19vd25lcklEKSB7XG4gICAgICB0aGlzLnNpemUgPSBuZXdTaXplO1xuICAgICAgdGhpcy5faGVhZCA9IGhlYWQ7XG4gICAgICB0aGlzLl9faGFzaCA9IHVuZGVmaW5lZDtcbiAgICAgIHRoaXMuX19hbHRlcmVkID0gdHJ1ZTtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbiAgICByZXR1cm4gbWFrZVN0YWNrKG5ld1NpemUsIGhlYWQpO1xuICB9O1xuXG4gIC8vIEBwcmFnbWEgTXV0YWJpbGl0eVxuXG4gIFN0YWNrLnByb3RvdHlwZS5fX2Vuc3VyZU93bmVyID0gZnVuY3Rpb24gX19lbnN1cmVPd25lciAob3duZXJJRCkge1xuICAgIGlmIChvd25lcklEID09PSB0aGlzLl9fb3duZXJJRCkge1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuICAgIGlmICghb3duZXJJRCkge1xuICAgICAgaWYgKHRoaXMuc2l6ZSA9PT0gMCkge1xuICAgICAgICByZXR1cm4gZW1wdHlTdGFjaygpO1xuICAgICAgfVxuICAgICAgdGhpcy5fX293bmVySUQgPSBvd25lcklEO1xuICAgICAgdGhpcy5fX2FsdGVyZWQgPSBmYWxzZTtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbiAgICByZXR1cm4gbWFrZVN0YWNrKHRoaXMuc2l6ZSwgdGhpcy5faGVhZCwgb3duZXJJRCwgdGhpcy5fX2hhc2gpO1xuICB9O1xuXG4gIC8vIEBwcmFnbWEgSXRlcmF0aW9uXG5cbiAgU3RhY2sucHJvdG90eXBlLl9faXRlcmF0ZSA9IGZ1bmN0aW9uIF9faXRlcmF0ZSAoZm4sIHJldmVyc2UpIHtcbiAgICB2YXIgdGhpcyQxJDEgPSB0aGlzO1xuXG4gICAgaWYgKHJldmVyc2UpIHtcbiAgICAgIHJldHVybiBuZXcgQXJyYXlTZXEodGhpcy50b0FycmF5KCkpLl9faXRlcmF0ZShcbiAgICAgICAgZnVuY3Rpb24gKHYsIGspIHsgcmV0dXJuIGZuKHYsIGssIHRoaXMkMSQxKTsgfSxcbiAgICAgICAgcmV2ZXJzZVxuICAgICAgKTtcbiAgICB9XG4gICAgdmFyIGl0ZXJhdGlvbnMgPSAwO1xuICAgIHZhciBub2RlID0gdGhpcy5faGVhZDtcbiAgICB3aGlsZSAobm9kZSkge1xuICAgICAgaWYgKGZuKG5vZGUudmFsdWUsIGl0ZXJhdGlvbnMrKywgdGhpcykgPT09IGZhbHNlKSB7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgICAgbm9kZSA9IG5vZGUubmV4dDtcbiAgICB9XG4gICAgcmV0dXJuIGl0ZXJhdGlvbnM7XG4gIH07XG5cbiAgU3RhY2sucHJvdG90eXBlLl9faXRlcmF0b3IgPSBmdW5jdGlvbiBfX2l0ZXJhdG9yICh0eXBlLCByZXZlcnNlKSB7XG4gICAgaWYgKHJldmVyc2UpIHtcbiAgICAgIHJldHVybiBuZXcgQXJyYXlTZXEodGhpcy50b0FycmF5KCkpLl9faXRlcmF0b3IodHlwZSwgcmV2ZXJzZSk7XG4gICAgfVxuICAgIHZhciBpdGVyYXRpb25zID0gMDtcbiAgICB2YXIgbm9kZSA9IHRoaXMuX2hlYWQ7XG4gICAgcmV0dXJuIG5ldyBJdGVyYXRvcihmdW5jdGlvbiAoKSB7XG4gICAgICBpZiAobm9kZSkge1xuICAgICAgICB2YXIgdmFsdWUgPSBub2RlLnZhbHVlO1xuICAgICAgICBub2RlID0gbm9kZS5uZXh0O1xuICAgICAgICByZXR1cm4gaXRlcmF0b3JWYWx1ZSh0eXBlLCBpdGVyYXRpb25zKyssIHZhbHVlKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBpdGVyYXRvckRvbmUoKTtcbiAgICB9KTtcbiAgfTtcblxuICByZXR1cm4gU3RhY2s7XG59KEluZGV4ZWRDb2xsZWN0aW9uKSk7XG5cblN0YWNrLmlzU3RhY2sgPSBpc1N0YWNrO1xuXG52YXIgU3RhY2tQcm90b3R5cGUgPSBTdGFjay5wcm90b3R5cGU7XG5TdGFja1Byb3RvdHlwZVtJU19TVEFDS19TWU1CT0xdID0gdHJ1ZTtcblN0YWNrUHJvdG90eXBlLnNoaWZ0ID0gU3RhY2tQcm90b3R5cGUucG9wO1xuU3RhY2tQcm90b3R5cGUudW5zaGlmdCA9IFN0YWNrUHJvdG90eXBlLnB1c2g7XG5TdGFja1Byb3RvdHlwZS51bnNoaWZ0QWxsID0gU3RhY2tQcm90b3R5cGUucHVzaEFsbDtcblN0YWNrUHJvdG90eXBlLndpdGhNdXRhdGlvbnMgPSB3aXRoTXV0YXRpb25zO1xuU3RhY2tQcm90b3R5cGUud2FzQWx0ZXJlZCA9IHdhc0FsdGVyZWQ7XG5TdGFja1Byb3RvdHlwZS5hc0ltbXV0YWJsZSA9IGFzSW1tdXRhYmxlO1xuU3RhY2tQcm90b3R5cGVbJ0BAdHJhbnNkdWNlci9pbml0J10gPSBTdGFja1Byb3RvdHlwZS5hc011dGFibGUgPSBhc011dGFibGU7XG5TdGFja1Byb3RvdHlwZVsnQEB0cmFuc2R1Y2VyL3N0ZXAnXSA9IGZ1bmN0aW9uIChyZXN1bHQsIGFycikge1xuICByZXR1cm4gcmVzdWx0LnVuc2hpZnQoYXJyKTtcbn07XG5TdGFja1Byb3RvdHlwZVsnQEB0cmFuc2R1Y2VyL3Jlc3VsdCddID0gZnVuY3Rpb24gKG9iaikge1xuICByZXR1cm4gb2JqLmFzSW1tdXRhYmxlKCk7XG59O1xuXG5mdW5jdGlvbiBtYWtlU3RhY2soc2l6ZSwgaGVhZCwgb3duZXJJRCwgaGFzaCkge1xuICB2YXIgbWFwID0gT2JqZWN0LmNyZWF0ZShTdGFja1Byb3RvdHlwZSk7XG4gIG1hcC5zaXplID0gc2l6ZTtcbiAgbWFwLl9oZWFkID0gaGVhZDtcbiAgbWFwLl9fb3duZXJJRCA9IG93bmVySUQ7XG4gIG1hcC5fX2hhc2ggPSBoYXNoO1xuICBtYXAuX19hbHRlcmVkID0gZmFsc2U7XG4gIHJldHVybiBtYXA7XG59XG5cbnZhciBFTVBUWV9TVEFDSztcbmZ1bmN0aW9uIGVtcHR5U3RhY2soKSB7XG4gIHJldHVybiBFTVBUWV9TVEFDSyB8fCAoRU1QVFlfU1RBQ0sgPSBtYWtlU3RhY2soMCkpO1xufVxuXG52YXIgSVNfU0VUX1NZTUJPTCA9ICdAQF9fSU1NVVRBQkxFX1NFVF9fQEAnO1xuXG5mdW5jdGlvbiBpc1NldChtYXliZVNldCkge1xuICByZXR1cm4gQm9vbGVhbihtYXliZVNldCAmJiBtYXliZVNldFtJU19TRVRfU1lNQk9MXSk7XG59XG5cbmZ1bmN0aW9uIGlzT3JkZXJlZFNldChtYXliZU9yZGVyZWRTZXQpIHtcbiAgcmV0dXJuIGlzU2V0KG1heWJlT3JkZXJlZFNldCkgJiYgaXNPcmRlcmVkKG1heWJlT3JkZXJlZFNldCk7XG59XG5cbmZ1bmN0aW9uIGRlZXBFcXVhbChhLCBiKSB7XG4gIGlmIChhID09PSBiKSB7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICBpZiAoXG4gICAgIWlzQ29sbGVjdGlvbihiKSB8fFxuICAgIChhLnNpemUgIT09IHVuZGVmaW5lZCAmJiBiLnNpemUgIT09IHVuZGVmaW5lZCAmJiBhLnNpemUgIT09IGIuc2l6ZSkgfHxcbiAgICAoYS5fX2hhc2ggIT09IHVuZGVmaW5lZCAmJlxuICAgICAgYi5fX2hhc2ggIT09IHVuZGVmaW5lZCAmJlxuICAgICAgYS5fX2hhc2ggIT09IGIuX19oYXNoKSB8fFxuICAgIGlzS2V5ZWQoYSkgIT09IGlzS2V5ZWQoYikgfHxcbiAgICBpc0luZGV4ZWQoYSkgIT09IGlzSW5kZXhlZChiKSB8fFxuICAgIGlzT3JkZXJlZChhKSAhPT0gaXNPcmRlcmVkKGIpXG4gICkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIGlmIChhLnNpemUgPT09IDAgJiYgYi5zaXplID09PSAwKSB7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICB2YXIgbm90QXNzb2NpYXRpdmUgPSAhaXNBc3NvY2lhdGl2ZShhKTtcblxuICBpZiAoaXNPcmRlcmVkKGEpKSB7XG4gICAgdmFyIGVudHJpZXMgPSBhLmVudHJpZXMoKTtcbiAgICByZXR1cm4gKFxuICAgICAgYi5ldmVyeShmdW5jdGlvbiAodiwgaykge1xuICAgICAgICB2YXIgZW50cnkgPSBlbnRyaWVzLm5leHQoKS52YWx1ZTtcbiAgICAgICAgcmV0dXJuIGVudHJ5ICYmIGlzKGVudHJ5WzFdLCB2KSAmJiAobm90QXNzb2NpYXRpdmUgfHwgaXMoZW50cnlbMF0sIGspKTtcbiAgICAgIH0pICYmIGVudHJpZXMubmV4dCgpLmRvbmVcbiAgICApO1xuICB9XG5cbiAgdmFyIGZsaXBwZWQgPSBmYWxzZTtcblxuICBpZiAoYS5zaXplID09PSB1bmRlZmluZWQpIHtcbiAgICBpZiAoYi5zaXplID09PSB1bmRlZmluZWQpIHtcbiAgICAgIGlmICh0eXBlb2YgYS5jYWNoZVJlc3VsdCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICBhLmNhY2hlUmVzdWx0KCk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGZsaXBwZWQgPSB0cnVlO1xuICAgICAgdmFyIF8gPSBhO1xuICAgICAgYSA9IGI7XG4gICAgICBiID0gXztcbiAgICB9XG4gIH1cblxuICB2YXIgYWxsRXF1YWwgPSB0cnVlO1xuICB2YXIgYlNpemUgPSBiLl9faXRlcmF0ZShmdW5jdGlvbiAodiwgaykge1xuICAgIGlmIChcbiAgICAgIG5vdEFzc29jaWF0aXZlXG4gICAgICAgID8gIWEuaGFzKHYpXG4gICAgICAgIDogZmxpcHBlZFxuICAgICAgICA/ICFpcyh2LCBhLmdldChrLCBOT1RfU0VUKSlcbiAgICAgICAgOiAhaXMoYS5nZXQoaywgTk9UX1NFVCksIHYpXG4gICAgKSB7XG4gICAgICBhbGxFcXVhbCA9IGZhbHNlO1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgfSk7XG5cbiAgcmV0dXJuIGFsbEVxdWFsICYmIGEuc2l6ZSA9PT0gYlNpemU7XG59XG5cbmZ1bmN0aW9uIG1peGluKGN0b3IsIG1ldGhvZHMpIHtcbiAgdmFyIGtleUNvcGllciA9IGZ1bmN0aW9uIChrZXkpIHtcbiAgICBjdG9yLnByb3RvdHlwZVtrZXldID0gbWV0aG9kc1trZXldO1xuICB9O1xuICBPYmplY3Qua2V5cyhtZXRob2RzKS5mb3JFYWNoKGtleUNvcGllcik7XG4gIE9iamVjdC5nZXRPd25Qcm9wZXJ0eVN5bWJvbHMgJiZcbiAgICBPYmplY3QuZ2V0T3duUHJvcGVydHlTeW1ib2xzKG1ldGhvZHMpLmZvckVhY2goa2V5Q29waWVyKTtcbiAgcmV0dXJuIGN0b3I7XG59XG5cbmZ1bmN0aW9uIHRvSlModmFsdWUpIHtcbiAgaWYgKCF2YWx1ZSB8fCB0eXBlb2YgdmFsdWUgIT09ICdvYmplY3QnKSB7XG4gICAgcmV0dXJuIHZhbHVlO1xuICB9XG4gIGlmICghaXNDb2xsZWN0aW9uKHZhbHVlKSkge1xuICAgIGlmICghaXNEYXRhU3RydWN0dXJlKHZhbHVlKSkge1xuICAgICAgcmV0dXJuIHZhbHVlO1xuICAgIH1cbiAgICB2YWx1ZSA9IFNlcSh2YWx1ZSk7XG4gIH1cbiAgaWYgKGlzS2V5ZWQodmFsdWUpKSB7XG4gICAgdmFyIHJlc3VsdCQxID0ge307XG4gICAgdmFsdWUuX19pdGVyYXRlKGZ1bmN0aW9uICh2LCBrKSB7XG4gICAgICByZXN1bHQkMVtrXSA9IHRvSlModik7XG4gICAgfSk7XG4gICAgcmV0dXJuIHJlc3VsdCQxO1xuICB9XG4gIHZhciByZXN1bHQgPSBbXTtcbiAgdmFsdWUuX19pdGVyYXRlKGZ1bmN0aW9uICh2KSB7XG4gICAgcmVzdWx0LnB1c2godG9KUyh2KSk7XG4gIH0pO1xuICByZXR1cm4gcmVzdWx0O1xufVxuXG52YXIgU2V0ID0gLypAX19QVVJFX18qLyhmdW5jdGlvbiAoU2V0Q29sbGVjdGlvbikge1xuICBmdW5jdGlvbiBTZXQodmFsdWUpIHtcbiAgICByZXR1cm4gdmFsdWUgPT09IHVuZGVmaW5lZCB8fCB2YWx1ZSA9PT0gbnVsbFxuICAgICAgPyBlbXB0eVNldCgpXG4gICAgICA6IGlzU2V0KHZhbHVlKSAmJiAhaXNPcmRlcmVkKHZhbHVlKVxuICAgICAgPyB2YWx1ZVxuICAgICAgOiBlbXB0eVNldCgpLndpdGhNdXRhdGlvbnMoZnVuY3Rpb24gKHNldCkge1xuICAgICAgICAgIHZhciBpdGVyID0gU2V0Q29sbGVjdGlvbih2YWx1ZSk7XG4gICAgICAgICAgYXNzZXJ0Tm90SW5maW5pdGUoaXRlci5zaXplKTtcbiAgICAgICAgICBpdGVyLmZvckVhY2goZnVuY3Rpb24gKHYpIHsgcmV0dXJuIHNldC5hZGQodik7IH0pO1xuICAgICAgICB9KTtcbiAgfVxuXG4gIGlmICggU2V0Q29sbGVjdGlvbiApIFNldC5fX3Byb3RvX18gPSBTZXRDb2xsZWN0aW9uO1xuICBTZXQucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZSggU2V0Q29sbGVjdGlvbiAmJiBTZXRDb2xsZWN0aW9uLnByb3RvdHlwZSApO1xuICBTZXQucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gU2V0O1xuXG4gIFNldC5vZiA9IGZ1bmN0aW9uIG9mICgvKi4uLnZhbHVlcyovKSB7XG4gICAgcmV0dXJuIHRoaXMoYXJndW1lbnRzKTtcbiAgfTtcblxuICBTZXQuZnJvbUtleXMgPSBmdW5jdGlvbiBmcm9tS2V5cyAodmFsdWUpIHtcbiAgICByZXR1cm4gdGhpcyhLZXllZENvbGxlY3Rpb24odmFsdWUpLmtleVNlcSgpKTtcbiAgfTtcblxuICBTZXQuaW50ZXJzZWN0ID0gZnVuY3Rpb24gaW50ZXJzZWN0IChzZXRzKSB7XG4gICAgc2V0cyA9IENvbGxlY3Rpb24oc2V0cykudG9BcnJheSgpO1xuICAgIHJldHVybiBzZXRzLmxlbmd0aFxuICAgICAgPyBTZXRQcm90b3R5cGUuaW50ZXJzZWN0LmFwcGx5KFNldChzZXRzLnBvcCgpKSwgc2V0cylcbiAgICAgIDogZW1wdHlTZXQoKTtcbiAgfTtcblxuICBTZXQudW5pb24gPSBmdW5jdGlvbiB1bmlvbiAoc2V0cykge1xuICAgIHNldHMgPSBDb2xsZWN0aW9uKHNldHMpLnRvQXJyYXkoKTtcbiAgICByZXR1cm4gc2V0cy5sZW5ndGhcbiAgICAgID8gU2V0UHJvdG90eXBlLnVuaW9uLmFwcGx5KFNldChzZXRzLnBvcCgpKSwgc2V0cylcbiAgICAgIDogZW1wdHlTZXQoKTtcbiAgfTtcblxuICBTZXQucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24gdG9TdHJpbmcgKCkge1xuICAgIHJldHVybiB0aGlzLl9fdG9TdHJpbmcoJ1NldCB7JywgJ30nKTtcbiAgfTtcblxuICAvLyBAcHJhZ21hIEFjY2Vzc1xuXG4gIFNldC5wcm90b3R5cGUuaGFzID0gZnVuY3Rpb24gaGFzICh2YWx1ZSkge1xuICAgIHJldHVybiB0aGlzLl9tYXAuaGFzKHZhbHVlKTtcbiAgfTtcblxuICAvLyBAcHJhZ21hIE1vZGlmaWNhdGlvblxuXG4gIFNldC5wcm90b3R5cGUuYWRkID0gZnVuY3Rpb24gYWRkICh2YWx1ZSkge1xuICAgIHJldHVybiB1cGRhdGVTZXQodGhpcywgdGhpcy5fbWFwLnNldCh2YWx1ZSwgdmFsdWUpKTtcbiAgfTtcblxuICBTZXQucHJvdG90eXBlLnJlbW92ZSA9IGZ1bmN0aW9uIHJlbW92ZSAodmFsdWUpIHtcbiAgICByZXR1cm4gdXBkYXRlU2V0KHRoaXMsIHRoaXMuX21hcC5yZW1vdmUodmFsdWUpKTtcbiAgfTtcblxuICBTZXQucHJvdG90eXBlLmNsZWFyID0gZnVuY3Rpb24gY2xlYXIgKCkge1xuICAgIHJldHVybiB1cGRhdGVTZXQodGhpcywgdGhpcy5fbWFwLmNsZWFyKCkpO1xuICB9O1xuXG4gIC8vIEBwcmFnbWEgQ29tcG9zaXRpb25cblxuICBTZXQucHJvdG90eXBlLm1hcCA9IGZ1bmN0aW9uIG1hcCAobWFwcGVyLCBjb250ZXh0KSB7XG4gICAgdmFyIHRoaXMkMSQxID0gdGhpcztcblxuICAgIC8vIGtlZXAgdHJhY2sgaWYgdGhlIHNldCBpcyBhbHRlcmVkIGJ5IHRoZSBtYXAgZnVuY3Rpb25cbiAgICB2YXIgZGlkQ2hhbmdlcyA9IGZhbHNlO1xuXG4gICAgdmFyIG5ld01hcCA9IHVwZGF0ZVNldChcbiAgICAgIHRoaXMsXG4gICAgICB0aGlzLl9tYXAubWFwRW50cmllcyhmdW5jdGlvbiAocmVmKSB7XG4gICAgICAgIHZhciB2ID0gcmVmWzFdO1xuXG4gICAgICAgIHZhciBtYXBwZWQgPSBtYXBwZXIuY2FsbChjb250ZXh0LCB2LCB2LCB0aGlzJDEkMSk7XG5cbiAgICAgICAgaWYgKG1hcHBlZCAhPT0gdikge1xuICAgICAgICAgIGRpZENoYW5nZXMgPSB0cnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIFttYXBwZWQsIG1hcHBlZF07XG4gICAgICB9LCBjb250ZXh0KVxuICAgICk7XG5cbiAgICByZXR1cm4gZGlkQ2hhbmdlcyA/IG5ld01hcCA6IHRoaXM7XG4gIH07XG5cbiAgU2V0LnByb3RvdHlwZS51bmlvbiA9IGZ1bmN0aW9uIHVuaW9uICgpIHtcbiAgICB2YXIgaXRlcnMgPSBbXSwgbGVuID0gYXJndW1lbnRzLmxlbmd0aDtcbiAgICB3aGlsZSAoIGxlbi0tICkgaXRlcnNbIGxlbiBdID0gYXJndW1lbnRzWyBsZW4gXTtcblxuICAgIGl0ZXJzID0gaXRlcnMuZmlsdGVyKGZ1bmN0aW9uICh4KSB7IHJldHVybiB4LnNpemUgIT09IDA7IH0pO1xuICAgIGlmIChpdGVycy5sZW5ndGggPT09IDApIHtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbiAgICBpZiAodGhpcy5zaXplID09PSAwICYmICF0aGlzLl9fb3duZXJJRCAmJiBpdGVycy5sZW5ndGggPT09IDEpIHtcbiAgICAgIHJldHVybiB0aGlzLmNvbnN0cnVjdG9yKGl0ZXJzWzBdKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMud2l0aE11dGF0aW9ucyhmdW5jdGlvbiAoc2V0KSB7XG4gICAgICBmb3IgKHZhciBpaSA9IDA7IGlpIDwgaXRlcnMubGVuZ3RoOyBpaSsrKSB7XG4gICAgICAgIFNldENvbGxlY3Rpb24oaXRlcnNbaWldKS5mb3JFYWNoKGZ1bmN0aW9uICh2YWx1ZSkgeyByZXR1cm4gc2V0LmFkZCh2YWx1ZSk7IH0pO1xuICAgICAgfVxuICAgIH0pO1xuICB9O1xuXG4gIFNldC5wcm90b3R5cGUuaW50ZXJzZWN0ID0gZnVuY3Rpb24gaW50ZXJzZWN0ICgpIHtcbiAgICB2YXIgaXRlcnMgPSBbXSwgbGVuID0gYXJndW1lbnRzLmxlbmd0aDtcbiAgICB3aGlsZSAoIGxlbi0tICkgaXRlcnNbIGxlbiBdID0gYXJndW1lbnRzWyBsZW4gXTtcblxuICAgIGlmIChpdGVycy5sZW5ndGggPT09IDApIHtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbiAgICBpdGVycyA9IGl0ZXJzLm1hcChmdW5jdGlvbiAoaXRlcikgeyByZXR1cm4gU2V0Q29sbGVjdGlvbihpdGVyKTsgfSk7XG4gICAgdmFyIHRvUmVtb3ZlID0gW107XG4gICAgdGhpcy5mb3JFYWNoKGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgaWYgKCFpdGVycy5ldmVyeShmdW5jdGlvbiAoaXRlcikgeyByZXR1cm4gaXRlci5pbmNsdWRlcyh2YWx1ZSk7IH0pKSB7XG4gICAgICAgIHRvUmVtb3ZlLnB1c2godmFsdWUpO1xuICAgICAgfVxuICAgIH0pO1xuICAgIHJldHVybiB0aGlzLndpdGhNdXRhdGlvbnMoZnVuY3Rpb24gKHNldCkge1xuICAgICAgdG9SZW1vdmUuZm9yRWFjaChmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgc2V0LnJlbW92ZSh2YWx1ZSk7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfTtcblxuICBTZXQucHJvdG90eXBlLnN1YnRyYWN0ID0gZnVuY3Rpb24gc3VidHJhY3QgKCkge1xuICAgIHZhciBpdGVycyA9IFtdLCBsZW4gPSBhcmd1bWVudHMubGVuZ3RoO1xuICAgIHdoaWxlICggbGVuLS0gKSBpdGVyc1sgbGVuIF0gPSBhcmd1bWVudHNbIGxlbiBdO1xuXG4gICAgaWYgKGl0ZXJzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuICAgIGl0ZXJzID0gaXRlcnMubWFwKGZ1bmN0aW9uIChpdGVyKSB7IHJldHVybiBTZXRDb2xsZWN0aW9uKGl0ZXIpOyB9KTtcbiAgICB2YXIgdG9SZW1vdmUgPSBbXTtcbiAgICB0aGlzLmZvckVhY2goZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICBpZiAoaXRlcnMuc29tZShmdW5jdGlvbiAoaXRlcikgeyByZXR1cm4gaXRlci5pbmNsdWRlcyh2YWx1ZSk7IH0pKSB7XG4gICAgICAgIHRvUmVtb3ZlLnB1c2godmFsdWUpO1xuICAgICAgfVxuICAgIH0pO1xuICAgIHJldHVybiB0aGlzLndpdGhNdXRhdGlvbnMoZnVuY3Rpb24gKHNldCkge1xuICAgICAgdG9SZW1vdmUuZm9yRWFjaChmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgc2V0LnJlbW92ZSh2YWx1ZSk7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfTtcblxuICBTZXQucHJvdG90eXBlLnNvcnQgPSBmdW5jdGlvbiBzb3J0IChjb21wYXJhdG9yKSB7XG4gICAgLy8gTGF0ZSBiaW5kaW5nXG4gICAgcmV0dXJuIE9yZGVyZWRTZXQoc29ydEZhY3RvcnkodGhpcywgY29tcGFyYXRvcikpO1xuICB9O1xuXG4gIFNldC5wcm90b3R5cGUuc29ydEJ5ID0gZnVuY3Rpb24gc29ydEJ5IChtYXBwZXIsIGNvbXBhcmF0b3IpIHtcbiAgICAvLyBMYXRlIGJpbmRpbmdcbiAgICByZXR1cm4gT3JkZXJlZFNldChzb3J0RmFjdG9yeSh0aGlzLCBjb21wYXJhdG9yLCBtYXBwZXIpKTtcbiAgfTtcblxuICBTZXQucHJvdG90eXBlLndhc0FsdGVyZWQgPSBmdW5jdGlvbiB3YXNBbHRlcmVkICgpIHtcbiAgICByZXR1cm4gdGhpcy5fbWFwLndhc0FsdGVyZWQoKTtcbiAgfTtcblxuICBTZXQucHJvdG90eXBlLl9faXRlcmF0ZSA9IGZ1bmN0aW9uIF9faXRlcmF0ZSAoZm4sIHJldmVyc2UpIHtcbiAgICB2YXIgdGhpcyQxJDEgPSB0aGlzO1xuXG4gICAgcmV0dXJuIHRoaXMuX21hcC5fX2l0ZXJhdGUoZnVuY3Rpb24gKGspIHsgcmV0dXJuIGZuKGssIGssIHRoaXMkMSQxKTsgfSwgcmV2ZXJzZSk7XG4gIH07XG5cbiAgU2V0LnByb3RvdHlwZS5fX2l0ZXJhdG9yID0gZnVuY3Rpb24gX19pdGVyYXRvciAodHlwZSwgcmV2ZXJzZSkge1xuICAgIHJldHVybiB0aGlzLl9tYXAuX19pdGVyYXRvcih0eXBlLCByZXZlcnNlKTtcbiAgfTtcblxuICBTZXQucHJvdG90eXBlLl9fZW5zdXJlT3duZXIgPSBmdW5jdGlvbiBfX2Vuc3VyZU93bmVyIChvd25lcklEKSB7XG4gICAgaWYgKG93bmVySUQgPT09IHRoaXMuX19vd25lcklEKSB7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9XG4gICAgdmFyIG5ld01hcCA9IHRoaXMuX21hcC5fX2Vuc3VyZU93bmVyKG93bmVySUQpO1xuICAgIGlmICghb3duZXJJRCkge1xuICAgICAgaWYgKHRoaXMuc2l6ZSA9PT0gMCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fX2VtcHR5KCk7XG4gICAgICB9XG4gICAgICB0aGlzLl9fb3duZXJJRCA9IG93bmVySUQ7XG4gICAgICB0aGlzLl9tYXAgPSBuZXdNYXA7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuX19tYWtlKG5ld01hcCwgb3duZXJJRCk7XG4gIH07XG5cbiAgcmV0dXJuIFNldDtcbn0oU2V0Q29sbGVjdGlvbikpO1xuXG5TZXQuaXNTZXQgPSBpc1NldDtcblxudmFyIFNldFByb3RvdHlwZSA9IFNldC5wcm90b3R5cGU7XG5TZXRQcm90b3R5cGVbSVNfU0VUX1NZTUJPTF0gPSB0cnVlO1xuU2V0UHJvdG90eXBlW0RFTEVURV0gPSBTZXRQcm90b3R5cGUucmVtb3ZlO1xuU2V0UHJvdG90eXBlLm1lcmdlID0gU2V0UHJvdG90eXBlLmNvbmNhdCA9IFNldFByb3RvdHlwZS51bmlvbjtcblNldFByb3RvdHlwZS53aXRoTXV0YXRpb25zID0gd2l0aE11dGF0aW9ucztcblNldFByb3RvdHlwZS5hc0ltbXV0YWJsZSA9IGFzSW1tdXRhYmxlO1xuU2V0UHJvdG90eXBlWydAQHRyYW5zZHVjZXIvaW5pdCddID0gU2V0UHJvdG90eXBlLmFzTXV0YWJsZSA9IGFzTXV0YWJsZTtcblNldFByb3RvdHlwZVsnQEB0cmFuc2R1Y2VyL3N0ZXAnXSA9IGZ1bmN0aW9uIChyZXN1bHQsIGFycikge1xuICByZXR1cm4gcmVzdWx0LmFkZChhcnIpO1xufTtcblNldFByb3RvdHlwZVsnQEB0cmFuc2R1Y2VyL3Jlc3VsdCddID0gZnVuY3Rpb24gKG9iaikge1xuICByZXR1cm4gb2JqLmFzSW1tdXRhYmxlKCk7XG59O1xuXG5TZXRQcm90b3R5cGUuX19lbXB0eSA9IGVtcHR5U2V0O1xuU2V0UHJvdG90eXBlLl9fbWFrZSA9IG1ha2VTZXQ7XG5cbmZ1bmN0aW9uIHVwZGF0ZVNldChzZXQsIG5ld01hcCkge1xuICBpZiAoc2V0Ll9fb3duZXJJRCkge1xuICAgIHNldC5zaXplID0gbmV3TWFwLnNpemU7XG4gICAgc2V0Ll9tYXAgPSBuZXdNYXA7XG4gICAgcmV0dXJuIHNldDtcbiAgfVxuICByZXR1cm4gbmV3TWFwID09PSBzZXQuX21hcFxuICAgID8gc2V0XG4gICAgOiBuZXdNYXAuc2l6ZSA9PT0gMFxuICAgID8gc2V0Ll9fZW1wdHkoKVxuICAgIDogc2V0Ll9fbWFrZShuZXdNYXApO1xufVxuXG5mdW5jdGlvbiBtYWtlU2V0KG1hcCwgb3duZXJJRCkge1xuICB2YXIgc2V0ID0gT2JqZWN0LmNyZWF0ZShTZXRQcm90b3R5cGUpO1xuICBzZXQuc2l6ZSA9IG1hcCA/IG1hcC5zaXplIDogMDtcbiAgc2V0Ll9tYXAgPSBtYXA7XG4gIHNldC5fX293bmVySUQgPSBvd25lcklEO1xuICByZXR1cm4gc2V0O1xufVxuXG52YXIgRU1QVFlfU0VUO1xuZnVuY3Rpb24gZW1wdHlTZXQoKSB7XG4gIHJldHVybiBFTVBUWV9TRVQgfHwgKEVNUFRZX1NFVCA9IG1ha2VTZXQoZW1wdHlNYXAoKSkpO1xufVxuXG4vKipcbiAqIFJldHVybnMgYSBsYXp5IHNlcSBvZiBudW1zIGZyb20gc3RhcnQgKGluY2x1c2l2ZSkgdG8gZW5kXG4gKiAoZXhjbHVzaXZlKSwgYnkgc3RlcCwgd2hlcmUgc3RhcnQgZGVmYXVsdHMgdG8gMCwgc3RlcCB0byAxLCBhbmQgZW5kIHRvXG4gKiBpbmZpbml0eS4gV2hlbiBzdGFydCBpcyBlcXVhbCB0byBlbmQsIHJldHVybnMgZW1wdHkgbGlzdC5cbiAqL1xudmFyIFJhbmdlID0gLypAX19QVVJFX18qLyhmdW5jdGlvbiAoSW5kZXhlZFNlcSkge1xuICBmdW5jdGlvbiBSYW5nZShzdGFydCwgZW5kLCBzdGVwKSB7XG4gICAgaWYgKCEodGhpcyBpbnN0YW5jZW9mIFJhbmdlKSkge1xuICAgICAgcmV0dXJuIG5ldyBSYW5nZShzdGFydCwgZW5kLCBzdGVwKTtcbiAgICB9XG4gICAgaW52YXJpYW50KHN0ZXAgIT09IDAsICdDYW5ub3Qgc3RlcCBhIFJhbmdlIGJ5IDAnKTtcbiAgICBzdGFydCA9IHN0YXJ0IHx8IDA7XG4gICAgaWYgKGVuZCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICBlbmQgPSBJbmZpbml0eTtcbiAgICB9XG4gICAgc3RlcCA9IHN0ZXAgPT09IHVuZGVmaW5lZCA/IDEgOiBNYXRoLmFicyhzdGVwKTtcbiAgICBpZiAoZW5kIDwgc3RhcnQpIHtcbiAgICAgIHN0ZXAgPSAtc3RlcDtcbiAgICB9XG4gICAgdGhpcy5fc3RhcnQgPSBzdGFydDtcbiAgICB0aGlzLl9lbmQgPSBlbmQ7XG4gICAgdGhpcy5fc3RlcCA9IHN0ZXA7XG4gICAgdGhpcy5zaXplID0gTWF0aC5tYXgoMCwgTWF0aC5jZWlsKChlbmQgLSBzdGFydCkgLyBzdGVwIC0gMSkgKyAxKTtcbiAgICBpZiAodGhpcy5zaXplID09PSAwKSB7XG4gICAgICBpZiAoRU1QVFlfUkFOR0UpIHtcbiAgICAgICAgcmV0dXJuIEVNUFRZX1JBTkdFO1xuICAgICAgfVxuICAgICAgRU1QVFlfUkFOR0UgPSB0aGlzO1xuICAgIH1cbiAgfVxuXG4gIGlmICggSW5kZXhlZFNlcSApIFJhbmdlLl9fcHJvdG9fXyA9IEluZGV4ZWRTZXE7XG4gIFJhbmdlLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoIEluZGV4ZWRTZXEgJiYgSW5kZXhlZFNlcS5wcm90b3R5cGUgKTtcbiAgUmFuZ2UucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gUmFuZ2U7XG5cbiAgUmFuZ2UucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24gdG9TdHJpbmcgKCkge1xuICAgIGlmICh0aGlzLnNpemUgPT09IDApIHtcbiAgICAgIHJldHVybiAnUmFuZ2UgW10nO1xuICAgIH1cbiAgICByZXR1cm4gKFxuICAgICAgJ1JhbmdlIFsgJyArXG4gICAgICB0aGlzLl9zdGFydCArXG4gICAgICAnLi4uJyArXG4gICAgICB0aGlzLl9lbmQgK1xuICAgICAgKHRoaXMuX3N0ZXAgIT09IDEgPyAnIGJ5ICcgKyB0aGlzLl9zdGVwIDogJycpICtcbiAgICAgICcgXSdcbiAgICApO1xuICB9O1xuXG4gIFJhbmdlLnByb3RvdHlwZS5nZXQgPSBmdW5jdGlvbiBnZXQgKGluZGV4LCBub3RTZXRWYWx1ZSkge1xuICAgIHJldHVybiB0aGlzLmhhcyhpbmRleClcbiAgICAgID8gdGhpcy5fc3RhcnQgKyB3cmFwSW5kZXgodGhpcywgaW5kZXgpICogdGhpcy5fc3RlcFxuICAgICAgOiBub3RTZXRWYWx1ZTtcbiAgfTtcblxuICBSYW5nZS5wcm90b3R5cGUuaW5jbHVkZXMgPSBmdW5jdGlvbiBpbmNsdWRlcyAoc2VhcmNoVmFsdWUpIHtcbiAgICB2YXIgcG9zc2libGVJbmRleCA9IChzZWFyY2hWYWx1ZSAtIHRoaXMuX3N0YXJ0KSAvIHRoaXMuX3N0ZXA7XG4gICAgcmV0dXJuIChcbiAgICAgIHBvc3NpYmxlSW5kZXggPj0gMCAmJlxuICAgICAgcG9zc2libGVJbmRleCA8IHRoaXMuc2l6ZSAmJlxuICAgICAgcG9zc2libGVJbmRleCA9PT0gTWF0aC5mbG9vcihwb3NzaWJsZUluZGV4KVxuICAgICk7XG4gIH07XG5cbiAgUmFuZ2UucHJvdG90eXBlLnNsaWNlID0gZnVuY3Rpb24gc2xpY2UgKGJlZ2luLCBlbmQpIHtcbiAgICBpZiAod2hvbGVTbGljZShiZWdpbiwgZW5kLCB0aGlzLnNpemUpKSB7XG4gICAgICByZXR1cm4gdGhpcztcbiAgICB9XG4gICAgYmVnaW4gPSByZXNvbHZlQmVnaW4oYmVnaW4sIHRoaXMuc2l6ZSk7XG4gICAgZW5kID0gcmVzb2x2ZUVuZChlbmQsIHRoaXMuc2l6ZSk7XG4gICAgaWYgKGVuZCA8PSBiZWdpbikge1xuICAgICAgcmV0dXJuIG5ldyBSYW5nZSgwLCAwKTtcbiAgICB9XG4gICAgcmV0dXJuIG5ldyBSYW5nZShcbiAgICAgIHRoaXMuZ2V0KGJlZ2luLCB0aGlzLl9lbmQpLFxuICAgICAgdGhpcy5nZXQoZW5kLCB0aGlzLl9lbmQpLFxuICAgICAgdGhpcy5fc3RlcFxuICAgICk7XG4gIH07XG5cbiAgUmFuZ2UucHJvdG90eXBlLmluZGV4T2YgPSBmdW5jdGlvbiBpbmRleE9mIChzZWFyY2hWYWx1ZSkge1xuICAgIHZhciBvZmZzZXRWYWx1ZSA9IHNlYXJjaFZhbHVlIC0gdGhpcy5fc3RhcnQ7XG4gICAgaWYgKG9mZnNldFZhbHVlICUgdGhpcy5fc3RlcCA9PT0gMCkge1xuICAgICAgdmFyIGluZGV4ID0gb2Zmc2V0VmFsdWUgLyB0aGlzLl9zdGVwO1xuICAgICAgaWYgKGluZGV4ID49IDAgJiYgaW5kZXggPCB0aGlzLnNpemUpIHtcbiAgICAgICAgcmV0dXJuIGluZGV4O1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gLTE7XG4gIH07XG5cbiAgUmFuZ2UucHJvdG90eXBlLmxhc3RJbmRleE9mID0gZnVuY3Rpb24gbGFzdEluZGV4T2YgKHNlYXJjaFZhbHVlKSB7XG4gICAgcmV0dXJuIHRoaXMuaW5kZXhPZihzZWFyY2hWYWx1ZSk7XG4gIH07XG5cbiAgUmFuZ2UucHJvdG90eXBlLl9faXRlcmF0ZSA9IGZ1bmN0aW9uIF9faXRlcmF0ZSAoZm4sIHJldmVyc2UpIHtcbiAgICB2YXIgc2l6ZSA9IHRoaXMuc2l6ZTtcbiAgICB2YXIgc3RlcCA9IHRoaXMuX3N0ZXA7XG4gICAgdmFyIHZhbHVlID0gcmV2ZXJzZSA/IHRoaXMuX3N0YXJ0ICsgKHNpemUgLSAxKSAqIHN0ZXAgOiB0aGlzLl9zdGFydDtcbiAgICB2YXIgaSA9IDA7XG4gICAgd2hpbGUgKGkgIT09IHNpemUpIHtcbiAgICAgIGlmIChmbih2YWx1ZSwgcmV2ZXJzZSA/IHNpemUgLSArK2kgOiBpKyssIHRoaXMpID09PSBmYWxzZSkge1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICAgIHZhbHVlICs9IHJldmVyc2UgPyAtc3RlcCA6IHN0ZXA7XG4gICAgfVxuICAgIHJldHVybiBpO1xuICB9O1xuXG4gIFJhbmdlLnByb3RvdHlwZS5fX2l0ZXJhdG9yID0gZnVuY3Rpb24gX19pdGVyYXRvciAodHlwZSwgcmV2ZXJzZSkge1xuICAgIHZhciBzaXplID0gdGhpcy5zaXplO1xuICAgIHZhciBzdGVwID0gdGhpcy5fc3RlcDtcbiAgICB2YXIgdmFsdWUgPSByZXZlcnNlID8gdGhpcy5fc3RhcnQgKyAoc2l6ZSAtIDEpICogc3RlcCA6IHRoaXMuX3N0YXJ0O1xuICAgIHZhciBpID0gMDtcbiAgICByZXR1cm4gbmV3IEl0ZXJhdG9yKGZ1bmN0aW9uICgpIHtcbiAgICAgIGlmIChpID09PSBzaXplKSB7XG4gICAgICAgIHJldHVybiBpdGVyYXRvckRvbmUoKTtcbiAgICAgIH1cbiAgICAgIHZhciB2ID0gdmFsdWU7XG4gICAgICB2YWx1ZSArPSByZXZlcnNlID8gLXN0ZXAgOiBzdGVwO1xuICAgICAgcmV0dXJuIGl0ZXJhdG9yVmFsdWUodHlwZSwgcmV2ZXJzZSA/IHNpemUgLSArK2kgOiBpKyssIHYpO1xuICAgIH0pO1xuICB9O1xuXG4gIFJhbmdlLnByb3RvdHlwZS5lcXVhbHMgPSBmdW5jdGlvbiBlcXVhbHMgKG90aGVyKSB7XG4gICAgcmV0dXJuIG90aGVyIGluc3RhbmNlb2YgUmFuZ2VcbiAgICAgID8gdGhpcy5fc3RhcnQgPT09IG90aGVyLl9zdGFydCAmJlxuICAgICAgICAgIHRoaXMuX2VuZCA9PT0gb3RoZXIuX2VuZCAmJlxuICAgICAgICAgIHRoaXMuX3N0ZXAgPT09IG90aGVyLl9zdGVwXG4gICAgICA6IGRlZXBFcXVhbCh0aGlzLCBvdGhlcik7XG4gIH07XG5cbiAgcmV0dXJuIFJhbmdlO1xufShJbmRleGVkU2VxKSk7XG5cbnZhciBFTVBUWV9SQU5HRTtcblxuZnVuY3Rpb24gZ2V0SW4kMShjb2xsZWN0aW9uLCBzZWFyY2hLZXlQYXRoLCBub3RTZXRWYWx1ZSkge1xuICB2YXIga2V5UGF0aCA9IGNvZXJjZUtleVBhdGgoc2VhcmNoS2V5UGF0aCk7XG4gIHZhciBpID0gMDtcbiAgd2hpbGUgKGkgIT09IGtleVBhdGgubGVuZ3RoKSB7XG4gICAgY29sbGVjdGlvbiA9IGdldChjb2xsZWN0aW9uLCBrZXlQYXRoW2krK10sIE5PVF9TRVQpO1xuICAgIGlmIChjb2xsZWN0aW9uID09PSBOT1RfU0VUKSB7XG4gICAgICByZXR1cm4gbm90U2V0VmFsdWU7XG4gICAgfVxuICB9XG4gIHJldHVybiBjb2xsZWN0aW9uO1xufVxuXG5mdW5jdGlvbiBnZXRJbihzZWFyY2hLZXlQYXRoLCBub3RTZXRWYWx1ZSkge1xuICByZXR1cm4gZ2V0SW4kMSh0aGlzLCBzZWFyY2hLZXlQYXRoLCBub3RTZXRWYWx1ZSk7XG59XG5cbmZ1bmN0aW9uIGhhc0luJDEoY29sbGVjdGlvbiwga2V5UGF0aCkge1xuICByZXR1cm4gZ2V0SW4kMShjb2xsZWN0aW9uLCBrZXlQYXRoLCBOT1RfU0VUKSAhPT0gTk9UX1NFVDtcbn1cblxuZnVuY3Rpb24gaGFzSW4oc2VhcmNoS2V5UGF0aCkge1xuICByZXR1cm4gaGFzSW4kMSh0aGlzLCBzZWFyY2hLZXlQYXRoKTtcbn1cblxuZnVuY3Rpb24gdG9PYmplY3QoKSB7XG4gIGFzc2VydE5vdEluZmluaXRlKHRoaXMuc2l6ZSk7XG4gIHZhciBvYmplY3QgPSB7fTtcbiAgdGhpcy5fX2l0ZXJhdGUoZnVuY3Rpb24gKHYsIGspIHtcbiAgICBvYmplY3Rba10gPSB2O1xuICB9KTtcbiAgcmV0dXJuIG9iamVjdDtcbn1cblxuLy8gTm90ZTogYWxsIG9mIHRoZXNlIG1ldGhvZHMgYXJlIGRlcHJlY2F0ZWQuXG5Db2xsZWN0aW9uLmlzSXRlcmFibGUgPSBpc0NvbGxlY3Rpb247XG5Db2xsZWN0aW9uLmlzS2V5ZWQgPSBpc0tleWVkO1xuQ29sbGVjdGlvbi5pc0luZGV4ZWQgPSBpc0luZGV4ZWQ7XG5Db2xsZWN0aW9uLmlzQXNzb2NpYXRpdmUgPSBpc0Fzc29jaWF0aXZlO1xuQ29sbGVjdGlvbi5pc09yZGVyZWQgPSBpc09yZGVyZWQ7XG5cbkNvbGxlY3Rpb24uSXRlcmF0b3IgPSBJdGVyYXRvcjtcblxubWl4aW4oQ29sbGVjdGlvbiwge1xuICAvLyAjIyMgQ29udmVyc2lvbiB0byBvdGhlciB0eXBlc1xuXG4gIHRvQXJyYXk6IGZ1bmN0aW9uIHRvQXJyYXkoKSB7XG4gICAgYXNzZXJ0Tm90SW5maW5pdGUodGhpcy5zaXplKTtcbiAgICB2YXIgYXJyYXkgPSBuZXcgQXJyYXkodGhpcy5zaXplIHx8IDApO1xuICAgIHZhciB1c2VUdXBsZXMgPSBpc0tleWVkKHRoaXMpO1xuICAgIHZhciBpID0gMDtcbiAgICB0aGlzLl9faXRlcmF0ZShmdW5jdGlvbiAodiwgaykge1xuICAgICAgLy8gS2V5ZWQgY29sbGVjdGlvbnMgcHJvZHVjZSBhbiBhcnJheSBvZiB0dXBsZXMuXG4gICAgICBhcnJheVtpKytdID0gdXNlVHVwbGVzID8gW2ssIHZdIDogdjtcbiAgICB9KTtcbiAgICByZXR1cm4gYXJyYXk7XG4gIH0sXG5cbiAgdG9JbmRleGVkU2VxOiBmdW5jdGlvbiB0b0luZGV4ZWRTZXEoKSB7XG4gICAgcmV0dXJuIG5ldyBUb0luZGV4ZWRTZXF1ZW5jZSh0aGlzKTtcbiAgfSxcblxuICB0b0pTOiBmdW5jdGlvbiB0b0pTJDEoKSB7XG4gICAgcmV0dXJuIHRvSlModGhpcyk7XG4gIH0sXG5cbiAgdG9LZXllZFNlcTogZnVuY3Rpb24gdG9LZXllZFNlcSgpIHtcbiAgICByZXR1cm4gbmV3IFRvS2V5ZWRTZXF1ZW5jZSh0aGlzLCB0cnVlKTtcbiAgfSxcblxuICB0b01hcDogZnVuY3Rpb24gdG9NYXAoKSB7XG4gICAgLy8gVXNlIExhdGUgQmluZGluZyBoZXJlIHRvIHNvbHZlIHRoZSBjaXJjdWxhciBkZXBlbmRlbmN5LlxuICAgIHJldHVybiBNYXAodGhpcy50b0tleWVkU2VxKCkpO1xuICB9LFxuXG4gIHRvT2JqZWN0OiB0b09iamVjdCxcblxuICB0b09yZGVyZWRNYXA6IGZ1bmN0aW9uIHRvT3JkZXJlZE1hcCgpIHtcbiAgICAvLyBVc2UgTGF0ZSBCaW5kaW5nIGhlcmUgdG8gc29sdmUgdGhlIGNpcmN1bGFyIGRlcGVuZGVuY3kuXG4gICAgcmV0dXJuIE9yZGVyZWRNYXAodGhpcy50b0tleWVkU2VxKCkpO1xuICB9LFxuXG4gIHRvT3JkZXJlZFNldDogZnVuY3Rpb24gdG9PcmRlcmVkU2V0KCkge1xuICAgIC8vIFVzZSBMYXRlIEJpbmRpbmcgaGVyZSB0byBzb2x2ZSB0aGUgY2lyY3VsYXIgZGVwZW5kZW5jeS5cbiAgICByZXR1cm4gT3JkZXJlZFNldChpc0tleWVkKHRoaXMpID8gdGhpcy52YWx1ZVNlcSgpIDogdGhpcyk7XG4gIH0sXG5cbiAgdG9TZXQ6IGZ1bmN0aW9uIHRvU2V0KCkge1xuICAgIC8vIFVzZSBMYXRlIEJpbmRpbmcgaGVyZSB0byBzb2x2ZSB0aGUgY2lyY3VsYXIgZGVwZW5kZW5jeS5cbiAgICByZXR1cm4gU2V0KGlzS2V5ZWQodGhpcykgPyB0aGlzLnZhbHVlU2VxKCkgOiB0aGlzKTtcbiAgfSxcblxuICB0b1NldFNlcTogZnVuY3Rpb24gdG9TZXRTZXEoKSB7XG4gICAgcmV0dXJuIG5ldyBUb1NldFNlcXVlbmNlKHRoaXMpO1xuICB9LFxuXG4gIHRvU2VxOiBmdW5jdGlvbiB0b1NlcSgpIHtcbiAgICByZXR1cm4gaXNJbmRleGVkKHRoaXMpXG4gICAgICA/IHRoaXMudG9JbmRleGVkU2VxKClcbiAgICAgIDogaXNLZXllZCh0aGlzKVxuICAgICAgPyB0aGlzLnRvS2V5ZWRTZXEoKVxuICAgICAgOiB0aGlzLnRvU2V0U2VxKCk7XG4gIH0sXG5cbiAgdG9TdGFjazogZnVuY3Rpb24gdG9TdGFjaygpIHtcbiAgICAvLyBVc2UgTGF0ZSBCaW5kaW5nIGhlcmUgdG8gc29sdmUgdGhlIGNpcmN1bGFyIGRlcGVuZGVuY3kuXG4gICAgcmV0dXJuIFN0YWNrKGlzS2V5ZWQodGhpcykgPyB0aGlzLnZhbHVlU2VxKCkgOiB0aGlzKTtcbiAgfSxcblxuICB0b0xpc3Q6IGZ1bmN0aW9uIHRvTGlzdCgpIHtcbiAgICAvLyBVc2UgTGF0ZSBCaW5kaW5nIGhlcmUgdG8gc29sdmUgdGhlIGNpcmN1bGFyIGRlcGVuZGVuY3kuXG4gICAgcmV0dXJuIExpc3QoaXNLZXllZCh0aGlzKSA/IHRoaXMudmFsdWVTZXEoKSA6IHRoaXMpO1xuICB9LFxuXG4gIC8vICMjIyBDb21tb24gSmF2YVNjcmlwdCBtZXRob2RzIGFuZCBwcm9wZXJ0aWVzXG5cbiAgdG9TdHJpbmc6IGZ1bmN0aW9uIHRvU3RyaW5nKCkge1xuICAgIHJldHVybiAnW0NvbGxlY3Rpb25dJztcbiAgfSxcblxuICBfX3RvU3RyaW5nOiBmdW5jdGlvbiBfX3RvU3RyaW5nKGhlYWQsIHRhaWwpIHtcbiAgICBpZiAodGhpcy5zaXplID09PSAwKSB7XG4gICAgICByZXR1cm4gaGVhZCArIHRhaWw7XG4gICAgfVxuICAgIHJldHVybiAoXG4gICAgICBoZWFkICtcbiAgICAgICcgJyArXG4gICAgICB0aGlzLnRvU2VxKCkubWFwKHRoaXMuX190b1N0cmluZ01hcHBlcikuam9pbignLCAnKSArXG4gICAgICAnICcgK1xuICAgICAgdGFpbFxuICAgICk7XG4gIH0sXG5cbiAgLy8gIyMjIEVTNiBDb2xsZWN0aW9uIG1ldGhvZHMgKEVTNiBBcnJheSBhbmQgTWFwKVxuXG4gIGNvbmNhdDogZnVuY3Rpb24gY29uY2F0KCkge1xuICAgIHZhciB2YWx1ZXMgPSBbXSwgbGVuID0gYXJndW1lbnRzLmxlbmd0aDtcbiAgICB3aGlsZSAoIGxlbi0tICkgdmFsdWVzWyBsZW4gXSA9IGFyZ3VtZW50c1sgbGVuIF07XG5cbiAgICByZXR1cm4gcmVpZnkodGhpcywgY29uY2F0RmFjdG9yeSh0aGlzLCB2YWx1ZXMpKTtcbiAgfSxcblxuICBpbmNsdWRlczogZnVuY3Rpb24gaW5jbHVkZXMoc2VhcmNoVmFsdWUpIHtcbiAgICByZXR1cm4gdGhpcy5zb21lKGZ1bmN0aW9uICh2YWx1ZSkgeyByZXR1cm4gaXModmFsdWUsIHNlYXJjaFZhbHVlKTsgfSk7XG4gIH0sXG5cbiAgZW50cmllczogZnVuY3Rpb24gZW50cmllcygpIHtcbiAgICByZXR1cm4gdGhpcy5fX2l0ZXJhdG9yKElURVJBVEVfRU5UUklFUyk7XG4gIH0sXG5cbiAgZXZlcnk6IGZ1bmN0aW9uIGV2ZXJ5KHByZWRpY2F0ZSwgY29udGV4dCkge1xuICAgIGFzc2VydE5vdEluZmluaXRlKHRoaXMuc2l6ZSk7XG4gICAgdmFyIHJldHVyblZhbHVlID0gdHJ1ZTtcbiAgICB0aGlzLl9faXRlcmF0ZShmdW5jdGlvbiAodiwgaywgYykge1xuICAgICAgaWYgKCFwcmVkaWNhdGUuY2FsbChjb250ZXh0LCB2LCBrLCBjKSkge1xuICAgICAgICByZXR1cm5WYWx1ZSA9IGZhbHNlO1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgfSk7XG4gICAgcmV0dXJuIHJldHVyblZhbHVlO1xuICB9LFxuXG4gIGZpbHRlcjogZnVuY3Rpb24gZmlsdGVyKHByZWRpY2F0ZSwgY29udGV4dCkge1xuICAgIHJldHVybiByZWlmeSh0aGlzLCBmaWx0ZXJGYWN0b3J5KHRoaXMsIHByZWRpY2F0ZSwgY29udGV4dCwgdHJ1ZSkpO1xuICB9LFxuXG4gIGZpbmQ6IGZ1bmN0aW9uIGZpbmQocHJlZGljYXRlLCBjb250ZXh0LCBub3RTZXRWYWx1ZSkge1xuICAgIHZhciBlbnRyeSA9IHRoaXMuZmluZEVudHJ5KHByZWRpY2F0ZSwgY29udGV4dCk7XG4gICAgcmV0dXJuIGVudHJ5ID8gZW50cnlbMV0gOiBub3RTZXRWYWx1ZTtcbiAgfSxcblxuICBmb3JFYWNoOiBmdW5jdGlvbiBmb3JFYWNoKHNpZGVFZmZlY3QsIGNvbnRleHQpIHtcbiAgICBhc3NlcnROb3RJbmZpbml0ZSh0aGlzLnNpemUpO1xuICAgIHJldHVybiB0aGlzLl9faXRlcmF0ZShjb250ZXh0ID8gc2lkZUVmZmVjdC5iaW5kKGNvbnRleHQpIDogc2lkZUVmZmVjdCk7XG4gIH0sXG5cbiAgam9pbjogZnVuY3Rpb24gam9pbihzZXBhcmF0b3IpIHtcbiAgICBhc3NlcnROb3RJbmZpbml0ZSh0aGlzLnNpemUpO1xuICAgIHNlcGFyYXRvciA9IHNlcGFyYXRvciAhPT0gdW5kZWZpbmVkID8gJycgKyBzZXBhcmF0b3IgOiAnLCc7XG4gICAgdmFyIGpvaW5lZCA9ICcnO1xuICAgIHZhciBpc0ZpcnN0ID0gdHJ1ZTtcbiAgICB0aGlzLl9faXRlcmF0ZShmdW5jdGlvbiAodikge1xuICAgICAgaXNGaXJzdCA/IChpc0ZpcnN0ID0gZmFsc2UpIDogKGpvaW5lZCArPSBzZXBhcmF0b3IpO1xuICAgICAgam9pbmVkICs9IHYgIT09IG51bGwgJiYgdiAhPT0gdW5kZWZpbmVkID8gdi50b1N0cmluZygpIDogJyc7XG4gICAgfSk7XG4gICAgcmV0dXJuIGpvaW5lZDtcbiAgfSxcblxuICBrZXlzOiBmdW5jdGlvbiBrZXlzKCkge1xuICAgIHJldHVybiB0aGlzLl9faXRlcmF0b3IoSVRFUkFURV9LRVlTKTtcbiAgfSxcblxuICBtYXA6IGZ1bmN0aW9uIG1hcChtYXBwZXIsIGNvbnRleHQpIHtcbiAgICByZXR1cm4gcmVpZnkodGhpcywgbWFwRmFjdG9yeSh0aGlzLCBtYXBwZXIsIGNvbnRleHQpKTtcbiAgfSxcblxuICByZWR1Y2U6IGZ1bmN0aW9uIHJlZHVjZSQxKHJlZHVjZXIsIGluaXRpYWxSZWR1Y3Rpb24sIGNvbnRleHQpIHtcbiAgICByZXR1cm4gcmVkdWNlKFxuICAgICAgdGhpcyxcbiAgICAgIHJlZHVjZXIsXG4gICAgICBpbml0aWFsUmVkdWN0aW9uLFxuICAgICAgY29udGV4dCxcbiAgICAgIGFyZ3VtZW50cy5sZW5ndGggPCAyLFxuICAgICAgZmFsc2VcbiAgICApO1xuICB9LFxuXG4gIHJlZHVjZVJpZ2h0OiBmdW5jdGlvbiByZWR1Y2VSaWdodChyZWR1Y2VyLCBpbml0aWFsUmVkdWN0aW9uLCBjb250ZXh0KSB7XG4gICAgcmV0dXJuIHJlZHVjZShcbiAgICAgIHRoaXMsXG4gICAgICByZWR1Y2VyLFxuICAgICAgaW5pdGlhbFJlZHVjdGlvbixcbiAgICAgIGNvbnRleHQsXG4gICAgICBhcmd1bWVudHMubGVuZ3RoIDwgMixcbiAgICAgIHRydWVcbiAgICApO1xuICB9LFxuXG4gIHJldmVyc2U6IGZ1bmN0aW9uIHJldmVyc2UoKSB7XG4gICAgcmV0dXJuIHJlaWZ5KHRoaXMsIHJldmVyc2VGYWN0b3J5KHRoaXMsIHRydWUpKTtcbiAgfSxcblxuICBzbGljZTogZnVuY3Rpb24gc2xpY2UoYmVnaW4sIGVuZCkge1xuICAgIHJldHVybiByZWlmeSh0aGlzLCBzbGljZUZhY3RvcnkodGhpcywgYmVnaW4sIGVuZCwgdHJ1ZSkpO1xuICB9LFxuXG4gIHNvbWU6IGZ1bmN0aW9uIHNvbWUocHJlZGljYXRlLCBjb250ZXh0KSB7XG4gICAgcmV0dXJuICF0aGlzLmV2ZXJ5KG5vdChwcmVkaWNhdGUpLCBjb250ZXh0KTtcbiAgfSxcblxuICBzb3J0OiBmdW5jdGlvbiBzb3J0KGNvbXBhcmF0b3IpIHtcbiAgICByZXR1cm4gcmVpZnkodGhpcywgc29ydEZhY3RvcnkodGhpcywgY29tcGFyYXRvcikpO1xuICB9LFxuXG4gIHZhbHVlczogZnVuY3Rpb24gdmFsdWVzKCkge1xuICAgIHJldHVybiB0aGlzLl9faXRlcmF0b3IoSVRFUkFURV9WQUxVRVMpO1xuICB9LFxuXG4gIC8vICMjIyBNb3JlIHNlcXVlbnRpYWwgbWV0aG9kc1xuXG4gIGJ1dExhc3Q6IGZ1bmN0aW9uIGJ1dExhc3QoKSB7XG4gICAgcmV0dXJuIHRoaXMuc2xpY2UoMCwgLTEpO1xuICB9LFxuXG4gIGlzRW1wdHk6IGZ1bmN0aW9uIGlzRW1wdHkoKSB7XG4gICAgcmV0dXJuIHRoaXMuc2l6ZSAhPT0gdW5kZWZpbmVkID8gdGhpcy5zaXplID09PSAwIDogIXRoaXMuc29tZShmdW5jdGlvbiAoKSB7IHJldHVybiB0cnVlOyB9KTtcbiAgfSxcblxuICBjb3VudDogZnVuY3Rpb24gY291bnQocHJlZGljYXRlLCBjb250ZXh0KSB7XG4gICAgcmV0dXJuIGVuc3VyZVNpemUoXG4gICAgICBwcmVkaWNhdGUgPyB0aGlzLnRvU2VxKCkuZmlsdGVyKHByZWRpY2F0ZSwgY29udGV4dCkgOiB0aGlzXG4gICAgKTtcbiAgfSxcblxuICBjb3VudEJ5OiBmdW5jdGlvbiBjb3VudEJ5KGdyb3VwZXIsIGNvbnRleHQpIHtcbiAgICByZXR1cm4gY291bnRCeUZhY3RvcnkodGhpcywgZ3JvdXBlciwgY29udGV4dCk7XG4gIH0sXG5cbiAgZXF1YWxzOiBmdW5jdGlvbiBlcXVhbHMob3RoZXIpIHtcbiAgICByZXR1cm4gZGVlcEVxdWFsKHRoaXMsIG90aGVyKTtcbiAgfSxcblxuICBlbnRyeVNlcTogZnVuY3Rpb24gZW50cnlTZXEoKSB7XG4gICAgdmFyIGNvbGxlY3Rpb24gPSB0aGlzO1xuICAgIGlmIChjb2xsZWN0aW9uLl9jYWNoZSkge1xuICAgICAgLy8gV2UgY2FjaGUgYXMgYW4gZW50cmllcyBhcnJheSwgc28gd2UgY2FuIGp1c3QgcmV0dXJuIHRoZSBjYWNoZSFcbiAgICAgIHJldHVybiBuZXcgQXJyYXlTZXEoY29sbGVjdGlvbi5fY2FjaGUpO1xuICAgIH1cbiAgICB2YXIgZW50cmllc1NlcXVlbmNlID0gY29sbGVjdGlvbi50b1NlcSgpLm1hcChlbnRyeU1hcHBlcikudG9JbmRleGVkU2VxKCk7XG4gICAgZW50cmllc1NlcXVlbmNlLmZyb21FbnRyeVNlcSA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuIGNvbGxlY3Rpb24udG9TZXEoKTsgfTtcbiAgICByZXR1cm4gZW50cmllc1NlcXVlbmNlO1xuICB9LFxuXG4gIGZpbHRlck5vdDogZnVuY3Rpb24gZmlsdGVyTm90KHByZWRpY2F0ZSwgY29udGV4dCkge1xuICAgIHJldHVybiB0aGlzLmZpbHRlcihub3QocHJlZGljYXRlKSwgY29udGV4dCk7XG4gIH0sXG5cbiAgZmluZEVudHJ5OiBmdW5jdGlvbiBmaW5kRW50cnkocHJlZGljYXRlLCBjb250ZXh0LCBub3RTZXRWYWx1ZSkge1xuICAgIHZhciBmb3VuZCA9IG5vdFNldFZhbHVlO1xuICAgIHRoaXMuX19pdGVyYXRlKGZ1bmN0aW9uICh2LCBrLCBjKSB7XG4gICAgICBpZiAocHJlZGljYXRlLmNhbGwoY29udGV4dCwgdiwgaywgYykpIHtcbiAgICAgICAgZm91bmQgPSBbaywgdl07XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICByZXR1cm4gZm91bmQ7XG4gIH0sXG5cbiAgZmluZEtleTogZnVuY3Rpb24gZmluZEtleShwcmVkaWNhdGUsIGNvbnRleHQpIHtcbiAgICB2YXIgZW50cnkgPSB0aGlzLmZpbmRFbnRyeShwcmVkaWNhdGUsIGNvbnRleHQpO1xuICAgIHJldHVybiBlbnRyeSAmJiBlbnRyeVswXTtcbiAgfSxcblxuICBmaW5kTGFzdDogZnVuY3Rpb24gZmluZExhc3QocHJlZGljYXRlLCBjb250ZXh0LCBub3RTZXRWYWx1ZSkge1xuICAgIHJldHVybiB0aGlzLnRvS2V5ZWRTZXEoKS5yZXZlcnNlKCkuZmluZChwcmVkaWNhdGUsIGNvbnRleHQsIG5vdFNldFZhbHVlKTtcbiAgfSxcblxuICBmaW5kTGFzdEVudHJ5OiBmdW5jdGlvbiBmaW5kTGFzdEVudHJ5KHByZWRpY2F0ZSwgY29udGV4dCwgbm90U2V0VmFsdWUpIHtcbiAgICByZXR1cm4gdGhpcy50b0tleWVkU2VxKClcbiAgICAgIC5yZXZlcnNlKClcbiAgICAgIC5maW5kRW50cnkocHJlZGljYXRlLCBjb250ZXh0LCBub3RTZXRWYWx1ZSk7XG4gIH0sXG5cbiAgZmluZExhc3RLZXk6IGZ1bmN0aW9uIGZpbmRMYXN0S2V5KHByZWRpY2F0ZSwgY29udGV4dCkge1xuICAgIHJldHVybiB0aGlzLnRvS2V5ZWRTZXEoKS5yZXZlcnNlKCkuZmluZEtleShwcmVkaWNhdGUsIGNvbnRleHQpO1xuICB9LFxuXG4gIGZpcnN0OiBmdW5jdGlvbiBmaXJzdChub3RTZXRWYWx1ZSkge1xuICAgIHJldHVybiB0aGlzLmZpbmQocmV0dXJuVHJ1ZSwgbnVsbCwgbm90U2V0VmFsdWUpO1xuICB9LFxuXG4gIGZsYXRNYXA6IGZ1bmN0aW9uIGZsYXRNYXAobWFwcGVyLCBjb250ZXh0KSB7XG4gICAgcmV0dXJuIHJlaWZ5KHRoaXMsIGZsYXRNYXBGYWN0b3J5KHRoaXMsIG1hcHBlciwgY29udGV4dCkpO1xuICB9LFxuXG4gIGZsYXR0ZW46IGZ1bmN0aW9uIGZsYXR0ZW4oZGVwdGgpIHtcbiAgICByZXR1cm4gcmVpZnkodGhpcywgZmxhdHRlbkZhY3RvcnkodGhpcywgZGVwdGgsIHRydWUpKTtcbiAgfSxcblxuICBmcm9tRW50cnlTZXE6IGZ1bmN0aW9uIGZyb21FbnRyeVNlcSgpIHtcbiAgICByZXR1cm4gbmV3IEZyb21FbnRyaWVzU2VxdWVuY2UodGhpcyk7XG4gIH0sXG5cbiAgZ2V0OiBmdW5jdGlvbiBnZXQoc2VhcmNoS2V5LCBub3RTZXRWYWx1ZSkge1xuICAgIHJldHVybiB0aGlzLmZpbmQoZnVuY3Rpb24gKF8sIGtleSkgeyByZXR1cm4gaXMoa2V5LCBzZWFyY2hLZXkpOyB9LCB1bmRlZmluZWQsIG5vdFNldFZhbHVlKTtcbiAgfSxcblxuICBnZXRJbjogZ2V0SW4sXG5cbiAgZ3JvdXBCeTogZnVuY3Rpb24gZ3JvdXBCeShncm91cGVyLCBjb250ZXh0KSB7XG4gICAgcmV0dXJuIGdyb3VwQnlGYWN0b3J5KHRoaXMsIGdyb3VwZXIsIGNvbnRleHQpO1xuICB9LFxuXG4gIGhhczogZnVuY3Rpb24gaGFzKHNlYXJjaEtleSkge1xuICAgIHJldHVybiB0aGlzLmdldChzZWFyY2hLZXksIE5PVF9TRVQpICE9PSBOT1RfU0VUO1xuICB9LFxuXG4gIGhhc0luOiBoYXNJbixcblxuICBpc1N1YnNldDogZnVuY3Rpb24gaXNTdWJzZXQoaXRlcikge1xuICAgIGl0ZXIgPSB0eXBlb2YgaXRlci5pbmNsdWRlcyA9PT0gJ2Z1bmN0aW9uJyA/IGl0ZXIgOiBDb2xsZWN0aW9uKGl0ZXIpO1xuICAgIHJldHVybiB0aGlzLmV2ZXJ5KGZ1bmN0aW9uICh2YWx1ZSkgeyByZXR1cm4gaXRlci5pbmNsdWRlcyh2YWx1ZSk7IH0pO1xuICB9LFxuXG4gIGlzU3VwZXJzZXQ6IGZ1bmN0aW9uIGlzU3VwZXJzZXQoaXRlcikge1xuICAgIGl0ZXIgPSB0eXBlb2YgaXRlci5pc1N1YnNldCA9PT0gJ2Z1bmN0aW9uJyA/IGl0ZXIgOiBDb2xsZWN0aW9uKGl0ZXIpO1xuICAgIHJldHVybiBpdGVyLmlzU3Vic2V0KHRoaXMpO1xuICB9LFxuXG4gIGtleU9mOiBmdW5jdGlvbiBrZXlPZihzZWFyY2hWYWx1ZSkge1xuICAgIHJldHVybiB0aGlzLmZpbmRLZXkoZnVuY3Rpb24gKHZhbHVlKSB7IHJldHVybiBpcyh2YWx1ZSwgc2VhcmNoVmFsdWUpOyB9KTtcbiAgfSxcblxuICBrZXlTZXE6IGZ1bmN0aW9uIGtleVNlcSgpIHtcbiAgICByZXR1cm4gdGhpcy50b1NlcSgpLm1hcChrZXlNYXBwZXIpLnRvSW5kZXhlZFNlcSgpO1xuICB9LFxuXG4gIGxhc3Q6IGZ1bmN0aW9uIGxhc3Qobm90U2V0VmFsdWUpIHtcbiAgICByZXR1cm4gdGhpcy50b1NlcSgpLnJldmVyc2UoKS5maXJzdChub3RTZXRWYWx1ZSk7XG4gIH0sXG5cbiAgbGFzdEtleU9mOiBmdW5jdGlvbiBsYXN0S2V5T2Yoc2VhcmNoVmFsdWUpIHtcbiAgICByZXR1cm4gdGhpcy50b0tleWVkU2VxKCkucmV2ZXJzZSgpLmtleU9mKHNlYXJjaFZhbHVlKTtcbiAgfSxcblxuICBtYXg6IGZ1bmN0aW9uIG1heChjb21wYXJhdG9yKSB7XG4gICAgcmV0dXJuIG1heEZhY3RvcnkodGhpcywgY29tcGFyYXRvcik7XG4gIH0sXG5cbiAgbWF4Qnk6IGZ1bmN0aW9uIG1heEJ5KG1hcHBlciwgY29tcGFyYXRvcikge1xuICAgIHJldHVybiBtYXhGYWN0b3J5KHRoaXMsIGNvbXBhcmF0b3IsIG1hcHBlcik7XG4gIH0sXG5cbiAgbWluOiBmdW5jdGlvbiBtaW4oY29tcGFyYXRvcikge1xuICAgIHJldHVybiBtYXhGYWN0b3J5KFxuICAgICAgdGhpcyxcbiAgICAgIGNvbXBhcmF0b3IgPyBuZWcoY29tcGFyYXRvcikgOiBkZWZhdWx0TmVnQ29tcGFyYXRvclxuICAgICk7XG4gIH0sXG5cbiAgbWluQnk6IGZ1bmN0aW9uIG1pbkJ5KG1hcHBlciwgY29tcGFyYXRvcikge1xuICAgIHJldHVybiBtYXhGYWN0b3J5KFxuICAgICAgdGhpcyxcbiAgICAgIGNvbXBhcmF0b3IgPyBuZWcoY29tcGFyYXRvcikgOiBkZWZhdWx0TmVnQ29tcGFyYXRvcixcbiAgICAgIG1hcHBlclxuICAgICk7XG4gIH0sXG5cbiAgcmVzdDogZnVuY3Rpb24gcmVzdCgpIHtcbiAgICByZXR1cm4gdGhpcy5zbGljZSgxKTtcbiAgfSxcblxuICBza2lwOiBmdW5jdGlvbiBza2lwKGFtb3VudCkge1xuICAgIHJldHVybiBhbW91bnQgPT09IDAgPyB0aGlzIDogdGhpcy5zbGljZShNYXRoLm1heCgwLCBhbW91bnQpKTtcbiAgfSxcblxuICBza2lwTGFzdDogZnVuY3Rpb24gc2tpcExhc3QoYW1vdW50KSB7XG4gICAgcmV0dXJuIGFtb3VudCA9PT0gMCA/IHRoaXMgOiB0aGlzLnNsaWNlKDAsIC1NYXRoLm1heCgwLCBhbW91bnQpKTtcbiAgfSxcblxuICBza2lwV2hpbGU6IGZ1bmN0aW9uIHNraXBXaGlsZShwcmVkaWNhdGUsIGNvbnRleHQpIHtcbiAgICByZXR1cm4gcmVpZnkodGhpcywgc2tpcFdoaWxlRmFjdG9yeSh0aGlzLCBwcmVkaWNhdGUsIGNvbnRleHQsIHRydWUpKTtcbiAgfSxcblxuICBza2lwVW50aWw6IGZ1bmN0aW9uIHNraXBVbnRpbChwcmVkaWNhdGUsIGNvbnRleHQpIHtcbiAgICByZXR1cm4gdGhpcy5za2lwV2hpbGUobm90KHByZWRpY2F0ZSksIGNvbnRleHQpO1xuICB9LFxuXG4gIHNvcnRCeTogZnVuY3Rpb24gc29ydEJ5KG1hcHBlciwgY29tcGFyYXRvcikge1xuICAgIHJldHVybiByZWlmeSh0aGlzLCBzb3J0RmFjdG9yeSh0aGlzLCBjb21wYXJhdG9yLCBtYXBwZXIpKTtcbiAgfSxcblxuICB0YWtlOiBmdW5jdGlvbiB0YWtlKGFtb3VudCkge1xuICAgIHJldHVybiB0aGlzLnNsaWNlKDAsIE1hdGgubWF4KDAsIGFtb3VudCkpO1xuICB9LFxuXG4gIHRha2VMYXN0OiBmdW5jdGlvbiB0YWtlTGFzdChhbW91bnQpIHtcbiAgICByZXR1cm4gdGhpcy5zbGljZSgtTWF0aC5tYXgoMCwgYW1vdW50KSk7XG4gIH0sXG5cbiAgdGFrZVdoaWxlOiBmdW5jdGlvbiB0YWtlV2hpbGUocHJlZGljYXRlLCBjb250ZXh0KSB7XG4gICAgcmV0dXJuIHJlaWZ5KHRoaXMsIHRha2VXaGlsZUZhY3RvcnkodGhpcywgcHJlZGljYXRlLCBjb250ZXh0KSk7XG4gIH0sXG5cbiAgdGFrZVVudGlsOiBmdW5jdGlvbiB0YWtlVW50aWwocHJlZGljYXRlLCBjb250ZXh0KSB7XG4gICAgcmV0dXJuIHRoaXMudGFrZVdoaWxlKG5vdChwcmVkaWNhdGUpLCBjb250ZXh0KTtcbiAgfSxcblxuICB1cGRhdGU6IGZ1bmN0aW9uIHVwZGF0ZShmbikge1xuICAgIHJldHVybiBmbih0aGlzKTtcbiAgfSxcblxuICB2YWx1ZVNlcTogZnVuY3Rpb24gdmFsdWVTZXEoKSB7XG4gICAgcmV0dXJuIHRoaXMudG9JbmRleGVkU2VxKCk7XG4gIH0sXG5cbiAgLy8gIyMjIEhhc2hhYmxlIE9iamVjdFxuXG4gIGhhc2hDb2RlOiBmdW5jdGlvbiBoYXNoQ29kZSgpIHtcbiAgICByZXR1cm4gdGhpcy5fX2hhc2ggfHwgKHRoaXMuX19oYXNoID0gaGFzaENvbGxlY3Rpb24odGhpcykpO1xuICB9LFxuXG4gIC8vICMjIyBJbnRlcm5hbFxuXG4gIC8vIGFic3RyYWN0IF9faXRlcmF0ZShmbiwgcmV2ZXJzZSlcblxuICAvLyBhYnN0cmFjdCBfX2l0ZXJhdG9yKHR5cGUsIHJldmVyc2UpXG59KTtcblxudmFyIENvbGxlY3Rpb25Qcm90b3R5cGUgPSBDb2xsZWN0aW9uLnByb3RvdHlwZTtcbkNvbGxlY3Rpb25Qcm90b3R5cGVbSVNfQ09MTEVDVElPTl9TWU1CT0xdID0gdHJ1ZTtcbkNvbGxlY3Rpb25Qcm90b3R5cGVbSVRFUkFUT1JfU1lNQk9MXSA9IENvbGxlY3Rpb25Qcm90b3R5cGUudmFsdWVzO1xuQ29sbGVjdGlvblByb3RvdHlwZS50b0pTT04gPSBDb2xsZWN0aW9uUHJvdG90eXBlLnRvQXJyYXk7XG5Db2xsZWN0aW9uUHJvdG90eXBlLl9fdG9TdHJpbmdNYXBwZXIgPSBxdW90ZVN0cmluZztcbkNvbGxlY3Rpb25Qcm90b3R5cGUuaW5zcGVjdCA9IENvbGxlY3Rpb25Qcm90b3R5cGUudG9Tb3VyY2UgPSBmdW5jdGlvbiAoKSB7XG4gIHJldHVybiB0aGlzLnRvU3RyaW5nKCk7XG59O1xuQ29sbGVjdGlvblByb3RvdHlwZS5jaGFpbiA9IENvbGxlY3Rpb25Qcm90b3R5cGUuZmxhdE1hcDtcbkNvbGxlY3Rpb25Qcm90b3R5cGUuY29udGFpbnMgPSBDb2xsZWN0aW9uUHJvdG90eXBlLmluY2x1ZGVzO1xuXG5taXhpbihLZXllZENvbGxlY3Rpb24sIHtcbiAgLy8gIyMjIE1vcmUgc2VxdWVudGlhbCBtZXRob2RzXG5cbiAgZmxpcDogZnVuY3Rpb24gZmxpcCgpIHtcbiAgICByZXR1cm4gcmVpZnkodGhpcywgZmxpcEZhY3RvcnkodGhpcykpO1xuICB9LFxuXG4gIG1hcEVudHJpZXM6IGZ1bmN0aW9uIG1hcEVudHJpZXMobWFwcGVyLCBjb250ZXh0KSB7XG4gICAgdmFyIHRoaXMkMSQxID0gdGhpcztcblxuICAgIHZhciBpdGVyYXRpb25zID0gMDtcbiAgICByZXR1cm4gcmVpZnkoXG4gICAgICB0aGlzLFxuICAgICAgdGhpcy50b1NlcSgpXG4gICAgICAgIC5tYXAoZnVuY3Rpb24gKHYsIGspIHsgcmV0dXJuIG1hcHBlci5jYWxsKGNvbnRleHQsIFtrLCB2XSwgaXRlcmF0aW9ucysrLCB0aGlzJDEkMSk7IH0pXG4gICAgICAgIC5mcm9tRW50cnlTZXEoKVxuICAgICk7XG4gIH0sXG5cbiAgbWFwS2V5czogZnVuY3Rpb24gbWFwS2V5cyhtYXBwZXIsIGNvbnRleHQpIHtcbiAgICB2YXIgdGhpcyQxJDEgPSB0aGlzO1xuXG4gICAgcmV0dXJuIHJlaWZ5KFxuICAgICAgdGhpcyxcbiAgICAgIHRoaXMudG9TZXEoKVxuICAgICAgICAuZmxpcCgpXG4gICAgICAgIC5tYXAoZnVuY3Rpb24gKGssIHYpIHsgcmV0dXJuIG1hcHBlci5jYWxsKGNvbnRleHQsIGssIHYsIHRoaXMkMSQxKTsgfSlcbiAgICAgICAgLmZsaXAoKVxuICAgICk7XG4gIH0sXG59KTtcblxudmFyIEtleWVkQ29sbGVjdGlvblByb3RvdHlwZSA9IEtleWVkQ29sbGVjdGlvbi5wcm90b3R5cGU7XG5LZXllZENvbGxlY3Rpb25Qcm90b3R5cGVbSVNfS0VZRURfU1lNQk9MXSA9IHRydWU7XG5LZXllZENvbGxlY3Rpb25Qcm90b3R5cGVbSVRFUkFUT1JfU1lNQk9MXSA9IENvbGxlY3Rpb25Qcm90b3R5cGUuZW50cmllcztcbktleWVkQ29sbGVjdGlvblByb3RvdHlwZS50b0pTT04gPSB0b09iamVjdDtcbktleWVkQ29sbGVjdGlvblByb3RvdHlwZS5fX3RvU3RyaW5nTWFwcGVyID0gZnVuY3Rpb24gKHYsIGspIHsgcmV0dXJuIHF1b3RlU3RyaW5nKGspICsgJzogJyArIHF1b3RlU3RyaW5nKHYpOyB9O1xuXG5taXhpbihJbmRleGVkQ29sbGVjdGlvbiwge1xuICAvLyAjIyMgQ29udmVyc2lvbiB0byBvdGhlciB0eXBlc1xuXG4gIHRvS2V5ZWRTZXE6IGZ1bmN0aW9uIHRvS2V5ZWRTZXEoKSB7XG4gICAgcmV0dXJuIG5ldyBUb0tleWVkU2VxdWVuY2UodGhpcywgZmFsc2UpO1xuICB9LFxuXG4gIC8vICMjIyBFUzYgQ29sbGVjdGlvbiBtZXRob2RzIChFUzYgQXJyYXkgYW5kIE1hcClcblxuICBmaWx0ZXI6IGZ1bmN0aW9uIGZpbHRlcihwcmVkaWNhdGUsIGNvbnRleHQpIHtcbiAgICByZXR1cm4gcmVpZnkodGhpcywgZmlsdGVyRmFjdG9yeSh0aGlzLCBwcmVkaWNhdGUsIGNvbnRleHQsIGZhbHNlKSk7XG4gIH0sXG5cbiAgZmluZEluZGV4OiBmdW5jdGlvbiBmaW5kSW5kZXgocHJlZGljYXRlLCBjb250ZXh0KSB7XG4gICAgdmFyIGVudHJ5ID0gdGhpcy5maW5kRW50cnkocHJlZGljYXRlLCBjb250ZXh0KTtcbiAgICByZXR1cm4gZW50cnkgPyBlbnRyeVswXSA6IC0xO1xuICB9LFxuXG4gIGluZGV4T2Y6IGZ1bmN0aW9uIGluZGV4T2Yoc2VhcmNoVmFsdWUpIHtcbiAgICB2YXIga2V5ID0gdGhpcy5rZXlPZihzZWFyY2hWYWx1ZSk7XG4gICAgcmV0dXJuIGtleSA9PT0gdW5kZWZpbmVkID8gLTEgOiBrZXk7XG4gIH0sXG5cbiAgbGFzdEluZGV4T2Y6IGZ1bmN0aW9uIGxhc3RJbmRleE9mKHNlYXJjaFZhbHVlKSB7XG4gICAgdmFyIGtleSA9IHRoaXMubGFzdEtleU9mKHNlYXJjaFZhbHVlKTtcbiAgICByZXR1cm4ga2V5ID09PSB1bmRlZmluZWQgPyAtMSA6IGtleTtcbiAgfSxcblxuICByZXZlcnNlOiBmdW5jdGlvbiByZXZlcnNlKCkge1xuICAgIHJldHVybiByZWlmeSh0aGlzLCByZXZlcnNlRmFjdG9yeSh0aGlzLCBmYWxzZSkpO1xuICB9LFxuXG4gIHNsaWNlOiBmdW5jdGlvbiBzbGljZShiZWdpbiwgZW5kKSB7XG4gICAgcmV0dXJuIHJlaWZ5KHRoaXMsIHNsaWNlRmFjdG9yeSh0aGlzLCBiZWdpbiwgZW5kLCBmYWxzZSkpO1xuICB9LFxuXG4gIHNwbGljZTogZnVuY3Rpb24gc3BsaWNlKGluZGV4LCByZW1vdmVOdW0gLyosIC4uLnZhbHVlcyovKSB7XG4gICAgdmFyIG51bUFyZ3MgPSBhcmd1bWVudHMubGVuZ3RoO1xuICAgIHJlbW92ZU51bSA9IE1hdGgubWF4KHJlbW92ZU51bSB8fCAwLCAwKTtcbiAgICBpZiAobnVtQXJncyA9PT0gMCB8fCAobnVtQXJncyA9PT0gMiAmJiAhcmVtb3ZlTnVtKSkge1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuICAgIC8vIElmIGluZGV4IGlzIG5lZ2F0aXZlLCBpdCBzaG91bGQgcmVzb2x2ZSByZWxhdGl2ZSB0byB0aGUgc2l6ZSBvZiB0aGVcbiAgICAvLyBjb2xsZWN0aW9uLiBIb3dldmVyIHNpemUgbWF5IGJlIGV4cGVuc2l2ZSB0byBjb21wdXRlIGlmIG5vdCBjYWNoZWQsIHNvXG4gICAgLy8gb25seSBjYWxsIGNvdW50KCkgaWYgdGhlIG51bWJlciBpcyBpbiBmYWN0IG5lZ2F0aXZlLlxuICAgIGluZGV4ID0gcmVzb2x2ZUJlZ2luKGluZGV4LCBpbmRleCA8IDAgPyB0aGlzLmNvdW50KCkgOiB0aGlzLnNpemUpO1xuICAgIHZhciBzcGxpY2VkID0gdGhpcy5zbGljZSgwLCBpbmRleCk7XG4gICAgcmV0dXJuIHJlaWZ5KFxuICAgICAgdGhpcyxcbiAgICAgIG51bUFyZ3MgPT09IDFcbiAgICAgICAgPyBzcGxpY2VkXG4gICAgICAgIDogc3BsaWNlZC5jb25jYXQoYXJyQ29weShhcmd1bWVudHMsIDIpLCB0aGlzLnNsaWNlKGluZGV4ICsgcmVtb3ZlTnVtKSlcbiAgICApO1xuICB9LFxuXG4gIC8vICMjIyBNb3JlIGNvbGxlY3Rpb24gbWV0aG9kc1xuXG4gIGZpbmRMYXN0SW5kZXg6IGZ1bmN0aW9uIGZpbmRMYXN0SW5kZXgocHJlZGljYXRlLCBjb250ZXh0KSB7XG4gICAgdmFyIGVudHJ5ID0gdGhpcy5maW5kTGFzdEVudHJ5KHByZWRpY2F0ZSwgY29udGV4dCk7XG4gICAgcmV0dXJuIGVudHJ5ID8gZW50cnlbMF0gOiAtMTtcbiAgfSxcblxuICBmaXJzdDogZnVuY3Rpb24gZmlyc3Qobm90U2V0VmFsdWUpIHtcbiAgICByZXR1cm4gdGhpcy5nZXQoMCwgbm90U2V0VmFsdWUpO1xuICB9LFxuXG4gIGZsYXR0ZW46IGZ1bmN0aW9uIGZsYXR0ZW4oZGVwdGgpIHtcbiAgICByZXR1cm4gcmVpZnkodGhpcywgZmxhdHRlbkZhY3RvcnkodGhpcywgZGVwdGgsIGZhbHNlKSk7XG4gIH0sXG5cbiAgZ2V0OiBmdW5jdGlvbiBnZXQoaW5kZXgsIG5vdFNldFZhbHVlKSB7XG4gICAgaW5kZXggPSB3cmFwSW5kZXgodGhpcywgaW5kZXgpO1xuICAgIHJldHVybiBpbmRleCA8IDAgfHxcbiAgICAgIHRoaXMuc2l6ZSA9PT0gSW5maW5pdHkgfHxcbiAgICAgICh0aGlzLnNpemUgIT09IHVuZGVmaW5lZCAmJiBpbmRleCA+IHRoaXMuc2l6ZSlcbiAgICAgID8gbm90U2V0VmFsdWVcbiAgICAgIDogdGhpcy5maW5kKGZ1bmN0aW9uIChfLCBrZXkpIHsgcmV0dXJuIGtleSA9PT0gaW5kZXg7IH0sIHVuZGVmaW5lZCwgbm90U2V0VmFsdWUpO1xuICB9LFxuXG4gIGhhczogZnVuY3Rpb24gaGFzKGluZGV4KSB7XG4gICAgaW5kZXggPSB3cmFwSW5kZXgodGhpcywgaW5kZXgpO1xuICAgIHJldHVybiAoXG4gICAgICBpbmRleCA+PSAwICYmXG4gICAgICAodGhpcy5zaXplICE9PSB1bmRlZmluZWRcbiAgICAgICAgPyB0aGlzLnNpemUgPT09IEluZmluaXR5IHx8IGluZGV4IDwgdGhpcy5zaXplXG4gICAgICAgIDogdGhpcy5pbmRleE9mKGluZGV4KSAhPT0gLTEpXG4gICAgKTtcbiAgfSxcblxuICBpbnRlcnBvc2U6IGZ1bmN0aW9uIGludGVycG9zZShzZXBhcmF0b3IpIHtcbiAgICByZXR1cm4gcmVpZnkodGhpcywgaW50ZXJwb3NlRmFjdG9yeSh0aGlzLCBzZXBhcmF0b3IpKTtcbiAgfSxcblxuICBpbnRlcmxlYXZlOiBmdW5jdGlvbiBpbnRlcmxlYXZlKC8qLi4uY29sbGVjdGlvbnMqLykge1xuICAgIHZhciBjb2xsZWN0aW9ucyA9IFt0aGlzXS5jb25jYXQoYXJyQ29weShhcmd1bWVudHMpKTtcbiAgICB2YXIgemlwcGVkID0gemlwV2l0aEZhY3RvcnkodGhpcy50b1NlcSgpLCBJbmRleGVkU2VxLm9mLCBjb2xsZWN0aW9ucyk7XG4gICAgdmFyIGludGVybGVhdmVkID0gemlwcGVkLmZsYXR0ZW4odHJ1ZSk7XG4gICAgaWYgKHppcHBlZC5zaXplKSB7XG4gICAgICBpbnRlcmxlYXZlZC5zaXplID0gemlwcGVkLnNpemUgKiBjb2xsZWN0aW9ucy5sZW5ndGg7XG4gICAgfVxuICAgIHJldHVybiByZWlmeSh0aGlzLCBpbnRlcmxlYXZlZCk7XG4gIH0sXG5cbiAga2V5U2VxOiBmdW5jdGlvbiBrZXlTZXEoKSB7XG4gICAgcmV0dXJuIFJhbmdlKDAsIHRoaXMuc2l6ZSk7XG4gIH0sXG5cbiAgbGFzdDogZnVuY3Rpb24gbGFzdChub3RTZXRWYWx1ZSkge1xuICAgIHJldHVybiB0aGlzLmdldCgtMSwgbm90U2V0VmFsdWUpO1xuICB9LFxuXG4gIHNraXBXaGlsZTogZnVuY3Rpb24gc2tpcFdoaWxlKHByZWRpY2F0ZSwgY29udGV4dCkge1xuICAgIHJldHVybiByZWlmeSh0aGlzLCBza2lwV2hpbGVGYWN0b3J5KHRoaXMsIHByZWRpY2F0ZSwgY29udGV4dCwgZmFsc2UpKTtcbiAgfSxcblxuICB6aXA6IGZ1bmN0aW9uIHppcCgvKiwgLi4uY29sbGVjdGlvbnMgKi8pIHtcbiAgICB2YXIgY29sbGVjdGlvbnMgPSBbdGhpc10uY29uY2F0KGFyckNvcHkoYXJndW1lbnRzKSk7XG4gICAgcmV0dXJuIHJlaWZ5KHRoaXMsIHppcFdpdGhGYWN0b3J5KHRoaXMsIGRlZmF1bHRaaXBwZXIsIGNvbGxlY3Rpb25zKSk7XG4gIH0sXG5cbiAgemlwQWxsOiBmdW5jdGlvbiB6aXBBbGwoLyosIC4uLmNvbGxlY3Rpb25zICovKSB7XG4gICAgdmFyIGNvbGxlY3Rpb25zID0gW3RoaXNdLmNvbmNhdChhcnJDb3B5KGFyZ3VtZW50cykpO1xuICAgIHJldHVybiByZWlmeSh0aGlzLCB6aXBXaXRoRmFjdG9yeSh0aGlzLCBkZWZhdWx0WmlwcGVyLCBjb2xsZWN0aW9ucywgdHJ1ZSkpO1xuICB9LFxuXG4gIHppcFdpdGg6IGZ1bmN0aW9uIHppcFdpdGgoemlwcGVyIC8qLCAuLi5jb2xsZWN0aW9ucyAqLykge1xuICAgIHZhciBjb2xsZWN0aW9ucyA9IGFyckNvcHkoYXJndW1lbnRzKTtcbiAgICBjb2xsZWN0aW9uc1swXSA9IHRoaXM7XG4gICAgcmV0dXJuIHJlaWZ5KHRoaXMsIHppcFdpdGhGYWN0b3J5KHRoaXMsIHppcHBlciwgY29sbGVjdGlvbnMpKTtcbiAgfSxcbn0pO1xuXG52YXIgSW5kZXhlZENvbGxlY3Rpb25Qcm90b3R5cGUgPSBJbmRleGVkQ29sbGVjdGlvbi5wcm90b3R5cGU7XG5JbmRleGVkQ29sbGVjdGlvblByb3RvdHlwZVtJU19JTkRFWEVEX1NZTUJPTF0gPSB0cnVlO1xuSW5kZXhlZENvbGxlY3Rpb25Qcm90b3R5cGVbSVNfT1JERVJFRF9TWU1CT0xdID0gdHJ1ZTtcblxubWl4aW4oU2V0Q29sbGVjdGlvbiwge1xuICAvLyAjIyMgRVM2IENvbGxlY3Rpb24gbWV0aG9kcyAoRVM2IEFycmF5IGFuZCBNYXApXG5cbiAgZ2V0OiBmdW5jdGlvbiBnZXQodmFsdWUsIG5vdFNldFZhbHVlKSB7XG4gICAgcmV0dXJuIHRoaXMuaGFzKHZhbHVlKSA/IHZhbHVlIDogbm90U2V0VmFsdWU7XG4gIH0sXG5cbiAgaW5jbHVkZXM6IGZ1bmN0aW9uIGluY2x1ZGVzKHZhbHVlKSB7XG4gICAgcmV0dXJuIHRoaXMuaGFzKHZhbHVlKTtcbiAgfSxcblxuICAvLyAjIyMgTW9yZSBzZXF1ZW50aWFsIG1ldGhvZHNcblxuICBrZXlTZXE6IGZ1bmN0aW9uIGtleVNlcSgpIHtcbiAgICByZXR1cm4gdGhpcy52YWx1ZVNlcSgpO1xuICB9LFxufSk7XG5cbnZhciBTZXRDb2xsZWN0aW9uUHJvdG90eXBlID0gU2V0Q29sbGVjdGlvbi5wcm90b3R5cGU7XG5TZXRDb2xsZWN0aW9uUHJvdG90eXBlLmhhcyA9IENvbGxlY3Rpb25Qcm90b3R5cGUuaW5jbHVkZXM7XG5TZXRDb2xsZWN0aW9uUHJvdG90eXBlLmNvbnRhaW5zID0gU2V0Q29sbGVjdGlvblByb3RvdHlwZS5pbmNsdWRlcztcblNldENvbGxlY3Rpb25Qcm90b3R5cGUua2V5cyA9IFNldENvbGxlY3Rpb25Qcm90b3R5cGUudmFsdWVzO1xuXG4vLyBNaXhpbiBzdWJjbGFzc2VzXG5cbm1peGluKEtleWVkU2VxLCBLZXllZENvbGxlY3Rpb25Qcm90b3R5cGUpO1xubWl4aW4oSW5kZXhlZFNlcSwgSW5kZXhlZENvbGxlY3Rpb25Qcm90b3R5cGUpO1xubWl4aW4oU2V0U2VxLCBTZXRDb2xsZWN0aW9uUHJvdG90eXBlKTtcblxuLy8gI3ByYWdtYSBIZWxwZXIgZnVuY3Rpb25zXG5cbmZ1bmN0aW9uIHJlZHVjZShjb2xsZWN0aW9uLCByZWR1Y2VyLCByZWR1Y3Rpb24sIGNvbnRleHQsIHVzZUZpcnN0LCByZXZlcnNlKSB7XG4gIGFzc2VydE5vdEluZmluaXRlKGNvbGxlY3Rpb24uc2l6ZSk7XG4gIGNvbGxlY3Rpb24uX19pdGVyYXRlKGZ1bmN0aW9uICh2LCBrLCBjKSB7XG4gICAgaWYgKHVzZUZpcnN0KSB7XG4gICAgICB1c2VGaXJzdCA9IGZhbHNlO1xuICAgICAgcmVkdWN0aW9uID0gdjtcbiAgICB9IGVsc2Uge1xuICAgICAgcmVkdWN0aW9uID0gcmVkdWNlci5jYWxsKGNvbnRleHQsIHJlZHVjdGlvbiwgdiwgaywgYyk7XG4gICAgfVxuICB9LCByZXZlcnNlKTtcbiAgcmV0dXJuIHJlZHVjdGlvbjtcbn1cblxuZnVuY3Rpb24ga2V5TWFwcGVyKHYsIGspIHtcbiAgcmV0dXJuIGs7XG59XG5cbmZ1bmN0aW9uIGVudHJ5TWFwcGVyKHYsIGspIHtcbiAgcmV0dXJuIFtrLCB2XTtcbn1cblxuZnVuY3Rpb24gbm90KHByZWRpY2F0ZSkge1xuICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiAhcHJlZGljYXRlLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gIH07XG59XG5cbmZ1bmN0aW9uIG5lZyhwcmVkaWNhdGUpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gLXByZWRpY2F0ZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICB9O1xufVxuXG5mdW5jdGlvbiBkZWZhdWx0WmlwcGVyKCkge1xuICByZXR1cm4gYXJyQ29weShhcmd1bWVudHMpO1xufVxuXG5mdW5jdGlvbiBkZWZhdWx0TmVnQ29tcGFyYXRvcihhLCBiKSB7XG4gIHJldHVybiBhIDwgYiA/IDEgOiBhID4gYiA/IC0xIDogMDtcbn1cblxuZnVuY3Rpb24gaGFzaENvbGxlY3Rpb24oY29sbGVjdGlvbikge1xuICBpZiAoY29sbGVjdGlvbi5zaXplID09PSBJbmZpbml0eSkge1xuICAgIHJldHVybiAwO1xuICB9XG4gIHZhciBvcmRlcmVkID0gaXNPcmRlcmVkKGNvbGxlY3Rpb24pO1xuICB2YXIga2V5ZWQgPSBpc0tleWVkKGNvbGxlY3Rpb24pO1xuICB2YXIgaCA9IG9yZGVyZWQgPyAxIDogMDtcbiAgdmFyIHNpemUgPSBjb2xsZWN0aW9uLl9faXRlcmF0ZShcbiAgICBrZXllZFxuICAgICAgPyBvcmRlcmVkXG4gICAgICAgID8gZnVuY3Rpb24gKHYsIGspIHtcbiAgICAgICAgICAgIGggPSAoMzEgKiBoICsgaGFzaE1lcmdlKGhhc2godiksIGhhc2goaykpKSB8IDA7XG4gICAgICAgICAgfVxuICAgICAgICA6IGZ1bmN0aW9uICh2LCBrKSB7XG4gICAgICAgICAgICBoID0gKGggKyBoYXNoTWVyZ2UoaGFzaCh2KSwgaGFzaChrKSkpIHwgMDtcbiAgICAgICAgICB9XG4gICAgICA6IG9yZGVyZWRcbiAgICAgID8gZnVuY3Rpb24gKHYpIHtcbiAgICAgICAgICBoID0gKDMxICogaCArIGhhc2godikpIHwgMDtcbiAgICAgICAgfVxuICAgICAgOiBmdW5jdGlvbiAodikge1xuICAgICAgICAgIGggPSAoaCArIGhhc2godikpIHwgMDtcbiAgICAgICAgfVxuICApO1xuICByZXR1cm4gbXVybXVySGFzaE9mU2l6ZShzaXplLCBoKTtcbn1cblxuZnVuY3Rpb24gbXVybXVySGFzaE9mU2l6ZShzaXplLCBoKSB7XG4gIGggPSBpbXVsKGgsIDB4Y2M5ZTJkNTEpO1xuICBoID0gaW11bCgoaCA8PCAxNSkgfCAoaCA+Pj4gLTE1KSwgMHgxYjg3MzU5Myk7XG4gIGggPSBpbXVsKChoIDw8IDEzKSB8IChoID4+PiAtMTMpLCA1KTtcbiAgaCA9ICgoaCArIDB4ZTY1NDZiNjQpIHwgMCkgXiBzaXplO1xuICBoID0gaW11bChoIF4gKGggPj4+IDE2KSwgMHg4NWViY2E2Yik7XG4gIGggPSBpbXVsKGggXiAoaCA+Pj4gMTMpLCAweGMyYjJhZTM1KTtcbiAgaCA9IHNtaShoIF4gKGggPj4+IDE2KSk7XG4gIHJldHVybiBoO1xufVxuXG5mdW5jdGlvbiBoYXNoTWVyZ2UoYSwgYikge1xuICByZXR1cm4gKGEgXiAoYiArIDB4OWUzNzc5YjkgKyAoYSA8PCA2KSArIChhID4+IDIpKSkgfCAwOyAvLyBpbnRcbn1cblxudmFyIE9yZGVyZWRTZXQgPSAvKkBfX1BVUkVfXyovKGZ1bmN0aW9uIChTZXQpIHtcbiAgZnVuY3Rpb24gT3JkZXJlZFNldCh2YWx1ZSkge1xuICAgIHJldHVybiB2YWx1ZSA9PT0gdW5kZWZpbmVkIHx8IHZhbHVlID09PSBudWxsXG4gICAgICA/IGVtcHR5T3JkZXJlZFNldCgpXG4gICAgICA6IGlzT3JkZXJlZFNldCh2YWx1ZSlcbiAgICAgID8gdmFsdWVcbiAgICAgIDogZW1wdHlPcmRlcmVkU2V0KCkud2l0aE11dGF0aW9ucyhmdW5jdGlvbiAoc2V0KSB7XG4gICAgICAgICAgdmFyIGl0ZXIgPSBTZXRDb2xsZWN0aW9uKHZhbHVlKTtcbiAgICAgICAgICBhc3NlcnROb3RJbmZpbml0ZShpdGVyLnNpemUpO1xuICAgICAgICAgIGl0ZXIuZm9yRWFjaChmdW5jdGlvbiAodikgeyByZXR1cm4gc2V0LmFkZCh2KTsgfSk7XG4gICAgICAgIH0pO1xuICB9XG5cbiAgaWYgKCBTZXQgKSBPcmRlcmVkU2V0Ll9fcHJvdG9fXyA9IFNldDtcbiAgT3JkZXJlZFNldC5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKCBTZXQgJiYgU2V0LnByb3RvdHlwZSApO1xuICBPcmRlcmVkU2V0LnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IE9yZGVyZWRTZXQ7XG5cbiAgT3JkZXJlZFNldC5vZiA9IGZ1bmN0aW9uIG9mICgvKi4uLnZhbHVlcyovKSB7XG4gICAgcmV0dXJuIHRoaXMoYXJndW1lbnRzKTtcbiAgfTtcblxuICBPcmRlcmVkU2V0LmZyb21LZXlzID0gZnVuY3Rpb24gZnJvbUtleXMgKHZhbHVlKSB7XG4gICAgcmV0dXJuIHRoaXMoS2V5ZWRDb2xsZWN0aW9uKHZhbHVlKS5rZXlTZXEoKSk7XG4gIH07XG5cbiAgT3JkZXJlZFNldC5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbiB0b1N0cmluZyAoKSB7XG4gICAgcmV0dXJuIHRoaXMuX190b1N0cmluZygnT3JkZXJlZFNldCB7JywgJ30nKTtcbiAgfTtcblxuICByZXR1cm4gT3JkZXJlZFNldDtcbn0oU2V0KSk7XG5cbk9yZGVyZWRTZXQuaXNPcmRlcmVkU2V0ID0gaXNPcmRlcmVkU2V0O1xuXG52YXIgT3JkZXJlZFNldFByb3RvdHlwZSA9IE9yZGVyZWRTZXQucHJvdG90eXBlO1xuT3JkZXJlZFNldFByb3RvdHlwZVtJU19PUkRFUkVEX1NZTUJPTF0gPSB0cnVlO1xuT3JkZXJlZFNldFByb3RvdHlwZS56aXAgPSBJbmRleGVkQ29sbGVjdGlvblByb3RvdHlwZS56aXA7XG5PcmRlcmVkU2V0UHJvdG90eXBlLnppcFdpdGggPSBJbmRleGVkQ29sbGVjdGlvblByb3RvdHlwZS56aXBXaXRoO1xuT3JkZXJlZFNldFByb3RvdHlwZS56aXBBbGwgPSBJbmRleGVkQ29sbGVjdGlvblByb3RvdHlwZS56aXBBbGw7XG5cbk9yZGVyZWRTZXRQcm90b3R5cGUuX19lbXB0eSA9IGVtcHR5T3JkZXJlZFNldDtcbk9yZGVyZWRTZXRQcm90b3R5cGUuX19tYWtlID0gbWFrZU9yZGVyZWRTZXQ7XG5cbmZ1bmN0aW9uIG1ha2VPcmRlcmVkU2V0KG1hcCwgb3duZXJJRCkge1xuICB2YXIgc2V0ID0gT2JqZWN0LmNyZWF0ZShPcmRlcmVkU2V0UHJvdG90eXBlKTtcbiAgc2V0LnNpemUgPSBtYXAgPyBtYXAuc2l6ZSA6IDA7XG4gIHNldC5fbWFwID0gbWFwO1xuICBzZXQuX19vd25lcklEID0gb3duZXJJRDtcbiAgcmV0dXJuIHNldDtcbn1cblxudmFyIEVNUFRZX09SREVSRURfU0VUO1xuZnVuY3Rpb24gZW1wdHlPcmRlcmVkU2V0KCkge1xuICByZXR1cm4gKFxuICAgIEVNUFRZX09SREVSRURfU0VUIHx8IChFTVBUWV9PUkRFUkVEX1NFVCA9IG1ha2VPcmRlcmVkU2V0KGVtcHR5T3JkZXJlZE1hcCgpKSlcbiAgKTtcbn1cblxuZnVuY3Rpb24gdGhyb3dPbkludmFsaWREZWZhdWx0VmFsdWVzKGRlZmF1bHRWYWx1ZXMpIHtcbiAgaWYgKGlzUmVjb3JkKGRlZmF1bHRWYWx1ZXMpKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgJ0NhbiBub3QgY2FsbCBgUmVjb3JkYCB3aXRoIGFuIGltbXV0YWJsZSBSZWNvcmQgYXMgZGVmYXVsdCB2YWx1ZXMuIFVzZSBhIHBsYWluIGphdmFzY3JpcHQgb2JqZWN0IGluc3RlYWQuJ1xuICAgICk7XG4gIH1cblxuICBpZiAoaXNJbW11dGFibGUoZGVmYXVsdFZhbHVlcykpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAnQ2FuIG5vdCBjYWxsIGBSZWNvcmRgIHdpdGggYW4gaW1tdXRhYmxlIENvbGxlY3Rpb24gYXMgZGVmYXVsdCB2YWx1ZXMuIFVzZSBhIHBsYWluIGphdmFzY3JpcHQgb2JqZWN0IGluc3RlYWQuJ1xuICAgICk7XG4gIH1cblxuICBpZiAoZGVmYXVsdFZhbHVlcyA9PT0gbnVsbCB8fCB0eXBlb2YgZGVmYXVsdFZhbHVlcyAhPT0gJ29iamVjdCcpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAnQ2FuIG5vdCBjYWxsIGBSZWNvcmRgIHdpdGggYSBub24tb2JqZWN0IGFzIGRlZmF1bHQgdmFsdWVzLiBVc2UgYSBwbGFpbiBqYXZhc2NyaXB0IG9iamVjdCBpbnN0ZWFkLidcbiAgICApO1xuICB9XG59XG5cbnZhciBSZWNvcmQgPSBmdW5jdGlvbiBSZWNvcmQoZGVmYXVsdFZhbHVlcywgbmFtZSkge1xuICB2YXIgaGFzSW5pdGlhbGl6ZWQ7XG5cbiAgdGhyb3dPbkludmFsaWREZWZhdWx0VmFsdWVzKGRlZmF1bHRWYWx1ZXMpO1xuXG4gIHZhciBSZWNvcmRUeXBlID0gZnVuY3Rpb24gUmVjb3JkKHZhbHVlcykge1xuICAgIHZhciB0aGlzJDEkMSA9IHRoaXM7XG5cbiAgICBpZiAodmFsdWVzIGluc3RhbmNlb2YgUmVjb3JkVHlwZSkge1xuICAgICAgcmV0dXJuIHZhbHVlcztcbiAgICB9XG4gICAgaWYgKCEodGhpcyBpbnN0YW5jZW9mIFJlY29yZFR5cGUpKSB7XG4gICAgICByZXR1cm4gbmV3IFJlY29yZFR5cGUodmFsdWVzKTtcbiAgICB9XG4gICAgaWYgKCFoYXNJbml0aWFsaXplZCkge1xuICAgICAgaGFzSW5pdGlhbGl6ZWQgPSB0cnVlO1xuICAgICAgdmFyIGtleXMgPSBPYmplY3Qua2V5cyhkZWZhdWx0VmFsdWVzKTtcbiAgICAgIHZhciBpbmRpY2VzID0gKFJlY29yZFR5cGVQcm90b3R5cGUuX2luZGljZXMgPSB7fSk7XG4gICAgICAvLyBEZXByZWNhdGVkOiBsZWZ0IHRvIGF0dGVtcHQgbm90IHRvIGJyZWFrIGFueSBleHRlcm5hbCBjb2RlIHdoaWNoXG4gICAgICAvLyByZWxpZXMgb24gYSAuX25hbWUgcHJvcGVydHkgZXhpc3Rpbmcgb24gcmVjb3JkIGluc3RhbmNlcy5cbiAgICAgIC8vIFVzZSBSZWNvcmQuZ2V0RGVzY3JpcHRpdmVOYW1lKCkgaW5zdGVhZFxuICAgICAgUmVjb3JkVHlwZVByb3RvdHlwZS5fbmFtZSA9IG5hbWU7XG4gICAgICBSZWNvcmRUeXBlUHJvdG90eXBlLl9rZXlzID0ga2V5cztcbiAgICAgIFJlY29yZFR5cGVQcm90b3R5cGUuX2RlZmF1bHRWYWx1ZXMgPSBkZWZhdWx0VmFsdWVzO1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBrZXlzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHZhciBwcm9wTmFtZSA9IGtleXNbaV07XG4gICAgICAgIGluZGljZXNbcHJvcE5hbWVdID0gaTtcbiAgICAgICAgaWYgKFJlY29yZFR5cGVQcm90b3R5cGVbcHJvcE5hbWVdKSB7XG4gICAgICAgICAgLyogZXNsaW50LWRpc2FibGUgbm8tY29uc29sZSAqL1xuICAgICAgICAgIHR5cGVvZiBjb25zb2xlID09PSAnb2JqZWN0JyAmJlxuICAgICAgICAgICAgY29uc29sZS53YXJuICYmXG4gICAgICAgICAgICBjb25zb2xlLndhcm4oXG4gICAgICAgICAgICAgICdDYW5ub3QgZGVmaW5lICcgK1xuICAgICAgICAgICAgICAgIHJlY29yZE5hbWUodGhpcykgK1xuICAgICAgICAgICAgICAgICcgd2l0aCBwcm9wZXJ0eSBcIicgK1xuICAgICAgICAgICAgICAgIHByb3BOYW1lICtcbiAgICAgICAgICAgICAgICAnXCIgc2luY2UgdGhhdCBwcm9wZXJ0eSBuYW1lIGlzIHBhcnQgb2YgdGhlIFJlY29yZCBBUEkuJ1xuICAgICAgICAgICAgKTtcbiAgICAgICAgICAvKiBlc2xpbnQtZW5hYmxlIG5vLWNvbnNvbGUgKi9cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBzZXRQcm9wKFJlY29yZFR5cGVQcm90b3R5cGUsIHByb3BOYW1lKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICB0aGlzLl9fb3duZXJJRCA9IHVuZGVmaW5lZDtcbiAgICB0aGlzLl92YWx1ZXMgPSBMaXN0KCkud2l0aE11dGF0aW9ucyhmdW5jdGlvbiAobCkge1xuICAgICAgbC5zZXRTaXplKHRoaXMkMSQxLl9rZXlzLmxlbmd0aCk7XG4gICAgICBLZXllZENvbGxlY3Rpb24odmFsdWVzKS5mb3JFYWNoKGZ1bmN0aW9uICh2LCBrKSB7XG4gICAgICAgIGwuc2V0KHRoaXMkMSQxLl9pbmRpY2VzW2tdLCB2ID09PSB0aGlzJDEkMS5fZGVmYXVsdFZhbHVlc1trXSA/IHVuZGVmaW5lZCA6IHYpO1xuICAgICAgfSk7XG4gICAgfSk7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH07XG5cbiAgdmFyIFJlY29yZFR5cGVQcm90b3R5cGUgPSAoUmVjb3JkVHlwZS5wcm90b3R5cGUgPVxuICAgIE9iamVjdC5jcmVhdGUoUmVjb3JkUHJvdG90eXBlKSk7XG4gIFJlY29yZFR5cGVQcm90b3R5cGUuY29uc3RydWN0b3IgPSBSZWNvcmRUeXBlO1xuXG4gIGlmIChuYW1lKSB7XG4gICAgUmVjb3JkVHlwZS5kaXNwbGF5TmFtZSA9IG5hbWU7XG4gIH1cblxuICByZXR1cm4gUmVjb3JkVHlwZTtcbn07XG5cblJlY29yZC5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbiB0b1N0cmluZyAoKSB7XG4gIHZhciBzdHIgPSByZWNvcmROYW1lKHRoaXMpICsgJyB7ICc7XG4gIHZhciBrZXlzID0gdGhpcy5fa2V5cztcbiAgdmFyIGs7XG4gIGZvciAodmFyIGkgPSAwLCBsID0ga2V5cy5sZW5ndGg7IGkgIT09IGw7IGkrKykge1xuICAgIGsgPSBrZXlzW2ldO1xuICAgIHN0ciArPSAoaSA/ICcsICcgOiAnJykgKyBrICsgJzogJyArIHF1b3RlU3RyaW5nKHRoaXMuZ2V0KGspKTtcbiAgfVxuICByZXR1cm4gc3RyICsgJyB9Jztcbn07XG5cblJlY29yZC5wcm90b3R5cGUuZXF1YWxzID0gZnVuY3Rpb24gZXF1YWxzIChvdGhlcikge1xuICByZXR1cm4gKFxuICAgIHRoaXMgPT09IG90aGVyIHx8XG4gICAgKGlzUmVjb3JkKG90aGVyKSAmJiByZWNvcmRTZXEodGhpcykuZXF1YWxzKHJlY29yZFNlcShvdGhlcikpKVxuICApO1xufTtcblxuUmVjb3JkLnByb3RvdHlwZS5oYXNoQ29kZSA9IGZ1bmN0aW9uIGhhc2hDb2RlICgpIHtcbiAgcmV0dXJuIHJlY29yZFNlcSh0aGlzKS5oYXNoQ29kZSgpO1xufTtcblxuLy8gQHByYWdtYSBBY2Nlc3NcblxuUmVjb3JkLnByb3RvdHlwZS5oYXMgPSBmdW5jdGlvbiBoYXMgKGspIHtcbiAgcmV0dXJuIHRoaXMuX2luZGljZXMuaGFzT3duUHJvcGVydHkoayk7XG59O1xuXG5SZWNvcmQucHJvdG90eXBlLmdldCA9IGZ1bmN0aW9uIGdldCAoaywgbm90U2V0VmFsdWUpIHtcbiAgaWYgKCF0aGlzLmhhcyhrKSkge1xuICAgIHJldHVybiBub3RTZXRWYWx1ZTtcbiAgfVxuICB2YXIgaW5kZXggPSB0aGlzLl9pbmRpY2VzW2tdO1xuICB2YXIgdmFsdWUgPSB0aGlzLl92YWx1ZXMuZ2V0KGluZGV4KTtcbiAgcmV0dXJuIHZhbHVlID09PSB1bmRlZmluZWQgPyB0aGlzLl9kZWZhdWx0VmFsdWVzW2tdIDogdmFsdWU7XG59O1xuXG4vLyBAcHJhZ21hIE1vZGlmaWNhdGlvblxuXG5SZWNvcmQucHJvdG90eXBlLnNldCA9IGZ1bmN0aW9uIHNldCAoaywgdikge1xuICBpZiAodGhpcy5oYXMoaykpIHtcbiAgICB2YXIgbmV3VmFsdWVzID0gdGhpcy5fdmFsdWVzLnNldChcbiAgICAgIHRoaXMuX2luZGljZXNba10sXG4gICAgICB2ID09PSB0aGlzLl9kZWZhdWx0VmFsdWVzW2tdID8gdW5kZWZpbmVkIDogdlxuICAgICk7XG4gICAgaWYgKG5ld1ZhbHVlcyAhPT0gdGhpcy5fdmFsdWVzICYmICF0aGlzLl9fb3duZXJJRCkge1xuICAgICAgcmV0dXJuIG1ha2VSZWNvcmQodGhpcywgbmV3VmFsdWVzKTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5SZWNvcmQucHJvdG90eXBlLnJlbW92ZSA9IGZ1bmN0aW9uIHJlbW92ZSAoaykge1xuICByZXR1cm4gdGhpcy5zZXQoayk7XG59O1xuXG5SZWNvcmQucHJvdG90eXBlLmNsZWFyID0gZnVuY3Rpb24gY2xlYXIgKCkge1xuICB2YXIgbmV3VmFsdWVzID0gdGhpcy5fdmFsdWVzLmNsZWFyKCkuc2V0U2l6ZSh0aGlzLl9rZXlzLmxlbmd0aCk7XG5cbiAgcmV0dXJuIHRoaXMuX19vd25lcklEID8gdGhpcyA6IG1ha2VSZWNvcmQodGhpcywgbmV3VmFsdWVzKTtcbn07XG5cblJlY29yZC5wcm90b3R5cGUud2FzQWx0ZXJlZCA9IGZ1bmN0aW9uIHdhc0FsdGVyZWQgKCkge1xuICByZXR1cm4gdGhpcy5fdmFsdWVzLndhc0FsdGVyZWQoKTtcbn07XG5cblJlY29yZC5wcm90b3R5cGUudG9TZXEgPSBmdW5jdGlvbiB0b1NlcSAoKSB7XG4gIHJldHVybiByZWNvcmRTZXEodGhpcyk7XG59O1xuXG5SZWNvcmQucHJvdG90eXBlLnRvSlMgPSBmdW5jdGlvbiB0b0pTJDEgKCkge1xuICByZXR1cm4gdG9KUyh0aGlzKTtcbn07XG5cblJlY29yZC5wcm90b3R5cGUuZW50cmllcyA9IGZ1bmN0aW9uIGVudHJpZXMgKCkge1xuICByZXR1cm4gdGhpcy5fX2l0ZXJhdG9yKElURVJBVEVfRU5UUklFUyk7XG59O1xuXG5SZWNvcmQucHJvdG90eXBlLl9faXRlcmF0b3IgPSBmdW5jdGlvbiBfX2l0ZXJhdG9yICh0eXBlLCByZXZlcnNlKSB7XG4gIHJldHVybiByZWNvcmRTZXEodGhpcykuX19pdGVyYXRvcih0eXBlLCByZXZlcnNlKTtcbn07XG5cblJlY29yZC5wcm90b3R5cGUuX19pdGVyYXRlID0gZnVuY3Rpb24gX19pdGVyYXRlIChmbiwgcmV2ZXJzZSkge1xuICByZXR1cm4gcmVjb3JkU2VxKHRoaXMpLl9faXRlcmF0ZShmbiwgcmV2ZXJzZSk7XG59O1xuXG5SZWNvcmQucHJvdG90eXBlLl9fZW5zdXJlT3duZXIgPSBmdW5jdGlvbiBfX2Vuc3VyZU93bmVyIChvd25lcklEKSB7XG4gIGlmIChvd25lcklEID09PSB0aGlzLl9fb3duZXJJRCkge1xuICAgIHJldHVybiB0aGlzO1xuICB9XG4gIHZhciBuZXdWYWx1ZXMgPSB0aGlzLl92YWx1ZXMuX19lbnN1cmVPd25lcihvd25lcklEKTtcbiAgaWYgKCFvd25lcklEKSB7XG4gICAgdGhpcy5fX293bmVySUQgPSBvd25lcklEO1xuICAgIHRoaXMuX3ZhbHVlcyA9IG5ld1ZhbHVlcztcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuICByZXR1cm4gbWFrZVJlY29yZCh0aGlzLCBuZXdWYWx1ZXMsIG93bmVySUQpO1xufTtcblxuUmVjb3JkLmlzUmVjb3JkID0gaXNSZWNvcmQ7XG5SZWNvcmQuZ2V0RGVzY3JpcHRpdmVOYW1lID0gcmVjb3JkTmFtZTtcbnZhciBSZWNvcmRQcm90b3R5cGUgPSBSZWNvcmQucHJvdG90eXBlO1xuUmVjb3JkUHJvdG90eXBlW0lTX1JFQ09SRF9TWU1CT0xdID0gdHJ1ZTtcblJlY29yZFByb3RvdHlwZVtERUxFVEVdID0gUmVjb3JkUHJvdG90eXBlLnJlbW92ZTtcblJlY29yZFByb3RvdHlwZS5kZWxldGVJbiA9IFJlY29yZFByb3RvdHlwZS5yZW1vdmVJbiA9IGRlbGV0ZUluO1xuUmVjb3JkUHJvdG90eXBlLmdldEluID0gZ2V0SW47XG5SZWNvcmRQcm90b3R5cGUuaGFzSW4gPSBDb2xsZWN0aW9uUHJvdG90eXBlLmhhc0luO1xuUmVjb3JkUHJvdG90eXBlLm1lcmdlID0gbWVyZ2UkMTtcblJlY29yZFByb3RvdHlwZS5tZXJnZVdpdGggPSBtZXJnZVdpdGgkMTtcblJlY29yZFByb3RvdHlwZS5tZXJnZUluID0gbWVyZ2VJbjtcblJlY29yZFByb3RvdHlwZS5tZXJnZURlZXAgPSBtZXJnZURlZXA7XG5SZWNvcmRQcm90b3R5cGUubWVyZ2VEZWVwV2l0aCA9IG1lcmdlRGVlcFdpdGg7XG5SZWNvcmRQcm90b3R5cGUubWVyZ2VEZWVwSW4gPSBtZXJnZURlZXBJbjtcblJlY29yZFByb3RvdHlwZS5zZXRJbiA9IHNldEluO1xuUmVjb3JkUHJvdG90eXBlLnVwZGF0ZSA9IHVwZGF0ZTtcblJlY29yZFByb3RvdHlwZS51cGRhdGVJbiA9IHVwZGF0ZUluO1xuUmVjb3JkUHJvdG90eXBlLndpdGhNdXRhdGlvbnMgPSB3aXRoTXV0YXRpb25zO1xuUmVjb3JkUHJvdG90eXBlLmFzTXV0YWJsZSA9IGFzTXV0YWJsZTtcblJlY29yZFByb3RvdHlwZS5hc0ltbXV0YWJsZSA9IGFzSW1tdXRhYmxlO1xuUmVjb3JkUHJvdG90eXBlW0lURVJBVE9SX1NZTUJPTF0gPSBSZWNvcmRQcm90b3R5cGUuZW50cmllcztcblJlY29yZFByb3RvdHlwZS50b0pTT04gPSBSZWNvcmRQcm90b3R5cGUudG9PYmplY3QgPVxuICBDb2xsZWN0aW9uUHJvdG90eXBlLnRvT2JqZWN0O1xuUmVjb3JkUHJvdG90eXBlLmluc3BlY3QgPSBSZWNvcmRQcm90b3R5cGUudG9Tb3VyY2UgPSBmdW5jdGlvbiAoKSB7XG4gIHJldHVybiB0aGlzLnRvU3RyaW5nKCk7XG59O1xuXG5mdW5jdGlvbiBtYWtlUmVjb3JkKGxpa2VSZWNvcmQsIHZhbHVlcywgb3duZXJJRCkge1xuICB2YXIgcmVjb3JkID0gT2JqZWN0LmNyZWF0ZShPYmplY3QuZ2V0UHJvdG90eXBlT2YobGlrZVJlY29yZCkpO1xuICByZWNvcmQuX3ZhbHVlcyA9IHZhbHVlcztcbiAgcmVjb3JkLl9fb3duZXJJRCA9IG93bmVySUQ7XG4gIHJldHVybiByZWNvcmQ7XG59XG5cbmZ1bmN0aW9uIHJlY29yZE5hbWUocmVjb3JkKSB7XG4gIHJldHVybiByZWNvcmQuY29uc3RydWN0b3IuZGlzcGxheU5hbWUgfHwgcmVjb3JkLmNvbnN0cnVjdG9yLm5hbWUgfHwgJ1JlY29yZCc7XG59XG5cbmZ1bmN0aW9uIHJlY29yZFNlcShyZWNvcmQpIHtcbiAgcmV0dXJuIGtleWVkU2VxRnJvbVZhbHVlKHJlY29yZC5fa2V5cy5tYXAoZnVuY3Rpb24gKGspIHsgcmV0dXJuIFtrLCByZWNvcmQuZ2V0KGspXTsgfSkpO1xufVxuXG5mdW5jdGlvbiBzZXRQcm9wKHByb3RvdHlwZSwgbmFtZSkge1xuICB0cnkge1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShwcm90b3R5cGUsIG5hbWUsIHtcbiAgICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5nZXQobmFtZSk7XG4gICAgICB9LFxuICAgICAgc2V0OiBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgaW52YXJpYW50KHRoaXMuX19vd25lcklELCAnQ2Fubm90IHNldCBvbiBhbiBpbW11dGFibGUgcmVjb3JkLicpO1xuICAgICAgICB0aGlzLnNldChuYW1lLCB2YWx1ZSk7XG4gICAgICB9LFxuICAgIH0pO1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIC8vIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSBmYWlsZWQuIFByb2JhYmx5IElFOC5cbiAgfVxufVxuXG4vKipcbiAqIFJldHVybnMgYSBsYXp5IFNlcSBvZiBgdmFsdWVgIHJlcGVhdGVkIGB0aW1lc2AgdGltZXMuIFdoZW4gYHRpbWVzYCBpc1xuICogdW5kZWZpbmVkLCByZXR1cm5zIGFuIGluZmluaXRlIHNlcXVlbmNlIG9mIGB2YWx1ZWAuXG4gKi9cbnZhciBSZXBlYXQgPSAvKkBfX1BVUkVfXyovKGZ1bmN0aW9uIChJbmRleGVkU2VxKSB7XG4gIGZ1bmN0aW9uIFJlcGVhdCh2YWx1ZSwgdGltZXMpIHtcbiAgICBpZiAoISh0aGlzIGluc3RhbmNlb2YgUmVwZWF0KSkge1xuICAgICAgcmV0dXJuIG5ldyBSZXBlYXQodmFsdWUsIHRpbWVzKTtcbiAgICB9XG4gICAgdGhpcy5fdmFsdWUgPSB2YWx1ZTtcbiAgICB0aGlzLnNpemUgPSB0aW1lcyA9PT0gdW5kZWZpbmVkID8gSW5maW5pdHkgOiBNYXRoLm1heCgwLCB0aW1lcyk7XG4gICAgaWYgKHRoaXMuc2l6ZSA9PT0gMCkge1xuICAgICAgaWYgKEVNUFRZX1JFUEVBVCkge1xuICAgICAgICByZXR1cm4gRU1QVFlfUkVQRUFUO1xuICAgICAgfVxuICAgICAgRU1QVFlfUkVQRUFUID0gdGhpcztcbiAgICB9XG4gIH1cblxuICBpZiAoIEluZGV4ZWRTZXEgKSBSZXBlYXQuX19wcm90b19fID0gSW5kZXhlZFNlcTtcbiAgUmVwZWF0LnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoIEluZGV4ZWRTZXEgJiYgSW5kZXhlZFNlcS5wcm90b3R5cGUgKTtcbiAgUmVwZWF0LnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IFJlcGVhdDtcblxuICBSZXBlYXQucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24gdG9TdHJpbmcgKCkge1xuICAgIGlmICh0aGlzLnNpemUgPT09IDApIHtcbiAgICAgIHJldHVybiAnUmVwZWF0IFtdJztcbiAgICB9XG4gICAgcmV0dXJuICdSZXBlYXQgWyAnICsgdGhpcy5fdmFsdWUgKyAnICcgKyB0aGlzLnNpemUgKyAnIHRpbWVzIF0nO1xuICB9O1xuXG4gIFJlcGVhdC5wcm90b3R5cGUuZ2V0ID0gZnVuY3Rpb24gZ2V0IChpbmRleCwgbm90U2V0VmFsdWUpIHtcbiAgICByZXR1cm4gdGhpcy5oYXMoaW5kZXgpID8gdGhpcy5fdmFsdWUgOiBub3RTZXRWYWx1ZTtcbiAgfTtcblxuICBSZXBlYXQucHJvdG90eXBlLmluY2x1ZGVzID0gZnVuY3Rpb24gaW5jbHVkZXMgKHNlYXJjaFZhbHVlKSB7XG4gICAgcmV0dXJuIGlzKHRoaXMuX3ZhbHVlLCBzZWFyY2hWYWx1ZSk7XG4gIH07XG5cbiAgUmVwZWF0LnByb3RvdHlwZS5zbGljZSA9IGZ1bmN0aW9uIHNsaWNlIChiZWdpbiwgZW5kKSB7XG4gICAgdmFyIHNpemUgPSB0aGlzLnNpemU7XG4gICAgcmV0dXJuIHdob2xlU2xpY2UoYmVnaW4sIGVuZCwgc2l6ZSlcbiAgICAgID8gdGhpc1xuICAgICAgOiBuZXcgUmVwZWF0KFxuICAgICAgICAgIHRoaXMuX3ZhbHVlLFxuICAgICAgICAgIHJlc29sdmVFbmQoZW5kLCBzaXplKSAtIHJlc29sdmVCZWdpbihiZWdpbiwgc2l6ZSlcbiAgICAgICAgKTtcbiAgfTtcblxuICBSZXBlYXQucHJvdG90eXBlLnJldmVyc2UgPSBmdW5jdGlvbiByZXZlcnNlICgpIHtcbiAgICByZXR1cm4gdGhpcztcbiAgfTtcblxuICBSZXBlYXQucHJvdG90eXBlLmluZGV4T2YgPSBmdW5jdGlvbiBpbmRleE9mIChzZWFyY2hWYWx1ZSkge1xuICAgIGlmIChpcyh0aGlzLl92YWx1ZSwgc2VhcmNoVmFsdWUpKSB7XG4gICAgICByZXR1cm4gMDtcbiAgICB9XG4gICAgcmV0dXJuIC0xO1xuICB9O1xuXG4gIFJlcGVhdC5wcm90b3R5cGUubGFzdEluZGV4T2YgPSBmdW5jdGlvbiBsYXN0SW5kZXhPZiAoc2VhcmNoVmFsdWUpIHtcbiAgICBpZiAoaXModGhpcy5fdmFsdWUsIHNlYXJjaFZhbHVlKSkge1xuICAgICAgcmV0dXJuIHRoaXMuc2l6ZTtcbiAgICB9XG4gICAgcmV0dXJuIC0xO1xuICB9O1xuXG4gIFJlcGVhdC5wcm90b3R5cGUuX19pdGVyYXRlID0gZnVuY3Rpb24gX19pdGVyYXRlIChmbiwgcmV2ZXJzZSkge1xuICAgIHZhciBzaXplID0gdGhpcy5zaXplO1xuICAgIHZhciBpID0gMDtcbiAgICB3aGlsZSAoaSAhPT0gc2l6ZSkge1xuICAgICAgaWYgKGZuKHRoaXMuX3ZhbHVlLCByZXZlcnNlID8gc2l6ZSAtICsraSA6IGkrKywgdGhpcykgPT09IGZhbHNlKSB7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gaTtcbiAgfTtcblxuICBSZXBlYXQucHJvdG90eXBlLl9faXRlcmF0b3IgPSBmdW5jdGlvbiBfX2l0ZXJhdG9yICh0eXBlLCByZXZlcnNlKSB7XG4gICAgdmFyIHRoaXMkMSQxID0gdGhpcztcblxuICAgIHZhciBzaXplID0gdGhpcy5zaXplO1xuICAgIHZhciBpID0gMDtcbiAgICByZXR1cm4gbmV3IEl0ZXJhdG9yKGZ1bmN0aW9uICgpIHsgcmV0dXJuIGkgPT09IHNpemVcbiAgICAgICAgPyBpdGVyYXRvckRvbmUoKVxuICAgICAgICA6IGl0ZXJhdG9yVmFsdWUodHlwZSwgcmV2ZXJzZSA/IHNpemUgLSArK2kgOiBpKyssIHRoaXMkMSQxLl92YWx1ZSk7IH1cbiAgICApO1xuICB9O1xuXG4gIFJlcGVhdC5wcm90b3R5cGUuZXF1YWxzID0gZnVuY3Rpb24gZXF1YWxzIChvdGhlcikge1xuICAgIHJldHVybiBvdGhlciBpbnN0YW5jZW9mIFJlcGVhdFxuICAgICAgPyBpcyh0aGlzLl92YWx1ZSwgb3RoZXIuX3ZhbHVlKVxuICAgICAgOiBkZWVwRXF1YWwob3RoZXIpO1xuICB9O1xuXG4gIHJldHVybiBSZXBlYXQ7XG59KEluZGV4ZWRTZXEpKTtcblxudmFyIEVNUFRZX1JFUEVBVDtcblxuZnVuY3Rpb24gZnJvbUpTKHZhbHVlLCBjb252ZXJ0ZXIpIHtcbiAgcmV0dXJuIGZyb21KU1dpdGgoXG4gICAgW10sXG4gICAgY29udmVydGVyIHx8IGRlZmF1bHRDb252ZXJ0ZXIsXG4gICAgdmFsdWUsXG4gICAgJycsXG4gICAgY29udmVydGVyICYmIGNvbnZlcnRlci5sZW5ndGggPiAyID8gW10gOiB1bmRlZmluZWQsXG4gICAgeyAnJzogdmFsdWUgfVxuICApO1xufVxuXG5mdW5jdGlvbiBmcm9tSlNXaXRoKHN0YWNrLCBjb252ZXJ0ZXIsIHZhbHVlLCBrZXksIGtleVBhdGgsIHBhcmVudFZhbHVlKSB7XG4gIGlmIChcbiAgICB0eXBlb2YgdmFsdWUgIT09ICdzdHJpbmcnICYmXG4gICAgIWlzSW1tdXRhYmxlKHZhbHVlKSAmJlxuICAgIChpc0FycmF5TGlrZSh2YWx1ZSkgfHwgaGFzSXRlcmF0b3IodmFsdWUpIHx8IGlzUGxhaW5PYmplY3QodmFsdWUpKVxuICApIHtcbiAgICBpZiAofnN0YWNrLmluZGV4T2YodmFsdWUpKSB7XG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdDYW5ub3QgY29udmVydCBjaXJjdWxhciBzdHJ1Y3R1cmUgdG8gSW1tdXRhYmxlJyk7XG4gICAgfVxuICAgIHN0YWNrLnB1c2godmFsdWUpO1xuICAgIGtleVBhdGggJiYga2V5ICE9PSAnJyAmJiBrZXlQYXRoLnB1c2goa2V5KTtcbiAgICB2YXIgY29udmVydGVkID0gY29udmVydGVyLmNhbGwoXG4gICAgICBwYXJlbnRWYWx1ZSxcbiAgICAgIGtleSxcbiAgICAgIFNlcSh2YWx1ZSkubWFwKGZ1bmN0aW9uICh2LCBrKSB7IHJldHVybiBmcm9tSlNXaXRoKHN0YWNrLCBjb252ZXJ0ZXIsIHYsIGssIGtleVBhdGgsIHZhbHVlKTsgfVxuICAgICAgKSxcbiAgICAgIGtleVBhdGggJiYga2V5UGF0aC5zbGljZSgpXG4gICAgKTtcbiAgICBzdGFjay5wb3AoKTtcbiAgICBrZXlQYXRoICYmIGtleVBhdGgucG9wKCk7XG4gICAgcmV0dXJuIGNvbnZlcnRlZDtcbiAgfVxuICByZXR1cm4gdmFsdWU7XG59XG5cbmZ1bmN0aW9uIGRlZmF1bHRDb252ZXJ0ZXIoaywgdikge1xuICAvLyBFZmZlY3RpdmVseSB0aGUgb3Bwb3NpdGUgb2YgXCJDb2xsZWN0aW9uLnRvU2VxKClcIlxuICByZXR1cm4gaXNJbmRleGVkKHYpID8gdi50b0xpc3QoKSA6IGlzS2V5ZWQodikgPyB2LnRvTWFwKCkgOiB2LnRvU2V0KCk7XG59XG5cbnZhciB2ZXJzaW9uID0gXCI0LjEuMFwiO1xuXG52YXIgSW1tdXRhYmxlID0ge1xuICB2ZXJzaW9uOiB2ZXJzaW9uLFxuXG4gIENvbGxlY3Rpb246IENvbGxlY3Rpb24sXG4gIC8vIE5vdGU6IEl0ZXJhYmxlIGlzIGRlcHJlY2F0ZWRcbiAgSXRlcmFibGU6IENvbGxlY3Rpb24sXG5cbiAgU2VxOiBTZXEsXG4gIE1hcDogTWFwLFxuICBPcmRlcmVkTWFwOiBPcmRlcmVkTWFwLFxuICBMaXN0OiBMaXN0LFxuICBTdGFjazogU3RhY2ssXG4gIFNldDogU2V0LFxuICBPcmRlcmVkU2V0OiBPcmRlcmVkU2V0LFxuXG4gIFJlY29yZDogUmVjb3JkLFxuICBSYW5nZTogUmFuZ2UsXG4gIFJlcGVhdDogUmVwZWF0LFxuXG4gIGlzOiBpcyxcbiAgZnJvbUpTOiBmcm9tSlMsXG4gIGhhc2g6IGhhc2gsXG5cbiAgaXNJbW11dGFibGU6IGlzSW1tdXRhYmxlLFxuICBpc0NvbGxlY3Rpb246IGlzQ29sbGVjdGlvbixcbiAgaXNLZXllZDogaXNLZXllZCxcbiAgaXNJbmRleGVkOiBpc0luZGV4ZWQsXG4gIGlzQXNzb2NpYXRpdmU6IGlzQXNzb2NpYXRpdmUsXG4gIGlzT3JkZXJlZDogaXNPcmRlcmVkLFxuICBpc1ZhbHVlT2JqZWN0OiBpc1ZhbHVlT2JqZWN0LFxuICBpc1BsYWluT2JqZWN0OiBpc1BsYWluT2JqZWN0LFxuICBpc1NlcTogaXNTZXEsXG4gIGlzTGlzdDogaXNMaXN0LFxuICBpc01hcDogaXNNYXAsXG4gIGlzT3JkZXJlZE1hcDogaXNPcmRlcmVkTWFwLFxuICBpc1N0YWNrOiBpc1N0YWNrLFxuICBpc1NldDogaXNTZXQsXG4gIGlzT3JkZXJlZFNldDogaXNPcmRlcmVkU2V0LFxuICBpc1JlY29yZDogaXNSZWNvcmQsXG5cbiAgZ2V0OiBnZXQsXG4gIGdldEluOiBnZXRJbiQxLFxuICBoYXM6IGhhcyxcbiAgaGFzSW46IGhhc0luJDEsXG4gIG1lcmdlOiBtZXJnZSxcbiAgbWVyZ2VEZWVwOiBtZXJnZURlZXAkMSxcbiAgbWVyZ2VXaXRoOiBtZXJnZVdpdGgsXG4gIG1lcmdlRGVlcFdpdGg6IG1lcmdlRGVlcFdpdGgkMSxcbiAgcmVtb3ZlOiByZW1vdmUsXG4gIHJlbW92ZUluOiByZW1vdmVJbixcbiAgc2V0OiBzZXQsXG4gIHNldEluOiBzZXRJbiQxLFxuICB1cGRhdGU6IHVwZGF0ZSQxLFxuICB1cGRhdGVJbjogdXBkYXRlSW4kMSxcbn07XG5cbi8vIE5vdGU6IEl0ZXJhYmxlIGlzIGRlcHJlY2F0ZWRcbnZhciBJdGVyYWJsZSA9IENvbGxlY3Rpb247XG5cbmV4cG9ydCBkZWZhdWx0IEltbXV0YWJsZTtcbmV4cG9ydCB7IENvbGxlY3Rpb24sIEl0ZXJhYmxlLCBMaXN0LCBNYXAsIE9yZGVyZWRNYXAsIE9yZGVyZWRTZXQsIFJhbmdlLCBSZWNvcmQsIFJlcGVhdCwgU2VxLCBTZXQsIFN0YWNrLCBmcm9tSlMsIGdldCwgZ2V0SW4kMSBhcyBnZXRJbiwgaGFzLCBoYXNJbiQxIGFzIGhhc0luLCBoYXNoLCBpcywgaXNBc3NvY2lhdGl2ZSwgaXNDb2xsZWN0aW9uLCBpc0ltbXV0YWJsZSwgaXNJbmRleGVkLCBpc0tleWVkLCBpc0xpc3QsIGlzTWFwLCBpc09yZGVyZWQsIGlzT3JkZXJlZE1hcCwgaXNPcmRlcmVkU2V0LCBpc1BsYWluT2JqZWN0LCBpc1JlY29yZCwgaXNTZXEsIGlzU2V0LCBpc1N0YWNrLCBpc1ZhbHVlT2JqZWN0LCBtZXJnZSwgbWVyZ2VEZWVwJDEgYXMgbWVyZ2VEZWVwLCBtZXJnZURlZXBXaXRoJDEgYXMgbWVyZ2VEZWVwV2l0aCwgbWVyZ2VXaXRoLCByZW1vdmUsIHJlbW92ZUluLCBzZXQsIHNldEluJDEgYXMgc2V0SW4sIHVwZGF0ZSQxIGFzIHVwZGF0ZSwgdXBkYXRlSW4kMSBhcyB1cGRhdGVJbiwgdmVyc2lvbiB9O1xuIiwiaW1wb3J0IHsgTWFwIH0gZnJvbSBcImltbXV0YWJsZVwiO1xuaW1wb3J0IHsgVGlsZUNvb3JkaW5hdGVzIH0gZnJvbSBcIi4vZ2FtZVwiO1xuXG5cbmV4cG9ydCBjb25zdCBlbnVtIFRpbGVOYW1lIHtcbiAgVW5kZWNpZGVkLFxuICBFbXB0eSxcbiAgR3Jhc3NMZWZ0LFxuICBHcmFzc01pZGRsZSxcbiAgR3Jhc3NSaWdodCxcbiAgSGFsZkdyYXNzTGVmdCxcbiAgSGFsZkdyYXNzUmlnaHQsXG4gIGxpZ2h0RGlydCxcbiAgTGlnaHRUb0RhcmtEaXJ0LFxuICBEYXJrZXN0RGlydCxcbiAgTGVmdERpcnQsXG4gIE1lZGl1bURpcnQsXG4gIFJpZ2h0RGlydCxcbiAgc2xpZ2h0Qm90dG9tTGVmdEhpZ2hsaWdodERpcnQsXG4gIHNsaWdodEJvdHRvbVJpZ2h0SGlnaGxpZ2h0RGlydCxcbiAgc2xpZ2h0VG9wSGlnaGxpZ2h0RGlydCxcbiAgc2xpZ2h0Qm90dG9tSGlnaGxpZ2h0RGlydCxcbiAgbGVmdEJvdHRvbURpcnQsXG4gIE1pZGRsZUJvdHRvbURpcnQsXG4gIFJpZ2h0Qm90dG9tRGlydCxcbiAgc2luZ2xlRGlydCxcbiAgUm9ja1RvcExlZnQsXG4gIFJvY2tUb3AsXG4gIFJvY2tUb3BSaWdodCxcbiAgUm9ja1RvcExlZnRIaWdobGlnaHQsXG4gIFJvY2tUb3BSaWdodEhpZ2hsaWdodCxcbiAgU3RvbmVUb3BMZWZ0LFxuICBTdG9uZVRvcCxcbiAgU3RvbmVUb3BSaWdodCxcbiAgUm9ja0xlZnQsXG4gIFJvY2tEYXJrLFxuICBSb2NrUmlnaHQsXG4gIFJvY2tCb3R0b21MZWZ0SGlnaGxpZ2h0LFxuICBSb2NrQm90dG9tUmlnaHRIaWdobGlnaHQsXG4gIFN0b25lTGVmdCxcbiAgU3RvbmVNaWRkbGUsXG4gIFN0b25lUmlnaHQsXG4gIFJvY2tCb3R0b21MZWZ0LFxuICBSb2NrQm90dG9tLFxuICBSb2NrQm90dG9tUmlnaHQsXG4gIFJvY2tGb3J3YXJkc0RpYWdvbmFsSGlnaGxpZ2h0LFxuICBSb2NrQmFja3dhcmRzRGlhZ29uYWxIaWdobGlnaHRcbn1cbmNvbnN0IGJsb2NrTmFtZUNvb3JkaW5hdGVzSW5uZXI6IFtUaWxlTmFtZSwgbnVsbCB8IFRpbGVDb29yZGluYXRlc11bXSA9IFtcbiAgW1RpbGVOYW1lLlVuZGVjaWRlZCwgbnVsbF0sXG4gIFtUaWxlTmFtZS5FbXB0eSwgbnVsbF0sXG4gIFtUaWxlTmFtZS5HcmFzc0xlZnQsIHsgeDogMCwgeTogMCB9XSxcbiAgW1RpbGVOYW1lLkdyYXNzTWlkZGxlLCB7IHg6IDEsIHk6IDAgfV0sXG4gIFtUaWxlTmFtZS5HcmFzc1JpZ2h0LCB7IHg6IDIsIHk6IDAgfV0sXG4gIFtUaWxlTmFtZS5IYWxmR3Jhc3NMZWZ0LCB7IHg6IDMsIHk6IDAgfV0sXG4gIFtUaWxlTmFtZS5IYWxmR3Jhc3NSaWdodCwgeyB4OiA0LCB5OiAwIH1dLFxuICBbVGlsZU5hbWUubGlnaHREaXJ0LCB7IHg6IDUsIHk6IDAgfV0sXG4gIFtUaWxlTmFtZS5MaWdodFRvRGFya0RpcnQsIHsgeDogNiwgeTogMCB9XSxcbiAgW1RpbGVOYW1lLkRhcmtlc3REaXJ0LCB7IHg6IDcsIHk6IDAgfV0sXG4gIFtUaWxlTmFtZS5MZWZ0RGlydCwgeyB4OiAwLCB5OiAxIH1dLFxuICBbVGlsZU5hbWUuTWVkaXVtRGlydCwgeyB4OiAxLCB5OiAxIH1dLFxuICBbVGlsZU5hbWUuUmlnaHREaXJ0LCB7IHg6IDIsIHk6IDEgfV0sXG4gIFtUaWxlTmFtZS5zbGlnaHRCb3R0b21MZWZ0SGlnaGxpZ2h0RGlydCwgeyB4OiAzLCB5OiAxIH1dLFxuICBbVGlsZU5hbWUuc2xpZ2h0Qm90dG9tUmlnaHRIaWdobGlnaHREaXJ0LCB7IHg6IDQsIHk6IDEgfV0sXG4gIFtUaWxlTmFtZS5zbGlnaHRUb3BIaWdobGlnaHREaXJ0LCB7IHg6IDUsIHk6IDEgfV0sXG4gIFtUaWxlTmFtZS5zbGlnaHRCb3R0b21IaWdobGlnaHREaXJ0LCB7IHg6IDYsIHk6IDEgfV0sXG4gIFtUaWxlTmFtZS5sZWZ0Qm90dG9tRGlydCwgeyB4OiAwLCB5OiAyIH1dLFxuICBbVGlsZU5hbWUuTWlkZGxlQm90dG9tRGlydCwgeyB4OiAxLCB5OiAyIH1dLFxuICBbVGlsZU5hbWUuUmlnaHRCb3R0b21EaXJ0LCB7IHg6IDIsIHk6IDIgfV0sXG4gIFtUaWxlTmFtZS5zaW5nbGVEaXJ0LCB7IHg6IDUsIHk6IDIgfV0sXG4gIFtUaWxlTmFtZS5Sb2NrVG9wTGVmdCwgeyB4OiAwLCB5OiAzIH1dLFxuICBbVGlsZU5hbWUuUm9ja1RvcCwgeyB4OiAxLCB5OiAzIH1dLFxuICBbVGlsZU5hbWUuUm9ja1RvcFJpZ2h0LCB7IHg6IDIsIHk6IDMgfV0sXG4gIFtUaWxlTmFtZS5Sb2NrVG9wTGVmdEhpZ2hsaWdodCwgeyB4OiAzLCB5OiAzIH1dLFxuICBbVGlsZU5hbWUuUm9ja1RvcFJpZ2h0SGlnaGxpZ2h0LCB7IHg6IDQsIHk6IDMgfV0sXG4gIFtUaWxlTmFtZS5TdG9uZVRvcExlZnQsIHsgeDogNSwgeTogMyB9XSxcbiAgW1RpbGVOYW1lLlN0b25lVG9wLCB7IHg6IDYsIHk6IDMgfV0sXG4gIFtUaWxlTmFtZS5TdG9uZVRvcFJpZ2h0LCB7IHg6IDcsIHk6IDMgfV0sXG4gIFtUaWxlTmFtZS5Sb2NrTGVmdCwgeyB4OiAwLCB5OiA0IH1dLFxuICBbVGlsZU5hbWUuUm9ja0RhcmssIHsgeDogMSwgeTogNCB9XSxcbiAgW1RpbGVOYW1lLlJvY2tSaWdodCwgeyB4OiAyLCB5OiA0IH1dLFxuICBbVGlsZU5hbWUuUm9ja0JvdHRvbUxlZnRIaWdobGlnaHQsIHsgeDogMywgeTogNCB9XSxcbiAgW1RpbGVOYW1lLlJvY2tCb3R0b21SaWdodEhpZ2hsaWdodCwgeyB4OiA0LCB5OiA0IH1dLFxuICBbVGlsZU5hbWUuU3RvbmVMZWZ0LCB7IHg6IDUsIHk6IDQgfV0sXG4gIFtUaWxlTmFtZS5TdG9uZU1pZGRsZSwgeyB4OiA2LCB5OiA0IH1dLFxuICBbVGlsZU5hbWUuU3RvbmVSaWdodCwgeyB4OiA3LCB5OiA0IH1dLFxuICBbVGlsZU5hbWUuUm9ja0JvdHRvbUxlZnQsIHsgeDogMCwgeTogNSB9XSxcbiAgW1RpbGVOYW1lLlJvY2tCb3R0b20sIHsgeDogMSwgeTogNSB9XSxcbiAgW1RpbGVOYW1lLlJvY2tCb3R0b21SaWdodCwgeyB4OiAyLCB5OiA1IH1dLFxuICBbVGlsZU5hbWUuUm9ja0ZvcndhcmRzRGlhZ29uYWxIaWdobGlnaHQsIHsgeDogMywgeTogNSB9XSxcbiAgW1RpbGVOYW1lLlJvY2tCYWNrd2FyZHNEaWFnb25hbEhpZ2hsaWdodCwgeyB4OiA0LCB5OiA1IH1dLFxuXTtcblxuXG5leHBvcnQgY29uc3QgYmxvY2tOYW1lQ29vcmRpbmF0ZXMgPSBNYXA8VGlsZU5hbWUsIFRpbGVDb29yZGluYXRlcyB8IG51bGw+KFxuICBibG9ja05hbWVDb29yZGluYXRlc0lubmVyXG4pO1xuIiwiaW1wb3J0IHsgTWFwLCBTZXQgfSBmcm9tIFwiaW1tdXRhYmxlXCI7XG5pbXBvcnQge1xuICBDZWxsQ29vcmRpbmF0ZXMsXG4gIGNvb3JkaW5hdGVzSGFzaCxcbiAgaGFzaENvb3JkaW5hdGVzLFxuICBPcHRpb25zLFxufSBmcm9tIFwiLi9nYW1lXCI7XG5pbXBvcnQgeyBDT0xMQVBTRV9GQUlMVVJFIH0gZnJvbSBcIi4vZ2V0UG9zc2libGVUaWxlR3JpZFwiO1xuaW1wb3J0IHsgVGlsZU5hbWUgfSBmcm9tIFwiLi9UaWxlTmFtZVwiO1xuaW1wb3J0IHsgdGlsZVJlbGF0aW9ucyB9IGZyb20gXCIuL3RpbGVSZWxhdGlvbnNcIjtcblxuZXhwb3J0IHR5cGUgY2VsbFBvc3NpYmlsaXR5RGV0YWlscyA9IHtcbiAgcG9zc2liaWxpdGllczogU2V0PFRpbGVOYW1lPjtcbiAgY29vcmRpbmF0ZXM6IENlbGxDb29yZGluYXRlcztcbn07XG5leHBvcnQgdHlwZSBQb3NzaWJsZVRpbGVHcmlkID0gTWFwPGNvb3JkaW5hdGVzSGFzaCwgY2VsbFBvc3NpYmlsaXR5RGV0YWlscz47XG5cbmV4cG9ydCBmdW5jdGlvbiBjb2xsYXBzZUNlbGwoXG4gIHRpbGU6IFRpbGVOYW1lLFxuICBjZWxsOiBDZWxsQ29vcmRpbmF0ZXMsXG4gIGdyaWQ6IFBvc3NpYmxlVGlsZUdyaWRcbik6IFBvc3NpYmxlVGlsZUdyaWQgfCB0eXBlb2YgQ09MTEFQU0VfRkFJTFVSRSB7XG4gIGNvbnN0IGNvbnN0cmFpbnRzID0gdGlsZVJlbGF0aW9ucy5nZXQodGlsZSk7XG4gIGlmICghY29uc3RyYWludHMpIHtcbiAgICByZXR1cm4gQ09MTEFQU0VfRkFJTFVSRTtcbiAgfVxuICByZXR1cm4gY29uc3RyYWludHMucmVkdWNlPFBvc3NpYmxlVGlsZUdyaWQgfCB0eXBlb2YgQ09MTEFQU0VfRkFJTFVSRT4oXG4gICAgKHJlZHVjdGlvbiwgdGlsZXMsIG9mZnNldCkgPT5cbiAgICAgIHJlZHVjdGlvbiA9PT0gQ09MTEFQU0VfRkFJTFVSRVxuICAgICAgICA/IENPTExBUFNFX0ZBSUxVUkVcbiAgICAgICAgOiBhcHBseUludGVyc2VjdGlvbihhZGRDZWxsQ29vcmRpbmF0ZXMoY2VsbCwgb2Zmc2V0KSwgdGlsZXMsIGdyaWQpLFxuICAgIGdyaWRcbiAgKTtcbn1cblxuZnVuY3Rpb24gYXBwbHlJbnRlcnNlY3Rpb24oXG4gIGNlbGw6IENlbGxDb29yZGluYXRlcyxcbiAgdGlsZXM6IFNldDxUaWxlTmFtZT4sXG4gIGdyaWQ6IFBvc3NpYmxlVGlsZUdyaWRcbik6IFBvc3NpYmxlVGlsZUdyaWQgfCB0eXBlb2YgQ09MTEFQU0VfRkFJTFVSRSB7XG4gIGNvbnN0IGludGVyc2VjdGlvbiA9IGdldFRpbGUoY2VsbCwgZ3JpZCkucG9zc2liaWxpdGllcy5pbnRlcnNlY3QodGlsZXMpO1xuICBpZiAoaW50ZXJzZWN0aW9uLnNpemUgPD0gMCkge1xuICAgIHJldHVybiBDT0xMQVBTRV9GQUlMVVJFO1xuICB9XG4gIHJldHVybiBncmlkLnNldChoYXNoQ29vcmRpbmF0ZXMoY2VsbCksIHtcbiAgICBjb29yZGluYXRlczogY2VsbCxcbiAgICBwb3NzaWJpbGl0aWVzOiBpbnRlcnNlY3Rpb24sXG4gIH0pO1xufVxuXG5mdW5jdGlvbiBhZGRDZWxsQ29vcmRpbmF0ZXMoXG4gIGJhc2U6IENlbGxDb29yZGluYXRlcyxcbiAgb2Zmc2V0OiBDZWxsQ29vcmRpbmF0ZXNcbik6IENlbGxDb29yZGluYXRlcyB7XG4gIHJldHVybiB7IHg6IGJhc2UueCArIG9mZnNldC54LCB5OiBiYXNlLnkgKyBvZmZzZXQueSB9O1xufVxuY29uc3QgZW1wdHlJdGVtID0gU2V0KFtUaWxlTmFtZS5FbXB0eV0pO1xuZnVuY3Rpb24gZ2V0VGlsZShcbiAgY2VsbDogQ2VsbENvb3JkaW5hdGVzLFxuICBncmlkOiBQb3NzaWJsZVRpbGVHcmlkLFxuICB3aWR0aDogbnVtYmVyID0gT3B0aW9ucy5udW1iZXJPZkNvbHVtbnMoKSxcbiAgaGVpZ2h0OiBudW1iZXIgPSBPcHRpb25zLm51bWJlck9mUm93cygpXG4pOiBjZWxsUG9zc2liaWxpdHlEZXRhaWxzIHtcbiAgaWYgKGNlbGwueCA8IDAgfHwgY2VsbC54ID49IHdpZHRoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGNvb3JkaW5hdGVzOiBjZWxsLFxuICAgICAgcG9zc2liaWxpdGllczogZW1wdHlJdGVtLFxuICAgIH07XG4gIH0gZWxzZSBpZiAoY2VsbC55IDwgMCB8fCBjZWxsLnkgPj0gaGVpZ2h0KSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGNvb3JkaW5hdGVzOiBjZWxsLFxuICAgICAgcG9zc2liaWxpdGllczogZW1wdHlJdGVtLFxuICAgIH07XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIGdyaWQuZ2V0KGhhc2hDb29yZGluYXRlcyhjZWxsKSwge1xuICAgICAgY29vcmRpbmF0ZXM6IGNlbGwsXG4gICAgICBwb3NzaWJpbGl0aWVzOiBlbXB0eUl0ZW0sXG4gICAgfSk7XG4gIH1cbn1cbiIsImltcG9ydCB7IFBvc3NpYmxlVGlsZUdyaWQgfSBmcm9tIFwiLi9jb2xsYXBzZVwiO1xuaW1wb3J0IHsgQ09MTEFQU0VfRkFJTFVSRSwgZ2V0VGlsZUdyaWQsIE5PX0NFTExfVE9fQ09MTEFQU0UgfSBmcm9tIFwiLi9nZXRQb3NzaWJsZVRpbGVHcmlkXCI7XG5pbXBvcnQgeyBibG9ja05hbWVDb29yZGluYXRlcyB9IGZyb20gXCIuL1RpbGVOYW1lXCI7XG5pbXBvcnQgVGlsZU1hcEltYWdlIGZyb20gXCIuL3RpbGVzLnBuZ1wiO1xuXG5jb25zdCBjYW52YXNDb250YWluZXI6IEhUTUxFbGVtZW50IHwgbnVsbCA9XG4gIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuY2FudmFzLWNvbnRhaW5lclwiKTtcblxuaWYgKGNhbnZhc0NvbnRhaW5lciA9PT0gbnVsbCkge1xuICB0aHJvdyBuZXcgRXJyb3IoXCJkb2N1bWVudCBtaXNzaW5nIGNhbnZhcyBjb250YWluZXJcIik7XG59XG5jb25zdCBjYW52YXM6IEhUTUxDYW52YXNFbGVtZW50IHwgbnVsbCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXG4gIFwiLmNhbnZhcy1jb250YWluZXIgY2FudmFzXCJcbik7XG5pZiAoY2FudmFzID09PSBudWxsKSB7XG4gIHRocm93IG5ldyBFcnJvcihcImRvY3VtZW50IG1pc3NpbmcgY2FudmFzXCIpO1xufVxuY29uc3QgY3R4ID0gY2FudmFzLmdldENvbnRleHQoXCIyZFwiKTtcbmlmIChjdHggPT09IG51bGwpIHtcbiAgdGhyb3cgbmV3IEVycm9yKFwiY2FudmFzIG1pc3NpbmcgMmQgY29udGV4dFwiKTtcbn1cblxuY29uc3QgY29sb3JzID0ge1xuICBibGFjazogXCIjMjkyZTFlXCIsXG4gIGRhcmtCbGFjazogXCIjMGUwZjBhXCIsXG4gIHdoaXRlOiBcIiNmN2ZmZjdcIixcbiAgYmx1ZTogXCIjN2JkZmYyXCIsXG4gIGdyZWVuOiBcIiM5Y2RlOWZcIixcbiAgdGVhbDogXCIjNDhhOWE2XCIsXG4gIG9yYW5nZTogXCIjZmY4ODExXCIsXG4gIHJlZDogXCIjZWQyNTRlXCIsXG59O1xuZXhwb3J0IGNvbnN0IE9wdGlvbnMgPSB7XG4gIG51bWJlck9mQ29sdW1uczogKCkgPT4gMTAsXG4gIG51bWJlck9mUm93czogKCkgPT5cbiAgICBNYXRoLmZsb29yKGNhbnZhc0NvbnRhaW5lci5vZmZzZXRIZWlnaHQgLyBPcHRpb25zLmNlbGxTaXplKCkpLFxuICBnYW1lU2l6ZUZhY3RvcjogKCkgPT4gMC45LFxuICBjZWxsU2l6ZTogKCkgPT5cbiAgICBNYXRoLmZsb29yKFxuICAgICAgKGNhbnZhc0NvbnRhaW5lci5vZmZzZXRXaWR0aCAqIE9wdGlvbnMuZ2FtZVNpemVGYWN0b3IoKSkgL1xuICAgICAgICBPcHRpb25zLm51bWJlck9mQ29sdW1ucygpXG4gICAgKSxcbn07XG5jb25zdCB1cGRhdGVTaXplID0gKCkgPT4ge1xuICBjYW52YXMud2lkdGggPSBPcHRpb25zLmNlbGxTaXplKCkgKiBPcHRpb25zLm51bWJlck9mQ29sdW1ucygpO1xuICBjYW52YXMuaGVpZ2h0ID0gT3B0aW9ucy5jZWxsU2l6ZSgpICogT3B0aW9ucy5udW1iZXJPZlJvd3MoKTtcbn07XG5cbmNvbnN0IHRpbGVNYXAgPSBuZXcgSW1hZ2UoKTtcblxud2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJsb2FkXCIsICgpID0+IHtcbiAgdGlsZU1hcC5zcmMgPSBUaWxlTWFwSW1hZ2U7IC8vIFNldCBzb3VyY2UgcGF0aFxuICB0aWxlTWFwLmFkZEV2ZW50TGlzdGVuZXIoXCJsb2FkXCIsIHJlbmRlckxvb3AsIGZhbHNlKTtcbiAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJyZXNpemVcIiwgdXBkYXRlU2l6ZSk7XG4gIHVwZGF0ZVNpemUoKTtcbn0pO1xuaW50ZXJmYWNlIENvb3JkaW5hdGVzIHtcbiAgeDogbnVtYmVyO1xuICB5OiBudW1iZXI7XG59XG5leHBvcnQgdHlwZSBDZWxsQ29vcmRpbmF0ZXMgPSBDb29yZGluYXRlcztcbmV4cG9ydCB0eXBlIFRpbGVDb29yZGluYXRlcyA9IENvb3JkaW5hdGVzO1xuXG5jb25zdCBwcmltZUIgPSA0OTE1N1xuY29uc3QgcHJpbWVBID0gOTgzMTc7XG5leHBvcnQgdHlwZSBjb29yZGluYXRlc0hhc2ggPSBudW1iZXJcbmV4cG9ydCBjb25zdCBoYXNoQ29vcmRpbmF0ZXMgPSAoY29vcmRzOkNvb3JkaW5hdGVzKTogY29vcmRpbmF0ZXNIYXNoID0+IGNvb3Jkcy54ICogcHJpbWVBICsgY29vcmRzLnkgKiBwcmltZUJcblxuY29uc3QgcmVuZGVyTG9vcCA9ICgpID0+IHtcbiAgY3R4LmNsZWFyUmVjdCgwLCAwLCBjYW52YXMud2lkdGgsIGNhbnZhcy5oZWlnaHQpO1xuICBjb25zdCBncmlkID0gZ2V0VGlsZUdyaWQoKTtcbiAgZm9yIChjb25zdCBbY2VsbENvb3JkcywgdGlsZV0gb2YgZ3JpZC52YWx1ZXMoKSkge1xuICAgIGNvbnN0IHRpbGVDb29yZHMgPSBibG9ja05hbWVDb29yZGluYXRlcy5nZXQ8bnVsbD4odGlsZSwgbnVsbCk7XG4gICAgaWYgKHRpbGVDb29yZHMgIT09IG51bGwpIHtcbiAgICAgIGRyYXdUaWxlKHRpbGVDb29yZHMsIGNlbGxDb29yZHMpO1xuICAgIH1cbiAgfVxuICB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lKHJlbmRlckxvb3ApO1xufTtcblxuY29uc3QgdGlsZU1hcFByb3BlcnRpZXMgPSB7XG4gIHdpZHRoOiAoKSA9PiB0aWxlTWFwLm5hdHVyYWxXaWR0aCxcbiAgaGVpZ2h0OiAoKSA9PiB0aWxlTWFwLm5hdHVyYWxXaWR0aCxcbiAgdGlsZVdpZHRoOiAoKSA9PiAxNixcbiAgdGlsZUhlaWdodDogKCkgPT4gMTYsXG4gIHJvd3M6ICgpID0+IHRpbGVNYXBQcm9wZXJ0aWVzLndpZHRoKCkgLyB0aWxlTWFwUHJvcGVydGllcy50aWxlV2lkdGgoKSxcbiAgY29sdW1uczogKCkgPT4gdGlsZU1hcFByb3BlcnRpZXMuaGVpZ2h0KCkgLyB0aWxlTWFwUHJvcGVydGllcy50aWxlSGVpZ2h0KCksXG59O1xuXG5jb25zdCBkcmF3VGlsZSA9ICh0aWxlOiBUaWxlQ29vcmRpbmF0ZXMsIGNlbGw6IENlbGxDb29yZGluYXRlcykgPT4ge1xuICBjdHguZHJhd0ltYWdlKFxuICAgIHRpbGVNYXAsXG4gICAgdGlsZS54ICogdGlsZU1hcFByb3BlcnRpZXMudGlsZVdpZHRoKCksXG4gICAgdGlsZS55ICogdGlsZU1hcFByb3BlcnRpZXMudGlsZUhlaWdodCgpLFxuICAgIHRpbGVNYXBQcm9wZXJ0aWVzLnRpbGVXaWR0aCgpLFxuICAgIHRpbGVNYXBQcm9wZXJ0aWVzLnRpbGVIZWlnaHQoKSxcbiAgICBjZWxsLnggKiBPcHRpb25zLmNlbGxTaXplKCksXG4gICAgY2VsbC55ICogT3B0aW9ucy5jZWxsU2l6ZSgpLFxuICAgIE9wdGlvbnMuY2VsbFNpemUoKSAtIDIsXG4gICAgT3B0aW9ucy5jZWxsU2l6ZSgpIC0gMlxuICApO1xufTtcbiIsImltcG9ydCB7XG4gIGNlbGxQb3NzaWJpbGl0eURldGFpbHMsXG4gIGNvbGxhcHNlQ2VsbCxcbiAgUG9zc2libGVUaWxlR3JpZCxcbn0gZnJvbSBcIi4vY29sbGFwc2VcIjtcbmltcG9ydCB7IGJsb2NrTmFtZUNvb3JkaW5hdGVzLCBUaWxlTmFtZSB9IGZyb20gXCIuL1RpbGVOYW1lXCI7XG5pbXBvcnQgeyBTZXQsIE1hcCwgU2VxLCBTdGFjayB9IGZyb20gXCJpbW11dGFibGVcIjtcbmltcG9ydCB7XG4gIENlbGxDb29yZGluYXRlcyxcbiAgY29vcmRpbmF0ZXNIYXNoLFxuICBoYXNoQ29vcmRpbmF0ZXMsXG4gIE9wdGlvbnMsXG59IGZyb20gXCIuL2dhbWVcIjtcbmltcG9ydCB7IHNlbGVjdFJhbmRvbUVsZW1lbnRGcm9tQ29sbGVjdGlvbiB9IGZyb20gXCIuL3NlbGVjdFJhbmRvbUVsZW1lbnRGcm9tQ29sbGVjdGlvblwiO1xuXG4vKipcbiAqIGNyZWF0ZXMgYSBzZXQgb2YgY2VsbCBjb29yZGluYXRlcyB3aXRoaW4gYSBnaXZlbiB3aWR0aCBhbmQgaGVpZ2h0XG4gKiBAcGFyYW0gd2lkdGggdGhlIHdpZHRoIG9mIHRoZSBmaWVsZFxuICogQHBhcmFtIGhlaWdodCB0aGUgaGVpZ2h0IG9mIHRoZSBmaWVsZFxuICogQHJldHVybnMgYSBzZXQgb2YgYWxsIG9mIHRoZSBjZWxsIGNvb3JkaW5hdGVzXG4gKi9cbmZ1bmN0aW9uIGdlbmVyYXRlQ2VsbENvb3JkaW5hdGVzKFxuICB3aWR0aDogbnVtYmVyID0gT3B0aW9ucy5udW1iZXJPZkNvbHVtbnMoKSxcbiAgaGVpZ2h0OiBudW1iZXIgPSBPcHRpb25zLm51bWJlck9mUm93cygpXG4pOiBTZXQ8Q2VsbENvb3JkaW5hdGVzPiB7XG4gIHJldHVybiBTZXQ8Q2VsbENvb3JkaW5hdGVzPigpLndpdGhNdXRhdGlvbnMoKGNlbGxzKSA9PiB7XG4gICAgZm9yIChsZXQgeCA9IDA7IHggPCB3aWR0aDsgeCsrKSB7XG4gICAgICBmb3IgKGxldCB5ID0gMDsgeSA8IGhlaWdodDsgeSsrKSB7XG4gICAgICAgIGNlbGxzLmFkZCh7IHgsIHkgfSk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBjZWxscztcbiAgfSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRCYXNpY1RpbGVHcmlkKCk6IFBvc3NpYmxlVGlsZUdyaWQge1xuICBjb25zdCBhbGxUaWxlcyA9IFNldDxUaWxlTmFtZT4oYmxvY2tOYW1lQ29vcmRpbmF0ZXMua2V5U2VxKCkpO1xuICBjb25zdCBhbGxDZWxscyA9IFNldDxDZWxsQ29vcmRpbmF0ZXM+KGdlbmVyYXRlQ2VsbENvb3JkaW5hdGVzKCkpO1xuICBjb25zdCBjZWxsc1dpdGhUaWxlcyA9IGFsbENlbGxzLm1hcChcbiAgICAoY2VsbCk6IFtjb29yZGluYXRlc0hhc2gsIGNlbGxQb3NzaWJpbGl0eURldGFpbHNdID0+IFtcbiAgICAgIGhhc2hDb29yZGluYXRlcyhjZWxsKSxcbiAgICAgIHsgY29vcmRpbmF0ZXM6IGNlbGwsIHBvc3NpYmlsaXRpZXM6IGFsbFRpbGVzIH0sXG4gICAgXVxuICApO1xuICByZXR1cm4gTWFwKGNlbGxzV2l0aFRpbGVzKTtcbn1cblxuZXhwb3J0IGNvbnN0IENPTExBUFNFX0ZBSUxVUkUgPSBcIkNPTExBUFNFX0ZBSUxVUkVcIjtcblxuZXhwb3J0IGNvbnN0IE5PX0NFTExfVE9fQ09MTEFQU0UgPSBcIk5PX0NFTExfVE9fQ09MTEFQU0VcIjtcblxuLyoqXG4gKiBnZXRzIHRoZSBjZWxscyB3aXRoIHRoZSBsb3dlc3QgbnVtYmVyIG9mIG9wdGlvbnMgdG8gcGljayBiZXR3ZWVuXG4gKiBAcGFyYW0gcG9zc2liaWxpdGllcyB0aGUgZnVsbCBncmlkIG9mIGNlbGxzIGFuZCB0aGVpciBwb3NzaWJsZSBzdGF0ZXNcbiAqIEByZXR1cm5zIGEgc3Vic2V0IG9mIHRoYXQgZ3JpZCB0aGF0IGFsbCBzaGFyZSB0aGUgc2FtZSBudW1iZXIgb2YgbG93ZXN0XG4gKiBjZWxscyB0byBjb2xsYXBzZVxuICovXG5mdW5jdGlvbiBsb3dlc3RFbnRyb3B5Q2VsbHMoXG4gIHBvc3NpYmlsaXRpZXM6IFBvc3NpYmxlVGlsZUdyaWRcbik6IFBvc3NpYmxlVGlsZUdyaWQgfCB0eXBlb2YgTk9fQ0VMTF9UT19DT0xMQVBTRSB7XG4gIHR5cGUgY3VycmVudEVudHJvcHkgPSB7IHNpemU6IG51bWJlcjsgY2VsbHM6IFBvc3NpYmxlVGlsZUdyaWQgfSB8IG51bGw7XG4gIGNvbnN0IHJlZHVjZUxvd2VyRW50cm9weSA9IChcbiAgICBwcmV2aW91czogY3VycmVudEVudHJvcHksXG4gICAgb3B0aW9uczogY2VsbFBvc3NpYmlsaXR5RGV0YWlscyxcbiAgICBjb29yZHM6IGNvb3JkaW5hdGVzSGFzaFxuICApOiBjdXJyZW50RW50cm9weSA9PiB7XG4gICAgaWYgKG9wdGlvbnMucG9zc2liaWxpdGllcy5zaXplID09PSAxKSB7XG4gICAgICByZXR1cm4gcHJldmlvdXM7XG4gICAgfSBlbHNlIGlmIChwcmV2aW91cyA9PT0gbnVsbCB8fCBvcHRpb25zLnBvc3NpYmlsaXRpZXMuc2l6ZSA8IHByZXZpb3VzLnNpemUpIHtcbiAgICAgIHJldHVybiB7IHNpemU6IG9wdGlvbnMucG9zc2liaWxpdGllcy5zaXplLCBjZWxsczogTWFwKFtbY29vcmRzLCBvcHRpb25zXV0pIH07XG4gICAgfSBlbHNlIGlmIChvcHRpb25zLnBvc3NpYmlsaXRpZXMuc2l6ZSA9PT0gcHJldmlvdXMuc2l6ZSkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgc2l6ZTogcHJldmlvdXMuc2l6ZSxcbiAgICAgICAgY2VsbHM6IHByZXZpb3VzLmNlbGxzLnNldChjb29yZHMsIG9wdGlvbnMpLFxuICAgICAgfTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHByZXZpb3VzO1xuICAgIH1cbiAgfTtcbiAgY29uc3QgbG93ZXN0RW50cm9weSA9IHBvc3NpYmlsaXRpZXMucmVkdWNlKHJlZHVjZUxvd2VyRW50cm9weSwgbnVsbCk7XG4gIGlmIChsb3dlc3RFbnRyb3B5ID09PSBudWxsKSB7XG4gICAgLy9ub3RoaW5nIG1hdGNoZWQgdG8gYmUgcmVkdWNlZFxuICAgIC8vIHdlIGFyZSBkb25lXG4gICAgcmV0dXJuIE5PX0NFTExfVE9fQ09MTEFQU0U7XG4gIH1cbiAgcmV0dXJuIGxvd2VzdEVudHJvcHkuY2VsbHM7XG59XG5cbi8qKlxuICpcbiAqIEBwYXJhbSBwb3NzaWJpbGl0aWVzIHRoZSBjZWxsIGNvb3JkaW5hdGVzIGFuZCB0aGVpciBwb3NzaWJsZSBjZWxsIHZhbHVlc1xuICogQHJldHVybnMgYSBjZWxsIGNvb3JkaW5hdGUgYW5kIGl0cyBwb3NzaWJsZSB2YWx1ZXNcbiAqL1xuZnVuY3Rpb24gZ2V0Q2VsbFRvQ29sbGFwc2UoXG4gIHBvc3NpYmlsaXRpZXM6IFBvc3NpYmxlVGlsZUdyaWRcbik6IGNlbGxQb3NzaWJpbGl0eURldGFpbHMgfCB0eXBlb2YgTk9fQ0VMTF9UT19DT0xMQVBTRSB7XG4gIGNvbnN0IGNlbGxzID0gbG93ZXN0RW50cm9weUNlbGxzKHBvc3NpYmlsaXRpZXMpO1xuICBpZiAoY2VsbHMgPT09IE5PX0NFTExfVE9fQ09MTEFQU0UpIHtcbiAgICByZXR1cm4gTk9fQ0VMTF9UT19DT0xMQVBTRTtcbiAgfVxuICBjb25zdCBzZWxlY3Rpb24gPSBzZWxlY3RSYW5kb21FbGVtZW50RnJvbUNvbGxlY3Rpb24oY2VsbHMpWzBdO1xuICBpZiAoc2VsZWN0aW9uID09PSB1bmRlZmluZWQpIHtcbiAgICBjb25zb2xlLmVycm9yKFwib2RkIGJlaGF2aW9yXCIpO1xuICAgIHJldHVybiBOT19DRUxMX1RPX0NPTExBUFNFO1xuICB9XG4gIGNvbnN0IFtfaGFzaCwgZGV0YWlsc10gPSBzZWxlY3Rpb25cbiAgcmV0dXJuIGRldGFpbHM7XG59XG5cbi8qIFxuXG5yZWR1Y3Rpb24gZnVuY3Rpb24gcGFydCBcblxuOmhlYWQgLT4gc3RhcnQgXG5waWNrIGNlbGwgdG8gcmVkdWNlXG5cbjogZm9yIGVhY2ggb2YgaXRzIHBvc3NpYmxlIHRpbGVzIFxudHJ5IGNvbGxhcHNlXG5pZiBjb2xsYXBzZSBcbiAgICByZXMgPSBjYWxsIGhlYWRcbiAgICBpZiByZXMgIT0gZmFpbHVyZVxuICAgICAgcmV0dXJuIHJlcyBcbjogZW5kIGZvciBcblxucmV0dXJuIGZhaWx1cmVcbiovXG5cbnR5cGUgVGlsZUdyaWQgPSBTZXQ8W0NlbGxDb29yZGluYXRlcywgVGlsZU5hbWVdPjtcblxuLyoqXG4gKiB0ZXN0cyB3ZXRoZXIgYSBncmlkIGlzIGZ1bGx5IGNvbGxhcHNlZCwgaWYgbm90IGl0IHdpbGwgcmV0dXJuIGNvbGxhcHNlXG4gKiBmYWlsdXJlLlxuICogQHBhcmFtIGdyaWQgcG9zc2libGUgdGlsZSBncmlkIHRoYXQgbWlnaHQgYmUgZnVsbHkgY29sbGFwc2VkXG4gKiBAcmV0dXJucyB0aGUgc2luZ2xlIHRpbGUgZ3JpZCByZXByZXNlbnRlZCBieSBhIGNvbGxhcHNlZCBncmlkIG9yIGNvbGxhcHNlXG4gKiBmYWlsdXJlXG4gKi9cbmZ1bmN0aW9uIGNvbGxhcHNlZEdyaWQoXG4gIGdyaWQ6IFBvc3NpYmxlVGlsZUdyaWRcbik6IFRpbGVHcmlkIHwgdHlwZW9mIENPTExBUFNFX0ZBSUxVUkUge1xuICBjb25zdCBvdXRwdXQgPSBTZXQ8W0NlbGxDb29yZGluYXRlcywgVGlsZU5hbWVdPigpLmFzTXV0YWJsZSgpO1xuICBmb3IgKGNvbnN0IFtfY2VsbCwge2Nvb3JkaW5hdGVzLHBvc3NpYmlsaXRpZXM6dGlsZXN9XSBvZiBncmlkLmVudHJpZXMoKSkge1xuICAgIGNvbnN0IHRpbGUgPSB0aWxlcy5maXJzdCgpO1xuICAgIGlmICh0aWxlID09PSB1bmRlZmluZWQgfHwgdGlsZXMuc2l6ZSA+IDEpIHtcbiAgICAgIHJldHVybiBDT0xMQVBTRV9GQUlMVVJFO1xuICAgIH1cbiAgICBvdXRwdXQuYWRkKFtjb29yZGluYXRlcywgdGlsZV0pO1xuICB9XG5cbiAgcmV0dXJuIG91dHB1dC5hc0ltbXV0YWJsZSgpO1xufVxuXG50eXBlIHN0YWNrRW50cnk8VCA9IGFueT4gPSB7XG4gIHN0YXRlOiBUO1xuICByZXR1cm46IChzdGF0ZTogVCkgPT4gdm9pZDtcbn07XG5cbmNvbnN0IGNhbGxTdGFjazogc3RhY2tFbnRyeTxjb2xsYXBzZUF0dGVtcHREZXRhaWxzIHwgUG9zc2libGVUaWxlR3JpZD5bXSA9IFtdO1xuXG50eXBlIGNvbGxhcHNlQXR0ZW1wdERldGFpbHMgPSB7XG4gIGdyaWQ6IFBvc3NpYmxlVGlsZUdyaWQ7XG4gIHBvc3NpYmxlVGlsZXM6IFNldDxUaWxlTmFtZT47XG4gIGNvb3JkaW5hdGU6IENlbGxDb29yZGluYXRlcztcbn07XG5cbmZ1bmN0aW9uIHJ1bkNvbGxhcHNlQXR0ZW1wdCh7XG4gIGdyaWQsXG4gIHBvc3NpYmxlVGlsZXMsXG4gIGNvb3JkaW5hdGUsXG59OiBjb2xsYXBzZUF0dGVtcHREZXRhaWxzKSB7XG4gIGNvbnN0IFtzZWxlY3RlZFRpbGUsIHJlbWFpbmluZ10gPVxuICAgIHNlbGVjdFJhbmRvbUVsZW1lbnRGcm9tQ29sbGVjdGlvbihwb3NzaWJsZVRpbGVzKTtcbiAgaWYgKHNlbGVjdGVkVGlsZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgcmV0dXJuOyAvLyBubyBtb3JlIGNlbGxzIHRvIHRyeSB0aGlzIGhhcyBiZWVuIGEgYmFkIHBpY2tcbiAgfVxuICBjb25zdCBncmlkQXR0ZW1wdCA9IGNvbGxhcHNlQ2VsbChzZWxlY3RlZFRpbGUsIGNvb3JkaW5hdGUsIGdyaWQpO1xuICBjb25zdCBwdXNoTmV4dEl0ZXJhdGlvbiA9ICgpID0+IHtcbiAgICBjb25zdCBuZXh0SXRlcmF0aW9uOiBzdGFja0VudHJ5PGNvbGxhcHNlQXR0ZW1wdERldGFpbHM+ID0ge1xuICAgICAgcmV0dXJuOiBydW5Db2xsYXBzZUF0dGVtcHQsXG4gICAgICBzdGF0ZToge1xuICAgICAgICBwb3NzaWJsZVRpbGVzOiByZW1haW5pbmcsXG4gICAgICAgIGdyaWQsXG4gICAgICAgIGNvb3JkaW5hdGUsXG4gICAgICB9LFxuICAgIH07XG4gICAgY2FsbFN0YWNrLnB1c2gobmV4dEl0ZXJhdGlvbik7XG4gIH07XG4gIGlmIChncmlkQXR0ZW1wdCA9PT0gQ09MTEFQU0VfRkFJTFVSRSkge1xuICAgIC8vIHRyeSBuZXh0IG9wdGlvblxuICAgIHB1c2hOZXh0SXRlcmF0aW9uKCk7XG4gICAgcmV0dXJuO1xuICB9XG4gIGNvbnN0IGZpbmFsR3JpZCA9IGNvbGxhcHNlZEdyaWQoZ3JpZEF0dGVtcHQpO1xuICBpZiAoZmluYWxHcmlkID09PSBDT0xMQVBTRV9GQUlMVVJFKSB7XG4gICAgLy8gbm90IGZpbmFsIHRyeSBjb2xsYXBzZSBhbm90aGVyIGNlbGxcbiAgICBwdXNoTmV4dEl0ZXJhdGlvbigpO1xuICAgIGNvbnN0IG5leHRDZWxsOiBzdGFja0VudHJ5PFBvc3NpYmxlVGlsZUdyaWQ+ID0ge1xuICAgICAgc3RhdGU6IGdyaWRBdHRlbXB0LFxuICAgICAgcmV0dXJuOiBwaWNrQ2VsbCxcbiAgICB9O1xuICAgIGNhbGxTdGFjay5wdXNoKG5leHRDZWxsKTtcbiAgfSBlbHNlIHtcbiAgICAvL2ZpbmFsIHdlIGFyZSBkb25lXG4gICAgZG9uZUxvb3AoZ3JpZCk7XG4gICAgY29uc29sZS5sb2coXCJkb25lISFcIik7XG4gIH1cbn1cblxuZnVuY3Rpb24gZG9uZUxvb3AoZ3JpZDogUG9zc2libGVUaWxlR3JpZCkge1xuICBjb25zdCBlbnRyeTogc3RhY2tFbnRyeTxQb3NzaWJsZVRpbGVHcmlkPiA9IHtcbiAgICByZXR1cm46IGRvbmVMb29wLFxuICAgIHN0YXRlOiBncmlkLFxuICB9O1xuICBjYWxsU3RhY2sucHVzaChlbnRyeSk7XG4gIHJldHVybjtcbn1cblxuZnVuY3Rpb24gcGlja0NlbGwoZ3JpZDogUG9zc2libGVUaWxlR3JpZCkge1xuICBjb25zdCBzZWxlY3RlZCA9IGdldENlbGxUb0NvbGxhcHNlKGdyaWQpO1xuICBpZiAoc2VsZWN0ZWQgPT09IE5PX0NFTExfVE9fQ09MTEFQU0UpIHtcbiAgICByZXR1cm47XG4gIH1cbiAgY29uc3Qge2Nvb3JkaW5hdGVzLCBwb3NzaWJpbGl0aWVzfSA9IHNlbGVjdGVkO1xuICBjb25zdCBmaXJzdEl0ZXJhdGlvbjogc3RhY2tFbnRyeTxjb2xsYXBzZUF0dGVtcHREZXRhaWxzPiA9IHtcbiAgICByZXR1cm46IHJ1bkNvbGxhcHNlQXR0ZW1wdCxcbiAgICBzdGF0ZToge1xuICAgICAgcG9zc2libGVUaWxlczogcG9zc2liaWxpdGllcyxcbiAgICAgIGdyaWQsXG4gICAgICBjb29yZGluYXRlOmNvb3JkaW5hdGVzLFxuICAgIH0sXG4gIH07XG4gIGNhbGxTdGFjay5wdXNoKGZpcnN0SXRlcmF0aW9uKTtcbiAgcmV0dXJuO1xufVxuXG5mdW5jdGlvbiBjYWxsU3RhY2tMb29wKCkge1xuICBmb3IgKGxldCBpID0gMDsgaSA8IDEwMDsgaSsrKSB7XG4gICAgY29uc3QgdG9wID0gY2FsbFN0YWNrLnBvcCgpO1xuICAgIGlmICh0b3ApIHtcbiAgICAgIHRvcC5yZXR1cm4odG9wLnN0YXRlKTtcbiAgICB9XG4gIH1cbiAgc2V0VGltZW91dChjYWxsU3RhY2tMb29wLCAwKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldFRpbGVHcmlkKCk6IFRpbGVHcmlkIHtcbiAgaWYgKGNhbGxTdGFjay5sZW5ndGggPT09IDApIHtcbiAgICAvLyBzdGFydCBwcm9jZXNzXG4gICAgY29uc3Qgc3RhcnRpbmdHcmlkID0gZ2V0QmFzaWNUaWxlR3JpZCgpO1xuICAgIHBpY2tDZWxsKHN0YXJ0aW5nR3JpZCk7XG4gICAgY2FsbFN0YWNrTG9vcCgpO1xuICAgIHJldHVybiBnZXRSYW5kb21UaWxlR3JpZChzdGFydGluZ0dyaWQpO1xuICB9XG4gIGNvbnN0IHRvcCA9IGNhbGxTdGFja1tjYWxsU3RhY2subGVuZ3RoIC0gMV0uc3RhdGU7XG4gIGlmIChNYXAuaXNNYXAodG9wKSkge1xuICAgIHJldHVybiBnZXRSYW5kb21UaWxlR3JpZCh0b3ApO1xuICB9XG4gIHJldHVybiBnZXRSYW5kb21UaWxlR3JpZCh0b3AuZ3JpZCk7XG59XG5cbmZ1bmN0aW9uIGdldFJhbmRvbVRpbGVHcmlkKHBvc3M6IFBvc3NpYmxlVGlsZUdyaWQpOiBUaWxlR3JpZCB7XG4gIHJldHVybiBTZXQ8W0NlbGxDb29yZGluYXRlcywgVGlsZU5hbWVdPigpLndpdGhNdXRhdGlvbnMoKG11dGFibGUpID0+IHtcbiAgICBjb25zb2xlLmxvZyhgbWFwU2l6ZSAke3Bvc3Muc2l6ZX1gKTtcbiAgICBmb3IgKGNvbnN0IFtfY2VsbCwge3Bvc3NpYmlsaXRpZXMsIGNvb3JkaW5hdGVzfV0gb2YgcG9zcy5lbnRyaWVzKCkpIHtcbiAgICAgIGNvbnN0IFtvcHRpb25dID0gc2VsZWN0UmFuZG9tRWxlbWVudEZyb21Db2xsZWN0aW9uKHBvc3NpYmlsaXRpZXMpO1xuICAgICAgaWYgKG9wdGlvbikge1xuICAgICAgICBtdXRhYmxlLmFkZChbY29vcmRpbmF0ZXMsIG9wdGlvbl0pO1xuICAgICAgfWVsc2V7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoXCJtaXNzaW5nIG9wdGlvbnMgZm9yIHRoaXMgY2VsbFwiKTtcbiAgICAgICAgXG4gICAgICB9XG4gICAgfVxuICB9KTtcbn1cbiIsImltcG9ydCB7IFNldCwgTWFwLCBDb2xsZWN0aW9uIH0gZnJvbSBcImltbXV0YWJsZVwiO1xuXG5jb25zdCByYW5kb21JbmRleCA9IChzaXplOiBudW1iZXIpID0+IE1hdGguZmxvb3Ioc2l6ZSAqIE1hdGgucmFuZG9tKCkpO1xuZXhwb3J0IGZ1bmN0aW9uIHNlbGVjdFJhbmRvbUVsZW1lbnRGcm9tQ29sbGVjdGlvbjxLPihcbiAgc2V0OiBTZXQ8Sz4pOiBbSyB8IHVuZGVmaW5lZCwgU2V0PEs+XTtcbmV4cG9ydCBmdW5jdGlvbiBzZWxlY3RSYW5kb21FbGVtZW50RnJvbUNvbGxlY3Rpb248SywgVj4oXG4gIG1hcDogTWFwPEssIFY+KTogW1tLLCBWXSB8IHVuZGVmaW5lZCwgQ29sbGVjdGlvbjxLLCBWPl07XG5leHBvcnQgZnVuY3Rpb24gc2VsZWN0UmFuZG9tRWxlbWVudEZyb21Db2xsZWN0aW9uPEssIFY+KFxuICBtYXA6IE1hcDxLLCBWPiB8IFNldDxLPik6IFtbSywgVl0gfCB1bmRlZmluZWQsIENvbGxlY3Rpb248SywgVj5dIHwgW0sgfCB1bmRlZmluZWQsIFNldDxLPl0ge1xuICBpZiAoU2V0LmlzU2V0KG1hcCkpIHtcbiAgICBsZXQgaW5kZXggPSByYW5kb21JbmRleChtYXAuY291bnQoKSk7XG4gICAgY29uc3QgZWxlbWVudCA9IG1hcC5maW5kKCgpID0+IHtcbiAgICAgIGluZGV4IC09IDE7XG4gICAgICByZXR1cm4gaW5kZXggPCAwO1xuICAgIH0pO1xuICAgIGlmIChlbGVtZW50ID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHJldHVybiBbdW5kZWZpbmVkLCBtYXBdO1xuICAgIH1cbiAgICByZXR1cm4gW2VsZW1lbnQsIG1hcC5maWx0ZXIoKHZhbCkgPT4gdmFsICE9PSBlbGVtZW50KV07XG4gIH1cbiAgbGV0IGluZGV4ID0gcmFuZG9tSW5kZXgobWFwLmNvdW50KCkpO1xuICBjb25zdCBlbGVtZW50ID0gbWFwLmZpbmRFbnRyeSgoKSA9PiB7XG4gICAgaW5kZXggLT0gMTtcbiAgICByZXR1cm4gaW5kZXggPCAwO1xuICB9KTtcbiAgaWYgKGVsZW1lbnQgPT09IHVuZGVmaW5lZCkge1xuICAgIHJldHVybiBbdW5kZWZpbmVkLCBtYXBdO1xuICB9XG4gIHJldHVybiBbZWxlbWVudCwgbWFwLmZpbHRlcigoXywga2V5KSA9PiBrZXkgIT09IGVsZW1lbnRbMF0pXTtcbn1cbiIsImltcG9ydCB7IE1hcCwgU2V0IH0gZnJvbSBcImltbXV0YWJsZVwiO1xuaW1wb3J0IHsgQ2VsbENvb3JkaW5hdGVzIH0gZnJvbSBcIi4vZ2FtZVwiO1xuaW1wb3J0IHsgVGlsZU5hbWUgfSBmcm9tIFwiLi9UaWxlTmFtZVwiO1xuXG50eXBlIG11c3RDb250YWluQW55ID0gTWFwPENlbGxDb29yZGluYXRlcywgU2V0PFRpbGVOYW1lPj47XG5cblxudHlwZSB0aWxlQWRqYWNlbmN5UnVsZXMgPSBNYXA8VGlsZU5hbWUsIG11c3RDb250YWluQW55PjtcblxuY29uc3QgZGlyZWN0aW9uczogUmVjb3JkPFwidXBcIiB8IFwiZG93blwiIHwgXCJsZWZ0XCIgfCBcInJpZ2h0XCIsIENlbGxDb29yZGluYXRlcz4gPSB7XG4gIHVwOiB7IHg6IDAsIHk6IC0xIH0sXG4gIGRvd246IHsgeDogMCwgeTogMSB9LFxuICBsZWZ0OiB7IHg6IC0xLCB5OiAwIH0sXG4gIHJpZ2h0OiB7IHg6IDEsIHk6IDAgfSxcbn07XG5cbmZ1bmN0aW9uIHVwZGF0ZURpcmVjdGlvblRvSW5jbHVkZShcbiAgYmFzZTogVGlsZU5hbWUsXG4gIG9mZnNldDogQ2VsbENvb3JkaW5hdGVzLFxuICBhZGphY2VudDogVGlsZU5hbWUsXG4gIHJ1bGVzOiB0aWxlQWRqYWNlbmN5UnVsZXNcbik6IHRpbGVBZGphY2VuY3lSdWxlcyB7XG4gIGNvbnN0IGV4aXN0aW5nUnVsZXMgPSBydWxlcy5nZXQoYmFzZSkgfHwgTWFwKCk7XG4gIGNvbnN0IGV4aXN0aW5nVGlsZXMgPSBleGlzdGluZ1J1bGVzLmdldChvZmZzZXQpIHx8IFNldCgpO1xuICByZXR1cm4gcnVsZXMuc2V0KFxuICAgIGJhc2UsXG4gICAgZXhpc3RpbmdSdWxlcy5zZXQob2Zmc2V0LCBleGlzdGluZ1RpbGVzLmFkZChhZGphY2VudCkpXG4gICk7XG59XG50eXBlIHJlbGF0aW9uTXV0YXRvciA9IChpbnB1dDogdGlsZUFkamFjZW5jeVJ1bGVzKSA9PiB0aWxlQWRqYWNlbmN5UnVsZXM7XG5jb25zdCB2ZXJ0aWNhbCA9XG4gICh0b3A6IFRpbGVOYW1lLCBib3R0b206IFRpbGVOYW1lKTogcmVsYXRpb25NdXRhdG9yID0+XG4gIChydWxlcykgPT4ge1xuICAgIGNvbnN0IHRvcFVwZGF0ZWQgPSB1cGRhdGVEaXJlY3Rpb25Ub0luY2x1ZGUoXG4gICAgICB0b3AsXG4gICAgICBkaXJlY3Rpb25zLmRvd24sXG4gICAgICBib3R0b20sXG4gICAgICBydWxlc1xuICAgICk7XG4gICAgcmV0dXJuIHVwZGF0ZURpcmVjdGlvblRvSW5jbHVkZShib3R0b20sIGRpcmVjdGlvbnMudXAsIHRvcCwgdG9wVXBkYXRlZCk7XG4gIH07XG5cbmNvbnN0IGhvcml6b250YWwgPVxuICAobGVmdDogVGlsZU5hbWUsIHJpZ2h0OiBUaWxlTmFtZSk6IHJlbGF0aW9uTXV0YXRvciA9PlxuICAocnVsZXMpID0+IHtcbiAgICBjb25zdCBsZWZ0VXBkYXRlZCA9IHVwZGF0ZURpcmVjdGlvblRvSW5jbHVkZShcbiAgICAgIGxlZnQsXG4gICAgICBkaXJlY3Rpb25zLnJpZ2h0LFxuICAgICAgcmlnaHQsXG4gICAgICBydWxlc1xuICAgICk7XG4gICAgcmV0dXJuIHVwZGF0ZURpcmVjdGlvblRvSW5jbHVkZShyaWdodCwgZGlyZWN0aW9ucy5sZWZ0LCBsZWZ0LCBsZWZ0VXBkYXRlZCk7XG4gIH07XG5cbmNvbnN0IGZvdXJTaWRlcyA9XG4gIChcbiAgICBiYXNlOiBUaWxlTmFtZSxcbiAgICB0b3A6IFRpbGVOYW1lLFxuICAgIGJvdHRvbTogVGlsZU5hbWUsXG4gICAgbGVmdDogVGlsZU5hbWUsXG4gICAgcmlnaHQ6IFRpbGVOYW1lXG4gICk6IHJlbGF0aW9uTXV0YXRvciA9PlxuICAocnVsZXMpID0+XG4gICAgYnVpbGRSZWxhdGlvbnMoXG4gICAgICB2ZXJ0aWNhbCh0b3AsIGJhc2UpLFxuICAgICAgdmVydGljYWwoYmFzZSwgYm90dG9tKSxcbiAgICAgIGhvcml6b250YWwobGVmdCwgYmFzZSksXG4gICAgICBob3Jpem9udGFsKGJhc2UsIHJpZ2h0KVxuICAgICk7XG5cbmZ1bmN0aW9uIGJ1aWxkUmVsYXRpb25zKFxuICAuLi5yZWxhdGlvbkJ1aWxkZXJzOiByZWxhdGlvbk11dGF0b3JbXVxuKTogdGlsZUFkamFjZW5jeVJ1bGVzIHtcbiAgY29uc3QgYmFzZTogdGlsZUFkamFjZW5jeVJ1bGVzID0gTWFwKCk7XG4gIHJldHVybiByZWxhdGlvbkJ1aWxkZXJzLnJlZHVjZSgodmFsLCBidWlsZGVyKSA9PiBidWlsZGVyKHZhbCksIGJhc2UpO1xufVxuY29uc3QgZSA9IFRpbGVOYW1lLkVtcHR5O1xuZXhwb3J0IGNvbnN0IHRpbGVSZWxhdGlvbnMgPSBidWlsZFJlbGF0aW9ucyhcbiAgdmVydGljYWwoZSwgZSksXG4gIGhvcml6b250YWwoZSwgZSksXG4gIGZvdXJTaWRlcyhUaWxlTmFtZS5HcmFzc01pZGRsZSwgZSwgZSwgZSwgZSlcbik7XG4iLCIvLyBUaGUgbW9kdWxlIGNhY2hlXG52YXIgX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fID0ge307XG5cbi8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG5mdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuXHR2YXIgY2FjaGVkTW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXTtcblx0aWYgKGNhY2hlZE1vZHVsZSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0cmV0dXJuIGNhY2hlZE1vZHVsZS5leHBvcnRzO1xuXHR9XG5cdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG5cdHZhciBtb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdID0ge1xuXHRcdC8vIG5vIG1vZHVsZS5pZCBuZWVkZWRcblx0XHQvLyBubyBtb2R1bGUubG9hZGVkIG5lZWRlZFxuXHRcdGV4cG9ydHM6IHt9XG5cdH07XG5cblx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG5cdF9fd2VicGFja19tb2R1bGVzX19bbW9kdWxlSWRdKG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG5cdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG5cdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbn1cblxuIiwiLy8gZGVmaW5lIGdldHRlciBmdW5jdGlvbnMgZm9yIGhhcm1vbnkgZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5kID0gKGV4cG9ydHMsIGRlZmluaXRpb24pID0+IHtcblx0Zm9yKHZhciBrZXkgaW4gZGVmaW5pdGlvbikge1xuXHRcdGlmKF9fd2VicGFja19yZXF1aXJlX18ubyhkZWZpbml0aW9uLCBrZXkpICYmICFfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZXhwb3J0cywga2V5KSkge1xuXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIGtleSwgeyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGRlZmluaXRpb25ba2V5XSB9KTtcblx0XHR9XG5cdH1cbn07IiwiX193ZWJwYWNrX3JlcXVpcmVfXy5nID0gKGZ1bmN0aW9uKCkge1xuXHRpZiAodHlwZW9mIGdsb2JhbFRoaXMgPT09ICdvYmplY3QnKSByZXR1cm4gZ2xvYmFsVGhpcztcblx0dHJ5IHtcblx0XHRyZXR1cm4gdGhpcyB8fCBuZXcgRnVuY3Rpb24oJ3JldHVybiB0aGlzJykoKTtcblx0fSBjYXRjaCAoZSkge1xuXHRcdGlmICh0eXBlb2Ygd2luZG93ID09PSAnb2JqZWN0JykgcmV0dXJuIHdpbmRvdztcblx0fVxufSkoKTsiLCJfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSAob2JqLCBwcm9wKSA9PiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwgcHJvcCkpIiwiLy8gZGVmaW5lIF9fZXNNb2R1bGUgb24gZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5yID0gKGV4cG9ydHMpID0+IHtcblx0aWYodHlwZW9mIFN5bWJvbCAhPT0gJ3VuZGVmaW5lZCcgJiYgU3ltYm9sLnRvU3RyaW5nVGFnKSB7XG5cdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFN5bWJvbC50b1N0cmluZ1RhZywgeyB2YWx1ZTogJ01vZHVsZScgfSk7XG5cdH1cblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywgeyB2YWx1ZTogdHJ1ZSB9KTtcbn07IiwidmFyIHNjcmlwdFVybDtcbmlmIChfX3dlYnBhY2tfcmVxdWlyZV9fLmcuaW1wb3J0U2NyaXB0cykgc2NyaXB0VXJsID0gX193ZWJwYWNrX3JlcXVpcmVfXy5nLmxvY2F0aW9uICsgXCJcIjtcbnZhciBkb2N1bWVudCA9IF9fd2VicGFja19yZXF1aXJlX18uZy5kb2N1bWVudDtcbmlmICghc2NyaXB0VXJsICYmIGRvY3VtZW50KSB7XG5cdGlmIChkb2N1bWVudC5jdXJyZW50U2NyaXB0KVxuXHRcdHNjcmlwdFVybCA9IGRvY3VtZW50LmN1cnJlbnRTY3JpcHQuc3JjXG5cdGlmICghc2NyaXB0VXJsKSB7XG5cdFx0dmFyIHNjcmlwdHMgPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZShcInNjcmlwdFwiKTtcblx0XHRpZihzY3JpcHRzLmxlbmd0aCkgc2NyaXB0VXJsID0gc2NyaXB0c1tzY3JpcHRzLmxlbmd0aCAtIDFdLnNyY1xuXHR9XG59XG4vLyBXaGVuIHN1cHBvcnRpbmcgYnJvd3NlcnMgd2hlcmUgYW4gYXV0b21hdGljIHB1YmxpY1BhdGggaXMgbm90IHN1cHBvcnRlZCB5b3UgbXVzdCBzcGVjaWZ5IGFuIG91dHB1dC5wdWJsaWNQYXRoIG1hbnVhbGx5IHZpYSBjb25maWd1cmF0aW9uXG4vLyBvciBwYXNzIGFuIGVtcHR5IHN0cmluZyAoXCJcIikgYW5kIHNldCB0aGUgX193ZWJwYWNrX3B1YmxpY19wYXRoX18gdmFyaWFibGUgZnJvbSB5b3VyIGNvZGUgdG8gdXNlIHlvdXIgb3duIGxvZ2ljLlxuaWYgKCFzY3JpcHRVcmwpIHRocm93IG5ldyBFcnJvcihcIkF1dG9tYXRpYyBwdWJsaWNQYXRoIGlzIG5vdCBzdXBwb3J0ZWQgaW4gdGhpcyBicm93c2VyXCIpO1xuc2NyaXB0VXJsID0gc2NyaXB0VXJsLnJlcGxhY2UoLyMuKiQvLCBcIlwiKS5yZXBsYWNlKC9cXD8uKiQvLCBcIlwiKS5yZXBsYWNlKC9cXC9bXlxcL10rJC8sIFwiL1wiKTtcbl9fd2VicGFja19yZXF1aXJlX18ucCA9IHNjcmlwdFVybDsiLCIiLCIvLyBzdGFydHVwXG4vLyBMb2FkIGVudHJ5IG1vZHVsZSBhbmQgcmV0dXJuIGV4cG9ydHNcbi8vIFRoaXMgZW50cnkgbW9kdWxlIGlzIHJlZmVyZW5jZWQgYnkgb3RoZXIgbW9kdWxlcyBzbyBpdCBjYW4ndCBiZSBpbmxpbmVkXG52YXIgX193ZWJwYWNrX2V4cG9ydHNfXyA9IF9fd2VicGFja19yZXF1aXJlX18oXCIuL3NyYy9nYW1lLnRzXCIpO1xuIiwiIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9