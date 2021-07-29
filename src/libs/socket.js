import { io } from 'socket.io-client';
import { YAMA_API } from '../configs';

const socket = io(YAMA_API, { autoConnect: false});

export default socket;
