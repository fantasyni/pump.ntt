export type CreateAIAgentMessage = {
    id: string;
    price: number;
    name: string;
    encrypt_url: string;
    description: string;
    receive_address: string;
    type_name: string;
    balance: number;
}

export type SelectParam = {
    key: string;
    value: any;
}

export type CallAIMessage = {
    id: string;
    params: string;
    nonce: number;
    caller: string;
}

export type NttInfo = {
    id: string;
    name: string;
    symbol: string;
    mode: string;
    chain_infos: ChainInfo[]
}

export type ChainInfo = {
    opened: boolean;
    chain: string;
    chain_id: number;
    object_id: string;
    token_info: string;
    ntt_info: string;
    peer_info: string;
    token: any;
    ntt: any;
    peer: any;
}