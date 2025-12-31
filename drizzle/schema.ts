import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, json, boolean, float } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Video editing projects table
 */
export const projects = mysqlTable("projects", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  thumbnailUrl: text("thumbnailUrl"),
  status: mysqlEnum("status", ["draft", "processing", "completed", "failed"]).default("draft").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Project = typeof projects.$inferSelect;
export type InsertProject = typeof projects.$inferInsert;

/**
 * Video files metadata table (original uploads and rendered outputs)
 */
export const videoFiles = mysqlTable("video_files", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("projectId").notNull(),
  fileKey: varchar("fileKey", { length: 512 }).notNull(),
  fileUrl: text("fileUrl").notNull(),
  fileName: varchar("fileName", { length: 255 }).notNull(),
  fileSize: int("fileSize").notNull(), // in bytes
  mimeType: varchar("mimeType", { length: 100 }).notNull(),
  duration: float("duration"), // in seconds
  width: int("width"),
  height: int("height"),
  fileType: mysqlEnum("fileType", ["original", "edited", "thumbnail"]).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type VideoFile = typeof videoFiles.$inferSelect;
export type InsertVideoFile = typeof videoFiles.$inferInsert;

/**
 * Edit history and timeline data
 */
export const editHistory = mysqlTable("edit_history", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("projectId").notNull(),
  version: int("version").notNull(),
  timelineData: json("timelineData").notNull(), // stores timeline state as JSON
  description: text("description"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type EditHistory = typeof editHistory.$inferSelect;
export type InsertEditHistory = typeof editHistory.$inferInsert;

/**
 * AI analysis results and recommendations
 */
export const aiAnalysis = mysqlTable("ai_analysis", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("projectId").notNull(),
  videoFileId: int("videoFileId").notNull(),
  analysisType: mysqlEnum("analysisType", ["scene_detection", "highlight_extraction", "content_analysis", "thumbnail_suggestion"]).notNull(),
  result: json("result").notNull(), // stores AI analysis results as JSON
  confidence: float("confidence"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AiAnalysis = typeof aiAnalysis.$inferSelect;
export type InsertAiAnalysis = typeof aiAnalysis.$inferInsert;

/**
 * TTS audio files
 */
export const ttsAudio = mysqlTable("tts_audio", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("projectId").notNull(),
  text: text("text").notNull(),
  voice: varchar("voice", { length: 100 }).notNull(),
  fileKey: varchar("fileKey", { length: 512 }).notNull(),
  fileUrl: text("fileUrl").notNull(),
  duration: float("duration"), // in seconds
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type TtsAudio = typeof ttsAudio.$inferSelect;
export type InsertTtsAudio = typeof ttsAudio.$inferInsert;
