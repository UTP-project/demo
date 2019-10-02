// miniprogram/pages/home/index.js
const {
  amapKey,
  defaultLongitude,
  defaultLatitude
} = require('../../config/map');
const amapFile = require('../../libs/amap-wx');
Page({
  /**
   * Page initial data
   */
  data: {
    loading: false,
    welcome: true,
    expand: false,
    editMode: false,
    submitDisabled: true,
    routes: {},
    polyline: [],
    markers: [
      {
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

  includePoints: function() {
    return this.data.markers.filter(el => el.longitude && el.latitude);
  },
  collapse: function() {
    this.setData({ expand: false });
  },
  expand: function() {
    this.setData({ expand: true, editMode: true });
  },
  search: function() {
    if (!this.data.submitDisabled) {
      const { markers, routes } = this.data;
      const polyline = [];
      const promise = [];
      const that = this;
      this.setData({ loading: true });
      for (let i = 0; i < markers.length - 1; i++) {
        for (let j = i + 1; j < markers.length; j++) {
          const origin = `${markers[i].longitude},${markers[i].latitude}`;
          const destination = `${markers[j].longitude},${markers[j].latitude}`;
          promise.push(
            new Promise((resolve, reject) => {
              that.amap.getDrivingRoute({
                origin,
                destination,
                success: function(data) {
                  const route = {};
                  const points = [];
                  if (data.paths && data.paths[0] && data.paths[0].steps) {
                    const steps = data.paths[0].steps;
                    for (let k = 0; k < steps.length; k++) {
                      const poLen = steps[k].polyline.split(';');
                      for (let l = 0; l < poLen.length; l++) {
                        const point = {
                          longitude: parseFloat(poLen[l].split(',')[0]),
                          latitude: parseFloat(poLen[l].split(',')[1])
                        };
                        points.push(point);
                      }
                    }
                  }
                  if (data.paths[0] && data.paths[0].duration) {
                    route.duration = +data.paths[0].duration;
                  }
                  if (data.paths[0] && data.paths[0].distance) {
                    route.distance = +data.paths[0].distance;
                  }
                  if (data.taxi_cost) {
                    route.cost = parseInt(data.taxi_cost);
                  }
                  polyline.push({
                    points,
                    color: '#00B2B2',
                    width: 6
                  });
                  routes[`${markers[i].id},${markers[j].id}`] = route;
                  that.setData({
                    polyline,
                    routes
                  });
                  resolve();
                },
                fail: function(info) {
                  reject(info);
                }
              });
            })
          );
          Promise.all(promise).then(() => {
            const { polyline } = this.data;
            const points = [];
            let i = 0;
            while (i < polyline.length) {
              if (Array.isArray(polyline[i].points)) {
                points.push(...polyline[i].points);
              }
              i++;
            }
            this.mapCtx.includePoints({
              points,
              padding: [40, 40, 40, 40]
            });
            this.setData({
              loading: false,
              expand: false,
              editMode: false,
              welcome: false
            });
          });
        }
      }
    }
  },
  checkDone: function() {
    const { markers } = this.data;
    const idx = markers.findIndex(el => {
      return !el.text && !el.longitude && !el.latitude;
    });
    if (idx === -1) {
      this.setData({ submitDisabled: false });
    } else {
      this.setData({ submitDisabled: true });
    }
  },
  toSearch: function(idx) {
    const that = this;
    const { markers, latitude, longitude } = this.data;
    wx.navigateTo({
      url: '/pages/search/index',
      events: {
        confirm: function(data) {
          markers[idx] = { ...markers[idx], ...data };
          that.setData({ markers }, () => that.checkDone());
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
    this.setData({ markers }, () => {
      this.checkDone();
    });
  },
  bindDelete: function(e) {
    const { idx } = e.detail;
    const { markers } = this.data;
    markers.splice(idx, 1);
    this.setData({ markers }, () => {
      this.checkDone();
    });
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
  onReady: function() {
    this.mapCtx = wx.createMapContext('home-map');
    this.amap = new amapFile.AMapWX({ key: amapKey });
  },

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
