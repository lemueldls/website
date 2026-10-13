import { getQuery, sendRedirect } from "h3";
import type { H3Event } from "h3";

import puppeteer from "@cloudflare/puppeteer";

import { parseCvOptions, serializeCvOptions, type CvOptions } from "#shared/cv";
import { presets } from "~/composables/about";

const MAX_AGE = 60 * 60 * 24 * 7;

const CACHE_PREFIX = "cv:pdf:v2:";

const VIEWPORT = { width: 816, height: 1056, deviceScaleFactor: 2 };

const PDF_OPTIONS = {
  format: "letter" as const,
  printBackground: true,
};

interface BrowserBinding {
  fetch: typeof fetch;
}

function browserBinding(event: H3Event): BrowserBinding | undefined {
  return event.context.cloudflare?.env?.BROWSER;
}

function targetUrl(event: H3Event, options: CvOptions): string {
  const host = event.node.req.headers.host ?? "localhost:3000";
  const protocol = event.node.req.headers["x-forwarded-proto"] ?? "http";

  const search = new URLSearchParams(serializeCvOptions(options)).toString();

  return `${protocol}://${host}/cv${search ? `?${search}` : ""}`;
}

function cacheKey(event: H3Event, options: CvOptions): string {
  const stamp = useRuntimeConfig(event).cvPdfStamp || "dev";
  const query = new URLSearchParams(serializeCvOptions(options)).toString();

  return `${CACHE_PREFIX}${stamp}~${query}`;
}

function downloadName(preset: string): string {
  return presets[preset]?.download ?? "lemuel-de-los-santos-cv.pdf";
}

function pdfResponse(base64: string, preset: string): Response {
  return new Response(Buffer.from(base64, "base64"), {
    headers: {
      "content-type": "application/pdf",
      "content-disposition": `inline; filename="${downloadName(preset)}"`,
      "cache-control": `public, max-age=${MAX_AGE}, immutable`,
    },
  });
}

export default defineEventHandler(async (event) => {
  const binding = browserBinding(event);

  const options = parseCvOptions(getQuery(event));
  const url = targetUrl(event, options);

  if (!binding) {
    return sendRedirect(event, url, 302);
  }

  const key = cacheKey(event, options);

  const cached = await useStorage("cache")
    .getItem<string>(key)
    .catch(() => null);

  if (cached) {
    return pdfResponse(cached, options.preset);
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

    await useStorage("cache")
      .setItem(cacheKey(event, options), encoded)
      .catch(() => {});

    return pdfResponse(encoded, options.preset);
  } finally {
    await browser.close();
  }
});
