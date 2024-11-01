import type {
  AccountAddress,
  Chain,
  ChainAddress,
  ChainsConfig,
  Contracts,
  Network,
  UnsignedTransaction
} from "@wormhole-foundation/sdk-connect";

import {
  keccak256,
  nativeChainIds,
  serialize,
  toChainId,
} from "@wormhole-foundation/sdk-connect";

import {
  Ntt,
  NttTransceiver,
  WormholeNttTransceiver,
} from "@wormhole-foundation/sdk-definitions-ntt";

import type {
  AptosChains,
  AptosPlatformType,
} from "@wormhole-foundation/sdk-aptos";
import {
  AptosPlatform,
  AptosUnsignedTransaction,
} from "@wormhole-foundation/sdk-aptos";
import type { AptosClient, Types } from "aptos";

import "@wormhole-foundation/sdk-aptos-core";

export type AptosContracts = {
  packageId: string;
  nttManagerAddress: string;
  tokenAddress: string;
};

export class AptosNtt<N extends Network, C extends AptosChains> implements Ntt<N, C> {
  readonly chainId: bigint;
  nttPackageId: string;
  nttManagerAddress: string;
  tokenAddress: string;

  constructor(
    readonly network: N,
    readonly chain: C,
    readonly connection: AptosClient,
    readonly contracts: Contracts & { ntt?: AptosContracts },
  ) {
    if (!contracts.ntt) throw new Error("No Ntt Contracts provided");
    let config = (contracts.ntt as any).more;

    if (!config) throw new Error("No More Ntt Contracts provided");
    
    this.chainId = nativeChainIds.networkChainToNativeChainId.get(network, chain) as bigint;
    this.nttPackageId = config.nttPackageId;
    this.nttManagerAddress = config.nttManagerAddress;
    this.tokenAddress = config.tokenAddress;
  }

  static async fromRpc<N extends Network>(
    connection: AptosClient,
    config: ChainsConfig<N, AptosPlatformType>,
  ): Promise<AptosNtt<N, AptosChains>> {
    const [network, chain] = await AptosPlatform.chainFromRpc(connection);
    const conf = config[chain]!;
    if (conf.network !== network)
      throw new Error("Network mismatch " + conf.network + " !== " + network);
    return new AptosNtt(network as N, chain, connection, conf.contracts);
  }

  async *transfer(
    _sender: AccountAddress<C>,
    amount: bigint,
    destination: ChainAddress,
    _options: Ntt.TransferOptions
  ): AsyncGenerator<AptosUnsignedTransaction<N, C>> {

    const nonce = 0n;
    const dstAddress = destination.address.toUniversalAddress().toUint8Array();
    const dstChain = toChainId(destination.chain);

    yield this.createUnsignedTx(
      {
        function: `${this.nttPackageId}::ntt_manager::transfer_tokens`,
        type_arguments: [],
        arguments: [this.nttManagerAddress, this.tokenAddress, amount, dstChain, dstAddress, nonce],
      },
      "Aptos.transfer",
    );
  }

  async *redeem(attestations: Ntt.Attestation[]) {
    const wormholeNTT = attestations[0]! as WormholeNttTransceiver.VAA;
    const vaa = serialize(wormholeNTT);

    yield this.createUnsignedTx(
      {
        function: `${this.nttPackageId}::ntt_transceiver::submit_vaa`,
        type_arguments: [],
        arguments: [this.nttManagerAddress, this.tokenAddress, vaa],
      },
      "Aptos.redeem",
    );
  }

  async getIsApproved(attestation: Ntt.Attestation): Promise<boolean> {
    return this.getIsExecuted(attestation);
  }

  async getIsExecuted(attestation: Ntt.Attestation): Promise<boolean> {
    let hash = attestation.hash;
    const state = (
      await this.connection.getAccountResource(
        this.nttManagerAddress,
        `${this.nttPackageId}::ntt_state::State`,
      )
    ).data as any;

    const handle = state.consumed_vaas.elems.handle;

    // check if vaa hash is in consumed_vaas
    try {
      // when accessing Set<T>, key is type T and value is 0
      await this.connection.getTableItem(handle, {
        key_type: "vector<u8>",
        value_type: "u8",
        key: `0x${Buffer.from(keccak256(hash)).toString("hex")}`,
      });
      return true;
    } catch {
      return false;
    }
    return false;
  }

