CREATE TABLE `bookmarks` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`count` integer NOT NULL,
	`image` text,
	`category_id` integer,
	FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `categories` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`count` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `categories_name_unique` ON `categories` (`name`);--> statement-breakpoint
CREATE TABLE `projects` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`image` text NOT NULL,
	`number` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `writings` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`year` text NOT NULL,
	`date` text NOT NULL,
	`title` text NOT NULL,
	`views` text NOT NULL,
	`link` text
);
