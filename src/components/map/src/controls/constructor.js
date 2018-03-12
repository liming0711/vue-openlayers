import ol from 'openlayers';

var Constructor = function (options = {}) {
  ol.control.Control.call(this, {
    element: options.element
  });

  for (let i in options.properties) {
    this.set(i, options.properties[i]);
  }
};

ol.inherits(Constructor, ol.control.Control);

export default Constructor;
