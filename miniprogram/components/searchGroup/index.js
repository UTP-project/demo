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
    markers: [{}]
  },

  /**
   * Component methods
   */
  methods: {
    handleAdd: function() {
      const markers = this.data.markers;
      markers.push({});
      this.setData({
        markers
      });
    }
  }
});
