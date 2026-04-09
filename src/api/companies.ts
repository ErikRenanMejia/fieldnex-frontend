import { fetchAPI } from './client';

export interface Company {
  id: number;
  name: string;
  contactName?: string;
  email?: string;
  phone?: string;
  address?: string;
  notes?: string;
}

export const getCompanies   = ()                                => fetchAPI<Company[]>('/companies');
export const getCompanyById = (id: number)                      => fetchAPI<Company>(`/companies/${id}`);
export const createCompany  = (data: Partial<Company>)          => fetchAPI<Company>('/companies', { method: 'POST', body: JSON.stringify(data) });
export const updateCompany  = (id: number, data: Partial<Company>) => fetchAPI<Company>(`/companies/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
export const deleteCompany  = (id: number)                      => fetchAPI<void>(`/companies/${id}`, { method: 'DELETE' });
