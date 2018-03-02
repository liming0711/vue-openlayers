const getParent = $component => $component.abstract ? getParent($component.$parent) : $component;

export default {
  props: {
    vid: {
      type: String,
      required: true
    },
    name: String
  },
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
  },
  beforeDestroy () {
    this.map && this.layer && this.map.removeLayer(this.layer);
    this.map && this.overlay && this.map.removeLayer(this.overlay);
  }
};
