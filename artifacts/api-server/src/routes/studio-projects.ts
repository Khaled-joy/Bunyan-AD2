import { Router, type IRouter } from "express";
import { desc, eq } from "drizzle-orm";
import { db, studioProjects } from "@workspace/db";
import {
  CreateStudioProjectBody,
  CreateStudioProjectResponse,
  DeleteStudioProjectParams,
  GetStudioProjectParams,
  GetStudioProjectResponse,
  ListStudioProjectsResponse,
  UpdateStudioProjectBody,
  UpdateStudioProjectParams,
  UpdateStudioProjectResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/studio/projects", async (_req, res): Promise<void> => {
  const projects = await db.select().from(studioProjects).orderBy(desc(studioProjects.updatedAt));
  res.json(ListStudioProjectsResponse.parse(projects));
});

router.post("/studio/projects", async (req, res): Promise<void> => {
  const body = CreateStudioProjectBody.safeParse(req.body);
  if (!body.success) {
    req.log.warn({ validation: body.error.flatten() }, "Invalid Studio project");
    res.status(400).json({ error: "Invalid project data" });
    return;
  }

  const [project] = await db.insert(studioProjects).values(body.data).returning();
  res.status(201).json(CreateStudioProjectResponse.parse(project));
});

router.get("/studio/projects/:id", async (req, res): Promise<void> => {
  const params = GetStudioProjectParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: "Invalid project id" });
    return;
  }

  const [project] = await db.select().from(studioProjects).where(eq(studioProjects.id, params.data.id)).limit(1);
  if (!project) {
    res.status(404).json({ error: "Project not found" });
    return;
  }
  res.json(GetStudioProjectResponse.parse(project));
});

router.put("/studio/projects/:id", async (req, res): Promise<void> => {
  const params = UpdateStudioProjectParams.safeParse(req.params);
  const body = UpdateStudioProjectBody.safeParse(req.body);
  if (!params.success || !body.success) {
    res.status(400).json({ error: "Invalid project data" });
    return;
  }

  const [project] = await db
    .update(studioProjects)
    .set({ ...body.data, updatedAt: new Date() })
    .where(eq(studioProjects.id, params.data.id))
    .returning();
  if (!project) {
    res.status(404).json({ error: "Project not found" });
    return;
  }
  res.json(UpdateStudioProjectResponse.parse(project));
});

router.delete("/studio/projects/:id", async (req, res): Promise<void> => {
  const params = DeleteStudioProjectParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: "Invalid project id" });
    return;
  }

  const [deleted] = await db.delete(studioProjects).where(eq(studioProjects.id, params.data.id)).returning({ id: studioProjects.id });
  if (!deleted) {
    res.status(404).json({ error: "Project not found" });
    return;
  }
  res.status(204).send();
});

export default router;
