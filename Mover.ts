import type { Point } from './Point';

export enum MoverType {
    Tile,
    Corner,
}

export interface Mover {
    type: MoverType;
    gridPosition: Point;
    pathIndex: number;
    pathProgress: number;
    pathDirection: boolean;
}