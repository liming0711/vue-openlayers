<script>
import button from '../mixins/control/button';

export default {
  name: 'OlControlButton',
  componentName: 'OlControlButton',
  mixins: [button],
  props: {
    title: String,
    customClass: String,
    innerHtml: String,
    active: Boolean,
    disable: Boolean,
    unique: Boolean,
    toggle: {
      type: Boolean,
      default: true
    },
    clickEvent: Function
  },
  methods: {
    _handleClickEvent () {
      this.clickEvent && this.clickEvent();
    }
  }
};
</script>
