import { Direction } from './Direction';
import type { Point } from './Point';

export enum ExitType {
    Tile,
    Corner,
}

export interface TileExit extends Point
{
    type: ExitType;
    direction: Direction;
}

export const tileExits: {[key in Direction]: TileExit} = {
    [Direction.East]: { type: ExitType.Tile, x: 1, y: 0, direction: Direction.West },
    [Direction.West]: { type: ExitType.Tile, x: -1, y: 0, direction: Direction.East },
    [Direction.North]: { type: ExitType.Tile, x: 0, y: -1, direction: Direction.South },
    [Direction.South]: { type: ExitType.Tile, x: 0, y: 1, direction: Direction.North },
    [Direction.SouthWest]: { type: ExitType.Corner, x: 0, y: 1, direction: Direction.SouthWest },
    [Direction.SouthEast]: { type: ExitType.Corner, x: 1, y: 1, direction: Direction.SouthEast },
    [Direction.NorthWest]: { type: ExitType.Corner, x: 0, y: 0, direction: Direction.NorthWest },
    [Direction.NorthEast]: { type: ExitType.Corner, x: 1, y: 0, direction: Direction.NorthEast },
};

export interface CornerExit extends Point {
    direction: Direction;
}

export const cornerExits: {[key: number]: CornerExit} = {
    [Direction.SouthWest]: { x: -1, y: 0, direction: Direction.NorthEast },
    [Direction.NorthWest]: { x: -1, y: -1, direction: Direction.SouthEast },
    [Direction.SouthEast]: { x: 0, y: 0, direction: Direction.NorthWest },
    [Direction.NorthEast]: { x: 0, y: -1, direction: Direction.SouthWest },
}