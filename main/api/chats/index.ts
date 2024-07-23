import { Request, Response } from "express";
import { chat } from "../../db";

export async function listChats(req: Request, res: Response) {
  const search = req.query.search as string;
  const chats = await chat.getChats(search);
  res.json(chats);
}

export async function getChat(req: Request, res: Response) {
  const id = req.params.id;
  const chatData = await chat.getChat(id, true);
  res.json(chatData);
}

export async function addChat(req: Request, res: Response) {
  const chatData = req.body;
  const newChat = await chat.addChat(chatData);
  res.json(newChat);
}

export async function updateChat(req: Request, res: Response) {
  const chatData = req.body;
  const updatedChat = await chat.updateChat(chatData);
  res.json(updatedChat);
}

export async function deleteChat(req: Request, res: Response) {
  const id = req.params.id;
  await chat.deleteChat(id);
  res.json({ success: true });
}
