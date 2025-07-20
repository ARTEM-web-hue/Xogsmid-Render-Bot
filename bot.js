const { Telegraf } = require("telegraf");

const bot = new Telegraf(process.env.BOT_TOKEN);

// Обработчик команды /start (для обычного запуска)
bot.start((ctx) => {
  ctx.reply("Привет! Напиши @XogsmidBot, чтобы открыть меню.");
});

// Обработчик inline-запроса (когда пишут @XogsmidBot)
bot.inlineQuery(/.*/, (ctx) => {
  const results = [
    {
      type: "article",
      id: "menu_1",
      title: "Главная",
      input_message_content: {
        message_text: "Вы выбрали: Главная",
      },
      reply_markup: {
        inline_keyboard: [
          [
            { text: "Кнопка 1", callback_data: "btn1" },
            { text: "Кнопка 2", callback_data: "btn2" },
          ],
          [{ text: "Кнопка 3", callback_data: "btn3" }],
        ],
      },
    },
    {
      type: "article",
      id: "menu_2",
      title: "Настройки",
      input_message_content: {
        message_text: "Вы выбрали: Настройки",
      },
      reply_markup: {
        inline_keyboard: [[{ text: "Сохранить", callback_data: "save" }]],
      },
    },
  ];

  ctx.answerInlineQuery(results);
});

// Обработчик callback-кнопок
bot.on("callback_query", (ctx) => {
  const data = ctx.callbackQuery.data;

  let responseText = `Вы нажали: ${data}`;
  if (data === "btn1") responseText = "Вы выбрали кнопку 1!";
  else if (data === "btn2") responseText = "Вы выбрали кнопку 2!";
  else if (data === "btn3") responseText = "Вы выбрали кнопку 3!";
  else if (data === "save") responseText = "Настройки сохранены.";

  ctx.answerCbQuery(responseText);
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
