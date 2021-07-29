import React, { useEffect } from 'react';
import {
  BrowserRouter as Router,
  Route,
  Switch
} from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Room from './pages/Room';
import { enableWeb3 } from './libs/web3';
import { isMetamaskAvailable } from './libs/metamask';

function App() {
  useEffect(() => {
    if (isMetamaskAvailable()) {
      enableWeb3();
    }
  });
  
  return (
    <Router>
      <Switch>
        <Route exact path="/" component={Home} />
        <Route exact path="/login" component={Login} />
        <Route exact path="/register" component={Register} />
        <Route exact path="/room" component={Room} />
      </Switch>
    </Router>
  );
}

export default App;
