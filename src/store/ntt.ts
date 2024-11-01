import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface NttState {
    ntt_info: any,
    chain_info: any,
}

const initialState: NttState = {
    ntt_info: null,
    chain_info: null,
};

export const nttSlice = createSlice({
    name: 'ntt',
    initialState,
    reducers: {
        setNttInfo: (
            state: NttState,
            { payload }: PayloadAction<any>,
        ) => {
            state.ntt_info = payload;
        },
        setChainInfo: (
            state: NttState,
            { payload }: PayloadAction<any>,
        ) => {
            state.chain_info = payload;
        },
    },
});

export const {
    setNttInfo,
    setChainInfo,
} = nttSlice.actions;

export default nttSlice.reducer;
