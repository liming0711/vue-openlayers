import ol from 'openlayers';
import featureAnimation from './FeatureAnimation';

/** Zoom animation: feature zoom in (for points)
 * @constructor
 * @extends {featureAnimation}
 * @param {animationZoomOptions} options
 *  @param {bool} options.zoomOut to zoom out
 */
var animationZoom = function (options) {
  options = options || {};
  featureAnimation.call(this, options);
  this.set('zoomout', options.zoomOut);
};
ol.inherits(animationZoom, featureAnimation);

/** Zoom animation: feature zoom out (for points)
 * @constructor
 * @extends {featureAnimation}
 * @param {animationZoomOptions} options
 */
var animationZoomOut = function (options = {}) {
  options.zoomOut = true;
  animationZoom.call(this, options);
};
ol.inherits(animationZoomOut, animationZoom);

/** Animate
* @param {featureAnimationEvent} e
*/
animationZoom.prototype.animate = function (e) {
  var fac = this.easing_(e.elapsed);
  if (fac) {
    if (this.get('zoomout')) {
      fac = 1 / fac;
    }
    var style = e.style;
    var imgs;
    var sc = [];
    for (let i = 0; i < style.length; i++) {
      imgs = style[i].getImage();
      if (imgs) {
        sc[i] = imgs.getScale();
        imgs.setScale(sc[i] * fac);
      }
    }

    e.context.save();
    var ratio = e.frameState.pixelRatio;
    var m = e.frameState.coordinateToPixelTransform;
    var dx = (1 / fac - 1) * ratio * (m[0] * e.coord[0] + m[1] * e.coord[1] + m[4]);
    var dy = (1 / fac - 1) * ratio * (m[2] * e.coord[0] + m[3] * e.coord[1] + m[5]);
    e.context.scale(fac, fac);
    e.context.translate(dx, dy);
    this.drawGeom_(e, e.geom);
    e.context.restore();

    for (let i = 0; i < style.length; i++) {
      imgs = style[i].getImage();
      if (imgs) imgs.setScale(sc[i]);
    }
  }

  return (e.time <= this.duration_);
};

export {animationZoom, animationZoomOut};
