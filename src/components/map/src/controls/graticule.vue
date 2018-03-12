<script>
import button from '../mixins/control/button';

export default {
  name: 'OlControlGraticule',
  componentName: 'OlControlButton',
  mixins: [button],
  props: {
    title: {
      type: String,
      default: '加载经纬线'
    },
    customClass: {
      type: String,
      default: 'ol-control-button-graticule'
    },
    innerHtml: {
      type: String,
      default: 'L'
    },
    active: Boolean,
    disable: Boolean,
    unique: Boolean,
    toggle: {
      type: Boolean,
      default: true
    },
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
  data () {
    return {
      graticule: null
    };
  },
  methods: {
    _handleClickEvent () {
      if (this.graticule && this.toggle) {
        this.graticule.setMap(undefined);
        this.graticule = null;
      } else {
        this.graticule = this._getGraticule();
        this.graticule.setMap(this.map);
      }
    },
    _getGraticule () {
      return new this.ol.Graticule({
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
    }
  }
};
</script>
