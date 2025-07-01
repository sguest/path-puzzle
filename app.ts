import { getBrowserContext } from './browserContext';
import { Tile } from './Tile';
import { addPoint, type Point } from './Point';
import { Grid } from './Grid';
import { MoverType, type CornerMoverLocation, type Mover, type TileMoverLocation } from './Mover';
import { drawBoard, drawMovers, drawTiles } from './render';
import { Direction } from './Direction';
import { cornerExits, ExitType, tileExits } from './transitions';
import { cornerLength } from './coordinates';
import { StartTile } from './StartTile';
import { EndTile } from './EndTile';
import { GameMode } from './GameMode';

let gameMode = GameMode.Edit;
const tiles = new Grid<Tile>(8, 6);

tiles.set(0, 0, new StartTile(Direction.SouthEast, '#f00'))
tiles.set(1, 0, new EndTile(Direction.South, '#f00'))
tiles.set(1, 1, new Tile(Direction.East, [{start: Direction.South, end: Direction.North}, { start: Direction.NorthWest, end: Direction.East}]));
tiles.set(2, 1, new Tile(Direction.SouthEast, [{start: Direction.SouthWest, end: Direction.SouthEast}]));
tiles.set(1, 2, new Tile(Direction.East, [{start: Direction.East, end: Direction.North}]));
tiles.set(2, 2, new Tile(Direction.West, [{start: Direction.South, end: Direction.NorthEast}, { start: Direction.East, end: Direction.NorthWest}]));
tiles.set(1, 3, new Tile(Direction.East, [{start: Direction.NorthEast, end: Direction.SouthEast}]));
tiles.set(2, 4, new Tile(Direction.East, [{start: Direction.NorthWest, end: Direction.NorthEast}]));
tiles.set(3, 3, new Tile(Direction.East, [{start: Direction.SouthWest, end: Direction.NorthWest}]));

const mover: Mover = {
    pathProgress: 0.5,
    isMoving: false,
    colour: '#f00',
    location: {
        type: MoverType.Tile,
        gridPosition: { x: 0, y: 0},
        pathIndex: 0,
        pathDirection: true,
    }
};

const browserContext = getBrowserContext();

const renderContext = {
    tileSize: 100,
    xOffset: 100,
    yOffset: 100,
}

let time = 0;
const animationRate = 1500;

browserContext.goButton.addEventListener('click', () => {
    if(gameMode === GameMode.Edit)
    {
        gameMode = GameMode.Running;
        browserContext.goButton.innerText = "Reset";
        mover.isMoving = true;
    }
    else
    {
        gameMode = GameMode.Edit;
        browserContext.goButton.innerText = "Go";
        mover.isMoving = false;
        for(let { item, x, y } of tiles)
        {
            if(item instanceof StartTile && item.moverColour === mover.colour)
            {
                mover.location = {
                    type: MoverType.Tile,
                    gridPosition: { x, y },
                    pathIndex: 0,
                    pathDirection: true,
                }
                mover.isMoving = false;
                mover.pathProgress = 0.5;
            }
        }
    }
});

const enterTile = (mover: Mover, target: Point, entryPoint: number) => {
    const tile = tiles.get(target.x, target.y);
    if(!tile)
    {
        mover.isMoving = false;
        gameMode = GameMode.Lose;
        return false;
    }

    let found = false;
    tile.paths.forEach((tilePath, pathIndex) => {
        if(tilePath.start === entryPoint || tilePath.end === entryPoint)
        {
            mover.location = {
                type: MoverType.Tile,
                gridPosition: target,
                pathDirection: tilePath.start === entryPoint,
                pathIndex,
            }
            found = true;
        }
    });

    if(!found) {
        mover.isMoving = false;
        gameMode = GameMode.Lose;
        return false;
    }

    return true;
}

const updateMover = (delta: number) => {
    if(!mover.isMoving)
    {
        return;
    }

    let frameAnimationRate = animationRate;

    if(mover.location.type === MoverType.Corner) {
        frameAnimationRate *= ((1 - cornerLength) / 2);
    }

    mover.pathProgress += (delta / frameAnimationRate);

    if(mover.location.type === MoverType.Tile)
    {
        let tile = tiles.get(mover.location.gridPosition.x, mover.location.gridPosition.y);
        if(tile instanceof EndTile && mover.pathProgress >= 0.5)
        {
            mover.pathProgress = 0.5;
            mover.isMoving = false;
            gameMode = GameMode.Win;
            return;
        }
    }

    if(mover.pathProgress >= 1)
    {
        if(mover.location.type === MoverType.Tile)
        {
            let tile = tiles.get(mover.location.gridPosition.x, mover.location.gridPosition.y);
            if(!tile)
            {
                mover.isMoving = false;
                gameMode = GameMode.Lose;
                return;
            }
            let path = tile.paths[mover.location.pathIndex];

            const end = mover.location.pathDirection ? path.end : path.start;
            const exit = tileExits[end];

            if(exit.type === ExitType.Tile)
            {
                const target = addPoint(mover.location.gridPosition, exit);
                if(!enterTile(mover, target, exit.direction))
                {
                    return;
                }
            }
            else
            {
                const target = addPoint(mover.location.gridPosition, exit);
                if(target.x < 1 || target.y < 1 || target.x > tiles.width || target.y > tiles.height)
                {
                    mover.isMoving = false;
                    gameMode = GameMode.Lose;
                    return;
                }
                mover.location = {
                    type: MoverType.Corner,
                    gridPosition: target,
                    direction: exit.direction,
                }
            }
        }
        else
        {
            const exit = cornerExits[mover.location.direction];
            const target = addPoint(mover.location.gridPosition, exit);
            if(!enterTile(mover, target, exit.direction))
            {
                return;
            }
        }

        mover.pathProgress -= 1;
    }
}

const frame = (elapsed: number) => {
    const delta = elapsed - time;
    time = elapsed;

    updateMover(delta);

    drawMovers([mover], tiles, browserContext.moverContext, renderContext);

    requestAnimationFrame(frame);
}

drawBoard(tiles.width, tiles.height, browserContext.boardContext, renderContext);
drawTiles(tiles, browserContext.tileContext, renderContext);

frame(0);