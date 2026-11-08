require('dotenv').config();
require('module-alias/register');
const path = require('path');
const express = require('express');
const cors = require('cors');
const session = require('express-session');
const corsOptions = require('@config/corsConfig');
const sessionConfig = require('@config/sessionConfig');
const lifeMatrixRoutes = require('@routes/lifeMatrixRoutes');

const app = express();
const port = Number(process.env.PORT) || 5000;

// За прокси (Render и т.п.) нужно, чтобы secure-cookie работали корректно.
if (process.env.NODE_ENV === 'production') app.set('trust proxy', 1);
app.disable('x-powered-by');

app.use(cors(corsOptions));
app.use(express.json());
app.use(session(sessionConfig));

app.use('/api', lifeMatrixRoutes);
app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res) => res.status(404).send({ message: 'Not found' }));
app.use((err, req, res, next) => {
    if (err.message === 'Not allowed by CORS') return res.status(403).send({ message: err.message });
    console.error(err);
    res.status(500).send({ message: 'Internal server error' });
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
