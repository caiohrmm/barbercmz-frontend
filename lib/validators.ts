import { z } from 'zod';

// Auth validators
export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
});

export type LoginInput = z.infer<typeof loginSchema>;

// Create barbershop (wizard)
const slugRegex = /^[a-z0-9-]+$/;
export const createBarbershopStep1Schema = z.object({
  name: z
    .string()
    .min(3, 'Nome deve ter no mínimo 3 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres'),
  slug: z
    .string()
    .max(50, 'Máximo 50 caracteres')
    .regex(slugRegex, 'Apenas letras minúsculas, números e hífens')
    .optional()
    .or(z.literal('')),
});
export const createBarbershopStep2Schema = z
  .object({
    ownerName: z
      .string()
      .min(3, 'Nome deve ter no mínimo 3 caracteres')
      .max(100, 'Nome deve ter no máximo 100 caracteres'),
    ownerEmail: z.string().email('Email inválido'),
    ownerPassword: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
    ownerPasswordConfirm: z.string().min(1, 'Confirme a senha'),
  })
  .refine((data) => data.ownerPassword === data.ownerPasswordConfirm, {
    message: 'As senhas não coincidem',
    path: ['ownerPasswordConfirm'],
  });
export type CreateBarbershopStep1Input = z.infer<typeof createBarbershopStep1Schema>;
export type CreateBarbershopStep2Input = z.infer<typeof createBarbershopStep2Schema>;

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

// Booking form (step 3: only name + phone; phone normalized to E.164)
const e164Regex = /^\+?[1-9]\d{1,14}$/;
export const bookingCustomerSchema = z.object({
  customerName: z
    .string()
    .min(2, 'Nome deve ter no mínimo 2 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres'),
  customerPhone: z
    .string()
    .min(1, 'Telefone é obrigatório')
    .transform((val) => {
      const digits = val.replace(/\D/g, '');
      if (digits.length === 11 && digits.startsWith('1')) return `+55${digits}`;
      if (digits.length === 13 && digits.startsWith('55')) return `+${digits}`;
      return val;
    })
    .refine((val) => e164Regex.test(val), {
      message: 'Use o formato com DDD, ex: (11) 99999-9999 ou +5511999999999',
    }),
});

export type BookingCustomerInput = z.infer<typeof bookingCustomerSchema>;

// Barber validators
const timeRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/;

function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

export const workingHoursSchema = z
  .object({
    dayOfWeek: z.number().int().min(0).max(6),
    startTime: z.string().regex(timeRegex, 'Formato inválido (HH:mm)'),
    endTime: z.string().regex(timeRegex, 'Formato inválido (HH:mm)'),
    lunchStartTime: z
      .union([z.string().regex(timeRegex, 'Formato inválido (HH:mm)'), z.literal('')])
      .optional(),
    lunchEndTime: z
      .union([z.string().regex(timeRegex, 'Formato inválido (HH:mm)'), z.literal('')])
      .optional(),
    isAvailable: z.boolean().default(true),
  })
  .refine(
    (data) => {
      const startMin = timeToMinutes(data.startTime);
      const endMin = timeToMinutes(data.endTime);
      return endMin > startMin;
    },
    { message: 'Fim deve ser depois do início', path: ['endTime'] }
  )
  .refine(
    (data) => {
      const hasStart = data.lunchStartTime != null && data.lunchStartTime !== '';
      const hasEnd = data.lunchEndTime != null && data.lunchEndTime !== '';
      if (!hasStart && !hasEnd) return true;
      if (hasStart !== hasEnd) return false;
      const startMin = timeToMinutes(data.startTime);
      const endMin = timeToMinutes(data.endTime);
      const lunchStart = timeToMinutes(data.lunchStartTime!);
      const lunchEnd = timeToMinutes(data.lunchEndTime!);
      return lunchEnd > lunchStart && lunchStart >= startMin && lunchEnd <= endMin;
    },
    {
      message: 'Almoço: informe início e fim; deve estar dentro do expediente',
      path: ['lunchEndTime'],
    }
  );

const dateOnlyRegex = /^\d{4}-\d{2}-\d{2}$/;

export const createBarberSchema = z.object({
  name: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres').max(100),
  workingHours: z.array(workingHoursSchema).optional().default([]),
  unavailableDates: z.array(z.string().regex(dateOnlyRegex, 'Data inválida (YYYY-MM-DD)')).optional().default([]),
});

export type CreateBarberInput = z.infer<typeof createBarberSchema>;

/** Tipo do formulário de barbeiro (workingHours sempre definido, para useForm) */
export type BarberFormValues = {
  name: string;
  workingHours: Array<{
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    lunchStartTime?: string;
    lunchEndTime?: string;
    isAvailable: boolean;
  }>;
  unavailableDates: string[];
};

// Service validators
export const createServiceSchema = z.object({
  name: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres').max(100),
  duration: z.number().int().positive('Duração deve ser um número positivo').min(1),
  price: z.number().nonnegative('Preço deve ser não negativo').min(0),
});

export type CreateServiceInput = z.infer<typeof createServiceSchema>;

// Update schemas
export const updateBarberSchema = createBarberSchema.partial();
export const updateServiceSchema = createServiceSchema
  .partial()
  .extend({ active: z.boolean().optional() });

export const updateAppointmentStatusSchema = z.object({
  status: z.enum(['scheduled', 'completed', 'cancelled', 'no_show']),
});

export type UpdateAppointmentStatusInput = z.infer<typeof updateAppointmentStatusSchema>;

