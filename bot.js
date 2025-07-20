const { Telegraf } = require("telegraf");
const fs = require("fs");

// Загружаем списки (один раз при старте)
let spells = [];
let potions = [];

try {
  spells = fs.readFileSync("spells.txt", "utf-8").split("\n").filter(Boolean);
  potions = fs.readFileSync("potions.txt", "utf-8").split("\n").filter(Boolean);
} catch (e) {
  console.error("Ошибка чтения файлов:", e.message);
}

const bot = new Telegraf(process.env.BOT_TOKEN);

// Логируем количество загруженных элементов
console.log(`Загружено заклинаний: ${spells.length}`);
console.log(`Загружено зелий: ${potions.length}`);

// Обработчик inline-запроса
bot.inlineQuery(/.*/, (ctx) => {
  // Получаем случайные значения при каждом запросе
  const randomSpell = spells[Math.floor(Math.random() * spells.length)] || "Заклинание не найдено";
  const randomPotion = potions[Math.floor(Math.random() * potions.length)] || "Зелье не найдено";

  const results = [
    {
      type: "article",
      id: "spell",
      title: "Случайное заклинание",
      input_message_content: {
        message_text: `🪄 ${randomSpell}`,
      },
    },
    {
      type: "article",
      id: "potion",
      title: "Случайное зелье",
      input_message_content: {
        message_text: `🧪 ${randomPotion}`,
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
