<script>
import button from '../mixins/control/button';
// Attribution, Control, FullScreen, MousePosition, OverviewMap, Rotate, ScaleLine, Zoom, ZoomSlider, ZoomToExtent
export default {
  name: 'OlControlFullscreen',
  componentName: 'OlControlButton',
  mixins: [button],
  props: {
    title: {
      type: String,
      default: '全屏显示'
    },
    customClass: {
      type: String,
      default: 'ol-control-button-fullscreen'
    },
    innerHtml: {
      type: String,
      default: ''
    },
    disable: Boolean,
    unique: Boolean,
    labelActive: String,
    keys: Boolean,
    target: String,
    source: String
  },
  data () {
    return {
      fullscreen: null,
      active: true
    };
  },
  methods: {
    _handleClickEvent () {
      if (this.fullscreen) { return false; }
      this.fullscreen = this._getFullscreen();
      this.map.addControl(this.fullscreen);
      console.log('------------ 000 -----------', this.rootBar);
    },
    _getFullscreen () {
      return new this.ol.control.FullScreen({
        className: 'ol-control-fullscreen',
        label: this.innerHtml,
        labelActive: this.labelActive,
        tipLabel: this.title,
        keys: this.keys,
        target: this.$el,
        source: this.source
      });
    }
  }
};
</script>
