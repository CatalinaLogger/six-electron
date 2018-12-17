import request from '@/common/utils/request'

/** 获取区域树 */
export function getDeptTree () {
  return request({
    url: '/system/dept/select/tree',
    method: 'get'
  })
}

/** 获取用户区域列表 */
export function getDeptList (userId) {
  return request({
    url: '/system/dept/select/list',
    method: 'get',
    params: {userId}
  })
}

/** 新增区域 */
export function insertDept (dept) {
  return request({
    url: '/system/dept/insert',
    method: 'post',
    params: {
      name: dept.name,
      parentId: dept.parent.id,
      remark: dept.remark
    }
  })
}

/** 修改区域 */
export function updateDept (dept) {
  return request({
    url: '/system/dept/update',
    method: 'put',
    params: {
      id: dept.id,
      name: dept.name,
      parentId: dept.parent.id,
      remark: dept.remark,
      leadKeys: dept.leadKeys.toString()
    }
  })
}

/** 删除区域 */
export function deleteDept (deptId) {
  return request({
    url: '/system/dept/delete',
    method: 'delete',
    params: {deptId}
  })
}

/** 上移区域 */
export function upDept (deptId) {
  return request({
    url: '/system/dept/up',
    method: 'put',
    params: {deptId}
  })
}

/** 下移区域 */
export function downDept (deptId) {
  return request({
    url: '/system/dept/down',
    method: 'put',
    params: {deptId}
  })
}

/** 根据区域分页获取用户列表 */
export function getDeptUserPage (deptId, query, page, size) {
  return request({
    url: '/system/user/dept/select/page',
    method: 'get',
    params: {deptId, query, page, size}
  })
}

/** 根据角色分页获取用户列表 bound (true：已绑定/false：未绑定) */
export function getRoleUserPage (bound, roleId, query, page, size) {
  return request({
    url: '/system/user/role/select/page',
    method: 'get',
    params: {bound, roleId, query, page, size}
  })
}

/** 检查用户属性值是否已被占用 */
export function existsUser (userId, field, value) {
  return request({
    url: '/system/user/exists',
    method: 'get',
    params: {userId, field, value}
  })
}

/** 新增用户 */
export function insertUser (user) {
  return request({
    url: '/system/user/insert',
    method: 'post',
    params: {
      username: user.username,
      name: user.name,
      phone: user.phone,
      mail: user.mail,
      remark: user.remark,
      deptKeys: user.deptKeys.toString()
    }
  })
}

/** 修改用户 */
export function updateUser (user) {
  return request({
    url: '/system/user/update',
    method: 'put',
    params: {
      id: user.id,
      username: user.username,
      name: user.name,
      phone: user.phone,
      mail: user.mail,
      remark: user.remark,
      deptKeys: user.deptKeys.toString()
    }
  })
}

/** 冻结用户 */
export function stopUser (userId) {
  return request({
    url: '/system/user/stop',
    method: 'put',
    params: {userId}
  })
}

/** 解冻用户 */
export function startUser (userId) {
  return request({
    url: '/system/user/start',
    method: 'put',
    params: {userId}
  })
}

/** 删除用户 */
export function deleteUser (userId) {
  return request({
    url: '/system/user/delete',
    method: 'delete',
    params: {userId}
  })
}

/** 获取权限树 */
export function getAuthTree () {
  return request({
    url: '/system/auth/select/tree',
    method: 'get'
  })
}

/** 获取角色权限列表 */
export function getAuthList (roleId) {
  return request({
    url: '/system/auth/select/list',
    method: 'get',
    params: {roleId}
  })
}

/** 新增权限 */
export function insertAuth (auth) {
  return request({
    url: '/system/auth/insert',
    method: 'post',
    params: {
      name: auth.name,
      path: auth.path,
      redirect: auth.redirect,
      icon: auth.icon,
      hidden: auth.hidden,
      cache: auth.cache,
      parentId: auth.parent.id,
      type: auth.type,
      remark: auth.remark
    }
  })
}

/** 修改权限 */
export function updateAuth (auth) {
  return request({
    url: '/system/auth/update',
    method: 'put',
    params: {
      id: auth.id,
      name: auth.name,
      path: auth.path,
      redirect: auth.redirect,
      icon: auth.icon,
      hidden: auth.hidden,
      cache: auth.cache,
      parentId: auth.parent.id,
      type: auth.type,
      remark: auth.remark
    }
  })
}

/** 删除权限 */
export function deleteAuth (authId) {
  return request({
    url: '/system/auth/delete',
    method: 'delete',
    params: {authId}
  })
}

/** 上移权限 */
export function upAuth (authId) {
  return request({
    url: '/system/auth/up',
    method: 'put',
    params: {authId}
  })
}

/** 下移权限 */
export function downAuth (authId) {
  return request({
    url: '/system/auth/down',
    method: 'put',
    params: {authId}
  })
}

/** 获取角色树 */
export function getRoleTree () {
  return request({
    url: '/system/role/select/tree',
    method: 'get'
  })
}

/** 新增角色组/角色 */
export function insertRole (role) {
  return request({
    url: '/system/role/insert',
    method: 'post',
    params: {
      name: role.name,
      parentId: role.parent.id,
      authKeys: role.authKeys.toString()
    }
  })
}

/** 修改角色组/角色 */
export function updateRole (role) {
  return request({
    url: '/system/role/update',
    method: 'put',
    params: {
      id: role.id,
      name: role.name,
      parentId: role.parent.id,
      authKeys: role.authKeys.toString()
    }
  })
}

/** 删除角色组/角色 */
export function deleteRole (roleId) {
  return request({
    url: '/system/role/delete',
    method: 'delete',
    params: {roleId}
  })
}

/** 上移角色组/角色 */
export function upRole (roleId) {
  return request({
    url: '/system/role/up',
    method: 'put',
    params: {roleId}
  })
}

/** 下移角色组/角色 */
export function downRole (roleId) {
  return request({
    url: '/system/role/down',
    method: 'put',
    params: {roleId}
  })
}

/** 角色添加成员 */
export function insertRoleUser (roleId, userKeys) {
  return request({
    url: '/system/role/user/insert',
    method: 'post',
    params: {roleId, userKeys: userKeys.toString()}
  })
}

/** 角色移除成员 */
export function deleteRoleUser (roleId, userKeys) {
  return request({
    url: '/system/role/user/delete',
    method: 'delete',
    params: {roleId, userKeys: userKeys.toString()}
  })
}
