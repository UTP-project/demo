// miniprogram/pages/search/index.js
const { amapKey } = require('../../config/map');
const amapFile = require('../../libs/amap-wx');
const amap = new amapFile.AMapWX({ key: amapKey });
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
      },
      {
        text: ''
      }
    ],
    tips: []
  },

  bindInput: function(e) {
    const { idx, value } = e.detail;
    const { markers } = this.data;
    markers[idx].text = value;
    this.setData({ markers }, () => {
      this.fetchTips(idx);
    });
  },
  bindSearch: function(e) {
    const { item } = e.target.dataset;
    if (item) {
      const { markers } = this.data;
      const idx = this.data.curMarkerIdx;
      markers[idx] = {
        ...markers[idx],
        text: item.name
      };
      if (Array.isArray(item.location)) {
        if (item.location.length === 0) {
          markers[idx] = { ...markers[idx] };
          this.setData({ markers }, () => {
            this.fetchTips(idx);
          });
        }
      } else {
        const location = item.location.split(',');
        markers[idx] = {
          ...markers[idx],
          longitude: parseFloat(location[0]),
          latitude: parseFloat(location[1])
        };
        this.setData({ markers, tips: [] }, () => {
          if (this.findNextIdx() === -1) {
            // TODO: get route
          }
        });
      }
    }
  },
  fetchTips(idx) {
    if (idx !== undefined) {
      const { markers } = this.data;
      const that = this;
      amap.getInputtips({
        keywords: markers[idx].text,
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
    }
  },

  /**
   * Lifecycle function--Called when page load
   */
  onLoad: function(options) {
    const eventChannel = this.getOpenerEventChannel();
    eventChannel.on('onload', data => {
      console.log('onload', data);
      eventChannel.emit('inputBlur', { name: 'test' });
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
