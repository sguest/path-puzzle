import { calculateBezierPoint, getCornerBezier, getTileBezier, getTileCenter, getTileOffset } from './coordinates';
import type { Grid } from './Grid';
import { MoverType, type Mover } from './Mover';
import type { Bezier } from './Point';
import type { RenderContext } from './RenderContext';
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
            let bezier = getCornerBezier({ x, y }, false, renderContext);
            canvasContext.moveTo(bezier[0].x, bezier[0].y);
            canvasContext.lineTo(bezier[2].x, bezier[2].y);
            bezier = getCornerBezier({ x, y }, true, renderContext);
            canvasContext.moveTo(bezier[0].x, bezier[0].y);
            canvasContext.lineTo(bezier[2].x, bezier[2].y);
        }
    }
    canvasContext.stroke();
}

export const drawTiles = (tiles: Grid<Tile>, canvasContext: CanvasRenderingContext2D, renderContext: RenderContext) =>
{
    canvasContext.fillStyle = '#ccc';

    clearCanvas(canvasContext);
    for(let tile of tiles) {
        const center = getTileCenter(tile, renderContext);
        canvasContext.beginPath();
        canvasContext.arc(center.x, center.y, renderContext.tileSize / 2, 0, Math.PI * 2)
        canvasContext.fill();
    }

    canvasContext.lineWidth = 3;
    canvasContext.beginPath();
    for(let tile of tiles) {
        for(let path of tile.item.paths)
        {
            const start = getTileOffset(tile, path.start, renderContext);
            const mid = getTileCenter(tile, renderContext);
            const end = getTileOffset(tile, path.end, renderContext);
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

        if(mover.type === MoverType.Tile)
        {
            const tile = tiles.get(mover.gridPosition.x, mover.gridPosition.y);
            if(tile)
            {
                const path = tile.paths[mover.pathIndex];
                bezier = getTileBezier(mover.gridPosition, path, renderContext);
            }
        }
        else
        {
            bezier = getCornerBezier(mover.gridPosition, mover.pathIndex === 1, renderContext);
        }

        if(bezier)
        {
            const pathProgress = mover.pathDirection ? mover.pathProgress : 1 - mover.pathProgress;
            const position = calculateBezierPoint(pathProgress, bezier)
            canvasContext.beginPath();
            canvasContext.fillStyle = '#f00';
            canvasContext.arc(position.x, position.y, 10, 0, Math.PI * 2)
            canvasContext.fill();
        }
    }
}