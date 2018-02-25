let basicStrokeStyle = function (ol, options) {
  return new ol.style.Stroke({
    color: options.strokeColor,
    width: options.strokeWidth,
    lineDash: options.lineDash,
    lineCap: options.lineCap || 'round'
  });
};
let basicFillStyle = function (ol, options) {
  return new ol.style.Fill({
    color: options.fillColor
  });
};
let basicIconStyle = function (ol, options) {
  return new ol.style.Icon({
    src: options.src,
    crossOrigin: 'Anonymous',
    anchor: options.offset,
    anchorXUnits: 'pixels',
    anchorYUnits: 'pixels',
    color: options.color,
    rotation: options.rotation * Math.PI / 180, // rotation 为弧度，不是角度，角度转弧度公式：角度 * Math.PI / 180
    opacity: 1,
    scale: options.scale
  });
};
let basicTextStyle = function (ol, options) {
  return new ol.style.Text({
    text: options.text,
    textAlign: options.align,
    opacity: 1,
    offsetX: options.offsetX,
    offsetY: options.offsetY,
    // TODO 写 Text.vue 的时候修改以下两项
    fill: basicFillStyle(ol, { fillColor: options.textColor }),
    stroke: basicStrokeStyle(ol, {
      strokeColor: options.textStroke,
      strokeWidth: options.textStroke ? (options.strokeWidth || 1) : 0
    })
  });
};

export function createMarkerStyle (ol, options = {}) {
  return {
    image: basicIconStyle(ol, options),
    text: basicTextStyle(ol, options)
  };
};
export function createTextStyle (ol, options = {}) {
  return {
    text: basicTextStyle(ol, options)
  };
};
export function createVectorStyle (ol, options = {}) {
  return {
    stroke: basicStrokeStyle(ol, options),
    fill: basicFillStyle(ol, options),
    text: basicTextStyle(ol, options)
  };
};
export function createLineStyle (ol, options = {}) {
  return {
    stroke: basicStrokeStyle(ol, options)
  };
};
