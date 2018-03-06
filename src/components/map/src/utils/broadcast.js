function broadcast (layerId, eventName, params) {
  this.$children.forEach(child => {
    var id = child.$options.propsData.vid;
    if (id === layerId) {
      child.$emit.apply(child, [eventName].concat(params));
    } else {
      broadcast.apply(child, [layerId, eventName].concat([params]));
    }
  });
};

export default broadcast;
