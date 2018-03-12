<template>
  <div class="ol-control-custom-subbar-wrapper" :class="customClass">
    <button
      class="ol-control-custom-button"
      :class="{
        'ol-control-custom-disable': disable,
        'ol-control-custom-active': !disable && isActive
      }"
      @click.stop.prevent="_handleSubbarClick">{{innerHtml}}</button>
    <transition
      @before-enter="_beforeEnter"
      @enter="_enter"
      @leave="_leave">
      <div v-show="isActive" class="ol-control ol-control-custom-subbar" :style="subbarStyle" ref="subbar">
        <slot></slot>
      </div>
    </transition>
  </div>
</template>
<script>
import Constructor from './constructor';
import bar from '../mixins/control/bar';
import animations from 'create-keyframe-animation';

animations.registerAnimation({
  name: 'fade-in',
  animation: [{ opacity: 0 }, { opacity: 1 }],
  presets: { duration: 400 }
});
animations.registerAnimation({
  name: 'fade-out',
  animation: [{ opacity: 1 }, { opacity: 0 }],
  presets: { duration: 400 }
});
let subbarIndex = 0;

export default {
  name: 'OlControlSubbar',
  componentName: 'OlControlSubbar',
  mixins: [bar],
  props: {
    unique: Boolean, // 是否能同时打开多个子选项
    customClass: String,
    innerHtml: String,
    active: Boolean,
    disable: Boolean,
    hover: Boolean // 是否支持 hover 时打开 subbar
  },
  data () {
    return {
      subbar: null,
      isActive: this.active,
      subbarStyle: {
        left: 0
      }
    };
  },
  mounted () {
    let $parent = this.isNested ? this.parentBar : this.rootBar;
    $parent.$on('bar-ready', () => {
      this.map = $parent.map;
      this.subbarStyle.left = `-${this.$children.length * 25 / 2 - this.$children.length * 2 - 4}px`;
      $parent._addSubbar(this._getSubbar());
      this.$emit('bar-ready');
    });
  },
  watch: {
    active (n) {
      if (this.isActive !== n) {
        this.isActive = n;
      }
    }
  },
  methods: {
    _getSubbar () {
      subbarIndex++;
      this.subbar = new Constructor({
        element: this.$el,
        properties: {
          type: 'subbar',
          name: `subbar${subbarIndex}`
        }
      });
      return this.subbar;
    },
    _handleSubbarClick () {
      if (this.disable) { return false; }
      this.isActive = !this.isActive;
    },
    _addButton (button) {
      button.set('parentName', this.subbar.get('name'));
      button.set('subbar-unique', this.unique);
      this._addControl(button);
    },
    _addSubbar (subbar) {
      this._addControl(subbar);
    },
    _addControl (ctrl) {
      ctrl.setTarget(this.$refs.subbar);
      if (this.map) {
        this.map.addControl(ctrl);
      }
    },
    _beforeEnter (el) {
      el.style.opacity = 0;
    },
    _enter (el, done) {
      animations.runAnimation(el, 'fade-in', done);
    },
    _leave (el, done) {
      animations.runAnimation(el, 'fade-out', done);
    }
  }
};
</script>
