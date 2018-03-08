<script>
import ready from '../mixins/ready';
import render from '../mixins/render';
import beforeDestroy from '../mixins/beforeDestroy';

const TYPE = 'draw';
const WIDTH = 3;
const DRAW_TYPE_LIST = ['Point', 'Rectangle', 'Square', 'Circle', 'LineString', 'Polygon']; // 'Ellipse'

export default {
  name: 'OlDraw',
  render () { return false; },
  mixins: [ready, render, beforeDestroy],
  props: {
    vid: {
      type: String,
      required: true
    },
    name: String,
    type: String,
    drawStyle: [Array, Object],
    maxPoints: {
      type: Number,
      default: Infinity
    },
    opacity: {
      type: Number,
      default: 1
    },
    zIndex: {
      type: Number,
      default: 5
    },
    measure: Boolean,
    massClear: {
      type: Boolean,
      default: true
    }
  },
  data () {
    return {
      drawInteraction: null,
      layer: null,
      active: false,
      lastType: '',
      sketchListener: null,
      sketch: null, // @type {ol.Feature} Currently drawn feature.
      helpTooltipElement: null, // The help tooltip element
      helpTooltip: null, // Overlay to show the help messages
      measureTooltipElement: null, // The measure tooltip element
      measureTooltip: null, // Overlay to show the measurement
      continuePolygonMsg: '点击继续绘制多边形',
      continueLineMsg: '点击继续绘制折线',
      interactionTimer: null,
      measureTooltipList: [],
      measureInited: false
    };
  },
  watch: {
    type (newType) {
      // 空字符串关闭画图功能，但是保留已经画好的图
      // 其他非 typeList 内的元素一律清空 source 并 removeLayer
      if (DRAW_TYPE_LIST.indexOf(newType) < 0) {
        if (newType !== '') {
          this.clearDrawSource();
          this.map.removeLayer(this.drawLayer);
        }
        this.active = false;
      } else {
        if (newType !== this.lastType) {
          this._load();
        }
        this.active = true;
        this.lastType = newType;
      }
    },
    active (newActive) {
      this.$parent.drawEnable = newActive;
      this.drawInteraction && this.drawInteraction.setActive(newActive);
    },
    measure (nb) {
      if (nb) {
        this._initMeasure();
      } else {
        this._uninitMeasure();
      }
    }
  },
  methods: {
    _load () {
      if (this.drawInteraction) {
        this.map.removeInteraction(this.drawInteraction);
        this._addInteraction();
        return false;
      } else {
        if (DRAW_TYPE_LIST.indexOf(this.type) < 0) {
          return false;
        }
      }

      this.render(TYPE, new this.ol.source.Vector({ crossOrigin: 'anonymous' }), this._getStyle());

      this._addInteraction();
    },
    _getInteractionType () {
      let type = this.type;
      if (!type) { return undefined; }
      if (type === 'Square' || type === 'Rectangle' || type === 'Ellipse') {
        type = 'Circle';
      }
      return type;
    },
    _getGeometryFunction () {
      let geometryFunction;
      if (this.type === 'Square') {
        geometryFunction = (coordinates, optGeometry) => {
          const geometry = optGeometry || new this.ol.geom.Polygon(null);
          let start = coordinates[0];
          let end = coordinates[1];
          let l = start[1] - end[1];
          geometry.setCoordinates([[start, [start[0], end[1]], [start[0] + l, end[1]], [start[0] + l, start[1]], start]]);
          return geometry;
        };
      } else if (this.type === 'Rectangle') {
        geometryFunction = this.ol.interaction.Draw.createBox();
      } else if (this.type === 'Ellipse') {
        // TODO
        // geometryFunction = (coordinates, optGeometry) => {
        //   let center = coordinates[0];
        //   let end = coordinates[1];
        //   let dx = center[0] - end[0];
        //   let dy = center[1] - end[1];
        //   let radius = Math.sqrt(dx * dx + dy * dy);
        //   let geometry = optGeometry || this.ol.geom.Polygon.fromCircle(new this.ol.geom.Circle(center, radius, 'XY'), 5, 0);
        //   return geometry;
        // };
      }
      return geometryFunction;
    },
    _getStyle () {
      let defaultStyle = [
        new this.ol.style.Style({
          stroke: new this.ol.style.Stroke({ color: '#fff', width: WIDTH + 2 })
        }),
        new this.ol.style.Style({
          image: new this.ol.style.Circle({
            radius: WIDTH * 2,
            fill: new this.ol.style.Fill({ color: '#0099FF' }),
            stroke: new this.ol.style.Stroke({ color: '#fff', width: WIDTH / 2 })
          }),
          stroke: new this.ol.style.Stroke({ color: '#0099FF', width: WIDTH }),
          fill: new this.ol.style.Fill({
            color: [255, 255, 255, 0.5]
          })
        })
      ];
      return this.drawStyle || defaultStyle;
    },
    _addInteraction () {
      this.drawInteraction = new this.ol.interaction.Draw({
        source: this.layer.getSource(),
        type: this._getInteractionType(),
        geometryFunction: this._getGeometryFunction(),
        maxPoints: this.maxPoints
      });
      this.map.addInteraction(this.drawInteraction);
      if (this.measure) {
        this._initMeasure();
      }
      this._registerEvents();
      this.active = true;
    },
    _initMeasure () {
      this.map.on('pointermove', this._pointerMoveHandler);
      this.drawInteraction.on('drawstart', this._drawStartMeasureEventListener);
      this.drawInteraction.on('drawend', this._drawEndMeasureEventListener);
      this.map.getViewport().addEventListener('mouseout', this._viewportEventListener);
      this._createMeasureTooltip();
      this._createHelpTooltip();
      this.measureInited = true;
    },
    _uninitMeasure () {
      this.map.un('pointermove', this._pointerMoveHandler);
      this.drawInteraction.un('drawstart', this._drawStartMeasureEventListener);
      this.drawInteraction.un('drawend', this._drawEndMeasureEventListener);
      this.map.getViewport().removeEventListener('mouseout', this._viewportEventListener);
      this.sketch = null;
      this.measureTooltipElement = null;
      this.helpTooltipElement = null;
      this.helpTooltip.setPosition(undefined);
      this.ol.Observable.unByKey(this.sketchListener);
      this.measureInited = false;
    },
    _registerEvents () {
      this.drawInteraction.on('drawstart', this._drawStartBasicEventListener, this);
      this.drawInteraction.on('drawend', this._drawEndBasicEventListener, this);
    },
    _viewportEventListener () {
      this.helpTooltipElement.classList.add('hidden');
    },
    _drawStartBasicEventListener (e) {
      e.feature.set('vid', this.vid);
      e.feature.set('style', this._getStyle());
      this.mapComponent.click.setActive(false);
      this.mapComponent.hover.setActive(false);
      this.$emit('drawstart', e);
    },
    _drawEndBasicEventListener (e) {
      this.$emit('drawend', e);
      this.interactionTimer = setTimeout(() => {
        this.mapComponent.click.setActive(true);
        this.mapComponent.hover.setActive(true);
      }, 500);
    },
    _drawStartMeasureEventListener (evt) {
      this.sketch = evt.feature;

      var tooltipCoord = evt.coordinate;

      this.sketchListener = this.sketch.getGeometry().on('change', (evt) => {
        var geom = evt.target;
        var output;
        if (geom instanceof this.ol.geom.Polygon) {
          output = this._formatArea(geom);
          tooltipCoord = geom.getInteriorPoint().getCoordinates();
        } else if (geom instanceof this.ol.geom.LineString) {
          output = this._formatLength(geom);
          tooltipCoord = geom.getLastCoordinate();
        }
        this.measureTooltipElement.innerHTML = output;
        this.measureTooltip.setPosition(tooltipCoord);
      });
    },
    _drawEndMeasureEventListener (evt) {
      this.measureTooltipElement.className = 'tooltip tooltip-static';
      this.measureTooltip.setOffset([0, -7]);
      this.sketch = null; // unset sketch
      this.measureTooltipElement = null; // unset tooltip so that a new one can be created
      this._createMeasureTooltip();
      this.ol.Observable.unByKey(this.sketchListener);
    },
    _pointerMoveHandler (evt) {
      if (evt.dragging) {
        return;
      }
      var helpMsg = '点击开始绘制';
      if (this.sketch) {
        var geom = this.sketch.getGeometry();
        if (geom instanceof this.ol.geom.Polygon) {
          helpMsg = this.continuePolygonMsg;
        } else if (geom instanceof this.ol.geom.LineString) {
          helpMsg = this.continueLineMsg;
        }
      }

      this.helpTooltipElement.innerHTML = helpMsg;
      this.helpTooltip.setPosition(evt.coordinate);

      this.helpTooltipElement.classList.remove('hidden');
    },
    _formatLength (line) {
      var length = this.ol.Sphere.getLength(line);
      var output;
      if (length > 100) {
        output = `${Math.round(length / 1000 * 100) / 100} km`;
      } else {
        output = `${Math.round(length * 100) / 100} m`;
      }
      return output;
    },
    _formatArea (polygon) {
      var area = this.ol.Sphere.getArea(polygon);
      var output;
      if (area > 10000) {
        output = `${Math.round(area / 1000000 * 100) / 100} km<sup>2</sup>`;
      } else {
        output = `${Math.round(area * 100) / 100} m<sup>2</sup>`;
      }
      return output;
    },
    _createMeasureTooltip () {
      if (this.measureTooltipElement) {
        this.measureTooltipElement.parentNode.removeChild(this.measureTooltipElement);
      }
      this.measureTooltipElement = document.createElement('div');
      this.measureTooltipElement.className = 'tooltip tooltip-measure';
      this.measureTooltip = new this.ol.Overlay({
        element: this.measureTooltipElement,
        offset: [0, -15],
        positioning: 'bottom-center'
      });
      this.measureTooltip.set('massClear', true);
      this.map.addOverlay(this.measureTooltip);
      this.measureTooltipList.push(this.measureTooltip);
    },
    _createHelpTooltip () {
      if (this.helpTooltipElement) {
        this.helpTooltipElement.parentNode.removeChild(this.helpTooltipElement);
      }
      this.helpTooltipElement = document.createElement('div');
      this.helpTooltipElement.className = 'tooltip hidden';
      this.helpTooltip = new this.ol.Overlay({
        element: this.helpTooltipElement,
        offset: [15, 0],
        positioning: 'center-left'
      });
      this.helpTooltip.set('massClear', true);
      this.map.addOverlay(this.helpTooltip);
    },
    clearMeasureOverlay () {
      this.measureTooltipList.forEach(overlay => {
        this.map.removeOverlay(overlay);
      });
      this.map.removeOverlay(this.helpTooltip);
      if (this.measure) {
        this._createMeasureTooltip();
        this._createHelpTooltip();
      }
    },
    clearSource () {
      this.layer.getSource().clear();
    }
  },
  beforeDestroy () {
    this.clearSource();
    this.clearMeasureOverlay();
    clearTimeout(this.interactionTimer);
  }
};
</script>
<style>
.tooltip {
  position: relative;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 4px;
  color: white;
  padding: 4px 8px;
  opacity: 0.7;
  font-size: 12px;
  white-space: nowrap;
}
.tooltip-measure {
  opacity: 1;
  font-weight: bold;
}
.tooltip-static {
  background-color: #ffcc33;
  color: black;
  border: 1px solid white;
}
.tooltip:before,
.tooltip:after {
  content: " ";
  position: absolute;
  top: 100%;
  left: 50%;
  height: 0;
  width: 0;
  border: solid transparent;
  pointer-events: none;
}
.tooltip-measure:before,
.tooltip-static:before {
  border-color: transparent;
  border-top-color: rgba(0, 0, 0, 0.3);
  border-width: 6px;
  margin-left: -6px;
}
.tooltip-measure:after,
.tooltip-static:after {
  border-color: transparent;
  border-top-color: rgba(0, 0, 0, 0.3);
  border-width: 5px;
  margin-left: -5px;
}
.tooltip-static:before {
  border-top-color: #fff;
}
.tooltip-static:after {
  border-top-color: #ffcc33;
}
</style>
