function dispatch (componentName, eventName, params) {
  var parent = this.$parent || this.$root;
  var name = parent.$options.componentName;
  console.log('------------ 444 -------->', parent);

  while (parent && (!name || name !== componentName)) {
    parent = parent.$parent;

    if (parent) {
      name = parent.$options.componentName;
    }
  }
  if (parent) {
    parent.$emit.apply(parent, [eventName].concat(params));
  }
};

export default dispatch;
