ALTER TABLE `writings` ADD `slug` text NOT NULL;--> statement-breakpoint
ALTER TABLE `writings` ADD `content` text NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX `writings_slug_unique` ON `writings` (`slug`);