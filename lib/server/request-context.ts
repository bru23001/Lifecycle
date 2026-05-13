import { headers } from "next/headers";

const REQUEST_ID_RE = /^req_[0-9A-Za-z]{22}$/;

/**
 * Returns request correlation id from inbound headers when available.
 * Works in server actions and route handlers.
 */
export async function getRequestIdFromHeaders(): Promise<string | undefined> {
  try {
    const h = await headers();
    const value = h.get("x-request-id")?.trim();
    if (!value) return undefined;
    return REQUEST_ID_RE.test(value) ? value : undefined;
  } catch {
    return undefined;
  }
}
