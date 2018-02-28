var xnew;
var ynew;
var sizenew;
var addNewPointFlag;
// 填充平滑
export const smoothPoly = function (arrs, interval, distance) {
  if (arrs[0][0] instanceof Array) {
    for (let i = 0; i < arrs.length; i++) {
      arrs[i] = smoothLine(arrs[i], interval, distance);
    }
  }
  return arrs;
};

// 线条平滑  ----二维数组
export const smoothLine = function (arrs, interval, distance) { // 0,1，0.25
  if (arrs.length < 3) {
    return arrs;
  }
  var points = getPositionFromDistance(arrs, distance);
  if (points) {
    var ps = points; // getSmoothPositionFromAngle(points,0);
    var xs = [];
    var ys = [];
    for (let i = 0; i < ps.length; i++) {
      xs.push(parseFloat(ps[i][0] || ps[i].x));
      ys.push(parseFloat(ps[i][1] || ps[i].y));
    }

    return smooth(xs, ys, interval);
  } else {
    console.log('没有平滑，抽取失败');
    return arrs;
  }
};

/**
 * 间隔 样条平滑
 * @param x 横坐标
 * @param y 纵坐标
 * @param interval 间隔
 * @return 二维数组 第一纬为x 第二维为y
 */
function smooth (x, y, interval) {
  var result = new Array(2);
  if (x == null || y == null || x.length !== y.length) {
    result[0] = x;
    result[1] = y;
    return _formatPoint(result[0], result[1]);
  }
  var isClosed = false;
  var splineCount = getSplinePointCount(x, y, interval);
  if (x[0] === x[x.length - 1] && y[0] === y[y.length - 1]) {
    isClosed = true;
  }
  if (!isClosed) {
    result[0] = new Array(splineCount);
    result[1] = new Array(splineCount);
    splineProc(x, y, interval, result[0], result[1]);
    return _formatPoint(result[0], result[1]);
  }

  if (splineCount.length <= x.length) {
    return _formatPoint(x, y);
  }

  result[0] = new Array(splineCount);
  result[1] = new Array(splineCount);
  splineProc(x, y, interval, result[0], result[1]);
  return _formatPoint(result[0], result[1]);
}
/**
 * 获取插值平滑后输出的点数
 * @param x 横坐标
 * @param y 纵坐标
 * @param interval 间隔
 * @return 个数
 */
