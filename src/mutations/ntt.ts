import { useTransactionExecution } from "../hooks/useTransactionExecution";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Transaction } from "@mysten/sui/transactions";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { Contract } from "../constants";
import { bcs } from "@mysten/sui/bcs";

export function useCreateNtt() {
    const currentAccount = useCurrentAccount();
    const executeTransaction = useTransactionExecution();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            name,
            symbol,
            mode,
        }: {
            name: string;
            symbol: string;
            mode: string;
        }) => {
            if (!currentAccount?.address)
                throw new Error("You need to connect your wallet!");

            let mode_int = parseInt(mode);
            const txb = new Transaction();
            txb.moveCall({
                target: `${Contract.PumpNttPackageId}::pumpntt::create_new_ntt`,
                arguments: [
                    txb.pure.string(name),
                    txb.pure.string(symbol),
                    txb.pure.u8(mode_int),
                ],
            });

            return executeTransaction(txb);
        },
        onSuccess: () => {
            setTimeout(() => {
                queryClient.invalidateQueries()
                // queryClient.invalidateQueries({ queryKey: ["useGetNttObjects"] });
            }, 1_000);
        },
    });
}

export function useDeleteNtt() {
    const currentAccount = useCurrentAccount();
    const executeTransaction = useTransactionExecution();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            id,
        }: {
            id: string;
        }) => {
            if (!currentAccount?.address)
                throw new Error("You need to connect your wallet!");

            const txb = new Transaction();
            txb.moveCall({
                target: `${Contract.PumpNttPackageId}::pumpntt::delete_ntt`,
                arguments: [
                    txb.object(id),
                ],
            });

            return executeTransaction(txb);
        },
        onSuccess: () => {
            setTimeout(() => {
                queryClient.invalidateQueries()
                // queryClient.invalidateQueries({ queryKey: ["useGetNttObjects"] });
            }, 1_000);
        },
    });
}

export const uint8ArrayToBCS = (arr) =>  bcs.vector(bcs.u8()).serialize(arr).toBytes();

export function useAddNttChain() {
    const currentAccount = useCurrentAccount();
    const executeTransaction = useTransactionExecution();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            ntt_id,
            chain_id_1,
            info_1,
            chain_id_2,
            info_2
        }: {
            ntt_id: string;
            chain_id_1: number;
            info_1: string;
            chain_id_2: number;
            info_2: string;
        }) => {
            if (!currentAccount?.address)
                throw new Error("You need to connect your wallet!");

            const txb = new Transaction();
            txb.moveCall({
                target: `${Contract.PumpNttPackageId}::pumpntt::add_ntt_chain`,
                arguments: [
                    txb.object(ntt_id),
                    txb.pure.u16(chain_id_1),
                    txb.pure(uint8ArrayToBCS(new TextEncoder().encode(info_1)))
                ],
            });

            txb.moveCall({
                target: `${Contract.PumpNttPackageId}::pumpntt::add_ntt_chain`,
                arguments: [
                    txb.object(ntt_id),
                    txb.pure.u16(chain_id_2),
                    txb.pure(uint8ArrayToBCS(new TextEncoder().encode(info_2)))
                ],
            });

            return executeTransaction(txb);
        },
        onSuccess: () => {
            setTimeout(() => {
                queryClient.invalidateQueries()
                // queryClient.invalidateQueries({ queryKey: ["useGetNttObjects"] });
            }, 1_000);
        },
    });
}

export function useAddNttTokenContract() {
    const currentAccount = useCurrentAccount();
    const executeTransaction = useTransactionExecution();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            ntt_id,
            chain_id,
            info,
        }: {
            ntt_id: string;
            chain_id: number;
            info: string;
        }) => {
            if (!currentAccount?.address)
                throw new Error("You need to connect your wallet!");

            let info_uint8 = new TextEncoder().encode(info);

            const txb = new Transaction();
            txb.moveCall({
                target: `${Contract.PumpNttPackageId}::pumpntt::add_ntt_token_contract`,
                arguments: [
                    txb.object(ntt_id),
                    txb.pure.u16(chain_id),
                    txb.pure(uint8ArrayToBCS(info_uint8))
                ],
            });

            return executeTransaction(txb);
        },
        onSuccess: () => {
            setTimeout(() => {
                queryClient.invalidateQueries()
                // queryClient.invalidateQueries({ queryKey: ["useGetNttObjects"] });
            }, 1_000);
        },
    });
}

export function useAddNttManagerContract() {
    const currentAccount = useCurrentAccount();
    const executeTransaction = useTransactionExecution();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            ntt_id,
            chain_id,
            info,
        }: {
            ntt_id: string;
            chain_id: number;
            info: string;
        }) => {
            if (!currentAccount?.address)
                throw new Error("You need to connect your wallet!");

            let info_uint8 = new TextEncoder().encode(info);

            const txb = new Transaction();
            txb.moveCall({
                target: `${Contract.PumpNttPackageId}::pumpntt::add_ntt_manager_contract`,
                arguments: [
                    txb.object(ntt_id),
                    txb.pure.u16(chain_id),
                    txb.pure(uint8ArrayToBCS(info_uint8))
                ],
            });

            return executeTransaction(txb);
        },
        onSuccess: () => {
            setTimeout(() => {
                queryClient.invalidateQueries()
                // queryClient.invalidateQueries({ queryKey: ["useGetNttObjects"] });
            }, 1_000);
        },
    });
}

export function useUploadInfoContract() {
    const currentAccount = useCurrentAccount();
    const executeTransaction = useTransactionExecution();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            ntt_id,
            chain_id,
            ntt_info,
            token_info,
        }: {
            ntt_id: string;
            chain_id: number;
            ntt_info: string;
            token_info: string;
        }) => {
            if (!currentAccount?.address)
                throw new Error("You need to connect your wallet!");

            let ntt_info_uint8 = new TextEncoder().encode(ntt_info);

            const txb = new Transaction();
            txb.moveCall({
                target: `${Contract.PumpNttPackageId}::pumpntt::add_ntt_manager_contract`,
                arguments: [
                    txb.object(ntt_id),
                    txb.pure.u16(chain_id),
                    txb.pure(uint8ArrayToBCS(ntt_info_uint8))
                ],
            });

            let token_info_uint8 = new TextEncoder().encode(token_info);

            txb.moveCall({
                target: `${Contract.PumpNttPackageId}::pumpntt::add_ntt_token_contract`,
                arguments: [
                    txb.object(ntt_id),
                    txb.pure.u16(chain_id),
                    txb.pure(uint8ArrayToBCS(token_info_uint8))
                ],
            });

            return executeTransaction(txb);
        },
        onSuccess: () => {
            setTimeout(() => {
                queryClient.invalidateQueries()
                // queryClient.invalidateQueries({ queryKey: ["useGetNttObjects"] });
            }, 1_000);
        },
    });
}
