import { getParent } from '../utils/util';

export default {
  mounted () {
    const $parent = getParent(this.$parent);
    const map = $parent.map;
    map ? this.ready() : $parent.$on('ready', this.ready);
  },
  methods: {
    ready () {
      const $parent = getParent(this.$parent);
      this.map = $parent.map;
      this.ol = $parent.ol;
      this.mapComponent = $parent;
      this._load();
    }
  }
};
