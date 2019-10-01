// miniprogram/pages/home/index.js
const { defaultLongitude, defaultLatitude } = require('../../config/map');
Page({
  /**
   * Page initial data
   */
  data: {
    expand: false,
    editMode: false,
    routes: null,
    markers: [
      {
        placeholder: '起始位置',
        text: '',
        disabled: true
      },
      {
        text: '',
        disabled: true
      }
    ],
    latitude: '',
    longitude: ''
  },

  collapse: function() {
    this.setData({ expand: false });
  },
  expand: function() {
    this.setData({ expand: true, editMode: true });
  },
  toSearch: function(idx) {
    const that = this;
    const { markers, latitude, longitude } = this.data;
    wx.navigateTo({
      url: '/pages/search/index',
      events: {
        confirm: function(data) {
          markers[idx] = { ...markers[idx], ...data };
          that.setData({ markers });
        }
      },
      success: function(res) {
        res.eventChannel.emit('onload', {
          keywords: markers[idx].text,
          latitude,
          longitude
        });
      }
    });
  },
  bindAdd: function(e) {
    const { markers } = this.data;
    markers.push({ text: '', disabled: true });
    this.setData({ markers });
  },
  bindDelete: function(e) {
    const { idx } = e.detail;
    const { markers } = this.data;
    markers.splice(idx, 1);
    const data = { markers };
    this.setData(data);
  },
  bindInputTap: function(e) {
    const { idx } = e.detail;
    this.toSearch(idx);
  },

  /**
   * Lifecycle function--Called when page load
   */
  onLoad: function(options) {
    const that = this;
    wx.getLocation({
      success(res) {
        const { longitude, latitude } = res;
        that.setData({ longitude, latitude });
      },
      fail(e) {
        // 获取位置失败, 采用默认位置
        const longitude = defaultLongitude;
        const latitude = defaultLatitude;
        that.setData({ longitude, latitude });
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
