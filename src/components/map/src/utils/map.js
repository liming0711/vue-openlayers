export const getSingleFeature = (feature) => {
  if (!feature) { return feature; }
  let features = feature.get('features');
  return features ? features[0] : feature;
};
