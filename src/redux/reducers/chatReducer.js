export const ACTIONS = {
  SET_CHAT: 'SET_CHAT',
  RESET_CHAT: 'RESET_CHAT',
  ADD_CHAT: 'ADD_CHAT',
}

const initialState = {
}

const reducer = (state = initialState, action) => {
  const { type, payload } = action;
  switch (type) {
    case ACTIONS.RESET_CHAT:
      return {
        ...state,
      }    
    case ACTIONS.SET_CHAT:
      return {
        ...state,
        [payload.address]: {
          ...(state[payload.address]),
          messages: [...(state[payload.address].messages)]
        }
        // chat: {...payload}
      }
    case ACTIONS.ADD_CHAT:
      return {
        ...state,
        // chat: {...state.chat}
      }
    default:
      return state;
  }
}

export default reducer;
