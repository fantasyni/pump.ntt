import { Context } from '../sdklegacy';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  disconnect,
  swapWalletConnections,
  TransferWallet,
} from '../utils/wallet';

export type WalletData = {
  type: Context | undefined;
  address: string;
  currentAddress: string;
  error: string;
  icon?: string; // the wallet's icon encoded as a base64 string
  name: string;
};

export interface WalletState {
  sending: WalletData;
  receiving: WalletData;
  Sui: WalletData;
  Aptos: WalletData;
}

const NO_WALLET: WalletData = {
  address: '',
  type: undefined,
  currentAddress: '',
  error: '',
  icon: undefined,
  name: '',
};

const initialState: WalletState = {
  sending: NO_WALLET,
  receiving: NO_WALLET,
  Sui: NO_WALLET,
  Aptos: NO_WALLET,
};

export type ConnectPayload = {
  address: string;
  type: Context;
  icon?: string;
  name: string;
};

function getWalletState(state: WalletState, type: Context): WalletData {
  if (type == Context.SUI) {
    return state.Sui;
  } else if (type == Context.APTOS) {
    return state.Aptos;
  } else {
    return NO_WALLET;
  }
}

export const walletSlice = createSlice({
  name: 'wallet',
  initialState,
  reducers: {
    connectWallet: (
      state: WalletState,
      { payload }: PayloadAction<ConnectPayload>,
    ) => {
      let wallet: WalletData = getWalletState(state, payload.type);

      if (payload.type) {
        wallet.address = payload.address;
        wallet.currentAddress = payload.address;
        wallet.type = payload.type;
        wallet.name = payload.name;
        wallet.error = '';
        wallet.icon = payload.icon;
      }
    },
    connectReceivingWallet: (
      state: WalletState,
      { payload }: PayloadAction<ConnectPayload>,
    ) => {
      state.receiving.address = payload.address;
      state.receiving.currentAddress = payload.address;
      state.receiving.type = payload.type;
      state.receiving.name = payload.name;
      state.receiving.error = '';
      state.receiving.icon = payload.icon;
    },
    clearWallet: (
      state: WalletState,
      { payload }: PayloadAction<Context>,
    ) => {
      let wallet: WalletData = getWalletState(state, payload);
      wallet.address = NO_WALLET.address;
      wallet.currentAddress = NO_WALLET.address;
      wallet.type = NO_WALLET.type;
      wallet.name = NO_WALLET.name;
      wallet.error = '';
      wallet.icon = NO_WALLET.icon;
    },
    disconnectWallet: (
      state: WalletState,
      { payload }: PayloadAction<Context>,
    ) => {
      
    },
    setWalletError: (
      state: WalletState,
      { payload }: PayloadAction<{ type: TransferWallet; error: string }>,
    ) => {
      const { type, error } = payload;
      state[type].error = error;
    },
    setAddress: (
      state: WalletState,
      { payload }: PayloadAction<{ type: TransferWallet; address: string }>,
    ) => {
      const { type, address } = payload;
      state[type].address = address;
      state[type].currentAddress = address;
    },
    clearWallets: (state: WalletState) => {
      Object.keys(state).forEach((key) => {
        // @ts-ignore
        state[key] = initialState[key];
      });
    },
    disconnectWallets: (state: WalletState) => {
      disconnect(TransferWallet.SENDING);
      disconnect(TransferWallet.RECEIVING);
      Object.keys(state).forEach((key) => {
        // @ts-ignore
        state[key] = initialState[key];
      });
    },
    swapWallets: (state: WalletState) => {
      const tmp = state.sending;
      state.sending = state.receiving;
      state.receiving = tmp;
      swapWalletConnections();
    },
  },
});

export const {
  connectWallet,
  connectReceivingWallet,
  clearWallet,
  setAddress,
  setWalletError,
  clearWallets,
  disconnectWallet,
  disconnectWallets,
  swapWallets,
} = walletSlice.actions;

export default walletSlice.reducer;
