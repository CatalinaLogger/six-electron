import request from '@/common/utils/request'

/** 用户登录 */
export function login (username, password) {
  return request({
    url: '/system/login',
    method: 'post',
    params: {
      username,
      password
    }
  })
}

/** 二步登录 获取权限数据 */
export function getInfo (token) {
  return request({
    url: '/system/user/info',
    method: 'get',
    params: { token }
  })
}

/** 用户登出 */
export function logout () {
  return request({
    url: '/system/user/logout',
    method: 'post'
  })
}
