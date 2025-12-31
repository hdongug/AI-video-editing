import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(userId: number = 1): { ctx: TrpcContext } {
  const user: AuthenticatedUser = {
    id: userId,
    openId: "test-user",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };

  return { ctx };
}

describe("projects", () => {
  it("should create a project and return project ID", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.projects.create({
      title: "Test Video Project",
      description: "A test project for video editing",
    });

    expect(result).toHaveProperty("success", true);
    expect(result).toHaveProperty("projectId");
    expect(typeof result.projectId).toBe("number");
  });

  it("should list user projects", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Create a project first
    await caller.projects.create({
      title: "Test Project 1",
      description: "First test project",
    });

    // List projects
    const projects = await caller.projects.list();

    expect(Array.isArray(projects)).toBe(true);
    expect(projects.length).toBeGreaterThan(0);
    expect(projects[0]).toHaveProperty("title");
    expect(projects[0]).toHaveProperty("userId");
  });

  it("should update project status", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Create a project
    const createResult = await caller.projects.create({
      title: "Test Project for Update",
      description: "Will be updated",
    });

    // Update the project
    const updateResult = await caller.projects.update({
      id: createResult.projectId,
      status: "completed",
    });

    expect(updateResult).toHaveProperty("success", true);

    // Verify the update
    const project = await caller.projects.get({ id: createResult.projectId });
    expect(project.status).toBe("completed");
  });

  it("should not allow access to other user's projects", async () => {
    const { ctx: ctx1 } = createAuthContext(1);
    const { ctx: ctx2 } = createAuthContext(2);
    
    const caller1 = appRouter.createCaller(ctx1);
    const caller2 = appRouter.createCaller(ctx2);

    // User 1 creates a project
    const createResult = await caller1.projects.create({
      title: "User 1 Project",
      description: "Private project",
    });

    // User 2 tries to access User 1's project
    await expect(
      caller2.projects.get({ id: createResult.projectId })
    ).rejects.toThrow("Project not found");
  });
});
