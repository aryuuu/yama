const Web3 = require('web3');
const Contract = require('@truffle/contract');

const { ETH_NETWORK } = require('../configs');
const keyRegistration = require('../truffle/build/contracts/KeyRegistration.json')

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
  )
}

const getKeyBundle = async (ownerAddress) => {
  const contract = await getContract();

  return contract.getKeyBundle(ownerAddress);
}

module.exports = {
  getContract,
  createKeyBundle,
  getKeyBundle
}
