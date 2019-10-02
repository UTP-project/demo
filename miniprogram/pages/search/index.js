// miniprogram/pages/search/index.js
const { amapKey } = require('../../config/map');
const amapFile = require('../../libs/amap-wx');
const amap = new amapFile.AMapWX({ key: amapKey });
Page({
  /**
   * Page initial data
   */
  data: {
    keywords: '',
    latitude: '',
    longitude: '',
    tips: []
  },

  bindInput: function(e) {
    const { value } = e.detail;
    this.setData({ keywords: value }, () => {
      this.fetchTips();
    });
  },
  bindSearch: function(e) {
    const { item } = e.target.dataset;
    if (item) {
      if (Array.isArray(item.location)) {
        if (item.location.length === 0) {
          this.setData({ keywords: item.name }, () => {
            this.fetchTips();
          });
        }
      } else {
        const location = item.location.split(',');
        const eventChannel = this.getOpenerEventChannel();
        eventChannel.emit('confirm', {
          id: item.id,
          text: item.name,
          longitude: parseFloat(location[0]),
          latitude: parseFloat(location[1])
        });
        wx.navigateBack();
      }
    }
  },
  fetchTips() {
    const { keywords, longitude, latitude } = this.data;
    if (keywords) {
      const that = this;
      amap.getInputtips({
        keywords,
        location: `${longitude},${latitude}`,
        success: function(data) {
          if (data && data.tips) {
            console.log(data.tips);
            that.setData({
              tips: data.tips
            });
          }
        }
      });
    }
  },

  /**
   * Lifecycle function--Called when page load
   */
  onLoad: function(options) {
    const eventChannel = this.getOpenerEventChannel();
    eventChannel.on('onload', data => {
      this.setData({ ...data }, () => this.fetchTips());
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
