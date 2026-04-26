import crypto from "node:crypto"
import { loadConfig, writeConfigFile } from "../config/config.js"

export async function rotateGatewayToken(): Promise<void> {
  const config = await Promise.resolve(loadConfig())

  const newToken = crypto.randomBytes(32).toString("hex")

  const updated = {
    ...config,
    gateway: {
      ...(config.gateway ?? {}),
      auth: {
        ...(config.gateway?.auth ?? {}),
        mode: "token" as const,
        token: newToken,
      },
    },
  }

  await writeConfigFile(updated)

  console.log("Gateway token rotated successfully.")
  console.log(`New token: ${newToken}`)
  console.log(
    "Restart the gateway to apply the change (or it will reload automatically if hot-reload is enabled).",
  )
}
