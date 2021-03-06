/**
 * @module proact-streams
 */

/**
 * <p>
 *  Constructs a `ProAct.SizeBufferedStream`. When the buffer is full (has the same size as <i>this</i> size), it is flushed.
 * </p>
 * <p>
 *  `ProAct.SizeBufferedStream` is part of the `proact-streams` module of ProAct.js.
 * </p>
 *
 * @class ProAct.SizeBufferedStream
 * @constructor
 * @extends ProAct.BufferedStream
 * @param {String} queueName
 *      The name of the queue all the updates should be pushed to.
 *      <p>
 *        If this parameter is null/undefined the default queue of
 *        {{#crossLink "ProAct/flow:property"}}{{/crossLink}} is used.
 *      </p>
 *      <p>
 *        If this parameter is not a string it is used as the
 *        <i>source</i>.
 *      </p>
 * @param {ProAct.Actor} source
 *      A default source of the stream, can be null.
 *      <p>
 *        If this is the only one passed argument and it is a number - it becomes the size of the buffer.
 *      </p>
 * @param {Array} transforms
 *      A list of transformation to be used on all incoming chages.
 *      <p>
 *        If the arguments passed are two and this is a number - it becomes the size of the buffer.
 *      </p>
 * @param {Number} size
 *      The size of the buffer.
 * @throws {Error} SizeBufferedStream must contain size, if there is no size passed to it.
 */
function SizeBufferedStream (queueName, source, transforms, size) {
  if (queueName && !P.U.isString(queueName)) {
    size = transforms;
    transforms = source;
    source = queueName;
    queueName = null;
  }
  if (typeof source === 'number') {
    size = source;
    source = null;
  } else if (typeof transforms === 'number') {
    size = transforms;
    transforms = null;
  }
  P.BS.call(this, queueName, source, transforms);

  if (!size) {
    throw new Error('SizeBufferedStream must contain size!');
  }

  this.size = size;
}
ProAct.SizeBufferedStream = P.SBS = SizeBufferedStream;

ProAct.SizeBufferedStream.prototype = P.U.ex(Object.create(P.BS.prototype), {

  /**
   * Reference to the constructor of this object.
   *
   * @property constructor
   * @type ProAct.SizeBufferedStream
   * @final
   * @for ProAct.SizeBufferedStream
   */
  constructor: ProAct.SizeBufferedStream,

  /**
   * <p>
   *  Triggers a new event/value to the stream. If the buffer is full, anything that is listening for events from
   *  this stream will get updated with all the values/events in the buffer.
   * </p>
   * <p>
   *  ProAct.Stream.t is alias of this method.
   * </p>
   *
   * @for ProAct.SizeBufferedStream
   * @instance
   * @method trigger
   * @param {Object} event
   *      The event/value to pass to trigger.
   * @param {Boolean} useTransformations
   *      If the stream should transform the triggered value. By default it is true (if not passed)
   * @return {ProAct.Stream}
   *      <i>this</i>
   */
  trigger: function (event, useTransformations) {
    this.buffer.push(event, useTransformations);

    if (this.size !== null && (this.buffer.length / 2) === this.size) {
      this.flush();
    }
    return this;
  }
});

P.U.ex(P.S.prototype, {

  /**
   * Creates a new {{#crossLink "ProAct.SizeBufferedStream"}}{{/crossLink}} instance having as source <i>this</i>.
   *
   * @for ProAct.Stream
   * @instance
   * @method bufferit
   * @param {Number} size
   *      The size of the buffer of the new ProAct.SizeBufferedStream.
   * @return {ProAct.SizeBufferedStream}
   *      A {{#crossLink "ProAct.SizeBufferedStream"}}{{/crossLink}} instance.
   * @throws {Error} `SizeBufferedStream` must contain size, if there is no size passed to it.
   */
  bufferit: function (size) {
    return new P.SBS(this, this.queueName, size);
  }
});

P.SBS.prototype.t = P.SBS.prototype.trigger;
