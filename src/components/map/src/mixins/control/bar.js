export default {
  computed: {
    rootBar () {
      let parent = this.$parent;
      while (parent && parent.$options.name !== 'OlControlBar') {
        parent = parent.$parent;
      }
      return parent;
    },
    parentBar () {
      let parent = this.$parent;
      while (parent && ['OlControlBar', 'OlControlSubbar'].indexOf(parent.$options.name) === -1) {
        parent = parent.$parent;
      }
      return parent;
    },
    isNested () {
      return this.parentBar !== this.rootBar;
    }
  }
};
