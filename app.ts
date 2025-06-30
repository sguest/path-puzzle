import { getBrowserContext } from './browserContext';
import { Tile } from './Tile';
import { addPoint, type Point } from './Point';
import { Grid } from './Grid';
import { MoverType, type CornerMover, type Mover, type TileMover } from './Mover';
import { drawBoard, drawMovers, drawTiles } from './render';
import { Direction } from './Direction';
import { cornerExits, ExitType, tileExits } from './transitions';
import { cornerLength } from './coordinates';

const tiles = new Grid<Tile>(8, 6);

tiles.set(0, 0, new Tile(Direction.East, [{start: Direction.South, end: Direction.North}, { start: Direction.NorthWest, end: 0}]));
tiles.set(1, 0, new Tile(Direction.SouthEast, [{start: Direction.SouthWest, end: Direction.SouthEast}]));
tiles.set(0, 1, new Tile(Direction.East, [{start: Direction.East, end: Direction.North}]));
tiles.set(1, 1, new Tile(Direction.West, [{start: Direction.South, end: Direction.NorthEast}, { start: Direction.East, end: Direction.NorthWest}]));
tiles.set(0, 2, new Tile(Direction.East, [{start: Direction.NorthEast, end: Direction.SouthEast}]));
tiles.set(1, 3, new Tile(Direction.East, [{start: Direction.NorthWest, end: Direction.NorthEast}]));
tiles.set(2, 2, new Tile(Direction.East, [{start: Direction.SouthWest, end: Direction.NorthWest}]));

const mover = {
    type: MoverType.Tile,
    gridPosition: { x: 0, y: 0},
    pathIndex: 1,
    pathProgress: 0,
    pathDirection: true,
} as Mover;

const browserContext = getBrowserContext();

const renderContext = {
    tileSize: 100,
    xOffset: 100,
    yOffset: 100,
}

let time = 0;
const animationRate = 1500;

const enterTile = (mover: Mover, target: Point, entryPoint: number) => {
    const tile = tiles.get(target.x, target.y);
    if(!tile)
    {
        throw new Error("End of path");
    }

    let found = false;
    tile.paths.forEach((tilePath, pathIndex) => {
        if(tilePath.start === entryPoint || tilePath.end === entryPoint)
        {
            const tileMover = mover as TileMover;
            tileMover.type = MoverType.Tile;
            tileMover.gridPosition = target;
            tileMover.pathIndex = pathIndex;
            tileMover.pathDirection = (tilePath.start === entryPoint);
            found = true;
        }
    });

    if(!found) {
        console.log(mover, target, entryPoint);
        throw new Error("End of path");
    }
}

const frame = (elapsed: number) => {
    const delta = elapsed - time;
    time = elapsed;

    let frameAnimationRate = animationRate;

    if(mover.type === MoverType.Corner) {
        frameAnimationRate *= ((1 - cornerLength) / 2);
    }

    mover.pathProgress += (delta / frameAnimationRate);

    if(mover.pathProgress >= 1)
    {
        mover.pathProgress -= 1;

        if(mover.type === MoverType.Tile)
        {
            let tile = tiles.get(mover.gridPosition.x, mover.gridPosition.y);
            if(!tile)
            {
                throw new Error("Invalid tile");
            }

            let path = tile.paths[mover.pathIndex];

            const end = mover.pathDirection ? path.end : path.start;
            const exit = tileExits[end];

            if(exit.type === ExitType.Tile)
            {
                const target = addPoint(mover.gridPosition, exit);
                enterTile(mover, target, exit.direction);
            }
            else
            {
                const target = addPoint(mover.gridPosition, exit);
                if(target.x < 1 || target.y < 1 || target.x > tiles.width || target.y > tiles.height)
                {
                    throw new Error("End of path");
                }
                const cornerMover = mover as unknown as CornerMover;
                cornerMover.type = MoverType.Corner;
                cornerMover.gridPosition = target;
                cornerMover.direction = exit.direction;
            }
        }
        else
        {
            const exit = cornerExits[mover.direction];
            const target = addPoint(mover.gridPosition, exit);
            enterTile(mover, target, exit.direction);
        }
    }

    drawMovers([mover], tiles, browserContext.moverContext, renderContext);

    requestAnimationFrame(frame);
}

drawBoard(tiles.width, tiles.height, browserContext.boardContext, renderContext);
drawTiles(tiles, browserContext.tileContext, renderContext);

frame(0);