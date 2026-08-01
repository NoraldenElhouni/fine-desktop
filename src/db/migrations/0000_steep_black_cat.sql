CREATE TABLE `inventory_movements` (
	`id` text PRIMARY KEY NOT NULL,
	`sku` text NOT NULL,
	`quantity_delta` real NOT NULL,
	`reason` text NOT NULL,
	`reference_id` text,
	`created_at` text NOT NULL,
	`sync_version` integer
);
--> statement-breakpoint
CREATE TABLE `outbox` (
	`id` text PRIMARY KEY NOT NULL,
	`table_name` text NOT NULL,
	`operation` text NOT NULL,
	`payload` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `sync_state` (
	`id` integer PRIMARY KEY NOT NULL,
	`last_pulled_version` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE `work_orders` (
	`id` text PRIMARY KEY NOT NULL,
	`product_sku` text NOT NULL,
	`quantity` real NOT NULL,
	`status` text NOT NULL,
	`created_at` text NOT NULL,
	`sync_version` integer
);
