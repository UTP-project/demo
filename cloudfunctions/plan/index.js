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

function sortDistance(r1, r2) {
  if (r1.distance < r2.distance) return -1;
  if (r1.distance > r2.distance) return 1;

  if (r1.duration < r2.duration) return -1;
  if (r1.duration > r2.duration) return 1;

  return r1.cost - r2.cost;
}

function sortDuration(r1, r2) {
  if (r1.duration < r2.duration) return -1;
  if (r1.duration > r2.duration) return 1;

  if (r1.cost < r2.cost) return -1;
  if (r1.cost > r2.cost) return 1;

  return r1.distance - r2.distance;
}

function sortCost(r1, r2) {
  if (r1.cost < r2.cost) return -1;
  if (r1.cost > r2.cost) return 1;

  if (r1.distance < r2.distance) return -1;
  if (r1.distance > r2.distance) return 1;

  return r1.duration - r2.duration;
}

// main
function recursicve(
  paths,
  points,
  idx = 0,
  plan,
  route = [[]],
  time = startTime,
  distance = 0,
  cost = 0,
  duration = 0
) {
  // all points add in route, end of this route
  if (idx === points.length) {
    const nroute = {
      route: deepClone(route),
      distance,
      cost,
      duration
    };
    if (plan.length === 0) {
      plan.push({ ...nroute, desc: '最短时间' });
      plan.push({ ...nroute, desc: '最短距离' });
      plan.push({ ...nroute, desc: '最少消费' });
    } else {
      const days = nroute.route.length;
      if (
        days > plan[0].route.length &&
        days > plan[1].route.length &&
        days > plan[2].route.length
      ) {
        return;
      }
      // duration
      if (days < plan[0].route.length) {
        // minimum day is prioritized
        plan[0] = { ...nroute, desc: '最短时间' };
      } else {
        const tmp = [plan[0], nroute];
        tmp.sort(sortDuration);
        plan[0] = { ...tmp[0], desc: '最短时间' };
      }

      // distance
      if (days < plan[1].route.length) {
        // minimum day is prioritized
        plan[1] = { ...nroute, desc: '最短距离' };
      } else {
        const tmp = [plan[1], nroute];
        tmp.sort(sortDistance);
        plan[1] = { ...tmp[0], desc: '最短距离' };
      }

      // cost
      if (days < plan[2].route.length) {
        // minimum day is prioritized
        plan[2] = { ...nroute, desc: '最少消费' };
      } else {
        const tmp = [plan[2], nroute];
        tmp.sort(sortCost);
        plan[2] = { ...tmp[0], desc: '最少消费' };
      }
    }
    return;
  }
  // pruning
  const days = route.length;
  if (plan.length > 2) {
    const notOptimal =
      (duration > plan[0].duration &&
        distance > plan[1].distance &&
        cost > plan[2].cost) ||
      (days > plan[0].route.length &&
        days > plan[1].route.length &&
        days > plan[2].route.length);
    if (notOptimal) {
      return;
    }
  }
  // traverse, n!
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
      const nduration = duration + path.duration / 60;
      const ndistance = distance + path.distance;
      const ncost = cost + path.cost;
      if (ntime < endTime) {
        curDay.push(points[i]);
        record[i] = true;
        recursicve(
          paths,
          points,
          idx + 1,
          plan,
          route,
          ntime,
          ndistance,
          ncost,
          nduration
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
          plan,
          route,
          startTime + points[i].duration,
          distance,
          cost,
          duration
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

  const plan = [];
  recursicve(paths, points, 0, plan);

  return {
    plan
  };
};
