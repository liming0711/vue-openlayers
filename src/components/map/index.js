import OlMap from './src/map';
import overlays from './src/overlays';
import layers from './src/layers';

function install (Vue, options) {
  Vue.component('OlMap', OlMap);
  Object.keys(overlays).forEach((key) => {
    Vue.component(overlays[key].name, overlays[key]);
  });
  Object.keys(layers).forEach((key) => {
    Vue.component(layers[key].name, layers[key]);
  });
}

export default install;
