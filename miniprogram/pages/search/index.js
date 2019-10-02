// miniprogram/pages/search/index.js
const { amapKey } = require('../../config/map');
const amapFile = require('../../libs/amap-wx');
const amap = new amapFile.AMapWX({ key: amapKey });
Page({
  /**
   * Page initial data
   */
  data: {
    marker: {},
    keywords: '',
    latitude: '',
    longitude: '',
    tips: [],
    time: [],
    showDuration: false,
    confirmDisabled: true
  },

  durationChange: function(e) {
    const { marker } = this.data;
    marker.duration = this.data.time[+e.detail.value];
    this.setData({ marker }, () => this.checkDone());
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
        const { marker } = this.data;
        marker.id = item.id;
        marker.name = item.name;
        marker.longitude = parseFloat(location[0]);
        marker.latitude = parseFloat(location[1]);
        this.setData(
          {
            keywords: item.name,
            tips: [],
            marker,
            showDuration: true
          },
          () => this.checkDone()
        );
      }
    }
  },
  checkDone: function() {
    if (this.data.marker && this.data.marker.id && this.data.marker.duration) {
      this.setData({ confirmDisabled: false });
    } else {
      this.setData({ confirmDisabled: true });
    }
  },
  onConfirm: function() {
    const eventChannel = this.getOpenerEventChannel();
    if (this.data.marker && this.data.marker.id && this.data.marker.duration) {
      eventChannel.emit('confirm', { ...this.data.marker });
      wx.navigateBack();
    }
  },
  fetchTips: function() {
    const { keywords, longitude, latitude } = this.data;
    if (keywords) {
      const that = this;
      amap.getInputtips({
        keywords,
        location: `${longitude},${latitude}`,
        success: function(data) {
          if (data && data.tips) {
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
    const time = [];
    for (let i = 1; i <= 12; i += 0.5) {
      time.push(i);
    }
    this.setData({ time });
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
