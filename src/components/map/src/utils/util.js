const typeList = ['Boolean', 'Number', 'String', 'Function', 'Array', 'Date', 'RegExp', 'Object', 'Error', 'Symbol'];
let class2type = {};
let toString = class2type.toString;
typeList.forEach(name => {
  class2type[`[object ${name}]`] = name;
});

export const isEmptyObject = function (obj) {
  for (let name in obj) {
    return false;
  }
  return true;
};

export const getDataType = data => {
  return class2type[toString.call(data)];
};

export const getParent = $component => ($component.$options.name !== 'OlMap') ? getParent($component.$parent) : $component;
