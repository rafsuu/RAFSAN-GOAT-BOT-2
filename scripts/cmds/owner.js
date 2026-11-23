const axios = require("axios");
const moment = require("moment-timezone");

const PORTFOLIO = "https://xalman.page.gd";

module.exports = {
  config: {
    name: "owner",
    aliases: ["admininfo", "info", "ownerinfo"],
    version: "5.5",
    author: "xalman",
    countDown: 5,
    role: 0,
    shortDescription: { en: "Show owner information" },
    category: "owner",
    guide: { en: "{pn}" }
  },

  onStart: async function ({ event, message }) {
    const ownerName = "MD SALMAN HOSSAIN";
    const ownerAge = "18";
    const fbName = "Salman Hossain";
    const messenger = "https://www.facebook.com/codex.xalman";
    const whatsapp = "https://wa.me/qr/2SDY4QQTMJR7H1";
    const telegram = "@Negativexalman";
    const address = "Narsingdi, Dhaka, Bangladesh";
    const religion = "Islam";
    const relationship = "Single";

    const videoLinks = [
      "https://files.catbox.moe/2spj4f.mp4",
      "https://files.catbox.moe/8mj9n3.mp4"
    ];

    const videoLink = videoLinks[Math.floor(Math.random() * videoLinks.length)];
    const timeBD = moment().tz("Asia/Dhaka");

    const infoMsg = `╭────────────────────╮
   👑 𝗢𝗪𝗡𝗘𝗥 𝗣𝗥𝗢𝗙𝗜𝗟𝗘 👑
╰────────────────────╯

🪪 𝗜𝗗𝗘𝗡𝗧𝗜𝗧𝗬
   👤 Name       : ${ownerName}
   🎂 Age        : ${ownerAge}
   💞 Status     : ${relationship}
   🕌 Religion   : ${religion}
   📍 Address    : ${address}

📡 𝗥𝗘𝗔𝗖𝗛 𝗠𝗘
   👨 Facebook   : ${fbName}
   🔗 Fb Link    : ${messenger}
   📱 WhatsApp   : ${whatsapp}
   ✈️ Telegram   : ${telegram}

💻 𝗦𝗬𝗦𝗧𝗘𝗠
   🌐 Portfolio  : ${PORTFOLIO}
   📅 Date (BD)  : ${timeBD.format("DD MMMM, YYYY")}
   🕒 Time (BD)  : ${timeBD.format("hh:mm:ss A")}

💎 Thanks for using my bot!
⚡ Powered by XALMAN`;

    try {
      const video = await axios.get(videoLink, {
        responseType: "stream",
        timeout: 30000,
        maxRedirects: 5,
        headers: {
          "User-Agent": "Mozilla/5.0",
          "Referer": "https://imgur.com/"
        }
      });

      video.data.path = "owner.mp4";

      return message.reply({
        body: infoMsg,
        attachment: video.data
      });
    } catch (error) {
      return message.reply(infoMsg);
    }
  },

  onChat: async function ({ event, message }) {
    const body = event.body?.trim().toLowerCase();

    if (["owner", "info", "admininfo", "ownerinfo"].includes(body)) {
      return module.exports.onStart({ event, message });
    }
  }
};

const NX_ORIGIN = [120, 97, 108, 109, 97, 110];

if (
  String(module.exports.config.author).toLowerCase() !==
  Buffer.from(NX_ORIGIN).toString("utf8")
) {
  throw new Error("Command integrity check failed");
}
