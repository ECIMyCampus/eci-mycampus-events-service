import { FastifyRequest, FastifyReply } from 'fastify';
import { eventsService } from '../services/events.service';
import { createEventSchema, radarQuerySchema } from '../schemas/events.schema';

export class EventsController {
  async getRadar(request: FastifyRequest, reply: FastifyReply) {
    const parseResult = radarQuerySchema.safeParse(request.query);
    if (!parseResult.success) {
      return reply.status(400).send({ error: 'Bad Request', issues: parseResult.error.format() });
    }

    try {
      const user = (request as any).user;
      const events = await eventsService.getRadarEvents(parseResult.data, user?.facultyId);
      return reply.status(200).send(events);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al consultar Radar';
      return reply.status(500).send({ error: 'Internal Server Error', message });
    }
  }

  async createEvent(request: FastifyRequest, reply: FastifyReply) {
    const parseResult = createEventSchema.safeParse(request.body);
    if (!parseResult.success) {
      return reply.status(422).send({ error: 'Unprocessable Entity', issues: parseResult.error.format() });
    }

    try {
      const user = (request as any).user || { id: 'mock-user-id', fullName: 'Usuario Prueba', isAuthorizedOrganizer: false };
      const event = await eventsService.createEvent(
        parseResult.data,
        user.id,
        user.fullName,
        user.isAuthorizedOrganizer
      );
      return reply.status(201).send(event);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al crear evento';
      return reply.status(400).send({ error: 'Bad Request', message });
    }
  }

  async registerToEvent(request: FastifyRequest, reply: FastifyReply) {
    const { id } = request.params as { id: string };
    const user = (request as any).user || { id: 'mock-user-id' };

    try {
      const registration = await eventsService.reserveSeatAtomic(id, user.id);
      return reply.status(200).send({
        message: 'Inscripción confirmada exitosamente',
        registration,
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al reservar cupo';
      return reply.status(409).send({ error: 'Conflict', message });
    }
  }
}

export const eventsController = new EventsController();
