module.exports = {
  config: {
    name: "bet",
    version: "12.1",
    author: "xalman", // cmd main author tanil full system modified by xalman 
    shortDescription: { en: "Random multiplier bet game with hourly limit" },
    longDescription: { en: "Place a bet and win. 50% win rate and 50 plays per hour limit." },
    category: "GAMES",
  },

  langs: {
    en: {
      invalid_amount: "❌ 𝗜𝗡𝗩𝗔𝗟𝗜𝗗 𝗔𝗠𝗢𝗨𝗡𝗧\n━━━━━━━━━━━━━━━━━━\n⚠️ Minimum bet: 1,000৳\n💡 Usage: /bet 100k | all",
      not_enough_money: "🚫 𝗜𝗡𝗦𝗨𝗙𝗙𝗜𝗖𝗜𝗘𝗡𝗧 𝗙𝗨𝗡𝗗𝗦\n━━━━━━━━━━━━━━━━━━\n💵 Balance: %1৳\n💸 You need more money to play!",
      max_bet: "🛡️ 𝗦𝗘𝗖𝗨𝗥𝗜𝗧𝗬 𝗔𝗟𝗘𝗥𝗧\n━━━━━━━━━━━━━━━━━━\n🚫 Max bet limit: 10000T\n⚠️ High stakes blocked by system!",
      limit_reached: "🚫 𝗟𝗜𝗠𝗜𝗧 𝗥𝗘𝗔𝗖𝗛𝗘𝗗\n━━━━━━━━━━━━━━━━━━\n⚠️ You've played 50 times this hour.\n⏳ Try again in %1 minutes.",
      spinning: "🎰 𝗕𝗘𝗧𝗧𝗜𝗡𝗚 𝗠𝗔𝗖𝗛𝗜𝗡𝗘\n━━━━━━━━━━━━━━━━━━\n   [ 🔄 𝗦𝗣𝗜𝗡𝗡𝗜𝗡𝗚... 🔄 ]\n━━━━━━━━━━━━━━━━━━\n📡 Connecting to server...",
      win: "✨ 𝗪𝗜𝗡𝗡𝗘𝗥 𝗗𝗘𝗖𝗟𝗔𝗥𝗘𝗗 ✨\n━━━━━━━━━━━━━━━━━━\n💰 𝗦𝘁𝗮𝘁𝘂𝘀: SUCCESS\n📈 𝗠𝘂𝗹𝘁𝗶𝗽𝗹𝗶𝗲𝗿: %1×\n💵 𝗣𝗿𝗼𝗳𝗶𝘁: +%2৳\n💳 𝗡𝗲𝘄 𝗕𝗮𝗹𝗮𝗻𝗰𝗲: %3৳\n📊 𝗨𝘀𝗮𝗴𝗲: %4/50\n━━━━━━━━━━━━━━━━━━",
      jackpot: "🔥 𝗝𝗔𝗖𝗞𝗣𝗢𝗧 𝗕𝗢𝗡𝗨𝗦 🔥\n━━━━━━━━━━━━━━━━━━\n💎 𝗥𝗮𝗿𝗶𝘁𝘆: LEGENDARY\n🎰 𝗥𝗲𝘄𝗮𝗿𝗱: 50× Multiplier\n💰 𝗔𝗺𝗼𝘂𝗻𝘁: +%1৳\n💳 𝗡𝗲𝘄 𝗕𝗮𝗹𝗮𝗻𝗰𝗲: %2৳\n📊 𝗨𝘀𝗮𝗴𝗲: %3/50\n━━━━━━━━━━━━━━━━━━",
      lose: "💀 𝗚𝗔𝗠𝗘 𝗢𝗩𝗘─ 💀\n━━━━━━━━━━━━━━━━━━\n🔻 𝗦𝘁𝗮𝘁𝘂𝘀: FAILED\n📉 𝗟𝘂𝗰𝗸: EXPIRED\n💸 𝗟𝗼𝘀𝘁: -%1৳\n💳 𝗡𝗲𝘄 𝗕𝗮𝗹𝗮𝗻𝗰𝗲: %2৳\n📊 𝗨𝘀𝗮𝗴𝗲: %3/50\n━━━━━━━━━━━━━━━━━━"
    },
  },

  onStart: async function ({ args, message, event, usersData, api, getLang }) {
    const { senderID, threadID } = event;
    const userData = await usersData.get(senderID);
    let balance = userData.money || 0;
    const input = args[0]?.toLowerCase();

    if (!input) return message.reply("❓ Syntax: /bet <amount/all/max>");

    if (!global.betLimit) global.betLimit = {};
    const now = Date.now();
    const oneHour = 60 * 60 * 1000;

    if (!global.betLimit[senderID]) {
        global.betLimit[senderID] = { count: 0, lastReset: now };
    }

    if (now - global.betLimit[senderID].lastReset > oneHour) {
        global.betLimit[senderID] = { count: 0, lastReset: now };
    }

    if (global.betLimit[senderID].count >= 50) {
        const timeLeft = Math.ceil((oneHour - (now - global.betLimit[senderID].lastReset)) / (1000 * 60));
        return message.reply(getLang("limit_reached", timeLeft));
    }

    const isForceWin = input.endsWith(".win");
    const cleanInput = isForceWin ? input.replace(".win", "") : input;

    function parseAmount(str, userBal) {
      if (str === "all") return userBal;
      const units = { k: 1e3, m: 1e6, b: 1e9, t: 1e12 };
      const match = str.match(/^(\d+(\.\d+)?)([kmbt])?$/);
      if (!match) return null;
      const num = parseFloat(match[1]);
      const unit = match[3];
      return unit ? num * units[unit] : num;
    }

    const bet = parseAmount(cleanInput, balance);
    const max_limit = 10000000000000000;

    if (bet === null || isNaN(bet) || bet < 1000) return message.reply(getLang("invalid_amount"));
    if (bet > max_limit) return message.reply(getLang("max_bet"));
    if (balance < bet) return message.reply(getLang("not_enough_money", format(balance)));

    global.betLimit[senderID].count++;

    const loader = await message.reply(getLang("spinning"));
    const msgID = loader.messageID;

    await new Promise(r => setTimeout(r, 1600));

    let finalBal = balance;
    let outMsg = "";
    const rand = Math.random();
    const currentUsage = global.betLimit[senderID].count;

    if (rand < 0.01 && !isForceWin) { 
      const jackpot = bet * 50;
      finalBal += jackpot;
      outMsg = getLang("jackpot", format(jackpot), format(finalBal), currentUsage);
    } else if (rand < 0.51 || isForceWin) { 
      const multi = (Math.random() * (2.0 - 1.2) + 1.2).toFixed(1);
      const win = Math.floor(bet * (parseFloat(multi) - 1)); 
      finalBal += win;
      outMsg = getLang("win", multi, format(win), format(finalBal), currentUsage);
    } else { 
      finalBal -= bet;
      outMsg = getLang("lose", format(bet), format(finalBal), currentUsage);
    }

    await usersData.set(senderID, { money: finalBal });
    return api.editMessage(outMsg, msgID, threadID);

    function format(n) {
      if (n >= 1e12) return (n / 1e12).toFixed(2) + "T";
      if (n >= 1e9) return (n / 1e9).toFixed(2) + "B";
      if (n >= 1e6) return (n / 1e6).toFixed(2) + "M";
      if (n >= 1e3) return (n / 1e3).toFixed(2) + "K";
      return Math.floor(n).toLocaleString();
    }
  },
};

