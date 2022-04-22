export interface AuthState {
  authorized: boolean;
}

function state (): AuthState {
  return {
    authorized: false
  }
}

export default state