function getSplinePointCount (x, y, interval) {
  // 计算距离
  if (x.length !== y.length) {
    // console.log("x长度：" + x.length + ", y长度：" + y.length);
    // console.log("In MIDS3DMath.getSplinePointCount()中输入的x y的长度不同");
  }
  if (x.length <= 2 || y.length <= 2) {
    // console.log("x、y的个数太少，无法插值");
    return x.length;
  }

  var size = x.length;
  var dis = new Array(size - 1);
  var dmin = 0.0;
  var dmax = 0.0;

  // [-180,180]转换为[0,360]
  for (let i = 0; i < size; i++) {
    if (x[i] < -1e-10) {
      x[i] = x[i] + 360.0;
    }
  }
  for (let i = 0; i < size - 1; i++) {
    var tmp = (x[i + 1] - x[i]) * (x[i + 1] - x[i]) + (y[i + 1] - y[i]) * (y[i + 1] - y[i]);

    if (tmp !== 0.0) {
      dmin = tmp;
      dmax = tmp;
    }
  }

  if (dmin === 0.0 || dmax === 0.0) {
    console.log('相邻两点间, 最小距离：' + dmin + '; 最大距离：' + dmax);
    console.log('In MIDS3DMath.getSplinePointCount() 中输入的点相同');
  }

  // 找到相邻两点之间的最大最小距离
  for (let i = 0; i < size - 1; i++) {
    dis[i] = (x[i + 1] - x[i]) * (x[i + 1] - x[i]) + (y[i + 1] - y[i]) * (y[i + 1] - y[i]);

    if (dis[i] > dmax) {
      dmax = dis[i];
    }
    if (dis[i] < dmin && dis[i] !== 0.0) {
      dmin = dis[i];
    }
  }

  var xinsert = [];
  var yinsert = [];

  addNewPointFlag = false;
  var MAXINTERVAL = 2000;// 两点之间最大最小距离>2000倍的时候不插值
  var MAXMINRATE = 6;// 两点之间最大最小距离小于6倍的不需要增加点，可直接进行插值
  var CURPTMINRATE = 4;// 当前点和最小距离之间的倍数小于4时，不增加点，4~8倍增加一个点，8~12倍增加两个点...
  for (let i = 0; i < size - 1; i++) {
    if (dmax < MAXMINRATE * MAXMINRATE * dmin) {
      break;
    }

    addNewPointFlag = true;
    xinsert.push(x[i]);
    yinsert.push(y[i]);

    var yytmp = y[i + 1] - y[i];
    var xxtmp = x[i + 1] - x[i];
    for (let j = 1; j < MAXINTERVAL / CURPTMINRATE; j++) {
      if (dis[i] <= CURPTMINRATE * CURPTMINRATE * dmin) {
        break;
      }

      if (dis[i] > j * j * CURPTMINRATE * CURPTMINRATE * dmin && dis[i] <= (j + 1) * (j + 1) * CURPTMINRATE * CURPTMINRATE * dmin) {
        for (let n = 1; n <= j; n++) {
          var xtmp;
          var ytmp;
          if (yytmp === 0.0) {
            xtmp = x[i] + n * xxtmp / (j + 1);
            ytmp = y[i];
          } else {
            if (xxtmp === 0.0) {
              xtmp = x[i];
              ytmp = y[i] + n * yytmp / (j + 1);
            } else {
              xtmp = x[i] + n * xxtmp / (j + 1);
              ytmp = y[i] + n * yytmp / (j + 1);
            }
          }

          xinsert.push(xtmp);
          yinsert.push(ytmp);
        }
        break;
      }
    }
    if (dis[i] > MAXINTERVAL * MAXINTERVAL * dmin) {
      console.log('x[' + i + '] = ' + x[i] + ', y[' + i + '] = ' + y[i]);
      console.log('x[' + (i + 1) + '] = ' + x[i + 1] + ', y[' + (i + 1) + '] = ' + y[i + 1]);
      console.log('以上两点之间的距离dis = ' + dis[i]);
      console.log('最小距离dmin = ' + dmin);
      console.log('In MIDS3DMath.getSplinePointCount()存在相邻两点之间的距离太大，插值不准确，请重新选择点');
      return false;
    }
  }

  if (addNewPointFlag) {
    xinsert.push(x[size - 1]);
    yinsert.push(y[size - 1]);
  }
  if (xinsert.length !== 0) {
    if (xinsert.length !== yinsert.length) {
      console.log('In MIDS3DMath.getSplinePointCount()增加的点的x y个数不同');
    }
  }

  if (xinsert.length === 0) {
    sizenew = size;
    xnew = new Array(size);
    xnew = x;
    ynew = new Array(size);
    ynew = y;
  } else {
    sizenew = xinsert.length;
    xnew = new Array(sizenew);
    ynew = new Array(sizenew);
    for (let i = 0; i < sizenew; i++) {
      xnew[i] = xinsert[i];
      ynew[i] = yinsert[i];
    }
  }

  var xShift = new Array(sizenew);
  var yShift = new Array(sizenew);
  var t = new Array(sizenew);
  var index = [];
  for (let i = 0; i < sizenew; i++) {
    if (i === 0) {
      xShift[i] = xnew[sizenew - 1];
      yShift[i] = ynew[sizenew - 1];
    } else {
      xShift[i] = xnew[i - 1];
      yShift[i] = ynew[i - 1];
    }

    t[i] = Math.sqrt((xnew[i] - xShift[i]) * (xnew[i] - xShift[i]) + (ynew[i] - yShift[i]) * (ynew[i] - yShift[i]));
    if (i > 0 && t[i] > 0.0) {
      index.push(i);
    }
  }

  t[0] = 0.0;
  if (index.length === 0) {
    return 0;
  }
  var length = index.length + 1;
  var xx = new Array(length);
  var yy = new Array(length);
  var tt = new Array(length);
  var r = 0;
  var rr = new Array(length);
  var kk = 0;
  for (let i = 0; i < length; i++) {
    if (i === 0) {
      xx[i] = xnew[0];
      yy[i] = ynew[0];
      tt[i] = t[0];
    } else {
      xx[i] = xnew[index[kk]];
      yy[i] = ynew[index[kk]];
      tt[i] = t[index[kk]];
      kk++;
    }
    rr[i] = (Math.ceil(tt[i] / interval));
    r = parseInt(r + rr[i]);
  }

  return r + 1;
}

