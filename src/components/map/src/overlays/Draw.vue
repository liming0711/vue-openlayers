<script>
import common from '../mixins/common';
import render from '../mixins/render';

const WIDTH = 3;
const MAX_POINT = Infinity;
const TYPE_LIST = ['Rectangle', 'Square', 'Circle', 'Ellipse', 'Point', 'LineString', 'Polygon'];

export default {
  name: 'OlDraw',
  render () { return false; },
  mixins: [common, render],
  props: {
    vid: {
      type: String,
      required: true
    },
    name: {
      type: String,
      default: 'draw'
    },
    type: String,
    drawStyle: [Array, Object],
    zIndex: {
      type: Number,
      default: 5
    },
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
      lastType: ''
    };
  },
  watch: {
    type (newType, oldType) {
      // 空字符串关闭画图功能，但是保留已经画好的图
      // 其他非 typeList 内的元素一律清空 source 并 removeLayer
      if (TYPE_LIST.indexOf(newType) < 0) {
        if (newType !== '') {
          this.clearDrawSource();
          this.map.removeLayer(this.drawLayer);
        }
        this.active = false;
      } else {
        if (newType !== this.lastType) {
          this.load();
        }
        this.active = true;
        this.lastType = newType;
      }
    },
    active (newActive, oldActive) {
      if (newActive !== oldActive) {
        this.$parent.drawEnable = newActive;
        this.drawInteraction && this.drawInteraction.setActive(newActive);
      }
    }
  },
  methods: {
    load () {
      if (this.drawInteraction) {
        this.map.removeInteraction(this.drawInteraction);
        this._addInteraction();
        return false;
      } else {
        if (TYPE_LIST.indexOf(this.type) < 0) {
          return false;
        }
      }

      this.render('draw', new this.ol.source.Vector({ crossOrigin: 'anonymous' }));

      this._addInteraction();
    },
    _getInteractionType () {
      let type = this.type;
      if (this.type === 'Square' || this.type === 'Rectangle') {
        type = 'Circle';
      }
      return type;
    },
    _getGeometryFunction () {
      let geometryFunction;
      if (this.type === 'Square') {
        geometryFunction = (coordinates, geometry) => {
          if (!geometry) {
            geometry = new this.ol.geom.Polygon(null);
          }
          let start = coordinates[0];
          let end = coordinates[1];
          let l = start[1] - end[1];
          geometry.setCoordinates([[start, [start[0], end[1]], [start[0] + l, end[1]], [start[0] + l, start[1]], start]]);
          return geometry;
        };
      } else if (this.type === 'Rectangle') {
        geometryFunction = this.ol.interaction.Draw.createBox();
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
    clearDrawSource () {
      this.layer.getSource().clear();
    },
    _addInteraction () {
      this.drawInteraction = new this.ol.interaction.Draw({
        source: this.layer.getSource(),
        type: this._getInteractionType(),
        geometryFunction: this._getGeometryFunction(),
        maxPoints: this.type === 'Square' || this.type === 'Rectangle' ? 2 : MAX_POINT
      });
      this.map.addInteraction(this.drawInteraction);
      this._registerEvents();
      this.active = true;
    },
    _registerEvents () {
      this.drawInteraction.on('drawstart', (e) => {
        e.feature.set('vid', this.vid);
        e.feature.setStyle(this._getStyle());
        this.$emit('drawstart', e);
      });
      this.drawInteraction.on('drawend', (e) => {
        this.$emit('drawend', e);
      });
    }
  }
};
/*
createRegularPolygon (optSides, optAngle) {
  return (
    function (coordinates, optGeometry) {
      const center = coordinates[0];
      const end = coordinates[1];
      const radius = Math.sqrt(squaredCoordinateDistance(center, end));
      const geometry = optGeometry || fromCircle(new Circle(center), optSides);
      const angle = optAngle || Math.atan((end[1] - center[1]) / (end[0] - center[0]));
      makeRegular(geometry, center, radius, angle);
      return geometry;
    }
  );
},
makeRegular (polygon, center, radius, optAngle) {
  const flatCoordinates = polygon.getFlatCoordinates();
  const layout = polygon.getLayout();
  const stride = polygon.getStride();
  const ends = polygon.getEnds();
  const sides = flatCoordinates.length / stride - 1;
  const startAngle = optAngle || 0;
  for (let i = 0; i <= sides; ++i) {
    const offset = i * stride;
    const angle = startAngle + (modulo(i, sides) * 2 * Math.PI / sides);
    flatCoordinates[offset] = center[0] + (radius * Math.cos(angle));
    flatCoordinates[offset + 1] = center[1] + (radius * Math.sin(angle));
  }
  polygon.setFlatCoordinates(layout, flatCoordinates, ends);
},
*/
</script>
