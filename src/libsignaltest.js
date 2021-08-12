const signal = require('libsignal-protocol-nodejs');
const KeyHelper = signal.KeyHelper;
// const store = {};

const bufToHex = (buffer) => {
  var s = '', h = '0123456789ABCDEF';
  (new Uint8Array(buffer)).forEach((v) => { s += h[v >> 4] + h[v & 15]; });
  s = '0x' + s;
  return s;
}

const hexToBuf = (hex) => {
   // remove the leading 0x
  hex = hex.replace(/^0x/, '');
  const typedArray = new Uint8Array(hex.match(/[\da-f]{2}/gi).map((h) => parseInt(h, 16)))
  return typedArray.buffer
}


function SignalProtocolStore() {
  this.store = {};
}

SignalProtocolStore.prototype = {
  Direction: {
    SENDING: 1,
    RECEIVING: 2,
  },

  getIdentityKeyPair: function() {
    return Promise.resolve(this.get('identityKey'));
  },
  getLocalRegistrationId: function() {
    return Promise.resolve(this.get('registrationId'));
  },
  put: function(key, value) {
    if (key === undefined || value === undefined || key === null || value === null)
      throw new Error("Tried to store undefined/null");
    this.store[key] = value;
  },
  get: function(key, defaultValue) {
    if (key === null || key === undefined)
      throw new Error("Tried to get value for undefined/null key");
    if (key in this.store) {
      return this.store[key];
    } else {
      return defaultValue;
    }
  },
  remove: function(key) {
    if (key === null || key === undefined)
      throw new Error("Tried to remove value for undefined/null key");
    delete this.store[key];
  },

  isTrustedIdentity: function(identifier, identityKey, direction) {
    if (identifier === null || identifier === undefined) {
      throw new Error("tried to check identity key for undefined/null key");
    }
    if (!(identityKey instanceof ArrayBuffer)) {
      throw new Error("Expected identityKey to be an ArrayBuffer");
    }
    var trusted = this.get('identityKey' + identifier);
    if (trusted === undefined) {
      return Promise.resolve(true);
    }
    return Promise.resolve(bufToHex(identityKey) === bufToHex(trusted));
  },
  loadIdentityKey: function(identifier) {
    if (identifier === null || identifier === undefined)
      throw new Error("Tried to get identity key for undefined/null key");
    return Promise.resolve(this.get('identityKey' + identifier));
  },
  saveIdentity: function(identifier, identityKey) {
    if (identifier === null || identifier === undefined)
      throw new Error("Tried to put identity key for undefined/null key");


    console.log(`identifier: ${identifier}`);
    // var address = new signal.SignalProtocolAddress.fromString(identifier);

    var existing = this.get('identityKey' + identifier);
    this.put('identityKey' + identifier, identityKey)

    if (existing && bufToHex(identityKey) !== bufToHex(existing)) {
      return Promise.resolve(true);
    } else {
      return Promise.resolve(false);
    }

  },

  /* Returns a prekeypair object or undefined */
  loadPreKey: function(keyId) {
    console.log('==signed preKey ID==');
    console.log(keyId);
    var res = this.get('25519KeypreKey' + keyId);
    if (res !== undefined) {
      res = { pubKey: res.pubKey, privKey: res.privKey };
    }
    return Promise.resolve(res);
  },
  storePreKey: function(keyId, keyPair) {
    return Promise.resolve(this.put('25519KeypreKey' + keyId, keyPair));
  },
  removePreKey: function(keyId) {
    return Promise.resolve(this.remove('25519KeypreKey' + keyId));
  },

  /* Returns a signed keypair object or undefined */
  loadSignedPreKey: function(keyId) {
    console.log('==signed preKey ID==');
    console.log(keyId);
    var res = this.get('25519KeysignedKey' + keyId);
    if (res !== undefined) {
      res = { pubKey: res.pubKey, privKey: res.privKey };
    }
    return Promise.resolve(res);
  },
  storeSignedPreKey: function(keyId, keyPair) {
    return Promise.resolve(this.put('25519KeysignedKey' + keyId, keyPair));
  },
  removeSignedPreKey: function(keyId) {
    return Promise.resolve(this.remove('25519KeysignedKey' + keyId));
  },

  loadSession: function(identifier) {
    return Promise.resolve(this.get('session' + identifier));
  },
  storeSession: function(identifier, record) {
    return Promise.resolve(this.put('session' + identifier, record));
  },
  removeSession: function(identifier) {
    return Promise.resolve(this.remove('session' + identifier));
  },
  removeAllSessions: function(identifier) {
    for (var id in this.store) {
      if (id.startsWith('session' + identifier)) {
        delete this.store[id];
      }
    }
    return Promise.resolve();
  }
};




