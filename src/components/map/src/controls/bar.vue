<template>
  <div class="ol-unselectable ol-control ol-control-custom-bar" :class="customClass">
    <slot></slot>
  </div>
</template>

<script>
import Constructor from './constructor';
import ready from '../mixins/ready';

export default {
  name: 'OlControlBar',
  componentName: 'OlControlBar',
  mixins: [ready],
  props: {
    customClass: {
      type: String,
      default: ''
    },
    unique: Boolean // 是否能同时打开多个子选项
  },
  data () {
    return {
      bar: null
    };
  },
  methods: {
    _load () {
      this.bar = new Constructor({
        element: this.$el,
        properties: {
          type: 'subbar'
        }
      });
      this.map.addControl(this.bar);
      this.$emit('bar-ready');
    },
    _addButton (button) {
      button.set('parentName', 'root');
      button.set('bar-unique', this.unique);
      this._addControl(button);
    },
    _addSubbar (subbar) {
      this._addControl(subbar);
    },
    _addControl (ctrl) {
      ctrl.setTarget(this.$el);
      if (this.map) {
        this.map.addControl(ctrl);
      }
    }
  }
};
</script>
<style>
/* Bar style */
.ol-control.ol-control-custom-bar {
  position: absolute;
  left: 50%;
  top: 0;
  transform: translate(-50%, 0);
}
.ol-control.ol-control-custom-bar .ol-control-custom-button,
.ol-control.ol-control-custom-bar .ol-control-custom-subbar-wrapper {
  display: inline-block;
}
.ol-control.ol-control-custom-bar .ol-control-custom-subbar-wrapper {
  position: relative;
}
.ol-control-custom-subbar-wrapper .ol-control-custom-subbar {
  position: absolute;
  white-space: nowrap;
  left: -50%;
  top: 2.2em;
}
.ol-control-custom-subbar-wrapper .ol-control-custom-subbar:before {
  content: "";
  position: absolute;
  top: -12px;
  left: 50%;
  height: 0;
  width: 0;
  margin-left: -6px;
  border: 6px solid transparent;
  border-bottom-color: rgba(255, 255, 255, .4);
  pointer-events: none;
}
.ol-control.ol-control-custom-bar .ol-control-custom-button {
  width: 25px;
  height: 25px;
}
.ol-control.ol-control-custom-bar .ol-control-custom-button:focus {
  background-color: rgba(0, 60, 136, .5);
}
.ol-control.ol-control-custom-bar .ol-control-custom-button:hover {
  background-color: rgba(0, 60, 136, .7);
}
.ol-control-custom-button.ol-control-custom-active,
.ol-control-custom-button.ol-control-custom-active:focus {
  background-color: rgba(0, 60, 136, .7);
}
.ol-control-custom-button.ol-control-custom-disable,
.ol-control-custom-button.ol-control-custom-disable:focus,
.ol-control-custom-button.ol-control-custom-disable:hover {
  background-color: rgba(0, 60, 136, .3);
}
</style>
