import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router';
import clsx from 'clsx';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
// import InboxIcon from '@material-ui/icons/MoveToInbox';
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
import { verify } from '../../libs/web3';
import socket from '../../libs/socket';
import contract from '../../libs/contract';
import SignalProtocolStore from '../../libs/signalProtocolStore';
import { hexToBuf, createRoomName } from '../../libs/util';

const libsignal = window.libsignal;
const cookie = new Cookies();
const store = new SignalProtocolStore();
const enc = new TextDecoder("utf-8");

const Room = () => {
  const dummyChat = {
    'Amy': {
      room_id: 'AmyMe',
      display_name: 'Amy Wong',
      messages:[
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
    ]},
    'Bender': {
      room_id: 'BenderMe',
      display_name: 'Bender',
      messages:[
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
    ]},
    'Cubert': {
      room_id: 'CubertMe',
      display_name: 'Cubert',
      messages:[
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
    ]},
    
  }

  const history = useHistory();
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
    console.log('about to connect to yama-server');
    // console.log(`account: ${account}`)
    socket.auth = { username: account };
    socket.connect(() => {
      console.log(socket);
    });


    socket.onAny((event) => {
      console.log(`got event: ${event}`);
      // console.log(args)
    });

    socket.on('search user', (res) => {
      console.log(res)
      // search user in chats state
      // if user never texted the recipient, create a new signal session
      // using the signal store interface (local storage based)
      if (res.isExist) {
        if (!chats[res.username]) {
          setChats({
            ...chats,
            [res.username]: {
              room_id: createRoomName(res.username, account),
              display_name: res.display_name ? res.display_name : res.username,
              messages: []
            }
          });
        }
        setCurrentRoom(username);
      } else {
        console.log(`user ${username} does not exist`);
      }
    })
    // console.log(socket);
    socket.on('private message', async ({ content, from }) => {
      console.log('received private message');
      console.log(content);
      console.log(from);
      const room = chats[from];
  
      const newMessage = {
        sender: from
      };
      const address = new libsignal.SignalProtocolAddress(from, 1);
      const sessionCipher = new libsignal.SessionCipher(store, address);
      // console.log(`room: ${room}`);
      // decrypt message 
      // session does not exist, establish a session first
      const session = await store.loadSession(address.toString())
      if (content.type === 3 && !session) {
        
        try {
          const plaintext = await sessionCipher.decryptPreKeyWhisperMessage(content.body, 'binary');
          newMessage.message = enc.decode(plaintext);
          console.log('==plaintext==');
          console.log(newMessage.message)
        } catch (error) {
          console.log(error);
        }
      } else {
        try {
          const plaintext = await sessionCipher.decryptWhisperMessage(content.body, 'binary');
          newMessage.message = enc.decode(plaintext);
          console.log('==plaintext==');
          console.log(newMessage.message)
        } catch (error) {
          console.log(error);
        }
      }
      
      if (!room) {
        chats[from] = {
          room_id: createRoomName(from, account),
          display_name: from,
          messages: []
        };
      }
      console.log('==chats[from].messages before pushing==');
      console.log(chats[from].messages);
      chats[from].messages.push(newMessage);
      console.log('==chats[from].messages==');
      console.log(chats[from].messages);
      setChats({
        ...chats,
        [from]: {
          ...(chats[from]),
          messages: [...(chats[from].messages)]
        }
      });
  
    });
  }, []);

  const handleDrawerOpen = () => {
    setOpenDrawer(true);
  }

  const handleDrawerClose = () => {
    setOpenDrawer(false);
  }

  const handleChangeRoom = async (room) => {
    console.log(`moved to room: ${room}`);
    setCurrentRoom(room);
    history.push(`/room/${room}`)
    const address = new libsignal.SignalProtocolAddress(room, 1);

    const session = await store.loadSession(address.toString());
    if (!keyBundles[room] && !session) {
      const keyBundle = await contract.getKeyBundle(room);
      console.log('keyBundle');
      console.log(keyBundle);

      console.log('==verify key bundle==');
      const isValid = await verify(keyBundle.userSign, room);
      if (!isValid) {
        console.log('==invalid key bundle==');
        return
      }
      
      setKeyBundles({
        ...keyBundles,
        [room]: keyBundle
      });
      
      // create new signal session
      const sessionBuilder = new libsignal.SessionBuilder(store, address);

      try {
        console.log('try builing signal session');
        const keyId = parseInt(keyBundle.keyId);
        const idPublicKey = hexToBuf(keyBundle.idPublicKey);
        const signedPreKeyPub = hexToBuf(keyBundle.signedPreKeyPub);
        const signature = hexToBuf(keyBundle.signature);
        const preKeyPub = hexToBuf(keyBundle.preKeyPub);

        console.log(`keyId : ${keyId}`);
        console.log(keyId);
        console.log(`identityKey : ${idPublicKey}`);
        console.log(idPublicKey);
        console.log(`signedPreKeyPub : ${signedPreKeyPub}`);
        console.log(signedPreKeyPub);
        console.log(`signature : ${signature}`);
        console.log(signature);
        console.log(`preKeyPub : ${preKeyPub}`);
        console.log(preKeyPub);

        await sessionBuilder.processPreKey({
          registrationId: keyId,
          identityKey: idPublicKey,
          signedPreKey: {
            keyId: 1,
            publicKey: signedPreKeyPub,
            signature: signature,
          },
          preKey: {
            keyId: keyId,
            publicKey: preKeyPub,
          }
        });

        console.log(`signal session with ${room} built`);
      } catch (err) {
        console.log(err);
      }
      console.log('fetching key bundle for this room');
      // console.log(keyBundle);
    }
  }

  const handleSend = async () => {
    // console.log(socket.id);
    let content = message.trim();
    if (content !== '') {
      // encrypt message using signal session, previously built when user first sending
      // or receiving message from another end
      // console.log('currentRoom session: ');
      // console.log(sessions[currentRoom]);
      // change this to signalstore session
      if (sessions[currentRoom] === undefined) {
        console.log('session undefined');
        console.log('creating new session');

        const address = new libsignal.SignalProtocolAddress(currentRoom, 1);

        const sessionCipher = new libsignal.SessionCipher(store, address);
        setSessions({
          ...sessions,
          [currentRoom]: sessionCipher,
        })
        
        try {
          const ciphertext = await sessionCipher.encrypt(content);
          console.log(ciphertext);
          socket.emit("private message", {
            content: ciphertext,
            to: currentRoom,
            room_id: chats[currentRoom].room_id
          });
        } catch (err) {
          console.log(err);
        }
        
      } else {
        try {
          const ciphertext = await sessions[currentRoom].encrypt(content);
  
          socket.emit("private message", {
            content: ciphertext,
            to: currentRoom,
            room_id: chats[currentRoom].room_id
          });

        } catch (err) {
          console.log(err);
        }
      }

      const newMessage = {
        sender: 'me',
        message: content
      }
      console.log('==chats[currentRoom].messages before pushing==');
      console.log(chats[currentRoom].messages);
      chats[currentRoom].messages.push(newMessage);
      console.log('==chats[currentRoom].messages==');
      console.log(chats[currentRoom].messages);
      setChats({
        ...chats,
        [currentRoom]: {
          ...(chats[currentRoom]),
          messages: [...(chats[currentRoom].messages)]
        }
      });
    }
    setMessage('');
  }

  const handleSearch = () => {
    let query = username.trim();
    if (query !== '') {
      console.log(`searching user ${query}`);
      socket.emit('search user', {
        username: query
      });
    }

    setUsername('');
  }

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
              <ListItemText primary={chats[roomName].display_name} />
            </ListItem>
          ))}
        </List>
        <Divider />
        <List>
        {['Fry', 'Groundskeeper Willie', 'Hermes', 'Iruka', 'Jon'].map((text, index) => (
            <ListItem button key={index} onClick={() => { handleChangeRoom(text) }}>
              <ListItemIcon><MailIcon /></ListItemIcon>
              {/* <ListItemText textOverflow="ellipsis" primary={text} /> */}
              <Typography>{text}</Typography>
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
                <ChatCard chats={chats[currentRoom].messages}/>
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
