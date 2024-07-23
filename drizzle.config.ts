import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./main/db/schema.ts",
  dialect: "sqlite",
  dbCredentials: {
    url: "file:/Users/gabriel/Library/Application Support/gimmick/gimmick.db",
  },
  migrations: {
    prefix: "index",
  },
});
