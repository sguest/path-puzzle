import type { Direction } from './Direction';
import type { Point } from './Point';

export enum MoverType {
    Tile,
    Corner,
}

interface MoverBase {
    gridPosition: Point;
    pathProgress: number;
    isMoving: boolean;
}

export interface TileMover extends MoverBase {
    type: MoverType.Tile;
    pathIndex: number;
    pathDirection: boolean;
}

export interface CornerMover extends MoverBase {
    type: MoverType.Corner;
    direction: Direction;
}

export type Mover = TileMover | CornerMover;