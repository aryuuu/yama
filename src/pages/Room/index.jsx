import React, { useState, useEffect } from 'react';
import clsx from 'clsx';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import InboxIcon from '@material-ui/icons/MoveToInbox';
import MailIcon from '@material-ui/icons/Mail';
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
import CssBaseline from '@material-ui/core/CssBaseline';
import Cookies from 'universal-cookie';
import { useStyles } from './style';
import NoAccess from '../../components/NoAccess';
import ChatCard from '../../components/ChatCard';
import { isMetamaskAvailable } from '../../libs/metamask';
import socket from '../../libs/socket';
import contract from '../../libs/contract';
import SignalProtocolStore from '../../libs/signalProtocolStore';

const libsignal = window.libsignal;
const cookie = new Cookies();
const store = new SignalProtocolStore();

const Room = () => {
  const dummyChat = {
    'Amy': [
      {
        sender: 'me',
        message: 'suh dude'
      },
      {
        sender: 'Amy',
        message: 'suh'
      },
      {
        sender: 'me',
        message: 'are you free tonight?'
      },
      {
        sender: 'Amy',
        message: 'sorry i have a boyfriend'
      },
    ],
    'Bender': [
      {
        sender: 'me',
        message: 'suh dude'
      },
      {
        sender: 'Bender',
        message: 'suh'
      },
      {
        sender: 'me',
        message: 'are you free tonight?'
      },
      {
        sender: 'Bender',
        message: 'sorry i have a boyfriend'
      },
    ],
    'Cubert': [
      {
        sender: 'me',
        message: 'suh dude'
      },
      {
        sender: 'Cubert',
        message: 'suh'
      },
      {
        sender: 'me',
        message: 'are you free tonight?'
      },
      {
        sender: 'Cubert',
        message: 'sorry i have a boyfriend'
      },
    ],
    'Dwight': [],
  }

  const [openDrawer, setOpenDrawer] = useState(true);
  const [currentRoom, setCurrentRoom] = useState('');
  const [username, setUsername] = useState('');
  const [message, setMessage] = useState('');
  const [chats, setChats] = useState(dummyChat);
  const [keyBundles, setKeyBundles] = useState({});
  
  const [sessions, setSessions] = useState({});

  const styles = useStyles();

  const metamaskAvailability = isMetamaskAvailable();

  const account = cookie.get('account');
  
  useEffect(() => {
    socket.auth = { username: account };
    socket.connect();
  }, []);

  // useEffect(() => {
  //   console.log(chats);
  // }, [chats]);

  const handleDrawerOpen = () => {
    setOpenDrawer(true);
  }

  const handleDrawerClose = () => {
    setOpenDrawer(false);
  }

  const handleChangeRoom = async (room) => {
    console.log(`moved to room: ${room}`);
    setCurrentRoom(room);

    if (!keyBundles[room]) {
      const keyBundle = await contract.getKeyBundle(room);
      setKeyBundles({
        ...keyBundles,
        [room]: keyBundle
      });
      // create new signal address for target
      const address = new libsignal.SignalProtocolAddress(room, 1);
      // create new signal session
      const sessionBuilder = new libsignal.SessionBuilder(store, address);

      try {
        await sessionBuilder.processPreKey({
          registrationId: '',
          identityKey: 1,
          signedPreKey: {
            keyId: 1,
            publicKey: 1,
            signature: 1,
          },
          preKey: {
            keyId: 1,
            publicKey: 1,
          }
        });

      } catch (err) {
        console.log(err);
      }
      console.log('fetching key bundle for this room');
      console.log(keyBundle);
    }
  }

  const handleSend = async () => {
    // console.log(socket.id);
    let content = message.trim();
    if (content !== '') {
      // encrypt message using signal session, previously built when user first sending
      // or receiving message from another end
      if (sessions[currentRoom] === undefined) {
        console.log('session undefined');
        console.log('creating new session');

        const sessionCipher = new libsignal.SessionCipher(store, '1');
        setSessions({
          ...sessions,
          [currentRoom]: sessionCipher,
        })
        const ciphertext = await sessionCipher.encrypt(content);
        
        socket.emit("private message", {
          content: ciphertext,
          to: currentRoom
        });
      } else {
        const ciphertext = await sessions[currentRoom].encrypt(content);

        socket.emit("private message", {
          content: ciphertext,
          to: currentRoom
        });
      }

      const newMessage = {
        sender: 'me',
        message: content
      }
      chats[currentRoom].push(newMessage)
      setChats({
        ...chats,
        [currentRoom]: [...chats[currentRoom]]
      });
    }
    setMessage('');
  }

  const handleSearch = () => {
    let query = username.trim();
    if (query !== '') {
      socket.emit('search user', {
        username: query
      });
    }

    setUsername('');
  }

  socket.onAny((event) => {
    console.log(`got event: ${event}`);
    // console.log(args)
  })

  socket.on('search user', ({ username, isExist}) => {
    // search user in chats state
    // if user never texted the recipient, create a new signal session
    // using the signal store interface (local storage based)
    if (isExist) {
      if (!chats[username]) {
        setChats({
          ...chats,
          [username]: []
        });
      }
      setCurrentRoom(username);
    } else {
      console.log(`user ${username} does not exist`);
    }
  })

  socket.on('private message', async ({ content, from }) => {
    console.log('received private message');
    console.log(content);
    console.log(from);
    const room = chats[from];

    const newMessage = {
      sender: from
    };
    const address = new libsignal.SignalProtocolAddress(from, 1);
    // console.log(`room: ${room}`);
    // decrypt message 
    // session does not exist, establish a session first
    if (sessions[from] === undefined) {
      const sessionCipher = new libsignal.SessionCipher(store, address);
      const plaintext = await sessionCipher.decryptPreKeyWisperMessage(content);
      newMessage.message = plaintext;
    } else {
      const plaintext = await sessions[from].decryptWhisperMessage(content, address);
      newMessage.message = plaintext;
    }
    
    // const newMessage = {
    //   sender: from,
    //   message: content
    // }

    if (!room) {
      chats[from] = [];
    }

    chats[from].push(newMessage);
    setChats({
      ...chats,
      [from]: [...chats[from]]
    });

    // setCurrentRoom(from);

    // if (room) {
    //   chats[from].push(newMessage);
    //   setChats({
    //     ...chats,
    //     [from]: [...chats[from]]
    //   });
    // } else {
    //   chats[from] = []
    // }
  });

  return (
    <>
      {
        metamaskAvailability ?
        <div className={styles.root}>
      <CssBaseline />
      <AppBar
        position="fixed"
        className={clsx(styles.appBar, {
          [styles.appBarShift]: openDrawer,
        })}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerOpen}
            edge="start"
            className={clsx(styles.menuButton, openDrawer && styles.hide)}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap>
            Yama
          </Typography>
          <TextField
            className={''}
            name=""
            variant="filled"
            id="username"
            label="0xDEADBEEF"
            value={username}
            onChange={e => setUsername(e.target.value)}
            onKeyPress={e => {
              if (e.key === 'Enter') {
                handleSearch();
              }
            }}
            InputProps={{
              className: styles.searchBar
            }}
          />
        </Toolbar>
      </AppBar>
      <Drawer
        className={styles.drawer}
        variant="persistent"
        anchor="left"
        open={openDrawer}
        styles={{
          paper: styles.drawerPaper,
        }}
      >
        <div className={styles.drawerHeader}>
          <IconButton onClick={handleDrawerClose}>
            <ChevronLeftIcon /> 
          </IconButton>
        </div>
        <Divider />
        <List>
          {Object.keys(chats).map((roomName, index) => (
            <ListItem 
              button 
              key={index} 
              onClick={() => { handleChangeRoom(roomName) }}
              style={currentRoom === roomName ? {
                background: 'grey',
                color: 'white'
              } : {}}
            >
              <ListItemIcon><MailIcon /></ListItemIcon>
              <ListItemText primary={roomName} />
            </ListItem>
          ))}
        </List>
        <Divider />
        <List>
        {['Fry', 'Groundskeeper Willie', 'Hermes', 'Iruka', 'Jon'].map((text, index) => (
            <ListItem button key={index} onClick={() => { handleChangeRoom(text) }}>
              <ListItemIcon><MailIcon /></ListItemIcon>
              <ListItemText primary={text} />
            </ListItem>
          ))}
        </List>
      </Drawer>
      <main
        className={clsx(styles.content, {
          [styles.contentShift]: openDrawer,
        })}
      >
        <div className={styles.drawerHeader} />
        <Grid>
          {
            currentRoom
            ? (
              <>
                <ChatCard chats={chats[currentRoom]}/>
                <TextField
                  className={styles.form}
                  name="Message"
                  variant="outlined"
                  fullWidth
                  id="message"
                  label="Write a message..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleSend();
                    }
                  }}
                />
            </>
            )
            : ''
          }
          
        </Grid>
      </main>
    </div>
      : <NoAccess/>
      }
    </>
  );
}

export default Room;
