import type { Path } from './Path';
import type { Bezier, Point } from './Point';
import type { RenderContext } from './RenderContext';

export const getTileCenter = (point: Point, renderContext: RenderContext) => {
    return {
        x: point.x * renderContext.tileSize + renderContext.xOffset,
        y: point.y * renderContext.tileSize + renderContext.yOffset,
    }
}

export const getTileOffset = (point: Point, rotation: number, renderContext: RenderContext) => {
    const center = getTileCenter(point, renderContext);
    const angle = rotation * Math.PI / 4;
    return {
        x: center.x + Math.cos(angle) * renderContext.tileSize / 2,
        y: center.y + Math.sin(angle) * renderContext.tileSize / 2,
    }
}

/* t is progression along the curve from 0.0 to 1.0 */
export const calculateBezierPoint = (t: number, bezier: Bezier) =>
{
    const u = 1 - t;
    const tt = t * t;
    const uu = u * u;

    let x = bezier[0].x * uu;
    let y = bezier[0].y * uu;
    x += 2 * u * t * bezier[1].x;
    y += 2 * u * t * bezier[1].y;
    x += tt * bezier[2].x;
    y += tt * bezier[2].y;

    return { x, y };
}

export const getTileBezier = (point: Point, path: Path, renderContext: RenderContext): Bezier => {
    return [
        getTileOffset(point, path.start, renderContext),
        getTileCenter(point, renderContext),
        getTileOffset(point, path.end, renderContext)
    ];
}

export const getCornerBezier = (point: Point, rising: boolean, renderContext: RenderContext): Bezier => {
    // cos/sin 45deg ~= 0.707, 1-0.707 = 0.293
    const length = 0.293 * renderContext.tileSize / 2;
    const midX = (point.x + 0.5) * renderContext.tileSize;
    const midY = (point.y + 0.5) * renderContext.tileSize;
    const yMult = rising ? -1 : 1;

    return [
        { x: midX - length, y: midY - length * yMult },
        { x: midX, y: midY },
        { x: midX + length, y: midY + length * yMult },
    ]
}