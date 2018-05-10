import { isEmptyObject, getDataType } from './util';

const getLayerByParam = (key, value, list) => {
  for (let i = list.length - 1; i >= 0; i--) {
    if (list[i].get(key) === value) {
      return list[i];
    }
  }
  return false;
};

export const getSingleFeature = (feature) => {
  if (!feature) { return feature; }
  let features = feature.get('features');
  return features ? features[0] : feature;
};

export const getLayerById = (value, list) => {
  return getLayerByParam('id', value, list);
};

// 检测地图子组件通过 props 接收的数据是否有效
export const isValidData = (data) => {
  // 目前（2018/03/01）overlays 和 layers 接受的数据类型只有 Object、Array 和 String 三种
  // 如果有更多数据类型则需要扩展
  switch (getDataType(data)) {
    case 'Object':
      return !isEmptyObject(data);
    case 'Array':
    case 'String':
      return !!data.length;
    default:
      return false;
  }
};
