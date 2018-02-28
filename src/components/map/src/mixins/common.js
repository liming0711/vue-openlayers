const getParent = $component => $component.abstract ? getParent($component.$parent) : $component;

export default {
  mounted () {
    const map = getParent(this.$parent).map;
    map ? this.ready() : this.$parent.$on('ready', this.ready);
  },
  methods: {
    ready () {
      this.map = this.$parent.map;
      this.ol = this.$parent.ol;
      this.load();
    }
  },
  beforeDestroy () {
    this.map.removeLayer(this.layer);
  }
};
