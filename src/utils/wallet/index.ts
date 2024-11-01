import { Context, CONFIG } from '../../sdklegacy';
import {
  Wallet,
  WalletState,
} from '@xlabs-libs/wallet-aggregator-core';
import {
  connectWallet as connectWalletStore,
  clearWallet,
} from '../../store/wallet';

// import { AssetInfo } from './evm';
import { Dispatch } from 'redux';

import { Network, Chain, UnsignedTransaction, toChainId, ChainId } from '@wormhole-foundation/sdk';

import {
  SuiUnsignedTransaction,
  SuiChains,
} from '@wormhole-foundation/sdk-sui';
import {
  AptosUnsignedTransaction,
  AptosChains,
} from '@wormhole-foundation/sdk-aptos';
import { Contract } from '../../constants'

export enum TransferWallet {
  SENDING = 'sending',
  RECEIVING = 'receiving',
}

const walletConnection = {};

export const setWalletConnection = (chain_id: ChainId, wallet: Wallet) => {
  walletConnection[chain_id] = wallet;
};

export function getContext(chain: Chain): Context {
  let network = Contract.Network.toUpperCase();
  return CONFIG[network].chains[chain].context
}

export const connectWallet = async (
  chain: Chain,
  walletInfo: WalletData,
  dispatch: Dispatch<any>,
) => {
  const { wallet, name } = walletInfo;

  let chainId = toChainId(chain);
  setWalletConnection(chainId, wallet);

  let context = getContext(chain);

  await wallet.connect({ chainId });

  // config.triggerEvent({
  //   type: 'wallet.connect',
  //   details: {
  //     side: type,
  //     chain: chain,
  //     wallet: walletInfo.name.toLowerCase(),
  //   },
  // });

  const address = wallet.getAddress()!;
  console.log("connect to wallet ")
  console.log(address)

  const payload = {
    address,
    type: walletInfo.type,
    icon: wallet.getIcon(),
    name: wallet.getName(),
  };

  dispatch(connectWalletStore(payload));

  // clear wallet when the user manually disconnects from outside the app
  wallet.on('disconnect', () => {
    wallet.removeAllListeners();
    dispatch(clearWallet(walletInfo.type));
    localStorage.removeItem(`wormhole-connect:wallet:${context}`);
  });

  // when the user has multiple wallets connected and either changes
  // or disconnects the current wallet, clear the wallet
  wallet.on('accountsChanged', (accs: string[]) => {
    // disconnect only if there are no accounts, or if the new account is different from the current
    const shouldDisconnect =
      accs.length === 0 || (accs.length && address && accs[0] !== address);

    if (shouldDisconnect) {
      wallet.disconnect();
    }
  });

  localStorage.setItem(`wormhole-connect:wallet:${context}`, name);
};

export const getWalletData = async (
  chain: Chain,
  walletName: string,
) => {
  let context = getContext(chain);
  const options = await getWalletOptions(context);
  if (walletName) {
    const wallet = options.find((w) => w.name === walletName);
    return wallet;
  }
}

export const disconnectChainWallet = async (
  chain: Chain,
  walletName: string,
  dispatch: Dispatch<any>,
) => {
  const wallet = await getWalletData(chain, walletName);
  if (wallet) {
    wallet.wallet.disconnect();
    wallet.wallet.removeAllListeners();
    dispatch(clearWallet(wallet.type));
  }
}

export const connectChainWallet = async (
  chain: Chain,
  walletName: string,
  dispatch: Dispatch<any>,
) => {
  const wallet = await getWalletData(chain, walletName);
  if (wallet) {
    await connectWallet(chain, wallet, dispatch);
  }
};

export const getWalletConnection = (chain_id: ChainId) => {
  return walletConnection[chain_id];
};

export const swapWalletConnections = () => {

};

export const switchChain = async (
  _chainId: number | string,
  _type: TransferWallet,
): Promise<string | undefined> => {
  // const w: Wallet = walletConnection[type]! as any;
  // if (!w) throw new Error('must connect wallet');

  // let chain = toChain(chainId);
  // let context = getContext(chain);
  // const currentChain = w.getNetworkInfo().chainId;
  // if (currentChain === chainId) return;
  // if (context === Context.ETH) {
  //   try {
  //     // some wallets may not support chain switching
  //     const { switchChain } = await import('./evm');
  //     await switchChain(w, chainId as number);
  //   } catch (e) {
  //     if (e instanceof NotSupported) return;
  //     throw e;
  //   }
  // }
  // if (context === Context.COSMOS) {
  //   const { switchChain } = await import('./cosmos');
  //   await switchChain(w, chainId as string);
  // }
  // return w.getAddress();
  return "";
};

export const disconnect = async (type: TransferWallet) => {
  const w = walletConnection[type]! as any;
  if (!w) return;
  await w.disconnect();
};

