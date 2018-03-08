<script>
import ready from '../mixins/ready';
import reload from '../mixins/reload';
import beforeDestroy from '../mixins/beforeDestroy';

const TYPE = 'image';

export default {
  name: 'OlImage',
  render () { return false; },
  mixins: [ready, reload, beforeDestroy],
  props: {
    vid: {
      type: String,
      required: true
    },
    name: String,
    data: {
      type: String,
      required: true
    },
    bbox: {
      type: Array,
      required: true
    },
    noDataMode: {
      type: String,
      default: 'clean',
      validator: function (value) {
        return ['clean', 'keep'].indexOf(value) > -1;
      }
    },
    opacity: {
      type: Number,
      default: 1
    },
    zIndex: {
      type: Number,
      default: 4
    },
    massClear: {
      type: Boolean,
      default: true
    }
  },
  methods: {
    _load () {
      if (!this.data.length) { return false; }
      this.layer = new this.ol.layer.Image({
        id: this.vid,
        name: this.name,
        type: TYPE,
        massClear: this.massClear || true,
        source: this._getSource(this._getFeatures(this.data)),
        opacity: this.opacity,
        zIndex: 1
      });
      this.$parent.map.addLayer(this.layer);
    },
    _getFeatures (data) {
      return data;
    },
    _getSource (image) {
      return new this.ol.source.ImageStatic({
        url: image,
        imageExtent: this.ol.proj.transformExtent(this.bbox, 'EPSG:4326', 'EPSG:3857')
      });
    }
  }
};
</script>
