<script>
import bar from '../mixins/control/bar';
// Attribution, Control, FullScreen, MousePosition, OverviewMap, Rotate, ScaleLine, Zoom, ZoomSlider, ZoomToExtent
export default {
  name: 'OlControlFullscreen',
  componentName: 'OlControlButton',
  render () { return false; },
  mixins: [bar],
  props: {
    title: {
      type: String,
      default: '全屏显示'
    },
    customClass: {
      type: String,
      default: 'ol-control-button-fullscreen'
    },
    innerHtml: String,
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
  mounted () {
    let $parent = this.isNested ? this.parentBar : this.rootBar;
    $parent.$on('bar-ready', () => {
      this.ol = $parent.ol;
      this.map = $parent.map;
      this.fullscreen = this._getFullscreen();
      this.map.addControl(this.fullscreen);
    });
  },
  methods: {
    _getFullscreen () {
      return new this.ol.control.FullScreen({
        className: 'ol-control-fullscreen',
        label: this.innerHtml,
        labelActive: this.labelActive,
        tipLabel: this.title,
        keys: this.keys,
        target: this.rootBar.$el,
        source: this.source
      });
    }
  }
};
</script>
<style>
.ol-control-custom-bar .ol-control-fullscreen {
  position: relative;
  display: inline-block;
  padding: 0;
  background-color: transparent;
}
.ol-control-custom-bar .ol-control-fullscreen button {
  width: 25px;
  height: 25px;
}
</style>
