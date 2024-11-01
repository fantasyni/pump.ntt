import { SuiChains, SuiUnsignedTransaction, uint8ArrayToBCS } from "@wormhole-foundation/sdk-sui";
import url from '@mysten/move-bytecode-template/move_bytecode_template_bg.wasm?url';
import init, * as template from '@mysten/move-bytecode-template';
import { UnsignedTransaction } from "@wormhole-foundation/sdk";
import { bcs, fromBase64, toBase64 } from '@mysten/bcs';
import type { SuiClient } from "@mysten/sui.js/client";
import { Network } from '@wormhole-foundation/sdk';
import { TransactionBlock } from "@mysten/sui.js";
import { NttStarter } from "./protocol";
import { Contract } from "../constants";
import { HexString } from "aptos";

export class SuiNttStarter<N extends Network, C extends SuiChains> implements NttStarter<N, C> {
    constructor(readonly network: N, readonly chain: C) { }

    async *createToken(
        params: any
    ): AsyncGenerator<UnsignedTransaction<N, C>> {
        let name: string = params.name;
        let symbol: string = params.symbol;
        let decimal: number = params.decimal;
        let description: string = params.description;
        let iconUrl: string = params.iconUrl;
        let walletAddress: string = params.walletAddress;

        await init(url);

        let templateBytecode = fromBase64(Contract.TokenModuleBase64Code);

        templateBytecode = template.update_identifiers(templateBytecode, {
            TEMPLATE: name.toUpperCase(),
            template: name.toLowerCase(),
        });

        // Update DECIMALS
        templateBytecode = template.update_constants(
            templateBytecode,
            bcs.u8().serialize(decimal).toBytes(), // new value
            bcs.u8().serialize(6).toBytes(), // current value
            'U8', // type of the constant
        );

        // Update SYMBOL
        templateBytecode = template.update_constants(
            templateBytecode,
            bcs.string().serialize(symbol).toBytes(), // new value
            bcs.string().serialize('TMPL').toBytes(), // current value
            'Vector(U8)', // type of the constant
        );

        // Update NAME
        templateBytecode = template.update_constants(
            templateBytecode,
            bcs.string().serialize(name).toBytes(), // new value
            bcs.string().serialize('Template Coin').toBytes(), // current value
            'Vector(U8)', // type of the constant
        );

        // Update DESCRIPTION
        templateBytecode = template.update_constants(
            templateBytecode,
            bcs.string().serialize(description).toBytes(), // new value
            bcs.string().serialize('Template Coin Description').toBytes(), // current value
            'Vector(U8)', // type of the constant
        );

        const tx = new TransactionBlock();

        let modules = [toBase64(templateBytecode)];
        let dependencies = Contract.TokenModuleDependencies;

        const updateCap = tx.publish({ modules, dependencies })
        tx.transferObjects([updateCap[0]], tx.pure(walletAddress));

        yield this.createUnsignedTx(tx, "Sui.NTTStarter.createToken");
    }

    async *mintInitToken(params: any): AsyncGenerator<UnsignedTransaction<N, C>> {
        let nttAdminCapObjectId: string = params.nttAdminCapObjectId;
        let nttStateObjectId: string = params.nttStateObjectId;
        let coinType: string = params.coinType;
        let amount: number = params.amount;

        const tx = new TransactionBlock();

        tx.moveCall({
            target: `${Contract.SuiNttPackageId}::setup::mint_init_token`,
            arguments: [
                tx.object(nttAdminCapObjectId),
                tx.object(nttStateObjectId),
                tx.pure(amount)
            ],
            typeArguments: [coinType]
        });

        yield this.createUnsignedTx(tx, "Sui.NTTStarter.mintInitToken");
    }

    async *createNtt(mode: number): AsyncGenerator<UnsignedTransaction<N, C>> {
        const tx = new TransactionBlock();

        const [emitterCap] = tx.moveCall({
            target: `${Contract.SuiWormholeCorePackageId}::emitter::new`,
            arguments: [tx.object(Contract.SuiWormholeStateObjectId)],
        });

        tx.moveCall({
            target: `${Contract.SuiNttPackageId}::setup::create_ntt`,
            arguments: [
                tx.pure(mode),
                emitterCap,
            ],
        });

        yield this.createUnsignedTx(tx, "Sui.NTTStarter.createNtt");
    }

    async *registerToken(params: any): AsyncGenerator<UnsignedTransaction<N, C>> {
        let nttAdminCapObjectId: string = params.nttAdminCapObjectId;
        let nttStateObjectId: string = params.nttStateObjectId;
        let treasuryCapId: string = params.treasuryCapId;
        let coinMetadataId: string = params.coinMetadataId;
        let coinType: string = params.coinType;

        const tx = new TransactionBlock();

        tx.moveCall({
            target: `${Contract.SuiNttPackageId}::setup::add_new_native_token`,
            arguments: [
                tx.object(nttAdminCapObjectId),
                tx.object(nttStateObjectId),
                tx.object(coinMetadataId),
                tx.object(treasuryCapId)
            ],
            typeArguments: [coinType]
        });

        yield this.createUnsignedTx(tx, "Sui.NTTStarter.registerToken");
    }

