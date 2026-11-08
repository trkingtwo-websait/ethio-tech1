// GET /api/image/:id -> the JPEG saved by the admin
import { getStore } from "@netlify/blobs";

export default async (req, context) => {
  const id = context?.params?.id;
  if (!id || !/^[A-Za-z0-9_-]{1,40}$/.test(id)) return new Response("Not found", { status: 404 });
  const store = getStore({ name: "portfolio", consistency: "strong" });
  const data = await store.get("img-" + id, { type: "arrayBuffer" });
  if (!data) return new Response("Not found", { status: 404 });
  return new Response(data, {
    headers: {
      "content-type": "image/jpeg",
      // every new photo gets a new id, so it is safe to cache for a year
      "cache-control": "public, max-age=31536000, immutable",
    },
  });
};

export const config = { path: "/api/image/:id" };
