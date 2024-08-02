export type HonorNumber = '1' | '2' | '3' | '4' | '5' | '6' | '7';
export type TileNumber = HonorNumber | '8' | '9' | '0';
type Suit = 'm' | 'p' | 's';
type HonorTile = `${HonorNumber}z`;
type SuitedTile = `${TileNumber}${Suit}`;
export type Tile = SuitedTile | HonorTile;

export interface TileSet {
    hand: readonly Tile[];
}
