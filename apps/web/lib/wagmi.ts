import { http, createConfig } from "wagmi";
import { bsc, bscTestnet } from "wagmi/chains";
import { injected } from "wagmi/connectors";

// Injected-only for now (MetaMask, Rabby, etc. via window.ethereum) —
// no WalletConnect Cloud project ID to wire up yet. Add the walletConnect()
// connector here once one exists, for mobile wallet support.
export const wagmiConfig = createConfig({
  chains: [bscTestnet, bsc],
  connectors: [injected()],
  transports: {
    [bsc.id]: http(),
    [bscTestnet.id]: http(),
  },
});
