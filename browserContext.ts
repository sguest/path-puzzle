export interface BrowserContext {
    tileContext: CanvasRenderingContext2D;
    moverContext: CanvasRenderingContext2D;
}

let instance: BrowserContext | undefined = undefined;

function getCanvas(id: string) {
    return document.querySelector<HTMLCanvasElement>(`#${id}`)!.getContext('2d')!;
}

export function getBrowserContext()
{
    if(!instance)
    {
        instance = {
            tileContext: getCanvas('tile-canvas'),
            moverContext: getCanvas('mover-canvas'),
        }
    }

    return instance;
}