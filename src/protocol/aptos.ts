import { AptosChains, AptosUnsignedTransaction } from "@wormhole-foundation/sdk-aptos";
import { UnsignedTransaction } from "@wormhole-foundation/sdk";
import { AptosClient, HexString, Types } from "aptos";
import { Network } from '@wormhole-foundation/sdk';
import { NttStarter } from "./protocol";
import { Contract } from "../constants";

export class AptosNttStarter<N extends Network, C extends AptosChains> implements NttStarter<N, C> {
    aptosClient: AptosClient;

    constructor(readonly network: N, readonly chain: C) {
        this.aptosClient = new AptosClient("https://fullnode.testnet.aptoslabs.com");
    }

    async *createToken(
        params: any
    ): AsyncGenerator<UnsignedTransaction<N, C>> {
        let name: string = params.name;
        let symbol: string = params.symbol;
        let decimal: number = params.decimal;
        let ntt_address: string = params.ntt_address;

        yield this.createUnsignedTx(
            {
                function: `${Contract.AptosNttPackageId}::ntt::add_new_native_token`,
                type_arguments: [],
                arguments: [ntt_address, name, symbol, decimal],
            },
            "Aptos.NTTStarter.createNtt",
        );
    }

    async *mintInitToken(params: any): AsyncGenerator<UnsignedTransaction<N, C>> {
        let ntt_address: string = params.ntt_address;
        let token_address: string = params.token_address;
        let amount: number = params.amount;

        yield this.createUnsignedTx(
            {
                function: `${Contract.AptosNttPackageId}::ntt::mint_init_token`,
                type_arguments: [],
                arguments: [ntt_address, token_address, amount],
            },
            "Aptos.NTTStarter.createNtt",
        );
    }

    async *createNtt(mode: number): AsyncGenerator<UnsignedTransaction<N, C>> {
        yield this.createUnsignedTx(
            {
                function: `${Contract.AptosNttPackageId}::ntt::create_ntt`,
                type_arguments: [],
                arguments: [mode],
            },
            "Aptos.NTTStarter.createNtt",
        );
    }

    async *registerToken(params: any): AsyncGenerator<UnsignedTransaction<N, C>> {

    }

    async getTransactionBlock(client: any, txid: string): Promise<any> {
        return await this.aptosClient.getTransactionByHash(txid);
    }

    async getTokenInfo(client: any, txid: string): Promise<any> {
        let txResult = await this.getTransactionBlock(client, txid);

        let addNttTokenArgs = {}

        if (txResult.events) {
            let events = txResult.events;
            if (events) {
                for (var i = 0; i < events.length; i++) {
                    let event = events[i];
                    let type = event.type;
                    if (type.indexOf("CreateTokenEvent") != -1) {
                        addNttTokenArgs = {
                            token_address: event.data.token_address,
                            // registered: true
                        }
                        break;
                    }
                }
            }
        }

        return addNttTokenArgs;
    }

    async getNttInfo(client: any, txid: string): Promise<any> {
        let txResult = await this.getTransactionBlock(client, txid);

        let addNttManagerArgs = {}
        if (txResult.events) {
            let events = txResult.events;
            if (events) {
                for (var i = 0; i < events.length; i++) {
                    let event = events[i];
                    let type = event.type;
                    if (type.indexOf("CreateNttEvent") != -1) {
                        addNttManagerArgs = {
                            ntt_address: event.data.ntt_address.value.data,
                            emitter_address: event.data.emitter_address.external_address
                        }
                        break;
                    }
                }
            }
        }
        return addNttManagerArgs
    }

    async *setPeer(params: any): AsyncGenerator<UnsignedTransaction<N, C>> {
        let ntt_address: string = params.ntt_address;
        let peer_chain_id: number = params.peer_chain_id;
        let peer_manager_contract: string = params.peer_manager_contract;
        let peer_tranceiver_contract: string = params.peer_tranceiver_contract;
        let decimal: number = params.decimal;

        yield this.createUnsignedTx(
            {
                function: `${Contract.AptosNttPackageId}::ntt::set_peer`,
                type_arguments: [],
                arguments: [
                    ntt_address,
                    peer_chain_id,
                    new HexString(peer_manager_contract).toUint8Array(),
                    decimal,
                    new HexString(peer_tranceiver_contract).toUint8Array(),
                ],
            },
            "Aptos.NTTStarter.createNtt",
        );
    }

    private createUnsignedTx(
        txReq: Types.EntryFunctionPayload,
        description: string,
        parallelizable: boolean = false,
    ): AptosUnsignedTransaction<N, C> {
        return new AptosUnsignedTransaction(
            txReq,
            this.network,
            this.chain,
            description,
            parallelizable,
        );
    }
}