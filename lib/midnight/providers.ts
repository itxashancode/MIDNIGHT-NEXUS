import { indexerPublicDataProvider } from "@midnight-ntwrk/midnight-js-indexer-public-data-provider";
import { httpClientProofProvider } from "@midnight-ntwrk/midnight-js-http-client-proof-provider";
import { setNetworkId } from "@midnight-ntwrk/midnight-js-network-id";

export type MidnightProviders = any;

export function buildProviders(): any {
  const indexerHttpUrl = process.env.MIDNIGHT_INDEXER_HTTP_URL!;
  const indexerWsUrl = process.env.MIDNIGHT_INDEXER_WS_URL!;
  const provingServerUrl = process.env.MIDNIGHT_PROVING_SERVER_URL!;
  const nodeUrl = process.env.MIDNIGHT_NODE_URL!;

  setNetworkId("preprod" as any);

  const dummyWalletProvider = {} as any;
  const zkConfigProvider = {} as any;

  return {
    publicDataProvider: (indexerPublicDataProvider as any)(indexerHttpUrl, indexerWsUrl),
    proofProvider: (httpClientProofProvider as any)(provingServerUrl, zkConfigProvider),
    zkConfigProvider,
    privateStateProvider: {} as any,
    walletProvider: dummyWalletProvider,
    midnightProvider: dummyWalletProvider,
  };
}
