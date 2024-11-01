import { Flex, Box, Text, Select, Button, Grid, TextField, Dialog } from "@radix-ui/themes";
import { useCreateNtt } from "../mutations/ntt";
import { ModeInfos } from "../constants";
import { useState } from 'react';

export function CreateNewNtt({
    onOpenChange,
}) {
    const [mode, setMode] = useState("0");
    const [name, setName] = useState("");
    const [symbol, setSymbol] = useState("");

    const { mutate: createNttAction, isSuccess: isCreateSuccess } = useCreateNtt();

    if (isCreateSuccess) {
        setTimeout(function () {
            onOpenChange(false);
        }, 1000)
    }
    return (
        <>
            <Box px="4">
                <Text size="3">Name</Text>
            </Box>

            <Box px="4" py="2">
                <TextField.Root size="3" style={{ height: 50 }} type="text" value={name} onChange={(e) => setName(e.target.value)} />
            </Box>

            <Box px="4">
                <Text size="3">Symbol</Text>
            </Box>

            <Box px="4" py="2">
                <TextField.Root size="3" style={{ height: 50 }} type="text" value={symbol} onChange={(e) => setSymbol(e.target.value)} />
            </Box>

            <Grid columns={{ initial: '1', md: '2' }} gap="3" width="auto" px="4" pt="2">
                <Box>
                    <Text size="3">Mode</Text>
                </Box>
            </Grid>

            <Grid columns={{ initial: '1', md: '1' }} gap="3" width="auto" px="4" pt="3">
                <Box>
                    <Select.Root size="3" value={mode} onValueChange={setMode}>
                        <Select.Trigger placeholder="Select Chain" variant="soft" style={{ width: "100%", height: 50 }} />
                        <Select.Content position="popper" sideOffset={5} className="SelectContent">
                            <Select.Group>
                                <Select.Item value="0">LOCKING</Select.Item>
                                <Select.Item value="1">BURNING</Select.Item>
                            </Select.Group>
                        </Select.Content>
                    </Select.Root>
                </Box>
            </Grid>

            <Box px="4" py="2">
                <Text size="3">{ModeInfos[mode]}</Text>
            </Box>

            <Flex gap="3" mt="4" justify="end">
                <Dialog.Close>
                    <Button onClick={() => onConfirmCreateNtt()}>
                        Confirm
                    </Button>
                </Dialog.Close>
            </Flex>
        </>
    );

    function onConfirmCreateNtt() {
        let args = {
            name,
            symbol,
            mode
        }
        createNttAction(args);
    }
}