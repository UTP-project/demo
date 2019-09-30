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

  bindAdd: function(e) {
    const { markers } = this.data;
    const nextIdx = markers.length;
    markers.push({ text: '' });
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
  bindFocus: function(e) {
    const { idx } = e.detail;
    const { markers, curMarkerIdx } = this.data;
    if (idx !== curMarkerIdx) {
      this.setData({ markers, curMarkerIdx: idx });
    }
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
  findNextIdx() {
    const { markers, curMarkerIdx: idx } = this.data;
    const nextIdx = markers.findIndex(el => el.text === '');
    const nIdx = nextIdx === -1 ? idx : nextIdx;
    // change focus input
    this.setData({ markers, curMarkerIdx: nIdx });
    return nextIdx;
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
