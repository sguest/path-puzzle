export enum Direction {
    East = 0,
    SouthEast = 1,
    South = 2,
    SouthWest = 3,
    West = 4,
    NorthWest = 5,
    North = 6,
    NorthEast = 7,
}

export const rotate = (angle: Direction, amount: number = 1) =>
{
    return ((angle % 8) + amount + 8) % 8;
}