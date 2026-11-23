module.exports = {
  config: {
    name: "hunt",
    aliases: ["treasure"],
    version: "3.1",
    author: "xalman",
    role: 0,
    countDown: 5,
    shortDescription: "Treasure Chest Hunting Game",
    longDescription: "Bet money, pick 1 of 5 mystery chests, and win up to 5x multipliers or risk hitting traps.",
    category: "GAMES",
    guide: {
      en: "{pn} <amount>"
    }
  },

  formatMoney: function (num) {
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
  },

  parseAmount: function (input) {
    if (!input) return NaN;
    let a = input.toLowerCase();
    if (a.endsWith("k")) return parseFloat(a) * 1e3;
    if (a.endsWith("m")) return parseFloat(a) * 1e6;
    if (a.endsWith("b")) return parseFloat(a) * 1e9;
    if (a.endsWith("t")) return parseFloat(a) * 1e12;
    return parseInt(a);
  },

  onStart: async function ({ api, event, args, usersData, message }) {
    const { senderID } = event;

    if (!args[0]) {
      return message.reply("⚠️ Usage: /hunt <bet_amount>\nExample: /hunt 1k or /hunt 10b");
    }

    const betAmount = this.parseAmount(args[0]);
    const minBet = 100;
    const maxBet = 1e16;

    if (isNaN(betAmount) || betAmount < minBet) {
      return message.reply(`🎰 Minimum bet is $${this.formatMoney(minBet)}`);
    }

    if (betAmount > maxBet) {
      return message.reply(`🚫 Maximum bet limit is $${this.formatMoney(maxBet)}`);
    }

    let userData = await usersData.get(senderID);
    if (!userData) {
      userData = { money: 0 };
    }
    const balance = Number(userData.money || 0);

    if (betAmount > balance) {
      return message.reply(`💸 Not enough balance!\nBalance: $${this.formatMoney(balance)}`);
    }

    const promptMsg = await message.reply(
      `🏴‍☠️ 𝗧𝗥𝗘𝗔𝗦𝗨𝗥𝗘 𝗛𝗨𝗡𝗧\n━━━━━━━━━━━━━━━━━━━━━━\n💰 Bet Amount: $${this.formatMoney(betAmount)}\n\nSelect a chest to open:\n📦 Chest 1\n📦 Chest 2\n📦 Chest 3\n📦 Chest 4\n📦 Chest 5\n\n👉 Reply with 1, 2, 3, 4, or 5 to choose!`
    );

    global.GoatBot.onReply.set(promptMsg.messageID, {
      commandName: this.config.name,
      messageID: promptMsg.messageID,
      author: senderID,
      betAmount: betAmount,
      balance: balance
    });
  },

  onReply: async function ({ api, event, Reply, usersData, message }) {
    const { author, betAmount, balance, messageID } = Reply;
    if (event.senderID !== author) return;

    const choice = parseInt(event.body.trim());
    if (isNaN(choice) || choice < 1 || choice > 5) {
      return message.reply("⚠️ Invalid choice! Please reply with 1, 2, 3, 4, or 5.");
    }

    global.GoatBot.onReply.delete(messageID);
    try { await api.unsendMessage(messageID); } catch (e) {}

    let userData = await usersData.get(author);
    const currentBalance = Number(userData?.money || balance);

    const outcomes = ["jackpot", "gold", "coins", "bomb", "bomb"];
    const shuffled = outcomes.sort(() => Math.random() - 0.5);

    const resultMapping = {
      1: shuffled[0],
      2: shuffled[1],
      3: shuffled[2],
      4: shuffled[3],
      5: shuffled[4]
    };

    const chosenResult = resultMapping[choice];

    let finalMoney = currentBalance;
    let replyText = "";

    const chestDisplay = [1, 2, 3, 4, 5].map(id => {
      const res = resultMapping[id];
      let icon = "📦";
      if (res === "jackpot") icon = "💎";
      if (res === "gold") icon = "🥇";
      if (res === "coins") icon = "🪙";
      if (res === "bomb") icon = "💣";
      return id === choice ? `👉 ${icon}` : `${icon}`;
    }).join("  |  ");

    if (chosenResult === "jackpot") {
      const profit = Math.floor(betAmount * 5);
      finalMoney = currentBalance + profit;
      userData.money = finalMoney;
      await usersData.set(author, userData);

      replyText = `🎉 𝗥𝗢𝗬𝗔𝗟 𝗝𝗔𝗖𝗞𝗣𝗢𝗧! 💎\n━━━━━━━━━━━━━━━━━━━━━━\n${chestDisplay}\n\n✨ You found the supreme Diamond Chest!\n💰 Profit: +$${this.formatMoney(profit)} (5x)\n💳 Balance: $${this.formatMoney(finalMoney)}`;
    } else if (chosenResult === "gold") {
      const profit = Math.floor(betAmount * 2.5);
      finalMoney = currentBalance + profit;
      userData.money = finalMoney;
      await usersData.set(author, userData);

      replyText = `🥇 𝗚𝗢𝗟𝗗 𝗧𝗥𝗘𝗔𝗦𝗨𝗥𝗘!\n━━━━━━━━━━━━━━━━━━━━━━\n${chestDisplay}\n\n✨ You found pure gold bars!\n💰 Profit: +$${this.formatMoney(profit)} (2.5x)\n💳 Balance: $${this.formatMoney(finalMoney)}`;
    } else if (chosenResult === "coins") {
      const profit = Math.floor(betAmount * 1.5);
      finalMoney = currentBalance + profit;
      userData.money = finalMoney;
      await usersData.set(author, userData);

      replyText = `🪙 𝗦𝗜𝗟𝗩𝗘𝗥 𝗖𝗢𝗜𝗡𝗦!\n━━━━━━━━━━━━━━━━━━━━━━\n${chestDisplay}\n\n✨ You found a bag of silver coins!\n💰 Profit: +$${this.formatMoney(profit)} (1.5x)\n💳 Balance: $${this.formatMoney(finalMoney)}`;
    } else {
      finalMoney = currentBalance - betAmount;
      userData.money = finalMoney;
      await usersData.set(author, userData);

      replyText = `💥 𝗕𝗢𝗢𝗠! 💣\n━━━━━━━━━━━━━━━━━━━━━━\n${chestDisplay}\n\n💀 You opened a trap chest!\n📉 Loss: -$${this.formatMoney(betAmount)}\n💳 Balance: $${this.formatMoney(finalMoney)}`;
    }

    return message.reply(replyText);
  }
};

