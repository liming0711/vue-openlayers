import ol from 'openlayers';

/** Control bar for OL3
 * The control bar is a container for other controls. It can be used to create toolbars.
 * Control bars can be nested and combined with ol.control.Toggle to handle activate/deactivate.
 *
 * @constructor
 * @extends {ol.control.Control}
 * @param {Object=} options Control options.
 * @param {String} options.className class of the control
 * @param {bool} options.group is a group, default false
 * @param {bool} options.toggleOne only one toggle control is active at a time, default false
 * @param {bool} options.autoDeactivate used with subbar to deactivate all control when top level control deactivate, default false
 * @param {Array<_ol_control_>} options.controls a list of control to add to the bar
 */
var bar = function (options = {}) {
  var element = document.createElement('div');
  element.className = 'ol-unselectable ol-control ol-bar';
  if (options.className) {
    element.className += options.className;
  }
  if (options.group) {
    element.className += 'ol-group';
  }

  ol.control.Control.call(this, {
    element: element.get(0),
    target: options.target
  });

  this.set('toggleOne', options.toggleOne);
  this.set('autoDeactivate', options.autoDeactivate);

  this.controls_ = [];
  if (options.controls instanceof Array) {
    for (var i = 0; i < options.controls.length; i++) {
      this.addControl(options.controls[i]);
    }
  }
};
ol.inherits(bar, ol.control.Control);

// /** Set the control visibility
// * @param {boolean} b
// */
// bar.prototype.setVisible = function (val) {
//   if (val) {
//     $(this.element).show();
//   } else {
//     $(this.element).hide();
//   }
// };

// /** Get the control visibility
// * @return {boolean} b
// */
// bar.prototype.getVisible = function () {
//   return ($(this.element).css('display') !== 'none');
// };

/**
 * Set the map instance the control is associated with
 * and add its controls associated to this map.
 * @param {_ol_Map_} map The map instance.
 */
bar.prototype.setMap = function (map) {
  ol.control.Control.prototype.setMap.call(this, map);

  for (var i = 0; i < this.controls_.length; i++) {
    this.controls_[i].setMap(map);
  }
};

/** Get controls in the panel
 * @param {Array<_ol_control_>}
 */
bar.prototype.getControls = function () {
  return this.controls_;
};

// /** Set tool bar position
// * @param {top|left|bottom|right} pos
// */
// bar.prototype.setPosition = function (pos) {
//   $(this.element).removeClass('ol-left ol-top ol-bottom ol-right');
//   pos = pos.split('-');
//   for (var i = 0; i < pos.length; i++) {
//     switch (pos[i]) {
//       case 'top':
//       case 'left':
//       case 'bottom':
//       case 'right':
//         $(this.element).addClass('ol-' + pos[i]);
//         break;
//       default: break;
//     }
//   }
// };

/** Add a control to the bar
* @param {_ol_control_} c control to add
*/
bar.prototype.addControl = function (c) {
  this.controls_.push(c);
  c.setTarget(this.element);
  if (this.getMap()) {
    this.getMap().addControl(c);
  }
  // Activate and toogleOne
  c.on('change:active', this.onActivateControl_, this);
  if (c.getActive && c.getActive()) {
    c.dispatchEvent({ type: 'change:active', key: 'active', oldValue: false, active: true });
  }
};

/** Deativate all controls in a bar
* @param {_ol_control_} except a control
*/
bar.prototype.deactivateControls = function (except) {
  for (var i = 0; i < this.controls_.length; i++) {
    if (this.controls_[i] !== except && this.controls_[i].setActive) {
      this.controls_[i].setActive(false);
    }
  }
};

bar.prototype.getActiveControls = function () {
  var active = [];
  for (var i = 0; i < this.controls_.length; i++) {
    if (this.controls_[i].getActive && this.controls_[i].getActive()) {
      active.push(this.controls_[i]);
    }
  }
  return active;
};

/** Auto activate/deactivate controls in the bar
* @param {boolean} b activate/deactivate
*/
bar.prototype.setActive = function (b) {
  if (!b && this.get('autoDeactivate')) {
    this.deactivateControls();
  }
  if (b) {
    var ctrls = this.getControls();
    for (var i = 0; i < ctrls.length; i++) {
      if (ctrls[i].get('autoActivate')) ctrls[i].setActive(true);
    }
  }
};

/** Post-process an activated/deactivated control
* @param {ol.event} e :an object with a target {_ol_control_} and active flag {bool}
*/
bar.prototype.onActivateControl_ = function (e) {
  if (this.get('toggleOne')) {
    if (e.active) {
      var n;
      var ctrl = e.target;
      for (n = 0; n < this.controls_.length; n++) {
        if (this.controls_[n] === ctrl) { break; }
      }
      // Not here!
      if (n === this.controls_.length) { return; }
      this.deactivateControls(this.controls_[n]);
    } else {
      // No one active > test auto activate
      if (!this.getActiveControls().length) {
        for (var i = 0; i < this.controls_.length; i++) {
          if (this.controls_[i].get('autoActivate')) {
            this.controls_[i].setActive();
            break;
          }
        }
      }
    }
  }
};

export default bar;
