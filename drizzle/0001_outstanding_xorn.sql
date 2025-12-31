CREATE TABLE `ai_analysis` (
	`id` int AUTO_INCREMENT NOT NULL,
	`projectId` int NOT NULL,
	`videoFileId` int NOT NULL,
	`analysisType` enum('scene_detection','highlight_extraction','content_analysis','thumbnail_suggestion') NOT NULL,
	`result` json NOT NULL,
	`confidence` float,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `ai_analysis_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `edit_history` (
	`id` int AUTO_INCREMENT NOT NULL,
	`projectId` int NOT NULL,
	`version` int NOT NULL,
	`timelineData` json NOT NULL,
	`description` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `edit_history_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `projects` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`thumbnailUrl` text,
	`status` enum('draft','processing','completed','failed') NOT NULL DEFAULT 'draft',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `projects_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `tts_audio` (
	`id` int AUTO_INCREMENT NOT NULL,
	`projectId` int NOT NULL,
	`text` text NOT NULL,
	`voice` varchar(100) NOT NULL,
	`fileKey` varchar(512) NOT NULL,
	`fileUrl` text NOT NULL,
	`duration` float,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `tts_audio_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `video_files` (
	`id` int AUTO_INCREMENT NOT NULL,
	`projectId` int NOT NULL,
	`fileKey` varchar(512) NOT NULL,
	`fileUrl` text NOT NULL,
	`fileName` varchar(255) NOT NULL,
	`fileSize` int NOT NULL,
	`mimeType` varchar(100) NOT NULL,
	`duration` float,
	`width` int,
	`height` int,
	`fileType` enum('original','edited','thumbnail') NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `video_files_id` PRIMARY KEY(`id`)
);
