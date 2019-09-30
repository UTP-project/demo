// miniprogram/pages/search/index.js
const { amapKey } = require('../../config/map');
const amapFile = require('../../libs/amap-wx');
Page({
  /**
   * Page initial data
   */
  data: {
    curMarkerIdx: 0,
    markers: [
      {
        placeholder: '起始位置',
        text: ''
      }
    ],
    tips: []
  },

  bindAdd: function(e) {
    const { markers } = this.data;
    markers.push({ text: '' });
    this.setData({ markers });
  },
  bindDelete: function(e) {
    const { idx } = e.detail;
    const { markers } = this.data;
    markers.splice(idx, 1);
    this.setData({ markers });
  },
  bindInput: function(e) {
    const that = this;
    const { idx, value } = e.detail;
    const { markers } = that.data;
    markers[idx].text = value;
    that.setData({ markers, curMarkerIdx: idx });
    const amap = new amapFile.AMapWX({ key: amapKey });
    amap.getInputtips({
      keywords: value,
      location: '',
      success: function(data) {
        if (data && data.tips) {
          console.log(data.tips);
          that.setData({
            tips: data.tips
          });
        }
      }
    });
  },
  bindSearch: function(e) {
    const { item } = e.target.dataset;
    if (item) {
      const location = item.location.split(',');
      const { markers } = this.data;
      const idx = this.data.curMarkerIdx;
      markers[idx] = {
        ...markers[idx],
        text: item.name,
        longitude: location[0],
        latitude: location[1]
      };
      console.log(markers);
      this.setData({ markers, tips: [] });
    }
  },

  /**
   * Lifecycle function--Called when page load
   */
  onLoad: function(options) {},

  /**
   * Lifecycle function--Called when page is initially rendered
   */
  onReady: function() {},

  /**
   * Lifecycle function--Called when page show
   */
  onShow: function() {},

  /**
   * Lifecycle function--Called when page hide
   */
  onHide: function() {},

  /**
   * Lifecycle function--Called when page unload
   */
  onUnload: function() {},

  /**
   * Page event handler function--Called when user drop down
   */
  onPullDownRefresh: function() {},

  /**
   * Called when page reach bottom
   */
  onReachBottom: function() {},

  /**
   * Called when user click on the top right corner to share
   */
  onShareAppMessage: function() {}
});
