-- CreateTable
CREATE TABLE "ActiveModel" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "modelId" TEXT NOT NULL,
    CONSTRAINT "ActiveModel_modelId_fkey" FOREIGN KEY ("modelId") REFERENCES "Model" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "ActiveModel_modelId_key" ON "ActiveModel"("modelId");

-- Set default model
INSERT INTO "Model" ("id", "provider", "name", "apiKey") VALUES ("openai-gpt-4o", "Open AI", "GPT-4o", "");
INSERT INTO "ActiveModel" ("modelId") VALUES ("openai-gpt-4o");
