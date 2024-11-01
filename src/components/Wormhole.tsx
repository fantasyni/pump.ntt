import WormholeConnect, { DEFAULT_ROUTES, WormholeConnectConfig, nttRoutes } from '@wormhole-foundation/wormhole-connect';
import { nttManualRoute, NttRoute } from '@wormhole-foundation/sdk-route-ntt';
import { Ntt } from "@wormhole-foundation/sdk-definitions-ntt";
import { useGetNttObject } from '../hooks/useGetNttObjects';
import { Chain, routes } from '@wormhole-foundation/sdk';
import { useSearchParams } from "react-router-dom"
import { Contract } from '../constants';
import { NttInfo } from '../typing';

// const nttRoutes = (nc: NttRoute.Config): routes.RouteConstructor[] => {
//   return [nttManualRoute(nc)];
// };

type NttContracts = {
  [key in Chain]?: Ntt.Contracts;
};

function reformat(contracts: NttContracts) {
  return Object.entries(contracts).map(([chain, data]) => {
    const { token, manager, transceiver: xcvrs, quoter } = data;
    const transceiver = Object.entries(xcvrs).map(([k, v]) => {
      return { type: k as NttRoute.TransceiverType, address: v };
    });
    return { chain: chain as Chain, token, manager, quoter, transceiver };
  });
}

export function Wormhole() {
  const [searchParams] = useSearchParams()
  const ntt = searchParams.get('ntt')
  if (ntt) {
    const { data: nttObjects, isSuccess: isGetNttObjectsSuccess } = useGetNttObject(ntt);

    let resultData: NttInfo[] = [];

    if (isGetNttObjectsSuccess) {
      resultData = nttObjects;
      console.log("isGetNttObjectsSuccess")
      console.log(resultData)

      const TEST_NTT_TOKENS: NttContracts = {
        // Fantom: {
        //   token: "0xf85e513341444c6cb1a5b05f788bfe3cc17e2ce9",
        //   manager: "0x04b05134353c0150498d851c3d1a196ddd4a2a5a",
        //   transceiver: { wormhole: "0x16cf26bdd9d31f7337d72a42a696861364244431" },
        // }
      };

      let tokensConfig = {};

      if (resultData.length) {
        let chains = resultData[0].chain_infos || [];
        for (var i = 0; i < chains.length; i++) {
          let chain = chains[i].chain;
          let ntt_info = chains[i].ntt;
          let token_info = chains[i].token;
          let symbol = token_info.symbol;
          let token_address = token_info.coinType || token_info.token_address;
          if (symbol) {
            let token_key = symbol + "_" + chain;
            tokensConfig[token_key] = {
              key: token_key,
              symbol: symbol,
              nativeChain: chain, // will be shown as native only on this chain, otherwise as "Wormhole wrapped"
              displayName: symbol + ' (' + chain + ')', // name that is displayed in the Route
              tokenId: {
                chain: chain,
                address: token_address // token address
              },
              coinGeckoId: 'test',
              icon: 'https://wormhole.com/token.png',
              color: '#00C3D9',
              decimals: token_info.decimal
            }
          }

          TEST_NTT_TOKENS[chain] = {
            token: token_address,
            manager: ntt_info.ntt_address,
            transceiver: { wormhole: ntt_info.emitter_address },
            chain_info: chains[i]
          }
        }

        console.log(TEST_NTT_TOKENS);
        console.log("tokensConfig")
        console.log(tokensConfig)

        let ntt_key = "JCOIN_NTT";
        const nttTokens = {};

        let nttConfigs = reformat(TEST_NTT_TOKENS);

        for (var i = 0; i < nttConfigs.length; i++) {
          let nttConfig = nttConfigs[i];
          let chain = nttConfig.chain;
          if (TEST_NTT_TOKENS[chain]) {
            let chain_info = TEST_NTT_TOKENS[chain]["chain_info"];
            let moreConfig = {};

            if (chain == "Sui") {
              moreConfig["stateObjectId"] = chain_info.ntt.nttStateObjectId;
              moreConfig["nttPackageId"] = Contract.SuiNttPackageId;
              moreConfig["coreBridgeObjectId"] = Contract.SuiWormholeStateObjectId;
              moreConfig["coreBridgePackageId"] = Contract.SuiWormholeCorePackageId;
              moreConfig["tokenType"] = chain_info.token.coinType;
              moreConfig["adminCapObjectId"] = chain_info.ntt.nttAdminCapObjectId;

              nttConfig["more"] = moreConfig;
            } else if (chain == "Aptos") {
              moreConfig["nttPackageId"] = Contract.AptosNttPackageId;
              moreConfig["nttManagerAddress"] = chain_info.ntt.ntt_address;
              moreConfig["tokenAddress"] = chain_info.token.token_address;

              nttConfig["more"] = moreConfig;
            }
          }
        }
        nttTokens[ntt_key] = nttConfigs;

        let myNttConfig = { tokens: nttTokens };
        const config: WormholeConnectConfig = {
          network: "Testnet",
          // chains: ['Avalanche', 'Celo'],
          chains: ['Sui', 'Aptos'],
          routes: [
            // ...DEFAULT_ROUTES,
            ...nttRoutes(myNttConfig),
          ],
          tokensConfig
        };

        return (
          <WormholeConnect config={config} />
        );
      }
    }
  } else {
    const config: WormholeConnectConfig = {
      network: "Testnet",
      chains: ['Sui', 'Aptos'],
      routes: [
        ...DEFAULT_ROUTES,
      ],
    };
    return (
      <WormholeConnect config={config} />
    );
  }
}