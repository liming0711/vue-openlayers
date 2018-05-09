<script>
import ready from '../mixins/ready';
import beforeDestroy from '../mixins/beforeDestroy';

const TYPE = 'tile';
const defaultXYZ = 'http://map.geoq.cn/ArcGIS/rest/services/ChinaOnlineStreetPurplishBlue/MapServer/tile/{z}/{y}/{x}';

export default {
  name: 'OlTile',
  render () { return false; },
  mixins: [ready, beforeDestroy],
  props: {
    vid: {
      type: String,
      required: true
    },
    name: String,
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
    // data 没有数据时的配置参数：
    // clean：清除该图层后直接返回
    // keep：不清除图层保持原样直接返回
    // hidden: 不清除图层，但是将图层的 opacity 设置为0
    noDataMode: {
      type: String,
      default: 'hidden',
      validator: function (value) {
        return ['clean', 'keep', 'hidden'].indexOf(value) > -1;
      }
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
    XYZ (newXYZ) {
      console.log(' ---------- XYZ --------', newXYZ);

      // let existLayer = this._getLayerByParam('id', this.vid);
      // if (!this._isValidData(newData)) {
      //   switch (this.noDataMode) {
      //     case 'clean':
      //       existLayer && this.map.removeLayer(existLayer);
      //       break;
      //     case 'hidden':
      //       this.opacity = 0;
      //       break;
      //     case 'keep':
      //     default:
      //       break;
      //   }
      //   return false;
      // }

      // if (existLayer) {
      //   existLayer.setSource(this._getSource(this._getFeatures(newData)));
      // } else {
      //   this._load();
      // }

      if (!newXYZ.length) {
        this.layer && this.layer.setOpacity(0);
      } else {
        this.sourceObj && this.sourceObj.setUrl(newXYZ);
        this.layer && this.layer.setOpacity(1);
      }
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
        url: this.XYZ
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
