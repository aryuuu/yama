import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
// import useWallet from 'use-wallet';
import Cookies from 'universal-cookie';
import Navbar from '../../components/Navbar';
import NoAccess from '../../components/NoAccess';
import axios from 'axios';
import { isMetamaskAvailable } from '../../libs/metamask';
import { getAddress } from '../../libs/web3';
import { bufToHex, hexToBuf } from '../../libs/util';
import SignalProtocolStore from '../../libs/signalProtocolStore';
import contract from '../../libs/contract';
import { YAMA_API } from '../../configs';

const cookie = new Cookies();

const Register = () => {
  const account = cookie.get('account');

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [publicKey, setPublicKey] = useState();
  // metamask address
  const [address, setAddress] = useState(account);
  const KeyHelper = window.libsignal.KeyHelper;
  const metamaskAvailability = isMetamaskAvailable();
  const store = new SignalProtocolStore();


  useEffect(() => {
    // console.log(window.libsignal.KeyHelper);
    // setAddress(web3.currentProvider.selectedAddress);
    // setAddress(getAddress());
    // setupAddress();
  }, []);


  const onRegister = async () => {
    // send post request to server
    // wait for response
    // generate key pair
    // using userID from registration response, register public key to blockchain 
    // KeyHelper.generateIdentityKeyPair().then((idKeyPair) => {
    //   // setPublicKey(dec.decode(idKeyPair.pubKey));
    //   setPublicKey(bufToHex(idKeyPair.pubKey));
    //   console.log('public key: ', publicKey);
      
    //   // setPKey(dec.decode(idKeyPair.privKey));
    // });
    if (username === '' || password === '' || address === '') {
      console.log('please fill the form');
      return;
    }
    try {
      // const response = await axios.post(`${YAMA_API}/user/`, {
      //   username: username,
      //   password: password,
      //   address: address
      // });

      // console.log(response.data.data)
      // const newUserId = response.data.data.user_id;
      const newUserId = '1';
      // console.log(newUserId);

      const idKeyPair = await KeyHelper.generateIdentityKeyPair();
      // const idKeyPairB = await KeyHelper.generateIdentityKeyPair();
      const regId = KeyHelper.generateRegistrationId();
      // const regIdB = KeyHelper.generateRegistrationId();

      setPublicKey(bufToHex(idKeyPair.pubKey));
      // console.log(bufToHex(idKeyPair.pubKey))
      
      store.saveIdentityPair(idKeyPair);
      store.saveRegistrationId(regId);

      const preKey = await KeyHelper.generatePreKey(regId);
      // const preKeyB = await KeyHelper.generatePreKey(regIdB);
      store.storePreKey(preKey.keyId, preKey.keyPair);
      // console.log((preKey))

      const signedPreKey = await KeyHelper.generateSignedPreKey(idKeyPair, regId);
      // const signedPreKeyB = await KeyHelper.generateSignedPreKey(idKeyPairB, regIdB);
      store.storeSignedPreKey(signedPreKey.keyId, signedPreKey.keyPair);
      const transaction = await contract.createKeyBundle(
        {
          keyId: `${regId}`,
          userId: newUserId,
          idPublicKey: bufToHex(idKeyPair.pubKey),
          preKeyPub: bufToHex(preKey.keyPair.pubKey),
          signedPreKeyPub: bufToHex(signedPreKey.keyPair.pubKey),
          signature: bufToHex(signedPreKey.signature)
        },
        address
      );

      console.log(transaction);
      
      
    } catch (err) {
      console.log('error catched')
      console.log(err)
    }
  }

  return (
    <>
    {
      metamaskAvailability ?
      <Grid
      container
      direction="row"
      justify="center"
      alignItems="center"
    >
      <Navbar/>
      <h1>Register</h1>
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
              type="password"
              fullWidth
              id="password"
              label="password"
              autoFocus
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <TextField
              name="address"
              variant="outlined"
              required
              fullWidth
              id="address"
              label="address"
              autoFocus
              value={address}
              disabled
              // onChange={(e) => setPublicKey(e.target.value)}
            />
            <Button
              fullWidth
              variant="contained"
              onClick={() => onRegister()}
              disabled={username === '' || password === '' || address === ''}
            >
              Register
            </Button>
          </Grid>
        </Grid>
      <Link to="/login">Login</Link>

    </Grid>
    : 
    <NoAccess/>
    }
    </>
  );
}

export default Register;
