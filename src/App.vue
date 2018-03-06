<template>
  <div id="app">
    <ol-map
      ref="map"
      class="map-container"
      :zoom="zoom"
      :center="center"
      @singleclick="handleMapSingleClick"
      @pointerdrag="handleMapPointerdrag"
      @pointermove="handleMapPointermove">
      <ol-tile :vid="'base'" :XYZ="tileXYZ"></ol-tile>
      <ol-control-bar :customClass="'ol-control-bar-test'">
        <ol-control-button
          :customClass="'ol-control-button-test'"
          :clickEvent="testBarControl">
        </ol-control-button>
        <ol-control-graticule :customClass="'ol-control-graticule'"></ol-control-graticule>
      </ol-control-bar>
      <ol-control-button
        :customClass="'ol-control-button-circle'"
        :title="'画圆'"
        :innerHtml="'圆'"
        :clickEvent="drawControl"></ol-control-button>
      <ol-marker
        :data="fire"
        :vid="'fire'"
        :bgImg="'./static/images/location.png'"
        cluster
        @enter="handleStationHoverEnter"
        @leave="handleStationHoverLeave"
        @singleclick="handleStationSingleclick">
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
      <ol-line
        :data="railway"
        :vid="'railway'"
        @enter="handleLineEnter"
        @leave="handleLineLeave"
        @singleclick="handleLineSingleclick">
      </ol-line>
      <ol-image :data="radarImg" :bbox="radarBbox" :vid="'radar'"></ol-image>
      <ol-draw
        :type="drawType"
        :vid="'draw'"
        :opacity="0.5"
        @enter="handleDrawEnter"
        @leave="handleDrawLeave"
        @singleclick="handleDrawSingleclick"
        @drawstart="handleDrawDrawstart"
        @drawend="handleDrawDrawend"
        ref="draw">
      </ol-draw>
      <ol-overlay :vid="'overlay'" :position="overlayPosition" :title="'overlay title'" :customClass="'custom-overlay'">
        <!-- <img :src="'./static/images/location.png'" slot="marker" style="width: 20px;" /> -->
        <!-- <div slot="marker" style="width: 20px; height: 20px; display: inline-block; background-color: #f00;"></div> -->
        <h3 class="overlay-title" style="color: #F5A623; margin: 0;">pixel: {{ overlayInfoObj.pixel || '-' }}</h3>
        <ul class="overlay-list" style="line-height: 18px;">
          <li class="overlay-item">{{ overlayInfoObj.type || '-' }}</li>
          <li class="overlay-item">{{ overlayInfoObj.coordinate || '-'}}</li>
        </ul>
      </ol-overlay>
    </ol-map>
    <div class="lonlat">经纬度：{{ lonlat }}
      <div id="test"></div>
    </div>
    <div class="menu menu1">
      <button @click="getHumidity">湿度（Marker）</button>
      <button @click="getFire">火点🔥（Marker）</button>
      <button @click="getWind">风（Marker）</button>
      <button @click="getStationName">站名（Text）</button>
      <button @click="getRailway">铁路（Line）</button>
      <button @click="getVector">等压面（Vector）</button>
      <button @click="getRadar">雷达（Image）</button>
      <button @click="testSetSource">测试 setSource</button>
    </div>
    <div class="menu menu2">
      画图类型: {{this.drawType || 'NO'}}
      <select name="drawSides" @change="setDrawType" ref="type">
        <option>undefined</option>
        <option value="">空字符串</option>
        <option value="Square">Square</option>
        <option value="Rectangle">Rectangle</option>
        <option value="Circle">Circle</option>
        <!-- <option value="Point">Point</option> -->
        <option value="LineString">LineString</option>
        <option value="Polygon">Polygon</option>
        <!-- <option value="Ellipse">Ellipse</option> -->
      </select>
      <button @click="clearDrawSource">清空画板</button>
    </div>
    <div class="menu menu3">
      <button @click="switchTile">切换地图</button>
    </div>
    <div class="menu menu4">
      <button @click="clearMapOverlays">清除地图覆盖物</button>
    </div>
    <div class="menu menu5" ref="menu5"></div>
  </div>
</template>

<script>
import Element from './api/element';

