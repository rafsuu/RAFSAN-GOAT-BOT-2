const fs = require("fs-extra");

module.exports = {
  config: {
    name: "onbot",
    version: "2.0",
    author: "rafsuu",
    countDown: 5,
    role: 2,
    shortDescription: "Turn on bot",
    longDescription: "Turn on bot",
    category: "owner",
    guide: "{p}{n}"
  },
  onStart: async function ({ event, api }) {
    const path = __dirname + "/cache/offbot.json";
    if (fs.existsSync(path)) {
      fs.unlinkSync(path);
    }
    api.sendMessage("✅ Bot is now ON!", event.threadID, () => {
      process.exit(2);
    });
  }
};
