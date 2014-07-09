/**
 * ProAct.js turns plain JavaScript objects into holders of reactive properties.
 * You can define the dependencies between these objects and properties using the 'vanilla' js syntax.
 * For example if an object should have a property 'x', that depends on its two fields 'a' and 'b', the only thing that's needed
 * is to define a function 'x', that refers to 'this.a' and 'this.b'.
 *
 * So ProAct.js can turn every vanilla JavaScript value to a set of reactive properties, and this generates a dependency graph between them.
 * The data flow in this oriented graph is determined by its edges. So if we should receive data from the outside of this dependency system we'll need
 * a powerful but easy to use tool to turn every user or server generated action into a data event, common to the graph. Enter the Pro.Stream - the functional
 * part of ProAct.js
 *
 * ProAct.js can be used to define bindings, to separate views from models (mv*), for performance optimizations... It is a tool.
 * A powerful tool for creating other, high level tools, or applications.
 */

/**
 * The main namespace that contains all the ProAct classes and methods.
 * Everything should be defined in this namespace. It can be used as P or Pro.
 *
 * @class ProAct
 * @namespace ProAct
 * @license MIT
 * @version 0.4.2
 * @author meddle0x53
 */
var ProAct = Pro = P = {},

    arrayProto = Array.prototype,
    concat = arrayProto.concat,
    every = arrayProto.every,
    filter = arrayProto.filter,
    forEach = arrayProto.forEach,
    indexOf = arrayProto.indexOf,
    join = arrayProto.join,
    lastIndexOf = arrayProto.lastIndexOf,
    map = arrayProto.map,
    pop = arrayProto.pop,
    push = arrayProto.push,
    reduce = arrayProto.reduce,
    reduceRight = arrayProto.reduceRight,
    reverse = arrayProto.reverse,
    shift = arrayProto.shift,
    slice = arrayProto.slice,
    some = arrayProto.some,
    sort = arrayProto.sort,
    splice = arrayProto.splice,
    toLocaleString = arrayProto.toLocaleString,
    toString = arrayProto.toString,
    unshift = arrayProto.unshift,
    pArray, pArrayOps, pArrayProto, pArrayLs,
    rProto,
    dsl, dslOps,
    opStoreAll,
    streamProvider, functionProvider;


/**
 * @property VERSION
 * @type String
 * @static
 */
ProAct.VERSION = '0.4.2';

/**
 * Defines the possible states of the ProAct objects.
 * <ul>
 *  <li>init - Initialized : It is not usable yet, but is market as ProAct object.</li>
 *  <li>ready - Ready for use.</li>
 *  <li>destroyed - Destroyed : An object that is ProAct dependent no more. All the ProAct logic should be cleaned up from it.</li>
 *  <li>error - There was some runtime error while creating or working with the object.</li>
 * </ul>
 *
 * @namespace ProAct.States
 */
ProAct.States = {
  init: 1,
  ready: 2,
  destroyed: 3,
  error: 4
};


/**
 * Contains a set of utility functions to ease working with arrays and objects.
 * Can be reffered by using 'ProAct.U' too.
 *
 * @namespace ProAct.Utils
 */
ProAct.Utils = Pro.U = {

  /**
   * Checks if the passed value is a function or not.
   *
   * @memberof ProAct.Utils
   * @function isFunction
   * @param {Object} value
   * @return {Boolean}
   */
  isFunction: function (value) {
    return typeof(value) === 'function';
  },

  /**
   * Checks if the passed value is a string or not.
   *
   * @memberof ProAct.Utils
   * @function isString
   * @param {Object} value
   * @return {Boolean}
   */
  isString: function (property) {
    return typeof(property) === 'string';
  },
  isObject: function (property) {
    return typeof(property) === 'object';
  },
  isEmptyObject: function (object) {
    var property;
    for (property in object) {
      if (object.hasOwnProperty(property)) {
        return false;
      }
    }
    return true;
  },
  isError: function (property) {
    return property !== null && Pro.U.isObject(property) && property.message && Object.prototype.toString.apply(property) === '[object Error]';
  },
  isArray: function (property) {
    return Pro.U.isObject(property) && Object.prototype.toString.call(property) === '[object Array]';
  },
  isProArray: function (property) {
    return property !== null && Pro.U.isObject(property) && Pro.U.isArray(property._array) && property.length !== undefined;
  },
  isArrayObject: function (property) {
    return Pro.U.isArray(property) || Pro.U.isProArray(property);
  },
  isProObject: function (property) {
    return property && Pro.U.isObject(property) && property.__pro__ !== undefined && Pro.U.isObject(property.__pro__.properties);
  },
  isProVal: function (property) {
    return Pro.U.isProObject(property) && property.__pro__.properties.v !== undefined;
  },
  ex: function(destination, source) {
    var p;
    for (p in source) {
      if (source.hasOwnProperty(p)) {
        destination[p] = source[p];
      }
    }
    return destination;
  },
  bind: function (ctx, func) {
    return function () {
      return func.apply(ctx, arguments);
    };
  },
  contains: function (array, value) {
    array.indexOf(value) !== -1;
  },
  remove: function (array, value) {
    var i = array.indexOf(value);
    if (i > -1) {
      array.splice(i, 1);
    }
  },
  diff: function (array1, array2) {
    var i, e1, e2,
        index = -1,
        l1 = array1.length,
        l2 = array2.length,
        diff = {};

    if (l1 >= l2) {
      for (i = 0; i < l2; i++) {
        e1 = array1[i];
        e2 = array2[i];

        if (e1 !== e2) {
          if (index === -1) {
            index = i;
          }
          diff[index] = diff[index] || {o: [], n: []};
          diff[index].o.push(e1);
          diff[index].n.push(e2);
        } else {
          index = -1;
        }
      }

      if (index === -1) {
        index = i;
      }
      diff[index] = diff[index] || {o: [], n: []};
      for (; i < l1; i++) {
        e1 = array1[i];
        diff[index].o.push(e1);
      }
    } else if (l2 > l1) {
      diff = Pro.U.diff(array2, array1)
      for (i in diff) {
        el1 = diff[i];
        el2 = el1.n;
        el1.n = el1.o;
        el1.o = el2;
      }
    }

    return diff;
  },
  defValProp: function (obj, prop, enumerable, configurable, writable, val) {
    try {
      Object.defineProperty(obj, prop, {
        enumerable: enumerable,
        configurable: configurable,
        writable: writable,
        value: val
      });
    } catch (e) {
      obj[prop] = val;
    }
  }
};

Pro.Configuration = {
  keyprops: true,
  keypropList: ['p']
};

Pro.N = function () {};

Pro.currentCaller = null;
