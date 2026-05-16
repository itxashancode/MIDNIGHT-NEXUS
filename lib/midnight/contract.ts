import { 
  deployContract as deployContractFn, 
  findDeployedContract,
  DeployTxFailedError,
  CallTxFailedError
} from "@midnight-ntwrk/midnight-js-contracts";
import { buildProviders } from "./providers";
import { CompactRuntime } from "@midnight-ntwrk/compact-runtime";
import fs from "fs";
import path from "path";

async function loadCircuit() {
  const circuitPath = path.join(process.cwd(), "midnight-contracts", "NexusZero.compact");
  const circuitContent = fs.readFileSync(circuitPath, "utf-8");
  return CompactRuntime.compile(circuitContent);
}

export async function deployContract(): Promise<{ contractAddress: string; txHash: string }> {
  const providers = buildProviders();
  const circuit = await loadCircuit();
  
  try {
    const result = await deployContractFn(circuit, providers);
    const contractAddress = result.contractAddress;
    const txHash = result.txHash;

    const envPath = path.join(process.cwd(), ".env");
    const envContent = fs.readFileSync(envPath, "utf-8");
    const updatedEnv = envContent.includes("CONTRACT_ADDRESS=")
      ? envContent.replace(/CONTRACT_ADDRESS=.*/g, `CONTRACT_ADDRESS=${contractAddress}`)
      : envContent + `\nCONTRACT_ADDRESS=${contractAddress}`;
    fs.writeFileSync(envPath, updatedEnv);

    console.log("✅ Contract deployed!");
    console.log(`Address: ${contractAddress}`);
    console.log(`TxHash: ${txHash}`);

    return { contractAddress, txHash };
  } catch (err) {
    if (err instanceof DeployTxFailedError) {
      throw new Error(`Contract deployment failed: ${err.message}`);
    }
    throw new Error(`Unexpected deploy error: ${String(err)}`);
  }
}

export async function getContract() {
  const contractAddress = process.env.CONTRACT_ADDRESS;
  if (!contractAddress) {
    throw new Error("Contract not deployed yet. Run deploy first.");
  }

  const providers = buildProviders();
  const circuit = await loadCircuit();
  
  try {
    return await findDeployedContract(circuit, contractAddress, providers);
  } catch (err) {
    throw new Error(
      "Contract not found. Run: npm run deploy\n" +
      `CONTRACT_ADDRESS in .env: ${contractAddress ?? 'NOT SET'}`
    );
  }
}

export async function verifyExecution(params: {
  executionAttestation: string;
  isCompliant: boolean;
  aiExecutionLogHash: string;
  callerSecret: string;
}): Promise<{
  success: boolean;
  txHash: string;
  sessionId: string;
  totalVerifications: number;
  error?: string;
}> {
  const { executionAttestation, isCompliant, aiExecutionLogHash, callerSecret } = params;
  
  try {
    const contract = await getContract();
    const providers = buildProviders();

    const attestationBytes = hexToBytes(executionAttestation);
    const logHashBytes = hexToBytes(aiExecutionLogHash);
    const secretBytes = hexToBytes(callerSecret);

    const txHash = await contract.verify_ai_execution(attestationBytes, isCompliant, {
      aiExecutionLogHash: logHashBytes,
      callerSecret: secretBytes,
    });

    let success = false;
    let totalVerifications = 0;
    const startTime = Date.now();
    const timeout = 45000;

    while (Date.now() - startTime < timeout) {
      try {
        const status = await providers.publicDataProvider.getTxStatus(txHash);
        if (status.confirmed) {
          success = true;
          const publicState = await contract.getPublicState();
          totalVerifications = Number(publicState.totalVerifications);
          break;
        }
      } catch {
        // continue polling
      }
      await new Promise((r) => setTimeout(r, 2000));
    }

    return {
      success,
      txHash,
      sessionId: executionAttestation,
      totalVerifications,
    };
  } catch (err) {
    if (err instanceof CallTxFailedError) {
      return { 
        success: false, 
        txHash: '', 
        sessionId: '', 
        totalVerifications: 0,
        error: `ZK proof failed: ${err.message}` 
      };
    }
    return { 
      success: false, 
      txHash: '', 
      sessionId: '', 
      totalVerifications: 0,
      error: `Unexpected error: ${String(err)}` 
    };
  }
}

export async function getPublicState(): Promise<{
  totalVerifications: number;
  verifiedSessionCount: number;
}> {
  try {
    const contract = await getContract();
    const publicState = await contract.getPublicState();
    return {
      totalVerifications: Number(publicState.totalVerifications),
      verifiedSessionCount: Number(publicState.totalVerifications),
    };
  } catch {
    return {
      totalVerifications: 0,
      verifiedSessionCount: 0,
    };
  }
}

function hexToBytes(hex: string): Uint8Array {
  const cleanHex = hex.startsWith("0x") ? hex.slice(2) : hex;
  const bytes = new Uint8Array(cleanHex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(cleanHex.substr(i * 2, 2), 16);
  }
  return bytes;
}