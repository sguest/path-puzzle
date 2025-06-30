export class Grid<T> {
    private items: T[][] = [];

    constructor(readonly width: number, readonly height: number)
    {
    }

    public set(x: number, y: number, object: T)
    {
        if(x < 0 || x >= this.width || y < 0 || y >= this.height)
        {
            throw new Error(`Failed to insert to grid. (${x}, ${y}) is outside grid boundaries of (${this.width}, ${this.height})`)
        }

        this.items[x] ||= [];
        this.items[x][y] = object;
    }

    public get(x: number, y: number): T | undefined
    {
        return this.items[x] && this.items[x][y];
    }

    public remove(x: number, y: number): T | undefined
    {
        if(this.items[x])
        {
            const item = this.items[x][y];
            delete this.items[x][y];
            return item;
        }

        return undefined;
    }

    public [Symbol.iterator]()
    {
        const items = [];
        for(let x = 0; x < this.width; x++)
        {
            for(let y = 0; y < this.height; y++)
            {
                const item = this.get(x, y);
                if(item)
                {
                    items.push({
                        x,
                        y,
                        item
                    })
                }
            }
        }

        return items[Symbol.iterator]();
    }
}