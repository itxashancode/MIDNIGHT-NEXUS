import { setNetworkId } from '@midnight-ntwrk/midnight-js-network-id';
import { CompiledContract } from '@midnight-ntwrk/compact-js';
import { deployContract, submitCallTx } from '@midnight-ntwrk/midnight-js-contracts';
import type { MidnightProviders } from '@midnight-ntwrk/midnight-js-types';
import { indexerPublicDataProvider } from '@midnight-ntwrk/midnight-js-indexer-public-data-provider';
import { httpClientProofProvider } from '@midnight-ntwrk/midnight-js-http-client-proof-provider';
import { NodeZkConfigProvider } from '@midnight-ntwrk/midnight-js-node-zk-config-provider';
import { levelPrivateStateProvider } from '@midnight-ntwrk/midnight-js-level-private-state-provider';
import { FluentWalletBuilder } from '@midnight-ntwrk/testkit-js';
import type { EnvironmentConfiguration } from '@midnight-ntwrk/testkit-js';
import { ZswapSecretKeys, DustSecretKey } from '@midnight-ntwrk/ledger-v8';
import * as Rx from 'rxjs';
import type { Logger } from 'pino';

// Import the compiled contract (will be generated after compilation)
// @ts-ignore
import { Contract, ledger, type Ledger } from '../midnight-contracts/managed/NexusZero/contract/index.js';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

// Contract configuration
const currentDir = path.dirname(fileURLToPath(import.meta.url));
const zkConfigPath = path.resolve(currentDir, '..', 'midnight-contracts', 'managed', 'NexusZero');
export const CompiledNexusZeroContract = CompiledContract.make(
  'NexusZeroContract',
  Contract,
).pipe(
  CompiledContract.withVacantWitnesses,
  CompiledContract.withCompiledFileAssets(zkConfigPath),
);

// Type definitions for our contract
export type NexusZeroCircuits = 'verify_ai_execution';
export type NexusZeroPrivateState = {};
export const NexusZeroPrivateStateId = 'nexusZeroPrivateState' as const;
export type NexusZeroPrivateStateId = typeof NexusZeroPrivateStateId;

export type NexusZeroProviders = MidnightProviders<
  NexusZeroCircuits,
  NexusZeroPrivateStateId,
  NexusZeroPrivateState
>;

// Network configuration
export const NETWORK_CONFIGS = {
  preprod: {
    networkId: 'preprod',
    indexer: 'https://indexer.preprod.midnight.network/api/v4/graphql',
    indexerWS: 'wss://indexer.preprod.midnight.network/api/v4/graphql/ws',
    node: 'https://rpc.preprod.midnight.network',
    nodeWS: 'wss://rpc.preprod.midnight.network',
    proofServer: 'http://127.0.0.1:6300',
  },
  undeployed: {
    networkId: 'undeployed',
    indexer: 'http://localhost:8088/api/v4/graphql',
    indexerWS: 'ws://localhost:8088/api/v4/graphql/ws',
    node: 'http://localhost:9944',
    nodeWS: 'ws://localhost:9944',
    proofServer: 'http://localhost:6300',
  }
} as const;

export type NetworkName = keyof typeof NETWORK_CONFIGS;

export class MidnightNexusClient {
  private wallet: any;
  private providers: NexusZeroProviders;
  private config: typeof NETWORK_CONFIGS[NetworkName];
  private logger: Logger;

  constructor(
    logger: Logger,
    network: NetworkName = 'undeployed',
    seed: string = this.generateRandomSeed()
  ) {
    this.logger = logger;
    this.config = NETWORK_CONFIGS[network];
    setNetworkId(this.config.networkId);
    
    // Initialize wallet using testkit FluentWalletBuilder
    this.wallet = this.initializeWallet(seed);
    
    // Initialize providers
    this.providers = this.initializeProviders();
  }

