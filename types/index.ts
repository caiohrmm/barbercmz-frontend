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

export interface Plan {
  id: string;
  name: string;
  priceMonthly: number;
  maxBarbers: number;
  features: string[];
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export type SubscriptionStatus = 'active' | 'suspended' | 'cancelled' | 'trial';

export interface SubscriptionPlan {
  id: string;
  name: string;
  priceMonthly: number;
  maxBarbers: number;
  features: string[];
}

export interface CurrentSubscription {
  id: string;
  status: SubscriptionStatus;
  trialEndsAt: string | null;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  plan: SubscriptionPlan;
}

export interface SubscriptionMeResponse {
  subscription: CurrentSubscription | null;
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
  /** Datas em que não atende (feriados, folga). Formato YYYY-MM-DD */
  unavailableDates?: string[];
  barbershopId: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface WorkingHours {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  /** Optional lunch break (barber unavailable in this interval) */
  lunchStartTime?: string;
  lunchEndTime?: string;
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

export type PaymentStatus = 'paid' | 'pending' | 'failed' | 'refunded';
export type PaymentMethod = 'pix' | 'card' | 'boleto';

export interface Payment {
  id: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  paymentMethod: PaymentMethod;
  paidAt: string | null;
  createdAt: string;
}

export interface ApiError {
  error: string;
  message?: string;
  details?: unknown;
}

