<script>
import { createLineStyle } from '../utils/style';
import ready from '../mixins/ready';
import render from '../mixins/render';
import reload from '../mixins/reload';
import destroy from '../mixins/destroy';

const TYPE = 'line';

export default {
  // TODO 增加支持描边
  name: 'OlLine',
  render () { return false; },
  mixins: [ready, render, reload, destroy],
  props: {
    vid: {
      type: String,
      required: true
    },
    name: String,
    data: {
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
    noDataMode: {
      type: String,
      default: 'clean',
      validator: function (value) {
        return ['clean', 'keep'].indexOf(value) > -1;
      }
    },
    opacity: {
      type: Number,
      default: 1
    },
    zIndex: {
      type: Number,
      default: 3
    },
    massClear: {
      type: Boolean,
      default: true
    }
  },
  methods: {
    _load () {
      if (!this.data.length) { return false; }
      this.render(TYPE, this._getSource(this._getFeatures(this.data)));
    },
    _getFeatures (data) {
      let features = new this.ol.Feature(new this.ol.geom.MultiLineString(data).transform('EPSG:4326', 'EPSG:3857'));
      features.attr = data;
      features.set('attr', data);
      features.set('vid', this.vid);
      features.set('style', this._getStyle());

      return [features];
    },
    _getSource (features) {
      return new this.ol.source.Vector({features: features});
    },
    _getStyle () {
      let style = createLineStyle(this.ol, {
        strokeColor: this.lineColor,
        strokeWidth: this.lineWidth,
        lineDash: this.lineDash,
        lineCap: this.lineCap
      });
      return new this.ol.style.Style(style);
    }
  }
};
</script>
