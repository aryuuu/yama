import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Grid,
  Modal,
  Button,
  LinearProgress,
} from '@material-ui/core';
import TextField from '@material-ui/core/TextField';
import { 
  useWallet, 
  UseWalletProvider 
} from 'use-wallet';
import Cookies from 'universal-cookie';
import { CHAIN_ID } from '../../configs';
import { bufToHex } from '../../libs/util';
import SignalProtocolStore from '../../libs/signalProtocolStore';
import contract from '../../libs/contract';
import { sign } from '../../libs/web3';
import { useStyles } from './style';
import { ACTIONS as USER_ACTIONS } from '../../redux/reducers/userReducer';

const cookie = new Cookies();

const Home = () => {
  const wallet = useWallet();
  const history = useHistory();
  const dispatch = useDispatch();
  const [loadingMessage, setLoadingMessage] = useState('Loading...')
  const [isRegistered, setIsRegistered] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [privateKey, setPrivateKey] = useState('');
  const [showLoading, setShowLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const KeyHelper = window.libsignal.KeyHelper;
  const store = new SignalProtocolStore();

  const styles = useStyles();

  const { display_name } = useSelector(state => state.userReducer);

  useEffect(() => {
    const account = cookie.get('account');
    if (account) {
      console.log('not login');
      setIsLoggedIn(true);
      // history.push('/room');
    } else {
      console.log('login');
      handleLogin();
      // history.push('/room');
    }
    // handleRegister();
  }, []);

  useEffect(() => {
    if (isLoggedIn) {
      console.log('user logged in, time to register key bundle');
      setShowLoading(false);
      setShowForm(true);
      setLoadingMessage('Please input your wallet private key');
      // handleRegister();
    }
  }, [isLoggedIn]);

  useEffect(() => {
    console.log(`isLoggedIn: ${isLoggedIn}`);
    console.log(`isRegistered: ${isRegistered}`);

    if (isLoggedIn && isRegistered) {
      history.push('/room');
    }
  }, [isLoggedIn, isRegistered, history]);

  useEffect(() => {
    console.log('updating account cookie');
    const account = cookie.get('account');
    console.log('==wallet status==');
    console.log(wallet.status);

    if ((!account || account === 'null' || account !== wallet.account) && wallet.status === 'connected') {
      cookie.set('account', wallet.account);
      setIsLoggedIn(true);
      setLoadingMessage('Wallet logged in...');
    }
  }, [wallet.account, wallet.status]);

  const handleLogin = async () => {
    try {
      setLoadingMessage('Logging into ethereum account...');
      await wallet.connect('provided');
      // console.log(wallet.status)
      // cookie.set('account', wallet.account);
    } catch (error) {
      console.log('error connecting wallet');
      console.log(error);
      setLoadingMessage('Error connecting wallet');
    }
  }

  const handleLogout = () => {
    console.log('logout');
    wallet.reset();
    cookie.remove('account');
    setIsLoggedIn(false);
  }

  window.ethereum.on('accountsChanged', async (accounts) => {
    console.log(accounts);
    await handleLogout();
    handleLogin();
  })

  const handleRegister = async () => {
    setShowLoading(true);
    console.log('==register==');
    const address = cookie.get('account');
    console.log(`==account: ${address}==`);
    
    try {
      const isRegisteredEth = await contract.isRegistered(address);
      console.log(`isRegisteredEth: ${isRegisteredEth}`);
      if (isRegisteredEth) {
        setIsRegistered(true);
        return;
      }
      setLoadingMessage('Registering key bundle...');
      // check if id key exist
      let idKey = await store.getIdentityKeyPair();
      if (!idKey) {
        idKey = await KeyHelper.generateIdentityKeyPair();
        store.saveIdentityPair(idKey);
      }
  
      const regId = KeyHelper.generateRegistrationId();
      store.saveRegistrationId(regId);
      // let regId = await store.getLocalRegistrationId();
      // if (!regId) {
      //   regId = KeyHelper.generateRegistrationId();
      //   store.saveRegistrationId(regId);
      // }
  
      let signedPreKey = await store.loadSignedPreKey(1);
      let signature;
      let signedKeyPair = {};

      // console.log('==signed key==');
      // console.log(signedPreKey);

      if (!signedPreKey) {
        signedPreKey = await KeyHelper.generateSignedPreKey(idKey, 1);
        signature = signedPreKey.signature;
        signedKeyPair = signedPreKey.keyPair;

        store.storeSignedPreKey(signedPreKey.keyId, signedPreKey.keyPair);
        store.storeSignature(signedPreKey.keyId, signedPreKey.signature);
        // console.log('==signed key==');
        // console.log(signedPreKey);
      } else {
        signature = await store.loadSignature(1);
        signedKeyPair = signedPreKey;
      }

      const preKey = await KeyHelper.generatePreKey(regId);
      store.storePreKey(preKey.keyId, preKey.keyPair);
      const keyBundle = {
        keyId: `${regId}`,
        userId: address,
        idPublicKey: bufToHex(idKey.pubKey),
        preKeyPub: bufToHex(preKey.keyPair.pubKey),
        signedPreKeyPub: bufToHex(signedKeyPair.pubKey),
        signature: bufToHex(signature),
      }

      keyBundle.userSign = await sign(keyBundle, privateKey);
  
      const transaction = await contract.createKeyBundle(keyBundle, address);

      console.log(transaction);
      setIsRegistered(true);
    } catch (err) {
      console.log(err);
      setLoadingMessage('Error registering keys');
    }
  }

  const handleClose = () => {
    setIsOpen(false);
  }

  const handleChangeDisplayName = (value) => {
    dispatch({
      type: USER_ACTIONS.SET_DISPLAY_NAME,
      payload: value
    })
  }

  return (
    <>
      <Grid
        container
        direction="column"
        justify="center"
        alignItems="center"
      >
        <h1>Yama</h1>
        <h3>Display name</h3>
        <TextField
          name="displayname"
          variant="outlined"
          required
          // fullWidth
          id="displayname"
          label="Display Name"
          autoFocus
          value={display_name}
          onChange={(e) => handleChangeDisplayName(e.target.value)}
        />
        <h3>Private key</h3>
        <TextField
          id="private-key"
          required
          label="private key"
          variant="outlined"
          type="password"
          value={privateKey}
          onChange={e => setPrivateKey(e.target.value)}
          onKeyPress={e => {
            if (e.key === 'Enter') {
              handleRegister();
            }
          }}
        />
        <Button
          // fullWidth
          className={styles.registerButton}
          variant="contained"
          color="primary"
          onClick={() => handleRegister()}
          disabled={display_name === '' || privateKey === ''}
        >
          Register
        </Button>
        <p>{loadingMessage}</p>
        {
          showLoading
          ? <LinearProgress/>
          : ''
        }

        <Modal
          open={isOpen}
          onClose={handleClose}
          aria-labelledby="simple-modal-title"
          className={styles.modal}
        >
          <div className={styles.paper}>
            {/* <h2 id="modal-title">Please wait</h2> */}
            <p id="modal-description">{loadingMessage}</p>
            {
              showForm
              ? <TextField
                  id="private-key"
                  label="private key"
                  type="password"
                  value={privateKey}
                  onChange={e => setPrivateKey(e.target.value)}
                  onKeyPress={e => {
                    if (e.key === 'Enter') {
                      handleRegister();
                    }
                  }}
                />
              : ''
            }
            {
              showLoading
               ? <LinearProgress/>
               : ''
            }
          </div>
        </Modal>
      </Grid>
    </>
  );
}

const HomeWithWallet = () => (
  <UseWalletProvider
    chainId={CHAIN_ID}
    connectors={{
      provided: {
        provider: window.cleanEthereum
      }
    }}
  >
    <Home/>
  </UseWalletProvider>
)

export default HomeWithWallet;

