CREATE TABLE `bugs` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text,
	`category` text NOT NULL,
	`description` text NOT NULL,
	`severity` text NOT NULL,
	`version` text NOT NULL,
	`device` text DEFAULT '' NOT NULL,
	`os` text DEFAULT '' NOT NULL,
	`media_key` text,
	`status` text DEFAULT 'open' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `events` (
	`id` text PRIMARY KEY NOT NULL,
	`kind` text NOT NULL,
	`page` text DEFAULT '' NOT NULL,
	`platform` text DEFAULT '' NOT NULL,
	`version` text DEFAULT '' NOT NULL,
	`source` text DEFAULT '' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `feedback` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text,
	`rating` integer NOT NULL,
	`enjoyed` text DEFAULT '[]' NOT NULL,
	`improve` text DEFAULT '[]' NOT NULL,
	`comment` text DEFAULT '' NOT NULL,
	`version` text DEFAULT 'browser prototype' NOT NULL,
	`media_key` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `idea_votes` (
	`id` text PRIMARY KEY NOT NULL,
	`idea_id` text NOT NULL,
	`voter` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idea_voter_unique` ON `idea_votes` (`idea_id`,`voter`);--> statement-breakpoint
CREATE TABLE `ideas` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text DEFAULT 'Player' NOT NULL,
	`category` text NOT NULL,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`status` text DEFAULT 'suggested' NOT NULL,
	`votes` integer DEFAULT 0 NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `subscribers` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`consent` integer NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `subscribers_email_unique` ON `subscribers` (`email`);--> statement-breakpoint
CREATE TABLE `testers` (
	`id` text PRIMARY KEY NOT NULL,
	`display_name` text NOT NULL,
	`email` text NOT NULL,
	`device` text DEFAULT '' NOT NULL,
	`os` text DEFAULT '' NOT NULL,
	`source` text DEFAULT '' NOT NULL,
	`consent` integer NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `testers_email_unique` ON `testers` (`email`);