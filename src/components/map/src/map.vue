<template>
  <div class="map-wrapper">
    <div class="map" ref="map"></div>
    <slot></slot>
  </div>
</template>

<script>
import ol from 'openlayers';
import debounce from 'throttle-debounce/debounce';

import HoverInteraction from './interactions/hover';
import ClickInteraction from './interactions/click';
import DrawInteraction from './interactions/draw';

const DEBOUNCE_TIME = 400;

export default {
  name: 'OlMap',
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
    // 画多边形时的边数，其中
    // 1为点、2为线、-1为圆、-2为椭圆、-3为不规则多边形，
    // 大于2时为对应边数的规则多边形，0为无效值
    // 如果需要指定多边形的样式，需使用 Object（包括边数）
    drawProperties: [Number, Object],
    ignoreFeatureHover: {
      type: Boolean,
      default: true
    },
    ignoreFeatureClick: {
      type: Boolean,
      default: true
    },
    ignoreFeatureSingleclick: {
      type: Boolean,
      default: true
    },
    ignoreFeatureDblclick: {
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
      drawLayer: new ol.layer.Vector({
        id: 'draw',
        name: 'draw',
        type: 'draw',
        source: new ol.source.Vector({
          crossOrigin: 'anonymous'
        })
      }),
      // draw interaction 为可活动状态时 drawEnable 为 true，否则为 false
      // drawEnable 为 true 时不再监听所有的 click 事件
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
    },
    // 值为 true 时，添加 draw layer，并为 draw interaction 设置 source 和 sides，然后将 draw interaction 设置为可活动状态
    // 值为 false 时，会将 draw interaction 设置为非活动状态，但是分为两种情况：
    // 当 drawProperties 值为0时，仍然保留已经画好的图形
    // 当 drawProperties 值为 NaN、null 或 undefined 时，会清空 draw source 并移除 draw layer
    drawProperties (n, o) {
      if (!n) {
        if (n !== 0) {
          this.clearDrawSource();
          this.map.removeLayer(this.drawLayer);
        }
      } else {
        // 如果旧值为 false 时，才添加 layer 并设置 source
        // 否则直接设置 sides 和 style
        if (!o) {
          this.map.addLayer(this.drawLayer);
          this.draw.setSource(this.drawLayer.getSource());
        }

        if (Number.isNaN(Number(this.drawProperties))) {
          // 当 drawProperties 类型为 Object 时
          if (this.drawProperties.sides) {
            this.draw.setSides(this.drawProperties.sides);
          } else {
            throw new Error(`缺少 sides`);
          }
          if (this.drawProperties.style) {
            this.draw.setStyle(this.drawProperties.style);
          }
        } else {
          // 当 drawProperties 类型为 Number 时
          this.draw.setSides(this.drawProperties);
        }
      }

      if (!!n !== !!o) {
        this.draw.setActive(!!n);
        this.drawEnable = !!n;
      }
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
      // pointermove 被全局 hover 事件代替，但是 emit 以 pointermove 为名称的事件，
      // click、singleclick、dblclick 被全局 click 事件代替
      // 因为全局 hover 和 click 事件默认获取了 feature，如果监听 pointermove 和 map 的 click、singleclick 和 dblclick，还需要再去处理 feature 的问题
      let view = this.map.getView();

      this.map.on('change:layerGroup', debounce(DEBOUNCE_TIME, (event) => { this.$emit('layerGroupChange', event); })); // TODO if debounce is necessary
      this.map.on('change:size', debounce(DEBOUNCE_TIME, (event) => { this.$emit('sizeChange', event); })); // TODO if debounce is necessary
      this.map.on('change:target', debounce(DEBOUNCE_TIME, (event) => { this.$emit('targetChange', event); })); // TODO if debounce is necessary
      this.map.on('change:view', debounce(DEBOUNCE_TIME, (event) => { this.$emit('viewChange', event); })); // TODO if debounce is necessary
      this.map.on('moveend', (event) => { this.$emit('moveend', event); });
      this.map.on('pointerdrag', (event) => { this.$emit('pointerdrag', event); });
      view.on('change:resolution', debounce(DEBOUNCE_TIME, (event) => { this.$emit('zoomChange', event); }));
      view.on('change:center', debounce(DEBOUNCE_TIME, (event) => { this.$emit('centerChange', event); }));
      view.on('change:rotation', debounce(DEBOUNCE_TIME, (event) => { this.$emit('rotationChange', event); }));
    },
    _initInteractions () {
      this.hover = new HoverInteraction();
      this.click = new ClickInteraction();
      this.draw = new DrawInteraction();
      this.map.addInteraction(this.hover);
      this.map.addInteraction(this.click);
      this.map.addInteraction(this.draw);

      this.draw.setActive(false);

      this._registerEvent();
    },
    _registerEvent () {
      // TODO 整合监听事件
      // this.$parent.click.on('click', e => {
      //   if (e.feature && e.layerId === this.vid && !this.$parent.drawEnable) {
      //     this.$emit('click', e);
      //   }
      // });
      this.click.on('click', e => {
        if (!(e.feature && this.ignoreFeatureClick) && !this.drawEnable) {
          this.$emit('click', e);
        }
      });
      this.click.on('singleclick', e => {
        if (!(e.feature && this.ignoreFeatureSingleclick) && !this.drawEnable) {
          this.$emit('singleclick', e);
        }
      });
      this.click.on('dblclick', e => {
        if (!(e.feature && this.ignoreFeatureDblclick) && !this.drawEnable) {
          this.$emit('dblclick', e);
        }
      });

      this.hover.on('hover', e => {
        if (!(e.feature && this.ignoreFeatureHover)) {
          this.$emit('pointermove', e);
        }
      });
      this.hover.on('enter', e => {
        if (e.feature && e.layerId === this.drawLayer.get('id') && !this.$parent.drawEnable) {
          this.$emit('drawenter', e);
        }
      });
      this.hover.on('enter', e => {
        if (e.feature && e.layerId === this.drawLayer.get('id') && !this.$parent.drawEnable) {
          this.$emit('drawleave', e);
        }
      });

      this.draw.on('drawstart', e => {
        this.$emit('drawstart', e);
      });
      this.draw.on('drawing', e => {
        this.$emit('drawing', e);
      });
      this.draw.on('drawend', e => {
        this.$emit('drawend', e);
      });
      this.draw.on('drawcancel', e => {
        this.$emit('drawcancel', e);
      });
    },
    resize () {
      this.map.updateSize();
    },
    clearDrawSource () {
      this.drawLayer.getSource().clear();
    }
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

