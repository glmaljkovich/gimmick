import { Request, Response } from "express";
import { topic } from "../../db";

export async function listTopics(req: Request, res: Response) {
  const topics = await topic.getTopics();
  res.json(topics);
}

export async function getTopic(req: Request, res: Response) {
  const id = req.params.id as string;
  const topicData = await topic.getTopic(Number.parseInt(id));
  res.json(topicData);
}

export async function addTopic(req: Request, res: Response) {
  const topicData = req.body;
  const newTopic = await topic.addTopic(topicData);
  res.json(newTopic);
}

export async function updateTopic(req: Request, res: Response) {
  const topicData = req.body;
  const updatedTopic = await topic.updateTopic(topicData);
  res.json(updatedTopic);
}

export async function deleteTopic(req: Request, res: Response) {
  const id = req.params.id as string;
  await topic.deleteTopic(Number.parseInt(id));
  res.json({ success: true });
}

export async function addTopicToChat(req: Request, res: Response) {
  const { topicId, chatId } = req.body;
  const newChatTopic = await topic.addTopicToChat(topicId, chatId);
  res.json(newChatTopic);
}

export async function removeTopicFromChat(req: Request, res: Response) {
  const { topicId, chatId } = req.body;
  await topic.removeTopicFromChat(topicId, chatId);
  res.json({ success: true });
}

export async function getChatsForTopic(req: Request, res: Response) {
  const id = req.params.id as string;
  const chats = await topic.getChatsForTopic(Number.parseInt(id));
  res.json(chats);
}

export async function getTopicsForChat(req: Request, res: Response) {
  const id = req.params.id as string;
  const topics = await topic.getTopicsForChat(id);
  res.json(topics);
}
