import { assertEquals} from '@std/assert';
import { parseTiles } from '../src/parse.ts';

Deno.test('parse', async (t) => {
    await t.step('123m456p789s123z', () => {
        assertEquals(parseTiles('123m456p789s123z'), {
            hand: [
                '1m',
                '2m',
                '3m',
                '4p',
                '5p',
                '6p',
                '7s',
                '8s',
                '9s',
                '1z',
                '2z',
                '3z',
            ],
        });
    });

    await t.step('1112345678999m', () => {
        assertEquals(parseTiles('1112345678999m'), {
            hand: [
                '1m',
                '1m',
                '1m',
                '2m',
                '3m',
                '4m',
                '5m',
                '6m',
                '7m',
                '8m',
                '9m',
                '9m',
                '9m',
            ],
        });
    });
});
