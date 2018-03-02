<template>
  <div v-show="position && position.length" class="overlay-wrapper" ref="overlay">
    <img src="../images/close.png" class="overlay-close" @click="_handleClose">
    <div class="overlay-body">
      <slot></slot>
    </div>
  </div>
</template>

<script>
// TODO 兼容闪烁点的情况 twinkle
// TODO 去除 overlay 所有样式，由用户自定义
import common from '../mixins/common';

export default {
  name: 'OlOverlay',
  mixins: [common],
  data () {
    return {
      overlay: null
    };
  },
  props: {
    position: {
      type: Array,
      required: true
    },
    positioning: String,
    // 正值分别向右和向下偏移
    offset: Array,
    // overlay 对于 position 的相对位置，
    // 可能的值包括 bottom-left、bottom-center、bottom-right 、center-left、center-center、center-right、top-left、top-center、top-right，
    // 默认是 top-left，也就是 element 左上角与 position 重合
    stopEvent: {
      type: Boolean,
      default: true
    },
    autoPan: {
      type: Boolean,
      default: true
    },
    autoPanAnimation: {
      type: Number,
      default: 250
    },
    massClear: {
      type: Boolean,
      default: true
    }
  },
  watch: {
    position (newPosition) {
      if (newPosition.length) {
        this.overlay && this.overlay.setPosition(this.ol.proj.transform(newPosition, 'EPSG:4326', 'EPSG:3857'));
      } else {
        this._handleClose();
      }
    }
  },
  methods: {
    _load () {
      this.overlay = new this.ol.Overlay({
        id: this.vid,
        name: this.name,
        element: this.$refs.overlay,
        position: this.ol.proj.transform(this.position, 'EPSG:4326', 'EPSG:3857'),
        positioning: this.positioning,
        offset: this.offset,
        stopEvent: this.stopEvent,
        autoPan: this.autoPan,
        autoPanAnimation: {
          duration: this.autoPanAnimation
        }
      });
      this.overlay.set('name', this.name);
      this.overlay.set('massClear', this.massClear);
      this.map.addOverlay(this.overlay);
    },
    _handleClose () {
      this.overlay.setPosition(undefined);
      return false;
    }
  }
};
</script>
<style scoped>
.overlay-wrapper {
  border-radius: 2px;
  box-shadow: 0 1px 3px rgba(0,0,0,.3);
  box-sizing: border-box;
  background-color: #075079;
}
.overlay-close {
  float: right;
  width: 10px;
  height: 10px;
  padding: 8px;
  cursor: pointer;
}
.overlay-body {
  padding: 20px;
  color: #ffffff;
  font-size: 14px;
}
</style>
