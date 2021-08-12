import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router';
import { Link } from 'react-router-dom';
import { 
  Grid,
  Modal,
  LinearProgress,
} from '@material-ui/core';
import { 
  useWallet, 
  UseWalletProvider 
} from 'use-wallet';
import Cookies from 'universal-cookie';
import { CHAIN_ID } from '../../configs';
import { bufToHex } from '../../libs/util';
import SignalProtocolStore from '../../libs/signalProtocolStore';
import contract from '../../libs/contract';
import { useStyles } from './style';

const cookie = new Cookies();

const Home = () => {
  const wallet = useWallet();
  const history = useHistory();
  const [loadingMessage, setLoadingMessage] = useState('Loading...')
  const [isRegistered, setIsRegistered] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isOpen, setIsOpen] = useState(true);

  const KeyHelper = window.libsignal.KeyHelper;
  const store = new SignalProtocolStore();

  const styles = useStyles();

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
    handleRegister();
  }, []);

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

    if ((!account || account === 'null') && wallet.status === 'connected') {
      cookie.set('account', wallet.account);
      setIsLoggedIn(true);
    }
  }, [wallet.account, wallet.status]);

  const handleLogin = async () => {
    try {
      setLoadingMessage('Logging into ethereum account...');
      await wallet.connect('provided');
      console.log(wallet.status)
      cookie.set('account', wallet.account);
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
  }

  const handleRegister = async () => {
    console.log('==register==')
    const address = cookie.get('account');
    console.log(`==account: ${address}==`);
    
    try {
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

      console.log('==signed key==');
      console.log(signedPreKey);

      if (!signedPreKey) {
        signedPreKey = await KeyHelper.generateSignedPreKey(idKey, 1);
        signature = signedPreKey.signature;
        signedKeyPair = signedPreKey.keyPair;

        store.storeSignedPreKey(signedPreKey.keyId, signedPreKey.keyPair);
        store.storeSignature(signedPreKey.keyId, signedPreKey.signature);
        console.log('==signed key==');
        console.log(signedPreKey);
      } else {
        signature = await store.loadSignature(1);
        signedKeyPair = signedPreKey;
      }

      const preKey = await KeyHelper.generatePreKey(regId);
      store.storePreKey(preKey.keyId, preKey.keyPair);
  
      const transaction = await contract.createKeyBundle(
        {
          keyId: `${regId}`,
          userId: address,
          idPublicKey: bufToHex(idKey.pubKey),
          preKeyPub: bufToHex(preKey.keyPair.pubKey),
          signedPreKeyPub: bufToHex(signedKeyPair.pubKey),
          signature: bufToHex(signature)
        },
        address
      );

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

  return (
    <>
      <Grid
        container
        direction="column"
        justify="center"
        alignItems="center"
      >
        <h1>Yama</h1>
        <Modal
          open={isOpen}
          onClose={handleClose}
          aria-labelledby="simple-modal-title"
          className={styles.modal}
        >
          <div className={styles.paper}>
            <h2 id="modal-title">Please wait</h2>
            <p id="modal-description">{loadingMessage}</p>
            <LinearProgress/>
          </div>
        </Modal>
        {/* <Link to="/login">Login</Link>
        <br />
        <Link to="/register">Register</Link> */}
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

