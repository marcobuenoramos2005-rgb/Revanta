import { defineConfig, devices } from "@playwright/test";

/** Pruebas de extremo a extremo en tamaños de iPhone, iPad y escritorio. */
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: "http://localhost:3000",
  },
  projects: [
    { name: "iphone", use: { ...devices["iPhone 15 Pro"], browserName: "chromium" } },
    { name: "ipad", use: { ...devices["iPad Pro 11"], browserName: "chromium" } },
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
  ],
  webServer: {
    command: "npm run start",
    env: {
      // Las pruebas NUNCA llaman a la API real: sin clave y con respuestas simuladas.
      ANTHROPIC_API_KEY: "",
      AI_MOCK: "1",
      AI_DAILY_LIMIT: "3",
    },
    url: "http://localhost:3000",
    // Siempre arranca su propio servidor para garantizar el entorno anterior.
    reuseExistingServer: false,
    timeout: 60_000,
  },
});
