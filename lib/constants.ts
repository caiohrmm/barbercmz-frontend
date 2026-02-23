export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  DASHBOARD_AGENDA: '/dashboard/agenda',
  DASHBOARD_SERVICES: '/dashboard/services',
  DASHBOARD_CLIENTS: '/dashboard/clients',
  DASHBOARD_BILLING: '/dashboard/billing',
  DASHBOARD_SETTINGS: '/dashboard/settings',
} as const;

export const USER_ROLES = {
  OWNER: 'owner',
  BARBER: 'barber',
} as const;

export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];

