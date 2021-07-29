import React, { useEffect, useState } from 'react';
import { Button } from '@material-ui/core';
import { useWallet, UseWalletProvider } from 'use-wallet';
import Cookies from 'universal-cookie';
import { CHAIN_ID } from '../../configs';

const cookie = new Cookies();

const ConnectWallet = () => {
  const wallet = useWallet();
  const [status, setStatus] = useState(false);

  const login = async () => {
    console.log('login');
    
    try {
      await wallet.connect('provided');

    } catch (error) {
      console.log('error connecting wallet');
      console.log(error);
    }
    // window.location.reload();
    console.log(wallet);
  }

  const logout = () => {

    console.log('logout');
    wallet.reset();
    cookie.remove("account");
    // window.location.reload();
  }

  useEffect(() => {
    const account = cookie.get("account");

    if (!account && wallet.status === "connected") {
      cookie.set("account", wallet.account);
    }

    setStatus(cookie.get("account") != null);
  });

  return (
    <div>
      { status ? (
        <Button
          color="secondary"
          onClick={() => logout()}
        >
          Logout
        </Button>
      ) : (
        <Button
          color="secondary"
          onClick={() => login()}
        >
          Connect Wallet
        </Button>
      )}
    </div>
  )
}

export default () => (
  <UseWalletProvider
    chainId={CHAIN_ID}
    connectors={{
      provided: { provider: window.cleanEthereum },
    }}
  >
    <ConnectWallet/>
  </UseWalletProvider>
)
