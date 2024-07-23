import { app } from "electron";
import { Request, Response } from "express";
import { file } from "../../db";

export const listFiles = () =>
  async function (req: Request, res: Response) {
    const documents = await file.getFiles();
    // return documents in body
    res.json(documents);
  };
