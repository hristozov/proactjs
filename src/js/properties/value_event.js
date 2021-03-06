/**
 * @module proact-properties
 */

/**
 * <p>
 *  Constructs a `ProAct.ValueEvent`. The value event contains information of a value property update.
 * </p>
 *
 * @class ProAct.ValueEvent
 * @extends ProAct.Event
 * @constructor
 * @param {ProAct.Event} source
 *      If there is an event that coused this event - it is the source. Can be null - no source.
 * @param {Object} target
 *      The thing that triggered this event. In most cases this should be instance of a {{#crossLink "ProAct.Property"}}{{/crossLink}}
 */
function ValueEvent (source, target) {
  var type = ProAct.Event.Types.value,
      args = slice.call(arguments, 2);
  ProAct.Event.apply(this, [source, target, type].concat(args));

  this.object = args[0];
  this.oldVal = args[1];
  this.newVal = args[2];
}

ProAct.ValueEvent = P.VE = ValueEvent;

ValueEvent.prototype = P.U.ex(Object.create(ProAct.Event.prototype), {

  /**
   * Reference to the constructor of this object.
   *
   * @property constructor
   * @type ProAct.ValueEvent
   * @final
   * @for ProAct.ValueEvent
   */
  constructor: ValueEvent,

  /**
   * A `ValueEvent` represents change of a property from an old value to a new value.
   * This method returns the old value, that was changed.
   *
   * @for ProAct.ValueEvent
   * @instance
   * @method fromVal
   * @return {Object}
   *      The old value.
   */
  fromVal: function () {
    if (this.object && this.object.__pro__ &&
        this.object.__pro__.properties[this.target].type() === P.P.Types.auto) {
      return this.object.__pro__.properties[this.target].oldVal;
    }

    return this.oldVal;
  },

  /**
   * A `ValueEvent` represents change of a property from an old value to a new value.
   * This method returns the new value.
   *
   * @for ProAct.ValueEvent
   * @instance
   * @method toVal
   * @return {Object}
   *      The new value.
   */
  toVal: function () {
    if (this.object && this.object.__pro__ &&
        this.object.__pro__.properties[this.target].type() === P.P.Types.auto) {
      return this.object.__pro__.properties[this.target].val;
    }

    return this.newVal;
  }
});

