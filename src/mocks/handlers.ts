// src/mocks/handlers.ts
import { rest } from 'msw';

export const handlers = [
  rest.get('/api/tasks', (_req, res, ctx) => {
    return res(ctx.status(500), ctx.json({ message: 'Internal Server Error' }));
  }),
];
