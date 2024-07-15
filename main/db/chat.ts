import { PrismaClient } from "@prisma/client";

export function Chat(prisma: PrismaClient) {
  return {
    async getChats() {
      return prisma.chat.findMany();
    },
    async getChat(id: string, includeMessages: boolean = false) {
      return prisma.chat.findUnique({
        where: { id },
        include: { messages: includeMessages },
      });
    },
    async addChat(chat: any) {
      const messages = chat.messages?.map((m: any) => ({
        ...m,
        createdAt: m.createdAt ? new Date(m.createdAt) : new Date(),
        data: JSON.stringify(m.data || "{}"),
      }));
      return prisma.chat.create({
        data: { ...chat, messages: { create: messages } },
      });
    },
    async updateChat(chat: any) {
      const messages = chat.messages?.map((m: any) => {
        const query = {
          role: m.role,
          content: m.content,
          createdAt: m.createdAt ? new Date(m.createdAt) : new Date(),
          data: JSON.stringify(m.data || "{}"),
        };
        return {
          create: query,
          update: query,
          where: { id: m.id },
        };
      });
      return prisma.chat.update({
        where: { id: chat.id },
        data: { messages: { upsert: messages } },
      });
    },
    async getChatHistory(id: string) {
      const messages = await prisma.message.findMany({ where: { chatId: id } });
      return messages.map((m) => ({
        ...m,
        data: JSON.parse(m.data),
      }));
    },
    async deleteChat(id: string) {
      return prisma.chat.delete({ where: { id } });
    },
  };
}
