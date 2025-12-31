import { eq, desc, and } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, 
  users, 
  projects, 
  InsertProject,
  videoFiles,
  InsertVideoFile,
  editHistory,
  InsertEditHistory,
  aiAnalysis,
  InsertAiAnalysis,
  ttsAudio,
  InsertTtsAudio
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Project queries
export async function createProject(project: InsertProject) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(projects).values(project);
  return result;
}

export async function getProjectsByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(projects).where(eq(projects.userId, userId)).orderBy(desc(projects.updatedAt));
}

export async function getProjectById(projectId: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(projects).where(eq(projects.id, projectId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateProject(projectId: number, updates: Partial<InsertProject>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.update(projects).set(updates).where(eq(projects.id, projectId));
}

export async function deleteProject(projectId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.delete(projects).where(eq(projects.id, projectId));
}

// Video file queries
export async function createVideoFile(videoFile: InsertVideoFile) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(videoFiles).values(videoFile);
  return result;
}

export async function getVideoFilesByProjectId(projectId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(videoFiles).where(eq(videoFiles.projectId, projectId)).orderBy(desc(videoFiles.createdAt));
}

export async function getVideoFileById(fileId: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(videoFiles).where(eq(videoFiles.id, fileId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// Edit history queries
export async function createEditHistory(history: InsertEditHistory) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(editHistory).values(history);
  return result;
}

export async function getEditHistoryByProjectId(projectId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(editHistory).where(eq(editHistory.projectId, projectId)).orderBy(desc(editHistory.version));
}

export async function getLatestEditHistory(projectId: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(editHistory).where(eq(editHistory.projectId, projectId)).orderBy(desc(editHistory.version)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// AI analysis queries
export async function createAiAnalysis(analysis: InsertAiAnalysis) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(aiAnalysis).values(analysis);
  return result;
}

export async function getAiAnalysisByProjectId(projectId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(aiAnalysis).where(eq(aiAnalysis.projectId, projectId)).orderBy(desc(aiAnalysis.createdAt));
}

export async function getAiAnalysisByType(projectId: number, analysisType: string) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(aiAnalysis)
    .where(and(eq(aiAnalysis.projectId, projectId), eq(aiAnalysis.analysisType, analysisType as any)))
    .orderBy(desc(aiAnalysis.createdAt));
}

// TTS audio queries
export async function createTtsAudio(audio: InsertTtsAudio) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(ttsAudio).values(audio);
  return result;
}

export async function getTtsAudioByProjectId(projectId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(ttsAudio).where(eq(ttsAudio.projectId, projectId)).orderBy(desc(ttsAudio.createdAt));
}
