export const isMetamaskAvailable = () => {
  return "ethereum" in window && "isMetaMask" in window.ethereum;
}
