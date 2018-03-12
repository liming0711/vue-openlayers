export const getParent = $component => ($component.$options.name !== 'OlMap') ? getParent($component.$parent) : $component;

export const getSingleFeature = (feature) => {
  if (!feature) { return feature; }
  let features = feature.get('features');
  return features ? features[0] : feature;
};
