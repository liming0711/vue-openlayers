const getParent = $component => $component.abstract ? getParent($component.$parent) : $component;

class Common {
  constructor () {
    this.methods = {
      ready () {
        this.map = this.$parent.map;
        this.ol = this.$parent.ol;
        this.load();
      },
      load () {
        let rendered = this.render();
        rendered && this.bindEvents();
      },
      bindEvents () {
        this.$parent.hover.on('enter', this.hoverEnter);
        this.$parent.hover.on('leave', this.hoverLeave);
        this.$parent.click.on('click', this.clickEvent);
        this.$parent.click.on('singleclick', this.singleclickEvent);
        this.$parent.click.on('dblclick', this.dblclickEvent);

        // this.clearSelectEffect = clickEvent.getFeatures();
      },
      clickEvent (e) {
        if (e.feature && e.layerId === this.vid && !this.$parent.drawEnable) {
          this.$emit('click', e);
        }
      },
      singleclickEvent (e) {
        if (e.feature && e.layerId === this.vid && !this.$parent.drawEnable) {
          this.$emit('singleclick', e);
        }
      },
      dblclickEvent (e) {
        if (e.feature && e.layerId === this.vid && !this.$parent.drawEnable) {
          this.$emit('dblclick', e);
        }
      },
      hoverEnter (e) {
        if (e.feature && e.layerId === this.vid) {
          this.$emit('enter', e);
        }
      },
      hoverLeave (e) {
        if (e.feature && e.layerId === this.vid) {
          this.$emit('leave', e);
        }
      },
      // TODO 当寻找的东西有多个的时候也可以返回一个数组
      getLayerByParam (key, value) {
        let allLayers = this.map.getLayers().getArray();
        for (let i = allLayers.length - 1; i >= 0; i--) {
          if (allLayers[i].get(key) === value) {
            return allLayers[i];
          }
        }
        return false;
      },
      reload () {
        this && this.map && this.$nextTick(() => {
          this.unload();
          this.$nextTick(this.load);
        });
      },
      unload () {
        console.log('unload', this.unique, this.map);
      }
    };
    this.mounted = function () {
      const map = getParent(this.$parent).map;
      map ? this.ready() : this.$parent.$on('ready', this.ready);
    };
    this.beforeDestroy = function () {
      this.unload();
    };
  }
}

export default () => new Common();
