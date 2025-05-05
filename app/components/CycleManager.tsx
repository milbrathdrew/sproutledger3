'use client';

import React from 'react';
import { Cycle, Transaction } from '../types';

interface CycleManagerProps {
  cycles: Cycle[];
  transactions: Transaction[];
  onCycleCreate: (cycle: Cycle) => void;
  onSeedsUsedChange: (transactionId: number, seedsUsed: number) => void;
  onCycleDelete: (cycleId: string) => void;
}

function Tooltip({ text, children }: { text: string; children: React.ReactNode }) {
  const [show, setShow] = React.useState(false);
  return (
    <span className="relative"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
      onFocus={() => setShow(true)}
      onBlur={() => setShow(false)}
      tabIndex={0}
      style={{ outline: 'none' }}
    >
      <span className="underline cursor-help">{children}</span>
      {show && (
        <span className="absolute z-10 left-1/2 -translate-x-1/2 mt-2 px-3 py-2 bg-gray-800 text-white text-xs rounded shadow-lg min-w-[200px] max-w-xs">
          {text.split('\n').map((line, i) => (
            <React.Fragment key={i}>
              {i > 0 && <br />}
              {line}
            </React.Fragment>
          ))}
        </span>
      )}
    </span>
  );
}

export default function CycleManager({ cycles, transactions, onCycleCreate, onSeedsUsedChange, onCycleDelete }: CycleManagerProps) {
  const [newCycleName, setNewCycleName] = React.useState("");
  const [editingCycleId, setEditingCycleId] = React.useState<string | null>(null);

  // Helper to generate a unique F-123 name
  function generateUniqueCycleName() {
    let name: string;
    let attempts = 0;
    do {
      const num = Math.floor(100 + Math.random() * 900); // 100-999
      name = `F-${num}`;
      attempts++;
    } while (cycles.some(c => c.name === name) && attempts < 1000);
    return name;
  }

  const handleCreateCycle = () => {
    const uniqueName = generateUniqueCycleName();
    const newCycle: Cycle = {
      id: Date.now().toString(),
      name: uniqueName,
      startTime: Date.now(),
      transactions: [],
      status: 'active',
    };
    onCycleCreate(newCycle);
    setEditingCycleId(newCycle.id); // Immediately allow renaming
  };

  const handleCycleNameChange = (cycleId: string, newName: string) => {
    // This will be handled in the parent if you want to persist the rename
    // For now, just update the local cycles state if needed
    setEditingCycleId(null);
    // You may want to add a callback to update the name in the parent cycles state
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
        <button
          onClick={handleCreateCycle}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Create Cycle
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {cycles.map((cycle) => {
          const summary = calculateCycleSummary(cycle.id);
          const buys = transactions.filter(t => t.cycleId === cycle.id && t.buy);
          return (
            <div key={cycle.id} className="p-4 border rounded shadow bg-white max-w-4xl w-full relative">
              <button
                className="absolute top-2 right-2 text-red-500 hover:text-red-700 font-bold text-lg bg-white rounded-full p-1 border border-red-200 hover:bg-red-50 transition"
                title="Delete cycle"
                onClick={() => {
                  if (window.confirm('Are you sure you want to delete this cycle? This action cannot be undone.')) {
                    onCycleDelete(cycle.id);
                  }
                }}
              >
                ×
              </button>
              {editingCycleId === cycle.id ? (
                <input
                  type="text"
                  value={cycle.name}
                  onChange={e => handleCycleNameChange(cycle.id, e.target.value)}
                  onBlur={() => setEditingCycleId(null)}
                  className="text-xl font-semibold mb-2 border-b border-gray-300 focus:outline-none focus:border-blue-500 bg-transparent"
                  autoFocus
                />
              ) : (
                <h3
                  className="text-xl font-semibold mb-2 cursor-pointer"
                  onClick={() => setEditingCycleId(cycle.id)}
                  title="Click to rename"
                >
                  {cycle.name}
                </h3>
              )}
              <div className="space-y-2 mb-4">
                <p>Status: <span className="font-medium">{cycle.status}</span></p>
                <p>Transactions: <span className="font-medium">{summary.count}</span></p>
                <p>
                  <Tooltip text={"Total profit using the full value of all seeds bought for this cycle.\n\nFormula: (Total Earned from Sells) - (Total Spent on All Seeds Bought)"}>
                    Profit (Total):
                  </Tooltip>
                  <span className={`font-medium ml-1 ${summary.totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>{summary.totalProfit.toLocaleString()} gp</span>
                </p>
                <p>
                  <Tooltip text={"Profit using only the cost of seeds actually used (not all bought).\n\nFormula: (Total Earned from Sells) - (Cost of Seeds Used)"}>
                    Profit (Used Seeds):
                  </Tooltip>
                  <span className={`font-medium ml-1 ${summary.profitUsedSeeds >= 0 ? 'text-green-600' : 'text-red-600'}`}>{summary.profitUsedSeeds.toLocaleString()} gp</span>
                </p>
                <p>
                  <Tooltip text={"Sum of all items sold in this cycle.\n\nFormula: Sum of Quantities from Sell Transactions"}>
                    Yield:
                  </Tooltip>
                  <span className="font-medium ml-1">{summary.totalYield}</span>
                </p>
                <p>
                  <Tooltip text={"Sum of 'Seeds Used' values you set for each buy transaction.\n\nFormula: Sum of Seeds Used (per Buy Transaction)"}>
                    Seeds Used:
                  </Tooltip>
                  <span className="font-medium ml-1">{summary.seedsUsed}</span>
                </p>
                <p>
                  <Tooltip text={"Yield divided by Seeds Used.\n\nFormula: Yield / Seeds Used"}>
                    Efficiency:
                  </Tooltip>
                  <span className="font-medium ml-1">{summary.efficiency.toFixed(2)}</span>
                </p>
              </div>
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