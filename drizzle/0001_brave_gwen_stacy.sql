CREATE TABLE `journey` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`year` text NOT NULL,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`order` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE `profile` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`role` text NOT NULL,
	`image` text NOT NULL
);
--> statement-breakpoint
ALTER TABLE `bookmarks` ADD `link` text;