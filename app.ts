import { getBrowserContext } from './browserContext';
import { Tile } from './Tile';
import { addPoint, type Point } from './Point';
import { Grid } from './Grid';
import { MoverType, type Mover } from './Mover';
import { drawBoard, drawMovers, drawTiles } from './render';

const tileDeltas: {[key: number]: Point} = {
    0: { x: 1, y: 0 },
    2: { x: 0, y: 1 },
    4: { x: -1, y: 0 },
    6: { x: 0, y: -1 },
};

const cornerDeltas: {[key: number]: Point & { rising: boolean, direction: boolean}} = {
    1: { x: 1, y: 1, rising: false, direction: true},
    3: { x: 0, y: 1, rising: true, direction: false },
    5: { x: 0, y: 0, rising: false, direction: false},
    7: { x: 1, y: 0, rising: true, direction: true},
}

const cornerExitDeltas: {[key: string]: Point & {entryIndex: number}} = {
    '1-1': { x: 0, y: -1, entryIndex: 3 },
    '1-0': { x: -1, y: 0, entryIndex: 7 },
    '0-1': { x: 0, y: 0, entryIndex: 5 },
    '0-0': { x: -1, y: -1, entryIndex: 1 },
}

const tiles = new Grid<Tile>(8, 6);

tiles.set(0, 0, new Tile(0, [{start: 2, end: 6}, { start: 5, end: 0}]));
tiles.set(1, 0, new Tile(1, [{start: 3, end: 1}]));
tiles.set(0, 1, new Tile(0, [{start: 0, end: 6}]));
tiles.set(1, 1, new Tile(4, [{start: 2, end: 7}, { start: 0, end: 5}]));
tiles.set(0, 2, new Tile(0, [{start: 7, end: 1}]));
tiles.set(1, 3, new Tile(0, [{start: 5, end: 7}]));
tiles.set(2, 2, new Tile(0, [{start: 3, end: 5}]));

const mover: Mover = {
    type: MoverType.Tile,
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
            mover.gridPosition = target;
            mover.pathIndex = pathIndex;
            mover.pathDirection = (tilePath.start === entryPoint);
            mover.type = MoverType.Tile;
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

    mover.pathProgress += (delta / animationRate);

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
            if(end % 2 === 0)
            {
                const entryPoint = (end + 4) % 8;
                const target = addPoint(mover.gridPosition, tileDeltas[end]);

                enterTile(mover, target, entryPoint);
            }
            else
            {
                const delta = cornerDeltas[end];
                const target = addPoint(mover.gridPosition, delta);
                if(target.x < 1 || target.y < 1 || target.x > tiles.width || target.y > tiles.height)
                {
                    throw new Error("End of path");
                }
                mover.type = MoverType.Corner;
                mover.gridPosition = target;
                mover.pathDirection = delta.direction;
                mover.pathIndex = delta.rising ? 1 : 0;
            }
        }
        else
        {
            const key = `${mover.pathIndex}-${mover.pathDirection ? 1 : 0}`;
            const delta = cornerExitDeltas[key];
            const target = addPoint(mover.gridPosition, delta);
            console.log(key, delta)
            enterTile(mover, target, delta.entryIndex);
        }
    }

    drawMovers([mover], tiles, browserContext.moverContext, renderContext);

    requestAnimationFrame(frame);
}

drawBoard(tiles.width, tiles.height, browserContext.boardContext, renderContext);
drawTiles(tiles, browserContext.tileContext, renderContext);

frame(0);