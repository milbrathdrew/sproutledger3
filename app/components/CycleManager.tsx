'use client';

import React from 'react';
import { Cycle, Transaction } from '../types';

interface CycleManagerProps {
  cycles: Cycle[];
  transactions: Transaction[];
  onCycleCreate: (cycle: Cycle) => void;
  onSeedsUsedChange: (transactionId: number, seedsUsed: number) => void;
}

export default function CycleManager({ cycles, transactions, onCycleCreate, onSeedsUsedChange }: CycleManagerProps) {
  const [newCycleName, setNewCycleName] = React.useState('');

  const handleCreateCycle = () => {
    if (!newCycleName.trim()) return;
    const newCycle: Cycle = {
      id: Date.now().toString(),
      name: newCycleName,
      startTime: Date.now(),
      transactions: [],
      status: 'active',
    };
    onCycleCreate(newCycle);
    setNewCycleName('');
  };

  const calculateCycleSummary = (cycleId: string) => {
    const cycleTxs = transactions.filter(t => t.cycleId === cycleId);
    const buys = cycleTxs.filter(t => t.buy);
    const sells = cycleTxs.filter(t => !t.buy);
    const totalSpent = buys.reduce((sum, t) => sum + (t.price * t.quantity), 0);
    const totalEarned = sells.reduce((sum, t) => sum + (t.price * t.quantity), 0);
    const seedsUsed = buys.reduce((sum, t) => sum + (typeof t.seedsUsed === 'number' ? t.seedsUsed : t.quantity), 0);
    const totalYield = sells.reduce((sum, t) => sum + t.quantity, 0);
    const efficiency = seedsUsed > 0 ? (totalYield / seedsUsed) : 0;
    // Calculate cost of only seeds used
    const spentOnSeedsUsed = buys.reduce((sum, t) => {
      const used = typeof t.seedsUsed === 'number' ? t.seedsUsed : t.quantity;
      const perSeed = t.quantity > 0 ? t.price : 0;
      return sum + (perSeed * used);
    }, 0);
    const profitUsedSeeds = totalEarned - spentOnSeedsUsed;
    return {
      totalProfit: totalEarned - totalSpent,
      profitUsedSeeds,
      totalYield,
      seedsUsed,
      efficiency,
      count: cycleTxs.length,
    };
  };

  return (
    <div className="w-full max-w-4xl">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-4">Farming Cycles</h2>
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={newCycleName}
            onChange={(e) => setNewCycleName(e.target.value)}
            placeholder="New cycle name"
            className="flex-1 p-2 border rounded"
          />
          <button
            onClick={handleCreateCycle}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Create Cycle
          </button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {cycles.map((cycle) => {
          const summary = calculateCycleSummary(cycle.id);
          const buys = transactions.filter(t => t.cycleId === cycle.id && t.buy);
          return (
            <div key={cycle.id} className="p-4 border rounded shadow mb-6">
              <h3 className="text-xl font-semibold mb-2">{cycle.name}</h3>
              <div className="space-y-2 mb-4">
                <p>Status: <span className="font-medium">{cycle.status}</span></p>
                <p>Transactions: <span className="font-medium">{summary.count}</span></p>
                <p>Profit (Total): <span className={`font-medium ${summary.totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>{summary.totalProfit.toLocaleString()} gp</span></p>
                <p>Profit (Used Seeds): <span className={`font-medium ${summary.profitUsedSeeds >= 0 ? 'text-green-600' : 'text-red-600'}`}>{summary.profitUsedSeeds.toLocaleString()} gp</span></p>
                <p>Yield: <span className="font-medium">{summary.totalYield}</span></p>
                <p>Seeds Used: <span className="font-medium">{summary.seedsUsed}</span></p>
                <p>Efficiency: <span className="font-medium">{summary.efficiency.toFixed(2)}</span></p>
              </div>
              {buys.length > 0 && (
                <div className="mb-2">
                  <h4 className="font-semibold mb-1">Buy Transactions (Seeds Used)</h4>
                  <table className="min-w-full bg-white border border-gray-200 rounded text-sm">
                    <thead>
                      <tr>
                        <th className="px-2 py-1 border">Item</th>
                        <th className="px-2 py-1 border">Qty Bought</th>
                        <th className="px-2 py-1 border">Price/Ea</th>
                        <th className="px-2 py-1 border">Price Total</th>
                        <th className="px-2 py-1 border">Seeds Used</th>
                      </tr>
                    </thead>
                    <tbody>
                      {buys.map((tx) => (
                        <tr key={tx.time}>
                          <td className="px-2 py-1 border">{tx.itemId}</td>
                          <td className="px-2 py-1 border">{tx.quantity}</td>
                          <td className="px-2 py-1 border">{tx.price.toLocaleString()}</td>
                          <td className="px-2 py-1 border">{(tx.price * tx.quantity).toLocaleString()}</td>
                          <td className="px-2 py-1 border">
                            <input
                              type="number"
                              min={0}
                              max={tx.quantity}
                              value={typeof tx.seedsUsed === 'number' ? tx.seedsUsed : tx.quantity}
                              onChange={e => onSeedsUsedChange(tx.time, Math.max(0, Math.min(tx.quantity, Number(e.target.value))))}
                              className="w-16 border rounded p-1 text-right"
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
} 