import { FastifyInstance } from 'fastify';
import { eventsController } from '../controllers/events.controller';

export async function eventsRoutes(fastify: FastifyInstance) {
  fastify.get('/radar', eventsController.getRadar.bind(eventsController));
  fastify.post('/', eventsController.createEvent.bind(eventsController));
  fastify.post('/:id/register', eventsController.registerToEvent.bind(eventsController));
}
