import { fetchAPI } from './client';

export type StockStatus = 'In Stock' | 'Low' | 'Out';

export interface InventoryItem {
  id: string;
  name: string;
  // Backend fields
  companyId?: number;
  sku?: string;
  description?: string;
  quantity?: number;
  minStock?: number;
  unit?: string;
  locationId?: number;
  isActive?: boolean;
  // Display fields (may come from backend or computed)
  category?: string;
  qty?: number;
  status?: StockStatus;
  location?: string;
}

export interface CreateInventoryPayload {
  name: string;
  companyId: number;
  sku: string;
  description?: string;
  quantity?: number;
  minStock?: number;
  unit?: string;
  locationId?: number;
  isActive?: boolean;
}

export const getInventory        = ()                                         => fetchAPI<InventoryItem[]>('/inventory');
export const getInventoryById    = (id: string)                               => fetchAPI<InventoryItem>(`/inventory/${id}`);
export const createInventoryItem = (data: CreateInventoryPayload)             => fetchAPI<InventoryItem>('/inventory', { method: 'POST', body: JSON.stringify(data) });
export const updateInventoryItem = (id: string, data: Partial<InventoryItem>) => fetchAPI<InventoryItem>(`/inventory/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
export const deleteInventoryItem = (id: string)                               => fetchAPI<void>(`/inventory/${id}`, { method: 'DELETE' });
