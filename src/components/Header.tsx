import { Box, Flex, Heading } from "@radix-ui/themes";
import { ConnectButton } from "@mysten/dapp-kit";
import { NavLink } from "react-router-dom";

const menu = [
    {
        title: "NTTs",
        link: "/ntts",
    },
    {
        title: "Bridge",
        link: "/bridge",
    },
];

export function Header() {
    return (
        <>
            <Flex
                position="sticky"
                px="4"
                py="2"
                justify="between"
                style={{
                    // borderBottom: "1px solid var(--gray-a2)",
                }}
            >
                <Box>
                    <Heading>Pump.Ntt</Heading>
                </Box>

                <Box className="flex gap-5 items-center">
                    {menu.map((item) => (
                        <NavLink
                            key={item.link}
                            to={item.link}
                            className={({ isActive, isPending }) =>
                                `cursor-pointer flex items-center gap-2 ${isPending
                                    ? "pending"
                                    : isActive
                                        ? "font-bold text-blue-600"
                                        : ""
                                }`
                            }
                        >
                            {item.title}
                        </NavLink>
                    ))}
                </Box>

                <Box>
                    <ConnectButton connectText="Connect Wallet" 
                        className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-neutral-950 disabled:pointer-events-none disabled:opacity-50 bg-tertiary text-primaryDark shadow-sm h-9 px-4 py-2"
                    />
                </Box>
            </Flex>
        </>
    )
}