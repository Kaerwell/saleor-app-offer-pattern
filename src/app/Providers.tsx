"use client";

import "@saleor/macaw-ui/next/style";
import "../styles/globals.css";

import { KindeProvider } from "@kinde-oss/kinde-auth-nextjs";
import { AppBridge, AppBridgeProvider } from "@saleor/app-sdk/app-bridge";
// import { RoutePropagator } from "@saleor/app-sdk/app-bridge/next";
import React, { useEffect } from "react";
import { AppProps } from "next/app";

import { ThemeSynchronizer } from "../lib/theme-synchronizer";
import { NoSSRWrapper } from "../lib/no-ssr-wrapper";
import { GraphQLProvider } from "../providers/GraphQLProvider";
import { ThemeProvider } from "@saleor/macaw-ui/next";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { CartProvider } from "../providers/CartProvider";

const queryClient = new QueryClient();

/**
 * Ensure instance is a singleton.
 * TODO: This is React 18 issue, consider hiding this workaround inside app-sdk
 */
const appBridgeInstance = typeof window !== "undefined" ? new AppBridge() : undefined;

const Providers = ({ children }: { children: React.ReactNode }) => {
  /**
   * Configure JSS (used by MacawUI) for SSR. If Macaw is not used, can be removed.
   */
  useEffect(() => {
    const jssStyles = document.querySelector("#jss-server-side");
    if (jssStyles) {
      jssStyles?.parentElement?.removeChild(jssStyles);
    }
  }, []);

  return (
    <NoSSRWrapper>
      <KindeProvider>
        <QueryClientProvider client={queryClient}>
          <AppBridgeProvider appBridgeInstance={appBridgeInstance}>
            <GraphQLProvider>
              <ThemeProvider>
                <CartProvider>
                  <ThemeSynchronizer />
                  {/* <RoutePropagator /> */}
                  {children}
                </CartProvider>
              </ThemeProvider>
            </GraphQLProvider>
          </AppBridgeProvider>
        </QueryClientProvider>
      </KindeProvider>
    </NoSSRWrapper>
  );
};

export default Providers;
