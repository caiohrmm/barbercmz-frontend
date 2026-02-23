export type UserRole = 'owner' | 'barber';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  barbershopId: string;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}

export interface Barbershop {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string;
  planId?: string;
  maxBarbers: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Barber {
  id: string;
  name: string;
  workingHours: WorkingHours[];
  barbershopId: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface WorkingHours {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

export interface Service {
  id: string;
  name: string;
  duration: number;
  price: number;
  barbershopId: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  noShowCount: number;
  blocked: boolean;
  barbershopId: string;
  createdAt: string;
  updatedAt: string;
}

export type AppointmentStatus = 'scheduled' | 'completed' | 'cancelled' | 'no_show';

export interface Appointment {
  id: string;
  barbershopId: string;
  barberId: string;
  serviceId: string;
  customerId: string;
  startTime: string;
  endTime: string;
  status: AppointmentStatus;
  createdAt: string;
  updatedAt: string;
  barber?: { id: string; name: string };
  service?: { id: string; name: string; duration: number; price: number };
  customer?: { id: string; name: string; phone: string };
}

export interface ApiError {
  error: string;
  message?: string;
  details?: unknown;
}

