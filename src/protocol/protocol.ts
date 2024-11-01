import { UnsignedTransaction } from "@wormhole-foundation/sdk";
import { _platform } from "@wormhole-foundation/sdk-sui";
import { Network, Chain } from '@wormhole-foundation/sdk';
import { getContext } from "../utils/wallet/index.js";
import { Context } from "../sdklegacy/types.js";
import { Contract } from "../constants.js";
import { SuiNttStarter } from "./sui.js";
import { AptosNttStarter } from "./aptos.js";

export namespace NttStarter {
    const _protocol = "NttStarter";
    export type ProtocolName = typeof _protocol;
}

export interface NttStarter<N extends Network, C extends Chain> {
    createToken(params: any): AsyncGenerator<UnsignedTransaction<N, C>>;

    mintInitToken(params: any): AsyncGenerator<UnsignedTransaction<N, C>>;

    createNtt(mode: number): AsyncGenerator<UnsignedTransaction<N, C>>;

    registerToken(params: any): AsyncGenerator<UnsignedTransaction<N, C>>;

    getTransactionBlock(client: any, txid: string): Promise<any>;

    getTokenInfo(client: any, txid: string): Promise<any>;

    getNttInfo(client: any, txid: string): Promise<any>;

    setPeer(params: any): AsyncGenerator<UnsignedTransaction<N, C>>;
}

export const getProtocol = (chain: Chain) => {
    let context = getContext(chain);
    let network = Contract.Network as Network;
    if (context == Context.SUI) {
        return new SuiNttStarter(network, "Sui");
    } else if (context == Context.APTOS) {
        return new AptosNttStarter(network, "Aptos");
    }
};