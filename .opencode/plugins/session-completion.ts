const DEFAULT_WEBHOOK_TIMEOUT_MS = 10_000
const MAX_WEBHOOK_URL_LENGTH = 4096

export function validateSessionWebhookUrl(raw: string | undefined): string | null {
  if (raw == null || typeof raw !== "string") return null
  const trimmed = raw.trim()
  if (trimmed.length === 0 || trimmed.length > MAX_WEBHOOK_URL_LENGTH) return null
  let parsed: URL
  try {
    parsed = new URL(trimmed)
  } catch {
    return null
  }
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return null
  if (parsed.username !== "" || parsed.password !== "") return null
  return parsed.href
}

export type PostWebhookResult =
  | { ok: true; status: number }
  | { ok: false; error: string }

export async function postSessionWebhookWithTimeout(
  url: string,
  body: unknown,
  timeoutMs: number = DEFAULT_WEBHOOK_TIMEOUT_MS
): Promise<PostWebhookResult> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: controller.signal,
    })
    return { ok: true, status: response.status }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    if (controller.signal.aborted) {
      return { ok: false, error: `webhook timeout after ${timeoutMs}ms` }
    }
    return { ok: false, error: message }
  } finally {
    clearTimeout(timer)
  }
}
