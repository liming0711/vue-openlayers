<script>
import { createVectorStyle } from '../utils/style';
import common from '../mixins/common';

export default {
  name: 'OlVector',
  render () { return false; },
  mixins: [common()],
  props: {
    name: {
      type: String,
      default: 'vector'
    },
    vid: {
      type: String,
      required: true
    },
    vector: {
      type: Object,
      required: true
    },
    strokeColor: {
      type: String,
      default: '#ffffff'
    },
    strokeWidth: {
      type: Number,
      default: 1.5
    },
    fillColor: {
      type: String,
      default: 'rgba(255, 255, 255, 0.1)'
    },
    text: {
      type: String,
      default: ''
    },
    textColor: {
      type: String,
      default: '#ffffff'
    },
    textStroke: {
      type: String,
      default: '#000000'
    },
    align: {
      type: String,
      default: 'center'
    },
    offset: {
      // 0: X，正值向左移动
      // 1: Y，正值向上移动
      type: Array,
      default: function () {
        return [0, 0];
      }
    },
    clicking: {
      type: Boolean,
      default: false
    },
    hovering: {
      type: Boolean,
      default: false
    },
    stopEvent: {
      type: Boolean,
      default: true
    },
    massClear: {
      type: Boolean,
      default: true
    }
  },
  watch: {
    vector () {
      this.load();
    }
  },
  methods: {
    // TODO 兼容更多的情况，例如 point 的位置使用 marker
    // TODO 使用 smooth 使曲线平滑
    // TODO 矢量图里的文字可能有多种颜色（e.g：高压是蓝色，低压是红色）
    // TODO 兼容其他投影，现在只支持 3857
    render () {
      console.log('in vector vue', this.vector);
      let vectorLayer = this.getLayerByParam('id', this.vid);

      if (JSON.stringify(this.vector).length === 2 || !this.vector.features.length) {
        vectorLayer && this.map.removeLayer(vectorLayer);
        return false;
      }
      if (vectorLayer) {
        let layerSource = new this.ol.source.Vector({
          features: new this.ol.format.GeoJSON({ featureProjection: 'EPSG:3857' }).readFeatures(this.vector)
        });

        vectorLayer.setSource(layerSource);
      } else {
        this.layer = new this.ol.layer.Vector({
          id: this.vid,
          name: this.name,
          type: 'vector',
          source: new this.ol.source.Vector({
            features: new this.ol.format.GeoJSON({ featureProjection: 'EPSG:3857' }).readFeatures(this.vector)
          }),
          style: feature => {
            let type = feature.getGeometry().getType();
            let lineColor = type === 'LineString' ? feature.getProperties().color : this.strokeColor;
            let fillColor = type === 'Polygon' ? feature.getProperties().color : this.fillColor;
            let text = type === 'Point' ? feature.getProperties().val : this.text;
            feature.attr = this.vector;
            feature.id = this.vid;
            feature.clicking = this.clicking;
            feature.hovering = this.hovering;
            feature.stopEvent = this.stopEvent;
            feature.style = createVectorStyle(this.ol, {
              strokeColor: lineColor || this.lineColor,
              strokeWidth: this.strokeWidth,
              fillColor: fillColor || this.fillColor,
              text: text ? `${text}` : this.text,
              textColor: this.textColor,
              textStroke: this.textStroke,
              align: this.align,
              offsetX: this.offset ? this.offset[0] : 0,
              offsetY: this.offset ? this.offset[1] : 0
            });
            return new this.ol.style.Style(feature.style);
          },
          zIndex: this.zIndex
        });
        this.$parent.map.addLayer(this.layer);
      }
    }
  }
};
</script>
