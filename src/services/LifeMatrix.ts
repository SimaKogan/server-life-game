type ResponseNextProps = {
    dwellers: number[][],
    generation: number,
    alives: number;
}

type FromObjectProps = {
    matrix: number[][],
    generation?: number,
}

export class LifeMatrix {
    generation: number;
    alives: number;

    constructor(private _dwellers: number[][], generation: number = 0) {
        this.generation = generation;
        this.alives = LifeMatrix.countAlives(_dwellers);
    }

    get dwellers(): number[][] {
        return this._dwellers;
    }

    /** Считает по правилам Конвея: поле ограничено, за его пределами клетки мёртвые. */
    nextGeneration(): ResponseNextProps {
        const src = this._dwellers;
        const rows = src.length;
        let alives = 0;
        const next: number[][] = new Array(rows);

        for (let i = 0; i < rows; i++) {
            const cols = src[i].length;
            const row: number[] = new Array(cols);
            const up = i > 0 ? src[i - 1] : null;
            const down = i < rows - 1 ? src[i + 1] : null;
            const cur = src[i];

            for (let j = 0; j < cols; j++) {
                const l = j > 0 ? j - 1 : 0;
                const r = j < cols - 1 ? j + 1 : cols - 1;
                let n = 0;
                for (let k = l; k <= r; k++) {
                    if (up) n += up[k];
                    if (down) n += down[k];
                }
                if (j > 0) n += cur[j - 1];
                if (j < cols - 1) n += cur[j + 1];

                const cell = cur[j] ? isAliveFromAlive(n) : isAliveFromDead(n);
                row[j] = cell;
                alives += cell;
            }
            next[i] = row;
        }

        this._dwellers = next;
        this.alives = alives;
        return { dwellers: next, generation: ++this.generation, alives };
    }

    static countAlives(dwellers: number[][]): number {
        let total = 0;
        for (const row of dwellers) for (const cell of row) total += cell;
        return total;
    }

    static fromObject({ matrix, generation }: FromObjectProps): LifeMatrix {
        return new LifeMatrix(matrix, generation ?? 0);
    }
}

function isAliveFromAlive(n: number): number {
    return +(n === 2 || n === 3);
}

function isAliveFromDead(n: number): number {
    return +(n === 3);
}
