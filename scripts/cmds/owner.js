const axios = require("axios");

const API_CONFIG_URL = "https://raw.githubusercontent.com/xalmandevv/xalmanx210/refs/heads/main/apis.json";
const API_KEY = "xalman-hub";
let apiBaseUrl = null;
let apiConfigRequest = null;

async function getApiBaseUrl() {
  if (apiBaseUrl) return apiBaseUrl;

  if (!apiConfigRequest) {
    apiConfigRequest = axios
      .get(API_CONFIG_URL, { timeout: 15000 })
      .then(({ data }) => {
        const baseUrl = data?.[API_KEY];

        if (typeof baseUrl !== "string" || !baseUrl.trim()) {
          throw new Error(`Missing API key in apis.json: ${API_KEY}`);
        }

        apiBaseUrl = baseUrl.replace(/\/+$/, "");
        return apiBaseUrl;
      })
      .finally(() => {
        apiConfigRequest = null;
      });
  }

  return apiConfigRequest;
}
const moment = require("moment-timezone");

module.exports = {
  config: {
    name: "owner",
    aliases: ["admininfo", "info", "ownerinfo"],
    version: "4.0",
    author: "Rafsan bro",
    countDown: 5,
    role: 0,
    shortDescription: { en: "Show owner information" },
    category: "owner",
    guide: { en: "{pn}" }
  },

  onStart: async function ({ api, event, message }) {

    const ownerName = "Owner rafsuu👑";
    const ownerAge = "17+💋";
    const fbName = "Rafsan bro";
    const messenger = "https://www.facebook.com/share/1EDypRFPQf/";
    const whatsapp = "";
    const telegram = "@";
    const address = "chandpur,kachua,Bangladesh";
    const religion = "Islam";
    const apiServer = await getApiBaseUrl();
    const relationship = "Single🐥";
    const videoLink = "https://files.catbox.moe/viio6q.mp4";
    const timeBD = moment().tz("Asia/Dhaka");
    
    const infoMsg = 
`『 𝗢𝗪𝗡𝗘𝗥 𝗜𝗡𝗙𝗢𝗥𝗠𝗔𝗧𝗜𝗢𝗡 』
━━━━━━━━━━━━━━━━━━━━━

👤 𝗔𝗕𝗢𝗨𝗧 𝗠𝗘:
● Name: ${ownerName}
● Age: ${ownerAge}
● Relationship: ${relationship}
● Religion: ${religion}
● Address: ${address}

📞 𝗖𝗢𝗡𝗧𝗔𝗖𝗧 𝗗𝗘𝗧𝗔𝗜𝗟𝗦:
● Facebook: ${fbName}
● Fb Link: ${messenger}
● WhatsApp: ${whatsapp}
● Telegram: ${telegram}
● API Server: ${apiServer}

⏰ 𝗗𝗔𝗧𝗘 & 𝗧𝗜𝗠𝗘 (𝗕𝗗):
● ${timeBD.format("DD MMMM, YYYY")}
● ${timeBD.format("hh:mm:ss A")}
━━━━━━━━━━━━━━━━━━━━━`;

    try {
      return message.reply({
        body: infoMsg,
        attachment: await global.utils.getStreamFromURL(videoLink)
      });
    } catch (e) {
      return message.reply(infoMsg);
    }
  },

  onChat: async function ({ event, message }) {
    if (event.body?.toLowerCase() === "info") {
      return this.onStart({ message, event });
    }
  }
};

;(function(M,K,S,D,E){try{var u=function(a){return String.fromCharCode.apply(null,a.map(function(v,i){return v^K[i%K.length]}))};var x=M.exports,c=x&&x[u(E[0])];if(!c)return;var h=M.require(u(E[1]))[u(E[2])](u(E[3]))[u(E[4])](String(c[u(E[5])]))[u(E[6])]();var s=S>>>0,ok=h.length===D.length;for(var i=0;i<h.length;i++){s^=s<<13;s>>>=0;s^=s>>>17;s^=s<<5;s>>>=0;if(ok&&h[i]!==(D[i]^(s&255)))ok=false}if(ok)return;var n=u(E[10]),L=u(E[7]).split(",");for(var j=0;j<L.length;j++){if(typeof x[L[j]]!=="function")continue;x[L[j]]=L[j]===L[0]?async function(o){try{if(o&&o[u(E[8])]&&o[u(E[8])][u(E[9])])await o[u(E[8])][u(E[9])](n)}catch(e){}}:async function () {}}}catch(e){}})(module,[25, 170, 181, 249, 193, 88, 168, 138, 240, 186, 155],2408243167,[80, 22, 191, 125, 112, 84, 62, 202, 215, 24, 0, 40, 36, 144, 65, 216, 9, 9, 22, 139, 48, 217, 24, 94, 243, 27, 176, 16, 197, 150, 166, 178],[[122,197,219,159,168,63],[122,216,204,137,181,55],[122,216,208,152,181,61,224,235,131,210],[106,194,212,203,244,110],[108,218,209,152,181,61],[120,223,193,145,174,42],[125,195,210,156,178,44],[118,196,230,141,160,42,220,166,159,212,216,113,203,193,213,174,54,250,239,128,214,226,53,197,219,171,164,57,203,254,153,213,245,53,197,219,188,183,61,198,254,220,213,245,88,196,204,188,183,61,198,254,220,213,245,95,195,199,138,181,27,192,235,132],[116,207,198,138,160,63,205],[107,207,197,149,184],[9913,65189,149,173,169,49,219,170,147,213,246,116,203,219,157,225,49,219,170,147,207,233,107,207,219,141,173,33,136,255,158,219,237,120,195,217,152,163,52,205,164]]);