const XYZTileList = [
  'http://mt{0-3}.google.cn/vt/lyrs=y&hl=zh-CN&gl=CN&src=app&x={x}&y={y}&z={z}&s=G',
  'http://mt{0-3}.google.cn/vt/lyrs=t@131,r@216000000&hl=zh-CN&gl=CN&src=app&x={x}&y={y}&z={z}&s=Gal',
  'http://mt{0-3}.google.cn/vt/lyrs=m@235000000&hl=zh-CN&gl=CN&src=app&x={x}&y={y}&z={z}&s=Galileo',
  'http://t{0-7}.tianditu.cn/DataServer?T=vec_w&X={x}&Y={y}&L={z}',
  'http://t{0-7}.tianditu.cn/DataServer?T=cia_w&X={x}&Y={y}&L={z}',
  'http://t{0-7}.tianditu.cn/DataServer?T=img_w&X={x}&Y={y}&L={z}',
  'http://t{0-7}.tianditu.cn/DataServer?T=cia_w&X={x}&Y={y}&L={z}',
  'http://webrd0{1-4}.is.autonavi.com/appmaptile?x={x}&y={y}&z={z}&lang=zh_cn&size=1&scale=1&style=8',
  'http://webst0{1-4}.is.autonavi.com/appmaptile?x={x}&y={y}&z={z}&lang=zh_cn&size=1&scale=1&style=6',
  'http://webst0{1-4}.is.autonavi.com/appmaptile?x={x}&y={y}&z={z}&lang=zh_cn&size=1&scale=1&style=8',
  'http://map.geoq.cn/ArcGIS/rest/services/ChinaOnlineCommunity/MapServer/tile/{z}/{y}/{x}',
  'http://map.geoq.cn/ArcGIS/rest/services/ChinaOnlineCommunityENG/MapServer/tile/{z}/{y}/{x}',
  'http://map.geoq.cn/ArcGIS/rest/services/ChinaOnlineStreetGray/MapServer/tile/{z}/{y}/{x}',
  'http://map.geoq.cn/ArcGIS/rest/services/ChinaOnlineStreetPurplishBlue/MapServer/tile/{z}/{y}/{x}',
  'http://thematic.geoq.cn/arcgis/rest/services/ThematicMaps/administrative_division_boundaryandlabel/MapServer/tile/{z}/{y}/{x}',
  'http://thematic.geoq.cn/arcgis/rest/services/ThematicMaps/administrative_division_boundaryLine/MapServer/tile/{z}/{y}/{x}',
  'http://thematic.geoq.cn/arcgis/rest/services/ThematicMaps/administrative_division_label/MapServer/tile/{z}/{y}/{x}',
  'http://thematic.geoq.cn/arcgis/rest/services/ThematicMaps/subway/MapServer/tile/{z}/{y}/{x}',
  'http://thematic.geoq.cn/arcgis/rest/services/ThematicMaps/ocean/MapServer/tile/{z}/{y}/{x}'
];

export default {
  name: 'App',
  data () {
    return {
      zoom: 5,
      center: [116.397228, 39.909605],
      lonlat: '',
      drawType: null,
      fire: [],
      stationName: [],
      humidity: [],
      press: {},
      tileXYZ: XYZTileList[0],
      railway: [],
      radarImg: '',
      radarBbox: [],
      overlayPosition: [],
      overlayInfoObj: {},
      drawControl: this.drawCtrlFunc,
      testBarControl: this.testCtrlFunc
      // graticuleControl: this.graticuleCtrlFunc
    };
  },
  created () {
    this.getFire();
  },
  methods: {
    // 不要在 data 里面直接定义 function，否则作用域 this 无法传递
    drawCtrlFunc () {
      this.drawType = 'Circle';
    },
    testCtrlFunc () {
      console.log('------------ test ----------');
    },
    getRandomColor () {
      var color = '#';
      for (var i = 0; i < 6; i++) {
        color += (Math.random() * 16 | 0).toString(16);
      }
      return color;
    },
    handleMapSingleClick (val) {
      console.log('handleMapSingleClick in App', val);
      this.overlayPosition = val.coordinate;
      this.overlayInfoObj = val;
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
        res.data.result.items.forEach(val => {
          let line = [];
          if (val.lines && val.lines.length > 1) {
            val.lines.forEach((value, index) => {
              line.push(value[1]);
            });
            this.railway.push(line);
          }
        });
        this.zoom = 7;
        this.center = [116.386974, 26.652142];
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
        this.radarImg = res.data.detail[0].pic;
        this.radarBbox = res.data.detail[0].bbox;
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
    handleStationSingleclick (val) {
      console.log('======== singleclick fire in App ======>', val);
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
    },
    getRandomInt (min, max) {
      return Math.floor(Math.random() * (max - min + 1) + min);
    },
    switchTile () {
      this.tileXYZ = XYZTileList[this.getRandomInt(0, 18)];
    },
    handleLineSingleclick (val) {
      console.log(' ----------- singleclick line --------->', val);
    },
    handleLineEnter (val) {
      console.log(' ----------- hover enter line --------->', val);
    },
    handleLineLeave (val) {
      console.log(' ----------- hover leave line --------->', val);
    },
    clearMapOverlays () {
      this.$refs.map.clearOverlays([], ['overlay']);
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
  background-color: #ccc;
  padding: 10px;
  border-radius: 4px;
}
.menu1 {
  left: 20px;
  bottom: 36px;
}
.menu2 {
  left: 240px;
  bottom: 86px;
}
.menu3 {
  left: 20px;
  bottom: 86px;
}
.menu4 {
  left: 110px;
  bottom: 86px;
}
.menu5 {
  left: 540px;
  bottom: 86px;
  background-color: #fff;
}
.lonlat {
  position: absolute;
  top: 0;
  right: 50px;
  padding: 5px 10px;
  border-radius: 0 0 4px 4px;
  background-color: #fff;
}
.custom-overlay {
  width: 300px;
}
.ol-control-button-circle {
  top: 0;
  left: 300px;
}
.ol-control-graticule {
  top: 0;
  left: 350px;
}
.ol-control-bar-test {
  top: 0;
  left: 40px;
}
</style>
