import { MutationTree } from 'vuex'
import { AuthState } from './state'

const mutation: MutationTree<AuthState> = {
  setAuthorized (state: AuthState, authorized: boolean) {
    state.authorized = authorized
  }
}

export default mutation
