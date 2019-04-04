import storage from 'good-storage'

export default {
  state: {
    sidebar: {
      opened: !storage.get('__OPENED__')
    },
    screen: {
      full: false
    }
  },
  mutations: {
    TOGGLE_SIDEBAR: state => {
      if (state.sidebar.opened) {
        storage.set('__OPENED__', 1)
      } else {
        storage.set('__OPENED__', 0)
      }
      state.sidebar.opened = !state.sidebar.opened
    },
    SET_SCREEN: (state, full) => {
      state.screen.full = full
    }
  },
  actions: {
    toggleSideBar: ({ commit }) => {
      commit('TOGGLE_SIDEBAR')
    },
    setFullScreen: ({ commit }, full) => {
      commit('SET_SCREEN', full)
    }
  }
}