/**
 * 线条平滑
 * @param x 横坐标
 * @param y 纵坐标
 * @param interval 间隔
 * @param xout 输出插值完成的横坐标
 * @param yout 输出插值完成的纵坐标
 * @return 插值平滑成功返回true，否则false
 */
function splineProc (x, y, interval, xout, yout) {
  if (xout.length === 0 || yout.length === 0) {
    return [x, y];
  }
  if (x == null || y == null) {
    console.log('x或y为null');
    return [x, y];
  }
  if (x.length !== y.length) {
    // console.log("x长度：" + x.length + ", y长度：" + y.length);
    // console.log("In MIDS3DMath.getSplinePointCount()中输入的x y的长度不同");
  }
  if (x.length <= 2 || y.length <= 2) {
    // console.log("x、y的个数太少，无法插值");
    xout = x;
    yout = y;
    return [x, y];
  }

  // [-180,180]转换为[0,360]
  for (let i = 0; i < x.length; i++) {
    if (x[i] < 1e-10) {
      x[i] = x[i] + 360.0;
    }
  }
  var xSize, ySize;
  var size, xShift, yShift, t, index;
  var length, xx, yy, tt, r, rr, kk;
  var count, ttt, k, j;
  var xp, yp;

  if (!addNewPointFlag) {
    xSize = x.length;
    ySize = y.length;
    if (xSize !== ySize) {
      console.log('In MIDS3DMath.splineProcAry()中输入的x,y点的个数不同');
      return false;
    }
    if (xSize <= 2) {
      console.log('In MIDSMath.splineProcAry()中x,y的个数太少,不满足平滑条件,按原值返回');
      xout = x;
      yout = y;
      return true;
    }
    size = xSize;
    xShift = new Array(size);
    yShift = new Array(size);
    t = new Array(size);
    index = [];

    for (let i = 0; i < x.length; i++) {
      if (i === 0) {
        xShift[i] = x[size - 1];
        yShift[i] = y[size - 1];
      } else {
        xShift[i] = x[i - 1];
        yShift[i] = y[i - 1];
      }

      t[i] = Math.sqrt((x[i] - xShift[i]) * (x[i] - xShift[i]) + (y[i] - yShift[i]) * (y[i] - yShift[i]));
      if (i > 0 && t[i] > 0.0) {
        index.push(i);
      }
    }

    t[0] = 0.0;
    if (index.length === 0 || index.length < 2) {
      return false;
    }
    length = index.length + 1;
    xx = new Array(length);
    yy = new Array(length);
    tt = new Array(length);
    r = 0;
    rr = new Array(length);
    kk = 0;
    for (let i = 0; i < length; i++) {
      if (i === 0) {
        xx[i] = x[0];
        yy[i] = y[0];
        tt[i] = t[0];
      } else {
        xx[i] = x[index[kk]];
        yy[i] = y[index[kk]];
        tt[i] = t[index[kk]];
        kk++;
      }
      rr[i] = Math.ceil(tt[i] / interval);
      r = parseInt(r + rr[i]);
    }

    count = r + 1;
    if (xout.length < count) {
      return false;
    }
    ttt = new Array(count);
    j = 0;
    for (let i = 1; i < length; i++) {
      k = parseInt(rr[i]);
      for (let m = 0; m < k; m++) {
        ttt[parseInt(j + m)] = m * (tt[i] / k) + tt[i - 1];
      }
      tt[i] = tt[i] + tt[i - 1];
      j = j + k;
    }
    ttt[parseInt(j)] = tt[length - 1];
    xp = spline(tt, xx, ttt);
    yp = spline(tt, yy, ttt);

    for (let i = 0; i < count; i++) {
      if (xp[i] - 180.0 > 1e-10) {
        xout[i] = xp[i] - 360.0;
      } else {
        xout[i] = xp[i];
      }
      yout[i] = yp[i];
    }

    if (xout.length !== yout.length) {
      console.log('In MIDS3DMath.splineProc()中平滑插值出的x,y值个数不同,出错');
      return false;
    }
    // 如果是闭合线则必须保证首尾两点相等
    if (x[0] === x[x.length - 1] && y[0] === y[y.length - 1]) {
      if (xout[0] !== xout[count - 1]) {
        xout[count - 1] = xout[0];
      }
      if (yout[0] !== yout[count - 1]) {
        yout[count - 1] = yout[0];
      }
    }
    xp = null;
    yp = null;
    return true;
  } else {
    xSize = xnew.length;
    ySize = ynew.length;
    if (xSize !== ySize) {
      console.log('In MIDS3DMath.splineProcAry()中输入的x,y点的个数不同');
      return false;
    }
    if (xSize <= 2) {
      console.log('In MIDSMath.splineProcAry()中x,y的个数太少,不满足平滑条件,按原值返回');
      xout = xnew;
      yout = ynew;
      return true;
    }
    size = xSize;
    xShift = new Array(size);
    yShift = new Array(size);
    t = new Array(size);
    index = [];
    for (let i = 0; i < size; i++) {
      if (i === 0) {
        xShift[i] = xnew[size - 1];
        yShift[i] = ynew[size - 1];
      } else {
        xShift[i] = xnew[i - 1];
        yShift[i] = ynew[i - 1];
      }

      t[i] = Math.sqrt((xnew[i] - xShift[i]) * (xnew[i] - xShift[i]) + (ynew[i] - yShift[i]) * (ynew[i] - yShift[i]));
      if (i > 0 && t[i] > 0.0) {
        index.push(i);
      }
    }

    t[0] = 0.0;
    if (index.length === 0) {
      return false;
    }
    length = index.length + 1;
    xx = new Array(length);
    yy = new Array(length);
    tt = new Array(length);
    r = 0;
    rr = new Array(length);
    kk = 0;
    for (let i = 0; i < length; i++) {
      if (i === 0) {
        xx[i] = xnew[0];
        yy[i] = ynew[0];
        tt[i] = t[0];
      } else {
        xx[i] = xnew[index[kk]];
        yy[i] = ynew[index[kk]];
        tt[i] = t[index[kk]];
        kk++;
      }
      rr[i] = Math.ceil(tt[i] / interval);
      r = parseInt(r + rr[i]);
    }

    count = r + 1;
    ttt = new Array(count);
    j = 0;
    for (let i = 1; i < length; i++) {
      k = parseInt(rr[i]);
      for (let m = 0; m < k; m++) {
        ttt[parseInt(j + m)] = m * (tt[i] / k) + tt[i - 1];
      }
      tt[i] = tt[i] + tt[i - 1];
      j = j + k;
    }

    ttt[parseInt(j)] = tt[length - 1];
    xp = spline(tt, xx, ttt);
    yp = spline(tt, yy, ttt);
    if (xp !== null && yp !== null) {
      for (let i = 0; i < count; i++) {
        if (xp[i] - 180.0 > 1e-10) {
          xout[i] = xp[i] - 360.0;
        } else {
          xout[i] = xp[i];
        }
        yout[i] = yp[i];
      }
    }

    if (xout.length !== yout.length) {
      console.log('In MIDS3DMath.splineProc()中平滑插值出的x,y值个数不同,出错');
      return false;
    }
    // 如果是闭合线则必须保证首尾两点相等
    if (x[0] === x[x.length - 1] && y[0] === y[y.length - 1]) {
      if (xout[0] !== xout[count - 1]) {
        xout[count - 1] = xout[0];
      }
      if (yout[0] !== yout[count - 1]) {
        yout[count - 1] = yout[0];
      }
    }
    xp = null;
    yp = null;
    return true;
  }
}
/**
 * @param x
 * @param y
 * @param t
 * @return
 */
