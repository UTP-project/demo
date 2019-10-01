// miniprogram/pages/home/index.js
const { defaultLongitude, defaultLatitude } = require('../../config/map');
Page({
  /**
   * Page initial data
   */
  data: {
    editMode: false,
    routes: null,
    curMarkerIdx: 0,
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

  toEdit: function() {
    this.setData({ editMode: true });
  },
  toSearch: function(idx) {
    const { markers, latitude, longitude } = this.data;
    wx.navigateTo({
      url: '/pages/search/index',
      events: {
        inputBlur: function(data) {
          console.log('inputBlur', data);
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
    const nextIdx = markers.length;
    markers.push({ text: '', disabled: true });
    this.setData({ markers, curMarkerIdx: nextIdx });
  },
  bindDelete: function(e) {
    const { idx } = e.detail;
    const { markers, curMarkerIdx } = this.data;
    markers.splice(idx, 1);
    const data = { markers };
    if (idx === curMarkerIdx) {
      data.curMarkerIdx = 0;
    }
    this.setData(data, () => {
      this.findNextIdx();
    });
  },
  bindInputTap: function(e) {
    const { idx } = e.detail;
    const { markers, curMarkerIdx } = this.data;
    if (idx !== curMarkerIdx) {
      this.setData({ markers, curMarkerIdx: idx });
    }
    this.toSearch(idx);
  },
  findNextIdx() {
    const { markers, curMarkerIdx: idx } = this.data;
    const nextIdx = markers.findIndex(el => el.text === '');
    const nIdx = nextIdx === -1 ? idx : nextIdx;
    // change focus input
    this.setData({ markers, curMarkerIdx: nIdx });
    return nextIdx;
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
