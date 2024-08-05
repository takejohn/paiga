import { assertEquals } from '@std/assert';
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
            horaTile: null,
            fuuro: [],
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
            horaTile: null,
            fuuro: [],
        });
    });

    await t.step('34567m456p22678s+4m', () => {
        assertEquals(parseTiles('34567m456p22678s+4m'), {
            hand: [
                '3m',
                '4m',
                '5m',
                '6m',
                '7m',
                '4p',
                '5p',
                '6p',
                '2s',
                '2s',
                '6s',
                '7s',
                '8s',
            ],
            horaTile: '4m',
            fuuro: [],
        });
    });

    await t.step('3z+3z_11_z3-12m55=55z999-s', () => {
        assertEquals(parseTiles('3z+3z_11_z3-12m55=55z999-s'), {
            hand: ['3z'],
            horaTile: '3z',
            fuuro: [
                {
                    type: 'ankan',
                    tiles: ['1z', '1z'],
                },
                {
                    type: 'minmentsu',
                    called: '3m',
                    kakan: null,
                    left: [],
                    right: ['1m', '2m'],
                },
                {
                    type: 'minmentsu',
                    called: '5z',
                    kakan: '5z',
                    left: ['5z'],
                    right: ['5z'],
                },
                {
                    type: 'minmentsu',
                    called: '9s',
                    kakan: null,
                    left: ['9s', '9s'],
                    right: [],
                },
            ],
        });
    });
});
