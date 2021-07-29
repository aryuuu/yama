import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button } from "@material-ui/core";
import Cookies from 'universal-cookie';
import { useStyles } from './style';
import ConnectWallet from '../ConnectWallet';

const cookie = new Cookies();

const Navbar = () => {
  const [account, setAccount] = useState('');
  const classes = useStyles();

  useEffect(() => {

  });

  return (
    <div className={classes.root}>
      <AppBar position="sticky" className={classes.navbar}>
        <Toolbar variant="dense">
          {/* <Link to="/">
            <img
              alt="Client Logo"
              // src={Logo}
              height="35px"
              style={{ marginRight: "20px", cursor: "pointer" }}
              href="localhost:3001"
            />
          </Link> */}
          <Typography variant="overline">
            <Link
              smooth
              to="/login"
              style={{ textDecoration: "none" }}
              className={classes.page_link}
            >
              Login
            </Link>
          </Typography>
          <Typography
            variant="subtitle1"
            className={classes.end_item}
          ></Typography>
          <Link to="/register" style={{ textDecoration: "none" }}>
            <Button
              variant="outlined"
              color="secondary"
              className={(classes.nav_button)}
            >
              Register
            </Button>
          </Link>
          <a
            target="_blank"
            rel="noopener noreferrer"
            href="https://metamask.io/download"
            style={{ textDecoration: "none" }}
          >
            <Button
              variant="outlined"
              color="secondary"
              className={(classes.nav_button)}
            >
              Download Metamask
            </Button>
          </a>
          <ConnectWallet />
        </Toolbar>
      </AppBar>
    </div>
  )
}

export default Navbar;
