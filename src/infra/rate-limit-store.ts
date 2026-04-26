import fs from "node:fs"
import path from "node:path"
import os from "node:os"

type PersistedLockout = {
  key: string
  lockedUntil: number
}

function resolveLockoutStorePath(): string {
  const stateDir =
    process.env.OPENCLAW_STATE_DIR ??
    path.join(os.homedir(), ".openclaw")
  return path.join(stateDir, "auth-lockouts.json")
}

export function loadPersistedLockouts(): Map<string, number> {
  const result = new Map<string, number>()
  try {
    const filePath = resolveLockoutStorePath()
    const raw = fs.readFileSync(filePath, "utf-8")
    const data = JSON.parse(raw) as { lockouts?: PersistedLockout[] }
    const now = Date.now()
    for (const entry of data.lockouts ?? []) {
      if (typeof entry.key === "string" && typeof entry.lockedUntil === "number") {
        if (entry.lockedUntil > now) {
          result.set(entry.key, entry.lockedUntil)
        }
      }
    }
  } catch {
    // archivo no existe o parse error, ok
  }
  return result
}

export function persistLockout(key: string, lockedUntil: number): void {
  try {
    const filePath = resolveLockoutStorePath()
    let existing: PersistedLockout[] = []
    try {
      const raw = fs.readFileSync(filePath, "utf-8")
      const data = JSON.parse(raw) as { lockouts?: PersistedLockout[] }
      existing = data.lockouts ?? []
    } catch {
      // ok
    }
    const now = Date.now()
    const filtered = existing.filter(
      (e) => e.key !== key && e.lockedUntil > now,
    )
    filtered.push({ key, lockedUntil })
    fs.writeFileSync(filePath, JSON.stringify({ lockouts: filtered }, null, 2), "utf-8")
  } catch {
    // No fallar silenciosamente
  }
}

export function clearPersistedLockout(key: string): void {
  try {
    const filePath = resolveLockoutStorePath()
    const raw = fs.readFileSync(filePath, "utf-8")
    const data = JSON.parse(raw) as { lockouts?: PersistedLockout[] }
    const now = Date.now()
    const filtered = (data.lockouts ?? []).filter(
      (e) => e.key !== key && e.lockedUntil > now,
    )
    fs.writeFileSync(filePath, JSON.stringify({ lockouts: filtered }, null, 2), "utf-8")
  } catch {
    // ok
  }
}
