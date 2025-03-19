import { renderHTML, renderRSC } from "@parcel/rsc/node";
import { PLACEHOLDER_TOKEN } from "./token";
import { RSCToHTMLOptions } from "@parcel/rsc/server";

let layoutCache = new Map<
  React.ReactNode,
  Awaited<ReturnType<typeof getLayout>>
>();

// Utility function to log RSC for debugging
export async function getLayout(
  Component: React.ReactNode,
  options: RSCToHTMLOptions,
): Promise<{
  html: readonly [string, string];
}> {
  const fromCache = layoutCache.get(Component);
  if (fromCache) {
    return fromCache;
  }

  // Render With Parcel
  const htmlStream = await renderHTML(Component, options);

  const htmlChunks: Buffer[] = [];
  for await (const chunk of htmlStream) {
    htmlChunks.push(Buffer.from(chunk));
  }
  const htmlPayload = Buffer.concat(htmlChunks).toString("utf-8");

  const tokenIndex = htmlPayload.indexOf(PLACEHOLDER_TOKEN);
  if (tokenIndex === -1) {
    throw new Error("Placeholder token not found in HTML payload");
  }
  const beforeToken = htmlPayload.slice(0, tokenIndex);
  const afterToken = htmlPayload.slice(tokenIndex + PLACEHOLDER_TOKEN.length);

  const result = {
    html: [beforeToken, afterToken] as const,
  };
  layoutCache.set(Component, result);
  return result;
}
