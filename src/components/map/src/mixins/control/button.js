import Button from '../../controls/constructor/Button';
import ready from '../ready';

export default {
  render () { return false; },
  mixins: [ready],
  data () {
    return {
      control: null
    };
  },
  methods: {
    _load () {
      this.control = new Button({
        customClass: this.customClass,
        title: this.title,
        innerHtml: this.innerHtml,
        clickEvent: this._handleClick
      });

      if (this.$parent.$options.name === 'OlControlBar') {
        this.$parent._checkChildrenCount();
      } else {
        this.map.addControl(this.control);
      }
    }
  }
};
