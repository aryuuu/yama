import React, { useState, useContext, createContext } from 'react';

const AccountContext = createContext("");
const UpdateAccountContext = createContext();

export const useAccount = () => {
  return useContext(AccountContext);
}

export const useUpdateAccount = () => {
  return useContext(UpdateAccountContext);
}

export const AccountProvider = (props) => {
  const { children } = props;
  const [account, setAccount] = useState("");

  return (
    <AccountContext.Provider value={account}>
      <UpdateAccountContext.Provider value={setAccount}>
        {children}
      </UpdateAccountContext.Provider>
    </AccountContext.Provider>
  )
}
