import Vue from 'vue';
import App from './App';

import openlayers from '@/components/map';
Vue.use(openlayers);

Vue.config.productionTip = false;

/* eslint-disable no-new */
new Vue({
  el: '#app',
  render: h => h(App)
});
