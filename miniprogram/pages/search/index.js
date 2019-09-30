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
    const { idx, value } = e.detail;
    const { markers } = this.data;
    markers[idx].text = value;
    this.setData({ markers });
    // const myAmapFun = new amapFile.AMapWX({ key: '高德Key' });
    // myAmapFun.getInputtips({
    //   keywords: value,
    //   location: '',
    //   success: function(data) {
    //     if (data && data.tips) {
    //       that.setData({
    //         tips: data.tips
    //       });
    //     }
    //   }
    // });
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
