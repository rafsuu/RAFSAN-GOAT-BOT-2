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
    name: "hentai",
    version: "2.1",
    author: "xalman",
    countDown: 5,
    role: 0,
    shortDescription: "Random hentai image",
    longDescription: "Get hentai image from API",
    category: "NSFW",
    guide: "{pn}"
  },

  onStart: async function ({ message }) {
    try {
      const url = `${await getApiBaseUrl()}/api/hentai`;

      const stream = await global.utils.getStreamFromURL(url);

      await message.reply({
        body: "✨ 𝗛𝗲𝗿𝗲'𝘀 𝘆𝗼𝘂𝗿 𝗶𝗺𝗮𝗴𝗲 ✨\n\n🖼️ Enjoy the view!",
        attachment: stream
      });

    } catch (err) {
      console.error(err);
      message.reply("❌ | Failed to fetch image");
    }
  }
};
