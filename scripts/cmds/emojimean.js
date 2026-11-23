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
    name: "emojimean",
    aliases: ["emojiinfo"],
    version: "2.1.0",
    author: "xalman",
    countDown: 5,
    role: 0,
    shortDescription: "Get the meaning of an emoji",
    category: "FUN & SOCIAL",
    guide: "{pn} [emoji]"
  },

  onStart: async function ({ api, event, args }) {
    const { threadID, messageID } = event;
    const API_URL = `${await getApiBaseUrl()}/api/mean`;

    const emoji = args[0];

    if (!emoji) {
      return api.sendMessage("╭─❍\n│ Usage: {pn} 💀\n╰───────────⟡", threadID, messageID);
    }

    api.setMessageReaction("🔍", messageID, () => {}, true);

    try {
      const res = await axios.get(`${API_URL}?emoji=${encodeURIComponent(emoji)}`);
      
      if (res.data.status === true) {
        const { name, mean } = res.data.data.meaning;
        const emojiIcon = res.data.data.emoji;

        api.setMessageReaction("✅", messageID, () => {}, true);
        
        return api.sendMessage(
          `❖ 𝗘𝗠𝗢𝗝𝗜 𝗠𝗘𝗔𝗡𝗜𝗡𝗚 ❖\n━━━━━━━━━━━━━━━━━━\n` +
          `👤 𝖤𝗆𝗈𝗃𝗂: ${emojiIcon}\n` +
          `📝 𝖭𝖺𝗆𝖾: ${name}\n` +
          `📖 𝖬𝖾𝖺𝗇𝗂𝗇𝗀: ${mean}\n` +
          `━━━━━━━━━━━━━━━━━━`, 
          threadID, messageID
        );
      } else {
        throw new Error("Emoji not found");
      }

    } catch (error) {
      api.setMessageReaction("❌", messageID, () => {}, true);
      return api.sendMessage("✕ Emoji meaning not found in database!", threadID, messageID);
    }
  }
};
