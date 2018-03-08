<template>
  <div><slot></slot></div>
</template>
<script>
import Toggle from './constructor/Toggle';
import ready from '../mixins/ready';

export default {
  name: 'OlControlToggle',
  render () { return false; },
  mixins: [ready],
  props: {
    /**
     * @param {Bar} bar a subbar associated with the toggle (drawn when active if toggle is nested in a ol.control.Bar)
     */
    title: String,
    customClass: String,
    innerHtml: String,
    interaction: Object, // interaction associated with the control
    bar: Object, // a subbar associated with the control (drawn when active if control is nested in a ol.control.Bar)
    active: Boolean, // the control is created active, default false
    disable: Boolean, // the control is created disabled, default false  TODO
    autoActive: Boolean, // the control will activate when shown in an ol.control.Bar, default false
    onToggle: Function // callback when control is clicked (or use change:active event)
  },
  data () {
    return {
      control: null,
      targetBar: null
    };
  },
  methods: {
    _load () {
      this.control = new Toggle({
        customClass: this.customClass,
        title: this.title,
        innerHtml: this.innerHtml,
        interaction: this.interaction,
        active: this.active,
        disable: this.disable,
        autoActive: this.autoActive,
        onToggle: this.onToggle
      });

      if (this.$parent.$options.name === 'OlControlBar') {
        this.$parent._checkChildrenCount();
      } else {
        this.map.addControl(this.control);
      }
    }
  }
};
</script>
