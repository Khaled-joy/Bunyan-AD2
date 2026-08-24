import { Router, type IRouter } from "express";
import healthRouter from "./health";
import adminAuthRouter from "./admin-auth";
import analyticsRouter from "./analytics";
import telemetryRouter from "./telemetry";

const router: IRouter = Router();

router.use(healthRouter);
router.use(adminAuthRouter);
router.use(analyticsRouter);
router.use(telemetryRouter);

export default router;
