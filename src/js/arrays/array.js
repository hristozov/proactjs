/**
 * Creates a wrapper around a plain JavaScript array that is capable of tracking changes on the array and notifying listeners.
 * <p>
 *  It has a {@link ProAct.ArrayCore} which it uses to observe the array for changes or to update the array on changes.
 * </p>
 * <p>
 *  ProAct.Array is array-like object, it has all the methods defined in the JavaScript Array class, length property and indices.
 * </p>
 * <p>
 *  ProAct.Array is part of the arrays module of ProAct.js.
 * </p>
 *
 * @class ProAct.Array
 * @extends Array
 * @param [...]
 *      I can take an array as a parameter and it becomes reactive wrapper around it.
 *      It can take a list of arguments which become the wrapped array.
 *      If nothing is passed it becomes wrapper arround an empty array.
 * @see {@link ProAct.ArrayCore}
 */
ProAct.Array = P.A = pArray = function () {
  var self = this,
      getLength, setLength, oldLength,
      arr, core;

  // Setup _array:
  if (arguments.length === 0) {
    arr = [];
  } else if (arguments.length === 1 && P.U.isArray(arguments[0])) {
    arr = arguments[0];
  } else {
    arr = slice.call(arguments);
  }

  P.U.defValProp(this, '_array', false, false, true, arr);

  // Setup core:
  core = new P.AC(this);
  P.U.defValProp(this, '__pro__', false, false, false, core);
  P.U.defValProp(this, 'core', false, false, false, core);
  core.prob();
};

P.U.ex(P.A, {

  /**
   * Defines a set of the possible operations over an array.
   *
   * @namespace ProAct.Array.Operations
   */
  Operations: {

    /**
     * Represents setting a value to an index of an array.
     * <pre>
     *  array[3] = 12;
     * </pre>
     *
     * @memberof ProAct.Array.Operations
     * @static
     * @constant
     */
    set: 0,

    /**
     * Represents adding values to array.
     * <pre>
     *  array.push(12);
     *  array.unshift(12);
     * </pre>
     *
     * @memberof ProAct.Array.Operations
     * @static
     * @constant
     */
    add: 1,

    /**
     * Represents removing values from array.
     * <pre>
     *  array.pop();
     *  array.shift();
     * </pre>
     *
     * @memberof ProAct.Array.Operations
     * @static
     * @constant
     */
    remove: 2,

    /**
     * Represents setting the length of an array.
     * <pre>
     *  array.length = 5;
     * </pre>
     *
     * @memberof ProAct.Array.Operations
     * @static
     * @constant
     */
    setLength: 3,

    /**
     * Represents reversing the element order in an array.
     * <pre>
     *  array.reverse();
     * </pre>
     *
     * @memberof ProAct.Array.Operations
     * @static
     * @constant
     */
    reverse: 4,

    /**
     * Represents sorting the elements in an array.
     * <pre>
     *  array.sort();
     * </pre>
     *
     * @memberof ProAct.Array.Operations
     * @static
     * @constant
     */
    sort: 5,

    /**
     * Represents the powerful <i>splice</i> operation.
     * <pre>
     *  array.splice(2, 3, 4, 15, 6);
     * </pre>
     *
     * @memberof ProAct.Array.Operations
     * @static
     * @constant
     */
    splice: 6,
  },

  /**
   * A helper method for filtering an array and notifying the right listeners of the filtered result.
   * <p>
   *  This is used if there is an ProAct.Array created by filtering another ProAct.Array. If the original is
   *  changed, the filtered array should be changed in some cases. So refilter does this - changes the dependent filtered array, using
   *  {@link ProAct.ArrayCore#updateByDiff}.
   * </p>
   *
   * @memberof ProAct.Array
   * @static
   * @param {ProAct.Array} original
   *      The original array to filter by.
   * @param {ProAct.Array} filtered
   *      The array to be filtered - changed by a filter function, applied on the original.
   * @param {Array} filterArgs
   *      Arguments of the filtering - filtering function and data.
   * @see {@link ProAct.ArrayCore#updateByDiff}
   */
  reFilter: function (original, filtered, filterArgs) {
    var oarr = filtered._array;

    filtered._array = filter.apply(original._array, filterArgs);
    filtered.core.updateByDiff(oarr);
  }
});
pArrayOps = pArray.Operations;

