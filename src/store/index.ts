import { configureStore } from '@reduxjs/toolkit';
import relayReducer from './relay';
import routerReducer from './router';
import walletReducer from './wallet';
import tokenPricesReducer from './tokenPrices';
import nttReducer from './ntt';

export const store = configureStore({
  reducer: {
    router: routerReducer,
    wallet: walletReducer,
    relay: relayReducer,
    tokenPrices: tokenPricesReducer,
    ntt: nttReducer,
  },
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;
