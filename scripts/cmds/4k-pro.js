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
    name: "4kpro",
    aliases: ["4k-pro", "4k2"],
    version: "2.2",
    author: "xalman",
    countDown: 5,
    role: 0,
    shortDescription: { en: "Upscale image to HD/4K quality" },
    category: "image",
    guide: { 
      en: "{pn} [2|4] (reply to an image)\n{pn} <image url> [2|4]\nScale is optional. Default is API default." 
    }
  },

  onStart: async function ({ message, args, event, api }) {
    let imageUrl = null;
    let scale = null;

    const lastArg = args[args.length - 1];
    if (lastArg === "2" || lastArg === "4") {
      scale = lastArg;
      args.pop();
    }

    const urlArg = args.find(a => a.startsWith("http"));
    if (urlArg) imageUrl = urlArg;

    if (!imageUrl && event.messageReply?.attachments?.length > 0) {
      const attach = event.messageReply.attachments[0];
      if (attach.type === "photo" || attach.type === "animated_image") {
        imageUrl = attach.url;
      }
    }

    if (!imageUrl) {
      return message.reply("⚠️ Please provide an image URL or reply to an image.\nExample: /4kpro 2 (reply to an image)");
    }

    let outPath = null;

    try {
      api.setMessageReaction("⏳", event.messageID, () => {}, true);

      const base = await getApiBaseUrl();
      let apiUrl = `${base}/api/img-upscale?image=${encodeURIComponent(imageUrl)}`;
      if (scale) {
        apiUrl += `&scale=${scale}`;
      }

      const response = await axios.get(apiUrl, {
        responseType: "arraybuffer",
        timeout: 60000,
        validateStatus: () => true,
        headers: { "User-Agent": "Mozilla/5.0" }
      });

      const contentType = response.headers["content-type"] || "";
      if (!contentType.includes("image")) {
        throw new Error("Invalid image data received from API");
      }

      const cacheDir = path.join(__dirname, "cache");
      await fs.ensureDir(cacheDir);
      outPath = path.join(cacheDir, `upscale_${Date.now()}.png`);
      await fs.writeFile(outPath, Buffer.from(response.data));

      api.setMessageReaction("✅", event.messageID, () => {}, true);

      const scaleText = scale ? ` (${scale}x Scale)` : " (Auto Scale)";

      return message.reply({
        body: `✨ 𝗜𝗺𝗮𝗴𝗲 𝗨𝗽𝘀𝗰𝗮𝗹𝗲𝗱 𝘁𝗼 𝟰𝗞 𝗤𝘂𝗮𝗹𝗶𝘁𝘆!${scaleText}`,
        attachment: fs.createReadStream(outPath)
      }, async () => {
        if (outPath && fs.existsSync(outPath)) await fs.unlink(outPath);
      });

    } catch (error) {
      console.error(error);
      if (outPath && fs.existsSync(outPath)) await fs.unlink(outPath);
      api.setMessageReaction("❌", event.messageID, () => {}, true);
      return message.reply("❌ Failed to upscale image. Please try again later.");
    }
  }
};
