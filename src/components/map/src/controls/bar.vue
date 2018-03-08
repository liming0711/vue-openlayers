<template>
  <div><slot></slot></div>
</template>

<script>
import Bar from './constructor/Bar';
import ready from '../mixins/ready';
import { getParent } from '../utils/util';

export default {
  name: 'OlControlBar',
  render () { return false; },
  mixins: [ready],
  props: {
    customClass: {
      type: String,
      default: ''
    },
    group: {
      type: Boolean,
      default: false
    },
    toggleOne: Boolean,
    autoDeactivate: Boolean
  },
  data () {
    return {
      bar: null,
      controls: [],
      counter: 0,
      childrenNum: 0
    };
  },
  watch: {
    counter (newCounter) {
      if (newCounter === this.childrenNum) {
        this._load();
      }
    }
  },
  mounted () {
    // this.childrenNum = this.$children.length;
    const $parent = getParent(this.$parent);
    const map = $parent.map;
    this.$children.forEach(child => {
      if (child.$options.name === 'OlControlToggle' || child.$options.name === 'OlControlButton') {
        this.childrenNum++;
      }
    });
    map ? this.ready() : $parent.$on('ready', this.ready);
  },
  methods: {
    ready () {
      this.map = this.$parent.map;
      this.ol = this.$parent.ol;
    },
    _checkChildrenCount () {
      this.counter++;
    },
    _load () {
      let controls = [];
      this.$children.forEach(child => {
        controls.push(child.control);
      });

      this.bar = new Bar({
        map: this.map,
        customClass: this.customClass,
        group: this.group,
        toggleOne: this.toggleOne,
        autoDeactivate: this.autoDeactivate,
        controls
      });

      this.map.addControl(this.bar);
    }
  }
};
</script>
<style>
/* Bar style */
.ol-control.ol-control-custom-bar {
  left: 50%;
  min-height: 1em;
  min-width: 1em;
  position: absolute;
  top: 0.5em;
  transform: translate(-50%, 0);
  -webkit-transform: translate(-50%, 0);
}
.ol-control.ol-control-custom-bar button {
  border-style: none;
}

/* Hide subbar when not inserted in a parent bar */
.ol-control.ol-toggle .ol-option-bar {
  display: none;
}

/* Default position for controls */
.ol-control.ol-control-custom-bar .ol-control-custom-bar {
  position: static;
}
.ol-control.ol-control-custom-bar .ol-control {
  position: relative;
  top: auto;
  left: auto;
  right: auto;
  bottom: auto;
  display: inline-block;
  vertical-align: middle;
  background: none;
  padding: 0;
  margin: 0;
  transform: none;
  -webkit-transform: none;
}
.ol-control.ol-control-custom-bar .ol-control-custom-bar {
  position: static;
}
.ol-control.ol-control-custom-bar .ol-control button {
  margin: 2px 1px;
}

/* Positionning */
.ol-control.ol-control-custom-bar.ol-left {
  left: 0.5em;
  top: 50%;
  transform: translate(0px, -50%);
}
.ol-control.ol-control-custom-bar.ol-left .ol-control {
  display: block;
}

.ol-control.ol-control-custom-bar.ol-right {
  left: auto;
  right: 0.5em;
  top: 50%;
  transform: translate(0px, -50%);
}
.ol-control.ol-control-custom-bar.ol-right .ol-control {
  display: block;
}

.ol-control.ol-control-custom-bar.ol-bottom {
  top: auto;
  bottom: 0.5em;
}

.ol-control.ol-control-custom-bar.ol-top.ol-left,
.ol-control.ol-control-custom-bar.ol-top.ol-right {
  top: 4.5em;
  transform: none;
}
.ol-touch .ol-control.ol-control-custom-bar.ol-top.ol-left,
.ol-touch .ol-control.ol-control-custom-bar.ol-top.ol-right {
  top: 5.5em;
}
.ol-control.ol-control-custom-bar.ol-bottom.ol-left,
.ol-control.ol-control-custom-bar.ol-bottom.ol-right {
  top: auto;
  bottom: 0.5em;
  transform:none;
}

/* Group buttons */
.ol-control.ol-control-custom-bar.ol-group {
  margin: 1px 1px 1px 0;
}
.ol-control.ol-control-custom-bar.ol-right .ol-group,
.ol-control.ol-control-custom-bar.ol-left .ol-group {
  margin: 1px 1px 0 1px;
}

.ol-control.ol-control-custom-bar.ol-group button {
  border-radius: 0;
  margin: 0 0 0 1px;
}
.ol-control.ol-control-custom-bar.ol-right.ol-group button,
.ol-control.ol-control-custom-bar.ol-left.ol-group button,
.ol-control.ol-control-custom-bar.ol-right .ol-group button,
.ol-control.ol-control-custom-bar.ol-left .ol-group button {
  margin: 0 0 1px 0;
}
.ol-control.ol-control-custom-bar.ol-group .ol-control:first-child > button {
  border-radius: 5px 0 0 5px;
}
.ol-control.ol-control-custom-bar.ol-group .ol-control:last-child > button {
  border-radius: 0 5px 5px 0;
}
.ol-control.ol-control-custom-bar.ol-left.ol-group .ol-control:first-child > button,
.ol-control.ol-control-custom-bar.ol-right.ol-group .ol-control:first-child > button,
.ol-control.ol-control-custom-bar.ol-left .ol-group .ol-control:first-child > button,
.ol-control.ol-control-custom-bar.ol-right .ol-group .ol-control:first-child > button {
  border-radius: 5px 5px 0 0;
}
.ol-control.ol-control-custom-bar.ol-left.ol-group .ol-control:last-child > button,
.ol-control.ol-control-custom-bar.ol-right.ol-group .ol-control:last-child > button,
.ol-control.ol-control-custom-bar.ol-left .ol-group .ol-control:last-child > button,
.ol-control.ol-control-custom-bar.ol-right .ol-group .ol-control:last-child > button {
  border-radius: 0 0 5px 5px;
}

