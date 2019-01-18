import axios from 'axios'

/** 获取设备在线情况列表 */
export function getOnline () {
  return request({
    url: 'http://cloud.bdsmc.net:8000/getDeviceOnlineCount',
    method: 'get'
  })
}

/** 获取数据量统计情况 */
export function getCount (id) {
  return request({
    url: 'http://cloud.bdsmc.net:8000/getTotalDataCount',
    method: 'get',
    params: {
      id
    }
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
