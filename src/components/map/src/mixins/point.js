/**
 * 用于渲染 Marker 和 Text
 * 因为 Marer 和 Text 都是 point 类型，切数据格式都是 Array
 * 只有 style 不一样，需要单独设置
 */
export default {
  methods: {
    load () {
      if (!this.data.length) { return false; }
      this.render('point', this._getSource(this._getFeatures()));
    },
    _getFeatures () {
      let feature;
      let features = [];

      this.data.forEach(val => {
        feature = new this.ol.Feature(new this.ol.geom.Point([+val.lon, +val.lat]).transform('EPSG:4326', 'EPSG:3857'));
        feature.attr = val;
        feature.set('attr', val);
        feature.set('vid', this.vid);
        feature.setStyle(this._getStyle(val));
        features.push(feature);
      });

      return features;
    },
    _getSource (features) {
      let source;
      if (this.cluster) {
        source = new this.ol.source.Cluster({
          distance: this.distance,
          source: new this.ol.source.Vector({
            features: features
          })
        });
      } else {
        source = new this.ol.source.Vector({features: features});
      }
      return source;
    }
  }
};
