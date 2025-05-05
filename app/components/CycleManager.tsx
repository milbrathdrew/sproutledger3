'use client';

import React, { useState } from 'react';
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
            <div key={cycle.id} className="p-4 border rounded shadow bg-white max-w-4xl w-full">
              <h3 className="text-xl font-semibold mb-2">{cycle.name}</h3>
              <div className="space-y-2 mb-4">
                <p>Status: <span className="font-medium">{cycle.status}</span></p>
                <p>Transactions: <span className="font-medium">{summary.count}</span></p>
                <p>
                  Profit (Total):
                  <span
                    className="ml-1 cursor-help"
                    title="Total profit using the full value of all seeds bought for this cycle."
                  >ℹ️</span>
                  <span className={`font-medium ml-1 ${summary.totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>{summary.totalProfit.toLocaleString()} gp</span>
                </p>
                <p>
                  Profit (Used Seeds):
                  <span
                    className="ml-1 cursor-help"
                    title="Profit using only the cost of seeds actually used (not all bought)."
                  >ℹ️</span>
                  <span className={`font-medium ml-1 ${summary.profitUsedSeeds >= 0 ? 'text-green-600' : 'text-red-600'}`}>{summary.profitUsedSeeds.toLocaleString()} gp</span>
                </p>
                <p>
                  Yield:
                  <span
                    className="ml-1 cursor-help"
                    title="Sum of all items sold in this cycle."
                  >ℹ️</span>
                  <span className="font-medium ml-1">{summary.totalYield}</span>
                </p>
                <p>
                  Seeds Used:
                  <span
                    className="ml-1 cursor-help"
                    title="Sum of 'Seeds Used' values you set for each buy transaction."
                  >ℹ️</span>
                  <span className="font-medium ml-1">{summary.seedsUsed}</span>
                </p>
                <p>
                  Efficiency:
                  <span
                    className="ml-1 cursor-help"
                    title="Yield divided by Seeds Used."
                  >ℹ️</span>
                  <span className="font-medium ml-1">{summary.efficiency.toFixed(2)}</span>
                </p>
              </div>
              {/* Collapsible Calculation Explanation Section */}
              <CalculationExplanation />
              {buys.length > 0 && (
                <div className="mb-2 p-2 bg-gray-50 border border-gray-200 rounded">
                  <h4 className="font-semibold mb-2">Buy Transactions (Seeds Used)</h4>
                  <div className="space-y-2">
                    {buys.map((tx) => (
                      <div key={tx.time} className="p-3 border rounded bg-white flex flex-col space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="font-semibold">Item:</span>
                          <span>{tx.itemId}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="font-semibold">Qty:</span>
                          <span>{tx.quantity}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="font-semibold">Price/Ea:</span>
                          <span>{tx.price.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="font-semibold">Price Total:</span>
                          <span>{(tx.price * tx.quantity).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="font-semibold">Seeds Used:</span>
                          <div className="flex flex-col items-end">
                            <div className="flex items-center space-x-1">
                              <button
                                type="button"
                                className="px-2 py-1 border rounded bg-gray-100 hover:bg-gray-200"
                                onClick={() => onSeedsUsedChange(tx.time, Math.max(0, (typeof tx.seedsUsed === 'number' ? tx.seedsUsed : tx.quantity) - 1))}
                                disabled={(typeof tx.seedsUsed === 'number' ? tx.seedsUsed : tx.quantity) <= 0}
                              >-</button>
                              <input
                                type="number"
                                min={0}
                                max={tx.quantity}
                                value={typeof tx.seedsUsed === 'number' ? tx.seedsUsed : tx.quantity}
                                onChange={e => onSeedsUsedChange(tx.time, Math.max(0, Math.min(tx.quantity, Number(e.target.value))))}
                                className="w-20 border rounded p-1 text-right mx-1"
                              />
                              <button
                                type="button"
                                className="px-2 py-1 border rounded bg-gray-100 hover:bg-gray-200"
                                onClick={() => onSeedsUsedChange(tx.time, Math.min(tx.quantity, (typeof tx.seedsUsed === 'number' ? tx.seedsUsed : tx.quantity) + 1))}
                                disabled={(typeof tx.seedsUsed === 'number' ? tx.seedsUsed : tx.quantity) >= tx.quantity}
                              >+</button>
                            </div>
                            <div className="flex space-x-1 mt-1">
                              {[1, 5, 10].map(val => (
                                <button
                                  key={val}
                                  type="button"
                                  className="px-2 py-1 border rounded bg-blue-100 hover:bg-blue-200"
                                  onClick={() => onSeedsUsedChange(tx.time, Math.min(tx.quantity, (typeof tx.seedsUsed === 'number' ? tx.seedsUsed : tx.quantity) + val))}
                                  disabled={(typeof tx.seedsUsed === 'number' ? tx.seedsUsed : tx.quantity) + val > tx.quantity}
                                >{val}</button>
                              ))}
                              <button
                                type="button"
                                className="px-2 py-1 border rounded bg-blue-100 hover:bg-blue-200"
                                onClick={() => {
                                  const custom = window.prompt('Enter custom amount:');
                                  const num = Number(custom);
                                  if (!isNaN(num) && num >= 0 && num <= tx.quantity) {
                                    onSeedsUsedChange(tx.time, num);
                                  }
                                }}
                              >X</button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function CalculationExplanation() {
  const [open, setOpen] = useState(false);
  return (
    <div className="mt-4">
      <button
        className="text-blue-600 underline text-sm mb-2"
        onClick={() => setOpen((v) => !v)}
      >
        {open ? 'Hide' : 'How are these numbers calculated?'}
      </button>
      {open && (
        <div className="bg-blue-50 border border-blue-200 rounded p-3 text-sm space-y-2">
          <div><strong>Profit (Total):</strong> Total profit using the full value of all seeds bought for this cycle.<br /><span className="text-gray-600">Formula: (Total Earned from Sells) - (Total Spent on All Seeds Bought)</span></div>
          <div><strong>Profit (Used Seeds):</strong> Profit using only the cost of seeds actually used (not all bought).<br /><span className="text-gray-600">Formula: (Total Earned from Sells) - (Cost of Seeds Used)</span></div>
          <div><strong>Yield:</strong> Sum of all items sold in this cycle.<br /><span className="text-gray-600">Formula: Sum of Quantities from Sell Transactions</span></div>
          <div><strong>Seeds Used:</strong> Sum of 'Seeds Used' values you set for each buy transaction.<br /><span className="text-gray-600">Formula: Sum of Seeds Used (per Buy Transaction)</span></div>
          <div><strong>Efficiency:</strong> Yield divided by Seeds Used.<br /><span className="text-gray-600">Formula: Yield / Seeds Used</span></div>
        </div>
      )}
    </div>
  );
} 