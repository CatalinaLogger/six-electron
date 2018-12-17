const getters = {
  sidebar: state => state.app.sidebar,
  token: state => state.user.token,
  avatar: state => state.user.avatar,
  name: state => state.user.name,
  roles: state => state.user.roles,
  allRouters: state => state.auth.allRouters,
  addRouters: state => state.auth.addRouters
}
export default getters
