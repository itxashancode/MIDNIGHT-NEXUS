import { 
  deployContract as deployContractFn, 
  findDeployedContract,
  DeployTxFailedError,
  CallTxFailedError,
  TxFailedError
} from "@midnight-ntwrk/midnight-js-contracts";
import { buildProviders, MidnightProviders } from "./providers";
import fs from "fs";
import path from "path";

export interface DeployedContract {
  contractAddress: string;
  txHash: string;
  [key: string]: any;
}

export async function deployNexusZero(): Promise<{
  contractAddress: string
  txHash: string
}> {
  const providers = buildProviders();
  const contractPath = path.join(process.cwd(), "midnight-contracts", "managed", "NexusZero", "contract", "index.js");
  
  if (!fs.existsSync(contractPath)) {
    throw new Error("Contract not compiled. Run: npm run compile");
  }

  const { default: contract } = await import(`file://${contractPath}`);

  try {
    const result = await deployContractFn(providers, {
      compiledContract: contract
    } as any);
    
    const contractAddress = (result as any).contractAddress;
    const txHash = (result as any).txHash;

    const envPath = path.join(process.cwd(), ".env");
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, "utf-8");
      const updatedEnv = envContent.includes("CONTRACT_ADDRESS=")
        ? envContent.replace(/CONTRACT_ADDRESS=.*/g, `CONTRACT_ADDRESS=${contractAddress}`)
        : envContent + `\nCONTRACT_ADDRESS=${contractAddress}`;
      fs.writeFileSync(envPath, updatedEnv);
    }

    return { contractAddress, txHash };
  } catch (error: any) {
    if (error instanceof DeployTxFailedError) {
      throw new Error(`Contract deployment failed: ${error.message}`);
    }
    throw new Error(`Unexpected deployment error: ${error.message}`);
  }
}

export async function getContract(): Promise<DeployedContract> {
  const contractAddress = process.env.CONTRACT_ADDRESS;
  if (!contractAddress) {
    throw new Error("Contract not deployed. Run: npm run deploy");
  }

  const providers = buildProviders();
  const contractPath = path.join(process.cwd(), "midnight-contracts", "managed", "NexusZero", "contract", "index.js");
  const { default: contract } = await import(`file://${contractPath}`);

  try {
    const deployed = await findDeployedContract(providers, {
      compiledContract: contract,
      contractAddress: contractAddress
    } as any);
    
    return {
      ...deployed,
      contractAddress,
      txHash: (deployed as any).deployTxData?.txHash || ""
    } as any;
  } catch (error: any) {
    throw new Error(`Failed to find deployed contract: ${error.message}`);
  }
}

export async function verifyExecution(params: {
  executionAttestation: string
  isCompliant: boolean
  aiExecutionLogHash: string
  callerSecret: string
}): Promise<{
  success: boolean
  txHash: string
  sessionId: string
  totalVerifications: number
  error?: string
}> {
  const { executionAttestation, isCompliant, aiExecutionLogHash, callerSecret } = params;

  const validateHex = (hex: string, name: string): string => {
    const cleanHex = hex.startsWith("0x") ? hex.slice(2) : hex;
    if (!/^[0-9a-fA-F]+$/.test(cleanHex) || cleanHex.length % 2 !== 0) {
      throw new Error(`Invalid hex string for ${name}`);
    }
    return cleanHex;
  };

  const hexToBytes = (hex: string): Uint8Array => {
    const cleanHex = validateHex(hex, "input");
    const bytes = new Uint8Array(cleanHex.length / 2);
    for (let i = 0; i < bytes.length; i++) {
      bytes[i] = parseInt(cleanHex.substr(i * 2, 2), 16);
    }
    return bytes;
  };

  try {
    const attestationBytes = hexToBytes(executionAttestation);
    const logHashBytes = hexToBytes(aiExecutionLogHash);
    const secretBytes = hexToBytes(callerSecret);

    const contract = await getContract();
    const providers = buildProviders();

    let txHash = "";
    try {
      if (typeof (contract as any).submitCallTx === 'function') {
        txHash = await (contract as any).submitCallTx("verify_ai_execution", [
          attestationBytes,
          isCompliant,
          logHashBytes,
          secretBytes
        ]);
      } else {
        txHash = await (contract as any).verify_ai_execution(attestationBytes, isCompliant, {
          aiExecutionLogHash: logHashBytes,
          callerSecret: secretBytes,
        });
      }
    } catch (e: any) {
      throw e;
    }

    let confirmed = false;
    const startTime = Date.now();
    while (Date.now() - startTime < 60000) {
      try {
        const status = await providers.publicDataProvider.getTxStatus(txHash);
        if (status && status.confirmed) {
          confirmed = true;
          break;
        }
      } catch {
        // continue polling
      }
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    if (!confirmed) {
      return {
        success: false,
        txHash,
        sessionId: executionAttestation,
        totalVerifications: 0,
        error: "Transaction confirmation timed out"
      };
    }

    const publicState = await getPublicState();

    return {
      success: true,
      txHash,
      sessionId: executionAttestation,
      totalVerifications: publicState.totalVerifications
    };

  } catch (error: any) {
    if (error instanceof CallTxFailedError || error instanceof TxFailedError || error.name === 'CallTxFailedError' || error.name === 'TxFailedError') {
      return {
        success: false,
        txHash: "",
        sessionId: executionAttestation,
        totalVerifications: 0,
        error: error.message
      };
    }
    return {
      success: false,
      txHash: "",
      sessionId: executionAttestation,
      totalVerifications: 0,
      error: error.message
    };
  }
}

export async function getPublicState(): Promise<{
  totalVerifications: number
  verifiedSessionCount: number
}> {
  try {
    const contract = await getContract();
    const publicState = await (contract as any).getPublicStates();
    return {
      totalVerifications: Number(publicState.totalVerifications),
      verifiedSessionCount: Number(publicState.verifiedSessionCount)
    };
  } catch {
    try {
      const contract = await getContract();
      const publicState = await (contract as any).getPublicState();
      return {
        totalVerifications: Number(publicState.totalVerifications),
        verifiedSessionCount: Number(publicState.totalVerifications),
      };
    } catch {
      return {
        totalVerifications: 0,
        verifiedSessionCount: 0
      };
    }
  }
}
