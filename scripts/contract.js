const Web3 = require('web3');
const Contract = require('@truffle/contract');

const { ETH_NETWORK } = require('../src/configs');
const keyRegistration = require('../src/truffle/build/contracts/KeyRegistration.json');

const getContract = async () => {
  const contract = Contract(keyRegistration);
  const provider = new Web3.providers.HttpProvider(ETH_NETWORK);
  await contract.setProvider(provider);

  return contract.deployed();
}

const createKeyBundle = async (data, address) => {
  const contract = await getContract();

  return contract.createKeyBundle(
    data.keyId,
    data.userId,
    data.idPublicKey,
    data.preKeyPub,
    data.signedPreKeyPub,
    data.signature,
    data.userSign,
    {
      from: address
    }
  );
}

module.exports = {
  createKeyBundle
}
