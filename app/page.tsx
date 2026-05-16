"use client";

import VerifyPanel from "@/components/VerifyPanel";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="container mx-auto py-12">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">NexusZero</h1>
          <p className="text-gray-400">ZK-Verified AI Compliance on Midnight Network</p>
        </header>
        <VerifyPanel />
      </div>
    </main>
  );
}