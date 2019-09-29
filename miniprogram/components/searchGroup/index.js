// components/searchGroup/index.js
Component({
  /**
   * Component properties
   */
  properties: {},

  /**
   * Component initial data
   */
  data: {
    markers: [
      {
        placeholder: '起始位置',
        text: ''
      }
    ]
  },

  /**
   * Component methods
   */
  methods: {
    handleAdd: function() {
      const { markers } = this.data;
      markers.push({ text: '' });
      this.setData({
        markers
      });
    },
    handleTap: function(e) {
      const { target } = e;
      const {
        dataset: { type, idx }
      } = target;
      const { markers } = this.data;
      if (type === 'delete') {
        markers.splice(idx, 1);
        this.setData({ markers });
      }
    },
    handleInputBlur: function(e) {
      const {
        target,
        detail: { value }
      } = e;
      const {
        dataset: { type, idx }
      } = target;
      const { markers } = this.data;
      if (type === 'input') {
        markers[idx].text = value;
        this.setData({ markers });
      }
    }
  }
});
