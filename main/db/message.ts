import { PrismaClient } from "@prisma/client";

export function Message(prisma: PrismaClient) {
  return {
    async getMessages() {
      return prisma.message.findMany();
    },
    async getMessage(id: string) {
      return prisma.message.findUnique({ where: { id } });
    },
    async addMessage(message: any) {
      return prisma.message.create({ data: message });
    },
    async updateMessage(message: any) {
      return prisma.message.update({
        where: { id: message.id },
        data: message,
      });
    },
    async deleteMessage(id: string) {
      return prisma.message.delete({ where: { id } });
    },
  };
}