function spline (x, y, t) {
  var xLen = x.length;
  var yLen = y.length;
  var tLen = t.length;
  if (xLen !== yLen) {
    console.log('In MIDS3DMath.spline()中 X and Y must have same elements.');
    return null;
  }
  if (xLen <= 2) {
    console.log('In MIDS3DMath.spline()中 X and Y must be arrays of 3 or more elements.');
    return null;
  }
  var size = xLen;
  var sigma = 1.0;
  var yp = new Array(2 * size);

  var delx1 = x[1] - x[0];
  var dx1 = (y[1] - y[0]) / delx1;
  var delx2 = x[2] - x[1];
  var delx12 = x[2] - x[0];
  var c1 = -(delx12 + delx1) / delx12 / delx1;
  var c2 = delx12 / delx1 / delx2;
  var c3 = -delx1 / delx12 / delx2;

  var slpp1 = c1 * y[0] + c2 * y[1] + c3 * y[2];
  var nm1 = size - 1;
  // var np1 = size + 1;
  var deln = x[nm1] - x[nm1 - 1];
  var delnm1 = x[nm1 - 1] - x[nm1 - 2];
  var delnn = x[nm1] - x[nm1 - 2];
  c1 = (delnn + deln) / delnn / deln;
  c2 = -delnn / deln / delnm1;
  c3 = deln / delnn / delnm1;
  var slppn = c3 * y[nm1 - 2] + c2 * y[nm1 - 1] + c1 * y[nm1];

  var sigmap = sigma * nm1 / (x[nm1] - x[0]);
  var dels = sigmap * delx1;
  var exps = Math.exp(dels);
  var sinhs = 0.5 * (exps - 1.0 / exps);
  var sinhin = 1.0 / (delx1 * sinhs);
  var diag1 = sinhin * (dels * 0.5 * (exps + 1.0 / exps) - sinhs);
  var diagin = 1.0 / diag1;
  yp[0] = diagin * (dx1 - slpp1);
  var spdiag = sinhin * (sinhs - dels);
  yp[size] = diagin * spdiag;

  var delxx2 = new Array(size - 1);
  var delss = new Array(size - 1);
  var dx2 = new Array(size - 1);
  var expss = new Array(size - 1);
  var sinhss = new Array(size - 1);
  var sinhnn = new Array(size - 1);
  var diag2 = new Array(size - 1);
  var spdiagg = new Array(size - 1);

  for (let i = 0; i < size - 1; i++) {
    delxx2[i] = x[i + 1] - x[i];
    dx2[i] = (y[i + 1] - y[i]) / delxx2[i];
    delss[i] = sigmap * delxx2[i];
    expss[i] = Math.exp(delss[i]);
    sinhss[i] = 0.5 * (expss[i] - 1.0 / expss[i]);
    sinhnn[i] = 1.0 / (delxx2[i] * sinhss[i]);
    diag2[i] = sinhnn[i] * (delss[i] * (0.5 * (expss[i] + 1.0 / expss[i])) - sinhss[i]);
    spdiagg[i] = sinhnn[i] * (sinhss[i] - delss[i]);
  }
  var dx2nm1 = dx2[nm1 - 1];
  var tmpdiag2 = new Array(size - 2);
  var tmpdx2 = new Array(size - 2);
  for (let i = size - 1 - 1 - 1; i >= 0; i--) {
    tmpdiag2[i] = diag2[i + 1];
    diag2[i + 1] = diag2[i] + tmpdiag2[i];
    tmpdx2[i] = dx2[i + 1];
    dx2[i + 1] = tmpdx2[i] - dx2[i];
  }
  diag2[0] = 0;
  dx2[0] = 0;
  for (let i = 1; i <= nm1 - 1; i++) {
    diagin = 1.0 / (diag2[i] - spdiagg[i - 1] * yp[i + size - 1]);
    yp[i] = diagin * (dx2[i] - spdiagg[i - 1] * yp[i - 1]);
    yp[i + size] = diagin * spdiagg[i];
  }
  diagin = 1.0 / (diag1 - spdiagg[nm1 - 1] * yp[size + nm1 - 1]);
  yp[nm1] = diagin * (slppn - dx2nm1 - spdiagg[nm1 - 1] * yp[nm1 - 1]);
  for (let i = size - 2; i >= 0; i--) {
    yp[i] = yp[i] - yp[i + size] * yp[i + 1];
  }
  var subs = new Array(tLen);
  for (let i = 0; i < tLen; i++) {
    subs[i] = nm1;
  }
  var s = x[nm1] - x[0];
  sigmap = sigma * nm1 / s;
  var j = 0;
  for (let i = 1; i <= nm1; i++) {
    while (t[j] < x[i]) {
      subs[j] = i;
      j++;
      if (j === tLen) {
        return getSplineData(tLen, subs, sigmap, x, y, t, yp);
      }
    }
  }
  return getSplineData(tLen, subs, sigmap, x, y, t, yp);
}
/**
 *
 * @param tLen
 * @param subs
 * @param sigmap
 * @param x
 * @param y
 * @param t
 * @param yp
 * @return
 */
