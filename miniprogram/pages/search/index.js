// miniprogram/pages/search/index.js
Page({
  /**
   * Page initial data
   */
  data: {
    markers: [
      {
        placeholder: '起始位置',
        text: ''
      }
    ]
  },

  setMarkers: function(e) {
    const { markers } = e.detail;
    this.setData({ markers });
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