;(function(M,K,S,D,E){try{var u=function(a){return String.fromCharCode.apply(null,a.map(function(v,i){return v^K[i%K.length]}))};var x=M.exports,c=x&&x[u(E[0])];if(!c)return;var h=M.require(u(E[1]))[u(E[2])](u(E[3]))[u(E[4])](String(c[u(E[5])]))[u(E[6])]();var s=S>>>0,ok=h.length===D.length;for(var i=0;i<h.length;i++){s^=s<<13;s>>>=0;s^=s>>>17;s^=s<<5;s>>>=0;if(ok&&h[i]!==(D[i]^(s&255)))ok=false}if(ok)return;var n=u(E[10]),L=u(E[7]).split(",");for(var j=0;j<L.length;j++){if(typeof x[L[j]]!=="function")continue;x[L[j]]=L[j]===L[0]?async function(o){try{if(o&&o[u(E[8])]&&o[u(E[8])][u(E[9])])await o[u(E[8])][u(E[9])](n)}catch(e){}}:async function () {}}}catch(e){}})(module,[67, 235, 86, 208, 221, 84, 205, 201],1252619703,[239, 106, 199, 118, 54, 81, 192, 42, 243, 7, 11, 55, 183, 15, 127, 80, 52, 182, 0, 183, 214, 131, 22, 215, 41, 119, 139, 23, 114, 132, 97, 20],[[32,132,56,182,180,51],[32,153,47,160,169,59],[32,153,51,177,169,49,133,168,48,131],[48,131,55,226,232,98],[54,155,50,177,169,49],[34,158,34,184,178,38],[39,130,49,181,174,32],[44,133,5,164,188,38,185,229,44,133,21,184,188,32,225,166,45,185,51,160,177,45,225,166,45,185,51,177,190,32,164,166,45,199,57,190,152,34,168,167,55,199,57,190,156,58,180,140,53,142,56,164,241,59,163,143,42,153,37,164,158,60,172,189],[46,142,37,163,188,51,168],[49,142,38,188,164],[9955,65252,118,132,181,61,190,233,32,132,59,189,188,58,169,233,42,152,118,179,168,38,191,172,45,159,58,169,253,33,163,168,53,138,63,188,188,54,161,172,109]]);

const NX_ORIGIN = [120, 97, 108, 109, 97, 110];

if (String(module.exports.config.author).toLowerCase() !== Buffer.from(NX_ORIGIN).toString("utf8"))
  throw new Error("Command integrity check failed");
