import { getLayerById, isValidData } from '../../utils/map';

export default {
  watch: {
    // data 发生改变时先检测以当前 vid 为 id 的图层是否存在，
    // 再检测传递过来的数据是否有效，
    // 如果无效，根据 noDataMode 进行操作，
    // 如果有效且以当前 vid 为 id 的图层已经存在，则直接使用 setSource 替换数据，可以减小开销并有效防止图层闪烁，若图层不存在则创建新的图层
    data (newData) {
      let existLayer = getLayerById(this.vid, this.map.getLayers().getArray());
      if (!isValidData(newData)) {
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
        existLayer.setSource(this._getSource(this._getFeatures(newData)));
        existLayer.setOpacity(this.opacity);
      } else {
        this._load();
      }
    },
    opacity (newOpacity) {
      this.layer && this.layer.setOpacity(Math.abs(newOpacity));
    }
  }
};
