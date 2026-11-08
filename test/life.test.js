const assert = require('assert');
const { LifeMatrix } = require('../dist/services/LifeMatrix');

const grid = (n, cells) => {
    const g = Array.from({ length: n }, () => Array(n).fill(0));
    cells.forEach(([i, j]) => (g[i][j] = 1));
    return g;
};
const cellsOf = (g) => g.flatMap((r, i) => r.map((v, j) => (v ? `${i},${j}` : null)).filter(Boolean)).sort();

// Блок — устойчивая фигура
let m = new LifeMatrix(grid(10, [[1, 1], [1, 2], [2, 1], [2, 2]]));
let r = m.nextGeneration();
assert.deepStrictEqual(cellsOf(r.dwellers), ['1,1', '1,2', '2,1', '2,2']);
assert.strictEqual(r.alives, 4);
assert.strictEqual(r.generation, 1);

// Мигалка — период 2
m = new LifeMatrix(grid(10, [[5, 4], [5, 5], [5, 6]]));
r = m.nextGeneration();
assert.deepStrictEqual(cellsOf(r.dwellers), ['4,5', '5,5', '6,5']);
r = m.nextGeneration();
assert.deepStrictEqual(cellsOf(r.dwellers), ['5,4', '5,5', '5,6']);

// Глайдер смещается на (+1,+1) за 4 поколения
const glider = [[0, 1], [1, 2], [2, 0], [2, 1], [2, 2]];
m = new LifeMatrix(grid(10, glider));
for (let i = 0; i < 4; i++) r = m.nextGeneration();
assert.deepStrictEqual(cellsOf(r.dwellers), cellsOf(grid(10, glider.map(([i, j]) => [i + 1, j + 1]))));

// Края поля: угловая мигалка не падает и считает корректно
m = new LifeMatrix(grid(10, [[0, 0], [0, 1], [1, 0]]));
r = m.nextGeneration();
assert.deepStrictEqual(cellsOf(r.dwellers), ['0,0', '0,1', '1,0', '1,1']);

// fromObject без generation
assert.strictEqual(LifeMatrix.fromObject({ matrix: grid(10, []) }).generation, 0);

console.log('life tests passed');
