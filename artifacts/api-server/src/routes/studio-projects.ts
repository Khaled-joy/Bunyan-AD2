import { Router, type IRouter } from "express";
import { desc, eq } from "drizzle-orm";
import { db, studioOrders, studioProjects } from "@workspace/db";
import {
  CreateStudioProjectBody,
  CreateStudioProjectResponse,
  DeleteStudioProjectParams,
  GetStudioProjectParams,
  GetStudioProjectResponse,
  ListStudioProjectsResponse,
  ListStudioOrdersResponse,
  UpdateStudioProjectBody,
  UpdateStudioProjectParams,
  UpdateStudioProjectResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();
const SEEDED_ORDERS = [
  {
    id: "ad-municipality-clean-streets",
    requestingBody: "Abu Dhabi City Municipality",
    title: "Clean streets, shared responsibility",
    domain: "civic-life",
    ageGroup: "9-12" as const,
    behaviours: ["responsibility", "participation"],
    dueDate: "2026-11-15",
    description: "Create a city-street game where children identify misplaced waste, choose the right container, and see how individual actions improve a shared public space.",
    language: "both" as const,
    buildWeeks: 8,
    artWeeks: 5,
    productionNeeds: ["characterArt", "mapArt", "objectArt", "arabicCopy", "englishCopy", "accessibilityPass"],
  },
  {
    id: "doh-active-day",
    requestingBody: "Department of Health – Abu Dhabi",
    title: "Build a balanced active day",
    domain: "health-wellbeing",
    ageGroup: "6-8" as const,
    behaviours: ["responsibility", "problemSolving"],
    dueDate: "2026-12-03",
    description: "Create a home-and-school game where children make choices about movement, rest, hydration, and food across a typical day.",
    language: "both" as const,
    buildWeeks: 7,
    artWeeks: 6,
    productionNeeds: ["characterArt", "mapArt", "objectArt", "voiceOver", "musicSound", "arabicCopy", "englishCopy"],
  },
  {
    id: "culture-heritage-host",
    requestingBody: "Department of Culture and Tourism – Abu Dhabi",
    title: "Welcome guests to the majlis",
    domain: "heritage-culture",
    ageGroup: "13-17" as const,
    behaviours: ["respect", "courage", "participation"],
    dueDate: "2027-01-20",
    description: "Create a majlis scenario where players welcome guests, interpret social cues, choose respectful actions, and recover thoughtfully from mistakes.",
    language: "ar" as const,
    buildWeeks: 10,
    artWeeks: 8,
    productionNeeds: ["characterArt", "mapArt", "voiceOver", "arabicCopy", "motionAnimation", "accessibilityPass"],
  },
];

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

router.get("/studio/orders", async (_req, res): Promise<void> => {
  await db.insert(studioOrders).values(SEEDED_ORDERS).onConflictDoNothing();
  const orders = await db.select().from(studioOrders).orderBy(studioOrders.dueDate);
  res.json(ListStudioOrdersResponse.parse(orders));
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
