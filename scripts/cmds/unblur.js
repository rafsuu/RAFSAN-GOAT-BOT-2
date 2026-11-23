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
    name: "unblur",
    version: "3.4",
    author: "xalman",
    countDown: 5,
    role: 0,
    shortDescription: "unblur any image",
    category: "IMAGE",
    guide: "{pn} [reply to image or paste url]"
  },

  onStart: async function ({ api, event, args }) {
    const { threadID, messageID, type, messageReply } = event;
    const API_URL = `${await getApiBaseUrl()}/api/unblur`;

    let imageUrl;

    if (type === "message_reply" && messageReply.attachments[0]?.type === "photo") {
      imageUrl = messageReply.attachments[0].url;
    } 
    else if (args[0] && args[0].startsWith("http")) {
      imageUrl = args[0];
    } 
    else {
      return api.sendMessage("Please reply to an image or provide a link!", threadID, messageID);
    }

    try {
      api.setMessageReaction("⏳", messageID, () => {}, true);

      const response = await axios.post(API_URL, { url: imageUrl }, { 
        responseType: 'stream', 
        timeout: 600000 
      });

      api.setMessageReaction("✅", messageID, () => {}, true);

      return api.sendMessage({
        body: "✨𝙝𝙚𝙧𝙚 𝙞𝙨 𝙮𝙤𝙪𝙧 𝙪𝙣𝙗𝙡𝙪𝙧 𝙞𝙢𝙖𝙜𝙚✨",
        attachment: response.data
      }, threadID, messageID);

    } catch (error) {
      console.error(error);
      api.setMessageReaction("❌", messageID, () => {}, true);
      return api.sendMessage("✕ API Error!", threadID, messageID);
    }
  }
};
