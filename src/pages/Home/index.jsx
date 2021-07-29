import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router';
import { Link } from 'react-router-dom';
import Grid from '@material-ui/core/Grid';
import Cookies from 'universal-cookie';

const cookie = new Cookies();

const Home = () => {
  const history = useHistory();
  const [isRegistered, setIsRegistered] = useState(false)


  useEffect(() => {
    const account = cookie.get('account');
    history.push('/room');
  }, []);

  return (
    <>
      <Grid
        container
        direction="column"
        justify="center"
        alignItems="center"
      >
        <h1>Yama</h1>
        <Link to="/login">Login</Link>
        <br />
        <Link to="/register">Register</Link>
      </Grid>
    </>
  );
}

export default Home;

