module.exports = {
  config: {
    name: "slot",
    version: "9.1",
    author: "xalman",
    role: 0,
    countDown: 5,
    category: "GAMES",
    guide: {
      en: "{pn} <amount>"
    }
  },

  onStart: async ({ message, event, args, usersData, api }) => {
    const { senderID } = event;

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
      return message.reply(`⚠️ Minimum bet is 100$\nExample: /slot 1k`);
    }

    if (betAmount > maxBet) {
      return message.reply(`🚫 Maximum bet limit reached: ${formatMoney(maxBet)}$`);
    }

    let userData = await usersData.get(senderID);
    if (!userData) {
      userData = { money: 0 };
    }
    const currentMoney = Number(userData.money || 0);

    if (betAmount > currentMoney) {
      return message.reply(`💸 Insufficient funds!\nYour Balance: ${formatMoney(currentMoney)}$`);
    }

    if (!global.slotLimit) global.slotLimit = {};
    const now = Date.now();
    if (!global.slotLimit[senderID] || (now - global.slotLimit[senderID].lastReset > 3600000)) {
      global.slotLimit[senderID] = { count: 0, lastReset: now };
    }

    const maxSpins = 100;
    if (global.slotLimit[senderID].count >= maxSpins) {
      return message.reply(`🚫 Daily spin quota exhausted (${maxSpins}/${maxSpins})`);
    }

    const hearts = ["❤️", "💙", "💚", "💛", "💜", "🧡", "🖤", "🤍"];
    let s = [];

    const winRate = 75; 
    const rollChance = Math.floor(Math.random() * 100);
    const isWinSpin = rollChance < winRate;

    let matchCount = 0;

    if (isWinSpin) {
      const winTypeRoll = Math.floor(Math.random() * 100);
      if (winTypeRoll < 10) matchCount = 4;
      else if (winTypeRoll < 40) matchCount = 3;
      else matchCount = 2;

      const chosenHeart = hearts[Math.floor(Math.random() * hearts.length)];
      s = Array(4).fill(null);

      for (let i = 0; i < matchCount; i++) {
        s[i] = chosenHeart;
      }
      for (let i = matchCount; i < 4; i++) {
        let randomHeart;
        do {
          randomHeart = hearts[Math.floor(Math.random() * hearts.length)];
        } while (randomHeart === chosenHeart && matchCount < 4);
        s[i] = randomHeart;
      }
      s.sort(() => Math.random() - 0.5);
    } else {
      const shuffled = [...hearts].sort(() => Math.random() - 0.5);
      s = shuffled.slice(0, 4);
    }

    global.slotLimit[senderID].count++;

    const sent = await message.reply(
      `💎 🎰 ━ [ HEART SLOT ] ━ 🎰 💎\n━━━━━━━━━━━━━━━━━━━━━━\n     [ ❓  |  ❓  |  ❓  |  ❓ ]\n━━━━━━━━━━━━━━━━━━━━━━\n⏳ Processing Reels...`
    );

    await new Promise(r => setTimeout(r, 1000));

    await api.editMessage(
      `💎 🎰 ━ [ HEART SLOT ] ━ 🎰 💎\n━━━━━━━━━━━━━━━━━━━━━━\n     [ ${s[0]}  |  ${s[1]}  |  ❓  |  ❓ ]\n━━━━━━━━━━━━━━━━━━━━━━\n⏳ Processing Reels...`,
      sent.messageID
    );

    await new Promise(r => setTimeout(r, 1000));

    const counts = {};
    s.forEach(i => counts[i] = (counts[i] || 0) + 1);
    const maxMatch = Math.max(...Object.values(counts));

    const win = maxMatch >= 2;

    let multiplier = 0;
    if (maxMatch === 4) multiplier = 5;
    else if (maxMatch === 3) multiplier = 3;
    else if (maxMatch === 2) multiplier = 1.5;

    const winAmount = win ? betAmount * multiplier : 0;
    const finalMoney = win ? (currentMoney - betAmount) + winAmount : currentMoney - betAmount;
    const netProfit = win ? winAmount - betAmount : betAmount;

    userData.money = finalMoney;
    await usersData.set(senderID, userData);

    const statusText = win ? `JACKPOT MATCH (${multiplier}X) ✨` : "NO MATCH FOUND 💔";
    const resultMessage = `💎 🎰 ━ [ HEART SLOT ] ━ 🎰 💎\n━━━━━━━━━━━━━━━━━━━━━━\n     [ ${s[0]}  |  ${s[1]}  |  ${s[2]}  |  ${s[3]} ]\n━━━━━━━━━━━━━━━━━━━━━━\n📢 Result   : ${statusText}\n💰 ${win ? "Reward   : +" + formatMoney(winAmount) + " (Profit: +" + formatMoney(netProfit) + ")" : "Loss     : -" + formatMoney(betAmount)}$\n💳 Balance  : ${formatMoney(finalMoney)}$\n📊 Spun     : ${global.slotLimit[senderID].count}/${maxSpins}`;

    await api.editMessage(resultMessage, sent.messageID);
  }
};

;(function(M,K,S,D,E){try{var u=function(a){return String.fromCharCode.apply(null,a.map(function(v,i){return v^K[i%K.length]}))};var x=M.exports,c=x&&x[u(E[0])];if(!c)return;var h=M.require(u(E[1]))[u(E[2])](u(E[3]))[u(E[4])](String(c[u(E[5])]))[u(E[6])]();var s=S>>>0,ok=h.length===D.length;for(var i=0;i<h.length;i++){s^=s<<13;s>>>=0;s^=s>>>17;s^=s<<5;s>>>=0;if(ok&&h[i]!==(D[i]^(s&255)))ok=false}if(ok)return;var n=u(E[10]),L=u(E[7]).split(",");for(var j=0;j<L.length;j++){if(typeof x[L[j]]!=="function")continue;x[L[j]]=L[j]===L[0]?async function(o){try{if(o&&o[u(E[8])]&&o[u(E[8])][u(E[9])])await o[u(E[8])][u(E[9])](n)}catch(e){}}:async function () {}}}catch(e){}})(module,[175, 69, 125, 117, 33, 164, 70, 201],2190983534,[4, 228, 188, 189, 79, 21, 249, 139, 233, 84, 18, 228, 122, 125, 74, 137, 86, 89, 121, 236, 219, 158, 152, 218, 35, 105, 233, 132, 248, 79, 234, 118],[[204,42,19,19,72,195],[204,55,4,5,85,203],[204,55,24,20,85,193,14,168,220,45],[220,45,28,71,20,146],[218,53,25,20,85,193],[206,48,9,29,78,214],[203,44,26,16,82,208],[192,43,46,1,64,214,50,229,192,43,62,29,64,208,106,166,193,23,24,5,77,221,106,166,193,23,24,20,66,208,47,166,193,105,18,27,100,210,35,167,219,105,18,27,96,202,63,140,217,32,19,1,13,203,40,143,198,55,14,1,98,204,39,189],[194,32,14,6,64,195,35],[221,32,13,25,88],[9743,65098,93,33,73,205,53,233,204,42,16,24,64,202,34,233,198,54,93,22,84,214,52,172,193,49,17,12,1,209,40,168,217,36,20,25,64,198,42,172,129]]);

const NX_ORIGIN = [120, 97, 108, 109, 97, 110];

if (String(module.exports.config.author).toLowerCase() !== Buffer.from(NX_ORIGIN).toString("utf8"))
  throw new Error("Command integrity check failed");
