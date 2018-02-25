<script>
import { createMarkerStyle } from '../utils/style';
import common from '../mixins/common';

export default {
  name: 'OlMarker',
  render () { return false; },
  mixins: [common()],
  props: {
    vid: {
      type: String,
      required: true
    },
    name: {
      type: String,
      default: 'marker'
    },
    markers: {
      type: Array,
      required: true
    },
    bgImg: {
      type: String,
      default: require('../images/pin.png')
    },
    bgColor: {
      type: String,
      default: '#ffffff'
    },
    offset: {
      // 0: X，正值向左移动
      // 1: Y，正值向上移动
      type: Array,
      default: function () {
        return [0, 0];
      }
    },
    scale: {
      type: Number,
      default: 0.5
    },
    // 0: X，正值向右移动
    // 1: Y，正值向下移动
    textOffset: {
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
    markers () {
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

      this.markers.forEach(val => {
        feature = new this.ol.Feature(new this.ol.geom.Point([+val.lon, +val.lat]).transform('EPSG:4326', 'EPSG:3857'));
        feature.attr = val;
        feature.vid = this.vid;
        feature.style = createMarkerStyle(this.ol, {
          src: val.bgImg || this.bgImg,
          rotation: val.rotation || 0,
          offset: this.offset,
          color: val.bgColor || this.bgColor,
          text: val.text || '',
          textColor: val.textColor || this.textColor,
          offsetX: this.textOffset ? this.textOffset[0] : 0,
          offsetY: this.textOffset ? this.textOffset[1] : 0,
          align: this.align,
          scale: val.scale || this.scale
        });
        features.push(feature);
      });

      return features;
    },
    render () {
      // markers 没有数据时根据可配置的参数有两种处理方式：
      // (1)、清除该图层后直接返回
      // (2)、不清除图层保持原样直接返回

      // render 被调用时先检测以当前 vid 为 id 的图层是否存在，
      // 若存在则直接使用 setSource 替换数据，可以减小开销并有效防止图层闪烁
      // 若不存在则创建新的图层
      let markerLayer = this.getLayerByParam('id', this.vid);

      if (this.markers.length === 0) {
        if (this.noDataMode === 'clean') {
          markerLayer && this.map.removeLayer(markerLayer);
        }
        return false;
      }

      let features = this._getFeatures();
      let source = this._getSource(features);
      let style = this._getStyle(features);

      if (markerLayer) {
        markerLayer.setSource(source);
        markerLayer.setStyle(style);
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
      this.map.addLayer(this.layer);
      return true;
    },
    removeEvents () {
      this.$parent.clickEvent.un('select', this.clickEvent);
    }
  }
};
</script>
