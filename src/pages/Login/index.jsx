import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [publicKey, setPublicKey] = useState('');

  return (
    <>
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
              id="password"
              label="password"
              autoFocus
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <TextField
              name="pubkey"
              variant="outlined"
              required
              fullWidth
              id="pubkey"
              label="pubkey"
              autoFocus
              value={publicKey}
              onChange={(e) => setPublicKey(e.target.value)}
            />
            <Button
              fullWidth
              onClick={() => console.log('login')}
              disable={false}
            >
              Login
            </Button>
          </Grid>
        </Grid>

        <Link to="/register">Register</Link>
      </Grid>
    </>
  );
}

export default Login;

