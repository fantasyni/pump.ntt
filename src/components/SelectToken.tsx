import { Flex, Text, Button, TextField } from "@radix-ui/themes";
import { connectChainWallet, WalletData } from "../utils/wallet";
import { MagnifyingGlassIcon } from "@radix-ui/react-icons";
import { useGetWallets } from "../hooks/useGetWallets";
import { Chain } from "@wormhole-foundation/sdk";
import WalletIcon from '../icons/WalletIcons';
import { useDispatch } from 'react-redux';
import { useState } from 'react';

export function SelectToken({
    selectChain,
    onSelect,
}) {
    const dispatch = useDispatch();
    const [searchParams, setSearchParams] = useState("");

    let walletsData: WalletData[] = [];

    if (selectChain) {
        const { data: walletsList, isSuccess: isGetWalletsSuccess } = useGetWallets(selectChain as Chain);

        if (isGetWalletsSuccess) {
            if (searchParams) {
                for (var i = 0; i < walletsList.length; i++) {
                    if (walletsList[i].name.indexOf(searchParams) != -1) {
                        walletsData.push(walletsList[i]);
                    }
                }
            } else {
                walletsData = walletsList;
            }
        }
    }

    return (
        <>
            <Flex direction="column" gap="3">
                <TextField.Root placeholder="Search name" onChange={(e) => setSearchParams(e.target.value)}>
                    <TextField.Slot>
                        <MagnifyingGlassIcon height="16" width="16" />
                    </TextField.Slot>
                </TextField.Root>

                {
                    walletsData.map((jsonData) => (
                        <Button key={jsonData.name} style={{ height: "50px" }} variant="soft" onClick={() => { onSelectWallet(jsonData); }}>
                            <Flex position="sticky" justify="start" align="center" style={{ width: "100%" }}>
                                <WalletIcon
                                    name={jsonData.name}
                                    icon={jsonData.icon}
                                    height={32}
                                />
                                <Text ml="3">{!jsonData.isReady && 'Install '}{jsonData.name}</Text>
                            </Flex>
                        </Button>
                    ))
                }
            </Flex>
        </>
    )

    function onSelectWallet(walletData) {
        if (walletData.isReady) {
            connectChainWallet(selectChain as Chain, walletData.name, dispatch);
        } else {
            window.open(walletData.wallet.getUrl())
        }
        onSelect();
    }
}