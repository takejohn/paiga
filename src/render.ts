import { Tile, TileSet } from './types.ts';
import { decode, Image } from 'x/imagescript';

const TILE_WIDTH = 15;
const TILE_HEIGHT = 21;

const TILE_MAP: Tile[][] = [
    ['1m', '2m', '3m', '4m', '5m', '6m', '7m', '8m', '9m', '0m'] as const,
    ['1p', '2p', '3p', '4p', '5p', '6p', '7p', '8p', '9p', '0p'] as const,
    ['1s', '2s', '3s', '4s', '5s', '6s', '7s', '8s', '9s', '0s'] as const,
    ['1z', '2z', '3z', '4z', '5z', '6z', '7z'] as const,
] as const;

const TILES_SPRITE: Image = await decode(
    await Deno.readFile('assets/mahjong-tiles_15x21.png'),
) as Image;

const TILE_IMAGES = new Map<Tile, Image>(
    TILE_MAP.map((row, i) =>
        row.map((tile, j) =>
            [
                tile,
                TILES_SPRITE.clone().crop(
                    TILE_WIDTH * j,
                    TILE_HEIGHT * i,
                    TILE_WIDTH,
                    TILE_HEIGHT,
                ),
            ] as const
        )
    ).flat(),
);

export function renderTiles(tiles: TileSet) {
    const { hand } = tiles;
    const image = new Image(TILE_WIDTH * hand.length, TILE_HEIGHT);
    for (const [i, tile] of hand.entries()) {
        image.composite(TILE_IMAGES.get(tile)!, TILE_WIDTH * i);
    }
    return image;
}
