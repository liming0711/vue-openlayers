<script>
import common from '../mixins/common';

const TYPE = 'tile';
const defaultXYZ = 'http://map.geoq.cn/ArcGIS/rest/services/ChinaOnlineStreetPurplishBlue/MapServer/tile/{z}/{y}/{x}';

export default {
  name: 'OlTile',
  render () { return false; },
  mixins: [common],
  props: {
    XYZ: {
      type: String,
      default: defaultXYZ
    },
    // 使用 ol.source.TileWMS 实例化一个 source，e.g：
    // new ol.source.TileWMS({
    //   url: 'http://ngrok.91weather.com:17713/geoserver/Mlog/wms',
    //   params: {
    //     'LAYERS': 'tianjin1-14-final',
    //     'TILED': true
    //   }
    // });
    source: Object,
    opacity: {
      type: Number,
      default: 1
    },
    zIndex: {
      type: Number,
      default: 0
    },
    massClear: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      layer: null,
      sourceObj: null
    };
  },
  watch: {
    XYZ (newUrl) {
      this.sourceObj && this.sourceObj.setUrl(newUrl);
    },
    source (newSource) {
      this.layer && this.layer.setSource(newSource);
    },
    opacity (newOpacity) {
      this.layer && this.layer.setOpacity(newOpacity);
    }
  },
  methods: {
    _load () {
      this.sourceObj = this.source || new this.ol.source.XYZ({
        url: this.XYZ.length ? this.XYZ : defaultXYZ
      });
      this.layer = new this.ol.layer.Tile({
        id: this.vid,
        name: this.name,
        type: TYPE,
        massClear: this.massClear,
        source: this.sourceObj,
        opacity: this.opacity,
        zIndex: 1
      });

      this.map.addLayer(this.layer);
    }
  }
};
</script>
