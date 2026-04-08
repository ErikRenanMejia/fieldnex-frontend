import { fetchAPI } from './client';

export const getCustomers    = ()                        => fetchAPI<unknown[]>('/customers');
export const getCustomer     = (id: number)              => fetchAPI<unknown>(`/customers/${id}`);
export const createCustomer  = (data: unknown)           => fetchAPI<unknown>('/customers',          { method: 'POST',  body: JSON.stringify(data) });
export const updateCustomer  = (id: number, data: unknown) => fetchAPI<unknown>(`/customers/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
export const deleteCustomer  = (id: number)              => fetchAPI<unknown>(`/customers/${id}`,    { method: 'DELETE' });
