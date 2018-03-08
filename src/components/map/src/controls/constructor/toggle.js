import ol from 'openlayers';
import Button from './Button';
import { addClass, removeClass } from '../../utils/dom';

/** A simple toggle control
 * The control can be created with an interaction to control its activation.
 * @constructor
 * @extends {ol.control.Control}
 * @fires change:active, change:disable
 * @param {Object} options Control options.
 * @param {String} className class of the control
 * @param {String} title title of the control
 * @param {String} html html to insert in the control
 * @param {ol.interaction} interaction interaction associated with the control
 * @param {Boolean} active the control is created active, default false
 * @param {Boolean} disable the control is created disabled, default false
 * @param {Bar} bar a subbar associated with the control (drawn when active if control is nested in a ol.control.Bar)
 * @param {Boolean} autoActive the control will activate when shown in an ol.control.Bar, default false
 * @param {Function} onToggle callback when control is clicked (or use change:active event)
 */
var Toggle = function (options = {}) {
  var self = this;

  this.interaction_ = options.interaction;
  if (this.interaction_) {
    this.interaction_.on('change:active', function (e) {
      self.setActive(!e.oldValue);
    });
  }

  if (options.toggleFunc) {
    // compat old version
    options.onToggle = options.toggleFunc;
  }
  options.handleClick = function () {
    self.toggle();
    if (options.onToggle) {
      options.onToggle.call(self, self.getActive());
    }
  };
  options.className = (options.customClass || '') + ' ol-control-custom-toggle';
  Button.call(this, options);

  this.set('title', options.title);

  this.set('autoActive', options.autoActive);
  if (options.bar) {
    this.subbar_ = options.bar;
    this.subbar_.setTarget(this.element);
    this.subbar_.element.className += ' ol-control-custom-option-bar';
  }

  this.setActive(options.active);
  // this.setDisable(options.disable);
};
ol.inherits(Toggle, Button);

/**
 * Set the map instance the control is associated with
 * and add interaction attached to it to this map.
 * @param {_ol_Map_} map The map instance.
 */
Toggle.prototype.setMap = function (map) {
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
Toggle.prototype.getSubBar = function () {
  return this.subbar_;
};

// /**
//  * Test if the control is disabled.
//  * @return {bool}.
//  * @api stable
//  */
// Toggle.prototype.getDisable = function () {
//   return $('button', this.element).prop('disabled');
// };

// /** Disable the control. If disable, the control will be deactivated too.
// * @param {bool} b disable (or enable) the control, default false (enable)
// */
// Toggle.prototype.setDisable = function (b) {
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
Toggle.prototype.getActive = function () {
  return /ol-control-custom-active/.test(this.element.className);
};

/** Toggle control state active/deactive
*/
Toggle.prototype.toggle = function () {
  this.setActive(!this.getActive());
};

/** Change control state
* @param {bool} b activate or deactivate the control, default false
*/
Toggle.prototype.setActive = function (b) {
  console.log('------------ active --------------', b);
  if (this.getActive() === b) { return false; }
  if (b) {
    addClass(this.element, 'ol-control-custom-active');
  } else {
    removeClass(this.element, 'ol-control-custom-active');
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
Toggle.prototype.setInteraction = function (i) {
  this.interaction_ = i;
};

/** Get the control interaction
* @return {_ol_interaction_} interaction associated with the control
*/
Toggle.prototype.getInteraction = function () {
  return this.interaction_;
};

export default Toggle;
