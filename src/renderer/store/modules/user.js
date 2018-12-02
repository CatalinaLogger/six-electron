import { login, reset, logout, getInfo } from '@/api/login'
import { getToken, setToken, removeToken, setUsername, removeUsername, setPassword, removePassword, setRemember } from '@/common/utils/auth'

const user = {
  state: {
    token: getToken(),
    socket: {},
    notice: {},
    name: '',
    avatar: '',
    roles: []
  },

  mutations: {
    SET_TOKEN: (state, token) => {
      state.token = token
    },
    SET_SOCKET: (state, socket) => {
      state.socket = socket
      socket.onmessage = (event) => {
        state.notice = JSON.parse(event.data)
      }
    },
    SET_NAME: (state, name) => {
      state.name = name
    },
    SET_AVATAR: (state, avatar) => {
      state.avatar = avatar
    },
    SET_ROLES: (state, roles) => {
      state.roles = roles
    }
  },

  actions: {
    // 用户登录
    Login ({ commit }, userInfo) {
      const username = userInfo.username.trim()
      return new Promise((resolve, reject) => {
        login(username, userInfo.password).then(response => {
          const data = response.data
          setToken(data)
          if (userInfo.remember) {
            setUsername(userInfo.username)
            setPassword(userInfo.password)
            setRemember(userInfo.remember)
          } else {
            removeUsername()
            removePassword()
            setRemember(userInfo.remember)
          }
          commit('SET_TOKEN', data)
          resolve()
        }).catch(error => {
          reject(error)
        })
      })
    },

    // 重置密码
    Reset ({ commit }, resetInfo) {
      return new Promise((resolve, reject) => {
        reset(resetInfo.mail, resetInfo.code).then(response => {
          resolve(response)
        }).catch(error => {
          reject(error)
        })
      })
    },

    // 获取用户信息
    GetInfo ({ commit, state }) {
      return new Promise((resolve, reject) => {
        getInfo(state.token).then(response => {
          const data = response.data
          commit('SET_ROLES', data.roles)
          commit('SET_NAME', data.name)
          commit('SET_AVATAR', data.avatar)
          commit('SET_SOCKET', new WebSocket(`${process.env.WEB_SOCKET}/${state.token}`))
          resolve(response)
        }).catch(error => {
          reject(error)
        })
      })
    },

    // 登出
    LogOut ({ commit, state }) {
      return new Promise((resolve, reject) => {
        logout(state.token).then(() => {
          commit('SET_TOKEN', '')
          commit('SET_ROLES', [])
          removeToken()
          resolve()
        }).catch(error => {
          reject(error)
        })
      })
    },

    // 前端 登出
    FedLogOut ({ commit }) {
      return new Promise(resolve => {
        commit('SET_TOKEN', '')
        removeToken()
        resolve()
      })
    }
  }
}

export default user
