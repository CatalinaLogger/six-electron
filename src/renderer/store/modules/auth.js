import {constantRouters, dynamicRouters} from '@/router'

export default {
  state: {
    allRouters: constantRouters,
    addRouters: []
  },
  mutations: {
    ADD_ROUTERS: (state, routers) => {
      state.addRouters = routers
      state.allRouters = constantRouters.concat(routers)
    }
  },
  actions: {
    GenerateRoutes ({ commit }, authTree) {
      return new Promise(resolve => {
        let accessedRouters = dynamicRouters(authTree)
        commit('ADD_ROUTERS', accessedRouters)
        resolve()
      })
    }
  }
}
