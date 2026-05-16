"use client";

import { useState, useEffect } from "react";

interface VerifyResult {
  success: boolean;
  txHash: string;
  sessionId: string;
  aiAnalysis: {
    riskLevel: string;
    summary: string;
    recommendation: string;
    confidence: string;
  };
}

function getRiskColor(level: string): string {
  switch (level) {
    case "LOW": return "text-green-400 bg-green-400/20 border-green-400/50";
    case "MEDIUM": return "text-yellow-400 bg-yellow-400/20 border-yellow-400/50";
    case "HIGH": return "text-red-400 bg-red-400/20 border-red-400/50";
    default: return "text-gray-400 bg-gray-400/20 border-gray-400/50";
  }
}

function shortenHash(hash: string): string {
  if (!hash || hash.length < 15) return hash;
  return `${hash.slice(0, 8)}...${hash.slice(-6)}`;
}

function generateDemoAttestation(): string {
  return Array.from(crypto.getRandomValues(new Uint8Array(32)))
    .map(b => b.toString(16).padStart(2, '0')).join('');
}

function generateDemoHash(): string {
  return Array.from(crypto.getRandomValues(new Uint8Array(32)))
    .map(b => b.toString(16).padStart(2, '0')).join('');
}

function generateDemoSecret(): string {
  return Array.from(crypto.getRandomValues(new Uint8Array(32)))
    .map(b => b.toString(16).padStart(2, '0')).join('');
}

export default function VerifyPanel() {
  const [state, setState] = useState<'idle'|'loading'|'success'|'error'>('idle');
  const [result, setResult] = useState<VerifyResult | null>(null);
  const [error, setError] = useState('');
  const [stepIndex, setStepIndex] = useState(0);
  const [totalVerifications, setTotalVerifications] = useState<number>(0);

  useEffect(() => {
    fetch('/api/health')
      .then(r => r.json())
      .then(d => setTotalVerifications(d.contractDeployed ? 0 : 0))
      .catch(() => {});
  }, []);

  async function handleVerify() {
    setState('loading');
    setStepIndex(0);
    setError('');
    
    const stepTimer1 = setTimeout(() => setStepIndex(1), 2000);
    const stepTimer2 = setTimeout(() => setStepIndex(2), 4000);
    
    try {
      const response = await fetch('/api/contract/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          executionAttestation: generateDemoAttestation(),
          isCompliant: true,
          aiExecutionLogHash: generateDemoHash(),
          callerSecret: generateDemoSecret()
        })
      });
      
      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);
      
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error ?? 'Verification failed');
      }
      
      const data = await response.json();
      setResult(data);
      setState('success');
      setTotalVerifications(prev => prev + 1);
    } catch (err) {
      setError(String(err));
      setState('error');
      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);
    }
  }

  if (state === 'idle') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
        <div className="text-center max-w-md">
          <h2 className="text-3xl font-bold text-white mb-4">ZK AI Compliance Verifier</h2>
          <p className="text-gray-400 mb-8">Verify AI execution without revealing your data</p>
          <button
            onClick={handleVerify}
            className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
          >
            Run Verification Demo
          </button>
        </div>
      </div>
    );
  }

  if (state === 'loading') {
    const steps = [
      "Generating ZK proof...",
      "Submitting to Midnight...",
      "Waiting for confirmation..."
    ];
    
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
        <div className="text-center max-w-md">
          <h2 className="text-2xl font-bold text-white mb-8">Verifying...</h2>
          <div className="space-y-4">
            {steps.map((step, i) => (
              <div 
                key={i} 
                className={`flex items-center gap-3 ${i === stepIndex ? 'text-white' : 'text-gray-500'}`}
              >
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                  i < stepIndex ? 'bg-green-500' : i === stepIndex ? 'bg-blue-500 animate-pulse' : 'bg-gray-700'
                }`}>
                  {i < stepIndex ? '✓' : i + 1}
                </div>
                <span>{step}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (state === 'error') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
        <div className="text-center max-w-md">
          <div className="text-red-400 mb-4">⚠️ Verification failed</div>
          <div className="text-gray-400 mb-8">{error}</div>
          <button
            onClick={() => setState('idle')}
            className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (state === 'success' && result) {
    return (
      <div className="p-6 min-h-[400px]">
        <div className="text-center mb-6">
          <div className="text-green-400 text-xl font-semibold mb-2">✅ Verified on Midnight Blockchain</div>
          <div className="text-gray-400">Total Verifications: {totalVerifications + 1}</div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
            <h3 className="text-sm font-semibold text-gray-300 mb-4">Blockchain Proof</h3>
            <div className="space-y-3 text-sm">
              <div>
                <span className="text-gray-500">Transaction:</span>
                <div className="font-mono text-gray-300">{shortenHash(result.txHash)}</div>
              </div>
              <div>
                <span className="text-gray-500">Session ID:</span>
                <div className="font-mono text-gray-300">{shortenHash(result.sessionId)}</div>
              </div>
              <div>
                <span className="text-gray-500">Network:</span>
                <div className="text-gray-300">TestNet</div>
              </div>
              <div>
                <span className="text-gray-500">Total Verifications:</span>
                <div className="text-blue-400 font-bold">{totalVerifications + 1}</div>
              </div>
            </div>
          </div>

          <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
            <h3 className="text-sm font-semibold text-gray-300 mb-4">AI Compliance Analysis</h3>
            <div className="space-y-3">
              <div>
                <span className="text-gray-500">Risk Level:</span>
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold mt-1 ${getRiskColor(result.aiAnalysis.riskLevel)}`}>
                  {result.aiAnalysis.riskLevel}
                </span>
              </div>
              <div>
                <span className="text-gray-500">Summary:</span>
                <div className="text-gray-300 text-sm mt-1">{result.aiAnalysis.summary}</div>
              </div>
              <div>
                <span className="text-gray-500">Recommendation:</span>
                <div className="text-gray-300 text-sm mt-1">{result.aiAnalysis.recommendation}</div>
              </div>
              <div>
                <span className="text-gray-500">Confidence:</span>
                <div className="text-gray-300 text-sm mt-1">{result.aiAnalysis.confidence}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-gray-700">
          <div className="text-xs text-gray-500 text-center">
            🔒 Your actual data never left your device. Only the ZK proof exists on-chain.
          </div>
        </div>

        <div className="mt-6 text-center">
          <button
            onClick={() => setState('idle')}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
          >
            Run Another Verification
          </button>
        </div>
      </div>
    );
  }

  return null;
}