// Lanza supabase-check.mjs con el archivo de entorno adecuado.
import { spawnSync } from "node:child_process";

const envFile = process.argv.includes("--local") ? ".env.local" : ".env.real.local";
const result = spawnSync(process.execPath, [`--env-file-if-exists=${envFile}`, "scripts/supabase-check.mjs"], {
  stdio: "inherit",
  // Si hay un proxy configurado (p. ej. en el entorno de Claude), Node debe usarlo.
  env: { ...process.env, ...(process.env.HTTPS_PROXY ? { NODE_USE_ENV_PROXY: "1", NODE_NO_WARNINGS: "1" } : {}) },
});
process.exit(result.status ?? 1);
