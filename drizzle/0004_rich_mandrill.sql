DROP TABLE `ChatTopics`;
--> statement-breakpoint
CREATE TABLE `ChatTopics` (
	`topicId` integer,
	`chatId` text,
	PRIMARY KEY(`chatId`, `topicId`),
	FOREIGN KEY (`topicId`) REFERENCES `Topic`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`chatId`) REFERENCES `Chat`(`id`) ON UPDATE no action ON DELETE no action
);
