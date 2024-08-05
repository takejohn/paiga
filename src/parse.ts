import {
    Ankan,
    Fuuro,
    HonorNumber,
    Minmentsu,
    Suit,
    Tile,
    TileNumber,
    TileSet,
} from './types.ts';

function isHonorNumber(n: string): n is HonorNumber {
    return n == '1' || n == '2' || n == '3' || n == '4' || n == '5' ||
        n == '6' || n == '7';
}

function isTileNumber(n: string): n is TileNumber {
    return isHonorNumber(n) || n == '8' || n == '9' || n == '0';
}

function isSuit(c: string): c is Suit {
    return c == 'm' || c == 'p' || c == 's';
}

function isSuitOrZ(c: string): c is Suit | 'z' {
    return isSuit(c) || c == 'z';
}

function createTile(n: string, suit: string): Tile {
    if (isSuit(suit)) {
        if (!isTileNumber(n)) {
            throw new TypeError(`'${n}' is not tile number`);
        }
        return `${n}${suit}`;
    }
    if (suit == 'z') {
        if (!isHonorNumber(n)) {
            throw new TypeError(`'${n}' is not an honor number`);
        }
        return `${n}z`;
    }
    throw new TypeError(`Unexpected character '${suit}'`);
}

class CharStream {
    private readonly chars: string[];

    constructor(s: string) {
        this.chars = s.split('');
    }

    get length() {
        return this.chars.length;
    }

    peek(i = 0): string {
        const c = this.chars.at(i)!;
        if (c == null) {
            throw new RangeError(`Index ${i} out of bound ${this.length}`);
        }
        return c;
    }

    read(): string;
    read(length: number): string[];
    read(length?: number): string | string[] {
        if (length == null) {
            const c = this.chars.shift();
            if (c == null) {
                throw new RangeError(`Cannot read more`);
            }
            return c;
        } else {
            return this.chars.splice(0, length);
        }
    }

    expect(s: string): void {
        const expected = s.split('');
        const length = expected.length;
        const actual = this.read(length);
        for (let i = 0; i < length; i++) {
            if (expected[i] != actual[i]) {
                throw new TypeError(`Unexpected character ${actual[i]}`);
            }
        }
    }
}

class Parser {
    private readonly chars: CharStream;

    constructor(pattern: string) {
        this.chars = new CharStream(pattern);
    }

    // Pattern = Hand ["+" [HoraTile] *(Fuuro)]
    parse(): TileSet {
        const hand = this.parseHand();

        if (this.chars.length == 0) {
            return {
                hand,
                horaTile: null,
                fuuro: [],
            };
        }
        this.chars.expect('+');

        let horaTile: Tile | null;
        if (this.chars.length >= 2 && isSuitOrZ(this.chars.peek(1))) {
            horaTile = this.parseHoraTile();
        } else {
            horaTile = null;
        }

        const fuuroArray: Fuuro[] = [];

        while (this.chars.length > 0) {
            const fuuro = this.parseFuuro();
            fuuroArray.push(fuuro);
        }

        return {
            hand,
            horaTile: horaTile,
            fuuro: fuuroArray,
        };
    }

    // Hand = 1*(1*Number Suit)
    private parseHand(): TileSet['hand'] {
        const numbers: TileNumber[] = [];
        const hand: Tile[] = [];

        while (this.chars.length > 0) {
            const c = this.chars.peek();
            if (isTileNumber(c)) {
                this.chars.read();
                numbers.push(c);
            } else if (isSuitOrZ(c)) {
                this.chars.read();
                if (numbers.length == 0) {
                    throw new TypeError(`Unexpected character '${c}'`);
                }
                for (const n of numbers) {
                    hand.push(createTile(n, c));
                }
                numbers.splice(0);
            } else {
                break;
            }
        }

        if (numbers.length != 0) {
            throw new TypeError('Cannot end the hand with a number');
        }

        return hand;
    }

    // HoraTile = Number Suit
    private parseHoraTile(): TileSet['horaTile'] {
        return createTile(this.chars.read(), this.chars.read());
    }

    // Fuuro = Minmentsu / Ankan
    private parseFuuro(): Fuuro {
        const c = this.chars.peek();
        if (isTileNumber(c)) {
            return this.parseMinmentsu();
        }
        if (c == '_') {
            return this.parseAnkan();
        }
        throw new TypeError(`Unexpected character '${c}'`);
    }

    // Minmentsu = 1*Number ("-" / "=" Number) *Number Suit
    private parseMinmentsu(): Minmentsu {
        const left: TileNumber[] = [];

        while (this.chars.length > 0) {
            const c = this.chars.peek();
            if (isTileNumber(c)) {
                this.chars.read();
                left.push(c);
            } else {
                break;
            }
        }

        const called = left.pop();
        if (called == null) {
            throw new TypeError(`No called tile in fuuro`);
        }

        const type = this.chars.read();
        let kakan: string | null;
        if (type == '-') {
            kakan = null;
        } else if (type == '=') {
            kakan = this.chars.read();
        } else {
            throw new TypeError(`Unexpected character '${type}'`);
        }

        const right: TileNumber[] = [];
        while (this.chars.length > 0) {
            const c = this.chars.peek();
            if (isTileNumber(c)) {
                this.chars.read();
                right.push(c);
            } else {
                break;
            }
        }

        const suit = this.chars.read();
        return {
            type: 'minmentsu',
            called: createTile(called, suit),
            kakan: kakan != null ? createTile(kakan, suit) : null,
            left: left.map((n) => createTile(n, suit)),
            right: right.map((n) => createTile(n, suit)),
        };
    }

    // Ankan = "_" 2Number "_" Suit
    private parseAnkan(): Ankan {
        if (this.chars.length < 5) {
            throw new TypeError(`Invalid ankan length`);
        }

        const [underscore1, n1, n2, underscore2, suit] = this.chars.read(5);

        if (underscore1 != '_') {
            throw new TypeError(`Unexpected character '${underscore1}'`);
        }
        if (underscore2 != '_') {
            throw new TypeError(`Unexpected character '${underscore2}'`);
        }

        return {
            type: 'ankan',
            tiles: [createTile(n1, suit), createTile(n2, suit)],
        };
    }
}

export function parseTiles(pattern: string): TileSet {
    return new Parser(pattern).parse();
}
