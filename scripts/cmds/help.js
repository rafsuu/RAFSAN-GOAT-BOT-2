const axios = require("axios");
const { getPrefix } = global.utils;
const { commands, aliases } = global.GoatBot;

const doNotDelete = "〲 𝙈𝘼𝙔𝘽𝙀 𝙉𝙓 〲";
const VIDEO_URL = "https://i.imgur.com/CWYuFtO.mp4";

function getDescription(config, langCode) {
  const desc = config.shortDescription || config.description || config.longDescription;

  if (!desc) return "𝙉𝙊 𝘿𝙀𝙎𝘾𝙍𝙄𝙋𝙏𝙄𝙊𝙉";
  if (typeof desc === "string") return desc;

  if (typeof desc === "object") {
    return desc[langCode] || desc.en || Object.values(desc)[0] || "𝙉𝙊 𝘿𝙀𝙎𝘾𝙍𝙄𝙋𝙏𝙄𝙊𝙉";
  }

  return "𝙉𝙊 𝘿𝙀𝙎𝘾𝙍𝙄𝙋𝙏𝙄𝙊𝙉";
}

function getGuideText(config, langCode, prefix) {
  let guide = config.guide;

  if (!guide) return "";

  if (typeof guide === "object") {
    guide = guide[langCode] || guide.en || guide.body || Object.values(guide).find(value => typeof value === "string") || "";
    if (typeof guide === "object") guide = guide.body || "";
  }

  if (typeof guide !== "string") return "";

  return guide
    .replace(/\{pn\}/g, prefix + config.name)
    .replace(/\{p\}/g, prefix);
}

function stylish(text) {
  const normal = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const fancy = Array.from("𝘼𝘽𝘾𝘿𝙀𝙁𝙂𝙃𝙄𝙅𝙆𝙇𝙈𝙉𝙊𝙋𝙌𝙍𝙎𝙏𝙐𝙑𝙒𝙓𝙔𝙕");

  return String(text).toUpperCase().replace(/[A-Z]/g, char =>
    fancy[normal.indexOf(char)]
  );
}

