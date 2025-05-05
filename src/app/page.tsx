'use client';

import React, { useState } from "react";

interface Transaction {
  buy: boolean;
  itemId: number;
  quantity: number;
  price: number;
  time: number;
}

interface ItemMapping {
  id: number;
  name: string;
}

export default function Home() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [itemMap, setItemMap] = useState<Record<number, string>>({});

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
    console.log('Item mapping after fetch:', itemMap);
    try {
      const text = await file.text();
      // Try to parse as array or as wrapped in an object
      let data;
      try {
        data = JSON.parse(text);
      } catch (err) {
        setError("Invalid JSON file.");
        return;
      }
      // If data is an object with a property, try to extract the array
      if (!Array.isArray(data) && typeof data === "object") {
        const arr = Object.values(data).find(Array.isArray);
        if (arr) data = arr;
      }
      if (!Array.isArray(data)) {
        setError("JSON does not contain an array of transactions.");
        return;
      }
      // Sort transactions by time descending
      const sorted = [...data].sort((a, b) => b.time - a.time);
      setTransactions(sorted as Transaction[]);
      if (Array.isArray(data) && data.length > 0) {
        console.log('First transaction itemId:', data[0].itemId, '->', itemMap[data[0].itemId]);
      }
    } catch (err) {
      setError("Failed to read file.");
    }
  };

  return (
    <div className="min-h-screen p-8 flex flex-col items-center bg-gray-50">
      <h1 className="text-3xl font-bold mb-6">SproutLedger - Import Transactions</h1>
      <input
        type="file"
        accept="application/json"
        onChange={handleFileChange}
        className="mb-4"
      />
      {/* Debug Section */}
      <div className="mb-4 p-2 bg-yellow-100 border border-yellow-300 rounded w-full max-w-4xl">
        <strong>Debug Info:</strong><br />
        Mapping loaded: {Object.keys(itemMap).length > 0 ? 'Yes' : 'No'}<br />
        Sample mapping: {Object.keys(itemMap).slice(0, 5).map(id => `${id}: ${itemMap[Number(id)]}`).join(', ')}<br />
        {transactions.length > 0 && (
          <>
            First transaction itemId: {transactions[0].itemId} → {itemMap[transactions[0].itemId] || 'Not found'}
          </>
        )}
      </div>
      {/* End Debug Section */}
      {error && <div className="text-red-500 mb-4">{error}</div>}
      {transactions.length > 0 && (
        <div className="w-full max-w-4xl overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 rounded shadow">
            <thead>
              <tr>
                <th className="px-4 py-2 border">Buy/Sell</th>
                <th className="px-4 py-2 border">Item Name</th>
                <th className="px-4 py-2 border">Quantity</th>
                <th className="px-4 py-2 border">Price</th>
                <th className="px-4 py-2 border">Time</th>
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {transactions.length === 0 && !error && (
        <div className="text-gray-500 mt-8">No transactions imported yet.</div>
      )}
    </div>
  );
}
