const express = require('express');
const router = express.Router();
const { getRandomMatrix } = require('@utils/generateRandom');
const { LifeMatrix } = require('@services/LifeMatrix');

const MIN_SIZE = 10;
const MAX_SIZE = 1000;

const notInitialized = (res) => res.status(400).send({ message: 'Life matrix not initialized' });

router.post('/init/:areaSize', (req, res) => {
    if (!/^\d+$/.test(req.params.areaSize)) {
        return res.status(400).send({ message: 'Invalid Life matrix size' });
    }
    const areaSize = parseInt(req.params.areaSize, 10);
    if (areaSize < MIN_SIZE || areaSize > MAX_SIZE) {
        return res
            .status(400)
            .send({ message: `The size of the Life matrix must be in the range [${MIN_SIZE} - ${MAX_SIZE}]` });
    }
    const randomMatrix = getRandomMatrix(areaSize);
    req.session.lifeMatrix = { matrix: randomMatrix.dwellers, generation: 0 };

    res.send({ message: 'Life matrix initialized', areaSize, alives: randomMatrix.alives, generation: 0 });
});

router.post('/next', (req, res) => {
    if (!req.session.lifeMatrix) return notInitialized(res);

    const lifeMatrix = LifeMatrix.fromObject(req.session.lifeMatrix);
    const nextGen = lifeMatrix.nextGeneration();
    req.session.lifeMatrix = { matrix: nextGen.dwellers, generation: nextGen.generation };

    res.send({ generation: nextGen.generation, alives: nextGen.alives });
});

// Текущее состояние поля — нужно интерфейсу, чтобы отрисовать клетки.
router.get('/state', (req, res) => {
    if (!req.session.lifeMatrix) return notInitialized(res);

    const { matrix, generation = 0 } = req.session.lifeMatrix;
    res.send({
        areaSize: matrix.length,
        generation,
        alives: LifeMatrix.countAlives(matrix),
        matrix,
    });
});

router.delete('/del', (req, res, next) => {
    if (!req.session || !req.session.lifeMatrix) {
        return res.status(400).send({ message: 'No active session to delete' });
    }
    req.session.destroy((err) => {
        if (err) return next(err);
        res.clearCookie('connect.sid');
        res.status(200).send({ message: 'Session was deleted successfully' });
    });
});

router.get('/wakeup', (req, res) => {
    res.sendStatus(200);
});

module.exports = router;
