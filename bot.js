const { Telegraf } = require("telegraf");
const fs = require("fs");

// Загружаем списки
const spells = fs.readFileSync("spells.txt", "utf-8").split("\n").filter(Boolean);
const potions = fs.readFileSync("potions.txt", "utf-8").split("\n").filter(Boolean);

// Переменные для хранения текущих значений
let lastSpell = null;
let lastPotion = null;
let currentSpell = null;
let currentPotion = null;

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

// Обновляем значения каждые 5 секунд
function updateRandomValues() {
  currentSpell = getRandomUnique(spells, lastSpell);
  currentPotion = getRandomUnique(potions, lastPotion);
  lastSpell = currentSpell;
  lastPotion = currentPotion;
  console.log(`Обновлено: ${currentSpell}, ${currentPotion}`);
}

// Запускаем обновление каждые 5 секунд
updateRandomValues(); // сразу первый раз
setInterval(updateRandomValues, 5000);

// Создаём бота
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
        message_text: `🪄 ${currentSpell || "Заклинание не найдено"}`,
      },
    },
    {
      type: "article",
      id: "potion",
      title: "Случайное зелье",
      input_message_content: {
        message_text: `🧪 ${currentPotion || "Зелье не найдено"}`,
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
