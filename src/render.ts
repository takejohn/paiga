import { Ankan, Minmentsu, Tile, TileSet } from './types.ts';
import { decode, Image } from 'x/imagescript';

const TILE_BACKGROUND_IMAGE: Image = await decode(
    await Deno.readFile('assets/mahjong-tile-background_15x21.png'),
) as Image;
const TILE_BACKGROUND_H_IMAGE: Image = await decode(
    await Deno.readFile('assets/mahjong-tile-background-h_15x21.png'),
) as Image;
const TILE_BACKGROUND_H2_IMAGE: Image = await decode(
    await Deno.readFile('assets/mahjong-tile-background-h2_15x21.png'),
) as Image;
const TILE_BACK_IMAGE: Image = await decode(
    await Deno.readFile('assets/mahjong-tile-back_15x21.png'),
) as Image;

const TILE_WIDTH = TILE_BACKGROUND_IMAGE.width;
const TILE_HEIGHT = TILE_BACKGROUND_IMAGE.height;
const TILE_H_WIDTH = TILE_BACKGROUND_H_IMAGE.width;
const TILE_H2_HEIGHT = TILE_BACKGROUND_H2_IMAGE.height;

const TILE_MAP: Tile[][] = [
    ['1m', '2m', '3m', '4m', '5m', '6m', '7m', '8m', '9m', '0m'] as const,
    ['1p', '2p', '3p', '4p', '5p', '6p', '7p', '8p', '9p', '0p'] as const,
    ['1s', '2s', '3s', '4s', '5s', '6s', '7s', '8s', '9s', '0s'] as const,
    ['1z', '2z', '3z', '4z', '5z', '6z', '7z'] as const,
] as const;

const TILES_SPRITE: Image = await decode(
    await Deno.readFile('assets/mahjong-tiles_15x21.png'),
) as Image;

const TILE_PICTURE_WIDTH = 15;
const TILE_PICTURE_HEIGHT = 21;
const TILE_PICTURE_X_OFFSET = 1;
const TILE_PICTURE_Y_OFFSET = 3;
const TILE_PICTURE_Y_OFFSET_2 = 19;

const TILE_IMAGES = new Map<Tile, Image>(
    TILE_MAP.map((row, i) =>
        row.map((tile, j) =>
            [
                tile,
                TILES_SPRITE.clone().crop(
                    TILE_PICTURE_WIDTH * j,
                    TILE_PICTURE_HEIGHT * i,
                    TILE_PICTURE_WIDTH,
                    TILE_PICTURE_HEIGHT,
                ),
            ] as const
        )
    ).flat(),
);

const MARGIN = 8;

export function renderTiles(tiles: TileSet): Image {
    let hand: Image | null = null;
    let handWidth = 0;
    if (tiles.hand.length != 0) {
        hand = renderHand(tiles.hand);
        handWidth = hand.width + MARGIN;
    }

    let horaTile: Image | null = null;
    let horaTileWidth = 0;
    if (tiles.horaTile != null) {
        horaTile = renderTile(tiles.horaTile);
        horaTileWidth = horaTile.width + MARGIN;
    }

    const fuuro = tiles.fuuro.length != 0 ? renderFuuro(tiles.fuuro) : null;
    const width = handWidth + horaTileWidth +
        (fuuro != null ? fuuro.width + MARGIN : 0) + MARGIN;
    const image = new Image(
        width,
        (fuuro != null ? fuuro.height : TILE_HEIGHT) + MARGIN * 2,
    );
    image.fill(0x004000ff);

    if (hand != null) {
        image.composite(hand, MARGIN, image.height - MARGIN - hand.height);
    }
    if (horaTile != null) {
        image.composite(
            horaTile,
            handWidth + MARGIN,
            image.height - MARGIN - horaTile.height,
        );
    }
    if (fuuro != null) {
        image.composite(
            fuuro,
            handWidth + horaTileWidth + MARGIN,
            image.height - MARGIN - fuuro.height,
        );
    }

    return image;
}

