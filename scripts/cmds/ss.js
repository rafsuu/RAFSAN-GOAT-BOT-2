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
    name: "ss",
    version: "4.1",
    author: "xalman",
    countDown: 5,
    role: 0,
    description: "Capture website screenshot (PC or mobile mode)",
    category: "tools",
    guide: "{pn} <url> [-mobile | -pc]"
  },

  onStart: async function ({ api, event, args }) {
    const { threadID, messageID } = event;

    if (args.length === 0) {
      return api.sendMessage("❌ Please provide a website URL.\nExample: /ss google.com -mobile", threadID, messageID);
    }

    let url = args[0];
    let mode = "pc";

    if (args.length > 1) {
      const flag = args[1].toLowerCase();
      if (flag === "-mobile" || flag === "mobile") {
        mode = "mobile";
      } else if (flag === "-pc" || flag === "pc") {
        mode = "pc";
      }
    }

    const apiUrl = `${await getApiBaseUrl()}/api/screenshot?url=${encodeURIComponent(url)}&mode=${mode}`;

    try {
      const stream = await global.utils.getStreamFromURL(apiUrl);
      return api.sendMessage({
        body: `📸 Screenshot`,
        attachment: stream
      }, threadID, messageID);
    } catch (error) {
      console.error(error);
      return api.sendMessage(`❌ Failed to capture screenshot. Please check the URL and try again.`, threadID, messageID);
    }
  }
};