/* */
.ol-control.ol-control-custom-bar .ol-rotate {
  opacity: 1;
  visibility: visible;
}
.ol-control.ol-control-custom-bar .ol-rotate button {
  display: block
}

/* Active buttons */
.ol-control.ol-control-custom-bar .ol-toggle.ol-active > button {
  background: rgba(60, 136, 0, 0.7)
}
.ol-control.ol-control-custom-bar .ol-toggle.ol-active button:hover {
  background: rgba(60, 136, 0, 0.7)
}
.ol-control.ol-toggle button:disabled {
  background: rgba(0, 60, 136, .3);
}

/* Subbar toolbar */
.ol-control.ol-control-custom-bar .ol-control.ol-option-bar  {
  display: none;
  position: absolute;
  top: 100%;
  left: 0;
  margin: 5px 0;
  border-radius: 0;
  background: rgba(255, 255, 255, 0.8);
  /* border: 1px solid rgba(0, 60, 136, 0.5); */
  box-shadow: 0 0 0 1px rgba(0, 60, 136, 0.5), 1px 1px 2px rgba(0, 0, 0, 0.5);
}

.ol-control.ol-control-custom-bar .ol-option-bar:before {
  content: "";
  border: 0.5em solid transparent;
  border-color: transparent transparent rgba(0, 60, 136, 0.5);
  position: absolute;
  bottom: 100%;
  left: 0.3em;
}

.ol-control.ol-control-custom-bar .ol-option-bar .ol-control {
  display: table-cell;
}
.ol-control.ol-control-custom-bar .ol-control .ol-control-custom-bar {
  display: none;
}
.ol-control.ol-control-custom-bar .ol-control.ol-active > .ol-option-bar  {
  display: block;
}

.ol-control.ol-control-custom-bar .ol-control.ol-collapsed ul {
  display: none;
}

.ol-control.ol-control-custom-bar .ol-control.ol-text-button > button:hover,
.ol-control.ol-control-custom-bar .ol-control.ol-text-button > button {
  background: none;
  color: rgba(0, 60, 136, 0.5);
  width: auto;
  min-width: 1.375em;
  margin: 0;
}

.ol-control.ol-control-custom-bar .ol-control.ol-text-button {
  font-size: 0.9em;
  border-left: 1px solid rgba(0, 60, 136, 0.8);
  border-radius: 0;
}
.ol-control.ol-control-custom-bar .ol-control.ol-text-button:first-child {
  border-left: 0;
}
.ol-control.ol-control-custom-bar .ol-control.ol-text-button button {
  padding: 0 0.3em;
  font-weight: normal;
  height: 1.4em;
}
.ol-control.ol-control-custom-bar .ol-control.ol-text-button button:hover {
  color: rgba(0, 60, 136, 1);
}

.ol-control.ol-control-custom-bar.ol-bottom .ol-option-bar {
  top: auto;
  bottom: 100%;
}
.ol-control.ol-control-custom-bar.ol-bottom .ol-option-bar:before {
  border-color: rgba(0, 60, 136, 0.5) transparent transparent ;
  bottom: auto;
  top: 100%;
}

.ol-control.ol-control-custom-bar.ol-left .ol-option-bar {
  left: 100%;
  top: 0;
  bottom: auto;
  margin: 0 5px;
}
.ol-control.ol-control-custom-bar.ol-left .ol-option-bar:before {
  border-color: transparent rgba(0, 60, 136, 0.5) transparent transparent;
  bottom: auto;
  right: 100%;
  left: auto;
  top: 0.3em;
}
.ol-control.ol-control-custom-bar.ol-right .ol-option-bar {
  right: 100%;
  left: auto;
  top: 0;
  bottom: auto;
  margin: 0 5px;
}
.ol-control.ol-control-custom-bar.ol-right .ol-option-bar:before {
  border-color: transparent transparent transparent rgba(0, 60, 136, 0.5);
  bottom: auto;
  left: 100%;
  top: 0.3em;
}

.ol-control.ol-control-custom-bar.ol-left .ol-option-bar .ol-option-bar,
.ol-control.ol-control-custom-bar.ol-right .ol-option-bar .ol-option-bar {
  top: 100%;
  bottom: auto;
  left: 0.3em;
  right: auto;
  margin: 5px 0;
}
.ol-control.ol-control-custom-bar.ol-right .ol-option-bar .ol-option-bar {
  right: 0.3em;
  left: auto;
}
.ol-control.ol-control-custom-bar.ol-left .ol-option-bar .ol-option-bar:before,
.ol-control.ol-control-custom-bar.ol-right .ol-option-bar .ol-option-bar:before {
  border-color: transparent transparent rgba(0, 60, 136, 0.5);
  bottom: 100%;
  top: auto;
  left: 0.3em;
  right: auto;
}
.ol-control.ol-control-custom-bar.ol-right .ol-option-bar .ol-option-bar:before {
  right: 0.3em;
  left: auto;
}
</style>