// const genKeyPair = async () => {
//   const keyPair = await KeyHelper.generateIdentityKeyPair();
//   console.log(JSON.stringify(keyPair.pubKey));
//   console.log(JSON.stringify(keyPair.privKey));
//   console.log(keyPair);
// }

// const genPreKey = async () => {
//   const preKey = await KeyHelper.generatePreKey(registrationId);
//   console.log('prekey');
//   console.log(preKey)
// }


const genKeyBundle = async () => {
  const storeA = new SignalProtocolStore();
  const storeB = new SignalProtocolStore();

  const addressA = new signal.SignalProtocolAddress('a', 1);
  const addressB = new signal.SignalProtocolAddress('b', 1);
  // console.log(addressA.toString())
  // console.log(addressB.toString())

  const registrationIdA = KeyHelper.generateRegistrationId();
  const registrationIdB = KeyHelper.generateRegistrationId();
  // var keyPair;
  // console.log(registrationIdA);

  const keyPairA = await KeyHelper.generateIdentityKeyPair();
  const keyPairB = await KeyHelper.generateIdentityKeyPair();
  // console.log(keyPairA);

  storeA.put('identityKey', keyPairA);
  storeB.put('identityKey', keyPairB);
  storeA.put('registrationId', registrationIdA);
  storeB.put('registrationId', registrationIdB);
  // storeA.saveIdentity(addressA.toString(), keyPairA);
  // storeB.saveIdentity(addressB.toString(), keyPairB);
  // console.log(JSON.stringify(keyPair));
  const preKeyA = await KeyHelper.generatePreKey(registrationIdA);
  const preKeyB = await KeyHelper.generatePreKey(registrationIdB);
  console.log('==preKeyA==');
  console.log(preKeyA);

  storeA.storePreKey(preKeyA.keyId, preKeyA.keyPair);
  storeB.storePreKey(preKeyB.keyId, preKeyB.keyPair);

  const signedPreKeyA = await KeyHelper.generateSignedPreKey(keyPairA, registrationIdA);
  const signedPreKeyB = await KeyHelper.generateSignedPreKey(keyPairB, registrationIdB);
  console.log('==signedPreKeyA==');
  console.log(signedPreKeyA);

  storeA.storeSignedPreKey(signedPreKeyA.keyId, signedPreKeyA.keyPair);
  storeB.storeSignedPreKey(signedPreKeyB.keyId, signedPreKeyB.keyPair);

  console.log('==storeA==');
  console.log(storeA);
  console.log('==storeB==');
  console.log(storeB);

  // const address = new signal.SignalProtocolAddress('a', 'b');
  // console.log('address: ', address.toString())
  // console.log('address equals: ', address.equals())
  // const addressB = new signal.SignalProtocolAddress('b', 1);
  const sessionBuilder = new signal.SessionBuilder(storeA, addressB);

  const promise =  await sessionBuilder.processPreKey({
    registrationId: registrationIdB,
    identityKey: keyPairB.pubKey,
    signedPreKey: {
      keyId: signedPreKeyB.keyId,
      publicKey: signedPreKeyB.keyPair.pubKey,
      signature: signedPreKeyB.signature,
    },
    preKey: {
      keyId: preKeyB.keyId,
      publicKey: preKeyB.keyPair.pubKey
    }
  });

  console.log('===promise===')
  console.log(JSON.stringify(promise))
  console.log('==storeA==');
  console.log(storeA)
  // promise.then(function onsuccess() {
  //   console.log('success')
  //   console.log(storeA);
  // })
  // promise.catch(function onerror(error) {
  //   console.log(error);
  // } )
  const sessionCipherA = new signal.SessionCipher(storeA, addressB);
  const ciphertext = await sessionCipherA.encrypt('halo');
  console.log('===encrypting=====');
  console.log(ciphertext);
  console.log(ciphertext.body)
  console.log('typeof ciphertext ' + typeof ciphertext.body)

  console.log('==decrypting==');
  const sessionCipherB = new signal.SessionCipher(storeB, addressA);
  const plaintext = await sessionCipherB.decryptPreKeyWhisperMessage(ciphertext.body, 'binary');
  console.log('===plaintext===');
  console.log(plaintext);
  const enc = new TextDecoder("utf-8");
  console.log(enc.decode(plaintext));

  const cipherreply = await sessionCipherB.encrypt('wasup bro');
  console.log('===reply===');
  console.log(cipherreply);

  console.log('===decrypting reply===');
  const plainreply = await sessionCipherA.decryptWhisperMessage(cipherreply.body, 'binary');
  console.log('===plain reply===');
  console.log(enc.decode(plainreply));

  const sessionsA = await storeA.loadSession(addressB.toString());
  // console.log(Object.keys(sessionsA));
  console.log(typeof sessionsA);
  console.log(sessionsA);


  console.log('===C joined the party===');
  const storeC = new SignalProtocolStore();
  const addressC = new signal.SignalProtocolAddress('c', 1);

  const registrationIdC = KeyHelper.generateRegistrationId();
  const keyPairC = await KeyHelper.generateIdentityKeyPair();

  storeC.put('identityKey', keyPairC);
  storeC.put('registrationId', registrationIdC);

  const preKeyC = await KeyHelper.generatePreKey(registrationIdC);
  storeC.storePreKey(preKeyC.keyId, preKeyC.keyPair);

  const signedKeyC = await KeyHelper.generateSignedPreKey(keyPairC, registrationIdC);
  storeC.storeSignedPreKey(signedKeyC.keyId, signedKeyC.keyPair);

  console.log('===create new prekey for B===');
  const regIdB2 = KeyHelper.generateRegistrationId();
  // store.
  const preKeyB2 = await KeyHelper.generatePreKey(regIdB2);
  storeB.storePreKey(preKeyB2.keyId, preKeyB2.keyPair);

  const sessionBuilderC = new signal.SessionBuilder(storeC, addressB);
  const promise2 = await sessionBuilderC.processPreKey({
    registrationId: registrationIdB,
    identityKey: keyPairB.pubKey,
    signedPreKey: {
      keyId: signedPreKeyB.keyId,
      publicKey: signedPreKeyB.keyPair.pubKey,
      signature: signedPreKeyB.signature,
    },
    preKey: {
      keyId: preKeyB2.keyId,
      publicKey: preKeyB2.keyPair.pubKey
    }
  });

  console.log(promise2)
 
  console.log('==store C==');
  console.log(storeC);

  const sessionCipherC = new signal.SessionCipher(storeC, addressB);
  const ciphertextC = await sessionCipherC.encrypt('bite my shiny metal axe');
  console.log('==encrypting C to B==');
  console.log(ciphertextC);
  console.log(ciphertextC.body);
  console.log('typeof ciphertextC ' + typeof ciphertextC.body);

  console.log('==decrypting B from C==');
  const sessionCipherBC = new signal.SessionCipher(storeB, addressC);
  const plaintextCB = await sessionCipherBC.decryptPreKeyWhisperMessage(ciphertextC.body, 'binary');
  console.log('==plaintext CB==');
  console.log(enc.decode(plaintextCB));

  const keyPairMe = await KeyHelper.generateIdentityKeyPair();
  const regIdMe = KeyHelper.generateRegistrationId();

  const storeMe = new SignalProtocolStore();
  storeMe.put('identityKey', keyPairMe);
  storeMe.put('registrationId', regIdMe);

  const kp1 = await KeyHelper.generateSignedPreKey(keyPairMe, 1);
  const kp2 = await KeyHelper.generateSignedPreKey(keyPairMe, 2);

  console.log('==kp1==');
  console.log(bufToHex(kp1.keyPair.pubKey));
  console.log(bufToHex(kp1.keyPair.privKey));
  console.log(bufToHex(kp1.signature));
  console.log('==kp2==');
  console.log(bufToHex(kp2.keyPair.pubKey));
  console.log(bufToHex(kp2.keyPair.privKey));
  console.log(bufToHex(kp2.signature));
}

// genKeyPair();
// genPreKey();
// genSignedPreKey();
genKeyBundle();
