import { fetchAPI } from './client';

export interface Vehicle {
  id: number;
  plate: string;
  model: string;
  technicianId?: number;
  status: 'active' | 'inactive' | 'maintenance';
}

export interface VehicleLog {
  id: number;
  vehicleId: number;
  technicianId: number;
  date: string;
  km: number;
  notes?: string;
}

export const getVehicles    = ()                                      => fetchAPI<Vehicle[]>('/vehicles');
export const getVehicleById = (id: number)                            => fetchAPI<Vehicle>(`/vehicles/${id}`);
export const getVehicleLogs = (id: number)                            => fetchAPI<VehicleLog[]>(`/vehicles/${id}/logs`);
export const createVehicle  = (data: Partial<Vehicle>)                => fetchAPI<Vehicle>('/vehicles', { method: 'POST', body: JSON.stringify(data) });
export const updateVehicle  = (id: number, data: Partial<Vehicle>)    => fetchAPI<Vehicle>(`/vehicles/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
export const addVehicleLog  = (id: number, data: Partial<VehicleLog>) => fetchAPI<VehicleLog>(`/vehicles/${id}/logs`, { method: 'POST', body: JSON.stringify(data) });
