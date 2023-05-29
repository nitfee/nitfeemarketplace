import { Chain } from "wagmi/chains";
import { MarketplaceAddr } from "../addresses";

export const Conflux: Chain | any = {
  id: 1030,
  name: "Conflux eSpace",
  network: "Conflux eSpace",
  iconUrl: "/images/conflux-logo.svg",
  nativeCurrency: {
    decimals: 18,
    name: "CFX",
    symbol: "CFX",
  },
  rpcUrls: {
    default: {
      http: [
        `https://conflux-espace.rpc.thirdweb.com/${MarketplaceAddr}`,
        "https://evm.confluxrpc.com",
      ],
    },
    public: {
      http: [
        `https://conflux-espace.rpc.thirdweb.com/${MarketplaceAddr}`,
        "https://evm.confluxrpc.com",
      ],
    },
  },
  blockExplorers: {
    default: { name: "Conflux Scan", url: "https://evm.confluxscan.net" },
  },
  testnet: false,
};
