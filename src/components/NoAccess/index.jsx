import React from 'react';
import { Link } from 'react-router-dom';
import Grid from '@material-ui/core/Grid';

const NoAccess = () => {
  return (
    <Grid
      container
      direction="column"
      justify="center"
      alignItems="center"
    >
      <h1>Please download or enable metamask</h1>
      <Link to="/">Home</Link>
    </Grid>
  )
}

export default NoAccess;
