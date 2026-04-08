import { fetchAPI } from './client';
import type { AuthResponse } from '../types';

export async function loginUser(email: string, password: string): Promise<AuthResponse> {
  return fetchAPI<AuthResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}
