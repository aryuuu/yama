import { combineReducers } from 'redux';

import userReducer from './userReducer';
import roomReducer from './chatReducer';

const rootReducer = combineReducers({
  userReducer,
  roomReducer
});

export default rootReducer;
