import { useQuery } from "@tanstack/react-query";
import { Chain } from '@wormhole-foundation/sdk';
import { getWalletOptions, getContext } from "../utils/wallet";

export function useGetWallets(chain: Chain) {
    return useQuery({
        queryKey: ["useWallets", chain],
        queryFn: async () => {
            let context = getContext(chain);
            let wallets = await getWalletOptions(context);
            return wallets;
        }
    });
}