import { Direction } from './Direction';
import { Tile } from './Tile';

export class EndTile extends Tile {
    constructor(rotation: Direction, readonly moverColour: string)
    {
        super(rotation, [{ start: Direction.East, end: Direction.West }]);
    }
}