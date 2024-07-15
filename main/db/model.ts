import { PrismaClient } from "@prisma/client";

export function Model(prisma: PrismaClient) {
  return {
    async getModels() {
      return prisma.model.findMany();
    },
    async getModel(id: string) {
      return prisma.model.findUnique({ where: { id } });
    },
    async addModel(model: any) {
      return prisma.model.create({ data: model });
    },
    async updateModel(model: any) {
      return prisma.model.update({
        where: { id: model.id },
        data: model,
      });
    },
    async deleteModel(id: string) {
      return prisma.model.delete({ where: { id } });
    },
    async getApiKey(modelId: string) {
      const model = await prisma.model.findUnique({ where: { id: modelId } });
      return model.apiKey;
    },
    async setApiKey(modelId: string, apiKey: string) {
      return prisma.model.update({
        where: { id: modelId },
        data: { apiKey },
      });
    },
    async getActiveModel(includeModel = false) {
      return prisma.activeModel.findFirst({ include: { model: includeModel } });
    },
  };
}