  getMode(): Promise<Ntt.Mode> {
    throw new Error("Method not implemented.");
  }
  isPaused(): Promise<boolean> {
    throw new Error("Method not implemented.");
  }
  pause(_payer?: AccountAddress<C> | undefined): AsyncGenerator<UnsignedTransaction<N, C>, any, any> {
    throw new Error("Method not implemented.");
  }
  unpause(_payer?: AccountAddress<C> | undefined): AsyncGenerator<UnsignedTransaction<N, C>, any, any> {
    throw new Error("Method not implemented.");
  }
  getOwner(): Promise<AccountAddress<C>> {
    throw new Error("Method not implemented.");
  }
  getPauser(): Promise<AccountAddress<C> | null> {
    throw new Error("Method not implemented.");
  }
  setOwner(_newOwner: AccountAddress<C>, _payer?: AccountAddress<C> | undefined): AsyncGenerator<UnsignedTransaction<N, C>, any, any> {
    throw new Error("Method not implemented.");
  }
  setPauser(_newOwner: AccountAddress<C>, _payer?: AccountAddress<C> | undefined): AsyncGenerator<UnsignedTransaction<N, C>, any, any> {
    throw new Error("Method not implemented.");
  }
  getThreshold(): Promise<number> {
    throw new Error("Method not implemented.");
  }
  getPeer<C extends Chain>(_chain: C): Promise<Ntt.Peer<C> | null> {
    throw new Error("Method not implemented.");
  }
  getTransceiver(_ix: number): Promise<NttTransceiver<N, C, Ntt.Attestation> | null> {
    throw new Error("Method not implemented.");
  }
  getOutboundLimit(): Promise<bigint> {
    throw new Error("Method not implemented.");
  }
  setOutboundLimit(_limit: bigint, _payer?: AccountAddress<C> | undefined): AsyncGenerator<UnsignedTransaction<N, C>, any, any> {
    throw new Error("Method not implemented.");
  }
  getRateLimitDuration(): Promise<bigint> {
    return new Promise((resolve, _reject) => {
      resolve(0n)
    });
  }
  getInboundLimit(_fromChain: Chain): Promise<bigint> {
    throw new Error("Method not implemented.");
  }
  setInboundLimit(_fromChain: Chain, _limit: bigint, _payer?: AccountAddress<C> | undefined): AsyncGenerator<UnsignedTransaction<N, C>, any, any> {
    throw new Error("Method not implemented.");
  }
  getIsTransferInboundQueued(_attestation: Ntt.Attestation): Promise<boolean> {
    throw new Error("Method not implemented.");
  }
  completeInboundQueuedTransfer(_fromChain: Chain, _transceiverMessage: Ntt.Message, _payer?: AccountAddress<C> | undefined): AsyncGenerator<UnsignedTransaction<N, C>, any, any> {
    throw new Error("Method not implemented.");
  }
  verifyAddresses(): Promise<Partial<Ntt.Contracts> | null> {
    throw new Error("Method not implemented.");
  }

  async *setPeer(
    _peer: ChainAddress<C>,
    _tokenDecimals: number,
    _inboundLimit: bigint
  ) {

  }

  async *setWormholeTransceiverPeer(_peer: ChainAddress<C>) {

  }

  isRelayingAvailable(
    _destination: Chain
  ): Promise<boolean> {
    throw new Error("Method not implemented.");
  }

  quoteDeliveryPrice(
    _destination: Chain,
    _options: Ntt.TransferOptions
  ): Promise<bigint> {
    return new Promise((resolve, _reject) => {
      resolve(0n)
    });
  }

  getVersion(
    _payer?: AccountAddress<C> | undefined
  ): Promise<string> {
    throw new Error("Method not implemented.");
  }

  getCustodyAddress(): Promise<string> {
    throw new Error("Method not implemented.");
  }

  getTokenDecimals(): Promise<number> {
    throw new Error("Method not implemented.");
  }

  getCurrentOutboundCapacity(): Promise<bigint> {
    throw new Error("Method not implemented.");
  }

  async getCurrentInboundCapacity(_fromChain: Chain): Promise<bigint> {
    return 0n;
  }

  async getInboundQueuedTransfer(
    _fromChain: Chain,
    _transceiverMessage: Ntt.Message
  ): Promise<Ntt.InboundQueuedTransfer<C> | null> {
    return null;
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
