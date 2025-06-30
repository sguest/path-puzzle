import { rotate, type Direction } from './Direction';
import type { Path } from './Path';



export class Tile {
    constructor(private _rotation: Direction, private _paths: Path[])
    {
    }

    public get rotation() {
        return this._rotation;
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
        this._rotation = rotate(this.rotation, amount);
    }
}