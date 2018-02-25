<script>
import { createTextStyle } from '../utils/style';
import common from '../mixins/common';

export default {
  name: 'OlText',
  render () { return false; },
  mixins: [common()],
  props: {
    vid: {
      type: String,
      required: true
    },
    name: {
      type: String,
      default: 'text'
    },
    data: {
      type: Array,
      required: true
    },
    // 0: X，正值向右移动
    // 1: Y，正值向下移动
    offset: {
      type: Array,
      default: function () {
        return [0, 0];
      }
    },
    textColor: {
      type: String,
      default: '#ffffff'
    },
    align: {
      type: String,
      default: 'center'
    },
    cluster: Boolean,
    distance: {
      type: Number,
      default: 20
    },
    // 两种模式，clean 和 keep
    noDataMode: {
      type: String,
      default: 'clean'
    },
    clicking: {
      type: Boolean,
      default: true
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
    data () {
      this.load();
    }
  },
  methods: {
    _getSource (features) {
      let source;
      if (this.cluster) {
        source = new this.ol.source.Cluster({
          distance: this.distance || 50,
          source: new this.ol.source.Vector({
            features: features
          })
        });
      } else {
        source = new this.ol.source.Vector({features: features});
      }
      return source;
    },
    _getStyle (features) {
      let style;
      if (this.cluster) {
        style = feature => {
          // 聚合后的点是确定的 this.ol.proj.transform(feature.getGeometry().getCoordinates(), 'EPSG:3857', 'EPSG:4326')
          // todo 选取聚合后显示哪一个，应该显示离聚合后的点最近的一个点的值，和 map.vue 里面的样式需要统一
          return new this.ol.style.Style(feature.get('features')[0].style);
        };
      } else {
        style = feature => {
          return new this.ol.style.Style(feature.style);
        };
      }
      return style;
    },
    _getFeatures () {
      let feature;
      let features = [];

      this.data.forEach(val => {
        feature = new this.ol.Feature(new this.ol.geom.Point([+val.lon, +val.lat]).transform('EPSG:4326', 'EPSG:3857'));
        feature.attr = val;
        feature.vid = this.vid;
        feature.style = createTextStyle(this.ol, {
          text: val.text || '',
          textColor: val.textColor || this.textColor,
          offsetX: this.offset ? this.offset[0] : 0,
          offsetY: this.offset ? this.offset[1] : 0,
          align: this.align
        });
        features.push(feature);
      });

      return features;
    },
    render () {
      let textLayer = this.getLayerByParam('id', this.vid);

      if (this.data.length === 0) {
        if (this.noDataMode === 'clean') {
          textLayer && this.map.removeLayer(textLayer);
        }
        return false;
      }

      let features = this._getFeatures();
      let source = this._getSource(features);
      let style = this._getStyle(features);

      if (textLayer) {
        textLayer.setSource(source);
        textLayer.setStyle(style);
        return false;
      }
      this.layer = new this.ol.layer.Vector({
        id: this.vid,
        name: this.name,
        type: 'point',
        source: source,
        style: style,
        zIndex: 4
      });
      this.$parent.map.addLayer(this.layer);
      return true;
    },
    removeEvents () {
      this.$parent.clickEvent.un('select', this.clickEvent);
    }
  }
};
</script>
