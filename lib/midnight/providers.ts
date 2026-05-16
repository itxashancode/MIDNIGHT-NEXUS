import { indexerPublicDataProvider } from "@midnight-ntwrk/midnight-js-indexer-public-data-provider";
import { httpClientProofProvider } from "@midnight-ntwrk/midnight-js-http-client-proof-provider";
import { NodeZkConfigProvider } from "@midnight-ntwrk/midnight-js-node-zk-config-provider";
import { levelPrivateStateProvider } from "@midnight-ntwrk/midnight-js-level-private-state-provider";

function getRequiredEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

export function buildProviders() {
   const networkId = getRequiredEnv("MIDNIGHT_NETWORK_ID") || "preprod";
  const indexerUrl = getRequiredEnv("MIDNIGHT_INDEXER_HTTP_URL");
  const provingUrl = getRequiredEnv("MIDNIGHT_PROVING_SERVER_URL");

  return {
    publicDataProvider: indexerPublicDataProvider(indexerUrl),
    proofProvider: httpClientProofProvider(provingUrl),
    zkConfigProvider: new NodeZkConfigProvider(networkId),
    privateStateProvider: levelPrivateStateProvider(".midnight-private-state"),
  };
}