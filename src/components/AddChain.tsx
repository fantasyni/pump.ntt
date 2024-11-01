import { Card, Flex, Box, Text, Button, Grid, TextField } from "@radix-ui/themes";
import {useUploadInfoContract } from "../mutations/ntt";
import { toChainId } from "@wormhole-foundation/sdk";
import { getProtocol } from "../protocol/protocol";
import { Chain } from "@wormhole-foundation/sdk";
import { useSuiClient } from "@mysten/dapp-kit";
import { Steps, toModeId } from "../constants";
import { signAndWait } from "../utils/wallet";
import { WalletHeader } from "./WalletHeader";
import { getModeInfo } from "../constants";
import { JsonOutput } from "./JsonOutput";
import { useSelector } from 'react-redux';
import { RootState } from "../store";
import { Loading } from "./Loading";
import toast from "react-hot-toast";
import { useState } from 'react';

export function AddChain({
    onOpenChange,
    isMintToken,
}: {
    readonly onOpenChange: Function,
    readonly isMintToken: boolean
}) {
    const nttStore = useSelector((state: RootState) => state.ntt);
    let ntt_info = nttStore.ntt_info;
    let nameValue: string = ntt_info.name.toLocaleLowerCase();
    let symbolValue: string = ntt_info.symbol;

    const suiClient = useSuiClient();

    const [nttData, setNttData] = useState(nttStore.chain_info?.ntt);
    const [tokenData, setTokenData] = useState(nttStore.chain_info?.token);

    const [stepperIndex, setStepperIndex] = useState(0);
    const [name] = useState(nameValue);
    const [chain, setChain] = useState(nttStore.chain_info?.chain);
    const [symbol] = useState(symbolValue);
    const [decimal, setDecimal] = useState(8);
    const [description, setDescription] = useState("");
    const [iconUrl, setIconUrl] = useState("");
    const [mintAmount, setMintAmount] = useState(0);

    let initDeployState = {}
    initDeployState[0] = "init";
    const [deployState, setDeployState] = useState(initDeployState);
    const [txid, setTxid] = useState("");
    const [uploadInfo, setUploadInfo] = useState({});
    const [tokenUploadInfo, setTokenUploadInfo] = useState({});
    const { mutate: uploadInfoContractAction, isSuccess: isUploadInfoSuccess } = useUploadInfoContract();

    if (isUploadInfoSuccess) {
        setTimeout(function () {
            setNttData(uploadInfo);
            setTokenData(tokenUploadInfo);
        }, 1000)
    }

    let deployChains: any[] = [];
    if (ntt_info && ntt_info.chain_infos) {
        let chains: any[] = ntt_info.chain_infos
        for (var i = 0; i < chains.length; i++) {
            deployChains.push(chains[i].chain);
        }
    }
    const walletStore = useSelector((state: RootState) => state.wallet);

    function setDeploy(v) {
        let target = {
            ...deployState
        }
        target[stepperIndex] = v;
        setDeployState(target);
    }

    const pendingTraction = (<>
        <Box>
            <Loading />
            <Flex justify="center">
                <Text>Approving the transaction...</Text>
            </Flex>

            <Box py="5">
                <Card>
                    <Text>Please do not leave this page until the transaction is successful</Text>
                </Card>
            </Box>
        </Box>
    </>);

    const walletHeader = (
        <>
            <WalletHeader chainValue={chain} onSetChain={setChain} deployChains={deployChains}></WalletHeader>
        </>
    )

    const step_ntt = (
        <Box style={{ height: "700px" }}>
            {walletHeader}

            <Box px="4" pt="3">
                <Text size="3">Mode</Text>
            </Box>

            <Box px="4" pt="2">
                <TextField.Root size="3" style={{ height: 50 }} type="text" value={ntt_info.mode} />
            </Box>

            <Box px="4" py="2">
                <Text size="3">{getModeInfo(ntt_info.mode)}</Text>
            </Box>

            <Box px="4" pt="5">
                <Button radius="large" style={{ width: "100%", height: 80 }} onClick={() => deployNtt()}>
                    <Text size="5">
                        Deploy
                    </Text>
                </Button>
            </Box>
        </Box>
    )

    const step_ntt_done = (
        <Box style={{ height: "700px" }}>
            {walletHeader}
            <Card mt="5">
                <Box>
                    <Box pb="2">
                        <Flex justify="center" mt="10">
                            <Text size="3">Deploy Ntt Success</Text>
                        </Flex>
                    </Box>
                    <Card>
                        <JsonOutput datas={nttData}></JsonOutput>
                    </Card>
                </Box>
            </Card>
        </Box>
    )

    async function deployNtt() {
        if (!walletStore[chain].address) {
            toast.error("wallet is not connected");
            return;
        }

        let chain_s = chain as Chain;
        let protocol = getProtocol(chain_s);
        if (protocol && ntt_info) {
            // setDeploy("pending");
            let mode = toModeId(ntt_info.mode)
            let request = await protocol.createNtt(mode);
            let txids = await signAndWait(chain_s, request);
            if (txids && txids.length) {
                // setDeploy("success");
                setTxid(txids[0]);
                let addNttTokenArgs = await protocol.getNttInfo(suiClient, txids[0]);
                addNttTokenArgs["deploy_address"] = walletStore[chain].address;
                setUploadInfo(addNttTokenArgs)
                setNttData(addNttTokenArgs);
                console.log("deployNtt")
                console.log(addNttTokenArgs)
            }
        }
    }

    const step_token = (
        <Box style={{ height: "700px" }}>
            {walletHeader}

            <Grid columns={{ initial: '1', md: '3' }} gap="3" width="auto" px="4" pt="2">
                <Box>
                    <Text size="3">Name</Text>
                </Box>
                <Box>
                    <Text size="3">Symbol</Text>
                </Box>
                <Box>
                    <Text size="3">Decimals</Text>
                </Box>
            </Grid>

            <Grid columns={{ initial: '1', md: '3' }} gap="3" width="auto" px="4" pt="2">
                <Box>
                    <TextField.Root size="3" style={{ height: 50 }} type="text" value={name} />
                </Box>
                <Box>
                    <TextField.Root size="3" style={{ height: 50 }} type="text" value={symbol} />
                </Box>
                <Box>
                    <TextField.Root size="3" style={{ height: 50 }} type="number" value={decimal} onChange={(e) => setDecimal(e.target.valueAsNumber)} />
                </Box>
            </Grid>

            <Box px="4" pt="3">
                <Text size="3">Description</Text>
            </Box>

            <Box px="4" pt="2">
                <TextField.Root size="3" style={{ height: 50 }} type="url" value={description} onChange={(e) => setDescription(e.target.value)} />
            </Box>

            <Box px="4" pt="3">
                <Text size="3">IconUrl</Text>
            </Box>

            <Box px="4" pt="2">
                <TextField.Root size="3" style={{ height: 50 }} type="url" value={iconUrl} onChange={(e) => setIconUrl(e.target.value)} />
            </Box>

            <Box px="4" pt="5">
                <Button radius="large" style={{ width: "100%", height: 80 }} onClick={() => deployToken()}>
                    <Text size="5">
                        Deploy
                    </Text>
                </Button>
            </Box>
        </Box>
    );

    const step_token_done = (
        <Box style={{ height: "700px" }}>
            {walletHeader}
            <Card mt="5">
                <Box>
                    <Box pb="2">
                        <Flex justify="center" mt="10">
                            <Text size="3">Deploy Token Success</Text>
                        </Flex>
                    </Box>
                    <Card>
                        <JsonOutput datas={tokenData}></JsonOutput>
                    </Card>
                </Box>
            </Card>

        </Box>
    )

    async function deployToken() {
        if (!walletStore[chain].address) {
            toast.error("wallet is not connected");
            return;
        }

        let chain_s = chain as Chain;
        let protocol = getProtocol(chain_s);
        if (protocol) {
            // setDeploy("pending");
            let params: any = {};
            params.name = name.toLocaleLowerCase();
            params.symbol = symbol;
            params.decimal = decimal;
            params.description = description;
            params.iconUrl = iconUrl;
            if (chain == "Sui") {
                params.walletAddress = walletStore[chain].address;
            } else if (chain == "Aptos") {
                params.ntt_address = nttData.ntt_address;
            }

            let request = await protocol.createToken(params);
            let txids = await signAndWait(chain_s, request);
            if (txids && txids.length) {
                // setDeploy("success");
                setTxid(txids[0]);
                let addNttTokenArgs = await protocol.getTokenInfo(suiClient, txids[0]);
                addNttTokenArgs.name = params.name;
                addNttTokenArgs.symbol = params.symbol;
                addNttTokenArgs.decimal = params.decimal;
                setTokenUploadInfo(addNttTokenArgs)
                setTokenData(addNttTokenArgs)
            }
        }
    }

    const step_mint_token = (
        <Box style={{ height: "700px" }}>
            {walletHeader}

            <Box px="4" pt="3">
                <Text size="3">Decimal</Text>
            </Box>

            <Box px="4" pt="2">
                <TextField.Root size="3" style={{ height: 50 }} type="number" value={tokenData?.decimal} />
            </Box>

            <Box px="4" pt="3">
                <Text size="3">Amount</Text>
            </Box>

            <Box px="4" pt="2">
                <TextField.Root size="3" style={{ height: 50 }} type="number" value={mintAmount} onChange={(e) => setMintAmount(e.target.valueAsNumber)} />
            </Box>

            <Box px="4" pt="5">
                <Button radius="large" style={{ width: "100%", height: 80 }} onClick={() => mintInitToken()}>
                    <Text size="5">
                        Mint
                    </Text>
                </Button>
            </Box>
        </Box>
    );

    async function mintInitToken() {
        if (!walletStore[chain].address) {
            toast.error("wallet is not connected");
            return;
        }

        let chain_s = chain as Chain;
        let protocol = getProtocol(chain_s);
        if (protocol) {
            // setDeploy("pending");
            let params = {
                amount: mintAmount * Math.pow(10, decimal)
            }

            if (chain == "Sui") {
                params["nttAdminCapObjectId"] = nttData.nttAdminCapObjectId;
                params["nttStateObjectId"] = nttData.nttStateObjectId;
                params["coinType"] = tokenData.coinType;
            } else if (chain == "Aptos") {
                params["ntt_address"] = nttData.ntt_address;
                params["token_address"] = tokenData.token_address
            }

            console.log(params)
            let request = await protocol.mintInitToken(params);
            let txids = await signAndWait(chain_s, request);
            if (txids && txids.length) {
                setDeploy("success");
                setTxid(txids[0]);
            }
        }
    }

    const step_mint_token_done = (
        <Box style={{ height: "700px" }}>
            {walletHeader}
            <Card mt="5">
                <Box>
                    <Box pb="2">
                        <Flex justify="center" mt="10">
                            <Text size="3">Mint Init Token Success</Text>
                        </Flex>
                    </Box>
                    <Card>
                        <Text>{txid}</Text>
                    </Card>
                </Box>
            </Card>

        </Box>
    )

    function onUploadInfo() {
        let chain_id = toChainId(chain);

        tokenUploadInfo["registered"] = true;
        let callArgs = {
            ntt_id: ntt_info.id,
            chain_id: chain_id,
            ntt_info: JSON.stringify(uploadInfo),
            token_info: JSON.stringify(tokenUploadInfo)
        };

        console.log("callArgs")
        console.log(callArgs)
        uploadInfoContractAction(callArgs);
    }

    const step_register = (
        <Box style={{ height: "700px" }}>
            {walletHeader}

            <Box px="4" pt="5">
                <Button radius="large" style={{ width: "100%", height: 80 }} onClick={() => registerTokenToNtt()}>
                    <Text size="5">
                        Register
                    </Text>
                </Button>
            </Box>
        </Box>
    )

    const step_register_done = (
        <Box style={{ height: "700px" }}>
            {walletHeader}
            <Card mt="5">
                <Box>
                    <Box pb="2">
                        <Flex justify="center" mt="10">
                            <Text size="3">Register Token Success</Text>
                        </Flex>
                    </Box>
                    <Card>
                        <JsonOutput datas={tokenData}></JsonOutput>
                    </Card>
                </Box>
            </Card>
        </Box>
    )

    async function registerTokenToNtt() {
        if (!walletStore[chain].address) {
            toast.error("wallet is not connected");
            return;
        }

        let chain_s = chain as Chain;
        let protocol = getProtocol(chain_s);
        if (protocol) {
            // setDeploy("pending");
            if (chain == "Sui") {
                let params = {
                    nttAdminCapObjectId: nttData.nttAdminCapObjectId,
                    nttStateObjectId: nttData.nttStateObjectId,
                    treasuryCapId: tokenData.treasuryCapId,
                    coinMetadataId: tokenData.coinMetadataId,
                    coinType: tokenData.coinType
                }
    
                let request = await protocol.registerToken(params);
                let txids = await signAndWait(chain_s, request);
                if (txids && txids.length) {
                    setDeploy("success");
                    setTxid(txids[0]);
                    setTokenUploadInfo(tokenData);
                }
            } else if (chain == "Aptos") {
                setDeploy("success");
                setTokenUploadInfo(tokenData);
            }
        }
    }

    const stepActions = [step_ntt, step_token, step_register]
    const stepDoneActions = [step_ntt_done, step_token_done, step_register_done]

    const deployTokenSuccess = (<>
        <Box>
            <Text>Deploy Success</Text>
            <Card mt="2">
                <Box>
                    <Box pb="2">
                        <Text weight="bold">TxId: </Text>
                    </Box>
                    <Card>
                        <Text>{txid}</Text>
                    </Card>
                </Box>
            </Card>

            {stepperIndex == stepActions.length - 1 && <Box px="4" pt="3">
                <Button radius="large" style={{ width: "100%", height: 80 }} onClick={() => { onUploadInfo() }}>
                    <Text size="5">
                        Upload
                    </Text>
                </Button>
            </Box>}

        </Box>
    </>)

    function render() {
        let currentState = deployState[stepperIndex];

        if (isMintToken) {
            if (currentState == "init") {
                return step_mint_token;
            } else if (currentState == "pending") {
                return pendingTraction;
            } else if (currentState == "success") {
                return step_mint_token_done;
            }
            return;
        }

        if (stepperIndex == 0) {
            if (nttData) {
                return stepDoneActions[stepperIndex];
            }

            if (currentState == "init") {
                return stepActions[stepperIndex];
            } else if (currentState == "pending") {
                return pendingTraction;
            } else if (currentState == "success") {
                return deployTokenSuccess;
            }
        }

        if (stepperIndex == 1) {
            if (tokenData) {
                return stepDoneActions[stepperIndex];
            }

            if (currentState == "init") {
                return stepActions[stepperIndex];
            } else if (currentState == "pending") {
                return pendingTraction;
            } else if (currentState == "success") {
                return deployTokenSuccess;
            }
        }

        if (stepperIndex == 2) {
            if (tokenData?.registered) {
                return stepDoneActions[stepperIndex];
            }

            if (currentState == "init") {
                return stepActions[stepperIndex];
            } else if (currentState == "pending") {
                return pendingTraction;
            } else if (currentState == "success") {
                return deployTokenSuccess;
            }
        }

        return stepActions[stepperIndex];
    }

    const main = (
        <>
            <Flex justify="center">
                <Box px="4">
                    <Text size="5">{stepperIndex + 1}. {Steps[stepperIndex].label}</Text>
                </Box>
            </Flex>

            {render()}

            <Flex gap="3" mt="4" justify="end">
                <Button onClick={() => onClickNext()}>
                    {stepperIndex < Steps.length - 1 ? "Next" : "Done"}
                </Button>
            </Flex>
        </>
    );

    function onClickNext() {
        if (stepperIndex < Steps.length - 1) {
            setStepperIndex(stepperIndex + 1);
        } else {
            onClose()
        }
    }

    function onClose() {
        onOpenChange(false)
    }

    if (isMintToken) {
        return (<>{render()}</>)
    } else {
        return main;
    }
}