// 云函数入口文件
const cloud = require('wx-server-sdk');

cloud.init();

const startTime = 9;
const endTime = 21;
const record = {};

function deepClone(target, map = new WeakMap()) {
  if (typeof target === 'object') {
    const isArray = Array.isArray(target);
    let cloneTarget = isArray ? [] : {};
    if (map.get(target)) {
      return map.get(target);
    }
    map.set(target, cloneTarget);
    let index = 0;
    const keys = isArray ? undefined : Object.keys(target);
    const length = isArray ? target.length : keys.length;
    while (index < length) {
      let key = index;
      if (!isArray) {
        key = keys[index];
      }
      cloneTarget[key] = deepClone(target[key], map);
      index++;
    }
    return cloneTarget;
  } else {
    return target;
  }
}

function distance2duration(distance) {
  return distance;
}

function duration2cost(duration) {
  return duration;
}

function cost2distance(cost) {
  return cost;
}

function sortDistance(r1, r2) {
  if (r1.distance < r2.distance) return -1;
  if (r1.distance > r2.distance) return 1;

  return (
    duration2cost(r1.duration) +
    r1.cost -
    (duration2cost(r2.duration) + r2.cost)
  );
}

function sortDuration(r1, r2) {
  if (r1.duration < r2.duration) return -1;
  if (r1.duration > r2.duration) return 1;

  return (
    cost2distance(r1.cost) +
    r1.distance -
    (cost2distance(r2.cost) + r2.distance)
  );
}

function sortCost(r1, r2) {
  if (r1.cost < r2.cost) return -1;
  if (r1.cost > r2.cost) return 1;

  return (
    distance2duration(r1.distance) +
    r1.duration -
    (distance2duration(r2.distance) + r2.disdurationtance)
  );
}

function recursicve(
  paths,
  points,
  idx = 0,
  routes,
  route = [[]],
  time = startTime,
  distance = 0,
  cost = 0,
  duration = 0
) {
  if (idx === points.length) {
    // all points add in route
    const nroute = {
      route: deepClone(route),
      distance,
      cost,
      duration
    };
    if (!routes.minDistance || !routes.minCost || !routes.minDuration) {
      routes.minDistance = routes.minCost = routes.minDuration = nroute;
    } else {
      // distance
      let tmp = [routes.minDistance, nroute];
      tmp.sort(sortDistance);
      routes.minDistance = tmp[0];

      // duration
      tmp = [routes.minDuration, nroute];
      tmp.sort(sortDuration);
      routes.minDuration = tmp[0];

      // cost
      tmp = [routes.minCost, nroute];
      tmp.sort(sortCost);
      routes.minCost = tmp[0];
    }
    return;
  }
  const notOptimal =
    routes.minDistance &&
    distance > routes.minDistance.distance &&
    (routes.minDuration && duration > routes.minDuration.duration) &&
    (routes.minCost && cost > routes.minCost.cost);
  if (notOptimal) {
    return;
  }
  for (let i = 0; i < points.length; i++) {
    if (!record[i]) {
      const curDay = route[route.length - 1];
      const lastPoint = curDay[curDay.length - 1];
      const path = lastPoint
        ? paths[`${lastPoint.id},${points[i].id}`]
        : {
            duration: 0,
            distance: 0,
            cost: 0
          };
      const ntime = time + path.duration / (60 * 60) + points[i].duration;
      const nDuration = duration + path.duration / 60;
      const ndistance = distance + path.distance;
      const ncost = cost + path.cost;
      if (ntime < endTime) {
        curDay.push(points[i]);
        record[i] = true;
        recursicve(
          paths,
          points,
          idx + 1,
          routes,
          route,
          ntime,
          ndistance,
          ncost,
          nDuration
        );
        curDay.pop();
        record[i] = false;
      } else {
        // new day
        const ncurDay = [];
        route.push(ncurDay);
        ncurDay.push(points[i]);
        record[i] = true;
        recursicve(
          paths,
          points,
          idx + 1,
          routes,
          route,
          startTime,
          ndistance,
          ncost,
          nDuration
        );
        route.pop();
        record[i] = false;
      }
    }
  }
}

// 云函数入口函数
exports.main = async (event, context) => {
  const { points, paths } = event;

  const plan = {};
  recursicve(paths, points, 0, plan);

  return {
    plan
  };
};
