# ECI-MyCampus — Microservicio de Eventos & Radar (Events Service)

Microservicio central responsable del radar de eventos en vivo, cálculo de estados temporales, máquina de estados de aprobación/moderación, control transaccional de cupos concurrentes y envío de notificaciones.

## Tecnologías
* **Runtime:** Node.js / TypeScript
* **Framework HTTP:** Fastify
* **ORM:** Prisma ORM
* **Base de Datos:** PostgreSQL (`events_schema`)
* **Correos Transaccionales:** Resend API

## Endpoints Principales
* `GET /health`: Comprobación de estado del servicio.
* `GET /api/v1/events/radar`: Feed de eventos en vivo y próximos con filtros por facultad y categoría.
* `POST /api/v1/events`: Solicitud o publicación directa de un evento.
* `POST /api/v1/events/:id/register`: Inscripción atómica con control de cupos (bloqueo transaccional).
* `PATCH /api/v1/events/:id/approve`: Aprobación o rechazo por parte de moderadores.
* `POST /api/v1/events/:id/reports`: Denuncias y reportes comunitarios.

## Ejecución Local
```bash
npm install
npm run dev
```
Inicia en `http://localhost:4003`.
