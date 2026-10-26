import { prisma } from '../lib/prisma';
import { CreateEventInput, RadarQueryParams } from '../schemas/events.schema';

export class EventsService {
  /**
   * Consulta el Radar de eventos activo, clasificando en vivo y próximos con regla de desempate RN-007
   */
  async getRadarEvents(params: RadarQueryParams, userFacultyId?: string) {
    const now = new Date();

    const events = await prisma.event.findMany({
      where: {
        status: 'PUBLICADO',
        endTime: { gte: now }, // Eventos activos o que no han concluido
        ...(params.category ? { category: params.category as any } : {}),
        ...(params.facultyId ? { facultyId: params.facultyId } : {}),
      },
      include: {
        _count: {
          select: { registrations: true, favorites: true },
        },
      },
      orderBy: [
        { startTime: 'asc' },
        { title: 'asc' },
      ],
      take: params.limit,
    });

    // Clasificación temporal al vuelo
    return events.map((event) => {
      const isLive = now >= event.startTime && now <= event.endTime;
      const temporalStatus = isLive ? 'EN_CURSO' : now < event.startTime ? 'PROXIMO' : 'FINALIZADO';

      return {
        ...event,
        temporalStatus,
        isLive,
        registrationsCount: event._count.registrations,
        favoritesCount: event._count.favorites,
      };
    });
  }

  /**
   * Reserva atómica de cupo con cláusula de guarda en SQL para prevenir sobrecupo concurrente (RF-INS-01, RN-005)
   */
  async reserveSeatAtomic(eventId: string, userId: string) {
    return await prisma.$transaction(async (tx) => {
      // 1. Verificar si ya existe registro activo
      const existing = await tx.eventRegistration.findUnique({
        where: {
          eventId_userId: { eventId, userId },
        },
      });

      if (existing && existing.status === 'CONFIRMADA') {
        throw new Error('Ya tienes una inscripción confirmada para este evento.');
      }

      // 2. Decremento atómico directo en SQL
      const updateCount = await tx.$executeRaw`
        UPDATE events_schema.events
        SET available_capacity = available_capacity - 1,
            updated_at = NOW()
        WHERE id = ${eventId}::uuid
          AND status = 'PUBLICADO'
          AND available_capacity > 0;
      `;

      if (updateCount === 0) {
        throw new Error('Lo sentimos, los cupos para este evento acaban de agotarse.');
      }

      // 3. Crear o actualizar la inscripción
      const registration = await tx.eventRegistration.upsert({
        where: {
          eventId_userId: { eventId, userId },
        },
        create: {
          eventId,
          userId,
          status: 'CONFIRMADA',
        },
        update: {
          status: 'CONFIRMADA',
          cancelledAt: null,
          registeredAt: new Date(),
        },
      });

      return registration;
    });
  }

  /**
   * Creación de un nuevo evento con cálculo de horas y aforos
   */
  async createEvent(input: CreateEventInput, creatorId: string, creatorName: string, isAuthorized: boolean) {
    const startTime = new Date(input.startTime);
    const endTime = new Date(input.endTime);

    if (endTime <= startTime) {
      throw new Error('La fecha de finalización debe ser posterior a la fecha de inicio.');
    }

    const status = isAuthorized ? 'PUBLICADO' : 'PENDIENTE_APROBACION';

    return await prisma.event.create({
      data: {
        title: input.title,
        description: input.description,
        category: input.category,
        facultyId: input.facultyId,
        organizerId: creatorId,
        organizerName: creatorName,
        buildingId: input.buildingId,
        specificLocation: input.specificLocation,
        startTime,
        endTime,
        originalEndTime: endTime,
        status,
        isPublic: input.isPublic,
        requiresRegistration: input.requiresRegistration,
        maxCapacity: input.maxCapacity,
        availableCapacity: input.maxCapacity,
        price: input.price,
        imageUrl: input.imageUrl,
      },
    });
  }
}

export const eventsService = new EventsService();
