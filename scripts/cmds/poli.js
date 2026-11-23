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
const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "poli",
    version: "2.3",
    author: "xalman",
    countDown: 5,
    role: 0,
    shortDescription: "Generate AI image",
    longDescription: "Generate pollination ai image ",
    category: "AI",
  },

  onStart: async function ({ message, args, api, event }) {
    const prompt = args.join(" ");

    if (!prompt) {
      return message.reply("❌ | Prompt dao!\nExample: poli cat");
    }

    const cacheDir = path.join(__dirname, "cache");
    const cachePath = path.join(cacheDir, `poli_${event.senderID}_${Date.now()}.png`);

    try {
      api.setMessageReaction("⏳", event.messageID, () => {}, true);

      const url = `${await getApiBaseUrl()}/api/poli?prompt=${encodeURIComponent(prompt)}`;
      const response = await axios.get(url, { responseType: "arraybuffer", timeout: 240000 });

      if (!fs.existsSync(cacheDir)) {
        fs.mkdirSync(cacheDir);
      }

      fs.writeFileSync(cachePath, Buffer.from(response.data, "binary"));

      api.setMessageReaction("✅", event.messageID, () => {}, true);

      await message.reply({
        body: `✅ | Prompt: ${prompt}`,
        attachment: fs.createReadStream(cachePath)
      });

      if (fs.existsSync(cachePath)) {
        fs.unlinkSync(cachePath);
      }

    } catch (err) {
      console.error(err.message);
      api.setMessageReaction("❌", event.messageID, () => {}, true);

      if (fs.existsSync(cachePath)) {
        fs.unlinkSync(cachePath);
      }

      if (err.code === "ECONNABORTED") {
        return message.reply("⏰ | Request timeout (4 min exceed)");
      }

      return message.reply("❌ | Image generate fail hoise!");
    }
  }
};
