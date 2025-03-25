import { renderHTML } from "@parcel/rsc/node";
import { renderRSC } from "@parcel/rsc/server";
import { RSCToHTMLOptions } from "@parcel/rsc/server";
import { PLACEHOLDER_TOKEN } from "../token";

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
  rsc: string;
}> {
  const fromCache = layoutCache.get(Component);
  if (fromCache) {
    return fromCache;
  }

  // Render With Parcel
  const [htmlPayload, rscPayload] = await Promise.all([
    unwrapStream(renderHTML(Component, options)),
    unwrapStream(renderRSC(Component, options)),
  ]);

  const tokenIndex = htmlPayload.indexOf(PLACEHOLDER_TOKEN);
  if (tokenIndex === -1) {
    throw new Error("Placeholder token not found in HTML payload");
  }
  const beforeToken = htmlPayload.slice(0, tokenIndex);
  const afterToken = htmlPayload.slice(tokenIndex + PLACEHOLDER_TOKEN.length);

  const result = {
    html: [beforeToken, afterToken] as const,
    rsc: rscPayload,
  };
  layoutCache.set(Component, result);
  return result;
}

async function unwrapStream(
  stream:
    | Promise<ReadableStream | import("stream").Readable>
    | ReadableStream
    | import("stream").Readable,
) {
  const chunks: Buffer[] = [];
  for await (const chunk of await stream) {
    chunks.push(Buffer.from(chunk));
  }
  return Buffer.concat(chunks).toString("utf-8");
}
