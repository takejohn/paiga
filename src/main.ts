import { Hono } from '@hono/hono';
import { parseTiles } from './parse.ts';
import { renderTiles } from './render.ts';
const app = new Hono();

app.get('/', (c) => c.text('Hello, world!\n'));

app.get('/:pattern', async (c) => {
    const pattern = c.req.param('pattern');
    const tiles = parseTiles(pattern);
    const image = renderTiles(tiles);
    const png = await image.encode();
    c.header('Content-Type', 'image/png');
    return c.body(png);
});

app.onError((err, c) => {
    return c.text('Error: ' + err.message);
});

export default app;
