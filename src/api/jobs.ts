import { fetchAPI } from './client';

export type JobStatus = 'Active' | 'Pending' | 'On Hold' | 'Done';
export type Priority  = 'High' | 'Medium' | 'Low';

export interface Job {
  id: string;
  title: string;
  // Backend fields
  companyId?: number;
  customerId?: number;
  technicianId?: number;
  description?: string;
  status: JobStatus;
  priority?: Priority;
  location?: string;
  scheduledAt?: string;
  isActive?: boolean;
  // Computed / display fields (may come from backend joins)
  client: string;
  time: string;
  address: string;
  date?: string;
  contact?: string;
  phone?: string;
  system?: string;
  notes?: string;
  technicianName?: string;
}

export interface CreateJobPayload {
  title: string;
  companyId: number;
  customerId: number;
  technicianId?: number;
  description?: string;
  status?: string;
  priority?: string;
  location?: string;
  scheduledAt?: string;
  isActive?: boolean;
}

export const getJobs    = ()                                   => fetchAPI<Job[]>('/jobs');
export const getJobById = (id: string)                         => fetchAPI<Job>(`/jobs/${id}`);
export const createJob  = (data: CreateJobPayload)             => fetchAPI<Job>('/jobs', { method: 'POST', body: JSON.stringify(data) });
export const updateJob  = (id: string, data: Partial<Job>)     => fetchAPI<Job>(`/jobs/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
export const deleteJob  = (id: string)                         => fetchAPI<void>(`/jobs/${id}`, { method: 'DELETE' });
export const assignJob  = (id: string, technicianId: number)   => fetchAPI<Job>(`/jobs/${id}/assign`, { method: 'PATCH', body: JSON.stringify({ technicianId }) });
