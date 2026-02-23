import api, { clearAccessToken, getAccessToken as getToken, setAccessToken } from './api';
import { AuthResponse, User } from '@/types';
import { loginSchema, type LoginInput } from './validators';

/**
 * Decode JWT token to extract payload
 * Note: This is for UX only, never trust this for security
 */
export const decodeToken = (token: string): User | null => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );

    const payload = JSON.parse(jsonPayload);
    return {
      id: payload.userId,
      email: payload.email,
      role: payload.role,
      barbershopId: payload.barbershopId,
      name: payload.name || '',
    };
  } catch (error) {
    return null;
  }
};

/**
 * Login user
 */
export const login = async (credentials: LoginInput): Promise<AuthResponse> => {
  const validated = loginSchema.parse(credentials);

  const response = await api.post<AuthResponse>('/auth/login', validated);

  // Store access token in memory
  setAccessToken(response.data.accessToken);

  return response.data;
};

/**
 * Logout user
 */
export const logout = async (): Promise<void> => {
  try {
    await api.post('/auth/logout');
  } catch (error) {
    // Continue even if logout fails
    console.error('Logout error:', error);
  } finally {
    // Clear token from memory
    clearAccessToken();
  }
};

/**
 * Get current user from token
 */
export const getCurrentUser = (): User | null => {
  const token = getToken();
  if (!token) return null;
  return decodeToken(token);
};

