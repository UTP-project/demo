// components/searchGroup/index.js
Component({
  /**
   * Component properties
   */
  properties: {
    markers: Array
  },

  /**
   * Component initial data
   */
  data: {},

  /**
   * Component methods
   */
  methods: {
    onTap: function(e) {
      const { idx, type } = e.target.dataset;
      if (type === 'delete' && idx > 1) {
        this.triggerEvent('delete', { idx });
      } else if (type === 'input') {
        this.triggerEvent('tapInput', { idx });
      } else if (type === 'add') {
        this.triggerEvent('add');
      }
    },
    onFocus: function(e) {
      const { idx } = e.target.dataset;
      this.triggerEvent('focus', { idx });
    },
    onInput: function(e) {
      const { idx } = e.target.dataset;
      const { value } = e.detail;
      this.triggerEvent('input', { idx, value });
    }
  }
});
