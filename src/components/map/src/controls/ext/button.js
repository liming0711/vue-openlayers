import ol from 'openlayers';
/** A simple push button control
* @constructor
* @extends {ol.control.Control}
* @param {Object=} options Control options.
* @param {String} options.className class of the control
* @param {String} options.title title of the control
* @param {String} options.html html to insert in the control
* @param {function} options.handleClick callback when control is clicked (or use change:active event)
*/
var controlButton = function (options = {}) {
  var element = document.createElement('div');
  element.className = 'ol-button ol-unselectable ol-control';
  if (options.className) {
    element.className += ` ${options.className}`;
  }

  var button = document.createElement('button');
  button.innerHTML = options.html || '';

  var handleclickEvent = (e) => {
    if (e && e.preventDefault) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (options.handleClick) {
      options.handleClick.call(this, e);
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
ol.inherits(controlButton, ol.control.Control);

export default controlButton;
