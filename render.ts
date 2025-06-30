import { calculateBezierPoint, getTileBezier, getTileCenter, getTileOffset } from './coordinates';
import type { Grid } from './Grid';
import type { Mover } from './Mover';
import type { RenderContext } from './RenderContext';
import type { Tile } from './Tile';

const clearCanvas = (context: CanvasRenderingContext2D) =>
{
    context.clearRect(0, 0, context.canvas.width, context.canvas.height);
}

export const drawTiles = (tiles: Grid<Tile>, canvasContext: CanvasRenderingContext2D, renderContext: RenderContext) =>
{
    clearCanvas(canvasContext);
    for(let tile of tiles) {
        const center = getTileCenter(tile, renderContext);
        canvasContext.beginPath();
        canvasContext.lineWidth = 3;
        canvasContext.fillStyle = '#ccc';
        canvasContext.arc(center.x, center.y, renderContext.tileSize / 2, 0, Math.PI * 2)
        canvasContext.fill();

        for(let path of tile.item.paths)
        {
            const start = getTileOffset(tile, path.start, renderContext);
            const mid = getTileCenter(tile, renderContext);
            const end = getTileOffset(tile, path.end, renderContext);
            canvasContext.beginPath();
            canvasContext.bezierCurveTo(start.x, start.y, mid.x, mid.y, end.x, end.y);
            canvasContext.stroke();
        }
    }
}

export const drawMovers = (movers: Mover[], tiles: Grid<Tile>, canvasContext: CanvasRenderingContext2D, renderContext: RenderContext) =>
{
    clearCanvas(canvasContext);

    for(let mover of movers)
    {
        const tile = tiles.get(mover.gridPosition.x, mover.gridPosition.y);
        if(tile)
        {
            const path = tile.paths[mover.pathIndex];
            const bezier = getTileBezier(mover.gridPosition, path, renderContext);
            let pathProgress = mover.pathDirection ? mover.pathProgress : 1 - mover.pathProgress;
            const pos = calculateBezierPoint(pathProgress, bezier)

            canvasContext.beginPath();
            canvasContext.fillStyle = '#f00';
            canvasContext.arc(pos.x, pos.y, 10, 0, Math.PI * 2)
            canvasContext.fill();
        }
    }
}