import { isEmptyObject, getType } from '../utils/util';
const getParent = $component => $component.abstract ? getParent($component.$parent) : $component;

export default {
  mounted () {
    const map = getParent(this.$parent).map;
    map ? this.ready() : this.$parent.$on('ready', this.ready);
  },
  watch: {
    // data 发生改变时先检测以当前 vid 为 id 的图层是否存在，
    // 再检测传递过来的数据是否有效，
    // 如果无效，根据 noDataMode 进行操作，
    // 如果有效且以当前 vid 为 id 的图层已经存在，则直接使用 setSource 替换数据，可以减小开销并有效防止图层闪烁，若图层不存在则创建新的图层
    data (newData) {
      let existLayer = this.getLayerByParam('id', this.vid);
      if (!this.isValidData(newData)) {
        if (this.noDataMode === 'clean') {
          existLayer && this.map.removeLayer(existLayer);
        }
        return false;
      }

      if (existLayer) {
        existLayer.setSource(this._getSource(this._getFeatures()));
      } else {
        this.load();
      }
    }
  },
  methods: {
    ready () {
      this.map = this.$parent.map;
      this.ol = this.$parent.ol;
      this.load();
    },
    reload () {
      // 1
    },
    // TODO 当寻找的东西有多个的时候也可以返回一个数组
    getLayerByParam (key, value) {
      let allLayers = this.map.getLayers().getArray();
      for (let i = allLayers.length - 1; i >= 0; i--) {
        if (allLayers[i].get(key) === value) {
          return allLayers[i];
        }
      }
      return false;
    },
    isValidData (data) {
      let type = getType(data);
      // 目前（2018/03/01）overlays 接受的数据类型只有 Object、Array 和 String 三种
      // 如果有更多数据类型则需要扩展
      switch (type) {
        case 'Object':
          return !isEmptyObject(data);
        case 'Array':
        case 'String':
          return !!data.length;
        default:
          return false;
      }
    },
    unload () {
      console.log('unload', this.unique, this.map);
    }
  },
  beforeDestroy () {
    this.unload();
  }
};
