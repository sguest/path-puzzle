import type { Point } from './Point';

export interface Mover {
    gridPosition: Point;
    pathIndex: number;
    pathProgress: number;
    pathDirection: boolean;
}