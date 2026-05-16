import { useCallback } from 'react';
import { MidnightNexusClient } from '@/lib/midnight-client';
import { PrivacyEngine } from '@/lib/midnight/privacy/privacy-engine';
import { useReasoningStore } from '@/store/useReasoningStore';

export function usePrivacy(client: MidnightNexusClient | null) {
  const { isProving, setIsProving, setPrivacyEnabled, isPrivacyEnabled } = useReasoningStore();

  const engine = client ? new PrivacyEngine({ 
    logger: console as any, 
    network: 'preprod' 
  }) : null;

  const commitPromptPrivacy = useCallback(async (prompt: string) => {
    if (!engine) return;
    setIsProving(true);
    try {
      const txHash = await engine.commitPrompt(prompt, client!);
      console.log("Prompt committed:", txHash);
    } catch (error) {
      console.error("Prompt privacy failed:", error);
    } finally {
      setIsProving(false);
    }
  }, [engine, client, setIsProving]);

  const logInterceptionPrivacy = useCallback(async (eventData: any) => {
    if (!engine) return;
    setIsProving(true);
    try {
      const txHash = await engine.logInterception(eventData, client!);
      console.log("Interception logged:", txHash);
    } catch (error) {
      console.error("Interception privacy failed:", error);
    } finally {
      setIsProving(false);
    }
  }, [engine, client, setIsProving]);

  const attestResponsePrivacy = useCallback(async (attestation: string, isCompliant: boolean) => {
    if (!engine) return;
    setIsProving(true);
    try {
      const result = await engine.attestResponse(attestation, isCompliant, client!);
      console.log("Response integrity attested:", result.txHash);
    } catch (error) {
      console.error("Response integrity failed:", error);
    } finally {
      setIsProving(false);
    }
  }, [engine, client, setIsProving]);

  return {
    isProving,
    isPrivacyEnabled,
    setPrivacyEnabled,
    commitPromptPrivacy,
    logInterceptionPrivacy,
    attestResponsePrivacy,
  };
}
