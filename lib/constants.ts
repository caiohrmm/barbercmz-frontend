/** API base URL. No deploy (Vercel), use NEXT_PUBLIC_API_URL ou este fallback em produção. */
export const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  (process.env.NODE_ENV === 'production' ? 'https://barbercmz.onrender.com/' : 'http://localhost:4000/');

export const ROUTES = {
  HOME: '/',
  PLANOS: '/planos',
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  DASHBOARD_AGENDA: '/dashboard/agenda',
  DASHBOARD_SERVICES: '/dashboard/services',
  DASHBOARD_CLIENTS: '/dashboard/clients',
  DASHBOARD_BILLING: '/dashboard/billing',
  DASHBOARD_BILLING_PLAN: '/dashboard/billing/plan',
  DASHBOARD_BARBERS: '/dashboard/barbers',
  DASHBOARD_SETTINGS: '/dashboard/settings',
  DASHBOARD_MENU: '/dashboard/menu',
} as const;

export const USER_ROLES = {
  OWNER: 'owner',
  BARBER: 'barber',
} as const;

export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];

