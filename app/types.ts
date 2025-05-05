export interface Transaction {
  buy: boolean;
  itemId: number;
  quantity: number;
  price: number;
  time: number;
  cycleId?: string; // Optional reference to which cycle this transaction belongs to
}

export interface ItemMapping {
  id: number;
  name: string;
}

export interface Cycle {
  id: string;
  name: string;
  startTime: number;
  endTime?: number;
  transactions: Transaction[];
  status: 'active' | 'completed';
  summary?: {
    totalProfit: number;
    totalYield: number;
    seedsUsed: number;
  };
} 