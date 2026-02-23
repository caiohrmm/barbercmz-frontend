import { z } from 'zod';

// Auth validators
export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
});

export type LoginInput = z.infer<typeof loginSchema>;

// Appointment validators (public page)
export const createAppointmentSchema = z.object({
  barbershopId: z.string().min(1, 'ID da barbearia é obrigatório'),
  barberId: z.string().min(1, 'ID do barbeiro é obrigatório'),
  serviceId: z.string().min(1, 'ID do serviço é obrigatório'),
  customerName: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres').max(100),
  customerPhone: z
    .string()
    .regex(/^\+?[1-9]\d{1,14}$/, 'Telefone deve estar no formato E.164 (ex: +5511999999999)'),
  startTime: z.string().datetime('Data/hora inválida'),
});

export type CreateAppointmentInput = z.infer<typeof createAppointmentSchema>;

// Barber validators
export const workingHoursSchema = z.object({
  dayOfWeek: z.number().int().min(0).max(6),
  startTime: z.string().regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, 'Formato inválido (HH:mm)'),
  endTime: z.string().regex(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, 'Formato inválido (HH:mm)'),
  isAvailable: z.boolean().default(true),
});

export const createBarberSchema = z.object({
  name: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres').max(100),
  workingHours: z.array(workingHoursSchema).optional().default([]),
});

export type CreateBarberInput = z.infer<typeof createBarberSchema>;

// Service validators
export const createServiceSchema = z.object({
  name: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres').max(100),
  duration: z.number().int().positive('Duração deve ser um número positivo').min(1),
  price: z.number().nonnegative('Preço deve ser não negativo').min(0),
});

export type CreateServiceInput = z.infer<typeof createServiceSchema>;

// Update schemas
export const updateBarberSchema = createBarberSchema.partial();
export const updateServiceSchema = createServiceSchema.partial();

export const updateAppointmentStatusSchema = z.object({
  status: z.enum(['scheduled', 'completed', 'cancelled', 'no_show']),
});

export type UpdateAppointmentStatusInput = z.infer<typeof updateAppointmentStatusSchema>;

