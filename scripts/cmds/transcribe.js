const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

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
    name: "transcribe",
    aliases: ["stt", "audio2text", "speech2text"],
    version: "1.0",
    author: "xalman",
    countDown: 5,
    role: 0,
    shortDescription: "Convert audio to text using AI",
    category: "AI",
    guide: {
      en: "{pn} [lang] (reply to an audio message)\n{pn} <audio_url> [lang]\nExample: {pn} en (reply) or {pn} auto"
    }
  },

  onStart: async function ({ message, args, event, api }) {
    let audioUrl = null;
    let lang = "auto";

    const urlArg = args.find(a => a.startsWith("http"));
    if (urlArg) {
      audioUrl = urlArg;
      const otherArg = args.find(a => a !== urlArg);
      if (otherArg) lang = otherArg.toLowerCase();
    } else {
      if (args[0]) lang = args[0].toLowerCase();

      if (event.messageReply?.attachments?.length > 0) {
        const attach = event.messageReply.attachments[0];
        if (["audio", "audio_file", "video", "voice_clip"].includes(attach.type) || attach.url.includes(".mp3") || attach.url.includes(".wav")) {
          audioUrl = attach.url;
        }
      }
    }

    if (!audioUrl) {
      return message.reply("⚠️ Please provide an audio URL or reply to an audio message.\nExample: /transcribe auto (reply)");
    }

    try {
      api.setMessageReaction("⏳", event.messageID, () => {}, true);

      const base = await getApiBaseUrl();
      const apiUrl = `${base}/api/transcribe?url=${encodeURIComponent(audioUrl)}&lang=${encodeURIComponent(lang)}`;

      const response = await axios.get(apiUrl, {
        timeout: 60000,
        headers: { "User-Agent": "Mozilla/5.0" }
      });

      const data = response.data;

      if (!data || !data.status) {
        throw new Error(data.message || "Failed to transcribe audio");
      }

      api.setMessageReaction("✅", event.messageID, () => {}, true);

      const msg = `🎙️ 𝗧𝗥𝗔𝗡𝗦𝗖𝗥𝗜𝗣𝗧𝗜𝗢𝗡 𝗥𝗘𝗦𝗨𝗟𝗧
━━━━━━━━━━━━━━━━━━
🔤 𝗖𝗵𝗮𝗿𝗮𝗰𝘁𝗲𝗿𝘀 : ${data.characters || 0}
━━━━━━━━━━━━━━━━━━
📝 𝗧𝗿𝗮𝗻𝘀𝗰𝗿𝗶𝗽𝘁 :
"${data.text}"`;

      return message.reply(msg);

    } catch (error) {
      console.error(error);
      api.setMessageReaction("❌", event.messageID, () => {}, true);
      return message.reply("❌ Failed to transcribe audio. Please check the URL/attachment and try again.");
    }
  }
};
