import { Box, Button, Dialog, Grid, Select, Text } from "@radix-ui/themes";
import { disconnectChainWallet } from "../utils/wallet";
import { useDispatch, useSelector } from "react-redux";
import { Chain } from "@wormhole-foundation/sdk";
import { SelectToken } from "./SelectToken";
import { displayAddress } from "../utils";
import { Contract } from "../constants";
import { RootState } from "../store";
import { useState } from "react";

export function WalletHeader(
    {
        chainValue,
        onSetChain,
        deployChains,
    }: {
        chainValue: any,
        onSetChain: any,
        deployChains: any[]
    }
) {
    const walletStore = useSelector((state: RootState) => state.wallet);
    const [selectToken, setNeedSelectToken] = useState(false);
    const [chain, setChain] = useState(chainValue);
    const dispatch = useDispatch();

    let chains: string[] = [];
    for (var i = 0; i < Contract.Chains.length; i++) {
        let chain = Contract.Chains[i];
        if (deployChains.indexOf(chain) == -1) {
            chains.push(chain);
        }
    }

    if (chainValue && chains.indexOf(chainValue) == -1) {
        chains.push(chainValue);
    }

    return (
        <>
            <Grid columns={{ initial: '1', md: '2' }} gap="3" width="auto" px="4" pt="2">
                <Box>
                    <Text size="3">Chain</Text>
                </Box>
                <Box>
                    <Text size="3">Wallet</Text>
                </Box>
            </Grid >

            <Grid columns={{ initial: '1', md: '2' }} gap="3" width="auto" px="4" pt="3">
                <Box>
                    <Select.Root size="3" value={chain} onValueChange={onSelectChain}>
                        <Select.Trigger placeholder="Select Chain" style={{ width: "100%", height: 50 }} />
                        <Select.Content position="popper" sideOffset={5} className="SelectContent">
                            <Select.Group>
                                {
                                    chains.map((data) => (
                                        <Select.Item key={data} value={data}>{data}</Select.Item>
                                    ))
                                }
                                {/* <Select.Item value="Sui">Sui</Select.Item>
                                <Select.Item value="Aptos">Aptos</Select.Item> */}
                            </Select.Group>
                        </Select.Content>
                    </Select.Root>
                </Box>

                <Box>
                    {walletStore[chain] && walletStore[chain].address ?
                        <Box>
                            <Button onClick={() => onDisconnectWallet(chain, walletStore[chain].name)} style={{ width: "100%", height: 50 }}>
                                Disconnect {displayAddress(chain as Chain, walletStore[chain].address)}
                            </Button>
                        </Box>
                        :
                        <Box>
                            <Button onClick={() => onConnectWallet()} style={{ width: "100%", height: 50 }}>
                                Connect Wallet
                            </Button>
                        </Box>
                    }
                </Box>
            </Grid>

            <Dialog.Root open={selectToken} onOpenChange={setNeedSelectToken}>
                <Dialog.Trigger>
                    <Box></Box>
                </Dialog.Trigger>

                <Dialog.Content maxWidth="450px" height="800px">
                    <Dialog.Title>Connect a Wallet</Dialog.Title>
                    <Dialog.Description></Dialog.Description>
                    <SelectToken onSelect={onSelect} selectChain={chain}></SelectToken>
                </Dialog.Content>
            </Dialog.Root>
        </>
    )

    function onSelectChain(v) {
        setChain(v);
        onSetChain(v);
    }

    function onSelect() {
        setNeedSelectToken(false);
        onSetChain(chain);
    }

    function onConnectWallet() {
        setNeedSelectToken(true);
    }

    function onDisconnectWallet(chain, walletName) {
        disconnectChainWallet(chain as Chain, walletName, dispatch);
    }
}