import { useCurrentAccount, useSuiClient } from "@mysten/dapp-kit";
import { SuiObjectResponse, SuiClient } from "@mysten/sui/client";
import { toChain } from "@wormhole-foundation/sdk";
import { useQuery } from "@tanstack/react-query";
import { NttInfo, ChainInfo } from "../typing";
import { Contract } from "../constants";

export function useGetNttChainObject(objectId: string, chain: string) {
    const client = useSuiClient();

    return useQuery({
        queryKey: ["useGetNttChainObject", objectId, chain],
        queryFn: async () => {
            if (objectId && chain) {
                const keyObjectIds: string[] = [objectId];

                let resultData = await getNttInfos(client, keyObjectIds);
                if (resultData && resultData.length > 0) {
                    let result = resultData[0];
                    for (var i = 0; i < result.chain_infos.length; i++) {
                        if (result.chain_infos[i].chain == chain) {
                            return result.chain_infos[i];
                        }
                    }
                }
            }
        }
    });
}

export function useGetNttObject(objectId: string) {
    const client = useSuiClient();

    return useQuery({
        queryKey: ["useGetNttObject", objectId],
        queryFn: async () => {
            const keyObjectIds: string[] = [objectId];

            let resultData = await getNttInfos(client, keyObjectIds);
            return resultData;
        }
    });
}

export function useGetNttObjects() {
    const currentAccount = useCurrentAccount();
    const client = useSuiClient();

    return useQuery({
        queryKey: ["useGetNttObjects"],
        queryFn: async () => {
            if (!currentAccount?.address) {
                throw new Error("You need to connect your wallet!");
            }

            const objectsResponse: SuiObjectResponse[] = [];

            const owner = currentAccount.address;
            let hasNextPage = false;
            let nextCursor: string | null | undefined = null;
            do {
                const paginatedKeyObjectsResponse = await client.getOwnedObjects({
                    owner,
                    filter: {
                        StructType: Contract.PumpNttObjectType,
                    },
                    cursor: nextCursor,
                });
                objectsResponse.push(...paginatedKeyObjectsResponse.data);
                if (paginatedKeyObjectsResponse.hasNextPage && paginatedKeyObjectsResponse.nextCursor) {
                    hasNextPage = true;
                    nextCursor = paginatedKeyObjectsResponse.nextCursor;
                } else {
                    hasNextPage = false;
                }
            } while (hasNextPage);

            const keyObjectIds: string[] = objectsResponse
                .map((ref: any) => ref?.data?.objectId)
                .filter((id: any) => id !== undefined);

            let resultData = await getNttInfos(client, keyObjectIds);
            return resultData;
        }
    });
}

export async function getNttInfos(client: SuiClient, keyObjectIds: string[]): Promise<NttInfo[]> {
    const keyObjects = await client.multiGetObjects({
        ids: keyObjectIds,
        options: {
            showContent: true,
            showDisplay: true,
            showType: true,
            showOwner: true
        }
    });

    let resultData: NttInfo[] = [];

    for (var i = 0; i < keyObjects.length; i++) {
        let item = keyObjects[i].data;
        if (item) {
            if (item.content && 'fields' in item.content) {
                const fields = item.content.fields as any;

                let mode = "";
                if (parseInt(fields.mode) == 0) {
                    mode = "LOCKING"
                } else if (parseInt(fields.mode) == 1) {
                    mode = "BURNING"
                }

                let nttInfo: NttInfo = {
                    id: fields.id.id,
                    name: fields.name,
                    symbol: fields.symbol,
                    mode: mode,
                    chain_infos: []
                }

                let chain_infos: ChainInfo[] = await getNttChainInfos(client, nttInfo.id);
                nttInfo.chain_infos = chain_infos;

                resultData.push(nttInfo)
            }
        }
    }

    return resultData;
}

