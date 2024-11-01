import { ChevronRightIcon, ChevronDownIcon, GearIcon, Link2Icon, PlusIcon, DotsHorizontalIcon, CardStackPlusIcon } from "@radix-ui/react-icons";
import { Container, Card, Flex, Box, Text, Button, AlertDialog, Dialog } from "@radix-ui/themes";
import { setNttInfo, setChainInfo as setChainInfoStore} from "../store/ntt";
import { useGetNttObjects } from "../hooks/useGetNttObjects";
import * as Collapsible from "@radix-ui/react-collapsible";
import * as Tooltip from "@radix-ui/react-tooltip";
import { useDeleteNtt } from "../mutations/ntt";
import { useNavigate } from "react-router-dom";
import { CreateNewNtt } from "./CreateNewNtt";
import { ConnectChain } from "./ConnectChain";
import TokenIcon from "../icons/TokenIcons";
import { useDispatch } from "react-redux";
import { getIcon } from "../constants";
import { AddChain } from "./AddChain";
import { NttInfo } from "../typing";
import { useState } from 'react';

export function Tokens() {
    const dispatch = useDispatch();
    const navigate = useNavigate()

    const [needDelete, setNeedDelete] = useState(false);

    const [deleteNttData, setDeleteNttData] = useState({
        id: "",
    })
    const [nttData, setNttData] = useState({
        id: "",
        name: "",
        symbol: "",
        mode: ""
    })
    const [chainInfo, setChainInfo] = useState({
        chain: ""
    });
    const [clickRightChains, setClickRightChains] = useState({});

    const [addChainTitle, setAddChainTitle] = useState("");
    const [openAddChain, setOpenAddChain] = useState(false);
    const [openConnectChain, setOpenConnectChain] = useState(false);
    const [openCreateNtt, setOpenCreateNtt] = useState(false);
    const [openMenus, setOpenMenus] = useState(false);
    const [isMintToken, setIsMintToken] = useState(false);

    const { data: nttObjects, isSuccess: isGetNttObjectsSuccess } = useGetNttObjects();
    const { mutate: deleteNttAction } = useDeleteNtt();

    let resultData: NttInfo[] = [];

    if (isGetNttObjectsSuccess) {
        resultData = nttObjects;
        console.log("isGetNttObjectsSuccess")
        console.log(resultData)
    }

    return (
        <>
            <Container size="3" mt="5" pt="5" px="4">
                <Flex position="sticky" px="4" py="2" mb="2" justify="between">
                    <Box>
                        <Text weight="bold" size="6">Your NTTs <Text size="3">({resultData.length})</Text></Text>
                    </Box>
                    <Box>
                        <PlusIcon width="30" height="30" onClick={() => setOpenCreateNtt(true)}></PlusIcon>
                    </Box>
                </Flex>

                {resultData.map((jsonData) => (
                    <Card mt="3" key={jsonData.name}>
                        <Flex position="sticky" px="2" pt="2" mb="3" justify="between">
                            <Box>
                                <Flex gap="3" align="baseline">
                                    <Text weight="bold" size="6">{jsonData.name}</Text>
                                </Flex>
                            </Box>
                            <Box>
                                <Flex gap="2" align="baseline">
                                    <Tooltip.Provider>
                                        <Tooltip.Root>
                                            <Tooltip.Trigger asChild>
                                                <Box>
                                                    <Link2Icon width="30" height="30" onClick={() => onLinkTo(jsonData)}></Link2Icon>
                                                </Box>
                                            </Tooltip.Trigger>
                                            <Tooltip.Portal>
                                                <Tooltip.Content className="TooltipContent" sideOffset={5} side="bottom">
                                                    Jump To Bridge
                                                    <Tooltip.Arrow className="TooltipArrow" />
                                                </Tooltip.Content>
                                            </Tooltip.Portal>
                                        </Tooltip.Root>
                                    </Tooltip.Provider>
                                    <Tooltip.Provider>
                                        <Tooltip.Root>
                                            <Tooltip.Trigger asChild>
                                                <Box>
                                                    <DotsHorizontalIcon width="30" height="30" onClick={() => onClickOpenMenus(jsonData)}></DotsHorizontalIcon>
                                                </Box>
                                            </Tooltip.Trigger>
                                            <Tooltip.Portal>
                                                <Tooltip.Content className="TooltipContent" sideOffset={5} side="bottom">
                                                    Open Menus
                                                    <Tooltip.Arrow className="TooltipArrow" />
                                                </Tooltip.Content>
                                            </Tooltip.Portal>
                                        </Tooltip.Root>
                                    </Tooltip.Provider>
                                </Flex>
                            </Box>
                        </Flex>

                        <Flex position="sticky" px="2" mb="3" justify="between">
                            <Box>
                                <Flex gap="3" align="baseline">
                                    <Text weight="bold" size="3">Symbol: {jsonData.symbol}</Text>
                                    <Text weight="bold" size="3">Mode: {jsonData.mode}</Text>
                                </Flex>
                            </Box>
                        </Flex>

                        {jsonData.chain_infos.map((chain_info) => (
                            <Card key={chain_info.object_id} my="3">
                                <Collapsible.Root open={clickRightChains[chain_info.object_id]}>
                                    <Box py="1" onClick={() => onLickRightArrow(chain_info)}>
                                        <Flex position="sticky" justify="between" align="center">
                                            <Box>
                                                <Flex align="center">
                                                    <Box mr="2" >
                                                        <TokenIcon icon={getIcon(chain_info.chain)} height={32} />
                                                    </Box>
                                                    <Text align="center">{chain_info.chain}</Text>
                                                </Flex>
                                            </Box>
                                            <Box>
                                                <Collapsible.Trigger>
                                                    <Box>
                                                        {clickRightChains[chain_info.object_id] ? <ChevronDownIcon width="20" height="20" /> : <ChevronRightIcon width="20" height="20" />}
                                                    </Box>
                                                </Collapsible.Trigger>
                                            </Box>
                                        </Flex>
                                    </Box>
                                    <Collapsible.Content>
                                        <Flex position="sticky" justify="between" my="1">
                                            <Box>
                                                <Flex align="center">
                                                    <Box mr="2">
                                                        <Text>Peer</Text>
                                                    </Box>
                                                    {chain_info.peer?.map((peer_chain) => (
                                                        <Box mr="2" key={peer_chain}>
                                                            <TokenIcon icon={getIcon(peer_chain)} height={22} />
                                                        </Box>
                                                    ))}
                                                </Flex>
                                            </Box>
                                            <Box>
                                                <Flex>
                                                    <Box mr="3">
                                                        <CardStackPlusIcon width="20" height="20" onClick={() => onMintToken(jsonData, chain_info)}></CardStackPlusIcon>
                                                    </Box>
                                                    <Box>
                                                        <GearIcon width="20" height="20" onClick={() => onAddChain(jsonData, chain_info)}></GearIcon>
                                                    </Box>
                                                </Flex>
                                            </Box>
                                        </Flex>

                                        {chain_info.ntt && <Box py="1">
                                            <Flex position="sticky" justify="between">
                                                <Box>
                                                    <Text>Deployer</Text>
                                                </Box>
                                                <Box>
                                                    <Text>{chain_info.ntt.deploy_address}</Text>
                                                </Box>
                                            </Flex>
                                        </Box>}

                                        {chain_info.token && <Box py="1">
                                            <Flex position="sticky" justify="between">
                                                <Box>
                                                    <Text>Token</Text>
                                                </Box>
                                                <Box>
                                                    <Text>{chain_info.token.coinType || chain_info.token.token_address}</Text>
                                                </Box>
                                            </Flex>
                                        </Box>}

                                        {chain_info.ntt && <Box py="1">
                                            <Flex position="sticky" justify="between">
                                                <Box>
                                                    <Text>NttManager</Text>
                                                </Box>
                                                <Box>
                                                    <Text>{chain_info.ntt.ntt_address}</Text>
                                                </Box>
                                            </Flex>
                                        </Box>}

                                        {chain_info.ntt && <Box py="1">
                                            <Flex position="sticky" justify="between">
                                                <Box>
                                                    <Text>NttTranceiver</Text>
                                                </Box>
                                                <Box>
                                                    <Text>{chain_info.ntt.emitter_address}</Text>
                                                </Box>
                                            </Flex>
                                        </Box>}

                                        {chain_info.token && <Box py="1">
                                            <Flex position="sticky" justify="between">
                                                <Box>
                                                    <Text>Registered</Text>
                                                </Box>
                                                <Box>
                                                    <Text>{chain_info.token.registered ? "true" : "false"}</Text>
                                                </Box>
                                            </Flex>
                                        </Box>}
                                    </Collapsible.Content>
                                </Collapsible.Root>
                            </Card>
                        ))}
                    </Card>
                ))}

                <Dialog.Root open={openMenus} onOpenChange={setOpenMenus}>
                    <Dialog.Trigger>
                        <Box></Box>
                    </Dialog.Trigger>
                    <Dialog.Content maxWidth="450px" onInteractOutside={(e) => {
                        if (needDelete) {
                            e.preventDefault();
                        }
                    }}>
                        <Dialog.Title align="center">NTT Menus</Dialog.Title>
                        <Dialog.Description></Dialog.Description>
                        <Box my="3">
                            <Button style={{ width: "100%" }} onClick={() => onAddChain(nttData, {})}>Add Chain</Button>
                        </Box>
                        <Box my="3">
                            <Button style={{ width: "100%" }} onClick={() => onConnectChain(nttData)}>Set Peer Chain</Button>
                        </Box>
                        <Box my="3">
                            <Button style={{ width: "100%" }} color="red" onClick={() => onDelete(nttData)}>Delete</Button>
                        </Box>
                    </Dialog.Content>
                </Dialog.Root>

                <AlertDialog.Root open={needDelete} onOpenChange={setNeedDelete}>
                    <AlertDialog.Content maxWidth="450px">
                        <AlertDialog.Title>Delete Ntt</AlertDialog.Title>
                        <AlertDialog.Description size="2">
                            Are you sure? This Ntt will no longer be accessible after deleted
                        </AlertDialog.Description>

                        <Flex gap="3" mt="4" justify="end">
                            <AlertDialog.Cancel>
                                <Button variant="soft" color="gray">
                                    Cancel
                                </Button>
                            </AlertDialog.Cancel>
                            <AlertDialog.Action>
                                <Button variant="solid" color="red" onClick={() => onConfirmDelete()}>
                                    Confirm
                                </Button>
                            </AlertDialog.Action>
                        </Flex>
                    </AlertDialog.Content>
                </AlertDialog.Root>

                <Dialog.Root open={openCreateNtt} onOpenChange={setOpenCreateNtt}>
                    <Dialog.Trigger>
                        <Box></Box>
                    </Dialog.Trigger>
                    <Dialog.Content maxWidth="450px">
                        <Dialog.Title>Create New NTT</Dialog.Title>
                        <Dialog.Description></Dialog.Description>

                        <CreateNewNtt onOpenChange={setOpenCreateNtt}></CreateNewNtt>
                    </Dialog.Content>
                </Dialog.Root>

                <Dialog.Root open={openAddChain} onOpenChange={setOpenAddChain}>
                    <Dialog.Trigger>
                        <Box></Box>
                    </Dialog.Trigger>
                    <Dialog.Content onInteractOutside={(e) => {
                        // e.preventDefault(); 
                    }}>
                        <Dialog.Title align="center">{addChainTitle}</Dialog.Title>
                        <Dialog.Description></Dialog.Description>

                        <AddChain onOpenChange={setOpenAddChain} isMintToken={isMintToken}>
                        </AddChain>
                    </Dialog.Content>
                </Dialog.Root>

                <Dialog.Root open={openConnectChain} onOpenChange={setOpenConnectChain}>
                    <Dialog.Trigger>
                        <Box></Box>
                    </Dialog.Trigger>
                    <Dialog.Content maxWidth="750px" onInteractOutside={(e) => {
                        // e.preventDefault(); 
                    }}>
                        <Dialog.Title align="center">Set Peer Chain</Dialog.Title>
                        <Dialog.Description></Dialog.Description>

                        <ConnectChain ntt_info={nttData}></ConnectChain>
                    </Dialog.Content>
                </Dialog.Root>
            </Container>
        </>
    );

    function onClickOpenMenus(data) {
        console.log("onClickOpenMenus")
        setNttData(data);
        setOpenMenus(true);
    }

    function onLickRightArrow(chain_info) {
        let newChains = {
            ...clickRightChains
        }
        newChains[chain_info.object_id] = !newChains[chain_info.object_id]
        setClickRightChains(newChains);
    }

    function onLinkTo(data) {
        navigate('/bridge?ntt=' + data.id, { replace: false })
    }

    function onConnectChain(data) {
        setNttData(data);
        setOpenConnectChain(true);
    }

    function onMintToken(data, chain_info) {
        dispatch(setNttInfo(data));
        dispatch(setChainInfoStore(chain_info));
        setNttData(data);
        setChainInfo(chain_info);
        setIsMintToken(true);
        setOpenAddChain(true)
        setAddChainTitle("Mint Init Token")
    }

    function onAddChain(data, chain_info) {
        dispatch(setNttInfo(data));
        dispatch(setChainInfoStore(chain_info));
        setNttData(data);
        setChainInfo(chain_info);
        setIsMintToken(false);
        setOpenAddChain(true)
        setAddChainTitle("Add Chain")
    }

    function onConfirmDelete() {
        let callArgs = {
            id: deleteNttData.id,
        };

        deleteNttAction(callArgs);
    }

    function onDelete(data: any) {
        setNeedDelete(true);
        setDeleteNttData({
            id: data.id
        });
    }
}