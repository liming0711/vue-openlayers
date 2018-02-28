<template>
  <div id="app">
    <ol-map
      ref="map"
      class="map-container"
      :zoom="5"
      :XYZ="'http://map.geoq.cn/ArcGIS/rest/services/ChinaOnlineStreetPurplishBlue/MapServer/tile/{z}/{y}/{x}'"
      @singleclick="handleMapSingleClick"
      @pointerdrag="handleMapPointerdrag"
      @pointermove="handleMapPointermove">
      <ol-marker
        :data="fire"
        :vid="'fire'"
        :bgImg="'./static/images/location.png'"
        cluster
        @enter="handleStationHoverEnter"
        @leave="handleStationHoverLeave"
        @click="handleStationClick"
        @singleclick="handleStationSingleclick"
        @dblclick="handleStationDblclick">
      </ol-marker>
      <ol-marker
        :data="humidity"
        :vid="'humidity'"
        :offset="[25, 15]"
        :bgImg="'./static/images/station.png'"
        cluster
        @enter="handleHumidityHoverEnter"
        @leave="handleHumidityHoverLeave"
        @singleclick="handleHumiditySingleclick">
      </ol-marker>
      <ol-text
        :data="stationName"
        :vid="'stationName'"
        cluster
        :distance="50"
        @enter="handleNameHoverEnter"
        @leave="handleNameHoverLeave"
        @singleclick="handleNameSingleclick">
      </ol-text>
      <ol-vector
        :data="press"
        :vid="'press'"
        @enter="handleVectorEnter"
        @leave="handleVectorLeave"
        @singleclick="handleVectorSingleclick">
      </ol-vector>
      <ol-draw
        :type="drawType"
        :vid="'draw'"
        @enter="handleDrawEnter"
        @leave="handleDrawLeave"
        @singleclick="handleDrawSingleclick"
        @drawstart="handleDrawDrawstart"
        @drawend="handleDrawDrawend"
        ref="draw">
      </ol-draw>
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
      画图类型: {{this.drawType || 'NO'}}
      <select name="drawSides" @change="setDrawType" ref="type">
        <option>undefined</option>
        <option value="">空字符串</option>
        <option value="Square">Square</option>
        <option value="Rectangle">Rectangle</option>
        <option value="Circle">Circle</option>
        <option value="Point">Point</option>
        <option value="LineString">LineString</option>
        <option value="Polygon">Polygon</option>
        <option value="Ellipse">Ellipse</option>
      </select>
      <button @click="clearDrawSource">清空画板</button>
    </div>
    <div class="lonlat">经纬度：{{ lonlat }}
      <div id="test"></div>
    </div>
  </div>
</template>

<script>
import Element from './api/element';

export default {
  name: 'App',
  data () {
    return {
      lonlat: '',
      drawType: null,
      fire: [],
      stationName: [],
      humidity: [],
      press: {}
    };
  },
  created () {
    this.getFire();
  },
  methods: {
    getRandomColor () {
      var color = '#';
      for (var i = 0; i < 6; i++) {
        color += (Math.random() * 16 | 0).toString(16);
      }
      return color;
    },
    handleMapSingleClick (val) {
      console.log('handleMapSingleClick in App', val);
    },
    getHumidity () {
      Element.getHumidity().then(res => {
        res.data.detail.forEach(val => {
          if (val.rh < 999999) {
            val.text = val.rh;
            val.bgColor = this.getRandomColor();
            this.humidity.push(val);
          }
        });
        console.log('=== getHumidity (Marker) ===', res, this.humidity);
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
          val.textColor = this.getRandomColor();
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
        this.press = res.data.detail.datas;
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
      this.lonlat = this.$refs.map.getLonlat(val.coordinate).join(', ');
    },
    setDrawType () {
      this.drawType = this.$refs.type.value;
    },
    clearDrawSource () {
      this.$refs.draw.clearDrawSource();
    },
    handleHumidityHoverEnter (val) {
      console.log(' ----------- hover enter humidity --------->', val);
    },
    handleHumidityHoverLeave (val) {
      console.log(' ----------- hover leave humidity --------->', val);
    },
    handleHumiditySingleclick (val) {
      console.log(' ----------- singleclick humidity --------->', val);
    },
    handleVectorSingleclick (val) {
      console.log(' ----------- singleclick vector --------->', val);
    },
    handleVectorEnter (val) {
      console.log(' ----------- hover enter vector --------->', val);
    },
    handleVectorLeave (val) {
      console.log(' ----------- hover leave vector --------->', val);
    },
    handleDrawSingleclick (val) {
      console.log(' ----------- singleclick draw --------->', val);
    },
    handleDrawEnter (val) {
      console.log(' ----------- hover enter draw --------->', val);
    },
    handleDrawLeave (val) {
      console.log(' ----------- hover leave draw --------->', val);
    },
    handleDrawDrawstart (val) {
      console.log(' ----------- drawstart draw --------->', val);
    },
    handleDrawDrawend (val) {
      console.log(' ----------- drawend draw --------->', val);
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
