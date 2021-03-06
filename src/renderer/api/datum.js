import request from '@/common/utils/request'

/** 分页获取待发布预警结果列表 */
export function getWarnPage (deptId, query, page, size) {
  return request({
    url: '/datum/warn/select/page',
    method: 'get',
    params: {deptId, query, page, size}
  })
}

/** 批量发布预警结果 */
export function updateWarn (warnKeys, send) {
  return request({
    url: '/datum/warn/update',
    method: 'put',
    params: {send, warnKeys: warnKeys.toString()}
  })
}

/** 批量排除预警结果 */
export function deleteWarn (warnKeys) {
  return request({
    url: '/datum/warn/delete',
    method: 'delete',
    params: {warnKeys: warnKeys.toString()}
  })
}

/** 分页获取监测点列表 bound (true：已绑定/false：未绑定) */
export function getPointPage (bound, deptId, level, query, page, size) {
  return request({
    url: '/datum/point/select/page',
    method: 'get',
    params: {bound, deptId, level, query, page, size}
  })
}

export function downloadTemplate () {
  return request({
    url: '/datum/point/download/template',
    method: 'get',
    responseType: 'blob',
    params: {
      date: new Date().toTimeString()
    }
  })
}

/** 获取监测点详细信息 */
export function getPoint (pointId) {
  return request({
    url: '/datum/point/select',
    method: 'get',
    params: {pointId}
  })
}

/** 修改监测点详细信息 */
export function updatePoint (point) {
  return request({
    url: '/datum/point/update',
    method: 'put',
    data: {
      id: point.id,
      summary: point.summary,
      jsonInfo: JSON.stringify(point.jsonInfo)
    }
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

/** 获取监测点现场图列表 */
export function deletePhoto (photoId) {
  return request({
    url: '/datum/point/photo/delete',
    method: 'delete',
    params: {photoId}
  })
}

/** 获取监测点预警等级信息 */
export function getPointPhotoList (pointId) {
  return request({
    url: '/datum/point/photo/select/list',
    method: 'get',
    params: {pointId}
  })
}

/** 获取监测点预警等级信息 */
export function getPointLevel (pointId) {
  return request({
    url: '/datum/point/level/select',
    method: 'get',
    params: {pointId}
  })
}

/** 获取监测点预警等级列表 */
export function getPointLevelList (pointId, start, end, index) {
  return request({
    url: '/datum/point/level/select/list',
    method: 'get',
    params: {pointId, start, end, index}
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
    url: '/datum/type/insert',
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
    url: '/datum/type/update',
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
    url: '/datum/type/delete',
    method: 'delete',
    params: {typeId}
  })
}

/** 上移类型/类型值 */
export function upType (typeId) {
  return request({
    url: '/datum/type/up',
    method: 'put',
    params: {typeId}
  })
}

/** 下移类型/类型值 */
export function downType (typeId) {
  return request({
    url: '/datum/type/down',
    method: 'put',
    params: {typeId}
  })
}

/** 变更预警等级 */
export function updateWarnLevel (warn) {
  return request({
    url: '/datum/warn/level/update',
    method: 'put',
    params: {
      warnId: warn.warnId,
      level: warn.level,
      remark: warn.remark,
      device: warn.device,
      event: warn.event
    }
  })
}
