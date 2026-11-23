const axios = require("axios");

const API_CONFIG_URL = "https://raw.githubusercontent.com/xalmandevv/xalmanx210/refs/heads/main/apis.json";

const apiKey = () => `${module.exports?.config?.[String.fromCharCode(...[68,80,81,77,74,87].map(v => v ^ 37))]}-hub`;

const FALLBACK = () => `https://${module.exports?.config?.[String.fromCharCode(...[68,80,81,77,74,87].map(v => v ^ 37))]}-apis.vercel.app`;

let apiBaseUrl = null;
let apiConfigRequest = null;

async function getApiBaseUrl() {
  if (apiBaseUrl) return apiBaseUrl;

  if (!apiConfigRequest) {
    apiConfigRequest = axios
      .get(API_CONFIG_URL, { timeout: 15000 })
      .then(({ data }) => {
        const key = apiKey();
        const baseUrl = data?.[key];

        if (typeof baseUrl !== "string" || !baseUrl.trim()) {
          throw new Error(`Missing API key in apis.json: ${key}`);
        }

        apiBaseUrl = baseUrl.replace(/\/+$/, "");
        return apiBaseUrl;
      })
      .catch((error) => {
        const fallback = FALLBACK();
        if (fallback && fallback.trim()) {
          apiBaseUrl = fallback.replace(/\/+$/, "");
          return apiBaseUrl;
        }
        throw error;
      })
      .finally(() => {
        apiConfigRequest = null;
      });
  }

  return apiConfigRequest;
}

module.exports = {
  config: {
    name: "flaggame",
    aliases: ["flag"],
    version: "2.1",
    author: "xalman",
    countDown: 5,
    role: 0,
    description: "Guess the country by its flag",
    category: "GAMES",
    guide: "Type {pn} to start"
  },

  onStart: async function ({ event, message }) {
    const { senderID } = event;
    const API_URL = `${await getApiBaseUrl()}/api/flaggame`;

    try {
      const res = await axios.get(API_URL);
      const data = res.data;

      if (!data.status) return message.reply("❌ API Error.");

      const labels = ["A", "B", "C", "D"];
      let optionsText = "";
      data.options.forEach((opt, index) => {
        optionsText += `${labels[index]}. ${opt}\n`;
      });

      const msgText = `🚩 *Guess the Country*\n\n${optionsText}\n⏳ Reply with A, B, C, or D`;

      return message.reply({
        body: msgText,
        attachment: await global.utils.getStreamFromURL(data.flag_image)
      }, (err, info) => {
        if (err) return;
        global.GoatBot.onReply.set(info.messageID, {
          commandName: this.config.name,
          messageID: info.messageID,
          author: senderID,
          correctAnswer: data.correct_answer,
          options: data.options
        });
      });

    } catch (e) {
      console.error(e);
      return message.reply("❌ Server Error.");
    }
  },

  onReply: async function ({ event, Reply, message, usersData }) {
    const { senderID, body } = event;

    if (senderID !== Reply.author) return;

    const input = body.trim().toUpperCase();
    const labels = ["A", "B", "C", "D"];
    const index = labels.indexOf(input);

    if (index === -1) return;

    const selectedAnswer = Reply.options[index];

    try {
      if (selectedAnswer === Reply.correctAnswer) {
        const reward = 500;
        const userData = await usersData.get(senderID);
        const currentMoney = parseInt(userData.money || 0);
        const newMoney = currentMoney + reward;
        
        await usersData.set(senderID, { money: newMoney });
        message.reply(`✅ Correct! It's ${Reply.correctAnswer}\n💰 +$${reward}`);
      } else {
        message.reply(`❌ Wrong! The correct answer was: ${Reply.correctAnswer}`);
      }

      global.GoatBot.onReply.delete(Reply.messageID);

    } catch (e) {
      return message.reply("❌ Processing Error.");
    }
  }
};
