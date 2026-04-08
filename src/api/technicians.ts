import { fetchAPI } from './client';

export const getTechnicians   = ()                         => fetchAPI<unknown[]>('/technicians');
export const getTechnician    = (id: number)               => fetchAPI<unknown>(`/technicians/${id}`);
export const createTechnician = (data: unknown)            => fetchAPI<unknown>('/technicians',          { method: 'POST',  body: JSON.stringify(data) });
export const updateTechnician = (id: number, data: unknown) => fetchAPI<unknown>(`/technicians/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
export const deleteTechnician = (id: number)               => fetchAPI<unknown>(`/technicians/${id}`,    { method: 'DELETE' });
