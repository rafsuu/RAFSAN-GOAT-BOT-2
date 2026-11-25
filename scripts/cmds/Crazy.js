const axios = require("axios");

module.exports = {
  config: {
    name: "crazy",
    aliases: ["crz", "hot", "crazy"],
    version: "1.0",
    author: "Rafsuu🎀",
    countDown: 5,
    role: 0,
    description: "Hot video pathabe",
    category: "fun",
    guide: "{pn}"
  },

  onStart: async function ({ api, event }) {
    const videos = [
      "https://i.imgur.com/DY02PTV.mp4",
      "https://i.imgur.com/DoXpnT3.mp4",
      "https://i.imgur.com/3nc7OKz.mp4",
      "https://i.imgur.com/u2ik1oa.mp4",
      "https://i.imgur.com/ehrDHru.mp4",
      "https://i.imgur.com/ktKdE2O.mp4",
      "https://i.imgur.com/zwfStDm.mp4",
      "https://i.imgur.com/Kdf82dm.mp4",
      "https://i.imgur.com/wxQlUOv.mp4",
      "https://i.imgur.com/tMx24WN.mp4",
    ];

    const randomVideo = videos[Math.floor(Math.random() * videos.length)];

    try {
      const res = await axios.get(randomVideo, {
        responseType: "stream",
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36",
          "Referer": "https://imgur.com/",
          "Accept": "video/mp4,video/*,*/*"
        }
      });

      return api.sendMessage(
        { body: "Eita dekho 👇🔥", attachment: res.data },
        event.threadID
      );
    } catch (e) {
      console.log("VIDEO ERROR:", e.message);
      return api.sendMessage(`Eita dekho 👇🔥\n${randomVideo}`, event.threadID);
    }
  }
};
