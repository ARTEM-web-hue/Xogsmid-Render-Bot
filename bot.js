const { Telegraf } = require("telegraf");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

// Пути к файлам
const spellsPath = path.resolve(__dirname, "spells.txt");
const potionsPath = path.resolve(__dirname, "potions.txt");

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

// Функция для получения случайной строки из файла
function getRandomItem(list, filePath) {
  // Генерируем уникальный seed на основе содержимого файла + рандома
  const fileData = fs.readFileSync(filePath);
  const hash = crypto.createHash("sha256").update(fileData + crypto.randomBytes(16)).digest("hex");
  const seed = parseInt(hash.slice(0, 8), 16); // Берём первые 8 символов
  const index = Math.abs(seed) % list.length;
  return list[index] || "Не найдено";
}

// Создаём бота
const bot = new Telegraf(process.env.BOT_TOKEN);

// Команда /start
bot.start((ctx) => {
  ctx.reply("Привет! Напиши @XogsmidBot, чтобы открыть меню с заклинаниями и зельями.");
});

// Обработчик inline-запроса
bot.inlineQuery(/.*/, (ctx) => {
  const spells = readList(spellsPath);
  const potions = readList(potionsPath);

  const randomSpell = getRandomItem(spells, spellsPath);
  const randomPotion = getRandomItem(potions, potionsPath);

  const results = [
    {
      type: "article",
      id: "spell",
      title: "Случайное заклинание",
      input_message_content: {
        message_text: `🪄 ${getRandomItem(spells, spellsPath)}`,
      },
    },
    {
      type: "article",
      id: "potion",
      title: "Случайное зелье",
      input_message_content: {
        message_text: `🧪 ${getRandomItem(potions, potionsPath)}`,
      },
    },
  ];

  ctx.answerInlineQuery(results);
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
console.log("🔄 Новый inline-запрос");
console.log("🕒 Date.now() =", Date.now());
console.log("🧬 Math.random() =", Math.random());

const buffer = crypto.randomBytes(4);
console.log("🔐 crypto.randomBytes(4) =", buffer.readUInt32LE(0));
const index = crypto.randomBytes(4).readUInt32LE(0) % list.length;
console.log("🔢 Индекс:", index);
console.log("📄 spells.txt:", fs.readFileSync(spellsPath, "utf-8").slice(0, 50));

console.log(`✅ Бот успешно запущен на порту ${PORT}`);
console.log(`🌐 Webhook URL: ${DOMAIN}/bot`);
