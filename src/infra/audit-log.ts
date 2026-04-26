import fs from "node:fs"
import path from "node:path"
import os from "node:os"

export type AuditEventType =
  | "auth_failure"
  | "auth_success"
  | "rate_limited"
  | "suspicious_content"
  | "lockout"
  | "ws_connection_rejected"

export type AuditEvent = {
  type: AuditEventType
  ts: number
  ip?: string
  user?: string
  reason?: string
  detail?: string
}

const MAX_LOG_BYTES = 10 * 1024 * 1024 // 10MB

function resolveAuditLogPath(): string {
  const stateDir =
    process.env.OPENCLAW_STATE_DIR ??
    path.join(os.homedir(), ".openclaw")
  return path.join(stateDir, "audit.log")
}

export function logAuditEvent(event: AuditEvent): void {
  const logPath = resolveAuditLogPath()
  try {
    try {
      const stat = fs.statSync(logPath)
      if (stat.size > MAX_LOG_BYTES) {
        const rotated = `${logPath}.1`
        if (fs.existsSync(rotated)) {
          fs.unlinkSync(rotated)
        }
        fs.renameSync(logPath, rotated)
      }
    } catch {
      // archivo no existe aún, ok
    }
    const line = JSON.stringify({ ...event, ts: event.ts ?? Date.now() }) + "\n"
    fs.appendFileSync(logPath, line, "utf-8")
  } catch {
    // No fallar por errores de log
  }
}
