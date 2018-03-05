export default {
  beforeDestroy () {
    this.map && this.layer && this.map.removeLayer(this.layer);
  }
};
