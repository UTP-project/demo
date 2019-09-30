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
    onAdd: function() {
      this.triggerEvent('add');
    },
    onTap: function(e) {
      const { idx, type } = e.target.dataset;
      if (type === 'delete') {
        this.triggerEvent('delete', { idx });
      }
    },
    onInput: function(e) {
      const { idx } = e.target.dataset;
      const { value } = e.detail;
      this.triggerEvent('input', { idx, value });
    }
  }
});
