-- Step 1: Create a new table with the desired foreign key constraints
CREATE TABLE ChatTopics_New (
    topicId INTEGER NOT NULL,
    chatId TEXT NOT NULL,
    PRIMARY KEY (topicId, chatId),
    FOREIGN KEY (topicId) REFERENCES Topic(id),
    FOREIGN KEY (chatId) REFERENCES Chat(id) ON DELETE CASCADE
);
--> statement-breakpoint
-- Step 2: Copy data from the existing table to the new table
INSERT INTO ChatTopics_New (topicId, chatId)
SELECT topicId, chatId FROM ChatTopics;
--> statement-breakpoint
-- Step 3: Drop the old table
DROP TABLE ChatTopics;
--> statement-breakpoint
-- Step 4: Rename the new table to the old table’s name
ALTER TABLE ChatTopics_New RENAME TO ChatTopics;
