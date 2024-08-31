import { Hono } from '@hono/hono';
import { parseTiles } from './parse.ts';
import { renderTiles } from './render.ts';
const app = new Hono();

function removeSuffix(s: string, suffix: string): string {
    if (s.endsWith(suffix)) {
        return s.slice(0, s.length - suffix.length);
    } else {
        return s;
    }
}

app.get('/', (c) => c.text('Hello, world!\n'));

app.get('/:pattern', async (c) => {
    const pattern = removeSuffix(c.req.param('pattern'), '.png');
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
