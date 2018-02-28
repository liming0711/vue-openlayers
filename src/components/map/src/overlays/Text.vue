<script>
import { createTextStyle } from '../utils/style';
import common from '../mixins/common';
// import getSingleFeature from '../mixins/getSingleFeature';
import mapTools from '../mixins/mapTools';

export default {
  name: 'OlText',
  render () { return false; },
  mixins: [common, mapTools],
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
    noDataMode: {
      type: String,
      default: 'clean',
      validator: function (value) {
        return ['clean', 'keep'].indexOf(value) > -1;
      }
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
  methods: {
    load () {
      if (!this.data.length) { return false; }
      this.layer = new this.ol.layer.Vector({
        id: this.vid,
        name: this.name,
        type: 'point',
        source: this._getSource(this._getFeatures()),
        style: feature => { return this._getSingleFeature(feature).getStyle(); },
        zIndex: this.zIndex
      });
      this.$parent.map.addLayer(this.layer);
    },
    _getStyle (val) {
      let style = createTextStyle(this.ol, {
        text: val.text || '',
        textColor: val.textColor || this.textColor,
        offsetX: val.offset ? val.offset[0] : this.offset[0],
        offsetY: val.offset ? val.offset[1] : this.offset[1],
        align: this.align
      });
      return new this.ol.style.Style(style);
    },
    _getFeatures () {
      let feature;
      let features = [];

      this.data.forEach(val => {
        feature = new this.ol.Feature(new this.ol.geom.Point([+val.lon, +val.lat]).transform('EPSG:4326', 'EPSG:3857'));
        feature.set('attr', val);
        feature.set('vid', this.vid);
        feature.setStyle(this._getStyle(val));
        features.push(feature);
      });

      return features;
    },
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
    }
  }
};
</script>
