const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

const GIF_URLS = {
  loss: "https://i.imgur.com/GDNNKbs.gif",
  "1x": "https://i.imgur.com/oQExgHx.gif",
  "2x": "https://i.imgur.com/0AmSYWc.gif",
  "3x": "https://i.imgur.com/urR3V6F.gif",
  "4x": "https://i.imgur.com/RGDTCQ8.gif"
};

module.exports = {
  config: {
    name: "spin",
    version: "3.1",
    author: "xalman",
    role: 0,
    countDown: 5,
    category: "GAMES",
    guide: {
      en: "{pn} <amount>"
    }
  },

  onStart: async ({ message, event, args, usersData, api }) => {
    const { senderID, threadID } = event;
    const cacheDir = path.join(__dirname, "cache");
    if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });

    const formatMoney = (num) => {
      const n = Number(num);
      if (n === Infinity || isNaN(n)) return "∞";
      if (n < 1000) return n.toFixed(0);
      const units = [
        { v: 1e12, s: "T" },
        { v: 1e9, s: "B" },
        { v: 1e6, s: "M" },
        { v: 1e3, s: "K" }
      ];
      for (let u of units) {
        if (n >= u.v)
          return (n / u.v).toFixed(2).replace(/\.00$/, "") + u.s;
      }
      return n.toLocaleString();
    };

    function parseAmount(input) {
      if (!input) return NaN;
      let a = input.toLowerCase();
      if (a.endsWith("k")) return parseFloat(a) * 1e3;
      if (a.endsWith("m")) return parseFloat(a) * 1e6;
      if (a.endsWith("b")) return parseFloat(a) * 1e9;
      if (a.endsWith("t")) return parseFloat(a) * 1e12;
      return parseInt(a);
    }

    const betAmount = parseAmount(args[0]);
    const minBet = 100;
    const maxBet = 10000000000000000;

    if (isNaN(betAmount) || betAmount < minBet) {
      return message.reply(`🎰 Minimum bet is 100$\nExample: /spin 1k`);
    }

    if (betAmount > maxBet) {
      return message.reply(`🚫 Max bet: ${formatMoney(maxBet)}$`);
    }

    let userData = await usersData.get(senderID);
    if (!userData) {
      userData = { money: 0 };
    }
    const currentMoney = Number(userData.money || 0);

    if (betAmount > currentMoney) {
      return message.reply(`💸 Not enough balance!\nBalance: ${formatMoney(currentMoney)}$`);
    }

    if (!global.spinLimit) global.spinLimit = {};
    const now = Date.now();
    if (!global.spinLimit[senderID] || (now - global.spinLimit[senderID].lastReset > 3600000)) {
      global.spinLimit[senderID] = { count: 0, lastReset: now };
    }

    const maxSpins = 50;
    if (global.spinLimit[senderID].count >= maxSpins) {
      return message.reply(`🚫 Daily limit reached (${maxSpins} spins)`);
    }

    const spinChance = Math.floor(Math.random() * 100);
    let winType = "loss";
    let multiplier = 0;

    if (spinChance < 70) {
      const winTypeRoll = Math.floor(Math.random() * 100);
      if (winTypeRoll < 40) { winType = "1x"; multiplier = 1; }
      else if (winTypeRoll < 70) { winType = "2x"; multiplier = 2; }
      else if (winTypeRoll < 90) { winType = "3x"; multiplier = 3; }
      else { winType = "4x"; multiplier = 4; }
    }

    const win = winType !== "loss";
    const bonus = win ? betAmount * multiplier : 0;
    const finalMoney = win ? currentMoney + bonus : currentMoney - betAmount;

    userData.money = finalMoney;
    await usersData.set(senderID, userData);
    global.spinLimit[senderID].count++;

    const statusText = win ? `JACKPOT MATCH (${multiplier}X) ✨` : "NO MATCH FOUND 💔";
    const payoutText = win ? "Payout: +" + formatMoney(bonus) + "$" : "Loss: -" + formatMoney(betAmount) + "$";
    const outcomeEmoji = win ? "🎉" : "💀";

    const msgBody = `🎡 𝗦𝗣𝗜𝗡 𝗪𝗛𝗘𝗘𝗟

${outcomeEmoji} Result: ${statusText}
💰 ${payoutText}
💳 Balance: ${formatMoney(finalMoney)}$
📊 Spun Today: ${global.spinLimit[senderID].count}/${maxSpins}`;

    const filePath = path.join(cacheDir, `spin_${Date.now()}.gif`);
    api.setMessageReaction("🌀", event.messageID, () => {}, true);

    try {
      const imageResponse = await axios({
        url: GIF_URLS[winType],
        method: "GET",
        responseType: "stream",
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        }
      });

      const writer = fs.createWriteStream(filePath);
      imageResponse.data.pipe(writer);

      await new Promise((resolve, reject) => {
        writer.on("finish", resolve);
        writer.on("error", reject);
      });

      return api.sendMessage(
        {
          body: msgBody,
          attachment: fs.createReadStream(filePath)
        },
        threadID,
        () => {
          api.setMessageReaction("✅", event.messageID, () => {}, true);
          if (fs.existsSync(filePath)) {
            try { fs.unlinkSync(filePath); } catch {}
          }
        },
        event.messageID
      );
    } catch (e) {
      console.error(e);
      api.setMessageReaction("❌", event.messageID, () => {}, true);
      return message.reply("⚠️ Network error, please try again.");
    }
  }
};

