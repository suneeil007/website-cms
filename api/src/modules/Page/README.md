# Page Module

API prefix: `/api/v1/page`

## Files

- `page.routes.js`: Express endpoints
- `page.controller.js`: HTTP handling
- `page.service.js`: Business logic
- `page.repository.js`: Prisma database access
- `page.validation.js`: Zod validation
- `page.constants.js`: Module constants

## Setup required

1. Add the `Page` model to `prisma/schema.prisma`.
2. Include a unique `uuid` field and a `createdAt` field.
3. Add real Zod validation fields in `page.validation.js`.
4. Run a Prisma migration and regenerate Prisma Client.

The module routes are discovered automatically by the central API router.
Do not expose these CRUD endpoints publicly until authentication,
authorization, and field validation are configured.
