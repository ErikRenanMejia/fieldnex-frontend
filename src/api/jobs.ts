import { fetchAPI } from './client';

export type JobStatus = 'Active' | 'Pending' | 'On Hold' | 'Done';
export type Priority  = 'High' | 'Medium' | 'Low';

export interface Job {
  id: string;
  title: string;
  client: string;
  time: string;
  address: string;
  status: JobStatus;
  priority?: Priority;
  date?: string;
  contact?: string;
  phone?: string;
  system?: string;
  notes?: string;
}

export const getJobs       = ()                   => fetchAPI<Job[]>(`/jobs`);
export const getJobById    = (id: string)         => fetchAPI<Job>(`/jobs/${id}`);
export const createJob     = (data: Partial<Job>) => fetchAPI<Job>('/jobs', { method: 'POST', body: JSON.stringify(data) });
