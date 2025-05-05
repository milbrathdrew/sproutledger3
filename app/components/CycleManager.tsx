'use client';

import React from 'react';
import { Cycle, Transaction } from '../types';

interface CycleManagerProps {
  cycles: Cycle[];
  transactions: Transaction[];
  onCycleCreate: (cycle: Cycle) => void;
}

export default function CycleManager({ cycles, transactions, onCycleCreate }: CycleManagerProps) {
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
    const seedsUsed = buys.reduce((sum, t) => sum + t.quantity, 0);
    const totalYield = sells.reduce((sum, t) => sum + t.quantity, 0);
    return {
      totalProfit: totalEarned - totalSpent,
      totalYield,
      seedsUsed,
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
          return (
            <div key={cycle.id} className="p-4 border rounded shadow">
              <h3 className="text-xl font-semibold mb-2">{cycle.name}</h3>
              <div className="space-y-2">
                <p>Status: <span className="font-medium">{cycle.status}</span></p>
                <p>Transactions: <span className="font-medium">{summary.count}</span></p>
                <p>Profit: <span className={`font-medium ${summary.totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>{summary.totalProfit.toLocaleString()} gp</span></p>
                <p>Yield: <span className="font-medium">{summary.totalYield}</span></p>
                <p>Seeds Used: <span className="font-medium">{summary.seedsUsed}</span></p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
} 