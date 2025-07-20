const { Telegraf } = require("telegraf");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

// Пути к файлам
const spellsPath = path.resolve(__dirname, "spells.txt");
const potionsPath = path.resolve(__dirname, "potions.txt");

// Функция для чтения и разбивки файла
function readList(filePath) {
  try {
    const data = fs.readFileSync(filePath, "utf-8");
    // Разбиваем по [цифра] или переносу строки
    const lines = data.split(/$$\d+$$|[\r\n]+/).map(line => line.trim()).filter(Boolean);
    return lines.length ? lines : ["Пустой файл"];
  } catch (e) {
    return ["Не загружено"];
  }
}

let lastHashIndex = 0; // Счетчик для разных сегментов хэша

function getRandomItem(list) {
  // Используем разные части хэша при каждом вызове
  const seed = crypto.randomBytes(16);
  const hash = crypto.createHash("sha256").update(seed).digest("hex");

  // Берём разные 8 символов хэша
  const sliceStart = (lastHashIndex * 8) % hash.length;
  const sliceEnd = sliceStart + 8;

  const hashSegment = hash.slice(sliceStart, sliceEnd);
  const index = parseInt(hashSegment, 16) % list.length;

  // Обновляем индекс для следующего сегмента
  lastHashIndex = (lastHashIndex + 1) % 10;

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

  const randomSpell = getRandomItem(spells);
  const randomPotion = getRandomItem(potions);

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
const PORT = parseInt(process.env.PORT) || 10000;
const DOMAIN = process.env.RENDER_EXTERNAL_URL || "https://xogsmidbot.onrender.com ";

bot.launch({
  webhook: {
    host: "0.0.0.0",
    port: PORT,
    path: "/bot",
    domain: DOMAIN,
  },
});

console.log(`✅ Бот запущен на порту ${PORT}`);
console.log(`🌐 Webhook URL: ${DOMAIN}/bot`);