// export const watchAsset = async (asset: AssetInfo, type: TransferWallet) => {
//   const wallet = walletConnection[type]!;
//   const { watchAsset } = await import('./evm');
//   await watchAsset(asset, wallet);
// };

export const signAndWait = async (
  chain: Chain,
  request: AsyncGenerator<UnsignedTransaction<Network, Chain>, any, any>,
  options: any = {},
): Promise<string[]> => {
  const txids: string[] = [];

  for await (const tx of request) {
    let txid = await signAndSendTransaction(chain, tx, options)
    txids.push(txid);
  }
  return txids;
}

export const signAndSendTransaction = async (
  chain: Chain,
  request: UnsignedTransaction<Network, Chain>,
  _options: any = {},
): Promise<string> => {
  let context = getContext(chain);

  let chain_id = toChainId(chain);
  const wallet = getWalletConnection(chain_id)
  if (!wallet) {
    throw new Error('wallet is undefined');
  }

  if (context === Context.ETH) {
    // const { signAndSendTransaction } = await import('./evm');
    // const tx = await signAndSendTransaction(
    //   request as EvmUnsignedTransaction<Network, EvmChains>,
    //   wallet,
    //   chain,
    //   options,
    // );
    // return tx;
  } else if (context === Context.SOLANA) {
    // const { signAndSendTransaction } = await import('./solana');
    // const signature = await signAndSendTransaction(
    //   request as SolanaUnsignedTransaction<Network>,
    //   wallet,
    //   options,
    // );
    // return signature;
  } else if (context === Context.SUI) {
    const { signAndSendTransaction } = await import('./sui');
    const tx = await signAndSendTransaction(
      request as SuiUnsignedTransaction<Network, SuiChains>,
      wallet,
    );
    return tx.id;
  } else if (context === Context.APTOS) {
    const { signAndSendTransaction } = await import('./aptos');
    const tx = await signAndSendTransaction(
      request as AptosUnsignedTransaction<Network, AptosChains>,
      wallet,
    );
    return tx.id;
  } 

  throw new Error('unimplemented');
};

const getReady = (wallet: Wallet) => {
  const ready = wallet.getWalletState();
  return ready !== WalletState.Unsupported && ready !== WalletState.NotDetected;
};

export type WalletData = {
  name: string;
  type: Context;
  icon: string;
  isReady: boolean;
  wallet: Wallet;
};

const mapWallets = (
  wallets: Record<string, Wallet>,
  type: Context,
  skip: string[] = [],
): WalletData[] => {
  return Object.values(wallets)
    .filter(
      (wallet, index, self) =>
        index === self.findIndex((o) => o.getName() === wallet.getName()),
    )
    .filter((wallet) => !skip.includes(wallet.getName()))
    .map((wallet) => ({
      wallet,
      type,
      name: wallet.getName(),
      icon: wallet.getIcon(),
      isReady: getReady(wallet),
    }));
};

export const getWalletOptions = async (
  context: Context
): Promise<WalletData[]> => {
  if (context === undefined) {
    return [];
  } else if (context === Context.ETH) {
    // const { wallets } = await import('./evm');
    // return Object.values(mapWallets(wallets, Context.ETH));
  } else if (context === Context.SOLANA) {
    // const { fetchOptions } = await import('./solana');
    // const solanaWallets = fetchOptions();
    // return Object.values(mapWallets(solanaWallets, Context.SOLANA));
  } else if (context === Context.SUI) {
    const suiWallet = await import('./sui');
    // const suiWallet = await import('utils/wallet/sui');
    const suiOptions = await suiWallet.fetchOptions();
    console.log(suiOptions)
    return Object.values(mapWallets(suiOptions, Context.SUI));
  } else if (context === Context.APTOS) {
    const aptosWallet = await import('./aptos');
    const aptosOptions = aptosWallet.fetchOptions();
    return Object.values(mapWallets(aptosOptions, Context.APTOS));
  } else if (context === Context.SEI) {
    // const seiWallet = await import('./sei');
    // const seiOptions = await seiWallet.fetchOptions();
    // return Object.values(mapWallets(seiOptions, Context.SEI));
  } else if (context === Context.COSMOS) {
    // if (config.key === 'Evmos') {
    //   const {
    //     wallets: { cosmosEvm },
    //   } = await import('utils/wallet/cosmos');

    //   return Object.values(
    //     mapWallets(cosmosEvm, Context.COSMOS, ['OKX Wallet']),
    //   );
    // } else if (config.key === 'Injective') {
    //   const {
    //     wallets: { cosmosEvm },
    //   } = await import('utils/wallet/cosmos');

    //   return Object.values(
    //     mapWallets(cosmosEvm, Context.COSMOS, ['OKX Wallet']),
    //   );
    // } else {
    //   const {
    //     wallets: { cosmos },
    //   } = await import('utils/wallet/cosmos');

    //   return Object.values(mapWallets(cosmos, Context.COSMOS));
    // }
  }
  return [];
};
