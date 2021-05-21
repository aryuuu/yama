const signal = require('libsignal-protocol-nodejs');
const KeyHelper = signal.KeyHelper;
const store = {};

const registrationId = KeyHelper.generateRegistrationId();
console.log(registrationId);

const genKeyPair = async () => {
  const keyPair = await KeyHelper.generateIdentityKeyPair();
  console.log(JSON.stringify(keyPair.pubKey));
  console.log(JSON.stringify(keyPair.privKey));
  console.log(keyPair);
}

const genPreKey = async () => {
  const preKey = await KeyHelper.generatePreKey(registrationId);
  console.log(preKey)
}

genKeyPair();
genPreKey();
