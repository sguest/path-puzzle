import { getBrowserContext } from './browserContext';
import { Tile } from './Tile';
import { addPoint, type Point } from './Point';
import { Grid } from './Grid';
import type { Mover } from './Mover';
import type Path from './Path';

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

const tileSize = 100;
const offsetX = 100;
const offsetY = 100;

const getCenter = (point: Point) => {
    return {
        x: point.x * tileSize + offsetX,
        y: point.y * tileSize + offsetY,
    }
}

const getOffset = (point: Point, rotation: number) => {
    const center = getCenter(point);
    const angle = rotation * Math.PI / 4;
    return {
        x: center.x + Math.cos(angle) * tileSize / 2,
        y: center.y + Math.sin(angle) * tileSize / 2,
    }
}

/* t is progression along the curve from 0.0 to 1.0 */
const calculateBezierPoint = (t: number, start: Point, mid: Point, end: Point) =>
{
    const u = 1 - t;
    const tt = t * t;
    const uu = u * u;

    let x = start.x * uu;
    let y = start.y * uu;
    x += 2 * u * t * mid.x;
    y += 2 * u * t * mid.y;
    x += tt * end.x;
    y += tt * end.y;

    return { x, y };
}

let time = 0;
const animationRate = 1500;

const clearCanvas = (context: CanvasRenderingContext2D) =>
{
    context.clearRect(0, 0, context.canvas.width, context.canvas.height);
}

const drawTiles = () =>
{
    clearCanvas(browserContext.tileContext);
    for(let tile of tiles) {
        const center = getCenter(tile);
        browserContext.tileContext.beginPath();
        browserContext.tileContext.lineWidth = 3;
        browserContext.tileContext.fillStyle = '#ccc';
        browserContext.tileContext.arc(center.x, center.y, tileSize / 2, 0, Math.PI * 2)
        browserContext.tileContext.fill();

        for(let path of tile.item.paths)
        {
            const start = getOffset(tile, path.start);
            const mid = getCenter(tile);
            const end = getOffset(tile, path.end);
            browserContext.tileContext.beginPath();
            browserContext.tileContext.bezierCurveTo(start.x, start.y, mid.x, mid.y, end.x, end.y);
            browserContext.tileContext.stroke();
        }
    }
}

const getBezier = (point: Point, path: Path) =>
{
    return [
        getOffset(point, path.start),
        getCenter(point),
        getOffset(point, path.end)
    ];
}

const drawMovers = (elapsed: number) => {
    clearCanvas(browserContext.moverContext);

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
                path = tilePath;
                mover.gridPosition = target;
                mover.pathIndex = pathIndex;
                mover.pathProgress -= 1;
                mover.pathDirection = (tilePath.start === entryPoint);
            }
        })
    }

    const bezier = getBezier(mover.gridPosition, path);
    let pathProgress = mover.pathDirection ? mover.pathProgress : 1 - mover.pathProgress;
    const pos = calculateBezierPoint(pathProgress, bezier[0], bezier[1], bezier[2])

    browserContext.moverContext.beginPath();
    browserContext.moverContext.fillStyle = '#f00';
    browserContext.moverContext.arc(pos.x, pos.y, 10, 0, Math.PI * 2)
    browserContext.moverContext.fill();

    requestAnimationFrame(drawMovers);
}

drawTiles();

drawMovers(0);