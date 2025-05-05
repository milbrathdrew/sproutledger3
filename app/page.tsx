'use client';

import React, { useState } from "react";
import { Transaction, ItemMapping, Cycle } from "./types";
import CycleManager from "./components/CycleManager";

export default function Home() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [itemMap, setItemMap] = useState<Record<number, string>>({});
  const [cycles, setCycles] = useState<Cycle[]>([]);

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

      {transactions.length > 0 && (
        <CycleManager
          cycles={cycles}
          transactions={transactions}
          onCycleCreate={handleCycleCreate}
          onSeedsUsedChange={handleSeedsUsedChange}
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
                  <th className="px-4 py-2 border">Price</th>
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
        <div className="text-gray-500 mt-8">No transactions imported yet.</div>
      )}
    </div>
  );
}
