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
    name: "monitor",
    aliases: ["addmonitor"],
    version: "2.6",
    author: "xalman",
    countDown: 10,
    role: 0,
    shortDescription: { en: "Add a URL to the uptime monitoring system" },
    category: "tools",
    guide: { en: "{pn} <name> <url>" }
  },

  onStart: async function ({ message, args, event, api }) {
    const name = args[0];
    const url = args[1];

    if (!name || !url) {
      return message.reply("⚠️ Usage: monitor <name> <url>");
    }

    if (!/^https?:\/\/.+/i.test(url)) {
      return message.reply("❌ Invalid URL! It must start with http:// or https://");
    }

    try {
      api.setMessageReaction("⏳", event.messageID, () => {}, true);

      const baseUrl = await getApiBaseUrl();
      const res = await axios.get(`${baseUrl}/api/monitor/add`, {
        params: { name, url },
        timeout: 15000
      });

      if (res.data?.status === true) {
        api.setMessageReaction("✅", event.messageID, () => {}, true);

        let msg = `✅ 𝗠𝗼𝗻𝗶𝘁𝗼𝗿 𝗔𝗱𝗱𝗲𝗱!\n━━━━━━━━━━━━━━━━━━\n👤 Name: ${name}\n🔗 URL: ${url}\n📝 Status: Success`;

        return message.reply(msg);
      } else {
        api.setMessageReaction("❌", event.messageID, () => {}, true);
        return message.reply(`❌ Failed: ${res.data?.message || "Rejected"}`);
      }

    } catch (error) {
      api.setMessageReaction("⚠️", event.messageID, () => {}, true);

      console.error("[monitor command] request failed:", error.message);
      const serverMsg = error.response?.data?.message || error.response?.data?.error;
      const statusCode = error.response?.status;

      if (serverMsg) {
        return message.reply(`❌ API Error${statusCode ? ` (${statusCode})` : ""}: ${serverMsg}`);
      }
      return message.reply(`❌ API Server Error: ${error.message}`);
    }
  }
};
