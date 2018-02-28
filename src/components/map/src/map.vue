<template>
  <div class="map-wrapper">
    <div class="map" ref="map"></div>
    <slot></slot>
  </div>
</template>

<script>
import ol from 'openlayers';
import debounce from 'throttle-debounce/debounce';

import feature from './mixins/feature';

import broadcast from './utils/broadcast';

const DEBOUNCE_TIME = 400;

export default {
  name: 'OlMap',
  mixins: [feature],
  props: {
    center: {
      type: Array,
      default: function () {
        return [116.397228, 39.909605];
      },
      validator: function (point) {
        let bLon = point[0] >= -180 && point[0] <= 180;
        let bLat = point[1] >= -74 && point[1] <= 74;
        return bLon && bLat;
      }
    },
    zoom: {
      type: Number,
      default: 4
    },
    minZoom: {
      type: Number,
      default: 2
    },
    maxZoom: {
      type: Number,
      default: 18
    },
    XYZ: {
      type: String,
      default: 'http://mt{0-3}.google.cn/vt/lyrs=y&hl=zh-CN&gl=CN&src=app&x={x}&y={y}&z={z}&s=G'
    },
    source: Object,
    layers: Array,
    // 当 hover 到某个 feature 上的时候忽略地图的 hover 事件，Image 除外
    ignoreFeatureHover: {
      type: Boolean,
      default: true
    },
    // 当 click 到某个 feature 上的时候忽略地图的所有 click 事件，Image 除外
    ignoreFeatureClick: {
      type: Boolean,
      default: true
    },
    dragPan: {
      // 鼠标或手指拖拽平移地图
      type: Boolean,
      default: true
    },
    keyboardZoom: {
      // 使用键盘 + 和 - 按键进行缩放
      type: Boolean,
      default: true
    },
    keyboardPan: {
      // 使用键盘方向键平移地图
      type: Boolean,
      default: true
    },
    mouseWheelZoom: {
      // 鼠标滚轮缩放地图
      type: Boolean,
      default: true
    },
    doubleClickZoom: {
      // 鼠标或手指双击缩放地图
      type: Boolean,
      default: true
    },
    pinchRotate: {
      // 两个手指旋转地图，针对触摸屏
      type: Boolean,
      default: true
    },
    pinchZoom: {
      // 两个手指缩放地图，针对触摸屏
      type: Boolean,
      default: true
    }
  },
  data () {
    return {
      ol: null,
      map: null,
      tileLayer: null,
      // draw interaction 为活动状态时 drawEnable 为 true，否则为 false
      // drawEnable 为 true 时不再监听所有的 click 和 hover 事件
      drawEnable: false,
      sourceInstance: null,
      click: null,
      hover: null,
      draw: null
    };
  },
  mounted () {
    this._initMap();
  },
  watch: {
    layers (n) {
      /*
      sourceInstance = new ol.source.XYZ({
        url: 'http://mt{0-3}.google.cn/vt/lyrs=y&hl=zh-CN&gl=CN&src=app&x={x}&y={y}&z={z}&s=G'
      });

      OR

      sourceInstance = new ol.source.TileWMS({
        url: 'http://ngrok.91weather.com:17713/geoserver/Mlog/wms',
        params: {
          'LAYERS': 'Mlog:geotools_coverage',
          'TILED': true
        }
      });

      n = new ol.layer.Group({
        layers: [
          new ol.layer.Tile({
            source: sourceInstance,
            index: 1,
            type: 'mapbase'
          })
        ]
      });
      */
      this.map.setLayerGroup(n);
    },
    source (n) {
      this.tileLayer && this.tileLayer.setSource(n);
    },
    XYZ (n) {
      this.sourceInstance && this.sourceInstance.setUrl(n);
    }
  },
  methods: {
    _initMap () {
      let layers = this.layers;
      if (!layers) {
        this.sourceInstance = this.source || new ol.source.XYZ({
          url: this.XYZ
        });
        this.tileLayer = new ol.layer.Tile({
          source: this.sourceInstance,
          index: 1,
          type: 'base'
        });
        layers = [this.tileLayer];
      }
      this.map = new ol.Map({
        target: this.$refs.map,
        logo: false,
        layers: layers,
        view: new ol.View({
          center: ol.proj.transform(this.center, 'EPSG:4326', 'EPSG:3857'),
          zoom: this.zoom,
          minZoom: this.minZoom,
          maxZoom: this.maxZoom
        }),
        /* eslint-disable */
        // interactions: ol.interaction.defaults().extend([new app.Drag()]),
        interactions: new ol.interaction.defaults({
          dragPan: this.dragPan,
          keyboardZoom: this.keyboardZoom,
          keyboardPan: this.keyboardPan,
          mouseWheelZoom: this.mouseWheelZoom,
          doubleClickZoom: this.doubleClickZoom,
          pinchRotate: this.pinchRotate,
          pinchZoom: this.pinchZoom
        })
      });

      this.ol = ol;

      this._initMapEvent();
      this._initInteractions();
      this.$emit('ready');
    },
    _initMapEvent () {
      let view = this.map.getView();

      ['click', 'singleclick', 'dblclick'].forEach(eventName => {
        this.map.on(eventName, (event) => {
          if (!(this.ignoreFeatureClick && this._getFeatureAtPixel(event.pixel)) && !this.drawEnable) {
            this.$emit(eventName, event);
          }
        });
      });
      this.map.on('pointermove', (event) => {
        if (!(this.ignoreFeatureHover && this._getFeatureAtPixel(event.pixel)) && !this.drawEnable) {
          this.$emit('pointermove', event);
        }
      });
      this.map.on('pointerdrag', (event) => { this.$emit('pointerdrag', event); });
      this.map.on('moveend', (event) => { this.$emit('moveend', event); });
      this.map.on('change:layerGroup', debounce(DEBOUNCE_TIME, (event) => { this.$emit('layerGroupChange', event); })); // TODO if debounce is necessary
      this.map.on('change:size', debounce(DEBOUNCE_TIME, (event) => { this.$emit('sizeChange', event); })); // TODO if debounce is necessary
      this.map.on('change:target', debounce(DEBOUNCE_TIME, (event) => { this.$emit('targetChange', event); })); // TODO if debounce is necessary
      this.map.on('change:view', debounce(DEBOUNCE_TIME, (event) => { this.$emit('viewChange', event); })); // TODO if debounce is necessary
      view.on('change:resolution', debounce(DEBOUNCE_TIME, (event) => { this.$emit('zoomChange', event); }));
      view.on('change:center', debounce(DEBOUNCE_TIME, (event) => { this.$emit('centerChange', event); }));
      view.on('change:rotation', debounce(DEBOUNCE_TIME, (event) => { this.$emit('rotationChange', event); }));
    },
    _initInteractions () {
      this._addClickInteraction();
      this._addHoverInteraction();
    },
    _getFeatureAtPixel (pixel) {
      if (!pixel) { return false; }
      let hasFeature = this.map.forEachFeatureAtPixel(pixel, (feature, layer) => {
        return feature;
      });
      return hasFeature;
    },
    _broadcast (layerId, eventName, params) {
      broadcast.call(this, layerId, eventName, params);
    },
    _addClickInteraction () {
      this.click = new this.ol.interaction.Select({
        style: (feature) => {
          return this._getSingleFeature(feature).getStyle();
        }
      });
      this.map.addInteraction(this.click);
      this.click.on('select', (event) => {
        if (this.drawEnable) { return false; }
        if (event.selected.length) {
          this._broadcast(this._getSingleFeature(event.selected[0]).get('vid'), 'singleclick', event);
        }
      });
    },
    _addHoverInteraction () {
      this.hover = new this.ol.interaction.Select({
        condition: this.ol.events.condition.pointerMove,
        style: (feature) => {
          return this._getSingleFeature(feature).getStyle();
        }
      });
      this.map.addInteraction(this.hover);
      this.hover.on('select', (event) => {
        if (this.drawEnable) { return false; }
        if (event.selected.length) {
          let id = this._getSingleFeature(event.selected[0]).get('vid');
          id && this._broadcast(id, 'enter', event);
        }
        if (event.deselected.length) {
          let id = this._getSingleFeature(event.deselected[0]).get('vid');
          id && this._broadcast(id, 'leave', event);
        }
      });
    },
    resize () {
      this.map.updateSize();
    },
    getLonlat (coordinate) {
      let lonlat = [];
      if (coordinate && coordinate.length) {
        lonlat = this.ol.proj.transform(coordinate, 'EPSG:3857', 'EPSG:4326');
      }
      return lonlat;
    }
  },
  beforeDestroy () {
    this.map = this.ol = null;
  }
};
</script>
<style>
@import 'openlayers/dist/ol.css';

html, body, div, span, i, ul, li {
  margin: 0;
  padding: 0;
  border: 0;
  font-size: 100%;
  font-weight: normal;
}
.map {
  height: 100%;
}
</style>