export async function getNttChainInfos(client: SuiClient, ntt_id: string): Promise<ChainInfo[]> {
    let results: ChainInfo[] = [];
    let keyObjectIds: string[] = [];
    let chain_results: ChainInfo[] = [];
    var chain_map = {};

    let nextCursor;
    do {
        const dynamicFields = await client.getDynamicFields({
            parentId: ntt_id,
            cursor: nextCursor,
        });

        let data = dynamicFields.data;
        if (data) {
            for (var i = 0; i < data.length; i++) {
                let fieldInfo = data[i];
                let keyType = fieldInfo.name.type;
                let keyValue: any = fieldInfo.name.value;

                let chainInfo: ChainInfo = {
                    chain: "",
                    chain_id: 0,
                    object_id: "",
                    token_info: "",
                    ntt_info: "",
                    peer_info: "",
                    token: null,
                    ntt: null,
                    peer: null,
                    opened: false,
                }
                if (keyType.indexOf("pumpntt::TokenKey") != -1) {
                    chainInfo.chain_id = keyValue.chain_id;
                    chainInfo.object_id = fieldInfo.objectId;
                    chainInfo.token_info = "TokenKey";
                } else if (keyType.indexOf("pumpntt::ManagerKey") != -1) {
                    chainInfo.chain_id = keyValue.chain_id;
                    chainInfo.object_id = fieldInfo.objectId;
                    chainInfo.ntt_info = "ManagerKey";
                } else if (keyType.indexOf("pumpntt::ChainKey") != -1) {
                    chainInfo.chain_id = keyValue.chain_id;
                    chainInfo.object_id = fieldInfo.objectId;
                    chainInfo.peer_info = "ChainKey";
                }

                if (chainInfo.chain_id) {
                    chainInfo.chain = toChain(chainInfo.chain_id)
                }
                results.push(chainInfo);
                keyObjectIds.push(chainInfo.object_id);
            }
        }
        nextCursor = dynamicFields.hasNextPage ? dynamicFields.nextCursor : null;
    } while (nextCursor);

    const keyObjects = await client.multiGetObjects({
        ids: keyObjectIds,
        options: {
            showContent: true,
            showDisplay: true,
            showType: true,
            showOwner: true
        }
    });

    for (var i = 0; i < keyObjects.length; i++) {
        let item = keyObjects[i].data;
        if (item) {
            if (item.content && 'fields' in item.content) {
                const fields = item.content.fields as any;
                for (var j = 0; j < results.length; j++) {
                    let chainInfo = results[j];
                    if (chainInfo.object_id == item.objectId) {
                        let info = fields.value.fields.info;
                        var info_string = new TextDecoder().decode(new Uint8Array(info));
                        var info_obj = JSON.parse(info_string);

                        var is_info_empty = true;
                        if (info_obj) {
                            for (var k in info_obj) {
                                is_info_empty = false;
                                break;
                            }
                        }

                        if (is_info_empty) {
                            info_obj = null;
                        } else {
                            if (info_obj.nttStateObjectId) {
                                info_obj.ntt_address = info_obj.nttStateObjectId;
                            }
                        }
                        if (chainInfo.token_info) {
                            chainInfo.token_info = info_string;
                            chainInfo.token = info_obj;
                        } else if (chainInfo.ntt_info) {
                            chainInfo.ntt_info = info_string;
                            chainInfo.ntt = info_obj;
                        } else if (chainInfo.peer_info) {
                            chainInfo.peer_info = info_string;
                            chainInfo.peer = info_obj;
                        }
                    }
                }
            }
        }
    }

    for (var i = 0; i < results.length; i++) {
        var item = results[i];
        var chain_id = item.chain_id;
        if (!chain_map[chain_id]) {
            chain_map[chain_id] = item;
        } else {
            if (item.ntt_info && item.ntt) {
                chain_map[chain_id].ntt_info = item.ntt_info;
                chain_map[chain_id].ntt = item.ntt;
            }
            if (item.token_info && item.token) {
                chain_map[chain_id].token_info = item.token_info;
                chain_map[chain_id].token = item.token;
            }
            if (item.peer_info && item.peer) {
                chain_map[chain_id].peer_info = item.peer_info;
                chain_map[chain_id].peer = item.peer;
            }
        }
    }

    for (let chain_id in chain_map) {
        chain_results.push(chain_map[chain_id]);
    }

    return chain_results;
}