const { Telegraf } = require("telegraf");

const bot = new Telegraf(process.env.BOT_TOKEN); // Получаем токен из переменной окружения

bot.start((ctx) => {
  ctx.reply("Привет! Это бот, запущенный через Rendeer на порту 10000.");
});

// Запускаем бота на порту, который указывает Rendeer
const PORT = process.env.PORT || 10000;

bot.launch({
  webhook: {
    host: "0.0.0.0",
    port: PORT,
  },
});

console.log(`Бот запущен на порту ${PORT}`);