ProAct.Array.prototype = pArrayProto = P.U.ex(Object.create(arrayProto), {

  /**
   * Reference to the constructor of this object.
   *
   * @memberof ProAct.Array
   * @instance
   * @constant
   * @default ProAct.Array
   */
  constructor: ProAct.Array,

  /**
   * The <b>concat()</b> method returns a new array comprised of this array joined with other array(s) and/or value(s).
   * <p>
   *  The result ProAct.Array is dependent on <i>this</i>, so if <i>this</i> changes, the concatenation resut will be updated.
   * </p>
   * <p>
   *  If the argument passed is another ProAct.Array the result array is dependent on it too.
   * </p>
   *
   * @memberof ProAct.Array
   * @instance
   * @method concat
   * @param [...]
   *      Arrays and/or values to concatenate to the resulting array.
   * @return {ProAct.Array}
   *      A new ProAct.Array consisting of the elements in the <i>this</i> object on which it is called, followed in order by,
   *      for each argument, the elements of that argument (if the argument is an array) or the argument itself (if the argument is not an array).
   * @see {@link ProAct.Array.Listeners.leftConcat}
   * @see {@link ProAct.Array.Listeners.rightConcat}
   */
  concat: function () {
    var res, rightProArray;

    if (arguments.length === 1 && P.U.isProArray(arguments[0])) {
      rightProArray = arguments[0];
      arguments[0] = rightProArray._array;
    }

    res = new P.A(concat.apply(this._array, arguments));
    if (rightProArray) {
      this.core.on(pArrayLs.leftConcat(res, this, rightProArray));
      rightProArray.core.on(pArrayLs.rightConcat(res, this, rightProArray));
    } else {
      this.core.on(pArrayLs.leftConcat(res, this, slice.call(arguments, 0)));
    }

    return res;
  },

  /**
   * The <b>every()</b> method tests whether all elements in the ProAct.Array pass the test implemented by the provided function.
   * <p>
   *  This method adds the {@link ProAct.currentCaller} as a listener to both 'index' type and 'length' type of changes.
   * </p>
   *
   * @memberof ProAct.Array
   * @instance
   * @method every
   * @param {Function} callback
   *      Function to test for each element.
   * @param {Object} thisArg
   *      Value to use as this when executing <i>callback</i>.
   * @return {Boolean}
   *      True if all the elements in the <i>this</i> ProAct.Array pass the test implemented by the <i>callback</i>, false otherwise.
   * @see {@link ProAct.ArrayCore#addCaller}
   */
  every: function () {
    this.core.addCaller();

    return every.apply(this._array, arguments);
  },

  /**
   * Does the same as the {@link ProAct.Array#every} method, but the result is a {@link ProAct.Val} depending on changes on the array.
   *
   * @memberof ProAct.Array
   * @instance
   * @method pevery
   * @param {Function} fun
   *      Function to test for each element.
   * @param {Object} thisArg
   *      Value to use as this when executing <i>callback</i>.
   * @return {ProAct.Val}
   *      {@link ProAct.Val} with value of true if all the elements in <i>this</i> ProAct.Array pass the test implemented by the <i>fun</i>, false otherwise.
   * @see {@link ProAct.ArrayCore#addCaller}
   * @see {@link ProAct.Val}
   * @see {@link ProAct.Array.Listeners.every}
   */
  pevery: function (fun, thisArg) {
    var val = new P.Val(every.apply(this._array, arguments));

    this.core.on(pArrayLs.every(val, this, arguments));

    return val;
  },

  /**
   * The <b>some()</b> method tests whether some element in the array passes the test implemented by the provided function.
   * <p>
   *  This method adds the {@link ProAct.currentCaller} as a listener to both 'index' type and 'length' type of changes.
   * </p>
   *
   * @memberof ProAct.Array
   * @instance
   * @method some
   * @param {Function} callback
   *      Function to test for each element.
   * @param {Object} thisArg
   *      Value to use as this when executing <i>callback</i>.
   * @return {Boolean}
   *      True if one or more of the elements in <i>this</i> ProAct.Array pass the test implemented by the <i>callback</i>, false otherwise.
   * @see {@link ProAct.ArrayCore#addCaller}
   */
  some: function () {
    this.core.addCaller();

    return some.apply(this._array, arguments);
  },

  /**
   * Does the same as the {@link ProAct.Array#some} method, but the result is a {@link ProAct.Val} depending on changes on the array.
   *
   * @memberof ProAct.Array
   * @instance
   * @method psome
   * @param {Function} fun
   *      Function to test for each element.
   * @param {Object} thisArg
   *      Value to use as this when executing <i>callback</i>.
   * @return {ProAct.Val}
   *      {@link ProAct.Val} with value of true if one or more of the elements in <i>this</i> ProAct.Array pass the test implemented by the <i>fun</i>, false otherwise.
   * @see {@link ProAct.ArrayCore#addCaller}
   * @see {@link ProAct.Val}
   * @see {@link ProAct.Array.Listeners.some}
   */
  psome: function (fun, thisArg) {
    var val = new P.Val(some.apply(this._array, arguments));

    this.core.on(pArrayLs.some(val, this, arguments));

    return val;
  },

  /**
   * The <b>forEach()</b> method executes a provided function once per array element.
   * <p>
   *  This method adds the {@link ProAct.currentCaller} as a listener to both 'index' type and 'length' type of changes.
   * </p>
   *
   * @memberof ProAct.Array
   * @instance
   * @method forEach
   * @param {Function} fun
   *      Function to execute for each element.
   * @param {Object} thisArg
   *      Value to use as <i>this</i> when executing <i>callback</i>.
   * @see {@link ProAct.ArrayCore#addCaller}
   */
  forEach: function (fun /*, thisArg */) {
    this.core.addCaller();

    return forEach.apply(this._array, arguments);
  },

  /**
   * The <b>filter()</b> method creates a new ProAct.Array with all elements that pass the test implemented by the provided function.
   * <p>
   *  The result ProAct.Array is dependent on <i>this</i>, so if <i>this</i> changes, the filtered resut will be updated.
   * </p>
   *
   * @memberof ProAct.Array
   * @instance
   * @method filter
   * @param {Function} fun
   *      Function to test for each element.
   * @param {Object} thisArg
   *      Value to use as this when executing <i>fun</i>.
   * @return {ProAct.Array}
   *      A new ProAct.Array consisting of the elements in <i>this</i> ProAct.Array that pass the test implemented by <i>fun</i>.
   * @see {@link ProAct.Array.Listeners.filter}
   * @see {@link ProAct.Array.reFilter}
   */
  filter: function (fun, thisArg) {
    var filtered = new P.A(filter.apply(this._array, arguments));
    this.core.on(pArrayLs.filter(filtered, this, arguments));

    return filtered;
  },

  /**
   * The <b>map()</b> method creates a new ProAct with the results of calling a provided function on every element in <i>this</i> ProAct.Array.
   * <p>
   *  The result ProAct.Array is dependent on <i>this</i>, so if <i>this</i> changes, the mapped resut will be updated.
   * </p>
   *
   * @memberof ProAct.Array
   * @instance
   * @method map
   * @param {Function} fun
   *      Function that produces an element of the new ProAct.Array, taking three arguments:
   *      <ol>
   *        <li><b>currentValue</b> : The current element being processed in the array.</li>
   *        <li><b>index</b> : The index of the current element being processed in the array.</li>
   *        <li><b>array</b> : The array map was called upon.</li>
   *      </ol>
   * @param {Object} thisArg
   *      Value to use as this when executing <i>fun</i>.
   * @return {ProAct.Array}
   *      A new ProAct.Array consisting of the elements in <i>this</i> ProAct.Array transformed by <i>fun</i>.
   * @see {@link ProAct.Array.Listeners.map}
   */
  map: function (fun, thisArg) {
    var mapped = new P.A(map.apply(this._array, arguments));
    this.core.on(pArrayLs.map(mapped, this, arguments));

    return mapped;
  },

  /**
   * The <b>reduce()</b> method applies a function against an accumulator and each value of the ProAct.Array (from left-to-right) has to reduce it to a single value.
   * <p>
   *  This method adds the {@link ProAct.currentCaller} as a listener to both 'index' type and 'length' type of changes.
   * </p>
   *
   * @memberof ProAct.Array
   * @instance
   * @method reduce
   * @param {Function} fun
   *      Function to execute on each value in the array, taking four arguments:
   *      <ol>
   *        <li><b>previousValue</b> : The value previously returned in the last invocation of the <i>fun</i>, or <i>initialValue</i>, if supplied.</li>
   *        <li><b>currentValue</b> : The current element being processed in the ProAct.Array.</li>
   *        <li><b>index</b> : The index of the current element being processed in the ProAct.Array.</li>
   *        <li><b>array</b> : The array reduce was called upon.</li>
   *      </ol>
   * @param {Object} initialValue
   *      Object to use as the first argument to the first call of the <i>fun</i> .
   * @return {Object}
   *      The value of the last <i>fun</i> invocation.
   * @see {@link ProAct.ArrayCore#addCaller}
   */
  reduce: function (fun /*, initialValue */) {
    this.core.addCaller();

    return reduce.apply(this._array, arguments);
  },

  /**
   * Does the same as the {@link ProAct.Array#reduce} method, but the result is a {@link ProAct.Val} depending on changes on <i>this</i> ProAct.Array.
   *
   * @memberof ProAct.Array
   * @instance
   * @method preduce
   * @param {Function} fun
   *      Function to execute on each value in the array, taking four arguments:
   *      <ol>
   *        <li><b>previousValue</b> : The value previously returned in the last invocation of the <i>fun</i>, or <i>initialValue</i>, if supplied.</li>
   *        <li><b>currentValue</b> : The current element being processed in the ProAct.Array.</li>
   *        <li><b>index</b> : The index of the current element being processed in the ProAct.Array.</li>
   *        <li><b>array</b> : The array reduce was called upon.</li>
   *      </ol>
   * @param {Object} initialValue
   *      Object to use as the first argument to the first call of the <i>fun</i> .
   * @return {ProAct.Val}
   *      {@link ProAct.Val} with value of the last <i>fun</i> invocation.
   * @see {@link ProAct.ArrayCore#addCaller}
   * @see {@link ProAct.Val}
   * @see {@link ProAct.Array.Listeners.reduce}
   */
  preduce: function (fun /*, initialValue */) {
    var val = new P.Val(reduce.apply(this._array, arguments));
    this.core.on(pArrayLs.reduce(val, this, arguments));

    return val;
  },

  /**
   * The <b>reduceRight()</b> method applies a function against an accumulator and each value of the ProAct.Array (from right-to-left) as to reduce it to a single value.
   * <p>
   *  This method adds the {@link ProAct.currentCaller} as a listener to both 'index' type and 'length' type of changes.
   * </p>
   *
   * @memberof ProAct.Array
   * @instance
   * @method reduceRight
   * @param {Function} fun
   *      Function to execute on each value in the array, taking four arguments:
   *      <ol>
   *        <li><b>previousValue</b> : The value previously returned in the last invocation of the <i>fun</i>, or <i>initialValue</i>, if supplied.</li>
   *        <li><b>currentValue</b> : The current element being processed in the ProAct.Array.</li>
   *        <li><b>index</b> : The index of the current element being processed in the ProAct.Array.</li>
   *        <li><b>array</b> : The array reduce was called upon.</li>
   *      </ol>
   * @param {Object} initialValue
   *      Object to use as the first argument to the first call of the <i>fun</i> .
   * @return {Object}
   *      The value of the last <i>fun</i> invocation.
   * @see {@link ProAct.ArrayCore#addCaller}
   */
  reduceRight: function (fun /*, initialValue */) {
    this.core.addCaller();

    return reduceRight.apply(this._array, arguments);
  },

  /**
   * Does the same as the {@link ProAct.Array#reduceRight} method, but the result is a {@link ProAct.Val} depending on changes on <i>this</i> ProAct.Array.
   *
   * @memberof ProAct.Array
   * @instance
   * @method preduceRight
   * @param {Function} fun
   *      Function to execute on each value in the array, taking four arguments:
   *      <ol>
   *        <li><b>previousValue</b> : The value previously returned in the last invocation of the <i>fun</i>, or <i>initialValue</i>, if supplied.</li>
   *        <li><b>currentValue</b> : The current element being processed in the ProAct.Array.</li>
   *        <li><b>index</b> : The index of the current element being processed in the ProAct.Array.</li>
   *        <li><b>array</b> : The array reduce was called upon.</li>
   *      </ol>
   * @param {Object} initialValue
   *      Object to use as the first argument to the first call of the <i>fun</i> .
   * @return {ProAct.Val}
   *      {@link ProAct.Val} with value of the last <i>fun</i> invocation.
   * @see {@link ProAct.ArrayCore#addCaller}
   * @see {@link ProAct.Val}
   * @see {@link ProAct.Array.Listeners.reduceRight}
   */
  preduceRight: function (fun /*, initialValue */) {
    var val = new P.Val(reduceRight.apply(this._array, arguments));
    this.core.on(pArrayLs.reduceRight(val, this, arguments));

    return val;
  },

  /**
   * The <b>indexOf()</b> method returns the first index at which a given element can be found in the ProAct.Array, or -1 if it is not present.
   * <p>
   *  This method adds the {@link ProAct.currentCaller} as a listener to both 'index' type and 'length' type of changes.
   * </p>
   *
   * @memberof ProAct.Array
   * @instance
   * @method indexOf
   * @param {Object} searchElement
   *      Element to locate in the ProAct.Array.
   * @param {Number} fromIndex
   *      Default: 0 (Entire array is searched)
   *      <p>
   *        The index to start the search at.
   *        If the index is greater than or equal to the ProAct.Array's length, -1 is returned,
   *        which means the array will not be searched.
   *        If the provided index value is a negative number,
   *        it is taken as the offset from the end of the ProAct.Array.
   *      </p>
   *      <p>
   *        Note: if the provided index is negative, the ProAct.Array is still searched from front to back.
   *        If the calculated index is less than 0, then the whole ProAct.Array will be searched.
   *      </p>
   * @return {Number}
   *      The index of the searched element or '-1' if it is not found in <i>this</i> ProAct.Array.
   * @see {@link ProAct.ArrayCore#addCaller}
   */
  indexOf: function () {
    this.core.addCaller();

    return indexOf.apply(this._array, arguments);
  },

  /**
   * Does the same as the {@link ProAct.Array#indexOf} method, but the result is a {@link ProAct.Val} depending on changes on <i>this</i> ProAct.Array.
   *
   * @memberof ProAct.Array
   * @instance
   * @method pindexOf
   * @param {Object} searchElement
   *      Element to locate in the ProAct.Array.
   * @param {Number} fromIndex
   *      Default: 0 (Entire array is searched)
   *      <p>
   *        The index to start the search at.
   *        If the index is greater than or equal to the ProAct.Array's length, -1 is returned,
   *        which means the array will not be searched.
   *        If the provided index value is a negative number,
   *        it is taken as the offset from the end of the ProAct.Array.
   *      </p>
   *      <p>
   *        Note: if the provided index is negative, the ProAct.Array is still searched from front to back.
   *        If the calculated index is less than 0, then the whole ProAct.Array will be searched.
   *      </p>
   * @return {ProAct.Val}
   *      A {@link ProAct.Val} instance with value, the index of the searched element or '-1' if it is not found in <i>this</i> ProAct.Array.
   * @see {@link ProAct.ArrayCore#addCaller}
   * @see {@link ProAct.Val}
   * @see {@link ProAct.Array.Listeners.indexOf}
   */
  pindexOf: function () {
    var val = new P.Val(indexOf.apply(this._array, arguments));
    this.core.on(pArrayLs.indexOf(val, this, arguments));

    return val;
  },
  lastIndexOf: function () {
    this.core.addCaller();

    return lastIndexOf.apply(this._array, arguments);
  },
  plastindexOf: function () {
    var val = new P.Val(lastIndexOf.apply(this._array, arguments));
    this.core.on(pArrayLs.lastIndexOf(val, this, arguments));

    return val;
  },
  join: function () {
    this.core.addCaller();

    return join.apply(this._array, arguments);
  },
  pjoin: function (separator) {
    var reduced = this.preduce(function (i, el) {
      return i + separator + el;
    }, ''), res = new P.Val(function () {
      if (!reduced.v) {
        return '';
      }
      return reduced.v.substring(1);
    });
    return res;
  },
  toLocaleString: function () {
    this.core.addCaller();

    return toLocaleString.apply(this._array, arguments);
  },
  toString: function () {
    this.core.addCaller();

    return toString.apply(this._array, arguments);
  },
  valueOf: function () {
    return this.toArray();
  },
  slice: function () {
    var sliced = new P.A(slice.apply(this._array, arguments));
    this.core.on(pArrayLs.slice(sliced, this, arguments));

    return sliced;
  },
  reverse: function () {
    if (this._array.length === 0) {
      return;
    }
    var reversed = reverse.apply(this._array, arguments);

    this.core.update(null, 'index', [pArrayOps.reverse, -1, null, null]);
    return reversed;
  },
  sort: function () {
    if (this._array.length === 0) {
      return;
    }
    var sorted = sort.apply(this._array, arguments),
        args = arguments;

    this.core.update(null, 'index', [pArrayOps.sort, -1, null, args]);
    return sorted;
  },
  splice: function (index, howMany) {
    var oldLn = this._array.length,
        spliced = splice.apply(this._array, arguments),
        ln = this._array.length, delta,
        newItems = slice.call(arguments, 2);

    index = !~index ? ln - index : index
    howMany = (howMany == null ? ln - index : howMany) || 0;

    if (newItems.length > howMany) {
      delta = newItems.length - howMany;
      while (delta--) {
        this.core.defineIndexProp(oldLn++);
      }
    } else if (howMany > newItems.length) {
      delta = howMany - newItems.length;
      while (delta--) {
        delete this[--oldLn];
      }
    }

    this.core.updateSplice(index, spliced, newItems);
    return new P.A(spliced);
  },
  pop: function () {
    if (this._array.length === 0) {
      return;
    }
    var popped = pop.apply(this._array, arguments),
        index = this._array.length;

    delete this[index];
    this.core.update(null, 'length', [pArrayOps.remove, this._array.length, popped, null]);

    return popped;
  },
  push: function () {
    var vals = arguments, i, ln = arguments.length, index;

    for (i = 0; i < ln; i++) {
      index = this._array.length;
      push.call(this._array, arguments[i]);
      this.core.defineIndexProp(index);
    }

    this.core.update(null, 'length', [pArrayOps.add, this._array.length - 1, null, slice.call(vals, 0)]);

    return this._array.length;
  },
  shift: function () {
    if (this._array.length === 0) {
      return;
    }
    var shifted = shift.apply(this._array, arguments),
        index = this._array.length;

    delete this[index];
    this.core.update(null, 'length', [pArrayOps.remove, 0, shifted, null]);

    return shifted;
  },
  unshift: function () {
    var vals = slice.call(arguments, 0), i, ln = arguments.length,
        array = this._array;

    for (var i = 0; i < ln; i++) {
      array.splice(i, 0, arguments[i]);
      this.core.defineIndexProp(array.length - 1);
    }

    this.core.update(null, 'length', [pArrayOps.add, 0, null, vals]);

    return array.length;
  },
  toArray: function () {
    var result = [], i, ar = this._array, ln = ar.length, el,
        isPA = P.U.isProArray;

    for (i = 0; i < ln; i++) {
      el = ar[i];
      if (isPA(el)) {
        el = el.toArray();
      }

      result.push(el);
    }

    return result;
  },
  toJSON: function () {
    return JSON.stringify(this._array);
  }
});
