CREATE TABLE `Model` (
	`id` text PRIMARY KEY NOT NULL,
	`provider` text,
	`name` text,
	`apiKey` text
);
--> statement-breakpoint
CREATE TABLE `ActiveModel` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`modelId` text,
	FOREIGN KEY (`modelId`) REFERENCES `Model`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `Chat` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text,
	`createdAt` integer DEFAULT (strftime('%s','now')),
	`data` text
);
--> statement-breakpoint
CREATE TABLE `File` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text,
	`path` text,
	`uploadedAt` integer DEFAULT (strftime('%s','now')),
	`snippet` text
);
--> statement-breakpoint
CREATE TABLE `Message` (
	`id` text PRIMARY KEY NOT NULL,
	`role` text,
	`content` text,
	`createdAt` integer DEFAULT (strftime('%s','now')),
	`data` text,
	`chatId` text,
	FOREIGN KEY (`chatId`) REFERENCES `Chat`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `ActiveModel_modelId_unique` ON `ActiveModel` (`modelId`);
