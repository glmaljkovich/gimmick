import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import { app } from "electron";
import path from "path";

import * as schema from "./schema";
import { Chat } from "./chat";
import { File } from "./file";
import { Message } from "./message";
import { Model } from "./model";
import { Topic } from "./topics";

const userDataPath = app.getPath("userData");
const dbPath = path.join(userDataPath, "gimmick.db");

const sqlite = new Database(dbPath);

export const db = drizzle(sqlite, { schema });
export const chat = Chat(db);
export const file = File(db);
export const message = Message(db);
export const model = Model(db);
export const topic = Topic(db);
