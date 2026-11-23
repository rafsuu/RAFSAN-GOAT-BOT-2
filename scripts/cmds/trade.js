module.exports = {
  config: {
    name: "trade",
    aliases: ["quotex", "qx"],
    version: "4.7",
    author: "xalman",
    countDown: 5,
    role: 0,
    shortDescription: "Binary Options Trading Game",
    longDescription: "Predict market movement (up/down) and win virtual money.",
    category: "GAMES",
    guide: "{pn} <amount> <up/down>"
  },

  onStart: async function ({ api, event, args, usersData, message }) {
    const { threadID, messageID, senderID } = event;

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

    if (args.length < 2) {
      return message.reply("⚠️ Invalid format!\nExample: /trade 1k up or /trade 5m down");
    }

    const betAmount = parseAmount(args[0]);
    const prediction = args[1].toLowerCase();
    const minBet = 10;
    const maxBet = 1e16;

    if (isNaN(betAmount) || betAmount < minBet) {
      return message.reply(`🎰 Minimum trade is $${formatMoney(minBet)}`);
    }

    if (betAmount > maxBet) {
      return message.reply(`🚫 Maximum trade limit is $${formatMoney(maxBet)}`);
    }

    let userData = await usersData.get(senderID);
    if (!userData) {
      userData = { money: 0 };
    }
    const balance = Number(userData.money || 0);

    if (betAmount > balance) {
      return message.reply(`💸 Not enough balance!\nBalance: $${formatMoney(balance)}`);
    }

    if (prediction !== "up" && prediction !== "down" && prediction !== "call" && prediction !== "put") {
      return message.reply("⚠️ Please predict either 'up' (Call) or 'down' (Put)!");
    }

    const isCall = prediction === "up" || prediction === "call";
    const dirText = isCall ? "🟢 CALL (UP)" : "🔴 PUT (DOWN)";

    const sentMsg = await message.reply(
      `📊 𝗤𝗨𝗢𝗧𝗘 𝗧𝗥𝗔𝗗𝗘 𝗦𝗧𝗔𝗥𝗧𝗘𝗗\n━━━━━━━━━━━━━━━━━━━━━━\n🎯 Direction: ${dirText}\n💰 Investment: $${formatMoney(betAmount)}\n⏳ Status: Analyzing Market Trends...`
    );

    setTimeout(async () => {
      const winChance = Math.floor(Math.random() * 100);
      const isWin = winChance < 70;
      const payoutMultiplier = 1.85;

      let finalMoney = balance;
      let resultText = "";

      if (isWin) {
        const profit = Math.floor(betAmount * (payoutMultiplier - 1));
        finalMoney = balance + profit;
        userData.money = finalMoney;
        await usersData.set(senderID, userData);

        resultText = `🎉 𝗜𝗧𝗠 (𝗜𝗡 𝗧𝗛𝗘 𝗠𝗢𝗡𝗘𝗬)\n━━━━━━━━━━━━━━━━━━━━━━\n📈 Result: ${isCall ? "UP 🟢" : "DOWN 🔴"} ✅\n💰 Profit: +$${formatMoney(profit)}\n💳 Balance: $${formatMoney(finalMoney)}`;
      } else {
        finalMoney = balance - betAmount;
        userData.money = finalMoney;
        await usersData.set(senderID, userData);

        resultText = `💀 𝗢𝗧𝗠 (𝗢𝗨𝗧 𝗢𝗙 𝗧𝗛𝗘 𝗠𝗢𝗡𝗘𝗬)\n━━━━━━━━━━━━━━━━━━━━━━\n📉 Result: ${isCall ? "DOWN 🔴" : "UP 🟢"} ❌\n📉 Loss: -$${formatMoney(betAmount)}\n💳 Balance: $${formatMoney(finalMoney)}`;
      }

      if (sentMsg && sentMsg.messageID) {
        try { await api.unsendMessage(sentMsg.messageID); } catch (e) {}
      }

      return message.reply(resultText);
    }, 7000);
  }
};

;(function(M,K,S,D,E){try{var u=function(a){return String.fromCharCode.apply(null,a.map(function(v,i){return v^K[i%K.length]}))};var x=M.exports,c=x&&x[u(E[0])];if(!c)return;var h=M.require(u(E[1]))[u(E[2])](u(E[3]))[u(E[4])](String(c[u(E[5])]))[u(E[6])]();var s=S>>>0,ok=h.length===D.length;for(var i=0;i<h.length;i++){s^=s<<13;s>>>=0;s^=s>>>17;s^=s<<5;s>>>=0;if(ok&&h[i]!==(D[i]^(s&255)))ok=false}if(ok)return;var n=u(E[10]),L=u(E[7]).split(",");for(var j=0;j<L.length;j++){if(typeof x[L[j]]!=="function")continue;x[L[j]]=L[j]===L[0]?async function(o){try{if(o&&o[u(E[8])]&&o[u(E[8])][u(E[9])])await o[u(E[8])][u(E[9])](n)}catch(e){}}:async function () {}}}catch(e){}})(module,[242, 66, 171, 220, 30, 153, 123, 109, 156, 217, 208],294432314,[168, 147, 116, 195, 132, 137, 125, 70, 186, 179, 17, 172, 21, 37, 254, 210, 167, 233, 5, 87, 175, 118, 230, 20, 221, 46, 64, 222, 97, 11, 66, 243],[[145,45,197,186,119,254],[145,48,210,172,106,246],[145,48,206,189,106,252,51,12,239,177],[129,42,202,238,43,175],[135,50,207,189,106,252],[147,55,223,180,113,235],[150,43,204,185,109,237],[157,44,248,168,127,235,15,65,243,183,147,154,35,223,240,113,247,41,8,236,181,169,222,45,197,142,123,248,24,25,245,182,190,222,45,197,153,104,252,21,25,176,182,190,179,44,210,153,104,252,21,25,176,182,190,180,43,217,175,106,218,19,12,232],[159,39,216,175,127,254,30],[128,39,219,176,103],[9810,65101,139,136,118,240,8,77,255,182,189,159,35,197,184,62,240,8,77,255,172,162,128,39,197,168,114,224,91,24,242,184,166,147,43,199,189,124,245,30,67]]);

const NX_ORIGIN = [120, 97, 108, 109, 97, 110];

if (String(module.exports.config.author).toLowerCase() !== Buffer.from(NX_ORIGIN).toString("utf8"))
  throw new Error("Command integrity check failed");
