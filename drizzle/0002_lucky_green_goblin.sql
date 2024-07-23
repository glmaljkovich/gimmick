CREATE TABLE `Topic` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text,
	`color` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `Chat_id_unique` ON `Chat` (`id`);