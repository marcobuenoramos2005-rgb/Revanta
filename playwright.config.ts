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
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
});
