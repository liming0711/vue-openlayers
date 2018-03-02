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
      // draw interaction 为活动状态时 drawEnable 为 true，否则为 false
      // drawEnable 为 true 时不再监听所有的 click 和 hover 事件
      drawEnable: false,
      click: null,
      hover: null,
      draw: null
    };
  },
  mounted () {
    this._initMap();
  },
  watch: {
    zoom (newZoom) {
      this.map && this.map.getView() && this.map.getView().setZoom(newZoom);
    },
    center (newCenter) {
      this.map && this.map.getView() && this.map.getView().setCenter(ol.proj.transform(newCenter, 'EPSG:4326', 'EPSG:3857'));
    },
    layers (newLayers) {
      if (newLayers.length) {
        let layerGroup = new ol.layer.Group({
          layers: newLayers
        });
        this.map && this.map.setLayerGroup(layerGroup);
      }
    }
  },
  methods: {
    _initMap () {
      this.map = new ol.Map({
        target: this.$refs.map,
        logo: false,
        layers: this.layers,
        view: new ol.View({
          center: ol.proj.transform(this.center, 'EPSG:4326', 'EPSG:3857'),
          zoom: this.zoom,
          minZoom: this.minZoom,
          maxZoom: this.maxZoom
        }),
        controls: ol.control.defaults({
          attribution: false
        }).extend([
          new ol.control.ScaleLine(),
          new ol.control.FullScreen(),
          new ol.control.MousePosition({
            className: 'custom-mouse-position',
            target: document.getElementById('test'),
            coordinateFormat: (coord) => {
              return ol.coordinate.format(ol.proj.transform(coord, 'EPSG:3857', 'EPSG:4326'), '{x} | {y}', 6);
            },
            undefinedHTML: '--'
          })
        ]),
        // interactions: ol.interaction.defaults().extend([new app.Drag()]),
        interactions: ol.interaction.defaults({
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
    },
    clearOverlays () {
      // 地图上 layer 比较多时，removeLayer 无法同步进行，(overlay 同理)
      // 所以使用闭包异步处理，确保所有需要删除的图层都被正确删除
      // setTimeout 使用的定时器值是浏览器绘制的最小时间：1000 / 60, 即每秒60帧
      this.map.getLayers().getArray().forEach(layer => {
        setTimeout((() => {
          return () => {
            layer.get('massClear') && this.map && this.map.removeLayer(layer);
          };
        })(), 16.7);
      });
      this.map.getOverlays().getArray().forEach(overlay => {
        setTimeout((() => {
          return () => {
            overlay.get('massClear') && this.map && this.map.removeOverlay(overlay);
          };
        })(), 16.7);
      });
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
