import request from '@/common/utils/request'

export function login (username, password) {
  return request({
    url: '/auth/login',
    method: 'post',
    params: {
      username,
      password
    }
  })
}

export function reset (mail, code) {
  return request({
    url: '/auth/reset',
    method: 'put',
    params: {
      mail,
      code
    }
  })
}

export function logout () {
  return request({
    url: '/system/user/logout',
    method: 'post'
  })
}

export function getInfo (token) {
  return request({
    url: '/system/user/info',
    method: 'get',
    params: { token }
  })
}

export function getDaily (date) {
  return request({
    url: '/auth/daily',
    method: 'get',
    params: { date }
  })
}

export function getImages (origin) {
  return request({
    url: '/auth/images',
    method: 'get',
    params: { origin }
  })
}
