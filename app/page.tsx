'use client';

import React, { useState } from "react";
import { Transaction, ItemMapping, Cycle } from "./types";
import CycleManager from "./components/CycleManager";

export default function Home() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [itemMap, setItemMap] = useState<Record<number, string>>({});
  const [cycles, setCycles] = useState<Cycle[]>([]);
  const [showOnboarding, setShowOnboarding] = useState(true);

  const fetchItemMapping = async () => {
    try {
      const res = await fetch('https://prices.runescape.wiki/api/v1/osrs/mapping');
      const data: ItemMapping[] = await res.json();
      const map: Record<number, string> = {};
      data.forEach(item => { map[item.id] = item.name; });
      setItemMap(map);
    } catch {
      // fallback: leave itemMap empty
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const file = e.target.files?.[0];
    if (!file) return;
    if (Object.keys(itemMap).length === 0) await fetchItemMapping();
    
    try {
      const text = await file.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch (err) {
        setError("Invalid JSON file.");
        return;
      }
      
      if (!Array.isArray(data) && typeof data === "object") {
        const arr = Object.values(data).find(Array.isArray);
        if (arr) data = arr;
      }
      
      if (!Array.isArray(data)) {
        setError("JSON does not contain an array of transactions.");
        return;
      }
      
      const sorted = [...data].sort((a, b) => b.time - a.time);
      setTransactions(sorted as Transaction[]);
    } catch (err) {
      setError("Failed to read file.");
    }
  };

  const handleCycleCreate = (cycle: Cycle) => {
    setCycles([...cycles, cycle]);
  };

  const handleSeedsUsedChange = (transactionId: number, seedsUsed: number) => {
    setTransactions(transactions.map(tx =>
      tx.time === transactionId ? { ...tx, seedsUsed } : tx
    ));
  };

  const handleTransactionAssign = (transactionId: number, cycleId: string) => {
    setTransactions(transactions.map(tx =>
      tx.time === transactionId
        ? { ...tx, cycleId, seedsUsed: typeof tx.seedsUsed === 'number' ? tx.seedsUsed : tx.quantity }
        : tx
    ));
  };

  const handleCycleDelete = (cycleId: string) => {
    setCycles(cycles.filter(c => c.id !== cycleId));
    setTransactions(transactions.map(tx => tx.cycleId === cycleId ? { ...tx, cycleId: undefined } : tx));
  };

  return (
    <div className="min-h-screen p-8 flex flex-col items-center bg-gray-50">
      <h1 className="text-3xl font-bold mb-6">SproutLedger - Farming Cycle Manager</h1>
      
      <div className="w-full max-w-4xl mb-8">
        <input
          type="file"
          accept="application/json"
          onChange={handleFileChange}
          className="mb-4"
        />
        {error && <div className="text-red-500 mb-4">{error}</div>}
      </div>

      {/* Onboarding Instructions: show after file upload, collapsible, expanded if no cycles */}
      {transactions.length > 0 && (
        <div className="w-full max-w-4xl mb-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Getting Started</h2>
            <button
              className="text-blue-600 underline text-sm"
              onClick={() => setShowOnboarding(v => !v)}
            >
              {showOnboarding || cycles.length === 0 ? 'Hide' : 'Show'} instructions
            </button>
          </div>
          {(showOnboarding || cycles.length === 0) && (
            <div className="mt-2 bg-blue-50 border border-blue-200 rounded p-4 text-sm space-y-2">
              <div><strong>1. Create a Cycle:</strong> Click <span className="font-mono bg-gray-100 px-1 rounded">Create Cycle</span> to start a new farming run. Each cycle gets a unique name (e.g., F-123) and can be renamed.</div>
              <div><strong>2. Assign Transactions:</strong> Use the dropdown in the transactions table to assign your buys and sells to a cycle.</div>
              <div><strong>3. Set Seeds Used:</strong> For each buy in a cycle, set how many seeds you actually used. This powers accurate profit and efficiency calculations.</div>
              <div><strong>4. Review Your Results:</strong> See profit, yield, and efficiency for each cycle. Delete cycles you no longer need with the × button.</div>
              <div className="text-gray-500">You can hide these instructions at any time, but they'll stay visible until you create your first cycle.</div>
            </div>
          )}
        </div>
      )}

      {transactions.length > 0 && (
        <CycleManager
          cycles={cycles}
          transactions={transactions}
          onCycleCreate={handleCycleCreate}
          onSeedsUsedChange={handleSeedsUsedChange}
          onCycleDelete={handleCycleDelete}
        />
      )}

      {transactions.length > 0 && (
        <div className="w-full max-w-4xl mt-8">
          <h2 className="text-2xl font-bold mb-4">All Transactions</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200 rounded shadow">
              <thead>
                <tr>
                  <th className="px-4 py-2 border">Buy/Sell</th>
                  <th className="px-4 py-2 border">Item Name</th>
                  <th className="px-4 py-2 border">Quantity</th>
                  <th className="px-4 py-2 border">Price/Ea</th>
                  <th className="px-4 py-2 border">Price Total</th>
                  <th className="px-4 py-2 border">Time</th>
                  <th className="px-4 py-2 border">Cycle</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx, idx) => (
                  <tr key={idx} className="text-center">
                    <td className="px-4 py-2 border">{tx.buy ? "Buy" : "Sell"}</td>
                    <td className="px-4 py-2 border">{itemMap[tx.itemId] || tx.itemId}</td>
                    <td className="px-4 py-2 border">{tx.quantity}</td>
                    <td className="px-4 py-2 border">{tx.price.toLocaleString()}</td>
                    <td className="px-4 py-2 border">{(tx.price * tx.quantity).toLocaleString()}</td>
                    <td className="px-4 py-2 border">{new Date(tx.time).toLocaleString()}</td>
                    <td className="px-4 py-2 border">
                      <select
                        value={tx.cycleId || ''}
                        onChange={(e) => handleTransactionAssign(tx.time, e.target.value)}
                        className="border rounded p-1"
                      >
                        <option value="">Unassigned</option>
                        {cycles.map(cycle => (
                          <option key={cycle.id} value={cycle.id}>
                            {cycle.name}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      {transactions.length === 0 && !error && (
        <div className="text-gray-500 mt-8 flex flex-col items-center">
          <p>No transactions imported yet.</p>
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded max-w-xl text-center">
            <strong>How to get started:</strong><br />
            1. Go to <a href="https://runelite.net/account/grand-exchange" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">https://runelite.net/account/grand-exchange</a><br />
            2. Click <span className="font-mono bg-gray-100 px-1 rounded">Export Grand Exchange</span> to download your data file.<br />
            3. Upload the exported file above to begin tracking your farming cycles!
          </div>
        </div>
      )}
    </div>
  );
}
