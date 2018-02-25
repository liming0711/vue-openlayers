export default {
  methods: {
    registerEvent () {
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
        if (this.drawEnable) { return false; }
        if (e.feature) {
          if (e.layerId === this.vid) {}
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
    }
  }
};
