import { createStore } from 'redux';
import rootReducer from '../reducers/rootReducer';

const defaultStore = createStore(rootReducer);

export default defaultStore;
