import ol from 'openlayers';
/**
 * @constructor
 * @extends {ol.control.Control}
 * @param {Object} options Control options.
 * @param {String} options.customClass class of the control
 * @param {String} options.title title of the control
 * @param {String} options.innerHtml html to insert in the control
 * @param {Element | String} options.target
 * @param {function} options.clickEvent callback when control is clicked (or use change:active event)
 */
var Button = function (options = {}) {
  var element = document.createElement('div');
  element.className = 'ol-unselectable ol-control ol-control-custom';
  if (options.customClass) {
    element.className += ` ${options.customClass}`;
  }

  var button = document.createElement('button');
  button.innerHTML = options.innerHtml || '';

  var handleclickEvent = (e) => {
    if (e && e.preventDefault) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (options.clickEvent) {
      options.clickEvent.call(this, e);
    }
  };

  button.addEventListener('click', handleclickEvent, false);
  button.addEventListener('touchstart', handleclickEvent, false);
  element.appendChild(button);

  ol.control.Control.call(this, {
    element: element,
    target: options.target
  });

  if (options.title) {
    this.set('title', options.title);
  }
};
ol.inherits(Button, ol.control.Control);

export default Button;
