<script>
import ready from '../mixins/ready';
import render from '../mixins/render';
import destroy from '../mixins/destroy';

const WIDTH = 3;
const TYPE_LIST = ['Rectangle', 'Square', 'Circle', 'LineString', 'Polygon']; // 'Ellipse', 'Point',

export default {
  name: 'OlDraw',
  render () { return false; },
  mixins: [ready, render, destroy],
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
          this._load();
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
    _load () {
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
      if (this.type === 'Square' || this.type === 'Rectangle' || this.type === 'Ellipse') {
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
    },
    clearDrawSource () {
      this.layer.getSource().clear();
    }
  }
};
</script>