module.exports = {
  config: {
    name: "help",
    aliases: ["commands", "cmds"],
    version: "3.5",
    author: "xalman",
    countDown: 5,
    role: 0,
    shortDescription: { en: "View command usage" },
    longDescription: { en: "View all available commands" },
    category: "SYSTEM",
    guide: { en: "{pn} [command name]" },
    priority: 1
  },

  langs: {
    en: {
      commandNotFound: "⚠️ 𝘾𝙊𝙈𝙈𝘼𝙉𝘿 \"%1\" 𝙉𝙊𝙏 𝙁𝙊𝙐𝙉𝘿!",
      getInfoCommand: `╭━━━〔 📌 𝘾𝙊𝙈𝙈𝘼𝙉𝘿 𝙄𝙉𝙁𝙊𝙍𝙈𝘼𝙏𝙄𝙊𝙉 〕━━━╮
┃
┃ 🏷️ 𝙉𝘼𝙈𝙀: %1
┃ 📝 𝘿𝙀𝙎𝘾𝙍𝙄𝙋𝙏𝙄𝙊𝙉: %2
┃ 🖇️ 𝘼𝙇𝙄𝘼𝙎𝙀𝙎: %3
┃ 🧬 𝙑𝙀𝙍𝙎𝙄𝙊𝙉: %4
┃ 🛡️ 𝙋𝙀𝙍𝙈𝙄𝙎𝙎𝙄𝙊𝙉: %5
┃ ⏳ 𝘾𝙊𝙊𝙇𝘿𝙊𝙒𝙉: %6s
┃ 👤 𝘼𝙐𝙏𝙃𝙊𝙍: %7
┃
┣━━━〔 📖 𝙐𝙎𝘼𝙂𝙀 〕
%8
╰━━━━━━━━━━━━━━━━━━━━━━━━╯`
    }
  },

  onStart: async function ({ message, args, event, threadsData, getLang, role }) {
    const { threadID } = event;
    const langCode = await threadsData.get(threadID, "data.lang") || global.GoatBot.config.language;
    const prefix = getPrefix(threadID);

    const commandName = (args[0] || "").toLowerCase();
    const command = commands.get(commandName) || commands.get(aliases.get(commandName));

    if (!args[0]) {
      const categories = {};
      let totalCommands = 0;

      for (const [, value] of commands) {
        if (value.config.role > role) continue;

        const category = value.config.category || "OTHERS";

        if (!categories[category]) {
          categories[category] = [];
        }

        categories[category].push(value.config.name);
        totalCommands++;
      }

      let helpMsg = `╭━━━〔𝙂𝙊𝘼𝙏 𝘽𝙊𝙏 𝙐𝙋𝘿𝘼𝙏𝙀𝘿〕━━━╮
┃
┃ 👑 𝙊𝙒𝙉𝙀𝙍 : 𝙓𝘼𝙇𝙈𝘼𝙉
┃ ⚙️ 𝙋𝙍𝙀𝙁𝙄𝙓 : ${prefix}
┃ 📦 𝘾𝙊𝙈𝙈𝘼𝙉𝘿𝙎 : ${totalCommands}
┃
`;

      for (const category of Object.keys(categories).sort()) {
        const names = categories[category].sort();

        helpMsg += `┣━━━〔 📃 ${stylish(category)} 〕\n`;

        for (let i = 0; i < names.length; i += 2) {
          const first = names[i];
          const second = names[i + 1] || "";

          helpMsg += `┃ ✧ ${first}     ✧ ${second}\n`;
        }

        helpMsg += "┃\n";
      }

      helpMsg += `╰━━━━━━━━━━━━━━━━━━━━━━━━╯
       ⚡ 𝙋𝙊𝙒𝙀𝙍𝙀𝘿 𝘽𝙔 𝙓𝘼𝙇𝙈𝘼𝙉`;

      try {
        const video = await axios.get(VIDEO_URL, {
          responseType: "stream",
          timeout: 30000,
          maxRedirects: 5,
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Referer": "https://imgur.com/",
            "Accept": "video/mp4,video/*,*/*"
          }
        });

        video.data.path = "help.mp4";

        return message.reply({
          body: helpMsg,
          attachment: video.data
        });
      } catch (error) {
        console.error("Help video error:", error.message);
        return message.reply(helpMsg);
      }
    }

    if (!command) {
      return message.reply(getLang("commandNotFound", args[0]));
    }

    const config = command.config;
    const description = getDescription(config, langCode);
    const usage = getGuideText(config, langCode, prefix);

    const permission =
      config.role == 0 ? "𝘼𝙇𝙇 𝙐𝙎𝙀𝙍𝙎" :
      config.role == 1 ? "𝙂𝙍𝙊𝙐𝙋 𝘼𝘿𝙈𝙄𝙉" :
      config.role == 2 ? "𝘽𝙊𝙏 𝙊𝙒𝙉𝙀𝙍" :
      config.role == 3 ? "𝙋𝙍𝙀𝙈𝙄𝙐𝙈 𝙐𝙎𝙀𝙍" :
      config.role == 4 ? "𝘿𝙀𝙑𝙀𝙇𝙊𝙋𝙀𝙍" :
      "𝙐𝙉𝙆𝙉𝙊𝙒𝙉";

    const usageText = usage
      .split("\n")
      .map(line => `┃   ${line}`)
      .join("\n");

    return message.reply(
      getLang(
        "getInfoCommand",
        config.name,
        description,
        config.aliases?.join(", ") || "NONE",
        config.version || "1.0.0",
        permission,
        config.countDown || 1,
        config.author || "UNKNOWN",
        usageText
      )
    );
  }
};

const NX_ORIGIN = [120, 97, 108, 109, 97, 110];

if (
  String(module.exports.config.author).toLowerCase() !==
  Buffer.from(NX_ORIGIN).toString("utf8")
) {
  throw new Error("Command integrity check failed");
}
