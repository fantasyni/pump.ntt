import React from "react";
import ReactDOM from "react-dom/client";
import "@mysten/dapp-kit/dist/index.css";
import "@radix-ui/themes/styles.css";
import "./styles/base.css";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SuiClientProvider, WalletProvider } from "@mysten/dapp-kit";
import { networkConfig } from "./networkConfig.ts";
import { RouterProvider } from "react-router-dom";
import { router } from "./routes/Router.tsx";
import { Theme } from "@radix-ui/themes";
import { Provider } from 'react-redux';
import { store } from './store';
import { darkTheme } from "./utils/theme.ts";

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Theme appearance="dark" hasBackground={false} accentColor="iris">
      <Provider store={store}>
        <QueryClientProvider client={queryClient}>
          <SuiClientProvider networks={networkConfig} defaultNetwork="testnet">
            <WalletProvider autoConnect theme={darkTheme}>
              <RouterProvider router={router} />
            </WalletProvider>
          </SuiClientProvider>
        </QueryClientProvider>
      </Provider>
    </Theme>
  </React.StrictMode>,
);