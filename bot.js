const { Telegraf } = require("telegraf");
const fs = require("fs");

// Загружаем списки
let spells = fs.readFileSync("spells.txt", "utf-8").split("\n").filter(Boolean);
let potions = fs.readFileSync("potions.txt", "utf-8").split("\n").filter(Boolean);

// Переменные для хранения последнего результата
let lastSpell = null;
let lastPotion = null;

// Функция для уникального случайного выбора
function getRandomUnique(list, last) {
  let randomItem;
  let attempts = 0;
  const maxAttempts = 10;

  do {
    randomItem = list[Math.floor(Math.random() * list.length)];
    attempts++;
  } while (randomItem === last && attempts < maxAttempts);

  return randomItem;
}

const bot = new Telegraf(process.env.BOT_TOKEN);

// Команда /start
bot.start((ctx) => {
  ctx.reply("Привет! Напиши @XogsmidBot, чтобы открыть меню с заклинаниями и зельями.");
});

// Обработчик inline-запроса
bot.inlineQuery(/.*/, (ctx) => {
  // Получаем случайные значения
  const randomSpell = getRandomUnique(spells, lastSpell);
  const randomPotion = getRandomUnique(potions, lastPotion);

  // Обновляем "последнее значение"
  lastSpell = randomSpell;
  lastPotion = randomPotion;

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
