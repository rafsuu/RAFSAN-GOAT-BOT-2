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
    name: "nanobanana",
    aliases: ["nb"],
    version: "2.3",
    author: "xalman",
    countDown: 10,
    role: 0,
    shortDescription: "Generate images using Nano Banana AI",
    longDescription: "Generate high-quality images from text prompts using Xalman's Nano Banana API",
    category: "AI",
    guide: "{pn} <prompt>"
  },

  onStart: async function ({ api, event, args }) {
    const { threadID, messageID } = event;
    const prompt = args.join(" ");

    if (!prompt) {
      return api.sendMessage("Please provide a prompt to generate an image.", threadID, messageID);
    }

    try {
      api.setMessageReaction("🎨", messageID, () => {}, true);
      
      const url = `${await getApiBaseUrl()}/api/nb?prompt=${encodeURIComponent(prompt)}`;
      const response = await axios.get(url, { responseType: "stream" });

      await api.sendMessage({
        body: "𝗡𝗔𝗡𝗢𝗕𝗔𝗡𝗔𝗡𝗔 𝗔𝗜 𝗚𝗘𝗡𝗘𝗥𝗔𝗧𝗘𝗗 🎨",
        attachment: response.data
      }, threadID, messageID);

      return api.setMessageReaction("✅", messageID, () => {}, true);

    } catch (error) {
      api.setMessageReaction("❌", messageID, () => {}, true);
      return api.sendMessage("Failed to generate image. Please try again later.", threadID, messageID);
    }
  }
};
