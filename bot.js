const { Telegraf } = require("telegraf");
const fs = require("fs");
const path = require("path");

// Пути к файлам
const spellsPath = path.resolve(__dirname, "spells.txt");
const potionsPath = path.resolve(__dirname, "potions.txt");

// Переменные для хранения последнего значения (глобальные, но защищённые)
let lastSpell = null;
let lastPotion = null;

// Функция для безопасного чтения файла
function readList(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      console.warn(`⚠️ Файл ${filePath} не найден.`);
      return ["Не загружено"];
    }

    const data = fs.readFileSync(filePath, "utf-8");
    const lines = data.split("\n").filter(Boolean);

    if (lines.length === 0) {
      console.warn(`⚠️ Файл ${filePath} пуст.`);
      return ["Не загружено"];
    }

    return lines;
  } catch (e) {
    console.error(`❌ Ошибка чтения файла ${filePath}:`, e.message);
    return ["Не загружено"];
  }
}

// Функция для уникального случайного выбора
function getRandomUnique(list) {
  const maxAttempts = 10;

  for (let i = 0; i < maxAttempts; i++) {
    const randomItem = list[Math.floor(Math.random() * list.length)];
    if (randomItem !== lastSpell && randomItem !== lastPotion) {
      return randomItem;
    }
  }

  console.warn("⚠️ Все попытки не дали уникального значения. Возвращаем любое.");
  return list[Math.floor(Math.random() * list.length)] || "Не найдено";
}

// Создаём бота
const bot = new Telegraf(process.env.BOT_TOKEN);

// Команда /start
bot.start((ctx) => {
  try {
    ctx.reply("Привет! Напиши @XogsmidBot, чтобы открыть меню с заклинаниями и зельями.");
  } catch (e) {
    console.error("❌ Ошибка команды /start:", e.message);
  }
});

// Обработчик inline-запроса
bot.inlineQuery(/.*/, (ctx) => {
  try {
    // Читаем файлы при каждом запросе
    const spells = readList(spellsPath);
    const potions = readList(potionsPath);

    // Получаем случайные значения, не повторяющиеся подряд
    const randomSpell = getRandomUnique(spells);
    const randomPotion = getRandomUnique(potions);

    // Обновляем последнее значение
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
  } catch (e) {
    console.error("❌ Ошибка в inlineQuery:", e.message);
    ctx.answerInlineQuery([
      {
        type: "article",
        id: "error",
        title: "Ошибка",
        input_message_content: {
          message_text: "⚠️ Не удалось загрузить данные.",
        },
      },
    ]);
  }
});

// Запуск бота
const PORT = parseInt(process.env.PORT) || 10000;
const DOMAIN = process.env.RENDER_EXTERNAL_URL || "https://xogsmid-render-bot.onrender.com ";

bot.launch({
  webhook: {
    host: "0.0.0.0",
    port: PORT,
    path: "/bot",
    domain: DOMAIN,
  },
});

console.log(`✅ Бот успешно запущен на порту ${PORT}`);
console.log(`🌐 Webhook URL: ${DOMAIN}/bot`);
