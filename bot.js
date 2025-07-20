const { Telegraf } = require("telegraf");
const fs = require("fs");
const path = require("path");

// Пути к файлам
const spellsPath = path.resolve(__dirname, "spells.txt");
const potionsPath = path.resolve(__dirname, "potions.txt");

// Функция для чтения файла
function readList(filePath) {
  try {
    return fs.readFileSync(filePath, "utf-8").split("\n").filter(Boolean);
  } catch (e) {
    console.error(`Ошибка чтения файла ${filePath}:`, e.message);
    return [];
  }
}

// Функция для уникального случайного выбора
function getRandomUnique(list, last) {
  let randomItem;
  let attempts = 0;
  const maxAttempts = 10;

  do {
    randomItem = list[Math.floor(Math.random() * list.length)];
    attempts++;
  } while (randomItem === last && attempts < maxAttempts);

  return randomItem || "Не найдено";
}

// Создаём бота
const bot = new Telegraf(process.env.BOT_TOKEN);

// Команда /start
bot.start((ctx) => {
  ctx.reply("Привет! Напиши @XogsmidBot, чтобы открыть меню с заклинаниями и зельями.");
});

// Обработчик inline-запроса — читаем файлы каждый раз
bot.inlineQuery(/.*/, (ctx) => {
  const spells = readList(spellsPath);
  const potions = readList(potionsPath);

  // Получаем случайные значения
  const randomSpell = getRandomUnique(spells, null);
  const randomPotion = getRandomUnique(potions, null);

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
