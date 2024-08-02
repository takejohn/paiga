import { Hono } from '@hono/hono';
const app = new Hono();

app.get('/', (c) => c.text('Hello, world!\n'));

export default app;
