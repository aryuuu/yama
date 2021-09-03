export const ACTIONS = {
  SET_DISPLAY_NAME: 'SET_DISPLAY_NAME',
  RESET_DISPLAY_NAME: 'RESET_DISPLAY_NAME',
};

const initialState = {
  display_name: '',
};

const reducer = (state = initialState, action) => {
  const { type, payload } = action;
  switch (type) {
    case ACTIONS.SET_DISPLAY_NAME:
      return {
        ...state,
        display_name: payload
      }
    case ACTIONS.RESET_DISPLAY_NAME:
      state = {...initialState};
      return state;
    default:
      return state;
  }
}

export default reducer;
