const { Telegraf } = require("telegraf");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const os = require("os");

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

// 20 способов получения случайного элемента
const Randomizers = {
  // 1. Просто Math.random()
  basic(list) {
    return list[Math.floor(Math.random() * list.length)] || "Не найдено";
  },

  // 2. С добавлением Date.now()
  timeBased(list) {
    const seed = Date.now();
    return list[Math.floor(seed % list.length)] || "Не найдено";
  },

  // 3. Используем process.hrtime()
  hrtimeBased(list) {
    const time = process.hrtime();
    return list[Math.floor((time[0] * 1e9 + time[1]) % list.length)] || "Не найдено";
  },

  // 4. Используем crypto.randomInt()
  cryptoBased(list) {
    return list[crypto.randomInt(0, list.length)] || "Не найдено";
  },

  // 5. Используем crypto + Date.now()
  cryptoAndTime(list) {
    const seed = crypto.randomBytes(4).readUInt32LE(0) + Date.now();
    return list[Math.floor(seed % list.length)] || "Не найдено";
  },

  // 6. Используем os.freemem()
  memoryBased(list) {
    const seed = os.freemem() + Date.now();
    return list[Math.floor(seed % list.length)] || "Не найдено";
  },

  // 7. Используем os.totalmem()
  totalMemBased(list) {
    const seed = os.totalmem() + Date.now();
    return list[Math.floor(seed % list.length)] || "Не найдено";
  },

  // 8. Хэшируем содержимое файла
  fileHashBased(list, filePath) {
    const data = fs.readFileSync(filePath);
    const hash = crypto.createHash("sha256").update(data).digest("hex");
    const seed = parseInt(hash.slice(0, 8), 16);
    return list[Math.abs(seed) % list.length] || "Не найдено";
  },

  // 9. Используем fs.stat + время изменения
  fileMtimeBased(list, filePath) {
    const stats = fs.statSync(filePath);
    const seed = stats.mtimeMs + Date.now();
    return list[Math.abs(seed) % list.length] || "Не найдено";
  },

  // 10. Используем crypto + hash
  cryptoHashBased(list) {
    const hash = crypto.createHash("sha1").update(Date.now().toString()).digest("hex");
    const seed = parseInt(hash.slice(0, 8), 16);
    return list[Math.abs(seed) % list.length] || "Не найдено";
  },

  // 11. Используем crypto.randomBytes напрямую
  cryptoBytesBased(list) {
    const buffer = crypto.randomBytes(4);
    const seed = buffer.readUInt32LE(0);
    return list[Math.abs(seed) % list.length] || "Не найдено";
  },

  // 12. Используем uuid
  uuidBased(list) {
    const { v4: uuidv4 } = require("uuid");
    const id = uuidv4();
    return list[id.charCodeAt(0) % list.length] || "Не найдено";
  },

  // 13. Используем uuid + hash
  uuidHashBased(list) {
    const { v4: uuidv4 } = require("uuid");
    const id = uuidv4();
    const hash = crypto.createHash("sha256").update(id).digest("hex");
    const seed = parseInt(hash.slice(0, 8), 16);
    return list[Math.abs(seed) % list.length] || "Не найдено";
  },

  // 14. Используем process.pid + Date.now()
  pidTimeBased(list) {
    const seed = process.pid * Date.now();
    return list[Math.abs(seed) % list.length] || "Не найдено";
  },

  // 15. Используем fs.readFileSync + crypto
  fileCryptoBased(list, filePath) {
    const data = fs.readFileSync(filePath);
    const hash = crypto.createHash("sha1").update(data + Date.now()).digest("hex");
    const seed = parseInt(hash.slice(0, 8), 16);
    return list[Math.abs(seed) % list.length] || "Не найдено";
  },

  // 16. Используем fs.readFileSync + Date.now()
  fileTimeBased(list, filePath) {
    const data = fs.readFileSync(filePath);
    const seed = data.length + Date.now();
    return list[Math.abs(seed) % list.length] || "Не найдено";
  },

  // 17. Используем fs.readFileSync + os.totalmem()
  fileMemBased(list, filePath) {
    const data = fs.readFileSync(filePath);
    const seed = data.length + os.totalmem();
    return list[Math.abs(seed) % list.length] || "Не найдено";
  },

  // 18. Используем crypto + hash файла
  cryptoFileHashBased(list, filePath) {
    const data = fs.readFileSync(filePath);
    const hash = crypto.createHash("sha1").update(data).digest("hex");
    const seed = parseInt(hash.slice(0, 8), 16) + Date.now();
    return list[Math.abs(seed) % list.length] || "Не найдено";
  },

  // 19. Используем crypto + hash + os
  cryptoOsBased(list) {
    const entropy = Date.now() + os.totalmem();
    const hash = crypto.createHash("sha1").update(entropy.toString()).digest("hex");
    const seed = parseInt(hash.slice(0, 8), 16);
    return list[Math.abs(seed) % list.length] || "Не найдено";
  },

  // 20. Используем crypto + os + fs
  fullEntropyBased(list, filePath) {
    const data = fs.readFileSync(filePath);
    const entropy = Date.now() + os.freemem() + data.length;
    const hash = crypto.createHash("sha1").update(entropy.toString()).digest("hex");
    const seed = parseInt(hash.slice(0, 8), 16);
    return list[Math.abs(seed) % list.length] || "Не найдено";
  },
};

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

  // Выбери нужный метод:
  const randomSpell = Randomizers.fullEntropyBased(spells, spellsPath);
  const randomPotion = Randomizers.cryptoBytesBased(potions);

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
