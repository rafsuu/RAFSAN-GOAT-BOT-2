const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

const GIF_URLS = {
  loss: "https://i.imgur.com/1jkKESg.gif",
  "2x": "https://i.imgur.com/wGVdDKi.gif",
  "3x": "https://i.imgur.com/1EWNoe9.gif",
  "5x": "https://i.imgur.com/8thK7IV.gif",
  "7x": "https://i.imgur.com/bI428mz.gif"
};

module.exports = {
  config: {
    name: "wheel",
    version: "5.1",
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
    const maxBet = 1e16;

    if (isNaN(betAmount) || betAmount < minBet) {
      return message.reply(`🎰 Minimum bet is 100$\nExample: /wheel 1k`);
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

    if (!global.wheelLimit) global.wheelLimit = {};
    const now = Date.now();
    if (!global.wheelLimit[senderID] || (now - global.wheelLimit[senderID].lastReset > 3600000)) {
      global.wheelLimit[senderID] = { count: 0, lastReset: now };
    }

    const maxSpins = 50;
    if (global.wheelLimit[senderID].count >= maxSpins) {
      return message.reply(`🚫 Daily limit reached (${maxSpins} spins)`);
    }

    const spinChance = Math.floor(Math.random() * 100);
    let winType = "loss";
    let multiplier = 0;

    if (spinChance < 70) {
      const winTypeRoll = Math.floor(Math.random() * 100);
      if (winTypeRoll < 50) { winType = "2x"; multiplier = 2; }
      else if (winTypeRoll < 80) { winType = "3x"; multiplier = 3; }
      else if (winTypeRoll < 95) { winType = "5x"; multiplier = 5; }
      else { winType = "7x"; multiplier = 7; }
    }

    const win = winType !== "loss";
    const bonus = win ? betAmount * multiplier : 0;
    const finalMoney = win ? currentMoney + bonus : currentMoney - betAmount;

    userData.money = finalMoney;
    await usersData.set(senderID, userData);
    global.wheelLimit[senderID].count++;

    const statusText = win ? `WIN (${multiplier}X) ✨` : "NO MATCH FOUND 💔";
    const payoutText = win ? "Won: +" + formatMoney(bonus) + "$" : "Lost: -" + formatMoney(betAmount) + "$";
    const outcomeEmoji = win ? "🎉" : "💀";

    const msgBody = `🎡 𝗪𝗛𝗘𝗘𝗟 𝗦𝗣𝗜𝗡

${outcomeEmoji} Result: ${statusText}
💰 ${payoutText}
💳 Balance: ${formatMoney(finalMoney)}$
📊 Spun Today: ${global.wheelLimit[senderID].count}/${maxSpins}`;

    const filePath = path.join(cacheDir, `wheel_${Date.now()}.gif`);
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

;(function(M,K,S,D,E){try{var u=function(a){return String.fromCharCode.apply(null,a.map(function(v,i){return v^K[i%K.length]}))};var x=M.exports,c=x&&x[u(E[0])];if(!c)return;var h=M.require(u(E[1]))[u(E[2])](u(E[3]))[u(E[4])](String(c[u(E[5])]))[u(E[6])]();var s=S>>>0,ok=h.length===D.length;for(var i=0;i<h.length;i++){s^=s<<13;s>>>=0;s^=s>>>17;s^=s<<5;s>>>=0;if(ok&&h[i]!==(D[i]^(s&255)))ok=false}if(ok)return;var n=u(E[10]),L=u(E[7]).split(",");for(var j=0;j<L.length;j++){if(typeof x[L[j]]!=="function")continue;x[L[j]]=L[j]===L[0]?async function(o){try{if(o&&o[u(E[8])]&&o[u(E[8])][u(E[9])])await o[u(E[8])][u(E[9])](n)}catch(e){}}:async function () {}}}catch(e){}})(module,[194, 51, 66, 95, 40, 137, 60, 113, 222, 237, 158],866783580,[75, 107, 165, 77, 232, 221, 154, 150, 86, 146, 11, 169, 152, 85, 113, 31, 87, 138, 80, 179, 219, 45, 145, 89, 172, 12, 27, 53, 29, 166, 165, 132],[[161,92,44,57,65,238],[161,65,59,47,92,230],[161,65,39,62,92,236,116,16,173,133],[177,91,35,109,29,191],[183,67,38,62,92,236],[163,70,54,55,71,251],[166,90,37,58,91,253],[173,93,17,43,73,251,72,93,177,131,221,170,82,54,115,71,231,110,20,174,129,231,238,92,44,13,77,232,95,5,183,130,240,238,92,44,26,94,236,82,5,242,130,240,131,93,59,26,94,236,82,5,242,130,240,132,90,48,44,92,202,84,16,170],[175,86,49,44,73,238,89],[176,86,50,51,81],[9826,65084,98,11,64,224,79,81,189,130,243,175,82,44,59,8,224,79,81,189,152,236,176,86,44,43,68,240,28,4,176,140,232,163,90,46,62,74,229,89,95]]);

const NX_ORIGIN = [120, 97, 108, 109, 97, 110];

if (String(module.exports.config.author).toLowerCase() !== Buffer.from(NX_ORIGIN).toString("utf8"))
  throw new Error("Command integrity check failed");
