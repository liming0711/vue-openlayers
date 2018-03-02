import feature from './feature';
export default {
  data () {
    return {
      layer: null
    };
  },
  mixins: [feature],
  methods: {
    render (type, source) {
      this.layer = new this.ol.layer.Vector({
        id: this.vid,
        name: this.name,
        type: type,
        massClear: this.massClear,
        source: source,
        opacity: this.opacity,
        style: feature => { return this._getSingleFeature(feature).getStyle(); },
        zIndex: this.zIndex
      });
      this.map.addLayer(this.layer);
    }
  }
};
