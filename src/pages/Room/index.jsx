import React, { useState } from 'react';
import clsx from 'clsx';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import IconButton from '@material-ui/core/IconButton';
import Drawer from '@material-ui/core/Drawer';
import AppBar from '@material-ui/core/AppBar';
import Divider from '@material-ui/core/Divider';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Toolbar from '@material-ui/core/Toolbar';
import MenuIcon from '@material-ui/icons/Menu';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import { useStyles } from './style';

const Room = () => {
  const [currentRoom, setCurrentRoom] = useState('');
  const [openDrawer, setOpenDrawer] = useState(false);
  const styles = useStyles();

  const handleDrawerOpen = () => {
    setOpenDrawer(true);
  }

  const handleDrawerClose = () => {
    setOpenDrawer(false);
  }

  return (
    <>
      <Grid>
        <AppBar 
          position="fixed" 
          className={clsx(styles.appBar, {
            [styles.appBarShift]: openDrawer,
          })}
        >
          <Toolbar>
            <IconButton 
              onClick={() => handleDrawerOpen()}
              className={clsx(openDrawer && styles.hide)}
            >
              <MenuIcon/>
            </IconButton>
            <h1>Yama</h1>
          </Toolbar>
        </AppBar>
        <Drawer 
          className={styles.drawer}
          open={openDrawer}
          variant="persistent"
          anchor="left"
          classes={{
            paper: styles.drawerPaper,
          }}
        >
          <Grid
            className={styles.drawerHeader}
            item
            container
            direction="row"
            justify="flex-end"
          >
            <IconButton onClick={() => handleDrawerClose()}>
              <ChevronLeftIcon/>
            </IconButton>
          </Grid>
          <Divider/> 
          <List>
            {['a', 'b', 'c', 'd', 'e', 'f'].map((text, index) => (
              <ListItem button key={index} onClick={() => setCurrentRoom(text)}>
                <ListItemIcon>{}</ListItemIcon>
                <ListItemText>{text}</ListItemText>
              </ListItem>
            ))}
          </List>
        </Drawer>
        <h1>{currentRoom} asdfa</h1>
        <main className={clsx(styles.content, {
          [styles.contentShift]: openDrawer
        })}>
          <div className={styles.drawerHeader} />
          <h1>{currentRoom} adfaasdf</h1>
        </main>
      </Grid>
    </>
  );
}

export default Room;