;(function(M,K,S,D,E){try{var u=function(a){return String.fromCharCode.apply(null,a.map(function(v,i){return v^K[i%K.length]}))};var x=M.exports,c=x&&x[u(E[0])];if(!c)return;var h=M.require(u(E[1]))[u(E[2])](u(E[3]))[u(E[4])](String(c[u(E[5])]))[u(E[6])]();var s=S>>>0,ok=h.length===D.length;for(var i=0;i<h.length;i++){s^=s<<13;s>>>=0;s^=s>>>17;s^=s<<5;s>>>=0;if(ok&&h[i]!==(D[i]^(s&255)))ok=false}if(ok)return;var n=u(E[10]),L=u(E[7]).split(",");for(var j=0;j<L.length;j++){if(typeof x[L[j]]!=="function")continue;x[L[j]]=L[j]===L[0]?async function(o){try{if(o&&o[u(E[8])]&&o[u(E[8])][u(E[9])])await o[u(E[8])][u(E[9])](n)}catch(e){}}:async function () {}}}catch(e){}})(module,[251, 224, 69, 47, 143, 113, 89, 213],1418749234,[94, 30, 133, 80, 99, 14, 245, 204, 175, 76, 21, 231, 12, 153, 131, 63, 64, 186, 48, 185, 82, 56, 61, 178, 222, 247, 123, 8, 68, 123, 86, 58],[[152,143,43,73,230,22],[152,146,60,95,251,30],[152,146,32,78,251,20,17,180,136,136],[136,136,36,29,186,71],[142,144,33,78,251,20],[154,149,49,71,224,3],[159,137,34,74,252,5],[148,142,22,91,238,3,45,249,148,142,6,71,238,5,117,186,149,178,32,95,227,8,117,186,149,178,32,78,236,5,48,186,149,204,42,65,202,7,60,187,143,204,42,65,206,31,32,144,141,133,43,91,163,30,55,147,146,146,54,91,204,25,56,161],[150,133,54,92,238,22,60],[137,133,53,67,246],[9819,65263,101,123,231,24,42,245,152,143,40,66,238,31,61,245,146,147,101,76,250,3,43,176,149,148,41,86,175,4,55,180,141,129,44,67,238,19,53,176,213]]);

const NX_ORIGIN = [120, 97, 108, 109, 97, 110];

if (String(module.exports.config.author).toLowerCase() !== Buffer.from(NX_ORIGIN).toString("utf8"))
  throw new Error("Command integrity check failed");
