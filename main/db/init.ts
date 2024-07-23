import path from "path";
import { app, dialog } from "electron";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import { db } from "./index";

const isProd = process.env.NODE_ENV === "production";
const userDataPath = app.getPath("userData");
const dbPath = path.join(userDataPath, "gimmick.db");
process.env.DATABASE_URL = `file:${dbPath}`;

export async function runMigrations() {
  let migrationsPath = path.join(__dirname, "../drizzle");
  if (isProd) {
    migrationsPath = path.join(process.resourcesPath, "drizzle");
  }
  console.log("Running migrations", migrationsPath);
  try {
    migrate(db, { migrationsFolder: migrationsPath });
  } catch (error) {
    console.error("Error running migrations", error);
    dialog.showErrorBox("Error running migrations", error);
  }
}
