import Fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import dotenv from 'dotenv';

dotenv.config();

const server = Fastify({
  logger: true,
});

server.register(cors, {
  origin: true,
});

server.register(jwt, {
  secret: process.env.JWT_SECRET || 'super_secret_jwt_key_for_eci_mycampus_4001',
});

// Health check
server.get('/health', async () => {
  return { status: 'ok', service: 'events-service', timestamp: new Date().toISOString() };
});

// Radar de eventos en vivo y próximos
server.get('/api/v1/events/radar', async (request, reply) => {
  return reply.status(501).send({ message: 'Ruta en implementación - Etapa 4' });
});

// Creación de eventos
server.post('/api/v1/events', async (request, reply) => {
  return reply.status(501).send({ message: 'Ruta en implementación - Etapa 4' });
});

// Inscripción a eventos
server.post('/api/v1/events/:id/register', async (request, reply) => {
  return reply.status(501).send({ message: 'Ruta en implementación - Etapa 4' });
});

const start = async () => {
  try {
    const port = Number(process.env.PORT) || 4003;
    await server.listen({ port, host: '0.0.0.0' });
    console.log(`[events-service] Escuchando en http://localhost:${port}`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start();
