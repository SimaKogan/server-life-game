# server-life-game

Сервер игры «Жизнь» (Express + TypeScript-сервис) со встроенным интерфейсом.

## Запуск
    npm install
    npm run build     # компилирует src/*.ts в dist/
    npm start         # http://localhost:5000

Откройте http://localhost:5000 — интерфейс отдаётся из папки `public/`.

## Переменные окружения
См. `.env.example`. `MONGO_URL` не обязателен; без него сессии живут в памяти.
В продакшене (`NODE_ENV=production`) обязателен `SESSION_SECRET`.

## API (`/api`)
- `POST /init/:size` — новое случайное поле, размер 10–1000
- `POST /next` — следующее поколение
- `GET /state` — текущее поле и статистика
- `DELETE /del` — удалить сессию
- `GET /wakeup` — проверка доступности

## Тесты
    npm run build && npm test
