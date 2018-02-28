<script>
import { createMarkerStyle } from '../utils/style';
import common from '../mixins/common';
import render from '../mixins/render';
import reload from '../mixins/reload';
import point from '../mixins/point';

export default {
  name: 'OlMarker',
  render () { return false; },
  mixins: [common, render, point, reload],
  props: {
    vid: {
      type: String,
      required: true
    },
    name: {
      type: String,
      default: 'marker'
    },
    data: {
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
    // data 没有数据时的配置参数：
    // clean：清除该图层后直接返回
    // keep：不清除图层保持原样直接返回
    noDataMode: {
      type: String,
      default: 'clean',
      validator: function (value) {
        return ['clean', 'keep'].indexOf(value) > -1;
      }
    },
    zIndex: {
      type: Number,
      default: 4
    },
    massClear: {
      type: Boolean,
      default: true
    }
  },
  methods: {
    _getStyle (val) {
      let style = createMarkerStyle(this.ol, {
        src: val.bgImg || this.bgImg,
        rotation: val.rotation || 0,
        offset: this.offset,
        color: val.bgColor || this.bgColor,
        text: val.text ? `${val.text}` : '',
        textColor: val.textColor || this.textColor,
        offsetX: val.textOffset ? val.textOffset[0] : this.textOffset[0],
        offsetY: val.textOffset ? val.textOffset[1] : this.textOffset[1],
        align: this.align,
        scale: val.scale || this.scale
      });
      return new this.ol.style.Style(style);
    }
  }
};
</script>
