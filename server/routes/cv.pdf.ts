import { getQuery, sendRedirect } from "h3";
import type { H3Event } from "h3";

import puppeteer from "@cloudflare/puppeteer";

import { parseCvOptions, serializeCvOptions } from "#shared/cv";

const MAX_AGE = 60 * 60 * 24 * 7;

const CACHE_PREFIX = "cv:pdf:v1:";

const VIEWPORT = { width: 816, height: 1056, deviceScaleFactor: 2 };

const PDF_OPTIONS = {
  format: "letter" as const,
  printBackground: true,
  margin: { top: "0", right: "0", bottom: "0", left: "0" },
};

interface BrowserBinding {
  fetch: typeof fetch;
}

function browserBinding(event: H3Event): BrowserBinding | undefined {
  return event.context.cloudflare?.env?.BROWSER;
}

function targetUrl(event: H3Event): string {
  const host = event.node.req.headers.host ?? "localhost:3000";
  const protocol = event.node.req.headers["x-forwarded-proto"] ?? "http";

  const options = parseCvOptions(getQuery(event));
  const search = new URLSearchParams(serializeCvOptions(options)).toString();

  return `${protocol}://${host}/cv${search ? `?${search}` : ""}`;
}

async function fetchCvHtml(url: string): Promise<string | null> {
  return fetch(url)
    .then((response) => (response.ok ? response.text() : null))
    .catch(() => null);
}

function cacheKeyFor(url: string, html: string | null): Promise<string> | string {
  const query = new URL(url).search;

  if (!html) return CACHE_PREFIX + query;

  return digest(html).then((fingerprint) => `${CACHE_PREFIX}${fingerprint}?${query}`);
}

async function digest(body: string): Promise<string> {
  const bytes = new TextEncoder().encode(body.replace(/<head[\s\S]*?<\/head>/i, ""));
  const hash = await crypto.subtle.digest("SHA-256", bytes);

  return [...new Uint8Array(hash)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

function pdfResponse(base64: string): Response {
  return new Response(Buffer.from(base64, "base64"), {
    headers: {
      "content-type": "application/pdf",
      "content-disposition": 'inline; filename="lemuel-de-los-santos-cv.pdf"',
      "cache-control": `public, max-age=${MAX_AGE}, immutable`,
    },
  });
}

export default defineEventHandler(async (event) => {
  const binding = browserBinding(event);

  const url = targetUrl(event);

  if (!binding) {
    return sendRedirect(event, url, 302);
  }

  const html = await fetchCvHtml(url);
  const cacheKey = await cacheKeyFor(url, html);

  const cached = await useStorage("stats")
    .getItem<string>(cacheKey)
    .catch(() => null);

  if (cached) {
    return pdfResponse(cached);
  }

  const browser = await puppeteer.launch(binding);

  try {
    const page = await browser.newPage();

    await page.setViewport(VIEWPORT);

    await page.goto(url, { waitUntil: "networkidle0" });

    await page.addStyleTag({
      content: "[data-reveal]:not([data-revealed]){opacity:1 !important;translate:none !important}",
    });

    await page.emulateMediaType("print");

    const pdf = await page.pdf(PDF_OPTIONS);
    const encoded = Buffer.from(pdf).toString("base64");

    await useStorage("stats")
      .setItem(cacheKey, encoded)
      .catch(() => {});

    return pdfResponse(encoded);
  } finally {
    await browser.close();
  }
});