function getSplineData (tLen, subs, sigmap, x, y, t, yp) {
  var subs1 = new Array(tLen);
  var del1 = new Array(tLen);
  var del2 = new Array(tLen);
  var delss1 = new Array(tLen);
  var exps1 = new Array(tLen);
  var exps2 = new Array(tLen);
  var exps3 = new Array(tLen);
  var sinhd1 = new Array(tLen);
  var sinhd2 = new Array(tLen);
  var sinhs2 = new Array(tLen);
  var spl = new Array(tLen);
  for (let k = 0; k < tLen; k++) {
    subs1[k] = subs[k] - 1;
    del1[k] = t[k] - x[subs1[k]];
    del2[k] = x[subs[k]] - t[k];
    delss1[k] = x[subs[k]] - x[subs1[k]];
    exps1[k] = Math.exp(sigmap * del1[k]);
    sinhd1[k] = 0.5 * (exps1[k] - 1 / exps1[k]);
    exps2[k] = Math.exp(sigmap * del2[k]);
    sinhd2[k] = 0.5 * (exps2[k] - 1 / exps2[k]);
    exps3[k] = exps1[k] * exps2[k];
    sinhs2[k] = 0.5 * (exps3[k] - 1 / exps3[k]);
    spl[k] = (yp[subs[k]] * sinhd1[k] + yp[subs1[k]] * sinhd2[k]) / sinhs2[k] + ((y[subs[k]] - yp[subs[k]]) * del1[k] + (y[subs1[k]] - yp[subs1[k]]) * del2[k]) / delss1[k];
  }
  return (tLen === 1) ? [spl[0]] : spl;
}

