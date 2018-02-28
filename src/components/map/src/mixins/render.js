import feature from './feature';
export default {
  mixins: [feature],
  methods: {
    render (type, source) {
      this.layer = new this.ol.layer.Vector({
        id: this.vid,
        name: this.name,
        type: type,
        source: source,
        style: feature => { return this._getSingleFeature(feature).getStyle(); },
        zIndex: this.zIndex
      });
      this.map.addLayer(this.layer);
    }
  }
};
