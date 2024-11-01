import { Card, Flex, Box, Text, Select, Button, Grid, Dialog } from "@radix-ui/themes";
import { toChainId } from "@wormhole-foundation/sdk";
import { getProtocol } from "../protocol/protocol";
import { useAddNttChain } from "../mutations/ntt";
import { Chain } from "@wormhole-foundation/sdk";
import { signAndWait } from "../utils/wallet";
import { SelectToken } from "./SelectToken";
import TokenIcon from "../icons/TokenIcons";
import { displayAddress } from "../utils";
import { useSelector } from 'react-redux';
import { getIcon } from "../constants";
import { RootState } from "../store";
import { useState } from 'react';

export function ConnectChain({
    ntt_info,
}: {
    ntt_info: any,
}) {
    const [chainA, setChainA] = useState("");
    const [chainB, setChainB] = useState("");
    const [selectChainA, setNeedSelectChainA] = useState(false);
    const [selectChainB, setNeedSelectChainB] = useState(false);
    const [sourceChainInfo, setSourceChainInfo] = useState({});
    const [targetChainInfo, setTargetChainInfo] = useState({});

    const [deployTarget, setDeployTarget] = useState("Source");

    const walletStore = useSelector((state: RootState) => state.wallet);

    const { mutate: addAddNttChainAction } = useAddNttChain();

    const chainHeaders = [{
        text: "Source",
        chain: chainA,
        setChain: setChainA
    }, {
        text: "Target",
        chain: chainB,
        setChain: setChainB
    }]


    const walletHeader = (
        <Box pb="5">
            {chainHeaders.map((chain_header) => (<>
                <Grid columns={{ initial: '1', md: '2' }} gap="3" width="auto" px="4" pt="2">
                    <Box>
                        <Text size="3">{chain_header.text}</Text>
                    </Box>
                    <Box>
                        <Text size="3">Wallet</Text>
                    </Box>
                </Grid >

                <Grid columns={{ initial: '1', md: '2' }} gap="3" width="auto" px="4" pt="3">
                    <Box>
                        <Select.Root size="3" value={chain_header.chain} onValueChange={(v) => { onSelectChain(v, chain_header) }}>
                            <Select.Trigger placeholder="Select Chain" variant="soft" style={{ width: "100%", height: 50 }} />
                            <Select.Content position="popper" sideOffset={5} className="SelectContent">
                                <Select.Group>
                                    <Select.Item value="Sui">Sui</Select.Item>
                                    <Select.Item value="Aptos">Aptos</Select.Item>
                                </Select.Group>
                            </Select.Content>
                        </Select.Root>
                    </Box>

                    <Box>
                        {walletStore[chain_header.chain] && walletStore[chain_header.chain].address ?
                            <Box>
                                <Button style={{ width: "100%", height: 50 }}>
                                    Disconnect {displayAddress(chain_header.chain as Chain, walletStore[chain_header.chain].address)}
                                </Button>
                            </Box>
                            :
                            <Box>
                                <Button onClick={() => onConnectWallet(chain_header.text)} style={{ width: "100%", height: 50 }}>
                                    Connect Wallet
                                </Button>
                            </Box>
                        }
                    </Box>
                </Grid></>
            ))}
        </Box>
    )

    function onSelectChain(v, chain_header) {
        let chain_info = null;
        for (var i = 0; i < ntt_info.chain_infos.length; i++) {
            let info = ntt_info.chain_infos[i];
            if (info.chain == v) {
                chain_info = info;
                break;
            }
        }

        if (chain_info) {
            if (chain_header.text == "Source") {
                setSourceChainInfo(chain_info);
            } else {
                setTargetChainInfo(chain_info);
            }
        }

        chain_header.setChain(v);
    }

    function getChainInfo(text): any {
        if (text == "Source") return sourceChainInfo;
        else return targetChainInfo;
    }

    const step1 = (
        <Box style={{ height: "700px" }}>
            {walletHeader}

            {chainHeaders.map((chain_header) => (<Box py="3" px="4">
                <Card key={chain_header.text}>
                    <Box py="1">
                        <Flex position="sticky" justify="between">
                            <Box>
                                <Text>Chain</Text>
                            </Box>
                            <Box>
                                <Flex>
                                    <Box mr="2">
                                        <TokenIcon icon={getIcon(getChainInfo(chain_header.text).chain)} height={32} />
                                    </Box>
                                    <Text align="center">{getChainInfo(chain_header.text).chain}</Text>
                                </Flex>
                            </Box>
                        </Flex>
                    </Box>
                    {getChainInfo(chain_header.text).ntt && <Box py="1">
                        <Flex position="sticky" justify="between">
                            <Box>
                                <Text>NttManager</Text>
                            </Box>
                            <Box>
                                <Text size="2">{getChainInfo(chain_header.text).ntt.ntt_address}</Text>
                            </Box>
                        </Flex>
                    </Box>}

                    {getChainInfo(chain_header.text).ntt && <Box py="1">
                        <Flex position="sticky" justify="between">
                            <Box>
                                <Text>NttTranceiver</Text>
                            </Box>
                            <Box>
                                <Text size="2">{getChainInfo(chain_header.text).ntt.emitter_address}</Text>
                            </Box>
                        </Flex>
                    </Box>}
                </Card>
            </Box>))}

            <Box px="4" pt="5">
                <Button radius="large" style={{ width: "100%", height: 80 }} onClick={() => doSetPeer()}>
                    <Text size="5">
                        {deployTarget != "Done" ?
                            <>Set Peer {deployTarget} Chain</> :
                            <>Upload Info</>
                        }
                    </Text>
                </Button>
            </Box>
        </Box>
    )

    async function doSetPeer() {
        if (deployTarget == "Source") {
            doSetPeerChain(sourceChainInfo, targetChainInfo);
        } else if (deployTarget == "Target") {
            doSetPeerChain(targetChainInfo, sourceChainInfo);
        } else if (deployTarget == "Done") {
            let ntt_id = ntt_info.id;
            let source: any = sourceChainInfo;
            let target: any = targetChainInfo;
            let chain_id_1 = toChainId(source.chain);
            let info_1 = source.peer || [];
            let chain_id_2 = toChainId(target.chain);
            let info_2 = target.peer || [];

            if (info_1.indexOf(chain_id_2) == -1) {
                info_1.push(chain_id_2);
            }

            if (info_2.indexOf(chain_id_1) == -1) {
                info_2.push(chain_id_1);
            }
            let callArgs = {
                ntt_id,
                chain_id_1,
                info_1: JSON.stringify(info_1),
                chain_id_2,
                info_2: JSON.stringify(info_2),
            };

            console.log("addAddNttChainAction")
            console.log(callArgs);
            addAddNttChainAction(callArgs);
        }
    }

    async function doSetPeerChain(chain_info, peer_chain_info) {
        let chain = chain_info.chain;
        let chain_s = chain as Chain;
        let protocol = getProtocol(chain_s);
        if (protocol) {
            let params: any = {};
            if (chain == "Sui") {
                params.nttAdminCapObjectId = chain_info.ntt.nttAdminCapObjectId;
                params.nttStateObjectId = chain_info.ntt.nttStateObjectId;
            } else if (chain == "Aptos") {
                params.ntt_address = chain_info.ntt.ntt_address;
            }

            params.peer_chain_id = toChainId(peer_chain_info.chain);
            params.peer_manager_contract = peer_chain_info.ntt.ntt_address;
            params.peer_tranceiver_contract = peer_chain_info.ntt.emitter_address;
            params.decimal = peer_chain_info.token.decimal;

            let request = await protocol.setPeer(params);
            await signAndWait(chain_s, request);
            if (deployTarget == "Source") {
                setDeployTarget("Target");
            } else {
                setDeployTarget("Done");
            }
        }
    }

    function render() {
        return step1
    }

    return (
        <>
            {render()}

            <Dialog.Root open={selectChainA} onOpenChange={setNeedSelectChainA}>
                <Dialog.Trigger>
                    <Box></Box>
                </Dialog.Trigger>

                <Dialog.Content maxWidth="450px" height="800px">
                    <Dialog.Title>Connect a Wallet</Dialog.Title>
                    <Dialog.Description></Dialog.Description>
                    <SelectToken onSelect={onSelectChainA} selectChain={chainA}></SelectToken>
                </Dialog.Content>
            </Dialog.Root>

            <Dialog.Root open={selectChainB} onOpenChange={setNeedSelectChainB}>
                <Dialog.Trigger>
                    <Box></Box>
                </Dialog.Trigger>

                <Dialog.Content maxWidth="450px" height="800px">
                    <Dialog.Title>Connect a Wallet</Dialog.Title>
                    <Dialog.Description></Dialog.Description>
                    <SelectToken onSelect={onSelectChainB} selectChain={chainB}></SelectToken>
                </Dialog.Content>
            </Dialog.Root>
        </>
    );

    function onSelectChainA() {
        setNeedSelectChainA(false);
    }

    function onSelectChainB() {
        setNeedSelectChainB(false);
    }

    function onConnectWallet(text) {
        if (text == "Source") {
            setNeedSelectChainA(true);
        } else if (text == "Target") {
            setNeedSelectChainB(true);
        }
    }
}