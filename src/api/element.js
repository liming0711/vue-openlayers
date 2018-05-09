import BaseModule from './base-module';

class Element extends BaseModule {
  getHumidity () {
    return this.get('static/data/rh.json');
  }
  getFire () {
    return this.get('http://cdnrepo.oss-cn-shanghai.aliyuncs.com/firepoint/all/2017/10/27/HS_H08_20171027_1340_B03_FLDK.json').then(res => {
      if (res.status === 200 && res.data) {
        if (res.data.features && res.data.features.length) {
          return new Promise(resolve => {
            resolve(res.data.features);
          });
        } else {
          alert('数据为空');
        }
      } else {
        alert('获取数据失败');
      }
    });
  }
  getWind () {
    return this.get('static/data/wd.json');
  }
  getStationName () {
    return this.get('static/data/sta.json');
  }
  getRailway () {
    return this.get('static/data/lines.json');
  }
  getVector () {
    return this.get('static/data/polyno.json');
  }
  getRadar () {
    return this.get('static/data/radar.json');
  }
}

export default new Element();
