import { z } from 'zod';

export const createEventSchema = z.object({
  title: z.string().min(5, 'El título debe tener al menos 5 caracteres').max(150),
  description: z.string().min(10, 'La descripción debe tener al menos 10 caracteres'),
  category: z.enum(['ACADEMICO', 'DEPORTIVO', 'CULTURAL', 'ESTUDIANTIL', 'INSTITUCIONAL', 'BIENESTAR']),
  facultyId: z.string().uuid().optional(),
  buildingId: z.string().min(1, 'El edificio es obligatorio'),
  specificLocation: z.string().min(2, 'La ubicación específica (salón/piso) es obligatoria'),
  startTime: z.string().datetime('Fecha de inicio no válida'),
  endTime: z.string().datetime('Fecha de finalización no válida'),
  isPublic: z.boolean().default(true),
  requiresRegistration: z.boolean().default(false),
  maxCapacity: z.number().int().positive().optional(),
  price: z.number().nonnegative().default(0.0),
  imageUrl: z.string().url().optional(),
});

export const radarQuerySchema = z.object({
  facultyId: z.string().optional(),
  category: z.string().optional(),
  date: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export const reserveSeatSchema = z.object({
  eventId: z.string().uuid('ID de evento no válido'),
});

export const reportEventSchema = z.object({
  eventId: z.string().uuid('ID de evento no válido'),
  reason: z.string().min(5, 'El motivo de la denuncia debe tener al menos 5 caracteres'),
  description: z.string().optional(),
});

export type CreateEventInput = z.infer<typeof createEventSchema>;
export type RadarQueryParams = z.infer<typeof radarQuerySchema>;
export type ReserveSeatInput = z.infer<typeof reserveSeatSchema>;
export type ReportEventInput = z.infer<typeof reportEventSchema>;
