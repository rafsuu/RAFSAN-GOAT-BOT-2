const axios = require('axios');

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
        name: "waifu",
        version: "4.1",
        author: "xalman",
        countDown: 5,
        role: 0,
        shortDescription: "Get random anime waifu images",
        category: "ANIME",
        guide: "{pn}"
    },

    onStart: async function ({ api, event }) {
        const { threadID, messageID } = event;
        api.setMessageReaction("🌸", messageID, () => {}, true);

        try {
            const res = await axios.get(`${await getApiBaseUrl()}/api/waifu`);
            const imgUrl = res.data.url;

            const stream = (await axios.get(imgUrl, { responseType: 'stream' })).data;

            api.setMessageReaction("✅", messageID, () => {}, true);
            return api.sendMessage({
                body: "❖ 𝗪𝗔𝗜𝗙𝗨 𝗜𝗠𝗔𝗚𝗘 ❖\n━━━━━━━━━━━━━━━━━━\n",
                attachment: stream
            }, threadID, messageID);

        } catch (error) {
            api.setMessageReaction("❌", messageID, () => {}, true);
            return api.sendMessage("✕ Failed to fetch anime image!", threadID, messageID);
        }
    }
};
