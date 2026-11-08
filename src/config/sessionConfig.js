const isProduction = process.env.NODE_ENV === 'production';

if (isProduction && !process.env.SESSION_SECRET) {
    console.error('SESSION_SECRET is required when NODE_ENV=production');
    process.exit(1);
}

// MongoDB используется, только если задан MONGO_URL.
// Иначе — хранилище в памяти (подходит для разработки: сессии пропадают при перезапуске).
let store;
if (process.env.MONGO_URL) {
    const MongoStore = require('connect-mongo');
    store = MongoStore.create({
        mongoUrl: process.env.MONGO_URL,
        collectionName: 'sessions',
        ttl: 60 * 60,
        autoRemove: 'native',
    });
} else {
    console.warn('[warn] MONGO_URL не задан — сессии хранятся в памяти.');
}

const sessionConfig = {
    secret: process.env.SESSION_SECRET || 'dev-only-secret-change-me',
    resave: false,
    saveUninitialized: false,
    ...(store && { store }),
    cookie: {
        secure: isProduction,
        httpOnly: true,
        sameSite: isProduction ? 'none' : 'lax',
        maxAge: 1000 * 60 * 60,
    },
};

module.exports = sessionConfig;
