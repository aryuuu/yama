const { bufToHex, hexToBuf } = require('./util');
const libsignal = window.libsignal;

class SignalProtocolStore {
  constructor() {
    this.store = window.localStorage;
    this.memStore = {};
  }

  Direction = {
    SENDING: 1,
    RECEIVING: 2,
  }

  saveIdentityPair(idKeyPair) {
    const temp = {};
    temp.pubKey = bufToHex(idKeyPair.pubKey);
    temp.privKey = bufToHex(idKeyPair.privKey);

    const idKeyPairString = JSON.stringify(temp);
    this.store.setItem('identityKey', idKeyPairString);
  }

  saveRegistrationId(regId) {
    this.store.setItem('registrationId', regId);
  }

  getIdentityKeyPair() {
    // const idKey = JSON.parse(this.get('identityKey'));
    const idKey = JSON.parse(this.store.getItem('identityKey'));
    idKey.pubKey = hexToBuf(idKey.pubKey);
    idKey.privKey = hexToBuf(idKey.privKey);
    // return Promise.resolve(this.get('identityKey'));
    return Promise.resolve(idKey);
  }

  getLocalRegistrationId() {
    return Promise.resolve(this.store.getItem('registrationId'));
  }

  put(key, value) {
    if (key === undefined || value === undefined || key === null || value === null) {
      throw new Error('Tried to store undefined/null');
    }
    // this.store[key] = value;
    this.memStore[key] = value;
  }

  get(key, defaultValue) {
    if (key === null || key === undefined) {
      throw new Error('Tried to get value for undefined/null key');
    }
    if (key in this.memStore) {
      return this.memStore[key];
    } else {
      return defaultValue;
    }
    // const val = this.store.getItem(key)
    // if (val !== null) {
    //   return val
    // }
    // return defaultValue
  }

  remove(key) {
    if (key === null || key === undefined) {
      throw new Error('Tried to remove value for undefined/null key');
    }
    delete this.memStore[key];
    // this.store.removeItem(key)
  }

  isTrustedIdentity(identifier, identityKey, direction) {
    if (identifier === null || identifier === undefined) {
      throw new Error("tried to check identity key for undefined/null key");
    }
    if (!(identityKey instanceof ArrayBuffer)) {
      throw new Error("Expected identityKey to be an ArrayBuffer");
    }
    // var trusted = this.get('identityKey' + identifier);
    var trusted = this.store.getItem('identityKey' + identifier);
    if (trusted === null) {
      return Promise.resolve(true);
    }
    return Promise.resolve(bufToHex(identityKey) === bufToHex(trusted));
  }

  loadIdentityKey(identifier) {
    if (identifier === null || identifier === undefined)
      throw new Error('Tried to get identity key for undefined/null key');

    // const idKey = hexToBuf(this.store.getItem('identityKey' + identifier));
    const idKey = JSON.parse(this.store.getItem('identityKey' + identifier));


    // return Promise.resolve(this.get('identityKey' + identifier));
    return Promise.resolve(idKey);
  }

  saveIdentity(identifier, identityKey) {
    if (identifier === null || identifier === undefined)
      throw new Error("Tried to put identity key for undefined/null key");

    // var address = new libsignal.SignalProtocolAddress.fromString(identifier);

    var existing = this.store.getItem('identityKey' + identifier);

    // identityKey.pubKey = bufToHex(identityKey.pubKey);
    // identityKey.privKey = bufToHex(identityKey.privKey);
    // const identityKeyString = JSON.stringify(identityKey);
    // this.put('identityKey' + address.getName(), identityKeyString)
    this.store.setItem('identityKey' + identifier, bufToHex(identityKey));

    if (existing && bufToHex(identityKey) !== bufToHex(existing)) {
      return Promise.resolve(true);
    } else {
      return Promise.resolve(false);
    }

  }

  /* Returns a prekeypair object or undefined */
  loadPreKey(keyId) {
    var res = JSON.parse(this.store.getItem('25519KeypreKey' + keyId));
    if (res !== undefined) {
      res = { 
        pubKey: hexToBuf(res.pubKey), 
        privKey: hexToBuf(res.privKey) 
      };
    }
    return Promise.resolve(res);
  }

  storePreKey(keyId, keyPair) {
    const temp = {}
    temp.pubKey = bufToHex(keyPair.pubKey);
    temp.privKey = bufToHex(keyPair.privKey);
    const keyPairString = JSON.stringify(temp);

    return Promise.resolve(this.store.setItem('25519KeypreKey' + keyId, keyPairString));
  }

  removePreKey(keyId) {
    // return Promise.resolve(this.remove('25519KeypreKey' + keyId));
    return Promise.resolve(this.store.removeItem('25519KeypreKey' + keyId));
  }

  /* Returns a signed keypair object or undefined */
  loadSignedPreKey(keyId) {
    // var res = this.get('25519KeysignedKey' + keyId);
    var res = JSON.parse(this.store.getItem('25519KeysignedKey' + keyId));
    if (res !== undefined) {
      res = { 
        pubKey: hexToBuf(res.pubKey), 
        privKey: hexToBuf(res.privKey) 
      };
    }
    return Promise.resolve(res);
  }

  storeSignedPreKey(keyId, keyPair) {
    const temp = {};
    temp.pubKey = bufToHex(keyPair.pubKey);
    temp.privKey = bufToHex(keyPair.privKey);
    const keyPairString = JSON.stringify(temp);

    return Promise.resolve(this.store.setItem('25519KeysignedKey' + keyId, keyPairString));
  }

  removeSignedPreKey(keyId) {
    return Promise.resolve(this.remove('25519KeysignedKey' + keyId));
  }

  loadSession(identifier) {
    // const record = JSON.parse(this.store.getItem('session' + identifier));
    // record.currentRatchet.rootKey = hexToBuf(record.currentRatchet.rootKey);
    // record.currentRatchet.lastRemoteEphemeralKey = hexToBuf(record.currentRatchet.lastRemoteEphemeralKey);
    // record.currentRatchet.ephemeralKeyPair.pubKey = hexToBuf(record.currentRatchet.ephemeralKeyPair.pubKey);
    // record.currentRatchet.ephemeralKeyPair.privKey = hexToBuf(record.currentRatchet.ephemeralKeyPair.privKey);
    // record.indexInfo.remoteIdentityKey = hexToBuf(record.indexInfo.remoteIdentityKey);
    // record.indexInfo.baseKey = hexToBuf(record.indexInfo.baseKey);
    // record.pendingPreKey.baseKey = hexToBuf(record.pendingPreKey.baseKey);


    return Promise.resolve(this.get('session' + identifier));
  }

  storeSession(identifier, record) {
    // console.log('identifier', identifier)
    // console.log('record');
    // console.log(record);
    // console.log(typeof record)
    return Promise.resolve(this.put('session' + identifier, record));
  }

  removeSession(identifier) {
    return Promise.resolve(this.remove('session' + identifier));
  }

  removeAllSessions(identifier) {
    for (var id in this.memStore) {
      if (id.startsWith('session' + identifier)) {
        delete this.memStore[id];
      }
    }
    return Promise.resolve();
  }

}

module.exports = SignalProtocolStore;
