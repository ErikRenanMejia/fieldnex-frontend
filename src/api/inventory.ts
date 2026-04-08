import { fetchAPI } from './client';

export type StockStatus = 'In Stock' | 'Low' | 'Out';

export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  qty: number;
  status: StockStatus;
  description: string;
  unit: string;
  location: string;
}

export const getInventory     = ()           => fetchAPI<InventoryItem[]>('/inventory');
export const getInventoryById = (id: string) => fetchAPI<InventoryItem>(`/inventory/${id}`);
