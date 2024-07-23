-- Set default model
INSERT INTO "Model" ("id", "provider", "name", "apiKey") VALUES ('openai-gpt-4o', 'OpenAI', 'gpt-4o', '');
--> statement-breakpoint
INSERT INTO "ActiveModel" ("modelId") VALUES ('openai-gpt-4o');
