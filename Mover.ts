import type { Direction } from './Direction';
import type { Point } from './Point';

export enum MoverType {
    Tile,
    Corner,
}

export interface Mover {
    colour: string;
    isMoving: boolean;
    location: MoverLocation;
    pathProgress: number;
}

export interface TileMoverLocation {
    gridPosition: Point;
    type: MoverType.Tile;
    pathIndex: number;
    pathDirection: boolean;
}

export interface CornerMoverLocation {
    gridPosition: Point;
    type: MoverType.Corner;
    direction: Direction;
}

export type MoverLocation = TileMoverLocation | CornerMoverLocation;