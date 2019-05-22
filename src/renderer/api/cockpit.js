import axios from 'axios'

/** 获取设备在线情况列表 */
export function getOnline () {
  return request({
    url: 'http://cloud.bdsmc.net:8006/devicestat?project_id=12',
    method: 'get'
  })
}

/** 获取数据量统计情况 */
export function getCount () {
  return request({
    url: 'http://cloud.bdsmc.net:8006/counts',
    method: 'get'
  })
}

/** 获取数据量统计情况 */
export function getDevice (id) {
  return request({
    url: 'http://cloud.bdsmc.net:8006/devices',
    method: 'get',
    params: {
      poi_id: id
    }
  })
}

export function getDeviceData (mac, num) {
  return request({
    url: 'http://cloud.bdsmc.net:8006/devicedata',
    method: 'get',
    params: {
      mac: mac.toLowerCase(),
      num,
      frontend: 'web'
    }
  })
}

/** 发送预警广播 */
export function sendMessage (sms, phone) {
  return request({
    url: 'http://cloud.bdsmc.net:8006/sms',
    method: 'get',
    params: {
      sms,
      phone
    }
  })
}

export function getSarList (color) {
  return request({
    url: 'http://cloud.bdsmc.net:8006/insar',
    method: 'get',
    params: {color}
  })
}

export function getNxJson () {
  return request({
    url: 'static/json/xs.json',
    method: 'get'
  })
}

export function getSarJson () {
  return request({
    url: 'static/json/xsar.json',
    method: 'get'
  })
}

// 创建axios实例
const request = axios.create()

// 添加响应拦截器
request.interceptors.response.use(function (response) {
  return response.data
}, function (error) {
  // 对响应错误做点什么
  return Promise.reject(error)
})
