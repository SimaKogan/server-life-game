const allowedOrigins = [
    'http://localhost:3000',
    'https://ui-life-game.onrender.com',
    ...(process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',').map((s) => s.trim()) : []),
];

// Запросы с того же адреса, с которого отдаётся интерфейс (public/), разрешены всегда.
// Остальные origin должны быть в списке allowedOrigins.
const corsOptions = (req, callback) => {
    const origin = req.header('Origin');
    const sameOrigin = origin && origin.replace(/^https?:\/\//, '') === req.header('Host');
    const allowed = !origin || sameOrigin || allowedOrigins.includes(origin);

    if (!allowed) return callback(new Error('Not allowed by CORS'));
    callback(null, {
        origin: true,
        credentials: true,
        methods: ['GET', 'POST', 'DELETE'],
        allowedHeaders: ['Content-Type', 'Authorization'],
    });
};

module.exports = corsOptions;
