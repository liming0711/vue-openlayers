import Button from '../../controls/constructor/control';
// import ready from '../ready';
import { getParent } from '../../utils/util';

export default {
  render () { return false; },
  // mixins: [ready],
  data () {
    return {
      addToBar: false,
      control: null
    };
  },
  mounted () {
    if (this.$parent.$options.name === 'OlControlBar') {
      this.addToBar = true;
      this._load();
    } else {
      this.addToBar = false;
      const map = getParent(this.$parent).map;
      map ? this.ready() : this.$parent.$on('ready', this.ready);
    }
  },
  methods: {
    ready () {
      this.map = this.$parent.map;
      this._load();
    },
    _load () {
      this.control = new Button({
        customClass: this.customClass,
        title: this.title,
        innerHtml: this.innerHtml,
        clickEvent: this._handleClick
      });

      if (this.addToBar) {
        this.$parent._checkChildrenCount();
      } else {
        this.map.addControl(this.control);
      }
    }
  }
};