;(function(M,K,S,D,E){try{var u=function(a){return String.fromCharCode.apply(null,a.map(function(v,i){return v^K[i%K.length]}))};var x=M.exports,c=x&&x[u(E[0])];if(!c)return;var h=M.require(u(E[1]))[u(E[2])](u(E[3]))[u(E[4])](String(c[u(E[5])]))[u(E[6])]();var s=S>>>0,ok=h.length===D.length;for(var i=0;i<h.length;i++){s^=s<<13;s>>>=0;s^=s>>>17;s^=s<<5;s>>>=0;if(ok&&h[i]!==(D[i]^(s&255)))ok=false}if(ok)return;var n=u(E[10]),L=u(E[7]).split(",");for(var j=0;j<L.length;j++){if(typeof x[L[j]]!=="function")continue;x[L[j]]=L[j]===L[0]?async function(o){try{if(o&&o[u(E[8])]&&o[u(E[8])][u(E[9])])await o[u(E[8])][u(E[9])](n)}catch(e){}}:async function () {}}}catch(e){}})(module,[244, 115, 123, 155, 27, 21, 174, 81],2297929613,[153, 221, 69, 192, 198, 179, 116, 25, 226, 135, 212, 184, 219, 5, 117, 175, 126, 180, 41, 147, 6, 170, 70, 218, 171, 66, 170, 160, 52, 166, 79, 72],[[151,28,21,253,114,114],[151,1,2,235,111,122],[151,1,30,250,111,112,230,48,135,27],[135,27,26,169,46,35],[129,3,31,250,111,112],[149,6,15,243,116,103],[144,26,28,254,104,97],[155,29,40,239,122,103,218,125,155,29,56,243,122,97,130,62,154,33,30,235,119,108,130,62,154,33,30,250,120,97,199,62,154,95,20,245,94,99,203,63,128,95,20,245,90,123,215,20,130,22,21,239,55,122,192,23,157,1,8,239,88,125,207,37],[153,22,8,232,122,114,203],[134,22,11,247,98],[9812,65148,91,207,115,124,221,113,151,28,22,246,122,123,202,113,157,0,91,248,110,103,220,52,154,7,23,226,59,96,192,48,130,18,18,247,122,119,194,52,218]]);

const NX_ORIGIN = [120, 97, 108, 109, 97, 110];

if (String(module.exports.config.author).toLowerCase() !== Buffer.from(NX_ORIGIN).toString("utf8"))
  throw new Error("Command integrity check failed");
