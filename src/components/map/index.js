import OlMap from './src/map';
import overlays from './src/overlays';
import layers from './src/layers';
import controls from './src/controls';

function install (Vue, options) {
  Vue.component('OlMap', OlMap);
  Object.keys(overlays).forEach((key) => {
    Vue.component(overlays[key].name, overlays[key]);
  });
  Object.keys(layers).forEach((key) => {
    Vue.component(layers[key].name, layers[key]);
  });
  Object.keys(controls).forEach((key) => {
    Vue.component(controls[key].name, controls[key]);
  });
}

export default install;
