import ol from 'openlayers';
/**
 * The control bar is a container for other controls. It can be used to create toolbars.
 * Control bars can be nested and combined with ol.control.Toggle to handle activate/deactivate.
 *
 * @constructor
 * @extends {ol.control.Control}
 * @param {Object} options Control options.
 * @param {String} options.customClass class of the control
 * @param {Boolean} options.group is a group, default false
 * @param {Boolean} options.toggleOne only one toggle control is active at a time, default false
 * @param {Boolean} options.autoDeactivate used with subbar to deactivate all control when top level control deactivate, default false
 * @param {Array} options.controls a list of control to add to the bar
 */
var Bar = function (options = {}) {
  var element = document.createElement('div');
  element.className = 'ol-unselectable ol-control ol-control-custom-bar';
  if (options.customClass) {
    element.className += ` ${options.customClass}`;
  }
  if (options.group) {
    element.className += ' ol-group';
  }

  ol.control.Control.call(this, {
    element: element,
    target: options.target
  });

  this.set('toggleOne', options.toggleOne);
  this.set('autoDeactivate', options.autoDeactivate);

  this.map = options.map;
  this.controls_ = [];
  if (options.controls instanceof Array) {
    for (var i = 0; i < options.controls.length; i++) {
      this.addControl(options.controls[i]);
    }
  }
};
ol.inherits(Bar, ol.control.Control);

Bar.prototype.setMap = function (map) {
  ol.control.Control.prototype.setMap.call(this, map);

  for (var i = 0; i < this.controls_.length; i++) {
    this.controls_[i].setMap(map);
  }
};

/** Get controls in the panel
 * @param {Array<control>}
 */
Bar.prototype.getControls = function () {
  return this.controls_;
};

// /** Set tool Bar position
// * @param {top|left|bottom|right} pos
// */
// Bar.prototype.setPosition = function (pos) {
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

/** Add a control to the Bar
* @param {control} c control to add
*/
Bar.prototype.addControl = function (ctrl) {
  this.controls_.push(ctrl);
  ctrl.setTarget(this.element);
  if (this.map) {
    this.map.addControl(ctrl);
  }
  // Activate and toogleOne
  ctrl.on('change:active', this.onActivateControl_, this);
  if (ctrl.getActive && ctrl.getActive()) {
    ctrl.dispatchEvent({ type: 'change:active', key: 'active', oldValue: false, active: true });
  }
};

/** Deativate all controls in a Bar
* @param {control} except a control
*/
Bar.prototype.deactivateControls = function (except) {
  for (var i = 0; i < this.controls_.length; i++) {
    if (this.controls_[i] !== except && this.controls_[i].setActive) {
      this.controls_[i].setActive(false);
    }
  }
};

Bar.prototype.getActiveControls = function () {
  var active = [];
  for (var i = 0; i < this.controls_.length; i++) {
    if (this.controls_[i].getActive && this.controls_[i].getActive()) {
      active.push(this.controls_[i]);
    }
  }
  return active;
};

/** Auto activate/deactivate controls in the Bar
* @param {boolean} b activate/deactivate
*/
Bar.prototype.setActive = function (b) {
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
* @param {ol.event} e :an object with a target {control} and active flag {bool}
*/
Bar.prototype.onActivateControl_ = function (e) {
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

export default Bar;
