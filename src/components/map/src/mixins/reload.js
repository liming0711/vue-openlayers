import { isEmptyObject, getDataType } from '../utils/util';

export default {
  watch: {
    // data 发生改变时先检测以当前 vid 为 id 的图层是否存在，
    // 再检测传递过来的数据是否有效，
    // 如果无效，根据 noDataMode 进行操作，
    // 如果有效且以当前 vid 为 id 的图层已经存在，则直接使用 setSource 替换数据，可以减小开销并有效防止图层闪烁，若图层不存在则创建新的图层
    data (newData) {
      let existLayer = this._getLayerByParam('id', this.vid);
      if (!this._isValidData(newData)) {
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
    _getLayerByParam (key, value) {
      let allLayers = this.map.getLayers().getArray();
      for (let i = allLayers.length - 1; i >= 0; i--) {
        if (allLayers[i].get(key) === value) {
          return allLayers[i];
        }
      }
      return false;
    },
    _isValidData (data) {
      let type = getDataType(data);
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
    }
  }
};
