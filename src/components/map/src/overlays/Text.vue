<script>
import { createTextStyle } from '../utils/style';
import common from '../mixins/common';
import render from '../mixins/render';
import reload from '../mixins/reload';
import point from '../mixins/point';

export default {
  name: 'OlText',
  render () { return false; },
  mixins: [common, render, point, reload],
  props: {
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
  methods: {
    _getStyle (val) {
      let style = createTextStyle(this.ol, {
        text: val.text || '',
        textColor: val.textColor || this.textColor,
        offsetX: val.offset ? val.offset[0] : this.offset[0],
        offsetY: val.offset ? val.offset[1] : this.offset[1],
        align: this.align
      });
      return new this.ol.style.Style(style);
    }
  }
};
</script>