function renderTile(tile: Tile): Image {
    const image = TILE_BACKGROUND_IMAGE.clone();
    image.composite(
        TILE_IMAGES.get(tile)!,
        TILE_PICTURE_X_OFFSET,
        TILE_PICTURE_Y_OFFSET,
    );
    return image;
}

export function renderFuuroTile(tile: Tile): Image {
    const image = TILE_BACKGROUND_H_IMAGE.clone();
    const picture = TILE_IMAGES.get(tile)!.clone().rotate(90) as Image;
    image.composite(picture, TILE_PICTURE_X_OFFSET, TILE_PICTURE_Y_OFFSET);
    return image;
}

export function renderKakanTiles(tile: Tile, kakan: Tile): Image {
    const image = TILE_BACKGROUND_H2_IMAGE.clone();
    const picture = TILE_IMAGES.get(tile)!.clone().rotate(90) as Image;
    const kakanPicture = TILE_IMAGES.get(kakan)!.clone().rotate(90) as Image;
    image.composite(kakanPicture, TILE_PICTURE_X_OFFSET, TILE_PICTURE_Y_OFFSET);
    image.composite(picture, TILE_PICTURE_X_OFFSET, TILE_PICTURE_Y_OFFSET_2);
    return image;
}

function renderHand(hand: TileSet['hand']): Image {
    const image = new Image(
        TILE_WIDTH * hand.length,
        TILE_HEIGHT,
    );
    for (const [i, tile] of hand.entries()) {
        image.composite(renderTile(tile), TILE_WIDTH * i, 0);
    }
    return image;
}

function renderFuuro(fuuro: TileSet['fuuro']): Image {
    const images = fuuro.map((fuuro) =>
        fuuro.type == 'minmentsu' ? renderMinmentsu(fuuro) : renderAnkan(fuuro)
    );
    const width = images.reduce((x, image) => x + image.width, 0);
    const height = images.reduce(
        (x, image) => x > image.height ? x : image.height,
        0,
    );
    const result = new Image(width, height);
    let xOffset = 0;
    for (const image of images) {
        result.composite(image, xOffset, result.height - image.height);
        xOffset += image.width;
    }
    return result;
}

function renderMinmentsu(fuuro: Minmentsu): Image {
    const width = TILE_H_WIDTH +
        (fuuro.left.length + fuuro.right.length) * TILE_WIDTH;
    const height = fuuro.kakan == null ? TILE_HEIGHT : TILE_H2_HEIGHT;
    const image = new Image(width, height);
    let xOffset = 0;
    for (const tile of fuuro.left) {
        const tileImage = renderTile(tile);
        image.composite(tileImage, xOffset, image.height - tileImage.height);
        xOffset += tileImage.width;
    }
    const calledTilesImage = fuuro.kakan == null
        ? renderFuuroTile(fuuro.called)
        : renderKakanTiles(fuuro.called, fuuro.kakan);
    image.composite(
        calledTilesImage,
        xOffset,
        image.height - calledTilesImage.height,
    );
    xOffset += calledTilesImage.width;
    for (const tile of fuuro.right) {
        const tileImage = renderTile(tile);
        image.composite(tileImage, xOffset, image.height - tileImage.height);
        xOffset += tileImage.width;
    }
    return image;
}

function renderAnkan(fuuro: Ankan): Image {
    const image = new Image(TILE_WIDTH * 4, TILE_HEIGHT);
    image.composite(TILE_BACK_IMAGE, 0, 0);
    image.composite(renderTile(fuuro.tiles[0]), TILE_WIDTH, 0);
    image.composite(renderTile(fuuro.tiles[1]), TILE_WIDTH * 2, 0);
    image.composite(TILE_BACK_IMAGE, TILE_WIDTH * 3, 0);
    return image;
}
