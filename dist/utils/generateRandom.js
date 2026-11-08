"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRandomMatrix = getRandomMatrix;
function getRandomMatrix(size) {
    let alives = 0;
    let dwellers = [];
    for (let i = 0; i < size; i++) {
        dwellers[i] = [];
        for (let j = 0; j < size; j++) {
            const randomCell = getRandomCell();
            dwellers[i][j] = randomCell;
            alives += randomCell;
        }
    }
    function getRandomCell() {
        return Math.trunc(Math.random() * 2);
    }
    return ({ dwellers, alives });
}
