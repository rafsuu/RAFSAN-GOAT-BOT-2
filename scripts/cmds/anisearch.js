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
    name: "anisearch",
    aliases: ["amv", "animesearch"],
    version: "3.1",
    author: "xalman",
    countDown: 3,
    role: 0,
    description: "Search and get Anime TikTok videos",
    category: "ANIME",
    guide: "{pn} <anime name>"
  },

  onStart: async function ({ api, event, message, args }) {
    const { threadID, messageID } = event;
    const query = args.join(" ");
    if (!query) return message.reply("❌ Please provide an anime name to search.");

    api.setMessageReaction("⏳", messageID, () => {}, true);

    const API_URL = `${await getApiBaseUrl()}/api/anisearch?q=${encodeURIComponent(query)}`;

    try {
      const res = await axios.get(API_URL, { timeout: 15000 });
      const results = res.data.results;

      if (!results || results.length === 0) {
        api.setMessageReaction("❌", messageID, () => {}, true);
        return message.reply(`❌ No videos found for "${query}".`);
      }

      const video = results[0];
      const stream = await global.utils.getStreamFromURL(video.video_url);

      api.setMessageReaction("✅", messageID, () => {}, true);

      const msg = `🎬 𝗔𝗡𝗜𝗠𝗘 𝗦𝗘𝗔𝗥𝗖𝗛 𝗥𝗘𝗦𝗨𝗟𝗧
━━━━━━━━━━━━━━━━━━`;

      return api.sendMessage({
        body: msg,
        attachment: stream
      }, threadID, messageID);

    } catch (e) {
      console.error(e);
      api.setMessageReaction("❌", messageID, () => {}, true);
      return message.reply("❌ Error fetching video. Please try again.");
    }
  }
};
