import storage from 'good-storage'

export default {
  state: {
    sidebar: {
      opened: !storage.get('__OPENED__')
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
    }
  },
  actions: {
    toggleSideBar: ({ commit }) => {
      commit('TOGGLE_SIDEBAR')
    }
  }
}
