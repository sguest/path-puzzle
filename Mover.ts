import type { Direction } from './Direction';
import type { Point } from './Point';

export enum MoverType {
    Tile,
    Corner,
}

export interface TileMover {
    type: MoverType.Tile;
    gridPosition: Point;
    pathIndex: number;
    pathProgress: number;
    pathDirection: boolean;
}

export interface CornerMover {
    type: MoverType.Corner;
    gridPosition: Point;
    pathProgress: number;
    direction: Direction;
}

export type Mover = TileMover | CornerMover;