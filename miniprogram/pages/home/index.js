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
    polylineMap: {},
    markers: [
      {
        text: '',
        name: '',
        disabled: true
      },
      {
        text: '',
        name: '',
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
      const { markers } = this.data;
      const routes = {};
      const polyline = [];
      const polylineMap = {};
      const promise = [];
      const that = this;
      this.setData({ loading: true });
      for (let i = 0; i < markers.length - 1; i++) {
        for (let j = i + 1; j < markers.length; j++) {
          const i2j = `${markers[i].id},${markers[j].id}`;
          const j2i = `${markers[j].id},${markers[i].id}`;
          // check if already exist
          if (this.data.routes[i2j]) {
            routes[i2j] = routes[j2i] = this.data.routes[i2j];
            polylineMap[i2j] = polylineMap[j2i] = this.data.polylineMap[i2j];
            polyline.push(polylineMap[i2j]);
            continue;
          }
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
                  const steps = {
                    points,
                    color: '#00B2B2',
                    width: 6
                  };
                  polyline.push(steps);
                  polylineMap[i2j] = polylineMap[j2i] = steps;
                  routes[i2j] = routes[j2i] = route;
                  resolve();
                },
                fail: function(info) {
                  reject(info);
                }
              });
            })
          );
        }
      }
      if (promise.length === 0) {
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
        this.setData(
          {
            polyline,
            polylineMap,
            routes,
            loading: false,
            expand: false,
            editMode: false,
            welcome: false
          },
          () => this.getPlan()
        );
        return;
      }
      Promise.all(promise)
        .then(() => {
          const points = [];
          let i = 0;
          console.log(polyline);
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
          this.setData(
            {
              polyline,
              polylineMap,
              routes,
              loading: false,
              expand: false,
              editMode: false,
              welcome: false
            },
            () => this.getPlan()
          );
        })
        .catch(err => {
          console.error(err);
        });
    }
  },
  getPlan: function() {
    const { routes, markers } = this.data;
    console.log(routes, markers);
  },
  checkDone: function() {
    const { markers } = this.data;
    const idx = markers.findIndex(el => {
      return !el.name && !el.duration && !el.longitude && !el.latitude;
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
          markers[idx].text = `${data.name} - ${data.duration} h`;
          that.setData({ markers }, () => that.checkDone());
        }
      },
      success: function(res) {
        res.eventChannel.emit('onload', {
          keywords: markers[idx].name,
          latitude,
          longitude
        });
      }
    });
  },
  bindAdd: function(e) {
    const { markers } = this.data;
    markers.push({ text: '', name: '', disabled: true });
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
