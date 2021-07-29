import React, { useState } from 'react';
import { useHistory } from 'react-router';
import { Link } from 'react-router-dom';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Cookies from 'universal-cookie';
import NoAccess from '../../components/NoAccess';
import { isMetamaskAvailable } from '../../libs/metamask';

const cookie = new Cookies();

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [publicKey, setPublicKey] = useState('');
  const [address, setAddress] = useState('');
  const metamaskAvailability = isMetamaskAvailable();
  const history = useHistory();

  const onLogin = async () => {
    // load private key from local storage
    // send post request containing username, password, and public key to server
    // go to room 
    history.push('/room');
  }

  return (
    <>
      {
        metamaskAvailability ?
      <Grid
      container
      direction="row"
      justify="center"
      alignItems="center"
      >
        <h1>Login</h1>
        <Grid
          item
          container
          alignItems="center"
          direction="column"
        >
          <Grid
            item
            direction="column"
            container
            alignItems="center"
            xs={4}
          >
            <TextField
              name="username"
              variant="outlined"
              required
              fullWidth
              id="username"
              label="username"
              autoFocus
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <TextField
              name="password"
              variant="outlined"
              required
              fullWidth
              type="password"
              id="password"
              label="password"
              autoFocus
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <TextField
              name="address"
              variant="outlined"
              required
              fullWidth
              id="address"
              label="address"
              autoFocus
              value={address}
              // onChange={(e) => setPublicKey(e.target.value)}
            />
            <Button
              fullWidth
              onClick={() => onLogin()}
              disabled={false}
              variant="contained"
            >
              Login
            </Button>
          </Grid>
        </Grid>

        <Link to="/register">Register</Link>
      </Grid>
      : <NoAccess/>
      }
    </>
  );
}

export default Login;