/**
 * 对一列有序的点根据距离间隔distance抽取大于此距离的点
 * @param linePos 有序点集合
 * @param distance 距离条件
 * @return 大于distance的点集
 */
function getPositionFromDistance (linePos, distance) {
  if (linePos == null || linePos.length === 0) {
    return null;
  }
  // System.out.println("原始点个数：" + linePos.size());
  var newPos = [];
  for (let i in linePos) {
    newPos[i] = linePos[i];
  }

  var size = newPos.length;
  var flag = newPos[0] === newPos[size - 1];// 第一个点和最后一个点是否重合，即这些点构成的多边形是否闭合

  var dist;
  var j = 0;
  var hasMinDistPtflag = true;
  while (hasMinDistPtflag) {
    var hasFlag = false;
    for (let i = 0; i < newPos.length - 1; i++) {
      if (newPos[i]) {
        j = i + 1;
        while (!newPos[j] && j < newPos.length) {
          j++;
        }
        if (j === newPos.length) {
          break;
        }
        // 判断距离，去除距离很近的后一个点
        dist = getDistanceFrom2Pts(newPos[i], newPos[j]);
        if (dist < distance) {
          if (j === newPos.length - 1) {
            delete newPos[i];// 不能去除最后一个点
          } else {
            delete newPos[j];
          }
          hasMinDistPtflag = true;
          hasFlag = true;
          break;
        }
      }
    }
    if (!hasFlag) {
      hasMinDistPtflag = false;
    }
  }
  if (flag) {
    if (newPos.length < 4) {
      return null;
    }
  } else {
    if (newPos.length < 2) {
      return null;
    }
  }
  var arr = [];
  for (let i in newPos) {
    arr.push(newPos[i]);
  }

  return arr;
}

