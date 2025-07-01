export interface BrowserContext {
    boardContext: CanvasRenderingContext2D;
    tileContext: CanvasRenderingContext2D;
    moverContext: CanvasRenderingContext2D;
    goButton: HTMLButtonElement;
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
            boardContext: getCanvas('board-canvas'),
            tileContext: getCanvas('tile-canvas'),
            moverContext: getCanvas('mover-canvas'),
            goButton: document.querySelector<HTMLButtonElement>('#go-button')!,
        }
    }

    return instance;
}