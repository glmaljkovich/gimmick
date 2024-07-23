import { eq } from "drizzle-orm";
import { files } from "./schema";
import * as schema from "./schema";
import { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import cuid from "cuid";

const PAGE_SIZE = 100;

export function File(db: BetterSQLite3Database<typeof schema>) {
  return {
    async getFiles() {
      return db.select().from(files).limit(PAGE_SIZE).all();
    },

    async getFile(id: string) {
      return db.select().from(files).where(eq(files.id, id)).all();
    },

    async addFile(file: any) {
      const { name, path, snippet, id } = file;
      return db
        .insert(files)
        .values({ name, path, snippet, id })
        .onConflictDoUpdate({ target: files.id, set: { name, path, snippet } })
        .returning()
        .get();
    },

    async updateFile(file: any) {
      const { id, ...data } = file;
      return db
        .update(files)
        .set(data)
        .where(eq(files.id, id))
        .returning()
        .all();
    },

    async deleteFile(id: string) {
      return db.delete(files).where(eq(files.id, id)).returning().all();
    },
  };
}
