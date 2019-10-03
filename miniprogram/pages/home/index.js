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
    polyline: {},
    curDay: 1,
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
    markersMap: {},
    latitude: '',
    longitude: '',
    plan: {}
  },

  includePoints: function() {
    const { polyline } = this.data;
    const points = [];
    let i = 0;
    const keys = Object.keys(polyline);
    while (i < keys.length) {
      let j = 0;
      while (j < polyline[keys[i]].length) {
        if (Array.isArray(polyline[keys[i]][j].points)) {
          points.push(...polyline[keys[i]][j].points);
        }
        j++;
      }
      i++;
    }
    this.mapCtx.includePoints({
      points,
      padding: [40, 40, 40, 40]
    });
  },
  collapse: function() {
    this.setData({ expand: false, editMode: false });
  },
  expand: function() {
    this.setData({ expand: true, editMode: true });
  },
  changeDay: function(e) {
    const { day } = e.target.dataset;
    if (day) {
      this.setData({ curDay: day });
    }
  },
  search: function() {
    if (!this.data.submitDisabled) {
      const { markers } = this.data;
      const routes = {};
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
        this.setData(
          {
            polylineMap,
            routes
          },
          () => this.getPlan()
        );
        return;
      }
      Promise.all(promise)
        .then(() => {
          this.setData(
            {
              polylineMap,
              routes
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
    const that = this;
    const { routes, markers, markersMap, polylineMap } = this.data;
    const points = markers.map(el => ({
      id: el.id,
      duration: el.duration
    }));
    const polyline = {};
    wx.cloud.callFunction({
      name: 'plan',
      data: {
        points,
        paths: routes
      },
      success: function(res) {
        const { plan } = res.result;
        if (plan) {
          if (plan[0] && plan[0].route) {
            let i = 0;
            while (i < plan[0].route.length) {
              let j = 0;
              const curDay = i + 1;
              const attractions = plan[0].route[i];
              if (attractions.length - 1 === 0) {
                const points = [markers[markersMap[attractions[j].id]]];
                polyline[curDay] = [
                  {
                    points,
                    color: '#00B2B2',
                    width: 6
                  }
                ];
              }
              while (j < attractions.length - 1) {
                if (!polyline[curDay]) {
                  polyline[curDay] = [];
                }
                polyline[curDay].push(
                  polylineMap[`${attractions[j].id},${attractions[j + 1].id}`]
                );
                j++;
              }
              i++;
            }
          }
          that.setData(
            {
              plan,
              polyline,
              curDay: 1,
              loading: false,
              expand: false,
              editMode: false,
              welcome: false
            },
            () => that.includePoints()
          );
        }
      },
      fail: function(err) {
        that.setData({
          loading: false,
          expand: false,
          editMode: false,
          welcome: false
        });
        console.error(err);
      }
    });
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
    const { markers, markersMap, latitude, longitude } = this.data;
    wx.navigateTo({
      url: '/pages/search/index',
      events: {
        confirm: function(data) {
          markers[idx] = { ...markers[idx], ...data };
          markers[idx].text = `${data.name} - ${data.duration} h`;
          markersMap[data.id] = idx;
          that.setData({ markers, markersMap }, () => that.checkDone());
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
    const { markers, markersMap } = this.data;
    delete markersMap[markers[idx].id];
    markers.splice(idx, 1);
    this.setData({ markers, markersMap }, () => {
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
