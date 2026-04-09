import { fetchAPI } from './client';

export interface Technician {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: string;
  isActive: boolean;
  companyId?: number;
  specialties?: string[];
  avatarUrl?: string;
}

export const getTechnicians    = ()                                              => fetchAPI<Technician[]>('/technicians');
export const getTechnicianById = (id: number)                                    => fetchAPI<Technician>(`/technicians/${id}`);
export const createTechnician  = (data: Partial<Technician> & { password?: string }) => fetchAPI<Technician>('/technicians', { method: 'POST', body: JSON.stringify(data) });
export const updateTechnician  = (id: number, data: Partial<Technician>)         => fetchAPI<Technician>(`/technicians/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
export const deleteTechnician  = (id: number)                                    => fetchAPI<void>(`/technicians/${id}`, { method: 'DELETE' });
