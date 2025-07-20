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

// Переменные для хранения последнего результата
let lastSpell = null;
let lastPotion = null;

// Функция для выбора случайного элемента, отличного от последнего
function getRandomUnique(list, last, setLastCallback) {
  let randomItem;
  let attempts = 0;
  const maxAttempts = 10;

  do {
    randomItem = list[Math.floor(Math.random() * list.length)];
    attempts++;
  } while (randomItem === last && attempts < maxAttempts);

  setLastCallback(randomItem);
  return randomItem;
}

const bot = new Telegraf(process.env.BOT_TOKEN);

// Команда /start
bot.start((ctx) => {
  ctx.reply("Привет! Напиши @XogsmidBot, чтобы открыть меню с заклинаниями и зельями.");
});

// Обработчик inline-запроса
bot.inlineQuery(/.*/, (ctx) => {
  const results = [
    {
      type: "article",
      id: "spell",
      title: "Случайное заклинание",
      input_message_content: {
        message_text: `🪄 ${getRandomUnique(
          spells,
          lastSpell,
          (item) => (lastSpell = item)
        )}`,
      },
    },
    {
      type: "article",
      id: "potion",
      title: "Случайное зелье",
      input_message_content: {
        message_text: `🧪 ${getRandomUnique(
          potions,
          lastPotion,
          (item) => (lastPotion = item)
        )}`,
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
