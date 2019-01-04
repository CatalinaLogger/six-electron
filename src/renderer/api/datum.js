import request from '@/common/utils/request'

/** 根据角色分页获取用户列表 bound (true：已绑定/false：未绑定) */
export function getPointPage (bound, deptId, query, page, size) {
  return request({
    url: '/datum/point/select/page',
    method: 'get',
    params: {bound, deptId, query, page, size}
  })
}

/** 监测点绑定区域 */
export function insertPointDept (deptId, pointKeys) {
  return request({
    url: '/datum/point/dept/insert',
    method: 'post',
    params: {deptId, pointKeys: pointKeys.toString()}
  })
}

/** 监测点解绑区域 */
export function deletePointDept (pointKeys) {
  return request({
    url: '/datum/point/dept/delete',
    method: 'post',
    params: {pointKeys: pointKeys.toString()}
  })
}

/** 查询类型/类型值列表 */
export function getTypeList (parentId) {
  return request({
    url: '/datum/type/select/list',
    method: 'get',
    params: {parentId}
  })
}

/** 新增类型/类型值 */
export function insertType (type) {
  return request({
    url: '/system/type/insert',
    method: 'post',
    params: {
      name: type.name,
      parentId: type.parent.id,
      remark: type.remark
    }
  })
}

/** 修改类型/类型值 */
export function updateType (type) {
  return request({
    url: '/system/type/update',
    method: 'put',
    params: {
      id: type.id,
      name: type.name,
      parentId: type.parent.id,
      remark: type.remark
    }
  })
}

/** 删除类型/类型值 */
export function deleteType (typeId) {
  return request({
    url: '/system/type/delete',
    method: 'delete',
    params: {typeId}
  })
}

/** 上移类型/类型值 */
export function upType (typeId) {
  return request({
    url: '/system/type/up',
    method: 'put',
    params: {typeId}
  })
}

/** 下移类型/类型值 */
export function downType (typeId) {
  return request({
    url: '/system/type/down',
    method: 'put',
    params: {typeId}
  })
}
