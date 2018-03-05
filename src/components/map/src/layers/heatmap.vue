<script>
import ready from '../mixins/ready';
import destroy from '../mixins/destroy';

const TYPE = 'heatmap';

export default {
  name: 'OlHeatmap',
  render () { return false; },
  mixins: [ready, destroy],
  props: {
    vid: {
      type: String,
      required: true
    },
    name: String,
    blur: {
      type: Number,
      default: 5
    },
    radius: {
      type: Number,
      default: 15
    },
    shadow: {
      type: Number,
      default: 250
    },
    zIndex: {
      type: Number,
      default: 0
    },
    massClear: {
      type: Boolean,
      default: true
    }
  },
  data () {
    return {
      layer: null
    };
  },
  watch: {
    blur (newBlur) {
      this.layer.setBlur(newBlur);
    },
    radius (newRadius) {
      this.layer.setRadius(newRadius);
    }
  },
  methods: {
    _load () {
      this.layer = new this.ol.layer.Heatmap({
        id: this.vid,
        name: this.name,
        type: TYPE,
        massClear: this.massClear,
        source: new this.ol.source.Vector({
          url: 'https://openlayers.org/en/v4.6.4/examples/data/kml/2012_Earthquakes_Mag5.kml',
          format: new this.ol.format.KML({
            extractStyles: false
          })
        }),
        blur: this.blur,
        radius: this.radius,
        shadow: this.shadow,
        zIndex: this.zIndex
      });
      console.log('----------- 999 ----------', this.blur, this.radius, this.shadow);
      this.layer.getSource().on('addfeature', function (event) {
        var name = event.feature.get('name');
        var magnitude = parseFloat(name.substr(2));
        event.feature.set('weight', magnitude - 5);
      });

      this.map.addLayer(this.layer);
    }
  }
};
</script>
