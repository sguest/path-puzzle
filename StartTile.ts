import { Direction } from './Direction';
import { Tile } from './Tile';

export class StartTile extends Tile {
    constructor(rotation: Direction, readonly moverColour: string)
    {
        super(rotation, [{ start: Direction.West, end: Direction.East }]);
    }
}