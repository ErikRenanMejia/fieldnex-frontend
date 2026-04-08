import { fetchAPI } from './client';

export interface CheckItem {
  id: string;
  label: string;
  required: boolean;
}

export interface WorkOrder {
  id: string;
  title: string;
  client: string;
  tech: string;
  status: string;
  items: CheckItem[];
}

export const getWorkOrders         = ()                               => fetchAPI<WorkOrder[]>('/work-orders');
export const getWorkOrderById      = (id: string)                     => fetchAPI<WorkOrder>(`/work-orders/${id}`);
export const updateWorkOrderStatus = (id: string, status: string)     =>
  fetchAPI<WorkOrder>(`/work-orders/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