    async getTransactionBlock(client: any, txid: string): Promise<any> {
        let suiClient = client as SuiClient;

        return await suiClient.getTransactionBlock({
            digest: txid,
            options: {
                showEffects: true,
                showObjectChanges: true,
                showEvents: true,
            }
        })
    }

    async getTokenInfo(client: any, txid: string): Promise<any> {
        let txresult = await this.getTransactionBlock(client, txid);

        let treasuryCapId: string = "";
        let coinMetadataId: string = "";
        let coinType: string = "";

        let resultData = txresult;
        let objectChanges = resultData.objectChanges;
        if (objectChanges) {
            for (var i = 0; i < objectChanges.length; i++) {
                let objectData = objectChanges[i];
                if (objectData.type == "created") {
                    let objectType = objectData.objectType;
                    if (objectType) {
                        if (objectType.indexOf("coin::TreasuryCap") != -1) {
                            treasuryCapId = objectData.objectId;
                        } else if (objectType.indexOf("coin::CoinMetadata") != -1) {
                            coinMetadataId = objectData.objectId;
                            let coinMatch = objectType.match(/0x2::coin::CoinMetadata<(.*?)>/)
                            if (coinMatch) {
                                coinType = coinMatch[1];
                            }
                        }
                    }
                }
            }
        }

        let addNttTokenArgs = {
            treasuryCapId: treasuryCapId,
            coinMetadataId: coinMetadataId,
            coinType: coinType,
        }

        return addNttTokenArgs;
    }

    async getNttInfo(client: any, txid: string): Promise<any> {
        let txResult = await this.getTransactionBlock(client, txid);

        let nttStateObjectId: string = "";
        let nttAdminCapObjectId: string = "";
        
        let resultData = txResult as any;
        let objectChanges = resultData.objectChanges;
        if (objectChanges) {
            for (var i = 0; i < objectChanges.length; i++) {
                let objectData = objectChanges[i];
                if (objectData.type == "created") {
                    let objectType = objectData.objectType;
                    if (objectType) {
                        if (objectType.indexOf("state::State") != -1) {
                            nttStateObjectId = objectData.objectId;
                        } else if (objectType.indexOf("setup::AdminCap") != -1) {
                            nttAdminCapObjectId = objectData.objectId;
                        }
                    }
                }
            }
        }

        let emitter_address: string = "";

        let events = resultData.events;
        if (events) {
            for(var i = 0;i<events.length;i++) {
                let event = events[i];
                let eventType = event.type;
                if (eventType) {
                    if (eventType.indexOf("CreateNttEvent") != -1) {
                        let eventData = event.parsedJson;
                        emitter_address = eventData.emitter_address;
                    }
                }
            }
        }

        let addNttManagerArgs = {
            nttStateObjectId: nttStateObjectId,
            nttAdminCapObjectId: nttAdminCapObjectId,
            emitter_address: emitter_address
        }

        return addNttManagerArgs;
    }

    async *setPeer(params: any): AsyncGenerator<UnsignedTransaction<N, C>> {
        let nttAdminCapObjectId: string = params.nttAdminCapObjectId;
        let nttStateObjectId: string = params.nttStateObjectId;
        let peer_chain_id: number = params.peer_chain_id;
        let peer_manager_contract: string = params.peer_manager_contract;
        let peer_tranceiver_contract: string = params.peer_tranceiver_contract;
        let decimal: number = params.decimal;

        const tx = new TransactionBlock();

        tx.moveCall({
            target: `${Contract.SuiNttPackageId}::setup::set_manager_peer`,
            arguments: [
                tx.object(nttAdminCapObjectId),
                tx.object(nttStateObjectId),
                tx.pure(peer_chain_id),
                // tx.pure(uint8ArrayToBCS(new TextEncoder().encode(peer_manager_contract))),
                tx.pure(uint8ArrayToBCS(new HexString(peer_manager_contract).toUint8Array())),
                tx.pure(decimal)
            ],
        });

        tx.moveCall({
            target: `${Contract.SuiNttPackageId}::setup::set_transceiver_peer`,
            arguments: [
                tx.object(nttAdminCapObjectId),
                tx.object(nttStateObjectId),
                tx.pure(peer_chain_id),
                tx.pure(uint8ArrayToBCS(new HexString(peer_tranceiver_contract).toUint8Array())),
            ],
        });

        yield this.createUnsignedTx(tx, "Sui.NTTStarter.setPeer");
    }

    private createUnsignedTx(
        txReq: any,
        description: string,
        parallelizable: boolean = false,
    ): SuiUnsignedTransaction<N, C> {
        return new SuiUnsignedTransaction(txReq, this.network, this.chain, description, parallelizable);
    }
}