import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { storagePut, storageGet } from "./storage";
import { nanoid } from "nanoid";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  projects: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return await db.getProjectsByUserId(ctx.user.id);
    }),

    get: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input, ctx }) => {
        const project = await db.getProjectById(input.id);
        if (!project || project.userId !== ctx.user.id) {
          throw new Error("Project not found");
        }
        return project;
      }),

    create: protectedProcedure
      .input(z.object({
        title: z.string().min(1),
        description: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const result = await db.createProject({
          userId: ctx.user.id,
          title: input.title,
          description: input.description,
          status: "draft",
        });
        return { success: true, projectId: Number(result[0].insertId) };
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        title: z.string().optional(),
        description: z.string().optional(),
        thumbnailUrl: z.string().optional(),
        status: z.enum(["draft", "processing", "completed", "failed"]).optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const project = await db.getProjectById(input.id);
        if (!project || project.userId !== ctx.user.id) {
          throw new Error("Project not found");
        }

        const { id, ...updates } = input;
        await db.updateProject(id, updates);
        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const project = await db.getProjectById(input.id);
        if (!project || project.userId !== ctx.user.id) {
          throw new Error("Project not found");
        }

        await db.deleteProject(input.id);
        return { success: true };
      }),
  }),

  videoFiles: router({
    list: protectedProcedure
      .input(z.object({ projectId: z.number() }))
      .query(async ({ input, ctx }) => {
        const project = await db.getProjectById(input.projectId);
        if (!project || project.userId !== ctx.user.id) {
          throw new Error("Project not found");
        }
        return await db.getVideoFilesByProjectId(input.projectId);
      }),

    get: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await db.getVideoFileById(input.id);
      }),

    getUploadUrl: protectedProcedure
      .input(z.object({
        projectId: z.number(),
        fileName: z.string(),
        fileSize: z.number(),
        mimeType: z.string(),
      }))
      .mutation(async ({ input, ctx }) => {
        const project = await db.getProjectById(input.projectId);
        if (!project || project.userId !== ctx.user.id) {
          throw new Error("Project not found");
        }

        // Generate unique file key
        const fileExtension = input.fileName.split('.').pop();
        const fileKey = `projects/${input.projectId}/videos/${nanoid()}.${fileExtension}`;
        
        // Return file key for client-side upload via storagePut
        return {
          fileKey,
          message: "Use this fileKey to upload via client",
        };
      }),

    uploadToStorage: protectedProcedure
      .input(z.object({
        projectId: z.number(),
        fileKey: z.string(),
        fileData: z.string(), // base64 encoded
        fileName: z.string(),
        fileSize: z.number(),
        mimeType: z.string(),
        duration: z.number().optional(),
        width: z.number().optional(),
        height: z.number().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const project = await db.getProjectById(input.projectId);
        if (!project || project.userId !== ctx.user.id) {
          throw new Error("Project not found");
        }

        // Decode base64 and upload to S3
        const buffer = Buffer.from(input.fileData, 'base64');
        const { url: fileUrl } = await storagePut(input.fileKey, buffer, input.mimeType);

        // Save video file metadata
        await db.createVideoFile({
          projectId: input.projectId,
          fileKey: input.fileKey,
          fileUrl,
          fileName: input.fileName,
          fileSize: input.fileSize,
          mimeType: input.mimeType,
          duration: input.duration,
          width: input.width,
          height: input.height,
          fileType: "original",
        });

        return { success: true, fileUrl };
      }),

    uploadChunk: protectedProcedure
      .input(z.object({
        projectId: z.number(),
        uploadId: z.string(),
        chunkIndex: z.number(),
        chunkData: z.string(), // base64 encoded chunk
        totalChunks: z.number(),
      }))
      .mutation(async ({ input, ctx }) => {
        const project = await db.getProjectById(input.projectId);
        if (!project || project.userId !== ctx.user.id) {
          throw new Error("Project not found");
        }

        // Store chunk temporarily
        const chunkKey = `temp/${input.uploadId}/chunk_${input.chunkIndex}`;
        const buffer = Buffer.from(input.chunkData, 'base64');
        await storagePut(chunkKey, buffer, "application/octet-stream");

        return { 
          success: true, 
          chunkIndex: input.chunkIndex,
          uploadId: input.uploadId,
        };
      }),

    finalizeUpload: protectedProcedure
      .input(z.object({
        projectId: z.number(),
        uploadId: z.string(),
        fileKey: z.string(),
        fileName: z.string(),
        fileSize: z.number(),
        mimeType: z.string(),
        totalChunks: z.number(),
        duration: z.number().optional(),
        width: z.number().optional(),
        height: z.number().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const project = await db.getProjectById(input.projectId);
        if (!project || project.userId !== ctx.user.id) {
          throw new Error("Project not found");
        }

        // Download all chunks and merge
        const chunks: Buffer[] = [];
        for (let i = 0; i < input.totalChunks; i++) {
          const chunkKey = `temp/${input.uploadId}/chunk_${i}`;
          const { url: chunkUrl } = await storageGet(chunkKey);
          const response = await fetch(chunkUrl);
          const arrayBuffer = await response.arrayBuffer();
          chunks.push(Buffer.from(arrayBuffer));
        }

        // Merge chunks
        const mergedBuffer = Buffer.concat(chunks);

        // Upload merged file to S3
        const { url: fileUrl } = await storagePut(input.fileKey, mergedBuffer, input.mimeType);

        // Clean up temporary chunks (optional - can be done async)
        // Note: In production, implement a cleanup job

        // Save video file metadata
        await db.createVideoFile({
          projectId: input.projectId,
          fileKey: input.fileKey,
          fileUrl,
          fileName: input.fileName,
          fileSize: input.fileSize,
          mimeType: input.mimeType,
          duration: input.duration,
          width: input.width,
          height: input.height,
          fileType: "original",
        });

        return { success: true, fileUrl };
      }),

    upload: protectedProcedure
      .input(z.object({
        projectId: z.number(),
        fileName: z.string(),
        fileSize: z.number(),
        mimeType: z.string(),
        fileKey: z.string(),
        fileUrl: z.string(),
        duration: z.number().optional(),
        width: z.number().optional(),
        height: z.number().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const project = await db.getProjectById(input.projectId);
        if (!project || project.userId !== ctx.user.id) {
          throw new Error("Project not found");
        }

        await db.createVideoFile({
          projectId: input.projectId,
          fileKey: input.fileKey,
          fileUrl: input.fileUrl,
          fileName: input.fileName,
          fileSize: input.fileSize,
          mimeType: input.mimeType,
          duration: input.duration,
          width: input.width,
          height: input.height,
          fileType: "original",
        });

        return { success: true };
      }),
  }),

  aiAnalysis: router({
    list: protectedProcedure
      .input(z.object({ projectId: z.number() }))
      .query(async ({ input, ctx }) => {
        const project = await db.getProjectById(input.projectId);
        if (!project || project.userId !== ctx.user.id) {
          throw new Error("Project not found");
        }
        return await db.getAiAnalysisByProjectId(input.projectId);
      }),

    analyze: protectedProcedure
      .input(z.object({
        projectId: z.number(),
        videoFileId: z.number(),
        prompt: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const project = await db.getProjectById(input.projectId);
        if (!project || project.userId !== ctx.user.id) {
          throw new Error("Project not found");
        }

        const videoFile = await db.getVideoFileById(input.videoFileId);
        if (!videoFile) {
          throw new Error("Video file not found");
        }

        // Import LLM helper
        const { invokeLLM } = await import("./_core/llm");

        // Analyze video content using LLM with video file
        const analysisPrompt = input.prompt || `Analyze this video and provide:
1. Key scenes and timestamps for optimal cuts
2. Highlight moments that would engage viewers
3. Suggested transitions between scenes
4. Overall content summary and editing recommendations
5. Recommended thumbnail moments (with timestamps)`;

        const response = await invokeLLM({
          messages: [
            {
              role: "system",
              content: "You are an expert video editor AI. Analyze video content and provide detailed, actionable editing recommendations. Be specific with timestamps and scene descriptions."
            },
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: `Video file: ${videoFile.fileName}\nDuration: ${videoFile.duration?.toFixed(2) || 'unknown'}s\nResolution: ${videoFile.width || 'unknown'}x${videoFile.height || 'unknown'}\n\n${analysisPrompt}`
                },
                {
                  type: "file_url",
                  file_url: {
                    url: videoFile.fileUrl,
                    mime_type: "video/mp4"
                  }
                }
              ]
            }
          ],
        });

        const analysisResult = {
          recommendations: response.choices[0]?.message?.content || "No analysis available",
          videoFileId: input.videoFileId,
          timestamp: new Date().toISOString(),
        };

        // Save analysis result
        await db.createAiAnalysis({
          projectId: input.projectId,
          videoFileId: input.videoFileId,
          analysisType: "content_analysis",
          result: analysisResult,
          confidence: 0.85,
        });

        return { success: true, analysis: analysisResult };
      }),

    generateThumbnail: protectedProcedure
      .input(z.object({
        projectId: z.number(),
        videoFileId: z.number(),
        prompt: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const project = await db.getProjectById(input.projectId);
        if (!project || project.userId !== ctx.user.id) {
          throw new Error("Project not found");
        }

        const videoFile = await db.getVideoFileById(input.videoFileId);
        if (!videoFile) {
          throw new Error("Video file not found");
        }

        // Get AI analysis for this video to generate contextual thumbnail
        const analyses = await db.getAiAnalysisByProjectId(input.projectId);
        const latestAnalysis = analyses.find(a => a.videoFileId === input.videoFileId);
        
        let contextualInfo = "";
        if (latestAnalysis && latestAnalysis.result) {
          const analysisContent = typeof latestAnalysis.result === 'string' 
            ? latestAnalysis.result 
            : (latestAnalysis.result as any).recommendations || JSON.stringify(latestAnalysis.result);
          // Limit analysis content to 200 characters to avoid prompt length issues
          contextualInfo = `\n\nKey points: ${analysisContent.substring(0, 200).trim()}...`;
        }

        // Import image generation helper
        const { generateImage } = await import("./_core/imageGeneration");

        // Generate thumbnail using AI with video context
        // Keep prompt concise to avoid API errors (max ~500 chars)
        const basePrompt = `Create a bold, eye-catching YouTube thumbnail for "${project.title.substring(0, 50)}". Style: vibrant colors, professional, 16:9 ratio${contextualInfo}`;
        
        // Limit total prompt length to 600 characters
        const thumbnailPrompt = input.prompt 
          ? input.prompt.substring(0, 600) 
          : basePrompt.substring(0, 600);

        const imageResult = await generateImage({
          prompt: thumbnailPrompt,
        });
        
        if (!imageResult.url) {
          throw new Error("Failed to generate thumbnail image");
        }
        
        // Upload generated thumbnail to S3
        const response = await fetch(imageResult.url);
        const imageBuffer = Buffer.from(await response.arrayBuffer());
        const thumbnailS3Key = `projects/${input.projectId}/thumbnails/${nanoid()}.png`;
        const { url: thumbnailUrl } = await storagePut(thumbnailS3Key, imageBuffer, "image/png");
        
        // Save thumbnail info
        await db.createAiAnalysis({
          projectId: input.projectId,
          videoFileId: input.videoFileId,
          analysisType: "thumbnail_suggestion",
          result: {
            thumbnailUrl,
            prompt: thumbnailPrompt,
            originalGeneratedUrl: imageResult.url,
          },
          confidence: 0.9,
        });

        // Update project thumbnail
        await db.updateProject(input.projectId, {
          thumbnailUrl,
        });

        return { success: true, thumbnailUrl };
      }),

    create: protectedProcedure
      .input(z.object({
        projectId: z.number(),
        videoFileId: z.number(),
        analysisType: z.enum(["scene_detection", "highlight_extraction", "content_analysis", "thumbnail_suggestion"]),
        result: z.any(),
        confidence: z.number().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const project = await db.getProjectById(input.projectId);
        if (!project || project.userId !== ctx.user.id) {
          throw new Error("Project not found");
        }

        await db.createAiAnalysis({
          projectId: input.projectId,
          videoFileId: input.videoFileId,
          analysisType: input.analysisType,
          result: input.result,
          confidence: input.confidence,
        });

        return { success: true };
      }),
  }),

  tts: router({
    list: protectedProcedure
      .input(z.object({ projectId: z.number() }))
      .query(async ({ input, ctx }) => {
        const project = await db.getProjectById(input.projectId);
        if (!project || project.userId !== ctx.user.id) {
          throw new Error("Project not found");
        }
        return await db.getTtsAudioByProjectId(input.projectId);
      }),    generateTTS: protectedProcedure
      .input(z.object({
        projectId: z.number(),
        text: z.string(),
        voice: z.string().optional(),
        language: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const project = await db.getProjectById(input.projectId);
        if (!project || project.userId !== ctx.user.id) {
          throw new Error("Project not found");
        }

        // Note: TTS is handled client-side using Web Speech API
        // This endpoint just saves the metadata
        const audioKey = `projects/${input.projectId}/tts/${nanoid()}.mp3`;
        
        // Save TTS audio metadata (audio will be generated client-side)
        await db.createTtsAudio({
          projectId: input.projectId,
          text: input.text,
          voice: input.voice || "default",
          fileKey: audioKey,
          fileUrl: "", // Will be updated after client-side generation
          duration: 0, // Will be updated after generation
        });

        return { 
          success: true, 
          message: "TTS metadata saved. Generate audio client-side using Web Speech API.",
          audioKey 
        };
      }),
  }),

  editHistory: router({
    list: protectedProcedure
      .input(z.object({ projectId: z.number() }))
      .query(async ({ input, ctx }) => {
        const project = await db.getProjectById(input.projectId);
        if (!project || project.userId !== ctx.user.id) {
          throw new Error("Project not found");
        }
        return await db.getEditHistoryByProjectId(input.projectId);
      }),

    latest: protectedProcedure
      .input(z.object({ projectId: z.number() }))
      .query(async ({ input, ctx }) => {
        const project = await db.getProjectById(input.projectId);
        if (!project || project.userId !== ctx.user.id) {
          throw new Error("Project not found");
        }
        return await db.getLatestEditHistory(input.projectId);
      }),

    save: protectedProcedure
      .input(z.object({
        projectId: z.number(),
        timelineData: z.any(),
        description: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const project = await db.getProjectById(input.projectId);
        if (!project || project.userId !== ctx.user.id) {
          throw new Error("Project not found");
        }

        const history = await db.getEditHistoryByProjectId(input.projectId);
        const nextVersion = history.length > 0 ? Math.max(...history.map(h => h.version)) + 1 : 1;

        await db.createEditHistory({
          projectId: input.projectId,
          version: nextVersion,
          timelineData: input.timelineData,
          description: input.description,
        });

        return { success: true, version: nextVersion };
      }),
  }),
});

export type AppRouter = typeof appRouter;
