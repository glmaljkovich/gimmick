import React from "react";
import type { AppProps } from "next/app";
import { ChatProvider } from "./_chatProvider";
import Layout from "./_layout";

import "../styles/globals.css";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ChatProvider>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </ChatProvider>
  );
}

export default MyApp;
