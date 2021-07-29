const Web3 = require('web3');
const { ETH_NETWORK, PRIVATE_KEY } = require('../configs');

export const enableWeb3 = async () => {
  if ('ethereum' in window) {
    window.web3 = new Web3(window.ethereum);

    try {
      await window.ethereum.enable();
    } catch {
      return false;
    }
  }

  return true;
}

export const sign = async (payload) => {
  const provider = new Web3.providers.HttpProvider(ETH_NETWORK);
  const web3 = new Web3(provider);

  const msg = JSON.stringify(payload);
  const sign = await web3.eth.accounts.sign(msg, PRIVATE_KEY);

  return JSON.stringify(sign);
}

export const verify = async (sign, address) => {
  const provider = new Web3.providers.HttpProvider(ETH_NETWORK);
  const web3 = new Web3(provider);

  const signObj = JSON.parse(sign);
  const signer = await web3.eth.accounts.recover(signObj);

  return signer === address;
}

export const getAddress = async () => {
  const provider = new Web3.providers.HttpProvider(ETH_NETWORK);
  const web3 = new Web3(provider);
  // console.log(web3.eth)
  // console.log(web3.eth.currentProvider)
  // console.log(web3.eth.currentProvider.selectedAddress)
  

  // return web3.currentProvider.selectedAddress;

  const addresses = await web3.eth.getAccounts();
  // const address = web3.eth

  // console.log(addresses);

  return addresses[0];
}
