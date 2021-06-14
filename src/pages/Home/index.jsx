import React from 'react';
import { Link } from 'react-router-dom';
import Grid from '@material-ui/core/Grid';

const Home = () => {
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

