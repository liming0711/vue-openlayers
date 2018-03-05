<script>
import button from './button';
import { addClass } from '../utils/dom';

export default {
  name: 'OlControlGraticule',
  mixins: [button],
  props: {
    maxLines: Number,
    strokeStyle: Object,
    targetSize: Number,
    showLabels: Boolean,
    lonLabelFormatter: Function,
    latLabelFormatter: Function,
    lonLabelPosition: Number,
    latLabelPosition: Number,
    lonLabelStyle: Object,
    latLabelStyle: Object
  },
  mounted () {
    addClass(this.$el, 'ol-control-custom-graticule');
  },
  methods: {
    _handleClick () {
      var graticule = new this.ol.Graticule({
        maxLines: this.maxLines,
        strokeStyle: this.strokeStyle || new this.ol.style.Stroke({
          color: 'rgba(12, 12, 12, 0.8)',
          width: 0.5
        }),
        targetSize: this.targetSize,
        showLabels: this.showLabels,
        lonLabelFormatter: this.lonLabelFormatter,
        latLabelFormatter: this.latLabelFormatter,
        lonLabelPosition: this.lonLabelPosition,
        latLabelPosition: this.latLabelPosition,
        lonLabelStyle: this.lonLabelStyle,
        latLabelStyle: this.latLabelStyle
      });
      graticule.setMap(this.map);
    }
  }
};
</script>
