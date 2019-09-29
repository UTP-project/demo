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
      const { markers } = this.data;
      markers.push({ text: '' });
      this.triggerEvent('setMarkers', { markers });
    },
    onTap: function(e) {
      const { target } = e;
      const {
        dataset: { type, idx }
      } = target;
      const { markers } = this.data;
      if (type === 'delete') {
        markers.splice(idx, 1);
        this.triggerEvent('setMarkers', { markers });
      }
    },
    onInput: function(e) {
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
        this.triggerEvent('setMarkers', { markers });
      }
    }
  }
});
