import { getBrowserContext } from './browserContext';
import { Tile } from './Tile';
import { addPoint, type Bezier, type Point } from './Point';
import { Grid } from './Grid';
import type { Mover } from './Mover';
import { calculateBezierPoint, getTileBezier, getTileCenter, getTileOffset } from './coordinates';
import type { Path } from './Path';
import { drawMovers, drawTiles } from './render';

const tileDeltas: {[key: number]: Point} = {
    0: { x: 1, y: 0 },
    2: { x: 0, y: 1 },
    4: { x: -1, y: 0 },
    6: { x: 0, y: -1 },
};

const tiles = new Grid<Tile>(2, 2);

tiles.set(0, 0, new Tile(0, [{start: 2, end: 6}, { start: 5, end: 0}]));
tiles.set(1, 0, new Tile(1, [{start: 3, end: 1}]));
tiles.set(0, 1, new Tile(0, [{start: 0, end: 6}]));
tiles.set(1, 1, new Tile(4, [{start: 2, end: 0}]));

const mover: Mover = {
    gridPosition: { x: 0, y: 0},
    pathIndex: 1,
    pathProgress: 0,
    pathDirection: true,
}

const browserContext = getBrowserContext();

const renderContext = {
    tileSize: 100,
    xOffset: 100,
    yOffset: 100,
}

let time = 0;
const animationRate = 1500;

const frame = (elapsed: number) => {
    const delta = elapsed - time;
    time = elapsed;

    let tile = tiles.get(mover.gridPosition.x, mover.gridPosition.y);
    if(!tile)
    {
        throw new Error("Invalid tile");
    }

    let path = tile.paths[mover.pathIndex];

    mover.pathProgress += (delta / animationRate);

    if(mover.pathProgress >= 1)
    {
        const end = mover.pathDirection ? path.end : path.start;
        const target = addPoint(mover.gridPosition, tileDeltas[end]);
        tile = tiles.get(target.x, target.y);
        if(!tile)
        {
            throw new Error("End of path");
        }

        const entryPoint = (end + 4) % 8;

        tile.paths.forEach((tilePath, pathIndex) => {
            if(tilePath.start === entryPoint || tilePath.end === entryPoint)
            {
                mover.gridPosition = target;
                mover.pathIndex = pathIndex;
                mover.pathProgress -= 1;
                mover.pathDirection = (tilePath.start === entryPoint);
            }
        })
    }

    drawMovers([mover], tiles, browserContext.moverContext, renderContext);

    requestAnimationFrame(frame);
}

drawTiles(tiles, browserContext.tileContext, renderContext);

frame(0);