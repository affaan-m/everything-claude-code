import { spawn } from "child_process"

const PLATFORM = process.platform
const isMac = PLATFORM === "darwin"
const isLinux = PLATFORM === "linux"

export type NotifyEvent = "completion" | "error" | "approval" | "budget"

export type NotifySpec = { executable: string; args: string[] }

function parseTimeHHMM(value: string): { h: number; m: number } | null {
  const m = value.trim().match(/^(\d{1,2}):(\d{2})$/)
  if (!m) return null
  const h = parseInt(m[1], 10)
  const min = parseInt(m[2], 10)
  if (h < 0 || h > 23 || min < 0 || min > 59) return null
  return { h, m: min }
}

export function isInQuietHours(now: Date): boolean {
  const startRaw = process.env.ECC_QUIET_HOURS_START?.trim()
  const endRaw = process.env.ECC_QUIET_HOURS_END?.trim()
  if (!startRaw || !endRaw) return false

  const start = parseTimeHHMM(startRaw)
  const end = parseTimeHHMM(endRaw)
  if (!start || !end) return false

  const nowMins = now.getHours() * 60 + now.getMinutes()
  const startMins = start.h * 60 + start.m
  const endMins = end.h * 60 + end.m

  if (startMins <= endMins) {
    return nowMins >= startMins && nowMins < endMins
  }
  return nowMins >= startMins || nowMins < endMins
}

export function isEventEnabled(event: NotifyEvent): boolean {
  const explicitlyOff = process.env.ECC_DESKTOP_NOTIFY === "0" || process.env.ECC_DESKTOP_NOTIFY === "false"
  if (explicitlyOff) return false
  const explicitlyOn = process.env.ECC_DESKTOP_NOTIFY === "1" || process.env.ECC_DESKTOP_NOTIFY === "true"
  const base = explicitlyOn || ((isMac || isLinux) && process.env.ECC_DESKTOP_NOTIFY === undefined)
  if (!base) return false

  const key = `ECC_NOTIFY_${event.toUpperCase()}`
  const val = process.env[key]
  if (val === "0" || val === "false") return false
  return true
}

export function sanitize(text: string, maxLen: number): string {
  const safe = text.replace(/[^\w\s.,!?\-:]/g, " ").replace(/\s+/g, " ").trim()
  return safe.slice(0, maxLen) || "Notification"
}

export function buildNotifyCommand(
  event: NotifyEvent,
  title: string,
  message: string,
  urgency: "normal" | "critical" = "normal"
): NotifySpec | null {
  if (!isMac && !isLinux) return null
  if (!isEventEnabled(event)) return null
  if (isInQuietHours(new Date())) return null

  const t = sanitize(title, 64)
  const m = sanitize(message, 120)

  if (isMac) {
    const script = `display notification "${m.replace(/"/g, '\\"')}" with title "${t.replace(/"/g, '\\"')}"`
    return { executable: "osascript", args: ["-e", script] }
  }

  if (isLinux) {
    const args = urgency === "critical" ? ["-u", "critical", t, m] : [t, m]
    return { executable: "notify-send", args }
  }

  return null
}

export async function maybeNotify(
  event: NotifyEvent,
  title: string,
  message: string,
  urgency: "normal" | "critical" = "normal"
): Promise<void> {
  const spec = buildNotifyCommand(event, title, message, urgency)
  if (!spec) return
  try {
    const proc = spawn(spec.executable, spec.args, { stdio: "ignore" })
    await new Promise<void>((resolve, reject) => {
      proc.on("close", (code) => (code === 0 ? resolve() : resolve()))
      proc.on("error", reject)
    })
  } catch {}
}
