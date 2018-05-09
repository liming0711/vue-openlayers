export default {
  inject: ['mapComponent'],
  mounted () {
    this.mapComponent.map ? this.ready() : this.mapComponent.$on('ready', this.ready);
  },
  methods: {
    ready () {
      this.map = this.mapComponent.map;
      this.ol = this.mapComponent.ol;
      this._load();
    }
  }
};
