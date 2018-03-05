import ol from 'openlayers';
import { addClass, removeClass } from '../../utils/dom';

/** A simple toggle control
 * The control can be created with an interaction to control its activation.
 *
 * @constructor
 * @extends {ol.control.Control}
 * @fires change:active, change:disable
 * @param {Object=} options Control options.
 *    className {String} class of the control
 *    title {String} title of the control
 *    html {String} html to insert in the control
 *    interaction {ol.interaction} interaction associated with the control
 *    active {bool} the control is created active, default false
 *    disable {bool} the control is created disabled, default false
 *    bar {ol.control.Bar} a subbar associated with the control (drawn when active if control is nested in a ol.control.Bar)
 *    autoActive {bool} the control will activate when shown in an ol.control.Bar, default false
 *    onToggle {function} callback when control is clicked (or use change:active event)
 */
var controlToggle = function (options = {}) {
  var self = this;

  this.interaction_ = options.interaction;
  if (this.interaction_) {
    this.interaction_.on('change:active', function (e) {
      self.setActive(!e.oldValue);
    });
  }

  if (options.toggleFn) {
    // compat old version
    options.onToggle = options.toggleFn;
  }
  options.handleClick = function () {
    self.toggle();
    if (options.onToggle) {
      options.onToggle.call(self, self.getActive());
    }
  };
  options.className = (options.className || '') + ' ol-toggle';
  ol.control.Button.call(this, options);

  this.set('title', options.title);

  this.set('autoActivate', options.autoActivate);
  if (options.bar) {
    this.subbar_ = options.bar;
    this.subbar_.setTarget(this.element);
    this.subbar_.element.className += ' ol-option-bar';
  }

  this.setActive(options.active);
  // this.setDisable(options.disable);
};
ol.inherits(controlToggle, ol.control.Button);

/**
 * Set the map instance the control is associated with
 * and add interaction attached to it to this map.
 * @param {_ol_Map_} map The map instance.
 */
controlToggle.prototype.setMap = function (map) {
  if (!map && this.getMap()) {
    if (this.interaction_) {
      this.getMap().removeInteraction(this.interaction_);
    }
    if (this.subbar_) {
      this.getMap().removeControl(this.subbar_);
    }
  }

  ol.control.Control.prototype.setMap.call(this, map);

  if (map) {
    if (this.interaction_) {
      map.addInteraction(this.interaction_);
    }
    if (this.subbar_) {
      map.addControl(this.subbar_);
    }
  }
};

/** Get the subbar associated with a control
* @return {ol_control_Bar}
*/
controlToggle.prototype.getSubBar = function () {
  return this.subbar_;
};

// /**
//  * Test if the control is disabled.
//  * @return {bool}.
//  * @api stable
//  */
// controlToggle.prototype.getDisable = function () {
//   return $('button', this.element).prop('disabled');
// };

// /** Disable the control. If disable, the control will be deactivated too.
// * @param {bool} b disable (or enable) the control, default false (enable)
// */
// controlToggle.prototype.setDisable = function (b) {
//   if (this.getDisable() === b) return;
//   $('button', this.element).prop('disabled', b);
//   if (b && this.getActive()) this.setActive(false);

//   this.dispatchEvent({ type: 'change:disable', key: 'disable', oldValue: !b, disable: b });
// };

/**
 * Test if the control is active.
 * @return {bool}.
 * @api stable
 */
controlToggle.prototype.getActive = function () {
  return /ol-active/.test(this.element.className);
};

/** Toggle control state active/deactive
*/
controlToggle.prototype.toggle = function () {
  this.setActive(!this.getActive());
};

/** Change control state
* @param {bool} b activate or deactivate the control, default false
*/
controlToggle.prototype.setActive = function (b) {
  if (this.getActive() === b) return;
  if (b) {
    addClass(this.element, 'ol-active');
  } else {
    removeClass(this.element, 'ol-active');
  }
  if (this.interaction_) {
    this.interaction_.setActive(b);
  }
  if (this.subbar_) this.subbar_.setActive(b);

  this.dispatchEvent({ type: 'change:active', key: 'active', oldValue: !b, active: b });
};

/** Set the control interaction
* @param {_ol_interaction_} i interaction to associate with the control
*/
controlToggle.prototype.setInteraction = function (i) {
  this.interaction_ = i;
};

/** Get the control interaction
* @return {_ol_interaction_} interaction associated with the control
*/
controlToggle.prototype.getInteraction = function () {
  return this.interaction_;
};

export default controlToggle;
