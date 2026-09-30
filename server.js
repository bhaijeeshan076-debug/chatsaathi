// ChatSaathi: backend (API key yahin safe rehti hai)
const express = require("express");
const app = express();
app.use(express.json({ limit: "50kb" }));
app.get("/", (req, res) => res.sendFile(__dirname + "/index.html"));

const KEY = process.env.ANTHROPIC_API_KEY;
const LIMIT = parseInt(process.env.FREE_MSGS_PER_DAY || "15", 10);
const MODEL = "claude-haiku-4-5-20251001"; // sasta aur tez

const SC = {
  "Pehli baar baat": "Tum dono ki abhi nayi jaan-pehchaan hui hai (dosto ke through). Tum thodi shy ho par friendly.",
  "Crush": "Ladka tumhara classmate/colleague hai. Tum friendly ho par dheere khulti ho.",
  "Dating app": "Tum dono ka Hinge/Bumble par abhi match hua hai. Tumhe boring 'hi' pasand nahi.",
};

// Simple daily limit per IP (production me database/login use karo)
const usage = new Map();
function allowed(ip) {
  const day = new Date().toISOString().slice(0, 10);
  const k = ip + day;
  const n = usage.get(k) || 0;
  if (n >= LIMIT) return false;
  usage.set(k, n + 1);
  return true;
}

async function ask(prompt) {
  const r = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 400,
      messages: [{ role: "user", content: prompt }],
    }),
  });
  if (!r.ok) throw new Error("API " + r.status);
  const j = await r.json();
  return j.content.map((c) => c.text || "").join("").trim();
}

const clean = (h) =>
  (Array.isArray(h) ? h : []).slice(-30)
    .map((x) => (x[0] === "me" ? "Ladka: " : "Ladki: ") + String(x[1]).slice(0, 500))
    .join("\n");

app.post("/api/chat", async (req, res) => {
  try {
    if (!allowed(req.ip)) return res.status(429).json({ error: "Aaj ki free limit khatam. Kal aana ya Premium lo." });
    const sc = SC[req.body.scenario] || SC["Pehli baar baat"];
    const p = `Tum ek ladki ka role play kar rahi ho jo ek ladke ko chat practice me madad kar rahi hai. Situation: ${sc}
Hinglish me, chhote natural messages (1-2 line), WhatsApp jaise. Agar ladka boring, copy-paste ya pushy ho to halka cold reply do; agar respectful aur interesting ho to khulkar baat karo. Character mat todo. Sirf ladki ka agla message likho.

Ab tak ki baat:
${clean(req.body.history)}
Ladki:`;
    const text = (await ask(p)).replace(/^Ladki:\s*/, "");
    res.json({ text });
  } catch (e) {
    res.status(500).json({ error: "Kuch gadbad hui, dobara try karo." });
  }
});

app.post("/api/feedback", async (req, res) => {
  try {
    if (!allowed(req.ip)) return res.status(429).json({ error: "Aaj ki free limit khatam." });
    const p = `Ye ek ladke aur ladki ke beech practice chat hai. Ladke ke messages par Hinglish me chhota dost jaisa feedback do (max 8 lines): 1) Kya achha tha 2) Kya sudharna hai (example ke saath) 3) Ek agla message suggest karo. Focus: respect, genuine interest, sawal poochna, natural tone. Manipulation ya pickup tricks mat sikhao.

Chat:
${clean(req.body.history)}`;
    res.json({ text: await ask(p) });
  } catch (e) {
    res.status(500).json({ error: "Feedback nahi aa paya." });
  }
});

app.listen(process.env.PORT || 3000, () => console.log("Chal raha hai"));
