import type { Direction } from './Direction';
import type { Path } from './Path';

const rotate = (angle: number, amount: number = 1) =>
{
    return ((angle % 8) + amount + 8) % 8;
}

export class Tile {
    constructor(private rotation: Direction, private _paths: Path[])
    {
    }

    public get paths(): Path[]
    {
        return this._paths.map(p => ({
            start: rotate(p.start, this.rotation),
            end: rotate(p.end, this.rotation),
        }))
    }

    public rotate(amount: number = 1)
    {
        this.rotation = rotate(this.rotation, amount);
    }
}