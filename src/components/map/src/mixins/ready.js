import { getParent } from '../utils/util';

export default {
  mounted () {
    const map = getParent(this.$parent).map;
    map ? this.ready() : this.$parent.$on('ready', this.ready);
  },
  methods: {
    ready () {
      this.map = this.$parent.map;
      this.ol = this.$parent.ol;
      this._load();
    }
  }
};
