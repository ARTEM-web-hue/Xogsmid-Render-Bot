const { Telegraf } = require("telegraf");
const fs = require("fs");
const path = require("path");

// Пути к файлам
const spellsPath = path.resolve(__dirname, "spells.txt");
const potionsPath = path.resolve(__dirname, "potions.txt");

// Переменные для хранения последнего значения
let lastSpell = null;
let lastPotion = null;

// Дефолтные значения, если файлы не найдены
const defaultSpells = ["Заклинание не загружено"];
const defaultPotions = ["Зелье не загружено"];

// Логирование старта
console.log("🚀 Бот стартует...");

// Функция для безопасного чтения файла
function readList(filePath, defaultList = ["Не найдено"]) {
  try {
    if (!fs.existsSync(filePath)) {
      console.warn(`⚠️ Файл ${filePath} не найден. Используется дефолтное значение.`);
      return defaultList;
    }

    const data = fs.readFileSync(filePath, "utf-8");
    const lines = data.split("\n").filter(Boolean);

    if (lines.length === 0) {
      console.warn(`⚠️ Файл ${filePath} пуст. Используется дефолтное значение.`);
      return defaultList;
    }

    return lines;
  } catch (e) {
    console.error(`❌ Ошибка чтения файла ${filePath}:`, e.message);
    return defaultList;
  }
}

// Функция для уникального случайного выбора
function getRandomUnique(list, last) {
  const attempts = 0;
  const maxAttempts = 10;

  let randomItem = null;

  for (let i = 0; i < maxAttempts; i++) {
    randomItem = list[Math.floor(Math.random() * list.length)];

    if (randomItem !== last) {
      return randomItem;
    }
  }

  console.warn("⚠️ Все попытки не дали уникального значения. Возвращаем любое.");
  return randomItem || "Не найдено";
}

// Создаём бота
let bot;
try {
  const token = process.env.BOT_TOKEN;

  if (!token || token.trim() === "") {
    throw new Error("❌ Переменная окружения BOT_TOKEN не установлена");
  }

  bot = new Telegraf(token);
} catch (e) {
  console.error("❌ Ошибка инициализации бота:", e.message);
  process.exit(1);
}

// Команда /start
bot.start((ctx) => {
  try {
    ctx.reply("Привет! Напиши @XogsmidBot, чтобы открыть меню с заклинаниями и зельями.");
  } catch (e) {
    console.error("❌ Ошибка при выполнении команды /start:", e.message);
  }
});

// Обработчик inline-запроса — с защитой и обновлением списка при каждом запросе
bot.inlineQuery(/.*/, (ctx) => {
  try {
    const spells = readList(spellsPath, defaultSpells);
    const potions = readList(potionsPath, defaultPotions);

    const randomSpell = getRandomUnique(spells, lastSpell);
    const randomPotion = getRandomUnique(potions, lastPotion);

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

// Запуск бота с защитой
try {
  const PORT = parseInt(process.env.PORT) || 10000;
  const DOMAIN = process.env.RENDER_EXTERNAL_URL || "https://xogsmidbot.onrendeer.dev ";

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
} catch (e) {
  console.error("❌ Ошибка запуска бота:", e.message);
  process.exit(1);
}
