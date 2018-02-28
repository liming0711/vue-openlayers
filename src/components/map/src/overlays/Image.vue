<script>
// TODO 添加点击事件和悬停事件
// TODO 支持 zIndex 自定制
import common from '../mixins/common';

export default {
  name: 'OlImage',
  mixins: [common],
  props: {
    vid: {
      type: String,
      required: true
    },
    name: {
      type: String,
      default: 'image'
    },
    imgURL: {
      type: String,
      required: true
    },
    bbox: {
      type: Array,
      required: true
    },
    opacity: {
      type: Number,
      default: 0.8
    },
    clicking: {
      type: Boolean,
      default: false
    },
    hovering: {
      type: Boolean,
      default: false
    },
    stopEvent: {
      type: Boolean,
      default: false
    },
    massClear: {
      type: Boolean,
      default: true
    }
  },
  watch: {
    imgURL () {
      this.load();
    },
    opacity () {
      let imageLayer = this.getLayerByParam('id', this.vid);
      if (!this.imgURL || !this.imgURL.length) {
        return false;
      }
      imageLayer.setOpacity(this.opacity);
    }
  },
  methods: {
    load () {
      console.log('in image vue', this.imgURL);

      let imageLayer = this.getLayerByParam('id', this.vid);

      if (!this.imgURL || !this.imgURL.length) {
        imageLayer && this.map.removeLayer(imageLayer);
        return false;
      }

      if (imageLayer) {
        let layerSource = new this.ol.source.ImageStatic({
          url: this.imgURL,
          imageExtent: this.ol.proj.transformExtent(this.bbox, 'EPSG:4326', 'EPSG:3857')
        });

        imageLayer.setSource(layerSource);
      } else {
        this.layer = new this.ol.layer.Image({
          id: this.vid,
          name: this.name,
          type: 'image',
          source: new this.ol.source.ImageStatic({
            url: this.imgURL,
            imageExtent: this.ol.proj.transformExtent(this.bbox, 'EPSG:4326', 'EPSG:3857')
          }),
          opacity: this.opacity,
          zIndex: 1
        });
        this.$parent.map.addLayer(this.layer);
      }
    }
  }
};
</script>
