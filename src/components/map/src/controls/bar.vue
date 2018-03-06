<template>
  <div><slot></slot></div>
</template>

<script>
import Bar from './constructor/bar';
import ready from '../mixins/ready';
import { getParent } from '../utils/util';

export default {
  name: 'OlControlBar',
  componentName: 'OlControlBar',
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
        console.log(' -------555 ----->', this.$children);
        this._load();
      }
    }
  },
  mounted () {
    this.childrenNum = this.$children.length;
    const map = getParent(this.$parent).map;
    map ? this.ready() : this.$parent.$on('ready', this.ready);
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
<style scoped>

</style>
