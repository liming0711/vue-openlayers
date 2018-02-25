import OlMap from './src/map';
import overlays from './src/overlays';

function install (Vue, options) {
  Vue.component('OlMap', OlMap);
  Object.keys(overlays).forEach((key) => {
    Vue.component(overlays[key].name, overlays[key]);
  });
}

export default install;
