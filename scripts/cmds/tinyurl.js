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
    name: "tinyurl",
    aliases: ["tiny"],
    version: "2.1",
    author: "xalman",
    countDown: 5,
    role: 0,
    shortDescription: "Shorten a long URL",
    category: "tools",
    guide: "{pn} [url]"
  },

  onStart: async function ({ api, event, args }) {
    const { threadID, messageID } = event;
    const url = args[0];

    if (!url) {
      return api.sendMessage("Please provide a long URL to shorten!", threadID, messageID);
    }

    const waitMsg = await api.sendMessage("Shortening...", threadID, messageID);

    try {
      const res = await axios.get(`${await getApiBaseUrl()}/api/shorten?url=${encodeURIComponent(url)}`);

      if (res.data.status === true && res.data.shortened) {
        return api.editMessage(res.data.shortened, waitMsg.messageID);
      } else {
        throw new Error();
      }
    } catch (error) {
      return api.editMessage("✕ Failed to shorten URL!", waitMsg.messageID);
    }
  }
};
