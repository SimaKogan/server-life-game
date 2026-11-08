type Props = {
    dwellers: number[][];
    alives: number;
}

export function getRandomMatrix(size: number): Props {
    let alives: number = 0;
    let dwellers: number[][] = [];
    for (let i = 0; i < size; i++) {
        dwellers[i] = [];
        for (let j = 0; j < size; j++) {
            const randomCell: number = getRandomCell();
            dwellers[i][j] = randomCell;
            alives += randomCell
        }
    }

    function getRandomCell(): number {

        return Math.trunc(Math.random() * 2);
    }

    return ({ dwellers, alives });

}