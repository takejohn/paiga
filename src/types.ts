export type HonorNumber = '1' | '2' | '3' | '4' | '5' | '6' | '7';
export type TileNumber = HonorNumber | '8' | '9' | '0';
export type Suit = 'm' | 'p' | 's';
type HonorTile = `${HonorNumber}z`;
type SuitedTile = `${TileNumber}${Suit}`;
export type Tile = SuitedTile | HonorTile;

export interface Minmentsu {
    type: 'minmentsu';
    called: Tile;
    kakan: Tile | null;
    left: readonly Tile[];
    right: readonly Tile[];
}

export interface Ankan {
    type: 'ankan';
    tiles: [Tile, Tile];
}

export type Fuuro = Minmentsu | Ankan;

export interface TileSet {
    hand: readonly Tile[];
    horaTile: Tile | null;
    fuuro: Fuuro[];
}
