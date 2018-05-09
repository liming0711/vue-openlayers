import Constructor from '../../controls/constructor';
import bar from './bar';

let buttonIndex = 0;
export default {
  mixins: [bar],
  render (h) {
    return (
      <button
        type='button'
        class={[
          {
            'ol-control-custom-disable': this.disable,
            'ol-control-custom-active': !this.disable && this.isActive
          },
          'ol-control-custom-button',
          this.customClass
        ]}
        title={this.title}
        onClick={this._handleButtonClick}>
        { this.innerHtml }
      </button>
    );
  },
  mounted () {
    let $parent = this.isNested ? this.parentBar : this.rootBar;
    $parent.$on('bar-ready', () => {
      this.ol = $parent.ol;
      this.map = $parent.map;
      $parent._addButton(this._getButton());
      this.active && this._handleClickEvent();
    });
  },
  watch: {
    active (n) {
      if (this.isActive !== n) {
        this.isActive = n;
      }
    }
  },
  data () {
    return {
      button: null,
      isActive: this.active,
      siblings: [],
      relationship: {}
    };
  },
  methods: {
    _getButton () {
      buttonIndex++;
      this.button = new Constructor({
        element: this.$el,
        properties: {
          type: 'button',
          name: `button${buttonIndex}`
        }
      });
      this.button.set('unique', this.unique);
      return this.button;
    },
    _handleButtonClick () {
      if (this.disable) { return false; }
      if (this.toggle) {
        this.isActive = !this.isActive;
      }

      this._setUnique();
      this._handleClickEvent();
    },
    _setUnique () {
      let buttonUnique = this.button.get('unique');
      let subbarUnique = this.button.get('subbar-unique');
      let barUnique = this.button.get('bar-unique');

      if (barUnique || subbarUnique || buttonUnique) {
        this._getSiblingsButton(this.button).forEach(item => {
          if (item.isActive) {
            if (barUnique || subbarUnique) {
              item.isActive = false;
            } else if (buttonUnique) {
              if (item.button.get('unique')) { item.isActive = false; }
            }
          }
        });
      }
    },
    _getSiblingsButton (button) {
      let relationship = this._getRelationship();
      let siblings = relationship[button.get('parentName')];
      let buttonIndex = siblings.findIndex(a => { return a.button.get('name') === button.get('name'); });
      siblings.splice(buttonIndex, 1);
      return siblings;
    },
    _getRelationship (children) {
      if (!children) {
        children = this.rootBar.$children;
      }
      children.forEach(child => {
        if (child.$children && child.$children.length) {
          this.relationship[child.subbar.get('name')] = [];
          this._getRelationship(child.$children);
        } else {
          let parentName = child.button.get('parentName');
          if (parentName === 'root') {
            if (!this.relationship.root) {
              this.relationship.root = [];
            }
            this.relationship.root.push(child);
          } else {
            this.relationship[parentName].push(child);
          }
        }
      });
      return this.relationship;
    }
  }
};
