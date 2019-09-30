// miniprogram/pages/home/index.js
const { defaultLongitude, defaultLatitude } = require('../../config/map');
Page({
  /**
   * Page initial data
   */
  data: {
    markers: [],
    latitude: '',
    longitude: ''
  },

  toSearch: function() {
    wx.navigateTo({ url: '/pages/search/index' });
  },

  /**
   * Lifecycle function--Called when page load
   */
  onLoad: function(options) {
    const that = this;
    wx.getLocation({
      success(res) {
        const { longitude, latitude } = res;
        const markers = [
          {
            iconPath: '../../images/map/position-fill.png',
            width: 32,
            height: 32,
            latitude,
            longitude
          }
        ];
        that.setData({ longitude, latitude, markers });
      },
      fail(e) {
        // 获取位置失败, 采用默认位置
        const longitude = defaultLongitude;
        const latitude = defaultLatitude;
        const markers = [
          {
            iconPath: '../../images/map/position-fill.png',
            width: 32,
            height: 32,
            latitude,
            longitude
          }
        ];
        that.setData({ longitude, latitude, markers });
      }
    });
  },

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
