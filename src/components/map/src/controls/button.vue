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
    clickEvent: Function
  },
  methods: {
    _handleClick () {
      this.clickEvent && this.clickEvent();
    }
  }
};
</script>