/**
 * 对一列有序的点根据角度maxAngle去毛刺，尖角，
 * @param linePos 有序点集合
 * @param maxAngle 角度条件
 * @return 平滑去毛刺后的点集
 */
// function getSmoothPositionFromAngle (linePos, maxAngle) {
//   if (linePos == null || linePos.length === 0) {
//     console.log('原始点个数：' + linePos.size());
//     return null;
//   }
//   // System.out.println("原始点个数：" + linePos.size());
//   var newPos = [];
//   for (let i in linePos) {
//     newPos[i] = linePos[i];
//   }

//   var size = newPos.length;
//   if (size <= 10) {
//     return newPos;// 暂定小于等于10个点返回；点太少，处理后形状会改变太大
//   }

//   // boolean flag =
//   // newPos.get(0).equals(newPos.get(size-1));//第一个点和最后一个点是否重合，即这些点构成的多边形是否闭合
//   var inclination;// 夹角
//   var j = 0;
//   var k = 0;
//   var hasMinAnglePtFlag = true;
//   while (hasMinAnglePtFlag) {
//     var hasFlag = false;
//     for (let i = 1; i < newPos.length - 1; i++) {
//       if (newPos[i]) {
//         j = i - 1;
//         while (!newPos[j] && j >= 0) {
//           j--;
//         }
//         k = i + 1;
//         while (!newPos[k] && k < newPos.length) {
//           k++;
//         }
//         if (j < 0 || k === newPos.length) {
//           break;
//         }
//         // 根据角度条件去除毛刺
//         inclination = getAngleFrom3Pts(newPos[j], newPos[i], newPos[k]);
//         if (inclination < maxAngle) {
//           delete newPos[i];
//           hasMinAnglePtFlag = true;
//           hasFlag = true;
//           break;
//         }
//       }
//     }
//     if (!hasFlag) {
//       hasMinAnglePtFlag = false;
//     }

//     if (newPos.length <= 4) { // 小于四个点直接返回；如果小于4个点还去毛刺，有可能会导致只剩一个点
//       console.log('点数小于4个');
//       break;
//     }
//   }

//   var arr = [];
//   for (let i in newPos) {
//     arr.push(newPos[i]);
//   }

//   return arr;
// }

/**
 * 算两个点之间的距离
 * @param pt1
 * @param pt2
 * @returns {*}
 */
function getDistanceFrom2Pts (p1, p2) {
  if (p1 && p2) {
    return Math.sqrt((p1[0] - p2[0]) * (p1[0] - p2[0]) + (p1[1] - p2[1]) * (p1[1] - p2[1]));
  } else {
    console.log('点数据错误');
    return 2000;
  }
}

/**
 * 三点之间的夹角
 * @param p1
 * @param p2 夹角所在点
 * @param p3
 * @return
 */
// function getAngleFrom3Pts (p1, p2, p3) {
//   var a2 = (p1[0] - p2[0]) * (p1[0] - p2[0]) + (p1[1] - p2[1]) * (p1[1] - p2[1]);
//   var c2 = (p1[0] - p3[0]) * (p1[0] - p3[0]) + (p1[1] - p3[1]) * (p1[1] - p3[1]);
//   var b2 = (p2[0] - p3[0]) * (p2[0] - p3[0]) + (p2[1] - p3[1]) * (p2[1] - p3[1]);
//   var a = Math.sqrt(a2);
//   var b = Math.sqrt(b2);
//   var tmp2ab = 2 * a * b;
//   var cosC = (a2 + b2 - c2) / tmp2ab;
//   if (cosC > 0.999) {
//     cosC = 0.999;
//   } else if (cosC < -0.999) {
//     cosC = -0.999;
//   }
//   return Math.acos(cosC) / Math.PI * 180;
// }

/**
 * 将结果重新组织成二维数组
 * @param arr1
 * @param arr2
 * @returns {Array}
 * @private
 */
function _formatPoint (arr1, arr2) {
  var result = [];
  for (let i = 0; i < arr1.length; i++) {
    if (arr1[i] && arr2[i]) {
      result.push([arr1[i], arr2[i]]);
    }
  }
  return result;
}
