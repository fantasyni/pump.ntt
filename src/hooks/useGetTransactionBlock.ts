import { useSuiClientQuery } from "@mysten/dapp-kit";

export function useGetTransactionBlock({ digest }: { digest: string }) {
    return useSuiClientQuery(
        "getTransactionBlock",
        {
            digest: digest,
            options: {
                showEffects: true,
                showObjectChanges: true,
                showEvents: true,
            },
        },
        {
            enabled: !!digest,
        },
    );
}
