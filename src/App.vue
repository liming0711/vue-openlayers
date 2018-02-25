<template>
  <div id="app">
    <ol-map
      ref="map"
      class="map-container"
      :zoom="5"
      :XYZ="'http://map.geoq.cn/ArcGIS/rest/services/ChinaOnlineStreetPurplishBlue/MapServer/tile/{z}/{y}/{x}'"
      :drawProperties="drawProperties"
      @singleclick="handleMapSingleClick"
      @pointerdrag="handleMapPointerdrag"
      @pointermove="handleMapPointermove">
      <ol-marker
        :markers="fire"
        :vid="'fire'"
        :bgImg="'./static/images/location.png'"
        cluster
        @enter="handleStationHoverEnter"
        @leave="handleStationHoverLeave"
        @click="handleStationClick"
        @singleclick="handleStationSingleclick"
        @dblclick="handleStationDblclick">
      </ol-marker>
      <ol-text
        cluster
        :distance="50"
        :data="stationName"
        :vid="'stationName'"
        @enter="handleNameHoverEnter"
        @leave="handleNameHoverLeave"
        @singleclick="handleNameSingleclick"></ol-text>
    </ol-map>
    <div class="menu">
      <button @click="getHumidity">湿度（Marker）</button>
      <button @click="getFire">火点🔥（Marker）</button>
      <button @click="getWind">风（Marker）</button>
      <button @click="getStationName">站名（Text）</button>
      <button @click="getRailway">铁路（Line）</button>
      <button @click="getVector">等压面（Vector）</button>
      <button @click="getRadar">雷达（Image）</button>
      <button @click="testSetSource">测试 setSource</button>
    </div>
    <div class="menu2">
      画图边数 {{this.drawProperties ? '开' : '关'}}：
      <select name="drawSides" @change="setDrawSides" ref="sides">
        <option>undefined</option>
        <option value="0">0</option>
        <option value="1">1</option>
        <option value="2">2</option>
        <option value="3">3</option>
        <option value="4">4</option>
        <option value="5">5</option>
      </select>
      <button @click="clearDrawSource">清空画板</button>
    </div>
    <div class="lonlat">经纬度：{{ lonlat }}</div>
  </div>
</template>

<script>
import Element from './api/element';

export default {
  name: 'App',
  data () {
    return {
      lonlat: '',
      drawProperties: 0,
      fire: [],
      stationName: []
    };
  },
  created () {
    this.getFire();
  },
  methods: {
    handleMapSingleClick (val) {
      console.log('handleMapSingleClick in App', val);
    },
    getHumidity () {
      Element.getHumidity().then(res => {
        console.log('=== getHumidity (Marker) ===', res);
      });
    },
    getFire () {
      Element.getFire().then(res => {
        console.log('=== getFire (Marker) ===', res);
        res.forEach(val => {
          this.fire.push({
            lon: val.geometry.coordinates[0],
            lat: val.geometry.coordinates[1],
            properties: val.properties
          });
        });
      });
    },
    getWind () {
      Element.getWind().then(res => {
        console.log('=== getWind (Marker) ===', res);
      });
    },
    getStationName () {
      Element.getStationName().then(res => {
        console.log('=== getStationName (Text) ===', res);
        res.data.detail.forEach(val => {
          val.text = val.sta_name;
          val.textColor = '#' + Math.floor(Math.random() * 16777215).toString(16);
        });
        this.stationName = res.data.detail;
      });
    },
    getRailway () {
      Element.getRailway().then(res => {
        console.log('=== getRailway (Line) ===', res);
      });
    },
    getVector () {
      Element.getVector().then(res => {
        console.log('=== getVector (Vector) ===', res);
      });
    },
    getRadar () {
      Element.getRadar().then(res => {
        console.log('=== getRadar (Image) ===', res);
      });
    },
    testSetSource () {
      this.fire = [
        { lon: 117.799963, lat: 39.013260, text: '东疆港沙滩', bgImg: './static/images/location.png' },
        { lon: 117.712072, lat: 39.141190, text: '天津科技大学体育馆' },
        { lon: 117.563756, lat: 38.906475, text: '大港体育馆' }
      ];
    },
    handleStationHoverEnter (val) {
      console.log('======== hover enter fire in App ======>', val);
    },
    handleStationHoverLeave (val) {
      console.log('======== hover leave fire in App ======>', val);
    },
    handleStationClick (val) {
      console.log('======== click fire in App ======>', val);
    },
    handleStationSingleclick (val) {
      console.log('======== singleclick fire in App ======>', val);
    },
    handleStationDblclick (val) {
      console.log('======== dblclick fire in App ======>', val);
    },
    handleNameHoverEnter (val) {
      console.log('======== hover enter name in App ======>', val);
    },
    handleNameHoverLeave (val) {
      console.log('======== hover leave name in App ======>', val);
    },
    handleNameSingleclick (val) {
      console.log('======== singleclick name in App ======>', val);
    },
    handleMapPointerdrag (val) {
      // console.log('======== pointerdrag map in App ======>', val);
    },
    handleMapPointermove (val) {
      this.lonlat = val.lonlat.join(', ');
    },
    setDrawSides () {
      console.log('----------->', this.$refs.sides.value, +this.$refs.sides.value);
      this.drawProperties = +this.$refs.sides.value;
    },
    clearDrawSource () {
      this.$refs.map.clearDrawSource();
    }
  }
};
</script>

<style>
html, body {
  height: 100%;
}
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  width: 100%;
  height: 100%;
}
.map-container {
  width: 100%;
  height: 100%;
}
.menu {
  position: absolute;
  left: 20px;
  bottom: 20px;
  background-color: #ccc;
  padding: 10px;
  border-radius: 4px;
}
.menu2 {
  position: absolute;
  left: 20px;
  bottom: 70px;
  background-color: #ccc;
  padding: 10px;
  border-radius: 4px;
}
.lonlat {
  position: absolute;
  top: 0;
  right: 0;
  padding: 5px 10px;
  border-radius: 0 0 0 4px;
  background-color: #fff;
}
</style>
