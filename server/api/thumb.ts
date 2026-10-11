import { getQuery, createError } from "h3";

const FILE_RE = /^[\w][\w.-]*$/;

const WIDTH = 168;
const QUALITY = 28;

export default defineEventHandler(async (event) => {
  const file = String(getQuery(event).file ?? "");

  if (!file || !FILE_RE.test(file)) {
    throw createError({ statusCode: 400, statusMessage: "Invalid file name" });
  }

  const { assets } = useRuntimeConfig();

  const url =
    `${assets.baseUrl}/cdn-cgi/image/width=${WIDTH},quality=${QUALITY},fit=scale-down` +
    `/wallpapers/${file}`;

  const upstream = await fetch(url).catch(() => null);

  if (!upstream?.ok) {
    throw createError({ statusCode: 404, statusMessage: "Thumbnail unavailable" });
  }

  const body = await upstream.arrayBuffer();

  return new Response(body, {
    headers: {
      "content-type": upstream.headers.get("content-type") ?? "image/jpeg",
      "content-length": String(body.byteLength),

      "cache-control": "public, max-age=604800, immutable",
    },
  });
});
