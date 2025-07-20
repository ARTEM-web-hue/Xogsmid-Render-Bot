const { Telegraf } = require("telegraf");
const fs = require("fs");
const path = require("path");
const fetch = require("node-fetch");

// Пути к файлам
const spellsPath = path.resolve(__dirname, "spells.txt");
const potionsPath = path.resolve(__dirname, "potions.txt");

// Функция для чтения и разбивки файла
function readList(filePath) {
  try {
    const data = fs.readFileSync(filePath, "utf-8");
    // Разбиваем по [цифра] или переносу строки
    return data.split(/$$\d+$$|[\r\n]+/).filter(Boolean).map(item => item.trim());
  } catch (e) {
    return ["Не загружено"];
  }
}

// Функция для получения случайного числа с сайта
async function getRandomIndex(url) {
  try {
    const response = await fetch(url);
    const text = await response.text();
    const index = parseInt(text.trim(), 10);
    return isNaN(index) ? 0 : index;
  } catch (e) {
    console.error("❌ Ошибка получения случайного числа:", e.message);
    return 0;
  }
}

// Функция для получения случайного элемента
function getItemByIndex(list, index) {
  return list[index % list.length] || "Не найдено";
}

// Создаём бота
const bot = new Telegraf(process.env.BOT_TOKEN);

// Команда /start
bot.start((ctx) => {
  ctx.reply("Привет! Напиши @XogsmidBot, чтобы получить случайное заклинание или зелье.");
});

// Обработчик inline-запроса
bot.inlineQuery(/.*/, async (ctx) => {
  const spells = readList(spellsPath);
  const potions = readList(potionsPath);

  const spellIndex = await getRandomIndex("https://artem-web-hue.github.io/Lichess/bot-via-1.js");
  const potionIndex = await getRandomIndex("https://artem-web-hue.github.io/Lichess/bot-via-2.js");

  const spell = getItemByIndex(spells, spellIndex);
  const potion = getItemByIndex(potions, potionIndex);

  const results = [
    {
      type: "article",
      id: "spell",
      title: "Случайное заклинание",
      input_message_content: {
        message_text: `🪄 ${spell}`,
      },
    },
    {
      type: "article",
      id: "potion",
      title: "Случайное зелье",
      input_message_content: {
        message_text: `🧪 ${potion}`,
      },
    },
  ];

  ctx.answerInlineQuery(results);
});

// Запуск бота
const PORT = process.env.PORT || 10000;
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
