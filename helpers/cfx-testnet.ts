import { MarketplaceAddr } from "@/addresses";
import { Chain } from "wagmi/chains";


export const Conflux_Testnet: Chain | any = {
  id: 71,
  name: "Conflux eSpace (Testnet)",
  network: "Conflux eSpace (Testnet)",
  iconUrl: "/images/conflux-logo.svg",
  // iconBackground: "#fff",
  nativeCurrency: {
    decimals: 18,
    name: "CFX",
    symbol: "CFX",
  },
  rpcUrls: {
    default: {
      http: [
        `https://conflux-espace-testnet.rpc.thirdweb.com/${MarketplaceAddr}`,
        "https://evmtestnet.confluxrpc.com",
      ],
    },
    public: {
      http: [
        `https://conflux-espace-testnet.rpc.thirdweb.com/${MarketplaceAddr}`,
        "https://evmtestnet.confluxrpc.com",
      ],
    },
  },
  blockExplorers: {
    default: { name: "Conflux Scan", url: "https://evmtestnet.confluxscan.io" },
  },
  testnet: true,
};
