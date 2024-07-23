import { eq } from "drizzle-orm";
import { models, activeModels } from "./schema";
import * as schema from "./schema";
import { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";

export function Model(db: BetterSQLite3Database<typeof schema>) {
  return {
    async getModels() {
      return db.select().from(models).all();
    },

    async getModel(id: string) {
      return db.select().from(models).where(eq(models.id, id)).all();
    },

    async addModel(model: any) {
      return db.insert(models).values(model).returning().all();
    },

    async updateModel(model: any) {
      const { id, ...data } = model;
      return db
        .update(models)
        .set(data)
        .where(eq(models.id, id))
        .returning()
        .all();
    },

    async deleteModel(id: string) {
      return db.delete(models).where(eq(models.id, id)).returning().all();
    },

    async getApiKey(modelId: string) {
      const result = await db
        .select({ apiKey: models.apiKey })
        .from(models)
        .where(eq(models.id, modelId));
      return result[0]?.apiKey;
    },

    async setApiKey(modelId: string, apiKey: string) {
      return db
        .update(models)
        .set({ apiKey })
        .where(eq(models.id, modelId))
        .returning()
        .all();
    },

    async getActiveModel(includeModel = false) {
      const result = await db.query.activeModels.findFirst({
        with: { model: true },
      });
      return result;
    },
  };
}
