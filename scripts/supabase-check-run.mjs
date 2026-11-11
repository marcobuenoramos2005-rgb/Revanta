// Lanza supabase-check.mjs con el archivo de entorno adecuado.
import { spawnSync } from "node:child_process";

const envFile = process.argv.includes("--local") ? ".env.local" : ".env.real.local";
const result = spawnSync(process.execPath, [`--env-file-if-exists=${envFile}`, "scripts/supabase-check.mjs"], {
  stdio: "inherit",
});
process.exit(result.status ?? 1);
