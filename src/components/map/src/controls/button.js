import ready from '../mixins/ready';
export default {
  name: 'OlControlButton',
  mixins: [ready],
  props: {
    renderFunc: Function,
    target: {
      validator: function (value) {
        return true;
      }
    }
  },
  render (h) {
    return (
      <div class="ol-unselectable ol-control ol-control-custom-button">
        <button type="button" onClick={this._handleClick}></button>
      </div>
    );
  },
  methods: {
    _load () {
      console.log(' --------- 0999 ----------', this.target);
      this.NewControl = this._getNewControl();
      this.ol.inherits(this.NewControl, this.ol.control.Control);
      this.map.addControl(new this.NewControl());
    },
    _getNewControl () {
      let _this = this;
      return function () {
        _this.ol.control.Control.call(this, {
          element: _this.$el,
          render: this.renderFunc
        });
      };
    }
  }
};
