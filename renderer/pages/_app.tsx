import React from "react";
import type { AppProps } from "next/app";
import { ContextProvider } from "@/components/contextProvider";
import Layout from "@/components/_layout";

import "../styles/globals.css";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ContextProvider>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </ContextProvider>
  );
}

export default MyApp;
