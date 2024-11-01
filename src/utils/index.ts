import { Chain, chainToPlatform } from '@wormhole-foundation/sdk';

export const isEvmChain = (chain: Chain) => {
    return chainToPlatform.get(chain) === 'Evm';
};

export function convertAddress(address: string): string {
    if (address.length === 22) return address;
    return `0x${address.slice(address.length - 40, address.length)}`;
}

export function trimAddress(address: string, max = 6): string {
    return (
        address.slice(0, max) +
        '...' +
        address.slice(address.length - 4, address.length)
    );
}

export function trimTxHash(txHash: string): string {
    const start = txHash.slice(0, 6);
    const end = txHash.slice(txHash.length - 4, txHash.length);
    return `${start}...${end}`;
}

export function displayAddress(chain: Chain, address: string): string {
    if (isEvmChain(chain)) {
        return trimAddress(convertAddress(address));
    } else if (chain === 'Solana') {
        return trimAddress(address, 4);
    }

    return trimAddress(address);
}