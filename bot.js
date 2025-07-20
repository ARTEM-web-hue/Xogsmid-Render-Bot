const { Telegraf } = require("telegraf");

// Получаем токен из переменной окружения
const bot = new Telegraf(process.env.BOT_TOKEN);

// Обработчик команды /start
bot.start((ctx) => {
  ctx.reply("Привет! Это бот, запущенный через Rendeer на порту 10000.");
});

// Получаем порт из окружения (Rendeer передаёт PORT=10000)
const PORT = process.env.PORT || 10000;

// Укажи здесь URL, который выдаст Rendeer, например:
const DOMAIN = process.env.RENDER_EXTERNAL_URL || `https://your-bot.onrendeer.dev `;
// Запускаем бота с вебхуком
bot.launch({
  webhook: {
    host: "0.0.0.0",
    port: PORT,
    path: "/bot", // можно оставить или изменить
    domain: DOMAIN,
  },
});

console.log(`Бот запущен на порту ${PORT}`);