  private generateRandomSeed(): string {
    // Generate a random 32-byte seed
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  private initializeWallet(seed: string): any {
    const envConfig: EnvironmentConfiguration = {
      walletNetworkId: this.config.networkId,
      networkId: this.config.networkId,
      indexer: this.config.indexer,
      indexerWS: this.config.indexerWS,
      node: this.config.node,
      nodeWS: this.config.nodeWS,
      faucet: '',
      proofServer: this.config.proofServer,
    };

    const builder = FluentWalletBuilder.forEnvironment(envConfig);
    
    // Build wallet without starting first
    const buildResult = builder.withSeed(seed).buildWithoutStarting();
    // @ts-ignore
    const { wallet } = buildResult as {
      wallet: any;
      seeds: {
        masterSeed: string;
        shielded: Uint8Array;
        dust: Uint8Array;
      };
    };

    this.logger.info(`Wallet built from seed: ${seed.slice(0, 8)}...`);
    return wallet;
  }

  private initializeProviders(): NexusZeroProviders {
    const zkConfigProvider = new NodeZkConfigProvider<NexusZeroCircuits>(zkConfigPath);

    return {
       privateStateProvider: levelPrivateStateProvider({
         midnightDbName: 'nexus_zero_db',
         privateStateStoreName: 'private_states',
         signingKeyStoreName: 'signing_keys',
         privateStoragePasswordProvider: async () => 'dev-password-at-least-16-chars-long',
         accountId: 'dev-account-id',
       } as any),
      publicDataProvider: indexerPublicDataProvider(
        this.config.indexer,
        this.config.indexerWS,
      ),
      zkConfigProvider,
      proofProvider: httpClientProofProvider(
        this.config.proofServer,
        zkConfigProvider,
      ),
      walletProvider: this.createWalletProvider(),
      midnightProvider: this.createWalletProvider(),
    };
  }

  private createWalletProvider() {
    // This implements the WalletProvider and MidnightProvider interfaces
    // For testkit environment, we'll use the wallet facade directly
    return {
      getCoinPublicKey: () => {
        // This would be derived from the wallet's public key
        // For now, return a placeholder
        return '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';
      },
      getEncryptionPublicKey: () => {
        // Similar to above
        return '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890';
      },
      // @ts-ignore
      balanceTx: async (tx, ttl?) => {
        // For testkit, we'll implement basic balancing
        const recipe: any = await this.wallet.balanceUnboundTransaction(
          tx,
          {
            shieldedSecretKeys: ZswapSecretKeys.fromSeed(new Uint8Array(32)),
            dustSecretKey: DustSecretKey.fromSeed(new Uint8Array(32)),
          },
          { ttl: ttl ?? new Date(Date.now() + 30 * 60 * 1000) },
        );
        return this.wallet.finalizeRecipe(recipe);
      },
       submitTx: (tx: any) => this.wallet.submitTransaction(tx),
    };
  }

  async start(): Promise<void> {
    await this.wallet.start(
      ZswapSecretKeys.fromSeed(new Uint8Array(32)),
      DustSecretKey.fromSeed(new Uint8Array(32))
    );
    await this.syncWallet();
  }

  async stop(): Promise<void> {
    return this.wallet.stop();
  }

  private async syncWallet(): Promise<void> {
    this.logger.info('Syncing Midnight Nexus wallet...');
    
    const syncedState = await Rx.firstValueFrom(
      this.wallet.state().pipe(
        Rx.throttleTime(5_000),
          Rx.filter((state: any) => state.isSynced),
      ),
    );

    this.logger.info('Wallet synced successfully');
  }

  async deployContract(): Promise<string> {
    this.logger.info('Deploying Nexus Zero contract...');
    
    const deployed = await deployContract(this.providers, {
      // @ts-ignore
      compiledContract: CompiledNexusZeroContract,
      privateStateId: NexusZeroPrivateStateId,
      initialPrivateState: {},
    } as any);

    const contractAddress = deployed.deployTxData.public.contractAddress;
    this.logger.info(`Nexus Zero contract deployed at: ${contractAddress}`);
    return contractAddress;
  }

  async verifyAiExecution(
    executionAttestation: string, // hex string of the AI execution hash
    isCompliant: boolean,
    contractAddress: string
  ): Promise<{ txId: string; blockHeight: number }> {
    this.logger.info(`Verifying AI execution with attestation: ${executionAttestation}`);
    
      const result = await submitCallTx(this.providers, {
        // @ts-ignore
        compiledContract: CompiledNexusZeroContract,
        contractAddress,
        privateStateId: NexusZeroPrivateStateId,
        circuitId: 'verify_ai_execution',
      args: [
        executionAttestation, // Bytes<32>
        isCompliant,          // Boolean
      ],
    });

    this.logger.info(`AI execution verified. TX: ${result.public.txId}, Block: ${result.public.blockHeight}`);
    
    return {
      txId: result.public.txId,
      blockHeight: result.public.blockHeight,
    };
  }

  async getVerifiedSessions(contractAddress: string): Promise<Uint8Array[]> {
    const contractState = await this.providers.publicDataProvider.queryContractState(contractAddress);
    
    if (contractState === null) {
      throw new Error('Contract not found');
    }

    const ledgerState = ledger(contractState.data);
    return Array.from(ledgerState.verifiedSessions);
  }

  getConfig() {
    return this.config;
  }
}

// Export utility functions
export function createNexusClient(
  logger: Logger,
  network: NetworkName = 'undeployed',
  seed?: string
): MidnightNexusClient {
  return new MidnightNexusClient(logger, network, seed);
}

export async function initializeNexusClient(
  logger: Logger,
  network: NetworkName = 'undeployed',
  seed?: string
): Promise<MidnightNexusClient> {
  const client = createNexusClient(logger, network, seed);
  await client.start();
  return client;
}
