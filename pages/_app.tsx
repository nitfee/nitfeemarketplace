import type { AppProps } from "next/app";
import { ThirdwebProvider } from "@thirdweb-dev/react";
import "../styles/globals.css";
import Head from "next/head";
import { Roboto } from "next/font/google";
import "@rainbow-me/rainbowkit/styles.css";
import Layout from "@/components/Layout";
import { ConfluxEspace } from "@thirdweb-dev/chains";

const roboto = Roboto({
  weight: ["400", "700"],
  style: ["normal", "italic"],
  subsets: ["latin"],
});
function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ThirdwebProvider activeChain={ConfluxEspace}>
      <Head>
        <title>Nitfee Marketplace</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta
          name="description"
          content="List Your NFTs For Sale, Accept Bids, and Buy NFTs"
        />
        <meta
          name="keywords"
          content="Thirdweb, Marketplace, NFT Marketplace Tutorial, NFT Auction Tutorial, How To Make OpenSea"
        />
      </Head>
      <main className={roboto.className}>
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </main>
    </ThirdwebProvider>
  );
}

export default MyApp;
