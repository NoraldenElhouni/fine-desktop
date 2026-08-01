CREATE TABLE `__new_sync_state` (
	`id` integer PRIMARY KEY NOT NULL,
	`last_pulled_version` text
);
--> statement-breakpoint
INSERT INTO `__new_sync_state`(`id`) SELECT `id` FROM `sync_state`;
--> statement-breakpoint
DROP TABLE `sync_state`;
--> statement-breakpoint
ALTER TABLE `__new_sync_state` RENAME TO `sync_state`;
