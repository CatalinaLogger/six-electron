import axios from 'axios'

/** 逆地理编码 */
export function geocode (lng, lat) {
  return request({
    url: 'geocode/regeo',
    method: 'get',
    params: {location: `${lng},${lat}`}
  })
}

/** 天气查询 */
export function weather (adcode, extensions) {
  return request({
    url: 'weather/weatherInfo',
    method: 'get',
    params: {city: adcode, extensions}
  })
}

/** 关键字搜索 */
export function place (keywords) {
  return request({
    url: 'place/text',
    method: 'get',
    params: {keywords}
  })
}

/** 周边搜索 */
export function around (keywords, location) {
  return request({
    url: 'place/around',
    method: 'get',
    params: {keywords, location}
  })
}

// 创建axios实例
const request = axios.create({
  baseURL: 'https://restapi.amap.com/v3/', // api的base_url
  params: {key: 'd4fd7e424b2c97f85e8140b0c86b34d3'},
  timeout: 15000 // 请求超时时间
})

// 添加响应拦截器
request.interceptors.response.use(function (response) {
  return response.data
}, function (error) {
  // 对响应错误做点什么
  return Promise.reject(error)
})
