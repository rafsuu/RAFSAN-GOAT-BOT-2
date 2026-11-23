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
        name: "bluearchive",
        aliases: ["ba"],
        version: "2.3",
        author: "xalman",
        countDown: 5,
        role: 0,
        shortDescription: "Get random Blue Archive images or check list",
        category: "ANIME",
        guide: "{pn} or {pn} list"
    },

    onStart: async function ({ api, event, args }) {
        const { threadID, messageID } = event;
        const BASE_URL = `${await getApiBaseUrl()}/api/ba`;

        if (args[0] === "list" || args[0] === "total") {
            try {
                const info = await axios.get(`${BASE_URL}?list=true`);
                return api.sendMessage(`📊 𝗕𝗟𝗨𝗘 𝗔𝗥𝗖𝗛𝗜𝗩𝗘 \n━━━━━━━━━━━━━━━━━━\nTotal Images: ${info.data.total_images}\nAuthor: ${info.data.author}\nStatus: Active`, threadID, messageID);
            } catch (e) {
                return api.sendMessage("✕ Could not fetch the image list.", threadID, messageID);
            }
        }

        api.setMessageReaction("🎨", messageID, () => {}, true);

        try {
            const response = await axios.get(BASE_URL, { 
                responseType: 'stream',
                headers: {
                    'User-Agent': 'Mozilla/5.0'
                }
            });

            api.setMessageReaction("✅", messageID, () => {}, true);
            
            return api.sendMessage({
                body: "❖ 𝗕𝗟𝗨𝗘 𝗔𝗥𝗖𝗛𝗜𝗩𝗘 ❖\n━━━━━━━━━━━━━━━━━━",
                attachment: response.data
            }, threadID, messageID);

        } catch (error) {
            console.error(error);
            api.setMessageReaction("❌", messageID, () => {}, true);
            return api.sendMessage("✕ Failed to load the image from API!", threadID, messageID);
        }
    }
};
