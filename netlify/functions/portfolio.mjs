// GET  /api/portfolio  -> { items: [...] | null }   (public, everyone can read)
// POST /api/portfolio  -> admin only (header x-admin-password), actions: "login" | "save"
import { getStore } from "@netlify/blobs";
import { timingSafeEqual } from "node:crypto";

const MAX_ITEMS = 60;
const TYPES = ["Website", "Mobile App", "E-Commerce"];

const json = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" },
  });

const clip = (s, n) => String(s ?? "").trim().slice(0, n);

function cleanUrl(u) {
  try {
    const x = new URL(String(u || "").trim());
    return x.protocol === "https:" || x.protocol === "http:" ? x.href : "";
  } catch {
    return "";
  }
}

function cleanMedia(m) {
  m = String(m || "");
  if (m === "cover:web" || m === "cover:app") return m;
  if (/^\/api\/image\/[A-Za-z0-9_-]{1,40}$/.test(m)) return m;
  return "cover:web";
}

function cleanItem(it) {
  const id = Number.isFinite(Number(it?.id)) ? Number(it.id) : Date.now();
  return {
    id,
    type: TYPES.includes(it?.type) ? it.type : "Website",
    media: cleanMedia(it?.media),
    link: cleanUrl(it?.link),
    title: { am: clip(it?.title?.am, 120), en: clip(it?.title?.en, 120) },
    desc: { am: clip(it?.desc?.am, 600), en: clip(it?.desc?.en, 600) },
  };
}

function passwordOk(req) {
  const expected = process.env.ADMIN_PASSWORD || "";
  if (!expected) return false; // not configured: nobody can write
  const got = Buffer.from(req.headers.get("x-admin-password") || "");
  const want = Buffer.from(expected);
  return got.length === want.length && timingSafeEqual(got, want);
}

export default async (req) => {
  const store = getStore({ name: "portfolio", consistency: "strong" });

  if (req.method === "GET") {
    const data = await store.get("items", { type: "json" });
    return json({ items: Array.isArray(data) ? data : null });
  }
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);

  if (!passwordOk(req)) {
    await new Promise((r) => setTimeout(r, 500)); // slow down guessing
    return json({ error: "unauthorized" }, 401);
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return json({ error: "bad_json" }, 400);
  }
  if (body.action === "login") return json({ ok: true });
  if (body.action !== "save" || !Array.isArray(body.items)) return json({ error: "bad_request" }, 400);

  const items = body.items.slice(0, MAX_ITEMS).map(cleanItem);

  const images = body.images && typeof body.images === "object" ? body.images : {};
  for (const [id, b64] of Object.entries(images)) {
    if (!/^[A-Za-z0-9_-]{1,40}$/.test(id) || typeof b64 !== "string") continue;
    const bytes = Buffer.from(b64, "base64");
    const isJpeg = bytes.length > 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
    if (!isJpeg || bytes.length > 1_500_000) return json({ error: "bad_image" }, 400);
    const ab = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength);
    await store.set("img-" + id, ab, { metadata: { contentType: "image/jpeg" } });
  }

  await store.setJSON("items", items);

  // Delete photos that no project uses any more.
  const used = new Set(
    items.filter((i) => i.media.startsWith("/api/image/")).map((i) => i.media.slice("/api/image/".length))
  );
  const { blobs } = await store.list({ prefix: "img-" });
  await Promise.all(blobs.filter((b) => !used.has(b.key.slice(4))).map((b) => store.delete(b.key)));

  return json({ ok: true, items });
};

export const config = { path: "/api/portfolio" };
