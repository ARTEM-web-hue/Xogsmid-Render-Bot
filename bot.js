const { Telegraf } = require("telegraf");
const fs = require("fs");

// Загружаем списки
const spells = fs.readFileSync("spells.txt", "utf-8").split("\n").filter(Boolean);
const potions = fs.readFileSync("potions.txt", "utf-8").split("\n").filter(Boolean);

const bot = new Telegraf(process.env.BOT_TOKEN);

// Обработчик команды /start
bot.start((ctx) => {
  ctx.reply("Напиши @XogsmidBot, чтобы открыть меню с заклинаниями и зельями.");
});

// Inline меню с кнопками
bot.inlineQuery(/.*/, (ctx) => {
  const results = [
    {
      type: "article",
      id: "spells",
      title: "Показать случайное заклинание",
      input_message_content: {
        message_text: `🔮 Заклинание: ${spells[Math.floor(Math.random() * spells.length)]}`,
      },
    },
    {
      type: "article",
      id: "potions",
      title: "Показать случайное зелье",
      input_message_content: {
        message_text: `🧪 Зелье: ${potions[Math.floor(Math.random() * potions.length)]}`,
      },
    },
  ];

  ctx.answerInlineQuery(results);
});

// Запуск бота
const PORT = process.env.PORT || 10000;
const DOMAIN = process.env.RENDER_EXTERNAL_URL;

bot.launch({
  webhook: {
    host: "0.0.0.0",
    port: PORT,
    path: "/bot",
    domain: DOMAIN,
  },
});

console.log(`Бот запущен на порту ${PORT}`);
console.log(`Webhook URL: ${DOMAIN}/bot`);
