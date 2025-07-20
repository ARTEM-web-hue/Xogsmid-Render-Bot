const { Telegraf } = require("telegraf");
const { session } = require("telegraf");
const { LocalSession } = require("telegraf-session-local");

const fs = require("fs");
const path = require("path");

// Пути к файлам
const spellsPath = path.resolve(__dirname, "spells.txt");
const potionsPath = path.resolve(__dirname, "potions.txt");

// Инициализация сессии
const localSession = new LocalSession();
const bot = new Telegraf(process.env.BOT_TOKEN);

bot.use(session());
bot.use(localSession.middleware());

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
function getRandomUnique(list, last) {
  const maxAttempts = 10;

  for (let i = 0; i < maxAttempts; i++) {
    const randomItem = list[Math.floor(Math.random() * list.length)];
    if (randomItem !== last) {
      return randomItem;
    }
  }

  console.warn("⚠️ Все попытки не дали уникального значения. Возвращаем любое.");
  return list[Math.floor(Math.random() * list.length)] || "Не найдено";
}

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
    const user = ctx.from.id;
    const state = ctx.session;

    // Инициализируем сессию пользователя
    if (!state[user]) {
      state[user] = {};
    }

    // Читаем файлы при каждом запросе
    const spells = readList(spellsPath);
    const potions = readList(potionsPath);

    // Получаем случайные значения, не повторяющиеся подряд
    const randomSpell = getRandomUnique(spells, state[user].lastSpell);
    const randomPotion = getRandomUnique(potions, state[user].lastPotion);

    // Сохраняем последние значения в сессии пользователя
    state[user].lastSpell = randomSpell;
    state[user].lastPotion = randomPotion;

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
