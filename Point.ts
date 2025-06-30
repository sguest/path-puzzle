export interface Point {
    x: number;
    y: number;
}

export type Bezier = [Point, Point, Point];

export const addPoint = (a: Point, b: Point) => {
    return {
        x: a.x + b.x,
        y: a.y + b.y,
    }
}