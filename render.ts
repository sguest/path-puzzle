import { calculateBezierPoint, getCornerBezier, getTileBezier, getTileCenter, getTileOffset } from './coordinates';
import { Direction, rotate } from './Direction';
import { EndTile } from './EndTile';
import type { Grid } from './Grid';
import { MoverType, type Mover } from './Mover';
import type { Bezier, Point } from './Point';
import type { RenderContext } from './RenderContext';
import { StartTile } from './StartTile';
import type { Tile } from './Tile';

const clearCanvas = (context: CanvasRenderingContext2D) =>
{
    context.clearRect(0, 0, context.canvas.width, context.canvas.height);
}

export const drawBoard = (width: number, height: number, canvasContext: CanvasRenderingContext2D, renderContext: RenderContext) => {
    canvasContext.fillStyle = '#999';
    canvasContext.fillRect(0, 0, canvasContext.canvas.width, canvasContext.canvas.height);
    canvasContext.fillStyle = '#444';
    for(let x = 0; x < width; x++)
    {
        for(let y = 0; y < height; y++)
        {
            canvasContext.beginPath();
            const center = getTileCenter({ x, y }, renderContext);
            canvasContext.arc(center.x, center.y, renderContext.tileSize / 2, 0, Math.PI * 2);
            canvasContext.fill();
        }
    }

    canvasContext.lineWidth = 3;
    canvasContext.beginPath();
    for(let x = 1; x < width; x++) {
        for(let y = 1; y < height; y++)
        {
            let bezier = getCornerBezier({ x, y }, Direction.NorthWest, renderContext);
            canvasContext.moveTo(bezier[0].x, bezier[0].y);
            canvasContext.lineTo(bezier[2].x, bezier[2].y);
            bezier = getCornerBezier({ x, y }, Direction.SouthWest, renderContext);
            canvasContext.moveTo(bezier[0].x, bezier[0].y);
            canvasContext.lineTo(bezier[2].x, bezier[2].y);
        }
    }
    canvasContext.stroke();
}

const drawTileShape = (tilePosition: Point, points: { direction: Direction, distance: number}[], canvasContext: CanvasRenderingContext2D, renderContext: RenderContext) =>
{
    let drawPoints = points.map(p => getTileOffset(tilePosition, p.direction, renderContext, p.distance));

    const lastPoint = drawPoints[drawPoints.length - 1];
    canvasContext.beginPath();
    canvasContext.moveTo(lastPoint.x, lastPoint.y);

    for(let point of drawPoints) {
        canvasContext.lineTo(point.x, point.y);
    }
    const firstPoint = drawPoints[0];
    canvasContext.lineTo(firstPoint.x, firstPoint.y);
    canvasContext.stroke();
}

export const drawTiles = (tiles: Grid<Tile>, canvasContext: CanvasRenderingContext2D, renderContext: RenderContext) =>
{
    clearCanvas(canvasContext);
    for(let {x, y, item } of tiles) {
        const tile = item;
        const point = { x, y };
        if(tile instanceof StartTile || tile instanceof EndTile)
        {
            canvasContext.fillStyle = tile.moverColour
        }
        else
        {
            canvasContext.fillStyle = '#ccc';
        }
        const center = getTileCenter(point, renderContext);
        canvasContext.beginPath();
        canvasContext.arc(center.x, center.y, renderContext.tileSize / 2, 0, Math.PI * 2)
        canvasContext.fill();

        if(tile instanceof StartTile)
        {
            canvasContext.strokeStyle = '#555';
            canvasContext.lineWidth = 4;
            drawTileShape(point, [
                { direction: tile.rotation,  distance: 0.9},
                { direction: rotate(tile.rotation, 1.5), distance: 0.6 },
                { direction: rotate(tile.rotation, 6.5), distance: 0.6 },
            ], canvasContext, renderContext);
        }

        if(tile instanceof EndTile)
        {
            canvasContext.strokeStyle = '#555';
            canvasContext.lineWidth = 4;
            drawTileShape(point, [
                { direction: rotate(tile.rotation, 2),  distance: 0.2},
                { direction: rotate(tile.rotation, 2.7), distance: 0.8 },
                { direction: rotate(tile.rotation, 1.3), distance: 0.8 },
            ], canvasContext, renderContext);
            drawTileShape(point, [
                { direction: rotate(tile.rotation, 6),  distance: 0.2},
                { direction: rotate(tile.rotation, 6.7), distance: 0.8 },
                { direction: rotate(tile.rotation, 5.3), distance: 0.8 },
            ], canvasContext, renderContext);
        }
    }

    canvasContext.strokeStyle = '#000'
    canvasContext.lineWidth = 3;
    canvasContext.beginPath();
    for(let { x, y, item } of tiles) {
        const tile = item;
        const point = { x, y };
        for(let path of tile.paths)
        {
            let start = getTileOffset(point, path.start, renderContext);
            const mid = getTileCenter(point, renderContext);
            let end = getTileOffset(point, path.end, renderContext);
            if(tile instanceof StartTile)
            {
                start = mid;
            }
            if(tile instanceof EndTile)
            {
                end = mid;
            }
            canvasContext.moveTo(start.x, start.y);
            canvasContext.bezierCurveTo(start.x, start.y, mid.x, mid.y, end.x, end.y);
        }
    }
    canvasContext.stroke();
}

export const drawMovers = (movers: Mover[], tiles: Grid<Tile>, canvasContext: CanvasRenderingContext2D, renderContext: RenderContext) =>
{
    clearCanvas(canvasContext);

    for(let mover of movers)
    {
        let bezier: Bezier | undefined;
        let pathProgress = mover.pathProgress;

        if(mover.type === MoverType.Tile)
        {
            const tile = tiles.get(mover.gridPosition.x, mover.gridPosition.y);
            if(tile)
            {
                const path = tile.paths[mover.pathIndex];
                bezier = getTileBezier(mover.gridPosition, path, renderContext);
                if(!mover.pathDirection)
                {
                    pathProgress = 1 - pathProgress;
                }
            }
        }
        else
        {
            bezier = getCornerBezier(mover.gridPosition, mover.direction, renderContext);
        }

        if(bezier)
        {
            const position = calculateBezierPoint(pathProgress, bezier)
            canvasContext.beginPath();
            canvasContext.fillStyle = '#f00';
            canvasContext.strokeStyle = '#000';
            canvasContext.lineWidth = 2;
            canvasContext.arc(position.x, position.y, 10, 0, Math.PI * 2)
            canvasContext.fill();
            canvasContext.stroke();
        }
    }
}