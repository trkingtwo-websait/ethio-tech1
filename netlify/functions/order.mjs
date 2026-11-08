// POST /api/order -> sends the customer's order to your Telegram through your bot.
// The bot token lives only in Netlify environment variables, never in the web page.
const SERVICES = { web: "Website", app: "Mobile App", both: "Website & App" };

const json = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
  });

const clip = (s, n) => String(s ?? "").trim().slice(0, n);

export default async (req) => {
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);

  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return json({ error: "not_configured" }, 500);

  let body;
  try {
    body = await req.json();
  } catch {
    return json({ error: "bad_json" }, 400);
  }

  if (body.website) return json({ ok: true }); // hidden spam-trap field was filled: pretend success

  const name = clip(body.name, 80);
  const phone = clip(body.phone, 30);
  const details = clip(body.details, 1500);
  const service = SERVICES[body.service] || "Website";
  if (!name || !/^[0-9+\s-]{9,15}$/.test(phone)) return json({ error: "invalid" }, 400);

  const when = new Date().toLocaleString("en-GB", { timeZone: "Africa/Addis_Ababa" });
  const text =
    "🆕 አዲስ ትዕዛዝ / New order\n\n" +
    `👤 ${name}\n📞 ${phone}\n🛠 ${service}\n📝 ${details || "-"}\n\n` +
    `🌐 ${body.lang === "en" ? "English" : "አማርኛ"} · 🕒 ${when}`;

  const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text, disable_web_page_preview: true }),
  });
  if (!res.ok) return json({ error: "telegram_failed" }, 502);
  return json({ ok: true });
};

export const config = {
  path: "/api/order",
  rateLimit: { windowLimit: 6, windowSize: 60, aggregateBy: ["ip", "domain"] },
};
