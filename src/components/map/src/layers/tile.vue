<script>
import ready from '../mixins/ready';
import beforeDestroy from '../mixins/beforeDestroy';
import { getLayerById, isValidData } from '../utils/map';
import { getDataType } from '../utils/util';

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
      this._changeLayer(newXYZ);
    },
    source (newSource) {
      this._changeLayer(newSource);
    },
    opacity (newOpacity) {
      this.layer && this.layer.setOpacity(Math.abs(newOpacity));
    }
  },
  methods: {
    _load () {
      if (!this.source && !this.XYZ.length) { return false; }
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
    },
    _changeLayer (content) {
      let existLayer = getLayerById(this.vid, this.map.getLayers().getArray());
      if (!isValidData(content)) {
        switch (this.noDataMode) {
          case 'clean':
            existLayer && this.map.removeLayer(existLayer);
            break;
          case 'hidden':
            existLayer && existLayer.setOpacity(0);
            break;
          case 'keep':
          default:
            break;
        }
        return false;
      }

      if (existLayer) {
        let type = getDataType(content);
        if (type === 'String') {
          this.sourceObj.setUrl(content);
        } else if (type === 'Object') {
          existLayer.setSource(content);
        }
        existLayer.setOpacity(this.opacity);
      } else {
        this._load();
      }
    }
  }
};
</script>
