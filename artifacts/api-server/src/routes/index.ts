import { Router, type IRouter } from "express";
import healthRouter from "./health";
import adminAuthRouter from "./admin-auth";
import analyticsRouter from "./analytics";
import telemetryRouter from "./telemetry";
import analysisWorkbenchRouter from "./analysis-workbench";
import playerRouter from "./player";
import studioProjectsRouter from "./studio-projects";
import gameRequestsRouter from "./game-requests";

const router: IRouter = Router();

router.use(healthRouter);
router.use(adminAuthRouter);
router.use(analyticsRouter);
router.use(telemetryRouter);
router.use(analysisWorkbenchRouter);
router.use(playerRouter);
router.use(studioProjectsRouter);
router.use(gameRequestsRouter);

export default router;
