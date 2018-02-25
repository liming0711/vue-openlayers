<script>
import { createLineStyle } from '../utils/style';
import common from '../mixins/common';

export default {
  // TODO 增加支持描边
  name: 'OlLine',
  render () { return false; },
  mixins: [common()],
  props: {
    name: {
      type: String,
      default: 'line'
    },
    vid: {
      type: String,
      required: true
    },
    lines: {
      type: Array,
      required: true
    },
    lineColor: {
      type: String,
      default: '#ffffff'
    },
    lineDash: {
      type: Array,
      default: function () {
        return [0, 0, 0];
      }
    },
    lineCap: {
      type: String,
      default: 'round'
    },
    lineWidth: {
      type: Number,
      default: 1.5
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
    lines () {
      this.load();
    }
  },
  methods: {
    render () {
      // TODO 增加 setSource 方法
      console.log('in MultiLine vue');
      let multiLineLayer = this.getLayerByParam('id', this.vid);

      if (!this.lines.length) {
        multiLineLayer && this.map.removeLayer(multiLineLayer);
        return false;
      }

      let feature = new this.ol.Feature(new this.ol.geom.MultiLineString(this.lines).transform('EPSG:4326', 'EPSG:3857'));
      feature.attr = this.lines;
      feature.id = this.vid;
      feature.clicking = this.clicking;
      feature.hovering = this.hovering;
      feature.stopEvent = this.stopEvent;
      feature.style = createLineStyle(this.ol, {
        strokeColor: this.lineColor,
        strokeWidth: this.lineWidth,
        lineDash: this.lineDash,
        lineCap: this.lineCap
      });
      this.layer = new this.ol.layer.Vector({
        id: this.vid,
        name: this.name,
        type: 'multiLine',
        source: new this.ol.source.Vector({ features: [feature] }),
        style: feature => {
          return new this.ol.style.Style(feature.style);
        },
        zIndex: 3
      });
      this.$parent.map.addLayer(this.layer);
    }
  }
};
</script>
