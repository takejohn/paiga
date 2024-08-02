import { TileNumber, HonorNumber, TileSet, Tile } from './types.ts';

function isHonorNumber(n: TileNumber): n is HonorNumber {
    return n == '1' || n == '2' || n == '3' || n == '4' || n == '5' || n == '6' || n == '7';
}

export function parseTiles(pattern: string): TileSet {
    const numbers: TileNumber[] = [];
    const hand: Tile[] = [];

    for (const c of pattern) {
        switch (c) {
            case '1':
            case '2':
            case '3':
            case '4':
            case '5':
            case '6':
            case '7':
            case '8':
            case '9':
            case '0':
                numbers.push(c);
                break;

            case 'm':
            case 'p':
            case 's':
                for (const n of numbers) {
                    hand.push(`${n}${c}`);
                }
                numbers.splice(0);
                break;

            case 'z':
                if (!numbers.every(isHonorNumber)) {
                    throw new TypeError('Unexpected \'z\' because of leading numbers');
                }
                for (const n of numbers) {
                    hand.push(`${n}z`);
                }
                numbers.splice(0);
                break;

            default:
                throw new TypeError(`Unexpected character '${c}'`);
        }
    }

    if (numbers.length != 0) {
        throw new TypeError('Cannot end with a number');
    }

    return {
        hand,
    };
}
