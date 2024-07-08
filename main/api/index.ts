import express from "express";
import cors from "cors";
import { generate } from "./generate";
import { store } from "../store";

const app = express();
const port = 3001;

app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // Parse JSON request bodies
const apiKey = store.get("apiKey");

app.post("/api/generate", generate(apiKey));

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

export default app;
